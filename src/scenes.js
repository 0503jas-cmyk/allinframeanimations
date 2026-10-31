// scenes.js — the 12 scenes. Each: {id,start,dur,tint,fx,blurN,draw(c,t,lt)}
const SCENES = [];
const addScene = o => SCENES.push(o);
const NIGHT = { hy: 520, skyTop: [2, 6, 12], skyBot: [14, 34, 46], stars: .85, consts: 0, mirror: 0, aurora: 0, waveAmp: .5, glass: .8, seaFar: [10, 28, 36], seaNear: [3, 9, 14], horizonGlow: .35, glowCol: [60, 110, 120], waveDir: 1 };

addScene({ id: 1, start: 0, dur: 55, tint: [255, 200, 140], fx: { bloom: .6 },
  draw(c, t, lt) {
    const cam = { x: spline(lt, [[0, -80], [55, 140]]), y: spline(lt, [[0, 240], [20, 120], [55, -50]]), zoom: spline(lt, [[0, 1.3], [55, 1.02]]), roll: 1.4 * Math.sin(lt * .11) };
    const st = { ...NIGHT };
    drawSky(c, st, t, cam);
    layer(c, cam, .06, () => { glow(c, 1500, 280, 330, [170, 205, 225], .5); glow(c, 1500, 280, 46, [235, 245, 255], .9); });
    drawClouds(c, t, cam, 300, .5, [50, 80, 100], .07, 3); drawFog(c, t, cam, st.hy - 20, .9, [90, 140, 155], .25, 1, 160);
    drawSea(c, st, t, cam, 0, 1);
    layer(c, cam, .3, () => reflectStreak(c, 1500, st.hy + 10, 330, [170, 205, 225], .42, t, 3, 80));
    const shipX = 1010, wl = 700, o = { flicker: false, lights: .95 };
    layer(c, cam, .6, () => {
      layer(c, { x: 0, y: 0, zoom: 1 }, 0, () => { });
      
      shipReflection(c, shipX, wl + 4, 1.1, t, o, .33, 1);
      for (let i = 0; i < 6; i++) reflectStreak(c, shipX - 290 + i * 36, wl + 6, 190, [255, 180, 100], .28, t, i, 14);
      drawShip(c, shipX, wl + Math.sin(lt * .5) * 1.5, 1.1, Math.sin(lt * .31) * .35, t, o);
    });
    drawSeaFront(c, st, t, cam, .6, wl + 2, mixc(st.seaFar, st.seaNear, .45), 3);
    drawFog(c, t, cam, 760, .8, [100, 150, 165], .9, 2, 200);
    dofLayer(c, 'fgfog', 6, g => drawFog(g, t, cam, 900, 1.3, [120, 165, 180], 1.5, 5, 260), .85);
    drawTitle(c, 'THE DROWNED MERIDIAN', lt, 36, 52, { size: 112, y: 270 });
  } });

// ================= shared scene helpers
const SX = mkCanvas(W, H);
function xfade(c, t, tc, dur, fnA, fnB) {
  if (t < tc - dur / 2) return fnA(c); if (t > tc + dur / 2) return fnB(c);
  fnA(c); const g = SX.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H); fnB(g);
  c.save(); c.globalAlpha = sstep(tc - dur / 2, tc + dur / 2, t); c.drawImage(SX, 0, 0); c.restore();
}
function ACT(c, cam, who, x, y, h, t, st = {}, k = .9) { layer(c, cam, k, () => drawPerson(c, who, x, y, h, { t, talk: speak(who, t), ...st })); }
const ZONE = { hy: 560, skyTop: [10, 6, 30], skyBot: [58, 36, 84], stars: .95, consts: 1, mirror: 1, aurora: .9, auroraCols: [[70, 255, 200], [190, 90, 255], [255, 110, 190], [90, 170, 255]], waveAmp: .35, glass: .95, seaFar: [34, 24, 66], seaNear: [6, 6, 22], horizonGlow: .4, glowCol: [150, 90, 200], waveDir: 1 };
const NIGHT2 = { ...NIGHT, hy: 580, stars: .95, consts: 0, auroraCols: [[70, 255, 200], [190, 90, 255]] };
function rimFor(t) { return t > 160 ? [200, 150, 255] : (t > 80 ? [190, 170, 240] : [255, 190, 120]); }

// ================= 2. DEAD CALM
addScene({ id: 2, start: 55, dur: 55, tint: [120, 180, 255], fx: { bloom: .5 },
  draw(c, t, lt) {
    const cam = { x: spline(lt, [[0, -170], [9, -120], [16, 260], [30, 560], [55, 680]]), y: spline(lt, [[0, 30], [14, 20], [20, -40], [34, -250], [55, -330]]), zoom: spline(lt, [[0, 1.08], [55, 1.0]]), roll: .9 * Math.sin(lt * .21) };
    const st = { ...NIGHT2, skyK: .08 + .3 * sstep(12, 34, lt), consts: sstep(14, 26, lt), mirror: sstep(22, 38, lt), aurora: .85 * sstep(22, 40, lt), horizonGlow: .3 + .2 * sstep(20, 40, lt), glowCol: mixc([60, 110, 120], [150, 90, 200], sstep(22, 40, lt)), skyBot: mixc([14, 34, 46], [44, 30, 70], sstep(22, 40, lt)), seaFar: mixc([10, 28, 36], [30, 22, 56], sstep(24, 42, lt)) };
    exterior(c, t, cam, st, { clouds: { y: 280, a: .45, col: [50, 70, 100], seed: 2 }, fogFar: .8, mirror: .8 });
    layer(c, cam, .5, () => { drawShip(c, 2300, 770, .7, 0, t, { lights: .9 }); });
    deckBack(c, t, cam, { lamps: [[620, 520, .7], [1540, 500, .6]] });
    const rim = rimFor(lt + 55), sp = speakerNow(t);
    const dm = w => (sp && sp !== w && sp !== 'N') ? .3 : 0;
    ACT(c, cam, 'JONAS', 420, 990, 780, t, { f: 1, look: .5, rim, dim: dm('JONAS'), aR: [spline(lt, [[0, 20], [4, 60], [8, 30], [10, 20]]), 70], emo: 'worry', lightDir: -1 });
    ACT(c, cam, 'MARA', 840, 990, 770, t, { f: -1, look: .5, rim, dim: dm('MARA'), aL: [10, 14], aR: [-30, 120], emo: 'grim', lightDir: -1 });
    ACT(c, cam, 'ELI', 1330, 990, 790, t, { f: -1, look: .3, rim, dim: dm('ELI'), aR: [kf(lt, [[14, 8], [16, 140]]), kf(lt, [[14, 10], [16, 0]])], tilt: kf(lt, [[14, 0], [16, -9]]), emo: lt > 14 ? 'fear' : '', lightDir: -1 });
    ACT(c, cam, 'NOOR', 1590, 990, 750, t, { f: -1, look: .6, rim, dim: dm('NOOR'), tilt: kf(lt, [[18, 0], [22, -11]]), aR: [20, 50], emo: lt > 20 ? 'fear' : 'worry', lightDir: -1 });
    ACT(c, cam, 'WREN', 1870, 990, 700, t, { f: -1, look: .5, rim, dim: dm('WREN'), tilt: kf(lt, [[20, 0], [26, -10]]), emo: 'fear', lightDir: -1 });
    deckFront(c, t, cam);
    drawFog(c, t, cam, 900, .5, [100, 140, 170], 1.3, 6, 200);
  } });

// ================= 3. THE WALL
const WATCH = (c, t, lt) => { // extreme close-up of a watch face
  c.fillStyle = '#020609'; c.fillRect(0, 0, W, H); const cx = 960, cy = 520, R = 380, push = 1 + lt * .012;
  c.save(); c.translate(cx, cy); c.scale(push, push); c.rotate(-.12);
  glow(c, 0, 0, 800, [100, 180, 255], .2); c.fillStyle = '#0a1116'; c.beginPath(); c.arc(0, 0, R + 56, 0, TAU); c.fill(); c.strokeStyle = '#3f5a68'; c.lineWidth = 8; c.stroke();
  const fg = c.createRadialGradient(-80, -100, 40, 0, 0, R); fg.addColorStop(0, '#d8e4e8'); fg.addColorStop(1, '#86a0aa'); c.fillStyle = fg; c.beginPath(); c.arc(0, 0, R, 0, TAU); c.fill();
  for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, l = i % 5 ? 14 : 38; c.strokeStyle = '#1a2a32'; c.lineWidth = i % 5 ? 3 : 8; c.beginPath(); c.moveTo(Math.sin(a) * (R - 18), -Math.cos(a) * (R - 18)); c.lineTo(Math.sin(a) * (R - 18 - l), -Math.cos(a) * (R - 18 - l)); c.stroke(); }
  const stopT = EV.watch_stop, tt = Math.min(t, stopT), sec = (tt * 1) % 60; const stutter = t > stopT - 1.2 && t < stopT ? Math.sin(t * 40) * .02 : 0;
  const hand = (ang, len, w, col) => { c.save(); c.rotate(ang); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, len * .16); c.lineTo(0, -len); c.stroke(); c.restore(); };
  hand(-.7, R * .55, 18, '#101a20'); hand(1.5, R * .8, 12, '#101a20'); hand(Math.floor(sec) / 60 * TAU + stutter, R * .88, 5, '#b3261e');
  c.fillStyle = '#101a20'; c.beginPath(); c.arc(0, 0, 18, 0, TAU); c.fill();
  c.fillStyle = 'rgba(190,230,255,.12)'; c.beginPath(); c.arc(0, 0, R, Math.PI * 1.1, Math.PI * 1.75); c.lineTo(0, 0); c.fill();
  if (t > stopT) { const k = sstep(stopT, stopT + .25, t); c.strokeStyle = `rgba(240,250,255,${.85 * k})`; c.lineWidth = 3; c.beginPath(); c.moveTo(80, -60); c.lineTo(180 * k + 80, 100 * k); c.moveTo(80, -60); c.lineTo(-30 * k + 80, 120 * k); c.moveTo(120, 20); c.lineTo(250 * k, -90 * k + 20); c.moveTo(150, 40); c.lineTo(190 * k, 190 * k); c.stroke(); }
  c.restore(); dofLayer(c, 'wvig', 10, g => { const vg = g.createRadialGradient(960, 540, 300, 960, 540, 1000); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.95)'); g.fillStyle = vg; g.fillRect(0, 0, W, H); }, .9);
  if (t > stopT) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 960, 520, 900, [120, 200, 255], .22 * (1 - sstep(stopT + .2, stopT + 3, t) * .6)); c.restore(); }
};
addScene({ id: 3, start: 110, dur: 60, tint: [220, 245, 255], fx: { bloom: .6 },
  blurN: t => (t > 152.5 && t < 156.5) ? 4 : 1,
  draw(c, t, lt) {
    const wall = sstep(2, 38, lt) * .85 + sstep(41, 45, lt) * .15, rev = t > EV.wall_flow_reverse ? -1 : 1;
    const st = { ...NIGHT2, hy: 560, waveDir: rev, waveAmp: .5 + .5 * sstep(8, 30, lt), glass: 0, consts: 0, aurora: .25, skyTop: [4, 10, 22], skyBot: mixc([14, 34, 46], [90, 120, 160], sstep(5, 40, lt)), horizonGlow: .3 + .5 * sstep(3, 40, lt), glowCol: [150, 200, 240] };
    const deck = cc => {
      const cam = { x: spline(lt, [[0, -80], [21, 380]]), y: spline(lt, [[0, 40], [21, 0]]), zoom: spline(lt, [[0, 1.12], [21, 1.0]]), roll: 1.2 * Math.sin(lt * .6) };
      exterior(cc, t, cam, st, { wall, fogFar: .5, clouds: { y: 300, a: .35, col: [90, 120, 160], seed: 4 } }); deckBack(cc, t, cam, { lamps: [[620, 520, .5]] }); const sp = speakerNow(t);
      ACT(cc, cam, 'ELI', 760, 990, 790, t, { f: -1, look: .4, rim: [200, 230, 255], aR: [100, 100], aL: [40, 110], emo: 'fear', dim: sp === 'N' ? 0 : 0 });
      ACT(cc, cam, 'NOOR', 1130, 990, 750, t, { f: -1, look: .6, rim: [200, 230, 255], emo: 'worry', aR: [18, 60] });
      ACT(cc, cam, 'WREN', 1420, 990, 700, t, { f: -1, look: .6, rim: [200, 230, 255], emo: 'fear' }); deckFront(cc, t, cam);
    };
    const wide = cc => {
      const pull = sstep(0, 24, lt - 21), cam = { x: spline(lt, [[21, 0], [36, 160], [43, 520]]), y: spline(lt, [[21, 40], [43, -60]]), zoom: spline(lt, [[21, 1.0], [43, 1.25]]), roll: 1.5 * Math.sin(lt * .5) };
      const st2 = { ...st, hy: 540 }; exterior(cc, t, cam, st2, { wall: 1, fogFar: .3 });
      glow(cc, 960, 540, 1000, [200, 235, 255], .25);
      const sx = spline(lt, [[21, 560], [43, 1050]]); layer(cc, cam, .6, () => { shipReflection(cc, sx, 720, 1.0, t, { lights: .8 }, .3, 1); drawShip(cc, sx, 720 + Math.sin(lt * .8) * 5, 1.0, Math.sin(lt * .7) * 1.6 + 1.2, t, { lights: .85, flicker: true }); });
      drawSeaFront(cc, st2, t, cam, .6, 722, mixc(st.seaFar, st.seaNear, .5), 8);
      dofLayer(cc, 'spray', 4, g => { for (let i = 0; i < 40; i++) { const x = ((hash(i) * 2400 + t * (150 + 100 * hash(i + 4))) % 2400) - 200; g.fillStyle = `rgba(200,235,255,${.2 * hash(i + 9)})`; g.fillRect(x, 700 + hash(i * 3) * 300, 30 + 40 * hash(i), 2); } }, .8);
    };
    const cross = cc => {
      const k = sstep(0, 14, lt - 43), cam = { x: 200 + 700 * k, y: -60, zoom: 1.25 + .6 * k, roll: 1.5 * Math.sin(lt * .5) + 8 * pulse(lt, 42, 47, 1.2, 1.2) };
      const wcol = mixc([210, 240, 255], [140, 110, 220], sstep(47, 60, lt));
      cc.fillStyle = vgrad(cc, 0, H, [[0, rgbs(mixc([200, 230, 250], [20, 10, 50], sstep(46, 58, lt)))], [1, rgbs(mixc([140, 190, 230], [60, 40, 110], sstep(46, 58, lt)))]]); cc.fillRect(0, 0, W, H);
      layer(cc, cam, .2, () => { cc.save(); cc.globalCompositeOperation = 'lighter'; for (let i = 0; i < 70; i++) { const x = hash(i) * 3200 - 600, y = hash(i * 2) * 1400 - 200, r = 100 + 220 * hash(i * 4); glow(cc, x + Math.sin(t * .2 + i) * 40, y, r, wcol, .08 + .07 * hash(i * 6)); } cc.restore(); });
      drawFog(cc, t, cam, 540, 1.1, wcol, .6, 3, 500);
      if (lt > 47) { const zst = { ...ZONE, auroraCols: ZONE.auroraCols, aurora: sstep(48, 60, lt) * .8, stars: sstep(50, 60, lt) }; cc.save(); cc.globalAlpha = sstep(48, 60, lt); drawAurora(cc, zst, t, { ...cam, x: cam.x * .3, y: 0, zoom: 1 }); cc.restore(); }
      layer(cc, cam, .8, () => { drawShip(cc, 960, 700, 1.1, Math.sin(lt * .7) * 1.2, t, { lights: .9, flicker: true }); });
      dofLayer(cc, 'lightmotes', 5, g => { g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 90; i++) { const x = ((hash(i) * 2400 - t * (80 + 160 * hash(i + 2))) % 2400 + 2400) % 2400 - 200, y = hash(i * 5) * 1080; g.fillStyle = `rgba(230,245,255,${.4 * hash(i + 11)})`; g.beginPath(); g.arc(x, y, 1.5 + 4 * hash(i + 6), 0, TAU); g.fill(); } }, .9);
    };
    if (lt < 36) xfade(c, t, 131, .7, deck, wide); else if (lt < 36.5 + 1) wide(c);
    if (lt >= 36 && lt < 40.2) { /* watch insert */ }
    // cut sequence: deck (0-21) -> wide (21-36) -> watch (36-43.2) -> wide (43.2-45) -> cross
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (lt >= 36 && lt < 43.2) { xfade(c, t, 146, .4, wide, cc => WATCH(cc, t, lt - 36)); }
    else if (lt >= 43.2 && lt < 45) { wide(c); }
    else if (lt >= 45) { xfade(c, t, 155.0, 1.0, wide, cross); const f = EV.cross, w = Math.exp(-Math.pow((t - f - .2) / .6, 2)); if (w > .01) { c.fillStyle = `rgba(235,248,255,${.85 * w})`; c.fillRect(0, 0, W, H); } }
  } });

