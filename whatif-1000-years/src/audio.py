"""Original score + sound design for "What if you lived for 1000 years?".

Everything is synthesized here (numpy/scipy), driven by the same timeline.json
as the animation: scene boundaries start new musical phrases, and SFX sit on
the exact word cues the visuals use. The mix leaves room for a voiceover
(music sits low, with a gentle dip in the 1-4 kHz speech band).
Outputs: audio/music.wav, audio/sfx.wav, audio/mix.wav (48 kHz stereo).
"""
import json, pathlib, re
import numpy as np
from scipy import signal

ROOT = pathlib.Path(__file__).resolve().parent.parent
TL = json.loads((ROOT / "src/timeline.json").read_text())
SR = 48000
DUR = TL["duration"]
N = int(DUR * SR) + SR
rng = np.random.default_rng(7)

# ------------------------------------------------------------------ cues (mirror of engine.js)
WORDS = []
for p in TL["paras"]:
    for w in p["words"]:
        WORDS.append((w["t"], re.sub(r"[^a-z0-9']", "", w["w"].lower()), p["i"]))
P = TL["paras"]

def cue(phrase, para=None):
    parts = [re.sub(r"[^a-z0-9']", "", x) for x in phrase.lower().split()]
    after = P[para]["start"] - 1 if para is not None else 0
    for i in range(len(WORDS)):
        if WORDS[i][0] < after: continue
        if all(i + j < len(WORDS) and WORDS[i + j][1] == parts[j] for j in range(len(parts))):
            return WORDS[i][0]
    raise KeyError(phrase)

np_ = len(P)
T0 = [0.0] + [(P[i - 1]["end"] + P[i]["start"]) / 2 for i in range(1, 18)]
T1 = T0[1:] + [DUR]

# ------------------------------------------------------------------ buffers & helpers
music = np.zeros((2, N)); sfx = np.zeros((2, N))

def add(buf, t, x, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or len(x) == 0: return
    if i < 0: x = x[-i:]; i = 0
    x = x[: N - i]
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    buf[0, i:i + len(x)] += x * gain * l * 1.414
    buf[1, i:i + len(x)] += x * gain * r * 1.414

def tvec(d): return np.arange(int(d * SR)) / SR
def env_adsr(n, a, d, s, r, sustain_len):
    a, d, r = int(a * SR), int(d * SR), int(r * SR); sl = max(0, int(sustain_len * SR))
    e = np.concatenate([np.linspace(0, 1, max(a, 1)), np.linspace(1, s, max(d, 1)), np.full(sl, s), np.linspace(s, 0, max(r, 1))])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))
def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [max(20, lo), min(SR / 2 - 100, hi)], "bandpass", fs=SR, output="sos"); return signal.sosfilt(sos, x)
def lp(x, f, order=2):
    sos = signal.butter(order, min(f, SR / 2 - 100), "lowpass", fs=SR, output="sos"); return signal.sosfilt(sos, x)
def hp(x, f, order=2):
    sos = signal.butter(order, f, "highpass", fs=SR, output="sos"); return signal.sosfilt(sos, x)
def noise(d): return rng.standard_normal(int(d * SR))
def midi(m): return 440.0 * 2 ** ((m - 69) / 12)

# ------------------------------------------------------------------ instruments
def piano(m, d=2.5, vel=.7):
    f = midi(m); t = tvec(d + .2); y = np.zeros_like(t)
    for k, a in enumerate([1, .5, .28, .14, .08, .05], 1):
        fk = f * k * (1 + .0004 * k * k)
        y += a * np.sin(2 * np.pi * fk * t + rng.random()) * np.exp(-t * (1.2 + k * .9) * (0.6 + m / 120))
    y *= (1 - np.exp(-t * 300))
    rel = np.ones_like(t); cut = int(d * SR); rel[cut:] = np.linspace(1, 0, len(t) - cut)
    return y * rel * vel * .35
def pluck(m, d=.6, vel=.6, bright=4000):
    f = midi(m); t = tvec(d)
    y = signal.sawtooth(2 * np.pi * f * t) * np.exp(-t * 7) + .5 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 10)
    return lp(y, bright) * vel * .18
