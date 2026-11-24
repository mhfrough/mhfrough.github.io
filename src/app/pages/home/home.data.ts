// Home page content. Facts only, from docs/content.md. Employers and client banks are never named.

export type Domain = 'fintech' | 'saas' | 'realtime' | 'commerce' | 'own';

export interface HomeProject {
  id: string;
  title: string;
  sub: string;
  icon: string;
  /** The product's own favicon. Shown instead of `icon` when set (see CLAUDE.md, Project icons). */
  favicon?: string;
  domains: Domain[];
  years: string;
  outcome: string;
  stack: string[];
  href?: string;
}

/**
 * Home bento (below the hero), in order. Little Surprises is the feature cell before these; the second cell is solid and the
 * third spans two columns, so six cells fill three rows. Every entry links to its case study and uses the product's
 * own favicon when there is one (CLAUDE.md, Project icons). Facts mirror src/app/pages/work/work.data.ts.
 */
export const BENTO: HomeProject[] = [
  {
    id: 'hrm',
    title: 'HRM Suite',
    sub: 'HR and payroll SaaS, in development',
    icon: 'phosphorIdentificationBadge',
    favicon: '/images/hrm/hrm-mark.svg',
    domains: ['own', 'saas'],
    years: '2026',
    outcome: 'One employee record from phone check-in to payslip, with every company walled off by forced row-level security.',
    stack: ['Angular', 'NestJS', 'PostgreSQL', 'Flutter'],
    href: '/work/hrm',
  },
  {
    id: 'fleet',
    title: 'Fleet and driver SaaS',
    sub: 'Full stack, multi-tenant',
    icon: 'phosphorTruck',
    domains: ['saas', 'realtime'],
    years: '2026',
    outcome: 'An Angular admin, two Flutter apps and one multi-tenant NestJS API, with passkey sign-in and Stripe payments.',
    stack: ['NestJS', 'PostgreSQL', 'Flutter', 'WebAuthn'],
    href: '/work/fleet',
  },
  {
    id: 'whiteboard',
    title: 'Whiteboard',
    sub: 'An infinite canvas, own product',
    icon: 'phosphorPencilSimpleLine',
    domains: ['own', 'realtime'],
    years: '2026',
    outcome: 'An Excalidraw-style board in Angular signals and NestJS: smart guides, snapshot undo, five export formats and live editing over socket.io.',
    stack: ['Angular', 'Signals', 'NestJS', 'socket.io'],
    href: '/work/whiteboard',
  },
  {
    id: 'resort',
    title: 'Bloomstone',
    sub: 'Resort booking by the slot',
    icon: 'phosphorTreePalm',
    favicon: '/images/bloomstone/bloomstone-mark.webp',
    domains: ['commerce', 'realtime'],
    years: '2026',
    outcome: 'Booking site, live availability calendar, NestJS and PostgreSQL API and admin, with staff and guests synced in real time.',
    stack: ['Angular', 'NestJS', 'PostgreSQL', 'Socket.io'],
    href: '/work/bloomstone',
  },
  {
    id: 'tax',
    title: 'Befiler',
    sub: 'Tax filing, micro-frontends',
    icon: 'phosphorReceipt',
    favicon: '/images/befiler/befiler-icon.webp',
    domains: ['fintech'],
    years: '2020 to now',
    outcome: 'Four Angular apps and a filing widget embedded in six banking apps.',
    stack: ['Angular', 'Micro-frontends', 'postMessage', 'i18n'],
    href: '/work/befiler',
  },
  {
    id: 'dmax',
    title: 'DMAX',
    sub: 'Banking data extraction',
    icon: 'phosphorDatabase',
    favicon: '/images/dmax/dmax-mark.webp',
    domains: ['fintech'],
    years: '2023 to now',
    outcome: 'Extraction consoles for DB2, flat-file and MongoDB data that count every row as extracted, failed or duplicate.',
    stack: ['Angular', 'RxJS', 'TypeScript', 'jsPDF'],
    href: '/work/dmax',
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
  'Claude Code',
  'Agentic workflows',
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
  { role: 'Co-founder, Little Surprises', years: '2026 to now', focus: 'A gift-basket shop with my wife: I built the storefront, the API, the admin and the marketing kit.' },
  { role: 'Software architect and lead developer', years: '2025 to now', focus: 'Leads a team of 7+ across three production platforms; architecture, reviews and releases, AI-first with agentic workflows.' },
  { role: 'Contract and freelance', years: '2023 to now', focus: 'Full-stack SaaS for UK and EU clients: fleet, ordering, courier, booking.' },
  { role: 'Senior frontend developer', years: '2021 to 2024', focus: 'Fintech and B2B SaaS delivery; mockups in Adobe XD; legacy Angular and PHP.' },
  { role: 'Junior frontend developer', years: '2020 to 2021', focus: 'SEO-friendly Angular and PHP apps, including a first public filing portal.' },
  { role: 'Blogger and writer', years: '2011 to 2014', focus: 'Tech news, HTML and CSS tutorials, and the SEO for my own blog.' },
];

export interface Reel {
  title: string;
  /** Duration as shown, m:ss. */
  meta: string;
  /** ISO 8601 duration for JSON-LD. */
  duration: string;
  uploadDate: string;
  description: string;
  poster: string;
  src: string;
  /** Captions, where the reel has them. */
  captions?: string;
  /** The product's case study, or its site when there is none. */
  href: string;
}

/**
 * Promo reels for my own products, in this order on the home page. The Quorum reels stream from the Quorum site;
 * the rest are the owner's finished files, copied unchanged into public/videos/reels (owner, 2026-11-24).
 */
export const REELS: Reel[] = [
  {
    title: 'Meet the Quorum',
    meta: '0:23',
    duration: 'PT23S',
    uploadDate: '2026-10-08T12:00:00+05:00',
    description: 'A 23-second intro to Quorum, a Claude Code skill for hard decisions.',
    poster: '/images/quorum/quorum-reel.webp',
    src: 'https://mhfrough.github.io/quorum/videos/quorum-reel.mp4',
    captions: '/media/quorum/quorum-reel.en.vtt',
    href: '/work/quorum',
  },
  {
    title: 'The board',
    meta: '0:26',
    duration: 'PT26S',
    uploadDate: '2026-10-08T12:00:00+05:00',
    description: 'The seven Quorum council members on a 3D board.',
    poster: '/images/quorum/quorum-board-reel.webp',
    src: 'https://mhfrough.github.io/quorum/videos/quorum-board-reel.mp4',
    captions: '/media/quorum/quorum-board-reel.en.vtt',
    href: '/work/quorum',
  },
  {
    title: 'Jot',
    meta: '0:25',
    duration: 'PT25S',
    uploadDate: '2026-10-25T12:00:00+05:00',
    description: 'Jot, plain notes and nothing else: saved as you type, locked notes encrypted on the device, works offline.',
    poster: '/videos/reels/jot-reel.webp',
    src: '/videos/reels/jot-reel.mp4',
    href: 'https://mhfrough.github.io/jot/',
  },
  {
    title: 'Swoop for Chrome',
    meta: '0:29',
    duration: 'PT29S',
    uploadDate: '2026-10-26T12:00:00+05:00',
    description: 'Swoop captures the whole page as one image and marks it up, with nothing leaving your computer.',
    poster: '/videos/reels/swoop-chrome-reel-2.webp',
    src: '/videos/reels/swoop-chrome-reel-2.mp4',
    href: '/work/swoop',
  },
  {
    title: 'Swoop for Windows',
    meta: '0:22',
    duration: 'PT22S',
    uploadDate: '2026-10-25T12:00:00+05:00',
    description: 'Press Print Screen, drag over anything, mark it up and copy: Swoop for Windows.',
    poster: '/videos/reels/swoop-windows-reel.webp',
    src: '/videos/reels/swoop-windows-reel.mp4',
    href: '/work/swoop',
  },
  {
    title: 'Flick',
    meta: '0:25',
    duration: 'PT25S',
    uploadDate: '2026-10-15T12:00:00+05:00',
    description: 'Flick sends files between nearby devices straight from the browser, with no server of its own.',
    poster: '/videos/reels/flick-reel.webp',
    src: '/videos/reels/flick-reel.mp4',
    href: '/work/flick',
  },
  {
    title: 'Pinch',
    meta: '0:25',
    duration: 'PT25S',
    uploadDate: '2026-10-16T12:00:00+05:00',
    description: 'Pinch compresses, converts and upscales images on your device, with nothing uploaded.',
    poster: '/videos/reels/pinch-reel.webp',
    src: '/videos/reels/pinch-reel.mp4',
    href: '/work/pinch',
  },
  {
    title: 'Scrawl',
    meta: '0:25',
    duration: 'PT25S',
    uploadDate: '2026-10-15T12:00:00+05:00',
    description: 'Scrawl, a felt-tip sketchbook in the browser, saved on the device.',
    poster: '/videos/reels/scrawl-reel.webp',
    src: '/videos/reels/scrawl-reel.mp4',
    href: '/work/scrawl',
  },
  {
    title: 'Sizzle',
    meta: '0:25',
    duration: 'PT25S',
    uploadDate: '2026-10-15T12:00:00+05:00',
    description: 'Sizzle, a skill for AI agents that cuts promo reels for software.',
    poster: '/videos/reels/sizzle-poster.webp',
    src: '/videos/reels/sizzle-reel.mp4',
    href: '/work/sizzle',
  },
];
