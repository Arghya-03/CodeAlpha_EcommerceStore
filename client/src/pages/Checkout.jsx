
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, ShoppingBag } from "lucide-react";
import API from "../services/api";
import { useCart } from "../context/CartContext";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setLoading(true);

      const orderItems = cartItems.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      }));

      // Existing Cash on Delivery flow
      if (paymentMethod === "COD") {
        const { data } = await API.post("/orders", {
          items: orderItems,
          shippingAddress: formData,
          paymentMethod: "COD",
        });

        clearCart();

        navigate("/order-success", {
          state: { order: data.order || data },
        });

        return;
      }

      // Load Razorpay Checkout
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay. Please try again.");
      }

      // Create payment order on our backend
      const { data: paymentOrder } = await API.post(
        "/orders/razorpay/create-order",
        {
          items: orderItems,
          shippingAddress: formData,
        }
      );

      const options = {
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "ShopNest",
        description: "Online Shopping Payment",
        order_id: paymentOrder.razorpayOrderId,

        prefill: {
          name: formData.fullName,
          contact: formData.phone,
        },

        theme: {
          color: "#2563eb",
        },

        handler: async function (response) {
          try {
            const { data: verification } = await API.post(
              "/orders/razorpay/verify-payment",
              {
                shopnestOrderId: paymentOrder.shopnestOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            clearCart();

            navigate("/order-success", {
              state: { order: verification.order },
            });
          } catch (verificationError) {
            setError(
              verificationError.response?.data?.message ||
              "Payment verification failed. Please contact support before retrying."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (response) {
        setError(
          response.error?.description ||
          "Payment failed. Please try again."
        );
        setLoading(false);
      });

      razorpayInstance.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to place your order. Please try again."
      );
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <ShoppingBag size={45} />
        <h2>Your cart is empty</h2>
        <Link to="/products">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <main className="checkout-page">
      <h1>Checkout</h1>
      <p className="checkout-subtitle">
        Complete your shipping details to place your order.
      </p>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="checkout-section-heading">
            <MapPin size={21} />
            <h2>Shipping Address</h2>
          </div>

          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />

          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            pattern="[0-9]{10}"
            maxLength="10"
            required
          />

          <label>Full Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="House number, street, area"
            rows="3"
            required
          />

          <div className="checkout-form-row">
            <div>
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                required
              />
            </div>

            <div>
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                required
              />
            </div>
          </div>

          <label>Postal Code</label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            placeholder="6-digit PIN code"
            pattern="[0-9]{6}"
            maxLength="6"
            required
          />

          <div className="payment-method">
            <h3>Payment Method</h3>

            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Cash on Delivery (COD)</span>
            </label>
            <p>Pay when your order is delivered.</p>

            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="Online"
                checked={paymentMethod === "Online"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Online Payment (Razorpay)</span>
            </label>
            <p>Pay securely using UPI, cards or other available methods.</p>
          </div>

          {error && <p className="checkout-error">{error}</p>}

          <button
            type="submit"
            className="place-order-button"
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : paymentMethod === "COD"
                ? "Place Order"
                : "Pay Now"}
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Order Summary</h2>

          {cartItems.map((item) => (
            <div className="checkout-item" key={item._id}>
              <div>
                <h4>{item.name}</h4>
                <p>Quantity: {item.quantity}</p>
              </div>

              <strong>
                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
              </strong>
            </div>
          ))}

          <div className="checkout-total">
            <span>Total Amount</span>
            <strong>₹{cartTotal.toLocaleString("en-IN")}</strong>
          </div>

          <p className="checkout-delivery-note">
            Delivery charges, if any, will be confirmed separately.
          </p>
        </aside>
      </div>
    </main>
  );
};

export default Checkout;
