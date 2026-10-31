// usage: node tools/render.js f0 f1 out.mp4  — renders frames [f0,f1) at 60 fps straight into x264 (intermediate, near-lossless)
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const BASE = process.env.SNAP || '.'; const [f0, f1, out] = [parseInt(process.argv[2]), parseInt(process.argv[3]), process.argv[4]];
  const b = await chromium.launch({ args: ['--no-sandbox', '--font-render-hinting=none'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => { console.error('[pageerror]', e.message); process.exitCode = 3; });
  await p.goto('file://' + path.resolve(BASE + '/src/main.html'));
  await p.evaluate(async () => { await document.fonts.load('600 100px Cinzel'); await document.fonts.load('400 100px Cinzel'); await document.fonts.load('italic 600 40px Inter'); await document.fonts.load('600 40px Inter'); await document.fonts.ready; });
  await p.evaluate(d => setData(d), JSON.parse(fs.readFileSync(BASE + '/build/data.json', 'utf8')));
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '13', '-pix_fmt', 'yuv420p', '-x264-params', 'keyint=60:min-keyint=60:scenecut=0', '-r', '60', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    const url = await p.evaluate(fr => renderFrame(fr, 0.95), f); const buf = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - f0) % 120 === 119) console.log(`[${f0}-${f1}] ${f - f0 + 1}/${f1 - f0} ${((Date.now() - t0) / (f - f0 + 1)).toFixed(0)} ms/frame`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('done', out, ((Date.now() - t0) / 1000).toFixed(1), 's');
})();
