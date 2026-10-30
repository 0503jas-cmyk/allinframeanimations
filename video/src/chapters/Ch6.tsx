import React, {useMemo} from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {Finish, FONT, InkText, Layer, LedgerHUD, P, clamp01, easeInOut, hash, lerp, prog, rgba} from '../kit';
import {Shot, ShotCam, makeClock, useShot, Pool, useTime} from '../kitB';
import {alongPoly, bezierChain, bootPath, footPath, polyLength, Pt2} from '../kitB/prints';
import raw from '../data/timing/ch6.json';
import {chapterSeconds} from '../data/layout';

const clock = makeClock(6, raw);
const TOTAL = chapterSeconds(6);
const c = (id: string, o = 0) => clock.cue(id, o);
const e = (id: string, o = 0) => clock.end(id, o);

// ---------------------------------------------------------------- hut plan
const FLOUR = bezierChain([[640, 750], [800, 760], [920, 650], [1100, 630], [1280, 612], [1400, 566], [1594, 540]], 24);
const FLEN = polyLength(FLOUR);
const partial = (pts: Pt2[], len: number) => {
  let d = '';
  const n = Math.max(2, Math.floor(len / 14));
  for (let i = 0; i <= n; i++) {
    const p = alongPoly(pts, (len * i) / n);
    d += (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1);
  }
  return d;
};
const dust = (() => {
  const a: {x: number; y: number; r: number; at: number}[] = [];
  for (let i = 0; i < 30; i++) {
    const at = hash(i * 3.3);
    const p = alongPoly(FLOUR, at * FLEN);
    const off = (hash(i * 7.1) - 0.5) * 90;
    a.push({x: p.x + Math.cos(p.ang + Math.PI / 2) * off, y: p.y + Math.sin(p.ang + Math.PI / 2) * off, r: 2 + hash(i * 5.7) * 3, at});
  }
  return a;
})();
const flourPrints = (() => {
  const out: {x: number; y: number; th: number; left: boolean; at: number}[] = [];
  const n = 20;
  for (let i = 0; i < n; i++) {
    const d = 90 + (i * (FLEN - 180)) / (n - 1);
    const p = alongPoly(FLOUR, d);
    const side = i % 2 ? 1 : -1;
    out.push({x: p.x + Math.cos(p.ang + Math.PI / 2) * 12 * side, y: p.y + Math.sin(p.ang + Math.PI / 2) * 12 * side, th: p.ang + Math.PI / 2 + side * 0.05, left: i % 2 === 1, at: d / FLEN});
  }
  return out;
})();

const HutStatic: React.FC<{blanket: number}> = ({blanket}) => (
  <g>
    <rect x={300} y={120} width={1330} height={840} fill="#0c1426" />
    <rect x={330} y={150} width={1260} height={780} fill="#1a2640" />
    {Array.from({length: 13}, (_, i) => (
      <path key={i} d={`M330 ${150 + i * 60}H1590`} stroke={rgba(P.ink0, 0.45)} strokeWidth={2} />
    ))}
    {Array.from({length: 13}, (_, i) => (
      <path key={'v' + i} d={`M${330 + ((i * 331) % 1260)} ${150 + i * 60}v60`} stroke={rgba(P.ink0, 0.35)} strokeWidth={2} />
    ))}
    {/* window light patch, left wall */}
    <rect x={318} y={300} width={24} height={130} fill={P.boneDim} opacity={0.5} />
    {/* bed */}
    <rect x={380} y={600} width={270} height={290} rx={8} fill="#3a2d3c" stroke={rgba(P.bone, 0.35)} strokeWidth={3} />
    <rect x={392} y={612} width={88} height={266} rx={14} fill="#c9bfa6" opacity={0.75} />
    <rect x={500 + blanket * 70} y={618 - blanket * 24} width={140 - blanket * 40} height={254} rx={10} fill="#4a3e56" transform={`rotate(${blanket * 16} 570 745)`} />
    <path d={`M${510 + blanket * 70} ${660}h100M${510 + blanket * 70} 700h100M${510 + blanket * 70} 740h100`} stroke={rgba(P.ink0, 0.4)} strokeWidth={3} transform={`rotate(${blanket * 16} 570 745)`} />
    {/* desk with ledger */}
    <rect x={720} y={180} width={420} height={130} rx={4} fill="#4b3a2c" stroke={rgba(P.bone, 0.3)} strokeWidth={2} />
    <rect x={760} y={196} width={190} height={98} fill={P.bone} opacity={0.9} />
    <path d="M855 196V294M772 220H940M772 244H940M772 268H940" stroke={rgba(P.penInk, 0.35)} strokeWidth={1.5} />
    <circle cx={1040} cy={245} r={14} fill={P.amberHot} />
    <circle cx={900} cy={380} r={36} fill="#3b3040" stroke={rgba(P.bone, 0.25)} strokeWidth={2} />
    {/* chain coil, key */}
    <g transform="translate(1010,372)" opacity={0.85}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <ellipse key={i} cx={Math.cos(i * 0.8) * 20 + i * 2} cy={Math.sin(i * 0.8) * 14} rx={11} ry={6} fill="none" stroke="#8a93a8" strokeWidth={3} transform={`rotate(${i * 36} ${Math.cos(i * 0.8) * 20} ${Math.sin(i * 0.8) * 14})`} />
      ))}
      <circle cx={52} cy={6} r={6} fill="none" stroke={P.amberDeep} strokeWidth={3} />
      <path d="M58 6h20M72 6v7" stroke={P.amberDeep} strokeWidth={3} />
    </g>
    {/* chest */}
    <rect x={1330} y={760} width={210} height={120} rx={4} fill="#3b2f26" stroke={rgba(P.bone, 0.2)} strokeWidth={2} />
    {/* walls with a door gap on the right */}
    <path d="M321 141H1599V480M1599 600V939H321V141" fill="none" stroke={P.boneDim} strokeWidth={22} strokeLinejoin="miter" />
    <path d="M321 141H1599V480M1599 600V939H321V141" fill="none" stroke={rgba(P.bone, 0.35)} strokeWidth={3} />
  </g>
);