// ================= 4. THE ISLAND
const STONES = Array.from({ length: 16 }, (_, i) => ({ x: hash(i * 3) * 2600 - 300, y: 120 + hash(i * 7) * 420, s: 20 + hash(i * 11) * 70, d: .15 + hash(i * 5) * .7, ph: hash(i) * 9, sh: Array.from({ length: 8 }, (_, k) => .7 + .5 * hash(i * 13 + k)) }));
function drawStones(c, t, cam, st, alpha = 1) {
  for (const S of STONES) layer(c, cam, S.d * .6 + .1, () => {
    const x = S.x + Math.sin(t * .13 + S.ph) * 30, y = S.y + Math.sin(t * .4 + S.ph) * 14 + 100, s = S.s * (.6 + S.d * .8);
    c.save(); c.translate(x, y); c.globalAlpha = alpha * (.4 + S.d * .6); c.globalCompositeOperation = 'lighter'; glow(c, 0, s * .6, s * 3.4, [150, 110, 255], .22); c.globalCompositeOperation = 'source-over';
    c.beginPath(); S.sh.forEach((r, k) => { const a = k / 8 * TAU; const px = Math.cos(a) * s * r * 1.25, py = Math.sin(a) * s * r * .8; k ? c.lineTo(px, py) : c.moveTo(px, py); }); c.closePath(); c.fillStyle = '#0b0a16'; c.fill(); c.strokeStyle = 'rgba(190,150,255,.4)'; c.lineWidth = 2; c.stroke(); c.restore();
  });
}
function compassInset(c, t, a) {
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(300, 770); c.fillStyle = 'rgba(2,8,12,.82)'; c.beginPath(); c.arc(0, 0, 150, 0, TAU); c.fill(); c.strokeStyle = 'rgba(190,225,240,.7)'; c.lineWidth = 4; c.stroke();
  for (let i = 0; i < 36; i++) { const an = i / 36 * TAU; c.beginPath(); c.moveTo(Math.sin(an) * 132, -Math.cos(an) * 132); c.lineTo(Math.sin(an) * (i % 9 ? 142 : 120), -Math.cos(an) * (i % 9 ? 142 : 120)); c.stroke(); }
  const ang = t * 7.3 + Math.sin(t * 3) * 2; c.rotate(ang); c.fillStyle = '#d8453a'; c.beginPath(); c.moveTo(0, -112); c.lineTo(11, 0); c.lineTo(-11, 0); c.fill(); c.fillStyle = '#c9d6dc'; c.beginPath(); c.moveTo(0, 112); c.lineTo(11, 0); c.lineTo(-11, 0); c.fill(); c.restore();
}
function islandView(c, t, lt, cam, st, rise, s) {
  const base = st.hy + 6 + (1 - rise) * 420 * s;
  layer(c, cam, .12, () => { glow(c, 960, st.hy - 80, 900, [150, 100, 220], .2 * rise); });
  let lamp; layer(c, cam, .16, () => { lamp = drawIsland(c, 1180, base, s, t, { fires: rise, lamp: rise, fireR: 230 + 40 * Math.sin(t * .3), fireLift: 0 }); });
  return lamp;
}
addScene({ id: 4, start: 170, dur: 60, tint: [200, 160, 255], fx: { bloom: .65 },
  draw(c, t, lt) {
    const st = { ...ZONE, skyK: .12 };
    const deck = cc => {
      const cam = { x: spline(lt, [[0, 120], [25, 330]]), y: spline(lt, [[0, -40], [25, -10]]), zoom: 1.04 - lt * .0006, roll: 1 * Math.sin(lt * .3) };
      exterior(cc, t, cam, st, { mirror: .85, fogFar: .6 }); drawStones(cc, t, cam, st); deckBack(cc, t, cam, { lamps: [[620, 520, .5], [1500, 500, .4]] });
      const sp = speakerNow(t), rim = [200, 160, 255], dm = w => (sp && sp !== w && sp !== 'N') ? .3 : 0;
      ACT(cc, cam, 'NOOR', 560, 990, 760, t, { f: 1, look: .5, rim, dim: dm('NOOR'), aR: [60, 90], aL: [14, 50], emo: 'worry', lightDir: -1 });
      ACT(cc, cam, 'WREN', 1180, 990, 700, t, { f: -1, look: .4, rim, dim: dm('WREN'), aR: [kf(lt, [[13, 8], [14, 130]]), 0], emo: lt > 13 ? 'fear' : 'worry', lightDir: -1 });
      ACT(cc, cam, 'MARA', 1500, 990, 770, t, { f: -1, look: .6, rim, dim: dm('MARA'), emo: 'grim', lightDir: -1 });
      deckFront(cc, t, cam); compassInset(cc, t, pulse(lt, 2, 12, .6, .8));
    };
    const wide = cc => {
      const rise = eout((lt - 27) / 9), cam = { x: spline(lt, [[25, 0], [45, 260]]), y: spline(lt, [[25, 20], [45, -30]]), zoom: spline(lt, [[25, 1.0], [45, 1.28]]), roll: .8 * Math.sin(lt * .3) };
      exterior(cc, t, cam, st, { mirror: .85, fogFar: .2 }); layer(cc, cam, .12, () => glow(cc, 960, st.hy - 60, 1000, [150, 100, 230], .3 * rise));
      islandView(cc, t, lt, cam, st, rise, spline(lt, [[25, .5], [45, .8]]));
      drawFog(cc, t, cam, st.hy + 10, 1.3 * (1 - rise * .6), [150, 120, 200], .3, 2, 160); drawStones(cc, t, cam, st, .9);
      layer(cc, cam, .65, () => { shipReflection(cc, 520, 880, 1.15, t, { lights: .7 }, .3, .6); drawShip(cc, 520, 880 + Math.sin(lt * .5) * 2, 1.15, Math.sin(lt * .3) * .5, t, { lights: .7 }); });
      drawSeaFront(cc, st, t, cam, .65, 882, mixc(st.seaFar, st.seaNear, .6), 3);
    };
    const binoc = cc => {
      cc.fillStyle = '#000'; cc.fillRect(0, 0, W, H);
      cc.save(); cc.beginPath(); cc.arc(660, 540, 400, 0, TAU); cc.arc(1260, 540, 400, 0, TAU); cc.clip();
      const k = lt - 45, cam = { x: 160 + k * 3, y: 20, zoom: 1.12 + k * .012, roll: 0 };
      cc.save(); cc.translate(960, 540); cc.scale(1.22, 1.22); cc.translate(-960, -540);
      exterior(cc, t, cam, st, { mirror: .85, fogFar: .1 }); const lamp = islandView(cc, t, lt, cam, st, 1, .9);
      // detached fires drifting toward the ship
      cc.save(); cc.globalCompositeOperation = 'lighter'; const tf = t - EV.fires_move;
      for (let i = 0; i < 12; i++) { const u = clamp((tf - i * .7) / 8); if (u <= 0) continue; const ex = lerp(980 + Math.cos(i * 1.7) * 200, 960 + (hash(i * 3) - .5) * 700, u * u), ey = lerp(st.hy - 120 + hash(i) * 60, 560 + hash(i * 5) * 160, u * u), r = 20 + 120 * u * u; glow(cc, ex, ey, r * 2.4, [160, 225, 255], .5 * (1 - u * .4)); glow(cc, ex, ey, r * .5, [255, 255, 255], .9); } cc.restore();
      cc.restore(); cc.restore();
      cc.save(); cc.globalCompositeOperation = 'multiply'; const bg = cc.createRadialGradient(660, 540, 300, 660, 540, 420); bg.addColorStop(0, 'rgba(255,255,255,1)'); bg.addColorStop(1, 'rgba(0,0,0,1)'); cc.restore();
      cc.strokeStyle = 'rgba(180,220,240,.5)'; cc.lineWidth = 2; for (const cx of [660, 1260]) { cc.beginPath(); cc.moveTo(cx - 40, 540); cc.lineTo(cx + 40, 540); cc.moveTo(cx, 500); cc.lineTo(cx, 580); cc.stroke(); cc.beginPath(); cc.arc(cx, 540, 400, 0, TAU); cc.lineWidth = 6; cc.strokeStyle = '#05090c'; cc.stroke(); }
      const e = pulse(lt, 45, 58, 1, 2); cc.fillStyle = `rgba(0,0,0,${1 - e})`; if (e < 1) cc.fillRect(0, 0, W, H);
    };
    if (lt < 25) deck(c); else if (lt < 45) xfade(c, t, 195, .8, deck, wide); else xfade(c, t, 215, .7, wide, binoc);
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (lt > 25 && lt <= 25.4) { /* settle */ }
    if (lt >= 25 && lt < 45) { c.save(); c.globalAlpha = sstep(25, 25.2, lt); c.restore(); }
  } });

