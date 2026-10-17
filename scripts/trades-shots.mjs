// Screenshots of the two Nottingham trades sites for the /work/trades case study.
//   node scripts/trades-shots.mjs [--probe]
// SOS24: its old domain now runs a different site, so its original source (D:\workspace-personal\archive, read
// only) is copied to .devcache/build/sos24-src, built there (npm install, plus @popperjs/core and @angular/localize,
// which its package.json forgot) to .devcache/build/sos24, and served here from a virtual https origin by
// context.route. Every other request is aborted (maps embed, fonts CDNs stay allowed for the look).
// AK Heating and Plumbing: the live public site. Its reviews slider (real reviewers' names and emails) and its
// footer (the owner's personal phone and email) are hidden with CSS on every shot.
// --probe also writes full-page captures to .devcache/build/ for choosing sections.
// Output: public/images/trades/*.webp (quality 80).
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import sharp from 'sharp';
import { CACHE, ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const OUT = resolve(ROOT, 'public/images/trades');
mkdirSync(OUT, { recursive: true });
const PROBE = process.argv.includes('--probe');
const SOS_DIST = resolve(CACHE, 'build/sos24');
const SOS = 'https://sos24.shots.test';
const AK = 'https://akheatplumb247.web.app';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.json': 'application/json' };
const ALLOW = /fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net/;

const BASE_CSS = '*, *::before, *::after { transition: none !important; animation: none !important; } html { scrollbar-width: none; scroll-behavior: auto !important; } ::-webkit-scrollbar { display: none; }';
// AK: hide the reviews slider and the footer (personal contact details), and the floating WhatsApp bubble.
const AK_CSS = 'section.client, footer, app-footer { display: none !important; }';
const SOS_CSS = 'iframe { visibility: hidden !important; }';

const browser = await chromium.launch();

async function context(viewport, scale) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale, colorScheme: 'light', reducedMotion: 'reduce' });
  await ctx.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin === SOS) {
      let file = normalize(join(SOS_DIST, decodeURIComponent(url.pathname)));
      if (!file.startsWith(SOS_DIST) || !existsSync(file) || statSync(file).isDirectory()) file = join(SOS_DIST, 'index.html');
      return route.fulfill({ status: 200, body: readFileSync(file), contentType: TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream' });
    }
    if (url.origin === AK || ALLOW.test(url.host)) return route.continue();
    return route.abort();
  });
  return ctx;
}

async function open(ctx, url, css) {
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 90_000 });
  await page.waitForTimeout(2500);
  await page.addStyleTag({ content: BASE_CSS + css });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 200));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(1200);
  return page;
}

async function save(buf, name, width) {
  const info = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(resolve(OUT, `${name}.webp`));
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

async function probe(page, name) {
  if (!PROBE) return;
  await sharp(await page.screenshot({ fullPage: true })).resize({ width: 700 }).png().toFile(resolve(CACHE, `build/probe-${name}.png`));
  console.log(`probe-${name}.png`);
}

if (!existsSync(join(SOS_DIST, 'index.html'))) throw new Error(`Build SOS24 first: ${SOS_DIST} is missing (see the header).`);

// Desktop
{
  const ctx = await context({ width: 1440, height: 900 }, 1.5);
  let page = await open(ctx, SOS + '/', SOS_CSS);
  await probe(page, 'sos-home');
  await save(await page.screenshot(), 'sos24-home', 1600);
  page = await open(ctx, SOS + '/service?type=plumbing', SOS_CSS);
  await probe(page, 'sos-service');
  await save(await page.screenshot(), 'sos24-service', 1600);

  page = await open(ctx, AK + '/', AK_CSS);
  await probe(page, 'ak-home');
  await save(await page.screenshot(), 'ak-home', 1600);
  page = await open(ctx, AK + '/services', AK_CSS);
  await probe(page, 'ak-services');
  await save(await page.screenshot(), 'ak-services', 1600);
  page = await open(ctx, AK + '/reviews', AK_CSS);
  await probe(page, 'ak-reviews');
  await save(await page.screenshot(), 'ak-reviews', 1600);
  await ctx.close();
}

await browser.close();

// Logos from the archived sources, 96px high WebP with alpha.
const LOGOS = {
  sos24: 'D:/workspace-personal/archive/sos24website/src/assets/logo.svg',
  ak: 'D:/workspace-personal/archive/hotncool/src/assets/images/icon.png',
};
for (const [slug, src] of Object.entries(LOGOS)) {
  if (!existsSync(src)) continue;
  const input = src.endsWith('.svg') ? sharp(readFileSync(src), { density: 300 }) : sharp(src);
  const png = await input.ensureAlpha().png().toBuffer();
  const info = await sharp(png).trim().resize({ height: 96 }).webp({ quality: 90 }).toFile(resolve(OUT, `${slug}-logo.webp`));
  console.log(`${slug}-logo.webp ${info.width}x${info.height}`);
}
