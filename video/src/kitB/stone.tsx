import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT, P, clamp01, easeInOut, easeOut, hash, lerp, prog, rgba} from '../kit';

const useT = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return f / fps;
};

/** Rock texture: gradient slab + hairline cracks + speckles. Fills a w*h box at 0,0 (cheap: 3 paths). */
export const RockBase: React.FC<{w: number; h: number; seed?: number; rim?: string; scroll?: number}> = ({w, h, seed = 1, rim = P.teal, scroll = 0}) => {
  const {cracks, dots} = useMemo(() => {
    let c = '';
    for (let i = 0; i < 26; i++) {
      let x = hash(i * 3 + seed) * w;
      let y = hash(i * 7 + seed) * h;
      c += `M${x.toFixed(0)} ${y.toFixed(0)}`;
      for (let k = 0; k < 5; k++) {
        x += (hash(i * 13 + k * 5 + seed) - 0.5) * 120;
        y += hash(i * 17 + k * 3 + seed) * 70;
        c += `L${x.toFixed(0)} ${y.toFixed(0)}`;
      }
    }
    let d = '';
    for (let i = 0; i < 160; i++) d += `M${(hash(i * 2.1 + seed) * w).toFixed(0)} ${(hash(i * 4.3 + seed) * h).toFixed(0)}h${1 + Math.floor(hash(i) * 3)}`;
    return {cracks: c, dots: d};
  }, [w, h, seed]);
  return (
    <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <linearGradient id={`rk${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2e4268" />
          <stop offset="0.5" stopColor="#1b2a4a" />
          <stop offset="1" stopColor="#111b33" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#rk${seed})`} />
      <g transform={`translate(${-scroll * 0.0},0)`}>
        <path d={cracks} stroke={rgba(P.ink0, 0.7)} strokeWidth={2} fill="none" />
        <path d={dots} stroke={rgba(P.ink4, 0.55)} strokeWidth={3} strokeLinecap="round" />
      </g>
      <rect width={w} height={5} fill={rgba(rim, 0.22)} />
    </svg>
  );
};

const ROWS = 41;
const roman = (n: number) => String(n);

/**
 * The Drowning Stone face: 41 ruled rows of short cut strokes (one dashed path per row, two copies for relief).
 * `rowsLit` brightens rows 1..n (amber when being counted); `last` = fraction of the newest row that is cut (0..1).
 */
export const SLAB = 'M170 90 L420 40 L980 56 L1500 34 L1760 110 L1790 520 L1750 1010 L1500 1056 L900 1040 L380 1060 L190 990 L150 500 Z';
export const StoneFace: React.FC<{rowsLit?: number; last?: number; x?: number; y?: number; opacity?: number; label?: boolean}> = ({rowsLit = 0, last = 0.8, x = 0, y = 0, opacity = 1, label = true}) => {
  const x0 = 330, x1 = 1680, r0 = 130, dy = 21.2;
  const rows = Array.from({length: ROWS}, (_, i) => {
    const yy = r0 + i * dy;
    const f = i === ROWS - 1 ? last : 1;
    return {yy, ex: x0 + (x1 - x0) * f, lit: clamp01(rowsLit - i)};
  });
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 1920, height: 1080, opacity, background: `radial-gradient(ellipse 70% 70% at 50% 50%, #0b1426, ${P.ink0})`}}>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <clipPath id="slabclip"><path d={SLAB} /></clipPath>
          <linearGradient id="slabg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#35496e" />
            <stop offset="0.45" stopColor="#1f2e4d" />
            <stop offset="1" stopColor="#111b33" />
          </linearGradient>
          <radialGradient id="slabl" cx="0.78" cy="0.12" r="0.8">
            <stop offset="0" stopColor={P.bone} stopOpacity="0.20" />
            <stop offset="0.5" stopColor={P.teal} stopOpacity="0.05" />
            <stop offset="1" stopColor={P.ink0} stopOpacity="0.4" />
          </radialGradient>
        </defs>
        <path d={SLAB} fill="url(#slabg)" />
        <g clipPath="url(#slabclip)">
          <path d={SLAB} fill="url(#slabl)" />
          <RockInner />
          <path d={`M300 70V${r0 + ROWS * dy}`} stroke={rgba(P.ink0, 0.8)} strokeWidth={3} />
          <path d={`M308 70V${r0 + ROWS * dy}`} stroke={rgba(P.bone, 0.3)} strokeWidth={1.5} />
          {rows.map((r, i) => (
            <g key={i}>
              <path d={`M${x0} ${r.yy}H${r.ex}`} stroke={rgba(P.ink0, 0.9)} strokeWidth={13} strokeDasharray="2.6 4.0" />
              <path d={`M${x0 + 1} ${r.yy + 1.4}H${r.ex + 1}`} stroke={r.lit > 0 ? P.amberHot : P.bone} strokeOpacity={0.30 + 0.6 * r.lit} strokeWidth={11} strokeDasharray="1.6 5.0" />
              {label && (
                <text x={286} y={r.yy + 5} textAnchor="end" fontFamily={FONT.accent} fontSize={15} fill={r.lit > 0 ? P.amber : P.bone} opacity={0.4 + 0.55 * r.lit}>
                  {roman(i + 1)}
                </text>
              )}
            </g>
          ))}
        </g>
        <path d="M420 40 L980 56 L1500 34 L1760 110" stroke={rgba(P.teal, 0.45)} strokeWidth={3} fill="none" />
        <path d="M170 90 L420 40" stroke={rgba(P.bone, 0.4)} strokeWidth={3} fill="none" />
        <path d="M150 500 L190 990 L380 1060" stroke={rgba(P.ink0, 0.9)} strokeWidth={5} fill="none" />
      </svg>
    </div>
  );
};

