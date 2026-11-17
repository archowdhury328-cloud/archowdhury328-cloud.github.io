# Research Universe: Md Asikur Rahman Chy

Personal research portfolio of **Md Asikur Rahman Chy**, School of Business, International American University, Los Angeles, CA, USA.

* GitHub: <https://github.com/archowdhury328-cloud>
* Google Scholar: <https://scholar.google.com/citations?hl=en&user=mAM8u_UAAAAJ&view_op=list_works&sortby=pubdate>

A calm, dark, single-page site with three real WebGL scenes (research workstation, connected Earth, publication solar system) over a fully
usable HTML research portfolio. It works without 3D: every scene action has an HTML equivalent, and a "Simple view" switch, reduced-motion
support and a graphics-failure fallback are built in.

Stack: React 19, TypeScript (strict), Vite, Three.js, React Three Fiber, Drei, Vitest + Testing Library, Playwright. No analytics, no trackers,
no runtime third-party requests.

## Commands
```
npm ci
npm run dev
npm run lint && npm run typecheck
npm test                # unit + component tests
npm run test:cov        # coverage with enforced thresholds
npm run build           # production build + prerendered summary
npm run preview         # http://localhost:4173
npx playwright install chromium firefox webkit
npm run e2e
```

## Docs
[content sources](docs/content-sources.md) · [design decisions](docs/design-decisions.md) · [asset licences](docs/asset-licenses.md) ·
[testing](docs/testing.md) · [deployment](docs/deployment.md)

## Content policy
Publication data comes from the owner's Google Scholar list, supplemented by Crossref records where they match. Citation metrics are an
owner-supplied snapshot with an unknown collection date and are labelled that way. Nothing about degrees, titles, employment, awards,
collaborations or contact details is stated. Co-authors are credited wherever a complete, verified author list exists.

## Licence
Code: MIT (see [LICENSE](LICENSE)). The publications themselves belong to their authors and publishers; titles and links are
used for reference.
