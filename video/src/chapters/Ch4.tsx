import {AbsoluteFill} from 'remotion';
import {P, FONT} from '../kit/theme';

// STUB: to be replaced by the chapter scene. Timing: src/data/timing/ch4.json (loadTiming),
// layout (lead/tail seconds): src/data/layout.ts. Voice starts at LAYOUT[4].lead seconds.
export const Chapter = () => (
  <AbsoluteFill style={{background: P.ink1, color: P.bone, fontFamily: FONT.hud, alignItems: 'center', justifyContent: 'center', fontSize: 64}}>
    Chapter 4 (stub)
  </AbsoluteFill>
);
