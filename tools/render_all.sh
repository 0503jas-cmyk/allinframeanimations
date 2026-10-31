#!/bin/bash
# usage: tools/render_all.sh SNAPDIR OUTDIR [chunk indices...]  (default: all 72 chunks of 600 frames)
export NODE_PATH=$(npm root -g); SNAP=$1; OUT=$2; shift 2; mkdir -p $OUT
IDX=${@:-$(seq 0 71)}
for i in $IDX; do echo $i; done | xargs -P 4 -I{} bash -c 'i={}; f0=$((i*600)); f1=$((f0+600)); n=$(printf "%03d" $i); [ -s '$OUT'/c$n.mp4 ] && exit 0; SNAP='$SNAP' node tools/render.js $f0 $f1 '$OUT'/c$n.tmp.mp4 > '$OUT'/log$n.txt 2>&1 && mv '$OUT'/c$n.tmp.mp4 '$OUT'/c$n.mp4'
echo ALLDONE
