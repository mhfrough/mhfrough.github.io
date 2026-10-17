// Screenshots of Scrawl (https://mhfrough.github.io/scrawl/) for the /work/scrawl case study.
//   node scripts/scrawl-shots.mjs [--src D:/workspace-personal/mhfrough_projects/scrawl]
// Serves the Scrawl folder as it is (no build step; scripts/serve.mjs on a free port), writes a sample drawing into the
// app's own storage (localStorage 'scrawl.*' in the shape app.js saves, one picture in its IndexedDB 'scrawl' store),
// then opens dialogs and popovers with the mouse like a person would. Text labels are measured with the app's own
// Scrawl.measureText so they sit centred in their shapes. The GitHub star count request is blocked so the header is
// the same on every run. Output: public/images/scrawl/*.webp and scrawl-mark.svg.
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';
import { startServer } from './serve.mjs';

const { chromium } = await import('playwright');
const argSrc = process.argv.indexOf('--src');
const SRC = argSrc > -1 ? process.argv[argSrc + 1] : 'D:/workspace-personal/mhfrough_projects/scrawl';
const OUT = resolve(ROOT, 'public/images/scrawl');
mkdirSync(OUT, { recursive: true });
copyFileSync(resolve(SRC, 'icon.svg'), resolve(OUT, 'scrawl-mark.svg'));

const server = await startServer(SRC, 0);
const BASE = `http://127.0.0.1:${server.address().port}/`;
const PICTURE = readFileSync(resolve(ROOT, 'public/images/quorum/site-hero.webp')).toString('base64');

// ---------- Sample drawings, in the app's element model (scene.js sanitize) ----------
const INK = '#1d1d1b', BLUE = '#0078bf', PINK = '#ff48b0', GREEN = '#00a95c', ORANGE = '#ff6c2f', RED = '#e3342f';
const YELLOW = '#ffe14a', PINK_F = '#ffb3dd', BLUE_F = '#a6d3f2', GREEN_F = '#9fe0bd', PEACH = '#ffc49e';

let seed = 1000;
const base = (type, o) => ({
  type, stroke: INK, bg: 'transparent', fill: 'offset', width: 2, dash: 'solid', rough: 1, round: false, opacity: 1, seed: (seed += 7919), ...o,
});
const box = (x, y, w, h, o = {}) => base('rect', { x, y, w, h, ...o });
const circle = (x, y, w, h, o = {}) => base('ellipse', { x, y, w, h, ...o });
const diamond = (x, y, w, h, o = {}) => base('diamond', { x, y, w, h, ...o });
const arrow = (pts, o = {}) => base('arrow', { x: 0, y: 0, w: 0, h: 0, points: pts, start: 'none', end: 'triangle', ...o });
const line = (pts, o = {}) => base('line', { x: 0, y: 0, w: 0, h: 0, points: pts, ...o });
const pen = (pts, o = {}) => base('draw', { x: 0, y: 0, w: 0, h: 0, points: pts, ...o });
const mark = (pts, o = {}) => base('mark', { x: 0, y: 0, w: 0, h: 0, points: pts, stroke: YELLOW, ...o });
// Text is placed by centre (cx, cy) or top-left (x, y); the page measures it.
const label = (text, cx, cy, o = {}) => ({ type: 'text', text, cx, cy, fontSize: 22, font: 'hand', align: 'center', stroke: INK, ...o });
const note = (text, x, y, o = {}) => ({ type: 'text', text, x, y, fontSize: 22, font: 'hand', align: 'left', stroke: INK, ...o });
const wave = (x, y, w, amp, n = 28) => Array.from({ length: n }, (_, i) => [x + (w * i) / (n - 1), y + Math.sin(i * 0.9) * amp]);
const tick = (x, y, s = 1) => [[x, y], [x + 6 * s, y + 7 * s], [x + 12 * s, y + 14 * s], [x + 20 * s, y + 4 * s], [x + 30 * s, y - 8 * s], [x + 40 * s, y - 20 * s]];

