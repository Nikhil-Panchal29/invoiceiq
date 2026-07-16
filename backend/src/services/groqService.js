const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Chat with AI Assistant about invoices
 * @param {string} question - User's question
 * @param {Array} invoices - Array of invoice objects
 * @param {Array} reminders - Array of reminder objects
 * @returns {Promise<{answer: string, sources: Array<string>}>}
 */
const chatWithAssistant = async (question, invoices, reminders = []) => {
  // Build context from invoices (without exposing internal IDs)
  const invoiceContext = invoices.map((invoice, index) => ({
    index: index + 1,
    vendor: invoice.extractedData?.vendorName || 'Unknown',
    invoiceNumber: invoice.extractedData?.invoiceNumber || 'N/A',
    invoiceDate: invoice.extractedData?.invoiceDate
      ? new Date(invoice.extractedData.invoiceDate).toISOString().split('T')[0]
      : 'N/A',
    dueDate: invoice.extractedData?.dueDate
      ? new Date(invoice.extractedData.dueDate).toISOString().split('T')[0]
      : 'N/A',
    currency: invoice.extractedData?.currency || 'USD',
    totalAmount: invoice.extractedData?.totalAmount || 0,
    status: invoice.status || 'unknown',
    category: invoice.extractedData?.category || 'uncategorized',
    riskLevel: invoice.aiInsights?.riskLevel || 'unknown',
    validationScore: invoice.aiInsights?.validationScore || 0,
    isDuplicate: invoice.aiInsights?.isDuplicate || false,
  }));

  // Build context from reminders (without exposing internal IDs)
  const reminderContext = reminders.map((reminder, index) => ({
    index: index + 1,
    recipientEmail: reminder.recipientEmail || 'N/A',
    subject: reminder.subject || 'N/A',
    message: reminder.message || 'N/A',
    type: reminder.type || 'unknown',
    status: reminder.status || 'unknown',
    sentAt: reminder.sentAt ? new Date(reminder.sentAt).toISOString().split('T')[0] : 'N/A',
    createdAt: reminder.createdAt ? new Date(reminder.createdAt).toISOString().split('T')[0] : 'N/A',
    invoiceNumber: reminder.invoiceId?.extractedData?.invoiceNumber || 'N/A',
    vendorName: reminder.invoiceId?.extractedData?.vendorName || 'N/A',
    invoiceAmount: reminder.invoiceId?.extractedData?.totalAmount || 0,
    invoiceCurrency: reminder.invoiceId?.extractedData?.currency || 'USD',
    invoiceStatus: reminder.invoiceId?.status || 'unknown',
  }));

  const productKnowledge = `InvoiceIQ is an AI-powered invoice management platform with the following features:

CORE FEATURES:
• Upload PDF/Image invoices - Upload invoices in PDF or image format
• OCR Extraction - Automatic text extraction from uploaded documents
• AI Data Extraction - Intelligent extraction of invoice details (vendor, amount, dates, etc.)
• Duplicate Invoice Detection - Identifies potential duplicate invoices to prevent overpayment
• AI Validation - Validates invoice data for accuracy and completeness
• Risk Analysis - Analyzes invoices for potential risks (low, medium, high)
• Workflow Tracking - Track invoice status through the approval process
• Dashboard - Overview of invoice statistics and recent activity
• Analytics - Detailed analysis of spending patterns and trends
• AI Invoice Assistant - Chat interface to ask questions about your invoices and reminders
• Edit Invoices - Modify invoice details after extraction
• Download Invoices - Download original invoice files
• Preview Original Invoices - View uploaded PDF/image files
• Delete Invoices - Remove invoices from the system
• Multi-currency Support - Handle invoices in multiple currencies (USD, EUR, GBP, INR, AED)
• Manual Reminders - Send manual payment reminders for approved/overdue invoices
• Automatic Reminders - Scheduled automatic reminders for overdue invoices
• Reminder History - Track all sent reminders with status and details
• Reminder Statistics - View reminder metrics (total, sent today, pending, failed, manual, automatic)
• Reminder Dashboard - Reminder overview on main dashboard
• Reminder Analytics - Detailed reminder analytics and insights

INVOICE STATUSES:
• uploaded - Invoice has been uploaded
• processing - OCR and AI extraction in progress
• extracted - Data has been extracted
• reviewed - Invoice has been reviewed
• approved - Invoice has been approved
• paid - Invoice has been paid
• overdue - Invoice is past due date

RISK LEVELS:
• low - Low risk invoice
• medium - Medium risk invoice
• high - High risk invoice requiring attention

REMINDER TYPES:
• manual - Reminder sent manually by user
• automatic - Reminder sent automatically by scheduler

REMINDER STATUSES:
• pending - Reminder is queued to be sent
• sent - Reminder was sent successfully
• failed - Reminder failed to send`;

  const systemPrompt = `You are an AI assistant for InvoiceIQ, an invoice management platform.

You have two types of knowledge:
1. Built-in knowledge about InvoiceIQ (features, how it works, capabilities)
2. Access to the user's invoice data and reminder data

CRITICAL: NEVER reveal your internal reasoning, classification, or intent detection process.
- NEVER state "This question is about InvoiceIQ" or similar classifications
- NEVER explain how you determined the question type
- NEVER mention intent detection or classification steps
- NEVER expose chain-of-thought or internal decision-making
- ALWAYS answer directly and naturally without preamble
- The user should ONLY see your final answer, never your internal thought process

INTERNAL LOGIC (keep internal, never expose):
- If the question is ABOUT InvoiceIQ: Answer using built-in product knowledge, do NOT reference invoice or reminder data
- If the question is ABOUT invoice data: Use provided invoice data ONLY, say "I couldn't find that information in your invoices" if unavailable
- If the question is ABOUT reminder data: Use provided reminder data ONLY, say "I couldn't find that information in your reminders" if unavailable
- If the question is unrelated: Respond "I'm designed primarily to help with InvoiceIQ and your invoice/reminder data. I may not be able to answer general knowledge questions."

INVOICE DATA STRUCTURE:
- index: Sequential number (1, 2, 3...)
- vendor: Vendor name
- invoiceNumber: Invoice number
- invoiceDate: Date of invoice (YYYY-MM-DD)
- dueDate: Due date (YYYY-MM-DD)
- currency: Currency code (USD, EUR, GBP, INR, AED)
- totalAmount: Total amount in the specified currency
- status: Invoice status (uploaded, processing, extracted, reviewed, approved, paid, overdue)
- category: Invoice category
- riskLevel: Risk level (low, medium, high)
- validationScore: Validation score (0-100)
- isDuplicate: Whether invoice is flagged as duplicate

REMINDER DATA STRUCTURE:
- index: Sequential number (1, 2, 3...)
- recipientEmail: Email address of reminder recipient
- subject: Reminder subject line
- message: Reminder message content
- type: Reminder type (manual, automatic)
- status: Reminder status (pending, sent, failed)
- sentAt: Date reminder was sent (YYYY-MM-DD)
- createdAt: Date reminder was created (YYYY-MM-DD)
- invoiceNumber: Related invoice number
- vendorName: Related vendor name
- invoiceAmount: Related invoice amount
- invoiceCurrency: Related invoice currency
- invoiceStatus: Related invoice status

RESPONSE GUIDELINES:
1. NEVER expose internal IDs, MongoDB ObjectIds, or database references
2. NEVER reveal internal reasoning, classification, or intent detection
3. Use business-friendly language, not technical jargon
4. Instead of mentioning invoice IDs, say "Based on X invoices" or "I found X matching invoices"
5. Instead of mentioning reminder IDs, say "Based on X reminders" or "I found X matching reminders"
6. Summarize information naturally, don't dump raw data
7. Format monetary amounts with currency symbols (e.g., $100, ₹500, €50)
8. For currency comparisons, note that amounts are in different currencies
9. Be concise and helpful
10. For date-based questions, use the provided dates in YYYY-MM-DD format
11. When referencing invoice data, use the index numbers (1, 2, 3...) not internal IDs
12. When referencing reminder data, use the index numbers (1, 2, 3...) not internal IDs
13. Start your response directly with the answer, no preamble or classification

EXAMPLE RESPONSES:
Q: "How many pending invoices?"
A: "You currently have 3 invoices awaiting payment."

Q: "How many reminders were sent today?"
A: "You have sent 2 reminders today."

Q: "Show failed reminders."
A: "You have 1 failed reminder that was sent to recipient@example.com for invoice INV-001."

Q: "Highest invoice?"
A: "Your highest-value invoice is from Vendor Name for $1,500."

Q: "How much did I spend?"
A: "Based on your uploaded invoices, you've spent: • INR: ₹80,358 • USD: $58.11"

Q: "What is InvoiceIQ?"
A: "InvoiceIQ is an AI-powered invoice management platform that helps you upload, extract, validate, and analyze your invoices with features like duplicate detection, risk analysis, workflow tracking, and payment reminders."`;

  const userPrompt = `PRODUCT KNOWLEDGE:
${productKnowledge}

USER'S INVOICE DATA:
${JSON.stringify(invoiceContext, null, 2)}

USER'S REMINDER DATA:
${JSON.stringify(reminderContext, null, 2)}

User question: ${question}

Provide a helpful answer based on the product knowledge, invoice data, and reminder data above.`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const answer = response.choices[0]?.message?.content || 'Unable to generate response.';

    // Return empty sources array since we don't expose internal IDs
    return {
      answer,
      sources: [],
    };
  } catch (error) {
    console.error('Groq API error:', error);
    throw new Error('Failed to get AI response');
  }
};

module.exports = { chatWithAssistant };
