import re, json
lines=json.load(open('audio/lines.json'))
byid={}
for bid,ls in lines.items():
    who=bid.split('_')[1]
    for l in ls: byid[l['id']]=dict(l,who=who,file=f"{bid}.mp3")
LONG=re.compile(r'chase|roars|escape|flies|launch|ride|dodges|smashes|swings|crawl|stampede|burst|rises|swallows|slams|Time cut|Epilogue|Title card|slow motion',re.I)
scenes=[]; cur=None
for ln in open('SCRIPT.md'):
    ln=ln.rstrip('\n')
    m=re.match(r'## (S\d+) (.*)',ln)
    if m:
        cur={'id':m.group(1).lower(),'title':m.group(2),'items':[]}; scenes.append(cur); continue
    if cur is None: continue
    m=re.match(r'\[(s\d+\.\d+)\] ([A-Z]+): ',ln)
    if m: cur['items'].append({'type':'line','id':m.group(1)}); continue
    if ln.startswith('ACTION:'): cur['items'].append({'type':'action','text':ln[7:].strip()})
t=6.0; out=[]
for sc in scenes:
    sc_start=t; items=[]
    for it in sc['items']:
        if it['type']=='action':
            d=9.0 if LONG.search(it["text"]) else 5.5
            items.append({'type':'action','text':it['text'],'start':round(t,3),'end':round(t+d,3)}); t+=d
        else:
            l=byid[it['id']]; d=l['end']-l['start']
            items.append({'type':'line','id':l['id'],'who':l['who'],'text':l['text'],'file':l['file'],'src_start':l['start'],'src_end':l['end'],'start':round(t,3),'end':round(t+d,3)}); t+=d+0.35
    t+=2.5
    out.append({'id':sc['id'],'title':sc['title'],'start':round(sc_start,3),'end':round(t,3),'items':items})
json.dump(out,open('audio/timeline.json','w'),indent=1)
print('total',round(t,1),'s =',round(t/60,2),'min')
for s in out: print(s['id'],s['title'],round(s['end']-s['start'],1))
