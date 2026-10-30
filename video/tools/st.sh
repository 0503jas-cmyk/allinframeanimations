#!/bin/bash
# usage: tools/st.sh Ch1 f1 f2 ...
cd /home/user/allinframeanimations/video
C=$1; shift
for f in "$@"; do npx remotion still src/index.ts $C out/${C,,}-$f.png --frame=$f --browser-executable=/opt/pw-browsers/chromium 2>&1 | grep -iE "error|fail" ; done
