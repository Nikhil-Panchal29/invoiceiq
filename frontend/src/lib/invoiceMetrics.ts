import type {
  ApiInvoice,
  DashboardInvoice,
  InvoiceMetrics,
  InvoiceStatus,
  RiskLevel,
} from '@/types/invoice';

const vendorLogo = (seed: string): string =>
  `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed || 'vendor')}`;

const mapRiskLevel = (riskLevel?: string): RiskLevel => {
  const normalized = riskLevel?.toLowerCase();

  if (normalized === 'high') return 'high';
  if (normalized === 'medium') return 'medium';
  return 'low';
};

const mapFilterStatus = (status: ApiInvoice['status']): InvoiceStatus => {
  if (status === 'paid') return 'paid';
  if (status === 'overdue') return 'overdue';
  return 'pending';
};

const formatStatusLabel = (status: ApiInvoice['status']): string =>
  status.charAt(0).toUpperCase() + status.slice(1);

const formatDisplayDate = (invoice: ApiInvoice): string => {
  const rawDate =
    invoice.extractedData?.dueDate ||
    invoice.extractedData?.invoiceDate ||
    invoice.createdAt;

  if (!rawDate) return '—';

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return '—';

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

export const mapApiInvoiceToDashboard = (invoice: ApiInvoice): DashboardInvoice => {
  const vendorName = invoice.extractedData?.vendorName?.trim() || invoice.fileName || 'Unknown vendor';

  return {
    id: invoice._id,
    vendor: {
      name: vendorName,
      logo: vendorLogo(vendorName),
    },
    invoiceNumber: invoice.extractedData?.invoiceNumber?.trim() || invoice.fileName,
    amount: invoice.extractedData?.totalAmount ?? 0,
    currency: invoice.extractedData?.currency || 'USD',
    status: mapFilterStatus(invoice.status),
    statusLabel: formatStatusLabel(invoice.status),
    risk: mapRiskLevel(invoice.aiInsights?.riskLevel),
    aiScore: Math.round(invoice.aiInsights?.validationScore ?? 0),
    date: formatDisplayDate(invoice),
    isDuplicate: invoice.aiInsights?.isDuplicate ?? false,
  };
};

export const mapApiInvoicesToDashboard = (invoices: ApiInvoice[]): DashboardInvoice[] =>
  invoices.map(mapApiInvoiceToDashboard);

export const calculateInvoiceMetrics = (invoices: ApiInvoice[]): InvoiceMetrics => {
  const paidInvoices = invoices.filter((invoice) => invoice.status === 'paid').length;
  const overdueInvoices = invoices.filter((invoice) => invoice.status === 'overdue').length;
  // All other statuses (uploaded, processing, extracted, reviewed, approved) count as pending for UI
  const pendingInvoices = invoices.filter((invoice) =>
    invoice.status !== 'paid' && invoice.status !== 'overdue'
  ).length;

  const scoredInvoices = invoices.filter(
    (invoice) => (invoice.aiInsights?.validationScore ?? 0) > 0,
  );

  const averageValidationScore =
    scoredInvoices.length > 0
      ? Math.round(
          scoredInvoices.reduce(
            (sum, invoice) => sum + (invoice.aiInsights?.validationScore ?? 0),
            0,
          ) / scoredInvoices.length,
        )
      : 0;

  const highRiskCount = invoices.filter(
    (invoice) => invoice.aiInsights?.riskLevel?.toLowerCase() === 'high',
  ).length;

  // Group totals by currency instead of mixing them
  const amountsByCurrency: Record<string, number> = invoices.reduce(
    (acc, invoice) => {
      const currency = invoice.extractedData?.currency || 'USD';
      const amount = invoice.extractedData?.totalAmount ?? 0;
      acc[currency] = (acc[currency] || 0) + amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const riskAlerts = invoices
    .filter(
      (invoice) =>
        invoice.aiInsights?.riskLevel?.toLowerCase() === 'high' ||
        (invoice.aiInsights?.warnings?.length ?? 0) > 0 ||
        invoice.aiInsights?.isDuplicate,
    )
    .slice(0, 5)
    .map((invoice) => ({
      id: invoice._id,
      vendorName: invoice.extractedData?.vendorName || invoice.fileName,
      message:
        invoice.aiInsights?.isDuplicate
          ? 'Potential duplicate invoice detected.'
          : invoice.aiInsights?.riskReason ||
            invoice.aiInsights?.warnings?.[0] ||
            'Review recommended for this invoice.',
      riskLevel: mapRiskLevel(invoice.aiInsights?.riskLevel),
    }));

  return {
    totalInvoices: invoices.length,
    paidInvoices,
    pendingInvoices,
    overdueInvoices,
    averageValidationScore,
    highRiskCount,
    amountsByCurrency,
    riskAlerts,
  };
};

export const formatInvoiceAmount = (amount: number, currency = 'USD'): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
};

export const exportInvoicesToCsv = (invoices: DashboardInvoice[]): void => {
  const headers = ['Vendor', 'Invoice #', 'Amount', 'Status', 'Risk', 'AI Score', 'Due Date'];
  const rows = invoices.map((invoice) => [
    invoice.vendor.name,
    invoice.invoiceNumber,
    formatInvoiceAmount(invoice.amount, invoice.currency),
    invoice.statusLabel,
    invoice.risk,
    `${invoice.aiScore}%`,
    invoice.date,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoiceiq-invoices-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
