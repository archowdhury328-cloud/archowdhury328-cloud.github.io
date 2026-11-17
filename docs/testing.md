# Testing

All numbers below were measured on the author's Windows 11 machine on 2026-11-17 against the production build (`npm run build`, served
with `vite preview` on localhost). They are not device benchmarks.

## Unit and component (Vitest + Testing Library, jsdom)
57 tests, all passing. Coverage (v8, thresholds enforced in `vite.config.ts`): statements 93.99 %, branches 87.89 %, functions 91.56 %,
lines 96.8 %. Scope: `src/lib`, `src/data`, `src/hooks`, `src/components`, and the non-rendering scene infrastructure
(`SceneShell`, `SceneBoundary`, `SceneFallback`). **Documented exclusions:** the three R3F scene files and `SceneCanvas`
(Three.js rendering internals, covered by the browser tests), generated JSON, `main.tsx`.

Covered: 15 unique records and exact Scholar URLs; five topics; featured four; search / year / topic / sort / reset / empty state;
selection shared between list and details panel and kept when switching views; topic filter from the Earth section; keyboard menu
(Escape returns focus); persisted pause / simple-view preferences and blocked storage; reduced-motion; missing author data;
citation and BibTeX export rules; base-path-safe asset URLs; external-link allow-list and `rel`/`target`; WebGL-missing, simple-view,
bounded-retry and context-loss fallbacks; near/far mount-unmount and tab-hidden pausing.

## Browser (Playwright, production build)
Projects: Chromium desktop (1440x900), Chromium mobile (Pixel 7), Firefox desktop, WebKit desktop, WebKit mobile (iPhone 14), all
emulated viewports. Chromium uses SwiftShader software WebGL so the real 3D scenes render; Firefox and WebKit headless builds exercise
whichever of canvas or fallback the engine provides.

Final serial run: **55 / 55 non-skipped tests passed** (15 skipped by design: mobile-only or Chromium-only checks on other projects;
the in-scene chip test skips where no live canvas exists). Two Chromium-desktop timeouts in that run were contention at the old
60 s limit and passed on rerun (limit is now 120 s). Checks: no console errors, failed requests or non-localhost requests while
visiting every scene; no horizontal overflow at 320, 375, 390, 430, 768, 1024, 1440, 1920 wide and in landscape (844x390, 932x430);
name and primary actions in the first viewport; scenes always show a canvas or a fallback; directory search/filter/reset; details
panel links; in-scene HTML chips filter the directory; simple view persists; reduced motion; mobile menu; canvas `touch-action`
is `pan-y` until "Interact with globe" is pressed; static HTML contains name, affiliation, publications, canonical and Person JSON-LD.

## Accessibility
axe-core (WCAG 2.0/2.1/2.2 A and AA tags), Chromium: **0 violations** on desktop (33 rules passed) and mobile (32 passed).
This is automated testing only; no screen-reader or physical-device audit was performed.

## Performance (headless Chromium, software GL, localhost, no throttling)
CLS 0.0000; LCP about 0.50 s (0.496 and 0.520 s in two runs). Initial payload: HTML + `index` JS 50.4 kB (about 15 kB gzip) + CSS 26.1 kB
(about 11 kB gzip) + latin variable fonts. The 3D code loads lazily only when a scene nears the viewport: shared Three/R3F/Drei chunk
1,162 kB (about 318 kB gzip) plus 4-47 kB per scene. **Budgets:** initial JS <= 25 kB gzip, initial CSS <= 15 kB gzip, 3D chunk <= 400 kB gzip,
CLS < 0.1, LCP <= 2.5 s. Frame rates (60 fps desktop / 30 fps mobile targets) were **not** measured: software rendering is not representative.

## Security review
`npm audit`: 0 vulnerabilities (runtime and dev). No tokens or secrets in the tree (pattern scan). No `dangerouslySetInnerHTML`; all external
links are allow-listed https hosts with `rel="noopener noreferrer"`. No runtime third-party requests (asserted in e2e). No personal contact data.

## Not done
Physical-device testing, screen-reader testing, real-GPU frame-rate profiling, and verification against Google Scholar pages (see content-sources.md).
