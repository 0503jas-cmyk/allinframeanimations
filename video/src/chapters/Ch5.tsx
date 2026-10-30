import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Bell, Camera, Causeway, Finish, FONT, Layer, LedgerHUD, P, Silhouette, Sky, TideClock, clamp01, easeInOut, lerp, prog, rgba} from '../kit';
import {Shot, ShotCam, makeClock, useShot, Dusk, Sea, ChalkWord, Pool, LampDisc, useTime} from '../kitB';
import {StoneFace, TickMacro, RopeMacro, LeftHand, RockBase} from '../kitB/stone';
import raw from '../data/timing/ch5.json';
import {chapterSeconds} from '../data/layout';

const clock = makeClock(5, raw);
const TOTAL = chapterSeconds(5);
const c = (id: string, o = 0) => clock.cue(id, o);
const e = (id: string, o = 0) => clock.end(id, o);
const CUT = e('c5.26') + 0.1;

// --- S1: the Stone already cut into 41 ruled rows (mini reveal)
const S1: React.FC = () => {
  const {t} = useShot();
  return (
    <AbsoluteFill>
      <ShotCam keys={[{t: 0, x: -400, y: -230, s: 1.7}, {t: 8, x: 0, y: 0, s: 1.0}]} drift={2}>
        <Layer depth={1}>
          <StoneFace rowsLit={0} last={0.82} />
        </Layer>
      </ShotCam>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 55% at ${30 + t * 2}% 25%, rgba(0,0,0,0), ${rgba(P.ink0, 0.7)})`}} />
    </AbsoluteFill>
  );
};

// --- S2: the Stone rising from the ebbing water, seen low from the sea
const StoneWide: React.FC<{tideFrom: number; tideTo: number; clockOn?: boolean; seaK?: number}> = ({tideFrom, tideTo, clockOn, seaK = 0.5}) => {
  const {t, dur} = useShot();
  const u = easeInOut(clamp01(t / dur));
  const tide = lerp(tideFrom, tideTo, u);
  return (
    <AbsoluteFill>
      <ShotCam keys={[{t: 0, x: -60, y: 30, s: 1.0}, {t: dur, x: 70, y: -10, s: 1.16}]} drift={3}>
        <Layer depth={0.04} x={-60}>
          <Sky mood="calm" stars={120} moon={clockOn ? {x: 1180, y: 190, r: 54} : {x: 1500, y: 210, r: 54}} clouds={3} horizon={760} seed={5} />
        </Layer>
        <Layer depth={0.25} x={-200}>
          <Sea tide={tide * seaK} width={2400} layers={[{y: 700, amp: 5, wl: 520, speed: 14, top: P.ink4, bottom: P.ink3}, {y: 740, amp: 7, wl: 420, speed: -20, top: P.ink3, bottom: P.ink2, foam: true}]} />
        </Layer>
        <Layer depth={0.45}>
          {/* the post, far away */}
          <div style={{position: 'absolute', left: 1480, top: 610, width: 300, height: 4, background: rgba(P.teal, 0.1)}} />
          <Bell x={1530} y={716} size={0.42} strikes={[]} />
        </Layer>
        <Layer depth={0.7}>
          <Silhouette kind="stone" x={620} y={900} scale={2.35} tide={Math.min(1, 0.25 + tide * 0.7)} tally={0} />
          {/* the cut rows, hinted */}
          <div style={{position: 'absolute', left: 540, top: 330, width: 170, height: 440, background: `repeating-linear-gradient(180deg, ${rgba(P.ink0, 0.5)} 0 2px, rgba(0,0,0,0) 2px 11px)`, opacity: 0.35 * (1 - tide * 0.4), transform: 'rotate(-2deg)'}} />
        </Layer>
        <Layer depth={1} x={-200}>
          <Sea tide={tide * seaK} width={2400} layers={[{y: 880, amp: 12, wl: 330, speed: 30, top: P.ink2, bottom: P.ink1, foam: true}, {y: 985, amp: 16, wl: 260, speed: -38, top: P.ink1, bottom: P.ink0}]} />
        </Layer>
      </ShotCam>
      {clockOn && <TideClock x={1640} y={250} size={300} minutesToClose={lerp(34, 2, u)} ebbing={false} />}
    </AbsoluteFill>
  );
};

// --- S3: the rows, up close, counted
const S3: React.FC = () => {
  const {t, cue, end} = useShot();
  const rows = 41 * prog(t, cue('c5.05') + 0.1, end('c5.05') - 0.2);
  return (
    <AbsoluteFill>
      <ShotCam keys={[{t: 0, x: -260, y: -280, s: 2.4}, {t: 4.4, x: -80, y: -140, s: 1.8}, {t: 11.9, x: 60, y: 290, s: 1.45}]} drift={2}>
        <Layer depth={1}>
          <StoneFace rowsLit={rows} last={0.82} />
        </Layer>
      </ShotCam>
    </AbsoluteFill>
  );
};

// --- S4: macro along the newest row
const S4: React.FC = () => {
  const {t, cue, end} = useShot();
  const lastIdx = 111;
  const a = 4300;
  const b = (lastIdx + 1) * 64 - 960;
  const u = easeInOut(prog(t, cue('c5.06') - 0.3, cue('c5.09') + 0.4));
  const scroll = lerp(a, b, u);
  const ring = easeInOut(prog(t, cue('c5.09'), cue('c5.09') + 0.8));
  const lastRing = prog(t, cue('c5.08'), cue('c5.08') + 0.5) * (1 - prog(t, cue('c5.09'), cue('c5.09') + 0.6));
  const lx = lastIdx * 64 - scroll;
  return (
    <AbsoluteFill>
      <ShotCam keys={[{t: 0, x: 0, y: 0, s: 1.0, r: 0.5}, {t: 14, x: 0, y: -10, s: 1.1, r: -0.4}]} drift={3}>
        <RockBase w={1920} h={1080} seed={9} />
        <TickMacro scroll={scroll} lastIdx={lastIdx} ring={ring} />
        <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
          <ellipse cx={lx + 6} cy={830} rx={46} ry={110} fill="none" stroke={P.amber} strokeWidth={4} opacity={lastRing * 0.9} />
        </svg>
        <Pool x={380} y={600} r={1000} a={0.3} />
      </ShotCam>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 70% at 50% 55%, rgba(0,0,0,0), ${rgba(P.ink0, 0.5)})`}} />
    </AbsoluteFill>
  );
};

