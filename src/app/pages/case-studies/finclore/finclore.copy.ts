// Finclore case-study copy. English only, plain const.
// Facts come from the owner's CV (docs/content.md, "US company-formation, tax and bookkeeping sister platforms") and
// the finclore-web repo (read, never modified): Angular 15 with Universal prerendering, Dec 2022 to Nov 2024, the
// owner wrote 254 of its 284 commits. The owner designed the Finclore logo (2026-10-11). The company the owner built
// it for is never named. The live domain is gone: the screenshots are the original build rendered against a sample
// API. Customer, staff and payment data never appear; the portal and back office are shown as my own mockups.

export const COPY = {
  seo: {
    title: 'Finclore case study',
    description:
      'Finclore forms US LLCs and C-Corps for founders outside the US. I designed its logo and built the Angular app: a prerendered public site, a seven-step formation wizard that saves as you go, and a back office whose permissions are named after its API endpoints.',
    imageAlt: 'Finclore case study cover: the F. mark above "A US company, formed from anywhere." beside the Finclore home page.',
  },
  hero: {
    tag: 'Case study',
    pill: 'Dec 2022 to Nov 2024, logo and Angular',
    line1: 'Finclore',
    line2: 'A US company, formed from anywhere.',
    lede: 'Finclore forms US companies for founders who live outside the US. I designed its logo and built the Angular app behind it: the public site, the customer portal where a seven-step wizard becomes a filed company, and the back office where staff assign and complete every order.',
    back: 'View work',
  },
  meta: [
    { k: 'Role', v: 'Logo, UI and Angular, 254 of 284 commits' },
    { k: 'Timeline', v: 'Dec 2022 to Nov 2024' },
    { k: 'Platforms', v: 'Public site, customer portal, back office' },
    { k: 'Stack', v: 'Angular 15, Universal, PWA, Firebase' },
  ],
  numbers: [
    { value: '7', label: 'wizard steps, each saved so a customer can stop and come back' },
    { value: '3', label: 'audiences in one Angular app: visitors, customers and staff' },
    { value: '62', label: 'lazy-loaded routes behind three sets of guards' },
    { value: '28', label: 'API endpoint permissions deciding what the back office shows' },
  ],
  site: {
    title: 'The public site',
    sub: 'The offer, the seven steps, services with prices and timelines, and add-ons. Prerendered for search, installable as an app, and set in the logo’s navy and red.',
    url: 'Finclore, original build',
    heroAlt: 'Finclore home page: the wordmark and menu, a navy notice bar, the headline about LLC registration in the USA from $120, a red Start Your Business button and a photo from the hero slider.',
    mobileAlt: 'Finclore home page on a phone: the wordmark, a menu button, the notice bar, the headline and the red button, then the navy complete-package band.',
    details: [
      {
        src: '/images/finclore/site-steps.webp',
        h: 1000,
        alt: 'How it works: seven numbered steps from sharing your requirements to growing your business, beside an illustration of the formation form.',
        cap: 'Seven steps, said plainly',
      },
      {
        src: '/images/finclore/site-services.webp',
        h: 1000,
        alt: 'Services we offer: a card for US company registration with its starting price, timeline, requirements and a request a call link.',
        cap: 'Services, prices and timelines',
      },
      {
        src: '/images/finclore/site-addons.webp',
        h: 1000,
        alt: 'Add-ons: four cards for annual report filing, a US virtual mailing address, a US phone number and corporate tax filing.',
        cap: 'Add-ons after formation',
      },
    ],
    note: 'The original build rendered against a sample API: the live domain is gone. Services, timelines and the notice bar are samples.',
  },
  logo: {
    title: 'The mark',
    sub: 'I designed the logo: a wordmark ending in a full stop, and an F. monogram for every square the brand had to fill. Two colours, the US flag’s own navy and red, for a company that forms US companies.',
    show: 'Show',
    ground: 'Ground',
    figTitle: 'Construction of the F. monogram on a 128 unit grid',
    rules: [
      { k: 'Letter', v: 'Jost Bold, the geometric face the whole site is set in, tracked in so the word reads as one shape.' },
      { k: 'Full stop', v: 'Red, enlarged, and sitting on the baseline. It starts exactly where the top arm of the F ends.' },
      { k: 'Weights', v: 'A 16 unit stem, a 14 unit top arm and a 12 unit middle arm, thinner so the F does not look top heavy.' },
      { k: 'Colours', v: 'Navy #0A3161 and red #B31942, the official blue and red of the US flag.' },
    ],
    layers: [
      { id: 'grid', label: 'Grid' },
      { id: 'measure', label: 'Measures' },
    ],
    onLight: 'On light: navy, with the red full stop',
    onDark: 'On the dark footer: one light grey, full stop included',
    sizes: 'The mark at favicon sizes',
    sizesNote: 'The vector F. at 16, 32 and 48 px, actual size. Even at 16 px the red full stop still reads.',
  },
  arch: {
    title: 'One app, three doors',
    sub: 'Visitors, customers and staff all land in the same Angular app. Each part loads lazily behind its own guard and talks to one API.',
    left: 'Visitors and customers',
    core: 'One Angular app',
    coreSub: 'Prerendered, installable',
    right: 'Staff',
    customers: [
      { icon: 'phosphorGlobe', t: 'Public site', s: 'Services, blog, FAQ, policies' },
      { icon: 'phosphorListNumbers', t: 'Formation wizard', s: 'Seven steps, saved per step' },
      { icon: 'phosphorCreditCard', t: 'Cart and payment', s: 'State fees, online checkout' },
      { icon: 'phosphorFileArrowDown', t: 'Documents', s: 'Download when complete' },
    ],
    staff: [
      { icon: 'phosphorTray', t: 'Order queues', s: 'New, pending, complete' },
      { icon: 'phosphorUserSwitch', t: 'Assign', s: 'Orders to consultants' },
      { icon: 'phosphorKey', t: 'Roles', s: 'Permissions by endpoint' },
      { icon: 'phosphorChartBar', t: 'Dashboard', s: 'Revenue, sign-ups, products' },
    ],
  },
  flow: {
    title: 'The life of an order',
    sub: 'A customer sees five states on every company they start. Staff work the last three as queues, one set for each service.',
    steps: ['Info provided', 'Payment', 'New', 'Pending', 'Complete'],
    holds: [
      { t: 'Saved per step', s: 'Every screen posts to the API and the order remembers the last one, so the wizard reopens where the customer stopped.' },
      { t: 'Priced per state', s: 'Each line is the service price plus the chosen state’s filing fee, summed in the order summary beside every step.' },
      { t: 'Locked at checkout', s: 'Once an order reaches payment, its registration turns read only. Agent, EIN, logo and website add-ons lock on their own.' },
      { t: 'Documents back', s: 'A completed order carries its filed documents, downloaded from the customer’s list of companies.' },
    ],
  },
  members: {
    title: 'Ownership that adds up',
    sub: 'Members, managers and shareholders, each with a share of the company. The form caps every share at what is left of 100%, and one person must be the contact.',
  },
  access: {
    title: 'Permissions named after endpoints',
    sub: 'Admins build roles from the API’s own endpoints. One structural directive reads the same keys, so a menu item exists only when its endpoint would answer.',
  },
  stack: {
    title: 'The stack',
    sub: 'Angular 15 with prerendering and a service worker, Bootstrap components, and a handful of integrations each doing one job.',
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
        t: 'Rendering and install',
        why: 'Public routes prerendered with Angular Universal; a service worker makes the app installable.',
        items: [
          { name: 'Angular Universal', logo: 'angular' },
          { name: 'Express', icon: 'phosphorCode' },
          { name: 'Service worker', icon: 'phosphorPackage' },
          { name: 'Highcharts', icon: 'phosphorChartLineUp' },
          { name: 'Rich-text editor', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Accounts and messaging',
        why: 'Google One Tap sign-in, push notifications, international phone numbers, live chat and online payments.',
        items: [
          { name: 'Google One Tap', icon: 'phosphorLock' },
          { name: 'Firebase Cloud Messaging', logo: 'firebase' },
          { name: 'intl-tel-input', icon: 'phosphorTranslate' },
          { name: 'Live chat widget', icon: 'phosphorPlugs' },
          { name: 'Payment gateway', icon: 'phosphorCreditCard' },
        ],
      },
    ],
  },
  decisions: {
    title: 'Decisions and what I’d change',
    sub: 'A long form, money at the end of it, and customers in other time zones who rarely finish in one sitting.',
    items: [
      {
        t: 'Save every step',
        s: 'The first screen asks only for a name and an email and creates the account. From then on each step is saved on the server, so a founder can stop at the members step and come back a week later.',
      },
      {
        t: 'Permissions as endpoint names',
        s: 'Roles are lists of the API’s own endpoints, like GET::assign. The back office checks the same strings, so the screen and the server can never disagree about who may see a queue.',
      },
      {
        t: 'One app, three audiences',
        s: 'The public site, the portal and the back office share one project, one facade and one design. Lazy modules and separate guards keep a visitor from downloading any of the staff screens.',
      },
      {
        t: 'A logo that survives a favicon',
        s: 'The wordmark only works wide. The F. monogram was drawn for the small squares: favicon, install icon and avatar, with the full stop kept red down to 16 px.',
      },
      {
        t: 'Payments behind one interface',
        s: 'The payment provider changed in 2024 and the switch meant editing the payment screen itself. Today I’d put every provider behind one interface, so the next change is a new class, not a new page.',
      },
      {
        t: 'Typed forms for a long wizard',
        s: 'The wizard runs on template-driven forms and loosely typed models. Today I’d use typed forms with one model per step, so a renamed field breaks the build instead of an order.',
      },
    ],
  },
  next: {
    title: 'A long form that has to end in a sale?',
    sub: 'Multi-step wizards, customer portals and back offices that agree with their API.',
    hire: 'Hire me',
    other: 'Next: Bloomstone',
  },
} as const;
