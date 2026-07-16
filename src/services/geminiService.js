const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// ==========================================
// Initialise Gemini client
// ==========================================

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
      maxOutputTokens: 8192,
    },
  });
};

// ==========================================
// Master Prompt — Single Gemini call
// Returns all AI fields in one JSON object
// ==========================================

const buildPrompt = (ocrText) => {
  return `Analyse invoice text. Return ONLY valid JSON. No markdown. No explanation.

JSON structure:
{
  "extraction": {
    "vendorName": "string",
    "invoiceNumber": "string",
    "invoiceDate": "YYYY-MM-DD or null",
    "dueDate": "YYYY-MM-DD or null",
    "totalAmount": number,
    "subtotal": number,
    "taxAmount": number,
    "currency": "INR/USD/EUR/GBP",
    "gstNumber": "string",
    "invoiceType": "Tax Invoice/Proforma/Credit Note/Receipt/Other",
    "paymentTerms": "string",
    "lineItems": [{"description": "string", "quantity": number, "unitPrice": number, "total": number}]
  },
  "categorization": {
    "category": "Office Supplies/Food/Travel/Marketing/Software/Utilities/Hardware/Education/Medical/Professional Services/Insurance/Salary/Rent/Miscellaneous",
    "categoryConfidence": 0-100,
    "categoryReason": "one sentence"
  },
  "summary": "one sentence summary",
  "validation": {
    "warnings": ["array of warning strings"],
    "validationScore": 0-100
  },
  "risk": {
    "riskScore": 0-100,
    "riskLevel": "Low/Medium/High",
    "riskReason": "one sentence"
  },
  "recommendations": ["array of action strings"]
}

Rules: 100=perfect invoice. Deduct for missing fields. Risk: >70=High, 40-70=Medium, <40=Low. Use empty string/0/null for missing data. Always return all keys. warnings/recommendations must be arrays.

Invoice text:
---
${ocrText}
---`;
};

// ==========================================
// Check if response is truncated
// ==========================================

const isResponseTruncated = (rawText) => {
  const trimmed = rawText.trim();
  // Valid JSON should end with } or ]
  return !trimmed.endsWith('}') && !trimmed.endsWith(']');
};

// ==========================================
// Save failed response to log file
// ==========================================

const saveFailedResponse = (attempt, rawText) => {
  const logsDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  const logFile = path.join(logsDir, `gemini-attempt${attempt}.txt`);
  fs.writeFileSync(logFile, rawText, 'utf8');
};

// ==========================================
// Parse and validate Gemini JSON response
// ==========================================

const parseGeminiResponse = (rawText) => {
  // Strip any accidental markdown fences Gemini may include
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned);

  // Validate top-level shape
  const required = ['extraction', 'categorization', 'summary', 'validation', 'risk', 'recommendations'];
  for (const key of required) {
    if (!(key in parsed)) {
      throw new Error(`Gemini response is missing required key: ${key}`);
    }
  }

  return parsed;
};

// ==========================================
// Normalise and apply safe defaults
// ==========================================

const normaliseResponse = (parsed) => {
  const ext = parsed.extraction || {};
  const cat = parsed.categorization || {};
  const val = parsed.validation || {};
  const risk = parsed.risk || {};

  return {
    extraction: {
      vendorName:    ext.vendorName    || '',
      invoiceNumber: ext.invoiceNumber || '',
      invoiceDate:   ext.invoiceDate   || null,
      dueDate:       ext.dueDate       || null,
      totalAmount:   Number(ext.totalAmount) || 0,
      subtotal:      Number(ext.subtotal)    || 0,
      taxAmount:     Number(ext.taxAmount)   || 0,
      currency:      ext.currency      || 'INR',
      gstNumber:     ext.gstNumber     || '',
      invoiceType:   ext.invoiceType   || 'Other',
      paymentTerms:  ext.paymentTerms  || '',
      lineItems:     Array.isArray(ext.lineItems) ? ext.lineItems : [],
    },
    categorization: {
      category:           cat.category           || 'Miscellaneous',
      categoryConfidence: Number(cat.categoryConfidence) || 0,
      categoryReason:     cat.categoryReason     || '',
    },
    summary:         typeof parsed.summary === 'string' ? parsed.summary : '',
    validation: {
      warnings:        Array.isArray(val.warnings) ? val.warnings : [],
      validationScore: Number(val.validationScore) || 0,
    },
    risk: {
      riskScore:  Number(risk.riskScore) || 0,
      riskLevel:  risk.riskLevel  || 'Low',
      riskReason: risk.riskReason || '',
    },
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
  };
};

// ==========================================
// Main Gemini Service — with retry logic
// ==========================================

const analyseInvoice = async (ocrText) => {
  if (!ocrText || ocrText.trim().length === 0) {
    throw new Error('OCR text is empty — cannot call Gemini without content');
  }

  const model = getGeminiClient();
  const prompt = buildPrompt(ocrText);

  const delays = [1000, 2000, 4000]; // 1s, 2s, 4s
  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    let rawText;
    let truncated = false;
    let parseSuccess = false;

    try {
      const result = await model.generateContent(prompt);
      rawText = result.response.text();

      console.log(`\n========== GEMINI ATTEMPT ${attempt} ==========`);
      console.log(`Response length: ${rawText.length} characters`);
      
      truncated = isResponseTruncated(rawText);
      console.log(`Truncated: ${truncated}`);

      if (truncated) {
        saveFailedResponse(attempt, rawText);
        console.log(`Saved failed response to logs/gemini-attempt${attempt}.txt`);
        lastError = new Error(`Response truncated on attempt ${attempt}`);
        if (attempt < 3) {
          console.log(`Retrying in ${delays[attempt - 1] / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delays[attempt - 1]));
          continue;
        }
      }

      parsed = parseGeminiResponse(rawText);
      parseSuccess = true;
      console.log(`Parsing: SUCCESS`);
      console.log("=========================================\n");

      return normaliseResponse(parsed);

    } catch (err) {
      if (err.status === 401 || err.message?.includes('API_KEY')) {
        throw new Error('Invalid Gemini API key. Check GEMINI_API_KEY in .env');
      }
      if (err.status === 429) {
        throw new Error('Gemini rate limit exceeded. Please wait and retry.');
      }
      if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
        throw new Error('Gemini network timeout. Check your internet connection.');
      }

      saveFailedResponse(attempt, rawText || err.message);
      console.log(`Parsing: FAILED - ${err.message}`);
      console.log(`Saved failed response to logs/gemini-attempt${attempt}.txt`);
      
      lastError = err;
      if (attempt < 3) {
        console.log(`Retrying in ${delays[attempt - 1] / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delays[attempt - 1]));
      }
    }
  }

  console.log("=========================================\n");
  throw new Error('AI extraction failed. Please try again.');
};

module.exports = { analyseInvoice };
