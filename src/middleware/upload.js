const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==========================================
// Ensure Upload Directory Exists
// ==========================================

const uploadPath = "uploads/";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ==========================================
// Storage Configuration
// ==========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const sanitizedName = path
      .basename(file.originalname)
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    cb(null, `${Date.now()}-${sanitizedName}`);
  },
});

// ==========================================
// Allowed File Types
// ==========================================

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];

const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];

// ==========================================
// File Filter
// ==========================================

const fileFilter = (req, file, cb) => {
  const mimeValid = allowedMimeTypes.includes(file.mimetype);

  const extension = path.extname(file.originalname).toLowerCase();

  const extensionValid = allowedExtensions.includes(extension);

  if (mimeValid && extensionValid) {
    return cb(null, true);
  }

  cb(
    new Error("Only PDF, JPG, JPEG and PNG files are allowed."),
    false
  );
};

// ==========================================
// Export Upload Middleware
// ==========================================

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});