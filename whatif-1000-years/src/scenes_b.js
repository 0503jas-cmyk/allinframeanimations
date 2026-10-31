// Scenes 6–11: goodbye, money & patience, language drift, 300 years, memory, urgency.
'use strict';

function starsBg(seed, n, alpha = 1, tw = 0) {
  raw(1e11, g => { const r = mulberry(seed); for (let i = 0; i < n; i++) { const x = r() * W, y = r() * H * .75, s = r() * 2.4 + .6; g.globalAlpha = alpha * (.5 + .5 * Math.sin(tw * 2 + i)) * (.4 + r() * .6); g.fillStyle = '#FFF6E0'; g.fillRect(x - cam.x * .01 % W, y, s, s); } g.globalAlpha = 1; });
}
function paperBoat(g, col = '#F4EDE0') {
  g.fillStyle = shade(col, -.1); g.beginPath(); g.moveTo(-90, 0); g.lineTo(90, 0); g.lineTo(60, 34); g.lineTo(-60, 34); g.closePath(); g.fill();
  g.fillStyle = col; g.beginPath(); g.moveTo(-40, 0); g.lineTo(0, -80); g.lineTo(40, 0); g.closePath(); g.fill();
  g.fillStyle = shade(col, -.2); g.beginPath(); g.moveTo(0, -80); g.lineTo(40, 0); g.lineTo(14, 0); g.closePath(); g.fill();
}
function waterLayer(key, z, y, color, seed, t, amp = 14, scale = 1) {
  plane(strip(key, 5200, 500, color, seed, amp), cam.x + Math.sin(t * .6 + seed) * 40, y, z, { scale, ay: 0, shadowAlpha: .25 });
}

// ======================================================================= 6 GOODBYE
defScene(6, {
  carrierType: 'iris', carrierOpts: { dur: 1.1, c1: '#F7C46A' },
  build() {
    const c = cue; this.cStay = c('stay away'); this.cOthers = c('Others might'); this.cLove = c('few decades of love'); this.cPain = c('any amount of pain');
    this.cEither = c('Either way'); this.cExpert = c('become an expert'); this.cBye = c('Saying goodbye');
    this.boats = [[this.cStay + .3, -520, '#F4EDE0'], [this.cPain, 260, '#F7E1D5'], [this.cExpert, -120, '#E8EEF0'], [this.cBye + .2, 520, '#F6E7C8']];
  },
  free() { freeSprites('s6'); },
  camera(lt, t) {
    const T = this.dur;
    setCam({ x: lerp(-300, 250, eio(lt / T)) + Math.sin(lt * .4) * 30, y: lerp(330, 260, eio(lt / T)) + Math.sin(lt * .5) * 12, z: lerp(-1250, -950, eio(lt / T)), roll: Math.sin(lt * .35) * .015, aperture: .6, focus: 1200 });
  },
  draw(lt, t) {
    sky([[0, '#141B3A'], [.55, '#2E3566'], [1, '#6A5A8C']]);
    starsBg(61, 160, .9, t);
    plane(memo('s6moon', () => sprite(220, 220, (g, w, h) => { g.fillStyle = '#F6EEDA'; g.beginPath(); g.arc(w / 2, h / 2, w * .45, 0, TAU); g.fill(); g.fillStyle = '#E2D7BE'; g.beginPath(); g.arc(w * .4, h * .42, 18, 0, TAU); g.arc(w * .62, h * .6, 12, 0, TAU); g.fill(); }, { shadowColor: 'rgba(255,240,200,1)', shadowBlur: 40 })), 900, 2400, 9000, { scale: 4, ay: .5, shadowAlpha: .5, shadowDist: 0 });
    plane(hills('s6hill', 2600, 300, '#2A2F55', 3.3, .5, .7, 3), 0, -40, 6000, { scale: 6, ay: 1, shadowAlpha: .3 });
    waterLayer('s6w4', 3200, 0, '#273A6A', 1, t, 16, 3);
    waterLayer('s6w3', 1600, 0, '#2F4A7C', 2, t, 14, 2);
    // moon path shimmer
    raw(1500, g => { g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 18; i++) { const y = H * .55 + i * 24, w = 30 + i * 18 + Math.sin(t * 2 + i) * 20; g.fillStyle = `rgba(255,236,190,${.12 - i * .005})`; g.fillRect(W * .62 - w / 2 + Math.sin(t + i) * 30, y, w, 5); } });
    // boats drift away, each tied to the hero by a red thread
    const hero = [-430, 205, 120];
    this.boats.forEach(([c, x0, col], i) => {
      const k = clamp((t - c + 1.2) / 9), z = lerp(250, 2600, eout(k)), x = x0 + Math.sin(t * .4 + i) * 40 + k * (i % 2 ? 300 : -200), y = Math.sin(t * 1.2 + i) * 8;
      custom(x, y, z, (g, s) => { g.scale(s, s); g.rotate(Math.sin(t * 1.1 + i) * .06); paperBoat(g, col); person(g, { sit: true, color: ['#B05A7A', '#5E8F63', '#4F7CA0', '#C9765A'][i], grey: .4 + i * .15, t, shadow: false }); }, { order: 1 });
      const snap = clamp((t - c - 3) / .4);
      raw(z - 1, g => {
        const a = project(hero[0] + 30, hero[1], hero[2]), b = project(x, y + 60, z); if (!a || !b) return;
        const ax = W / 2 + a.sx, ay = H / 2 + a.sy, bx = W / 2 + b.sx, by = H / 2 + b.sy;
        g.strokeStyle = PAL.red; g.lineWidth = 3.5; g.lineCap = 'round';
        if (snap <= 0) { g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo((ax + bx) / 2, Math.max(ay, by) + 60 * (1 - k), bx, by); g.stroke(); }
        else { const sag = 200 * eout(snap); g.globalAlpha = 1 - snap * .6; g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(ax + 40, ay + sag, ax + 90 * (1 - snap * .5), ay + sag * 1.3); g.stroke(); g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx - 30, by + sag * .4, bx - 60, by + sag * .6); g.stroke(); }
      });
    });
    // heart lantern on the love boat
    const lk = pop(t, this.cLove, .6) * (1 - smooth(inv(this.cPain + 1.5, this.cPain + 2.5, t)));
    if (lk > 0) custom(260 + Math.sin(t * .4 + 1) * 40, 260 + Math.sin(t * 1.3) * 10, lerp(250, 2600, eout(clamp((t - this.cPain + 1.2) / 9))), (g, s) => { g.scale(s * eback(lk, 2), s * eback(lk, 2)); g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(0, 0, 0, 0, 0, 120); gl.addColorStop(0, 'rgba(255,140,120,.5)'); gl.addColorStop(1, 'rgba(255,140,120,0)'); g.fillStyle = gl; g.beginPath(); g.arc(0, 0, 120, 0, TAU); g.fill(); g.globalCompositeOperation = 'source-over'; heart(g, 34, '#F07A6E'); }, { order: 2 });
    // pier + hero
    plane(memo('s6pier', () => sprite(900, 260, (g, w, h) => { g.fillStyle = '#5C4636'; g.fillRect(0, 0, w, 40); for (let x = 0; x < w; x += 70) { g.fillStyle = shade('#6E5442', (hash(x) - .5) * .2); g.fillRect(x + 2, 0, 66, 40); } g.fillStyle = '#3E2F25'; for (let x = 40; x < w; x += 200) g.fillRect(x, 40, 26, h - 40); }, { shadowBlur: 14 })), -700, 0, 120, { ay: 0, scale: 1 });
    custom(hero[0], 0, hero[2] - 10, (g, s) => { g.scale(s, s); person(g, { ...HERO, t, armUp: false, wind: .6 }); }, { order: 3 });
    waterLayer('s6w2', 500, -60, '#3A5A8E', 3, t, 12, 1.2);
    waterLayer('s6w1', -300, -120, '#4A6CA0', 4, t, 16, .8);
    // GOODBYE letters fall like leaves into the water
    const gk = t - this.cBye;
    if (gk > -0.3) custom(150, 700, 600, (g, s) => { g.scale(s, s); paperText(g, 'GOODBYE', 170, { anim: (i, n) => { const r = riseAnim(t, this.cBye - .1, .5, .05)(i, n), f = fallAnim(t, this.cBye + 2.4 + i * .08, 2.2, 0)(i, n); return { dy: r.dy + f.dy, dx: f.dx, rot: r.rot + f.rot, s: r.s, a: r.a * f.a }; }, color: '#FFF4E4', spacing: .06 }); }, { order: 6 });
  },
});

