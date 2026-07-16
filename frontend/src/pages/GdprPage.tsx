import { MarketingContentPage } from '@/components/layout/MarketingContentPage';

export const GdprPage = () => (
  <MarketingContentPage
    eyebrow="Legal"
    title="GDPR"
    subtitle="InvoiceIQ's commitment to GDPR compliance and your data protection rights."
    sections={[
      {
        title: 'Our commitment',
        body: 'InvoiceIQ processes personal data in accordance with the General Data Protection Regulation (GDPR) for users in the European Economic Area.',
      },
      {
        title: 'Legal basis for processing',
        body: 'Details on consent, contractual necessity, and legitimate interests as bases for data processing will be documented here.',
      },
      {
        title: 'Data subject rights',
        body: 'Information on your rights to access, rectify, erase, restrict, port, and object to processing will be provided in the full GDPR notice.',
      },
    ]}
    footerNote="Our complete GDPR compliance documentation is being finalized and will be published here."
  />
);
