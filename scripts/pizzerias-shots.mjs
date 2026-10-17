// Screenshots of the multi-brand pizzeria ordering template (2023-2024) for the /work/pizzerias case study.
//   node scripts/pizzerias-shots.mjs [--only roma,joker] [--logos-only]
//   node scripts/pizzerias-shots.mjs --only mannosalwa,pinseria,speed,roma-classic
//     (home page only of the four forks built into .devcache/build/pizza-src; the pre-built brands are not re-shot)
// The brands' production backends are offline, so each pre-built Angular bundle (read only, in D:\workspace-private)
// is rendered against dummy JSON: every request to the brand's Laravel API (envelope {status, message, data, errors})
// is fulfilled by page.route(). The bundles force https in production (`location.protocol === 'http:'` redirects),
// so instead of a localhost port each dist folder is served from a virtual https origin (https://<slug>.shots.test)
// by the same route handler: a tiny static server with index.html fallback, no TLS certificate needed.
// Everything else (Firebase/FCM, gtag, Facebook pixel) is aborted. Cart, delivery area, order id and the
// signed-in demo user are seeded into local/sessionStorage before the app boots, so nothing is clicked except the
// product card that opens the detail modal. Output: public/images/pizzerias/*.webp (quality 80) and
// public/images/pizzerias/logos/<slug>.webp.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const OUT = resolve(ROOT, 'public/images/pizzerias');
const LOGOS = resolve(OUT, 'logos');
mkdirSync(LOGOS, { recursive: true });
const SRC = 'D:/workspace-private';
const BUILT = resolve(ROOT, '.devcache/build/pizza-src').replace(/\\/g, '/');

const argv = process.argv;
const onlyArg = argv.includes('--only') ? argv[argv.indexOf('--only') + 1].split(',') : null;

