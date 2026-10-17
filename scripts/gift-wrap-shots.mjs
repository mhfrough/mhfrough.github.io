// Screenshots of the Gift Wrap storefront (thesis project, Angular 17, June 2026) for its case study.
//   node scripts/gift-wrap-shots.mjs
// The archived build (read only, D:\workspace-personal\archive\gift-wrap\gift-wrap-frontend\dist) is served from
// a virtual origin (https://giftwrap.shots.test) by Playwright's route handler: a tiny static server with an
// index.html fallback, so nothing listens on a port and nothing needs stopping. The app has no backend: its
// catalogue is in-memory sample data, and its photos are stock images from Unsplash and Pexels, which load from
// their CDNs. Service workers are blocked. The basket and cart are filled by clicking through the real UI, with
// a sample gift note. The home page testimonials (sample names) and the site footer (which credits a private
// person by name) are never captured.
// Output: public/images/gift-wrap/*.webp (quality 80) and public/images/gift-wrap/gift-wrap-logo.webp.
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const OUT = resolve(ROOT, 'public/images/gift-wrap');
mkdirSync(OUT, { recursive: true });
const SRC = 'D:/workspace-personal/archive/gift-wrap/gift-wrap-frontend';
const DIST = `${SRC}/dist/gift-wrap-frontend/browser`;
const ORIGIN = 'https://giftwrap.shots.test';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
};

function serve(pathname) {
  const rel = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, '');
  let file = join(DIST, rel);
  if (!file.startsWith(normalize(DIST)) || !existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html');
  return { status: 200, contentType: TYPES[extname(file)] ?? 'application/octet-stream', body: readFileSync(file) };
}

// Hide scrollbars, the hero's particle canvas and toasts; show scroll-reveal sections without waiting.
const CALM = `
html{scrollbar-width:none;scroll-behavior:auto!important}::-webkit-scrollbar{display:none}
gw-particles,gw-toast{display:none!important}
[gwreveal],.reveal{opacity:1!important;transform:none!important}`;

const browser = await chromium.launch();

async function open(path, viewport, scale) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: scale,
    colorScheme: 'light',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
  });
  await ctx.route(`${ORIGIN}/**`, (route) => route.fulfill(serve(new URL(route.request().url()).pathname)));
  const page = await ctx.newPage();
  await page.goto(ORIGIN + path, { waitUntil: 'load', timeout: 90_000 });
  await page.addStyleTag({ content: CALM });
  await settle(page);
  return { ctx, page };
}

/** Walk the page once so lazy images load, then return to the top. */
async function settle(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await photos(page);
  await page.waitForTimeout(900);
}

/**
 * Wait for every photo (stock CDN images) to decode. Lazy images are switched to eager first; any that stall are
 * requested once more with a cache-busting parameter.
 */
async function photos(page) {
  const done = () => [...document.images].every((i) => i.complete && i.naturalWidth > 0);
  await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager')));
  for (let attempt = 0; attempt < 3; attempt++) {
    const ok = await page.waitForFunction(done, null, { timeout: 25_000 }).then(() => true, () => false);
    if (ok) return;
    await page.evaluate((n) => {
      for (const i of document.images) {
        if (i.complete && i.naturalWidth > 0) continue;
        const u = new URL(i.currentSrc || i.src, location.href);
        u.searchParams.set('retry', String(n));
        i.src = u.href;
      }
    }, attempt + 1);
  }
  console.warn('  some images did not load');
}

async function save(buf, name, width) {
  const file = resolve(OUT, `${name}.webp`);
  const info = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(file);
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

/** Build a sample basket in the studio, clicking the real controls. */
async function buildBasket(page) {
  await page.locator('.base-card').nth(1).click(); // Signature Gift Box
  await page.locator('.wrap-card').nth(2).click(); // Rose Satin
  await page.locator('.ribbon-dot').nth(1).click(); // Wine
  // Add buttons turn into quantity steppers once clicked, so pick each card by position.
  for (const i of [0, 3, 4]) await page.locator('.item-card').nth(i).locator('.add-full').click();
  await page.locator('textarea.note').fill('Happy birthday! A little box of good things, wrapped just for you.');
  await page.waitForTimeout(300);
}

// ---------------------------------------------------------------- desktop, 1440 x 900 at 1.5x
{
  const { ctx, page } = await open('/', { width: 1440, height: 900 }, 1.5);
  await save(await page.screenshot(), 'site-home', 1600);

  // Shop all: the category chips and product grid.
  await page.goto(ORIGIN + '/products', { waitUntil: 'load' });
  await page.addStyleTag({ content: CALM });
  await settle(page);
  await save(await page.screenshot(), 'site-shop', 1600);

  // Product details.
  await page.goto(ORIGIN + '/product/p4', { waitUntil: 'load' });
  await page.addStyleTag({ content: CALM });
  await settle(page);
  await save(await page.screenshot(), 'site-product', 1600);

  // The build-a-basket studio, filled in: steps on the left, live summary on the right.
  await page.goto(ORIGIN + '/customize', { waitUntil: 'load' });
  await page.addStyleTag({ content: CALM });
  await settle(page);
  await buildBasket(page);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(500);
  // Clip to the studio itself: the newsletter band and footer below are left out.
  const bottom = await page.locator('.cz-grid').evaluate((el) => el.getBoundingClientRect().bottom + window.scrollY);
  await save(await page.screenshot({ fullPage: true, clip: { x: 0, y: 0, width: 1440, height: Math.ceil(bottom) + 32 } }), 'site-studio', 1600);

  // Cart with the custom basket and one ready-made gift.
  await page.locator('.summary .btn-brand').click();
  await page.waitForURL('**/cart');
  await page.goto(ORIGIN + '/product/p7', { waitUntil: 'load' });
  await page.addStyleTag({ content: CALM });
  await page.getByRole('button', { name: /add to cart/i }).first().click();
  await page.goto(ORIGIN + '/cart', { waitUntil: 'load' });
  await page.addStyleTag({ content: CALM });
  await settle(page);
  await save(await page.screenshot(), 'site-cart', 1600);
  await ctx.close();
}

// ---------------------------------------------------------------- mobile, 390 x 844 at 2x
{
  const { ctx, page } = await open('/customize', { width: 390, height: 844 }, 2);
  await buildBasket(page);
  // Scroll to the treats step so the filled cards and the sticky total bar are both in view.
  await page.locator('.item-grid').scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -120));
  await photos(page);
  await page.waitForTimeout(500);
  await save(await page.screenshot(), 'site-mobile-studio', 780);

  await page.locator('.cz-bar .btn-brand').click();
  await page.waitForURL('**/cart');
  await page.addStyleTag({ content: CALM });
  await settle(page);
  await save(await page.screenshot(), 'site-mobile-cart', 780);
  await ctx.close();
}

await browser.close();

// The logo, for the architecture core and OG card (the brand file shipped in the build).
const logo = await sharp(`${SRC}/src/assets/images/logo-full.jpeg`).resize({ width: 480 }).webp({ quality: 82 }).toFile(resolve(OUT, 'gift-wrap-logo.webp'));
console.log(`gift-wrap-logo.webp ${logo.width}x${logo.height} ${(logo.size / 1024).toFixed(0)} KB`);
