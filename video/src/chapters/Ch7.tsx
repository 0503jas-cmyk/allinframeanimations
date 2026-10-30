import React, {useMemo} from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {Bell, Finish, FONT, InkText, Lantern, Layer, LedgerHUD, P, Silhouette, Sky, clamp01, easeInOut, easeOut, hash, lerp, prog, rgba} from '../kit';
import {Shot, ShotCam, makeClock, useShot, Sea, LampDisc, Pool, PageSheet, COL, ChalkWord, useTime} from '../kitB';
import raw from '../data/timing/ch7.json';
import {chapterSeconds} from '../data/layout';

const clock = makeClock(7, raw);
const TOTAL = chapterSeconds(7);
const c = (id: string, o = 0) => clock.cue(id, o);
const e = (id: string, o = 0) => clock.end(id, o);
const GREY = '#959bab';
const CUT = e('c7.35');

// ------------------------------------------------------------ S1: the coat
const Coat: React.FC<{sway: number}> = ({sway}) => (
  <g transform={`rotate(${sway} 960 210)`}>
    {/* peg */}
    <circle cx={960} cy={210} r={16} fill="#2a1f19" />
    {/* body */}
    <path d="M820 270 Q960 200 1100 270 L1150 330 L1190 720 L1140 760 L1090 740 L1100 880 L1100 930 L820 930 L820 880 L830 740 L780 760 L730 720 L770 330Z" fill="#838a9a" />
    <path d="M960 215 V930" stroke="#5c6272" strokeWidth={4} />
    <path d="M830 270 Q960 330 1090 270" stroke="#6c7384" strokeWidth={6} fill="none" />
    {[380, 470, 560, 650, 740].map((y) => <circle key={y} cx={982} cy={y} r={9} fill="#4a4f5e" />)}
    {/* sleeve folds */}
    <path d="M770 340 Q750 520 735 700M1150 340 Q1170 520 1185 700" stroke="#6c7384" strokeWidth={5} fill="none" />
    <path d="M880 400 Q870 640 880 900M1040 400 Q1050 640 1040 900" stroke="#737a8a" strokeWidth={3} fill="none" opacity={0.7} />
    {/* right-hand cuffs (viewer's right = coat's left) */}
    <path d="M1135 700 L1190 725 L1145 765 L1090 742Z" fill="#6f7585" />
    <path d="M1090 742 L1145 765" stroke="#4d5262" strokeWidth={4} />
    <path d="M1120 748 l16 14 l-6 12 l12 6" stroke="#a9afbd" strokeWidth={2.4} fill="none" strokeLinecap="round" />
  </g>
);
const S1a: React.FC = () => {
  const {t, dur} = useShot();
  return (
    <AbsoluteFill style={{background: '#1a140f'}}>
      <ShotCam keys={[{t: 0, x: 0, y: 60, s: 1.0}, {t: dur, x: 150, y: 330, s: 1.55}]} drift={2}>
        <Layer depth={0.6}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <rect width={1920} height={1080} fill="#2a1f19" />
            {Array.from({length: 17}, (_, i) => <path key={i} d={`M${i * 120} 0V1080`} stroke={rgba('#0d0907', 0.7)} strokeWidth={4} />)}
            {Array.from({length: 17}, (_, i) => <path key={'g' + i} d={`M${i * 120 + 40} ${(i * 211) % 900}v90`} stroke={rgba('#0d0907', 0.35)} strokeWidth={2} />)}
          </svg>
        </Layer>
        <Layer depth={1}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <Coat sway={Math.sin(t * 0.9) * 0.7} />
          </svg>
        </Layer>
        <Pool x={420} y={420} r={900} a={0.28} />
      </ShotCam>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0,0,0,0), ${rgba(P.ink0, 0.7)})`}} />
    </AbsoluteFill>
  );
};

const Yarn: React.FC<{x: number; y: number; len: number; ph: number; col: string; tw?: number; frayAt?: number}> = ({x, y, len, ph, col, tw = 1}) => {
  let a = '', b = '', hi = '';
  for (let i = 0; i <= 60; i++) {
    const u = i / 60;
    const xx = x + u * len;
    const w = Math.sin(u * 22 * tw + ph) * 16;
    a += (i ? 'L' : 'M') + xx.toFixed(1) + ' ' + (y + w).toFixed(1);
    b += (i ? 'L' : 'M') + xx.toFixed(1) + ' ' + (y - w).toFixed(1);
    if (i % 3 === 0) hi += `M${xx.toFixed(1)} ${(y - 26).toFixed(1)}L${(xx + 9).toFixed(1)} ${(y + 26).toFixed(1)}`;
  }
  return (
    <g>
      <path d={a} stroke={col} strokeWidth={26} strokeLinecap="round" fill="none" />
      <path d={b} stroke={col} strokeWidth={26} strokeLinecap="round" fill="none" opacity={0.85} />
      <path d={hi} stroke="#5f6577" strokeWidth={4} opacity={0.5} />
      <path d={a} stroke="#c3c8d4" strokeWidth={3} fill="none" opacity={0.5} />
    </g>
  );
};

const S1b: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const same = easeInOut(prog(t, cue('c7.03'), cue('c7.03') + 0.8));
  const twist = easeInOut(prog(t, cue('c7.04'), cue('c7.04') + 0.7));
  const worn = easeInOut(prog(t, cue('c7.05') - 0.3, cue('c7.05') + 0.9));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 80% at 50% 45%, #241d28, ${P.ink0})`}}>
      <ShotCam from={{s: 1.0, x: -30}} to={{s: 1.1, x: 40}} drift={2}>
        <Layer depth={1}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            {/* two cards */}
            {[[170, 'COAT · LEFT CUFF'], [1010, 'ROPE · FROM THE POST']].map(([x, l], i) => (
              <g key={i}>
                <rect x={x as number} y={230} width={740} height={470} fill={P.bone} opacity={0.93} rx={4} />
                <rect x={(x as number) + 10} y={240} width={720} height={450} fill="none" stroke={rgba(P.penInk, 0.25)} strokeWidth={2} />
                <text x={(x as number) + 40} y={284} fontFamily={FONT.title} fontSize={20} letterSpacing={5} fill={rgba(P.penInk, 0.75)}>{l as string}</text>
              </g>
            ))}
            <Yarn x={220} y={470} len={640} ph={0} col={GREY} />
            <Yarn x={1060} y={470} len={640} ph={0.0} col={GREY} />
            {/* same twist: tick every cycle */}
            {Array.from({length: 11}, (_, k) => {
              const xx = (k * 640) / 22 * 2 + 0;
              return (
                <g key={k} opacity={twist}>
                  <path d={`M${220 + xx + 40} 520V552`} stroke={P.amber} strokeWidth={3} />
                  <path d={`M${1060 + xx + 40} 520V552`} stroke={P.amber} strokeWidth={3} />
                </g>
              );
            })}
            {/* swatches */}
            <circle cx={440} cy={620} r={34 * same} fill={GREY} />
            <circle cx={1280} cy={620} r={34 * same} fill={GREY} />
            <path d={`M${660 - 5} 620h${30 * same}M${660 - 5} 632h${30 * same}`} stroke={P.penInk} strokeWidth={4} opacity={same} transform="translate(-20 -6)" />
            {/* the worn-through cuff, as a hole with threads */}
            <g opacity={worn} transform="translate(0 0)">
              <rect x={170} y={730} width={740} height={230} fill="#7d8494" />
              {Array.from({length: 22}, (_, k) => <path key={k} d={`M170 ${735 + k * 10}H910`} stroke="#6a7081" strokeWidth={2} />)}
              {Array.from({length: 36}, (_, k) => <path key={'v' + k} d={`M${180 + k * 21} 730V960`} stroke="#8d94a4" strokeWidth={2} />)}
              <ellipse cx={540} cy={845} rx={110 * worn} ry={46 * worn} fill={P.ink0} />
              {Array.from({length: 14}, (_, k) => {
                const a = (k / 14) * Math.PI * 2;
                return <path key={k} d={`M${540 + Math.cos(a) * 100 * worn} ${845 + Math.sin(a) * 42 * worn}q${Math.cos(a) * 30} ${Math.sin(a) * 18 + 8} ${Math.cos(a + 0.5) * 44} ${Math.sin(a + 0.5) * 24}`} stroke="#b4bac8" strokeWidth={2.4} fill="none" />;
              })}
            </g>
          </svg>
        </Layer>
      </ShotCam>
      <InkText mode="clip" text="the same grey" x={420} y={760} size={0.001} start={0} end={1} ink="bone" settle={0} penHead={false} />
      <div style={{display: 'none'}}>{dur + end('c7.05') + t}</div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ S2: margin line, slack line
