// ===== scenes 10-13 =====
function clockFace(sec, mins, tint) {
  c.save();
  const R = 380;
  const g = c.createRadialGradient(-80, -90, 20, 0, 0, R); g.addColorStop(0, '#2a2f36'); g.addColorStop(1, '#0c0e11');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, R + 30, 0, 7); c.fill();
  c.strokeStyle = rgba(tint, .9); c.lineWidth = 8; c.shadowColor = rgba(tint, 1); c.shadowBlur = 30; c.beginPath(); c.arc(0, 0, R + 30, 0, 7); c.stroke(); c.shadowBlur = 0;
  c.fillStyle = '#f4f0e6';
  for (let i = 0; i < 60; i++) { const a = i / 60 * 6.283 - 1.5708, big = i % 5 === 0; c.fillRect(0, 0, 0, 0); c.save(); c.translate(Math.cos(a) * (R - 20), Math.sin(a) * (R - 20)); c.rotate(a); c.fillRect(-(big ? 34 : 16), big ? -5 : -2, big ? 34 : 16, big ? 10 : 4); c.restore(); }
  const ma = mins / 60 * 6.283 - 1.5708, ha = (mins / 720) * 6.283 - 1.5708 + .6;
  c.lineCap = 'round'; c.strokeStyle = '#f4f0e6'; c.lineWidth = 22; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(ha) * 190, Math.sin(ha) * 190); c.stroke();
  c.lineWidth = 14; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(ma) * 290, Math.sin(ma) * 290); c.stroke();
  const sa = sec / 60 * 6.283 - 1.5708; c.strokeStyle = rgba(RED, 1); c.lineWidth = 6; c.shadowColor = rgba(RED, 1); c.shadowBlur = 24;
  c.beginPath(); c.moveTo(-Math.cos(sa) * 70, -Math.sin(sa) * 70); c.lineTo(Math.cos(sa) * 330, Math.sin(sa) * 330); c.stroke(); c.shadowBlur = 0;
  c.fillStyle = rgba(RED, 1); c.beginPath(); c.arc(0, 0, 18, 0, 7); c.fill();
  c.restore();
}
function tickSec(s) { const f = s - Math.floor(s); return Math.floor(s) + (f < .12 ? Math.sin(f / .12 * 3.14 * .5) * 1.0 + .0 : 1) * 0 + (1 - Math.exp(-f * 40)) + Math.exp(-f * 18) * 0.12 * Math.sin(f * 90); }
function city(t, glowK, tintWin, seed, dolly) {
  // three parallax layers of buildings
  for (let L = 0; L < 3; L++) {
    const z = 1050 - L * 330, r = rng(seed + L);
    let x = -2000;
    plane(c, 0, 640 + L * 80 - 120, z);
    const col = ['#0a0b10', '#06070a', '#030304'][L];
    while (x < 2000) {
      const w = 120 + r() * 200, h = 160 + r() * (520 - L * 90);
      c.fillStyle = col; c.fillRect(x, -h, w, h + 700);
      for (let wy = -h + 30; wy < 0; wy += 44) for (let wx = x + 16; wx < x + w - 24; wx += 36) if (r() > .62) { c.fillStyle = rgba(tintWin, (.35 + r() * .6) * (L === 2 ? 1 : .7)); c.fillRect(wx, wy, 14, 20); }
      x += w + 8 + r() * 30;
    }
  }
}
SCENES[9] = (u, t) => {
  bgGrad('#040304', '#0a0405');
  const sh = shake(t, 3);
  if (u < 3.0) {
    const e = eio(u / 3.0);
    cam({ x: lerp(220, 0, e) + sh[0], y: sh[1] - 40, z: lerp(-1700, -1100, e), yaw: lerp(-.12, 0, e), roll: lerp(.05, -.02, e) + sh[2], f: 1100 });
    c.save(); reset(c); c.globalCompositeOperation = 'lighter'; glow(c, W / 2, H / 2 - 80, 1000, [90, 120, 140], .18); c.restore();
    dof(14, () => { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 9; i++) { const p = proj(-1100 + i * 280, -600 + (i % 3) * 700, 300 + (i % 4) * 300); glow(c, p[0], p[1], 130, i % 2 ? AMB : [120, 160, 255], .35); } c.restore(); }, .8);
    plane(c, 0, 0, 0); const sec = u + 3.0;
    clockFace(tickSec(sec * .9), 14 + sec * .02, RED);
    dust(t, 91, 50, [200, 210, 255], { focus: 1000, alpha: .45 });
  } else {
    const k = u - 3.0, e = eio(k / 1.5);
    cam({ x: lerp(-260, 100, e) + sh[0], y: lerp(40, 0, e) + sh[1], z: lerp(-1700, -1300, e), pitch: -.02, roll: lerp(-.04, .03, e) + sh[2], f: 1100 });
    const g0 = clamp(k / 1.4);
    // horizon glow
    c.save(); reset(c); const hg = c.createLinearGradient(0, 600, 0, 1400); hg.addColorStop(0, rgba([255, 80, 20], 0)); hg.addColorStop(1, rgba([255, 120, 30], .9 * g0)); c.fillStyle = hg; c.fillRect(0, 600, W, 800);
    c.globalCompositeOperation = 'lighter'; glow(c, W / 2 + 80, 1250, 1400, [255, 90, 20], (.8 + .3 * Math.sin(t * 17) * .4) * g0); c.restore();
    city(t, g0, AMB, 5, k);
    c.save(); reset(c); c.globalCompositeOperation = 'lighter'; glow(c, W / 2 + 80, 1180, 700, [255, 160, 60], .35 * g0 * (.7 + .3 * Math.sin(t * 23))); c.restore();
    dust(t, 92, 90, [255, 120, 50], { focus: 800, alpha: .8, vy: -3, speed: 60 });
  }
};

