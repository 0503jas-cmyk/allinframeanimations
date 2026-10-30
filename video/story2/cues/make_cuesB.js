// Regenerates story2/cues/ch5..ch9.json from src/data/timing/chN.json + layout (lead). Chapter-clock seconds.
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..','..');
const LEAD={5:2,6:2,7:2,8:2,9:2};
const TAIL={5:4,6:4,7:4,8:4,9:16};
const dur=JSON.parse(fs.readFileSync(path.join(root,'src/data/durations.json')));
for(const n of [5,6,7,8,9]){
  const T=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root,`src/data/timing/ch${n}.json`))).map(s=>[s.id,s]));
  const L=LEAD[n],total=L+dur[n]+TAIL[n];
  const c=(i)=>+(T[`c${n}.${String(i).padStart(2,'0')}`].start+L).toFixed(2);
  const e=(i)=>+(T[`c${n}.${String(i).padStart(2,'0')}`].end+L).toFixed(2);
  const sfx=[],beds=[{from:0,to:total,name:'tide',gain:n==8?0.5:0.35}],music=[];
  const S=(t,name,gain)=>sfx.push({t:+t.toFixed(2),name,gain});
  if(n==5){
    music.push({from:0,to:c(21)-1,mood:'tense'},{from:e(21)+2,to:total,mood:'sorrow'});
    S(c(5)+1,'scratch',.3);S(c(14),'creak',.4);S(c(15),'creak',.4);S(c(20),'creak',.3);S(c(25)+0.5,'tide_wash',.7);S(e(26)-0.3,'bell',.3);
    for(let i=0;i<6;i++)S(c(7)+i*0.9,'tick',.15);S(c(24)+1,'scratch',.5);
  }
  if(n==6){
    music.push({from:0,to:total,mood:'tense'});
    S(c(2)+1,'scratch',.2);S(c(5),'page_turn',.2);S(c(8)+0.8,'tick',.4);
    for(let i=0;i<14;i++)S(c(9)+0.5+i*1.0,'tick',.2);
    S(c(19)+3,'thump',.3);S(c(23),'creak',.4);S(c(27),'creak',.3);
  }
  if(n==7){
    music.push({from:0,to:c(19)-1,mood:'tense'},{from:c(19)-1,to:c(30),mood:'sorrow'},{from:c(30),to:total,mood:'tense'});
    S(c(6),'page_turn',.3);S(c(10),'creak',.2);S(c(14),'scratch',.2);S(c(15),'scratch',.2);S(c(16)+0.5,'scratch',.2);
    for(let i=0;i<9;i++)S(c(22)+1.6+i*1.65,'bell',.7);
    S(c(19)+0.6,'creak',.4);S(c(31)+0.3,'scratch',.4);S(c(32),'scratch',.4);
  }
  if(n==8){
    music.push({from:0,to:c(18),mood:'sorrow'},{from:c(18),to:c(27)-1.2,mood:'tense'},{from:c(27)+1,to:total,mood:'release'});
    S(c(3)+0.2,'bell',.7);S(c(4),'tide_wash',.8);S(c(13),'bell',.8);S(c(14)+0.4,'bell',.9);S(c(18),'thump',.3);
    for(let i=0;i<5;i++)S(c(25)+0.3+i*1.6,'bell',.6);
    S(c(28),'scratch',.3);S(c(29)+2,'page_turn',.3);S(c(32),'scratch',.3);S(c(35)+0.6,'scratch',.5);S(c(38)+2.2,'scratch',.5);
  }
  if(n==9){
    music.push({from:0,to:total,mood:'release'});
    [-0.2,1.4,2.9,4.4,5.6].forEach(d=>S(c(1)+d,'bell',.6));
    S(c(2)+3,'scratch',.3);S(c(3)+1.8,'scratch',.4);S(c(5)-0.3,'scratch',.4);S(c(6)-0.2,'scratch',.5);S(e(6)+5,'bell',.3);
  }
  sfx.sort((a,b)=>a.t-b.t);
  fs.writeFileSync(path.join(__dirname,`ch${n}.json`),JSON.stringify({music,beds,sfx},null,1));
}
console.log('ok');
