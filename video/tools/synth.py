"""Small numpy synth for score and SFX. All functions return float32 mono arrays at SR."""
import numpy as np, wave

SR = 44100
rng = np.random.default_rng(7)


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def env_adsr(n, a=0.02, d=0.1, s=0.7, r=0.2):
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    e = np.ones(n) * s
    e[:a_n] = np.linspace(0, 1, a_n, endpoint=False)
    e[a_n:a_n + d_n] = np.linspace(1, s, d_n)
    e[n - r_n:] *= np.linspace(1, 0, r_n)
    return e


def fft_filter(x, lo=None, hi=None):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.ones_like(f)
    if lo:
        m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi:
        m *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))


def noise(sec):
    return rng.standard_normal(int(sec * SR))


def pad(freqs, sec, bright=0.4, swell=8.0, gain=0.12):
    """Slow detuned saw/sine pad with a breathing filter-like amplitude swell."""
    t = t_axis(sec)
    out = np.zeros_like(t)
    for i, f in enumerate(freqs):
        for det in (-0.35, 0.0, 0.4):
            ff = f * (1 + det * 0.004)
            ph = rng.uniform(0, 6.28)
            w = np.sin(2 * np.pi * ff * t + ph)
            w += bright * 0.5 * np.sin(2 * np.pi * 2 * ff * t + ph * 1.3)
            w += bright * 0.25 * np.sin(2 * np.pi * 3 * ff * t + ph * 0.7)
            out += w * (0.8 + 0.2 * np.sin(2 * np.pi * (1 / swell) * t + i))
    out = fft_filter(out, lo=60, hi=2400)
    fade = np.minimum(1, np.minimum(t / 4.0, (sec - t) / 5.0))
    return (out / max(1e-6, np.abs(out).max()) * gain * fade).astype(np.float32)


def bell(f=196.0, sec=9.0, gain=0.5):
    t = t_axis(sec)
    parts = [(1.0, 1.0, 5.0), (2.0, 0.6, 3.6), (2.4, 0.5, 3.0), (3.0, 0.4, 2.4), (4.07, 0.3, 1.8), (5.43, 0.2, 1.2), (6.8, 0.12, 0.9)]
    out = np.zeros_like(t)
    for ratio, amp, dec in parts:
        out += amp * np.sin(2 * np.pi * f * ratio * t + rng.uniform(0, 6.28)) * np.exp(-t / dec)
    out *= np.minimum(1, t / 0.004)
    return (out / np.abs(out).max() * gain).astype(np.float32)


def tide(sec, gain=0.18, period=7.0):
    n = noise(sec)
    n = fft_filter(n, lo=120, hi=1800)
    t = t_axis(sec)
    swell = 0.55 + 0.45 * np.sin(2 * np.pi * t / period - 1.2)
    n *= swell ** 2
    fade = np.minimum(1, np.minimum(t / 2.0, (sec - t) / 2.0))
    return (n / np.abs(n).max() * gain * fade).astype(np.float32)


def scratch(sec=1.2, gain=0.25):
    """Pencil on paper: bursts of band-passed noise."""
    n = fft_filter(noise(sec), lo=1800, hi=7000)
    t = t_axis(sec)
    gate = (np.sin(2 * np.pi * 9 * t) > -0.2).astype(float) * np.minimum(1, t * 10) * np.minimum(1, (sec - t) * 10)
    return (n / np.abs(n).max() * gate * gain).astype(np.float32)


def page_turn(gain=0.3):
    n = fft_filter(noise(0.5), lo=900, hi=6000)
    t = t_axis(0.5)
    e = np.exp(-((t - 0.18) / 0.09) ** 2)
    return (n / np.abs(n).max() * e * gain).astype(np.float32)


def creak(sec=1.4, gain=0.22):
    t = t_axis(sec)
    f = 140 + 60 * np.sin(2 * np.pi * 3.1 * t) + 40 * t
    out = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)
    out = fft_filter(out, lo=200, hi=1500) * np.minimum(1, t * 8) * np.minimum(1, (sec - t) * 4)
    return (out / np.abs(out).max() * gain).astype(np.float32)


def tick(gain=0.25):
    t = t_axis(0.12)
    return (np.sin(2 * np.pi * 1800 * t) * np.exp(-t / 0.012) * gain).astype(np.float32)


def thump(gain=0.5):
    t = t_axis(0.9)
    f = 70 * np.exp(-t * 3)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.25) * gain).astype(np.float32)


def place(buf, clip, at_sec, gain=1.0):
    i = int(at_sec * SR)
    j = min(len(buf), i + len(clip))
    if i < len(buf) and j > i:
        buf[i:j] += clip[: j - i] * gain


def save_wav(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
