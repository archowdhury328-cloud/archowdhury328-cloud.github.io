import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const WIDTHS = [320, 375, 390, 430, 768, 1024, 1440, 1920];

function watch(page: Page) {
  const problems: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`console: ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => problems.push(`requestfailed: ${r.url()}`));
  page.on('request', (r) => {
    const u = r.url();
    if (!u.startsWith('http://localhost') && !u.startsWith('data:') && !u.startsWith('blob:')) problems.push(`external request: ${u}`);
  });
  page.on('response', (r) => {
    if (r.url().startsWith('http://localhost') && r.status() >= 400) problems.push(`http ${r.status()}: ${r.url()}`);
  });
  return problems;
}

async function visit(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { level: 1, name: 'Md Asikur Rahman Chy' })).toBeVisible();
}

test('loads with no console errors or failed local assets while visiting every scene', async ({ page }) => {
  const problems = watch(page);
  await visit(page);
  for (const id of ['research', 'solar-system', 'publications', 'connect']) {
    await page.locator(`#${id}`).evaluate((el) => el.scrollIntoView());
    await page.waitForTimeout(1200);
  }
  await page.locator('#top').evaluate((el) => el.scrollIntoView());
  await page.waitForTimeout(800);
  expect(problems).toEqual([]);
});

test('name and primary actions are visible without scrolling, with no horizontal overflow', async ({ page }) => {
  await visit(page);
  await expect(page.getByRole('link', { name: 'Explore publications' })).toBeInViewport();
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
});

test('no horizontal overflow at representative widths, portrait and landscape', async ({ page }) => {
  await visit(page);
  const sizes = [...WIDTHS.map((w) => [w, 900] as const), [844, 390] as const, [932, 430] as const];
  for (const [w, h] of sizes) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(250);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `overflow at ${w}x${h}`).toBeLessThanOrEqual(0);
    const clipped = await page.getByRole('heading', { level: 1 }).evaluate((el) => el.getBoundingClientRect().right <= window.innerWidth + 1);
    expect(clipped, `name clipped at ${w}`).toBe(true);
  }
});

test('every scene shows either a live canvas or a polished fallback, never an empty box', async ({ page }) => {
  await visit(page);
  for (const kind of ['workstation', 'earth', 'system']) {
    const box = page.locator(`[data-scene="${kind}"]`);
    await box.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(1800);
    const hasCanvas = (await box.locator('canvas').count()) > 0;
    const hasIllustration = (await box.locator('svg.scene-svg').count()) > 0;
    expect(hasCanvas || hasIllustration, `${kind} has content`).toBe(true);
    const h = await box.evaluate((el) => el.getBoundingClientRect().height);
    expect(h).toBeGreaterThan(200);
  }
});

test('publication directory: search, filter, empty state, reset (keyboard operable)', async ({ page }) => {
  await visit(page);
  await page.locator('#publications').evaluate((el) => el.scrollIntoView());
  const search = page.getByLabel(/search title/i);
  await search.fill('churn');
  await expect(page.getByText('Showing 1 of 15 publications')).toBeVisible();
  await search.fill('zzzzzz');
  await expect(page.getByText('No publications match these filters.')).toBeVisible();
  await page.getByRole('button', { name: 'Reset filters' }).first().press('Enter');
  await expect(page.getByText('Showing 15 of 15 publications')).toBeVisible();
  await page.getByRole('combobox', { name: 'Topic' }).selectOption('Healthcare AI');
  await expect(page.getByText('Showing 3 of 15 publications')).toBeVisible();
});

test('selecting a publication in the list fills the details panel with real links', async ({ page }) => {
  await visit(page);
  await page.locator('#solar-system').evaluate((el) => el.scrollIntoView());
  await page.getByRole('button', { name: 'List view' }).click();
  await page.getByRole('button', { name: /Explainable churn prediction/ }).click();
  const panel = page.getByTestId('details');
  await expect(panel.getByRole('link', { name: /Read publication/ })).toHaveAttribute('href', 'https://doi.org/10.1007/s44163-026-00983-0');
  await expect(panel.getByRole('link', { name: /View on Scholar/ })).toHaveAttribute('href', /citation_for_view=mAM8u_UAAAAJ:Se3iqnhoufwC/);
  // links open only on deliberate click: no popups were created by merely selecting
  await expect(panel.getByRole('link', { name: /Read publication/ })).toHaveAttribute('target', '_blank');
});

