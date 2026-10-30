import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  AnkleShot, Bell, Camera, Causeway, FONT, Finish, Footprint, InkText, Lantern, Layer, LedgerHUD, LedgerPage, P, Silhouette, Sky, TideClock, WaterLayers,
  clamp01, easeInOut, lerp, prog, rgba, rollValue, stubTiming, hash,
} from './kit';

export const KIT_DEMO_FRAMES = 720;

const timing = stubTiming(
  [
    {id: 'd.01', text: 'Fourteen thousand, nine hundred and seventy-five nights, and the ledger is one short.'},
    {id: 'd.02', text: 'I know who is missing.'},
    {id: 'd.03', text: 'My name is Maren Voss.'},
  ],
  0.4,
  16,
);

/** crossfade wrapper for a scene sequence */
const Fade: React.FC<{len: number; children: React.ReactNode; inF?: number; outF?: number}> = ({len, children, inF = 8, outF = 8}) => {
  const f = useCurrentFrame();
  const o = Math.min(clamp01(f / inF), clamp01((len - f) / outF));
  return <AbsoluteFill style={{opacity: o, background: P.ink0}}>{children}</AbsoluteFill>;
};

// ---------- Scene 1: harbour at night ----------
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const nights = rollValue(t, 2.2, 14974, 14975);
  const mins = lerp(300, 180, t / 4.5);
  return (
    <AbsoluteFill>
      <Camera from={{x: -50, s: 1.0}} to={{x: 50, s: 1.045}} drift={4} settles={[{at: 2.2, dur: 0.9, amount: 0.02}]}>
        <Layer depth={0.05}>
          <Sky mood="calm" stars={120} moon={{x: 1460, y: 210, r: 58}} clouds={3} />
        </Layer>
        <Layer depth={0.2}>
          <Silhouette kind="village" x={110} y={752} scale={1.05} fill="#060b18" lit={Math.floor(prog(t, 0.3, 3) * 9)} seed={2} />
          <div style={{position: 'absolute', left: 0, top: 735, width: 1920, height: 30, background: `linear-gradient(180deg, ${rgba(P.ink3, 0)}, ${rgba(P.ink4, 0.55)})`}} />
        </Layer>
        <Layer depth={0.5} x={-140}>
          <WaterLayers width={2200} reflections={[{x: 153 + 140, length: 120, width: 9}, {x: 347 + 140, length: 130, width: 9}, {x: 502 + 140, length: 110, width: 8}, {x: 703 + 140, length: 110, width: 8}, {x: 1160 + 140, length: 200, width: 14}, {x: 1460 + 140, length: 230, width: 22, color: P.bone}]} reflectFrom={770}
            layers={[{y: 760, amp: 6, wavelength: 520, speed: 14, fill: P.ink4, fillBottom: P.ink3}, {y: 812, amp: 9, wavelength: 410, speed: -22, fill: P.ink3, fillBottom: P.ink2, foam: true}, {y: 884, amp: 12, wavelength: 330, speed: 30, fill: P.ink2, fillBottom: P.ink1}, {y: 985, amp: 16, wavelength: 260, speed: -38, fill: P.ink1, fillBottom: P.ink0}]} />
        </Layer>
        <Layer depth={0.7}>
          {/* the causeway road across the water */}
          <div style={{position: 'absolute', left: 0, top: 766, width: 1260, height: 20, background: `linear-gradient(180deg, #5a6d94, #26365a)`, borderRadius: 3}} />
          <div style={{position: 'absolute', left: 0, top: 786, width: 1260, height: 5, background: rgba(P.teal, 0.2)}} />
          <Silhouette kind="walker" x={260 + t * 105} y={778} scale={0.8} walk={{speed: 1.5, bob: 3}} lantern={1} seed={5} />
        </Layer>
        <Layer depth={1}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <defs>
              <linearGradient id="hl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0b1428" />
                <stop offset="1" stopColor="#03060e" />
              </linearGradient>
            </defs>
            <path d="M1160 1080 L1160 840 Q1180 792 1250 782 L1330 770 Q1420 760 1500 764 L1920 760 V1080Z" fill="url(#hl)" />
            <path d="M1160 840 Q1180 792 1250 782 L1330 770 Q1420 760 1500 764 L1920 760" fill="none" stroke={rgba(P.teal, 0.3)} strokeWidth={2} />
            <path d="M1190 960 C1290 880 1380 940 1480 880 S1700 860 1780 900 S1880 880 1920 870 V1080 H1160Z" fill="#0a1328" />
            <path d="M1160 1010 L1320 985 L1480 1010 L1650 975 L1920 1000 V1080 H1160Z" fill="#050a16" />
            
          </svg>
          <Bell x={1235} y={786} size={0.78} strikes={[1.0, 2.8]} />
          <div style={{position: 'absolute', left: 1440, top: 766, width: 500, height: 70, background: `radial-gradient(ellipse 50% 50% at 50% 30%, ${rgba(P.amber, 0.3)}, rgba(0,0,0,0) 100%)`}} />
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <path d="M1218 484 H1160 V504" stroke="#03060e" strokeWidth={5} fill="none" />
          </svg>
          <Silhouette kind="clerkHut" x={1690} y={764} scale={1.05} fill="#03060e" lit={1} />
          <Lantern x={1160} y={548} glow={170} scale={0.8} seed={1} />
        </Layer>
      </Camera>
      {/* title */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 118, textAlign: 'center', opacity: easeInOut(prog(t, 0.4, 1.6)) * (1 - easeInOut(prog(t, 3.6, 4.3)))}}>
        <div style={{fontFamily: FONT.title, fontSize: 54, letterSpacing: '0.2em', color: P.bone, textShadow: `0 4px 30px ${P.ink0}`}}>THE TIDE CLERK</div>
        <div style={{fontFamily: FONT.accent, fontStyle: 'italic', fontSize: 34, letterSpacing: '0.12em', color: P.amber, marginTop: 14}}>of Harrow Deep</div>
      </div>
      <TideClock x={1760} y={150} size={200} minutesToClose={mins} />
      <LedgerHUD out={1} in={0} night={nights} />
      <Finish />
    </AbsoluteFill>
  );
};

