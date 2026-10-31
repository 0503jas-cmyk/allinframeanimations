// Shared scene framework, sprite builders and recurring UI (age odometer, tags).
'use strict';
const DEFS = [];
function defScene(i, d) { DEFS[i] = d; }
function finalizeScenes() {
  const np = TL.paras.length;
  DEFS.forEach((d, i) => {
    const t0 = i === 0 ? 0 : (P(i - 1).end + P(i).start) / 2;
    const s = Object.assign({ t0, i, built: false, free: null, carrier: null }, d);
    const ob = s.build, pi = Math.min(i, np - 1);
    s.build = function () { CUE_AFTER = P(pi).start - 1; try { ob.call(this); } finally { CUE_AFTER = 0; } };
    if (s.carrierType) s.carrier = Object.assign({ type: s.carrierType, dur: 1.3 }, s.carrierOpts || {});
    SCENES.push(s);
  });
  SCENES.forEach((s, i) => { s.t1 = SCENES[i + 1] ? SCENES[i + 1].t0 : TL.duration; s.dur = s.t1 - s.t0; });
  buildAgeKeys();
}
const HERO = { scarf: true, color: '#3E5C76', hair: '#3A2A22' };
const PAL = {
  cream: '#F3E9D7', paper: '#EFE3CF', ink: '#2B2A33', red: '#D9433B', teal: '#2F6F73', mustard: '#E3A93B',
  sage: '#8FAE8B', forest: '#4E7A5A', deep: '#14304A', dusk: '#5B4B7A', peach: '#F2B48C', rose: '#E58F84', sky: '#9CC9DE'
};

// ------------------------------------------------------------ backgrounds
function sky(stops) {
  background(g => {
    const lg = g.createLinearGradient(0, 0, 0, H);
    stops.forEach(([k, c]) => lg.addColorStop(k, c)); g.fillStyle = lg; g.fillRect(0, 0, W, H);
  });
}
function skyAt(t, a, b, k) { // blend two stop lists
  return a.map(([p, c], i) => [p, mix(c, b[i][1], k)]);
}

