
const express = require("express");
const router = express.Router();

const { getAllCustomers } = require("../controllers/userController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// Admin: Get all registered customers
router.get("/admin/customers", protect, adminOnly, getAllCustomers);

module.exports = router;
