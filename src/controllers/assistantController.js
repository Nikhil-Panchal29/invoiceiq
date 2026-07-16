const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const Invoice = require('../models/Invoice');
const Reminder = require('../models/Reminder');
const { chatWithAssistant } = require('../services/groqService');

/**
 * Chat with AI Assistant
 * POST /api/assistant/chat
 */
const chat = asyncHandler(async (req, res, next) => {
  const { question } = req.body;

  if (!question || question.trim().length === 0) {
    return next(new ErrorResponse('Question is required', 400));
  }

  // Fetch all invoices for the logged-in user
  const invoices = await Invoice.find({ userId: req.user.id }).sort({ createdAt: -1 });

  // Fetch all reminders for the logged-in user
  const reminders = await Reminder.find({ userId: req.user.id })
    .populate({
      path: 'invoiceId',
      select: '_id extractedData.invoiceNumber extractedData.vendorName extractedData.totalAmount extractedData.currency status',
    })
    .sort({ createdAt: -1 });

  if (invoices.length === 0 && reminders.length === 0) {
    return res.status(200).json({
      success: true,
      answer: "You don't have any invoices or reminders yet. Upload some invoices to get started!",
      sources: [],
    });
  }

  // Call Groq service
  const result = await chatWithAssistant(question, invoices, reminders);

  res.status(200).json({
    success: true,
    answer: result.answer,
    sources: result.sources,
  });
});

module.exports = { chat };
