
const Order = require("../models/Order");
const Product = require("../models/Product");
const razorpay = require("../config/razorpay");
const mongoose = require("mongoose");
const crypto = require("crypto");

// Place a new order

const createOrder = async (req, res) => {
  const reservedItems = [];
  let order = null;

  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (paymentMethod === "Online") {
      return res.status(400).json({
        message: "Please use the Razorpay payment route for online orders",
      });
    }

    if (!Array.isArray(items) || items.length === 0 || !shippingAddress) {
      return res.status(400).json({
        message: "Order items and shipping address are required",
      });
    }

    // Validate shipping address
    const requiredFields = [
      "fullName",
      "phone",
      "address",
      "city",
      "state",
      "postalCode",
    ];

    for (const field of requiredFields) {
      if (
        typeof shippingAddress[field] !== "string" ||
        !shippingAddress[field].trim()
      ) {
        return res.status(400).json({
          message: `${field} is required`,
        });
      }
    }

    // Validate and combine duplicate product IDs
    const quantities = new Map();

    for (const item of items) {
      if (
        !item.product ||
        typeof item.product !== "string" ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          message: "Invalid product or quantity",
        });
      }

      quantities.set(
        item.product,
        (quantities.get(item.product) || 0) + item.quantity
      );
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const [productId, quantity] of quantities) {
      const product = await Product.findById(productId);

      if (!product) {
        throw new Error("A product in your cart was not found");
      }

      // Atomically reserve stock only if enough is available
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: productId,
          stock: { $gte: quantity },
        },
        {
          $inc: { stock: -quantity },
        },
        { new: true }
      );

      if (!updatedProduct) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      reservedItems.push({
        product: productId,
        quantity,
      });

      orderItems.push({
        product: updatedProduct._id,
        name: updatedProduct.name,
        image: updatedProduct.image,
        quantity,
        price: updatedProduct.price,
      });

      totalAmount += updatedProduct.price * quantity;
    }

    // Create order after reserving stock
    order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod === "Online" ? "Online" : "COD",
    });

    return res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    // Restore reserved stock if order creation fails
    for (const item of reservedItems) {
      try {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      } catch (rollbackError) {
        console.error("Stock rollback failed:", rollbackError.message);
      }
    }

    if (order) {
      try {
        await Order.findByIdAndDelete(order._id);
      } catch (deleteError) {
        console.error("Order cleanup failed:", deleteError.message);
      }
    }

    console.error("Create order error:", error.message);

    const status = error.message.includes("not found")
      ? 404
      : error.message.includes("Insufficient stock")
        ? 400
        : 500;

    return res.status(status).json({
      message: error.message || "Unable to place order",
    });
  }
};


// Create Razorpay order
const createRazorpayOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!Array.isArray(items) || items.length === 0 || !shippingAddress) {
      return res.status(400).json({
        message: "Order items and shipping address are required",
      });
    }

    const requiredFields = [
      "fullName",
      "phone",
      "address",
      "city",
      "state",
      "postalCode",
    ];

    for (const field of requiredFields) {
      if (
        typeof shippingAddress[field] !== "string" ||
        !shippingAddress[field].trim()
      ) {
        return res.status(400).json({
          message: `${field} is required`,
        });
      }
    }

    const quantities = new Map();

    for (const item of items) {
      if (
        !item.product ||
        !mongoose.Types.ObjectId.isValid(item.product) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          message: "Invalid product or quantity",
        });
      }

      quantities.set(
        item.product,
        (quantities.get(item.product) || 0) + item.quantity
      );
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const [productId, quantity] of quantities) {
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          message: "A product in your cart was not found",
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        quantity,
        price: product.price,
      });

      totalAmount += product.price * quantity;
    }

    // Razorpay accepts amounts in paise
    const amountInPaise = Math.round(totalAmount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `shopnest_${Date.now()}`,
    });

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod: "Online",
      paymentStatus: "Pending",
      razorpayOrderId: razorpayOrder.id,
    });

    res.status(201).json({
      message: "Payment order created",
      shopnestOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error.message);

    res.status(500).json({
      message: "Unable to create payment order",
    });
  }
};


