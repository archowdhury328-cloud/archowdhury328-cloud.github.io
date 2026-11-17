// Builds src/data/earthDots.json: a regular lat/lon grid sampled against real land polygons.
// Source: Natural Earth 1:110m land (public domain) via the `world-atlas` package (ISC licence).
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';

const topo = JSON.parse(readFileSync('node_modules/world-atlas/land-110m.json', 'utf8'));
const land = feature(topo, topo.objects.land);
const polys = [];
const geoms = land.type === 'FeatureCollection' ? land.features.map((f) => f.geometry) : [land.geometry];
for (const g of geoms) {
  if (g.type === 'Polygon') polys.push(g.coordinates);
  else if (g.type === 'MultiPolygon') polys.push(...g.coordinates);
}

function inRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const inPoly = (x, y, rings) => inRing(x, y, rings[0]) && !rings.slice(1).some((h) => inRing(x, y, h));

const STEP = 1.7; // degrees; keeps ~4k points
const dots = [];
for (let lat = -58; lat <= 84; lat += STEP) {
  // widen longitude step toward the poles so dot density on the sphere stays even
  const lonStep = STEP / Math.max(Math.cos((lat * Math.PI) / 180), 0.25);
  for (let lon = -180; lon < 180; lon += lonStep) {
    if (polys.some((p) => inPoly(lon, lat, p))) dots.push([Math.round(lat * 10), Math.round(lon * 10)]);
  }
}
writeFileSync('src/data/earthDots.json', JSON.stringify(dots));
console.log('land dots:', dots.length);
