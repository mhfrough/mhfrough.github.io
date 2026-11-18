// Work index data. Facts only, from docs/content.md. Titles are anonymized (never name employers or client banks),
// except Befiler and its partner banks, which the owner approved naming for its case study (2026-10-10), and
// Bloomstone, Emlaak Financials, the pizzeria brands, SOS24, AK Heating and Plumbing and Khairpur Municipal
// Committee, Asaan Hisab, Finclore and Arittek, named for their case studies at the owner's request (2026-10-11).
// Arittek is named only as the client of its own site, never as an employer.
// The Home page may import PROJECTS / FEATURED from here.

export type WorkCategory = 'fintech' | 'saas' | 'commerce' | 'public' | 'own' | 'design';

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
  /** The product's own favicon. Shown instead of `icon` when set (see CLAUDE.md, Project icons). */
  favicon?: string;
  /** Shown only when the cell is wide enough. */
  stats?: WorkStat[];
  /** Optional live external link (no dead links: only set when it exists). */
  link?: { label: string; href: string };
  /** Internal case study route, shown instead of the external link. */
  caseStudy?: string;
  /** Thumbnail shown beside the copy in wide cells (case studies). */
  cover?: { src: string; width: number; height: number; alt: string };
  freelance?: boolean;
  /** One of my Originals (no server, runs on your device): listed in their own group on /work, before client work (see TOOL_ORDER). */
  tool?: boolean;
  /** Tools only: where it runs, in a few words (mono label on its shelf tile). */
  runs?: string;
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
  { id: 'design', label: 'Design' },
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
/** The tools group on /work runs in this order. */
export const TOOL_ORDER = ['flick', 'pinch', 'scrawl', 'sizzle', 'swoop'];

