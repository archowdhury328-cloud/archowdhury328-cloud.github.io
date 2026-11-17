import { useEffect, useLayoutEffect, useMemo, useRef, type ElementRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import {
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  SRGBColorSpace,
} from 'three';
import { GITHUB_URL, SCHOLAR_PROFILE_URL, profile } from '../data/profile';
import { TOPICS } from '../data/types';
import { EXTERNAL_LINK_PROPS } from '../lib/url';
import { FitCamera, SceneCanvas } from './SceneCanvas';
import type { SceneProps } from './SceneShell';

const TARGET: [number, number, number] = [0, 1.15, 0];
const DIR: [number, number, number] = [0.32, 0.2, 1];

/** Stylized dashboard drawn once to a canvas texture. Decorative: no measurements or results are shown. */
function drawDashboard(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#0b1020');
  g.addColorStop(1, '#141a31');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#9B7BFF';
  ctx.fillRect(40, 38, 10, 34);
  ctx.fillStyle = '#F3F5FA';
  ctx.font = '600 34px Georgia, serif';
  ctx.fillText(profile.monogram, 64, 66);
  ctx.fillStyle = '#AAB4C8';
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText('Research overview', 190, 64);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.strokeRect(40, 100, w - 80, h - 150);

  // topic chips (names only)
  const colors = ['#69D9E8', '#9B7BFF', '#F4A261', '#E76F9A', '#8BD17C'];
  TOPICS.forEach((t, i) => {
    const x = 60 + (i % 3) * 300;
    const y = 130 + Math.floor(i / 3) * 56;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(x, y, 280, 40);
    ctx.fillStyle = colors[i] ?? '#fff';
    ctx.fillRect(x, y, 6, 40);
    ctx.fillStyle = '#F3F5FA';
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText(t, x + 18, y + 27);
  });
  // abstract, unlabeled shapes (illustrative only)
  ctx.fillStyle = 'rgba(105,217,232,0.75)';
  [60, 110, 80, 150, 120, 170, 140].forEach((bh, i) => ctx.fillRect(70 + i * 46, h - 80 - bh, 28, bh));
  ctx.strokeStyle = '#9B7BFF';
  ctx.lineWidth = 4;
  ctx.beginPath();
  [0, 1, 2, 3, 4, 5, 6, 7].forEach((i) => {
    const x = 440 + i * 70;
    const y = h - 140 - [20, 50, 38, 85, 70, 110, 96, 130][i]!;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.fillStyle = '#7e89a3';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText('Illustrative graphic', 40, h - 18);
}

function Contours() {
  const geoms = useMemo(() => {
    const out: BufferGeometry[] = [];
    for (let i = 0; i < 9; i++) {
      const pts: number[] = [];
      const base = 0.9 + i * 0.42;
      for (let k = 0; k < 180; k++) {
        const a = (k / 180) * Math.PI * 2;
        const r = base * (1 + 0.07 * Math.sin(3 * a + i * 0.9) + 0.045 * Math.sin(5 * a + i * 1.7));
        pts.push(Math.cos(a) * r * 1.35, Math.sin(a) * r * 0.78, 0);
      }
      const g = new BufferGeometry();
      g.setAttribute('position', new Float32BufferAttribute(pts, 3));
      out.push(g);
    }
    return out;
  }, []);
  useEffect(() => () => geoms.forEach((g) => g.dispose()), [geoms]);
  return (
    <group position={[0, 1.2, -1.7]}>
      {geoms.map((g, i) => (
        <lineLoop key={i} geometry={g}>
          <lineBasicMaterial color="#9B7BFF" transparent opacity={Math.max(0.1, 0.62 - i * 0.065)} />
        </lineLoop>
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
      for (let c = 0; c < 14; c++) {
        o.position.set(-0.62 + c * 0.095, 0.075, -0.15 + r * 0.075);
        o.updateMatrix();
        m.setMatrixAt(n++, o.matrix);
      }
    m.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 70]} material={mat}>
      <boxGeometry args={[0.078, 0.03, 0.06]} />
    </instancedMesh>
  );
}

function Chip({ href, children, external = false, position, overlay }: { href: string; children: string; external?: boolean; position: [number, number, number]; overlay: SceneProps['overlay'] }) {
  return (
    <Html portal={overlay} position={position} center zIndexRange={[20, 0]}>
      <a className="hotspot" href={href} {...(external ? EXTERNAL_LINK_PROPS : {})} aria-label={external ? `${children} (opens in a new tab)` : children}>
        {children}
        <span aria-hidden="true"> {external ? '↗' : '↓'}</span>
      </a>
    </Html>
  );
}

interface Props extends SceneProps {
  resetKey?: number;
}

function Scene({ animate, fine, resetKey = 0, overlay }: Pick<Props, 'animate' | 'fine' | 'resetKey' | 'overlay'>) {
  const invalidate = useThree((s) => s.invalidate);
  const group = useRef<Group>(null);
  const controls = useRef<ElementRef<typeof OrbitControls>>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const { screen, mats, tex } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 576;
    drawDashboard(canvas);
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 4;
    return {
      tex: t,
      screen: canvas,
      mats: {
        desk: new MeshStandardMaterial({ color: '#2c3450', roughness: 0.5, metalness: 0.2 }),
        body: new MeshStandardMaterial({ color: '#262d44', roughness: 0.4, metalness: 0.45 }),
        key: new MeshStandardMaterial({ color: '#3a4366', roughness: 0.55, metalness: 0.15 }),
        accent: new MeshStandardMaterial({ color: '#69D9E8', emissive: '#69D9E8', emissiveIntensity: 1.6 }),
        violet: new MeshStandardMaterial({ color: '#9B7BFF', emissive: '#9B7BFF', emissiveIntensity: 1.2 }),
      },
    };
  }, []);
  useEffect(
    () => () => {
      tex.dispose();
      Object.values(mats).forEach((m) => m.dispose());
      screen.width = 0; // release the backing store
    },
    [tex, mats, screen],
  );

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
    const tx = fine && animate ? pointer.current.x * 0.07 : 0;
    const ty = fine && animate ? pointer.current.y * 0.025 : 0;
    g.rotation.y += (tx - g.rotation.y) * 0.08;
    g.rotation.x += (ty - g.rotation.x) * 0.08;
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
      <FitCamera target={TARGET} dir={DIR} width={5.6} height={3.35} />
      <hemisphereLight args={['#aab6ee', '#141a2c', 1.1]} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} color="#e6ebff" />
      <directionalLight position={[-4, 3, 2]} intensity={0.9} color="#b9a8ff" />
      <pointLight position={[-3, 2.4, 2]} intensity={30} color="#9B7BFF" distance={10} />
      <pointLight position={[3.2, 1.6, 1.8]} intensity={24} color="#69D9E8" distance={9} />
      <OrbitControls
        ref={controls}
        makeDefault
        enabled={fine}
        enablePan={false}
        enableZoom={false}
        enableDamping
        minAzimuthAngle={-0.55}
        maxAzimuthAngle={0.55}
        minPolarAngle={1.1}
        maxPolarAngle={1.55}
        onChange={() => invalidate()}
      />
      <group ref={group}>
        <Contours />
        {/* desk */}
        <mesh position={[0, -0.07, 0]} material={mats.desk}>
          <boxGeometry args={[5.2, 0.14, 2.5]} />
        </mesh>
        {[-2.35, 2.35].map((x) => (
          <mesh key={x} position={[x, -1.1, 0]} material={mats.body}>
            <boxGeometry args={[0.1, 1.9, 2.2]} />
          </mesh>
        ))}
        {/* monitor */}
        <mesh position={[0, 0.03, -0.35]} material={mats.body}>
          <cylinderGeometry args={[0.55, 0.62, 0.06, 40]} />
        </mesh>
        <mesh position={[0, 0.5, -0.4]} material={mats.body}>
          <boxGeometry args={[0.16, 0.9, 0.08]} />
        </mesh>
        <mesh position={[0, 1.55, -0.3]} material={mats.body}>
          <boxGeometry args={[2.45, 1.45, 0.1]} />
        </mesh>
        <mesh position={[0, 1.55, -0.245]}>
          <planeGeometry args={[2.3, 1.29]} />
          <meshBasicMaterial map={tex} toneMapped={false} side={DoubleSide} />
        </mesh>
        <mesh position={[0, 0.82, -0.3]} material={mats.violet}>
          <boxGeometry args={[2.45, 0.012, 0.11]} />
        </mesh>
        {/* keyboard + mouse */}
        <group position={[-0.1, 0.0, 0.62]}>
          <mesh position={[0, 0.03, 0]} material={mats.body}>
            <boxGeometry args={[1.45, 0.06, 0.55]} />
          </mesh>
          <Keys mat={mats.key} />
        </group>
        <mesh position={[1.1, 0.045, 0.7]} scale={[0.55, 0.32, 0.9]} material={mats.body}>
          <sphereGeometry args={[0.12, 20, 14]} />
        </mesh>
        {/* compact computer */}
        <group position={[-2.0, 0, -0.35]}>
          <mesh position={[0, 0.58, 0]} material={mats.body}>
            <boxGeometry args={[0.5, 1.16, 0.9]} />
          </mesh>
          <mesh position={[0.262, 0.7, 0]} material={mats.accent}>
            <boxGeometry args={[0.012, 0.6, 0.05]} />
          </mesh>
          <mesh position={[0.262, 0.22, 0.25]} material={mats.violet}>
            <sphereGeometry args={[0.03, 12, 10]} />
          </mesh>
        </group>
        {/* notebook */}
        <mesh position={[1.95, 0.05, 0.25]} rotation={[0, -0.35, 0]} material={mats.key}>
          <boxGeometry args={[0.78, 0.1, 0.58]} />
        </mesh>
        <mesh position={[1.95, 0.105, 0.25]} rotation={[0, -0.35, 0]} material={mats.violet}>
          <boxGeometry args={[0.76, 0.012, 0.1]} />
        </mesh>
        <Chip overlay={overlay} href="#publications" position={[1.35, 2.5, -0.2]}>Publications</Chip>
        <Chip overlay={overlay} href={SCHOLAR_PROFILE_URL} external position={[1.95, 0.55, 0.25]}>Scholar</Chip>
        <Chip overlay={overlay} href={GITHUB_URL} external position={[-2.0, 1.5, -0.35]}>GitHub</Chip>
      </group>
    </>
  );
}

export default function ResearchWorkstation({ active, animate, fine, onContextLost, resetKey, overlay }: Props) {
  return (
    <SceneCanvas active={active} animating={false} onContextLost={onContextLost} touchAction="pan-y">
      <Scene animate={animate} fine={fine} resetKey={resetKey} overlay={overlay} />
    </SceneCanvas>
  );
}
