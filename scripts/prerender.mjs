// Post-build step: renders <StaticSummary/> to HTML and injects it into dist/index.html (no server needed).
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error', configFile: 'vite.config.ts' });
try {
  const mod = await server.ssrLoadModule('/src/StaticSummary.tsx');
  const html = renderToStaticMarkup(createElement(mod.StaticSummary));
  const file = 'dist/index.html';
  const src = readFileSync(file, 'utf8');
  if (!src.includes('<!--app-html-->')) throw new Error('placeholder <!--app-html--> missing in dist/index.html');
  writeFileSync(file, src.replace('<!--app-html-->', html));
  console.log('prerendered', html.length, 'bytes into', file);
} finally {
  await server.close();
}
