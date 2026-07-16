const express = require("express");

const {
  sendManualReminder,
  getReminders,
  getReminder,
  resendReminder,
  getReminderStats,
} = require("../controllers/reminderController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// Protect All Reminder Routes
// ==========================================

router.use(protect);

// ==========================================
// Reminder Routes
// ==========================================

// Send manual reminder for specific invoice
router.post("/:invoiceId/send", sendManualReminder);

// Get all reminders with filters and pagination
router.get("/", getReminders);

// Get reminder statistics
router.get("/stats/summary", getReminderStats);

// Get single reminder details
router.get("/:id", getReminder);

// Resend a failed reminder
router.post("/:id/resend", resendReminder);

module.exports = router;