// --- S5a: walking back to the post
const S5a: React.FC = () => {
  const {t, dur} = useShot();
  const x = lerp(-300, 520, easeInOut(clamp01(t / (dur - 0.4))));
  return (
    <AbsoluteFill>
      <ShotCam keys={[{t: 0, x: -330, y: 60, s: 1.22}, {t: dur, x: 250, y: 20, s: 1.12}]} drift={2}>
        <Dusk mood="calm" skyMood="calm" stars={110} lit={3} lamps={0} tide={0.1} postWear={1}
          road={<Silhouette kind="mother" x={x} y={790} scale={1.06} fill="#03060e" walk={{speed: 1.25, bob: 3}} lantern={0.5} rim={rgba(P.amber, 0.3)} seed={3} />}
        />
      </ShotCam>
    </AbsoluteFill>
  );
};

// --- S5b: the rope in macro
const S5b: React.FC = () => {
  const {t, cue, end} = useShot();
  const p0 = prog(t, cue('c5.14') + 0.2, cue('c5.14') + 3.4);
  const p1 = prog(t, cue('c5.15') + 0.0, cue('c5.15') + 3.2);
  const p2 = prog(t, cue('c5.16') - 0.4, cue('c5.16') + 2.0);
  return (
    <AbsoluteFill style={{background: `linear-gradient(90deg, #1a1626 0%, ${P.ink1} 45%, #0b2230 100%)`}}>
      <ShotCam keys={[{t: 0, x: 0, y: 0, s: 1.0}, {t: 11.4, x: 60, y: 0, s: 1.22}]} drift={3}>
        <Layer depth={0.9}>
          <RopeMacro x={900} w={250} passes={[p0, p1, p2]} sway={Math.sin(t * 0.8) * 0.5} />
        </Layer>
        <Pool x={250} y={400} r={700} a={0.22} />
        <Pool x={1700} y={500} r={700} a={0.14} color={P.teal} />
      </ShotCam>
      <ChalkWord text="THE SEA SIDE" x={1500} y={420} size={46} start={cue('c5.16')} end={cue('c5.16') + 0.9} color={P.teal} opacity={0.75} />
    </AbsoluteFill>
  );
};