// ---------- Scene 2: ledger page ----------
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const lampX = 380 + 520 * easeInOut(t / 4.5);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 80% at 50% 40%, ${P.ink2}, ${P.ink0})`}}>
      <Camera from={{s: 1.0, y: 0}} to={{s: 1.1, y: -20}} drift={3}>
        <Layer depth={0.9}>
          <LedgerPage
            x={400}
            y={36}
            width={1120}
            height={760}
            lamp={{x: lampX, y: 330}}
            rows={[
              {date: '3 Mar', out: ['6'], in: ['6'], writeAt: 0.3},
              {date: '4 Mar', out: ['9'], in: ['9'], writeAt: 0.9},
              {date: '5 Mar', out: ['11'], in: ['11'], ink: 'pencil', writeAt: 1.5},
              {date: '6 Mar', out: ['7'], in: ['6 (pencil)'], ink: 'pencil', writeAt: 2.1},
              {date: '7 Mar', out: ['Maren'], ink: 'child', writeAt: 2.7, flag: true},
              {date: '8 Mar', out: ['4'], in: ['4'], writeAt: 3.3, ghost: true},
            ]}
          />
        </Layer>
      </Camera>
      <InkText mode="stroke" text="14,975 NIGHTS" x={960} y={950} size={92} align="center" start={timing.cue('d.01') - 0.4} end={timing.cue('d.01') + 1.6} ink="bone" tracking={0.12} />
      <InkText mode="stroke" text="one short" x={1210} y={1020} size={34} start={2.7} end={3.6} ink="amber" underline hand="child" tracking={0.16} />
      <LedgerHUD out={1} in={0} night={14975} mode="mini" corner="tr" />
      <Finish grain={0.09} />
    </AbsoluteFill>
  );
};

// ---------- Scene 3: causeway chart ----------
const prints: Footprint[] = (() => {
  const a: Footprint[] = [];
  for (let i = 0; i < 60; i++) {
    const x = 0.02 + (i / 60) * 0.9;
    a.push({x, t: 0.4 + (i / 60) * 2.6, dir: 'out', size: 'adult', lane: -0.4 + hash(i) * 0.3});
    if (i % 3 === 0) a.push({x: x + 0.01, t: 0.5 + (i / 60) * 2.6, dir: 'out', size: 'small', lane: 0.5});
  }
  for (let i = 0; i < 40; i++) a.push({x: 0.9 - (i / 40) * 0.55, t: 1.5 + (i / 40) * 2.2, dir: 'in', size: 'adult', lane: 0.3 + hash(i + 9) * 0.2});
  return a;
})();

const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const tide = easeInOut(prog(t, 0.3, 4.2)) * 0.95;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 90% at 50% 50%, ${P.ink2}, ${P.ink0})`}}>
      <Camera from={{s: 1.0, x: -20}} to={{s: 1.06, x: 20}} drift={0}>
        <Layer depth={0.8}>
          <Causeway mode="map" tide={tide} prints={prints} highlight={t > 2.5 ? [0.35, 0.62] : undefined} />
        </Layer>
      </Camera>
      <TideClock x={960} y={930} size={190} minutesToClose={lerp(300, 8, tide)} />
      <InkText mode="clip" text="the sea closes from both sides" x={1130} y={1012} size={36} start={0.5} end={2.8} ink="bone" settle={0} />
      <LedgerHUD out={prints.length} in={40} night={14975} delta={0} corner="bl" mode="mini" />
      <Finish />
    </AbsoluteFill>
  );
};

