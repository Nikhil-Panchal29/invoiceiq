const mongoose = require("mongoose");

// ==========================================
// Line Item Schema
// ==========================================

const lineItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      default: "",
      trim: true,
    },

    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    unitPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

// ==========================================
// Invoice Schema
// ==========================================

const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    fileType: {
      type: String,
      enum: ["pdf", "image"],
      default: "pdf",
    },

    extractedData: {
      vendorName: {
        type: String,
        default: "",
        trim: true,
      },

      invoiceNumber: {
        type: String,
        default: "",
        trim: true,
      },

      totalAmount: {
        type: Number,
        default: 0,
        min: 0,
      },

      currency: {
        type: String,
        default: "INR",
      },

      invoiceDate: Date,

      dueDate: Date,

      lineItems: [lineItemSchema],
    },

    aiInsights: {
      category: {
        type: String,
        default: "Uncategorized",
      },

      categoryConfidence: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      riskScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      riskLevel: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: "Low",
      },

      isDuplicate: {
        type: Boolean,
        default: false,
      },

      duplicateOfId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice",
        default: null,
      },
    },

    status: {
      type: String,
      enum: [
        "pending",
        "extracted",
        "reviewed",
        "sent",
        "paid",
        "overdue",
      ],
      default: "pending",
    },

    ocrRawText: {
      type: String,
      default: "",
    },

    remindersSent: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Invoice", invoiceSchema);