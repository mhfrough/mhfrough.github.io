// Gift Wrap case-study copy. English only, plain const.
// Facts come from the archived project (D:\workspace-personal\archive\gift-wrap, read only): its README,
// package.json, routes, data and cart services, manifest, netlify.toml and file dates (14 to 25 June 2026). The
// owner asked for this case study (2026-10-11) and describes it as a thesis project. The idea and brand belong to
// the student whose thesis it was; that person is a private individual and is never named here. The university is
// not recorded in the project, so it is not stated. The backend and admin portal were planned, never built: the page
// says so. Prices and products are the build's own sample catalogue.

export const COPY = {
  seo: {
    title: 'Gift Wrap case study',
    description:
      'Gift Wrap, a thesis project: an Angular 17 storefront where buyers build their own gift basket, choosing a base, wrap, ribbon, treats and a note, with the price updating live. Mobile first, installable, deployed on Netlify.',
    imageAlt: 'Gift Wrap case study cover: the Gift Wrap logo above "Choose. Customize. Deliver happiness." beside the storefront home page.',
  },
  hero: {
    tag: 'Thesis project',
    pill: 'Angular storefront',
    line1: 'Gift Wrap.',
    line2: 'Build the basket, not just buy one.',
    lede: 'A thesis project: an online gift shop where the buyer composes the hamper. Pick a base, a wrap and a ribbon, fill it with treats, add a note, and watch the price move with every choice. I built the customer storefront, mobile first, on sample data so the idea could be shown before a backend existed.',
    back: 'View work',
  },
  meta: [
    { k: 'Role', v: 'Frontend, design and build' },
    { k: 'Scope', v: 'Customer storefront, 7 routes' },
    { k: 'Stack', v: 'Angular 17, Bootstrap 5, PWA, Netlify' },
  ],
  numbers: [
    { value: '5', label: 'steps in the build studio, from base to note' },
    { value: '60', label: 'looks from 3 bases, 4 wraps and 5 ribbons, before a single treat' },
    { value: '24', label: 'sample products in 6 categories, all searchable' },
    { value: '7', label: 'routes, each lazy loaded, behind one app shell' },
  ],
  demo: {
    label: 'Build your basket',
    sample: 'Sample prices from the build',
    base: 'Basket',
    wrap: 'Wrap',
    ribbon: 'Ribbon',
    treats: 'Treats',
    total: 'Total',
    add: 'Add basket to cart',
    needOne: 'Add at least one treat to continue.',
    added: 'Added to cart',
    freeAt: 75,
    shipping: 6.95,
  },
  screens: {
    title: 'The storefront',
    sub: 'Built to feel like a phone app: a floating tab bar with a centred Build button, a sliding search and sticky totals. On a laptop the header turns into a floating glass bar.',
    url: 'Gift Wrap, original build',
    homeAlt: 'Gift Wrap home page: the logo, Home, Shop and Categories links, a search field and a Build a basket button above the headline "Gifts that feel hand-wrapped with love." beside photos of wrapped gifts, roses and chocolates.',
    mobileAlt: 'The build studio on a phone: treat cards with quantity steppers, a sticky bar with the $133.00 total and "Add basket, 3 items", and the floating tab bar with a raised Build button.',
    details: [
      {
        src: '/images/gift-wrap/site-shop.webp',
        alt: 'All gifts: 24 gifts, category filter chips, a sort menu and product cards with badges, ratings, prices and Add buttons.',
        cap: 'Shop, filter and sort',
      },
      {
        src: '/images/gift-wrap/site-product.webp',
        alt: 'Belgian Truffle Box product page: a large photo with thumbnails, the price with a $8.00 saving, highlights, a quantity stepper, Add to cart, Buy it now and a link to add it to a custom basket.',
        cap: 'Product details',
      },
      {
        src: '/images/gift-wrap/site-cart.webp',
        alt: 'Cart: a free shipping bar, the custom Signature Gift Box with its wine ribbon, three treats and the gift note, a candle, and an order summary of $155.00.',
        cap: 'Cart with a custom basket',
      },
    ],
    note: 'The original build, rendered locally with its own sample catalogue. Product photos are stock images from Unsplash and Pexels.',
  },
  studio: {
    title: 'The build studio',
    sub: 'Five numbered steps on the left, a live summary on the right. The preview takes the wrap colour and the ribbon, and every line of the price is spelled out before the basket goes to the cart.',
    alt: 'The build studio on a laptop: steps to choose the basket, wrap, ribbon colour, treats and a personal note, beside a Your basket summary with a preview, three treats and a $133.00 total.',
    cartAlt: 'The cart on a phone: free shipping unlocked, the custom Signature Gift Box with Rose Satin wrap, Wine ribbon, three treats and the note "Happy birthday! A little box of good things, wrapped just for you."',
  },
  problem: {
    title: 'The problem and the approach',
    sub: 'Online gift shops sell hampers someone else filled. The thesis asked what happens when the buyer fills it.',
    items: [
      {
        icon: 'phosphorDeviceMobile',
        t: 'Mobile first',
        s: 'Gifts are bought on phones, often last minute. A bottom tab bar, a raised Build action and sticky totals keep the next step under the thumb.',
      },
      {
        icon: 'phosphorCalculator',
        t: 'Price as you go',
        s: 'Base, wrap and treats each add a line; the total is a computed signal, so it can never disagree with the summary beside it.',
      },
      {
        icon: 'phosphorPackage',
        t: 'A basket is one cart line',
        s: 'The finished basket is saved as a snapshot: base, wrap, ribbon, note and every treat. The cart shows exactly what was built.',
      },
      {
        icon: 'phosphorFlask',
        t: 'Front first',
        s: 'A thesis is judged on a demo. The catalogue lives in one service with the shape a real API would return, so the backend could slot in later.',
      },
    ],
  },
  flow: {
    title: 'Choose, customise, deliver',
    sub: 'The brand’s own three words, as a route through the app. Ready-made gifts take the short path; a custom basket takes the studio.',
    steps: ['Pick a base', 'Choose a wrap', 'Ribbon colour', 'Add treats', 'Write a note', 'Into the cart'],
    rules: [
      { t: 'Only giftable treats', s: 'The studio lists products flagged as basket eligible and in stock, filtered by category.' },
      { t: 'A short note', s: 'Up to 200 characters, counted as you type, printed on a gift card.' },
      { t: 'Free shipping bar', s: 'A flat $6.95 below $75, free above it, with a bar that shows how close the cart is.' },
      { t: 'A cart that stays', s: 'The cart is a signal service saved to localStorage, so a reload or a closed tab keeps it.' },
    ],
  },
  arch: {
    title: 'What was built, what was planned',
    sub: 'The storefront is complete on its own. The server side was designed for the next phase and never built, so the app runs on in-memory data.',
    left: 'Storefront, built',
    core: 'Signal services',
    coreSub: 'Catalogue, cart, toasts, SEO',
    right: 'Backend, planned',
    screens: [
      { icon: 'phosphorHouse', t: 'Home', s: 'Categories, steps, featured, occasions' },
      { icon: 'phosphorMagnifyingGlass', t: 'Shop', s: 'All, by category, search' },
      { icon: 'phosphorGift', t: 'Studio and product', s: 'Build a basket, product pages' },
      { icon: 'phosphorShoppingBag', t: 'Cart', s: 'Lines, shipping, summary' },
    ],
    planned: [
      { icon: 'phosphorPlugs', t: 'Next.js API', s: 'Catalogue, orders, customers' },
      { icon: 'phosphorDatabase', t: 'PostgreSQL', s: 'Products, baskets, orders' },
      { icon: 'phosphorGauge', t: 'Admin portal', s: 'Stock, prices, order status' },
    ],
  },
  stack: {
    title: 'The stack',
    sub: 'Angular 17 with standalone components and signals, Bootstrap 5 themed to the brand, and a service worker written by hand.',
    groups: [
      {
        t: 'App',
        why: 'Standalone components, lazy routes, signals for the cart and studio, route cross-fades.',
        items: [
          { name: 'Angular 17', logo: 'angular' },
          { name: 'TypeScript', logo: 'typescript' },
          { name: 'RxJS', logo: 'reactivex' },
          { name: 'Signals', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Look',
        why: 'Bootstrap variables mapped to the brand palette, self-hosted Cinzel and Montserrat.',
        items: [
          { name: 'Bootstrap 5.3', logo: 'bootstrap' },
          { name: 'Bootstrap Icons', logo: 'bootstrap' },
          { name: 'SCSS', logo: 'sass' },
        ],
      },
      {
        t: 'Ship',
        why: 'Installable, offline app shell, per-route meta and JSON-LD, Netlify with an SPA fallback.',
        items: [
          { name: 'PWA manifest', icon: 'phosphorBroadcast' },
          { name: 'Service worker', icon: 'phosphorBell' },
          { name: 'JSON-LD', icon: 'phosphorShareNetwork' },
          { name: 'Netlify', icon: 'phosphorGauge' },
        ],
      },
    ],
  },
  decisions: {
    title: 'What I’d do differently today',
    sub: 'A tidy demo for a thesis. Here is what a real shop would need first.',
    items: [
      {
        t: 'Agree the API before the polish',
        s: 'The sample data has the right shape, but nothing enforces it. Today I’d write the API contract first and mock it at the network layer, so the Next.js backend would only have to meet it.',
      },
      {
        t: 'One chip, one set of tokens',
        s: 'A page style outranks the shared chip style, so the selected filter turns white on white; you can see it in the shots. One chip component with its own states would have stopped that.',
      },
      {
        t: 'Prerender the shop',
        s: 'It is a client-only app: titles and product JSON-LD appear only after JavaScript runs. Prerendering the product and category pages would give search engines and slow phones real HTML.',
      },
      {
        t: 'Own the photos',
        s: 'Product photos come from stock CDNs without fixed sizes, so cards jump as they load. Sized WebP files served with the app would load faster and never shift.',
      },
      {
        t: 'Money in cents',
        s: 'Totals add decimal dollars. A shop should store integer cents and format at the edge, so a basket of ten items can never be a cent off.',
      },
      {
        t: 'Tests for the maths',
        s: 'The only spec is the default one. The studio total, the free shipping rule and the cart’s quantity rules are exactly the code a few unit tests should hold still.',
      },
    ],
  },
  next: {
    title: 'An idea that needs to be shown, not described?',
    sub: 'Working storefronts and demos people can click, built so the real backend can follow.',
    hire: 'Hire me',
    other: 'View work',
  },
} as const;
