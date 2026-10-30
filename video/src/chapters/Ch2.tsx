import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {
  Bell, Causeway, FONT, Finish, InkText, Lantern, LedgerHUD, LedgerPage, Layer, P, Silhouette, Sky, TideClock, WaterLayers, clamp01, easeInOut, easeOut, hash, inkWidth, lerp, loadTiming, noise, prog, rgba, useSec,
} from '../kit';
import raw from '../data/timing/ch2.json';
import {LAYOUT, chapterSeconds} from '../data/layout';
import {Cam, Scenes, SoundSpec, mkT, sfxTimes, useS} from '../kitA/scene';
import {Chalk, LightPool, Motes, Ripples, curve} from '../kitA/parts';
import {WomanBack} from '../kitA/figures';
import SND from '../kitA/sound/ch2.json';

const timing = loadTiming(raw as any);
const T = mkT(timing, LAYOUT[2].lead);
const END = chapterSeconds(2);
const BELLS = sfxTimes(SND as unknown as SoundSpec, T, 'bell');

const PX = 360, PY = 130;
const rowBase = (i: number) => PY + 124 + i * 74 + 74 - 22;
const OUT_X = PX + 40 + 210 + 36;

// ---------------------------------------------------------------- page one (mother's page)
const DuskInset: React.FC<{at: number}> = ({at}) => {
  const t = useSec();
  const p = easeOut(prog(t, at, at + 0.9));
  if (p <= 0) return null;
  const wx = 260 + (t - at) * 60;
  return (
    <div style={{position: 'absolute', left: 1330, top: 90, width: 540, height: 320, opacity: p, transform: `rotate(1.5deg) scale(${0.9 + 0.1 * p})`, border: `2px solid ${rgba(P.bone, 0.7)}`, boxShadow: `0 20px 60px ${rgba('#000', 0.6)}`, overflow: 'hidden', background: P.ink1}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: 'scale(0.28125)', transformOrigin: '0 0'}}>
        <Sky mood="dusk" stars={24} moon={false} clouds={2} horizon={620} seed={5} />
        <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,0), ${rgba('#d0805a', 0.35)} 58%, rgba(0,0,0,0) 70%)`}} />
        <WaterLayers
          layers={[
            {y: 650, amp: 4, wavelength: 500, speed: 10, fill: '#6a5f7e', fillBottom: '#2e3f6a'},
            {y: 740, amp: 8, wavelength: 380, speed: -16, fill: '#2f4570', fillBottom: P.ink2},
            {y: 880, amp: 12, wavelength: 300, speed: 22, fill: P.ink2, fillBottom: P.ink0},
          ]}
        />
        <div style={{position: 'absolute', left: 0, top: 700, width: 1920, height: 38, background: 'linear-gradient(180deg,#8d9bb8,#475a82)'}} />
        <Silhouette kind="mother" x={wx * 3.2} y={716} scale={2.2} walk={{speed: 1.1, bob: 4}} lantern={1} />
      </div>
    </div>
  );
};

const PageOneWorld: React.FC<{done: boolean}> = ({done}) => {
  const t = useSec();
  const z = (v: number) => (done ? -99 : v);
  const d0 = T.a('c2.02', 0.2);
  const strokeAt = T.a('c2.03', 1.1);
  const halo = done ? 1 : easeInOut(prog(t, T.a('c2.04', 0.1), T.a('c2.04', 1.2)));
  const pulse = 0.65 + 0.35 * Math.sin(t * 2.4);
  const week = ['4 MARCH', '5 MARCH', '6 MARCH', '7 MARCH', '8 MARCH', '9 MARCH'];
  return (
    <>
      <LedgerPage x={PX} y={PY} lamp={{x: 500, y: 260}} rows={[]} />
      {/* her hand: the date and the week ahead */}
      <InkText text="3 MARCH" x={PX + 54} y={rowBase(0) - 4} size={34} start={z(d0)} end={z(T.a('c2.02', 3.4))} ink="night" tracking={0.14} slant={-14} weight={0.8} penHead={!done} />
      {week.map((w, i) => (
        <div key={w} style={{opacity: 0.55}}>
          <InkText text={w} x={PX + 54} y={rowBase(i + 1) - 4} size={34} start={z(T.a('c2.02', 3.6 + i * 0.28))} end={z(T.a('c2.02', 3.6 + i * 0.28 + 0.5))} ink="night" tracking={0.14} slant={-14} weight={0.7} penHead={false} />
        </div>
      ))}
      {/* the straight stroke in OUT */}
      <div style={{position: 'absolute', left: OUT_X - 80, top: rowBase(0) - 110, width: 160, height: 150, opacity: halo * pulse * 0.9, background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${rgba(P.amberHot, 0.5)}, ${rgba(P.amber, 0.18)} 55%, rgba(255,179,71,0) 100%)`}} />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d={`M${OUT_X} ${rowBase(0) - 62}L${OUT_X} ${rowBase(0) + 6}`} stroke={P.penInk} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={`${done ? 1 : easeInOut(prog(t, strokeAt, strokeAt + 0.9))} 2`} />
        {!done && t > strokeAt && t < strokeAt + 0.9 && <circle cx={OUT_X} cy={lerp(rowBase(0) - 62, rowBase(0) + 6, easeInOut(prog(t, strokeAt, strokeAt + 0.9)))} r={7} fill={P.amberHot} />}
      </svg>
    </>
  );
};

