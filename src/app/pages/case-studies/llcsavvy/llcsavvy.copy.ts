// LLC SAVVY case-study copy. English only, plain const.
// Facts come from the owner's CV (docs/content.md, "US company-formation, tax and bookkeeping sister platforms") and
// the llcsavvy_web repo (read, never modified): Angular 15 with Universal prerendering, Jan to Aug 2024, the owner
// wrote 115 of its 118 commits. It started as a copy of the Finclore codebase (/work/finclore). The brand is spelled
// "LLC SAVVY" in its title, logo and manifest. The company the owner built it for is never named, and the logo is
// not claimed as the owner's work. The live domain no longer resolves: the screenshots are the original build
// rendered against a sample API. Customer, staff, bank and payment data never appear; the portal and back office
// are shown as my own mockups with invented data.

export const COPY = {
  seo: {
    title: 'LLC SAVVY case study',
    description:
      'LLC SAVVY forms US companies for founders in Pakistan. Built on its sister Finclore’s Angular base, I took it further: a checkout priced in dollars and paid in rupees, a direct bank debit confirmed by one-time password, promo prices per product, and 94 prerendered blog posts.',
    imageAlt: 'LLC SAVVY case study cover: the globe mark above "A US company, paid for in rupees." beside the LLC SAVVY home page.',
  },
  hero: {
    tag: 'Case study',
    pill: 'Jan to Aug 2024, Angular',
    line1: 'LLC SAVVY',
    line2: 'A US company, paid for in rupees.',
    lede: 'LLC SAVVY forms US companies for founders in Pakistan. It is Finclore’s sister, built on the same Angular base. I took it where its market needed it: a checkout priced in dollars and paid in rupees, a direct bank debit confirmed by a one-time password, promo prices per product, and a blog prerendered for search.',
    back: 'View work',
  },
  meta: [
    { k: 'Role', v: 'Angular, 115 of 118 commits' },
    { k: 'Timeline', v: 'Jan to Aug 2024' },
    { k: 'Platforms', v: 'Public site, customer portal, back office' },
    { k: 'Stack', v: 'Angular 15, Universal, Firebase' },
  ],
  numbers: [
    { value: '96', label: 'pages prerendered for search, 94 of them blog posts' },
    { value: '3', label: 'checkout screens: the cart, the bank details and the one-time password' },
    { value: '2', label: 'ways to pay in rupees: a bank transfer first, then a direct debit' },
    { value: '29', label: 'API endpoint permissions, one more than its sister for promo codes' },
  ],
  site: {
    title: 'The public site',
    sub: 'The same seven steps and services as its sister, under a navy header with red buttons. Prerendered for search, with a blog that grew from 8 prerendered posts to 94.',
    url: 'LLC SAVVY, original build',
    heroAlt: 'LLC SAVVY home page: the globe mark and wordmark in a navy header, the headline about LLC registration in the USA from $102, the rotating list of available services, a stock photo of two shop owners at a laptop in the slanted hero frame, and the navy complete-package band at $296.',
    mobileAlt: 'LLC SAVVY home page on a phone: the mark, the wordmark and a menu button on navy, the headline from $102, then the navy complete-package band.',
    details: [
      {
        src: '/images/llcsavvy/site-steps.webp',
        h: 1000,
        alt: 'How it works: seven numbered steps from sharing your requirements to growing your business, beside an illustration of the formation form.',
        cap: 'Seven steps, shared with its sister',
      },
      {
        src: '/images/llcsavvy/site-services.webp',
        h: 1000,
        alt: 'Services we offer: a card for US LLC registration from $102 plus the state fee, with its timeline, requirements and a request a call link.',
        cap: 'Prices with the state fee on top',
      },
      {
        src: '/images/llcsavvy/site-addons.webp',
        h: 1000,
        alt: 'Add-ons: four cards for annual report filing, a US virtual mailing address, a US phone number and corporate tax filing, above the navy footer.',
        cap: 'Add-ons after formation',
      },
    ],
    note: 'The original build rendered against a sample API: the live domain is gone. Services, timelines and the notice are samples. The testimonials and the client logos are left out.',
  },
  sister: {
    title: 'Finclore’s sister',
    sub: 'LLC SAVVY began as a copy of the Finclore codebase. The wizard, the portal and the back office stayed shared; the brand, the money and the content went their own way.',
    brandCap: 'The globe: US stripes with a green crescent and star, and the wordmark in white on the navy header.',
    filterLabel: 'Show',
    filters: [
      { id: 'all', label: 'All' },
      { id: 'same', label: 'Shared' },
      { id: 'changed', label: 'Changed' },
      { id: 'new', label: 'New' },
    ],
    states: { same: 'Shared', changed: 'Changed', new: 'New' },
    rows: [
      { s: 'same', t: 'Formation wizard', d: 'Seven steps, each saved on the server, with the same rules for state, members, agent and EIN.' },
      { s: 'same', t: 'Order queues', d: 'Company registration, mailing address, registered agent and extra services, each as new, pending and complete.' },
      { s: 'same', t: 'Roles by endpoint', d: 'The same structural directive and the same keys, so a menu item shows only when its endpoint would answer.' },
      { s: 'changed', t: 'Brand and words', d: 'Name, mark, navy header, red buttons, and the text of every page and policy.' },
      { s: 'changed', t: 'The cart', d: 'Every subtotal and the total show their rupee amount at the day’s rate, with the rate’s source beside it.' },
      { s: 'changed', t: 'Payment', d: 'A bank transfer with an uploaded receipt first, then a direct bank debit confirmed by a one-time password.' },
      { s: 'changed', t: 'The blog', d: 'Prerendered posts went from 8 to 94, each on its own route with its own canonical link.' },
      { s: 'new', t: 'Promo codes', d: 'Per-product prices that hold between two dates, managed behind their own permission.' },
      { s: 'new', t: 'Transfer review', d: 'Staff open each transfer request with its receipt, then confirm it or delete it.' },
    ],
  },
  arch: {
    title: 'One app, three doors',
    sub: 'Visitors, customers and staff land in the same Angular app, as on its sister. Each part loads lazily behind its own guard and talks to one API.',
    left: 'Visitors and customers',
    core: 'One Angular app',
    coreSub: 'Prerendered, 60 lazy routes',
    right: 'Staff',
    customers: [
      { icon: 'phosphorGlobe', t: 'Public site and blog', s: '94 prerendered posts' },
      { icon: 'phosphorListNumbers', t: 'Formation wizard', s: 'Seven steps, saved per step' },
      { icon: 'phosphorCurrencyDollar', t: 'Cart', s: 'Dollars, with rupees beside' },
      { icon: 'phosphorBank', t: 'Direct debit', s: 'Bank details, then an OTP' },
    ],
    staff: [
      { icon: 'phosphorTray', t: 'Order queues', s: 'New, pending, complete' },
      { icon: 'phosphorReceipt', t: 'Transfer requests', s: 'Receipts to confirm' },
      { icon: 'phosphorTag', t: 'Promo codes', s: 'Prices per product' },
      { icon: 'phosphorKey', t: 'Roles', s: 'Permissions by endpoint' },
    ],
  },
  flow: {
    title: 'The life of an order',
    sub: 'The same five states as its sister. What changed sits around the second one: how a founder in Pakistan pays for a company in Wyoming.',
    steps: ['Info provided', 'Payment', 'New', 'Pending', 'Complete'],
    holds: [
      { t: 'Saved per step', s: 'Every wizard screen posts to the API, so the order reopens on the step the customer left.' },
      { t: 'Two currencies', s: 'Prices stay in dollars, as the state fees are. Each company’s subtotal and the total add their rupee amount at the day’s rate.' },
      { t: 'Promo prices', s: 'A code swaps in its own price for each product it covers. The server answers with the new lines, so the cart never does the discount maths itself.' },
      { t: 'Proof of payment', s: 'First an uploaded receipt that staff confirmed by hand, later the bank’s own one-time password.' },
    ],
  },
  pay: {
    title: 'Two ways to pay in rupees',
    sub: 'The first version took bank transfers: the customer uploaded a receipt and staff checked it. Five months later a direct debit through a local gateway took a person out of the loop.',
  },
  promo: {
    title: 'Promo prices per product',
    sub: 'A promo code is a set of prices, not a percentage: one per product it covers, live between two dates. Staff build it in the back office; the cart asks the server to apply it.',
  },
  stack: {
    title: 'The stack',
    sub: 'Its sister’s Angular 15 base with prerendering and a service worker, plus input masks and a local payment gateway for the new checkout.',
    groups: [
      {
        t: 'Web',
        why: 'Three lazy-loaded areas, guards per audience, an interceptor and one facade over the data services.',
        items: [
          { name: 'Angular 15', logo: 'angular' },
          { name: 'TypeScript', logo: 'typescript' },
          { name: 'RxJS', logo: 'reactivex' },
          { name: 'Bootstrap 5', logo: 'bootstrap' },
          { name: 'ng-bootstrap', icon: 'phosphorCode' },
          { name: 'ng-select', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Rendering and content',
        why: 'The home page and 94 blog posts prerendered with Angular Universal; a rich-text editor writes the posts.',
        items: [
          { name: 'Angular Universal', logo: 'angular' },
          { name: 'Express', icon: 'phosphorCode' },
          { name: 'Service worker', icon: 'phosphorPackage' },
          { name: 'Rich-text editor', icon: 'phosphorCode' },
          { name: 'Highcharts', icon: 'phosphorChartLineUp' },
        ],
      },
      {
        t: 'Accounts and payments',
        why: 'Google One Tap sign-in, push notifications, masked ID and phone fields, live chat and a direct-debit gateway.',
        items: [
          { name: 'Google One Tap', icon: 'phosphorLock' },
          { name: 'Firebase Cloud Messaging', logo: 'firebase' },
          { name: 'ngx-mask', icon: 'phosphorShieldCheck' },
          { name: 'intl-tel-input', icon: 'phosphorTranslate' },
          { name: 'Live chat widget', icon: 'phosphorPlugs' },
          { name: 'Payment gateway', icon: 'phosphorCreditCard' },
        ],
      },
    ],
  },
  decisions: {
    title: 'Decisions and what I’d change',
    sub: 'A sister product on a copied codebase, a new market, and money that had to cross a currency on the way in.',
    items: [
      {
        t: 'Start from the sister',
        s: 'Copying Finclore gave LLC SAVVY a working wizard, portal and back office on day one. The time went into what its market needed: the money and the content.',
      },
      {
        t: 'Dollars first, rupees beside',
        s: 'State fees are set in dollars, so prices stay in dollars and the rupee amount sits under each subtotal, with the rate and its source. Customers see what leaves their account before they reach the bank screen.',
      },
      {
        t: 'Let the bank confirm',
        s: 'Receipts meant a person checked every payment. The direct debit validates the customer with their bank and asks for an OTP only when the bank does, so an order reaches the queue without anyone checking a picture.',
      },
      {
        t: 'Promo maths on the server',
        s: 'The cart sends only the code and gets back repriced lines. One place decides what a code is worth, and its dates are checked where its prices live.',
      },
      {
        t: 'One codebase, not two',
        s: 'Two copies meant every shared fix landed twice, and a few shared illustrations still carried the sister’s name. Today I’d run both brands from one codebase with a theme and a config per brand.',
      },
      {
        t: 'Payments behind one interface',
        s: 'The gateway arrived as a new branch of the payment screen beside the transfer flow. Today I’d put each method behind one interface, so a new one is a new class, not a new screen.',
      },
    ],
  },
  next: {
    title: 'A product that has to work in two currencies?',
    sub: 'Checkouts, local payment methods and back offices that agree with their API.',
    hire: 'Hire me',
    other: 'Next: TMF',
  },
} as const;
