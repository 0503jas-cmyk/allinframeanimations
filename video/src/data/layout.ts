import durations from './durations.json';

export const FPS = 30;
/** seconds of picture before the narration starts / after it ends, per chapter */
export const LAYOUT: Record<number, {lead: number; tail: number}> = {
  1: {lead: 6, tail: 4},
  2: {lead: 2, tail: 4},
  3: {lead: 2, tail: 4},
  4: {lead: 2, tail: 4},
  5: {lead: 2, tail: 4},
  6: {lead: 2, tail: 4},
  7: {lead: 2, tail: 4},
  8: {lead: 2, tail: 4},
  9: {lead: 2, tail: 16},
};
export const voiceSeconds = (n: number): number => (durations as Record<string, number>)[String(n)];
export const chapterSeconds = (n: number) => LAYOUT[n].lead + voiceSeconds(n) + LAYOUT[n].tail;
export const chapterFrames = (n: number) => Math.round(chapterSeconds(n) * FPS);
