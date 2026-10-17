// Stills from a CSS-timed promo reel (1080x1920), for checking beats before a video render.
//   node scripts/reel-stills.mjs promo/befiler/befiler-reel.html 1.6,6.5,13.6,17.4,21.8,26
// Opens the page with ?render, waits for window.reelReady, calls window.startReel(), then pauses every
// animation and seeks it to each time. Output: .devcache/reel-stills/<name>-<t>.png (540x960).
import { mkdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, CACHE } from './_env.mjs';

const { chromium } = await import('playwright');
const [file = 'promo/befiler/befiler-reel.html', list = '2,6,12,17,21,25'] = process.argv.slice(2);
const times = list.split(',').map(Number);
const out = resolve(CACHE, 'reel-stills');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 0.5 });
await page.goto(pathToFileURL(resolve(ROOT, file)).href + '?render');
await page.evaluate(() => window.reelReady);
await page.evaluate(() => window.startReel());
for (const t of times) {
  await page.evaluate((ms) => {
    for (const a of document.getAnimations()) {
      a.pause();
      a.currentTime = ms;
    }
  }, t * 1000);
  await page.waitForTimeout(60);
  const name = `${basename(file, '.html')}-${t.toFixed(1)}.png`;
  await page.locator('#reel').screenshot({ path: resolve(out, name) });
  console.log(name);
}
await browser.close();