const Flour: React.FC<{p: number; printP: number}> = ({p, printP}) => {
  const len = FLEN * p;
  const dots = dust.filter((d) => d.at <= p);
  let dd = '';
  dots.forEach((d) => (dd += `M${(d.x - d.r).toFixed(1)} ${d.y.toFixed(1)}a${d.r} ${d.r} 0 1 0 ${2 * d.r} 0a${d.r} ${d.r} 0 1 0 ${-2 * d.r} 0`));
  let pr = '';
  flourPrints.forEach((f) => {
    if (f.at <= printP) pr += footPath(f.x, f.y, f.th, 1.55, f.left);
  });
  return (
    <g>
      {p > 0 && <path d={partial(FLOUR, len)} stroke={P.bone} strokeOpacity={0.14} strokeWidth={64} strokeLinecap="round" fill="none" />}
      {p > 0 && <path d={partial(FLOUR, len)} stroke="#e9e2cf" strokeOpacity={0.55} strokeWidth={46} strokeLinecap="round" fill="none" />}
      <path d={dd} fill="#f0e9d6" opacity={0.7} />
      <path d={pr} fill="#10182c" opacity={0.85} />
    </g>
  );
};

const Door: React.FC<{latch: number}> = ({latch}) => (
  <g>
    <rect x={1596} y={478} width={14} height={124} rx={3} fill="#5a4636" stroke={rgba(P.bone, 0.3)} strokeWidth={2} />
    {/* outside: step stone and latch */}
    <rect x={1612} y={470} width={80} height={140} fill="#202c47" />
    <path d={`M1610 540 H${1610 + 56 * (1 - 0 * latch)}`} stroke="#8d93a1" strokeWidth={9} strokeLinecap="round" />
    <circle cx={1610} cy={540} r={8} fill="#a3abc0" />
    <path d="M1664 520v40" stroke="#8d93a1" strokeWidth={7} strokeLinecap="round" />
    <path d="M1664 520q14 20 0 40" stroke="#a3abc0" strokeWidth={5} fill="none" opacity={latch} />
    <text x={1650} y={470} textAnchor="middle" fontFamily={FONT.hud} fontWeight={500} fontSize={14} letterSpacing={4} fill={rgba(P.bone, 0.7 * latch)}>OUTSIDE</text>
  </g>
);

const Hut: React.FC<{flour: number; printP: number; blanket: number; latch?: number; children?: React.ReactNode}> = ({flour, printP, blanket, latch = 0, children}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
    <HutStatic blanket={blanket} />
    <Flour p={flour} printP={printP} />
    <Door latch={latch} />
    {children}
  </svg>
);

