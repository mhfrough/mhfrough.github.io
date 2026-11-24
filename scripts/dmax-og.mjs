// Open Graph card for /work/dmax, 1200 x 630 JPG: the site's own type (Geist) in DMAX's navy, green and blue, with
// the stacked-blocks mark (public/images/dmax/dmax-mark.webp) and a drawn extraction job beside the headline. DMAX is
// internal, so the right side is my own mockup with invented tables and counts, never a screenshot of the app.
//   node scripts/dmax-og.mjs
// Output: public/og/og-dmax.jpg (< 150 KB) and public/images/dmax/cover.webp.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const b64 = (p) => readFileSync(resolve(ROOT, p)).toString('base64');
const face = (family, file) =>
  `@font-face{font-family:'${family}';font-weight:100 900;src:url(data:font/woff2;base64,${b64(file)}) format('woff2');}`;
const img = (p, type = 'image/webp') => `data:${type};base64,${b64(p)}`;

// Invented sample run, the same one the page's console opens on.
const tables = [
  ['ACCOUNTS', '30,828 / 30,828', 100],
  ['CUSTOMERS', '18,402 / 26,215', 70],
  ['FUNDS_TRANSFER', '0 / 82,054', 0],
  ['STATEMENT_ENTRIES', '0 / 447,365', 0],
];

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${face('Geist', 'node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2')}
${face('Geist Mono', 'node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2')}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;font-family:Geist,sans-serif;color:#e8f0f8;
  background:radial-gradient(70% 90% at 95% 5%,rgba(25,185,138,.18),transparent 60%),radial-gradient(55% 70% at 0% 100%,rgba(0,150,255,.14),transparent 60%),#10121f}
.mono{font-family:'Geist Mono',monospace}
.copy{position:absolute;left:72px;top:68px;width:560px}
.brand{display:flex;align-items:center;gap:14px}
.tile{width:52px;height:52px;border-radius:14px;background:#f2f6fa;display:grid;place-items:center}
.tile img{width:38px;height:38px}
.brand b{font-weight:600;font-size:22px;letter-spacing:-.02em}
.tag{display:inline-block;margin-top:40px;padding:6px 16px;border-radius:999px;background:#19b98a;color:#10121f;font-weight:500;font-size:17px}
h1{margin-top:18px;font-weight:600;font-size:52px;line-height:1.06;letter-spacing:-.04em}
h1 span{background:linear-gradient(135deg,#19b98a,#0096ff);-webkit-background-clip:text;background-clip:text;color:transparent}
p{margin-top:22px;font-size:21px;color:#b6c3d4;line-height:1.45}
.by{position:absolute;left:72px;bottom:54px;font-size:18px;color:#8b98ae}
.by b{color:#e8f0f8;font-weight:600}
.job{position:absolute;left:700px;top:92px;width:452px;padding:22px;border-radius:16px;background:#252936;border:1px solid #3a4058;
  box-shadow:0 30px 60px -20px rgba(0,0,0,.6);transform:rotate(-2deg)}
.head{display:flex;justify-content:space-between;align-items:center}
.head b{font-size:19px;font-weight:600}
.state{padding:3px 12px;border-radius:999px;background:rgba(25,185,138,.16);color:#19b98a;font-size:14px;font-weight:500}
.sub{margin-top:4px;font-size:13px;color:#8b98ae}
.track{height:6px;border-radius:3px;background:#212536;overflow:hidden;margin-top:6px}
.track i{display:block;height:100%;background:linear-gradient(135deg,#19b98a,#0096ff)}
.big{margin-top:16px;display:flex;justify-content:space-between;font-size:14px;color:#8b98ae}
.counts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:16px}
.counts div{padding:10px 12px;border-radius:10px;background:#10121f;border-top:2px solid #19b98a}
.counts div:nth-child(2){border-top-color:#b52148}.counts div:nth-child(3){border-top-color:#ffc940}
.counts small{display:block;font-size:12px;color:#8b98ae}.counts span{font-size:17px}
.rows{margin-top:16px;display:grid;gap:10px}
.row{display:grid;grid-template-columns:150px 1fr;gap:12px;align-items:center;font-size:12px}
.row .n{color:#e8f0f8}.row small{display:block;margin-top:3px;color:#8b98ae;font-size:11px}
</style></head><body>
<div class="copy">
  <div class="brand"><span class="tile"><img src="${img('public/images/dmax/dmax-mark.webp')}"></span><b>DMAX</b></div>
  <span class="tag">Case study</span>
  <h1>Core banking data,<br><span>extracted and accounted for.</span></h1>
  <p>Four Angular apps: extraction consoles that count every row, and statements on demand.</p>
</div>
<div class="by"><b>Mohammad Hamza</b> &nbsp;@mhfrough &middot; mhfrough.github.io</div>
<div class="job">
  <div class="head"><b class="mono">Job 1047</b><span class="state">Running</span></div>
  <div class="sub">Incremental on DB2 · sample data</div>
  <div class="big"><span class="mono">8,400 rec/s</span><span class="mono">8.4% · 41 s</span></div>
  <div class="track"><i style="width:8.4%"></i></div>
  <div class="counts">
    <div><small>Extracted</small><span class="mono">49,102</span></div>
    <div><small>Failed</small><span class="mono">26</span></div>
    <div><small>Duplicate</small><span class="mono">102</span></div>
  </div>
  <div class="rows">
    ${tables.map(([n, c, w]) => `<div class="row"><span class="mono n">${n}</span><span><span class="track" style="margin:0;display:block"><i style="width:${w}%"></i></span><small class="mono">${c}</small></span></div>`).join('')}
  </div>
</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();

const og = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(resolve(ROOT, 'public/og/og-dmax.jpg'));
const cover = await sharp(png).webp({ quality: 82 }).toFile(resolve(ROOT, 'public/images/dmax/cover.webp'));
console.log(`og-dmax.jpg ${(og.size / 1024).toFixed(0)} KB, cover.webp ${(cover.size / 1024).toFixed(0)} KB`);
