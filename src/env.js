// env.js — sky, aurora, light-wall, sea, fog, ship, island. All procedural.
const _r = mulberry32(7);
const STARS = Array.from({ length: 520 }, () => ({ x: _r() * 2300 - 190, y: Math.pow(_r(), 1.4) * 900, s: .4 + _r() * 1.6, b: .3 + _r() * .7, p: _r() * 9 }));
const CONST = [ // three constellations (screen units)
  [[300, 130], [380, 175], [470, 150], [560, 215], [640, 190], [700, 260]],
  [[1300, 90], [1370, 140], [1330, 210], [1430, 250], [1500, 190], [1480, 120]],
  [[900, 220], [960, 170], [1040, 200], [1090, 280], [1000, 320]]
];
function drawSky(c, st, t, cam) {
  const hy = st.hy;
  c.fillStyle = vgrad(c, 0, hy, [[0, rgbs(st.skyTop)], [.7, rgbs(mixc(st.skyTop, st.skyBot, .6))], [1, rgbs(st.skyBot)]]); c.fillRect(0, 0, W, hy + 4);
  layer(c, cam, st.skyK ?? .05, () => {
    for (const s of STARS) {
      if (s.y > hy - 40) continue; const tw = .65 + .35 * Math.sin(t * (1.2 + s.p * .2) + s.p * 5);
      c.fillStyle = rgba(200, 225, 255, s.b * tw * st.stars * (1 - s.y / (hy + 200))); c.fillRect(s.x, s.y, s.s, s.s);
    }
    if (st.consts) for (let k = 0; k < CONST.length; k++) {
      const pts = CONST[k]; c.strokeStyle = rgba(150, 200, 255, .22 * st.stars * st.consts); c.lineWidth = 1.2; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
      pts.forEach(p => { c.fillStyle = rgba(220, 240, 255, .8 * st.stars * st.consts); c.beginPath(); c.arc(p[0], p[1], 2.4, 0, TAU); c.fill(); });
      if (st.mirror > 0) { // mirrored, counter-rotating twins
        const a = -st.mirror * .35 * Math.sin(t * .15 + k), cx = W - 960 * (k % 2 ? .6 : 1) * 0 + 960;
        c.save(); c.translate(cx, 420); c.rotate(a); c.scale(-1, -1); c.translate(-cx, -420);
        c.strokeStyle = rgba(255, 150, 230, .24 * st.mirror * st.stars); c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
        pts.forEach(p => { c.fillStyle = rgba(255, 190, 240, .85 * st.mirror * st.stars); c.beginPath(); c.arc(p[0], p[1], 2.6, 0, TAU); c.fill(); }); c.restore();
      }
    }
  });
  if (st.aurora > .01) dofLayer(c, 'aur', 3, g => drawAurora(g, st, t, cam), 1, 'lighter');
  if (st.horizonGlow) { const g = c.createLinearGradient(0, hy - 220, 0, hy); g.addColorStop(0, rgbs(st.glowCol, 0)); g.addColorStop(1, rgbs(st.glowCol, st.horizonGlow)); c.fillStyle = g; c.fillRect(0, hy - 220, W, 220); }
}
function drawAurora(c, st, t, cam) {
  c.save(); c.globalCompositeOperation = 'lighter';
  layer(c, cam, (st.skyK ?? .05) * 1.6, () => {
    for (let r = 0; r < 4; r++) {
      const base = 120 + r * 85, hue = st.auroraCols[r % st.auroraCols.length], amt = st.aurora * (.55 + .45 * Math.sin(t * .3 + r * 2.1)); const top = [], bot = [];
      for (let x = -120; x <= W + 120; x += 40) {
        const y = base + 70 * Math.sin(x * .0032 + t * .22 + r * 1.9) + 40 * Math.sin(x * .0091 - t * .41 + r) + 25 * snoise(x * .006 + t * .3 + r * 9);
        const h = 150 + 120 * noise1(x * .004 + r * 7 + t * .15); top.push([x, y]); bot.push([x, y + h]);
      }
      const g = c.createLinearGradient(0, base - 80, 0, base + 320); g.addColorStop(0, rgbs(hue, 0)); g.addColorStop(.25, rgbs(hue, .32 * amt)); g.addColorStop(1, rgbs(hue, 0));
      c.fillStyle = g; c.beginPath(); top.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); for (let i = bot.length - 1; i >= 0; i--) c.lineTo(bot[i][0], bot[i][1]); c.closePath(); c.fill();
      c.lineWidth = 7; for (let i = 0; i < top.length; i++) { const k = noise1(i * .8 + t * .6 + r * 11); c.strokeStyle = rgbs(hue, .1 * amt * k); c.beginPath(); c.moveTo(top[i][0], top[i][1]); c.lineTo(top[i][0] + 10 * Math.sin(t + i), lerp(top[i][1], bot[i][1], .4 + .6 * k)); c.stroke(); }
    }
  }); c.restore();
}
// curtain of pale light at the horizon (the Wall). amt 0..1 => height/opacity
let _ug = null;
function drawWall(c, st, t, cam, amt, x0 = -200, x1 = W + 200) {
  if (amt < .01) return; const hy = st.hy;
  c.save(); c.globalCompositeOperation = 'lighter';
  layer(c, cam, .12, () => {
    if (!_ug) { _ug = c.createLinearGradient(0, 0, 0, -1); _ug.addColorStop(0, 'rgba(210,245,255,0.95)'); _ug.addColorStop(.35, 'rgba(120,200,255,0.4)'); _ug.addColorStop(1, 'rgba(120,160,255,0)'); }
    c.save(); c.translate(0, hy + 6);
    for (let x = x0; x < x1; x += 11) {
      const n = noise1(x * .017 + t * .35), n2 = noise1(x * .05 - t * .7 + 9), h = (320 + 760 * n) * amt * (.6 + .6 * n2);
      c.save(); c.translate(x, 0); c.scale(1, h); c.globalAlpha = (.12 + .2 * n2) * Math.min(1, amt * 1.4); c.fillStyle = _ug; c.fillRect(-6, -1, 12, 1); c.restore();
    }
    c.restore();
    glow(c, W / 2, hy, 1100, [190, 235, 255], .45 * amt);
  }); c.restore();
}
// ---------- sea
function waveY(x, u, t, st) { const d = st.waveDir ?? 1, k = 1 + u * .6; return (Math.sin(x * .0042 / k + t * (.55 + u * .3) * d + u * 7) * .55 + Math.sin(x * .0097 / k - t * (.8 + u * .4) * d + u * 13) * .3 + Math.sin(x * .021 + t * 1.3 * d + u * 3) * .15) * (1 - (st.glass || 0) * .93); }
function drawSea(c, st, t, cam, from = 0, to = 1, lights = []) {
  const hy = st.hy, N = 20;
  for (let i = Math.floor(from * N); i < Math.ceil(to * N); i++) {
    const u = i / (N - 1), y0 = hy + (H - hy + 260) * Math.pow(u, 1.55), amp = (1.2 + 46 * u * u) * st.waveAmp, col = mixc(st.seaFar, st.seaNear, Math.pow(u, .75));
    const kb = .18 + .75 * u; c.save(); c.translate(-cam.x * kb * .5, -cam.y * kb * .4);
    c.beginPath(); c.moveTo(-60, H + 400); for (let x = -60; x <= W + 120; x += 22) c.lineTo(x, y0 + amp * waveY(x + cam.x * kb * .5, u, t, st)); c.lineTo(W + 120, H + 400); c.closePath();
    c.fillStyle = rgbs(col); c.fill();
    // crest highlight reflecting the sky
    c.strokeStyle = rgbs(mixc(st.skyBot, [200, 235, 255], .35), (.02 + .16 * u * u) * (st.sheen ?? 1) * (.5 + .5 * noise1(i * 3.3 + t * .2))); c.lineWidth = .5 + 1.8 * u; c.beginPath();
    for (let x = -60; x <= W + 120; x += 22) { const y = y0 + amp * waveY(x + cam.x * kb * .5, u, t, st); x === -60 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
    c.restore();
  }
}
function reflectStreak(c, x, y0, len, col, a, t, seed = 0, w = 22) {
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 26; i++) {
    const f = i / 26, yy = y0 + f * len * f * 1.6 + f * 6, sp = (noise1(i * 1.7 + t * 1.4 + seed) - .5) * 18 * (1 + f * 2), ww = w * (1 - f * .55) * (.5 + noise1(i * 3.1 + t * 2 + seed));
    c.fillStyle = rgbs(col, a * (1 - f) * (.55 + .45 * noise1(i * 2.3 + t * 1.1 + seed))); c.fillRect(x + sp - ww / 2, yy, ww, 1.8 + f * 3);
  }
  c.restore();
}
function drawFog(c, t, cam, y, amt, col = [150, 190, 205], k = 1.2, seed = 0, height = 220) {
  if (amt < .01) return; c.save(); c.globalCompositeOperation = 'screen';
  layer(c, cam, k, () => { for (let i = 0; i < 9; i++) { const x = ((i * 330 + t * (14 + 9 * hash(i + seed)) * (i % 2 ? 1 : -1) + seed * 77) % 2800 + 2800) % 2800 - 400, yy = y + (hash(i + seed * 3) - .5) * height * .8; c.save(); c.translate(x, yy); c.scale(3.3, 1); glow(c, 0, 0, height * .75, col, amt * (.5 + .5 * hash(i * 7 + seed)) * .3); c.restore(); } });
  c.restore();
}
// ---------- ship (side view, bow right). origin = waterline amidships.
function shipLights(t, o) { const fl = o.flicker ? (.78 + .22 * snoise(t * 17)) : 1; return fl * (o.lights ?? 1); }
function drawShip(c, x, wl, s, roll, t, o = {}) {
  const L = shipLights(t, o);
  c.save(); c.translate(x, wl); c.rotate(roll * Math.PI / 180); c.scale(s, s);
  const dark = '#070d13', mid = '#0f1a22', lite = '#274858';
  // masts & crane (behind hull)
  c.strokeStyle = dark; c.lineWidth = 7; c.beginPath(); c.moveTo(262, -92); c.lineTo(262, -380); c.stroke();
  c.lineWidth = 4; c.beginPath(); c.moveTo(225, -300); c.lineTo(300, -300); c.moveTo(262, -380); c.lineTo(262, -410); c.moveTo(262, -370); c.lineTo(480, -118); c.moveTo(262, -370); c.lineTo(-300, -205); c.stroke();
  c.lineWidth = 6; c.beginPath(); c.moveTo(30, -92); c.lineTo(78, -270); c.lineTo(126, -92); c.moveTo(78, -270); c.lineTo(210, -215); c.stroke();
  c.lineWidth = 1.5; c.beginPath(); c.moveTo(210, -215); c.lineTo(214, -120); c.stroke();
  // hull
  const hull = [[-445, -92], [-300, -84], [-100, -80], [150, -84], [330, -100], [440, -122], [500, -134], [488, -86], [452, -40], [400, 8], [-390, 8], [-436, -6], [-446, -60]];
  c.beginPath(); hull.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fillStyle = vgrad(c, -135, 8, [[0, '#17232c'], [.35, mid], [1, dark]]); c.fill();
  c.save(); c.clip(); c.fillStyle = 'rgba(58,22,18,.8)'; c.fillRect(-460, -20, 980, 18); for (let i = 0; i < 14; i++) { const gx = -430 + i * 68 + (i * 37 % 20); const gg = c.createLinearGradient(0, -80, 0, -20); gg.addColorStop(0, 'rgba(0,0,0,0)'); gg.addColorStop(1, 'rgba(0,0,0,.28)'); c.fillStyle = gg; c.fillRect(gx, -80, 5 + (i % 3) * 4, 60); } c.restore();
  c.strokeStyle = rgbs([90, 150, 175], .55); c.lineWidth = 2.2; c.beginPath(); hull.slice(0, 7).forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
  for (let i = 0; i < 9; i++) { c.fillStyle = rgba(255, 190, 110, .55 * L * (i % 3 ? .5 : 1)); c.fillRect(-330 + i * 62, -66, 7, 5); } // portholes
  // deck cargo
  for (let i = 0; i < 4; i++) { const cx = -40 + i * 62; c.fillStyle = ['#1b1512', '#101c20', '#1a1018', '#0f1822'][i]; c.fillRect(cx, -88 - 46, 58, 46); c.strokeStyle = 'rgba(120,170,190,.25)'; c.lineWidth = 1; c.strokeRect(cx, -134, 58, 46); for (let j = 1; j < 5; j++) { c.beginPath(); c.moveTo(cx + j * 11, -134); c.lineTo(cx + j * 11, -88); c.stroke(); } }
  // superstructure
  poly(c, [[-362, -86], [-362, -152], [-125, -152], [-90, -132], [-90, -86]], mid, 'rgba(110,170,195,.4)', 1.6);
  poly(c, [[-345, -152], [-345, -208], [-150, -208], [-138, -152]], '#0d171e', 'rgba(110,170,195,.4)', 1.6);
  poly(c, [[-325, -208], [-325, -246], [-170, -246], [-160, -208]], '#0b141a', 'rgba(130,190,215,.5)', 1.6);
  poly(c, [[-255, -246], [-205, -246], [-196, -318], [-262, -318]], '#10202a', 'rgba(120,180,205,.4)', 1.5); c.fillStyle = 'rgba(20,160,170,.55)'; c.fillRect(-258, -300, 60, 9);
  c.strokeStyle = dark; c.lineWidth = 3; c.beginPath(); c.moveTo(-300, -246); c.lineTo(-300, -330); c.stroke(); c.lineWidth = 2; c.beginPath(); c.moveTo(-336, -310); c.lineTo(-264, -310); c.stroke();
  const wins = (x0, y0, n, ww, hh, gap, a) => { for (let i = 0; i < n; i++) { const fl = o.flicker ? .8 + .2 * snoise(t * 9 + i * 3.3) : 1; const aa = a * L * fl * (o.winMask ? (o.winMask(i) ? 1 : .08) : 1); c.fillStyle = rgba(255, 196, 110, aa); c.fillRect(x0 + i * (ww + gap), y0, ww, hh); } };
  wins(-345, -140, 9, 16, 12, 9, .95); wins(-330, -196, 8, 16, 13, 8, .95); wins(-312, -236, 6, 22, 14, 6, .95);
  // railings
  c.strokeStyle = 'rgba(120,175,195,.5)'; c.lineWidth = 1.2; c.beginPath(); for (let xx = -440; xx <= 500; xx += 26) { const yy = xx > 300 ? -92 - (xx - 300) * .22 : -88; c.moveTo(xx, yy); c.lineTo(xx, yy - 26); } c.stroke();
  c.beginPath(); c.moveTo(-440, -113); c.lineTo(300, -116); c.lineTo(470, -168); c.stroke();
  // nav lights + glows
  c.save(); c.globalCompositeOperation = 'lighter';
  const nl = (px, py, col, a, r) => glow(c, px, py, r, col, a);
  nl(262, -406, [255, 240, 210], .9 * L, 46); nl(-300, -332, [255, 70, 60], .8 * L, 38);
  for (let i = 0; i < 8; i++) { const wx = -312 + i * 28; if (i < 6) nl(wx + 11, -229, [255, 180, 90], .35 * L, 44); } nl(-230, -158, [255, 170, 80], .3 * L, 120);
  if (o.deckLamp) nl(o.deckLamp[0], o.deckLamp[1], [255, 200, 130], o.deckLamp[2] * L, 190);
  c.restore();
  // bow wave foam
  c.fillStyle = 'rgba(200,230,240,.18)'; c.beginPath(); c.ellipse(430, 6, 90, 8, 0, 0, TAU); c.fill();
  c.restore();
}
// ---------- island of wrecks + spire
const _ri = mulberry32(31);
const WRECK = Array.from({ length: 120 }, (_, i) => { const hgt = _ri(); return { u: _ri() * 2 - 1, h: hgt, w: 90 + _ri() * 190, th: 26 + _ri() * 36, rot: (_ri() - .5) * 1.1, shade: _ri(), mast: _ri() < .45, kind: _ri() < .6 ? 0 : 1 }; }).sort((a, b) => b.h - a.h);
function drawIsland(c, x, base, s, t, o = {}) {
  const Hc = 420 * s, Wc = 760 * s; c.save(); c.translate(x, base);
  // body: layered wreck pieces on a cone
  c.fillStyle = '#04080c'; c.beginPath(); c.moveTo(-Wc * .62, 8); c.quadraticCurveTo(-Wc * .3, -Hc * .5, -26 * s, -Hc); c.lineTo(26 * s, -Hc); c.quadraticCurveTo(Wc * .3, -Hc * .5, Wc * .62, 8); c.closePath(); c.fill();
  for (const w of WRECK) {
    const hh = w.h * Hc * .92, half = (1 - w.h * .95) * Wc * .5, px = w.u * half, py = -hh; const sc = s * (.7 + .6 * (1 - w.h));
    c.save(); c.translate(px, py); c.rotate(w.rot); c.scale(sc, sc);
    const sh = 8 + w.shade * 16; c.fillStyle = rgba(sh * .7, sh, sh * 1.25, 1);
    if (w.kind === 0) { c.beginPath(); c.moveTo(-w.w / 2, 0); c.lineTo(w.w / 2, -w.th * .4); c.lineTo(w.w / 2 - 18, w.th); c.lineTo(-w.w / 2 + 24, w.th); c.closePath(); c.fill(); c.strokeStyle = rgba(70, 110, 130, .22 + .2 * w.shade); c.lineWidth = 1.6; c.beginPath(); c.moveTo(-w.w / 2, 0); c.lineTo(w.w / 2, -w.th * .4); c.stroke(); }
    else { c.beginPath(); c.moveTo(-w.w / 2, w.th); c.quadraticCurveTo(0, -w.th * 1.3, w.w / 2, w.th); c.closePath(); c.fill(); c.strokeStyle = rgba(70, 110, 130, .25); c.lineWidth = 2; c.stroke(); for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(k * w.w / 8, w.th); c.lineTo(k * w.w / 12, -w.th * .7); c.stroke(); } }
    if (w.mast) { c.strokeStyle = rgba(sh, sh * 1.2, sh * 1.5, 1); c.lineWidth = 3.4; c.beginPath(); c.moveTo(0, 0); c.lineTo(10, -w.w * .9); c.stroke(); c.lineWidth = 1.5; c.beginPath(); c.moveTo(-34, -w.w * .6); c.lineTo(44, -w.w * .62); c.stroke(); }
    c.restore();
  }
  // the spire
  const th = Hc * 1.35, sw = 46 * s;
  c.beginPath(); c.moveTo(-sw, -Hc * .9); c.lineTo(-sw * .55, -Hc - th); c.lineTo(sw * .55, -Hc - th); c.lineTo(sw, -Hc * .9); c.closePath(); c.fillStyle = vgrad(c, -Hc - th, -Hc, [[0, '#0b161d'], [1, '#04080b']]); c.fill();
  c.strokeStyle = 'rgba(90,150,175,.35)'; c.lineWidth = 1.8 * s; c.beginPath(); c.moveTo(-sw * .55, -Hc - th); c.lineTo(-sw, -Hc * .9); c.stroke();
  for (let i = 1; i < 9; i++) { const yy = -Hc - th * i / 9, ww = lerp(sw, sw * .55, i / 9) * 1.6; c.fillStyle = '#071017'; c.fillRect(-ww, yy, ww * 2, 6 * s); c.fillStyle = 'rgba(110,170,200,.15)'; c.fillRect(-ww, yy, ww * 2, 1.5 * s); }
  // ring of pale fires
  const nF = 14, fireA = (o.fires ?? 1); c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < nF; i++) {
    const a = i / nF * TAU + t * (o.fireSpin ?? .12), fx = Math.cos(a) * (o.fireR ?? 210) * s, fy = -Hc * .62 + Math.sin(a) * 26 * s * 0 - (o.fireLift ?? 0) * s * (.4 + .6 * hash(i));
    const fl = .65 + .35 * Math.sin(t * 7 + i * 2.2) * Math.sin(t * 3.1 + i); const depth = (Math.sin(a) + 1.4) / 2.4;
    glow(c, fx, fy, 70 * s * fl, [150, 220, 255], .55 * fireA * depth); glow(c, fx, fy, 22 * s, [235, 250, 255], .9 * fireA * depth);
  }
  // crystal lamp
  const top = -Hc - th, pul = .7 + .3 * Math.sin(t * 1.4 + 1);
  glow(c, 0, top, 260 * s * (o.lampBig ?? 1), [170, 235, 255], (o.lamp ?? .9) * pul); glow(c, 0, top, 60 * s, [255, 255, 255], (o.lamp ?? .9));
  c.restore();
  if (o.beam !== undefined) { // rotating beam
    c.save(); c.globalCompositeOperation = 'lighter'; c.translate(0, top); c.rotate(o.beam);
    const g = c.createLinearGradient(0, 0, 2600, 0); g.addColorStop(0, 'rgba(200,245,255,.55)'); g.addColorStop(.5, 'rgba(120,200,255,.18)'); g.addColorStop(1, 'rgba(120,200,255,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(0, -10 * s); c.lineTo(2600, -(o.beamW ?? 120)); c.lineTo(2600, o.beamW ?? 120); c.lineTo(0, 10 * s); c.closePath(); c.fill(); c.restore();
  }
  c.restore();
  return { lampX: x, lampY: base - Hc - th };
}
// ---------- ship reflection (flipped, rippled slices)
let _sr = null;
function shipReflection(c, x, wl, s, t, o, strength = .4, ripple = 1) {
  if (!_sr) _sr = mkCanvas(2400, 1000); const g = _sr.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 2400, 1000);
  drawShip(g, 1200, 760, s, 0, t, o); const sl = 5; c.save();
  for (let y = 0; y < 440; y += sl) { const off = Math.sin(y * .11 + t * 2.1) * (1.5 + y * .035) * ripple, a = strength * (1 - y / 440) ** 1.3; c.globalAlpha = a; c.drawImage(_sr, 0, 760 - y - sl, 2400, sl, x - 1200 + off, wl + y * .9, 2400, sl * .95); }
  c.restore();
}
function drawTitle(c, text, t, t0, t1, o = {}) {
  const size = o.size || 150, cy = o.y || 420; if (t < t0 || t > t1 + 1) return;
  const a = sstep(t0, t0 + 1.2, t) * (1 - sstep(t1 - 1.6, t1, t)); if (a <= 0) return;
  c.save(); c.textBaseline = 'middle'; c.textAlign = 'left';
  let sz = size; c.font = `600 ${sz}px Cinzel, DejaVu Serif, serif`; const fitW = [...text].reduce((q, ch) => q + c.measureText(ch).width, 0) + .3 * sz * (text.length - 1); if (fitW > 1640) { sz = sz * 1640 / fitW; c.font = `600 ${sz}px Cinzel, DejaVu Serif, serif`; }
  const sp = lerp(.3, .14, eout((t - t0) / 7)) * sz, ws = [...text].map(ch => c.measureText(ch).width + sp), tot = ws.reduce((x, y) => x + y, 0) - sp; let x = W / 2 - tot / 2;
  c.globalCompositeOperation = 'lighter'; glow(c, W / 2, cy, 780, o.col || [170, 225, 255], .22 * a);
  c.globalCompositeOperation = 'source-over';
  [...text].forEach((ch, i) => { const k = sstep(t0 + i * .09, t0 + i * .09 + 1.1, t), yy = cy + (1 - eout(k)) * 46; c.globalAlpha = a * k; c.shadowColor = 'rgba(160,225,255,.9)'; c.shadowBlur = 28 * (1 - k * .5) + 8; c.fillStyle = 'rgb(232,246,252)'; c.fillText(ch, x, yy); x += ws[i]; });
  c.restore();
}

