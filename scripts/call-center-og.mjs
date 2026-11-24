// Open Graph card for /work/call-center, 1200 x 630 JPG: the site's own type (Geist) in the call center portal's
// periwinkle, indigo and navy on its pale lavender, with a headset tile (the portal has no mark of its own) and a
// drawn phone order beside the headline. There is no public site, so the right side is my own mockup with invented
// restaurants, callers and prices, never a screenshot of the app.
//   node scripts/call-center-og.mjs
// Output: public/og/og-call-center.jpg (< 150 KB) and public/images/call-center/cover.webp.
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const b64 = (p) => readFileSync(resolve(ROOT, p)).toString('base64');
const face = (family, file) =>
  `@font-face{font-family:'${family}';font-weight:100 900;src:url(data:font/woff2;base64,${b64(file)}) format('woff2');}`;

// Phosphor "headset" (regular), MIT.
const headset =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M201.89,54.66A103.43,103.43,0,0,0,128.79,24H128A104,104,0,0,0,24,128v56a24,24,0,0,0,24,24H64a24,24,0,0,0,24-24V144a24,24,0,0,0-24-24H40.36A88.12,88.12,0,0,1,190.54,65.93,87.39,87.39,0,0,1,215.65,120H192a24,24,0,0,0-24,24v40a24,24,0,0,0,24,24h24a24,24,0,0,1-24,24H136a8,8,0,0,0,0,16h56a40,40,0,0,0,40-40V128A103.41,103.41,0,0,0,201.89,54.66ZM64,136a8,8,0,0,1,8,8v40a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V136Zm128,56a8,8,0,0,1-8-8V144a8,8,0,0,1,8-8h24v56Z"></path></svg>';

// Invented sample order, the same one the page's hero builds.
const lines = [
  ['Salami', '32 cm', 2, '21.80'],
  ['Garlic bread', 'Regular', 1, '3.90'],
  ['Lemonade', '0.5 l', 2, '6.40'],
];

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${face('Geist', 'node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2')}
${face('Geist Mono', 'node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2')}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;font-family:Geist,sans-serif;color:#131336;
  background:radial-gradient(70% 90% at 95% 5%,rgba(94,129,244,.22),transparent 60%),radial-gradient(55% 70% at 0% 100%,rgba(255,128,139,.16),transparent 60%),#f5f5fb}
.mono{font-family:'Geist Mono',monospace}
.copy{position:absolute;left:72px;top:68px;width:560px}
.brand{display:flex;align-items:center;gap:14px}
.tile{width:52px;height:52px;border-radius:14px;background:#5e81f4;color:#fff;display:grid;place-items:center}
.tile svg{width:30px;height:30px}
.brand b{font-weight:600;font-size:22px;letter-spacing:-.02em}
.tag{display:inline-block;margin-top:40px;padding:6px 16px;border-radius:999px;background:#4d4cac;color:#fff;font-weight:500;font-size:17px}
h1{margin-top:18px;font-weight:600;font-size:64px;line-height:1.02;letter-spacing:-.04em}
h1 span{color:#4d4cac}
p{margin-top:22px;font-size:21px;color:#3a3a6a;line-height:1.45}
.by{position:absolute;left:72px;bottom:54px;font-size:18px;color:#5b5f7a}
.by b{color:#131336;font-weight:600}
.card{position:absolute;left:700px;top:70px;width:440px;padding:22px;border-radius:16px;background:#fff;border:1px solid #dcdeee;
  box-shadow:0 36px 72px -28px rgba(19,19,54,.35);transform:rotate(-2deg)}
.head{display:flex;justify-content:space-between;align-items:center}
.head b{font-size:19px;font-weight:600}
.st{padding:3px 12px;border-radius:999px;background:#fff2d1;color:#8a5a00;font-size:14px;font-weight:500}
.lbl{margin-top:16px;font-size:12px;color:#5b5f7a}
.in{margin-top:5px;height:38px;border-radius:999px;background:#f5f5fb;border:1px solid #dcdeee;padding:0 16px;display:flex;align-items:center;font-size:15px}
.hit{margin-top:6px;font-size:12.5px;color:#00753f}
.row{display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding:9px 12px;border-radius:12px;background:#f5f5fb;border:1px solid #dcdeee;font-size:14px}
.row small{color:#5b5f7a;margin-left:8px}
.size{padding:2px 9px;border-radius:999px;background:#e7ecfd;color:#3052c0;font-size:12px;margin-left:8px;border:1px solid #4d4cac}
.sum{margin-top:12px;padding:10px 12px;border-radius:12px;background:#e9eaf5;display:flex;justify-content:space-between;font-weight:600;font-size:16px}
</style></head><body>
<div class="copy">
  <div class="brand"><span class="tile">${headset}</span><b>Call center portal</b></div>
  <span class="tag">Case study</span>
  <h1>Phone orders,<br><span>typed once.</span></h1>
  <p>A call center taking orders for several restaurants: callers found by number, items priced by size, receipts as PDF.</p>
</div>
<div class="by"><b>Mohammad Hamza</b> &nbsp;@mhfrough &middot; mhfrough.github.io</div>
<div class="card">
  <div class="head"><b>Order <span class="mono">#1046</span></b><span class="st">Pending</span></div>
  <div class="lbl">Phone</div>
  <div class="in mono">0700 555 0142</div>
  <div class="hit">Returning caller: details filled in from the last order.</div>
  <div class="lbl">Restaurant</div>
  <div class="in">Pizzeria Sole</div>
  ${lines.map(([n, s, q, p]) => `<div class="row"><span>${n}<span class="size">${s}</span><small class="mono">x${q}</small></span><span class="mono">€${p}</span></div>`).join('')}
  <div class="sum"><span>Total</span><span class="mono">€36.85</span></div>
</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();

mkdirSync(resolve(ROOT, 'public/images/call-center'), { recursive: true });
const og = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(resolve(ROOT, 'public/og/og-call-center.jpg'));
const cover = await sharp(png).webp({ quality: 82 }).toFile(resolve(ROOT, 'public/images/call-center/cover.webp'));
console.log(`og-call-center.jpg ${(og.size / 1024).toFixed(0)} KB, cover.webp ${(cover.size / 1024).toFixed(0)} KB`);
