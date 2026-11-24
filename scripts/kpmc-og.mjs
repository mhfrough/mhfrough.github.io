// Open Graph card for /work/kpmc, 1200 x 630 JPG: the site's own type (Geist) in the municipal portal's green,
// with the committee emblem and the home page from scripts/kpmc-shots.mjs.
//   node scripts/kpmc-og.mjs
// Output: public/og/og-kpmc.jpg (< 150 KB) and public/images/kpmc/cover.webp.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const b64 = (p) => readFileSync(resolve(ROOT, p)).toString('base64');
const face = (family, file) =>
  `@font-face{font-family:'${family}';font-weight:100 900;src:url(data:font/woff2;base64,${b64(file)}) format('woff2');}`;
const img = (p) => `data:image/webp;base64,${b64(p)}`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${face('Geist', 'node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2')}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;font-family:Geist,sans-serif;color:#1b2534;
  background:radial-gradient(70% 90% at 95% 10%,rgba(0,170,85,.14),transparent 60%),radial-gradient(50% 60% at 0% 100%,rgba(61,81,112,.1),transparent 60%),linear-gradient(170deg,#f3f5f7,#e6eef0)}
.copy{position:absolute;left:72px;top:68px;width:540px}
.brand{display:flex;align-items:center;gap:14px}
.brand img{height:44px;width:auto}
.brand b{font-weight:600;font-size:22px;letter-spacing:-.02em}
.tag{display:inline-block;margin-top:44px;padding:6px 16px;border-radius:999px;background:#007a45;color:#fff;font-weight:500;font-size:17px}
h1{margin-top:18px;font-weight:600;font-size:50px;line-height:1.06;letter-spacing:-.04em}
h1 span{color:#007a45}
p{margin-top:22px;font-size:21px;color:#3d5170;line-height:1.45}
.by{position:absolute;left:72px;bottom:54px;font-size:18px;color:#5a6575}
.by b{color:#1b2534;font-weight:600}
.shot{position:absolute;left:660px;top:96px;width:640px;border-radius:16px;overflow:hidden;border:1px solid #dde3e9;
  box-shadow:0 30px 60px -20px rgba(18,32,25,.35);transform:rotate(-3deg)}
.bar{height:30px;background:#e9edf1;border-bottom:1px solid #dde3e9;display:flex;gap:7px;align-items:center;padding:0 14px}
.bar i{width:9px;height:9px;border-radius:50%;background:#c5ced8}
.shot img{display:block;width:100%}
</style></head><body>
<div class="copy">
  <div class="brand"><img src="${img('public/images/kpmc/kpmc-logo.webp')}"><b>Khairpur Municipal Committee</b></div>
  <span class="tag">Case study</span>
  <h1>A city’s complaints,<br><span>handled in one place.</span></h1>
  <p>The public site and staff back office behind a municipal complaint app, built in under two months.</p>
</div>
<div class="by"><b>Mohammad Hamza</b> &nbsp;@mhfrough &middot; mhfrough.github.io</div>
<div class="shot"><div class="bar"><i></i><i></i><i></i></div><img src="${img('public/images/kpmc/site-home.webp')}"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();

const og = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(resolve(ROOT, 'public/og/og-kpmc.jpg'));
const cover = await sharp(png).webp({ quality: 82 }).toFile(resolve(ROOT, 'public/images/kpmc/cover.webp'));
console.log(`og-kpmc.jpg ${(og.size / 1024).toFixed(0)} KB, cover.webp ${(cover.size / 1024).toFixed(0)} KB`);
