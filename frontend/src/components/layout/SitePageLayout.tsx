import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap } from 'lucide-react';
import theme from '@/settings/theme';
import { ROUTES } from '@/routes/paths';
import type { ReactNode } from 'react';

interface SitePageLayoutProps {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  subtitle: string;
}

const { colors } = theme;

export const SitePageLayout = ({
  children,
  eyebrow,
  title,
  subtitle,
}: SitePageLayoutProps) => {
  return (
    <div
      className="min-h-screen font-sans selection:bg-[#BA5A5A] selection:text-white relative overflow-hidden"
      style={{ backgroundColor: colors.background, color: colors.textPrimary }}
    >
      <style>{sitePageStyles}</style>

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="site-blob site-blob-one" />
        <div className="site-blob site-blob-two" />
        <div className="site-blob site-blob-three" />
      </div>

      <nav className="fixed top-0 w-full z-50 py-5 bg-white/70 backdrop-blur-xl border-b border-[#BA5A5A]/10">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 text-[#1E293B]">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1E293B] text-[#BA5A5A] logo-orb">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="font-bold text-xl tracking-tight">InvoiceIQ</span>
          </Link>

          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#475569] hover:text-[#BA5A5A] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to home</span>
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-wider text-[#475569] mb-4">
              {eyebrow}
            </p>
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-[#1E293B] tracking-tight mb-4">
            {title}
          </h1>
          <p className="text-lg text-[#475569] leading-relaxed mb-10">{subtitle}</p>

          <div className="site-content-card rounded-3xl p-6 md:p-10 shadow-2xl">{children}</div>
        </motion.div>
      </main>
    </div>
  );
};

const sitePageStyles = `
  .site-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    will-change: transform, opacity;
  }

  .site-blob-one {
    width: 420px;
    height: 420px;
    top: -80px;
    left: -100px;
    background: rgba(186, 90, 90, 0.18);
  }

  .site-blob-two {
    width: 360px;
    height: 360px;
    bottom: 10%;
    right: -80px;
    background: rgba(134, 188, 189, 0.14);
  }

  .site-blob-three {
    width: 280px;
    height: 280px;
    top: 40%;
    left: 55%;
    background: rgba(164, 206, 139, 0.1);
  }

  .site-content-card {
    background: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(186, 90, 90, 0.12);
    box-shadow: 0 32px 80px rgba(20, 20, 20, 0.08), 0 8px 24px rgba(20, 20, 20, 0.04);
  }

  .logo-orb {
    box-shadow: 0 10px 30px rgba(20, 20, 20, 0.08);
  }
`;