function sunburst(x, y, r, a, col) { glow(c, x, y, r, col, a); c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = rgba(col, a * .5); c.lineWidth = 4; for (let i = 0; i < 16; i++) { const an = i / 16 * 6.283 + t0spin; c.beginPath(); c.moveTo(x + Math.cos(an) * r * .25, y + Math.sin(an) * r * .25); c.lineTo(x + Math.cos(an) * r * (i % 2 ? .9 : 1.5), y + Math.sin(an) * r * (i % 2 ? .9 : 1.5)); c.stroke(); } c.restore(); }
let t0spin = 0;
function satellite(x, y, s, rot, warn) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.fillStyle = '#9aa3b0'; rrect(c, -50, -34, 100, 68, 8); c.fill();
  c.fillStyle = '#1e3a6b'; for (const sd of [-1, 1]) { c.save(); c.translate(sd * 140, 0); c.fillRect(-80, -38, 160, 76); c.strokeStyle = 'rgba(160,200,255,.5)'; c.lineWidth = 2; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(-80 + i * 40, -38); c.lineTo(-80 + i * 40, 38); c.stroke(); } c.restore(); }
  c.fillStyle = '#c9ced6'; c.beginPath(); c.arc(0, -52, 22, 0, 7); c.fill();
  c.restore();
}
SCENES[10] = (u, t) => {
  const cold = u < 4.3;
  bgGrad('#020812', '#06101c');
  const sh = shake(t, 2.5);
  if (u < 1.7) { // time-lapse clock
    cam({ x: sh[0], y: sh[1], z: lerp(-1700, -1400, u / 1.7), roll: sh[2], f: 1100 });
    c.save(); reset(c); c.globalCompositeOperation = 'lighter'; glow(c, W / 2, H / 2 - 100, 1100, [70, 120, 190], .22); c.restore();
    plane(c, 0, 0, 0); const sp = u * u * 120; clockFace(sp * 1.0, 14 + sp / 60 * 4 + u * 3, CYN);
    dust(t, 93, 40, [180, 210, 255], { focus: 800, alpha: .4 });
  } else if (u < 4.3) {
    const k = u - 1.7, e = eio(k / 2.6);
    cam({ x: lerp(160, -160, e) + sh[0], y: sh[1], z: lerp(-1700, -1250, e), roll: lerp(.03, -.03, e) + sh[2], f: 1100 });
    // stars
    c.save(); reset(c); const r = rng(8); for (let i = 0; i < 200; i++) { const p = proj((r() * 2 - 1) * 4000, -400 - r() * 2800, 1500 + r() * 3000); c.fillStyle = rgba(WHT, .3 + .5 * Math.abs(Math.sin(t + i))); c.fillRect(p[0], p[1], 3, 3); } c.restore();
    c.save(); reset(c); c.globalCompositeOperation = 'lighter'; glow(c, W / 2 - 100, 1000, 1000, [60, 110, 200], .28); c.restore();
    city(t, 0, [170, 200, 255], 5, k);
    // sunrise-ish soft light band
    dust(t, 94, 60, [170, 210, 255], { focus: 900, alpha: .55, vy: .6 });
    slam('NO EXPLOSIONS', W / 2, 560, 120, 2.35 - 1.7, k, { fit: 900, fill: '#e8f2ff', glow: 40, glowCol: CYN, ls: 4 });
    if (k > 1.45) slam('NO FIRE', W / 2, 720, 190, 3.35 - 1.7, k, { fit: 800, fill: '#e8f2ff', glow: 40, glowCol: CYN });
  } else {
    // satellite explainer
    const k = u - 4.3; t0spin = t * .4;
    bgGrad('#02050e', '#060d1c');
    const e = eio(k / 5.2);
    cam({ x: lerp(-120, 120, e) + sh[0], y: lerp(60, -40, e) + sh[1], z: lerp(-1500, -1250, e), roll: lerp(-.03, .03, e) + sh[2], yaw: lerp(.05, -.05, e), f: 1100 });
    c.save(); reset(c); const r = rng(14); for (let i = 0; i < 150; i++) { const p = proj((r() * 2 - 1) * 3000, -300 - r() * 2800, 2000 + r() * 2500); c.fillStyle = rgba(WHT, .3 + .4 * Math.abs(Math.sin(t * 1.3 + i))); c.fillRect(p[0], p[1], 3, 3); } c.restore();
    // earth
    plane(c, 0, 0, 0);
    const eg = c.createRadialGradient(0, 3000, 1800, 0, 3000, 2300); eg.addColorStop(0, '#0b2a55'); eg.addColorStop(.97, '#1b5fa8'); eg.addColorStop(1, 'rgba(120,190,255,.0)');
    c.fillStyle = eg; c.beginPath(); c.arc(0, 3000, 2300, 0, 7); c.fill();
    c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(130,200,255,.55)'; c.lineWidth = 10; c.shadowColor = 'rgba(130,200,255,1)'; c.shadowBlur = 40; c.beginPath(); c.arc(0, 3000, 2000, 0, 7); c.stroke(); c.restore();
    // clouds layer
    const cl = [[-420, 960], [-120, 940], [200, 970], [480, 950], [-280, 980], [330, 990]];
    cl.forEach((q, i) => { for (let j = 0; j < 5; j++) { c.fillStyle = `rgba(230,240,255,${.5 - j * .05})`; c.beginPath(); c.ellipse(q[0] + j * 44 - 90, q[1] - Math.sin(j * 1.7 + i) * 18, 120 - j * 8, 42 - j * 2, 0, 0, 7); c.fill(); } });
    txt(c, 'HIGH-ALTITUDE CLOUDS', 0, 1080, { font: '700 30px "JetBrains Mono"', ls: 5, fill: rgba(WHT, .8), alpha: sm(2.5, 2.9, k) });
    const sat = [-250 + 50 * Math.sin(k * .6), 100]; const satA = eout((k - .5) / .8);
    if (k > .5) { c.save(); c.globalAlpha = satA; satellite(sat[0] - (1 - satA) * 400, sat[1], 1.1, -.12, false); c.restore();
      txt(c, 'EARLY-WARNING SATELLITE', sat[0], sat[1] - 150, { font: '700 28px "JetBrains Mono"', ls: 4, fill: rgba(CYN, 1), alpha: satA }); }
    // sun & beam
    const sun = [420, -380]; const sa = eout((k - 1.7) / .5);
    if (k > 1.7) { sunburst(sun[0], sun[1], 300, sa, [255, 220, 120]); txt(c, 'SUNLIGHT', sun[0] - 60, sun[1] + 180, { font: '700 30px "JetBrains Mono"', ls: 6, fill: rgba([255, 220, 120], 1), alpha: sa }); }
    const hitP = [120, 930];
    if (k > 2.0) { const f = clamp((k - 2.0) / .8); c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = rgba([255, 220, 120], .9); c.lineWidth = 12; c.shadowColor = '#ffd070'; c.shadowBlur = 30; c.beginPath(); c.moveTo(sun[0], sun[1]); c.lineTo(lerp(sun[0], hitP[0], f), lerp(sun[1], hitP[1], f)); c.stroke(); c.restore(); }
    if (k > 2.9) { // glint + reflected beam to satellite
      const g = clamp((k - 2.9) / .6), f = clamp((k - 3.0) / .9); c.save(); c.globalCompositeOperation = 'lighter';
      glow(c, hitP[0], hitP[1], 260 * g * (1 + .2 * Math.sin(k * 30)), [255, 240, 180], 1);
      c.strokeStyle = rgba([255, 240, 190], .95); c.lineWidth = 8; c.setLineDash([22, 12]); c.lineDashOffset = -k * 160; c.beginPath(); c.moveTo(hitP[0], hitP[1]); c.lineTo(lerp(hitP[0], sat[0], f), lerp(hitP[1], sat[1] + 40, f)); c.stroke(); c.setLineDash([]); c.restore(); }
    if (k > 4.0) { // satellite misreads
      const w = eout((k - 4.0) / .35), blink = Math.sin(k * 26) > 0 ? 1 : .55;
      c.save(); reset(c); const sp = proj(sat[0], sat[1], 0);
      c.globalAlpha = w; c.fillStyle = 'rgba(40,0,0,.92)'; rrect(c, sp[0] + 40, sp[1] - 300, 420, 170, 20); c.fill(); c.strokeStyle = rgba(RED, blink); c.lineWidth = 6; c.stroke();
      txt(c, '▲ MISSILE LAUNCH', sp[0] + 250, sp[1] - 245, { font: '800 40px "JetBrains Mono"', fill: rgba(RED, blink), fit: 380 });
      txt(c, 'CONFIDENCE: HIGH', sp[0] + 250, sp[1] - 180, { font: '700 30px "JetBrains Mono"', fill: '#fff', ls: 3 });
      if (k > 4.7) { const x = eout((k - 4.7) / .3); c.strokeStyle = '#fff'; c.lineWidth = 14; c.beginPath(); c.moveTo(sp[0] + 40, sp[1] - 300); c.lineTo(lerp(sp[0] + 40, sp[0] + 460, x), lerp(sp[1] - 300, sp[1] - 130, x)); c.stroke();
        txt(c, 'GLINT, NOT MISSILE', sp[0] + 250, sp[1] - 90, { font: '800 36px "JetBrains Mono"', fill: GRN.length ? '#5dffb0' : '#fff', alpha: x, ls: 2 }); }
      c.restore(); }
  }
};

