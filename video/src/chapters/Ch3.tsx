import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {
  AnkleShot, Bell, Causeway, FONT, Finish, Footprint, InkText, Lantern, LedgerHUD, LedgerPage, Layer, P, Sky, WaterLayers, clamp01, easeInOut, easeOut, hash, lerp, loadTiming, noise, prog, rgba, rollValue, useSec,
} from '../kit';
import raw from '../data/timing/ch3.json';
import {LAYOUT, chapterSeconds} from '../data/layout';
import {Cam, Scenes, SoundSpec, mkT, sfxTimes, useS} from '../kitA/scene';
import {Chalk, Motes, Tally} from '../kitA/parts';
import {WomanBack} from '../kitA/figures';
import SND from '../kitA/sound/ch3.json';

const timing = loadTiming(raw as any);
const T = mkT(timing, LAYOUT[3].lead);
const END = chapterSeconds(3);
const BELLS = sfxTimes(SND as unknown as SoundSpec, T, 'bell');

// ---------------------------------------------------------------- atlas, map and cards
const dashPath = (d: string, p: number, color: string, w = 4) => (
  <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${clamp01(p)} 2`} />
);

const Card: React.FC<{x: number; at: number; title: string; children: (p: number) => React.ReactNode}> = ({x, at, title, children}) => {
  const t = useSec();
  const i = easeOut(prog(t, at, at + 0.6));
  if (i <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: 730 + (1 - i) * 300, width: 360, height: 250, opacity: i, background: P.bone, boxShadow: `0 20px 50px ${rgba('#000', 0.6)}`, transform: `rotate(${(x - 960) * 0.004}deg)`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 14, textAlign: 'center', fontFamily: FONT.title, fontSize: 22, letterSpacing: '0.3em', color: P.penInk}}>{title}</div>
      <svg width={360} height={250} style={{position: 'absolute', inset: 0}}>{children(prog(t, at + 0.5, at + 2.4))}</svg>
    </div>
  );
};

const Atlas: React.FC = () => {
  const {t, L, dur} = useS();
  const prints: Footprint[] = [];
  for (let i = 0; i < 46; i++) prints.push({x: 0.03 + i * 0.019, t: L(T.a('c3.05', 1.5)) + i * 0.09, dir: 'out', size: 'adult', lane: -0.5 + hash(i) * 0.3});
  for (let i = 0; i < 18; i++) prints.push({x: 0.5 + i * 0.02, t: L(T.a('c3.06', 0.5)) + i * 0.12, dir: 'in', size: 'adult', lane: 0.5 + hash(i + 4) * 0.2});
  const lampsOn = easeInOut(prog(t, L(T.a('c3.02', 0.4)), L(T.a('c3.02', 1.4))));
  const lampsOff = 1 - easeInOut(prog(t, L(T.a('c3.03', 0.4)), L(T.a('c3.04', 0.2))));
  const lamps = lampsOn * lampsOff;
  const fold = easeInOut(prog(t, 0, 1.6));
  const g0 = L(T.a('c3.07', 0.3));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 90% at 50% 50%, ${P.ink2}, ${P.ink0})`}}>
      <Cam from={{s: 1.0, x: -20}} to={{s: 1.08, x: 30}} drift={2}>
        <Layer depth={0.8}>
          <div style={{position: 'absolute', inset: 0, perspective: 2200}}>
            <div style={{position: 'absolute', inset: 0, transformOrigin: '0% 50%', transform: `rotateY(${-70 * (1 - fold)}deg)`, opacity: 0.3 + 0.7 * fold}}>
              <Causeway mode="map" tide={0.05} prints={prints} now={t} />
            </div>
          </div>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <Lantern key={i} x={640 + i * 100 + Math.sin(t * 0.9 + i) * 8} y={500 + Math.sin(t * 1.3 + i * 1.7) * 14} glowOnly glow={46} lit={lamps} seed={i + 1} />
          ))}
        </Layer>
      </Cam>
      <Card x={200} at={L(T.a('c3.06', 0.2))} title="BOOT">
        {(p) => (
          <>
            {dashPath('M120 90C90 90 85 150 118 160C145 168 160 130 150 100C145 90 130 88 120 90Z', p, P.penInk, 5)}
            {dashPath('M120 180C100 182 100 214 122 214C144 214 142 182 120 180Z', clamp01(p * 1.6 - 0.6), P.penInk, 5)}
            {dashPath('M230 90C205 90 200 150 228 160C255 168 270 130 262 100C257 90 242 88 230 90Z', clamp01(p * 1.3 - 0.3), P.penInk, 5)}
          </>
        )}
      </Card>
      <Card x={780} at={L(T.a('c3.06', 0.9))} title="DOG">
        {(p) => (
          <>
            {dashPath('M150 150C130 140 120 175 140 195C160 210 205 210 222 190C238 170 225 140 205 150C190 156 170 156 150 150Z', p, P.penInk, 5)}
            {[[120, 120], [158, 98], [204, 98], [242, 120]].map(([cx, cy], i) => (
              <g key={i}>{dashPath(`M${cx - 13} ${cy}A13 16 0 1 1 ${cx + 13} ${cy}A13 16 0 1 1 ${cx - 13} ${cy}`, clamp01(p * 2 - 0.5 - i * 0.2), P.penInk, 5)}</g>
            ))}
          </>
        )}
      </Card>
      <Card x={1360} at={L(T.a('c3.06', 1.6))} title="CART">
        {(p) => (
          <>
            {dashPath('M30 120H330', p, P.penInk, 6)}
            {dashPath('M30 200H330', clamp01(p * 1.3 - 0.2), P.penInk, 6)}
            {Array.from({length: 9}, (_, i) => dashPath(`M${50 + i * 34} 112V128`, clamp01(p * 2 - i * 0.12), P.penInk, 4))}
          </>
        )}
      </Card>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - easeInOut(prog(t, g0 + 3.4, g0 + 4))}}>
        <InkText text="GHOST" x={960} y={400} size={170} start={g0} end={g0 + 1.4} ink="bone" align="center" tracking={0.2} weight={1.2} />
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <path d="M560 340Q960 310 1380 330" stroke={P.blood} strokeWidth={9} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={`${easeInOut(prog(t, g0 + 1.8, g0 + 2.4))} 2`} />
        </svg>
      </div>
      <Motes n={12} seed={31} opacity={0.3} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Wenna
