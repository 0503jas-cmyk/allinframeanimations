import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {
  AnkleShot, Bell, Causeway, FONT, Finish, Footprint, InkText, Lantern, LedgerHUD, LedgerPage, Layer, P, Silhouette, Sky, TideClock, WaterLayers, clamp01, easeInOut, easeOut, hash, lerp, loadTiming, mix, noise, prog, rgba, useSec,
} from '../kit';
import raw from '../data/timing/ch4.json';
import {LAYOUT, chapterSeconds} from '../data/layout';
import {Cam, Scenes, SoundSpec, mkT, sfxTimes, useS} from '../kitA/scene';
import {Motes, Ripples} from '../kitA/parts';
import {PostDusk} from '../kitA/world';
import SND from '../kitA/sound/ch4.json';

const timing = loadTiming(raw as any);
const T = mkT(timing, LAYOUT[4].lead);
const END = chapterSeconds(4);
const BELLS = sfxTimes(SND as unknown as SoundSpec, T, 'bell');

// ---------------------------------------------------------------- study 1: the window, the line, "nobody"
const WindowStudy: React.FC = () => {
  const {t, L, dur} = useS();
  const pull = easeInOut(prog(t, L(T.a('c4.02', 2.2)), L(T.a('c4.02', 3.3))));
  const nbAt = L(T.a('c4.04', 0.1));
  return (
    <AbsoluteFill style={{background: '#070c1b'}}>
      <Cam from={{s: 1.0, x: -30}} to={{s: 1.08, x: 30}} drift={3}>
        <Layer depth={0.3}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <rect width={1920} height={1080} fill="#0a1128" />
            {Array.from({length: 11}, (_, i) => (
              <path key={i} d={`M${i * 190 + 30} 0V1080`} stroke="#04070f" strokeWidth={4} opacity={0.8} />
            ))}
          </svg>
        </Layer>
        <Layer depth={0.6}>
          <div style={{position: 'absolute', left: 980, top: 70, width: 800, height: 600, overflow: 'hidden', border: '16px solid #02040a'}}>
            <div style={{position: 'absolute', left: -980, top: -70, width: 1920, height: 1080}}>
              <Sky mood="tense" stars={90} moon={{x: 1500, y: 190, r: 52}} clouds={1} horizon={560} seed={9} />
              <WaterLayers width={1920} layers={[{y: 560, amp: 4, wavelength: 500, speed: 10, fill: '#34476f', fillBottom: P.ink3}, {y: 620, amp: 7, wavelength: 380, speed: -16, fill: P.ink3, fillBottom: P.ink2, foam: true}, {y: 720, amp: 10, wavelength: 300, speed: 22, fill: P.ink2, fillBottom: P.ink0}]} reflections={[{x: 1500, length: 180, width: 20, color: P.bone}]} reflectFrom={570} />
              <Bell x={1330} y={700} size={0.8} strikes={BELLS.map(L)} />
              <div style={{position: 'absolute', left: 1160, top: 280, width: 4, height: 360}} />
            </div>
            <div style={{position: 'absolute', left: 392, top: 0, width: 16, height: '100%', background: '#02040a'}} />
            <div style={{position: 'absolute', left: 0, top: 284, width: '100%', height: 16, background: '#02040a'}} />
          </div>
          {/* the line on the wall twitches */}
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <path d={`M880 70Q${880 - 14 * pull - Math.sin(t * 30) * 6 * pull} 400 ${870 - 30 * pull} 760`} stroke={P.amberDeep} strokeWidth={8} fill="none" strokeLinecap="round" />
            <circle cx={880} cy={70} r={9} fill="#02040a" />
          </svg>
        </Layer>
        <Layer depth={1}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <rect x={100} y={800} width={1300} height={40} fill="#0a0e1c" />
            <path d="M420 800L880 800L920 760L460 750Z" fill={P.boneShade} opacity={0.92} />
          </svg>
          <Lantern x={300} y={740} glow={300} scale={1.1} seed={3} />
          <div style={{position: 'absolute', left: 0, top: 0, transform: 'rotate(-1.2deg)', transformOrigin: '600px 780px'}}>
            <InkText mode="clip" text="nobody" x={500} y={792} size={44} start={nbAt} end={nbAt + 1.5} ink="night" penHead settle={0.4} style={{transform: `translate(${noise(3, t * 20) * 1.8}px, ${noise(4, t * 18) * 1.8}px)`}} />
          </div>
        </Layer>
      </Cam>
      <Motes n={12} seed={51} opacity={0.35} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- HERO: eleven lamps
const PATH_PTS = [
  [250, 150], [520, 230], [760, 340], [1010, 470], [1220, 570], [1360, 660],
];
const pathAt = (u: number) => {
  const n = PATH_PTS.length - 1;
  const f = clamp01(u) * n;
  const i = Math.min(n - 1, Math.floor(f));
  const k = f - i;
  return {x: lerp(PATH_PTS[i][0], PATH_PTS[i + 1][0], k), y: lerp(PATH_PTS[i][1], PATH_PTS[i + 1][1], k)};
};

const Lamps: React.FC = () => {
  const {t, L, dur} = useS();
  const d0 = L(T.a('c4.06', 0.2));
  const d1 = L(T.a('c4.07', -0.1));
  const turnAt = L(T.a('c4.09', 0.05));
  const back = L(T.a('c4.09', 1.2));
  const hold = easeInOut(prog(t, d1, d1 + 0.5));
  const woman = easeOut(prog(t, L(T.a('c4.08', 0.2)), L(T.a('c4.08', 0.9))));
  const lamp = (i: number) => {
    const delay = i * 0.38;
    const down = easeInOut(prog(t, d0 + delay, d1 + delay * 0.3 + 0.2 * 0));
    const arrive = Math.min(1, down);
    const spot = 0.9 - i * 0.075; // stopping point along path
    let u = arrive * spot;
    // turn around
    const up = easeInOut(prog(t, turnAt + i * 0.12, back + 2.4 + i * 0.12));
    u = u * (1 - up);
    const p = pathAt(u);
    const vis = t > d0 + delay - 0.2 ? easeOut(prog(t, d0 + delay - 0.2, d0 + delay + 0.5)) : 0;
    const fade = 1 - prog(t, back + 1.6 + i * 0.12, back + 2.6 + i * 0.12);
    return {p, vis: vis * fade};
  };
  return (
    <AbsoluteFill style={{background: '#060a18'}}>
      <Cam from={{s: 1.0, x: -40, y: -10}} to={{s: 1.1, x: 40, y: 10}} drift={2}>
        <Layer depth={0.1}><Sky mood="tense" stars={70} moon={{x: 1500, y: 150, r: 46}} clouds={2} horizon={500} seed={6} /></Layer>
        <Layer depth={0.5}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <defs>
              <linearGradient id="hillg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#101c3a" /><stop offset="1" stopColor="#05080f" /></linearGradient>
            </defs>
            <path d="M0 80Q300 120 620 260T1200 520L1500 700L1920 780V1080H0Z" fill="url(#hillg)" />
            <path d="M0 80Q300 120 620 260T1200 520L1500 700L1920 780" stroke={rgba(P.teal, 0.25)} strokeWidth={2} fill="none" />
            <path d="M250 150L520 230L760 340L1010 470L1220 570L1360 660" stroke={rgba(P.bone, 0.2)} strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <Silhouette kind="village" x={160} y={150} scale={0.8} fill="#03050c" lit={8} />
        </Layer>
        <Layer depth={0.9}>
          <Silhouette kind="clerkHut" x={1560} y={760} scale={1.9} fill="#02040a" lit={1} />
          {Array.from({length: 11}, (_, i) => {
            const l = lamp(i);
            if (l.vis <= 0.01) return null;
            return <Lantern key={i} x={l.p.x + 70} y={l.p.y + 150} glow={70} scale={0.55 + l.p.y / 1200} lit={l.vis} seed={i + 1} />;
          })}
          {woman > 0 && (
            <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: woman}}>
              <g transform="translate(1250 700)">
                <ellipse cx={0} cy={-20} rx={60} ry={20} fill={rgba(P.amber, 0.12)} />
              </g>
            </svg>
          )}
        </Layer>
      </Cam>
      {/* murmur subtitle */}
      <InkText mode="clip" text={'a woman:  "Not tonight."'} x={960} y={990} size={42} align="center" start={L(T.a('c4.08', 0.7))} end={L(T.a('c4.08', 2.4))} ink="bone" settle={0} penHead={false} style={{opacity: 1 - easeInOut(prog(t, turnAt + 0.4, turnAt + 1.1))}} />
      <Chalkish t={t} at={L(T.a('c4.06', 0.4))} />
    </AbsoluteFill>
  );
};
const Chalkish: React.FC<{t: number; at: number}> = ({t, at}) => {
  const n = Math.min(11, Math.max(0, Math.floor((t - at) * 1.8)));
  return (
    <div style={{position: 'absolute', right: 90, top: 70, fontFamily: FONT.accent, fontSize: 150, color: rgba(P.amber, 0.5), fontStyle: 'italic', opacity: t > at ? 1 : 0}}>
      {n}
      <span style={{fontFamily: FONT.title, fontSize: 24, letterSpacing: '0.3em', marginLeft: 16, color: rgba(P.bone, 0.6)}}>LAMPS</span>
    </div>
  );
};