const PageOne: React.FC<{phase: 'a' | 'b'}> = ({phase}) => {
  const {t, L, dur} = useS();
  const done = phase === 'b';
  const count = done ? Math.round(41 * easeInOut(prog(t, L(T.a('c2.09', 0.3)), L(T.a('c2.09', 3.2))))) : 0;
  const inBlank = done ? easeInOut(prog(t, L(T.a('c2.09', 0)), L(T.a('c2.09', 1)))) : 0;
  const keys = done
    ? [
        {t: 0, s: 1.5, x: -290, y: -235},
        {t: L(T.a('c2.09', 0)), s: 1.35, x: 120, y: -150},
        {t: dur, s: 1.15, x: 40, y: -30},
      ]
    : [
        {t: 0, s: 1.1, x: 180, y: 20},
        {t: L(T.a('c2.02', 0.2)), s: 1.6, x: -170, y: -215},
        {t: L(T.a('c2.03', 0.4)), s: 1.85, x: -300, y: -232},
        {t: L(T.a('c2.05', 0)), s: 1.2, x: 150, y: -40},
        {t: dur, s: 1.1, x: 200, y: 0},
      ];
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 80% at 50% 40%, ${P.ink2}, ${P.ink0})`}}>
      <Cam keys={keys} drift={2}>
        <Layer depth={1}>
          <PageOneWorld done={done} />
          {done && (
            <>
              {/* the proud flourish and the smudged thumb on the page edge */}
              <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
                <path d={`M${OUT_X - 30} ${rowBase(0) + 18}Q${OUT_X + 6} ${rowBase(0) + 26} ${OUT_X + 40} ${rowBase(0) + 14}`} fill="none" stroke={P.amberDeep} strokeWidth={4} strokeLinecap="round" opacity={easeInOut(prog(t, L(T.a('c2.08', 3.0)), L(T.a('c2.08', 3.6))))} />
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <ellipse key={i} cx={PX + 1130} cy={PY + 640} rx={20 + i * 11} ry={26 + i * 13} fill="none" stroke={rgba('#3a2a1a', 0.13)} strokeWidth={3} transform={`rotate(-24 ${PX + 1130} ${PY + 640})`} strokeDasharray={i % 2 ? '60 18' : undefined} />
                ))}
              </svg>
              {/* IN column, empty for forty-one years */}
              <div style={{position: 'absolute', left: PX + 790, top: rowBase(0) - 66, width: 340, height: 100, opacity: inBlank, border: `2px dashed ${rgba(P.penInk, 0.35)}`}} />
              <div style={{position: 'absolute', left: PX + 840, top: rowBase(0) + 70, opacity: inBlank, fontFamily: FONT.accent, fontStyle: 'italic', color: rgba(P.penInk, 0.55), fontSize: 120, lineHeight: 1}}>
                {count}
                <span style={{fontSize: 40, letterSpacing: '0.2em', marginLeft: 22, fontStyle: 'normal'}}>YEARS</span>
              </div>
            </>
          )}
        </Layer>
      </Cam>
      {!done && <DuskInset at={L(T.a('c2.05', 0.4))} />}
      <Motes n={18} seed={2} opacity={0.5} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the mother at the door
const Door: React.FC = () => {
  const {t, L} = useS();
  const turn = easeInOut(prog(t, L(T.a('c2.06', -0.1)), L(T.a('c2.06', 1.5))));
  const sx = Math.cos(Math.PI * turn) * (turn < 1 ? 1 : -1);
  const c = (id: string, o = 0) => L(T.a(id, o));
  const out = L(T.a('c2.08', -0.6));
  return (
    <AbsoluteFill style={{background: '#070c1b'}}>
      <Cam from={{s: 1.0, x: -20}} to={{s: 1.1, x: 20}} drift={3}>
        <Layer depth={0.4}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <defs>
              <linearGradient id="dooropen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#25345f" />
                <stop offset="0.55" stopColor="#7a4a52" />
                <stop offset="0.85" stopColor="#e0985a" />
                <stop offset="1" stopColor="#5a3a3a" />
              </linearGradient>
              <radialGradient id="spill" cx="0.5" cy="0" r="1">
                <stop offset="0" stopColor={P.amber} stopOpacity="0.5" />
                <stop offset="1" stopColor={P.amber} stopOpacity="0" />
              </radialGradient>
            </defs>
            {Array.from({length: 11}, (_, i) => (
              <path key={i} d={`M${i * 190} 0V1080`} stroke="#04070f" strokeWidth={5} />
            ))}
            <rect x={610} y={90} width={700} height={900} fill="url(#dooropen)" />
            <path d="M610 700H1310" stroke="#2c3f6a" strokeWidth={8} opacity={0.7} />
            <rect x={610} y={700} width={700} height={290} fill="#17274a" opacity={0.75} />
            <path d="M610 90V990M1310 90V990M610 90H1310" stroke="#02040a" strokeWidth={26} />
            <path d="M440 1080L610 990H1310L1480 1080Z" fill="url(#spill)" opacity={0.7} />
            <path d="M610 90L440 140V1040L610 990Z" fill="#05080f" />
          </svg>
          <Lantern x={1180} y={540} glowOnly glow={190} seed={4} />
        </Layer>
        <Layer depth={0.8}>
          <WomanBack x={960} y={986} scale={1.0} flipX={sx} sway={Math.sin(t * 1.1) * 0.6} />
        </Layer>
      </Cam>
      {/* the line, two words per beat, chalk-hand */}
      <Chalk text="DON'T SLEEP" x={1550} y={330} size={58} at={c('c2.06', 0.05)} out={out} />
      <Chalk text="MAREN" x={1550} y={450} size={92} at={c('c2.06', 0.75)} out={out} color={P.amberHot} />
      <Chalk text="COUNT" x={1550} y={570} size={78} at={c('c2.06', 1.25)} out={out} />
      <Chalk text="FOR ME" x={1550} y={680} size={78} at={c('c2.06', 1.6)} out={out} />
      {/* wet wool and peppermints */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {[0, 1, 2].map((i) => {
          const u = prog(t, c('c2.07', 0.3 + i * 0.35), c('c2.07', 2.4));
          if (u <= 0) return null;
          const x = 300 + i * 90 + Math.sin(t * 1.3 + i) * 10;
          const y = 760 - u * 190 + i * 22;
          return (
            <g key={i} opacity={Math.sin(u * Math.PI) * 0.8}>
              <circle cx={x} cy={y} r={30} fill={P.bone} opacity={0.9} />
              <path d={`M${x - 24} ${y - 6}Q${x} ${y - 28} ${x + 24} ${y - 6}M${x - 26} ${y + 8}Q${x} ${y - 14} ${x + 26} ${y + 8}M${x - 20} ${y + 20}Q${x} ${y} ${x + 20} ${y + 20}`} stroke={P.blood} strokeWidth={4} fill="none" opacity={0.55} />
            </g>
          );
        })}
      </svg>
      <Motes n={22} seed={6} opacity={0.5} x0={500} w={900} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- page two
const PageTwo: React.FC = () => {
  const {t, L, dur} = useS();
  const flip = easeInOut(prog(t, L(T.a('c2.10', 0.1)), L(T.a('c2.10', 1.3))));
  const a13 = T.a('c2.13', -0.1);
  const iw = inkWidth('IN: 1', 56);
  const glow = easeInOut(prog(t, L(T.a('c2.13', 1.4)), L(T.a('c2.13', 3.0)))) * (0.8 + 0.2 * Math.sin(t * 2.1));
  const dim = easeInOut(prog(t, L(T.a('c2.15', 0)), L(T.a('c2.16', -0.2))));
  const bx = 1108 + iw + 30;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 80% at 50% 40%, ${P.ink2}, ${P.ink0})`}}>
      <Cam
        keys={[
          {t: 0, s: 1.15, x: 40, y: -30},
          {t: L(T.a('c2.11', 0)), s: 1.35, x: -60, y: -150},
          {t: L(T.a('c2.12', 0)), s: 1.7, x: -250, y: -235},
          {t: L(T.a('c2.13', 0.9)), s: 1.8, x: 300, y: -238},
          {t: L(T.a('c2.15', 0)), s: 1.95, x: 340, y: -236},
          {t: dur, s: 1.15, x: 40, y: -60},
        ]}
        drift={2}
      >
        <Layer depth={1}>
          <LedgerPage x={PX} y={PY} lamp={{x: 760, y: 220}} rows={[]} torn />
          <InkText text="4 MARCH" x={PX + 54} y={rowBase(0) - 4} size={38} start={L(T.a('c2.11', 0.2))} end={L(T.a('c2.11', 2.2))} ink="brown" hand="child" tracking={0.16} />
          <InkText text="IN: 1" x={1108} y={rowBase(0) - 6} size={56} start={L(a13)} end={L(T.a('c2.13', 1.3))} ink="brown" hand="child" tracking={0.2} weight={1.2} />
          {/* the space where a name belongs */}
          <div style={{position: 'absolute', left: bx - 40, top: rowBase(0) - 120, width: 330, height: 170, opacity: glow, background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${rgba(P.amberHot, 0.85)}, ${rgba(P.amber, 0.4)} 50%, rgba(255,179,71,0) 100%)`}} />
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <path d={`M${bx} ${rowBase(0) + 4}H${bx + 210}`} stroke={P.amberDeep} strokeWidth={4} strokeDasharray="14 10" opacity={glow} />
          </svg>
        </Layer>
      </Cam>
      {/* the page that was written first turns away */}
      {flip < 1 && (
        <AbsoluteFill style={{perspective: 2600, pointerEvents: 'none'}}>
          <div style={{position: 'absolute', inset: 0, transformOrigin: '224px 540px', transform: `rotateY(${-165 * flip}deg)`, backfaceVisibility: 'hidden', opacity: 1 - flip * 0.3}}>
            <Cam keys={[{t: 0, s: 1.15, x: 40, y: -30}]}>
              <Layer depth={1}>
                <PageOneWorld done />
              </Layer>
            </Cam>
          </div>
        </AbsoluteFill>
      )}
      <Motes n={26} seed={8} opacity={0.6} />
      <LightPool r={lerp(3000, 360, dim)} cx={960} cy={500} warm={0.08} dark={0.97 * dim} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- four fragments, then nothing
const Panel: React.FC<{x: number; word: string; at: number; out: number; children: React.ReactNode}> = ({x, word, at, out, children}) => {
  const t = useSec();
  const i = easeOut(prog(t, at, at + 0.35));
  const o = 1 - easeInOut(prog(t, out, out + 0.9));
  if (i <= 0 || o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: 190, width: 400, height: 560, opacity: i * o, transform: `translateY(${(1 - i) * 24 + (1 - o) * 30}px) scale(${0.96 + 0.04 * i})`}}>
      <div style={{position: 'absolute', inset: 0, border: `2px solid ${rgba(P.bone, 0.65)}`, background: 'linear-gradient(180deg,#0d1730,#060a16)', overflow: 'hidden'}}>{children}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 590, textAlign: 'center', fontFamily: FONT.title, fontSize: 44, letterSpacing: '0.2em', color: P.bone}}>{word}</div>
    </div>
  );
};

const Fragments: React.FC = () => {
  const {t, L} = useS();
  const ats = [T.a('c2.16', 0.1), T.a('c2.16', 0.55), T.a('c2.16', 1.0), T.a('c2.16', 1.45)].map(L);
  const outs = [T.a('c2.17', 0.5), T.a('c2.17', 0.85), T.a('c2.17', 1.2), T.a('c2.17', 1.55)].map(L);
  const xs = [100, 540, 980, 1420];
  return (
    <AbsoluteFill style={{background: P.ink0}}>
      <Panel x={xs[0]} word="HUT" at={ats[0]} out={outs[0]}>
        <svg width={400} height={560} viewBox="0 0 400 560">
          <rect y={430} width={400} height={130} fill="#0a1430" />
          <path d="M0 430H400" stroke={rgba(P.teal, 0.4)} strokeWidth={2} />
          <circle cx={310} cy={90} r={34} fill={P.bone} opacity={0.8} />
        </svg>
        <Silhouette kind="clerkHut" x={200} y={440} scale={1.5} fill="#02050c" lit={1} />
      </Panel>
      <Panel x={xs[1]} word="LAMP" at={ats[1]} out={outs[1]}>
        <Lantern x={200} y={250} glow={190} scale={2.2} seed={3} />
        <svg width={400} height={560} style={{position: 'absolute', inset: 0}}>
          <rect x={60} y={470} width={280} height={14} fill="#1c2a4a" />
        </svg>
      </Panel>
      <Panel x={xs[2]} word="FEVER" at={ats[2]} out={outs[2]}>
        <svg width={400} height={560} viewBox="0 0 400 560">
          <rect x={30} y={390} width={340} height={80} rx={14} fill="#1a2748" />
          <rect x={30} y={360} width={110} height={40} rx={14} fill="#26365e" />
          {[0, 1, 2, 3, 4].map((i) => {
            let d = '';
            for (let y = 340; y > 40; y -= 8) d += (d ? 'L' : 'M') + (70 + i * 62 + Math.sin(y * 0.045 + t * 2.4 + i) * (10 + (340 - y) * 0.06)).toFixed(1) + ' ' + y;
            return <path key={i} d={d} fill="none" stroke={P.amber} strokeWidth={4} strokeLinecap="round" opacity={0.18 + 0.12 * (i % 2)} />;
          })}
        </svg>
      </Panel>
      <Panel x={xs[3]} word="ROPE" at={ats[3]} out={outs[3]}>
        <svg width={400} height={560} viewBox="0 0 400 560">
          <path d="M210 -10C190 120 260 190 210 300C170 380 230 430 200 470" fill="none" stroke={P.amberDeep} strokeWidth={22} strokeLinecap="round" />
          <path d="M210 -10C190 120 260 190 210 300C170 380 230 430 200 470" fill="none" stroke="#2a1608" strokeWidth={22} strokeLinecap="round" strokeDasharray="3 11" opacity={0.7} />
          <g transform="translate(200 470)">
            <path d="M-46 -20C-60 -60 60 -64 46 -18C44 30 -38 34 -46 -20Z" fill="#0a1020" stroke={rgba(P.amber, 0.45)} strokeWidth={2} />
            {[-26, -9, 8, 25].map((x) => (
              <path key={x} d={`M${x} 14V36`} stroke="#02040a" strokeWidth={5} strokeLinecap="round" />
            ))}
          </g>
        </svg>
      </Panel>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- one continuous macro move: the smear
export const HandShape: React.FC<{x: number; y: number; rot?: number; holding?: 'pen' | 'crust' | 'none'; scale?: number}> = ({x, y, rot = 0, holding = 'pen', scale = 1}) => {
  const skin = '#1a2347';
  const rim = rgba(P.amberHot, 0.35);
  const finger = (x1: number, y1: number, x2: number, y2: number, w: number) => (
    <g>
      <path d={`M${x1} ${y1}L${x2} ${y2}`} stroke={skin} strokeWidth={w} strokeLinecap="round" />
      <path d={`M${x1} ${y1 - w * 0.34}L${x2} ${y2 - w * 0.34}`} stroke={rim} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${scale})`}>
      {holding === 'pen' && (
        <>
          <path d="M0 0L230 -96" stroke="#2b1d12" strokeWidth={11} strokeLinecap="round" />
          <path d="M0 0L-18 7" stroke={P.ink0} strokeWidth={8} strokeLinecap="round" />
        </>
      )}
      {holding === 'crust' && (
        <g transform="rotate(-8)">
          <path d="M-62 14C-76 -34 -18 -58 40 -50C84 -42 98 -6 82 24C58 46 -44 50 -62 14Z" fill="#6e4726" />
          <path d="M-54 6C-60 -24 -16 -44 36 -38C68 -32 80 -8 70 12" fill="none" stroke="#4a2c14" strokeWidth={9} strokeLinecap="round" />
          <circle cx={-6} cy={14} r={5} fill="#a8794a" opacity={0.7} />
          <circle cx={26} cy={22} r={4} fill="#a8794a" opacity={0.7} />
        </g>
      )}
      {/* forearm in a wool sleeve */}
      <path d="M300 -80L980 150L930 330L270 90Z" fill="#141d3d" stroke={rim} strokeWidth={3} />
      <path d="M300 -80L330 90" stroke="#2c3d70" strokeWidth={26} />
      <path d="M330 -70L960 160" stroke="#26356a" strokeWidth={5} opacity={0.6} />
      {/* back of the hand */}
      <path d="M186 -104L230 -2L262 14L262 -92Z" fill={skin} />
      <ellipse cx={248} cy={-18} rx={104} ry={70} transform="rotate(24 248 -18)" fill={skin} stroke={rim} strokeWidth={3} />
      {holding === 'pen' ? (
        <>
          {finger(210, -52, 70, -16, 36)}
          {finger(228, -10, 60, 2, 34)}
          {finger(190, -98, 90, -42, 32)}
        </>
      ) : (
        <>
          {finger(210, -52, 40, -30, 38)}
          {finger(228, -6, 44, 14, 36)}
          {finger(190, -100, 20, -48, 34)}
        </>
      )}
    </g>
  );
};

