// Scenes 12–17: chapters, empires, 800 years, 1000th birthday, gift or curse, finale.
'use strict';

// ======================================================================= 12 CHAPTERS (pop-up book)
defScene(12, {
  carrierType: 'page', carrierOpts: { dur: 1.2, c1: '#F4EADA' },
  build() {
    const c = cue; this.cCh = c('live in chapters'); this.cDoc = c('as a doctor'); this.cMus = c('as a musician'); this.cOcean = c('exploring the oceans');
    this.cWorld = c('home on another world'); this.cSep = c('separate person'); this.cYou = c('connected only by you');
    this.pages = [this.cDoc - .5, this.cMus - .5, this.cOcean - .5, this.cWorld - .5];
  },
  free() { freeSprites('s12'); },
  camera(lt, t) {
    const out = eio(inv(this.cSep - .4, this.cYou + .6, t));
    setCam({ x: Math.sin(lt * .4) * 50, y: lerp(250, 520, out) + Math.sin(lt * .5) * 15, z: lerp(-620, -1900, out) + Math.sin(lt * .3) * 30, roll: Math.sin(lt * .35) * .015, aperture: .5, focus: lerp(920, 2200, out) });
  },
  draw(lt, t) {
    sky([[0, '#3A2A22'], [.6, '#5A4032'], [1, '#2A1E18']]);
    raw(5000, g => { g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(W / 2, H * .3, 50, W / 2, H * .4, 900); gl.addColorStop(0, 'rgba(255,210,150,.22)'); gl.addColorStop(1, 'rgba(255,210,150,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H); });
    const out = eio(inv(this.cSep - .4, this.cYou + .6, t));
    const chapter = this.pages.reduce((a, p, i) => t >= p ? i : a, -1);
    // book (open spread), on a desk
    plane(memo('s12desk', () => sprite(3000, 600, (g, w, h) => { g.fillStyle = '#6B4A38'; g.fillRect(0, 0, w, h); g.fillStyle = '#5A3E2E'; for (let y = 20; y < h; y += 40) g.fillRect(0, y, w, 3); })), 0, 40, 500, { scale: 1.2, ay: 0 });
    const scenesDraw = [
      g => { // doctor: hospital + hero in white coat
        g.fillStyle = '#F4F2EE'; g.fillRect(-170, -260, 240, 260); g.fillStyle = PAL.red; g.fillRect(-70, -230, 40, 110); g.fillRect(-105, -195, 110, 40); g.fillStyle = '#9FC3D6'; for (let i = 0; i < 3; i++) g.fillRect(-150 + i * 70, -90, 40, 40);
        g.translate(150, 0); person(g, { ...HERO, color: '#F4F2EE', t }); },
      g => { // musician: piano + notes
        g.fillStyle = PAL.ink; rr(g, -200, -150, 260, 110, 14); g.fill(); g.fillRect(-190, -40, 20, 40); g.fillRect(30, -40, 20, 40); g.fillStyle = '#F6EEDF'; g.fillRect(-190, -70, 240, 26); g.fillStyle = PAL.ink; for (let i = 0; i < 9; i++) g.fillRect(-180 + i * 26, -70, 12, 14);
        for (let i = 0; i < 4; i++) { const y = -200 - ((t * 60 + i * 50) % 200); g.globalAlpha = 1 - ((t * 60 + i * 50) % 200) / 200; g.fillStyle = PAL.ink; g.beginPath(); g.ellipse(-140 + i * 60, y, 12, 9, -.4, 0, TAU); g.fill(); g.fillRect(-130 + i * 60, y - 50, 4, 50); g.globalAlpha = 1; }
        g.translate(150, 0); person(g, { ...HERO, color: '#8C6A9E', t }); },
      g => { // oceans: ship on waves
        g.save(); g.translate(Math.sin(t) * 10, Math.sin(t * 1.4) * 6); g.fillStyle = '#8E5A3A'; g.beginPath(); g.moveTo(-200, -60); g.lineTo(120, -60); g.lineTo(80, 0); g.lineTo(-170, 0); g.fill(); g.fillStyle = '#F4EDE0'; g.beginPath(); g.moveTo(-50, -70); g.lineTo(-50, -270); g.lineTo(60, -70); g.fill(); g.restore();
        g.fillStyle = '#4F7CA0'; g.beginPath(); g.moveTo(-260, 0); for (let x = -260; x <= 260; x += 20) g.lineTo(x, -20 + Math.sin(x * .05 + t * 3) * 10); g.lineTo(260, 10); g.lineTo(-260, 10); g.fill();
        g.translate(170, -10); person(g, { ...HERO, color: '#2F6F73', t, wind: 1.6 }); },
      g => { // another world: dome + two moons
        g.fillStyle = '#C8704A'; g.fillRect(-260, -20, 520, 20); g.fillStyle = '#E9E4D8'; g.beginPath(); g.arc(-260, -300, 30, 0, TAU); g.fill(); g.fillStyle = '#F2B48C'; g.beginPath(); g.arc(-170, -330, 18, 0, TAU); g.fill();
        g.fillStyle = 'rgba(200,235,255,.5)'; g.strokeStyle = '#F4F2EE'; g.lineWidth = 5; g.beginPath(); g.arc(-60, -20, 140, Math.PI, 0); g.fill(); g.stroke(); g.fillStyle = '#5E8F63'; g.beginPath(); g.arc(-90, -60, 30, 0, TAU); g.fill();
        g.translate(170, -20); person(g, { ...HERO, color: '#F4F2EE', legs: '#C9CDD2', t }); },
    ];
    const titles = ['Chapter I · Doctor', 'Chapter II · Musician', 'Chapter III · Oceans', 'Chapter IV · Another world'];
    if (out < .5) {
      custom(0, 120, 300, (g, s) => {
        g.scale(s, s);
        // spread
        g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 40; g.shadowOffsetY = 20; g.fillStyle = '#7A2E2A'; rr(g, -720, -40, 1440, 80, 12); g.fill(); g.shadowColor = 'transparent';
        g.fillStyle = '#F4EADA'; g.beginPath(); g.moveTo(-700, -20); g.quadraticCurveTo(-350, -60, 0, -10); g.quadraticCurveTo(350, -60, 700, -20); g.lineTo(700, 30); g.lineTo(-700, 30); g.fill();
        // pop-up diorama of current chapter rising from the page
        if (chapter >= 0) {
          const k = clamp((t - this.pages[chapter] - .25) / .7), e = eback(k, 2);
          g.save(); g.translate(0, -10); g.scale(1, e); g.globalAlpha *= clamp(k * 3); scenesDraw[chapter](g); g.restore();
          g.fillStyle = '#5A3A2E'; g.font = '700 54px Caveat'; g.textAlign = 'center'; g.globalAlpha = clamp(k * 2); g.fillText(titles[chapter], -380, 10 + 0); g.globalAlpha = 1;
        } else {
          const k = pop(t, this.cCh - .2, .6); g.globalAlpha *= k; g.translate(0, -170); paperText(g, 'MY LIVES', 120, { color: '#7A2E2A', shadow: false, anim: riseAnim(t, this.cCh - .2, .5, .05) }); g.globalAlpha = 1;
        }
      }, { order: 2 });
      // page turning on each chapter change
      this.pages.forEach(p => { const k = clamp((t - p + .3) / .5); if (k > 0 && k < 1) custom(0, 120, 290, (g, s) => { g.scale(s, s); const a = eio(k) * Math.PI, lift = Math.sin(a); g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 30; g.shadowOffsetY = 10; g.fillStyle = '#FBF3E4'; g.beginPath(); g.moveTo(0, -10); const ex = Math.cos(a) * 700, ey = -20 - lift * 260; g.quadraticCurveTo(ex * .5, -40 - lift * 320, ex, ey); g.lineTo(ex, ey + 40); g.quadraticCurveTo(ex * .5, -lift * 280, 0, 30); g.closePath(); g.fill(); g.restore(); }, { order: 3 }); });
    }
    // connected only by you: four selves on a red thread
    if (out > .3) {
      const k = smooth(inv(.3, .8, out));
      const cols = ['#F4F2EE', '#8C6A9E', '#2F6F73', '#F4F2EE'];
      for (let i = 0; i < 4; i++) custom(-900 + i * 600, 0, 300, (g, s) => { g.scale(s * 1.4, s * 1.4); g.globalAlpha *= clamp(k * 2 - i * .2); person(g, { ...HERO, color: cols[i], t, walk: t * 4 + i }); g.fillStyle = '#F4EADA'; g.font = '700 40px Caveat'; g.textAlign = 'center'; g.fillText(['Doctor', 'Musician', 'Sailor', 'Settler'][i], 0, 60); }, { order: 3 });
      raw(299, g => { const pts = [0, 1, 2, 3].map(i => project(-900 + i * 600 - 30, 170 * 1.4 * .75, 300)); if (pts.some(p => !p)) return; g.strokeStyle = PAL.red; g.lineWidth = 5; g.lineCap = 'round'; const n = Math.ceil(k * 30); g.beginPath(); for (let j = 0; j <= n; j++) { const u = j / 30 * 3, i = Math.min(2, Math.floor(u)), f = u - i, a = pts[i], b = pts[i + 1]; const x = W / 2 + lerp(a.sx, b.sx, f), y = H / 2 + lerp(a.sy, b.sy, f) + Math.sin(f * Math.PI) * 40; j ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); });
      headline(0, 900, 300, 'CONNECTED ONLY BY YOU', 90, riseAnim(t, this.cYou - .1, .5, .025), { color: '#FFF4E4', side: '#7A2E2A', depth: 5, dof: false });
    }
  },
});

// ======================================================================= 13 EMPIRES RISE AND FALL
defScene(13, {
  carrierType: 'clouds', carrierOpts: { dur: 1.4, c1: '#E9D9BE', c2: '#D9C29A' },
  build() {
    const c = cue; this.c500 = c('five hundredth year'); this.cRise = c('empires rise'); this.cFall = c('and fall.'); this.cWrit = c('history being written'); this.cRe = c('and then rewritten');
    this.cBooks = c('history books'); this.cWit = c('last living witness'); this.cHist = c('Historians could'); this.cSil = c('stay silent'); this.cSec = c('secret forever');
  },
  free() { freeSprites('s13'); },
  camera(lt, t) {
    const scroll = smooth(inv(this.cWrit - .4, this.cWrit + .2, t)) * (1 - smooth(inv(this.cBooks - .3, this.cBooks + .3, t)));
    const end = eio(inv(this.cWit - .5, this.cSec + 1, t));
    setCam({ x: lerp(-200, 100, eio(lt / this.dur)) + Math.sin(lt * .4) * 40 + end * 200, y: 360 + Math.sin(lt * .5) * 15 - end * 120, z: -1300 + end * 600 + Math.sin(lt * .3) * 30, roll: Math.sin(lt * .4) * .015, aperture: .5 + end * .5, focus: 1350 - end * 600 });
  },
  draw(lt, t) {
    const dim = smooth(inv(this.cSil, this.cSec + 1, t));
    sky(skyAt(t, [[0, '#C98B6B'], [.6, '#EBC79E'], [1, '#F2DDBB']], [[0, '#2A1E2E'], [.6, '#5A3F4F'], [1, '#7A5A5A']], dim * .8));
    plane(hills('s13h', 2600, 340, mix('#B9906A', '#4A3A4A', dim), 7.7, .4, .7, 3), 0, -80, 5000, { scale: 4.6, ay: 1, shadowAlpha: .25 });
    plane(strip('s13g', 5200, 600, mix('#D9BE96', '#6A5A5A', dim), 5, 10), 0, 20, 200, { scale: 1.3, ay: .05 });
    // empires: temples / towers rise (elastic), then crack and topple
    const empires = [[-900, 900, '#E9DCC4', 0], [-450, 650, '#D9A07A', 1], [0, 1050, '#F2E4CC', 2], [450, 750, '#C98B6B', 3], [900, 600, '#E2CDA8', 4]];
    empires.forEach(([x, h, col, i]) => {
      const rk = elastic(clamp((t - this.cRise - i * .15) / 1.2)), fk = clamp((t - this.cFall - .1 - i * .12) / 1.3);
      if (rk <= 0) return;
      custom(x * 1.1, 0, 800 + (i % 2) * 300, (g, s) => {
        g.scale(s * 1.45, s * 1.45);
        const parts = 4;
        for (let p = 0; p < parts; p++) {
          const y0 = -p * h / parts * rk, hh = h / parts * rk;
          g.save();
          if (fk > 0) { const dir = (i % 2 ? 1 : -1) * (p + 1); g.translate(dir * 60 * fk * fk * (p + 1), Math.min(-y0, (fk * fk) * 900 * (p / parts + .3))); g.rotate(dir * fk * fk * .5); g.globalAlpha *= 1 - smooth(inv(.7, 1, fk)); }
          g.fillStyle = col; g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 14; g.shadowOffsetX = 8;
          if (i === 0 || i === 2) { g.fillRect(-120, y0 - hh, 240, hh); g.fillStyle = shade(col, -.12); for (let c = -100; c <= 80; c += 60) g.fillRect(c, y0 - hh + 10, 20, hh - 20); }
          else { g.fillRect(-60, y0 - hh, 120, hh); g.fillStyle = shade(col, -.15); g.fillRect(-60, y0 - hh, 120, 12); }
          g.restore();
        }
        if (fk < .05) { g.fillStyle = [PAL.red, PAL.teal, PAL.mustard, '#8C6A9E', '#4F7CA0'][i]; g.fillRect(-3, -h * rk - 120, 6, 120); g.beginPath(); g.moveTo(3, -h * rk - 120); g.lineTo(80 + Math.sin(t * 6 + i) * 8, -h * rk - 100); g.lineTo(3, -h * rk - 80); g.fill(); }
        if (fk > 0 && fk < 1) { g.fillStyle = `rgba(210,190,160,${.6 * (1 - fk)})`; for (let d = 0; d < 6; d++) { g.beginPath(); g.arc((d - 2.5) * 70 * (1 + fk), -40 * fk, 80 * fk + 20, 0, TAU); g.fill(); } }
      }, { order: 1 });
    });
    // scroll: history written, then rewritten
    const sk = smooth(inv(this.cWrit - .4, this.cWrit + .2, t)) * (1 - smooth(inv(this.cBooks - .3, this.cBooks + .3, t)));
    if (sk > 0) overlay(g => {
      g.save(); g.globalAlpha = sk; g.translate(W / 2, H * .45 + (1 - eback(sk)) * 300);
      g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 30; g.shadowOffsetY = 16; g.fillStyle = '#EAD9B4'; g.fillRect(-460, -260, 920, 520); g.shadowColor = 'transparent';
      g.fillStyle = '#C9B48F'; rr(g, -490, -290, 980, 50, 25); g.fill(); rr(g, -490, 240, 980, 50, 25); g.fill();
      const lines = 5;
      for (let i = 0; i < lines; i++) {
        const wk = clamp((t - this.cWrit - i * .2) / .5), ek = clamp((t - this.cRe + .1 - i * .08) / .3), rk = clamp((t - this.cRe - .3 - i * .2) / .5);
        const y = -170 + i * 80, len = 760 - (i % 2) * 140;
        g.strokeStyle = '#3A2A22'; g.lineWidth = 6; g.lineCap = 'round';
        if (ek < 1) { g.globalAlpha = sk * (1 - ek); g.beginPath(); for (let x = 0; x < len * wk; x += 6) g.lineTo(-400 + x, y + Math.sin(x * .25 + i) * 6); g.stroke(); }
        if (ek > 0 && ek < 1) { g.globalAlpha = sk; g.strokeStyle = PAL.red; g.lineWidth = 8; g.beginPath(); g.moveTo(-410, y); g.lineTo(-410 + (len + 20) * ek, y - 4); g.stroke(); }
        if (rk > 0) { g.globalAlpha = sk; g.strokeStyle = '#2D3A8C'; g.lineWidth = 6; g.beginPath(); for (let x = 0; x < len * rk; x += 6) g.lineTo(-400 + x, y + 26 + Math.cos(x * .2 + i) * 6); g.stroke(); }
      }
      // quill
      const qi = Math.min(lines - 1, Math.floor((t - this.cWrit) / .2)), qx = -400 + ((t * 600) % 700);
      g.globalAlpha = sk; g.save(); g.translate(qx, -190 + Math.max(0, qi) * 80 + (t > this.cRe ? 26 : 0)); g.rotate(-.6); g.fillStyle = '#F4F2EE'; g.beginPath(); g.ellipse(40, -90, 22, 90, .2, 0, TAU); g.fill(); g.strokeStyle = '#3A2A22'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(60, -170); g.stroke(); g.restore();
      g.restore();
    }, 2);
    // books stack + witness hero + historian microphone
    const bk = t - this.cBooks;
    if (bk > 0) for (let i = 0; i < 7; i++) { const k = eout4(clamp((bk - i * .1) / .5)); custom(520, lerp(800, i * 44, k), 300, (g, s) => { g.scale(s, s); g.fillStyle = [PAL.red, PAL.teal, PAL.mustard, '#8C6A9E', '#4E7A5A', '#B9513F', '#4F7CA0'][i]; g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 8; g.shadowOffsetY = 4; rr(g, -100 + (i % 3) * 8, -42, 200, 40, 4); g.fill(); g.shadowColor = 'transparent'; g.fillStyle = '#F2E4CC'; g.fillRect(-90 + (i % 3) * 8, -30, 6, 18); }, { order: 3 }); }
    const wk = smooth(inv(this.cWit - .4, this.cWit + .3, t));
    if (wk > 0) custom(150, 0, 300, (g, s) => { g.scale(s, s); g.globalAlpha *= wk; person(g, { ...HERO, t }); const shh = smooth(inv(this.cSil, this.cSil + .3, t)); if (shh > 0) { g.strokeStyle = '#F0C9A4'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(18, -150); g.lineTo(26, -190 * shh - 150 * (1 - shh)); g.stroke(); } }, { order: 3 });
    const hk = smooth(inv(this.cHist - .3, this.cHist + .3, t)) * (1 - smooth(inv(this.cSil + .2, this.cSil + .8, t)));
    if (hk > 0) { custom(-150 - (1 - hk) * 300, 0, 290, (g, s) => { g.scale(s, s); person(g, { color: '#7A5C4C', t, walk: (1 - hk) * 5, walkAmp: 1 - hk }); g.fillStyle = PAL.ink; g.fillRect(50, -140, 8, 50); g.beginPath(); g.arc(54 + 40, -150, 16, 0, TAU); g.fill(); g.fillRect(54, -152, 40, 6); }, { order: 3 }); }
    const shk = pop(t, this.cSil + .2, .5);
    if (shk > 0) custom(260, 330, 300, (g, s) => { g.scale(s * eback(shk, 2), s * eback(shk, 2)); g.globalAlpha *= 1 - smooth(inv(this.cSec + 1, this.cSec + 1.6, t)); g.fillStyle = '#F6EEDF'; g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 10; rr(g, -90, -44, 180, 80, 36); g.fill(); g.shadowColor = 'transparent'; g.fillStyle = PAL.ink; g.font = 'italic 800 48px Fraunces'; g.textAlign = 'center'; g.fillText('shh…', 0, 12); }, { order: 5 });
    overlay(g => drawAge(g, t), 1);
  },
});

// ======================================================================= 14 EIGHT HUNDRED YEARS
const QMARK = [[0, -3], [1, -3.6], [2, -3.3], [2.4, -2.4], [1.8, -1.5], [1, -1], [1, 0], [1, 1.2]];
defScene(14, {
  carrierType: 'iris', carrierOpts: { dur: 1.2, c1: '#101433' },
  build() {
    const c = cue; this.c800 = c('eight hundredth year'); this.cTired = c("maybe you're tired"); this.cCur = c('more curious'); this.cNobody = c('Nobody knows'); this.cNever = c('never happened before');
    this.cWise = c('the wisest person'); this.cLone = c('Or the loneliest');
  },
  free() { freeSprites('s14'); },
  camera(lt, t) {
    const back = eio(inv(this.cLone - .3, this.cLone + 2.2, t));
    setCam({ x: Math.sin(lt * .25) * 60, y: lerp(260, 520, back) + Math.sin(lt * .4) * 12, z: lerp(-900 - lt * 8, -3600, back), roll: Math.sin(lt * .3) * .012, aperture: .5, focus: lerp(1000, 3700, back) });
  },
  draw(lt, t) {
    sky([[0, '#070A1E'], [.55, '#141B3A'], [1, '#2E3566']]);
    starsBg(141, 320, 1, t);
    // aurora
    raw(1e10, g => { g.globalCompositeOperation = 'lighter'; for (let b = 0; b < 3; b++) { g.beginPath(); for (let x = -50; x <= W + 50; x += 30) g.lineTo(x, H * (.22 + b * .06) + Math.sin(x * .004 + t * .4 + b) * 60 + Math.sin(x * .011 + b * 2) * 20); for (let x = W + 50; x >= -50; x -= 30) g.lineTo(x, H * (.22 + b * .06) + 140 + Math.sin(x * .004 + t * .4 + b) * 60); const lg = g.createLinearGradient(0, H * .15, 0, H * .5); lg.addColorStop(0, `rgba(90,255,190,${.10 - b * .02})`); lg.addColorStop(1, 'rgba(90,120,255,0)'); g.fillStyle = lg; g.fill(); } });
    // constellation: question mark, then WISEST
    const qk = clamp((t - this.cNobody) / 1.6), qo = 1 - smooth(inv(this.cWise - .5, this.cWise, t));
    if (qk > 0 && qo > 0) overlay(g => { g.save(); g.globalAlpha = qo; g.translate(W * .62, H * .38); g.scale(70, 70); g.strokeStyle = 'rgba(255,240,200,.6)'; g.lineWidth = .05; g.beginPath(); const n = Math.ceil(qk * (QMARK.length - 1)); for (let i = 0; i < Math.min(n, QMARK.length - 1); i++) { g.moveTo(...QMARK[i]); g.lineTo(...QMARK[i + 1]); } g.stroke(); QMARK.forEach(([x, y], i) => { if (i / (QMARK.length - 1) > qk + .01) return; g.fillStyle = '#FFF6E0'; g.beginPath(); g.arc(x, y, .09 + Math.sin(t * 3 + i) * .02, 0, TAU); g.fill(); }); g.restore(); }, 3);
    const wk = pop(t, this.cWise - .1, .8);
    if (wk > 0) overlay(g => { g.save(); g.translate(W / 2, H * .3); g.globalAlpha = 1 - smooth(inv(this.cLone + .6, this.cLone + 1.5, t)); paperText(g, 'WISEST', 170, { anim: (i, n) => ({ a: clamp((t - this.cWise - i * .08) / .4), s: lerp(1.6, 1, eout(clamp((t - this.cWise - i * .08) / .5))) }), color: '#FFF6E0', shadowColor: 'rgba(255,230,160,.6)', spacing: .14 }); g.restore(); }, 3);
    // plain
    plane(hills('s14h2', 2600, 300, '#1E2448', 4.4, .35, .75, 3), 0, -60, 4000, { scale: 4, ay: 1, shadowAlpha: .3 });
    plane(strip('s14g', 6000, 700, '#2A3058', 7, 8), 0, 20, 200, { scale: 2.2, ay: .05 });
    // rock + hero (tired: sits; curious: telescope)
    plane(memo('s14rock', () => sprite(260, 120, (g, w, h) => { g.fillStyle = '#4A4F72'; g.beginPath(); g.moveTo(0, h); g.quadraticCurveTo(20, 10, w * .5, 6); g.quadraticCurveTo(w - 10, 10, w, h); g.fill(); })), -40, 0, 30, { scale: 1 });
    const curious = t > this.cCur - .2;
    custom(curious ? 60 : -30, curious ? 0 : 82, 20, (g, s) => { g.scale(s, s); person(g, { ...HERO, sit: !curious, grey: .0, t, color: '#3E5C76' }); if (curious) { g.save(); g.translate(30, -160); g.rotate(-.6); g.fillStyle = '#C9A15A'; rr(g, 0, -10, 110, 20, 6); g.fill(); g.fillStyle = '#8E6A3A'; rr(g, 90, -14, 30, 28, 6); g.fill(); g.restore(); } }, { order: 3 });
    // shooting star when curious
    const ss = clamp((t - this.cCur - .2) / 1.2);
    if (ss > 0 && ss < 1) overlay(g => { g.save(); g.globalCompositeOperation = 'lighter'; const x = lerp(W * .2, W * .7, ss), y = lerp(H * .1, H * .35, ss); const lg = g.createLinearGradient(x - 260, y - 120, x, y); lg.addColorStop(0, 'rgba(255,240,200,0)'); lg.addColorStop(1, 'rgba(255,240,200,.9)'); g.strokeStyle = lg; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 260, y - 120); g.lineTo(x, y); g.stroke(); g.restore(); }, 4);
    // LONELIEST: tiny word next to the tiny hero as the camera pulls far away
    const lk = pop(t, this.cLone + .2, .8);
    if (lk > 0) custom(60, 300, 20, (g, s) => { g.scale(s, s); g.globalAlpha *= lk * .9; paperText(g, 'loneliest', 46, { color: '#C9CDE6', weight: 600, shadow: false, spacing: .2 }); }, { order: 4, dof: false });
    overlay(g => drawAge(g, t), 1);
  },
});

// ======================================================================= 15 THE 1000TH BIRTHDAY
defScene(15, {
  carrierType: 'sheets', carrierOpts: { dur: 1.3, c1: '#2E2A55', c2: '#4A3F72', c3: '#8A5F86' },
  build() {
    const c = cue; this.cReach = c('you reach it'); this.c1000 = c('one thousandth birthday'); this.c3026 = c('three thousand twenty-six'); this.cQuiet = c('somewhere quiet');
    this.cHill = c('on a hill'); this.cPlanet = c('another planet'); this.cSun = c('watch the sunrise'); this.cSame = c('same Sun'); this.cFirst = c('very first morning');
    this.c365 = c('three hundred and sixty-five thousand'); this.cBeau = c('still beautiful');
  },
  free() { freeSprites('s15'); },
  camera(lt, t) {
    const T = this.dur, rise = eio(inv(this.cSun - .5, this.cBeau + 1, t)), big = smooth(inv(this.c1000 - .5, this.c1000 + .2, t)) * (1 - smooth(inv(this.cQuiet - .6, this.cQuiet + .2, t)));
    setCam({ x: lerp(-200, 120, eio(lt / T)) + Math.sin(lt * .3) * 40, y: lerp(320, 420, rise) + Math.sin(lt * .4) * 12, z: lerp(-1300, -1600, rise) + lt * 6, roll: Math.sin(lt * .3) * .012 + rise * -.02, aperture: .5, focus: 1350 });
  },
  draw(lt, t) {
    const sunK = eout(inv(this.cSun - .4, this.cBeau + 1.5, t)), planet = smooth(inv(this.cPlanet - .3, this.cPlanet + 1.2, t));
    const pre = [[0, '#1A1838'], [.6, '#3A2F5A'], [1, '#6A4A6A']], dawn = [[0, '#7FB2D0'], [.55, '#F2C59A'], [1, '#FBE3BE']];
    let st = skyAt(t, pre, dawn, sunK); st = skyAt(t, st, [[0, '#6A3A5A'], [.55, '#E29A7A'], [1, '#FBD3A6']], planet * .5);
    sky(st);
    starsBg(151, 200, 1 - sunK, t);
    // second world in the sky: ringed planet + moon
    if (planet > 0) custom(-1600, 2600, 6000, (g, s) => { g.scale(s * 3, s * 3); g.globalAlpha *= planet; g.fillStyle = '#E9C9A8'; g.beginPath(); g.arc(0, 0, 160, 0, TAU); g.fill(); g.fillStyle = '#D9A07A'; g.fillRect(-160, -30, 320, 30); g.strokeStyle = 'rgba(255,240,220,.85)'; g.lineWidth = 14; g.beginPath(); g.ellipse(0, 0, 300, 60, -.3, 0, TAU); g.stroke(); }, { order: 0 });
    // the same Sun as the very first morning
    plane(sunSprite('s0sun', 170, '#F6B24C'), 900, lerp(-1500, 3200, sunK), 15000, { scale: 9.5, shadow: false, ay: .5 });
    // ring of 365,000 sunrises
    const rk = clamp((t - this.c365 + .3) / 2.2);
    if (rk > 0) overlay(g => { g.save(); const p = project(900, lerp(-1500, 3200, sunK), 15000); if (!p) { g.restore(); return; } g.translate(W / 2 + p.sx, H / 2 + p.sy); g.globalAlpha = 1 - smooth(inv(this.cBeau, this.cBeau + 1.5, t)); for (let i = 0; i < 260; i++) { const a = i * 2.39996, r = Math.sqrt(i) * 34 * eout(rk); g.fillStyle = i % 5 ? '#FFD98A' : '#FFF3D0'; g.beginPath(); g.arc(Math.cos(a + t * .2) * r, Math.sin(a + t * .2) * r * .7, 6 + (i % 3) * 2, 0, TAU); g.fill(); } g.restore(); }, 0);
    plane(hills('s15far', 2600, 420, mix(mix('#3A3060', '#8B7CA6', sunK), '#9C5A6A', planet * .5), 2.1, .6, .75, 2.5), 0, -200, 9000, { scale: 9, ay: 1, shadowAlpha: .2 });
    plane(hills('s15mid', 2600, 380, mix(mix('#4A3A60', '#B07F8A', sunK), '#B2593C', planet * .5), 5.3, .45, .7, 3), 400, -150, 5200, { scale: 5.2, ay: 1, shadowAlpha: .25 });
    // the hill
    plane(memo('s15hill', () => sprite(2400, 500, (g, w, h) => { g.fillStyle = '#7A6A5A'; g.beginPath(); g.moveTo(0, h); g.quadraticCurveTo(w * .3, h * .1, w * .5, h * .12); g.quadraticCurveTo(w * .75, h * .14, w, h); g.fill(); })), 0, -20, 500, { scale: 1.2, ay: 1, tint: `brightness(${lerp(.5, 1.05, sunK)}) hue-rotate(${-planet * 20}deg)` });
    // birth house far below at the foot of the hill (the first morning)
    const hk = pop(t, this.cFirst - .3, .8);
    if (hk > 0) plane(house('s0house', 300, 300, '#F2E4CC', '#B8524A', 1), 1200, 0, 3200, { scale: .9 * eback(hk, 2), sy: eback(hk, 2) });
    custom(0, 450, 480, (g, s) => { g.scale(s, s); person(g, { ...HERO, sit: true, t, wind: .8 }); }, { order: 3 });
    // big centered odometer moment: 1000 + year 3026
    const bk = smooth(inv(this.c1000 - .4, this.c1000 + .2, t)) * (1 - smooth(inv(this.cQuiet - .6, this.cQuiet, t)));
    if (bk > 0) overlay(g => { g.save(); g.globalAlpha = bk; g.translate(W / 2, H * .36); paperText(g, String(Math.round(ageAt(t))).padStart(4, '0'), 260, { color: '#FFF4E4', spacing: .02 }); g.translate(0, 170); const yk = pop(t, this.c3026 - .1, .5); g.globalAlpha = bk * yk; paperText(g, 'YEAR 3026', 70, { color: '#F2C14E', spacing: .2 }); g.restore(); }, 3);
    overlay(g => drawAge(g, t), 1);
  },
});

// ======================================================================= 16 GIFT OR CURSE
defScene(16, {
  carrierType: 'sheets', carrierOpts: { dur: 1.3, c1: '#F6E2C0', c2: '#EBC79E', c3: '#C98B6B' },
  build() {
    const c = cue; this.cGift = c('be a gift'); this.cCurse = c('or a curse'); this.cBoth = c('little bit of both'); this.cThing = c("here's the thing"); this.cEighty = c('or for eighty');
    this.cDay = c('one day at a time'); this.cToday = c('today is one of them');
  },
  free() { freeSprites('s16'); },
  camera(lt, t) {
    const cal = eio(inv(this.cThing, this.cDay, t));
    setCam({ x: lerp(0, 0, cal) + Math.sin(lt * .4) * 40, y: lerp(420, 330, cal) + Math.sin(lt * .5) * 12, z: lerp(-1250, -1000, cal) + lt * 5, roll: Math.sin(lt * .35) * .012, aperture: .5, focus: lerp(1550, 1100, cal) });
  },
  draw(lt, t) {
    sky([[0, '#E9A07A'], [.6, '#F6D2A6'], [1, '#F8E6C8']]);
    plane(hills('s16h', 2600, 340, '#C98B6B', 1.9, .4, .7, 3), 0, -80, 5000, { scale: 4.6, ay: 1, shadowAlpha: .25 });
    plane(strip('s16g', 5200, 600, '#E2C49A', 3, 10), 0, 20, 300, { scale: 1.3, ay: .05 });
    const cal = smooth(inv(this.cThing - .2, this.cThing + .6, t));
    // balance scale
    const tilt = track([[this.t0, 0], [this.cGift, -.28], [this.cCurse, .28], [this.cBoth, 0]], t, k => elastic(k) * .7 + smooth(k) * .3);
    if (cal < 1) custom(0, 0, 400, (g, s) => {
      g.scale(s, s); g.globalAlpha *= 1 - cal; g.translate(0, cal * 300);
      g.fillStyle = '#6B4A38'; g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 16; g.shadowOffsetX = 8; g.shadowOffsetY = 10;
      rr(g, -120, -30, 240, 30, 8); g.fill(); g.fillRect(-14, -560, 28, 540); g.beginPath(); g.arc(0, -570, 26, 0, TAU); g.fill();
      g.save(); g.translate(0, -560); g.rotate(tilt); g.fillRect(-420, -10, 840, 20);
      for (const side of [-1, 1]) {
        g.save(); g.translate(side * 400, 0); g.rotate(-tilt);
        g.strokeStyle = '#6B4A38'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(-110, 220); g.moveTo(0, 0); g.lineTo(110, 220); g.stroke();
        g.fillStyle = '#C9A15A'; g.beginPath(); g.ellipse(0, 225, 140, 26, 0, 0, Math.PI); g.fill();
        g.shadowColor = 'transparent';
        if (side < 0) { g.fillStyle = PAL.red; g.fillRect(-60, 110, 120, 110); g.fillStyle = PAL.mustard; g.fillRect(-12, 110, 24, 110); g.fillRect(-60, 150, 120, 20); g.beginPath(); g.ellipse(-26, 100, 28, 14, -.5, 0, TAU); g.ellipse(26, 100, 28, 14, .5, 0, TAU); g.fill(); }
        else { g.fillStyle = '#4A4A5A'; g.beginPath(); g.arc(-36, 170, 40, 0, TAU); g.arc(10, 150, 50, 0, TAU); g.arc(52, 176, 34, 0, TAU); g.rect(-70, 170, 140, 40); g.fill(); g.strokeStyle = '#F2C14E'; g.lineWidth = 7; g.beginPath(); g.moveTo(0, 205); g.lineTo(-14, 235); g.lineTo(8, 235); g.lineTo(-6, 265); g.stroke(); }
        g.restore();
      }
      g.restore();
    }, { order: 2 });
    const lab = (txt, c, x, col) => { const k = pop(t, c - .1, .5) * (1 - cal); if (k > 0) custom(x, 760, 380, (g, s) => { g.scale(s * eback(k, 2), s * eback(k, 2)); paperText(g, txt, 90, { color: col }); }, { order: 4, dof: false }); };
    lab('GIFT', this.cGift, -400, '#FFF4E4'); lab('CURSE', this.cCurse, 400, '#3A3A4A'); lab('BOTH', this.cBoth, 0, PAL.red);
    // calendar: 1000 years vs 80, then one page at a time
    if (cal > 0) custom(0, 80, 300, (g, s) => {
      g.scale(s * eback(cal, 1.6), s * eback(cal, 1.6));
      const flipK = clamp((t - this.cEighty + .4) / (this.cDay - this.cEighty + .2)), rate = lerp(30, 0, eout(flipK));
      const label = t > this.cToday - .2 ? 'TODAY' : String(1 + Math.floor((t - this.cThing) * rate * 7) % 365);
      g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 26; g.shadowOffsetX = 10; g.shadowOffsetY = 16;
      g.fillStyle = '#F8F4EC'; rr(g, -260, -600, 520, 560, 18); g.fill(); g.shadowColor = 'transparent';
      g.fillStyle = PAL.red; rr(g, -260, -600, 520, 130, [18, 18, 0, 0]); g.fill();
      g.fillStyle = '#5A3F2E'; for (const x of [-150, 150]) { rr(g, x - 10, -630, 20, 60, 8); g.fill(); }
      g.fillStyle = '#FFF4E4'; g.font = '800 54px Fraunces'; g.textAlign = 'center'; g.fillText(t > this.cDay ? 'ONE DAY' : 'DAY', 0, -515);
      const isToday = label === 'TODAY';
      g.fillStyle = isToday ? PAL.red : PAL.ink; g.font = `900 ${isToday ? 130 : 220}px Fraunces`; g.fillText(label, 0, isToday ? -250 : -220);
      // tearing page
      const tear = (t - this.cThing) * rate; const ph = tear % 1;
      if (rate > .5 && !isToday) { g.save(); g.translate(0, -470 + ph * 200); g.rotate(ph * .8); g.globalAlpha *= 1 - ph; g.fillStyle = '#F8F4EC'; g.fillRect(-250, 0, 500, 420); g.restore(); }
      const tk = pop(t, this.cToday - .2, .5); if (tk > 0) { g.globalAlpha *= tk; g.strokeStyle = PAL.red; g.lineWidth = 8; g.beginPath(); g.ellipse(0, -300, 220 * eout(tk), 110 * eout(tk), -.05, 0, TAU); g.stroke(); }
    }, { order: 3, dof: false });
    const ek = pop(t, this.cEighty - .1, .5) * (1 - smooth(inv(this.cDay - .3, this.cDay + .2, t)));
    if (ek > 0) { custom(-640, 520, 350, (g, s) => { g.scale(s * eback(ek), s * eback(ek)); paperText(g, '1000', 110, { color: '#FFF4E4' }); }, { order: 4, dof: false }); custom(640, 520, 350, (g, s) => { g.scale(s * eback(ek), s * eback(ek)); paperText(g, '80', 110, { color: '#FFF4E4' }); }, { order: 4, dof: false }); custom(0, 560, 350, (g, s) => { g.scale(s * ek, s * ek); paperText(g, '=', 90, { color: PAL.red }); }, { order: 4, dof: false }); }
  },
});

// ======================================================================= 17 FINALE
defScene(17, {
  carrierType: 'leaves', carrierOpts: { dur: 1.3, c1: '#F2C14E', c2: '#E58F84', c3: '#D9733B' },
  build() {
    const c = cue; this.cCall = c('call someone'); this.cLearn = c('Learn something new'); this.cWatch = c('Watch the sunrise'); this.cLong = c('long life');
    this.cDo = c('what you do with them'); this.cThanks = c('Thanks for watching'); this.cNext = c('see you in the next');
  },
  free() { freeRoadside('s17'); },
  heroX(lt) { return lt * 70; },
  camera(lt, t) {
    const end = eio(inv(this.cThanks - .6, this.cThanks + 1.2, t)), rise = eio(inv(this.cWatch - .5, this.cDo, t));
    const hx = this.heroX(lt);
    setCam({ x: hx + 220 + Math.sin(lt * .4) * 30, y: lerp(lerp(230, 360, rise), 900, end) + Math.sin(lt * .5) * 10, z: lerp(lerp(-950, -1250, rise), -1900, end), roll: Math.sin(lt * .35) * .01 + end * -.02, aperture: lerp(.4, .2, end), focus: lerp(950, 1900, end) });
  },
  draw(lt, t) {
    const sunUp = smooth(inv(this.cWatch - .4, this.cDo + 1, t));
    roadside('s17', 'warm', { sunX: 700, sunY: lerp(300, 2000, sunUp), fence: false });
    const hx = this.heroX(lt);
    // milestones along the road
    for (let i = 0; i < 6; i++) { const x = 600 + i * 900; plane(milestone('s17ms' + i, String(100 + i * 100)), x, 0, 60, { scale: 1, ay: 1 }); }
    const turn = smooth(inv(this.cDo, this.cDo + .5, t));
    custom(hx, 0, 0, (g, s) => { g.scale(s, s); if (turn > 0) g.scale(1 - turn * 2 < 0 ? -(turn * 2 - 1) : 1 - turn * 2 + .001, 1); person(g, { ...HERO, walk: hx / 70 * 5, walkAmp: 1 - turn, t, armWave: turn > .5 }); }, { order: 3 });
    // phone + book badges
    iconBadge(hx - 70, 320, 0, pop(t, this.cCall - .05, .5) * (1 - smooth(inv(this.cWatch - .3, this.cWatch, t))), g => { g.fillStyle = PAL.ink; rr(g, -16, -28, 32, 56, 7); g.fill(); g.fillStyle = '#9CC9DE'; g.fillRect(-12, -22, 24, 40); g.save(); g.translate(18, -22); heart(g, 14); g.restore(); });
    iconBadge(hx + 70, 320, 0, pop(t, this.cLearn - .05, .5) * (1 - smooth(inv(this.cWatch - .3, this.cWatch, t))), g => { g.fillStyle = PAL.teal; g.beginPath(); g.moveTo(-30, -18); g.quadraticCurveTo(-15, -26, 0, -16); g.lineTo(0, 22); g.quadraticCurveTo(-15, 12, -30, 20); g.fill(); g.fillStyle = PAL.red; g.beginPath(); g.moveTo(30, -18); g.quadraticCurveTo(15, -26, 0, -16); g.lineTo(0, 22); g.quadraticCurveTo(15, 12, 30, 20); g.fill(); });
    // closing line
    const lk = pop(t, this.cDo - .1, .6) * (1 - smooth(inv(this.cThanks - .6, this.cThanks - .1, t)));
    if (lk > 0) overlay(g => { g.save(); g.globalAlpha = lk; g.translate(W / 2, H * .25); paperText(g, "IT'S WHAT YOU DO", 96, { anim: riseAnim(t, this.cDo - .1, .5, .03), color: '#FFF4E4', spacing: .04 }); g.translate(0, 110); paperText(g, 'WITH THEM', 96, { anim: riseAnim(t, this.cDo + .3, .5, .04), color: '#FFF4E4', spacing: .1 }); g.restore(); }, 3);
    // end card: All In Frame
    const ek = smooth(inv(this.cThanks - .3, this.cThanks + .5, t));
    if (ek > 0) overlay(g => {
      g.save(); g.globalAlpha = ek;
      g.fillStyle = 'rgba(30,18,12,.35)'; g.fillRect(0, 0, W, H);
      g.translate(W / 2, H * .44); const fk = eback(ek, 1.6);
      g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 30; g.shadowOffsetY = 14;
      g.strokeStyle = '#F6EEDF'; g.lineWidth = 22; const fw = 1080 * fk, fh = 300 * fk; rr(g, -fw / 2, -fh / 2, fw, fh, 10); g.stroke();
      g.shadowColor = 'transparent'; g.strokeStyle = PAL.red; g.lineWidth = 8; rr(g, -fw / 2 + 26, -fh / 2 + 26, fw - 52, fh - 52, 6); g.stroke();
      paperText(g, 'ALL IN FRAME', 100, { anim: riseAnim(t, this.cThanks, .5, .04), color: '#FFF4E4', spacing: .08 });
      g.translate(0, 250); paperText(g, 'see you in the next “what if?”', 54, { anim: riseAnim(t, this.cNext - .1, .5, .02), color: '#F2C14E', weight: 600, family: 'Fraunces', spacing: .02 });
      g.restore();
    }, 4);
  },
});
