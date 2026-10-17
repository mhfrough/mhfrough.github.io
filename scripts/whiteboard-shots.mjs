// Screenshots of the owner's Whiteboard app for the /work/whiteboard case study.
//   1. Run the archived frontend (only /whiteboard is used), with the .devcache env vars set:
//        cd D:\workspace-personal\archive\mhfrough.dev\mhfrough_frontend
//        npx ng serve --port 4291 --host 127.0.0.1
//   2. node scripts/whiteboard-shots.mjs [--base http://127.0.0.1:4291]
// The board is the real app: the demo scene is written into the app's own autosave slot (localStorage
// 'wb:autosave', the same JSON the app writes) so the layout is tidy and repeatable, then Playwright draws, selects,
// drags and opens menus with the mouse like a person would. No backend runs: cloud sync stays off and the save
// badge shows the local save. Output: public/images/whiteboard/*.webp (quality 80, each under ~200 KB).
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const OUT = resolve(ROOT, 'public/images/whiteboard');
mkdirSync(OUT, { recursive: true });
const argBase = process.argv.indexOf('--base');
const BASE = argBase > -1 ? process.argv[argBase + 1] : 'http://127.0.0.1:4291';

// ---------- Demo scene, in the app's own element model ----------
const T0 = Date.UTC(2026, 6, 9, 10, 0, 0);
let n = 0;
const id = () => `el_demo_${(++n).toString(36)}`;
const style = (o = {}) => ({ strokeColor: '#e4e0d8', fillColor: 'transparent', strokeWidth: 2, opacity: 1, dash: 'solid', cornerRadius: 0, ...o });
const base = (type, x, y, width, height, o = {}) => ({
  id: id(), type, x, y, width, height, rotation: 0, locked: false, groupId: null, createdAt: T0 + n, updatedAt: T0 + n, style: style(o.style), ...o.extra,
});
const THEME_FONT = '"Inconsolata", "Courier New", monospace';
const CODE_FONT = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';
const rect = (x, y, w, h, s = {}) => base('rectangle', x, y, w, h, { style: s });
const ellipse = (x, y, w, h, s = {}) => base('ellipse', x, y, w, h, { style: s });
const diamond = (x, y, w, h, s = {}) => base('diamond', x, y, w, h, { style: s });
const text = (x, y, w, html, o = {}) =>
  base('text', x, y, w, o.h ?? 24, {
    style: o.style,
    extra: { text: html, fontFamily: o.font ?? THEME_FONT, fontSize: o.size ?? 15, fontWeight: o.weight ?? 500, textAlign: o.align ?? 'center', color: o.color ?? '#e4e0d8', sizing: 'auto', ...(o.kind ? { kind: o.kind } : {}) },
  });
const sticky = (x, y, html, fill, o = {}) =>
  base('sticky', x, y, o.w ?? 192, o.h ?? 168, { extra: { text: html, fontFamily: THEME_FONT, fontSize: o.size ?? 17, fontWeight: 500, fill } });
const arrow = (pts, s = {}, type = 'arrow') => {
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return base(type, x, y, Math.max(...xs) - x, Math.max(...ys) - y, { style: s, extra: { points: pts } });
};
const frame = (x, y, w, h, label) => base('frame', x, y, w, h, { extra: { label } });

const INDIGO = '#6366f1';
const GREEN = '#4ade80';
const AMBER = '#f59e0b';

function scene() {
  n = 0;
  const els = [
    text(48, 96, 640, 'How a stroke travels', { size: 26, weight: 700, align: 'left' }),
    text(48, 136, 640, 'One board, two browsers, one relay.', { size: 15, weight: 400, align: 'left', color: '#928e87' }),

    frame(48, 216, 600, 456, 'Browser A'),
    rect(96, 264, 216, 72, { strokeColor: INDIGO }),
    text(96, 288, 216, 'pointer events'),
    rect(96, 408, 216, 72, { strokeColor: INDIGO }),
    text(96, 432, 216, 'signal services'),
    ellipse(96, 552, 216, 72, { strokeColor: INDIGO }),
    text(96, 576, 216, 'SVG + overlays'),
    arrow([{ x: 204, y: 336 }, { x: 204, y: 408 }], { strokeColor: '#e4e0d8' }),
    arrow([{ x: 204, y: 480 }, { x: 204, y: 552 }], { strokeColor: '#e4e0d8' }),

    text(360, 360, 264, 'scene.updateElement(id, patch)<br>history.commit()', {
      font: CODE_FONT, size: 13, weight: 400, align: 'left', color: '#e4e0d8', kind: 'code', h: 64, style: { fillColor: '#1a1917' },
    }),
    sticky(408, 504, 'Undo = up to 100 scene snapshots', AMBER, { w: 192, h: 144 }),

    frame(744, 216, 504, 456, 'Server'),
    rect(792, 264, 408, 72, { strokeColor: GREEN }),
    text(792, 288, 408, 'socket.io  /whiteboard  doc:&lt;id&gt;'),
    diamond(888, 384, 216, 120, { strokeColor: GREEN }),
    text(888, 432, 216, 'REST: role?'),
    rect(792, 552, 408, 72, { strokeColor: GREEN, dash: 'dashed' }),
    text(792, 576, 408, 'PostgreSQL  jsonb scene'),
    arrow([{ x: 996, y: 504 }, { x: 996, y: 552 }], { strokeColor: '#e4e0d8' }),

    arrow([{ x: 312, y: 300 }, { x: 792, y: 300 }], { strokeColor: AMBER, dash: 'dashed' }, 'double-arrow'),
    text(408, 264, 288, 'scene:op  upsert / delete', { size: 13, weight: 400, color: AMBER }),
    // Browser B: its label is seeded, the box around it and its arrow are drawn live with the mouse.
    text(888, 108, 312, 'Browser B'),
  ];
  return els;
}

