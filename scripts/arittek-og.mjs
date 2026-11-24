// Open Graph card for /work/arittek, 1200 x 630 JPG: the site's own type (Geist) in arittek.com's navy, gold and
// cream, with the Arittek mark and the home page hero from scripts/arittek-shots.mjs.
//   node scripts/arittek-og.mjs
// Output: public/og/og-arittek.jpg (< 150 KB) and public/images/arittek/cover.webp.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const b64 = (p) => readFileSync(resolve(ROOT, p)).toString('base64');
const face = (family, file) =>
  `@font-face{font-family:'${family}';font-weight:100 900;src:url(data:font/woff2;base64,${b64(file)}) format('woff2');}`;
const webp = (p) => `data:image/webp;base64,${b64(p)}`;
const svg = (p) => `data:image/svg+xml;base64,${b64(p)}`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${face('Geist', 'node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2')}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;font-family:Geist,sans-serif;color:#14284a;
  background:radial-gradient(70% 90% at 95% 10%,rgba(184,134,59,.16),transparent 60%),radial-gradient(50% 60% at 0% 100%,rgba(20,40,74,.1),transparent 60%),linear-gradient(170deg,#fbf9f4,#f3eee3)}
.copy{position:absolute;left:72px;top:68px;width:540px}
.brand{display:flex;align-items:center;gap:14px}
.brand span{width:64px;height:44px;display:grid;place-items:center;border-radius:12px;background:#fff;border:1px solid #e6e0d2}
.brand img{width:46px;height:auto}
.brand b{font-weight:600;font-size:22px;letter-spacing:-.02em}
.tag{display:inline-block;margin-top:44px;padding:6px 16px;border-radius:999px;background:#14284a;color:#fff;font-weight:500;font-size:17px}
h1{margin-top:18px;font-weight:600;font-size:50px;line-height:1.06;letter-spacing:-.04em}
h1 span{color:#7d5924}
p{margin-top:22px;font-size:21px;color:#47525f;line-height:1.45}
.by{position:absolute;left:72px;bottom:54px;font-size:18px;color:#5d6673}
.by b{color:#14284a;font-weight:600}
.shot{position:absolute;left:660px;top:120px;width:640px;border-radius:16px;overflow:hidden;border:1px solid #e6e0d2;
  box-shadow:0 30px 60px -20px rgba(14,31,58,.4);transform:rotate(-3deg)}
.bar{height:30px;background:#f3eee3;border-bottom:1px solid #e6e0d2;display:flex;gap:7px;align-items:center;padding:0 14px}
.bar i{width:9px;height:9px;border-radius:50%;background:#d3cab6}
.shot img{display:block;width:100%}
</style></head><body>
<div class="copy">
  <div class="brand"><span><img src="${svg('public/images/arittek/arittek-mark.svg')}"></span><b>Arittek</b></div>
  <span class="tag">Case study</span>
  <h1>A company site<br><span>with its own back office.</span></h1>
  <p>20 prerendered pages and a PHP back office for the blog, campaigns, inquiries and roles.</p>
</div>
<div class="by"><b>Mohammad Hamza</b> &nbsp;@mhfrough &middot; mhfrough.github.io</div>
<div class="shot"><div class="bar"><i></i><i></i><i></i></div><img src="${webp('public/images/arittek/site-home.webp')}"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();

const og = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(resolve(ROOT, 'public/og/og-arittek.jpg'));
const cover = await sharp(png).webp({ quality: 82 }).toFile(resolve(ROOT, 'public/images/arittek/cover.webp'));
console.log(`og-arittek.jpg ${(og.size / 1024).toFixed(0)} KB, cover.webp ${(cover.size / 1024).toFixed(0)} KB`);