def bell(m, d=3, vel=.5):
    f = midi(m); t = tvec(d); y = np.zeros_like(t)
    for r, a, dc in [(1, 1, 1.2), (2.76, .5, 2), (5.4, .25, 3), (8.93, .12, 4)]:
        y += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * dc)
    return y * (1 - np.exp(-t * 800)) * vel * .16
def pad(ms, d, vel=.5, bright=1800, attack=1.5):
    t = tvec(d); y = np.zeros_like(t)
    for m in ms:
        for det in (-.07, 0, .06):
            f = midi(m + det)
            ph = rng.random() * 6
            y += signal.sawtooth(2 * np.pi * f * t + ph) * .5 + np.sin(2 * np.pi * f * t + ph)
    y = lp(y, bright) / (len(ms) * 3)
    return y * env_adsr(len(t), attack, .5, .9, min(2.5, d * .4), d - attack - .5 - min(2.5, d * .4)) * vel * .5
def strings(ms, d, vel=.5, attack=1.2):
    t = tvec(d); y = np.zeros_like(t)
    for m in ms:
        for det in (-.05, .04):
            f = midi(m + det); vib = 1 + .004 * np.sin(2 * np.pi * 5.2 * t + rng.random() * 6)
            y += signal.sawtooth(2 * np.pi * f * np.cumsum(vib) / SR)
    y = lp(y, 2600) / (len(ms) * 2)
    return y * env_adsr(len(t), attack, .3, .85, min(2, d * .35), d - attack - .3 - min(2, d * .35)) * vel * .5
def sub(m, d, vel=.6):
    t = tvec(d); y = np.sin(2 * np.pi * midi(m) * t) + .25 * np.sin(2 * np.pi * midi(m) * 2 * t)
    return y * env_adsr(len(t), .05, .2, .8, .4, d - .65) * vel * .3
def kick(vel=.6):
    t = tvec(.5); f = 45 + 90 * np.exp(-t * 30); y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    return y * vel * .6
def shaker(vel=.3):
    return bp(noise(.08), 5000, 11000) * np.exp(-tvec(.08) * 50) * vel * .16
def tom(m, vel=.6):
    t = tvec(.9); f = midi(m) * (1 + .5 * np.exp(-t * 20)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4) * vel * .5
def swell(d, vel=.5):  # reverse cymbal-like rise into an accent
    t = tvec(d); y = hp(noise(d), 3000) * (t / d) ** 3
    return y * vel * .25

# ------------------------------------------------------------------ harmony
Dm = [[50, 57, 62, 65, 69], [46, 53, 62, 65, 69], [53, 57, 60, 65, 72], [48, 55, 60, 64, 67]]   # Dm9, Bbmaj7, F, C
DmSad = [[50, 57, 62, 65], [43, 55, 58, 62], [46, 53, 58, 62], [45, 52, 57, 61]]                # Dm, Gm, Bb, A
DM = [[50, 57, 62, 66, 69], [49, 57, 61, 64, 69], [47, 54, 59, 62, 66], [43, 55, 59, 62, 67]]   # D, A/C#, Bm, G
BEAT = 60 / 84

# per-scene arrangement: (progression, layers, energy)
ARR = {
    0: (Dm, {"pad", "piano_sparse", "bell"}, .55), 1: (Dm, {"pad", "arp", "sub"}, .6), 2: (Dm, {"pad_dark", "bell"}, .45),
    3: (Dm, {"arp", "pluck", "sub"}, .6), 4: (Dm, {"arp", "sub", "pad"}, .55), 5: (DmSad, {"piano_sparse", "strings"}, .45),
    6: (DmSad, {"strings", "piano_sparse"}, .5), 7: (Dm, {"pulse", "pluck", "sub", "kick"}, .7), 8: (Dm, {"pluck", "arp", "sub"}, .6),
    9: (Dm, {"pulse", "kick", "strings", "sub"}, .75), 10: (Dm, {"pad_dark", "piano_sparse"}, .4), 11: (DmSad, {"tick", "pad", "sub"}, .5),
    12: (Dm, {"arp", "strings", "sub"}, .6), 13: (DmSad, {"strings", "tom", "sub"}, .65), 14: (Dm, {"pad_dark", "bell"}, .4),
    15: (DM, {"pad", "strings", "arp", "sub", "bell"}, .8), 16: (DM, {"piano_sparse", "strings"}, .55), 17: (DM, {"arp", "strings", "pad", "sub", "kick"}, .75),
}