// ---------- SCENE 12: legacy ----------
function crtOff(cx, cy, w, h, p) {
  // p 0..1 collapse animation (0 = on)
  const sy = p < .6 ? 1 - eio(p / .6) * .985 : .015, sx = p < .6 ? 1 : 1 - eio((p - .6) / .4);
  c.save(); c.translate(cx, cy); c.scale(sx, sy);
  c.fillStyle = '#05140c'; rrect(c, -w / 2, -h / 2, w, h, 30); c.fill();
  c.restore();
}
SCENES[11] = (u, t) => {
  const sh = shake(t, 2.5);
  if (u < 7.6) {
    const e = eio(u / 7.6);
    bgGrad('#0e0905', '#1a1008');
    cam({ x: lerp(-380, 320, e) + sh[0], y: lerp(-40, 30, e) + sh[1], z: lerp(-1500, -1050, e), yaw: lerp(.14, -.1, e), roll: lerp(-.03, .03, e) + sh[2], f: 1100 });
    // window with light shaft
    plane(c, 120, -520, 1100); c.fillStyle = '#ffd9a0'; const wg = c.createLinearGradient(0, 0, 0, 760); wg.addColorStop(0, '#e9c48a'); wg.addColorStop(1, '#b8672f'); c.fillStyle = wg; c.fillRect(0, 0, 520, 760);
    c.fillStyle = '#1a1008'; c.fillRect(250, 0, 20, 760); c.fillRect(0, 370, 520, 20);
    reset(c); c.save(); c.globalCompositeOperation = 'lighter';
    const a0 = proj(120, -520, 1100), a1 = proj(640, -520, 1100), b0 = proj(-700, 700, 150), b1 = proj(120, 900, 150);
    const sg = c.createLinearGradient(a0[0], a0[1], b0[0], b0[1]); sg.addColorStop(0, 'rgba(255,200,120,.45)'); sg.addColorStop(1, 'rgba(255,200,120,0)');
    poly(c, [a0, a1, b1, b0], sg); glow(c, a0[0] + 120, a0[1] + 100, 900, [255, 190, 110], .35); c.restore();
    // silhouette seated by the window
    plane(c, -150, 330, 700); silhouette(0, 0, 1.55, false); reset(c);
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .5; plane(c, -150, 330, 700); c.lineWidth = 6; c.strokeStyle = 'rgba(255,200,130,.9)'; c.shadowColor = '#ffc078'; c.shadowBlur = 24; c.beginPath(); c.moveTo(70, -300); c.bezierCurveTo(120, -250, 130, -150, 100, -90); c.stroke(); c.restore();
    // foreground table edge + cup (dof)
    dof(10, () => { plane(c, 0, 520, 200); c.fillStyle = '#0a0705'; c.fillRect(-1600, 0, 3200, 900); }, 1);
    dust(t, 101, 120, [255, 214, 150], { focus: 900, alpha: .75, vy: -.5, speed: 12 });
    reset(c);
    const a = eout((u - 2.9) / .6), o = 1 - sm(7.0, 7.4, u);
    txt(c, 'STANISLAV PETROV', 70, 330, { font: '700 36px "JetBrains Mono"', align: 'left', ls: 8, fill: rgba(AMB, 1), alpha: a * o });
    odometer19(a * o, u);
  } else if (u < 10.4) {
    const k = u - 7.6;
    bgGrad('#010504', '#020a06');
    cam({ x: sh[0], y: sh[1], z: lerp(-1250, -800, eio(k / 2.8)), roll: sh[2] + lerp(-.04, .04, k / 2.8), f: 1100 });
    plane(c, -450, -520, 600);
    const off = clamp((k - 2.1) / .7);
    c.fillStyle = '#0b100e'; rrect(c, -50, -50, 1000, 1100, 60); c.fill();
    if (off < 1) {
      c.save(); c.translate(450, 500); const sy = off < .6 ? 1 - eio(off / .6) * .985 : .015, sx = off < .6 ? 1 : 1 - eio((off - .6) / .4); c.scale(sx, sy); c.translate(-450, -500);
      rrect(c, 0, 0, 900, 1000, 30); c.fillStyle = off > 0 ? '#5f8f78' : '#12040a'; c.fill(); c.clip();
      if (off === 0) { c.fillStyle = Math.sin(k * 18) > 0 ? '#2a0306' : '#150204'; c.fillRect(0, 0, 900, 1000); txt(c, '▲', 450, 330, { size: 260, fill: '#ff3b30', glow: 40 }); txt(c, 'LAUNCH', 450, 560, { font: '800 120px "JetBrains Mono"', fill: '#ff3b30', glow: 40 }); txt(c, '×5', 450, 700, { font: '800 120px "JetBrains Mono"', fill: '#ff3b30' }); c.fillStyle = 'rgba(0,0,0,.3)'; for (let y = 0; y < 1000; y += 6) c.fillRect(0, y, 900, 2); }
      c.restore();
    }
    reset(c); c.save(); c.globalCompositeOperation = 'lighter'; const sp = proj(0, 0, 600); glow(c, sp[0], sp[1], 1000, [255, 50, 40], .3 * (1 - off)); c.restore();
    // human silhouette small in foreground
    plane(c, 0, 1500, 300); c.save(); silhouette(0, 0, 3.4, false); c.restore(); reset(c);
    dust(t, 102, 60, [255, 90, 70], { focus: 700, alpha: .4 });
  } else {
    const k = u - 10.4, e = eio(k / 1.9);
    bgGrad('#010206', '#02040a');
    c.save(); reset(c); const r = rng(3); for (let i = 0; i < 220; i++) { const p = proj((r() * 2 - 1) * 4500, (r() * 2 - 1) * 4500, 2500 + r() * 3000); c.fillStyle = rgba(WHT, .3 + .5 * r()); c.fillRect(p[0], p[1], 3, 3); } c.restore();
    cam({ x: lerp(-200, 120, e) + sh[0], y: lerp(120, -80, e) + sh[1], z: lerp(-1700, -3600, e), roll: lerp(.1, -.04, e) + sh[2], f: 1100 });
    globe(c, 1000, lerp(20, 60, e), 40, { landCol: [255, 200, 120], atmo: [255, 170, 90], nightLights: 1.4 * eout(k / .9), oceanA: .03, landA: .8 });
    if (k > .1) slam('WE ARE ALL', W / 2, 520, 120, 10.45 - 10.4 + .2, k, { fit: 900, fill: '#fff4dc', glow: 40, glowCol: AMB, ls: 4 });
    if (k > .8) slam('STILL HERE', W / 2, 680, 190, 10.45 - 10.4 + 1.0, k, { fit: 900, fill: '#ffd070', glow: 60, glowCol: AMB });
  }
};
function odometer19(a, u) {
  // years
  c.save(); reset(c); c.globalAlpha = a;
  txt(c, '1939', 70, 450, { font: '800 150px "Inter Display"', align: 'left', fill: '#f4f0e6' });
  txt(c, '—', 480, 440, { font: '800 90px "Inter Display"', align: 'left', fill: rgba(AMB, 1) });
  const lit = sm(2.8, 3.1, u);
  txt(c, '2017', 70, 600, { font: '800 150px "Inter Display"', align: 'left', fill: '#f4f0e6', alpha: lit });
  c.restore();
}

