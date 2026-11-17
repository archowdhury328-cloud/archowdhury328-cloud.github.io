# Asset and dependency licences

No third-party 3D models, images, video or textures are used. All geometry is procedural (Three.js primitives); the dashboard on the
monitor is drawn at runtime to a canvas; the fallback illustrations are original inline SVG; the social preview is generated locally
by `scripts/gen-social.mjs`.

| Asset | Origin | Licence | Notes |
|---|---|---|---|
| Earth land dots (`src/data/earthDots.json`) | Natural Earth 1:110m land polygons, via the `world-atlas` npm package, sampled on a lat/lon grid by `scripts/gen-earth.mjs` | Natural Earth: public domain. `world-atlas`: ISC | Geographically real coastlines (dots are a sampling of true land polygons), not hand-drawn blobs |
| Inter (variable) | `@fontsource-variable/inter`, self-hosted | SIL OFL 1.1 | Body text |
| Fraunces (variable) | `@fontsource-variable/fraunces`, self-hosted | SIL OFL 1.1 | Headings |
| JetBrains Mono 400 | `@fontsource/jetbrains-mono`, self-hosted | SIL OFL 1.1 | Dates / metadata |
| three, @react-three/fiber, @react-three/drei, react, react-dom | npm | MIT | |
| Monogram / favicon / OG image | Original (this repository) | Same as repository | The attached design reference was used only for mood (near-black, violet contours, dimensional workstation, restrained nav). Its identity, text, code and brand assets are not reproduced. |

No external requests are made at runtime: no CDN scripts, no analytics, no trackers, no hosted fonts, no HDR environment maps.
