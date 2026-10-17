// Screenshots of the Asaan Hisab public sign-up page (asaanhisab.com, Angular, 2020) for its case study.
//   node scripts/asaan-hisab-shots.mjs
// The live site's only public screen is its sign-up page: a header, the hero with the sign-up card, six feature
// tiles and a footer. Everything behind sign-in is the accounting app, which is never captured here: it appears on
// the case study as my own mockups. Before each shot the copyright bar is hidden with CSS: it names the company the
// owner built it for (never named on this site). The hero portrait stays in, as on the live page (owner, 2026-10-11).
// Requests to anything but asaanhisab.com and Google Fonts are aborted. The sign-up form is never filled.
// Output: public/images/asaan-hisab/*.webp (quality 80) and the brand mark from the original repo (read only).
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const OUT = resolve(ROOT, 'public/images/asaan-hisab');
mkdirSync(OUT, { recursive: true });
const SITE = 'https://asaanhisab.com/';
const REPO = 'D:/workspace-office/asan_hisab'; // read only

const HIDE = [
  '.section-copyright { display: none !important; }',
  'ng-http-loader { display: none !important; }',
  'html { scrollbar-width: none; } ::-webkit-scrollbar { display: none; }',
  '*, *::before, *::after { caret-color: transparent !important; }',
].join('\n');

const browser = await chromium.launch();

async function open({ mobile = false } = {}) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: mobile ? 2 : 1.5,
    isMobile: mobile,
    hasTouch: mobile,
    serviceWorkers: 'block',
    reducedMotion: 'reduce',
    locale: 'en-PK',
    timezoneId: 'Asia/Karachi',
  });
  await ctx.route('**/*', (route) => {
    const host = new URL(route.request().url()).host;
    if (/(^|\.)asaanhisab\.com$|fonts\.(googleapis|gstatic)\.com$/.test(host)) return route.continue();
    if (route.request().resourceType() === 'image') console.log(`  blocked image host: ${host}`);
    return route.abort();
  });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log(`  pageerror: ${e.message.split('\n')[0]}`));
  await p.goto(SITE, { waitUntil: 'networkidle', timeout: 90_000 });
  await p.addStyleTag({ content: HIDE });
  await settleImages(p);
  return { ctx, page: p };
}

// Waits until every image on the page has really loaded (complete with pixels), CSS background images included.
// Scrolls through first so lazy images start, then back to the top. Throws instead of saving a half-loaded shot.
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
      () => [...document.images].every((i) => i.complete && (i.naturalWidth > 0 || !i.currentSrc)),
      null,
      { timeout: 60_000, polling: 250 },
    );
  } catch {
    const broken = await p.evaluate(() =>
      [...document.images].filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.currentSrc || i.src),
    );
    throw new Error(`images did not load: ${broken.join(', ')}`);
  }
  await p.waitForLoadState('networkidle');
  await p.waitForTimeout(1200); // let decoding and any fade-in finish
}

async function save(buf, name, width) {
  const info = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(resolve(OUT, `${name}.webp`));
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

// One of the page's own regions, by selector, with `pad` CSS pixels of page around it on every side.
async function shootRegion(p, selector, name, { pad = 0, width = 1600 } = {}) {
  const box = await p.evaluate(([sel, pd]) => {
    const r = document.querySelector(sel).getBoundingClientRect();
    const x = Math.max(0, r.left - pd);
    const y = Math.max(0, r.top + window.scrollY - pd);
    return { x, y, width: Math.min(document.documentElement.clientWidth - x, r.width + pd * 2), height: r.height + pd * 2 };
  }, [selector, pad]);
  await save(await p.screenshot({ clip: box, fullPage: true }), name, width);
}

{
  const { ctx, page: p } = await open();
  // 1440 x 900 at 1.5x: header, hero and sign-up card, and the features heading.
  await save(await p.screenshot(), 'site-home', 1600);
  // The six feature tiles, without the section heading.
  await shootRegion(p, '.text-center.pt-5 > .row', 'site-features', { pad: 32 });
  await ctx.close();
}
{
  // Phone: the page's own small-screen layout (menu button, stacked hero and card). Chromium's default mobile user
  // agent: with an iPhone Safari one the page stays blank in headless Chromium.
  const { ctx, page: p } = await open({ mobile: true });
  await save(await p.screenshot(), 'site-mobile', 780);
  await ctx.close();
}

await browser.close();

// ---------------------------------------------------------------------------------------------------------------
// Brand: the mark (the project icon on /work and home) and the wordmark (OG card), from the original repo.
// ---------------------------------------------------------------------------------------------------------------
{
  const mark = await sharp(`${REPO}/src/assets/images/logo/logostamp.png`).ensureAlpha().trim({ threshold: 10 }).png().toBuffer();
  const m = await sharp(mark).resize({ height: 96 }).webp({ quality: 90, alphaQuality: 100 }).toFile(resolve(OUT, 'asaan-hisab-mark.webp'));
  console.log(`asaan-hisab-mark.webp ${m.width}x${m.height} ${(m.size / 1024).toFixed(1)} KB`);
  const logo = await sharp(`${REPO}/src/assets/images/logo/logo.png`).ensureAlpha().trim({ threshold: 10 }).png().toBuffer();
  const l = await sharp(logo).resize({ height: 96 }).webp({ quality: 90, alphaQuality: 100 }).toFile(resolve(OUT, 'asaan-hisab-logo.webp'));
  console.log(`asaan-hisab-logo.webp ${l.width}x${l.height} ${(l.size / 1024).toFixed(1)} KB`);
}
