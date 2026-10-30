"""words.json -> subtitles.srt (readable phrases, not the karaoke chunks burned into the video)"""
import json, sys
w = json.load(open(sys.argv[1])); out = sys.argv[2]
def ts(t):
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}".replace(',1000', ',999')
cues, cur = [], []
for x in w:
    cur.append(x)
    txt = ' '.join(a[0] for a in cur)
    end = x[0].endswith(('.', '?', '!', ':', '...')) or (x[0].endswith(',') and len(cur) >= 3)
    if end or len(cur) >= 7 or len(txt) > 38:
        cues.append(cur); cur = []
if cur: cues.append(cur)
lines = []
for i, c in enumerate(cues):
    a = c[0][1]; b = c[-1][2] + .25
    if i + 1 < len(cues): b = min(b, cues[i + 1][0][1] - .02)
    txt = ' '.join(x[0] for x in c)
    if len(txt) > 28 and ' ' in txt:  # balance into two lines
        words = txt.split(' '); best = min(range(1, len(words)), key=lambda k: abs(len(' '.join(words[:k])) - len(' '.join(words[k:]))))
        txt = ' '.join(words[:best]) + '\n' + ' '.join(words[best:])
    lines.append(f"{i + 1}\n{ts(a)} --> {ts(b)}\n{txt}\n")
open(out, 'w').write('\n'.join(lines))
print(len(cues), 'cues')
