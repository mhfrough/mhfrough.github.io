// Screenshots of the LLC SAVVY public site (US company formation, Angular 15, Jan to Aug 2024) for its case study.
//   node scripts/llcsavvy-shots.mjs
// The live domain no longer resolves, so the newest complete build in the original repo (read only, in
// D:\workspace-office) is rendered against dummy JSON. This production bundle prefixes every API call with the host
// baked into its environment, so context.route() recognises API calls by their path alone (whatever the host) and
// fulfils them with the bundle's envelope {code, message, data}; nothing ever reaches a real server. The backend
// host is never read or written here. The dist folder (its <base href> is a sub-folder) is served from a virtual https origin
// by the same route handler: a tiny static server with index.html fallback, no TLS certificate needed.
// Google Fonts (the Material Symbols icon font) may load; everything else (analytics, pixel, sign-in, chat widget)
// is aborted. Only public pages are captured: the customer portal and the back office are shown as my own mockups.
// The hero slider shows the bundle's own stock artwork (the same files Finclore's build ships). The testimonials,
// the client logos and the contact phone number are never captured: those sections are hidden.
// Output: public/images/llcsavvy/*.webp (quality 80), the wordmark and the favicon mark.
//   --assets-only skips the browser shots.
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const OUT = resolve(ROOT, 'public/images/llcsavvy');
mkdirSync(OUT, { recursive: true });
const SRC = 'D:/workspace-office/llcsavvy_web';
const DIST = `${SRC}/dist/llcsavvy`; // Jul 2024 build
const ORIGIN = 'https://llcsavvy.shots.test';
// API calls, recognised by path whatever their host: the last segments name the endpoint.
const API_PATH = /\/(llcsavvy-services|alert-notification\/\w+|blog|counter)(\?.*)?$/;

// The build's <base href> (a sub-folder on the staging server).
const BASE = readFileSync(join(DIST, 'index.html'), 'utf8').match(/<base href="([^"]*)"/)?.[1] ?? '/';

// ---------------------------------------------------------------------------------------------------------------
// Dummy data, shaped like the API the bundle expects. The $102 and $296 prices are the public site's own (the
// banner and the complete-package band); timelines, requirements and the other prices are samples. Ids 6 and 9 are
// the ones the templates mark "+ State Fee".
// ---------------------------------------------------------------------------------------------------------------
const price = (description, amount) => ({ id: description, description, amount, currencySymbol: '$' });
const SERVICES = [
  {
    id: 6,
    heading: 'US LLC Registration',
    subHeading: 'Form an LLC in the state you choose as a non-resident, with a registered agent and a business address for the first year.',
    pricingBeans: [price('Starting from', 102)],
    requirementBeans: ['Company name and a second choice', 'Members and their ownership', 'A copy of your passport'],
    timelineBeans: [['State filing', '2 to 5 business days']],
  },
  {
    id: 2,
    heading: 'EIN Registration',
    subHeading: 'Your Employer Identification Number from the IRS, needed for a business bank account and for taxes.',
    pricingBeans: [price('Starting from', 99)],
    requirementBeans: ['Formed company documents', 'Responsible party details'],
    timelineBeans: [['IRS processing', 'Up to 90 days for non-US citizens']],
  },
  {
    id: 3,
    heading: 'Complete LLC Package',
    subHeading: 'A fully formed LLC, EIN, business address and help opening a business bank account, in one order.',
    pricingBeans: [price('One payment', 296)],
    requirementBeans: ['Everything listed for registration and EIN'],
    timelineBeans: [['End to end', 'Depends on the state and the IRS']],
  },
  {
    id: 9,
    heading: 'Annual Report Filing',
    subHeading: 'We file the yearly report the state asks for, with your officers, directors and shareholders.',
    pricingBeans: [price('Per filing', 49)],
    requirementBeans: ['Company details for the year'],
    timelineBeans: [['Before', 'Your state’s due date']],
  },
  {
    id: 5,
    heading: 'Corporate Tax Filing',
    subHeading: 'Annual federal and state returns filed for the structure and the income of your company.',
    pricingBeans: [price('Per year', 0)],
    requirementBeans: ['Bank statements for the year', 'Company formation documents'],
    timelineBeans: [['Before', 'The IRS due date']],
  },
  {
    id: 7,
    heading: 'Bookkeeping',
    subHeading: 'Monthly books kept in order so that tax season is a review, not a rescue.',
    pricingBeans: [price('Per month', 0)],
    requirementBeans: ['Read access to your business bank account'],
    timelineBeans: [['Reports', 'Monthly']],
  },
].map((s) => ({
  status: { id: 1, name: 'Active' },
  ...s,
  requirementBeans: s.requirementBeans.map((description, j) => ({ id: j + 1, description })),
  timelineBeans: s.timelineBeans.map(([description, time], j) => ({ id: j + 1, description, time })),
}));

