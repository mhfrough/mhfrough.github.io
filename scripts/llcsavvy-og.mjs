// Open Graph card for /work/llcsavvy, 1200 x 630 JPG: the site's own type (Geist) in LLC SAVVY's navy, red and
// crescent green, with the product's globe mark (public/images/llcsavvy/llcsavvy-mark.webp) and the home page from
// scripts/llcsavvy-shots.mjs.
//   node scripts/llcsavvy-og.mjs
// Output: public/og/og-llcsavvy.jpg (< 150 KB) and public/images/llcsavvy/cover.webp.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const b64 = (p) => readFileSync(resolve(ROOT, p)).toString('base64');
const face = (family, file) =>
  `@font-face{font-family:'${family}';font-weight:100 900;src:url(data:font/woff2;base64,${b64(file)}) format('woff2');}`;
const img = (p, type = 'image/webp') => `data:${type};base64,${b64(p)}`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${face('Geist', 'node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2')}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;font-family:Geist,sans-serif;color:#16202f;
  background:radial-gradient(70% 90% at 95% 10%,rgba(10,49,97,.14),transparent 60%),radial-gradient(50% 60% at 0% 100%,rgba(24,184,88,.08),transparent 60%),linear-gradient(170deg,#f3f4f6,#e9ecf1)}
.copy{position:absolute;left:72px;top:68px;width:540px}
.brand{display:flex;align-items:center;gap:14px}
.tile{width:52px;height:52px;border-radius:14px;background:#fff;border:1px solid #dde1e8;display:grid;place-items:center}
.tile img{width:40px;height:40px}
.brand b{font-weight:600;font-size:22px;letter-spacing:-.01em}
.tag{display:inline-block;margin-top:40px;padding:6px 16px;border-radius:999px;background:#b31942;color:#fff;font-weight:500;font-size:17px}
h1{margin-top:18px;font-weight:600;font-size:52px;line-height:1.06;letter-spacing:-.04em}
h1 span{color:#0a3161}
p{margin-top:22px;font-size:21px;color:#3a4454;line-height:1.45}
p b{color:#13753c;font-weight:600}
.by{position:absolute;left:72px;bottom:54px;font-size:18px;color:#5a6372}
.by b{color:#16202f;font-weight:600}
.shot{position:absolute;left:660px;top:96px;width:640px;border-radius:16px;overflow:hidden;border:1px solid #dde1e8;
  box-shadow:0 30px 60px -20px rgba(10,49,97,.38);transform:rotate(-3deg)}
.bar{height:30px;background:#eceef2;border-bottom:1px solid #dde1e8;display:flex;gap:7px;align-items:center;padding:0 14px}
.bar i{width:9px;height:9px;border-radius:50%;background:#c4cad5}
.shot img{display:block;width:100%}
</style></head><body>
<div class="copy">
  <div class="brand"><span class="tile"><img src="${img('public/images/llcsavvy/llcsavvy-mark.webp')}"></span><b>LLC SAVVY</b></div>
  <span class="tag">Case study</span>
  <h1>A US company,<br><span>paid for in rupees.</span></h1>
  <p>Finclore's sister on the same Angular base: <b>dollars and rupees</b> in one checkout, a direct debit and promo prices.</p>
</div>
<div class="by"><b>Mohammad Hamza</b> &nbsp;@mhfrough &middot; mhfrough.github.io</div>
<div class="shot"><div class="bar"><i></i><i></i><i></i></div><img src="${img('public/images/llcsavvy/site-home.webp')}"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();

const og = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(resolve(ROOT, 'public/og/og-llcsavvy.jpg'));
const cover = await sharp(png).webp({ quality: 82 }).toFile(resolve(ROOT, 'public/images/llcsavvy/cover.webp'));
console.log(`og-llcsavvy.jpg ${(og.size / 1024).toFixed(0)} KB, cover.webp ${(cover.size / 1024).toFixed(0)} KB`);