// ---------------------------------------------------------------- study 3: tide-clock time-lapse, hours, "Bell silent"
const Timelapse: React.FC = () => {
  const {t, L, dur} = useS();
  const hours = ['II', 'III', 'IV', 'V'];
  const per = dur / hours.length;
  const mins = lerp(150, 10, prog(t, 0, dur));
  const b1 = L(T.a('c4.11', 0.2));
  const b2 = L(T.a('c4.12', 0.0));
  const lampX = 300 + (t / dur) * 760;
  return (
    <AbsoluteFill style={{background: P.ink0}}>
      <Cam from={{s: 1.0, x: -30}} to={{s: 1.06, x: 30}} drift={2}>
        <Layer depth={0.4}>
          <AbsoluteFill style={{background: `radial-gradient(ellipse 50% 60% at ${lampX / 19.2}% 40%, ${rgba(P.amber, 0.2)}, rgba(0,0,0,0) 70%), linear-gradient(180deg, #0c1530, ${P.ink0})`}} />
          {hours.map((h, i) => {
            const a = clamp01(Math.min((t - i * per) / 0.5, (i * per + per - t) / 0.5 + 0.0));
            return <div key={h} style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: FONT.accent, fontSize: 520, color: rgba(P.bone, 0.07 * Math.max(0, a)), lineHeight: 1}}>{h}</div>;
          })}
        </Layer>
        <Layer depth={1}>
          <Bell x={1420} y={900} size={0.9} strikes={[]} swing={0} />
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <rect x={120} y={840} width={1000} height={36} fill="#0a0e1c" />
            <path d="M260 840L820 840L860 800L300 790Z" fill={P.boneShade} opacity={0.9} />
          </svg>
          <Lantern x={lampX} y={770} glow={260} scale={1.1} lit={1 - 0.4 * prog(t, 0, dur)} seed={4} />
          <InkText mode="clip" text="Bell" x={330} y={830} size={40} start={b1} end={b1 + 0.8} ink="night" penHead={false} />
          <InkText mode="clip" text="silent" x={420} y={830} size={40} start={b2} end={b2 + 1.0} ink="night" penHead />
        </Layer>
      </Cam>
      <TideClock x={960} y={420} size={340} minutesToClose={mins} />
      <Motes n={10} seed={61} opacity={0.3} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- dawn: key, raw ankle, clean page
