// ===== scenes 5-9 =====
const mapXZ = (lon, lat) => [lon * 6, lat * 6];
function drawMap(t, col, alpha = 1) {
  c.save(); reset(c); c.globalCompositeOperation = 'lighter';
  for (const m of MAPPTS) {
    const q = mapXZ(m[0], m[1]); const p = proj(q[0], 0, q[1]); if (p[3] < 50) continue;
    const sz = 5.2 * p[2] + .5; c.fillStyle = rgba(col, .42 * alpha); c.fillRect(p[0] - sz / 2, p[1] - sz / 2, sz, sz);
  }
  // graticule
  c.strokeStyle = rgba(col, .08 * alpha); c.lineWidth = 1.2;
  for (let lon = -180; lon <= 180; lon += 30) { const a = mapXZ(lon, -60), b = mapXZ(lon, 85), p = proj(a[0], 0, a[1]), q = proj(b[0], 0, b[1]); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke(); }
  for (let lat = -60; lat <= 80; lat += 20) { const a = mapXZ(-180, lat), b = mapXZ(180, lat), p = proj(a[0], 0, a[1]), q = proj(b[0], 0, b[1]); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke(); }
  c.restore();
}
const LAUNCH = [[-102, 44], [-98, 39], [-108, 41], [-94, 36], [-111, 46]];
const TARGET = [37.6, 55.7];
function arcPt(i, f) {
  const a = mapXZ(LAUNCH[i][0], LAUNCH[i][1]), b = mapXZ(TARGET[0] + (i - 2) * 6, TARGET[1] + (i - 2) * 2);
  const x = lerp(a[0], b[0], f), z = lerp(a[1], b[1], f) + 30 * Math.sin(f * Math.PI) * (i - 2);
  return proj(x, -340 * Math.sin(f * Math.PI) - 4, z);
}
function missile(i, f, col, a = 1) {
  if (f <= 0) return;
  c.save(); reset(c); c.globalCompositeOperation = 'lighter';
  c.lineWidth = 3; c.strokeStyle = rgba(col, .45 * a); c.setLineDash([10, 10]); c.beginPath();
  for (let k = 0; k <= 40; k++) { const p = arcPt(i, k / 40 * 0.92 + 0); k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); } c.stroke(); c.setLineDash([]);
  c.lineWidth = 6; c.strokeStyle = rgba(col, .9 * a); c.beginPath();
  for (let k = 0; k <= 40; k++) { const p = arcPt(i, Math.max(0, f - .14) + k / 40 * Math.min(f, .14)); k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); } c.stroke();
  const h = arcPt(i, f); glow(c, h[0], h[1], 90 * h[2] + 30, col, a); c.fillStyle = '#fff'; c.beginPath(); c.arc(h[0], h[1], 7, 0, 7); c.fill();
  c.restore();
}
function mapCam(u, fromTop) {
  const sh = shake(u, 5);
  const e = eio(clamp(u / 10)), swoop = 1 - eout((u - fromTop) / 1.2);
  const px = lerp(-380, -20, e) + sh[0], py = lerp(-900, -1050, e) - swoop * 1400 + sh[1], pz = lerp(-420, -560, e) + 220 * swoop;
  cam(Object.assign(lookAt(px, py, pz, -240 + e * 150, 0, 300), { roll: lerp(.08, -.05, e) + sh[2], f: 1080 }));
}
function mapLabels(u, t, showUSSR = true) {
  const a = mapXZ(-100, 44), b = mapXZ(37.6, 55.7), pa = proj(a[0], 0, a[1]), pb = proj(b[0], 0, b[1]);
  c.save(); reset(c);
  txt(c, 'USA', pa[0], pa[1] + 70, { font: '700 44px "JetBrains Mono"', ls: 8, fill: rgba(CYN, 1) });
  c.strokeStyle = rgba(CYN, .8); c.lineWidth = 3; c.beginPath(); c.arc(pa[0], pa[1], 20, 0, 7); c.stroke();
  if (showUSSR) {
    txt(c, 'USSR', pb[0], pb[1] + 80, { font: '700 44px "JetBrains Mono"', ls: 8, fill: rgba(RED, 1) });
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 2; i++) { const ph = (u * .8 + i * .5) % 1; c.strokeStyle = rgba(RED, (1 - ph) * .8); c.lineWidth = 3; c.beginPath(); c.arc(pb[0], pb[1], 14 + ph * 80, 0, 7); c.stroke(); }
    c.fillStyle = rgba(RED, 1); c.beginPath(); c.arc(pb[0], pb[1], 11, 0, 7); c.fill();
  }
  c.restore();
}

