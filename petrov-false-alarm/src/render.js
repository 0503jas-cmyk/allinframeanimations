// usage: node render.js <outDir> <startFrame> <endFrame> [step]   (or: node render.js stills out t1 t2 ...)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [mode, out, a, b, step] = process.argv.slice(2);
  if (mode !== 'thumb') fs.mkdirSync(out, { recursive: true });
  const br = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const pg = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  pg.on('pageerror', e => console.error('PAGEERR', e.message)); pg.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await pg.goto('file://' + path.resolve(__dirname, 'index.html'));
  await pg.evaluate(() => window.ready);
  const grab = async (t, name) => {
    const d = await pg.evaluate(t => { renderFrame(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93); }, t);
    fs.writeFileSync(path.join(out, name), Buffer.from(d.split(',')[1], 'base64'));
  };
  if (mode === 'thumb') { const d = await pg.evaluate(() => { renderThumb(); return document.getElementById('c').toDataURL('image/png'); }); fs.writeFileSync(out, Buffer.from(d.split(',')[1], 'base64')); }
  else if (mode === 'stills') { for (const t of process.argv.slice(4)) await grab(+t, `t${(+t).toFixed(2)}.jpg`); await grab(+process.argv[4], 'x.jpg').catch(()=>{}); }
  else { const s = +a, e = +b, st = +(step || 1); for (let f = s; f < e; f += st) { await grab(f / 30, `f${String(f).padStart(5, '0')}.jpg`); } }
  await br.close();
})();
