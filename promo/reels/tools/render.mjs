// Renders a reel page frame by frame with a fake clock (method from the Quorum promo reels).
// Serve the repo root on :5528 first, or use reel.py which does it for you.
// usage: node render.mjs <reel> <format> stills <outDir> 1,3.5,7     (1x PNG stills)
//        node render.mjs <reel> <format> frames <outDir> [fps=30] [dsf=2]
//   reel   = folder under promo/reels (e.g. hire); format = vertical | square
// The page must expose window.reelReady (promise), window.startReel() and window.REEL.duration.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const [reel, format, mode, outDir, a5, a6] = process.argv.slice(2);
const SIZE = { vertical: { width: 1080, height: 1920 }, square: { width: 1080, height: 1080 } }[format];
if (!SIZE || !['stills', 'frames'].includes(mode) || !outDir) {
  console.error('usage: node render.mjs <reel> <vertical|square> <stills|frames> <outDir> [times|fps] [dsf]');
  process.exit(2);
}
const URL = `http://127.0.0.1:${process.env.REEL_PORT || 5528}/promo/reels/${reel}/reel.html?render&format=${format}${process.env.REEL_QS || ''}`;
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--font-render-hinting=none'] });
const dsf = mode === 'frames' ? +(a6 || 2) : 1;
const page = await browser.newPage({ viewport: SIZE, deviceScaleFactor: dsf });
page.on('console', (m) => { if (m.type() === 'error') console.log('[page]', m.text()); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.clock.install();
await page.goto(URL);
await page.waitForFunction(() => window.reelReady, null, { timeout: 60000 });
await page.evaluate(() => window.reelReady);
const now = await page.evaluate(() => Date.now());
await page.clock.pauseAt(now + 1500);
const dur = await page.evaluate(() => {
  const births = new Map();
  const initial = new Set(document.getAnimations());
  let last = 0;
  window.__seek = (t) => {
    // CSS animations: pause each one and seek it to the frame time, counted from when it was created
    document.getAnimations().forEach((a) => {
      if (!births.has(a)) births.set(a, initial.has(a) ? 0 : last);
      a.pause();
      a.currentTime = Math.max(0, (t - births.get(a)) * 1000);
    });
    last = t;
  };
  window.startReel();
  document.getAnimations().forEach((a) => initial.add(a));
  return window.REEL.duration;
});
console.log(`ready: ${reel} ${format} ${SIZE.width * dsf}x${SIZE.height * dsf}, ${dur}s`);

const fps = mode === 'frames' ? +(a5 || 30) : 30;
const want = mode === 'stills' ? a5.split(',').map(Number) : null;
const total = Math.round(dur * fps);
let t = 0;
const t0 = Date.now();
for (let f = 0; f < total; f++) {
  const tf = f / fps;
  const step = (tf - t) * 1000;
  if (step > 0) await page.clock.runFor(step);
  t = tf;
  await page.evaluate((x) => window.__seek(x), tf);
  if (mode === 'frames') {
    await page.screenshot({ path: path.join(outDir, String(f).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 95 });
    if (f % 60 === 0) console.log('frame', f, '/', total, ((Date.now() - t0) / 1000).toFixed(0) + 's');
  } else {
    const hit = want.find((w) => Math.abs(w - tf) < 0.5 / fps);
    if (hit != null) {
      await page.screenshot({ path: path.join(outDir, `${format}-t${hit.toFixed(2)}.png`) });
      console.log('still', format, hit);
    }
    if (tf > Math.max(...want)) break;
  }
}
await browser.close();