export const PROJECTS: WorkProject[] = [
  {
    id: 'tax-filing',
    title: 'Befiler, tax filing with micro-frontends',
    domain: 'Tax and banking',
    years: '2020 to now',
    startYear: 2020,
    role: 'Junior to lead frontend developer',
    outcome:
      'Four Angular apps (filing portal, customer dashboard, agent portal, admin) with language switching, plus cross-domain filing widgets embedded in 6 partner banking apps.',
    stack: ['Angular', 'Micro-frontends', 'TypeScript', 'PHP', 'Firebase', 'i18n'],
    categories: ['fintech'],
    icon: 'phosphorReceipt',
    favicon: '/images/befiler/befiler-icon.webp',
    stats: [
      { value: '4', label: 'Angular apps' },
      { value: '6', label: 'partner banking apps' },
    ],
    caseStudy: '/work/befiler',
    cover: {
      src: '/images/befiler/cover.webp',
      width: 1200,
      height: 630,
      alt: 'Befiler case study cover: "Tax returns, filed from any app." beside the befiler.com home page.',
    },
  },
  {
    id: 'fund-marketplace',
    title: 'Emlaak Financials, a mutual fund marketplace',
    domain: 'Investment',
    years: '2020 to now',
    startYear: 2020,
    role: 'UI design and Angular frontend',
    outcome:
      'Digital account opening, online investing and portfolio tracking for an SECP-licensed platform, with NADRA-verified KYC, risk profiling and fund comparison.',
    stack: ['Angular', 'Angular Material', 'RxJS', 'ngx-charts'],
    categories: ['fintech'],
    icon: 'phosphorChartLineUp',
    favicon: '/images/emlaak/emlaak-mark.webp',
    stats: [
      { value: '2', label: 'account types' },
      { value: '5', label: 'risk bands' },
    ],
    caseStudy: '/work/emlaak',
    cover: {
      src: '/images/emlaak/cover.webp',
      width: 1200,
      height: 630,
      alt: 'Emlaak case study cover: "Every mutual fund, one account." beside the emlaakfinancials.com home page.',
    },
  },
  {
    id: 'microfinance',
    title: 'TMF, a microfinance loan-management platform',
    domain: 'Microfinance',
    years: '2023 to 2024',
    startYear: 2023,
    where: 'Pakistan',
    role: 'Angular developer',
    outcome:
      'Thardeep Microfinance Foundation’s staff platform: borrower and group registration, a loan calculator, and an approval chain of nine desks with limits per role and product, up to disbursement and repayment.',
    stack: ['Angular', 'Angular Material', 'ngx-permissions', 'TypeScript'],
    categories: ['fintech'],
    icon: 'phosphorHandCoins',
    favicon: '/images/tmf/tmf-mark.webp',
    stats: [
      { value: '9', label: 'approval desks' },
      { value: '163', label: 'permission keys' },
    ],
    caseStudy: '/work/tmf',
    cover: {
      src: '/images/tmf/cover.webp',
      width: 1200,
      height: 630,
      alt: 'TMF case study cover: the Thardeep Microfinance Foundation mark above "Nine desks between a loan and its cheque." beside an approval chain and a repayment schedule.',
    },
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
      'An Angular admin, two Flutter apps and one multi-tenant NestJS API: passkey sign-in, Stripe payments per company, live chat and a daily vehicle check the server enforces.',
    stack: ['NestJS', 'PostgreSQL', 'Angular', 'Flutter', 'Stripe', 'WebAuthn'],
    categories: ['saas'],
    icon: 'phosphorTruck',
    stats: [
      { value: '4', label: 'apps on one API' },
      { value: '54', label: 'NestJS modules' },
    ],
    caseStudy: '/work/fleet',
    cover: {
      src: '/images/fleet/cover.webp',
      width: 1200,
      height: 630,
      alt: 'Fleet case study cover: "One API for the office, the depot and the driver." beside the fleet admin dashboard, with invented data.',
    },
  },
  {
    id: 'data-extraction',
    title: 'DMAX, banking data extraction',
    domain: 'Banking, internal',
    years: '2023 to now',
    startYear: 2023,
    role: 'Angular frontend for four apps',
    outcome:
      'Three extraction consoles, one each for DB2, flat-file and MongoDB stores, that count every row as extracted, failed or duplicate, plus a statements app with PDF, CSV and bulk runs.',
    stack: ['Angular', 'TypeScript', 'RxJS', 'Bootstrap', 'jsPDF'],
    categories: ['fintech'],
    icon: 'phosphorDatabase',
    favicon: '/images/dmax/dmax-mark.webp',
    stats: [
      { value: '4', label: 'Angular apps' },
      { value: '65', label: 'versioned releases' },
    ],
    caseStudy: '/work/dmax',
    cover: {
      src: '/images/dmax/cover.webp',
      width: 1200,
      height: 630,
      alt: 'DMAX case study cover: the stacked-blocks mark above "Core banking data, extracted and accounted for." beside a sample extraction job with its per-table progress.',
    },
  },
  {
    id: 'practice-management',
    title: 'ePractise, practice management for tax firms',
    domain: 'Accounting',
    years: '2024 to now',
    startYear: 2024,
    role: 'Angular and UI, in a team',
    outcome:
      'Practice-management SaaS for tax and accounting firms: the public site, a tenant app that signs up and provisions each firm, and the firm workspace with pipelines, organizers and a client portal.',
    stack: ['Angular', 'PrimeNG', 'Bootstrap', 'Firebase', 'Multi-tenant'],
    categories: ['saas', 'fintech'],
    icon: 'phosphorBriefcase',
    favicon: '/images/epractise/epractise-mark.webp',
    stats: [
      { value: '19', label: 'workspace areas' },
      { value: '12', label: 'template types' },
    ],
    caseStudy: '/work/epractise',
    cover: {
      src: '/images/epractise/cover.webp',
      width: 1200,
      height: 630,
      alt: 'ePractise case study cover: the ePractise wordmark above "A tax firm, run from one workspace." beside the epractise.com home page.',
    },
  },
  {
    id: 'omnichannel-inbox',
    title: 'O2Chat, omnichannel inbox',
    domain: 'B2B SaaS',
    years: '2024 to now',
    startYear: 2024,
    role: 'Angular frontend: agent portal, widget, tenant portal, site',
    outcome:
      'One real-time inbox for website chat, WhatsApp, Messenger and Instagram, a chat widget that installs on any site with one script tag, a trainable AI bot and a multi-tenant portal for plans and users.',
    stack: ['Angular', 'SignalR', 'Angular Universal', 'Embeddable widget', 'Multi-tenant'],
    categories: ['saas'],
    icon: 'phosphorChatsCircle',
    favicon: '/images/o2chat/o2chat-mark.webp',
    stats: [
      { value: '22', label: 'real-time hub events' },
      { value: '6', label: 'widget install paths' },
    ],
    caseStudy: '/work/o2chat',
    cover: {
      src: '/images/o2chat/cover.webp',
      width: 1200,
      height: 630,
      alt: 'O2Chat case study cover: the O2 speech bubble above "Every channel, one inbox." beside the O2Chat pricing page.',
    },
  },
  {
    id: 'resort-booking',
    title: 'Bloomstone, resort booking by the slot',
    domain: 'Hospitality',
    years: '2026',
    startYear: 2026,
    role: 'Full-stack developer, solo',
    outcome:
      'Booking site, live availability calendar, NestJS and PostgreSQL API and the admin for a private resort, with staff and guests kept in sync in real time with Socket.io.',
    stack: ['Angular', 'NestJS', 'PostgreSQL', 'Socket.io', 'jsPDF'],
    categories: ['commerce'],
    icon: 'phosphorTreePalm',
    favicon: '/images/bloomstone/bloomstone-mark.webp',
    stats: [
      { value: '3', label: 'slots a day' },
      { value: '9', label: 'admin screens' },
    ],
    caseStudy: '/work/bloomstone',
    cover: {
      src: '/images/bloomstone/cover.webp',
      width: 1200,
      height: 630,
      alt: 'Bloomstone case study cover: "A private resort, booked by the slot." beside the bloomstone.pk home page.',
    },
  },
  {
    id: 'company-formation',
    title: 'Finclore, US company formation',
    domain: 'Business services',
    years: '2022 to 2024',
    startYear: 2022,
    role: 'Logo, UI design and Angular frontend',
    outcome:
      'Prerendered public site, a seven-step formation wizard that saves every step, and a back office whose permissions are named after its API endpoints, in one installable Angular app.',
    stack: ['Angular', 'Angular Universal', 'PWA', 'Firebase', 'Bootstrap'],
    categories: ['fintech'],
    icon: 'phosphorBuildingOffice',
    favicon: '/images/finclore/finclore-mark.svg',
    stats: [
      { value: '7', label: 'wizard steps, saved' },
      { value: '28', label: 'endpoint permissions' },
    ],
    caseStudy: '/work/finclore',
    cover: {
      src: '/images/finclore/cover.webp',
      width: 1200,
      height: 630,
      alt: 'Finclore case study cover: the F. mark above "A US company, formed from anywhere." beside the Finclore home page.',
    },
  },
  {
    id: 'llcsavvy',
    title: 'LLC SAVVY, US company formation',
    domain: 'Business services',
    years: '2024',
    startYear: 2024,
    where: 'Pakistan',
    role: 'Angular frontend',
    outcome:
      'Finclore’s sister on the same Angular base, taken further for founders in Pakistan: a checkout priced in dollars and paid in rupees, a direct bank debit confirmed by OTP, per-product promo prices and 94 prerendered blog posts.',
    stack: ['Angular', 'Angular Universal', 'Firebase', 'Bootstrap'],
    categories: ['fintech'],
    icon: 'phosphorBuildingOffice',
    favicon: '/images/llcsavvy/llcsavvy-mark.webp',
    stats: [
      { value: '96', label: 'prerendered pages' },
      { value: '2', label: 'currencies per total' },
    ],
    caseStudy: '/work/llcsavvy',
    cover: {
      src: '/images/llcsavvy/cover.webp',
      width: 1200,
      height: 630,
      alt: 'LLC SAVVY case study cover: the globe mark above "A US company, paid for in rupees." beside the LLC SAVVY home page.',
    },
  },
  {
    id: 'food-ordering',
    title: 'Pizzerias, one storefront for seven brands',
    domain: 'Food ordering',
    years: '2023 to 2024',
    startYear: 2023,
    where: 'Germany',
    role: 'Freelance, storefront and back office',
    outcome:
      'One shared Angular template running 7 pizzeria and cloud-kitchen brands: menu, cart, OTP sign-in, payments and live order tracking, plus a role-based back office.',
    stack: ['Angular', 'Scully', 'OTP', 'PayPal', 'Firebase'],
    categories: ['commerce'],
    icon: 'phosphorForkKnife',
    freelance: true,
    stats: [
      { value: '7', label: 'brands' },
      { value: '1', label: 'shared template' },
    ],
    caseStudy: '/work/pizzerias',
    cover: {
      src: '/images/pizzerias/cover.webp',
      width: 1200,
      height: 630,
      alt: 'Pizzerias case study cover: "Seven pizzerias, one template." beside a storefront rendered with a sample menu.',
    },
  },
  {
    id: 'call-center',
    title: 'Call center ordering portal',
    domain: 'Food ordering',
    years: '2023',
    startYear: 2023,
    role: 'Angular frontend',
    outcome:
      'A portal where a central call center takes phone orders for several restaurants: returning callers found by phone number, items priced by size, five order statuses, push notifications and printable receipts, across three roles.',
    stack: ['Angular', 'Bootstrap', 'Firebase', 'jsPDF'],
    categories: ['commerce', 'saas'],
    icon: 'phosphorHeadset',
    stats: [
      { value: '3', label: 'roles' },
      { value: '5', label: 'order statuses' },
    ],
    caseStudy: '/work/call-center',
    cover: {
      src: '/images/call-center/cover.webp',
      width: 1200,
      height: 630,
      alt: 'Call center case study cover: "Phone orders, typed once." beside a drawn order form with a returning caller filled in.',
    },
  },
  {
    id: 'courier',
    title: 'Malik Transport Solutions',
    domain: 'Logistics',
    years: '2023',
    startYear: 2023,
    where: 'Germany',
    role: 'Freelance, Angular frontend',
    outcome:
      'A courier company’s site with a public fare calculator, and one portal where customers book, the office accepts and assigns drivers, and drivers run jobs, log shifts and get payslips.',
    stack: ['Angular', 'Angular Universal', 'Bootstrap', 'PWA'],
    categories: ['commerce'],
    icon: 'phosphorTruck',
    favicon: '/images/malik-transport/malik-transport-mark.webp',
    caseStudy: '/work/malik-transport',
    cover: {
      src: '/images/malik-transport/cover.webp',
      width: 1200,
      height: 630,
      alt: 'Malik Transport Solutions case study cover: "A price before the call, a driver after it." beside the price calculator on desktop and phone.',
    },
    freelance: true,
  },
  {
    id: 'service-booking',
    title: 'SOS24 and AK Heating, call-out sites',
    domain: 'Home services',
    years: '2023 to 2024',
    startYear: 2023,
    where: 'UK',
    role: 'Freelance, Angular frontend',
    outcome:
      'Two Nottingham trades businesses on one Angular template: a server-rendered 24/7 multi-trade site, and a fork with fixed call-out prices, WhatsApp-first contact and live reviews.',
    stack: ['Angular', 'Angular SSR', 'Firebase Hosting', 'Bootstrap'],
    categories: ['commerce'],
    icon: 'phosphorWrench',
    freelance: true,
    stats: [
      { value: '2', label: 'businesses' },
      { value: '1', label: 'template' },
    ],
    caseStudy: '/work/trades',
    cover: {
      src: '/images/trades/cover.webp',
      width: 1200,
      height: 630,
      alt: 'Trades case study cover: "Two call-out services, one template." beside the AK Heating and Plumbing home page.',
    },
  },
  {
    id: 'complaint-portal',
    title: 'KPMC, a municipal complaint portal',
    domain: 'Public sector',
    years: '2022',
    startYear: 2022,
    role: 'Angular frontend',
    outcome:
      'Public site and staff back office for Khairpur Municipal Committee: role-based assignment, closing with photo proof, citizen ratings, reports and push notifications, delivered in under two months.',
    stack: ['Angular', 'Angular Universal', 'Bootstrap', 'FCM'],
    categories: ['public'],
    icon: 'phosphorBuildings',
    favicon: '/images/kpmc/kpmc-logo.webp',
    stats: [
      { value: '4', label: 'staff roles' },
      { value: '< 2', label: 'months to live' },
    ],
    caseStudy: '/work/kpmc',
    cover: {
      src: '/images/kpmc/cover.webp',
      width: 1200,
      height: 630,
      alt: 'KPMC case study cover: "A city’s complaints, handled in one place." beside the committee’s home page.',
    },
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
    title: 'Asaan Hisab, accounting for SMEs',
    domain: 'Accounting',
    years: '2020',
    startYear: 2020,
    role: 'Angular frontend, first production project',
    outcome:
      'Free accounting and invoicing for small businesses: income and expense forms that post double entries, invoices with sales tax in three layouts, and four financial reports with period closure.',
    stack: ['Angular', 'Bootstrap', 'ag-Grid', 'Chart.js'],
    categories: ['fintech', 'saas'],
    icon: 'phosphorInvoice',
    favicon: '/images/asaan-hisab/asaan-hisab-mark.webp',
    stats: [
      { value: '4', label: 'financial reports' },
      { value: '3', label: 'invoice layouts' },
    ],
    caseStudy: '/work/asaan-hisab',
    cover: {
      src: '/images/asaan-hisab/cover.webp',
      width: 1200,
      height: 630,
      alt: 'Asaan Hisab case study cover: "Bookkeeping, in plain words." beside the Asaan Hisab sign-up page.',
    },
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
    id: 'arittek',
    title: 'Arittek, company site and back office',
    domain: 'Corporate web and CMS',
    years: '2023 to 2026',
    startYear: 2023,
    role: 'Angular frontend and PHP backend',
    outcome:
      'Prerendered Angular site for Arittek’s banking, data and toll platforms, rebuilt in 2026 with a PHP back office: blog with scheduled publishing, four kinds of campaign, inquiries and role-based permissions.',
    stack: ['Angular', 'Angular Universal', 'PHP', 'MySQL', 'Playwright'],
    categories: [],
    icon: 'phosphorGlobe',
    favicon: '/images/arittek/arittek-mark.svg',
    stats: [
      { value: '20', label: 'prerendered pages' },
      { value: '32', label: 'permissions' },
    ],
    caseStudy: '/work/arittek',
    cover: {
      src: '/images/arittek/cover.webp',
      width: 1200,
      height: 630,
      alt: 'Arittek case study cover: the Arittek mark above "A company site with its own back office." beside the arittek.com home page.',
    },
  },
  {
    id: 'flick',
    title: 'Flick, nearby sharing in the browser',
    domain: 'Developer tools',
    years: '2026',
    startYear: 2026,
    role: 'Own product, design and build',
    outcome:
      'Shares files and text between nearby devices straight from the browser, with encrypted signalling over public MQTT brokers and direct WebRTC transfer, and no server of its own.',
    stack: ['JavaScript', 'WebRTC', 'MQTT', 'Web Crypto'],
    categories: ['own'],
    icon: 'phosphorBrowser',
    favicon: '/images/flick/flick-mark.svg',
    stats: [
      { value: '0', label: 'servers of its own' },
      { value: '3', label: 'public MQTT brokers at once' },
    ],
    caseStudy: '/work/flick',
    tool: true,
    runs: 'Browser to browser',
    cover: {
      src: '/images/flick/cover.webp',
      width: 1200,
      height: 630,
      alt: 'Flick case study cover: "Files to the next screen, with no server." beside the Flick app with a phone connected.',
    },
  },
  {
    id: 'pinch',
    title: 'Pinch, image compression in the browser',
    domain: 'Developer tools',
    years: '2026',
    startYear: 2026,
    role: 'Own product, design and build',
    outcome:
      'Compresses, converts and upscales images in the browser with nothing uploaded: WebAssembly codecs in a pool of Web Workers, a target-size search, and Real-ESRGAN upscaling on the device.',
    stack: ['JavaScript', 'WebAssembly', 'Web Workers', 'ONNX Runtime Web'],
    categories: ['own'],
    icon: 'phosphorImage',
    favicon: '/images/pinch/pinch-mark.svg',
    stats: [
      { value: '0', label: 'bytes of images uploaded' },
      { value: '7', label: 'formats it saves' },
    ],
    caseStudy: '/work/pinch',
    tool: true,
    runs: 'In your browser',
    cover: {
      src: '/images/pinch/cover.webp',
      width: 1200,
      height: 630,
      alt: 'Pinch case study cover: "Lighter images, never uploaded." beside the Pinch studio with four sample photos made 35% smaller.',
    },
  },
  {
    id: 'swoop',
    title: 'Swoop, screenshots that stay on your computer',
    domain: 'Developer tools',
    years: '2026',
    startYear: 2026,
    role: 'Own product, design and build',
    outcome:
      'A Chrome extension that captures a whole page by scrolling and stitching, and a 1.4 MB Print Screen app for Windows built with Tauri 2, sharing one free editor. Nothing is uploaded.',
    stack: ['JavaScript', 'Canvas 2D', 'Rust', 'Tauri 2'],
    categories: ['own'],
    icon: 'phosphorBrowser',
    favicon: '/images/swoop/swoop-mark.svg',
    stats: [
      { value: '0', label: 'servers, accounts or links' },
      { value: '11', label: 'editor tools, all free' },
    ],
    caseStudy: '/work/swoop',
    tool: true,
    runs: 'Chrome and Windows',
    cover: {
      src: '/images/swoop/cover.webp',
      width: 1200,
      height: 630,
      alt: 'Swoop case study cover: "Screenshots that stay on your computer." beside the Swoop editor with a box, numbered steps, an arrow and a blurred address.',
    },
  },
  {
    id: 'sizzle',
    title: 'Sizzle, promo reels cut by your agent',
    domain: 'Developer tools',
    years: '2026',
    startYear: 2026,
    role: 'Own product, design and build',
    outcome:
      'A skill for AI agents that makes short promo reels for software: built as an HTML animation from the product’s real interface, approved by you at two gates, then rendered frame-exact to a 4K MP4 with music, with no ffmpeg.',
    stack: ['Markdown', 'Node', 'Playwright', 'Python'],
    categories: ['own'],
    icon: 'phosphorFilmSlate',
    favicon: '/images/sizzle/sizzle-mark.svg',
    stats: [
      { value: '2', label: 'approval gates before any 4K frame' },
      { value: '750', label: 'frames rendered on a fake clock' },
    ],
    caseStudy: '/work/sizzle',
    tool: true,
    runs: 'Inside your AI agent',
    cover: {
      src: '/images/sizzle/cover.webp',
      width: 1200,
      height: 630,
      alt: 'Sizzle case study cover: "Promo reels, cut by your agent." beside the Sizzle site and its bronze trailer poster.',
    },
  },
  {
    id: 'hrm-suite',
    title: 'HRM Suite, HR and payroll SaaS',
    domain: 'HR and payroll',
    years: '2026',
    startYear: 2026,
    where: 'In development',
    role: 'Owner, design and full stack',
    outcome:
      'My multi-tenant HR, attendance and payroll platform for companies in Pakistan, not launched yet: an Angular web app, a Flutter check-in app, a NestJS and PostgreSQL API with forced row-level security, and its own design system.',
    stack: ['Angular', 'NestJS', 'PostgreSQL', 'Flutter', 'Playwright'],
    categories: ['own', 'saas'],
    icon: 'phosphorIdentificationBadge',
    favicon: '/images/hrm/hrm-mark.svg',
    stats: [
      { value: '169 of 171', label: 'roadmap tasks done' },
      { value: '0', label: 'cross-tenant leaks' },
    ],
    caseStudy: '/work/hrm',
    cover: {
      src: '/images/hrm/cover.webp',
      width: 1200,
      height: 630,
      alt: 'HRM Suite case study cover: "HR, attendance and payroll on one record." beside the HRM Suite dashboard in its dark theme.',
    },
  },
  {
    id: 'ethical-node',
    title: 'EthicalNode, Shariah-screened crypto staking',
    domain: 'Web3 and staking',
    years: '2023',
    startYear: 2023,
    role: 'React developer, admin portal and staking',
    outcome:
      'Admin portal where admin permissions and chain settings are smart-contract transactions, plus the investor portal’s wallet sign-in and staking flows: stake, claim rewards, unstake, withdraw.',
    stack: ['React', 'TypeScript', 'ethers.js', 'wagmi', 'Web3Auth'],
    categories: ['fintech'],
    icon: 'phosphorHandCoins',
    favicon: '/images/ethical-node/ethical-node-mark.webp',
    stats: [
      { value: '50 of 51', label: 'admin portal commits' },
      { value: '4', label: 'on-chain admin permissions' },
    ],
    caseStudy: '/work/ethical-node',
    cover: {
      src: '/images/ethical-node/cover.webp',
      width: 1200,
      height: 630,
      alt: 'EthicalNode case study cover: "Shariah-screened staking, run on chain." beside a mockup of the investor portal’s asset list.',
    },
  },
  {
    id: 'scrawl',
    title: 'Scrawl, a felt-tip sketchbook',
    domain: 'Developer tools',
    years: '2026',
    startYear: 2026,
    role: 'Own product, design and build',
    outcome:
      'A zero-dependency sketchbook for the browser: felt-tip diagrams on dotted paper, risograph-style fills, and every page saved on your own device.',
    stack: ['JavaScript', 'Canvas 2D', 'SVG', 'IndexedDB'],
    categories: ['own'],
    icon: 'phosphorPenNib',
    favicon: '/images/scrawl/scrawl-mark.svg',
    stats: [
      { value: '0', label: 'dependencies, no build step' },
      { value: '12', label: 'tools, each on one key' },
    ],
    caseStudy: '/work/scrawl',
    tool: true,
    runs: 'In your browser',
    cover: {
      src: '/images/scrawl/cover.webp',
      width: 1200,
      height: 630,
      alt: 'Scrawl case study cover: "Felt-tip diagrams on dotted paper." beside the app with a hand-drawn onboarding flow.',
    },
  },
  {
    id: 'whiteboard',
    title: 'Whiteboard, an infinite canvas',
    domain: 'Developer tools',
    years: '2026',
    startYear: 2026,
    role: 'Own product, frontend and backend',
    outcome:
      'An Excalidraw-style board in Angular signals and NestJS: one SVG scene under a pan and zoom transform, smart guides, snapshot undo, five export formats and live editing over socket.io.',
    stack: ['Angular', 'NestJS', 'socket.io', 'PostgreSQL'],
    categories: ['own'],
    icon: 'phosphorPencilSimpleLine',
    stats: [
      { value: '20', label: 'tools' },
      { value: '15', label: 'signal services' },
    ],
    caseStudy: '/work/whiteboard',
    cover: {
      src: '/images/whiteboard/cover.webp',
      width: 1200,
      height: 630,
      alt: 'Whiteboard case study cover: "An infinite canvas, built on signals." beside the board with a diagram drawn on it.',
    },
  },
  {
    id: 'gift-wrap',
    title: 'Gift Wrap, a build-your-own gift basket store',
    domain: 'Thesis project',
    role: 'Frontend, design and build',
    outcome:
      'A thesis storefront where buyers build their own gift basket: base, wrap, ribbon, treats and a note, with a live price. Angular 17 with signals, mobile first, installable, on Netlify.',
    stack: ['Angular', 'Signals', 'Bootstrap', 'PWA'],
    categories: ['commerce'],
    icon: 'phosphorGift',
    stats: [
      { value: '5', label: 'build steps' },
      { value: '60', label: 'basket looks' },
    ],
    caseStudy: '/work/gift-wrap',
    cover: {
      src: '/images/gift-wrap/cover.webp',
      width: 1200,
      height: 630,
      alt: 'Gift Wrap case study cover: "Build the basket, not just buy one." beside the storefront home page.',
    },
  },
  {
    id: 'icon-ui-design',
    title: 'Icon and UI design',
    domain: 'Design',
    role: 'Designer',
    outcome: 'Icon sets, mockups and UI concepts made in Adobe XD and Canva.',
    stack: ['Adobe XD', 'Canva', 'UI/UX'],
    categories: ['design'],
    icon: 'phosphorPenNib',
    freelance: true,
    link: { label: 'See it on Dribbble', href: 'https://dribbble.com/mhfrough' },
  },
];

