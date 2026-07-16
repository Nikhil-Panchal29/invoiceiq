import { Navigate, useLocation } from 'react-router-dom';
import theme from '@/settings/theme';
import { useAuth } from '@/context/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const { colors } = theme;

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        className="min-h-screen font-sans"
        style={{ backgroundColor: colors.background }}
      >
        <div className="fixed top-0 w-full z-50 py-5">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="skeleton-shimmer h-8 w-40 rounded-xl" />
            <div className="skeleton-shimmer h-10 w-32 rounded-full" />
          </div>
        </div>
        <main className="pt-40 px-6">
          <section className="max-w-md mx-auto space-y-5">
            <div className="skeleton-shimmer h-10 w-3/4 mx-auto rounded-2xl" />
            <div className="skeleton-shimmer h-6 w-1/2 mx-auto rounded-full" />
            <div className="skeleton-shimmer h-64 w-full rounded-3xl mt-8" />
          </section>
        </main>
        <style>{skeletonStyles}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

const skeletonStyles = `
  @keyframes shimmer {
    0% { background-position: 180% 0; }
    100% { background-position: -180% 0; }
  }
  .skeleton-shimmer {
    background: linear-gradient(100deg, rgba(209,250,229,0.45) 0%, rgba(236,253,245,0.98) 45%, rgba(209,250,229,0.45) 90%);
    background-size: 220% 100%;
    animation: shimmer 1050ms cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
`;