for si in range(18):
    prog, L, E = ARR[si]
    t0, t1 = T0[si], T1[si]
    bar = BEAT * 4
    nb = int(np.ceil((t1 - t0) / bar))
    for b in range(nb):
        tb = t0 + b * bar
        if tb >= t1: break
        ch = prog[b % len(prog)]
        dur = min(bar, t1 - tb) + .6
        fade = min(1, (t1 - tb) / (bar * .5))
        if "pad" in L: add(music, tb, pad(ch[1:], dur + .8, .55 * E * fade), 1, -.2)
        if "pad_dark" in L: add(music, tb, pad(ch[1:4], dur + 1, .6 * E * fade, bright=900, attack=2), 1, .2)
        if "strings" in L: add(music, tb, strings(ch[1:], dur + .6, .5 * E * fade), 1, .25)
        if "sub" in L: add(music, tb, sub(ch[0] - 12 if ch[0] > 45 else ch[0], dur, .55 * E), 1, 0)
        if "arp" in L:
            pat = [0, 2, 1, 3, 2, 4, 3, 2]
            for k in range(8):
                tk = tb + k * BEAT / 2
                if tk < t1 - .2: add(music, tk, piano(ch[1 + pat[k] % (len(ch) - 1)] + 12, 1.4, (.5 + .2 * (k % 4 == 0)) * E), 1, (k % 2 - .5) * .5)
        if "piano_sparse" in L:
            for k, off in enumerate([0, 1.5, 2.5]):
                tk = tb + off * BEAT
                if tk < t1 - .3: add(music, tk, piano(ch[[2, 3, 4][k] % len(ch)] + 12, 2.8, .55 * E), 1, (k - 1) * .3)
        if "pluck" in L:
            for k in range(8):
                if (k * 37 + b * 11) % 5 == 0: continue
                tk = tb + k * BEAT / 2
                if tk < t1 - .2: add(music, tk, pluck(ch[1 + (k * 3) % (len(ch) - 1)] + 12, .5, .5 * E), 1, ((k * 5) % 7 / 3.5 - 1) * .6)
        if "pulse" in L:
            for k in range(8):
                tk = tb + k * BEAT / 2
                if tk < t1 - .2: add(music, tk, pluck(ch[1] + 12, .25, .35 * E, bright=2200), 1, .3 if k % 2 else -.3); add(music, tk + BEAT / 4, shaker(.35 * E), 1, .4)
        if "kick" in L:
            for k in range(4):
                tk = tb + k * BEAT
                if tk < t1 - .2 and (k % 2 == 0 or si in (9, 17)): add(music, tk, kick(.55 * E), 1, 0)
        if "tick" in L:
            for k in range(8):
                tk = tb + k * BEAT / 2
                if tk < t1 - .2: add(music, tk, bp(noise(.03), 3000, 6000) * np.exp(-tvec(.03) * 120) * (.28 if k % 2 else .4), 1, .2)
        if "tom" in L and b % 2 == 0: add(music, tb, tom(38, .5 * E), 1, -.2)
        if "bell" in L and b % 2 == 0: add(music, tb + BEAT * 2, bell(ch[-1] + 12, 3, .5 * E), 1, .4)
    # phrase punctuation at each cut: swell into the downbeat + low hit
    if si > 0:
        add(music, t0 - 1.6, swell(1.6, .5), 1, 0)
        add(music, t0, sub(prog[0][0] - 12, 2.5, .6), 1, 0); add(music, t0, kick(.35), 1, 0)

# big moments
for t, v in [(cue("a thousand years", 0) - .1, 1), (cue("one thousandth birthday", 15), 1.1), (cue("watch the sunrise", 15), .9)]:
    add(music, t - 2.2, swell(2.2, .7), 1, 0)
    for m in DM[0] if t > T0[15] else Dm[0]: add(music, t, bell(m + 12, 4, .45 * v), 1, (m % 5 - 2) * .2)

# final resolution chord
add(music, cue("Thanks for watching", 17), pad([50, 57, 62, 66, 69, 74], DUR - cue("Thanks for watching", 17) + .5, .6), 1, 0)
add(music, cue("Thanks for watching", 17), strings([62, 66, 69, 74], DUR - cue("Thanks for watching", 17), .5), 1, 0)