// The marquee (the back office "ticker"): one sample announcement.
const ALERTS = [{ title: 'Sample notice', description: 'Wyoming and New Mexico filings are being processed within two business days.' }];

function apiResponse(path, method) {
  const ok = (data, message = 'Success') => ({ code: 1, message, data, response: data });
  const p = path.replace(/^\/+/, '').split('?')[0];
  if (p === 'llcsavvy-services') return ok(SERVICES);
  if (p.startsWith('alert-notification')) return ok(ALERTS);
  if (p === 'blog') return ok({ blogBeans: [], paginationBean: { totalElements: 0, totalPages: 1 } });
  if (p === 'counter') return ok([]);
  if (method !== 'GET') return ok({});
  return ok([]);
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf',
};

// Static file from the dist folder (served under BASE), falling back to index.html for client routes.
function staticFile(urlPath) {
  const rel = urlPath.startsWith(BASE) ? urlPath.slice(BASE.length) : urlPath;
  const clean = normalize(decodeURIComponent(rel)).replace(/^[\\/]+/, '');
  const file = join(DIST, clean);
  if (clean && file.startsWith(resolve(DIST)) && existsSync(file) && statSync(file).isFile()) {
    return { status: 200, contentType: TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream', body: readFileSync(file) };
  }
  if (extname(clean)) return { status: 404, contentType: 'text/plain', body: 'not found' };
  return { status: 200, contentType: TYPES['.html'], body: readFileSync(join(DIST, 'index.html')) };
}

// Things that only exist because there is no real backend, or that are not ours to show: the boot loader, alert
// dialogs, the cookie bar, the chat launcher, the testimonials and client logos. The photo collages below the
// steps only peek into the edge of the steps shot, so they stay hidden there.
const HIDE = [
  '#loader, .swal2-container, app-cookies, .cookies, [class*="fc-widget"], #fc_frame, [id*="o2"], iframe[src*="o2"] { display: none !important; }',
  'app-reviews, app-clients, .why-choose { display: none !important; }',
  'app-incorporate .illustration, app-info img[src*="info.png"] { visibility: hidden !important; }',
  'html { scrollbar-width: none; scroll-behavior: auto !important; } ::-webkit-scrollbar { display: none; }',
  '*, *::before, *::after { caret-color: transparent !important; }',
].join('\n');

async function open(browser, path, { mobile = false } = {}) {
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
    locale: 'en-US',
    timezoneId: 'Asia/Karachi',
  });
  const misses = [];
  await ctx.route('**/*', async (route) => {
    const req = route.request();
    const url = req.url();
    if (url.startsWith(ORIGIN)) {
      const r = staticFile(new URL(url).pathname);
      if (r.status === 404) misses.push(new URL(url).pathname);
      return route.fulfill(r);
    }
    if (url.startsWith('data:') || /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url)) return route.continue();
    if (['xhr', 'fetch'].includes(req.resourceType())) {
      const m = new URL(url).pathname.match(API_PATH);
      const body = apiResponse(m ? m[1] : '', req.method());
      const headers = { 'access-control-allow-origin': ORIGIN, 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
      return route.fulfill({ status: 200, contentType: 'application/json', headers, body: JSON.stringify(body) });
    }
    return route.abort(); // analytics, pixel, Google sign-in, chat
  });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem('cookies', 'true');
      Notification.requestPermission = () => Promise.resolve('denied');
    } catch {}
  });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log(`  pageerror: ${e.message.split('\n')[0]}`));
  await p.goto(ORIGIN + BASE + path.replace(/^\//, ''), { waitUntil: 'load', timeout: 60_000 });
  await settle(p);
  if (misses.length) console.log(`  missing files: ${[...new Set(misses)].join(', ')}`);
  return { ctx, page: p };
}

async function settle(p, extra = 900) {
  await p.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
  await p.addStyleTag({ content: HIDE });
  await p.evaluate(async () => {
    for (let y = 0; y < Math.min(document.body.scrollHeight, 9000); y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    const pending = [...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; }));
    await Promise.race([Promise.all(pending), new Promise((r) => setTimeout(r, 3000))]);
  });
  await p.waitForTimeout(extra);
}

