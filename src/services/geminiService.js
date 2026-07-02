const { GoogleGenerativeAI } = require('@google/generative-ai');

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
      maxOutputTokens: 2048,
    },
  });
};

// ==========================================
// Master Prompt — Single Gemini call
// Returns all AI fields in one JSON object
// ==========================================

const buildPrompt = (ocrText) => {
  return `You are an expert invoice analysis AI. Analyse the invoice text below and return ONLY a single valid JSON object. No markdown. No code fences. No explanation. Only raw JSON.

The JSON must follow this exact structure:

{
  "extraction": {
    "vendorName": "string or empty string",
    "invoiceNumber": "string or empty string",
    "invoiceDate": "YYYY-MM-DD or null",
    "dueDate": "YYYY-MM-DD or null",
    "totalAmount": number or 0,
    "subtotal": number or 0,
    "taxAmount": number or 0,
    "currency": "INR or USD or EUR or GBP or other",
    "gstNumber": "string or empty string",
    "invoiceType": "Tax Invoice or Proforma Invoice or Credit Note or Receipt or Other",
    "paymentTerms": "string or empty string",
    "lineItems": [
      {
        "description": "string",
        "quantity": number,
        "unitPrice": number,
        "total": number
      }
    ]
  },
  "categorization": {
    "category": "one of: Office Supplies, Food, Travel, Marketing, Software, Utilities, Hardware, Education, Medical, Professional Services, Insurance, Salary, Rent, Miscellaneous",
    "categoryConfidence": number between 0 and 100,
    "categoryReason": "one sentence explaining why this category was chosen"
  },
  "summary": "one professional sentence summarising the invoice — include vendor name, amount, purpose and due date if available",
  "validation": {
    "warnings": ["array of warning strings — include one entry per issue found"],
    "validationScore": number between 0 and 100
  },
  "risk": {
    "riskScore": number between 0 and 100,
    "riskLevel": "Low or Medium or High",
    "riskReason": "one sentence explaining the risk assessment"
  },
  "recommendations": ["array of practical action strings for the accounts team"]
}

Rules:
- validationScore 100 means a perfect invoice with all fields present.
- Deduct points for every missing or suspicious field.
- riskScore above 70 means High, 40-70 means Medium, below 40 means Low.
- If a field is genuinely not present in the invoice, use an empty string or 0 or null as appropriate — never invent data.
- Always return all top-level keys even if their values are empty defaults.
- warnings must be an array. If no warnings, return an empty array.
- recommendations must be an array. Always include at least one recommendation.

Invoice text to analyse:
---
${ocrText}
---`;
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
// Main Gemini Service — single API call
// ==========================================

const analyseInvoice = async (ocrText) => {
  if (!ocrText || ocrText.trim().length === 0) {
    throw new Error('OCR text is empty — cannot call Gemini without content');
  }

  const model = getGeminiClient();
  const prompt = buildPrompt(ocrText);

  let rawText;

  // ── First attempt ──────────────────────────
  try {
    const result = await model.generateContent(prompt);
    rawText = result.response.text();
    console.log("\n========== GEMINI RAW RESPONSE ==========");
    console.log(rawText);
    console.log("=========================================\n");
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
    throw new Error(`Gemini API error: ${err.message}`);
  }

  // ── Parse with one retry on malformed JSON ──
  let parsed;
  try {
    parsed = parseGeminiResponse(rawText);
  } catch (parseErr) {
    // Retry once
    try {
      const retryResult = await model.generateContent(prompt);
      const retryText = retryResult.response.text();
      parsed = parseGeminiResponse(retryText);
    } catch (retryErr) {
      throw new Error(
        `Gemini returned invalid JSON after retry. Parse error: ${parseErr.message}`
      );
    }
  }

  return normaliseResponse(parsed);
};

module.exports = { analyseInvoice };
