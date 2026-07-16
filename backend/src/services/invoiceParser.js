// ==========================================
// Invoice Parser — Regex-based field extractor
// Supports multiple invoice layouts
// ==========================================

// ==========================================
// Vendor Name Extraction
// ==========================================

const extractVendorName = (text) => {
    const patterns = [
      // "From: Acme Corp" / "Vendor: Acme Corp" / "Billed by: Acme"
      /(?:from|vendor|billed\s+by|seller|company|firm|issued\s+by)[:\s]+([A-Za-z0-9\s&.,'-]{2,60})/im,
      // First non-empty line that looks like a business name (all-caps or title case, 2–6 words)
      /^([A-Z][A-Za-z0-9\s&.,'-]{4,50})(?:\n|$)/m,
      // "Invoice from XYZ Ltd"
      /invoice\s+from\s+([A-Za-z0-9\s&.,'-]{2,50})/im,
    ];
  
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const cleaned = match[1].trim().replace(/\s+/g, ' ');
        // Reject generic words
        const blocked = ['invoice', 'bill', 'receipt', 'statement', 'tax', 'gst'];
        if (!blocked.some((w) => cleaned.toLowerCase() === w)) {
          return cleaned;
        }
      }
    }
  
    // Last fallback: first meaningful line of the document
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 3 && /[a-zA-Z]/.test(l));
  
    return lines[0] ? lines[0].substring(0, 60) : '';
  };
  
  // ==========================================
  // Invoice Number Extraction
  // ==========================================
  
  const extractInvoiceNumber = (text) => {
    const patterns = [
      /(?:invoice\s*(?:no|number|#|num|id))[:\s#]*([A-Z0-9\/_-]{3,30})/im,
      /(?:inv|bill|ref|receipt|order)\s*[:#]?\s*([A-Z0-9\/_-]{3,30})/im,
      /#\s*([A-Z0-9\/_-]{3,20})/im,
      /\bINV[-_]([A-Z0-9\/_-]{2,20})\b/im,
    ];
  
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim().toUpperCase();
      }
    }
    return '';
  };
  
  // ==========================================
  // Date Extraction helper
  // ==========================================
  
  const parseDate = (str) => {
    if (!str) return null;
    const cleaned = str.trim().replace(/[/\-.]/g, '-');
  
    // Try native Date parse for common formats
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d;
  
    // dd-mm-yyyy
    const ddmmyyyy = cleaned.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (ddmmyyyy) {
      return new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`);
    }
  
    // yyyy-mm-dd already handled by native Date
    return null;
  };
  
  const extractDate = (text, keywords) => {
    // Build regex: keyword followed by a date in multiple formats
    const kwPattern = keywords.join('|');
    const datePattern =
      `(?:${kwPattern})[:\\s]*` +
      `(\\d{1,2}[/\\-.\\s]\\d{1,2}[/\\-.\\s]\\d{2,4}` +
      `|\\d{4}[/\\-.\\s]\\d{1,2}[/\\-.\\s]\\d{1,2}` +
      `|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[.,\\s]+\\d{1,2}[,\\s]+\\d{4}` +
      `|\\d{1,2}[\\s]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\\s,]+\\d{4})`;
  
    const regex = new RegExp(datePattern, 'im');
    const match = text.match(regex);
    if (match && match[1]) {
      return parseDate(match[1]);
    }
    return null;
  };
  
  const extractInvoiceDate = (text) => {
    return extractDate(text, [
      'invoice\\s*date',
      'date\\s*of\\s*invoice',
      'issue\\s*date',
      'date\\s*issued',
      'billing\\s*date',
      'date',
    ]);
  };
  
  const extractDueDate = (text) => {
    return extractDate(text, [
      'due\\s*date',
      'payment\\s*due',
      'pay\\s*by',
      'payable\\s*by',
      'due\\s*on',
      'due',
    ]);
  };
  
  // ==========================================
  // Amount Extraction
  // ==========================================
  
  const extractAmount = (text) => {
    const patterns = [
      // "Total: ₹1,23,456.00" / "Total Amount: $1234.50"
      /(?:total\s*amount|grand\s*total|total\s*due|amount\s*due|total\s*payable|total)[:\s]*(?:INR|USD|EUR|GBP|₹|\$|€|£)?[\s]*([\d,]+(?:\.\d{1,2})?)/im,
      /(?:₹|\$|€|£|INR|USD|EUR|GBP)\s*([\d,]+(?:\.\d{1,2})?)/m,
      /(?:balance\s*due|net\s*total|net\s*payable)[:\s]*([\d,]+(?:\.\d{1,2})?)/im,
    ];
  
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(amount) && amount > 0) return amount;
      }
    }
    return 0;
  };
  
  // ==========================================
  // Currency Extraction
  // ==========================================
  
  const extractCurrency = (text) => {
    if (/₹|INR|Rs\.?/i.test(text)) return 'INR';
    if (/\$|USD/i.test(text)) return 'USD';
    if (/€|EUR/i.test(text)) return 'EUR';
    if (/£|GBP/i.test(text)) return 'GBP';
    if (/¥|JPY/i.test(text)) return 'JPY';
    if (/AED/i.test(text)) return 'AED';
    return 'INR'; // Default for Indian SME context
  };
  
  // ==========================================
  // Line Items Extraction
  // ==========================================
  
  const extractLineItems = (text) => {
    const items = [];
  
    // Match lines with: description + qty + price + total pattern
    // e.g., "Web Design  1  5000.00  5000.00"
    const linePattern =
      /^(.{5,50}?)\s{2,}(\d+(?:\.\d+)?)\s{2,}([\d,]+(?:\.\d{1,2})?)\s{2,}([\d,]+(?:\.\d{1,2})?)$/gm;
  
    let match;
    while ((match = linePattern.exec(text)) !== null) {
      const qty = parseFloat(match[2]);
      const unitPrice = parseFloat(match[3].replace(/,/g, ''));
      const total = parseFloat(match[4].replace(/,/g, ''));
  
      if (!isNaN(qty) && !isNaN(unitPrice) && !isNaN(total) && total > 0) {
        items.push({
          description: match[1].trim(),
          quantity: qty,
          unitPrice,
          total,
        });
      }
    }
  
    // Simpler fallback: lines with just description + amount
    if (items.length === 0) {
      const simplePattern =
        /^([A-Za-z][A-Za-z0-9\s()\/_-]{4,60})\s{2,}(?:₹|\$|€)?[\s]*([\d,]+(?:\.\d{1,2})?)$/gm;
  
      while ((match = simplePattern.exec(text)) !== null) {
        const total = parseFloat(match[2].replace(/,/g, ''));
        const desc = match[1].trim();
        const blocked = [
          'total', 'subtotal', 'tax', 'gst', 'vat', 'discount', 'grand total', 'amount due',
        ];
  
        if (!isNaN(total) && total > 0 && !blocked.some((b) => desc.toLowerCase().includes(b))) {
          items.push({
            description: desc,
            quantity: 1,
            unitPrice: total,
            total,
          });
        }
      }
    }
  
    return items.slice(0, 20); // Cap at 20 line items
  };
  
  // ==========================================
  // Main Parser
  // ==========================================
  
  const parseInvoice = (rawText) => {
    if (!rawText || rawText.trim().length === 0) {
      return {
        vendorName: '',
        invoiceNumber: '',
        invoiceDate: null,
        dueDate: null,
        totalAmount: 0,
        currency: 'INR',
        lineItems: [],
      };
    }
  
    return {
      vendorName:    extractVendorName(rawText),
      invoiceNumber: extractInvoiceNumber(rawText),
      invoiceDate:   extractInvoiceDate(rawText),
      dueDate:       extractDueDate(rawText),
      totalAmount:   extractAmount(rawText),
      currency:      extractCurrency(rawText),
      lineItems:     extractLineItems(rawText),
    };
  };
  
  module.exports = { parseInvoice };
  