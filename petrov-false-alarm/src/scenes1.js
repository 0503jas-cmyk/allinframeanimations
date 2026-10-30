// ===== scenes 1-4 =====

// ---------- shared: the red button ----------
function cylinder(cx, cz, r, yTop, yBot, topCol, sideFn, n = 44) {
  const segs = [];
  for (let i = 0; i < n; i++) {
    const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, am = (a0 + a1) / 2;
    const z = cz + Math.sin(am) * r;
    segs.push({ a0, a1, am, z });
  }
  segs.sort((p, q) => q.z - p.z);
  for (const s of segs) {
    const P = (a, y) => proj(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r);
    const q = [P(s.a0, yBot), P(s.a1, yBot), P(s.a1, yTop), P(s.a0, yTop)];
    poly(c, q, sideFn(s.am), null);
  }
  const top = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; top.push(proj(cx + Math.cos(a) * r, yTop, cz + Math.sin(a) * r)); }
  poly(c, top, topCol, null);
  return top;
}
function drawButton(t, pressDepth = 0, glowAmt = 1, coldMode = false) {
  const redCol = coldMode ? [200, 60, 60] : RED;
  // table grid
  reset(c); c.save(); c.lineWidth = 1.4;
  for (let i = -14; i <= 14; i++) {
    const a = .22 * (1 - Math.abs(i) / 15);
    c.strokeStyle = rgba(redCol, a * .9);
    let p = proj(i * 200, 0, -2400), q = proj(i * 200, 0, 3600); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke();
    p = proj(-2800, 0, i * 220 + 600); q = proj(2800, 0, i * 220 + 600); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke();
  }
  c.restore();
  // light pool on table
  { const cp = proj(0, 0, 0); c.save(); c.globalCompositeOperation = 'lighter'; c.translate(cp[0], cp[1]); c.scale(1, Math.max(.25, Math.abs(Math.sin(C.pitch + .15)) * .9)); const R0 = 1100 * cp[2];
    const g = c.createRadialGradient(0, 0, 0, 0, 0, R0); g.addColorStop(0, rgba(redCol, .6 * glowAmt)); g.addColorStop(.5, rgba(redCol, .18 * glowAmt)); g.addColorStop(1, rgba(redCol, 0)); c.fillStyle = g; c.fillRect(-R0, -R0, R0 * 2, R0 * 2); c.restore(); }
  // housing
  const lightA = -2.2;
  const shade = (base, k) => a => { const l = .22 + .78 * Math.max(0, Math.cos(a - lightA)); return `rgb(${(base[0] * l * k) | 0},${(base[1] * l * k) | 0},${(base[2] * l * k) | 0})`; };
  cylinder(0, 0, 330, -70, 0, '#16181d', shade([70, 74, 84], 1));
  cylinder(0, 0, 300, -120, -70, '#20232a', shade([90, 94, 106], 1));
  // hazard ring on housing top
  const ring = []; for (let i = 0; i < 44; i++) { const a = i / 44 * 6.283; ring.push(proj(Math.cos(a) * 262, -120, Math.sin(a) * 262)); }
  c.strokeStyle = rgba(AMB, .55); c.lineWidth = 3; c.beginPath(); ring.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); c.stroke();
  // button cap
  const y0 = -120 + pressDepth, h = 92;
  cylinder(0, 0, 215, y0 - 14, y0, '#5a0d0d', shade(redCol.map(v => v * .8), 1));
  const top = cylinder(0, 0, 205, y0 - h, y0 - 14, `rgb(${redCol[0]},${redCol[1] * .55 | 0},${redCol[2] * .5 | 0})`, shade(redCol, 1.1));
  // dome highlight
  const cp2 = proj(-50, y0 - h - 4, -50);
  c.save(); c.globalCompositeOperation = 'lighter';
  const hg = c.createRadialGradient(cp2[0], cp2[1], 0, cp2[0], cp2[1], 190 * cp2[2]); hg.addColorStop(0, 'rgba(255,200,180,.75)'); hg.addColorStop(1, 'rgba(255,60,40,0)');
  c.save(); c.beginPath(); top.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); c.clip(); c.fillStyle = hg; c.fillRect(0, 0, W, H); c.restore();
  const gp = proj(0, y0 - h, 0); glow(c, gp[0], gp[1], 520 * gp[2], redCol, .5 * glowAmt); c.restore();
}

