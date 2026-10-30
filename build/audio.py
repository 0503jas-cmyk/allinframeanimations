import numpy as np, subprocess, wave
from scipy import signal as sg

SR = 48000
DUR = 36.0
N = int(SR * DUR)
rng = np.random.default_rng(7)

L = np.zeros(N); R = np.zeros(N)

def add(sig, t0, gain=1.0, pan=0.0, rev=None):
    """pan -1..1 (equal-power)"""
    i0 = int(round(t0 * SR))
    if i0 >= N or i0 + len(sig) <= 0:
        return
    a = max(0, -i0); b = min(len(sig), N - i0)
    ang = (pan + 1) * np.pi / 4
    L[i0 + a:i0 + b] += sig[a:b] * gain * np.cos(ang)
    R[i0 + a:i0 + b] += sig[a:b] * gain * np.sin(ang)

def addst(l, r, t0, gain=1.0):
    i0 = int(round(t0 * SR))
    if i0 >= N: return
    b = min(len(l), N - i0)
    L[i0:i0 + b] += l[:b] * gain; R[i0:i0 + b] += r[:b] * gain

def T(n): return np.arange(int(n * SR)) / SR
def bp(x, lo, hi, o=3): return sg.sosfilt(sg.butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=3): return sg.sosfilt(sg.butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=3): return sg.sosfilt(sg.butter(o, f, 'high', fs=SR, output='sos'), x)
def noise(n): return rng.standard_normal(int(n * SR))
def pink(n):
    w = rng.standard_normal(int(n * SR)); f = np.fft.rfft(w); k = np.arange(len(f)); k[0] = 1
    return np.fft.irfft(f / np.sqrt(k), len(w)) * 30
def fade(x, a=0.005, b=0.01):
    x = x.copy(); na = int(a * SR); nb = int(b * SR)
    if na: x[:na] *= np.linspace(0, 1, na)
    if nb: x[-nb:] *= np.linspace(1, 0, nb)
    return x
def env_at(t, pts):  # piecewise-linear automation
    return np.interp(t, [p[0] for p in pts], [p[1] for p in pts])

def make_ir(rt, n=None, pre=0.012, bright=0.6, seed=1):
    r = np.random.default_rng(seed)
    n = int(SR * rt * 1.2)
    t = np.arange(n) / SR
    out = []
    for ch in range(2):
        x = r.standard_normal(n) * np.exp(-6.91 * t / rt)
        x = lp(x, 2500 + 6000 * bright, 2)
        x[:int(pre * SR)] = 0
        for k in range(6):  # early reflections
            i = int((pre + 0.004 + r.uniform(0, 0.05)) * SR); x[i] += r.uniform(.5, 1.0) * (1 if r.random() < .5 else -1)
        out.append(x)
    return out[0] * 0.04, out[1] * 0.04

def reverb(x, rt=1.8, wet=0.4, pre=0.015, bright=0.5, seed=1):
    il, ir = make_ir(rt, pre=pre, bright=bright, seed=seed)
    l = sg.fftconvolve(x, il); r = sg.fftconvolve(x, ir)
    n = len(x) + len(il) - 1
    xd = np.pad(x, (0, n - len(x)))
    return xd * (1 - wet) + l[:n] * wet, xd * (1 - wet) + r[:n] * wet

# ---------------------------------------------------------------- события (из раскадровки)
V = 1.35; V3 = 1.4; STR = 1.5
def steps_from_phase(t0, t1, phfun, dt=1 / 960):
    ev = []; last = None
    for t in np.arange(t0, t1, dt):
        n = int(np.floor(phfun(t) / np.pi))
        if last is not None and n != last: ev.append((t, n))
        last = n
    return ev

