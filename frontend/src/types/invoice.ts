export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export type RiskLevel = 'low' | 'medium' | 'high';

export type BackendInvoiceStatus =
  | 'uploaded'
  | 'processing'
  | 'extracted'
  | 'reviewed'
  | 'approved'
  | 'paid'
  | 'overdue';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ExtractedData {
  vendorName: string;
  invoiceNumber: string;
  invoiceDate?: string;
  dueDate?: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  currency: string;
  gstNumber: string;
  invoiceType: string;
  paymentTerms: string;
  lineItems: InvoiceLineItem[];
}

export interface AiInsights {
  category: string;
  categoryConfidence: number;
  categoryReason: string;
  isDuplicate: boolean;
  duplicateOfId: string | null;
  duplicateScore: number;
  summary: string;
  warnings: string[];
  validationScore: number;
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskReason: string;
  recommendations: string[];
}

export interface ApiInvoice {
  _id: string;
  userId: string;
  fileUrl: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  status: BackendInvoiceStatus;
  ocrRawText?: string;
  recipientEmail?: string;
  extractedData: ExtractedData;
  aiInsights: AiInsights;
  createdAt: string;
  updatedAt: string;
}

export interface InvoicesResponse {
  success: boolean;
  count: number;
  data: ApiInvoice[];
}

export interface InvoiceResponse {
  success: boolean;
  data: ApiInvoice;
}

export interface UploadInvoiceResponse {
  success: boolean;
  message: string;
  data: ApiInvoice;
}

export interface UpdateInvoiceStatusResponse {
  success: boolean;
  data: ApiInvoice;
}

/** UI model consumed by MagicPath dashboard components */
export interface DashboardInvoice {
  id: string;
  vendor: {
    name: string;
    logo: string;
  };
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  statusLabel: string;
  risk: RiskLevel;
  aiScore: number;
  date: string;
  isDuplicate: boolean;
}

export interface InvoiceMetrics {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  averageValidationScore: number;
  highRiskCount: number;
  amountsByCurrency: Record<string, number>;
  riskAlerts: Array<{
    id: string;
    vendorName: string;
    message: string;
    riskLevel: RiskLevel;
  }>;
}
