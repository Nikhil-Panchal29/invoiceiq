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
      default: 1,
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
    // ==========================================
    // Core Information
    // ==========================================

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

    // ==========================================
    // AI Extracted Data
    // ==========================================

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

      invoiceDate: {
        type: Date,
      },

      dueDate: {
        type: Date,
      },

      totalAmount: {
        type: Number,
        default: 0,
        min: 0,
      },

      subtotal: {
        type: Number,
        default: 0,
        min: 0,
      },

      taxAmount: {
        type: Number,
        default: 0,
        min: 0,
      },

      currency: {
        type: String,
        default: "INR",
      },

      gstNumber: {
        type: String,
        default: "",
        trim: true,
      },

      invoiceType: {
        type: String,
        default: "Other",
      },

      paymentTerms: {
        type: String,
        default: "",
      },

      lineItems: {
        type: [lineItemSchema],
        default: [],
      },
    },

    // ==========================================
    // AI Insights
    // ==========================================

    aiInsights: {
      category: {
        type: String,
        default: "Miscellaneous",
      },

      categoryConfidence: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      categoryReason: {
        type: String,
        default: "",
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

      // ======================================
      // AI Summary
      // ======================================

      summary: {
        type: String,
        default: "",
      },

      // ======================================
      // AI Validation
      // ======================================

      warnings: {
        type: [String],
        default: [],
      },

      validationScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      // ======================================
      // AI Risk
      // ======================================

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

      riskReason: {
        type: String,
        default: "",
      },

      // ======================================
      // AI Recommendations
      // ======================================

      recommendations: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Invoice", invoiceSchema);