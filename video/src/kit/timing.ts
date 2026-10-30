import {useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01} from './theme';

export type Sentence = {id: string; text: string; start: number; end: number};

export type Timing = {
  sentences: Sentence[];
  /** start second of a sentence id (throws on unknown id) */
  cue: (id: string, offset?: number) => number;
  /** end second of a sentence id */
  end: (id: string, offset?: number) => number;
  /** duration in seconds */
  dur: (id: string) => number;
  get: (id: string) => Sentence;
  has: (id: string) => boolean;
  /** first sentence whose [start,end) covers t, or null */
  at: (t: number) => Sentence | null;
};

/** Build a Timing from an array of {id,text,start,end} (e.g. an imported timing.json). */
export const loadTiming = (sentences: Sentence[]): Timing => {
  const map = new Map<string, Sentence>();
  for (const s of sentences) map.set(s.id, s);
  const get = (id: string) => {
    const s = map.get(id);
    if (!s) throw new Error(`timing: unknown sentence id "${id}"`);
    return s;
  };
  return {
    sentences,
    cue: (id, o = 0) => get(id).start + o,
    end: (id, o = 0) => get(id).end + o,
    dur: (id) => get(id).end - get(id).start,
    get,
    has: (id) => map.has(id),
    at: (t) => sentences.find((s) => t >= s.start && t < s.end) ?? null,
  };
};

/** frame -> seconds (default 30 fps) */
export const sec = (frame: number, fps = 30) => frame / fps;
/** seconds -> frame */
export const fr = (seconds: number, fps = 30) => Math.round(seconds * fps);

/** Current time in seconds inside the current Sequence/composition. */
export const useSec = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return frame / fps;
};

/**
 * useCue(timing, id): live state of one sentence.
 * t = seconds since the sentence started (negative before), p = 0..1 progress through it,
 * active = currently being spoken, started/done flags.
 * `lead` shifts the cue earlier (picture leads speech, default 0.15s).
 */
export const useCue = (timing: Timing, id: string, lead = 0.15) => {
  const now = useSec();
  const s = timing.get(id);
  const start = s.start - lead;
  return {
    t: now - start,
    p: clamp01((now - start) / Math.max(1e-6, s.end - start)),
    started: now >= start,
    active: now >= start && now < s.end,
    done: now >= s.end,
    start,
    end: s.end,
  };
};

/** Seconds helper: progress between two cue ids. */
export const useSpan = (timing: Timing, fromId: string, toId: string) => {
  const now = useSec();
  const a = timing.cue(fromId);
  const b = timing.end(toId);
  return clamp01((now - a) / Math.max(1e-6, b - a));
};

/** Stub timing: spreads text by character count (use until real narration exists). */
export const stubTiming = (items: {id: string; text: string}[], startSec = 0, charsPerSec = 15, gap = 0.35): Timing => {
  let t = startSec;
  const out: Sentence[] = items.map((it) => {
    const d = it.text.length / charsPerSec;
    const s = {id: it.id, text: it.text, start: t, end: t + d};
    t += d + gap;
    return s;
  });
  return loadTiming(out);
};
