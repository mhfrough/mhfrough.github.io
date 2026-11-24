// Open Graph card for /work/malik-transport, 1200 x 630 JPG: the site's own type (Geist) in the transport
// company's blue and navy, with its truck mark and the price calculator from scripts/malik-transport-shots.mjs.
//   node scripts/malik-transport-og.mjs
// Output: public/og/og-malik-transport.jpg (< 150 KB) and public/images/malik-transport/cover.webp.
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
body{width:1200px;height:630px;overflow:hidden;font-family:Geist,sans-serif;color:#1b2236;
  background:radial-gradient(70% 90% at 95% 10%,rgba(51,101,164,.16),transparent 60%),radial-gradient(50% 60% at 0% 100%,rgba(22,176,227,.1),transparent 60%),linear-gradient(170deg,#f4f6fa,#e4ebf5)}
.copy{position:absolute;left:72px;top:64px;width:540px}
.brand{display:flex;align-items:center;gap:14px}
.brand span{width:56px;height:56px;border-radius:14px;background:#e3ecf7;display:grid;place-items:center}
.brand img{width:40px;height:auto}
.brand b{font-weight:600;font-size:22px;letter-spacing:-.02em}
.tag{display:inline-block;margin-top:40px;padding:6px 16px;border-radius:999px;background:#3365a4;color:#fff;font-weight:500;font-size:17px}
h1{margin-top:18px;font-weight:600;font-size:50px;line-height:1.06;letter-spacing:-.04em}
h1 span{color:#3365a4}
p{margin-top:22px;font-size:21px;color:#3a4660;line-height:1.45}
.by{position:absolute;left:72px;bottom:54px;font-size:18px;color:#5a6478}
.by b{color:#1b2236;font-weight:600}
.shot{position:absolute;left:640px;top:70px;width:660px;border-radius:16px;overflow:hidden;border:1px solid #dae1eb;background:#fff;
  box-shadow:0 30px 60px -20px rgba(35,35,67,.35);transform:rotate(-3deg)}
.bar{height:30px;background:#e8edf4;border-bottom:1px solid #dae1eb;display:flex;gap:7px;align-items:center;padding:0 14px}
.bar i{width:9px;height:9px;border-radius:50%;background:#c2ccda}
.shot img{display:block;width:100%}
.phone{position:absolute;left:985px;top:250px;width:190px;padding:6px;border-radius:30px;background:#232343;
  box-shadow:0 30px 60px -20px rgba(35,35,67,.45);transform:rotate(4deg)}
.phone img{display:block;width:100%;height:340px;object-fit:cover;object-position:top;border-radius:24px}
</style></head><body>
<div class="copy">
  <div class="brand"><span><img src="${img('public/images/malik-transport/malik-transport-mark.webp')}"></span><b>Malik Transport Solutions</b></div>
  <span class="tag">Case study</span>
  <h1>A price before the call,<br><span>a driver after it.</span></h1>
  <p>A public fare calculator and one portal for customers, office and drivers, built in Angular.</p>
</div>
<div class="by"><b>Mohammad Hamza</b> &nbsp;@mhfrough &middot; mhfrough.github.io</div>
<div class="shot"><div class="bar"><i></i><i></i><i></i></div><img src="${img('public/images/malik-transport/site-calculator.webp')}"></div>
<div class="phone"><img src="${img('public/images/malik-transport/site-mobile.webp')}"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => (i.onload = i.onerror = r)))));
});
const png = await page.screenshot({ type: 'png' });
await browser.close();

const og = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(resolve(ROOT, 'public/og/og-malik-transport.jpg'));
const cover = await sharp(png).webp({ quality: 82 }).toFile(resolve(ROOT, 'public/images/malik-transport/cover.webp'));
console.log(`og-malik-transport.jpg ${(og.size / 1024).toFixed(0)} KB, cover.webp ${(cover.size / 1024).toFixed(0)} KB`);