steps = {'me': [], 'friend': []}
# S1  0..6
steps['me'] += steps_from_phase(0, 6, lambda t: 2 * np.pi * (V * t) / STR)
steps['friend'] += steps_from_phase(0, 6, lambda t: 2 * np.pi * (V * t + 0.5) / STR + np.pi)
# S2  6..12  (ph = 6.2*t_local)
steps['me'] += [(6 + t, n) for t, n in steps_from_phase(0, 6, lambda t: 6.2 * t)]
steps['friend'] += [(6 + t, n) for t, n in steps_from_phase(0, 6, lambda t: 6.2 * t + np.pi)]
# S3 12..18, S4 18..24 (x0 = 88+V3*(T-12)), S5 24..30, S6 30..36 : друг и «друг» делят фазу
steps['me'] += [(12 + t, n) for t, n in steps_from_phase(0, 6, lambda t: 2 * np.pi * (40 + V3 * t) / STR)]
steps['me'] += [(18 + t, n) for t, n in steps_from_phase(0, 6, lambda t: 2 * np.pi * (88 + V3 * (t + 6)) / STR)]
steps['me'] += [(24 + t, n) for t, n in steps_from_phase(0, 6, lambda t: 2 * np.pi * (130 + V3 * t) / STR)]
steps['me'] += [(30 + t, n) for t, n in steps_from_phase(0, 6, lambda t: 2 * np.pi * (170 + V3 * min(t, 4) + max(0, t - 4) * 1.4) / STR)]
steps['friend'] = steps['friend'] + [(t, n) for t, n in steps['me'] if 12 <= t < 32.3]  # «друг» шагает ровно в такт
VANISH = 32.3

def step_sound(seed, weight=1.0, close=1.0):
    r = np.random.default_rng(seed)
    n = int(0.42 * SR); t = np.arange(n) / SR
    thud = np.sin(2 * np.pi * (52 + 70 * np.exp(-t * 45)) * t) * np.exp(-t * 30) * 0.55 * weight
    cr = np.zeros(n)
    for g in range(int(9 + 6 * close)):
        on = r.uniform(0, 0.11) ** 1.2; ln = int(r.uniform(0.006, 0.026) * SR); i = int(on * SR)
        if i + ln >= n: continue
        burst = bp(r.standard_normal(ln), r.uniform(1500, 2800), r.uniform(5200, 9500), 2) * np.hanning(ln)
        cr[i:i + ln] += burst * r.uniform(0.4, 1.0) * np.exp(-on * 11) * 2.2 * close
    scuff = bp(r.standard_normal(n), 250, 1400, 2) * np.exp(-t * 38) * 0.5 * close
    cloth = lp(r.standard_normal(n), 900, 2) * np.exp(-t * 22) * 0.06
    return thud + cr + scuff + cloth

def step_gain(t):
    # дистанция до камеры по раскадровке
    return env_at(t, [(0, .75), (6, .75), (6.01, .32), (8.2, .32), (8.21, .55), (9.6, .55), (9.61, .5), (10.6, .5), (10.61, .18), (12, .18), (12.01, .62),
                      (18, .62), (18.01, .5), (24, .5), (24.01, 1.0), (32.3, 1.0), (34, .85), (36, .4)])

LOOP_SAMPLES = [step_sound(9001, 1.0, 1.0), step_sound(9002, 0.9, 1.0)]  # одинаковые — «круг замкнулся»
for kind, lst in steps.items():
    for i, (t, n) in enumerate(lst):
        if kind == 'friend' and t > VANISH: continue
        g = step_gain(t); loop = 12 <= t < 24.0
        smp = LOOP_SAMPLES[n % 2] if loop else step_sound(int(t * 1000) % 100000 + (0 if kind == 'me' else 77777), 1.0 + 0.1 * (n % 2), 1.0)
        pan = -0.2 if kind == 'me' else 0.22
        if kind == 'friend': g *= 0.82
        if t > 33.0: g *= 1.0
        # ближе к камере — сухие, дальше — с лёгким тембром воздуха
        if 6 <= t < 8.2: smp = lp(smp, 3500, 2)
        add(smp, t, g, pan)

# ---------------------------------------------------------------- атмосфера
tt = T(DUR)
# ветер
def wind(seed, f_lo, f_hi, lfo_f, depth=0.6):
    r = np.random.default_rng(seed)
    x = pink(DUR)[:N]
    g = (0.55 + depth * (0.5 + 0.5 * np.sin(2 * np.pi * lfo_f * tt + r.uniform(0, 6)))) * (0.6 + 0.4 * np.interp(tt, np.linspace(0, DUR, 400), r.random(400)))
    return bp(x, f_lo, f_hi, 2) * g
