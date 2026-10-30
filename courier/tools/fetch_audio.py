import json, glob, os, subprocess, sys
D='/root/.claude/projects/-home-user-allinframeanimations/f724a1fa-d817-5f6b-bc21-03437bd1e218/tool-results/'
blocks=json.load(open('audio/blocks.json'))
by={ "\n\n".join(b['lines']).strip(): b['id'] for b in blocks}
done=set()
for f in sorted(glob.glob(D+'mcp-ElevenLabs-creative_get_flow_run_status-*.txt')):
    try: j=json.load(open(f))
    except Exception: continue
    for g in j.get('generations',[]):
        if g.get('status')!='completed': continue
        # full prompt may be truncated in file; match by prefix
        p=g['prompt'].strip()
        m=[k for k in by if k.startswith(p) or p.startswith(k[:len(p)])]
        m=[k for k in m if k[:60]==p[:60]]
        if len(m)!=1: print('nomatch',p[:50],len(m)); continue
        bid=by[m[0]]; out=f'audio/{bid}.mp3'
        if not os.path.exists(out):
            subprocess.check_call(['curl','-sS','-o',out,g['content_url']])
        done.add(bid)
print(len(done),'downloaded; missing:',[b['id'] for b in blocks if b['id'] not in done])
