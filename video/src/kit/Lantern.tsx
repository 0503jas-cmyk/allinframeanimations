import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {P, noise, rgba} from './theme';

/** flicker 0.8..1.15, deterministic */
export const flicker = (t: number, seed = 0) => 1 + 0.07 * Math.sin(t * 9.1 + seed) + 0.05 * Math.sin(t * 15.7 + seed * 2.3) + 0.06 * noise(seed + 3, t * 7);

export type LanternProps = {
  x: number;
  y: number;
  scale?: number;
  /** glow radius of the soft light in px (before scale) */
  glow?: number;
  lit?: boolean | number; // 0..1
  seed?: number;
  /** hanging on a post (adds hook and rope) */
  hang?: boolean;
  /** glow as separate element only (no body) */
  glowOnly?: boolean;
};

/** Lantern body (cage + flame) with a two-gradient flickering glow. No blur. Coordinates are absolute in the 1920x1080 frame. */
export const Lantern: React.FC<LanternProps> = ({x, y, scale = 1, glow = 260, lit = true, seed = 0, hang = false, glowOnly = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const on = typeof lit === 'number' ? lit : lit ? 1 : 0;
  const f = flicker(t, seed) * on;
  const R = glow * scale * (0.9 + 0.12 * f);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, pointerEvents: 'none'}}>
      {/* wide falloff + warm core: two gradients, 2 nodes */}
      <div
        style={{
          position: 'absolute',
          left: -R * 1.9,
          top: -R * 1.9,
          width: R * 3.8,
          height: R * 3.8,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${rgba(P.amber, 0.30 * f)} 0%, ${rgba(P.amberDeep, 0.12 * f)} 28%, ${rgba(P.amberDeep, 0.035 * f)} 55%, rgba(0,0,0,0) 72%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -R * 0.55,
          top: -R * 0.55,
          width: R * 1.1,
          height: R * 1.1,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${rgba(P.amberHot, 0.55 * f)} 0%, ${rgba(P.amber, 0.25 * f)} 35%, rgba(255,179,71,0) 70%)`,
        }}
      />
      {!glowOnly && (
        <svg width={120} height={160} viewBox="-60 -80 120 160" style={{position: 'absolute', left: -60, top: -80, transform: `scale(${scale})`, transformOrigin: '60px 80px', overflow: 'visible'}}>
          {hang && <path d="M0 -80 L0 -42" stroke={P.amberDeep} strokeWidth={3} />}
          <path d="M-14 -44 Q0 -62 14 -44" fill="none" stroke={P.ink0} strokeWidth={5} strokeLinecap="round" />
          <path d="M-18 -40 L18 -40 L22 -34 L-22 -34 Z" fill={P.ink0} />
          <path d="M-20 -34 L20 -34 L16 22 L-16 22 Z" fill={rgba(P.amber, 0.22 + 0.5 * on)} />
          <ellipse cx={0} cy={2} rx={7.5 * (0.9 + 0.1 * f)} ry={13 * (0.88 + 0.12 * f)} fill={P.amberHot} opacity={0.35 + 0.65 * on} />
          <ellipse cx={0} cy={5} rx={3.4} ry={7} fill="#fff4cf" opacity={on} />
          <path d="M-20 -34 L-16 22 M20 -34 L16 22 M0 -34 L0 22" stroke={P.ink0} strokeWidth={3} />
          <path d="M-18 22 L18 22 L14 30 L-14 30 Z" fill={P.ink0} />
        </svg>
      )}
    </div>
  );
};
