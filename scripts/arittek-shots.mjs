// Screenshots of the public arittek.com site (Angular 16 prerender, redesigned 2026) for its case study.
//   node scripts/arittek-shots.mjs
// The site is live, so these are plain captures of www.arittek.com. Only public marketing pages, and only the
// parts without other companies in them: the bank logo strips, testimonials, product cards for other brands,
// the leadership section and the footer's address and phone are never in a frame (every shot is clipped to a
// hero or to one named section). The admin CMS behind the site is shown on the case study as my own mockups.
// Output: public/images/arittek/*.webp (quality 80).
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const OUT = resolve(ROOT, 'public/images/arittek');
mkdirSync(OUT, { recursive: true });
const SITE = 'https://www.arittek.com';

// Scrollbars and carets only; nothing on the page itself is changed.
const HIDE = [
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
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log(`  pageerror: ${e.message.split('\n')[0]}`));
  await p.goto(SITE + path, { waitUntil: 'networkidle', timeout: 60_000 });
  await p.addStyleTag({ content: HIDE });
  // Let lazy images load, then come back to the top.
  await p.evaluate(async () => {
    for (let y = 0; y < Math.min(document.body.scrollHeight, 4000); y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    const pending = [...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; }));
    await Promise.race([Promise.all(pending), new Promise((r) => setTimeout(r, 4000))]);
  });
  await p.waitForTimeout(1200);
  return { ctx, page: p };
}

async function save(buf, name, width) {
  const file = resolve(OUT, `${name}.webp`);
  const info = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(file);
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

// From the top of the page (so the site's own nav is in the frame) down to the bottom of `selector`.
async function shootTo(p, selector, name, { width = 1600 } = {}) {
  const bottom = await p.evaluate((s) => {
    const r = document.querySelector(s)?.getBoundingClientRect();
    if (!r) throw new Error(`missing ${s}`);
    return r.bottom + window.scrollY;
  }, selector);
  const w = await p.evaluate(() => document.documentElement.clientWidth);
  await save(await p.screenshot({ clip: { x: 0, y: 0, width: w, height: Math.round(bottom) }, fullPage: true }), name, width);
}

// One section on its own.
async function shootSection(p, selector, name, { width = 1600 } = {}) {
  const box = await p.evaluate((s) => {
    const r = document.querySelector(s)?.getBoundingClientRect();
    if (!r) throw new Error(`missing ${s}`);
    return { x: 0, y: r.top + window.scrollY, width: document.documentElement.clientWidth, height: r.height };
  }, selector);
  await save(await p.screenshot({ clip: box, fullPage: true }), name, width);
}

// ---------------------------------------------------------------------------------------------------------------
// Screenshots (public pages only)
// ---------------------------------------------------------------------------------------------------------------
{
  const { ctx, page: p } = await open('/');
  await shootTo(p, 'section.hero', 'site-home');
  await shootSection(p, 'section.home-journey', 'site-journey');
  await ctx.close();
}
for (const [path, sel, name] of [
  ['/al-qist', 'section.aq-hero', 'site-alqist'],
  ['/dmax', 'section.dmax-hero', 'site-dmax'],
  ['/tollx', 'section.tx-hero', 'site-tollx'],
]) {
  const { ctx, page: p } = await open(path);
  await shootTo(p, sel, name);
  await ctx.close();
}
{
  const { ctx, page: p } = await open('/', { mobile: true });
  await save(await p.screenshot(), 'site-mobile', 780);
  await ctx.close();
}

await browser.close();