wl = wind(1, 120, 1100, 0.11); wr = wind(2, 130, 1000, 0.09)
wenv = env_at(tt, [(0, 0), (1.2, .035), (12, .04), (18, .05), (24, .05), (32.2, .06), (32.3, 0.0), (33.5, .006), (34.3, .045), (35.3, .04), (36, 0)])
L += wl * wenv * 1.0; R += wr * wenv * 1.0
# шелест сухих листьев (высокие, порывами)
leaf = hp(noise(DUR), 3200, 2) * (np.maximum(0, np.sin(2 * np.pi * 0.17 * tt + 1) * np.sin(2 * np.pi * 0.071 * tt)) ** 2)
L += leaf * 0.012 * env_at(tt, [(0, 0), (2, 1), (32.2, 1), (32.3, 0), (34.2, 0), (35, .8), (36, 0)]); R += np.roll(leaf, 4000) * 0.011 * env_at(tt, [(0, 0), (2, 1), (32.2, 1), (32.3, 0), (34.2, 0), (35, .8), (36, 0)])
# дальние насекомые (редкие трели)
for k, t0 in enumerate([1.9, 4.6, 7.4, 13.1, 15.6]):
    d = T(0.9); trill = np.sin(2 * np.pi * (4300 + 60 * np.sin(2 * np.pi * 5 * d)) * d) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 26 * d))) * np.hanning(len(d))
    add(trill, t0, 0.006, rng.uniform(-.8, .8))

# дрон (D1 + A1) и пустой «воздух»
drone = (np.sin(2 * np.pi * 36.71 * tt) + 0.6 * np.sin(2 * np.pi * 36.9 * tt) + 0.35 * np.sin(2 * np.pi * 55.0 * tt + 1) + 0.25 * lp(sg.sawtooth(2 * np.pi * 73.4 * tt), 260, 2))
dd = env_at(tt, [(0, 0), (3, .035), (12, .06), (18, .075), (24, .11), (32.2, .16), (32.3, 0), (34, 0), (34.4, .08), (36, 0)])
drone *= dd
# тритоновое тревожное наслоение (Ab2) с S4
dis = np.sin(2 * np.pi * 51.9 * tt) * env_at(tt, [(18, 0), (20, .02), (30, .05), (32.2, .07), (32.3, 0)])
add(drone, 0, 1.0, 0); add(dis, 0, 1.0, 0.1)
# холодный воздух мира B в разрыве бумаги
cold = bp(noise(DUR), 1400, 3800, 2) * env_at(tt, [(18.8, 0), (20, .018), (22.9, .02), (23.9, 0)]) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.4 * tt))
pad = (np.sin(2 * np.pi * 440 * tt) + np.sin(2 * np.pi * 440.7 * tt) + 0.6 * np.sin(2 * np.pi * 659.3 * tt)) * env_at(tt, [(18.8, 0), (20, .012), (22.9, .012), (23.9, 0)])
add(cold, 0, 1.0, 0.5); add(pad, 0, 1.0, 0.6)

# ---------------------------------------------------------------- музыкальная шкатулка
def box_note(f, dur=2.4, cents=0, seed=0):
    f = f * 2 ** (cents / 1200)
    t = np.arange(int(dur * SR)) / SR
    parts = [(1, 1.0, 1.9), (2.76, 0.32, 0.8), (5.4, 0.16, 0.45), (8.93, 0.07, 0.22)]
    x = sum(a * np.sin(2 * np.pi * f * r * t + 0.3 * k) * np.exp(-t / d) for k, (r, a, d) in enumerate(parts))
    click = bp(np.random.default_rng(seed).standard_normal(len(t)), 3000, 9000, 2) * np.exp(-t * 400) * 0.25
    return fade((x + click) * 0.7, 0.001, 0.05)

D5, F5, A5, G5, E5 = 587.33, 698.46, 880.0, 783.99, 659.25
motif = [(0, D5), (.5, F5), (1.0, A5), (1.5, G5), (2.0, F5), (2.5, E5), (3.0, D5)]
def motif_play(t0, stretch=1.0, cents=0.0, gain=0.17, rev_amt=0.35, reverse=False, notes=7, pan=0.1, oct_=1.0, rt=2.2):
    for i, (dt, f) in enumerate(motif[:notes]):
        n = box_note(f * oct_, 2.6 if i < 6 else 3.4, cents + (rng.uniform(-6, 6) if cents else 0), seed=i)
        if reverse: n = n[::-1]
        l, r = reverb(n, rt, rev_amt, seed=i + 3)
        addst(l, r, t0 + dt * stretch + (-len(n) / SR * 0.85 if reverse else 0), gain)
