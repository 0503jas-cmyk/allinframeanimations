#!/bin/bash
# Render the full film in parallel chunks, then concatenate.
set -e
cd "$(dirname "$0")"
FPS=60
TOTAL=$(node -e "console.log(Math.round(require('./src/timeline.json').duration*60))")
J=${J:-4}
mkdir -p build
STEP=$(( (TOTAL + J - 1) / J ))
for i in $(seq 0 $((J-1))); do
  S=$((i*STEP)); E=$(( (i+1)*STEP )); [ $E -gt $TOTAL ] && E=$TOTAL
  node render.js chunk build/chunk$i.mp4 $S $E > build/chunk$i.log 2>&1 &
done
wait
: > build/list.txt
for i in $(seq 0 $((J-1))); do echo "file 'chunk$i.mp4'" >> build/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i build/list.txt -c copy build/video_noaudio.mp4
echo "frames=$TOTAL"
