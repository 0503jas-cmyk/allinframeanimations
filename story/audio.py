"""Музыка + звуковой дизайн для «Фонаря». 60 с, 44.1 кГц, стерео. Только numpy.
72 BPM, 18 тактов = 60 с (такт = 10/3 с). Точки синхронизации совпадают с index.html."""
import sys, wave
import numpy as np

SR = 44100
D = 60.0
N = int(SR * D)
BAR = 10 / 3
BEAT = BAR / 4
rng = np.random.default_rng(7)
t_ax = np.arange(N) / SR


def midi(m): return 440.0 * 2 ** ((m - 69) / 12)


def add(buf, sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i + len(sig) <= 0: return
    a = max(0, -i); j = i + a
    seg = sig[a:a + (N - j)]
    l = gain * np.cos((pan + 1) * np.pi / 4)
    r = gain * np.sin((pan + 1) * np.pi / 4)
    buf[0, j:j + len(seg)] += seg * l
    buf[1, j:j + len(seg)] += seg * r


def env_ad(n, a, tau):
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / tau)


def piano(f, dur, vel=1.0):
    n = int(SR * dur); x = np.arange(n) / SR
    s = np.zeros(n)
    for k, (amp, dec) in enumerate([(1, 1.0), (0.5, 0.7), (0.3, 0.5), (0.18, 0.35), (0.1, 0.25), (0.06, 0.2)], 1):
        det = 1 + 0.0004 * k * k
        s += amp * np.sin(2 * np.pi * f * k * det * x) * np.exp(-x / (dec * 1.8))
    s *= env_ad(n, 0.004, dur)
    hammer = rng.standard_normal(min(n, 400)) * np.exp(-np.arange(min(n, 400)) / 60)
    s[:len(hammer)] += hammer * 0.05
    return s * vel * 0.5


def bell(f, dur, vel=1.0):
    n = int(SR * dur); x = np.arange(n) / SR
    s = (np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * f * 2.76 * x) * np.exp(-x / 0.5)
         + 0.25 * np.sin(2 * np.pi * f * 5.4 * x) * np.exp(-x / 0.25) + 0.3 * np.sin(2 * np.pi * f * 2 * x) * np.exp(-x / 1.2))
    return s * env_ad(n, 0.003, dur * 0.45) * vel * 0.35


def pad(f, dur, vel=1.0):
    n = int(SR * dur); x = np.arange(n) / SR
    s = np.zeros(n)
    for dt in (-0.0035, 0, 0.0035):
        ph = 2 * np.pi * f * (1 + dt) * x + 0.5 * np.sin(2 * np.pi * 0.23 * x)
        s += np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
    a = np.minimum(1, x / 1.2) * np.minimum(1, (dur - x) / 1.4)
    return s * a * vel * 0.12


def fft_filter(sig, lo, hi, steep=1):
    S = np.fft.rfft(sig); fr = np.fft.rfftfreq(len(sig), 1 / SR)
    m = np.ones_like(fr)
    if lo: m *= 1 / (1 + (lo / np.maximum(fr, 1e-3)) ** (4 * steep))
    if hi: m *= 1 / (1 + (np.maximum(fr, 1e-3) / hi) ** (4 * steep))
    return np.fft.irfft(S * m, len(sig))


def noise(n, lo=None, hi=None):
    return fft_filter(rng.standard_normal(n), lo, hi)