const RockInner: React.FC = () => {
  const {cracks, dots} = useMemo(() => {
    let c = '';
    for (let i = 0; i < 22; i++) {
      let x = 200 + hash(i * 3 + 5) * 1600;
      let y = 60 + hash(i * 7 + 5) * 600;
      c += `M${x.toFixed(0)} ${y.toFixed(0)}`;
      for (let k = 0; k < 5; k++) {
        x += (hash(i * 13 + k * 5) - 0.5) * 90;
        y += hash(i * 17 + k * 3) * 60;
        c += `L${x.toFixed(0)} ${y.toFixed(0)}`;
      }
    }
    let d = '';
    for (let i = 0; i < 220; i++) d += `M${(180 + hash(i * 2.1) * 1600).toFixed(0)} ${(60 + hash(i * 4.3) * 1000).toFixed(0)}h${1 + Math.floor(hash(i) * 3)}`;
    return {cracks: c, dots: d};
  }, []);
  return (
    <>
      <path d={cracks} stroke={rgba(P.ink0, 0.55)} strokeWidth={2} fill="none" />
      <path d={dots} stroke={rgba(P.bone, 0.16)} strokeWidth={3} strokeLinecap="round" />
    </>
  );
};

/** Macro of the newest rows: big strokes a thumb apart. scroll = px; ticks drawn only when visible. */
export const TickMacro: React.FC<{scroll: number; lastIdx: number; rowsY?: number[]; spacing?: number; height?: number; ring?: number; stroke?: number; strokeProg?: number; strokeIdx?: number}> = ({
  scroll,
  lastIdx,
  rowsY = [250, 540, 830],
  spacing = 64,
  height = 150,
  ring = 0,
  stroke,
  strokeProg = 0,
  strokeIdx,
}) => {
  const t = useT();
  const iMin = Math.floor((scroll - 120) / spacing);
  const iMax = Math.ceil((scroll + 2050) / spacing);
  const paths: string[] = [];
  const hi: string[] = [];
  rowsY.forEach((ry, r) => {
    let d = '';
    let h2 = '';
    const lim = r === rowsY.length - 1 ? lastIdx : 999999;
    for (let i = Math.max(0, iMin); i <= iMax; i++) {
      if (i > lim) break;
      const x = i * spacing - scroll + (hash(i * 3 + r) - 0.5) * 8;
      const yy = ry + (hash(i * 5 + r * 9) - 0.5) * 14;
      const hh = height * (0.9 + hash(i * 7 + r) * 0.2);
      const lean = (hash(i * 11 + r) - 0.5) * 10;
      d += `M${x.toFixed(1)} ${(yy - hh / 2).toFixed(1)}l${lean.toFixed(1)} ${hh.toFixed(1)}`;
      h2 += `M${(x + 5).toFixed(1)} ${(yy - hh / 2 + 3).toFixed(1)}l${lean.toFixed(1)} ${hh.toFixed(1)}`;
    }
    paths.push(d);
    hi.push(h2);
  });
  const lx = (lastIdx + 1) * spacing - scroll;
  const ly = rowsY[rowsY.length - 1];
  const pulse = 0.5 + 0.5 * Math.sin(t * 3);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        {rowsY.map((ry, r) => (
          <g key={r}>
            <path d={`M-20 ${ry + height * 0.62}H1940`} stroke={rgba(P.ink0, 0.5)} strokeWidth={2} />
            <path d={paths[r]} stroke={rgba(P.ink0, 0.95)} strokeWidth={17} strokeLinecap="round" />
            <path d={hi[r]} stroke={P.boneDim} strokeOpacity={0.5} strokeWidth={4} strokeLinecap="round" />
          </g>
        ))}
        {/* the smooth place */}
        <ellipse cx={lx} cy={ly} rx={26} ry={height * 0.55} fill={rgba(P.ink4, 0.22)} />
        {ring > 0 && <ellipse cx={lx} cy={ly} rx={58 + 8 * pulse} ry={height * 0.62 + 8 * pulse} fill="none" stroke={P.amber} strokeWidth={4} opacity={ring} strokeDasharray="14 9" />}
        {strokeIdx !== undefined && strokeProg > 0 && (() => {
          const sx = (strokeIdx) * spacing - scroll;
          return (
            <g>
              <path d={`M${sx - 16} ${ly - height / 2} L${sx - 16 + 22 * strokeProg} ${ly - height / 2 + height * strokeProg}`} stroke={rgba(P.ink0, 0.95)} strokeWidth={17} strokeLinecap="round" />
              <path d={`M${sx - 11} ${ly - height / 2 + 3} L${sx - 11 + 22 * strokeProg} ${ly - height / 2 + 3 + height * strokeProg}`} stroke={P.amberHot} strokeOpacity={0.7} strokeWidth={4} strokeLinecap="round" />
            </g>
          );
        })()}
      </svg>
    </AbsoluteFill>
  );
};

