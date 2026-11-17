import { chromium } from '@playwright/test';
const url = process.env.URL ?? 'https://archowdhury328-cloud.github.io/';
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const logs = [];
page.on('console', (m) => logs.push(m.type() + ': ' + m.text().slice(0, 160)));
page.on('pageerror', (e) => logs.push('pageerror: ' + e.message));
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(3000);
const info = await page.evaluate(() => {
  const c = document.createElement('canvas'); const gl = c.getContext('webgl2');
  const dbg = gl && gl.getExtension('WEBGL_debug_renderer_info');
  return { renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : String(!!gl),
    scenes: [...document.querySelectorAll('[data-scene]')].map((e) => e.dataset.scene + ':' + e.dataset.mounted + ':canvas=' + !!e.querySelector('canvas')) };
});
console.log(JSON.stringify(info));
await page.screenshot({ path: 'shots/live-edge-hero.png' });
for (const id of ['research', 'solar-system']) { await page.locator('#' + id).evaluate((el) => el.scrollIntoView()); await page.waitForTimeout(2500); await page.screenshot({ path: `shots/live-edge-${id}.png` }); }
console.log(logs.join('\n'));
await browser.close();