/**
 * /work card images, keyed by project id, in order: the product site's home section, a sales page (pricing, plans,
 * packages, menu or services), then the portal or dashboard with sample data (the case study's hero mockup, captured
 * by scripts/work-cards.mjs). Mockup-only case studies use their own hero, first demo and mockup.
 * Big projects carry 5 to 7. Wide cards show them as a deck (home on top) that rotates; single cards use a slider.
 * Projects not listed show their `cover`.
 */
export const CARD_SHOTS: Readonly<Record<string, readonly string[]>> = {
  'tax-filing': [
    '/images/befiler/site-hero.webp',
    '/images/befiler/site-salestax.webp',
    '/images/befiler/site-plans.webp',
    '/images/work/befiler-app.webp',
    '/images/befiler/site-salestax-plans.webp',
    '/images/work/befiler-demo-1.webp',
    '/images/befiler/site-calculator.webp',
  ],
  'fund-marketplace': [
    '/images/emlaak/site-hero.webp',
    '/images/emlaak/site-benefits.webp',
    '/images/work/emlaak-app.webp',
    '/images/work/emlaak-demo-1.webp',
    '/images/work/emlaak-demo-2.webp',
    '/images/work/emlaak-demo-3.webp',
    '/images/emlaak/site-objectives.webp',
  ],
  microfinance: [
    '/images/work/tmf-hero.webp',
    '/images/work/tmf-demo-1.webp',
    '/images/work/tmf-app.webp',
    '/images/work/tmf-demo-2.webp',
    '/images/tmf/cover.webp',
  ],
  fleet: [
    '/images/work/fleet-hero.webp',
    '/images/fleet/admin-reports.webp',
    '/images/fleet/admin-dashboard.webp',
    '/images/fleet/admin-bookings-dark.webp',
    '/images/fleet/admin-vehicles.webp',
    '/images/fleet/admin-chat.webp',
    '/images/work/fleet-demo-1.webp',
  ],
  'data-extraction': [
    '/images/work/dmax-hero.webp',
    '/images/work/dmax-demo-1.webp',
    '/images/work/dmax-app.webp',
    '/images/work/dmax-demo-2.webp',
    '/images/work/dmax-demo-3.webp',
    '/images/dmax/cover.webp',
  ],
  'practice-management': [
    '/images/epractise/site-home.webp',
    '/images/epractise/site-pricing.webp',
    '/images/work/epractise-app.webp',
    '/images/work/epractise-demo-1.webp',
    '/images/work/epractise-demo-2.webp',
    '/images/work/epractise-demo-4.webp',
    '/images/epractise/site-workflow.webp',
  ],
  'omnichannel-inbox': [
    '/images/o2chat/site-features.webp',
    '/images/o2chat/site-pricing.webp',
    '/images/o2chat/app-dashboard.webp',
    '/images/o2chat/app-inbox.webp',
    '/images/work/o2chat-demo-1.webp',
    '/images/work/o2chat-demo-3.webp',
    '/images/o2chat/site-integrations.webp',
  ],
  'resort-booking': [
    '/images/bloomstone/site-hero.webp',
    '/images/bloomstone/site-packages.webp',
    '/images/work/bloomstone-app.webp',
    '/images/bloomstone/site-availability.webp',
    '/images/work/bloomstone-demo-1.webp',
  ],
  'company-formation': [
    '/images/finclore/site-home.webp',
    '/images/finclore/site-services.webp',
    '/images/work/finclore-app.webp',
    '/images/work/finclore-demo-1.webp',
    '/images/work/finclore-demo-2.webp',
    '/images/work/finclore-demo-3.webp',
    '/images/finclore/site-steps.webp',
  ],
  llcsavvy: [
    '/images/llcsavvy/site-home.webp',
    '/images/llcsavvy/site-services.webp',
    '/images/work/llcsavvy-app.webp',
    '/images/work/llcsavvy-demo-1.webp',
    '/images/work/llcsavvy-demo-2.webp',
    '/images/work/llcsavvy-demo-3.webp',
    '/images/llcsavvy/site-steps.webp',
  ],
  // Every brand's home page first (one template, many storefronts), then the menu, cart and back office.
  'food-ordering': [
    '/images/pizzerias/roma-home.webp',
    '/images/pizzerias/roma-classic-home.webp',
    '/images/pizzerias/joker-home.webp',
    '/images/pizzerias/turtles-home.webp',
    '/images/pizzerias/cloud-kitchen-home.webp',
    '/images/pizzerias/mannosalwa-home.webp',
    '/images/pizzerias/pinseria-home.webp',
    '/images/pizzerias/speed-home.webp',
    '/images/pizzerias/roma-menu.webp',
    '/images/pizzerias/roma-cart.webp',
    '/images/work/pizzerias-app.webp',
  ],
  'service-booking': [
    '/images/trades/ak-home.webp',
    '/images/trades/ak-services.webp',
    '/images/work/trades-app.webp',
    '/images/work/trades-demo-1.webp',
    '/images/trades/sos24-home.webp',
    '/images/trades/ak-reviews.webp',
  ],
  'complaint-portal': [
    '/images/kpmc/site-home.webp',
    '/images/kpmc/site-services.webp',
    '/images/work/kpmc-app.webp',
    '/images/work/kpmc-demo-1.webp',
    '/images/work/kpmc-demo-2.webp',
    '/images/kpmc/site-news.webp',
  ],
  'sme-accounting': [
    '/images/asaan-hisab/site-home.webp',
    '/images/asaan-hisab/site-features.webp',
    '/images/work/asaan-hisab-app.webp',
    '/images/work/asaan-hisab-demo-1.webp',
    '/images/work/asaan-hisab-demo-2.webp',
  ],
  arittek: [
    '/images/arittek/site-home.webp',
    '/images/arittek/site-alqist.webp',
    '/images/work/arittek-app.webp',
    '/images/work/arittek-demo-1.webp',
    '/images/work/arittek-demo-2.webp',
    '/images/arittek/site-journey.webp',
    '/images/arittek/site-tollx.webp',
  ],
  'hrm-suite': [
    '/images/hrm/site-hero.webp',
    '/images/hrm/app-payruns.webp',
    '/images/hrm/app-dashboard.webp',
    '/images/hrm/app-ess.webp',
    '/images/hrm/app-leave-calendar.webp',
    '/images/hrm/ds-overview.webp',
    '/images/work/hrm-demo-1.webp',
  ],
  whiteboard: [
    '/images/work/whiteboard-hero.webp',
    '/images/whiteboard/export.webp',
    '/images/whiteboard/board.webp',
    '/images/whiteboard/layers.webp',
    '/images/whiteboard/guides.webp',
    '/images/whiteboard/versions.webp',
  ],
  flick: [
    '/images/flick/app.webp',
    '/images/flick/transfer.webp',
    '/images/flick/link.webp',
  ],
  scrawl: [
    '/images/scrawl/board-dark.webp',
    '/images/scrawl/style-dark.webp',
    '/images/scrawl/export-dark.webp',
    '/images/scrawl/board-light.webp',
    '/images/scrawl/drawings-dark.webp',
  ],
  pinch: [
    '/images/pinch/batch.webp',
    '/images/pinch/target.webp',
    '/images/pinch/app.webp',
    '/images/pinch/privacy.webp',
  ],
  sizzle: [
    '/images/sizzle/site.webp',
    '/images/sizzle/studio.webp',
    '/images/sizzle/schedule.webp',
    '/images/sizzle/screening.webp',
    '/images/sizzle/install.webp',
  ],
  swoop: [
    '/images/swoop/site.webp',
    '/images/swoop/editor.webp',
    '/images/swoop/overlay.webp',
    '/images/swoop/chrome.webp',
    '/images/swoop/tools.webp',
  ],
  'gift-wrap': [
    '/images/gift-wrap/site-home.webp',
    '/images/gift-wrap/site-shop.webp',
    '/images/work/gift-wrap-app.webp',
    '/images/gift-wrap/site-product.webp',
    '/images/gift-wrap/site-cart.webp',
    '/images/gift-wrap/site-studio.webp',
  ],
  courier: [
    '/images/malik-transport/site-home.webp',
    '/images/malik-transport/site-tariffs.webp',
    '/images/work/malik-transport-app.webp',
    '/images/malik-transport/site-calculator.webp',
    '/images/work/malik-transport-demo-1.webp',
    '/images/work/malik-transport-demo-2.webp',
    '/images/malik-transport/site-company.webp',
  ],
  'call-center': [
    '/images/work/call-center-hero.webp',
    '/images/work/call-center-demo-1.webp',
    '/images/work/call-center-app.webp',
    '/images/work/call-center-demo-2.webp',
    '/images/call-center/cover.webp',
  ],
  'ethical-node': [
    '/images/work/ethical-node-hero.webp',
    '/images/work/ethical-node-demo-1.webp',
    '/images/work/ethical-node-app.webp',
    '/images/work/ethical-node-demo-2.webp',
    '/images/ethical-node/cover.webp',
  ],
};