/** Vertical rope macro, centre x, width w. Three amber passes polish the sea-side (right) band. */
export const RopeMacro: React.FC<{x?: number; w?: number; passes?: [number, number, number]; wearFull?: number; sway?: number; dark?: boolean}> = ({x = 960, w = 230, passes = [0, 0, 0], wearFull = 0, sway = 0, dark = false}) => {
  const t = useT();
  const pitch = 62;
  const off = (t * 0) % pitch;
  const strands = useMemo(() => Array.from({length: 20}, (_, i) => i), []);
  const bx = x + w * 0.12;
  const bw = w * 0.38;
  const rope = (
    <>
      {strands.map((i) => {
        const y = -pitch + i * pitch + off;
        const xl = x - w / 2 + 22, xr = x + w / 2 - 22;
        return (
          <g key={i}>
            <path d={`M${xl} ${y + 70}Q${x} ${y + 20} ${xr} ${y - 22}`} stroke="#5b3513" strokeWidth={58} strokeLinecap="round" fill="none" />
            <path d={`M${xl} ${y + 62}Q${x} ${y + 12} ${xr} ${y - 30}`} stroke="#a06a2c" strokeWidth={30} strokeLinecap="round" fill="none" opacity={0.85} />
            <path d={`M${xl + 8} ${y + 54}Q${x} ${y + 6} ${xr - 8} ${y - 36}`} stroke="#e0a458" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.55} strokeDasharray="14 10" />
          </g>
        );
      })}
    </>
  );
  const p = (n: number) => easeInOut(clamp01(passes[n]));
  const pass = (n: number) => {
    const hh = 1080 * p(n);
    return (
      <g key={n}>
        <clipPath id={`rp${n}`}>
          <rect x={bx} y={0} width={bw} height={hh} />
        </clipPath>
        <g clipPath={`url(#rp${n})`}>
          <rect x={bx} y={0} width={bw} height={1080} fill="#d79a52" opacity={0.3} />
          {Array.from({length: 11}, (_, k) => (
            <path key={k} d={`M${bx + k * (bw / 10) - 12} 0V1080`} stroke={P.amberHot} strokeWidth={2.5} opacity={0.22} />
          ))}
        </g>
        {p(n) > 0 && p(n) < 1 && <rect x={bx - 6} y={hh - 3} width={bw + 12} height={6} fill={P.amberHot} opacity={0.8} />}
      </g>
    );
  };
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      <g transform={`rotate(${sway} ${x} 540)`}>
        <clipPath id="ropeclip">
          <rect x={x - w / 2} y={-10} width={w} height={1100} rx={26} />
        </clipPath>
        <g clipPath="url(#ropeclip)" opacity={dark ? 0.75 : 1}>
          {rope}
          {[0, 1, 2].map(pass)}
          {wearFull > 0 && <rect x={bx} y={0} width={bw} height={1080} fill="#e6b06a" opacity={0.25 * wearFull} />}
          <rect x={x - w / 2} y={0} width={w * 0.45} height={1080} fill={rgba(P.ink0, 0.28)} />
        </g>
        <path d={`M${x - w / 2} 0V1080`} stroke={rgba(P.ink0, 0.9)} strokeWidth={5} />
        <path d={`M${x + w / 2} 0V1080`} stroke={rgba(P.teal, 0.35)} strokeWidth={3} />
      </g>
    </svg>
  );
};

