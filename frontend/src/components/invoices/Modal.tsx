import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#17433F]/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gradient-to-br from-white to-[#EAE0CF]/20 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-[#EFEABB]">
        <div className="flex items-center justify-between p-6 border-b border-[#EFEABB]">
          <h2 className="text-xl font-semibold text-[#17433F]">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#EAE0CF] rounded-lg transition-colors"
          >
            <X size={20} className="text-[#43637E]" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
