import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import theme from '@/settings/theme';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;
}

const { colors } = theme;

export const AuthLayout = ({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkTo,
}: AuthLayoutProps) => {
  return (
    <div
      className="min-h-screen font-sans selection:bg-[#BA5A5A] selection:text-white relative overflow-hidden"
      style={{ backgroundColor: colors.background, color: colors.textPrimary }}
    >
      <style>{authStyles}</style>

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="auth-blob auth-blob-one" />
        <div className="auth-blob auth-blob-two" />
        <div className="auth-blob auth-blob-three" />
      </div>

      <nav className="fixed top-0 w-full z-50 py-5">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#1E293B] nav-logo-enter">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#1E293B] text-[#BA5A5A] logo-orb">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="font-bold text-xl tracking-tight">InvoiceIQ</span>
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-3 tracking-tight"
            >
              {title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="text-[#475569] text-base md:text-lg leading-relaxed"
            >
              {subtitle}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="auth-card rounded-3xl p-6 md:p-8 shadow-2xl"
          >
            {children}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-center mt-6 text-sm text-[#475569]"
          >
            {footerText}{' '}
            <Link to={footerLinkTo} className="auth-link font-semibold text-[#BA5A5A] hover:text-[#a04b4b] transition-colors">
              {footerLinkText}
            </Link>
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
};

const authStyles = `
  .font-editorial { font-family: Georgia, Cambria, "Times New Roman", Times, serif; }

  @keyframes blobDriftOne {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    50% { transform: translate3d(72px, 48px, 0) scale(1.05); }
  }

  @keyframes blobDriftTwo {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    50% { transform: translate3d(-84px, -56px, 0) scale(1.03); }
  }

  @keyframes blobPulse {
    0%, 100% { opacity: 0.45; transform: scale(1); }
    50% { opacity: 0.65; transform: scale(1.08); }
  }

  .auth-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    will-change: transform, opacity;
  }

  .auth-blob-one {
    width: 420px;
    height: 420px;
    top: -80px;
    left: -100px;
    background: rgba(186, 90, 90, 0.18);
    animation: blobDriftOne 14s ease-in-out infinite;
  }

  .auth-blob-two {
    width: 360px;
    height: 360px;
    bottom: 10%;
    right: -80px;
    background: rgba(134, 188, 189, 0.14);
    animation: blobDriftTwo 16s ease-in-out infinite;
  }

  .auth-blob-three {
    width: 280px;
    height: 280px;
    top: 40%;
    left: 55%;
    background: rgba(164, 206, 139, 0.1);
    animation: blobPulse 10s ease-in-out infinite;
  }

  .auth-card {
    background: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(186, 90, 90, 0.12);
    box-shadow: 0 32px 80px rgba(30, 41, 59, 0.12), 0 8px 24px rgba(30, 41, 59, 0.06);
  }

  .auth-input {
    width: 100%;
    padding: 0.875rem 1rem;
    border-radius: 0.875rem;
    border: 1px solid rgba(186, 90, 90, 0.18);
    background: rgba(255, 255, 255, 0.9);
    color: #1E293B;
    font-size: 0.9375rem;
    transition: border-color 220ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 220ms cubic-bezier(0.4, 0, 0.2, 1);
    outline: none;
  }

  .auth-input::placeholder {
    color: #475569;
    opacity: 0.7;
  }

  .auth-input:focus {
    border-color: #BA5A5A;
    box-shadow: 0 0 0 3px rgba(186, 90, 90, 0.15);
  }

  .auth-input-error {
    border-color: #EF4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
  }

  .auth-button {
    width: 100%;
    padding: 0.875rem 1.5rem;
    border-radius: 9999px;
    background: #BA5A5A;
    color: white;
    font-weight: 600;
    font-size: 0.9375rem;
    border: none;
    cursor: pointer;
    transition: background-color 220ms cubic-bezier(0.4, 0, 0.2, 1), transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 220ms cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 14px 0 rgba(186, 90, 90, 0.39);
  }

  .auth-button:hover:not(:disabled) {
    background: #a04b4b;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px 0 rgba(186, 90, 90, 0.45);
  }

  .auth-button:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .auth-link {
    position: relative;
  }

  .auth-link::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 100%;
    height: 1px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 260ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .auth-link:hover::after {
    transform: scaleX(1);
    transform-origin: left;
  }

  .logo-orb {
    animation: logoPulse 3s ease-in-out infinite;
  }

  @keyframes logoPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(186, 90, 90, 0.3); }
    50% { box-shadow: 0 0 0 6px rgba(186, 90, 90, 0); }
  }

  .nav-logo-enter {
    animation: navEnter 600ms cubic-bezier(0.4, 0, 0.2, 1) both;
  }

  @keyframes navEnter {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