# S1..S3 : цикл идентичен (круг)
for k in range(5): motif_play(0.8 + 4.0 * k, 1.0, 0.0, 0.17)
# S4: мир B, медленнее и ниже
motif_play(20.8, 1.18, -45, 0.15, 0.6, rt=3.2)
# S5: развёрнутая запись, октавой ниже
motif_play(25.0, 1.35, -110, 0.13, 0.7, reverse=True, oct_=0.5, rt=3.5)
# S6: рассыпается и обрывается
motif_play(30.0, 1.5, -190, 0.13, 0.7, notes=3, rt=3.0)
# финал: одна чистая нота
l, r = reverb(box_note(D5, 4.0), 3.0, 0.5, seed=12); addst(l, r, 34.35, 0.2)

# ---------------------------------------------------------------- фонарь: гудение, релейные щелчки
FL = [(3.55, .5), (9.85, .4), (14.6, .7), (26.2, .9), (28.7, .6)]
def lamp_buzz(t0, t1, gain, pan):
    d = T(t1 - t0); base = np.sin(2 * np.pi * 100 * d) + 0.5 * np.sin(2 * np.pi * 200.5 * d) + 0.3 * np.sin(2 * np.pi * 301 * d) + 0.1 * lp(noise(t1 - t0), 1400, 2)
    a = np.ones_like(d)
    for ft, fd in FL:
        u = (d + t0 - ft) / fd; m = (u > 0) & (u < 1); a[m] *= 1 - 0.8 * np.sin(u[m] * np.pi)
    return fade(base * a * 0.5, 0.2, 0.2)
for (t0, t1, g, p) in [(1.5, 6.0, .028, 0.45), (6.0, 8.2, .01, 0.2), (8.2, 12, .022, 0.0), (12, 18, .014, 0.0), (18, 24, .016, 0.0), (24, 32.2, .02, -0.2), (34.2, 36, .012, 0.1)]:
    add(lamp_buzz(t0, t1, 1, 0), t0, g, p)
for ft, fd in FL:
    for c in (ft, ft + fd * 0.55):
        d = T(0.04); add(bp(noise(0.04), 1800, 7000, 2) * np.exp(-d * 180) * 3, c, 0.05, 0.1)

# ---------------------------------------------------------------- ворон: каждый раз один и тот же
def caw(seed=5):
    r = np.random.default_rng(seed); out = np.zeros(int(1.2 * SR))
    for k, (o, du, f0) in enumerate([(0, .26, 640), (.34, .28, 600), (.7, .3, 560)]):
        t = np.arange(int(du * SR)) / SR
        f = f0 * (1 - 0.35 * t / du) + 18 * np.sin(2 * np.pi * 9 * t)
        ph = 2 * np.pi * np.cumsum(f) / SR
        x = sg.sawtooth(ph) * (0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 70 * t)))
        x = bp(x, 700, 3200, 2) * np.hanning(len(t)) ** 0.6
        x += 0.35 * bp(r.standard_normal(len(t)), 1200, 4200, 2) * np.hanning(len(t))
        i = int(o * SR); out[i:i + len(x)] += x
    return out
CAW = caw()
for t0, g, p in [(3.5, .12, 0.3), (9.7, .09, 0.0), (11.2, .13, 0.0), (14.1, .05, 0.0), (18.4, .03, 0.0)]:
    l, r = reverb(CAW, 1.8, 0.28, seed=int(t0 * 10)); addst(l * 0.5, r * 0.5, t0, g * 1.4)

# ---------------------------------------------------------------- голос «друга»
vo = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', 'assets/friend.wav', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-'], capture_output=True).stdout, dtype=np.int16).astype(float) / 32768
def seg(a, b): return fade(vo[int(a * SR):int(b * SR)], 0.01, 0.03)
def resamp(x, f): return np.interp(np.arange(0, len(x) - 1, f), np.arange(len(x)), x)  # f>1: быстрее/выше
def vox(x, t0, gain, pan, lpf=7000, rt=1.1, wet=0.25, seed=1):
    x = lp(hp(x, 90, 2), lpf, 2); l, r = reverb(x, rt, wet, seed=seed)
    ang = (pan + 1) * np.pi / 4; addst(l * np.cos(ang), r * np.sin(ang), t0, gain)

