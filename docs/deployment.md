# Deployment

Static site; no server process. `npm run build` = `tsc -b` + `vite build` + `scripts/prerender.mjs` (injects a server-rendered summary
of name, affiliation and the publication list into `dist/index.html`, visually hidden once the app mounts).

## Base path
`BASE_PATH` (default `/`) sets Vite's `base`; `SITE_URL` sets canonical / Open Graph URLs. `.github/workflows/deploy.yml` reads both from
`actions/configure-pages`, so the same workflow works for a user site (`archowdhury328-cloud.github.io`, base `/`) and a project site
(`/<repo>/`). `robots.txt` and `sitemap.xml` in `public/` name the user-site URL; edit them if you deploy elsewhere.

## One-time GitHub setup
1. Create the repository `archowdhury328-cloud/archowdhury328-cloud.github.io` (preferred) or `research-portfolio`.
2. Push `main`.
3. Settings -> Pages -> Build and deployment -> Source: **GitHub Actions**.
4. The `Deploy to GitHub Pages` workflow builds from the lockfile, runs lint, type-check and tests, uploads a Pages artifact and deploys.
   Generated output is never committed.

Workflow permissions are minimal (`contents: read`, `pages: write`, `id-token: write`); deployments are serialised by a `pages` concurrency
group. Action versions were checked against their latest releases when written (checkout v7, setup-node v7, configure-pages v6,
upload-pages-artifact v5, deploy-pages v5).

## Authentication and identity
Use an authenticated `gh` session or credential manager for the **owner account**. Never place tokens in `VITE_*` variables, `.env` files,
remote URLs or logs. Commits are authored and committed as `Md Asikur Rahman Chy` with the account's verified or `noreply` address (set at
repository scope); no AI/bot co-author trailers. A README name cannot control GitHub's Contributors graph; that follows commit identity.

## Local commands
```
npm ci                    # install from the lockfile
npm run dev               # development server
npm run lint && npm run typecheck
npm test                  # unit + component tests
npm run test:cov          # with coverage (thresholds enforced)
npm run build             # production build + prerender
npm run preview           # serve dist on :4173
npx playwright install chromium firefox webkit
npm run e2e               # browser tests against the production build
```
