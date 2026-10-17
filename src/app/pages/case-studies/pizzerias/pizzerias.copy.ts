// Pizzerias case-study copy. English only, plain const.
// Facts come from the owner's CV and the eight storefront repos (read, never modified). The owner asked for one
// case study across the brands (2026-10-11); the brands are named as on the CV. The company the owner built them
// for is never named. The live sites and their API are offline, so every menu, price and order shown is a sample,
// and the storefront screenshots are the original builds rendered against a sample API.
// Security: no endpoint names, keys, Firebase projects or hostnames.

export const COPY = {
  seo: {
    title: 'Pizzerias case study',
    description:
      'One Angular storefront template running seven pizzeria and cloud-kitchen brands in Germany: menus priced by size, delivery areas with their own minimums, OTP sign-in, cash, card and PayPal, and live order tracking.',
    imageAlt: 'Pizzerias case study cover: "Seven pizzerias, one template." beside a storefront rendered with a sample menu.',
  },
  hero: {
    tag: 'Case study',
    pill: '2023 to 2024, Germany, remote',
    line1: 'Seven pizzerias.',
    line2: 'One storefront template.',
    lede: 'Pizzerias and a cloud kitchen in Germany, each with its own name, colours and menu, all running on one Angular template I built and forked per brand. Ordering, delivery rules, payments and tracking stayed the same everywhere.',
    back: 'View work',
    try: 'Try it: switch brand',
  },
  meta: [
    { k: 'Role', v: 'Frontend developer, part-time' },
    { k: 'Timeline', v: '2023 to 2024' },
    { k: 'Brands', v: '7 brands, 8 storefronts' },
    { k: 'Stack', v: 'Angular, Scully, Firebase, PayPal' },
  ],
  numbers: [
    { value: '7', label: 'brands on one template: six pizzerias and a cloud kitchen' },
    { value: '2', label: 'template generations, Angular 13 with Scully, then Angular 14' },
    { value: '3', label: 'ways to pay: cash on delivery, card and PayPal' },
    { value: '10 s', label: 'between tracker checks while an order is on its way' },
  ],
  brands: {
    title: 'Same template, different kitchens',
    sub: 'Each brand is a fork with its own colours, type and pictures, set at build time. Pizzeria Roma launched on the first generation and moved to the second with a new design.',
    genLabel: ['', 'Generation 1', 'Generation 2'],
    // Pizzeria Roma's first storefront, shown beside the other seven.
    classic: {
      id: 'roma-classic',
      name: 'Pizzeria Roma, first design',
      town: 'Schlangenbad',
      gen: 1,
      angular: '13',
      palette: ['#f57b34', '#2c7b35', '#460000', '#383838'],
      font: 'Tahoma',
      logo: '/images/pizzerias/logos/roma-classic.webp',
    },
  },
  site: {
    title: 'The storefronts, back on screen',
    sub: 'The live sites are gone, so I served the original builds and answered their API calls with a sample menu. What you see is the real frontend.',
    note: 'Original builds rendered against a sample API. Menus, prices and orders are samples.',
  },
  arch: {
    title: 'What a brand is made of',
    sub: 'Some things are baked into each fork. The rest the storefront asks the API for on load, so a restaurant can change its hours or switch off PayPal without a release.',
    left: 'Set per fork, at build',
    core: 'Storefront template',
    coreSub: 'Angular, lazy-loaded pages',
    right: 'Read at runtime',
    build: [
      { icon: 'phosphorPalette', t: 'Theme', s: 'Brand colours, fonts, pictures' },
      { icon: 'phosphorPlugs', t: 'Environment', s: 'API base, push project' },
      { icon: 'phosphorTextAa', t: 'Copy', s: 'Home page, about, footer' },
    ],
    runtime: [
      { icon: 'phosphorStorefront', t: 'Settings', s: 'Name, logo, phone, address, tax' },
      { icon: 'phosphorClock', t: 'Opening hours', s: 'And whether it is open now' },
      { icon: 'phosphorCreditCard', t: 'Payments', s: 'Card and PayPal on or off' },
      { icon: 'phosphorMapPin', t: 'Delivery areas', s: 'Each with a fee and a minimum' },
    ],
  },
  rules: {
    title: 'The rules on the menu',
    sub: 'Pizza ordering looks simple until the prices depend on the size, the extras depend on the size too, and delivery depends on where you live.',
    items: [
      { t: 'Sizes', s: 'Each pizza has a price per size. Extras like more cheese have one too, so the add-on follows the base.' },
      { t: 'Deals', s: 'A deal is a fixed price for a set of slots: pick one pizza from this category, one drink from that one.' },
      { t: 'Areas', s: 'Delivery areas each carry a fee and a minimum order. Pickup has no minimum.' },
      { t: 'Vouchers', s: 'A fixed amount or a percentage off, each with its own minimum order, checked by the API.' },
    ],
  },
  track: {
    title: 'From oven to door',
    sub: 'The kitchen moves an order along in the back office. The customer’s tracker asks every 10 seconds and a push notification follows each step.',
  },
  account: {
    title: 'Checkout and the account behind it',
    sub: 'A phone number is the account. Everything else follows from it: sign-in, codes, orders and notifications.',
    cards: [
      {
        icon: 'phosphorDeviceMobile',
        t: 'OTP sign-up',
        s: 'Register with a phone number and confirm it with a one-time code, with a resend countdown. Resetting a password works the same way.',
      },
      {
        icon: 'phosphorMoney',
        t: 'Cash, card or PayPal',
        s: 'Cash on delivery everywhere. Card and PayPal per brand, switched on in the settings. PayPal returns to a page that verifies the payment.',
      },
      {
        icon: 'phosphorBellRinging',
        t: 'Push notifications',
        s: 'Firebase Cloud Messaging on the web, one project per brand, so each restaurant notifies its own customers.',
      },
      {
        icon: 'phosphorReceipt',
        t: 'Orders',
        s: 'Active, completed and cancelled orders in tabs, each with the full breakdown: items, extras, tax, delivery and discount.',
      },
      {
        icon: 'phosphorStorefront',
        t: 'Closed is a state',
        s: 'When the kitchen is closed the cart says so and checkout stays shut, instead of taking an order nobody will cook.',
      },
      {
        icon: 'phosphorUsersThree',
        t: 'Back office',
        s: 'A role-based portal where staff run orders, staff and products across all the brands.',
      },
    ],
  },
  stack: {
    title: 'The stack',
    sub: 'Angular storefronts on a shared Laravel-style API, prerendered where it helped and themed with plain SCSS.',
    groups: [
      {
        t: 'Storefront',
        why: 'Lazy-loaded pages, a scroll-spy menu and Bootstrap for the grid, in the brand’s own SCSS theme.',
        items: [
          { name: 'Angular 13 and 14', logo: 'angular' },
          { name: 'TypeScript', logo: 'typescript' },
          { name: 'RxJS', logo: 'reactivex' },
          { name: 'Bootstrap 5', logo: 'bootstrap' },
          { name: 'Sass', logo: 'sass' },
          { name: 'Scully prerender', icon: 'phosphorCode' },
        ],
      },
      {
        t: 'Ordering',
        why: 'Payments through the API, codes from the API, and a push channel per brand.',
        items: [
          { name: 'PayPal', logo: 'paypal' },
          { name: 'Stripe, server side', logo: 'stripe' },
          { name: 'OTP sign-in', icon: 'phosphorLock' },
          { name: 'Firebase Cloud Messaging', logo: 'firebase' },
          { name: 'Polling tracker', icon: 'phosphorBroadcast' },
        ],
      },
      {
        t: 'Polish',
        why: 'German and English on two brands, maps on the contact page, and builds that bust their own cache.',
        items: [
          { name: 'ngx-translate, DE and EN', icon: 'phosphorTranslate' },
          { name: 'Google Maps embed', logo: 'googlemaps' },
          { name: 'Lottie animations', icon: 'phosphorCode' },
          { name: 'Versioned builds', icon: 'phosphorPlugs' },
        ],
      },
    ],
  },
  decisions: {
    title: 'Decisions and what I’d change',
    sub: 'Small restaurants, a small budget and a new brand every few months.',
    items: [
      {
        t: 'Fork per brand',
        s: 'A fork made each new restaurant a matter of days, and no brand’s redesign could break another. The cost: a fix had to be copied eight times. Today I’d keep one codebase and load the brand at runtime.',
      },
      {
        t: 'Areas, not addresses',
        s: 'Customers pick a delivery area instead of typing an address for geocoding. No maps bill, and the kitchen decides how far it delivers and what each area costs.',
      },
      {
        t: 'Polling over sockets',
        s: 'An order changes state four or five times in an hour. A check every 10 seconds plus a push notification felt live enough, and needed nothing new on the server.',
      },
      {
        t: 'Prerendered menus',
        s: 'The first generation prerendered its pages with Scully, so they arrived as HTML, ready for search engines and slow phones. Most later forks dropped it for simpler builds.',
      },
      {
        t: 'Card fields belong to the provider',
        s: 'Card details went to our API, which charged them. Today I’d use the payment provider’s hosted fields, so card numbers never pass through our servers at all.',
      },
      {
        t: 'Translations from day one',
        s: 'Only Joker Pizza and Cloud Kitchen switch between German and English. Copy hard-coded in the other forks made that a retrofit; strings in files from the start would have cost nothing.',
      },
    ],
  },
  next: {
    title: 'Running more than one brand?',
    sub: 'Storefronts, ordering rules and the back office behind them, built once and shared.',
    hire: 'Hire me',
    other: 'Next: Bloomstone',
  },
} as const;
