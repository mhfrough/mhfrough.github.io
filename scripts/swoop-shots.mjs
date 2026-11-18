// Screenshots of the owner's Swoop (https://mhfrough.github.io/swoop/) for the /work/swoop case study.
//   node scripts/swoop-shots.mjs [--src D:/workspace-personal/mhfrough_projects/swoop]
// Serves the Swoop folder as it is (no build step; scripts/serve.mjs on a free port), so the landing page and the
// desktop overlay are the same files that ship. The GitHub star count request is blocked so the header is the same on
// every run. The landing page's own editor demo is marked up with the mouse like a person would: a box, two numbered
// steps, an arrow and a blur over the sample address. The desktop overlay (desktop/ui/overlay.html) runs with a
// stand-in for Tauri, the same idea as the repo's tests/desktop-ui.spec.js, fed a real screenshot as the frozen screen.
// The Chrome Web Store screenshot in store/ is converted too. Every shot waits for fonts and images first.
// Output: public/images/swoop/*.webp (quality 80) and swoop-mark.svg (a copy of icon.svg).
import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';
import { startServer } from './serve.mjs';

const { chromium } = await import('playwright');
const argSrc = process.argv.indexOf('--src');
const SRC = argSrc > -1 ? process.argv[argSrc + 1] : 'D:/workspace-personal/mhfrough_projects/swoop';
const OUT = resolve(ROOT, 'public/images/swoop');
mkdirSync(OUT, { recursive: true });
copyFileSync(resolve(SRC, 'icon.svg'), resolve(OUT, 'swoop-mark.svg'));

const server = await startServer(SRC, 0);
const BASE = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch();

// A phone gets an iPhone user agent, so the page's "desktop app for your system" button stays generic.
const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

async function open(path, { viewport, scheme = 'dark', scale = 1.25, mobile = false } = {}) {
  const ctx = await browser.newContext({
    viewport,
    userAgent: mobile ? IPHONE_UA : undefined,
    deviceScaleFactor: scale,
    isMobile: mobile,
    hasTouch: mobile,
    colorScheme: scheme,
    reducedMotion: 'reduce',
  });
  await ctx.route(/api\.github\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log(`[${path}] pageerror:`, e.message.slice(0, 200)));
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
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

/** Scrolls so `selector` sits `offset` CSS px below the top of the window. */
async function scrollToEl(p, selector, offset = 0) {
  await p.evaluate(
    ([s, o]) => {
      const r = document.querySelector(s).getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.top - o);
    },
    [selector, offset],
  );
  await p.waitForTimeout(400);
}

/**
 * Where the 1200 x 760 sample picture sits inside the demo's canvas, in CSS px of the window: the light picture is
 * found on the dark stage by its pixels, since the editor does not expose its view.
 */
async function sampleRect(p) {
  return p.evaluate(() => {
    const c = document.querySelector('#demo .se-canvas');
    const box = c.getBoundingClientRect();
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let x1 = c.width, y1 = c.height, x2 = 0, y2 = 0;
    for (let y = 0; y < c.height; y += 2) {
      for (let x = 0; x < c.width; x += 2) {
        const i = (y * c.width + x) * 4;
        if (d[i] > 200 && d[i + 1] > 200 && d[i + 2] > 195) {
          if (x < x1) x1 = x;
          if (x > x2) x2 = x;
          if (y < y1) y1 = y;
          if (y > y2) y2 = y;
        }
      }
    }
    const k = box.width / c.width;
    return { left: box.left + x1 * k, top: box.top + y1 * k, scale: ((x2 - x1) * k) / 1200 };
  });
}

/** Clicks a tool in the demo toolbar, then drags (or clicks) at sample-picture coordinates. */
async function mark(p, tool, from, to) {
  await p.click(`#demo .se-tool[data-tool="${tool}"]`);
  const r = await sampleRect(p);
  const at = ([x, y]) => [r.left + x * r.scale, r.top + y * r.scale];
  const [ax, ay] = at(from);
  await p.mouse.move(ax, ay);
  await p.mouse.down();
  if (to) {
    const [bx, by] = at(to);
    await p.mouse.move(bx, by, { steps: 8 });
  }
  await p.mouse.up();
  await p.waitForTimeout(150);
}

/** The landing page's demo, marked up the way the store screenshot is: box, steps, blur, arrow. */
async function markUpDemo(p) {
  await p.waitForSelector('#demo .se-canvas');
  await p.waitForTimeout(800);
  await p.click('#demo .se-swatch[data-color="#ff3b30"]');
  await mark(p, 'rect', [64, 200], [764, 450]);
  await mark(p, 'step', [70, 206]);
  await mark(p, 'step', [802, 206]);
  await mark(p, 'blur', [822, 258], [1100, 400]);
  await mark(p, 'arrow', [560, 640], [420, 318]);
  // Leave the arrow tool picked and move the pointer off the picture, so no hover handles show.
  await p.mouse.move(4, 4);
  await p.waitForTimeout(400);
}

