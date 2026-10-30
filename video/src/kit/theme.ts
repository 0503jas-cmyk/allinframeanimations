// Palette, fonts and shared constants for "The Tide Clerk of Harrow Deep".
export const FPS = 30;
export const W = 1920;
export const H = 1080;

export const P = {
  ink0: '#050914',
  ink1: '#0a1226',
  ink2: '#12203f',
  ink3: '#1d3159',
  ink4: '#2a4474',
  bone: '#efe6d2',
  boneShade: '#d9ccb0',
  boneDim: '#9a917c',
  penInk: '#141a2e',
  amber: '#ffb347',
  amberDeep: '#c9741f',
  amberHot: '#ffd98a',
  teal: '#5fd4c4',
  tealDeep: '#1f6f6a',
  blood: '#c4543f',
  pencil: '#8d93a1',
} as const;

// Only these four families are ever used.
export const FONT = {
  hand: "'Liberation Serif', 'Times New Roman', serif", // Maren's italic hand
  title: "'DejaVu Serif', Georgia, serif",
  accent: "'FreeSerif', 'Liberation Serif', serif",
  hud: "Inter, 'Helvetica Neue', Arial, sans-serif",
} as const;

export const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export const mix = (h1: string, h2: string, t: number) => {
  const a = parseInt(h1.slice(1), 16);
  const b = parseInt(h2.slice(1), 16);
  const c = (s: number) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t);
  return `rgb(${c(16)},${c(8)},${c(0)})`;
};

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
export const easeInOut = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
/** progress 0..1 of t between a and b */
export const prog = (t: number, a: number, b: number) => clamp01((t - a) / Math.max(1e-6, b - a));

// deterministic hash noise (never Math.random)
export const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
/** smooth 1D value noise in -1..1 */
export const noise = (seed: number, x: number) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return (hash(i + seed * 17.3) * (1 - u) + hash(i + 1 + seed * 17.3) * u) * 2 - 1;
};
