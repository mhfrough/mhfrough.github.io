// Screenshots of the live Little Surprises storefront (https://littlesurprises.shop) for its case study.
//   node scripts/little-surprises-shots.mjs
// Public pages only (home, shop, a product, build a basket). The cookie banner is declined first, scrollbars and
// the WhatsApp bubble are hidden, and every image must finish loading before a capture (same rule as settleImages in
// scripts/asaan-hisab-shots.mjs). Light theme, reduced motion.
// Output: public/images/little-surprises/*.webp (quality 80) and the mark, little-surprises-mark.webp.
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const OUT = resolve(ROOT, 'public/images/little-surprises');
mkdirSync(OUT, { recursive: true });
const SITE = 'https://littlesurprises.shop';
const LS_REPO = 'D:/workspace-personal/littlesurprises.shop/apps/web/public/brand';

const CALM = `html{scrollbar-width:none;scroll-behavior:auto!important}::-webkit-scrollbar{display:none}
*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important}
app-cookie-consent,app-whatsapp-bubble{display:none!important}`;

const browser = await chromium.launch();

async function open(viewport, scale) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale, colorScheme: 'light', reducedMotion: 'reduce', serviceWorkers: 'block' });
  return { ctx, page: await ctx.newPage() };
}

async function go(page, path) {
  await page.goto(SITE + path, { waitUntil: 'networkidle', timeout: 90_000 });
  await page.addStyleTag({ content: CALM });
  const decline = page.getByRole('button', { name: /^decline$/i });
  if (await decline.isVisible().catch(() => false)) await decline.click();
  await settle(page);
}

/** Walk the page once so lazy images load, wait for each to decode, then return to the top. */
async function settle(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager')));
  const ok = await page
    .waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 30_000 })
    .then(() => true, () => false);
  if (!ok) console.warn('  some images did not load');
  await page.waitForTimeout(800);
}

async function save(buf, name, width) {
  const info = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(resolve(OUT, `${name}.webp`));
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

// ---------------------------------------------------------------- desktop, 1440 x 900 at 1.5x
{
  const { ctx, page } = await open({ width: 1440, height: 900 }, 1.5);
  await go(page, '/');
  await save(await page.screenshot(), 'site-home', 1600);

  await go(page, '/shop');
  await page.evaluate(() => window.scrollTo({ top: 320, behavior: 'instant' }));
  await page.waitForTimeout(400);
  await save(await page.screenshot(), 'site-shop', 1600);

  await go(page, '/product/chocolate-bouquet');
  await save(await page.screenshot(), 'site-product', 1600);

  await go(page, '/build-a-basket');
  const scratch = page.getByRole('button', { name: /build from scratch/i }).or(page.getByRole('link', { name: /build from scratch/i }));
  if (await scratch.first().isVisible().catch(() => false)) {
    await scratch.first().click();
    await page.waitForLoadState('networkidle');
    await settle(page);
  }
  await save(await page.screenshot(), 'site-build', 1600);
  await ctx.close();
}

// ---------------------------------------------------------------- mobile, 390 x 844 at 2x
{
  const { ctx, page } = await open({ width: 390, height: 844 }, 2);
  await go(page, '/');
  await save(await page.screenshot(), 'site-mobile-home', 780);
  await go(page, '/product/chocolate-bouquet');
  await save(await page.screenshot(), 'site-mobile-product', 780);
  await ctx.close();
}

await browser.close();

// The picture mark (no text), for the favicon tile, the architecture core and the OG card.
const mark = await sharp(`${LS_REPO}/logo-mark.webp`).resize({ width: 240 }).webp({ quality: 86 }).toFile(resolve(OUT, 'little-surprises-mark.webp'));
console.log(`little-surprises-mark.webp ${mark.width}x${mark.height} ${(mark.size / 1024).toFixed(0)} KB`);