// ---------- SCENE 1: hook ----------
SCENES[0] = (u, t) => {
  bgGrad('#030204', '#0a0305');
  const th = lerp(-1.25, 0.15, eio(u / 6.2)), rad = lerp(1150, 720, eio(u / 6.2)), hgt = lerp(-170, -720, eio(u / 6.2));
  const sh = shake(t, 5);
  const px = Math.sin(th) * rad, pz = -Math.cos(th) * rad;
  cam(Object.assign(lookAt(px, hgt, pz, 0, -150, 0), { roll: .06 * Math.sin(u * .7) + sh[2], f: 1050 }));
  C.x += sh[0]; C.y += sh[1];
  dust(t, 11, 90, [255, 90, 70], { focus: 900, alpha: .7, vy: -1 });
  const beat = Math.pow(Math.abs(Math.sin(u * 2.1 * Math.PI / 1.0)), 6);
  drawButton(t, 0, .8 + .35 * beat);
  dust(t, 12, 40, [255, 160, 120], { focus: 100, alpha: .5, z: -400 });
  reset(c);
  if (window.noHook) { /* thumbnail: no hook text */ }
  else if (u < 1.15) slam('ONE MAN', W / 2, 470, 230, .34, u, { fit: 900, glow: 0, fill: '#f4f0e6', damp: 14, stroke: 10, strokeCol: 'rgba(0,0,0,.6)' });
  else if (u < 3.15) slam('RED BUTTON', W / 2, 470, 200, 1.18, u, { fit: 940, fill: '#ff4a40', glow: 28, tilt: -.06, damp: 14 });
  else if (u < 5.3) slam('ONE DECISION', W / 2, 470, 190, 3.17, u, { fit: 940, fill: '#f4f0e6', glow: 0, damp: 14, stroke: 10, strokeCol: 'rgba(0,0,0,.6)' });
  else slam('THE WORLD', W / 2, 470, 215, 5.35, u, { fit: 940, fill: '#ff3b30', glow: 30, pop: 1.0, damp: 14 });
  // vignette flicker
  reset(c); c.fillStyle = `rgba(0,0,0,${.18 * (1 - sm(0, .7, u))})`; c.fillRect(0, 0, W, H);
};

