import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Camera, CameraProps, Timing, clamp01, P, FPS} from '../kit';

/** chapter time helpers: absolute chapter seconds from sentence ids (voice starts at `lead`). */
export const mkT = (timing: Timing, lead: number) => {
  const a = (id: string, o = 0) => lead + timing.cue(id) + o;
  const e = (id: string, o = 0) => lead + timing.end(id) + o;
  /** estimated moment the narrator finishes speaking the sentence (sentence end includes the pause) */
  const sp = (id: string, o = 0) => {
    const s = timing.get(id);
    return lead + s.start + Math.min(s.end - s.start, s.text.length / 14.5 + 0.25) + o;
  };
  return {a, e, sp, lead, timing};
};
export type TT = ReturnType<typeof mkT>;

const ScCtx = createContext<{a: number; dur: number}>({a: 0, dur: 0});
/** scene-local clock: t = seconds since scene start; L(abs) converts chapter seconds to scene seconds */
export const useS = () => {
  const f = useCurrentFrame();
  const c = useContext(ScCtx);
  return {t: f / FPS, a: c.a, dur: c.dur, L: (abs: number) => abs - c.a};
};

export type SceneDef = {at: number; fi?: number; el: React.ReactNode; bg?: string};

/** Mounts scenes in sequence; each scene fades in over `fi` seconds on top of the previous (which stays mounted until covered). */
export const Scenes: React.FC<{list: SceneDef[]; end: number}> = ({list, end}) => (
  <AbsoluteFill style={{background: P.ink0}}>
    {list.map((s, i) => {
      const next = list[i + 1];
      const stop = next ? next.at + (next.fi ?? 0.6) + 0.05 : end;
      const dur = stop - s.at;
      return (
        <Sequence key={i} from={Math.round(s.at * FPS)} durationInFrames={Math.max(1, Math.round(dur * FPS))} layout="none">
          <ScCtx.Provider value={{a: s.at, dur}}>
            <FadeIn fi={s.fi ?? 0.6} bg={s.bg ?? P.ink0}>{s.el}</FadeIn>
          </ScCtx.Provider>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

const FadeIn: React.FC<{fi: number; bg: string; children: React.ReactNode}> = ({fi, bg, children}) => {
  const f = useCurrentFrame();
  const o = fi <= 0 ? 1 : clamp01(f / FPS / fi);
  return <AbsoluteFill style={{opacity: o, background: bg}}>{children}</AbsoluteFill>;
};

/** Camera whose default end = scene duration. keys / from-to are in scene-local seconds. */
export const Cam: React.FC<Omit<CameraProps, 'end'> & {end?: number}> = ({end, ...rest}) => {
  const {dur} = useS();
  return <Camera {...rest} end={end ?? dur} />;
};

// ---------- sound plan ----------
type TS = number | {id: string; off?: number; end?: boolean};
export const resolveT = (x: TS, T: TT) => (typeof x === 'number' ? x : x.end ? T.e(x.id, x.off ?? 0) : T.a(x.id, x.off ?? 0));
export type SoundSpec = {
  music: {from: TS; to: TS; mood: string}[];
  beds: {from: TS; to: TS; name: string; gain: number}[];
  sfx: {at: TS; name: string; gain: number}[];
};
/** chapter-absolute seconds of all sfx with a given name */
export const sfxTimes = (spec: SoundSpec, T: TT, name: string) => spec.sfx.filter((s) => s.name === name).map((s) => resolveT(s.at, T));