function onboarding() {
  seed = 1000;
  return [
    note('Onboarding, first pass', 80, 40, { fontSize: 44 }),
    mark([[338, 76], [420, 75], [512, 77], [552, 76]], { width: 4 }),
    note('what a new team sees on day one', 82, 104, { fontSize: 20, stroke: '#5b5a54' }),

    box(80, 190, 200, 100, { bg: YELLOW }),
    label('Sign up', 180, 240),
    arrow([[292, 240], [392, 240]]),
    diamond(400, 160, 240, 160, { stroke: BLUE, bg: BLUE_F, fill: 'dots' }),
    label('Has a team?', 520, 240, { stroke: BLUE }),
    arrow([[650, 240], [748, 240]], { stroke: BLUE }),
    note('yes', 680, 200, { fontSize: 18, stroke: BLUE }),
    box(760, 190, 210, 100, { stroke: PINK, bg: PINK_F, fill: 'solid', round: true }),
    label('Invite people', 865, 240),

    arrow([[520, 330], [520, 410]], { stroke: BLUE }),
    note('no', 532, 352, { fontSize: 18, stroke: BLUE }),
    circle(410, 420, 220, 110, { stroke: GREEN, bg: GREEN_F }),
    label('Start solo', 520, 475, { stroke: GREEN }),

    arrow([[865, 300], [865, 410]], { stroke: PINK }),
    box(760, 420, 210, 110, { bg: PEACH, fill: 'dots', width: 4 }),
    label('Dashboard', 865, 475, { fontSize: 24 }),
    arrow([[640, 475], [748, 475]], { stroke: GREEN }),
    pen(tick(985, 470, 1.1), { stroke: GREEN, width: 2 }),

    // A phone wireframe with a sticky reminder
    box(1080, 150, 250, 430, { round: true, width: 2 }),
    line([[1170, 172], [1240, 172]], { width: 4 }),
    box(1106, 205, 198, 110, { stroke: BLUE, bg: BLUE_F, fill: 'dots', rough: 1 }),
    line([[1106, 342], [1290, 342]], { width: 2, rough: 2 }),
    line([[1106, 372], [1256, 372]], { width: 2, rough: 2 }),
    line([[1106, 402], [1272, 402]], { width: 1, rough: 2, stroke: '#5b5a54' }),
    box(1120, 500, 170, 54, { bg: YELLOW, round: true }),
    label('Continue', 1205, 527, { fontSize: 20 }),
    note('one screen,\nnot three', 1360, 360, { stroke: RED, fontSize: 24 }),
    arrow([[1372, 440], [1352, 486], [1300, 520]], { stroke: RED, end: 'arrow' }),

    // A taped reference picture and a pen note
    { type: 'image', x: 80, y: 600, w: 352, h: 220, fileId: 'refpicture1', tape: true },
    note('reference: keep the\nsame calm header', 456, 660, { fontSize: 22, stroke: ORANGE }),
    pen(wave(460, 730, 220, 4), { stroke: ORANGE, width: 1 }),
    arrow([[760, 760], [900, 760]], { stroke: INK, dash: 'dashed', start: 'dot', end: 'arrow' }),
    note('ship Friday', 916, 744, { fontSize: 26 }),
    mark([[910, 790], [1010, 790], [1060, 789]], { stroke: PINK_F, width: 2 }),
  ];
}

function mindMap() {
  seed = 4000;
  return [
    circle(300, 200, 200, 120, { stroke: PINK, bg: PINK_F }),
    label('Trip', 400, 260, { fontSize: 30, stroke: PINK }),
    line([[300, 240], [160, 160]], { stroke: PINK }), box(40, 110, 140, 70, { bg: YELLOW }), label('Tickets', 110, 145),
    line([[310, 300], [170, 380]], { stroke: PINK }), box(40, 370, 140, 70, { bg: GREEN_F, fill: 'dots' }), label('Packing', 110, 405),
    line([[500, 250], [620, 180]], { stroke: PINK }), diamond(600, 110, 160, 110, { stroke: BLUE }), label('Budget?', 680, 165, { stroke: BLUE }),
  ];
}