// ---------------------------------------------------------------------------------------------------------------
// Brands with a pre-built bundle. `img` = food photos that ship inside that brand's own dist/assets.
// ---------------------------------------------------------------------------------------------------------------
const J = 'assets/__images/';
const BRANDS = [
  {
    slug: 'roma',
    dist: `${SRC}/PizzeriaRomaFrontEndNewDesign/dist/pizza-roma`,
    version: '0.0.17',
    session: 'pizzaroma',
    title: 'Pizzeria Roma',
    logo: 'assets/images/logo.png',
    town: '65388 Schlangenbad',
    areas: [['65388', 'Schlangenbad'], ['65396', 'Walluf'], ['65343', 'Eltville am Rhein']],
    home: '/home',
    img: {
      pizza: ['assets/images/home/category-2.png', 'assets/images/home/pizza-1.png', 'assets/images/home/pizza-2.png', 'assets/images/home/about.png'],
      burger: ['assets/images/home/category-1.png', 'assets/images/home/category-3.png'],
      deal: null,
    },
    detail: true,
  },
  {
    slug: 'joker',
    dist: `${SRC}/JokerFrontEnd/dist/joker-pizza-0.0.31`,
    version: '0.0.31',
    session: 'jokerPizza',
    title: 'Joker Pizza & Burger',
    logo: `${J}logo.png`,
    town: '69509 Mörlenbach',
    areas: [['69509', 'Mörlenbach'], ['69488', 'Birkenau'], ['69469', 'Weinheim']],
    home: '/home',
    img: {
      pizza: [`${J}home_pizza.png`, `${J}1.jpg`, `${J}delicious-pizza-png.png`, `${J}banner%20pizza.png`],
      burger: [`${J}home_beef_burger.png`, `${J}home_chicken_burger.png`, `${J}burger-image.png`],
      deal: `${J}deal-1.png`,
    },
  },
  {
    slug: 'turtles',
    dist: `${SRC}/PizzaTurtlesFrontEnd/dist/turtle-pizza`,
    version: '0.0.31',
    session: 'turtlesPizza',
    title: 'Pizza Turtles',
    logo: 'assets/images/logo.png',
    town: '69509 Mörlenbach',
    areas: [['69509', 'Mörlenbach'], ['69488', 'Birkenau'], ['69483', 'Wald-Michelbach']],
    home: '/home',
    img: {
      pizza: [`${J}delicious-pizza-png.png`, `${J}home_pizza.png`, `${J}1.jpg`, `${J}banner%20pizza.png`],
      burger: [`${J}home_beef_burger.png`, `${J}home_chicken_burger.png`, `${J}burger-image.png`],
      deal: null, // deal-1.png in this bundle still carries the Joker logo
    },
  },
  {
    slug: 'cloud-kitchen',
    dist: `${SRC}/cloud-kitchen/dist/cloud-kitchen`,
    version: '0.0.10',
    session: 'cloudkitchen',
    title: 'Cloud Kitchen',
    logo: 'assets/images/logo.png',
    town: '69509 Mörlenbach',
    areas: [['69509', 'Mörlenbach'], ['69488', 'Birkenau'], ['69469', 'Weinheim']],
    home: '/',
    img: {
      pizza: ['assets/images/offers/3.png'],
      burger: ['assets/images/offers/1.png'],
      grill: 'assets/images/offers/4.png',
      dessert: 'assets/images/offers/2.png',
      deal: null,
    },
    // This bundle ships one photo per dish type, so open the menu on a mixed best-seller tab instead of eight
    // identical pizza photos.
    featured: ['Beliebt', [
      ['Pizza Diavola', 'Tomatensauce, Mozzarella, scharfe Salami, Peperoni, Chili', [10.5, 12.9], 'pizza'],
      ['Classic Beef Burger', '150 g Rindfleisch, Cheddar, Tomate, Salat, Hausdressing', [10.9], 'burger'],
      ['Grillteller', 'Hähnchenspieße, Köfte, Grillgemüse, Fladenbrot, zwei Dips', [14.9], 'grill'],
      ['French Toast', 'Brioche, Beeren, Banane, Ahornsirup', [6.9], 'dessert'],
    ]],
  },
  // The next four forks never had a build output on disk. Their bundles are built from the read-only sources by
  // copying each repo (without .git and node_modules) to .devcache/build/pizza-src/<slug>, running `npm ci
  // --ignore-scripts` and `npx ng build` there (see the case-study report); the source repos are never touched.
  // Only their home page is captured (`homeOnly`).
  {
    slug: 'mannosalwa',
    dist: `${BUILT}/mannosalwa/dist/mannosalwa`,
    version: '0.0.16',
    session: 'pizzeriaRoma',
    title: 'Mannosalwa',
    logo: 'assets/images/navbar/logo.svg',
    town: '69509 Mörlenbach',
    areas: [['69509', 'Mörlenbach'], ['69488', 'Birkenau'], ['69469', 'Weinheim']],
    home: '/home',
    homeOnly: true,
    settingsList: true, // this fork reads /setting as an array (res.data[0])
    img: {
      pizza: ['assets/images/sample-pizza.png', 'assets/images/pizza.jpg'],
      burger: null,
      deal: null,
    },
  },
  {
    slug: 'pinseria',
    dist: `${BUILT}/pinseria/dist/pinseria`,
    version: '0.0.10',
    session: 'pizzeriaRoma',
    title: 'Pinseria',
    logo: 'assets/images/logo.png',
    town: '69509 Mörlenbach',
    areas: [['69509', 'Mörlenbach'], ['69488', 'Birkenau'], ['69469', 'Weinheim']],
    home: '/home',
    homeOnly: true,
    settingsList: true, // this fork reads /setting as an array (res.data[0])
    img: {
      pizza: ['assets/images/utilities/plate-pizza.png', 'assets/images/utilities/pizza-1.png', 'assets/images/home/banner-img.png'],
      burger: null,
      deal: null,
    },
    // The home page opens on a category carousel with one photo per category: only list the categories this
    // bundle has a photo for.
    cats: { Pinsa: 'assets/images/utilities/plate-pizza.png', Pizza: 'assets/images/utilities/pizza-1.png', Pasta: 'assets/images/utilities/pizza-2.png' },
  },
  {
    slug: 'speed',
    dist: `${BUILT}/speed/dist/speed-pizza`,
    // The top bar hard-codes the restaurant's real number: swap it for the same dummy number as settings.phone.
    phone: ['app-navbar h6', '<span class="text-sm text-white" style="font-size: 0.8em !important">06209</span> 000 000'],
    version: '0.0.14',
    session: 'pizzeriaRoma',
    title: 'Speed Pizza Döner',
    logo: 'assets/images/navbar/logo.svg',
    town: '69509 Mörlenbach',
    areas: [['69509', 'Mörlenbach'], ['69488', 'Birkenau'], ['69469', 'Weinheim']],
    home: '/home',
    homeOnly: true,
    settingsList: true, // this fork reads /setting as an array (res.data[0])
    img: {
      pizza: ['assets/images/sample-pizza.png', 'assets/images/pizza.jpg', 'assets/images/home/banner.jpg'],
      burger: null,
      deal: null,
    },
  },
  {
    slug: 'roma-classic',
    dist: `${BUILT}/roma-classic/dist/pizzeria-roma-front`,
    version: '0.0.8',
    session: 'pizzeriaRoma',
    title: 'Pizzeria Roma',
    logo: 'assets/img/logo-pizza.png',
    town: '65388 Schlangenbad',
    areas: [['65388', 'Schlangenbad'], ['65396', 'Walluf'], ['65343', 'Eltville am Rhein']],
    home: '/home',
    homeOnly: true,
    settingsList: true, // this fork reads /setting as an array (res.data[0])
    img: {
      pizza: ['assets/img/flavours/fernando_30.jpg', 'assets/img/ivan-torres-MQUqbmszGGM-unsplash_4_30.jpg', 'assets/img/topping.jpg'],
      burger: ['assets/img/burgers/burger_resized.jpg'],
      deal: null,
    },
    // Hero carousel slides (deals.jpg in this bundle is a stock flyer priced in rupees, so it is left out).
    banners: ['assets/bg.jpg', 'assets/img/ivan-torres-MQUqbmszGGM-unsplash_4_30.jpg', 'assets/img/topping.jpg'],
  },
];

