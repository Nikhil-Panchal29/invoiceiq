const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const Invoice = require("../models/Invoice");
const Reminder = require("../models/Reminder");
const User = require("../models/User");
const emailService = require("../services/emailService");
const mongoose = require("mongoose");

// ==========================================
// Send Manual Reminder
// ==========================================

const sendManualReminder = asyncHandler(async (req, res, next) => {
  const { invoiceId } = req.params;
  const { recipientEmail, subject, message } = req.body;

  // Find invoice
  const invoice = await Invoice.findById(invoiceId);

  if (!invoice) {
    return next(new ErrorResponse("Invoice not found", 404));
  }

  // Validate ownership
  if (invoice.userId.toString() !== req.user.id) {
    return next(new ErrorResponse("Not authorized to access this invoice", 403));
  }

  // Reject if invoice is paid
  if (invoice.status === "paid") {
    return next(new ErrorResponse("Cannot send reminder for paid invoice", 400));
  }

  // Validate recipient email
  if (!recipientEmail) {
    return next(new ErrorResponse("Recipient email is required", 400));
  }

  // Save recipient email to invoice if not already set
  if (!invoice.recipientEmail) {
    invoice.recipientEmail = recipientEmail;
    await invoice.save();
  }

  // Create reminder record
  const reminder = await Reminder.create({
    invoiceId: invoice._id,
    userId: req.user.id,
    recipientEmail,
    subject: subject || `Payment Reminder - Invoice ${invoice.extractedData.invoiceNumber || "N/A"}`,
    message: message || "Manual payment reminder sent",
    type: "manual",
    status: "pending",
  });

  try {
    // Send email with custom subject and message
    await emailService.sendReminderEmail(invoice, recipientEmail, subject, message);

    // Update reminder status
    reminder.status = "sent";
    reminder.sentAt = new Date();
    await reminder.save();

    // Update invoice reminders count
    invoice.remindersSent = (invoice.remindersSent || 0) + 1;
    await invoice.save();

    res.status(200).json({
      success: true,
      message: "Reminder sent successfully",
      data: reminder,
    });
  } catch (error) {
    // Update reminder status to failed
    reminder.status = "failed";
    reminder.error = error.message;
    await reminder.save();

    return next(new ErrorResponse(`Failed to send reminder: ${error.message}`, 500));
  }
});

// ==========================================
// Get All Reminders
// ==========================================

const getReminders = asyncHandler(async (req, res, next) => {
  const { status, type, search, page = 1, limit = 20 } = req.query;

  // Build base query
  const query = { userId: req.user.id };

  if (status) query.status = status;
  if (type) query.type = type;

  // Build search filter
  let searchFilter = {};
  if (search) {
    searchFilter = {
      $or: [
        { "invoiceId.extractedData.vendorName": { $regex: search, $options: "i" } },
        { "invoiceId.extractedData.invoiceNumber": { $regex: search, $options: "i" } },
      ],
    };
  }

  // Get total count
  const total = await Reminder.countDocuments(query);

  // Get reminders with populate
  const reminders = await Reminder.find(query)
    .populate({
      path: "invoiceId",
      select: "_id extractedData.invoiceNumber extractedData.vendorName extractedData.totalAmount extractedData.currency status",
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  // Apply search filter manually if needed (since populate doesn't support regex on populated fields)
  let filteredReminders = reminders;
  if (search) {
    filteredReminders = reminders.filter((reminder) => {
      const vendorName = reminder.invoiceId?.extractedData?.vendorName || "";
      const invoiceNumber = reminder.invoiceId?.extractedData?.invoiceNumber || "";
      return (
        vendorName.toLowerCase().includes(search.toLowerCase()) ||
        invoiceNumber.toLowerCase().includes(search.toLowerCase())
      );
    });
  }

  res.status(200).json({
    success: true,
    count: filteredReminders.length,
    total: search ? filteredReminders.length : total,
    page: parseInt(page),
    pages: Math.ceil((search ? filteredReminders.length : total) / limit),
    data: filteredReminders,
  });
});

// ==========================================
// Get Single Reminder
// ==========================================

const getReminder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const reminder = await Reminder.findById(id).populate("invoiceId");

  if (!reminder) {
    return next(new ErrorResponse("Reminder not found", 404));
  }

  // Validate ownership
  if (reminder.userId.toString() !== req.user.id) {
    return next(new ErrorResponse("Not authorized to access this reminder", 403));
  }

  res.status(200).json({
    success: true,
    data: reminder,
  });
});

// ==========================================
// Resend Reminder
// ==========================================

const resendReminder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const reminder = await Reminder.findById(id);

  if (!reminder) {
    return next(new ErrorResponse("Reminder not found", 404));
  }

  // Validate ownership
  if (reminder.userId.toString() !== req.user.id) {
    return next(new ErrorResponse("Not authorized to access this reminder", 403));
  }

  // Find invoice
  const invoice = await Invoice.findById(reminder.invoiceId);

  if (!invoice) {
    return next(new ErrorResponse("Invoice not found", 404));
  }

  // Reject if invoice is paid
  if (invoice.status === "paid") {
    return next(new ErrorResponse("Cannot send reminder for paid invoice", 400));
  }

  try {
    // Send email with subject and message
    await emailService.sendReminderEmail(invoice, reminder.recipientEmail, reminder.subject, reminder.message);

    // Update reminder status
    reminder.status = "sent";
    reminder.sentAt = new Date();
    reminder.error = "";
    await reminder.save();

    // Update invoice reminders count
    invoice.remindersSent = (invoice.remindersSent || 0) + 1;
    await invoice.save();

    res.status(200).json({
      success: true,
      message: "Reminder resent successfully",
      data: reminder,
    });
  } catch (error) {
    // Update reminder status to failed
    reminder.status = "failed";
    reminder.error = error.message;
    await reminder.save();

    return next(new ErrorResponse(`Failed to resend reminder: ${error.message}`, 500));
  }
});

// ==========================================
// Get Reminder Stats
// ==========================================

const getReminderStats = asyncHandler(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const userObjectId = new mongoose.Types.ObjectId(req.user.id);

  const stats = await Reminder.aggregate([
    { $match: { userId: userObjectId } },
    {
      $facet: {
        total: [{ $count: "count" }],
        sentToday: [
          {
            $match: {
              status: "sent",
              sentAt: { $gte: today, $lt: tomorrow },
            },
          },
          { $count: "count" },
        ],
        pending: [
          {
            $match: { status: "pending" },
          },
          { $count: "count" },
        ],
        failed: [
          {
            $match: { status: "failed" },
          },
          { $count: "count" },
        ],
        manual: [
          {
            $match: { type: "manual" },
          },
          { $count: "count" },
        ],
        automatic: [
          {
            $match: { type: "automatic" },
          },
          { $count: "count" },
        ],
      },
    },
  ]);

  // Get overdue invoices count
  const overdueCount = await Invoice.countDocuments({
    userId: req.user.id,
    status: "overdue",
  });

  res.status(200).json({
    success: true,
    data: {
      total: stats[0].total[0]?.count || 0,
      sentToday: stats[0].sentToday[0]?.count || 0,
      pending: stats[0].pending[0]?.count || 0,
      failed: stats[0].failed[0]?.count || 0,
      manual: stats[0].manual[0]?.count || 0,
      automatic: stats[0].automatic[0]?.count || 0,
      overdueInvoices: overdueCount,
    },
  });
});

module.exports = {
  sendManualReminder,
  getReminders,
  getReminder,
  resendReminder,
  getReminderStats,
};
