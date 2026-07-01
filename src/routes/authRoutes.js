const express = require("express");

const {
  register,
  login,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// Authentication Routes
// ==========================================

// Register User
router.post("/register", register);

// Login User
router.post("/login", login);

// Get Logged In User (Protected)
router.get("/me", protect, getMe);

module.exports = router;