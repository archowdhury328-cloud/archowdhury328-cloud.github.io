import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { lazy, useEffect, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { detectWebGL, initialQuality, resetWebGLCache } from '../hooks/useCapabilities';
import { PreferencesProvider } from '../hooks/useMotionPreference';
import { SceneBoundary } from '../scenes/SceneBoundary';
import { MAX_RETRIES, SceneShell, type SceneProps } from '../scenes/SceneShell';

const withPrefs = (ui: ReactNode) => <PreferencesProvider>{ui}</PreferencesProvider>;

function enableWebGL(enabled: boolean) {
  resetWebGLCache();
  HTMLCanvasElement.prototype.getContext = (() => (enabled ? ({ getExtension: () => null } as unknown as RenderingContext) : null)) as typeof HTMLCanvasElement.prototype.getContext;
}

class MockIO {
  static instances: MockIO[] = [];
  cb: IntersectionObserverCallback;
  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
    MockIO.instances.push(this);
  }
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = () => [];
  fire(isIntersecting: boolean) {
    this.cb([{ isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

describe('SceneShell', () => {
  beforeEach(() => {
    MockIO.instances = [];
    vi.stubGlobal('IntersectionObserver', MockIO);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    enableWebGL(false);
  });

  const Good = lazy(async () => ({ default: (p: SceneProps) => <div data-testid="scene" data-active={String(p.active)} /> }));

  it('keeps a poster (no canvas mounted) until the scene is near the viewport, then mounts and unmounts it', async () => {
    enableWebGL(true);
    render(withPrefs(<SceneShell kind="earth" Scene={Good} sceneProps={{}} />));
    expect(screen.queryByTestId('scene')).not.toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument(); // illustration poster, never an empty box
    const [near, view] = MockIO.instances;
    await act(async () => {
      near!.fire(true);
      view!.fire(true);
    });
    expect(await screen.findByTestId('scene')).toHaveAttribute('data-active', 'true');
    await act(async () => {
      view!.fire(false);
    });
    expect(screen.getByTestId('scene')).toHaveAttribute('data-active', 'false'); // paused when off-screen
    await act(async () => {
      near!.fire(false);
    });
    expect(screen.queryByTestId('scene')).not.toBeInTheDocument(); // disposed when far away
  });

  it('pauses rendering while the browser tab is hidden', async () => {
    enableWebGL(true);
    render(withPrefs(<SceneShell kind="earth" Scene={Good} sceneProps={{}} />));
    const [near, view] = MockIO.instances;
    await act(async () => {
      near!.fire(true);
      view!.fire(true);
    });
    await screen.findByTestId('scene');
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(screen.getByTestId('scene')).toHaveAttribute('data-active', 'false');
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
  });

  it('shows the unsupported-graphics fallback when WebGL is missing', () => {
    enableWebGL(false);
    render(withPrefs(<SceneShell kind="workstation" Scene={Good} sceneProps={{}} />));
    expect(screen.getByText(/Interactive 3D preview unavailable/)).toBeInTheDocument();
  });

  it('honours the simple-view preference', async () => {
    enableWebGL(true);
    window.localStorage.setItem('ru.view', 'simple');
    render(withPrefs(<SceneShell kind="system" Scene={Good} sceneProps={{}} />));
    expect(screen.getByText(/Simple view is on/)).toBeInTheDocument();
    expect(screen.queryByTestId('scene')).not.toBeInTheDocument();
  });

  it('retries a failing scene a limited number of times, then settles on a fallback with a retry button', async () => {
    enableWebGL(true);
    let attempts = 0;
    const Bad = lazy(async () => ({
      default: () => {
        attempts += 1;
        throw new Error('shader compile failed');
      },
    }));
    render(withPrefs(<SceneShell kind="earth" Scene={Bad} sceneProps={{}} />));
    await act(async () => {
      MockIO.instances[0]!.fire(true);
    });
    expect(await screen.findByText(/could not be started/)).toBeInTheDocument();
    expect(attempts).toBeGreaterThanOrEqual(MAX_RETRIES + 1); // React may re-run a throwing render itself
    const settled = attempts;
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(attempts).toBe(settled); // retries are bounded: no render loop
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('treats GL context loss as a failure and retries', async () => {
    enableWebGL(true);
    let mounts = 0;
    const Lossy = lazy(async () => ({
      default: function LossyScene({ onContextLost }: SceneProps) {
        useEffect(() => {
          mounts += 1;
          if (mounts === 1) onContextLost();
        }, [onContextLost]);
        return <div data-testid="scene" />;
      },
    }));
    render(withPrefs(<SceneShell kind="earth" Scene={Lossy} sceneProps={{}} />));
    await act(async () => {
      MockIO.instances[0]!.fire(true);
    });
    expect(await screen.findByTestId('scene')).toBeInTheDocument();
    expect(mounts).toBeGreaterThanOrEqual(2);
  });

  it('lets the user retry after giving up', async () => {
    enableWebGL(true);
    const user = userEvent.setup();
    const Bad = lazy(async () => ({
      default: () => {
        throw new Error('boom');
      },
    }));
    render(withPrefs(<SceneShell kind="earth" Scene={Bad} sceneProps={{}} />));
    await act(async () => {
      MockIO.instances[0]!.fire(true);
    });
    await user.click(await screen.findByRole('button', { name: 'Try again' }));
    expect(await screen.findByText(/could not be started/)).toBeInTheDocument();
  });
});

describe('SceneBoundary', () => {
  it('renders the fallback when a child throws and reports the error', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const onError = vi.fn();
    function Boom(): never {
      throw new Error('asset 404');
    }
    render(
      <SceneBoundary fallback={<p>fallback shown</p>} onError={onError}>
        <Boom />
      </SceneBoundary>,
    );
    expect(screen.getByText('fallback shown')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledOnce();
    vi.restoreAllMocks();
  });
});

describe('capabilities', () => {
  afterEach(() => enableWebGL(false));

  it('detects WebGL by feature, and caches the answer', () => {
    enableWebGL(true);
    expect(detectWebGL()).toBe(true);
    const spy = vi.spyOn(document, 'createElement');
    expect(detectWebGL()).toBe(true);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
    enableWebGL(false);
    expect(detectWebGL()).toBe(false);
  });

  it('treats a throwing context as unsupported', () => {
    resetWebGLCache();
    HTMLCanvasElement.prototype.getContext = (() => {
      throw new Error('denied');
    }) as typeof HTMLCanvasElement.prototype.getContext;
    expect(detectWebGL()).toBe(false);
  });

  it('chooses a lower pixel-ratio cap on coarse pointers', () => {
    expect(initialQuality().dpr[1]).toBe(2); // jsdom: no matchMedia
    const mm = vi.fn().mockImplementation((q: string) => ({ matches: q.includes('coarse'), addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    Object.defineProperty(window, 'matchMedia', { value: mm, configurable: true, writable: true });
    expect(initialQuality().dpr[1]).toBe(1.5);
    Reflect.deleteProperty(window, 'matchMedia');
  });
});
