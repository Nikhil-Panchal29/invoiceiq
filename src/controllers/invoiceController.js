const asyncHandler    = require('../utils/asyncHandler');
const ErrorResponse   = require('../utils/ErrorResponse');
const Invoice         = require('../models/Invoice');
const { extractTextFromFile } = require('../services/ocrService');
const { analyseInvoice }      = require('../services/geminiService');

// ==========================================
// Upload Invoice
// OCR → Gemini AI pipeline (background)
// ==========================================

const uploadInvoice = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';

  // Create invoice document immediately — status: pending
  const invoice = await Invoice.create({
    userId:   req.user.id,
    fileUrl:  req.file.path.replace(/\\/g, '/'),
    fileName: req.file.originalname,
    fileType,
    status:   'pending',
  });

  // Fire AI pipeline asynchronously — do not block response
  runAIPipeline(invoice, req.file).catch((err) => {
    console.error(`[AI Pipeline] Failed for invoice ${invoice._id}: ${err.message}`);
  });

  res.status(201).json({
    success: true,
    message: 'Invoice uploaded. AI analysis is running in the background.',
    data: invoice,
  });
});

// ==========================================
// AI Pipeline
// OCR → Gemini (single call) → MongoDB
// ==========================================

const runAIPipeline = async (invoice, file) => {
  try {
    // ── Step 1: OCR ───────────────────────────────────────
    const ocrResult = await extractTextFromFile(file.path, file.mimetype);

    if (!ocrResult.success || ocrResult.rawText.trim().length === 0) {
      await Invoice.findByIdAndUpdate(invoice._id, {
        ocrRawText: '',
        status: 'pending',
      });
      console.warn(`[AI Pipeline] OCR returned empty text for invoice ${invoice._id}`);
      return;
    }

    const rawText = ocrResult.rawText;

    // ── Step 2: Gemini — one call, all AI fields ──────────
    const ai = await analyseInvoice(rawText);

    // ── Step 3: Persist everything ────────────────────────
    await Invoice.findByIdAndUpdate(
      invoice._id,
      {
        ocrRawText: rawText,
        status: 'extracted',

        extractedData: {
          vendorName:    ai.extraction.vendorName,
          invoiceNumber: ai.extraction.invoiceNumber,
          invoiceDate:   ai.extraction.invoiceDate,
          dueDate:       ai.extraction.dueDate,
          totalAmount:   ai.extraction.totalAmount,
          subtotal:      ai.extraction.subtotal,
          taxAmount:     ai.extraction.taxAmount,
          currency:      ai.extraction.currency,
          gstNumber:     ai.extraction.gstNumber,
          invoiceType:   ai.extraction.invoiceType,
          paymentTerms:  ai.extraction.paymentTerms,
          lineItems:     ai.extraction.lineItems,
        },

        'aiInsights.category':           ai.categorization.category,
        'aiInsights.categoryConfidence': ai.categorization.categoryConfidence,
        'aiInsights.categoryReason':     ai.categorization.categoryReason,
        'aiInsights.summary':            ai.summary,
        'aiInsights.warnings':           ai.validation.warnings,
        'aiInsights.validationScore':    ai.validation.validationScore,
        'aiInsights.riskScore':          ai.risk.riskScore,
        'aiInsights.riskLevel':          ai.risk.riskLevel,
        'aiInsights.riskReason':         ai.risk.riskReason,
        'aiInsights.recommendations':    ai.recommendations,
      },
      { new: true }
    );

    console.log(`[AI Pipeline] Invoice ${invoice._id} processed successfully.`);
  } catch (err) {
    // Do not crash — mark as pending and log
    await Invoice.findByIdAndUpdate(invoice._id, {
      status: 'pending',
    }).catch(() => {});
    throw err;
  }
};

// ==========================================
// Process Invoice Manually
// Re-runs full OCR + Gemini pipeline
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

  // OCR
  const mimetype = invoice.fileType === 'pdf' ? 'application/pdf' : 'image/jpeg';
  const ocrResult = await extractTextFromFile(invoice.fileUrl, mimetype);

  if (!ocrResult.success || ocrResult.rawText.trim().length === 0) {
    return next(new ErrorResponse('OCR could not extract text from this file', 422));
  }

  const rawText = ocrResult.rawText;

  // Gemini — single call
  const ai = await analyseInvoice(rawText);

  // Update
  const updated = await Invoice.findByIdAndUpdate(
    invoice._id,
    {
      ocrRawText: rawText,
      status: 'extracted',

      extractedData: {
        vendorName:    ai.extraction.vendorName,
        invoiceNumber: ai.extraction.invoiceNumber,
        invoiceDate:   ai.extraction.invoiceDate,
        dueDate:       ai.extraction.dueDate,
        totalAmount:   ai.extraction.totalAmount,
        subtotal:      ai.extraction.subtotal,
        taxAmount:     ai.extraction.taxAmount,
        currency:      ai.extraction.currency,
        gstNumber:     ai.extraction.gstNumber,
        invoiceType:   ai.extraction.invoiceType,
        paymentTerms:  ai.extraction.paymentTerms,
        lineItems:     ai.extraction.lineItems,
      },

      'aiInsights.category':           ai.categorization.category,
      'aiInsights.categoryConfidence': ai.categorization.categoryConfidence,
      'aiInsights.categoryReason':     ai.categorization.categoryReason,
      'aiInsights.summary':            ai.summary,
      'aiInsights.warnings':           ai.validation.warnings,
      'aiInsights.validationScore':    ai.validation.validationScore,
      'aiInsights.riskScore':          ai.risk.riskScore,
      'aiInsights.riskLevel':          ai.risk.riskLevel,
      'aiInsights.riskReason':         ai.risk.riskReason,
      'aiInsights.recommendations':    ai.recommendations,
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
  const invoices = await Invoice.find({ userId: req.user.id }).sort({ createdAt: -1 });

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
  const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.id });

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

  const allowed = ['pending', 'extracted', 'reviewed', 'sent', 'paid', 'overdue'];
  if (!allowed.includes(status)) {
    return next(new ErrorResponse('Invalid invoice status', 400));
  }

  const invoice = await Invoice.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
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