const Mask: React.FC<{x: number; y: number; r: number; a?: number}> = ({x, y, r, a = 0.94}) => (
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at ${x}px ${y}px, rgba(5,9,20,0) ${r * 0.3}px, rgba(5,9,20,${a * 0.55}) ${r * 0.7}px, rgba(5,9,20,${a}) ${r}px)`, pointerEvents: 'none'}} />
);

// S1: evening, flour, lying down
const S1: React.FC = () => {
  const {t, cue, end} = useShot();
  const flour = easeInOut(prog(t, cue('c6.02') + 0.8, end('c6.02') - 0.3));
  const lampR = lerp(900, 14, easeInOut(prog(t, cue('c6.04') + 0.3, end('c6.04') - 0.2)));
  const body = prog(t, cue('c6.04'), cue('c6.04') + 1.0);
  const chainFocus = prog(t, cue('c6.03'), cue('c6.03') + 0.6) * (1 - prog(t, cue('c6.03') + 3, cue('c6.03') + 4));
  return (
    <AbsoluteFill style={{background: P.ink0}}>
      <ShotCam keys={[{t: 0, x: 80, y: -30, s: 1.0}, {t: 15.4, x: -20, y: 20, s: 1.12}]} drift={2}>
        <Layer depth={1}>
          <Hut flour={flour} printP={0} blanket={0}>
            {/* she lies down: top-down body */}
            {body > 0 && (
              <g opacity={body}>
                <circle cx={436} cy={745} r={30} fill="#1d1722" />
                <rect x={470} y={690} width={160} height={110} rx={40} fill="#251d2e" />
              </g>
            )}
            {chainFocus > 0 && <circle cx={1040} cy={372} r={70} fill="none" stroke={P.amber} strokeWidth={3} strokeDasharray="8 8" opacity={chainFocus} />}
          </Hut>
          <Mask x={1000} y={245} r={lampR} a={0.96} />
        </Layer>
      </ShotCam>
      <InkText mode="clip" text="no chain" x={1150} y={452} size={34} start={cue('c6.03') + 0.4} end={cue('c6.03') + 1.4} ink="bone" settle={0.5} />
    </AbsoluteFill>
  );
};

// S2a: morning
const Dawn: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <>
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
      <path d="M330 300L1590 600L1590 780L330 430Z" fill={P.bone} opacity={0.07} />
    </svg>
    {children}
  </>
);
const S2a: React.FC = () => {
  const {t, cue, end} = useShot();
  const pp = prog(t, cue('c6.05') + 0.2, end('c6.05') + 1.2);
  return (
    <AbsoluteFill style={{background: '#7d8aa6'}}>
      <ShotCam keys={[{t: 0, x: 50, y: 30, s: 1.35}, {t: 4, x: -30, y: 0, s: 1.15}]} drift={2}>
        <Layer depth={1}>
          <Hut flour={1} printP={pp} blanket={1} />
          <Dawn />
        </Layer>
      </ShotCam>
      <AbsoluteFill style={{background: rgba('#9fb4d4', 0.18), pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

// S2b: macro foot, the second toe is longer
const S2b: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const d = footPath(960, 560, 0.08, 9.5, false);
  const m1 = easeInOut(prog(t, cue('c6.06') + 0.9, cue('c6.06') + 2.0));
  const m2 = easeInOut(prog(t, cue('c6.06') + 1.8, cue('c6.06') + 2.8));
  // toe tip y levels at s=9.5: big toe centre -14.2 r3.2, second -18.6 r2.5
  const y1 = 560 + (-14.2 - 3.2) * 9.5, y2 = 560 + (-18.6 - 2.5) * 9.5;
  return (
    <AbsoluteFill style={{background: '#cfc8b4'}}>
      <ShotCam from={{s: 1.0, r: -0.5}} to={{s: 1.08, r: 0.4}} drift={2}>
        <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
          <defs>
            <radialGradient id="flr" cx="0.5" cy="0.45" r="0.8">
              <stop offset="0" stopColor="#f3eddc" />
              <stop offset="1" stopColor="#b9b19b" />
            </radialGradient>
          </defs>
          <rect width={1920} height={1080} fill="url(#flr)" />
          {Array.from({length: 260}, (_, i) => (
            <circle key={i} cx={hash(i * 2.7) * 1920} cy={hash(i * 5.1) * 1080} r={1 + hash(i) * 2.4} fill={hash(i * 3) > 0.5 ? '#fffaf0' : '#a39b86'} opacity={0.5} />
          ))}
          <path d={d} fill="#6f6b60" opacity={0.55} transform="translate(5 7)" />
          <path d={d} fill="#4c4a47" opacity={0.92} />
          <path d={d} fill="none" stroke="#fffaf0" strokeOpacity={0.5} strokeWidth={3} />
          {/* measuring lines */}
          <path d={`M${700} ${y1}H${1000 - 120 + 150 * m1}`} stroke={P.amberDeep} strokeWidth={3} strokeDasharray="10 8" opacity={m1} />
          <path d={`M${700} ${y2}H${1000 - 120 + 150 * m2}`} stroke={P.amberDeep} strokeWidth={3} strokeDasharray="10 8" opacity={m2} />
          <path d={`M${720} ${y2}V${y1}`} stroke={P.amberDeep} strokeWidth={4} opacity={m2} />
        </svg>
      </ShotCam>
      <InkText mode="clip" text="the second toe" x={380} y={y2 - 20} size={44} start={cue('c6.06') + 1.8} end={cue('c6.06') + 2.8} ink="night" settle={0.4} penHead={false} />
      <InkText mode="clip" text="longer than the first" x={290} y={y1 + 50} size={44} start={cue('c6.06') + 2.6} end={cue('c6.06') + 3.7} ink="night" settle={0.4} penHead={false} />
      <div style={{display: 'none'}}>{dur + end('c6.06')}</div>
    </AbsoluteFill>
  );
};

// S2c: pull back along the path to the door, then the latch
const S2c: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const latch = easeInOut(prog(t, cue('c6.08') + 0.2, cue('c6.08') + 1.2));
  return (
    <AbsoluteFill style={{background: '#7d8aa6'}}>
      <ShotCam keys={[{t: 0, x: -420, y: 150, s: 1.9}, {t: 2.3, x: 100, y: 40, s: 1.25}, {t: 4.1, x: 480, y: 0, s: 2.6}, {t: dur, x: 640, y: 0, s: 3.4}]} drift={2}>
        <Layer depth={1}>
          <Hut flour={1} printP={1} blanket={1} latch={latch} />
          <Dawn />
        </Layer>
      </ShotCam>
      <AbsoluteFill style={{background: rgba('#9fb4d4', 0.16), pointerEvents: 'none'}} />
      <div style={{display: 'none'}}>{end('c6.08')}</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- atlas
const roadY = (x: number) => 540 + 26 * Math.sin(x * 0.0019) - x * 0.004;
const POST_X = 1900;
const HER = (() => {
  const pts: {x: number; y: number; th: number; left: boolean; i: number}[] = [];
  const N = 46;
  const raw: Pt2[] = [];
  for (let i = 0; i < N; i++) {
    const x = 70 + i * 40;
    const lean = -16 * Math.sin((Math.PI * ((i % 5) + 0.5)) / 5);
    raw.push([x, roadY(x) + lean]);
  }
  for (let i = 0; i < N; i++) {
    const a = raw[Math.max(0, i - 1)], b = raw[Math.min(N - 1, i + 1)];
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const side = i % 2 ? 1 : -1;
    pts.push({x: raw[i][0] + Math.cos(ang + Math.PI / 2) * 8 * side, y: raw[i][1] + Math.sin(ang + Math.PI / 2) * 8 * side, th: ang + Math.PI / 2, left: i % 2 === 1, i});
  }
  return pts;
})();
const BOOTS = Array.from({length: 11}, (_, i) => {
  // a ring with a gap on the village side, where her trail comes in
  const a = -Math.PI + 0.75 + (i / 10) * (Math.PI * 2 - 1.5);
  const cx = POST_X + 4, cy = roadY(POST_X);
  return {x: cx + Math.cos(a) * 105, y: cy + Math.sin(a) * 80, th: a + Math.PI / 2, worn: i % 2 === 0};
});

const Atlas: React.FC<{scroll: number; dim?: number; children?: React.ReactNode; road?: boolean}> = ({scroll, dim = 1, children, road = true}) => {
  const snd = useMemo(() => Array.from({length: 70}, (_, i) => ({x: hash(i * 3.7) * 3400 - 200, y: 110 + hash(i * 9.1) * 860, v: 2 + Math.floor(hash(i * 5.3) * 14)})), []);
  let rd = '';
  for (let x = -300; x <= 3100; x += 40) rd += (rd ? 'L' : 'M') + x + ' ' + roadY(x).toFixed(1);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: dim}}>
      <defs>
        <linearGradient id="atl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f1d3a" />
          <stop offset="0.5" stopColor="#14264b" />
          <stop offset="1" stopColor="#0f1d3a" />
        </linearGradient>
      </defs>
      <rect width={1920} height={1080} fill="url(#atl)" />
      <g transform={`translate(${-scroll},0)`}>
        {Array.from({length: 32}, (_, i) => <path key={i} d={`M${-300 + i * 120} 0V1080`} stroke={rgba(P.bone, 0.06)} strokeWidth={1.4} />)}
        {Array.from({length: 10}, (_, i) => <path key={'h' + i} d={`M-300 ${i * 120}H3200`} stroke={rgba(P.bone, 0.06)} strokeWidth={1.4} />)}
        {[0.2, 0.32, 0.68, 0.8].map((f, i) => (
          <path key={'c' + i} d={`M-300 ${1080 * f}C700 ${1080 * (f - 0.05)} 1600 ${1080 * (f + 0.06)} 3200 ${1080 * f}`} fill="none" stroke={rgba(P.bone, 0.1)} strokeWidth={1.5} strokeDasharray={i % 2 ? '4 7' : undefined} />
        ))}
        {snd.map((s, i) => (
          <text key={i} x={s.x} y={s.y} fontFamily={FONT.hud} fontSize={14} fill={rgba(P.bone, 0.3)} fontWeight={500}>{s.v}</text>
        ))}
        <path d="M-300 0H-20Q-90 400 -30 540Q-110 800 -20 1080H-300Z" fill="#26324f" />
        <path d="M-20 0Q-90 400 -30 540Q-110 800 -20 1080" fill="none" stroke={rgba(P.bone, 0.45)} strokeWidth={2.5} />
        <text x={-170} y={roadY(0) - 70} fontFamily={FONT.hud} fontWeight={500} fontSize={20} letterSpacing={4} fill={P.amber}>HARROW DEEP</text>
        {road && (
          <>
            <path d={rd} stroke={P.bone} strokeOpacity={0.9} strokeWidth={64} fill="none" strokeLinecap="round" />
            <path d={rd} stroke="#26324f" strokeWidth={56} fill="none" strokeLinecap="round" />
            <path d={rd} stroke={rgba(P.bone, 0.3)} strokeWidth={2} strokeDasharray="12 14" fill="none" />
          </>
        )}
        {/* the post */}
        <g transform={`translate(${POST_X + 8},${roadY(POST_X) - 78})`}>
          <circle r={15} fill="none" stroke={P.bone} strokeWidth={3} />
          <path d="M-7 4Q-7 -8 0 -9Q7 -8 7 4Z" fill={P.amber} />
          <text y={-26} textAnchor="middle" fontFamily={FONT.hud} fontSize={13} letterSpacing={3} fill={P.boneDim} fontWeight={500}>POST</text>
        </g>
        {children}
      </g>
    </svg>
  );
};

const trail = (upTo: number, left = false, off = 0) => {
  let d = '';
  HER.forEach((p) => {
    if (p.i <= upTo) d += footPath(p.x + off, p.y, p.th, 1.25, p.left);
  });
  return left ? d : d;
};

// S3: following the prints (hero)
const S3: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const a = cue('c6.09') + 0.4, b = end('c6.11') - 1.2;
  const front = prog(t, a, b) * (HER.length - 1);
  const frontX = 70 + Math.min(HER.length - 1, prog(t, a, b) * (HER.length - 1)) * 40;
  const scroll = Math.max(-300, Math.min(POST_X - 1150, frontX - 760));
  const stop = easeInOut(prog(t, end('c6.11') - 1.4, end('c6.11') - 0.4));
  const count = HER.filter((p) => p.i <= front && p.i % 5 === 4);
  const fx = HER[Math.min(HER.length - 1, Math.floor(front))];
  return (
    <AbsoluteFill>
      <ShotCam keys={[{t: 0, s: 1.6, y: 20}, {t: dur, s: 1.3, y: 0}]} drift={2}>
        <Atlas scroll={scroll}>
          <path d={trail(Math.floor(front))} fill={P.amberHot} opacity={0.92} />
          {count.map((p) => (
            <text key={p.i} x={p.x} y={p.y + 54} textAnchor="middle" fontFamily={FONT.accent} fontStyle="italic" fontSize={22} fill={rgba(P.bone, 0.7)}>
              {p.i + 1}
            </text>
          ))}
          {/* her lantern at the head of the trail */}
          <circle cx={fx.x + 40} cy={fx.y} r={9} fill={P.amberHot} opacity={0.9 * (1 - stop)} />
          <circle cx={fx.x + 40} cy={fx.y} r={34} fill={P.amber} opacity={0.18 * (1 - stop)} />
          {/* the last pair, turned to face the village */}
          {stop > 0 && <path d={footPath(POST_X - 18, roadY(POST_X) - 8, -Math.PI / 2, 1.5, false) + footPath(POST_X - 14, roadY(POST_X) + 14, -Math.PI / 2, 1.5, true)} fill={P.amberHot} opacity={stop} />}
          {stop > 0 && <circle cx={POST_X - 16} cy={roadY(POST_X) + 2} r={30 + 60 * stop} fill="none" stroke={P.amber} strokeWidth={2.5} opacity={0.6 * (1 - stop)} />}
        </Atlas>
      </ShotCam>
      <HandNote />
    </AbsoluteFill>
  );
};
const HandNote: React.FC = () => null;

// S4: the ring of boots
const S4: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const boots = Math.floor(11 * prog(t, cue('c6.13') + 0.2, end('c6.13') - 0.3));
  const corr = easeInOut(prog(t, cue('c6.14') + 0.1, cue('c6.14') + 1.4));
  let bd = '';
  BOOTS.forEach((b, i) => {
    if (i < boots) bd += bootPath(b.x, b.y, b.th, 1.7, b.worn);
  });
  const cx = POST_X + 20, cy = roadY(POST_X);
  return (
    <AbsoluteFill>
      <ShotCam keys={[{t: 0, x: 0, y: 0, s: 1.9, r: 0}, {t: dur, x: 0, y: 0, s: 2.35, r: 1.2}]} drift={1}>
        <Atlas scroll={POST_X - 1000}>
          <path d={trail(HER.length - 1)} fill={P.amberHot} opacity={0.9} />
          <path d={footPath(POST_X - 18, cy - 8, -Math.PI / 2, 1.5, false) + footPath(POST_X - 14, cy + 14, -Math.PI / 2, 1.5, true)} fill={P.amberHot} />
          <path d={bd} fill={P.bone} opacity={0.82} />
          {/* a corridor around hers that no boot enters */}
          {[-1, 1].map((sd) => (
            <path key={sd} d={'M' + HER.slice(-16).map((p, i, a) => { const q = a[Math.min(a.length - 1, i + 1)], r = a[Math.max(0, i - 1)]; const ang = Math.atan2(q.y - r.y, q.x - r.x) + Math.PI / 2; return `${(p.x + Math.cos(ang) * 38 * sd).toFixed(1)} ${(p.y + Math.sin(ang) * 38 * sd).toFixed(1)}`; }).join('L')} fill="none" stroke={P.amber} strokeWidth={2.4} strokeDasharray="9 8" opacity={0.85 * corr} />
          ))}
          <ellipse cx={cx} cy={cy} rx={120} ry={96} fill="none" stroke={P.teal} strokeWidth={1.8} strokeDasharray="6 8" opacity={0.5 * clamp01(boots / 11)} />
        </Atlas>
      </ShotCam>
    </AbsoluteFill>
  );
};

// S5a: the index card
const S5a: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const s0 = cue('c6.15') + 0.4;
  const s1 = end('c6.16') - 0.4;
  const L = [
    'She walks barefoot, every night.',
    'The flood tide takes her prints.',
    'I wake. The sand is clean.',
    'So I never counted her feet.',
  ];
  const slice = (s1 - s0) / 4;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 80% at 50% 40%, ${P.ink2}, ${P.ink0})`}}>
      <ShotCam from={{s: 1.0, r: -1.2}} to={{s: 1.1, r: 0.2}} drift={2}>
        <div style={{position: 'absolute', left: 430, top: 250, width: 1060, height: 580, backgroundImage: `url(${staticFile('kit/paper.jpg')})`, backgroundSize: '100% 100%', boxShadow: `0 30px 60px ${rgba(P.ink0, 0.7)}`, transform: 'rotate(-1.4deg)'}}>
          <div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 80px ${rgba('#6b5a3a', 0.45)}`}} />
          <svg width={1060} height={580} style={{position: 'absolute', inset: 0}}>
            {[0, 1, 2, 3].map((i) => <path key={i} d={`M50 ${170 + i * 100}H1010`} stroke={rgba(P.boneDim, 0.55)} strokeWidth={1.5} />)}
            <path d="M50 96H1010" stroke={rgba(P.blood, 0.45)} strokeWidth={2} />
          </svg>
          <div style={{position: 'absolute', left: 52, top: 34, fontFamily: FONT.title, fontSize: 18, letterSpacing: '0.3em', color: rgba(P.penInk, 0.7)}}>CASE NOTE</div>
        </div>
        {L.map((s, i) => (
          <InkText key={i} mode="clip" text={s} x={490} y={440 + i * 100} size={52} start={s0 + i * slice} end={s0 + (i + 1) * slice - 0.2} ink="night" settle={0.6} />
        ))}
      </ShotCam>
      <div style={{display: 'none'}}>{dur + t}</div>
    </AbsoluteFill>
  );
};

// S5b: registration of old prints onto hers
const S5b: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const snap = easeInOut(prog(t, cue('c6.17') + 0.2, cue('c6.18') - 0.1));
  const a = 1 - snap;
  const seg = HER.filter((p) => p.i >= 14 && p.i <= 34);
  const cx = seg[10].x, cy = seg[10].y;
  const tr = `translate(${a * 70} ${a * -44}) rotate(${a * 9} ${cx} ${cy}) translate(${cx} ${cy}) scale(${1 + a * 0.08}) translate(${-cx} ${-cy})`;
  let now = '';
  let old = '';
  seg.forEach((p) => {
    now += footPath(p.x, p.y, p.th, 1.5, p.left);
    old += footPath(p.x, p.y, p.th, 1.5, p.left);
  });
  const pulse = prog(t, cue('c6.18'), cue('c6.18') + 0.8);
  return (
    <AbsoluteFill>
      <ShotCam keys={[{t: 0, s: 1.7, r: -3}, {t: dur, s: 1.9, r: 0}]}>
        <Atlas scroll={cx - 960}>
          <path d={now} fill={P.amberHot} opacity={0.9} />
          <g transform={tr}>
            <path d={old} fill="none" stroke={P.bone} strokeWidth={2} opacity={0.85} />
            <path d={old} fill={P.bone} opacity={0.35} />
          </g>
          <ellipse cx={cx} cy={cy} rx={150 + 120 * pulse} ry={70 + 60 * pulse} fill="none" stroke={P.amber} strokeWidth={3} opacity={(1 - pulse) * (pulse > 0 ? 0.9 : 0)} />
        </Atlas>
      </ShotCam>
      <InkText mode="clip" text="atlas, forty-one years ago" x={120} y={140} size={34} start={cue('c6.17') + 0.1} end={cue('c6.17') + 1.6} ink="bone" settle={0} />
      <InkText mode="clip" text="the flour night" x={120} y={190} size={34} start={cue('c6.17') + 1.0} end={cue('c6.17') + 2.0} ink="amber" settle={0} />
    </AbsoluteFill>
  );
};

// S6: the heels that did not go home (doubt beat)
const S6: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const cy = roadY(POST_X);
  const route = easeInOut(prog(t, cue('c6.19') + 1.2, cue('c6.19') + 4.5)) * (1 - easeInOut(prog(t, cue('c6.20') - 0.5, cue('c6.20') + 0.6)));
  const heelA = easeInOut(prog(t, cue('c6.19') + 4.2, cue('c6.19') + 5.2));
  const pulse = (k: number) => 0.55 + 0.45 * Math.sin((t - cue('c6.20')) * 3.2 + k);
  const dimAll = 0.22 + 0.5 * heelA;
  const fade = 1 - easeInOut(prog(t, cue('c6.21') + 0.6, dur));
  return (
    <AbsoluteFill>
      <ShotCam keys={[{t: 0, s: 1.1, y: 0}, {t: dur, s: 1.5, y: 0}]} drift={1}>
        <Atlas scroll={POST_X - 1000} dim={dimAll * fade + 0.0}>
          {/* the expected route home */}
          <path d={`M${POST_X - 40} ${cy} L${POST_X - 40 - 1500 * route} ${roadY(POST_X - 1500 * route)}`} stroke={P.amber} strokeWidth={3.5} strokeDasharray="4 14" strokeLinecap="round" opacity={0.7} />
          {/* two heel marks, planted deep, facing the village lamps */}
          {[[-36, -14], [-30, 20]].map(([dx, dy], k) => (
            <g key={k} opacity={heelA}>
              <ellipse cx={POST_X + dx} cy={cy + dy} rx={16 + 4 * pulse(k)} ry={22 + 4 * pulse(k)} fill={rgba(P.amber, 0.14 * pulse(k))} />
              <path d={bootPath(POST_X + dx, cy + dy, -Math.PI / 2, 2.1, k === 0)} fill={P.bone} opacity={0.9} />
              <circle cx={POST_X + dx + 14} cy={cy + dy} r={34 * pulse(k) + 12} fill="none" stroke={P.amber} strokeWidth={2} opacity={0.4 * pulse(k)} />
            </g>
          ))}
        </Atlas>
      </ShotCam>
      <AbsoluteFill style={{background: rgba(P.ink0, 0.35 * (1 - fade) + 0.0), pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the rope, side view, one long shot
const ROPE_X = 960, ROPE_W = 250, ROPE_H = 3000;
const Strands: React.FC = () => {
  const items = useMemo(() => Array.from({length: Math.ceil(ROPE_H / 62) + 2}, (_, i) => i), []);
  let a = '', b = '', cc = '';
  items.forEach((i) => {
    const y = -62 + i * 62;
    const xl = ROPE_X - ROPE_W / 2 + 22, xr = ROPE_X + ROPE_W / 2 - 22;
    a += `M${xl} ${y + 70}Q${ROPE_X} ${y + 20} ${xr} ${y - 22}`;
    b += `M${xl} ${y + 62}Q${ROPE_X} ${y + 12} ${xr} ${y - 30}`;
    cc += `M${xl + 8} ${y + 54}Q${ROPE_X} ${y + 6} ${xr - 8} ${y - 36}`;
  });
  return (
    <>
      <path d={a} stroke="#5b3513" strokeWidth={58} strokeLinecap="round" fill="none" />
      <path d={b} stroke="#a06a2c" strokeWidth={30} strokeLinecap="round" fill="none" opacity={0.85} />
      <path d={cc} stroke="#e0a458" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.55} strokeDasharray="14 10" />
    </>
  );
};
const WOOL_Y = 560;
const fibres = Array.from({length: 18}, (_, i) => {
  const sx = ROPE_X + 6 + (hash(i * 3.1) - 0.3) * 70;
  const sy = WOOL_Y + (hash(i * 5.3) - 0.5) * 150;
  const dir = hash(i * 7.7) > 0.5 ? 1 : -1;
  const len = 90 + hash(i * 9.1) * 120;
  return {sx, sy, dir, len, k: hash(i * 2.3), ph: hash(i) * 6};
});

const S7: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const g1y = 2380;
  const groove2 = prog(t, cue('c6.24'), cue('c6.26') + 1.0);
  const deep = easeInOut(prog(t, cue('c6.25'), cue('c6.25') + 1.2));
  const woolP = easeInOut(prog(t, cue('c6.27') + 0.3, end('c6.27') - 0.2));
  const fadeRope = easeInOut(prog(t, cue('c6.28') - 0.2, cue('c6.28') + 1.4));
  const wool = (
    <g>
      {fibres.map((f, i) => {
        const L = f.len * woolP;
        const sw = Math.sin(t * 1.3 + f.ph) * 8 * woolP;
        return (
          <path key={i} d={`M${f.sx} ${f.sy}q${f.dir * (L * 0.5)} ${-L * 0.15 + sw} ${f.dir * L * 0.9 + sw} ${-L * 0.55 * f.k}`} stroke="#9ba2b2" strokeWidth={2.4 + f.k * 2} strokeLinecap="round" fill="none" opacity={0.9 * clamp01(woolP * 3)} />
        );
      })}
    </g>
  );
  const camY = lerp(1360, 100, easeInOut(prog(t, cue('c6.25') + 1.0, cue('c6.26') + 3.4)));
  const sc = lerp(1.0, 1.3, easeInOut(prog(t, cue('c6.27'), cue('c6.28') + 2)));
  const wy = camY; // camera y centre offset
  void wy;
  return (
    <AbsoluteFill style={{background: `linear-gradient(90deg, #1a1626 0%, ${P.ink1} 45%, #0b2230 100%)`}}>
      <ShotCam keys={[{t: 0, x: 0, y: 1360, s: 1.0}, {t: cue('c6.25') + 1.0, x: 0, y: 1330, s: 1.04}, {t: cue('c6.26') + 3.4, x: 0, y: 120, s: 1.12}, {t: dur, x: 0, y: 70, s: 1.35}]} drift={2}>
        <Layer depth={1}>
          <svg width={1920} height={ROPE_H} style={{position: 'absolute', left: 0, top: 0}}>
            <g opacity={1 - fadeRope}>
              <clipPath id="tr">
                <rect x={ROPE_X - ROPE_W / 2} y={-10} width={ROPE_W} height={ROPE_H} rx={26} />
              </clipPath>
              <g clipPath="url(#tr)">
                <Strands />
                {/* her bright groove: the lower reach */}
                <rect x={ROPE_X + ROPE_W * 0.12} y={1450} width={ROPE_W * 0.38} height={g1y - 1450} fill="#e6b06a" opacity={0.5} />
                {Array.from({length: 9}, (_, k) => <path key={k} d={`M${ROPE_X + ROPE_W * 0.12 + k * 11} 1450V${g1y}`} stroke={P.amberHot} strokeWidth={2.2} opacity={0.35} />)}
                {/* the older, deeper groove, higher up, under hers at the bottom */}
                {(() => {
                  const yb = 1700, yt = 1700 - 1450 * groove2;
                  return (
                    <g>
                      <rect x={ROPE_X + ROPE_W * 0.03} y={yt} width={ROPE_W * 0.3} height={yb - yt} fill={P.ink0} opacity={0.35 + 0.4 * deep} />
                      <path d={`M${ROPE_X + ROPE_W * 0.03} ${yt}V${yb}`} stroke={P.ink0} strokeWidth={5} opacity={0.8} />
                      <path d={`M${ROPE_X + ROPE_W * 0.33} ${yt}V${yb}`} stroke={P.amberHot} strokeWidth={3} opacity={0.5 * deep} />
                    </g>
                  );
                })()}
                <rect x={ROPE_X - ROPE_W / 2} y={0} width={ROPE_W * 0.45} height={ROPE_H} fill={rgba(P.ink0, 0.26)} />
              </g>
              <path d={`M${ROPE_X - ROPE_W / 2} 0V${ROPE_H}`} stroke={rgba(P.ink0, 0.9)} strokeWidth={5} />
              <path d={`M${ROPE_X + ROPE_W / 2} 0V${ROPE_H}`} stroke={rgba(P.teal, 0.35)} strokeWidth={3} />
            </g>
            {wool}
          </svg>
        </Layer>
        <Pool x={300} y={420} r={800} a={0.2} />
      </ShotCam>
      <div style={{display: 'none'}}>{sc}</div>
    </AbsoluteFill>
  );
};