def smooth(a, b, x):
    u = np.clip((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u)


# ---------- гармония ----------
# (корень midi, тип) на каждый из 18 тактов
Am, F, C, Dm, E, G = 57, 53, 48, 50, 52, 55
chords = [
    (Am, 'm'), (F, 'M'), (C, 'M'),
    (Dm, 'm'), (Am, 'm'), (E, 'M'),
    (Am, 'm'), (Dm, 'm'), (Am, 'm'),
    (F, 'M'), (C, 'M'), (G, 'M'),
    (Am, 'm'), (F, 'M'), (C, 'M'),
    (F, 'M'), (C, 'M'), (C, 'M'),
]
def triad(root, kind): return [root, root + (3 if kind == 'm' else 4), root + 7]

music = np.zeros((2, N))
rev_in = np.zeros((2, N))   # шина для реверберации
dry = np.zeros((2, N))

# интенсивность по сценам: (арпеджио, подушка, бас, мелодия)
def scene_of(bar):
    if bar < 3: return 1
    if bar < 6: return 2
    if bar < 9: return 3
    if bar < 12: return 4
    if bar < 15: return 5
    return 6

for bar, (root, kind) in enumerate(chords):
    t0 = bar * BAR
    sc = scene_of(bar)
    tri = triad(root, kind)
    # подушка
    pv = {1: 0.5, 2: 0.7, 3: 0.9, 4: 0.8, 5: 1.0, 6: 1.1}[sc]
    for m in tri:
        add(rev_in, pad(midi(m + 12), BAR + 1.0, pv), t0, 0.8, rng.uniform(-0.4, 0.4))
    add(rev_in, pad(midi(root), BAR + 1.0, pv * 1.2), t0, 0.7)
    # бас (синус)
    if sc != 3 or bar == 8:
        f = midi(root - 12); n = int(SR * (BAR + 0.5)); x = np.arange(n) / SR
        b = np.sin(2 * np.pi * f * x) * env_ad(n, 0.02, 2.2) * 0.5 + 0.12 * np.sin(2 * np.pi * f * 2 * x) * env_ad(n, 0.02, 1.0)
        add(dry, b, t0, {1: 0.5, 2: 0.7, 4: 0.6, 5: 0.7, 6: 0.55, 3: 0.4}[sc])
    # арпеджио
    if sc == 1:
        step, pat, vel = BEAT / 2, [0, 2, 1, 2, 0, 2, 1, 2], 0.5
    elif sc == 2:
        step, pat, vel = BEAT / 4, [0, 1, 2, 1] * 4, 0.55
    elif sc == 3:
        step, pat, vel = BEAT, [0, 2] if bar != 7 else [1, 2, 0, 2], 0.35
    elif sc == 4:
        step, pat, vel = BEAT / 2, [0, 2, 1, 2, 1, 2, 0, 2], 0.5
    elif sc == 5:
        step, pat, vel = BEAT / 2, [0, 1, 2, 1, 2, 1, 2, 1], 0.58
    else:
        step, pat, vel = BEAT / 2, [0, 2, 1, 2] * 2, 0.5
    for i, p in enumerate(pat):
        m = tri[p] + (12 if sc != 2 else 0) + (12 if p == 2 and sc != 2 else 0)
        tt = t0 + i * step
        accent = 1.25 if i % (len(pat) // 2 or 1) == 0 else 1.0
        if sc == 3 and bar == 6 and i > 0: continue
        add(dry, piano(midi(m), 1.6, vel * accent), tt, 0.7, -0.25 + 0.5 * (i % 2))
        add(rev_in, piano(midi(m), 1.6, vel * accent), tt, 0.35, -0.25 + 0.5 * (i % 2))

# мелодия (колокольчик-челеста) по тактам: (доля, midi, длительность)
mel = {
    1: [(0, 72, 3), (2, 76, 1.5), (3, 74, 1)],                   # такт 2 (F)
    2: [(0, 76, 2), (2, 79, 2)],                                  # такт 3 (C)
    9: [(0, 81, 4)],                                              # такт 10 (F) — первый огонёк
    10: [(0, 84, 2), (2, 79, 2)],
    11: [(0, 83, 2), (2, 79, 1), (3, 74, 1)],
    12: [(0, 81, 2), (2, 76, 2)],
    13: [(0, 77, 2), (2, 81, 2)],
    14: [(0, 84, 4)],                                             # такт 15 (C) — зажигание
    15: [(0, 81, 2), (2, 84, 2)],
    16: [(0, 79, 2), (2, 84, 2)],
    17: [(0, 84, 6)],
}
for bar, notes in mel.items():
    for beat, m, db in notes:
        tt = bar * BAR + beat * BEAT
        add(rev_in, bell(midi(m), 4.0, 0.9), tt, 0.9, 0.15)
        add(dry, bell(midi(m), 3.0, 0.6), tt, 0.6, 0.15)

# литавры в шторме (такты 4–6): на сильные доли
for bar in (3, 4, 5):
    for beat in (0, 2):
        tt = bar * BAR + beat * BEAT
        n = int(SR * 1.3); x = np.arange(n) / SR
        f = 70 * np.exp(-x * 1.2) + 42
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / 0.45) * 0.9
        s += noise(n, 60, 400) * np.exp(-x / 0.06) * 0.25
        add(dry, s, tt, 0.9 * (1.0 if beat == 0 else 0.7))

# ---------- SFX ----------
sfx = np.zeros((2, N))
def bandnoise(lo, hi): return np.stack([noise(N, lo, hi), noise(N, lo, hi)])

# шторм: ветер + дождь
storm = (smooth(8.5, 12.5, t_ax) * (1 - 0.85 * smooth(17.5, 23, t_ax)) * (1 - 0.7 * smooth(34, 42, t_ax)))
gust = 1 + 0.4 * np.sin(2 * np.pi * 0.31 * t_ax) + 0.25 * np.sin(2 * np.pi * 0.77 * t_ax + 1)
gust += 1.2 * np.exp(-np.clip(t_ax - 14.8, 0, None) / 0.5) * (t_ax >= 14.55) * smooth(14.55, 14.8, t_ax)
wind = bandnoise(180, 1400) * (storm * gust * 0.5 + 0.05 * (1 - smooth(8, 12, t_ax)))[None]
rain = bandnoise(3500, 11000) * (storm * 0.16)[None]
sfx += wind * 0.8 + rain

# волны (всё время), мягко
waves = bandnoise(60, 600)
swell = 0.5 + 0.5 * np.sin(2 * np.pi * t_ax / 7.5 + np.sin(2 * np.pi * t_ax / 19))
sfx += waves * ((0.12 + 0.2 * storm) * swell)[None]

# гром (треск в момент вспышки + раскат)
for t0, k in [(12.2, 1.0), (13.4, 0.6), (16.8, 0.9)]:
    n = int(SR * 5.0); x = np.arange(n) / SR
    crack = noise(n, 400, 6000) * np.exp(-x / 0.05)
    roll = noise(n, 25, 160) * np.exp(-x / 1.6) * (1 + 0.5 * np.sin(2 * np.pi * 3.3 * x))
    th = (crack * 0.7 + roll * 3.2) * k
    add(sfx, th, t0, 0.9, rng.uniform(-0.3, 0.3))

# мерцание фонаря: потрескивание 12.8–14.8
for tt in np.sort(rng.uniform(12.9, 14.7, 22)):
    n = int(SR * 0.03)
    add(sfx, noise(n, 1500, 7000) * np.exp(-np.arange(n) / 250), tt, 0.1 * (1.0 - (tt - 12.8) / 3))
# порыв и гашение в 14.8
n = int(SR * 1.4); x = np.arange(n) / SR
whoosh = noise(n, 300, 3500) * np.sin(np.pi * np.clip(x / 1.4, 0, 1)) ** 1.5
add(sfx, whoosh, 14.2, 0.55)
f = 260 * np.exp(-x * 3.0) + 60
dive = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / 0.35)
add(sfx, dive, 14.8, 0.28)
add(sfx, noise(int(SR * 0.4), 800, 5000) * np.exp(-np.arange(int(SR * 0.4)) / 3000), 14.8, 0.25)

