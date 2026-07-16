import { MarketingContentPage } from '@/components/layout/MarketingContentPage';

export const CareersPage = () => (
  <MarketingContentPage
    eyebrow="Company"
    title="Careers"
    subtitle="Join the team building the future of intelligent invoicing and revenue operations."
    sections={[
      {
        title: 'Why InvoiceIQ',
        body: 'We are building AI-powered tools that help finance teams get paid faster. Our culture values craft, ownership, and thoughtful product design.',
      },
      {
        title: 'Open roles',
        body: 'Role listings for engineering, product, design, and customer success will be published here as we grow the team.',
      },
      {
        title: 'How to apply',
        body: 'When positions open, you will find detailed descriptions and application instructions on this page. We review every application personally.',
      },
    ]}
    footerNote="Careers content is being updated. Full job listings and application details will be available here shortly."
  />
);
