// Screenshots of the public befiler.com marketing site for the /work/befiler case study.
//   node scripts/befiler-shots.mjs
// Only the public site is captured (owner's rule: product apps are shown as my own mockups, never screenshots).
// The cookie banner is hidden with CSS, never accepted. Output: public/images/befiler/*.webp (quality 80).
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const OUT = resolve(ROOT, 'public/images/befiler');
mkdirSync(OUT, { recursive: true });
const URL = 'https://www.befiler.com/';
const HIDE =
  '#cookies, .cookie-container, [id^="widget-"], [class*="whatsapp-float"] { display: none !important; } html { scrollbar-width: none; } ::-webkit-scrollbar { display: none; }';

const browser = await chromium.launch();

async function open(viewport, scale) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale, colorScheme: 'light', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load', timeout: 90_000 });
  await page.waitForTimeout(2500);
  await page.addStyleTag({ content: HIDE });
  // Let lazy images load: walk the page once.
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
  const info = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(file);
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

async function section(page, text, name, width) {
  const el = page.locator('section', { hasText: text }).last();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await save(await el.screenshot(), name, width);
}

// Desktop: hero viewport + three sections.
{
  const { ctx, page } = await open({ width: 1440, height: 900 }, 1.5);
  await save(await page.screenshot(), 'site-hero', 1600);
  await section(page, 'Choose Your Tax Filing Plan', 'site-plans', 1600);
  await section(page, 'Calculate Your Taxes', 'site-calculator', 1600);
  await section(page, 'How Befiler Works', 'site-how', 1600);
  await ctx.close();
}

// Mobile hero, for a phone frame.
{
  const { ctx, page } = await open({ width: 390, height: 844 }, 2);
  await save(await page.screenshot(), 'site-mobile', 780);
  await ctx.close();
}

await browser.close();

