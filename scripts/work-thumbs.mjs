// 16:10 card thumbnails for /work. The cards show their screenshots in fixed 16:10 frames; the originals come in
// every shape (2:1 hero captures, 4:1 section strips, portrait mockups), so `object-fit: cover` cut text off at the
// sides. This bakes one exact 16:10 thumb per screenshot so the frame never crops anything it should not.
//   node scripts/work-thumbs.mjs [--force] [--sheet]
// Input: every '/images/...' path inside CARD_SHOTS in src/app/pages/work/work.data.ts (re-run after adding shots).
// Output: public/images/work/thumbs/<folder>--<name>.webp (1280x800, WebP q80; originals are never touched) and
// src/app/pages/work/work.thumbs.ts (CARD_THUMBS: original src -> thumb src). Unchanged thumbs are skipped unless
// --force; thumbs no longer referenced are deleted. --sheet writes contact sheets to .devcache/tmp/work-thumbs-<n>.png.
//
// Rule per image (r = width / height, 16:10 = 1.6):
//   r within 1.5% of 1.6   plain resize.
//   r wider                contain: whole image at full width, the empty bands above and below filled with the
//                          dominant colour of the image's own top / bottom rows (reads as the page continuing).
//   r taller, page shot    keep the full width and crop from the top (the bottom of the page goes, never the sides).
//   r taller, component    contain on the dominant colour of its own left / right columns: the hero mockups and demo
//                          captures (/images/work/*-app|-demo-N) are self-contained cards, cut in half they read wrong.
//                          (Long pages stay cropped from the top: fitted, a 0.7 page shrinks to an unreadable strip.)
// A fill edge covered by content (e.g. photos running off the top) borrows the opposite edge's colour.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import sharp from 'sharp';
import { CACHE, ROOT, hasFlag } from './_env.mjs';

const W = 1280;
const H = 800;
const RATIO = W / H;
const PUBLIC = resolve(ROOT, 'public');
const OUT_DIR = resolve(PUBLIC, 'images/work/thumbs');
const OUT_URL = '/images/work/thumbs';
const DATA = resolve(ROOT, 'src/app/pages/work/work.data.ts');
const MAP = resolve(ROOT, 'src/app/pages/work/work.thumbs.ts');
const FORCE = hasFlag('--force');
mkdirSync(OUT_DIR, { recursive: true });