const S2a: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const res = easeInOut(prog(t, cue('c7.06') + 0.4, cue('c7.07') + 1.6));
  const jam = 1 - res;
  const lines = ['The bell kept ringing', 'after the road shut.', 'Line slack at hut.'];
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 80% at 50% 40%, ${P.ink2}, ${P.ink0})`}}>
      <ShotCam keys={[{t: 0, x: -60, y: 20, s: 1.0, r: -0.8}, {t: dur, x: 60, y: -20, s: 1.2, r: 0.4}]} drift={2}>
        <Layer depth={1}>
          <PageSheet x={300} y={120} lamp={{x: 800, y: 300}} title="ATLAS · MARGIN">
            {/* cramped, then resolving, margin hand */}
            {lines.map((s, i) => {
              const y0 = 560 + jam * 34 * (1 - i) - i * 0;
              const yy = lerp(560 + i * 8, 540 + i * 54, res);
              return (
                <div key={i} style={{position: 'absolute', left: 90 + jam * i * 8, top: yy, fontFamily: FONT.hand, fontStyle: 'italic', fontSize: lerp(21, 40, res), letterSpacing: `${lerp(-0.05, 0, res)}em`, color: P.penInk, opacity: 0.55 + 0.45 * res, whiteSpace: 'pre', transform: `rotate(${lerp(-2 + i, 0, res)}deg)`}}>
                  {s}
                </div>
              );
            })}
            {/* a second hand overscribbled, fading */}
            <div style={{position: 'absolute', left: 96, top: 548, fontFamily: FONT.hand, fontStyle: 'italic', fontSize: 22, letterSpacing: '-0.06em', color: P.penInk, opacity: 0.5 * jam, whiteSpace: 'pre', transform: 'rotate(1deg)'}}>
              harbour keeper · wind NW · bell kept ringing after the road shut · line slack at hut
            </div>
          </PageSheet>
        </Layer>
      </ShotCam>
      <div style={{display: 'none'}}>{end('c7.07')}</div>
    </AbsoluteFill>
  );
};

const S2b: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const trace = easeInOut(prog(t, cue('c7.08') - 0.2, cue('c7.09') + 0.9));
  // cord from the wall hole to the hook, slack: a catenary-ish curve
  const hx = 360, hy = 300, kx = 1480, ky = 470;
  const pt = (u: number) => ({x: lerp(hx, kx, u), y: lerp(hy, ky, u) + 170 * 4 * u * (1 - u) * 0.5});
  let d = '';
  for (let i = 0; i <= 40; i++) {
    const p = pt(i / 40);
    d += (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1);
  }
  const f = pt(trace);
  return (
    <AbsoluteFill style={{background: '#2a1f19'}}>
      <ShotCam keys={[{t: 0, x: -80, y: 0, s: 1.1}, {t: dur, x: 90, y: 30, s: 1.25}]} drift={2}>
        <Layer depth={1}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <rect width={1920} height={1080} fill="#2a1f19" />
            {Array.from({length: 17}, (_, i) => <path key={i} d={`M0 ${i * 70}H1920`} stroke={rgba('#0d0907', 0.7)} strokeWidth={4} />)}
            <circle cx={hx} cy={hy} r={34} fill="#0d0907" />
            <circle cx={hx} cy={hy} r={34} fill="none" stroke={P.amberDeep} strokeWidth={3} opacity={0.6} />
            <path d={d} stroke={P.amberDeep} strokeWidth={9} fill="none" strokeLinecap="round" />
            <path d={d} stroke={P.amberHot} strokeWidth={2} fill="none" opacity={0.6} strokeDasharray="10 8" />
            {/* the hook, empty */}
            <path d={`M${kx} ${ky - 60}V${ky - 10}q0 40 34 40q34 0 34 -34`} stroke="#8a93a8" strokeWidth={10} fill="none" strokeLinecap="round" />
            <circle cx={kx} cy={ky - 62} r={10} fill="#a3abc0" />
            <circle cx={kx + 34} cy={ky + 16} r={56} fill="none" stroke={P.amber} strokeWidth={2.5} strokeDasharray="8 8" opacity={easeInOut(prog(trace, 0.85, 1))} />
            {/* her fingertip */}
            <g transform={`translate(${f.x} ${f.y + 4})`}>
              <path d="M0 0 L240 190" stroke="#3a3040" strokeWidth={34} strokeLinecap="round" />
              <path d="M-8 -8 L232 182" stroke={rgba(P.amber, 0.5)} strokeWidth={3} strokeLinecap="round" />
              <circle cx={0} cy={0} r={18} fill="#4a3f52" />
            </g>
          </svg>
        </Layer>
        <Pool x={400} y={300} r={700} a={0.25} />
      </ShotCam>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0,0,0,0), ${rgba(P.ink0, 0.65)})`}} />
      <div style={{display: 'none'}}>{end('c7.09') + t}</div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ S3: strongroom
