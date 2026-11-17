// Screenshots with the real GPU (Edge, D3D11) for visual review.
import { chromium } from '@playwright/test';
const url = process.env.URL ?? 'http://localhost:4173/';
const browser = await chromium.launch({ channel: 'msedge', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
for (const [name, w, h, mobile] of [['d', 1440, 900, false], ['m', 390, 844, true]]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 })).newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `shots/g-${name}-0hero.png` });
  for (const id of (process.env.SECTIONS ?? 'snapshot,about,research,solar-system,publications,code,connect').split(',')) {
    await page.locator('#' + id).evaluate((el) => el.scrollIntoView());
    await page.waitForTimeout(id === 'research' || id === 'solar-system' ? 3000 : 600);
    await page.screenshot({ path: `shots/g-${name}-${id}.png` });
  }
  console.log(name, 'errors', JSON.stringify(errs), 'overflow', await page.evaluate(() => document.documentElement.scrollWidth - innerWidth));
}
await browser.close();
