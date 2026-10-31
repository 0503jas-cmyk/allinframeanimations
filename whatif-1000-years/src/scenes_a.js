// Scenes 0–5: intro, growing up, nature's long-livers, not immortal, 80 looks 30, 120th birthday.
'use strict';

// ---------- shared: perspective ground + winding road (true 3D, drawn raw)
function groundPlane(color, horizonColor, zFar = 20000) {
  raw(zFar, g => {
    const pFar = project(cam.x, 0, cam.z + zFar), y0 = pFar ? H / 2 + pFar.sy : H / 2;
    const lg = g.createLinearGradient(0, y0, 0, H); lg.addColorStop(0, horizonColor); lg.addColorStop(1, color);
    g.fillStyle = lg; g.fillRect(-200, y0 - 2, W + 400, H - y0 + 200);
  });
}
function roadPath(z) { return 260 * Math.sin(z * .00045) + 120 * Math.sin(z * .0011 + 1); }
function road3D(z0, z1, width, color, edge) {
  raw(z1, g => {
    const L = [], R = [];
    for (let z = Math.max(z0, cam.z + 60); z <= z1; z += Math.max(20, (z - cam.z) * .05)) {
      const x = roadPath(z), a = project(x - width / 2, 0, z), b = project(x + width / 2, 0, z);
      if (a && b) { L.push([W / 2 + a.sx, H / 2 + a.sy]); R.push([W / 2 + b.sx, H / 2 + b.sy]); }
    }
    if (L.length < 2) return;
    g.beginPath(); L.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath();
    g.fillStyle = color; g.shadowColor = 'rgba(40,20,10,.25)'; g.shadowBlur = 12; g.fill(); g.shadowColor = 'transparent';
    g.strokeStyle = edge; g.lineWidth = 3; g.stroke();
  });
}
// tile a sprite horizontally around the camera
function tileX(s, z, y, spacing, o = {}) {
  const p = project(cam.x, 0, z); if (!p) return;
  const half = (W / 2 + 600) / p.s, start = Math.floor((cam.x - half - (o.offset || 0)) / spacing);
  for (let i = start; i * spacing + (o.offset || 0) < cam.x + half; i++) {
    const r = hash(i * 13.7 + (o.seed || 0));
    if (o.skip && r < o.skip) continue;
    plane(s, i * spacing + (o.offset || 0) + (o.jitter ? (r - .5) * o.jitter : 0), y, z + (o.zj ? (hash(i * 3.1) - .5) * o.zj : 0), { ...o.p, scale: (o.p?.scale ?? 1) * (o.vs ? lerp(1 - o.vs, 1 + o.vs, r) : 1) });
  }
}
// side-scrolling roadside world reused by several scenes
const LOOKS = {
  day: { sky: [[0, '#8FC3DA'], [.6, '#CFE5E4'], [1, '#F3E5C8']], far: '#A9C2C9', hill2: '#9DBB92', hill1: '#7FA77E', tree: '#5E8F63', ground: '#C9B98F', road: '#E2CFAA', fg: '#6E9A63', sun: '#F7D57A' },
  warm: { sky: [[0, '#F0A97A'], [.55, '#F7D7A8'], [1, '#F6E8CC']], far: '#C9A4A0', hill2: '#B9A47E', hill1: '#9C9A6A', tree: '#7E8F55', ground: '#D9C29A', road: '#EAD4AD', fg: '#7F8F4E', sun: '#FFE1A0' },
  city: { sky: [[0, '#7FB6C9'], [.6, '#D8E7E1'], [1, '#F2E2C6']], far: '#9FB4BE', hill2: '#88A3A8', hill1: '#6F8F95', tree: '#5D8B78', ground: '#C3B49A', road: '#DCCBAE', fg: '#5F8A6F', sun: '#FBE3A1' },
  dusk: { sky: [[0, '#4B3F72'], [.55, '#C27C8E'], [1, '#F2B38A']], far: '#7E6A8F', hill2: '#6C5F7E', hill1: '#56506A', tree: '#45485E', ground: '#8F7F86', road: '#B9A5A0', fg: '#3F4458', sun: '#FFC98A' },
};
function roadside(key, look, o = {}) {
  const L = LOOKS[look];
  sky(L.sky);
  if (o.sun !== false) plane(sunSprite('sun' + key, 160, L.sun), cam.x * .92 + (o.sunX ?? 500), o.sunY ?? 1500, 14000, { scale: 9, shadow: false, ay: .5 });
  tileX(cloud(key + 'cl', 520, 200, '#FFFFFF', 4), 6000, 1700, 2600, { seed: 2, jitter: 900, p: { scale: 4, shadowAlpha: .15 } });
  tileX(hills(key + 'far', 2400, 700, L.far, 1.3, .5, .55, 2), 7000, -60, 2400 * 5.5, { p: { scale: 5.6, ay: 1, shadowAlpha: .2 } });
  tileX(hills(key + 'h2', 2400, 600, L.hill2, 4.2, .35, .5, 3, { dots: 30 }), 3200, -40, 2400 * 2.9, { p: { scale: 3, ay: 1, shadowAlpha: .25 } });
  tileX(hills(key + 'h1', 2400, 500, L.hill1, 8.7, .3, .55, 4, { dots: 40 }), 1500, -20, 2400 * 1.9, { p: { scale: 2, ay: 1 } });
  if (o.trees !== false) {
    tileX(treeRound(key + 'tr', L.tree), 700, 0, 420, { seed: 5, jitter: 260, skip: .25, vs: .25, zj: 200, p: { scale: 1.3 } });
    tileX(pine(key + 'pn', shade(L.tree, -.1)), 900, 0, 560, { seed: 9, offset: 200, jitter: 300, skip: .4, vs: .2, p: { scale: 1.4 } });
  }
  plane(strip(key + 'gnd', 4200, 520, L.ground, 2, 10), Math.round(cam.x / 1400) * 1400, 40, 120, { scale: 1.2, ay: .1, shadowAlpha: .2 });
  plane(roadSprite(key + 'rd', 4200, 70, L.road), Math.round(cam.x / 1400) * 1400, 0, 20, { ay: .5, scale: 1.1, shadowAlpha: .15 });
  if (o.fence !== false) tileX(memo(key + 'fence', () => sprite(400, 90, (g, w, h) => { g.fillStyle = '#E8DAC0'; for (let x = 10; x < w; x += 80) rr(g, x, 0, 18, h, [9, 9, 0, 0]), g.fill(); g.fillRect(0, 24, w, 12); g.fillRect(0, 58, w, 12); })), 160, 0, 400, { p: { scale: 1 } });
  tileX(grass(key + 'fg', 1600, 260, L.fg, 3), -650, -40, 1600 * .45, { p: { scale: .45, ay: 1 } });
}
const freeRoadside = key => freeSprites(key);

// ---------- icons
function heart(g, s, color = PAL.red) { g.fillStyle = color; g.beginPath(); g.moveTo(0, s * .35); g.bezierCurveTo(-s * 1.1, -s * .3, -s * .45, -s * 1.05, 0, -s * .45); g.bezierCurveTo(s * .45, -s * 1.05, s * 1.1, -s * .3, 0, s * .35); g.fill(); }
function iconBadge(x, y, z, k, drawIcon, o = {}) {
  if (k <= 0) return;
  custom(x, y, z, (g, s) => {
    const e = eback(k, 2); g.scale(s * e, s * e); g.globalAlpha *= clamp(k * 4);
    g.shadowColor = 'rgba(30,15,5,.35)'; g.shadowBlur = 14; g.shadowOffsetY = 7;
    g.fillStyle = o.bg || '#F6EEDF'; g.beginPath(); g.arc(0, 0, 46, 0, TAU); g.fill(); g.shadowColor = 'transparent';
    drawIcon(g);
    if (o.check) { const ck = clamp((o.check) * 3); g.strokeStyle = PAL.teal; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(22, 26); g.lineTo(22 + 10 * ck, 26 + 10 * ck); if (ck > .5) g.lineTo(32 + 20 * (ck - .5) * 2, 36 - 26 * (ck - .5) * 2); g.stroke(); }
  }, { order: 6, dof: false });
}

