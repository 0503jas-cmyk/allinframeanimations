import React from 'react';
import {C, rnd, clamp} from './theme';

export type Mood = 'normal' | 'angry' | 'sad' | 'scared' | 'happy' | 'smug';
type Common = {x?: number; y?: number; s?: number; flip?: boolean; mouth?: number; mood?: Mood; t?: number; look?: number; rot?: number; opacity?: number};

const tf = (p: Common) =>
  `translate(${p.x ?? 0} ${p.y ?? 0}) rotate(${p.rot ?? 0}) scale(${(p.flip ? -1 : 1) * (p.s ?? 1)} ${p.s ?? 1})`;

const blinkAt = (t: number, seed = 0) => {
  const c = (t + seed * 1.7) % 3.2;
  return c > 3.05 ? 0.12 : 1;
};

export const Eye: React.FC<{x: number; y: number; r?: number; look?: number; lid?: number; mood?: Mood; side?: 1 | -1; pr?: number}> = ({x, y, r = 22, look = 0, lid = 1, mood = 'normal', side = 1, pr}) => {
  const p = pr ?? r * 0.42;
  const slant = mood === 'angry' ? 12 * side : mood === 'sad' || mood === 'scared' ? -10 * side : 0;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={r} ry={r * lid} fill="#fff" stroke="#1a1a2a" strokeWidth={2.5} />
      <circle cx={x + look * r * 0.45} cy={y} r={mood === 'scared' ? p * 0.7 : p} fill="#0a0a14" style={{display: lid < 0.3 ? 'none' : undefined}} />
      {mood === 'angry' && <path d={`M${x - r - 4} ${y - r * 0.75 - slant * (side === 1 ? 0.2 : -0.1)} L${x + r + 4} ${y - r * 0.2 + slant * 0.2}`} stroke="#1a1a2a" strokeWidth={8} strokeLinecap="round" transform={`rotate(${side === 1 ? -14 : 14} ${x} ${y})`} />}
    </g>
  );
};

const Brow: React.FC<{x: number; y: number; w?: number; side: 1 | -1; mood: Mood; col?: string}> = ({x, y, w = 38, side, mood, col = '#2a1a14'}) => {
  const a = mood === 'angry' ? 18 : mood === 'sad' || mood === 'scared' ? -16 : mood === 'smug' ? -6 : 0;
  return <rect x={x - w / 2} y={y - 5} width={w} height={10} rx={5} fill={col} transform={`rotate(${a * side} ${x} ${y})`} />;
};

const Mouth: React.FC<{x: number; y: number; w?: number; open: number; mood: Mood; col?: string}> = ({x, y, w = 34, open, mood, col = '#3a1520'}) => {
  const o = clamp(open);
  if (mood === 'happy' && o < 0.15) return <path d={`M${x - w / 2} ${y - 4} Q${x} ${y + 18} ${x + w / 2} ${y - 4}`} stroke="#3a1520" strokeWidth={6} fill="none" strokeLinecap="round" />;
  if (mood === 'sad' && o < 0.15) return <path d={`M${x - w / 2} ${y + 8} Q${x} ${y - 10} ${x + w / 2} ${y + 8}`} stroke="#3a1520" strokeWidth={6} fill="none" strokeLinecap="round" />;
  if (o < 0.12) return <rect x={x - w / 2} y={y} width={w} height={6} rx={3} fill="#3a1520" />;
  return (
    <g>
      <ellipse cx={x} cy={y + 8} rx={w / 2} ry={4 + o * 17} fill={col} />
      {o > 0.4 && <ellipse cx={x} cy={y + 8 + o * 9} rx={w / 3} ry={o * 6} fill="#c8505f" />}
    </g>
  );
};