# тишина-пустота: низкий дрон сцены 3
n = int(SR * 9); x = np.arange(n) / SR
drone = (np.sin(2 * np.pi * 55 * x) + 0.5 * np.sin(2 * np.pi * 82.4 * x)) * np.sin(np.pi * x / 9) ** 2
add(sfx, drone, 20.5, 0.10)

# мигания маяка 30.0 / 31.3 / 32.6 — высокие колокольчики; ровный свет с 34
for tt in (30.0, 31.3, 32.6):
    add(rev_in, bell(midi(88), 3.5, 1.0), tt, 0.5, 0.3)
n = int(SR * 3); x = np.arange(n) / SR
swell_pad = (np.sin(2 * np.pi * midi(53) * x) + np.sin(2 * np.pi * midi(60) * x) * 0.6) * np.sin(np.pi * x / 3) ** 2
add(rev_in, swell_pad, 33.4, 0.18)
# поворот луча — мягкий воздух
for tt in (36.0, 39.5, 43.0):
    n = int(SR * 2.2); x = np.arange(n) / SR
    add(sfx, noise(n, 500, 2500) * np.sin(np.pi * x / 2.2) ** 2, tt - 1.0, 0.18, -0.4 + 0.4 * (tt > 40))
# лёгкий проход камеры (whip) около 29.8
n = int(SR * 1.2); x = np.arange(n) / SR
add(sfx, noise(n, 400, 4000) * np.sin(np.pi * x / 1.2) ** 2, 29.2, 0.22, 0.2)