// --- S5c: cross-sections, hut vs sea
const Cross: React.FC<{cx: number; cy: number; arc: number; start: number; label: string; sub: string; draw: number}> = ({cx, cy, arc, label, sub, draw}) => {
  const r = 150;
  const a0 = -arc / 2 + 0; // centred on the right (sea side) when arc < 360
  const pt = (deg: number, rr = r) => [cx + rr * Math.cos((deg * Math.PI) / 180), cy + rr * Math.sin((deg * Math.PI) / 180)];
  const wear = (() => {
    if (arc >= 359) return `M${cx + r} ${cy}A${r} ${r} 0 1 1 ${cx - r} ${cy}A${r} ${r} 0 1 1 ${cx + r} ${cy}`;
    const [x0, y0] = pt(-arc / 2);
    const [x1, y1] = pt(arc / 2);
    return `M${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}`;
  })();
  void a0;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={rgba(P.amberDeep, 0.25)} stroke={P.bone} strokeWidth={3} opacity={0.9} />
      {[0, 120, 240].map((d) => (
        <path key={d} d={`M${pt(d, 18)[0]} ${pt(d, 18)[1]}Q${pt(d + 40, 90)[0]} ${pt(d + 40, 90)[1]} ${pt(d + 90, r - 14)[0]} ${pt(d + 90, r - 14)[1]}`} stroke={rgba(P.bone, 0.5)} strokeWidth={3} fill="none" />
      ))}
      <path d={wear} stroke={P.amber} strokeWidth={14} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 2`} />
      <text x={cx} y={cy + r + 70} textAnchor="middle" fontFamily={FONT.title} fontSize={26} letterSpacing={6} fill={P.bone}>{label}</text>
      <text x={cx} y={cy + r + 112} textAnchor="middle" fontFamily={FONT.accent} fontStyle="italic" fontSize={30} fill={P.boneDim}>{sub}</text>
    </g>
  );
};
const S5c: React.FC = () => {
  const {t, cue} = useShot();
  const d1 = easeInOut(prog(t, cue('c5.17'), cue('c5.17') + 1.8));
  const d2 = easeInOut(prog(t, cue('c5.18') + 0.2, cue('c5.18') + 2.6));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 70% at 50% 45%, ${P.ink2}, ${P.ink0})`}}>
      <ShotCam from={{s: 1.0}} to={{s: 1.06}}>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <Cross cx={560} cy={440} arc={360} start={0} label="FROM THE HUT" sub="worn all round" draw={d1} />
          <Cross cx={1360} cy={440} arc={110} start={0} label="FROM THE ROAD" sub="one side only" draw={d2} />
          <path d="M960 200V760" stroke={rgba(P.bone, 0.15)} strokeWidth={2} strokeDasharray="6 10" />
          {/* sea to the right of the second rope */}
          <path d={`M1560 ${300}Q1600 ${340} 1560 ${380}Q1600 ${420} 1560 ${460}Q1600 ${500} 1560 ${540}`} stroke={P.teal} strokeWidth={3} fill="none" opacity={0.5 * d2} />
        </svg>
      </ShotCam>
    </AbsoluteFill>
  );
};

// --- S5d: the hand in the groove (hero)
const S5d: React.FC = () => {
  const {t, cue, end} = useShot();
  const arrive = easeInOut(prog(t, cue('c5.19') + 0.2, cue('c5.19') + 4.6));
  const close = prog(t, cue('c5.20') + 0.1, cue('c5.20') + 1.9);
  const fit = easeInOut(prog(t, cue('c5.20') + 1.6, cue('c5.20') + 2.4)) * (1 - easeInOut(prog(t, cue('c5.21') + 0.8, cue('c5.21') + 2.0)));
  return (
    <AbsoluteFill style={{background: `linear-gradient(90deg, #1a1626 0%, ${P.ink1} 45%, #0b2230 100%)`}}>
      <ShotCam keys={[{t: 0, x: 0, y: 0, s: 1.0}, {t: 12.7, x: 20, y: 20, s: 1.2}]} drift={2}>
        <RopeMacro x={900} w={250} passes={[1, 1, 1]} wearFull={1 + fit} />
        <LeftHand x={lerp(1700, 972, arrive)} y={620} close={close} glow={fit} />
        <Pool x={972} y={600} r={380} a={0.35 * fit} />
        <Pool x={250} y={400} r={700} a={0.2} />
      </ShotCam>
    </AbsoluteFill>
  );
};

// --- S6a: listening to the empty road
const S6a: React.FC = () => {
  const {t, dur} = useShot();
  const rings = [0, 1, 2].map((k) => {
    const u = ((t / 2.6 + k / 3) % 1);
    return {u, k};
  });
  return (
    <AbsoluteFill>
      <ShotCam keys={[{t: 0, x: 0, y: 0, s: 1.0}, {t: dur, x: 0, y: -30, s: 1.12}]} drift={2}>
        <Sky mood="calm" stars={130} moon={{x: 1380, y: 170, r: 50}} clouds={2} horizon={430} seed={8} />
        <Causeway mode="world" tide={0.15} />
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {rings.map(({u, k}) => (
            <ellipse key={k} cx={960} cy={440} rx={30 + u * 900} ry={6 + u * 120} fill="none" stroke={P.teal} strokeWidth={2.5} opacity={0.5 * (1 - u)} />
          ))}
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={930 + i * 28} cy={428} r={2.4} fill={P.amberHot} opacity={0.35 + 0.2 * Math.sin(t * 2 + i)} />
          ))}
        </svg>
      </ShotCam>
    </AbsoluteFill>
  );
};