// ================= 5. BELOW DECK
function wallFace(c, x, y, s, a, t, mouth = .3, tilt = 0) {
  if (a <= .01) return; c.save(); c.translate(x, y); c.rotate(tilt); c.scale(s, s * 1.15); c.globalCompositeOperation = 'lighter';
  glow(c, 0, 0, 260, [150, 200, 255], .28 * a);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = a; const g = c.createRadialGradient(0, 0, 10, 0, 0, 120); g.addColorStop(0, 'rgba(200,230,250,.55)'); g.addColorStop(1, 'rgba(120,170,220,.05)'); c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, 100, 130, 0, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(210,240,255,.85)'; c.lineWidth = 3; c.stroke();
  c.fillStyle = 'rgba(4,10,18,.92)'; c.beginPath(); c.ellipse(-36, -22, 18, 28, 0, 0, TAU); c.ellipse(36, -22, 18, 28, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(0, 54, 18, 14 + mouth * 40, 0, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(210,240,255,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -8); c.quadraticCurveTo(10, 14, 0, 26); c.stroke(); c.restore();
}
addScene({ id: 5, start: 230, dur: 60, tint: [255, 190, 120], fx: { bloom: .55, vig: .72 },
  draw(c, t, lt) {
    const walkEnd = 18, jx = 700 + 160 * Math.min(lt, walkEnd) * (lt < walkEnd ? 1 : 1) + (lt > walkEnd ? 0 : 0);
    const jX = 700 + 160 * Math.min(lt, walkEnd), wX = jX - 230 + (lt > 36 ? -20 * sstep(36, 40, lt) : 0), walk = 1 - sstep(walkEnd - 1.5, walkEnd, lt), dist = 160 * Math.min(lt, walkEnd);
    const push = sstep(34, 48, lt), cam = { x: (jX - 1250) / .9 + 40 * Math.sin(lt * .2) - 180 * push, y: -20 * push + Math.sin(lt * .9) * 2, zoom: 1.0 + .22 * push + .02 * Math.sin(lt * .3), roll: .8 * Math.sin(lt * .17) };
    const die = i => 12 + i * 4.3 + hash(i * 5) * 2;
    corridorSet(c, t, cam, { flick: true, lamp: (i, x) => { const d = die(i) + 14, k = t - 230; return k < d - 1.2 ? 1 : (k < d ? .5 + .5 * Math.sin(k * 40) : (i === 3 ? .12 + .08 * Math.sin(k * 3) : 0)); } });
    // ghost faces in panels (world coords on the back wall layer .7)
    const f1 = pulse(lt, 11, 20, 1.5, 4) * .5, f2 = pulse(lt, 32, 40, 1.5, 3) * .6;
    layer(c, cam, .7, () => { wallFace(c, 2000, 480, .9, f1, t, .3 + .3 * Math.sin(t * 6)); wallFace(c, 3300, 460, 1, f2, t, .4); });
    const fe = pulse(lt, 48.4, 52.2, .8, 1.4), fx = lerp(2480, 3300, sstep(50.2, 52.4, lt));
    layer(c, cam, .7, () => { wallFace(c, fx, 470, lerp(.6, 1.7, sstep(48.4, 49.6, lt)) * (1 - .35 * sstep(50.2, 52.4, lt)), fe, t, .55); if (lt > 50.2 && lt < 56) for (let k = 0; k < 3; k++) { const r = ((lt - 50.2) * 170 + k * 70) % 300; c.strokeStyle = `rgba(190,225,255,${.4 * (1 - r / 300) * sstep(50.2, 50.8, lt)})`; c.lineWidth = 3; c.beginPath(); c.ellipse(3300, 470, r * .7, r * 1.1, 0, 0, TAU); c.stroke(); } });
    // wisps
    for (const [a, b, y, ph] of [[10, 17, 150, 0], [31, 37, 190, 2], [46, 54, 220, 4]]) { const w = pulse(lt, a, b, 1.2, 2.5); if (w > .01) dofLayer(c, 'wisp', 3, g => { g.globalCompositeOperation = 'lighter'; for (let k = 0; k < 3; k++) { g.strokeStyle = `rgba(190,225,255,${.22 * w})`; g.lineWidth = 10 - k * 2; g.beginPath(); for (let x = 0; x <= W; x += 30) { const yy = y + k * 24 + Math.sin(x * .008 + t * 1.2 + ph + k) * 40; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); } }, 1, 'lighter'); }
    const rim = [255, 190, 120], sp = speakerNow(t), dm = w => (sp && sp !== w && sp !== 'N' && sp !== 'GHOST') ? .25 : 0;
    ACT(c, cam, 'JONAS', jX, 990, 790, t, { f: 1, look: .4, rim, walk, ph: dist * Math.PI / 200, dim: dm('JONAS'), lightDir: -1, emo: lt > 20 ? 'worry' : '', aL: walk > .1 ? undefined : [8, 20], aR: walk > .1 ? undefined : [kf(lt, [[24.5, 8], [26, 50], [28, 8]]), 40] });
    ACT(c, cam, 'WREN', wX, 990, 690, t, { f: lt > 38 ? -1 : 1, look: lt > 18 ? kf(lt, [[18, .5], [20, -.6]]) : .4, rim, walk, ph: dist * Math.PI / 200 + 1.3, dim: dm('WREN'), lightDir: -1, emo: lt > 16 ? 'fear' : 'worry', tilt: lt > 40 ? 6 : 0 });
    corridorFront(c, t, cam, .9);
    const l = Math.sin(lt * 1.3) * .5 + .5; dofLayer(c, 'cdust', 4, g => { g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 50; i++) { const x = ((hash(i) * 2200 + t * 20) % 2200) - 100, y = hash(i * 3) * 1000; g.fillStyle = `rgba(255,220,170,${.14 * hash(i + 3)})`; g.beginPath(); g.arc(x, y, 2 + 3 * hash(i), 0, TAU); g.fill(); } }, 1, 'lighter');
  } });

// ================= 6. THE DROWNED
addScene({ id: 6, start: 290, dur: 60, tint: [170, 220, 255], fx: { bloom: .6, vig: .7 },
  draw(c, t, lt) {
    const frost = sstep(3, 38, lt), cold = sstep(2, 20, lt), ghostIn = sstep(12.5, 18, lt);
    const cam = { x: spline(lt, [[0, -40], [30, 40], [60, 90]]), y: spline(lt, [[0, 20], [60, -20]]), zoom: spline(lt, [[0, 1.0], [44, 1.08], [60, 1.2]]), roll: .7 * Math.sin(lt * .2) };
    messSet(c, t, cam, { frost, lantern: 1 - .55 * cold + .15 * Math.sin(t * 20) * cold, sky: [40, 70, 110], sky2: [8, 18, 36] });
    // ghost streams around the room
    const gs = sstep(12.5, 17, lt) * (1 - sstep(53, 58, lt));
    if (gs > .01) {
      dofLayer(c, 'gstream', 2, g => { g.save(); for (let k = 0; k < 9; k++) {
        const a = t * (.45 + .06 * (k % 3)) + k * .7, rx = 880 + 90 * Math.sin(k), ry = 300 + 40 * Math.cos(k * 2), cx = 960, cy = 520, gx = cx + Math.cos(a) * rx, gy = cy + Math.sin(a) * ry * (k % 2 ? 1 : .8) - 30 * k % 3 * 10, front = (Math.sin(a) + 1) / 2;
        for (let tr = 14; tr >= 1; tr--) { const aa = a - tr * .045, tx = cx + Math.cos(aa) * rx, ty = cy + Math.sin(aa) * ry * (k % 2 ? 1 : .8) - 30 * k % 3 * 10; g.globalCompositeOperation = 'lighter'; glow(g, tx, ty, 44 - tr * 2, [150, 200, 255], .22 * gs * (1 - tr / 15)); }
        drawGhost(g, gx, gy, .38 + .22 * front, t, { a: gs * (.35 + .55 * front), seed: k, len: 220, drift: Math.cos(a) * -1, col: [160, 210, 255], mouth: .3 + .3 * Math.sin(t * 5 + k) }); } g.restore(); }, 1);
    }
    // the big speaking ghost
    const gsp = speak('GHOST', t), gv = pulse(lt, 13, 23.8, 1.0, 1.4) + pulse(lt, 33.4, 53.2, 1.0, 1.6);
    if (gv > .01) { c.save(); c.globalAlpha = Math.min(1, gv); drawGhost(c, 960, 290 + Math.sin(t * .8) * 8, 1.6, t, { a: .92, mouth: gsp, len: 260, col: [175, 220, 255] }); c.restore(); }
    // crew
    const rim = [160, 210, 255], sp = speakerNow(t), dm = w => (sp && sp !== w && sp !== 'N' && sp !== 'GHOST') ? .25 : 0, shiver = Math.sin(t * 31) * 2 * cold;
    const close = pulse(lt, 52.2, 60, .4, 3);
    ACT(c, cam, 'JONAS', 330, 1040, 800, t, { f: 1, look: .4, rim, dim: dm('JONAS'), lightDir: -1, emo: 'fear', bob: shiver }, .85);
    ACT(c, cam, 'MARA', 640, 1040, 800, t, { f: 1, look: .5, rim, dim: dm('MARA'), lightDir: -1, emo: 'grim', aR: [-20, 80], bob: shiver }, .85);
    ACT(c, cam, 'ELI', 1290, 1040, 830, t, { f: -1, look: .4, rim, dim: dm('ELI'), lightDir: 1, emo: 'fear', bob: shiver }, .85);
    ACT(c, cam, 'NOOR', 1560, 1040, 780, t, { f: -1, look: .5, rim, dim: dm('NOOR'), lightDir: 1, emo: 'worry', aR: [40, 70], bob: shiver }, .85);
    if (close < .5) ACT(c, cam, 'WREN', 1000, 1060, 700, t, { f: 1, look: .3, rim, dim: dm('WREN'), lightDir: -1, emo: lt > 46 ? 'fear' : 'worry', bob: shiver }, .95);
    // frost vignette
    c.save(); c.globalCompositeOperation = 'screen'; const fv = c.createRadialGradient(960, 540, 420, 960, 540, 1150); fv.addColorStop(0, 'rgba(160,210,255,0)'); fv.addColorStop(1, `rgba(160,210,255,${.35 * frost})`); c.fillStyle = fv; c.fillRect(0, 0, W, H); c.restore();
    dofLayer(c, 'breath', 8, g => { g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 24; i++) { const x = (hash(i) * 2000 + Math.sin(t * .4 + i) * 60), y = 540 + hash(i * 3) * 400 - ((t * 18 + i * 40) % 300); g.fillStyle = `rgba(190,225,255,${.05 * cold})`; g.beginPath(); g.arc(x, y, 60 + 80 * hash(i + 9), 0, TAU); g.fill(); } }, 1, 'lighter');
    if (close > .01) { const k = close; c.fillStyle = `rgba(0,4,9,${.88 * k})`; c.fillRect(0, 0, W, H); c.save(); c.globalAlpha = k;
      glow(c, 700, 500, 900, [160, 210, 255], .2); bust(c, 'WREN', t, { side: 1, h: 1650, dx: 160, dy: 520, emo: 'fear', rim: [170, 215, 255] });
      c.globalAlpha = k * .4; drawGhost(c, 1450, 520, 2.2, t, { a: .6, mouth: .1, len: 400, col: [175, 220, 255] }); c.restore(); }
  } });

