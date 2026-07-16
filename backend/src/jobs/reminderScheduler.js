const cron = require("node-cron");
const Invoice = require("../models/Invoice");
const Reminder = require("../models/Reminder");
const User = require("../models/User");
const emailService = require("../services/emailService");

// ==========================================
// Automatic Reminder Scheduler
// Runs daily at 9:00 AM
// ==========================================

const runAutomaticReminders = async () => {
  console.log("🔄 Starting automatic reminder check...");

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find invoices that are:
    // - status = approved OR overdue
    // - dueDate < today
    // - not already reminded today
    // - have recipientEmail
    const invoices = await Invoice.find({
      $or: [{ status: "approved" }, { status: "overdue" }],
      "extractedData.dueDate": { $lt: today },
      recipientEmail: { $ne: "", $exists: true },
    });

    console.log(`📊 Found ${invoices.length} invoices eligible for automatic reminders`);

    let sentCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (const invoice of invoices) {
      try {
        // Check if already reminded today
        const todayReminder = await Reminder.findOne({
          invoiceId: invoice._id,
          type: "automatic",
          createdAt: { $gte: today, $lt: tomorrow },
        });

        if (todayReminder) {
          console.log(`⏭️  Skipping invoice ${invoice._id} - already reminded today`);
          skippedCount++;
          continue;
        }

        // Get recipient email from invoice
        const recipientEmail = invoice.recipientEmail;
        if (!recipientEmail) {
          console.log(`❌ Skipping invoice ${invoice._id} - no recipient email`);
          skippedCount++;
          continue;
        }

        // Create reminder record
        const reminder = await Reminder.create({
          invoiceId: invoice._id,
          userId: invoice.userId,
          recipientEmail: recipientEmail,
          subject: `Payment Reminder - Invoice ${invoice.extractedData.invoiceNumber || "N/A"}`,
          message: "Automatic payment reminder sent",
          type: "automatic",
          status: "pending",
        });

        // Send email with subject and message
        const subject = `Payment Reminder - Invoice ${invoice.extractedData.invoiceNumber || "N/A"}`;
        const message = "Automatic payment reminder sent";
        await emailService.sendReminderEmail(invoice, recipientEmail, subject, message);

        // Update reminder status
        reminder.status = "sent";
        reminder.sentAt = new Date();
        await reminder.save();

        // Update invoice reminders count
        invoice.remindersSent = (invoice.remindersSent || 0) + 1;
        await invoice.save();

        sentCount++;
        console.log(`✅ Reminder sent for invoice ${invoice._id}`);
      } catch (error) {
        failedCount++;
        console.error(`❌ Failed to send reminder for invoice ${invoice._id}:`, error.message);

        // Update reminder status to failed if it was created
        try {
          const reminder = await Reminder.findOne({
            invoiceId: invoice._id,
            type: "automatic",
            createdAt: { $gte: today, $lt: tomorrow },
          });
          if (reminder) {
            reminder.status = "failed";
            reminder.error = error.message;
            await reminder.save();
          }
        } catch (updateError) {
          console.error("Failed to update reminder status:", updateError.message);
        }
      }
    }

    console.log("📊 Automatic reminder check completed:");
    console.log(`   - Sent: ${sentCount}`);
    console.log(`   - Failed: ${failedCount}`);
    console.log(`   - Skipped: ${skippedCount}`);
  } catch (error) {
    console.error("❌ Automatic reminder check failed:", error);
  }
};

// ==========================================
// Start Scheduler
// ==========================================

const startReminderScheduler = () => {
  // Run every day at 9:00 AM
  cron.schedule("0 9 * * *", () => {
    console.log("⏰ Running automatic reminder job at 9:00 AM");
    runAutomaticReminders();
  });

  console.log("✅ Automatic reminder scheduler started (runs daily at 9:00 AM)");
};

module.exports = { startReminderScheduler, runAutomaticReminders };