// ======================================================================= 7 MONEY & PATIENCE
function fmtMoney(v) { return '$' + Math.round(v).toLocaleString('en-US'); }
function coinStack(g, n, t, seed) {
  for (let i = 0; i < n; i++) { const y = -i * 11, wob = Math.sin(seed + i * .7) * 3; g.fillStyle = i % 2 ? '#E3A93B' : '#EDB94A'; g.beginPath(); g.ellipse(wob, y, 46, 12, 0, 0, TAU); g.fill(); g.fillStyle = '#C98E2A'; g.fillRect(wob - 46, y, 92, 6); }
  g.fillStyle = '#F6D27A'; g.beginPath(); g.ellipse(Math.sin(seed + n * .7) * 3, -n * 11, 46, 12, 0, 0, TAU); g.fill();
}
defScene(7, {
  carrierType: 'sheets', carrierOpts: { dur: 1.3, c1: '#F6D27A', c2: '#E3A93B', c3: '#B9802F' },
  build() {
    const c = cue; this.cAmaze = c('amazing parts'); this.cMoney = c('talk about money'); this.cK = c('one thousand dollars'); this.cPct = c('five percent');
    this.c17 = c('seventeen million'); this.c2b = c('two billion'); this.cPat = c('Patience becomes'); this.cPlant = c('plant a forest'); this.cWalk = c('walk through it');
    this.cInst = c('every instrument'); this.cLang = c('dozens of languages'); this.cDeg = c('earn a degree'); this.cCur = c('curious about');
  },
  free() { freeRoadside('s7'); freeSprites('s7'); },
  money(t) {
    const k1 = eio(inv(this.cPct, this.c17 + .3, t)), k2 = eio(inv(this.c17 + .8, this.c2b + .4, t));
    return Math.exp(lerp(lerp(Math.log(1000), Math.log(17292580), k1), Math.log(2273996000), k2));
  },
  camera(lt, t) {
    const up = eio(inv(this.cPct, this.c2b + .5, t)), down = eio(inv(this.cPat - .4, this.cPlant + .3, t)), walk = Math.max(0, t - this.cPlant - 1.2) * 60;
    setCam({ x: lerp(0, 180, up) + walk + Math.sin(lt * .4) * 30, y: lerp(lerp(260, 900, up), 230, down) + Math.sin(lt * .5) * 15, z: lerp(lerp(-1150, -1700, up), -950, down), roll: Math.sin(lt * .4) * .012 + up * (1 - down) * .03, aperture: lerp(.5, .8, down), focus: lerp(lerp(1150, 1700, up), 950, down) });
  },
  draw(lt, t) {
    roadside('s7', 'warm', { fence: false, trees: false, sunX: 200 });
    const money = this.money(t), down = smooth(inv(this.cPat - .4, this.cPlant + .3, t));
    // coin towers in depth rows; height ~ log(money)
    const lvl = Math.log10(money) - 3; // 0..6.4
    const vis = 1 - smooth(inv(this.cPlant - .2, this.cPlant + .6, t));
    if (vis > 0) for (let i = 0; i < 9; i++) {
      const x = (i - 4) * 230 + (i % 2) * 60, z = 60 + (i % 3) * 240, grow = clamp(lvl * 1.4 - Math.abs(i - 4) * .55), n = Math.round(4 + grow * grow * 9 * (1 + hash(i) * .5));
      if (t < this.cK + .2 && i !== 4) continue;
      custom(x, 0, z, (g, s) => { g.scale(s, s); g.globalAlpha *= vis; g.shadowColor = 'rgba(80,40,0,.35)'; g.shadowBlur = 12; g.shadowOffsetX = 8; g.shadowOffsetY = 6; coinStack(g, i === 4 ? Math.max(n, 3) : n, t, i); }, { order: 1 });
    }
    // counter + years
    if (vis > 0) overlay(g => {
      const k = pop(t, this.cK - .2, .6); if (k <= 0) return;
      g.save(); g.globalAlpha = vis * clamp(k * 3); g.translate(W / 2, 220 - (1 - eback(k)) * 60);
      paperText(g, fmtMoney(money), 130, { color: '#FFF4E4', spacing: .01 });
      const yr = t < this.cPct ? 0 : t < this.c17 ? 200 * eio(inv(this.cPct, this.c17 + .3, t)) : 200 + 100 * eio(inv(this.c17 + .8, this.c2b + .4, t));
      g.translate(0, 110); paperText(g, `AFTER ${Math.round(yr)} YEARS · 5% A YEAR`, 40, { color: '#6B3B2E', shadow: false, spacing: .12, weight: 700 });
      g.restore();
    }, 2);
    // patience = superpower: the scarf becomes a cape
    const pk = smooth(inv(this.cPat - .3, this.cPat + .4, t));
    // forest grows around the hero
    const fk = t - this.cPlant;
    const hx = cam.x - 180 + 0;
    if (fk > -2) {
      for (let i = 0; i < 40; i++) {
        const z = -300 + (i % 5) * 380 + hash(i) * 100, x = this.cPlant > 0 ? -900 + i * 140 + hash(i * 7) * 120 : 0, d = Math.abs(x - 0) / 600 + (i % 5) * .3;
        const gk = elastic(clamp((fk - d * .6) / 1.4)); if (gk <= 0.01) continue;
        plane(i % 3 ? treeRound('s7tr' + (i % 2), i % 2 ? '#5E8F63' : '#4E7A5A') : pine('s7pn', '#3F6B4D'), x + (x > -150 && x < 150 && z < 300 ? 260 : 0), 0, z, { scale: (1.1 + hash(i) * .6) * gk, sy: gk, blur: 0 });
      }
    }
    // hero: plants a seed, then walks through the forest
    const walkX = Math.max(0, t - this.cPlant - 1.2) * 60;
    custom(walkX + (t < this.cPlant ? 0 : 0), 0, 0, (g, s) => {
      g.scale(s, s);
      if (pk > 0 && t < this.cPlant + .5) { g.save(); g.fillStyle = PAL.red; g.globalAlpha *= pk; g.beginPath(); g.moveTo(-10, -150); g.quadraticCurveTo(-70 - Math.sin(t * 6) * 10, -90, -90 - Math.sin(t * 5) * 14, -10); g.lineTo(-20, -40); g.closePath(); g.fill(); g.restore(); }
      person(g, { ...HERO, walk: t > this.cPlant + 1.2 ? walkX / 60 * 5 : undefined, t, armUp: pk > .5 && t < this.cPlant - .3 });
      if (t > this.cPlant - .3 && t < this.cPlant + 1.2) { const sk = clamp((t - this.cPlant + .3) / .5); g.fillStyle = '#7A5A3A'; g.beginPath(); g.arc(40, -20 + sk * 20, 6, 0, TAU); g.fill(); }
    }, { order: 3 });
    // skills orbit
    const orbit = (c, icons) => {
      const k = pop(t, c - .1, .6) * (1 - smooth(inv(this.t1 - 1, this.t1 - .3, t))); if (k <= 0) return;
      icons.forEach((fn, j) => { const a = t * .8 + j * TAU / icons.length + c, r = 260; custom(walkX + Math.cos(a) * r, 220 + Math.sin(a) * 80, Math.sin(a) * 120, (g, s) => { g.scale(s * eback(clamp(k * 1.4 - j * .1), 2), s * eback(clamp(k * 1.4 - j * .1), 2)); fn(g); }, { order: 5 }); });
    };
    orbit(this.cInst, [g => { g.fillStyle = '#B9733B'; g.beginPath(); g.ellipse(0, 10, 26, 30, 0, 0, TAU); g.fill(); g.fillRect(-5, -60, 10, 50); g.fillStyle = '#3A2A22'; g.beginPath(); g.arc(0, 8, 8, 0, TAU); g.fill(); },
      g => { g.fillStyle = '#2B2A33'; g.beginPath(); g.ellipse(-8, 22, 14, 10, -.4, 0, TAU); g.fill(); g.fillRect(2, -36, 6, 58); g.fillRect(2, -36, 22, 6); },
      g => { g.fillStyle = '#F6EEDF'; rr(g, -40, -16, 80, 32, 4); g.fill(); g.fillStyle = PAL.ink; for (let k2 = 0; k2 < 5; k2++) g.fillRect(-30 + k2 * 15, -16, 8, 18); }]);
    orbit(this.cLang, ['Hola', 'Bonjour', 'Ciao', 'Hallo', 'Olá'].map(w => g => { g.shadowColor = 'rgba(0,0,0,.25)'; g.shadowBlur = 8; g.fillStyle = '#F6EEDF'; g.font = '700 34px Fraunces'; const ww = g.measureText(w).width + 30; rr(g, -ww / 2, -28, ww, 50, 18); g.fill(); g.beginPath(); g.moveTo(-10, 20); g.lineTo(-22, 36); g.lineTo(4, 20); g.fill(); g.shadowColor = 'transparent'; g.fillStyle = PAL.teal; g.textAlign = 'center'; g.fillText(w, 0, 8); }));
    orbit(this.cDeg, [g => { g.fillStyle = PAL.ink; g.beginPath(); g.moveTo(-40, 0); g.lineTo(0, -20); g.lineTo(40, 0); g.lineTo(0, 20); g.fill(); g.fillRect(-18, 4, 36, 18); g.strokeStyle = PAL.mustard; g.lineWidth = 3; g.beginPath(); g.moveTo(30, 4); g.lineTo(34, 30); g.stroke(); },
      g => { g.fillStyle = '#F6EEDF'; rr(g, -40, -14, 80, 28, 14); g.fill(); g.fillStyle = PAL.red; g.fillRect(-6, -14, 12, 28); }]);
    overlay(g => drawAge(g, t), 1);
  },
});

