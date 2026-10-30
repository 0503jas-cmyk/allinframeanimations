const {chromium}=require('playwright');
(async()=>{const times=process.argv.slice(2).map(Number);
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
 p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto('file://'+__dirname+'/anim.html?v=1');const el=await p.$('#c');
 for(const t of times){await p.evaluate(t=>renderAt(t),t);await el.screenshot({path:`shots/v${t.toFixed(2)}.png`});}
 await b.close();})();
