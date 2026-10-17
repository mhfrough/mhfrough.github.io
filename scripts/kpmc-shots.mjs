// Screenshots of the KPMC public site (Khairpur Municipal Committee, Angular 14, 2022) for its case study.
//   node scripts/kpmc-shots.mjs
// The municipal backend and its domain are gone, so the original build (read only, in D:\workspace-office) is
// rendered against dummy JSON: every request to the API base (envelope {code, message, response}) is fulfilled by
// context.route(). The bundle redirects http to https, and its <base href> is a sub-folder, so the dist folder is
// served from a virtual https origin (https://kpmc.shots.test/<base>/) by the same route handler: a tiny static
// server with index.html fallback, no TLS certificate needed. Everything else (Firebase messaging, fonts CDNs)
// is aborted. Only public pages are captured: the staff back-office (/admin) is shown as my own mockups.
// src/assets/json/contacts.json (real staff names and numbers) is never requested by these pages.
// Output: public/images/kpmc/*.webp (quality 80) and public/images/kpmc/kpmc-logo.webp.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const OUT = resolve(ROOT, 'public/images/kpmc');
mkdirSync(OUT, { recursive: true });
const SRC = 'D:/workspace-office/kpmc_web';
const DIST = `${SRC}/dist/kpmc`; // newest complete build (dist/kpmc_web is an older copy for another sub-folder)
const ORIGIN = 'https://kpmc.shots.test';

// The build's <base href> (a sub-folder on the municipal server).
const BASE = readFileSync(join(DIST, 'index.html'), 'utf8').match(/<base href="([^"]*)"/)?.[1] ?? '/';

