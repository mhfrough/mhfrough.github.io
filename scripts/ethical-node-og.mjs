// Open Graph card for /work/ethical-node, 1200 x 630 JPG: the site's own type (Geist) in the 2023 EthicalNode
// portals' blue and navy, with the crescent mark and my own investor-portal mockup (the hero component, captured
// from a build of this site, served through Playwright routing, no server). No screenshot of the product itself.
//   npm run build (or ng build --output-path …), then: node scripts/ethical-node-og.mjs [--dist <browser dir>]
// Output: public/og/og-ethical-node.jpg (< 150 KB) and public/images/ethical-node/cover.webp.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT, distArg } from './_env.mjs';

const { chromium } = await import('playwright');
const DIST = distArg();
const b64 = (p) => readFileSync(resolve(ROOT, p)).toString('base64');
const face = (family, file) =>
  `@font-face{font-family:'${family}';font-weight:100 900;src:url(data:font/woff2;base64,${b64(file)}) format('woff2');}`;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json' };

const browser = await chromium.launch();

// 1. The hero mockup, from the built page.
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
await ctx.route('http://og.test/**', (route) => {
  let f = join(DIST, decodeURIComponent(new URL(route.request().url()).pathname));
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) return route.fulfill({ status: 404, body: '' });
  route.fulfill({ status: 200, body: readFileSync(f), contentType: TYPES[extname(f)] ?? 'application/octet-stream' });
});
const page = await ctx.newPage();
await page.goto('http://og.test/work/ethical-node', { waitUntil: 'networkidle' });
await page.addStyleTag({ content: 'mh-cookie-notice{display:none!important}' });
const card = page.locator('mh-en-stake .stake');
await card.waitFor();
const mock = (await card.screenshot({ type: 'png' })).toString('base64');
await ctx.close();

// 2. The card.
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${face('Geist', 'node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2')}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;font-family:Geist,sans-serif;color:#0d1b33;
  background:radial-gradient(70% 90% at 95% 10%,rgba(86,206,209,.22),transparent 60%),radial-gradient(50% 60% at 0% 100%,rgba(51,128,255,.12),transparent 60%),linear-gradient(170deg,#f2f6fd,#e9effb)}
.copy{position:absolute;left:72px;top:64px;width:560px}
.brand{display:flex;align-items:center;gap:14px}
.brand span{width:52px;height:52px;border-radius:14px;background:#0a1a33;display:grid;place-items:center}
.brand img{width:38px;height:38px}
.brand b{font-weight:600;font-size:24px;letter-spacing:-.02em}
.tag{display:inline-block;margin-top:40px;padding:6px 16px;border-radius:999px;background:#1d5fd6;color:#fff;font-weight:500;font-size:17px}
h1{margin-top:18px;font-weight:600;font-size:52px;line-height:1.05;letter-spacing:-.04em}
h1 span{color:#1d5fd6}
p{margin-top:22px;font-size:21px;color:#0a3161;line-height:1.45}
.by{position:absolute;left:72px;bottom:54px;font-size:18px;color:#56627a}
.by b{color:#0d1b33;font-weight:600}
.mock{position:absolute;left:690px;top:70px;width:470px;border-radius:16px;overflow:hidden;
  box-shadow:0 30px 60px -20px rgba(10,26,51,.35);transform:rotate(-2.5deg)}
.mock img{display:block;width:100%}
</style></head><body>
<div class="copy">
  <div class="brand"><span><img src="data:image/webp;base64,${b64('public/images/ethical-node/ethical-node-mark.webp')}"></span><b>EthicalNode</b></div>
  <span class="tag">Case study</span>
  <h1>Shariah-screened staking,<br><span>run on chain.</span></h1>
  <p>The admin portal and the investor staking flows over smart contracts, in React and TypeScript.</p>
</div>
<div class="by"><b>Mohammad Hamza</b> &nbsp;@mhfrough &middot; mhfrough.dev</div>
<div class="mock"><img src="data:image/png;base64,${mock}"></div>
</body></html>`;

const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await og.setContent(html, { waitUntil: 'load' });
await og.evaluate(() => document.fonts.ready);
const png = await og.screenshot({ type: 'png' });
await browser.close();

const jpg = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(resolve(ROOT, 'public/og/og-ethical-node.jpg'));
const cover = await sharp(png).webp({ quality: 82 }).toFile(resolve(ROOT, 'public/images/ethical-node/cover.webp'));
console.log(`og-ethical-node.jpg ${(jpg.size / 1024).toFixed(0)} KB, cover.webp ${(cover.size / 1024).toFixed(0)} KB`);