// ======================================================================= 8 LANGUAGE DRIFT
defScene(8, {
  carrierType: 'page', carrierOpts: { dur: 1.3, c1: '#F1E6D2' },
  build() {
    const c = cue; this.cWild = c("here's something wild"); this.cLang = c("language you don't"); this.cOld = c('English from a thousand'); this.cDiff = c('completely different language');
    this.cTalk = c('the way people talk'); this.cSlang = c('the slang'); this.cMean = c('meaning of everyday'); this.cDrift = c('drift away from you'); this.cEvery = c('Every hundred years'); this.cLearn = c('learn your own language');
  },
  free() { freeSprites('s8'); },
  camera(lt, t) {
    const T = this.dur, old = smooth(inv(this.cOld - .5, this.cOld + .6, t)) * (1 - smooth(inv(this.cTalk - .6, this.cTalk + .2, t)));
    setCam({ x: lerp(-200, 160, eio(lt / T)) + Math.sin(lt * .5) * 30, y: 290 + Math.sin(lt * .4) * 15 + old * 60, z: lerp(-1000, -800, eio(lt / T)) + old * 220, roll: Math.sin(lt * .3) * .01 + old * -.02, aperture: .5 + old * .5, focus: 1150 - old * 300 });
  },
  draw(lt, t) {
    sky([[0, '#3A2A3E'], [.6, '#5A3F4F'], [1, '#2A1E26']]);
    // theatre: back wall, curtain wings in depth, stage floor
    plane(memo('s8back', () => sprite(3000, 1300, (g, w, h) => { const lg = g.createRadialGradient(w / 2, h * .45, 50, w / 2, h * .5, w * .6); lg.addColorStop(0, '#F1D9B5'); lg.addColorStop(1, '#B98C6A'); g.fillStyle = lg; g.fillRect(0, 0, w, h); }, { shadow: false })), 0, -100, 1600, { ay: 0, scale: 1.4, shadow: false });
    for (let i = 0; i < 3; i++) for (const side of [-1, 1]) plane(memo('s8wing' + i, () => sprite(500, 1400, (g, w, h) => { g.fillStyle = ['#8E2F35', '#A53A3F', '#7A272D'][i]; g.beginPath(); g.moveTo(0, 0); for (let y = 0; y <= h; y += 40) g.lineTo(w * .7 + Math.sin(y * .01 + i) * 40, y); g.lineTo(0, h); g.fill(); g.fillStyle = 'rgba(0,0,0,.15)'; for (let x = 30; x < w * .7; x += 70) g.fillRect(x, 0, 18, h); })), side * (1050 - i * 60) + cam.x * .0, -80, 1200 - i * 450, { ay: 0, scale: 1, sx: side, shadowAlpha: .4 });
    plane(memo('s8floor', () => sprite(3200, 300, (g, w, h) => { g.fillStyle = '#7A5440'; g.fillRect(0, 0, w, h); g.fillStyle = '#6A4636'; for (let x = 0; x < w; x += 120) g.fillRect(x, 0, 4, h); })), 0, 0, 200, { ay: 0, scale: 1.2 });
    // spotlight
    raw(150, g => { const p = project(0, 0, 300); if (!p) return; g.globalCompositeOperation = 'lighter'; const lg = g.createRadialGradient(W / 2 + p.sx, H / 2 + p.sy - 300, 20, W / 2 + p.sx, H / 2 + p.sy, 700); lg.addColorStop(0, 'rgba(255,230,180,.25)'); lg.addColorStop(1, 'rgba(255,230,180,0)'); g.fillStyle = lg; g.fillRect(0, 0, W, H); });
    // HELLO -> scrambled -> ??? as language drifts
    const helloOut = 1 - smooth(inv(this.cOld - .4, this.cOld + .2, t));
    if (helloOut > 0) {
      const scr = clamp((t - this.cLang - .4) / 2.5);
      const words = ['HELLO', 'HÆLLO', 'HWÆT?', 'HƎLLØ'];
      const w = scr < .33 ? words[0] : scr < .66 ? words[1] : words[2];
      custom(0, 80, 400, (g, s) => { g.scale(s, s); g.globalAlpha *= helloOut;
        for (let d = 8; d >= 1; d--) { g.save(); g.translate(d * 2, d * 2.2); paperText(g, w, 260, { anim: (i, n) => ({ rot: Math.sin(scr * 20 + i) * .3 * Math.sin(scr * Math.PI), dy: -Math.abs(Math.sin(scr * 14 + i * 2)) * 60 * Math.sin(scr * Math.PI) + (1 - eback(pop(t, this.cWild - .3 + i * .06, .6))) * 200, a: pop(t, this.cWild - .3 + i * .06, .3) }), color: '#8E5A3A', shadow: d === 8 }); g.restore(); }
        paperText(g, w, 260, { anim: (i, n) => ({ rot: Math.sin(scr * 20 + i) * .3 * Math.sin(scr * Math.PI), dy: -Math.abs(Math.sin(scr * 14 + i * 2)) * 60 * Math.sin(scr * Math.PI) + (1 - eback(pop(t, this.cWild - .3 + i * .06, .6))) * 200, a: pop(t, this.cWild - .3 + i * .06, .3) }), color: '#F6E7CF', shadow: false });
      }, { order: 2 });
    }
    // Old English manuscript (Beowulf, line 1)
    const mk = smooth(inv(this.cOld - .3, this.cOld + .5, t)) * (1 - smooth(inv(this.cTalk - .6, this.cTalk, t)));
    if (mk > 0) custom(0, 330, 300, (g, s) => {
      g.scale(s, s); g.rotate(-.03 + (1 - mk) * .2); g.globalAlpha *= mk; g.translate(0, (1 - eback(mk)) * 200);
      g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 30; g.shadowOffsetY = 16; g.fillStyle = '#EAD9B4'; rr(g, -460, -300, 920, 600, 10); g.fill(); g.shadowColor = 'transparent';
      g.fillStyle = '#9C3A2E'; g.font = '900 120px Fraunces'; g.fillText('H', -400, -150);
      g.fillStyle = '#3A2A22'; g.font = 'italic 600 46px Fraunces';
      const lines = ['wæt! We Gardena in geardagum,', 'þeodcyninga þrym gefrunon,', 'hu ða æþelingas ellen fremedon.'];
      lines.forEach((l, i) => { const k = clamp((t - this.cOld - .3 - i * .5) / .8); g.save(); g.beginPath(); g.rect(-420, -230 + i * 90, 880 * k, 90); g.clip(); g.fillText(l, i ? -400 : -320, -150 + i * 90); g.restore(); });
      const dk = pop(t, this.cDiff - .1, .5); if (dk > 0) { g.globalAlpha *= dk; g.fillStyle = '#6B5A48'; g.font = '600 26px Fraunces'; g.fillText('Beowulf · Old English, about 1,000 years ago', -400, 230); }
    }, { order: 4 });
    // hero + crowd with drifting speech bubbles (slang across centuries)
    const ck = smooth(inv(this.cTalk - .4, this.cTalk + .4, t));
    if (ck > 0) {
      custom(-420, 0, 300, (g, s) => { g.scale(s, s); person(g, { ...HERO, t }); }, { order: 3, alpha: ck });
      const slang = [['groovy', '1970'], ['cool', '2000'], ['no cap', '2020'], ['zorbly?', '2190'], ['?!', '2350']];
      slang.forEach(([w, yr], i) => {
        const c0 = this.cSlang + i * .55, k = pop(t, c0, .5), drift = Math.max(0, t - c0 - .4);
        if (k <= 0) return;
        const x = -200 + i * 220 + drift * 60, y = 330 + i * 30 + Math.sin(t * 2 + i) * 10 + drift * 22;
        custom(x, y, 300 + drift * 120, (g, s) => {
          g.scale(s * eback(k, 2) * 1.5, s * eback(k, 2) * 1.5); g.globalAlpha *= 1 - smooth(inv(4, 7, drift));
          g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 12; g.shadowOffsetY = 6; g.fillStyle = '#F6EEDF'; g.font = '800 46px Fraunces'; const ww = g.measureText(w).width + 50;
          rr(g, -ww / 2, -40, ww, 74, 30); g.fill(); g.beginPath(); g.moveTo(-ww / 4, 30); g.lineTo(-ww / 4 - 20, 56); g.lineTo(-ww / 4 + 18, 30); g.fill(); g.shadowColor = 'transparent';
          g.fillStyle = PAL.ink; g.textAlign = 'center'; g.fillText(w, 0, 12); g.font = '700 22px Fraunces'; g.fillStyle = PAL.red; g.fillText(yr, 0, -50);
        }, { order: 5 });
      });
      for (let i = 0; i < 4; i++) custom(-60 + i * 200, 0, 420, (g, s) => { g.scale(s, s); person(g, { color: ['#4F7CA0', '#B28B3E', '#7A5C4C', '#8C6A9E'][i], flip: true, t, walk: t * 1.2 + i, walkAmp: .15 }); }, { order: 2, alpha: ck });
    }
    // ABC blocks: learning your own language again
    const bk = t - this.cEvery;
    if (bk > -0.2) ['A', 'B', 'C'].forEach((ch, i) => {
      const k = clamp((bk - i * .25) / .7), y = lerp(900, 0, eout4(k)) + Math.abs(Math.sin(k * 8)) * 30 * (1 - k);
      custom(200 + i * 150, y, 120, (g, s) => { g.scale(s, s); g.rotate((1 - k) * (i - 1)); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 14; g.shadowOffsetX = 6; g.shadowOffsetY = 8; g.fillStyle = [PAL.red, PAL.teal, PAL.mustard][i]; rr(g, -60, -120, 120, 120, 12); g.fill(); g.shadowColor = 'transparent'; g.fillStyle = '#FFF4E4'; g.font = '900 86px Fraunces'; g.textAlign = 'center'; g.fillText(ch, 0, -30); }, { order: 4 });
    });
    overlay(g => drawAge(g, t), 1);
  },
});

