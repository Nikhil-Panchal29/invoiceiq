import { TopNav } from './TopNav';
import { GlassCard } from './GlassCard';

export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#F7F8F6]">
      <TopNav activeTab="invoices" userName="Loading..." />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="space-y-3">
            <div className="h-10 w-48 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-5 w-72 bg-slate-100 rounded-lg animate-pulse" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-11 w-32 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-11 w-36 bg-[#EEF4F2] rounded-xl animate-pulse" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="h-12 w-full sm:max-w-md bg-slate-200 rounded-2xl animate-pulse" />
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="h-12 w-36 bg-slate-200 rounded-2xl animate-pulse" />
            <div className="h-12 w-36 bg-slate-200 rounded-2xl animate-pulse" />
            <div className="h-12 w-12 bg-slate-200 rounded-2xl animate-pulse" />
          </div>
        </div>

        <GlassCard className="p-0 border-none bg-white/60">
          <div className="px-6 py-4 border-b border-[#DCE5E2] bg-[#EEF4F2]/50">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-4 bg-slate-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
          <div className="divide-y divide-[#DCE5E2]">
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <div key={rowIndex} className="px-6 py-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                </div>
                <div className="h-4 w-20 bg-slate-200 rounded animate-pulse hidden md:block" />
                <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse hidden md:block" />
                <div className="h-4 w-12 bg-slate-200 rounded animate-pulse hidden lg:block" />
              </div>
            ))}
          </div>
        </GlassCard>
      </main>
    </div>
  );
};