// ---------- SCENE 5: midnight clock -> alarm -> first missile ----------
SCENES[4] = (u, t) => {
  if (u < 2.9) {
    bgGrad('#02050a', '#05080d');
    const sh = shake(t, 3), e = eio(u / 2.9);
    cam({ x: lerp(-60, 60, e) + sh[0], y: sh[1], z: lerp(-1700, -1350, e), yaw: lerp(.08, -.04, e), roll: lerp(-.06, .03, e) + sh[2], f: 1100 });
    const s = Math.floor(u - 2.3), hh = s < 0 ? '23' : '00', mm = s < 0 ? '59' : '00', ss = s < 0 ? 60 + s : s;
    const label = `${hh}:${mm}:${String(ss).padStart(2, '0')}`;
    const tick = (u - 2.3) - Math.floor(u - 2.3);
    plane(c, -400, -130, 0);
    c.font = '800 175px "JetBrains Mono"'; c.textAlign = 'left'; c.textBaseline = 'middle';
    c.save(); c.shadowColor = rgba(RED, 1); c.shadowBlur = 40; c.fillStyle = s >= 0 ? '#ff5148' : '#d8e8e0'; c.fillText(label, 0, 0); c.restore();
    c.fillStyle = 'rgba(255,255,255,' + (.22 * Math.exp(-tick * 12)) + ')'; c.fillRect(-20, -110, 860, 220);
    txt(c, 'SERPUKHOV-15 · 26 SEPT 1983', 0, 150, { font: '700 30px "JetBrains Mono"', align: 'left', ls: 5, fill: rgba(WHT, .55) });
    // seconds ring
    plane(c, 0, 0, 200); c.strokeStyle = rgba(WHT, .12); c.lineWidth = 3; for (let i = 0; i < 60; i++) { const a = i / 60 * 6.283; c.beginPath(); c.moveTo(Math.cos(a) * 700, Math.sin(a) * 700); c.lineTo(Math.cos(a) * (i % 5 ? 730 : 770), Math.sin(a) * (i % 5 ? 730 : 770)); c.stroke(); }
    c.strokeStyle = rgba(RED, .9); c.lineWidth = 6; c.beginPath(); c.arc(0, 0, 700, -1.57, -1.57 + ((u + 3) % 1) * 6.283); c.stroke();
    dust(t, 51, 70, [200, 220, 255], { focus: 800, alpha: .4 });
    slam('JUST AFTER MIDNIGHT', W / 2, 380, 70, 1.3, u, { fit: 900, fill: '#f4f0e6', ls: 6, font: '800 70px "Inter Display"' });
  } else if (u < 4.1) {
    const k = u - 2.9, st = Math.sin(k * 25) > 0;
    bgGrad(st ? '#3a0504' : '#120202', st ? '#600806' : '#1c0303');
    const sh = shake(t, 16, 40);
    cam({ x: sh[0] * 6, y: sh[1] * 6, z: -1200, roll: sh[2] * 3 + Math.sin(k * 6) * .05, f: 1100 });
    // rotating beacon cones
    c.save(); reset(c); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 2; i++) {
      const a = k * 9 + i * 3.1416, ox = W / 2, oy = H / 2 - 120;
      const g = c.createLinearGradient(ox, oy, ox + Math.cos(a) * 1600, oy + Math.sin(a) * 700);
      g.addColorStop(0, rgba(RED, .85)); g.addColorStop(1, rgba(RED, 0)); c.fillStyle = g;
      c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox + Math.cos(a - .22) * 1700, oy + Math.sin(a - .22) * 800); c.lineTo(ox + Math.cos(a + .22) * 1700, oy + Math.sin(a + .22) * 800); c.closePath(); c.fill();
    }
    glow(c, W / 2, H / 2 - 120, 700, RED, st ? .9 : .5); c.restore();
    dust(t, 52, 60, [255, 90, 70], { focus: 300, alpha: .8, speed: 80 });
    reset(c);
    const sc = 1 + .06 * Math.sin(k * 40);
    slam('ALARM', W / 2, 760, 300, 2.9, u, { fit: 940, fill: st ? '#fff' : '#ff2b22', glow: 90, pop: 1.1, sx: 1, rot: Math.sin(k * 30) * .02 });
    txt(c, 'LAUNCH DETECTED', W / 2, 960, { size: 70, ls: 10, fill: rgba(RED, 1), alpha: sm(.35, .5, k) * (st ? 1 : .6), font: '700 56px "JetBrains Mono"' });
  } else {
    const k = u - 4.1;
    bgGrad('#02060a', '#050c12');
    mapCam(k, 0.0);
    drawMap(t, CYN, sm(0, .8, k));
    mapLabels(k, t, true);
    const f = clamp((u - 6.1) / 8) ;
    missile(0, k > 1.8 ? Math.min(.8, .02 + (u - 6.1) / 9 * 1) : 0, RED, 1);
    if (u > 6.1) { const l = arcPt(0, 0); glow(c, l[0], l[1], 120, RED, Math.max(0, 1 - (u - 6.1) * 1.3)); }
    dust(t, 53, 40, CYN, { focus: 1100, alpha: .3 });
    reset(c);
    // HUD
    const hu = eout(k / .5);
    txt(c, 'EARLY WARNING SYSTEM', 70, 330, { font: '700 32px "JetBrains Mono"', align: 'left', ls: 5, fill: rgba(CYN, 1), alpha: hu });
    txt(c, 'MISSILES DETECTED', 70, 392, { font: '700 32px "JetBrains Mono"', align: 'left', ls: 5, fill: rgba(WHT, .8), alpha: hu });
    const n = u > 6.1 ? 1 : 0;
    txt(c, String(n), 70, 520, { font: '800 190px "Inter Display"', align: 'left', fill: n ? '#ff3b30' : '#444', glow: n ? 40 : 0, alpha: hu });
  }
};

