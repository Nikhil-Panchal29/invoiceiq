import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, FileText, Menu, Shield, Users, X, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useScrollToSection } from '@/hooks/useScrollToSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { ROUTES, SECTIONS } from '@/routes/paths';
const COLORS = {
  primary: '#BA5A5A',
  primaryDark: '#a04b4b',
  primaryDeeper: '#8a3f3f',
  accent: '#86BCBD',
  accent2: '#A4CE8B',
  accent3: '#F7E49B',
  background: '#F7F8F6',
  backgroundSecondary: '#EEF4F2',
  surface: '#FFFFFF',
  darkBg: '#1E293B',
  textPrimary: '#1E293B',
  textSecondary: '#475569',
  border: '#DCE5E2',
  success: '#5AAE7A',
  warning: '#E3B341',
  error: '#C95F5F',
  shadow: 'rgba(20,20,20,0.08)'
};
const NAV_LINKS = [{
  id: 'features',
  label: 'Features'
}, {
  id: 'integrations',
  label: 'Integrations'
}, {
  id: 'pricing',
  label: 'Pricing'
}, {
  id: 'resources',
  label: 'Resources'
}, {
  id: 'docs',
  label: 'Docs'
}];
const MARQUEE_LOGOS = [{
  id: 'meridian',
  label: 'Meridian Co.'
}, {
  id: 'vantage',
  label: 'Vantage Labs'
}, {
  id: 'corova',
  label: 'Corova Health'
}, {
  id: 'nexlify',
  label: 'Nexlify'
}, {
  id: 'trident',
  label: 'Trident SaaS'
}, {
  id: 'orbital',
  label: 'Orbital Media'
}, {
  id: 'pinnacle',
  label: 'Pinnacle Studio'
}, {
  id: 'crestwave',
  label: 'Crestwave'
}, {
  id: 'solara',
  label: 'Solara Inc.'
}, {
  id: 'driftwood',
  label: 'Driftwood Agency'
}, {
  id: 'luminary',
  label: 'Luminary Works'
}, {
  id: 'apex',
  label: 'Apex Dynamics'
}];
const HERO_ROWS = [{
  id: 'client-one',
  initial: 'C1',
  amount: '$4,200.00'
}, {
  id: 'client-two',
  initial: 'C2',
  amount: '$4,200.00'
}, {
  id: 'client-three',
  initial: 'C3',
  amount: '$4,200.00'
}];
const INVOICE_ROWS = [{
  id: 'invoice-paid',
  invoice: 'Invoice #1042',
  company: 'Stark Industries',
  status: 'Paid'
}, {
  id: 'invoice-pending',
  invoice: 'Invoice #1043',
  company: 'Stark Industries',
  status: 'Pending'
}, {
  id: 'invoice-overdue',
  invoice: 'Invoice #1044',
  company: 'Stark Industries',
  status: 'Overdue'
}];
const CHART_BARS = [{
  id: 'bar-jan',
  height: 40
}, {
  id: 'bar-feb',
  height: 60
}, {
  id: 'bar-mar',
  height: 30
}, {
  id: 'bar-apr',
  height: 80
}, {
  id: 'bar-may',
  height: 50
}, {
  id: 'bar-jun',
  height: 90
}, {
  id: 'bar-jul',
  height: 70
}];
const CHART_POINTS = [{
  id: 'point-a',
  cx: 0,
  cy: 60
}, {
  id: 'point-b',
  cx: 16,
  cy: 40
}, {
  id: 'point-c',
  cx: 33,
  cy: 70
}, {
  id: 'point-d',
  cx: 50,
  cy: 20
}, {
  id: 'point-e',
  cx: 66,
  cy: 50
}, {
  id: 'point-f',
  cx: 83,
  cy: 10
}, {
  id: 'point-g',
  cx: 100,
  cy: 30
}];
const TABS_DATA = [{
  id: 'invoicing',
  label: 'Invoicing',
  title: 'Smart Invoicing',
  description: 'Create and send professional invoices in seconds. Let AI predict the best time to send them.',
  features: [{
    id: 'one-click-generation',
    label: 'One-click generation'
  }, {
    id: 'smart-scheduling',
    label: 'Smart scheduling'
  }, {
    id: 'custom-branding',
    label: 'Custom branding'
  }],
  stats: {
    primary: '$124,500',
    primaryLabel: 'collected this month',
    secondary: '98.2%',
    secondaryLabel: 'on-time rate'
  }
}, {
  id: 'payments',
  label: 'Payments',
  title: 'Global Payments',
  description: 'Accept payments from anywhere in the world with zero friction and instant payouts.',
  features: [{
    id: 'multi-currency-support',
    label: 'Multi-currency support'
  }, {
    id: 'instant-bank-transfers',
    label: 'Instant bank transfers'
  }, {
    id: 'automated-reconciliation',
    label: 'Automated reconciliation'
  }],
  stats: {
    primary: '130+',
    primaryLabel: 'currencies supported',
    secondary: '< 1s',
    secondaryLabel: 'processing time'
  }
}, {
  id: 'reporting',
  label: 'Reporting',
  title: 'Real-time Reporting',
  description: 'Get deep insights into your cash flow and revenue streams with customizable dashboards.',
  features: [{
    id: 'revenue-forecasting',
    label: 'Revenue forecasting'
  }, {
    id: 'churn-analysis',
    label: 'Churn analysis'
  }, {
    id: 'customizable-charts',
    label: 'Customizable charts'
  }],
  stats: {
    primary: '100%',
    primaryLabel: 'data visibility',
    secondary: 'AI',
    secondaryLabel: 'powered insights'
  }
}, {
  id: 'automation',
  label: 'Automation',
  title: 'Workflow Automation',
  description: 'Put your accounts receivable on autopilot and focus on growing your business.',
  features: [{
    id: 'auto-reminders',
    label: 'Auto-reminders'
  }, {
    id: 'recurring-billing',
    label: 'Recurring billing'
  }, {
    id: 'rule-based-actions',
    label: 'Rule-based actions'
  }],
  stats: {
    primary: '40hrs',
    primaryLabel: 'saved per week',
    secondary: '0',
    secondaryLabel: 'manual entries'
  }
}, {
  id: 'collections',
  label: 'Collections',
  title: 'Smart Collections',
  description: 'Recover failed payments and follow up on overdue invoices without lifting a finger.',
  features: [{
    id: 'dunning-management',
    label: 'Dunning management'
  }, {
    id: 'custom-escalation',
    label: 'Custom escalation'
  }, {
    id: 'payment-plans',
    label: 'Payment plans'
  }],
  stats: {
    primary: '85%',
    primaryLabel: 'recovery rate',
    secondary: '3.2 days',
    secondaryLabel: 'avg payment time'
  }
}];
const FEATURES = [{
  id: 'complete-workflow',
  icon: 'zap',
  title: 'Complete Workflow',
  desc: 'From quote to collection in one place. No jumping between tools.'
}, {
  id: 'ai-reminders',
  icon: 'clock',
  title: 'AI-Powered Reminders',
  desc: 'Learns the optimal time to nudge clients. Fewer awkward follow-ups.'
}, {
  id: 'own-data',
  icon: 'file',
  title: 'Own Your Data',
  desc: "Full export, API access, and white-label options. It's your business."
}, {
  id: 'compliance-ready',
  icon: 'shield',
  title: 'Compliance Ready',
  desc: 'Built-in tax support, audit trails, and SOC 2 Type II certified.'
}, {
  id: 'launch-minutes',
  icon: 'zap',
  title: 'Launch in Minutes',
  desc: 'Onboard in under 5 minutes. Connect your accounting tool instantly.'
}, {
  id: 'scales-with-you',
  icon: 'users',
  title: 'Scales with You',
  desc: 'From freelancers to enterprise finance teams. One platform.'
}];
const FOOTER_GROUPS = [{
  id: 'product',
  title: 'Product',
  links: [{
    id: 'invoicing',
    label: 'Invoicing',
    href: '#'
  }, {
    id: 'payments',
    label: 'Payments',
    href: '#'
  }, {
    id: 'automation',
    label: 'Automation',
    href: '#'
  }, {
    id: 'reporting',
    label: 'Reporting',
    href: '#'
  }, {
    id: 'integrations',
    label: 'Integrations',
    href: '#'
  }],
  className: 'col-span-2 lg:col-span-1'
}, {
  id: 'company',
  title: 'Company',
  links: [{
    id: 'about',
    label: 'About',
    href: '#'
  }, {
    id: 'careers',
    label: 'Careers',
    href: '#'
  }, {
    id: 'blog',
    label: 'Blog',
    href: '#'
  }, {
    id: 'press',
    label: 'Press',
    href: '#'
  }, {
    id: 'contact',
    label: 'Contact',
    href: '#'
  }],
  className: ''
}, {
  id: 'resources',
  title: 'Resources',
  links: [{
    id: 'docs',
    label: 'Docs',
    href: '#'
  }, {
    id: 'api-reference',
    label: 'API Reference',
    href: '#'
  }, {
    id: 'changelog',
    label: 'Changelog',
    href: '#'
  }, {
    id: 'status',
    label: 'Status',
    href: '#'
  }, {
    id: 'security',
    label: 'Security',
    href: '#'
  }],
  className: ''
}, {
  id: 'legal',
  title: 'Legal',
  links: [{
    id: 'privacy',
    label: 'Privacy',
    href: '#'
  }, {
    id: 'terms',
    label: 'Terms',
    href: '#'
  }, {
    id: 'cookie-policy',
    label: 'Cookie Policy',
    href: '#'
  }, {
    id: 'gdpr',
    label: 'GDPR',
    href: '#'
  }, {
    id: 'compliance',
    label: 'Compliance',
    href: '#'
  }],
  className: ''
}];
const API_CODE = `POST /api/v1/invoices
{
  "client_id": "client_9fx2a",
  "amount": 4800.00,
  "currency": "USD",
  "due_date": "2025-02-28",
  "line_items": [
    {
      "description": "Platform Access",
      "amount": 4800.00
    }
  ],
  "auto_remind": true
}`;
interface ParsedNumber {
  numeric: number;
  prefix: string;
  suffix: string;
  decimals: number;
  isNumeric: boolean;
}
interface TabButtonRect {
  left: number;
  width: number;
}
function useScrollDirection() {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return isScrolled;
}
function useIntersectionObserver(rootMargin = '0px 0px -80px 0px') {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, {
      rootMargin,
      threshold: 0.15
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);
  return {
    ref,
    isVisible
  };
}
function parseStatValue(value: string): ParsedNumber {
  const match = value.match(/^([^0-9.-]*)([0-9.,]+)(.*)$/);
  if (!match) {
    return {
      numeric: 0,
      prefix: value,
      suffix: '',
      decimals: 0,
      isNumeric: false
    };
  }
  const numericString = match[2].replace(/,/g, '');
  const numeric = Number(numericString);
  const decimalPart = numericString.split('.')[1];
  return {
    numeric: Number.isFinite(numeric) ? numeric : 0,
    prefix: match[1],
    suffix: match[3],
    decimals: decimalPart ? decimalPart.length : 0,
    isNumeric: Number.isFinite(numeric)
  };
}
function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3);
}
function formatCounter(value: string, progress: number) {
  const parsed = parseStatValue(value);
  if (!parsed.isNumeric) return value;
  const currentValue = parsed.numeric * progress;
  const formatted = currentValue.toLocaleString('en-US', {
    minimumFractionDigits: parsed.decimals,
    maximumFractionDigits: parsed.decimals
  });
  return `${parsed.prefix}${formatted}${parsed.suffix}`;
}
const FadeInUp = ({
  children,
  delay = 0,
  className = ''
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const {
    ref,
    isVisible
  } = useIntersectionObserver();
  return <div ref={ref} style={{
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(32px)',
    transition: `opacity 600ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms, transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
    willChange: 'transform, opacity'
  }} className={className}>
      {children}
    </div>;
};
export const InvoiceIQ = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { scrollToSection } = useScrollToSection();
  const isScrolled = useScrollDirection();
  const [activeTab, setActiveTab] = useState(TABS_DATA[0].id);
  const [typedCode, setTypedCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [isToastLeaving, setIsToastLeaving] = useState(false);
  const [tabTransitioning, setTabTransitioning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tabIndicator, setTabIndicator] = useState<TabButtonRect>({
    left: 0,
    width: 0
  });
  const [counterProgress, setCounterProgress] = useState(0);
  const [statsSeen, setStatsSeen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const tabListRef = useRef<HTMLDivElement>(null);
  const heroPreviewRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const hasTypedCode = useRef(false);
  const activeTabData = useMemo(() => TABS_DATA.find(tab => tab.id === activeTab) || TABS_DATA[0], [activeTab]);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const handleNavigate = useCallback((path: string) => {
    closeMobileMenu();
    navigate(path);
  }, [closeMobileMenu, navigate]);
  const handleScroll = useCallback((sectionId: string) => {
    closeMobileMenu();
    scrollToSection(sectionId);
  }, [closeMobileMenu, scrollToSection]);
  const handleScrollToDemo = useCallback((tabId?: string) => {
    if (tabId) {
      setActiveTab(tabId);
    }
    closeMobileMenu();
    scrollToSection(SECTIONS.HOW_IT_WORKS);
  }, [closeMobileMenu, scrollToSection]);
  const handleRegister = useCallback(() => handleNavigate(ROUTES.REGISTER), [handleNavigate]);
  const handleLogin = useCallback(() => handleNavigate(ROUTES.LOGIN), [handleNavigate]);
  const handleDashboard = useCallback(() => handleNavigate(ROUTES.DASHBOARD), [handleNavigate]);
  const handleLogout = useCallback(() => {
    closeMobileMenu();
    logout();
    navigate(ROUTES.HOME);
  }, [closeMobileMenu, logout, navigate]);
  const handleNavLink = useCallback((linkId: string) => {
    switch (linkId) {
      case 'features':
        handleScroll(SECTIONS.FEATURES);
        break;
      case 'integrations':
        handleScroll(SECTIONS.INTEGRATIONS);
        break;
      case 'pricing':
        handleScroll(SECTIONS.PRICING);
        break;
      case 'resources':
        handleScroll(SECTIONS.RESOURCES);
        break;
      case 'docs':
        handleNavigate(ROUTES.DOCS);
        break;
      default:
        break;
    }
  }, [handleNavigate, handleScroll]);
  const handleFooterLink = useCallback((groupId: string, linkId: string) => {
    const productActions: Record<string, () => void> = {
      invoicing: () => handleScrollToDemo('invoicing'),
      payments: () => handleScrollToDemo('payments'),
      automation: () => handleScrollToDemo('automation'),
      reporting: () => handleScrollToDemo('reporting'),
      integrations: () => handleScroll(SECTIONS.INTEGRATIONS),
    };
    const companyActions: Record<string, () => void> = {
      about: () => handleScroll(SECTIONS.FEATURES),
      careers: () => handleNavigate(ROUTES.CAREERS),
      blog: () => handleNavigate(ROUTES.BLOG),
      press: () => handleNavigate(ROUTES.PRESS),
      contact: () => handleScroll(SECTIONS.CONTACT),
    };
    const resourcesActions: Record<string, () => void> = {
      docs: () => handleNavigate(ROUTES.DOCS),
      'api-reference': () => handleScroll(SECTIONS.INTEGRATIONS),
      changelog: () => handleNavigate(ROUTES.BLOG),
      status: () => handleNavigate(ROUTES.DOCS),
      security: () => handleNavigate(ROUTES.COMPLIANCE),
    };
    const legalActions: Record<string, () => void> = {
      privacy: () => handleNavigate(ROUTES.PRIVACY),
      terms: () => handleNavigate(ROUTES.TERMS),
      'cookie-policy': () => handleNavigate(ROUTES.COOKIE_POLICY),
      gdpr: () => handleNavigate(ROUTES.GDPR),
      compliance: () => handleNavigate(ROUTES.COMPLIANCE),
    };
    const actionGroups: Record<string, Record<string, () => void>> = {
      product: productActions,
      company: companyActions,
      resources: resourcesActions,
      legal: legalActions,
    };
    actionGroups[groupId]?.[linkId]?.();
  }, [handleNavigate, handleScroll, handleScrollToDemo]);
  useEffect(() => {
    const loadingTimer = window.setTimeout(() => setIsLoading(false), 800);
    return () => window.clearTimeout(loadingTimer);
  }, []);
  useEffect(() => {
    if (isLoading) return undefined;
    const hash = window.location.hash.replace('#', '');
    if (!hash) return undefined;
    const scrollTimer = window.setTimeout(() => scrollToSection(hash), 120);
    return () => window.clearTimeout(scrollTimer);
  }, [isLoading, scrollToSection]);
  useEffect(() => {
    if (isLoading) return undefined;
    const toastTimer = window.setTimeout(() => setShowToast(true), 2000);
    const dismissTimer = window.setTimeout(() => setIsToastLeaving(true), 6000);
    const removeTimer = window.setTimeout(() => setShowToast(false), 6500);
    return () => {
      window.clearTimeout(toastTimer);
      window.clearTimeout(dismissTimer);
      window.clearTimeout(removeTimer);
    };
  }, [isLoading]);
  useEffect(() => {
    if (isLoading) return undefined;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealTargets = document.querySelectorAll<HTMLElement>('.reveal-target');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: reduceMotion ? 0.05 : 0.15,
      rootMargin: '0px 0px -80px 0px'
    });
    revealTargets.forEach(target => observer.observe(target));
    return () => observer.disconnect();
  }, [isLoading]);
  useEffect(() => {
    if (isLoading) return undefined;
    const magneticElements = document.querySelectorAll<HTMLElement>('[data-magnetic]');
    const rippleElements = document.querySelectorAll<HTMLElement>('[data-ripple]');
    const cleanups: Array<() => void> = [];
    magneticElements.forEach(element => {
      const strength = Number(element.dataset.magnetic || 0.15);
      const handleMove = (event: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * strength;
        const y = (event.clientY - rect.top - rect.height / 2) * strength;
        element.style.transition = 'transform 80ms cubic-bezier(0.4, 0, 0.2, 1)';
        element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      };
      const handleLeave = () => {
        element.style.transition = 'transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)';
        element.style.transform = 'translate3d(0, 0, 0)';
      };
      element.addEventListener('mousemove', handleMove);
      element.addEventListener('mouseleave', handleLeave);
      cleanups.push(() => {
        element.removeEventListener('mousemove', handleMove);
        element.removeEventListener('mouseleave', handleLeave);
      });
    });
    rippleElements.forEach(element => {
      const handleClick = (event: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height) * 2;
        ripple.className = 'ripple-wave';
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
        element.appendChild(ripple);
        window.setTimeout(() => ripple.remove(), 700);
      };
      element.addEventListener('click', handleClick);
      cleanups.push(() => element.removeEventListener('click', handleClick));
    });
    return () => cleanups.forEach(cleanup => cleanup());
  }, [isLoading, mobileMenuOpen]);
  useEffect(() => {
    if (isLoading) return undefined;
    const element = heroPreviewRef.current;
    if (!element) return undefined;
    let animationFrame = 0;
    const handleScroll = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const offset = Math.min(window.scrollY * 0.08, 52);
        element.style.setProperty('--parallax-y', `${offset}px`);
      });
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isLoading]);
  useEffect(() => {
    if (isLoading) return undefined;
    const element = codeRef.current;
    if (!element) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || hasTypedCode.current) return;
      hasTypedCode.current = true;
      let characterIndex = 0;
      const typeNext = () => {
        setTypedCode(API_CODE.substring(0, characterIndex));
        characterIndex += 1;
        if (characterIndex <= API_CODE.length) {
          window.setTimeout(typeNext, API_CODE[characterIndex - 1] === '\n' ? 120 : 18);
        } else {
          element.classList.add('code-complete');
        }
      };
      typeNext();
      observer.disconnect();
    }, {
      threshold: 0.35
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [isLoading]);
  useEffect(() => {
    if (isLoading) return undefined;
    const element = statsRef.current;
    if (!element) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStatsSeen(true);
        observer.disconnect();
      }
    }, {
      threshold: 0.35
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [isLoading]);
  useEffect(() => {
    if (!statsSeen) return undefined;
    let frame = 0;
    const start = performance.now();
    const duration = 1500;
    const animate = (time: number) => {
      const elapsed = Math.min((time - start) / duration, 1);
      setCounterProgress(easeOutCubic(elapsed));
      if (elapsed < 1) {
        frame = window.requestAnimationFrame(animate);
      }
    };
    setCounterProgress(0);
    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [activeTab, statsSeen]);
  useEffect(() => {
    const updateIndicator = () => {
      const container = tabListRef.current;
      if (!container) return;
      const activeButton = container.querySelector<HTMLButtonElement>(`button[data-tab-id="${activeTab}"]`);
      if (!activeButton) return;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      setTabIndicator({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width
      });
    };
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab, isLoading]);
  const handleTabClick = (tabId: string) => {
    if (tabId === activeTab) return;
    setTabTransitioning(true);
    window.setTimeout(() => {
      setActiveTab(tabId);
      window.setTimeout(() => setTabTransitioning(false), 40);
    }, 100);
  };
  const handleDashboardMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const element = dashboardRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    element.style.setProperty('--tilt-x', `${-y * 4}deg`);
    element.style.setProperty('--tilt-y', `${x * 3}deg`);
  };
  const handleDashboardLeave = () => {
    const element = dashboardRef.current;
    if (!element) return;
    element.style.setProperty('--tilt-x', '0deg');
    element.style.setProperty('--tilt-y', '0deg');
  };
  const handleSubscribe = () => {
    setSubscribed(true);
  };
  const dismissToast = () => {
    setIsToastLeaving(true);
    window.setTimeout(() => setShowToast(false), 360);
  };
  if (isLoading) {
    return <div className="min-h-screen font-sans skeleton-page" style={{
      backgroundColor: COLORS.background
    }}>
        <style dangerouslySetInnerHTML={{
        __html: premiumStyles
      }} />
        <nav className="fixed top-0 w-full z-50 py-5">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="skeleton-shimmer h-8 w-40 rounded-xl"></div>
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map(link => <div key={`skeleton-${link.id}`} className="skeleton-shimmer h-4 w-20 rounded-full"></div>)}
            </div>
            <div className="skeleton-shimmer h-10 w-32 rounded-full"></div>
          </div>
        </nav>
        <main className="pt-40 px-6">
          <section className="max-w-4xl mx-auto text-center space-y-5" aria-label="Loading InvoiceIQ homepage">
            <div className="skeleton-shimmer h-16 md:h-24 w-[90%] mx-auto rounded-2xl"></div>
            <div className="skeleton-shimmer h-16 md:h-24 w-[70%] mx-auto rounded-2xl"></div>
            <div className="skeleton-shimmer h-6 w-[50%] mx-auto rounded-full"></div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <div className="skeleton-shimmer h-14 w-full sm:w-40 rounded-full"></div>
              <div className="skeleton-shimmer h-14 w-full sm:w-44 rounded-full"></div>
            </div>
          </section>
        </main>
      </div>;
  }
  return <div className="min-h-screen font-sans selection:bg-[#BA5A5A] selection:text-white content-enter" style={{
    backgroundColor: COLORS.background,
    color: COLORS.textPrimary
  }}>
      <style dangerouslySetInnerHTML={{
      __html: premiumStyles
    }} />

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="premium-blob premium-blob-one"></div>
        <div className="premium-blob premium-blob-two"></div>
        <div className="premium-blob premium-blob-three"></div>
        <div className="premium-blob premium-blob-four"></div>
      </div>

      <nav className={`fixed top-0 w-full z-50 ${isScrolled ? 'glass-nav py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative">
          <Link to={ROUTES.HOME} onClick={closeMobileMenu} className="flex items-center gap-2 text-[#1E293B] nav-logo-enter">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#1E293B] text-[#BA5A5A] logo-orb">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="font-bold text-xl tracking-tight">InvoiceIQ</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => <button key={link.id} type="button" onClick={() => handleNavLink(link.id)} data-magnetic="0.15" className="premium-nav-link text-sm font-medium text-[#475569] hover:text-[#BA5A5A] transition-colors relative">
                <span>{link.label}</span>
              </button>)}
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setMobileMenuOpen(open => !open)} className="md:hidden p-2 text-[#1E293B] hover:text-[#BA5A5A] transition-colors" aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            {isAuthenticated ? <>
                <button type="button" onClick={handleDashboard} data-magnetic="0.15" className="premium-nav-link hidden md:block text-sm font-medium text-[#1E293B] hover:text-[#BA5A5A] transition-colors relative">
                  <span>Dashboard</span>
                </button>
                <button type="button" onClick={handleLogout} data-magnetic="0.3" data-ripple="true" className="premium-button bg-[#BA5A5A] hover:bg-[#a04b4b] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-[0_4px_14px_0_rgba(186,90,90,0.39)]">
                  <span>Logout</span>
                </button>
              </> : <>
                <button type="button" onClick={handleLogin} data-magnetic="0.15" className="premium-nav-link hidden md:block text-sm font-medium text-[#1E293B] hover:text-[#BA5A5A] transition-colors relative">
                  <span>Sign in</span>
                </button>
                <button type="button" onClick={handleRegister} data-magnetic="0.3" data-ripple="true" className="premium-button bg-[#BA5A5A] hover:bg-[#a04b4b] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-[0_4px_14px_0_rgba(186,90,90,0.39)]">
                  <span>Start free trial</span>
                </button>
              </>}
          </div>
          {mobileMenuOpen && <div className="md:hidden absolute top-full left-0 right-0 mt-3 mx-0 glass-nav border border-[#BA5A5A]/10 rounded-2xl px-6 py-6 shadow-lg">
              <div className="flex flex-col gap-4">
                {NAV_LINKS.map(link => <button key={`mobile-${link.id}`} type="button" onClick={() => handleNavLink(link.id)} className="premium-nav-link text-left text-sm font-medium text-[#475569] hover:text-[#BA5A5A] transition-colors relative py-1">
                    <span>{link.label}</span>
                  </button>)}
                <div className="border-t border-[#BA5A5A]/10 pt-4 flex flex-col gap-3">
                  {isAuthenticated ? <>
                      <button type="button" onClick={handleDashboard} className="premium-nav-link text-left text-sm font-medium text-[#1E293B] hover:text-[#BA5A5A] transition-colors relative py-1">
                        <span>Dashboard</span>
                      </button>
                      <button type="button" onClick={handleLogout} data-ripple="true" className="premium-button bg-[#BA5A5A] hover:bg-[#a04b4b] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-[0_4px_14px_0_rgba(186,90,90,0.39)] w-full">
                        <span>Logout</span>
                      </button>
                    </> : <>
                      <button type="button" onClick={handleLogin} className="premium-nav-link text-left text-sm font-medium text-[#1E293B] hover:text-[#BA5A5A] transition-colors relative py-1">
                        <span>Sign in</span>
                      </button>
                      <button type="button" onClick={handleRegister} data-ripple="true" className="premium-button bg-[#BA5A5A] hover:bg-[#a04b4b] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-[0_4px_14px_0_rgba(186,90,90,0.39)] w-full">
                        <span>Start free trial</span>
                      </button>
                    </>}
                </div>
              </div>
            </div>}
        </div>
      </nav>

      <main>
        <section className="relative pt-40 pb-20 overflow-hidden hero-grain">
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <h1 className="text-5xl md:text-7xl lg:text-8xl tracking-tight flex flex-col items-center gap-2 mb-6" aria-label="The smartest way to get paid, faster.">
              <span className="font-editorial italic text-[#475569] font-normal leading-tight tracking-normal hero-line" aria-hidden="true">
                <span className="word-reveal" style={{
                '--word-delay': '0ms'
              } as React.CSSProperties}>The</span>
                <span className="word-reveal" style={{
                '--word-delay': '80ms'
              } as React.CSSProperties}>smartest</span>
                <span className="word-reveal" style={{
                '--word-delay': '160ms'
              } as React.CSSProperties}>way</span>
                <span className="word-reveal" style={{
                '--word-delay': '240ms'
              } as React.CSSProperties}>to</span>
              </span>
              <span className="font-bold text-[#1E293B] leading-tight hero-line" aria-hidden="true">
                <span className="word-reveal" style={{
                '--word-delay': '320ms'
              } as React.CSSProperties}>get</span>
                <span className="word-reveal" style={{
                '--word-delay': '400ms'
              } as React.CSSProperties}>paid,</span>
                <span className="word-reveal" style={{
                '--word-delay': '480ms'
              } as React.CSSProperties}>faster.</span>
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-[#475569] mb-10 leading-relaxed hero-subheadline">
              <span>InvoiceIQ automates your entire invoicing workflow — from creation to collection — with AI that learns how your clients pay.</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 hero-actions">
              <button type="button" onClick={handleRegister} data-magnetic="0.3" data-ripple="true" className="premium-button bg-[#BA5A5A] hover:bg-[#a04b4b] text-white px-8 py-4 rounded-full text-base font-semibold transition-all shadow-[0_4px_20px_0_rgba(186,90,90,0.4)] flex items-center gap-2 w-full sm:w-auto justify-center">
                <span>Start for free</span>
                <ArrowRight size={18} />
              </button>
              <button type="button" onClick={() => handleScroll(SECTIONS.HOW_IT_WORKS)} data-magnetic="0.22" data-ripple="true" className="premium-secondary-button border border-[#86BCBD]/20 hover:border-[#86BCBD] text-[#1E293B] bg-white/50 hover:bg-white px-8 py-4 rounded-full text-base font-semibold transition-all w-full sm:w-auto">
                <span>See how it works</span>
              </button>
            </div>
          </div>

          <div className="absolute inset-0 pointer-events-auto overflow-hidden hidden md:block" aria-hidden="true">
            <div className="absolute top-[23%] left-[10%] pill-float premium-pill px-4 py-2 rounded-full bg-[#8a3f3f] text-white text-sm font-medium" style={{
            '--rotation': '-3deg',
            '--duration': '8.7s',
            '--delay': '-1.2s'
          } as React.CSSProperties}>
              <span>Smart Invoices</span>
            </div>
            <div className="absolute top-1/3 right-[15%] pill-float premium-pill px-4 py-2 rounded-full bg-[#86BCBD] text-[#1E293B] text-sm font-medium" style={{
            '--rotation': '4deg',
            '--duration': '9.4s',
            '--delay': '-3.1s'
          } as React.CSSProperties}>
              <span>Auto Reminders</span>
            </div>
            <div className="absolute top-[60%] left-[20%] pill-float premium-pill px-4 py-2 rounded-full bg-[#A4CE8B] text-[#1E293B] text-sm font-medium" style={{
            '--rotation': '2deg',
            '--duration': '7.6s',
            '--delay': '-0.6s'
          } as React.CSSProperties}>
              <span>Payment Tracking</span>
            </div>
            <div className="absolute bottom-1/4 right-[25%] pill-float premium-pill px-4 py-2 rounded-full bg-[#F7E49B] text-[#8a3f3f] text-sm font-medium border border-[#BA5A5A]/20" style={{
            '--rotation': '-2deg',
            '--duration': '8.9s',
            '--delay': '-4.3s'
          } as React.CSSProperties}>
              <span>Recurring Billing</span>
            </div>
          </div>

          <div ref={heroPreviewRef} className="mt-20 max-w-4xl mx-auto px-6 relative z-10 hero-dashboard-shell">
            <div className="hero-dashboard-glass">
              <div className="bg-[#1E293B] rounded-t-2xl p-6 md:p-8 shadow-2xl border-t border-x border-white/10 relative overflow-hidden h-64 mx-auto w-full max-w-3xl" style={{
              maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
            }}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#5AAE7A] traffic-green"></div>
                  </div>
                  <div className="h-6 w-32 bg-white/5 rounded-full"></div>
                </div>
                <div className="space-y-4">
                  {HERO_ROWS.map(row => <div key={row.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 dashboard-row-hover">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#86BCBD]/20 flex items-center justify-center text-[#86BCBD] font-bold">
                          <span>{row.initial}</span>
                        </div>
                        <div>
                          <div className="h-4 w-24 bg-white/20 rounded mb-2"></div>
                          <div className="h-3 w-16 bg-white/10 rounded"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium mb-1"><span>{row.amount}</span></div>
                        <div className="text-xs text-[#5AAE7A] bg-[#5AAE7A]/20 px-2 py-1 rounded-full inline-block status-pulse-green"><span>Paid</span></div>
                      </div>
                    </div>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 border-y border-[#BA5A5A]/10 bg-white/50 reveal-target section-fade">
          <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#475569]"><span>Trusted by finance teams at</span></p>
          </div>
          <div className="relative w-full overflow-hidden marquee-mask">
            <div className="marquee-container">
              <div className="flex items-center gap-20 flex-shrink-0">
                {MARQUEE_LOGOS.map(logo => <span key={`first-${logo.id}`} className="wordmark text-xl md:text-2xl font-bold text-[#475569]/40 whitespace-nowrap">{logo.label}</span>)}
                {MARQUEE_LOGOS.map(logo => <span key={`second-${logo.id}`} className="wordmark text-xl md:text-2xl font-bold text-[#475569]/40 whitespace-nowrap">{logo.label}</span>)}
              </div>
            </div>
          </div>
        </section>

        <section id={SECTIONS.HOW_IT_WORKS} className="pt-8 pb-24 md:pt-12 md:pb-32 relative reveal-target section-fade">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 reveal-target heading-reveal">
              <h2 className="text-4xl md:text-5xl lg:text-6xl tracking-tight flex flex-col items-center gap-2">
                <span className="font-editorial italic text-[#475569] font-normal leading-tight">Teams building the</span>
                <span className="font-bold text-[#1E293B] leading-tight">future of billing</span>
              </h2>
            </div>

            <div ref={tabListRef} className="relative flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-12 mt-6 tab-switcher">
              <span className="tab-indicator" style={{
              transform: `translate3d(${tabIndicator.left}px, 0, 0)`,
              width: `${tabIndicator.width}px`
            }} aria-hidden="true"></span>
              {TABS_DATA.map(tab => <button key={tab.id} data-tab-id={tab.id} onClick={() => handleTabClick(tab.id)} className={`tab-button px-2 sm:px-3 md:px-4 lg:px-6 py-1.5 sm:py-2 md:py-2.5 rounded-full text-[10px] sm:text-xs md:text-sm font-semibold transition-all duration-300 ${activeTab === tab.id ? 'text-white shadow-md' : 'bg-white text-[#475569] hover:bg-white/80 border border-[#BA5A5A]/10 hover:border-[#BA5A5A]/30'}`}>
                  <span>{tab.label}</span>
                </button>)}
            </div>

            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <FadeInUp className="lg:col-span-5 order-2 lg:order-1">
                <div className={`transition-all duration-500 min-h-[300px] tab-content-panel ${tabTransitioning ? 'is-exiting' : 'is-entering'}`}>
                  <h3 className="text-3xl font-bold text-[#1E293B] mb-4"><span>{activeTabData.title}</span></h3>
                  <p className="text-lg text-[#475569] mb-8 leading-relaxed"><span>{activeTabData.description}</span></p>
                  <ul className="space-y-4 mb-8">
                    {activeTabData.features.map(feature => <li key={feature.id} className="flex items-center gap-3 text-[#1E293B] font-medium">
                        <CheckCircle2 className="text-[#86BCBD]" size={20} />
                        <span>{feature.label}</span>
                      </li>)}
                  </ul>
                  <button type="button" onClick={() => handleScroll(SECTIONS.FEATURES)} className="text-[#BA5A5A] font-semibold flex items-center gap-2 hover:gap-3 transition-all premium-text-button">
                    <span>Explore {activeTabData.label.toLowerCase()} features</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </FadeInUp>

              <FadeInUp delay={200} className="lg:col-span-7 order-1 lg:order-2 dashboard-perspective">
                <div ref={dashboardRef} onMouseMove={handleDashboardMove} onMouseLeave={handleDashboardLeave} className="dashboard-mockup bg-[#1E293B] rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden relative reveal-target">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#86BCBD] opacity-5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>

                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white/60 text-sm font-medium uppercase tracking-wider">Recent Invoices</span>
                      </div>
                      {INVOICE_ROWS.map(row => <div key={row.id} className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center dashboard-row-hover">
                          <div>
                            <div className="text-white font-medium text-sm"><span>{row.invoice}</span></div>
                            <div className="text-white/40 text-xs"><span>{row.company}</span></div>
                          </div>
                          <div className={`text-xs px-2.5 py-1 rounded-full border ${row.status === 'Paid' ? 'status-pulse-green text-[#5AAE7A] border-[#5AAE7A]/30 bg-[#5AAE7A]/10' : row.status === 'Pending' ? 'text-[#E3B341] border-[#E3B341]/30 bg-[#E3B341]/10' : 'status-pulse-red text-[#C95F5F] border-[#C95F5F]/30 bg-[#C95F5F]/10'}`}>
                            <span>{row.status === 'Paid' ? 'Paid ✓' : row.status === 'Pending' ? 'Pending ●' : 'Overdue !'}</span>
                          </div>
                        </div>)}
                    </div>

                    <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col chart-card">
                      <span className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4">Cash Flow</span>
                      <div className="flex-1 relative flex items-end justify-between gap-2 h-32 pt-4 chart-stage">
                        {CHART_BARS.map(bar => <div key={bar.id} className="w-full bg-[#86BCBD]/20 rounded-t-sm relative group cursor-pointer hover:bg-[#86BCBD]/40 transition-colors chart-bar" style={{
                        height: `${bar.height}%`
                      }}>
                            <div className="absolute -top-1 left-0 right-0 h-1 bg-[#86BCBD] rounded-t-sm"></div>
                          </div>)}
                        <svg className="absolute inset-0 h-full w-full chart-svg" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
                          <polyline className="chart-line" points="0,60 16,40 33,70 50,20 66,50 83,10 100,30" fill="none" stroke="#A4CE8B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          {CHART_POINTS.map(point => <circle key={point.id} className="chart-dot" cx={point.cx} cy={point.cy} r="1.7" fill="#A4CE8B" />)}
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div ref={statsRef} className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 stat-card">
                      <div className="text-2xl font-bold text-white mb-1"><span>{formatCounter(activeTabData.stats.primary, counterProgress)}</span></div>
                      <div className="text-white/50 text-sm"><span>{activeTabData.stats.primaryLabel}</span></div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 stat-card">
                      <div className="text-2xl font-bold text-white mb-1"><span>{formatCounter(activeTabData.stats.secondary, counterProgress)}</span></div>
                      <div className="text-white/50 text-sm"><span>{activeTabData.stats.secondaryLabel}</span></div>
                    </div>
                  </div>
                </div>
              </FadeInUp>
            </div>
          </div>
        </section>

        <section id={SECTIONS.INTEGRATIONS} className="py-24 bg-white relative overflow-hidden reveal-target section-fade">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <FadeInUp className="order-2 lg:order-1 z-10">
              <div className="reveal-target heading-reveal">
                <h2 className="text-4xl md:text-5xl lg:text-6xl tracking-tight flex flex-col gap-2 mb-6">
                  <span className="font-editorial italic text-[#475569] font-normal leading-tight">Built for teams,</span>
                  <span className="font-bold text-[#1E293B] leading-tight">loved by finance.</span>
                </h2>
              </div>
              <p className="text-lg text-[#475569] mb-8 leading-relaxed max-w-md reveal-target subheading-reveal">
                <span>InvoiceIQ features a powerful API-first architecture. Integrate billing directly into your product, automate workflows, and sync with your existing accounting stack seamlessly.</span>
              </p>
              <button type="button" onClick={() => handleNavigate(ROUTES.DOCS)} data-ripple="true" data-magnetic="0.25" className="premium-button bg-[#86BCBD] hover:bg-[#6EA9AA] text-white px-8 py-4 rounded-full text-base font-semibold transition-all flex items-center gap-2">
                <span>View API docs</span>
                <ArrowRight size={18} />
              </button>
            </FadeInUp>

            <FadeInUp delay={200} className="order-1 lg:order-2 relative">
              <div className="absolute -left-8 top-12 pill-float snippet-chip z-20 px-4 py-2 rounded-lg text-white font-mono text-sm shadow-xl hidden md:block" style={{
              '--rotation': '-6deg',
              '--duration': '7.2s',
              '--delay': '-1.6s'
            } as React.CSSProperties}>
                <span>{'<Invoice />'}</span>
              </div>
              <div className="absolute right-0 top-24 pill-float snippet-chip z-20 px-4 py-2 rounded-lg text-[#A4CE8B] font-mono text-sm shadow-lg hidden md:block" style={{
              '--rotation': '4deg',
              '--duration': '8.4s',
              '--delay': '-2.9s'
            } as React.CSSProperties}>
                <span>return payments</span>
              </div>
              <div className="absolute -bottom-6 left-12 pill-float snippet-chip z-20 px-4 py-2 rounded-lg text-[#D1FAE5] font-mono text-sm shadow-xl hidden md:block" style={{
              '--rotation': '3deg',
              '--duration': '6.8s',
              '--delay': '-4.7s'
            } as React.CSSProperties}>
                <span>autoRemind: true</span>
              </div>

              <div ref={codeRef} className="relative code-window rounded-xl overflow-hidden flex flex-col reveal-target h-[400px]">
                <div className="bg-[#1E293B]/90 px-4 py-3 flex items-center gap-2 border-b border-[#86BCBD]/10">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#5AAE7A] traffic-green"></div>
                  <span className="ml-4 text-xs font-mono text-white/40">create_invoice.js</span>
                </div>
                <div className="p-6 overflow-auto flex-1 font-mono text-sm leading-relaxed whitespace-pre code-body" aria-label="InvoiceIQ API request example">
                  <span className="text-[#86BCBD]">{typedCode.split('POST')[0]}</span>
                  {typedCode.includes('POST') && <span className="text-[#F59E0B]">POST</span>}
                  <span className="text-[#A4CE8B]">{typedCode.split('POST')[1]?.split('{')[0]}</span>
                  {typedCode.includes('{') && <span className="text-white">{'{' + typedCode.split('{')[1]}</span>}
                  <span className="code-cursor"></span>
                </div>
              </div>
            </FadeInUp>
          </div>
        </section>

        <section id={SECTIONS.FEATURES} className="pt-8 pb-24 md:pt-12 md:pb-32 reveal-target section-fade">
          <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 reveal-target heading-reveal">
  <h2 className="text-3xl md:text-5xl font-bold text-[#1E293B]">
    <span
      className="inline-block"
      style={{ transform: "translateY(-8.5px)" }}
    >
      Ship faster, get paid sooner.
    </span>
  </h2>
</div>

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-16 mt-6">
              {FEATURES.map(feature => <article key={feature.id} id={feature.id === 'compliance-ready' ? 'feature-compliance-ready' : undefined} className="feature-card flex gap-6 reveal-target" style={{
              '--stagger-delay': `${FEATURES.findIndex(item => item.id === feature.id) * 80}ms`
            } as React.CSSProperties}>
                  <div className={`feature-icon feature-icon-${feature.icon} flex-shrink-0 w-12 h-12 rounded-xl bg-[#EEF4F2] text-[#86BCBD] flex items-center justify-center shadow-sm`}>
                    {feature.icon === 'zap' && <Zap size={24} />}
                    {feature.icon === 'clock' && <Clock size={24} />}
                    {feature.icon === 'file' && <FileText size={24} />}
                    {feature.icon === 'shield' && <Shield size={24} />}
                    {feature.icon === 'users' && <Users size={24} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1E293B] mb-2"><span>{feature.title}</span></h3>
                    <p className="text-[#475569] leading-relaxed"><span>{feature.desc}</span></p>
                  </div>
                </article>)}
            </div>
          </div>
        </section>

        <PricingSection onRegister={handleRegister} onScrollToContact={() => handleScroll(SECTIONS.CONTACT)} />

        <section className="cta-mesh bg-[#1E293B] pt-8 pb-24 md:pt-12 md:pb-32 px-6 text-center reveal-target section-fade">
          <div className="max-w-3xl mx-auto relative z-10">
        <div className="reveal-target cta-heading-reveal">
  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
    <span
      className="inline-block"
      style={{ transform: "translateY(-10px)" }}
    >
      Start getting paid on time.
    </span>
  </h2>
</div>
            <p className="text-[#86BCBD] text-lg md:text-xl mb-10 mt-5 reveal-target subheading-reveal">
              <span>Join 12,000+ businesses that use InvoiceIQ to automate their revenue operations.</span>
            </p>
            <button type="button" onClick={handleRegister} data-ripple="true" data-magnetic="0.28" className="cta-button premium-button text-[#1E293B] px-10 py-4 rounded-full text-lg font-bold transition-all">
              <span>Get started free →</span>
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-[#1E293B] pt-20 pb-10 border-t border-white/5 reveal-target section-fade">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16 text-sm">
            {FOOTER_GROUPS.map(group => <div key={group.id} id={group.id === 'resources' ? SECTIONS.RESOURCES : undefined} className={group.className}>
                <h4 className="text-white font-semibold mb-4"><span>{group.title}</span></h4>
                <ul className="space-y-3 text-[#475569]">
                  {group.links.map(link => <li key={link.id}>
                      <button type="button" onClick={() => handleFooterLink(group.id, link.id)} className="footer-link transition-colors"><span>{link.label}</span></button>
                    </li>)}
                </ul>
              </div>)}
            <div id={SECTIONS.CONTACT} className="col-span-2 lg:col-span-1">
              <h4 className="text-white font-semibold mb-4"><span>Contact</span></h4>
              <ul className="space-y-3 text-[#475569] mb-6">
                <li><a href="mailto:hello@invoiceiq.io" className="footer-link transition-colors"><span>hello@invoiceiq.io</span></a></li>
              </ul>
              <div className="flex gap-4 text-[#475569]">
                <span aria-disabled="true" aria-label="LinkedIn" className="social-link opacity-40 cursor-not-allowed pointer-events-none">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                </span>
                <span aria-disabled="true" aria-label="X" className="social-link opacity-40 cursor-not-allowed pointer-events-none">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#8a3f3f]/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-[#475569]">
            <Link to={ROUTES.HOME} className="flex items-center gap-2 text-white">
              <div className="flex items-center justify-center w-6 h-6 rounded bg-[#BA5A5A] text-white logo-orb">
                <Zap size={14} fill="currentColor" />
              </div>
              <span className="font-bold tracking-tight">InvoiceIQ</span>
            </Link>
            <div><span>© 2025 InvoiceIQ, Inc. All rights reserved.</span></div>
            <div className="flex items-center gap-4">
              <span>SOC 2 Certified</span>
              <div className="newsletter-shell flex items-center gap-2 bg-[#8a3f3f] p-1 rounded-full pl-4 border border-[#BA5A5A]/20">
                <input type="email" aria-label="Email for InvoiceIQ updates" placeholder="Stay sharp. Get updates." className="newsletter-input bg-transparent text-white text-xs outline-none w-36 placeholder:text-[#475569]" />
                <button data-ripple="true" onClick={handleSubscribe} className={`newsletter-button bg-[#86BCBD] hover:bg-[#A4CE8B] text-[#1E293B] px-3 py-1.5 rounded-full font-medium transition-colors text-xs ${subscribed ? 'is-subscribed' : ''}`}>
                  <span>{subscribed ? '✓ Subscribed!' : 'Subscribe'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {showToast && <button type="button" onClick={dismissToast} className={`toast-notification ${isToastLeaving ? 'is-leaving' : ''}`} aria-label="Dismiss notification">
          <span className="toast-icon"><Shield size={16} /></span>
          <span>✓ InvoiceIQ is SOC 2 certified</span>
        </button>}
    </div>;
};
const premiumStyles = `
  :root {
    --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  }

  .font-editorial { font-family: Georgia, Cambria, "Times New Roman", Times, serif; }
  .content-enter { animation: contentFade 520ms var(--ease-smooth) both; position: relative; overflow-x: hidden; }
  .skeleton-page { animation: contentFade 220ms var(--ease-smooth) both; }

  @keyframes contentFade {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes shimmer {
    0% { background-position: 180% 0; }
    100% { background-position: -180% 0; }
  }

  .skeleton-shimmer {
    background: linear-gradient(100deg, rgba(209,250,229,0.45) 0%, rgba(236,253,245,0.98) 45%, rgba(209,250,229,0.45) 90%);
    background-size: 220% 100%;
    animation: shimmer 1050ms var(--ease-smooth) infinite;
  }

  @keyframes blobDriftOne {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    50% { transform: translate3d(72px, 48px, 0) scale(1.05); }
  }

  @keyframes blobDriftTwo {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    50% { transform: translate3d(-84px, -56px, 0) scale(1.03); }
  }

  @keyframes blobPulse {
    0%, 100% { transform: translate3d(0, 0, 0) scale(0.94); opacity: 0.58; }
    50% { transform: translate3d(-28px, 36px, 0) scale(1.08); opacity: 1; }
  }

  .premium-blob {
    position: fixed;
    border-radius: 9999px;
    filter: blur(120px);
    pointer-events: none;
    will-change: transform;
  }

  .premium-blob-one {
    top: -180px;
    left: -180px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(52, 211, 153, 0.15), transparent 67%);
    animation: blobDriftOne 20s var(--ease-smooth) infinite;
  }

  .premium-blob-two {
    right: -280px;
    bottom: -260px;
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, rgba(5, 150, 105, 0.10), transparent 68%);
    animation: blobDriftTwo 24s var(--ease-smooth) infinite;
  }

  .premium-blob-three {
    top: 34%;
    right: 3%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(110, 231, 183, 0.08), transparent 70%);
    animation: blobPulse 18s var(--ease-smooth) infinite;
  }

  .premium-blob-four {
    top: 58%;
    left: 14%;
    width: 360px;
    height: 360px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.07), transparent 70%);
    animation: blobDriftOne 28s var(--ease-smooth) infinite reverse;
  }

  .glass-nav {
    background: rgba(242, 248, 245, 0.85);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    box-shadow: 0 1px 0 rgba(16,185,129,0.1);
    border-bottom: 1px solid rgba(16,185,129,0.08);
  }

  nav { transition: all 400ms var(--ease-smooth); will-change: transform; }
  .nav-logo-enter { animation: navLogoEnter 700ms var(--ease-spring) 160ms both; }

  @keyframes navLogoEnter {
    from { opacity: 0; transform: translate3d(0, -10px, 0) scale(0.98); }
    to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
  }

  .logo-orb { box-shadow: 0 10px 30px rgba(5,46,28,0.12); transition: transform 300ms var(--ease-spring), box-shadow 300ms var(--ease-smooth); }
  .logo-orb:hover { transform: translateY(-1px) scale(1.04); box-shadow: 0 14px 38px rgba(5,46,28,0.18); }

  .premium-nav-link {
    display: inline-block;
    will-change: transform;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font: inherit;
  }

  .pricing-card { transition: transform 260ms var(--ease-spring), box-shadow 260ms var(--ease-smooth), border-color 260ms var(--ease-smooth); will-change: transform; }
  .pricing-card:hover { transform: translate3d(0, -6px, 0); box-shadow: 0 24px 60px rgba(16,185,129,0.12), 0 8px 20px rgba(5,46,28,0.08); }
  .pricing-card-highlighted:hover { box-shadow: 0 38px 100px rgba(5,46,28,0.24), 0 12px 32px rgba(5,46,28,0.12); }

  .premium-nav-link::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -4px;
    width: 100%;
    height: 2px;
    border-radius: 999px;
    background: #BA5A5A;
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 240ms var(--ease-smooth), transform-origin 0ms 240ms;
  }

  .premium-nav-link:hover::after {
    transform: scaleX(1);
    transform-origin: left;
    transition: transform 240ms var(--ease-smooth);
  }

  .premium-button, .premium-secondary-button, .newsletter-button, .toast-notification {
    position: relative;
    overflow: hidden;
    will-change: transform;
  }

  .premium-button:hover, .newsletter-button:hover {
    transform: scale(1.04);
    box-shadow: 0 0 30px rgba(16,185,129,0.35), 0 14px 38px rgba(5,46,28,0.12);
  }

  .premium-secondary-button:hover { transform: scale(1.035); box-shadow: 0 18px 44px rgba(5,46,28,0.08); }
  .ripple-wave { position: absolute; border-radius: 999px; background: rgba(255,255,255,0.55); pointer-events: none; transform: scale(0); opacity: 0.3; animation: rippleExpand 700ms var(--ease-smooth) forwards; }

  @keyframes rippleExpand {
    to { transform: scale(2); opacity: 0; }
  }

  .hero-grain::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.02;
    background-image: radial-gradient(circle at 1px 1px, #052E1C 1px, transparent 0);
    background-size: 18px 18px;
  }

  .hero-line { display: flex; flex-wrap: wrap; justify-content: center; column-gap: 0.25em; overflow: hidden; }
  .word-reveal { display: inline-block; clip-path: inset(0 100% 0 0); animation: wordClip 700ms var(--ease-smooth) var(--word-delay, 0ms) forwards; will-change: clip-path, transform, opacity; }

  @keyframes wordClip {
    from { clip-path: inset(0 100% 0 0); transform: translate3d(0, 8px, 0); opacity: 0.001; }
    to { clip-path: inset(0 0 0 0); transform: translate3d(0, 0, 0); opacity: 1; }
  }

  .hero-subheadline { opacity: 0; transform: translate3d(0, 20px, 0); animation: heroSubEnter 620ms var(--ease-smooth) 1150ms forwards; will-change: transform, opacity; }
  .hero-actions { opacity: 0; transform: scale(0.95); animation: heroActionsEnter 520ms var(--ease-spring) 1650ms forwards; will-change: transform, opacity; }

  @keyframes heroSubEnter { to { opacity: 1; transform: translate3d(0, 0, 0); } }
  @keyframes heroActionsEnter { to { opacity: 1; transform: scale(1); } }

  @keyframes float {
    0%, 100% { transform: translate3d(0, 0, 0) rotate(var(--rotation, 0deg)); box-shadow: 0 8px 32px rgba(5,46,28,0.12), 0 2px 8px rgba(5,46,28,0.08); }
    50% { transform: translate3d(0, -12px, 0) rotate(var(--rotation, 0deg)); box-shadow: 0 14px 38px rgba(5,46,28,0.15), 0 4px 14px rgba(5,46,28,0.10); }
  }

  .pill-float { animation: float var(--duration, 6s) ease-in-out infinite var(--delay, 0s); will-change: transform; }
  .premium-pill { pointer-events: auto; transition: transform 300ms var(--ease-spring), box-shadow 300ms var(--ease-smooth); }
  .premium-pill:hover { transform: translate3d(0, -6px, 0) scale(1.04) rotate(var(--rotation, 0deg)); box-shadow: inset 0 0 0 1.5px rgba(16,185,129,0.4), 0 20px 48px rgba(5,46,28,0.2) !important; animation-play-state: paused; }

  .hero-dashboard-shell { --parallax-y: 0px; opacity: 0; transform: translate3d(0, calc(40px + var(--parallax-y)), 0); animation: dashboardEnter 900ms var(--ease-spring) 800ms forwards; will-change: transform, opacity; }
  @keyframes dashboardEnter { to { opacity: 1; transform: translate3d(0, var(--parallax-y), 0); } }
  .hero-dashboard-glass { max-width: 768px; margin: 0 auto; padding: 12px; border-radius: 28px 28px 0 0; background: rgba(255,255,255,0.7); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(186,90,90,0.12); box-shadow: 0 32px 80px rgba(30,41,59,0.18), 0 8px 24px rgba(30,41,59,0.08); }
  .dashboard-row-hover { transition: transform 260ms var(--ease-spring), background-color 260ms var(--ease-smooth), border-color 260ms var(--ease-smooth); will-change: transform; }
  .dashboard-row-hover:hover { transform: translate3d(4px, -2px, 0); background-color: rgba(255,255,255,0.075); border-color: rgba(134,188,189,0.22); }

  @keyframes marquee { 0% { transform: translate3d(0,0,0); } 100% { transform: translate3d(-50%,0,0); } }
  .marquee-container { display: flex; width: max-content; animation: marquee 30s linear infinite; will-change: transform; }
  .marquee-mask { mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%); -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%); }
  .marquee-mask:hover .marquee-container { animation-play-state: paused; }
  .wordmark { transition: color 200ms var(--ease-smooth), transform 200ms var(--ease-smooth); will-change: transform; }
  .wordmark:hover { color: #BA5A5A; transform: scale(1.05); }

  .section-fade { opacity: 0; transition: opacity 600ms var(--ease-smooth); }
  .section-fade.is-visible { opacity: 1; }
  .heading-reveal h2, .cta-heading-reveal h2 { clip-path: inset(0 0 100% 0); transform: translate3d(0, 0, 0); transition: clip-path 600ms var(--ease-smooth), transform 600ms var(--ease-smooth); will-change: clip-path, transform; }
  .heading-reveal.is-visible h2, .cta-heading-reveal.is-visible h2 { clip-path: inset(0 0 0 0); transform: translate3d(0, 0, 0); }
  .subheading-reveal { opacity: 0; transform: translate3d(0, 16px, 0); transition: opacity 520ms var(--ease-smooth) 120ms, transform 520ms var(--ease-smooth) 120ms; will-change: transform, opacity; }
  .subheading-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }

  .tab-switcher { isolation: isolate; }
  .tab-indicator { position: absolute; top: 0; bottom: 0; left: 0; border-radius: 999px; background: #BA5A5A; box-shadow: 0 10px 24px rgba(186,90,90,0.22); transition: transform 400ms var(--ease-smooth), width 400ms var(--ease-smooth); z-index: 0; will-change: transform; }
  .tab-button { position: relative; z-index: 1; will-change: transform; }
  .tab-content-panel { will-change: transform, opacity; }
  .tab-content-panel.is-exiting { opacity: 0; transform: translate3d(-20px, 0, 0); transition: opacity 100ms var(--ease-smooth), transform 100ms var(--ease-smooth); }
  .tab-content-panel.is-entering { opacity: 1; transform: translate3d(0, 0, 0); transition: opacity 300ms var(--ease-smooth), transform 300ms var(--ease-smooth); }
  .premium-text-button svg { transition: transform 240ms var(--ease-smooth); }
  .premium-text-button:hover svg { transform: translate3d(3px, 0, 0); }

  .dashboard-perspective { perspective: 1200px; }
  .dashboard-mockup { transform-style: preserve-3d; transform: rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) translateZ(0); transition: transform 260ms var(--ease-smooth), clip-path 600ms var(--ease-smooth), opacity 600ms var(--ease-smooth), box-shadow 300ms var(--ease-smooth); will-change: transform, opacity, clip-path; clip-path: inset(8% 8% 8% 8% round 16px); opacity: 0; }
  .dashboard-mockup.is-visible { clip-path: inset(0 0 0 0 round 16px); opacity: 1; }
  .dashboard-mockup:hover { box-shadow: 0 38px 100px rgba(5,46,28,0.24), 0 12px 32px rgba(5,46,28,0.12); }

  @keyframes pulseGreen { 0%, 100% { box-shadow: 0 0 0 rgba(16,185,129,0); } 50% { box-shadow: 0 0 16px rgba(16,185,129,0.28); } }
  @keyframes pulseRed { 0%, 100% { box-shadow: 0 0 0 rgba(239,68,68,0); } 50% { box-shadow: 0 0 14px rgba(239,68,68,0.20); } }
  .status-pulse-green { animation: pulseGreen 3s var(--ease-smooth) infinite; }
  .status-pulse-red { animation: pulseRed 3s var(--ease-smooth) infinite; }

  .chart-bar { transform-origin: bottom; transform: scaleY(0.25); opacity: 0.55; transition: transform 700ms var(--ease-spring), opacity 700ms var(--ease-smooth); will-change: transform, opacity; }
  .dashboard-mockup.is-visible .chart-bar { transform: scaleY(1); opacity: 1; }
  .chart-line { stroke-dasharray: 220; stroke-dashoffset: 220; }
  .chart-dot { transform-box: fill-box; transform-origin: center; transform: scale(0); }
  .dashboard-mockup.is-visible .chart-line { animation: drawLine 1200ms var(--ease-smooth) 250ms forwards; }
  .dashboard-mockup.is-visible .chart-dot { animation: dotPop 320ms var(--ease-spring) 1350ms forwards; }
  .dashboard-mockup.is-visible .chart-dot:nth-of-type(2) { animation-delay: 1400ms; }
  .dashboard-mockup.is-visible .chart-dot:nth-of-type(3) { animation-delay: 1450ms; }
  .dashboard-mockup.is-visible .chart-dot:nth-of-type(4) { animation-delay: 1500ms; }
  .dashboard-mockup.is-visible .chart-dot:nth-of-type(5) { animation-delay: 1550ms; }
  .dashboard-mockup.is-visible .chart-dot:nth-of-type(6) { animation-delay: 1600ms; }
  .dashboard-mockup.is-visible .chart-dot:nth-of-type(7) { animation-delay: 1650ms; }
  @keyframes drawLine { to { stroke-dashoffset: 0; } }
  @keyframes dotPop { to { transform: scale(1); } }

  .stat-card { transition: transform 260ms var(--ease-spring), border-color 260ms var(--ease-smooth), background-color 260ms var(--ease-smooth); }
  .stat-card:hover { transform: translate3d(0, -3px, 0); border-color: rgba(164,206,139,0.18); background-color: rgba(255,255,255,0.07); }

  .code-window { background: rgba(30,41,59,0.92); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(134,188,189,0.15); box-shadow: 0 40px 100px rgba(0,0,0,0.3), 0 0 0 1px rgba(134,188,189,0.05); opacity: 0; transform: translate3d(0, 26px, 0); transition: opacity 650ms var(--ease-smooth), transform 650ms var(--ease-spring); will-change: transform, opacity; }
  .code-window.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
  .traffic-green { animation: trafficPulse 4s var(--ease-smooth) infinite; }
  @keyframes trafficPulse { 0%, 92%, 100% { transform: scale(1); } 96% { transform: scale(1.1); } }
  .code-cursor { display: inline-block; width: 2px; height: 1.1em; margin-left: 4px; background: #86BCBD; vertical-align: -0.18em; animation: cursorBlink 530ms steps(1) infinite; }
  .code-complete .code-cursor { animation: cursorFinish 1600ms steps(1) forwards; }
  @keyframes cursorBlink { 50% { opacity: 0; } }
  @keyframes cursorFinish { 0%, 20%, 40% { opacity: 1; } 10%, 30%, 50%, 100% { opacity: 0; } }
  .snippet-chip { background: rgba(255,255,255,0.08); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(186,90,90,0.2); transition: transform 300ms var(--ease-spring), box-shadow 300ms var(--ease-smooth); will-change: transform; }
  .snippet-chip:hover { transform: scale(1.08) translate3d(0, -4px, 0) rotate(var(--rotation, 0deg)); box-shadow: 0 0 32px rgba(186,90,90,0.22), 0 18px 42px rgba(0,0,0,0.18); animation-play-state: paused; }

  .feature-card { position: relative; padding: 18px; margin: -18px; border: 1px solid transparent; border-radius: 24px; background: rgba(255,255,255,0); opacity: 0; transform: translate3d(0, 32px, 0); transition: opacity 560ms var(--ease-smooth) var(--stagger-delay, 0ms), transform 560ms var(--ease-spring) var(--stagger-delay, 0ms), box-shadow 300ms var(--ease-smooth), border-color 300ms var(--ease-smooth), background 300ms var(--ease-smooth); will-change: transform, opacity; overflow: hidden; }
  .feature-card::before { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0; background: radial-gradient(circle at 12% 8%, rgba(134,188,189,0.05), transparent 42%); transition: opacity 300ms var(--ease-smooth); }
  .feature-card.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
  .feature-card:hover { transform: translate3d(0, -6px, 0); box-shadow: 0 24px 60px rgba(186,90,90,0.12), 0 8px 20px rgba(30,41,59,0.08); border-color: rgba(186,90,90,0.25); background: rgba(255,255,255,0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
  .feature-card:hover::before { opacity: 1; }
  .feature-icon { transition: transform 300ms var(--ease-spring), box-shadow 300ms var(--ease-smooth); will-change: transform; }
  .feature-card:hover .feature-icon-zap { transform: scale(1.2); }
  .feature-card:hover .feature-icon-file { transform: translate3d(0, -3px, 0); }
  .feature-card:hover .feature-icon-clock { transform: rotate(15deg); }
  .feature-card:hover .feature-icon-shield { transform: scale(1.1); box-shadow: 0 0 22px rgba(186,90,90,0.18); }
  .feature-card:hover .feature-icon-users { transform: scale(1.1); }

  .cta-mesh { position: relative; overflow: hidden; }
  .cta-mesh::before { content: ''; position: absolute; inset: -20%; pointer-events: none; background: radial-gradient(circle at 18% 22%, rgba(186,90,90,0.13), transparent 26%), radial-gradient(circle at 80% 12%, rgba(134,188,189,0.12), transparent 30%), radial-gradient(circle at 54% 86%, rgba(164,206,139,0.14), transparent 28%); animation: ctaMesh 26s var(--ease-smooth) infinite; will-change: transform; }
  @keyframes ctaMesh { 0%,100% { transform: translate3d(0,0,0) rotate(0deg); } 50% { transform: translate3d(3%, -2%, 0) rotate(2deg); } }
  .cta-button { background: linear-gradient(135deg, #BA5A5A, #a04b4b); background-size: 200% 100%; box-shadow: 0 0 0 0 rgba(186,90,90,0); transition: background-position 400ms var(--ease-smooth), box-shadow 400ms var(--ease-smooth), transform 300ms var(--ease-spring); }
  .cta-button:hover { background-position: right center; box-shadow: 0 0 40px 8px rgba(186,90,90,0.3); transform: scale(1.04); }

  .newsletter-shell { transition: border-color 200ms var(--ease-smooth), box-shadow 200ms var(--ease-smooth); }
  .newsletter-shell:focus-within { border-color: #BA5A5A; box-shadow: 0 0 0 3px rgba(186,90,90,0.15); }
  .newsletter-button.is-subscribed { animation: subscribedBounce 360ms var(--ease-spring); }
  @keyframes subscribedBounce { 0% { transform: scale(0.95); } 100% { transform: scale(1); } }
  .footer-link { display: inline-flex; align-items: center; gap: 5px; transition: color 150ms var(--ease-smooth), transform 150ms var(--ease-smooth); will-change: transform; background: none; border: none; padding: 0; cursor: pointer; color: inherit; font: inherit; text-align: left; }
  .footer-link::after { content: '→'; opacity: 0; transform: translate3d(-4px, 0, 0); transition: opacity 150ms var(--ease-smooth), transform 150ms var(--ease-smooth); }
  .footer-link:hover { color: #86BCBD; transform: translate3d(3px, 0, 0); }
  .footer-link:hover::after { opacity: 1; transform: translate3d(0, 0, 0); }
  .social-link { display: inline-flex; transition: transform 200ms var(--ease-spring), color 200ms var(--ease-smooth); }
  .social-link:hover { transform: translate3d(0, -2px, 0) scale(1.08); }

  .toast-notification { position: fixed; right: 24px; bottom: 24px; z-index: 60; display: inline-flex; align-items: center; gap: 10px; padding: 14px 18px 14px 14px; border-radius: 18px; background: #1E293B; color: #fff; border: 1px solid rgba(186,90,90,0.20); border-left: 4px solid #BA5A5A; box-shadow: 0 24px 70px rgba(30,41,59,0.28), 0 8px 20px rgba(0,0,0,0.16); animation: toastIn 400ms var(--ease-spring) both; cursor: pointer; }
  .toast-notification.is-leaving { animation: toastOut 320ms var(--ease-smooth) forwards; }
  .toast-icon { display: inline-flex; color: #86BCBD; }
  @keyframes toastIn { from { opacity: 0; transform: translate3d(0, 100px, 0) scale(0.96); } to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); } }
  @keyframes toastOut { to { opacity: 0; transform: translate3d(0, 28px, 0) scale(0.95); } }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 1ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: 120ms !important; }
    .premium-blob, .pill-float, .marquee-container, .cta-mesh::before { animation: none !important; }
    .word-reveal, .heading-reveal h2, .cta-heading-reveal h2 { clip-path: inset(0 0 0 0) !important; }
  }
`;