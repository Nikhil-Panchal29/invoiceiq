import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { TopNav, type DashboardTab } from '@/components/invoices';
import { GlassCard } from '@/components/invoices';
import { StatusBadge } from '@/components/invoices';
import { RiskDots } from '@/components/invoices';
import { ValidationScore } from '@/components/invoices';
import { WorkflowTracker } from '@/components/invoices';
import { Modal, EditInvoiceModal, ViewInvoiceModal } from '@/components/invoices';
import * as invoiceService from '@/api/invoiceService';
import { getErrorMessage } from '@/api/axios';
import api from '@/api/axios';
import { ROUTES } from '@/routes/paths';
import { formatInvoiceAmount } from '@/lib/invoiceMetrics';
import type { ApiInvoice, BackendInvoiceStatus } from '@/types/invoice';
import { Mail } from 'lucide-react';

export const InvoiceDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [invoice, setInvoice] = useState<ApiInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReminderConfirm, setShowReminderConfirm] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderEmail, setReminderEmail] = useState('');
  const [reminderSubject, setReminderSubject] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  const handleUploadClick = () => {
    navigate(ROUTES.DASHBOARD_INVOICES);
  };

  const handleBack = () => {
    navigate(ROUTES.DASHBOARD_INVOICES);
  };

  const handleStatusChange = async (newStatus: BackendInvoiceStatus) => {
    if (!invoice || !id) return;

    setIsUpdating(true);
    try {
      await invoiceService.updateInvoiceStatus(id, newStatus);
      toast.success('Status updated successfully');
      // Refetch invoice to get updated data
      const response = await invoiceService.getInvoice(id);
      setInvoice(response.data);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to update status');
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditInvoice = async (data: any) => {
    if (!id) return;

    setIsUpdating(true);
    try {
      await invoiceService.updateInvoice(id, data);
      toast.success('Invoice updated successfully');
      setIsEditModalOpen(false);
      // Refetch invoice
      const response = await invoiceService.getInvoice(id);
      setInvoice(response.data);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to update invoice');
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!id) return;

    setIsDeleting(true);
    try {
      await invoiceService.deleteInvoice(id);
      toast.success('Invoice deleted successfully');
      navigate(ROUTES.DASHBOARD_INVOICES);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to delete invoice');
      toast.error(message);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!id) return;

    try {
      await invoiceService.downloadInvoiceFile(id);
      toast.success('Download started');
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to download invoice');
      toast.error(message);
    }
  };

  const handleSendReminder = async () => {
    if (!id) return;

    setIsSendingReminder(true);
    try {
      await api.post(`/reminders/${id}/send`, {
        recipientEmail: reminderEmail,
        subject: reminderSubject,
        message: reminderMessage,
      });

      toast.success('Reminder sent successfully');
      setShowReminderConfirm(false);
      // Refetch invoice to get updated recipientEmail
      const response = await invoiceService.getInvoice(id);
      setInvoice(response.data);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to send reminder');
      toast.error(message);
    } finally {
      setIsSendingReminder(false);
    }
  };

  const handleOpenReminderModal = () => {
    if (!invoice) return;
    setReminderEmail(invoice.recipientEmail || '');
    setReminderSubject(`Payment Reminder - Invoice ${invoice.extractedData.invoiceNumber || 'N/A'}`);
    setReminderMessage('This is a friendly reminder about your pending payment. Please review the invoice details and process the payment at your earliest convenience.');
    setShowReminderConfirm(true);
  };

  useEffect(() => {
    const handleWorkflowAdvance = (event: CustomEvent) => {
      const { nextStatus } = event.detail;
      handleStatusChange(nextStatus);
    };

    window.addEventListener('workflowAdvance', handleWorkflowAdvance as EventListener);

    return () => {
      window.removeEventListener('workflowAdvance', handleWorkflowAdvance as EventListener);
    };
  }, [invoice, id]);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) {
        setError('Invoice ID is required');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await invoiceService.getInvoice(id);
        setInvoice(response.data);
      } catch (err) {
        const message = getErrorMessage(err, 'Failed to load invoice.');
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchInvoice();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7F5] to-[#558467]/20">
        <TopNav
          activeTab="invoices"
          userName={user?.name}
          onLogout={handleLogout}
          onUploadClick={handleUploadClick}
        />
        <main className="w-full max-w-7xl md:max-w-[95%] lg:max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="space-y-6">
            <div className="h-10 bg-[#EFEABB]/50 rounded-xl w-64 animate-pulse"></div>
            <div className="h-48 bg-[#EFEABB]/50 rounded-xl animate-pulse"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 bg-[#EFEABB]/50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7F5] to-[#558467]/20">
        <TopNav
          activeTab="invoices"
          userName={user?.name}
          onLogout={handleLogout}
          onUploadClick={handleUploadClick}
        />
        <main className="w-full max-w-7xl md:max-w-[95%] lg:max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <GlassCard>
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold text-[#17433F] mb-2">Invoice Not Found</h2>
              <p className="text-sm text-[#43637E] mb-8">{error || 'The invoice you are looking for does not exist.'}</p>
              <button
                onClick={handleBack}
                className="px-5 py-2.5 bg-[#17433F] text-white font-medium rounded-xl hover:bg-[#558467] transition-all"
              >
                Back to Invoices
              </button>
            </div>
          </GlassCard>
        </main>
      </div>
    );
  }

  const { extractedData, aiInsights } = invoice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7F5] to-[#558467]/20">
      <TopNav
        activeTab="invoices"
        userName={user?.name}
        onLogout={handleLogout}
        onUploadClick={handleUploadClick}
      />

      <main className="w-full max-w-7xl md:max-w-[95%] lg:max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-[#43637E] hover:text-[#17433F] transition-colors"
          >
            <span>←</span>
            <span className="font-medium text-sm">Back to Invoices</span>
          </button>
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <button
              onClick={() => setIsViewModalOpen(true)}
              className="px-3 py-2 border border-[#EFEABB] text-[#17433F] rounded-lg hover:bg-[#EAE0CF] transition-colors font-medium text-sm"
            >
              View Original
            </button>
            <button
              onClick={handleDownloadInvoice}
              className="px-3 py-2 border border-[#EFEABB] text-[#17433F] rounded-lg hover:bg-[#EAE0CF] transition-colors font-medium text-sm"
            >
              Download
            </button>
            {(invoice.status === 'approved' || invoice.status === 'overdue') && (
              <button
                onClick={handleOpenReminderModal}
                disabled={isSendingReminder}
                className="px-4 py-2 border border-[#78A4CB]/20 text-[#78A4CB] rounded-lg hover:bg-[#EAE0CF] transition-colors font-medium text-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail size={16} />
                <span>{isSendingReminder ? 'Sending...' : 'Send Reminder'}</span>
              </button>
            )}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 bg-[#17433F] text-white rounded-lg hover:bg-[#558467] transition-colors font-medium text-sm"
            >
              Edit Invoice
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 border border-[#4B1426]/20 text-[#4B1426] rounded-lg hover:bg-[#EFEABB]/50 transition-colors font-medium text-sm"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Header */}
          <GlassCard>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-[#17433F] tracking-tight">
                  {extractedData?.invoiceNumber || invoice.fileName}
                </h1>
                <p className="text-sm text-[#43637E] mt-1">{extractedData?.vendorName || 'Unknown Vendor'}</p>
              </div>
              <div className="flex items-center space-x-3">
                <StatusBadge status={invoice.status} />
                <RiskDots risk={aiInsights?.riskLevel?.toLowerCase() as any || 'low'} />
              </div>
            </div>
          </GlassCard>

          {/* Financial Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard title="Financial Details">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-[#EFEABB]">
                  <span className="text-sm text-[#43637E]">Total Amount</span>
                  <span className="text-xl font-semibold text-[#17433F]">
                    {formatInvoiceAmount(extractedData?.totalAmount ?? 0, extractedData?.currency || 'USD')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#EFEABB]">
                  <span className="text-sm text-[#43637E]">Subtotal</span>
                  <span className="font-medium text-[#17433F] text-sm">
                    {formatInvoiceAmount(extractedData?.subtotal ?? 0, extractedData?.currency || 'USD')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#EFEABB]">
                  <span className="text-sm text-[#43637E]">Tax / GST</span>
                  <span className="font-medium text-[#17433F] text-sm">
                    {formatInvoiceAmount(extractedData?.taxAmount ?? 0, extractedData?.currency || 'USD')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-[#43637E]">GST Number</span>
                  <span className="font-medium text-[#17433F] text-sm">{extractedData?.gstNumber || '—'}</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard title="Invoice Information">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-[#EFEABB]">
                  <span className="text-sm text-[#43637E]">Invoice Date</span>
                  <span className="font-medium text-[#17433F] text-sm">
                    {extractedData?.invoiceDate ? new Date(extractedData.invoiceDate).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#EFEABB]">
                  <span className="text-sm text-[#43637E]">Due Date</span>
                  <span className="font-medium text-[#17433F] text-sm">
                    {extractedData?.dueDate ? new Date(extractedData.dueDate).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#EFEABB]">
                  <span className="text-sm text-[#43637E]">Payment Terms</span>
                  <span className="font-medium text-[#17433F] text-sm">{extractedData?.paymentTerms || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#EFEABB]">
                  <span className="text-sm text-[#43637E]">Invoice Type</span>
                  <span className="font-medium text-[#17433F] text-sm">{extractedData?.invoiceType || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-[#43637E]">Status</span>
                  <span className="font-medium text-[#17433F] text-sm capitalize">{invoice.status}</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* AI Analysis */}
          <GlassCard title="AI Analysis">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#43637E]">Validation Score</span>
                <ValidationScore score={aiInsights?.validationScore || 0} />
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#EFEABB]">
                <span className="text-sm text-[#43637E]">Risk Level</span>
                <span className="font-medium text-[#17433F] text-sm capitalize">{aiInsights?.riskLevel || 'Low'}</span>
              </div>
              {aiInsights?.category && (
                <div className="flex justify-between items-center py-3 border-b border-[#EFEABB]">
                  <span className="text-sm text-[#43637E]">Category</span>
                  <span className="font-medium text-[#17433F] text-sm">{aiInsights.category}</span>
                </div>
              )}
              {aiInsights?.summary && (
                <div className="py-3">
                  <span className="text-sm text-[#43637E] block mb-2">Summary</span>
                  <p className="text-[#17433F] text-sm">{aiInsights.summary}</p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Workflow Tracker */}
          <GlassCard title="Invoice Workflow">
            <WorkflowTracker currentStatus={invoice.status} />
          </GlassCard>

          {/* Duplicate Analysis */}
          {aiInsights?.isDuplicate && (
            <GlassCard title="Duplicate Analysis">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-[#EFEABB]">
                  <span className="text-sm text-[#43637E]">Similarity Score</span>
                  <span className="font-medium text-[#17433F] text-sm">{aiInsights?.duplicateScore || 0}%</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#EFEABB]">
                  <span className="text-sm text-[#43637E]">Original Invoice ID</span>
                  <span className="font-medium text-[#17433F] text-sm">{aiInsights?.duplicateOfId || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-[#43637E]">Original Upload Date</span>
                  <span className="font-medium text-[#17433F] text-sm">
                    {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Line Items */}
          {extractedData?.lineItems && extractedData.lineItems.length > 0 && (
            <GlassCard title="Line Items">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#EFEABB]">
                      <th className="px-4 py-3 text-xs font-bold text-[#17433F] uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-[#17433F] uppercase tracking-wider text-right">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-[#17433F] uppercase tracking-wider text-right">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-[#17433F] uppercase tracking-wider text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEABB]">
                    {extractedData.lineItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-[#17433F]">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-[#17433F] text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-[#17433F] text-right">
                          {formatInvoiceAmount(item.unitPrice, extractedData?.currency || 'USD')}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-[#17433F] text-right">
                          {formatInvoiceAmount(item.total, extractedData?.currency || 'USD')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {/* Warnings */}
          {aiInsights?.warnings && aiInsights.warnings.length > 0 && (
            <GlassCard title="Warnings">
              <div className="space-y-2">
                {aiInsights.warnings.map((warning, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-[#EFEABB]/50 rounded-lg">
                    <div className="w-2 h-2 mt-2 rounded-full bg-[#4B1426] flex-shrink-0" />
                    <p className="text-sm text-[#4B1426]">{warning}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* File Information */}
          <GlassCard title="File Information">
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-[#EFEABB]">
                <span className="text-[#43637E]">File Name</span>
                <span className="font-medium text-[#17433F]">{invoice.fileName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#EFEABB]">
                <span className="text-[#43637E]">File Type</span>
                <span className="font-medium text-[#17433F] capitalize">{invoice.fileType}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[#43637E]">Uploaded</span>
                <span className="font-medium text-[#17433F]">
                  {new Date(invoice.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>

      {/* Edit Invoice Modal */}
      <EditInvoiceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        invoice={invoice}
        onSave={handleEditInvoice}
        isLoading={isUpdating}
      />

      {/* View Invoice Modal */}
      <ViewInvoiceModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        invoiceId={id || ''}
        fileType={invoice.fileType}
        fileName={invoice.fileName}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Invoice">
          <div className="space-y-4">
            <p className="text-[#17433F]">This action cannot be undone. Are you sure you want to delete this invoice?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-[#EFEABB] text-[#17433F] rounded-lg hover:bg-[#EAE0CF] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteInvoice}
                disabled={isDeleting}
                className="px-4 py-2 bg-[#4B1426] text-white rounded-lg hover:bg-[#321E48] transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reminder Confirmation Modal */}
      {showReminderConfirm && (
        <Modal isOpen={showReminderConfirm} onClose={() => setShowReminderConfirm(false)} title="Send Payment Reminder">
          <div className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#17433F] mb-1">
                  Recipient Email <span className="text-[#4B1426]">*</span>
                </label>
                <input
                  type="email"
                  value={reminderEmail}
                  onChange={(e) => setReminderEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  disabled={isSendingReminder}
                  className="w-full px-3 py-2 border border-[#EFEABB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#78A4CB] disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#17433F] mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={reminderSubject}
                  onChange={(e) => setReminderSubject(e.target.value)}
                  disabled={isSendingReminder}
                  className="w-full px-3 py-2 border border-[#EFEABB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#78A4CB] disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#17433F] mb-1">
                  Message
                </label>
                <textarea
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  rows={4}
                  disabled={isSendingReminder}
                  className="w-full px-3 py-2 border border-[#EFEABB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#78A4CB] disabled:opacity-50 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-[#EFEABB]">
              <button
                onClick={() => setShowReminderConfirm(false)}
                disabled={isSendingReminder}
                className="px-4 py-2 border border-[#EFEABB] text-[#17433F] rounded-lg hover:bg-[#EAE0CF] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReminder}
                disabled={isSendingReminder || !reminderEmail}
                className="px-4 py-2 bg-[#428475] text-white rounded-lg hover:bg-[#356B5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingReminder ? 'Sending...' : 'Send Reminder'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