const Wenna: React.FC = () => {
  const {t} = useS();
  return (
    <AbsoluteFill style={{background: '#0a0f20'}}>
      <Cam from={{s: 1.0, x: 30}} to={{s: 1.08, x: -20}} drift={2}>
        <Layer depth={0.6}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <rect width={1920} height={1080} fill="#14122a" />
            <rect x={0} y={430} width={1920} height={18} fill="#2a1d14" />
            <rect x={0} y={700} width={1920} height={18} fill="#2a1d14" />
            {Array.from({length: 22}, (_, i) => (
              <g key={i}>
                <path d={`M${100 + i * 80} 0V${150 + hash(i) * 120}`} stroke={P.bone} strokeWidth={3} opacity={0.55} />
                <path d={`M${100 + i * 80} ${150 + hash(i) * 120}V${200 + hash(i) * 120}`} stroke={P.amberDeep} strokeWidth={7} opacity={0.8} />
              </g>
            ))}
            {Array.from({length: 18}, (_, i) => (
              <rect key={i} x={120 + i * 96} y={380} width={40} height={50} rx={6} fill="#3a2a1e" />
            ))}
          </svg>
          <Lantern x={500} y={600} glow={320} seed={2} />
          <Lantern x={1500} y={330} glow={240} seed={5} />
        </Layer>
        <Layer depth={0.9}>
          <WomanBack x={960} y={1000} scale={0.9} flipX={1} sway={Math.sin(t * 0.8) * 0.8} fill="#02040a" />
        </Layer>
      </Cam>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Kell's hands
const Kell: React.FC = () => {
  const {t, L, dur} = useS();
  const grey = easeInOut(prog(t, L(T.a('c3.10', 0.3)), L(T.a('c3.10', 1.2))));
  const shade = prog(t, L(T.a('c3.11', 0)), L(T.a('c3.12', 2.6)));
  const sub1 = L(T.a('c3.13', 0.1));
  const sub2 = L(T.a('c3.14', 0.1));
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#1a1626,#0a0d1a)'}}>
      <Cam keys={[{t: 0, s: 1.0, x: 0, y: 0}, {t: L(T.a('c3.10', 0)), s: 1.3, x: 120, y: -10}, {t: L(T.a('c3.12', 0)), s: 1.15, x: 40, y: -20}, {t: dur, s: 1.1, x: 0, y: 0}]} drift={2}>
        <Layer depth={1}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 0.6}}>
            {Array.from({length: 7}, (_, i) => (
              <path key={i} d={`M0 ${i * 170}H1920`} stroke="#03050c" strokeWidth={5} />
            ))}
          </svg>
          {/* table grain */}
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 0.5}}>
            {Array.from({length: 26}, (_, i) => (
              <path key={i} d={`M0 ${i * 44 + hash(i) * 12}Q480 ${i * 44 + hash(i + 3) * 30} 960 ${i * 44} T1920 ${i * 44 + hash(i + 5) * 14}`} stroke="#05070e" strokeWidth={1.5 + hash(i + 9) * 2} fill="none" />
            ))}
          </svg>
          <LedgerPage x={760} y={170} scale={0.95} width={1200} lamp={{x: 420, y: 300}} rotate={-3} rows={[{date: '4 March', in: ['IN: 1'], ink: 'child', writeAt: -9}]} />
          {/* graphite thumbprint appearing on the page edge */}
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <g opacity={grey * 0.75} transform="translate(900 700) rotate(-24)">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <ellipse key={i} cx={0} cy={0} rx={22 + i * 9} ry={30 + i * 12} fill="none" stroke="#6f7688" strokeWidth={2.6} strokeDasharray={i % 2 ? '50 14' : undefined} />
              ))}
              <ellipse cx={0} cy={0} rx={60} ry={80} fill="#6f7688" opacity={0.2} />
            </g>
            {/* the pencil, with a worn point and a smudged tip */}
            <g transform="translate(260 840) rotate(-12)">
              <rect x={0} y={-11} width={330} height={22} rx={3} fill="#a99a6b" />
              <rect x={0} y={-11} width={330} height={7} fill="#d3c48e" />
              <rect x={0} y={4} width={330} height={7} fill="#7d6f46" opacity={0.7} />
              <path d="M330 -11L398 0L330 11Z" fill="#d9b98a" />
              <path d="M378 -4L398 0L378 4Z" fill="#3a3a44" />
              <rect x={-22} y={-11} width={24} height={22} rx={3} fill="#6b4a3a" />
            </g>
            {/* Kell's shadow slides across the page, then lingers on the table not the page */}
            <path d={`M${1500 - shade * 1400} 0L${2100 - shade * 1400} 0L${1700 - shade * 1400} 1080L${1100 - shade * 1400} 1080Z`} fill="#02040a" opacity={0.55 * Math.sin(Math.PI * clamp01(shade))} />
          </svg>
        </Layer>
      </Cam>
      <InkText mode="clip" text={'"Nobody came home that night, Maren,"'} x={960} y={930} size={44} align="center" start={sub1} end={sub1 + 2.0} ink="bone" settle={0} penHead={false} style={{opacity: 1 - easeInOut(prog(t, sub2 - 0.3, sub2))}} />
      <InkText mode="clip" text={'"That is why you keep the book."'} x={960} y={930} size={44} align="center" start={sub2} end={sub2 + 2.2} ink="bone" settle={0} penHead={false} />
      <Lantern x={560} y={380} glowOnly glow={420} seed={3} />
      <Motes n={16} seed={33} opacity={0.4} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- three facts, then myself
