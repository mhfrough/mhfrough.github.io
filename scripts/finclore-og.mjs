// Open Graph card for /work/finclore, 1200 x 630 JPG: the site's own type (Geist) in Finclore's navy and red, with
// the F. monogram (public/images/finclore/finclore-mark.svg) and the home page from scripts/finclore-shots.mjs.
//   node scripts/finclore-og.mjs
// Output: public/og/og-finclore.jpg (< 150 KB) and public/images/finclore/cover.webp.
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
body{width:1200px;height:630px;overflow:hidden;font-family:Geist,sans-serif;color:#131b2c;
  background:radial-gradient(70% 90% at 95% 10%,rgba(10,49,97,.13),transparent 60%),radial-gradient(50% 60% at 0% 100%,rgba(179,25,66,.07),transparent 60%),linear-gradient(170deg,#f5f6f8,#eceff3)}
.copy{position:absolute;left:72px;top:68px;width:540px}
.brand{display:flex;align-items:center;gap:14px}
.tile{width:52px;height:52px;border-radius:14px;background:#fff;border:1px solid #dfe3ea;display:grid;place-items:center}
.tile img{width:38px;height:38px}
.brand b{font-weight:600;font-size:22px;letter-spacing:-.02em}
.tag{display:inline-block;margin-top:40px;padding:6px 16px;border-radius:999px;background:#0a3161;color:#fff;font-weight:500;font-size:17px}
h1{margin-top:18px;font-weight:600;font-size:52px;line-height:1.06;letter-spacing:-.04em}
h1 span{color:#0a3161}
h1 i{font-style:normal;color:#b31942}
p{margin-top:22px;font-size:21px;color:#3b4559;line-height:1.45}
.by{position:absolute;left:72px;bottom:54px;font-size:18px;color:#596274}
.by b{color:#131b2c;font-weight:600}
.shot{position:absolute;left:660px;top:96px;width:640px;border-radius:16px;overflow:hidden;border:1px solid #dfe3ea;
  box-shadow:0 30px 60px -20px rgba(7,31,64,.35);transform:rotate(-3deg)}
.bar{height:30px;background:#eceff3;border-bottom:1px solid #dfe3ea;display:flex;gap:7px;align-items:center;padding:0 14px}
.bar i{width:9px;height:9px;border-radius:50%;background:#c6cdd8}
.shot img{display:block;width:100%}
</style></head><body>
<div class="copy">
  <div class="brand"><span class="tile"><img src="${img('public/images/finclore/finclore-mark.svg', 'image/svg+xml')}"></span><b>Finclore</b></div>
  <span class="tag">Case study</span>
  <h1>A US company,<br><span>formed from anywhere</span><i>.</i></h1>
  <p>The logo, and the Angular app behind a US company formation service.</p>
</div>
<div class="by"><b>Mohammad Hamza</b> &nbsp;@mhfrough &middot; mhfrough.dev</div>
<div class="shot"><div class="bar"><i></i><i></i><i></i></div><img src="${img('public/images/finclore/site-home.webp')}"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();

const og = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(resolve(ROOT, 'public/og/og-finclore.jpg'));
const cover = await sharp(png).webp({ quality: 82 }).toFile(resolve(ROOT, 'public/images/finclore/cover.webp'));
console.log(`og-finclore.jpg ${(og.size / 1024).toFixed(0)} KB, cover.webp ${(cover.size / 1024).toFixed(0)} KB`);