/* ---------- JUNO ---------- */
export const JunoBust: React.FC<Common & {goggles?: boolean; variant?: 'mom' | 'ada'}> = (p) => {
  const hair = p.variant === 'ada' ? '#b9b9c4' : p.variant === 'mom' ? '#6a3a24' : '#2b1b14';
  const coat = p.variant ? '#f2f5fa' : C.jacket;
  const coat2 = p.variant ? '#d6dce8' : '#b83323';
  const scarf = p.variant ? '#7fb0d8' : C.scarf;
  const t = p.t ?? 0, m = p.mood ?? 'normal', look = p.look ?? 0, lid = blinkAt(t, 1);
  const bob = Math.sin(t * 2.2) * 3 + (p.mouth ?? 0) * 3;
  return (
    <g transform={tf(p)} opacity={p.opacity ?? 1}>
      <g transform={`translate(0 ${bob})`}>
        {/* torso */}
        <path d="M-150 260 Q-140 120 -70 100 L70 100 Q140 120 150 260 Z" fill={coat} />
        <path d="M-70 100 L-20 170 L-40 260 L-150 260 Q-140 120 -70 100Z" fill={coat2} />
        <path d="M-60 104 Q0 150 60 104 L70 150 Q0 200 -70 150Z" fill={scarf} />
        <rect x={-18} y={80} width={36} height={34} fill={C.skin2} />
        {/* hair back */}
        <path d="M-84 -10 Q-96 -110 0 -112 Q96 -110 84 -10 Q92 60 70 90 L-70 90 Q-92 60 -84 -10Z" fill={hair} />
        {/* head */}
        <ellipse cx={0} cy={0} rx={72} ry={80} fill={C.skin} />
        <ellipse cx={-42} cy={30} rx={14} ry={9} fill="#e8967a" opacity={0.6} />
        <ellipse cx={42} cy={30} rx={14} ry={9} fill="#e8967a" opacity={0.6} />
        {/* fringe */}
        <path d="M-76 -20 Q-70 -92 0 -90 Q70 -92 76 -20 Q40 -52 -4 -50 Q-44 -50 -76 -20Z" fill={hair} />
        {p.goggles !== false && !p.variant && (
          <g>
            <rect x={-82} y={-62} width={164} height={14} rx={7} fill="#3a2a20" />
            <circle cx={-34} cy={-70} r={26} fill="#f08a24" stroke="#3a2a20" strokeWidth={7} />
            <circle cx={34} cy={-70} r={26} fill="#f08a24" stroke="#3a2a20" strokeWidth={7} />
            <circle cx={-42} cy={-78} r={7} fill="#ffd9a0" opacity={0.8} />
            <circle cx={26} cy={-78} r={7} fill="#ffd9a0" opacity={0.8} />
          </g>
        )}
        <Eye x={-30} y={-6} r={22} look={look} lid={lid} mood={m} side={1} />
        <Eye x={30} y={-6} r={22} look={look} lid={lid} mood={m} side={-1} />
        <Brow x={-30} y={-38} side={1} mood={m} />
        <Brow x={30} y={-38} side={-1} mood={m} />
        <path d="M-4 14 L-8 28 L6 28" stroke={C.skin2} strokeWidth={4} fill="none" strokeLinecap="round" />
        <Mouth x={0} y={44} open={p.mouth ?? 0} mood={m} />
        {/* scar */}
        {!p.variant && <path d="M30 84 l10 8 m-6 -2 l-4 8" stroke="#b0594a" strokeWidth={4} strokeLinecap="round" />}
      </g>
    </g>
  );
};

