/**
 * Duplicate Invoice Detection Service
 * 
 * Detects duplicate invoices using confidence-based scoring
 * Compares vendor name, invoice number, date, amount, and OCR text
 */

const Invoice = require('../models/Invoice');

/**
 * Calculate string similarity using Levenshtein distance
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity score (0-1)
 */
const calculateStringSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix = [];
  
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
};

/**
 * Calculate date similarity (closer dates = higher similarity)
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} - Similarity score (0-1)
 */
const calculateDateSimilarity = (date1, date2) => {
  if (!date1 || !date2) return 0;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  const diffTime = Math.abs(d1 - d2);
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  // Same day = 1.0, within 7 days = 0.8, within 30 days = 0.5, within 90 days = 0.2
  if (diffDays === 0) return 1;
  if (diffDays <= 7) return 0.8;
  if (diffDays <= 30) return 0.5;
  if (diffDays <= 90) return 0.2;
  return 0;
};

/**
 * Calculate amount similarity (closer amounts = higher similarity)
 * @param {number} amount1 - First amount
 * @param {number} amount2 - Second amount
 * @returns {number} - Similarity score (0-1)
 */
const calculateAmountSimilarity = (amount1, amount2) => {
  if (amount1 === undefined || amount2 === undefined) return 0;
  if (amount1 === amount2) return 1;
  
  const diff = Math.abs(amount1 - amount2);
  const max = Math.max(amount1, amount2);
  
  if (max === 0) return 1;
  
  // Within 1% = 1.0, within 5% = 0.8, within 10% = 0.5, within 20% = 0.2
  const diffPercent = (diff / max) * 100;
  
  if (diffPercent <= 1) return 1;
  if (diffPercent <= 5) return 0.8;
  if (diffPercent <= 10) return 0.5;
  if (diffPercent <= 20) return 0.2;
  return 0;
};

/**
 * Detect duplicate invoice
 * @param {Object} invoiceData - New invoice data
 * @param {string} userId - User ID
 * @returns {Object} - Duplicate detection result
 */
const detectDuplicate = async (invoiceData, userId) => {
  const { vendorName, invoiceNumber, invoiceDate, totalAmount, currency, ocrRawText } = invoiceData;
  
  // Get all existing invoices for the user
  const existingInvoices = await Invoice.find({ userId }).sort({ createdAt: -1 });
  
  if (existingInvoices.length === 0) {
    return {
      isDuplicate: false,
      duplicateScore: 0,
      duplicateOfId: null,
    };
  }
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const existing of existingInvoices) {
    let score = 0;
    let factors = [];
    
    // Strong indicator: Exact invoice number match
    if (invoiceNumber && existing.extractedData?.invoiceNumber) {
      const invNumSimilarity = calculateStringSimilarity(invoiceNumber, existing.extractedData.invoiceNumber);
      if (invNumSimilarity === 1) {
        score += 40;
        factors.push({ factor: 'Invoice Number (exact)', weight: 40 });
      } else if (invNumSimilarity > 0.8) {
        score += 30;
        factors.push({ factor: 'Invoice Number (similar)', weight: 30 });
      }
    }
    
    // Strong indicator: Vendor name match
    if (vendorName && existing.extractedData?.vendorName) {
      const vendorSimilarity = calculateStringSimilarity(vendorName, existing.extractedData.vendorName);
      if (vendorSimilarity > 0.8) {
        score += 25;
        factors.push({ factor: 'Vendor Name', weight: 25 });
      } else if (vendorSimilarity > 0.5) {
        score += 10;
        factors.push({ factor: 'Vendor Name (partial)', weight: 10 });
      }
    }
    
    // Medium indicator: Amount match
    if (totalAmount !== undefined && existing.extractedData?.totalAmount !== undefined) {
      const amountSimilarity = calculateAmountSimilarity(totalAmount, existing.extractedData.totalAmount);
      if (amountSimilarity > 0.8) {
        score += 20;
        factors.push({ factor: 'Amount', weight: 20 });
      } else if (amountSimilarity > 0.5) {
        score += 10;
        factors.push({ factor: 'Amount (similar)', weight: 10 });
      }
    }
    
    // Medium indicator: Date match
    if (invoiceDate && existing.extractedData?.invoiceDate) {
      const dateSimilarity = calculateDateSimilarity(invoiceDate, existing.extractedData.invoiceDate);
      if (dateSimilarity > 0.5) {
        score += 10;
        factors.push({ factor: 'Invoice Date', weight: 10 });
      }
    }
    
    // Weak indicator: Currency match
    if (currency && existing.extractedData?.currency) {
      if (currency === existing.extractedData.currency) {
        score += 5;
        factors.push({ factor: 'Currency', weight: 5 });
      }
    }
    
    // Weak indicator: OCR text similarity
    if (ocrRawText && existing.ocrRawText) {
      const ocrSimilarity = calculateStringSimilarity(ocrRawText, existing.ocrRawText);
      if (ocrSimilarity > 0.7) {
        score += 15;
        factors.push({ factor: 'OCR Text', weight: 15 });
      }
    }
    
    // Update best match
    if (score > bestScore) {
      bestScore = score;
      bestMatch = {
        invoiceId: existing._id,
        score,
        factors,
      };
    }
  }
  
  // Threshold for duplicate: 50 points
  const isDuplicate = bestScore >= 50;
  
  // Cap the score at 100 to comply with schema maximum
  const finalScore = Math.min(100, bestScore);
  
  return {
    isDuplicate,
    duplicateScore: finalScore,
    duplicateOfId: isDuplicate ? bestMatch.invoiceId : null,
    matchDetails: bestMatch,
  };
};

module.exports = {
  detectDuplicate,
};
