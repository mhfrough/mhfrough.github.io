// Asaan Hisab case-study copy. English only, plain const.
// Facts come from the owner's CV (work item "Accounting and invoicing app for SMEs", his first production project),
// the asan_hisab repo (read, never modified; 640 commits from March 2020 to January 2024, 231 of them the owner's)
// and the public sign-up page at asaanhisab.com. The brand's logo spells it "Asaan Hisab". The company the owner
// built it for is never named, nor the bank behind the app's loan form. Security: no endpoints, hosts or keys.
// The app behind sign-in appears only as my own mockups, with an invented business and figures.

export const LIVE_URL = 'https://asaanhisab.com/';

export const COPY = {
  seo: {
    title: 'Asaan Hisab case study',
    description:
      'Asaan Hisab, free accounting and invoicing for small businesses in Pakistan: the Angular app behind it, with income and expense forms that post double entries, invoices with sales tax in three layouts, and four financial reports. My first production project, 2020.',
    imageAlt: 'Asaan Hisab case study cover: the Asaan Hisab mark above "Bookkeeping, in plain words."',
  },
  hero: {
    tag: 'Case study',
    pill: 'Mar to Sep 2020, first production project',
    line1: 'Asaan Hisab.',
    line2: 'Bookkeeping, in plain words.',
    lede: 'Asaan Hisab means easy accounts. It is free accounting and invoicing for small businesses in Pakistan: the owner records a sale or a bill in plain words, and the app keeps proper double-entry books underneath. It was my first production project, a month after graduating.',
    live: 'Visit asaanhisab.com',
    back: 'View work',
  },
  meta: [
    { k: 'Role', v: 'Angular developer, 231 of 640 commits' },
    { k: 'Timeline', v: 'Mar to Sep 2020' },
    { k: 'Platforms', v: 'Sign-up site, accounting web app' },
    { k: 'Stack', v: 'Angular 9, Bootstrap 4, ag-Grid, Chart.js' },
  ],
  numbers: [
    { value: '231', label: 'of the app’s 640 commits are mine, the first in March 2020' },
    { value: '4', label: 'financial reports, from profit and loss to the ledger of one account' },
    { value: '3', label: 'invoice layouts, one with sales tax broken out on every line' },
    { value: '72', label: 'Angular components behind 34 lazy-loaded routes' },
  ],
  site: {
    title: 'The front door',
    sub: 'One public page does the selling: what the app does, that it is free, and a sign-up card right in the hero. I built its sign-up and sign-in screens, and the alerts and redirects around them.',
    url: 'asaanhisab.com',
    heroAlt: 'asaanhisab.com: the Asaan Hisab logo and a Sign in button, "Accounting & Invoicing for entrepreneurs and SMEs", and a sign-up card with email, password and "Create your free account".',
    mobileAlt: 'asaanhisab.com on a phone: the logo, a menu button, the headline and the sign-up card stacked below it.',
    featuresAlt: 'Six feature tiles with line icons: manage your business, track your expenses, create professional invoices, understand your business, take control of your cash flow, 100% free.',
    featuresCap: 'Six promises, one per feature',
    note: 'Screenshots of the live sign-up page. The app behind sign-in is shown below as my own mockups, with an invented business and figures.',
  },
  arch: {
    title: 'Plain forms in front, double entry underneath',
    sub: 'A shop owner should never have to know which side is the debit. Every form they fill posts balanced lines to one chart of accounts, and every report reads from those lines.',
    left: 'What the owner does',
    core: 'Chart of accounts',
    coreSub: 'Five heads, numbered accounts',
    right: 'What the books show',
    owner: [
      { icon: 'phosphorArrowDownLeft', t: 'Add income', s: 'Into cash or bank, split by category' },
      { icon: 'phosphorArrowUpRight', t: 'Add expense', s: 'Paid from cash or bank' },
      { icon: 'phosphorInvoice', t: 'Create an invoice', s: 'Items, tax, customer' },
      { icon: 'phosphorHandCoins', t: 'Record a payment', s: 'Against an open invoice' },
    ],
    books: [
      { icon: 'phosphorChartBar', t: 'Dashboard', s: 'Income, expenses, net income' },
      { icon: 'phosphorTable', t: 'Reports', s: 'P&L, balance sheet, trial balance' },
      { icon: 'phosphorFilePdf', t: 'Exports', s: 'Any date range, PDF or Excel' },
      { icon: 'phosphorLockSimple', t: 'Period closure', s: 'Into retained earnings' },
    ],
  },
  flow: {
    title: 'From a sale to the balance sheet',
    sub: 'One invoice, followed through the books. Each step is a screen I built or shared, and each one leaves the books in balance.',
    steps: ['Invoice sent', 'Payment recorded', 'Posted to the ledger', 'Read by the reports', 'Period closed'],
    holds: [
      {
        t: 'Accounts',
        s: 'Five numbered heads, from assets to expenses, with the business’s own accounts under each. A new account can be added right where it is missing.',
      },
      {
        t: 'Taxes',
        s: 'Each tax has a name, an abbreviation, a rate and the business’s own tax number, and is picked per invoice line.',
      },
      {
        t: 'Amounts',
        s: 'Thousands are grouped as you type. Once a transaction is split, its total is the sum of the parts and can’t be typed over.',
      },
      {
        t: 'Dates',
        s: 'Two-month date pickers everywhere, and ranges that can’t end before they start, from exports to the period closure.',
      },
    ],
  },
  journal: {
    title: 'Income and expenses, without the jargon',
    sub: 'The transaction screen I designed and built: a grid of everything recorded, and a side form to add income, add an expense or write a journal entry by hand. Try it in the hero above.',
    points: [
      { icon: 'phosphorArrowsSplit', t: 'Split one payment', s: 'One deposit, several income categories, each with its own amount.' },
      { icon: 'phosphorScales', t: 'Balance or no save', s: 'A journal entry shows how far out it is, and only saves at zero.' },
      { icon: 'phosphorMagnifyingGlass', t: 'A grid that keeps up', s: 'ag-Grid with quick search, paging up to 1,000 rows and an export by date range.' },
    ],
  },
  invoice: {
    title: 'Invoices that pass for official paperwork',
    sub: 'Three layouts for the same invoice. The government-standard one breaks the sales tax out on every line and prints both sides’ NTN, and every layout writes the total in words.',
  },
  reports: {
    title: 'Reports that always add up',
    sub: 'The four reports I built, worked out from the same entries. Close the period and watch net income move into retained earnings while the balance sheet keeps balancing.',
  },
  stack: {
    title: 'The stack',
    sub: 'Angular 9 in 2020, upgraded release by release to Angular 15 later on. Bootstrap and ng-bootstrap for the screens, ag-Grid for the lists, Chart.js for the dashboard.',
    groups: [
      {
        t: 'App',
        why: 'Lazy-loaded feature modules, route guards and resolvers, an HTTP interceptor and template-driven forms.',
        items: [
          { name: 'Angular 9', logo: 'angular' },
          { name: 'TypeScript', logo: 'typescript' },
          { name: 'RxJS', logo: 'reactivex' },
          { name: 'Bootstrap 4', logo: 'bootstrap' },
          { name: 'ng-bootstrap', icon: 'phosphorCode' },
          { name: 'ng-select', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Data on screen',
        why: 'Grids for every list, charts for the dashboard, masks for every amount and phone number.',
        items: [
          { name: 'ag-Grid', icon: 'phosphorPackage' },
          { name: 'Chart.js', icon: 'phosphorChartLineUp' },
          { name: 'ng2-charts', icon: 'phosphorChartLineUp' },
          { name: 'ngx-mask', icon: 'phosphorShieldCheck' },
          { name: 'SweetAlert2', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Paper',
        why: 'Reports and lists leave the app as PDF or Excel, and invoices print with the amount in words.',
        items: [
          { name: 'jsPDF + AutoTable', icon: 'phosphorFilePdf' },
          { name: 'ExcelJS', icon: 'phosphorPackage' },
          { name: 'number-to-words', icon: 'phosphorCode' },
          { name: 'Print layouts', icon: 'phosphorFilePdf' },
        ],
      },
    ],
  },
  decisions: {
    title: 'Decisions and what I’d change',
    sub: 'A first job, an accounting product, and two developers doing most of the building.',
    items: [
      {
        t: 'Words in front, ledger behind',
        s: '“Add income” and “Add expense” are what an owner understands. The same screen keeps a journal entry for the accountant, so nobody needs a second tool.',
      },
      {
        t: 'Split instead of retyping',
        s: 'One bank deposit often pays for two things. Splitting it into categories kept the record true to the bank statement, which is what people check it against.',
      },
      {
        t: 'Reports read the ledger, not the forms',
        s: 'Every report is worked out from posted lines, so profit and loss, the trial balance and the balance sheet can’t disagree with each other.',
      },
      {
        t: 'Paper that looks official',
        s: 'Clients registered for sales tax expect an invoice with the tax on every line, both sides’ NTN and the total in words. The government-standard layout prints exactly that, straight from the invoice.',
      },
      {
        t: 'Desktop first',
        s: 'Bookkeeping happens at a desk, and in May 2020 I took the phone layout out of the app shell; only the sign-up page stayed responsive. Today I’d build the app responsive from the first screen.',
      },
      {
        t: 'Typed forms, one money type',
        s: 'Amounts went through masks, pipes and string fixes in several places. Today: typed reactive forms and one money value object, so rounding and tax live in exactly one function.',
      },
    ],
  },
  next: {
    title: 'Need books, invoices or reports in your app?',
    sub: 'Double-entry logic behind simple forms, invoices with tax, and reports people trust.',
    hire: 'Hire me',
    other: 'Next: Finclore',
  },
} as const;