// ======================================================================= 9 THREE HUNDRED YEARS
function lantern(g, t) { g.fillStyle = '#3A2A22'; g.fillRect(-4, -260, 8, 260); g.fillRect(-4, -260, 40, 6); g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(36, -230, 0, 36, -230, 70); gl.addColorStop(0, 'rgba(255,200,110,.6)'); gl.addColorStop(1, 'rgba(255,200,110,0)'); g.fillStyle = gl; g.beginPath(); g.arc(36, -230, 70, 0, TAU); g.fill(); g.globalCompositeOperation = 'source-over'; g.fillStyle = '#FFD98A'; g.fillRect(26, -246, 20, 28); }
function carriage(g, t) { g.fillStyle = '#6B3B2E'; rr(g, -70, -120, 140, 80, 14); g.fill(); g.fillStyle = '#E9DCC4'; g.fillRect(-40, -105, 30, 30); g.fillRect(10, -105, 30, 30); for (const x of [-50, 50]) { g.save(); g.translate(x, -30); g.rotate(t * 3); g.strokeStyle = '#3A2A22'; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 30, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(-30, 0); g.lineTo(30, 0); g.moveTo(0, -30); g.lineTo(0, 30); g.stroke(); g.restore(); }
  g.fillStyle = '#8A6A4A'; g.save(); g.translate(150, -60); const b = Math.sin(t * 8) * 4; rr(g, -50, -40 + b, 100, 46, 20); g.fill(); g.fillRect(30, -90 + b, 22, 60); rr(g, 34, -100 + b, 50, 30, 10); g.fill(); g.strokeStyle = '#6B4A2E'; g.lineWidth = 9; for (const lx of [-34, 34]) { g.beginPath(); g.moveTo(lx, b); g.lineTo(lx + Math.sin(t * 8 + lx) * 12, 60); g.stroke(); } g.restore(); }
