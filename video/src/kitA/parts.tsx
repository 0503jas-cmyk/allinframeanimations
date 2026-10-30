import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {FONT, P, clamp01, easeInOut, easeOut, hash, noise, prog, rgba, useSec} from '../kit';

/** drifting dust motes lit by lamp light. Cheap: n absolute dots. */
export const Motes: React.FC<{n?: number; color?: string; x0?: number; y0?: number; w?: number; h?: number; seed?: number; opacity?: number; size?: number}> = ({n = 26, color = P.amberHot, x0 = 0, y0 = 0, w = 1920, h = 1080, seed = 1, opacity = 1, size = 3.2}) => {
  const t = useSec();
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity}}>
      {Array.from({length: n}, (_, i) => {
        const bx = hash(i * 3.1 + seed) * w;
        const by = hash(i * 5.7 + seed * 2) * h;
        const x = x0 + ((bx + t * (6 + hash(i) * 9) + noise(i + seed, t * 0.3) * 40) % w);
        const y = y0 + ((by - t * (4 + hash(i + 7) * 7) + h * 4) % h);
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (0.8 + hash(i + 3)) + i));
        return <circle key={i} cx={x} cy={y} r={size * (0.5 + hash(i + 11))} fill={color} opacity={0.5 * tw} />;
      })}
    </svg>
  );
};

