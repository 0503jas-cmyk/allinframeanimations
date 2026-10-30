const {chromium}=require('playwright');
(async()=>{
  const times=process.argv.slice(2).map(Number);
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
  p.on('pageerror',e=>console.log('PAGEERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
  await p.goto('file://'+__dirname+'/anim.html');
  const el=await p.$('#c');
  for(const t of times){const t0=Date.now();await p.evaluate(t=>renderAt(t),t);const t1=Date.now();await el.screenshot({path:`shots/t${t.toFixed(2)}.png`});console.log(t,'render',t1-t0,'ms shot',Date.now()-t1);}
  await b.close();
})();