function car(g, col, t) { g.fillStyle = col; rr(g, -90, -60, 180, 44, 14); g.fill(); rr(g, -50, -95, 100, 40, 14); g.fill(); g.fillStyle = '#BFDDE6'; g.fillRect(-40, -88, 36, 26); g.fillRect(4, -88, 36, 26); g.fillStyle = '#2B2A33'; for (const x of [-55, 55]) { g.beginPath(); g.arc(x, -16, 18, 0, TAU); g.fill(); } }
function crossIcon(x, y, z, k, drawFn) {
  if (k <= 0) return;
  custom(x, y, z, (g, s) => { g.scale(s * eback(clamp(k * 1.5), 2), s * eback(clamp(k * 1.5), 2)); g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 12; g.shadowOffsetY = 6; g.fillStyle = '#F6EEDF'; g.beginPath(); g.arc(0, 0, 70, 0, TAU); g.fill(); g.shadowColor = 'transparent'; drawFn(g); const xk = clamp((k - .4) / .25); g.strokeStyle = PAL.red; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(-50, -50); g.lineTo(-50 + 100 * xk, -50 + 100 * xk); g.stroke(); }, { order: 6, dof: false });
}
defScene(9, {
  carrierType: 'clouds', carrierOpts: { dur: 1.4, c1: '#F3E3C8', c2: '#E8D2B0' },
  build() {
    const c = cue; this.c300 = c('three hundredth year'); this.cUnrec = c('unrecognizable'); this.c1726 = c('seventeen twenty-six'); this.cToday = c('and today');
    this.cCars = c('no cars'); this.cElec = c('no electricity'); this.cPhones = c('no phones'); this.cPlanes = c('no planes'); this.cImag = c('three hundred more years');
    this.cFloat = c('float on oceans'); this.cClouds = c('high into the clouds'); this.cMoon = c('on the Moon'); this.cMars = c('or on Mars'); this.cEarth = c('see Earth from another'); this.c700 = c('seven hundred years left');
  },
  free() { freeSprites('s9'); freeRoadside('s9'); },
  camX(t) { return track([[this.t0, -300], [this.c1726, 300], [this.cPlanes + .6, 1200], [this.cImag - .3, 2600], [this.cImag + 1.2, 5200], [this.cClouds + 1.2, 6000], [this.cMoon, 6200]], t, eio); },
  camera(lt, t) {
    const rise = eio(inv(this.cMoon - .4, this.cMars + 1.4, t)), land = eio(inv(this.cEarth - 1.2, this.cEarth + .4, t));
    const x = this.camX(t);
    setCam({ x: x + Math.sin(lt * .4) * 30, y: lerp(260 + Math.sin(lt * .5) * 12, 6000, rise * (1 - land)) + land * 260, z: -1150 + rise * (1 - land) * -400, roll: Math.sin(lt * .4) * .012 + Math.sin(rise * Math.PI) * .06, aperture: .45, focus: 1150 });
  },
  extraMotion(lt, t) { return 0; },
  draw(lt, t) {
    const rise = eio(inv(this.cMoon - .4, this.cMars + 1.4, t)), land = eio(inv(this.cEarth - 1.2, this.cEarth + .4, t));
    const era = this.camX(t), sepia = 1 - smooth(inv(1400, 2600, era)), future = smooth(inv(3000, 5000, era));
    if (land > .01) return this.drawMars(lt, t, land);
    const skyA = [[0, '#D9B48A'], [.6, '#EED8B4'], [1, '#F4E6CC']], skyB = [[0, '#8FC3DA'], [.6, '#CFE5E4'], [1, '#F3E5C8']], skyC = [[0, '#6A6FC4'], [.6, '#C7A6D9'], [1, '#F6D6C8']];
    let st = skyAt(t, skyA, skyB, 1 - sepia); st = skyAt(t, st, skyC, future);
    st = skyAt(t, st, [[0, '#05060F'], [.6, '#101533'], [1, '#1E2450']], smooth(inv(.25, .7, rise)));
    sky(st);
    if (rise > .3) starsBg(91, 260, smooth(inv(.3, .7, rise)), t);
    // far terrain
    plane(hills('s9far', 2600, 380, mix(mix('#B9A07E', '#A9C2C9', 1 - sepia), '#9C8FC9', future), 2.7, .45, .7, 3), cam.x * .85, -80, 7000, { scale: 5.6, ay: 1, shadowAlpha: .2 });
    plane(strip('s9gnd', 5200, 600, mix(mix('#CDB48C', '#C9B98F', 1 - sepia), '#B9A8C9', future), 1, 10), cam.x, 30, 160, { scale: 1.3, ay: .05, shadowAlpha: .2 });
    plane(roadSprite('s9rd', 5200, 70, mix('#D9C29A', '#E2CFAA', 1 - sepia)), cam.x, 0, 20, { ay: .5, scale: 1.1, shadowAlpha: .15 });
    // ERA 1726: x -800..1600
    for (let i = 0; i < 6; i++) plane(house('s9h' + (i % 2), 280, 300, i % 2 ? '#E2CDA8' : '#D9B48A', '#8E5A3A', 1), -900 + i * 420, 0, 380 + (i % 2) * 150, { scale: 1 });
    for (let i = 0; i < 5; i++) custom(-700 + i * 480, 0, 60, (g, s) => { g.scale(s, s); lantern(g, t); }, { order: 1 });
    custom(-600 + (t - this.t0) * 70, 0, 100, (g, s) => { g.scale(s, s); carriage(g, t); }, { order: 2 });
    custom(-200, 520, 3000, (g, s) => { g.scale(s * 2.2, s * 2.2); g.fillStyle = '#6B4A38'; g.beginPath(); g.moveTo(-120, 0); g.lineTo(120, 0); g.lineTo(90, 40); g.lineTo(-90, 40); g.fill(); g.fillStyle = '#F4EDE0'; g.beginPath(); g.moveTo(-10, -10); g.lineTo(-10, -170); g.lineTo(-100, -10); g.fill(); g.beginPath(); g.moveTo(10, -10); g.lineTo(10, -190); g.lineTo(110, -10); g.fill(); }, { order: 0 });
    headline(cam.x * .0 + 200, 640, 900, '1726', 220, riseAnim(t, this.c1726 - .2, .6, .07), { color: '#F6E7CF', side: '#8E5A3A', depth: 7, alpha: 1 });
    const ix = cam.x - 380;
    crossIcon(ix, 260, 200, pop(t, this.cCars - .1, .8) * (1 - smooth(inv(this.cImag - .6, this.cImag, t))), g => { g.scale(.5, .5); g.translate(0, 40); car(g, '#4F7CA0', 0); });
    crossIcon(ix + 260, 260, 200, pop(t, this.cElec - .1, .8) * (1 - smooth(inv(this.cImag - .6, this.cImag, t))), g => { g.fillStyle = '#F2C14E'; g.beginPath(); g.arc(0, -10, 28, 0, TAU); g.fill(); g.fillStyle = '#7A7A80'; g.fillRect(-12, 16, 24, 20); });
    crossIcon(ix + 520, 260, 200, pop(t, this.cPhones - .1, .8) * (1 - smooth(inv(this.cImag - .6, this.cImag, t))), g => { g.fillStyle = PAL.ink; rr(g, -20, -36, 40, 72, 8); g.fill(); g.fillStyle = '#9CC9DE'; g.fillRect(-15, -28, 30, 50); });
    crossIcon(ix + 780, 260, 200, pop(t, this.cPlanes - .1, .8) * (1 - smooth(inv(this.cImag - .6, this.cImag, t))), g => { g.fillStyle = '#7C93A6'; rr(g, -44, -8, 88, 16, 8); g.fill(); g.beginPath(); g.moveTo(-6, 0); g.lineTo(-24, -34); g.lineTo(8, 0); g.lineTo(-24, 34); g.fill(); g.fillRect(-44, -18, 10, 20); });
    // ERA 2026: x 2200..4000
    for (let i = 0; i < 6; i++) plane(building('s9b' + (i % 3), 240, 420 + (i % 3) * 140, ['#7C93A6', '#C98B6B', '#9FB4BE'][i % 3], 20 + i, .35, 0), 2100 + i * 330, 0, 420 + (i % 2) * 200, { scale: 1 });
    for (let i = 0; i < 3; i++) custom(2000 + ((t * 260 + i * 700) % 2400), 0, 80, (g, s) => { g.scale(s, s); car(g, ['#D9433B', '#2F6F73', '#E3A93B'][i], t); }, { order: 2 });
    custom(2400 + (t - this.t0) * 120, 1200, 2500, (g, s) => { g.scale(s * 2, s * 2); g.fillStyle = '#F4F2EE'; rr(g, -70, -10, 140, 20, 10); g.fill(); g.beginPath(); g.moveTo(-10, 0); g.lineTo(-40, -50); g.lineTo(20, 0); g.lineTo(-40, 50); g.fill(); }, { order: 0 });
    headline(2900, 640, 900, 'TODAY', 200, riseAnim(t, this.cToday - .1, .6, .06), { color: '#F6E7CF', side: '#4F6E86', depth: 7 });
    // ERA 2326: floating city, sky towers, flying pods
    if (future > 0) {
      plane(memo('s9sea', () => sprite(5200, 400, (g, w, h) => { g.fillStyle = '#5B8FB9'; g.fillRect(0, 30, w, h); g.fillStyle = '#7FB0D3'; for (let x = 0; x < w; x += 60) g.fillRect(x, 30 + Math.sin(x) * 6, 40, 6); })), 5600, -10, 1500, { scale: 2, ay: .1 });
      custom(5200, 120 + Math.sin(t * .8) * 15, 1500, (g, s) => { g.scale(s * 1.6, s * 1.6); g.fillStyle = '#E9DCC4'; g.beginPath(); g.ellipse(0, 0, 420, 60, 0, 0, TAU); g.fill(); [[-250, 260, '#F0C9A4'], [-120, 420, '#9CC9DE'], [10, 560, '#F4F2EE'], [150, 380, '#C7A6D9'], [270, 240, '#F2B48C']].forEach(([x, h, c]) => { g.fillStyle = c; rr(g, x - 40, -h, 80, h, [40, 40, 0, 0]); g.fill(); g.fillStyle = 'rgba(255,230,160,.8)'; for (let y = -h + 40; y < -20; y += 50) g.fillRect(x - 12, y, 24, 22); }); }, { order: 1 });
      for (let i = 0; i < 4; i++) custom(5800 + i * 420, 0, 900 + i * 300, (g, s) => { g.scale(s, s); const h = 1600 + i * 400; g.fillStyle = ['#E2D7F2', '#F6E2D4', '#D4EAF0', '#F2E8C8'][i]; g.beginPath(); g.moveTo(-60, 0); g.lineTo(-20, -h); g.lineTo(20, -h); g.lineTo(60, 0); g.fill(); g.beginPath(); g.ellipse(0, -h * .7, 150, 40, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(-80, -h * .55, 70, 0, TAU); g.arc(0, -h * .55, 90, 0, TAU); g.arc(90, -h * .55, 60, 0, TAU); g.fill(); }, { order: 0 });
      for (let i = 0; i < 6; i++) custom(4800 + ((t * 200 * (1 + i % 2) + i * 500) % 2600), 500 + i * 120 + Math.sin(t * 2 + i) * 20, 600 + i * 200, (g, s) => { g.scale(s, s); g.fillStyle = ['#F2B48C', '#9CC9DE', '#F4F2EE'][i % 3]; g.beginPath(); g.ellipse(0, 0, 50, 18, 0, 0, TAU); g.fill(); g.fillStyle = '#BFDDE6'; g.beginPath(); g.ellipse(0, -12, 22, 14, 0, Math.PI, 0); g.fill(); }, { order: 2 });
      headline(5600, 700, 900, '2326', 220, riseAnim(t, this.cImag + .6, .6, .07), { color: '#F6E7CF', side: '#6A6FC4', depth: 7 });
    }
    // hero walks through all eras
    custom(cam.x - 260, 0, 0, (g, s) => { g.scale(s, s); person(g, { ...HERO, walk: cam.x / 60, t }); }, { order: 3 });
    // rocket launches; camera rises into space: Moon, Mars
    if (t > this.cMoon - 1.2) {
      const rk = clamp((t - this.cMoon + 1) / 4);
      custom(6300, lerp(0, 7000, ein(rk)), 300, (g, s) => { g.scale(s * 1.2, s * 1.2); const fl = 40 + Math.sin(t * 40) * 10; g.fillStyle = '#F2B04C'; g.beginPath(); g.moveTo(-18, 0); g.lineTo(0, fl * 2.5 * clamp(rk * 5)); g.lineTo(18, 0); g.fill(); g.fillStyle = '#F4F2EE'; rr(g, -26, -170, 52, 170, [26, 26, 6, 6]); g.fill(); g.fillStyle = PAL.red; g.beginPath(); g.moveTo(-26, -40); g.lineTo(-50, 10); g.lineTo(-26, 0); g.fill(); g.beginPath(); g.moveTo(26, -40); g.lineTo(50, 10); g.lineTo(26, 0); g.fill(); g.fillStyle = '#9CC9DE'; g.beginPath(); g.arc(0, -110, 14, 0, TAU); g.fill(); }, { order: 4 });
      const mk = smooth(inv(.3, .8, rise));
      if (mk > 0) {
        custom(5600, 6400, 2000, (g, s) => { g.scale(s * 2.2, s * 2.2); g.globalAlpha *= mk; g.fillStyle = '#E9E4D8'; g.beginPath(); g.arc(0, 0, 160, 0, TAU); g.fill(); g.fillStyle = '#CFC8B8'; [[-50, -40, 30], [40, 30, 22], [60, -60, 16], [-30, 70, 18]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }); }, { order: 1 });
        custom(7100, 6100, 3200, (g, s) => { g.scale(s * 3, s * 3); g.globalAlpha *= mk; g.fillStyle = '#C8613E'; g.beginPath(); g.arc(0, 0, 150, 0, TAU); g.fill(); g.fillStyle = '#A84A30'; g.beginPath(); g.ellipse(-40, -20, 60, 18, .3, 0, TAU); g.ellipse(50, 50, 40, 12, -.2, 0, TAU); g.fill(); g.fillStyle = '#F2E8E0'; g.beginPath(); g.ellipse(0, -140, 50, 12, 0, 0, TAU); g.fill(); }, { order: 1 });
      }
    }
    overlay(g => drawAge(g, t), 1);
  },
  drawMars(lt, t, land) {
    sky([[0, '#2A1A2E'], [.55, '#9C5A4A'], [1, '#E2A27A']]);
    starsBg(92, 120, .5, t);
    custom(cam.x + 520, 900, 3000, (g, s) => { g.scale(s * 1.6, s * 1.6); g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(0, 0, 0, 0, 0, 90); gl.addColorStop(0, 'rgba(140,200,255,.5)'); gl.addColorStop(1, 'rgba(140,200,255,0)'); g.fillStyle = gl; g.beginPath(); g.arc(0, 0, 90, 0, TAU); g.fill(); g.globalCompositeOperation = 'source-over'; g.fillStyle = '#5B9BD5'; g.beginPath(); g.arc(0, 0, 30, 0, TAU); g.fill(); g.fillStyle = '#7FB98A'; g.beginPath(); g.ellipse(-8, -6, 12, 8, .4, 0, TAU); g.fill(); }, { order: 0 });
    tagItem(cam.x + 520, 780, 2900, 'EARTH', null, pop(t, this.cEarth + .3, .6), { size: .9 });
    plane(hills('s9mf', 2600, 360, '#8E4A36', 6.1, .4, .7, 3), cam.x * .9, -60, 5000, { scale: 4.4, ay: 1, shadowAlpha: .25 });
    plane(hills('s9mm', 2600, 300, '#B2593C', 3.3, .35, .7, 4, { dots: 40 }), cam.x * .95, -40, 2200, { scale: 2.4, ay: 1 });
    plane(strip('s9mg', 5200, 600, '#C8704A', 4, 14), cam.x, 20, 150, { scale: 1.3, ay: .05 });
    // dome habitat
    custom(cam.x + 260, 0, 500, (g, s) => { g.scale(s, s); g.fillStyle = 'rgba(200,235,255,.45)'; g.strokeStyle = '#F4F2EE'; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 230, Math.PI, 0); g.fill(); g.stroke(); g.fillStyle = '#5E8F63'; g.beginPath(); g.arc(-60, -40, 40, 0, TAU); g.arc(40, -50, 50, 0, TAU); g.fill(); g.fillStyle = '#E9DCC4'; g.fillRect(-120, -60, 60, 60); }, { order: 1 });
    // hero in a fishbowl helmet looking at the Earth
    custom(cam.x - 200, 0, 0, (g, s) => { g.scale(s, s); person(g, { ...HERO, t, color: '#F4F2EE', legs: '#C9CDD2' }); g.strokeStyle = 'rgba(230,245,255,.9)'; g.lineWidth = 4; g.fillStyle = 'rgba(200,235,255,.25)'; g.beginPath(); g.arc(0, -192, 34, 0, TAU); g.fill(); g.stroke(); }, { order: 3 });
    const k7 = pop(t, this.c700 - .2, .7);
    if (k7 > 0) headline(cam.x + 80, 620, 700, '700 YEARS LEFT', 120, riseAnim(t, this.c700 - .2, .6, .04), { color: '#FFF4E4', side: '#8E4A36', depth: 6, dof: false });
    overlay(g => drawAge(g, t), 1);
  },
});

