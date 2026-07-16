import api from './axios';
import type {
  InvoiceResponse,
  InvoicesResponse,
  UpdateInvoiceStatusResponse,
  UploadInvoiceResponse,
  BackendInvoiceStatus,
} from '@/types/invoice';

export const getInvoices = async (): Promise<InvoicesResponse> => {
  const { data } = await api.get<InvoicesResponse>('/invoices');
  return data;
};

export const getInvoice = async (id: string): Promise<InvoiceResponse> => {
  const { data } = await api.get<InvoiceResponse>(`/invoices/${id}`);
  return data;
};

export const uploadInvoice = async (file: File): Promise<UploadInvoiceResponse> => {
  const formData = new FormData();
  formData.append('invoice', file);

  const { data } = await api.post<UploadInvoiceResponse>('/invoices/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
};

export const updateInvoiceStatus = async (
  id: string,
  status: BackendInvoiceStatus,
): Promise<UpdateInvoiceStatusResponse> => {
  const { data } = await api.patch<UpdateInvoiceStatusResponse>(`/invoices/${id}/status`, {
    status,
  });
  return data;
};

export const updateInvoice = async (
  id: string,
  invoiceData: {
    vendorName?: string;
    invoiceNumber?: string;
    invoiceDate?: string;
    dueDate?: string;
    currency?: string;
    totalAmount?: number;
    gstNumber?: string;
    paymentTerms?: string;
    lineItems?: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
  },
): Promise<InvoiceResponse> => {
  const { data } = await api.put<InvoiceResponse>(`/invoices/${id}`, invoiceData);
  return data;
};

export const deleteInvoice = async (id: string): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.delete<{ success: boolean; message: string }>(`/invoices/${id}`);
  return data;
};

export const downloadInvoiceFile = async (id: string): Promise<void> => {
  const response = await api.get(`/invoices/${id}/download`, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `invoice-${id}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
