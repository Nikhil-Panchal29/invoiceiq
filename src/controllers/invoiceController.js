const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const Invoice = require('../models/Invoice');
const { extractTextFromFile } = require('../services/ocrService');
const { parseInvoice } = require('../services/invoiceParser');
const { categorizeInvoice } = require('../services/categoryService');

// ==========================================
// Upload Invoice
// Triggers OCR → Parse → Categorize pipeline
// ==========================================

const uploadInvoice = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const fileType =
    req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';

  // Step 1: Create invoice document immediately with status pending
  const invoice = await Invoice.create({
    userId:   req.user.id,
    fileUrl:  req.file.path.replace(/\\/g, '/'),
    fileName: req.file.originalname,
    fileType,
    status:   'pending',
  });

  // Step 2: Run OCR + Parse + Categorize asynchronously
  // We do NOT await this — respond to client immediately
  // then update the document in background
  runAIPipeline(invoice, req.file).catch((err) => {
    console.error(`AI pipeline failed for invoice ${invoice._id}: ${err.message}`);
  });

  res.status(201).json({
    success: true,
    message:
      'Invoice uploaded successfully. AI extraction is running in the background.',
    data: invoice,
  });
});

// ==========================================
// AI Pipeline (runs after upload response)
// ==========================================

const runAIPipeline = async (invoice, file) => {
  try {
    // ── OCR ────────────────────────────────────────
    const ocrResult = await extractTextFromFile(file.path, file.mimetype);
    const rawText = ocrResult.rawText;

    // ── Parse ────────────────────────────────────────
    const parsed = parseInvoice(rawText);

    // ── Categorize ───────────────────────────────────
    const { category, confidence } = categorizeInvoice(
      rawText,
      parsed.vendorName,
      parsed.lineItems
    );

    // ── Persist results ──────────────────────────────
    await Invoice.findByIdAndUpdate(invoice._id, {
      ocrRawText: rawText,
      status: ocrResult.success ? 'extracted' : 'pending',
      extractedData: {
        vendorName:    parsed.vendorName,
        invoiceNumber: parsed.invoiceNumber,
        totalAmount:   parsed.totalAmount,
        currency:      parsed.currency,
        invoiceDate:   parsed.invoiceDate,
        dueDate:       parsed.dueDate,
        lineItems:     parsed.lineItems,
      },
      'aiInsights.category':           category,
      'aiInsights.categoryConfidence': confidence,
    });
  } catch (err) {
    // Mark as pending if pipeline fails — do not crash
    await Invoice.findByIdAndUpdate(invoice._id, {
      status: 'pending',
      ocrRawText: '',
    }).catch(() => {});
    throw err;
  }
};

// ==========================================
// Process Invoice Manually
// Allows re-triggering OCR on an existing invoice
// ==========================================

const processInvoice = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!invoice) {
    return next(new ErrorResponse('Invoice not found', 404));
  }

  if (!invoice.fileUrl) {
    return next(new ErrorResponse('No file associated with this invoice', 400));
  }

  // Determine mimetype from fileType field
  const mimetype =
    invoice.fileType === 'pdf' ? 'application/pdf' : 'image/jpeg';

  // OCR
  const ocrResult = await extractTextFromFile(invoice.fileUrl, mimetype);
  const rawText = ocrResult.rawText;

  // Parse
  const parsed = parseInvoice(rawText);

  // Categorize
  const { category, confidence } = categorizeInvoice(
    rawText,
    parsed.vendorName,
    parsed.lineItems
  );

  // Update
  const updated = await Invoice.findByIdAndUpdate(
    invoice._id,
    {
      ocrRawText: rawText,
      status: ocrResult.success ? 'extracted' : 'pending',
      extractedData: {
        vendorName:    parsed.vendorName,
        invoiceNumber: parsed.invoiceNumber,
        totalAmount:   parsed.totalAmount,
        currency:      parsed.currency,
        invoiceDate:   parsed.invoiceDate,
        dueDate:       parsed.dueDate,
        lineItems:     parsed.lineItems,
      },
      'aiInsights.category':           category,
      'aiInsights.categoryConfidence': confidence,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Invoice processed successfully.',
    data: updated,
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
    return next(new ErrorResponse('Invoice not found', 404));
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
    'pending',
    'extracted',
    'reviewed',
    'sent',
    'paid',
    'overdue',
  ];

  if (!allowedStatus.includes(status)) {
    return next(new ErrorResponse('Invalid invoice status', 400));
  }

  const invoice = await Invoice.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user.id,
    },
    { status },
    { new: true, runValidators: true }
  );

  if (!invoice) {
    return next(new ErrorResponse('Invoice not found', 404));
  }

  res.status(200).json({
    success: true,
    data: invoice,
  });
});

module.exports = {
  uploadInvoice,
  processInvoice,
  getInvoices,
  getInvoice,
  updateInvoiceStatus,
};
