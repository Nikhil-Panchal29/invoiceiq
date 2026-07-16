import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import * as invoiceService from '@/api/invoiceService';
import { getErrorMessage } from '@/api/axios';
import {
  calculateInvoiceMetrics,
  mapApiInvoicesToDashboard,
} from '@/lib/invoiceMetrics';
import type { ApiInvoice, BackendInvoiceStatus, DashboardInvoice, InvoiceMetrics } from '@/types/invoice';

interface UseInvoicesResult {
  rawInvoices: ApiInvoice[];
  invoices: DashboardInvoice[];
  metrics: InvoiceMetrics;
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  uploadInvoiceFile: (file: File) => Promise<void>;
  updateStatus: (id: string, status: BackendInvoiceStatus) => Promise<void>;
}

export const useInvoices = (): UseInvoicesResult => {
  const [rawInvoices, setRawInvoices] = useState<ApiInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await invoiceService.getInvoices();
      setRawInvoices(response.data);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to load invoices.');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const uploadInvoiceFile = useCallback(
    async (file: File) => {
      setIsUploading(true);

      try {
        const response = await invoiceService.uploadInvoice(file);
        toast.success(response.message || 'Invoice uploaded successfully.');
        await refetch();
      } catch (err) {
        const message = getErrorMessage(err, 'Failed to upload invoice.');
        toast.error(message);
        throw new Error(message);
      } finally {
        setIsUploading(false);
      }
    },
    [refetch],
  );

  const updateStatus = useCallback(
    async (id: string, status: BackendInvoiceStatus) => {
      try {
        await invoiceService.updateInvoiceStatus(id, status);
        toast.success('Invoice status updated.');
        await refetch();
      } catch (err) {
        const message = getErrorMessage(err, 'Failed to update invoice status.');
        toast.error(message);
        throw new Error(message);
      }
    },
    [refetch],
  );

  const invoices = useMemo(() => mapApiInvoicesToDashboard(rawInvoices), [rawInvoices]);
  const metrics = useMemo(() => calculateInvoiceMetrics(rawInvoices), [rawInvoices]);

  return {
    rawInvoices,
    invoices,
    metrics,
    isLoading,
    isUploading,
    error,
    refetch,
    uploadInvoiceFile,
    updateStatus,
  };
};