// ================= 7. LEVIATHAN
function hullBottom(c, t, cam, cx, sy) {
  layer(c, cam, .35, () => { c.save(); c.translate(cx, sy + Math.sin(t * .5) * 6); c.rotate(Math.sin(t * .3) * .01);
    c.beginPath(); c.moveTo(-760, -40); c.lineTo(-690, 60); c.quadraticCurveTo(-300, 130, 0, 138); c.quadraticCurveTo(360, 130, 700, 70); c.lineTo(790, -40); c.closePath(); c.fillStyle = vgrad(c, -40, 140, [[0, '#0a1a24'], [1, '#02070b']]); c.fill();
    c.strokeStyle = 'rgba(140,220,245,.25)'; c.lineWidth = 3; c.stroke(); c.fillStyle = 'rgba(58,18,14,.8)'; c.fillRect(-720, -40, 1500, 24);
    c.fillStyle = '#04090d'; c.beginPath(); c.moveTo(-60, 120); c.lineTo(-40, 240); c.lineTo(40, 240); c.lineTo(60, 120); c.fill(); // keel fin
    c.restore(); });
}
addScene({ id: 7, start: 350, dur: 60, tint: [100, 220, 255], fx: { bloom: .7, vig: .7 },
  blurN: t => 1,
  draw(c, t, lt) {
    const st = { ...ZONE, glass: .9, aurora: .3, seaFar: [14, 40, 56], seaNear: [4, 14, 24], horizonGlow: .2 };
    const deck = (cc, a, b) => {
      const cam = { x: spline(lt, [[0, 280], [6, 300], [22, 380], [33, 420]]), y: 30, zoom: 1.04 + .0008 * lt, roll: .8 * Math.sin(lt * .5) };
      exterior(cc, t, cam, st, { mirror: .6, fogFar: .3 }); cc.save(); cc.globalCompositeOperation = 'lighter'; const gk = sstep(0, 5, lt) * (.6 + .4 * Math.sin(t * .8)); cc.fillStyle = vgrad(cc, 600, 1080, [[0, 'rgba(60,200,255,0)'], [1, `rgba(60,200,255,${.35 * gk})`]]); cc.fillRect(0, 600, W, 480); cc.restore();
      deckBack(cc, t, cam, { lamps: [[620, 520, .35]] }); const rim = [90, 220, 255], sp = speakerNow(t), dm = w => (sp && sp !== w && sp !== 'N') ? .3 : 0;
      ACT(cc, cam, 'NOOR', 560, 990, 770, t, { f: 1, look: .6, rim, dim: dm('NOOR'), tilt: 8, aR: [30, 40], emo: 'fear', lightDir: -1 });
      ACT(cc, cam, 'MARA', 900, 990, 780, t, { f: 1, look: .5, rim, dim: dm('MARA'), tilt: 6, emo: 'fear', lightDir: -1 });
      ACT(cc, cam, 'WREN', 1330, 990, 700, t, { f: -1, look: .6, rim, dim: dm('WREN'), tilt: 8, emo: 'fear', lightDir: -1, aR: [10, 60] });
      ACT(cc, cam, 'ELI', 1650, 990, 800, t, { f: -1, look: .5, rim, dim: dm('ELI'), tilt: 7, emo: 'fear', lightDir: -1, aR: [-30, 90] });
      deckFront(cc, t, cam); cc.save(); cc.globalCompositeOperation = 'lighter'; cc.fillStyle = vgrad(cc, 880, 1080, [[0, 'rgba(60,200,255,0)'], [1, `rgba(60,200,255,${.18 * gk})`]]); cc.fillRect(0, 880, W, 200); cc.restore();
    };
    const under = (cc, mode) => {
      const rumble = mode === 'B' ? shake(t, 5, 385, 22, 7) : [0, 0];
      const cam = { x: rumble[0] + (mode === 'B' ? spline(lt, [[35, 0], [57, 140]]) : spline(lt, [[5.5, 0], [22, 120]])), y: rumble[1] + (mode === 'B' ? 0 : 0), zoom: mode === 'B' ? spline(lt, [[35, 1.0], [48, 1.15], [60, 1.05]]) : 1.0, roll: 1.2 * Math.sin(lt * .25) };
      underwater(cc, t, cam, { rays: mode === 'B' ? .6 : 1 }); hullBottom(cc, t, cam, 960, 70);
      if (mode === 'A') {
        const eye = sstep(363, 366, t), look = Math.sin(t * .6) * .3 * (1 - eye) - eye * .7;
        dofLayer(cc, 'levA', 2.2, g => { layer(g, cam, .5, () => drawLeviathan(g, t, { x: 700 + (t - EV.lev_eye) * 130, y: 500, s: 1.0, dir: 1, ph: 1, eye: .15 + .85 * eye, look, glowK: .9 })); }, 1);
      } else {
        const hx = -400 + (t - 385) * 215;
        layer(cc, cam, .8, () => drawLeviathan(cc, t, { x: hx, y: 650, s: 2.5, dir: 1, ph: 3, eye: pulse(t, 385, 400, 2, 3), look: .6, glowK: 1.1 }));
        dofLayer(cc, 'levFar', 5, g => { layer(g, cam, .2, () => drawLeviathan(g, t, { x: 2400 - (t - 385) * 70, y: 300, s: .8, dir: -1, ph: 7, eye: .3, glowK: .8, a: .7 })); }, .8);
      }
      marineSnow(cc, t, cam, 120, .55); drawFog(cc, t, cam, 800, .5, [30, 120, 150], 1, 8, 260);
    };
    if (lt < 5.5) deck(c); else if (lt < 22) xfade(c, t, 355.5, .9, deck, cc => under(cc, 'A')); else if (lt < 35) xfade(c, t, 372, .5, cc => under(cc, 'A'), deck); else xfade(c, t, 385, .6, deck, cc => under(cc, 'B'));
    // light accents
    const call = pulse(t, EV.lev_call, EV.lev_call + 5, .2, 4); if (call > .01) { c.save(); c.globalCompositeOperation = 'lighter'; for (let k = 0; k < 3; k++) { const r = ((t - EV.lev_call) * 600 + k * 250) % 1400; c.strokeStyle = `rgba(120,230,255,${.18 * (1 - r / 1400) * call})`; c.lineWidth = 4; c.beginPath(); c.arc(960, 540, r, 0, TAU); c.stroke(); } c.restore(); }
  } });

