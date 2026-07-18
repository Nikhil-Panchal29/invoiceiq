const nodemailer = require("nodemailer");

// ==========================================
// Email Service
// ==========================================

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  // ==========================================
  // Initialize SMTP Transporter
  // ==========================================

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  requireTLS: true,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  tls: {
    rejectUnauthorized: false,
  },

  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

this.transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Verify Error:", error);
  } else {
    console.log("✅ SMTP Server Ready");
  }
});

      console.log("✅ Email service initialized");
    } catch (error) {
      console.error("❌ Failed to initialize email service:", error.message);
    }
  }

  // ==========================================
  // Generate HTML Email Template
  // ==========================================

  generateReminderEmail(invoice, customMessage = "") {
    const { extractedData } = invoice;
    const currencySymbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      INR: "₹",
      AED: "د.إ",
    };
    const symbol = currencySymbols[extractedData.currency] || extractedData.currency;

    const formattedAmount = `${symbol}${extractedData.totalAmount.toLocaleString()}`;
    const formattedInvoiceDate = extractedData.invoiceDate
      ? new Date(extractedData.invoiceDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";
    const formattedDueDate = extractedData.dueDate
      ? new Date(extractedData.dueDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Reminder - InvoiceIQ</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 30px;
          }
          .invoice-details {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .invoice-details p {
            margin: 10px 0;
            color: #475569;
            font-size: 14px;
          }
          .invoice-details strong {
            color: #1e293b;
            font-weight: 600;
          }
          .reminder-text {
            color: #475569;
            line-height: 1.6;
            margin: 20px 0;
          }
          .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer p {
            margin: 5px 0;
            color: #64748b;
            font-size: 12px;
          }
          .footer a {
            color: #10b981;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>InvoiceIQ</h1>
          </div>
          <div class="content">
            <h2 style="color: #1e293b; margin-top: 0;">Payment Reminder</h2>
            <p class="reminder-text">
  ${
    customMessage ||
    "This is a friendly reminder about an invoice that requires your attention."
  }
            </p>
            
            <div class="invoice-details">
              <p><strong>Vendor:</strong> ${extractedData.vendorName || "N/A"}</p>
              <p><strong>Invoice Number:</strong> ${extractedData.invoiceNumber || "N/A"}</p>
              <p><strong>Amount:</strong> ${formattedAmount}</p>
              <p><strong>Invoice Date:</strong> ${formattedInvoiceDate}</p>
              <p><strong>Due Date:</strong> ${formattedDueDate}</p>
            </div>
            
            <p class="reminder-text">
              Please ensure that this invoice is processed before the due date to avoid any late payment issues.
            </p>
            
            <p class="reminder-text">
              If you have any questions or need further information, please don't hesitate to contact us.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} InvoiceIQ. All rights reserved.</p>
            <p>Automated payment reminder system</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // ==========================================
  // Send Email
  // ==========================================

  async sendEmail(to, subject, html) {
    if (!this.transporter) {
      throw new Error("Email transporter not initialized");
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
      };
      
      console.log("================================");
console.log("Sending Email");
console.log("From:", mailOptions.from);
console.log("To:", to);
console.log("Subject:", subject);
console.log("================================");

      const info = await this.transporter.sendMail(mailOptions);
      console.log(info);
      console.log("✅ Email sent successfully:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Failed to send email:", error.message);
      throw error;
    }
  }

  // ==========================================
  // Send Reminder Email
  // ==========================================

 async sendReminderEmail(invoice, recipientEmail, subject, message) {
  const emailSubject =
    subject ||
    `Payment Reminder - Invoice ${
      invoice.extractedData.invoiceNumber || "N/A"
    }`;

  const emailHtml = this.generateReminderEmail(invoice, message);

  return await this.sendEmail(
    recipientEmail,
    emailSubject,
    emailHtml
  );
}
}

// ==========================================
// Export Singleton Instance
// ==========================================

module.exports = new EmailService();
