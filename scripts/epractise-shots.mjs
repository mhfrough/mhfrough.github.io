// Screenshots of the ePractise public site (epractise.com, Angular 16, 2024 to now) for its case study.
//   node scripts/epractise-shots.mjs
// Only the public marketing pages are captured. The firm workspace, the client portal and the tenant-management app
// are behind sign-in and are never captured: they appear on the case study as my own mockups. Before each shot these
// are hidden or redacted:
//   - the hero illustration (a screenshot of the real app) stays, but two regions of it are covered by solid neutral
//     bars: the account title (a company name) and the "Approved by" column (staff names). The bars are placed
//     from fractions of the image's own box, so they follow it at every viewport; nothing in the image is repainted,
//   - the "Trusted by" logo strip, which names the company the owner built it for (never named on this site),
//   - the tabbed info cards below it (a portrait of a person),
//   - the cookie notice (declined by hiding it; nothing is accepted), the floating chat button and scrollbars.
// The testimonials (people's names) and the contact block are never shot. Only GET requests to epractise.com hosts
// (the page and its public plan catalogue) and Google Fonts go out; everything else is aborted. No form is filled.
// Output: public/images/epractise/*.webp (quality 80) and the brand mark from the original repo (read only).
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const OUT = resolve(ROOT, 'public/images/epractise');
mkdirSync(OUT, { recursive: true });
const SITE = 'https://www.epractise.com/';
const REPO = 'D:/workspace-office/ePractice/ePractice_web'; // read only

const HIDE = [
  'section.social-proof, section.info-cards, .cookie, .toast-container, #toast-container { display: none !important; }',
  // The page fades sections in on scroll; show them as they end up.
  '.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale, .stagger-animate { opacity: 1 !important; transform: none !important; transition: none !important; }',
  'html { scrollbar-width: none; scroll-behavior: auto !important; } ::-webkit-scrollbar { display: none; }',
  '*, *::before, *::after { caret-color: transparent !important; }',
].join('\n');

// Redacted regions of the hero illustration, as fractions of the image box (left, top, width, height), measured on
// the 1796 x 1077 source: the account title next to the logo badge, and the names under "Approved by".
const REDACT = [
  [0.132, 0.022, 0.118, 0.054],
  [0.354, 0.36, 0.108, 0.228],
];

async function redact(p) {
  await p.evaluate((boxes) => {
    const img = document.querySelector('.hero img[alt="illustration"]');
    if (!img) throw new Error('hero illustration not found');
    const host = img.parentElement;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    for (const [l, t, w, h] of boxes) {
      const bar = document.createElement('div');
      bar.className = 'mh-redact';
      bar.style.cssText = [
        'position:absolute', 'z-index:5', 'border-radius:3px', 'background:#c9d1de',
        `left:${img.offsetLeft + l * img.offsetWidth}px`, `top:${img.offsetTop + t * img.offsetHeight}px`,
        `width:${w * img.offsetWidth}px`, `height:${h * img.offsetHeight}px`,
      ].join(';');
      host.append(bar);
    }
  }, REDACT);
}

const browser = await chromium.launch();

async function open(path = '', { mobile = false } = {}) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: mobile ? 2 : 1.5,
    isMobile: mobile,
    hasTouch: mobile,
    serviceWorkers: 'block',
    reducedMotion: 'reduce',
    locale: 'en-US',
  });
  await ctx.route('**/*', (route) => {
    const req = route.request();
    const host = new URL(req.url()).host;
    const ok = /(^|\.)epractise\.com$|fonts\.(googleapis|gstatic)\.com$/.test(host) && ['GET', 'OPTIONS'].includes(req.method());
    return ok ? route.continue() : route.abort();
  });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log(`  pageerror: ${e.message.split('\n')[0]}`));
  await p.goto(SITE + path, { waitUntil: 'networkidle', timeout: 60_000 });
  await p.addStyleTag({ content: HIDE });
  await settleImages(p);
  await redact(p);
  return { ctx, page: p };
}

