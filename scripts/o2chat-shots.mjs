// Screenshots of the O2Chat public site (www.o2chat.io, Angular 16 prerendered with Universal) for its case study.
//   node scripts/o2chat-shots.mjs
// The site is live, so the shots are taken from it as any visitor sees it. Only public marketing pages are
// captured here (the agent portal's dashboard and inbox come from its local build with sample data, see
// o2chat-app-shots.mjs; the tenant portal and widget are my own mockups). Two parts of the home page
// are never in a frame: the hero photo (a person) and the team-inbox illustration (it carries first names), so the
// desktop shot is the pricing page and the detail shots start below them. Analytics and third-party scripts are
// aborted; the site sets no cookie banner today, but any reject button is pressed first if one appears.
// Output: public/images/o2chat/*.webp (quality 80) and the mark from the live favicon.
//   --assets-only skips the browser shots.
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const OUT = resolve(ROOT, 'public/images/o2chat');
mkdirSync(OUT, { recursive: true });
const SITE = 'https://www.o2chat.io';

// The scrollbar and the caret are not the product; the boot loader fades on its own but is hidden to be sure.
const HIDE = [
  '#loader { display: none !important; }',
  'html { scrollbar-width: none; scroll-behavior: auto !important; } ::-webkit-scrollbar { display: none; }',
  '*, *::before, *::after { caret-color: transparent !important; }',
].join('\n');

const browser = await chromium.launch();

async function open(path, { mobile = false } = {}) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: mobile ? 2 : 1.5,
    isMobile: mobile,
    hasTouch: mobile,
    userAgent: mobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
      : undefined,
    serviceWorkers: 'block',
    reducedMotion: 'reduce',
    locale: 'en-US',
  });
  await ctx.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(SITE) || url.startsWith('data:') || /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url)) return route.continue();
    // The site's own chat launcher (the product) is loaded from its widget hosts, and the public plan prices are
    // read from the product's own API: data calls are let through without naming their hosts here.
    if (/^https:\/\/widget[a-z-]*\.o2chat\.io\//.test(url)) return route.continue();
    const req = route.request();
    if (['xhr', 'fetch'].includes(req.resourceType()) && req.method() === 'GET') return route.continue();
    return route.abort(); // analytics, tag managers, video hosts, third-party scripts
  });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log(`  pageerror: ${e.message.split('\n')[0]}`));
  await p.goto(SITE + path, { waitUntil: 'load', timeout: 60_000 });
  await settle(p);
  return { ctx, page: p };
}

async function settle(p, extra = 1200) {
  await p.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await p.addStyleTag({ content: HIDE });
  // Privacy first: if a consent banner ever appears, take the reject path.
  for (const name of [/^(reject|decline)/i, /necessary only/i]) {
    const b = p.getByRole('button', { name });
    if (await b.count()) await b.first().click().catch(() => {});
  }
  await p.evaluate(async () => {
    for (let y = 0; y < Math.min(document.body.scrollHeight, 9000); y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    const pending = [...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; }));
    await Promise.race([Promise.all(pending), new Promise((r) => setTimeout(r, 3000))]);
  });
  await p.waitForTimeout(extra);
}

async function save(buf, name, width) {
  const file = resolve(OUT, `${name}.webp`);
  const info = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(file);
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

// A full viewport (16:10) starting just above the block that holds a heading with this text, below the fixed
// header, so detail shots share one shape. `up` climbs from the heading to the block that should open the frame.
async function shootAt(p, text, name, { gap = 24, up = 0 } = {}) {
  const top = await p.evaluate(([t, g, u]) => {
    const h = [...document.querySelectorAll('h1, h2, h3, h4')].find((e) => e.textContent?.replace(/\s+/g, ' ').includes(t));
    if (!h) return null;
    let el = h;
    for (let i = 0; i < u && el.parentElement; i++) el = el.parentElement;
    const fixed = [...document.querySelectorAll('body *')].filter((e) => ['fixed', 'sticky'].includes(getComputedStyle(e).position) && e.getBoundingClientRect().top <= 0 && e.getBoundingClientRect().height < 140);
    const head = Math.max(0, ...fixed.map((e) => e.getBoundingClientRect().bottom));
    return Math.max(0, el.getBoundingClientRect().top + window.scrollY - head - g);
  }, [text, gap, up]);
  if (top === null) return console.log(`  ${name}: no heading with "${text}"`);
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top);
  await p.waitForTimeout(800);
  await save(await p.screenshot(), name, 1600);
}

// ---------------------------------------------------------------------------------------------------------------
// Screenshots (public pages only)
// ---------------------------------------------------------------------------------------------------------------
if (!process.argv.includes('--assets-only')) {
  {
    const { ctx, page: p } = await open('/pricing');
    await save(await p.screenshot(), 'site-pricing', 1600);
    await shootAt(p, 'Compare LiveChat plans', 'site-compare');
    await ctx.close();
  }
  {
    const { ctx, page: p } = await open('/');
    await shootAt(p, 'Omni-channel Messaging', 'site-integrations', { up: 2 });
    await shootAt(p, 'Premium Features For All', 'site-features');
    await ctx.close();
  }
  {
    // The phone shot is the hero: on a phone the site drops the hero photo. The team-inbox illustration that
    // follows is taken out of the flow so its names never reach a frame.
    const { ctx, page: p } = await open('/', { mobile: true });
    await p.addStyleTag({ content: 'img[src*="banner"], img[src$="/preview.gif"] { display: none !important; }' });
    await save(await p.screenshot(), 'site-mobile', 780);
    await ctx.close();
  }
}

await browser.close();

// ---------------------------------------------------------------------------------------------------------------
// The mark: the O2 speech bubble, taken from the 256 px PNG inside the live favicon.ico, saved at 128 px for the
// project icon and the architecture diagram.
// ---------------------------------------------------------------------------------------------------------------
{
  const res = await fetch(`${SITE}/favicon.ico`);
  const ico = Buffer.from(await res.arrayBuffer());
  let png = null;
  for (let i = 0; i < ico.readUInt16LE(4); i++) {
    const o = 6 + i * 16;
    const size = ico.readUInt32LE(o + 8);
    const off = ico.readUInt32LE(o + 12);
    if ((ico[o] || 256) === 256 && ico.readUInt32BE(off) === 0x89504e47) png = ico.subarray(off, off + size);
  }
  if (!png) throw new Error('favicon.ico has no 256 px PNG');
  const info = await sharp(png).resize(128, 128).webp({ quality: 90, alphaQuality: 100 }).toFile(resolve(OUT, 'o2chat-mark.webp'));
  console.log(`o2chat-mark.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(1)} KB`);
}
