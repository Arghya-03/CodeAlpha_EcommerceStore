
const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

// Register new customer
router.post("/register", registerUser);

// Login customer
router.post("/login", loginUser);

module.exports = router;
