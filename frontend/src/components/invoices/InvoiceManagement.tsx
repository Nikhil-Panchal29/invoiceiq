import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  MoreHorizontal,
  ArrowUpDown,
  Calendar,
  Download,
  AlertTriangle,
} from 'lucide-react';
import type { DashboardInvoice } from '@/types/invoice';
import { formatInvoiceAmount } from '@/lib/invoiceMetrics';
import { TopNav, type DashboardTab } from './TopNav';
import { GlassCard } from './GlassCard';
import { StatusBadge } from './StatusBadge';
import { RiskDots } from './RiskDots';
import { ValidationScore } from './ValidationScore';

export interface InvoiceManagementProps {
  invoices?: DashboardInvoice[];
  activeTab?: DashboardTab;
  userName?: string;
  userAvatar?: string;
  onExportCsv?: () => void;
  onNewInvoice?: () => void;
  onLogout?: () => void;
  onUploadClick?: () => void;
  onInvoiceClick?: (id: string) => void;
}

export const InvoiceManagement: React.FC<InvoiceManagementProps> = ({
  invoices = [],
  activeTab = 'invoices',
  userName,
  userAvatar,
  onExportCsv,
  onNewInvoice,
  onLogout,
  onUploadClick,
  onInvoiceClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'All' || invoice.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesRisk =
        riskFilter === 'All' || invoice.risk.toLowerCase() === riskFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [invoices, searchQuery, statusFilter, riskFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7F5] to-[#EAE0CF]/30">
      <TopNav
        activeTab={activeTab}
        userName={userName}
        userAvatar={userAvatar}
        onLogout={onLogout}
        onUploadClick={onUploadClick}
      />

      <main className="w-full max-w-7xl md:max-w-[95%] lg:max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#17433F] tracking-tight">Invoices</h1>
            <p className="text-sm text-[#43637E]">
              Manage and track your vendor payments and AI audit results.
            </p>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <button
              type="button"
              onClick={onExportCsv}
              className="flex items-center space-x-2 px-3 py-2.5 sm:px-4 bg-white border border-[#EFEABB] text-[#17433F] font-medium rounded-lg hover:bg-[#EAE0CF] transition-all text-sm"
            >
              <Download size={18} />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={onNewInvoice}
              className="flex items-center space-x-2 px-3 py-2.5 sm:px-5 bg-[#17433F] text-white font-medium rounded-lg hover:bg-[#558467] transition-all text-sm"
            >
              <span>New Invoice</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-md">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#43637E]"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by vendor, invoice #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#EFEABB] rounded-lg focus:ring-2 focus:ring-[#78A4CB]/10 focus:border-[#78A4CB] outline-none transition-all text-[#17433F] placeholder:text-[#43637E] text-sm"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto flex-wrap gap-2">
            <div className="relative group">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-[#EFEABB] rounded-lg text-sm font-medium text-[#17433F] focus:ring-2 focus:ring-[#78A4CB]/10 focus:border-[#78A4CB] outline-none transition-all cursor-pointer w-full sm:w-auto"
              >
                <option value="All">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43637E] pointer-events-none group-hover:text-[#17433F] transition-colors"
                size={16}
              />
            </div>

            <div className="relative group">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-[#EFEABB] rounded-lg text-sm font-medium text-[#17433F] focus:ring-2 focus:ring-[#78A4CB]/10 focus:border-[#78A4CB] outline-none transition-all cursor-pointer w-full sm:w-auto"
              >
                <option value="All">All Risks</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43637E] pointer-events-none group-hover:text-[#17433F] transition-colors"
                size={16}
              />
            </div>

            <button
              type="button"
              className="p-2.5 bg-white border border-[#EFEABB] rounded-lg text-[#43637E] hover:text-[#17433F] hover:bg-[#EAE0CF] transition-colors"
            >
              <Calendar size={18} />
            </button>
          </div>
        </div>

        <GlassCard className="p-0 border-none bg-gradient-to-br from-white to-[#EAE0CF]/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#EAE0CF]/50">
                <tr className="border-b border-[#EFEABB]">
                  <th className="px-6 py-3 text-xs font-semibold text-[#17433F] uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-[#17433F] uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-[#17433F] uppercase tracking-wider">
                    <div className="flex items-center space-x-1 cursor-pointer hover:text-[#78A4CB] transition-colors">
                      <span>Amount</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-[#17433F] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-[#17433F] uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-[#17433F] uppercase tracking-wider">
                    AI Audit
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-[#17433F] uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEABB]">
                <AnimatePresence mode="popLayout">
                  {filteredInvoices.map((invoice) => (
                    <motion.tr
                      key={invoice.id}
                      layout
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      className="group hover:bg-[#EAE0CF] transition-colors cursor-pointer"
                      onClick={() => onInvoiceClick?.(invoice.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-[#EFEABB]/50 border border-[#EFEABB] flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img
                              src={invoice.vendor.logo}
                              alt={invoice.vendor.name}
                              className="w-5 h-5 object-contain"
                            />
                          </div>
                          <span className="font-medium text-sm text-[#17433F]">
                            {invoice.vendor.name}
                          </span>
                          {invoice.isDuplicate && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-[#EFEABB]/50 text-[#4B1426] text-xs font-medium rounded-full border border-[#4B1426]/20">
                              <AlertTriangle size={10} />
                              <span>Duplicate</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#43637E]">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-[#17433F]">
                          {formatInvoiceAmount(invoice.amount, invoice.currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={invoice.status} label={invoice.statusLabel} />
                      </td>
                      <td className="px-6 py-4">
                        <RiskDots risk={invoice.risk} />
                      </td>
                      <td className="px-6 py-4">
                        <ValidationScore score={invoice.aiScore} />
                      </td>
                      <td className="px-6 py-4 text-sm text-[#43637E]">
                        {invoice.date}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          className="p-2 text-[#43637E] hover:text-[#17433F] hover:bg-[#EAE0CF] rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>

                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-4 bg-[#EFEABB]/50 rounded-full">
                          <Search size={32} className="text-[#43637E]" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#17433F]">No invoices found</h3>
                        <p className="text-sm text-[#43637E] max-w-xs">
                          We couldn't find any invoices matching your current filters. Try adjusting
                          your search criteria.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('All');
                            setRiskFilter('All');
                          }}
                          className="text-[#17433F] font-medium text-sm hover:underline"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-[#EFEABB] bg-[#EAE0CF]/30">
            <span className="text-xs font-medium text-[#43637E]">
              Showing <span className="text-[#17433F]">{filteredInvoices.length}</span> of{' '}
              <span className="text-[#17433F]">{invoices.length}</span> entries
            </span>
            <div className="flex items-center space-x-1 flex-wrap gap-1">
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium text-[#43637E] hover:text-[#17433F] bg-white border border-[#EFEABB] rounded-lg transition-colors disabled:opacity-50"
                disabled
              >
                Previous
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium bg-[#17433F] text-white rounded-lg"
              >
                1
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium text-[#43637E] hover:text-[#17433F] hover:bg-[#EAE0CF] bg-white border border-[#EFEABB] rounded-lg transition-colors"
              >
                2
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium text-[#43637E] hover:text-[#17433F] hover:bg-[#EAE0CF] bg-white border border-[#EFEABB] rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </GlassCard>
      </main>
    </div>
  );
};
