// Open Graph card for /work/hrm, 1200 x 630 JPG: the site's own type (Geist) in HRM Suite's dark navy and blue,
// with the HR mark and the dashboard from scripts/hrm-shots.mjs.
//   node scripts/hrm-og.mjs
// Output: public/og/og-hrm.jpg (< 150 KB) and public/images/hrm/cover.webp.
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
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;font-family:Geist,sans-serif;color:#e7ecf4;
  background:radial-gradient(60% 80% at 92% 8%,rgba(59,119,240,.26),transparent 60%),radial-gradient(40% 60% at 100% 80%,rgba(131,96,255,.18),transparent 60%),radial-gradient(50% 60% at 0% 100%,rgba(19,163,154,.14),transparent 60%),#0b0f17}
.copy{position:absolute;left:72px;top:66px;width:560px}
.brand{display:flex;align-items:center;gap:14px}
.brand img{width:44px;height:44px;border-radius:9px}
.brand b{font-weight:600;font-size:24px;letter-spacing:-.02em}
.tag{display:inline-block;margin-top:42px;padding:6px 16px;border-radius:999px;background:rgba(234,164,47,.14);border:1px solid rgba(240,189,94,.4);color:#f0bd5e;font-weight:500;font-size:17px}
h1{margin-top:18px;font-weight:600;font-size:52px;line-height:1.05;letter-spacing:-.04em}
h1 span{color:#9dbcff}
p{margin-top:22px;font-size:21px;color:#b3bfd1;line-height:1.45}
.by{position:absolute;left:72px;bottom:52px;font-size:18px;color:#8794a9}
.by b{color:#e7ecf4;font-weight:600}
.shot{position:absolute;left:668px;top:104px;width:640px;border-radius:16px;overflow:hidden;border:1px solid #33415a;
  box-shadow:0 30px 70px -20px rgba(0,0,0,.7),0 0 60px rgba(59,119,240,.18);transform:rotate(-3deg)}
.bar{height:30px;background:#1a2231;border-bottom:1px solid #243044;display:flex;gap:7px;align-items:center;padding:0 14px}
.bar i{width:9px;height:9px;border-radius:50%;background:#33415a}
.shot img{display:block;width:100%}
</style></head><body>
<div class="copy">
  <div class="brand"><img src="${img('public/images/hrm/hrm-mark.svg', 'svg+xml')}"><b>HRM Suite</b></div>
  <span class="tag">In development</span>
  <h1>HR, attendance and payroll<br><span>on one record.</span></h1>
  <p>My multi-tenant HR platform: web app, phone check-ins, API and design system.</p>
</div>
<div class="by"><b>Mohammad Hamza</b> &nbsp;@mhfrough &middot; mhfrough.github.io</div>
<div class="shot"><div class="bar"><i></i><i></i><i></i></div><img src="${img('public/images/hrm/app-dashboard-dark.webp')}"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();

const og = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(resolve(ROOT, 'public/og/og-hrm.jpg'));
const cover = await sharp(png).webp({ quality: 82 }).toFile(resolve(ROOT, 'public/images/hrm/cover.webp'));
console.log(`og-hrm.jpg ${(og.size / 1024).toFixed(0)} KB, cover.webp ${(cover.size / 1024).toFixed(0)} KB`);
