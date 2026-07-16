import { MarketingContentPage } from '@/components/layout/MarketingContentPage';

export const CookiePolicyPage = () => (
  <MarketingContentPage
    eyebrow="Legal"
    title="Cookie Policy"
    subtitle="How InvoiceIQ uses cookies and similar technologies on our website and platform."
    sections={[
      {
        title: 'What are cookies',
        body: 'Cookies are small text files stored on your device. We use them to keep you signed in, remember preferences, and understand how our service is used.',
      },
      {
        title: 'Cookies we use',
        body: 'A detailed breakdown of essential, functional, and analytics cookies will be listed in the full policy.',
      },
      {
        title: 'Managing cookies',
        body: 'Instructions for controlling cookies through your browser settings and our preference center will be included in the complete policy.',
      },
    ]}
    footerNote="The full Cookie Policy is being prepared and will be available here soon."
  />
);
