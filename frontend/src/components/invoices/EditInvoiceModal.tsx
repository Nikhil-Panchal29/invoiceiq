import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import type { ApiInvoice } from '@/types/invoice';

interface EditInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: ApiInvoice | null;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

export const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSave,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    vendorName: '',
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
    currency: 'USD',
    totalAmount: 0,
    gstNumber: '',
    paymentTerms: '',
    lineItems: [] as Array<{ description: string; quantity: number; unitPrice: number; total: number }>,
  });

  // Reset form when invoice changes
  useEffect(() => {
    if (invoice) {
      setFormData({
        vendorName: invoice.extractedData?.vendorName || '',
        invoiceNumber: invoice.extractedData?.invoiceNumber || '',
        invoiceDate: invoice.extractedData?.invoiceDate
          ? new Date(invoice.extractedData.invoiceDate).toISOString().split('T')[0]
          : '',
        dueDate: invoice.extractedData?.dueDate
          ? new Date(invoice.extractedData.dueDate).toISOString().split('T')[0]
          : '',
        currency: invoice.extractedData?.currency || 'USD',
        totalAmount: invoice.extractedData?.totalAmount || 0,
        gstNumber: invoice.extractedData?.gstNumber || '',
        paymentTerms: invoice.extractedData?.paymentTerms || '',
        lineItems: invoice.extractedData?.lineItems || [],
      });
    }
  }, [invoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, { description: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    const updated = [...formData.lineItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate total if quantity or unit price changes
    if (field === 'quantity' || field === 'unitPrice') {
      updated[index].total = updated[index].quantity * updated[index].unitPrice;
    }
    
    setFormData({ ...formData, lineItems: updated });
  };

  const removeLineItem = (index: number) => {
    setFormData({
      ...formData,
      lineItems: formData.lineItems.filter((_, i) => i !== index),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Invoice">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#17433F] mb-1.5">Vendor Name</label>
            <input
              type="text"
              value={formData.vendorName}
              onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
              className="w-full px-3 py-2 border border-[#EFEABB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#78A4CB]/10 focus:border-[#78A4CB] text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#17433F] mb-1.5">Invoice Number</label>
            <input
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              className="w-full px-3 py-2 border border-[#EFEABB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#78A4CB]/10 focus:border-[#78A4CB] text-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#17433F] mb-1.5">Invoice Date</label>
            <input
              type="date"
              value={formData.invoiceDate}
              onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
              className="w-full px-3 py-2 border border-[#EFEABB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#78A4CB]/10 focus:border-[#78A4CB] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#17433F] mb-1.5">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-[#EFEABB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#78A4CB]/10 focus:border-[#78A4CB] text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#17433F] mb-1.5">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-3 py-2 border border-[#EFEABB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#78A4CB]/10 focus:border-[#78A4CB] text-sm"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
              <option value="AED">AED</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#17433F] mb-1.5">Total Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-[#EFEABB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#78A4CB]/10 focus:border-[#78A4CB] text-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#17433F] mb-1.5">GST Number</label>
            <input
              type="text"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              className="w-full px-3 py-2 border border-[#EFEABB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#78A4CB]/10 focus:border-[#78A4CB] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#17433F] mb-1.5">Payment Terms</label>
            <input
              type="text"
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              className="w-full px-3 py-2 border border-[#EFEABB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#78A4CB]/10 focus:border-[#78A4CB] text-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-medium text-[#17433F]">Line Items</label>
            <button
              type="button"
              onClick={addLineItem}
              className="text-xs text-[#17433F] hover:text-[#558467] font-medium"
            >
              + Add Item
            </button>
          </div>
          <div className="space-y-2">
            {formData.lineItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-start">
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                  className="col-span-12 sm:col-span-4 px-2 py-1.5 border border-[#EFEABB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#78A4CB]/10 focus:border-[#78A4CB]"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  className="col-span-3 sm:col-span-2 px-2 py-1.5 border border-[#EFEABB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#78A4CB]/10 focus:border-[#78A4CB]"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Unit Price"
                  value={item.unitPrice}
                  onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className="col-span-3 sm:col-span-2 px-2 py-1.5 border border-[#EFEABB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#78A4CB]/10 focus:border-[#78A4CB]"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Total"
                  value={item.total}
                  readOnly
                  className="col-span-3 sm:col-span-2 px-2 py-1.5 border border-[#EFEABB] rounded-lg text-xs bg-[#EAE0CF]"
                />
                <button
                  type="button"
                  onClick={() => removeLineItem(index)}
                  className="col-span-3 sm:col-span-2 px-2 py-1.5 text-[#4B1426] hover:bg-[#EAE0CF] rounded-lg text-xs font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-x-0 sm:space-x-3 space-y-2 sm:space-y-0 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-[#EFEABB] text-[#17433F] rounded-lg hover:bg-[#EAE0CF] transition-colors duration-150 disabled:opacity-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-[#17433F] text-white rounded-lg hover:bg-[#558467] transition-colors duration-150 disabled:opacity-50 text-sm font-medium"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
