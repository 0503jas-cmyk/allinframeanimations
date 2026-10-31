// Usage:
//   node render.js stills out_dir t1 t2 ...        -> PNG stills
//   node render.js chunk out.mp4 frameStart frameEnd -> H.264 chunk (lossless-ish intermediate)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path'), fs = require('fs');
(async () => {
  const [mode, out, ...rest] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-web-security', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('console', m => { if (m.type() === 'error') console.error('PAGE:', m.text()); });
  page.on('pageerror', e => console.error('PAGEERR:', e.message));
  await page.goto('file://' + path.resolve(__dirname, 'src/index.html') + '?render=1');
  await page.evaluate(() => window.READY);
  const grab = async (t) => {
    const b64 = await page.evaluate(t => { renderAt(t); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, t);
    return Buffer.from(b64, 'base64');
  };
  if (mode === 'stills') {
    fs.mkdirSync(out, { recursive: true });
    for (const s of rest) { const t0 = Date.now(); fs.writeFileSync(path.join(out, `t${(+s).toFixed(2).padStart(7, '0')}.png`), await grab(+s)); console.log(s, Date.now() - t0, 'ms'); }
  } else if (mode === 'chunk') {
    const [f0, f1] = rest.map(Number), fps = 60;
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '12', '-pix_fmt', 'yuv420p', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = f0; f < f1; f++) {
      const b64 = await page.evaluate(t => { renderAt(t); return document.getElementById('c').toDataURL('image/jpeg', 0.96).split(',')[1]; }, f / fps);
      if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
      if ((f - f0) % 300 === 0) console.log(`${out} frame ${f} (${((Date.now() - t0) / Math.max(1, f - f0)).toFixed(0)} ms/f)`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