const Strongroom: React.FC = () => {
  const {t, cue, dur} = useShot();
  const lampX = lerp(-100, 2020, easeInOut(prog(t, 0.2, dur - 0.4)));
  const spines = useMemo(() => {
    const out: {x: number; y: number; w: number; h: number; col: string}[] = [];
    for (let r = 0; r < 4; r++) {
      let x = 60;
      let i = 0;
      while (x < 1900) {
        const w = 34 + hash(r * 50 + i) * 26;
        const h = 150 + hash(r * 70 + i * 3) * 30;
        out.push({x, y: 190 + r * 230 - h + 190, w, h, col: ['#4a3426', '#3a2a22', '#2f3a4a', '#4a2f2f', '#3a4636'][Math.floor(hash(r * 11 + i * 7) * 5)]});
        x += w + 3;
        i++;
      }
    }
    return out;
  }, []);
  void cue;
  return (
    <AbsoluteFill style={{background: '#07090f'}}>
      <ShotCam keys={[{t: 0, x: -100, y: 0, s: 1.05}, {t: dur, x: 100, y: 10, s: 1.12}]} drift={2}>
        <Layer depth={1}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            {[0, 1, 2, 3].map((r) => <rect key={r} x={0} y={380 + r * 230} width={1920} height={14} fill="#1a120e" />)}
            {spines.map((s, i) => {
              const d = Math.abs(s.x + s.w / 2 - lampX);
              const lit = Math.max(0, 1 - d / 420);
              return (
                <g key={i}>
                  <rect x={s.x} y={s.y} width={s.w} height={s.h} fill={s.col} opacity={0.35 + 0.65 * lit} />
                  <path d={`M${s.x + s.w * 0.2} ${s.y + 12}h${s.w * 0.6}M${s.x + s.w * 0.2} ${s.y + s.h - 14}h${s.w * 0.6}`} stroke={P.amberHot} strokeWidth={2.4} opacity={0.2 + 0.7 * lit} />
                  <path d={`M${s.x + 2} ${s.y}V${s.y + s.h}`} stroke={P.amberHot} strokeWidth={2.6} opacity={lit * 0.85} />
                </g>
              );
            })}
          </svg>
        </Layer>
        <Lantern x={lampX} y={800} scale={1.2} glow={320} seed={7} />
      </ShotCam>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0), ${rgba(P.ink0, 0.6)})`}} />
    </AbsoluteFill>
  );
};

type Hand = {label: string; slant: number; weight: number; tracking: number; size: number; child?: boolean; dx: number; dy: number};
const HANDS: Hand[] = [
  {label: 'KELL', slant: 0, weight: 1.9, tracking: 0.32, size: 62, dx: 0, dy: 0},
  {label: 'WENNA', slant: -22, weight: 1.0, tracking: 0.12, size: 52, dx: 20, dy: -10},
  {label: '?', slant: 10, weight: 1.1, tracking: 0.2, size: 56, child: true, dx: -10, dy: 12},
];
const Relief: React.FC<{h: Hand; start: number; end: number}> = ({h, start, end}) => {
  const x = COL.in + 40 + h.dx, y = COL.row(2) + h.dy;
  const common = {text: 'IN: 1', size: h.size, start, end, slant: h.slant, weight: h.weight, tracking: h.tracking, hand: h.child ? ('child' as const) : ('adult' as const), settle: 0.1};
  return (
    <>
      <InkText mode="stroke" {...common} x={x + 2.4} y={y + 2.4} ink="bone" penHead={false} style={{opacity: 0.6}} />
      <InkText mode="stroke" {...common} x={x - 1.4} y={y - 1.4} ink="stone" penHead={false} style={{opacity: 0.55}} />
      <InkText mode="stroke" {...common} x={x} y={y} ink="pencil" penHead />
    </>
  );
};
const Raking: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const starts = [cue('c7.13') - 0.5, cue('c7.14') + 0.3, cue('c7.15') + 0.1];
  const pageT = [0, cue('c7.14') - 0.4, cue('c7.15') - 0.5];
  const sweep = (t * 0.22) % 1;
  const idx = t < pageT[1] ? 0 : t < pageT[2] ? 1 : 2;
  const slide = [1, easeInOut(prog(t, pageT[1], pageT[1] + 0.7)), easeInOut(prog(t, pageT[2], pageT[2] + 0.7))];
  const labels = [cue('c7.14'), cue('c7.15'), cue('c7.16') + 0.4];
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 70% at 30% 40%, ${P.ink2}, ${P.ink0})`}}>
      <ShotCam keys={[{t: 0, x: 60, y: -100, s: 1.7}, {t: dur, x: 120, y: -105, s: 2.0}]} drift={2}>
        <Layer depth={1}>
          {[0, 1, 2].map((k) => (
            <PageSheet key={k} x={300 + (1 - slide[k]) * 1500 * (k ? 1 : 0)} y={120 + (1 - slide[k]) * 60 * (k ? 1 : 0)} rotate={(1 - slide[k]) * 3 * (k ? 1 : 0) + (k - 1) * 0.4} lamp={{x: 100 + sweep * 1000, y: 700}} opacity={k <= idx ? 1 : 0}>
              <svg width={1200} height={820} style={{position: 'absolute', inset: 0}}>
                <rect width={1200} height={820} fill={`url(#rk${k})`} opacity={0.35} />
                <defs>
                  <linearGradient id={`rk${k}`} x1="0" y1="0" x2="1" y2="0.25">
                    <stop offset={clamp01(sweep - 0.25)} stopColor="#000" stopOpacity="0.5" />
                    <stop offset={sweep} stopColor="#fff" stopOpacity="0.5" />
                    <stop offset={clamp01(sweep + 0.25)} stopColor="#000" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
              </svg>
              <InkText mode="stroke" text="14,9" x={COL.out - 226} y={COL.row(2)} size={30} start={-9} end={-8} ink="night" penHead={false} />
              <InkText mode="stroke" text="1" x={COL.out + 20} y={COL.row(2)} size={34} start={-9} end={-8} ink="night" penHead={false} />
              <Relief h={HANDS[k]} start={starts[k]} end={starts[k] + (k === 2 ? 1.5 : 1.1)} />
              <div style={{position: 'absolute', left: COL.in + 8, top: COL.row(2) + 40, fontFamily: FONT.title, fontSize: 18, letterSpacing: '0.3em', color: rgba(P.penInk, 0.55 * easeOut(prog(t, labels[k], labels[k] + 0.6)))}}>{HANDS[k].label}</div>
            </PageSheet>
          ))}
        </Layer>
      </ShotCam>
      <div style={{display: 'none'}}>{end('c7.16')}</div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ the smear and the bread
