"""Lay the per-paragraph voiceover (audio/vo/pNN.mp3) onto the film timeline.

Each paragraph starts at its paragraph start in timeline.json. If a take is
longer than its slot (+ most of the following pause), it is gently sped up
(atempo, max 1.12x) so the animation cues stay in sync. Music is ducked under
the voice (sidechain-style gain curve); SFX stay at their level.
Output: audio/mix_vo.wav
"""
import json, pathlib, subprocess, wave
import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
TL = json.loads((ROOT / "src/timeline.json").read_text())
SR = 48000
DUR = TL["duration"]; N = int(DUR * SR)
P = TL["paras"]

def load_wav(path):
    with wave.open(str(path)) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(np.float32) / 32768
        return x.reshape(-1, w.getnchannels()).T

def decode(path, tempo=1.0):
    cmd = ["ffmpeg", "-v", "error", "-i", str(path), "-af", f"atempo={tempo:.4f},highpass=f=70", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32)

music = load_wav(ROOT / "audio/music.wav")[:, :N]
sfx = load_wav(ROOT / "audio/sfx.wav")[:, :N]
vo = np.zeros(N, np.float32)
missing = []
for i, p in enumerate(P):
    f = ROOT / f"audio/vo/p{i:02d}.mp3"
    if not f.exists(): missing.append(i); continue
    slot = (P[i + 1]["start"] - p["start"] - .25) if i + 1 < len(P) else DUR - p["start"] - 1
    x = decode(f)
    # trim leading/trailing silence
    nz = np.where(np.abs(x) > .01)[0]
    x = x[max(0, nz[0] - 1200): nz[-1] + 4800] if len(nz) else x
    tempo = 1.0
    if len(x) / SR > slot:
        tempo = min(1.12, len(x) / SR / slot)
        x = decode(f, tempo); nz = np.where(np.abs(x) > .01)[0]; x = x[max(0, nz[0] - 1200): nz[-1] + 4800]
    a = int(p["start"] * SR); x = x[: N - a]
    vo[a:a + len(x)] += x
    print(f"p{i:02d} {len(x)/SR:6.2f}s slot {slot:6.2f}s tempo {tempo:.3f}")
vo = vo / (np.max(np.abs(vo)) + 1e-9) * .9

# ducking: smooth envelope of voice activity -> music gain down to -10 dB
env = np.convolve(np.abs(vo), np.ones(2400) / 2400, "same")
act = (env > .02).astype(np.float32)
k = np.exp(-np.arange(int(.35 * SR)) / (.12 * SR)); k /= k.sum()
act = np.clip(np.convolve(act, k, "same") * 1.6, 0, 1)
duck = 1 - act * (1 - 10 ** (-10 / 20))
mix = music * .8 * duck + sfx * .6 * (1 - act * .35) + vo[None, :] * 1.0
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix = mix / np.max(np.abs(mix)) * .89
y = (np.clip(mix, -1, 1).T * 32767).astype("<i2")
with wave.open(str(ROOT / "audio/mix_vo.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())
print("missing paragraphs:", missing)
