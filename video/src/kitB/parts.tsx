import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bell, FONT, Layer, LedgerPage, P, Silhouette, Sky, clamp01, easeInOut, easeOut, hash, rgba, prog, mix} from '../kit';
import {flicker} from '../kit/Lantern';

const useT = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return f / fps;
};

export type SeaLayer = {y: number; amp?: number; wl?: number; speed?: number; top: string; bottom: string; foam?: boolean};
/** Flexible sine sea. `foam` colour null = no teal at all (flat memory grade). One path per layer. */
export const Sea: React.FC<{layers?: SeaLayer[]; tide?: number; foamColor?: string | null; width?: number; height?: number; step?: number; amberStreaks?: {x: number; len?: number; w?: number}[]; streakFrom?: number; calm?: number}> = ({
  layers,
  tide = 0,
  foamColor = P.teal,
  width = 2400,
  height = 1080,
  step = 24,
  amberStreaks = [],
  streakFrom,
  calm = 1,
}) => {
  const t = useT();
  const L: SeaLayer[] = layers ?? [
    {y: 760, amp: 6, wl: 520, speed: 14, top: P.ink4, bottom: P.ink3},
    {y: 812, amp: 9, wl: 410, speed: -22, top: P.ink3, bottom: P.ink2, foam: true},
    {y: 884, amp: 12, wl: 330, speed: 30, top: P.ink2, bottom: P.ink1},
    {y: 985, amp: 16, wl: 260, speed: -38, top: P.ink1, bottom: P.ink0},
  ];
  const off = -tide * 150;
  const ds = L.map((l) => {
    const k = (2 * Math.PI) / (l.wl ?? 400);
    const ph = (l.speed ?? 20) * t;
    let d = '';
    for (let x = -40; x <= width + 40; x += step) {
      const y = off + l.y + (l.amp ?? 8) * calm * (Math.sin((x - ph) * k) + 0.45 * Math.sin((x * 1.9 + ph * 0.7) * k + 1.3));
      d += (d ? 'L' : 'M') + x + ' ' + y.toFixed(1);
    }
    return d;
  });
  const sf = streakFrom ?? L[0].y + off;
  return (
    <svg width={width} height={height} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        {L.map((l, i) => (
          <linearGradient key={i} id={`sea${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={l.top} />
            <stop offset="1" stopColor={l.bottom} />
          </linearGradient>
        ))}
      </defs>
      {L.map((l, i) => (
        <g key={i}>
          <path d={ds[i] + `L${width + 40} ${height + 10}L-40 ${height + 10}Z`} fill={`url(#sea${i})`} />
          {foamColor && l.foam && <path d={ds[i]} fill="none" stroke={foamColor} strokeWidth={2} strokeDasharray="38 60" strokeDashoffset={-t * 40} opacity={0.5} strokeLinecap="round" />}
          {foamColor && <path d={ds[i]} fill="none" stroke={rgba(foamColor, 0.26)} strokeWidth={1.5} />}
          {!foamColor && <path d={ds[i]} fill="none" stroke={rgba(P.ink4, 0.5)} strokeWidth={1.5} />}
        </g>
      ))}
      {amberStreaks.map((r, k) =>
        Array.from({length: 14}, (_, j) => {
          const len = r.len ?? 180;
          const sx = Math.sin(t * 1.5 + j * 0.8 + k * 2) * (2 + j * 0.9);
          const ww = (r.w ?? 12) * (0.35 + 0.9 * Math.abs(Math.sin(j * 2.3 + k + t * 0.6)) + j * 0.05);
          return <rect key={k + '-' + j} x={r.x + sx - ww / 2} y={sf + 8 + j * (len / 14)} width={ww} height={3.2} rx={1.6} fill={P.amber} opacity={0.7 * (1 - j / 15)} />;
        }),
      )}
    </svg>
  );
};

/** Glow disc: a lamp seen from afar (one radial gradient div). */
export const LampDisc: React.FC<{x: number; y: number; r?: number; a?: number; seed?: number; color?: string}> = ({x, y, r = 34, a = 1, seed = 0, color = P.amber}) => {
  const t = useT();
  const f = flicker(t, seed) * a;
  return (
    <div style={{position: 'absolute', left: x - r * 2, top: y - r * 2, width: r * 4, height: r * 4, borderRadius: '50%', background: `radial-gradient(circle, ${rgba(P.amberHot, 0.95 * f)} 0%, ${rgba(color, 0.55 * f)} ${(r / (r * 2)) * 16}%, ${rgba(color, 0.14 * f)} 32%, rgba(0,0,0,0) 62%)`}} />
  );
};

export type DuskProps = {
  mood?: 'dusk' | 'calm';
  /** village windows lit (count) */
  lit?: number | number[];
  strikes?: number[];
  bellAmp?: number;
  tide?: number;
  foam?: string | null;
  /** number of shore lamp discs lit (0..9) */
  lamps?: number;
  stars?: number;
  /** extra lamp discs, absolute px in world */
  extra?: React.ReactNode;
  /** content in the causeway layer (walkers) */
  road?: React.ReactNode;
  /** content in the foreground layer, over the bell */
  fore?: React.ReactNode;
  calm?: number;
  postWear?: number;
  hideBell?: boolean;
  darken?: number;
  skyMood?: 'dusk' | 'calm' | 'tense';
  bellRings?: boolean;
};

export const POST = {x: 640, y: 790, size: 0.95};
export const LAMP_XS = [1130, 1250, 1370, 1480, 1590, 1690, 1790, 1880, 1990];

/** THE POST AT DUSK composition (shared by ch9 and the ch8 replay): post and bell centre-left, village lamps in a row on the right, sea behind. Wrap in <Camera>. */
export const Dusk: React.FC<DuskProps> = ({mood = 'dusk', lit = 6, strikes = [], bellAmp = 14, tide = 0, foam = P.teal, lamps = 7, stars = 50, extra, road, fore, calm = 1, postWear = 0, hideBell = false, darken = 0, skyMood, bellRings = true}) => {
  const t = useT();
  const sm = skyMood ?? (mood === 'dusk' ? 'dusk' : 'calm');
  return (
    <>
      <Layer depth={0.04} x={-60}>
        <Sky mood={sm} stars={stars} moon={false} clouds={3} horizon={700} seed={11} />
      </Layer>
      <Layer depth={0.18}>
        <div style={{position: 'absolute', left: -200, top: 560, width: 2600, height: 200, background: `linear-gradient(180deg, rgba(0,0,0,0), ${rgba(P.amberDeep, mood === 'dusk' ? 0.22 : 0.05)})`}} />
        <Silhouette kind="village" x={880} y={758} scale={0.62} fill="#060b18" lit={lit} seed={4} />
      </Layer>
      <Layer depth={0.5} x={-240}>
        <Sea
          tide={tide}
          foamColor={foam}
          calm={calm}
          streakFrom={772}
          amberStreaks={LAMP_XS.slice(0, lamps).map((x) => ({x: x + 240, len: 120 + hash(x) * 60, w: 9}))}
          layers={[
            {y: 760, amp: 6, wl: 520, speed: 14, top: mood === 'dusk' ? '#4a4f78' : P.ink4, bottom: P.ink3},
            {y: 812, amp: 9, wl: 410, speed: -22, top: P.ink3, bottom: P.ink2, foam: true},
            {y: 884, amp: 12, wl: 330, speed: 30, top: P.ink2, bottom: P.ink1},
            {y: 985, amp: 16, wl: 260, speed: -38, top: P.ink1, bottom: P.ink0},
          ]}
        />
      </Layer>
      <Layer depth={0.7}>
        <div style={{position: 'absolute', left: -400, top: 766, width: 1900, height: 20, background: 'linear-gradient(180deg,#5a6d94,#26365a)', borderRadius: 3}} />
        <div style={{position: 'absolute', left: -400, top: 786, width: 1900, height: 5, background: rgba(P.teal, 0.18)}} />
        {LAMP_XS.slice(0, lamps).map((x, i) => (
          <LampDisc key={i} x={x} y={744 + (i % 2) * 3} r={16} seed={i} a={0.9} />
        ))}
        {!hideBell && <Bell x={POST.x} y={POST.y} size={POST.size} strikes={strikes} amp={bellAmp} ropeWear={postWear} rings={bellRings} />}
        {extra}
        {road}
        {fore}
      </Layer>
      {darken > 0 && <AbsoluteFill style={{background: rgba(P.ink0, darken)}} />}
    </>
  );
};

/** Big chalk-type word that settles in (DejaVu Serif caps). */
export const ChalkWord: React.FC<{text: string; x: number; y: number; size?: number; start: number; end?: number; color?: string; align?: 'left' | 'center'; opacity?: number; fadeAt?: number; tracking?: number; font?: 'title' | 'accent'}> = ({text, x, y, size = 110, start, end, color = P.bone, align = 'center', opacity = 0.92, fadeAt, tracking = 0.18, font = 'title'}) => {
  const t = useT();
  const u = easeOut(prog(t, start, end ?? start + 0.7));
  if (u <= 0) return null;
  const out = fadeAt !== undefined ? 1 - easeInOut(prog(t, fadeAt, fadeAt + 0.6)) : 1;
  if (out <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${align === 'center' ? '-50%' : '0'}, ${(1 - u) * -26 - size * 0.5}px)`,
        fontFamily: font === 'title' ? FONT.title : FONT.accent,
        fontSize: size,
        letterSpacing: `${tracking}em`,
        color,
        opacity: opacity * u * out,
        whiteSpace: 'pre',
        textShadow: `0 0 40px ${rgba(P.ink0, 0.8)}`,
      }}
    >
      {text}
    </div>
  );
};

/** A ledger page in a scaled wrapper. Children live in page-local coordinates (1200x820 at scale 1). Column x: OUT 278, IN 748 (width 1200); row i baseline 176 + 74 i. */
export const PageSheet: React.FC<{x: number; y: number; scale?: number; rotate?: number; width?: number; height?: number; lamp?: {x: number; y: number}; opacity?: number; children?: React.ReactNode; torn?: boolean; title?: string}> = ({x, y, scale = 1, rotate = 0, width = 1200, height = 820, lamp, opacity = 1, children, torn, title}) => (
  <div style={{position: 'absolute', left: x, top: y, width, height, transform: `rotate(${rotate}deg) scale(${scale})`, transformOrigin: '0 0', opacity, willChange: 'transform'}}>
    <LedgerPage rows={[]} x={0} y={0} width={width} height={height} lamp={lamp} torn={torn} title={title} />
    {children}
  </div>
);
export const COL = {out: 278, in: 748, row: (i: number) => 176 + 74 * i};

export const Fade: React.FC<{from: number; to: number; color?: string; max?: number}> = ({from, to, color = P.ink0, max = 1}) => {
  const t = useT();
  const o = easeInOut(prog(t, from, to)) * max;
  if (o <= 0) return null;
  return <AbsoluteFill style={{background: color, opacity: o, pointerEvents: 'none'}} />;
};

/** soft pool of lamplight at a point (one gradient div) */
export const Pool: React.FC<{x: number; y: number; r: number; a?: number; color?: string}> = ({x, y, r, a = 0.3, color = P.amber}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle, ${rgba(color, a)} 0%, ${rgba(color, a * 0.4)} 40%, rgba(0,0,0,0) 70%)`, pointerEvents: 'none'}} />
);

export {mix, hash, clamp01, Silhouette};
export const useTime = useT;