/* ---------- BOLT ---------- */
export const Bolt: React.FC<Common & {props?: boolean; spin?: number; glow?: string}> = (p) => {
  const t = p.t ?? 0, m = p.mood ?? 'normal', look = p.look ?? 0;
  const hover = Math.sin(t * 3.4) * 5 - (p.mouth ?? 0) * 3;
  const lid = blinkAt(t, 4);
  const sad = m === 'sad' ? 6 : 0;
  return (
    <g transform={tf(p)} opacity={p.opacity ?? 1}>
      <g transform={`translate(0 ${hover})`}>
        <line x1={0} y1={-120} x2={0} y2={-160} stroke="#8a6a10" strokeWidth={6} />
        <circle cx={0} cy={-166} r={11} fill={m === 'scared' ? C.red : '#ff5a4a'} />
        {p.props && (
          <g>
            {[-1, 1].map((sd) => (
              <g key={sd} transform={`translate(${sd * 86} -126)`}>
                <rect x={-4} y={0} width={8} height={26} fill="#8a6a10" />
                <ellipse cx={0} cy={0} rx={70 * Math.abs(Math.cos((p.spin ?? 0) + sd))} ry={7} fill="#cfd8dc" opacity={0.75} />
              </g>
            ))}
          </g>
        )}
        <rect x={-96} y={-126} width={192} height={160} rx={44} fill={C.yellow} stroke="#8a6a10" strokeWidth={5} />
        <rect x={-96} y={-30} width={192} height={64} rx={30} fill={C.yellow2} opacity={0.5} />
        <rect x={-72} y={-100} width={144} height={100} rx={34} fill="#0e1424" stroke="#8a6a10" strokeWidth={4} />
        <Eye x={0} y={-50 + sad} r={36} look={look} lid={lid} mood={m} pr={17} />
        {m === 'angry' && <path d="M-44 -90 L44 -72" stroke="#0e1424" strokeWidth={0} />}
        <rect x={-30} y={-6} width={60} height={8} rx={4} fill="#0e1424" opacity={0.0} />
        <path d={`M-28 8 Q0 ${8 + (p.mouth ?? 0) * 18 + (m === 'sad' ? -8 : 6)} 28 8`} stroke="#6a4a00" strokeWidth={6} fill="none" strokeLinecap="round" />
        <rect x={-120} y={-40} width={30} height={14} rx={7} fill={C.yellow2} />
        <rect x={90} y={-40} width={30} height={14} rx={7} fill={C.yellow2} />
        <circle cx={-52} cy={52} r={26} fill="#2b3040" stroke="#14171f" strokeWidth={4} />
        <circle cx={52} cy={52} r={26} fill="#2b3040" stroke="#14171f" strokeWidth={4} />
        <circle cx={-52} cy={52} r={9} fill="#7a8394" />
        <circle cx={52} cy={52} r={9} fill="#7a8394" />
      </g>
    </g>
  );
};

/* ---------- CRANE ---------- */
export const CraneBust: React.FC<Common> = (p) => {
  const t = p.t ?? 0, m = p.mood ?? 'smug', look = p.look ?? 0, lid = blinkAt(t, 7);
  const bob = Math.sin(t * 1.6) * 2 + (p.mouth ?? 0) * 3;
  return (
    <g transform={tf(p)} opacity={p.opacity ?? 1}>
      <g transform={`translate(0 ${bob})`}>
        <path d="M-170 280 Q-160 120 -70 100 L70 100 Q160 120 170 280 Z" fill="#c9ccd6" />
        <path d="M-70 100 L0 210 L70 100 L40 100 L0 150 L-40 100Z" fill="#f5f5f0" />
        <path d="M0 150 L-16 230 L0 250 L16 230Z" fill="#7a1a2a" />
        <path d="M-170 280 Q-160 120 -70 100 L-30 280Z" fill="#b8bbc7" />
        <rect x={-18} y={80} width={36} height={30} fill="#d9a07e" />
        <ellipse cx={0} cy={0} rx={66} ry={92} fill="#e6b896" />
        <path d="M-70 -30 Q-80 -118 0 -116 Q80 -118 70 -30 Q40 -70 0 -72 Q-40 -70 -70 -30Z" fill="#b9b9c4" />
        <Eye x={-28} y={-8} r={19} look={look} lid={lid} mood={m === 'smug' ? 'normal' : m} side={1} pr={7} />
        <Eye x={30} y={-8} r={19} look={look} lid={lid} mood={m === 'smug' ? 'normal' : m} side={-1} pr={7} />
        <circle cx={30} cy={-8} r={30} fill="none" stroke="#d4af37" strokeWidth={5} />
        <line x1={58} y1={8} x2={72} y2={70} stroke="#d4af37" strokeWidth={2.5} />
        <Brow x={-28} y={-40} side={1} mood={m === 'smug' ? 'angry' : m} col="#7a7a88" w={36} />
        <Brow x={30} y={-46} side={-1} mood={m === 'smug' ? 'smug' : m} col="#7a7a88" w={36} />
        <path d="M-6 14 L-12 34 L6 34" stroke="#c48e6c" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M-30 46 Q-10 40 0 46 Q10 40 30 46" stroke="#7a7a88" strokeWidth={7} fill="none" strokeLinecap="round" />
        <Mouth x={0} y={56} w={30} open={p.mouth ?? 0} mood={m === 'smug' ? 'normal' : m} />
      </g>
    </g>
  );
};