// ---------- SCENE 2: date + globe + Moscow ----------
function odometer(str, cx, cy, size, prog) {
  // each char is a digit column rolling to its target
  c.save(); reset(c);
  const cw = size * .62, n = str.length, x0 = cx - cw * n / 2;
  for (let i = 0; i < n; i++) {
    const d = +str[i], p = clamp((prog - i * .08) / (1 - n * .08 + .08));
    const e = eout(p), v = 10 * 3 * (1 - e) + d; // rolls through 30 digits
    c.save(); c.beginPath(); c.rect(x0 + i * cw - 4, cy - size * .62, cw + 8, size * 1.24); c.clip();
    for (let k = -1; k <= 1; k++) {
      const base = Math.floor(v) + k, frac = v - Math.floor(v);
      const dd = ((base % 10) + 10) % 10; txt(c, '' + dd, x0 + i * cw + cw / 2, cy + (k - frac) * size * 1.05, { font: `800 ${size}px "Inter Display"`, fill: '#f4f0e6', alpha: 1 - Math.abs(k - frac) * .55 });
    }
    c.restore();
  }
  c.restore();
}
SCENES[1] = (u, t) => {
  bgGrad('#02060b', '#050a12');
  const e = eio(u / 6.65);
  const rot = lerp(-40, 37.6, eout(u / 6.2)), tilt = lerp(18, 55.75, eout(u / 6.2));
  const zoomK = sm(4.2, 6.5, u);
  const sh = shake(t, 4);
  cam({ x: lerp(-260, 40, e) + sh[0], y: lerp(-60, -140, e) + sh[1] , z: lerp(-3300, -2250, e) + zoomK * 450, yaw: lerp(.1, 0, e), pitch: lerp(-.05, .02, e), roll: lerp(-.07, .03, e) + sh[2], f: 1100 });
  // star field
  { const r = rng(5); c.save(); reset(c); for (let i = 0; i < 160; i++) { const p = proj((r() * 2 - 1) * 4000, (r() * 2 - 1) * 4000, 1800 + r() * 4000); c.fillStyle = rgba(WHT, .25 + .5 * r()); c.fillRect(p[0], p[1], 2, 2); } c.restore(); }
  const R = 1000;
  const G = globe(c, R, rot, tilt);
  // Moscow pin
  const m = G(37.6, 55.75);
  if (m.v && u > 4.7) {
    const k = u - 4.7; reset(c); c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) { const ph = ((k * .9 + i / 3) % 1); c.strokeStyle = rgba(RED, (1 - ph) * .9); c.lineWidth = 3; c.beginPath(); c.ellipse(m.p[0], m.p[1], 20 + ph * 160, (20 + ph * 160) * .8, 0, 0, 7); c.stroke(); }
    glow(c, m.p[0], m.p[1], 110, RED, 1); c.restore();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(m.p[0], m.p[1], 9, 0, 7); c.fill();
    // leader line + label
    const lx = m.p[0] + 120, ly = m.p[1] - 190, f = eout((u - 5.5) / .5);
    c.strokeStyle = rgba(WHT, .8); c.lineWidth = 3; c.beginPath(); c.moveTo(m.p[0] + 12, m.p[1] - 12); c.lineTo(lerp(m.p[0] + 12, lx, f), lerp(m.p[1] - 12, ly, f)); c.lineTo(lerp(lx, lx + 300, f), lerp(ly, ly, f)); c.stroke();
    if (f > .5) { txt(c, 'MOSCOW', lx + 10, ly - 34, { size: 56, align: 'left', ls: 6, fill: '#fff', alpha: (f - .5) * 2 }); txt(c, '55.75°N  37.62°E', lx + 10, ly + 28, { font: '700 30px "JetBrains Mono"', align: 'left', fill: rgba(RED, 1), alpha: (f - .5) * 2, ls: 2 }); }
  }
  // date block
  reset(c);
  const dIn = eout((u - .15) / .5);
  txt(c, 'SEPTEMBER 26', W / 2, 330 - (1 - dIn) * 60, { font: '700 64px "JetBrains Mono"', ls: 12, fill: rgba(CYN, 1), alpha: dIn, glow: 18, glowCol: CYN });
  if (u > 1.4) odometer('1983', W / 2, 520, 240, clamp((u - 1.5) / 2.4));
  if (u > 4.0 && u < 5) { reset(c); c.fillStyle = `rgba(255,255,255,${(1 - (u - 4.0)) * .25})`; c.fillRect(0, 0, W, H); }
  txt(c, 'THE COLD WAR', W / 2, 700, { font: '700 36px "JetBrains Mono"', ls: 18, fill: rgba(WHT, .55), alpha: sm(3.8, 4.6, u) * (1 - sm(5.8, 6.3, u)) });
  dust(t, 21, 40, CYN, { focus: 1200, alpha: .4 });
};

