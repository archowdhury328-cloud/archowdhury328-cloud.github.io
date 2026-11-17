import { useCallback, useEffect, useRef, useState } from 'react';
import { profile } from '../data/profile';
import { usePreferences } from '../hooks/useMotionPreference';

export const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Research', href: '#research' },
  { label: 'Publications', href: '#publications' },
  { label: 'Connect', href: '#connect' },
] as const;

export function PreferenceControls() {
  const { paused, reducedMotion, viewMode, togglePaused, setViewMode } = usePreferences();
  return (
    <div className="prefs" role="group" aria-label="Display preferences">
      <button
        type="button"
        className="pref-btn"
        aria-pressed={paused || reducedMotion}
        disabled={reducedMotion}
        onClick={togglePaused}
        title={reducedMotion ? 'Your system requests reduced motion, so animation is already off.' : undefined}
      >
        {reducedMotion ? 'Motion off (system)' : paused ? 'Resume animation' : 'Pause animation'}
      </button>
      <button type="button" className="pref-btn" aria-pressed={viewMode === 'simple'} onClick={() => setViewMode(viewMode === 'simple' ? '3d' : 'simple')}>
        {viewMode === 'simple' ? 'Switch to 3D view' : 'Switch to simple view'}
      </button>
    </div>
  );
}

export function Navigation() {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) btn.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(true);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <header className="site-header">
      <div className="nav-inner">
        <a className="brand" href="#top">
          <span className="brand-mark" aria-hidden="true">{profile.monogram}</span>
          <span className="brand-name">{profile.name}</span>
        </a>
        <button
          ref={btn}
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="menu-icon" aria-hidden="true" />
          <span>{open ? 'Close' : 'Menu'}</span>
        </button>
        <nav id="site-menu" className={`site-nav${open ? ' open' : ''}`} aria-label="Primary">
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => close(false)}>{l.label}</a>
              </li>
            ))}
          </ul>
          <PreferenceControls />
        </nav>
      </div>
    </header>
  );
}
