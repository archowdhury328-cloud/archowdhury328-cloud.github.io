import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ViewMode = '3d' | 'simple';

interface Prefs {
  /** OS-level "reduce motion". */
  reducedMotion: boolean;
  /** User pressed the persistent pause control. */
  paused: boolean;
  /** Automatic animation allowed (not reduced-motion, not paused). */
  animate: boolean;
  viewMode: ViewMode;
  togglePaused: () => void;
  setViewMode: (m: ViewMode) => void;
}

const Ctx = createContext<Prefs | null>(null);
const KEY_PAUSE = 'ru.paused';
const KEY_VIEW = 'ru.view';

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null; // storage can be blocked; the site must work without it
  }
}
function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const [paused, setPaused] = useState(() => read(KEY_PAUSE) === '1');
  const [viewMode, setViewModeState] = useState<ViewMode>(() => (read(KEY_VIEW) === 'simple' ? 'simple' : '3d'));

  const togglePaused = useCallback(() => {
    setPaused((p) => {
      write(KEY_PAUSE, p ? '0' : '1');
      return !p;
    });
  }, []);
  const setViewMode = useCallback((m: ViewMode) => {
    write(KEY_VIEW, m);
    setViewModeState(m);
  }, []);

  const value = useMemo<Prefs>(
    () => ({ reducedMotion, paused, animate: !reducedMotion && !paused, viewMode, togglePaused, setViewMode }),
    [reducedMotion, paused, viewMode, togglePaused, setViewMode],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePreferences(): Prefs {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePreferences must be used inside <PreferencesProvider>');
  return v;
}
