// Little Surprises case-study copy. English only, plain const.
// Facts come from the Little Surprises repo (D:\workspace-personal\littlesurprises.shop: README, docs/hosting.md,
// docs/project-brief.md, apps/web routes and admin, apps/api modules) and the live site (https://littlesurprises.shop,
// 24 Nov 2026). The owner runs it with his wife (owner, 2026-11-24); she is a private person and is never named here.
// It grew out of the earlier Gift Wrap thesis build, which this page replaces (/work/gift-wrap was removed).
// Prices in the demo are the live shop's own (Rs, whole rupees).

export const COPY = {
  seo: {
    title: 'Little Surprises case study',
    description:
      'Little Surprises, my own gift shop: an Angular 21 storefront where buyers build their own gift basket, a NestJS and Postgres API, and an admin for orders, stock and vouchers. Live at littlesurprises.shop, delivering across Pakistan.',
    imageAlt: 'Little Surprises case study cover: the Little Surprises mark above "Wrapped by hand, for you." beside the storefront home page.',
  },
  hero: {
    tag: 'My startup',
    pill: 'Live at littlesurprises.shop',
    line1: 'Little Surprises.',
    line2: 'Gift baskets, wrapped by hand.',
    lede: 'A gift shop I run with my wife from Karāchi. Buyers pick a ready hamper or build their own: the basket, the wrap, the ribbon, every treat and a handwritten note. I built all of it: the storefront, the API, the admin and the marketing kit.',
    back: 'View work',
    live: 'Visit the shop',
    liveUrl: 'https://littlesurprises.shop',
  },
  meta: [
    { k: 'Role', v: 'Co-founder, design and full stack' },
    { k: 'Scope', v: 'Storefront, API, admin, marketing kit' },
    { k: 'Stack', v: 'Angular 21, NestJS, Postgres, Cloudflare' },
  ],
  numbers: [
    { value: '3', label: 'steps to a custom basket: basket, fill it, note' },
    { value: '66', label: 'gifts in the live shop, across 19 categories' },
    { value: '20', label: 'admin screens, from today’s orders to print slips' },
    { value: '4', label: 'ways to order: the website, WhatsApp, Instagram or a call' },
  ],
  demo: {
    label: 'Build a basket',
    sample: 'Live prices, Rs',
    stepsLabel: 'Builder steps',
    steps: ['Basket', 'Fill it', 'Note'],
    base: 'Basket',
    wrap: 'Wrap',
    ribbon: 'Ribbon',
    items: 'Items',
    total: 'Total',
    inside: 'Inside the basket',
    holds: 'holds 6',
    capacityLabel: 'items in the basket',
    forYou: 'For you',
    noteLabel: 'Your note, written on the tag',
    noteDefault: 'Dear Ammi, happy birthday! Wish I could be there to hug you.',
    notePlaceholder: 'Your note goes here',
    addOne: 'Add one',
    removeOne: 'Remove one',
    room: (n: number) => `Room for ${n} more ${n === 1 ? 'item' : 'items'}.`,
    full: 'The basket is full. Take one out to swap it.',
    back: 'Back',
    next: 'Next',
    add: 'Add to bag',
    needOne: 'Add at least one item.',
    added: 'Added to bag',
  },
  reel: {
    title: 'How to order, in 22 seconds',
    sub: 'The first ad for the shop. I scripted, designed and animated it in HTML and rendered it frame by frame; no voice, so every step reads with the sound off.',
    src: '/videos/little-surprises-how-to-order.mp4',
    poster: '/images/little-surprises/how-to-order-poster.webp',
    caption: 'Send happiness in 7 steps',
    meta: '0:22',
    steps: ['Pick the occasion', 'Choose your basket', 'Make it yours', 'Add your note', 'Where and when', 'Pay and confirm', 'Enjoy the smile'],
  },
  kit: {
    title: 'The marketing kit',
    sub: 'Posts, stories, reels, gift tags and greeting cards, all HTML rendered by scripts in the same repo. A price or a logo changes once and every piece follows.',
    posts: [
      { src: '/images/little-surprises/posts/miles-away.webp', alt: 'Instagram post: Miles away, still there. A paper plane flies from London to a gift in Karāchi.' },
      { src: '/images/little-surprises/posts/we-are-live.webp', alt: 'Instagram post: We are live. An Open sign, a basket and a delivery van on pink.' },
      { src: '/images/little-surprises/posts/forever-flowers.webp', alt: 'Instagram post: Forever flowers. Four handmade bouquets pinned like photos.' },
      { src: '/images/little-surprises/posts/corporate-hamper.webp', alt: 'Instagram post: Corporate gift hamper. A black box with a bottle, mug, plant and bag.' },
    ],
  },
  screens: {
    title: 'The storefront',
    sub: 'Prerendered pages for search, a city picker that sets delivery times, and a phone layout with a bottom tab bar. Light and dark themes, both checked with axe.',
    url: 'littlesurprises.shop',
    homeAlt: 'Little Surprises home page: "Wrapped by hand, for you." with Build a basket and Shop all gifts buttons beside a wicker basket of wrapped treats and a handwritten For Ammi gift tag.',
    mobileAlt: 'Little Surprises on a phone: the Deliver to Karāchi picker, a basket photo with heart and bow stickers, the headline and a bottom tab bar with Home, Shop, Bag, Blog and More.',
    details: [
      {
        src: '/images/little-surprises/site-shop.webp',
        alt: 'All gifts: search, price bands, brand chips and product cards with ratings, prices and add buttons, 66 gifts delivering to Karāchi.',
        cap: 'Shop, filter and sort',
      },
      {
        src: '/images/little-surprises/site-product.webp',
        alt: 'Chocolate Bouquet product page: a large photo, the Rs 3,500 price, how sourcing works, a quantity stepper, Add to bag and Buy now.',
        cap: 'Product details',
      },
      {
        src: '/images/little-surprises/site-build.webp',
        alt: 'Build a basket, step 1: three basket cards (cardboard gift box, clear gift box, wooden basket with handle) beside an empty Your basket summary.',
        cap: 'Build a basket',
      },
    ],
    note: 'The live shop, captured on 24 November 2026. Product photos are the shop’s own.',
  },
  studio: {
    title: 'Ordering, the Pakistani way',
    sub: 'Most people here order in a chat and pay on delivery. The bag turns into a WhatsApp message with every line spelled out, and checkout takes cash on delivery or a bank transfer with a photo of the receipt.',
    alt: 'The build a basket page on a laptop: numbered steps for basket, treats and note, basket cards with their capacity and price, and a live Your basket summary.',
    cartAlt: 'A product page on a phone: the Chocolate Bouquet photo, the in stock badge, the price and the bottom tab bar.',
  },
  problem: {
    title: 'The problem and the approach',
    sub: 'Gift shops here sell hampers someone else filled, and most ideas people save from Instagram are hard to order. The shop lets the buyer fill the basket.',
    items: [
      {
        icon: 'phosphorDeviceMobile',
        t: 'Phone first',
        s: 'Gifts are bought on phones, often late. A bottom tab bar, a raised Build action and a sticky total keep the next step under the thumb.',
      },
      {
        icon: 'phosphorCalculator',
        t: 'The basket sets the limit',
        s: 'Each basket holds a set number of treats. The builder counts as you fill it and the server prices the same basket again before an order is placed.',
      },
      {
        icon: 'phosphorPackage',
        t: 'Ready baskets to start from',
        s: 'My wife makes baskets in the admin; buyers can buy one as it is or open it in the builder and swap what is inside.',
      },
      {
        icon: 'phosphorChatCircleText',
        t: 'Chat is a checkout',
        s: 'Every bag can leave as a WhatsApp, Instagram or Messenger message, because that is where people here already shop.',
      },
    ],
  },
  flow: {
    title: 'Choose, customise, deliver',
    sub: 'The shop’s own three words, as a route through the app. Ready gifts take the short path; a custom basket takes the builder.',
    steps: ['Pick a city', 'Choose a basket', 'Wrap and ribbon', 'Fill it', 'Write a note', 'Order or chat'],
    rules: [
      { t: 'Delivery by city', s: 'The owner sets a fee and a delivery time for each city; the top bar and every product show the time for the city you picked.' },
      { t: 'Made to order', s: 'Most items are sourced after you order, and the shop says so on every product, with a disclaimer about handmade differences.' },
      { t: 'Vouchers and reviews', s: 'Codes are checked on the server; reviews are moderated in the admin before they show.' },
      { t: 'A bag that stays', s: 'The bag is a signal store saved on the device, so a reload or a closed tab keeps it.' },
    ],
  },
  arch: {
    title: 'How it fits together',
    sub: 'A prerendered storefront and an admin in one Angular app, one NestJS API, Postgres for data and storage for uploads, all behind Cloudflare.',
    left: 'Angular 21 app',
    core: 'NestJS API',
    coreSub: 'Catalogue, pricing, orders',
    right: 'Data and services',
    screens: [
      { icon: 'phosphorHouse', t: 'Storefront', s: 'Home, shop, occasions, product' },
      { icon: 'phosphorGift', t: 'Build a basket', s: 'Basket, treats, note' },
      { icon: 'phosphorShoppingBag', t: 'Bag and checkout', s: 'Vouchers, delivery, payment proof' },
      { icon: 'phosphorGauge', t: 'Admin', s: 'Orders, stock, customers, inbox' },
    ],
    planned: [
      { icon: 'phosphorDatabase', t: 'Postgres', s: 'Products, baskets, orders, audit' },
      { icon: 'phosphorCloud', t: 'Storage', s: 'Admin uploads and payment proofs' },
      { icon: 'phosphorEnvelope', t: 'Email', s: 'Order mail and the shop inbox' },
    ],
  },
  stack: {
    title: 'The stack',
    sub: 'The same stack I use for client work, sized for a two-person shop: one repo, one API, prerendered pages and no lock-in.',
    groups: [
      {
        t: 'Storefront and admin',
        why: 'Standalone components, signals, prerendered pages for every public route, light and dark themes.',
        items: [
          { name: 'Angular 21', logo: 'angular' },
          { name: 'TypeScript', logo: 'typescript' },
          { name: 'SCSS', logo: 'sass' },
          { name: 'Signals', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'API and data',
        why: 'NestJS modules for catalogue, pricing, orders, vouchers, reviews, mail and audit, on Postgres.',
        items: [
          { name: 'NestJS', logo: 'nestjs' },
          { name: 'PostgreSQL', logo: 'postgresql' },
          { name: 'Supabase', logo: 'supabase' },
        ],
      },
      {
        t: 'Ship and market',
        why: 'Render behind Cloudflare, Playwright and axe on every page, and Instagram posts and reels rendered from code.',
        items: [
          { name: 'Cloudflare', logo: 'cloudflare' },
          { name: 'Render', icon: 'phosphorCloudArrowUp' },
          { name: 'Playwright and axe', icon: 'phosphorShieldCheck' },
          { name: 'WhatsApp ordering', logo: 'whatsapp' },
        ],
      },
    ],
  },
  decisions: {
    title: 'What running it taught me',
    sub: 'A shop is a different kind of client: the person filing the bug is across the table.',
    items: [
      {
        t: 'Price on the server, always',
        s: 'The builder shows a total as you go, but the API prices the basket again from its own catalogue before an order exists. The two can never disagree at the door.',
      },
      {
        t: 'Say what is sourced',
        s: 'Most items are bought after the order. Saying so on every product page cut the "where is my gift" messages more than any feature.',
      },
      {
        t: 'The admin is the product too',
        s: 'My wife runs the shop from the admin every day. Print slips, a today view and a shared inbox mattered more than another storefront page.',
      },
      {
        t: 'No made-up parts',
        s: 'Until the API answers, the builder shows nothing rather than sample baskets. A wrong price is worse than a short wait.',
      },
      {
        t: 'Money in whole rupees',
        s: 'Every amount is an integer, formatted only at the edge, so a basket of ten items can never be a rupee off.',
      },
      {
        t: 'Marketing from the same repo',
        s: 'Posts, stories, reels and gift tags are HTML rendered by scripts, so a price or a logo changes once and every piece follows.',
      },
    ],
  },
  next: {
    title: 'Building a shop of your own?',
    sub: 'Storefronts, builders and admins that a small team can run every day.',
    hire: 'Hire me',
    other: 'View work',
  },
} as const;
