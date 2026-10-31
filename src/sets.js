// sets.js — exterior helper, deck / corridor / mess / underwater / tower sets, monsters.
let _ms = null;
function mirrorSea(c, st, t, cam, alpha = .85, dark = .45) {
  if (!_ms) _ms = mkCanvas(W, H); const g = _ms.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); drawSky(g, st, t, cam);
  const hy = st.hy, base = rgbs(st.seaNear); c.fillStyle = vgrad(c, hy, H, [[0, rgbs(st.seaFar)], [1, base]]); c.fillRect(0, hy, W, H - hy);
  c.save(); const sl = 4;
  for (let y = 0; y < H - hy; y += sl) { const srcY = hy - 1 - Math.min(y * .9, hy - 2), off = Math.sin(y * .05 + t * 1.2) * (1 + y * .01) * (1 - (st.glass || 0) * .6); c.globalAlpha = alpha * (1 - y / (H - hy) * dark); c.drawImage(_ms, 0, srcY, W, sl, off, hy + y, W, sl); }
  c.restore(); c.fillStyle = vgrad(c, hy, H, [[0, 'rgba(0,10,16,0)'], [1, `rgba(0,6,12,${dark})`]]); c.fillRect(0, hy, W, H - hy);
}
function exterior(c, t, cam, st, o = {}) {
  drawSky(c, st, t, cam);
  if (o.clouds) drawClouds(c, t, cam, o.clouds.y, o.clouds.a, o.clouds.col, .07, o.clouds.seed || 1);
  if (o.wall) drawWall(c, st, t, cam, o.wall);
  if (o.island) layer(c, cam, .1, () => { o.island(c); });
  if (o.fogFar) drawFog(c, t, cam, st.hy - 10, o.fogFar, o.fogCol || [90, 140, 155], .25, 1, 170);
  if (o.mirror) mirrorSea(c, st, t, cam, o.mirror, o.mirrorDark ?? .45); else drawSea(c, st, t, cam, 0, 1);
}
// ---------- deck set (rail + planks) for medium shots. Characters should be drawn with layer k=.9 between back() and front().
function deckBack(c, t, cam, o = {}) {
  layer(c, cam, .7, () => {
    c.fillStyle = '#050b10'; c.fillRect(-400, 744, 3400, 22); c.fillRect(-400, 836, 3400, 14);
    for (let x = -400; x < 3000; x += 150) { c.fillRect(x, 744, 16, 250); }
    c.fillStyle = 'rgba(110,170,195,.28)'; c.fillRect(-400, 744, 3400, 2.4);
    c.strokeStyle = '#050b10'; c.lineWidth = 14; c.beginPath(); c.moveTo(300, 760); c.lineTo(300, -300); c.stroke(); c.lineWidth = 6; c.beginPath(); c.moveTo(300, -140); c.lineTo(700, 760); c.moveTo(300, -120); c.lineTo(-100, 760); c.stroke();
    c.strokeStyle = 'rgba(110,170,195,.22)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(294, 700); c.lineTo(294, -280); c.stroke();
    // lifebuoy + lamp
    c.fillStyle = '#1b0f0d'; c.beginPath(); c.arc(1880, 640, 62, 0, TAU); c.fill(); c.fillStyle = '#050b10'; c.beginPath(); c.arc(1880, 640, 28, 0, TAU); c.fill();
    c.globalCompositeOperation = 'lighter'; const lamps = o.lamps || [[620, 520, .6]]; for (const L of lamps) { glow(c, L[0], L[1], 340, [255, 180, 100], L[2] * (.85 + .15 * snoise(t * 11 + L[0]))); glow(c, L[0], L[1], 36, [255, 235, 190], L[2]); }
  });
}
function deckFront(c, t, cam) {
  layer(c, cam, 1.05, () => {
    c.fillStyle = vgrad(c, 930, 1080, [[0, '#0b1014'], [1, '#04070a']]); c.fillRect(-500, 930, 3600, 160);
    c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 3; for (let x = -500; x < 3100; x += 170) { c.beginPath(); c.moveTo(x, 930); c.lineTo(x - 80, 1100); c.stroke(); }
    c.fillStyle = 'rgba(110,170,195,.2)'; c.fillRect(-500, 930, 3600, 2.5);
    c.fillStyle = '#070d11'; c.fillRect(1500, 900, 300, 60); c.fillStyle = 'rgba(110,170,195,.22)'; c.fillRect(1500, 900, 300, 2.5);
  });
}
// ---------- corridor (side-on tracking)
function corridorSet(c, t, cam, o = {}) {
  const lampsOn = o.lamp || (() => 1);
  c.fillStyle = '#04080b'; c.fillRect(0, 0, W, H);
  layer(c, cam, .7, () => {
    c.fillStyle = vgrad(c, 0, H, [[0, '#0b181f'], [.6, '#10252d'], [1, '#07121a']]); c.fillRect(-600, 0, 5200, 900);
    for (let x = -600; x < 4600; x += 260) { c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(x, 120, 6, 760); c.fillStyle = 'rgba(120,180,200,.10)'; c.fillRect(x + 6, 120, 2, 760); for (let r = 0; r < 4; r++) { c.fillStyle = 'rgba(120,180,200,.12)'; c.beginPath(); c.arc(x + 20, 190 + r * 190, 3, 0, TAU); c.fill(); } }
    c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(-600, 760, 5200, 140);                     // dado
    for (let d = 0; d < 7; d++) { const x = 300 + d * 700; c.fillStyle = '#071015'; c.fillRect(x, 250, 180, 560); c.strokeStyle = 'rgba(120,180,200,.35)'; c.lineWidth = 4; c.strokeRect(x, 250, 180, 560); c.beginPath(); c.arc(x + 90, 530, 42, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(x + 55, 530); c.lineTo(x + 125, 530); c.moveTo(x + 90, 495); c.lineTo(x + 90, 565); c.stroke(); c.fillStyle = 'rgba(190,220,230,.55)'; c.font = '600 26px Inter'; c.fillText('D-' + (7 + d), x + 60, 300); }
    for (let p = 0; p < 2; p++) { c.fillStyle = vgrad(c, 40 + p * 56, 80 + p * 56, [[0, '#1b2b33'], [1, '#050b0f']]); c.fillRect(-600, 40 + p * 56, 5200, 34); for (let x = -600; x < 4600; x += 340) { c.fillStyle = '#0a1318'; c.fillRect(x, 34 + p * 56, 18, 46); } }
    // lamps
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 10; i++) { const x = -100 + i * 520, a = lampsOn(i, x) * (o.flick ? .75 + .25 * snoise(t * 14 + i * 5) : 1); c.fillStyle = '#05090c'; c.fillRect(x - 28, 146, 56, 20); if (a > .01) { glow(c, x, 190, 420, [255, 176, 96], .5 * a); glow(c, x, 170, 34, [255, 232, 190], a); } }
    c.restore();
  });
  layer(c, cam, 1, () => { c.fillStyle = vgrad(c, 880, H, [[0, '#0a1317'], [1, '#03060a']]); c.fillRect(-600, 880, 5200, 300); c.fillStyle = 'rgba(120,180,200,.2)'; c.fillRect(-600, 880, 5200, 2.5); for (let x = -600; x < 4600; x += 60) { c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x, 886, 3, 200); } });
}
function corridorFront(c, t, cam, a = 1) { dofLayer(c, 'cfront', 9, g => { layer(g, cam, 1.5, () => { g.fillStyle = '#020507'; for (let x = -800; x < 4800; x += 900) { g.fillRect(x, -60, 46, 300); g.beginPath(); g.ellipse(x + 23, 250, 34, 20, 0, 0, TAU); g.fill(); } g.fillRect(-800, -60, 6000, 38); g.fillRect(-800, 20, 6000, 14); }); }, a); }
// ---------- mess hall
function messSet(c, t, cam, o = {}) {
  c.fillStyle = '#04080b'; c.fillRect(0, 0, W, H);
  layer(c, cam, .5, () => {
    c.fillStyle = vgrad(c, 0, 820, [[0, '#0a141a'], [1, '#12262e']]); c.fillRect(-300, 0, 2520, 840);
    for (let x = -300; x < 2300; x += 120) { c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(x, 0, 4, 840); }
    for (let i = 0; i < 3; i++) { const px = 380 + i * 580, py = 330; c.fillStyle = '#05090c'; c.beginPath(); c.arc(px, py, 118, 0, TAU); c.fill(); c.fillStyle = vgrad(c, py - 100, py + 100, [[0, rgbs(o.sky || [30, 70, 90])], [1, rgbs(o.sky2 || [10, 24, 36])]]); c.beginPath(); c.arc(px, py, 98, 0, TAU); c.fill();
      c.strokeStyle = '#1a2a32'; c.lineWidth = 9; c.beginPath(); c.arc(px, py, 108, 0, TAU); c.stroke(); c.strokeStyle = 'rgba(120,180,200,.35)'; c.lineWidth = 2; c.beginPath(); c.arc(px, py, 114, Math.PI * 1.1, Math.PI * 1.7); c.stroke();
      if (o.frost > 0) { c.save(); c.beginPath(); c.arc(px, py, 98, 0, TAU); c.clip(); c.strokeStyle = `rgba(210,240,255,${.55 * o.frost})`; c.lineWidth = 2; for (let k = 0; k < 46; k++) { const a = k / 46 * TAU, r0 = 98, r1 = 98 - o.frost * (30 + 50 * hash(k + i * 9)); c.beginPath(); c.moveTo(px + Math.cos(a) * r0, py + Math.sin(a) * r0); c.lineTo(px + Math.cos(a + .06) * r1, py + Math.sin(a + .06) * r1); c.stroke(); } c.fillStyle = `rgba(200,235,250,${.18 * o.frost})`; c.fillRect(px - 100, py - 100, 200, 200); c.restore(); } }
  });
  layer(c, cam, .85, () => {
    c.fillStyle = '#05090c'; c.fillRect(-300, 790, 2520, 20); c.fillStyle = vgrad(c, 810, 1080, [[0, '#0a1419'], [1, '#03070a']]); c.fillRect(-300, 810, 2520, 300);
    c.fillStyle = '#091218'; c.fillRect(300, 820, 1320, 34); c.fillStyle = 'rgba(120,180,200,.25)'; c.fillRect(300, 820, 1320, 2.5); c.fillStyle = '#05090c'; c.fillRect(340, 854, 18, 180); c.fillRect(1540, 854, 18, 180);
    c.fillStyle = '#071015'; c.fillRect(250, 940, 1420, 34);
    // hanging lantern
    c.strokeStyle = '#05090c'; c.lineWidth = 3; c.beginPath(); c.moveTo(960, -20); c.lineTo(960, 170); c.stroke(); c.fillStyle = '#0a0d10'; c.fillRect(940, 170, 40, 54);
    c.save(); c.globalCompositeOperation = 'lighter'; const la = (o.lantern ?? 1) * (.88 + .12 * snoise(t * 12)); glow(c, 960, 198, 520, [255, 176, 100], .55 * la); glow(c, 960, 198, 40, [255, 236, 200], la); c.restore();
  });
}
// ---------- underwater
function underwater(c, t, cam, o = {}) {
  c.fillStyle = vgrad(c, 0, H, [[0, rgbs(o.top || [14, 70, 92])], [.45, rgbs(o.mid || [6, 30, 48])], [1, rgbs(o.bot || [1, 6, 14])]]); c.fillRect(0, 0, W, H);
  const sy = o.surf ?? 150;
  dofLayer(c, 'rays', 6, c => layer(c, cam, .15, () => { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 12; i++) { const x = i * 190 - 200 + Math.sin(t * .2 + i) * 40, w = 60 + 80 * hash(i); const g = c.createLinearGradient(0, sy, 0, H); g.addColorStop(0, `rgba(150,230,255,${.2 * (o.rays ?? 1)})`); g.addColorStop(1, 'rgba(150,230,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x, sy); c.lineTo(x + w, sy); c.lineTo(x + w * 2.6 - 260, H); c.lineTo(x - w * 1.2 - 260, H); c.closePath(); c.fill(); } c.restore(); }), 1, 'lighter');
  // surface seen from below
  c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = vgrad(c, sy - 40, sy + 70, [[0, 'rgba(170,235,255,0)'], [.45, 'rgba(170,235,255,.55)'], [1, 'rgba(170,235,255,0)']]); c.fillRect(0, sy - 40, W, 110);
  c.strokeStyle = 'rgba(210,248,255,.5)'; c.lineWidth = 2.5; c.beginPath(); for (let x = 0; x <= W; x += 20) { const y = sy + Math.sin(x * .012 + t * 1.3) * 7 + Math.sin(x * .031 - t * 2) * 3.5; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.restore();
}
function marineSnow(c, t, cam, n = 90, a = .5) { c.save(); layer(c, cam, 1.2, () => { for (let i = 0; i < n; i++) { const x = (hash(i) * 2600 - 300 + Math.sin(t * .3 + i) * 20), y = ((hash(i * 3) * 1300 + t * (14 + 22 * hash(i * 5))) % 1300) - 100, s = .8 + 2.4 * hash(i * 7); c.fillStyle = `rgba(190,235,250,${a * (.2 + .8 * hash(i * 11))})`; c.beginPath(); c.arc(x, y, s, 0, TAU); c.fill(); } }); c.restore(); }
// ---------- leviathan (side view). o:{x,y,s,dir,ph,a,eye (0 closed..1 open), look (-1..1), glowK}
function drawLeviathan(c, t, o) {
  const N = 64, s = o.s || 1, d = o.dir || 1, pts = [], step = 17 * s; let hx = o.x, hy = o.y;
  for (let i = 0; i < N; i++) { const wob = Math.sin(i * .11 - t * .8 + (o.ph || 0)) * (6 + i * .9) * s; pts.push([hx - d * i * step, hy + wob]); }
  const wid = i => { const u = i / (N - 1); return s * (u < .06 ? 100 + u * 600 : 236 * Math.pow(Math.sin(Math.PI * Math.min(1, .16 + u * .84)), .8) * (1 - u * .78) + 10); };
  const L = [], R = [], nrm = []; for (let i = 0; i < N; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; nrm.push([-dy, dx]); L.push([pts[i][0] + -dy * wid(i) * .5, pts[i][1] + dx * wid(i) * .5]); R.push([pts[i][0] - -dy * wid(i) * .5, pts[i][1] - dx * wid(i) * .5]); }
  c.save(); c.globalAlpha = o.a ?? 1;
  // flippers
  for (const side of [-1, 1]) { const i = 15, p = pts[i], n = nrm[i], fl = Math.sin(t * .9 + side + (o.ph || 0)) * 30 * s; c.fillStyle = side < 0 ? '#06121d' : '#0a1b29'; c.beginPath(); c.moveTo(p[0], p[1] + n[1] * wid(i) * .4 * side); c.quadraticCurveTo(p[0] - d * 90 * s, p[1] + n[1] * side * 240 * s + fl, p[0] - d * 250 * s, p[1] + n[1] * side * 260 * s + fl * 1.4); c.quadraticCurveTo(p[0] - d * 140 * s, p[1] + n[1] * side * 150 * s, p[0] - d * 30 * s, p[1] + n[1] * side * wid(i) * .2); c.fill(); }
  // body
  c.beginPath(); c.moveTo(L[0][0], L[0][1]); L.forEach(p => c.lineTo(p[0], p[1])); for (let i = N - 1; i >= 0; i--) c.lineTo(R[i][0], R[i][1]); c.closePath();
  const g = c.createLinearGradient(0, o.y - 150 * s, 0, o.y + 150 * s); g.addColorStop(0, '#12354c'); g.addColorStop(.5, '#0a2033'); g.addColorStop(1, '#040d16'); c.fillStyle = g; c.fill();
  // ridges
  c.strokeStyle = 'rgba(70,150,190,.2)'; c.lineWidth = 2 * s; for (let i = 4; i < N; i += 3) { c.beginPath(); c.moveTo(L[i][0], L[i][1]); c.lineTo(R[i][0], R[i][1]); c.stroke(); }
  // dorsal spikes
  const top = d > 0 ? L : R; c.fillStyle = '#071722'; for (let i = 8; i < N - 6; i += 4) { const p = top[i], n = nrm[i]; c.beginPath(); c.moveTo(p[0] - d * 18 * s, p[1]); c.lineTo(p[0] - d * 60 * s + n[0] * 0, p[1] - 70 * s * (1 - i / N) - 10 * s); c.lineTo(p[0] + d * 14 * s, p[1]); c.fill(); }
  // bioluminescence
  c.globalCompositeOperation = 'lighter'; const gk = o.glowK ?? 1;
  for (let i = 2; i < N - 2; i++) for (const row of [.34, .12, -.12, -.34]) { const p = pts[i], n = nrm[i], br = .5 + .5 * Math.sin(i * .3 - t * 2.3 + row * 9 + (o.ph || 0)), r = (5 + 7 * (1 - i / N)) * s * (.7 + br * .7); const x = p[0] + n[0] * wid(i) * row, y = p[1] + n[1] * wid(i) * row; glow(c, x, y, r * 4.2, [90, 230, 255], .5 * br * gk); c.fillStyle = `rgba(210,250,255,${.75 * br * gk})`; c.beginPath(); c.arc(x, y, r * .42, 0, TAU); c.fill(); }
  // eye
  const e = pts[2], en = nrm[2], ex = e[0] + en[0] * wid(2) * .28 * (d > 0 ? 1 : 1) - d * 6 * s, ey = e[1] + en[1] * wid(2) * .24, er = 48 * s, open = o.eye ?? 1;
  glow(c, ex, ey, er * 4.5, [255, 190, 90], .38 * open * gk); c.globalCompositeOperation = 'source-over';
  c.fillStyle = '#050a10'; c.beginPath(); c.ellipse(ex, ey, er * 1.22, er * 1.05 * Math.max(.06, open), 0, 0, TAU); c.fill();
  if (open > .08) { const gg = c.createRadialGradient(ex + (o.look || 0) * er * .3, ey, er * .1, ex, ey, er); gg.addColorStop(0, '#fff2c0'); gg.addColorStop(.5, '#ffb347'); gg.addColorStop(1, '#8a3a08'); c.fillStyle = gg; c.beginPath(); c.ellipse(ex, ey, er, er * open, 0, 0, TAU); c.fill(); c.fillStyle = '#1a0800'; c.beginPath(); c.ellipse(ex + (o.look || 0) * er * .5, ey, er * .2, er * .86 * open, 0, 0, TAU); c.fill(); }
  // tail fluke
  const tp = pts[N - 1]; c.fillStyle = '#071722'; c.beginPath(); c.moveTo(tp[0], tp[1]); c.quadraticCurveTo(tp[0] - d * 90 * s, tp[1] - 170 * s, tp[0] - d * 190 * s, tp[1] - 210 * s); c.quadraticCurveTo(tp[0] - d * 120 * s, tp[1], tp[0] - d * 190 * s, tp[1] + 210 * s); c.quadraticCurveTo(tp[0] - d * 90 * s, tp[1] + 170 * s, tp[0], tp[1]); c.fill();
  c.restore();
  return { eye: [ex, ey], head: pts[0] };
}
// ---------- kraken tentacle. base(x,y), heading ang0 (rad, 0=right, -PI/2=up), ext 0..1, curl (rad total), o:{len,w0,ph,col}
function tentaclePts(bx, by, ang0, ext, curl, t, o) {
  const N = 34, len = (o.len || 800) * ext, pts = [[bx, by]]; let a = ang0, x = bx, y = by;
  for (let i = 1; i <= N; i++) { const u = i / N; a = ang0 + curl * Math.pow(u, 1.6) + Math.sin(t * 1.7 + u * 6 + (o.ph || 0)) * .16 * u + Math.sin(t * 3.1 + u * 11 + (o.ph || 0) * 2) * .05 * u; x += Math.cos(a) * len / N; y += Math.sin(a) * len / N; pts.push([x, y]); }
  return pts;
}
function drawTentacle(c, pts, o = {}) {
  const N = pts.length - 1, w0 = o.w0 || 70; c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  for (let pass = 0; pass < 3; pass++) for (let i = 0; i < N; i++) {
    const u = i / N, w = Math.max(3, w0 * Math.pow(1 - u, .85)), p = pts[i], q = pts[i + 1];
    if (pass === 0) { c.strokeStyle = rgbs(mixc(o.base || [34, 16, 44], o.tip || [86, 36, 70], u)); c.lineWidth = w; }
    else if (pass === 1) { const nx = -(q[1] - p[1]), ny = q[0] - p[0], l = Math.hypot(nx, ny) || 1; c.strokeStyle = rgbs(o.hi || [150, 80, 120], .32 * (1 - u * .4)); c.lineWidth = w * .22; c.beginPath(); c.moveTo(p[0] + nx / l * w * .27, p[1] + ny / l * w * .27); c.lineTo(q[0] + nx / l * w * .27, q[1] + ny / l * w * .27); c.stroke(); continue; }
    else { if (i % 2 || u < .12) continue; const nx = (q[1] - p[1]), ny = -(q[0] - p[0]), l = Math.hypot(nx, ny) || 1; const sx = p[0] + nx / l * w * .36, sy = p[1] + ny / l * w * .36; c.fillStyle = rgbs([200, 160, 190], .55); c.beginPath(); c.arc(sx, sy, Math.max(1.5, w * .14), 0, TAU); c.fill(); continue; }
    c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke();
  }
  c.restore();
}
// ---------- misc
function splash(c, x, y, t0, t, n = 22, s = 1) { const k = t - t0; if (k < 0 || k > 2.4) return; c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (hash(i * 3 + t0) - .5) * 1.6, v = (260 + 520 * hash(i + t0)) * s, px = x + Math.cos(a) * v * k, py = y + Math.sin(a) * v * k + 900 * k * k * s; c.fillStyle = `rgba(200,235,250,${.7 * (1 - k / 2.4)})`; c.beginPath(); c.arc(px, py, 2 + 4 * hash(i * 9) * s, 0, TAU); c.fill(); } c.restore(); }
function shake(t, amp, t0, dur, fr = 24) { const k = t - t0; if (k < 0 || k > dur) return [0, 0]; const e = (1 - k / dur) ** 2 * amp; return [snoise(t * fr + 3) * e, snoise(t * fr + 91) * e]; }
function bust(c, who, t, o = {}) { // big cut-in portrait on a side. o:{side:-1|1, h, emo}
  const side = o.side ?? -1, h = o.h ?? 1130, x = W / 2 + side * (o.dx ?? 470), sp = speak(who, t);
  drawPerson(c, who, x, H + (o.dy ?? 330), h, { f: -side, t, talk: sp, look: -side * .6, emo: o.emo, rim: o.rim || [150, 215, 240], lightDir: side, bob: 0, rimAmt: 1.1 });
}
function dimUnder(c, a = .5, y0 = 0) { c.fillStyle = `rgba(0,3,7,${a})`; c.fillRect(0, y0, W, H - y0); }