// ---------- Scene 4: causeway in the world ----------
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const wp = prog(t, 0.2, 3.2);
  return (
    <AbsoluteFill>
      <Camera from={{s: 1.0, y: 10}} to={{s: 1.07, y: -10}} drift={3}>
        <Layer depth={0.1}>
          <Sky mood="tense" stars={90} moon={{x: 1180, y: 190, r: 46}} aurora clouds={2} horizon={430} />
        </Layer>
        <Layer depth={0.6}>
          <Causeway mode="world" tide={0.15 + 0.4 * wp} now={t} prints={[...Array.from({length: 50}, (_, i): Footprint => ({x: 0.02 + i * 0.019, t: 0.2 + i * 0.05, dir: 'out', size: 'adult', lane: -0.18 + (i % 2) * 0.04})), ...Array.from({length: 24}, (_, i): Footprint => ({x: 0.02 + i * 0.03, t: 1 + i * 0.07, dir: 'out', size: 'small', lane: 0.2}))]} />
        </Layer>
        <Layer depth={0.5}>
          <div style={{position: 'absolute', left: 0, top: 380, width: 1920, height: 110, background: `linear-gradient(180deg, rgba(0,0,0,0), ${rgba(P.teal, 0.1)} 55%, rgba(0,0,0,0))`}} />
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            {Array.from({length: 12}, (_, j) => (
              <rect key={j} x={1185 - (14 + j * 7) / 2 + Math.sin(t * 1.6 + j) * (2 + j)} y={440 + j * 26} width={14 + j * 7} height={9} rx={4} fill={P.bone} opacity={0.34 * (1 - j / 13)} />
            ))}
          </svg>
        </Layer>
        <Layer depth={0.9}>
          <Silhouette kind="walker" x={900 - wp * 120} y={620 + wp * 150} scale={0.4 + wp * 0.6} walk={{speed: 1.3, bob: 4}} lantern={1} rim={P.amber} />
          <Silhouette kind="child" x={1020 - wp * 130} y={622 + wp * 148} scale={0.4 + wp * 0.6} walk={{speed: 1.8, bob: 3}} />
          <Lantern x={960 - wp * 120 + 28 * (0.4 + wp * 0.6)} y={560 + wp * 140} glowOnly glow={180} seed={3} scale={0.8} />
          <Silhouette kind="mother" x={1110} y={705} scale={0.55} walk={{speed: 1.2, bob: 2}} flip />
        </Layer>
      </Camera>
      <div style={{position: 'absolute', left: 80, bottom: 70, opacity: easeInOut(prog(t, 0.8, 1.6))}}>
        <div style={{fontFamily: FONT.title, fontSize: 28, letterSpacing: '0.22em', color: P.bone}}>II</div>
        <div style={{fontFamily: FONT.title, fontSize: 40, letterSpacing: '0.2em', color: P.bone, marginTop: 6}}>THE CAUSEWAY</div>
      </div>
      <Finish />
    </AbsoluteFill>
  );
};

