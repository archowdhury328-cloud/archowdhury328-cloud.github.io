import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Billboard, Html, OrbitControls, Stars, useCursor } from '@react-three/drei';
import { AdditiveBlending, BufferGeometry, CanvasTexture, Float32BufferAttribute, Group } from 'three';
import { publications } from '../data/publications';
import { TOPICS, type Topic } from '../data/types';
import { TOPIC_STYLE } from './topicStyle';
import { FitCamera, SceneCanvas } from './SceneCanvas';
import { TopicShape } from './TopicShape';
import type { SceneProps } from './SceneShell';

export interface SystemSceneProps {
  topic: Topic | 'all';
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onTopic: (t: Topic | 'all') => void;
  hold: boolean;
  interactive: boolean;
  resetKey?: number;
}

const TARGET: [number, number, number] = [0, 0, 0];
const DIR: [number, number, number] = [0, 0.78, 1];
const RING_GAP = 0.66;
const RING_BASE = 1.55;
const NODE_SIZE = 0.085; // identical for every publication: size encodes nothing
const SAT_RING = 0.5;
const CLICK_SLOP_PX = 6;

/** Deterministic layout: publication ids per topic in dataset order. */
const BY_TOPIC: Record<Topic, string[]> = Object.fromEntries(
  TOPICS.map((t) => [t, publications.filter((p) => p.topic === t).map((p) => p.id)]),
) as Record<Topic, string[]>;

const planetAngle = (i: number, t: number): number => (i / TOPICS.length) * Math.PI * 2 + t * (0.075 - i * 0.008);

function Ring({ radius }: { radius: number }) {
  const geom = useMemo(() => {
    const pts: number[] = [];
    for (let k = 0; k < 128; k++) {
      const a = (k / 128) * Math.PI * 2;
      pts.push(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pts, 3));
    return g;
  }, [radius]);
  useEffect(() => () => geom.dispose(), [geom]);
  return (
    <lineLoop geometry={geom}>
      <lineBasicMaterial color="#a48bff" transparent opacity={0.3} />
    </lineLoop>
  );
}

function glowTexture(inner: string, outer: string): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, inner);
    g.addColorStop(0.35, outer);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  }
  return new CanvasTexture(c);
}

function Core({ animate }: { animate: boolean }) {
  const glow = useMemo(() => glowTexture('rgba(210,195,255,0.9)', 'rgba(140,105,255,0.35)'), []);
  const core = useRef<Group>(null);
  useEffect(() => () => glow.dispose(), [glow]);
  useFrame((_, dt) => {
    if (animate && core.current) core.current.rotation.y += dt * 0.15;
  });
  return (
    <group>
      <group ref={core}>
        <mesh>
          <icosahedronGeometry args={[0.42, 2]} />
          <meshStandardMaterial color="#b9a6ff" emissive="#8f6dff" emissiveIntensity={2.2} roughness={0.3} flatShading toneMapped={false} />
        </mesh>
        <mesh scale={1.18}>
          <icosahedronGeometry args={[0.42, 1]} />
          <meshBasicMaterial color="#cbbcff" wireframe transparent opacity={0.35} toneMapped={false} />
        </mesh>
      </group>
      <Billboard>
        <mesh>
          <planeGeometry args={[2.8, 2.8]} />
          <meshBasicMaterial map={glow} transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
        </mesh>
      </Billboard>
      <pointLight intensity={26} distance={14} color="#b49cff" />
    </group>
  );
}

function tapGuard(fn: () => void) {
  return (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > CLICK_SLOP_PX) return;
    e.stopPropagation();
    fn();
  };
}

type Props = SystemSceneProps & Pick<SceneProps, 'animate' | 'fine' | 'overlay'>;