// Waits until every image on the page has really loaded (complete with pixels), CSS background images included.
// Scrolls through first so lazy images start, then back to the top. Throws instead of saving a half-loaded shot.
// Images the page does not render (display: none, such as the desktop menu icon on wide screens) are skipped:
// they never load and never show.
async function settleImages(p) {
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await document.fonts.ready;
  });
  try {
    await p.waitForFunction(
      () =>
        [...document.images]
          .filter((i) => i.getClientRects().length > 0)
          .every((i) => i.complete && (i.naturalWidth > 0 || !i.currentSrc)),
      null,
      { timeout: 60_000, polling: 250 },
    );
  } catch {
    const broken = await p.evaluate(() =>
      [...document.images].filter((i) => i.getClientRects().length > 0 && !(i.complete && i.naturalWidth > 0)).map((i) => i.currentSrc || i.src),
    );
    throw new Error(`images did not load: ${broken.join(', ')}`);
  }
  // CSS background images: load each url once more through an Image; the browser serves them from cache when done.
  const bgFailed = await p.evaluate(async () => {
    const urls = new Set();
    for (const el of document.querySelectorAll('*')) {
      for (const m of getComputedStyle(el).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)) urls.add(m[1]);
    }
    const res = await Promise.all(
      [...urls].map((u) => new Promise((r) => { const i = new Image(); i.onload = () => r(null); i.onerror = () => r(u); i.src = u; })),
    );
    return res.filter(Boolean);
  });
  if (bgFailed.length) throw new Error(`background images did not load: ${bgFailed.join(', ')}`);
  await p.waitForLoadState('networkidle');
  await p.waitForTimeout(1200); // let decoding and any fade-in finish
}

async function save(buf, name, width) {
  const info = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(resolve(OUT, `${name}.webp`));
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

// One of the page's own sections, full width, from its top to its bottom (plus `pad`).
async function shootSection(p, selector, name, { pad = 0, width = 1600 } = {}) {
  await settleImages(p);
  const box = await p.evaluate(([sel, pd]) => {
    const r = document.querySelector(sel).getBoundingClientRect();
    const y = Math.max(0, r.top + window.scrollY - pd);
    return { x: 0, y, width: document.documentElement.clientWidth, height: r.height + pd * 2 };
  }, [selector, pad]);
  await save(await p.screenshot({ clip: box, fullPage: true }), name, width);
}

{
  const { ctx, page: p } = await open();
  // 1440 x 900 at 1.5x: header and hero, then the start of the next section.
  await settleImages(p);
  await save(await p.screenshot(), 'site-home', 1600);
  await shootSection(p, 'section.features', 'site-features');
  await shootSection(p, 'section.workflow', 'site-workflow');
  await shootSection(p, 'section.pricing', 'site-pricing');
  await ctx.close();
}
{
  const { ctx, page: p } = await open('', { mobile: true });
  await settleImages(p);
  await save(await p.screenshot(), 'site-mobile', 780);
  await ctx.close();
}

await browser.close();

// ---------------------------------------------------------------------------------------------------------------
// Brand: the mark (the project icon on /work and home) and the wordmark (OG card), from the original repo.
// ---------------------------------------------------------------------------------------------------------------
{
  const m = await sharp(`${REPO}/src/assets/images/icon.png`).resize({ height: 96 }).webp({ quality: 90, alphaQuality: 100 }).toFile(resolve(OUT, 'epractise-mark.webp'));
  console.log(`epractise-mark.webp ${m.width}x${m.height} ${(m.size / 1024).toFixed(1)} KB`);
  const logo = await sharp(`${REPO}/src/assets/images/logo.png`).ensureAlpha().trim({ threshold: 10 }).png().toBuffer();
  const l = await sharp(logo).resize({ height: 96 }).webp({ quality: 90, alphaQuality: 100 }).toFile(resolve(OUT, 'epractise-logo.webp'));
  console.log(`epractise-logo.webp ${l.width}x${l.height} ${(l.size / 1024).toFixed(1)} KB`);
}
