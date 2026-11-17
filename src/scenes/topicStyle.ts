import type { Topic } from '../data/types';

export type ShapeName = 'sphere' | 'cube' | 'octahedron' | 'cone' | 'torus';

/** Each topic gets a distinct shape AND colour, so meaning never depends on colour alone. */
export const TOPIC_STYLE: Record<Topic, { color: string; shape: ShapeName; glyph: string }> = {
  'Healthcare AI': { color: '#69D9E8', shape: 'sphere', glyph: '●' },
  'Business Analytics': { color: '#9B7BFF', shape: 'cube', glyph: '■' },
  'Security & Privacy': { color: '#F4A261', shape: 'octahedron', glyph: '◆' },
  'Economics & Society': { color: '#E76F9A', shape: 'cone', glyph: '▲' },
  'Industry & Supply Chains': { color: '#8BD17C', shape: 'torus', glyph: '◯' },
};
