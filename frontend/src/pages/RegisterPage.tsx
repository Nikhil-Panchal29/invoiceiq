import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useAuth } from '@/context/AuthContext';

export const RegisterPage = () => {
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setFieldError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setFieldError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      navigate('/dashboard', { replace: true });
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
      title="Create your account"
      subtitle="Start automating your invoicing workflow in minutes."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkTo="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-semibold text-[#1E293B]">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Jane Smith"
            className={`auth-input ${fieldError ? 'auth-input-error' : ''}`}
            disabled={isSubmitting}
          />
        </div>

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
          <label htmlFor="password" className="block text-sm font-semibold text-[#1E293B]">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
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
          <span>{isSubmitting ? 'Creating account...' : 'Create account'}</span>
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
