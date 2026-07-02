// ==========================================
// Category Service
// Keyword-based invoice classification
// ==========================================

const CATEGORY_MAP = {
    Software: {
      weight: 1.0,
      keywords: [
        'aws', 'amazon web services', 'azure', 'google cloud', 'gcp',
        'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'atlassian',
        'figma', 'sketch', 'adobe', 'notion', 'slack', 'zoom', 'teams',
        'microsoft 365', 'office 365', 'gsuite', 'google workspace',
        'salesforce', 'hubspot', 'zendesk', 'intercom', 'stripe',
        'twilio', 'sendgrid', 'mailchimp', 'netlify', 'vercel', 'heroku',
        'digitalocean', 'linode', 'cloudflare', 'datadog', 'sentry',
        'new relic', 'postman', 'software', 'saas', 'subscription',
        'license', 'api', 'cloud', 'hosting', 'domain', 'ssl',
      ],
    },
    Travel: {
      weight: 1.0,
      keywords: [
        'uber', 'ola', 'lyft', 'rapido', 'taxi', 'cab', 'auto',
        'airbnb', 'oyo', 'hotel', 'lodge', 'resort', 'accommodation',
        'flight', 'airline', 'air india', 'indigo', 'spicejet', 'makemytrip',
        'goibibo', 'yatra', 'irctc', 'train', 'bus', 'metro',
        'travel', 'trip', 'tour', 'visa', 'passport', 'fuel',
        'petrol', 'diesel', 'toll', 'parking', 'boarding',
      ],
    },
    Office: {
      weight: 1.0,
      keywords: [
        'stationery', 'printer', 'cartridge', 'paper', 'pen', 'pencil',
        'notebook', 'folder', 'office supplies', 'furniture', 'chair',
        'desk', 'whiteboard', 'projector', 'monitor', 'keyboard',
        'mouse', 'cable', 'rent', 'lease', 'coworking', 'workspace',
        'electricity', 'water', 'internet', 'broadband', 'telephone',
        'cleaning', 'maintenance', 'security', 'housekeeping',
      ],
    },
    Food: {
      weight: 1.0,
      keywords: [
        'zomato', 'swiggy', 'uber eats', 'dominos', 'domino', 'pizza',
        'mcdonald', 'kfc', 'burger', 'restaurant', 'cafe', 'coffee',
        'tea', 'lunch', 'dinner', 'breakfast', 'snack', 'catering',
        'food', 'meal', 'beverage', 'water bottle', 'canteen',
        'grocery', 'supermarket', 'bigbasket', 'blinkit', 'zepto',
      ],
    },
    Utilities: {
      weight: 1.0,
      keywords: [
        'electricity', 'electric', 'power', 'bescom', 'msedcl', 'tneb',
        'water', 'bwssb', 'gas', 'lpg', 'cylinder', 'indane', 'bharat gas',
        'hp gas', 'broadband', 'wifi', 'internet', 'bsnl', 'airtel fiber',
        'jio fiber', 'act fibernet', 'telephone', 'landline', 'municipal',
        'utility', 'bill payment',
      ],
    },
    Marketing: {
      weight: 1.0,
      keywords: [
        'facebook ads', 'google ads', 'instagram', 'twitter', 'linkedin',
        'youtube', 'meta ads', 'advertising', 'advertisement', 'ad spend',
        'promotion', 'campaign', 'seo', 'sem', 'content', 'copywriting',
        'branding', 'logo', 'banner', 'flyer', 'poster', 'print media',
        'radio', 'tv commercial', 'influencer', 'pr agency', 'public relations',
        'marketing', 'digital marketing', 'email marketing',
      ],
    },
    Medical: {
      weight: 1.0,
      keywords: [
        'hospital', 'clinic', 'doctor', 'physician', 'dentist',
        'pharmacy', 'medicine', 'drug', 'prescription', 'lab test',
        'diagnostic', 'xray', 'mri', 'scan', 'surgery', 'consultation',
        'medical', 'health', 'insurance', 'apollo', 'fortis', 'manipal',
        'max healthcare', 'medanta', 'narayana', 'ayush', 'therapy',
      ],
    },
    Entertainment: {
      weight: 1.0,
      keywords: [
        'netflix', 'amazon prime', 'hotstar', 'disney', 'sony liv',
        'zee5', 'voot', 'spotify', 'apple music', 'youtube premium',
        'movie', 'cinema', 'pvr', 'inox', 'bookmyshow', 'concert',
        'event', 'game', 'gaming', 'playstation', 'xbox', 'steam',
        'entertainment', 'subscription', 'streaming',
      ],
    },
    Hardware: {
      weight: 1.0,
      keywords: [
        'laptop', 'computer', 'pc', 'desktop', 'server', 'ram',
        'hard disk', 'ssd', 'nvme', 'processor', 'cpu', 'gpu',
        'motherboard', 'power supply', 'ups', 'router', 'switch',
        'ethernet', 'hdmi', 'usb hub', 'webcam', 'headset', 'microphone',
        'hardware', 'device', 'equipment', 'component', 'spare part',
        'mobile', 'smartphone', 'tablet', 'ipad', 'iphone', 'samsung',
      ],
    },
    Services: {
      weight: 1.0,
      keywords: [
        'consulting', 'consultant', 'advisory', 'freelance', 'freelancer',
        'development', 'developer', 'designer', 'design', 'web design',
        'app development', 'mobile app', 'backend', 'frontend',
        'accounting', 'bookkeeping', 'auditing', 'legal', 'lawyer',
        'attorney', 'ca ', 'chartered accountant', 'tax', 'gst filing',
        'recruitment', 'hr ', 'payroll', 'training', 'coaching',
        'services', 'professional services', 'project', 'contract',
      ],
    },
  };
  
  // ==========================================
  // Score a single category against text
  // ==========================================
  
  const scoreCategory = (text, keywords, weight) => {
    const lowerText = text.toLowerCase();
    let matchCount = 0;
    const matchedKeywords = [];
  
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        matchCount++;
        matchedKeywords.push(keyword);
      }
    }
  
    if (matchCount === 0) return { score: 0, matchedKeywords: [] };
  
    // Score: ratio of matched keywords, boosted by weight
    const rawScore = (matchCount / keywords.length) * weight;
    return { score: rawScore, matchedKeywords };
  };
  
  // ==========================================
  // Main categorize function
  // ==========================================
  
  const categorizeInvoice = (rawText, vendorName = '', lineItems = []) => {
    // Build a combined text corpus from all available fields
    const corpus = [
      rawText,
      vendorName,
      lineItems.map((li) => li.description || '').join(' '),
    ]
      .join(' ')
      .toLowerCase();
  
    let bestCategory = 'Others';
    let bestScore = 0;
    let bestKeywords = [];
  
    for (const [category, config] of Object.entries(CATEGORY_MAP)) {
      const { score, matchedKeywords } = scoreCategory(
        corpus,
        config.keywords,
        config.weight
      );
  
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
        bestKeywords = matchedKeywords;
      }
    }
  
    // Convert score to a 0–100 confidence value
    // Cap at 95 since keyword matching is never 100% certain
    const rawConfidence = Math.min(bestScore * 500, 95);
    const confidence = bestScore === 0 ? 0 : Math.max(Math.round(rawConfidence), 10);
  
    return {
      category: bestCategory,
      confidence,
      matchedKeywords: bestKeywords.slice(0, 5), // For debugging/display
    };
  };
  
  module.exports = { categorizeInvoice };
  