// 2.5D paper-diorama engine: deterministic renderAt(t), perspective camera,
// paper sprites with dynamic contact shadows, DOF blur cache, motion blur
// by sub-frame accumulation, film grain. Everything is a pure function of t.
'use strict';
const W = 1920, H = 1080, FOCAL = 1150, FPS = 60;
const canvas = document.getElementById('c');
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext('2d');

// ---------------------------------------------------------------- math
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const inv = (a, b, v) => clamp((v - a) / (b - a));
const smooth = k => (k = clamp(k), k * k * (3 - 2 * k));
const smoother = k => (k = clamp(k), k * k * k * (k * (k * 6 - 15) + 10));
const eio = k => (k = clamp(k), k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const eout = k => 1 - Math.pow(1 - clamp(k), 3);
const eout4 = k => 1 - Math.pow(1 - clamp(k), 4);
const ein = k => Math.pow(clamp(k), 3);
const eback = (k, s = 1.70158) => { k = clamp(k) - 1; return 1 + k * k * ((s + 1) * k + s); };
const elastic = k => { k = clamp(k); if (k === 0 || k === 1) return k; return Math.pow(2, -10 * k) * Math.sin((k * 10 - .75) * (2 * Math.PI / 3)) + 1; };
const TAU = Math.PI * 2;
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
function fbm(x) { return vnoise(x) * .6 + vnoise(x * 2.1 + 7) * .3 + vnoise(x * 4.3 + 13) * .1; }
// value along keyframes [[t,v],...] with smooth interpolation (Catmull-Rom on values)
function track(keys, t, ease = smoother) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i], [t1, v1] = keys[i + 1];
    if (t <= t1) {
      const k = ease((t - t0) / (t1 - t0));
      if (Array.isArray(v0)) return v0.map((x, j) => lerp(x, v1[j], k));
      return lerp(v0, v1, k);
    }
  }
  return keys[keys.length - 1][1];
}
// Catmull-Rom spline through points (continuous velocity across keys)
function spline(keys, t) {
  const n = keys.length;
  if (t <= keys[0][0]) return keys[0][1].slice();
  if (t >= keys[n - 1][0]) return keys[n - 1][1].slice();
  let i = 0; while (t > keys[i + 1][0]) i++;
  const p0 = keys[Math.max(0, i - 1)], p1 = keys[i], p2 = keys[i + 1], p3 = keys[Math.min(n - 1, i + 2)];
  const u = smooth((t - p1[0]) / (p2[0] - p1[0])) * .35 + ((t - p1[0]) / (p2[0] - p1[0])) * .65;
  return p1[1].map((_, j) => {
    const a = p0[1][j], b = p1[1][j], c = p2[1][j], d = p3[1][j];
    return .5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
  });
}