# ------------------------------------------------------------------ SFX library
def tap(f=1800, d=.06, vel=.5):  # paper pop
    t = tvec(d); return bp(noise(d), f * .6, f * 1.6) * np.exp(-t * 60) * vel
def knock(f=320, vel=.6):
    t = tvec(.25); y = np.sin(2 * np.pi * f * t) * np.exp(-t * 28) + .6 * np.sin(2 * np.pi * f * 2.3 * t) * np.exp(-t * 40)
    return (y + bp(noise(.25), 800, 3000) * np.exp(-t * 80) * .5) * vel * .5
def plink(m=84, vel=.4): return bell(m, 1.2, vel * 2.2)
def whoosh(d=1.2, f0=300, f1=3000, vel=.5):
    t = tvec(d); n = noise(d); out = np.zeros_like(n); seg = 2400
    for i in range(0, len(n), seg):
        k = i / len(n); fc = f0 * (f1 / f0) ** k
        out[i:i + seg] = bp(n[i:i + seg + 2000], fc * .5, fc * 1.5)[: len(n[i:i + seg])]
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    return lp(out, 9000) * e * vel * .8
def page_flip(vel=.6):
    d = .45; t = tvec(d); y = bp(noise(d), 1200, 7000) * (np.sin(np.pi * t / d) ** 3) * (1 + .6 * np.sin(2 * np.pi * 23 * t))
    return y * vel * .7
def rustle(d=1.3, vel=.5):
    t = tvec(d); y = np.zeros_like(t); n = int(d * 60)
    for i in range(n):
        p = int(rng.random() * (len(t) - 2000)); y[p:p + 2000] += tap(1500 + rng.random() * 4000, 2000 / SR, rng.random())[:2000]
    return y * np.sin(np.pi * t / d) * vel
def scribble(d=.6, vel=.4):
    t = tvec(d); y = bp(noise(d), 2500, 7000) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 9 * t)))
    return y * env_adsr(len(t), .02, .05, .9, .08, d - .15) * vel * .6
def thud(vel=.7):
    t = tvec(.5); f = 60 + 80 * np.exp(-t * 25); y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    return (y + lp(noise(.5), 600) * np.exp(-t * 30) * .5) * vel * .7
def stamp(vel=.8):
    a = thud(vel); b = tap(1200, .08, .6 * vel); a[:len(b)] += b; return a
def coin(m=None, vel=.4):
    f = midi(m or 96 + rng.integers(-3, 4)); t = tvec(.5); y = np.zeros_like(t)
    for r, a in [(1, 1), (2.4, .6), (4.1, .4), (5.9, .25)]: y += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * 9)
    return y * vel * .12
def tick(vel=.4): return bp(noise(.025), 2500, 7000) * np.exp(-tvec(.025) * 150) * vel
def twang(m=52, vel=.6):
    t = tvec(1.2); f = midi(m) * (1 - .15 * t / 1.2); y = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5)
    return lp(y, 2500) * vel * .25
def shimmer(d=1.5, vel=.4):
    t = tvec(d); y = np.zeros_like(t)
    for m in [88, 91, 95, 98, 100, 103]: y += np.sin(2 * np.pi * midi(m) * t + rng.random() * 6) * np.exp(-t * 2) * (1 + np.sin(2 * np.pi * 7 * t + m)) * .5
    return y * (1 - np.exp(-t * 40)) * vel * .08
def crash(vel=.8):
    t = tvec(1.2); y = bp(noise(1.2), 600, 9000) * np.exp(-t * 5)
    for f in [1800, 2600, 3900, 5200]: y += .3 * np.sin(2 * np.pi * f * t) * np.exp(-t * 14)
    return y * vel * .5
def rumble(d=3, vel=.6):
    t = tvec(d); return lp(noise(d), 160, 4) * env_adsr(len(t), d * .3, .2, .8, d * .4, d * .1) * vel * 3
