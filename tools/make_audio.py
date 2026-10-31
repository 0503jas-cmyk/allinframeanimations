#!/usr/bin/env python3
# Procedural score + sound design + voice mix for THE DROWNED MERIDIAN. numpy only (+ ffmpeg for voice FX).
import json, subprocess, sys, os, numpy as np
SR = 48000; DUR = 720.0; N = int(SR * DUR)
EV = json.load(open('events.json')); L = json.load(open('timeline_lines.json'))
rng = np.random.default_rng(7)
os.makedirs('build/audio', exist_ok=True)

def mf(m): return 440.0 * 2 ** ((m - 69) / 12)
def tt(a, b): return np.arange(int(a * SR), int(b * SR)) / SR
def ss(x, a, b): y = np.clip((x - a) / (b - a), 0, 1); return y * y * (3 - 2 * y)
def pan_gains(p): a = (p + 1) * np.pi / 4; return np.cos(a), np.sin(a)
class Bus:
    def __init__(s): s.l = np.zeros(N, np.float32); s.r = np.zeros(N, np.float32)
    def add(s, t0, sig, pan=0.0, g=1.0):
        i0 = int(round(t0 * SR));
        if i0 >= N or i0 + len(sig) <= 0: return
        a = max(0, -i0); b = min(len(sig), N - i0); gl, gr = pan_gains(pan)
        s.l[i0 + a:i0 + b] += (sig[a:b] * g * gl).astype(np.float32); s.r[i0 + a:i0 + b] += (sig[a:b] * g * gr).astype(np.float32)
    def add2(s, t0, l, r, g=1.0):
        i0 = int(round(t0 * SR)); a = max(0, -i0); b = min(len(l), N - i0)
        if b <= a: return
        s.l[i0 + a:i0 + b] += (l[a:b] * g).astype(np.float32); s.r[i0 + a:i0 + b] += (r[a:b] * g).astype(np.float32)
music, sfx, speech = Bus(), Bus(), Bus()

# ---------- synthesis helpers
def env(n, a=.01, d=.1, s=.6, r=.2):
    e = np.ones(n); na, nd, nr = int(a * SR), int(d * SR), int(r * SR); na = max(na, 1)
    e[:na] = np.linspace(0, 1, na) ** 2
    if nd: e[na:na + nd] = np.linspace(1, s, nd)[:max(0, min(nd, n - na))] if na < n else e[na:na + nd]
    e[na + nd:] = s;
    if nr: e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e
def fadeio(x, a=.05, r=.05):
    n = len(x); a = min(int(a * SR), n // 2); r = min(int(r * SR), n // 2)
    if a: x[:a] *= np.linspace(0, 1, a)
    if r: x[-r:] *= np.linspace(1, 0, r)
    return x
def noise(dur, lo=None, hi=None, seed=None):
    r = np.random.default_rng(seed) if seed is not None else rng; n = int(dur * SR); w = r.standard_normal(n).astype(np.float32)
    if lo is None and hi is None: return w
    S = np.fft.rfft(w); f = np.fft.rfftfreq(n, 1 / SR); m = np.ones_like(f)
    if lo: m *= ss(f, lo * .7, lo * 1.3)
    if hi: m *= 1 - ss(f, hi * .8, hi * 1.25)
    out = np.fft.irfft(S * m, n).astype(np.float32); return out / (np.std(out) + 1e-9)
def pad(f, dur, bright=.5, det=.0025, vib=.3, ph=0):
    t = tt(0, dur); y = np.zeros(len(t))
    for k in range(1, 9):
        amp = 1 / k ** (1.25 - bright * .7)
        for d in (-det, det): y += amp * np.sin(2 * np.pi * f * k * (1 + d * k * .35) * t + k * 1.7 + ph + (1.2 * np.sin(2 * np.pi * vib * t + k) if k < 4 else 0) * .02)
    return (y / 8).astype(np.float32)
def choir(f, dur, vowel='a', seed=0):
    form = {'a': [(730, 1090, 2440)], 'o': [(570, 840, 2410)], 'u': [(300, 870, 2240)]}[vowel][0]; t = tt(0, dur); y = np.zeros(len(t)); vib = 1 + .006 * np.sin(2 * np.pi * (5.2 + .3 * seed) * t + seed)
    for voice in range(3):
        f0 = f * (1 + (voice - 1) * .004 + .001 * seed);
        for k in range(1, 28):
            fk = f0 * k
            if fk > 5000: break
            w = sum(np.exp(-((fk - fm) / (bw)) ** 2) * g for fm, bw, g in zip(form, (110, 160, 260), (1, .7, .35))) + .03
            y += w / k ** .5 * np.sin(2 * np.pi * fk * vib * t + voice * 2.1 + k * 1.3)
    return (y / 28).astype(np.float32)
def bell(f, dur=4.0, bright=1.0):
    t = tt(0, dur); mod = bright * 2.2 * np.exp(-t * 1.6); y = np.sin(2 * np.pi * f * t + mod * np.sin(2 * np.pi * f * 3.5 * t)) * np.exp(-t * 1.15)
    y += .35 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t * 2.2) + .2 * np.sin(2 * np.pi * f * .5 * t) * np.exp(-t * 0.8)
    return fadeio((y * .6).astype(np.float32), .002, .05)
