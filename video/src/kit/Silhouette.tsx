import React, {useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {P, hash, rgba, clamp01, easeOut} from './theme';
import {flicker} from './Lantern';

export type SilKind = 'village' | 'walker' | 'child' | 'mother' | 'clerkHut' | 'tower' | 'stone' | 'post';

export type SilhouetteProps = {
  kind: SilKind;
  /** ground point (feet / base centre) in frame px */
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
  fill?: string;
  /** rim light colour along one side (cheap strokes), optional */
  rim?: string;
  /** walkers: swing speed (cycles/sec) and body bob px. omit = standing */
  walk?: {speed?: number; bob?: number};
  /** walkers/hut: carries / shows a lit lantern 0..1 */
  lantern?: number;
  /** village/hut windows: number of lit windows (village) or 0/1 (hut). List of indices also ok. */
  lit?: number | number[];
  /** stone: tally count shown (can be fractional while being scratched) */
  tally?: number;
  /** stone: tide level 0..1 (wet darkening line) */
  tide?: number;
  seed?: number;
};

const FILL = '#03060e';

const Walker: React.FC<{h: number; t: number; walk?: SilhouetteProps['walk']; fill: string; rim?: string; lantern?: number; kind: SilKind; seed: number}> = ({h, t, walk, fill, rim, lantern = 0, kind, seed}) => {
  const sp = walk?.speed ?? 0;
  const ph = t * sp * Math.PI * 2;
  const sw = walk ? Math.sin(ph) : 0;
  const bob = walk ? Math.abs(Math.cos(ph)) * (walk.bob ?? 5) : 0;
  const legL = h * 0.46;
  const mother = kind === 'mother';
  const child = kind === 'child';
  const headR = h * (child ? 0.13 : 0.085);
  const bodyW = h * (child ? 0.22 : 0.2);
  return (
    <g transform={`translate(0,${-bob})`}>
      {/* back leg / front leg (skipped under long skirt) */}
      {!mother && (
        <>
          <g transform={`translate(${-h * 0.02},${-legL}) rotate(${sw * 24})`}>
            <path d={`M${-h * 0.03} 0 L${h * 0.03} 0 L${h * 0.025} ${legL} L${-h * 0.035} ${legL} Z`} fill={fill} />
            <path d={`M${-h * 0.04} ${legL - h * 0.02} h${h * 0.1} v${h * 0.025} h${-h * 0.1}Z`} fill={fill} />
          </g>
          <g transform={`translate(${h * 0.02},${-legL}) rotate(${-sw * 24})`}>
            <path d={`M${-h * 0.03} 0 L${h * 0.03} 0 L${h * 0.035} ${legL} L${-h * 0.025} ${legL} Z`} fill={fill} />
            <path d={`M${-h * 0.03} ${legL - h * 0.02} h${h * 0.1} v${h * 0.025} h${-h * 0.1}Z`} fill={fill} />
          </g>
        </>
      )}
      {/* coat / dress */}
      {mother ? (
        <path d={`M${-bodyW * 0.45} ${-h * 0.78} Q${-bodyW * 0.7} ${-h * 0.35} ${-bodyW * 1.05 + sw * 4} 0 L${bodyW * 1.05 + sw * 4} 0 Q${bodyW * 0.7} ${-h * 0.35} ${bodyW * 0.45} ${-h * 0.78} Z`} fill={fill} />
      ) : (
        <path d={`M${-bodyW * 0.45} ${-h * 0.8} L${bodyW * 0.45} ${-h * 0.8} L${bodyW * 0.6} ${-legL * 0.9} L${-bodyW * 0.6} ${-legL * 0.9} Z`} fill={fill} />
      )}
      {/* head + hat/hood */}
      <circle cx={0} cy={-h * 0.87} r={headR} fill={fill} />
      {mother ? <path d={`M${-headR * 1.3} ${-h * 0.8} Q0 ${-h * 1.02} ${headR * 1.3} ${-h * 0.8} Q0 ${-h * 0.86} ${-headR * 1.3} ${-h * 0.8}Z`} fill={fill} /> : child ? null : <path d={`M${-headR * 1.1} ${-h * 0.9} h${headR * 2.2} l${-headR * 0.2} ${-headR * 0.5} h${-headR * 1.8}Z`} fill={fill} />}
      {/* arm(s) */}
      <g transform={`translate(${bodyW * 0.3},${-h * 0.76}) rotate(${-sw * 18 + 4})`}>
        <path d={`M${-h * 0.02} 0 L${h * 0.02} 0 L${h * 0.015} ${h * 0.3} L${-h * 0.02} ${h * 0.3}Z`} fill={fill} />
      </g>
      {lantern > 0 ? (
        <g transform={`translate(${bodyW * 0.8 + sw * 3},${-h * 0.42})`}>
          <path d="M0 -14 L0 0" stroke={fill} strokeWidth={2} />
          <rect x={-7} y={0} width={14} height={20} rx={2} fill={rgba(P.amber, 0.3 + 0.7 * lantern)} />
          <rect x={-3} y={4} width={6} height={12} rx={3} fill={P.amberHot} opacity={lantern * flicker(t, seed)} />
        </g>
      ) : (
        <g transform={`translate(${-bodyW * 0.3},${-h * 0.76}) rotate(${sw * 18 - 4})`}>
          <path d={`M${-h * 0.02} 0 L${h * 0.02} 0 L${h * 0.02} ${h * 0.3} L${-h * 0.015} ${h * 0.3}Z`} fill={fill} />
        </g>
      )}
      {rim && <path d={`M${bodyW * 0.45} ${-h * 0.8} L${bodyW * 0.6} ${-legL * 0.9}`} stroke={rim} strokeWidth={2.5} opacity={0.7} />}
    </g>
  );
};

const Village: React.FC<{fill: string; litCount: number; litList?: number[]; t: number; seed: number}> = ({fill, litCount, litList, t, seed}) => {
  const houses = useMemo(() => {
    const out: {x: number; w: number; h: number; roof: number; wins: {x: number; y: number}[]}[] = [];
    let x = 0;
    for (let i = 0; i < 11; i++) {
      const w = 90 + hash(i * 3 + seed) * 90;
      const h = 70 + hash(i * 5 + seed) * 90;
      const roof = 28 + hash(i * 7 + seed) * 30;
      const wins = [{x: w * 0.3, y: -h * 0.55}];
      if (w > 130) wins.push({x: w * 0.68, y: -h * 0.55});
      if (h > 120) wins.push({x: w * 0.5, y: -h * 0.85});
      out.push({x, w, h, roof, wins});
      x += w + 8 + hash(i + seed) * 22;
    }
    return out;
  }, [seed]);
  let idx = 0;
  return (
    <g>
      {/* a church-like tower in the middle */}
      <path d="M470 0 V-300 L490 -350 L510 -300 V0Z" fill={fill} />
      {houses.map((hs, i) => (
        <g key={i} transform={`translate(${hs.x},0)`}>
          <path d={`M0 0 V${-hs.h} L${hs.w / 2} ${-hs.h - hs.roof} L${hs.w} ${-hs.h} V0Z`} fill={fill} />
          {i % 3 === 0 && <rect x={hs.w * 0.7} y={-hs.h - hs.roof * 0.9} width={12} height={hs.roof * 0.8} fill={fill} />}
          {hs.wins.map((w, k) => {
            const id = idx++;
            const on = litList ? (litList.includes(id) ? 1 : 0) : id < litCount ? 1 : 0;
            if (!on) return <rect key={k} x={w.x - 6} y={w.y - 8} width={12} height={16} fill={P.ink3} opacity={0.35} />;
            const f = flicker(t, id);
            return (
              <g key={k}>
                <circle cx={w.x} cy={w.y} r={24} fill={rgba(P.amber, 0.1 * f)} />
                <rect x={w.x - 6} y={w.y - 8} width={12} height={16} fill={P.amber} opacity={0.85 * clamp01(f)} />
              </g>
            );
          })}
        </g>
      ))}
    </g>
  );
};

const Hut: React.FC<{fill: string; lit: number; t: number}> = ({fill, lit, t}) => {
  const f = flicker(t, 4) * lit;
  return (
    <g>
      <path d="M-130 0 V-120 L0 -200 L130 -120 V0Z" fill={fill} />
      <rect x={70} y={-230} width={22} height={70} fill={fill} />
      <path d="M-150 -118 L0 -210 L150 -118 L150 -108 L-150 -108Z" fill={fill} />
      <rect x={-34} y={-98} width={68} height={52} rx={2} fill={rgba(P.amber, 0.12 + 0.82 * lit)} />
      <path d="M-34 -72 H34 M0 -98 V-46" stroke={fill} strokeWidth={3} />
      <circle cx={0} cy={-72} r={90} fill={rgba(P.amber, 0.1 * f)} />
      <rect x={96} y={-70} width={14} height={70} fill={fill} />
    </g>
  );
};

const Tower: React.FC<{fill: string}> = ({fill}) => (
  <g>
    <path d="M-60 0 L-40 -420 H40 L60 0Z" fill={fill} />
    <path d="M-62 -420 H62 V-444 H-62Z" fill={fill} />
    <path d="M-40 -444 V-500 L0 -540 L40 -500 V-444Z" fill={fill} />
    <path d="M-14 -300 V-340 M-14 -200 V-230" stroke={P.ink3} strokeWidth={5} opacity={0.5} />
  </g>
);

const Post: React.FC<{fill: string}> = ({fill}) => (
  <g>
    <rect x={-8} y={-340} width={16} height={340} fill={fill} />
    <path d="M-6 -340 H150 V-330 H-6Z" fill={fill} />
    <path d="M150 -330 V-300" stroke={fill} strokeWidth={4} />
    <path d="M-8 -230 L40 -330 L-8 -330Z" fill={fill} />
  </g>
);

export const TALLY_H = 150;

const StoneShape: React.FC<{fill: string; tally: number; tide: number}> = ({fill, tally, tide}) => {
  // monolith about 150 wide, 330 tall
  const marks: React.ReactNode[] = [];
  const total = Math.floor(tally + 0.0001);
  const partial = tally - Math.floor(tally);
  const count = Math.min(60, total + (partial > 0 ? 1 : 0));
  for (let i = 0; i < count; i++) {
    const grp = Math.floor(i / 5);
    const k = i % 5;
    const gx = -52 + (grp % 3) * 42;
    const gy = -250 + Math.floor(grp / 3) * 34;
    const prog = i < total ? 1 : partial;
    if (k < 4) marks.push(<path key={i} d={`M${gx + k * 7} ${gy} l1.5 ${22 * prog}`} stroke={P.boneDim} strokeWidth={2.2} strokeLinecap="round" opacity={0.85} />);
    else marks.push(<path key={i} d={`M${gx - 4} ${gy + 17 * prog} L${gx + 31 * prog} ${gy + 4 * (1 - prog)}`} stroke={P.boneDim} strokeWidth={2.2} strokeLinecap="round" opacity={0.85} />);
  }
  const waterY = -330 * (0.06 + 0.9 * tide) * 0.6;
  return (
    <g>
      <defs>
        <linearGradient id="stg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1a2640" />
          <stop offset="0.55" stopColor="#0f182d" />
          <stop offset="1" stopColor="#070d1b" />
        </linearGradient>
      </defs>
      <path d="M-78 0 L-64 -250 L-48 -318 L10 -336 L58 -304 L72 -240 L82 0Z" fill="url(#stg)" />
      <path d="M-48 -318 L10 -336 L58 -304 L72 -240" stroke={rgba(P.teal, 0.35)} strokeWidth={2} fill="none" />
      <path d="M-30 -300 l8 90 M20 -318 l-6 120 M44 -280 l6 80 M-60 -120 l120 8 M-66 -60 l130 6" stroke={rgba(P.ink4, 0.6)} strokeWidth={1.5} />
      {marks}
      <path d={`M-80 ${waterY} H84 V0 H-80Z`} fill={rgba(P.ink0, 0.5)} />
      <path d={`M-80 ${waterY} H84`} stroke={rgba(P.teal, 0.5)} strokeWidth={2} />
    </g>
  );
};

/** Pure-vector silhouettes. No faces. x,y = ground point. */
export const Silhouette: React.FC<SilhouetteProps> = ({kind, x, y, scale = 1, flip = false, fill = FILL, rim, walk, lantern, lit = 0, tally = 0, tide = 0, seed = 1}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const litCount = typeof lit === 'number' ? lit : lit.length;
  const body = (() => {
    switch (kind) {
      case 'walker':
        return <Walker h={170} t={t} walk={walk} fill={fill} rim={rim} lantern={lantern} kind={kind} seed={seed} />;
      case 'mother':
        return <Walker h={165} t={t} walk={walk} fill={fill} rim={rim} lantern={lantern} kind={kind} seed={seed} />;
      case 'child':
        return <Walker h={105} t={t} walk={walk} fill={fill} rim={rim} lantern={lantern} kind={kind} seed={seed} />;
      case 'village':
        return <Village fill={fill} litCount={litCount} litList={Array.isArray(lit) ? lit : undefined} t={t} seed={seed} />;
      case 'clerkHut':
        return <Hut fill={fill} lit={typeof lit === 'number' ? clamp01(lit) : lit.length ? 1 : 0} t={t} />;
      case 'tower':
        return <Tower fill={fill} />;
      case 'post':
        return <Post fill={fill} />;
      case 'stone':
        return <StoneShape fill={fill} tally={tally} tide={tide} />;
    }
  })();
  return (
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
      <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>{body}</g>
    </svg>
  );
};

export type AnkleShotProps = {
  /** 0 = chain slack (deep sag), 1 = taut */
  tension?: number;
  /** seconds-based jingle intensity 0..1 */
  jingle?: number;
  links?: number;
  /** lamp glow warm side light 0..1 */
  lamp?: number;
};

/** Floor-level shot: ledger-desk leg, iron ring, 9-link chain on a sagging curve, cut-off stockinged foot. Full-frame element. */
export const AnkleShot: React.FC<AnkleShotProps> = ({tension = 0.2, jingle = 0, links = 9, lamp = 1}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const floorY = 800;
  const rx = 520, ry = floorY - 215; // ring on desk leg
  const ax = 1250, ay = floorY - 120; // ankle ring
  const sag = (1 - tension) * 140 + 6;
  const pt = (u: number) => ({x: rx + (ax - rx) * u, y: ry + (ay - ry) * u + sag * 4 * u * (1 - u)});
  const items = Array.from({length: links}, (_, i) => {
    const u = (i + 0.5) / links;
    const a = pt(u - 0.01), b = pt(u + 0.01);
    const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI + Math.sin(t * 14 + i * 1.7) * 7 * jingle;
    const p = pt(u);
    return {...p, ang, edge: i % 2 === 1};
  });
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="floorg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a2542" />
          <stop offset="0.06" stopColor="#0d1630" />
          <stop offset="1" stopColor={P.ink0} />
        </linearGradient>
        <linearGradient id="legg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={P.boneDim} />
          <stop offset="0.45" stopColor={P.bone} />
          <stop offset="1" stopColor={P.boneShade} />
        </linearGradient>
        <radialGradient id="lampfloor" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={P.amber} stopOpacity={0.35 * lamp} />
          <stop offset="1" stopColor={P.amber} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={0} y={floorY} width={1920} height={300} fill="url(#floorg)" />
      <ellipse cx={900} cy={floorY + 40} rx={760} ry={90} fill="url(#lampfloor)" />
      {/* floorboards */}
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M0 ${floorY + 26 + i * 46 * (1 + i * 0.4)} H1920`} stroke={P.ink0} strokeWidth={2 + i} opacity={0.6} />
      ))}
      {/* desk leg */}
      <rect x={410} y={150} width={150} height={floorY - 150} fill="url(#legg)" />
      <rect x={400} y={floorY - 38} width={170} height={38} fill={P.boneShade} />
      <path d="M410 300 H560 M410 560 H560" stroke={P.boneDim} strokeWidth={2} opacity={0.5} />
      <ellipse cx={485} cy={floorY} rx={110} ry={10} fill={P.ink0} opacity={0.7} />
      {/* ring on leg */}
      <circle cx={rx} cy={ry} r={30} fill="none" stroke="#2c3345" strokeWidth={13} />
      <circle cx={rx} cy={ry} r={30} fill="none" stroke="#6b7388" strokeWidth={3} strokeDasharray="30 160" strokeDashoffset={-10} />
      {/* chain */}
      {items.map((l, i) => (
        <g key={i} transform={`translate(${l.x},${l.y}) rotate(${l.ang})`}>
          <ellipse rx={l.edge ? 8 : 25} ry={l.edge ? 14 : 14} fill="none" stroke="#2c3345" strokeWidth={8} />
          <ellipse rx={l.edge ? 8 : 25} ry={l.edge ? 14 : 14} fill="none" stroke="#7b8399" strokeWidth={2} strokeDasharray="22 90" />
        </g>
      ))}
      {/* foot cut off at the frame's right */}
      <path d={`M${ax - 70} ${floorY - 330} L${ax + 60} ${floorY - 330} L${ax + 75} ${floorY - 135} L${ax + 380} ${floorY - 75} Q${ax + 430} ${floorY - 20} ${ax + 380} ${floorY} L${ax - 80} ${floorY} Z`} fill="#0b101f" />
      <path d={`M${ax - 70} ${floorY - 330} L${ax - 80} ${floorY - 4}`} stroke={rgba(P.amber, 0.35 * lamp)} strokeWidth={3} />
      <path d={`M${ax - 76} ${floorY - 146} H${ax + 70}`} stroke={P.boneShade} strokeWidth={4} opacity={0.35} />
      <ellipse cx={ax} cy={ay} rx={72} ry={21} fill="none" stroke="#2c3345" strokeWidth={14} />
      <ellipse cx={ax} cy={ay} rx={72} ry={21} fill="none" stroke="#7b8399" strokeWidth={3} strokeDasharray="60 300" strokeDashoffset={-60} />
    </svg>
  );
};

export const easeOutLocal = easeOut;
