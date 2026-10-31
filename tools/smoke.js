// render one frame every N seconds across the film to catch exceptions + timing
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const step = parseFloat(process.argv[2] || 4); const b = await chromium.launch({ args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); let errs = 0;
  p.on('pageerror', e => { errs++; console.log('[pageerror]', e.message.slice(0, 200)); });
  await p.goto('file://' + path.resolve('src/main.html')); await p.evaluate(async () => { await document.fonts.load('600 100px Cinzel'); await document.fonts.load('italic 600 40px Inter'); });
  await p.evaluate(d => setData(d), JSON.parse(fs.readFileSync('build/data.json', 'utf8')));
  let tot = 0, n = 0, mx = 0, mxT = 0;
  for (let t = 0; t < 720; t += step) { const t0 = Date.now(); try { await p.evaluate(f => renderFrame(f, 0.85), Math.round(t * 60)); } catch (e) { console.log('ERR at', t, e.message.slice(0, 200)); errs++; } const d = Date.now() - t0; tot += d; n++; if (d > mx) { mx = d; mxT = t; } }
  console.log('frames', n, 'avg ms', (tot / n).toFixed(0), 'max', mx, 'at', mxT, 'errors', errs); await b.close();
})();
