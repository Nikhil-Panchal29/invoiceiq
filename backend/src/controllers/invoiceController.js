const asyncHandler    = require('../utils/asyncHandler');
const ErrorResponse   = require('../utils/ErrorResponse');
const Invoice         = require('../models/Invoice');
const { extractTextFromFile } = require('../services/ocrService');
const { analyseInvoice }      = require('../services/geminiService');
const { validateInvoice }     = require('../services/invoiceValidationService');
const { detectDuplicate }     = require('../services/duplicateDetectionService');
const fs = require('fs');
const path = require('path');

// ==========================================
// Workflow Transition Rules
// ==========================================

const VALID_TRANSITIONS = {
  uploaded: ['processing'],
  processing: ['extracted'],
  extracted: ['reviewed'],
  reviewed: ['approved'],
  approved: ['paid', 'overdue'],
  paid: [],
  overdue: [],
};

/**
 * Validate status transition
 * @param {string} currentStatus - Current invoice status
 * @param {string} newStatus - Desired new status
 * @returns {boolean} - Whether transition is valid
 */
const isValidTransition = (currentStatus, newStatus) => {
  if (currentStatus === newStatus) return false;
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
};

// ==========================================
// Upload Invoice
// OCR → Validation → AI Extraction → Duplicate Detection → Create → Update
// ==========================================

const uploadInvoice = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';

  // ── Step 1: OCR Extraction (synchronous) ───────────────
  const ocrResult = await extractTextFromFile(req.file.path, req.file.mimetype);

  if (!ocrResult.success || ocrResult.rawText.trim().length === 0) {
    return next(new ErrorResponse('OCR could not extract text from this file', 422));
  }

  // ── Step 2: Invoice Validation ───────────────────────────
  const validation = validateInvoice(ocrResult);

  if (!validation.isValid) {
    // Delete uploaded file since it's not a valid invoice
    const fs = require('fs');
    const path = require('path');
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.error(`[Upload] Failed to delete invalid file: ${err.message}`);
    }

    return next(new ErrorResponse('This document is not a valid invoice.', 400));
  }

  // ── Step 3: AI Extraction (synchronous for duplicate detection) ──
  const ai = await analyseInvoice(ocrResult.rawText);

  // ── Step 4: Duplicate Detection ───────────────────────────
  const duplicateResult = await detectDuplicate(
    {
      vendorName: ai.extraction.vendorName,
      invoiceNumber: ai.extraction.invoiceNumber,
      invoiceDate: ai.extraction.invoiceDate,
      totalAmount: ai.extraction.totalAmount,
      currency: ai.extraction.currency,
      ocrRawText: ocrResult.rawText,
    },
    req.user.id
  );

  // ── Step 5: Create invoice document with duplicate flags ───
  const invoice = await Invoice.create({
    userId:   req.user.id,
    fileUrl:  req.file.path.replace(/\\/g, '/'),
    fileName: req.file.originalname,
    fileType,
    status:   'uploaded',
    ocrRawText: ocrResult.rawText,

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

    'aiInsights.isDuplicate':       duplicateResult.isDuplicate,
    'aiInsights.duplicateOfId':     duplicateResult.duplicateOfId,
    'aiInsights.duplicateScore':   duplicateResult.duplicateScore,
    'aiInsights.category':          ai.categorization.category,
    'aiInsights.categoryConfidence': ai.categorization.categoryConfidence,
    'aiInsights.categoryReason':    ai.categorization.categoryReason,
    'aiInsights.summary':           ai.summary,
    'aiInsights.warnings':          ai.validation.warnings,
    'aiInsights.validationScore':   ai.validation.validationScore,
    'aiInsights.riskScore':         ai.risk.riskScore,
    'aiInsights.riskLevel':         ai.risk.riskLevel,
    'aiInsights.riskReason':        ai.risk.riskReason,
    'aiInsights.recommendations':   ai.recommendations,
  });

  // Update status to extracted since we already have AI data
  invoice.status = 'extracted';
  await invoice.save();

  console.log(`[Upload] Invoice ${invoice._id} created${duplicateResult.isDuplicate ? ' (flagged as duplicate)' : ''}.`);

  res.status(201).json({
    success: true,
    message: duplicateResult.isDuplicate 
      ? 'Invoice uploaded. Flagged as potential duplicate.' 
      : 'Invoice uploaded successfully.',
    data: invoice,
  });
});

// ==========================================
// AI Pipeline
// Gemini (single call) → MongoDB
// ==========================================

const runAIPipeline = async (invoice, rawText) => {
  try {
    // ── Step 1: Gemini — one call, all AI fields ──────────
    const ai = await analyseInvoice(rawText);

    // ── Step 2: Persist everything ────────────────────────
    await Invoice.findByIdAndUpdate(
      invoice._id,
      {
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
// Re-runs full OCR + Validation + Gemini pipeline
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
  let filePath;
  if (path.isAbsolute(invoice.fileUrl)) {
    filePath = invoice.fileUrl;
  } else {
    filePath = path.join(__dirname, '../../', invoice.fileUrl);
  }
  const ocrResult = await extractTextFromFile(filePath, mimetype);

  if (!ocrResult.success || ocrResult.rawText.trim().length === 0) {
    return next(new ErrorResponse('OCR could not extract text from this file', 422));
  }

  const rawText = ocrResult.rawText;

  // Validation
  const validation = validateInvoice(ocrResult);

  if (!validation.isValid) {
    return next(new ErrorResponse('This document is not a valid invoice.', 400));
  }

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

  const allowed = ['uploaded', 'processing', 'extracted', 'reviewed', 'approved', 'paid', 'overdue'];
  if (!allowed.includes(status)) {
    return next(new ErrorResponse('Invalid invoice status', 400));
  }

  const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.id });

  if (!invoice) {
    return next(new ErrorResponse('Invoice not found', 404));
  }

  // Validate workflow transition
  if (!isValidTransition(invoice.status, status)) {
    return next(new ErrorResponse('Invalid workflow transition', 400));
  }

  invoice.status = status;
  await invoice.save();

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    data: invoice,
  });
});