// ======================================================================= 0 INTRO
defScene(0, {
  build() {
    this.cWhat = cue('What if you could'); this.cThousand = cue('a thousand years'); this.cForever = cue('Not forever');
    this.cJust = cue('Just one thousand'); this.cTen = cue('Ten full centuries'); this.cSun = cue('sunrises');
    this.cBirth = cue('birthdays'); this.cBye = cue('and goodbyes'); this.cGift = cue('greatest gift');
    this.cFeel = cue('actually feel like'); this.cFind = cue("Let's find out");
  },
  free() { freeSprites('s0'); },
  camera(lt, t) {
    const T = this.dur;
    const k = spline([
      [0, [0, 1900, -1150, 0]], [3.2, [0, 900, -1150, 0]], [6, [40, 430, -1150, 0]], [this.cTen - .2, [150, 400, -1150, 0]],
      [this.cGift + 1.2, [0, 430, -1000, 0]], [this.cFeel, [-150, 1050, -150, 0]], [T - 1.6, [-350, 170, 1150, 0]], [T, [-369, 111, 1530, 0]]
    ], lt);
    setCam({ x: k[0], y: k[1], z: k[2], roll: Math.sin(lt * .35) * .012 - .02 * smooth(inv(0, 4, lt)) + .02, aperture: lerp(.25, .8, smooth(inv(this.cFeel, T, lt))), focus: lerp(2000, 1700 - k[2], smooth(inv(this.cTen, this.cFeel, lt))) });
  },
  draw(lt, t) {
    const sunUp = smooth(inv(1, 9, lt));
    sky(skyAt(t, [[0, '#2E2A55'], [.5, '#8A5F86'], [1, '#E99A7B']], [[0, '#7FB2D0'], [.55, '#F2C59A'], [1, '#FBE3BE']], sunUp));
    plane(sunSprite('s0sun', 170, '#F6B24C'), 900, lerp(-1500, 3800, eout(inv(1.5, 12, lt))), 15000, { scale: 9.5, shadow: false, ay: .5 });
    // clouds the camera descends through
    for (let i = 0; i < 9; i++) { const r = hash(i + 4); plane(cloud('s0c' + (i % 3), 620, 230, mix('#F6D6CE', '#FFFFFF', r), i), (r - .5) * 2600, 1100 + r * 900, 300 + i * 260, { scale: 1.2 + r, shadowAlpha: .15 }); }
    plane(hills('s0far', 2600, 420, '#8B7CA6', 2.1, .6, .75, 2.5), 0, -200, 9000, { scale: 9, ay: 1, shadowAlpha: .2 });
    plane(hills('s0mid', 2600, 380, '#B07F8A', 5.3, .45, .7, 3, { dots: 30 }), 400, -150, 5200, { scale: 5.2, ay: 1, shadowAlpha: .25 });
    plane(hills('s0near', 2600, 330, '#C9906F', 1.7, .4, .75, 4, { dots: 40 }), -300, -100, 2900, { scale: 3.2, ay: 1 });
    groundPlane('#D9A478', '#C98F74');
    road3D(400, 14000, 150, '#F2D9B3', '#C99E78');
    // milestones along the road: Ten full centuries
    for (let i = 0; i < 10; i++) {
      const z = 1300 + i * 1150, k = pop(t, this.cTen + i * .13, .55);
      if (k > 0) plane(milestone('s0ms' + i, String((i + 1) * 100)), roadPath(z) + 140, 0, z, { scale: eback(k, 2.5) * 1.15, ay: 1, sy: eback(k, 2.5) });
    }
    // trees
    for (let i = 0; i < 26; i++) { const z = 600 + i * 520, side = i % 2 ? 1 : -1, x = roadPath(z) + side * (330 + hash(i) * 600); plane(treeRound('s0t' + (i % 2), i % 2 ? '#B9714F' : '#9E6B52'), x, 0, z, { scale: .9 + hash(i * 3) * .5 }); }
    // birth house at the start of the road
    plane(house('s0house', 300, 300, '#F2E4CC', '#B8524A', 1), -300, 0, 1700, { scale: 1 });
    // title
    const tl = this.cWhat;
    const passFade = 1 - smooth(inv(-1900, -1500, cam.z - 900 - 1200)) * 0; // camera flies over the title (it sits above the road)
    headline(0, 930, 900, 'WHAT IF YOU LIVED', 120, riseAnim(t, tl, .7, .04), { color: '#FFF4E4', spacing: .04, depth: 5, dof: false });
    const big = this.cThousand - .15;
    const bounce = 1 + .08 * Math.sin(clamp((t - this.cJust) / .5) * Math.PI);
    custom(0, 560, 900, (g, s) => {
      g.scale(s * bounce * 2, s * bounce * 2);
      for (let d = 10; d >= 1; d--) { g.save(); g.translate(d * 2, d * 2.2); paperText(g, '1000', 300, { anim: riseAnim(t, big, .9, .09), color: '#B5552F', shadow: d === 10, spacing: -.02 }); g.restore(); }
      paperText(g, '1000', 300, { anim: riseAnim(t, big, .9, .09), color: '#F6E7CF', shadow: false, spacing: -.02 });
      // gift ribbon
      const gk = clamp((t - this.cGift) / .7);
      if (gk > 0) {
        g.fillStyle = PAL.red; g.globalAlpha *= 1; const L = 640 * eout(gk);
        g.fillRect(-17, -190, 34, 260 * eout(gk));
        g.save(); g.translate(0, -195); g.scale(eback(clamp(gk * 1.5 - .3)), eback(clamp(gk * 1.5 - .3)));
        g.beginPath(); g.ellipse(-45, 0, 50, 26, -.5, 0, TAU); g.ellipse(45, 0, 50, 26, .5, 0, TAU); g.fill(); g.fillStyle = '#A8302A'; g.beginPath(); g.arc(0, 0, 18, 0, TAU); g.fill(); g.restore();
      }
    }, { order: 4, dof: false });
    headline(0, 230, 900, 'YEARS?', 150, riseAnim(t, this.cThousand + .35, .7, .06), { color: '#FFF4E4', spacing: .08, depth: 5, dof: false });
    // Not forever: infinity sign pops, gets struck through
    const fk = pop(t, this.cForever - .1, .45), fo = 1 - smooth(inv(this.cJust + .1, this.cJust + .6, t));
    if (fk > 0 && fo > 0) custom(800, 620, 800, (g, s) => {
      g.scale(s * eback(fk, 2) * 1.6, s * eback(fk, 2) * 1.6); g.globalAlpha *= fo;
      g.lineWidth = 26; g.strokeStyle = '#FFF4E4'; g.shadowColor = 'rgba(30,15,5,.4)'; g.shadowBlur = 12; g.shadowOffsetY = 6;
      g.beginPath(); for (let a = 0; a <= TAU + .01; a += .05) { const d = 1 + Math.sin(a) ** 2; g.lineTo(110 * Math.cos(a) / d, 110 * Math.sin(a) * Math.cos(a) / d); } g.stroke();
      const sk = clamp((t - this.cForever - .35) / .3); g.strokeStyle = PAL.red; g.lineWidth = 20; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-130, 80); g.lineTo(-130 + 260 * sk, 80 - 160 * sk); g.stroke();
    }, { order: 5 });
    // three icons: sunrises, birthdays, goodbyes
    const icons = [[this.cSun, -560, g => { g.fillStyle = '#F6B24C'; g.beginPath(); g.arc(0, 8, 22, Math.PI, 0); g.fill(); g.fillRect(-32, 8, 64, 6); for (let a = 0; a < 5; a++) { const an = Math.PI + (a + .5) * Math.PI / 5; g.fillRect(Math.cos(an) * 30 - 3, 8 + Math.sin(an) * 30 - 3, 6, 6); } }],
    [this.cBirth, 0, g => { g.fillStyle = '#E58F84'; g.fillRect(-26, -4, 52, 28); g.fillStyle = '#F6EEDF'; g.fillRect(-26, 4, 52, 5); g.fillStyle = PAL.mustard; g.fillRect(-3, -22, 6, 18); g.fillStyle = '#F6B24C'; g.beginPath(); g.ellipse(0, -28, 5, 8, 0, 0, TAU); g.fill(); }],
    [this.cBye, 560, g => { g.save(); g.rotate(Math.sin(t * 9) * .25); g.fillStyle = '#F0C9A4'; rr(g, -14, -20, 28, 34, 10); g.fill(); for (let f = 0; f < 4; f++) { rr(g, -14 + f * 7.5, -38, 6, 22, 3); g.fill(); } g.restore(); }]];
    const iconsOut = 1 - smooth(inv(this.cGift - .4, this.cGift + .2, t));
    icons.forEach(([c, x, fn]) => { const k = pop(t, c - .05, .45) * iconsOut; iconBadge(x * .8, -60, 700, k * 1, fn); });
  },
});

