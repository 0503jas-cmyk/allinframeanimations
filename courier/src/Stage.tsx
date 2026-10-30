import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W, H, ease, easeOut, rnd, clamp, FONT_BOLD, lerp} from './theme';
import {JunoBust, Bolt, CraneBust, Zombie, BikeRig, Cooler, ParadeBus, Betty, Mood} from './art';
import {Backdrop} from './backdrops';
import {SpeedLines, Lamp} from './bg';

export type N2 = number | [number, number];
export type Actor = {
  k: 'juno' | 'ada' | 'crowd' | 'bolt' | 'crane' | 'zombie' | 'horde' | 'bike' | 'cooler' | 'bus' | 'betty' | 'radio' | 'text' | 'old' | 'mom' | 'baby' | 'hook' | 'cage' | 'tower' | 'gate' | 'note' | 'car';
  who?: 'JUNO' | 'BOLT' | 'CRANE' | 'ADA';
  x: N2; y: N2; s?: N2; rot?: N2; op?: N2;
  flip?: boolean; mood?: Mood;
  vis?: [number, number]; // visible shot-relative seconds window
  o?: any;
};
export type Shot = {
  at: number; bg: string; sp?: number; z?: N2; cx?: N2; cy?: N2; sh?: number;
  fx?: string[]; a: Actor[]; dim?: number; tint?: string;
};

const val = (v: N2 | undefined, u: number, d = 0) => (v === undefined ? d : Array.isArray(v) ? lerp(v[0], v[1], ease(u)) : v);

export type Talk = {who: string | null; amp: number};

const Radio: React.FC<{x: number; y: number; s: number; t: number; amp: number}> = ({x, y, s, t, amp}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-120} y={-80} width={240} height={160} rx={20} fill="#4a4d5a" stroke="#22242c" strokeWidth={6} />
    <rect x={-96} y={-56} width={120} height={70} rx={8} fill="#0f2a22" />
    {Array.from({length: 12}).map((_, i) => <rect key={i} x={-90 + i * 10} y={-21 - amp * 28 * Math.abs(Math.sin(t * 9 + i)) } width={6} height={4 + amp * 56 * Math.abs(Math.sin(t * 9 + i))} fill="#5dff9e" />)}
    <circle cx={64} cy={-20} r={26} fill="#2a2d36" stroke="#8a8f9c" strokeWidth={4} />
    <line x1={64} y1={-20} x2={64 + 14 * Math.cos(t)} y2={-20 + 14 * Math.sin(t)} stroke="#f2b84b" strokeWidth={4} />
    <rect x={-96} y={30} width={192} height={30} rx={6} fill="#22242c" />
    <line x1={90} y1={-80} x2={150} y2={-190} stroke="#9aa4b5" strokeWidth={6} />
    <circle cx={150} cy={-190} r={9} fill="#e0483e" />
  </g>
);

const OldMan: React.FC<{t: number; mouth: number}> = ({t}) => (
  <g>
    <path d="M-110 240 Q-100 100 -50 80 L50 80 Q100 100 110 240Z" fill="#6a6f86" />
    <ellipse cx={0} cy={0} rx={62} ry={70} fill="#e2b28c" />
    <path d="M-52 20 Q0 150 52 20 Q30 60 0 64 Q-30 60 -52 20Z" fill="#eeeeea" />
    <ellipse cx={0} cy={-62} rx={46} ry={14} fill="#eeeeea" opacity={0.7} />
    <circle cx={-24} cy={-8} r={14} fill="#fff" stroke="#222" strokeWidth={3} /><circle cx={24} cy={-8} r={14} fill="#fff" stroke="#222" strokeWidth={3} />
    <circle cx={-22} cy={-8} r={5} fill="#111" /><circle cx={26} cy={-8} r={5} fill="#111" />
    <path d={`M-24 -32 L-8 -28 M24 -32 L8 -28`} stroke="#ddd" strokeWidth={7} strokeLinecap="round" />
  </g>
);