def sub_hit(f0=70, f1=32, dur=2.2, drive=1.0):
    t = tt(0, dur); f = f1 + (f0 - f1) * np.exp(-t * 7); ph = 2 * np.pi * np.cumsum(f) / SR; y = np.sin(ph) * np.exp(-t * 1.8) * drive
    y += noise(dur, 40, 600, 11) * np.exp(-t * 14) * .6; return fadeio((np.tanh(y * 1.4)).astype(np.float32), .001, .1)
def taiko(dur=1.2, f=62, vel=1.0):
    t = tt(0, dur); fq = f * (1 + .9 * np.exp(-t * 18)); ph = 2 * np.pi * np.cumsum(fq) / SR
    y = np.sin(ph) * np.exp(-t * 4.2) + noise(dur, 80, 900, 3) * np.exp(-t * 22) * .5
    return fadeio((np.tanh(y * 1.3) * vel).astype(np.float32), .001, .05)
def echo(x, taps=((.13, .45), (.29, .32), (.47, .22), (.74, .14)), tail=1.2):
    out = np.zeros(len(x) + int(tail * SR), np.float32); out[:len(x)] += x
    for d, g in taps: i = int(d * SR); out[i:i + len(x)] += x * g
    return out
def whoosh(dur, up=True, lo=200, hi=6000, peak=.7, seed=5):
    n = noise(dur, 80, hi, seed); t = np.linspace(0, 1, len(n)); e = (t ** 2.2 if up else (1 - t) ** 2) * np.sin(np.pi * np.clip(t, 0, 1) * .5 + (0 if up else np.pi / 2)) if False else (t ** 2.4 if up else (1 - t) ** 2.4)
    # sweep via amplitude-modulated bands
    y = n * e
    return fadeio((y * peak).astype(np.float32), .01, .02)
def riser(a, b, f0=200, f1=1800, g=.5, pan=0):
    d = b - a; t = tt(0, d); f = f0 * (f1 / f0) ** (t / d); ph = 2 * np.pi * np.cumsum(f) / SR; y = np.zeros(len(t))
    for k, w in ((1, 1), (2, .5), (3, .3), (1.005, .8)): y += w * np.sin(ph * k)
    y += noise(d, 300, 8000, 17) * .35 * (t / d); e = (t / d) ** 2.2; return (y * e * .25 * g).astype(np.float32)
def creak(dur=1.0, f=210, seed=0, g=.5):
    r = np.random.default_rng(seed); n = int(dur * SR); t = np.arange(n) / SR; wob = np.convolve(r.standard_normal(n), np.ones(int(.04 * SR)) / (.04 * SR), 'same'); wob /= np.abs(wob).max() + 1e-9
    fq = f * (1 + .5 * wob + .12 * np.sin(2 * np.pi * 7 * t)); ph = 2 * np.pi * np.cumsum(fq) / SR; y = sum(np.sin(ph * k) / k ** .8 for k in (1, 2, 3, 5)) * (.5 + .5 * np.abs(wob))
    return fadeio((y * np.sin(np.pi * t / dur) ** .7 * g * .5).astype(np.float32), .02, .05)
def gull(dur=.9, f=1900):
    t = tt(0, dur); fq = f * (1 + .18 * np.sin(2 * np.pi * 2.4 * t)) * (1 - .25 * t / dur); ph = 2 * np.pi * np.cumsum(fq) / SR; y = (np.sin(ph) + .5 * np.sin(2 * ph)) * np.sin(np.pi * t / dur) ** 1.4
    return fadeio((y * .18).astype(np.float32), .02, .1)
def lev_call(dur=7.0, f0=170, f1=62, g=1.0):
    t = tt(0, dur); fq = f1 + (f0 - f1) * np.exp(-t * .55); fq = fq * (1 + .035 * np.sin(2 * np.pi * 1.7 * t)); ph = 2 * np.pi * np.cumsum(fq) / SR
    y = np.sin(ph + 2.6 * np.sin(ph * .5 + .4 * np.sin(2 * np.pi * .3 * t))) * .8 + .35 * np.sin(ph * 2) + .5 * np.sin(ph * .5)
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** .8; return fadeio((y * e * g * .55).astype(np.float32), .05, .5)

