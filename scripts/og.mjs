// Open Graph cards, 1200 x 630 JPG (every crawler reads JPG; WebP is not universal).
//   node scripts/og.mjs [og-default og-hire ...]
// Renders scripts/og/template.html in Playwright Chromium with the site's own fonts (fontsource packages),
// then encodes with sharp (mozjpeg). Output: public/og/og-*.jpg, each must stay < 150 KB.
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT, CACHE } from './_env.mjs';

const { chromium } = await import('playwright');

// Keep in sync with MARK_ARC / MARK_BAR in src/app/shared/ui/logo.ts (48-unit grid).
const MARK_ARC = 'M30.36 15.14A9 9 0 1 0 24 30.5';
const MARK_BAR = { x: 12, y: 30, w: 25, h: 5 };
const MAX_BYTES = 150 * 1024;

const font = (family, path, weight) => {
  const data = readFileSync(path).toString('base64');
  return `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${data}) format('woff2');}`;
};
// Geist Mono: the fontsource package if the site installs it, else the vendored OFL copy in scripts/og/fonts.
const geistMono = [
  resolve(ROOT, 'node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2'),
  resolve(ROOT, 'scripts/og/fonts/GeistMono-Variable.woff2'),
].find((p) => existsSync(p));
const FONTS = [
  font('Geist', resolve(ROOT, 'node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2'), '100 900'),
  font('Geist Mono', geistMono, '100 900'),
].join('\n');

const glyph = (fill) =>
  `<path d="${MARK_ARC}" fill="none" stroke="${fill}" stroke-width="5"/><rect x="${MARK_BAR.x}" y="${MARK_BAR.y}" width="${MARK_BAR.w}" height="${MARK_BAR.h}" fill="${fill}"/>`;

/** Display mark inside the card: glyph, its construction circle (r 9 about 24, 21.5), centre and baseline. */
const MARK = `<div class="art"><svg viewBox="0 0 48 48" aria-hidden="true">
  <circle cx="24" cy="21.5" r="9" fill="none" stroke="#3a3a3a" stroke-width="1" vector-effect="non-scaling-stroke" stroke-dasharray="2 6"/>
  <line x1="4" y1="30" x2="44" y2="30" stroke="#2c2c2c" stroke-width="1" vector-effect="non-scaling-stroke"/>
  ${glyph('#ededed')}
  <circle cx="24" cy="21.5" r="0.5" fill="#9a9a9a"/>
</svg></div><div class="cap"><span>the mark</span><span>48 grid, r 9, 225°</span></div>`;

const head = (path = '') =>
  `<div class="head"><span class="brand-mark"><svg viewBox="0 0 48 48" aria-hidden="true">${glyph('#111111')}</svg></span><span class="wordmark">mhfrough</span>${path ? `<span class="path">${path}</span>` : ''}</div>`;

const chips = (...items) => `<div class="chips">${items.join('')}</div>`;
const chip = (t, mono = false) => `<span class="chip${mono ? ' mono' : ''}">${t}</span>`;
const pill = (label, text) => `<span class="pill"><b>${label}</b>${text}</span>`;

const CARDS = {
  'og-default': `
    ${head()}
    <div class="body">
      <h1>Mohammad Hamza</h1>
      <p class="sub">Software Architect. Angular platforms, <span class="nw">multi-tenant</span> SaaS, design systems.</p>
      ${chips(pill('@mhfrough', 'mhfrough.dev'), chip('Karachi, PK', true))}
    </div>`,
  'og-work': page('/work', 'Selected work', 'Platforms, <span class="nw">multi-tenant</span> SaaS and the design systems behind them.'),
  'og-hire': page('/hire', 'Hire me', 'Freelance and contract work, from architecture to launch.'),
  'og-brand': page('/brand', 'Brand system', 'The mark, type, tokens and motion behind this site.'),
};

function page(path, title, sub) {
  return `
    ${head(path)}
    <div class="body">
      <h1>${title}</h1>
      <p class="sub">${sub}</p>
      ${chips(pill('@mhfrough', 'Mohammad Hamza'), chip('Software Architect'))}
    </div>`;
}

const template = readFileSync(resolve(ROOT, 'scripts/og/template.html'), 'utf8');
const outDir = resolve(ROOT, 'public/og');
const tmpDir = resolve(CACHE, 'tmp/og');
mkdirSync(outDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
let failed = false;
try {
  for (const [name, content] of Object.entries(CARDS)) {
    if (only.length && !only.includes(name)) continue;
    const html = template.replace('{{FONTS}}', FONTS).replace('{{MARK}}', MARK).replace('{{CONTENT}}', content);
    if (html.includes('{{')) throw new Error(name + ': unreplaced placeholder in template');
    const htmlPath = resolve(tmpDir, `${name}.html`);
    writeFileSync(htmlPath, html);
    await pg.goto('file:///' + htmlPath.replace(/\\/g, '/'));
    await pg.evaluate(() => document.fonts.ready);
    // Fail loudly if a font silently fell back.
    const missing = await pg.evaluate(() =>
      ['600 20px Geist', '20px "Geist Mono"'].filter((f) => !document.fonts.check(f, 'Aa')),
    );
    // Layout checks: nothing outside the card, the title never collides with the display mark.
    const problems = await pg.evaluate(() => {
      const out = [];
      const card = document.querySelector('.card').getBoundingClientRect();
      for (const el of document.querySelectorAll('.copy *')) {
        const r = el.getBoundingClientRect();
        if (!r.width) continue;
        if (r.left < 79 || r.bottom > 559 || r.top < 71) out.push(`${el.tagName}.${el.className} outside`);
        if (r.right > card.left - 32) out.push(`${el.tagName}.${el.className} too close to card`);
        if (el.scrollWidth > el.clientWidth + 1) out.push(`${el.tagName}.${el.className} overflows`);
      }
      return out;
    });
    const png = await pg.screenshot({ type: 'png' });
    const jpg = await sharp(png).jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer();
    const file = resolve(outDir, `${name}.jpg`);
    writeFileSync(file, jpg);
    const size = statSync(file).size;
    const warn = [
      size > MAX_BYTES && 'over 150 KB',
      missing.length && `fonts not loaded: ${missing.join(', ')}`,
      ...problems,
    ].filter(Boolean);
    if (warn.length) failed = true;
    console.log(`${warn.length ? 'FAIL' : 'ok  '} public/og/${name}.jpg  ${(size / 1024).toFixed(1)} KB${warn.length ? '  ' + warn.join('; ') : ''}`);
  }
} finally {
  await browser.close();
}
if (failed) process.exit(1);