// The API base comes from the build's environment (first uncommented BACKEND_URL), not from this file: it was a
// government server and should not be published here.
function detectApi(dist) {
  for (const f of readdirSync(dist).filter((n) => /^main.*\.js$/.test(n))) {
    const m = readFileSync(join(dist, f), 'utf8').match(/^(?!\s*\/\/).*?BACKEND_URL\s*:\s*["'`]([^"'`]+)["'`]/m);
    if (m) return m[1].replace(/\/$/, '');
  }
  throw new Error(`No BACKEND_URL found in ${dist}`);
}
const API = detectApi(DIST);

// ---------------------------------------------------------------------------------------------------------------
// Dummy data. Images are only the bundle's own photos, landmarks only (the bundle's assembly hall and date
// harvest photos show people, so they are not used).
// ---------------------------------------------------------------------------------------------------------------
const img = (p) => `./assets/images/${p}`;
const NEWS = [
  ['Anti-encroachment drive on Station Road', 'slider/4.jpeg', '2023-11-21T09:30:00'],
  ['Drinking water supply restored in Ward 7', 'slider/6.jpeg', '2023-11-14T11:00:00'],
  ['Polio vaccination campaign from Monday', 'about/2.jpeg', '2023-11-06T10:15:00'],
  ['Cleanliness week around the city parks and markets', 'slider/1.jpeg', '2023-10-28T08:45:00'],
  ['New fire tender added to the municipal fleet', 'about/1.jpeg', '2023-10-17T12:00:00'],
  ['District census figures published', 'slider/2.jpg', '2023-10-03T09:00:00'],
].map(([title, photo, date], i) => ({
  id: 120 - i,
  title,
  description: `<p>${title}. Details are available at the Municipal Committee office.</p>`,
  newsDocument: null,
  newsDocumentUrl: img(photo),
  isMobile: true,
  isWeb: true,
  lastModifiedDate: date,
}));

const COUNTERS = { all: 12486, open: 1132, close: 11354 }; // numbers, as the API returned them

function page(content) {
  return { content, totalElements: content.length, totalPages: 1, size: 24, number: 0, first: true, last: true, numberOfElements: content.length, empty: content.length === 0 };
}

// path (after the API base) -> {code, message, response}
function apiResponse(path, method) {
  const ok = (response, message = 'Success') => ({ code: 1, message, response });
  const p = path.replace(/^\/+/, '').split('?')[0];
  if (p === 'complain/counter') return ok(COUNTERS);
  if (p === 'news') return ok(page(NEWS));
  const m = p.match(/^news\/(\d+)/);
  if (m) return ok(NEWS.find((n) => n.id === +m[1]) ?? NEWS[0]);
  if (p === 'press-release' || p === 'tender') return ok(page([]));
  if (method !== 'GET') return ok({});
  return ok(page([]));
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
  if (/contacts\.json$/i.test(clean)) return { status: 404, contentType: 'text/plain', body: 'not served' };
  if (clean && file.startsWith(resolve(DIST)) && existsSync(file) && statSync(file).isFile()) {
    return { status: 200, contentType: TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream', body: readFileSync(file) };
  }
  if (extname(clean)) return { status: 404, contentType: 'text/plain', body: 'not found' };
  return { status: 200, contentType: TYPES['.html'], body: readFileSync(join(DIST, 'index.html')) };
}

// The counters card was laid out for short numbers: with five digits the third counter runs off a 390px screen.
// Phone shots get a slightly tighter version of the bundle's own <=576px rule (smaller type, smaller gaps).
const MOBILE_FIX = [
  '.complains .card-body > .d-flex { gap: .5rem !important; }',
  '.complains .count { gap: .3rem !important; }',
  '.complains .count .count__number { font-size: 1.2rem !important; }',
  '.complains .count .count__description { font-size: .7rem !important; }',
].join('\n');

// Things that only exist because there is no real backend or are irrelevant to the product shot.
const HIDE = [
  '#loader, .version, .swal2-container { display: none !important; }',
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
    locale: 'en-PK',
    timezoneId: 'Asia/Karachi',
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
    if (url.startsWith('data:')) return route.continue();
    return route.abort(); // Firebase, Google Fonts, anything else
  });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem('fcm-token', 'demo');
      localStorage.setItem('deviceID', '00000000-0000-4000-8000-000000000000');
      Notification.requestPermission = () => Promise.resolve('denied');
    } catch {}
  });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log(`  pageerror: ${e.message.split('\n')[0]}`));
  await p.goto(ORIGIN + BASE + path.replace(/^\//, ''), { waitUntil: 'load', timeout: 60_000 });
  await settle(p);
  if (mobile) await p.addStyleTag({ content: MOBILE_FIX });
  if (misses.length) console.log(`  missing files: ${[...new Set(misses)].join(', ')}`);
  return { ctx, page: p };
}

async function settle(p, extra = 900) {
  await p.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
  await p.addStyleTag({ content: HIDE });
  await p.evaluate(async () => {
    for (let y = 0; y < Math.min(document.body.scrollHeight, 6000); y += 500) {
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

// Element shot with some page around it: the union of the given selectors' boxes, padded.
async function shootRegion(p, selectors, name, { pad = 32, width = 1600 } = {}) {
  const box = await p.evaluate(([sels, pd]) => {
    const rects = sels.map((s) => document.querySelector(s)?.getBoundingClientRect()).filter(Boolean);
    const top = Math.min(...rects.map((r) => r.top)) + window.scrollY - pd;
    const bottom = Math.max(...rects.map((r) => r.bottom)) + window.scrollY + pd;
    return { x: 0, y: Math.max(0, top), width: document.documentElement.clientWidth, height: bottom - Math.max(0, top) };
  }, [selectors, pad]);
  await save(await p.screenshot({ clip: box, fullPage: true }), name, width);
}

// ---------------------------------------------------------------------------------------------------------------
// Screenshots (public pages only)
// ---------------------------------------------------------------------------------------------------------------
{
  const { ctx, page: p } = await open('/');
  await save(await p.screenshot(), 'site-home', 1600);
  await shootRegion(p, ['section.complains .card', 'section.services'], 'site-services');
  await shootRegion(p, ['section.app'], 'site-app', { pad: 0 });
  await ctx.close();
}
{
  const { ctx, page: p } = await open('/news-updates');
  await save(await p.screenshot(), 'site-news', 1600);
  await ctx.close();
}
{
  const { ctx, page: p } = await open('/faqs');
  await save(await p.screenshot(), 'site-faqs', 1600);
  await ctx.close();
}
{
  const { ctx, page: p } = await open('/', { mobile: true });
  await save(await p.screenshot(), 'site-mobile', 780);
  await ctx.close();
}

await browser.close();

// ---------------------------------------------------------------------------------------------------------------
// Logo: 96px high WebP, alpha kept.
// ---------------------------------------------------------------------------------------------------------------
{
  const trimmed = await sharp(`${SRC}/src/assets/images/logo.png`).ensureAlpha().trim({ threshold: 10 }).png().toBuffer();
  const info = await sharp(trimmed).resize({ height: 96 }).webp({ quality: 90, alphaQuality: 100 }).toFile(resolve(OUT, 'kpmc-logo.webp'));
  console.log(`kpmc-logo.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(1)} KB`);
}
