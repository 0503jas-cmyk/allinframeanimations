"""Corrects word start times in the ElevenLabs transcript: after a pause the transcript's word 'start' includes the silence,
so for the first word of each punctuation-delimited phrase we move the start to the real speech onset (voice-activity detection on the audio).
usage: python3 -I fix_words.py narration.mp3 words_scribe.json words.json data.js"""
import numpy as np, subprocess, json, re, sys
mp3, src, dst, datajs = sys.argv[1:5]
SR = 22050
x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', mp3, '-ac', '1', '-f', 'f32le', '-ar', str(SR), '-'], capture_output=True).stdout, np.float32)
hop = int(.01 * SR); n = len(x) // hop
db = 20 * np.log10(np.array([np.sqrt((x[i * hop:(i + 1) * hop] ** 2).mean()) for i in range(n)]) + 1e-7)
act = db > -42
w = json.load(open(src))
ph = []; cur = []
for a in w:
    cur.append(a)
    if re.search(r'[.,?:!]$|\.\.\.$', a[0]): ph.append(cur); cur = []
if cur: ph.append(cur)
moved = 0
for p in ph:
    S, E = p[0][1], p[-1][2]
    i = int(max(0, S - .15) * 100)
    while i < min(n - 3, int(E * 100)) and not act[i:i + 3].all(): i += 1
    onset = i / 100
    if onset - S > .1 and onset < p[0][2] + .6:
        p[0][1] = round(onset, 3); moved += 1
        if p[0][2] < p[0][1] + .08: p[0][2] = round(p[0][1] + .12, 3)
json.dump(w, open(dst, 'w'))
d = json.loads(open(datajs).read()[len('window.DATA='):-2]); d['words'] = w
open(datajs, 'w').write('window.DATA=' + json.dumps(d) + ';\n')
print('phrases', len(ph), 'starts corrected', moved)
