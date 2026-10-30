import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {
  Bell, Camera, Causeway, Lantern, Silhouette, FONT, Finish, InkText, LedgerHUD, LedgerPage, Layer, P, Sky, WaterLayers, clamp01, easeInOut, easeOut, hash, inkWidth, lerp, loadTiming, noise, prog, rgba, smooth, useSec,
} from '../kit';
import {Footprint} from '../kit';
import raw from '../data/timing/ch1.json';
import {LAYOUT, chapterSeconds} from '../data/layout';
import {Cam, Scenes, SoundSpec, mkT, sfxTimes, useS} from '../kitA/scene';
import {Chalk, GrowIn, LightPool, Motes, PaperSheet, Tally, TwoTideDial, curve} from '../kitA/parts';
import {Harbour, PostDusk} from '../kitA/world';
import SND from '../kitA/sound/ch1.json';

const timing = loadTiming(raw as any);
const T = mkT(timing, LAYOUT[1].lead);
const END = chapterSeconds(1);
const BELLS = sfxTimes(SND as unknown as SoundSpec, T, 'bell');

// ---------------------------------------------------------------- 1. the count writes itself
const NUM_SIZE = 150;
const Open: React.FC = () => {
  const {t} = useS();
  const w = inkWidth('14,975', NUM_SIZE);
  const ox = 960 - w / 2;
  const a1 = T.a('c1.01');
  const pool = curve(
    [
      [0, 0],
      [2.2, 0],
      [4.6, 230],
      [a1, 680],
      [a1 + 2.8, 720],
      [T.a('c1.02', 2.6), 3000],
    ],
    t,
  );
  const wp = easeInOut(prog(t, a1 - 0.2, T.a('c1.01', 2.6)));
  const sNow = curve([[0, 2.7], [T.a('c1.01', 2.9), 2.45], [T.a('c1.02', 2.9), 0.8]], t);
  const poolX = t < T.a('c1.01', 2.7) ? 960 + (ox + 30 + wp * (w - 60) - 960) * sNow : 960;
  const tremor = t > a1 - 0.3 && t < a1 + 3 ? 1 : 0;
  const rows = Array.from({length: 15}, (_, k) => k);
  const outs = [6, 9, 11, 7, 4, 8, 10, 5, 9, 12, 3, 6, 8, 10, 7];
  const nib = easeOut(clamp01((t - 3.2) / 1.2)) * (t < a1 - 0.05 ? 1 : 0);
  const title = easeInOut(prog(t, 0.8, 2.2)) * (1 - easeInOut(prog(t, 4.5, 5.5)));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 70% at 50% 50%, ${P.ink1}, ${P.ink0})`}}>
      <Cam
        keys={[
          {t: 0, s: 2.7, y: 55, x: 0},
          {t: T.a('c1.01', 2.9), s: 2.45, y: 58},
          {t: T.a('c1.02', 2.9), s: 0.8, y: 205},
          {t: T.a('c1.04', -0.2), s: 0.74, y: 218},
        ]}
        drift={2}
      >
        <Layer depth={1}>
          <PaperSheet x={260} y={-1500} w={1400} h={2720} tileH={1000}>
            <svg width={1400} height={2720} viewBox="260 -1500 1400 2720" style={{position: 'absolute', left: 0, top: 0}}>
              {Array.from({length: 40}, (_, i) => (
                <path key={i} d={`M300 ${470 - i * 64}H1620`} stroke={rgba(P.boneDim, 0.5)} strokeWidth={1.6} />
              ))}
              <path d="M300 -1500V1180M560 -1500V1180M1110 -1500V1180" stroke={rgba(P.boneDim, 0.5)} strokeWidth={1.6} />
              <path d="M304 -1500V1180" stroke={rgba(P.blood, 0.4)} strokeWidth={2} />
              <path d="M300 484H1620M300 492H1620" stroke={rgba(P.penInk, 0.75)} strokeWidth={2.6} />
              {rows.map((k) => (
                <g key={k} fontFamily={FONT.hand} fontStyle="italic" fontSize={38} fill={P.penInk} opacity={0.7 - k * 0.012}>
                  <text x={330} y={440 - 64 * k}>{(14974 - k).toLocaleString('en-US')}</text>
                  <text x={600} y={440 - 64 * k}>{outs[k]}</text>
                  <text x={1150} y={440 - 64 * k}>{outs[k]}</text>
                </g>
              ))}
              <text x={330} y={527} fontFamily={FONT.title} fontSize={17} letterSpacing={5} fill={rgba(P.penInk, 0.6)}>NIGHTS COUNTED</text>
              <text x={600} y={742} fontFamily={FONT.title} fontSize={22} letterSpacing={7} fill={rgba(P.penInk, 0.7)}>OUT</text>
              <text x={1150} y={742} fontFamily={FONT.title} fontSize={22} letterSpacing={7} fill={rgba(P.penInk, 0.7)}>IN</text>
              <path d="M300 760H1620" stroke={rgba(P.boneDim, 0.7)} strokeWidth={2} />
              <rect x={1130} y={778} width={420} height={118} fill="none" stroke={rgba(P.penInk, 0.5)} strokeWidth={2.4} strokeDasharray="10 9" />
            </svg>
            {/* amber glow of the blank IN box */}
            <div
              style={{
                position: 'absolute',
                left: 1130 - 260 - 20,
                top: 778 + 1500 - 20,
                width: 420 + 40,
                height: 118 + 40,
                transform: 'translate(0,0)',
                opacity: easeInOut(prog(t, T.a('c1.01', 3.4), T.a('c1.02', 0.8))) * (0.8 + 0.2 * Math.sin(t * 2.2)),
                background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${rgba(P.amberHot, 0.85)}, ${rgba(P.amber, 0.35)} 55%, rgba(255,179,71,0) 100%)`,
              }}
            />
          </PaperSheet>
          <div style={{transform: `translate(${noise(3, t * 9) * 1.6 * tremor}px, ${noise(4, t * 9) * 1.6 * tremor}px)`, position: 'absolute', inset: 0}}>
            <InkText text="14,975" x={ox} y={670} size={NUM_SIZE} start={a1 - 0.2} end={T.a('c1.01', 2.6)} ink="night" tracking={0.12} weight={1.25} />
          </div>
          <InkText text="1" x={640} y={850} size={100} start={T.a('c1.01', 2.9)} end={T.a('c1.01', 3.6)} ink="blood" weight={1.3} />
          <InkText text="ONE SHORT" x={960} y={1095} size={175} start={T.a('c1.02', 0.8)} end={T.a('c1.02', 2.7)} ink="night" align="center" tracking={0.14} weight={1.5} />
        </Layer>
      </Cam>
      <Motes n={30} seed={3} opacity={clamp01(pool / 300) * 0.8} size={3.4} />
      <LightPool r={pool} cx={poolX} cy={t < T.a('c1.01', 2.7) ? 600 : 540} warm={0.22} />
      {/* the nib before it writes */}
      <div
        style={{
          position: 'absolute',
          left: 960 + (ox + 30 - 960) * 2.7,
          top: 540 + (640 - 633) * 2.7,
          width: 0,
          height: 0,
          opacity: nib * (0.7 + 0.3 * Math.sin(t * 5)),
        }}
      >
        <div style={{position: 'absolute', left: -90, top: -90, width: 180, height: 180, borderRadius: 90, background: `radial-gradient(circle, ${rgba(P.amberHot, 0.8)}, ${rgba(P.amber, 0.25)} 40%, rgba(255,179,71,0) 70%)`}} />
        <div style={{position: 'absolute', left: -5, top: -5, width: 10, height: 10, borderRadius: 5, background: '#fff4cf'}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, textAlign: 'center', opacity: title, fontFamily: FONT.title, color: P.bone, letterSpacing: '0.24em', fontSize: 44, lineHeight: 1.7}}>
        THE LEDGER WAS ONE SHORT
        <br />
        <span style={{color: P.amber, fontSize: 34}}>FOR 41 YEARS</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 2. harbour, Maren Voss, the swell