const Dawn: React.FC = () => {
  const {t, L, dur} = useS();
  const band = easeInOut(prog(t, L(T.a('c4.14', 0.3)), L(T.a('c4.14', 1.6))));
  const tension = 0.9 - 0.7 * easeInOut(prog(t, L(T.a('c4.13', 0.8)), L(T.a('c4.13', 1.6))));
  const warm = easeInOut(prog(t, 0, dur));
  return (
    <AbsoluteFill style={{background: mix(P.ink0, '#3b4a6e', warm * 0.5)}}>
      <Cam from={{x: -40, s: 1.0}} to={{x: 30, s: 1.1}} drift={2}>
        <Layer depth={0.4}>
          <AbsoluteFill style={{background: `linear-gradient(180deg, ${mix('#0c1530', '#3b4a6e', warm)}, ${mix(P.ink0, '#8a6a58', warm * 0.6)})`}} />
        </Layer>
        <Layer depth={1}>
          <AnkleShot tension={tension} jingle={0.2} lamp={1 - warm * 0.6} />
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <path d="M1180 678Q1250 704 1330 680" stroke={P.blood} strokeWidth={22} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={`${band} 2`} opacity={0.9} />
            <path d="M1180 692Q1250 718 1330 694" stroke={rgba(P.blood, 0.4)} strokeWidth={10} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={`${band} 2`} />
          </svg>
        </Layer>
      </Cam>
    </AbsoluteFill>
  );
};

