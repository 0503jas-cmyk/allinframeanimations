// Рендер всех кадров 0..N-1 (t = i/60) параллельно, каждый воркер кодирует свой отрезок в mp4 через ffmpeg.
const {chromium}=require('playwright');const {spawn}=require('child_process');
const out=process.argv[2];const N=+process.argv[3]||3600;const WORKERS=+process.argv[4]||4;const QS=process.argv[5]||'';const VW=QS.includes('v=1')?1080:1920,VH=QS.includes('v=1')?1920:1080;
async function worker(w,a,b){
 const br=await chromium.launch();const p=await br.newPage({viewport:{width:VW,height:VH}});
 p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('file://'+__dirname+'/index.html'+QS);await p.waitForFunction('window.ready');
 const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','60','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','14','-pix_fmt','yuv420p','-r','60','-g','60','-bf','2',`${out}/seg_${w}.mp4`],{stdio:['pipe','inherit','inherit']});
 for(let i=a;i<b;i++){
  const d=await p.evaluate(i=>{renderFrame(i);return document.getElementById('c').toDataURL('image/jpeg',0.97)},i);
  const buf=Buffer.from(d.split(',')[1],'base64');
  if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));
  if(i%200===0)console.log('w'+w,i);
 }
 ff.stdin.end();await new Promise(r=>ff.on('close',r));await br.close();
}
(async()=>{const per=Math.ceil(N/WORKERS);const ps=[];
 for(let w=0;w<WORKERS;w++){const a=w*per,b=Math.min(N,a+per);if(a<b)ps.push(worker(w,a,b))}
 await Promise.all(ps);console.log('done');})();
