const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+__dirname+'/anim.html');
const ev=await p.evaluate(()=>window.stepEvents());require('fs').writeFileSync('steps.json',JSON.stringify(ev));console.log(ev.length);await b.close()})();