const NEW_X = 1900;
const SmearScene: React.FC = () => {
  const {t, L, dur} = useS();
  const n1 = L(T.a('c2.19', 0.1)), n1e = L(T.a('c2.19', 2.0));
  const n2 = L(T.a('c2.20', 0.1)), n2e = L(T.a('c2.20', 1.9));
  const n3 = L(T.a('c2.21', 0.1)), n3e = L(T.a('c2.21', 2.5));
  const sm0 = L(T.a('c2.23', 0.9));
  const rub0 = L(T.a('c2.23', 4.2)), rub1 = L(T.a('c2.23', 6.6));
  const smear = easeInOut(prog(t, sm0, sm0 + 1.4)) * (1 - easeInOut(prog(t, rub0 + 0.3, rub1)));
  const ru = prog(t, rub0, rub1);
  const smx = NEW_X + 800 + 40;
  const smy = rowBase(0) - 22;
  const crustX = smx + Math.sin(t * 13) * 70 * Math.sin(Math.PI * ru) - 10;
  const crustY = smy + Math.sin(t * 9 + 1) * 14 + (1 - Math.min(1, ru * 8)) * 160 - 10;
  const crust = ru > 0 && ru < 1.0 ? 1 : 0;
  const pencilIn = easeOut(prog(t, L(T.a('c2.22', 0.2)), L(T.a('c2.22', 1.0))));
  const strikeP = easeInOut(prog(t, L(T.a('c2.22', 2.4)), L(T.a('c2.22', 3.4))));
  // pen nib for the margin notes
  const noteY = [PY + 600, PY + 668, PY + 736];
  const noteX = PX + 70;
  const w1 = 520, w2 = 440, w3 = 560;
  const penP = t < n2 ? prog(t, n1, n1e) : t < n3 ? prog(t, n2, n2e) : prog(t, n3, n3e);
  const penIdx = t < n2 ? 0 : t < n3 ? 1 : 2;
  const penW = [w1, w2, w3][penIdx];
  const penVisible = t > n1 - 0.3 && t < n3e + 0.8;
  const px = noteX + penW * easeInOut(penP) + 10;
  const py = noteY[penIdx] - 10;
  const handOut = 1 - easeInOut(prog(t, n3e, n3e + 1.0));
  const handIn = easeInOut(prog(t, n1 - 0.6, n1));
  const ha = handIn * handOut;
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, #1a1e33, #0b0f1f)`}}>
      <Cam
        keys={[
          {t: 0, s: 1.0, x: -60, y: -120},
          {t: n1, s: 1.3, x: -250, y: 220},
          {t: n3e, s: 1.3, x: -140, y: 220},
          {t: L(T.a('c2.22', 0)), s: 1.3, x: 520, y: 100},
          {t: L(T.a('c2.22', 4.2)), s: 1.4, x: 560, y: 90},
          {t: L(T.a('c2.23', 0.2)), s: 1.4, x: 1640, y: -170},
          {t: L(T.a('c2.23', 2.5)), s: 1.9, x: 1760, y: -215},
          {t: dur, s: 2.05, x: 1790, y: -222},
        ]}
        drift={2}
      >
        <Layer depth={1}>
          {/* table */}
          <svg width={3600} height={1300} style={{position: 'absolute', left: -200, top: -150, opacity: 0.7}}>
            {Array.from({length: 9}, (_, i) => (
              <path key={i} d={`M0 ${i * 150}H3600`} stroke="#03050c" strokeWidth={5} />
            ))}
          </svg>
          <LedgerPage
            x={300}
            y={140}
            width={1300}
            lamp={{x: 800, y: 300}}
            rows={[
              {date: '8 Oct', in: ['Kell', 'Pask', 'Dray'], writeAt: -9},
              {date: '9 Oct', in: ['Wenna', 'Hesk'], writeAt: -9},
              {date: '10 Oct', in: ['Lorn', 'Tamsin', 'Kell'], writeAt: -9},
              {date: '11 Oct', in: ['Pask', 'Wenna'], writeAt: -9},
            ]}
          />
          {/* margin notes in her adult hand */}
          <InkText mode="clip" text="somebody came home" x={noteX} y={noteY[0]} size={40} start={n1} end={n1e} ink="night" penHead={false} />
          <InkText mode="clip" text="one figure, no name" x={noteX} y={noteY[1]} size={40} start={n2} end={n2e} ink="night" penHead={false} />
          <InkText mode="clip" text="a name I owe the book" x={noteX} y={noteY[2]} size={40} start={n3} end={n3e} ink="night" penHead={false} underline />
          {/* the pencil she does not allow */}
          <svg width={3600} height={1300} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: pencilIn}}>
            <g transform="translate(1520 640) rotate(-32)">
              <rect x={-170} y={-12} width={290} height={24} fill="#9a917c" />
              <rect x={-170} y={-12} width={290} height={7} fill="#c9c0aa" />
              <path d="M120 -12L190 0L120 12Z" fill="#d9b98a" />
              <path d="M170 -4L190 0L170 4Z" fill="#3a3a44" />
              <rect x={-190} y={-12} width={22} height={24} fill="#6b4a3a" />
            </g>
            <path d="M1380 760Q1490 640 1660 520" stroke={P.penInk} strokeWidth={9} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={`${strikeP} 2`} />
            <path d="M1380 520Q1500 640 1640 770" stroke={P.penInk} strokeWidth={9} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={`${easeInOut(prog(t, L(T.a('c2.22', 3.0)), L(T.a('c2.22', 3.9))))} 2`} />
          </svg>
          {/* the new page */}
          <LedgerPage x={NEW_X} y={140} width={1300} lamp={{x: 900, y: 260}} rows={[{date: '12 Oct', writeAt: -9}]} />
          <svg width={4200} height={1300} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <g opacity={smear}>
              {[0, 1, 2, 3, 4].map((i) => (
                <path key={i} d={`M${smx - 70 + i * 6} ${smy + 26 - i * 12}Q${smx - 10} ${smy - 30 + i * 6} ${smx + 90 - i * 4} ${smy + 16 - i * 10}`} stroke="#6f7688" strokeWidth={22 - i * 3} strokeLinecap="round" fill="none" opacity={0.2 + i * 0.03} />
              ))}
              <path d={`M${smx - 40} ${smy + 10}Q${smx + 10} ${smy - 38} ${smx + 60} ${smy + 4}`} stroke="#4e5568" strokeWidth={4} fill="none" strokeDasharray="3 5" opacity={0.7} />
              <ellipse cx={smx + 20} cy={smy + 36} rx={46} ry={26} fill="#8d93a1" opacity={0.14} />
            </g>
            {/* crumbs */}
            {crust > 0 &&
              Array.from({length: 14}, (_, i) => {
                const u = clamp01(ru * 1.2 - i * 0.045);
                if (u <= 0) return null;
                return <circle key={i} cx={smx - 50 + hash(i * 3) * 150 + u * (hash(i) - 0.5) * 60} cy={smy + 20 + u * (40 + hash(i + 9) * 80)} r={2.5 + hash(i + 2) * 3} fill="#8a5d34" opacity={1 - u * 0.5} />;
              })}
          </svg>
          {/* hands */}
          <svg width={4200} height={1300} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            {penVisible && ha > 0 && <HandShape x={px + (1 - ha) * 260} y={py + (1 - ha) * 90} rot={0} />}
            {crust > 0 && <HandShape x={crustX} y={crustY} rot={-6} holding="crust" scale={1.0} />}
          </svg>
        </Layer>
      </Cam>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 70% at 78% 20%, rgba(255,179,71,0.16), rgba(5,9,20,0.28) 85%)`, pointerEvents: 'none'}} />
      <Motes n={22} seed={13} opacity={0.5} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the chair, the lamp, the bell dying
const Room: React.FC = () => {
  const {t, L} = useS();
  const slump = easeInOut(prog(t, L(T.a('c2.24', 2.4)), L(T.a('c2.24', 3.2)))) * (1 - easeInOut(prog(t, L(T.a('c2.25', 1.3)), L(T.a('c2.25', 2.2)))));
  const lamp = 1 - 0.65 * easeInOut(prog(t, L(T.a('c2.24', 2.6)), L(T.a('c2.25', 0.5)))) + 0.3 * easeInOut(prog(t, L(T.a('c2.25', 1.4)), L(T.a('c2.25', 2.4))));
  const hx = 430 + slump * 50, hy = 430 + slump * 120;
  const rIn = L(T.a('c2.25', 0.15));
  return (
    <AbsoluteFill style={{background: '#080d1d'}}>
      <Cam from={{s: 1.04, x: -30, y: 0}} to={{s: 1.12, x: 40, y: -10}} drift={3}>
        <Layer depth={0.4}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <rect width={1920} height={1080} fill="#0b1430" />
            {Array.from({length: 11}, (_, i) => (
              <path key={i} d={`M${i * 190 + 40} 0V1080`} stroke="#04070f" strokeWidth={4} opacity={0.8} />
            ))}
            <rect x={1220} y={130} width={460} height={520} fill="#1c3260" />
            <circle cx={1530} cy={260} r={52} fill={P.bone} opacity={0.85} />
            <path d="M1220 130V650H1680V130Z" fill="none" stroke="#02040a" strokeWidth={22} />
            <path d="M1450 130V650M1220 390H1680" stroke="#02040a" strokeWidth={14} />
            <path d="M1220 650L900 1080H1900L1680 650Z" fill={rgba(P.bone, 0.05)} />
          </svg>
        </Layer>
        <Layer depth={0.9}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <rect x={120} y={710} width={1000} height={46} fill="#0a0e1c" />
            <rect x={160} y={756} width={34} height={324} fill="#080b16" />
            <rect x={1050} y={756} width={34} height={324} fill="#080b16" />
            <path d="M520 706L880 706L900 660L560 656Z" fill={P.boneShade} opacity={0.9} />
            <path d="M560 656L900 660" stroke={P.penInk} strokeWidth={2} />
            {/* chair back */}
            <rect x={250} y={380} width={26} height={420} fill="#05080f" />
            <rect x={250} y={780} width={300} height={22} fill="#05080f" />
            {/* the clerk, seen from behind-side: torso, head, arm */}
            <g transform={`rotate(${slump * 16} 360 780)`}>
              <path d="M300 790C300 600 330 500 400 470C470 470 520 560 520 700L520 790Z" fill="#03060e" stroke={rgba(P.amber, 0.35 * lamp)} strokeWidth={3} />
            </g>
            <path d={`M470 600C540 640 600 690 640 ${708 - slump * 24}`} stroke="#03060e" strokeWidth={36} strokeLinecap="round" fill="none" />
            <circle cx={hx} cy={hy} r={50} fill="#03060e" stroke={rgba(P.amber, 0.4 * lamp)} strokeWidth={3} />
            <path d={`M${hx - 36} ${hy - 30}Q${hx - 14} ${hy - 62} ${hx + 24} ${hy - 44}`} stroke="#03060e" strokeWidth={22} fill="none" strokeLinecap="round" />
          </svg>
          <Lantern x={990} y={650} glow={420} scale={1.3} lit={lamp} seed={5} />
        </Layer>
      </Cam>
      <Ripples x={1450} y={390} at={rIn} n={5} max={600} dur={4.2} flat={1} width={3} />
      <Motes n={14} seed={17} opacity={0.4} />
    </AbsoluteFill>
  );
};

const Hem: React.FC = () => {
  const {t} = useS();
  const glint = 0.5 + 0.5 * Math.sin(t * 3);
  return (
    <AbsoluteFill style={{background: '#090e1d'}}>
      <Cam from={{s: 1.0, y: -20, x: -40}} to={{s: 1.25, y: 10, x: 30}} drift={2}>
        <Layer depth={1}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <defs>
              <linearGradient id="wool" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#0f1936" />
                <stop offset="0.5" stopColor="#223566" />
                <stop offset="1" stopColor="#101a38" />
              </linearGradient>
              <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#4a3524" />
                <stop offset="1" stopColor="#1b130d" />
              </linearGradient>
            </defs>
            <rect x={0} y={640} width={1920} height={120} fill="url(#wood)" />
            <path d="M0 640H1920" stroke={P.amberDeep} strokeWidth={3} opacity={0.6} />
            <path d="M440 0H1460L1500 560Q1450 610 1380 590Q1320 640 1240 596Q1160 650 1080 600Q1000 650 920 598Q840 648 760 596Q680 640 600 590Q520 620 470 566Z" fill="url(#wool)" />
            {Array.from({length: 7}, (_, i) => (
              <path key={i} d={`M${560 + i * 130} 0C${550 + i * 130} 260 ${590 + i * 130} 420 ${580 + i * 130} 590`} stroke="#050a1c" strokeWidth={5} opacity={0.5} fill="none" />
            ))}
            <path d="M472 520Q700 550 960 540T1470 510" stroke={P.boneDim} strokeWidth={3} strokeDasharray="12 9" fill="none" opacity={0.55} />
            {/* salt: a white crust along the hem */}
            <path d="M486 576Q520 590 560 580M600 590Q650 604 700 592M770 596Q830 610 890 598" stroke={P.bone} strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.75} />
            {Array.from({length: 26}, (_, i) => (
              <rect key={i} x={500 + i * 36 + hash(i) * 14} y={584 + hash(i + 3) * 18} width={5 + hash(i + 7) * 7} height={5 + hash(i + 7) * 7} fill={P.bone} opacity={0.4 + hash(i + 2) * 0.5} transform={`rotate(${hash(i) * 90} ${500 + i * 36} ${590})`} />
            ))}
            <path d="M1010 600l16-22l18 18l-12 20z" fill="#fffdf2" />
            <circle cx={1028} cy={594} r={34 + 8 * glint} fill={rgba('#fffdf2', 0.12 * glint)} />
          </svg>
        </Layer>
      </Cam>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 70% at 15% 30%, rgba(255,179,71,0.18), rgba(5,9,20,0.55) 80%)`}} />
      <Motes n={12} seed={19} opacity={0.4} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the window