# ---------- score
SC = [(0, 55), (55, 110), (110, 170), (170, 230), (230, 290), (290, 350), (350, 410), (410, 480), (480, 535), (535, 595), (595, 660), (660, 720)]
CH = {1: [38, 45, 50], 2: [38, 45, 51], 3: [34, 41, 50], 4: [43, 50, 58], 5: [38, 39, 45], 6: [41, 48, 56], 7: [39, 46, 55], 8: [38, 45, 50], 9: [46, 53, 62], 10: [38, 45, 53], 11: [38, 45, 50], 12: [38, 45, 54]}
GAIN = {1: (.5, .8), 2: (.5, .8), 3: (.7, 1.1), 4: (.8, 1.0), 5: (.45, .6), 6: (.65, .9), 7: (.7, .9), 8: (.8, 1.0), 9: (.7, .75), 10: (.65, .8), 11: (.8, 1.3), 12: (1.0, .8)}
def padscene(i, a, b):
    ext = 4.0; dur = (b - a) + 2 * ext; buf = np.zeros(int(dur * SR), np.float32); g0, g1 = GAIN[i]
    for k, m in enumerate(CH[i]): buf += pad(mf(m), dur, .35 + .12 * k, vib=.15 + .05 * k, ph=k) * (1.0 if k == 0 else .7)
    t = np.linspace(0, 1, len(buf)); amp = (g0 + (g1 - g0) * t); e = ss(np.arange(len(buf)) / SR, 0, ext * 1.1) * (1 - ss(np.arange(len(buf)) / SR, dur - ext * 1.1, dur))
    music.add(a - ext, buf * amp * e * .26, pan=0)
def choirscene(i, a, b, notes, vowel='a', g=.5, att=3.0):
    dur = b - a; buf = np.zeros(int(dur * SR), np.float32)
    for k, m in enumerate(notes): buf += choir(mf(m), dur, vowel, seed=k)
    e = ss(np.arange(len(buf)) / SR, 0, att) * (1 - ss(np.arange(len(buf)) / SR, dur - att, dur)); music.add(a, buf * e * g * .5)
for i, (a, b) in enumerate(SC, 1): padscene(i, a, b)
# sub drone that follows tension
for i, (a, b) in enumerate(SC, 1):
    d = b - a + 6; t = tt(0, d); sd = np.sin(2 * np.pi * mf(CH[i][0] - 12) * t) * (ss(t, 0, 4) * (1 - ss(t, d - 4, d))); music.add(a - 3, (sd * (.3 + .25 * (i in (7, 8, 11)))).astype(np.float32))
# S1: bells + title
for t0, m in ((4.0, 74), (9.5, 75), (21.0, 77), (28.0, 74)): music.add(t0, echo(bell(mf(m), 5.0, .8)), pan=-.2 if m % 2 else .25, g=.35)
music.add(EV['title_in'], echo(sub_hit(80, 30, 4.0), tail=2.5), g=.75); music.add(EV['title_in'], echo(bell(mf(62), 6.0)), g=.4); music.add(EV['title_in'] + .6, echo(bell(mf(69), 6.0)), pan=.3, g=.25)
choirscene(1, 34, 56, [62, 65, 69], 'o', .35, 3)
# S2: unease strings tremolo cluster from aurora
def strings(a, b, notes, g=.4, trem=7.5):
    d = b - a; t = tt(0, d); y = np.zeros(len(t))
    for m in notes:
        f = mf(m);
        for dd in (-.003, .003): y += sum(np.sin(2 * np.pi * f * (1 + dd) * k * t + k) / k ** 1.3 for k in range(1, 7))
    y *= .55 + .45 * np.sin(2 * np.pi * trem * t) ** 2; e = ss(t, 0, 3) * (1 - ss(t, d - 3, d)); music.add(a, (y * e * g * .08).astype(np.float32))
