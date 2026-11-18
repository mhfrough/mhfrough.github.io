// Open Graph card for /work/swoop, 1200 x 630 JPG: the site's own type (Geist) on Swoop's dark ground with its orange
// accent and its own mark, beside the marked-up editor screenshot from scripts/swoop-shots.mjs.
//   node scripts/swoop-og.mjs
// Output: public/og/og-swoop.jpg (< 150 KB) and public/images/swoop/cover.webp.
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
${face('Geist Mono', 'node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2')}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;font-family:Geist,sans-serif;color:#f4f3f1;background:
  radial-gradient(60% 80% at 95% 5%,rgba(255,90,31,.2),transparent 60%),
  radial-gradient(45% 60% at 0% 100%,rgba(255,90,31,.07),transparent 60%),
  #0d0d0f}
.copy{position:absolute;left:72px;top:66px;width:560px}
.brand{display:flex;align-items:center;gap:14px}
.brand img{width:44px;height:44px;display:block;border-radius:11px}
.brand b{font-weight:600;font-size:24px;letter-spacing:-.02em}
.tag{display:inline-block;margin-top:42px;padding:6px 16px;border-radius:999px;background:#ff5a1f;color:#141210;font-weight:500;font-size:17px}
h1{margin-top:18px;font-weight:600;font-size:48px;line-height:1.06;letter-spacing:-.04em}
h1 span{color:#ff7a3d}
p{margin-top:22px;width:520px;font-size:21px;color:#c9c6c1;line-height:1.45}
.mono{font-family:'Geist Mono',monospace}
.by{position:absolute;left:72px;bottom:54px;font-size:18px;color:#8f8c87}
.by b{color:#f4f3f1;font-weight:600}
.shot{position:absolute;left:640px;top:92px;width:680px;border-radius:16px;overflow:hidden;border:1px solid #26262a;
  box-shadow:0 30px 70px -20px rgba(0,0,0,.8),0 0 60px rgba(255,90,31,.14);transform:rotate(-3deg)}
.bar{height:30px;background:#1f1f23;border-bottom:1px solid #26262a;display:flex;gap:7px;align-items:center;padding:0 14px}
.bar i{width:9px;height:9px;border-radius:50%;background:#36363b}
.shot img{display:block;width:100%}
</style></head><body>
<div class="copy">
  <div class="brand">
    <img src="${img('public/images/swoop/swoop-mark.svg', 'svg+xml')}" alt="">
    <b>Swoop</b>
  </div>
  <span class="tag">Case study</span>
  <h1>Screenshots that stay<br><span>on your computer.</span></h1>
  <p>A full-page capture extension for Chrome and a Print Screen app for Windows, sharing one free editor.</p>
</div>
<div class="by"><b>Mohammad Hamza</b> &nbsp;<span class="mono">@mhfrough</span> &middot; mhfrough.dev</div>
<div class="shot"><div class="bar"><i></i><i></i><i></i></div><img src="${img('public/images/swoop/editor.webp')}"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();

const og = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(resolve(ROOT, 'public/og/og-swoop.jpg'));
const cover = await sharp(png).webp({ quality: 82 }).toFile(resolve(ROOT, 'public/images/swoop/cover.webp'));
console.log(`og-swoop.jpg ${(og.size / 1024).toFixed(0)} KB, cover.webp ${(cover.size / 1024).toFixed(0)} KB`);
