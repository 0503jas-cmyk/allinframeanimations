# builds build/data.json (lines + lip-sync envelope per line @60fps + events) and subtitles .srt
import json, subprocess, numpy as np
S=json.load(open('script.json')); L=json.load(open('timeline_lines.json')); ev=json.load(open('events.json'))
lip={}
for l in L:
    raw=subprocess.check_output(['ffmpeg','-v','error','-i',f"audio/lines/{l['id']}.mp3",'-f','f32le','-ac','1','-ar','16000','-'])
    x=np.frombuffer(raw,dtype=np.float32); n=int(l['dur']*60)+2; hop=16000/60
    env=np.array([np.sqrt(np.mean(x[max(0,int(i*hop-hop*.7)):int(i*hop+hop*.7)+1]**2)+1e-12) if int(i*hop)<len(x) else 0 for i in range(n)])
    env=env/(np.percentile(env,92)+1e-9); env=np.clip(env,0,1)
    # smooth + gate
    k=np.array([.25,.5,.25]); env=np.convolve(env,k,mode='same'); env=np.where(env<.08,0,env)
    lip[l['id']]=[round(float(v),3) for v in env]
data={'lines':[{'id':l['id'],'sp':l['sp'],'text':l['text'],'st':l['st'],'dur':l['dur']} for l in L],'scenes':S['scenes'],'lip':lip,'events':ev}
json.dump(data,open('build/data.json','w'))
def ts(s):
    h=int(s//3600); m=int(s%3600//60); sec=s%60; return f"{h:02d}:{m:02d}:{int(sec):02d},{int(round((sec-int(sec))*1000)):03d}"
with open('out/The_Drowned_Meridian.en.srt','w') as f:
    for i,l in enumerate(L,1):
        f.write(f"{i}\n{ts(l['st'])} --> {ts(l['st']+l['dur']+.15)}\n{l['text']}\n\n")
print('ok',len(L),'lines; srt written')
