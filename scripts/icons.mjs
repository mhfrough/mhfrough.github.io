// Generates every raster icon from the exact ء mark geometry (src/app/shared/ui/logo.ts).
//   node scripts/icons.mjs
// Output: public/favicon.ico (16 + 32), public/icons/{icon-192,icon-512,icon-maskable-512,apple-touch-icon}.png
// public/favicon.svg is hand-kept and not touched.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

// Keep in sync with MARK_ARC / MARK_BAR in src/app/shared/ui/logo.ts (48-unit grid).
const MARK_ARC = 'M30.36 15.14A9 9 0 1 0 24 30.5';
const MARK_BAR = { x: 12, y: 30, w: 25, h: 5 };
// Monochrome palette shared with the site (Quorum system, black and white re-skin).
const INK = '#ededed';
const BG = '#111111';

/**
 * @param {object} o
 * @param {number} o.scale   mark size relative to the 48 grid (1 = same as favicon.svg)
 * @param {number} o.radius  corner radius in grid units (0 = full bleed square)
 */
function markSvg({ scale = 1, radius = 0 } = {}) {
  // Scale around the optical centre of the mark (bbox x 12..37, y 10..35), so padding is even.
  const cx = 24.5;
  const cy = 22.5;
  const t = `translate(24 24) scale(${scale}) translate(${-cx} ${-cy})`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="${radius}" fill="${BG}"/>
  <g transform="${t}">
    <path d="${MARK_ARC}" fill="none" stroke="${INK}" stroke-width="5"/>
    <rect x="${MARK_BAR.x}" y="${MARK_BAR.y}" width="${MARK_BAR.w}" height="${MARK_BAR.h}" fill="${INK}"/>
  </g>
</svg>`;
}

const png = (svg, size) =>
  sharp(Buffer.from(svg), { density: Math.ceil((72 * size) / 48) * 2 })
    .resize(size, size, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9, palette: size <= 48 ? false : true, quality: 100 })
    .toBuffer();

/** Minimal ICO container with PNG payloads (supported by every browser since IE Vista era). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = 6 + dir.length;
  images.forEach(({ size, data }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt8(0, o + 2); // palette colours
    dir.writeUInt8(0, o + 3); // reserved
    dir.writeUInt16LE(1, o + 4); // colour planes
    dir.writeUInt16LE(32, o + 6); // bits per pixel
    dir.writeUInt32LE(data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...images.map((i) => i.data)]);
}

const pub = resolve(ROOT, 'public');
const icons = resolve(pub, 'icons');
mkdirSync(icons, { recursive: true });

// Favicon: rounded square like the nav brand mark (34px, 10px radius), mark enlarged so 16px stays legible.
const favicon = markSvg({ scale: 1.12, radius: 9 });
const ico32 = await png(favicon, 32);
const ico16 = await png(favicon, 16);
writeFileSync(resolve(pub, 'favicon.ico'), ico([
  { size: 16, data: ico16 },
  { size: 32, data: ico32 },
]));

// "any" purpose icons: same rounded-square proportion as the brand mark (10 / 34).
const any = markSvg({ scale: 1.1, radius: 14 });
writeFileSync(resolve(icons, 'icon-192.png'), await png(any, 192));
writeFileSync(resolve(icons, 'icon-512.png'), await png(any, 512));

// Maskable: full-bleed background, mark kept inside the 80% safe circle (radius 0.4 * 48 = 19.2).
// Mark bbox is ~25 units square, half-diagonal ~17.7 at scale 1, so 0.9 leaves clear margin.
writeFileSync(resolve(icons, 'icon-maskable-512.png'), await png(markSvg({ scale: 0.9, radius: 0 }), 512));

// Apple touch: iOS rounds the corners itself, so full bleed square.
writeFileSync(resolve(icons, 'apple-touch-icon.png'), await png(markSvg({ scale: 1.05, radius: 0 }), 180));

console.log('icons: favicon.ico (16, 32), icon-192, icon-512, icon-maskable-512, apple-touch-icon (180)');
