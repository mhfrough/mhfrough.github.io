// Single source of the sitemap: writes sitemap.xml and the data file the /sitemap page renders.
//
//   node scripts/sitemap.mjs                    (npm run sitemap: source files, plus the default dist if built)
//   node scripts/sitemap.mjs --dist <path>      (source files, then checks and writes <dist>/sitemap.xml)
//   node scripts/sitemap.mjs --source           (source files only; runs as prestart / prebuild / prebuild:dev)
//
// 1. Entries come from src/app/app.routes.ts (every routed page except 404, ** and redirects), so they exist
//    before `ng build` runs. loc = origin + path, which is exactly the canonical every page passes to Seo.set().
//    lastmod = the last git commit touching the page's component folder (today if that folder has uncommitted
//    changes or git is unavailable), so the output only changes when a page does.
// 2. Writes public/sitemap.xml (served by `ng serve`, copied into the build like any public file), then parses
//    that XML back into src/app/pages/sitemap/sitemap.data.ts. The /sitemap page imports that file, so the
//    prerendered page and sitemap.xml always show the same entries. Both files are only rewritten on change.
// 3. buildSitemap(dist) (called by scripts/postbuild.mjs): cross-checks the XML against the prerendered pages
//    (missing pages, canonical mismatch, noindex) and writes <dist>/sitemap.xml, so the output has exactly one.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ORIGIN, ROOT, distArg, hasFlag } from './_env.mjs';

const ROUTES_FILE = resolve(ROOT, 'src/app/app.routes.ts');
export const PUBLIC_XML = resolve(ROOT, 'public/sitemap.xml');
export const DATA_FILE = resolve(ROOT, 'src/app/pages/sitemap/sitemap.data.ts');
const posix = (p) => relative(ROOT, p).split(sep).join('/');

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

/** Routed pages from app.routes.ts, in declaration order: { path, dir } (dir = component folder). */
export function readRoutes(file = ROUTES_FILE) {
  const src = readFileSync(file, 'utf8');
  const marks = [...src.matchAll(/\bpath:\s*'([^']*)'/g)];
  const out = [];
  marks.forEach((m, i) => {
    const chunk = src.slice(m.index, marks[i + 1]?.index ?? src.length);
    const path = m[1];
    if (path === '**' || path === '404' || path.includes(':') || /\bredirectTo\b/.test(chunk))
      return;
    const imp = chunk.match(/import\(\s*'([^']+)'\s*\)/)?.[1];
    out.push({
      path: path ? `/${path}` : '/',
      dir: imp ? dirname(resolve(dirname(file), imp)) : null,
    });
  });
  return out;
}

const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, local time

function git(args) {
  try {
    return execFileSync('git', args, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

/** Last commit date of a page folder, or today when it has local changes (or git is missing). */
function lastmodFor(dir) {
  if (!dir) return today();
  const spec = ['--', posix(dir)];
  // The generated data file must not move /sitemap's own date, or every regeneration would change it again.
  if (posix(dir) === posix(dirname(DATA_FILE))) spec.push(`:(exclude)${posix(DATA_FILE)}`);
  const dirty = git(['status', '--porcelain', ...spec]);
  if (dirty === null || dirty !== '') return today();
  return git(['log', '-1', '--format=%cs', ...spec]) || today();
}

function ranking(path, dir) {
  const legal = dir && posix(dir).endsWith('pages/legal');
  if (path === '/') return { changefreq: 'weekly', priority: '1.0' };
  if (legal) return { changefreq: 'yearly', priority: '0.3' };
  if (path === '/sitemap') return { changefreq: 'monthly', priority: '0.3' };
  if (path === '/work') return { changefreq: 'weekly', priority: '0.8' };
  return { changefreq: 'monthly', priority: path.split('/').length > 2 ? '0.7' : '0.8' };
}

export function sourceEntries() {
  return readRoutes().map(({ path, dir }) => ({
    loc: ORIGIN + path,
    lastmod: lastmodFor(dir),
    ...ranking(path, dir),
  }));
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const unesc = (s) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');

export function renderXml(entries) {
  const tag = (name, v) => (v ? `    <${name}>${esc(v)}</${name}>\n` : '');
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries
      .map(
        (u) =>
          `  <url>\n${tag('loc', u.loc)}${tag('lastmod', u.lastmod)}${tag('changefreq', u.changefreq)}${tag('priority', u.priority)}  </url>\n`,
      )
      .join('') +
    `</urlset>\n`
  );
}

/** Minimal parser for the urlset we write (and any plain sitemaps.org urlset). */
export function parseSitemapXml(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, body]) => {
    const get = (name) => {
      const v = body.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1];
      return v === undefined ? undefined : unesc(v.trim());
    };
    const loc = get('loc');
    const path = loc.startsWith(ORIGIN) ? loc.slice(ORIGIN.length) || '/' : new URL(loc).pathname;
    return {
      loc,
      path,
      lastmod: get('lastmod'),
      changefreq: get('changefreq'),
      priority: get('priority'),
    };
  });
}

