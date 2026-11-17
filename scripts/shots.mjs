import { chromium } from '@playwright/test';
const url = process.env.URL ?? 'http://localhost:4173/';
const sizes = [['desktop', 1440, 900], ['mobile', 390, 844]];
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const [name, w, h] of sizes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: name === 'mobile', isMobile: name === 'mobile' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push('pageerror ' + e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `shots/${name}-hero.png` });
  for (const id of ['research', 'solar-system', 'publications']) {
    await page.locator('#' + id).scrollIntoViewIfNeeded();
    await page.locator('#' + id).evaluate((el) => el.scrollIntoView());
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `shots/${name}-${id}.png` });
  }
  console.log(name, 'errors:', JSON.stringify(errs), 'overflowX:', await page.evaluate(() => document.documentElement.scrollWidth > innerWidth));
  await ctx.close();
}
await browser.close();
