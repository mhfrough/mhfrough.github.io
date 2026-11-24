// Runs after `ng build` (wired into `npm run build`).
//   node scripts/postbuild.mjs [--dist <path>] [--strict] [--no-flat]
//
// 1. 404 fallback: copies 404/index.html to 404.html (GitHub Pages and Cloudflare Pages serve it for misses).
// 2. Flat pages: copies <route>/index.html to <route>.html so '/hire' (the canonical form, no trailing slash)
//    answers 200 directly on GitHub Pages and Cloudflare Pages instead of redirecting to '/hire/'.
// 3. Makes sure .nojekyll is in the output (dotfiles are easy to lose in asset copies). No CNAME: the site is
//    served from the user site https://mhfrough.github.io (owner, 2026-11-24).
// 4. CSP: replaces __INLINE_SCRIPT_HASHES__ in _headers with the sha256 of every inline <script>
//    Angular emitted (event-replay contract + bootstrap) and the stylesheet onload handler.
// 5. Writes sitemap.xml.
// 6. Sanity checks every prerendered page: html lang, exactly one <h1>, <title>, meta description,
//    canonical, parseable JSON-LD. Warns by default; --strict exits 1 on any problem.
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { ROOT, distArg, hasFlag } from './_env.mjs';
import { buildSitemap, listPages } from './sitemap.mjs';

const dist = distArg();
const strict = hasFlag('--strict');
const flat = !hasFlag('--no-flat');
const rel = (p) => relative(ROOT, p).replace(/\\/g, '/');

if (!existsSync(resolve(dist, 'index.html'))) {
  console.error(`postbuild: no index.html in ${dist}. Run ng build first.`);
  process.exit(1);
}

const pages = listPages(dist);

// 1. 404 fallback
const notFound = resolve(dist, '404/index.html');
if (existsSync(notFound)) {
  copyFileSync(notFound, resolve(dist, '404.html'));
  console.log('postbuild: 404/index.html -> 404.html');
} else {
  console.warn('postbuild: WARN no 404/index.html prerendered, static hosts will show their default 404');
}

// 2. Flat copies
if (flat) {
  let n = 0;
  for (const { file, path } of pages) {
    if (path === '/' || path === '/404') continue;
    copyFileSync(file, resolve(dist, path.slice(1) + '.html'));
    n++;
  }
  console.log(`postbuild: ${n} flat copies (<route>.html) for slash-less canonical URLs`);
}

// 3. Host files
for (const [name, content] of [['.nojekyll', '']]) {
  const target = resolve(dist, name);
  if (!existsSync(target)) {
    const src = resolve(ROOT, 'public', name);
    writeFileSync(target, existsSync(src) ? readFileSync(src) : content);
    console.log(`postbuild: added ${name}`);
  }
}

// 4. CSP hashes
const scriptHashes = new Set();
const handlerHashes = new Set();
const sha = (s) => `'sha256-${createHash('sha256').update(s, 'utf8').digest('base64')}'`;
for (const { file } of pages) {
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = m[1];
    if (/\bsrc=/i.test(attrs) || /type=["']application\/(ld\+)?json["']/i.test(attrs)) continue;
    if (m[2].trim()) scriptHashes.add(sha(m[2]));
  }
  for (const m of html.matchAll(/\son(?:load|error)="([^"]*)"/gi)) handlerHashes.add(sha(m[1].replace(/&#39;|&apos;/g, "'")));
}
const headersFile = resolve(dist, '_headers');
if (existsSync(headersFile)) {
  const sources = [...scriptHashes, ...(handlerHashes.size ? ["'unsafe-hashes'", ...handlerHashes] : [])].join(' ');
  const before = readFileSync(headersFile, 'utf8');
  const token = /(script-src 'self') __INLINE_SCRIPT_HASHES__/;
  if (token.test(before)) {
    writeFileSync(headersFile, before.replace(token, `$1 ${sources}`));
    console.log(`postbuild: CSP script-src += ${scriptHashes.size} inline script hash(es), ${handlerHashes.size} handler hash(es)`);
  } else {
    console.log('postbuild: _headers already has CSP hashes (re-run on an existing dist), left as is');
  }
}

// 5. Sitemap
const sm = buildSitemap(dist);
console.log(`postbuild: sitemap.xml with ${sm.count} urls (skipped ${sm.skipped.join(', ') || 'none'})`);

// 6. Sanity checks
const strip = (html) => html.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '');
const problems = [];
for (const { file, path } of pages) {
  const html = readFileSync(file, 'utf8');
  const body = strip(html);
  const issues = [];
  const lang = html.match(/<html[^>]*\slang="([^"]*)"/i)?.[1];
  if (lang !== 'en') issues.push(`html lang="${lang ?? ''}" (expected en)`);
  const h1 = (body.match(/<h1[\s>]/gi) ?? []).length;
  if (h1 !== 1) issues.push(`${h1} <h1>`);
  if (!/<title>[^<]+<\/title>/i.test(html)) issues.push('no <title>');
  if (!/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}/i.test(html)) issues.push('no meta description');
  if (!/<link[^>]+rel=["']canonical["']/i.test(html)) issues.push('no canonical');
  const ld = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (!ld.length) issues.push('no JSON-LD');
  for (const [, json] of ld) {
    try {
      JSON.parse(json);
    } catch {
      issues.push('JSON-LD does not parse');
    }
  }
  if (/[–—]/.test(body.replace(/<[^>]+>/g, ''))) issues.push('en/em dash in visible text');
  if (issues.length) problems.push(`  ${path.padEnd(22)} ${issues.join(', ')}`);
}
if (problems.length) {
  console[strict ? 'error' : 'warn'](
    `postbuild: ${strict ? 'FAIL' : 'WARN'} ${problems.length}/${pages.length} page(s) with SEO issues:\n${problems.join('\n')}`,
  );
  if (strict) process.exit(1);
} else {
  console.log(`postbuild: all ${pages.length} pages pass the SEO sanity checks`);
}
console.log(`postbuild: done (${rel(dist)})`);
