// frame.js — compositing: scenes (with light-dissolve transitions), motion-blur accumulation, post fx, subtitles, fades.
const FPS = 60, TOTAL = 720;
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const SC = mkCanvas(W, H), scx = SC.getContext('2d');      // scene scratch
const AC = mkCanvas(W, H), acx = AC.getContext('2d');      // accumulation
const SB = mkCanvas(W, H), sbx = SB.getContext('2d');      // scene B (transition)
let DATA = { lines: [], scenes: [], lip: {}, events: {} };
window.setData = d => { DATA = d; window.EV = d.events; };
function sceneAt(t) { let s = SCENES[0]; for (const x of SCENES) if (t >= x.start) s = x; return s; }
function drawScene(c, sc, t) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, W, H); sc.draw(c, t, clamp(t - sc.start, 0, sc.dur + 1)); }
function drawWorld(c, t) {
  const sc = sceneAt(t), i = SCENES.indexOf(sc), nxt = SCENES[i + 1], TR = .9;
  if (nxt && t > nxt.start - TR) { // dissolve through light
    drawScene(c, sc, t); const k = sstep(nxt.start - TR, nxt.start + TR * .6, t); drawScene(sbx, nxt, t);
    c.save(); c.globalAlpha = k; c.drawImage(SB, 0, 0); c.restore();
    c.save(); c.globalCompositeOperation = 'lighter'; glow(c, W / 2, H / 2, 1300, nxt.tint || [150, 210, 255], .45 * Math.sin(k * Math.PI)); c.restore();
  } else drawScene(c, sc, t);
}
function blurSamples(t) { const sc = sceneAt(t); return sc.blurN ? sc.blurN(t) : 1; }
function subtitle(c, t) {
  const L = DATA.lines.find(l => t >= l.st - .05 && t <= l.st + l.dur + .35); if (!L) return;
  const a = sstep(L.st - .05, L.st + .18, t) * (1 - sstep(L.st + L.dur + .05, L.st + L.dur + .35, t));
  const col = { GHOST: [190, 235, 255], GRAND: [200, 225, 255], N: [235, 235, 225] }[L.sp] || [255, 255, 255];
  const ital = (L.sp === 'N' || L.sp === 'GHOST' || L.sp === 'GRAND');
  c.save(); c.globalAlpha = a; c.font = `${ital ? 'italic ' : ''}600 40px Inter, DejaVu Sans, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  const words = L.text.split(' '), lines = []; let cur = '';
  for (const w of words) { const tst = cur ? cur + ' ' + w : w; if (c.measureText(tst).width > 1380 && cur) { lines.push(cur); cur = w; } else cur = tst; } lines.push(cur);
  const lh = 54, y0 = 1010 - (lines.length - 1) * lh;
  const tw = Math.max(...lines.map(s => c.measureText(s).width)) + 70; c.fillStyle = 'rgba(2,6,10,.55)';
  const bh = lines.length * lh + 22, bx = W / 2 - tw / 2, by = y0 - lh / 2 - 8; c.beginPath(); c.roundRect(bx, by, tw, bh, 18); c.fill();
  lines.forEach((s, i) => { c.lineWidth = 6; c.lineJoin = 'round'; c.strokeStyle = 'rgba(0,0,0,.85)'; c.strokeText(s, W / 2, y0 + i * lh); c.fillStyle = rgbs(col); c.fillText(s, W / 2, y0 + i * lh); });
  c.restore();
}
window.renderFrame = function (f, quality = .93) {
  const t = f / FPS, n = blurSamples(t);
  if (n <= 1) drawWorld(scx, t);
  else for (let i = 0; i < n; i++) { const tt = t + ((i + .5) / n - .5) * (.5 / FPS) * 1; drawWorld(scx, tt); acx.globalAlpha = i === 0 ? 1 : 1 / (i + 1); acx.drawImage(SC, 0, 0); }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const sc = sceneAt(t); postFx(ctx, n <= 1 ? SC : AC, t, sc.fx || {});
  subtitle(ctx, t);
  const fade = 1 - sstep(0, 2.4, t) + sstep(TOTAL - 3.2, TOTAL - .2, t); if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${clamp(fade)})`; ctx.fillRect(0, 0, W, H); }
  return quality ? cv.toDataURL('image/jpeg', quality) : null;
};