// ======================================================================= 1 BORN TODAY
defScene(1, {
  carrierType: 'iris', carrierOpts: { dur: 1.2, c1: '#2A1E1A' },
  build() {
    const c = cue; this.cSchool = c('school'); this.cFriends = c('make friends'); this.cLove = c('fall in love'); this.cJob = c('first job');
    this.cGrow = c('grow up just like'); this.c30 = c('thirtieth birthday'); this.cHeart = c('Your heart'); this.cSkin = c('your skin'); this.cBrain = c('your brain');
    this.cNobody = c('nobody notices'); this.cNot = c('Not even you');
    this.stop = this.cNobody + .3;
  },
  free() { freeRoadside('s1'); },
  heroX(lt) { // walks right, slows to a stop at "nobody notices"
    const v = 78, ts = this.stop - this.t0;
    return lt < ts ? v * lt : v * ts + v * .6 * (1 - Math.exp(-(lt - ts) * 1.4)) / 1.4 * 1.4 * .5;
  },
  camera(lt, t) {
    const hx = this.heroX(lt), push = smooth(inv(this.cNobody, this.cNot + 1.2, t));
    setCam({ x: hx + 200 - push * 170 + Math.sin(lt * .4) * 25, y: lerp(210, 160, push) + Math.sin(lt * .3) * 12, z: lerp(-950, -600, push) + Math.sin(lt * .25) * 30,
      roll: Math.sin(lt * .5) * .008, aperture: lerp(.35, .9, push), focus: lerp(1150, 760, push) });
  },
  draw(lt, t) {
    roadside('s1', 'day', { sunX: 600, sunY: 1200 + lt * 12 });
    const hx = this.heroX(lt), age = clamp(lt / (this.c30 - this.t0)), walking = 1 - smooth(inv(this.stop - .2, this.stop + .8, t));
    const ph = hx / 78 * 5.2;
    // landmarks placed where the hero will be at their cue
    const at = c => this.heroX(c - this.t0);
    plane(memo('s1school', () => sprite(360, 300, (g, w, h) => { g.fillStyle = '#D98B5F'; g.fillRect(0, h * .3, w, h * .7); g.fillStyle = '#9C4F3B'; g.beginPath(); g.moveTo(-10, h * .32); g.lineTo(w / 2, 0); g.lineTo(w + 10, h * .32); g.fill(); g.fillStyle = '#F6EEDF'; g.fillRect(w * .3, h * .38, w * .4, h * .1); g.fillStyle = PAL.ink; g.font = '800 28px Fraunces'; g.textAlign = 'center'; g.fillText('SCHOOL', w / 2, h * .465); for (const x of [.1, .75]) { g.fillStyle = '#9FC3D6'; g.fillRect(w * x, h * .55, w * .15, h * .18); } g.fillStyle = '#6B3B2E'; g.fillRect(w * .42, h * .68, w * .16, h * .32); g.fillStyle = PAL.red; g.fillRect(w * .5, -40, 4, 44); g.fillRect(w * .5, -40, 34, 20); })), at(this.cSchool) + 80, 0, 260, { scale: 1.15 });
    plane(memo('s1office', () => sprite(300, 520, (g, w, h) => { g.fillStyle = '#7C93A6'; g.fillRect(0, 0, w, h); g.fillStyle = '#5E7387'; g.fillRect(0, 0, w, 24); for (let y = 50; y < h - 80; y += 62) for (let x = 24; x < w - 40; x += 64) { g.fillStyle = hash(x * y) > .5 ? '#FFE3A3' : '#B8CBD8'; g.fillRect(x, y, 40, 40); } g.fillStyle = '#3F4F5E'; g.fillRect(w * .38, h - 90, w * .24, 90); })), at(this.cJob) + 160, 0, 330, { scale: 1.1 });
    // clock on a post: stops at 30
    const cx = at(this.c30) + 120;
    custom(cx, 0, -60, (g, s) => {
      g.scale(s, s); g.fillStyle = '#5A4636'; g.fillRect(-7, -330, 14, 330);
      g.shadowColor = 'rgba(30,15,5,.35)'; g.shadowBlur = 14; g.shadowOffsetX = 6; g.shadowOffsetY = 8;
      g.fillStyle = '#F6EEDF'; g.beginPath(); g.arc(0, -390, 64, 0, TAU); g.fill(); g.shadowColor = 'transparent';
      g.strokeStyle = PAL.ink; g.lineWidth = 5; g.stroke(); for (let i = 0; i < 12; i++) { const a = i * TAU / 12; g.fillStyle = PAL.ink; g.fillRect(Math.cos(a) * 50 - 3, -390 + Math.sin(a) * 50 - 3, 6, 6); }
      const tt = Math.min(t, this.c30 + .05), m = tt * 2.2, hh = tt * .18;
      const frozen = t > this.c30 + .05;
      g.lineCap = 'round'; g.strokeStyle = frozen ? PAL.red : PAL.ink;
      g.lineWidth = 6; g.beginPath(); g.moveTo(0, -390); g.lineTo(Math.cos(hh) * 30, -390 + Math.sin(hh) * 30); g.stroke();
      g.lineWidth = 4; g.beginPath(); g.moveTo(0, -390); g.lineTo(Math.cos(m) * 48, -390 + Math.sin(m) * 48); g.stroke();
      if (frozen) { const fk = clamp((t - this.c30) / 1.2); g.strokeStyle = `rgba(150,210,230,${1 - fk})`; g.lineWidth = 8 * (1 - fk); g.beginPath(); g.arc(0, -390, 64 + fk * 140, 0, TAU); g.stroke(); }
    }, { order: 1 });
    // background walkers (everyone else keeps growing up)
    const crowd = smooth(inv(this.cGrow - .5, this.cGrow + .5, t));
    for (let i = 0; i < 6; i++) {
      const ox = (i - 2.5) * 260 + hash(i) * 90, wx = hx + ox + (lt - (this.cGrow - this.t0)) * 8 * (i % 3);
      custom(wx, 0, 230, (g, s) => { g.scale(s, s); person(g, { walk: lt * 5 + i, age: lerp(.6, 1.15, clamp((t - this.cGrow) / 8)), grey: clamp((t - this.cHeart) / 10), color: ['#8C6A9E', '#5E8F63', '#C9765A', '#4F7CA0', '#B28B3E', '#7A5C4C'][i], hair: '#4A3426', t }); }, { alpha: crowd, order: 0 });
    }
    // friends + partner walking alongside
    const fr = [[this.cFriends, -150, '#C9765A', false], [this.cFriends + .25, -300, '#5E8F63', false], [this.cLove - .2, 150, '#B05A7A', true]];
    fr.forEach(([c, off, col, lh], j) => {
      const k = smooth(inv(c - .6, c + .4, t)); if (k <= 0) return;
      const leave = j < 2 ? smooth(inv(this.cGrow + 1.5, this.cGrow + 4, t)) : 0;
      const fx = hx + off + (1 - k) * -500 + leave * 900 + (t > this.stop ? (t - this.stop) * 78 * (j === 2 ? .9 : 1) : 0);
      custom(fx, 0, j === 2 ? 15 : 40, (g, s) => { g.scale(s, s); person(g, { walk: ph + j * 1.3 + (t > this.stop ? (t - this.stop) * 5 : 0), age: age * .95 + .05, color: col, longHair: lh, hair: lh ? '#5A2E22' : '#2E2018', t, grey: clamp((t - this.cHeart) / 12) * .6 }); }, { order: 2 });
    });
    // the hero
    custom(hx, 0, 0, (g, s) => {
      g.scale(s, s);
      const turn = smooth(inv(this.cNot - .3, this.cNot + .3, t));
      if (turn > 0) g.scale(1 - turn * 2 < 0 ? -(turn * 2 - 1) : 1 - turn * 2 + .001, 1);
      person(g, { ...HERO, walk: ph, walkAmp: walking, age: age * .95 + .05, t });
    }, { order: 3 });
    // love heart
    const hk = pop(t, this.cLove + .2, .6);
    if (hk > 0) custom(hx + 70, 260 + (t - this.cLove) * 40, 10, (g, s) => { g.scale(s * eback(hk, 3), s * eback(hk, 3)); g.globalAlpha *= 1 - smooth(inv(this.cLove + 2, this.cLove + 3, t)); g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 10; heart(g, 40); }, { order: 6 });
    // heart / skin / brain badges freezing
    const badges = [[this.cHeart, -110, g => heart(g, 26)], [this.cSkin, 0, g => { g.fillStyle = '#F0C9A4'; rr(g, -16, -22, 32, 40, 12); g.fill(); for (let f = 0; f < 4; f++) { rr(g, -16 + f * 8.5, -40, 7, 22, 3); g.fill(); } }],
    [this.cBrain, 110, g => { g.fillStyle = '#E58F84'; g.beginPath(); g.arc(-10, -4, 18, 0, TAU); g.arc(10, -4, 18, 0, TAU); g.arc(0, -16, 16, 0, TAU); g.fill(); g.strokeStyle = '#B05A5A'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -30); g.quadraticCurveTo(-6, -8, 4, 12); g.stroke(); }]];
    const bOut = 1 - smooth(inv(this.cNobody - .3, this.cNobody + .3, t));
    badges.forEach(([c, ox, fn]) => iconBadge(hx + ox, 330, 0, pop(t, c - .05, .45) * bOut, fn, { check: clamp((t - c - .4) / .5) }));
    overlay(g => drawAge(g, t), 1);
  },
});