// ==========================================
// Update Invoice
// ==========================================

const updateInvoice = asyncHandler(async (req, res, next) => {
  const {
    vendorName,
    invoiceNumber,
    invoiceDate,
    dueDate,
    currency,
    totalAmount,
    gstNumber,
    paymentTerms,
    lineItems,
  } = req.body;

  const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.id });

  if (!invoice) {
    return next(new ErrorResponse('Invoice not found', 404));
  }

  // Update extracted data
  invoice.extractedData = {
    ...invoice.extractedData,
    vendorName: vendorName || invoice.extractedData.vendorName,
    invoiceNumber: invoiceNumber || invoice.extractedData.invoiceNumber,
    invoiceDate: invoiceDate ? new Date(invoiceDate) : invoice.extractedData.invoiceDate,
    dueDate: dueDate ? new Date(dueDate) : invoice.extractedData.dueDate,
    currency: currency || invoice.extractedData.currency,
    totalAmount: totalAmount !== undefined ? Number(totalAmount) : invoice.extractedData.totalAmount,
    gstNumber: gstNumber !== undefined ? gstNumber : invoice.extractedData.gstNumber,
    paymentTerms: paymentTerms !== undefined ? paymentTerms : invoice.extractedData.paymentTerms,
    lineItems: lineItems || invoice.extractedData.lineItems,
  };

  await invoice.save();

  res.status(200).json({
    success: true,
    message: 'Invoice updated successfully',
    data: invoice,
  });
});

// ==========================================
// Delete Invoice
// ==========================================

const deleteInvoice = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.id });

  if (!invoice) {
    return next(new ErrorResponse('Invoice not found', 404));
  }

  // Delete uploaded file
  if (invoice.fileUrl) {
    try {
      let filePath;
      if (path.isAbsolute(invoice.fileUrl)) {
        filePath = invoice.fileUrl;
      } else {
        filePath = path.join(__dirname, '../../', invoice.fileUrl);
      }
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(`[Delete] Failed to delete file: ${err.message}`);
    }
  }

  // Delete invoice document using findByIdAndDelete to ensure deletion
  await Invoice.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Invoice deleted successfully',
  });
});

// ==========================================
// Download Invoice File
// ==========================================

const downloadInvoiceFile = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.id });

  if (!invoice) {
    return next(new ErrorResponse('Invoice not found', 404));
  }

  if (!invoice.fileUrl) {
    return next(new ErrorResponse('Invoice file not found', 404));
  }

  let filePath;
  if (path.isAbsolute(invoice.fileUrl)) {
    filePath = invoice.fileUrl;
  } else {
    filePath = path.join(__dirname, '../../', invoice.fileUrl);
  }

  if (!fs.existsSync(filePath)) {
    return next(new ErrorResponse('File not found on server', 404));
  }

  res.download(filePath, invoice.fileName);
});

// ==========================================
// Serve Invoice File for Preview
// ==========================================

const serveInvoiceFile = asyncHandler(async (req, res, next) => {
  console.log('[serveInvoiceFile] Request received for invoice ID:', req.params.id);

  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    console.log('[serveInvoiceFile] Invoice not found in MongoDB');
    return next(new ErrorResponse('Invoice not found', 404));
  }

  console.log('[serveInvoiceFile] Invoice found. fileUrl:', invoice.fileUrl);

  // Verify invoice belongs to logged-in user
  if (invoice.userId.toString() !== req.user.id.toString()) {
    console.log('[serveInvoiceFile] User not authorized');
    return next(new ErrorResponse('Not authorized to access this invoice', 403));
  }

  if (!invoice.fileUrl) {
    console.log('[serveInvoiceFile] No fileUrl on invoice');
    return next(new ErrorResponse('Invoice file not found', 404));
  }

  // If fileUrl is an absolute path, use it directly
  // If it's a relative path, construct from backend root
  let filePath;
  if (path.isAbsolute(invoice.fileUrl)) {
    filePath = invoice.fileUrl;
  } else {
    filePath = path.join(__dirname, '../../', invoice.fileUrl);
  }
  
  console.log('[serveInvoiceFile] Constructed file path:', filePath);
  console.log('[serveInvoiceFile] File exists:', fs.existsSync(filePath));

  if (!fs.existsSync(filePath)) {
    console.log('[serveInvoiceFile] File not found on disk');
    return next(new ErrorResponse('File not found on server', 404));
  }

  console.log('[serveInvoiceFile] Sending file...');
  // Let Express auto-detect Content-Type based on file extension
  res.sendFile(filePath);
});

module.exports = {
  uploadInvoice,
  processInvoice,
  getInvoices,
  getInvoice,
  updateInvoiceStatus,
  updateInvoice,
  deleteInvoice,
  downloadInvoiceFile,
  serveInvoiceFile,
};

