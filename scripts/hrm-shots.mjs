// Screenshots of HRM Suite (my own HR, attendance and payroll SaaS, in development) for its case study.
//   node scripts/hrm-shots.mjs
// Sources, read only, in D:\workspace-personal\design-system:
//   - the web app (hrm/hrm_frontend), as a development build. Build it once, outside the source repo:
//       cd D:\workspace-personal\design-system\hrm\hrm_frontend
//       npx ng build --configuration development --output-path D:\workspace-personal\mhfrough.dev\.devcache\build\hrm-app
//     The development build carries the app's own in-browser mock API and its seeded demo company (fictional
//     people, PKR figures). The build is served from a virtual origin by context.route(), no local server:
//     every /api/v1 call answers 503, so the app's hybrid mode falls back to that mock (ADR 0005).
//     The session is seeded in localStorage as the demo admin (the shape AuthService stores after its mock
//     sign-in), so no password is typed anywhere.
//   - the design-system page (hrm-suite-complete-design-system.html), opened from disk.
// Hidden in every shot: the cookie banner, the chat bubble, the dev hints and the version badge.
// Output: public/images/hrm/*.webp (quality 80, each under ~200 KB) and public/images/hrm/hrm-mark.svg.
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import sharp from 'sharp';
import { CACHE, ROOT } from './_env.mjs';

const { chromium } = await import('playwright');
const OUT = resolve(ROOT, 'public/images/hrm');
mkdirSync(OUT, { recursive: true });
const SRC = 'D:/workspace-personal/design-system';
const DIST = resolve(CACHE, 'build/hrm-app/browser');
const DS_PAGE = 'file:///' + `${SRC}/hrm-suite-complete-design-system.html`;
const ORIGIN = 'https://hrm.shots.test';

if (!existsSync(join(DIST, 'index.html'))) {
  console.error(`No build in ${DIST}. Build hrm_frontend first (see the header of this file).`);
  process.exit(1);
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.mp4': 'video/mp4',
};

// Static file from the build, falling back to index.html for client routes.
function staticFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^[\\/]+/, '');
  const file = join(DIST, clean);
  if (clean && file.startsWith(DIST) && existsSync(file) && statSync(file).isFile()) {
    return { status: 200, contentType: TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream', body: readFileSync(file) };
  }
  if (extname(clean)) return { status: 404, contentType: 'text/plain', body: 'not found' };
  return { status: 200, contentType: TYPES['.html'], body: readFileSync(join(DIST, 'index.html')) };
}

// The demo admin, as seeded in hrm_frontend/src/app/core/data/seed-settings.ts (role-admin = every module,
// every action, company scope).
const MODULES = ['dashboard', 'employees', 'attendance', 'leave', 'payroll', 'benefits', 'loans', 'approvals', 'tax-compliance', 'ess', 'insurance', 'settings', 'accounts'];
const ALL = { view: true, create: true, approve: true, finalize: true, export: true, delete: true };
const SESSION = {
  user: { id: 'usr-1', name: 'Admin User', email: 'admin@hrmsuite.com', authType: 'password', roleId: 'role-admin', status: 'active', forcePasswordReset: false },
  role: { id: 'role-admin', name: 'System Administrator', category: 'Admin', description: 'Full access to every module.', scope: 'company', permissions: Object.fromEntries(MODULES.map((m) => [m, ALL])) },
  workspace: 'hrmsuite',
  remember: true,
  idleTimeoutMins: 0,
};

const CLEAN = [
  'app-cookie-consent, app-chat-widget, app-version, .version-badge, [class*="version-chip"], .alert-info, .alert:has(.bi-bug) { display: none !important; }',
  'html { scrollbar-width: none; } ::-webkit-scrollbar { display: none; }',
  '*, *::before, *::after { caret-color: transparent !important; }',
].join('\n');

const browser = await chromium.launch();

async function context({ theme = 'light', mobile = false, signedIn = true } = {}) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    isMobile: mobile,
    hasTouch: mobile,
    colorScheme: theme,
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    locale: 'en-PK',
    timezoneId: 'Asia/Karachi',
  });
  await ctx.route('**/*', async (route) => {
    const url = route.request().url();
    if (url.startsWith(ORIGIN)) {
      const path = new URL(url).pathname;
      if (path.startsWith('/api/')) return route.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"offline"}' });
      return route.fulfill(staticFile(path));
    }
    if (/firebase|googletagmanager|google-analytics|gstatic\.com\/firebasejs/.test(url)) return route.abort();
    return route.continue(); // Google Fonts (Manrope), Bootstrap Icons and the design-system page's CDN libraries
  });
  await ctx.addInitScript(
    ([t, s, signed]) => {
      try {
        const ds = JSON.parse(localStorage.getItem('hrm-ds') || '{}');
        ds.theme = t;
        localStorage.setItem('hrm-ds', JSON.stringify(ds));
        if (signed && !localStorage.getItem('hrm-session')) localStorage.setItem('hrm-session', JSON.stringify(s));
        Notification.requestPermission = () => Promise.resolve('denied');
      } catch {}
    },
    [theme, SESSION, signedIn],
  );
  return ctx;
}

async function open(ctx, path, wait = 1800) {
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log(`  pageerror: ${e.message.split('\n')[0]}`));
  await p.goto(path.startsWith('file:') ? path : ORIGIN + path, { waitUntil: 'networkidle', timeout: 90_000 });
  await settle(p, wait);
  return p;
}

