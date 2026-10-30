import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {P, hash, rgba, W, H} from './theme';

export type FinishProps = {
  grain?: number; // opacity, default 0.07
  vignette?: number; // darkness 0..1, default 0.62
  /** warm/cool wash over the whole frame, e.g. rgba for dawn */
  wash?: string;
  children?: React.ReactNode;
};

/** Grain (baked tile, 10 fps shift, plain alpha) + static vignette (breathing scale). Put last in the scene. */
export const Finish: React.FC<FinishProps> = ({grain = 0.07, vignette = 0.62, wash}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const step = Math.floor(frame / 3);
  const gx = Math.floor(hash(step * 1.37) * 512);
  const gy = Math.floor(hash(step * 2.91 + 5) * 512);
  const breathe = 1 + 0.015 * (0.5 - 0.5 * Math.cos((2 * Math.PI * frame) / (fps * 6)));
  return (
    <>
      {wash ? <AbsoluteFill style={{background: wash, pointerEvents: 'none'}} /> : null}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          transform: `scale(${breathe})`,
          background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(5,9,20,0) 45%, ${rgba(P.ink0, vignette * 0.55)} 78%, ${rgba(P.ink0, vignette)} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          opacity: grain,
          backgroundImage: `url(${staticFile('kit/grain.png')})`,
          backgroundSize: '512px 512px',
          backgroundPosition: `${gx}px ${gy}px`,
        }}
      />
    </>
  );
};

export const FRAME = {W, H};
