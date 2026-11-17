import { useEffect, useLayoutEffect, useMemo, useRef, type ElementRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Html, Lightformer, Line, OrbitControls, RoundedBox, Sparkles } from '@react-three/drei';
import { AdditiveBlending, CanvasTexture, Group, InstancedMesh, MeshPhysicalMaterial, MeshStandardMaterial, Object3D, SRGBColorSpace } from 'three';
import { GITHUB_URL, SCHOLAR_PROFILE_URL, profile } from '../data/profile';
import { featuredPublications, publications } from '../data/publications';
import { TOPICS } from '../data/types';
import { EXTERNAL_LINK_PROPS } from '../lib/url';
import { FitCamera, SceneCanvas } from './SceneCanvas';
import type { SceneProps } from './SceneShell';
import { TOPIC_STYLE } from './topicStyle';

const TARGET: [number, number, number] = [0.05, 1.05, 0];
const DIR: [number, number, number] = [0.42, 0.26, 1];

/* ---------------------------------------------------------------- dashboard texture
   Everything on the screen is real data from src/data (counts, snapshot metrics, titles). No invented results. */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawDashboard(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0b0f1e');
  bg.addColorStop(1, '#151236');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // sidebar
  ctx.fillStyle = 'rgba(255,255,255,0.035)';
  ctx.fillRect(0, 0, 300, H);
  ctx.fillStyle = '#9B7BFF';
  roundRect(ctx, 48, 52, 64, 64, 14);
  ctx.fill();
  ctx.fillStyle = '#0b0f1e';
  ctx.font = '700 26px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('M', 80, 94);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#F3F5FA';
  ctx.font = '600 30px system-ui, sans-serif';
  ctx.fillText(profile.monogram, 132, 96);
  ['Overview', 'Publications', 'Topics', 'Code'].forEach((t, i) => {
    const y = 200 + i * 74;
    if (i === 0) {
      ctx.fillStyle = 'rgba(155,123,255,0.18)';
      roundRect(ctx, 32, y - 40, 236, 58, 12);
      ctx.fill();
    }
    ctx.fillStyle = i === 0 ? '#F3F5FA' : '#8d97b0';
    ctx.font = '500 26px system-ui, sans-serif';
    ctx.fillText(t, 60, y);
  });

  // header
  ctx.fillStyle = '#F3F5FA';
  ctx.font = '600 44px Georgia, serif';
  ctx.fillText('Research overview', 350, 98);
  ctx.fillStyle = '#8d97b0';
  ctx.font = '400 24px system-ui, sans-serif';
  ctx.fillText(profile.name, 350, 140);

  // KPI cards
  const kpis: [string, string, string][] = [
    [String(publications.length), 'Listed publications', '#69D9E8'],
    [String(profile.metrics.citations), 'Citations*', '#9B7BFF'],
    [String(profile.metrics.hIndex), 'h-index*', '#F4A261'],
    [String(profile.metrics.i10Index), 'i10-index*', '#8BD17C'],
  ];
  kpis.forEach(([v, label, c], i) => {
    const x = 350 + i * 405;
    const y = 180;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    roundRect(ctx, x, y, 380, 170, 20);
    ctx.fill();
    ctx.fillStyle = c;
    roundRect(ctx, x, y, 8, 170, 4);
    ctx.fill();
    ctx.fillStyle = '#F3F5FA';
    ctx.font = '600 78px Georgia, serif';
    ctx.fillText(v, x + 36, y + 98);
    ctx.fillStyle = '#AAB4C8';
    ctx.font = '400 26px system-ui, sans-serif';
    ctx.fillText(label, x + 38, y + 144);
  });

  // publications by topic (real counts)
  const px = 350;
  const py = 400;
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  roundRect(ctx, px, py, 1000, 560, 22);
  ctx.fill();
  ctx.fillStyle = '#F3F5FA';
  ctx.font = '600 30px system-ui, sans-serif';
  ctx.fillText('Publications by topic', px + 40, py + 62);
  const maxCount = Math.max(...TOPICS.map((t) => publications.filter((p) => p.topic === t).length));
  TOPICS.forEach((t, i) => {
    const n = publications.filter((p) => p.topic === t).length;
    const y = py + 120 + i * 86;
    ctx.fillStyle = '#AAB4C8';
    ctx.font = '400 24px system-ui, sans-serif';
    ctx.fillText(t, px + 40, y + 28);
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    roundRect(ctx, px + 380, y + 6, 520, 30, 15);
    ctx.fill();
    const g = ctx.createLinearGradient(px + 380, 0, px + 900, 0);
    g.addColorStop(0, TOPIC_STYLE[t].color);
    g.addColorStop(1, '#ffffff');
    ctx.fillStyle = g;
    roundRect(ctx, px + 380, y + 6, (520 * n) / maxCount, 30, 15);
    ctx.fill();
    ctx.fillStyle = '#F3F5FA';
    ctx.font = '600 26px system-ui, sans-serif';
    ctx.fillText(String(n), px + 920, y + 31);
  });

  // featured titles
  const fx = 1390;
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  roundRect(ctx, fx, py, 580, 560, 22);
  ctx.fill();
  ctx.fillStyle = '#F3F5FA';
  ctx.font = '600 30px system-ui, sans-serif';
  ctx.fillText('Featured', fx + 36, py + 62);
  featuredPublications.forEach((p, i) => {
    const y = py + 116 + i * 110;
    ctx.fillStyle = TOPIC_STYLE[p.topic].color;
    roundRect(ctx, fx + 36, y - 22, 10, 74, 5);
    ctx.fill();
    ctx.fillStyle = '#F3F5FA';
    ctx.font = '500 22px system-ui, sans-serif';
    const words = p.title.split(' ');
    let line = '';
    let row = 0;
    for (const w of words) {
      if (ctx.measureText(`${line}${w} `).width > 480 && row < 1) {
        ctx.fillText(line, fx + 64, y + row * 30);
        line = '';
        row += 1;
      }
      line += `${w} `;
    }
    const last = ctx.measureText(line).width > 480 ? `${line.slice(0, 38)}…` : line;
    ctx.fillText(last, fx + 64, y + row * 30);
    ctx.fillStyle = '#8d97b0';
    ctx.font = '400 19px system-ui, sans-serif';
    ctx.fillText(`${p.year} · ${p.topic}`, fx + 64, y + 62);
  });
  ctx.fillStyle = '#6f7a95';
  ctx.font = '400 20px system-ui, sans-serif';
  ctx.fillText('* Google Scholar snapshot supplied by the author', 350, H - 34);
}

