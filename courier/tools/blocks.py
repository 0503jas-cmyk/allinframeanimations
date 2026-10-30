import re, json, collections
blocks = collections.OrderedDict()
for ln in open('SCRIPT.md'):
    m = re.match(r'\[(s\d+)\.(\d+)\] ([A-Z]+): (.*)', ln.strip())
    if m:
        s, n, who, text = m.groups()
        blocks.setdefault((s, who), []).append((f"{s}.{n}", text))
out = []
for (s, who), lines in blocks.items():
    out.append({"id": f"{s}_{who}", "who": who, "ids": [i for i, _ in lines], "lines": [t for _, t in lines], "chars": sum(len(t) for _, t in lines)})
json.dump(out, open('audio/blocks.json', 'w'), indent=1)
print(len(out), "blocks", sum(b['chars'] for b in out), "chars")
for b in out: print(b['id'], len(b['lines']), b['chars'])
