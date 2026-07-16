require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { startReminderScheduler } = require('./src/jobs/reminderScheduler');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start server
const startServer = async () => {
  await connectDB();
  
  // Start reminder scheduler
  startReminderScheduler();
  
  app.listen(PORT, () => {
    console.log(`✅  Server running on http://localhost:${PORT}`);
    console.log(`📦  Environment: ${process.env.NODE_ENV}`);
  });
};

startServer();