// ---------- SCENE 6: five missiles, LAUNCH, confidence ----------
SCENES[5] = (u, t) => {
  bgGrad('#02060a', '#050c12');
  mapCam(u + 4.1 + 1.3, -9);
  drawMap(t, CYN, 1);
  mapLabels(u, t, true);
  const T0 = [0, .77, 1.81, 2.44, 2.9];
  let cnt = 1;
  for (let i = 0; i < 5; i++) {
    const L = i === 0 ? -1.6 : T0[i];
    const f = i === 0 ? Math.min(.8, .02 + (u + 1.6) / 9) : (u > L ? Math.min(.8, .02 + (u - L) / 9) : 0);
    if (i > 0 && u > L) cnt++;
    missile(i, f, RED, 1);
    if (i > 0 && u > L && u < L + .8) { const l = arcPt(i, 0); c.save(); reset(c); c.globalCompositeOperation = 'lighter'; glow(c, l[0], l[1], 180 * (1 - (u - L)), RED, 1 - (u - L) / .8); c.strokeStyle = rgba(WHT, 1 - (u - L) / .8); c.lineWidth = 4; c.beginPath(); c.arc(l[0], l[1], 20 + (u - L) * 160, 0, 7); c.stroke(); c.restore(); }
  }
  dust(t, 54, 40, CYN, { focus: 1100, alpha: .3 });
  reset(c);
  txt(c, 'EARLY WARNING SYSTEM', 70, 330, { font: '700 32px "JetBrains Mono"', align: 'left', ls: 5, fill: rgba(CYN, 1) });
  txt(c, 'MISSILES DETECTED', 70, 392, { font: '700 32px "JetBrains Mono"', align: 'left', ls: 5, fill: rgba(WHT, .8) });
  // counter with pop each time it changes
  const times = [-9, .77, 1.81, 2.44, 2.9]; let last = 0; times.forEach((tm, i) => { if (u >= tm) last = tm; });
  const pk = u - last, popS = 1 + .35 * Math.exp(-pk * 10);
  txt(c, String(cnt), 70, 520, { font: '800 190px "Inter Display"', align: 'left', fill: '#ff3b30', glow: 40, sx: popS, sy: popS });
  if (u > 5.9) { // terminal panel
    const k = u - 5.9, a = eout(k / .3), px = 70, py = 740, pw = 820, ph = 330;
    c.save(); c.globalAlpha = a; rrect(c, px, py, pw, ph, 18); c.fillStyle = 'rgba(0,10,6,.88)'; c.fill(); c.strokeStyle = rgba(RED, .9); c.lineWidth = 4; c.stroke();
    txt(c, 'SYSTEM STATUS', px + 36, py + 46, { font: '700 28px "JetBrains Mono"', align: 'left', ls: 5, fill: rgba(WHT, .6) });
    const word = '> LAUNCH'; const shown = word.slice(0, Math.floor(k * 14));
    c.save(); reset(c); const flick = .75 + .25 * Math.sin(u * 40);
    txt(c, shown + (Math.sin(u * 14) > 0 ? '_' : ''), px + 36, py + 140, { font: '800 118px "JetBrains Mono"', align: 'left', fill: '#ff3b30', glow: 40, alpha: flick }); c.restore();
    txt(c, 'CONFIDENCE', px + 36, py + 240, { font: '700 32px "JetBrains Mono"', align: 'left', ls: 6, fill: rgba(WHT, .85) });
    const bar = eio((u - 6.8) / 2.3); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(px + 36, py + 270, 600, 30);
    c.fillStyle = '#ff3b30'; c.fillRect(px + 36, py + 270, 600 * bar, 30);
    txt(c, bar > .98 ? 'HIGH' : Math.floor(bar * 99) + '%', px + 670, py + 285, { font: '800 36px "JetBrains Mono"', align: 'left', fill: bar > .98 ? '#ff3b30' : '#fff' });
    c.restore();
  }
};