// Each bundle calls its brand's live API (offline now). Read the base from the build's environment instead of
// keeping the hostnames here: they are the restaurants' servers, not something this repo should publish.
function detectApi(dist) {
  for (const f of readdirSync(dist).filter((n) => /^main.*\.js$/.test(n))) {
    const js = readFileSync(join(dist, f), 'utf8');
    // Older forks: the optimiser inlines environment.backendUrl into the HTTP interceptor (`url: "<base>" + req.url`).
    const m = js.match(/backendUrl\s*[:=]\s*["'`]([^"'`]+)["'`]/) ?? js.match(/url\s*:\s*["'`](https?:\/\/[^"'`]+)["'`]\s*\+\s*[\w$]+\.url/);
    if (m) return m[1].replace(/\/$/, '');
  }
  throw new Error(`No backendUrl found in ${dist}`);
}
for (const b of BRANDS) if (existsSync(b.dist)) b.api = detectApi(b.dist);

// ---------------------------------------------------------------------------------------------------------------
// Dummy data (German pizzeria, EUR). Prices are strings, like the Laravel API returned them.
// ---------------------------------------------------------------------------------------------------------------
const STAMP = '2024-03-14T11:00:00.000000Z';
const eur = (n) => n.toFixed(2);
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const CATEGORIES = [
  ['Pizza', 'pizza', [
    ['Pizza Margherita', 'Tomatensauce, Mozzarella, frisches Basilikum', [8.5, 10.9]],
    ['Pizza Salami', 'Tomatensauce, Mozzarella, Rindersalami', [9.5, 11.9]],
    ['Pizza Funghi', 'Tomatensauce, Mozzarella, frische Champignons', [9.0, 11.5]],
    ['Pizza Diavola', 'Tomatensauce, Mozzarella, scharfe Salami, Peperoni, Chili', [10.5, 12.9]],
    ['Pizza Quattro Formaggi', 'Tomatensauce, Mozzarella, Gorgonzola, Parmesan, Edamer', [10.9, 13.5]],
    ['Pizza Tonno', 'Tomatensauce, Mozzarella, Thunfisch, rote Zwiebeln', [10.0, 12.5]],
    ['Pizza Prosciutto', 'Tomatensauce, Mozzarella, Vorderschinken', [9.5, 11.9]],
    ['Pizza Hawaii', 'Tomatensauce, Mozzarella, Vorderschinken, Ananas', [9.9, 12.4]],
  ]],
  ['Pinsa', 'pizza', [
    ['Pinsa Romana', 'Tomatensauce, Fior di Latte, Kirschtomaten, Basilikum', [11.9]],
    ['Pinsa Parma', 'Fior di Latte, Parmaschinken, Rucola, Parmesan', [13.9]],
    ['Pinsa Burrata', 'Tomatensauce, Burrata, Pesto, Kirschtomaten', [14.5]],
  ]],
  ['Pasta', null, [
    ['Spaghetti Bolognese', 'Hausgemachte Rinderhackfleischsauce, Parmesan', [9.9]],
    ['Penne Arrabbiata', 'Scharfe Tomatensauce, Knoblauch, Petersilie', [8.9]],
    ['Tagliatelle Carbonara', 'Speck, Ei, Parmesan, schwarzer Pfeffer', [10.9]],
    ['Lasagne al Forno', 'Bolognese, Bechamel, mit Käse überbacken', [11.5]],
  ]],
  ['Burger', 'burger', [
    ['Classic Beef Burger', '150 g Rindfleisch, Cheddar, Tomate, Salat, Hausdressing', [10.9]],
    ['Chicken Burger', 'Knuspriges Hähnchenfilet, Coleslaw, Honig-Senf-Sauce', [9.9]],
    ['BBQ Bacon Burger', '150 g Rindfleisch, Bacon, Röstzwiebeln, BBQ-Sauce', [12.5]],
    ['Veggie Burger', 'Gemüse-Patty, Avocado, Tomate, Salat', [10.5]],
  ]],
  ['Döner', 'grill', [
    ['Döner im Brot', 'Kalbfleisch, Salat, Tomaten, Zwiebeln, Joghurtsauce', [6.5]],
    ['Dürüm Döner', 'Im Fladenbrot gerollt, Salat, Kräutersauce', [7.5]],
    ['Döner Teller', 'Kalbfleisch, Pommes oder Reis, Salat, zwei Saucen', [12.9]],
  ]],
  ['Salate', null, [
    ['Insalata Mista', 'Blattsalate, Tomaten, Gurken, Karotten, Mais', [7.5]],
    ['Insalata Tonno', 'Gemischter Salat, Thunfisch, Ei, Oliven', [9.5]],
    ['Caprese', 'Tomaten, Mozzarella, Basilikum, Olivenöl', [8.9]],
  ]],
  ['Getränke', null, [
    ['Coca-Cola 0,33l', 'inkl. 0,25 € Pfand', [2.5]],
    ['Coca-Cola 1,0l', 'inkl. 0,15 € Pfand', [3.9]],
    ['Fanta 0,33l', 'inkl. 0,25 € Pfand', [2.5]],
    ['Mineralwasser 0,5l', 'Still oder sprudelnd, inkl. 0,25 € Pfand', [2.2]],
  ]],
];
const PIZZA_SIZES = ['26cm', '32cm'];

const ADDON_GROUPS = [
  {
    id: 1, name: 'Extra Belag', type: 'Extra', items: [
      ['Extra Käse', [1.0, 1.5]], ['Rucola', [1.0, 1.5]], ['Jalapeños', [1.0, 1.5]],
      ['Champignons', [1.0, 1.5]], ['Rindersalami', [1.5, 2.0]], ['Parmaschinken', [2.0, 2.5]],
    ],
  },
  { id: 2, name: 'Dips & Saucen', type: 'Addon', items: [['Knoblauchsauce', [0.8]], ['Cocktailsauce', [0.8]], ['Chili-Mayo', [0.8]]] },
];

function buildData(brand) {
  const pick = (kind, i) => {
    const v = kind && brand.img[kind];
    if (!v) return null;
    return Array.isArray(v) ? v[i % v.length] : v;
  };
  let pid = 100;
  const list = brand.featured ? [[brand.featured[0], null, brand.featured[1]], ...CATEGORIES] : CATEGORIES;
  const categories = list.map(([name, catKind, items], ci) => {
    const id = ci + 1;
    const products = items.map(([pname, description, prices, itemKind], i) => {
      const productId = ++pid;
      const kind = itemKind ?? catKind;
      const sizes = kind === 'pizza' && prices.length === 2
        ? PIZZA_SIZES.map((size, s) => ({ product_id: productId, size, price: eur(prices[s]), discounted_price: eur(prices[s]) }))
        : [];
      const withAddons = kind === 'pizza';
      return {
        id: productId, category_id: id, name: pname, description, slug: slugify(pname), image: pick(kind, itemKind ? 0 : i),
        price: eur(prices[0]), status: 1, deleted_at: null, created_at: STAMP, updated_at: STAMP,
        sizes, addons: [], product_attributes: [],
        sizes_count: sizes.length, addons_count: withAddons ? 2 : 0, attributes_count: 0,
        category: { id, parent_id: 0, name, slug: slugify(name), image: null },
      };
    });
    return { id, parent_id: 0, name, slug: slugify(name), image: brand.cats?.[name] ?? null, created_at: STAMP, updated_at: STAMP, products };
  });
  const products = categories.flatMap((c) => c.products);
  const cat = (name) => categories.find((c) => c.name === name);

  let aid = 0;
  const addonsFor = (product) => ADDON_GROUPS.map((g) => ({
    id: g.id, name: g.name, type: g.type, image: null, category_id: product.category_id, category: [],
    addon_items: g.items.map(([name, prices]) => {
      const itemId = ++aid;
      const sizes = product.sizes.length
        ? product.sizes.map((s, i) => ({ id: itemId * 10 + i, addon_item_id: itemId, size: s.size, price: eur(prices[Math.min(i, prices.length - 1)]), discounted_price: eur(prices[Math.min(i, prices.length - 1)]) }))
        : [{ id: itemId * 10, addon_item_id: itemId, size: '', price: eur(prices[prices.length - 1]), discounted_price: eur(prices[prices.length - 1]) }];
      return { id: itemId, addon_group_id: g.id, name, description: '', price: eur(prices[0]), discounted_price: eur(prices[0]), image: null, addon_sizes: sizes };
    }),
  }));

  const deals = [
    { id: 1, name: 'Family Deal', description: '2 große Pizzen nach Wahl + 1,0l Coca-Cola', price: '24.90', image: brand.img.deal ?? pick('pizza', 0), slug: 'family-deal', status: 1 },
    { id: 2, name: 'Burger Menü', description: 'Burger nach Wahl, Pommes, 0,33l Getränk', price: '13.90', image: pick('burger', 0), slug: 'burger-menu', status: 1 },
  ].map((d) => ({
    ...d, created_at: STAMP, updated_at: STAMP, deal_addons: [],
    deal_items: [
      { id: d.id * 10 + 1, deal_id: d.id, product_id: null, category_id: cat('Pizza').id, category_name: 'Pizza', size: '32cm', quantity: 2, image: pick('pizza', 1), category: cat('Pizza') },
      { id: d.id * 10 + 2, deal_id: d.id, product_id: null, category_id: cat('Getränke').id, category_name: 'Getränke', size: null, quantity: 1, image: null, category: cat('Getränke') },
    ],
  }));

  const [zip] = brand.town.split(' ');
  const areas = brand.areas.map(([code, place], i) => ({
    id: i + 1, area_code: code, address: `${code} ${place}`, delivery_charge: [1.5, 2.5, 3.5][i], min_amount: [12, 15, 20][i],
  }));

  const settings = {
    id: 1, title: brand.title, email: `info@${brand.slug}.example`, phone: '+49 6209 000000', phone2: '',
    address: `Hauptstraße 1, ${brand.town}`, address2: '', facebook: '#', twitter: '#', instagram: '#',
    logo: brand.logo, currency: 'EUR', tax: '0', isOpen: 1, is_open: 1, paypal: 1, stripe: 1, cash: 1,
    android_app_url: '#', ios_app_url: '#', android_app_version: '1.0.0', ios_app_version: '1.0.0',
    android_force_update: 0, ios_force_update: 0, qr_code_image: QR, isSubscription: 0, subscription_text: '',
    delivery_times: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'].map((day) => ({ day, time: '11:00 - 22:30' })),
    created_at: STAMP, updated_at: STAMP, zip,
  };

  const margherita = products.find((p) => p.name === 'Pizza Margherita');
  const salami = products.find((p) => p.name === 'Pizza Salami');
  const cola = products.find((p) => p.name === 'Coca-Cola 1,0l');
  const cartLine = (p, size, price, qty, addons = []) => {
    const unit = price + addons.reduce((a, x) => a + x.price, 0);
    const { sizes, addons: _a, product_attributes, sizes_count, addons_count, attributes_count, category, ...rest } = p;
    return { ...rest, ...(size ? { size } : {}), price, quantity: qty, cart_item_addons: addons, attributes: [], deal_items: [], type: 'product', subtotal: unit, total: unit * qty };
  };
  const cart = [
    cartLine(margherita, '32cm', 10.9, 1, [{ id: 1, addon_group_id: 1, name: 'Extra Käse', price: 1.5, size: '32cm', quantity: 1 }, { id: 2, addon_group_id: 1, name: 'Rucola', price: 1.5, size: '32cm', quantity: 1 }]),
    cartLine(salami, '26cm', 9.5, 2),
    cartLine(cola, null, 3.9, 1),
  ];
  const subtotal = cart.reduce((a, l) => a + l.total, 0);

  const user = { id: 7, name: 'Max Mustermann', email: 'max.mustermann@example.com', phone: '+49 151 00000000', role_id: 2, api_token: 'demo-token', address: `Hauptstraße 12, ${brand.town}`, landmark: '' };
  const order = {
    id: 4821, order_number: `ORD-4821`, user_id: user.id, subtotal: eur(subtotal), tax: '0.00', delivery_fee: '1.50', discount: '0.00',
    total_amount: eur(subtotal + 1.5), name: user.name, email: user.email, phone: user.phone, address: user.address,
    nearest_landmark: '', location: areas[0].address, notes: '', order_status: 'Processing', payment_method: 'PAYPAL',
    approximate_time: '20 - 30 min', coupon_id: null, created_at: STAMP, updated_at: STAMP,
    order_items: cart.map((l, i) => ({ id: i + 1, order_id: 4821, product_id: l.id, name: l.name, price: eur(l.price), size: l.size ?? null, quantity: l.quantity, order_item_addons: l.cart_item_addons })),
  };

  const menu = brand.cats ? categories.filter((c) => c.name in brand.cats) : categories;
  const banners = (brand.banners ?? []).map((image, i) => ({ id: i + 1, image, status: 1, sort_order: i + 1, created_at: STAMP, updated_at: STAMP }));

  return { settingsList: !!brand.settingsList, categories, menu, products, addonsFor, deals, areas, settings, cart, user, order, banners };
}

// A plain QR-like tile for the footer "scan to download the app" slot (the real one pointed at the live app).
// Served as a PNG data URL: Angular's sanitizer blocks data:image/svg+xml in [src] ("unsafe:data:...").
const QR_SVG = (() => {
  let s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" shape-rendering="crispEdges"><rect width="25" height="25" fill="#fff"/>';
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  for (let y = 1; y < 24; y++) for (let x = 1; x < 24; x++) {
    const inFinder = (x < 9 && y < 9) || (x > 15 && y < 9) || (x < 9 && y > 15);
    if (!inFinder && rnd() > 0.5) s += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  }
  return s + finder(1, 1) + finder(17, 1) + finder(1, 17) + '</svg>';
})();
const QR = 'data:image/png;base64,' + (await sharp(Buffer.from(QR_SVG)).resize(200, 200, { kernel: 'nearest' }).png().toBuffer()).toString('base64');

// ---------------------------------------------------------------------------------------------------------------
// Mock API: path (after the backend base) -> data.
// ---------------------------------------------------------------------------------------------------------------
function apiResponse(data, path, method) {
  const ok = (d, message = 'Success') => ({ status: true, message, data: d, errors: null });
  const p = path.replace(/^\/+/, '').split('?')[0];
  let m;
  if (p === 'setting' || p === 'setting-new') return ok(data.settingsList ? [data.settings] : data.settings);
  if (p === 'menu') return ok({ categories: data.menu });
  if (p === 'products') return ok(data.products);
  if ((m = p.match(/^product\/(\d+)/))) {
    const product = data.products.find((x) => x.id === +m[1]) ?? data.products[0];
    const withAddons = product.addons_count > 0;
    return ok({ product, addons: withAddons ? data.addonsFor(product) : [], attributes: [] });
  }
  if (p === 'deals') return ok(data.deals);
  if ((m = p.match(/^deals\/(\d+)/))) return ok(data.deals.find((d) => d.id === +m[1]) ?? data.deals[0]);
  if (p === 'banners') return ok({ banners: data.banners, popularProducts: data.products.slice(0, 8) });
  if (p === 'area-code-charges') return ok(data.areas);
  if ((m = p.match(/^user\/orders\/(\d+)/))) return ok(data.order);
  if (p === 'user/orders') return ok({ active_orders: [data.order], cancelled_orders: [], completed_orders: [] });
  if (p === 'user/profile') return ok(data.user);
  if (p === 'user/vouchers') return ok({ vouchers: [], gift_cards: [] });
  if (p === 'validate-voucher') return ok({ discount: 0 }, 'Voucher applied');
  if (p === 'cart/add') return ok({ id: 1, cart_items: data.cart });
  if (method !== 'GET') return ok({});
  return ok([]);
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf',
};

// Static file from the dist folder, falling back to index.html for client routes.
function staticFile(dist, urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^[\\/]+/, '');
  const file = join(dist, clean);
  if (clean && file.startsWith(resolve(dist)) && existsSync(file) && statSync(file).isFile()) {
    return { status: 200, contentType: TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream', body: readFileSync(file) };
  }
  if (extname(clean)) return { status: 404, contentType: 'text/plain', body: 'not found' };
  return { status: 200, contentType: TYPES['.html'], body: readFileSync(join(dist, 'index.html')) };
}

// Things that only exist because there is no real backend or are irrelevant to the product shot.
const HIDE = [
  '.version { display: none !important; }',
  'html { scrollbar-width: none; scroll-behavior: auto !important; } ::-webkit-scrollbar { display: none; }',
  'app-toast, ngb-toast { display: none !important; }',
  '*, *::before, *::after { caret-color: transparent !important; }',
].join('\n');

const browser = await chromium.launch();

async function open(brand, data, path, { mobile = false, seed = {} } = {}) {
  const origin = `https://${brand.slug}.shots.test`;
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: mobile ? 2 : 1.5,
    isMobile: mobile,
    hasTouch: mobile,
    userAgent: mobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
      : undefined,
    serviceWorkers: 'block',
    reducedMotion: 'reduce',
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
  });
  const misses = [];
  await ctx.route('**/*', async (route) => {
    const req = route.request();
    const url = req.url();
    if (url.startsWith(brand.api)) {
      const body = apiResponse(data, url.slice(brand.api.length), req.method());
      return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body) });
    }
    if (url.startsWith(origin)) {
      const r = staticFile(brand.dist, new URL(url).pathname);
      if (r.status === 404) misses.push(new URL(url).pathname);
      return route.fulfill(r);
    }
    if (url.startsWith('data:')) return route.continue();
    return route.abort(); // Firebase, gtag, Facebook pixel, anything else
  });
  const storage = {
    version: brand.version,
    language: 'en',
    'fcm-token': 'demo',
    orderType: 'DELIVERY',
    selectedLocation: JSON.stringify(data.areas[0]),
    cart: JSON.stringify(seed.cart ? data.cart : []),
    addons: '[]',
    currentOrderId: '4821',
  };
  const session = seed.user ? { [brand.session]: JSON.stringify({ user: data.user }) } : {};
  await ctx.addInitScript(([ls, ss]) => {
    try {
      for (const [k, v] of Object.entries(ls)) localStorage.setItem(k, v);
      for (const [k, v] of Object.entries(ss)) sessionStorage.setItem(k, v);
      Notification.requestPermission = () => Promise.resolve('denied');
    } catch {}
  }, [storage, session]);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log(`  [${brand.slug}] pageerror: ${e.message.split('\n')[0]}`));
  if (process.env.SHOTS_DEBUG) page.on('console', (m) => m.type() === 'error' && console.log(`  [${brand.slug}] console: ${m.text().slice(0, 300)}`));
  await page.goto(origin + path, { waitUntil: 'load', timeout: 60_000 });
  await settle(page);
  if (brand.phone) await page.evaluate(([sel, html]) => document.querySelectorAll(sel).forEach((el) => { el.innerHTML = html; }), brand.phone);
  if (misses.length) console.log(`  [${brand.slug}] missing files: ${[...new Set(misses)].join(', ')}`);
  return { ctx, page };
}

