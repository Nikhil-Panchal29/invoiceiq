import { MarketingContentPage } from '@/components/layout/MarketingContentPage';

export const PressPage = () => (
  <MarketingContentPage
    eyebrow="Company"
    title="Press"
    subtitle="News, media resources, and press inquiries for InvoiceIQ."
    sections={[
      {
        title: 'Press kit',
        body: 'Brand assets, company overview, leadership bios, and product screenshots will be available for media use.',
      },
      {
        title: 'In the news',
        body: 'Coverage and announcements featuring InvoiceIQ will be collected here as they are published.',
      },
      {
        title: 'Media contact',
        body: 'For press inquiries, reach out to hello@invoiceiq.io with the subject line "Press Inquiry".',
      },
    ]}
    footerNote="Press resources are being assembled. Full media kit and news coverage will be published here soon."
  />
);
