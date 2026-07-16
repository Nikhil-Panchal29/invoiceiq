import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { SECTIONS } from '@/routes/paths';

const PRICING_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Everything you need to invoice clients and get paid on time.',
    features: [
      'Up to 50 invoices per month',
      'AI-powered data extraction',
      'Email payment reminders',
      'Basic reporting dashboard',
      'PDF & image upload support',
    ],
    cta: 'Start for free',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$79',
    period: '/month',
    description: 'For growing teams that need automation and deeper insights.',
    features: [
      'Unlimited invoices',
      'Advanced AI analysis & insights',
      'Automated collections workflow',
      'Multi-currency support',
      'API access & integrations',
      'Priority email support',
    ],
    cta: 'Start for free',
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Tailored solutions for finance teams at scale.',
    features: [
      'Dedicated account manager',
      'Custom AI model training',
      'SSO & advanced security controls',
      'SLA-backed uptime guarantee',
      'White-label & on-premise options',
      'Audit logs & compliance reporting',
    ],
    cta: 'Contact sales',
    highlighted: false,
  },
] as const;

interface PricingSectionProps {
  onRegister: () => void;
  onScrollToContact: () => void;
}

export const PricingSection = ({ onRegister, onScrollToContact }: PricingSectionProps) => {
  return (
    <section id={SECTIONS.PRICING} className="pt-8 pb-24 md:pt-12 md:pb-32 bg-white/50 relative reveal-target section-fade">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 reveal-target heading-reveal">
          <h2 className="text-4xl md:text-5xl lg:text-6xl tracking-tight flex flex-col items-center gap-2">
            <span className="font-editorial italic text-[#475569] font-normal leading-tight">
              Simple, transparent
            </span>
            <span className="font-bold text-[#1E293B] leading-tight">pricing for every stage</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-[#475569] mt-6 leading-relaxed reveal-target subheading-reveal">
            Start free, scale as you grow. No hidden fees, no long-term contracts.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch mt-6">
          {PRICING_PLANS.map((plan) => {
            const cardClass = plan.highlighted
              ? 'pricing-card-highlighted bg-[#1E293B] text-white shadow-2xl'
              : 'bg-white/80 border border-[#BA5A5A]/12 shadow-lg';
            
            const titleClass = plan.highlighted ? 'text-white' : 'text-[#1E293B]';
            const priceClass = plan.highlighted ? 'text-white' : 'text-[#1E293B]';
            const periodClass = plan.highlighted ? 'text-white/60' : 'text-[#475569]';
            const descClass = plan.highlighted ? 'text-white/70' : 'text-[#475569]';
            const iconClass = plan.highlighted ? 'text-[#A4CE8B]' : 'text-[#86BCBD]';
            const featureClass = plan.highlighted ? 'text-white/90' : 'text-[#1E293B]';
            const btnClass = plan.highlighted
              ? 'bg-[#86BCBD] hover:bg-[#6EA9AA] text-white shadow-[0_4px_14px_0_rgba(134,188,189,0.39)]'
              : 'bg-[#BA5A5A] hover:bg-[#a04b4b] text-white shadow-[0_4px_14px_0_rgba(186,90,90,0.39)]';

            return (
              <article
                key={plan.id}
                className={`pricing-card flex flex-col rounded-3xl p-8 reveal-target ${cardClass}`}
              >
                {plan.highlighted && (
                  <span className="inline-block self-start text-xs font-semibold uppercase tracking-wider text-[#A4CE8B] bg-[#A4CE8B]/20 px-3 py-1 rounded-full mb-4">
                    Most popular
                  </span>
                )}

                <h3 className={`text-xl font-bold mb-2 ${titleClass}`}>
                  {plan.name}
                </h3>

                <div className="mb-4">
                  <span className={`text-4xl font-bold ${priceClass}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm ${periodClass}`}>
                      {plan.period}
                    </span>
                  )}
                </div>

                <p className={`text-sm leading-relaxed mb-6 ${descClass}`}>
                  {plan.description}
                </p>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <CheckCircle2
                        size={18}
                        className={`flex-shrink-0 mt-0.5 ${iconClass}`}
                      />
                      <span className={featureClass}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  data-ripple="true"
                  data-magnetic="0.25"
                  onClick={plan.id === 'enterprise' ? onScrollToContact : onRegister}
                  className={`premium-button w-full py-3.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 ${btnClass}`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight size={16} />
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