const CleanPage: React.FC = () => {
  const {t, L, dur} = useS();
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 80% at 50% 40%, #4b5a80, ${P.ink1})`}}>
      <Cam from={{s: 1.1, x: 40, y: -40}} to={{s: 1.45, x: 0, y: -120}} drift={1}>
        <Layer depth={1}>
          <LedgerPage x={360} y={130} lamp={{x: 760, y: 300}} rows={[{date: '14976', writeAt: -9}]} title="TIDE LEDGER · HARROW DEEP" />
        </Layer>
      </Cam>
      <InkText mode="clip" text="the page is clean" x={960} y={1010} size={42} align="center" start={L(T.a('c4.17', 0.3))} end={L(T.a('c4.17', 2.4))} ink="bone" settle={0} penHead={false} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- empty chair, chain, rope
const Empty: React.FC = () => {
  const {t, L} = useS();
  return (
    <AbsoluteFill style={{background: '#0a1024'}}>
      <Cam from={{s: 1.02, x: 30}} to={{s: 1.12, x: -30}} drift={3}>
        <Layer depth={0.4}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <rect width={1920} height={1080} fill="#0e1630" />
            {Array.from({length: 11}, (_, i) => (
              <path key={i} d={`M${i * 190 + 30} 0V1080`} stroke="#04070f" strokeWidth={4} opacity={0.8} />
            ))}
            <path d="M1500 0Q1496 300 1490 640" stroke={P.amberDeep} strokeWidth={9} fill="none" />
            <circle cx={1490} cy={650} r={12} fill={P.amberDeep} />
          </svg>
          <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 70% at 25% 60%, ${rgba(P.amber, 0.2)}, rgba(0,0,0,0) 75%)`}} />
        </Layer>
        <Layer depth={0.9}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <rect x={120} y={700} width={1000} height={44} fill="#070a14" />
            <rect x={160} y={744} width={34} height={336} fill="#070a14" />
            <rect x={1050} y={744} width={34} height={336} fill="#070a14" />
            <circle cx={176} cy={920} r={22} fill="none" stroke="#39425a" strokeWidth={9} />
            <path d="M190 930Q420 1040 640 1000" stroke="#39425a" strokeWidth={9} fill="none" strokeDasharray="30 12" />
            <path d="M640 1000Q700 1040 760 1030" stroke="#39425a" strokeWidth={9} fill="none" strokeDasharray="30 12" />
            {/* empty chair */}
            <rect x={1250} y={500} width={24} height={500} fill="#05080f" />
            <rect x={1250} y={800} width={280} height={22} fill="#05080f" />
            <rect x={1500} y={822} width={22} height={200} fill="#05080f" />
            <rect x={1270} y={822} width={22} height={200} fill="#05080f" />
            <path d="M1250 540H1274" stroke={rgba(P.amber, 0.4)} strokeWidth={3} />
          </svg>
          <Lantern x={500} y={640} glow={300} scale={1.1} lit={0.5} seed={7} />
        </Layer>
      </Cam>
      <Motes n={12} seed={71} opacity={0.35} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- atlas at dusk, the prints
const PRINTS: Footprint[] = [];
const AtlasDusk: React.FC = () => {
  const {t, L, dur} = useS();
  const tIn = L(T.a('c4.22', -4));
  const tSmall = L(T.a('c4.28', 0.0));
  const tHeel = L(T.a('c4.30', 0.1));
  const prints: Footprint[] = [];
  for (let i = 0; i < 40; i++) prints.push({x: 0.03 + i * 0.011, t: tIn + 0.2 + i * 0.07, dir: 'in', size: 'adult', lane: -0.3 + (i % 2) * 0.1});
  for (let i = 0; i < 40; i++) prints.push({x: 0.03 + i * 0.011, t: tIn + 0.4 + i * 0.07, dir: 'in', size: 'small', lane: 0.3});
  for (let i = 0; i < 18; i++) prints.push({x: 0.49 + i * 0.022, t: tSmall + i * 0.1, dir: 'in', size: 'small', lane: 0.3});
  const open = easeInOut(prog(t, 0, 1.6));
  const heels = easeOut(prog(t, tHeel, tHeel + 0.6));
  const close = easeInOut(prog(t, L(T.a('c4.32', -0.4)), L(T.a('c4.32', 0.4))));
  return (
    <AbsoluteFill style={{background: P.ink0}}>
      <Cam from={{s: 1.0}} to={{s: 1.07}} drift={2}>
        <div style={{position: 'absolute', inset: 0, opacity: 1 - close}}>
          <div style={{position: 'absolute', inset: 0, perspective: 2400}}>
            <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 100%', transform: `rotateX(${(1 - open) * 40}deg)`, opacity: 0.2 + 0.8 * open}}>
              <PostDusk strikes={[]} lamps={9} />
              <div style={{position: 'absolute', inset: 0, background: 'rgba(8,14,30,0.55)'}} />
              <Layer depth={0.9}>
                <div style={{position: 'absolute', left: 0, top: 560, width: 1920, height: 440, opacity: 0.6}}>
                  <Causeway mode="map" tide={0} prints={prints} now={t} box={{x: 60, y: 40, w: 1800, h: 400}} chart={false} />
                </div>
              </Layer>
            </div>
          </div>
          {heels > 0 && (
            <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: heels}}>
              <g transform="translate(1040 770)">
                <ellipse cx={-22} cy={0} rx={13} ry={24} fill={P.amber} />
                <ellipse cx={22} cy={0} rx={13} ry={24} fill={P.amber} />
                <circle cx={0} cy={0} r={70 + 10 * Math.sin(t * 3)} fill="none" stroke={P.amber} strokeDasharray="10 8" strokeWidth={3} opacity={0.8} />
              </g>
            </svg>
          )}
          {/* keeper's margin line, cramped and unreadable */}
          <div style={{position: 'absolute', left: 130, top: 120, width: 520, fontFamily: FONT.hand, fontStyle: 'italic', fontSize: 15, lineHeight: '17px', color: rgba(P.bone, 0.45), letterSpacing: '-0.5px', opacity: easeInOut(prog(t, L(T.a('c4.26', 0.2)), L(T.a('c4.26', 1.0))))}}>
            bell wants seeing to, rope worn through on the sea side, told the clerk twice, tide high, hands cold, weather, bell wants seeing to, rope worn through on the sea side
          </div>
        </div>
      </Cam>
      <Motes n={10} seed={81} opacity={0.3} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Drowning Stone
const StoneWide: React.FC = () => {
  const {t} = useS();
  return (
    <AbsoluteFill>
      <Cam from={{s: 1.0, x: -40}} to={{s: 1.1, x: 30}} drift={3}>
        <Layer depth={0.05}><Sky mood="dawn" stars={20} moon={false} clouds={4} horizon={640} /></Layer>
        <Layer depth={0.4} x={-120}>
          <WaterLayers width={2200} layers={[{y: 700, amp: 5, wavelength: 600, speed: 10, fill: '#5d6c8f', fillBottom: '#2c3f68'}, {y: 770, amp: 8, wavelength: 420, speed: -18, fill: '#2c4872', fillBottom: P.ink2, foam: true}, {y: 870, amp: 11, wavelength: 320, speed: 26, fill: P.ink3, fillBottom: P.ink1}, {y: 980, amp: 14, wavelength: 260, speed: -34, fill: P.ink2, fillBottom: P.ink0}]} />
        </Layer>
        <Layer depth={1}>
          <Silhouette kind="stone" x={960} y={950} scale={2.1} tally={30} tide={0.2} />
        </Layer>
        <Layer depth={1.5} opacity={0.9}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <path d="M0 1080V1010Q300 960 600 1000T1200 1010T1920 990V1080Z" fill={P.ink0} />
          </svg>
        </Layer>
      </Cam>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- HUD and chapter
const HUD: React.FC = () => {
  const t = useSec();
  const a = easeInOut(prog(t, T.a('c4.13', 0.5), T.a('c4.13', 1.2))) * (1 - easeInOut(prog(t, T.a('c4.22', -0.5), T.a('c4.22', 0.0)))) + easeInOut(prog(t, T.a('c4.31', 0), T.a('c4.31', 0.5))) * 0;
  const pulse = easeInOut(prog(t, T.a('c4.19', 0), T.a('c4.19', 0.6))) * (1 - easeInOut(prog(t, T.a('c4.20', 1), T.a('c4.20', 2))));
  return (
    <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + 0.05 * pulse})`, transformOrigin: '0% 100%'}}>
      <LedgerHUD out={0} in={0} night={14976} delta={1} opacity={a} nightText={t > T.a('c4.15', 0) && t < T.a('c4.16', 0) ? '---' : undefined} />
    </div>
  );
};

