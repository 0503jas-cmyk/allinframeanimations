import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from './theme';
import {JunoBust, Bolt, CraneBust, Zombie, BikeRig, Cooler, ParadeBus, Betty} from './art';
export const CharTest: React.FC = () => {
  const f = useCurrentFrame(), t = f / 30;
  return (
    <AbsoluteFill style={{background: `linear-gradient(${C.navy},${C.teal})`}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <JunoBust x={220} y={300} s={1} t={t} mouth={Math.abs(Math.sin(t * 8))} mood="happy" />
        <Bolt x={600} y={380} s={1} t={t} mood="scared" mouth={0.5} />
        <CraneBust x={1000} y={300} s={1} t={t} mouth={Math.abs(Math.sin(t * 7))} />
        <Zombie x={1350} y={180} s={1.2} t={t} walk={t} />
        <Zombie x={1600} y={200} s={1.2} t={t} walk={t + 1} run arms={1} />
        <BikeRig x={400} y={640} s={0.9} t={t} />
        <Cooler x={900} y={780} s={1.4} glow={1} />
        <ParadeBus x={1450} y={720} s={0.55} t={t} />
      </svg>
    </AbsoluteFill>
  );
};
