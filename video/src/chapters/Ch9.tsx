import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Layer, Finish, FONT, InkText, LedgerHUD, P, Silhouette, clamp01, easeInOut, lerp, mix, prog, rgba, rollValue} from '../kit';
import {Shot, ShotCam, makeClock, useShot, Dusk, PageSheet, COL, Fade, LampDisc, Pool, POST} from '../kitB';
import raw from '../data/timing/ch9.json';
import {chapterSeconds} from '../data/layout';

const clock = makeClock(9, raw);
const TOTAL = chapterSeconds(9);
const C01 = clock.cue('c9.01');
const BOY_ACROSS = clock.end('c9.01');
export const CH9_STRIKES = [C01 - 0.2, C01 + 1.4, C01 + 2.9, C01 + 4.4, C01 + 5.6];

const Boy: React.FC<{t: number}> = ({t}) => {
  const x = lerp(-260, 1010, easeInOut(prog(t, 0.6, BOY_ACROSS + 0.6)) * 0.55 + prog(t, 0.6, BOY_ACROSS + 0.6) * 0.45);
  const walking = t > 0.6 && t < BOY_ACROSS + 0.6;
  return (
    <g>
      <Silhouette kind="child" x={x} y={786} scale={1.2} walk={walking ? {speed: 1.7, bob: 3} : undefined} lantern={0.0} fill="#03060e" rim={rgba(P.amber, 0.4)} />
      <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <g transform={`translate(${x + 30},${786 - 60})`}>
          <path d="M-16 0 Q0 26 16 0Z" fill="#0a0f1e" />
          <path d="M-16 0 Q0 -26 16 0" stroke="#0a0f1e" strokeWidth={3} fill="none" />
        </g>
      </svg>
    </g>
  );
};

const Maren: React.FC<{t: number}> = ({t}) => {
  const ringing = CH9_STRIKES.some((s) => t > s && t < s + 0.5);
  const dip = CH9_STRIKES.reduce((a, s) => a + (t > s && t < s + 0.45 ? Math.sin(((t - s) / 0.45) * Math.PI) * 16 : 0), 0);
  return (
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path d={`M828 ${652 + dip * 0.4} L846 ${690 + dip}`} stroke="#03060e" strokeWidth={10} strokeLinecap="round" />
      <circle cx={846} cy={690 + dip} r={7} fill="#03060e" />
      {ringing && <circle cx={846} cy={690 + dip} r={18} fill="none" stroke={rgba(P.teal, 0.5)} strokeWidth={2} />}
    </svg>
  );
};

const Scene1: React.FC = () => {
  const {t} = useShot();
  return (
    <AbsoluteFill>
      <ShotCam keys={[{t: 0, x: -150, y: 40, s: 1.18}, {t: 8.4, x: 40, y: 0, s: 1.04}]} drift={3}>
        <Dusk
          lit={Math.round(2 + t * 0.9)}
          lamps={Math.min(8, 2 + Math.floor(t * 0.9))}
          strikes={CH9_STRIKES}
          tide={0.1 + t * 0.02}
          road={
            <>
              <Boy t={t} />
              <Silhouette kind="mother" x={832} y={790} scale={1.06} fill="#03060e" rim={rgba(P.amber, 0.35)} seed={2} />
              <Maren t={t} />
            </>
          }
        />
      </ShotCam>
    </AbsoluteFill>
  );
};

