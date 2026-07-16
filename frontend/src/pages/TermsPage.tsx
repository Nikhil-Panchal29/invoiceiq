import { MarketingContentPage } from '@/components/layout/MarketingContentPage';

export const TermsPage = () => (
  <MarketingContentPage
    eyebrow="Legal"
    title="Terms of Service"
    subtitle="The terms and conditions governing your use of InvoiceIQ."
    sections={[
      {
        title: 'Agreement',
        body: 'By using InvoiceIQ, you agree to the terms outlined in this document. The full terms will cover account registration, acceptable use, and service availability.',
      },
      {
        title: 'Service description',
        body: 'InvoiceIQ provides AI-powered invoice processing, management, and related financial workflow tools. Specific service levels will be defined in the complete terms.',
      },
      {
        title: 'Limitations',
        body: 'Liability limitations, warranty disclaimers, and dispute resolution procedures will be detailed in the published terms.',
      },
    ]}
    footerNote="The complete Terms of Service are being reviewed and will be published here shortly."
  />
);
