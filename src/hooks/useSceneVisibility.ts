import { useEffect, useState, type RefObject } from 'react';

export interface SceneVisibility {
  /** Within `margin` of the viewport: worth mounting the canvas. */
  near: boolean;
  /** Actually intersecting the viewport and the tab is visible: worth rendering frames. */
  active: boolean;
}

/**
 * Tracks whether a scene's container is near/inside the viewport and whether the tab is visible.
 * Falls back to "near and active" when IntersectionObserver is unavailable.
 */
export function useSceneVisibility(ref: RefObject<Element | null>, margin = '300px'): SceneVisibility {
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(() => (typeof document === 'undefined' ? true : !document.hidden));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      setInView(true);
      return;
    }
    const nearObs = new IntersectionObserver((e) => setNear(e.some((x) => x.isIntersecting)), { rootMargin: margin });
    const viewObs = new IntersectionObserver((e) => setInView(e.some((x) => x.isIntersecting)), { threshold: 0.05 });
    nearObs.observe(el);
    viewObs.observe(el);
    return () => {
      nearObs.disconnect();
      viewObs.disconnect();
    };
  }, [ref, margin]);

  useEffect(() => {
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return { near, active: inView && tabVisible };
}
