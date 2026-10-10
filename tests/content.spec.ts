import { expect, test } from '@playwright/test';
import { ROUTES, settle } from './routes';

// Content rules from CLAUDE.md. Checked once per route on desktop (content does not change per viewport).
test.beforeEach(({}, info) => {
  test.skip(info.project.name !== 'desktop', 'content rules run on desktop only');
});

/** Employers are never named (owner's rule). "Nearby" is matched case-sensitively so the plain word "nearby" passes. */
const EMPLOYERS = [/arittek/i, /\bNearby\b/, /malik\s*tech/i];

for (const route of ROUTES) {
  test.describe(`content ${route}`, () => {
    test('no en or em dashes in visible text', async ({ page }) => {
      await page.goto(route);
      await settle(page);
      const hits = await page.evaluate(() => {
        const out: string[] = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const text = n.textContent ?? '';
          if (!/[–—]/.test(text)) continue;
          const el = n.parentElement;
          if (!el || el.closest('script, style, [aria-hidden="true"]')) continue;
          out.push(text.trim().slice(0, 80));
        }
        return out;
      });
      expect(hits, 'visible text containing an en dash or em dash').toEqual([]);
    });

    test('never names an employer', async ({ request }) => {
      const html = await (await request.get(route)).text();
      for (const re of EMPLOYERS) {
        const m = html.match(re);
        expect(m?.[0] ?? null, `employer name ${re} found near: ${m ? html.slice(Math.max(0, m.index! - 60), m.index! + 60) : ''}`).toBeNull();
      }
    });

    test('images: alt, width/height, WebP or SVG', async ({ page }) => {
      await page.goto(route);
      await settle(page);
      // Load everything @defer (on viewport) would add.
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 50));
        }
      });
      await page.waitForTimeout(300);
      const bad = await page.evaluate(() =>
        [...document.querySelectorAll('img')].flatMap((img) => {
          const src = img.getAttribute('src') ?? '';
          const issues: string[] = [];
          if (!img.hasAttribute('alt')) issues.push('no alt');
          if (!img.getAttribute('width') || !img.getAttribute('height')) issues.push('no width/height');
          const path = src.split(/[?#]/)[0];
          const exempt = /\/(og|icons)\//.test(path) || path.startsWith('data:image/svg');
          if (!exempt && !/\.(webp|svg|avif)$/i.test(path)) issues.push('not WebP/SVG');
          return issues.length ? [`${src || '(no src)'}: ${issues.join(', ')}`] : [];
        }),
      );
      expect(bad).toEqual([]);
    });
  });
}
