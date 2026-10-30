"""Synthesises music + SFX (numpy only), mixes with the ElevenLabs narration -> audio/mix.wav
usage: python3 -I audio.py <narration.mp3> <out.wav>
All event times are seconds on the video timeline (see README for the cue table)."""
import sys, subprocess, numpy as np

SR = 44100
DUR = 97.5
N = int((DUR + 3.0) * SR)
rng = np.random.default_rng(1983)
T = lambda d: np.arange(int(d * SR)) / SR

L = np.zeros(N, np.float32); R = np.zeros(N, np.float32)      # dry music+sfx
ML = np.zeros(N, np.float32); MR = np.zeros(N, np.float32)    # music only (ducked later)
REV = np.zeros(N, np.float32)                                 # reverb send
ML_rev = np.zeros(N, np.float32)

def put(sig, t, gain=1.0, pan=0.0, rev=0.0, music=False):
    i = int(t * SR)
    if i >= N or i < 0: return
    sig = sig[: N - i].astype(np.float32)
    gl = gain * np.sqrt(.5 * (1 - pan)) * 1.0; gr = gain * np.sqrt(.5 * (1 + pan))
    (ML if music else L)[i:i + len(sig)] += sig * gl
    (MR if music else R)[i:i + len(sig)] += sig * gr
    if rev: REV[i:i + len(sig)] += sig * gain * rev

def env_ar(n, a, r):
    e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na) ** 1.5; e[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return e

def lp(x, k):  # moving-average lowpass (cheap)
    k = max(1, int(k)); return np.convolve(x, np.ones(k) / k, mode='same')

def noise(d): return rng.standard_normal(int(d * SR))

# ---------------- instruments ----------------
def pluck(f, d=1.2, bright=1.0, dec=3.0):
    t = T(d); s = np.zeros_like(t)
    for h in range(1, 7): s += np.sin(2 * np.pi * f * h * t) * np.exp(-t * (dec + h * 1.6 / bright)) / h ** 1.1
    return s * np.minimum(1, t * 400)

def padnote(f, d, harm=9, roll=1.25, det=.0035, att=1.6, rel=2.0):
    t = T(d); s = np.zeros_like(t)
    for dd in (-det, 0, det):
        ph = rng.uniform(0, 6.28)
        for h in range(1, harm + 1):
            s += np.sin(2 * np.pi * f * (1 + dd) * h * t + ph * h) / h ** roll
    s *= env_ar(len(t), att, rel)
    s *= 1 + .08 * np.sin(2 * np.pi * .23 * t + rng.uniform(0, 6))
    return s / 3

def boom(d=2.6, f0=95, f1=32, noise_amt=.5, hp=0):
    t = T(d); ph = 2 * np.pi * (f1 * t + (f0 - f1) / 9 * (1 - np.exp(-9 * t)))
    s = np.sin(ph) * np.exp(-t * 1.9)
    n = lp(noise(d), 14) * np.exp(-t * 6) * noise_amt * 2.2
    return (s + n) * np.minimum(1, t * 800)

def whoosh(d=.7, f0=300, f1=3000, amp=.5, peak=.7):
    t = T(d); x = t / d; fr = f0 * (f1 / f0) ** x
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * .35
    n = noise(d); n = n - lp(n, 6 + 40 * (1 - x).mean())
    e = np.where(x < peak, (x / peak) ** 2, ((1 - x) / (1 - peak)) ** 1.5)
    return (s + n * .25) * e * amp

def riser(d, f0=120, f1=2400, amp=.5):
    t = T(d); x = t / d; fr = f0 * (f1 / f0) ** (x ** 1.5)
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * .5 + np.sin(2 * np.pi * np.cumsum(fr * 1.5) / SR) * .25
    n = noise(d); n = n - lp(n, 12); s += n * .35 * x
    return s * (x ** 2.2) * amp * (1 + .25 * np.sin(2 * np.pi * 9 * t))

def click(f=1800, d=.05, amp=.5):
    t = T(d); return (np.sin(2 * np.pi * f * t) * .6 + noise(d)[: len(t)] * .5) * np.exp(-t * 140) * amp

def tick(hi=True, amp=.5):
    a = click(2600 if hi else 1700, .12, amp); t = T(.12)
    return a + np.sin(2 * np.pi * (220 if hi else 150) * t) * np.exp(-t * 60) * amp * .5

def ping(f=1318, d=1.2, amp=.35):
    t = T(d); return (np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t * 4.5) * amp

def bell(f, d=4.0, amp=.3):
    t = T(d); s = np.zeros_like(t)
    for r, a in ((1, 1), (2.76, .5), (5.4, .3), (8.9, .15)): s += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * (1.2 + r * .5))
    return s * amp

