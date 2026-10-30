#!/bin/bash
# usage: stills.sh S01 f1 f2 ...
cd "$(dirname "$0")/.."
C=$1; shift
for f in "$@"; do npx remotion still src/index.ts $C out/stills/${C}_$f.png --frame=$f --browser-executable=/opt/pw-browsers/chromium >/dev/null 2>&1 & done; wait
