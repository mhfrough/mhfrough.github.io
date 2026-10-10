// Lighthouse 12 against the static build, mobile + desktop presets.
//   node scripts/lighthouse.mjs [--dist <path>] [--assert] [--only /,/brand] [--preset mobile|desktop] [--http-server]
// Serves <dist> on a free port (scripts/serve.mjs, production-like; or http-server with --http-server), drives Playwright's Chromium (headless=new) through
// chrome-launcher with a throwaway profile in .devcache/tmp/lh-profile, writes HTML + JSON reports to
// reports/lighthouse/, prints a score table and, with --assert, exits 1 when
// accessibility / best-practices / SEO < 95 or performance < 90.
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { CACHE, ROOT, distArg, hasFlag } from './_env.mjs';

const { chromium } = await import('playwright');
const { default: lighthouse } = await import('lighthouse');
const { default: desktopConfig } = await import('lighthouse/core/config/desktop-config.js');
const chromeLauncher = await import('chrome-launcher');

const ROUTES = ['/', '/work/quorum', '/brand', '/contact'];
const MIN = { performance: 90, accessibility: 95, 'best-practices': 95, seo: 95 };

const argVal = (name) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const dist = distArg();
const routes = argVal('--only')?.split(',') ?? ROUTES;
const presets = argVal('--preset') ? [argVal('--preset')] : ['mobile', 'desktop'];
const assert = hasFlag('--assert');
const outDir = resolve(ROOT, 'reports/lighthouse');
const profile = resolve(CACHE, 'tmp/lh-profile');

if (!existsSync(resolve(dist, 'index.html'))) {
  console.error(`lighthouse: no build at ${dist}. Run npm run build (or pass --dist).`);
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });
rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
mkdirSync(profile, { recursive: true });

const freePort = () =>
  new Promise((ok, fail) => {
    const s = createServer();
    s.once('error', fail);
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => ok(port));
    });
  });

async function waitFor(url, ms = 15_000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error(`server did not answer at ${url}`);
}

const port = await freePort();
const origin = `http://127.0.0.1:${port}`;
// Default: scripts/serve.mjs (compression + clean URLs, like the real hosts). --http-server uses plain
// http-server instead (no compression, '/x' -> '/x/' redirects, no-store caching), which under-reports.
const server = hasFlag('--http-server')
  ? spawn(
      process.execPath,
      [resolve(ROOT, 'node_modules/http-server/bin/http-server'), dist, '-p', String(port), '-a', '127.0.0.1', '-c-1', '--silent'],
      { stdio: 'ignore' },
    )
  : spawn(process.execPath, [resolve(ROOT, 'scripts/serve.mjs'), '--dist', dist, '--port', String(port)], { stdio: 'ignore' });

let chrome;
const rows = [];
let failures = 0;
try {
  await waitFor(origin + '/');
  chrome = await chromeLauncher.launch({
    chromePath: chromium.executablePath(),
    userDataDir: profile,
    chromeFlags: ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--disable-extensions'],
    logLevel: 'silent',
  });

  for (const route of routes) {
    for (const preset of presets) {
      const url = origin + route;
      const config = preset === 'desktop' ? desktopConfig : undefined;
      const result = await lighthouse(url, { port: chrome.port, output: ['html', 'json'], logLevel: 'error' }, config);
      if (!result) throw new Error(`no result for ${url}`);
      const { lhr, report } = result;
      const slug = `${route === '/' ? 'home' : route.slice(1).replace(/\//g, '-')}-${preset}`;
      writeFileSync(resolve(outDir, `${slug}.html`), report[0]);
      writeFileSync(resolve(outDir, `${slug}.json`), report[1]);

      const score = (k) => Math.round((lhr.categories[k]?.score ?? 0) * 100);
      const audit = (k) => lhr.audits[k]?.numericValue;
      const row = {
        route,
        preset,
        performance: score('performance'),
        accessibility: score('accessibility'),
        'best-practices': score('best-practices'),
        seo: score('seo'),
        lcp: audit('largest-contentful-paint'),
        cls: audit('cumulative-layout-shift'),
        tbt: audit('total-blocking-time'),
        failed: Object.values(lhr.audits)
          .filter((a) => a.score !== null && a.score < 0.9 && ['binary', 'numeric', 'metricSavings'].includes(a.scoreDisplayMode))
          .map((a) => a.id),
      };
      row.below = Object.entries(MIN)
        .filter(([k, min]) => row[k] < min)
        .map(([k]) => k);
      if (row.below.length) failures++;
      rows.push(row);
      process.stdout.write(`  ${slug.padEnd(22)} done\n`);
    }
  }
} finally {
  await chrome?.kill();
  server.kill();
  // Chrome on Windows releases profile files a moment after exit.
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
  } catch (e) {
    console.warn(`lighthouse: could not remove ${profile} yet (${e.code}); it is reset on the next run`);
  }
}

const pad = (s, n) => String(s).padEnd(n);
const fmtMs = (v) => (v === undefined ? '-' : `${Math.round(v)}ms`);
console.log(
  '\n' +
    pad('route', 16) + pad('preset', 9) + pad('perf', 6) + pad('a11y', 6) + pad('bp', 6) + pad('seo', 6) +
    pad('LCP', 9) + pad('CLS', 7) + pad('TBT', 8) + 'below threshold',
);
for (const r of rows) {
  console.log(
    pad(r.route, 16) + pad(r.preset, 9) + pad(r.performance, 6) + pad(r.accessibility, 6) + pad(r['best-practices'], 6) +
      pad(r.seo, 6) + pad(fmtMs(r.lcp), 9) + pad(r.cls === undefined ? '-' : r.cls.toFixed(3), 7) + pad(fmtMs(r.tbt), 8) +
      (r.below.length ? r.below.join(', ') : '-'),
  );
}
const notable = rows.filter((r) => r.failed.length);
if (notable.length) {
  console.log('\nAudits scoring < 0.9:');
  for (const r of notable) console.log(`  ${r.route} (${r.preset}): ${r.failed.join(', ')}`);
}
writeFileSync(resolve(outDir, 'summary.json'), JSON.stringify({ date: new Date().toISOString(), thresholds: MIN, rows }, null, 2));
console.log(`\nReports: reports/lighthouse/*.html, summary.json`);
if (assert && failures) {
  console.error(`lighthouse: FAIL ${failures} run(s) below thresholds (perf >= 90, a11y/bp/seo >= 95)`);
  process.exit(1);
}
