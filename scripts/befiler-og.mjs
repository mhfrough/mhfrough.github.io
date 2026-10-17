// Open Graph card for /work/befiler, 1200 x 630 JPG: the site's type (Geist) in befiler.com's colours (white, one red).
//   node scripts/befiler-og.mjs
// Uses the Geist fontsource file and the public-site screenshot from scripts/befiler-shots.mjs.
// Output: public/og/og-befiler.jpg (< 150 KB) and public/images/befiler/cover.webp.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const b64 = (p) => readFileSync(resolve(ROOT, p)).toString('base64');
const geist = `@font-face{font-family:Geist;font-weight:100 900;src:url(data:font/woff2;base64,${b64('node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2')}) format('woff2');}`;
const img = (p) => `data:image/webp;base64,${b64(p)}`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${geist}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;font-family:Geist,sans-serif;color:#1b1b1b;
  background:radial-gradient(70% 90% at 95% 10%,rgba(228,30,38,.10),transparent 60%),linear-gradient(93deg,#fbfafa,#fcf6f5)}
.copy{position:absolute;left:72px;top:72px;width:560px}
.brand{display:flex;align-items:center;gap:14px}
.brand img{width:52px;height:52px;border-radius:12px}
.brand b{font-weight:600;font-size:22px}
.tag{display:inline-block;margin-top:44px;padding:6px 16px;border-radius:999px;background:#fde0e4;color:#c0121a;font-weight:500;font-size:18px}
h1{margin-top:18px;font-weight:600;font-size:64px;line-height:1.05;letter-spacing:-.045em}
h1 span{color:#c0121a}
p{margin-top:22px;font-size:21px;color:#444;line-height:1.45}
.by{position:absolute;left:72px;bottom:56px;font-size:18px;color:#5f6672}
.by b{color:#1b1b1b;font-weight:600}
.shot{position:absolute;left:690px;top:96px;width:620px;border-radius:16px;overflow:hidden;border:1px solid #e8e8e8;
  box-shadow:0 30px 60px -20px rgba(0,0,0,.25);transform:rotate(-3deg)}
.bar{height:30px;background:#f6f4f4;border-bottom:1px solid #e8e8e8;display:flex;gap:7px;align-items:center;padding:0 14px}
.bar i{width:9px;height:9px;border-radius:50%;background:#d6d6d6}
.shot img{display:block;width:100%}
</style></head><body>
<div class="copy">
  <div class="brand"><img src="${img('public/images/befiler/befiler-icon.webp')}"><b>Befiler</b></div>
  <span class="tag">Case study</span>
  <h1>Tax returns, filed <span>from any app.</span></h1>
  <p>A customer dashboard, a staff portal and a filing widget inside six banking apps and a wallet.</p>
</div>
<div class="by"><b>Mohammad Hamza</b> &nbsp;@mhfrough &middot; mhfrough.dev</div>
<div class="shot"><div class="bar"><i></i><i></i><i></i></div><img src="${img('public/images/befiler/site-hero.webp')}"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();

const og = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(resolve(ROOT, 'public/og/og-befiler.jpg'));
const cover = await sharp(png).webp({ quality: 82 }).toFile(resolve(ROOT, 'public/images/befiler/cover.webp'));
console.log(`og-befiler.jpg ${(og.size / 1024).toFixed(0)} KB, cover.webp ${(cover.size / 1024).toFixed(0)} KB`);