// ------------------------------------------------------------ sprite builders (memoized per key)
const SP = {};
function memo(key, fn) { return SP[key] || (SP[key] = fn()); }
function freeSprites(prefix) { for (const k in SP) if (k.startsWith(prefix)) delete SP[k]; }
const hills = (key, w, h, color, seed, rough = .35, base = .45, freq = 3, opts = {}) => memo(key, () => sprite(w, h, (g) => {
  ridge(g, w, h, seed, rough, base, freq); fillWith(g, color);
  if (opts.rim) { g.save(); g.clip(); g.translate(0, opts.rim); ridge(g, w, h, seed, rough, base, freq); g.fillStyle = shade(color, -.08); g.fill(); g.restore(); }
  if (opts.dots) { const r = mulberry(seed * 9); g.save(); ridge(g, w, h, seed, rough, base, freq); g.clip(); for (let i = 0; i < opts.dots; i++) { g.fillStyle = shade(color, (r() - .5) * .2); g.beginPath(); g.arc(r() * w, h * (base * .6 + r() * (1 - base * .5)), 6 + r() * 26, 0, TAU); g.fill(); } g.restore(); }
}, { shadowBlur: 16 }));
const cloud = (key, w, h, color, seed) => memo(key, () => sprite(w, h, g => { cloudShape(g, w, h, seed); fillWith(g, color); }, { shadowBlur: 18, grain: .3 }));
const treeRound = (key, color, trunk = '#6B4A2E', s = 1) => memo(key, () => sprite(160 * s, 300 * s, (g, w, h) => {
  g.fillStyle = trunk; rr(g, w * .44, h * .5, w * .12, h * .5, 4); g.fill();
  g.fillStyle = color; g.beginPath(); g.arc(w * .5, h * .34, w * .42, 0, TAU); g.arc(w * .3, h * .46, w * .26, 0, TAU); g.arc(w * .7, h * .44, w * .27, 0, TAU); g.fill();
  g.fillStyle = shade(color, -.12); g.beginPath(); g.arc(w * .62, h * .42, w * .22, 0, TAU); g.fill();
}));
const pine = (key, color, s = 1) => memo(key, () => sprite(140 * s, 320 * s, (g, w, h) => {
  g.fillStyle = '#5A3F2A'; g.fillRect(w * .45, h * .8, w * .1, h * .2);
  for (let i = 0; i < 4; i++) { const y = h * (.05 + i * .2), ww = w * (.3 + i * .18); g.fillStyle = i % 2 ? shade(color, -.08) : color; g.beginPath(); g.moveTo(w / 2, y); g.lineTo(w / 2 + ww, y + h * .3); g.lineTo(w / 2 - ww, y + h * .3); g.closePath(); g.fill(); }
}));
const house = (key, w, h, wall, roof, lit = 0, door = '#7A4B35') => memo(key, () => sprite(w, h, (g) => {
  g.fillStyle = wall; g.fillRect(w * .1, h * .42, w * .8, h * .58);
  g.fillStyle = roof; g.beginPath(); g.moveTo(0, h * .46); g.lineTo(w / 2, 0); g.lineTo(w, h * .46); g.closePath(); g.fill();
  g.fillStyle = door; rr(g, w * .44, h * .68, w * .14, h * .32, [8, 8, 0, 0]); g.fill();
  for (const x of [.2, .66]) { g.fillStyle = lit ? '#FFD98A' : '#9FC3D6'; g.fillRect(w * x, h * .56, w * .14, h * .14); g.fillStyle = wall; g.fillRect(w * (x + .065), h * .56, w * .012, h * .14); }
}));
const sunSprite = (key, r, color = '#F6B24C') => memo(key, () => sprite(r * 2.8, r * 2.8, (g, w, h) => {
  for (let i = 0; i < 3; i++) { g.fillStyle = mix(color, '#FFF3D0', i * .3); g.globalAlpha = i === 0 ? .35 : 1; g.beginPath(); g.arc(w / 2, h / 2, r * (1.35 - i * .25), 0, TAU); g.fill(); }
  g.globalAlpha = 1;
}, { shadowBlur: 30, shadowColor: 'rgba(200,90,30,1)' }));
const grass = (key, w, h, color, seed) => memo(key, () => sprite(w, h, (g) => {
  const r = mulberry(seed); g.fillStyle = color; g.beginPath(); g.moveTo(0, h);
  for (let x = 0; x <= w; x += 14) { const tip = h * (.15 + r() * .5); g.lineTo(x, h * .7); g.lineTo(x + 5, tip); g.lineTo(x + 10, h * .7); }
  g.lineTo(w, h); g.closePath(); g.fill();
  for (let i = 0; i < w / 90; i++) { const x = r() * w, y = h * (.3 + r() * .3); g.fillStyle = ['#F2D06B', '#F4F0E8', '#E58F84'][i % 3]; g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill(); g.strokeStyle = shade(color, -.2); g.lineWidth = 3; g.beginPath(); g.moveTo(x, y + 6); g.lineTo(x, h * .8); g.stroke(); }
}, { shadowBlur: 10 }));
const strip = (key, w, h, color, seed, wav = 18) => memo(key, () => sprite(w, h, g => {
  g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 10) g.lineTo(x, wav + Math.sin(x * .004 + seed) * wav + Math.sin(x * .013 + seed * 3) * wav * .3); g.lineTo(w, h); g.closePath(); fillWith(g, color);
}, { shadowBlur: 14 }));
const roadSprite = (key, w, h, color = '#D8C3A0') => memo(key, () => sprite(w, h, g => {
  g.fillStyle = color; g.fillRect(0, 0, w, h);
  g.fillStyle = shade(color, -.1); for (let x = 0; x < w; x += 140) g.fillRect(x, h * .45, 70, 6);
}, { shadowBlur: 8 }));
const milestone = (key, label) => memo(key, () => sprite(120, 200, (g, w, h) => {
  g.fillStyle = '#E9DCC4'; rr(g, w * .12, h * .2, w * .76, h * .8, [30, 30, 4, 4]); g.fill();
  g.fillStyle = '#C9B48F'; g.fillRect(w * .12, h * .85, w * .76, h * .15);
  g.fillStyle = PAL.ink; g.font = '800 36px Fraunces'; g.textAlign = 'center'; g.fillText(label, w / 2, h * .55);
  g.font = '600 15px Fraunces'; g.fillText('YEARS', w / 2, h * .7);
}));
const building = (key, w, h, color, seed, lit = .3, roof = 0) => memo(key, () => sprite(w, h, (g) => {
  const r = mulberry(seed); g.fillStyle = color; g.fillRect(0, roof ? h * .08 : 0, w, h);
  if (roof === 1) { g.beginPath(); g.moveTo(-6, h * .1); g.lineTo(w / 2, 0); g.lineTo(w + 6, h * .1); g.fill(); }
  const cw = 26, ch = 34;
  for (let y = h * .12; y < h - ch; y += ch + 18) for (let x = 14; x < w - cw; x += cw + 16) { g.fillStyle = r() < lit ? '#FFD98A' : shade(color, -.18); g.fillRect(x, y, cw, ch); }
}));

