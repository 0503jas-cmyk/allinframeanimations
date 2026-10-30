import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {Camera, CamKey, CameraProps, Timing, loadTiming, Sentence, P, clamp01, FPS} from '../kit';
import {LAYOUT} from '../data/layout';

/** Chapter clock: sentence times shifted by the chapter lead so that cue(id) is in chapter seconds. */
export const makeClock = (n: number, raw: Sentence[]): Timing => {
  const lead = LAYOUT[n].lead;
  return loadTiming(raw.map((s) => ({...s, start: s.start + lead, end: s.end + lead})));
};

type ShotInfo = {t0: number; dur: number; clock: Timing};
const ShotCtx = createContext<ShotInfo>({t0: 0, dur: 1, clock: loadTiming([])});

/** A time slice of the chapter. Children run on a LOCAL clock (frame 0 = `from`); use useShot().cue(id) for local cue seconds. */
export const Shot: React.FC<{from: number; to: number; clock: Timing; fadeIn?: number; fadeOut?: number; bg?: string; children: React.ReactNode}> = ({from, to, clock, fadeIn = 0.4, fadeOut = 0.4, bg = P.ink0, children}) => {
  const f0 = Math.round(from * FPS);
  const f1 = Math.round(to * FPS);
  const dur = (f1 - f0) / FPS;
  return (
    <Sequence from={f0} durationInFrames={f1 - f0} layout="none">
      <ShotCtx.Provider value={{t0: f0 / FPS, dur, clock}}>
        <ShotFade fadeIn={fadeIn} fadeOut={fadeOut} dur={dur} bg={bg}>
          {children}
        </ShotFade>
      </ShotCtx.Provider>
    </Sequence>
  );
};

const ShotFade: React.FC<{fadeIn: number; fadeOut: number; dur: number; bg: string; children: React.ReactNode}> = ({fadeIn, fadeOut, dur, bg, children}) => {
  const f = useCurrentFrame();
  const a = fadeIn > 0 ? clamp01(f / (fadeIn * FPS)) : 1;
  const b = fadeOut > 0 ? clamp01((dur * FPS - f) / (fadeOut * FPS)) : 1;
  return <AbsoluteFill style={{opacity: Math.min(a, b), background: bg}}>{children}</AbsoluteFill>;
};

export const useShot = () => {
  const info = useContext(ShotCtx);
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  return {
    t,
    t0: info.t0,
    dur: info.dur,
    /** chapter-clock seconds */
    tc: t + info.t0,
    cue: (id: string, o = 0) => info.clock.cue(id) - info.t0 + o,
    end: (id: string, o = 0) => info.clock.end(id) - info.t0 + o,
    /** progress 0..1 of this sentence in local time */
    sp: (id: string) => clamp01((t + info.t0 - info.clock.cue(id)) / Math.max(1e-6, info.clock.dur(id))),
  };
};

/** Camera that knows the shot length. */
export const ShotCam: React.FC<Omit<CameraProps, 'end'> & {keys?: CamKey[]}> = (props) => {
  const {dur} = useShot();
  return <Camera {...props} end={dur} />;
};