strings(70, 112, [74, 75, 62], .5); strings(112, 172, [70, 77, 74], .7, 9)
music.add(EV['aurora_start'], riser(EV['aurora_start'], EV['aurora_start'] + 8, 220, 700, .4), g=.5)
# S3 build to crossing
music.add2(EV['cross'] - 16, *(lambda r: (r, r))(riser(EV['cross'] - 16, EV['cross'] - .2, 120, 2400, 1.0)), g=.8)
for k in range(8): music.add(130 + k * 2.4, taiko(1.4, 55, .5 + .05 * k), g=.35)
music.add(EV['cross'], echo(sub_hit(60, 24, 5.0, 1.3), tail=3.0), g=1.0); music.add(EV['cross'], whoosh(5.0, False, peak=.9), g=.7)
choirscene(3, 156, 172, [62, 66, 69, 74], 'a', .6, 2.5)
for t0, m in ((157.0, 81), (160.5, 78), (163.0, 74)): music.add(t0, echo(bell(mf(m), 6.0)), pan=.3, g=.3)
# S4 wonder / dread
choirscene(4, 172, 232, [55, 62, 70], 'a', .55, 5)
music.add(EV['island_reveal'] - 8, riser(EV['island_reveal'] - 8, EV['island_reveal'], 180, 1500, .8), g=.5)
music.add(EV['island_reveal'], echo(sub_hit(65, 28, 5.0, 1.2), tail=3), g=.9)
for t0, m in ((EV['island_reveal'] + .1, 69), (EV['island_reveal'] + 1.4, 74), (EV['island_reveal'] + 2.8, 77)): music.add(t0, echo(bell(mf(m), 6.0)), g=.4, pan=-.15)
strings(216, 232, [58, 62, 63], .6, 6)
# S5 heartbeat + dissonance
t = EV['whisper1'] - 6
while t < 280:
    beat = (taiko(.9, 48, .55)); music.add(t, beat, g=.45 * (.6 + .4 * ss(t, 241, 278))); music.add(t + .36, taiko(.7, 44, .3), g=.3 * (.6 + .4 * ss(t, 241, 278))); t += 1.2 - .35 * ss(t, 241, 278)
strings(240, 290, [74, 75, 80], .3, 5.5)
music.add(EV['face_wall'], (lambda: (lambda d: (np.sin(2 * np.pi * np.cumsum(mf(88) * (1 - .35 * (tt(0, d) / d))) / SR) * np.exp(-tt(0, d) * 1.1) * .5 + noise(d, 2000, 9000, 9) * np.exp(-tt(0, d) * 3) * .3).astype(np.float32))(2.2))(), g=.7)
music.add(EV['face_wall'], echo(sub_hit(70, 28, 3.0), tail=2), g=.8)
# S6 choir + strings
choirscene(6, 292, 352, [65, 68, 72], 'o', .6, 5); strings(292, 352, [77, 80, 84], .45, 8)
for t0, m in ((346.0, 74), (347.6, 72), (349.0, 70)): music.add(t0, echo(bell(mf(m), 5.0, .5)), g=.3)
# S7 awe
for t0, m in ((356.0, 63), (363.0, 75), (371.0, 70), (380.0, 63), (390.0, 58), (399.0, 51)): music.add(t0, echo(bell(mf(m), 6.0, .5), tail=2.5), g=.3, pan=(-1) ** int(t0) * .3)
choirscene(7, 358, 408, [51, 58, 63], 'u', .5, 6)
# S8 percussion + brass braams
def braam(a, d=3.5, g=.8):
    t = tt(0, d); y = np.zeros(len(t))
    for f in (mf(26), mf(33), mf(38)): y += sum(np.sin(2 * np.pi * f * k * t * (1 + .002 * np.sin(2 * np.pi * 5 * t))) / k ** 1.1 for k in range(1, 12))
    y = np.tanh(y * .6) * np.exp(-t * .8) * ss(t, 0, .12); music.add(a, (y * g * .4).astype(np.float32))
braam(EV['strike'] - .05, 3.5, .9); braam(EV['hull_wrap'], 3.0, .7); braam(EV['flare'] + 1.2, 3.5, 1.0)
def drums(a, b, bpm=96, g=.8, pattern=(1, 0, .5, 0, .8, 0, .5, .4)):
    step = 60 / bpm / 2; t = a; k = 0
    while t < b:
        v = pattern[k % len(pattern)]
        if v: music.add(t, taiko(1.0, 58 if k % 4 else 50, v), g=g * (.85 + .15 * ss(t, a, a + 6)))
        if k % 8 == 4: music.add(t, noise(.25, 3000, 9000, k) * np.exp(-tt(0, .25) * 22) * .12, g=g)
        t += step; k += 1
