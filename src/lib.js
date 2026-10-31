// lib.js — math, noise, camera splines, drawing helpers, post-fx. Deterministic: everything is a pure function of time.
const W = 1920, H = 1080;
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const eio = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eout = t => 1 - Math.pow(1 - clamp(t), 3);
const ein = t => clamp(t) ** 3;
const pulse = (t, a, b, fi, fo) => sstep(a, a + fi, t) * (1 - sstep(b - fo, b, t));   // 0..1..0 window
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function hash2(x, y) { return hash(x * 157.31 + y * 311.97); }
function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u); }
function noise2(x, y) { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); return lerp(lerp(hash2(i, j), hash2(i + 1, j), u), lerp(hash2(i, j + 1), hash2(i + 1, j + 1), u), v); }
function fbm(x, y = 0, o = 4) { let s = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { s += a * noise2(x * f, y * f + i * 17.3); f *= 2; a *= .5; } return s; }
const snoise = (x) => noise1(x) * 2 - 1;

// Catmull-Rom spline through [[t,v],...] -> continuous velocity (no stop at keys)
function spline(t, pts) {
  const n = pts.length; if (t <= pts[0][0]) return pts[0][1]; if (t >= pts[n - 1][0]) return pts[n - 1][1];
  let i = 0; while (i < n - 2 && t > pts[i + 1][0]) i++;
  const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
  const h = p2[0] - p1[0], u = (t - p1[0]) / h;
  const m1 = (p2[1] - p0[1]) / (p2[0] - p0[0]) * h, m2 = (p3[1] - p1[1]) / (p3[0] - p1[0]) * h;
  const u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * p1[1] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * p2[1] + (u3 - u2) * m2;
}
function kf(t, pts, ease = null) { // simple eased keyframes
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) if (t < pts[i + 1][0]) { let u = (t - pts[i][0]) / (pts[i + 1][0] - pts[i][0]); u = ease ? ease(u) : sstep(0, 1, u); return lerp(pts[i][1], pts[i + 1][1], u); }
  return pts[pts.length - 1][1];
}
const rgba = (r, g, b, a = 1) => `rgba(${r | 0},${g | 0},${b | 0},${a})`;
const mixc = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const rgbs = (c, a = 1) => rgba(c[0], c[1], c[2], a);

// ---------- canvas helpers
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function glow(c, x, y, r, col, a = 1, hard = .0) {
  const g = c.createRadialGradient(x, y, r * hard, x, y, r);
  g.addColorStop(0, rgbs(col, a)); g.addColorStop(.35, rgbs(col, a * .38)); g.addColorStop(1, rgbs(col, 0));
  c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
}
function smoothPath(c, pts, close = false) {
  c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; c.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); }
  const l = pts[pts.length - 1]; c.lineTo(l[0], l[1]); if (close) c.closePath();
}
function poly(c, pts, fill, stroke, lw = 1) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); } }
function vgrad(c, y0, y1, stops) { const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach(s => g.addColorStop(s[0], s[1])); return g; }
function hgrad(c, x0, x1, stops) { const g = c.createLinearGradient(x0, 0, x1, 0); stops.forEach(s => g.addColorStop(s[0], s[1])); return g; }
// parallax layer: k = how strongly camera moves this layer (0 far .. 1.4 near)
function layer(c, cam, k, fn, rollK = 1) {
  c.save(); c.translate(W / 2, H / 2); c.rotate((cam.roll || 0) * rollK * Math.PI / 180);
  const s = 1 + (cam.zoom - 1) * k; c.scale(s, s);
  c.translate(-W / 2 - cam.x * k, -H / 2 - cam.y * k); fn(); c.restore();
}
// cheap blur: draw source canvas down/up scaled
const _blurC = {};
function blurInto(dst, src, amount, alpha = 1, comp = 'source-over') {
  const f = Math.max(2, amount | 0); const w = Math.ceil(src.width / f), h = Math.ceil(src.height / f);
  const key = f + 'x' + w; let t = _blurC[key]; if (!t) { t = _blurC[key] = mkCanvas(w, h); }
  const tc = t.getContext('2d'); tc.globalCompositeOperation = 'copy'; tc.imageSmoothingEnabled = true; tc.imageSmoothingQuality = 'high'; tc.drawImage(src, 0, 0, w, h);
  dst.save(); dst.globalCompositeOperation = comp; dst.globalAlpha = alpha; dst.imageSmoothingEnabled = true; dst.imageSmoothingQuality = 'high'; dst.drawImage(t, 0, 0, w, h, 0, 0, src.width, src.height); dst.restore();
}
// render fn into offscreen layer then composite blurred (DOF)
const _lay = {};
function dofLayer(c, name, blur, fn, alpha = 1, comp = 'source-over') {
  let L = _lay[name]; if (!L) { L = _lay[name] = mkCanvas(W, H); }
  const lc = L.getContext('2d'); lc.setTransform(1, 0, 0, 1, 0, 0); lc.clearRect(0, 0, W, H); fn(lc);
  if (blur <= 1) { c.save(); c.globalCompositeOperation = comp; c.globalAlpha = alpha; c.drawImage(L, 0, 0); c.restore(); } else blurInto(c, L, blur, alpha, comp);
}
// ---------- film grain tiles
const _grain = [];
function grainTile(i) {
  if (!_grain[i]) { const c = mkCanvas(256, 256), g = c.getContext('2d'), d = g.createImageData(256, 256), r = mulberry32(900 + i); for (let p = 0; p < d.data.length; p += 4) { const v = 128 + (r() - .5) * 120; d.data[p] = d.data[p + 1] = d.data[p + 2] = v; d.data[p + 3] = 255; } g.putImageData(d, 0, 0); _grain[i] = c; }
  return _grain[i];
}
let _bloomC = null;
function postFx(c, src, t, o = {}) {
  // bloom: small downsample of the frame, added back with screen
  if (!_bloomC) _bloomC = mkCanvas(W / 8, H / 8);
  const b = _bloomC.getContext('2d'); b.globalCompositeOperation = 'copy'; b.imageSmoothingEnabled = true; b.drawImage(src, 0, 0, W / 8, H / 8);
  c.drawImage(src, 0, 0);
  c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = o.bloom ?? .5; c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  c.drawImage(_bloomC, 0, 0, W, H); c.restore();
  // vignette
  const v = c.createRadialGradient(W / 2, H / 2, H * .38, W / 2, H / 2, H * .98); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,4,8,${o.vig ?? .62})`);
  c.fillStyle = v; c.fillRect(0, 0, W, H);
  // grain
  c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = o.grain ?? .09;
  const gi = Math.floor(t * 24) % 6, gt = grainTile(gi), ox = -(hash(gi * 3.1) * 256) | 0, oy = -(hash(gi * 7.7) * 256) | 0;
  for (let x = ox; x < W; x += 256) for (let y = oy; y < H; y += 256) c.drawImage(gt, x, y);
  c.restore();
}