def alarm(d, amp=.22):
    t = T(d); fr = np.where((t * 3) % 2 < 1, 700, 960).astype(float)
    ph = 2 * np.pi * np.cumsum(fr) / SR
    s = np.sign(np.sin(ph)) * .5 + np.sin(ph) * .5 + np.sin(3 * ph) * .15
    s = lp(s, 3)
    return s * amp * np.minimum(1, t * 50) * np.minimum(1, (d - t) * 20)

def heartbeat(amp=.6):
    t = T(.9); s = np.zeros_like(t)
    for off, a in ((0, 1.0), (.22, .7)):
        i = int(off * SR); tt = T(.4); thump = np.sin(2 * np.pi * (58 + 20 * np.exp(-tt * 20)) * tt) * np.exp(-tt * 14) * a
        s[i:i + len(tt)] += thump[: len(s) - i]
    return s * amp

def static(d, amp=.4):
    n = noise(d); n = n - lp(n, 3); t = T(d); return n * amp * np.exp(-t * 7)

def crackle(d, amp=.3):
    t = T(d); n = np.zeros_like(t); idx = rng.integers(0, len(t), int(d * 90)); n[idx] = rng.standard_normal(len(idx)) * 2
    n = lp(n, 4) + lp(noise(d), 60) * .25
    return n * amp * np.minimum(1, t * 3)

# ---------------- music bed ----------------
def curve(pts, t):  # piecewise-linear intensity
    xs, ys = zip(*pts); return np.interp(t, xs, ys)

tt_all = np.arange(N) / SR
inten = curve([(0, .55), (6, .5), (12, .45), (19, .5), (27, .35), (29.9, .5), (34, .75), (44, .9), (51, 1.0), (52, .55), (59, .45), (62.7, .35), (63.5, 0.0),
               (64.3, 0.0), (64.45, .8), (65.3, .3), (69.0, .6), (69.75, .7), (69.9, .0), (70.0, .5), (79.3, .5), (91.5, .7), (92, .5), (96, .3), (100, 0)], tt_all)

A1, E2, A2, C3, E3, G3, A3 = 55., 82.41, 110., 130.81, 164.81, 196., 220.
def chord(freqs, t0, t1, amp=.5, **kw):
    for i, f in enumerate(freqs):
        put(padnote(f, t1 - t0 + 2.0, **kw), t0, amp / len(freqs) * 2, pan=(-.35 + .7 * (i % 3) / 2), rev=.35, music=True)

# dark drone sections (long pads, Am)
chord([A1, A2, E3, C3 * 2], 0, 27, .85, harm=7, att=3, rel=3)
chord([A1, A2, E3 * 1.0, 233.08], 27, 34.4, .9, harm=9, att=1, rel=1.5)      # Bb tension
chord([A1, A2, E3, 261.63 * 2.0, 466.16], 34.4, 51.3, 1.0, harm=10, att=1.5, rel=1.5)
chord([A1 * 0.75, E2, 87.31 * 2, 233.08], 51.3, 62.9, .8, harm=8, att=2, rel=0.6)
chord([A1, A2], 64.34, 69.8, .8, harm=6, att=.6, rel=1.5)
# calm (relief)  A major / D
chord([A2, E3, 277.18, 329.63], 69.9, 79.3, .8, harm=5, roll=1.6, att=1.5, rel=1.0)
# emotional progression Am - F - C - G (one chord each ~3.05s)
prog = [[110, 164.81, 220, 261.63, 329.63], [87.31, 130.81, 174.61, 261.63, 349.23], [130.81, 196, 261.63, 329.63, 392], [98, 146.83, 196, 246.94, 392]]
for k in range(4): chord(prog[k], 79.3 + k * 3.05, 79.3 + (k + 1) * 3.05 + .3, .95, harm=8, roll=1.5, att=.9, rel=1.2)
chord([110, 164.81, 220, 277.18, 329.63], 91.5, 97.0, 1.0, harm=7, roll=1.6, att=1.4, rel=2.5)   # resolve to A major

