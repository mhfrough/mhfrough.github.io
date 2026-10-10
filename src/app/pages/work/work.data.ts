// Work index data. Facts only, from docs/content.md. Titles are anonymized: never name employers or client banks.
// The Home page may import PROJECTS / FEATURED from here.

export type WorkCategory = 'fintech' | 'saas' | 'commerce' | 'public' | 'own';

export interface WorkStat {
  value: string;
  label: string;
}

export interface WorkProject {
  id: string;
  title: string;
  /** Short domain label shown in mono, e.g. 'Tax and banking'. */
  domain: string;
  /** Year range in words, never with dashes: '2020 to now', '2023 to 2024', '2022'. Omitted when unknown. */
  years?: string;
  /** Earliest year, for JSON-LD dateCreated. */
  startYear?: number;
  /** Extra context shown after the years, e.g. 'UK'. */
  where?: string;
  role: string;
  /** One or two lines, facts only. */
  outcome: string;
  stack: string[];
  categories: WorkCategory[];
  /** Phosphor regular icon name (must be registered in work.ts). */
  icon: string;
  /** Shown only when the cell is wide enough. */
  stats?: WorkStat[];
  /** Optional live external link (no dead links: only set when it exists). */
  link?: { label: string; href: string };
  freelance?: boolean;
}

export interface FeaturedProject {
  id: string;
  title: string;
  domain: string;
  years: string;
  startYear: number;
  oneLiner: string;
  stack: string[];
  categories: WorkCategory[];
  path: string;
  cover: { src: string; width: number; height: number; alt: string };
  liveUrl: string;
  repoUrl: string;
}

export const CATEGORIES: { id: 'all' | WorkCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'fintech', label: 'Fintech and tax' },
  { id: 'saas', label: 'SaaS' },
  { id: 'commerce', label: 'Commerce and booking' },
  { id: 'public', label: 'Public sector' },
  { id: 'own', label: 'Own products' },
];

export const FEATURED: FeaturedProject = {
  id: 'quorum',
  title: 'Quorum',
  domain: 'Own product',
  years: '2026',
  startYear: 2026,
  oneLiner:
    'A Claude Code skill for hard decisions: seven personality sub-agents debate, vote and return a clear YES or NO with next steps.',
  stack: ['Claude Code', 'Multi-agent', 'Vanilla JS', 'Playwright', 'MIT'],
  categories: ['own'],
  path: '/work/quorum',
  cover: {
    src: '/images/quorum/og-cover.webp',
    width: 1200,
    height: 630,
    alt: 'Quorum cover: "One decision. Seven minds." above the seven council members and a /quorum command.',
  },
  liveUrl: 'https://mhfrough.github.io/quorum/',
  repoUrl: 'https://github.com/mhfrough/quorum',
};