// ---------- SCENE 7: chain of command ----------
SCENES[6] = (u, t) => {
  bgGrad('#040508', '#0a0508');
  const e = eio(clamp(u / 5.2)), pull = eio(clamp((u - 5.0) / 1.4));
  const sh = shake(t, 3);
  cam({ x: lerp(-60, 0, e) + sh[0], y: lerp(120, 1180, e) - pull * 1200 + sh[1], z: lerp(-1300, -1250, e) - pull * 800, yaw: lerp(.08, -.03, e), roll: lerp(-.05, .05, e) + sh[2], f: 1100 });
  const nodes = [['PETROV', 'DUTY OFFICER', .3], ['COMMAND CENTRE', 'ESCALATE', 1.93], ['SOVIET LEADERS', 'DECISION', 2.9], ['COUNTER-STRIKE', 'FULL SCALE', 3.9]];
  // spine
  for (let i = 0; i < 4; i++) {
    const x = (i % 2 ? 50 : -50), y = i * 560; const on = u > nodes[i][2], k = clamp((u - nodes[i][2]) / .4);
    plane(c, x - 340, y - 110, 0);
    const col = i === 3 ? RED : (i === 0 ? GRN : AMB);
    c.save(); rrect(c, 0, 0, 680, 220, 24); c.fillStyle = on ? 'rgba(12,8,8,.9)' : 'rgba(255,255,255,.04)'; c.fill(); c.lineWidth = 5; c.strokeStyle = on ? rgba(col, 1) : 'rgba(255,255,255,.15)'; c.shadowColor = rgba(col, 1); c.shadowBlur = on ? 40 * (.5 + k) : 0; c.stroke(); c.restore();
    txt(c, String(i + 1).padStart(2, '0'), 36, 52, { font: '700 30px "JetBrains Mono"', align: 'left', fill: rgba(col, on ? 1 : .3), ls: 4 });
    txt(c, nodes[i][0], 340, 108, { size: 56, fill: on ? '#fff' : 'rgba(255,255,255,.25)', ls: 1, fit: 620 });
    txt(c, nodes[i][1], 340, 170, { font: '700 28px "JetBrains Mono"', fill: rgba(col, on ? 1 : .25), ls: 8 });
    if (i < 3) { // connector with flowing pulse
      const x2 = ((i + 1) % 2 ? 50 : -50), y2 = (i + 1) * 560, ln = nodes[i + 1][2];
      const f = clamp((u - nodes[i + 1][2] + .7) / .7), p0 = [x, y + 110], p1 = [x2, y2 - 110];
      reset(c); const a = proj(p0[0], p0[1], 0), b = proj(p1[0], p1[1], 0);
      c.save(); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 4; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
      c.globalCompositeOperation = 'lighter'; c.strokeStyle = rgba(AMB, .95); c.lineWidth = 7; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(lerp(a[0], b[0], f), lerp(a[1], b[1], f)); c.stroke();
      if (f > 0 && f < 1) glow(c, lerp(a[0], b[0], f), lerp(a[1], b[1], f), 80, AMB, 1); c.restore();
    }
  }
  // arsenal swarm erupting from final node
  if (u > 4.7) {
    const k = u - 4.7; const r = rng(33); c.save(); reset(c); c.globalCompositeOperation = 'lighter';
    const o = proj(90, 3 * 560 + 120, 0);
    for (let i = 0; i < 220; i++) { const a = -Math.PI / 2 + (r() - .5) * 2.6, v = 300 + r() * 1400, d = v * eout(k * 1.2 - r() * .3); const y = -Math.sin(a + 1.57) * 0; const px = o[0] + Math.cos(a) * d * .9, py = o[1] + Math.sin(a) * d * 1.3 - 40 * k; c.fillStyle = rgba(r() > .3 ? RED : AMB, clamp(k * 3) * .85); c.fillRect(px, py, 7, 7); c.fillStyle = rgba(RED, .15); c.fillRect(px - 2, py, 3, 120 * r()); }
    glow(c, o[0], o[1], 700, RED, clamp(k * 1.2) * .6); c.restore();
  }
  dust(t, 61, 60, [255, 150, 90], { focus: 900, alpha: .45, vy: -2 });
  // countdown ring
  if (u > 6.55) {
    const k = u - 6.55, a = eout(k / .35); reset(c); c.save(); c.globalAlpha = a; c.fillStyle = 'rgba(0,0,0,.88)'; c.fillRect(0, 0, W, H);
    const cx = W / 2, cy = 820, R = 330 * (1 + .02 * Math.sin(u * 8));
    c.lineWidth = 26; c.strokeStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke();
    const rem = 1 - clamp(k / 1.2) * .9; c.strokeStyle = '#ff3b30'; c.shadowColor = '#ff3b30'; c.shadowBlur = 40; c.beginPath(); c.arc(cx, cy, R, -1.5708, -1.5708 + rem * 6.283); c.stroke(); c.shadowBlur = 0;
    const mm = String(Math.floor(rem * 14)).padStart(2, '0'), ss = String(Math.floor((rem * 840) % 60)).padStart(2, '0');
    txt(c, `${mm}:${ss}`, cx, cy - 10, { font: '800 150px "JetBrains Mono"', fill: '#fff' });
    txt(c, 'MINUTES TO DECIDE', cx, cy + 120, { font: '700 32px "JetBrains Mono"', ls: 8, fill: rgba(RED, 1) });
    c.restore();
  }
};

