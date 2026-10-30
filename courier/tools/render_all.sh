#!/bin/bash
cd "$(dirname "$0")/.."
for s in "$@"; do
  id=$(echo $s | tr a-z A-Z)
  if [ -f out/scenes/$s.mp4 ] && [ -z "$FORCE" ]; then echo "$s skip"; continue; fi
  npx remotion render src/index.ts $id out/scenes/$s.mp4 --muted --codec=h264 --crf=22 --pixel-format=yuv420p --jpeg-quality=90 --concurrency=4 --browser-executable=/opt/pw-browsers/chromium > out/logs/$s.log 2>&1 && echo "$s done $(date +%T)" || echo "$s FAILED"
done
echo ALLDONE