const PageShot: React.FC = () => {
  const {t, cue, end, sp} = useShot();
  const d2 = end('c9.02') - cue('c9.02');
  const f2 = (a: number) => cue('c9.02') + d2 * a;
  const slide = easeInOut(prog(t, cue('c9.03') - 0.5, cue('c9.03') + 0.5));
  const d3 = end('c9.03') - cue('c9.03');
  const rule = prog(t, f2(0.88), f2(1.0));
  const ringA = easeInOut(prog(t, f2(0.9), f2(1.0) + 0.5));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 80% at 50% 40%, ${P.ink2}, ${P.ink0})`}}>
      <ShotCam keys={[{t: 0, x: -250, y: -150, s: 1.35}, {t: 5.2, x: -120, y: -190, s: 1.5}, {t: 6.4, x: 60, y: -240, s: 1.5}, {t: 12.7, x: 120, y: -250, s: 1.6}]} drift={2}>
        <Layer depth={1}>
        {/* page A */}
        <PageSheet x={330} y={110} lamp={{x: 520 + 180 * Math.sin(t * 0.3), y: 330}}>
          <InkText mode="stroke" text="14,978" x={COL.out - 226} y={COL.row(0)} size={34} start={-5} end={-4} ink="night" penHead={false} />
          <InkText mode="stroke" text="4" x={COL.out + 20} y={COL.row(0)} size={34} start={-5} end={-4} ink="night" penHead={false} />
          <InkText mode="stroke" text="4" x={COL.in + 20} y={COL.row(0)} size={34} start={-5} end={-4} ink="night" penHead={false} />
          <InkText mode="stroke" text="14,979" x={COL.out - 226} y={COL.row(1)} size={34} start={f2(0.12)} end={f2(0.5)} ink="night" />
          <InkText mode="stroke" text="1" x={COL.out + 20} y={COL.row(1)} size={38} start={f2(0.55)} end={f2(0.66)} ink="night" />
          <InkText mode="stroke" text="1" x={COL.in + 20} y={COL.row(1)} size={38} start={f2(0.74)} end={f2(0.84)} ink="night" />
          <svg width={1200} height={820} style={{position: 'absolute', left: 0, top: 0}}>
            <path d={`M40 ${COL.row(1) + 18}H${40 + 1120 * easeInOut(rule)}`} stroke={P.penInk} strokeWidth={2.6} />
            <path d={`M40 ${COL.row(1) + 25}H${40 + 1120 * easeInOut(prog(rule, 0.3, 1))}`} stroke={P.penInk} strokeWidth={1.6} />
            {[COL.out + 36, COL.in + 36].map((cx, i) => (
              <circle key={i} cx={cx} cy={COL.row(1) - 16} r={14 + 42 * ringA} fill="none" stroke={P.teal} strokeWidth={3} opacity={0.75 * (1 - ringA * 0.35) * clamp01(ringA * 4)} />
            ))}
          </svg>
        </PageSheet>
        {/* page B, tomorrow */}
        <PageSheet x={330 + (1 - slide) * 1700} y={110 + (1 - slide) * 30} rotate={(1 - slide) * 4} lamp={{x: 760, y: 360}}>
          <InkText mode="stroke" text="14,980" x={COL.out - 226} y={COL.row(0)} size={34} start={-5} end={-4} ink="night" penHead={false} />
          <InkText mode="stroke" text="IN: 1" x={COL.in + 10} y={COL.row(0)} size={40} start={cue('c9.03') + d3 * 0.5} end={end('c9.03') - 0.05} ink="pencil" weight={1.3} tracking={0.2} />
        </PageSheet>
        </Layer>
        {/* shade cast by moving page */}
        <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, background: `linear-gradient(90deg, rgba(0,0,0,${0.5 * (1 - slide) * slide * 2}) 0%, rgba(0,0,0,0) 60%)`, pointerEvents: 'none'}} />
      </ShotCam>
    </AbsoluteFill>
  );
};

const Finale: React.FC = () => {
  const {t, cue, end, tc} = useShot();
  const twelfth = easeInOut(prog(t, cue('c9.05') - 0.4, cue('c9.05') + 0.8));
  const ring = Array.from({length: 11}, (_, i) => {
    const a = (i / 11) * Math.PI * 2 + 0.4;
    return {x: POST.x + 190 + Math.cos(a) * 250, y: 748 + Math.sin(a) * 12 + (Math.sin(a) > 0 ? 6 : 0), z: Math.sin(a)};
  });
  return (
    <AbsoluteFill>
      <ShotCam keys={[{t: 0, x: 250, y: 170, s: 1.45}, {t: 8, x: 100, y: 20, s: 1.12}, {t: 22.6, x: 20, y: -170, s: 1.0}]} drift={3}>
        <Dusk
          mood="calm"
          skyMood="calm"
          stars={120}
          lit={11}
          lamps={9}
          strikes={[]}
          tide={0.35}
          road={
            <>
              {ring.map((l, i) => (
                <LampDisc key={i} x={l.x} y={l.y - 40} r={13} seed={i + 20} a={0.85} />
              ))}
              <LampDisc x={POST.x + 190} y={738} r={15 + 6 * twelfth} seed={44} a={twelfth} />
              <Pool x={POST.x + 190} y={786} r={260} a={0.18 * twelfth + 0.08} />
            </>
          }
        />
      </ShotCam>
      <InkText mode="clip" text="I was never the one who failed to count." x={1180} y={236} size={70} align="center" start={cue('c9.05') - 0.3} end={end('c9.05')} ink="bone" settle={1.4} />
      <InkText mode="clip" text="I was the one who was counted." x={1180} y={346} size={84} align="center" start={cue('c9.06') - 0.2} end={end('c9.06') - 0.1} ink="bone" settle={2} />
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 40% at 50% 28%, ${rgba(P.ink0, 0.5)}, rgba(0,0,0,0))`, opacity: 0, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