# pulsing bass ostinato (8ths @ 100 BPM) during the tense middle
beat = 0.3
for k in range(int((63.2 - 29.9) / beat)):
    t = 29.9 + k * beat
    if 31.0 < t < 34.4 or t >= 34.4:
        amp = .5 + .5 * ((t - 29.9) / 33.1)
        f = A1 if (k % 8) not in (5, 6) else 58.27
        put(pluck(f, .5, .6, 5) * amp * (1.3 if k % 4 == 0 else .8), t, .55, music=True)
# arp sparkles in the intro
for k, t in enumerate(np.arange(6.4, 27.0, .6)):
    if hash((k * 7) % 5) % 5 > 1: put(pluck([440, 523.25, 659.26, 392][k % 4], 1.4, 1.4, 4) * .3, t, .22, pan=(-1) ** k * .5, rev=.8, music=True)
# tense high ostinato, 43.8 -> 51.3
for k, t in enumerate(np.arange(43.8, 51.3, .15)):
    put(pluck([220, 233.08, 261.63, 311.13][k % 4] * 2, .3, 1.5, 9) * .25, t, .25 * (.5 + (t - 43.8) / 7.5), pan=(-1) ** k * .4, rev=.3, music=True)
# calm piano arps 70 -> 79
for k, t in enumerate(np.arange(70.2, 79.2, .55)):
    put(pluck([440, 554.37, 659.26, 493.88][k % 4], 1.8, 1.0, 2.5) * .8, t, .3, pan=(-1) ** k * .3, rev=.7, music=True)
# emotional melody 79.3 -> 91.5
mel = [(0, 659.26), (1.5, 587.33), (3.05, 523.25), (4.6, 523.25), (6.1, 659.26), (7.6, 698.46), (9.15, 783.99), (10.7, 659.26)]
for dt, f in mel: put(pluck(f, 2.8, 1.0, 1.4) * .9, 79.5 + dt, .38, rev=.9, music=True)

# ---------------- cue table (SFX) ----------------
def hit(t, size=1.0, rev=.5, pan=0): put(boom() * size, t, .8, pan, rev)
def cut(t, kind='whoosh', size=1.0):
    put(whoosh(.55, 250, 4000, .6), t - .5, .7, rev=.3)
    hit(t, size, .6)

