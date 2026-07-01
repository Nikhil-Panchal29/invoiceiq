const express = require("express");

const {
  uploadInvoice,
  getInvoices,
  getInvoice,
  updateInvoiceStatus,
} = require("../controllers/invoiceController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

// ==========================================
// Protect All Invoice Routes
// ==========================================

router.use(protect);

// ==========================================
// Invoice Routes
// ==========================================

// Upload Invoice
router.post("/upload", upload.single("invoice"), uploadInvoice);

// Get All Invoices
router.get("/", getInvoices);

// Get Single Invoice
router.get("/:id", getInvoice);

// Update Invoice Status
router.patch("/:id/status", updateInvoiceStatus);

module.exports = router;