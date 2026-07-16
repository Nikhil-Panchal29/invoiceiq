import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useInvoices } from '@/hooks/useInvoices';
import { TopNav, type DashboardTab } from '@/components/invoices';
import { GlassCard } from '@/components/invoices';
import { ROUTES } from '@/routes/paths';
import { formatInvoiceAmount } from '@/lib/invoiceMetrics';
import { useState, useEffect } from 'react';
import { Mail, AlertCircle, FileText, CheckCircle, Clock } from 'lucide-react';
import api from '@/api/axios';

export const DashboardOverviewPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { metrics, isLoading } = useInvoices();
  const [reminderStats, setReminderStats] = useState<any>(null);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  const handleUploadClick = () => {
    navigate(ROUTES.DASHBOARD_INVOICES);
  };

  useEffect(() => {
    const fetchReminderStats = async () => {
      try {
        const response = await api.get('/reminders/stats/summary');
        setReminderStats(response.data.data);
      } catch (error) {
        console.error('Failed to fetch reminder stats:', error);
      }
    };

    fetchReminderStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7F5] to-[#EAE0CF]/30">
        <TopNav
          activeTab="dashboard"
          userName={user?.name}
          onLogout={handleLogout}
          onUploadClick={handleUploadClick}
        />
        <main className="w-full max-w-7xl md:max-w-[95%] lg:max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="space-y-8">
            <div className="h-10 bg-[#EFEABB]/50 rounded-xl animate-pulse w-64"></div>
            <div className="h-5 bg-[#EFEABB]/50 rounded-xl w-96 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-[#EFEABB]/50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (metrics.totalInvoices === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7F5] to-[#EAE0CF]/30">
        <TopNav
          activeTab="dashboard"
          userName={user?.name}
          onLogout={handleLogout}
          onUploadClick={handleUploadClick}
        />
        <main className="w-full max-w-7xl md:max-w-[95%] lg:max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <GlassCard>
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-[#EAE0CF] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#558467]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-[#17433F] mb-2">No invoices yet</h2>
              <p className="text-sm text-[#43637E] mb-8 max-w-md mx-auto">Upload your first invoice to get started with AI-powered invoice management.</p>
              <button
                onClick={handleUploadClick}
                className="px-5 py-2.5 bg-[#17433F] text-white font-medium rounded-xl hover:bg-[#558467] transition-all"
              >
                Upload Invoice
              </button>
            </div>
          </GlassCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7F5] to-[#EAE0CF]/30">
      <TopNav
        activeTab="dashboard"
        userName={user?.name}
        onLogout={handleLogout}
        onUploadClick={handleUploadClick}
      />

      <main className="w-full max-w-7xl md:max-w-[95%] lg:max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-1 mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#17433F] tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#43637E]">
            Overview of your invoice processing and AI audit results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassCard>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#43637E] uppercase tracking-wider">Total Invoices</p>
                <p className="text-2xl sm:text-3xl font-semibold text-[#17433F]">{metrics.totalInvoices}</p>
              </div>
              <div className="p-2 bg-[#EAE0CF] rounded-lg">
                <FileText size={20} className="text-[#78A4CB]" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#43637E] uppercase tracking-wider">Paid</p>
                <p className="text-2xl sm:text-3xl font-semibold text-[#558467]">{metrics.paidInvoices}</p>
              </div>
              <div className="p-2 bg-[#EAE0CF] rounded-lg">
                <CheckCircle size={20} className="text-[#558467]" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#43637E] uppercase tracking-wider">Pending</p>
                <p className="text-2xl sm:text-3xl font-semibold text-[#78A4CB]">{metrics.pendingInvoices}</p>
              </div>
              <div className="p-2 bg-[#EFEABB]/50 rounded-lg">
                <Clock size={20} className="text-[#78A4CB]" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#43637E] uppercase tracking-wider">Overdue</p>
                <p className="text-2xl sm:text-3xl font-semibold text-[#4B1426]">{metrics.overdueInvoices}</p>
              </div>
              <div className="p-2 bg-[#EFEABB]/50 rounded-lg">
                <AlertCircle size={20} className="text-[#4B1426]" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Reminder Widget */}
        {reminderStats && (
          <GlassCard className="mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#EAE0CF] rounded-lg">
                  <Mail className="w-5 h-5 text-[#78A4CB]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#17433F]">Payment Reminders</h3>
                  <p className="text-xs text-[#43637E]">Track and manage invoice reminders</p>
                </div>
              </div>
              <button
                onClick={() => navigate(ROUTES.DASHBOARD_REMINDERS)}
                className="px-4 py-2 bg-[#17433F] text-white rounded-lg hover:bg-[#558467] transition-all text-sm font-medium flex-shrink-0"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-[#EAE0CF] rounded-lg p-4">
                <p className="text-xs text-[#43637E] mb-1">Overdue Invoices</p>
                <p className="text-2xl font-semibold text-[#17433F]">{reminderStats.overdueInvoices}</p>
              </div>
              <div className="bg-[#EAE0CF] rounded-lg p-4">
                <p className="text-xs text-[#43637E] mb-1">Sent Today</p>
                <p className="text-2xl font-semibold text-[#558467]">{reminderStats.sentToday}</p>
              </div>
              <div className="bg-[#EAE0CF] rounded-lg p-4">
                <p className="text-xs text-[#43637E] mb-1">Pending</p>
                <p className="text-2xl font-semibold text-[#78A4CB]">{reminderStats.pending}</p>
              </div>
              <div className="bg-[#EAE0CF] rounded-lg p-4">
                <p className="text-xs text-[#43637E] mb-1">Failed</p>
                <p className="text-2xl font-semibold text-[#4B1426]">{reminderStats.failed}</p>
              </div>
            </div>
          </GlassCard>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GlassCard title="AI Validation Score">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#43637E]">Average Score</span>
                <span className="text-3xl font-semibold text-[#17433F]">{metrics.averageValidationScore}%</span>
              </div>
              <div className="h-2 bg-[#EFEABB]/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#558467] rounded-full transition-all"
                  style={{ width: `${metrics.averageValidationScore}%` }}
                />
              </div>
            </div>
          </GlassCard>

          <GlassCard title="High Risk Alerts">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#43637E]">High Risk Invoices</span>
                <span className="text-3xl font-semibold text-[#4B1426]">{metrics.highRiskCount}</span>
              </div>
              {metrics.riskAlerts.length > 0 && (
                <div className="space-y-2">
                  {metrics.riskAlerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-2 text-sm">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-[#4B1426] flex-shrink-0" />
                      <div>
                        <p className="font-medium text-[#17433F]">{alert.vendorName}</p>
                        <p className="text-[#43637E]">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        <GlassCard title="Amounts by Currency" className="mb-8">
          <div className="space-y-3">
            {Object.entries(metrics.amountsByCurrency).map(([currency, amount]) => (
              <div key={currency} className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-[#43637E]">{currency}</span>
                <span className="text-2xl font-semibold text-[#17433F]">
                  {formatInvoiceAmount(amount, currency)}
                </span>
              </div>
            ))}
            {Object.keys(metrics.amountsByCurrency).length === 0 && (
              <p className="text-sm text-[#43637E]">No amounts to display</p>
            )}
          </div>
        </GlassCard>
      </main>
    </div>
  );
};
