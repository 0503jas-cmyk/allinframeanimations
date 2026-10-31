const {chromium}=require('playwright');const fs=require('fs');
const out=process.argv[2];const times=process.argv.slice(3).map(Number);
(async()=>{
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
 p.on('console',m=>console.log('console:',m.text()));p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('file://'+__dirname+'/index.html?v=1&lang=en');await p.waitForFunction('window.ready');
 for(const t of times){const i=Math.round(t*60);const t0=Date.now();
  const d=await p.evaluate(i=>{renderFrame(i);return document.getElementById('c').toDataURL('image/jpeg',0.9)},i);
  fs.writeFileSync(`${out}/f_${t}.jpg`,Buffer.from(d.split(',')[1],'base64'));console.log(t,Date.now()-t0,'ms');}
 await b.close();})();