// Waits until every image on the page has really loaded (complete with pixels), CSS background images included.
// Scrolls through first so lazy images start, then back to the top. Throws instead of saving a half-loaded shot.
// Images inside sections hidden with display: none (testimonials, client logos) never render, so never load, and
// are not in any shot: they are skipped.
async function settleImages(p) {
  const y0 = await p.evaluate(() => window.scrollY);
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await document.fonts.ready;
    // CSS background images: preload every url() in use and wait for each.
    const urls = new Set();
    for (const el of document.querySelectorAll('*')) {
      const bg = getComputedStyle(el).backgroundImage;
      for (const m of bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)) if (!m[1].startsWith('data:')) urls.add(m[1]);
    }
    await Promise.all(
      [...urls].map(
        (u) =>
          new Promise((r) => {
            const i = new Image();
            i.onload = i.onerror = r;
            i.src = u;
            setTimeout(r, 30_000);
          }),
      ),
    );
  });
  const pending = () =>
    [...document.images].filter((i) => i.getClientRects().length && !(i.complete && (i.naturalWidth > 0 || !i.currentSrc)));
  try {
    await p.waitForFunction(`(${pending.toString()})().length === 0`, null, { timeout: 60_000, polling: 250 });
  } catch {
    const broken = await p.evaluate(`(${pending.toString()})().map((i) => i.currentSrc || i.src)`);
    throw new Error(`images did not load: ${broken.join(', ')}`);
  }
  await p.waitForLoadState('networkidle');
  await p.waitForTimeout(1200); // let decoding and any fade-in finish
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y0);
}

async function save(buf, name, width) {
  const file = resolve(OUT, `${name}.webp`);
  const info = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(file);
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

// A full viewport (16:10, like the hero shot) starting just above the element, so detail shots share one shape.
async function shootFrom(p, selector, name, { gap = 24 } = {}) {
  const top = await p.evaluate(([sel, g]) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const fixed = [...document.querySelectorAll('header, header *')].filter((e) => ['sticky', 'fixed'].includes(getComputedStyle(e).position));
    const head = Math.max(0, ...fixed.map((e) => e.getBoundingClientRect().bottom));
    return Math.max(0, el.getBoundingClientRect().top + window.scrollY - head - g);
  }, [selector, gap]);
  if (top === null) return console.log(`  ${name}: nothing matched ${selector}`);
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top);
  await p.waitForTimeout(700);
  await settleImages(p);
  await save(await p.screenshot(), name, 1600);
}

// The banner types its services in turn. Wait for a switch, then let it settle, so the shot never lands mid-fade.
async function steadyBanner(p) {
  await p.evaluate(
    () =>
      new Promise((done) => {
        const el = document.querySelector('.text-animation');
        if (!el) return done();
        const mo = new MutationObserver(() => {
          mo.disconnect();
          setTimeout(done, 1300);
        });
        mo.observe(el, { subtree: true, attributes: true, attributeFilter: ['class'] });
        setTimeout(done, 6000);
      }),
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Screenshots (public pages only)
// ---------------------------------------------------------------------------------------------------------------
if (!process.argv.includes('--assets-only')) {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  {
    const { ctx, page: p } = await open(browser, '/');
    await settleImages(p);
    await steadyBanner(p);
    await save(await p.screenshot(), 'site-home', 1600);
    await shootFrom(p, 'app-how-to', 'site-steps', { gap: 0 });
    await shootFrom(p, 'section.add-ons', 'site-addons', { gap: 0 });
    await ctx.close();
  }
  {
    const { ctx, page: p } = await open(browser, '/services');
    await settleImages(p);
    await save(await p.screenshot(), 'site-services', 1600);
    await ctx.close();
  }
  {
    const { ctx, page: p } = await open(browser, '/', { mobile: true });
    await settleImages(p);
    await steadyBanner(p);
    await save(await p.screenshot(), 'site-mobile', 780);
    await ctx.close();
  }
  await browser.close();
}

// ---------------------------------------------------------------------------------------------------------------
// Brand assets: the wordmark (white letters, for the navy header) at its native size, and the favicon's own 256 px
// PNG (the globe: US stripes with a green crescent and star), trimmed and saved as the project mark.
// ---------------------------------------------------------------------------------------------------------------
{
  const info = await sharp(`${SRC}/src/assets/images/logo.png`).webp({ lossless: true }).toFile(resolve(OUT, 'llcsavvy-wordmark-light.webp'));
  console.log(`llcsavvy-wordmark-light.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(1)} KB`);

  // favicon.ico entry 0 is a 256 px PNG; the rest are BMPs.
  const ico = readFileSync(`${SRC}/src/favicon.ico`);
  for (let i = 0; i < ico.readUInt16LE(4); i++) {
    const o = 6 + i * 16;
    const size = ico.readUInt32LE(o + 8);
    const off = ico.readUInt32LE(o + 12);
    const png = ico.subarray(off, off + size);
    if (png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') continue;
    const mark = await sharp(png).trim({ threshold: 1 }).resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 90, alphaQuality: 100 }).toFile(resolve(OUT, 'llcsavvy-mark.webp'));
    console.log(`llcsavvy-mark.webp ${mark.width}x${mark.height} ${(mark.size / 1024).toFixed(1)} KB`);
    break;
  }
}