/* ---------------------------------------------------------------- pieces */
function Contours() {
  const rings = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => {
        const base = 0.8 + i * 0.38;
        const pts: [number, number, number][] = [];
        for (let k = 0; k <= 200; k++) {
          const a = (k / 200) * Math.PI * 2;
          const r = base * (1 + 0.07 * Math.sin(3 * a + i * 0.9) + 0.045 * Math.sin(5 * a + i * 1.7));
          pts.push([Math.cos(a) * r * 1.4, Math.sin(a) * r * 0.8, 0]);
        }
        return { pts, opacity: Math.max(0.06, 0.38 - i * 0.03) };
      }),
    [],
  );
  return (
    <group position={[0, 1.3, -2.2]}>
      {rings.map((r, i) => (
        <Line key={i} points={r.pts} color={i % 3 === 0 ? '#b7a2ff' : '#9B7BFF'} lineWidth={i % 3 === 0 ? 1.6 : 1} transparent opacity={r.opacity} />
      ))}
    </group>
  );
}

function Keys({ mat }: { mat: MeshStandardMaterial }) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new Object3D();
    let n = 0;
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 15; c++) {
        o.position.set(-0.665 + c * 0.095, 0.07, -0.16 + r * 0.08);
        o.updateMatrix();
        m.setMatrixAt(n++, o.matrix);
      }
    m.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 75]} material={mat}>
      <boxGeometry args={[0.08, 0.028, 0.066]} />
    </instancedMesh>
  );
}

function Chip({ href, children, external = false, position, overlay }: { href: string; children: string; external?: boolean; position: [number, number, number]; overlay: SceneProps['overlay'] }) {
  return (
    <Html portal={overlay} position={position} center zIndexRange={[20, 0]}>
      <a className="hotspot" href={href} {...(external ? EXTERNAL_LINK_PROPS : {})} aria-label={external ? `${children} (opens in a new tab)` : children}>
        <span className="hotspot-dot" aria-hidden="true" />
        {children}
        <span aria-hidden="true">{external ? ' ↗' : ' ↓'}</span>
      </a>
    </Html>
  );
}

