#!/bin/bash
# usage: render_all.sh <frames_dir>   renders all 2925 frames (97.5 s @ 30 fps) with 4 parallel Chromium workers
D=$1; mkdir -p $D; cd "$(dirname "$0")"
TOTAL=2925; PER=732
for i in 0 1 2 3; do s=$((i*PER)); e=$(((i+1)*PER)); [ $e -gt $TOTAL ] && e=$TOTAL; [ $i -eq 3 ] && e=$TOTAL; node render.js frames $D $s $e & done; wait