// ---------- 1. The landing page on a laptop, dark ----------
{
  const { ctx, page } = await open('', { viewport: { width: 1440, height: 900 } });
  await scrollToEl(page, '#demo', 140);
  await markUpDemo(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await save(await page.screenshot(), 'site', 1600, true);

  await scrollToEl(page, '.demo', 70);
  await save(await page.screenshot(), 'editor', 1600, true);

  for (const [id, name] of [
    ['#chrome', 'chrome'],
    ['#tools', 'tools'],
  ]) {
    await scrollToEl(page, id, 0);
    await save(await page.screenshot(), name, 1600, true);
  }
  await ctx.close();
}

// ---------- 2. Light theme, the hero ----------
{
  const { ctx, page } = await open('', { viewport: { width: 1440, height: 900 }, scheme: 'light' });
  await scrollToEl(page, '#demo', 140);
  await markUpDemo(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await save(await page.screenshot(), 'site-light', 1600, true);
  await ctx.close();
}

// ---------- 3. A phone, dark ----------
{
  const { ctx, page } = await open('', { viewport: { width: 390, height: 844 }, scale: 2, mobile: true });
  await save(await page.screenshot(), 'phone', 600);
  await scrollToEl(page, '#download-chrome', 72);
  await save(await page.screenshot(), 'phone-download', 600);
  await ctx.close();
}

// ---------- 4. The desktop overlay, with a stand-in for Tauri ----------
{
  // The frozen screen: the landing page in light, as a person's monitor would show it.
  const W = 1280;
  const H = 800;
  const shot = await (async () => {
    const { ctx, page } = await open('', { viewport: { width: W, height: H }, scheme: 'light', scale: 1 });
    await scrollToEl(page, '#chrome', 0);
    const png = await page.screenshot();
    await ctx.close();
    return png;
  })();
  const raw = await sharp(shot).ensureAlpha().raw().toBuffer();

  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1.25, colorScheme: 'dark', reducedMotion: 'reduce' });
  await ctx.route(/__frozen\.rgba$/, (r) => r.fulfill({ status: 200, contentType: 'application/octet-stream', body: raw }));
  await ctx.addInitScript(
    ([w, h]) => {
      const listeners = {};
      window.__emit = (name) => listeners[name] && listeners[name]({ event: name, payload: null });
      window.__TAURI__ = {
        event: { listen: async (name, cb) => ((listeners[name] = cb), () => {}) },
        core: {
          invoke: async (cmd) => {
            if (cmd !== 'get_capture') return null;
            const px = new Uint8Array(await (await fetch('/__frozen.rgba')).arrayBuffer());
            const buf = new ArrayBuffer(12 + px.length);
            const v = new DataView(buf);
            v.setUint32(0, w, true);
            v.setUint32(4, h, true);
            v.setFloat32(8, 1, true);
            new Uint8Array(buf, 12).set(px);
            return buf;
          },
        },
      };
    },
    [W, H],
  );
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('[overlay] pageerror:', e.message.slice(0, 200)));
  await page.goto(BASE + 'desktop/ui/overlay.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => typeof window.__emit === 'function' && document.querySelector('.se-canvas'));
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.__emit('capture'));
  await page.waitForFunction(() => !document.querySelector('#editor').classList.contains('is-waiting'));
  await page.waitForTimeout(300);

  // Select the three "how it works" steps, then box the second one and number it, inside the selection.
  await page.mouse.move(676, 136);
  await page.mouse.down();
  await page.mouse.move(1212, 566, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  const tool = (id) => page.click(`#editor .se-tool[data-tool="${id}"]`);
  await tool('rect');
  await page.mouse.move(694, 330);
  await page.mouse.down();
  await page.mouse.move(1192, 432, { steps: 6 });
  await page.mouse.up();
  await tool('step');
  await page.mouse.click(1192, 330);
  await page.mouse.move(1260, 40);
  await page.waitForTimeout(500);
  await save(await page.screenshot(), 'overlay', 1600, true);
  await ctx.close();
}

// ---------- 5. The Chrome Web Store screenshot from the repo ----------
await save(await sharp(resolve(SRC, 'store/screenshot-1.png')).toBuffer(), 'store-editor', 1280);

await browser.close();
server.close();