const FactCards: React.FC = () => {
  const {t, L} = useS();
  const items = [
    {w: 'BELL RANG', at: L(T.a('c3.15', 0.2)), x: 640, y: 330, r: -7},
    {w: 'ROAD EMPTY', at: L(T.a('c3.16', 0.2)), x: 1240, y: 440, r: 5},
    {w: 'LEDGER SHORT', at: L(T.a('c3.16', 1.7)), x: 860, y: 640, r: -3},
  ];
  const away = easeInOut(prog(t, L(T.a('c3.18', -0.1)), L(T.a('c3.18', 0.7))));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 70% at 50% 45%, ${P.ink2}, ${P.ink0})`}}>
      {items.map((c, i) => {
        const d = easeOut(prog(t, c.at, c.at + 0.35));
        if (d <= 0) return null;
        const j = prog(t, c.at + 0.5, c.at + 9);
        const rot = c.r + noise(i + 3, t * 2.2) * 3 * j;
        const jx = noise(i + 7, t * 2.8) * 10 * j;
        return (
          <div key={i} style={{position: 'absolute', left: c.x - 330 + jx, top: c.y - 100 + (1 - d) * -500 + away * 900, width: 660, height: 200, background: P.bone, boxShadow: `0 24px 60px ${rgba('#000', 0.6)}`, transform: `rotate(${rot}deg)`, textAlign: 'center', fontFamily: FONT.title, fontSize: 58, letterSpacing: '0.16em', lineHeight: '200px', color: P.penInk}}>
            {c.w}
          </div>
        );
      })}
      <InkText text="MYSELF" x={960} y={640} size={220} start={L(T.a('c3.18', 0.3))} end={L(T.a('c3.18', 1.4))} ink="amber" align="center" tracking={0.2} weight={1.3} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the chain
const Chain: React.FC = () => {
  const {t, L, dur} = useS();
  const tension = easeInOut(prog(t, L(T.a('c3.23', 0)), L(T.a('c3.24', 1.5))));
  const lock = easeOut(prog(t, L(T.a('c3.23', 0.6)), L(T.a('c3.23', 1.4))));
  return (
    <AbsoluteFill style={{background: P.ink0}}>
      <Cam from={{x: -50, s: 1.0}} to={{x: 40, s: 1.08}} drift={2}>
        <Layer depth={0.4}>
          <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 60% at 20% 30%, ${rgba(P.amber, 0.16)}, rgba(0,0,0,0) 70%), linear-gradient(180deg, #0c1530, ${P.ink0})`}} />
          <Lantern x={300} y={250} glow={230} scale={1.4} hang seed={8} />
        </Layer>
        <Layer depth={1}>
          <AnkleShot tension={0.15 + tension * 0.7} jingle={t > L(T.a('c3.22', 0)) ? 0.8 * (1 - tension) + 0.1 : 0} />
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <g opacity={lock} transform="translate(1250 700)">
              <rect x={-26} y={-30} width={52} height={50} rx={6} fill="#b7863a" stroke="#6b4a18" strokeWidth={4} />
              <circle cx={0} cy={-2} r={7} fill="#3a2608" />
            </g>
          </svg>
        </Layer>
      </Cam>
      <Chalk text="AT SEVEN" x={1400} y={300} size={70} at={L(T.a('c3.19', 0.2))} out={L(T.a('c3.20', 0.6))} />
      <InkText mode="clip" text="a chain is for staying put" x={960} y={170} size={46} align="center" start={L(T.a('c3.25', 0.3))} end={L(T.a('c3.25', 3.0))} ink="bone" settle={0} penHead={false} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- three hard cuts
