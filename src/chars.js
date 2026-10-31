// chars.js — stylised cut-out characters, ghosts, hands. Design space: origin = feet centre, height ≈ 1000 units (up = -y).
const CH = {
  MARA:  { skin: [128, 84, 62], hair: [16, 12, 12], coat: [22, 40, 62], coat2: [14, 26, 42], accent: [214, 178, 90], hat: 'cap', sc: 1.0, name: 'MARA' },
  ELI:   { skin: [208, 163, 138], hair: [120, 56, 30], coat: [58, 44, 34], coat2: [38, 28, 22], accent: [160, 100, 56], hat: 'beanie', beard: [128, 60, 32], sc: 1.04 },
  NOOR:  { skin: [196, 148, 112], hair: [18, 18, 22], coat: [30, 78, 86], coat2: [18, 52, 58], accent: [235, 235, 224], hat: 'scarf', scarf: [26, 104, 112], sc: .96 },
  JONAS: { skin: [176, 130, 100], hair: [34, 26, 22], coat: [64, 70, 46], coat2: [40, 46, 30], accent: [210, 126, 46], hat: 'flatcap', stubble: true, sc: 1.08, wide: 1.16 },
  WREN:  { skin: [230, 186, 156], hair: [128, 76, 34], coat: [232, 188, 38], coat2: [176, 134, 18], accent: [255, 232, 130], hat: 'hood', sc: .84 },
  GRAND: { skin: [190, 222, 240], hair: [235, 240, 245], coat: [120, 160, 190], coat2: [80, 120, 150], accent: [220, 235, 250], hat: 'sailor', beard: [232, 240, 248], ghost: true, sc: 1.0 },
};
let _pc = null;
function limb(c, x0, y0, a1, l1, a2, l2, w1, w2, col) { // two-segment limb, angles in degrees from straight-down, +ve swings to +x
  const r1 = a1 * Math.PI / 180, r2 = (a1 + a2) * Math.PI / 180, x1 = x0 + Math.sin(r1) * l1, y1 = y0 + Math.cos(r1) * l1, x2 = x1 + Math.sin(r2) * l2, y2 = y1 + Math.cos(r2) * l2;
  c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col; c.lineWidth = w1; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.lineWidth = w2; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); return [x2, y2, x1, y1];
}
// st: {f:+1/-1 facing, talk:0..1, t, walk:0..1, ph:phase, aL:[a1,a2], aR:[a1,a2], look:-1..1, emo:'worry'|'fear'|'grim'|'', tilt:deg, prop:'lantern'|'', alpha, lightDir:-1|1, rim:[r,g,b], dim:0..1, bob}
function drawPerson(c, who, x, y, h, st = {}) {
  const P = CH[who], f = st.f ?? 1, t = st.t ?? 0, sc = (h / 1000) * P.sc, wd = P.wide || 1;
  if (!_pc) _pc = mkCanvas(900, 1300); const g = _pc.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 900, 1300);
  g.save(); g.translate(450, 1180); g.scale(f, 1);
  const br = Math.sin(t * 1.9 + (P.sc * 9)) * 4, walk = st.walk || 0, ph = (st.ph ?? t * 3.2), sw = Math.sin(ph) * walk, bob = Math.abs(Math.cos(ph)) * 12 * walk + (st.bob || 0);
  const col = rgbs(P.coat), col2 = rgbs(P.coat2), skin = rgbs(P.skin), tilt = (st.tilt || 0) + Math.sin(t * .7 + P.sc * 5) * 1.1 + (st.talk ? Math.sin(t * 9) * 1.4 * st.talk : 0);
  const hipY = -455 - bob, shY = -768 - bob + br * .3, hr = 84, rx = hr * .86;
  const aL = st.aL || [5 + sw * 22, 14], aR = st.aR || [-6 - sw * 22, 16];
  // back arm
  limb(g, -98 * wd, shY + 18, aL[0], 168, aL[1], 150, 42 * wd, 34, col2);
  // legs
  g.lineCap = 'round';
  for (const s of [-1, 1]) { const a = s * sw * 26, ex = s * 40 * wd + Math.sin(a * Math.PI / 180) * 230, lift = (s * sw > .3 ? 40 * s * sw : 0); g.strokeStyle = rgbs([22, 28, 38]); g.lineWidth = 54 * wd; g.beginPath(); g.moveTo(s * 34 * wd, hipY); g.lineTo(ex, -58 - lift); g.stroke(); g.fillStyle = '#080c0f'; g.beginPath(); g.ellipse(ex + 20, -28 - lift, 56, 26, 0, 0, TAU); g.fill(); }
  // coat
  g.beginPath(); g.moveTo(-104 * wd, shY + 6); g.quadraticCurveTo(0, shY - 22, 104 * wd, shY + 6); g.lineTo(86 * wd, hipY); g.lineTo(118 * wd, hipY + 175 + sw * 12); g.lineTo(-118 * wd, hipY + 175 - sw * 12); g.lineTo(-86 * wd, hipY); g.closePath();
  g.fillStyle = vgrad(g, shY, hipY + 175, [[0, col], [1, col2]]); g.fill();
  g.fillStyle = rgbs(P.accent, .8); g.fillRect(-3, shY + 14, 6, hipY - shY + 160);
  for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-20, shY + 80 + i * 74, 6.5, 0, TAU); g.fill(); }
  g.fillStyle = rgbs(P.coat2); g.fillRect(-88 * wd, hipY - 8, 176 * wd, 16);
  g.fillStyle = rgbs(mixc(P.coat, [0, 0, 0], .3)); g.beginPath(); g.moveTo(-34, shY - 8); g.lineTo(0, shY + 46); g.lineTo(34, shY - 8); g.lineTo(18, shY - 12); g.lineTo(0, shY + 14); g.lineTo(-18, shY - 12); g.closePath(); g.fill();
  // neck
  g.fillStyle = skin; g.fillRect(-21, shY - 58, 42, 66); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-21, shY - 58, 42, 20);
  // head
  g.save(); g.translate((st.look || 0) * 5, shY - 96 + br * .4); g.rotate(tilt * Math.PI / 180);
  const look = (st.look ?? 0.55), emo = st.emo || '';
  if (P.beard && P.hat !== 'beanie') { g.fillStyle = rgbs(P.beard); g.beginPath(); g.moveTo(-rx - 2, 6); g.quadraticCurveTo(-rx, 108, 0, 120); g.quadraticCurveTo(rx, 108, rx + 2, 6); g.quadraticCurveTo(0, 54, -rx - 2, 6); g.fill(); }
  if (P.beard && P.hat === 'beanie') { g.fillStyle = rgbs(P.beard); g.beginPath(); g.moveTo(-rx - 3, 0); g.quadraticCurveTo(-rx - 4, 112, 0, 122); g.quadraticCurveTo(rx + 4, 112, rx + 3, 0); g.quadraticCurveTo(0, 48, -rx - 3, 0); g.fill(); }
  g.fillStyle = skin; g.beginPath(); g.ellipse(0, 0, rx, hr, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(-rx, 8, 11, 18, 0, 0, TAU); g.ellipse(rx, 8, 11, 18, 0, 0, TAU); g.fill();
  const sh = g.createLinearGradient(-rx, 0, rx, 0); sh.addColorStop(0, 'rgba(255,255,255,.05)'); sh.addColorStop(.6, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.22)'); g.fillStyle = sh; g.beginPath(); g.ellipse(0, 0, rx, hr, 0, 0, TAU); g.fill();
  if (P.stubble) { g.fillStyle = 'rgba(30,22,18,.4)'; g.beginPath(); g.ellipse(0, 30, rx * .92, hr * .62, 0, 0, Math.PI); g.fill(); }
  if (P.hat === 'hood') { g.save(); g.beginPath(); g.ellipse(0, 0, rx + 10, hr + 10, 0, 0, TAU); g.clip(); g.fillStyle = rgbs(P.coat); g.fillRect(-200, -200, 400, 200 - hr * .5); g.fillStyle = rgbs(P.hair); g.beginPath(); g.ellipse(0, -hr * .46, rx * .9, 24, 0, 0, Math.PI); g.fill(); g.restore(); g.strokeStyle = rgbs(P.coat); g.lineWidth = 26; g.beginPath(); g.ellipse(0, -2, rx + 12, hr + 8, 0, 0, TAU); g.stroke(); g.strokeStyle = rgbs(P.coat2); g.lineWidth = 3; g.beginPath(); g.ellipse(0, -2, rx - 2, hr - 4, 0, Math.PI * .1, Math.PI * .9); g.stroke(); }
  if (P.hat === 'scarf') { g.save(); g.beginPath(); g.ellipse(0, 0, rx + 12, hr + 12, 0, 0, TAU); g.clip(); g.fillStyle = rgbs(P.scarf); g.fillRect(-200, -200, 400, 200 - hr * .42); g.restore(); g.strokeStyle = rgbs(P.scarf); g.lineWidth = 28; g.beginPath(); g.ellipse(0, -2, rx + 13, hr + 9, 0, 0, TAU); g.stroke(); g.fillStyle = rgbs(P.scarf); g.beginPath(); g.moveTo(-rx - 8, 44); g.quadraticCurveTo(-rx, 118, -10, 128); g.lineTo(10, 126); g.quadraticCurveTo(rx, 118, rx + 8, 44); g.quadraticCurveTo(rx * .6, 92, 0, 98); g.quadraticCurveTo(-rx * .6, 92, -rx - 8, 44); g.fill(); g.strokeStyle = rgbs(mixc(P.scarf, [0, 0, 0], .35)); g.lineWidth = 3; g.beginPath(); g.moveTo(-rx + 4, 20); g.quadraticCurveTo(0, 78, rx - 4, 20); g.stroke(); }
  if (P.hat === 'cap') { g.fillStyle = rgbs([12, 20, 34]); g.beginPath(); g.ellipse(0, -52, rx + 8, 50, 0, Math.PI, TAU); g.fill(); g.fillRect(-rx - 8, -56, (rx + 8) * 2, 22); g.fillStyle = rgbs([8, 12, 20]); g.beginPath(); g.ellipse(34, -34, 84, 12, 0, 0, TAU); g.fill(); g.fillStyle = rgbs(P.accent); g.beginPath(); g.arc(0, -78, 10, 0, TAU); g.fill(); g.fillStyle = rgbs(P.hair); g.beginPath(); g.ellipse(-rx * .92, -2, 18, 38, 0, 0, TAU); g.fill(); }
  if (P.hat === 'beanie') { g.fillStyle = rgbs([76, 82, 86]); g.beginPath(); g.ellipse(0, -46, rx + 6, 56, 0, Math.PI, TAU); g.fill(); g.fillRect(-rx - 6, -50, (rx + 6) * 2, 26); g.fillStyle = rgbs([56, 62, 66]); for (let i = -4; i <= 4; i++) g.fillRect(i * 16 - 3, -50, 6, 26); }
  if (P.hat === 'flatcap') { g.fillStyle = rgbs([52, 54, 44]); g.beginPath(); g.ellipse(-2, -52, rx + 12, 40, 0, Math.PI, TAU); g.fill(); g.beginPath(); g.ellipse(52, -40, 70, 14, .12, 0, TAU); g.fill(); g.fillStyle = rgbs(P.hair); g.fillRect(-rx + 6, -48, 16, 40); }
  if (P.hat === 'sailor') { g.fillStyle = rgbs([220, 232, 244]); g.beginPath(); g.ellipse(0, -52, rx + 6, 40, 0, Math.PI, TAU); g.fill(); g.fillStyle = rgbs([40, 70, 110]); g.fillRect(-rx - 6, -56, (rx + 6) * 2, 14); g.fillStyle = rgbs(P.hair); g.beginPath(); g.ellipse(-rx * .94, 0, 12, 34, 0, 0, TAU); g.ellipse(rx * .94, 0, 12, 34, 0, 0, TAU); g.fill(); }
  // face
  const fx = look * 12, eyeY = -4, ex = 27, blink = (Math.sin(t * 1.3 + P.sc * 11) > .985) ? .1 : 1;
  for (const s of [-1, 1]) { const x0 = fx + s * ex * (s * look > 0 ? .86 : 1); g.fillStyle = 'rgba(255,255,255,.97)'; g.beginPath(); g.ellipse(x0, eyeY, 14, 11.5 * blink * (emo === 'fear' ? 1.3 : 1), 0, 0, TAU); g.fill(); g.fillStyle = P.ghost ? '#0a1a2a' : '#140c08'; g.beginPath(); g.ellipse(x0 + look * 5, eyeY + 1, 6.4, 6.8 * blink, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(x0 + look * 5 - 2, eyeY - 2, 2, 0, TAU); g.fill(); }
  g.strokeStyle = rgbs(mixc(P.hair, [0, 0, 0], .1), .95); g.lineWidth = 6.5; g.lineCap = 'round';
  const bB = eyeY - 26, tune = { '': [0, -1], worry: [-9, 3], fear: [-11, -5], grim: [5, -3] }[emo] || [0, -1];
  for (const s of [-1, 1]) { const x0 = fx + s * ex, xin = x0 - s * 15, xout = x0 + s * 15; g.beginPath(); g.moveTo(xin, bB + tune[0]); g.lineTo(xout, bB + tune[1]); g.stroke(); }
  g.strokeStyle = rgbs(mixc(P.skin, [0, 0, 0], .38), .75); g.lineWidth = 4; g.beginPath(); g.moveTo(fx + 4, eyeY + 8); g.quadraticCurveTo(fx + 16 + look * 4, eyeY + 32, fx + 2, eyeY + 36); g.stroke();
  const m = clamp(st.talk || 0), mw = 25 + m * 7, my = 50, mh = 3 + m * 18; g.fillStyle = '#2a0f0e'; g.beginPath(); g.ellipse(fx + 2, my, mw * (.78 + m * .22), mh, 0, 0, TAU); g.fill();
  if (m > .35) { g.fillStyle = 'rgba(245,240,235,.92)'; g.fillRect(fx - mw * .5, my - mh + 1, mw, 5 + m * 4); }
  g.strokeStyle = rgbs(mixc(P.skin, [70, 10, 10], .5), .9); g.lineWidth = 4; g.beginPath(); g.ellipse(fx + 2, my, mw * (.78 + m * .22), mh, 0, 0, TAU); g.stroke();
  if (P.beard && P.hat === 'beanie') { g.fillStyle = rgbs(P.beard); g.beginPath(); g.ellipse(fx + 2, 33, 38, 11, 0, 0, TAU); g.fill(); }
  g.restore();
  // front arm (+ prop)
  const hand = limb(g, 98 * wd, shY + 18, aR[0], 168, aR[1], 150, 42 * wd, 34, col);
  g.fillStyle = rgbs(mixc(P.coat2, [0, 0, 0], .2)); g.beginPath(); g.arc(hand[2] * .0 + hand[0] - (hand[0] - hand[2]) * .12, hand[1] - (hand[1] - hand[3]) * .12, 21, 0, TAU); g.fill();
  g.fillStyle = skin; g.beginPath(); g.arc(hand[0], hand[1], 21, 0, TAU); g.fill();
  if (st.prop === 'lantern') { const lx = hand[0] + 6, ly = hand[1] + 14; g.strokeStyle = '#1a1a1a'; g.lineWidth = 5; g.beginPath(); g.arc(lx, ly - 24, 22, Math.PI, TAU); g.stroke(); g.fillStyle = '#2a2018'; g.fillRect(lx - 24, ly - 4, 48, 66); g.fillStyle = 'rgba(255,205,120,.95)'; g.fillRect(lx - 17, ly + 4, 34, 50); }
  g.restore();
  g.globalCompositeOperation = 'source-atop';
  const ld = st.lightDir ?? -1, rim = st.rim || [120, 190, 220];
  const lg = g.createLinearGradient(450 + ld * 260, 0, 450 - ld * 260, 0); lg.addColorStop(0, rgbs(rim, .42 * (st.rimAmt ?? 1))); lg.addColorStop(.3, rgbs(rim, .04)); lg.addColorStop(1, 'rgba(0,3,8,.5)'); g.fillStyle = lg; g.fillRect(0, 0, 900, 1300);
  const vg = g.createLinearGradient(0, 300, 0, 1190); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,3,8,.45)'); g.fillStyle = vg; g.fillRect(0, 0, 900, 1300);
  if (st.warm) { g.fillStyle = rgbs(st.warm[0], st.warm[1]); g.fillRect(0, 0, 900, 1300); }
  if (P.ghost) { const fgd = g.createLinearGradient(0, 700, 0, 1190); fgd.addColorStop(0, 'rgba(0,0,0,0)'); fgd.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = fgd; g.fillRect(0, 0, 900, 1300); }
  g.globalCompositeOperation = 'source-over';
  c.save(); c.globalAlpha = (st.alpha ?? 1) * (P.ghost ? .78 : 1) * (1 - (st.dim || 0) * .5); c.translate(x, y); c.scale(sc, sc); c.drawImage(_pc, -450, -1180); c.restore();
}
// speaking helper: amplitude of the line currently spoken by `sp`
function speak(sp, t) {
  const L = DATA.lines.find(l => l.sp === sp && t >= l.st && t <= l.st + l.dur); if (!L) return 0;
  const arr = DATA.lip[L.id]; if (!arr) return .5; const i = Math.floor((t - L.st) * 60); return arr[clamp(i, 0, arr.length - 1)] || 0;
}
function speakerNow(t) { const L = DATA.lines.find(l => t >= l.st - .1 && t <= l.st + l.dur + .2); return L ? L.sp : null; }
// ---------- ghosts
function drawGhost(c, x, y, s, t, o = {}) {
  const a = (o.a ?? 1), seed = o.seed ?? 0, col = o.col || [170, 215, 255]; c.save(); c.translate(x, y); c.scale(s * (o.f ?? 1), s); c.globalCompositeOperation = 'lighter';
  const tail = []; for (let i = 0; i < 16; i++) { const u = i / 15; tail.push([Math.sin(t * 2 + u * 5 + seed) * 40 * u + (o.drift || 0) * u * 90, 40 + u * (o.len ?? 360)]); }
  for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-60 + k * 6, 20); tail.forEach((p, i) => c.lineTo(p[0] - (60 - i * (3.2 + k)) * (1 - i / 17), p[1])); for (let i = tail.length - 1; i >= 0; i--) c.lineTo(tail[i][0] + (60 - i * (3.2 + k)) * (1 - i / 17), tail[i][1]); c.closePath();
    const g = c.createLinearGradient(0, 0, 0, 40 + (o.len ?? 360)); g.addColorStop(0, rgbs(col, .55 * a)); g.addColorStop(1, rgbs(col, 0)); c.fillStyle = g; c.fill(); }
  glow(c, 0, -10, 130, col, .4 * a);
  c.globalCompositeOperation = 'source-over'; c.fillStyle = rgbs([30, 50, 70], .55 * a); c.beginPath(); c.ellipse(0, 0, 54, 66, 0, 0, TAU); c.fill();
  c.fillStyle = rgbs([6, 10, 18], .95 * a); const mo = (o.mouth ?? .4); c.beginPath(); c.ellipse(-20, -10, 11, 17, 0, 0, TAU); c.ellipse(20, -10, 11, 17, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(0, 34, 13, 10 + mo * 24, 0, 0, TAU); c.fill();
  c.strokeStyle = rgbs(col, .85 * a); c.lineWidth = 3; c.beginPath(); c.ellipse(0, 0, 54, 66, 0, 0, TAU); c.stroke(); c.restore();
}
function drawHand(c, x, y, ang, s, a = 1, col = [190, 225, 245]) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s); c.globalAlpha = a;
  c.fillStyle = rgbs(col, .9); c.strokeStyle = rgbs([40, 70, 100], .8); c.lineWidth = 3; c.beginPath(); c.moveTo(-26, 40); c.lineTo(-26, -8); c.lineTo(26, -8); c.lineTo(26, 40); c.closePath(); c.fill();
  for (let i = 0; i < 4; i++) { const fx = -20 + i * 13, ln = 58 + (i === 1 || i === 2 ? 14 : 0) - (i === 0 ? 4 : 0); c.lineCap = 'round'; c.lineWidth = 11; c.strokeStyle = rgbs(col, .92); c.beginPath(); c.moveTo(fx, -4); c.quadraticCurveTo(fx + (i - 1.5) * 3, -ln * .6, fx + (i - 1.5) * 5, -ln); c.stroke(); }
  c.lineWidth = 12; c.beginPath(); c.moveTo(-24, 14); c.quadraticCurveTo(-52, -2, -50, -34); c.stroke(); c.restore();
}
