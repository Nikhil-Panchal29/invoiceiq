require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// ==========================================
// Import Middleware
// ==========================================

const errorHandler = require("./middleware/errorHandler");

// ==========================================
// Import Routes
// ==========================================

const authRoutes = require("./routes/authRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");

const app = express();

// ==========================================
// Core Middleware
// ==========================================

// Parse JSON requests
app.use(
  express.json({
    limit: "10mb",
  })
);

// Parse URL Encoded Requests
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// Enable Cookies
app.use(cookieParser());

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

// ==========================================
// Health Check Route
// ==========================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "InvoiceIQ API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// API Routes
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);

// ==========================================
// 404 Handler
// ==========================================

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ==========================================
// Centralized Error Handler
// (Must Always Be Last)
// ==========================================

app.use(errorHandler);

module.exports = app;