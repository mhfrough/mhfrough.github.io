// Bloomstone case study copy. English only, plain const.
// Facts come from the owner's codebase (read, never screenshotted) and the public bloomstone.pk site.
// The owner asked for this case study by name (2026-10-11). The agency behind the project is never named.
// Security: describe the system at the level a visitor needs. No endpoint names, event names, keys, storage
// buckets or hostnames other than the public site.

export const LIVE_URL = 'https://www.bloomstone.pk/';

export const COPY = {
  seo: {
    title: 'Bloomstone case study',
    description:
      'Bloomstone, a private resort in Gharo, Sindh: an Angular booking site with a live slot calendar, a NestJS and PostgreSQL API that never double books, and the back office the staff run it from.',
    imageAlt: 'Bloomstone case study cover: the Bloomstone mark above "A private resort, booked by the slot."',
  },
  hero: {
    tag: 'Case study',
    pill: '2026, full stack, solo build',
    line1: 'Bloomstone.',
    line2: 'A private resort, booked by the slot.',
    lede: 'A Zen and tropical resort near Karāchi that guests book whole, by the day, the night or the full 20 hours. I built the booking site, the live calendar, the API and the back office behind it.',
    live: 'Visit bloomstone.pk',
    back: 'View work',
  },
  meta: [
    { k: 'Role', v: 'Full-stack developer, solo' },
    { k: 'Timeline', v: 'May to July 2026' },
    { k: 'Platforms', v: 'Public site, admin, API' },
    { k: 'Stack', v: 'Angular, NestJS, PostgreSQL, Socket.io' },
  ],
  numbers: [
    { value: '3', label: 'ways to book a day: the Day slot, the Night slot, or all 20 hours' },
    { value: '20', label: 'guests per booking, with the whole resort to themselves' },
    { value: '9', label: 'admin screens, from the slot calendar to the payment ledger' },
    { value: '13', label: 'NestJS modules behind roughly 75 API routes' },
  ],
  site: {
    title: 'The front door: bloomstone.pk',
    sub: 'Packages with weekday and weekend prices, a quick book card, the availability calendar, a gallery and booking tracking. Angular with Bootstrap, in the resort’s olive and cream.',
    heroAlt: 'bloomstone.pk home page: "Bloomstone Private Resort" over a night view of the resort, with a Quick Book card.',
    mobileAlt: 'bloomstone.pk on a phone: the same hero, stacked, with the Quick Book card below.',
    packagesAlt: 'bloomstone.pk packages: the 10-hour and 20-hour slots with weekday and weekend prices and what each includes.',
    calendarAlt: 'bloomstone.pk availability calendar: a month of days marked available, limited or fully booked, and the Day, Night and Full Day slots for the picked date.',
    packagesCap: 'Two packages, two prices each',
    calendarCap: 'The public availability calendar',
    note: 'Screenshots of the live public site. The admin is shown below as my own mockups.',
  },
  place: {
    title: 'A place worth booking',
    sub: 'Photos from the resort, as the gallery on bloomstone.pk shows them. The site’s job is to get out of their way.',
    photos: [
      { file: 'zen-path', alt: 'A stone path winding through the Japanese garden to a gazebo by the lake.', cap: 'Zen garden' },
      { file: 'lake', alt: 'The artificial lake with stones and planting in front of the main house.', cap: 'The lake' },
      { file: 'gazebo-night', alt: 'A bamboo gazebo lit at night above wooden stepping stones.', cap: 'Bamboo gazebo' },
      { file: 'pool-night', alt: 'The swimming pool at night beside the lit lounge.', cap: 'Pool at night' },
      { file: 'rock-garden', alt: 'The rock and desert botanical garden with boulders and a wooden pergola.', cap: 'Rock garden' },
      { file: 'bedroom', alt: 'One of the four bedrooms, with twin wooden beds.', cap: 'Four bedrooms' },
      { file: 'games', alt: 'The indoor games hall with snooker, air hockey and table tennis.', cap: 'Indoor games' },
      { file: 'terrace', alt: 'A covered terrace with sofas looking out over the grounds.', cap: 'Terrace' },
    ],
  },
  arch: {
    title: 'One API, guests and staff on both ends',
    sub: 'Guests see the calendar and send requests. Staff approve, check guests in and take payments. Both screens listen to the same API and update the moment a slot changes.',
    left: 'Guests',
    core: 'Bloomstone API',
    coreSub: 'NestJS, PostgreSQL',
    right: 'Staff',
    guests: [
      { icon: 'phosphorCalendarDots', t: 'Availability calendar', s: 'Updates live as slots change' },
      { icon: 'phosphorPaperPlaneTilt', t: 'Booking request', s: 'No payment up front' },
      { icon: 'phosphorMagnifyingGlass', t: 'Track a booking', s: 'By ID, email or phone' },
      { icon: 'phosphorStar', t: 'Reviews and inquiries', s: 'Moderated before they show' },
    ],
    staff: [
      { icon: 'phosphorSquaresFour', t: 'Admin', s: 'Bookings, slots, payments, reviews' },
      { icon: 'phosphorBellRinging', t: 'Live alerts', s: 'Toast, chime and unread counts' },
      { icon: 'phosphorImages', t: 'Gallery storage', s: 'Resized to WebP on upload' },
    ],
  },
  slots: {
    title: 'Requests, not reservations',
    sub: 'The resort is one property. A request never blocks anyone: it marks the slot as limited. The slot closes only when staff confirm, and confirming cancels every request that clashes with it.',
    rules: [
      { t: 'Full day', s: 'All 20 hours need an empty day. Any confirmed booking blocks it.' },
      { t: 'Day or Night', s: 'A 10-hour slot is blocked by a confirmed full day or the same slot.' },
      { t: 'Pending', s: 'Requests stack up and show as limited. Nobody is turned away early.' },
      { t: 'Confirm', s: 'One approval cancels the clashing requests and refreshes every open calendar.' },
    ],
  },
  flow: {
    title: 'From request to checkout',
    sub: 'Every booking gets a reference the guest can track. Staff move it along one status at a time, and the guest’s tracking page follows.',
    steps: ['Requested', 'Confirmed', 'Checked in', 'Checked out'],
    formTitle: 'What the booking form asks',
    form: [
      'Name',
      'Phone',
      'Email, optional',
      'Date',
      'Package',
      'Day or Night slot',
      'Adults',
      'Children',
      'Two vehicles',
      'Notes',
      'Terms',
    ],
    checkTitle: 'What the API keeps for check-in',
    check: [
      'CNIC or passport',
      'Address',
      'Check-in time',
      'Check-out time',
      'Three vehicles',
      'Deposit paid',
      'Deposit returned',
      'Inventory handed over',
      'Inspection of 20 areas',
    ],
    tracker: 'BLM-2026-0142',
  },
  back: {
    title: 'The desk behind the gate',
    sub: 'A small team runs the resort from the admin. Staff handle bookings and payments; admins also manage the gallery, packages and users.',
    cards: [
      {
        icon: 'phosphorCalendarCheck',
        t: 'Slot calendar',
        s: 'A month at a glance, with Day, Night and Full Day status worked out in one query per month.',
      },
      {
        icon: 'phosphorClipboardText',
        t: 'Bookings',
        s: 'Approve, check in, check out, or cancel with a reason. Staff can add bookings by hand too.',
      },
      {
        icon: 'phosphorReceipt',
        t: 'Payment ledger',
        s: 'Booking fees, deposits, refunds and deposit returns, in cash, bank transfer, cheque or online, with proof images.',
      },
      {
        icon: 'phosphorFilePdf',
        t: 'Invoices',
        s: 'An A4 invoice for every payment, drawn in the browser with jsPDF: preview it, then download.',
      },
      {
        icon: 'phosphorChartBar',
        t: 'Dashboard',
        s: 'Pending and confirmed bookings, guests checked in today, revenue, and deposits paid, returned and held.',
      },
      {
        icon: 'phosphorUsersThree',
        t: 'Roles',
        s: 'Staff, admin and super admin. Only a super admin can see or create another super admin.',
      },
    ],
    ledger: 'Payments',
  },
  stack: {
    title: 'The stack',
    sub: 'TypeScript from end to end: Angular in front, NestJS behind it, PostgreSQL underneath, one Socket.io line between them.',
    groups: [
      {
        t: 'Site and admin',
        why: 'One Angular app for guests and staff, every page lazy-loaded, the admin behind route guards.',
        items: [
          { name: 'Angular 21', logo: 'angular' },
          { name: 'TypeScript', logo: 'typescript' },
          { name: 'RxJS', logo: 'reactivex' },
          { name: 'Bootstrap 5', logo: 'bootstrap' },
          { name: 'Socket.io client', logo: 'socketdotio' },
          { name: 'jsPDF + AutoTable', icon: 'phosphorFilePdf' },
          { name: 'Web Share API', icon: 'phosphorShareNetwork' },
        ],
      },
      {
        t: 'API',
        why: 'A NestJS API with validation on every route, documented in Swagger, live over two Socket.io namespaces.',
        items: [
          { name: 'NestJS 10', logo: 'nestjs' },
          { name: 'Node.js', logo: 'nodedotjs' },
          { name: 'TypeORM', logo: 'typeorm' },
          { name: 'PostgreSQL', logo: 'postgresql' },
          { name: 'Socket.io', logo: 'socketdotio' },
          { name: 'Passport', logo: 'passport' },
          { name: 'JWT', logo: 'jsonwebtokens' },
          { name: 'bcrypt', icon: 'phosphorLock' },
          { name: 'class-validator', icon: 'phosphorShieldCheck' },
          { name: 'Swagger', logo: 'swagger' },
        ],
      },
      {
        t: 'Images and delivery',
        why: 'Photos resized once on upload and served from storage; the site sits behind Cloudflare.',
        items: [
          { name: 'sharp', logo: 'sharp' },
          { name: 'Supabase Storage', logo: 'supabase' },
          { name: 'Cloudflare', logo: 'cloudflare' },
          { name: 'Google Maps embed', logo: 'googlemaps' },
          { name: 'WhatsApp click to chat', logo: 'whatsapp' },
        ],
      },
    ],
  },
  decisions: {
    title: 'Decisions and what I’d change',
    sub: 'A small business with one property needs fewer features and stricter rules.',
    items: [
      {
        t: 'Requests first',
        s: 'Guests ask, staff confirm. The resort talks to every group before a booking stands, so the system collects interest instead of turning people away, and still can’t double book.',
      },
      {
        t: 'A ledger, not a gateway',
        s: 'The resort is paid in cash and by bank transfer. Payments are signed entries, so a refund or a returned deposit is just a negative row, and the balance is one sum.',
      },
      {
        t: 'Live on both sides',
        s: 'Staff get a toast, a two-note chime and an unread count in the tab title. Guests watching the calendar see a slot close the moment it is confirmed. Staff connections are checked on the handshake.',
      },
      {
        t: 'Images that cost less',
        s: 'Uploads are resized to 1600px WebP on the server and cached for a year. The home page’s random gallery is cached for six hours, which keeps storage traffic down.',
      },
      {
        t: 'One price function',
        s: 'Weekday and weekend prices are worked out in the admin and again in the API. They should live in one place the site, admin and invoices all ask, so a rule change lands once.',
      },
      {
        t: 'Check-in at the gate',
        s: 'The API already models the paper check-in form: ID, vehicles, a towel and remote count, and a 20-area inspection. The next step is a tablet screen for it, so the deposit decision is on record.',
      },
    ],
  },
  next: {
    title: 'Need a booking system like this?',
    sub: 'Booking sites, live calendars and the admin a small team actually uses, from the database up.',
    hire: 'Hire me',
    other: 'Next: Befiler',
  },
} as const;