// ================= 8. KRAKEN
function boatFront() {}
addScene({ id: 8, start: 410, dur: 70, tint: [255, 150, 90], fx: { bloom: .7, vig: .72 },
  blurN: t => (t > 427.9 && t < 428.8) ? 4 : (t > 459.4 && t < 460.2 ? 3 : 1),
  draw(c, t, lt) {
    const st = { ...ZONE, glass: 0, waveAmp: 1.2, aurora: .5, seaFar: [24, 22, 52], seaNear: [4, 6, 18], waveDir: 1 };
    const strike = t - EV.strike, rec = t - EV.recoil;
    const ext = (t0, up, dn0, dn) => clamp((t - t0) / up) * (1 - clamp((t - dn0) / dn));
    const wide = (cc, tt) => {
      const cam = { x: 0, y: -30, zoom: 1.0 + .08 * sstep(0, 30, tt), roll: 2.2 * Math.sin(t * .8) * sstep(0, 3, tt) };
      const s2 = { ...st, hy: 520 }; exterior(cc, t, cam, s2, { fogFar: .4 });
      const wl = 770 + Math.sin(t * .9) * 10, roll = Math.sin(t * .8) * 3.4 * sstep(0, 4, tt);
      const tent = [[430, 800, -1.95, 2.3, 0], [560, 830, -1.6, 1.4, 1.3], [1450, 800, -1.2, -2.4, 2.1], [1570, 840, -1.5, -1.8, 3.4], [1010, 840, -1.5, .4, 5.1], [250, 860, -2.1, .9, 4.2]];
      tent.forEach((T, i) => { if (i > 1) return; });
      const draw = (back) => tent.forEach((T, i) => { const e = ext(EV.hull_wrap - 5 + i * .8, 1.6, 459.8, 1.6); if (e <= .01 || (i % 2 === 0) !== back) return; const base = [T[0], T[1]]; const pts = tentaclePts(base[0], base[1], T[2], e, T[3] * (1 - .25 * e), t, { len: 1050, ph: T[4] }); drawTentacle(cc, pts, { w0: 84 }); });
      layer(cc, cam, .6, () => { draw(true); shipReflection(cc, 960, wl, 1.1, t, { lights: .85, flicker: true }, .28, 1.5); drawShip(cc, 960, wl, 1.1, roll, t, { lights: .85, flicker: true }); draw(false); });
      drawSeaFront(cc, s2, t, cam, .6, wl + 2, mixc(st.seaFar, st.seaNear, .55), 12, 70); splash(cc, 1450, 790, EV.hull_wrap + .5, t, 24, 1.1); splash(cc, 430, 790, EV.hull_wrap + 1.3, t, 24, 1.1);
      if (tt < 14) { cc.save(); cc.globalCompositeOperation = 'lighter'; for (let i = 0; i < 26; i++) { const b = pulse(t, 413 + i * .2, 416 + i * .2, .6, 1); const x = 300 + hash(i) * 1400, y = 800 + hash(i * 3) * 160; cc.strokeStyle = `rgba(150,220,255,${.5 * b})`; cc.lineWidth = 2; cc.beginPath(); cc.ellipse(x, y, 30 + 50 * hash(i + 5) * (1 + b), 7, 0, 0, TAU); cc.stroke(); } cc.restore(); }
    };
    const deck = cc => {
      const sh = shake(t, 38, EV.strike, .9, 28), cam = { x: 300 + sh[0], y: -10 + sh[1], zoom: 1.05, roll: 1.3 * Math.sin(t * .8) + sh[0] * .05 };
      exterior(cc, t, cam, { ...st, hy: 560 }, { fogFar: .4 }); deckBack(cc, t, cam, { lamps: [[620, 520, .5]] });
      const e = clamp((t - 424.5) / 2.4) * (1 - sstep(432, 436, t)), pts = tentaclePts(1300, 900, -1.5, e, -.5, t, { len: 1000, ph: 2 }); if (e > .01) layer(cc, cam, .62, () => drawTentacle(cc, pts, { w0: 70 }));
      const rim = [190, 130, 255], sp = speakerNow(t), flinch = pulse(t, 427.9, 430, .05, 1.2); const dm = w => (sp && sp !== w && sp !== 'N') ? .25 : 0;
      ACT(cc, cam, 'WREN', 640 - flinch * 40, 990, 700, t, { f: 1, look: .5, rim, dim: dm('WREN'), emo: 'fear', lightDir: -1, aL: [flinch * 70, 90], aR: [flinch * 70, 90] });
      ACT(cc, cam, 'ELI', 1050 - flinch * 30, 990, 800, t, { f: 1, look: .5, rim, dim: dm('ELI'), emo: 'fear', lightDir: -1, aR: [kf(t, [[426.4, 8], [427.0, 140]]), 0] });
      ACT(cc, cam, 'MARA', 1400, 990, 780, t, { f: -1, look: .4, rim, dim: dm('MARA'), emo: 'grim', lightDir: -1, aR: [kf(t, [[432.6, 8], [433.4, 120]]), 20] });
      const sl = ext(EV.strike - .2, .2, 431, .9); if (sl > .01) { const pp = tentaclePts(2300, 1200, -2.62 + (1 - clamp((t - 427.8) / .25)) * .5, sl, -.4 * (1 - sl), t, { len: 1800, ph: 3 }); layer(cc, cam, 1.05, () => drawTentacle(cc, pp, { w0: 150 })); }
      deckFront(cc, t, cam); splash(cc, 1450, 900, EV.strike, t, 30, 1.2);
    };
    const engine = cc => {
      cc.fillStyle = '#05080b'; cc.fillRect(0, 0, W, H); const cam = { x: 0, y: 0, zoom: 1, roll: 0 };
      const run = t > EV.engine_catch ? 1 : 0, vib = (run ? 1 : 0) * 4 + pulse(t, EV.cough1, EV.cough1 + .3, .02, .25) * 8 + pulse(t, EV.cough2, EV.cough2 + .3, .02, .25) * 8 + pulse(t, EV.cough3, EV.cough3 + .3, .02, .25) * 10; const vx = snoise(t * 40) * vib, vy = snoise(t * 37 + 5) * vib;
      cc.save(); cc.translate(vx, vy);
      cc.fillStyle = vgrad(cc, 0, H, [[0, '#0b1418'], [1, '#050a0d']]); cc.fillRect(0, 0, W, H);
      for (let i = 0; i < 6; i++) { cc.fillStyle = '#0e1b21'; cc.fillRect(i * 360 - 40, 0, 30, 880); cc.strokeStyle = 'rgba(120,180,200,.2)'; cc.lineWidth = 2; cc.strokeRect(i * 360 - 40, 0, 30, 880); }
      const eng = (k) => { const x = 1180, cyl = 5; cc.fillStyle = '#0a1217'; cc.fillRect(x - 300, 460, 760, 420); cc.strokeStyle = 'rgba(120,180,200,.35)'; cc.lineWidth = 3; cc.strokeRect(x - 300, 460, 760, 420);
        for (let i = 0; i < cyl; i++) { const px = x - 250 + i * 150, ph = (t * (run ? 14 : 0) + i * 1.3) , pist = run ? Math.sin(ph) * 36 : (pulse(t, EV.cough1, EV.cough1 + .4, .05, .3) + pulse(t, EV.cough2, EV.cough2 + .4, .05, .3) + pulse(t, EV.cough3, EV.cough3 + .4, .05, .3)) * 20 * Math.sign(Math.sin(i + 1)); cc.fillStyle = '#16262e'; cc.fillRect(px, 360 + pist, 90, 220); cc.fillStyle = '#0a1217'; cc.fillRect(px + 40, 220, 10, 160 + pist); cc.fillStyle = 'rgba(190,230,245,.25)'; cc.fillRect(px, 360 + pist, 90, 4); }
        cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, x + 80, 700, 600, [255, 120, 40], (run ? .55 : .1 + .4 * (pulse(t, EV.cough1, EV.cough1 + .3, .02, .3) + pulse(t, EV.cough2, EV.cough2 + .3, .02, .3) + pulse(t, EV.cough3, EV.cough3 + .3, .02, .3)))); cc.restore(); };
      eng();
      for (let g = 0; g < 3; g++) { const gx = 1500 + g * 130, ang = (run ? .8 : -.7 + .4 * pulse(t, EV.cough1 + g * 1.7, EV.cough1 + g * 1.7 + .5, .05, .4)) + snoise(t * 30 + g) * .05 * run; cc.fillStyle = '#0a1216'; cc.beginPath(); cc.arc(gx, 220, 54, 0, TAU); cc.fill(); cc.strokeStyle = 'rgba(190,225,240,.6)'; cc.lineWidth = 4; cc.stroke(); cc.save(); cc.translate(gx, 220); cc.rotate(ang); cc.strokeStyle = '#ff5a40'; cc.lineWidth = 4; cc.beginPath(); cc.moveTo(0, 0); cc.lineTo(0, -42); cc.stroke(); cc.restore(); }
      cc.restore();
      bust(cc, 'JONAS', t, { side: -1, h: 1150, dx: 600, dy: 300, emo: 'fear', rim: [255, 140, 70] });
      cc.save(); cc.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const sp2 = ((t * (.7 + hash(i)) * 120 + hash(i * 3) * 900) % 1000); cc.fillStyle = `rgba(210,230,240,${.07 * (1 - sp2 / 1000)})`; cc.beginPath(); cc.ellipse(1000 + hash(i * 5) * 900, 880 - sp2, 26 + 30 * hash(i), 40 + 80 * hash(i), 0, 0, TAU); cc.fill(); } cc.restore();
      if (t > EV.engine_catch) { const fl = pulse(t, EV.engine_catch, EV.engine_catch + 1.2, .05, 1.0); cc.fillStyle = `rgba(255,170,90,${.35 * fl})`; cc.fillRect(0, 0, W, H); }
    };
    const flare = cc => {
      const tf = t - EV.flare, sh = shake(t, 14, EV.flare, 1.4, 22), cam = { x: 160 + sh[0], y: -50 + sh[1], zoom: 1.1, roll: 1 };
      exterior(cc, t, cam, { ...st, hy: 520 }, { fogFar: .3 });
      const fa = clamp(tf / 1.0), fx = lerp(1000, 1300, fa), fy = lerp(780, 160, Math.pow(fa, .6)), boom = tf > 1.3 ? 1 : 0, bt = clamp((tf - 1.3) / 5);
      cc.save(); cc.globalCompositeOperation = 'lighter'; const litA = boom ? Math.exp(-bt * 2.2) : 0; glow(cc, 1250, 200, 1500, [255, 90, 60], .75 * litA + .12 * (1 - litA)); glow(cc, 1250, 200, 400, [255, 245, 230], .95 * litA); cc.restore();
      cc.fillStyle = vgrad(cc, 520, 1080, [[0, `rgba(255,80,60,${.28 * litA})`], [1, 'rgba(0,0,0,0)']]); cc.fillRect(0, 520, W, 560);
      const e0 = 1 - sstep(EV.recoil, EV.recoil + 3, t);
      for (let i = 0; i < 5; i++) { const e = ext(EV.hull_wrap - 5, 1, 0, 0) * (1 - sstep(EV.recoil - .2 + i * .15, EV.recoil + 2.4 + i * .25, t)) + .0; const pts = tentaclePts(260 + i * 380, 860, -1.5 + (i - 2) * .22, Math.max(.001, e), (i % 2 ? 1 : -1) * 1.4 * (1 - e * .4 + (1 - e) * 1.5), t, { len: 1100, ph: i * 1.7 }); drawTentacle(cc, pts, { w0: 80, hi: [255, 130, 120] }); }
      layer(cc, cam, .6, () => { drawShip(cc, 640, 840, 1.0, 2, t, { lights: .8 }); });
      drawSeaFront(cc, st, t, cam, .6, 842, mixc(st.seaFar, st.seaNear, .55), 10, 70);
      if (tf < 2.2) { cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, fx, fy, 70, [255, 200, 120], 1); cc.strokeStyle = 'rgba(255,170,90,.6)'; cc.lineWidth = 6; cc.beginPath(); cc.moveTo(lerp(1000, fx, .3), lerp(780, fy, .3) + 20); cc.lineTo(fx, fy); cc.stroke(); cc.restore(); }
      for (let k = 0; k < 6; k++) { const d = clamp((tf - 1.4) / 6); if (d > 0) { const ang = k / 6 * TAU, rr = 40 + d * 160; cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 1250 + Math.cos(ang) * rr, 200 + Math.sin(ang) * rr + d * 160, 40, [255, 220, 160], .6 * (1 - d)); cc.restore(); } }
      ACT(cc, cam, 'ELI', 380, 1010, 860, t, { f: -1, look: .4, rim: [255, 150, 90], emo: 'grim', lightDir: -1, aR: [kf(t, [[459.0, 10], [459.5, 120]]), 0], tilt: -8 }, .95);
    };
    const helm = cc => {
      const cam = { x: 0, y: 0, zoom: 1.03 + (t - 468) * .004, roll: 1.4 * Math.sin(t * .7) };
      cc.fillStyle = '#04080b'; cc.fillRect(0, 0, W, H);
      cc.save(); cc.beginPath(); cc.rect(120, 90, 1680, 520); cc.clip(); exterior(cc, t, { ...cam, x: (t - 468) * 8 }, { ...st, hy: 360, waveAmp: .8 }, { fogFar: .4 });
      layer(cc, cam, .12, () => drawIsland(cc, 960, 380, .5 + (t - 468) * .01, t, { fires: 1 })); cc.restore();
      cc.strokeStyle = '#0a1318'; cc.lineWidth = 24; cc.strokeRect(120, 90, 1680, 520); for (const x of [620, 1240]) { cc.fillStyle = '#0a1318'; cc.fillRect(x - 9, 90, 18, 520); }
      cc.fillStyle = vgrad(cc, 610, 1080, [[0, '#0b161c'], [1, '#04080b']]); cc.fillRect(0, 610, W, 480);
      ACT(cc, cam, 'MARA', 960, 1200, 1100, t, { f: 1, look: .1, rim: [255, 170, 100], emo: 'grim', lightDir: -1, aL: [34, 40], aR: [-34, 40] }, 1);
      const wa = (t - 468) * .6 + Math.sin(t * 2) * .06; cc.save(); cc.translate(960, 1010); cc.rotate(wa); cc.strokeStyle = '#2a1a10'; cc.lineWidth = 26; cc.beginPath(); cc.arc(0, 0, 210, 0, TAU); cc.stroke(); cc.lineWidth = 14; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; cc.beginPath(); cc.moveTo(Math.cos(a) * 30, Math.sin(a) * 30); cc.lineTo(Math.cos(a) * 250, Math.sin(a) * 250); cc.stroke(); } cc.fillStyle = '#3a2412'; cc.beginPath(); cc.arc(0, 0, 44, 0, TAU); cc.fill(); cc.restore();
      
      cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 960, 760, 700, [255, 160, 90], .12); cc.restore();
    };
    const e = lt;
    if (lt < 11.5) wide(c, lt); else if (lt < 28) xfade(c, t, 421.2, .6, cc => wide(cc, lt), deck); else if (lt < 40) xfade(c, t, 437.0, .5, deck, engine);
    else if (lt < 48.5) xfade(c, t, 449.0, .6, engine, cc => wide(cc, lt)); else if (lt < 52) wide(c, lt); else if (lt < 58) xfade(c, t, 459.0, .3, cc => wide(cc, lt), flare);
    else if (lt < 68) xfade(c, t, 468.0, .8, flare, helm); else helm(c);
    if (strike > 0 && strike < .5) { c.fillStyle = `rgba(255,255,255,${.14 * (1 - strike / .5)})`; c.fillRect(0, 0, W, H); }
  } });

// ================= 9. THE PLAN
function drawBoat(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y + Math.sin(t * 1.1) * 3 * s); c.rotate((o.rot ?? Math.sin(t * .8) * .02)); c.scale(s, s);
  c.beginPath(); c.moveTo(-170, -26); c.quadraticCurveTo(-150, 34, -60, 40); c.lineTo(80, 40); c.quadraticCurveTo(160, 30, 196, -40); c.quadraticCurveTo(0, -10, -170, -26); c.closePath(); c.fillStyle = vgrad(c, -40, 40, [[0, '#1a1410'], [1, '#07090b']]); c.fill(); c.strokeStyle = 'rgba(255,190,120,.4)'; c.lineWidth = 3; c.stroke();
  const cols = ['MARA', 'NOOR', 'JONAS', 'WREN']; cols.forEach((w, i) => { const px = -110 + i * 70, hc = CH[w]; c.fillStyle = rgbs(mixc(hc.coat, [0, 0, 0], .3)); c.beginPath(); c.ellipse(px, -62, 24, 38, 0, 0, TAU); c.fill(); c.fillStyle = rgbs(hc.skin, 1); c.beginPath(); c.arc(px, -110, 19, 0, TAU); c.fill(); c.fillStyle = rgbs(hc.hat === 'hood' ? hc.coat : (hc.hat === 'cap' ? [12, 20, 34] : hc.hat === 'scarf' ? hc.scarf : hc.hair)); c.beginPath(); c.arc(px, -114, 19, Math.PI, TAU); c.fill(); });
  c.strokeStyle = '#05090b'; c.lineWidth = 3; c.beginPath(); c.moveTo(200, -40); c.lineTo(200, -90); c.stroke();
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 196, -92, 160, [255, 180, 100], .85 * (o.lamp ?? 1)); glow(c, 196, -92, 16, [255, 240, 200], 1); c.restore(); c.restore();
}
addScene({ id: 9, start: 480, dur: 55, tint: [255, 170, 100], fx: { bloom: .65, vig: .75 },
  draw(c, t, lt) {
    const st = { ...ZONE, aurora: .35, glass: .9, skyBot: [40, 28, 66], hy: 580 };
    const circle = cc => {
      const cam = { x: spline(lt, [[0, 160], [39, 400]]), y: spline(lt, [[0, 10], [39, -10]]), zoom: spline(lt, [[0, 1.0], [39, 1.14]]), roll: 1.6 * Math.sin(lt * .12) };
      exterior(cc, t, cam, st, { mirror: .8, fogFar: .3 }); deckBack(cc, t, cam, { lamps: [[400, 520, .25]] });
      layer(cc, cam, .9, () => { cc.fillStyle = '#10181c'; cc.fillRect(920, 800, 170, 126); cc.fillStyle = 'rgba(255,190,120,.3)'; cc.fillRect(920, 800, 170, 3); cc.save(); cc.globalCompositeOperation = 'lighter'; const la = .9 + .1 * snoise(t * 10); glow(cc, 1005, 770, 700, [255, 170, 90], .5 * la); glow(cc, 1005, 770, 60, [255, 235, 190], la); cc.restore(); cc.fillStyle = '#2a2018'; cc.fillRect(985, 740, 40, 60); cc.fillStyle = 'rgba(255,205,120,.95)'; cc.fillRect(991, 748, 28, 44); });
      const warm = [255, 170, 100], sp = speakerNow(t), dm = w => (sp && sp !== w && sp !== 'N') ? .3 : 0, lean = Math.sin(lt * .2) * 2;
      ACT(cc, cam, 'MARA', 560, 990, 800, t, { f: 1, look: .4, rim: warm, lightDir: 1, dim: dm('MARA'), emo: 'grim', tilt: 3, aR: [-14, 60] });
      ACT(cc, cam, 'NOOR', 800, 990, 760, t, { f: 1, look: .3, rim: warm, lightDir: 1, dim: dm('NOOR'), emo: 'worry', aR: [20, 60] });
      ACT(cc, cam, 'JONAS', 1260, 990, 800, t, { f: -1, look: .3, rim: warm, lightDir: -1, dim: dm('JONAS'), emo: 'worry', aR: [10, 70] });
      const wx = lt >= 30 ? lerp(1500, 1380, sstep(31, 35, lt)) : 1500; ACT(cc, cam, 'WREN', wx, 990, 700, t, { f: -1, look: .3, rim: warm, lightDir: -1, dim: dm('WREN'), emo: lt > 30 ? 'grim' : 'worry', tilt: lt > 30 ? -4 : 0 });
      ACT(cc, cam, 'ELI', 1780, 990, 810, t, { f: -1, look: .3, rim: warm, lightDir: -1, dim: dm('ELI'), emo: 'worry' });
      deckFront(cc, t, cam);
    };
    const boat = cc => {
      const k = lt - 39.5, cam = { x: spline(lt, [[39.5, 0], [55, 600]]), y: 0, zoom: spline(lt, [[39.5, 1.05], [55, 1.0]]), roll: 0 };
      exterior(cc, t, cam, { ...st, hy: 500 }, { mirror: .85, fogFar: .2 }); layer(cc, cam, .12, () => drawIsland(cc, 1500, 506, .5, t, { fires: 1 }));
      const down = eio(clamp((t - EV.boat_lower) / 7)), bx = 840 + Math.max(0, t - 528) * 90, by = lerp(640, 790, down);
      layer(cc, cam, .6, () => { drawShip(cc, 560, 840, 1.55, 0, t, { lights: .6 }); cc.strokeStyle = '#05090b'; cc.lineWidth = 3; cc.beginPath(); cc.moveTo(840 - 170, by - 100); cc.lineTo(840 - 170, 330); cc.moveTo(840 + 190, by - 100); cc.lineTo(840 + 190, 330); cc.stroke(); cc.lineWidth = 12; cc.beginPath(); cc.moveTo(760, 330); cc.lineTo(1060, 330); cc.lineTo(1060, 640); cc.stroke(); });
      layer(cc, cam, .85, () => { cc.save(); cc.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) reflectStreak(cc, bx + 196 + i * 3, 820, 140, [255, 180, 100], .3, t, i, 20); cc.restore(); drawBoat(cc, bx, by + 40, 1.0, t, { rot: t > 528 ? .02 : 0 }); });
      drawSeaFront(cc, st, t, cam, .85, 840, mixc(st.seaFar, st.seaNear, .6), 3);
    };
    if (lt < 39.5) circle(c); else xfade(c, t, 519.5, .9, circle, boat);
  } });