// ======================================================================= 2 NATURE'S LONG-LIVERS (underwater)
defScene(2, {
  carrierType: 'wave', carrierOpts: { dur: 1.5, c1: '#2E6F8E', c2: '#3F86A3', c3: '#7DB8C8' },
  build() {
    const c = cue; this.cShark = c('Greenland shark'); this.cFour = c('four hundred years'); this.cClam = c('A clam'); this.cFive = c('five hundred years');
    this.cJelly = c('tiny jellyfish'); this.cBack = c('turn back'); this.cCells = c('cells that repair'); this.cFix = c('fixing damage'); this.cStop = c('simply stop wearing');
  },
  free() { freeSprites('s2'); },
  camera(lt, t) {
    const T = this.dur, j = this.cJelly - this.t0, c = this.cCells - this.t0;
    const k = spline([[0, [0, -150, -1150]], [this.cShark - this.t0 + 1, [200, -420, -1150]], [this.cClam - this.t0, [900, -900, -1100]], [this.cFive - this.t0 + 1.5, [1450, -1260, -1000]],
      [j + 1, [2250, -1250, -1050]], [c - .4, [2390, -1260, -650]], [c + 1.2, [2400, -1270, 120]], [T, [2410, -1275, 160]]], lt);
    setCam({ x: k[0] + Math.sin(lt * .4) * 30, y: k[1] + Math.sin(lt * .53) * 20, z: k[2], roll: Math.sin(lt * .3) * .03, aperture: .7, focus: lerp(1700, 1250, smooth(inv(this.cJelly, this.cCells, t))) });
  },
  extraMotion(lt, t) { return Math.abs(t - this.cCells - .4) < .8 ? 25 : 0; },
  draw(lt, t) {
    const depth = clamp(-cam.y / 2000);
    sky([[0, mix('#5FA8C2', '#16405C', depth)], [.6, mix('#2F7596', '#0D2A40', depth)], [1, mix('#1D5675', '#081C2C', depth)]]);
    // light shafts
    raw(9000, g => { g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { const x = ((i * 380 - cam.x * .25) % 2600 + 2600) % 2600 - 300, a = .05 * (1 - depth) * (0.6 + .4 * Math.sin(t * .7 + i)); const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, `rgba(220,250,255,${a})`); lg.addColorStop(1, 'rgba(220,250,255,0)'); g.fillStyle = lg; g.beginPath(); g.moveTo(x, -10); g.lineTo(x + 140, -10); g.lineTo(x + 420, H); g.lineTo(x + 180, H); g.fill(); } });
    // ice floes overhead (Arctic)
    for (let i = 0; i < 6; i++) plane(memo('s2ice' + (i % 3), () => sprite(700, 160, (g, w, h) => { g.fillStyle = '#E8F4F6'; g.beginPath(); g.moveTo(0, 30); g.lineTo(w * .2, 0); g.lineTo(w * .8, 10); g.lineTo(w, 50); g.lineTo(w * .85, h); g.lineTo(w * .4, h * .8); g.lineTo(w * .1, h); g.fill(); g.fillStyle = '#BFDDE6'; g.fillRect(0, h * .6, w, h * .4); }, { grain: .25 })), -900 + i * 900, 420, 400 + (i % 3) * 500, { scale: 1.2, ay: .5, shadowAlpha: .2 });
    // seafloor strata
    plane(strip('s2floor3', 5200, 800, '#1F4B5E', 2, 40), 1600, -1550, 2600, { scale: 2.5, ay: 0 });
    plane(strip('s2floor2', 5200, 700, '#2D6170', 5, 30), 1800, -1600, 1100, { scale: 1.6, ay: 0 });
    plane(strip('s2floor1', 5200, 600, '#3E7480', 8, 24), 2000, -1640, 200, { scale: 1.1, ay: 0 });
    for (let i = 0; i < 16; i++) { const x = 300 + i * 260, z = 150 + (i % 4) * 280; custom(x, -1640 + (i % 4) * 20, z, (g, s) => { g.scale(s, s); g.strokeStyle = i % 2 ? '#3F8F6A' : '#5FA77A'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); for (let y = 0; y < 260; y += 20) g.lineTo(Math.sin(y * .03 + t * 1.3 + i) * 18, -y); g.stroke(); }); }
    // Greenland shark: huge, slow
    const sx = 900 - (t - this.t0) * 32;
    custom(sx, -520 + Math.sin(t * .4) * 20, 650, (g, s) => {
      g.scale(-s * 1.25, s * 1.25); const tail = Math.sin(t * 1.4) * .18;
      g.shadowColor = 'rgba(0,10,20,.4)'; g.shadowBlur = 30; g.shadowOffsetY = 20;
      g.fillStyle = '#5C6F78'; g.beginPath(); g.moveTo(-330, 0); g.bezierCurveTo(-250, -95, 150, -105, 300, -20); g.lineTo(330, 0); g.bezierCurveTo(200, 60, -200, 70, -330, 0); g.fill();
      g.shadowColor = 'transparent';
      g.save(); g.translate(300, -10); g.rotate(tail); g.beginPath(); g.moveTo(0, 0); g.lineTo(130, -110); g.lineTo(100, -10); g.lineTo(120, 70); g.closePath(); g.fill(); g.restore();
      g.beginPath(); g.moveTo(-40, -80); g.lineTo(30, -140); g.lineTo(60, -85); g.fill(); g.beginPath(); g.moveTo(-120, 30); g.lineTo(-60, 120); g.lineTo(-30, 40); g.fill();
      g.fillStyle = '#8FA1A8'; g.beginPath(); g.moveTo(-300, 10); g.bezierCurveTo(-150, 55, 150, 50, 300, 0); g.bezierCurveTo(150, 30, -150, 30, -300, 10); g.fill();
      g.fillStyle = '#C9D6DA'; g.beginPath(); g.arc(-255, -18, 7, 0, TAU); g.fill();
      for (let i = 0; i < 4; i++) { g.strokeStyle = 'rgba(40,50,60,.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-200 + i * 14, -30); g.lineTo(-206 + i * 14, 10); g.stroke(); }
    }, { order: 2 });
    tagItem(sx - 50, -200, 600, 'GREENLAND SHARK', '~400 YEARS', pop(t, this.cShark, .6) * (1 - smooth(inv(this.cClam - .5, this.cClam, t))), { size: 1.7 });
    // Ming the clam
    custom(1500, -1600, 380, (g, s) => {
      g.scale(s * 1.6, s * 1.6); const open = .12 + Math.max(0, Math.sin(t * .8)) * .08;
      g.shadowColor = 'rgba(0,10,20,.4)'; g.shadowBlur = 14; g.shadowOffsetY = 8;
      g.fillStyle = '#B9A58C'; g.beginPath(); g.ellipse(0, 0, 90, 55, 0, Math.PI, 0); g.fill();
      g.save(); g.rotate(-open); g.fillStyle = '#D2BFA4'; g.beginPath(); g.ellipse(0, 0, 90, 60, 0, Math.PI, 0); g.fill();
      g.strokeStyle = '#9C8770'; g.lineWidth = 3; for (let i = 1; i < 6; i++) { g.beginPath(); g.ellipse(0, 0, 90 * i / 6, 60 * i / 6, 0, Math.PI, 0); g.stroke(); } g.restore();
    }, { order: 2 });
    tagItem(1500, -1320, 380, 'MING THE CLAM', '507 YEARS', pop(t, this.cClam + .4, .6) * (1 - smooth(inv(this.cJelly - .4, this.cJelly, t))), { size: 1.5 });
    // immortal jellyfish: ages in reverse
    const jr = clamp((t - this.cBack) / 3.2), rev = Math.sin(jr * Math.PI); // shrinks to polyp and regrows
    custom(2400, -1260 + Math.sin(t * .9) * 25, 260, (g, s) => {
      g.scale(s * (1 - rev * .7), s * (1 - rev * .7));
      g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(0, 0, 10, 0, 0, 230); gl.addColorStop(0, 'rgba(255,160,190,.35)'); gl.addColorStop(1, 'rgba(255,160,190,0)'); g.fillStyle = gl; g.beginPath(); g.arc(0, 0, 230, 0, TAU); g.fill(); g.globalCompositeOperation = 'source-over';
      const pulse = 1 + Math.sin(t * 2.2) * .07;
      g.strokeStyle = 'rgba(255,190,205,.8)'; g.lineWidth = 4; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(-50 + i * 14, 10); for (let y = 0; y < 170; y += 12) g.lineTo(-50 + i * 14 + Math.sin(y * .05 + t * 2 + i) * 10, 10 + y); g.stroke(); }
      g.fillStyle = 'rgba(255,175,195,.92)'; g.beginPath(); g.ellipse(0, 0, 80 * pulse, 70 / pulse, 0, Math.PI, 0); g.quadraticCurveTo(0, 30, -80 * pulse, 0); g.fill();
      g.fillStyle = '#E2556F'; g.beginPath(); g.ellipse(0, -20, 26, 20, 0, 0, TAU); g.fill();
    }, { order: 3 });
    const jk = pop(t, this.cJelly + .3, .6) * (1 - smooth(inv(this.cCells - .8, this.cCells - .3, t)));
    tagItem(2400, -1000, 260, 'TURRITOPSIS', 'AGES IN REVERSE', jk, { accent: '#E2556F', size: 1.3 });
    if (jr > 0 && jr < 1) custom(2400, -1260, 250, (g, s) => { g.scale(s, s); g.strokeStyle = 'rgba(255,240,245,.8)'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, 190, -Math.PI / 2, -Math.PI / 2 + TAU * eio(jr) * .9); g.stroke(); }, { order: 4 });
    // bubbles
    for (let i = 0; i < 40; i++) { const r = hash(i * 7), x = 200 + r * 2600, y = -1700 + ((t * (30 + r * 40) + r * 2000) % 2200), z = 100 + hash(i) * 1600; custom(x, y, z, (g, s) => { g.scale(s, s); g.strokeStyle = 'rgba(230,250,255,.6)'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 6 + r * 10, 0, TAU); g.stroke(); }); }
    // cells: screen-space macro world fades in as camera dives into the jellyfish
    const ck = smooth(inv(this.cCells - .2, this.cCells + .9, t));
    if (ck > 0) overlay(g => drawCells(g, t, ck, this), -1);
  },
});
const CELL_LAYERS = [0, 1, 2].map(() => makeCanvas(W, H));
function drawCells(g, t, ck, sc) {
  g.globalAlpha = ck;
  const lg = g.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * .7); lg.addColorStop(0, '#F7C6C8'); lg.addColorStop(1, '#B85B72'); g.fillStyle = lg; g.fillRect(0, 0, W, H);
  const zoom = 1 + (t - sc.cCells) * .03;
  for (let layer = 2; layer >= 0; layer--) {
    const R = [48, 72, 110][layer] * zoom, par = [.3, .6, 1][layer], ox = (t * 18 * par) % (R * 3), blur = [5, 2, 0][layer];
    const L = CELL_LAYERS[layer], lg2 = L.getContext('2d'); lg2.setTransform(1, 0, 0, 1, 0, 0); lg2.clearRect(0, 0, W, H);
    const gOuter = g; g = lg2; g.save();
    let id = 0;
    for (let row = -1; row < H / (R * 1.5) + 2; row++) for (let col = -1; col < W / (R * 1.732) + 2; col++) {
      id++; if (hash(id * 3.3 + layer * 99) < (layer === 0 ? .55 : .2)) continue;
      const cx = col * R * 1.732 + (row % 2 ? R * .866 : 0) - ox, cy = row * R * 1.5;
      g.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; g.lineTo(cx + Math.cos(a) * R * .92, cy + Math.sin(a) * R * .92); } g.closePath();
      g.save(); g.translate(3, 6); g.fillStyle = 'rgba(120,30,50,.25)'; g.fill(); g.restore();
      g.fillStyle = mix(['#F2A3AE', '#EC8E9E', '#F7D0CF'][layer], '#FFE7C2', layer === 0 ? clamp((t - sc.cStop) / 1.5) * .6 : 0);
      g.fill();
      g.fillStyle = 'rgba(180,60,90,.5)'; g.beginPath(); g.arc(cx + R * .1, cy - R * .05, R * .22, 0, TAU); g.fill();
      if (layer === 0) {
        // damage crack appears, then a gold seam repairs it
        const tc = sc.cCells + .5 + hash(id) * 4.5, dmg = clamp((t - tc) / .25), fix = clamp((t - tc - .6) / .6);
        if (dmg > 0) {
          const r = mulberry(id); const pts = []; let px = cx - R * .6, py = cy + (r() - .5) * R * .6; pts.push([px, py]);
          for (let k = 0; k < 5; k++) { px += R * .24; py += (r() - .5) * R * .4; pts.push([px, py]); }
          const n = Math.ceil(dmg * pts.length);
          g.lineCap = 'round'; g.lineJoin = 'round';
          g.strokeStyle = 'rgba(90,20,40,.85)'; g.lineWidth = 5; g.beginPath(); pts.slice(0, n).forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
          if (fix > 0) { g.strokeStyle = '#F2C14E'; g.lineWidth = 7; g.beginPath(); pts.slice(0, Math.ceil(fix * pts.length)).forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); g.shadowColor = 'transparent'; }
        }
      }
    }
    g.restore(); g = gOuter;
    g.save(); if (blur) g.filter = `blur(${blur}px)`; g.drawImage(L, 0, 0); g.restore();
  }
  const tk = pop(t, sc.cFix, .6);
  if (tk > 0) { g.save(); g.translate(W / 2, 170); g.globalAlpha = ck * clamp(tk * 3); paperText(g, 'SELF-REPAIR', 96, { anim: riseAnim(t, sc.cFix, .6, .04), color: '#FFF4E4', spacing: .1 }); g.restore(); }
  g.globalAlpha = 1;
}