function useMaterials() {
  const mats = useMemo(
    () => ({
      desk: new MeshPhysicalMaterial({ color: '#1d2236', roughness: 0.35, metalness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
      metal: new MeshStandardMaterial({ color: '#2a3048', roughness: 0.28, metalness: 0.85 }),
      body: new MeshPhysicalMaterial({ color: '#141827', roughness: 0.4, metalness: 0.5, clearcoat: 0.4 }),
      key: new MeshStandardMaterial({ color: '#2b3150', roughness: 0.5, metalness: 0.1 }),
      keyboard: new MeshStandardMaterial({ color: '#1a1e30', roughness: 0.4, metalness: 0.4 }),
      mat: new MeshStandardMaterial({ color: '#0f1222', roughness: 0.95 }),
      glass: new MeshPhysicalMaterial({ color: '#9fb2ff', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.18 }),
      violet: new MeshStandardMaterial({ color: '#9B7BFF', emissive: '#9B7BFF', emissiveIntensity: 3, toneMapped: false }),
      cyan: new MeshStandardMaterial({ color: '#69D9E8', emissive: '#69D9E8', emissiveIntensity: 3, toneMapped: false }),
      warm: new MeshStandardMaterial({ color: '#ffe2b8', emissive: '#ffd59a', emissiveIntensity: 4, toneMapped: false }),
      leaf: new MeshStandardMaterial({ color: '#3fa58a', roughness: 0.6 }),
      pot: new MeshStandardMaterial({ color: '#d9d4ce', roughness: 0.7 }),
      paper: new MeshStandardMaterial({ color: '#e9e6f5', roughness: 0.9 }),
      cover: new MeshStandardMaterial({ color: '#4b3a9a', roughness: 0.6 }),
    }),
    [],
  );
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);
  return mats;
}
type Mats = ReturnType<typeof useMaterials>;

function Monitor({ mats }: { mats: Mats }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 2048;
    c.height = 1024;
    drawDashboard(c);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
  const halo = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    if (ctx) {
      const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
      g.addColorStop(0, 'rgba(120,90,255,0.55)');
      g.addColorStop(0.5, 'rgba(110,80,255,0.18)');
      g.addColorStop(1, 'rgba(100,70,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
    }
    return new CanvasTexture(c);
  }, []);
  useEffect(
    () => () => {
      tex.dispose();
      halo.dispose();
    },
    [tex, halo],
  );
  return (
    <group position={[0, 0, -0.42]}>
      <RoundedBox args={[0.9, 0.04, 0.5]} radius={0.02} position={[0, 0.02, 0]} material={mats.metal} />
      <RoundedBox args={[0.12, 0.95, 0.06]} radius={0.03} position={[0, 0.5, -0.08]} material={mats.metal} />
      <group position={[0, 1.42, 0]}>
        <RoundedBox args={[2.9, 1.5, 0.07]} radius={0.04} material={mats.body} />
        <mesh position={[0, 0.02, 0.037]}>
          <planeGeometry args={[2.8, 1.4]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, -0.08]}>
          <planeGeometry args={[5.2, 3.4]} />
          <meshBasicMaterial map={halo} transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.76, 0.01]} material={mats.violet}>
          <boxGeometry args={[2.6, 0.01, 0.02]} />
        </mesh>
      </group>
    </group>
  );
}

function Computer({ mats }: { mats: Mats }) {
  return (
    <group position={[-2.05, 0, -0.35]} rotation={[0, 0.45, 0]}>
      <RoundedBox args={[0.55, 1.25, 1.0]} radius={0.04} position={[0, 0.625, 0]} material={mats.body} />
      <mesh position={[0.28, 0.64, 0]} rotation={[0, Math.PI / 2, 0]} material={mats.glass}>
        <planeGeometry args={[0.9, 1.1]} />
      </mesh>
      {[0.95, 0.6].map((y) => (
        <mesh key={y} position={[0.26, y, -0.22]} rotation={[0, Math.PI / 2, 0]} material={mats.violet}>
          <torusGeometry args={[0.13, 0.012, 10, 40]} />
        </mesh>
      ))}
      <mesh position={[0.26, 0.6, 0.2]} rotation={[0, Math.PI / 2, 0]} material={mats.cyan}>
        <torusGeometry args={[0.13, 0.012, 10, 40]} />
      </mesh>
      <RoundedBox args={[0.05, 0.12, 0.6]} radius={0.01} position={[0.2, 0.32, 0.05]} material={mats.metal} />
      <mesh position={[0.26, 0.32, 0.05]} material={mats.cyan}>
        <boxGeometry args={[0.005, 0.02, 0.55]} />
      </mesh>
    </group>
  );
}