// ---------- SCENE 8: doubt ----------
SCENES[7] = (u, t) => {
  const flick = u < 2.7 ? (Math.sin(u * 20) > .3 ? 1 : .55) : 0;
  bgGrad('#07070a', '#0b0507');
  const sh = shake(t, 4 + (u < 2.7 ? 5 : 0));
  if (u < 2.7) {
    const e = eio(u / 2.7);
    cam({ x: lerp(300, 0, e) + sh[0], y: sh[1], z: lerp(-1800, -950, e), yaw: lerp(-.18, 0, e), roll: lerp(.1, -.03, e) + sh[2], f: 1100 });
    // red alarm light spilling from side
    c.save(); reset(c); c.globalCompositeOperation = 'lighter'; glow(c, 120, 800, 1200, RED, .5 * flick); c.restore();
    plane(c, 0, 470, 700);
    // chroma-split silhouettes
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .55; silhouette(-30 + 14 * Math.sin(u * 30), 0, 3.0, false); c.restore();
    silhouette(0, 0, 3.0, true);
    reset(c);
    c.save(); c.globalCompositeOperation = 'lighter'; const e0 = proj(40, 330, 700); glow(c, e0[0], e0[1], 60, [255, 240, 200], .6); c.restore();
    // heartbeat pulses
    const beat = Math.pow(Math.max(0, Math.sin(u * 5.5 * (1 - e * .6))), 12);
    c.fillStyle = `rgba(255,30,20,${beat * .22})`; c.fillRect(0, 0, W, H);
    dust(t, 71, 50, [255, 120, 100], { focus: 700, alpha: .5 });
  } else if (u < 5.6) {
    const k = u - 2.7;
    cam({ x: sh[0], y: sh[1], z: lerp(-1700, -1250, eio(k / 2.9)), roll: Math.sin(k * .8) * .05 + sh[2], f: 1100 });
    const q = rng(5);
    // the five dots
    c.save(); reset(c); c.globalCompositeOperation = 'lighter';
    // ghost swarm (what a real attack would look like)
    if (u > 3.95) {
      const g = u - 3.95, rr = rng(12);
      for (let i = 0; i < 520; i++) {
        const ang = rr() * 6.283, rad = (200 + rr() * 1300) * eout(g * 1.4 - rr() * .5), x = Math.cos(ang) * rad, y = Math.sin(ang) * rad * 1.2 - 80;
        const p = proj(x, y, rr() * 800); const A = clamp(g * 3) * (1 - sm(2.7, 3.1, u - 3.95 + 0)) ; c.fillStyle = rgba(RED, .55 * clamp(g * 3) * (u > 5.4 ? 1 - sm(5.4, 5.6, u) : 1)); c.fillRect(p[0], p[1], 14 * p[2] + 3, 14 * p[2] + 3);
      }
    }
    const pts = [[-170, -40], [-60, 70], [60, -80], [170, 40], [0, 160]];
    pts.forEach((pp, i) => { const a = eout((u - 3.0 - i * .12) / .3); const p = proj(pp[0], pp[1] - 80, 0); glow(c, p[0], p[1], 130 * p[2], RED, a); c.fillStyle = '#fff'; c.beginPath(); c.arc(p[0], p[1], 20 * a, 0, 7); c.fill(); });
    c.restore();
    // question mark
    if (u < 3.7) slam('?', W / 2, 560, 700, 2.72, u, { fill: '#f4f0e6', glow: 0, pop: .5, damp: 14, stroke: 14, strokeCol: 'rgba(0,0,0,.5)' });
    if (u > 3.7) { reset(c); txt(c, 'ONLY FIVE', W / 2, 400, { size: 110, fill: '#fff', alpha: sm(3.7, 3.95, u) * (1 - sm(5.3, 5.55, u)), ls: 4 }); }
    if (u > 4.05) slam('A REAL ATTACK = HUNDREDS', W / 2, 1120, 52, 4.05, u, { fit: 880, fill: rgba(AMB, 1), fontTpl: '800 {s}px "JetBrains Mono"', ls: 2, alpha: 1 - sm(5.3, 5.55, u) });
    dust(t, 72, 40, [255, 140, 120], { focus: 800, alpha: .4 });
  } else {
    const k = u - 5.6;
    bgGrad('#010805', '#020d08');
    cam({ x: sh[0], y: sh[1], z: -1300, pitch: .0, roll: Math.sin(k * .6) * .03 + sh[2], f: 1100 });
    plane(c, 0, 0, 0);
    const R = 420, cx = 0, cy = 100, a = k * 2.4;
    c.save(); c.strokeStyle = rgba(GRN, .55); c.lineWidth = 3; for (let i = 1; i <= 5; i++) { c.beginPath(); c.arc(cx, cy, R * i / 5 * 1.7 / 1.7, 0, 7); c.stroke(); }
    c.beginPath(); for (let i = 0; i < 12; i++) { c.moveTo(cx, cy); c.lineTo(cx + Math.cos(i * .5236) * R, cy + Math.sin(i * .5236) * R); } c.strokeStyle = rgba(GRN, .25); c.stroke();
    const g = c.createConicGradient(a - 1.4, cx, cy); g.addColorStop(0, rgba(GRN, 0)); g.addColorStop(.22, rgba(GRN, .6)); g.addColorStop(.225, rgba(GRN, 0)); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
    c.strokeStyle = rgba(GRN, 1); c.lineWidth = 5; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.stroke(); c.restore();
    reset(c);
    txt(c, 'GROUND RADAR', W / 2, 330, { font: '800 56px "JetBrains Mono"', ls: 10, fill: rgba(GRN, 1), alpha: sm(0, .3, k) });
    if (k > 1.5) slam('NOTHING', W / 2, 1090, 190, 7.4 - 5.6, k + 0 * 0 + 0, { fit: 900, fill: '#f4f0e6', glow: 40, glowCol: GRN });
    dust(t, 73, 50, GRN, { focus: 1000, alpha: .4 });
  }
};

