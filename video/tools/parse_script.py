#!/usr/bin/env python3
"""Split a SCRIPT_vN.md into per-chapter narration files.

usage: parse_script.py SCRIPT.md outdir
Writes outdir/chN.txt (paragraphs separated by blank lines, ready for TTS),
outdir/chN.sentences.txt (one sentence per line, for timing.py) and outdir/index.json
(ids, tags, chapter and paragraph structure).
"""
import json, os, re, sys

src, out = sys.argv[1:3]
os.makedirs(out, exist_ok=True)
line_re = re.compile(r"^\[(c\d+\.\d+)\]\s*((?:\[[A-Z\-]+\]\s*)*)(.*\S)\s*$")
chapters, cur, para = {}, None, 0
prev_blank = True
for raw in open(src, encoding="utf-8"):
    raw = raw.rstrip("\n")
    m = line_re.match(raw.strip())
    if m:
        sid, tags, text = m.groups()
        n = int(sid[1:].split(".")[0])
        ch = chapters.setdefault(n, {"paras": [], "sentences": []})
        if prev_blank or not ch["paras"]:
            ch["paras"].append([])
        ch["paras"][-1].append(sid)
        ch["sentences"].append({"id": sid, "tags": re.findall(r"\[([A-Z\-]+)\]", tags), "text": text})
        prev_blank = False
    else:
        prev_blank = raw.strip() == "" or not raw.startswith("[")
idx = {}
for n, ch in sorted(chapters.items()):
    by_id = {s["id"]: s["text"] for s in ch["sentences"]}
    paras = [" ".join(by_id[i] for i in p) for p in ch["paras"]]
    open(f"{out}/ch{n}.txt", "w", encoding="utf-8").write("\n\n".join(paras) + "\n")
    open(f"{out}/ch{n}.sentences.txt", "w", encoding="utf-8").write("\n".join(s["text"] for s in ch["sentences"]) + "\n")
    idx[n] = {"sentences": ch["sentences"], "paragraphs": ch["paras"]}
    words = sum(len(s["text"].split()) for s in ch["sentences"])
    chars = sum(len(p) for p in paras)
    print(f"ch{n}: {len(ch['sentences'])} sentences, {words} words, {chars} chars")
json.dump(idx, open(f"{out}/index.json", "w"), indent=1)
