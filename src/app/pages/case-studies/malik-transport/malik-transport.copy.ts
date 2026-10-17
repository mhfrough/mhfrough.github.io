// Malik Transport Solutions case-study copy. English only, plain const.
// Facts come from the owner's CV (docs/content.md, "Courier and logistics platform", freelance) and the
// malik-transport-solutions repo (read, never modified): 75 commits, all by the owner, 15 May to 31 Aug 2023,
// Angular 16 with Universal, a service worker, ngx-translate, ng-bootstrap and ng-select. The client, Malik
// Transport Solutions GmbH of Rüdesheim am Rhein, names itself on its own public site. Nobody else is named: no
// agency, no employer, no staff, no customers. The fare was worked out by the company API from each vehicle's
// plan; the page says so, and the demos use the tariff shape from the transporter info page with sample routes.
// The screenshots are the original production build rendered against a sample API.

export const COPY = {
  seo: {
    title: 'Malik Transport Solutions case study',
    description:
      'Malik Transport Solutions, a courier and transport company in Rüdesheim am Rhein: the Angular site with a public fare calculator, and one portal where customers book, the office accepts and assigns drivers, and drivers run jobs, log shifts and get payslips. Built May to Aug 2023.',
    imageAlt: 'Malik Transport Solutions case study cover: the truck mark above "A price before the call, a driver after it."',
  },
  hero: {
    tag: 'Case study',
    pill: 'May to Aug 2023, freelance, Angular frontend',
    line1: 'Malik Transport Solutions.',
    line2: 'A price before the call, a driver after it.',
    lede: 'A courier and transport company in Rüdesheim am Rhein, Germany. I built its web platform in Angular: a public site where anyone prices a job by vehicle and address, and one portal where customers book, the office accepts and assigns a driver, and drivers run the job, log their shifts and get their payslips.',
    back: 'View work',
  },
  meta: [
    { k: 'Role', v: 'Freelance, Angular frontend, all 75 commits' },
    { k: 'Timeline', v: 'May to Aug 2023, version 0.1.3' },
    { k: 'Platforms', v: 'Public site, one portal for three roles' },
    { k: 'Stack', v: 'Angular 16, Universal, Bootstrap, PWA' },
  ],
  numbers: [
    { value: '75', label: 'commits, all mine, from an empty repo to version 0.1.3' },
    { value: '3', label: 'roles in one portal: customer, office and driver' },
    { value: '6', label: 'order lists, from New and Pending to Closed and Rejected' },
    { value: '13', label: 'portal modules loaded on demand, from fleet to payslips' },
  ],
  site: {
    title: 'The public site',
    sub: 'Home, company, price calculator and tariffs, plus six policy pages, in the company’s blue. The calculator searches real addresses as you type and returns distance, time and fare for the chosen vehicle.',
    url: 'Malik Transport Solutions, original build',
    heroAlt:
      'Malik Transport Solutions home page: a navy header with the MTS truck logo, links for About Us, Price Calculator, Transporter Info, Customer Login and Staff Login, two language flags, and a two-line headline over a photo of a truck at dusk.',
    mobileAlt:
      'The price calculator on a phone: vehicle Transporter, from Rüdesheim station to Wiesbaden main station, with 33 km, 41 minutes and a fare of 64.67 euro filled in.',
    calc: {
      src: '/images/malik-transport/site-calculator.webp',
      w: 1600,
      h: 707,
      alt: 'MTS Order Price Calculator: a vehicle picker, from and to address boxes, then total distance 33 km, total time 41 mins, total fare 64.67 and a waiting charge of 10 per half hour, with Calculate fare and Enquire now buttons.',
      cap: 'Price calculator, with a fare worked out',
    },
    details: [
      {
        src: '/images/malik-transport/site-tariffs.webp',
        w: 1400,
        h: 1120,
        alt: 'Transporter info: tariffs for small, medium and heavy boxes beside photos of parcels and a forklift, each with a price per half hour and its ceiling, a price per load kilometre and a waiting charge.',
        cap: 'Transporter info, tariffs per vehicle',
      },
      {
        src: '/images/malik-transport/site-company.webp',
        w: 1600,
        h: 1213,
        alt: 'Home page sections: an illustrated truck beside "Fast Growing Transport Company" and its services, then a dark band "Where Quality and Reliability Meet" with four round counters.',
        cap: 'Company and services',
      },
    ],
    note: 'The original production build rendered against a sample API. Addresses, fares and tariffs are samples; the home slider and the contact block are left out.',
  },
  arch: {
    title: 'One API, three doors',
    sub: 'Visitors price a job without an account. Everyone else signs in to the same portal, and their role decides what it shows: one customer’s orders, the whole office, or one driver’s day.',
    left: 'Public, no account',
    core: 'Company API',
    coreSub: 'Fares, orders, staff',
    right: 'Signed in, by role',
    open: [
      { icon: 'phosphorCalculator', t: 'Price calculator', s: 'Vehicle, two addresses, a fare' },
      { icon: 'phosphorTruck', t: 'Transporter info', s: 'Tariffs per vehicle class' },
      { icon: 'phosphorClipboardText', t: 'Enquiry form', s: 'For jobs that need a quote' },
    ],
    portal: [
      { icon: 'phosphorUserCircle', t: 'Customer', s: 'Sign up with a code, book, follow' },
      { icon: 'phosphorBuildingOffice', t: 'Office', s: 'Orders, fleet, staff, holidays' },
      { icon: 'phosphorSteeringWheel', t: 'Driver', s: 'Jobs, shifts, leave, payslips' },
    ],
  },
  flow: {
    title: 'The life of an order',
    sub: 'Six steps and three people. The fare is fixed when the customer books, the office decides and dispatches, and the driver confirms before the job starts.',
    steps: ['Priced and booked', 'New, with the office', 'Accepted or rejected', 'Assigned to a driver', 'Accepted, running', 'Delivered, closed'],
    holds: [
      { t: 'Where', s: 'Pickup and drop addresses from the search, with the coordinates the API returned for each.' },
      { t: 'What', s: 'Vehicle class, pickup date, the delivery start time and the customer’s remarks.' },
      { t: 'Price', s: 'Distance, time, fare and waiting charge, from the same calculation as the public calculator.' },
      { t: 'Paper', s: 'A delivery note with the order number, a QR code, both addresses and the fare, printed by the browser.' },
    ],
  },
  dispatch: {
    title: 'The order desk',
    sub: 'Switch roles to watch one portal do three jobs. Book as the customer, accept and assign as the office, then accept as the driver and open the delivery note.',
  },
  staff: {
    title: 'The staff side',
    sub: 'The portal also ran the people: shifts logged on the road or with the depot QR code, leave against a yearly allowance, and monthly payslips shared as PDFs.',
  },
  stack: {
    title: 'The stack',
    sub: 'Angular 16 on Bootstrap, set up for server rendering and installable as an app. Maps work happens on the server.',
    groups: [
      {
        t: 'Web',
        why: 'Feature modules loaded on demand, an interceptor that adds the API base and the token, and one base class behind every list.',
        items: [
          { name: 'Angular 16', logo: 'angular' },
          { name: 'TypeScript', logo: 'typescript' },
          { name: 'RxJS', logo: 'reactivex' },
          { name: 'Bootstrap 5', logo: 'bootstrap' },
          { name: 'ng-bootstrap', icon: 'phosphorCode' },
          { name: 'ng-select', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Rendering and app shell',
        why: 'Angular Universal with an Express server, a service worker so the site installs and caches like an app, and a language switch.',
        items: [
          { name: 'Angular Universal', logo: 'angular' },
          { name: 'Express', icon: 'phosphorCode' },
          { name: 'Service worker', icon: 'phosphorCloudArrowUp' },
          { name: 'ngx-translate', icon: 'phosphorTranslate' },
        ],
      },
      {
        t: 'Maps and output',
        why: 'Address search and geocoding through the company API, alerts with SweetAlert2, delivery notes printed from HTML.',
        items: [
          { name: 'Google Places, via the API', logo: 'googlemaps' },
          { name: 'Geocoding, via the API', logo: 'googlemaps' },
          { name: 'SweetAlert2', icon: 'phosphorBell' },
          { name: 'Print to PDF', icon: 'phosphorFilePdf' },
        ],
      },
    ],
  },
  decisions: {
    title: 'Decisions and what I’d change',
    sub: 'A small company, one developer, and a portal that had to serve customers, the office and drivers from the first release.',
    items: [
      {
        t: 'Addresses through the API',
        s: 'The page never loads Google Maps. The address box waits for four characters and a 300 ms pause, asks the company API for suggestions, and a second call turns the chosen one into coordinates. A list of places did not need a map script.',
      },
      {
        t: 'One portal, three roles',
        s: 'Customers, office and drivers share one lazy-loaded portal. After sign-in the role picks the address, /portal for customers and /admin for staff, and the menu and every list show only that role’s items and actions.',
      },
      {
        t: 'The fare lives in one place',
        s: 'Each vehicle has a plan: a price per half hour with a ceiling, a price per load kilometre and a waiting charge. The office edits it in the portal; the calculator and new orders read the same numbers from the API, and the order keeps the fare it was booked at.',
      },
      {
        t: 'Print, not a PDF library',
        s: 'The first delivery note drew HTML to a canvas and saved it with jsPDF. I switched to a plain HTML page the browser prints: sharp text, the server’s QR code as it is, and a PDF whenever the office picks Save as PDF.',
      },
      {
        t: 'Guards, not only a hidden menu',
        s: 'Roles hide menu items and lists, and the API checks the token. Today I’d add a route guard per role as well, so a typed address never opens a screen that role should not see.',
      },
      {
        t: 'One list, not six',
        s: 'Each order list is its own component with the same table and paging, and each one fetched every customer to show their names. Today it would be one list with a status input, and names joined on the server.',
      },
    ],
  },
  next: {
    title: 'Need a booking and dispatch portal?',
    sub: 'Public price calculators, role-based portals for customers, office and drivers, and the staff tools around them.',
    hire: 'Hire me',
    other: 'Next: Call Center',
  },
} as const;
