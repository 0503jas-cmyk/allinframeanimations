const {chromium}=require('playwright');const fs=require('fs');
const [,, k, n, from, to]=process.argv.map(Number); // worker k of n, frame range
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:process.env.V?{width:1080,height:1920}:{width:1920,height:1080}});
  p.on('pageerror',e=>console.log('PAGEERR',e.message));
  await p.goto('file://'+__dirname+'/anim.html'+(process.env.V?'?v=1':''));const el=await p.$('#c');
  fs.mkdirSync((process.env.V?'frames_v':'frames'),{recursive:true});
  for(let i=from+k;i<to;i+=n){
    const f=`${process.env.V?'frames_v':'frames'}/f${String(i).padStart(5,'0')}.jpg`;
    if(fs.existsSync(f))continue;
    await p.evaluate(t=>renderAt(t),i/60);
    await el.screenshot({path:f,type:'jpeg',quality:96});
    if(i%60===k)console.log('frame',i);
  }
  await b.close();
})();
