import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {P, rgba, W, H} from './theme';

export type WaterLayer = {
  y: number; // mean surface y (px)
  amp?: number;
  wavelength?: number;
  speed?: number; // px/sec phase travel (+right / -left)
  fill?: string; // top colour
  fillBottom?: string; // bottom colour
  opacity?: number;
  foam?: boolean;
  /** second sine amplitude ratio for irregularity */
  chop?: number;
  /** x-offset for parallax (set by caller from camera) */
  dx?: number;
};

export const DEFAULT_WATER: WaterLayer[] = [
  {y: 760, amp: 6, wavelength: 520, speed: 14, fill: P.ink3, fillBottom: P.ink2, opacity: 1},
  {y: 810, amp: 9, wavelength: 410, speed: -22, fill: P.ink2, fillBottom: P.ink1, opacity: 1, foam: true},
  {y: 880, amp: 12, wavelength: 330, speed: 30, fill: '#0d1a36', fillBottom: P.ink0, opacity: 1},
  {y: 980, amp: 16, wavelength: 260, speed: -38, fill: P.ink1, fillBottom: P.ink0, opacity: 1},
];

export type Reflection = {x: number; color?: string; length?: number; width?: number};

export type WaterProps = {
  layers?: WaterLayer[];
  /** raises/lowers the whole water body, -1..1 -> -150..+150 px (positive = rising tide) */
  tide?: number;
  reflections?: Reflection[];
  /** y at which reflections start */
  reflectFrom?: number;
  width?: number;
  height?: number;
  step?: number;
};

const surface = (l: WaterLayer, x: number, t: number, off: number) => {
  const wl = l.wavelength ?? 400;
  const ph = (l.speed ?? 20) * t;
  const k = (2 * Math.PI) / wl;
  return off + l.y + (l.amp ?? 8) * (Math.sin((x - ph) * k) + (l.chop ?? 0.45) * Math.sin((x * 1.9 + ph * 0.7) * k + 1.3));
};

/** 3-6 water bodies, each ONE <path> from two summed sines (step 16px); foam = dashed teal stroke; reflection streaks. No filters. */
export const WaterLayers: React.FC<WaterProps> = ({layers = DEFAULT_WATER, tide = 0, reflections = [], reflectFrom, width = W, height = H, step = 16}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const off = -tide * 150;
  const paths = layers.map((l) => {
    let d = '';
    const dx = l.dx ?? 0;
    for (let x = -32; x <= width + 32; x += step) {
      const y = surface(l, x - dx, t, off);
      d += (d ? 'L' : 'M') + x + ' ' + y.toFixed(1);
    }
    return {top: d, fill: d + `L${width + 32} ${height + 10}L-32 ${height + 10}Z`};
  });
  const base = layers[0];
  const rf = reflectFrom ?? (base ? base.y + off : 760);
  return (
    <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
      <defs>
        {layers.map((l, i) => (
          <linearGradient key={i} id={`wl${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={l.fill ?? P.ink2} />
            <stop offset="1" stopColor={l.fillBottom ?? P.ink1} />
          </linearGradient>
        ))}
        <linearGradient id="refl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.amber} stopOpacity="0.55" />
          <stop offset="1" stopColor={P.amber} stopOpacity="0" />
        </linearGradient>
      </defs>
      {layers.map((l, i) => (
        <g key={i} opacity={l.opacity ?? 1}>
          <path d={paths[i].fill} fill={`url(#wl${i})`} />
          {l.foam && <path d={paths[i].top} fill="none" stroke={P.teal} strokeWidth={2} strokeDasharray="38 60" strokeDashoffset={-t * 40} opacity={0.5} strokeLinecap="round" />}
          <path d={paths[i].top} fill="none" stroke={rgba(P.teal, 0.28)} strokeWidth={1.5} />
        </g>
      ))}
      {reflections.map((r, k) => {
              const len = r.length ?? 220;
              const w = r.width ?? 16;
              return (
                <g key={k}>
                  {Array.from({length: 9}, (_, j) => {
                    const yy = rf + 10 + j * (len / 9);
                    const sx = Math.sin(t * 1.7 + j * 0.9 + k) * (3 + j * 1.6);
                    const ww = w * (0.45 + j * 0.14);
                    return <rect key={j} x={r.x + sx - ww / 2} y={yy} width={ww} height={len / 9 - 6} rx={2} fill={r.color ?? P.amber} opacity={0.55 * (1 - j / 10)} />;
                  })}
                </g>
              );
            })}
    </svg>
  );
};