// ======================================================================= 3 NOT IMMORTAL
defScene(3, {
  carrierType: 'sheets', carrierOpts: { dur: 1.3, c1: '#F3E9D7', c2: '#E6D3B3', c3: '#C9AE86' },
  build() {
    const c = cue; this.cNot = c('you are not immortal'); this.cSick = c('still get sick'); this.cAcc = c('still have accidents'); this.cSci = c('Some scientists');
    this.cThou = c('about a thousand years'); this.cUnl = c('something unlucky'); this.cEvery = c('every single day'); this.cCare = c('to be careful'); this.cVery = c('Very careful');
  },
  free() { freeRoadside('s3'); },
  heroX(lt) { const t = lt + this.t0, dodge = smooth(inv(this.cAcc + .1, this.cAcc + .6, t)) * -120 + smooth(inv(this.cAcc + 1.1, this.cAcc + 2, t)) * 120; const slow = t > this.cVery ? (t - this.cVery) * -40 : 0; return lt * 70 + dodge + slow; },
  camera(lt, t) {
    const hx = this.heroX(lt), up = smooth(inv(this.cSci - .4, this.cSci + .8, t)) * (1 - smooth(inv(this.cEvery - .6, this.cEvery + .4, t)));
    setCam({ x: hx + 200 + Math.sin(lt * .5) * 30, y: lerp(240, 520, up) + Math.sin(lt * .4) * 10, z: lerp(-1150, -1400, up), roll: Math.sin(lt * .45) * .01 - up * .02, aperture: .45, focus: lerp(1150, 1500, up) });
  },
  draw(lt, t) {
    roadside('s3', 'day', { sunX: 300 });
    const hx = this.heroX(lt), tiptoe = t > this.cVery;
    // building with flower pot window
    const bx = this.heroX(this.cAcc - this.t0) + 160;
    plane(building('s3bld', 380, 760, '#C98B6B', 4, .2, 1), bx + 120, 0, 140, { scale: 1 });
    // flower pot falls
    const fall = clamp((t - this.cAcc + .1) / .7), py = lerp(560, 0, fall * fall), smash = t > this.cAcc + .6;
    if (!smash) custom(bx, py, 60, (g, s) => { g.scale(s, s); g.rotate(fall * 2); g.fillStyle = '#C0603E'; g.beginPath(); g.moveTo(-30, -50); g.lineTo(30, -50); g.lineTo(22, 0); g.lineTo(-22, 0); g.fill(); g.fillStyle = '#5E8F63'; g.beginPath(); g.arc(-10, -66, 18, 0, TAU); g.arc(12, -70, 16, 0, TAU); g.fill(); g.fillStyle = PAL.rose; g.beginPath(); g.arc(0, -82, 9, 0, TAU); g.fill(); }, { order: 3 });
    else for (let i = 0; i < 9; i++) { const k = clamp((t - this.cAcc - .6) / .8), a = -Math.PI * (i + .5) / 9; custom(bx + Math.cos(a) * 110 * eout(k), Math.max(0, -Math.sin(a) * 160 * k - 260 * k * k), 60, (g, s) => { g.scale(s, s); g.rotate(k * 5 * (i - 4)); g.fillStyle = i % 3 ? '#C0603E' : '#5E8F63'; g.fillRect(-10, -8, 20, 16); }, { order: 3 }); }
    // sick: rain cloud above hero
    const sk = smooth(inv(this.cSick - .3, this.cSick + .3, t)) * (1 - smooth(inv(this.cAcc - .2, this.cAcc + .3, t)));
    if (sk > 0) custom(hx, 380, 0, (g, s) => { g.scale(s * eback(sk), s * eback(sk)); g.fillStyle = '#8A97A6'; g.shadowColor = 'rgba(0,0,0,.25)'; g.shadowBlur = 12; g.beginPath(); g.arc(-40, 0, 40, 0, TAU); g.arc(10, -18, 50, 0, TAU); g.arc(55, 5, 34, 0, TAU); g.rect(-60, 0, 120, 30); g.fill(); g.shadowColor = 'transparent'; g.strokeStyle = '#6FA2C9'; g.lineWidth = 4; for (let i = 0; i < 6; i++) { const y = ((t * 300 + i * 40) % 160); g.beginPath(); g.moveTo(-50 + i * 20, 40 + y); g.lineTo(-54 + i * 20, 58 + y); g.stroke(); } }, { order: 5 });
    // hero
    custom(hx, 0, 0, (g, s) => { g.scale(s, s); person(g, { ...HERO, walk: hx / 70 * 5 * (tiptoe ? .6 : 1), walkAmp: tiptoe ? .55 : 1, t, armUp: t > this.cAcc && t < this.cAcc + .8 }); }, { order: 4 });
    // headline NOT IMMORTAL (NOT stamps in red)
    const hOut = 1 - smooth(inv(this.cSick - .5, this.cSick, t));
    if (hOut > 0) {
      custom(cam.x, 640, 900, (g, s) => {
        g.scale(s * 1.5, s * 1.5); g.globalAlpha *= hOut;
        paperText(g, 'IMMORTAL', 150, { anim: riseAnim(t, this.cNot - .3, .6, .04), color: '#FFF4E4', spacing: .06 });
        const st = clamp((t - this.cNot - .1) / .25); if (st > 0) { g.save(); g.translate(-30, -150); g.rotate(-.12); g.scale(lerp(2.5, 1, eout(st)), lerp(2.5, 1, eout(st))); g.globalAlpha *= st; paperText(g, 'NOT', 120, { color: PAL.red }); g.restore(); }
      }, { order: 6 });
    }
    // estimate: ≈1000 years with a rolling die
    const ek = smooth(inv(this.cSci - .2, this.cSci + .5, t)) * (1 - smooth(inv(this.cEvery - .6, this.cEvery, t)));
    if (ek > 0) {
      custom(cam.x, 800, 700, (g, s) => { g.scale(s * 1.8, s * 1.8); g.globalAlpha *= ek; paperText(g, 'NO AGING', 70, { anim: riseAnim(t, this.cSci, .6, .03), color: '#FFF4E4', spacing: .2 }); g.translate(0, 150); paperText(g, '≈ 1,000 YEARS', 130, { anim: riseAnim(t, this.cThou - .2, .7, .04), color: '#FFE2B0' }); }, { order: 6 });
      const dk = clamp((t - this.cUnl + .2) / 1.4);
      if (dk > 0) custom(cam.x - 900 + dk * 1100, 120 + Math.abs(Math.sin(dk * 9)) * 160 * (1 - dk), 300, (g, s) => { g.scale(s, s); g.rotate(dk * 12); g.globalAlpha *= ek; g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 12; g.shadowOffsetY = 8; g.fillStyle = '#F6EEDF'; rr(g, -50, -50, 100, 100, 16); g.fill(); g.shadowColor = 'transparent'; g.fillStyle = PAL.ink; [[-25, -25], [25, 25], [0, 0], [25, -25], [-25, 25]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 8, 0, TAU); g.fill(); }); }, { order: 6 });
    }
    // CAREFUL road sign
    const ck = pop(t, this.cCare - .1, .6);
    if (ck > 0) custom(hx + 330, 0, -40, (g, s) => {
      g.scale(s, s); const wob = Math.sin((t - this.cVery) * 10) * .1 * Math.exp(-Math.max(0, t - this.cVery) * 2) * (t > this.cVery ? 1 : 0);
      g.fillStyle = '#6B5A48'; g.fillRect(-6, -380 * eback(ck, 2), 12, 380 * eback(ck, 2));
      g.translate(0, -420 * eback(ck, 2)); g.rotate(Math.PI / 4 + wob); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 14; g.shadowOffsetX = 7; g.shadowOffsetY = 9;
      g.fillStyle = '#F2C14E'; rr(g, -95, -95, 190, 190, 16); g.fill(); g.shadowColor = 'transparent'; g.strokeStyle = PAL.ink; g.lineWidth = 7; rr(g, -82, -82, 164, 164, 12); g.stroke();
      g.rotate(-Math.PI / 4); g.fillStyle = PAL.ink; g.font = '900 34px Fraunces'; g.textAlign = 'center'; g.fillText('CAREFUL', 0, 12);
    }, { order: 5 });
  },
});

