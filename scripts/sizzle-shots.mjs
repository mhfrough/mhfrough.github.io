// Media and screenshots of Sizzle (https://mhfrough.github.io/sizzle/) for the /work/sizzle case study.
//   node scripts/sizzle-shots.mjs [--src D:/workspace-personal/mhfrough_projects/sizzle] [--local] [--media-only]
// 1. Media, from the Sizzle folder (read, never modified): the mark (icon.svg), the trailer (assets/media/
//    sizzle-reel.mp4, the 720 x 1280 web copy the live page plays), its poster and contact sheet, and one still per
//    cue of the trailer (assets/media/sizzle-reel.json) taken from the 4K render's own frames in
//    promo/.reel-work/sizzle-reel/frames when that local work folder exists, else from the six published frames.
// 2. Screenshots of the public page, by default the live site (--local serves the folder instead). The GitHub star
//    count request is blocked so the header is the same on every run. Every shot waits for fonts and images.
// Output: public/images/sizzle/*.webp, sizzle-mark.svg, sizzle-reel.mp4. Desktop shots at 1600 and 800 wide,
// phone shots at 600 wide.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT, hasFlag } from './_env.mjs';

const argSrc = process.argv.indexOf('--src');
const SRC = argSrc > -1 ? process.argv[argSrc + 1] : 'D:/workspace-personal/mhfrough_projects/sizzle';
const OUT = resolve(ROOT, 'public/images/sizzle');
mkdirSync(OUT, { recursive: true });

// ---------- 1. Media ----------
copyFileSync(resolve(SRC, 'icon.svg'), resolve(OUT, 'sizzle-mark.svg'));
copyFileSync(resolve(SRC, 'assets/media/sizzle-reel.mp4'), resolve(OUT, 'sizzle-reel.mp4'));
copyFileSync(resolve(SRC, 'assets/media/sizzle-poster.webp'), resolve(OUT, 'sizzle-poster.webp'));
await sharp(resolve(SRC, 'assets/media/sizzle-sheet.webp')).resize({ width: 1600 }).webp({ quality: 82 }).toFile(resolve(OUT, 'sheet.webp'));
console.log('mark, reel, poster, sheet copied');

// One still per cue, at a moment where that beat is fully on screen. Keys match STILLS in sizzle.data.ts.
const STILLS = [
  ['hook', 1.6],
  ['reveal', 4.0],
  ['collapse', 5.05],
  ['install', 6.8],
  ['ask', 9.4],
  ['script', 11.6],
  ['cut', 13.9],
  ['lock', 15.9],
  ['mix', 18.4],
  ['print', 21.0],
  ['cta', 24.0],
];
const FRAMES = resolve(SRC, 'promo/.reel-work/sizzle-reel/frames');
const published = { hook: 1, install: 2, cut: 3, lock: 4, mix: 5, cta: 6 };
for (const [key, t] of STILLS) {
  const frame = resolve(FRAMES, `${String(Math.min(749, Math.round(t * 30))).padStart(5, '0')}.jpg`);
  const from = existsSync(frame) ? frame : published[key] ? resolve(SRC, `assets/media/sizzle-frame-${published[key]}.webp`) : resolve(SRC, 'assets/media/sizzle-poster.webp');
  const info = await sharp(from).resize({ width: 432, height: 768, fit: 'cover' }).webp({ quality: 78 }).toFile(resolve(OUT, `still-${key}.webp`));
  console.log(`still-${key}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

if (hasFlag('--media-only')) process.exit(0);

// ---------- 2. Screenshots ----------
const { chromium } = await import('playwright');
let server;
let BASE = 'https://mhfrough.github.io/sizzle/';
if (hasFlag('--local')) {
  const { startServer } = await import('./serve.mjs');
  server = await startServer(SRC, 0);
  BASE = `http://127.0.0.1:${server.address().port}/`;
}

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

async function open({ viewport, mobile = false, scale = 1.25 }) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale, isMobile: mobile, hasTouch: mobile, colorScheme: 'dark', reducedMotion: 'reduce' });
  await ctx.route(/api\.github\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror:', e.message.slice(0, 200)));
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 120_000 });
  await settleImages(page);
  return { ctx, page };
}

// Waits until fonts and every image have loaded, so no shot is saved half-drawn.
async function settleImages(p) {
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => [...document.images].every((i) => i.complete && (i.naturalWidth > 0 || !i.currentSrc)), null, {
    timeout: 60_000,
    polling: 250,
  });
  await p.waitForTimeout(600);
}

/** Scrolls an element to `offset` px under the top and lets lazy images and reveals land. */
async function scrollTo(p, sel, offset = 0) {
  await p.evaluate(
    ([s, o]) => {
      const el = document.querySelector(s);
      window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - o);
    },
    [sel, offset],
  );
  await p.waitForTimeout(900);
  await settleImages(p);
}

/** Saves one shot `width` wide, plus a half-width `<name>-<half>.webp` for srcset when `half` is set. */
async function save(buf, name, width, half = false) {
  const sizes = half ? [[name, width], [`${name}-${width / 2}`, width / 2]] : [[name, width]];
  for (const [file, w] of sizes) {
    const info = await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toFile(resolve(OUT, `${file}.webp`));
    console.log(`${file}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
  }
}

const desk = await open({ viewport: { width: 1440, height: 900 } });
const d = desk.page;

// Hero: the opening titles and the four-scene film strip.
await save(await d.screenshot(), 'site', 1600, true);

// The cutting room: an app name typed in, the reel recut in the browser.
await scrollTo(d, '#st-bay', 110);
await save(await d.screenshot(), 'studio', 1600, true);

// The production schedule, on scene 05: the picture lock gate.
await scrollTo(d, '#how', 0);
await d.click('#sc-t5');
await d.waitForTimeout(1500);
await scrollTo(d, '#how .sc-body', 40);
await save(await d.screenshot(), 'schedule', 1600, true);

// The screening room: the three.js cinema that plays the trailer (or its flat fallback).
await scrollTo(d, '#screening', 0);
await d
  .waitForFunction(() => document.querySelector('#sr-stage')?.matches('.is-ready, .is-flat'), null, { timeout: 60_000, polling: 250 })
  .catch(() => console.log('screening room did not report ready; capturing as is'));
await d.waitForTimeout(2500);
await scrollTo(d, '#screening-title', 60);
await save(await d.screenshot(), 'screening', 1600, true);

// Install: any agent, Claude Code or Cursor.
await scrollTo(d, '#install', 0);
await save(await d.screenshot(), 'install', 1600, true);
await desk.ctx.close();

// Phone: the hero and the cutting room in one column.
const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: IPHONE_UA, colorScheme: 'dark', reducedMotion: 'reduce' });
await phone.route(/api\.github\.com/, (r) => r.abort());
const m = await phone.newPage();
await m.goto(BASE, { waitUntil: 'networkidle', timeout: 120_000 });
await settleImages(m);
await save(await m.screenshot(), 'phone', 600);
await scrollTo(m, '#studio .st-screen, #st-screen', 70);
await save(await m.screenshot(), 'phone-studio', 600);
await phone.close();

await browser.close();
server?.close();
// Keeps the poster's declared size honest for the page.
const poster = await sharp(readFileSync(resolve(OUT, 'sizzle-poster.webp'))).metadata();
console.log(`poster ${poster.width}x${poster.height}`);