// ================= 10. SHIPWRECK SHORE
function wreckCliff(c, x0, x1, base, hMax, seed, shade, t) {
  const r = mulberry32(seed); for (let x = x0; x < x1; x += 55) { const hh = hMax * (.25 + .75 * r()), w = 90 + 130 * r(); c.save(); c.translate(x, base); c.rotate((r() - .5) * .5); const v = shade * (.5 + r() * .5); c.fillStyle = rgba(8 * v, 14 * v, 20 * v, 1); c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(-w * .4, -hh); c.lineTo(w * .1, -hh * .8 - 30); c.lineTo(w / 2, -hh * .3); c.lineTo(w / 2, 0); c.closePath(); c.fill(); c.strokeStyle = rgba(70, 120, 150, .28 * shade); c.lineWidth = 2; c.beginPath(); c.moveTo(-w * .4, -hh); c.lineTo(w * .1, -hh * .8 - 30); c.stroke(); if (r() < .5) { c.strokeStyle = rgba(10 * v, 18 * v, 26 * v, 1); c.lineWidth = 5; c.beginPath(); c.moveTo(0, -hh * .5); c.lineTo(8, -hh - 160 - 140 * r()); c.stroke(); } c.restore(); }
}
addScene({ id: 10, start: 535, dur: 60, tint: [160, 210, 255], fx: { bloom: .6, vig: .72 },
  draw(c, t, lt) {
    const st = { ...ZONE, aurora: .45, hy: 520, glass: .9 };
    const cam = { x: spline(lt, [[0, 0], [14, 380], [60, 1000]]), y: spline(lt, [[0, 20], [60, -10]]), zoom: spline(lt, [[0, 1.0], [24, 1.04], [58, 1.2]]), roll: .8 * Math.sin(lt * .15) };
    exterior(c, t, cam, st, { mirror: .7 * (1 - sstep(8, 14, lt)) + .0, fogFar: .5 });
    if (lt > 8) { c.fillStyle = vgrad(c, 520, H, [[0, 'rgba(14,26,36,0)'], [1, 'rgba(6,12,18,1)']]); c.globalAlpha = sstep(8, 14, lt); c.fillRect(0, 520, W, 560); c.globalAlpha = 1; }
    layer(c, cam, .1, () => { drawIsland(c, 1500, 560, 1.3, t, { fires: 1, fireR: 330 }); });
    drawFog(c, t, cam, 540, .8, [140, 120, 190], .3, 3, 220);
    layer(c, cam, .38, () => { wreckCliff(c, -500, 2900, 620, 520, 11, .9, t); });
    layer(c, cam, .6, () => { wreckCliff(c, -500, 3200, 760, 600, 12, .6, t); });
    drawFog(c, t, cam, 700, .6, [120, 150, 200], .6, 4, 200);
    // ground: hull plating
    layer(c, cam, .9, () => { c.fillStyle = vgrad(c, 900, 1080, [[0, '#0a1217'], [1, '#03070a']]); c.fillRect(-600, 900, 4600, 300); c.strokeStyle = 'rgba(110,170,195,.2)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-600, 902); c.lineTo(4000, 902); c.stroke(); for (let x = -600; x < 4000; x += 210) { c.strokeStyle = 'rgba(0,0,0,.5)'; c.beginPath(); c.moveTo(x, 902); c.lineTo(x - 60, 1100); c.stroke(); } });
    // ghost procession (opposite direction)
    const gp = sstep(10, 16, lt); for (let i = 0; i < 12; i++) { const gx = ((i * 380 - t * 60) % 4600 + 4600) % 4600 - 300 + 400; layer(c, cam, .85, () => drawGhost(c, gx, 890 + 10 * Math.sin(t + i), .55 + .08 * (i % 3), t, { a: .55 * gp * (i % 2 ? .8 : 1), seed: i, len: 220, drift: -.6, col: [160, 215, 255], mouth: .2 })); }
    // boat arrival (0-11) then crew walking
    const boatA = 1 - sstep(8, 12, lt); if (boatA > .01) layer(c, cam, .85, () => { c.save(); c.globalAlpha = boatA; drawBoat(c, 700 + lt * 22, 900 + 8 * Math.sin(t), 1.0, t); c.restore(); });
    const wk = sstep(10, 13, lt) * (1 - sstep(24, 27, lt)), mv = 380 * Math.min(lt - 10, 14) * (lt > 10 ? 1 : 0) / 3, sp = speakerNow(t), rim = [170, 205, 255];
    const dm = w => (sp && sp !== w && sp !== 'N') ? .25 : 0, base = 800 + Math.max(0, Math.min(lt - 10, 14)) * 70;
    const ph = Math.max(0, lt - 10) * 3.4;
    if (lt > 9) { ACT(c, cam, 'MARA', base + 220, 990, 790, t, { f: 1, look: .5, rim, walk: wk, ph, dim: dm('MARA'), lightDir: -1, emo: 'grim' }); ACT(c, cam, 'NOOR', base + 60, 990, 760, t, { f: 1, look: .4, rim, walk: wk, ph: ph + 1.6, dim: dm('NOOR'), lightDir: -1, emo: 'worry' }); ACT(c, cam, 'JONAS', base - 120, 990, 810, t, { f: 1, look: .4, rim, walk: wk, ph: ph + 3.1, dim: dm('JONAS'), lightDir: -1, emo: 'fear' }); ACT(c, cam, 'WREN', lt < 24 ? base - 300 : base - 380 + 60 * sstep(32, 35, lt), 990, 700, t, { f: 1, look: .4, rim, walk: wk, ph: ph + 4.7, dim: dm('WREN'), lightDir: -1, emo: 'worry' }); }
    // grandfather
    const ga = pulse(lt, 24.5, 62, 2.5, 1), gx = base - 120 + 280;
    if (ga > .01 && lt > 24) { const gcam = cam; ACT(c, gcam, 'GRAND', base + 420, 990, 800, t, { f: -1, look: .3, rim: [170, 225, 255], alpha: ga, lightDir: 1, emo: 'worry', aR: [20, 50] }, .9); layer(c, cam, .9, () => { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, base + 420, 620, 420, [150, 210, 255], .3 * ga); c.restore(); }); }
    drawFog(c, t, cam, 960, .5, [110, 140, 190], 1.3, 8, 160);
    dofLayer(c, 'embers', 4, g => { g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const x = ((hash(i) * 2400 + t * 12 * (1 + hash(i + 5))) % 2400) - 200, y = 1080 - ((hash(i * 3) * 1200 + t * 25 * (1 + hash(i))) % 1100); g.fillStyle = `rgba(160,215,255,${.35 * hash(i + 9)})`; g.beginPath(); g.arc(x, y, 1.5 + 3 * hash(i + 4), 0, TAU); g.fill(); } }, 1, 'lighter');
  } });