const Tower: React.FC<{t: number; hot?: number}> = ({t, hot = 0}) => (
  <g>
    <rect x={-18} y={-300} width={36} height={420} fill="#2a2f3a" />
    <path d="M-90 -300 L90 -300 L50 -380 L-50 -380Z" fill="#9aa4b5" stroke="#2a2f3a" strokeWidth={6} />
    {[1, 2, 3].map((k) => <path key={k} d={`M${70 + k * 30} -360 Q${100 + k * 30} -340 ${70 + k * 30} -320`} stroke="#f2b84b" strokeWidth={6} fill="none" opacity={0.3 + 0.6 * Math.abs(Math.sin(t * 8 - k)) } />)}
    {hot > 0 && <circle cx={0} cy={-340} r={30 + 18 * Math.sin(t * 20)} fill="#ffb347" opacity={0.7 * hot} />}
  </g>
);

const Horde: React.FC<{n: number; x0: number; x1: number; y: number; u: number; t: number; run?: boolean; s?: number; flip?: boolean}> = ({n, x0, x1, y, u, t, run, s = 0.8, flip}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const dx = lerp(x0, x1, ease(u)) + (rnd(i + 1) - 0.5) * 520;
      const dy = y + (rnd(i + 9) - 0.5) * 70;
      return <Zombie key={i} x={dx} y={dy} s={s * (0.85 + rnd(i + 5) * 0.4)} t={t} walk={t * (run ? 1.6 : 1) + i} run={run} arms={run ? 0.6 : 0.2} flip={flip} />;
    })}
  </g>
);

