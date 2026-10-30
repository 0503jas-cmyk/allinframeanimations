#!/usr/bin/env python3
"""Build the film's audio: voices (placed from timeline), synthesized music per scene mood, SFX derived from the shot plans."""
import json, os, re, subprocess, sys, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, '..', 'video', 'tools'))
import synth as S
SR = S.SR
OUT = sys.argv[1] if len(sys.argv) > 1 else f'{ROOT}/out/audio'
os.makedirs(OUT, exist_ok=True)
tl = json.load(open(f'{ROOT}/audio/timeline.json'))
TOTAL = tl[-1]['end']
N = int(TOTAL * SR) + SR * 2
rng = np.random.default_rng(7)

def tone(f, sec, kind='sine', gain=0.2, a=0.005, d=0.15):
    t = np.arange(int(sec * SR)) / SR
    if kind == 'saw': x = 2 * ((f * t) % 1) - 1
    elif kind == 'square': x = np.sign(np.sin(2 * np.pi * f * t))
    elif kind == 'tri': x = 2 * np.abs(2 * ((f * t) % 1) - 1) - 1
    else: x = np.sin(2 * np.pi * f * t)
    e = np.minimum(1, t / a) * np.exp(-t / d)
    return (x * e * gain).astype(np.float32)

def kick(g=0.7):
    t = np.arange(int(0.28 * SR)) / SR
    f = 50 + 120 * np.exp(-t * 28)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)
    return (x * g).astype(np.float32)

def snare(g=0.4):
    t = np.arange(int(0.22 * SR)) / SR
    x = (rng.standard_normal(len(t)) * 0.8 + np.sin(2 * np.pi * 190 * t) * 0.5) * np.exp(-t * 22)
    return (x * g).astype(np.float32)

def hat(g=0.12, op=False):
    t = np.arange(int((0.16 if op else 0.05) * SR)) / SR
    x = rng.standard_normal(len(t)); x = np.diff(x, prepend=0)
    return (x * np.exp(-t * (18 if op else 70)) * g).astype(np.float32)

def tom(f=90, g=0.8):
    t = np.arange(int(0.5 * SR)) / SR
    fr = f + 40 * np.exp(-t * 14)
    return (np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 6) * g).astype(np.float32)

def whoosh(sec=0.7, g=0.3, up=True):
    n = int(sec * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n)
    x = S.fft_filter(x, lo=300, hi=6000)
    e = np.sin(np.pi * (t / sec) ** (0.6 if up else 1.6)) ** 2
    return (x * e * g / (np.abs(x).max() + 1e-6)).astype(np.float32)

def boom(sec=1.6, g=0.7):
    t = np.arange(int(sec * SR)) / SR
    x = np.sin(2 * np.pi * (38 + 60 * np.exp(-t * 6)) * t) * np.exp(-t * 3) + S.fft_filter(rng.standard_normal(len(t)), hi=900) * np.exp(-t * 5) * 0.8
    return (x * g).astype(np.float32)

def honk(g=0.5):  # duck horn: two nasal quacks
    out = np.zeros(int(0.6 * SR), dtype=np.float32)
    for k, st in enumerate([0.0, 0.26]):
        t = np.arange(int(0.2 * SR)) / SR
        f = 520 - 120 * t / 0.2 + 18 * np.sin(2 * np.pi * 40 * t)
        x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5 + np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5
        x = S.fft_filter(x, lo=300, hi=2600) * np.minimum(1, t / 0.01) * np.exp(-t * 7)
        i = int(st * SR); out[i:i + len(x)] += x.astype(np.float32) * g
    return out

def groan(g=0.35, sec=1.6):
    t = np.arange(int(sec * SR)) / SR
    f = 95 + 25 * np.sin(2 * np.pi * 0.7 * t) + 12 * rng.random()
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.6 * np.sin(2 * np.pi * np.cumsum(f * 2) / SR)
    x = x * (1 + 0.4 * np.sin(2 * np.pi * 7 * t))
    x = S.fft_filter(x + rng.standard_normal(len(t)) * 0.25, lo=80, hi=1200)
    e = np.sin(np.pi * t / sec) ** 1.5
    return (x * e * g / (np.abs(x).max() + 1e-6)).astype(np.float32)

def engine(sec, g=0.18, rate=1.0):
    t = np.arange(int(sec * SR)) / SR
    base = 70 * rate * (1 + 0.04 * np.sin(2 * np.pi * 3.1 * t))
    ph = np.cumsum(base) / SR
    x = sum(np.sin(2 * np.pi * ph * h) / h for h in (1, 2, 3, 4, 6)) * (0.7 + 0.3 * np.sign(np.sin(2 * np.pi * ph * 2)))
    x = S.fft_filter(x + rng.standard_normal(len(t)) * 0.12, lo=50, hi=1800)
    e = np.minimum(1, t / 0.4) * np.minimum(1, (sec - t) / 0.4)
    return (x * e * g / (np.abs(x).max() + 1e-6)).astype(np.float32)

