import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {P, rgba} from './theme';

export type BellProps = {
  /** strike times in seconds (composition time) */
  strikes?: number[];
  /** fixed angle (deg) overriding physics */
  swing?: number;
  /** peak swing in degrees for a strike */
  amp?: number;
  ropeWear?: number; // 0..1
  showRope?: boolean;
  /** centre-bottom of the post */
  x: number;
  y: number;
  size?: number; // scale
  /** macro: draw rope fibres large (for a camera push) */
  macro?: boolean;
  rings?: boolean;
};

const swingAt = (t: number, strikes: number[], amp: number) => {
  let a = 0;
  for (const s of strikes) {
    const dt = t - s;
    if (dt < 0) continue;
    a += amp * Math.exp(-0.7 * dt) * Math.cos(5.2 * dt + 0.0) * (dt < 0.08 ? dt / 0.08 : 1);
  }
  return a;
};

/** Bronze bell on a gibbet post. Pendulum = damped cosine; clapper lags by a second damped term. */
export const Bell: React.FC<BellProps> = ({strikes = [], swing, amp = 18, ropeWear = 0, showRope = true, x, y, size = 1, macro = false, rings = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const ang = swing ?? swingAt(t, strikes, amp);
  const clap = swing !== undefined ? -swing * 0.8 : swingAt(t - 0.12, strikes, amp * 1.5) * -1;
  const pivotX = 120, pivotY = -420;
  return (
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
      <defs>
        <linearGradient id="bellg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={P.amberDeep} />
          <stop offset="0.4" stopColor={P.amber} />
          <stop offset="0.7" stopColor={P.amberDeep} />
          <stop offset="1" stopColor="#6d3b10" />
        </linearGradient>
      </defs>
      <g transform={`translate(${x},${y}) scale(${size})`}>
        {/* post and arm */}
        <rect x={-16} y={-470} width={30} height={470} fill="#0a0f1e" />
        <path d="M-16 -470 H150 V-452 H-16Z" fill="#0a0f1e" />
        <path d="M-16 -380 L50 -452 H20 L-16 -410Z" fill="#0a0f1e" />
        <rect x={-34} y={-14} width={66} height={14} fill="#0a0f1e" />
        <path d="M-15 -470 V0" stroke={rgba(P.teal, 0.25)} strokeWidth={2} />
        {/* ring waves */}
        {rings &&
          strikes.map((s, si) => {
            const dt = t - s;
            if (dt < 0 || dt > 1.8) return null;
            return [0, 0.22, 0.44].map((d, k) => {
              const u = dt - d;
              if (u < 0) return null;
              const r = 70 + u * 260;
              return <circle key={si + '-' + k} cx={pivotX} cy={pivotY + 100} r={r} fill="none" stroke={P.teal} strokeWidth={3} opacity={Math.max(0, 0.55 * (1 - u / 1.4))} strokeDasharray="80 22" />;
            });
          })}
        {/* bell */}
        <g transform={`translate(${pivotX},${pivotY}) rotate(${ang})`}>
          <rect x={-8} y={-6} width={16} height={36} fill="#0a0f1e" />
          <path d="M-52 118 Q-52 40 -24 26 L24 26 Q52 40 52 118 L66 132 L-66 132Z" fill="url(#bellg)" />
          <path d="M-66 132 H66 V140 H-66Z" fill="#7a4513" />
          <path d="M-30 40 Q-40 80 -42 112" stroke={P.amberHot} strokeWidth={4} fill="none" opacity={0.55} strokeLinecap="round" />
          {ropeWear > 0 && <path d="M-6 8 L6 8" stroke={P.ink0} strokeWidth={3 + 5 * ropeWear} strokeLinecap="round" opacity={0.8} />}
          {/* clapper */}
          <g transform={`rotate(${clap * 0.7} 0 30)`}>
            <path d="M0 30 V130" stroke="#3a2008" strokeWidth={3} />
            <circle cx={0} cy={136} r={9} fill="#6d3b10" />
          </g>
        </g>
        {/* rope */}
        {showRope && (
          <g>
            <path d={`M${pivotX + 2} ${pivotY + 20} C${pivotX + 40} ${pivotY + 120} ${pivotX + 120} ${-200} ${pivotX + 160} ${-110}`} stroke={P.amberDeep} strokeWidth={macro ? 18 : 6} fill="none" strokeLinecap="round" strokeDasharray={macro ? '4 2' : undefined} />
            {ropeWear > 0 && <path d={`M${pivotX + 130} -165 C${pivotX + 148} -138 ${pivotX + 156} -122 ${pivotX + 160} -110`} stroke={P.amberHot} strokeWidth={(macro ? 18 : 6) * 0.45} fill="none" strokeLinecap="round" opacity={0.4 + 0.5 * ropeWear} />}
          </g>
        )}
      </g>
    </svg>
  );
};
