import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Html, Line, OrbitControls, Stars, useCursor } from '@react-three/drei';
import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  CanvasTexture,
  Float32BufferAttribute,
  Group,
  LineSegments,
  Quaternion,
  Vector3,
} from 'three';
import dots from '../data/earthDots.json';
import { SCHOLAR_PROFILE_URL } from '../data/profile';
import { TOPICS, type Topic } from '../data/types';
import { openExternal } from '../lib/url';
import { TOPIC_STYLE } from './topicStyle';
import { FitCamera, SceneCanvas } from './SceneCanvas';
import { TopicShape } from './TopicShape';
import type { SceneProps } from './SceneShell';

export interface EarthSceneProps {
  topic: Topic | 'all';
  onTopic: (t: Topic | 'all') => void;
  onAffiliation: () => void;
  affiliationOpen: boolean;
  /** Pause automatic motion (hover/focus inside the section). */
  hold: boolean;
  /** Touch devices: the user has opted in to capturing drags. */
  interactive: boolean;
  resetKey?: number;
}

export const LA = { lat: 36.745, lon: -84.159 }; // Williamsburg, KY: University of the Cumberlands
const R = 1;
const TARGET: [number, number, number] = [0, 0, 0];
const DIR: [number, number, number] = [0, 0.18, 1];
const CLICK_SLOP_PX = 6;

export function latLonToVec3(lat: number, lon: number, r = R): Vector3 {
  const phi = (lat * Math.PI) / 180;
  const lam = (lon * Math.PI) / 180;
  return new Vector3(r * Math.cos(phi) * Math.sin(lam), r * Math.sin(phi), r * Math.cos(phi) * Math.cos(lam));
}

function dotTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 15);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.9)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 32);
  }
  return new CanvasTexture(c);
}

function LandDots() {
  const { geom, tex } = useMemo(() => {
    const pos: number[] = [];
    (dots as number[][]).forEach(([la, lo]) => {
      const v = latLonToVec3(la! / 10, lo! / 10, R * 1.004);
      pos.push(v.x, v.y, v.z);
    });
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    return { geom: g, tex: dotTexture() };
  }, []);
  useEffect(
    () => () => {
      geom.dispose();
      tex.dispose();
    },
    [geom, tex],
  );
  return (
    <points geometry={geom}>
      <pointsMaterial map={tex} size={0.04} color="#9cf0fa" transparent opacity={1} depthWrite={false} alphaTest={0.05} sizeAttenuation toneMapped={false} />
    </points>
  );
}

const ATMOSPHERE = {
  vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
  fragmentShader: 'varying vec3 vN; varying vec3 vV; void main(){ float f = pow(0.72 - dot(vN, vV), 2.4); gl_FragColor = vec4(0.45,0.75,1.0,1.0)*clamp(f,0.0,1.0)*0.35; }',
};

interface Marker {
  topic: Topic;
  angle: number;
  speed: number;
  tilt: number;
}
const MARKERS: Marker[] = TOPICS.map((t, i) => ({ topic: t, angle: (i / TOPICS.length) * Math.PI * 2, speed: 0.11 + i * 0.012, tilt: 0.45 }));
const ORBIT_R = 1.5;
const SAT_R = 1.85;

function orbitPos(angle: number, tilt: number, r: number, out: Vector3): Vector3 {
  const x = Math.cos(angle) * r;
  const z = Math.sin(angle) * r;
  return out.set(x, z * Math.sin(tilt), z * Math.cos(tilt));
}