function wireframe() {
  seed = 7000;
  return [
    box(40, 40, 520, 340, { round: true }),
    line([[40, 90], [560, 90]]),
    box(70, 120, 200, 130, { stroke: BLUE, bg: BLUE_F, fill: 'dots' }),
    line([[300, 130], [520, 130]], { rough: 2 }), line([[300, 160], [500, 160]], { rough: 2 }), line([[300, 190], [470, 190]], { rough: 2 }),
    box(70, 290, 140, 50, { bg: YELLOW, round: true }), label('Buy', 140, 315),
    note('header', 70, 54, { fontSize: 20 }),
  ];
}

function phoneFlow() {
  seed = 9000;
  return [
    note('Sign-up flow', 30, 0, { fontSize: 36 }),
    mark([[150, 34], [210, 33], [262, 35]], { width: 4 }),
    box(40, 90, 220, 84, { bg: YELLOW }),
    label('Sign up', 150, 132),
    arrow([[150, 184], [150, 244]]),
    diamond(30, 252, 240, 150, { stroke: BLUE, bg: BLUE_F, fill: 'dots' }),
    label('Has a team?', 150, 327, { stroke: BLUE }),
    arrow([[150, 410], [150, 470]], { stroke: BLUE }),
    note('yes', 162, 424, { fontSize: 18, stroke: BLUE }),
    box(40, 480, 220, 84, { stroke: PINK, bg: PINK_F, fill: 'solid', round: true }),
    label('Invite people', 150, 522),
    arrow([[150, 574], [150, 634]], { stroke: PINK }),
    circle(40, 644, 220, 104, { stroke: GREEN, bg: GREEN_F }),
    label('Dashboard', 150, 696, { stroke: GREEN }),
    arrow([[278, 327], [318, 420], [316, 620], [268, 690]], { stroke: RED, end: 'arrow' }),
    note('no', 284, 480, { fontSize: 20, stroke: RED }),
    pen(tick(30, 790, 1), { stroke: GREEN }),
    note('ship it', 84, 768, { fontSize: 26 }),
  ];
}

const DOCS = [
  { id: 'onboarding01', name: 'Onboarding flow', els: onboarding(), updated: Date.UTC(2026, 9, 14, 11, 20) },
  { id: 'wireframe001', name: 'Product page', els: wireframe(), updated: Date.UTC(2026, 9, 13, 16, 5) },
  { id: 'tripmindmap1', name: 'Trip ideas', els: mindMap(), updated: Date.UTC(2026, 9, 12, 9, 40) },
  { id: 'phoneflow001', name: 'Sign-up flow', els: phoneFlow(), updated: Date.UTC(2026, 9, 11, 18, 0) },
];

// ---------- Browser ----------
const browser = await chromium.launch();

