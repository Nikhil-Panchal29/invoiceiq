/**
 * Invoice Validation Service
 * 
 * Validates whether OCR-extracted text represents a valid invoice
 * Uses confidence-based approach with multiple invoice indicators
 */

// Invoice-specific keywords with weights
const INVOICE_KEYWORDS = {
  // Strong indicators (weight: 3)
  strong: [
    'invoice',
    'invoice number',
    'invoice no',
    'invoice #',
    'bill to',
    'vendor',
    'supplier',
    'customer',
  ],
  
  // Medium indicators (weight: 2)
  medium: [
    'subtotal',
    'tax',
    'gst',
    'cgst',
    'sgst',
    'igst',
    'vat',
    'amount',
    'grand total',
    'balance due',
    'payment terms',
    'due date',
    'invoice date',
    'invoice total',
    'purchase order',
  ],
  
  // Weak indicators (weight: 1)
  weak: [
    'quantity',
    'description',
    'unit price',
    'invoice id',
    'total',
    'date',
    'rate',
    'price',
    'item',
    'product',
    'service',
  ],
};

// Non-invoice document indicators (negative weight)
const NON_INVOICE_KEYWORDS = [
  'resume',
  'curriculum vitae',
  'cv',
  'objective',
  'education',
  'experience',
  'skills',
  'references',
  'passport',
  'government of',
  'ministry of',
  'certificate',
  'marksheet',
  'transcript',
  'grade',
  'semester',
  'university',
  'college',
  'school',
  'bank statement',
  'account statement',
  'transaction history',
  'balance',
  'withdrawal',
  'deposit',
  'dr',
  'cr',
];

/**
 * Calculate invoice confidence score based on OCR text
 * @param {string} text - OCR extracted text
 * @returns {Object} - Validation result with confidence score and details
 */
const validateInvoiceText = (text) => {
  const lowerText = text.toLowerCase();
  
  let score = 0;
  let matchedKeywords = [];
  let negativeScore = 0;
  let matchedNegativeKeywords = [];
  
  // Check for strong indicators
  for (const keyword of INVOICE_KEYWORDS.strong) {
    if (lowerText.includes(keyword)) {
      score += 3;
      matchedKeywords.push({ keyword, weight: 3 });
    }
  }
  
  // Check for medium indicators
  for (const keyword of INVOICE_KEYWORDS.medium) {
    if (lowerText.includes(keyword)) {
      score += 2;
      matchedKeywords.push({ keyword, weight: 2 });
    }
  }
  
  // Check for weak indicators
  for (const keyword of INVOICE_KEYWORDS.weak) {
    if (lowerText.includes(keyword)) {
      score += 1;
      matchedKeywords.push({ keyword, weight: 1 });
    }
  }
  
  // Check for non-invoice indicators (negative)
  for (const keyword of NON_INVOICE_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      negativeScore += 5;
      matchedNegativeKeywords.push({ keyword, weight: 5 });
    }
  }
  
  // Calculate final confidence score
  const finalScore = Math.max(0, score - negativeScore);
  
  // Determine if valid (threshold: 5)
  const isValid = finalScore >= 5;
  
  return {
    isValid,
    confidence: finalScore,
    matchedKeywords,
    matchedNegativeKeywords,
    threshold: 5,
  };
};

/**
 * Validate invoice from OCR result
 * @param {Object} ocrResult - OCR extraction result
 * @returns {Object} - Validation result
 */
const validateInvoice = (ocrResult) => {
  if (!ocrResult.success || !ocrResult.rawText || ocrResult.rawText.trim().length === 0) {
    return {
      isValid: false,
      confidence: 0,
      reason: 'OCR extraction failed or returned empty text',
    };
  }
  
  const validation = validateInvoiceText(ocrResult.rawText);
  
  if (!validation.isValid) {
    return {
      isValid: false,
      confidence: validation.confidence,
      reason: 'This document is not a valid invoice',
      details: validation,
    };
  }
  
  return {
    isValid: true,
    confidence: validation.confidence,
    details: validation,
  };
};

module.exports = {
  validateInvoice,
  validateInvoiceText,
};