def ambience(t0, t1, kind, vel=.15):
    d = t1 - t0
    if d <= 0: return
    n = noise(d)
    if kind == "wind": y = bp(n, 200, 1200) * (0.6 + .4 * np.sin(2 * np.pi * .13 * tvec(d)))
    elif kind == "water": y = lp(n, 500) * (0.7 + .3 * np.sin(2 * np.pi * .4 * tvec(d)))
    elif kind == "under": y = lp(n, 220, 4) * 2.5
    elif kind == "room": y = lp(n, 900) * .5
    elif kind == "fire": y = np.zeros_like(n); [y.__setitem__(slice(p, p + 300), y[p:p + 300] + bp(noise(300 / SR), 1500, 6000) * rng.random()) for p in rng.integers(0, len(n) - 300, int(d * 25))]
    else: y = lp(n, 3000)
    e = np.minimum(1, np.minimum(tvec(d) / 1.2, (d - tvec(d)) / 1.2))
    add(sfx, t0, y * e, vel, 0)

# ------------------------------------------------------------------ transitions
CARRIERS = {1: "iris", 2: "wave", 3: "sheets", 4: "leaves", 5: "sheets", 6: "iris", 7: "sheets", 8: "page", 9: "clouds", 10: "iris", 11: "sheets", 12: "page", 13: "clouds", 14: "iris", 15: "sheets", 16: "sheets", 17: "leaves"}
for si, kind in CARRIERS.items():
    t = T0[si]
    if kind == "sheets": add(sfx, t - .6, whoosh(1.2, 500, 3500, .55), 1, -.3); add(sfx, t - .1, tap(1600, .12, .4), 1, .2)
    elif kind == "clouds": add(sfx, t - .7, whoosh(1.4, 200, 1500, .6), 1, 0)
    elif kind == "wave": add(sfx, t - .75, lp(whoosh(1.5, 150, 1200, .9), 2000), 1, 0); [add(sfx, t + rng.random() * 1.2, plink(96 + int(rng.integers(0, 8)), .15), 1, rng.random() - .5) for _ in range(10)]
    elif kind == "page": add(sfx, t - .25, page_flip(.8), 1, .2)
    elif kind == "leaves": add(sfx, t - .65, rustle(1.3, .55), 1, 0); add(sfx, t - .6, whoosh(1.2, 400, 2500, .3), 1, 0)
    elif kind == "iris": add(sfx, t - .5, whoosh(.6, 2000, 300, .35), 1, 0); add(sfx, t, thud(.35), 1, 0); add(sfx, t + .1, plink(81, .3), 1, 0)

# ------------------------------------------------------------------ scene SFX on cues
c = cue
# 0 intro
ambience(0, T1[0], "wind", .12)
for w, f in [("What if you could", 1500), ("a thousand years", 900), ("Not forever", 2000)]: add(sfx, c(w, 0), tap(f, .1, .5), 1, 0)
add(sfx, c("Not forever", 0) + .35, scribble(.3, .5), 1, .4)
for i in range(10): add(sfx, c("Ten full centuries", 0) + i * .13, knock(300 + i * 25, .45), 1, -.6 + i * .12)
for w, m in [("sunrises", 84), ("birthdays", 88), ("and goodbyes", 91)]: add(sfx, c(w, 0), plink(m, .45), 1, 0)
add(sfx, c("greatest gift", 0), whoosh(.5, 800, 4000, .4), 1, 0); add(sfx, c("greatest gift", 0) + .45, bell(93, 2, 1.4), 1, 0)
# 1 growing up
for k in range(int((c("thirtieth birthday", 1) - T0[1]) / .5)): add(sfx, T0[1] + .3 + k * .5, tick(.25 if k % 2 else .35), 1, .5)
for w in ["school", "make friends", "first job"]: add(sfx, c(w, 1), plink(86, .35), 1, 0)
add(sfx, c("fall in love", 1) + .2, plink(91, .45), 1, 0); add(sfx, c("fall in love", 1) + .32, plink(96, .35), 1, 0)
add(sfx, c("thirtieth birthday", 1), shimmer(2, .6), 1, 0); add(sfx, c("thirtieth birthday", 1), thud(.4), 1, 0)
for w, m in [("Your heart", 84), ("your skin", 86), ("your brain", 89)]: add(sfx, c(w, 1), plink(m, .4), 1, 0)
for k in range(6): add(sfx, c("nobody notices", 1) + k * .85, thud(.18) * .8, 1, 0)
# 2 underwater
ambience(T0[2], T1[2], "under", .18)
for k in range(30): add(sfx, T0[2] + rng.random() * (T1[2] - T0[2]), plink(98 + int(rng.integers(0, 8)), .08), 1, rng.random() - .5)
for w in ["Greenland shark", "A clam", "tiny jellyfish"]: add(sfx, c(w, 2), tap(1300, .1, .4), 1, 0)
add(sfx, c("turn back", 2), whoosh(3, 3000, 300, .3), 1, 0)
for k in range(14): add(sfx, c("cells that repair", 2) + .5 + k * .32, tap(4000, .03, .25), 1, rng.random() - .5); add(sfx, c("cells that repair", 2) + 1.1 + k * .32, plink(100 + k % 5, .12), 1, rng.random() - .5)
# 3 not immortal
add(sfx, c("you are not immortal", 3) + .1, stamp(.7), 1, 0)
for k in range(30): add(sfx, c("still get sick", 3) + k * .05 + rng.random() * .05, tap(5000, .015, .2), 1, rng.random() * .4)
add(sfx, c("still have accidents", 3) - .1, whoosh(.7, 2000, 600, .35), 1, 0); add(sfx, c("still have accidents", 3) + .6, crash(.7), 1, .3)
for k in range(5): add(sfx, c("something unlucky", 3) + k * .25, knock(900 + k * 60, .3), 1, -.5 + k * .25)
add(sfx, c("to be careful", 3), knock(260, .6), 1, .4); add(sfx, c("Very careful", 3), twang(64, .3), 1, .4)
# 4 eighty
for k in range(3): add(sfx, c("asking questions", 4) + k * .2, plink(88 + k * 3, .3), 1, -.5 + k * .5)
add(sfx, c("Doctors want", 4), whoosh(.6, 600, 2500, .3), 1, .4)
for k in range(5): add(sfx, c("Strangers stare", 4) + k * .12, tap(800, .05, .3), 1, -.6 + k * .3)
add(sfx, c("move to a new city", 4) - .2, whoosh(1.8, 200, 2500, .7), 1, 0)
t_name = c("take a new name", 4)
for k, tt in enumerate([t_name, t_name + .9, c("start over", 4) - .1]):
    add(sfx, tt, scribble(.45, .5), 1, .4)
    if k < 2: add(sfx, tt + .9 - .25, scribble(.25, .45), 1, .4)