# искра: восходящий блеск 44.6 → 46.67, затем удар зажигания
n = int((46.67 - 44.6) * SR); x = np.arange(n) / SR
fr = 500 * 2 ** (x / (n / SR) * 2.6)
spark = np.sin(2 * np.pi * np.cumsum(fr) / SR) * (x / (n / SR)) ** 2 * 0.5
spark += np.sin(2 * np.pi * np.cumsum(fr * 2.01) / SR) * (x / (n / SR)) ** 3 * 0.25
spark *= (0.6 + 0.4 * np.sin(2 * np.pi * 11 * x))
add(rev_in, spark, 44.6, 0.35)
add(sfx, noise(n, 3000, 9000) * (x / (n / SR)) ** 3 * 0.5, 44.6, 0.2)
# зажигание 46.67 — тёплый «пуф» + аккорд колокольчиков
n = int(SR * 2.5); x = np.arange(n) / SR
whump = np.sin(2 * np.pi * (48 * np.exp(-x * 2) + 38) * x) * np.exp(-x / 0.6)
add(sfx, whump, 46.67, 0.7)
for m in (72, 76, 79, 84):
    add(rev_in, bell(midi(m), 5.0, 1.0), 46.67, 0.7, rng.uniform(-0.3, 0.3))
add(sfx, noise(int(SR * 0.6), 600, 5000) * np.exp(-np.arange(int(SR * 0.6)) / 4500), 46.67, 0.28)

# рассвет: птицы-чириканье не добавляем; мягкий воздух + чайка-подобные glissando нет — только шум моря

# ---------- реверберация ----------
def make_ir(sec=2.6):
    n = int(SR * sec); x = np.arange(n) / SR
    out = []
    for c in range(2):
        r = rng.standard_normal(n) * np.exp(-x / 0.7)
        r = fft_filter(r, 200, 5500)
        r[:int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
        out.append(r)
    return np.stack(out)

ir = make_ir()
L = N + ir.shape[1]
wet = np.zeros((2, N))
for c in range(2):
    sz = 1 << (L - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(rev_in[c], sz) * np.fft.rfft(ir[c], sz), sz)[:N]
    wet[c] = y
wet *= 0.055 / (np.abs(wet).max() + 1e-9) * np.abs(rev_in).max() * 18
wet *= 1.0

mix = dry * 0.8 + wet * 1.0 + rev_in * 0.35 + sfx * 1.0

# ---------- сведение: финал, фейды, мягкий лимитер ----------
fade_in = smooth(0, 0.8, t_ax)
fade_out = 1 - smooth(57.8, 60.0, t_ax)
mix *= (fade_in * fade_out)[None]
# сайдчейн музыки не нужен; общий мягкий клиппинг
peak = np.abs(mix).max()
mix = mix / peak * 0.9
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
# DC и щелчки: фильтр верхних
mix -= mix.mean(axis=1, keepdims=True)
mix = mix / np.abs(mix).max() * 0.89

pcm = (np.clip(mix, -1, 1) * 32767).astype('<i2')
inter = np.empty(N * 2, dtype='<i2'); inter[0::2] = pcm[0]; inter[1::2] = pcm[1]
out = sys.argv[1] if len(sys.argv) > 1 else 'lantern.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(inter.tobytes())
print('ok', out, 'peak', np.abs(mix).max(), 'rms', np.sqrt((mix ** 2).mean()))