// ======================================================================= 4 EIGHTY LOOKS THIRTY
defScene(4, {
  carrierType: 'leaves', carrierOpts: { dur: 1.4, c1: '#E3A93B', c2: '#D9733B', c3: '#B9512F' },
  build() {
    const c = cue; this.c80 = c("You're eighty"); this.cLook = c('still look thirty'); this.cRet = c('friends are retiring'); this.cGrey = c('turned grey'); this.cSlow = c('steps are slower');
    this.cAsk = c('asking questions'); this.cDoc = c('Doctors want'); this.cStare = c('Strangers stare'); this.cChoice = c('So you make'); this.cMove = c('move to a new city');
    this.cName = c('take a new name'); this.cOver = c('start over');
  },
  free() { freeRoadside('s4'); freeRoadside('s4b'); },
  camera(lt, t) {
    const travel = eio(inv(this.cMove - .3, this.cMove + 1.6, t));
    const nameK = smooth(inv(this.cName - .5, this.cName + .3, t));
    setCam({ x: lerp(0, 3600, travel) + Math.sin(lt * .4) * 40 + lt * 6, y: 210 + Math.sin(lt * .5) * 10 - nameK * 20, z: -1150 + Math.sin(lt * .3) * 40 + nameK * 150, roll: Math.sin(lt * .4) * .01 + (travel > 0 && travel < 1 ? Math.sin(travel * Math.PI) * .03 : 0), aperture: .5 + nameK * .6, focus: lerp(1150, 900, nameK) });
  },
  draw(lt, t) {
    const travel = eio(inv(this.cMove - .3, this.cMove + 1.6, t));
    if (travel < .5) roadside('s4', 'warm', { trees: true, fence: true }); else roadside('s4b', 'city', { trees: false, fence: false });
    // town houses behind with staring windows
    const stare = smooth(inv(this.cStare - .2, this.cStare + .4, t)) * (1 - smooth(inv(this.cChoice, this.cChoice + .6, t)));
    for (let i = 0; i < 5; i++) {
      const x = -900 + i * 420, k = i;
      plane(building('s4b' + (i % 3), 300, 420 + (i % 3) * 80, ['#D9A07A', '#C98B6B', '#E2B48C'][i % 3], i + 2, .1, i % 2), x, 0, 420, { scale: 1 });
      if (stare > 0) custom(x, 300 + (i % 3) * 40, 410, (g, s) => { g.scale(s, s); const look = Math.sin(t * 1.5 + i) * 3 + 8; for (const ex of [-40, 40]) { g.fillStyle = '#F6EEDF'; g.beginPath(); g.ellipse(ex, 0, 26, 18 * stare * (1 - Math.max(0, Math.sin(t * 3 + i * 2) - .97) * 30), 0, 0, TAU); g.fill(); g.fillStyle = PAL.ink; g.beginPath(); g.arc(ex + look, 2, 9 * stare, 0, TAU); g.fill(); } }, { order: 1 });
    }
    // bench with friends
    const bench = 1 - travel;
    if (bench > 0.01) {
      plane(memo('s4bench', () => sprite(420, 160, (g, w, h) => { g.fillStyle = '#9C6B45'; rr(g, 0, 0, w, 30, 6); g.fill(); rr(g, 0, 56, w, 22, 6); g.fill(); g.fillStyle = '#5B3F2A'; g.fillRect(30, 78, 16, 82); g.fillRect(w - 46, 78, 16, 82); })), 0, 0, 30, { scale: 1 });
      const grey = smooth(inv(this.cGrey - .3, this.cGrey + .8, t));
      [[-150, '#B05A7A', true], [-40, '#5E8F63', false]].forEach(([x, col, lh], j) => {
        const leave = smooth(inv(this.cSlow - .2, this.cSlow + 4, t));
        const wx = x - leave * 520 * (j + 1);
        custom(wx, 0, 20, (g, s) => { g.scale(s, s); person(g, { sit: leave < .02, walk: leave > .02 ? t * 2.2 : undefined, walkAmp: .5, flip: leave > .02, color: col, longHair: lh, grey, age: lerp(1, 1.5, grey), cane: leave > .02, t, hair: '#4A2E22' }); }, { order: 2 });
      });
      const standUp = t > this.cChoice + .3;
      custom(standUp ? 120 + (t - this.cChoice - .3) * 60 : 120, 0, 20, (g, s) => { g.scale(s, s); person(g, { ...HERO, sit: !standUp, walk: standUp ? (t - this.cChoice) * 5 : undefined, t }); if (standUp) { g.fillStyle = '#8C4A3A'; rr(g, 30, -90, 70, 52, 8); g.fill(); g.fillStyle = '#5B2E25'; g.fillRect(52, -100, 26, 10); } }, { order: 3 });
      // question marks over passers-by
      for (let i = 0; i < 3; i++) { const qk = pop(t, this.cAsk + i * .2, .5) * (1 - smooth(inv(this.cDoc + .5, this.cDoc + 1, t))); if (qk > 0) custom(-500 + i * 750, 330 + Math.sin(t * 3 + i) * 10, 200, (g, s) => { g.scale(s * eback(qk, 3), s * eback(qk, 3)); paperText(g, '?', 110, { color: PAL.red }); }, { order: 6 }); }
      for (let i = 0; i < 3; i++) custom(-520 + i * 760, 0, 200, (g, s) => { g.scale(s, s); person(g, { walk: t * 4 + i, color: ['#7A5C4C', '#4F7CA0', '#B28B3E'][i], flip: i % 2 === 1, t }); }, { order: 1, alpha: pop(t, this.cAsk - .4, .5) * (1 - smooth(inv(this.cDoc + .5, this.cDoc + 1, t))) });
      // doctors with clipboards + magnifier
      const dk = smooth(inv(this.cDoc - .3, this.cDoc + .5, t)) * (1 - smooth(inv(this.cStare + 1, this.cStare + 1.8, t)));
      if (dk > 0) {
        [[420, false], [560, false]].forEach(([x], j) => custom(x + (1 - dk) * 500, 0, 10, (g, s) => { g.scale(s, s); person(g, { color: '#F4F2EE', legs: '#5B6B7A', flip: true, walk: (1 - dk) * 6 + j, walkAmp: 1 - dk, t, hair: j ? '#2B2018' : '#8A6A4A' }); g.fillStyle = '#B98A5A'; g.fillRect(-60, -150, 34, 44); g.fillStyle = '#FFF'; g.fillRect(-56, -144, 26, 34); }, { order: 4 }));
        custom(170, 260, -40, (g, s) => { g.scale(s * dk, s * dk); g.rotate(Math.sin(t * 2) * .1); g.strokeStyle = '#5B3F2A'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(40, 40); g.lineTo(100, 100); g.stroke(); g.fillStyle = 'rgba(190,225,240,.45)'; g.strokeStyle = '#3A3A44'; g.lineWidth = 8; g.beginPath(); g.arc(0, 0, 56, 0, TAU); g.fill(); g.stroke(); }, { order: 6 });
      }
    }
    // new city: hero walks with suitcase; name tag
    if (travel > .5) {
      custom(cam.x - 120, 0, 0, (g, s) => { g.scale(s, s); person(g, { ...HERO, walk: t * 5, t }); g.fillStyle = '#8C4A3A'; rr(g, 30, -90, 70, 52, 8); g.fill(); }, { order: 3 });
      for (let i = 0; i < 7; i++) plane(building('s4c' + (i % 4), 260 + (i % 3) * 60, 600 + (i * 137 % 400), ['#5E8F9A', '#7FA7B0', '#E2B48C', '#F0C9A4'][i % 4], 10 + i, .45, 0), 2700 + i * 300, 0, 600 + (i % 3) * 200, { scale: 1 });
    }
    const nk = pop(t, this.cName - .2, .6);
    if (nk > 0) overlay(g => {
      g.save(); g.translate(W * .72, H * .42 + (1 - eback(nk, 2)) * 80); g.rotate(-.06 + Math.sin(t) * .01); g.globalAlpha = clamp(nk * 3);
      g.shadowColor = 'rgba(30,15,5,.4)'; g.shadowBlur = 24; g.shadowOffsetX = 8; g.shadowOffsetY = 14;
      g.fillStyle = '#F6EEDF'; rr(g, -250, -150, 500, 300, 22); g.fill(); g.shadowColor = 'transparent';
      g.fillStyle = PAL.red; rr(g, -250, -150, 500, 110, [22, 22, 0, 0]); g.fill();
      g.fillStyle = '#FFF4E4'; g.textAlign = 'center'; g.font = '900 58px Fraunces'; g.fillText('HELLO', 0, -82); g.font = '600 26px Fraunces'; g.fillText('my name is', 0, -50);
      const names = ['Alex', 'Sam', 'Theo'], ts = [this.cName, this.cName + .9, this.cOver - .1];
      g.font = '700 92px Caveat'; g.fillStyle = '#2D3A8C';
      names.forEach((n, i) => {
        const wk = clamp((t - ts[i]) / .45), strike = i < 2 ? clamp((t - ts[i + 1] + .25) / .25) : 0, out = i < 2 ? smooth(inv(ts[i + 1] + .1, ts[i + 1] + .5, t)) : 0;
        if (wk <= 0) return;
        g.save(); g.globalAlpha *= 1 - out; g.translate(0, 70 - out * 40); g.beginPath(); g.rect(-200, -80, 400 * wk, 140); g.clip(); g.fillText(n, 0, 20); g.restore();
        if (strike > 0 && out < 1) { g.save(); g.globalAlpha *= 1 - out; g.strokeStyle = PAL.red; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(-110, 60); g.lineTo(-110 + 220 * strike, 40); g.stroke(); g.restore(); }
      });
      g.restore();
    }, 2);
    overlay(g => drawAge(g, t), 1);
  },
});

