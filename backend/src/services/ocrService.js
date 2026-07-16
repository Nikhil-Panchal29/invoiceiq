const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

const Tesseract = require("tesseract.js");

// ==========================================
// Detect File Type
// ==========================================

const getFileCategory = (fileUrl, mimetype) => {
  if (mimetype === "application/pdf") return "pdf";

  const ext = path.extname(fileUrl).toLowerCase();

  if (ext === ".pdf") return "pdf";

  return "image";
};

// ==========================================
// Extract Text from PDF
// ==========================================

const extractFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);

  const data = await pdfParse(dataBuffer);

  console.log("\n========== PDF TEXT ==========\n");
  console.log(data.text);
  console.log("\n==============================\n");

  return data.text || "";
};

// ==========================================
// Extract Text from Image
// ==========================================

const extractFromImage = async (filePath) => {
  const result = await Tesseract.recognize(filePath, "eng", {
    logger: () => {},
  });

  return result.data.text || "";
};

// ==========================================
// Main OCR Service
// ==========================================

const extractTextFromFile = async (fileUrl, mimetype) => {
  const filePath = path.resolve(fileUrl);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const category = getFileCategory(fileUrl, mimetype);

  let rawText = "";
  let ocrEngine = "";

  try {
    if (category === "pdf") {
      rawText = await extractFromPDF(filePath);
      ocrEngine = "pdf-parse";
    } else {
      rawText = await extractFromImage(filePath);
      ocrEngine = "tesseract";
    }
  } catch (err) {
    throw new Error(`OCR extraction failed: ${err.message}`);
  }

  return {
    rawText: rawText.trim(),
    ocrEngine,
    charCount: rawText.trim().length,
    success: rawText.trim().length > 0,
  };
};

module.exports = {
  extractTextFromFile,
};