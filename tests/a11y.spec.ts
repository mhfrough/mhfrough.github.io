import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { ROUTES, settle } from './routes';

// Reduced motion so scroll-reveal content is fully opaque when axe measures contrast.
test.use({ reducedMotion: 'reduce' });

for (const route of ROUTES) {
  test(`axe WCAG 2.1 A/AA: ${route}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'axe runs on desktop only');
    await page.goto(route);
    await settle(page);
    // Bring every lazily revealed / @defer (on viewport) block into the DOM before auditing.
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(400);

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    await info.attach('axe-results.json', { body: JSON.stringify(results, null, 2), contentType: 'application/json' });

    const blocking = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    const minor = results.violations.filter((v) => !blocking.includes(v));
    if (minor.length) {
      info.annotations.push({ type: 'axe minor', description: minor.map((v) => `${v.id} (${v.impact})`).join(', ') });
    }
    const summary = blocking.map(
      (v) => `${v.impact} ${v.id}: ${v.help}\n    ${v.nodes
        .slice(0, 3)
        .map((n) => `${n.target.join(' ')}: ${n.any[0]?.message ?? n.failureSummary ?? ''}`)
        .join('\n    ')}`,
    );
    expect(summary, 'serious/critical axe violations').toEqual([]);
  });
}
