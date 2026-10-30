// ===== core: utils, 3D camera, helpers, transitions, post, captions =====
const W = 1080, H = 1920, FPS = 30;
const DUR = DATA.duration;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eout = t => 1 - Math.pow(1 - clamp(t), 3);
const eoutExpo = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(t)));
const eoutBack = t => { t = clamp(t); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const vnoise = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; };
const rgba = (c, a = 1) => `rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;
const RED = [255, 42, 36], AMB = [255, 176, 40], GRN = [90, 255, 170], CYN = [110, 220, 255], WHT = [244, 240, 230];
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const OUT = cv.getContext('2d');
const SCV = mk(W, H), SCX = SCV.getContext('2d');   // scene
const ACV = mk(W, H), ACX = ACV.getContext('2d');   // motion-blur accumulation
const LCV = mk(W / 2, H / 2), LCX = LCV.getContext('2d'); // half-res blurred layer
const B1 = mk(W / 4, H / 4), B1X = B1.getContext('2d');
const B2 = mk(W / 8, H / 8), B2X = B2.getContext('2d');
let c = SCX; // current drawing context

// ---- camera ----
const C = { x: 0, y: 0, z: -1000, yaw: 0, pitch: 0, roll: 0, f: 1100 };
function cam(o) { Object.assign(C, { x: 0, y: 0, z: -1000, yaw: 0, pitch: 0, roll: 0, f: 1100 }, o); }
function lookAt(px, py, pz, tx, ty, tz) {
  const fx = tx - px, fy = ty - py, fz = tz - pz;
  const yaw = Math.atan2(-fx, fz);
  const z1 = -fx * Math.sin(yaw) + fz * Math.cos(yaw);
  return { x: px, y: py, z: pz, yaw, pitch: Math.atan2(fy, z1) };
}
function proj(x, y, z) {
  const dx = x - C.x, dy = y - C.y, dz = z - C.z;
  const cy = Math.cos(C.yaw), sy = Math.sin(C.yaw);
  const x1 = dx * cy + dz * sy, z1 = -dx * sy + dz * cy;
  const cp = Math.cos(C.pitch), sp = Math.sin(C.pitch);
  const y1 = dy * cp - z1 * sp; let z2 = dy * sp + z1 * cp;
  if (z2 < 15) z2 = 15;
  const s = C.f / z2, sx = x1 * s, sy2 = y1 * s;
  const cr = Math.cos(C.roll), sr = Math.sin(C.roll);
  return [W / 2 + sx * cr - sy2 * sr, H / 2 + sx * sr + sy2 * cr, s, z2];
}
// map 2D plane coordinates (u right, v down) onto a world plane at depth z0 positioned at (x0,y0)
function plane(ctx, x0, y0, z0) {
  const p0 = proj(x0, y0, z0), p1 = proj(x0 + 100, y0, z0), p2 = proj(x0, y0 + 100, z0);
  ctx.setTransform((p1[0] - p0[0]) / 100, (p1[1] - p0[1]) / 100, (p2[0] - p0[0]) / 100, (p2[1] - p0[1]) / 100, p0[0], p0[1]);
  return p0[2];
}
const reset = ctx => ctx.setTransform(1, 0, 0, 1, 0, 0);

// ---- drawing helpers ----
function glow(ctx, x, y, r, col, a = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, a)); g.addColorStop(.4, rgba(col, a * .35)); g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function bgGrad(top, bot) { reset(c); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, W, H); }
function poly(ctx, pts, fill, stroke, lw) {
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
}
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function txt(ctx, s, x, y, o = {}) {
  ctx.save();
  ctx.font = o.font || `900 ${o.size || 100}px Inter`;
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
  ctx.letterSpacing = (o.ls || 0) + 'px';
  ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha) * ctx.globalAlpha;
  ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); if (o.sx || o.sy) ctx.scale(o.sx || 1, o.sy || 1);
  if (o.glow) { ctx.shadowColor = rgba(o.glowCol || RED, 1); ctx.shadowBlur = Math.min(o.glow, 20); }
  if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.strokeCol || '#000'; ctx.strokeText(s, 0, 0); }
  ctx.fillStyle = o.fill || '#fff'; ctx.fillText(s, 0, 0);
  ctx.restore();
}
// scale-to-fit width
function fitSize(ctx, s, size, maxW, font = '900 {s}px Inter', ls = 0) {
  ctx.save(); ctx.font = font.replace('{s}', size); ctx.letterSpacing = ls + 'px';
  const w = ctx.measureText(s).width; ctx.restore(); return w > maxW ? size * maxW / w : size;
}
// "slam" kinetic text: overshoot scale-down from big, with tilt settle
function slam(s, x, y, size, t0, t, o = {}) {
  const k = t - t0; if (k < 0) return;
  const e = Math.exp(-k * (o.damp || 11));
  const sc = 1 + (o.pop || 0.9) * e * Math.cos(k * 18);
  const rot = (o.rot || 0) + (o.tilt || 0.05) * e * Math.sin(k * 22);
  const sz = o.fit ? fitSize(c, s, size, o.fit, o.fontTpl || '900 {s}px Inter', o.ls || 0) : size;
  reset(c); txt(c, s, x, y, Object.assign({ size: sz, rot, sx: sc, sy: sc, alpha: clamp(k * 25) }, o, o.fontTpl ? { font: o.fontTpl.replace('{s}', sz) } : {}));
}
// floating dust / bokeh, depth aware
function dust(t, seed, n, col, o = {}) {
  const r = rng(seed), fz = o.focus || 600;
  c.save(); c.globalCompositeOperation = 'lighter'; reset(c);
  for (let i = 0; i < n; i++) {
    const x0 = (r() * 2 - 1) * 1500, y0 = (r() * 2 - 1) * 1500, z0 = r() * 2400 - 200;
    const sp = (o.speed || 20) * (0.4 + r());
    const x = ((x0 + (o.vx || 0) * t * sp / 20 + 3000 * 100) % 3000) - 1500;
    const y = ((y0 + (o.vy || -1) * t * sp + 3000 * 100) % 3000) - 1500;
    const p = proj(x, y, z0 + (o.z || 0)); if (p[3] < 80) continue;
    const blur = Math.abs(z0 + (o.z || 0) - (C.z + fz)) * 0.012;
    const sz = (2 + blur) * p[2] * 2.2;
    const a = (o.alpha || .5) * Math.min(1, 14 / (sz * sz + 1)) * (.5 + .5 * Math.sin(t * 1.3 + i));
    c.fillStyle = rgba(col, a);
    c.beginPath(); c.arc(p[0], p[1], sz, 0, 7); c.fill();
  }
  c.restore();
}
// draw into half-res layer and composite blurred (depth of field)
function dof(blurPx, fn, alpha = 1) {
  LCX.setTransform(1, 0, 0, 1, 0, 0); LCX.clearRect(0, 0, W / 2, H / 2);
  const prev = c; c = LCX; LCX.save(); LCX.scale(.5, .5);
  fn(); LCX.restore(); c = prev;
  reset(c); c.save(); c.filter = `blur(${blurPx}px)`; c.globalAlpha = alpha; c.drawImage(LCV, 0, 0, W, H); c.restore();
}
function shake(t, amt, freq = 9) { return [vnoise(t * freq) * amt, vnoise(t * freq + 71) * amt, vnoise(t * freq + 33) * amt * .002]; }

// ---- land geometry (rough, stylised) ----
const LAND = [
  [[-168,66],[-140,70],[-120,70],[-95,72],[-80,68],[-62,60],[-56,52],[-66,45],[-70,42],[-76,35],[-81,30],[-80,25],[-84,30],[-90,29],[-97,27],[-97,22],[-92,18],[-87,21],[-83,10],[-78,8],[-80,8],[-86,12],[-93,15],[-105,20],[-110,24],[-113,31],[-117,32],[-124,40],[-124,48],[-135,58],[-150,60],[-165,60]],
  [[-78,8],[-72,12],[-62,10],[-52,5],[-50,0],[-35,-6],[-38,-14],[-42,-23],[-48,-26],[-58,-38],[-65,-42],[-68,-52],[-72,-52],[-74,-45],[-72,-30],[-70,-18],[-76,-14],[-81,-5],[-80,0]],
  [[-55,60],[-45,60],[-22,70],[-20,80],[-40,83],[-65,80],[-72,76]],
  [[-10,36],[-9,43],[-1,46],[-4,48],[2,51],[8,54],[10,57],[12,56],[18,59],[22,65],[28,71],[40,68],[60,70],[80,73],[105,78],[140,72],[170,70],[180,66],[178,64],[160,60],[155,57],[142,53],[140,48],[132,43],[129,35],[126,38],[122,40],[122,31],[120,23],[108,21],[106,10],[100,13],[103,2],[98,8],[98,17],[92,22],[88,21],[80,15],[77,8],[72,20],[67,25],[57,25],[56,27],[50,30],[48,29],[56,17],[52,14],[43,13],[35,28],[34,31],[36,36],[28,37],[26,40],[23,40],[20,40],[19,42],[14,45],[18,40],[16,38],[12,42],[8,44],[3,43],[-5,36]],
  [[-17,21],[-10,30],[-6,36],[10,37],[11,33],[20,31],[32,31],[34,28],[43,12],[51,12],[40,-3],[40,-15],[35,-25],[27,-34],[18,-34],[12,-18],[13,-7],[9,4],[-8,4],[-17,14]],
  [[114,-22],[122,-18],[130,-12],[137,-12],[142,-11],[146,-19],[153,-26],[150,-37],[141,-38],[131,-31],[115,-34]],
  [[-5,50],[1,51],[2,53],[-2,58],[-6,58],[-3,54]],
  [[130,31],[135,34],[141,38],[142,45],[140,41],[136,36]],
  [[-180,-70],[180,-70],[180,-85],[-180,-85]],
];
function inPoly(x, y, p) { let ins = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const xi = p[i][0], yi = p[i][1], xj = p[j][0], yj = p[j][1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins; } return ins; }
const isLand = (lon, lat) => LAND.some(p => inPoly(lon, lat, p));
const MAPPTS = []; for (let lat = 80; lat > -58; lat -= 2.3) for (let lon = -170; lon < 180; lon += 2.3 / Math.max(.35, Math.cos(lat * Math.PI / 180) * .55 + .45)) if (isLand(lon, lat)) MAPPTS.push([lon, lat]);
const GLOBEPTS = []; { const N = 9000, ga = Math.PI * (3 - Math.sqrt(5)); for (let i = 0; i < N; i++) { const z = 1 - 2 * (i + .5) / N, lat = Math.asin(z) * 180 / Math.PI, lon = ((i * ga) * 180 / Math.PI) % 360 - 180; GLOBEPTS.push([lon, lat, isLand(lon, lat)]); } }

// globe: centre (0,0,0) radius R; rotLon faces that longitude to camera; tiltLat faces that latitude
function globe(ctx, R, rotLon, tiltLat, o = {}) {
  const dr = Math.PI / 180, ct = Math.cos(tiltLat * dr), st = Math.sin(tiltLat * dr);
  const L = o.landCol || CYN, ocean = o.oceanA == null ? .05 : o.oceanA;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; reset(ctx);
  const cp = proj(0, 0, 0);
  const rg = ctx.createRadialGradient(cp[0], cp[1], 0, cp[0], cp[1], R * cp[2] * 1.3);
  rg.addColorStop(0, rgba(o.atmo || CYN, .05)); rg.addColorStop(.73, rgba(o.atmo || CYN, .07)); rg.addColorStop(.78, rgba(o.atmo || CYN, .32)); rg.addColorStop(1, rgba(o.atmo || CYN, 0)); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  const sp = (lon, lat) => {
    const lo = (lon - rotLon) * dr, la = lat * dr;
    let x = R * Math.cos(la) * Math.sin(lo), y = -R * Math.sin(la), z = -R * Math.cos(la) * Math.cos(lo);
    const y2 = y * ct - z * st, z2 = y * st + z * ct; return [x, y2, z2];
  };
  for (const g of GLOBEPTS) {
    const q = sp(g[0], g[1]); if (q[2] > R * .12) continue;
    const face = clamp(-q[2] / R), p = proj(q[0], q[1], q[2]);
    let a, col = L;
    if (g[2]) { a = (.55 + .6 * face) * (o.landA || 1); if (o.nightLights) { col = AMB; a *= (.4 + .6 * hash(g[0] * 7.3 + g[1] * 3.1)) * o.nightLights; } }
    else a = ocean * face;
    if (a < .02) continue; const sz = (g[2] ? 4.6 : 1.4) * p[2] * (.7 + .5 * face) + .8;
    ctx.fillStyle = rgba(col, a); ctx.fillRect(p[0] - sz / 2, p[1] - sz / 2, sz, sz);
  }
  if (o.graticule !== false) {
    ctx.lineWidth = 1.2; ctx.strokeStyle = rgba(o.atmo || CYN, .16);
    for (let lat = -60; lat <= 60; lat += 30) { ctx.beginPath(); let st0 = false; for (let lon = -180; lon <= 180; lon += 6) { const q = sp(lon + rotLon, lat); if (q[2] > 0) { st0 = false; continue; } const p = proj(q[0], q[1], q[2]); st0 ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); st0 = true; } ctx.stroke(); }
    for (let lon = -180; lon < 180; lon += 30) { ctx.beginPath(); let st0 = false; for (let lat = -88; lat <= 88; lat += 5) { const q = sp(lon + rotLon, lat); if (q[2] > 0) { st0 = false; continue; } const p = proj(q[0], q[1], q[2]); st0 ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); st0 = true; } ctx.stroke(); }
  }
  ctx.restore();
  return (lon, lat) => { const q = sp(lon, lat); return { v: q[2] < 0, p: proj(q[0], q[1], q[2] - 0), q }; };
}

// ---- noise textures ----
const FOG = mk(540, 960); { const g = FOG.getContext('2d'), r = rng(7); for (let i = 0; i < 26; i++) { const x = r() * 540, y = r() * 960, rad = 120 + r() * 220; const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(255,255,255,.13)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); } }
function fog(t, col, a = .5, speed = 1) {
  reset(c); c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a;
  c.fillStyle = rgba(col, 1);
  const off = (t * 18 * speed) % 1080;
  // tint using a temp: draw fog then multiply-tint via fillRect with source-atop on layer
  LCX.setTransform(1, 0, 0, 1, 0, 0); LCX.globalCompositeOperation = 'source-over'; LCX.clearRect(0, 0, W / 2, H / 2);
  LCX.drawImage(FOG, -off / 2, 0, 540, 480 * 2 / 2 + 480); LCX.drawImage(FOG, 540 - off / 2, 0, 540, 960);
  LCX.globalCompositeOperation = 'source-in'; LCX.fillStyle = rgba(col, 1); LCX.fillRect(0, 0, W / 2, H / 2); LCX.globalCompositeOperation = 'source-over';
  c.drawImage(LCV, 0, 0, W, H); c.restore();
}
const GRAINS = []; for (let k = 0; k < 4; k++) { const g = mk(360, 640), x = g.getContext('2d'), im = x.createImageData(360, 640), r = rng(100 + k); for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); GRAINS.push(g); }
const VIG = mk(W / 2, H / 2); { const g = VIG.getContext('2d'); const gr = g.createRadialGradient(270, 480, 200, 270, 480, 640); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.72)'); g.fillStyle = gr; g.fillRect(0, 0, 540, 960); }

// ---- scenes & transitions ----
const SCENES = []; // filled by scenes*.js : {draw(u,t)}
const BND = DATA.scenes.bounds, TR = DATA.scenes.trans;
const TWIN = 0.13;
function sceneAt(t) { for (let i = 0; i < BND.length - 1; i++) if (t < BND[i + 1]) return i; return BND.length - 2; }
function drawSceneIdx(i, t) {
  c = SCX; reset(c); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.shadowBlur = 0;
  c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  SCENES[i](t - BND[i], t);
  reset(c); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.shadowBlur = 0; c.filter = 'none';
}
// returns transform params for time t
function transFor(t, i) {
  let a = 0, kind = null, side = 0;
  if (i < TR.length && BND[i + 1] - t < TWIN) { a = 1 - (BND[i + 1] - t) / TWIN; kind = TR[i]; side = 0; }
  else if (i > 0 && t - BND[i] < TWIN) { a = 1 - (t - BND[i]) / TWIN; kind = TR[i - 1]; side = 1; }
  if (!kind || kind === 'none') return null;
  return { a: a * a, kind, side };
}
function compositeScene(t, i, target) {
  const tf = transFor(t, i);
  target.setTransform(1, 0, 0, 1, 0, 0); target.globalAlpha = 1;
  if (!tf) { target.drawImage(SCV, 0, 0); return; }
  const { a, kind, side } = tf, sg = side ? 1 : -1;
  target.save();
  const cx = W / 2, cy = H / 2;
  if (kind === 'whipL' || kind === 'whipR') {
    const d = kind === 'whipL' ? -1 : 1;
    target.filter = `blur(${(a * 26) | 0}px)`; target.translate((side ? -d : d) * a * W * .85, 0);
    target.drawImage(SCV, 0, 0);
  } else if (kind === 'zoom') {
    target.translate(cx, cy); const s = 1 + a * .9; target.scale(s, s); target.rotate(sg * a * .05); target.translate(-cx, -cy);
    target.filter = `blur(${(a * 14) | 0}px)`; target.drawImage(SCV, 0, 0);
  } else if (kind === 'glitch') {
    const r = rng((t * 997) | 0);
    for (let y = 0; y < H; y += 60) { const dx = (r() - .5) * 220 * a; target.drawImage(SCV, 0, y, W, 60, dx, y, W, 60); }
    target.globalCompositeOperation = 'lighter'; target.globalAlpha = .5 * a; target.drawImage(SCV, 14 * a * 3, 0); target.drawImage(SCV, -14 * a * 3, 0);
  } else if (kind === 'dip') {
    target.drawImage(SCV, 0, 0); target.fillStyle = `rgba(0,0,0,${clamp(a * 1.6)})`; target.fillRect(0, 0, W, H);
  } else { target.drawImage(SCV, 0, 0); }
  target.restore(); target.setTransform(1, 0, 0, 1, 0, 0); target.filter = 'none';
  if (kind === 'flash' || kind === 'zoom') { target.fillStyle = `rgba(255,255,255,${a * a * .85})`; target.fillRect(0, 0, W, H); }
}

// ---- captions ----
const CHUNKS = (() => {
  const ws = DATA.words.map(w => ({ s: w[0], a: w[1], b: w[2] }));
  const out = []; let cur = [];
  const flush = () => { if (cur.length) { out.push({ w: cur, a: cur[0].a, b: cur[cur.length - 1].b }); cur = []; } };
  for (const w of ws) {
    cur.push(w);
    const chars = cur.map(x => x.s).join(' ').length;
    const endP = /[.?!:…]$/.test(w.s) || /\.\.\.$/.test(w.s), comma = /,$/.test(w.s);
    if (endP || cur.length >= 4 || chars > 17 || (comma && cur.length >= 2)) flush();
  }
  flush();
  for (let i = 0; i < out.length; i++) { const nx = out[i + 1]; out[i].end = nx ? Math.min(nx.a - .02, out[i].b + .55) : out[i].b + .5; if (nx && nx.a - out[i].b < .5) out[i].end = nx.a - .01; }
  return out;
})();
function drawCaptions(ctx, t) {
  const ch = CHUNKS.find(k => t >= k.a - .03 && t < k.end); if (!ch) return;
  const k = t - ch.a + .03, pop = .82 + .18 * eoutBack(k / .16);
  const words = ch.w.map(w => w.s.toUpperCase());
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  let size = 84; const meas = s => { ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = '1px'; return ctx.measureText(s).width; };
  const full = words.join(' ');
  size = Math.min(84, 84 * 820 / meas(full));
  const spaceW = meas(' '), ws = words.map(meas), total = ws.reduce((a, b) => a + b, 0) + spaceW * (words.length - 1);
  const CX = W / 2 - 30; let x = CX - total / 2; const y = 1330;
  ctx.translate(CX, y); ctx.scale(pop, pop); ctx.translate(-CX, -y);
  ctx.lineJoin = 'round'; ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = '1px';
  words.forEach((w, i) => {
    const act = t >= ch.w[i].a - .02 && t < ch.w[i].b + .06;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.65)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 6;
    ctx.lineWidth = size * .2; ctx.strokeStyle = '#000'; ctx.strokeText(w, x, y); ctx.restore();
    ctx.fillStyle = act ? '#ffd23f' : '#ffffff'; ctx.fillText(w, x, y);
    x += ws[i] + spaceW;
  });
  ctx.restore();
}

// ---- frame render ----
const SHUT = 0.55, NSUB = 3;
function post(t) {
  const o = OUT; o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'source-over'; o.globalAlpha = 1; o.filter = 'none';
  o.drawImage(ACV, 0, 0);
  B1X.filter = 'brightness(.72) contrast(1.7) blur(3px)'; B1X.drawImage(ACV, 0, 0, W / 4, H / 4); B1X.filter = 'none';
  B2X.filter = 'brightness(.72) contrast(1.7) blur(3px)'; B2X.drawImage(ACV, 0, 0, W / 8, H / 8); B2X.filter = 'none';
  o.globalCompositeOperation = 'lighter'; o.globalAlpha = .55; o.drawImage(B1, 0, 0, W, H); o.globalAlpha = .7; o.drawImage(B2, 0, 0, W, H);
  o.globalCompositeOperation = 'source-over'; o.globalAlpha = 1; o.drawImage(VIG, 0, 0, W, H);
  const gi = Math.floor(t * 24) % 4; o.globalCompositeOperation = 'overlay'; o.globalAlpha = .13; o.drawImage(GRAINS[gi], (gi * 37) % 20, (gi * 53) % 20, 340, 600, 0, 0, W, H);
  o.globalCompositeOperation = 'source-over'; o.globalAlpha = 1;
}
function renderFrame(t) {
  const i0 = sceneAt(t);
  for (let s = 0; s < NSUB; s++) {
    const ts = clamp(t + ((s + .5) / NSUB - .5) * SHUT / FPS, 0, DUR - .001);
    const i = sceneAt(ts); drawSceneIdx(i, ts);
    ACX.setTransform(1, 0, 0, 1, 0, 0); ACX.globalAlpha = s === 0 ? 1 : 1 / (s + 1); ACX.globalCompositeOperation = 'source-over'; ACX.filter = 'none';
    if (s === 0) { ACX.fillStyle = '#000'; ACX.fillRect(0, 0, W, H); }
    ACX.save(); compositeScene(ts, i, ACX); ACX.restore();
  }
  ACX.globalAlpha = 1;
  post(t);
  // global fades
  const fin = clamp(t / .25), fout = clamp((DUR - t) / .9);
  OUT.fillStyle = `rgba(0,0,0,${1 - Math.min(fin, fout)})`; OUT.fillRect(0, 0, W, H);
  if (!window.noCaps) drawCaptions(OUT, t);
}
window.renderFrame = renderFrame;
window.ready = Promise.all(['900 40px Inter', '700 40px "JetBrains Mono"', '700 40px "Liberation Serif"', '800 40px "Inter Display"', '600 40px "Bitstream Charter"'].map(f => document.fonts.load(f))).then(() => true);

// thumbnail: a still of the hook frame with a title (no captions)
window.renderThumb = () => {
  window.noCaps = true; window.noHook = true; renderFrame(5.95);
  const o = OUT; o.setTransform(1, 0, 0, 1, 0, 0);
  const g = o.createLinearGradient(0, 1000, 0, 1700); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.85)'); o.fillStyle = g; o.fillRect(0, 1000, W, 700);
  const g2 = o.createLinearGradient(0, 0, 0, 380); g2.addColorStop(0, 'rgba(0,0,0,.8)'); g2.addColorStop(1, 'rgba(0,0,0,0)'); o.fillStyle = g2; o.fillRect(0, 0, W, 380);
  c = o; txt(o, 'THE MAN WHO', 470, 1290, { font: '800 74px "Inter Display"', ls: 8, fill: '#ffd23f', stroke: 14, strokeCol: '#000' });
  txt(o, 'SAVED', 470, 1420, { size: 190, fill: '#ffffff', stroke: 22, strokeCol: '#000' });
  txt(o, 'THE WORLD', 470, 1585, { size: fitSize(o, 'THE WORLD', 170, 800),  fill: '#ff3b30', stroke: 22, strokeCol: '#000' });
  txt(o, 'SEPT 26, 1983', 470, 250, { font: '700 54px "JetBrains Mono"', ls: 10, fill: '#ffffff', stroke: 10, strokeCol: '#000' });
  window.noCaps = false; window.noHook = false;
};
