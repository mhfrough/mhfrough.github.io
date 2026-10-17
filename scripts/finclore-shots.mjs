// Screenshots of the Finclore public site (US company formation, Angular 15, 2023 to 2024) for its case study.
//   node scripts/finclore-shots.mjs
// The live domain is gone, so the newest complete build in the original repo (read only, in D:\workspace-office)
// is rendered against dummy JSON. The bundle reads its API base from localStorage('endpoint') before falling back
// to its environment, so an init script points it at a virtual host (https://api.finclore.test/) and
// context.route() fulfils every call with the bundle's envelope {code, message, data}. The real backend host is
// never read or written here. The dist folder (its <base href> is a sub-folder) is served from a virtual https
// origin by the same route handler: a tiny static server with index.html fallback, no TLS certificate needed.
// Google Fonts (the Material Symbols icon font) may load; everything else (analytics, pixel, sign-in, chat
// widgets, the YouTube embed) is aborted. Only public pages are captured: the customer portal and the back office
// are shown as my own mockups. The home page testimonials and client logos are never captured.
// Output: public/images/finclore/*.webp (quality 80), the two wordmarks and the favicon sizes.
//   --assets-only skips the browser shots.
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const OUT = resolve(ROOT, 'public/images/finclore');
mkdirSync(OUT, { recursive: true });
const SRC = 'D:/workspace-office/finclore-web';
const DIST = `${SRC}/dist/finclore`; // v0.0.43 build (Jul 2024); dist/finclore-new is an older copy
const ORIGIN = 'https://finclore.shots.test';
const API = 'https://api.finclore.test/';

// The build's <base href> (a sub-folder on the staging server).
const BASE = readFileSync(join(DIST, 'index.html'), 'utf8').match(/<base href="([^"]*)"/)?.[1] ?? '/';

// ---------------------------------------------------------------------------------------------------------------
// Dummy data, shaped like the API the bundle expects. Prices are the public site's own starting prices; timelines
// and requirements are samples.
// ---------------------------------------------------------------------------------------------------------------
const price = (description, amount) => ({ id: description, description, amount, currencySymbol: '$' });
const SERVICES = [
  {
    heading: 'US Company Registration',
    subHeading: 'Form an LLC or a C-Corp in the state you choose, with a registered agent and a business address for the first year.',
    pricingBeans: [price('Starting from', 120)],
    requirementBeans: ['Company name and a second choice', 'Members and their ownership', 'A copy of your passport'],
    timelineBeans: [['State filing', '2 to 5 business days']],
  },
  {
    heading: 'EIN Registration',
    subHeading: 'Your Employer Identification Number from the IRS, needed for a business bank account and for taxes.',
    pricingBeans: [price('Starting from', 99)],
    requirementBeans: ['Formed company documents', 'Responsible party details'],
    timelineBeans: [['IRS processing', 'Up to 90 days for non-US citizens']],
  },
  {
    heading: 'Complete Package',
    subHeading: 'Company registration, EIN and help opening a business bank account, in one order.',
    pricingBeans: [price('One payment', 349)],
    requirementBeans: ['Everything listed for registration and EIN'],
    timelineBeans: [['End to end', 'Depends on the state and the IRS']],
  },
  {
    heading: 'US Virtual Mailing Address',
    subHeading: 'A standard or unique mailing address in several US states for your company’s official mail.',
    pricingBeans: [price('Per year', 0)],
    requirementBeans: ['Formed company documents'],
    timelineBeans: [['Set up', '1 business day']],
  },
  {
    heading: 'Annual Report Filing',
    subHeading: 'We file the yearly report the state asks for, with your officers, directors and shareholders.',
    pricingBeans: [price('Per filing', 0)],
    requirementBeans: ['Company details for the year'],
    timelineBeans: [['Before', 'Your state’s due date']],
  },
  {
    heading: 'Logo Design',
    subHeading: 'A logo for the new company, briefed in the customer portal with its name, slogan and colours.',
    pricingBeans: [price('Starting from', 0)],
    requirementBeans: ['Company name and industry', 'Two brand colours'],
    timelineBeans: [['First drafts', '3 business days']],
  },
].map((s, i) => ({
  id: i + 1,
  status: { id: 1, name: 'Active' },
  ...s,
  requirementBeans: s.requirementBeans.map((description, j) => ({ id: j + 1, description })),
  timelineBeans: s.timelineBeans.map(([description, time], j) => ({ id: j + 1, description, time })),
}));

// The marquee (the back office "ticker"): one sample announcement.
const ALERTS = [{ title: 'Sample notice', description: 'Wyoming and Delaware filings are being processed within two business days.' }];