// Order matters: the bento layout gives wide cells to positions 0, 6 and 10 in the "All" view.
export const PROJECTS: WorkProject[] = [
  {
    id: 'tax-filing',
    title: 'Tax-filing platform, micro-frontends',
    domain: 'Tax and banking',
    years: '2020 to now',
    startYear: 2020,
    role: 'Junior to lead frontend developer',
    outcome:
      'Four Angular apps (filing portal, customer dashboard, agent portal, admin) with language switching, plus cross-domain filing widgets embedded in 6 partner banking apps.',
    stack: ['Angular', 'Micro-frontends', 'TypeScript', 'PHP', 'Firebase', 'i18n'],
    categories: ['fintech'],
    icon: 'phosphorReceipt',
    stats: [
      { value: '4', label: 'Angular apps' },
      { value: '6', label: 'partner banking apps' },
    ],
  },
  {
    id: 'fund-marketplace',
    title: 'Mutual fund investment marketplace',
    domain: 'Investment',
    years: '2020 to now',
    startYear: 2020,
    role: 'UI design and Angular frontend',
    outcome:
      'Digital account opening, online investing and portfolio tracking for a regulator-licensed platform, with national-ID-verified digital KYC.',
    stack: ['Angular', 'Angular Material', 'RxJS', 'ngx-charts'],
    categories: ['fintech'],
    icon: 'phosphorChartLineUp',
  },
  {
    id: 'microfinance',
    title: 'Microfinance loan-management platform',
    domain: 'Microfinance',
    years: '2023 to 2024',
    startYear: 2023,
    role: 'UI design and Angular frontend',
    outcome:
      'Registration to repayment in one flow: KYC, field verification, multi-level approvals, disbursement and EMI schedules, with real-time dashboards.',
    stack: ['Angular', 'Angular Material', 'Adobe XD'],
    categories: ['fintech'],
    icon: 'phosphorHandCoins',
  },
  {
    id: 'fleet',
    title: 'Fleet and driver management SaaS',
    domain: 'Fleet operations',
    years: '2026',
    startYear: 2026,
    where: 'UK',
    role: 'Full-stack developer, part-time contract',
    outcome:
      'Multi-tenant NestJS API, Angular admin and a Flutter driver app, with passkey sign-in, Stripe billing, real-time notifications and a WCAG 2.1 AA pass.',
    stack: ['NestJS', 'PostgreSQL', 'Angular', 'Flutter', 'Stripe', 'WebAuthn'],
    categories: ['saas'],
    icon: 'phosphorTruck',
    stats: [
      { value: '3', label: 'API, admin and driver app' },
      { value: '4', label: 'Flutter targets' },
    ],
  },
  {
    id: 'data-extraction',
    title: 'Banking data-extraction tool',
    domain: 'Banking, internal',
    years: '2024 to now',
    startYear: 2024,
    role: 'Angular frontend',
    outcome:
      'Bank staff upload and download large transaction datasets from DB2, flat-file and MongoDB sources and track every extraction job.',
    stack: ['Angular', 'TypeScript', 'RxJS'],
    categories: ['fintech'],
    icon: 'phosphorDatabase',
  },
  {
    id: 'practice-management',
    title: 'Practice-management SaaS for tax firms',
    domain: 'Accounting',
    years: '2024 to now',
    startYear: 2024,
    role: 'UI design and multi-tenant frontend',
    outcome:
      'A workspace for tax consultants and accounting firms, with a tenant-provisioning layer that sets up each new firm.',
    stack: ['Angular', 'PrimeNG', 'Firebase', 'Multi-tenant'],
    categories: ['saas', 'fintech'],
    icon: 'phosphorBriefcase',
  },
  {
    id: 'omnichannel-inbox',
    title: 'Omnichannel customer-engagement inbox',
    domain: 'B2B SaaS',
    years: '2024 to now',
    startYear: 2024,
    role: 'Multi-tenant frontend and embeddable widget',
    outcome:
      'One inbox for website chat, WhatsApp, Messenger and Instagram, plus a live-chat widget shipped as an Angular component and a framework-agnostic JS build.',
    stack: ['Angular', 'Multi-tenant', 'Embeddable widget', 'Real-time'],
    categories: ['saas'],
    icon: 'phosphorChatsCircle',
    stats: [
      { value: '4', label: 'channels, one inbox' },
      { value: '2', label: 'widget builds' },
    ],
  },
  {
    id: 'company-formation',
    title: 'Company-formation, tax and bookkeeping PWAs',
    domain: 'Business services',
    years: '2022 to now',
    startYear: 2022,
    role: 'UI design and Angular frontend',
    outcome: 'Two installable Angular PWAs on Firebase for sister platforms, with on-page SEO.',
    stack: ['Angular', 'PWA', 'Firebase', 'SEO'],
    categories: ['fintech'],
    icon: 'phosphorBuildingOffice',
  },
  {
    id: 'engagement-site',
    title: 'Customer-engagement site and product frontend',
    domain: 'Marketing and product',
    role: 'Server-rendered site and product frontend',
    outcome: 'Marketing site and product frontend, server-side rendered with Angular and Express.',
    stack: ['Angular SSR', 'Express', 'SEO'],
    categories: ['saas'],
    icon: 'phosphorBrowser',
  },
  {
    id: 'resort-booking',
    title: 'Resort booking and reservations',
    domain: 'Hospitality',
    role: 'Full-stack, Angular and NestJS',
    outcome: 'Public booking site and admin reservations, kept in sync in real time with Socket.io.',
    stack: ['Angular', 'NestJS', 'Socket.io'],
    categories: ['commerce'],
    icon: 'phosphorTreePalm',
  },
  {
    id: 'food-ordering',
    title: 'Multi-brand food-ordering platform',
    domain: 'Food ordering',
    years: '2023 to 2024',
    startYear: 2023,
    where: 'Germany',
    role: 'Freelance, storefront and back office',
    outcome:
      'One shared template running 7 pizzeria and cloud-kitchen brands: menu, cart, OTP sign-in, payments and live order tracking, plus a role-based back office.',
    stack: ['Angular', 'OTP', 'Payments', 'Real-time'],
    categories: ['commerce'],
    icon: 'phosphorForkKnife',
    freelance: true,
    stats: [
      { value: '7', label: 'brands' },
      { value: '1', label: 'shared template' },
    ],
  },
  {
    id: 'courier',
    title: 'Courier and logistics platform',
    domain: 'Logistics',
    role: 'Freelance',
    outcome: 'Live Google Maps fare calculation and driver-assignment tracking.',
    stack: ['Google Maps', 'Real-time'],
    categories: ['commerce'],
    icon: 'phosphorPackage',
    freelance: true,
  },
  {
    id: 'service-booking',
    title: 'Service-booking platforms',
    domain: 'Home services',
    where: 'UK',
    role: 'Freelance',
    outcome: 'Booking platforms for two UK service providers.',
    stack: ['Angular', 'Booking'],
    categories: ['commerce'],
    icon: 'phosphorCalendarCheck',
    freelance: true,
  },
  {
    id: 'complaint-portal',
    title: 'Municipal complaint portal',
    domain: 'Public sector',
    years: '2022',
    startYear: 2022,
    role: 'Angular frontend',
    outcome: 'Filing and tracking for public complaints, delivered in under two months.',
    stack: ['Angular', 'TypeScript'],
    categories: ['public'],
    icon: 'phosphorBuildings',
  },
  {
    id: 'property-listing',
    title: 'Property listing site',
    domain: 'Real estate',
    role: 'Freelance',
    outcome: 'Property listing site, built in both Angular and React.',
    stack: ['Angular', 'React'],
    categories: ['commerce'],
    icon: 'phosphorHouseLine',
    freelance: true,
  },
  {
    id: 'sme-accounting',
    title: 'Accounting and invoicing app for SMEs',
    domain: 'Accounting',
    years: '2020',
    startYear: 2020,
    role: 'Angular frontend, first production project',
    outcome: 'Screens for invoicing and expense tracking, with on-page SEO.',
    stack: ['Angular', 'SEO'],
    categories: ['fintech', 'saas'],
    icon: 'phosphorInvoice',
  },
  {
    id: 'corporate-sites',
    title: 'Corporate and marketing sites',
    domain: 'Web',
    role: 'Freelance',
    outcome: 'Company and marketing sites in PHP, Next.js and plain HTML, CSS and JS, including a static studio portfolio.',
    stack: ['PHP', 'Next.js', 'HTML', 'CSS'],
    categories: [],
    icon: 'phosphorGlobe',
    freelance: true,
  },
  {
    id: 'icon-ui-design',
    title: 'Icon and UI design',
    domain: 'Design',
    role: 'Designer',
    outcome: 'Icon sets, mockups and UI concepts made in Adobe XD and Canva.',
    stack: ['Adobe XD', 'Canva', 'UI/UX'],
    categories: [],
    icon: 'phosphorPenNib',
    freelance: true,
    link: { label: 'See it on Dribbble', href: 'https://dribbble.com/mhfrough' },
  },
];
