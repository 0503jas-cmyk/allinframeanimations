"""Build the master timeline from the voiceover script.

Narration is not recorded yet (the author records it), so timings are an
estimate for a calm documentary read (~150 wpm). Every word gets an estimated
start time; the animation and subtitles are driven by the same data, so
re-timing after the real voiceover only needs this file regenerated
(or word times replaced with forced-alignment output).
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
TEXT = (ROOT / "docs/voiceover-script.txt").read_text().strip()

WPS = 2.80            # words per second (~168 wpm, typical YouTube narration)
LEAD = 3.0            # music intro before the first word
SENT_GAP = 0.30
COMMA_GAP = 0.12
PARA_GAP = 1.05
TAIL = 7.0            # outro/logo after the last word


def word_weight(w):
    core = re.sub(r"[^A-Za-z0-9']", "", w)
    syl = max(1, len(re.findall(r"[aeiouy]+", core.lower())))
    return 0.55 + 0.45 * syl / 1.45


paras = [p.replace("\n", " ") for p in TEXT.split("\n\n")]
all_words = sum(len(p.split()) for p in paras)
avg_weight = sum(word_weight(w) for p in paras for w in p.split()) / all_words

t = LEAD
out_paras = []
for pi, p in enumerate(paras):
    words = []
    p_start = t
    for w in p.split():
        d = word_weight(w) / avg_weight / WPS
        words.append({"w": w, "t": round(t, 3), "d": round(d, 3)})
        t += d
        if re.search(r"[.?!][\"”]?$", w):
            t += SENT_GAP
        elif re.search(r"[,;:]$", w):
            t += COMMA_GAP
    out_paras.append({"i": pi, "start": round(p_start, 3), "end": round(t, 3), "words": words})
    t += PARA_GAP

total = t - PARA_GAP + TAIL
timeline = {"duration": round(total, 3), "fps": 60, "paras": out_paras}
(ROOT / "src/timeline.json").write_text(json.dumps(timeline))
(ROOT / "src/timeline.js").write_text("window.TIMELINE=" + json.dumps(timeline) + ";")

# ---- subtitles: sentence chunks, max 2 lines x 42 chars --------------------
def fmt(s):
    h = int(s // 3600); m = int(s % 3600 // 60); sec = s % 60
    return f"{h:02d}:{m:02d}:{int(sec):02d},{int(round((sec % 1) * 1000)) % 1000:03d}"

cues = []
for p in out_paras:
    cur = []
    for wi, w in enumerate(p["words"]):
        cur.append(w)
        text = " ".join(x["w"] for x in cur)
        end_sent = re.search(r"[.?!][\"”]?$", w["w"])
        soft = re.search(r"[,;:]$", w["w"]) and len(text) > 38
        nxt = p["words"][wi + 1]["w"] if wi + 1 < len(p["words"]) else ""
        if end_sent or soft or len(text + " " + nxt) > 80 or not nxt:
            cues.append((cur[0]["t"], w["t"] + w["d"], text))
            cur = []

def wrap(s, n=42):
    if len(s) <= n:
        return s
    words = s.split(); best = None
    for i in range(1, len(words)):
        a, b = " ".join(words[:i]), " ".join(words[i:])
        score = max(len(a), len(b))
        if best is None or score < best[0]:
            best = (score, a + "\n" + b)
    return best[1]

srt = []
for k, (a, b, text) in enumerate(cues):
    nxt = cues[k + 1][0] if k + 1 < len(cues) else b + 1
    end = min(max(b + 0.35, a + 1.0), nxt - 0.05)
    srt.append(f"{k+1}\n{fmt(a)} --> {fmt(end)}\n{wrap(text)}\n")
(ROOT / "subtitles_en.srt").write_text("\n".join(srt))

print(f"words={all_words} duration={total:.1f}s ({total/60:.2f} min) cues={len(cues)}")
for p in out_paras:
    print(p["i"], p["start"], p["end"], " ".join(w["w"] for w in p["words"][:6]))