function apiResponse(path, method) {
  const ok = (data, message = 'Success') => ({ code: 1, message, data, response: data });
  const p = path.replace(/^\/+/, '').split('?')[0];
  if (p === 'finclore-services') return ok(SERVICES);
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

// Things that only exist because there is no real backend, or that are not the product: the boot loader, alert
// dialogs, the cookie bar, chat launchers and the (aborted) YouTube embed, drawn as a quiet video placeholder.
const HIDE = [
  '#loader, .swal2-container, app-cookies, .cookies, [class*="fc-widget"], #fc_frame, [id*="o2"], iframe[src*="o2"] { display: none !important; }',
  'iframe[src*="youtube"] { visibility: hidden; } .how-to .content { position: relative; }',
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
    locale: 'en-US',
    timezoneId: 'America/New_York',
  });
  const misses = [];
  await ctx.route('**/*', async (route) => {
    const req = route.request();
    const url = req.url();
    if (url.startsWith(API)) {
      const body = apiResponse(url.slice(API.length), req.method());
      return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }, body: JSON.stringify(body) });
    }
    if (url.startsWith(ORIGIN)) {
      const r = staticFile(new URL(url).pathname);
      if (r.status === 404) misses.push(new URL(url).pathname);
      return route.fulfill(r);
    }
    if (url.startsWith('data:') || /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url)) return route.continue();
    return route.abort(); // analytics, pixel, Google sign-in, chat, YouTube
  });
  await ctx.addInitScript((api) => {
    try {
      localStorage.setItem('endpoint', api);
      localStorage.setItem('cookies', 'true');
      Notification.requestPermission = () => Promise.resolve('denied');
    } catch {}
  }, API);
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

async function save(buf, name, width) {
  const file = resolve(OUT, `${name}.webp`);
  const info = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(file);
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

// A full viewport (16:10, like the hero shot) starting just above the element, so detail shots share one shape.
// The site's header is sticky, so the element starts below it, not under it.
async function shootFrom(p, selector, name, { gap = 24, hide = '' } = {}) {
  if (hide) await p.addStyleTag({ content: `${hide} { display: none !important; }` });
  const top = await p.evaluate(([sel, g]) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const sticky = [...document.querySelectorAll('body *')].filter((e) => getComputedStyle(e).position === 'sticky');
    const head = Math.max(0, ...sticky.map((e) => e.getBoundingClientRect().height));
    return Math.max(0, el.getBoundingClientRect().top + window.scrollY - head - g);
  }, [selector, gap]);
  if (top === null) return console.log(`  ${name}: nothing matched ${selector}`);
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top);
  await p.waitForTimeout(700);
  await save(await p.screenshot(), name, 1600);
}

// The hero types its services in turn and cross-fades its photos every 3 s. Wait for a switch, then let it settle,
// so the shot never lands mid-fade.
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
  {
    const { ctx, page: p } = await open('/');
    await steadyBanner(p);
    await save(await p.screenshot(), 'site-home', 1600);
    // The blog grid has no sample posts (the bundle's placeholder photos are not ours to show), so it is hidden.
    await shootFrom(p, 'app-how-to', 'site-steps', { gap: 0 });
    await shootFrom(p, 'section.add-ons', 'site-addons', { hide: 'app-blog-grid' });
    await ctx.close();
  }
  {
    const { ctx, page: p } = await open('/services');
    await save(await p.screenshot(), 'site-services', 1600);
    await ctx.close();
  }
  {
    const { ctx, page: p } = await open('/', { mobile: true });
    await steadyBanner(p);
    await save(await p.screenshot(), 'site-mobile', 780);
    await ctx.close();
  }
}

await browser.close();

// ---------------------------------------------------------------------------------------------------------------
// Brand assets: the wordmark at its native 433 x 88 (navy and red for the light header, one light grey for the
// dark footer), and the favicon's own 16, 32 and 48 px bitmaps, unscaled and lossless so the page can magnify the
// real pixels. The F. monogram itself is redrawn as SVG by hand (public/images/finclore/finclore-mark.svg).
// ---------------------------------------------------------------------------------------------------------------
{
  for (const [src, name] of [['logo.png', 'finclore-wordmark'], ['footer/logo.png', 'finclore-wordmark-light']]) {
    const info = await sharp(`${SRC}/src/assets/images/${src}`).webp({ lossless: true }).toFile(resolve(OUT, `${name}.webp`));
    console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(1)} KB`);
  }

  // favicon.ico holds a 256 PNG and 128, 64, 48, 32, 16 px 32-bit BMPs (bottom-up BGRA, height doubled for the mask).
  const ico = readFileSync(`${SRC}/src/favicon.ico`);
  for (let i = 0; i < ico.readUInt16LE(4); i++) {
    const o = 6 + i * 16;
    const w = ico[o] || 256;
    if (![16, 32, 48].includes(w)) continue;
    const off = ico.readUInt32LE(o + 12);
    const hs = ico.readUInt32LE(off);
    const W = ico.readInt32LE(off + 4);
    const H = ico.readInt32LE(off + 8) / 2;
    const px = Buffer.alloc(W * H * 4);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const s = off + hs + ((H - 1 - y) * W + x) * 4;
        const d = (y * W + x) * 4;
        px[d] = ico[s + 2];
        px[d + 1] = ico[s + 1];
        px[d + 2] = ico[s];
        px[d + 3] = ico[s + 3];
      }
    }
    const f = await sharp(px, { raw: { width: W, height: H, channels: 4 } }).webp({ lossless: true }).toFile(resolve(OUT, `favicon-${W}.webp`));
    console.log(`favicon-${W}.webp ${f.width}x${f.height} ${f.size} B`);
  }
}