const HarbourScene: React.FC = () => {
  const {t, L} = useS();
  const k = prog(t, L(T.a('c1.04', 1.0)), L(T.a('c1.05', 0)));
  return (
    <AbsoluteFill>
      <Cam from={{x: -70, s: 1.0}} to={{x: 50, s: 1.05}} drift={4}>
        <Harbour lit={Math.min(11, prog(t, 0.2, 3) * 9)} chop={1 + k * 1.6} tide={k * 0.4} storm={k} walker />
      </Cam>
      <InkText text="MAREN VOSS" x={150} y={236} size={74} start={L(T.a('c1.04', 0.15))} end={L(T.a('c1.04', 1.9))} ink="bone" tracking={0.16} />
      <InkText mode="clip" text="tide clerk of Harrow Deep" x={156} y={296} size={36} start={L(T.a('c1.04', 1.9))} end={L(T.sp('c1.04'))} ink="amber" settle={0} penHead={false} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 3. the strongroom floods
const Spines: React.FC<{slide: number}> = ({slide}) => {
  const cols = ['#3a2a22', '#2a3a52', '#4b3a24', '#6d6247', '#2c2f3e', '#51402e'];
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <path d="M1160 0V1080" stroke={P.ink0} strokeWidth={6} />
      {[330, 530, 730].map((y, r) => (
        <g key={r}>
          <rect x={1170} y={y} width={750} height={14} fill="#0a0f1e" />
          {Array.from({length: 14}, (_, i) => {
            const h = 130 + hash(i * 3 + r * 17) * 50;
            const wd = 34 + hash(i * 7 + r) * 22;
            const x = 1190 + i * 52;
            const isOldest = r === 1 && i === 6;
            return (
              <g key={i} transform={isOldest ? `translate(${-slide * 170},${slide * 20}) rotate(${-slide * 14} ${x + wd / 2} ${y})` : undefined}>
                <rect x={x} y={y - h} width={wd} height={h} fill={cols[(i + r * 2) % cols.length]} />
                <rect x={x} y={y - h + 14} width={wd} height={3} fill={rgba(P.amberDeep, 0.6)} />
                <rect x={x} y={y - 22} width={wd} height={3} fill={rgba(P.amberDeep, 0.6)} />
                <rect x={x} y={y - h} width={4} height={h} fill={rgba(P.bone, 0.1)} />
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
};

const Strong: React.FC = () => {
  const {t, L} = useS();
  const rise = easeInOut(prog(t, 0.15, 3.6));
  const surf = 1060 - 400 * rise;
  const swing = Math.sin(t * 2.1) * 4;
  const slide = easeInOut(prog(t, 1.0, 2.2));
  const bobT = t * 1.6;
  const bookX = lerp(1320, 780, easeInOut(prog(t, 1.1, 3.8)));
  const bookY = Math.min(520 + prog(t, 1.0, 2.0) * 240, surf - 60) + Math.sin(bobT) * 8;
  const spray = prog(t, 0, 1.5);
  return (
    <AbsoluteFill style={{background: '#070d1c'}}>
      <Cam from={{s: 1.0, r: -0.8, x: 30}} to={{s: 1.09, r: 0.7, x: -20}} drift={3}>
        <Layer depth={0.5}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <rect width={1920} height={1080} fill="#0c1630" />
            {Array.from({length: 9}, (_, r) => (
              <g key={r}>
                <path d={`M0 ${r * 130}H1920`} stroke={P.ink0} strokeWidth={4} />
                {Array.from({length: 9}, (_, c) => (
                  <path key={c} d={`M${c * 260 + (r % 2) * 130} ${r * 130}v130`} stroke={P.ink0} strokeWidth={3} />
                ))}
              </g>
            ))}
          </svg>
          <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 70% at 46% 28%, ${rgba(P.amber, 0.3)}, rgba(0,0,0,0) 70%)`}} />
        </Layer>
        <Layer depth={0.8}>
          <Spines slide={slide} />
        </Layer>
        {/* door bursting inward */}
        <Layer depth={0.9}>
          <div style={{position: 'absolute', left: 20, top: 80, width: 330, height: 860, perspective: 1400}}>
            <div
              style={{
                width: '100%',
                height: '100%',
                transformOrigin: '0% 50%',
                transform: `rotateY(${-lerp(8, 62, easeOut(prog(t, 0, 0.5)))}deg) skewY(${Math.sin(t * 14) * 0.4 * (1 - prog(t, 0.5, 2))}deg)`,
                background: `repeating-linear-gradient(90deg, #1a1d2b 0 52px, #0b0e19 52px 56px)`,
                border: `5px solid #05070f`,
                boxShadow: `inset -14px 0 40px ${rgba(P.teal, 0.25)}`,
              }}
            >
              {[160, 420, 680].map((y) => (
                <div key={y} style={{position: 'absolute', left: 0, top: y, width: '100%', height: 22, background: '#080b14'}} />
              ))}
            </div>
          </div>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            {Array.from({length: 16}, (_, i) => {
              const u = clamp01(spray * 1.4 - i * 0.03);
              if (u <= 0 || u >= 1) return null;
              const vx = 340 + hash(i * 3) * 700;
              const vy = -520 - hash(i * 5) * 380;
              const x = 330 + vx * u;
              const y = 600 + vy * u + 1500 * u * u;
              return <circle key={i} cx={x} cy={y} r={5 + hash(i) * 9} fill={rgba(P.teal, 0.7 * (1 - u))} />;
            })}
          </svg>
        </Layer>
        <Layer depth={1}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <path d={`M${900 + swing * 3} 0V${150}`} stroke="#05070f" strokeWidth={4} />
          </svg>
          <Lantern x={900 + swing * 3} y={196} glow={300} scale={1.2} seed={3} />
        </Layer>
        <Layer depth={1}>
          {/* the oldest ledger, floating */}
          <div style={{position: 'absolute', left: bookX - 160, top: bookY - 110, width: 320, height: 220, transform: `rotate(${-8 + Math.sin(bobT * 0.8) * 7 + (1 - slide) * 6}deg)`, background: 'linear-gradient(135deg,#4a3526,#2a1c14)', border: `3px solid ${P.amberDeep}`, boxShadow: `0 10px 30px ${rgba('#000', 0.6)}`, opacity: slide > 0 ? 1 : 0}}>
            <div style={{position: 'absolute', inset: 12, border: `1.5px solid ${rgba(P.amberDeep, 0.7)}`}} />
            <div style={{position: 'absolute', left: 0, top: 0, width: 26, height: '100%', background: 'linear-gradient(90deg,#1c120c,#3a2a1e)'}} />
            <div style={{position: 'absolute', left: 90, top: 70, width: 150, height: 70, background: P.boneShade, opacity: 0.85, fontFamily: FONT.title, fontSize: 16, letterSpacing: '0.2em', color: P.penInk, textAlign: 'center', lineHeight: '70px'}}>I</div>
          </div>
        </Layer>
        <Layer depth={1} x={0}>
          <WaterLayers
            width={1920}
            layers={[
              {y: surf, amp: 10 + 14 * (1 - rise), wavelength: 300, speed: 60, fill: '#2d6a73', fillBottom: '#12335a', foam: true, opacity: 0.93},
              {y: surf + 70, amp: 14, wavelength: 360, speed: -48, fill: '#1c4c66', fillBottom: P.ink1, opacity: 0.97},
              {y: surf + 190, amp: 18, wavelength: 420, speed: 40, fill: P.ink2, fillBottom: P.ink0},
            ]}
          />
          {/* lamp oil sheen */}
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            {[0, 1, 2, 3].map((i) => (
              <ellipse key={i} cx={bookX + 80 + i * 70 + Math.sin(t + i) * 12} cy={surf + 14 + i * 4} rx={60 - i * 8} ry={7} fill={rgba(i % 2 ? P.amberHot : P.amber, 0.28)} />
            ))}
          </svg>
        </Layer>
        <Layer depth={1.4} opacity={0.9}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <path d="M0 1080V1000Q400 960 800 1010T1920 990V1080Z" fill={P.ink0} />
          </svg>
        </Layer>
      </Cam>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 4. table: cover opens, two pages
const PAGE_W = 1200;
const PageBox: React.FC<{cx: number; cy: number; scale: number; rot: number; children: React.ReactNode; z?: number}> = ({cx, cy, scale, rot, children, z = 1}) => (
  <div style={{position: 'absolute', left: cx - PAGE_W / 2, top: cy - 410, width: PAGE_W, height: 820, transform: `rotate(${rot}deg) scale(${scale})`, transformOrigin: '50% 50%', zIndex: z, boxShadow: `0 24px 60px ${rgba('#000', 0.55)}`}}>
    {children}
  </div>
);

const Table: React.FC = () => {
  const {t, L, dur} = useS();
  const open = easeInOut(prog(t, L(T.a('c1.06', 2.7)), L(T.a('c1.07', -0.1))));
  const fan = easeInOut(prog(t, L(T.a('c1.07', 0.1)), L(T.a('c1.07', 1.9))));
  const lampX = 1000 + Math.sin(t * 0.5) * 60;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 80% at 55% 38%, #1b2745, ${P.ink0})`}}>
      <Cam keys={[{t: 0, s: 1.0, y: 20, x: -20}, {t: L(T.a('c1.07', 2)), s: 1.04, y: 0, x: 0}, {t: dur, s: 1.2, y: -10, x: 40}]} drift={3}>
        <Layer depth={1}>
          {/* wood planks */}
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 0.55}}>
            {Array.from({length: 7}, (_, i) => (
              <path key={i} d={`M0 ${100 + i * 170}H1920`} stroke="#04070f" strokeWidth={5} />
            ))}
          </svg>
          <div style={{position: 'absolute', left: 580, top: 250, width: 760, height: 540, perspective: 2400, opacity: 1 - fan * 0.0}}>
            {/* page block */}
            <PaperSheet x={0} y={0} w={760} h={540} shade={50}>
              <svg width={760} height={540} style={{position: 'absolute', inset: 0}}>
                {Array.from({length: 7}, (_, i) => (
                  <path key={i} d={`M30 ${84 + i * 66}H730`} stroke={rgba(P.boneDim, 0.5)} strokeWidth={1.4} />
                ))}
                <path d="M200 40V510" stroke={rgba(P.blood, 0.35)} strokeWidth={2} />
              </svg>
              <div style={{position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${rgba('#000', 0.35)}, rgba(0,0,0,0) 12%)`}} />
            </PaperSheet>
            <div style={{position: 'absolute', left: 0, top: 0, width: 760, height: 540, transformStyle: 'preserve-3d', transformOrigin: '0% 50%', transform: `rotateY(${-168 * open}deg)`}}>
              <div style={{position: 'absolute', inset: 0, backfaceVisibility: 'hidden', background: 'linear-gradient(135deg,#4a3526,#2a1c14)', border: `4px solid ${P.amberDeep}`}}>
                <div style={{position: 'absolute', inset: 22, border: `2px solid ${rgba(P.amberDeep, 0.7)}`}} />
                <div style={{position: 'absolute', left: 250, top: 190, width: 260, height: 130, background: P.boneShade, opacity: 0.85, fontFamily: FONT.title, fontSize: 22, letterSpacing: '0.24em', color: P.penInk, textAlign: 'center', lineHeight: '130px'}}>LEDGER I</div>
              </div>
              <div style={{position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: '#3a2a1e', border: `4px solid #1c120c`}} />
            </div>
          </div>
          {/* the two pages fan out of the book */}
          {fan > 0 && (
            <>
              <PageBox cx={lerp(960, 600, fan)} cy={lerp(520, 540, fan)} scale={lerp(0.3, 0.6, fan)} rot={lerp(0, -4, fan)}>
                <LedgerPage x={0} y={0} lamp={{x: 520, y: 300}} rows={[{date: '3 March', out: ['|'], writeAt: -9, ink: 'ink'}]} title="TIDE LEDGER · HARROW DEEP" />
              </PageBox>
              <PageBox cx={lerp(960, 1330, fan)} cy={lerp(520, 540, fan)} scale={lerp(0.3, 0.6, fan)} rot={lerp(0, 3, fan)} z={2}>
                <LedgerPage x={0} y={0} lamp={{x: 380, y: 300}} rows={[{date: '4 March', writeAt: -9, ink: 'ink'}]} title="TIDE LEDGER · HARROW DEEP" />
              </PageBox>
            </>
          )}
        </Layer>
      </Cam>
      <Motes n={28} seed={5} opacity={0.7} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 55% 60% at ${lampX / 19.2}% 40%, rgba(255,179,71,0.16), rgba(0,0,0,0) 70%)`}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 5. stone road + two tides
const RoadOpen: React.FC = () => {
  const {t, L} = useS();
  // water level offset in px: + = road open, - = sea over the road (twice in the scene)
  const dip = (a: number, b: number) => easeInOut(prog(t, a, a + 0.9)) * (1 - easeInOut(prog(t, b, b + 0.9)));
  const off = 26 - 62 * Math.max(dip(1.3, 2.5), dip(4.1, 5.3));
  const dialAt = L(T.a('c1.08', 1.2));
  return (
    <AbsoluteFill>
      <Cam from={{x: -60, s: 1.0}} to={{x: 60, s: 1.06}} drift={3}>
        <Layer depth={0.05}>
          <Sky mood="calm" stars={110} moon={{x: 1260, y: 190, r: 56}} clouds={2} horizon={700} />
        </Layer>
        <Layer depth={0.35}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <path d="M0 704Q160 692 360 704T800 706V730H0Z" fill="#0b132a" />
            <path d="M1560 706Q1700 686 1920 698V730H1560Z" fill="#0b132a" />
          </svg>
          {[1690, 1730, 1790, 1850].map((x, i) => (
            <div key={i} style={{position: 'absolute', left: x - 5, top: 700 - (i % 2) * 10, width: 10, height: 10, borderRadius: 5, background: P.amber, boxShadow: `0 0 16px 6px ${rgba(P.amber, 0.45)}`}} />
          ))}
        </Layer>
        <Layer depth={0.5} x={-140}>
          <WaterLayers width={2200} reflections={[{x: 1260 + 140, length: 240, width: 22, color: P.bone}]} reflectFrom={770} layers={[{y: 724, amp: 3, wavelength: 600, speed: 8, fill: '#4a5c85', fillBottom: P.ink3}]} />
        </Layer>
        <Layer depth={0.7}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <rect x={-100} y={766} width={2200} height={14} fill="#38486b" />
            {Array.from({length: 38}, (_, i) => {
              const x = i * 58 - 40 + (hash(i) - 0.5) * 8;
              return <rect key={i} x={x} y={730} width={54 + hash(i + 3) * 4} height={36} rx={3} fill={hash(i * 2.3) > 0.5 ? '#b9c3da' : '#97a5c4'} />;
            })}
            <rect x={-100} y={730} width={2200} height={3} fill={rgba(P.bone, 0.8)} />
          </svg>
          <Silhouette kind="walker" x={300 + t * 70} y={734} scale={0.46} walk={{speed: 1.4, bob: 2}} lantern={1} seed={6} />
        </Layer>
        <Layer depth={0.9} x={-140}>
          <WaterLayers
            width={2200}
            layers={[
              {y: 764 + off, amp: 7, wavelength: 520, speed: 14, fill: P.ink4, fillBottom: P.ink3, foam: true},
              {y: 838 + off, amp: 10, wavelength: 420, speed: -22, fill: P.ink3, fillBottom: P.ink2},
              {y: 926 + off * 0.5, amp: 14, wavelength: 330, speed: 30, fill: P.ink2, fillBottom: P.ink1},
              {y: 1012, amp: 18, wavelength: 260, speed: -36, fill: P.ink1, fillBottom: P.ink0},
            ]}
          />
        </Layer>
      </Cam>
      <TwoTideDial x={1640} y={250} size={300} start={dialAt} dur={1.5} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 6. post at dusk, short rope
const PostScene: React.FC = () => {
  const {t, L} = useS();
  const rope = easeInOut(prog(t, L(T.a('c1.10', 0.3)), L(T.a('c1.10', 1.5))));
  const pulse = rope * (0.85 + 0.15 * Math.sin(t * 3));
  return (
    <AbsoluteFill>
      <Cam
        keys={[
          {t: 0, x: -90, y: 0, s: 1.0},
          {t: L(T.a('c1.10', 0)), x: -40, y: 10, s: 1.04},
          {t: L(T.a('c1.11', -0.3)), x: -250, y: 50, s: 1.32},
        ]}
        drift={3}
      >
        <PostDusk strikes={BELLS.map(L)} ropeGlow={pulse} lamps={4 + prog(t, 0.2, 2.2) * 5} />
      </Cam>
      <Motes n={14} seed={9} opacity={0.35} size={2.4} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 7. macro: two columns
const MacroLedger: React.FC = () => {
  const {t, L, dur} = useS();
  const PX = 360, PY = 130;
  const base = (i: number) => PY + 124 + i * 74 + 74 - 22;
  const tallyX = PX + 40 + 210 + 36;
  const namesX = PX + 40 + 210 + 40 + 430 + 28;
  const sevenAt = L(T.a('c1.14', 2.2));
  const lampX = 520 + 440 * easeInOut(prog(t, 0, L(T.e('c1.14'))));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 80% at 50% 40%, ${P.ink2}, ${P.ink0})`}}>
      <Cam keys={[{t: 0, s: 1.25, x: -150, y: 80}, {t: L(T.a('c1.12', 0)), s: 1.6, x: -230, y: 150}, {t: L(T.a('c1.13', 1)), s: 1.6, x: 150, y: 150}, {t: L(T.a('c1.14', 0.5)), s: 1.1, x: 0, y: 40}, {t: dur, s: 1.0, x: 0, y: 0}]} drift={2}>
        <Layer depth={1}>
          <LedgerPage
            x={PX}
            y={PY}
            lamp={{x: lampX - PX, y: 360}}
            rows={[
              {date: '8 Oct', in: ['Kell', 'Pask', 'Dray'], writeAt: -9},
              {date: '9 Oct', in: ['Wenna', 'Hesk'], writeAt: -9},
              {date: '10 Oct', in: ['Lorn', 'Tamsin', 'Kell'], writeAt: -9},
              {date: '11 Oct', in: ['Pask', 'Wenna'], writeAt: L(T.a('c1.12', 0)), writeDur: (T.a('c1.13', 0.2) - T.a('c1.12', 0)) / 0.62 + 0.4},
            ]}
          />
          <Tally x={tallyX} y={base(0) + 6} n={3} start={-9} end={-8} />
          <Tally x={tallyX} y={base(1) + 6} n={2} start={-9} end={-8} />
          <Tally x={tallyX} y={base(2) + 6} n={3} start={-9} end={-8} />
          <Tally x={tallyX} y={base(3) + 6} n={2} start={L(T.a('c1.12', 0.3))} end={L(T.a('c1.12', 2.4))} />
          {/* the child's seven in the margin */}
          <InkText text="7" x={PX + 70} y={PY + 770} size={120} start={sevenAt} end={sevenAt + 1.2} ink="brown" hand="child" weight={1.2} />
        </Layer>
      </Cam>
      <Motes n={20} seed={11} opacity={0.5} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 8. ghost, village windows
const GhostVillage: React.FC = () => {
  const {t, L} = useS();
  const g0 = L(T.a('c1.15', 2.0));
  const dissolve = easeInOut(prog(t, g0 + 2.4, g0 + 3.4));
  return (
    <AbsoluteFill>
      <Cam from={{x: 70, s: 1.02}} to={{x: -50, s: 1.06}} drift={4}>
        <Harbour lit={prog(t, 0.2, 2.6) * 11} chop={1.2} />
      </Cam>
      <div style={{opacity: 1 - dissolve, transform: `translateY(${-dissolve * 24}px) scale(${1 + dissolve * 0.06})`, transformOrigin: '960px 560px', position: 'absolute', inset: 0}}>
        <InkText text="GHOST" x={960} y={600} size={150} start={g0} end={g0 + 1.8} ink="bone" align="center" tracking={0.2} weight={1.1} penHead />
      </div>
    </AbsoluteFill>
  );
};

const GhostRoad: React.FC = () => {
  const {t, L} = useS();
  const prints: Footprint[] = [];
  const s0 = L(T.a('c1.17', 0.1));
  const strike = easeInOut(prog(t, L(T.a('c1.17', 1.6)), L(T.a('c1.17', 2.3))));
  return (
    <AbsoluteFill>
      <Cam from={{y: 10, s: 1.0}} to={{y: -10, s: 1.1}} drift={3}>
        <Layer depth={0.1}>
          <Sky mood="tense" stars={100} moon={{x: 1180, y: 190, r: 50}} aurora clouds={2} horizon={430} />
        </Layer>
        <Layer depth={0.6}>
          <Causeway mode="world" tide={0.1 + 0.2 * prog(t, 0, 10)} now={t} prints={prints} />
        </Layer>
        <Layer depth={0.5}>
          <div style={{position: 'absolute', left: 0, top: 380, width: 1920, height: 110, background: `linear-gradient(180deg, rgba(0,0,0,0), ${rgba(P.teal, 0.1)} 55%, rgba(0,0,0,0))`}} />
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            {Array.from({length: 12}, (_, j) => (
              <rect key={j} x={1180 - (14 + j * 7) / 2 + Math.sin(t * 1.6 + j) * (2 + j)} y={440 + j * 26} width={14 + j * 7} height={9} rx={4} fill={P.bone} opacity={0.34 * (1 - j / 13)} />
            ))}
          </svg>
        </Layer>
        <Layer depth={0.95}>
          <Bell x={1500} y={640} size={0.62} strikes={BELLS.map(L)} />
        </Layer>
      </Cam>
      <div style={{position: 'absolute', inset: 0, opacity: easeInOut(prog(t, s0, s0 + 0.5)) * 0.95}}>
        <InkText text="GHOST" x={960} y={360} size={130} start={s0} end={s0 + 1.0} ink="bone" align="center" tracking={0.2} weight={1.1} penHead={false} />
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <path d="M600 322Q960 300 1330 304" fill="none" stroke={P.bone} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={`${strike} 2`} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 9. arithmetic
const OUTS = [6, 9, 11, 7, 4, 8, 10, 5];
const Arithmetic: React.FC = () => {
  const {t, L} = useS();
  const r0 = L(T.a('c1.18', 0.5));
  const redAt = L(T.a('c1.19', 0.0));
  const blankAt = L(T.a('c1.20', 0.1));
  const dim = 1 - 0.55 * easeInOut(prog(t, redAt - 0.2, redAt + 0.6));
  const glow = easeInOut(prog(t, blankAt, blankAt + 1.4));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 70% at 50% 45%, ${P.ink2}, ${P.ink0})`}}>
      <Cam from={{s: 1.0, y: 0}} to={{s: 1.06, y: -14}} drift={2}>
        <Layer depth={0.5}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <path d="M960 70V1010" stroke={rgba(P.bone, 0.18)} strokeWidth={1.6} />
            <path d="M400 745H1520" stroke={rgba(P.bone, 0.5)} strokeWidth={2.4} pathLength={1} strokeDasharray={`${easeInOut(prog(t, r0 + 4.6, r0 + 5.4))} 2`} />
          </svg>
          <div style={{position: 'absolute', left: 0, width: 1920, top: 60, textAlign: 'center', fontFamily: FONT.title, fontSize: 28, letterSpacing: '0.4em', color: rgba(P.bone, 0.75)}}>
            <span style={{position: 'absolute', left: 560}}>OUT</span>
            <span style={{position: 'absolute', left: 1180}}>IN</span>
          </div>
          <div style={{opacity: dim}}>
            {OUTS.map((n, i) => (
              <React.Fragment key={i}>
                <InkText text={String(n)} x={640} y={190 + i * 66} size={54} start={r0 + i * 0.5} end={r0 + i * 0.5 + 0.55} ink="bone" align="center" penHead={false} settle={0.3} />
                <InkText text={String(n)} x={1280} y={190 + i * 66} size={54} start={r0 + i * 0.5 + 0.25} end={r0 + i * 0.5 + 0.8} ink="bone" align="center" penHead={false} settle={0.3} />
              </React.Fragment>
            ))}
          </div>
          <InkText text="1" x={640} y={950} size={190} start={redAt} end={redAt + 1.1} ink="blood" align="center" weight={1.4} />
          {/* the blank IN */}
          <div
            style={{
              position: 'absolute',
              left: 1280 - 190,
              top: 790,
              width: 380,
              height: 200,
              opacity: glow * (0.8 + 0.2 * Math.sin(t * 2.3)),
              background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${rgba(P.amberHot, 0.55)}, ${rgba(P.amber, 0.2)} 55%, rgba(255,179,71,0) 100%)`,
            }}
          />
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <rect x={1130} y={808} width={300} height={164} rx={4} fill="none" stroke={P.amber} strokeWidth={3} strokeDasharray="14 10" opacity={glow} pathLength={1} />
          </svg>
        </Layer>
      </Cam>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 10. two pages side by side
const TwoPages: React.FC = () => {
  const {t, L, dur} = useS();
  const toB = easeInOut(prog(t, L(T.a('c1.22', 0.0)), L(T.a('c1.22', 1.4))));
  const glow = easeInOut(prog(t, L(T.a('c1.22', 0.3)), L(T.a('c1.22', 2.0)))) * (0.8 + 0.2 * Math.sin(t * 3.1));
  const spotX = lerp(560, 1330, toB);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 80% at 55% 38%, #1b2745, ${P.ink0})`}}>
      <Cam keys={[{t: 0, s: 1.0, x: -20, y: 10}, {t: dur, s: 1.16, x: 40, y: -10}]} drift={3}>
        <Layer depth={1}>
          <PageBox cx={600} cy={540} scale={0.6} rot={-4}>
            <LedgerPage x={0} y={0} lamp={{x: 520, y: 300}} rows={[{date: '3 March', out: ['|'], writeAt: -9, ink: 'ink'}]} />
            <div style={{position: 'absolute', inset: 0, background: `rgba(5,9,20,${0.5 * toB})`}} />
          </PageBox>
          <PageBox cx={1330} cy={540} scale={0.6} rot={3} z={2}>
            <LedgerPage x={0} y={0} lamp={{x: 380, y: 300}} rows={[{date: '4 March', writeAt: -9, ink: 'ink'}]} />
            <div style={{position: 'absolute', left: -45, top: 100, width: 330, height: 150, background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${rgba(P.amberHot, 0.9 * glow)}, ${rgba(P.amber, 0.4 * glow)} 50%, rgba(255,179,71,0) 100%)`}} />
          </PageBox>
        </Layer>
      </Cam>
      <Motes n={22} seed={21} opacity={0.6} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 45% 60% at ${spotX / 19.2}% 45%, rgba(255,179,71,0.12), rgba(5,9,20,0.35) 100%)`}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- chapter
const HUD: React.FC = () => {
  const t = useSec();
  const g0 = T.a('c1.22', 2.6);
  const gl = clamp01(prog(t, g0, g0 + 0.15)) * (1 - clamp01(prog(t, g0 + 0.5, g0 + 0.7))) * (0.55 + 0.45 * Math.sin(t * 47));
  const flick = t > g0 && t < g0 + 0.6 ? (Math.floor(t * 20) % 2 ? 0 : 1) : 1;
  const at = T.a('c1.14', 1.2);
  return (
    <GrowIn at={at} from={{x: 120, y: 20}}>
      <LedgerHUD out={0} in={0} night={14975} delta={flick} glitch={gl} />
    </GrowIn>
  );
};

export const Chapter: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const fadeOut = 1 - clamp01((t - (END - 0.6)) / 0.6);
  return (
    <AbsoluteFill style={{background: P.ink0}}>
      <AbsoluteFill style={{opacity: fadeOut}}>
        <Scenes
          end={END}
          list={[
            {at: 0, fi: 0, el: <Open />},
            {at: T.a('c1.04', -0.25), fi: 0.9, el: <HarbourScene />},
            {at: T.a('c1.05', -0.05), fi: 0.2, el: <Strong />},
            {at: T.a('c1.06', 2.3), fi: 0.7, el: <Table />},
            {at: T.a('c1.08', -0.2), fi: 0.8, el: <RoadOpen />},
            {at: T.a('c1.09', -0.15), fi: 0.8, el: <PostScene />},
            {at: T.a('c1.11', -0.25), fi: 0.8, el: <MacroLedger />},
            {at: T.a('c1.15', -0.25), fi: 0.8, el: <GhostVillage />},
            {at: T.a('c1.16', -0.25), fi: 0.8, el: <GhostRoad />},
            {at: T.a('c1.18', -0.2), fi: 0.9, el: <Arithmetic />},
            {at: T.a('c1.21', -0.3), fi: 0.9, el: <TwoPages />},
          ]}
        />
        <HUD />
        <Finish grain={0.06} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
