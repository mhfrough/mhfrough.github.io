import { expect, test } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROUTES, settle } from './routes';

/**
 * The Content-Security-Policy in <dist>/_headers (hashes filled in by scripts/postbuild.mjs) is applied to
 * every HTML response here, so a policy that would break the live site on Cloudflare Pages fails in CI.
 */
const dist = resolve(__dirname, '..', process.env['E2E_DIST'] ?? 'dist/mhfrough/browser');
const headersFile = resolve(dist, '_headers');
const csp = existsSync(headersFile)
  ? readFileSync(headersFile, 'utf8').match(/Content-Security-Policy:\s*(.+)/)?.[1]?.trim()
  : undefined;

test.describe('CSP from _headers', () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== 'desktop', 'desktop only');
  });

  test('policy was finalised by postbuild', () => {
    expect(csp, `no CSP found in ${headersFile}`).toBeTruthy();
    expect(csp).not.toContain('__INLINE_SCRIPT_HASHES__');
    expect(csp).not.toContain("'unsafe-eval'");
  });

  for (const route of ROUTES) {
    test(`no CSP violations on ${route}`, async ({ page }) => {
      test.skip(!csp, 'no finalised _headers in this build');
      const violations: string[] = [];
      page.on('console', (m) => {
        if (/Content Security Policy|Refused to/i.test(m.text())) violations.push(m.text().slice(0, 200));
      });
      await page.route('**/*', async (r) => {
        if (r.request().resourceType() !== 'document') return r.continue();
        const res = await r.fetch();
        await r.fulfill({ response: res, headers: { ...res.headers(), 'content-security-policy': csp! } });
      });
      await page.goto(route);
      await settle(page);
      expect(violations).toEqual([]);
      // The hashed inline scripts ran (event-replay contract installs this global)...
      expect(await page.evaluate(() => typeof (window as any).__jsaction_bootstrap)).toBe('function');
      // ...the hashed onload handler ran (critical-CSS loader flips media from print to all)...
      const media = await page.locator('link[rel="stylesheet"][onload]').evaluateAll((ls) => ls.map((l) => (l as HTMLLinkElement).media));
      expect(media.every((m) => m === 'all')).toBe(true);
      // ...and the module bundle ran: hydration consumes the ngh annotation on the app root.
      await expect(page.locator('mh-root')).not.toHaveAttribute('ngh', /.*/);
    });
  }
});