# 5 120th birthday
ambience(T0[5], T1[5], "room", .1); ambience(T0[5], T1[5], "fire", .06)
for w in ["Your parents", "your teachers", "childhood friends", "your own children"]: add(sfx, c(w, 5) + .2, whoosh(2.5, 400, 1800, .2), 1, 0)
add(sfx, c("keep losing them", 5) + .2, scribble(.5, .4), 1, 0)
# 6 goodbye
ambience(T0[6], T1[6], "water", .16)
for w, m in [("stay away", 47), ("any amount of pain", 50), ("become an expert", 45), ("Saying goodbye", 43)]: add(sfx, c(w, 6) + 3 + (.3 if w == "stay away" else (.2 if w == "Saying goodbye" else 0)), twang(m, .4), 1, .3)
for k in range(7): add(sfx, c("Saying goodbye", 6) + 2.4 + k * .08 + .5, rustle(.5, .2), 1, -.5 + k * .15)
# 7 money
t1k, t17, t2b = c("one thousand dollars", 7), c("seventeen million", 7), c("two billion", 7)
add(sfx, t1k, coin(96, .8), 1, 0)
for k in range(60):
    tt = c("five percent", 7) + k * (t2b + .4 - c("five percent", 7)) / 60
    add(sfx, tt, coin(None, .35 + .4 * k / 60), 1, rng.random() - .5)
add(sfx, t17, bell(91, 2, 1.2), 1, 0); add(sfx, t2b, bell(98, 2.5, 1.4), 1, 0); add(sfx, t2b, thud(.5), 1, 0)
add(sfx, c("Patience becomes", 7), whoosh(.8, 400, 3000, .4), 1, 0)
add(sfx, c("plant a forest", 7), whoosh(2.5, 150, 2000, .5), 1, 0); add(sfx, c("plant a forest", 7) + .5, rustle(2, .35), 1, 0)
for w in ["every instrument", "dozens of languages", "earn a degree"]:
    for k in range(3): add(sfx, c(w, 7) + k * .1, plink(88 + k * 4, .25), 1, -.5 + k * .5)
