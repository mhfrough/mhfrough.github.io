// Copy for /hire. English only, plain const. Facts come from docs/content.md; owner to confirm the offer wording.
// Rules: no prices, no employer or client names, no em/en dashes.

export const HIRE_COPY = {
  seo: {
    title: 'Hire me',
    description:
      'Hire Mohammad Hamza (@mhfrough), a software architect in Karachi, for freelance builds, contract work, Angular architecture reviews and frontend rescues. Quote after a short scoping call.',
    imageAlt: 'Hire Mohammad Hamza, software architect',
  },

  hero: {
    pillTagOn: 'Available',
    pillTagOff: 'Booked',
    pillOn: 'Taking on new projects',
    pillOff: 'Booked for now, still happy to talk',
    line1: 'Built right,',
    line2: 'from day one.',
    lede: 'Freelance, contract and review work from a software architect with nearly 7 years of production Angular, NestJS and SaaS.',
    primary: 'Get in touch',
    secondary: 'View work',
    facts: [
      { v: '7 yrs', k: 'in production SaaS' },
      { v: '14+', k: 'products delivered' },
      { v: 'UTC+5', k: 'overlaps UK and EU' },
    ],
  },

  ways: {
    title: 'Ways to work together',
    sub: 'Four shapes of engagement, from a single review to a long retainer. No public rates: every option is quoted after a short scoping call.',
    items: [
      {
        id: 'build',
        icon: 'phosphorCube',
        title: 'Project build',
        tag: 'Fixed scope',
        body: 'A product or feature from zero to production: architecture, frontend, API and deployment, delivered against an agreed scope and milestones.',
        points: ['Angular frontend', 'NestJS + PostgreSQL API', 'CI/CD to UAT and production'],
        wide: true,
        solid: true,
      },
      {
        id: 'contract',
        icon: 'phosphorCalendarBlank',
        title: 'Contract or retainer',
        tag: 'Part-time',
        body: 'A set number of days each month inside your team. Pull requests, reviews and decisions, same as any senior on the roster.',
        points: ['Joins your standups', 'Works in your repo'],
        wide: false,
        solid: false,
      },
      {
        id: 'review',
        icon: 'phosphorMagnifyingGlass',
        title: 'Architecture or code review',
        tag: 'Written report',
        body: 'A close read of the codebase with a prioritised report: what to keep, what to fix first and why.',
        points: ['Angular', 'Micro-frontends', 'Performance', 'Accessibility', 'SEO'],
        wide: false,
        solid: false,
      },
      {
        id: 'rescue',
        icon: 'phosphorLifebuoy',
        title: 'Frontend rescue',
        tag: 'Existing Angular app',
        body: 'An Angular app that grew faster than its structure: slow builds, tangled state, failing audits, an outdated version. Stabilise first, then upgrade and refactor in small, safe steps.',
        points: [
          'Version upgrades',
          'State and module cleanup',
          'Core Web Vitals',
          'WCAG 2.1 AA fixes',
        ],
        wide: true,
        solid: false,
      },
    ],
    fits: {
      title: 'Strong fits',
      body: 'Work where nearly 7 years of production experience pays off most.',
      items: [
        'Angular apps from zero or rescue',
        'Micro-frontend splits',
        'Multi-tenant SaaS frontends',
        'Embeddable widgets',
        'Design systems',
        'WCAG 2.1 AA passes',
        'SEO passes',
        'NestJS + PostgreSQL APIs',
        'Flutter companion apps',
      ],
    },
  },

  how: {
    title: 'How we work',
    sub: 'Five plain steps, the same for a two-week review or a six-month build. Every decision is written down, so nothing lives only in a call.',
    steps: [
      {
        icon: 'phosphorSignpost',
        t: 'Scope',
        d: 'A short call about the product, the users and the constraints. You get a written scope and a quote, with what is in and what is out.',
      },
      {
        icon: 'phosphorTreeStructure',
        t: 'Plan',
        d: 'Architecture, milestones and the first week mapped out. Trade-offs are noted in the repo, next to the code they affect.',
      },
      {
        icon: 'phosphorHammer',
        t: 'Build',
        d: 'Small, reviewed pull requests in your repository, deployed to a preview or UAT environment you can click through every week.',
      },
      {
        icon: 'phosphorRocket',
        t: 'Ship',
        d: 'Production release through CI/CD, with a handover doc your team can run with and no steps that live only in my head.',
      },
      {
        icon: 'phosphorLifebuoy',
        t: 'Support',
        d: 'A bug-fix window after launch, then an optional retainer for new features, upgrades and upkeep.',
      },
    ],
  },

  style: {
    title: 'Working style',
    sub: 'What you can count on from the first day, whichever way we work together.',
    rows: [
      {
        icon: 'phosphorGlobe',
        topic: 'Timezone',
        tag: 'UTC+5',
        promise: 'Overlaps UK and EU',
        d: 'Karachi sits 4 to 5 hours ahead of London, so your morning is my afternoon. Calls fit the shared window and the rest moves async.',
      },
      {
        icon: 'phosphorChatCircleText',
        topic: 'Updates',
        tag: 'async',
        promise: 'Written, every working day',
        d: 'A short note on what shipped, what is next and what is blocked, in Slack, Teams or email. No status meetings unless you want them.',
      },
      {
        icon: 'phosphorKey',
        topic: 'Ownership',
        tag: 'your repo',
        promise: 'You own the code',
        d: 'Work happens in your repository and accounts from day one. Code, designs and docs are yours, with no lock-in and nothing held back.',
      },
      {
        icon: 'phosphorWheelchair',
        topic: 'Quality',
        tag: 'WCAG 2.1 AA',
        promise: 'Accessible by default',
        d: 'Semantic HTML, keyboard paths and contrast, plus the metadata and structured data search engines read. Part of the build, not a phase you pay for later.',
      },
      {
        icon: 'phosphorTestTube',
        topic: 'Tests',
        tag: 'Playwright',
        promise: 'Tested where it matters',
        d: 'Unit tests on logic, end-to-end tests on the flows that make money, and automated accessibility checks in CI.',
      },
    ],
  },

  faq: {
    title: 'Questions, answered',
    sub: 'The things clients usually ask before the first call.',
    items: [
      {
        q: 'What are your rates?',
        a: 'There are no public rates. After a short scoping call you get a fixed quote for a defined scope, or a monthly figure for a retainer, in writing and before any work starts.',
      },
      {
        q: 'Will you sign an NDA?',
        a: 'Yes. Send a reasonable NDA before you share details and I will sign it. Client names stay private by default, which is why this site names none.',
      },
      {
        q: 'How do you handle the timezone difference?',
        a: 'Karachi is UTC+5, which overlaps UK and EU working hours from your morning to mid afternoon. Calls go in that window, and daily written updates cover the rest.',
      },
      {
        q: 'Do you work outside Angular?',
        a: 'Yes. NestJS and PostgreSQL on the backend, Flutter for mobile companions, and React, Next.js or plain PHP for marketing and listing sites. Angular is where I am strongest, so that is where I add the most.',
      },
      {
        q: 'Are you open to full-time roles?',
        a: 'For the right remote team, yes. Use the contact form, choose Full-time role, and share the role and the team behind it.',
      },
      {
        q: 'How soon can you start?',
        a: 'Usually within one to two weeks of agreeing the scope, depending on current commitments. The availability badge at the top of this page is kept up to date.',
      },
    ],
  },

  close: {
    title: 'Have something in mind?',
    sub: 'A few lines about what you are building is enough to start. I reply to every message.',
    cta: 'Get in touch',
  },
} as const;