// ---------- SCENE 3: control room ----------
function crt(w, h, t, kind, seed) {
  // draws a CRT screen at plane origin (0,0)-(w,h)
  c.save();
  rrect(c, -14, -14, w + 28, h + 28, 22); c.fillStyle = '#0d1014'; c.fill();
  rrect(c, 0, 0, w, h, 14); c.fillStyle = '#021208'; c.fill(); c.clip();
  const cx = w / 2, cy = h / 2;
  if (kind === 'radar') {
    const R = Math.min(w, h) * .45;
    c.strokeStyle = rgba(GRN, .5); c.lineWidth = 2;
    for (let i = 1; i <= 4; i++) { c.beginPath(); c.arc(cx, cy, R * i / 4, 0, 7); c.stroke(); }
    c.beginPath(); c.moveTo(cx - R, cy); c.lineTo(cx + R, cy); c.moveTo(cx, cy - R); c.lineTo(cx, cy + R); c.stroke();
    const a = t * 2.2; const g = c.createConicGradient ? c.createConicGradient(a - 1.2, cx, cy) : null;
    if (g) { g.addColorStop(0, rgba(GRN, 0)); g.addColorStop(.19, rgba(GRN, .55)); g.addColorStop(.2, rgba(GRN, 0)); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill(); }
    c.strokeStyle = rgba(GRN, .95); c.lineWidth = 3; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.stroke();
    const r = rng(seed); for (let i = 0; i < 4; i++) { const bx = cx + (r() - .5) * R * 1.4, by = cy + (r() - .5) * R * 1.4; c.fillStyle = rgba(GRN, .5 + .5 * Math.sin(t * 2 + i)); c.fillRect(bx, by, 7, 7); }
  } else if (kind === 'text') {
    const r = rng(seed); c.font = '700 22px "JetBrains Mono"'; c.fillStyle = rgba(GRN, .85); c.textBaseline = 'top';
    for (let i = 0; i < 14; i++) { const ln = ((i * 3 + Math.floor(t * 4)) % 40); c.fillText(`${(1000 + ln * 37) % 9999} ${'SECTOR ' + (ln % 9)} ${(r() * 99).toFixed(1)} OK`, 20, 20 + i * 30); }
  } else {
    c.strokeStyle = rgba(GRN, .9); c.lineWidth = 3; c.beginPath();
    for (let x = 0; x <= w; x += 6) { const y = cy + Math.sin(x * .05 + t * 3 + seed) * 22 + vnoise(x * .08 + t * 2 + seed) * 30; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    c.strokeStyle = rgba(GRN, .25); c.lineWidth = 1; for (let x = 0; x < w; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
  }
  c.fillStyle = 'rgba(0,0,0,.28)'; for (let y = 0; y < h; y += 5) c.fillRect(0, y, w, 2);
  c.restore();
  c.save(); c.globalCompositeOperation = 'lighter'; const gg = c.createLinearGradient(0, 0, 0, h); gg.addColorStop(0, rgba(GRN, .10)); gg.addColorStop(1, rgba(GRN, .02)); c.fillStyle = gg; c.fillRect(-60, -60, w + 120, h + 120); c.restore();
}
function silhouette(sx, sy, k, rim) {
  // Petrov-like officer silhouette, origin at neck base, facing 3/4 left; plane coords
  c.save(); c.translate(sx, sy); c.scale(k, k);
  const body = new Path2D('M-330,420 C-320,150 -220,60 -90,20 L-48,-10 L48,-10 L90,20 C230,60 330,150 340,420 Z');
  const neck = new Path2D('M-44,-4 L-40,-90 L40,-90 L46,-4 Z');
  const head = new Path2D('M-58,-96 C-72,-150 -64,-215 -20,-244 C26,-262 76,-236 86,-176 C94,-130 84,-96 62,-76 C40,-50 10,-48 -22,-56 C-44,-62 -54,-78 -58,-96 Z');
  const cap = new Path2D('M-84,-206 C-70,-262 -10,-288 48,-282 C98,-274 110,-244 100,-214 L110,-200 L-86,-196 Z');
  const brim = new Path2D('M-106,-206 L112,-206 L118,-188 L-96,-186 Z');
  const col = rim ? '#0b0f0d' : '#06080a';
  c.fillStyle = col; c.fill(body); c.fill(neck); c.fill(head); c.fill(cap); c.fill(brim);
  if (rim) {
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineWidth = 5; c.strokeStyle = rgba(GRN, .75); c.shadowColor = rgba(GRN, 1); c.shadowBlur = 24;
    c.stroke(head); c.stroke(body); c.stroke(cap); c.restore();
    c.fillStyle = rgba(RED, .95); c.beginPath(); c.arc(6, -232, 9, 0, 7); c.fill();
  }
  c.restore();
}
SCENES[2] = (u, t) => {
  bgGrad('#02080a', '#03100f');
  const e = eio(u / 6.35), sh = shake(t, 3);
  cam({ x: lerp(420, -60, e) + sh[0], y: lerp(-60, -20, e) + sh[1], z: lerp(-1300, -1000, e), yaw: lerp(-.1, .08, e), pitch: .02, roll: lerp(.04, -.03, e) + sh[2], f: 1150 });
  // back wall panel
  reset(c);
  const z1 = 1500; plane(c, -1000, -1100, z1); c.fillStyle = '#071314'; c.fillRect(0, 0, 2000, 2000);
  c.strokeStyle = 'rgba(90,255,170,.07)'; c.lineWidth = 2; for (let i = 0; i < 20; i++) { c.beginPath(); c.moveTo(i * 100, 0); c.lineTo(i * 100, 2000); c.stroke(); c.beginPath(); c.moveTo(0, i * 100); c.lineTo(2000, i * 100); c.stroke(); }
  // monitors wall
  const mons = [[-520, -420, 460, 330, 'radar', 1], [30, -420, 460, 330, 'text', 2], [-520, 10, 460, 330, 'wave', 3], [30, 10, 460, 330, 'radar', 4], [580, -200, 380, 300, 'text', 5]];
  mons.forEach(m => { plane(c, m[0], m[1], 1400); crt(m[2], m[3], t, m[4], m[5]); });
  reset(c);
  // light cone from screens
  c.save(); c.globalCompositeOperation = 'lighter'; const p0 = proj(0, -200, 1400); glow(c, p0[0], p0[1], 900, GRN, .22); c.restore();
  // officer (mid)
  plane(c, 150, 260, 900); silhouette(0, 0, 1.7, true); reset(c);
  // desk
  reset(c); const d0 = proj(-1300, 330, 600), d1 = proj(1300, 330, 600), d2 = proj(1500, 600, 150), d3 = proj(-1500, 600, 150);
  poly(c, [d0, d1, d2, d3], '#0a1011'); const t0 = proj(-1300, 330, 600), t1 = proj(1300, 330, 600); c.strokeStyle = rgba(GRN, .5); c.lineWidth = 3; c.beginPath(); c.moveTo(t0[0], t0[1]); c.lineTo(t1[0], t1[1]); c.stroke();
  // console buttons on the desk
  const r = rng(9); c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 28; i++) { const x = -1100 + i * 80, z = 560 - (i % 3) * 120; const p = proj(x, 335, z); const on = Math.sin(t * (1.2 + (i % 5) * .4) + i) > .1; glow(c, p[0], p[1], 34 * p[2], i % 6 === 0 ? RED : (i % 4 === 0 ? AMB : GRN), on ? .9 : .15); }
  c.restore();
  // foreground bokeh (out of focus)
  dof(18, () => { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 12; i++) { const p = proj(-900 + i * 190, 420 + (i % 3) * 40, -200 + (i % 4) * 60); const ccol = i % 3 ? GRN : AMB; glow(c, p[0], p[1], 70 * p[2] + 30, ccol, .55); } c.restore(); }, .9);
  dust(t, 31, 60, GRN, { focus: 800, alpha: .5 });
  // lower-third kinetic type
  reset(c);
  const a1 = eout((u - 1.35) / .45), a2 = eout((u - 2.4) / .45), out = 1 - sm(5.9, 6.3, u);
  c.save(); c.globalAlpha = out;
  const bx = 70, by = 420;
  c.fillStyle = rgba(GRN, .9); c.fillRect(bx, by, 10 * a1, 230 * a1);
  txt(c, 'LT. COL.', bx + 36 + (1 - a1) * -120, by + 30, { font: '700 40px "JetBrains Mono"', align: 'left', ls: 10, fill: rgba(GRN, 1), alpha: a1 });
  txt(c, 'STANISLAV', bx + 36 + (1 - a1) * -200, by + 112, { size: 112, align: 'left', fill: '#f4f0e6', alpha: a1, ls: -2 });
  txt(c, 'PETROV', bx + 36 + (1 - a1) * -300, by + 210, { size: 112, align: 'left', fill: '#ffffff', alpha: a1, ls: -2 });
  txt(c, 'DUTY OFFICER · SOVIET AIR-DEFENCE', bx + 36, by + 296 - (1 - a2) * -20, { font: '700 28px "JetBrains Mono"', align: 'left', ls: 3, fill: rgba(WHT, .85), alpha: a2 });
  txt(c, 'SERPUKHOV-15 BUNKER', bx + 36, by + 340, { font: '700 28px "JetBrains Mono"', align: 'left', ls: 3, fill: rgba(RED, 1), alpha: a2 });
  c.restore();
};

