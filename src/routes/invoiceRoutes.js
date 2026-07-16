const express = require('express');

const {
  uploadInvoice,
  processInvoice,
  getInvoices,
  getInvoice,
  updateInvoiceStatus,
  updateInvoice,
  deleteInvoice,
  downloadInvoiceFile,
  serveInvoiceFile,
} = require('../controllers/invoiceController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

// ==========================================
// Protect All Invoice Routes
// ==========================================

router.use(protect);

// ==========================================
// Invoice Routes
// ==========================================

// Upload invoice — triggers OCR pipeline automatically
router.post('/upload', upload.single('invoice'), uploadInvoice);

// Manually re-trigger OCR + AI pipeline on existing invoice
router.post('/:id/process', processInvoice);

// Get all invoices for current user
router.get('/', getInvoices);

// Get single invoice
router.get('/:id', getInvoice);

// Update invoice status
router.patch('/:id/status', updateInvoiceStatus);

// Update invoice details
router.put('/:id', updateInvoice);

// Delete invoice
router.delete('/:id', deleteInvoice);

// Download invoice file
router.get('/:id/download', downloadInvoiceFile);

// Serve invoice file for preview
router.get('/:id/file', serveInvoiceFile);

module.exports = router;
