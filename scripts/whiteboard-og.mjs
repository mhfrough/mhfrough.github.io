// Open Graph card for /work/whiteboard, 1200 x 630 JPG: the site's own type (Geist) on the board's warm charcoal
// and dot grid, with its indigo, beside the board screenshot from scripts/whiteboard-shots.mjs.
//   node scripts/whiteboard-og.mjs
// Output: public/og/og-whiteboard.jpg (< 150 KB) and public/images/whiteboard/cover.webp.
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
${face('Geist Mono', 'node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2')}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;font-family:Geist,sans-serif;color:#e4e0d8;background:
  radial-gradient(60% 80% at 95% 5%,rgba(99,102,241,.28),transparent 60%),
  radial-gradient(45% 60% at 0% 100%,rgba(245,158,11,.08),transparent 60%),
  radial-gradient(rgba(228,224,216,.12) 1px,transparent 1.3px) -1px -1px/24px 24px,
  #1a1917}
.copy{position:absolute;left:72px;top:66px;width:520px}
.brand{display:flex;align-items:center;gap:14px}
.mark{width:44px;height:44px;border-radius:12px;background:#4f46e5;display:grid;place-items:center}
.mark svg{width:26px;height:26px}
.brand b{font-weight:600;font-size:24px;letter-spacing:-.02em}
.tag{display:inline-block;margin-top:42px;padding:6px 16px;border-radius:999px;background:#4f46e5;color:#fff;font-weight:500;font-size:17px}
h1{margin-top:18px;font-weight:600;font-size:52px;line-height:1.06;letter-spacing:-.04em}
h1 span{color:#818cf8}
p{margin-top:22px;font-size:21px;color:#c7c2b9;line-height:1.45}
.mono{font-family:'Geist Mono',monospace}
.by{position:absolute;left:72px;bottom:54px;font-size:18px;color:#9a958d}
.by b{color:#e4e0d8;font-weight:600}
.shot{position:absolute;left:640px;top:92px;width:680px;border-radius:16px;overflow:hidden;border:1px solid #36332f;
  box-shadow:0 30px 70px -20px rgba(0,0,0,.7),0 0 60px rgba(99,102,241,.18);transform:rotate(-3deg)}
.bar{height:30px;background:#2c2a27;border-bottom:1px solid #36332f;display:flex;gap:7px;align-items:center;padding:0 14px}
.bar i{width:9px;height:9px;border-radius:50%;background:#4a463f}
.shot img{display:block;width:100%}
</style></head><body>
<div class="copy">
  <div class="brand">
    <span class="mark"><svg viewBox="0 0 26 26" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="11" height="8" rx="1.5"/><circle cx="19" cy="18" r="4.5"/><path d="M9 12v6.5h5.5"/></svg></span>
    <b>Whiteboard</b>
  </div>
  <span class="tag">Case study</span>
  <h1>An infinite canvas,<br><span>built on signals.</span></h1>
  <p>One SVG scene, fifteen signal services, snapshot undo, five export formats and live editing over socket.io.</p>
</div>
<div class="by"><b>Mohammad Hamza</b> &nbsp;<span class="mono">@mhfrough</span> &middot; mhfrough.github.io</div>
<div class="shot"><div class="bar"><i></i><i></i><i></i></div><img src="${img('public/images/whiteboard/board.webp')}"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();

const og = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(resolve(ROOT, 'public/og/og-whiteboard.jpg'));
const cover = await sharp(png).webp({ quality: 82 }).toFile(resolve(ROOT, 'public/images/whiteboard/cover.webp'));
console.log(`og-whiteboard.jpg ${(og.size / 1024).toFixed(0)} KB, cover.webp ${(cover.size / 1024).toFixed(0)} KB`);