# 8 language
for k in range(5): add(sfx, c("here's something wild", 8) - .3 + k * .06, tap(1400 + k * 200, .08, .4), 1, -.4 + k * .2)
for k in range(12): add(sfx, c("language you don't", 8) + .4 + k * .2, knock(600 + (k % 4) * 150, .2), 1, rng.random() - .5)
add(sfx, c("English from a thousand", 8) - .3, whoosh(.9, 300, 1500, .4), 1, 0)
for k in range(3): add(sfx, c("English from a thousand", 8) + .3 + k * .5, scribble(.7, .25), 1, .2)
for k in range(5): add(sfx, c("the slang", 8) + k * .55, tap(2200, .07, .45), 1, -.5 + k * .25)
for k in range(3): add(sfx, c("Every hundred years", 8) + k * .25 + .55, knock(220 + k * 30, .6), 1, -.3 + k * .3)
# 9 300 years
for w in ["no cars", "no electricity", "no phones", "no planes"]: add(sfx, c(w, 9) - .1, plink(84, .3), 1, 0); add(sfx, c(w, 9) + .25, scribble(.2, .5), 1, 0)
add(sfx, c("three hundred more years", 9) - .3, whoosh(1.6, 200, 3500, .6), 1, 0)
add(sfx, c("float on oceans", 9), plink(93, .3), 1, -.4); add(sfx, c("high into the clouds", 9), plink(96, .3), 1, .4)
add(sfx, c("on the Moon", 9) - 1.0, rumble(4.5, .8), 1, 0); add(sfx, c("on the Moon", 9) - .5, whoosh(4, 100, 1200, .5), 1, 0)
add(sfx, c("see Earth from another", 9) + .3, shimmer(2, .5), 1, 0)
add(sfx, c("seven hundred years left", 9) - .2, stamp(.5), 1, 0)
# 10 memory
ambience(T0[10], T1[10], "room", .1)
add(sfx, c("only hold so many", 10) - .3, whoosh(2.2, 200, 2000, .5), 1, 0)
for w in ["first best friend", "mother's voice", "house you grew up in"]:
    add(sfx, c(w, 10) - .6, tap(3000, .05, .4), 1, 0); add(sfx, c(w, 10) + .9, whoosh(1.6, 2500, 400, .25), 1, 0)
