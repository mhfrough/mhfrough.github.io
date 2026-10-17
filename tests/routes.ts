import type { ConsoleMessage, Page } from '@playwright/test';

export const ORIGIN = 'https://mhfrough.dev';

/** Every indexable route (English only). Keep in sync with src/app/app.routes.ts. */
export const ROUTES = [
  '/',
  '/work',
  '/work/quorum',
  '/work/befiler',
  '/about',
  '/work/bloomstone',
  '/work/emlaak',
  '/work/pizzerias',
  '/work/trades',
  '/work/kpmc',
  '/work/asaan-hisab',
  '/work/finclore',
  '/work/arittek',
  '/work/o2chat',
  '/work/dmax',
  '/work/epractise',
  '/work/llcsavvy',
  '/work/tmf',
  '/work/ethical-node',
  '/work/malik-transport',
  '/work/call-center',
  '/work/fleet',
  '/work/gift-wrap',
  '/work/hrm',
  '/work/whiteboard',
  '/work/flick',
  '/work/scrawl',
  '/hire',
  '/contact',
  '/brand',
  '/privacy',
  '/terms',
  '/cookies',
  '/accessibility',
  '/sitemap',
] as const;

export type Route = (typeof ROUTES)[number];

/**
 * Routes whose page does not call `Seo.set()` yet (stubs), so they ship without canonical / JSON-LD.
 * Their SEO assertions are marked `test.fixme` (not weakened). Page owners: remove your route from
 * this list as soon as your constructor calls `inject(Seo).set({...})`.
 */
export const PENDING_SEO: ReadonlySet<Route | '/404'> = new Set<Route | '/404'>([
  // e.g. '/brand', while a page is still a stub. Empty: every page calls Seo.set() as of 2026-10-10.
]);

/** Collects console errors and uncaught page errors for the lifetime of the page. */
export function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m: ConsoleMessage) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

/** Waits until the prerendered page has hydrated and web fonts are in. */
export async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}