/* ---------- ZOMBIE ---------- */
export const Zombie: React.FC<Common & {walk?: number; shirt?: string; run?: boolean; arms?: number}> = (p) => {
  const t = p.t ?? 0, w = p.walk ?? 0;
  const step = Math.sin(w * 6) * 12;
  const sw = Math.sin(w * 3 + 1) * 6;
  const shirt = p.shirt ?? ['#6b4a3a', '#3a4a6b', '#6b3a4a', '#4a6b3a', '#7a6a3a'][Math.floor(rnd(p.x ?? 1) * 5)];
  const lean = p.run ? 14 : 4;
  return (
    <g transform={tf(p)} opacity={p.opacity ?? 1}>
      <g transform={`rotate(${lean + sw * 0.3} 0 120)`}>
        <rect x={-30} y={150} width={26} height={90 + step} rx={10} fill="#2b3350" />
        <rect x={6} y={150} width={26} height={90 - step} rx={10} fill="#2b3350" />
        <path d="M-52 160 Q-60 40 -26 24 L26 24 Q60 40 52 160 Z" fill={shirt} />
        <path d="M-52 120 l12 14 l10 -10 l12 14 l10 -10 l12 14 l10 -12 l12 14 l10 -12 l12 14 L52 160 L-52 160Z" fill="#00000030" />
        <rect x={52} y={46} width={90} height={22} rx={11} fill={C.zombie2} transform={`rotate(${-6 + (p.arms ?? 0) * 12 + sw} 52 56)`} />
        <rect x={-142} y={50} width={90} height={22} rx={11} fill={C.zombie2} transform={`rotate(${6 - (p.arms ?? 0) * 12 - sw} -52 60)`} />
        <ellipse cx={0} cy={-22} rx={46} ry={52} fill={C.zombie} />
        <path d="M-40 -50 Q-20 -76 0 -62 Q22 -80 40 -50 Q20 -62 0 -50 Q-20 -62 -40 -50Z" fill="#34412c" />
        <Eye x={-17} y={-24} r={13} look={0.4} lid={1} mood="normal" pr={4} />
        <Eye x={19} y={-22} r={17} look={0.5} lid={1} mood="normal" pr={4} />
        <path d="M-20 12 Q0 22 22 10" stroke="#2a3a22" strokeWidth={5} fill="none" strokeLinecap="round" />
        <rect x={-14} y={10} width={7} height={9} fill="#e9e6c8" />
        <rect x={4} y={10} width={7} height={9} fill="#e9e6c8" />
      </g>
    </g>
  );
};

/* ---------- BISCUIT (bike + sidecar) ---------- */
export const Wheel: React.FC<{x: number; y: number; r: number; rot: number}> = ({x, y, r, rot}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <circle r={r} fill="#14161c" />
    <circle r={r * 0.62} fill="#aab3c2" />
    <circle r={r * 0.5} fill="#2a2f3a" />
    {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={0} y1={0} x2={r * 0.6 * Math.cos((i * Math.PI) / 3)} y2={r * 0.6 * Math.sin((i * Math.PI) / 3)} stroke="#aab3c2" strokeWidth={4} />)}
    <circle r={8} fill="#cfd8dc" />
  </g>
);

