// ePractise case-study copy. English only, plain const.
// Facts come from the owner's CV (docs/content.md, "Practice-management SaaS for tax consultants and accounting
// firms") and the two repos in D:\workspace-office\ePractice (read, never modified): ePractice_web (the public site,
// the firm workspace and the client portal; Angular 16, Bootstrap, Firebase; the owner wrote 730 of its 2,158
// commits from Apr 2024 to Sep 2026) and ePractice_tenant_web_app (tenant management: sign-up, verification, plans,
// subscriptions; Angular 16 with PrimeNG; 36 of its 89 commits, the most of anyone). The brand is spelled
// "ePractise" on epractise.com. The company the owner built it for is never named. The workspace, the portal and
// the tenant app are shown as my own mockups with invented firms, clients and documents; prices are the public ones.

export const COPY = {
  seo: {
    title: 'ePractise case study',
    description:
      'ePractise is practice-management software for tax and accounting firms. I build its Angular frontends: the public site, the sign-up that gives every new firm its own workspace, and the workspace itself, with pipelines that run automations, organizers on a grid and a client portal.',
    imageAlt: 'ePractise case study cover: the ePractise wordmark above "A tax firm, run from one workspace." beside the epractise.com home page.',
  },
  hero: {
    tag: 'Case study',
    pill: 'Apr 2024 to now, Angular frontend',
    line1: 'ePractise.',
    line2: 'A tax firm, run from one workspace.',
    lede: 'ePractise gives tax and accounting firms one place for clients, jobs, documents, organizers, invoices and a client portal. I build its Angular side: the public site, the sign-up that sets up each new firm’s workspace, and much of the workspace itself.',
    back: 'View work',
  },
  meta: [
    { k: 'Role', v: 'Angular and UI, 766 commits in a team' },
    { k: 'Timeline', v: 'Apr 2024 to now' },
    { k: 'Platforms', v: 'Public site, tenant app, workspace, portal' },
    { k: 'Stack', v: 'Angular 16, Bootstrap, PrimeNG, Firebase' },
  ],
  numbers: [
    { value: '2', label: 'Angular apps: tenant management, and the firm workspace with its portal' },
    { value: '19', label: 'areas in the firm workspace, from clients to time entries' },
    { value: '12', label: 'template types a firm reuses, from organizers to recurring invoices' },
    { value: '11', label: 'automations a pipeline stage can fire when a job arrives' },
  ],
  site: {
    title: 'The public site',
    sub: 'Features, the six steps of a digital tax workflow, plans and a FAQ, in the product’s blue. I rebuilt it in November 2025, and its Start free trial button is where provisioning begins.',
    url: 'epractise.com',
    heroAlt: 'ePractise home page: the blue e wordmark and menu, the headline "Practice Management that runs your firms", Start free trial and Book a demo buttons, four tiles for portal, workflows, reports and billing, and an illustration of an account overview with documents, jobs, invoices and tasks.',
    mobileAlt: 'ePractise home page on a phone: the wordmark, a menu button, the headline, both buttons, the four tiles and the account overview illustration.',
    details: [
      {
        src: '/images/epractise/site-features.webp',
        h: 877,
        alt: 'Everything your firm needs, in one place: five feature cards for the client portal, workflow automation, messaging, billing and reporting.',
        cap: 'Features',
      },
      {
        src: '/images/epractise/site-pricing.webp',
        h: 922,
        alt: 'Choose your perfect plan: a monthly and yearly switch above Growth, Pro marked most popular, and Enterprise.',
        cap: 'Plans, picked before sign-up',
      },
    ],
    workflowAlt: 'Achieve a digital tax workflow: six numbered steps, from obtaining documentation through organizing, prep and review, signing and filing, delivering and storing, to invoicing.',
    workflowCap: 'The six-step tax workflow',
    note: 'Live site. In the hero illustration a company name and staff names are covered with grey bars, and the customer logo strip is hidden.',
  },
  arch: {
    title: 'Two apps and one hand-off',
    sub: 'A firm signs up in the tenant-management app. Once its plan is set, it crosses into its own workspace with a one-time token, where staff and clients work side by side on different screens.',
    left: 'Before the firm exists',
    core: 'Token hand-off',
    coreSub: 'One sign-in, carried across',
    right: 'Inside the workspace',
    before: [
      { icon: 'phosphorTag', t: 'Pick a plan', s: 'On the public site, monthly or yearly' },
      { icon: 'phosphorIdentificationCard', t: 'Register the firm', s: 'Firm name, owner and time zone' },
      { icon: 'phosphorEnvelopeSimple', t: 'Verify', s: 'A code sent by email' },
      { icon: 'phosphorCreditCard', t: 'Subscribe', s: 'A trial, or a hosted checkout' },
    ],
    inside: [
      { icon: 'phosphorUsersThree', t: 'Firm staff', s: 'Clients, jobs, documents, invoices' },
      { icon: 'phosphorUserCircle', t: 'Clients', s: 'A portal scoped to their account' },
      { icon: 'phosphorStack', t: 'Templates', s: 'Twelve types the pipelines reuse' },
      { icon: 'phosphorBellRinging', t: 'Notifications', s: 'Firebase push to staff and clients' },
    ],
  },
  flow: {
    title: 'From sign-up to a working firm',
    sub: 'Five steps across both apps. Signing in later follows the same rules: the subscription decides where a person lands.',
    steps: ['Plan picked', 'Firm registered', 'Email verified', 'Trial or checkout', 'Workspace opens'],
    holds: [
      { t: 'Active or in trial', s: 'Straight into the firm’s workspace, carried by a one-time token.' },
      { t: 'Paused or cancelled', s: 'Back to subscriptions, where the owner can pick a plan again.' },
      { t: 'Invited staff', s: 'A new team member sets their own password before anything else.' },
      { t: 'First sign-in', s: 'Three short screens: the owner and the firm, their role in it, and how they found ePractise.' },
    ],
  },
  pipeline: {
    title: 'Pipelines that move work on',
    sub: 'A pipeline is a firm’s process as stages. Each stage fires automations when a job arrives, and with Automove on it hands the job on once the client has done their part.',
  },
  organizer: {
    title: 'Organizers, laid out on a grid',
    sub: 'An organizer is the questionnaire a client fills in before the return. Questions sit in rows: drop one beside another and the row shares its width evenly, up to four across. I built the grid and its drag and drop.',
  },
  portal: {
    title: 'One job, two views',
    sub: 'Staff see the internal stage, private folders and every file to review. The client sees a plain status, what is still needed and why a file came back. Client requests are scoped to the client’s own account.',
  },
  invoice: {
    title: 'Invoices, from line item to paid',
    sub: 'An invoice is built from the firm’s services, with its discount and tax as lines of their own, then sent now or on a date. Reminders go out by email, push or SMS, and the client uploads proof of payment for the firm to confirm. I wrote most of the invoicing screens.',
  },
  stack: {
    title: 'The stack',
    sub: 'Angular 16 in both apps, Bootstrap in the workspace and PrimeNG in tenant management, Firebase for push.',
    groups: [
      {
        t: 'Workspace and portal',
        why: 'Lazy-loaded modules for staff and clients, guards per role and one interceptor that scopes every request.',
        items: [
          { name: 'Angular 16', logo: 'angular' },
          { name: 'TypeScript', logo: 'typescript' },
          { name: 'RxJS', logo: 'reactivex' },
          { name: 'Bootstrap 5', logo: 'bootstrap' },
          { name: 'ng-bootstrap', icon: 'phosphorCode' },
          { name: 'Angular CDK drag and drop', logo: 'angular' },
        ],
      },
      {
        t: 'Tenant management',
        why: 'Sign-up, email verification, plans, subscriptions, invoices and transactions for each firm.',
        items: [
          { name: 'Angular 16', logo: 'angular' },
          { name: 'PrimeNG', logo: 'primeng' },
          { name: 'Bootstrap 5', logo: 'bootstrap' },
          { name: 'Hosted checkout', icon: 'phosphorCreditCard' },
          { name: 'ngx-toastr', icon: 'phosphorBell' },
        ],
      },
      {
        t: 'Documents, chat and meetings',
        why: 'PDF invoices and signatures in the browser, live chat, calendars and video calls with clients.',
        items: [
          { name: 'Firebase Cloud Messaging', logo: 'firebase' },
          { name: 'jsPDF and pdf-lib', icon: 'phosphorFilePdf' },
          { name: 'PDF.js', icon: 'phosphorFilePdf' },
          { name: 'STOMP over SockJS', icon: 'phosphorBroadcast' },
          { name: 'FullCalendar', icon: 'phosphorCode' },
          { name: 'Highcharts', icon: 'phosphorChartLineUp' },
          { name: 'Zoom Meeting SDK', icon: 'phosphorPlugs' },
        ],
      },
    ],
  },
  decisions: {
    title: 'Decisions and what I’d change',
    sub: 'Many firms, each with staff and clients, on one codebase and two apps.',
    items: [
      {
        t: 'Billing in its own app',
        s: 'Sign-up, plans and subscriptions live in tenant management; client work lives in the workspace. Each deploys on its own path, and a payment problem never reaches a screen with client data on it.',
      },
      {
        t: 'Scope in one place',
        s: 'When a client signs in, one interceptor adds their account to every request. A new portal screen is scoped from its first line, without anyone remembering to do it.',
      },
      {
        t: 'Templates before automations',
        s: 'Organizers, requests, invoices, emails and tasks are templates first. A pipeline stage only points at them, so a firm changes its organizer once and every pipeline sends the new one.',
      },
      {
        t: 'A grid for organizers',
        s: 'Questions sit in rows that share their width, not in one long list, and each keeps its row, column and width. Firms lay out an organizer the way the paper one looked, and clients scroll far less.',
      },
      {
        t: 'A code, not a token, in the URL',
        s: 'The hand-off carries an access token in the address, where it lands in history and logs. Today I’d pass a short-lived one-time code and swap it for a session with a POST.',
      },
      {
        t: 'One component library',
        s: 'The workspace uses Bootstrap and the tenant app PrimeNG, so one product has two sets of buttons and dialogs. I’d pick one, move to standalone components and signals, and upgrade Angular with it.',
      },
    ],
  },
  next: {
    title: 'A SaaS that needs its tenants set up right?',
    sub: 'Multi-tenant Angular frontends, sign-up and provisioning flows, and the client portals that go with them.',
    hire: 'Hire me',
    other: 'Next: LLCSavvy',
  },
} as const;