/** screen-space light pool: dark everywhere except a warm circle of radius r (px) at (cx,cy) */
export const LightPool: React.FC<{r: number; cx?: number; cy?: number; warm?: number; dark?: number}> = ({r, cx = 960, cy = 560, warm = 0.2, dark = 0.96}) => {
  const R = Math.max(0, r);
  if (R <= 1) return <AbsoluteFill style={{background: P.ink0, pointerEvents: 'none'}} />;
  if (R > 2600) return null;
  const a = rgba('#050914', dark);
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(255,179,71,${warm}) 0, rgba(255,179,71,${warm * 0.35}) ${R * 0.55}px, rgba(255,179,71,0) ${R}px), radial-gradient(circle at ${cx}px ${cy}px, rgba(5,9,20,0) 0, rgba(5,9,20,0) ${R * 0.45}px, ${rgba('#050914', dark * 0.55)} ${R * 0.78}px, ${a} ${R}px)`,
      }}
    />
  );
};

/** paper rectangle in world coordinates (baked paper jpg, tiled vertically) */
export const PaperSheet: React.FC<{x: number; y: number; w: number; h: number; children?: React.ReactNode; shade?: number; rotate?: number; tileH?: number; style?: React.CSSProperties}> = ({x, y, w, h, children, shade = 90, rotate = 0, tileH, style}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: rotate ? `rotate(${rotate}deg)` : undefined, backgroundImage: `url(${staticFile('kit/paper.jpg')})`, backgroundSize: `${w}px ${tileH ?? Math.round((w * 1350) / 2400)}px`, backgroundRepeat: 'repeat-y', boxShadow: `inset 0 0 ${shade}px ${rgba('#6b5a3a', 0.5)}, 0 30px 80px ${rgba('#000', 0.6)}`, ...style}}>
    {children}
  </div>
);

/** hand-drawn vertical tally strokes written one after another */
export const Tally: React.FC<{x: number; y: number; n: number; start: number; end: number; h?: number; gap?: number; color?: string; width?: number; group?: number}> = ({x, y, n, start, end, h = 46, gap = 15, color = P.penInk, width = 4, group = 5}) => {
  const t = useSec();
  const p = prog(t, start, end) * n;
  const els: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const lp = clamp01(p - i);
    if (lp <= 0) break;
    const gi = Math.floor(i / group);
    const k = i % group;
    const jx = (hash(i * 4.3) - 0.5) * 3;
    const jr = (hash(i * 8.1) - 0.5) * 0.12;
    const bx = x + gi * (group * gap + 24) + k * gap + jx;
    const d = k === group - 1 && group === 5
      ? `M${x + gi * (group * gap + 24) - 8} ${y - 6} L${x + gi * (group * gap + 24) + 4 * gap + 10} ${y - h + 8}`
      : `M${bx} ${y} L${bx + jr * h} ${y - h}`;
    els.push(<path key={i} d={d} pathLength={1} stroke={color} strokeWidth={width} strokeLinecap="round" fill="none" strokeDasharray={`${easeOut(lp)} 2`} />);
  }
  return <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}}>{els}</svg>;
};

/** big chalk-hand word: eases in with a slight rise and settle, optional fade out */
export const Chalk: React.FC<{text: string; x: number; y: number; size?: number; at: number; out?: number; color?: string; align?: 'left' | 'center'; opacity?: number; spacing?: number; font?: string; rise?: number}> = ({text, x, y, size = 120, at, out, color = P.bone, align = 'center', opacity = 0.9, spacing = 0.18, font = FONT.title, rise = 18}) => {
  const t = useSec();
  const i = easeOut(prog(t, at, at + 0.7));
  const o = out !== undefined ? 1 - easeInOut(prog(t, out, out + 0.7)) : 1;
  if (i <= 0 || o <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y - size * 0.8 + (1 - i) * rise,
        transform: align === 'center' ? 'translateX(-50%)' : undefined,
        whiteSpace: 'pre',
        fontFamily: font,
        fontSize: size,
        letterSpacing: `${spacing}em`,
        color,
        opacity: opacity * i * o,
        textShadow: `0 0 26px ${rgba(color, 0.18)}`,
      }}
    >
      {text}
    </div>
  );
};

/** two-tide dial: 24h-ish ring with two six-hour arcs drawn one after the other */
export const TwoTideDial: React.FC<{x: number; y: number; size?: number; start: number; dur?: number}> = ({x, y, size = 260, start, dur = 1.6}) => {
  const t = useSec();
  const polar = (deg: number, r: number) => [r * Math.sin((deg * Math.PI) / 180), -r * Math.cos((deg * Math.PI) / 180)];
  const arc = (a0: number, a1: number, r: number) => {
    const [x0, y0] = polar(a0, r);
    const [x1, y1] = polar(a1, r);
    return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  };
  const p1 = easeInOut(prog(t, start, start + dur));
  const p2 = easeInOut(prog(t, start + dur * 0.9, start + dur * 1.9));
  const hand = (prog(t, start, start + dur * 1.9)) * 360;
  const [hx, hy] = polar(hand, 74);
  const show = easeOut(prog(t, start - 0.5, start));
  return (
    <svg width={size} height={size} viewBox="-130 -130 260 260" style={{position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible', opacity: show}}>
      <circle r={118} fill={rgba(P.ink0, 0.85)} stroke={rgba(P.bone, 0.5)} strokeWidth={2} />
      <circle r={100} fill="none" stroke={rgba(P.ink3, 0.9)} strokeWidth={16} />
      <path d={arc(0, 168 * p1, 100)} fill="none" stroke={P.teal} strokeWidth={13} strokeLinecap="round" />
      <path d={arc(186, 186 + 168 * p2, 100)} fill="none" stroke={P.teal} strokeWidth={13} strokeLinecap="round" />
      {Array.from({length: 24}, (_, i) => {
        const [a, b] = polar(i * 15, 112), [c, d] = polar(i * 15, i % 6 === 0 ? 104 : 108);
        return <path key={i} d={`M${a} ${b}L${c} ${d}`} stroke={rgba(P.bone, 0.55)} strokeWidth={i % 6 === 0 ? 2.4 : 1.2} />;
      })}
      <path d={`M0 0L${hx} ${hy}`} stroke={P.bone} strokeWidth={3} strokeLinecap="round" />
      <circle r={5} fill={P.bone} />
      <text y={-34} textAnchor="middle" fontFamily={FONT.accent} fontSize={19} fill={rgba(P.bone, 0.7)}>TWICE A DAY</text>
      <text y={44} textAnchor="middle" fontFamily={FONT.hud} fontSize={10} letterSpacing={3} fill={rgba(P.bone, 0.5)}>SIX HOURS EACH</text>
    </svg>
  );
};

/** HUD wrapper that eases in (grows out of a point) */
export const GrowIn: React.FC<{at: number; from?: {x: number; y: number}; children: React.ReactNode; dur?: number}> = ({at, from = {x: 40, y: 60}, children, dur = 1.1}) => {
  const t = useSec();
  const p = easeOut(prog(t, at, at + dur));
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: p, transform: `translate(${(1 - p) * from.x * -1}px, ${(1 - p) * from.y}px) scale(${0.82 + 0.18 * p})`, transformOrigin: '0% 100%', pointerEvents: 'none'}}>{children}</div>
  );
};

/** expanding ripple rings from a point */
export const Ripples: React.FC<{x: number; y: number; at: number; n?: number; max?: number; dur?: number; color?: string; flat?: number; width?: number}> = ({x, y, at, n = 4, max = 420, dur = 3.2, color = P.teal, flat = 0.32, width = 2.5}) => {
  const t = useSec();
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {Array.from({length: n}, (_, i) => {
        const u = (t - at - i * 0.45) / dur;
        if (u < 0 || u > 1) return null;
        const r = 20 + max * easeOut(u);
        return <ellipse key={i} cx={x} cy={y} rx={r} ry={r * flat} fill="none" stroke={color} strokeWidth={width} opacity={0.6 * (1 - u)} />;
      })}
    </svg>
  );
};

/** piecewise eased curve through [t,value] points */
export const curve = (pts: [number, number][], t: number) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const u = easeInOut((t - pts[i - 1][0]) / Math.max(1e-6, pts[i][0] - pts[i - 1][0]));
      return pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u;
    }
  }
  return pts[pts.length - 1][1];
};