// ------------------------------------------------------------ recurring overlays
// AGE odometer: top-left, rolling digits. Hidden when AGE_VIS is 0.
let AGE_KEYS = [], AGE_VIS = [];
function buildAgeKeys() {
  const c = cue;
  AGE_KEYS = [
    [P(1).start, 0], [c('school'), 6], [c('make friends'), 12], [c('fall in love'), 19], [c('first job'), 23], [c('thirtieth') + .4, 30],
    [P(4).start - .5, 30], [c('eighty') + .2, 80], [c('one hundred and twentieth') + .6, 120], [P(6).start, 120], [P(6).end, 160],
    [c('two hundred years'), 200], [c('three hundred years'), 300], [P(9).start, 300], [P(10).start, 300], [P(10).end, 360], [P(11).end, 400],
    [P(13).start - .6, 400], [c('five hundredth') + .3, 500], [P(14).start - .6, 500], [c('eight hundredth') + .3, 800],
    [P(15).start, 800], [c('one thousandth') + .2, 1000],
  ];
  // visibility windows
  AGE_VIS = [[P(1).start - .5, P(2).start - 1.2], [P(4).start, P(11).end + .5], [P(13).start, P(15).end + .5]];
}
function ageAt(t) {
  if (t <= AGE_KEYS[0][0]) return 0;
  for (let i = 0; i < AGE_KEYS.length - 1; i++) {
    const [t0, v0] = AGE_KEYS[i], [t1, v1] = AGE_KEYS[i + 1];
    if (t < t1) return lerp(v0, v1, v1 < v0 ? (t >= t1 - .01 ? 1 : 0) : eio((t - t0) / Math.max(.001, t1 - t0)));
  }
  return AGE_KEYS[AGE_KEYS.length - 1][1];
}
function ageVis(t) { let v = 0; for (const [a, b] of AGE_VIS) v = Math.max(v, smooth(inv(a, a + .6, t)) * (1 - smooth(inv(b - .6, b, t)))); return v; }
function drawAge(g, t) {
  const v = ageVis(t); if (v <= 0) return;
  const age = ageAt(t);
  g.save(); g.globalAlpha = v; g.translate(70, 64 - (1 - v) * 30);
  g.shadowColor = 'rgba(30,15,5,0.35)'; g.shadowBlur = 16; g.shadowOffsetY = 6;
  g.fillStyle = '#F4EADA'; rr(g, 0, 0, 290, 92, 14); g.fill(); g.shadowColor = 'transparent';
  g.fillStyle = PAL.red; rr(g, 0, 0, 14, 92, [14, 0, 0, 14]); g.fill();
  g.fillStyle = PAL.ink; g.font = '600 20px Fraunces'; g.fillText('AGE', 34, 54);
  // odometer: 4 digits, each rolls continuously
  g.save(); g.beginPath(); g.rect(92, 10, 186, 72); g.clip();
  g.font = '800 64px Fraunces'; g.textAlign = 'center';
  for (let d = 0; d < 4; d++) {
    const place = Math.pow(10, 3 - d), val = age / place;
    let digit = Math.floor(val) % 10, frac = val - Math.floor(val);
    // lower digits roll continuously; higher ones snap during the last 10% of the lower carry
    const lower = (age % place) / place; const rollK = place === 1 ? frac : smooth(inv(.9, 1, lower));
    const x = 116 + d * 44, y = 72;
    for (let k = 0; k < 2; k++) {
      const dd = (digit + k) % 10; const yy = y - (place === 1 ? frac : rollK) * 70 + k * 70;
      g.fillStyle = dd === 0 && d < 4 - String(Math.floor(age + .001)).length && k === 0 ? 'rgba(43,42,51,0.22)' : PAL.ink;
      g.fillText(dd, x, yy);
    }
  }
  g.restore(); g.restore();
}
// paper tag label anchored in world (custom item)
function tagItem(x, y, z, title, sub, k, o = {}) {
  if (k <= 0) return;
  custom(x, y, z, (g, s) => {
    const e = eback(k, 1.8), sc = s * (o.size || 1);
    g.scale(sc, sc); g.rotate((1 - e) * .3 + (o.rot || -.03)); g.globalAlpha *= clamp(k * 3);
    g.font = '800 46px Fraunces'; const w1 = g.measureText(title).width; g.font = '600 26px Fraunces'; const w2 = sub ? g.measureText(sub).width : 0;
    const w = Math.max(w1, w2) + 70, h = sub ? 120 : 80;
    g.translate(0, -(1 - e) * 40);
    g.shadowColor = 'rgba(20,10,5,0.4)'; g.shadowBlur = 18; g.shadowOffsetX = 6; g.shadowOffsetY = 10;
    g.fillStyle = o.bg || '#F6EEDF'; rr(g, -w / 2, -h, w, h, 10); g.fill(); g.shadowColor = 'transparent';
    g.fillStyle = o.accent || PAL.red; g.beginPath(); g.arc(-w / 2 + 22, -h + 22, 7, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(43,42,51,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-w / 2 + 22, -h + 22); g.lineTo(-w / 2 - 20, -h - 30); g.stroke();
    g.fillStyle = PAL.ink; g.textAlign = 'center'; g.font = '800 46px Fraunces'; g.fillText(title, 0, sub ? -h + 62 : -h + 56);
    if (sub) { g.font = '600 26px Fraunces'; g.fillStyle = PAL.red; g.fillText(sub, 0, -h + 100); }
  }, { dof: false, order: 5 });
}
// 3D paper headline: letters with thickness layers
function headline(x, y, z, str, size, anim, o = {}) {
  custom(x, y, z, (g, s) => {
    g.scale(s, s);
    const depth = o.depth ?? 6;
    for (let d = depth; d >= 1; d--) { g.save(); g.translate(d * 1.4, d * 1.6); paperText(g, str, size, { ...o, anim, color: o.side || '#B79C74', shadow: d === depth }); g.restore(); }
    paperText(g, str, size, { ...o, anim, shadow: false });
  }, { dof: o.dof ?? false, order: o.order || 4 });
}
function pop(t, t0, d = .5) { return clamp((t - t0) / d); }