function versions() {
  const els = scene();
  return [
    { id: 'v_demo3', label: 'Server frame added', timestamp: T0 + 3 * 3600e3, elements: els },
    { id: 'v_demo2', label: 'Client flow', timestamp: T0 + 2 * 3600e3, elements: els.slice(0, 13) },
    { id: 'v_demo1', label: 'First sketch', timestamp: T0 + 3600e3, elements: els.slice(0, 4) },
  ];
}

// ---------- Capture ----------
const VIEW = { width: 1440, height: 900 };
const browser = await chromium.launch();

async function open({ seed = true } = {}) {
  const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: 1.25, colorScheme: 'dark', reducedMotion: 'reduce' });
  // Backend is not running: answer its warm-up ping and API calls quietly instead of letting the proxy 500.
  await ctx.route('**/api/v1**', (r) => r.fulfill({ status: 503, body: '' }));
  if (seed) {
    const payload = JSON.stringify({ elements: scene(), timestamp: T0 + 4 * 3600e3 });
    const vers = JSON.stringify(versions());
    await ctx.addInitScript(
      ([a, v]) => {
        if (!sessionStorage.getItem('wb-seeded')) {
          localStorage.setItem('wb:autosave', a);
          localStorage.setItem('wb:versions', v);
          sessionStorage.setItem('wb-seeded', '1');
        }
      },
      [payload, vers],
    );
  }
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror:', e.message.slice(0, 200)));
  await page.goto(BASE + '/whiteboard', { waitUntil: 'networkidle', timeout: 120_000 });
  await page.waitForSelector('.wb-surface');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  return { ctx, page };
}

async function save(buf, name, width = 1600) {
  const file = resolve(OUT, `${name}.webp`);
  const info = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(file);
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

/** Screen point of a world point at the default view (zoom 1, pan 0): the surface's top-left is world 0,0. */
async function toScreen(page, x, y) {
  const box = await page.locator('.wb-surface').boundingBox();
  return { x: box.x + x, y: box.y + y };
}

async function tool(page, name) {
  await page.getByRole('button', { name: `${name} tool`, exact: true }).click();
}

async function drag(page, from, to, { steps = 12, hold = false } = {}) {
  const a = await toScreen(page, from.x, from.y);
  const b = await toScreen(page, to.x, to.y);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps });
  if (!hold) await page.mouse.up();
}

// 1. The board, plus a box and an arrow drawn live with the mouse (grid snap keeps them on the 24px grid).
{
  const { ctx, page } = await open();
  await tool(page, 'Rectangle');
  await drag(page, { x: 888, y: 96 }, { x: 1200, y: 144 });
  await tool(page, 'Arrow');
  await drag(page, { x: 1044, y: 144 }, { x: 1044, y: 264 });
  await page.mouse.move(VIEW.width - 4, VIEW.height / 2);
  await page.waitForTimeout(500);
  await save(await page.screenshot(), 'board');

  // 2. Drag the amber note so its edges line up with the code block: smart guides + selection box.
  const note = await toScreen(page, 504, 610);
  await page.mouse.move(note.x, note.y);
  await page.mouse.down();
  await page.mouse.move(note.x - 24, note.y + 30, { steps: 10 });
  await page.mouse.move(note.x - 48, note.y + 24, { steps: 10 });
  await page.waitForTimeout(400);
  await save(await page.screenshot(), 'guides');
  await page.mouse.up();

  // 3. One shape selected: handles, rotate knob, the inspector and the context bar.
  const shape = await toScreen(page, 996, 486);
  await page.mouse.click(shape.x, shape.y);
  await page.waitForTimeout(400);
  await save(await page.screenshot(), 'select');

  // 4. Export menu.
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  await page.waitForTimeout(400);
  await save(await page.screenshot({ clip: { x: 0, y: 40, width: 760, height: 640 } }), 'export', 1200);
  await page.keyboard.press('Escape');

  // 5. Version history.
  await page.getByRole('button', { name: 'Version history', exact: true }).click();
  await page.waitForTimeout(400);
  await save(await page.screenshot({ clip: { x: 0, y: 40, width: 760, height: 420 } }), 'versions', 1200);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');

  // 6. Layers panel open, zoomed out a step so the minimap shows the viewport inside the scene.
  await page.getByRole('button', { name: 'Toggle layers panel' }).click();
  await page.getByRole('button', { name: 'Zoom out' }).click();
  await page.waitForTimeout(500);
  await save(await page.screenshot(), 'layers');

  await ctx.close();
}

await browser.close();
