import { Suspense, useCallback, useRef, useState, type ComponentType, type LazyExoticComponent, type RefObject } from 'react';
import { detectWebGL, useFinePointer } from '../hooks/useCapabilities';
import { usePreferences } from '../hooks/useMotionPreference';
import { useSceneVisibility } from '../hooks/useSceneVisibility';
import { SceneBoundary } from './SceneBoundary';
import { SceneFallback, type SceneKind } from './SceneFallback';

export interface SceneProps {
  /** Frames should be produced (in viewport, tab visible). */
  active: boolean;
  /** Automatic motion allowed (not reduced-motion, not paused). */
  animate: boolean;
  fine: boolean;
  /** Scene must call this when the GL context is lost. */
  onContextLost: () => void;
  /** Stable DOM container (outside the canvas) that scene labels render into. */
  overlay: RefObject<HTMLElement>;
}

export const MAX_RETRIES = 2;

interface ShellProps<P extends object> {
  kind: SceneKind;
  Scene: LazyExoticComponent<ComponentType<P & SceneProps>>;
  /** Extra props forwarded into the scene. React context does not cross the R3F reconciler, so state goes in here. */
  sceneProps: P;
  className?: string;
}

/**
 * Reserves the scene's box (no layout shift), mounts the lazy 3D chunk only when the box is near the viewport,
 * unmounts it again when far away (disposing GPU resources) and falls back to an illustration on any failure.
 */
export function SceneShell<P extends object>({ kind, Scene, sceneProps, className = '' }: ShellProps<P>) {
  const ref = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const { near, active } = useSceneVisibility(ref);
  const { viewMode, animate } = usePreferences();
  const fine = useFinePointer();
  const [failures, setFailures] = useState(0);
  const supported = detectWebGL();

  const onFail = useCallback(() => setFailures((n) => n + 1), []);
  const retry = useCallback(() => setFailures(0), []);

  const preview = <SceneFallback kind={kind} reason="preview" />;
  let body;
  if (viewMode === 'simple') body = <SceneFallback kind={kind} reason="simple" />;
  else if (!supported) body = <SceneFallback kind={kind} reason="unsupported" />;
  else if (failures > MAX_RETRIES) body = <SceneFallback kind={kind} reason="failed" onRetry={retry} />;
  else if (!near) body = preview;
  else {
    const props = { ...sceneProps, active, animate, fine, onContextLost: onFail, overlay: overlay as RefObject<HTMLElement> } as P & SceneProps;
    body = (
      <SceneBoundary key={failures} fallback={preview} onError={onFail}>
        <Suspense fallback={preview}>
          <Scene {...props} />
        </Suspense>
      </SceneBoundary>
    );
  }

  return (
    <div ref={ref} className={`scene-box scene-${kind} ${className}`} data-scene={kind} data-mounted={near && viewMode === '3d' && supported && failures <= MAX_RETRIES}>
      {body}
      <div ref={overlay} className="scene-overlay" />
    </div>
  );
}
