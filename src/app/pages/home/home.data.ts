// Home page content. Facts only, from docs/content.md. Employers and client banks are never named.

export type Domain = 'fintech' | 'saas' | 'realtime' | 'commerce' | 'own';

export interface HomeProject {
  id: string;
  title: string;
  sub: string;
  icon: string;
  domains: Domain[];
  years: string;
  outcome: string;
  stack: string[];
  href?: string;
}

export const PROJECTS: HomeProject[] = [
  {
    id: 'quorum',
    title: 'Quorum',
    sub: 'Claude Code skill',
    icon: 'phosphorUsersThree',
    domains: ['own'],
    years: '2026',
    outcome: 'Seven AI personalities debate a decision, vote, and hand back one verdict.',
    stack: ['Claude Code', 'Sub-agents', 'Three.js', 'Playwright'],
    href: '/work/quorum',
  },
  {
    id: 'tax',
    title: 'Tax-filing platform',
    sub: 'Micro-frontends',
    icon: 'phosphorReceipt',
    domains: ['fintech'],
    years: '2020 - now',
    outcome: 'Four Angular apps and a filing widget embedded in six banking apps.',
    stack: ['Angular', 'Micro-frontends', 'postMessage', 'i18n'],
  },
  {
    id: 'fleet',
    title: 'Fleet and driver SaaS',
    sub: 'Full stack, multi-tenant',
    icon: 'phosphorTruck',
    domains: ['saas', 'realtime'],
    years: '2026',
    outcome: 'NestJS API, Angular admin and a Flutter driver app, with passkeys and Stripe billing.',
    stack: ['NestJS', 'PostgreSQL', 'Flutter', 'WebAuthn'],
  },
  {
    id: 'inbox',
    title: 'Omnichannel inbox',
    sub: 'B2B SaaS',
    icon: 'phosphorChatsCircle',
    domains: ['saas', 'realtime'],
    years: '2024 - now',
    outcome: 'One inbox for web chat, WhatsApp, Messenger and Instagram, plus an embeddable chat widget.',
    stack: ['Angular', 'Real-time', 'Widgets', 'Multi-tenant'],
  },
  {
    id: 'funds',
    title: 'Mutual fund marketplace',
    sub: 'Fintech',
    icon: 'phosphorChartLineUp',
    domains: ['fintech'],
    years: '2020 - now',
    outcome: 'Digital account opening, verified KYC onboarding and an investor dashboard.',
    stack: ['Angular', 'RxJS', 'ngx-charts', 'KYC'],
  },
  {
    id: 'practice',
    title: 'Practice management',
    sub: 'SaaS for accounting firms',
    icon: 'phosphorBriefcase',
    domains: ['saas'],
    years: '2024 - now',
    outcome: 'Multi-tenant workspace with a provisioning layer that sets up each new firm.',
    stack: ['Angular', 'PrimeNG', 'Firebase'],
  },
  {
    id: 'food',
    title: 'Multi-brand ordering',
    sub: 'Seven restaurant brands',
    icon: 'phosphorStorefront',
    domains: ['commerce', 'realtime'],
    years: '2023 - 2024',
    outcome: 'One shared template runs ordering, OTP sign-in, payments and live tracking for seven brands.',
    stack: ['Angular', 'OTP', 'Payments', 'Back office'],
  },
  {
    id: 'loans',
    title: 'Microfinance lending',
    sub: 'Loan management',
    icon: 'phosphorHandCoins',
    domains: ['fintech'],
    years: '2023 - 2024',
    outcome: 'Applications, field verification, multi-level approvals and repayment tracking.',
    stack: ['Angular Material', 'Dashboards'],
  },
];

export const FILTERS: { id: 'all' | Domain; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'phosphorSquaresFour' },
  { id: 'fintech', label: 'Fintech', icon: 'phosphorBank' },
  { id: 'saas', label: 'SaaS', icon: 'phosphorCube' },
  { id: 'realtime', label: 'Real-time', icon: 'phosphorLightning' },
  { id: 'commerce', label: 'Commerce', icon: 'phosphorStorefront' },
  { id: 'own', label: 'Own products', icon: 'phosphorSparkle' },
];

export const STACK = [
  'Angular',
  'TypeScript',
  'RxJS',
  'Angular SSR',
  'Micro-frontends',
  'NestJS',
  'PostgreSQL',
  'TypeORM',
  'Flutter',
  'Firebase',
  'Supabase',
  'Stripe',
  'WebAuthn',
  'Socket.io',
  'AWS',
  'Cloudflare',
  'Coolify',
  'Playwright',
  'WCAG 2.1 AA',
  'Technical SEO',
  'Adobe XD',
];

export const HOW = [
  {
    icon: 'phosphorTreeStructure',
    title: 'Architect',
    body: 'Micro-frontends, multi-tenant SaaS and embeddable widgets, split so teams can ship without stepping on each other.',
  },
  {
    icon: 'phosphorPenNib',
    title: 'Design',
    body: 'Mockups and design systems first, so the build starts from decisions instead of guesses.',
  },
  {
    icon: 'phosphorCode',
    title: 'Build',
    body: 'Angular on the front, NestJS and PostgreSQL behind it, Flutter when it needs to be in a pocket.',
  },
  {
    icon: 'phosphorRocketLaunch',
    title: 'Ship',
    body: 'CI/CD to UAT and production, accessibility to WCAG 2.1 AA, and SEO that holds up in search.',
  },
];

export const EXPERIENCE = [
  { role: 'Lead frontend developer', years: '2025 - now', focus: 'Architecture and standards across three production platforms; leads and mentors the team.' },
  { role: 'Contract and freelance', years: '2023 - now', focus: 'Full-stack SaaS for UK and EU clients: fleet, ordering, courier, booking.' },
  { role: 'Senior frontend developer', years: '2021 - 2024', focus: 'Fintech and B2B SaaS delivery; mockups in Adobe XD; legacy Angular and PHP.' },
  { role: 'Junior frontend developer', years: '2020 - 2021', focus: 'SEO-friendly Angular and PHP apps, including a first public filing portal.' },
  { role: 'Blogger and writer', years: '2011 - 2014', focus: 'Tech news, HTML and CSS tutorials, and the SEO for my own blog.' },
];

export const REELS = [
  {
    title: 'Meet the Quorum',
    meta: '0:23',
    poster: '/images/quorum/quorum-reel.webp',
    src: 'https://mhfrough.github.io/quorum/videos/quorum-reel.mp4',
    captions: '/media/quorum/quorum-reel.en.vtt',
  },
  {
    title: 'The board',
    meta: '0:26',
    poster: '/images/quorum/quorum-board-reel.webp',
    src: 'https://mhfrough.github.io/quorum/videos/quorum-board-reel.mp4',
    captions: '/media/quorum/quorum-board-reel.en.vtt',
  },
];