async function settle(page, extra = 900) {
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
  await page.addStyleTag({ content: HIDE });
  // ng-http-loader spinner overlay
  await page.waitForFunction(() => !document.querySelector('ng-http-loader #spinner, ng-http-loader .spinner'), null, { timeout: 8000 }).catch(() => {});
  await page.evaluate(async () => {
    for (let y = 0; y < Math.min(document.body.scrollHeight, 4000); y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Lazy images outside the viewport never fire load, so cap the wait.
    const pending = [...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; }));
    await Promise.race([Promise.all(pending), new Promise((r) => setTimeout(r, 3000))]);
  });
  // The agency credit in the footers ("Powered by ...") never appears in a shot.
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('app-footer p, app-footer a, app-footer span, a[href*="euroadvanced"]')) {
      if (/powered\s+by/i.test(el.textContent ?? '') || /euroadvanced/.test(el.getAttribute('href') ?? '')) {
        el.style.setProperty('visibility', 'hidden', 'important');
      }
    }
  });
  await settleImages(page);
  await page.waitForTimeout(extra);
}

// Waits until every image on the page has really loaded (complete with pixels), CSS background images included.
// Scrolls through first so lazy images start, then back to the top. Throws instead of saving a half-loaded shot.
// (Same helper as scripts/asaan-hisab-shots.mjs.)
async function settleImages(p) {
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await document.fonts.ready;
  });
  try {
    await p.waitForFunction(
      // Images that are not rendered at all (display: none, e.g. the mobile hamburger) never load when lazy.
      () => [...document.images].every((i) => (i.complete && (i.naturalWidth > 0 || !i.currentSrc)) || !i.getClientRects().length),
      null,
      { timeout: 60_000, polling: 250 },
    );
  } catch {
    const broken = await p.evaluate(() =>
      [...document.images].filter((i) => !(i.complete && i.naturalWidth > 0) && i.getClientRects().length).map((i) => {
        const r = i.getBoundingClientRect();
        return `${i.outerHTML.slice(0, 140)} [${Math.round(r.width)}x${Math.round(r.height)} complete=${i.complete} nw=${i.naturalWidth}]`;
      }),
    );
    throw new Error(`images did not load:\n  ${broken.join('\n  ')}`);
  }
  // These bundles keep retrying the (aborted) Firebase messaging calls, so the network is never fully idle.
  await p.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
  await p.waitForTimeout(1200); // let decoding and any fade-in finish
}