// ======================================================================= 5 120TH BIRTHDAY
defScene(5, {
  carrierType: 'sheets', carrierOpts: { dur: 1.3, c1: '#3A2620', c2: '#5A3A2C', c3: '#7A5240' },
  build() {
    const c = cue; this.c120 = c('one hundred and twentieth'); this.cGone = c('is gone'); this.cPar = c('Your parents'); this.cTeach = c('your teachers'); this.cChild = c('childhood friends');
    this.cKids = c('your own children'); this.cHard = c('hardest part'); this.cLove = c('never stop loving'); this.cLose = c('keep losing them');
    this.seats = [[-430, 'parents', this.cPar, '#7A5C4C', 1.3], [-250, 'parents', this.cPar + .25, '#B05A7A', 1.3], [250, 'teachers', this.cTeach, '#4F7CA0', 1.2], [430, 'friends', this.cChild, '#5E8F63', 1], [610, 'friends', this.cChild + .25, '#C9765A', 1], [-610, 'kids', this.cKids + .3, '#E3A93B', 1.15]];
  },
  free() { freeSprites('s5'); },
  camera(lt, t) {
    const T = this.dur, push = smooth(inv(this.cHard - this.t0, T, lt));
    const fx = 0, endK = eio(inv(T - 2.2, T, lt));
    setCam({ x: lerp(lerp(Math.sin(lt * .25) * 120, fx, push), 244, endK), y: lerp(lerp(300, 280, push), 354, endK), z: lerp(lerp(-1150 + lt * 10, -450, push), -60, endK), roll: Math.sin(lt * .3) * .012 * (1 - endK), aperture: lerp(.6, 1.2, push), focus: lerp(lerp(1250, 420, push), 100, endK) });
  },
  draw(lt, t) {
    sky([[0, '#1E1412'], [.6, '#3A2620'], [1, '#2A1C17']]);
    // warm wall + window with night
    plane(memo('s5wall', () => sprite(3200, 1400, (g, w, h) => { g.fillStyle = '#4A3127'; g.fillRect(0, 0, w, h); g.fillStyle = '#3E281F'; for (let x = 0; x < w; x += 160) g.fillRect(x, 0, 6, h); g.fillStyle = '#1B2238'; rr(g, w * .4, h * .1, w * .2, h * .34, 12); g.fill(); g.fillStyle = '#F6EEDF'; for (let i = 0; i < 30; i++) { g.globalAlpha = .6; g.fillRect(w * .4 + hash(i) * w * .2, h * .1 + hash(i + 9) * h * .34, 3, 3); } g.globalAlpha = 1; g.beginPath(); g.arc(w * .55, h * .2, 26, 0, TAU); g.fill(); g.strokeStyle = '#6B4A38'; g.lineWidth = 18; rr(g, w * .4, h * .1, w * .2, h * .34, 12); g.stroke(); g.fillStyle = '#3A251D'; g.fillRect(0, h * .78, w, h * .22); }, { shadow: false })), 0, -260, 1400, { scale: 1.6, ay: 1, shadow: false });
    // candle glow
    raw(1300, g => { const p = project(0, 260, 0); if (!p) return; const cx = W / 2 + p.sx, cy = H / 2 + p.sy, R = 900 * p.s * (1 + Math.sin(t * 7) * .02); const gl = g.createRadialGradient(cx, cy, 0, cx, cy, R); gl.addColorStop(0, 'rgba(255,190,110,.45)'); gl.addColorStop(1, 'rgba(255,190,110,0)'); g.globalCompositeOperation = 'lighter'; g.fillStyle = gl; g.fillRect(0, 0, W, H); });
    // seats around the table (back row)
    this.seats.forEach(([x, who, c, col, ag], i) => {
      plane(memo('s5chair', () => sprite(150, 260, (g, w, h) => { g.fillStyle = '#7A5240'; rr(g, 10, 0, w - 20, h * .6, 12); g.fill(); g.fillRect(10, h * .55, w - 20, 20); g.fillRect(16, h * .6, 14, h * .4); g.fillRect(w - 30, h * .6, 14, h * .4); })), x, 0, 180, { scale: 1 });
      const lift = clamp((t - c - .2) / 3.2);
      if (lift >= 1) return;
      custom(x + Math.sin(lift * 5 + i) * 60 * lift, lift * lift * 900, 170 - lift * 100, (g, s) => {
        g.scale(s, s); g.rotate(Math.sin(lift * 7 + i) * .5 * lift); g.globalAlpha *= 1 - smooth(inv(.6, 1, lift));
        person(g, { sit: lift < .05, color: col, age: who === 'kids' ? lerp(.7, 1.4, clamp((t - this.cKids) / 2)) : ag, grey: who === 'parents' || who === 'teachers' ? 1 : who === 'kids' ? clamp((t - this.cKids) / 2) : .8, t, hair: '#4A2E22', walk: lift > .05 ? t * 3 : undefined, walkAmp: .4 });
      }, { order: 2 });
    });
    // table front
    plane(memo('s5table', () => sprite(1700, 130, (g, w, h) => { g.fillStyle = '#EFE3CF'; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, h * .7); for (let x = w; x >= 0; x -= 50) g.quadraticCurveTo(x - 25, h, x - 50, h * .7); g.closePath(); g.fill(); g.fillStyle = '#E2D3B8'; g.fillRect(0, 0, w, 10); })), 0, 112, 60, { scale: 1, ay: 0 });
    // cake with 120 candles (flicker)
    custom(110, 112, 40, (g, s) => {
      g.scale(s, s);
      g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 16; g.shadowOffsetY = 8;
      g.fillStyle = '#F2D6C2'; rr(g, -170, -110, 340, 110, 16); g.fill(); g.fillStyle = '#E58F84'; rr(g, -150, -190, 300, 90, 14); g.fill(); g.shadowColor = 'transparent';
      g.fillStyle = '#F6EEDF'; for (let x = -160; x < 170; x += 40) { g.beginPath(); g.arc(x, -110, 20, 0, Math.PI); g.fill(); }
      const out = clamp((t - this.cHard) / 3);
      for (let i = 0; i < 24; i++) {
        const x = -135 + (i % 12) * 24.5, y = -190 - (i < 12 ? 0 : 6), lit = i === 11 ? 1 : 1 - clamp(out * 1.6 - hash(i) * .6);
        g.fillStyle = ['#F2C14E', '#9CC9DE', '#F4F0E8'][i % 3]; g.fillRect(x - 3, y - 40, 6, 40);
        if (lit > 0) { g.globalAlpha = lit; g.fillStyle = '#FFC56B'; g.beginPath(); g.ellipse(x + Math.sin(t * 9 + i) * 1.5, y - 52, 4.5, 9 + Math.sin(t * 13 + i) * 1.5, 0, 0, TAU); g.fill(); g.globalAlpha = 1; }
      }
      g.fillStyle = '#6B3B2E'; g.font = '800 34px Fraunces'; g.textAlign = 'center'; g.fillText('120', 0, -40);
    }, { order: 3 });
    // the hero sits alone in front, back to camera-ish (at table center)
    custom(-110, 0, 175, (g, s) => { g.scale(s, s); person(g, { ...HERO, sit: true, t }); }, { order: 2 });
    // heart that breaks into paper pieces drifting away
    const hk = pop(t, this.cLove - .1, .6);
    if (hk > 0) custom(0, 620, 120, (g, s) => {
      g.scale(s, s); const br = clamp((t - this.cLose - .2) / 2.5);
      g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 14;
      for (let p = 0; p < 2; p++) { g.save(); g.translate((p ? 1 : -1) * br * 160, br * br * -240); g.rotate((p ? 1 : -1) * br * .8); g.globalAlpha *= 1 - smooth(inv(.5, 1, br)); g.beginPath(); g.rect(p ? 0 : -80, -80, 80, 140); g.clip(); g.scale(eback(hk, 3), eback(hk, 3)); heart(g, 70); g.restore(); }
    }, { order: 6 });
    overlay(g => drawAge(g, t), 1);
  },
});
