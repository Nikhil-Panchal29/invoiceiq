const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const Invoice = require("../models/Invoice");

// ==========================================
// Upload Invoice
// ==========================================

const uploadInvoice = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse("Please upload a file", 400));
  }

  const fileType =
    req.file.mimetype === "application/pdf" ? "pdf" : "image";

  const invoice = await Invoice.create({
    userId: req.user.id,
    fileUrl: req.file.path.replace(/\\/g, "/"),
    fileName: req.file.originalname,
    fileType,
  });

  res.status(201).json({
    success: true,
    message: "Invoice uploaded successfully. AI processing will begin shortly.",
    data: invoice,
  });
});

// ==========================================
// Get All Invoices
// ==========================================

const getInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({
    userId: req.user.id,
  }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: invoices.length,
    data: invoices,
  });
});

// ==========================================
// Get Single Invoice
// ==========================================

const getInvoice = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!invoice) {
    return next(new ErrorResponse("Invoice not found", 404));
  }

  res.status(200).json({
    success: true,
    data: invoice,
  });
});

// ==========================================
// Update Invoice Status
// ==========================================

const updateInvoiceStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const allowedStatus = [
    "pending",
    "extracted",
    "reviewed",
    "sent",
    "paid",
    "overdue",
  ];

  if (!allowedStatus.includes(status)) {
    return next(new ErrorResponse("Invalid invoice status", 400));
  }

  const invoice = await Invoice.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user.id,
    },
    {
      status,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!invoice) {
    return next(new ErrorResponse("Invoice not found", 404));
  }

  res.status(200).json({
    success: true,
    data: invoice,
  });
});

module.exports = {
  uploadInvoice,
  getInvoices,
  getInvoice,
  updateInvoiceStatus,
};