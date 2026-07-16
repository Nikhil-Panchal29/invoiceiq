import { SitePageLayout } from '@/components/layout/SitePageLayout';

interface ContentSection {
  title: string;
  body: string;
}

interface MarketingContentPageProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  sections: ContentSection[];
  footerNote: string;
}

export const MarketingContentPage = ({
  eyebrow,
  title,
  subtitle,
  sections,
  footerNote,
}: MarketingContentPageProps) => {
  return (
    <SitePageLayout eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-bold text-[#1E293B] mb-3">{section.title}</h2>
            <p className="text-[#475569] leading-relaxed">{section.body}</p>
          </section>
        ))}

        <div className="pt-4 border-t border-[#BA5A5A]/10">
          <p className="text-sm text-[#475569] leading-relaxed">{footerNote}</p>
        </div>
      </div>
    </SitePageLayout>
  );
};