// front wave strip: hides the hull bottom in rough water. y = waterline in the *ship's layer space*
function drawSeaFront(c, st, t, cam, k, y, col, amp = 6, th = 46, x0 = -300, x1 = W + 300) {
  layer(c, cam, k, () => {
    c.beginPath(); c.moveTo(x0, y + th); for (let x = x0; x <= x1; x += 18) c.lineTo(x, y + amp * waveY(x, .45, t, st) + amp * .3); c.lineTo(x1, y + th); c.closePath();
    const g = c.createLinearGradient(0, y - amp, 0, y + th); g.addColorStop(0, rgbs(col, 0)); g.addColorStop(.25, rgbs(col, .95)); g.addColorStop(.6, rgbs(col, .6)); g.addColorStop(1, rgbs(col, 0)); c.fillStyle = g; c.fill();
  });
}
function drawClouds(c, t, cam, y, amt, col = [60, 90, 110], k = .08, seed = 0) {
  c.save(); layer(c, cam, k, () => { for (let i = 0; i < 12; i++) { const x = ((i * 260 + t * (5 + 4 * hash(i + seed)) + seed * 99) % 3000 + 3000) % 3000 - 500, yy = y + (hash(i * 5 + seed) - .5) * 160; c.save(); c.translate(x, yy); c.scale(4.2, .55); glow(c, 0, 0, 150 + 90 * hash(i + 9), col, amt * (.4 + .6 * hash(i * 3 + seed))); c.restore(); } }); c.restore();
}
