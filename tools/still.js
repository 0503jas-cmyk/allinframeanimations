// usage: node tools/still.js out_prefix t1 t2 ...  -> out_prefix_<t>.jpg
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const [prefix, ...ts] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--no-sandbox', '--font-render-hinting=none'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('console', m => console.log('[page]', m.text())); p.on('pageerror', e => console.log('[pageerror]', e.message));
  await p.goto('file://' + path.resolve('src/main.html')); await p.evaluate(async () => { await document.fonts.load('600 100px Cinzel'); await document.fonts.load('400 100px Cinzel'); await document.fonts.load('italic 600 40px Inter'); await document.fonts.load('600 40px Inter'); await document.fonts.ready; });
  const data = JSON.parse(fs.readFileSync('build/data.json', 'utf8')); await p.evaluate(d => setData(d), data);
  for (const t of ts) { const t0 = Date.now(); const url = await p.evaluate(f => renderFrame(f, 0.9), Math.round(parseFloat(t) * 60)); fs.writeFileSync(`${prefix}_${t}.jpg`, Buffer.from(url.split(',')[1], 'base64')); console.log(t, 'ms', Date.now() - t0); }
  await b.close();
})();