// ---------- SCENE 4: plane shot down ----------
function airliner(scale, bank) {
  c.save(); c.scale(scale, scale); c.rotate(bank);
  c.fillStyle = '#c9cdd3';
  // fuselage
  c.beginPath(); c.moveTo(-300, 0); c.bezierCurveTo(-300, -40, -200, -46, 0, -46); c.bezierCurveTo(200, -46, 300, -30, 330, 0); c.bezierCurveTo(300, 26, 200, 38, 0, 40); c.bezierCurveTo(-200, 38, -300, 30, -300, 0); c.fill();
  // tail fin
  c.fillStyle = '#aab0b8'; poly(c, [[-300, -30], [-232, -150], [-190, -150], [-210, -30]], '#b8bec6');
  // wing (swept)
  poly(c, [[-40, 18], [60, 18], [-110, 180], [-190, 180]], '#9aa1ab');
  poly(c, [[-40, -18], [60, -18], [-70, -120], [-130, -120]], '#8a919b');
  // engine
  c.fillStyle = '#6b727c'; rrect(c, -90, 100, 90, 34, 14); c.fill();
  // windows
  c.fillStyle = 'rgba(255,214,130,.85)'; for (let i = 0; i < 22; i++) c.fillRect(-200 + i * 18, -22, 8, 10);
  // cockpit
  c.fillStyle = '#1b2230'; poly(c, [[250, -28], [300, -20], [312, -4], [254, -8]], '#1b2230');
  c.restore();
}
SCENES[3] = (u, t) => {
  bgGrad('#030814', '#0b1226');
  const sh = shake(t, 4 + 14 * Math.exp(-(u - 5.1) * 6) * (u > 5.1 ? 1 : 0));
  const e = eio(u / 7.8);
  const hit = 5.1;
  cam({ x: lerp(-700, 500, e) + sh[0], y: lerp(250, -150, e) + sh[1], z: -1500, yaw: lerp(.2, -.12, e), pitch: -.04, roll: lerp(.12, -.08, e) + sh[2], f: 1100 });
  // stars (3 depth layers)
  c.save(); reset(c); const r = rng(77);
  for (let i = 0; i < 220; i++) { const z = 1200 + r() * 5000; const p = proj((r() * 2 - 1) * 5000, (r() * 2 - 1) * 4000, z); const tw = .4 + .6 * Math.abs(Math.sin(t * 2 + i)); c.fillStyle = rgba(WHT, tw * .6); const sz = 3 * p[2] * 100 / 100 + 1; c.fillRect(p[0], p[1], sz, sz); }
  c.restore();
  // clouds far/near drift
  for (let k = 0; k < 2; k++) {
    const z = 900 + k * 900; c.save(); reset(c); plane(c, -2400 + ((t * (60 + k * 40)) % 2400), 400 + k * 300, z); c.globalAlpha = .13;
    const rr = rng(40 + k); for (let i = 0; i < 18; i++) { const x = i * 260, y = rr() * 300; const g = c.createRadialGradient(x, y, 0, x, y, 320); g.addColorStop(0, 'rgba(170,190,230,1)'); g.addColorStop(1, 'rgba(170,190,230,0)'); c.fillStyle = g; c.fillRect(x - 320, y - 320, 640, 640); }
    c.restore();
  }
  // plane: flies diagonally across, then breaks apart
  const pf = u / 7.8;
  let px = lerp(-1100, 700, pf), py = lerp(300, -200, pf);
  if (u < hit) {
    plane(c, px, py, 380); const s = 2.0; c.save(); airliner(s, -0.2);
    // nav lights
    c.globalCompositeOperation = 'lighter'; const bl = Math.sin(t * 7) > .2;
    glow(c, -190 * 2, 180 * 2, 120, RED, bl ? 1 : .2); glow(c, -130 * 2, -120 * 2, 100, GRN, .8); glow(c, -300 * 2, -150 * 2, 70, WHT, bl ? .1 : .9); c.restore(); reset(c);
    c.save(); c.globalCompositeOperation = 'lighter'; // exhaust trail
    for (let i = 0; i < 20; i++) { const q = proj(px - 300 - i * 70, py + 20 + i * 14, 500); glow(c, q[0], q[1], 40 * q[2] + i * 2, [180, 200, 255], .12 * (1 - i / 20)); }
    c.restore();
  } else {
    const k = u - hit;
    // fuselage halves tumbling
    for (let h = 0; h < 2; h++) {
      const dir = h ? 1 : -1, ox = px - 20 + dir * 160 * k * 1.3, oy = py + 90 * k * k * 3 + 20 * k;
      plane(c, ox, oy, 500 + h * 60); c.save(); c.rotate(dir * k * 1.2 + (h ? .4 : -.2)); c.beginPath(); c.rect(h ? 0 : -400, -400, 400, 800); c.clip(); airliner(2.0, 0); c.restore();
      c.save(); reset(c); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 24; i++) { const q = proj(ox - dir * i * 40 + (h ? 30 : -30), oy - i * 34 - 10 * i, 500); glow(c, q[0], q[1], (60 + i * 5) * q[2], i < 6 ? [255, 220, 120] : [255, 110, 40], .3 * (1 - i / 24)); }
      c.restore();
    }
    // debris
    const rr = rng(91); c.save(); reset(c); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 70; i++) { const a = rr() * 6.283, v = 200 + rr() * 900, d = k * v; const q = proj(px + Math.cos(a) * d, py + Math.sin(a) * d + 380 * k * k * (1 + rr()), 500 + (rr() - .5) * 300); const L = 5 + rr() * 9; c.fillStyle = rgba([255, 170 + rr() * 80, 60], clamp(1.3 - k * .5)); c.fillRect(q[0], q[1], L * q[2] * 1.6, L * q[2] * 1.6); }
    c.restore();
    // blast & shockwave
    const q0 = proj(px, py, 500); reset(c); c.save(); c.globalCompositeOperation = 'lighter';
    glow(c, q0[0], q0[1], (260 + 700 * eout(k * 2)) * q0[2], [255, 150, 60], Math.max(0, 1 - k * .9));
    c.strokeStyle = rgba([255, 220, 180], Math.max(0, 1 - k * 2.2)); c.lineWidth = 8; c.beginPath(); c.arc(q0[0], q0[1], 900 * eout(k * 1.5) * q0[2] * .6, 0, 7); c.stroke(); c.restore();
  }
  // tracer missile (from lower-left) before hit
  if (u > 3.65 && u < hit + .25) {
    const f = clamp((u - 3.65) / (hit - 3.65)); reset(c); c.save(); c.globalCompositeOperation = 'lighter';
    const sx = -1500, sy = 1300, ex = px, ey = py;
    for (let i = 0; i < 26; i++) { const ff = clamp(f - i * .012); const q = proj(lerp(sx, ex, ff * ff * .0 + ff), lerp(sy, ey, ff), 500); glow(c, q[0], q[1], (46 - i) * q[2], i ? [255, 120, 60] : [255, 255, 220], .8 * (1 - i / 26)); }
    c.restore();
  }
  dust(t, 41, 40, [140, 170, 255], { focus: 600, alpha: .4 });
  // kinetic type
  reset(c);
  const a = eout((u - 2.05) / .4);
  txt(c, 'SEPT 1, 1983', 70, 330 - (1 - a) * 50, { font: '700 46px "JetBrains Mono"', align: 'left', ls: 6, fill: rgba(CYN, 1), alpha: a * (1 - sm(6.2, 6.5, u)) });
  if (u > 3.4) { txt(c, 'KOREAN AIR 007', 70, 392, { font: '700 40px "JetBrains Mono"', align: 'left', ls: 4, fill: rgba(WHT, .8), alpha: sm(3.4, 3.8, u) * (1 - sm(6.2, 6.5, u)) }); }
  if (u > hit) { txt(c, '269 PEOPLE ABOARD', 70, 452, { font: '700 40px "JetBrains Mono"', align: 'left', ls: 4, fill: rgba(RED, 1), alpha: sm(hit + .2, hit + .5, u) * (1 - sm(6.2, 6.5, u)) }); }
  if (u > 6.55) {
    slam('EVERYONE', W / 2, 560, 120, 6.6, u, { fit: 760, fill: '#f4f0e6', ls: 8, pop: .35 });
    slam('EXPECTED', W / 2, 700, 120, 6.95, u, { fit: 760, fill: '#f4f0e6', ls: 8, pop: .35 });
    slam('WAR', W / 2, 960, 420, 7.3, u, { fit: 960, fill: '#ff2b22', glow: 90, pop: 1.2 });
  }
  if (u > 7.3) { reset(c); c.fillStyle = `rgba(255,0,0,${.12 * Math.abs(Math.sin(u * 14))})`; c.fillRect(0, 0, W, H); }
};