async function save(buf, name, width) {
  const file = resolve(OUT, `${name}.webp`);
  const info = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(file);
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

const MENU_NAV = 'app-menu-nav ul, app-menu-nav select';
// Scroll so the first visible match sits `gap` px below whatever is pinned to the top (fixed or sticky header).
async function scrollTo(page, selector, gap = 24) {
  await page.evaluate(([sel, g]) => {
    const el = [...document.querySelectorAll(sel)].find((e) => e.getBoundingClientRect().height > 0);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, top - 400), behavior: 'instant' });
    const pinned = [...document.querySelectorAll('body *')]
      .filter((n) => {
        const cs = getComputedStyle(n);
        const r = n.getBoundingClientRect();
        return (cs.position === 'fixed' || cs.position === 'sticky') && r.top <= 1 && r.height > 20 && r.height < 300 && r.width > innerWidth / 2;
      })
      .reduce((h, n) => Math.max(h, n.getBoundingClientRect().bottom), 0);
    window.scrollTo({ top: Math.max(0, top - pinned - g), behavior: 'instant' });
  }, [selector, gap]);
  await page.waitForTimeout(600);
}

// ---------------------------------------------------------------------------------------------------------------
// Screenshots
// ---------------------------------------------------------------------------------------------------------------
if (!argv.includes('--logos-only')) {
  for (const brand of BRANDS) {
    if (onlyArg && !onlyArg.includes(brand.slug)) continue;
    console.log(`# ${brand.slug}`);
    const data = buildData(brand);

    {
      const { ctx, page } = await open(brand, data, brand.home);
      await save(await page.screenshot(), `${brand.slug}-home`, 1600);
      await ctx.close();
    }
    if (brand.homeOnly) continue;
    {
      const { ctx, page } = await open(brand, data, '/menu', { seed: { cart: true } });
      await scrollTo(page, MENU_NAV);
      await save(await page.screenshot(), `${brand.slug}-menu`, 1600);
      await ctx.close();
    }

    if (!brand.detail) continue;

    // Product detail modal (sizes + size-dependent add-ons).
    {
      const { ctx, page } = await open(brand, data, '/menu', { seed: { cart: true } });
      await scrollTo(page, MENU_NAV);
      await page.locator('.menu-list li[role=button]').first().click();
      await page.waitForSelector('ngb-modal-window app-product-detail-modal .list-group-item', { timeout: 10_000 });
      // Pick the large size and two toppings so the modal shows a real selection.
      await page.locator('ngb-modal-window input[type=radio]').nth(1).check();
      await page.locator('ngb-modal-window input[type=checkbox]').nth(0).check();
      await page.locator('ngb-modal-window input[type=checkbox]').nth(1).check();
      await page.evaluate(() => document.activeElement?.blur());
      await page.waitForTimeout(700);
      await save(await page.screenshot(), `${brand.slug}-product`, 1600);
      await ctx.close();
    }

    // Cart: the header cart dropdown with three lines, signed in.
    {
      const { ctx, page } = await open(brand, data, brand.home, { seed: { cart: true, user: true } });
      await page.locator('header .dv-only .cart-button').first().click();
      await page.waitForTimeout(900);
      await page.evaluate(() => document.activeElement?.blur());
      await save(await page.screenshot(), `${brand.slug}-cart`, 1600);
      await ctx.close();
    }

    // Live order tracker, order in "processing".
    {
      const { ctx, page } = await open(brand, data, '/track-new-order', { seed: { user: true } });
      await save(await page.screenshot(), `${brand.slug}-tracker`, 1600);
      await ctx.close();
    }

    // Mobile menu.
    {
      const { ctx, page } = await open(brand, data, '/menu', { mobile: true, seed: { cart: true } });
      await scrollTo(page, MENU_NAV);
      await save(await page.screenshot(), `${brand.slug}-mobile`, 780);
      await ctx.close();
    }
  }
}

