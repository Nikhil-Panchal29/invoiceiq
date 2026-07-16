import { Route, Routes } from 'react-router-dom';
import { InvoiceIQ } from '@/components/generated/InvoiceIQ';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { DashboardOverviewPage } from '@/pages/DashboardOverviewPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { InvoiceDetailsPage } from '@/pages/InvoiceDetailsPage';
import { AIAssistantPage } from '@/pages/AIAssistantPage';
import { ReminderPage } from '@/pages/ReminderPage';
import { DocsPage } from '@/pages/DocsPage';
import { CareersPage } from '@/pages/CareersPage';
import { BlogPage } from '@/pages/BlogPage';
import { PressPage } from '@/pages/PressPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { TermsPage } from '@/pages/TermsPage';
import { CookiePolicyPage } from '@/pages/CookiePolicyPage';
import { GdprPage } from '@/pages/GdprPage';
import { CompliancePage } from '@/pages/CompliancePage';
import { ROUTES } from '@/routes/paths';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<InvoiceIQ />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <DashboardOverviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.DASHBOARD_INVOICES}
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.DASHBOARD_INVOICE_DETAILS}
        element={
          <ProtectedRoute>
            <InvoiceDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.DASHBOARD_ANALYTICS}
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.AI_ASSISTANT}
        element={
          <ProtectedRoute>
            <AIAssistantPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.DASHBOARD_REMINDERS}
        element={
          <ProtectedRoute>
            <ReminderPage />
          </ProtectedRoute>
        }
      />
      <Route path={ROUTES.DOCS} element={<DocsPage />} />
      <Route path={ROUTES.CAREERS} element={<CareersPage />} />
      <Route path={ROUTES.BLOG} element={<BlogPage />} />
      <Route path={ROUTES.PRESS} element={<PressPage />} />
      <Route path={ROUTES.PRIVACY} element={<PrivacyPage />} />
      <Route path={ROUTES.TERMS} element={<TermsPage />} />
      <Route path={ROUTES.COOKIE_POLICY} element={<CookiePolicyPage />} />
      <Route path={ROUTES.GDPR} element={<GdprPage />} />
      <Route path={ROUTES.COMPLIANCE} element={<CompliancePage />} />
    </Routes>
  );
};
