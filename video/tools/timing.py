#!/usr/bin/env python3
"""Sentence timing from a narration mp3.

usage: timing.py audio.mp3 sentences.txt out.json
sentences.txt holds one sentence per line. Silences are found with ffmpeg
silencedetect; the N-1 longest gaps are taken as sentence boundaries.
"""
import json, re, subprocess, sys

audio, sents_path, out_path = sys.argv[1:4]
sents = [s.strip() for s in open(sents_path, encoding="utf-8") if s.strip()]
dur = float(subprocess.check_output(
    ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", audio]).decode())
log = subprocess.run(
    ["ffmpeg", "-nostats", "-i", audio, "-af", "silencedetect=noise=-34dB:d=0.18", "-f", "null", "-"],
    capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
gaps = []
for i, s in enumerate(starts):
    e = ends[i] if i < len(ends) else dur
    if s > 0.25 and e < dur - 0.05:  # ignore lead-in and tail
        gaps.append((s, e, e - s))
n = len(sents)
chosen = sorted(sorted(gaps, key=lambda g: -g[2])[: n - 1], key=lambda g: g[0])
bounds = [0.0] + [(g[0] + g[1]) / 2 for g in chosen] + [dur]
lead = ends[0] if starts and starts[0] < 0.05 and ends else 0.0
tail = starts[-1] if starts and len(ends) < len(starts) else dur
out = []
for i, text in enumerate(sents):
    a = max(bounds[i], lead if i == 0 else bounds[i])
    b = min(bounds[i + 1], tail if i == n - 1 else bounds[i + 1])
    out.append({"text": text, "start": round(a, 3), "end": round(b, 3)})
json.dump({"duration": round(dur, 3), "found_gaps": len(gaps), "sentences": out}, open(out_path, "w"), indent=1)
print(f"{audio}: {dur:.2f}s, {len(gaps)} gaps, {n} sentences")
