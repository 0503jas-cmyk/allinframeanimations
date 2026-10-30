#!/usr/bin/env python3
"""Build the film's full audio mix.

usage: build_audio.py [outdir]   (default: video/out/audio)
Reads src/data/durations.json, the LAYOUT constants (mirrored below), story2/audio/chN.mp3 (narration)
and story2/cues/chN.json (music moods, beds, sfx; chapter-relative seconds). Missing cue files fall back to
sensible defaults. Writes bed.wav (music + sfx), voice.wav and final.m4a (ducked, loudness-normalised).
"""
import json, os, subprocess, sys, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import synth as S  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else f"{ROOT}/out/audio"
os.makedirs(OUT, exist_ok=True)
SR = S.SR

LAYOUT = {1: (6, 4), 2: (2, 4), 3: (2, 4), 4: (2, 4), 5: (2, 4), 6: (2, 4), 7: (2, 4), 8: (2, 4), 9: (2, 16)}
dur = json.load(open(f"{ROOT}/src/data/durations.json"))
chap_len = {n: LAYOUT[n][0] + dur[str(n)] + LAYOUT[n][1] for n in range(1, 10)}
offset, t = {}, 0.0
for n in range(1, 10):
    offset[n] = t
    t += chap_len[n]
TOTAL = t
print(f"film length {TOTAL:.1f}s = {TOTAL/60:.2f} min")

MOODS = {
    "calm": dict(f=[110.0, 164.81, 220.0, 261.63], bright=0.35, gain=0.10),
    "tense": dict(f=[110.0, 116.54, 174.61, 246.94], bright=0.30, gain=0.11),
    "sorrow": dict(f=[146.83, 220.0, 349.23, 523.25], bright=0.30, gain=0.10),
    "release": dict(f=[146.83, 220.0, 369.99, 554.37], bright=0.55, gain=0.11),
}
DEFAULT_MUSIC = {
    1: [(0, "calm")], 2: [(0, "calm")], 3: [(0, "tense")], 4: [(0, "tense")], 5: [(0, "tense")],
    6: [(0, "tense")], 7: [(0, "tense"), (0.65, "sorrow")], 8: [(0, "sorrow"), (0.72, "release")], 9: [(0, "release")],
}


def load_cues(n):
    p = f"{ROOT}/story2/cues/ch{n}.json"
    if os.path.exists(p):
        c = json.load(open(p))
    else:
        c = {}
    L = chap_len[n]
    if not c.get("music"):
        d = DEFAULT_MUSIC[n]
        c["music"] = [{"from": f * L, "to": (d[i + 1][0] * L if i + 1 < len(d) else L), "mood": m} for i, (f, m) in enumerate(d)]
    if "beds" not in c:
        c["beds"] = [{"from": 0, "to": L, "name": "tide", "gain": 0.5}]
    c.setdefault("sfx", [])
    return c


N = int(TOTAL * SR) + SR
bed = np.zeros(N, dtype=np.float32)

# music: one pad per mood segment, global times, 2.5 s crossfades via the pad's own fades
segs = []
for n in range(1, 10):
    c = load_cues(n)
    for m in c["music"]:
        segs.append((offset[n] + m["from"], offset[n] + m["to"], m["mood"]))
# merge adjacent segments with the same mood
merged = []
for a, b, mood in sorted(segs):
    if merged and merged[-1][2] == mood and abs(merged[-1][1] - a) < 0.6:
        merged[-1] = (merged[-1][0], b, mood)
    else:
        merged.append((a, b, mood))
for a, b, mood in merged:
    m = MOODS[mood]
    pad = S.pad(m["f"], b - a + 5.0, bright=m["bright"], swell=9.0, gain=m["gain"])
    S.place(bed, pad, max(0.0, a - 2.5))
    print(f"music {mood:7s} {a:7.1f} - {b:7.1f}")

SCALES = {
    "calm": [220.0, 261.63, 293.66, 329.63, 392.0],
    "tense": [220.0, 233.08, 261.63, 311.13, 329.63],
    "sorrow": [293.66, 349.23, 440.0, 523.25, 587.33],
    "release": [293.66, 369.99, 440.0, 554.37, 659.25],
}
mrng = np.random.default_rng(11)
for a, b, mood in merged:
    tt = a + mrng.uniform(2.0, 5.0)
    prev = 2
    while tt < b - 3.0:
        k = int(np.clip(prev + mrng.integers(-2, 3), 0, 4))
        prev = k
        S.place(bed, S.pluck(SCALES[mood][k], 4.5, 0.055 if mood != "tense" else 0.045), tt)
        tt += mrng.uniform(4.5, 9.5)

SFX = {
    "bell": lambda: S.bell(196.0, 9.0, 0.55),
    "bell_low": lambda: S.bell(147.0, 11.0, 0.6),
    "scratch": lambda: S.scratch(1.4, 0.22),
    "page_turn": lambda: S.page_turn(0.30),
    "creak": lambda: S.creak(1.6, 0.20),
    "tick": lambda: S.tick(0.22),
    "thump": lambda: S.thump(0.45),
    "tide_wash": lambda: S.tide(6.0, 0.22, period=5.0),
}
for n in range(1, 10):
    c = load_cues(n)
    for b in c["beds"]:
        a, z = offset[n] + b["from"], offset[n] + b["to"]
        bed_clip = S.tide(max(1.0, z - a), gain=0.16 * float(b.get("gain", 0.5)), period=8.0)
        S.place(bed, bed_clip, a)
    for e in c["sfx"]:
        fn = SFX.get(e["name"])
        if fn:
            S.place(bed, fn(), offset[n] + float(e["t"]), float(e.get("gain", 0.6)))
        else:
            print("unknown sfx", e["name"])
# title sting at the very start
S.place(bed, S.bell(196.0, 9.0, 0.5), 1.0)

bed = np.clip(bed, -1, 1)
S.save_wav(f"{OUT}/bed.wav", bed)

# voice: decode each chapter mp3 and place at its offset + lead
voice = np.zeros(N, dtype=np.float32)
for n in range(1, 10):
    tmp = f"{OUT}/_v{n}.wav"
    subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-i", f"{ROOT}/story2/audio/ch{n}.mp3", "-ac", "1", "-ar", str(SR), tmp])
    with wave.open(tmp) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    S.place(voice, x, offset[n] + LAYOUT[n][0])
    os.remove(tmp)
S.save_wav(f"{OUT}/voice.wav", np.clip(voice, -1, 1))

# final mix: duck the bed under the voice, compress the voice lightly, normalise
total = round(TOTAL, 3)
flt = (
    "[0:a]highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=140:makeup=3,asplit=2[v][vsc];"
    "[1:a]lowpass=f=9000,volume=1.0[b];"
    "[b][vsc]sidechaincompress=threshold=0.02:ratio=6:attack=40:release=700:makeup=1[bd];"
    "[v][bd]amix=inputs=2:duration=longest:normalize=0,"
    "loudnorm=I=-16:TP=-1.5:LRA=9,alimiter=limit=0.95,"
    f"atrim=0:{total},aformat=sample_rates=44100:channel_layouts=stereo[out]"
)
subprocess.check_call([
    "ffmpeg", "-y", "-loglevel", "error", "-i", f"{OUT}/voice.wav", "-i", f"{OUT}/bed.wav",
    "-filter_complex", flt, "-map", "[out]", "-c:a", "aac", "-b:a", "192k", f"{OUT}/final.m4a",
])
print("wrote", f"{OUT}/final.m4a")
