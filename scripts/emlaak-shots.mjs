// Screenshots of the public emlaakfinancials.com site for the /work/emlaak case study.
//   node scripts/emlaak-shots.mjs
// Only the public marketing site is captured (owner's rule: the investor app is shown as my own mockups).
// The live site still wears its 2020 design; the case study says so. No phone shot: the live hero carousel
// does not render at phone width. The fund-house logo wall is not captured
// (client banks are never shown). Also exports the Emlaak logo and mark from the product repo, when present.
// Output: public/images/emlaak/site-*.webp (quality 80), emlaak-logo.webp, emlaak-mark.webp.
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const OUT = resolve(ROOT, 'public/images/emlaak');
mkdirSync(OUT, { recursive: true });
const BASE = 'https://emlaakfinancials.com';
const HIDE = '*, *::before, *::after { transition: none !important; animation: none !important; } html { scrollbar-width: none; scroll-behavior: auto !important; } ::-webkit-scrollbar { display: none; }';

const browser = await chromium.launch();

async function open(path, viewport, scale) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale, colorScheme: 'light', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: 'load', timeout: 90_000 });
  await page.waitForTimeout(2500);
  await page.addStyleTag({ content: HIDE });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  // The hero is a carousel: pin it to its first slide so the shot never lands mid-fade.
  await page.evaluate(() => {
    const items = document.querySelectorAll('section.slider .carousel-item');
    items.forEach((el, i) => el.classList.toggle('active', i === 0));
  });
  await page.waitForTimeout(1200);
  return { ctx, page };
}

async function save(buf, name, width) {
  const file = resolve(OUT, `${name}.webp`);
  const info = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(file);
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

async function section(page, selector, name, width) {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await save(await el.screenshot(), name, width);
}

{
  const { ctx, page } = await open('/', { width: 1440, height: 900 }, 1.5);
  await save(await page.screenshot(), 'site-hero', 1600);
  // Steps + savings objectives read as one block on the page: capture them together.
  const box = await page.evaluate(() => {
    const a = document.querySelector('section.steps').getBoundingClientRect();
    const b = document.querySelector('section.investment').getBoundingClientRect();
    return { x: 0, y: a.top + scrollY, width: document.documentElement.clientWidth, height: b.bottom - a.top };
  });
  await save(await page.screenshot({ clip: box, fullPage: true }), 'site-objectives', 1600);
  await section(page, 'section.benefits', 'site-benefits', 1600);
  await ctx.close();
}

await browser.close();

// Logo + mark from the product repo (the mark is the logo's left third: the Urdu word drawn as rising bars).
const LOGO = 'D:/workspace-office/emlaak-frontend/src/assets/images/logo.png';
if (existsSync(LOGO)) {
  await sharp(LOGO).resize({ height: 96 }).webp({ quality: 90 }).toFile(resolve(OUT, 'emlaak-logo.webp'));
  const mark = await sharp(LOGO).extract({ left: 0, top: 20, width: 640, height: 370 }).png().toBuffer();
  await sharp(mark).trim().resize({ height: 96 }).webp({ quality: 90 }).toFile(resolve(OUT, 'emlaak-mark.webp'));
  console.log('emlaak-logo.webp, emlaak-mark.webp');
}