drums(EV['tentacle1'] - 1, EV['cough1'] - .4, 100, .8); drums(EV['engine_catch'], EV['flare'] - .4, 104, .95, (1, .5, .6, .4, .9, .5, .7, .5)); drums(EV['flare'], 475, 100, .6)
for c in (EV['cough1'], EV['cough2'], EV['cough3']): music.add(c - .6, taiko(.8, 66, .5), g=.4)
music.add(EV['engine_catch'], riser(EV['engine_catch'] - 3.5, EV['engine_catch'], 150, 1400, .8)[:int(3.5 * SR)], g=.0)
music.add(EV['engine_catch'] - 3.5, riser(EV['engine_catch'] - 3.5, EV['engine_catch'], 150, 1400, .8), g=.45)
# S9 warm
choirscene(9, 482, 537, [58, 65, 70], 'o', .35, 6)
for t0, m in ((486, 74), (488, 77), (490, 74), (494, 72), (498, 70), (503, 74), (508, 77), (512, 79), (516, 77)): music.add(t0, echo(bell(mf(m), 5.0, .4)), g=.33)
music.add(EV['boat_lower'], echo(bell(mf(62), 7.0)), g=.4)
# S10 eerie
choirscene(10, 537, 597, [62, 65, 69], 'a', .55, 6)
music.add(EV['grandfather'] - .2, riser(EV['grandfather'] - 4, EV['grandfather'], 300, 1200, .6)[:0].astype(np.float32) if False else np.zeros(1, np.float32), g=0)
music.add(EV['grandfather'] - 3.5, riser(EV['grandfather'] - 3.5, EV['grandfather'], 300, 1300, .6), g=.5); music.add(EV['grandfather'], echo(bell(mf(69), 7.0)), g=.5); music.add(EV['grandfather'] + 1.5, echo(bell(mf(65), 7.0)), g=.4)
# S11 climax
t = EV['stairs']
while t < EV['eye_open'] - 1: music.add(t, taiko(.8, 52, .45), g=.4); t += .62
music.add(EV['eye_open'], echo(sub_hit(55, 22, 5), tail=3), g=1.0); braam(EV['eye_open'], 4.5, .8)
choirscene(11, EV['eye_open'], 662, [62, 69, 74, 77], 'a', .85, 3)
drums(EV['eye_open'] + 3, EV['hands_wheel'], 76, .75, (1, 0, 0, .6, .9, 0, .5, 0))
music.add(EV['hands_wheel'] - 1, riser(EV['hands_wheel'] - 1, EV['lamp_turn'], 130, 3200, 1.0), g=.8)
drums(EV['hands_wheel'], EV['lamp_turn'] - .3, 120, .95, (1, .6, .8, .6, 1, .6, .8, .6))
music.add(EV['lamp_turn'], echo(sub_hit(70, 20, 6), tail=4), g=1.2); braam(EV['lamp_turn'], 5, 1.0)
for k, m in enumerate((74, 81, 86, 93)): music.add(EV['lamp_turn'] + .05 + k * .09, echo(bell(mf(m), 7.0, .7)), g=.4)
drums(EV['beam_cut'] + 1, 658, 120, .9, (1, .5, .7, .5, 1, .5, .8, .6))
# S12 release
music.add(EV['gap_open'] - .2, riser(EV['gap_open'] - 5, EV['gap_open'] + .3, 180, 1600, .9)[:0].astype(np.float32) if False else np.zeros(1, np.float32), g=0)
music.add(EV['gap_open'] - 4, riser(EV['gap_open'] - 4, EV['gap_open'], 180, 1600, .9), g=.5)
music.add(EV['gap_open'], echo(sub_hit(60, 24, 5), tail=3), g=.9)
drums(676, 681, 100, .6); music.add(EV['island_dive'], echo(sub_hit(48, 20, 7, 1.1), tail=3), g=.9)
for t0 in (EV['dawn'] - 2.2, EV['dawn'], EV['dawn'] + 1.6, EV['dawn'] + 3.2, EV['dawn'] + 5.5):
    for k, m in enumerate((74, 78, 81)): music.add(t0 + k * .1, echo(bell(mf(m), 7.0, .4)), g=.22, pan=-.3 + .3 * k)
choirscene(12, 690, 720, [62, 66, 69, 74], 'a', .6, 4)
for k, t0 in enumerate((702, 704.5, 707, 709.5, 712)): music.add(t0, echo(bell(mf((81, 78, 74, 78, 69)[k]), 8.0, .35)), g=.25)
music.add(EV['end_title'] - 2, echo(bell(mf(50), 9.0, .6), tail=3), g=.35)

# ---------- ambience + SFX
def amb(a, b, lo, hi, g, lfo=.08, seed=1, pan=0):
    d = b - a; n = noise(d, lo, hi, seed); t = tt(0, d); e = (.65 + .35 * np.sin(2 * np.pi * lfo * t + seed)) * ss(t, 0, 4) * (1 - ss(t, d - 4, d)); sfx.add(a, n * e * g, pan)
