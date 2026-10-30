import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Finish, FONT, InkText, Layer, LedgerHUD, P, Silhouette, clamp01, easeInOut, easeOut, hash, lerp, mix, prog, rgba, rollValue} from '../kit';
import {Shot, ShotCam, makeClock, useShot, Dusk, Sea, ChalkWord, LampDisc, Pool, PageSheet, COL, POST, LAMP_XS, useTime} from '../kitB';
import {RopeMacro, LeftHand} from '../kitB/stone';
import raw from '../data/timing/ch8.json';
import {chapterSeconds} from '../data/layout';

const clock = makeClock(8, raw);
const TOTAL = chapterSeconds(8);
const c = (id: string, o = 0) => clock.cue(id, o);
const e = (id: string, o = 0) => clock.end(id, o);
const DARK = '#03060e';
const GX = POST.x + 192; // where she stands, at the rope

// ---------------------------------------------------------------- lived at the post
const PostLived: React.FC<{k: 'a' | 'b'}> = ({k}) => {
  const {t, cue, end, dur} = useShot();
  // water level on her: ankle, shin, knee
  const lvl = k === 'a' ? 0 : prog(t, cue('c8.04'), cue('c8.04') + 0.4) * 15 + prog(t, cue('c8.05'), end('c8.05')) * 20 + prog(t, cue('c8.06'), end('c8.06')) * 30;
  const strikes = [cue('c8.03') + 0.2];
  return (
    <AbsoluteFill>
      <ShotCam keys={k === 'a' ? [{t: 0, x: 150, y: 150, s: 1.5}, {t: dur, x: 170, y: 120, s: 1.7}] : [{t: 0, x: 170, y: 160, s: 1.9}, {t: dur, x: 170, y: 200, s: 2.1}]} drift={2}>
        <Dusk mood="calm" skyMood="calm" stars={100} lit={5} lamps={4} strikes={strikes} tide={0.12} postWear={1}
          road={<Silhouette kind="mother" x={GX} y={790} scale={1.06} fill={DARK} rim={rgba(P.amber, 0.3)} />}
          fore={
            <div style={{position: 'absolute', left: -300, top: 0}}>
              <Sea width={2600} step={28} layers={[{y: 790 - Math.min(52, lvl), amp: 3 + lvl * 0.03, wl: 300, speed: 30, top: rgba(P.ink3, 0.85) as string, bottom: rgba(P.ink1, 0.9) as string, foam: true}]} />
            </div>
          }
        />
      </ShotCam>
    </AbsoluteFill>
  );
};

