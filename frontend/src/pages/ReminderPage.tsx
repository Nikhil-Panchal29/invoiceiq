import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { TopNav, type DashboardTab } from '@/components/invoices';
import { GlassCard } from '@/components/invoices';
import { ROUTES } from '@/routes/paths';
import api from '@/api/axios';
import { 
  Mail, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Filter,
  Search,
  Calendar,
  Info
} from 'lucide-react';

interface Reminder {
  _id: string;
  invoiceId: {
    _id: string;
    extractedData: {
      vendorName: string;
      invoiceNumber: string;
      totalAmount: number;
      currency: string;
    };
    status: string;
  } | null;
  recipientEmail: string;
  subject: string;
  type: 'manual' | 'automatic';
  status: 'pending' | 'sent' | 'failed';
  sentAt: string | null;
  createdAt: string;
  error?: string;
}

interface ReminderStats {
  total: number;
  sentToday: number;
  pending: number;
  failed: number;
  manual: number;
  automatic: number;
  overdueInvoices: number;
}

export const ReminderPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [stats, setStats] = useState<ReminderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: '',
  });
  const [searchDebounce, setSearchDebounce] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  const handleUploadClick = () => {
    navigate(ROUTES.DASHBOARD_INVOICES);
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchDebounce }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchDebounce]);

  const fetchReminders = useCallback(async () => {
    try {
      const params: any = {};
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      if (filters.search) params.search = filters.search;
      params.page = page;
      params.limit = 20;

      const response = await api.get('/reminders', { params });

      setReminders(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      toast.error('Failed to load reminders');
      console.error(error);
    }
  }, [filters.status, filters.type, filters.search, page]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/reminders/stats/summary');

      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchReminders(), fetchStats()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchReminders]);

  const handleResend = async (id: string) => {
    try {
      await api.post(`/reminders/${id}/resend`);

      toast.success('Reminder resent successfully');
      await Promise.all([fetchReminders(), fetchStats()]);
    } catch (error) {
      toast.error('Failed to resend reminder');
      console.error(error);
    }
  };

  const handleViewInvoice = (invoiceId: string) => {
    navigate(ROUTES.DASHBOARD_INVOICE_DETAILS.replace(':id', invoiceId));
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      sent: 'bg-[#558467] text-white',
      pending: 'bg-[#EFEABB]/50 text-[#78A4CB]',
      failed: 'bg-[#EFEABB]/50 text-[#4B1426]',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      manual: 'bg-[#EAE0CF] text-[#558467]',
      automatic: 'bg-[#EAE0CF] text-[#78A4CB]',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-700'}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number | undefined, currency: string | undefined) => {
    if (amount === undefined || amount === null) return 'N/A';
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      AED: 'د.إ',
    };
    const symbol = symbols[currency || ''] || currency || '';
    return `${symbol}${amount.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EAE0CF]/20 to-[#558467]/20">
        <TopNav
          activeTab="reminders"
          userName={user?.name}
          onLogout={handleLogout}
          onUploadClick={handleUploadClick}
        />
        <main className="w-full max-w-7xl md:max-w-[95%] lg:max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="space-y-6">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAE0CF]/20 to-[#558467]/20">
      <TopNav
        activeTab="reminders"
        userName={user?.name}
        onLogout={handleLogout}
        onUploadClick={handleUploadClick}
      />

      <main className="w-full max-w-7xl md:max-w-[95%] lg:max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-1 mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#17433F] tracking-tight">Reminders</h1>
          <p className="text-sm text-[#43637E]">
            Manage payment reminders for your invoices.
          </p>
        </div>

        {/* Workflow Explanation Card */}
        <GlassCard className="mb-8">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-[#EAE0CF] rounded-lg flex-shrink-0">
              <Info className="w-5 h-5 text-[#558467]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#17433F] mb-3 text-sm">How Reminders Work</h3>
              <div className="space-y-2 text-sm text-[#43637E]">
                <div className="flex items-start space-x-2">
                  <span className="font-medium text-[#17433F]">• Manual Reminder:</span>
                  <span>Sent immediately when you click "Send Reminder" on an invoice.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-medium text-[#17433F]">• Automatic Reminder:</span>
                  <span>Sent daily by the scheduler for invoices that qualify according to backend rules.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-medium text-[#17433F]">• Reminder History:</span>
                  <span>Every reminder sent is stored on this page for tracking.</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#43637E] uppercase tracking-wider">Total Reminders</p>
                    <p className="text-3xl font-semibold text-[#17433F] mt-1">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-[#EAE0CF] rounded-lg">
                    <Mail className="w-6 h-6 text-[#558467]" />
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#43637E] uppercase tracking-wider">Sent Today</p>
                    <p className="text-3xl font-semibold text-[#17433F] mt-1">{stats.sentToday}</p>
                  </div>
                  <div className="p-3 bg-[#EAE0CF] rounded-lg">
                    <Clock className="w-6 h-6 text-[#558467]" />
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#43637E] uppercase tracking-wider">Pending</p>
                    <p className="text-3xl font-semibold text-[#17433F] mt-1">{stats.pending}</p>
                  </div>
                  <div className="p-3 bg-[#EFEABB]/50 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-[#78A4CB]" />
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#43637E] uppercase tracking-wider">Failed</p>
                    <p className="text-3xl font-semibold text-[#17433F] mt-1">{stats.failed}</p>
                  </div>
                  <div className="p-3 bg-[#EFEABB]/50 rounded-lg">
                    <RefreshCw className="w-6 h-6 text-[#4B1426]" />
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* Filters */}
          <GlassCard className="p-4">
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#43637E]" />
                <span className="text-sm font-medium text-[#17433F]">Filters:</span>
              </div>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 border border-[#EFEABB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#78A4CB]/10 focus:border-[#78A4CB]"
              >
                <option value="">All Status</option>
                <option value="sent">Sent</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-3 py-2 border border-[#EFEABB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#78A4CB]/10 focus:border-[#78A4CB]"
              >
                <option value="">All Types</option>
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>

              <div className="flex-1 min-w-[200px] w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#43637E]" />
                  <input
                    type="text"
                    placeholder="Search by vendor or invoice..."
                    value={searchDebounce}
                    onChange={(e) => setSearchDebounce(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[#EFEABB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#78A4CB]/10 focus:border-[#78A4CB]"
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Reminders Table */}
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-[#EAE0CF]/30 border-b border-[#EFEABB]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#17433F] uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#17433F] uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#17433F] uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#17433F] uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#17433F] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#17433F] uppercase tracking-wider">
                      Sent Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#17433F] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEABB]">
                  {reminders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center text-[#43637E]">
                        <Mail className="w-12 h-12 mx-auto mb-4 text-[#43637E]" />
                        <p className="text-lg font-semibold text-[#17433F]">No reminders have been sent yet</p>
                        <p className="text-sm mt-1">Send a reminder from an invoice or wait for the automatic reminder scheduler</p>
                      </td>
                    </tr>
                  ) : (
                    reminders.map((reminder) => (
                      <tr key={reminder._id} className="hover:bg-[#EAE0CF]/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {reminder.invoiceId ? (
                            <>
                              <div className="text-sm font-medium text-[#17433F]">
                                {reminder.invoiceId.extractedData.invoiceNumber || 'N/A'}
                              </div>
                              <div className="text-xs text-[#43637E]">
                                {formatCurrency(
                                  reminder.invoiceId.extractedData.totalAmount,
                                  reminder.invoiceId.extractedData.currency
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="text-[13px] text-[#4B1426] italic">Invoice Deleted</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#17433F]">
                          {reminder.invoiceId?.extractedData.vendorName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#17433F]">
                          {reminder.recipientEmail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getTypeBadge(reminder.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(reminder.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#17433F]">
                          {formatDate(reminder.sentAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          {reminder.invoiceId ? (
                            <button
                              onClick={() => handleViewInvoice(reminder.invoiceId!._id)}
                              className="text-[#558467] hover:text-[#17433F] font-medium"
                            >
                              View
                            </button>
                          ) : (
                            <span className="text-[#43637E] italic">N/A</span>
                          )}
                          {reminder.status === 'failed' && (
                            <button
                              onClick={() => handleResend(reminder._id)}
                              className="text-[#558467] hover:text-[#17433F] font-medium"
                            >
                              Resend
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > 20 && (
              <div className="px-4 sm:px-6 py-4 border-t border-[#DDE7E4] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-xs text-[#475569]">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} reminders
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1.5 border border-[#DDE7E4] rounded-lg text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#EEF3F2] transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * 20 >= total}
                    className="px-3 py-1.5 border border-[#DDE7E4] rounded-lg text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#EEF3F2] transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </main>
    </div>
  );
};