// ---------- Scene 5: the ankle chain ----------
const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const tension = easeInOut(prog(t, 0.6, 3.4));
  return (
    <AbsoluteFill style={{background: P.ink0}}>
      <Camera from={{x: -40, s: 1.0}} to={{x: 30, s: 1.06}} drift={2}>
        <Layer depth={0.4}>
          <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 60% at 20% 30%, ${rgba(P.amber, 0.16)}, rgba(0,0,0,0) 70%), linear-gradient(180deg, #0c1530, ${P.ink0})`}} />
          <Lantern x={300} y={250} glow={230} scale={1.4} hang seed={8} />
        </Layer>
        <Layer depth={1}>
          <AnkleShot tension={tension} jingle={t > 0.4 && t < 3.6 ? 1 - tension * 0.7 : 0.1} />
        </Layer>
      </Camera>
      <InkText mode="clip" text="night 14,976. I am chained to my own ledger." x={640} y={190} size={46} start={0.6} end={3.2} ink="bone" settle={0} />
      <LedgerHUD out={2} in={1} night={14976} delta={1} corner="br" />
      <Finish />
    </AbsoluteFill>
  );
};

// ---------- Scene 6: stone, bell, glitch ----------
const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const glitch = clamp01(prog(t, 2.0, 2.4)) * (1 - clamp01(prog(t, 2.8, 3.0))) * (0.5 + 0.5 * Math.sin(t * 40));
  return (
    <AbsoluteFill>
      <Camera from={{s: 1.0, x: -30}} to={{s: 1.07, x: 30}} drift={3}>
        <Layer depth={0.05}>
          <Sky mood="dawn" stars={30} moon={false} clouds={4} horizon={640} />
        </Layer>
        <Layer depth={0.4} x={-120}>
          <WaterLayers
            width={2200}
            tide={0.1}
            layers={[
              {y: 690, amp: 5, wavelength: 600, speed: 10, fill: '#5d6c8f', fillBottom: '#2c3f68'},
              {y: 760, amp: 8, wavelength: 420, speed: -18, fill: '#2c4872', fillBottom: P.ink2, foam: true},
              {y: 860, amp: 11, wavelength: 320, speed: 26, fill: P.ink3, fillBottom: P.ink1},
              {y: 970, amp: 14, wavelength: 260, speed: -34, fill: P.ink2, fillBottom: P.ink0},
            ]}
          />
        </Layer>
        <Layer depth={1}>
          <Silhouette kind="stone" x={620} y={940} scale={2.0} tally={prog(t, 0.4, 3.2) * 17} tide={0.25} />
          <Bell x={1420} y={940} size={1.0} strikes={[0.6, 2.2]} ropeWear={0.8} />
        </Layer>
        <Layer depth={1.5} opacity={0.9}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <path d="M0 1080 V1010 Q300 960 600 1000 T1200 1010 T1920 990 V1080Z" fill={P.ink0} />
          </svg>
        </Layer>
      </Camera>
      <InkText mode="stroke" text="MAREN" x={1000} y={300} size={120} start={0.8} end={3.0} ink="amber" penHead tracking={0.2} />
      <TideClock x={1740} y={160} size={190} minutesToClose={lerp(14, 3, t / 3.5)} cracked={t > 2.7} />
      <LedgerHUD out={1} in={1} night={14977} delta={0} glitch={glitch} nightText={t > 2.0 && t < 2.8 ? '---' : undefined} />
      <Finish wash={t > 3.1 ? rgba(P.bone, 0.06) : undefined} />
    </AbsoluteFill>
  );
};

const SCENES = [
  {from: 0, len: 135, C: Scene1},
  {from: 135, len: 135, C: Scene2},
  {from: 270, len: 135, C: Scene3},
  {from: 405, len: 105, C: Scene4},
  {from: 510, len: 105, C: Scene5},
  {from: 615, len: 105, C: Scene6},
];

export const KitDemo: React.FC = () => (
  <AbsoluteFill style={{background: P.ink0}}>
    {SCENES.map(({from, len, C}, i) => (
      <Sequence key={i} from={from} durationInFrames={len}>
        <Fade len={len}>
          <C />
        </Fade>
      </Sequence>
    ))}
  </AbsoluteFill>
);