// ======================================================================= 10 MEMORY LIBRARY
function polaroid(g, k, drawPic, fade) {
  g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 20; g.shadowOffsetY = 10; g.fillStyle = '#F8F4EC'; g.fillRect(-120, -140, 240, 280); g.shadowColor = 'transparent';
  g.save(); g.beginPath(); g.rect(-100, -120, 200, 200); g.clip(); g.fillStyle = '#9CC9DE'; g.fillRect(-100, -120, 200, 200);
  if (fade > 0) g.filter = `blur(${fade * 14}px)`;
  g.globalAlpha *= 1 - fade * .85; drawPic(g); g.restore();
}
defScene(10, {
  carrierType: 'iris', carrierOpts: { dur: 1.2, c1: '#2A2030' },
  build() {
    const c = cue; this.cProb = c('problem inside'); this.cHold = c('only hold so many'); this.cDont = c("don't remember most"); this.cForget = c('forget almost everything');
    this.cFriend = c('first best friend'); this.cMom = c("mother's voice"); this.cHouse = c('house you grew up in'); this.cDiary = c('keep diaries'); this.cThous = c('Thousands of them');
    this.cLib = c('turn into a library'); this.cOnly = c('only one who could');
  },
  free() { freeSprites('s10'); },
  camera(lt, t) {
    const T = this.dur, fly = eio(inv(this.cHold - .3, this.cForget, t)), back = eio(inv(this.cLib - .3, this.cOnly + 1.5, t));
    const z = lerp(-1300, 3800, fly) + (t - this.cForget) * 30 * (t > this.cForget ? 1 : 0) - back * 2600;
    setCam({ x: Math.sin(lt * .3) * 60, y: 330 + Math.sin(lt * .4) * 25 + back * 220, z, roll: Math.sin(lt * .35) * .02, aperture: .9, focus: 900 + back * 600 });
  },
  draw(lt, t) {
    sky([[0, '#2A2030'], [.6, '#3E2E3A'], [1, '#22191F']]);
    // the head: a paper profile in front; camera flies into it
    const headA = 1 - smooth(inv(this.cHold, this.cHold + 1.2, t));
    if (headA > 0) custom(0, 0, -400, (g, s) => { g.scale(s, s); g.globalAlpha *= headA; g.fillStyle = '#E9C9A8'; g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 30; g.beginPath(); g.moveTo(-300, 0); g.bezierCurveTo(-330, -400, -250, -760, 50, -780); g.bezierCurveTo(330, -790, 400, -520, 360, -400); g.lineTo(430, -300); g.lineTo(370, -270); g.bezierCurveTo(380, -200, 340, -160, 280, -170); g.lineTo(260, 0); g.closePath(); g.fill(); g.shadowColor = 'transparent'; g.fillStyle = '#3A2A3A'; g.beginPath(); g.ellipse(40, -520, 220, 170, 0, 0, TAU); g.fill(); g.fillStyle = '#F2C14E'; for (let i = 0; i < 6; i++) { g.fillRect(-150 + i * 60, -620, 40, 200); } }, { order: 1, dof: false });
    // shelf arches receding in depth
    for (let i = 0; i < 12; i++) {
      const z = 400 + i * 700;
      plane(memo('s10arch' + (i % 2), () => sprite(2600, 1500, (g, w, h) => {
        g.fillStyle = i % 2 ? '#5A3A2E' : '#6A4636'; g.fillRect(0, 0, w, h);
        g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.moveTo(w * .36, h); g.lineTo(w * .36, h * .42); g.arc(w / 2, h * .42, w * .14, Math.PI, 0); g.lineTo(w * .64, h); g.fill(); g.globalCompositeOperation = 'source-over';
        const r = mulberry(i + 3);
        for (let y = 60; y < h - 40; y += 150) for (let x = 30; x < w - 30;) { if (x > w * .34 && x < w * .66 && y > h * .25) { x = w * .66 + 10; continue; } const bw = 18 + r() * 26, bh = 90 + r() * 40; g.fillStyle = ['#B9513F', '#2F6F73', '#E3A93B', '#8C6A9E', '#E9DCC4', '#4E7A5A'][r() * 6 | 0]; g.fillRect(x, y + 130 - bh, bw, bh); x += bw + 3; }
        g.fillStyle = '#3E281F'; for (let y = 190; y < h; y += 150) g.fillRect(0, y, w, 14);
      }, { shadowBlur: 20 })), 0, -60, z, { scale: 1.1 + i * .02, ay: 1, shadowAlpha: .5, shadowDist: 30 });
    }
    // warm reading lamps
    raw(9000, g => { g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(W / 2, H * .42, 50, W / 2, H * .42, 700); gl.addColorStop(0, 'rgba(255,200,130,.18)'); gl.addColorStop(1, 'rgba(255,200,130,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H); });
    // polaroids of memories that blur away
    const camZ = cam.z, mem = [
      [this.cFriend, -260, g => { person(g, { color: '#C9765A', t, shadow: false, age: .6 }); g.translate(60, 0); person(g, { ...HERO, age: .6, t, shadow: false }); }, 'Best friend'],
      [this.cMom, 260, g => { person(g, { color: '#B05A7A', longHair: true, t, shadow: false }); g.strokeStyle = PAL.ink; g.lineWidth = 4; for (let k = 1; k < 4; k++) { g.beginPath(); g.arc(40, -150, k * 18, -.7, .7); g.stroke(); } }, 'Mom'],
      [this.cHouse, 0, g => { g.scale(.6, .6); g.drawImage(house('s10h', 300, 300, '#F2E4CC', '#B8524A', 1).c, -190, -280); }, 'Home'],
    ];
    mem.forEach(([c, x, pic, label], i) => {
      const k = pop(t, c - .6, .6); if (k <= 0) return;
      const z = camZ + 900, fade = clamp((t - c - .9) / 1.6);
      custom(x + Math.sin(t * .6 + i) * 20, 360 + Math.sin(t * .8 + i) * 15 - fade * 120, z, (g, s) => { g.scale(s * eback(k, 2) * .9, s * eback(k, 2) * .9); g.rotate(Math.sin(t * .5 + i) * .06 + (i - 1) * .08); g.globalAlpha *= 1 - smooth(inv(.75, 1, fade)); g.translate(0, 60); polaroid(g, k, gg => { gg.save(); gg.translate(-10, 60); pic(gg); gg.restore(); }, fade); g.fillStyle = '#5A4A6A'; g.font = '700 38px Caveat'; g.textAlign = 'center'; g.fillText(label, 0, 120); }, { order: 4, dof: false });
    });
    // diaries, cassettes and photos flying onto shelves (thousands)
    const dk = t - this.cDiary;
    if (dk > 0) for (let i = 0; i < 70; i++) {
      const st = i * .045 + (i > 20 ? (this.cThous - this.cDiary) : 0), k = clamp((dk - st) / 1.6); if (k <= 0 || k >= 1) continue;
      const r = hash(i * 5.1), side = r > .5 ? 1 : -1, z0 = cam.z + 700, z1 = cam.z + 1500 + r * 2000;
      custom(lerp(side * 200, side * (700 + r * 300), eio(k)), lerp(250, 150 + hash(i) * 700, eio(k)) + Math.sin(k * Math.PI) * 200, lerp(z0, z1, eio(k)), (g, s) => { g.scale(s, s); g.rotate(k * 6 * (r - .5)); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 8; g.shadowOffsetY = 5; const ty = i % 3; if (ty === 0) { g.fillStyle = ['#B9513F', '#2F6F73', '#8C6A9E'][i % 3]; g.fillRect(-36, -48, 72, 96); g.fillStyle = '#F2C14E'; g.fillRect(-36, -48, 10, 96); } else if (ty === 1) { g.fillStyle = '#2B2A33'; rr(g, -44, -28, 88, 56, 6); g.fill(); g.fillStyle = '#E9DCC4'; g.fillRect(-32, -18, 64, 20); g.beginPath(); g.arc(-14, 12, 7, 0, TAU); g.arc(14, 12, 7, 0, TAU); g.fill(); } else { g.fillStyle = '#F8F4EC'; g.fillRect(-36, -42, 72, 84); g.fillStyle = '#9CC9DE'; g.fillRect(-28, -34, 56, 56); } }, { order: 5 });
    }
    // the lone reader at the end
    const ek = smooth(inv(this.cLib - .4, this.cLib + .6, t));
    if (ek > 0) custom(0, 0, 700, (g, s) => { g.scale(s, s); g.globalAlpha *= ek; person(g, { ...HERO, t }); g.fillStyle = '#B9513F'; g.fillRect(30, -150, 46, 60); }, { order: 3 });
    overlay(g => drawAge(g, t), 1);
  },
});

// ======================================================================= 11 URGENCY
defScene(11, {
  carrierType: 'sheets', carrierOpts: { dur: 1.3, c1: '#E8DCC8', c2: '#C9B79A', c3: '#9C8A70' },
  build() {
    const c = cue; this.cMind = c('what about your mind'); this.cPsy = c('psychologists'); this.cLim = c('time is limited'); this.cRush = c('rush to see'); this.cChase = c('chase our dreams');
    this.cWont = c("won't be able to"); this.cAhead = c('a thousand years ahead'); this.cUrg = c('feel that urgency'); this.cOff = c('putting things off'); this.cNext = c('next century');
    this.list = [['Learn piano', this.cOff + .2], ['Call Mom', this.cOff + .9], ['See the ocean', this.cNext - .6], ['Write a book', this.cNext + .3]];
  },
  free() { freeSprites('s11'); },
  camera(lt, t) {
    const big = eio(inv(this.cAhead - .4, this.cUrg + .5, t)), list = smooth(inv(this.cOff - .5, this.cOff + .3, t));
    setCam({ x: Math.sin(lt * .35) * 80 + list * -350, y: lerp(380, 520, big) + Math.sin(lt * .4) * 15, z: lerp(-1150, -1700, big) + lt * 6, roll: Math.sin(lt * .3) * .015, aperture: .6, focus: lerp(1550, 2100, big) });
  },
  draw(lt, t) {
    sky([[0, '#2E3A5A'], [.6, '#6A6F8E'], [1, '#C9B79A']]);
    plane(hills('s11h', 2600, 340, '#56607E', 9.1, .4, .7, 3), 0, -80, 5000, { scale: 4.6, ay: 1, shadowAlpha: .25 });
    plane(strip('s11g', 5200, 600, '#B9A58A', 3, 10), 0, 20, 300, { scale: 1.3, ay: .05 });
    // hourglass; sand flow slows when life is long
    const big = eio(inv(this.cAhead - .4, this.cUrg + .5, t));
    const flow = lerp(1, .04, big);
    custom(0, 0, 400, (g, s) => {
      const sc = s * lerp(1, 1.9, big); g.scale(sc, sc);
      const Hh = 560, Wd = 200, top = -Hh;
      // fill fractions computed from integrated flow (deterministic)
      const used = clamp(.25 + (Math.min(t, this.cAhead) - this.t0) * .02 + Math.max(0, t - this.cAhead) * .0008);
      g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 24; g.shadowOffsetX = 10; g.shadowOffsetY = 14;
      g.fillStyle = '#6B4A38'; rr(g, -Wd - 40, top - 30, Wd * 2 + 80, 34, 8); g.fill(); rr(g, -Wd - 40, -4, Wd * 2 + 80, 34, 8); g.fill(); g.shadowColor = 'transparent';
      g.fillStyle = '#5A3F2E'; g.fillRect(-Wd - 30, top, 16, Hh); g.fillRect(Wd + 14, top, 16, Hh);
      const glass = (fillTop, fillBot) => {
        g.save(); g.beginPath(); g.moveTo(-Wd, top + 4); g.lineTo(Wd, top + 4); g.quadraticCurveTo(Wd, top + Hh * .4, 10, top + Hh / 2); g.quadraticCurveTo(Wd, top + Hh * .6, Wd, -4); g.lineTo(-Wd, -4); g.quadraticCurveTo(-Wd, top + Hh * .6, -10, top + Hh / 2); g.quadraticCurveTo(-Wd, top + Hh * .4, -Wd, top + 4); g.closePath();
        g.fillStyle = 'rgba(210,235,245,.25)'; g.fill(); g.clip();
        g.save(); g.beginPath(); g.rect(-Wd, top, Wd * 2, Hh / 2); g.clip(); g.fillStyle = '#E8B85C'; g.fillRect(-Wd, top + Hh / 2 - (1 - used) * Hh * .45, Wd * 2, Hh); g.restore();
        g.fillStyle = '#E8B85C'; g.beginPath(); const hb = used * Hh * .42; g.moveTo(-Wd, -4); g.lineTo(-Wd, -4 - hb * .6); g.quadraticCurveTo(0, -4 - hb * 1.4, Wd, -4 - hb * .6); g.lineTo(Wd, -4); g.fill();
        // falling stream (grains get sparse as flow drops)
        const n = Math.max(1, Math.round(flow * 30));
        for (let i = 0; i < n; i++) { const yy = top + Hh / 2 + ((t * 300 + i * (Hh * .5 / n)) % (Hh * .45)); g.fillRect(-2.5, yy, 5, flow > .3 ? 14 : 6); }
        g.restore();
        g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 4; g.beginPath(); g.moveTo(-Wd + 30, top + 40); g.quadraticCurveTo(-Wd + 40, top + Hh * .3, -40, top + Hh * .45); g.stroke();
      };
      glass();
    }, { order: 2 });
    if (t < this.cAhead) custom(0, 1000, 600, (g, s) => { g.scale(s, s); g.globalAlpha *= 1 - smooth(inv(this.cAhead - .8, this.cAhead - .1, t)); paperText(g, 'TIME IS LIMITED', 90, { anim: riseAnim(t, this.cLim - .2, .6, .03), color: '#FFF4E4', spacing: .04 }); }, { order: 5, dof: false });
    // people rushing to hug, chasing a star
    const rk = smooth(inv(this.cRush - .3, this.cRush + .2, t)) * (1 - smooth(inv(this.cAhead - .6, this.cAhead, t)));
    if (rk > 0) {
      const run = clamp((t - this.cRush) / 1.6);
      custom(lerp(-1100, -330, eout(run)), 0, 150, (g, s) => { g.scale(s, s); person(g, { ...HERO, walk: t * 14, walkAmp: 1 - run * .7, t, armUp: run > .9 }); if (run < .9) { g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 5; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-60 - i * 10, -60 - i * 40); g.lineTo(-140 - i * 20, -60 - i * 40); g.stroke(); } } }, { order: 3, alpha: rk });
      custom(-230, 0, 150, (g, s) => { g.scale(s, s); person(g, { color: '#B05A7A', longHair: true, flip: true, t, armUp: run > .9 }); }, { order: 3, alpha: rk });
      if (run > .95) custom(-280, 300, 140, (g, s) => { g.scale(s * eback(clamp((t - this.cRush - 1.5) / .5), 3), s * eback(clamp((t - this.cRush - 1.5) / .5), 3)); heart(g, 30); }, { order: 4, alpha: rk });
      const ck = clamp((t - this.cChase + .2) / 2.4);
      if (ck > 0) { custom(lerp(200, 900, ck), 0, 150, (g, s) => { g.scale(s, s); person(g, { color: '#4F7CA0', walk: t * 12, t, armUp: true }); }, { order: 3, alpha: rk }); custom(lerp(320, 1050, ck), 330 + Math.sin(t * 4) * 30, 150, (g, s) => { g.scale(s, s); g.rotate(t); g.fillStyle = '#F2C14E'; g.shadowColor = 'rgba(255,210,90,.8)'; g.shadowBlur = 20; star(g, 0, 0, 34); g.fill(); }, { order: 4, alpha: rk }); }
    }
    // to-do list stamped NEXT CENTURY
    const lk = smooth(inv(this.cOff - .5, this.cOff + .2, t));
    if (lk > 0) overlay(g => {
      g.save(); g.translate(W * .7, H * .46 + (1 - eback(lk)) * 400); g.rotate(.04); g.globalAlpha = lk;
      g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 26; g.shadowOffsetY = 14; g.fillStyle = '#F8F4EC'; g.fillRect(-300, -300, 600, 600); g.shadowColor = 'transparent';
      g.strokeStyle = 'rgba(80,120,170,.3)'; g.lineWidth = 2; for (let y = -200; y < 300; y += 100) { g.beginPath(); g.moveTo(-280, y + 40); g.lineTo(280, y + 40); g.stroke(); }
      g.fillStyle = PAL.ink; g.font = '700 64px Caveat'; g.fillText('To do:', -250, -220);
      this.list.forEach(([item, ts], i) => {
        const y = -110 + i * 100; g.font = '600 52px Caveat'; g.fillStyle = '#2D3A8C'; g.fillText('☐  ' + item, -250, y + 20);
        const sk = clamp((t - ts) / .18);
        if (sk > 0) { g.save(); g.translate(150, y); g.rotate(-.18 + i * .07); g.scale(lerp(2.2, 1, eout(sk)), lerp(2.2, 1, eout(sk))); g.globalAlpha = lk * sk * .9; g.strokeStyle = PAL.red; g.lineWidth = 5; rr(g, -120, -34, 240, 60, 8); g.stroke(); g.fillStyle = PAL.red; g.font = '900 30px Fraunces'; g.textAlign = 'center'; g.fillText('NEXT CENTURY', 0, 8); g.restore(); }
      });
      g.restore();
    }, 2);
    overlay(g => drawAge(g, t), 1);
  },
});