amb(0, 725, 40, 380, .09, .07, 1)                     # sea bed
amb(0, 110, 400, 1600, .02, .05, 2); amb(100, 180, 300, 1800, .05, .09, 3); amb(110, 175, 500, 4000, .05, .12, 12)
amb(172, 232, 60, 500, .035, .05, 4); amb(350, 410, 30, 200, .12, .1, 5)      # underwater rumble
amb(410, 480, 80, 900, .07, .15, 6); amb(535, 600, 200, 1400, .03, .06, 7); amb(662, 700, 100, 900, .04, .1, 8)
amb(692, 725, 300, 2500, .018, .2, 13)
for t0 in np.arange(5, 700, 9.3): sfx.add(t0, creak(rng.uniform(.5, 1.2), rng.uniform(150, 260), int(t0), .12), pan=rng.uniform(-.7, .7), g=1.0 if (t0 < 230 or 410 < t0 < 535) else .0)
# S3: clock ticks, crack
tk = np.zeros(int(.04 * SR)); tk[:200] = np.hanning(400)[:200] * np.sin(2 * np.pi * 3200 * np.arange(200) / SR);
for k in range(int(EV['watch_stop'] - 140)): sfx.add(140 + k, tk.astype(np.float32), .1, .5)
cr = noise(.35, 3000, 12000, 21) * np.exp(-tt(0, .35) * 9); sfx.add(EV['watch_stop'], cr.astype(np.float32), 0, .7); sfx.add(EV['watch_stop'], bell(mf(95), 3.0, 1.0), 0, .25)
# whispers (air) + hand-on-wall rustle
for t0 in (EV['whisper1'], EV['whisper2'], EV['face_wall']): sfx.add(t0 - 1.0, echo((noise(2.2, 1800, 7000, int(t0)) * np.sin(np.pi * tt(0, 2.2) / 2.2) ** 2 * .12).astype(np.float32)), pan=rng.uniform(-.8, .8), g=1.0)
sfx.add(EV['wall_pass'], whoosh(2.0, True, peak=.5), 0, .6); sfx.add(EV['face_wall'] + .2, creak(1.8, 140, 5, .8), 0, .6)
# S6 frost + ghost stream
amb(EV['frost'], 345, 1800, 7000, .04, .3, 31, .3); sfx.add(EV['ghost_stream'], whoosh(4.0, True, peak=.4), 0, .5)
# S7 leviathan
sfx.add(EV['lev_call'], echo(lev_call(7.5, 175, 60, 1.0), tail=2.5), 0, .85); sfx.add(EV['lev_call'] + 23, echo(lev_call(9.0, 135, 42, 1.0), tail=3), 0, 1.0)
sfx.add(EV['lev_eye'], echo(sub_hit(46, 22, 4.0)), 0, .6)
# S8 kraken
sfx.add(EV['kraken_water'], whoosh(3.5, True, 400, 3500, .5, 41), 0, .35); sfx.add(EV['tentacle1'], echo((noise(2.0, 100, 2500, 43) * np.exp(-tt(0, 2.0) * 1.5) * ss(tt(0, 2.0), 0, .6) * .4).astype(np.float32)), 0.3, .5)
sfx.add(EV['strike'], echo(sub_hit(75, 28, 2.8, 1.3)), 0, 1.0); sfx.add(EV['strike'], (noise(1.8, 800, 9000, 44) * np.exp(-tt(0, 1.8) * 3.5) * .6).astype(np.float32), .2, .7); sfx.add(EV['strike'] + .05, creak(1.4, 120, 8, .9), -.3, .8)
def cough(t0, g=1.0): y = (np.sin(2 * np.pi * 46 * tt(0, .5) * (1 + .4 * np.exp(-tt(0, .5) * 8))) * np.exp(-tt(0, .5) * 7) + noise(.5, 120, 1500, int(t0 * 3)) * np.exp(-tt(0, .5) * 12) * .5); sfx.add(t0, (np.tanh(y * 1.6)).astype(np.float32), -.2, .7 * g); sfx.add(t0 + .03, bell(mf(55), .8, 2.0), 0, .06)
cough(EV['cough1']); cough(EV['cough2']); cough(EV['cough3'], 1.1)
# engine idle (diesel chug) from catch to 520
def engine(a, b, g):
    d = b - a; t = tt(0, d); chug = (np.sin(2 * np.pi * 7.5 * t) > 0.2).astype(float); y = (np.sin(2 * np.pi * 54 * t) * .8 + np.sin(2 * np.pi * 108 * t + 1) * .4 + noise(d, 60, 600, 51) * .25) * (.55 + .45 * chug); e = ss(t, 0, .4) * (1 - ss(t, d - 3, d)); sfx.add(a, (y * e * g).astype(np.float32), -.1)
