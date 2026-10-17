// Open Graph card for /work/o2chat, 1200 x 630 JPG: the site's own type (Geist) in O2Chat's blues, with the O2
// speech-bubble mark (public/images/o2chat/o2chat-mark.webp) and the pricing page from scripts/o2chat-shots.mjs.
//   node scripts/o2chat-og.mjs
// Output: public/og/og-o2chat.jpg (< 150 KB) and public/images/o2chat/cover.webp.
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
body{width:1200px;height:630px;overflow:hidden;font-family:Geist,sans-serif;color:#111a2e;
  background:radial-gradient(70% 90% at 95% 10%,rgba(53,183,252,.2),transparent 60%),radial-gradient(50% 60% at 0% 100%,rgba(8,87,233,.1),transparent 60%),linear-gradient(170deg,#f3f6fb,#e8eef8)}
.copy{position:absolute;left:72px;top:68px;width:560px}
.brand{display:flex;align-items:center;gap:14px}
.tile{width:52px;height:52px;border-radius:14px;background:#fff;border:1px solid #dce4ef;display:grid;place-items:center}
.tile img{width:38px;height:38px}
.brand b{font-weight:600;font-size:22px;letter-spacing:-.02em}
.tag{display:inline-block;margin-top:40px;padding:6px 16px;border-radius:999px;background:#0a58ca;color:#fff;font-weight:500;font-size:17px}
h1{margin-top:18px;font-weight:600;font-size:54px;line-height:1.06;letter-spacing:-.04em}
h1 span{color:#0a58ca}
p{margin-top:22px;font-size:21px;color:#34405a;line-height:1.45}
.chans{display:flex;gap:8px;margin-top:22px}
.chans i{font-style:normal;font-size:15px;font-weight:500;padding:5px 12px;border-radius:999px;background:#fff;border:1px solid #dce4ef;color:#34405a}
.by{position:absolute;left:72px;bottom:54px;font-size:18px;color:#56627a}
.by b{color:#111a2e;font-weight:600}
.shot{position:absolute;left:670px;top:96px;width:640px;border-radius:16px;overflow:hidden;border:1px solid #dce4ef;
  box-shadow:0 30px 60px -20px rgba(10,40,110,.35);transform:rotate(-3deg)}
.bar{height:30px;background:#e8eef8;border-bottom:1px solid #dce4ef;display:flex;gap:7px;align-items:center;padding:0 14px}
.bar i{width:9px;height:9px;border-radius:50%;background:#c3cfe0}
.shot img{display:block;width:100%}
</style></head><body>
<div class="copy">
  <div class="brand"><span class="tile"><img src="${img('public/images/o2chat/o2chat-mark.webp')}"></span><b>O2Chat</b></div>
  <span class="tag">Case study</span>
  <h1>Every channel,<br><span>one inbox.</span></h1>
  <p>The real-time agent portal, an embeddable chat widget and the multi-tenant Angular frontend.</p>
  <div class="chans"><i>Web</i><i>WhatsApp</i><i>Messenger</i><i>Instagram</i></div>
</div>
<div class="by"><b>Mohammad Hamza</b> &nbsp;@mhfrough &middot; mhfrough.dev</div>
<div class="shot"><div class="bar"><i></i><i></i><i></i></div><img src="${img('public/images/o2chat/site-pricing.webp')}"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();

const og = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(resolve(ROOT, 'public/og/og-o2chat.jpg'));
const cover = await sharp(png).webp({ quality: 82 }).toFile(resolve(ROOT, 'public/images/o2chat/cover.webp'));
console.log(`og-o2chat.jpg ${(og.size / 1024).toFixed(0)} KB, cover.webp ${(cover.size / 1024).toFixed(0)} KB`);
