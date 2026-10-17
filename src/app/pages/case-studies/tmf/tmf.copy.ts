// TMF case-study copy. English only, plain const.
// Facts come from the owner's CV (docs/content.md, "Microfinance loan-management platform") and the staff web app
// repo of Thardeep Microfinance Foundation (read, never modified): Angular, 1,398 commits from Aug 2021 to Nov 2024 by a team; the owner wrote
// 254 of the 721 commits made between Aug 2023 and Feb 2024. Credit is split the way git blame splits it: the
// settings area (roles and limits, products, policies, lookups, offices, users, donors), the loan calculator (with a
// teammate), borrower, guarantor and group screens (shared) and the Angular 11 to 15 upgrade are the owner's; the
// approval desks are shared work; accounting, end of day, reports and the printed schedule are teammates'.
// The owner confirmed (2026-10-11) naming the client, Thardeep Microfinance Foundation (TMF): a microfinance
// foundation, not a bank. Its mark comes from the repo's assets. The company the owner built it for is never named,
// and neither is any bank. No borrower data, CNICs, staff names, hosts or endpoint paths appear; every
// figure, product and limit in the demos is a sample.

export const COPY = {
  seo: {
    title: 'TMF case study',
    description:
      'Thardeep Microfinance Foundation (TMF), Pakistan: the staff loan-management platform for borrower and group registration, a loan calculator, an approval chain of nine desks with limits per role and product, disbursement and repayment. Angular 15, Material and 163 permission keys.',
    imageAlt: 'TMF case study cover: the foundation’s mark above "Nine desks between a loan and its cheque." beside an approval chain and a repayment schedule.',
  },
  hero: {
    tag: 'Case study',
    pill: 'Aug 2023 to Feb 2024, loan-management platform',
    line1: 'Thardeep Microfinance Foundation.',
    line2: 'Nine desks between a loan and its cheque.',
    lede: 'TMF runs every loan through one staff web app, its loan-management platform: borrowers and their groups, a quote, a field visit, an approval chain from branch to CEO, then a cheque and a repayment schedule. In a small team I built its settings, the calculator and the borrower screens, worked on the approval desks and moved the app from Angular 11 to 15.',
    back: 'View work',
  },
  meta: [
    { k: 'Role', v: 'Angular developer, 254 of 721 commits in my months' },
    { k: 'Timeline', v: 'Aug 2023 to Feb 2024, fixes in 2024' },
    { k: 'Platforms', v: 'TMF staff app, branch to head office' },
    { k: 'Stack', v: 'Angular 15, Material, ngx-permissions' },
  ],
  numbers: [
    { value: '9', label: 'desks a loan can climb, from loan officer to CEO' },
    { value: '163', label: 'permission keys, each named after the API call it guards' },
    { value: '10', label: 'lending policies head office edits without a release' },
    { value: '11 → 15', label: 'Angular versions, upgraded in place in two days' },
  ],
  arch: {
    title: 'One app, from the branch to head office',
    sub: 'Branch staff meet the borrower; head office signs, pays and books. Both work in the same Angular app, and each sees only the menus its permissions allow.',
    left: 'At the branch',
    core: 'Lending API',
    coreSub: 'One permission per call',
    right: 'At head office',
    branch: [
      { icon: 'phosphorIdentificationCard', t: 'Register', s: 'Borrower, guarantors and group' },
      { icon: 'phosphorCalculator', t: 'Quote', s: 'Product, tenure, markup, fees' },
      { icon: 'phosphorMapPin', t: 'Verify', s: 'Field visit, recommended amount' },
    ],
    office: [
      { icon: 'phosphorStack', t: 'Approval desks', s: 'Approve, hold, observe, forward' },
      { icon: 'phosphorMoney', t: 'Disbursement', s: 'Cheque, then finance' },
      { icon: 'phosphorBookOpen', t: 'Accounts', s: 'Ledgers and end of day' },
      { icon: 'phosphorSlidersHorizontal', t: 'Settings', s: 'Roles, limits, policies' },
    ],
  },
  flow: {
    title: 'The life of a loan',
    sub: 'Six stages, and no desk decides without a written comment. Loans go to individuals or to groups, and a group needs its members and guarantors inside the policy’s limits before it can apply.',
    steps: ['Borrower registered', 'Loan quoted and applied', 'Verified in the field', 'Approved up the chain', 'Disbursed by cheque', 'Repaid in instalments'],
    holds: [
      { t: 'Who', s: 'Identity card and its expiry, education, profession, income and source, with guarantors tied to the borrower.' },
      { t: 'Group', s: 'Members and guarantors counted against the group limit policy before a group loan can go ahead.' },
      { t: 'Terms', s: 'A product and its tenure band set the amount range, the markup rate, the due-date window and the fees.' },
      { t: 'After', s: 'A schedule with markup on the falling balance, a penalty fee for late days and a provision book by portfolio age.' },
    ],
  },
  calc: {
    title: 'The quote a loan officer gives',
    sub: 'Each choice narrows the next: the product sets its repayment types and due-date window, the tenure band sets the amount range and the markup. I rebuilt this screen with a teammate; officers only see the products assigned to them.',
  },
  limits: {
    title: 'Who can sign, and up to how much',
    sub: 'The settings screen behind the desks. Each role gets its products and a ceiling inside the product’s range, and a desk shows Approve only when the loan fits under it. Head office changes the chain without a release.',
  },
  stack: {
    title: 'The stack',
    sub: 'Angular with Material forms and tables, permissions from the API, and PDFs drawn in the browser.',
    groups: [
      {
        t: 'Web',
        why: 'Lazy-loaded modules per area, one shell, Material tables and dialogs, and Flex Layout for the grid.',
        items: [
          { name: 'Angular 15', logo: 'angular' },
          { name: 'TypeScript', logo: 'typescript' },
          { name: 'RxJS', logo: 'reactivex' },
          { name: 'Angular Material', logo: 'materialdesign' },
          { name: 'Bootstrap 5', logo: 'bootstrap' },
          { name: 'Flex Layout', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Access and forms',
        why: 'Permissions loaded at sign-in drive every menu and button; masks keep amounts, IBANs and identity numbers clean.',
        items: [
          { name: 'ngx-permissions', icon: 'phosphorLock' },
          { name: 'ngx-mask', icon: 'phosphorShieldCheck' },
          { name: 'Moment', icon: 'phosphorCode' },
          { name: 'Searchable selects', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Output',
        why: 'Profiles and repayment schedules exported as PDF in the browser, lists to spreadsheets.',
        items: [
          { name: 'jsPDF', icon: 'phosphorFilePdf' },
          { name: 'html2canvas', icon: 'phosphorFilePdf' },
          { name: 'ngx-toastr', icon: 'phosphorBell' },
          { name: 'Spreadsheet export', icon: 'phosphorPackage' },
        ],
      },
    ],
  },
  decisions: {
    title: 'Decisions and what I’d change',
    sub: 'An app a team had grown for two years, TMF’s lending rules in flux, and six months to make the money side dependable.',
    items: [
      {
        t: 'Limits are data',
        s: 'Who may approve how much changes with every policy meeting. Keeping each role’s products and ceilings in settings meant a new limit was a form, not a build.',
      },
      {
        t: 'Permissions named after calls',
        s: 'Every key is the HTTP method and path it guards, down to each desk’s approve, hold and reject buttons. The menu hides exactly what the API would refuse, and a new screen needs no new naming scheme.',
      },
      {
        t: 'Officers see their products',
        s: 'The calculator lists every product for an admin and only the assigned ones for everyone else, so a quote never starts from a product the officer cannot sell.',
      },
      {
        t: 'Upgrade before features',
        s: 'The app was on Angular 11. I took it through 13 to 15 in two days, deleting dead modules, unused styles and mock files on the way, so the next features were built on a supported version.',
      },
      {
        t: 'One desk, not nine',
        s: 'Each desk is its own copy of the same view with different buttons. Today I’d build one desk component driven by a config of stage, next desk and allowed actions, so a tenth desk is a line, not a folder.',
      },
      {
        t: 'Types on the money',
        s: 'Much of the code passes loans around as untyped objects. I’d add typed models and typed reactive forms for amounts, tenures and schedules, where a wrong field costs real money.',
      },
    ],
  },
  next: {
    title: 'Lending software with many hands on it?',
    sub: 'Approval chains, role limits and the settings screens that let a business change its own rules.',
    hire: 'Hire me',
    other: 'Next: Ethical Node',
  },
} as const;