for k in range(40): add(sfx, c("keep diaries", 10) + k * .05 + (c("Thousands of them", 10) - c("keep diaries", 10) if k > 14 else 0), tap(1500 + rng.random() * 3000, .05, .25), 1, rng.random() - .5)
add(sfx, c("only one who could", 10), bell(86, 3, .9), 1, 0)
# 11 urgency
for k in range(4): add(sfx, c("rush to see", 11) + k * .3, knock(180, .25), 1, -.5 + k * .3)
add(sfx, c("rush to see", 11) + 1.5, plink(91, .4), 1, 0)
add(sfx, c("chase our dreams", 11), shimmer(1.5, .4), 1, .3)
add(sfx, c("a thousand years ahead", 11) - .4, whoosh(1.4, 1500, 200, .4), 1, 0)
for k, it in enumerate([c("putting things off", 11) + .2, c("putting things off", 11) + .9, c("next century", 11) - .6, c("next century", 11) + .3]): add(sfx, it, stamp(.75), 1, .3)
# 12 chapters
for w in ["as a doctor", "as a musician", "exploring the oceans", "home on another world"]: add(sfx, c(w, 12) - .8, page_flip(.7), 1, .2); add(sfx, c(w, 12) - .25, whoosh(.5, 800, 3000, .3), 1, 0)
add(sfx, c("connected only by you", 12), plink(86, .4), 1, 0)
# 13 empires
add(sfx, c("empires rise", 13), rumble(2.2, .7), 1, 0)
for k in range(5): add(sfx, c("empires rise", 13) + .3 + k * .15, tom(36 + k * 2, .5), 1, -.6 + k * .3)
add(sfx, c("and fall.", 13) + .2, crash(.9), 1, -.3); add(sfx, c("and fall.", 13) + .5, crash(.7), 1, .3); add(sfx, c("and fall.", 13) + .3, rumble(2, .8), 1, 0)
for k in range(5): add(sfx, c("history being written", 13) + k * .2, scribble(.45, .3), 1, .3)
for k in range(5): add(sfx, c("and then rewritten", 13) - .1 + k * .08, scribble(.25, .45), 1, -.3)
for k in range(7): add(sfx, c("history books", 13) + k * .1 + .2, thud(.3), 1, .4)
add(sfx, c("stay silent", 13) + .2, hp(noise(.8), 2500) * np.exp(-tvec(.8) * 4) * .3, 1, .3)
# 14 800 years
ambience(T0[14], T1[14], "wind", .1)
add(sfx, c("more curious", 14) + .2, shimmer(1.5, .5), 1, -.3)
for k in range(8): add(sfx, c("Nobody knows", 14) + k * .2, plink(96 + (k % 4) * 2, .15), 1, .3)
for k in range(6): add(sfx, c("the wisest person", 14) + k * .08, plink(91 + k * 2, .25), 1, -.4 + k * .16)
# 15 1000th birthday
for k in range(25): add(sfx, c("one thousandth birthday", 15) - 1.5 + k * .06, tick(.3), 1, -.3)
add(sfx, c("one thousandth birthday", 15) + .1, bell(86, 4, 1.4), 1, 0); add(sfx, c("one thousandth birthday", 15) + .1, thud(.5), 1, 0)
add(sfx, c("three thousand twenty-six", 15), plink(93, .35), 1, 0)
add(sfx, c("another planet", 15), shimmer(2, .4), 1, -.4)
for k in range(30): add(sfx, c("three hundred and sixty-five thousand", 15) + k * .07, plink(96 + (k % 6), .1), 1, rng.random() - .5)
# 16 gift or curse
for w in ["be a gift", "or a curse", "little bit of both"]: add(sfx, c(w, 16), knock(140, .35), 1, 0); add(sfx, c(w, 16) + .05, tap(600, .3, .15), 1, 0)
for k in range(int((c("one day at a time", 16) - c("here's the thing", 16)) / .12)): add(sfx, c("here's the thing", 16) + k * .12 * (1 + k * .01), page_flip(.12), 1, .2)
add(sfx, c("today is one of them", 16) - .2, stamp(.6), 1, 0); add(sfx, c("today is one of them", 16), bell(93, 2.5, 1), 1, 0)
# 17 finale
add(sfx, c("call someone", 17), plink(88, .35), 1, -.3); add(sfx, c("Learn something new", 17), page_flip(.5), 1, .3)
add(sfx, c("Watch the sunrise", 17), shimmer(2.5, .4), 1, 0)
add(sfx, c("Thanks for watching", 17) - .3, whoosh(1, 300, 2500, .4), 1, 0); add(sfx, c("Thanks for watching", 17) + .3, bell(86, 4, 1.2), 1, 0)

# ------------------------------------------------------------------ mixdown
def reverb(x, seconds=2.6, wet=.25, lpf=5000):
    n = int(seconds * SR); t = np.arange(n) / SR
    ir = np.stack([lp(noise(seconds), lpf) * np.exp(-t * 6.9 / seconds) for _ in range(2)])
    ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
    out = np.stack([signal.fftconvolve(x[i], ir[i])[: x.shape[1]] for i in range(2)])
    return x * (1 - wet) + out * wet

music = reverb(music, 3.2, .32)
sfx = reverb(sfx, 1.8, .18, 7000)
# speech-band dip in music for the future voiceover (-3 dB around 2 kHz)
band = np.stack([bp(music[i], 1000, 4000, 2) for i in range(2)])
music = music - band * .3
# fade in/out
fade = np.ones(N); fi = int(1.0 * SR); fo = int(2.0 * SR); end = int(DUR * SR)
fade[:fi] = np.linspace(0, 1, fi); fade[end - fo:end] = np.linspace(1, 0, fo); fade[end:] = 0
music *= fade; sfx *= fade

def norm_peak(x, peak):
    m = np.max(np.abs(x)); return x * (peak / m) if m > 0 else x
music = norm_peak(music, .55); sfx = norm_peak(sfx, .6)
mix = music * .8 + sfx * .75
# gentle soft clip / limiter
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix = norm_peak(mix, .89)

import wave
def write(path, x):
    x = np.clip(x[:, :end], -1, 1); y = (x.T * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())
out = ROOT / "audio"; out.mkdir(exist_ok=True)
write(out / "music.wav", norm_peak(music, .89)); write(out / "sfx.wav", norm_peak(sfx, .89)); write(out / "mix.wav", mix)
print("ok", DUR)
