// The live Quorum landing page's hero at 16:10, for the home page (hero panel and the Quorum card), so the shot fits
// its frames whole instead of being cropped or padded.
//   node scripts/quorum-site-shot.mjs
// Output: public/images/quorum/site-hero.webp (1600x1000, quality 82).
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const URL = 'https://mhfrough.github.io/quorum/';

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5, colorScheme: 'dark' })).newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 90_000 });
await page.evaluate(async () => {
  await document.fonts.ready;
  const pending = [...document.images].filter((i) => i.getClientRects().length && !(i.complete && i.naturalWidth));
  await Promise.all(pending.map((i) => new Promise((r) => { i.onload = i.onerror = r; })));
});
await page.waitForTimeout(2500); // let the hero's entry motion and the 3D board settle
const broken = await page.evaluate(() => [...document.images].filter((i) => i.getClientRects().length && !(i.complete && i.naturalWidth > 0)).map((i) => i.src));
if (broken.length) throw new Error(`images did not load: ${broken.join(', ')}`);
const buf = await page.screenshot();
const info = await sharp(buf).resize({ width: 1600 }).webp({ quality: 82 }).toFile(resolve(ROOT, 'public/images/quorum/site-hero.webp'));
console.log(`site-hero.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
await browser.close();
