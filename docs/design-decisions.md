# Design decisions

## Visual system
Near-black background, violet contour lines, strong white typography, one dimensional workstation, a restrained nav bar (the useful
qualities of the supplied reference), recomposed originally. Tokens live at the top of `src/styles/global.css`.
Self-hosted Inter (body), Fraunces (headings), JetBrains Mono (metadata). Fluid type via `clamp()`. Neon stays inside the 3D scenes and a
few accents. No custom cursor, scroll hijacking, intro animation, audio, flashing or exaggerated floating.

## Three scenes, one lifecycle
All scenes are real WebGL (Three.js through React Three Fiber, `Html` from Drei for in-scene labels):

* **Workstation** (hero): procedural desk, monitor with a canvas-drawn dashboard (topic names plus clearly captioned "illustrative" shapes,
  no measurements), instanced keyboard keys, mouse, compact computer, notebook, violet contour rings behind. Pointer drift (fine pointers, never
  reduced-motion) and constrained OrbitControls. In-scene shortcut chips are real links; the same links exist below the canvas.
* **Connected Earth**: real coastlines (Natural Earth sampling), Fresnel atmosphere, one factual affiliation marker at Williamsburg, KY (36.745, -84.159),
  five topic markers (distinct shapes) and a labelled Google Scholar satellite. Arcs are decorative and the page says so.
* **Publication solar system**: central "Research" object, five topic planets, 15 equal-sized publication satellites (each exactly once), stable
  deterministic layout. Selection opens a normal-flow HTML panel with "Read publication" (DOI) and "View on Scholar".

`SceneShell` owns the lifecycle so three animated canvases never run at once:

* poster (inline SVG matching the scene) until the box is near the viewport; the lazy 3D chunk loads then;
* canvas unmounted (GPU resources released) when far from the viewport; selection state lives outside the canvas so it survives;
* `frameloop="never"` when the scene is off-screen or the tab is hidden; `"demand"` otherwise, with explicit per-frame invalidation only while
  something is animating (paused scenes do no work);
* adaptive pixel ratio from measured frame time (`PerformanceMonitor`), initial cap 1.5 on coarse pointers and 2 otherwise;
* on any render error, lazy-chunk failure or GL context loss: up to 2 automatic retries, then a polished fallback with a "Try again" button;
* WebGL feature-detected (no browser sniffing); unsupported -> labelled illustration, never a black box or spinner.

React context does not cross the R3F reconciler, so scenes receive state through props. `Html` labels render into a stable overlay element
owned by the shell: rendering them into the canvas's own DOM threw `removeChild` errors when a scene unmounted on scroll.

## Input
Touch devices keep native scrolling: canvas `touch-action: pan-y` and OrbitControls disabled until the visitor presses "Interact with globe /
scene" (and there is an obvious exit). Taps are distinguished from drags (`event.delta` guard); hit areas for small nodes are enlarged. Orbital
motion pauses while a publication is selected and while the pointer or focus is inside a scene section. Reduced motion disables automatic orbit
and pointer drift; the persistent "Pause animation" and "3D / Simple view" preferences are stored in `localStorage` (wrapped in try/catch).

## Content integrity
No degrees, titles, employment, awards, grants, clients, collaborations, e-mail, phone or residence are stated. Williamsburg, KY is only ever shown
as the institution's location. No CV button, contact form or fabricated GitHub projects.