export const Stage: React.FC<{shot: Shot; t: number; dur: number; sceneT: number; talk: Talk}> = ({shot, t, dur, sceneT, talk}) => {
  const u = clamp(t / Math.max(0.1, dur));
  const z = val(shot.z, u, 1), cx = val(shot.cx, u, 0), cy = val(shot.cy, u, 0);
  const shk = shot.sh ?? 0;
  const sx = shk * Math.sin(sceneT * 53) * 6, sy = shk * Math.cos(sceneT * 47) * 6;
  const scroll = t * 700 * (shot.sp ?? 0);
  const amp = (who: string) => (talk.who === who ? talk.amp : 0);
  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
        <g transform={`translate(${W / 2 + cx + sx} ${H / 2 + cy + sy}) scale(${z}) translate(${-W / 2} ${-H / 2})`}>
          <Backdrop name={shot.bg} t={t + sceneT * 0} scroll={scroll} />
          {shot.a.map((a, i) => {
            if (a.vis && (t < a.vis[0] || t > a.vis[1])) return null;
            const x = val(a.x, u), y = val(a.y, u), s = val(a.s, u, 1), rot = val(a.rot, u, 0), op = val(a.op, u, 1);
            const o = a.o ?? {};
            const mouth = a.who ? amp(a.who) : 0;
            const common = {x, y, s, rot, flip: a.flip, t: t + i};
            switch (a.k) {
              case 'juno': return <g key={i} opacity={op}><JunoBust {...common} mood={a.mood ?? (mouth > 0.1 ? 'normal' : 'normal')} mouth={mouth} look={o.look ?? 0} /></g>;
              case 'ada': return <g key={i} opacity={op}><JunoBust {...common} variant={o.v ?? 'ada'} mood={a.mood ?? 'normal'} mouth={mouth} look={o.look ?? 0} /></g>;
              case 'baby': return <g key={i} opacity={op} transform={`translate(${x} ${y}) scale(${s})`}><circle r={44} fill="#e8b48a" /><circle cx={-14} cy={-4} r={8} fill="#111" /><circle cx={14} cy={-4} r={8} fill="#111" /><rect x={-50} y={40} width={100} height={70} rx={30} fill="#f2c0d0" /></g>;
              case 'crowd': return <g key={i} opacity={op}>{Array.from({length: o.n ?? 12}).map((_, k) => { const px = x + k * (o.gap ?? 120) + (rnd(k) - 0.5) * 30, bob = Math.abs(Math.sin(t * 4 + k)) * 14; const col = ['#f2b84b', '#e0483e', '#2fb5a8', '#8a7ab0', '#4a9a4a', '#ff8a6a'][k % 6]; return <g key={k} transform={`translate(${px} ${y - bob}) scale(${s * (0.8 + rnd(k + 3) * 0.4)})`}><circle r={34} fill={['#e8b48a', '#d49a6e', '#8a5a3a', '#f0c8a0'][k % 4]} /><circle cx={-11} cy={-4} r={6} fill="#fff" /><circle cx={11} cy={-4} r={6} fill="#fff" /><circle cx={-10} cy={-4} r={3} fill="#111" /><circle cx={12} cy={-4} r={3} fill="#111" /><path d="M-14 14 Q0 26 14 14" stroke="#3a1520" strokeWidth={4} fill="none" /><rect x={-40} y={40} width={80} height={110} rx={30} fill={col} /></g>; })}</g>;
              case 'bolt': return <g key={i} opacity={op}><Bolt {...common} mood={a.mood ?? 'normal'} mouth={mouth} look={o.look ?? 0} props={o.props} spin={t * 40} /></g>;
              case 'crane': return <g key={i} opacity={op}><CraneBust {...common} mood={a.mood ?? 'smug'} mouth={mouth} look={o.look ?? 0} /></g>;
              case 'zombie': return <g key={i} opacity={op}><Zombie {...common} walk={t * (o.run ? 1.8 : 1)} run={o.run} arms={o.arms ?? 0.3} /></g>;
              case 'horde': return <g key={i} opacity={op}><Horde n={o.n ?? 6} x0={o.x0 ?? 0} x1={o.x1 ?? 0} y={y} u={u} t={t} run={o.run} s={s} flip={a.flip} /></g>;
              case 'bike': return <g key={i} opacity={op}><BikeRig {...common} speed={o.speed ?? 1} jump={o.jump ? lerp(0, o.jump, Math.sin(u * Math.PI)) : 0} lean={o.lean ?? 0} junoMood={o.jm} boltMood={o.bm} boltProps={o.bp} talkJ={amp('JUNO')} talkB={amp('BOLT')} withBolt={o.nobolt ? false : true} /></g>;
              case 'cooler': return <g key={i} opacity={op}><Cooler x={x} y={y} s={s} rot={rot} open={o.open ?? 0} glow={o.glow ?? 0} /></g>;
              case 'bus': return <g key={i} opacity={op}><ParadeBus {...common} speed={o.speed ?? 1} /></g>;
              case 'betty': return <g key={i} opacity={op}><Betty x={x} y={y} s={s} rot={rot} swing={o.swing ?? 0} walk={t} /></g>;
              case 'radio': return <g key={i} opacity={op}><Radio x={x} y={y} s={s} t={t} amp={amp('ADA')} /></g>;
              case 'old': return <g transform={`translate(${x} ${y}) scale(${s})`} key={i} opacity={op}><OldMan t={t} mouth={0} /></g>;
              case 'tower': return <g transform={`translate(${x} ${y}) scale(${s})`} key={i} opacity={op}><Tower t={t} hot={o.hot ?? 0} /></g>;
              case 'text':
                return (
                  <text key={i} x={x} y={y} textAnchor="middle" fontSize={(o.size ?? 120) * s} fontWeight={900} fontFamily={FONT_BOLD} fill={o.col ?? C.white} opacity={op} stroke="#000" strokeWidth={o.stroke ?? 0} paintOrder="stroke" transform={`rotate(${rot} ${x} ${y})`}>{o.text}</text>
                );
              case 'cage':
                return <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={op}><rect x={-130} y={-130} width={260} height={260} fill="none" stroke="#8a93a6" strokeWidth={8} />{[-90, -45, 0, 45, 90].map((v) => <line key={v} x1={v} y1={-130} x2={v} y2={130} stroke="#8a93a6" strokeWidth={6} />)}</g>;
              case 'note':
                return <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}><rect x={-110} y={-70} width={220} height={140} fill={C.paper} stroke="#9a8a5a" strokeWidth={4} /><text x={0} y={8} textAnchor="middle" fontSize={26} fontFamily="Inter" fontWeight={800} fill="#222">DELIVER HER</text><text x={0} y={40} textAnchor="middle" fontSize={26} fontFamily="Inter" fontWeight={800} fill="#c0392b">ALIVE.</text></g>;
              default: return null;
            }
          })}
        </g>
        {(shot.fx ?? []).includes('speed') && <SpeedLines t={sceneT} />}
        {(shot.fx ?? []).includes('red') && <rect width={W} height={H} fill="#e0483e" opacity={0.12 + 0.08 * Math.sin(sceneT * 12)} />}
        {(shot.fx ?? []).includes('flash') && <rect width={W} height={H} fill="#fff" opacity={Math.max(0, 0.9 - t * 3)} />}
        {shot.dim !== undefined && <rect width={W} height={H} fill="#000" opacity={shot.dim} />}
        {shot.tint && <rect width={W} height={H} fill={shot.tint} opacity={0.18} />}
      </svg>
    </AbsoluteFill>
  );
};
