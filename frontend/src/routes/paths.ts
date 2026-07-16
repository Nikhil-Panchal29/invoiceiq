export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  DASHBOARD_INVOICES: '/dashboard/invoices',
  DASHBOARD_INVOICE_DETAILS: '/dashboard/invoices/:id',
  DASHBOARD_ANALYTICS: '/dashboard/analytics',
  DASHBOARD_REMINDERS: '/dashboard/reminders',
  AI_ASSISTANT: '/dashboard/assistant',
  DOCS: '/docs',
  CAREERS: '/careers',
  BLOG: '/blog',
  PRESS: '/press',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  COOKIE_POLICY: '/cookie-policy',
  GDPR: '/gdpr',
  COMPLIANCE: '/compliance',
} as const;

export const SECTIONS = {
  HOW_IT_WORKS: 'how-it-works',
  FEATURES: 'features',
  INTEGRATIONS: 'integrations',
  PRICING: 'pricing',
  RESOURCES: 'resources',
  CONTACT: 'contact',
} as const;
