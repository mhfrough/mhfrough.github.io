// Call center case-study copy. English only, plain const.
// Facts come from the CallCenterFrontEnd repo (read, never modified): an Angular 15 portal titled "Call Center"
// where a central call center takes phone orders for several restaurants. Three roles on one sign-in (admin, call
// center, restaurant), seven lazy-loaded feature modules, five order statuses, a phone-number lookup that fills in
// a returning caller, prices per product size in euros, a printable receipt (html2canvas + jsPDF) and Firebase web
// push. Git: 11 commits by the owner, 26 Feb to 22 Mar 2023, including a QA bug-fix round.
// The product has no name of its own and the client and the company behind it are never named. No live site
// exists, so the portal appears only as my own mockups with invented restaurants, menus, callers and orders.
// Security: no endpoint names, hosts, keys or Firebase project ids.

export const COPY = {
  seo: {
    title: 'Call center portal case study',
    description:
      'An Angular portal where a central call center takes phone orders for several restaurants: a caller found by phone number, items priced by size, five order statuses, push notifications to the kitchen and a printable receipt. Three roles on one sign-in.',
    imageAlt: 'Call center case study cover: "Phone orders, typed once." beside a drawn order form with a returning caller filled in.',
  },
  hero: {
    tag: 'Case study',
    pill: 'Feb to Mar 2023, Angular frontend',
    line1: 'A call center for restaurants.',
    line2: 'Phone orders, typed once.',
    lede: 'Customers phone one number and order from several restaurants. I built the Angular portal behind it: the agent types the caller’s number and a returning caller fills in, picks items priced by size, and the restaurant finds the order in its own list, moves it through five statuses and prints the receipt.',
    back: 'View work',
  },
  meta: [
    { k: 'Role', v: 'Angular frontend, all 11 commits' },
    { k: 'Timeline', v: 'Feb to Mar 2023' },
    { k: 'Users', v: 'Admin, call center, restaurants' },
    { k: 'Stack', v: 'Angular 15, Bootstrap, Firebase, jsPDF' },
  ],
  numbers: [
    { value: '3', label: 'roles on one sign-in: admin, call center and restaurant' },
    { value: '7', label: 'lazy-loaded feature modules behind one guard' },
    { value: '5', label: 'order statuses, from Pending to Completed or Cancelled' },
    { value: '5', label: 'digits typed before the form looks for a returning caller' },
  ],
  mockNote: 'Every screen on this page is my own mockup with sample restaurants, menus and callers. Prices in euros, as the portal used.',
  arch: {
    title: 'One portal, three desks',
    sub: 'The call center takes the order, the restaurant cooks it, an admin keeps the list of restaurants and logins. Each sees only its own menu.',
    left: 'Call center',
    core: 'Orders API',
    coreSub: 'One set of calls per role',
    right: 'Restaurants',
    admin: 'Admin: restaurants, staff logins and the portal’s settings.',
    center: [
      { icon: 'phosphorPhoneCall', t: 'Take orders', s: 'Caller first, then items' },
      { icon: 'phosphorForkKnife', t: 'Menus', s: 'Categories, products by size' },
      { icon: 'phosphorPrinter', t: 'Receipts', s: 'Printed or saved as PDF' },
    ],
    kitchen: [
      { icon: 'phosphorListChecks', t: 'Incoming orders', s: 'Its own, nobody else’s' },
      { icon: 'phosphorArrowsClockwise', t: 'Status', s: 'Five steps, set from the order' },
      { icon: 'phosphorBellRinging', t: 'Notifications', s: 'Web push and a bell' },
    ],
  },
  flow: {
    title: 'The life of a phone order',
    sub: 'Two steps for the agent, then the order belongs to the restaurant. The items step only opens once the caller’s details are complete, because the menu depends on the restaurant.',
    steps: ['Phone rings', 'Caller found by number', 'Restaurant and items', 'Placed as Pending', 'Kitchen completes it'],
    holds: [
      { t: 'Who', s: 'Name, phone number and email, filled in from the last order when the number is known.' },
      { t: 'Where', s: 'Address, city, state and country, with a free note for the kitchen or the driver.' },
      { t: 'What', s: 'One line per product: the size, its price for that size, and the quantity.' },
      { t: 'Money', s: 'Subtotal, delivery charge, tax, discount and the total, in euros.' },
    ],
  },
  desks: {
    title: 'Same orders, different desks',
    sub: 'Switch roles. The call center sees every restaurant’s orders, a restaurant only its own, and an admin has no orders at all. Take a call, then sign in as the restaurant to see it arrive.',
  },
  receipt: {
    title: 'A receipt the kitchen can print',
    sub: 'The receipt follows the original layout: restaurant, order number, customer, items, totals and a paid stamp. This version writes the PDF as text; the shipped one saved a picture of the page.',
  },
  stack: {
    title: 'The stack',
    sub: 'Angular 15 with Bootstrap components, Firebase for one job, push notifications, and two libraries for the receipt.',
    groups: [
      {
        t: 'Web',
        why: 'Lazy-loaded modules, a sign-in guard, an interceptor for the token and one facade over the data services.',
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
        t: 'Forms and receipts',
        why: 'Searchable pickers for restaurants and products, alerts, a loader on every request, and the receipt as a PDF.',
        items: [
          { name: 'jsPDF', icon: 'phosphorFilePdf' },
          { name: 'html2canvas', icon: 'phosphorCode' },
          { name: 'ngx-mask', icon: 'phosphorShieldCheck' },
          { name: 'SweetAlert2', icon: 'phosphorCode' },
          { name: 'ng-http-loader', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Messaging',
        why: 'Firebase Cloud Messaging asks for permission once and gets a token for the browser; a service worker shows pushes in the background.',
        items: [
          { name: 'Firebase Cloud Messaging', logo: 'firebase' },
          { name: 'AngularFire', logo: 'firebase' },
          { name: 'Service worker', icon: 'phosphorBell' },
        ],
      },
    ],
  },
  decisions: {
    title: 'Decisions and what I’d change',
    sub: 'A small portal, built and fixed in a few weeks, for people who use it with a phone at their ear.',
    items: [
      {
        t: 'The phone number comes first',
        s: 'An agent hears the number before anything else. After five digits the form searches past orders and fills in the name, address and restaurant, so a regular caller is ready before they finish saying hello.',
      },
      {
        t: 'One screen, a set of calls per role',
        s: 'The call center and the restaurants read and update orders through different endpoints. A small map keyed by role picks the right one, so the order list, the details and the status change are one component each, not two.',
      },
      {
        t: 'Prices live on the size',
        s: 'A pizza at 26 cm and at 32 cm are one product with two prices. Picking a product loads its sizes, and picking a size sets the line price, so an agent never types a price for something on the menu.',
      },
      {
        t: 'Push to the kitchen',
        s: 'A restaurant does not watch a list all evening. The portal asks each browser for push permission and a Firebase token, a service worker shows pushes while the tab is in the background, and a bell in the header keeps the unread ones.',
      },
      {
        t: 'A text PDF, not a photo of one',
        s: 'The receipt was HTML drawn to a canvas and saved as an image inside a PDF: heavy, soft when zoomed, unsearchable. Today I’d write the PDF as text, as the demo above does, or ship a print stylesheet.',
      },
      {
        t: 'Guard the routes, not just the menu',
        s: 'A directive hides menu items by role and the API checks the token, but the routes only check that someone is signed in. Today I’d add a guard per role and debounce the phone lookup so it searches once per pause, not on every key.',
      },
    ],
  },
  next: {
    title: 'Orders coming in from more than one place?',
    sub: 'Role-based portals, order flows and the small tools staff use all day.',
    hire: 'Hire me',
    other: 'Next: Quorum',
  },
} as const;
