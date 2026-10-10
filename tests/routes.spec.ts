import { expect, test } from '@playwright/test';
import { ORIGIN, PENDING_SEO, ROUTES, settle, trackErrors } from './routes';

for (const route of ROUTES) {
  test.describe(`route ${route}`, () => {
    test('responds 200, one h1, lang en, no console errors', async ({ page }) => {
      const errors = trackErrors(page);
      const res = await page.goto(route);
      expect(res?.status(), 'HTTP status').toBe(200);
      await settle(page);
      await expect(page.locator('h1'), 'exactly one <h1>').toHaveCount(1);
      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang', 'en');
      expect(await html.getAttribute('dir'), 'dir must be ltr or absent').not.toBe('rtl');
      expect(errors, 'console / page errors').toEqual([]);
    });

    test('canonical + JSON-LD in the prerendered HTML', async ({ request }) => {
      test.fixme(PENDING_SEO.has(route), `${route} is a stub: Seo.set() not called yet (tests/routes.ts PENDING_SEO)`);
      // Read the raw prerendered HTML: this is what crawlers see before any JavaScript runs.
      const res = await request.get(route);
      expect(res.status()).toBe(200);
      const html = await res.text();

      const canonical = html.match(/<link[^>]+rel="canonical"[^>]*>/)?.[0].match(/href="([^"]+)"/)?.[1];
      expect(canonical, 'canonical link').toBe(route === '/' ? `${ORIGIN}/` : `${ORIGIN}${route}`);

      const blocks = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
      expect(blocks.length, 'JSON-LD script').toBeGreaterThan(0);
      for (const b of blocks) {
        const data = JSON.parse(b);
        expect(data['@context']).toBe('https://schema.org');
      }
      expect(html, '<title>').toMatch(/<title>[^<]{10,}<\/title>/);
      expect(html, 'meta description').toMatch(/<meta name="description" content="[^"]{50,}"/);
    });

    test('no horizontal overflow at 375px', async ({ page }, info) => {
      test.skip(info.project.name !== 'mobile', 'checked once, on the mobile project');
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(route);
      await settle(page);
      const { scrollWidth, innerWidth, offenders } = await page.evaluate(() => {
        const w = window.innerWidth;
        const offenders = [...document.querySelectorAll('body *')]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.right > w + 1 && getComputedStyle(el).position !== 'fixed';
          })
          .slice(0, 5)
          .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`);
        return { scrollWidth: document.documentElement.scrollWidth, innerWidth: w, offenders };
      });
      expect(scrollWidth, `page wider than viewport; widest offenders: ${offenders.join(', ')}`).toBeLessThanOrEqual(innerWidth);
    });
  });
}

test('404 page is served for unknown URLs and is noindex', async ({ request }) => {
  test.fixme(PENDING_SEO.has('/404'), '/404 is a stub: Seo.set({ noindex: true }) not called yet');
  const res = await request.get('/404.html');
  expect(res.status()).toBe(200);
  expect(await res.text()).toMatch(/<meta name="robots" content="noindex/);
});

test('sitemap and robots', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
  const sm = await request.get('/sitemap.xml');
  expect(sm.status()).toBe(200);
  const xml = await sm.text();
  for (const r of ROUTES) {
    if (PENDING_SEO.has(r)) continue;
    expect(xml).toContain(`<loc>${r === '/' ? `${ORIGIN}/` : ORIGIN + r}</loc>`);
  }
  expect(xml).not.toContain('/404');
});
