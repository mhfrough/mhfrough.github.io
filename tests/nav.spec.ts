import { expect, test } from '@playwright/test';
import { settle } from './routes';

test('skip link is the first tab stop and moves focus to main', async ({ page }) => {
  await page.goto('/hire');
  await settle(page);
  await page.keyboard.press('Tab');
  const skip = page.locator('a.skip-link');
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await expect(skip).toHaveAttribute('href', /#main$/);
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('menu opens, closes with Escape and returns focus', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'the menu button only exists below 760px');
  await page.goto('/');
  await settle(page);
  // Found by ARIA contract, not by id: the disclosure button names its panel via aria-controls.
  const toggle = page.locator('button[aria-controls][aria-expanded]').first();
  await expect(toggle).toBeVisible();
  const panel = page.locator(`#${await toggle.getAttribute('aria-controls')}`);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toBeHidden();

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('link').first()).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
});

test('mobile menu closes after navigating', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'the menu button only exists below 760px');
  await page.goto('/');
  await settle(page);
  const toggle = page.locator('button[aria-controls][aria-expanded]').first();
  const panel = page.locator(`#${await toggle.getAttribute('aria-controls')}`);
  await toggle.click();
  await panel.getByRole('link').first().click();
  await expect(panel).toBeHidden();
});

test('quorum case study sets data-theme and leaving it clears it', async ({ page }) => {
  await page.goto('/');
  await settle(page);
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);

  await page.goto('/work/quorum');
  await settle(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'quorum');

  // Leave through client-side navigation (the home link in the nav bar is visible at every width).
  await page.locator('header a[href="/"]').first().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
});
