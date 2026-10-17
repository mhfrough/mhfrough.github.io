// Trades case-study copy. English only, plain const.
// Facts come from the two archived repos (read, never modified) and the live AK Heating site. The owner asked for
// this case study (2026-10-11) under the work-index title "Service-booking platforms". Neither site books a slot:
// both turn a visit into a call-out request, so the page says exactly that. The businesses are named as on their
// public sites. Never shown: reviewers' names or emails, the owner of AK's personal phone and email, or the mail
// relay's address.

export const LIVE_URL = 'https://akheatplumb247.web.app/';

export const COPY = {
  seo: {
    title: 'Trades sites case study',
    description:
      'Two Nottingham trades businesses on one Angular template: SOS24, a 24/7 multi-trade call-out service with server-side rendering, and AK Heating and Plumbing, forked from it with fixed call-out prices, WhatsApp-first contact and live reviews.',
    imageAlt: 'Trades case study cover: "Two call-out services, one template." beside the AK Heating and Plumbing home page.',
  },
  hero: {
    tag: 'Case study',
    pill: '2023 to 2024, Nottingham, UK',
    line1: 'Two call-out services.',
    line2: 'One Angular template.',
    lede: 'SOS24 sends a plumber, electrician or locksmith at any hour. AK Heating and Plumbing fixes boilers and gas. Both sites have one job: turn a worried search into a call-out request in under a minute.',
    live: 'Visit the AK Heating site',
    back: 'View work',
  },
  meta: [
    { k: 'Role', v: 'Freelance, Angular frontend' },
    { k: 'Timeline', v: 'Dec 2023 to Aug 2024' },
    { k: 'Clients', v: '2 trades businesses, UK' },
    { k: 'Stack', v: 'Angular, SSR, Firebase Hosting' },
  ],
  numbers: [
    { value: '2', label: 'businesses on one template, one forked from the other' },
    { value: '10', label: 'trades behind SOS24’s single service page' },
    { value: '4', label: 'fixed call-out prices on AK, from £49 to £179' },
    { value: '9 days', label: 'from the fork to AK’s finished site' },
  ],
  site: {
    title: 'Two front doors',
    sub: 'SOS24 leads with its ten trades and a form. AK leads with one promise and a WhatsApp button. Same template underneath.',
    sosUrl: 'SOS24, original build',
    akUrl: 'akheatplumb247.web.app',
    note: 'SOS24 is its original source built and served locally; its old domain now runs a different site. AK is the live site. Reviews and contact details are left out of every shot.',
  },
  pair: {
    title: 'One template, two businesses',
    sub: 'AK started as a copy of SOS24. What changed says more about the two businesses than about the code.',
    left: 'SOS24',
    right: 'AK Heating and Plumbing',
    rows: [
      { k: 'What it sells', a: 'Ten trades, any hour, one number', b: 'Heating, plumbing and gas, one engineer' },
      { k: 'Rendering', a: 'Server-side rendered with Express, home page prerendered', b: 'A static single-page app on Firebase Hosting' },
      { k: 'First call to action', a: 'An enquiry form that arrives as an email', b: 'WhatsApp click to chat, the form on the contact page' },
      { k: 'Prices', a: 'Quoted after the enquiry', b: 'Four fixed call-out prices, in the footer and on About' },
      { k: 'Social proof', a: 'Testimonials written into the page', b: 'Live reviews, posted from the site and read back by the slider' },
    ],
    shared: 'Shared: a lazy-loaded module per page, Bootstrap with a slide-in menu, one header, footer and enquiry-form module, a map embed and a privacy page.',
  },
  trades: {
    title: 'Ten trades, one page',
    sub: 'SOS24 has one service page. The trade in the address picks its introduction, its reasons and its list of jobs from a single content map, so adding a trade is data, not a new page.',
    list: [
      { id: 'plumbing', name: 'Plumber', jobs: ['Burst pipe repair', 'Water heater malfunctions', 'Sewer line backups', 'Clogged drains and toilets', 'Gas line issues', 'Leaky taps and pipes'] },
      { id: 'gas', name: 'Gas engineer', jobs: ['Installation and commissioning', 'Appliance upgrades and repairs', 'Inspections and safety audits', 'Gas leak detection and repairs', 'Emergency gas engineering'] },
      { id: 'electrician', name: 'Electrician', jobs: ['Lighting repairs and upgrades', 'Wiring and rewiring', 'Panel inspections and repairs', 'Outlet and switch repairs', 'Commercial system design'] },
      { id: 'solar', name: 'Solar power', jobs: ['Solar panel repairs', 'Off-grid and grid-tied systems', 'Inverter repairs and replacements', 'Routine inspections', 'Battery backup'] },
      { id: 'heat-pump', name: 'Heat pump', jobs: ['Home and commercial repairs', 'Diagnosis of faults', 'Inspections and tune-ups', 'Energy-efficient upgrades', 'Emergency call-outs'] },
      { id: 'alarms', name: 'Alarms', jobs: ['Home and commercial repairs', 'Fault diagnosis', 'Inspections and updates', 'Smart security integration', 'Emergency call-outs'] },
      { id: 'aerial', name: 'TV aerial', jobs: ['TV and home theatre setup', 'Aerial repairs', 'Satellite dish alignment', 'TV wall mounting', 'Signal boosters'] },
      { id: 'locksmith', name: 'Locksmith', jobs: ['Emergency lockouts', 'Lock repairs and replacements', 'Key cutting', 'Master key systems', 'High-security upgrades'] },
      { id: 'cooling', name: 'Fridge and AC', jobs: ['Fridge repairs', 'AC repairs and replacements', 'Refrigerant recharging', 'Thermostat calibration', 'Efficient cooling'] },
      { id: 'ev', name: 'EV charger', jobs: ['Home and commercial repairs', 'Upgrades and compatibility checks', 'Maintenance and inspections', 'Troubleshooting', 'Smart charging'] },
    ],
  },
  flow: {
    title: 'No server to look after',
    sub: 'Small businesses don’t want a backend to maintain. The form writes a plain email and hands it to a serverless mail relay; AK’s button opens WhatsApp with nothing in between.',
    steps: ['Form or WhatsApp', 'Plain-text message', 'Mail relay or chat', 'The owner’s phone'],
    cards: [
      {
        icon: 'phosphorEnvelopeSimple',
        t: 'Enquiry by email',
        s: 'Name and email are required; address, phone, postcode, trade and a message are optional. The message lands as one readable email, not a database row.',
      },
      {
        icon: 'phosphorWhatsappLogo',
        t: 'WhatsApp first',
        s: 'For a one-engineer business the fastest reply is a chat. AK’s main button opens WhatsApp, loaded lazily so it costs nothing until it is needed.',
      },
      {
        icon: 'phosphorStar',
        t: 'Reviews',
        s: 'One to five stars, a message of up to 475 characters, a name and an optional email. The home page slider reads them back live.',
      },
      {
        icon: 'phosphorClock',
        t: 'Prices before the call',
        s: 'Emergency call-outs at £79 from 9 to 5, £119 from 5 to 10 and £179 from 10 at night to 6 in the morning; £49 when it can wait.',
      },
    ],
  },
  stack: {
    title: 'The stack',
    sub: 'Plain Angular and Bootstrap, rendered on the server where search mattered and served as static files where it didn’t.',
    groups: [
      {
        t: 'Sites',
        why: 'A lazy-loaded module per page and a shared module for the header, footer and enquiry form.',
        items: [
          { name: 'Angular 16 and 17', logo: 'angular' },
          { name: 'TypeScript', logo: 'typescript' },
          { name: 'Bootstrap 5', logo: 'bootstrap' },
          { name: 'ng-bootstrap', icon: 'phosphorCode' },
          { name: 'SweetAlert2', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Rendering and hosting',
        why: 'Server-side rendering with Express for SOS24, static files on Firebase Hosting for AK.',
        items: [
          { name: 'Angular SSR', logo: 'angular' },
          { name: 'Express', icon: 'phosphorCode' },
          { name: 'Firebase Hosting', logo: 'firebase' },
          { name: 'Prerender', icon: 'phosphorPlugs' },
        ],
      },
      {
        t: 'Contact',
        why: 'No database: email through a serverless relay, chat through WhatsApp, maps through an embed.',
        items: [
          { name: 'Serverless mail relay', icon: 'phosphorBroadcast' },
          { name: 'WhatsApp click to chat', logo: 'whatsapp' },
          { name: 'Google Maps embed', logo: 'googlemaps' },
        ],
      },
    ],
  },
  decisions: {
    title: 'Decisions and what I’d change',
    sub: 'Two small budgets, and owners who answer the phone themselves.',
    items: [
      {
        t: 'Fork, don’t start again',
        s: 'AK began as a copy of SOS24 and was finished in nine days. The same header, footer, form and page modules carried over; the work went into what was different about the business.',
      },
      {
        t: 'Render where search matters',
        s: 'SOS24’s ten trade pages are what people search for at 2 a.m., so they render on the server. AK’s main route in is a WhatsApp chat, so static files on Firebase were enough.',
      },
      {
        t: 'Email, not a database',
        s: 'An enquiry is a message for a person, so it arrives as a readable email through a serverless relay. Nothing to patch, back up or pay for while it sits idle.',
      },
      {
        t: 'Config, not copies',
        s: 'The fork carried SOS24’s trade list into AK’s form, locksmiths and all. Today the template would take a small config per business: trades, prices, contact routes.',
      },
      {
        t: 'Reviews need a moderator',
        s: 'Each review already carries a pending, approved or rejected status. What is missing is the screen where the owner decides, so nothing reaches the slider unread.',
      },
      {
        t: 'Local SEO, properly',
        s: 'Both sites set a title and AK adds Open Graph. A LocalBusiness block, a sitemap, the brand font actually loaded and real alt text would do more for a trades business than any redesign.',
      },
    ],
  },
  next: {
    title: 'A small business that needs to be found?',
    sub: 'Fast sites that turn a search into a call, without a server to look after.',
    hire: 'Hire me',
    other: 'Next: KPMC',
  },
} as const;
