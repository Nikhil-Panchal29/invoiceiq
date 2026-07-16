import { MarketingContentPage } from '@/components/layout/MarketingContentPage';

export const BlogPage = () => (
  <MarketingContentPage
    eyebrow="Company"
    title="Blog"
    subtitle="Insights on invoicing, cash flow, AI in finance, and product updates from the InvoiceIQ team."
    sections={[
      {
        title: 'Latest articles',
        body: 'Product announcements, engineering deep-dives, and finance operations best practices will appear here as we publish new content.',
      },
      {
        title: 'Topics we cover',
        body: 'Accounts receivable automation, payment collection strategies, AI-powered invoice processing, and lessons from scaling finance teams.',
      },
      {
        title: 'Stay updated',
        body: 'Subscribe to our newsletter on the homepage to be notified when new articles are published.',
      },
    ]}
    footerNote="Blog posts are on the way. Check back soon for our first published articles."
  />
);