const CutBell: React.FC = () => {
  const {L} = useS();
  return (
    <AbsoluteFill>
      <Cam from={{s: 1.0}} to={{s: 1.1}} drift={2}>
        <Layer depth={0.1}><Sky mood="tense" stars={100} moon={{x: 700, y: 200, r: 60}} clouds={2} /></Layer>
        <Layer depth={0.5} x={-140}>
          <WaterLayers width={2200} layers={[{y: 800, amp: 8, wavelength: 480, speed: 14, fill: P.ink3, fillBottom: P.ink2, foam: true}, {y: 900, amp: 12, wavelength: 360, speed: -26, fill: P.ink2, fillBottom: P.ink1}, {y: 1000, amp: 16, wavelength: 280, speed: 32, fill: P.ink1, fillBottom: P.ink0}]} />
        </Layer>
        <Layer depth={1}>
          <Bell x={1000} y={900} size={1.3} strikes={BELLS.map(L).concat([L(T.a('c3.26', 1.6))])} amp={24} />
        </Layer>
      </Cam>
    </AbsoluteFill>
  );
};

const RoadLamps: React.FC<{lamps: boolean}> = ({lamps}) => {
  const {t} = useS();
  return (
    <AbsoluteFill>
      <Cam from={{s: 1.0, y: 6}} to={{s: 1.1, y: -10}} drift={2}>
        <Layer depth={0.1}><Sky mood="tense" stars={100} moon={{x: 1180, y: 190, r: 50}} clouds={2} horizon={430} /></Layer>
        <Layer depth={0.6}><Causeway mode="world" tide={0.05} now={t} prints={[]} /></Layer>
        <Layer depth={0.7}>
          {lamps &&
            Array.from({length: 11}, (_, i) => {
              const u = Math.pow((i + 0.5) / 11, 1.25);
              const y = 440 + u * 560;
              const sc = 0.2 + u * 0.9;
              const on = easeOut(prog(t, i * 0.09, i * 0.09 + 0.3));
              return <Lantern key={i} x={940 + (i % 2 ? 38 : -38) * sc + Math.sin(t * 1.2 + i) * 6 * sc} y={y} glow={90} scale={sc} lit={on} seed={i + 2} />;
            })}
        </Layer>
      </Cam>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the key
const KeyScene: React.FC = () => {
  const {t, L} = useS();
  const turn = easeInOut(prog(t, L(T.a('c3.29', 0.3)), L(T.a('c3.29', 1.2))));
  const cord = easeInOut(prog(t, L(T.a('c3.29', 1.6)), L(T.a('c3.29', 3.2))));
  const tally = L(T.a('c3.30', 0.2));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 60% at 40% 40%, #1a2547, ${P.ink0})`}}>
      <Cam from={{s: 1.0}} to={{s: 1.12}} drift={2}>
        <Layer depth={1}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <g transform="translate(760 560)">
              <rect x={-120} y={-110} width={240} height={220} rx={20} fill="#9b6f2c" stroke="#5a3d12" strokeWidth={8} />
              <rect x={-120} y={-110} width={90} height={220} rx={20} fill="#c79a4a" opacity={0.35} />
              <circle cx={0} cy={0} r={34} fill="#1a1006" />
              <g transform={`rotate(${turn * 90})`}>
                <rect x={-8} y={-6} width={190} height={14} fill="#d9aa55" />
                <circle cx={196} cy={1} r={34} fill="none" stroke="#d9aa55" strokeWidth={14} />
                <rect x={150} y={7} width={14} height={30} fill="#d9aa55" />
              </g>
            </g>
            {/* cord round the neck */}
            <path d={`M${1180 + cord * 120} 180Q1300 ${420 + cord * 160} ${1420 - cord * 30} 180`} fill="none" stroke={P.amberDeep} strokeWidth={9} />
            <g transform={`translate(${1300 + cord * 60} ${440 + cord * 160})`} opacity={cord}>
              <circle r={22} fill="none" stroke="#d9aa55" strokeWidth={10} />
              <rect x={-5} y={20} width={10} height={90} fill="#d9aa55" />
            </g>
          </svg>
          <Tally x={1100} y={900} n={5} start={tally} end={tally + 2.2} color={P.bone} h={80} gap={26} width={7} />
        </Layer>
      </Cam>
      <Motes n={14} seed={41} opacity={0.5} />
    </AbsoluteFill>
  );
};

const HUD: React.FC = () => {
  const t = useSec();
  const n = rollValue(t, T.a('c3.29', 1.5), 14975, 14976);
  const a = easeInOut(prog(t, T.a('c3.29', 0.8), T.a('c3.29', 1.4)));
  const g0 = END - 2.6;
  const gl = (t > g0 && t < g0 + 0.7 ? 1 : 0) * (0.5 + 0.5 * Math.sin(t * 47));
  const drop = t > g0 && t < g0 + 0.4 ? 40 : 0;
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translateY(${drop}px)`}}>
      <LedgerHUD out={0} in={0} night={n} delta={1} glitch={gl} opacity={a} />
    </div>
  );
};

export const Chapter: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const fadeOut = 1 - clamp01((t - (END - 0.5)) / 0.5);
  return (
    <AbsoluteFill style={{background: P.ink0}}>
      <AbsoluteFill style={{opacity: fadeOut}}>
        <Scenes
          end={END}
          list={[
            {at: 0, fi: 1.0, el: <Atlas />},
            {at: T.a('c3.08', -0.2), fi: 0.3, el: <Wenna />},
            {at: T.a('c3.09', -0.2), fi: 0.5, el: <Kell />},
            {at: T.a('c3.15', -0.25), fi: 0.3, el: <FactCards />},
            {at: T.a('c3.19', -0.25), fi: 0.6, el: <Chain />},
            {at: T.a('c3.26', -0.1), fi: 0, el: <CutBell />},
            {at: T.a('c3.27', -0.05), fi: 0, el: <RoadLamps lamps />},
            {at: T.a('c3.28', -0.05), fi: 0, el: <RoadLamps lamps={false} />},
            {at: T.a('c3.29', -0.3), fi: 0.5, el: <KeyScene />},
          ]}
        />
        <HUD />
        <Finish grain={0.06} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
