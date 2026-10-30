import json, subprocess, re
blocks=json.load(open('audio/blocks.json'))
res={}
bad=[]
for b in blocks:
    f=f"audio/{b['id']}.mp3"
    dur=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
    n=len(b['lines'])
    if n==1:
        res[b['id']]=[{'id':b['ids'][0],'text':b['lines'][0],'start':0.0,'end':dur}]; continue
    out=subprocess.run(['ffmpeg','-i',f,'-af','silencedetect=noise=-30dB:d=0.07','-f','null','-'],capture_output=True,text=True).stderr
    st=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',out)]
    en=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',out)]
    gaps=[(e-s,s,e) for s,e in zip(st,en) if s>0.05 and e<dur-0.05]
    # expected boundary positions proportional to character counts
    tot=sum(len(t) for t in b['lines']); acc=0; exp=[]
    for t in b['lines'][:-1]:
        acc+=len(t)+1; exp.append(acc/(tot+len(b['lines'])))
    # speech extent
    span0=min([g[2] for g in gaps if g[1]<0.3] or [0.0]); 
    sel=[]; used=set()
    for ex in exp:
        tgt=ex*dur
        best=None
        for gi,g in enumerate(gaps):
            if gi in used: continue
            score=abs((g[1]+g[2])/2-tgt)-4.0*(g[0])
            if best is None or score<best[0]: best=(score,gi)
        if best: used.add(best[1]); sel.append(gaps[best[1]])
    sel.sort(key=lambda g:g[1])
    if len(sel)<n-1: bad.append((b['id'],len(sel),n-1))
    cuts=[0.0]+[ (g[1]+g[2])/2 for g in sel]+[dur]
    res[b['id']]=[]
    for i,(i_id,t) in enumerate(zip(b['ids'],b['lines'])):
        if i+1<len(cuts):
            s=cuts[i]; e=cuts[i+1]
            # trim to speech: use gap edges
            ss = sel[i-1][2] if i>0 and i-1<len(sel) else 0.0
            ee = sel[i][1] if i<len(sel) else dur
            res[b['id']].append({'id':i_id,'text':t,'start':round(ss,3),'end':round(ee,3)})
json.dump(res,open('audio/lines.json','w'),indent=1)
print('bad',bad)
for k,v in res.items():
    print(k,[round(x['end']-x['start'],1) for x in v])