function Scene({ topic, selectedId, onSelect, onTopic, hold, interactive, animate, fine, resetKey = 0, overlay }: Props) {
  const invalidate = useThree((s) => s.invalidate);
  const planets = useRef<(Group | null)[]>([]);
  const sats = useRef<Record<string, Group | null>>({});
  const controls = useRef<{ reset: () => void } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);
  useCursor(hover);
  const t = useRef(0);
  const running = animate && !hold && !dragging && selectedId === null;

  const layout = () => {
    TOPICS.forEach((tp, i) => {
      const g = planets.current[i];
      if (!g) return;
      const r = RING_BASE + i * RING_GAP;
      const a = planetAngle(i, t.current);
      g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      const ids = BY_TOPIC[tp];
      ids.forEach((id, j) => {
        const s = sats.current[id];
        if (!s) return;
        const b = (j / ids.length) * Math.PI * 2 + t.current * 0.5;
        s.position.set(Math.cos(b) * SAT_RING, Math.sin(b * 0.7) * 0.08, Math.sin(b) * SAT_RING);
      });
    });
  };
  useLayoutEffect(layout);
  useFrame((_, dt) => {
    if (!running) return;
    t.current += dt;
    layout();
  });
  useEffect(() => {
    if (resetKey === 0) return;
    controls.current?.reset();
    t.current = 0;
    layout();
    invalidate();
  }, [resetKey, invalidate]);

  const over = () => setHover(true);
  const out = () => setHover(false);

  return (
    <>
      <FitCamera target={TARGET} dir={DIR} width={10.6} height={6.9} />
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 3, 0]} intensity={18} color="#9B7BFF" distance={14} />
      <Stars radius={45} depth={30} count={2200} factor={3} saturation={0} fade speed={animate ? 0.3 : 0} />
      <directionalLight position={[4, 6, 5]} intensity={0.9} color="#dfe6ff" />
      <OrbitControls
        ref={controls as never}
        makeDefault
        enabled={fine || interactive}
        enablePan={false}
        enableZoom={false}
        enableDamping
        minPolarAngle={0.5}
        maxPolarAngle={1.45}
        minAzimuthAngle={-1}
        maxAzimuthAngle={1}
        onStart={() => setDragging(true)}
        onEnd={() => setDragging(false)}
        onChange={() => invalidate()}
      />
      {/* central object */}
      <Core animate={animate && selectedId === null} />
      <Html portal={overlay} center position={[0, 0.72, 0]} zIndexRange={[10, 0]}>
        <span className="scene-label">Research</span>
      </Html>

      {TOPICS.map((tp, i) => {
        const st = TOPIC_STYLE[tp];
        const selected = topic === tp;
        const dim = topic !== 'all' && !selected;
        return (
          <group key={tp}>
            <Ring radius={RING_BASE + i * RING_GAP} />
            <group ref={(g) => { planets.current[i] = g; }}>
              <TopicShape shape={st.shape} color={st.color} size={0.2} opacity={dim ? 0.3 : 1} emissive={selected ? 1.8 : 0.7} />
              <mesh onClick={tapGuard(() => onTopic(selected ? 'all' : tp))} onPointerOver={over} onPointerOut={out}>
                <sphereGeometry args={[0.42, 10, 8]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
              <Html portal={overlay} center position={[0, -0.5, 0]} zIndexRange={[10, 0]}>
                <button type="button" className={`hotspot topic${selected ? ' on' : ''}`} aria-pressed={selected} onClick={() => onTopic(selected ? 'all' : tp)}>
                  {tp}
                </button>
              </Html>
              {BY_TOPIC[tp].map((id) => {
                const isSel = id === selectedId;
                const nodeDim = dim && !isSel;
                const pub = publications.find((p) => p.id === id);
                return (
                  <group key={id} ref={(g) => { sats.current[id] = g; }}>
                    <TopicShape shape={st.shape} color={st.color} size={NODE_SIZE} opacity={nodeDim ? 0.3 : 1} emissive={isSel ? 2.6 : 1.1} />
                    {isSel && (
                      <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.16, 0.19, 32]} />
                        <meshBasicMaterial color="#ffffff" side={2} />
                      </mesh>
                    )}
                    {/* generous invisible hit area for fingers */}
                    <mesh onClick={tapGuard(() => onSelect(isSel ? null : id))} onPointerOver={over} onPointerOut={out}>
                      <sphereGeometry args={[0.26, 8, 6]} />
                      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                    </mesh>
                    {isSel && pub && (
                      <Html portal={overlay} center position={[0, 0.3, 0]} zIndexRange={[30, 0]}>
                        <span className="scene-label selected">{pub.title.length > 46 ? `${pub.title.slice(0, 44)}…` : pub.title}</span>
                      </Html>
                    )}
                  </group>
                );
              })}
            </group>
          </group>
        );
      })}
    </>
  );
}

export default function PublicationSystem({ active, animate, fine, onContextLost, interactive, ...rest }: SystemSceneProps & SceneProps) {
  const running = active && animate && !rest.hold && rest.selectedId === null;
  return (
    <SceneCanvas
      active={active}
      animating={running}
      onContextLost={onContextLost}
      touchAction={fine || interactive ? 'none' : 'pan-y'}
      bloom={{ intensity: 0.9, threshold: 0.6 }}
    >
      <Scene {...rest} interactive={interactive} animate={animate} fine={fine} />
    </SceneCanvas>
  );
}