/** Left hand, palm toward camera, thumb on the left, fingers up. open 0..1 (1 = flat), close 0..1 curls fingers left across the rope. */
export const LeftHand: React.FC<{x: number; y: number; close?: number; scale?: number; glow?: number}> = ({x, y, close = 0, scale = 1, glow = 0}) => {
  const c = easeInOut(clamp01(close));
  const fingers = [
    {ox: -52, len: 150},
    {ox: -18, len: 168},
    {ox: 16, len: 158},
    {ox: 50, len: 126},
  ];
  return (
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
      <defs>
        <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b4a52" />
          <stop offset="1" stopColor="#241d2a" />
        </linearGradient>
      </defs>
      <g transform={`translate(${x},${y}) scale(${scale})`}>
        {/* palm */}
        <path d="M-76 40 Q-84 -40 -64 -70 L64 -70 Q86 -30 70 50 Q40 110 -20 112 Q-64 100 -76 40Z" fill="url(#skin)" />
        {/* fingers: segment 1 up (shortens when closing), segment 2 curls to the left */}
        {fingers.map((f, i) => {
          const seg1 = f.len * 0.55 * (1 - 0.15 * c);
          const seg2 = f.len * 0.5;
          const ang = -c * (105 + i * 5); // degrees, negative = curls toward left
          const ty = -70 - seg1;
          const a = (ang * Math.PI) / 180;
          const ex = f.ox + Math.sin(a) * seg2;
          const ey = ty - Math.cos(a) * seg2;
          return (
            <g key={i}>
              <path d={`M${f.ox} -66L${f.ox} ${ty}L${ex} ${ey}`} stroke="#43384a" strokeWidth={31} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d={`M${f.ox + 11} -66L${f.ox + 11} ${ty}`} stroke={rgba(P.amber, 0.5)} strokeWidth={2.4} strokeLinecap="round" fill="none" />
            </g>
          );
        })}
        {/* thumb, on the left */}
        <path d={`M-62 20L${-120 + 20 * c} ${-30 - 30 * c}L${-130 + 30 * c} ${-100 - 10 * c}`} stroke="#43384a" strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M-70 40 Q-84 -40 -64 -70" stroke={rgba(P.amber, 0.5)} strokeWidth={2.4} fill="none" />
        {/* cuff */}
        <path d="M-60 112 L60 112 L74 220 L-74 220Z" fill="#1a1626" />
        <path d="M-60 112 H60" stroke="#2d2638" strokeWidth={8} />
      </g>
    </svg>
  );
};
export {easeOut, lerp, prog};
