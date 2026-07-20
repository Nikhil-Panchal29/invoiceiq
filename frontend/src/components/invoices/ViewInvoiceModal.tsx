import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import api from '@/api/axios';

interface ViewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string | null;
  fileType: 'pdf' | 'image';
  fileName: string;
}

export const ViewInvoiceModal: React.FC<ViewInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoiceId,
  fileType,
  fileName,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
      if (!isOpen || !invoiceId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get(`/invoices/${invoiceId}/file`, {
          responseType: 'blob',
        });
        console.log("Header:", response.headers["content-type"]);
        console.log("Blob Type:", response.data.type);
        console.log("Blob Size:", response.data.size);

        const url = URL.createObjectURL(response.data);
        setBlobUrl(url);
      } catch (err) {
        setError('Failed to load file');
        console.error('Failed to fetch invoice file:', err);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchFile();

    // Cleanup blob URL when modal closes or unmounts
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
    };
  }, [isOpen, invoiceId]);

  // Open PDF in new tab on mobile
  useEffect(() => {
    if (blobUrl && fileType === 'pdf') {
      const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        window.open(blobUrl, '_blank');
      }
    }
  }, [blobUrl, fileType]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`View: ${fileName}`}>
      <div className="w-full h-[70vh]">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-[#6B7280] text-[15px]">Loading...</div>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-[#DC2626] text-[15px]">{error}</div>
          </div>
        )}
        {!isLoading && !error && blobUrl && (
          <>
            {fileType === 'pdf' ? (
              <iframe
                src={`${blobUrl}#toolbar=0`}
                className="w-full h-full border-0"
                title={fileName}
              />
            ) : (
              <img
                src={blobUrl}
                alt={fileName}
                className="w-full h-full object-contain"
              />
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