const q = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

export function renderData(entries) {
  // One property per line: the shape Prettier keeps, so formatting the repo never fights the generator.
  const row = (e) =>
    '  {\n' +
    Object.entries(e)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `    ${k}: ${q(v)},\n`)
      .join('') +
    '  },\n';
  return (
    `// GENERATED by scripts/sitemap.mjs from public/sitemap.xml. Do not edit by hand.\n` +
    `// Regenerate with \`npm run sitemap\` (also runs before \`npm start\` and \`npm run build\`).\n` +
    `export interface SitemapEntry {\n` +
    `  /** Absolute URL, exactly as in <loc>. */\n` +
    `  readonly loc: string;\n` +
    `  /** Root-relative path, for routerLink. */\n` +
    `  readonly path: string;\n` +
    `  /** YYYY-MM-DD */\n` +
    `  readonly lastmod?: string;\n` +
    `  readonly changefreq?: string;\n` +
    `  readonly priority?: string;\n` +
    `}\n\n` +
    `export const SITEMAP_ENTRIES: readonly SitemapEntry[] = [\n` +
    entries.map(row).join('') +
    `];\n`
  );
}

function writeIfChanged(file, content) {
  if (existsSync(file) && readFileSync(file, 'utf8') === content) return false;
  writeFileSync(file, content);
  return true;
}

/** Writes public/sitemap.xml and the page data parsed from it. */
export function writeSource() {
  const xml = renderXml(sourceEntries());
  const entries = parseSitemapXml(xml);
  const xmlChanged = writeIfChanged(PUBLIC_XML, xml);
  const dataChanged = writeIfChanged(DATA_FILE, renderData(entries));
  return { xml, entries, changed: xmlChanged || dataChanged };
}

/**
 * Postbuild: checks the source sitemap against the prerendered pages and writes <dist>/sitemap.xml.
 * Returns { count, skipped, urls, problems } (skipped = prerendered pages left out: 404 and noindex).
 */
export function buildSitemap(dist) {
  const { xml: fresh, entries } = writeSource();
  const copied = existsSync(resolve(dist, 'sitemap.xml'))
    ? readFileSync(resolve(dist, 'sitemap.xml'), 'utf8')
    : null;
  const pages = new Map(listPages(dist).map((p) => [p.path, p]));
  const problems = [];
  const skipped = [];
  const keep = [];

  for (const e of entries) {
    const page = pages.get(e.path);
    if (!page) {
      problems.push(`${e.path} is in the sitemap but was not prerendered`);
      continue;
    }
    const html = readFileSync(page.file, 'utf8');
    if (/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)) {
      problems.push(`${e.path} is noindex, left out of the sitemap`);
      continue;
    }
    const canonical = html
      .match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0]
      .match(/href=["']([^"']+)["']/i)?.[1];
    if (canonical && canonical !== e.loc)
      problems.push(`${e.path} canonical ${canonical} differs from <loc> ${e.loc}`);
    keep.push(e);
  }
  const listed = new Set(entries.map((e) => e.path));
  for (const path of pages.keys()) if (!listed.has(path)) skipped.push(path);
  for (const path of skipped)
    if (path !== '/404')
      problems.push(`${path} was prerendered but is not routed in app.routes.ts`);

  const xml = keep.length === entries.length ? fresh : renderXml(keep);
  writeFileSync(resolve(dist, 'sitemap.xml'), xml);
  if (copied !== null && copied !== fresh) {
    problems.push(
      'public/sitemap.xml changed after ng build copied it: /sitemap shows the old list, rebuild to refresh it',
    );
  }
  for (const p of problems) console.warn(`sitemap: WARN ${p}`);
  return { count: keep.length, skipped, urls: keep.map((e) => e.loc), problems };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = writeSource();
  console.log(
    `sitemap: ${r.entries.length} urls -> public/sitemap.xml + ${posix(DATA_FILE)}${r.changed ? '' : ' (unchanged)'}`,
  );
  const dist = distArg();
  if (!hasFlag('--source') && (hasFlag('--dist') || existsSync(resolve(dist, 'index.html')))) {
    if (!existsSync(resolve(dist, 'index.html'))) {
      console.error(`sitemap: no index.html in ${dist}. Run ng build first.`);
      process.exit(1);
    }
    const d = buildSitemap(dist);
    console.log(
      `sitemap: ${d.count} urls -> ${posix(resolve(dist, 'sitemap.xml'))} (skipped ${d.skipped.join(', ') || 'none'})`,
    );
  }
}