export const BikeRig: React.FC<Common & {speed?: number; jump?: number; withBolt?: boolean; boltMood?: Mood; junoMood?: Mood; boltProps?: boolean; talkJ?: number; talkB?: number; lean?: number}> = (p) => {
  const t = p.t ?? 0, sp = p.speed ?? 1;
  const rot = t * 700 * sp;
  const bounce = Math.sin(t * 17 * sp) * 4 * sp;
  return (
    <g transform={tf(p)} opacity={p.opacity ?? 1}>
      <g transform={`translate(0 ${bounce - (p.jump ?? 0)}) rotate(${p.lean ?? 0} 0 120)`}>
        {/* sidecar */}
        <g transform="translate(150 20)">
          <path d="M-30 90 L170 90 L190 40 L10 30Z" fill="#5a6a8a" stroke="#2a3248" strokeWidth={5} />
          <path d="M-14 40 L170 40" stroke="#7a8aaa" strokeWidth={6} />
          <Wheel x={80} y={118} r={42} rot={rot} />
          {p.withBolt !== false && <Bolt x={80} y={-4} s={0.62} t={t} mood={p.boltMood ?? 'scared'} mouth={p.talkB ?? 0} look={-0.6} props={p.boltProps} spin={t * 40} />}
        </g>
        {/* bike body */}
        <Wheel x={-110} y={140} r={62} rot={rot} />
        <Wheel x={110} y={140} r={62} rot={rot} />
        <path d="M-110 140 L-40 70 L60 70 L110 140" stroke="#c0392b" strokeWidth={14} fill="none" strokeLinejoin="round" />
        <path d="M-60 70 Q0 30 70 66 L70 90 L-60 90Z" fill="#c0392b" />
        <path d="M60 70 L80 20 L110 12" stroke="#2a2f3a" strokeWidth={10} fill="none" strokeLinecap="round" />
        <circle cx={118} cy={50} r={13} fill="#ffe9a0" />
        <path d="M118 50 L220 20 L220 80Z" fill="#ffe9a0" opacity={0.18} />
        {/* duck horn */}
        <g transform="translate(96 4)"><ellipse rx={13} ry={9} fill="#ffd23f" /><rect x={8} y={-4} width={12} height={5} fill="#ff8a1c" /></g>
        {/* rider */}
        <g transform="translate(-26 -66)">
          <JunoBust s={0.46} t={t} mood={p.junoMood ?? 'angry'} mouth={p.talkJ ?? 0} look={0.7} rot={p.lean ? p.lean * 0.5 : 0} />
        </g>
        <rect x={-18} y={34} width={30} height={46} rx={12} fill="#2a3248" />
        <rect x={20} y={46} width={96} height={22} rx={11} fill="#d6402f" transform="rotate(-14 20 56)" />
      </g>
    </g>
  );
};

/* ---------- COOLER ---------- */
export const Cooler: React.FC<Common & {open?: number; glow?: number}> = (p) => (
  <g transform={tf(p)}>
    {(p.glow ?? 0) > 0 && <circle r={110} fill="#7fffd4" opacity={0.15 * (p.glow ?? 0)} />}
    <rect x={-70} y={-30} width={140} height={90} rx={12} fill="#9aa4b5" stroke="#4a5568" strokeWidth={5} />
    <rect x={-70} y={-30 - (p.open ?? 0) * 30} width={140} height={26} rx={10} fill="#b7c0cf" stroke="#4a5568" strokeWidth={5} transform={`rotate(${-(p.open ?? 0) * 80} -70 -30)`} />
    <rect x={-30} y={4} width={60} height={34} fill="#f5f5f0" />
    <text x={0} y={20} textAnchor="middle" fontSize={11} fontWeight={800} fill="#c0392b" fontFamily="Inter">FRAGILE</text>
    <text x={0} y={33} textAnchor="middle" fontSize={9} fontWeight={700} fill="#222" fontFamily="Inter">#4,417</text>
  </g>
);

