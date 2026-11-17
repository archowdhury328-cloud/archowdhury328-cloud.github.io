import { useEffect, useState } from 'react';

/** Feature-detects a usable WebGL context (no browser-name sniffing). Result is cached. */
let webglCache: boolean | null = null;
export function detectWebGL(): boolean {
  if (webglCache !== null) return webglCache;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') ?? c.getContext('webgl');
    webglCache = !!gl;
    const lose = (gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context');
    lose?.loseContext();
  } catch {
    webglCache = false;
  }
  return webglCache;
}
export const resetWebGLCache = (): void => {
  webglCache = null;
};

/** True on devices whose primary pointer is precise (mouse/trackpad). Touch-first devices get opt-in 3D dragging. */
export function useFinePointer(): boolean {
  const query = '(hover: hover) and (pointer: fine)';
  const [fine, setFine] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(query);
    const on = () => setFine(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return fine;
}

export type QualityTier = 'low' | 'medium' | 'high';

/** Initial quality from device hints only; scenes then adapt DPR from measured frame time. */
export function initialQuality(): { tier: QualityTier; dpr: [number, number] } {
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
  const coarse = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
  if (coarse) return { tier: cores <= 4 ? 'low' : 'medium', dpr: [1, 1.5] };
  return { tier: cores >= 8 ? 'high' : 'medium', dpr: [1, 2] };
}
