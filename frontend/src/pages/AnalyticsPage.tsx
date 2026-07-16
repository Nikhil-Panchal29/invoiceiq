import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useInvoices } from '@/hooks/useInvoices';
import { TopNav, type DashboardTab } from '@/components/invoices';
import { GlassCard } from '@/components/invoices';
import { ROUTES } from '@/routes/paths';
import { formatInvoiceAmount } from '@/lib/invoiceMetrics';
import { useState, useEffect } from 'react';
import { Mail, TrendingUp } from 'lucide-react';
import api from '@/api/axios';

export const AnalyticsPage = () => {
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
      <div className="min-h-screen bg-gradient-to-br from-[#EAE0CF]/20 to-[#17433F]/20">
        <TopNav
          activeTab="analytics"
          userName={user?.name}
          onLogout={handleLogout}
          onUploadClick={handleUploadClick}
        />
        <main className="w-full max-w-7xl md:max-w-[95%] lg:max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="space-y-6">
            <div className="h-10 bg-[#EFEABB]/50 rounded-xl animate-pulse w-64"></div>
            <div className="h-5 bg-[#EFEABB]/50 rounded-xl w-96 animate-pulse"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 bg-[#EFEABB]/50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (metrics.totalInvoices === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EAE0CF]/20 to-[#17433F]/20">
        <TopNav
          activeTab="analytics"
          userName={user?.name}
          onLogout={handleLogout}
          onUploadClick={handleUploadClick}
        />
        <main className="w-full max-w-7xl md:max-w-[95%] lg:max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <GlassCard>
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-[#EAE0CF] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#558467]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-[#17433F] mb-2">No analytics data yet</h2>
              <p className="text-sm text-[#43637E] mb-8 max-w-md mx-auto">Upload invoices to see detailed analytics and insights.</p>
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

  const statusDistribution = [
    { label: 'Paid', value: metrics.paidInvoices, color: 'bg-[#558467]' },
    { label: 'Pending', value: metrics.pendingInvoices, color: 'bg-[#78A4CB]' },
    { label: 'Overdue', value: metrics.overdueInvoices, color: 'bg-[#4B1426]' },
  ];

  const maxStatusValue = Math.max(...statusDistribution.map((s) => s.value), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAE0CF]/20 to-[#17433F]/20">
      <TopNav
        activeTab="analytics"
        userName={user?.name}
        onLogout={handleLogout}
        onUploadClick={handleUploadClick}
      />

      <main className="w-full max-w-7xl md:max-w-[95%] lg:max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-1 mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#17433F] tracking-tight">Analytics</h1>
          <p className="text-sm text-[#43637E]">
            Detailed insights into your invoice processing and AI audit performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <GlassCard title="Status Distribution">
            <div className="space-y-4">
              {statusDistribution.map((status) => (
                <div key={status.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[#17433F]">{status.label}</span>
                    <span className="text-[#43637E]">{status.value} invoices</span>
                  </div>
                  <div className="h-2 bg-[#EFEABB]/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${status.color} rounded-full transition-all`}
                      style={{ width: `${(status.value / maxStatusValue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard title="AI Validation Performance">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#43637E]">Average Validation Score</span>
                <span className="text-2xl sm:text-3xl font-semibold text-[#17433F]">{metrics.averageValidationScore}%</span>
              </div>
              <div className="h-2 bg-[#EFEABB]/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#558467] rounded-full transition-all"
                  style={{ width: `${metrics.averageValidationScore}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-[#558467]">{metrics.paidInvoices}</p>
                  <p className="text-xs text-[#43637E]">Validated</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-[#78A4CB]">{metrics.pendingInvoices}</p>
                  <p className="text-xs text-[#43637E]">In Review</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-[#4B1426]">{metrics.highRiskCount}</p>
                  <p className="text-xs text-[#43637E]">High Risk</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <GlassCard title="Total Processed">
            <div className="space-y-2">
              <p className="text-3xl font-semibold text-[#17433F]">{metrics.totalInvoices}</p>
              <p className="text-sm text-[#43637E]">Invoices</p>
            </div>
          </GlassCard>

          <GlassCard title="Amounts by Currency">
            <div className="space-y-3">
              {Object.entries(metrics.amountsByCurrency).map(([currency, amount]) => (
                <div key={currency} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#43637E]">{currency}</span>
                  <span className="text-lg font-semibold text-[#17433F]">
                    {formatInvoiceAmount(amount, currency)}
                  </span>
                </div>
              ))}
              {Object.keys(metrics.amountsByCurrency).length === 0 && (
                <p className="text-sm text-[#43637E]">No amounts to display</p>
              )}
            </div>
          </GlassCard>

          <GlassCard title="Risk Alerts">
            <div className="space-y-2">
              <p className="text-3xl font-semibold text-[#4B1426]">{metrics.highRiskCount}</p>
              <p className="text-sm text-[#43637E]">High Risk</p>
            </div>
          </GlassCard>
        </div>

        {metrics.riskAlerts.length > 0 && (
          <GlassCard title="Recent Risk Alerts">
            <div className="space-y-3">
              {metrics.riskAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 bg-[#EFEABB]/50 rounded-lg">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[#4B1426] flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-[#17433F] text-sm">{alert.vendorName}</p>
                    <p className="text-sm text-[#43637E]">{alert.message}</p>
                  </div>
                  <span className="text-xs font-medium text-[#4B1426] capitalize">{alert.riskLevel} Risk</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Reminder Metrics */}
        {reminderStats && (
          <GlassCard title="Reminder Analytics">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-[#EAE0CF] rounded-lg">
                  <Mail className="w-5 h-5 text-[#558467]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#17433F]">Payment Reminders</h3>
                  <p className="text-sm text-[#43637E]">Manual vs Automatic reminder performance</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#EAE0CF] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#43637E]">Manual</span>
                    <span className="text-2xl font-bold text-[#558467]">{reminderStats.manual}</span>
                  </div>
                  <div className="h-2 bg-[#EFEABB]/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#558467] rounded-full transition-all"
                      style={{ width: reminderStats.total > 0 ? `${(reminderStats.manual / reminderStats.total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
                <div className="bg-[#EAE0CF] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#43637E]">Automatic</span>
                    <span className="text-2xl font-bold text-[#78A4CB]">{reminderStats.automatic}</span>
                  </div>
                  <div className="h-2 bg-[#EFEABB]/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#78A4CB] rounded-full transition-all"
                      style={{ width: reminderStats.total > 0 ? `${(reminderStats.automatic / reminderStats.total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
                <div className="bg-[#EAE0CF] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#43637E]">Success Rate</span>
                    <span className="text-2xl font-bold text-[#43637E]">
                      {reminderStats.total > 0 ? `${Math.round(((reminderStats.total - reminderStats.failed) / reminderStats.total) * 100)}%` : '0%'}
                    </span>
                  </div>
                  <div className="h-2 bg-[#EFEABB]/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#43637E] rounded-full transition-all"
                      style={{ width: reminderStats.total > 0 ? `${((reminderStats.total - reminderStats.failed) / reminderStats.total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#EFEABB]">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#17433F]">{reminderStats.total}</p>
                  <p className="text-xs text-[#43637E]">Total Sent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#558467]">{reminderStats.sentToday}</p>
                  <p className="text-xs text-[#43637E]">Sent Today</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#78A4CB]">{reminderStats.pending}</p>
                  <p className="text-xs text-[#43637E]">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#4B1426]">{reminderStats.failed}</p>
                  <p className="text-xs text-[#43637E]">Failed</p>
                </div>
              </div>
            </div>
          </GlassCard>
        )}
      </main>
    </div>
  );
};