// --- S6b: the smooth place gets a stroke leaning left
const S6b: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const sx = 1443, sy = 978;
  const wr = easeInOut(prog(t, cue('c5.23') + 1.0, end('c5.24') - 0.2));
  const ring = easeInOut(prog(t, 0.2, 1.2)) * (1 - 0.6 * wr);
  const q = {x: sx - 80, y: sy - 20};
  return (
    <AbsoluteFill>
      <ShotCam keys={[{t: 0, x: q.x - 960 - 110, y: q.y - 540 - 70, s: 3.3}, {t: dur, x: q.x - 960, y: q.y - 540, s: 4.6}]} drift={2}>
        <Layer depth={1}>
          <StoneFace rowsLit={0} last={0.82} label={false} />
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
            <ellipse cx={sx} cy={sy} rx={16} ry={18} fill="none" stroke={P.amber} strokeWidth={1.6} opacity={ring} strokeDasharray="5 4" />
            {wr > 0 && (
              <g>
                <path d={`M${sx - 7} ${sy - 9}L${sx - 7 + 11 * wr} ${sy - 9 + 19 * wr}`} stroke={rgba(P.ink0, 0.95)} strokeWidth={5} strokeLinecap="round" />
                <path d={`M${sx - 6} ${sy - 8}L${sx - 6 + 11 * wr} ${sy - 8 + 19 * wr}`} stroke={P.bone} strokeWidth={1.6} strokeLinecap="round" opacity={0.85} />
              </g>
            )}
          </svg>
        </Layer>
      </ShotCam>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 55% at 50% 50%, rgba(0,0,0,0), ${rgba(P.ink0, 0.7)})`}} />
    </AbsoluteFill>
  );
};

const Hud: React.FC = () => {
  const t = useTime();
  const on = prog(t, c('c5.06') - 0.3, c('c5.06') + 0.4) * (1 - prog(t, c('c5.22') - 1.2, c('c5.22') - 0.6));
  const back = t >= c('c5.25') && t < CUT;
  if (t >= CUT) return null;
  if (back) {
    const g = 0.9 - 0.4 * prog(t, c('c5.25'), c('c5.25') + 1.5);
    return <LedgerHUD out={1} in={0} night={14976} mode="mini" glitch={g} nightText="---" opacity={0.9} />;
  }
  if (on <= 0) return null;
  return <LedgerHUD out={1} in={0} night={14976} mode="mini" opacity={on} />;
};

const S7bg: React.FC = () => null;

export const Chapter: React.FC = () => {
  void S7bg;
  return (
    <AbsoluteFill style={{background: P.ink0}}>
      <Shot from={0} to={8.2} clock={clock} fadeIn={0.8} fadeOut={0}>
        <S1 />
      </Shot>
      <Shot from={7.6} to={16.2} clock={clock} fadeIn={0.8} fadeOut={0}>
        <StoneWide tideFrom={0.9} tideTo={0.05} />
      </Shot>
      <Shot from={15.7} to={27.6} clock={clock} fadeIn={0.7} fadeOut={0}>
        <S3 />
      </Shot>
      <Shot from={27.0} to={41.4} clock={clock} fadeIn={0.7} fadeOut={0}>
        <S4 />
      </Shot>
      <Shot from={40.8} to={50.4} clock={clock} fadeIn={0.7} fadeOut={0}>
        <S5a />
      </Shot>
      <Shot from={49.8} to={61.2} clock={clock} fadeIn={0.6} fadeOut={0}>
        <S5b />
      </Shot>
      <Shot from={60.6} to={66.2} clock={clock} fadeIn={0.5} fadeOut={0}>
        <S5c />
      </Shot>
      <Shot from={65.6} to={78.6} clock={clock} fadeIn={0.5} fadeOut={0}>
        <S5d />
      </Shot>
      <Shot from={78.0} to={86.0} clock={clock} fadeIn={0.8} fadeOut={0}>
        <S6a />
      </Shot>
      <Shot from={85.4} to={94.6} clock={clock} fadeIn={0.6} fadeOut={0}>
        <S6b />
      </Shot>
      <Shot from={94.2} to={CUT} clock={clock} fadeIn={0.5} fadeOut={0}>
        <StoneWide tideFrom={0.1} tideTo={0.95} clockOn seaK={1.5} />
      </Shot>
      <Hud />
      <Finish grain={0.06} />
    </AbsoluteFill>
  );
};
export const _t = TOTAL;
