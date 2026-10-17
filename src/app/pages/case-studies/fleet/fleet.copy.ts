// Fleet and driver management SaaS case study copy (route /work/fleet). English only, plain const.
// Anonymized on purpose: the client, its brand, its region and the team are never named. Facts come from the
// owner's own read of the codebases (admin, API, two Flutter apps, chat widget) and his commit history; the
// screenshots are the real admin rendered locally against made-up data (scripts/fleet-shots.mjs).
// Security: describe the system at the level a visitor needs. No endpoint paths, hostnames, keys or bucket names.

export const COPY = {
  seo: {
    title: 'Fleet and driver management SaaS case study',
    description:
      'A multi-tenant fleet platform for a UK vehicle hire operator: an Angular admin, two Flutter apps and one NestJS and PostgreSQL API, with passkeys, Stripe, live chat and daily vehicle checks.',
    imageAlt: 'Fleet case study cover: "One API for the office, the depot and the driver." beside the fleet admin dashboard, with invented data.',
  },
  hero: {
    tag: 'Case study',
    pill: '2026, full stack, part-time contract',
    line1: 'Fleet and driver SaaS.',
    line2: 'One API, office to driver.',
    lede: 'A UK operator hires cars to private hire drivers. Staff run the fleet from an Angular admin, depot staff hand cars over on a Flutter app, and drivers manage their hire from their own. I built much of the admin and the API behind all three.',
    hire: 'Hire me',
    back: 'View work',
  },
  meta: [
    { k: 'Role', v: 'Full-stack developer, part-time' },
    { k: 'Year', v: '2026, UK client' },
    { k: 'Team', v: 'Small team, client under NDA' },
    { k: 'Stack', v: 'Angular, NestJS, PostgreSQL, Flutter' },
  ],
  numbers: [
    { value: '4', label: 'apps on one API: staff admin, driver app, depot app and a support chat widget' },
    { value: '54', label: 'NestJS modules behind roughly 616 API routes and 115 entities' },
    { value: '9', label: 'phases of the driver app API I built, from SMS sign-in to handing the car back' },
    { value: '1', label: 'card on the driver’s home screen, picked by seven rules in priority order' },
  ],
  journey: {
    title: 'A driver’s hire, in their pocket',
    sub: 'Drivers do not book in the app. They send an enquiry, staff match them to a car, and from then on the app runs the hire.',
    steps: ['Enquiry', 'SMS code sign-in', 'Daily walkaround', 'Weekly payment', 'Documents and fines', 'Extend or return'],
  },
  admin: {
    title: 'The staff admin',
    sub: 'Where the office runs the fleet: vehicles, drivers, hires, compliance, tasks and support chat. Angular 21, standalone and signal based, every page lazy loaded, light and dark themes tuned for contrast.',
    url: 'Fleet admin',
    heroAlt: 'The admin dashboard: fleet counts, hires ending soon, and compliance alert cards for MOTs, licences, badges and council tests.',
    shots: [
      {
        src: '/images/fleet/admin-bookings-dark.webp',
        h: 1000,
        alt: 'The hire calendar in the dark theme: one row per vehicle across 14 days, each hire a bar with its driver and end date.',
        cap: 'Hire calendar, in the dark theme',
      },
      {
        src: '/images/fleet/admin-tests.webp',
        h: 1000,
        alt: 'Upcoming tests: tabs for MOT, interim, renewal tests, licences, badges and DVLA checks, each row with days left and a status.',
        cap: 'Upcoming tests and renewals',
      },
      {
        src: '/images/fleet/admin-vehicles.webp',
        h: 1000,
        alt: 'The vehicles list: registration, model, depot, status pills and on hire state for the whole fleet.',
        cap: 'The fleet, one row per car',
      },
      {
        src: '/images/fleet/admin-drivers.webp',
        h: 1000,
        alt: 'The drivers list with licence expiry, DVLA check date, depot and hire status for each driver.',
        cap: 'Drivers and their compliance',
      },
      {
        src: '/images/fleet/admin-chat.webp',
        h: 1000,
        alt: 'Support chat: an inbox of driver conversations beside an open thread with the driver’s hire, vehicle and last payment.',
        cap: 'Support chat with driver context',
      },
      {
        src: '/images/fleet/admin-reports.webp',
        h: 1000,
        alt: 'Reports: fleet utilisation, available, on hire and in maintenance counts, and a breakdown by vehicle category.',
        cap: 'Reports, from utilisation to compliance',
      },
    ],
    note: 'The real admin, built and run on my machine against invented data: every name, plate, depot and figure is made up, and the client’s name and logo are removed.',
  },
  arch: {
    title: 'Four apps, one API, one database',
    sub: 'Every client talks to the same NestJS API. Every row carries its company, and the API refuses a query that does not know whose data it is reading.',
    left: 'Clients',
    core: 'Fleet API',
    coreSub: 'NestJS, PostgreSQL',
    right: 'Services',
    clients: [
      { icon: 'phosphorDesktop', t: 'Staff admin', s: 'Angular 21, passkey sign-in' },
      { icon: 'phosphorDeviceMobile', t: 'Driver app', s: 'Flutter, SMS code sign-in' },
      { icon: 'phosphorDeviceTablet', t: 'Depot app', s: 'Flutter, handovers and returns' },
      { icon: 'phosphorChatCircleDots', t: 'Chat widget', s: 'Angular, no account needed' },
    ],
    services: [
      { icon: 'phosphorCreditCard', t: 'Stripe', s: 'Each company’s own account' },
      { icon: 'phosphorCloudArrowUp', t: 'Object storage', s: 'Photos, PDFs, receipts' },
      { icon: 'phosphorBroadcast', t: 'Socket.IO and push', s: 'Alerts, chat, web push' },
      { icon: 'phosphorEnvelopeSimple', t: 'Email and SMS', s: 'Per company SMTP, codes, links' },
    ],
  },
  mine: {
    title: 'What I built',
    sub: 'The team shared the product. These parts are mine, end to end or close to it.',
    cards: [
      {
        icon: 'phosphorSquaresFour',
        t: 'The staff admin',
        s: 'The largest share of its commits: drivers, the hire calendar, vehicles, the compliance dashboard, reports, tasks and settings.',
      },
      {
        icon: 'phosphorDeviceMobile',
        t: 'The driver app API',
        s: 'Nine phases: SMS sign-in and the home card, documents, payments, fines, holidays, incidents, the walkaround, tests and returns.',
      },
      {
        icon: 'phosphorFingerprint',
        t: 'Passkeys for staff',
        s: 'WebAuthn sign-in with discoverable credentials, so there is no username to type, and per user control over every passkey.',
      },
      {
        icon: 'phosphorReceipt',
        t: 'Payments and receipts',
        s: 'Saved cards, bank transfers with scanned receipts, payment links by SMS, and one reconciliation path that cannot record twice.',
      },
      {
        icon: 'phosphorFilePdf',
        t: 'Hire documents',
        s: 'The hire agreement, the condition report with its damage diagram and photos, the return report and permission letters, as PDFs.',
      },
      {
        icon: 'phosphorChatsCircle',
        t: 'Live chat and alerts',
        s: 'Socket.IO notifications and support chat with typing, presence, read receipts and voice notes, split into its own widget app.',
      },
    ],
  },
  walk: {
    title: 'A daily check the server can trust',
    sub: 'Before the driver app unlocks each morning, the driver walks round the car in five steps: bodywork, tyres, lights, safety kit and mileage. The API rechecks every rule itself, whatever the app sends.',
    rules: [
      { t: 'Legal minimum', s: 'A tyre under 1.6 mm cannot be passed. The API rejects it unless it is flagged.' },
      { t: 'One defect per flag', s: 'Every flagged item needs exactly one defect with a photo and a severity.' },
      { t: 'Worst one wins', s: 'Minor, report or not safe. The check takes the worst severity it was given.' },
      { t: 'Grounded, one way', s: 'Not safe takes the car off the road and alerts staff. Only a person puts it back.' },
    ],
  },
  pay: {
    title: 'Three ways to pay, one record',
    sub: 'Drivers pay weekly hire by saved card in the app, by a link sent over SMS, or by bank transfer. Each company connects its own Stripe account. All three paths end in the same function, and it only ever records a payment once.',
  },
  comp: {
    title: 'Nothing expires quietly',
    sub: 'MOTs, insurance, council tests, driving licences and taxi badges all expire. An hourly scan across every company raises each alert once, and only for drivers and cars that are actually on the road.',
    marks: [
      { d: '30', t: 'Expiring soon', s: 'Vehicle documents, tests and licences enter the dashboard.' },
      { d: '21', t: 'Badge reminder', s: 'Taxi badges alert at 21, 14, 7 and 0 days, not daily.' },
      { d: '7', t: 'Warning', s: 'A driving licence moves from info to warning.' },
      { d: '0', t: 'Expired', s: 'Critical. The driver’s home card asks for the new document.' },
    ],
    rules: [
      'One alert per item, per recipient, per day',
      'Driver alerts only on an active hire',
      'Vehicle documents only if a council requires them',
      'A renewal receipt adds 30 days to a badge',
      'Date-only fields are days, not instants',
    ],
  },
  stack: {
    title: 'The stack',
    sub: 'TypeScript on the web and the server, Dart on the phones, PostgreSQL underneath.',
    groups: [
      {
        t: 'Admin and widget',
        why: 'Standalone Angular with signals and OnPush, lazy routes, and a contrast-tested light and dark theme.',
        items: [
          { name: 'Angular 21', logo: 'angular' },
          { name: 'TypeScript', logo: 'typescript' },
          { name: 'RxJS', logo: 'reactivex' },
          { name: 'Bootstrap 5', logo: 'bootstrap' },
          { name: 'Socket.io client', logo: 'socketdotio' },
          { name: 'SimpleWebAuthn', icon: 'phosphorLock' },
          { name: 'axe-core + Playwright', icon: 'phosphorShieldCheck' },
        ],
      },
      {
        t: 'API',
        why: 'A NestJS API with validation on every route, scheduled scans, domain events and two Socket.IO gateways.',
        items: [
          { name: 'NestJS 10', logo: 'nestjs' },
          { name: 'Node.js', logo: 'nodedotjs' },
          { name: 'TypeORM', logo: 'typeorm' },
          { name: 'PostgreSQL', logo: 'postgresql' },
          { name: 'Socket.io', logo: 'socketdotio' },
          { name: 'Passport', logo: 'passport' },
          { name: 'JWT', logo: 'jsonwebtokens' },
          { name: 'Stripe', logo: 'stripe' },
          { name: 'pdfmake', icon: 'phosphorFilePdf' },
          { name: 'sharp', logo: 'sharp' },
          { name: 'Swagger', logo: 'swagger' },
        ],
      },
      {
        t: 'Apps and delivery',
        why: 'Two Flutter apps from the team, with files in S3-compatible storage and staff push through Firebase.',
        items: [
          { name: 'Flutter', logo: 'flutter' },
          { name: 'Dart', logo: 'dart' },
          { name: 'Firebase Cloud Messaging', logo: 'firebase' },
          { name: 'Cloudflare R2', logo: 'cloudflare' },
          { name: 'SMTP and SMS gateway', icon: 'phosphorBell' },
        ],
      },
      {
        t: 'Hosting and deploys',
        why: 'UAT and production run on Coolify, an open-source, self-hosted platform in the same role as Netlify or Render, with builds made by Nixpacks.',
        items: [
          { name: 'Coolify', icon: 'phosphorCloudArrowUp' },
          { name: 'Nixpacks', icon: 'phosphorPackage' },
        ],
      },
    ],
  },
  decisions: {
    title: 'Decisions and what I’d change',
    sub: 'A hire business runs on dates, money and safety. Most choices came down to not trusting a clock, a client or a retry.',
    items: [
      {
        t: 'One card, not a feed',
        s: 'The driver home screen shows exactly one card, chosen by fixed priority: a grounded car outranks a fine, a fine outranks an expiring licence. Everything else waits in notifications.',
      },
      {
        t: 'Record now, let the webhook catch up',
        s: 'An in-app card payment is recorded straight away, so the driver sees it done. The webhook finds it paid and stops. Next I would back that status check with a unique constraint, so two webhooks at once cannot both write.',
      },
      {
        t: 'Fail closed on tenancy',
        s: 'The company lives in request context, and a scoped query with no company throws instead of returning everything. A test scans the code for queries that skip it. I moved the driver app’s services onto it.',
      },
      {
        t: 'Passkeys without server state',
        s: 'The WebAuthn challenge is signed into a token that lives two minutes, so any API instance can check it. No session table, no sticky routing.',
      },
      {
        t: 'Dates are days',
        s: 'An expiry shown a day early in one view and on time in another came from parsing date-only fields as UTC. I fixed it with one shared date-only parser and applied it across reports, tests, driver pages, holidays and bookings.',
      },
      {
        t: 'Photos sized at the source',
        s: 'Full-size photos sent as base64 timed out on weak signal. My fix resizes them to 1600 px before upload and gives slow uploads longer. Next would be uploading straight to storage instead of through the API.',
      },
    ],
  },
  next: {
    title: 'Running a fleet, a hire desk or a field team?',
    sub: 'Admin panels, driver and staff apps, payments and the API that keeps them honest, from the database up.',
    hire: 'Hire me',
    other: 'Next: Bloomstone',
  },
} as const;
