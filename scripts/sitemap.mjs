// Writes <dist>/sitemap.xml from the prerendered pages.
//   node scripts/sitemap.mjs [--dist <path>]     (default dist/mhfrough/browser)
// Walks every **/index.html, skips the 404 page and anything marked noindex. URLs come from each page's
// canonical link (so they always match what the page declares), falling back to the folder path.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ORIGIN, distArg } from './_env.mjs';

/** Every prerendered page as { file, path } where path is '/', '/work', '/work/quorum', ... */
export function listPages(dist) {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name === 'index.html') {
        const rel = relative(dist, dir).split(sep).join('/');
        out.push({ file: full, path: rel ? `/${rel}` : '/' });
      }
    }
  };
  walk(dist);
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function buildSitemap(dist, { date = new Date() } = {}) {
  const lastmod = date.toISOString().slice(0, 10);
  const urls = [];
  const skipped = [];
  for (const { file, path } of listPages(dist)) {
    const html = readFileSync(file, 'utf8');
    if (path === '/404' || /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)) {
      skipped.push(path);
      continue;
    }
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0].match(/href=["']([^"']+)["']/i)?.[1];
    const loc = canonical && canonical.startsWith(ORIGIN) ? canonical : ORIGIN + (path === '/' ? '/' : path);
    urls.push({ loc, priority: path === '/' ? '1.0' : path.split('/').length > 2 ? '0.7' : '0.8' });
  }
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((u) => `  <url>\n    <loc>${esc(u.loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>\n`)
      .join('') +
    `</urlset>\n`;
  writeFileSync(resolve(dist, 'sitemap.xml'), xml);
  return { count: urls.length, skipped, urls: urls.map((u) => u.loc) };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dist = distArg();
  const r = buildSitemap(dist);
  console.log(`sitemap: ${r.count} urls -> ${relative(process.cwd(), resolve(dist, 'sitemap.xml'))} (skipped ${r.skipped.join(', ') || 'none'})`);
}
