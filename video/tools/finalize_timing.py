#!/usr/bin/env python3
"""finalize_timing.py N...  Build per-chapter timing data for the Remotion project.

Needs story2/audio/chN.mp3 and story2/narration/chN.sentences.txt + index.json.
Writes src/data/timing/chN.json (array of {id,text,start,end}), copies the mp3 to
public/audio/chN.mp3 and updates src/data/durations.json (voice seconds per chapter).
"""
import json, os, shutil, subprocess, sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s2 = f"{root}/story2"
idx = json.load(open(f"{s2}/narration/index.json"))
dpath = f"{root}/src/data/durations.json"
durs = json.load(open(dpath)) if os.path.exists(dpath) else {}
for n in sys.argv[1:]:
    mp3 = f"{s2}/audio/ch{n}.mp3"
    tmp = f"{s2}/audio/ch{n}.timing.json"
    subprocess.check_call(["python3", f"{root}/tools/timing.py", mp3, f"{s2}/narration/ch{n}.sentences.txt", tmp], stdout=subprocess.DEVNULL)
    t = json.load(open(tmp))
    ids = [s["id"] for s in idx[n]["sentences"]]
    assert len(ids) == len(t["sentences"]), (n, len(ids), len(t["sentences"]))
    arr = [{"id": i, "text": s["text"], "start": s["start"], "end": s["end"]} for i, s in zip(ids, t["sentences"])]
    json.dump(arr, open(f"{root}/src/data/timing/ch{n}.json", "w"), indent=1)
    shutil.copy(mp3, f"{root}/public/audio/ch{n}.mp3")
    durs[n] = t["duration"]
    print(f"ch{n}: {t['duration']:.2f}s, {len(arr)} sentences")
json.dump(durs, open(dpath, "w"), indent=1, sort_keys=True)