const Window: React.FC = () => {
  const {t, L, dur} = useS();
  const crack = t > dur - 1.4;
  const mins = lerp(150, 9, prog(t, 0, dur));
  return (
    <AbsoluteFill>
      <Cam keys={[{t: 0, s: 1.0, y: 0}, {t: L(T.a('c2.28', 0)), s: 1.02, y: 4}, {t: L(T.a('c2.29', 0)), s: 1.2, y: -20}, {t: dur, s: 1.3, y: -30}]} drift={2}>
        <Layer depth={0.1}>
          <Sky mood="tense" stars={120} moon={{x: 960, y: 170, r: 70}} clouds={2} horizon={430} />
        </Layer>
        <Layer depth={0.6}>
          <Causeway mode="world" tide={0.0} now={t} prints={[]} />
        </Layer>
        <Layer depth={0.5}>
          <div style={{position: 'absolute', left: 0, top: 380, width: 1920, height: 110, background: `linear-gradient(180deg, rgba(0,0,0,0), ${rgba(P.teal, 0.1)} 55%, rgba(0,0,0,0))`}} />
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            {Array.from({length: 12}, (_, j) => (
              <rect key={j} x={960 - (14 + j * 7) / 2 + Math.sin(t * 1.6 + j) * (2 + j)} y={440 + j * 26} width={14 + j * 7} height={9} rx={4} fill={P.bone} opacity={0.4 * (1 - j / 13)} />
            ))}
          </svg>
        </Layer>
        <Layer depth={0.95}>
          <Bell x={1560} y={650} size={0.6} strikes={BELLS.map(L)} />
        </Layer>
        {/* window frame in the foreground */}
        <Layer depth={1.4}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <path d="M0 0H1920V1080H0Z M170 110H1750V990H170Z" fill="#03060e" fillRule="evenodd" />
            <path d="M960 110V990M170 520H1750" stroke="#03060e" strokeWidth={22} />
            <path d="M170 110H1750V990H170Z" fill="none" stroke={rgba(P.amberDeep, 0.35)} strokeWidth={3} />
          </svg>
        </Layer>
      </Cam>
      <InkText mode="clip" text="the dead of low water" x={960} y={1030} size={40} align="center" start={L(T.a('c2.27', 0.4))} end={L(T.a('c2.27', 3.6))} ink="bone" settle={0} penHead={false} style={{opacity: 0.85}} />
      <TideClock x={1740} y={250} size={190} minutesToClose={mins} cracked={crack} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- chapter
const HUD: React.FC = () => {
  const t = useSec();
  const a = easeInOut(prog(t, T.a('c2.29', 0.5), T.a('c2.29', 1.6)));
  const g0 = END - 1.4;
  const gl = (t > g0 && t < g0 + 0.5 ? 0.6 : 0) * (0.5 + 0.5 * Math.sin(t * 50));
  return <LedgerHUD out={0} in={0} night={14975} mode="mini" corner="bl" opacity={a} glitch={gl} />;
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
            {at: 0, fi: 1.0, el: <PageOne phase="a" />},
            {at: T.a('c2.06', -0.35), fi: 0.7, el: <Door />},
            {at: T.a('c2.08', -0.1), fi: 0.7, el: <PageOne phase="b" />},
            {at: T.a('c2.10', -0.25), fi: 0.4, el: <PageTwo />},
            {at: T.a('c2.16', -0.15), fi: 0.3, el: <Fragments />},
            {at: T.a('c2.18', -0.3), fi: 0.8, el: <SmearScene />},
            {at: T.a('c2.24', -0.35), fi: 0.8, el: <Room />},
            {at: T.a('c2.26', -0.15), fi: 0.3, el: <Hem />},
            {at: T.a('c2.27', -0.2), fi: 0.6, el: <Window />},
          ]}
        />
        <HUD />
        <Finish grain={0.06} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