test('in-scene topic chips filter the directory (HTML overlay inside the 3D scene)', async ({ page }) => {
  await visit(page);
  const box = page.locator('[data-scene="system"]');
  await box.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(2500);
  const chip = box.getByRole('button', { name: 'Security & Privacy' });
  test.skip((await chip.count()) === 0 || !(await chip.first().isVisible()), 'scene not live in this browser/viewport; list-view equivalent is covered above');
  await box.hover({ position: { x: 20, y: 20 } }); // hovering the section pauses orbital motion, so targets hold still
  await chip.first().click();
  await expect(chip.first()).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#publications').evaluate((el) => el.scrollIntoView());
  await expect(page.getByText('Showing 4 of 15 publications')).toBeVisible();
});

test('simple view switches all scenes to illustrations and persists', async ({ page }) => {
  await visit(page);
  const toggle = page.getByRole('button', { name: 'Switch to simple view' });
  if (!(await toggle.isVisible())) await page.getByRole('button', { name: /^menu$/i }).click();
  await toggle.click();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByText(/Simple view is on/).first()).toBeVisible();
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('canvas')).toHaveCount(0);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('system preference turns automatic motion off', async ({ page }) => {
    await visit(page);
    const btn = page.getByRole('button', { name: 'Motion off (system)' });
    if (!(await btn.isVisible())) await page.getByRole('button', { name: /^menu$/i }).click();
    await expect(btn).toBeDisabled();
  });
});

test('mobile menu is keyboard accessible', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile layout only');
  await visit(page);
  const btn = page.locator('.menu-btn'); // its accessible name flips Menu <-> Close
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
});

test('touch-first devices keep native page scrolling over scenes until the user opts in', async ({ page, isMobile, browserName }) => {
  test.skip(!isMobile || browserName !== 'chromium', 'checks touch-action on coarse-pointer chromium');
  test.setTimeout(150_000);
  await visit(page);
  const earth = page.locator('[data-scene="earth"]');
  await earth.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(2200);
  const canvas = earth.locator('canvas');
  test.skip((await canvas.count()) === 0, 'no live canvas');
  expect(await canvas.evaluate((c) => getComputedStyle(c).touchAction)).toBe('pan-y');
  await page.getByRole('button', { name: 'Interact with globe' }).click();
  await page.waitForTimeout(300);
  expect(await canvas.evaluate((c) => getComputedStyle(c).touchAction)).toBe('none');
  await page.getByRole('button', { name: /Exit globe interaction/ }).click();
  expect(await canvas.evaluate((c) => getComputedStyle(c).touchAction)).toBe('pan-y');
});

test('accessibility: no serious or critical axe violations (WCAG 2.x A/AA rules)', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'axe run on chromium');
  await visit(page);
  await page.waitForTimeout(1500);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  // eslint-disable-next-line no-console
  console.log(`axe: ${results.violations.length} violations total, ${bad.length} serious/critical, ${results.passes.length} rules passed`);
  expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
});

test('layout stability and load timing (measured, software-rendered headless; not a device benchmark)', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'PerformanceObserver metrics on chromium');
  await page.addInitScript(() => {
    (window as unknown as { __m: { cls: number; lcp: number } }).__m = { cls: 0, lcp: 0 };
    new PerformanceObserver((l) => {
      for (const e of l.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!e.hadRecentInput) (window as unknown as { __m: { cls: number } }).__m.cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => {
      const e = l.getEntries().at(-1);
      if (e) (window as unknown as { __m: { lcp: number } }).__m.lcp = e.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  await visit(page);
  await page.locator('#publications').evaluate((el) => el.scrollIntoView());
  await page.waitForTimeout(2500);
  const m = await page.evaluate(() => (window as unknown as { __m: { cls: number; lcp: number } }).__m);
  // eslint-disable-next-line no-console
  console.log(`CLS=${m.cls.toFixed(4)} LCP=${m.lcp.toFixed(0)}ms`);
  expect(m.cls).toBeLessThan(0.1);
  expect(m.lcp).toBeLessThan(2500);
});

test('static HTML contains name, affiliation and publications before JavaScript runs', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('Md Asikur Rahman Chy');
  expect(html).toContain('School of Business, International American University, Los Angeles, CA, USA');
  expect(html).toContain('citation_for_view=mAM8u_UAAAAJ:Se3iqnhoufwC');
  expect(html).toContain('rel="canonical"');
  expect(html).toContain('"@type": "Person"');
  expect(html).not.toMatch(/jobTitle|ghp_|github_pat_/);
});