// ---------------------------------------------------------------- timeline cues
const TL = window.TIMELINE;
const WORDS = [];
TL.paras.forEach(p => p.words.forEach(w => WORDS.push({ ...w, p: p.i, n: w.w.toLowerCase().replace(/[^a-z0-9']/g, '') })));
let CUE_AFTER = 0;
function cue(phrase, after = 0) {
  after = Math.max(after, CUE_AFTER);
  const parts = phrase.toLowerCase().split(/\s+/).map(s => s.replace(/[^a-z0-9']/g, ''));
  for (let i = 0; i < WORDS.length; i++) {
    if (WORDS[i].t < after) continue;
    let ok = true;
    for (let j = 0; j < parts.length; j++) if (!WORDS[i + j] || WORDS[i + j].n !== parts[j]) { ok = false; break; }
    if (ok) return WORDS[i].t;
  }
  throw new Error('cue not found: ' + phrase);
}
const P = i => TL.paras[i];

// ---------------------------------------------------------------- paper texture
function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
const PAPER = (() => {
  const s = 512, c = makeCanvas(s, s), g = c.getContext('2d'), d = g.createImageData(s, s), r = mulberry(7);
  for (let i = 0; i < s * s; i++) {
    const x = i % s, y = (i / s) | 0;
    const fib = Math.sin(x * .9 + Math.sin(y * .05) * 6) * .5 + Math.sin(y * .7 + x * .03) * .5;
    const v = 228 + (r() - .5) * 26 + fib * 5;
    d.data[i * 4] = v; d.data[i * 4 + 1] = v - 2; d.data[i * 4 + 2] = v - 6; d.data[i * 4 + 3] = 255;
  }
  g.putImageData(d, 0, 0); return c;
})();
const GRAIN = [0, 1, 2, 3, 4, 5].map(k => {
  const w = 640, h = 360, c = makeCanvas(w, h), g = c.getContext('2d'), d = g.createImageData(w, h), r = mulberry(100 + k);
  for (let i = 0; i < w * h; i++) { const v = 128 + (r() - .5) * 120; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
  g.putImageData(d, 0, 0); return c;
});

// ---------------------------------------------------------------- sprites
// draw(g, w, h) paints the shape in local space. Paper grain + top light are
// applied only where paint exists; a blurred silhouette is kept as the shadow.
const PAD = 40;
function sprite(w, h, draw, o = {}) {
  const c = makeCanvas(w + PAD * 2, h + PAD * 2), g = c.getContext('2d');
  g.translate(PAD, PAD); draw(g, w, h); g.setTransform(1, 0, 0, 1, 0, 0);
  if (o.paper !== false) {
    const shape = makeCanvas(c.width, c.height); shape.getContext('2d').drawImage(c, 0, 0);
    g.globalAlpha = o.grain ?? .5; g.globalCompositeOperation = 'multiply';
    const pat = g.createPattern(PAPER, 'repeat'); g.fillStyle = pat; g.fillRect(0, 0, c.width, c.height);
    g.globalAlpha = 1; g.globalCompositeOperation = 'destination-in'; g.drawImage(shape, 0, 0);
    g.globalCompositeOperation = 'source-atop';
    const lg = g.createLinearGradient(0, PAD, 0, PAD + h);
    lg.addColorStop(0, 'rgba(255,248,235,0.16)'); lg.addColorStop(1, 'rgba(40,20,10,0.10)');
    g.fillStyle = lg; g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = 'source-over';
  }
  const s = { c, w, h, blur: [], shadow: null, o };
  if (o.shadow !== false) {
    const sc = makeCanvas(c.width, c.height), sg = sc.getContext('2d');
    sg.filter = `blur(${o.shadowBlur ?? 10}px)`; sg.drawImage(c, 0, 0); sg.filter = 'none';
    sg.globalCompositeOperation = 'source-in'; sg.fillStyle = o.shadowColor || 'rgba(30,18,10,1)'; sg.fillRect(0, 0, sc.width, sc.height);
    s.shadow = sc;
  }
  return s;
}
let _snap = null;
function snapshot(c) { if (!_snap || _snap.width !== c.width || _snap.height !== c.height) _snap = makeCanvas(c.width, c.height); const g = _snap.getContext('2d'); g.clearRect(0, 0, c.width, c.height); g.drawImage(c, 0, 0); return _snap; }
const BLUR_PX = [0, 1.4, 2.8, 5, 8, 13, 20];
function blurred(s, lvl) {
  if (lvl <= 0) return s.c;
  if (!s.blur[lvl]) {
    const px = BLUR_PX[lvl], c = makeCanvas(s.c.width, s.c.height), g = c.getContext('2d');
    g.filter = `blur(${px}px)`; g.drawImage(s.c, 0, 0); s.blur[lvl] = c;
  }
  return s.blur[lvl];
}

// ---------------------------------------------------------------- camera + render list
const cam = { x: 0, y: 0, z: -FOCAL, roll: 0, yaw: 0, focus: FOCAL, aperture: 0 };
function setCam(o) { Object.assign(cam, { roll: 0, yaw: 0, aperture: 0 }, o); if (o.focus === undefined) cam.focus = -cam.z; }
function project(x, y, z) {
  let dx = x - cam.x, dz = z - cam.z;
  if (cam.yaw) { const c = Math.cos(cam.yaw), s = Math.sin(cam.yaw); const nx = dx * c - dz * s; dz = dx * s + dz * c; dx = nx; }
  if (dz < 1) return null;
  const s = FOCAL / dz;
  return { sx: dx * s, sy: -(y - cam.y) * s, s, dz };
}
let LIST = [];
function blurLevel(dz, extra = 0) {
  if (!cam.aperture && !extra) return 0;
  const px = cam.aperture * Math.abs(dz - cam.focus) / dz * 18 + extra;
  let l = 0; while (l < BLUR_PX.length - 1 && BLUR_PX[l + 1] * .8 <= px) l++;
  return l;
}
// plane: sprite placed in world. anchor in sprite space (0..1). scale is world units per sprite px.
function plane(s, x, y, z, o = {}) { LIST.push({ k: 'p', s, x, y, z, o }); }
// custom: fn(g, scale, item) drawn at projected point with uniform scale
function custom(x, y, z, fn, o = {}) { LIST.push({ k: 'c', x, y, z, fn, o }); }
// screen-space overlay above everything (e.g. typography locked to frame)
function overlay(fn, order = 0) { LIST.push({ k: 'o', fn, z: -1e9 + order }); }
function background(fn) { LIST.push({ k: 'b', fn, z: 1e12 }); }
// raw: screen-space drawing that still depth-sorts (ground planes, roads, beams)
function raw(z, fn, o = {}) { LIST.push({ k: 'r', z, fn, o }); }

function flush(g) {
  const items = LIST; LIST = [];
  items.sort((a, b) => b.z - a.z || (a.o?.order || 0) - (b.o?.order || 0));
  g.save(); g.translate(W / 2, H / 2); g.rotate(cam.roll); g.translate(-W / 2, -H / 2);
  const overlays = [];
  for (const it of items) {
    if (it.k === 'b') { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); it.fn(g); g.restore(); continue; }
    if (it.k === 'o') { overlays.push(it); continue; }
    if (it.k === 'r') { g.save(); it.fn(g); g.restore(); continue; }
    const p = project(it.x, it.y, it.z); if (!p) continue;
    const o = it.o, sc = (o.scale ?? 1) * p.s;
    const cx = W / 2 + p.sx, cy = H / 2 + p.sy;
    if (it.k === 'p') {
      const s = it.s, ax = (o.ax ?? .5) * s.w + PAD, ay = (o.ay ?? 1) * s.h + PAD;
      const ww = s.c.width * sc, hh = s.c.height * sc;
      if (cx + ww < -200 || cx - ww > W + 200 || cy + hh < -200 || cy - hh > H + 200) continue;
      const lvl = blurLevel(p.dz, o.blur || 0);
      g.save(); g.translate(cx, cy); if (o.rot) g.rotate(o.rot);
      if (o.sx || o.sy) g.scale(o.sx ?? 1, o.sy ?? 1);
      g.globalAlpha = o.alpha ?? 1;
      if (s.shadow && o.shadow !== false) {
        const d = (o.shadowDist ?? 14) * sc;
        g.globalAlpha = (o.alpha ?? 1) * (o.shadowAlpha ?? .32);
        g.drawImage(s.shadow, -ax * sc + d * .7, -ay * sc + d, ww, hh);
        g.globalAlpha = o.alpha ?? 1;
      }
      if (o.tint) { g.filter = o.tint; }
      g.drawImage(blurred(s, lvl), -ax * sc, -ay * sc, ww, hh);
      g.restore();
    } else {
      g.save(); g.translate(cx, cy); if (o.rot) g.rotate(o.rot);
      g.globalAlpha = o.alpha ?? 1;
      const lvl = blurLevel(p.dz, o.blur || 0);
      if (lvl > 1 && o.dof === true) g.filter = `blur(${BLUR_PX[lvl]}px)`;
      it.fn(g, sc, p); g.restore();
    }
  }
  g.restore();
  overlays.sort((a, b) => b.z - a.z);
  for (const it of overlays) { g.save(); it.fn(g); g.restore(); }
}

// ---------------------------------------------------------------- drawing helpers
function blob(g, pts, close = true) { // smooth closed path through points
  g.beginPath(); const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (i === 0) { const z = pts[n - 1]; g.moveTo((z[0] + a[0]) / 2, (z[1] + a[1]) / 2); }
    g.quadraticCurveTo(a[0], a[1], m[0], m[1]);
  }
  if (close) g.closePath();
}
function ridge(g, w, h, seed, rough = .35, base = .45, freq = 3) { // hill silhouette filling to bottom
  g.beginPath(); g.moveTo(0, h);
  for (let x = 0; x <= w; x += 8) {
    const u = x / w;
    const y = h * (base - rough * (fbm(u * freq + seed) * .7 + Math.sin(u * Math.PI) * .3));
    g.lineTo(x, y);
  }
  g.lineTo(w, h); g.closePath();
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function fillWith(g, color) { g.fillStyle = color; g.fill(); }
function cloudShape(g, w, h, seed) {
  const r = mulberry(seed); g.beginPath();
  const n = 5 + (r() * 3 | 0);
  for (let i = 0; i < n; i++) {
    const cx = w * (.15 + .7 * i / (n - 1)), rad = h * (.28 + r() * .25) * (1 - Math.abs(i / (n - 1) - .5) * .6);
    g.moveTo(cx + rad, h * .7); g.arc(cx, h * .72 - rad * .6, rad, 0, TAU);
  }
  g.rect(w * .12, h * .55, w * .76, h * .3);
}
function star(g, x, y, r, n = 5, inner = .45) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * inner : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); }

// Paper figure. Local origin at feet, height ~200 units. opts:
// walk (phase radians), grey (0..1 hair), scarf (bool), color, skin, age (0 baby..1 adult, >1 elder stoop)
function person(g, o = {}) {
  const ph = o.walk ?? 0, amp = o.walkAmp ?? (o.walk !== undefined ? 1 : 0);
  const age = o.age ?? 1, kid = clamp(age), stoop = clamp((age - 1) * 1.5) * .25;
  const H0 = lerp(95, 200, kid), headR = lerp(19, 17, kid) * (1 + (1 - kid) * .35);
  const bob = Math.abs(Math.sin(ph)) * 4 * amp * kid;
  const skin = o.skin || '#F0C9A4', body = o.color || '#3E5C76', legC = o.legs || '#2B2A33';
  g.save(); if (o.flip) g.scale(-1, 1);
  if (o.shadow !== false) { g.shadowColor = 'rgba(30,15,5,0.35)'; g.shadowBlur = 10; g.shadowOffsetX = 5; g.shadowOffsetY = 7; }
  const hip = H0 * .45, legL = hip;
  g.lineCap = 'round'; g.lineJoin = 'round';
  // legs
  g.strokeStyle = legC; g.lineWidth = lerp(9, 13, kid);
  if (o.sit) {
    for (const s of [1, -1]) { g.beginPath(); g.moveTo(0, -hip); g.lineTo(legL * .55 + s * 3, -hip + 2); g.lineTo(legL * .55 + s * 3 + 4, 0); g.stroke(); }
  } else for (const s of [1, -1]) {
    const a = Math.sin(ph) * .5 * s * amp, knee = Math.max(0, -Math.sin(ph) * s) * .5 * amp;
    const kx = Math.sin(a) * legL * .5, ky = -hip + Math.cos(a) * legL * .5;
    const fx = kx + Math.sin(a - knee) * legL * .5, fy = ky + Math.cos(a - knee) * legL * .5;
    g.beginPath(); g.moveTo(0, -hip - bob); g.lineTo(kx, ky - bob); g.lineTo(fx, Math.min(0, fy - bob)); g.stroke();
  }
  g.translate(0, -hip - bob); g.rotate(stoop);
  const tH = H0 * .32;
  // arms (back)
  const arm = (s, front) => {
    const a = (o.armUp && s === 1 ? -2.4 : -Math.sin(ph) * .55 * s * amp) + (o.armWave && s === 1 ? Math.sin((o.t || 0) * 8) * .4 - 2.2 : 0);
    g.strokeStyle = front ? skin : shade(body, -.25); g.lineWidth = lerp(7, 10, kid);
    g.beginPath(); g.moveTo(0, -tH * .9);
    const ex = Math.sin(a) * tH * .55, ey = -tH * .9 + Math.cos(a) * tH * .55;
    g.lineTo(ex, ey); g.lineTo(ex + Math.sin(a + .3) * tH * .5, ey + Math.cos(a + .3) * tH * .5); g.stroke();
  };
  arm(-1, false);
  // torso
  g.fillStyle = body; g.beginPath();
  g.moveTo(-tH * .32, 0); g.lineTo(tH * .32, 0); g.lineTo(tH * .26, -tH); g.quadraticCurveTo(0, -tH * 1.12, -tH * .26, -tH); g.closePath(); g.fill();
  g.shadowColor = 'transparent';
  arm(1, true);
  // scarf
  if (o.scarf) {
    g.fillStyle = '#D9433B'; rr(g, -tH * .3, -tH * 1.02, tH * .6, tH * .16, 6); g.fill();
    const fl = Math.sin((o.t || 0) * 5 + ph) * 6 + (o.wind ?? 1) * 10;
    g.beginPath(); g.moveTo(-tH * .2, -tH * .95); g.quadraticCurveTo(-tH * .45 - fl, -tH * .8, -tH * .55 - fl * 1.6, -tH * .62 + Math.sin(ph * 2) * 3);
    g.lineTo(-tH * .4 - fl, -tH * .62); g.quadraticCurveTo(-tH * .32, -tH * .8, -tH * .05, -tH * .9); g.fill();
  }
  // head
  if (o.shadow !== false) { g.shadowColor = 'rgba(30,15,5,0.3)'; g.shadowBlur = 8; g.shadowOffsetX = 4; g.shadowOffsetY = 5; }
  g.fillStyle = skin; g.beginPath(); g.arc(0, -tH - headR * 1.05, headR, 0, TAU); g.fill();
  g.shadowColor = 'transparent';
  // hair
  const hair = o.hair || '#3A2A22', grey = o.grey || 0;
  g.fillStyle = mix(hair, '#E8E6E1', grey);
  g.beginPath(); g.arc(0, -tH - headR * 1.12, headR * 1.02, Math.PI * 1.02, Math.PI * 2.05); g.closePath(); g.fill();
  if (o.longHair) { rr(g, -headR * 1.05, -tH - headR * 1.4, headR * .55, headR * 1.7, 6); g.fill(); }
  // face direction dot
  g.fillStyle = '#2B2A33'; g.beginPath(); g.arc(headR * .45, -tH - headR, 2.2, 0, TAU); g.fill();
  if (o.cane) { g.strokeStyle = '#6B4A2E'; g.lineWidth = 5; g.beginPath(); g.moveTo(tH * .5, -tH * .3); g.lineTo(tH * .62, hip + bob); g.stroke(); }
  g.restore();
}
function hex(c) { if (c[0] === 'r') return c.match(/[\d.]+/g).slice(0, 3).map(Number); c = c.replace('#', ''); return [0, 2, 4].map(i => parseInt(c.substr(i, 2), 16)); }
function rgb(a) { return `rgb(${a.map(v => Math.round(clamp(v, 0, 255))).join(',')})`; }
function mix(a, b, k) { const A = hex(a), B = hex(b); return rgb(A.map((v, i) => lerp(v, B[i], k))); }
function shade(c, k) { return k < 0 ? mix(c, '#000000', -k) : mix(c, '#FFFFFF', k); }

// Paper letters: draws text centered at origin, per-letter animation fn(i,n)->{dx,dy,rot,s,a}
function paperText(g, str, size, o = {}) {
  g.font = `${o.weight || 800} ${size}px ${o.family || 'Fraunces'}`;
  if (o.variation) g.fontVariationSettings = o.variation;
  g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  const ls = (o.spacing || 0) * size;
  const ws = [...str].map(ch => g.measureText(ch).width + ls);
  const total = ws.reduce((a, b) => a + b, 0) - ls;
  let x = -total * (o.align === 'left' ? 0 : o.align === 'right' ? 1 : .5);
  const n = str.length;
  [...str].forEach((ch, i) => {
    const a = o.anim ? o.anim(i, n) : {};
    const al = a.a ?? 1; if (al <= 0.001 || ch === ' ') { x += ws[i]; return; }
    g.save(); g.translate(x + ws[i] / 2 + (a.dx || 0), (a.dy || 0) + size * .35); g.rotate(a.rot || 0); g.scale(a.s ?? 1, a.s ?? 1);
    g.globalAlpha *= al;
    if (o.shadow !== false) { g.shadowColor = o.shadowColor || 'rgba(35,18,8,0.38)'; g.shadowBlur = size * .08; g.shadowOffsetX = size * .03; g.shadowOffsetY = size * .05; }
    g.fillStyle = a.color || o.color || '#F7EFE2'; g.fillText(ch, -ws[i] / 2 + ls / 2, 0);
    if (o.edge) { g.shadowColor = 'transparent'; g.strokeStyle = o.edge; g.lineWidth = size * .012; g.strokeText(ch, -ws[i] / 2 + ls / 2, 0); }
    g.restore(); x += ws[i];
  });
  return total;
}
// letters rise like sprouts / unfold
const riseAnim = (t, t0, dur = .7, stagger = .045) => (i, n) => {
  const k = (t - t0 - i * stagger) / dur; const e = eback(k, 2.2);
  return { dy: (1 - e) * 60, rot: (1 - eout(k)) * (i % 2 ? .25 : -.25), s: lerp(.4, 1, eout(k)), a: clamp(k * 3) };
};
const fallAnim = (t, t0, dur = 1.2, stagger = .05) => (i, n) => {
  const k = clamp((t - t0 - i * stagger) / dur); const e = ein(k);
  return { dy: e * 700, dx: Math.sin(k * 6 + i) * 60 * k, rot: k * (i % 2 ? 2 : -2), a: 1 - smooth(inv(.6, 1, k)) };
};

// ---------------------------------------------------------------- transitions (screen-space paper carriers)
// Each carrier fully covers the frame at k=0.5. Shapes are deterministic.
function carrier(g, type, k, o = {}) {
  const c1 = o.c1 || '#EFE3CF', c2 = o.c2 || '#D9C7A8', c3 = o.c3 || '#BFA37E';
  const r = mulberry(o.seed || 3);
  g.save();
  const layer = (color, offset, amp, seed, dir = 1, shadow = true) => {
    // a wavy paper sheet sweeping horizontally
    const x0 = lerp(W * 1.6, -W * 1.6, eio(clamp(k * 1.0 + offset))) * dir;
    g.save(); g.translate(dir > 0 ? x0 : W - x0 * -1, 0);
    if (shadow) { g.shadowColor = 'rgba(30,15,5,0.35)'; g.shadowBlur = 30; g.shadowOffsetX = -18 * dir; }
    g.fillStyle = color; g.beginPath();
    const edge = (y) => Math.sin(y * .006 + seed) * amp + Math.sin(y * .017 + seed * 2) * amp * .35;
    g.moveTo(edge(0), -50);
    for (let y = -50; y <= H + 50; y += 20) g.lineTo(edge(y), y);
    g.lineTo(W * 3, H + 50); g.lineTo(W * 3, -50); g.closePath(); g.fill();
    g.restore();
  };
  if (type === 'sheets') {
    layer(c3, .12, 90, 1); layer(c2, .06, 120, 2); layer(c1, 0, 70, 3);
  } else if (type === 'clouds') {
    const sweep = lerp(1.3, -1.3, eio(k));
    for (let i = 0; i < 26; i++) {
      const y = (i / 25) * (H + 300) - 150, sp = .8 + r() * .5;
      const x = W / 2 + sweep * W * sp + (r() - .5) * 500;
      const rad = 180 + r() * 220;
      g.fillStyle = [c1, c2, '#FFFFFF'][i % 3]; g.shadowColor = 'rgba(40,30,60,0.25)'; g.shadowBlur = 25; g.shadowOffsetY = 12;
      g.beginPath(); g.arc(x, y, rad, 0, TAU); g.arc(x + rad * .9, y + 40, rad * .8, 0, TAU); g.arc(x - rad * .9, y + 30, rad * .75, 0, TAU); g.fill();
    }
    const cover = 1 - Math.abs(k - .5) * 2; if (cover > .6) { g.fillStyle = c1; g.globalAlpha = smooth(inv(.6, .95, cover)); g.fillRect(0, 0, W, H); }
  } else if (type === 'wave') {
    // water rises from bottom and covers, then drains up
    const rise = k < .5 ? eio(k * 2) : 1, drain = k > .5 ? eio((k - .5) * 2) : 0;
    const cols = [c3, c2, c1];
    cols.forEach((col, j) => {
      const top = lerp(H + 120, -160, clamp(rise * 1.08 - j * .04)) - drain * (H + 400) * (1 + j * .1);
      g.fillStyle = col; g.shadowColor = 'rgba(0,20,40,0.35)'; g.shadowBlur = 25; g.shadowOffsetY = -10;
      g.beginPath(); g.moveTo(-20, top);
      for (let x = -20; x <= W + 20; x += 20) g.lineTo(x, top + Math.sin(x * .008 + k * 12 + j) * 40 + Math.sin(x * .021 + j * 3) * 14);
      g.lineTo(W + 20, top + H * 2); g.lineTo(-20, top + H * 2); g.closePath(); g.fill();
    });
  } else if (type === 'page') {
    // a giant page turns across the frame (right to left)
    const a = eio(k) * Math.PI;
    const x = W / 2 + Math.cos(a) * W * .9;
    g.shadowColor = 'rgba(30,15,5,0.4)'; g.shadowBlur = 40;
    g.fillStyle = c1; g.beginPath(); g.moveTo(W / 2 - W * .9, -40); g.lineTo(x, -40 - Math.sin(a) * 60); g.lineTo(x, H + 40 + Math.sin(a) * 60); g.lineTo(W / 2 - W * .9, H + 40);
    if (k > .5) { g.rect(-40, -40, x + 40, H + 80); }
    g.fill();
    if (Math.abs(k - .5) < .32) { g.globalAlpha = 1 - Math.abs(k - .5) / .32; g.fillStyle = c1; g.fillRect(0, 0, W, H); }
  } else if (type === 'leaves') {
    const sweep = eio(k);
    for (let i = 0; i < 90; i++) {
      const sp = .7 + r() * .7, x = lerp(W + 400, -600, clamp(sweep * sp * 1.2 - r() * .2)) + (r() - .5) * 400;
      const y = r() * H + Math.sin(k * 8 + i) * 80, s = 90 + r() * 170, rot = k * 6 * (r() - .5) + r() * 6;
      g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = [c1, c2, c3][i % 3];
      g.shadowColor = 'rgba(30,15,5,0.3)'; g.shadowBlur = 14; g.shadowOffsetY = 8;
      g.beginPath(); g.ellipse(0, 0, s, s * .45, 0, 0, TAU); g.fill(); g.restore();
    }
    const cover = 1 - Math.abs(k - .5) * 2; if (cover > .7) { g.globalAlpha = smooth(inv(.7, .97, cover)); g.fillStyle = c2; g.fillRect(0, 0, W, H); }
  } else if (type === 'iris') {
    // paper iris closes then opens on a point
    const rad = k < .5 ? lerp(W * 1.2, 0, eio(k * 2)) : lerp(0, W * 1.2, eio((k - .5) * 2));
    g.fillStyle = c1; g.beginPath(); g.rect(-10, -10, W + 20, H + 20); g.arc(o.cx ?? W / 2, o.cy ?? H / 2, Math.max(0.1, rad), 0, TAU, true);
    g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 40; g.fill('evenodd');
  }
  g.restore();
}

// ---------------------------------------------------------------- main render
const SCENES = [];
let CURRENT_T = 0;
function sceneAt(t) { for (let i = SCENES.length - 1; i >= 0; i--) if (t >= SCENES[i].t0) return i; return 0; }
// motion estimate: screen speed of a probe point at focus depth
function camState(si, t) { const s = SCENES[si]; s.camera(t - s.t0, t); return { ...cam }; }
function renderScene(g, t) {
  const si = sceneAt(t), s = SCENES[si];
  if (!s.built) { s.build(); s.built = true; }
  // free memory of scenes far behind
  for (let i = 0; i < si - 1; i++) if (SCENES[i].built && SCENES[i].free) { SCENES[i].free(); SCENES[i].built = false; }
  LIST = [];
  s.camera(t - s.t0, t);
  s.draw(t - s.t0, t);
  flush(g);
  // carrier transition into next scene (centered on next.t0)
  const nx = SCENES[si + 1];
  if (nx && nx.carrier && t > nx.t0 - nx.carrier.dur / 2) carrier(g, nx.carrier.type, inv(nx.t0 - nx.carrier.dur / 2, nx.t0 + nx.carrier.dur / 2, t), nx.carrier);
  if (s.carrier && t < s.t0 + s.carrier.dur / 2) carrier(g, s.carrier.type, inv(s.t0 - s.carrier.dur / 2, s.t0 + s.carrier.dur / 2, t), s.carrier);
}
function motionSamples(t) {
  const si = sceneAt(t), s = SCENES[si];
  const nx = SCENES[si + 1];
  const inCarrier = (nx && nx.carrier && Math.abs(t - nx.t0) < nx.carrier.dur / 2) || (s.carrier && Math.abs(t - s.t0) < s.carrier.dur / 2);
  if (!s.built) { s.build(); s.built = true; }
  const a = camState(si, t), b = camState(si, Math.min(t + 1 / FPS, (nx ? nx.t0 : 1e9) - 1e-4));
  // screen motion of a point at focus distance, plus z (zoom) motion at frame edge
  const f = a.focus || FOCAL;
  const lat = Math.hypot(b.x - a.x, b.y - a.y) * FOCAL / f;
  const zoom = Math.abs(b.z - a.z) / f * 900;
  const rot = Math.abs(b.roll - a.roll) * 900 + Math.abs(b.yaw - a.yaw) * FOCAL;
  const px = lat + zoom + rot + (s.extraMotion ? s.extraMotion(t - s.t0, t) : 0);
  let n = px < 6 ? 1 : Math.min(5, Math.ceil(px / 7));
  if (inCarrier) n = Math.max(n, 4);
  return n;
}
const ACC = makeCanvas(W, H), accG = ACC.getContext('2d');
const TMP = makeCanvas(W, H), tmpG = TMP.getContext('2d');
function renderAt(t) {
  CURRENT_T = t;
  const n = motionSamples(t);
  if (n <= 1) { ctx.setTransform(1, 0, 0, 1, 0, 0); renderScene(ctx, t); }
  else {
    const shutter = 0.5 / FPS; // 180 degrees
    accG.clearRect(0, 0, W, H);
    for (let i = 0; i < n; i++) {
      const ts = t + (i / (n - 1) - .5) * shutter;
      tmpG.setTransform(1, 0, 0, 1, 0, 0); tmpG.clearRect(0, 0, W, H);
      renderScene(tmpG, ts);
      accG.globalAlpha = 1 / (i + 1); accG.drawImage(TMP, 0, 0);
    }
    accG.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(ACC, 0, 0);
  }
  post(ctx, t);
}
function post(g, t) {
  // vignette + grain + global fade in/out
  g.save();
  const vg = g.createRadialGradient(W / 2, H * .48, H * .35, W / 2, H / 2, H * 1.05);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(25,12,5,0.42)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  const fr = Math.round(t * FPS);
  g.globalCompositeOperation = 'overlay'; g.globalAlpha = .07;
  g.drawImage(GRAIN[fr % 6], ((fr * 37) % 200) - 200, ((fr * 53) % 120) - 120, W + 400, H + 240);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  const fin = 1 - smooth(inv(0, 1.2, t)), fout = smooth(inv(TL.duration - 1.5, TL.duration - .05, t));
  if (fin + fout > 0) { g.fillStyle = `rgba(12,8,6,${Math.max(fin, fout)})`; g.fillRect(0, 0, W, H); }
  g.restore();
}
