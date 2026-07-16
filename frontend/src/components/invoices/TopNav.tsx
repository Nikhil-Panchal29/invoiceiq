import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, LayoutDashboard, FileText, Upload, BarChart3, LogOut, User, Settings, ChevronDown, Bot, Mail, Zap } from 'lucide-react';
import { ROUTES } from '@/routes/paths';
import { NavLink } from './NavLink';

export type DashboardTab = 'dashboard' | 'invoices' | 'upload' | 'analytics' | 'assistant' | 'reminders';

export interface TopNavProps {
  activeTab?: DashboardTab;
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
  onUploadClick?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab = 'dashboard',
  userName = 'User',
  userAvatar,
  onLogout,
  onUploadClick,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileMenu]);

  const avatarSrc =
    userAvatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`;


  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-[#EFEABB]">
      <div className="w-full max-w-7xl md:max-w-[95%] lg:max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to={ROUTES.HOME} className="flex items-center gap-2 text-[#1E293B]">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#1E293B] text-[#BA5A5A]">
                <Zap size={18} fill="currentColor" />
              </div>
              <span className="font-bold text-xl tracking-tight">InvoiceIQ</span>
            </Link>

            <div className="hidden md:flex ml-10 space-x-2">
              <NavLink
                href={ROUTES.DASHBOARD}
                icon={<LayoutDashboard size={18} />}
                label="Dashboard"
                isActive={activeTab === 'dashboard'}
              />
              <NavLink
                href={ROUTES.DASHBOARD_INVOICES}
                icon={<FileText size={18} />}
                label="Invoices"
                isActive={activeTab === 'invoices'}
              />
              <NavLink
                href="#"
                icon={<Upload size={18} />}
                label="Upload"
                isActive={activeTab === 'upload'}
                onClick={(event) => {
                  event.preventDefault();
                  onUploadClick?.();
                }}
              />
              <NavLink
                href={ROUTES.DASHBOARD_ANALYTICS}
                icon={<BarChart3 size={18} />}
                label="Analytics"
                isActive={activeTab === 'analytics'}
              />
              <NavLink
                href={ROUTES.AI_ASSISTANT}
                icon={<Bot size={18} />}
                label="AI Assistant"
                isActive={activeTab === 'assistant'}
              />
              <NavLink
                href={ROUTES.DASHBOARD_REMINDERS}
                icon={<Mail size={18} />}
                label="Reminders"
                isActive={activeTab === 'reminders'}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-1 pl-1 pr-3 rounded-full hover:bg-[#EAE0CF] transition-all border border-transparent hover:border-[#78A4CB]/30"
              >
                <div className="w-8 h-8 rounded-full bg-[#EFEABB]/50 border-2 border-white flex items-center justify-center overflow-hidden">
                  <img src={avatarSrc} alt="User avatar" className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-medium text-[#17433F] hidden sm:inline">{userName}</span>
                <ChevronDown size={16} className="text-[#43637E] hidden sm:inline" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gradient-to-br from-white to-[#EAE0CF]/30 rounded-xl shadow-lg border border-[#EFEABB] py-2 z-50">
                  <Link
                    to="#"
                    className="flex items-center px-4 py-2 text-sm text-[#17433F] hover:bg-[#EAE0CF]"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <User size={16} className="mr-3 text-[#43637E]" />
                    Profile
                  </Link>
                  <Link
                    to="#"
                    className="flex items-center px-4 py-2 text-sm text-[#17433F] hover:bg-[#EAE0CF]"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Settings size={16} className="mr-3 text-[#43637E]" />
                    Settings
                  </Link>
                  <div className="border-t border-[#EFEABB] my-1"></div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout?.();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-[#17433F] hover:bg-[#EAE0CF] text-left"
                  >
                    <LogOut size={16} className="mr-3 text-[#43637E]" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-[#43637E]"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setShowMobileMenu(false)}
            />
            <div className="md:hidden border-t border-[#EFEABB] bg-white relative z-50">
              <div className="px-4 py-3 space-y-1">
                <Link
                  to={ROUTES.DASHBOARD}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'dashboard'
                      ? 'text-white bg-[#321E48]'
                      : 'text-[#43637E] hover:text-[#78A4CB] hover:bg-[#EAE0CF]'
                  }`}
                >
                  <LayoutDashboard size={18} className="mr-2" />
                  Dashboard
                </Link>
                <Link
                  to={ROUTES.DASHBOARD_INVOICES}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'invoices'
                      ? 'text-white bg-[#321E48]'
                      : 'text-[#43637E] hover:text-[#78A4CB] hover:bg-[#EAE0CF]'
                  }`}
                >
                  <FileText size={18} className="mr-2" />
                  Invoices
                </Link>
                <button
                  onClick={() => {
                    onUploadClick?.();
                    setShowMobileMenu(false);
                  }}
                  className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'upload'
                      ? 'text-white bg-[#321E48]'
                      : 'text-[#43637E] hover:text-[#78A4CB] hover:bg-[#EAE0CF]'
                  }`}
                >
                  <Upload size={18} className="mr-2" />
                  Upload
                </button>
                <Link
                  to={ROUTES.DASHBOARD_ANALYTICS}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'analytics'
                      ? 'text-white bg-[#321E48]'
                      : 'text-[#43637E] hover:text-[#78A4CB] hover:bg-[#EAE0CF]'
                  }`}
                >
                  <BarChart3 size={18} className="mr-2" />
                  Analytics
                </Link>
                <Link
                  to={ROUTES.AI_ASSISTANT}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'assistant'
                      ? 'text-white bg-[#321E48]'
                      : 'text-[#43637E] hover:text-[#78A4CB] hover:bg-[#EAE0CF]'
                  }`}
                >
                  <Bot size={18} className="mr-2" />
                  AI Assistant
                </Link>
                <Link
                  to={ROUTES.DASHBOARD_REMINDERS}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'reminders'
                      ? 'text-white bg-[#321E48]'
                      : 'text-[#43637E] hover:text-[#78A4CB] hover:bg-[#EAE0CF]'
                  }`}
                >
                  <Mail size={18} className="mr-2" />
                  Reminders
                </Link>
                <div className="border-t border-[#EFEABB] my-2"></div>
                <button
                  onClick={() => {
                    onLogout?.();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-[#4B1426] hover:bg-[#EFEABB]/50 rounded-md"
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </button>
            </div>
          </div>
          </>
        )}
      </div>
    </nav>
  );
};
