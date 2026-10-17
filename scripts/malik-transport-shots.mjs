// Screenshots of the Malik Transport Solutions public site (Angular 16, 2023) for its case study.
//   node scripts/malik-transport-shots.mjs
// The original production build (read only, in D:\workspace-private\malik-transport-solutions\dist) is rendered
// against sample JSON: every request to the API base (envelope {status, message, data}) is fulfilled by
// context.route(), and the dist folder itself is served from a virtual origin (https://mts.shots.test/) by the
// same handler, a tiny static server with index.html fallback. Everything else is aborted, so the real backend is
// never called. The API base is read from the bundle, never written here.
// Only public pages are captured; the customer, admin and driver portal is shown as my own mockups. Hidden in every
// shot: the home slider (its banners carry stock photos of people and the company's phone numbers), and the
// contact block's email, phone and address.
// Output: public/images/malik-transport/*.webp (quality 80) and the favicon truck as malik-transport-mark.webp.
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const OUT = resolve(ROOT, 'public/images/malik-transport');
mkdirSync(OUT, { recursive: true });
const SRC = 'D:/workspace-private/malik-transport-solutions';
const DIST = `${SRC}/dist/malik-transport-solutions`;
const ORIGIN = 'https://mts.shots.test';

// The API base comes from the build's environment (backend_url), not from this file.
function detectApi(dist) {
  for (const f of readdirSync(dist).filter((n) => /^main.*\.js$/.test(n))) {
    const m = readFileSync(join(dist, f), 'utf8').match(/backend_url\s*:\s*["'`]([^"'`]+)["'`]/);
    if (m) return m[1].replace(/\/$/, '');
  }
  throw new Error(`No backend_url found in ${dist}`);
}
const API = detectApi(DIST);

// ---------------------------------------------------------------------------------------------------------------
// Sample data. Vehicle classes and tariffs follow the transporter info page as drafted in the source; addresses
// are public places (a station, a town hall), never customers.
// ---------------------------------------------------------------------------------------------------------------
const VEHICLES = [
  { id: 1, name: 'Station wagon' },
  { id: 2, name: 'Transporter' },
  { id: 3, name: 'Truck 7.5 t' },
  { id: 4, name: 'Truck 12 t' },
];

const tariff = (name, perHalfHour, cap, perKm, wait, extra = '') => ({
  sub_title: name,
  Discription: `€ ${perHalfHour} per half hour or part thereof, but not more than € ${cap}\n€ ${perKm} per load kilometre${extra}\n€ ${wait} per half hour or part thereof waiting charge`,
});
const CARRIERS = [
  {
    title: 'For small boxes',
    image: './assets/images/utilities/ti1.png',
    Discription: [tariff('Transporter', 16, '99.00', '0.99', 10), tariff('Station wagon', 14, '89.00', '0.89', 9)],
  },
  { title: 'For medium boxes', image: './assets/images/utilities/ti2.png', Discription: [tariff('Truck 7.5 t', 19, '169.00', '1.69', 12)] },
  {
    title: 'For heavy boxes',
    image: './assets/images/utilities/ti3.png',
    Discription: [tariff('Truck 12 t', 22, '189.00', '1.89', 14, ' (plus truck toll, if applicable)')],
  },
];

const PLACES = [
  { description: 'Bahnhof Rüdesheim (Rhein), Rüdesheim am Rhein, Germany', lat: 49.9789, lng: 7.9236 },
  { description: 'Hauptbahnhof, Wiesbaden, Germany', lat: 50.0703, lng: 8.2436 },
  { description: 'Rathaus, Mainz, Germany', lat: 49.9995, lng: 8.2752 },
];

function apiResponse(path, method, body) {
  const ok = (data, message = 'Success') => ({ status: true, message, data });
  const p = path.replace(/^\/+/, '');
  const [route, query = ''] = p.split('?');
  if (route === 'banners') return ok({ banners: [] });
  if (route === 'vehicles') return ok(VEHICLES);
  if (route === 'carrier-info') return ok(CARRIERS);
  if (route === 'auto-complete') {
    const q = decodeURIComponent(new URLSearchParams(query).get('address') ?? '').toLowerCase();
    return ok(PLACES.filter((x) => x.description.toLowerCase().includes(q.slice(0, 4))).map(({ description }) => ({ description })));
  }
  if (route === 'search-by-address') {
    const q = decodeURIComponent(new URLSearchParams(query).get('address') ?? '');
    const hit = PLACES.find((x) => x.description === q) ?? PLACES[0];
    return ok([{ geometry: { location: { lat: hit.lat, lng: hit.lng } } }]);
  }
  if (route === 'user/calculate-fare') {
    // Transporter, Rüdesheim to Wiesbaden: 33 km, 41 min. 2 half hours x 16 + 33 x 0.99 = 64.67.
    return ok({
      total_destance: '33.0 km',
      total_time: '41 mins',
      per_km_price: '0.99',
      per_hhr_price: '16',
      max_price_range: '99',
      waiting_charge: '10',
      total_fare: '64.67',
    });
  }
  if (method !== 'GET') return ok({});
  return ok([]);
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf',
};

function staticFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^[\\/]+/, '');
  const file = join(DIST, clean);
  // en.json is an empty file in the build (the keys are English); hand the translator a valid empty object.
  if (/i18n[\\/]en\.json$/.test(clean)) return { status: 200, contentType: TYPES['.json'], body: '{}' };
  if (clean && file.startsWith(resolve(DIST)) && existsSync(file) && statSync(file).isFile()) {
    return { status: 200, contentType: TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream', body: readFileSync(file) };
  }
  if (extname(clean)) return { status: 404, contentType: 'text/plain', body: 'not found' };
  return { status: 200, contentType: TYPES['.html'], body: readFileSync(join(DIST, 'index.html')) };
}

const HIDE = [
  '#loader, ng-http-loader, .swal2-container { display: none !important; }',
  'section.slider { display: none !important; }',
  'section.contact ul.info { display: none !important; }',
  'html { scrollbar-width: none; scroll-behavior: auto !important; } ::-webkit-scrollbar { display: none; }',
  '*, *::before, *::after { caret-color: transparent !important; }',
].join('\n');

const browser = await chromium.launch();

async function open(path, { mobile = false } = {}) {
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
    locale: 'en-GB',
    timezoneId: 'Europe/Berlin',
  });
  const misses = [];
  await ctx.route('**/*', async (route) => {
    const req = route.request();
    const url = req.url();
    if (url.startsWith(API)) {
      const body = apiResponse(url.slice(API.length), req.method(), req.postData());
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' },
        body: JSON.stringify(body),
      });
    }
    if (url.startsWith(ORIGIN)) {
      const r = staticFile(new URL(url).pathname);
      if (r.status === 404) misses.push(new URL(url).pathname);
      return route.fulfill(r);
    }
    if (url.startsWith('data:')) return route.continue();
    return route.abort();
  });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log(`  pageerror: ${e.message.split('\n')[0]}`));
  await p.goto(`${ORIGIN}${path}`, { waitUntil: 'load', timeout: 60_000 });
  await p.addStyleTag({ content: HIDE });
  await settleImages(p);
  if (misses.length) console.log(`  missing files: ${[...new Set(misses)].join(', ')}`);
  return { ctx, page: p };
}

// Waits until every image on the page has really loaded (complete with pixels), CSS background images included.
// Scrolls through first so lazy images start, then back to the top. Throws instead of saving a half-loaded shot.
// Images that are not rendered at all (display: none, such as the desktop-hidden menu icon) are skipped.
async function settleImages(p) {
  await p.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
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
      () => [...document.images].filter((i) => i.getClientRects().length).every((i) => i.complete && (i.naturalWidth > 0 || !i.currentSrc)),
      null,
      { timeout: 60_000, polling: 250 },
    );
  } catch {
    const broken = await p.evaluate(() =>
      [...document.images].filter((i) => i.getClientRects().length && !(i.complete && i.naturalWidth > 0)).map((i) => i.currentSrc || i.src),
    );
    throw new Error(`images did not load: ${broken.join(', ')}`);
  }
  // CSS backgrounds: load every url() in use and wait for it.
  await p.evaluate(async () => {
    const urls = new Set();
    for (const el of document.querySelectorAll('*')) {
      const bg = getComputedStyle(el).backgroundImage;
      for (const m of bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)) urls.add(m[1]);
    }
    await Promise.all(
      [...urls].map((u) => new Promise((r) => { const i = new Image(); i.onload = i.onerror = r; i.src = u; })),
    );
  });
  await p.waitForLoadState('networkidle');
  await p.waitForTimeout(1200);
}

async function save(buf, name, width) {
  const info = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(resolve(OUT, `${name}.webp`));
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

async function shootRegion(p, selectors, name, { pad = 32, width = 1600 } = {}) {
  const box = await p.evaluate(([sels, pd]) => {
    const rects = sels.flatMap((s) => [...document.querySelectorAll(s)].map((e) => e.getBoundingClientRect())).filter((r) => r.height > 0);
    if (!rects.length) throw new Error(`no element for ${sels.join(', ')}`);
    const top = Math.min(...rects.map((r) => r.top)) + window.scrollY - pd;
    const bottom = Math.max(...rects.map((r) => r.bottom)) + window.scrollY + pd;
    return { x: 0, y: Math.max(0, top), width: document.documentElement.clientWidth, height: bottom - Math.max(0, top) };
  }, [selectors, pad]);
  await save(await p.screenshot({ clip: box, fullPage: true }), name, width);
}

// Picks an address in one of the calculator's ng-select search boxes.
async function pickAddress(p, id, text) {
  await p.click(`#${id} .ng-select-container`);
  await p.keyboard.type(text, { delay: 40 });
  const opt = p.locator(`#${id} .ng-option`).filter({ hasText: text }).first();
  await opt.waitFor({ timeout: 10_000 });
  await opt.click();
  await p.waitForTimeout(400);
}

// Vehicle, two addresses, Calculate fare: the sample API answers with the fare breakdown.
async function fillCalculator(p) {
  await p.click('#vehicle_id .ng-select-container');
  await p.locator('#vehicle_id .ng-option').filter({ hasText: 'Transporter' }).first().click();
  await pickAddress(p, 'fromLocation', 'Bahnhof');
  await pickAddress(p, 'toLocation', 'Hauptbahnhof');
  await p.click('button[type=submit]');
  await p.locator('#total_fare').waitFor();
  await p.mouse.move(0, 0);
  await p.evaluate(() => document.activeElement?.blur());
  await p.waitForTimeout(600);
}

// ---------------------------------------------------------------------------------------------------------------
// Screenshots (public pages only)
// ---------------------------------------------------------------------------------------------------------------
{
  const { ctx, page: p } = await open('/');
  await save(await p.screenshot(), 'site-home', 1600);
  await shootRegion(p, ['section.about', 'section.stats'], 'site-company', { pad: 0 });
  await ctx.close();
}
{
  const { ctx, page: p } = await open('/price-calculator');
  await fillCalculator(p);
  await shootRegion(p, ['section.calculator .title', 'section.calculator form'], 'site-calculator', { pad: 40 });
  await ctx.close();
}
{
  const { ctx, page: p } = await open('/transporter-info');
  await shootRegion(p, ['section.services'], 'site-tariffs', { pad: 0, width: 1400 });
  await ctx.close();
}
{
  // Phone: the calculator with a fare worked out.
  const { ctx, page: p } = await open('/price-calculator', { mobile: true });
  await fillCalculator(p);
  // The photo banner above the form is left out so the form sits under the header, at the top of the page.
  await p.addStyleTag({ content: 'section.banner { display: none !important; }' });
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(600);
  await save(await p.screenshot(), 'site-mobile', 780);
  await ctx.close();
}

await browser.close();

// ---------------------------------------------------------------------------------------------------------------
// Mark: the truck from the site's favicon, trimmed, 128px high, alpha kept.
// ---------------------------------------------------------------------------------------------------------------
{
  const ico = readFileSync(`${SRC}/src/favicon.ico`);
  let png;
  for (let i = 0; i < ico.readUInt16LE(4); i++) {
    const o = 6 + i * 16;
    const size = ico.readUInt32LE(o + 8);
    const off = ico.readUInt32LE(o + 12);
    if ((ico[o] || 256) === 256) png = ico.subarray(off, off + size);
  }
  // The icon also carries the white MTS wordmark under the truck (invisible on a white tab). Keep the truck only:
  // cut at the first fully transparent row band below it.
  const { data, info: meta } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const filled = (y) => { for (let x = 0; x < meta.width; x++) if (data[(y * meta.width + x) * 4 + 3] > 10) return true; return false; };
  let y = 0;
  while (y < meta.height && !filled(y)) y++;
  while (y < meta.height && filled(y)) y++;
  const truck = await sharp(png).extract({ left: 0, top: 0, width: meta.width, height: y }).png().toBuffer();
  const trimmed = await sharp(truck).ensureAlpha().trim({ threshold: 10 }).png().toBuffer();
  const info = await sharp(trimmed).resize({ height: 128 }).webp({ quality: 90, alphaQuality: 100 }).toFile(resolve(OUT, 'malik-transport-mark.webp'));
  console.log(`malik-transport-mark.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(1)} KB`);
}
