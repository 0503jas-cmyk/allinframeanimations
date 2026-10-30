import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Bell, Layer, Lantern, P, Silhouette, Sky, WaterLayers, rgba, useSec} from '../kit';

/** POST AT DUSK: fixed composition shared by Ch1 and (mirrored by) Ch8. Post+bell centre-left, village lamps in a row on the right, sea behind. Must sit inside a <Camera>. */
export const PostDusk: React.FC<{strikes?: number[]; ropeGlow?: number; lamps?: number; mood?: 'dusk' | 'calm'}> = ({strikes = [], ropeGlow = 0, lamps = 9, mood = 'dusk'}) => {
  const t = useSec();
  const lampXs = Array.from({length: 9}, (_, i) => 1190 + i * 86);
  return (
    <>
      <Layer depth={0.04}>
        <Sky mood={mood} stars={70} moon={false} clouds={3} horizon={660} seed={7} />
        <div style={{position: 'absolute', left: 0, top: 560, width: 1920, height: 140, background: `linear-gradient(180deg, rgba(0,0,0,0), ${rgba('#d0805a', 0.28)} 70%, rgba(0,0,0,0))`}} />
      </Layer>
      <Layer depth={0.14}>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <path d="M0 668 Q200 640 420 662 T900 664 V700 H0Z" fill="#0c1530" />
        </svg>
      </Layer>
      <Layer depth={0.28}>
        <Silhouette kind="village" x={1220} y={742} scale={0.95} fill="#050a18" lit={Math.round(lamps)} seed={4} />
      </Layer>
      <Layer depth={0.45} x={-140}>
        <WaterLayers
          width={2200}
          reflections={lampXs.slice(0, Math.round(lamps)).map((x, i) => ({x: x + 140, length: 90 + (i % 3) * 18, width: 7}))}
          reflectFrom={780}
          layers={[
            {y: 690, amp: 4, wavelength: 600, speed: 10, fill: '#6a5f7e', fillBottom: '#2e3f6a'},
            {y: 742, amp: 7, wavelength: 440, speed: -18, fill: '#2f4570', fillBottom: P.ink2, foam: true},
            {y: 820, amp: 10, wavelength: 340, speed: 24, fill: P.ink3, fillBottom: P.ink1},
            {y: 940, amp: 14, wavelength: 270, speed: -30, fill: P.ink1, fillBottom: P.ink0},
          ]}
        />
      </Layer>
      <Layer depth={0.45}>
        {lampXs.slice(0, Math.round(lamps)).map((x, i) => (
          <Lantern key={i} x={x} y={756} glowOnly glow={52} scale={1} seed={i + 2} />
        ))}
      </Layer>
      <Layer depth={0.9}>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <defs>
            <linearGradient id="quayg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0d1731" />
              <stop offset="1" stopColor="#03060e" />
            </linearGradient>
          </defs>
          <path d="M0 1080 V880 Q120 872 300 880 T760 884 Q900 886 960 930 L1010 1080Z" fill="url(#quayg)" />
          <path d="M0 880 Q120 872 300 880 T760 884 Q900 886 960 930" fill="none" stroke={rgba(P.teal, 0.3)} strokeWidth={2} />
        </svg>
        <Bell x={640} y={884} size={1.02} strikes={strikes} />
        <ShortRope x={640} y={884} glow={ropeGlow} />
        <Lantern x={470} y={560} glow={150} scale={0.7} hang seed={9} />
      </Layer>
    </>
  );
};