async function open({ width, height, dpr = 1, theme = 'dark', paper = 'dots', mobile = false, current = DOCS[0].id }) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile, colorScheme: theme });
  await ctx.route(/api\.github\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    async ({ docs, picture, theme, paper, current }) => {
      const S = window.Scrawl;
      const index = [];
      for (const d of docs) {
        const elements = d.els.map((raw, i) => {
          const el = { id: `${d.id.slice(0, 6)}${i.toString(36).padStart(4, '0')}`, ...raw };
          if (el.type === 'text') {
            const m = S.measureText(el);
            el.w = m.w;
            el.h = m.h;
            if (raw.cx != null) { el.x = raw.cx - m.w / 2; el.y = raw.cy - m.h / 2; }
            delete el.cx; delete el.cy;
          }
          return el;
        });
        localStorage.setItem(`scrawl.doc.${d.id}`, JSON.stringify({ id: d.id, name: d.name, elements, updated: d.updated }));
        index.push({ id: d.id, name: d.name, updated: d.updated, count: elements.length });
      }
      localStorage.setItem('scrawl.index', JSON.stringify(index));
      localStorage.setItem('scrawl.current', JSON.stringify(current));
      localStorage.setItem('scrawl.prefs.v2', JSON.stringify({ theme, grid: false, paper, keepTool: true }));
      const blob = await (await fetch(`data:image/webp;base64,${picture}`)).blob();
      await new Promise((ok, fail) => {
        const req = indexedDB.open('scrawl', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('files', { keyPath: 'id' });
        req.onsuccess = () => {
          const tx = req.result.transaction('files', 'readwrite');
          tx.objectStore('files').put({ id: 'refpicture1', blob, created: Date.now() });
          tx.oncomplete = () => { req.result.close(); ok(); };
          tx.onerror = () => fail(tx.error);
        };
        req.onerror = () => fail(req.error);
      });
      // The blank page the app opened would save itself on unload and become the current drawing again.
      Storage.prototype.setItem = () => {};
    },
    { docs: current === 'phoneflow001' ? DOCS : DOCS.filter((d) => d.id !== 'phoneflow001'), picture: PICTURE, theme, paper, current },
  );
  await page.reload({ waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.locator('#canvas').focus().catch(() => {});
  await page.keyboard.press('Shift+Digit1');
  await page.waitForTimeout(500);
  return { ctx, page };
}

// Saves a WebP, optionally clipped to a CSS-pixel box and resized to `width` (detail shots stay small on the page).
async function save(page, name, { clip, width } = {}) {
  const png = await page.screenshot({ type: 'png', clip });
  let img = sharp(png);
  if (width) img = img.resize({ width });
  const info = await img.webp({ quality: 80 }).toFile(resolve(OUT, `${name}.webp`));
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

// A 4:3 box of 760 x 570 CSS px centred on the union of the given elements, kept inside the 1600 x 1000 viewport.
async function around(page, selectors) {
  const boxes = (await Promise.all(selectors.map((s) => page.locator(s).first().boundingBox()))).filter(Boolean);
  const x1 = Math.min(...boxes.map((b) => b.x));
  const y1 = Math.min(...boxes.map((b) => b.y));
  const x2 = Math.max(...boxes.map((b) => b.x + b.width));
  const y2 = Math.max(...boxes.map((b) => b.y + b.height));
  const w = 760;
  const h = 570;
  return {
    x: Math.max(0, Math.min(1600 - w, (x1 + x2) / 2 - w / 2)),
    y: Math.max(0, Math.min(1000 - h, (y1 + y2) / 2 - h / 2)),
    width: w,
    height: h,
  };
}

// Desktop, dark: the main shot, the style popover, the export dialog and the drawings list.
{
  const { ctx, page } = await open({ width: 1600, height: 1000, dpr: 2 });
  await save(page, 'board-dark', { width: 1600 });
  // A smaller copy for phones (srcset on the page).
  const small = await sharp(resolve(OUT, 'board-dark.webp')).resize({ width: 800 }).webp({ quality: 80 }).toFile(resolve(OUT, 'board-dark-800.webp'));
  console.log(`board-dark-800.webp ${small.width}x${small.height} ${(small.size / 1024).toFixed(0)} KB`);

  // Select the diamond and open its stroke popover (thickness, line, hand, corners).
  const pt = await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('scrawl.doc.onboarding01'));
    const v = raw.view;
    return { x: 520 * v.zoom + v.ox, y: 292 * v.zoom + v.oy };
  });
  await page.mouse.click(pt.x, pt.y);
  await page.waitForTimeout(300);
  await page.click('#ctxbar [data-pop="stroke"]');
  await page.waitForTimeout(350);
  await save(page, 'style-dark', { clip: await around(page, ['#ctxbar', '#pop']), width: 960 });
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  await page.click('#exportBtn');
  await page.waitForTimeout(900);
  await save(page, 'export-dark', { clip: await around(page, ['#exportDialog']), width: 960 });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  await page.click('#drawingsBtn');
  await page.waitForTimeout(700);
  await save(page, 'drawings-dark', { clip: await around(page, ['#drawingsDialog']), width: 960 });
  await ctx.close();
}

// Desktop, light paper.
{
  const { ctx, page } = await open({ width: 1600, height: 1000, dpr: 2, theme: 'light' });
  await save(page, 'board-light', { width: 1200 });
  await ctx.close();
}

// Phones: tools along the bottom.
for (const theme of ['dark', 'light']) {
  const { ctx, page } = await open({ width: 390, height: 844, dpr: 2, theme, mobile: true, current: 'phoneflow001' });
  await page.click('#zoomOut');
  await page.waitForTimeout(300);
  await save(page, `phone-${theme}`, { width: 480 });
  await ctx.close();
}

await browser.close();
server.close();
