// Preview cards for the home hero's tool shelf: each tool's own Open Graph card (1200 x 630), read from its source
// folder next to this repo, saved as WebP at 1200 and 640 wide.
//   node scripts/home-tools.mjs [--src D:/workspace-personal/mhfrough_projects]
// Output: public/images/home/tools/<id>.webp and <id>-640.webp (quality 80).
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const argSrc = process.argv.indexOf('--src');
const SRC = argSrc > -1 ? process.argv[argSrc + 1] : resolve(ROOT, '../mhfrough_projects');
const OUT = resolve(ROOT, 'public/images/home/tools');
mkdirSync(OUT, { recursive: true });

for (const id of ['flick', 'pinch', 'scrawl', 'sizzle', 'swoop']) {
  const src = resolve(SRC, id, 'assets/og-image.jpg');
  for (const [w, suffix] of [[1200, ''], [640, '-640']]) {
    const info = await sharp(src).resize({ width: w }).webp({ quality: 80 }).toFile(resolve(OUT, `${id}${suffix}.webp`));
    console.log(`${id}${suffix}.webp ${info.width}x${info.height} ${Math.round(info.size / 1024)} KB`);
  }
}
