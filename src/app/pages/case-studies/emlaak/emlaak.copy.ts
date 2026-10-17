// Emlaak case-study copy. English only, plain const.
// Facts come from the owner's CV, the product codebase (read, never screenshotted) and the public
// emlaakfinancials.com site. The owner asked for this case study by name (2026-10-11). The company that employs
// the owner is never named, and neither are the fund houses or banks on the platform (counts only).
// Security: describe the system at the level a visitor needs. No endpoint names, keys, storage keys or hostnames
// other than the public site. Fund names, rates and figures in the demos are samples.

export const LIVE_URL = 'https://emlaakfinancials.com/';

export const COPY = {
  seo: {
    title: 'Emlaak Financials case study',
    description:
      'Emlaak Financials, an SECP-licensed mutual fund marketplace in Pakistan: the Angular app for digital account opening, NADRA-verified KYC, risk profiling, fund comparison and portfolio tracking.',
    imageAlt: 'Emlaak case study cover: the Emlaak mark above "Every mutual fund, one account."',
  },
  hero: {
    tag: 'Case study',
    pill: '2020 to now, Angular frontend',
    line1: 'Emlaak Financials.',
    line2: 'Every mutual fund, one account.',
    lede: 'An SECP-licensed marketplace where investors in Pakistan open one account, find their risk level and invest in funds from many fund houses. I helped build its Angular app from the first commits in 2020, and came back in 2025 to extend and harden it.',
    live: 'Visit emlaakfinancials.com',
    back: 'View work',
  },
  meta: [
    { k: 'Role', v: 'UI design and Angular frontend' },
    { k: 'Timeline', v: 'Nov 2020 to now' },
    { k: 'Platforms', v: 'Public site, investor app' },
    { k: 'Stack', v: 'Angular, Material, RxJS, ngx-charts' },
  ],
  numbers: [
    { value: '2', label: 'account types, each with its own limits and its own KYC' },
    { value: '6', label: 'questions in the risk profile, scored into 5 risk bands' },
    { value: '111', label: 'Angular components across 20 lazy-loaded modules' },
    { value: '2,600+', label: 'commits on the app since December 2020' },
  ],
  site: {
    title: 'The front door, still in its 2020 design',
    sub: 'The public site explains the three steps (create an account, pick a fund, invest online) and sends people to the app. It still wears the design it launched with; the app behind it is where the work went.',
    heroAlt: 'emlaakfinancials.com home page: "Providing convenient, informative, interactive, medium to invest" beside a phone showing the fund categories.',
    objectivesAlt: 'emlaakfinancials.com: the three steps, Create Account, Pick Mutual Fund and Invest Online, above "Find the perfect investment" with four savings objectives.',
    benefitsAlt: 'emlaakfinancials.com: Benefits of Emlaak Financials: one-stop shop, transparency, online investment, portfolio tracking and reporting.',
    objectivesCap: 'Three steps and four savings goals',
    benefitsCap: 'What the marketplace promises',
    note: 'Screenshots of the live public site. The investor app is shown below as my own mockups, with sample funds and figures.',
  },
  arch: {
    title: 'One account in front of many fund houses',
    sub: 'Investors see one catalogue, one portfolio and one statement. Behind the app, each request goes to the fund house that runs the fund, and its status comes back to the dashboard.',
    left: 'Investor',
    core: 'Emlaak app',
    coreSub: 'Angular, 20 lazy modules',
    right: 'Behind the API',
    investor: [
      { icon: 'phosphorIdentificationCard', t: 'Account opening', s: 'NADRA documents, OTP, FATCA' },
      { icon: 'phosphorGauge', t: 'Risk profile', s: 'Six questions, five bands' },
      { icon: 'phosphorScales', t: 'Compare funds', s: 'Growth, statistics, holdings' },
      { icon: 'phosphorChartPieSlice', t: 'Portfolio', s: 'By fund house, category, asset' },
    ],
    back: [
      { icon: 'phosphorBuildings', t: 'Fund houses', s: 'Ready to invest, and the rest' },
      { icon: 'phosphorBank', t: 'Payment proof', s: 'IBFT or Raast receipt upload' },
      { icon: 'phosphorFilePdf', t: 'Statements', s: 'Drawn as PDF in the browser' },
    ],
  },
  accounts: {
    title: 'Two accounts, two rule sets',
    sub: 'A quick account for small savers and a full one for everyone else. The app enforces each one’s limits at every step: investing, redeeming and switching funds.',
    items: [
      {
        name: 'Sahulat Sarmayakari',
        tag: 'Quick account',
        lede: 'For first-time investors who want to start small, with lighter KYC.',
        points: [
          'One form: CNIC details, address, income, zakat status and a nominee',
          'Per-transaction, daily and yearly limits, checked on invest and redeem',
          'Funds above Low risk ask for the risk profile first',
          'NADRA CNIC front and back, nominee CNIC, CZ-50 and a utility bill',
        ],
      },
      {
        name: 'Sarmayakari',
        tag: 'Regular account',
        lede: 'No limits, and the full regulatory onboarding that comes with that.',
        points: [
          'Eight steps behind one progress bar, from contact check to declaration',
          'A 5-digit OTP on the mobile number, and who it belongs to if not you',
          'CRS and FATCA: a US question set and a W-9 upload when it applies',
          'KYC questions on political exposure, refused accounts and offshore links',
        ],
      },
    ],
  },
  onboarding: {
    title: 'Account opening, field by field',
    sub: 'Every field that carries a national format is masked as you type and checked before the step can close. The bank account field knows each bank’s code.',
    steps: ['Contact verification', 'Profile details', 'CRS and FATCA', 'KYC', 'Declaration'],
    rules: [
      { t: 'CNIC', s: '00000-0000000-0, with the issue date and both sides of the card.' },
      { t: 'Mobile', s: '0000-0000000, starting with 03, then a 5-digit OTP.' },
      { t: 'IBAN', s: 'PK, two check digits, the bank’s four-letter code, sixteen digits.' },
      { t: 'Documents', s: 'PNG, JPG or PDF, 2 MB at most, checked before upload.' },
    ],
  },
  risk: {
    title: 'Risk before reward',
    sub: 'Six picture questions add up to a score, and the score to a band. Funds riskier than your band are not hidden: the app warns, and you tick a disclaimer to go on.',
  },
  portfolio: {
    title: 'The portfolio, in one place',
    sub: 'What you put in, what it is worth, and where every request stands, across every fund house.',
    cards: [
      {
        icon: 'phosphorChartLineUp',
        t: 'Value over time',
        s: 'Portfolio value, investment, gross profit or loss and withdrawals, with a line graph and a live NAV ticker.',
      },
      {
        icon: 'phosphorListChecks',
        t: 'Request status',
        s: 'Every investment, redemption and conversion moves from review, to sent to the fund house, to complete.',
      },
      {
        icon: 'phosphorArrowsLeftRight',
        t: 'Redeem and convert',
        s: 'Both check the account’s limits. Converting into a riskier fund runs the risk profile again.',
      },
      {
        icon: 'phosphorFilePdf',
        t: 'Statements',
        s: 'An account statement built as a PDF in the browser with jsPDF, ready to download.',
      },
    ],
  },
  stack: {
    title: 'The stack',
    sub: 'An Angular app grown over six years: Material for structure, PrimeNG and Bootstrap for the rest, ngx-charts for every graph.',
    groups: [
      {
        t: 'App',
        why: 'Lazy-loaded feature modules, route resolvers, and services shared through one facade.',
        items: [
          { name: 'Angular 13', logo: 'angular' },
          { name: 'TypeScript', logo: 'typescript' },
          { name: 'RxJS', logo: 'reactivex' },
          { name: 'Angular Material', logo: 'materialdesign' },
          { name: 'PrimeNG', logo: 'primeng' },
          { name: 'Bootstrap 5', logo: 'bootstrap' },
        ],
      },
      {
        t: 'Forms and charts',
        why: 'Masked national formats, two kinds of captcha, and a chart for every number that moves.',
        items: [
          { name: 'ngx-mask', icon: 'phosphorShieldCheck' },
          { name: 'reCAPTCHA v2 and v3', icon: 'phosphorShieldCheck' },
          { name: 'ng-select', icon: 'phosphorCode' },
          { name: 'ngx-charts', icon: 'phosphorChartLineUp' },
          { name: 'Gauge chart', icon: 'phosphorGauge' },
          { name: 'SweetAlert2', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Documents and safety',
        why: 'Statements drawn on the client, a content security policy in the page, sessions that expire.',
        items: [
          { name: 'jsPDF + AutoTable', icon: 'phosphorFilePdf' },
          { name: 'html2canvas', icon: 'phosphorFilePdf' },
          { name: 'Content Security Policy', icon: 'phosphorLock' },
          { name: 'Session timeout', icon: 'phosphorLock' },
          { name: 'Cache-busted builds', icon: 'phosphorPlugs' },
        ],
      },
    ],
  },
  decisions: {
    title: 'Decisions and what I’d change',
    sub: 'Money and identity on one screen: every rule has to be visible, and every input has to be right the first time.',
    items: [
      {
        t: 'Masks that know the bank',
        s: 'The IBAN field is a form control and a validator in one directive. Pick a bank and its four-letter code is filled and locked; the rest must match the national format before the form is valid.',
      },
      {
        t: 'Warn, don’t block',
        s: 'An investor may choose a fund above their risk band. The app shows the gap and asks for a ticked disclaimer, so the choice is theirs and on record.',
      },
      {
        t: 'Limits in one place',
        s: 'The quick account’s per-transaction and daily limits are checked the same way on invest, redeem and convert, so no flow is the loophole.',
      },
      {
        t: 'Hardening an older app',
        s: 'In 2025 and 2026: a content security policy, sanitised alert messages against cross-site scripting, a 120-minute inactivity timeout, strict upload types and sizes, and account deletion.',
      },
      {
        t: 'One risk profile, not two',
        s: 'The questionnaire lives in the invest flow and again in the conversion flow. It should be one component both ask, so a scoring change lands once.',
      },
      {
        t: 'Typed forms, then a new front door',
        s: 'The KYC flow runs on template-driven forms in NgModules. Next is standalone components and typed reactive forms, then a public site that matches the app.',
      },
    ],
  },
  next: {
    title: 'Building something with money and KYC in it?',
    sub: 'Onboarding flows, masked national formats, risk rules and dashboards investors trust.',
    hire: 'Hire me',
    other: 'Next: Pizzerias',
  },
} as const;
