// Open Graph card for /work/tmf, 1200 x 630 JPG: the site's own type (Geist) in the lending app's sand and leaf
// green, with Thardeep Microfinance Foundation's mark (public/images/tmf/tmf-mark.webp). The app is staff-only, so
// there is no screenshot: the right side is a drawn approval chain and repayment schedule with sample figures, like
// the page's own mockups.
//   node scripts/tmf-og.mjs
// Output: public/og/og-tmf.jpg (< 150 KB) and public/images/tmf/cover.webp.
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const b64 = (p) => readFileSync(resolve(ROOT, p)).toString('base64');
const img = (p) => `data:image/webp;base64,${b64(p)}`;
const face = (family, file) =>
  `@font-face{font-family:'${family}';font-weight:100 900;src:url(data:font/woff2;base64,${b64(file)}) format('woff2');}`;

const desks = ['LO', 'BM', 'VO', 'CO', 'AM', 'RM', 'HOPD', 'GM', 'CEO'];
const rail = desks
  .map((d, i) => `<li class="${i < 5 ? 'done' : i === 5 ? 'now' : ''}"><i></i><span>${d}</span></li>`)
  .join('');
const rows = [
  ['1', '05 Mar 2024', '8,598', '1,950', '6,648', '83,352'],
  ['2', '05 Apr 2024', '8,598', '1,806', '6,792', '76,560'],
  ['3', '05 May 2024', '8,598', '1,659', '6,939', '69,621'],
  ['4', '05 Jun 2024', '8,598', '1,508', '7,090', '62,531'],
]
  .map((r) => `<tr>${r.map((c, i) => `<td class="${i > 1 ? 'n' : ''}">${c}</td>`).join('')}</tr>`)
  .join('');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${face('Geist', 'node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2')}
${face('GeistMono', 'node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2')}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1200px;height:630px;overflow:hidden;font-family:Geist,sans-serif;color:#2b2117;
  background:radial-gradient(70% 90% at 95% 10%,rgba(209,168,113,.24),transparent 60%),radial-gradient(50% 60% at 0% 100%,rgba(136,176,63,.12),transparent 60%),linear-gradient(170deg,#f8f5ef,#f1e9dc)}
.mono{font-family:GeistMono,monospace}
.copy{position:absolute;left:72px;top:68px;width:540px}
.brand{display:flex;align-items:center;gap:14px}
.brand img{height:48px;width:auto}
.brand b{font-weight:600;font-size:22px;letter-spacing:-.02em}
.tag{display:inline-block;margin-top:44px;padding:6px 16px;border-radius:999px;background:#d1a871;color:#2b2117;font-weight:500;font-size:17px}
h1{margin-top:18px;font-weight:600;font-size:50px;line-height:1.06;letter-spacing:-.04em}
h1 span{color:#8a5a26}
p{margin-top:22px;font-size:21px;color:#5a4630;line-height:1.45}
.by{position:absolute;left:72px;bottom:54px;font-size:18px;color:#6b5c48}
.by b{color:#2b2117;font-weight:600}
.card{position:absolute;left:680px;top:70px;width:470px;padding:22px;border-radius:18px;background:#fff;border:1px solid #e8dfcf;
  box-shadow:0 30px 60px -20px rgba(36,27,17,.35);transform:rotate(-2deg)}
.head{display:flex;justify-content:space-between;align-items:baseline;padding-bottom:12px;border-bottom:1px solid #e8dfcf}
.head b{font-size:18px}.head span{font-size:13px;color:#6b5c48}
ol{list-style:none;display:grid;grid-template-columns:repeat(9,1fr);margin:18px 0 14px}
li{position:relative;display:grid;justify-items:center;gap:6px}
li:not(:last-child)::before{content:'';position:absolute;top:6px;left:50%;width:100%;height:2px;background:#d6c8b1}
li.done:not(:last-child)::before{background:#d1a871}
li i{position:relative;width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid #d6c8b1}
li.done i{background:#d1a871;border-color:#d1a871}
li.now i{border-color:#8a5a26;box-shadow:0 0 0 4px #f6ecdc}
li span{font-family:GeistMono,monospace;font-size:10px;color:#6b5c48}
li.now span{color:#2b2117;font-weight:600}
.ok{display:flex;gap:10px;align-items:center;padding:12px 14px;border-radius:12px;background:#edf4dc;color:#4f6d0b;font-weight:600;font-size:15px}
table{width:100%;border-collapse:collapse;margin-top:14px;font-family:GeistMono,monospace;font-size:12px}
th{background:#f1eadc;color:#5a4630;font-weight:500;text-align:left;padding:7px 8px}
td{padding:7px 8px;border-bottom:1px solid #e8dfcf}
.n{text-align:right}
</style></head><body>
<div class="copy">
  <div class="brand"><img src="${img('public/images/tmf/tmf-mark.webp')}"><b>Thardeep Microfinance Foundation</b></div>
  <span class="tag">Case study</span>
  <h1>Nine desks between<br><span>a loan and its cheque.</span></h1>
  <p>TMF's loan-management platform: approvals with limits per role, a loan calculator and repayment schedules.</p>
</div>
<div class="by"><b>Mohammad Hamza</b> &nbsp;@mhfrough &middot; mhfrough.dev</div>
<div class="card">
  <div class="head"><b>Loan <span class="mono">L-2317</span></b><span class="mono">Rs 90,000</span></div>
  <ol>${rail}</ol>
  <div class="ok">&#10003; Within the regional manager's limit: approved</div>
  <table><thead><tr><th>#</th><th>Due</th><th class="n">Instalment</th><th class="n">Markup</th><th class="n">Principal</th><th class="n">Balance</th></tr></thead><tbody>${rows}</tbody></table>
</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();

mkdirSync(resolve(ROOT, 'public/images/tmf'), { recursive: true });
const og = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(resolve(ROOT, 'public/og/og-tmf.jpg'));
const cover = await sharp(png).webp({ quality: 82 }).toFile(resolve(ROOT, 'public/images/tmf/cover.webp'));
console.log(`og-tmf.jpg ${(og.size / 1024).toFixed(0)} KB, cover.webp ${(cover.size / 1024).toFixed(0)} KB`);