// ---------- SCENE 9: instinct, phone, FALSE ALARM ----------
function phone(lift) {
  // plane drawing: base + cradle + handset, origin centre
  c.save();
  // base
  const g = c.createLinearGradient(0, 0, 0, 220); g.addColorStop(0, '#d12a22'); g.addColorStop(1, '#5a0f0c');
  c.fillStyle = g; rrect(c, -330, 20, 660, 230, 46); c.fill();
  c.fillStyle = '#1b0c0b'; rrect(c, -230, 70, 460, 130, 40); c.fill();
  c.fillStyle = '#e8d9c8'; c.beginPath(); c.arc(0, 135, 92, 0, 7); c.fill(); c.fillStyle = '#1b0c0b'; for (let i = 0; i < 10; i++) { const a = -.6 + i * .56; c.beginPath(); c.arc(Math.cos(a) * 62, 135 + Math.sin(a) * 62, 15, 0, 7); c.fill(); } c.beginPath(); c.arc(0, 135, 22, 0, 7); c.fill();
  // cradle prongs
  c.fillStyle = '#7d1612'; rrect(c, -290, -20, 70, 60, 14); c.fill(); rrect(c, 220, -20, 70, 60, 14); c.fill();
  // handset
  c.translate(0, -lift * 360); c.rotate(-lift * .5 * (1 - lift * .4));
  const h = c.createLinearGradient(0, -90, 0, 20); h.addColorStop(0, '#f04036'); h.addColorStop(1, '#8a1812');
  c.fillStyle = h; rrect(c, -340, -62, 680, 66, 33); c.fill();
  c.fillStyle = h; rrect(c, -360, -86, 130, 112, 34); c.fill(); rrect(c, 230, -86, 130, 112, 34); c.fill();
  c.fillStyle = 'rgba(255,255,255,.25)'; rrect(c, -300, -52, 600, 12, 6); c.fill();
  c.restore();
}
SCENES[8] = (u, t) => {
  bgGrad('#050304', '#0a0405');
  const sh = shake(t, 3);
  if (u < 2.3) {
    cam({ x: sh[0], y: sh[1], z: lerp(-1700, -1300, eio(u / 2.3)), roll: lerp(.05, -.03, u / 2.3) + sh[2], f: 1100 });
    // ECG line
    const beat = Math.pow(Math.max(0, Math.sin(u * 7)), 10);
    c.save(); plane(c, 0, 0, 0); c.strokeStyle = rgba(RED, 1); c.lineWidth = 6; c.shadowColor = rgba(RED, 1); c.shadowBlur = 24; c.beginPath();
    for (let x = -700; x <= 700; x += 8) { const ph = ((x + 700) / 140 - u * 3.2) % 1; const pp = ((ph + 1) % 1); const y = 300 + (pp < .08 ? -pp / .08 * 160 : pp < .14 ? (-160 + (pp - .08) / .06 * 300) : pp < .2 ? (140 - (pp - .14) / .06 * 140) : 0); x === -700 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); c.restore();
    c.save(); reset(c); c.fillStyle = `rgba(255,20,10,${beat * .12})`; c.fillRect(0, 0, W, H); c.restore();
    // stamp
    const k = u - .45;
    if (k > 0) { const e = Math.exp(-k * 14), s = 1 + 2.2 * e; c.save(); reset(c); c.translate(W / 2, 640); c.rotate(-.1); c.scale(s, s); c.globalAlpha = clamp(k * 30);
      c.strokeStyle = '#ff3b30'; c.lineWidth = 14; rrect(c, -380, -120, 760, 240, 12); c.stroke(); c.lineWidth = 4; rrect(c, -362, -102, 724, 204, 8); c.stroke();
      txt(c, 'NO PROOF', 0, 6, { size: 150, fill: '#ff3b30', glow: 14 }); c.restore(); }
    if (u > 1.1) slam('JUST INSTINCT', W / 2, 1000, 120, 1.14, u, { fit: 900, fill: '#f4f0e6', glow: 30, glowCol: [255, 255, 255], ls: 4 });
  } else {
    const k = u - 2.3, lift = eio((u - 2.9) / .9);
    const dolly = eio(k / 3.6);
    cam({ x: lerp(160, -60, dolly) + sh[0], y: lerp(-220, -60, dolly) + sh[1], z: lerp(-1500, -950, dolly), yaw: lerp(-.1, .03, dolly), pitch: lerp(.05, .0, dolly), roll: lerp(.04, -.02, dolly) + sh[2], f: 1100 });
    // table plane + light pool
    c.save(); reset(c); c.globalCompositeOperation = 'lighter'; const p = proj(0, 0, 0); glow(c, p[0], p[1] - 40, 800, RED, .35 + .25 * lift); c.restore();
    plane(c, 0, -170, 0); phone(u > 2.9 ? lift : 0);
    // light cone on handset when lifted
    c.save(); reset(c); c.globalCompositeOperation = 'lighter'; const hp = proj(0, -170 - lift * 360, 0); glow(c, hp[0], hp[1], 380, RED, lift * .6); c.restore();
    dust(t, 81, 60, [255, 120, 100], { focus: 800, alpha: .5 });
    // FALSE ALARM
    const kk = u - 5.34;
    if (kk > -.8 && kk < 0) { reset(c); c.fillStyle = `rgba(0,0,0,${.6 * (1 + kk / .8)})`; c.fillRect(0, 0, W, H); }
    if (kk >= 0) {
      reset(c); c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = rgba(GRN, Math.max(0, 1 - kk * 1.8)); c.lineWidth = 14; c.beginPath(); c.arc(W / 2, 760, 1400 * eout(kk * 1.2), 0, 7); c.stroke(); glow(c, W / 2, 760, 900, GRN, Math.max(0, .8 - kk)); c.restore();
      reset(c); c.fillStyle = `rgba(255,255,255,${Math.max(0, .6 - kk * 5)})`; c.fillRect(0, 0, W, H);
      slam('FALSE', W / 2, 600, 330, 5.34, u, { fit: 940, fill: '#ffffff', glow: 0, pop: .7, damp: 14, stroke: 22, strokeCol: 'rgba(0,0,0,.75)' });
      slam('ALARM', W / 2, 860, 330, 5.46, u, { fit: 940, fill: '#5dffb0', glow: 0, pop: .7, damp: 14, stroke: 22, strokeCol: 'rgba(0,0,0,.75)' });
    }
  }
};
