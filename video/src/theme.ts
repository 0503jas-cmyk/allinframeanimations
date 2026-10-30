export const FPS = 30;
export const W = 1920;
export const H = 1080;

export const C = {
  bg: '#080c18',
  bg2: '#101830',
  grid: 'rgba(120,160,255,0.07)',
  text: '#e8eefc',
  dim: '#7f8db0',
  cyan: '#5eead4',
  amber: '#fbbf24',
  pink: '#f472b6',
  violet: '#a78bfa',
};

export const SANS = "Inter, 'DejaVu Sans', 'Liberation Sans', sans-serif";
export const MONO = "'DejaVu Sans Mono', 'Liberation Mono', monospace";

// Narration timing helper: spreads the spoken text over the audio duration by
// character count, so a phrase's start time can be looked up from the script.
export const makeTimeline = (text: string, startSec: number, durSec: number) => {
  const total = text.length;
  return {
    at: (phrase: string) => {
      const i = text.indexOf(phrase);
      if (i < 0) throw new Error(`phrase not in script: ${phrase}`);
      return startSec + (i / total) * durSec;
    },
    end: (phrase: string) => {
      const i = text.indexOf(phrase);
      if (i < 0) throw new Error(`phrase not in script: ${phrase}`);
      return startSec + ((i + phrase.length) / total) * durSec;
    },
  };
};