// ================= 11. THE LAMP
function eyeOrb(c, x, y, R, t, o = {}) { // crystal that becomes an eye. open 0..1, look (-1..1), look2 (y)
  const open = o.open ?? 0, pul = .8 + .2 * Math.sin(t * 1.6); c.save(); c.translate(x, y);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, 0, R * 3.4, [150, 225, 255], (o.glow ?? .6) * pul); c.restore();
  const g = c.createRadialGradient(-R * .2, -R * .25, R * .1, 0, 0, R); g.addColorStop(0, '#f2fdff'); g.addColorStop(.45, '#8fd8f2'); g.addColorStop(1, '#1d5a78'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, R, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(230,250,255,.5)'; c.lineWidth = 3; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .3; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * R, Math.sin(a) * R); c.stroke(); }
  if (open > .01) { c.save(); c.beginPath(); c.arc(0, 0, R, 0, TAU); c.clip(); c.fillStyle = `rgba(4,10,16,${open})`; c.beginPath(); c.ellipse(0, 0, R * 1.05, R * (.08 + .92 * open), 0, 0, TAU); c.fill();
    const ir = c.createRadialGradient((o.look || 0) * R * .25, (o.look2 || 0) * R * .2, R * .1, 0, 0, R * .8); ir.addColorStop(0, '#fff8d8'); ir.addColorStop(.5, '#ffc04a'); ir.addColorStop(1, '#a0420a'); c.fillStyle = ir; c.beginPath(); c.ellipse((o.look || 0) * R * .2, (o.look2 || 0) * R * .15, R * .82, R * .82 * open, 0, 0, TAU); c.fill();
    c.fillStyle = '#100400'; c.beginPath(); c.ellipse((o.look || 0) * R * .3, (o.look2 || 0) * R * .2, R * (.1 + .12 * Math.sin(t * .8) ** 2), R * .7 * open, 0, 0, TAU); c.fill(); c.restore(); }
  c.restore();
}
addScene({ id: 11, start: 595, dur: 65, tint: [230, 250, 255], fx: { bloom: .8, vig: .7 },
  blurN: t => (t > 645 && t < 647.5) ? 3 : 1,
  draw(c, t, lt) {
    const eyeOpen = sstep(EV.eye_open, EV.eye_open + 2.2, t) * (1 - sstep(EV.lamp_turn + 4, EV.lamp_turn + 6, t) * .0), turn = sstep(EV.hands_wheel, EV.lamp_turn, t);
    const stairs = cc => {
      const k = lt, cam = { x: 0, y: 0, zoom: 1.04, roll: 1.5 * Math.sin(lt * .5) };
      cc.fillStyle = vgrad(cc, 0, H, [[0, '#03070a'], [1, '#0a1820']]); cc.fillRect(0, 0, W, H);
      const scroll = (lt * 90) % 260;
      cc.save(); layer(cc, cam, .5, () => { cc.fillStyle = 'rgba(40,80,100,.22)'; for (let i = -2; i < 10; i++) { const y = i * 260 + scroll; cc.fillRect(0, y, W, 4); cc.fillRect(380 + (i % 2) * 40, y, 8, 260); cc.fillRect(1500, y, 8, 260); } cc.save(); cc.globalCompositeOperation = 'lighter'; for (let i = 0; i < 8; i++) { const y = ((i * 190 + lt * 90) % 1400) - 150; glow(cc, 260 + (i % 2) * 1400, y, 220, [140, 205, 255], .12 + .06 * hash(i)); } cc.restore(); }); cc.restore();
      // zig-zag stair
      layer(cc, cam, .9, () => { for (let i = -2; i < 8; i++) { const y = 1000 - i * 260 + scroll, dir = i % 2 ? 1 : -1; cc.strokeStyle = '#0a1318'; cc.lineWidth = 34; cc.beginPath(); cc.moveTo(dir > 0 ? 420 : 1500, y + 260); cc.lineTo(dir > 0 ? 1500 : 420, y); cc.stroke(); cc.strokeStyle = 'rgba(120,190,215,.35)'; cc.lineWidth = 3; cc.beginPath(); cc.moveTo(dir > 0 ? 420 : 1500, y + 244); cc.lineTo(dir > 0 ? 1500 : 420, y - 16); cc.stroke(); for (let s = 0; s < 14; s++) { const u = s / 14, px = lerp(dir > 0 ? 420 : 1500, dir > 0 ? 1500 : 420, u), py = lerp(y + 260, y, u); cc.fillStyle = 'rgba(0,0,0,.4)'; cc.fillRect(px - 20, py + 12, 40, 5); } } });
      // reaching hands from the walls
      for (let i = 0; i < 12; i++) { const side = i % 2 ? 1 : -1, y = ((i * 170 + lt * 90) % 1500) - 200, reach = .5 + .5 * Math.sin(t * 1.3 + i * 2), a = pulse(lt, 1.4, 12, 1.5, 1.5) * (.35 + .65 * reach); layer(cc, cam, .8, () => drawHand(cc, side < 0 ? 150 + reach * 150 : 1770 - reach * 150, y, side < 0 ? Math.PI / 2 + .2 * Math.sin(t + i) : -Math.PI / 2 - .2 * Math.sin(t + i), 1.7, a)); }
      const sp = speakerNow(t), rim = [160, 215, 255], bobc = Math.sin(lt * 5) * 6;
      const ph = lt * 5.2; ACT(cc, cam, 'MARA', 1220, 940, 560, t, { f: 1, look: .4, rim, walk: .8, ph, lightDir: -1, emo: 'grim', bob: bobc }, .9); ACT(cc, cam, 'NOOR', 1050, 970, 520, t, { f: 1, look: .4, rim, walk: .8, ph: ph + 1.4, lightDir: -1, emo: 'fear', bob: bobc }, .9); ACT(cc, cam, 'JONAS', 880, 1000, 590, t, { f: 1, look: .4, rim, walk: .8, ph: ph + 2.8, lightDir: -1, emo: 'fear', bob: bobc }, .9); ACT(cc, cam, 'WREN', 740, 1020, 470, t, { f: 1, look: .4, rim, walk: .8, ph: ph + 4.2, lightDir: -1, emo: 'worry', bob: bobc }, .9);
    };
    const top = cc => {
      const tp = t - EV.lamp_turn, sh = shake(t, 5 * eyeOpen + 12 * pulse(t, EV.lamp_turn - 1, EV.lamp_turn + 3, .5, 2), 595, 100, 18), cam = { x: sh[0], y: sh[1], zoom: spline(lt, [[10, 1.0], [30, 1.06], [48, 1.12]]), roll: 1 * Math.sin(lt * .3) };
      cc.fillStyle = vgrad(cc, 0, H, [[0, '#02050a'], [1, '#0b1a22']]); cc.fillRect(0, 0, W, H);
      layer(cc, cam, .5, () => { cc.strokeStyle = 'rgba(70,130,160,.25)'; cc.lineWidth = 3; for (let i = 0; i < 14; i++) { cc.beginPath(); cc.arc(960, 1300, 500 + i * 120, Math.PI * 1.1, Math.PI * 1.9); cc.stroke(); } for (let i = 0; i < 10; i++) { cc.fillStyle = '#04090d'; cc.fillRect(i * 230 - 40, 0, 40, 780); } });
      const lookx = Math.sin(t * .4) * .6 * (1 - turn) - turn * .9, ey = 420;
      eyeOrb(cc, 960, ey, 330 + 25 * turn, t, { open: eyeOpen, look: lookx, look2: .35, glow: .5 + .6 * turn });
      cc.save(); cc.globalCompositeOperation = 'lighter'; if (turn > .05) { const beamA = turn * (.5 + .5 * sstep(EV.lamp_turn - .5, EV.lamp_turn + 1, t)); cc.save(); cc.translate(960, ey); cc.rotate(Math.PI * (.5 - turn * .5) * -1 + Math.PI * .5 * 0 + (-.25) * 0); const bg = cc.createLinearGradient(0, 0, 0, -1400); bg.addColorStop(0, `rgba(200,245,255,${.55 * beamA})`); bg.addColorStop(1, 'rgba(200,245,255,0)'); cc.fillStyle = bg; cc.beginPath(); cc.moveTo(-70, 0); cc.lineTo(-340, -1400); cc.lineTo(340, -1400); cc.lineTo(70, 0); cc.fill(); cc.restore(); } cc.restore();
      // floor + wheel
      cc.fillStyle = vgrad(cc, 800, H, [[0, '#0a1519'], [1, '#03070a']]); cc.fillRect(0, 800, W, 300); cc.fillStyle = 'rgba(130,200,225,.25)'; cc.fillRect(0, 800, W, 3);
      cc.save(); cc.translate(1000, 770); cc.scale(1, .42); cc.rotate(turn * 2.2 - .3); cc.strokeStyle = '#1b2a31'; cc.lineWidth = 34; cc.beginPath(); cc.arc(0, 0, 320, 0, TAU); cc.stroke(); cc.lineWidth = 20; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; cc.beginPath(); cc.moveTo(0, 0); cc.lineTo(Math.cos(a) * 320, Math.sin(a) * 320); cc.stroke(); } cc.strokeStyle = 'rgba(160,220,245,.4)'; cc.lineWidth = 3; cc.beginPath(); cc.arc(0, 0, 332, 0, TAU); cc.stroke(); cc.restore();
      const rim = [170, 225, 255], sp = speakerNow(t), push = turn > 0 && t < EV.lamp_turn + 1 ? 1 : 0, pushX = turn * 50, dm = w => (sp && sp !== w && sp !== 'N') ? .25 : 0;
      ACT(cc, cam, 'MARA', 520 + pushX, 1000, 780, t, { f: 1, look: .4, rim, lightDir: 1, dim: dm('MARA'), emo: 'grim', aL: [30 + push * 30, 40], aR: [-20 - push * 40, 50] }); ACT(cc, cam, 'NOOR', 760 + pushX, 1010, 740, t, { f: 1, look: .3, rim, lightDir: 1, dim: dm('NOOR'), emo: 'fear', aR: [30 + push * 50, 40] }); ACT(cc, cam, 'JONAS', 1330 - pushX, 1010, 800, t, { f: -1, look: .3, rim, lightDir: -1, dim: dm('JONAS'), emo: 'fear', aL: [30 + push * 40, 40], aR: [-30 - push * 50, 50], bob: -push * 6 }); ACT(cc, cam, 'WREN', 1560 - pushX, 1010, 690, t, { f: -1, look: .3, rim, lightDir: -1, dim: dm('WREN'), emo: 'fear', aR: [20 + push * 50, 40] });
      const gh = sstep(EV.hands_wheel, EV.hands_wheel + 3, t); for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, rx = 330 * Math.cos(a), ry = 330 * .42 * Math.sin(a), tt = turn * 2.2 - .3; layer(cc, cam, .9, () => drawHand(cc, 1000 + Math.cos(a + tt) * 330, 770 + Math.sin(a + tt) * 330 * .42 + 40, Math.PI * .15 * Math.cos(a), 1.1 + .4 * (1 - i % 3 * .1), .75 * gh * (1 - sstep(EV.lamp_turn + 2, EV.lamp_turn + 4, t)))); }
      if (eyeOpen > .1) { cc.save(); cc.globalCompositeOperation = 'lighter'; cc.fillStyle = `rgba(160,225,255,${.05 * eyeOpen})`; cc.fillRect(0, 0, W, H); cc.restore(); }
      dofLayer(cc, 'dust', 5, g => { g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 60; i++) { const x = (hash(i) * 2000 + Math.sin(t + i) * 30), y = ((hash(i * 3) * 1200 + t * (10 + 20 * hash(i))) % 1200); g.fillStyle = `rgba(200,235,255,${.3 * hash(i + 9) * (.3 + eyeOpen)})`; g.beginPath(); g.arc(x, y, 1.5 + 4 * hash(i + 4), 0, TAU); g.fill(); } }, 1, 'lighter');
    };
    const outside = cc => {
      const k = t - 645.2, cam = { x: 0, y: 0, zoom: 1.0 + .06 * clamp(k / 6), roll: 0 };
      const st = { ...ZONE, hy: 640, aurora: .6, glass: .9 }; exterior(cc, t, cam, st, { mirror: .85 });
      const open = sstep(0, 3.5, k), gapW = 80 + 760 * open; cc.save(); layer(cc, cam, .12, () => { cc.fillStyle = '#000'; });
      cc.save(); cc.globalCompositeOperation = 'lighter'; for (const sd of [-1, 1]) { const x0 = 960 + sd * (gapW / 2), xe = sd < 0 ? -200 : W + 200; cc.fillStyle = vgrad(cc, 0, 640, [[0, 'rgba(160,220,255,0)'], [1, 'rgba(210,245,255,.55)']]); cc.fillRect(Math.min(x0, xe), 20, Math.abs(xe - x0), 620); } cc.restore();
      if (open > .02) { cc.save(); cc.globalCompositeOperation = 'source-over'; cc.fillStyle = vgrad(cc, 0, 640, [[0, 'rgba(14,10,36,1)'], [1, 'rgba(60,40,110,1)']]); cc.beginPath(); cc.rect(960 - gapW / 2, 0, gapW, 642); cc.fill(); cc.globalCompositeOperation = 'lighter'; for (let i = 0; i < 20; i++) { const sx = 960 - gapW / 2 + hash(i) * gapW; cc.fillStyle = 'rgba(220,245,255,.5)'; cc.fillRect(sx, 100 + hash(i * 3) * 400, 2, 60 + 100 * hash(i + 2)); } cc.restore(); }
      layer(cc, cam, .12, () => drawIsland(cc, 200, 700, 1.2, t, { fires: 1, beam: -.12 - .05 * Math.sin(k), beamW: 80 }));
      cc.save(); cc.globalCompositeOperation = 'lighter'; const bx = 240, by = 40, ex = 960 + 80, ey = 600, ang = Math.atan2(ey - by, ex - bx), len = Math.hypot(ex - bx, ey - by); cc.translate(bx, by); cc.rotate(ang);
      for (let q = 0; q < 4; q++) { const wq = 30 + q * 46 + 10 * Math.sin(t * 7 + q), gq = cc.createLinearGradient(0, 0, len, 0); gq.addColorStop(0, `rgba(230,250,255,${.34 - q * .06})`); gq.addColorStop(1, `rgba(190,235,255,${.14 - q * .02})`); cc.fillStyle = gq; cc.beginPath(); cc.moveTo(0, -4); cc.lineTo(len * 1.05, -wq); cc.lineTo(len * 1.05, wq); cc.lineTo(0, 4); cc.closePath(); cc.fill(); }
      cc.restore(); cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 960 + 80, 600, 520, [220, 248, 255], .55 * sstep(0, 1.2, k)); glow(cc, bx, by, 260, [230, 250, 255], .8); cc.restore();
      const wf = Math.exp(-Math.pow((t - EV.beam_cut) / .9, 2)); if (wf > .01) { cc.fillStyle = `rgba(235,250,255,${.6 * wf})`; cc.fillRect(0, 0, W, H); }
    };
    const run = cc => {
      const sh = shake(t, 22, 651, 20, 24), cam = { x: 0 + sh[0], y: sh[1], zoom: 1.06, roll: 2 * Math.sin(t * 6) * .6 };
      cc.fillStyle = vgrad(cc, 0, H, [[0, '#02050a'], [1, '#0b1a22']]); cc.fillRect(0, 0, W, H); layer(cc, cam, .4, () => { for (let i = 0; i < 12; i++) { cc.fillStyle = '#04090d'; cc.fillRect(((i * 300 - (t - 651) * 600) % 3600 + 3600) % 3600 - 300, 0, 50, 800); } });
      cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 960, 420, 1600, [200, 245, 255], .35 * (1 - sstep(651, 660, t))); cc.restore(); cc.fillStyle = vgrad(cc, 900, H, [[0, '#0a1519'], [1, '#03070a']]); cc.fillRect(0, 900, W, 200);
      const ph = t * 9, rim = [200, 240, 255], x0 = lerp(300, 1300, clamp((t - 651) / 7));
      ACT(cc, cam, 'WREN', x0 + 760, 990, 690, t, { f: 1, look: .4, rim, walk: 1, ph, emo: 'fear', lightDir: 1 }); ACT(cc, cam, 'JONAS', x0 + 520, 990, 800, t, { f: 1, look: .4, rim, walk: 1, ph: ph + 1, emo: 'fear', lightDir: 1 }); ACT(cc, cam, 'NOOR', x0 + 300, 990, 760, t, { f: 1, look: .4, rim, walk: 1, ph: ph + 2, emo: 'fear', lightDir: 1 }); ACT(cc, cam, 'MARA', x0, 990, 790, t, { f: 1, look: .4, rim, walk: 1, ph: ph + 3, emo: 'grim', lightDir: 1 });
      const gp = sstep(651, 654, t); for (let i = 0; i < 9; i++) layer(cc, cam, .85, () => drawGhost(cc, ((i * 330 + (t - 651) * 220) % 2400) - 200, 900, .6, t, { a: .5 * gp, seed: i, len: 200, drift: -.8, f: 1 }));
    };
    if (lt < 11) stairs(c); else if (lt < 13) xfade(c, t, 606.0, .9, stairs, top); else if (lt < 50) top(c);
    else if (lt < 52.2) xfade(c, t, 645.0, .5, top, outside); else if (lt < 56.4) outside(c); else if (lt < 57.5) xfade(c, t, 651.0, .7, outside, run); else run(c);
  } });