function Lamp({ mats }: { mats: Mats }) {
  return (
    <group position={[2.15, 0, -0.55]} rotation={[0, -0.6, 0]}>
      <mesh position={[0, 0.025, 0]} material={mats.metal}>
        <cylinderGeometry args={[0.2, 0.22, 0.05, 32]} />
      </mesh>
      <mesh position={[0, 0.5, 0]} rotation={[0, 0, 0.25]} material={mats.metal}>
        <cylinderGeometry args={[0.02, 0.02, 1, 12]} />
      </mesh>
      <mesh position={[-0.28, 1.02, 0]} rotation={[0, 0, 1.25]} material={mats.metal}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 12]} />
      </mesh>
      <group position={[-0.55, 1.02, 0]} rotation={[0, 0, 0.35]}>
        <mesh material={mats.metal}>
          <coneGeometry args={[0.16, 0.24, 32, 1, true]} />
        </mesh>
        <mesh position={[0, -0.11, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.warm}>
          <circleGeometry args={[0.15, 32]} />
        </mesh>
      </group>
      <pointLight position={[-0.6, 0.8, 0]} intensity={4} distance={3} color="#ffd59a" />
    </group>
  );
}

function Plant({ mats }: { mats: Mats }) {
  const leaves = useMemo(
    () => Array.from({ length: 9 }, (_, i) => ({ rotY: (i / 9) * Math.PI * 2, tilt: 0.35 + (i % 3) * 0.18, h: 0.38 + (i % 4) * 0.07 })),
    [],
  );
  return (
    <group position={[1.75, 0, 0.75]}>
      <mesh position={[0, 0.13, 0]} material={mats.pot}>
        <cylinderGeometry args={[0.15, 0.11, 0.26, 32]} />
      </mesh>
      {leaves.map((l, i) => (
        <group key={i} position={[0, 0.25, 0]} rotation={[0, l.rotY, 0]}>
          <mesh position={[0, l.h / 2, 0.05]} rotation={[l.tilt, 0, 0]} scale={[0.06, l.h, 0.018]} material={mats.leaf}>
            <sphereGeometry args={[1, 12, 10]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Notebooks({ mats }: { mats: Mats }) {
  return (
    <group position={[1.2, 0, 0.15]} rotation={[0, -0.3, 0]}>
      <RoundedBox args={[0.62, 0.06, 0.82]} radius={0.015} position={[0, 0.03, 0]} material={mats.cover} />
      <RoundedBox args={[0.58, 0.05, 0.78]} radius={0.012} position={[0.02, 0.085, 0]} rotation={[0, 0.12, 0]} material={mats.paper} />
      <mesh position={[0.05, 0.12, 0.1]} rotation={[0, 0.9, Math.PI / 2]} material={mats.violet}>
        <cylinderGeometry args={[0.012, 0.012, 0.5, 10]} />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------- scene */
interface Props extends SceneProps {
  resetKey?: number;
}

function Scene({ animate, fine, resetKey = 0, overlay }: Pick<Props, 'animate' | 'fine' | 'resetKey' | 'overlay'>) {
  const invalidate = useThree((s) => s.invalidate);
  const group = useRef<Group>(null);
  const controls = useRef<ElementRef<typeof OrbitControls>>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const mats = useMaterials();

  // Restrained pointer-driven drift (fine pointers only, never in reduced-motion).
  useEffect(() => {
    if (!fine || !animate) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      invalidate();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [fine, animate, invalidate]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const tx = fine && animate ? pointer.current.x * 0.08 : 0;
    const ty = fine && animate ? pointer.current.y * 0.03 : 0;
    g.rotation.y += (tx - g.rotation.y) * 0.06;
    g.rotation.x += (ty - g.rotation.x) * 0.06;
    if (Math.abs(tx - g.rotation.y) > 0.0008 || Math.abs(ty - g.rotation.x) > 0.0008) invalidate();
  });

  useEffect(() => {
    if (resetKey === 0) return;
    controls.current?.reset();
    pointer.current = { x: 0, y: 0 };
    invalidate();
  }, [resetKey, invalidate]);

  return (
    <>
      <FitCamera target={TARGET} dir={DIR} width={5.9} height={3.4} />
      {/* Studio lighting generated in-scene (no HDR download). */}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} color="#9B7BFF" position={[-5, 3, 2]} scale={[4, 6, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={2.5} color="#69D9E8" position={[5, 2, 3]} scale={[4, 5, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.5} color="#ffffff" position={[0, 6, 4]} scale={[8, 2, 1]} target={[0, 0, 0]} />
      </Environment>
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 6, 5]} intensity={1.6} color="#e6ebff" />
      <pointLight position={[-3, 2.4, 2]} intensity={22} color="#9B7BFF" distance={10} />
      <pointLight position={[3.2, 1.6, 2.2]} intensity={16} color="#69D9E8" distance={9} />
      <OrbitControls
        ref={controls}
        makeDefault
        enabled={fine}
        enablePan={false}
        enableZoom={false}
        enableDamping
        minAzimuthAngle={-0.6}
        maxAzimuthAngle={0.5}
        minPolarAngle={1.05}
        maxPolarAngle={1.5}
        onChange={() => invalidate()}
      />
      <Contours />
      {animate && <Sparkles count={40} scale={[7, 3.5, 3]} position={[0, 1.6, -0.5]} size={1.6} speed={0.25} opacity={0.6} color="#b7a2ff" />}
      <Float enabled={animate} speed={0.8} rotationIntensity={0.05} floatIntensity={0.12}>
        <group ref={group}>
          <RoundedBox args={[5.6, 0.12, 2.6]} radius={0.05} position={[0, -0.06, 0]} material={mats.desk} />
          <mesh position={[0, -0.075, 1.302]} material={mats.violet}>
            <boxGeometry args={[5.4, 0.012, 0.004]} />
          </mesh>
          {[-2.5, 2.5].map((x) => (
            <RoundedBox key={x} args={[0.1, 1.9, 2.2]} radius={0.04} position={[x, -1.06, 0]} material={mats.metal} />
          ))}
          <RoundedBox args={[2.9, 0.012, 1.25]} radius={0.006} position={[0, 0.006, 0.45]} material={mats.mat} />
          <Monitor mats={mats} />
          <group position={[-0.1, 0, 0.62]}>
            <RoundedBox args={[1.52, 0.055, 0.5]} radius={0.02} position={[0, 0.03, 0]} material={mats.keyboard} />
            <Keys mat={mats.key} />
            <mesh position={[0, 0.004, 0.252]} material={mats.cyan}>
              <boxGeometry args={[1.4, 0.006, 0.004]} />
            </mesh>
          </group>
          <mesh position={[1.05, 0.04, 0.72]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1.35, 0.6]} material={mats.keyboard}>
            <capsuleGeometry args={[0.07, 0.08, 8, 16]} />
          </mesh>
          <Computer mats={mats} />
          <Lamp mats={mats} />
          <Plant mats={mats} />
          <Notebooks mats={mats} />
          <ContactShadows position={[0, 0.002, 0]} scale={6} blur={2.4} far={1.6} opacity={0.75} resolution={512} frames={1} color="#000000" />
          <Chip overlay={overlay} href="#publications" position={[0.9, 2.35, -0.4]}>Publications</Chip>
          <Chip overlay={overlay} href={SCHOLAR_PROFILE_URL} external position={[1.2, 0.45, 0.15]}>Scholar</Chip>
          <Chip overlay={overlay} href={GITHUB_URL} external position={[-2.05, 1.55, -0.35]}>GitHub</Chip>
        </group>
      </Float>
    </>
  );
}

export default function ResearchWorkstation({ active, animate, fine, onContextLost, resetKey, overlay }: Props) {
  return (
    <SceneCanvas
      active={active}
      animating={animate}
      onContextLost={onContextLost}
      touchAction="pan-y"
      camera={{ position: [2, 2, 8], fov: 32 }}
      bloom={{ intensity: 0.85, threshold: 0.75 }}
    >
      <Scene animate={animate} fine={fine} resetKey={resetKey} overlay={overlay} />
    </SceneCanvas>
  );
}
