// Open Graph card for /work/sizzle, 1200 x 630 JPG: the site's own type (Geist) on Sizzle's soft black with its bronze
// accent and its own mark, beside the project page screenshot and the trailer's bronze reveal still, both from
// scripts/sizzle-shots.mjs.
//   node scripts/sizzle-og.mjs
// Output: public/og/og-sizzle.jpg (< 150 KB) and public/images/sizzle/cover.webp.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const b64 = (p) => readFileSync(resolve(ROOT, p)).toString('base64');
const face = (family, file) =>
  `@font-face{font-family:'${family}';font-weight:100 900;src:url(data:font/woff2;base64,${b64(file)}) format('woff2');}`;
const img = (p, type = 'webp') => `data:image/${type};base64,${b64(p)}`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${face('Geist', 'node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2')}
${face('Geist Mono', 'node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2')}
*{box-sizing:border-box;margin:0}
body{position:relative;width:1200px;height:630px;overflow:hidden;font-family:Geist,sans-serif;color:#f2f2f2;background:
  radial-gradient(60% 80% at 95% 5%,rgba(160,134,114,.2),transparent 60%),
  radial-gradient(45% 60% at 0% 100%,rgba(160,134,114,.07),transparent 60%),
  #111111}
.copy{position:absolute;left:72px;top:66px;width:500px}
.brand{display:flex;align-items:center;gap:14px}
.brand img{width:44px;height:44px;display:block;border-radius:6px}
.brand b{font-weight:600;font-size:24px;letter-spacing:-.02em}
.tag{display:inline-block;margin-top:42px;padding:6px 16px;border-radius:999px;background:#a08672;color:#111111;font-weight:500;font-size:17px}
h1{margin-top:18px;font-weight:600;font-size:54px;line-height:1.06;letter-spacing:-.04em}
h1 span{color:#b9a08b}
p{margin-top:22px;font-size:21px;color:#cfcfcf;line-height:1.45}
.mono{font-family:'Geist Mono',monospace}
.by{position:absolute;left:72px;bottom:54px;font-size:18px;color:#a3a3a3}
.by b{color:#f2f2f2;font-weight:600}
.shot{position:absolute;left:600px;top:120px;width:640px;border-radius:16px;overflow:hidden;border:1px solid #2c2c2c;
  box-shadow:0 30px 70px -20px rgba(0,0,0,.8);transform:rotate(-3deg)}
.bar{height:30px;background:#242424;border-bottom:1px solid #2c2c2c;display:flex;gap:7px;align-items:center;padding:0 14px}
.bar i{width:9px;height:9px;border-radius:50%;background:#3d3833}
.shot img{display:block;width:100%}
.reel{position:absolute;left:884px;top:54px;width:228px;aspect-ratio:9/16;border-radius:16px;overflow:hidden;border:1px solid #5a4a3e;
  box-shadow:0 30px 70px -18px rgba(0,0,0,.85),0 0 60px rgba(160,134,114,.18);transform:rotate(4deg)}
.reel img{display:block;width:100%;height:100%;object-fit:cover}
</style></head><body>
<div class="copy">
  <div class="brand">
    <img src="${img('public/images/sizzle/sizzle-mark.svg', 'svg+xml')}" alt="">
    <b>Sizzle</b>
  </div>
  <span class="tag">Case study</span>
  <h1>Promo reels,<br><span>cut by your agent.</span></h1>
  <p>A skill for AI agents: an HTML reel from your real interface, approved by you, rendered to 4K with music.</p>
</div>
<div class="by"><b>Mohammad Hamza</b> &nbsp;<span class="mono">@mhfrough</span> &middot; mhfrough.dev</div>
<div class="shot"><div class="bar"><i></i><i></i><i></i></div><img src="${img('public/images/sizzle/site.webp')}"></div>
<div class="reel"><img src="${img('public/images/sizzle/still-reveal.webp')}"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();

const og = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(resolve(ROOT, 'public/og/og-sizzle.jpg'));
const cover = await sharp(png).webp({ quality: 82 }).toFile(resolve(ROOT, 'public/images/sizzle/cover.webp'));
console.log(`og-sizzle.jpg ${(og.size / 1024).toFixed(0)} KB, cover.webp ${(cover.size / 1024).toFixed(0)} KB`);
