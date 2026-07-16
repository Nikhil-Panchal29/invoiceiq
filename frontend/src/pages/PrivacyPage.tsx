import { MarketingContentPage } from '@/components/layout/MarketingContentPage';

export const PrivacyPage = () => (
  <MarketingContentPage
    eyebrow="Legal"
    title="Privacy Policy"
    subtitle="How InvoiceIQ collects, uses, and protects your personal information."
    sections={[
      {
        title: 'Overview',
        body: 'InvoiceIQ is committed to protecting your privacy. This policy will describe the data we collect, how we use it, and the choices available to you.',
      },
      {
        title: 'Data we collect',
        body: 'Details on account information, invoice data, usage analytics, and cookies will be documented in the full policy.',
      },
      {
        title: 'Your rights',
        body: 'Information about access, correction, deletion, and data portability rights will be provided in the complete privacy policy.',
      },
    ]}
    footerNote="The full Privacy Policy is being finalized by our legal team and will be published here."
  />
);