/** the short rope "for anyone the sea has caught", hanging on the post's sea side */
export const ShortRope: React.FC<{x: number; y: number; glow: number; size?: number}> = ({x, y, glow, size = 1.02}) => {
  const t = useSec();
  const sway = Math.sin(t * 1.3) * 3;
  const hx = x - 78 * size, hy = y - 330 * size;
  const len = 175 * size;
  const d = `M${hx} ${hy} q${-6 + sway * 0.5} ${len * 0.5} ${-4 + sway} ${len}`;
  return (
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path d={`M${x - 16 * size} ${hy - 6 * size}L${hx} ${hy}`} stroke="#0a0f1e" strokeWidth={8} strokeLinecap="round" />
      <circle cx={hx} cy={hy} r={5} fill="#0a0f1e" />
      {glow > 0 && <ellipse cx={hx - 4 + sway * 0.5} cy={hy + len * 0.55} rx={46 * glow} ry={len * 0.7} fill={rgba(P.amber, 0.3 * glow)} />}
      <path d={d} stroke={glow > 0 ? P.amber : '#8a5a2a'} strokeWidth={5 + 2 * glow} fill="none" strokeLinecap="round" opacity={0.55 + 0.45 * glow} />
      <circle cx={hx - 4 + sway} cy={hy + len + 3} r={7} fill={glow > 0 ? P.amberHot : '#8a5a2a'} opacity={0.6 + 0.4 * glow} />
    </svg>
  );
};

/** Harbour at night: village left, water, causeway road, post and hut right (KitDemo scene 1, parametrised). Inside <Camera>. */
export const Harbour: React.FC<{lit?: number; chop?: number; tide?: number; strikes?: number[]; walker?: boolean; storm?: number; moon?: boolean}> = ({lit = 9, chop = 1, tide = 0, strikes = [], walker = false, storm = 0, moon = true}) => {
  const t = useSec();
  const lampXs = [153, 347, 502, 703, 1160];
  return (
    <>
      <Layer depth={0.05}>
        <Sky mood={storm > 0.5 ? 'tense' : 'calm'} stars={storm > 0.5 ? 50 : 120} moon={moon ? {x: 1460, y: 210, r: 58} : false} clouds={storm > 0.5 ? 5 : 3} />
      </Layer>
      <Layer depth={0.2}>
        <Silhouette kind="village" x={110} y={752} scale={1.05} fill="#060b18" lit={Math.floor(lit)} seed={2} />
        <div style={{position: 'absolute', left: 0, top: 735, width: 1920, height: 30, background: `linear-gradient(180deg, ${rgba(P.ink3, 0)}, ${rgba(P.ink4, 0.55)})`}} />
      </Layer>
      <Layer depth={0.5} x={-140}>
        <WaterLayers
          width={2200}
          tide={tide}
          reflections={[...lampXs.map((x) => ({x: x + 140, length: 120, width: 9})), ...(moon ? [{x: 1460 + 140, length: 230, width: 22, color: P.bone}] : [])]}
          reflectFrom={770}
          layers={[
            {y: 760, amp: 6 * chop, wavelength: 520, speed: 14 * chop, fill: P.ink4, fillBottom: P.ink3},
            {y: 812, amp: 9 * chop, wavelength: 410, speed: -22 * chop, fill: P.ink3, fillBottom: P.ink2, foam: true},
            {y: 884, amp: 12 * chop, wavelength: 330, speed: 30 * chop, fill: P.ink2, fillBottom: P.ink1},
            {y: 985, amp: 16 * chop, wavelength: 260, speed: -38 * chop, fill: P.ink1, fillBottom: P.ink0},
          ]}
        />
      </Layer>
      <Layer depth={0.7}>
        <div style={{position: 'absolute', left: 0, top: 766 - tide * 40, width: 1260, height: 20, background: `linear-gradient(180deg, #5a6d94, #26365a)`, borderRadius: 3}} />
        <div style={{position: 'absolute', left: 0, top: 786 - tide * 40, width: 1260, height: 5, background: rgba(P.teal, 0.2)}} />
        {walker && <Silhouette kind="walker" x={260 + t * 105} y={778} scale={0.8} walk={{speed: 1.5, bob: 3}} lantern={1} seed={5} />}
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
        </svg>
        <Bell x={1235} y={786} size={0.78} strikes={strikes} />
        <Silhouette kind="clerkHut" x={1690} y={764} scale={1.05} fill="#03060e" lit={1} />
        <Lantern x={1160} y={548} glow={170} scale={0.8} seed={1} />
      </Layer>
      {storm > 0 && <AbsoluteFill style={{background: `linear-gradient(180deg, ${rgba(P.ink0, 0.5 * storm)}, rgba(0,0,0,0))`}} />}
    </>
  );
};
