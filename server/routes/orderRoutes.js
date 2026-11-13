
const express = require("express");
const router = express.Router();

const {
  createOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  reconcileRazorpayPayment,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// Customer routes
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);

// Razorpay payment routes
router.post(
  "/razorpay/create-order",
  protect,
  createRazorpayOrder
);

router.post(
  "/razorpay/verify-payment",
  protect,
  verifyRazorpayPayment
);

router.post(
  "/razorpay/reconcile-payment",
  protect,
  reconcileRazorpayPayment
);

// Admin routes
router.get("/admin/all", protect, adminOnly, getAllOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;