const Smear: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const match = easeInOut(prog(t, cue('c7.17') + 0.2, cue('c7.17') + 2.0));
  const rub = easeInOut(prog(t, cue('c7.17') + 2.6, end('c7.17') - 0.2));
  const sx = COL.in + 30, sy = COL.row(0) - 10;
  const smear = 'M0 20Q60 -10 130 14T290 8Q330 20 360 4';
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 80% at 50% 40%, ${P.ink2}, ${P.ink0})`}}>
      <ShotCam from={{s: 1.7, x: 80, y: -250}} to={{s: 1.5, x: 120, y: -245}} drift={2}>
        <Layer depth={1}>
          <PageSheet x={300} y={110} lamp={{x: 760, y: 220}}>
            <svg width={1200} height={820} style={{position: 'absolute', inset: 0}}>
              <defs>
                <clipPath id="rubc"><rect x={sx - 30 + 400 * rub} y={0} width={1200} height={820} /></clipPath>
              </defs>
              <g transform={`translate(${sx} ${sy + 20})`} clipPath="url(#rubc)">
                <path d={smear} stroke="#6f7688" strokeWidth={34} strokeLinecap="round" fill="none" opacity={0.32 * match + 0.0} />
                <path d={smear} stroke="#6f7688" strokeWidth={14} strokeLinecap="round" fill="none" opacity={0.3 * match} />
              </g>
              {/* three hands' strokes drift in and coincide with the smear */}
              {[0, 1, 2].map((k) => {
                const a = 1 - match;
                return (
                  <g key={k} transform={`translate(${sx + 40 + k * 100 + a * (k - 1) * 90} ${sy + 28 + a * (k - 1) * 50})`} opacity={clamp01(1 - rub * 1.6) * (0.2 + 0.7 * (1 - Math.abs(a - 0.4)) * (match > 0 ? 1 : 0))}>
                    <path d="M0 0v34M14 -2v36M30 0v32" stroke="#6f7688" strokeWidth={5} strokeLinecap="round" />
                  </g>
                );
              })}
              {/* the crust of bread */}
              {rub > 0 && rub < 1 && (
                <g transform={`translate(${sx - 30 + 400 * rub + 10} ${sy + 24 + Math.sin(rub * 40) * 10})`}>
                  <path d="M0 0Q-10 -34 28 -40Q70 -42 78 -6Q82 30 40 36Q-6 40 0 0Z" fill="#b98a4e" />
                  <path d="M12 -14Q36 -30 64 -10" stroke="#e0b377" strokeWidth={4} fill="none" strokeLinecap="round" />
                  {[0, 1, 2, 3].map((q) => <circle key={q} cx={-12 - q * 14} cy={10 + (q % 2) * 14} r={2.4} fill="#e0b377" opacity={0.8} />)}
                </g>
              )}
            </svg>
          </PageSheet>
        </Layer>
      </ShotCam>
      <div style={{display: 'none'}}>{dur}</div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ S4: the one wide
const ROAD_Y = 790;
const HUT_X = 330;
const POST_X7 = 1060;
const WALK = {x0: HUT_X + 60, x1: POST_X7 + 150};
const RING = Array.from({length: 11}, (_, i) => {
  const a = (i / 11) * Math.PI * 2;
  return {x: POST_X7 + 130 + Math.cos(a) * 190, y: ROAD_Y - 38 + Math.sin(a) * 26, back: Math.sin(a) < 0};
});
const STRIKES7 = Array.from({length: 9}, (_, i) => c('c7.22') + 1.6 + i * 1.65);

const Wide: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const door = easeInOut(prog(t, cue('c7.19') + 0.6, cue('c7.19') + 2.6));
  const walk = prog(t, cue('c7.20') + 0.8, cue('c7.22') + 0.2);
  const wx = lerp(WALK.x0, WALK.x1 - 30, easeInOut(walk));
  const walking = walk > 0 && walk < 1;
  const grab = prog(t, cue('c7.22') + 0.4, cue('c7.22') + 1.4);
  const lampsT = (i: number) => prog(t, cue('c7.25') + i * 0.18, cue('c7.25') + 2.6 + i * 0.12);
  return (
    <AbsoluteFill>
      <ShotCam keys={[{t: 0, x: 200, y: 0, s: 1.0}, {t: cue('c7.19'), x: 140, y: 0, s: 1.03}, {t: cue('c7.22'), x: 60, y: -10, s: 1.1}, {t: dur, x: 30, y: -20, s: 1.2}]} drift={3}>
        <Layer depth={0.04} x={-80}>
          <Sky mood="calm" stars={140} moon={{x: 1560, y: 200, r: 52}} clouds={3} horizon={740} seed={21} />
        </Layer>
        {/* far hill with the village */}
        <Layer depth={0.16}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <path d="M-60 760 L-60 520 Q160 470 330 560 Q500 640 640 700 L740 760Z" fill="#05080f" />
          </svg>
          <Silhouette kind="village" x={-30} y={560} scale={0.52} fill="#04070d" lit={11} seed={3} />
        </Layer>
        <Layer depth={0.5} x={-240}>
          <Sea tide={0.1} width={2500} streakFrom={780} layers={[{y: 764, amp: 5, wl: 520, speed: 12, top: P.ink3, bottom: P.ink2}, {y: 812, amp: 8, wl: 420, speed: -18, top: P.ink2, bottom: P.ink1, foam: true}, {y: 884, amp: 11, wl: 330, speed: 26, top: P.ink1, bottom: P.ink0}, {y: 985, amp: 15, wl: 260, speed: -34, top: P.ink0, bottom: '#03050b'}]} />
        </Layer>
        <Layer depth={0.7}>
          <div style={{position: 'absolute', left: HUT_X - 40, top: ROAD_Y - 20, width: 1700, height: 18, background: 'linear-gradient(180deg,#46557a,#1f2b47)', borderRadius: 3}} />
          <Silhouette kind="clerkHut" x={HUT_X} y={ROAD_Y - 18} scale={0.5} fill="#03060e" lit={1} />
          {door > 0 && <div style={{position: 'absolute', left: HUT_X + 52, top: ROAD_Y - 18 - 38, width: 16, height: 38, background: P.amberHot, opacity: door * 0.9, borderRadius: 2}} />}
          {door > 0 && <Pool x={HUT_X + 60} y={ROAD_Y - 24} r={80 + 60 * door} a={0.3 * door} />}
          <Bell x={POST_X7} y={ROAD_Y} size={0.6} strikes={STRIKES7} amp={16} />
          {/* the sleepwalker, white nightdress, left hand held a little away */}
          {walk > 0 && (
            <>
              <Silhouette kind="mother" x={wx} y={ROAD_Y} scale={0.62} fill="#cfd4e0" walk={walking ? {speed: 0.55, bob: 1.5} : undefined} rim={rgba(P.teal, 0.5)} seed={3} />
              <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
                <path d={`M${wx - 10} ${ROAD_Y - 92}L${lerp(wx - 38, wx + 82, grab)} ${lerp(ROAD_Y - 62, ROAD_Y - 130, grab)}`} stroke="#cfd4e0" strokeWidth={6} strokeLinecap="round" />
              </svg>
            </>
          )}
          {/* the eleven lamps, down the hill and into a ring */}
          {RING.map((l, i) => {
            const u = easeInOut(lampsT(i));
            if (u <= 0) return null;
            const sx = 120 + i * 18, sy = 560 + i * 6;
            const x = lerp(sx, l.x, u), y = lerp(sy, l.y - 30, u) - Math.sin(u * Math.PI) * 60;
            return <LampDisc key={i} x={x} y={y} r={11} seed={i + 40} a={0.95} />;
          })}
        </Layer>
        <Layer depth={1.15}>
          {/* the Stone, big, foreground right; Maren sits at its foot with a dark lantern */}
          <Silhouette kind="stone" x={1640} y={1060} scale={1.9} fill="#03060e" tide={0.3} />
          <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <g transform="translate(1390 1050)">
              <path d="M-50 0 Q-60 -70 -20 -110 Q0 -150 28 -110 Q64 -70 56 0Z" fill="#02040a" />
              <circle cx={4} cy={-128} r={24} fill="#02040a" />
              <rect x={52} y={-34} width={16} height={22} fill="#02040a" />
              <rect x={56} y={-26} width={8} height={4} fill={P.amberHot} opacity={0.9} />
            </g>
          </svg>
        </Layer>
      </ShotCam>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 80% at 50% 50%, rgba(0,0,0,0), ${rgba(P.ink0, 0.45)})`}} />
      <div style={{display: 'none'}}>{end('c7.18')}</div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ S5: the ring of lamps, Kell's hand, Wenna