/** Scope builder (hero card). Values map onto the contact form's topic and timeline fields. */
export const SCOPE_COPY = {
  title: 'Scope your project',
  typeLegend: 'What do you need?',
  focusLegend: 'Focus areas',
  focusHint: 'Pick any',
  startLegend: 'When to start',
  outLabel: 'Your brief',
  copy: 'Copy',
  copied: 'Copied',
  copyLabel: 'Copy brief',
  copiedSr: 'Brief copied',
  continue: 'Continue to contact',
  note: 'Carries this brief into the contact form.',
  types: [
    { value: 'build', label: 'New build', topic: 'freelance', phrase: 'Build a new product' },
    {
      value: 'rescue',
      label: 'Rescue',
      topic: 'freelance',
      phrase: 'Rescue an existing Angular app',
    },
    {
      value: 'review',
      label: 'Review',
      topic: 'review',
      phrase: 'Review an architecture or codebase',
    },
    {
      value: 'contract',
      label: 'Contract',
      topic: 'contract',
      phrase: 'Add a part-time senior to the team',
    },
  ],
  focus: [
    { value: 'angular', label: 'Angular', phrase: 'Angular' },
    { value: 'mfe', label: 'Micro-frontends', phrase: 'micro-frontends' },
    { value: 'saas', label: 'Multi-tenant', phrase: 'multi-tenant SaaS' },
    { value: 'perf', label: 'Performance', phrase: 'performance' },
    { value: 'a11y', label: 'Accessibility', phrase: 'accessibility' },
    { value: 'seo', label: 'SEO', phrase: 'SEO' },
    { value: 'api', label: 'NestJS API', phrase: 'a NestJS API' },
    { value: 'mobile', label: 'Flutter', phrase: 'a Flutter app' },
  ],
  starts: [
    { value: 'asap', label: 'ASAP', phrase: 'starting as soon as possible' },
    { value: 'month', label: 'This month', phrase: 'starting within a month' },
    { value: 'quarter', label: '1 to 3 months', phrase: 'starting in 1 to 3 months' },
    { value: 'later', label: 'Exploring', phrase: 'just exploring for now' },
  ],
} as const;
