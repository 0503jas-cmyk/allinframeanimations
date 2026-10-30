import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT, P, rgba} from './theme';

export type TideClockProps = {
  /** minutes until the road closes, 0..360 */
  minutesToClose: number;
  ebbing?: boolean;
  /** diameter px */
  size?: number;
  x?: number;
  y?: number;
  /** 'cracked' paints three hairline cracks (chapter-end latch) */
  cracked?: boolean;
  label?: boolean;
};

const polar = (cx: number, cy: number, r: number, deg: number) => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];
const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};
const ROMAN: Record<number, string> = {0: 'XII', 3: 'III', 6: 'VI', 9: 'IX'};

/** Six-hour tide dial. Teal arc shrinks as the road closes; amber < 20 min, blood in the last 5. Positioned by centre (x,y). */
export const TideClock: React.FC<TideClockProps> = ({minutesToClose, ebbing = true, size = 300, x = 960, y = 540, cracked = false, label = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const m = Math.max(0, Math.min(360, minutesToClose));
  const col = m < 5 ? P.blood : m < 20 ? P.amber : P.teal;
  const r = 100;
  const sweep = (m / 360) * 359.9;
  const jig = Math.sin(t * 17) * (m < 20 ? 1.6 : 0.5);
  const handAng = sweep + jig;
  const [hx, hy] = polar(0, 0, 78, handAng);
  const [tx, ty] = polar(0, 0, -16, handAng);
  return (
    <svg width={size} height={size} viewBox="-130 -130 260 260" style={{position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible'}}>
      <defs>
        <radialGradient id="tcface" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#16264a" />
          <stop offset="1" stopColor={P.ink1} />
        </radialGradient>
      </defs>
      <circle r={124} fill="url(#tcface)" stroke={rgba(P.bone, 0.55)} strokeWidth={2.5} />
      <circle r={118} fill="none" stroke={rgba(P.bone, 0.18)} strokeWidth={1} />
      {Array.from({length: 12}, (_, i) => {
        const [a, b] = polar(0, 0, 106, i * 30);
        const [c, d] = polar(0, 0, i % 3 === 0 ? 92 : 98, i * 30);
        return <path key={i} d={`M${a} ${b}L${c} ${d}`} stroke={rgba(P.bone, i % 3 === 0 ? 0.9 : 0.5)} strokeWidth={i % 3 === 0 ? 3 : 1.6} />;
      })}
      <circle r={r - 24} fill="none" stroke={rgba(P.teal, 0.1)} strokeWidth={14} />
      <path d={arcPath(0, 0, r - 24, 0, sweep)} fill="none" stroke={col} strokeWidth={14} strokeLinecap="butt" opacity={0.9} />
      <path d={arcPath(0, 0, r - 24, 0, sweep)} fill="none" stroke={P.bone} strokeWidth={1.5} strokeDasharray="2 7" opacity={0.5} transform="scale(1.1)" />
      {Object.entries(ROMAN).map(([k, v]) => {
        const [px, py] = polar(0, 0, 56, Number(k) * 30);
        return (
          <text key={k} x={px} y={py + 6} textAnchor="middle" fontFamily={FONT.accent} fontSize={17} fill={P.bone} opacity={0.8}>
            {v}
          </text>
        );
      })}
      <path d={`M${tx} ${ty}L${hx} ${hy}`} stroke={P.bone} strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={hx} cy={hy} r={5} fill={col} />
      <circle r={7} fill={P.bone} />
      <circle r={2.5} fill={P.ink1} />
      {label && (
        <text y={152} textAnchor="middle" fontFamily={FONT.hud} fontWeight={500} fontSize={13} letterSpacing={3} fill={rgba(P.bone, 0.75)}>
          {ebbing ? 'EBB' : 'FLOOD'} {String(Math.floor(m / 60)).padStart(1, '0')}:{String(Math.round(m % 60)).padStart(2, '0')}
        </text>
      )}
      {cracked && <path d="M-80 -90 L-30 -20 L-60 30 L10 120 M20 -122 L40 -40 L90 10 M-120 20 L-40 10" stroke={P.ink0} strokeWidth={3} fill="none" />}
    </svg>
  );
};
