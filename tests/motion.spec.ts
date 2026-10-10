import { expect, test } from '@playwright/test';
import { settle } from './routes';

test.use({ reducedMotion: 'reduce' });

test('prefers-reduced-motion: no running CSS animation or transition longer than 0.01s on /', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'checked once');
  await page.goto('/');
  await settle(page);
  // Scroll through so reveal observers fire, then sample what is still animating.
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(100);

  const long = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.playState === 'running' || a.playState === 'pending')
      .map((a) => {
        const t = a.effect?.getComputedTiming();
        const duration = typeof t?.duration === 'number' ? t.duration : 0;
        const iterations = t?.iterations ?? 1;
        const target = (a.effect as KeyframeEffect | null)?.target as Element | null;
        return {
          kind: a.constructor.name,
          name: (a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty ?? a.id,
          total: iterations === Infinity ? Infinity : duration * iterations,
          target: target ? `${target.tagName.toLowerCase()}.${[...target.classList].join('.')}` : '?',
        };
      })
      .filter((a) => a.total > 10)
      .map((a) => `${a.kind} ${a.name} on ${a.target} (${a.total}ms)`),
  );
  expect(long).toEqual([]);
});
