import React, {createContext, useContext} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {W, H, easeInOut, clamp01, noise, smooth} from './theme';

export type CamPose = {x: number; y: number; s: number; r: number};
export type CamKey = Partial<CamPose> & {t: number};

const Ctx = createContext<CamPose & {t: number}>({x: 0, y: 0, s: 1, r: 0, t: 0});
export const useCamera = () => useContext(Ctx);

const DEF: CamPose = {x: 0, y: 0, s: 1, r: 0};

/** Sample a list of keyframes (seconds) with smooth easing between them. */
export const sampleKeys = (keys: CamKey[], t: number): CamPose => {
  let cur = {...DEF, ...keys[0]};
  if (t <= keys[0].t) return {x: cur.x, y: cur.y, s: cur.s, r: cur.r};
  for (let i = 1; i < keys.length; i++) {
    const a = {...DEF, ...keys[i - 1]};
    const b = {...DEF, ...keys[i]};
    // carry forward values when a key omits a field
    cur = a;
    if (t <= keys[i].t) {
      const u = easeInOut((t - keys[i - 1].t) / Math.max(1e-6, keys[i].t - keys[i - 1].t));
      return {
        x: a.x + (b.x - a.x) * u,
        y: a.y + (b.y - a.y) * u,
        s: a.s + (b.s - a.s) * u,
        r: a.r + (b.r - a.r) * u,
      };
    }
    cur = b;
  }
  return {x: cur.x, y: cur.y, s: cur.s, r: cur.r};
};

export type CameraProps = {
  /** simple move: from -> to between start and end seconds (end defaults to composition end) */
  from?: Partial<CamPose>;
  to?: Partial<CamPose>;
  start?: number;
  end?: number;
  /** or full keyframes (seconds), overrides from/to */
  keys?: CamKey[];
  /** settle beats: camera pushes in `amount` (e.g. 0.02) over `dur` seconds, easing back out */
  settles?: {at: number; dur?: number; amount?: number}[];
  /** idle handheld drift in px (default 0). Slow noise, never shake. */
  drift?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

/**
 * One transform (scale+rotate about the centre) for the whole scene. Translation is applied by <Layer>s
 * so that each layer can move at its own parallax factor. Content outside any Layer stays screen-fixed in x/y.
 */
export const Camera: React.FC<CameraProps> = ({from, to, start = 0, end, keys, settles, drift = 0, children, style}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const e = end ?? durationInFrames / fps;
  let pose: CamPose;
  if (keys && keys.length) pose = sampleKeys(keys, t);
  else {
    const a = {...DEF, ...from};
    const b = {...DEF, ...to};
    const u = easeInOut((t - start) / Math.max(1e-6, e - start));
    pose = {x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, s: a.s + (b.s - a.s) * u, r: a.r + (b.r - a.r) * u};
  }
  let s = pose.s;
  if (settles) {
    for (const st of settles) {
      const d = st.dur ?? 0.8;
      const u = (t - st.at) / d;
      if (u > 0 && u < 1) s *= 1 + (st.amount ?? 0.02) * Math.sin(Math.PI * smooth(u));
    }
  }
  const x = pose.x + (drift ? noise(1, t * 0.35) * drift : 0);
  const y = pose.y + (drift ? noise(2, t * 0.3) * drift * 0.6 : 0);
  return (
    <Ctx.Provider value={{x, y, s, r: pose.r, t}}>
      <AbsoluteFill style={{overflow: 'hidden', ...style}}>
        <AbsoluteFill style={{transform: `rotate(${pose.r}deg) scale(${s})`, transformOrigin: '50% 50%', willChange: 'transform'}}>
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
    </Ctx.Provider>
  );
};

export type LayerProps = {
  /** parallax factor: 0 = sky at infinity, 0.2 far, 0.5 mid, 1 near, 1.6 foreground */
  depth?: number;
  /** extra static offset */
  y?: number;
  x?: number;
  opacity?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

/** A parallax layer: translates by -camera.{x,y} * depth. Fills the frame (1920x1080 coordinate space). */
export const Layer: React.FC<LayerProps> = ({depth = 1, x = 0, y = 0, opacity = 1, children, style}) => {
  const c = useCamera();
  return (
    <AbsoluteFill
      style={{
        transform: `translate3d(${-c.x * depth + x}px, ${-c.y * depth + y}px, 0)`,
        opacity,
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const CAM_W = W;
export const CAM_H = H;