export const Chapter: React.FC = () => {
  return <ChapterInner />;
};

const ChapterInner: React.FC = () => {
  return (
    <AbsoluteFill style={{background: P.ink0}}>
      <Shot from={0} to={8.4} clock={clock} fadeIn={1.2} fadeOut={0}>
        <Scene1 />
      </Shot>
      <Shot from={7.7} to={20.4} clock={clock} fadeIn={0.7} fadeOut={0}>
        <PageShot />
      </Shot>
      <Shot from={19.6} to={TOTAL} clock={clock} fadeIn={0.9} fadeOut={0}>
        <Finale />
      </Shot>
      <Hud />
      <TitleAndFade />
      <Finish grain={0.06} />
    </AbsoluteFill>
  );
};

const Hud: React.FC = () => {
  const f = useCurrentFrameSec();
  const t = f;
  const ins = rollValue(t, BOY_ACROSS - 0.2, 0, 1, 0.5);
  const teal = easeInOut(prog(t, clock.end('c9.06') + 2.2, clock.end('c9.06') + 4));
  const op = t < 7.7 ? 1 : t < 8.4 ? lerp(1, 0, (t - 7.7) / 0.7) : t < 19.3 ? 0 : lerp(0, 1, clamp01((t - 19.3) / 1.2));
  return <LedgerHUD out={1} in={ins} night={14979} delta={1 - ins} opacity={t > TOTAL - 5 ? op * (1 - prog(t, TOTAL - 5, TOTAL - 1.5)) : op} tone={mix(P.boneDim, P.teal, teal)} />;
};

import {useCurrentFrame, useVideoConfig} from 'remotion';
function useCurrentFrameSec() {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return f / fps;
}

const TitleAndFade: React.FC = () => {
  const t = useCurrentFrameSec();
  const lastEnd = clock.end('c9.06');
  const fadeLine = 1 - easeInOut(prog(t, lastEnd + 7.5, lastEnd + 9));
  const title = easeInOut(prog(t, lastEnd + 9.2, lastEnd + 10.6)) * (1 - easeInOut(prog(t, lastEnd + 12.6, lastEnd + 13.6)));
  return (
    <>
      {/* fade the last line + scene to black */}
      <Fade from={lastEnd + 7.5} to={lastEnd + 10.0} color={P.ink0} max={1} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', opacity: title * 0.85, fontFamily: FONT.title, fontSize: 30, letterSpacing: '0.36em', color: P.bone}}>
        THE LEDGER WAS ONE SHORT
        <div style={{fontFamily: FONT.accent, fontStyle: 'italic', fontSize: 24, letterSpacing: '0.2em', color: P.amber, marginTop: 18}}>for forty-one years</div>
      </div>
      {t > lastEnd + 12.6 && <AbsoluteFill style={{background: P.ink0, opacity: easeInOut(prog(t, lastEnd + 12.6, lastEnd + 13.8)) * 0 + 0, pointerEvents: 'none'}} />}
      <div style={{display: 'none'}}>{fadeLine}</div>
    </>
  );
};