async function settle(p, wait = 1800) {
  await p.addStyleTag({ content: CLEAN });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(wait);
  await maskBanks(p);
}

// The demo seed uses real Pakistani bank names for its fictional employees. None is shown: every one is replaced
// with "Sample Bank" in the rendered text before a shot.
async function maskBanks(p) {
  await p.evaluate(() => {
    const re = /\b(Meezan Bank|Bank Alfalah|Habib Bank(?: Limited)?|United Bank(?: Limited)?|MCB Bank|HBL|UBL|MCB|Allied Bank|Askari Bank|Faysal Bank|Bank Al Habib|Standard Chartered)\b/g;
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      if (re.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(re, 'Sample Bank');
      re.lastIndex = 0;
    }
  });
}

async function save(buf, name, width, quality = 80) {
  const file = resolve(OUT, `${name}.webp`);
  let info = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(file);
  // Keep every image under ~200 KB: step the quality down for text-heavy light screens.
  for (let q = quality - 6; info.size > 200 * 1024 && q >= 60; q -= 6) {
    info = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: q }).toFile(file);
  }
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

const goto = async (p, path, wait = 1800) => {
  await p.goto(ORIGIN + path, { waitUntil: 'networkidle', timeout: 90_000 });
  await settle(p, wait);
};

// ---------------------------------------------------------------------------------------------------------------
// The web app, light theme
// ---------------------------------------------------------------------------------------------------------------
{
  const ctx = await context({ theme: 'light' });
  const p = await open(ctx, '/dashboard', 2600);
  await save(await p.screenshot(), 'app-dashboard', 1600);

  await goto(p, '/payroll/runs');
  await save(await p.screenshot(), 'app-payruns', 1600);

  await goto(p, '/leave/calendar');
  await save(await p.screenshot(), 'app-leave-calendar', 1600);

  // The daily register on the last day the demo company imported punches.
  await goto(p, '/attendance/register');
  const latest = p.getByRole('button', { name: /Latest register/ });
  if (await latest.count()) {
    await latest.first().click();
    await settle(p, 1500);
  }
  await save(await p.screenshot(), 'app-register', 1600);

  // A payslip: the "paper" document, white in both themes.
  await goto(p, '/payroll/payslips');
  await p.locator('table button:has-text("View")').first().click();
  await settle(p, 1500);
  await save(await p.screenshot(), 'app-payslip', 1600);

  await goto(p, '/ess', 2200);
  await save(await p.screenshot(), 'app-ess', 1600);
  await ctx.close();
}

// ---------------------------------------------------------------------------------------------------------------
// The web app, dark theme
// ---------------------------------------------------------------------------------------------------------------
{
  const ctx = await context({ theme: 'dark' });
  const p = await open(ctx, '/dashboard', 2600);
  await save(await p.screenshot(), 'app-dashboard-dark', 1600);
  await ctx.close();
}

// ---------------------------------------------------------------------------------------------------------------
// The marketing website, signed out
// ---------------------------------------------------------------------------------------------------------------
{
  const ctx = await context({ theme: 'dark', signedIn: false });
  const p = await open(ctx, '/', 2600);
  await save(await p.screenshot(), 'site-hero', 1600);
  await ctx.close();
}
{
  // The landing page's phone preview of the Flutter app's check-in card.
  const ctx = await context({ theme: 'light', signedIn: false });
  const p = await open(ctx, '/', 2000);
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
  });
  const phone = p.locator('app-phone-mock .ph').first();
  if (await phone.count()) {
    await phone.scrollIntoViewIfNeeded();
    await p.waitForTimeout(1500);
    // Transparent around the device's rounded frame: clear every ancestor's background, keep the alpha.
    await phone.evaluate((el) => {
      for (let n = el.parentElement; n; n = n.parentElement) {
        n.style.setProperty('background', 'transparent', 'important');
        n.style.setProperty('box-shadow', 'none', 'important');
      }
    });
    await p.addStyleTag({ content: '*::before, *::after { background-image: none !important; }' });
    await p.waitForTimeout(300);
    await save(await phone.screenshot({ omitBackground: true }), 'phone-checkin', 640);
  } else console.log('  no phone mock on the landing page');
  await ctx.close();
}

// ---------------------------------------------------------------------------------------------------------------
// The design-system page
// ---------------------------------------------------------------------------------------------------------------
{
  const ctx = await context({ theme: 'light', signedIn: false });
  const p = await open(ctx, DS_PAGE, 4000); // the hero counters count up first
  await save(await p.screenshot(), 'ds-overview', 1600);
  for (const id of ['theming', 'buttons']) {
    const el = p.locator('#' + id);
    await el.scrollIntoViewIfNeeded();
    await p.waitForTimeout(1200);
    await save(await el.screenshot(), `ds-${id}`, 1600);
  }
  await ctx.close();
}

await browser.close();

// ---------------------------------------------------------------------------------------------------------------
// The HR mark, as generated by hrm/tools/brand.mjs (32 x 32 tile, brand red, Manrope outlines).
// ---------------------------------------------------------------------------------------------------------------
copyFileSync(`${SRC}/hrm/brand/svg/hrm-mark.svg`, resolve(OUT, 'hrm-mark.svg'));
console.log('hrm-mark.svg copied');