# hook
for t, s in ((.34, .6), (1.18, .6), (3.17, .6), (5.35, 1.0)): hit(t, s * .7, .4); put(click(), t, .5)
put(riser(1.2, 80, 900, .6), 4.1, .5, rev=.3); put(riser(1.0, 100, 1200, .7), 0, .3)
cut(6.2, size=.7)
# date + globe
for k, t in enumerate(np.arange(7.8, 10.3, .08)): put(click(1400 + 25 * k, .04, .3), t, .5, pan=-.2 + .004 * k)
hit(10.5, .6, .6); put(riser(2.5, 100, 1800, .4), 8.0, .6, rev=.5)
put(ping(1760, 2, .5), 11.2, .8, rev=.9); put(whoosh(.5, 400, 2500, .5), 11.9, .6, 0)
put(whoosh(.5, 3000, 300, .6), 12.35, .7)
cut(12.85, size=.6)
# control room
put(whoosh(.5, 300, 1800, .5), 14.1, .6); put(whoosh(.5, 300, 1800, .5), 15.2, .5); put(tick(), 14.5, .4)
for t in np.arange(13.0, 19.0, 1.1): put(ping(2200, .8, .25), t, .25, pan=.5, rev=.7)
cut(19.2, size=.8)
# plane
put(riser(1.45, 300, 4200, .6), 22.85, .6)       # missile whistle
put(boom(3.5, 120, 28, .9) * 1.2, 24.3, .95, rev=.8); put(static(1.6, .6), 24.3, .6, rev=.4)
put(whoosh(.6, 200, 600, .5), 24.4, .5)
hit(26.5, 1.2, .8); put(whoosh(.5, 300, 3000, .6), 25.9, .7)
cut(27.0, size=.7)
# midnight clock + alarm
for t, hi in ((27.3, 1), (28.3, 0), (29.3, 1)): put(tick(bool(hi), .9), t, .8, rev=.2)
put(boom(1.5, 70, 40, .2), 29.3, .6)
put(alarm(3.4, .26), 29.95, 1.0, rev=.25)
hit(29.95, 1.1, .5); put(whoosh(.35, 800, 5000, .6), 29.6, .6)
put(ping(1400, 1.6, .6), 33.1, .9, rev=.8)          # first launch
put(riser(2.6, 200, 900, .5), 30.9, .4)
# missiles 2-5
for t in (35.17, 36.21, 36.84, 37.3): put(ping(1000 + 150 * (t % 3), 1.0, .5), t, .8, pan=.2, rev=.7); hit(t, .25, .3)
# terminal + confidence
for k in range(8): put(click(1100, .04, .5), 40.3 + k * .07, .6)
hit(40.45, .9, .6)
put(riser(2.4, 150, 1500, .5), 41.2, .5)
cut(43.8, size=.7)
# chain of command nodes
for t in (44.1, 45.73, 46.7, 47.7): put(ping(660 + (t - 44) * 40, 1.0, .5), t, .8, rev=.6); hit(t, .3, .4)
put(riser(.9, 150, 1600, .8), 47.6, .8)
hit(48.5, 1.3, .8); put(whoosh(.9, 200, 2200, .6), 48.5, .7)
for t in np.arange(50.35, 51.3, .5): put(tick(True if (t * 2) % 2 == 0 else False, .8), t, .8)
hit(50.36, .6, .5)
# S8 doubt
put(static(.6, .8), 51.3, .8); hit(51.3, .8, .5)
for k in range(5): put(heartbeat(.9), 51.5 + k * .85 * (1 - .06 * k), .7)
hit(54.0, .7, .7); put(whoosh(.5, 600, 200, .5), 53.9, .5)
for i in range(5): put(ping(900 + 90 * i, .8, .4), 54.3 + .12 * i, .7, pan=-.4 + .2 * i, rev=.6)
put(whoosh(.9, 200, 3500, .5), 55.15, .8); put(riser(1.6, 200, 800, .4), 55.2, .5)
for t in (57.6, 58.4): put(ping(500, 1.8, .35), t, .5, rev=.9)
hit(58.65, .5, .8)
# S9
hit(59.05, .8, .6)
hit(59.47, 1.0, .5); put(click(900, .08, .9), 59.47, .9); put(heartbeat(1.0), 60.2, .8); put(heartbeat(1.0), 61.0, .8)
hit(60.14, .6, .5)
put(click(1000, .06, .8), 61.9, .8); put(click(700, .06, .6), 62.0, .6); put(lp(noise(.5), 8) * np.exp(-T(.5) * 5) * .6, 62.4, .6)
put(riser(.8, 80, 700, .9), 63.55, .8)
hit(64.34, 1.5, .9); put(static(.5, .8), 64.34, .6); put(boom(4, 140, 25, 1.0), 64.34, 1.0, rev=.9)
# S10 waiting / burn
for t in np.arange(65.5, 68.4, 1.0): put(tick(True, .9), t, .9, rev=.3)
put(riser(1.5, 60, 500, .8), 68.3, .7)
put(crackle(1.8, .6), 68.2, .8)
put(boom(2.0, 60, 30, .4), 69.4, .5)
# S11
put(whoosh(.4, 2000, 300, .5), 69.7, .5)
for k, t in enumerate(np.arange(69.9, 71.5, .12)): put(tick(k % 2 == 0, .5), t, .35 * max(.3, 1 - k * .06))
put(bell(880, 3.5, .35), 69.95, .6, rev=.9)
put(ping(1568, 1.8, .4), 72.2, .6, rev=.9); put(ping(1318, 1.8, .4), 73.2, .6, rev=.9)
put(whoosh(.7, 300, 2500, .4), 74.5, .5)
put(riser(1.2, 300, 3000, .4), 75.8, .5)
put(ping(2000, 1.2, .35), 77.2, .5, rev=.9); put(whoosh(.5, 500, 5000, .4), 77.0, .5)
for k in range(3): put(click(1900, .12, .9), 78.1 + k * .22, .8)
put(whoosh(.35, 3000, 400, .5), 78.8, .6); put(bell(1318, 3, .4), 78.9, .6, rev=.9)
# S12
cut(79.3, size=.7)
put(bell(220, 5, .25), 82.3, .5, rev=.9)
put(alarm(1.6, .12), 87.0, .8)
tt = T(.9); put(np.sin(2 * np.pi * np.cumsum(9000 * np.exp(-tt * 5.5)) / SR) * np.exp(-tt * 2.5) * .35, 88.95, .6)
put(boom(1.6, 80, 30, .3), 89.6, .7, rev=.7)
put(riser(1.3, 100, 1200, .6), 89.0, .5)
put(bell(440, 5, .3), 89.75, .6, rev=.9); put(bell(659.26, 5, .25), 90.4, .5, rev=.9)
# S13
hit(91.6, 1.1, .8); put(bell(110, 6, .35), 91.65, .7, rev=.9); put(bell(1760, 4, .22), 95.0, .5, rev=.9)
put(bell(880, 5, .25), 96.2, .5, rev=.9)

