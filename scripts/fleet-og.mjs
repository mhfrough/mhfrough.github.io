// Open Graph card for /work/fleet, 1200 x 630 JPG: the site's own type (Geist) in the case study's neutral depot
// palette, with the admin dashboard from scripts/fleet-shots.mjs (invented data, client branding removed).
//   node scripts/fleet-og.mjs
// Output: public/og/og-fleet.jpg (< 150 KB) and public/images/fleet/cover.webp.
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
body{width:1200px;height:630px;overflow:hidden;font-family:Geist,sans-serif;color:#141c1b;
  background:radial-gradient(70% 90% at 95% 10%,rgba(18,130,122,.16),transparent 60%),radial-gradient(50% 60% at 0% 100%,rgba(232,163,58,.12),transparent 60%),linear-gradient(170deg,#f2f4f3,#e3e9e6)}
.copy{position:absolute;left:72px;top:72px;width:540px}
.kicker{display:flex;align-items:center;gap:12px;font-size:20px;font-weight:500;color:#33403d}
.kicker i{width:34px;height:34px;border-radius:10px;background:#111918;display:grid;place-items:center}
.kicker i:after{content:'';width:14px;height:14px;border-radius:50%;border:3px solid #6fd1c4}
.tag{display:inline-block;margin-top:40px;padding:6px 16px;border-radius:999px;background:#0d5c57;color:#fff;font-weight:500;font-size:17px}
h1{margin-top:18px;font-weight:600;font-size:50px;line-height:1.06;letter-spacing:-.04em}
h1 span{color:#0d5c57}
p{margin-top:22px;font-size:21px;color:#33403d;line-height:1.45}
.by{position:absolute;left:72px;bottom:54px;font-size:18px;color:#56625f}
.by b{color:#141c1b;font-weight:600}
.shot{position:absolute;left:660px;top:92px;width:640px;border-radius:16px;overflow:hidden;border:1px solid #dbe1de;
  box-shadow:0 30px 60px -20px rgba(17,25,24,.35);transform:rotate(-3deg);background:#fff}
.bar{height:30px;background:#eaeeec;border-bottom:1px solid #dbe1de;display:flex;gap:7px;align-items:center;padding:0 14px}
.bar i{width:9px;height:9px;border-radius:50%;background:#c3ccc8}
.shot img{display:block;width:100%}
</style></head><body>
<div class="copy">
  <div class="kicker"><i></i>Fleet and driver management SaaS</div>
  <span class="tag">Case study</span>
  <h1>One API for the office,<br><span>the depot and the driver.</span></h1>
  <p>An Angular admin, two Flutter apps and a multi-tenant NestJS API for a UK vehicle hire fleet.</p>
</div>
<div class="by"><b>Mohammad Hamza</b> &nbsp;@mhfrough &middot; mhfrough.dev</div>
<div class="shot"><div class="bar"><i></i><i></i><i></i></div><img src="${img('public/images/fleet/admin-dashboard.webp')}"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();

const og = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(resolve(ROOT, 'public/og/og-fleet.jpg'));
const cover = await sharp(png).webp({ quality: 82 }).toFile(resolve(ROOT, 'public/images/fleet/cover.webp'));
console.log(`og-fleet.jpg ${(og.size / 1024).toFixed(0)} KB, cover.webp ${(cover.size / 1024).toFixed(0)} KB`);