await browser.close();

// ---------------------------------------------------------------------------------------------------------------
// Logos of all eight brands (including the three that have no build output): trimmed, 96px high WebP, alpha kept.
// SVG sources are rasterised too, so every logo is one small file of the same kind.
// ---------------------------------------------------------------------------------------------------------------
const LOGO_SOURCES = {
  joker: `${SRC}/JokerFrontEnd/src/assets/__images/logo.png`,
  turtles: `${SRC}/PizzaTurtlesFrontEnd/src/assets/images/logo.png`,
  roma: `${SRC}/PizzeriaRomaFrontEndNewDesign/src/assets/images/logo.png`,
  'roma-classic': `${SRC}/pizzeriaRomaFront/src/assets/img/logo.PNG`, // logo.svg there is an Illustrator export wrapping a JPEG
  'cloud-kitchen': `${SRC}/cloud-kitchen/src/assets/images/logo.png`,
  mannosalwa: `${SRC}/ManusalwaFrontEnd/src/assets/images/navbar/logo.svg`,
  pinseria: `${SRC}/PinseriaFrontEnd/src/assets/images/logo.png`,
  speed: `${SRC}/SpeedPizzaDonerFrontEnd/src/assets/images/navbar/logo.svg`, // an SVG wrapping one PNG: rasterised
};
// Logos exported on an opaque white canvas: clear the white that touches the border (flood fill), keep the white
// inside the letters, and fade the anti-aliased rim so it does not leave a light halo on the dark site.
const OPAQUE_WHITE = new Set(['roma-classic']);
async function knockOutWhite(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const light = (i) => Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const i = stack.pop();
    if (seen[i] || light(i) < 225) continue;
    seen[i] = 1;
    data[i * 4 + 3] = 0;
    const x = i % w, y = (i / w) | 0;
    if (x > 0) stack.push(i - 1);
    if (x < w - 1) stack.push(i + 1);
    if (y > 0) stack.push(i - w);
    if (y < h - 1) stack.push(i + w);
  }
  for (let i = 0; i < w * h; i++) {
    if (seen[i]) continue;
    const x = i % w, y = (i / w) | 0;
    const edge = (x > 0 && seen[i - 1]) || (x < w - 1 && seen[i + 1]) || (y > 0 && seen[i - w]) || (y < h - 1 && seen[i + w]);
    if (edge) data[i * 4 + 3] = Math.round(Math.min(255, Math.max(0, (255 - light(i)) * 2.2)));
  }
  return sharp(data, { raw: info }).png().toBuffer();
}
const report = {};
for (const [slug, src] of Object.entries(LOGO_SOURCES)) {
  const svg = src.toLowerCase().endsWith('.svg') ? readFileSync(src, 'utf8') : null;
  const input = svg ? sharp(Buffer.from(svg), { density: 300 }) : sharp(src);
  let png = await input.ensureAlpha().png().toBuffer();
  if (OPAQUE_WHITE.has(slug)) png = await knockOutWhite(png);
  const trimmed = await sharp(png).trim({ threshold: 10 }).png().toBuffer();
  const file = resolve(LOGOS, `${slug}.webp`);
  const info = await sharp(trimmed).resize({ height: 96 }).webp({ quality: 90, alphaQuality: 100 }).toFile(file);
  report[slug] = { file: `logos/${slug}.webp`, width: info.width, height: info.height, bytes: info.size };
}
console.log(JSON.stringify(report, null, 2));