const Ring: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const sub = easeOut(prog(t, cue('c7.28') + 0.2, cue('c7.28') + 0.8)) * (1 - easeInOut(prog(t, end('c7.28') + 0.3, end('c7.28') + 1.2)));
  const L = RING;
  return (
    <AbsoluteFill>
      <ShotCam keys={[{t: 0, x: 30, y: -20, s: 1.25}, {t: dur, x: 90, y: -90, s: 1.9}]} drift={2}>
        <Layer depth={0.04} x={-80}>
          <Sky mood="calm" stars={120} moon={{x: 1500, y: 180, r: 50}} clouds={2} horizon={740} seed={21} />
        </Layer>
        <Layer depth={0.5} x={-240}>
          <Sea tide={0.1} width={2500} layers={[{y: 764, amp: 5, wl: 520, speed: 12, top: P.ink3, bottom: P.ink2}, {y: 812, amp: 8, wl: 420, speed: -18, top: P.ink2, bottom: P.ink1, foam: true}, {y: 884, amp: 11, wl: 330, speed: 26, top: P.ink1, bottom: P.ink0}]} />
        </Layer>
        <Layer depth={0.8}>
          <div style={{position: 'absolute', left: -200, top: ROAD_Y - 20, width: 2400, height: 18, background: 'linear-gradient(180deg,#46557a,#1f2b47)', borderRadius: 3}} />
          <Bell x={POST_X7} y={ROAD_Y} size={0.6} strikes={[]} swing={0} showRope />
          <Pool x={POST_X7 + 130} y={ROAD_Y - 40} r={420} a={0.22} />
          {/* her, still at the rope */}
          <Silhouette kind="mother" x={POST_X7 + 150} y={ROAD_Y} scale={0.9} fill="#cfd4e0" rim={rgba(P.teal, 0.5)} />
          {/* Kell takes her elbow */}
          <Silhouette kind="walker" x={POST_X7 + 60} y={ROAD_Y + 4} scale={0.95} fill="#03060e" lantern={0.9} flip rim={rgba(P.amber, 0.4)} />
          {/* Wenna holds a lamp up near her face */}
          <Silhouette kind="mother" x={POST_X7 + 250} y={ROAD_Y + 6} scale={0.9} fill="#05080f" rim={rgba(P.amber, 0.35)} seed={5} />
          <Lantern x={POST_X7 + 214} y={ROAD_Y - 160} scale={0.7} glow={150} seed={9} />
          {L.map((l, i) => (
            <LampDisc key={i} x={l.x} y={l.y - 26 + (l.back ? -6 : 18)} r={l.back ? 9 : 12} seed={i + 40} a={0.95} />
          ))}
        </Layer>
      </ShotCam>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', fontFamily: FONT.hand, fontStyle: 'italic', fontSize: 46, color: P.bone, opacity: sub * 0.95, textShadow: `0 2px 20px ${P.ink0}`}}>There you are.</div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ S6: the pencil
const PencilShape: React.FC<{x: number; y: number; rot: number; len?: number; w?: number}> = ({x, y, rot, len = 360, w = 20}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d={`M0 0 L${len * 0.14} ${-w / 2} H${len} V${w / 2} H${len * 0.14}Z`} fill="#c9a24a" />
    <path d={`M0 0 L${len * 0.14} ${-w / 2} V${w / 2}Z`} fill="#e7c89a" />
    <path d={`M0 0 L${len * 0.05} ${-w * 0.17} V${w * 0.17}Z`} fill="#444a58" />
    <path d={`M${len * 0.16} ${-w * 0.18}H${len}`} stroke="#f0dc9c" strokeWidth={2} opacity={0.7} />
    <rect x={len - 40} y={-w / 2} width={40} height={w} fill="#a8553f" opacity={0.0} />
  </g>
);
const KellBust: React.FC = () => {
  const {t, cue, dur} = useShot();
  const take = easeInOut(prog(t, cue('c7.30') + 0.3, cue('c7.30') + 1.6));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 70% at 70% 45%, #2a1f19, ${P.ink0})`}}>
      <ShotCam keys={[{t: 0, x: 60, y: 0, s: 1.05}, {t: dur, x: -20, y: 10, s: 1.2}]} drift={2}>
        <Layer depth={1}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            {/* Kell from behind and the side: head, ear, shoulder; no face */}
            <path d="M420 1080 Q440 800 640 760 Q720 740 760 700 Q820 650 800 560 Q800 430 700 410 Q600 400 560 480 Q540 520 560 600 Q520 700 460 760 Q380 840 380 1080Z" fill="#05080f" />
            <path d="M800 560 Q810 500 790 470" stroke={rgba(P.amber, 0.6)} strokeWidth={4} fill="none" />
            <ellipse cx={690} cy={540} rx={20} ry={34} fill="#0a1020" />
            <g transform={`translate(${lerp(690, 1180, take)} ${lerp(520, 640, take)}) rotate(${lerp(-12, 24, take)})`}>
              <PencilShape x={0} y={0} rot={0} len={300} />
            </g>
            {/* his hand, lifting it away: grey graphite thumb */}
            <g transform={`translate(${lerp(700, 1170, take)} ${lerp(560, 690, take)})`} opacity={take}>
              <ellipse cx={0} cy={0} rx={52} ry={34} fill="#3a2f33" />
              <path d="M-30 -10 Q-10 -30 20 -22" stroke="#9aa0ae" strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.7} />
            </g>
          </svg>
        </Layer>
        <Pool x={1500} y={300} r={800} a={0.34} />
      </ShotCam>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 70% at 55% 50%, rgba(0,0,0,0), ${rgba(P.ink0, 0.7)})`}} />
    </AbsoluteFill>
  );
};

const Writes: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const ws = cue('c7.32') - 0.4, we = end('c7.33') - 0.9;
  const prgs = easeInOut(prog(t, ws, we));
  // pencil tip follows the writing front
  const tipX = lerp(COL.in + 30, COL.in + 40 + 250, prgs);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 80% at 50% 40%, ${P.ink2}, ${P.ink0})`}}>
      <ShotCam keys={[{t: 0, x: 60, y: -250, s: 1.5}, {t: dur, x: 130, y: -255, s: 1.9}]} drift={2}>
        <Layer depth={1}>
          <PageSheet x={300} y={110} lamp={{x: 760, y: 260}}>
            <InkText mode="stroke" text="14,978" x={COL.out - 226} y={COL.row(0)} size={34} start={-5} end={-4} ink="night" penHead={false} />
            <InkText mode="stroke" text="IN: 1" x={COL.in + 30} y={COL.row(0)} size={64} start={ws} end={we} ink="pencil" weight={1.5} tracking={0.26} slant={-4} penHead={false} />
            <svg width={1200} height={820} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
              <PencilShape x={tipX + 5} y={COL.row(0) - 20 + Math.sin(t * 20) * 1.5} rot={-148} len={480} w={26} />
            </svg>
          </PageSheet>
        </Layer>
      </ShotCam>
    </AbsoluteFill>
  );
};

