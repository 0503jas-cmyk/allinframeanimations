import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {P, hash, rgba, W, H} from './theme';

export type SkyMood = 'calm' | 'tense' | 'dawn' | 'dusk';

const MOODS: Record<SkyMood, [string, string, string]> = {
  calm: ['#050914', '#0c1731', '#1a2d57'],
  tense: ['#04070f', '#0a1020', '#18223f'],
  dawn: ['#14213f', '#3b4a6e', '#c98f62'],
  dusk: ['#0a1226', '#1d2b55', '#7a4a45'],
};

export type SkyProps = {
  mood?: SkyMood;
  stars?: number; // <= 140
  moon?: {x: number; y: number; r?: number} | false;
  aurora?: boolean;
  clouds?: number;
  /** horizon y (gradient bottom glow location) */
  horizon?: number;
  seed?: number;
};

/** Static gradient + stars as 4 merged paths (opacity twinkle by group) + drifting low-poly clouds. */
export const Sky: React.FC<SkyProps> = ({mood = 'calm', stars = 110, moon = {x: 1480, y: 190, r: 62}, aurora = false, clouds = 3, horizon = 720, seed = 3}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const [c0, c1, c2] = MOODS[mood];
  const groups = useMemo(() => {
    const g: string[][] = [[], [], [], []];
    const n = Math.min(140, stars);
    for (let i = 0; i < n; i++) {
      const x = hash(i * 3.1 + seed) * (W + 200) - 100;
      const y = Math.pow(hash(i * 5.7 + seed * 2), 1.5) * horizon * 0.95;
      g[i % 4].push(`M${x.toFixed(1)} ${y.toFixed(1)}h0.1`);
    }
    return g.map((a) => a.join(''));
  }, [stars, seed, horizon]);
  const cloudPaths = useMemo(() => {
    const arr: {d: string; y: number; speed: number; o: number; x0: number}[] = [];
    for (let i = 0; i < clouds; i++) {
      const w = 380 + hash(i * 9 + seed) * 360;
      const h = 34 + hash(i * 4 + seed) * 30;
      const pts = [0, 1, 2, 3, 4, 5, 6].map((k) => `${(k / 6) * w},${-h * (0.4 + hash(k + i * 7 + seed) * 0.8) * Math.sin((k / 6) * Math.PI)}`);
      arr.push({
        d: `M0,0 L${pts.join(' L')} L${w},0 Z`,
        y: 120 + hash(i * 2 + seed) * 330,
        speed: 6 + hash(i + seed) * 8,
        o: 0.16 + hash(i * 6) * 0.14,
        x0: hash(i * 12 + seed) * W,
      });
    }
    return arr;
  }, [clouds, seed]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${c0} 0%, ${c1} 55%, ${c2} 100%)`}} />
      {aurora && (
        <AbsoluteFill style={{opacity: 0.5}}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 200 + i * 520 + Math.sin(t * 0.25 + i) * 50,
                top: 40 + i * 25,
                width: 620,
                height: 360,
                background: `linear-gradient(180deg, ${rgba(P.teal, 0)} 0%, ${rgba(P.teal, 0.22)} 50%, ${rgba(P.teal, 0)} 100%)`,
                transform: `skewX(${-18 + i * 10}deg)`,
                opacity: 0.55 + 0.35 * Math.sin(t * 0.4 + i * 2),
              }}
            />
          ))}
        </AbsoluteFill>
      )}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {groups.map((d, i) => (
          <path
            key={i}
            d={d}
            stroke={i % 2 ? P.bone : P.amberHot}
            strokeWidth={[2.2, 3.2, 2.6, 1.8][i]}
            strokeLinecap="round"
            opacity={0.35 + 0.55 * (0.5 + 0.5 * Math.sin(t * (0.6 + i * 0.35) + i * 1.7))}
          />
        ))}
        {cloudPaths.map((c, i) => {
          const x = ((c.x0 + t * c.speed) % (W + 900)) - 450;
          return (
            <g key={i} transform={`translate(${x},${c.y})`} opacity={c.o}>
              <path d={c.d} fill={P.ink3} />
              <path d={c.d} fill={P.ink2} transform="translate(30,16) scale(0.9,0.6)" opacity={0.7} />
            </g>
          );
        })}
        {moon && (
          <g>
            <defs>
              <radialGradient id="moonglow">
                <stop offset="0" stopColor={P.bone} stopOpacity="0.42" />
                <stop offset="0.35" stopColor={P.bone} stopOpacity="0.12" />
                <stop offset="1" stopColor={P.bone} stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx={moon.x} cy={moon.y} r={(moon.r ?? 60) * 5.5} fill="url(#moonglow)" />
            <circle cx={moon.x} cy={moon.y} r={moon.r ?? 60} fill={P.bone} />
            <circle cx={moon.x - (moon.r ?? 60) * 0.32} cy={moon.y - (moon.r ?? 60) * 0.2} r={(moon.r ?? 60) * 0.2} fill={P.boneShade} opacity={0.55} />
            <circle cx={moon.x + (moon.r ?? 60) * 0.3} cy={moon.y + (moon.r ?? 60) * 0.3} r={(moon.r ?? 60) * 0.13} fill={P.boneShade} opacity={0.5} />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