// Verify Razorpay payment
const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      shopnestOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !shopnestOrderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Payment verification details are required",
      });
    }

    const order = await Order.findOne({
      _id: shopnestOrderId,
      user: req.user._id,
      paymentMethod: "Online",
      razorpayOrderId: razorpay_order_id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Payment order not found",
      });
    }

    // Verify Razorpay signature using HMAC SHA256
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");

    const receivedBuffer = Buffer.from(razorpay_signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (
      receivedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    // Fetch payment details directly from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (
      payment.order_id !== razorpay_order_id ||
      payment.amount !== Math.round(order.totalAmount * 100) ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        message: "Payment details do not match this order",
      });
    }

    if (payment.status !== "captured") {
      return res.status(400).json({
        message: "Payment is not captured yet",
      });
    }

    // Already verified: don't deduct stock again
    if (order.paymentStatus === "Paid") {
      return res.status(200).json({
        message: "Payment already verified",
        order,
      });
    }

    // Update stock and order together in a database transaction
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const currentOrder = await Order.findOne({
          _id: shopnestOrderId,
          user: req.user._id,
          paymentStatus: "Pending",
        }).session(session);

        if (!currentOrder) {
          throw new Error("Order is no longer pending payment");
        }

        for (const item of currentOrder.items) {
          const updatedProduct = await Product.findOneAndUpdate(
            {
              _id: item.product,
              stock: { $gte: item.quantity },
            },
            {
              $inc: { stock: -item.quantity },
            },
            {
              new: true,
              session,
            }
          );

          if (!updatedProduct) {
            throw new Error(
              `Insufficient stock for ${item.name}. Please contact support.`
            );
          }
        }

        currentOrder.paymentStatus = "Paid";
        currentOrder.razorpayPaymentId = razorpay_payment_id;

        await currentOrder.save({ session });
      });
    } finally {
      await session.endSession();
    }

    const updatedOrder = await Order.findById(shopnestOrderId);

    res.status(200).json({
      message: "Payment verified successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Razorpay verification error:", error.message);

    res.status(400).json({
      message: error.message || "Payment verification failed",
    });
  }
};


const reconcileRazorpayPayment = async (req, res) => {
  try {
    const { shopnestOrderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(shopnestOrderId)) {
      return res.status(400).json({
        message: "Invalid ShopNest order ID",
      });
    }

    const order = await Order.findOne({
      _id: shopnestOrderId,
      user: req.user._id,
      paymentMethod: "Online",
    });

    if (!order) {
      return res.status(404).json({
        message: "Online order not found",
      });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(200).json({
        message: "Payment is already verified",
        order,
      });
    }

    // Retrieve payments directly from Razorpay
    const paymentResponse = await razorpay.orders.fetchPayments(
      order.razorpayOrderId
    );

    const capturedPayment = paymentResponse.items.find(
      (payment) =>
        payment.status === "captured" &&
        payment.order_id === order.razorpayOrderId &&
        payment.amount === Math.round(order.totalAmount * 100) &&
        payment.currency === "INR"
    );

    if (!capturedPayment) {
      return res.status(400).json({
        message: "No matching captured payment was found",
      });
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const currentOrder = await Order.findOne({
          _id: shopnestOrderId,
          user: req.user._id,
          paymentStatus: "Pending",
          razorpayOrderId: order.razorpayOrderId,
        }).session(session);

        if (!currentOrder) {
          throw new Error("Order is no longer pending");
        }

        for (const item of currentOrder.items) {
          const updatedProduct = await Product.findOneAndUpdate(
            {
              _id: item.product,
              stock: { $gte: item.quantity },
            },
            {
              $inc: { stock: -item.quantity },
            },
            {
              new: true,
              session,
            }
          );

          if (!updatedProduct) {
            throw new Error(
              `Insufficient stock for ${item.name}. Please contact support.`
            );
          }
        }

        currentOrder.paymentStatus = "Paid";
        currentOrder.razorpayPaymentId = capturedPayment.id;

        await currentOrder.save({ session });
      });
    } finally {
      await session.endSession();
    }

    const updatedOrder = await Order.findById(shopnestOrderId);

    return res.status(200).json({
      message: "Captured payment successfully reconciled",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Payment reconciliation error:", error.message);

    return res.status(400).json({
      message: error.message || "Payment reconciliation failed",
    });
  }
};


// Get logged-in user's orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order status updated",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  reconcileRazorpayPayment,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};