function Hit({ onClick, radius, onOver, onOut }: { onClick: (e: ThreeEvent<MouseEvent>) => void; radius: number; onOver?: () => void; onOut?: () => void }) {
  return (
    <mesh onClick={onClick} onPointerOver={onOver} onPointerOut={onOut}>
      <sphereGeometry args={[radius, 10, 8]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function guarded(fn: () => void) {
  return (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > CLICK_SLOP_PX) return; // a drag, not a tap
    e.stopPropagation();
    fn();
  };
}

type Props = EarthSceneProps & Pick<SceneProps, 'animate' | 'fine' | 'overlay'>;

function Scene({ topic, onTopic, onAffiliation, affiliationOpen, hold, interactive, animate, fine, resetKey = 0, overlay }: Props) {
  const invalidate = useThree((s) => s.invalidate);
  const globe = useRef<Group>(null);
  const markerRefs = useRef<(Group | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const satRef = useRef<Group>(null);
  const arcs = useRef<LineSegments>(null);
  const controls = useRef<{ reset: () => void } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);
  useCursor(hover);

  const running = animate && !hold && !dragging && !affiliationOpen;
  const t = useRef(0);
  const tmp = useMemo(() => new Vector3(), []);
  const laPos = useMemo(() => latLonToVec3(LA.lat, LA.lon, R * 1.01), []);
  const laQuat = useMemo(() => new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), laPos.clone().normalize()), [laPos]);
  const orbitPts = useMemo(() => {
    const pts: [number, number, number][] = [];
    const v = new Vector3();
    for (let k = 0; k <= 128; k++) {
      orbitPos((k / 128) * Math.PI * 2, MARKERS[0]!.tilt, ORBIT_R, v);
      pts.push([v.x, v.y, v.z]);
    }
    return pts;
  }, []);

  const arcGeom = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(new Float32Array(TOPICS.length * 24 * 2 * 3), 3));
    return g;
  }, []);
  useEffect(() => () => arcGeom.dispose(), [arcGeom]);

  const placeMarkers = () => {
    const a = arcGeom.getAttribute('position');
    const mid = new Vector3();
    const prev = new Vector3();
    const cur = new Vector3();
    MARKERS.forEach((m, i) => {
      const g = markerRefs.current[i];
      if (!g) return;
      orbitPos(m.angle + t.current * m.speed, m.tilt, ORBIT_R, tmp);
      g.position.copy(tmp);
      // hide a label while its marker passes behind the globe (keeps the view uncluttered)
      const label = labelRefs.current[i];
      if (label) {
        const behind = tmp.z < -0.1 && Math.hypot(tmp.x, tmp.y) < 1.08;
        label.style.opacity = behind ? '0' : '1';
        label.style.pointerEvents = behind ? 'none' : '';
      }
      // conceptual arc: quadratic curve from the LA marker, lifted away from the surface (decorative)
      mid.copy(laPos).add(tmp).multiplyScalar(0.5).normalize().multiplyScalar(1.7);
      for (let k = 0; k <= 24; k++) {
        const u = k / 24;
        cur.set(0, 0, 0)
          .addScaledVector(laPos, (1 - u) * (1 - u))
          .addScaledVector(mid, 2 * u * (1 - u))
          .addScaledVector(tmp, u * u);
        if (k > 0) {
          const idx = (i * 24 + (k - 1)) * 2;
          a.setXYZ(idx, prev.x, prev.y, prev.z);
          a.setXYZ(idx + 1, cur.x, cur.y, cur.z);
        }
        prev.copy(cur);
      }
    });
    a.needsUpdate = true;
    const s = satRef.current;
    if (s) {
      orbitPos(t.current * 0.2 + 1.2, -0.5, SAT_R, tmp);
      s.position.copy(tmp);
      s.rotation.y = t.current * 0.6;
    }
  };

  useLayoutEffect(placeMarkers); // initial layout and re-layout after every React commit
  useFrame((_, dt) => {
    if (!running) return;
    t.current += dt;
    if (globe.current) globe.current.rotation.y += dt * 0.05;
    placeMarkers();
  });

  useEffect(() => {
    if (resetKey === 0) return;
    controls.current?.reset();
    if (globe.current) globe.current.rotation.y = 1.5;
    t.current = 0;
    invalidate();
  }, [resetKey, invalidate]);

  return (
    <>
      <FitCamera target={TARGET} dir={DIR} width={4.2} height={3.45} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 2, 4]} intensity={1.8} color="#dfe6ff" />
      <pointLight position={[-4, -1, 2]} intensity={14} color="#9B7BFF" distance={12} />
      <Stars radius={40} depth={25} count={1800} factor={2.6} saturation={0} fade speed={animate ? 0.4 : 0} />
      <Line points={orbitPts} color="#9B7BFF" lineWidth={1} transparent opacity={0.22} />
      <OrbitControls
        ref={controls as never}
        makeDefault
        enabled={fine || interactive}
        enablePan={false}
        enableZoom={false}
        enableDamping
        minPolarAngle={0.9}
        maxPolarAngle={2.2}
        onStart={() => setDragging(true)}
        onEnd={() => setDragging(false)}
        onChange={() => invalidate()}
      />
      <group ref={globe} rotation={[0, 1.5, 0]}>
        <mesh>
          <sphereGeometry args={[R, 48, 36]} />
          <meshStandardMaterial color="#0e1a3a" emissive="#0a1230" emissiveIntensity={0.6} roughness={0.75} metalness={0.1} />
        </mesh>
        <LandDots />
        {/* Williamsburg, KY: institution location */}
        <group position={laPos} quaternion={laQuat}>
          <mesh>
            <sphereGeometry args={[0.028, 16, 12]} />
            <meshBasicMaterial color={affiliationOpen ? '#ffffff' : '#c9b8ff'} toneMapped={false} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.05, 0.064, 40]} />
            <meshBasicMaterial color="#b49cff" transparent opacity={0.95} side={2} toneMapped={false} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.085, 0.092, 40]} />
            <meshBasicMaterial color="#9B7BFF" transparent opacity={0.5} side={2} toneMapped={false} />
          </mesh>
          {/* beacon beam along the surface normal */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.006, 0.02, 0.4, 12, 1, true]} />
            <meshBasicMaterial color="#b49cff" transparent opacity={0.55} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
          <Hit radius={0.11} onClick={guarded(onAffiliation)} onOver={() => setHover(true)} onOut={() => setHover(false)} />
          <Html portal={overlay} position={[0.1, 0.1, 0]} zIndexRange={[20, 0]}>
            <button type="button" className="hotspot" onClick={onAffiliation} aria-expanded={affiliationOpen} aria-label="Show affiliation: University of the Cumberlands, School of Business, Williamsburg, Kentucky">
              Williamsburg, KY
            </button>
          </Html>
        </group>
      </group>
      <mesh scale={1.045}>
        <sphereGeometry args={[R, 40, 30]} />
        <shaderMaterial args={[{ ...ATMOSPHERE, side: BackSide, transparent: true, blending: AdditiveBlending, depthWrite: false }]} />
      </mesh>

      <lineSegments ref={arcs} geometry={arcGeom}>
        <lineBasicMaterial color="#9B7BFF" transparent opacity={0.28} />
      </lineSegments>

      {MARKERS.map((m, i) => {
        const style = TOPIC_STYLE[m.topic];
        const selected = topic === m.topic;
        const dim = topic !== 'all' && !selected;
        return (
          <group key={m.topic} ref={(g) => { markerRefs.current[i] = g; }}>
            <TopicShape shape={style.shape} color={style.color} size={0.075} opacity={dim ? 0.35 : 1} emissive={selected ? 2 : 0.9} />
            {selected && (
              <mesh>
                <ringGeometry args={[0.12, 0.14, 32]} />
                <meshBasicMaterial color="#ffffff" side={2} />
              </mesh>
            )}
            <Hit radius={0.2} onClick={guarded(() => onTopic(selected ? 'all' : m.topic))} onOver={() => setHover(true)} onOut={() => setHover(false)} />
            <Html portal={overlay} center position={[0, -0.17, 0]} zIndexRange={[10, 0]} className="scene-label-wrap">
              <div ref={(el) => { labelRefs.current[i] = el; }} className="label-fade">
              <button type="button" className={`hotspot topic${selected ? ' on' : ''}`} aria-pressed={selected} onClick={() => onTopic(selected ? 'all' : m.topic)}>
                {m.topic}
              </button>
              </div>
            </Html>
          </group>
        );
      })}

      {/* Scholar satellite: a labeled visual guide to the profile, not live tracking */}
      <group ref={satRef}>
        <mesh>
          <boxGeometry args={[0.1, 0.05, 0.05]} />
          <meshStandardMaterial color="#F3F5FA" emissive="#9B7BFF" emissiveIntensity={1.4} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.2, 0.01, 0.07]} />
          <meshStandardMaterial color="#69D9E8" emissive="#69D9E8" emissiveIntensity={0.6} />
        </mesh>
        <Hit radius={0.22} onClick={guarded(() => openExternal(SCHOLAR_PROFILE_URL))} onOver={() => setHover(true)} onOut={() => setHover(false)} />
        <Html portal={overlay} center position={[0, 0.17, 0]} zIndexRange={[10, 0]}>
          <a className="hotspot" href={SCHOLAR_PROFILE_URL} target="_blank" rel="noopener noreferrer" aria-label="Google Scholar profile (opens in a new tab)">
            Google Scholar ↗
          </a>
        </Html>
      </group>
    </>
  );
}

export default function ConnectedEarth({ active, animate, fine, onContextLost, interactive, ...rest }: EarthSceneProps & SceneProps) {
  const running = active && animate && !rest.hold && !rest.affiliationOpen;
  return (
    <SceneCanvas
      active={active}
      animating={running}
      onContextLost={onContextLost}
      touchAction={fine || interactive ? 'none' : 'pan-y'}
      bloom={{ intensity: 0.9, threshold: 0.55 }}
    >
      <Scene {...rest} interactive={interactive} animate={animate} fine={fine} />
    </SceneCanvas>
  );
}
