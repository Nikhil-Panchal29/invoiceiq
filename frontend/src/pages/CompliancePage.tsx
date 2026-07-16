import { MarketingContentPage } from '@/components/layout/MarketingContentPage';

export const CompliancePage = () => (
  <MarketingContentPage
    eyebrow="Legal"
    title="Compliance"
    subtitle="Security certifications, regulatory compliance, and trust standards at InvoiceIQ."
    sections={[
      {
        title: 'Security certifications',
        body: 'InvoiceIQ is SOC 2 Type II certified. Documentation on our security controls, audit reports, and compliance framework will be available here.',
      },
      {
        title: 'Regulatory standards',
        body: 'Information on how we meet industry standards for data protection, financial data handling, and regional regulatory requirements.',
      },
      {
        title: 'Trust center',
        body: 'Security whitepapers, penetration test summaries, and subprocessors list will be published for enterprise customers and auditors.',
      },
    ]}
    footerNote="Compliance documentation and trust center resources are being prepared for publication."
  />
);