export const Chapter: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const fadeOut = 1 - clamp01((t - (END - 0.5)) / 0.5);
  const dawnFlash = easeInOut(prog(t, T.a('c4.13', 0.3), T.a('c4.13', 1.5))) * (1 - easeInOut(prog(t, T.a('c4.16', 0.5), T.a('c4.16', 2.0)))) * 0.06;
  return (
    <AbsoluteFill style={{background: P.ink0}}>
      <AbsoluteFill style={{opacity: fadeOut}}>
        <Scenes
          end={END}
          list={[
            {at: 0, fi: 1.0, el: <WindowStudy />},
            {at: T.a('c4.05', -0.3), fi: 0.8, el: <Lamps />},
            {at: T.a('c4.10', -0.3), fi: 0.8, el: <Timelapse />},
            {at: T.a('c4.13', -0.3), fi: 0.8, el: <Dawn />},
            {at: T.a('c4.16', -0.2), fi: 0.5, el: <CleanPage />},
            {at: T.a('c4.18', -0.2), fi: 0.7, el: <Empty />},
            {at: T.a('c4.22', -4.0), fi: 1.0, el: <AtlasDusk />},
            {at: T.a('c4.32', -0.2), fi: 0.5, el: <StoneWide />},
          ]}
        />
        <HUD />
        <Finish grain={0.06} wash={dawnFlash > 0.002 ? rgba(P.bone, dawnFlash) : undefined} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
