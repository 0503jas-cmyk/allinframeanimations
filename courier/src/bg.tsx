import React from 'react';
import {C, rnd, W, H} from './theme';

export const Sky: React.FC<{top: string; bottom: string; h?: number}> = ({top, bottom, h = 760}) => (
  <g>
    <defs><linearGradient id={`sky${top}${bottom}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient></defs>
    <rect x={-200} y={-200} width={W + 400} height={h + 200} fill={`url(#sky${top}${bottom})`} />
  </g>
);

export const Stars: React.FC<{n?: number; t?: number}> = ({n = 70, t = 0}) => (
  <g>{Array.from({length: n}).map((_, i) => <circle key={i} cx={rnd(i) * W} cy={rnd(i + 99) * 420} r={1 + rnd(i + 7) * 2} fill="#fff" opacity={0.4 + 0.5 * Math.abs(Math.sin(t * 1.3 + i))} />)}</g>
);

/** tiled skyline layer; scroll in px (leftwards) */
export const Skyline: React.FC<{scroll: number; base: number; color: string; seed?: number; hMin?: number; hMax?: number; win?: string; lit?: number; wMin?: number}> = ({scroll, base, color, seed = 1, hMin = 160, hMax = 420, win = '#ffcf70', lit = 0.25, wMin = 90}) => {
  const tile = W * 2;
  const blds: {x: number; w: number; h: number}[] = [];
  let x = 0, i = 0;
  while (x < tile) { const w = wMin + rnd(seed + i) * 110, h = hMin + rnd(seed + i + 50) * (hMax - hMin); blds.push({x, w, h}); x += w + rnd(seed + i + 9) * 14; i++; }
  const off = ((scroll % tile) + tile) % tile;
  const draw = (dx: number) => (
    <g transform={`translate(${dx} 0)`}>
      {blds.map((b, k) => (
        <g key={k}>
          <rect x={b.x} y={base - b.h} width={b.w} height={b.h + 400} fill={color} />
          {Array.from({length: Math.floor(b.h / 46)}).map((_, r) => Array.from({length: Math.floor(b.w / 34)}).map((__, c) => rnd(seed + k * 31 + r * 7 + c) < lit ? <rect key={`${r}-${c}`} x={b.x + 10 + c * 34} y={base - b.h + 14 + r * 46} width={14} height={20} fill={win} opacity={0.85} /> : null))}
        </g>
      ))}
    </g>
  );
  return <g>{draw(-off)}{draw(-off + tile)}</g>;
};

export const Road: React.FC<{scroll: number; y: number; h?: number; color?: string; line?: string}> = ({scroll, y, h = 340, color = '#171c2e', line = '#e8e2c8'}) => {
  const dash = 220, off = ((scroll * 1) % dash + dash) % dash;
  return (
    <g>
      <rect x={-100} y={y} width={W + 200} height={h} fill={color} />
      <rect x={-100} y={y} width={W + 200} height={10} fill="#2a3150" />
      {Array.from({length: 12}).map((_, i) => <rect key={i} x={-off + i * dash - 120} y={y + h * 0.5} width={120} height={12} fill={line} opacity={0.85} />)}
    </g>
  );
};

export const Fog: React.FC<{y: number; t: number; op?: number; color?: string}> = ({y, t, op = 0.25, color = '#9fb4c8'}) => (
  <g opacity={op}>{[0, 1, 2].map((i) => <ellipse key={i} cx={((t * (30 + i * 12) + i * 700) % (W + 800)) - 400} cy={y + i * 40} rx={520} ry={70} fill={color} />)}</g>
);

export const SpeedLines: React.FC<{t: number; n?: number; op?: number}> = ({t, n = 16, op = 0.35}) => (
  <g opacity={op}>{Array.from({length: n}).map((_, i) => { const x = ((rnd(i) * W * 1.4 - t * (1200 + rnd(i + 3) * 800)) % (W * 1.4) + W * 1.4) % (W * 1.4) - 200; const y = 120 + rnd(i + 5) * 760; return <rect key={i} x={x} y={y} width={180 + rnd(i + 9) * 260} height={3} rx={2} fill="#fff" />; })}</g>
);

export const Lamp: React.FC<{x: number; y: number; r?: number; col?: string; op?: number}> = ({x, y, r = 200, col = '#ffb347', op = 0.35}) => (
  <g>
    <defs><radialGradient id={`lg${x}${y}`}><stop offset="0" stopColor={col} stopOpacity={op} /><stop offset="1" stopColor={col} stopOpacity={0} /></radialGradient></defs>
    <circle cx={x} cy={y} r={r} fill={`url(#lg${x}${y})`} />
    <circle cx={x} cy={y} r={r * 0.07} fill="#fff4cf" />
  </g>
);

export const Hill: React.FC<{y: number; color: string; seed?: number}> = ({y, color, seed = 3}) => {
  let d = `M-100 ${H + 100} L-100 ${y}`;
  for (let i = 0; i <= 14; i++) d += ` L${-100 + i * 150} ${y - 40 - rnd(seed + i) * 90}`;
  return <path d={d + ` L${W + 100} ${H + 100}Z`} fill={color} />;
};

export const Grid: React.FC<{y0: number; color?: string}> = ({y0, color = '#1b2440'}) => (
  <g stroke={color} strokeWidth={3}>{Array.from({length: 9}).map((_, i) => <line key={i} x1={-100} y1={y0 + i * 60} x2={W + 100} y2={y0 + i * 60} />)}</g>
);
