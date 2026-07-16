const mongoose = require("mongoose");

// ==========================================
// Reminder Schema
// ==========================================

const reminderSchema = new mongoose.Schema(
  {
    // ==========================================
    // Core Information
    // ==========================================

    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recipientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["manual", "automatic"],
      required: true,
      default: "manual",
    },

    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      required: true,
      default: "pending",
    },

    sentAt: {
      type: Date,
    },

    error: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// Indexes for efficient queries
// ==========================================

reminderSchema.index({ userId: 1, createdAt: -1 });
reminderSchema.index({ invoiceId: 1, createdAt: -1 });
reminderSchema.index({ status: 1, createdAt: -1 });
reminderSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model("Reminder", reminderSchema);