const Hud: React.FC = () => {
  const t = useTime();
  const on = prog(t, c('c6.05'), c('c6.05') + 0.6) * (1 - prog(t, c('c6.19') - 0.4, c('c6.19') + 0.2) * (1 - prog(t, c('c6.22'), c('c6.22') + 0.6)));
  const g = prog(t, c('c6.28') - 0.3, c('c6.28') + 0.5) * 0.7;
  if (on <= 0.01) return null;
  return <LedgerHUD out={1} in={0} night={14977} mode="mini" opacity={clamp01(on)} glitch={g} />;
};

export const Chapter: React.FC = () => (
  <AbsoluteFill style={{background: P.ink0}}>
    <Shot from={0} to={15.9} clock={clock} fadeIn={0.8} fadeOut={0}><S1 /></Shot>
    <Shot from={15.4} to={19.4} clock={clock} fadeIn={0.9} fadeOut={0}><S2a /></Shot>
    <Shot from={19.0} to={23.0} clock={clock} fadeIn={0.5} fadeOut={0}><S2b /></Shot>
    <Shot from={22.6} to={27.9} clock={clock} fadeIn={0.5} fadeOut={0}><S2c /></Shot>
    <Shot from={27.4} to={42.4} clock={clock} fadeIn={0.7} fadeOut={0}><S3 /></Shot>
    <Shot from={41.8} to={50.0} clock={clock} fadeIn={0.5} fadeOut={0}><S4 /></Shot>
    <Shot from={49.6} to={58.6} clock={clock} fadeIn={0.6} fadeOut={0}><S5a /></Shot>
    <Shot from={58.2} to={63.2} clock={clock} fadeIn={0.5} fadeOut={0}><S5b /></Shot>
    <Shot from={62.8} to={74.0} clock={clock} fadeIn={0.6} fadeOut={0}><S6 /></Shot>
    <Shot from={73.4} to={TOTAL} clock={clock} fadeIn={0.8} fadeOut={0.6}><S7 /></Shot>
    <Hud />
    <Finish grain={0.06} />
  </AbsoluteFill>
);
export const _unused = [e];
