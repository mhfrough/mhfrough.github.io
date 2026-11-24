// Open Graph card for /work/scrawl, 1200 x 630 JPG: the site's own type (Geist) on Scrawl's dark dotted paper with
// its highlighter yellow, beside the board screenshot from scripts/scrawl-shots.mjs.
//   node scripts/scrawl-og.mjs
// Output: public/og/og-scrawl.jpg (< 150 KB) and public/images/scrawl/cover.webp.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const b64 = (p) => readFileSync(resolve(ROOT, p)).toString('base64');
const face = (family, file) =>
  `@font-face{font-family:'${family}';font-weight:100 900;src:url(data:font/woff2;base64,${b64(file)}) format('woff2');}`;
const img = (p) => `data:image/webp;base64,${b64(p)}`;
const mark = `data:image/svg+xml;base64,${b64('public/images/scrawl/scrawl-mark.svg')}`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${face('Geist', 'node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2')}
${face('Geist Mono', 'node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2')}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;font-family:Geist,sans-serif;color:#ebebe9;background:
  radial-gradient(60% 80% at 95% 5%,rgba(255,225,74,.16),transparent 60%),
  radial-gradient(45% 60% at 0% 100%,rgba(255,72,176,.07),transparent 60%),
  radial-gradient(rgba(238,237,230,.14) 1px,transparent 1.3px) -1px -1px/24px 24px,
  #161614}
.copy{position:absolute;left:72px;top:66px;width:540px}
.brand{display:flex;align-items:center;gap:14px}
.brand img{width:44px;height:44px;border-radius:12px}
.brand b{font-weight:600;font-size:24px;letter-spacing:-.02em}
.tag{display:inline-block;margin-top:42px;padding:6px 16px;border-radius:999px;background:#ffe14a;color:#1d1d1b;font-weight:500;font-size:17px}
h1{margin-top:18px;font-weight:600;font-size:52px;line-height:1.08;letter-spacing:-.04em}
h1 span{background:linear-gradient(transparent 58%,rgba(255,225,74,.42) 58%,rgba(255,225,74,.42) 92%,transparent 92%);padding:0 4px;margin:0 -4px}
p{margin-top:22px;font-size:21px;color:#cfcfcb;line-height:1.45}
.mono{font-family:'Geist Mono',monospace}
.by{position:absolute;left:72px;bottom:54px;font-size:18px;color:#a9a9a4}
.by b{color:#ebebe9;font-weight:600}
.shot{position:absolute;left:650px;top:96px;width:680px;border-radius:16px;overflow:hidden;border:1px solid #33332f;
  box-shadow:0 30px 70px -20px rgba(0,0,0,.75),0 0 60px rgba(255,225,74,.12);transform:rotate(-3deg)}
.bar{height:30px;background:#2e2e2a;border-bottom:1px solid #33332f;display:flex;gap:7px;align-items:center;padding:0 14px}
.bar i{width:9px;height:9px;border-radius:50%;background:#46463f}
.shot img{display:block;width:100%}
</style></head><body>
<div class="copy">
  <div class="brand"><img src="${mark}" alt=""><b>Scrawl</b></div>
  <span class="tag">Case study</span>
  <h1>Felt-tip diagrams<br><span>on dotted paper.</span></h1>
  <p>Marker strokes, risograph fills and local saving, in plain JavaScript with no dependencies.</p>
</div>
<div class="by"><b>Mohammad Hamza</b> &nbsp;<span class="mono">@mhfrough</span> &middot; mhfrough.github.io</div>
<div class="shot"><div class="bar"><i></i><i></i><i></i></div><img src="${img('public/images/scrawl/board-dark.webp')}"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();

const og = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(resolve(ROOT, 'public/og/og-scrawl.jpg'));
const cover = await sharp(png).webp({ quality: 82 }).toFile(resolve(ROOT, 'public/images/scrawl/cover.webp'));
console.log(`og-scrawl.jpg ${(og.size / 1024).toFixed(0)} KB, cover.webp ${(cover.size / 1024).toFixed(0)} KB`);
