// HRM Suite case-study copy. English only, plain const.
// HRM Suite is the owner's own product (its PRD lists him as owner; the repo is his, D:\workspace-personal\
// design-system). The owner asked for this case study (2026-10-11): "big project, not live yet, still in
// development". So: no launch claims, no customers, no uptime or compliance claims (the product's own remediation
// brief forbids those until there is evidence). Every figure below is a count from the source or from its latest
// recorded test run (hrm/docs/test-suites.md, 2026-10-09), and says so.
// Security: no endpoint names, the operator console's path, keys, demo credentials or hostnames.
// Competitors named in the product's pricing notes are never named here.

export const COPY = {
  seo: {
    title: 'HRM Suite case study',
    description:
      'HRM Suite, my multi-tenant HR, attendance and payroll platform for companies in Pakistan, in development: an Angular web app, a Flutter check-in app, a NestJS and PostgreSQL API with row-level security, and the design system under all of it.',
    imageAlt: 'HRM Suite case study cover: the HR mark above "HR, attendance and payroll on one record."',
  },
  hero: {
    tag: 'In development',
    pill: 'My own product, 2026',
    line1: 'HRM Suite.',
    line2: 'HR, attendance and payroll on one record.',
    lede: 'A multi-tenant HR platform for small and mid-sized companies in Pakistan. I am designing and building all of it: the web app, the phone app for check-ins, the API and the design system underneath. It has not launched yet.',
    back: 'View work',
    status: 'Not live yet: everything on this page runs on demo data',
  },
  meta: [
    { k: 'Role', v: 'Owner, design and full stack' },
    { k: 'Status', v: 'In development, not launched' },
    { k: 'Surfaces', v: 'Website, web app, Android, console' },
    { k: 'Stack', v: 'Angular 21, NestJS 12, PostgreSQL, Flutter' },
  ],
  numbers: [
    { value: '169', label: 'of 171 roadmap tasks done across 20 phases; the last two are QA' },
    { value: '0', label: 'cross-tenant leaks in 158 calls aimed at another company’s records' },
    { value: '445', label: 'backend unit tests passing, plus 1,263 scenario checks' },
    { value: '14', label: 'architecture decision records, each with the trade-off it accepts' },
  ],
  shots: {
    title: 'The product, as it runs today',
    sub: 'The HR web app on its seeded demo company, plus self service and the website. Real screens from the development build, captured with Playwright, not mockups.',
    url: 'HRM Suite, development build',
    heroAlt:
      'HRM Suite dashboard in the light theme: a sidebar of modules, KPI tiles for active employees, net payroll, open approvals, people on leave and compliance alerts, a "Needs attention" list, approvals, today’s attendance, the payroll stage and compliance deadlines.',
    phoneAlt:
      'The phone check-in card: inside the Karāchi office fence at 42 m, the time, the shift, a fingerprint button to check in, a verified selfie and the annual leave balance.',
    phoneCap: 'Phone check-in, as the website previews it',
    grid: [
      {
        src: '/images/hrm/app-payruns.webp',
        cap: 'Pay runs',
        alt: 'Pay runs: net pay, headcount, open exceptions and next cut-off tiles over seven monthly runs, the current one in the Validate stage with two blocking exceptions and the rest locked and published.',
      },
      {
        src: '/images/hrm/app-payslip.webp',
        cap: 'A payslip',
        alt: 'A payslip document over the payroll screen: employee details, earnings and deductions in PKR, net pay in figures and words, employer contributions and year to date.',
      },
      {
        src: '/images/hrm/app-leave-calendar.webp',
        cap: 'Team leave calendar',
        alt: 'Team leave calendar for October: coloured bars per leave type, dashed pending requests, shaded weekends and a public holiday, with the selected day’s detail on the right.',
      },
      {
        src: '/images/hrm/app-register.webp',
        cap: 'Daily attendance register',
        alt: 'Daily attendance register for a Friday: present, late, absent, on leave, work from home and overtime tiles over a table of employees with status, source (biometric or mobile), times and lateness.',
      },
      {
        src: '/images/hrm/app-ess.webp',
        cap: 'Employee self service',
        alt: 'Self service home for one employee: a profile card, a large clock-in button with today’s shift and timer, quick actions such as apply for leave or submit a claim, pending requests and leave balances.',
      },
      {
        src: '/images/hrm/site-hero.webp',
        cap: 'The marketing website',
        alt: 'The HRM Suite website in its dark theme: "HR, attendance and payroll. One platform." beside a live-looking attendance register card, with book a demo and live demo buttons.',
      },
    ],
    note: 'Development build with its own in-browser demo data: a fictional company, fictional people and sample PKR figures. Bank names are masked.',
  },
  record: {
    title: 'One record, end to end',
    sub: 'In most small companies here, attendance, leave and payroll live in three spreadsheets that someone stitches together every month end. HRM Suite keeps one employee record that every module reads and writes.',
    steps: ['Hired on the web', 'Checks in on the phone', 'Attendance entry', 'Payroll input', 'Payslip in the phone inbox', 'Posted to the books'],
    modules: [
      { icon: 'phosphorUsers', t: 'Employees', s: 'Employee master, org chart and structure, change requests on whitelisted fields.' },
      { icon: 'phosphorFingerprint', t: 'Attendance', s: 'Geo-fenced phone punches, shifts, rosters, punch import and regularization.' },
      { icon: 'phosphorCalendarCheck', t: 'Leave', s: 'Policies, balances, a team calendar and holidays, routed to approvals.' },
      { icon: 'phosphorSealCheck', t: 'Approvals', s: 'One approval centre with maker-checker, SLAs, risk and delegation.' },
      { icon: 'phosphorMoney', t: 'Payroll', s: 'Guided runs with proration, loan recovery, salary tax slabs and payslips.' },
      { icon: 'phosphorHandCoins', t: 'Loans and benefits', s: 'Advances recovered through payroll, claims reimbursed through it too.' },
      { icon: 'phosphorPercent', t: 'Tax and insurance', s: 'Filer and non-filer withholding, filings due, policies and premiums.' },
      { icon: 'phosphorUserCircle', t: 'Self service', s: 'Clock in, leave, payslips, claims and requests for every employee.' },
      { icon: 'phosphorBookOpen', t: 'Accounts', s: 'Double-entry books that payroll, claims and loans post to on their own.' },
      { icon: 'phosphorTray', t: 'Inbox and chat', s: 'Shared mailboxes for HR, and live chat for the product’s own support.' },
    ],
    local: 'Built for Pakistan: CNIC, NTN, IBAN, EOBI and PESSI, FBR filer status, PKR and a July to June tax year are part of the data model, not custom fields.',
  },
  payroll: {
    title: 'Month end, as a guided run',
    sub: 'Payroll is not a button. It is six stages with blocking exceptions instead of silent errors, an approval chain the submitter can’t sign, and a lock at the end. Try it: the rules below are the product’s own.',
  },
  attendance: {
    title: 'Attendance that proves itself',
    sub: 'Paper registers can’t prove who was at the gate. The phone can: a fresh GPS fix against the office fence, then a fingerprint, a selfie or one tap. The server decides, with the same rule you can play with here.',
  },
  ds: {
    title: 'A design system first',
    sub: 'Before any HR screen, I built the system they are made of: plain CSS custom properties and framework-free JavaScript, documented on one page in 97 sections. The Angular app and the Flutter app both follow it.',
    facts: [
      { v: '12', t: 'colour scales', s: 'Primitives from 50 to 950, never used directly by a component.' },
      { v: '8', t: 'accents', s: 'One attribute maps the primary role to any of them, even on a single element.' },
      { v: '3', t: 'densities', s: 'Compact, default and comfortable rewrite control and row heights.' },
      { v: '2', t: 'themes', s: 'Dark picks steps from the same ramps; it is not an inversion.' },
    ],
    layers: [
      { k: 'Primitive', code: '--blue-600: #2563eb', s: 'A raw step on a scale.' },
      { k: 'Semantic', code: '--c-primary', s: 'A role, mapped per theme and accent.' },
      { k: 'Component', code: '.btn-primary', s: 'Uses roles only.' },
    ],
    compareTitle: 'Same tokens, two themes',
    compareSub: 'Drag to compare the dashboard in the light and dark themes. Only token values change.',
    lightAlt: 'The dashboard in the light theme.',
    darkAlt: 'The same dashboard in the dark theme.',
    pageAlt:
      'The design-system page: a sidebar of sections, a hero "A complete, token-driven UI system for HR and payroll SaaS" with stat tiles and floating sample widgets, and four principle cards.',
    pageCap: 'The documentation page',
    themingAlt:
      'The theming section: light and dark theme cards, eight accent swatches, a density switch, scoped accent buttons in all eight colours, the three token layers and a brand override example.',
    themingCap: 'Theme, accent and density',
    buttonsAlt:
      'The buttons section: variants, sizes and states, button groups, a split button, segmented controls, counters, a floating action button and press feedback.',
    buttonsCap: 'Buttons, sizes and states',
    rules: [
      'Contrast checked per token: shades that failed 4.5:1 were darkened and the change is commented in the file.',
      'A colour-blind safe chart palette, validated in both themes, with a table view behind every chart.',
      'Reduced motion zeroes every duration token at once.',
      'Six Playwright suites guard it: smoke, components, theming, axe accessibility, visual and mobile.',
    ],
  },
  arch: {
    title: 'Four surfaces, one API',
    sub: 'The website, the HR web app, the Android app and a hidden operator console all talk to one NestJS API on PostgreSQL. Each company is a tenant, and the database itself enforces the wall between them.',
    left: 'Surfaces',
    right: 'Behind the API',
    core: 'HRM API',
    coreSub: 'NestJS 12, one versioned contract',
    surfaces: [
      { icon: 'phosphorGlobe', t: 'Website', s: 'Pricing, docs, demo booking' },
      { icon: 'phosphorBrowser', t: 'HR web app', s: 'Angular, with self service' },
      { icon: 'phosphorDeviceMobile', t: 'Phone app', s: 'Flutter, Android' },
      { icon: 'phosphorLockKey', t: 'Operator console', s: 'Unlisted, its own sign-in' },
    ],
    behind: [
      { icon: 'phosphorDatabase', t: 'PostgreSQL', s: 'Row-level security, forced' },
      { icon: 'phosphorEnvelope', t: 'Mail servers', s: 'SMTP, IMAP and POP3' },
      { icon: 'phosphorBellRinging', t: 'Push', s: 'Each company’s own Firebase' },
      { icon: 'phosphorHardDrives', t: 'File storage', s: 'Signed links, checked bytes' },
    ],
    walls: [
      {
        t: 'Wall one: the repository',
        s: 'Every query goes through one repository that adds the tenant. Primary keys are the pair of tenant and id, so an id alone never finds a row.',
      },
      {
        t: 'Wall two: the database',
        s: 'Row-level security is enabled and forced on every table. The app connects as a role that cannot bypass it, so a bug in wall one still returns nothing.',
      },
      {
        t: 'Sign-in',
        s: 'Password plus an emailed code, or a passkey. Passwords hashed with scrypt; CNIC and bank numbers encrypted at rest.',
      },
    ],
  },
  testing: {
    title: 'Tested as if it were live',
    sub: 'Nobody uses it yet, so the tests are the only users. Four suites, each one command, each on its own throw-away database. The numbers are from the latest recorded run.',
    suites: [
      {
        k: 'Unit',
        v: '445 / 445',
        s: 'Pure rules with no database: permissions, the payroll engine, mail parsing, settings access. About 25 seconds.',
      },
      {
        k: 'Tenant isolation',
        v: '16 / 16',
        s: 'A second company aims 158 calls at the first one’s real ids: no leaks, no changed rows, no server errors. 116 tables audited for forced row-level security.',
      },
      {
        k: 'Scenarios and parity',
        v: '1,263 checks',
        s: 'Every API scenario on a freshly seeded clone, including 614 checks that the API answers exactly like the web app’s mock.',
      },
      {
        k: 'Design system',
        v: '6 suites',
        s: 'Playwright on desktop light, desktop dark and a phone, with axe for accessibility and visual capture.',
      },
    ],
    honest:
      'The latest end-to-end run was 32 of 34. The two failures are expected: approval rules are being tightened so each step needs a user of that step’s role, and the old journeys still assume the looser rule.',
  },
  decisions: {
    title: 'Decisions and trade-offs',
    sub: 'Fourteen are written down as decision records. These six shaped the product most.',
    items: [
      {
        t: 'The mock is the contract',
        s: 'The web app shipped first against an in-browser mock. The API now publishes which modules it serves; the app routes those to it and keeps the mock for the rest, and parity tests hold the API to the mock’s answers.',
      },
      {
        t: 'Two walls between tenants',
        s: 'A scoped repository could be enough until one query forgets it. Forcing row-level security in PostgreSQL costs some setup per connection and buys a second wall that code can’t skip.',
      },
      {
        t: 'Records as documents',
        s: 'Each record is stored as JSON in the shape the contract describes, with the fields that need indexes promoted to columns and a version for optimistic locking. Fast to evolve while the model still moves.',
      },
      {
        t: 'One node, no Redis',
        s: 'Rate limits, jobs and live chat run in one process on one PostgreSQL. It is the right size before launch, and the decision lists what scaling out needs: a shared store for limits and a pub/sub for chat.',
      },
      {
        t: 'Books with one writer',
        s: 'Accounting is double entry with a single function that posts: debits must equal credits, money is kept as decimal strings, and nothing is edited; a void posts a reversal.',
      },
      {
        t: 'A console nobody can find',
        s: 'The operators’ console sits on an unlisted path with its own sign-in, an authenticator code, short sessions and a lockout. It is kept out of search and out of every promo video.',
      },
    ],
  },
  stack: {
    title: 'The stack',
    sub: 'TypeScript end to end on the web and the API, Dart on the phone, and one shared contract package between them.',
    groups: [
      {
        t: 'Web',
        why: 'Standalone Angular with signals, ECharts for the dashboards, the design system’s CSS underneath.',
        items: [
          { name: 'Angular 21', logo: 'angular' },
          { name: 'TypeScript', logo: 'typescript' },
          { name: 'RxJS', logo: 'reactivex' },
          { name: 'ECharts', icon: 'phosphorChartLineUp' },
          { name: 'Angular CDK', logo: 'angular' },
        ],
      },
      {
        t: 'API and data',
        why: 'NestJS on Node 22 with TypeORM and PostgreSQL, WebSockets for chat, passkeys, and push sent straight to FCM.',
        items: [
          { name: 'NestJS 12', logo: 'nestjs' },
          { name: 'Node.js', logo: 'nodedotjs' },
          { name: 'PostgreSQL', logo: 'postgresql' },
          { name: 'TypeORM', logo: 'typeorm' },
          { name: 'WebSockets', icon: 'phosphorBroadcast' },
          { name: 'Passkeys', icon: 'phosphorLock' },
        ],
      },
      {
        t: 'Phone and quality',
        why: 'Flutter for the employee app; Jest, Playwright and axe for the tests.',
        items: [
          { name: 'Flutter', icon: 'phosphorCode' },
          { name: 'Firebase Messaging', logo: 'firebase' },
          { name: 'Jest', icon: 'phosphorShieldCheck' },
          { name: 'Playwright', icon: 'phosphorGauge' },
          { name: 'axe', icon: 'phosphorShieldCheck' },
        ],
      },
    ],
  },
  next: {
    title: 'What is next',
    sub: 'Nothing here is launched. This is the honest list between today and a first customer.',
    progressLabel: 'Roadmap',
    progress: '169 of 171 tasks',
    items: [
      { s: 'Open', t: 'Phone push, verified end to end', d: 'Notifications reach the Android app from each company’s own Firebase project.' },
      { s: 'Open', t: 'Final run guide and test report', d: 'The last task of the hardening phase.' },
      { s: 'In progress', t: 'Approvals, segregation of duties', d: 'Every approval step must be signed by a user of that step’s role.' },
      { s: 'In progress', t: 'Legal pages', d: 'Privacy, terms and the processing agreement are drafts waiting for counsel.' },
      { s: 'Planned', t: 'API keys and webhooks', d: 'Settings are stored; key sign-in and a delivery engine are not built.' },
      { s: 'Planned', t: 'Object storage and payments', d: 'Files move from local disk to S3; a payment gateway is not chosen yet.' },
    ],
  },
  cta: {
    title: 'Building a multi-tenant SaaS?',
    sub: 'Tenant isolation, design systems, payroll-grade rules and the tests that prove them.',
    hire: 'Hire me',
    other: 'Next: Quorum',
  },
} as const;
