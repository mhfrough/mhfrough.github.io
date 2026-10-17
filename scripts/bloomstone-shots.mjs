// Screenshots of the public bloomstone.pk site for the /work/bloomstone case study.
//   node scripts/bloomstone-shots.mjs
// Only public pages are captured (owner's rule: admin screens are shown as my own mockups, never screenshots).
// The cookie banner is hidden with CSS, never accepted. Output: public/images/bloomstone/site-*.webp (quality 80).
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const OUT = resolve(ROOT, 'public/images/bloomstone');
mkdirSync(OUT, { recursive: true });
const BASE = 'https://www.bloomstone.pk';
const HIDE =
  'app-cookie-consent, app-back-to-top, app-whatsapp-bubble { display: none !important; } html { scrollbar-width: none; scroll-behavior: auto !important; } ::-webkit-scrollbar { display: none; }';

const browser = await chromium.launch();

async function open(path, viewport, scale) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale, colorScheme: 'light', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: 'load', timeout: 90_000 });
  await page.waitForTimeout(2500);
  await page.addStyleTag({ content: HIDE });
  // Let lazy images load: walk the page once.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
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
  // The fixed navbar would sit over the section: lift it out of the way for element shots.
  await page.addStyleTag({ content: 'app-navbar { display: none !important; }' });
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await save(await el.screenshot(), name, width);
}

// Desktop: hero viewport + public sections.
{
  const { ctx, page } = await open('/', { width: 1440, height: 900 }, 1.5);
  await save(await page.screenshot(), 'site-hero', 1600);
  await section(page, '#packages', 'site-packages', 1600);
  await ctx.close();
}

// Public availability calendar.
{
  const { ctx, page } = await open('/availability', { width: 1440, height: 900 }, 1.5);
  await page.waitForTimeout(1500);
  await save(await page.screenshot(), 'site-availability', 1600);
  await ctx.close();
}

// Mobile hero, for a phone frame.
{
  const { ctx, page } = await open('/', { width: 390, height: 844 }, 2);
  await save(await page.screenshot(), 'site-mobile', 780);
  await ctx.close();
}

await browser.close();
