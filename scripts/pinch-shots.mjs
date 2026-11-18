// Screenshots of the owner's Pinch app (https://mhfrough.github.io/pinch/) for the /work/pinch case study.
//   node scripts/pinch-shots.mjs [--base https://mhfrough.github.io/pinch/]
// One laptop context and one phone context open Pinch in its dark theme (seeded through the app's own localStorage
// key 'pinch-theme') and use the app the way people do: the empty studio, then the four sample photos that ship with
// Pinch ("Open all four"), a target size, the landing's features and privacy sections. Every image is a Pinch sample;
// nothing is uploaded anywhere, which the privacy counter on the page confirms in the shot.
// Output: public/images/pinch/*.webp (quality 80): desktop shots at 1600 and 800 wide, phone shots at 600 wide.
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const OUT = resolve(ROOT, 'public/images/pinch');
mkdirSync(OUT, { recursive: true });
const argBase = process.argv.indexOf('--base');
const BASE = argBase > -1 ? process.argv[argBase + 1] : 'https://mhfrough.github.io/pinch/';

const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

const browser = await chromium.launch();

async function device({ name, viewport, ua, mobile = false, scale = 1.25 }) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: scale,
    isMobile: mobile,
    hasTouch: mobile,
    userAgent: ua,
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  // The GitHub star count is the page's one call to another site; answer it locally so shots are repeatable.
  await ctx.route(/api\.github\.com/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"stargazers_count":0}' }));
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem('pinch-theme', 'dark');
    } catch {}
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log(`[${name}] pageerror:`, e.message.slice(0, 200)));
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 120_000 });
  await settleImages(page);
  return { ctx, page };
}

// Waits until fonts and every image have loaded, so no shot is saved half-drawn.
async function settleImages(p) {
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(
    () => [...document.images].every((i) => !i.getAttribute('src') || (i.complete && i.naturalWidth > 0) || i.loading === 'lazy'),
    null,
    { timeout: 60_000, polling: 250 },
  );
  await p.waitForTimeout(600);
}

// Same, but for the images inside the visible viewport only (lazy ones below are left alone).
async function settleVisible(p) {
  await p.waitForFunction(
    () =>
      [...document.images]
        .filter((i) => {
          const r = i.getBoundingClientRect();
          return r.bottom > 0 && r.top < innerHeight && r.width > 0 && i.getAttribute('src');
        })
        .every((i) => i.complete && i.naturalWidth > 0),
    null,
    { timeout: 60_000, polling: 250 },
  );
  await p.waitForTimeout(500);
}

/** Saves one shot `width` wide, plus a half-width `<name>-<half>.webp` for srcset when `half` is set. */
async function save(buf, name, width, half = false) {
  const sizes = half ? [[name, width], [`${name}-${width / 2}`, width / 2]] : [[name, width]];
  for (const [file, w] of sizes) {
    const info = await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toFile(resolve(OUT, `${file}.webp`));
    console.log(`${file}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
  }
}

// Waits until every file in the list has a result and nothing is encoding.
const allDone = (p, n) =>
  p.waitForFunction(
    (count) => {
      const rows = [...document.querySelectorAll('.ps-row')];
      return rows.length >= count && rows.every((r) => r.getAttribute('aria-busy') === 'false' && r.querySelector('.ps-row-pct')?.textContent.trim());
    },
    n,
    { timeout: 180_000, polling: 300 },
  );

const noToast = (p) =>
  p.waitForFunction(() => !document.querySelector('.ps-toast.is-shown, .ps-toast.is-on, .ps-toast[data-open="true"]'), null, { timeout: 15_000 }).catch(() => {});

async function scrollToId(p, id, offset = 72) {
  await p.evaluate(
    ([sel, off]) => {
      const r = document.querySelector(sel).getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.top - off);
    },
    [id, offset],
  );
  await p.waitForTimeout(700);
  await settleVisible(p);
}

const laptop = await device({ name: 'laptop', viewport: { width: 1440, height: 900 } });
const phone = await device({ name: 'phone', viewport: { width: 390, height: 844 }, ua: IPHONE_UA, mobile: true, scale: 2 });
const L = laptop.page;

// 1. The empty studio: the first screen is the tool, with a live preset preview on a sample photo.
await L.waitForFunction(() => {
  const t = document.querySelector('.ps-demo-tag');
  return t && !t.classList.contains('is-busy') && t.querySelector('b')?.textContent.trim();
}, null, { timeout: 120_000 });
await L.mouse.move(4, 600);
await L.waitForTimeout(600);
await save(await L.screenshot(), 'app', 1600, true);

// 2. Landing features, before any image is added (its compare tile makes a WebP live when it scrolls in).
await scrollToId(L, '#features-title', 90);
await L.waitForTimeout(2500);
await save(await L.screenshot(), 'features', 1600, true);
await L.evaluate(() => window.scrollTo(0, 0));
await L.waitForTimeout(400);

// 3. All four samples with the Web preset: the batch view, one set of settings, one ZIP.
await L.getByRole('button', { name: 'Open all four' }).click();
await allDone(L, 4);
await L.waitForTimeout(1500);
await noToast(L);
await L.mouse.move(4, 600);
await save(await L.screenshot(), 'batch', 1600, true);

// 4. A target size: keep each file under 100 KB. Pinch searches quality, then shrinks the picture if it must.
await L.locator('label.ps-switch:has(#ps-t-on)').click();
await L.fill('#ps-t-val', '100');
await L.locator('#ps-t-val').press('Tab');
await L.waitForTimeout(500);
await allDone(L, 4);
await L.locator('.ps-row', { hasText: 'p353' }).locator('.ps-row-main').click();
await allDone(L, 4);
await L.waitForTimeout(1500);
await noToast(L);
await L.mouse.move(4, 600);
await save(await L.screenshot(), 'target', 1600, true);

// 5. The privacy section after four images: the request counter shows what left the tab.
await scrollToId(L, '#privacy-title', 150);
await L.waitForTimeout(800);
await save(await L.screenshot(), 'privacy', 1600, true);

// 6. The phone: the empty studio, then one sample open with its result card.
const P = phone.page;
await P.waitForFunction(() => {
  const t = document.querySelector('.ps-demo-tag');
  return t && !t.classList.contains('is-busy') && t.querySelector('b')?.textContent.trim();
}, null, { timeout: 120_000 });
await P.waitForTimeout(600);
await save(await P.screenshot(), 'phone', 600);
await P.locator('.ps-sample').first().click();
await allDone(P, 1);
await P.waitForTimeout(1500);
await noToast(P);
await save(await P.screenshot(), 'phone-studio', 600);

await laptop.ctx.close();
await phone.ctx.close();
await browser.close();
