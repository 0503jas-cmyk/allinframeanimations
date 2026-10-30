export const C = {
  navy: '#0b1226', navy2: '#121c3a', teal: '#123a4a', teal2: '#1d5a63', gold: '#f2b84b', white: '#f5f5f0',
  red: '#e0483e', zombie: '#7fa86a', zombie2: '#5f8a52', skin: '#e8b48a', skin2: '#d49a6e', jacket: '#d6402f', scarf: '#2fb5a8',
  yellow: '#f4c430', yellow2: '#c99a12', grey: '#4a5568', dark: '#05070f', amber: '#ffb347', paper: '#efe3c4',
};
export const W = 1920, H = 1080, FPS = 30;
export const FONT_BOLD = '"Inter Display", Inter, "DejaVu Sans", sans-serif';
export const FONT_MONO = '"DejaVu Sans Mono", monospace';
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ease = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const rnd = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
