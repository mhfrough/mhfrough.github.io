// Card images for /work: each case study's own hero section (copy + live mockup), captured from a build, plus its
// first interactive demo for case studies that have no site screenshots. The /work cards stack these with the
// case study's site screenshots (see CARD_STACKS in src/app/pages/work/work.data.ts).
//   npx ng build --configuration development --output-path .devcache/build/cards
//   node scripts/work-cards.mjs --dist .devcache/build/cards/browser
// No server: the dist is served through context.route() on a virtual origin. The nav and cookie notice are hidden,
// motion is reduced (the hero renders in its final state), and every image must finish loading before a capture.
// Output: public/images/work/<slug>-hero.webp, <slug>-app.webp (the hero mockup alone) and <slug>-demo-<n>.webp
// for up to four demos (WebP q80, 1200 px wide).
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT, distArg } from './_env.mjs';

const { chromium } = await import('playwright');
const DIST = resolve(ROOT, distArg() ?? '.devcache/build/cards/browser');
const OUT = resolve(ROOT, 'public/images/work');
mkdirSync(OUT, { recursive: true });
const ORIGIN = 'http://cards.test';

// Case studies on /work, from the data file (caseStudy: '/work/<slug>').
const DATA = readFileSync(resolve(ROOT, 'src/app/pages/work/work.data.ts'), 'utf8');
const SLUGS = [...new Set([...DATA.matchAll(/caseStudy:\s*'\/work\/([a-z0-9-]+)'/g)].map((m) => m[1]))];

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2',
  '.json': 'application/json', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain',
};
const HIDE = `mh-nav, mh-cookie-notice, .cookie-notice { display: none !important; }
  html { scrollbar-width: none; } ::-webkit-scrollbar { display: none; }`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5, reducedMotion: 'reduce' });
await ctx.addInitScript(() => {
  try { localStorage.setItem('mh:cookie-notice', '1'); } catch {}
});
await ctx.route('**/*', (route) => {
  const url = new URL(route.request().url());
  if (url.origin !== ORIGIN) return route.abort();
  let file = join(DIST, decodeURIComponent(url.pathname));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) file = join(DIST, 'index.html');
  return route.fulfill({ body: readFileSync(file), contentType: TYPES[extname(file)] ?? 'application/octet-stream' });
});

// Same rule as the screenshot scripts: never capture before every image in the captured element has loaded.
// (Only that element: lazy images further down a page, e.g. off-screen carousel slides, may never load.)
async function settle(p, el) {
  await p.evaluate(() => document.fonts.ready);
  try {
    await el.evaluate(
      (root) =>
        new Promise((done, fail) => {
          const t0 = Date.now();
          const tick = () => {
            const imgs = [...root.querySelectorAll('img')].filter((i) => i.getClientRects().length);
            imgs.forEach((i) => (i.loading = 'eager'));
            if (imgs.every((i) => i.complete && i.naturalWidth > 0)) return done();
            if (Date.now() - t0 > 60_000) return fail(new Error(imgs.filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.currentSrc || i.src).join(', ')));
            setTimeout(tick, 250);
          };
          tick();
        }),
    );
  } catch (e) {
    throw new Error(`images did not load: ${e.message}`);
  }
  await p.waitForLoadState('networkidle');
  await p.waitForTimeout(800);
}

async function save(buf, name) {
  const info = await sharp(buf).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 80 }).toFile(resolve(OUT, `${name}.webp`));
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

const page = await ctx.newPage();
page.on('pageerror', (e) => console.log(`  pageerror: ${e.message.split('\n')[0]}`));
for (const slug of SLUGS) {
  await page.goto(`${ORIGIN}/work/${slug}/`, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: HIDE });
  const hero = page.locator('main section.hero, section.hero').first();
  // The hero row only (copy + mockup), not the meta strip under it.
  const grid = hero.locator('.hero-grid').first();
  const target = (await grid.count()) ? grid : hero;
  await settle(page, target);
  await save(await target.screenshot(), `${slug}-hero`);
  // The hero's working mockup on its own (the portal or dashboard with sample data): the last child of the row.
  const app = grid.locator(':scope > *').last();
  if (await grid.count()) {
    await settle(page, app);
    await save(await app.screenshot(), `${slug}-app`);
  }

  // Every interactive demo below the hero (top-level custom elements in a .section, taller than 250 px), so the
  // /work cards can page through 5 to 7 shots per project.
  const count = await page.evaluate(() => {
    const skip = /THEME|TECH-PILLS|SKELETON|CARD-SLIDER/;
    const found = [];
    for (const el of document.querySelectorAll('section.section *')) {
      if (!el.tagName.startsWith('MH-') || skip.test(el.tagName)) continue;
      if (found.some((f) => f.contains(el))) continue;
      if (el.getBoundingClientRect().height > 250) found.push(el);
    }
    found.forEach((el, i) => el.setAttribute('data-card-demo', String(i + 1)));
    return found.length;
  });
  for (let i = 1; i <= Math.min(count, 4); i++) {
    const el = page.locator(`[data-card-demo="${i}"]`);
    await el.scrollIntoViewIfNeeded();
    await settle(page, el);
    await save(await el.screenshot(), `${slug}-demo-${i}`);
  }
}
await browser.close();