A_ = seg(0.0, 3.44); B_ = seg(3.72, 5.56); C_ = seg(5.98, 10.34); D_ = seg(11.02, 12.54); EY = seg(13.16, 13.48); LOOPW = seg(6.06, 6.96)
vox(A_, 0.9, 0.85, 0.35, 5200, 1.0, 0.2)                 # S1, идёт рядом
vox(B_, 6.35, 0.8, 0.0, 4200, 1.4, 0.3)                  # S2, на кране — далеко
vox(C_, 8.6, 0.85, 0.0, 6000, 1.0, 0.22)
vox(D_, 13.3, 0.8, 0.25, 7000, 0.9, 0.18)                # S3
for k in range(4): vox(LOOPW, 15.3 + 0.9 * k, 0.75 - 0.05 * k, 0.25, 6500, 0.9, 0.2)  # зацикленный обрывок — «круг»
# настоящий друг зовёт «из другого мира» (S4)
for t0, g, p in [(19.55, .7, 0.6), (21.65, .55, 0.7), (23.0, .38, 0.8)]:
    vox(EY, t0, g, p, 3200, 3.4, 0.85, seed=int(t0))
# «оно» говорит неправильно (S5)
D_slow = resamp(D_, 0.78); D_oct = resamp(D_, 0.5)
x = lp(D_slow, 3800, 2) * 1.0; x2 = D_oct * 0.6; x3 = D_slow[::-1] * 0.25
mix = np.zeros(max(len(x), len(x2), len(x3))); mix[:len(x)] += x; mix[:len(x2)] += x2; mix[:len(x3)] += x3
vox(mix, 24.8, 0.75, -0.1, 4500, 2.4, 0.4, seed=5)
S1_ = resamp(seg(0.0, 0.75), 0.6); vox(S1_, 27.7, 0.7, 0.0, 3500, 2.8, 0.45, seed=6)
# S6: речь рассыпается на зёрна и обрывается в момент исчезновения
r = np.random.default_rng(11); gr = np.zeros(int(2.3 * SR))
for k in range(70):
    ln = int(r.uniform(0.04, 0.09) * SR); st = r.integers(0, len(vo) - ln - 1); o = int(k / 70 * (2.3 * SR - ln))
    g = resamp(vo[st:st + ln], r.choice([0.5, 0.62, 0.8, 1.2])) * np.hanning(ln) if False else vo[st:st + ln] * np.hanning(ln)
    g = np.interp(np.arange(0, ln - 1, r.choice([0.5, 0.62, 0.8, 1.25])), np.arange(ln), g)
    gr[o:o + len(g)] += g[:max(0, min(len(g), len(gr) - o))] if o + len(g) <= len(gr) else g[:len(gr) - o]
gr *= np.linspace(0.7, 1.4, len(gr)); gr = fade(gr, 0.01, 0.004)
vox(gr, 30.0, 0.8, 0.0, 4800, 2.2, 0.35, seed=8)

# ---------------------------------------------------------------- переходы: чернильная клякса
def swell(d, f0, f1, amp):
    t = np.arange(int(d * SR)) / SR; x = noise(d)
    out = np.zeros_like(x); segn = 8
    for k in range(segn):
        a, b = int(k / segn * len(x)), int((k + 1) / segn * len(x))
        f = f0 * (f1 / f0) ** (k / segn); out[a:b] = bp(x[a:b], f * 0.6, f * 1.4, 2)
    return out * (t / d) ** 2 * amp
def thud(f=55, d=0.7, amp=1.0):
    t = np.arange(int(d * SR)) / SR
    return (np.sin(2 * np.pi * (f + 90 * np.exp(-t * 18)) * t) * np.exp(-t * 7) + 0.4 * lp(noise(d), 380, 2) * np.exp(-t * 9)) * amp
for tt_ in [6.0, 12.0, 24.0, 30.0]:
    add(swell(0.3, 600, 6000, 0.55), tt_ - 0.3, 0.2, 0)
    l, r = reverb(thud(50, 0.8), 1.6, 0.3, seed=int(tt_)); addst(l, r, tt_ - 0.02, 0.5)
    add(swell(0.3, 5000, 500, 0.4)[::-1], tt_ + 0.02, 0.1, 0)