engine(EV['engine_catch'], 520, .22); sfx.add(EV['engine_catch'], echo(sub_hit(70, 40, 2.0, .9)), 0, .7)
sfx.add(EV['hull_wrap'], creak(3.0, 95, 12, 1.2), -.2, .9); sfx.add(EV['hull_wrap'] + .8, creak(2.4, 130, 13, 1.1), .3, .8); sfx.add(EV['hull_wrap'] + .1, (noise(1.2, 150, 4000, 52) * np.exp(-tt(0, 1.2) * 4) * .5).astype(np.float32), 0, .6)
sfx.add(EV['flare'] - .3, (noise(.3, 800, 6000, 61) * np.exp(-tt(0, .3) * 10) * .6).astype(np.float32), .3, .8)
fl = noise(7.0, 2500, 12000, 62) * (ss(tt(0, 7.0), 0, .3) * (1 - ss(tt(0, 7.0), 4.5, 7.0))); sfx.add(EV['flare'], (fl * .2).astype(np.float32), .2, .8)
sfx.add(EV['flare'] + 1.3, echo((noise(1.2, 60, 5000, 63) * np.exp(-tt(0, 1.2) * 4) * .9).astype(np.float32)), 0, .9)
sfx.add(EV['recoil'], echo(lev_call(3.5, 480, 140, 1.0), tail=1.5), 0, .55); sfx.add(EV['recoil'] + .3, echo((noise(2.5, 80, 1200, 64) * np.exp(-tt(0, 2.5) * 2) * .6).astype(np.float32)), 0, .6)
# S9 boat
for k in range(14): sfx.add(EV['boat_lower'] + 5 + k * 1.15, (noise(.5, 300, 5000, 70 + k) * np.sin(np.pi * tt(0, .5) / .5) ** 2 * .25).astype(np.float32), .1 if k % 2 else -.1, .4)
sfx.add(EV['boat_lower'] + 6.5, echo((noise(1.6, 200, 5000, 66) * np.exp(-tt(0, 1.6) * 3.2) * .7).astype(np.float32)), 0, .5)
sfx.add(EV['boat_lower'] - .5, creak(4.5, 160, 22, .9), -.3, .5)
# S10/S11 steps, stone, eye, wheel, lamp
for k in range(int((EV['eye_open'] - EV['stairs'] - 1) / .62)):
    t0 = EV['stairs'] + k * .62; st = np.zeros(int(.12 * SR)); st[:int(.12 * SR)] = np.sin(2 * np.pi * 900 * tt(0, .12)) * np.exp(-tt(0, .12) * 55) * .6 + noise(.12, 200, 5000, k) * np.exp(-tt(0, .12) * 80) * .4
    sfx.add(t0, echo(st.astype(np.float32), ((.18, .5), (.37, .3), (.6, .2)), 1.0), -.2 if k % 2 else .2, .35)
sfx.add(EV['eye_open'] - .3, (noise(3.0, 60, 700, 80) * ss(tt(0, 3.0), 0, 1.6) * (1 - ss(tt(0, 3.0), 2.2, 3.0)) * .5).astype(np.float32), 0, .7)
gr = noise(EV['lamp_turn'] - EV['hands_wheel'], 40, 700, 81) * (.5 + .5 * np.sin(2 * np.pi * 3.2 * tt(0, EV['lamp_turn'] - EV['hands_wheel']))) ** 2 * ss(tt(0, EV['lamp_turn'] - EV['hands_wheel']), 0, 1.5); sfx.add(EV['hands_wheel'], (gr * .35).astype(np.float32), 0, .9)
dur = 18; t = tt(0, dur); hum = (np.sin(2 * np.pi * 110 * t) + .5 * np.sin(2 * np.pi * 220 * t) + .25 * np.sin(2 * np.pi * 330.5 * t)) * ss(t, 0, 1) * (1 - ss(t, 12, 18)); sfx.add(EV['lamp_turn'], (hum * .16).astype(np.float32), 0, .8)
sfx.add(EV['beam_cut'], whoosh(3.5, False, peak=1.0), 0, .7)
for t0 in (654.0, 655.4): sfx.add(t0, (noise(.4, 100, 3000, int(t0)) * np.exp(-tt(0, .4) * 10) * .5).astype(np.float32), 0, .5)
# S12
sfx.add(EV['gap_open'] - 1.0, whoosh(2.0, True, peak=.8), 0, .7); sfx.add(EV['gap_open'], echo(lev_call(7, 140, 55, 1.0), tail=3), -.3, .8); sfx.add(EV['gap_open'] + 2, echo(lev_call(7, 120, 48, 1.0), tail=3), .3, .8)
sfx.add(EV['island_dive'], echo((noise(8.0, 50, 4000, 90) * np.exp(-tt(0, 8.0) * .55) * ss(tt(0, 8.0), 0, .5) * .8).astype(np.float32), tail=2), 0, .9)
for t0, gg in ((EV['dawn'] + 1.0, .6), (EV['dawn'] + 3.8, .5), (EV['dawn'] + 9.0, .4)): sfx.add(t0, echo(gull(1.0, 1950 + 100 * gg), ((.4, .2), (.9, .1))), rng.uniform(-.6, .6), gg)
sfx.add(EV['end_title'] + 1, whoosh(4, False, peak=.2), 0, .3)