# ---------------- voice + mix ----------------
voice_mp3, out = sys.argv[1], sys.argv[2]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', voice_mp3, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
v = np.frombuffer(raw, np.float32).copy()
vo = np.zeros(N, np.float32); vo[: len(v)] = v[: N]
# voice presence: gentle high-pass + normalise
vo = vo - lp(vo, 400) * .8
vo = vo / (np.percentile(np.abs(vo[: len(v)]), 99.9) + 1e-9) * .8
# ducking: envelope of voice
e = lp(np.abs(vo), int(.05 * SR)); e = lp(e, int(.35 * SR)); duck = 1 - .78 * np.clip(e / .1, 0, 1)
# reverb on send bus
def make_ir(seed, rt=2.6):
    r = np.random.default_rng(seed); n = int(rt * SR); t = np.arange(n) / SR
    ir = r.standard_normal(n) * np.exp(-t * 6.9 / rt); ir[: int(.012 * SR)] *= np.linspace(0, 1, int(.012 * SR)); ir /= np.sqrt((ir ** 2).sum()); return ir.astype(np.float32)
nfft = 1 << 23
FR = np.fft.rfft(REV, nfft)
wet = []
for sd in (11, 12):
    ir = make_ir(sd); w = np.fft.irfft(FR * np.fft.rfft(ir, nfft), nfft)[:N].astype(np.float32); wet.append(w * .55)
sd = 1 - .62 * np.clip(e / .1, 0, 1)
wet = [w * (.5 + .5 * sd) for w in wet]
mix_l = (ML * duck * inten * .9 + L * sd + wet[0]) * .46 + vo
mix_r = (MR * duck * inten * .9 + R * sd + wet[1]) * .46 + vo
# fade in/out
fade = np.clip(tt_all / .15, 0, 1) * np.clip((DUR - tt_all) / 1.4, 0, 1)
mix_l *= fade; mix_r *= fade
sp = e > .02
bed = (mix_l - vo)[: int(DUR*SR)]; v_ = vo[: int(DUR*SR)]; spm = sp[: int(DUR*SR)]
print('speech-region RMS dB: voice %.1f  music+sfx %.1f  -> voice-to-bed %.1f dB' % (20*np.log10(np.sqrt((v_[spm]**2).mean())), 20*np.log10(np.sqrt((bed[spm]**2).mean())), 20*np.log10(np.sqrt((v_[spm]**2).mean())/np.sqrt((bed[spm]**2).mean()))))
m = np.stack([mix_l[: int(DUR * SR)], mix_r[: int(DUR * SR)]], 1)
m = np.tanh(m * 1.1) / np.tanh(1.1); peak = np.abs(m).max(); m = m / peak * .9
import wave
w = wave.open(out, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((m * 32767).astype('<i2').tobytes()); w.close()
print('wrote', out, 'peak before norm', peak)