# монтажные склейки кадров вокруг «того же места»
for k, t0 in enumerate([8.2, 9.6, 10.6, 11.1, 11.5]):
    add(thud(60 + 6 * k, 0.5), t0 - 0.01, 0.28 + 0.04 * k, 0)
    add(box_note(D5, 1.2, seed=k), t0, 0.1 + 0.02 * k, 0)
    add(bp(noise(0.05), 1500, 6000, 2) * np.exp(-T(0.05) * 90) * 2, t0, 0.07, 0)

# ---------------------------------------------------------------- разрыв бумаги
def tear(d, rev=False):
    x = np.zeros(int(d * SR)); t = np.arange(len(x)) / SR
    dens = 30 + 260 * (t / d)
    imp = (np.random.default_rng(3).random(len(x)) < dens / SR).astype(float)
    crack = hp(sg.lfilter([1], [1, -0.97], imp * rng.standard_normal(len(x)) * 3), 1200, 2)
    fric = bp(noise(d), 300, 2400, 2) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 9 * t) * np.sin(2 * np.pi * 3.3 * t + 1))) * 0.22
    sh = hp(noise(d), 4500, 2) * 0.12 * (t / d)
    y = (crack + fric + sh) * np.hanning(len(x)) ** 0.4
    return y[::-1] if rev else y
add(tear(1.35), 18.85, 0.55, 0.45); add(tear(1.1, True), 22.85, 0.5, 0.45)
add(thud(45, 1.4), 18.8, 0.3, 0.4)

# ---------------------------------------------------------------- сердцебиение (S5-S6), обрыв в 32.3
def beat(t0, g):
    n = T(0.3)
    b = np.sin(2 * np.pi * (46 + 40 * np.exp(-n * 30)) * n) * np.exp(-n * 20)
    add(b, t0, g, 0); add(b * 0.6, t0 + 0.27, g, 0)
t = 23.5; i = 0
while t < VANISH - 0.3:
    bpm = env_at(t, [(23.5, 56), (30, 74), (32.3, 90)]); beat(t, env_at(t, [(23.5, 0.1), (26, 0.45), (32.3, 0.85)]) * 1.0)
    t += 60.0 / bpm; i += 1

# ---------------------------------------------------------------- тишина после исчезновения
d = T(2.6); tin = np.sin(2 * np.pi * 4150 * d) * np.minimum(1, d / 0.25) * np.minimum(1, (2.6 - d) / 0.9)
add(tin, 32.32, 0.012, 0.1)
# вынос резкой тишины: короткий «вакуумный» провал амплитуды
add(swell(0.95, 250, 7500, 1.0), 31.35, 0.32, 0)
add(thud(38, 0.5), 32.28, 0.0, 0)
duck = np.ones(N)
i0 = int(32.3 * SR); i1 = int(33.8 * SR)
duck[i0:i1] = np.concatenate([np.linspace(0.18, 0.0, int(0.03 * SR)), np.zeros(i1 - i0 - int(0.03 * SR))])
# шаги «меня» оставляем в тишине отдельно (после дака)
L *= duck; R *= duck
for t, n in steps['me']:
    if 32.3 <= t < 34.5:
        smp = step_sound(int(t * 1000) + 5, 1.0, 1.3); add(smp, t, 0.42 * (1 if t > 32.5 else 0.0), 0.0)
# финальный басовый вздох
l, r = reverb(thud(40, 2.0), 3.0, 0.5, seed=21); addst(l, r, 34.0, 0.3)

# ---------------------------------------------------------------- мастер
fin = np.minimum(1, (DUR - tt) / 0.8); fin2 = np.minimum(1, tt / 0.15)
L *= fin * fin2; R *= fin * fin2
# мягкая компрессия/ограничение
def soft(x, th=0.55): return np.tanh(x / th) * th
mid = (L + R) / 2
peak = max(np.abs(L).max(), np.abs(R).max())
g = 0.89 / peak
L = soft(L * g * 1.0, 0.8); R = soft(R * g * 1.0, 0.8)
pk = max(np.abs(L).max(), np.abs(R).max()); L *= 0.89 / pk; R *= 0.89 / pk
print('peak', np.abs(L).max(), np.abs(R).max())
st = np.stack([L, R], 1)
pcm = (np.clip(st, -1, 1) * 32767).astype('<i2')
with wave.open('mix.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('written', N / SR, 's')
