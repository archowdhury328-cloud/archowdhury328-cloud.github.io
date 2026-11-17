import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { Vector3, type PerspectiveCamera } from 'three';

interface ControlsLike {
  target: Vector3;
  update: () => void;
  saveState: () => void;
}
import { initialQuality } from '../hooks/useCapabilities';

interface Props {
  active: boolean;
  /** Scene needs continuous frames (otherwise it renders on demand only). */
  animating: boolean;
  onContextLost: () => void;
  /** CSS touch-action for the canvas: "pan-y" keeps native page scrolling. */
  touchAction: 'pan-y' | 'none';
  camera?: { position: [number, number, number]; fov: number };
  /** Soft glow on bright/emissive parts. Disabled automatically on low-power devices. */
  bloom?: { intensity: number; threshold: number };
  children: ReactNode;
}

/** Produces frames only while something is animating; everything else renders on demand. */
function Ticker({ animating }: { animating: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useFrame(() => {
    if (animating) invalidate();
  });
  useEffect(() => {
    invalidate();
  }, [animating, invalidate]);
  return null;
}

/** Detects GL context loss (but not our own teardown: the listener is removed before the canvas is disposed). */
function ContextWatcher({ onLost }: { onLost: () => void }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const el = gl.domElement;
    el.setAttribute('aria-hidden', 'true'); // every canvas interaction has an HTML equivalent
    const handler = (e: Event) => {
      e.preventDefault();
      onLost();
    };
    el.addEventListener('webglcontextlost', handler, { once: true });
    return () => el.removeEventListener('webglcontextlost', handler);
  }, [gl, onLost]);
  return null;
}

/**
 * Applies touch-action to the canvas element itself. OrbitControls sets `touch-action: none` on connect, which would block
 * native page scrolling over every scene, so the intended value is re-asserted after it and on each rendered frame.
 */
function TouchAction({ value }: { value: 'pan-y' | 'none' }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.domElement.style.touchAction = value;
  }, [gl, value]);
  useFrame(() => {
    if (gl.domElement.style.touchAction !== value) gl.domElement.style.touchAction = value;
  });
  return null;
}

/** Keeps `width` x `height` world units visible for any canvas aspect ratio. */
export function FitCamera({ target, dir, width, height }: { target: [number, number, number]; dir: [number, number, number]; width: number; height: number }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const controls = useThree((s) => s.controls) as unknown as ControlsLike | null;
  const invalidate = useThree((s) => s.invalidate);
  useLayoutEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const tanHalf = Math.tan((camera.fov * Math.PI) / 360);
    const dist = Math.max(height / 2 / tanHalf, width / 2 / (tanHalf * aspect));
    const d = new Vector3(...dir).normalize().multiplyScalar(dist);
    camera.position.set(target[0] + d.x, target[1] + d.y, target[2] + d.z);
    camera.lookAt(...target);
    camera.updateProjectionMatrix();
    if (controls) {
      controls.target.set(...target);
      controls.update();
      controls.saveState();
    }
    invalidate();
  }, [camera, size.width, size.height, controls, invalidate, target, dir, width, height]);
  return null;
}

export function SceneCanvas({ active, animating, onContextLost, touchAction, camera, bloom, children }: Props) {
  const q = useMemo(() => initialQuality(), []);
  const [maxDpr, setMaxDpr] = useState(q.dpr[1]);
  return (
    <Canvas
      frameloop={active ? 'demand' : 'never'}
      dpr={[1, maxDpr]}
      camera={camera ?? { position: [0, 2, 8], fov: 35 }}
      gl={{ antialias: q.tier !== 'low', powerPreference: 'high-performance', alpha: false, toneMappingExposure: 1.1 }}
      style={{ touchAction }}
    >
      {/* Measured, not guessed: lower the pixel ratio if frames are slow, raise it again if they recover. */}
      <PerformanceMonitor
        onDecline={() => setMaxDpr((d) => Math.max(1, d - 0.25))}
        onIncline={() => setMaxDpr((d) => Math.min(q.dpr[1], d + 0.25))}
        flipflops={4}
      />
      <color attach="background" args={['#070910']} />
      <ContextWatcher onLost={onContextLost} />
      <Ticker animating={active && animating} />
      {children}
      {bloom && q.tier !== 'low' && (
        <EffectComposer multisampling={q.tier === 'high' ? 4 : 0}>
          <Bloom mipmapBlur intensity={bloom.intensity} luminanceThreshold={bloom.threshold} luminanceSmoothing={0.2} />
          <Vignette eskil={false} offset={0.25} darkness={0.55} />
        </EffectComposer>
      )}
      <TouchAction value={touchAction} />
    </Canvas>
  );
}
