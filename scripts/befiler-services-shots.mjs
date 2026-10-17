// Screenshots of befiler.com's public service pages (sales tax, USA) for /work/befiler.
//   node scripts/befiler-services-shots.mjs
// Same rules as befiler-shots.mjs: public marketing pages only, cookie banner hidden with CSS (never accepted).
// Output: public/images/befiler/site-*.webp (quality 80).
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const OUT = resolve(ROOT, 'public/images/befiler');
mkdirSync(OUT, { recursive: true });
const BASE = 'https://www.befiler.com';
const HIDE =
  '#cookies, .cookie-container, [class*="cookie"], [id*="cookie"], #mobileDrawer, [id^="widget-"], [class*="whatsapp-float"] { display: none !important; } html { scrollbar-width: none; } ::-webkit-scrollbar { display: none; }';

const browser = await chromium.launch();

async function open(path, viewport = { width: 1440, height: 900 }, scale = 1.5) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale, colorScheme: 'light', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: 'load', timeout: 90_000 });
  await page.waitForTimeout(2500);
  await page.addStyleTag({ content: HIDE });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
  return { ctx, page };
}

async function save(buf, name, width) {
  const file = resolve(OUT, `${name}.webp`);
  // befiler.com leaves an off-canvas drawer's shadow along the right edge: trim it.
  const meta = await sharp(buf).metadata();
  const trim = Math.round(meta.width * 0.016);
  const info = await sharp(buf)
    .extract({ left: trim, top: 0, width: meta.width - trim * 2, height: meta.height })
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(file);
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

async function part(page, selector, name, width) {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await save(await el.screenshot(), name, width);
}

// Sales tax: hero + the two service cards + the end-to-end services grid.
{
  const { ctx, page } = await open('/sales-tax');
  await save(await page.screenshot(), 'site-salestax', 1600);
  await part(page, 'section.services-stats', 'site-salestax-plans', 1600);
  await part(page, 'section.e2e-services-sec', 'site-salestax-services', 1600);
  await ctx.close();
}

// USA: hero + the price cards.
{
  const { ctx, page } = await open('/usa-services');
  await save(await page.screenshot(), 'site-usa', 1600);
  await part(page, 'main > .price-tag', 'site-usa-pricing', 1600);
  await ctx.close();
}

await browser.close();