// ---------- SCENE 13: the button, untouched ----------
SCENES[12] = (u, t) => {
  bgGrad('#02030a', '#06040a');
  const sh = shake(t, 2);
  const th = lerp(.35, -.2, eio(u / 5.9)), rad = lerp(820, 1500, eio(u / 5.9)), hgt = lerp(-560, -430, eio(u / 5.9));
  cam(Object.assign(lookAt(Math.sin(th) * rad, hgt, -Math.cos(th) * rad, 0, -120, 0), { roll: .03 * Math.sin(u * .6) + sh[2], f: 1050 }));
  C.x += sh[0]; C.y += sh[1];
  const dim = 1 - sm(3.6, 5.0, u);
  dust(t, 111, 60, [200, 170, 160], { focus: 900, alpha: .5 });
  drawButton(t, 0, .5 * dim + .08, true);
  reset(c);
  if (u > 2.6) {
    const a = eout((u - 2.6) / .8);
    txt(c, 'STANISLAV PETROV', W / 2, 560, { size: 76, fill: '#f4f0e6', ls: 6, alpha: a, fit: 900 });
    txt(c, '1939 — 2017', W / 2, 650, { font: '700 44px "JetBrains Mono"', ls: 10, fill: rgba(AMB, 1), alpha: a });
    txt(c, 'THE MAN WHO DIDN\'T PRESS THE BUTTON', W / 2, 740, { font: '700 28px "JetBrains Mono"', ls: 3, fill: rgba(WHT, .8), alpha: eout((u - 3.1) / .8), fit: 900 });
  }
};
