import type { ReactNode } from 'react';

export type SceneKind = 'workstation' | 'earth' | 'system';

const ARIA: Record<SceneKind, string> = {
  workstation: 'Illustration of a research workstation: a monitor showing a dashboard on a desk, with violet contour lines behind it.',
  earth: 'Illustration of a dotted globe with a marker near Los Angeles and orbiting topic markers.',
  system: 'Illustration of a central Research sphere with five topic planets orbiting it, each with small publication nodes.',
};

function Contours() {
  return (
    <g fill="none" stroke="#9B7BFF" strokeOpacity="0.35" strokeWidth="1">
      {[70, 100, 130, 160, 190, 220].map((r, i) => (
        <ellipse key={r} cx="300" cy="190" rx={r * 1.5} ry={r * 0.78} strokeOpacity={0.5 - i * 0.06} />
      ))}
    </g>
  );
}

function Workstation() {
  return (
    <>
      <Contours />
      <rect x="150" y="262" width="300" height="12" rx="3" fill="#1b2133" stroke="#2b3450" />
      <rect x="165" y="274" width="8" height="40" fill="#151a28" />
      <rect x="427" y="274" width="8" height="40" fill="#151a28" />
      <rect x="205" y="112" width="190" height="124" rx="7" fill="#0d111c" stroke="#3a4468" strokeWidth="2" />
      <rect x="214" y="121" width="172" height="106" rx="3" fill="#0a0e18" />
      <rect x="224" y="131" width="60" height="6" rx="2" fill="#9B7BFF" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={226 + i * 22} y={206 - (14 + ((i * 17) % 40))} width="14" height={14 + ((i * 17) % 40)} rx="2" fill="#69D9E8" fillOpacity="0.75" />
      ))}
      <polyline points="296,200 316,176 336,188 360,152 376,160" fill="none" stroke="#9B7BFF" strokeWidth="2" />
      <rect x="289" y="236" width="22" height="20" fill="#151a28" />
      <rect x="270" y="254" width="60" height="8" rx="2" fill="#1b2133" />
      <rect x="236" y="276" width="104" height="12" rx="3" fill="#151a28" stroke="#2b3450" />
      <rect x="352" y="278" width="14" height="9" rx="4" fill="#151a28" stroke="#2b3450" />
      <rect x="402" y="226" width="34" height="36" rx="3" fill="#10141f" stroke="#2b3450" />
      <circle cx="419" cy="244" r="3" fill="#69D9E8" />
      <text x="300" y="172" textAnchor="middle" fontFamily="Georgia, serif" fontSize="22" fill="#F3F5FA" fillOpacity="0.9">MARC</text>
    </>
  );
}

function Earth() {
  const dots: ReactNode[] = [];
  for (let i = 0; i < 170; i++) {
    const a = (i * 137.5 * Math.PI) / 180;
    const r = 108 * Math.sqrt((i + 0.5) / 170);
    dots.push(<circle key={i} cx={300 + Math.cos(a) * r} cy={190 + Math.sin(a) * r} r="1.8" fill="#69D9E8" fillOpacity={0.35 + ((i * 7) % 5) * 0.1} />);
  }
  return (
    <>
      <circle cx="300" cy="190" r="112" fill="#0b1020" stroke="#2b3450" strokeWidth="2" />
      <circle cx="300" cy="190" r="124" fill="none" stroke="#69D9E8" strokeOpacity="0.18" strokeWidth="6" />
      {dots}
      <ellipse cx="300" cy="190" rx="170" ry="44" fill="none" stroke="#9B7BFF" strokeOpacity="0.5" transform="rotate(-18 300 190)" />
      <circle cx="262" cy="170" r="5" fill="#9B7BFF" />
      <circle cx="456" cy="140" r="5" fill="#69D9E8" />
      <rect x="126" y="212" width="9" height="9" fill="#F3F5FA" fillOpacity="0.8" transform="rotate(45 130 216)" />
    </>
  );
}

function System() {
  return (
    <>
      {[60, 100, 140, 180].map((r) => (
        <ellipse key={r} cx="300" cy="190" rx={r * 1.45} ry={r * 0.7} fill="none" stroke="#2b3450" />
      ))}
      <circle cx="300" cy="190" r="22" fill="#9B7BFF" fillOpacity="0.85" />
      <text x="300" y="194" textAnchor="middle" fontSize="9" fill="#070910" fontFamily="sans-serif">Research</text>
      <circle cx="372" cy="150" r="10" fill="#69D9E8" />
      <rect x="222" y="90" width="18" height="18" fill="#F4A261" />
      <polygon points="214,236 226,214 238,236" fill="#E76F9A" />
      <circle cx="410" cy="232" r="9" fill="none" stroke="#9B7BFF" strokeWidth="3" />
      <polygon points="470,170 480,180 470,190 460,180" fill="#8BD17C" />
      {[[380, 136], [386, 160], [360, 158], [236, 100], [212, 98], [220, 224], [236, 232], [420, 220], [398, 240], [468, 156]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.2" fill="#F3F5FA" fillOpacity="0.8" />
      ))}
    </>
  );
}

export function SceneIllustration({ kind }: { kind: SceneKind }) {
  return (
    <svg viewBox="0 0 600 380" role="img" aria-label={ARIA[kind]} preserveAspectRatio="xMidYMid meet" className="scene-svg">
      <defs>
        <radialGradient id={`bg-${kind}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#151b30" />
          <stop offset="100%" stopColor="#070910" />
        </radialGradient>
      </defs>
      <rect width="600" height="380" fill={`url(#bg-${kind})`} />
      {kind === 'workstation' && <Workstation />}
      {kind === 'earth' && <Earth />}
      {kind === 'system' && <System />}
    </svg>
  );
}

export type FallbackReason = 'simple' | 'unsupported' | 'failed' | 'preview';

const MESSAGE: Record<FallbackReason, string | null> = {
  simple: 'Simple view is on. The interactive 3D scene is switched off; everything below stays available.',
  unsupported: 'Interactive 3D preview unavailable (WebGL is not supported here). All content and links remain available.',
  failed: 'The interactive 3D preview could not be started. All content and links remain available.',
  preview: null,
};

export function SceneFallback({ kind, reason, onRetry }: { kind: SceneKind; reason: FallbackReason; onRetry?: () => void }) {
  const msg = MESSAGE[reason];
  return (
    <div className="scene-fallback" data-reason={reason}>
      <SceneIllustration kind={kind} />
      {msg && (
        <p className="scene-note" role="status">
          {msg}
          {onRetry && reason === 'failed' && (
            <>
              {' '}
              <button type="button" className="link-btn" onClick={onRetry}>Try again</button>
            </>
          )}
        </p>
      )}
    </div>
  );
}
