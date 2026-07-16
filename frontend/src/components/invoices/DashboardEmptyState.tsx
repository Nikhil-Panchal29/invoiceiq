import { Upload } from 'lucide-react';
import { TopNav } from './TopNav';

interface DashboardEmptyStateProps {
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
  onUploadClick?: () => void;
}

export const DashboardEmptyState = ({
  userName,
  userAvatar,
  onLogout,
  onUploadClick,
}: DashboardEmptyStateProps) => {
  return (
    <div className="min-h-screen bg-[#F7F8F6]">
      <TopNav
        activeTab="invoices"
        userName={userName}
        userAvatar={userAvatar}
        onLogout={onLogout}
        onUploadClick={onUploadClick}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-3xl bg-[#EEF4F2] border border-[#DCE5E2] flex items-center justify-center mb-6 shadow-sm">
            <Upload size={36} className="text-[#86BCBD]" />
          </div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight mb-3">
            No invoices yet
          </h1>
          <p className="text-[#475569] font-medium max-w-md mb-8 leading-relaxed">
            Upload your first invoice to start AI-powered extraction, validation scoring, and risk
            analysis.
          </p>
          <button
            type="button"
            onClick={onUploadClick}
            className="flex items-center space-x-2 px-6 py-3 bg-[#BA5A5A] text-white font-semibold rounded-xl hover:bg-[#a04b4b] transition-all shadow-lg shadow-[#BA5A5A]/20 active:scale-95"
          >
            <Upload size={18} />
            <span>Upload your first invoice</span>
          </button>
        </div>
      </main>
    </div>
  );
};