def crash(g=0.6):
    t = np.arange(int(1.0 * SR)) / SR
    x = S.fft_filter(rng.standard_normal(len(t)), lo=200, hi=7000) * np.exp(-t * 5)
    return (x * g / (np.abs(x).max() + 1e-6)).astype(np.float32)

def chime(f, g=0.12, sec=2.5):
    t = np.arange(int(sec * SR)) / SR
    x = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3)
    return (x * np.exp(-t * 2.2) * g).astype(np.float32)

bed = np.zeros(N, dtype=np.float32)
def put(clip, at, gain=1.0): S.place(bed, clip, at, gain)

# ------------------------------------------------------------------ music
MIN = [0, 3, 5, 7, 10]
def n(f0, semi): return f0 * 2 ** (semi / 12)

def music(style, sec, t0):
    """add music of `style` for `sec` seconds starting at global t0"""
    A = 110.0
    if style in ('groove', 'chase'):
        bpm = 128 if style == 'groove' else 148
        beat = 60 / bpm; k = 0; t = 0.0
        root = [0, 0, 5, 3][0]
        prog = [0, 0, 5, 7]
        while t < sec - 0.05:
            bar = int(k // 4) % 4; step = k % 4
            if style == 'chase' or step in (0, 2): put(kick(0.55), t0 + t)
            if step in (1, 3): put(snare(0.32), t0 + t)
            for h in range(2): put(hat(0.10, op=(h == 1 and step % 2 == 1)), t0 + t + h * beat / 2)
            sh = prog[bar]
            for q in range(2):
                f = n(A, sh + [0, 12, 7, 10][(k * 2 + q) % 4]) / 2
                put(tone(f, beat / 2, 'saw', 0.10, 0.004, 0.12), t0 + t + q * beat / 2)
            if step == 0: put(tone(n(A * 2, sh), beat * 2, 'saw', 0.045, 0.02, 0.4), t0 + t)
            t += beat; k += 1
    elif style == 'tense':
        put(S.pad([55.0, 58.27, 82.41, 110.0], sec + 3, bright=0.2, swell=6.0, gain=0.11), t0 - 1.5)
        t = 0.0
        while t < sec - 0.5:
            put(kick(0.35), t0 + t); put(kick(0.22), t0 + t + 0.3); t += 1.25
        t = 2.0
        while t < sec - 1:
            put(S.pluck(n(A * 4, MIN[rng.integers(0, 5)]), 2.0, 0.035), t0 + t); t += rng.uniform(2.5, 5.5)
    elif style == 'sad':
        put(S.pad([73.42, 110.0, 174.61, 261.63], sec + 3, bright=0.25, swell=7.0, gain=0.12), t0 - 1.5)
        t = 1.0; k = 0
        mel = [0, 3, 7, 5, 3, 0, -2, 0]
        while t < sec - 1:
            put(S.pluck(n(A * 4, mel[k % 8]), 3.0, 0.07), t0 + t); t += 1.9; k += 1
    elif style == 'warm':
        put(S.pad([98.0, 146.83, 196.0, 293.66], sec + 3, bright=0.45, swell=6.0, gain=0.12), t0 - 1.5)
        t = 0.5; k = 0
        for k in range(10000):
            if t > sec - 1: break
            put(S.pluck(n(A * 4, [0, 4, 7, 12, 7, 4][k % 6]), 2.2, 0.06), t0 + t); t += 0.55
    elif style == 'waltz':
        bpm = 150; beat = 60 / bpm; t = 0.0; k = 0
        mel = [0, 3, 7, 12, 10, 7, 3, 5, 7, 3, 0, 3]
        while t < sec - 0.1:
            step = k % 3
            put(tone(n(A, [0, 0, 5, 3][(k // 6) % 4]) / 2, beat, 'tri', 0.12 if step == 0 else 0.05, 0.005, 0.25), t0 + t)
            if step == 0: put(chime(n(A * 4, mel[(k // 3) % len(mel)]), 0.07, 1.6), t0 + t)
            t += beat; k += 1
    elif style == 'drums':
        t = 0.0
        while t < sec - 0.2:
            put(tom(80, 0.9), t0 + t); put(tom(110, 0.6), t0 + t + 0.4); put(tom(80, 0.9), t0 + t + 0.8); t += 1.2
        put(S.pad([49.0, 73.42], sec + 2, bright=0.15, swell=4.0, gain=0.10), t0 - 1)
    elif style == 'jingle':
        notes = [0, 4, 7, 12, 7, 4, 9, 5, 9, 12, 9, 5]
        t = 0.0; k = 0
        while t < sec - 0.2:
            put(chime(n(A * 4, notes[k % len(notes)]), 0.10, 0.6), t0 + t); t += 0.28; k += 1
    elif style == 'epic':
        bpm = 140; beat = 60 / bpm; t = 0.0; k = 0
        prog = [0, 5, 3, 7]
        while t < sec - 0.05:
            step = k % 4; sh = prog[(k // 4) % 4]
            put(kick(0.6), t0 + t);
            if step in (1, 3): put(tom(70, 0.7), t0 + t)
            put(hat(0.10), t0 + t + beat / 2)
            if step == 0:
                for d in (0, 7, 12): put(tone(n(A * 2, sh + d), beat * 4, 'saw', 0.05, 0.03, 1.2), t0 + t)
            put(tone(n(A, sh) / 2, beat, 'saw', 0.10, 0.004, 0.16), t0 + t)
            t += beat; k += 1
    elif style == 'quiet':
        put(S.pad([55.0, 82.41, 110.0], sec + 3, bright=0.15, swell=8.0, gain=0.09), t0 - 1.5)

MUSIC = {  # scene -> [(from, to, style)] relative seconds ; to=None -> scene end
    's01': [(0, 19, 'groove'), (19, 31, 'tense'), (31, 57, 'chase'), (57, None, 'epic')],
    's02': [(0, 14, 'warm'), (14, 82, 'quiet'), (82, None, 'groove')],
    's03': [(0, 24, 'tense'), (24, 43, 'tense'), (43, 55, 'chase'), (55, None, 'chase')],
    's04': [(0, 30, 'tense'), (30, 43, 'chase'), (43, 54, 'jingle'), (54, None, 'groove')],
    's05': [(0, 21, 'waltz'), (21, 60, 'waltz'), (60, None, 'drums')],
    's06': [(0, 34, 'chase'), (34, 45, 'quiet'), (45, None, 'tense')],
    's07': [(0, 51, 'sad'), (51, None, 'tense')],
    's08': [(0, 8, 'tense'), (8, 28, 'epic'), (28, 62, 'chase'), (62, None, 'drums')],
    's09': [(0, 53, 'tense'), (53, None, 'chase')],
    's10': [(0, 30, 'sad'), (30, 47, 'warm'), (47, 87, 'sad'), (87, None, 'epic')],
    's11': [(0, 53, 'epic'), (53, 66, 'sad'), (66, None, 'epic')],
    's12': [(0, 36, 'warm'), (36, 52, 'sad'), (52, None, 'warm')],
}
for sc in tl:
    dur = sc['end'] - sc['start']
    for a, b, style in MUSIC[sc['id']]:
        b = dur if b is None else b
        music(style, b - a, sc['start'] + a)
        print('music', sc['id'], style, round(sc['start'] + a, 1), round(sc['start'] + b, 1))

# ------------------------------------------------------------------ SFX from plans
src = open(f'{ROOT}/src/plans.ts').read()
for sc in tl:
    sid = sc['id']; dur = sc['end'] - sc['start']
    m = re.search(r'  %s: \[(.*?)\n  \],' % sid, src, re.S)
    lines = [l for l in m.group(1).split('\n') if "{at:" in l]
    ats = [float(re.search(r'\{at: ([\d.]+)', l).group(1)) for l in lines]
    for i, l in enumerate(lines):
        a = ats[i]; e = ats[i + 1] if i + 1 < len(ats) else dur
        g0 = sc['start'] + a; L = e - a
        if i > 0: put(whoosh(0.5, 0.18), g0 - 0.15)
        sp = re.search(r'sp: ([\d.]+)', l)
        if 'bike(' in l and ('speed: ' in l or sp):
            spd = max(float(x) for x in re.findall(r'speed: ([\d.]+)', l) + ['0.3'])
            if spd >= 0.8 or (sp and float(sp.group(1)) >= 0.8):
                put(engine(L + 0.2, 0.16 + 0.04 * min(spd, 2.5), 0.9 + 0.2 * min(spd, 2.5)), g0 - 0.1)
        if 'horde(' in l or "k: 'zombie'" in l or 'betty' in l:
            t = rng.uniform(0.2, 1.0)
            while t < L - 0.5:
                put(groan(0.28 if 'run' not in l else 0.34), g0 + t); t += rng.uniform(1.8, 3.5)
        if 'betty' in l:
            put(boom(1.8, 0.6), g0 + 1.0)
        if 'HONK' in l or 'honk' in l:
            for k in range(3 if 'HONK HONK' in l else 1): put(honk(0.55), g0 + 0.3 + k * 0.7)
        if 'sh: 1' in l or 'sh: 0.8' in l or 'sh: 1.4' in l:
            t = 0.8
            while t < L - 0.3: put(crash(0.25), g0 + t); put(boom(0.9, 0.3), g0 + t); t += rng.uniform(2.0, 3.5)
        if "'flash'" in l: put(boom(2.2, 0.9), g0); put(crash(0.7), g0)
        if 'SQUEAK' in l: put(tone(2200, 0.3, 'sine', 0.2, 0.01, 0.1), g0 + 0.1)
        if "'bus'" in l and 'sp:' in l: put(engine(L, 0.12, 0.6), g0)
    # extra explicit cues
cues = [  # (global_time_rel_to_scene, scene, sfx)
    ('s01', 0.2, honk), ('s01', 20.5, honk), ('s01', 22.0, honk), ('s01', 40.5, boom), ('s01', 58.0, boom),
    ('s02', 22.0, lambda: chime(880, 0.2, 1.0)), ('s02', 82.5, honk),
    ('s03', 0.5, lambda: S.thump(0.4)), ('s03', 34.0, boom), ('s03', 44.0, crash),
    ('s04', 21.2, honk), ('s04', 30.2, crash), ('s04', 39.2, lambda: chime(1760, 0.2, 1.0)),
    ('s05', 60.2, boom), ('s06', 38.0, whoosh), ('s06', 44.0, crash),
    ('s08', 8.2, boom), ('s08', 54.0, honk), ('s08', 56.0, honk), ('s08', 58.0, honk), ('s09', 36.2, crash),
    ('s09', 25.8, lambda: whoosh(0.9, 0.3, False)), ('s11', 53.5, whoosh), ('s11', 66.5, honk), ('s11', 68.0, honk), ('s11', 69.5, honk), ('s11', 76.0, boom),
    ('s12', 52.2, honk), ('s12', 49.0, lambda: chime(1320, 0.2, 2.0)),
]
for sid, rel, fn in cues:
    sc = next(s for s in tl if s['id'] == sid)
    c = fn() if callable(fn) else fn
    put(c, sc['start'] + rel, 0.9)
put(S.bell(196.0, 6.0, 0.4), 0.3)

# ------------------------------------------------------------------ voices
voice = np.zeros(N, dtype=np.float32)
cache = {}
def load(f):
    if f not in cache:
        tmp = f'{OUT}/_{f}.wav'
        subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{ROOT}/audio/{f}', '-ac', '1', '-ar', str(SR), tmp])
        with wave.open(tmp) as w: cache[f] = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        os.remove(tmp)
    return cache[f]
for sc in tl:
    for it in sc['items']:
        if it['type'] != 'line': continue
        x = load(it['file'])
        a = max(0, int((it['src_start'] - 0.04) * SR)); b = min(len(x), int((it['src_end'] + 0.12) * SR))
        seg = x[a:b].copy()
        fade = int(0.01 * SR); seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
        if it['who'] == 'ADA':  # radio
            seg = S.fft_filter(seg, lo=450, hi=3200)
            seg = np.tanh(seg * 3.0) * 0.8
            seg += rng.standard_normal(len(seg)).astype(np.float32) * 0.012
        if it['who'] == 'CRANE':
            seg = seg * 1.1
        S.place(voice, seg, it['start'] - 0.04, 1.0)
S.save_wav(f'{OUT}/voice.wav', np.clip(voice, -1, 1))
bed *= 0.4
S.save_wav(f'{OUT}/bed.wav', np.clip(bed, -1, 1))
total = round(TOTAL, 3)
flt = (
    "[0:a]highpass=f=80,acompressor=threshold=-18dB:ratio=3:attack=6:release=120:makeup=4,asplit=2[v][vsc];"
    "[1:a]lowpass=f=11000,volume=0.9[b];"
    "[b][vsc]sidechaincompress=threshold=0.02:ratio=7:attack=30:release=500:makeup=1[bd];"
    "[v][bd]amix=inputs=2:duration=longest:normalize=0,"
    "loudnorm=I=-15:TP=-1.5:LRA=9,alimiter=limit=0.95,"
    f"atrim=0:{total},aformat=sample_rates=44100:channel_layouts=stereo[out]"
)
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{OUT}/voice.wav', '-i', f'{OUT}/bed.wav', '-filter_complex', flt, '-map', '[out]', '-c:a', 'aac', '-b:a', '192k', f'{OUT}/final.m4a'])
print('wrote', f'{OUT}/final.m4a', total)
