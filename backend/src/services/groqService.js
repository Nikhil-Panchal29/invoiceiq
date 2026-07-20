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
  // Build context from invoices (without exposing internal IDs) - limited to 15 most recent
  const invoiceContext = invoices
    .slice(0, 15)
    .map((invoice, index) => ({
      index: index + 1,
      vendor: invoice.extractedData?.vendorName || 'Unknown',
      invoiceNumber: invoice.extractedData?.invoiceNumber || 'N/A',
      currency: invoice.extractedData?.currency || 'USD',
      totalAmount: invoice.extractedData?.totalAmount || 0,
      status: invoice.status || 'unknown',
    }));

  // Build context from reminders (without exposing internal IDs) - limited to 10 most recent
  const reminderContext = reminders
    .slice(0, 10)
    .map((reminder, index) => ({
      index: index + 1,
      recipientEmail: reminder.recipientEmail || 'N/A',
      subject: reminder.subject || 'N/A',
      status: reminder.status || 'unknown',
      invoiceNumber: reminder.invoiceId?.extractedData?.invoiceNumber || 'N/A',
      vendorName: reminder.invoiceId?.extractedData?.vendorName || 'N/A',
    }));

  const productKnowledge = `InvoiceIQ: AI invoice management platform. Features: upload PDF/image invoices, OCR extraction, AI data extraction, duplicate detection, validation, risk analysis, workflow tracking, dashboard, analytics, AI assistant, edit/download/delete invoices, multi-currency support, manual/automatic reminders, reminder history/analytics.

Invoice statuses: uploaded, processing, extracted, reviewed, approved, paid, overdue.
Risk levels: low, medium, high.
Reminder types: manual, automatic.
Reminder statuses: pending, sent, failed.`;

  const systemPrompt = `You are an AI assistant for InvoiceIQ. You have built-in product knowledge and access to user invoice/reminder data.

CRITICAL: NEVER reveal internal reasoning or classification. Answer directly without preamble.

INTERNAL LOGIC:
- About InvoiceIQ: Use product knowledge only
- About invoices/reminders: Use provided data only, say "I couldn't find that" if unavailable
- Unrelated: "I'm designed to help with InvoiceIQ and your invoice/reminder data"

DATA STRUCTURES:
Invoices: index, vendor, invoiceNumber, currency, totalAmount, status
Reminders: index, recipientEmail, subject, status, invoiceNumber, vendorName

RESPONSE GUIDELINES:
- Never expose internal IDs or database references
- Use business language, not technical jargon
- Reference data by index numbers (1, 2, 3...)
- Format amounts with currency symbols
- Be concise and helpful
- Start response directly with the answer

${productKnowledge}`;

  const userPrompt = `INVOICE DATA:
${JSON.stringify(invoiceContext)}

REMINDER DATA:
${JSON.stringify(reminderContext)}

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
