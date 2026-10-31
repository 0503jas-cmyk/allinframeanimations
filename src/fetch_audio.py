import json, sys, subprocess, os, glob
script = json.load(open('script.json'))
by_text = {l['text'].strip(): l['id'] for l in script['lines']}
n=0
for path in sys.argv[1:]:
    d = json.load(open(path))
    gens = d.get('generations') or []
    # sometimes multi-session answers are a list of per-session dicts
    if isinstance(d, list): gens = [g for x in d for g in x.get('generations', [])]
    for g in gens:
        if g.get('status') != 'completed': print('NOT READY', g.get('prompt')); continue
        lid = by_text.get(g['prompt'].strip())
        if not lid: print('UNMATCHED', g['prompt']); continue
        out = f'audio/lines/{lid}.mp3'
        if os.path.exists(out) and os.path.getsize(out) > 1000: continue
        r = subprocess.run(['curl','-sS','-m','90','-o',out,'-w','%{http_code}',g['content_url']],capture_output=True,text=True)
        print(lid, r.stdout, os.path.getsize(out) if os.path.exists(out) else 0, g.get('duration_secs')); n+=1
print('downloaded', n)