const Doorway: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const ext = easeInOut(prog(t, cue('c7.35') - 0.1, cue('c7.35') + 1.2));
  const look = easeInOut(prog(t, cue('c7.34'), cue('c7.34') + 1.0));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 70% at 40% 50%, #2a1f19, ${P.ink0})`}}>
      <ShotCam keys={[{t: 0, x: 0, y: 0, s: 1.0}, {t: dur, x: 60, y: 10, s: 1.12}]} drift={2}>
        <Layer depth={1}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            {/* desk edge and the ledger, lamp */}
            <rect x={0} y={760} width={1920} height={320} fill="#1a120e" />
            <rect x={380} y={690} width={700} height={90} fill="#4b3a2c" />
            <rect x={470} y={670} width={300} height={30} fill={P.bone} opacity={0.9} />
            {/* Kell seated, turning toward us */}
            <path d={`M560 760 Q570 520 700 470 Q${780 + look * 40} 440 ${790 + look * 40} 360 Q${780 + look * 40} 270 700 270 Q640 280 620 340 Q600 400 620 470`} fill="#04070d" />
            <circle cx={700 + look * 40} cy={320} r={58} fill="#04070d" />
            <path d={`M${744 + look * 40} 300 Q${758 + look * 40} 330 ${744 + look * 40} 360`} stroke={rgba(P.amber, 0.6)} strokeWidth={4} fill="none" />
            {/* the pencil, held out toward the doorway (the viewer) */}
            <g transform={`translate(${lerp(840, 1200, ext)} ${lerp(520, 560, ext)}) rotate(${lerp(-10, 6, ext)})`}>
              <PencilShape x={0} y={0} rot={0} len={lerp(260, 620, ext)} w={lerp(18, 30, ext)} />
            </g>
            <g transform={`translate(${lerp(820, 1180, ext)} ${lerp(530, 580, ext)})`}>
              <ellipse cx={-30} cy={0} rx={60} ry={34} fill="#2f262c" />
              <path d="M-60 -12 Q-30 -40 6 -26" stroke="#9aa0ae" strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.7} />
            </g>
          </svg>
        </Layer>
        <Lantern x={1420} y={400} scale={1.4} glow={420} seed={3} />
      </ShotCam>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0,0,0,0), ${rgba(P.ink0, 0.62)})`}} />
      <div style={{display: 'none'}}>{end('c7.35')}</div>
    </AbsoluteFill>
  );
};

const Hud: React.FC = () => {
  const t = useTime();
  const on = prog(t, c('c7.10'), c('c7.10') + 0.6) * (1 - prog(t, c('c7.17') + 3.4, c('c7.17') + 4.2));
  if (on <= 0.01) return null;
  return <LedgerHUD out={1} in={0} night={14978} mode="mini" opacity={on} tone={P.pencil} />;
};

export const Chapter: React.FC = () => (
  <AbsoluteFill style={{background: P.ink0}}>
    <Shot from={0} to={8.9} clock={clock} fadeIn={0.8} fadeOut={0}><S1a /></Shot>
    <Shot from={8.4} to={15.1} clock={clock} fadeIn={0.5} fadeOut={0}><S1b /></Shot>
    <Shot from={14.6} to={28.9} clock={clock} fadeIn={0.5} fadeOut={0}><S2a /></Shot>
    <Shot from={28.2} to={34.6} clock={clock} fadeIn={0.5} fadeOut={0}><S2b /></Shot>
    <Shot from={34.0} to={42.3} clock={clock} fadeIn={0.5} fadeOut={0}><Strongroom /></Shot>
    <Shot from={41.8} to={59.6} clock={clock} fadeIn={0.5} fadeOut={0}><Raking /></Shot>
    <Shot from={59.0} to={64.8} clock={clock} fadeIn={0.5} fadeOut={0}><Smear /></Shot>
    <Shot from={64.2} to={97.2} clock={clock} fadeIn={1.0} fadeOut={0}><Wide /></Shot>
    <Shot from={96.6} to={105.6} clock={clock} fadeIn={0.6} fadeOut={0}><Ring /></Shot>
    <Shot from={105.0} to={109.6} clock={clock} fadeIn={0.6} fadeOut={0}><KellBust /></Shot>
    <Shot from={109.0} to={118.9} clock={clock} fadeIn={0.5} fadeOut={0}><Writes /></Shot>
    <Shot from={118.4} to={CUT} clock={clock} fadeIn={0.5} fadeOut={0}><Doorway /></Shot>
    <Hud />
    <Finish grain={0.06} />
  </AbsoluteFill>
);
export const _unused7 = [ChalkWord, TOTAL];
