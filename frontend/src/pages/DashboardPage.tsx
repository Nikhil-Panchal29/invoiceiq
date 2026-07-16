import { useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useInvoices } from '@/hooks/useInvoices';
import {
  DashboardEmptyState,
  DashboardSkeleton,
  InvoiceManagement,
} from '@/components/invoices';
import { exportInvoicesToCsv } from '@/lib/invoiceMetrics';
import { ROUTES } from '@/routes/paths';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { invoices, isLoading, isUploading, uploadInvoiceFile } = useInvoices();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported file type');
      return;
    }

    try {
      await uploadInvoiceFile(file);
    } catch {
      // Error toast handled in hook
    }
  };

  const handleExportCsv = () => {
    if (invoices.length === 0) {
      toast.error('No invoices available to export.');
      return;
    }

    exportInvoicesToCsv(invoices);
    toast.success('Invoice export started.');
  };

  const handleNewInvoice = () => {
    handleUploadClick();
  };

  const handleInvoiceClick = (id: string) => {
    navigate(ROUTES.DASHBOARD_INVOICE_DETAILS.replace(':id', id));
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (invoices.length === 0) {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <DashboardEmptyState
          userName={user?.name}
          onLogout={handleLogout}
          onUploadClick={handleUploadClick}
        />
      </>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <InvoiceManagement
        invoices={invoices}
        activeTab="invoices"
        userName={user?.name}
        onLogout={handleLogout}
        onExportCsv={handleExportCsv}
        onNewInvoice={handleNewInvoice}
        onUploadClick={handleUploadClick}
        onInvoiceClick={handleInvoiceClick}
      />
      {isUploading && (
        <div className="fixed inset-0 z-[100] bg-white/40 backdrop-blur-[1px] pointer-events-none" />
      )}
    </>
  );
};
