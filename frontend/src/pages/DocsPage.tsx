import { SitePageLayout } from '@/components/layout/SitePageLayout';

export const DocsPage = () => {
  return (
    <SitePageLayout
      eyebrow="Resources"
      title="Documentation"
      subtitle="API references, integration guides, and developer resources for InvoiceIQ."
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-[#1E293B] mb-3">Developer documentation</h2>
          <p className="text-[#475569] leading-relaxed mb-4">
            InvoiceIQ is built API-first. Full documentation for authentication, invoice upload,
            OCR extraction, and AI analysis will be published here.
          </p>
          <div className="rounded-2xl bg-[#1E293B] p-6 font-mono text-sm text-[#A4CE8B] leading-relaxed overflow-x-auto">
            <pre>{`POST /api/invoices/upload
GET  /api/invoices
GET  /api/invoices/:id
PATCH /api/invoices/:id/status`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1E293B] mb-3">What to expect</h2>
          <ul className="space-y-3 text-[#475569]">
            <li>• Authentication and API key management guides</li>
            <li>• Invoice upload and processing workflows</li>
            <li>• Webhook and integration examples</li>
            <li>• SDK references and code samples</li>
          </ul>
        </section>

        <div className="pt-4 border-t border-[#BA5A5A]/10">
          <p className="text-sm text-[#475569] leading-relaxed">
            Documentation is being prepared. Check back soon for complete API reference and
            integration guides.
          </p>
        </div>
      </div>
    </SitePageLayout>
  );
};