/* ---------- BUS: THE PARADE ---------- */
export const ParadeBus: React.FC<Common & {speed?: number; flash?: number}> = (p) => {
  const t = p.t ?? 0, rot = t * 500 * (p.speed ?? 1);
  const fl = Math.sin(t * 9 + (p.flash ?? 0)) > 0;
  return (
    <g transform={tf(p)} opacity={p.opacity ?? 1}>
      <g transform={`translate(0 ${Math.sin(t * 12) * 3})`}>
        <rect x={-340} y={-180} width={680} height={250} rx={36} fill="#5a1d2a" stroke="#2a0d14" strokeWidth={8} />
        <rect x={-340} y={-60} width={680} height={36} fill="#2a0d14" />
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={-310 + i * 100} y={-150} width={74} height={70} rx={12} fill={i % 2 ? '#ffcf70' : '#1a2234'} />)}
        <rect x={250} y={-160} width={80} height={110} rx={14} fill="#1a2234" />
        <text x={-20} y={-30} textAnchor="middle" fontSize={34} fontWeight={900} fill="#f2b84b" fontFamily="Inter">THE PARADE</text>
        {[-250, 0, 250].map((x, i) => (
          <g key={i} transform={`translate(${x} -180)`}>
            <rect x={-6} y={-90} width={12} height={90} fill="#2a2f3a" />
            <path d="M-34 -90 L34 -90 L22 -128 L-22 -128Z" fill="#9aa4b5" stroke="#2a2f3a" strokeWidth={4} />
            {[1, 2].map((k) => <path key={k} d={`M${-50 - k * 14} ${-110 + k * 0} Q${-60 - k * 14} -108 ${-50 - k * 14} -92`} stroke="#f2b84b" strokeWidth={4} fill="none" opacity={0.5 + 0.4 * Math.sin(t * 9 - k)} />)}
          </g>
        ))}
        <circle cx={310} cy={-6} r={16} fill={fl ? '#ff3b3b' : '#6a1a1a'} />
        <circle cx={-310} cy={-6} r={16} fill={fl ? '#6a1a1a' : '#3b6bff'} />
        <Wheel x={-210} y={80} r={64} rot={rot} />
        <Wheel x={210} y={80} r={64} rot={rot} />
      </g>
    </g>
  );
};

/* ---------- BIG BETTY ---------- */
export const Betty: React.FC<Common & {swing?: number; walk?: number}> = (p) => {
  const w = p.walk ?? 0, sw = p.swing ?? 0;
  return (
    <g transform={tf(p)}>
      <rect x={-110} y={260} width={80} height={240 + Math.sin(w * 4) * 20} rx={30} fill="#2b3350" />
      <rect x={30} y={260} width={80} height={240 - Math.sin(w * 4) * 20} rx={30} fill="#2b3350" />
      <ellipse cx={0} cy={110} rx={190} ry={220} fill="#6f8f60" />
      <ellipse cx={0} cy={150} rx={170} ry={180} fill="#7fa86a" />
      {[[-120, 60, '#c0392b'], [100, 20, '#2f7fd6'], [-60, 190, '#f2b84b'], [90, 210, '#6a4a8a'], [-150, 220, '#3a8a5a']].map((b, i) => (
        <g key={i} transform={`translate(${b[0]} ${b[1]}) rotate(${i * 14 - 20})`}><rect width={70} height={52} rx={6} fill={b[2] as string} stroke="#1b1b24" strokeWidth={4} /><rect x={26} y={-8} width={18} height={10} rx={3} fill="#1b1b24" /></g>
      ))}
      <g transform={`rotate(${-30 + sw * 90} 150 40)`}><rect x={150} y={20} width={260} height={50} rx={24} fill="#6f8f60" /><rect x={380} y={-170} width={30} height={260} fill="#c9ccd6" /><rect x={380} y={-170} width={30} height={40} fill="#e0483e" /></g>
      <rect x={-330} y={60} width={200} height={50} rx={24} fill="#6f8f60" />
      <ellipse cx={0} cy={-120} rx={110} ry={120} fill="#7fa86a" />
      <Eye x={-40} y={-130} r={26} look={0.3} mood="normal" pr={9} />
      <Eye x={46} y={-124} r={36} look={0.4} mood="normal" pr={10} />
      <path d="M-60 -50 Q0 -10 60 -52" stroke="#2a3a22" strokeWidth={10} fill="none" strokeLinecap="round" />
      {[-40, -10, 22, 50].map((x, i) => <rect key={i} x={x} y={-52} width={14} height={20} fill="#e9e6c8" />)}
    </g>
  );
};