// ================= 12. OPEN WATER
function drawSun(c, x, y, r, a, t) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y, r * 8, [255, 190, 120], .45 * a); glow(c, x, y, r * 3, [255, 220, 170], .7 * a); c.fillStyle = `rgba(255,245,220,${a})`; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.restore(); }
addScene({ id: 12, start: 660, dur: 60, tint: [255, 200, 140], fx: { bloom: .7, vig: .62 },
  draw(c, t, lt) {
    const dawn = sstep(692 - 3, 694 + 6, t), gap = sstep(EV.gap_open - 1.2, EV.gap_open + 3.5, t), dive = sstep(EV.island_dive, EV.island_dive + 9, t);
    const zone = mixc([10, 6, 30], [92, 130, 190], dawn), zb = mixc([58, 36, 84], [255, 196, 140], dawn);
    const st = { ...ZONE, skyTop: zone, skyBot: zb, hy: 560, aurora: .8 * (1 - dawn), stars: .95 * (1 - dawn), consts: 1 - dawn, mirror: 1 - dawn, glass: .9 * (1 - dawn) + .1, waveAmp: .35 + .35 * dawn, seaFar: mixc([34, 24, 66], [90, 120, 150], dawn), seaNear: mixc([6, 6, 22], [24, 50, 70], dawn), horizonGlow: .4 + .4 * dawn, glowCol: mixc([150, 90, 200], [255, 190, 130], dawn), waveDir: 1 };
    const wide = cc => {
      const cam = { x: spline(lt, [[0, 0], [30, 120], [50, 160]]), y: spline(lt, [[0, -20], [60, -10]]), zoom: spline(lt, [[0, 1.2], [14, 1.1], [60, 1.0]]), roll: Math.sin(t * .6) * 1.6 * (1 - dawn) };
      exterior(cc, t, cam, st, { mirror: (1 - dawn) * .85 || undefined });
      if (dawn > .01) drawSun(cc, 1180, st.hy + 10, 40 + 12 * dawn, dawn, t);
      // light wall splitting
      const wall = (1 - dawn) * (.9 - .5 * gap); if (wall > .01) { drawWall(cc, st, t, cam, wall, -200, 960 - 80 - 700 * gap); drawWall(cc, st, t, cam, wall, 960 + 80 + 700 * gap, W + 200); }
      layer(cc, cam, .1, () => { const d = dive; drawIsland(cc, 1500, st.hy + 8 + d * 1700, 1.0, t, { fires: 1 - d, lamp: 1 - d, beam: d < .5 ? -.5 : undefined, beamW: 60 * (1 - d) }); });
      if (dive > .02 && dive < .98) splash(cc, 1500, st.hy + 20, EV.island_dive + 1, t, 40, 2);
      // leviathans parting
      layer(cc, cam, .4, () => { for (const [x, sdir, a] of [[560, -1, 1], [1380, 1, 1]]) { const up = pulse(t, 664, 684, 3, 5) * a; cc.save(); cc.translate(x, st.hy + 118 + (1 - up) * 150); cc.scale(sdir, 1); cc.fillStyle = '#050f18'; cc.beginPath(); cc.ellipse(0, 0, 360, 150 * up + 4, 0, Math.PI, TAU); cc.fill(); cc.strokeStyle = 'rgba(80,170,210,.3)'; cc.lineWidth = 3; cc.stroke(); cc.save(); cc.globalCompositeOperation = 'lighter'; for (let i = 0; i < 16; i++) { const px = -300 + i * 40; glow(cc, px, -30 - Math.sin(i * .7) * 30 * up, 22, [90, 230, 255], .5 * up * (.5 + .5 * Math.sin(t * 2 + i))); } cc.restore(); cc.restore(); } });
      drawSeaFront(cc, st, t, cam, .4, st.hy + 122, mixc(st.seaFar, st.seaNear, .25), 6, 140);
      // ship, running toward the gap then away
      const sx = spline(lt, [[0, 560], [14, 760], [30, 1000], [48, 1500]]), wl = 800;
      layer(cc, cam, .6, () => { shipReflection(cc, sx, wl, .95, t, { lights: .8 - .5 * dawn }, .28, 1); drawShip(cc, sx, wl + Math.sin(t * .9) * 4, .95, Math.sin(t * .8) * 2 * (1 - dawn) + 1, t, { lights: .8 - .5 * dawn }); });
      drawSeaFront(cc, st, t, cam, .6, wl + 2, mixc(st.seaFar, st.seaNear, .55), 6);
      for (let i = 0; i < 3; i++) { const tp = tentaclePts(300 + i * 500, 880, -1.5, Math.max(.001, 1 - sstep(EV.gap_open, EV.gap_open + 4 + i, t)) * (t > EV.gap_open - 6 ? 1 : .001), (i - 1) * .6, t, { len: 700, ph: i }); if (t > 656 && t < 670) drawTentacle(cc, tp, { w0: 60 }); }
      drawFog(cc, t, cam, 820, .4 + .4 * (1 - dawn), mixc([120, 130, 190], [255, 210, 170], dawn), 1.1, 3, 200);
    };
    const farewell = cc => {
      const cam = { x: 500 + lt * 3, y: 0, zoom: 1.05, roll: Math.sin(t * .7) * 1.3 };
      exterior(cc, t, cam, { ...st, hy: 540 }, { mirror: .8 }); layer(cc, cam, .1, () => drawIsland(cc, 1300, 550 + dive * 1500, .7, t, { fires: 1 - dive, lamp: 1 - dive }));
      deckBack(cc, t, cam, { lamps: [[620, 520, .4]] });
      const ga = pulse(t, 685.2, 690, .6, 1.8); ACT(cc, cam, 'WREN', 1000, 990, 760, t, { f: 1, look: .5, rim: [190, 160, 255], lightDir: -1, emo: 'worry', aR: [kf(t, [[681, 10], [682, 90]]), 30] }); ACT(cc, cam, 'GRAND', 1400, 990 - (1 - ga) * 0, 800, t, { f: -1, look: .3, rim: [170, 225, 255], alpha: ga, lightDir: 1, emo: 'worry' }); deckFront(cc, t, cam);
    };
    const compass = cc => {
      cc.fillStyle = vgrad(cc, 0, H, [[0, '#14202a'], [1, '#2a1f24']]); cc.fillRect(0, 0, W, H); drawSun(cc, 1500, 160, 36, .7, t);
      cc.save(); cc.translate(960, 560); cc.scale(1.0 + (t - 699) * .004, 1.0 + (t - 699) * .004); glow(cc, 0, 0, 800, [255, 200, 140], .18);
      cc.fillStyle = '#2b2118'; cc.beginPath(); cc.arc(0, 0, 360, 0, TAU); cc.fill(); cc.strokeStyle = '#b0884e'; cc.lineWidth = 14; cc.stroke(); cc.fillStyle = '#e9e0cc'; cc.beginPath(); cc.arc(0, 0, 330, 0, TAU); cc.fill();
      for (let i = 0; i < 72; i++) { const a = i / 72 * TAU, l = i % 6 ? 16 : 40; cc.strokeStyle = '#2b2118'; cc.lineWidth = i % 6 ? 3 : 7; cc.beginPath(); cc.moveTo(Math.sin(a) * 322, -Math.cos(a) * 322); cc.lineTo(Math.sin(a) * (322 - l), -Math.cos(a) * (322 - l)); cc.stroke(); } cc.fillStyle = '#2b2118'; cc.font = '600 62px Cinzel'; cc.textAlign = 'center'; cc.textBaseline = 'middle'; cc.fillText('N', 0, -250); cc.fillText('S', 0, 250); cc.fillText('E', 250, 0); cc.fillText('W', -250, 0);
      const target = Math.PI * .72, turn = sstep(699.5, 706, t), wob = Math.sin(t * 3.4) * .05 * (1 - turn) + Math.sin(t * 9) * .012 * turn; cc.rotate(lerp(.1, target, turn) + wob);
      cc.fillStyle = '#c0392b'; cc.beginPath(); cc.moveTo(0, -270); cc.lineTo(26, 0); cc.lineTo(-26, 0); cc.fill(); cc.fillStyle = '#2b2118'; cc.beginPath(); cc.moveTo(0, 270); cc.lineTo(26, 0); cc.lineTo(-26, 0); cc.fill(); cc.fillStyle = '#b0884e'; cc.beginPath(); cc.arc(0, 0, 20, 0, TAU); cc.fill(); cc.restore();
      cc.save(); cc.globalAlpha = .15; cc.fillStyle = '#fff'; cc.beginPath(); cc.ellipse(800, 300, 220, 120, -.5, 0, TAU); cc.fill(); cc.restore();
    };
    const names = cc => {
      const cam = { x: 0, y: 0, zoom: 1.0, roll: 0 }; const st2 = { ...st, hy: 460, waveAmp: .55 }; exterior(cc, t, cam, st2, {}); drawSun(cc, 1200, 470, 44, 1, t);
      cc.save(); cc.globalCompositeOperation = 'lighter'; for (let i = 0; i < 20; i++) reflectStreak(cc, 1200 + (hash(i) - .5) * 40, 480, 600, [255, 200, 140], .35, t, i, 90 - i * 2); cc.restore();
      const nm = ['VOSS', 'BRANDT', 'HADDAD', 'KELL', 'HALE']; nm.forEach((n, i) => { const a = pulse(t, 700.4 + i * 1.6, 713, 1.2, 2.2); if (a < .01) return; const y = 640 + i * 76, sc = .5 + i * .18; cc.save(); cc.translate(960 + (i % 2 ? 120 : -120), y); cc.scale(1, .45); cc.font = `600 ${58 * sc}px Cinzel`; cc.textAlign = 'center'; cc.textBaseline = 'middle'; cc.fillStyle = `rgba(255,240,215,${.75 * a * (.8 + .2 * Math.sin(t * 2 + i))})`; cc.shadowColor = 'rgba(255,200,140,.9)'; cc.shadowBlur = 24; for (let k = 0; k < 2; k++) cc.fillText(n.split('').join(' '), Math.sin(t * 1.4 + i) * 6, 0); cc.restore(); });
      dofLayer(cc, 'sea_fg', 4, g => { g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 20; i++) { g.strokeStyle = 'rgba(255,220,170,.06)'; g.lineWidth = 2; g.beginPath(); for (let x = 0; x <= W; x += 40) { const yy = 700 + i * 20 + Math.sin(x * .01 + t + i) * 10; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); } }, 1, 'lighter');
    };
    if (lt < 22) wide(c); else if (lt < 33) xfade(c, t, 682, .8, wide, farewell); else if (lt < 40) xfade(c, t, 690.5, .8, farewell, wide); else if (lt < 40.8) wide(c); else if (lt < 52) xfade(c, t, 699.0, 1.2, wide, compass); else if (lt < 56) xfade(c, t, 710.6, 1.2, compass, names);
    else names(c);
    // end title
    { const ta = pulse(t, EV.end_title - 3.4, 719.4, 1.2, 1.6); if (ta > .01) { c.fillStyle = `rgba(2,6,12,${.55 * ta})`; c.fillRect(0, 0, W, H); } drawTitle(c, 'THE DROWNED MERIDIAN', t, EV.end_title - 3.4, 719.2, { size: 92, y: 520 }); }
  } });
