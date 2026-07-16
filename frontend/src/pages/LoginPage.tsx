import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useAuth } from '@/context/AuthContext';

export const LoginPage = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/dashboard';

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldError('');

    if (!email.trim() || !password.trim()) {
      setFieldError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        setFieldError(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your invoices and get paid faster."
      footerText="Don't have an account?"
      footerLinkText="Create one"
      footerLinkTo="/register"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-[#1E293B]">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className={`auth-input ${fieldError ? 'auth-input-error' : ''}`}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-semibold text-[#1E293B]">
              Password
            </label>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            className={`auth-input ${fieldError ? 'auth-input-error' : ''}`}
            disabled={isSubmitting}
          />
        </div>

        {fieldError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-[#EF4444] font-medium"
            role="alert"
          >
            {fieldError}
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileTap={{ scale: 0.98 }}
          className="auth-button flex items-center justify-center gap-2"
        >
          <span>{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
          {!isSubmitting && <ArrowRight size={18} />}
        </motion.button>
      </form>

      <p className="text-center mt-5 text-sm text-[#475569]">
        <Link to="/" className="auth-link font-medium text-[#475569] hover:text-[#BA5A5A] transition-colors">
          ← Back to homepage
        </Link>
      </p>
    </AuthLayout>
  );
};