# ---------- voices
os.makedirs('build/audio/proc', exist_ok=True)
FX = {
  'N':     'highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=8:release=180,aecho=0.85:0.55:80|170:0.20|0.12,loudnorm=I=-19:TP=-3:LRA=7',
  'MARA':  'highpass=f=90,acompressor=threshold=-20dB:ratio=3:attack=6:release=150,aecho=0.9:0.4:30|60:0.15|0.08,loudnorm=I=-19:TP=-3:LRA=7',
  'NOOR':  'highpass=f=90,acompressor=threshold=-20dB:ratio=3:attack=6:release=150,aecho=0.9:0.4:30|60:0.15|0.08,loudnorm=I=-19:TP=-3:LRA=7',
  'WREN':  'highpass=f=100,acompressor=threshold=-20dB:ratio=3:attack=6:release=150,aecho=0.9:0.4:30|60:0.15|0.08,loudnorm=I=-19:TP=-3:LRA=7',
  'JONAS': 'highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=6:release=150,aecho=0.9:0.4:30|60:0.15|0.08,loudnorm=I=-19:TP=-3:LRA=7',
  'ELI':   'highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=6:release=150,aecho=0.9:0.4:30|60:0.15|0.08,loudnorm=I=-19:TP=-3:LRA=7',
  'GHOST': 'asetrate=44100*0.93,aresample=48000,atempo=1.0753,highpass=f=220,loudnorm=I=-21:TP=-3:LRA=7,aecho=0.7:0.85:90|170|260|420:0.55|0.45|0.35|0.25,chorus=0.6:0.9:55:0.4:0.25:2',
  'GRAND': 'asetrate=44100*0.97,aresample=48000,atempo=1.0309,loudnorm=I=-20:TP=-3:LRA=7,aecho=0.8:0.8:80|160|300:0.4|0.3|0.2,lowpass=f=7500',
}
PAN = {'N': 0, 'MARA': -.15, 'NOOR': .2, 'WREN': .05, 'JONAS': -.25, 'ELI': .25, 'GHOST': 0, 'GRAND': 0}
for l in L:
    out = f"build/audio/proc/{l['id']}.f32"
    if not os.path.exists(out):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f"audio/lines/{l['id']}.mp3", '-af', FX[l['sp']], '-ac', '1', '-ar', '48000', '-f', 'f32le', out], check=True)
    x = np.fromfile(out, np.float32)
    if l['sp'] == 'GHOST':
        d = int(.012 * SR); wl = np.concatenate([x, np.zeros(d, np.float32)]); wr = np.concatenate([np.zeros(d, np.float32), x]); speech.add2(l['st'], wl, wr, 1.0)
    else: speech.add(l['st'], x, PAN[l['sp']], 1.0)
# ---------- ducking + mix
def smooth_env(x, win=.06):
    k = int(win * SR); a = np.abs(x); c = np.cumsum(np.concatenate([[0], a])); e = (c[k:] - c[:-k]) / k; return np.concatenate([e, np.zeros(k - 1)])[:len(x)]
mono = (speech.l + speech.r) * .5; e = smooth_env(mono, .08); e = e[::480]; thr = .01
duck = np.clip(e / (np.percentile(e[e > 1e-4], 70) + 1e-9), 0, 1); duck = np.convolve(duck, np.ones(40) / 40, 'same'); duck = np.maximum.accumulate(np.concatenate([duck[:0], duck])) if False else duck
# attack fast, release slow
g = np.ones_like(duck); cur = 0.0
for i, d in enumerate(duck): cur = d if d > cur else cur + (d - cur) * .06; g[i] = cur
dg = np.interp(np.arange(N) / SR, np.arange(len(g)) * .01, g)
mus_g = 1 - .62 * dg; sfx_g = 1 - .45 * dg
L_ = music.l * mus_g * .85 + sfx.l * sfx_g * 1.0 + speech.l * 1.35
R_ = music.r * mus_g * .85 + sfx.r * sfx_g * 1.0 + speech.r * 1.35
mix = np.stack([L_, R_], 1)
pk = np.abs(mix).max(); print('raw peak', pk)
mix = np.tanh(mix / (pk * .95) * 1.25) / np.tanh(1.25) * .9
mix[:int(.05 * SR)] *= np.linspace(0, 1, int(.05 * SR))[:, None]; mix[-int(3.0 * SR):] *= np.linspace(1, 0, int(3.0 * SR))[:, None] ** 1.5
mix.astype(np.float32).tofile('build/audio/mix_raw.f32')
for nme, b in (('music', music), ('sfx', sfx), ('speech', speech)): np.stack([b.l, b.r], 1).astype(np.float32).tofile(f'build/audio/stem_{nme}.f32')
print('done; samples', N)