const Grooves: React.FC = () => {
  const {t, cue, dur} = useShot();
  const close = prog(t, cue('c8.07') - 0.3, cue('c8.07') + 1.6);
  const fin = easeInOut(prog(t, cue('c8.08') + 0.3, cue('c8.08') + 2.2));
  return (
    <AbsoluteFill style={{background: `linear-gradient(90deg, #1a1626 0%, ${P.ink1} 45%, #0b2230 100%)`}}>
      <ShotCam keys={[{t: 0, x: 0, y: 0, s: 1.1}, {t: dur, x: 30, y: 30, s: 1.4}]} drift={2}>
        <RopeMacro x={900} w={250} passes={[1, 1, 1]} wearFull={1} />
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <rect x={900 + 250 * 0.0} y={120} width={78} height={860} fill={P.ink0} opacity={0.5 * fin} />
          <path d={`M${900} 120V980`} stroke={P.amberHot} strokeWidth={3} opacity={0.5 * fin} />
        </svg>
        <LeftHand x={972} y={640} close={close} scale={1} glow={fin} />
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <ellipse cx={945} cy={560} rx={34} ry={60} fill="none" stroke={P.amber} strokeWidth={3} strokeDasharray="8 7" opacity={fin} />
        </svg>
        <Pool x={250} y={400} r={700} a={0.2} />
      </ShotCam>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the road to the lamps, the child
const Lamps: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const ghost = easeInOut(prog(t, cue('c8.09') + 1.5, cue('c8.09') + 3.5));
  const cx = lerp(560, 1700, easeInOut(prog(t, cue('c8.09') + 1.5, end('c8.10') - 0.5)));
  return (
    <AbsoluteFill>
      <ShotCam keys={[{t: 0, x: 170, y: 40, s: 1.35, r: 0}, {t: 3.5, x: 20, y: 0, s: 1.1, r: 0}, {t: dur, x: 300, y: 0, s: 1.1}]} drift={2}>
        <Dusk mood="calm" skyMood="calm" stars={110} lit={11} lamps={9} tide={0.25} postWear={1}
          road={
            <>
              <Silhouette kind="mother" x={GX} y={790} scale={1.06} fill={DARK} rim={rgba(P.amber, 0.3)} />
              <g opacity={0.65 * ghost}>
                <Silhouette kind="child" x={cx} y={790} scale={1.3} fill="#aeb8d6" walk={{speed: 1.3, bob: 2}} />
              </g>
            </>
          }
        />
      </ShotCam>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Kell and the drowned bell
const KellBell: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const run = prog(t, cue('c8.12') - 0.3, cue('c8.13') + 1.0);
  const kx = lerp(1990, 1300, easeInOut(run));
  const rise = prog(t, cue('c8.13'), end('c8.13') + 0.5);
  const strikes = Array.from({length: 7}, (_, i) => cue('c8.13') + i * 1.0);
  const one = cue('c8.14') + 0.4;
  const dt = t - one;
  return (
    <AbsoluteFill>
      <ShotCam keys={[{t: 0, x: 280, y: 10, s: 1.1}, {t: dur, x: 90, y: 40, s: 1.4}]} drift={2}>
        <Dusk mood="calm" skyMood="calm" stars={120} lit={9} lamps={8} strikes={[...strikes, one]} tide={0.2 + rise * 0.9} bellAmp={rise > 0.9 ? 6 : 18}
          road={<Silhouette kind="walker" x={kx} y={790} scale={1.05} fill={DARK} walk={run > 0 && run < 1 ? {speed: 2.1, bob: 6} : undefined} lantern={1} rim={rgba(P.amber, 0.4)} flip={run >= 1} seed={4} />}
          extra={dt > 0 && dt < 2.4 ? (
            <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              {[0, 0.35, 0.7].map((d, i) => {
                const u = dt - d;
                if (u < 0) return null;
                return <ellipse key={i} cx={POST.x + 120} cy={POST.y - 20} rx={40 + u * 300} ry={8 + u * 40} fill="none" stroke={P.teal} strokeWidth={3} opacity={0.7 * (1 - u / 2)} />;
              })}
            </svg>
          ) : undefined}
        />
      </ShotCam>
    </AbsoluteFill>
  );
};

const Across: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const cr = prog(t, cue('c8.18') - 0.2, cue('c8.18') + 1.8);
  const cracks = Array.from({length: 16}, (_, i) => {
    const a = (i / 16) * Math.PI * 2 + hash(i) * 0.3;
    let d = 'M960 540';
    let x = 960, y = 540;
    for (let k = 0; k < 6; k++) {
      const r = 70 + k * 130 + hash(i * 9 + k) * 60;
      const aa = a + (hash(i * 5 + k) - 0.5) * 0.5;
      x = 960 + Math.cos(aa) * r;
      y = 540 + Math.sin(aa) * r * 0.62;
      d += `L${x.toFixed(0)} ${y.toFixed(0)}`;
    }
    return d;
  });
  return (
    <AbsoluteFill>
      <ShotCam keys={[{t: 0, x: 400, y: 20, s: 1.15}, {t: dur, x: 460, y: 10, s: 1.3}]} drift={2}>
        <Dusk mood="calm" skyMood="calm" stars={120} lit={11} lamps={9} tide={0.9} postWear={1} bellRings={false}
          road={
            <>
              <Silhouette kind="walker" x={1900} y={790} scale={1.05} fill={DARK} lantern={1} flip rim={rgba(P.amber, 0.4)} />
              <Silhouette kind="child" x={1780} y={790} scale={1.3} fill={DARK} rim={rgba(P.amber, 0.3)} />
            </>
          }
        />
      </ShotCam>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {cracks.map((d, i) => (
          <path key={i} d={d} pathLength={1} strokeDasharray={`${easeOut(clamp01(cr * 1.3 - (i % 4) * 0.08))} 2`} stroke={P.bone} strokeWidth={2.4} fill="none" opacity={0.85 * (1 - 0.6 * prog(cr, 0.8, 1))} />
        ))}
      </svg>
      <AbsoluteFill style={{background: P.ink0, opacity: prog(t, cue('c8.18') + 1.2, cue('c8.18') + 2.4) * 0.9}} />
      <div style={{display: 'none'}}>{end('c8.17')}</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- THE AGE-SEVEN NIGHT (recovered memory): flat, ink + amber, teal held back
const Replay: React.FC<{k: number}> = ({k}) => {
  const {t, cue, end, dur} = useShot();
  const tealOn = t + 0 >= cue('c8.26');
  const foam = k >= 5 && tealOn ? P.teal : null;
  let cam, road: React.ReactNode, fore: React.ReactNode = null, extra: React.ReactNode = null, strikes: number[] = [], tide = 0.3;
  const mom = (x: number, flip = false) => <Silhouette kind="mother" x={x} y={790} scale={1.06} fill={DARK} rim={rgba(P.amber, 0.45)} flip={flip} />;
  const kid = (x: number, w = false) => <Silhouette kind="child" x={x} y={790} scale={1.25} fill={DARK} rim={rgba(P.amber, 0.45)} walk={w ? {speed: 1.3, bob: 2} : undefined} />;
  if (k === 1) {
    // c19: the mother crossing back in the last light, medicine in her coat
    const x = lerp(-250, 560, easeInOut(prog(t, 0.3, dur - 0.5)));
    cam = [{t: 0, x: -200, y: 20, s: 1.1}, {t: dur, x: 300, y: 10, s: 1.2}];
    road = (
      <>
        <Silhouette kind="mother" x={x} y={790} scale={1.06} fill={DARK} walk={{speed: 1.1, bob: 3}} rim={rgba(P.amber, 0.45)} />
        <circle cx={x + 18} cy={790 - 70} r={7} fill={P.amberHot} opacity={0.9} />
      </>
    );
  } else if (k === 2) {
    // c20: the hut is empty
    cam = [{t: 0, x: 160, y: 120, s: 1.4}, {t: dur, x: 100, y: 120, s: 1.7}];
    road = null;
    extra = (
      <>
        <Silhouette kind="clerkHut" x={1500} y={786} scale={1.2} fill={DARK} lit={0.05} />
        <div style={{position: 'absolute', left: 1450, top: 700, width: 26, height: 60, background: rgba(P.amber, 0.08 + 0.1 * Math.sin(t * 3)), opacity: 1}} />
      </>
    );
  } else if (k === 3) {
    // c21: small prints out to the Stone, child standing in the water
    const x = lerp(1500, 1000, easeInOut(prog(t, 0.2, dur - 1)));
    cam = [{t: 0, x: 80, y: 40, s: 1.2}, {t: dur, x: -120, y: 40, s: 1.35}];
    extra = <Silhouette kind="stone" x={300} y={800} scale={1.2} fill={DARK} tide={0.2} />;
    road = (
      <>
        {mom(x)}
        {kid(330)}
        {Array.from({length: 14}, (_, i) => <circle key={i} cx={1450 - i * 80} cy={795 + (i % 2) * 6} r={4} fill={P.amberHot} opacity={0.5} />)}
      </>
    );
    fore = <div style={{position: 'absolute', left: -300}}><Sea width={2600} step={28} foamColor={null} layers={[{y: 784, amp: 3, wl: 300, speed: 25, top: rgba(P.ink3, 0.8) as string, bottom: rgba(P.ink1, 0.9) as string}]} /></div>;
    tide = 0.4;
  } else if (k === 4) {
    // c22-c24: she walks her to the post, turns her to face the lamps, takes the rope, sea at her knees
    const walk = prog(t, 0.3, cue('c8.23'));
    const x = lerp(260, 760, easeInOut(walk));
    const turn = easeInOut(prog(t, cue('c8.22') + 1.6, cue('c8.22') + 2.4));
    cam = [{t: 0, x: -60, y: 20, s: 1.15}, {t: dur, x: 190, y: 90, s: 1.5}];
    road = (
      <>
        {mom(x + 70)}
        {kid(x + 18, false)}
        <path d={`M${x + 38} 700L${x + 62} 700`} stroke={DARK} strokeWidth={6} />
        {turn > 0 && <circle cx={x + 18} cy={680} r={3} fill={P.amberHot} opacity={turn} />}
      </>
    );
    const lv = prog(t, cue('c8.23'), cue('c8.24') + 1.6) * 38;
    fore = <div style={{position: 'absolute', left: -300}}><Sea width={2600} step={28} foamColor={null} layers={[{y: 800 - lv, amp: 3, wl: 300, speed: 30, top: rgba(P.ink3, 0.85) as string, bottom: rgba(P.ink1, 0.9) as string}]} /></div>;
    tide = 0.4;
  } else if (k === 5) {
    // c25-c26: she rings, and the child walks
    const cx = lerp(GX + 30, 1880, easeInOut(prog(t, 0.8, dur - 0.6)));
    cam = [{t: 0, x: 200, y: 80, s: 1.45}, {t: dur, x: 480, y: 20, s: 1.15}];
    strikes = [0.3, 1.9, 3.5, 5.1, 6.7];
    road = <>{mom(GX)}{kid(cx, true)}</>;
    fore = <div style={{position: 'absolute', left: -300}}><Sea width={2600} step={28} foamColor={foam} layers={[{y: 762, amp: 3, wl: 300, speed: 30, top: rgba(P.ink3, 0.85) as string, bottom: rgba(P.ink1, 0.9) as string}]} /></div>;
    tide = 0.5;
  } else {
    // c27: the line, on the dry stones
    cam = [{t: 0, x: 620, y: -10, s: 1.1}, {t: dur, x: 650, y: -10, s: 1.2}];
    road = <>{kid(1500)}{mom(GX)}</>;
    tide = 0.5;
  }
  return (
    <AbsoluteFill>
      <ShotCam keys={cam} drift={2}>
        <Dusk mood="dusk" skyMood="dusk" stars={40} lit={9} lamps={8} strikes={strikes} tide={tide} foam={foam} bellRings={!!foam} road={road} extra={extra} fore={fore} bellAmp={12} />
      </ShotCam>
      {k === 6 && (
        <>
          <ChalkWord text={"DON'T SLEEP,"} x={960} y={300} size={96} start={cue('c8.27') - 0.1} end={cue('c8.27') + 0.5} color={P.bone} fadeAt={cue('c8.27') + 5} />
          <ChalkWord text="MAREN." x={960} y={430} size={96} start={cue('c8.27') + 0.5} end={cue('c8.27') + 1.0} color={P.bone} fadeAt={cue('c8.27') + 5} />
          <ChalkWord text="COUNT" x={960} y={560} size={96} start={cue('c8.27') + 1.0} end={cue('c8.27') + 1.5} color={P.amber} fadeAt={cue('c8.27') + 5} />
          <ChalkWord text="FOR ME." x={960} y={690} size={96} start={cue('c8.27') + 1.5} end={cue('c8.27') + 2.0} color={P.amber} fadeAt={cue('c8.27') + 5} />
        </>
      )}
      <div style={{display: 'none'}}>{end('c8.27')}</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the figure, the closing rule, the blank
const Child: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const rule = easeInOut(prog(t, cue('c8.29') - 0.2, cue('c8.29') + 1.5));
  const slide = easeInOut(prog(t, cue('c8.29') + 1.8, cue('c8.29') + 2.8));
  const glow = easeInOut(prog(t, cue('c8.30') + 0.3, cue('c8.30') + 1.6));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 80% at 50% 40%, ${P.ink2}, ${P.ink0})`}}>
      <ShotCam keys={[{t: 0, x: 240, y: -140, s: 1.5}, {t: dur, x: 340, y: -170, s: 1.85}]} drift={2}>
        <Layer depth={1}>
          <PageSheet x={300} y={110} lamp={{x: 700, y: 260}}>
            <InkText mode="stroke" text="7 MAR" x={COL.out - 226} y={COL.row(0)} size={32} start={-8} end={-7} ink="night" penHead={false} />
            <InkText mode="stroke" text="|" x={COL.out + 20} y={COL.row(0) + 6} size={54} hand="child" start={-8} end={-7} ink="night" penHead={false} />
            <InkText mode="stroke" text="IN: 1" x={COL.in + 14} y={COL.row(1)} size={44} hand="child" start={cue('c8.28') - 0.2} end={end('c8.28') - 0.3} ink="night" />
            <svg width={1200} height={820} style={{position: 'absolute', inset: 0}}>
              <path d={`M40 ${COL.row(1) + 16}H${40 + 1120 * rule}`} stroke={P.penInk} strokeWidth={3} />
              <path d={`M40 ${COL.row(1) + 24}H${40 + 1120 * rule}`} stroke={P.penInk} strokeWidth={1.6} />
              <rect x={COL.in + 190} y={COL.row(1) - 52} width={250} height={64} fill={rgba(P.amber, 0.3 * glow)} rx={6} />
              <rect x={COL.in + 190} y={COL.row(1) - 52} width={250} height={64} fill="none" stroke={P.amber} strokeWidth={2.4} strokeDasharray="8 7" opacity={glow} rx={6} />
            </svg>
          </PageSheet>
          <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, background: `linear-gradient(90deg, rgba(0,0,0,${0.4 * slide * (1 - slide) * 2}), rgba(0,0,0,0))`}} />
        </Layer>
      </ShotCam>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the village writes it every night
const Village: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const n = Math.floor(11 * prog(t, cue('c8.31') + 0.3, cue('c8.31') + 3.4));
  return (
    <AbsoluteFill>
      <ShotCam keys={[{t: 0, x: 360, y: 90, s: 1.5}, {t: dur, x: 180, y: 0, s: 1.1}]} drift={2}>
        <Dusk mood="calm" skyMood="calm" stars={130} lit={n} lamps={Math.min(9, n)} tide={0.2} postWear={1} bellRings={false} />
      </ShotCam>
      <div style={{display: 'none'}}>{end('c8.31') + dur}</div>
    </AbsoluteFill>
  );
};

const Hands: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const styles = [
    {slant: 0, w: 1.9, tr: 0.32, h: false, dx: 0, dy: 0},
    {slant: -22, w: 1.0, tr: 0.12, h: false, dx: 24, dy: -14},
    {slant: 10, w: 1.1, tr: 0.2, h: true, dx: -16, dy: 12},
    {slant: -6, w: 1.4, tr: 0.26, h: false, dx: 8, dy: 22},
  ];
  const settle = easeInOut(prog(t, cue('c8.32') + 1.2, cue('c8.32') + 3.2));
  const rub = easeInOut(prog(t, cue('c8.33') + 0.2, end('c8.33') + 0.6));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 80% at 50% 40%, ${P.ink2}, ${P.ink0})`}}>
      <ShotCam keys={[{t: 0, x: 280, y: -150, s: 1.7}, {t: dur, x: 330, y: -170, s: 1.9}]} drift={2}>
        <Layer depth={1}>
          <PageSheet x={300} y={110} lamp={{x: 760, y: 240}}>
            <div style={{opacity: 1 - rub}}>
              {styles.map((s, i) => (
                <InkText key={i} mode="stroke" text="IN: 1" x={COL.in + 30 + s.dx * (1 - settle)} y={COL.row(1) + s.dy * (1 - settle)} size={52} start={cue('c8.32') - 0.2 + i * 0.5} end={cue('c8.32') + 0.5 + i * 0.5} ink="pencil" slant={lerp(s.slant, -6, settle)} weight={s.w} tracking={s.tr} hand={s.h ? 'child' : 'adult'} penHead={false} style={{opacity: i === 0 ? 1 : 1 - 0.7 * settle}} />
              ))}
            </div>
            <svg width={1200} height={820} style={{position: 'absolute', inset: 0}}>
              {rub > 0 && rub < 1 && (
                <g transform={`translate(${COL.in + 10 + 330 * rub} ${COL.row(1) - 12 + Math.sin(rub * 30) * 8})`}>
                  <path d="M0 0Q-10 -34 28 -40Q70 -42 78 -6Q82 30 40 36Q-6 40 0 0Z" fill="#b98a4e" />
                  <path d="M12 -14Q36 -30 64 -10" stroke="#e0b377" strokeWidth={4} fill="none" strokeLinecap="round" />
                </g>
              )}
            </svg>
          </PageSheet>
        </Layer>
      </ShotCam>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- pen replaces pencil
const Names: React.FC = () => {
  const {t, cue, end, dur} = useShot();
  const turn = easeInOut(prog(t, cue('c8.37') - 0.4, cue('c8.37') + 0.8));
  const m0 = cue('c8.35') + 0.6, m1 = end('c8.36') - 0.2;
  const e0 = cue('c8.37') + 2.2, e1 = end('c8.39') - 0.1;
  const smudge = easeInOut(prog(t, e0 + (e1 - e0) * 0.55, e0 + (e1 - e0) * 0.65));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 80% at 50% 40%, ${P.ink2}, ${P.ink0})`}}>
      <ShotCam keys={[{t: 0, x: 400, y: -170, s: 1.9}, {t: cue('c8.37') - 0.4, x: 410, y: -175, s: 1.95}, {t: cue('c8.37') + 1.0, x: -200, y: -250, s: 1.9}, {t: dur, x: -170, y: -250, s: 1.75}]} drift={1}>
        <Layer depth={1}>
          {/* page two: the blank gets her name */}
          <PageSheet x={300} y={110} lamp={{x: 760, y: 260}} opacity={1 - turn}>
            <InkText mode="stroke" text="IN: 1" x={COL.in + 14} y={COL.row(1)} size={44} hand="child" start={-8} end={-7} ink="night" penHead={false} />
            <InkText mode="stroke" text="MAREN VOSS" x={COL.in + 188} y={COL.row(1)} size={34} start={m0} end={m1} ink="night" settle={1.5} tracking={0.14} weight={1.1} />
          </PageSheet>
          {/* page one, turned back: the straight stroke and a name inked over it */}
          <PageSheet x={300 + (1 - turn) * 1600} y={110} rotate={(1 - turn) * 3} lamp={{x: 520, y: 260}} opacity={turn > 0 ? 1 : 0}>
            <InkText mode="stroke" text="7 MAR" x={COL.out - 226} y={COL.row(0)} size={32} start={-8} end={-7} ink="night" penHead={false} />
            <InkText mode="stroke" text="|" x={COL.out + 20} y={COL.row(0) + 6} size={54} hand="child" start={-8} end={-7} ink="night" penHead={false} />
            <InkText mode="stroke" text="ELIN VOSS" x={COL.out + 8} y={COL.row(0)} size={38} start={e0} end={e1} ink="night" settle={2.5} tracking={0.16} weight={1.2} />
            <svg width={1200} height={820} style={{position: 'absolute', inset: 0}}>
              <ellipse cx={COL.out + 190} cy={COL.row(0) - 6} rx={40 * smudge} ry={10 * smudge} fill={P.penInk} opacity={0.22 * smudge} />
            </svg>
          </PageSheet>
        </Layer>
      </ShotCam>
    </AbsoluteFill>
  );
};

const Hud: React.FC = () => {
  const t = useTime();
  const early = prog(t, c('c8.09') - 0.2, c('c8.09') + 0.6) * (1 - prog(t, c('c8.12') + 1.5, c('c8.12') + 2.1));
  const late = prog(t, c('c8.39'), c('c8.39') + 0.8);
  if (t >= c('c8.09') - 0.3 && t < c('c8.12') + 2.2) {
    const tear = prog(t, c('c8.11'), c('c8.11') + 1.4);
    const g = tear > 0 && tear < 1 ? Math.sin(tear * Math.PI) : 0;
    const roll = rollValue(t, c('c8.11') + 0.8, 1, 0, 0.6);
    return <LedgerHUD out={1} in={0} night={14979} delta={roll} mode="mini" glitch={g} opacity={early} tone={tear > 0 ? P.amber : P.teal} />;
  }
  if (late > 0) return <LedgerHUD out={1} in={1} night={14979} delta={0} mode="full" opacity={late} tone={mix(P.amber, P.teal, prog(t, c('c8.39') + 0.5, c('c8.39') + 2.5))} />;
  return null;
};

export const Chapter: React.FC = () => (
  <AbsoluteFill style={{background: P.ink0}}>
    <Shot from={0} to={12.4} clock={clock} fadeIn={0.8} fadeOut={0}><PostLived k="a" /></Shot>
    <Shot from={11.8} to={25.9} clock={clock} fadeIn={0.5} fadeOut={0}><PostLived k="b" /></Shot>
    <Shot from={25.4} to={35.6} clock={clock} fadeIn={0.5} fadeOut={0}><Grooves /></Shot>
    <Shot from={35.0} to={47.9} clock={clock} fadeIn={0.6} fadeOut={0}><Lamps /></Shot>
    <Shot from={47.3} to={62.8} clock={clock} fadeIn={0.6} fadeOut={0}><KellBell /></Shot>
    <Shot from={62.2} to={70.8} clock={clock} fadeIn={0.5} fadeOut={0}><Across /></Shot>
    <Shot from={70.3} to={77.8} clock={clock} fadeIn={0.8} fadeOut={0}><Replay k={1} /></Shot>
    <Shot from={72.0} to={77.8} clock={clock} fadeIn={0.5} fadeOut={0}><Replay k={2} /></Shot>
    <Shot from={77.3} to={83.4} clock={clock} fadeIn={0.5} fadeOut={0}><Replay k={3} /></Shot>
    <Shot from={82.5} to={89.4} clock={clock} fadeIn={0.4} fadeOut={0}><Replay k={4} /></Shot>
    <Shot from={88.8} to={96.8} clock={clock} fadeIn={0.4} fadeOut={0}><Replay k={5} /></Shot>
    <Shot from={96.2} to={101.2} clock={clock} fadeIn={0.5} fadeOut={0}><Replay k={6} /></Shot>
    <Shot from={100.6} to={112.0} clock={clock} fadeIn={0.8} fadeOut={0}><Child /></Shot>
    <Shot from={111.5} to={121.0} clock={clock} fadeIn={0.8} fadeOut={0}><Village /></Shot>
    <Shot from={120.4} to={128.0} clock={clock} fadeIn={0.6} fadeOut={0}><Hands /></Shot>
    <Shot from={127.4} to={TOTAL} clock={clock} fadeIn={0.8} fadeOut={1.2}><Names /></Shot>
    <Hud />
    <Finish grain={0.06} />
  </AbsoluteFill>
);
export const _u8 = [e, FONT, LampDisc, LAMP_XS, easeOut];