// Every image path inside the CARD_SHOTS object literal, first occurrence order.
const src = readFileSync(DATA, 'utf8');
const start = src.indexOf('export const CARD_SHOTS');
if (start < 0) throw new Error('CARD_SHOTS not found in work.data.ts');
const end = src.indexOf('\n};', start);
const block = src.slice(start, end < 0 ? undefined : end);
const shots = [...new Set([...block.matchAll(/'(\/images\/[^']+\.(?:webp|png|jpe?g))'/g)].map((m) => m[1]))];

/** '/images/befiler/site-hero.webp' -> 'befiler--site-hero.webp' */
const flat = (s) => `${basename(dirname(s))}--${basename(s).replace(/\.[a-z]+$/i, '')}.webp`;
const isComponent = (s) => /^\/images\/work\/[^/]+-(app|demo-\d+)\.webp$/.test(s);

/**
 * Dominant colour of an edge strip: pixels are binned (4 bits per channel) and the fullest bin's mean wins, so a
 * photo or button touching the edge does not tint the fill; the page background does. `share` = that bin's share.
 */
async function dominant(file, region) {
  const { data, info } = await sharp(file).extract(region).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const bins = new Map();
  for (let i = 0; i < data.length; i += info.channels) {
    const key = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
    const b = bins.get(key) ?? [0, 0, 0, 0];
    b[0] += data[i];
    b[1] += data[i + 1];
    b[2] += data[i + 2];
    b[3]++;
    bins.set(key, b);
  }
  const [r, g, b, n] = [...bins.values()].reduce((m, x) => (x[3] > m[3] ? x : m));
  const colour = { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n), alpha: 1 };
  return { colour, share: n / (data.length / info.channels) };
}

/**
 * Fill colours for the two bands. An edge that is mostly one colour is page background and fills its own band; an
 * edge covered by content (photos running off the top, say) borrows the other edge's colour instead.
 */
async function fills(file, regionA, regionB) {
  const [a, b] = await Promise.all([dominant(file, regionA), dominant(file, regionB)]);
  const plain = (e) => e.share >= 0.5;
  if (plain(a) && plain(b)) return [a.colour, b.colour];
  if (plain(a)) return [a.colour, a.colour];
  if (plain(b)) return [b.colour, b.colour];
  const best = a.share >= b.share ? a.colour : b.colour;
  return [best, best];
}

const band = (width, height, background) =>
  sharp({ create: { width, height, channels: 4, background } }).png().toBuffer();

async function render(file, url, w, h) {
  const r = w / h;
  const edge = 3; // rows / columns sampled for the fill colour
  if (Math.abs(r - RATIO) / RATIO <= 0.015) {
    return { mode: 'resize', img: sharp(file).resize(W, H, { fit: 'fill' }) };
  }
  const layers = [];
  let base;
  if (r > RATIO) {
    const ih = Math.round(W / r);
    const top = Math.floor((H - ih) / 2);
    const [a, b] = await fills(file, { left: 0, top: 0, width: w, height: edge }, { left: 0, top: h - edge, width: w, height: edge });
    base = a;
    if (top > 0) layers.push({ input: await band(W, top, a), left: 0, top: 0 });
    if (H - top - ih > 0) layers.push({ input: await band(W, H - top - ih, b), left: 0, top: top + ih });
    layers.push({ input: await sharp(file).resize(W, ih, { fit: 'fill' }).toBuffer(), left: 0, top });
    return { mode: 'contain', img: sharp({ create: { width: W, height: H, channels: 4, background: base } }).composite(layers) };
  }
  if (!isComponent(url)) {
    return { mode: 'crop-top', img: sharp(file).resize(W, H, { fit: 'cover', position: 'top' }) };
  }
  const iw = Math.round(H * r);
  const left = Math.floor((W - iw) / 2);
  const [a, b] = await fills(file, { left: 0, top: 0, width: edge, height: h }, { left: w - edge, top: 0, width: edge, height: h });
  if (left > 0) layers.push({ input: await band(left, H, a), left: 0, top: 0 });
  if (W - left - iw > 0) layers.push({ input: await band(W - left - iw, H, b), left: left + iw, top: 0 });
  layers.push({ input: await sharp(file).resize(iw, H, { fit: 'fill' }).toBuffer(), left, top: 0 });
  return { mode: 'fit', img: sharp({ create: { width: W, height: H, channels: 4, background: a } }).composite(layers) };
}

const map = {};
const counts = {};
for (const s of shots) {
  const file = resolve(PUBLIC, '.' + s);
  if (!existsSync(file)) {
    console.warn(`missing, kept as is: ${s}`);
    continue;
  }
  const name = flat(s);
  const out = resolve(OUT_DIR, name);
  map[s] = `${OUT_URL}/${name}`;
  if (!FORCE && existsSync(out) && statSync(out).mtimeMs >= statSync(file).mtimeMs) {
    counts.skipped = (counts.skipped ?? 0) + 1;
    continue;
  }
  const { width, height } = await sharp(file).metadata();
  const { mode, img } = await render(file, s, width, height);
  // Flatten through a buffer: sharp cannot resize and composite in one pipeline reliably.
  await sharp(await img.png().toBuffer()).removeAlpha().webp({ quality: 80 }).toFile(out);
  counts[mode] = (counts[mode] ?? 0) + 1;
  console.log(`${mode.padEnd(8)} ${(width / height).toFixed(2)}  ${s}`);
}

// Drop thumbs that no card references any more.
const keep = new Set(Object.values(map).map((u) => basename(u)));
for (const f of readdirSync(OUT_DIR)) {
  if (f.endsWith('.webp') && !keep.has(f)) {
    unlinkSync(resolve(OUT_DIR, f));
    console.log(`removed  ${f}`);
  }
}

const lines = Object.entries(map).map(([k, v]) => `  '${k}': '${v}',`);
writeFileSync(
  MAP,
  `// Generated by scripts/work-thumbs.mjs from CARD_SHOTS in work.data.ts. Do not edit; re-run the script instead.\n` +
    `// Original screenshot -> its 16:10 card thumbnail (1280x800). Shots missing here fall back to the original.\n` +
    `export const CARD_THUMBS: Readonly<Record<string, string>> = {\n${lines.join('\n')}\n};\n`,
);
console.log(`${Object.keys(map).length} thumbs`, counts);

if (hasFlag('--sheet')) {
  // Contact sheets of 24 (4 x 6) so each one stays readable: .devcache/tmp/work-thumbs-<n>.png
  const cols = 4;
  const tw = 400;
  const th = 250;
  const pad = 10;
  const entries = Object.values(map);
  for (let p = 0; p * 24 < entries.length; p++) {
    const page = entries.slice(p * 24, p * 24 + 24);
    const rows = Math.ceil(page.length / cols);
    const tiles = await Promise.all(
      page.map(async (u, i) => ({
        input: await sharp(resolve(PUBLIC, '.' + u)).resize(tw, th).png().toBuffer(),
        left: pad + (i % cols) * (tw + pad),
        top: pad + Math.floor(i / cols) * (th + pad),
      })),
    );
    const sheet = resolve(CACHE, `tmp/work-thumbs-${p + 1}.png`);
    await sharp({
      create: { width: pad + cols * (tw + pad), height: pad + rows * (th + pad), channels: 3, background: '#555' },
    })
      .composite(tiles)
      .png()
      .toFile(sheet);
    console.log(`sheet: ${sheet}`);
  }
}
