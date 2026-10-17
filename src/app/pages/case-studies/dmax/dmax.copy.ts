// DMAX case-study copy. English only, plain const.
// Facts come from the owner's CV (docs/content.md, "High-volume banking data-extraction tool") and the four DMAX
// repos (read, never modified): Angular 14 apps for DB2, flat-file and MongoDB extraction plus a statements app,
// Sep 2023 to Sep 2026, the owner wrote 235 of their 291 commits. The product may be named; the company that makes
// it and every client bank are never named. DMAX is internal: there is no public site to screenshot, so every screen
// here is my own mockup with invented tables, accounts and numbers.

export const COPY = {
  seo: {
    title: 'DMAX case study',
    description:
      'DMAX extracts large banking datasets from DB2, flat-file and MongoDB stores and turns them into customer statements. I built its four Angular apps: three extraction consoles that count every row, and a statements app with bulk runs in the background.',
    imageAlt: 'DMAX case study cover: the stacked-blocks mark above "Core banking data, extracted and accounted for." beside a sample extraction job with its per-table progress.',
  },
  hero: {
    tag: 'Case study',
    pill: 'Sep 2023 to now, internal banking tool',
    line1: 'DMAX',
    line2: 'Core banking data, extracted and accounted for.',
    lede: 'DMAX pulls large transaction datasets out of DB2, flat-file and MongoDB stores and turns them into customer statements. I built the Angular side: three extraction consoles, one per store, where every row is counted as extracted, failed or duplicate, and the statements app bank staff use every day.',
    back: 'View work',
  },
  meta: [
    { k: 'Role', v: 'Angular frontend, 235 of 291 commits' },
    { k: 'Timeline', v: 'Sep 2023 to now' },
    { k: 'Platforms', v: 'Three extraction consoles, one statements app' },
    { k: 'Stack', v: 'Angular 14, RxJS, Bootstrap 5, jsPDF' },
  ],
  numbers: [
    { value: '4', label: 'Angular apps: an extraction console per store and a statements app' },
    { value: '3', label: 'ways to extract: incremental, one table direct, or statement entries' },
    { value: '65', label: 'versioned releases of the statements app, each stamped into the build' },
    { value: '1,000', label: 'rows shown on screen before a statement goes to PDF' },
  ],
  mockNote: 'DMAX is an internal tool, so there is no public site to show. Every screen on this page is my own mockup, with invented tables, accounts and figures.',
  arch: {
    title: 'Four apps, one pattern',
    sub: 'Each data store has its own extraction console, and statements live in a fourth app. All four share one shell, so an operator who knows one knows them all.',
    left: 'Extraction consoles',
    core: 'One Angular shell',
    coreSub: 'Auth, permissions, polling',
    right: 'Statements app',
    consoles: [
      { icon: 'phosphorDatabase', t: 'DB2', s: 'Incremental and direct runs' },
      { icon: 'phosphorFiles', t: 'Flat files', s: 'Same console, file store' },
      { icon: 'phosphorTreeStructure', t: 'MongoDB', s: 'Plus statement extraction' },
      { icon: 'phosphorColumns', t: 'Headers', s: 'Column names per table' },
    ],
    statements: [
      { icon: 'phosphorReceipt', t: 'Quick statement', s: 'By account, old account or IBAN' },
      { icon: 'phosphorFilePdf', t: 'Full statement', s: 'PDF or CSV download' },
      { icon: 'phosphorStack', t: 'Bulk statements', s: 'A list in, one file out' },
      { icon: 'phosphorUserCheck', t: 'Users', s: 'Requests approved by a second user' },
    ],
  },
  flow: {
    title: 'The life of an extraction',
    sub: 'One run at a time per console. The operator starts it, the page polls its status, and the run ends in a report either way.',
    steps: ['Configure', 'Start', 'Running', 'Paused', 'Complete'],
    holds: [
      { t: 'Polled at your rate', s: 'The status endpoint is called every 1, 3 or 5 seconds. The operator picks the rate and the browser remembers it.' },
      { t: 'Counted per table', s: 'Each table reports its total, extracted, failed and duplicate rows and its records per second, rolled up into the run.' },
      { t: 'Pause, resume, cancel', s: 'A running job can be paused and picked up again where it stopped. Cancel always asks for confirmation first.' },
      { t: 'Reported after', s: 'Every run lands in the reports tab with its failed records and an activity log, ready to search and export.' },
    ],
  },
  queue: {
    title: 'Watch the job, not a spinner',
    sub: 'Live counters for every run, per table. Pause it, cancel it, retry the rows that failed, and download the result when it is done.',
  },
  columns: {
    title: 'Headers people can read',
    sub: 'Core banking columns arrive with system names. Staff rename them, put them in order and switch off what they do not need, per table, and every export uses their names.',
  },
  statement: {
    title: 'Statements from the archive',
    sub: 'One account by its number, old number or IBAN, or a whole list at once. Long statements stop at 1,000 rows on screen; the file always has all of them.',
  },
  stack: {
    title: 'The stack',
    sub: 'Angular 14 modules with Bootstrap components, charts for the run dashboards and jsPDF for statements, built and versioned the same way in all four repos.',
    groups: [
      {
        t: 'Web',
        why: 'Lazy-loaded modules behind two guards, one auth interceptor and one alert and toast service per app.',
        items: [
          { name: 'Angular 14', logo: 'angular' },
          { name: 'TypeScript', logo: 'typescript' },
          { name: 'RxJS', logo: 'reactivex' },
          { name: 'Bootstrap 5', logo: 'bootstrap' },
          { name: 'ng-bootstrap', icon: 'phosphorCode' },
          { name: 'ng-select', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Charts and documents',
        why: 'Run dashboards in charts, statements drawn to PDF in the browser, and CSV for the spreadsheets.',
        items: [
          { name: 'Highcharts', icon: 'phosphorChartLineUp' },
          { name: 'ApexCharts', icon: 'phosphorChartLineUp' },
          { name: 'jsPDF', icon: 'phosphorFilePdf' },
          { name: 'jspdf-autotable', icon: 'phosphorFilePdf' },
          { name: 'ngx-mask', icon: 'phosphorCode' },
          { name: 'ngx-skeleton-loader', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Safety and delivery',
        why: 'Menu-name permissions, an idle sign-out that waits for downloads, and a version stamped into every build.',
        items: [
          { name: 'Auth interceptor', icon: 'phosphorLock' },
          { name: 'Route guards', icon: 'phosphorShieldCheck' },
          { name: 'Idle timeout', icon: 'phosphorGauge' },
          { name: 'Versioned builds', icon: 'phosphorPackage' },
          { name: 'Polling with RxJS', icon: 'phosphorBroadcast' },
        ],
      },
    ],
  },
  decisions: {
    title: 'Decisions and what I’d change',
    sub: 'Jobs that run for an hour, files with millions of rows, and staff who must never wonder whether a run finished.',
    items: [
      {
        t: 'Poll, at a rate the operator picks',
        s: 'A status endpoint and a timer: 1, 3 or 5 seconds, saved in the browser. It needs nothing beyond plain HTTP, and on a slow link the operator eases it off without a release.',
      },
      {
        t: 'Count every row three ways',
        s: 'Extracted, failed and duplicate, per table and for the run. A finished job is only trusted when the three add up to the total, so the screen shows all of them, not one percentage.',
      },
      {
        t: 'Show 1,000 rows, file the rest',
        s: 'A statement over 1,000 entries shows the first 1,000 with a notice, and the PDF or CSV carries every row. The browser stays fast on accounts with years of history.',
      },
      {
        t: 'An idle timeout that waits for downloads',
        s: 'Five minutes idle signs a user out, but the timer pauses while a request is running. A long statement no longer logs someone out halfway through the file.',
      },
      {
        t: 'One workspace, not four copies',
        s: 'Each store got its own repo, copied from the same shell, so a fix in one was carried to the others by hand. Today I’d keep one workspace with a shared library and three thin apps.',
      },
      {
        t: 'Typed responses and signals',
        s: 'The services return untyped responses and the pages hold state in fields. Today I’d type every endpoint and move job state to signals, so a renamed field breaks the build, not a run.',
      },
    ],
  },
  next: {
    title: 'Big data jobs that people need to trust?',
    sub: 'Consoles that count every row, statements that scale, and internal tools that stay calm under load.',
    hire: 'Hire me',
    other: 'Next: ePractise',
  },
} as const;
