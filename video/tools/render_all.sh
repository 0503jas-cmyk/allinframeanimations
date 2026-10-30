#!/usr/bin/env bash
# Render chapters muted, one at a time (resumable): tools/render_all.sh [chapter numbers...]
set -u
cd "$(dirname "$0")/.."
mkdir -p out/chapters out/logs
chapters=("$@"); [ ${#chapters[@]} -eq 0 ] && chapters=(1 2 3 4 5 6 7 8 9)
for n in "${chapters[@]}"; do
  if [ -s out/chapters/ch$n.mp4 ] && [ "${FORCE:-0}" != "1" ]; then echo "ch$n exists, skipping"; continue; fi
  for attempt in 1 2; do
    echo "$(date +%T) rendering ch$n (attempt $attempt)"
    npx remotion render src/index.ts Ch$n out/chapters/ch$n.tmp.mp4 \
      --browser-executable=/opt/pw-browsers/chromium --codec=h264 --crf=19 --pixel-format=yuv420p \
      --muted --concurrency=4 --jpeg-quality=92 > out/logs/ch$n.log 2>&1 && \
      mv out/chapters/ch$n.tmp.mp4 out/chapters/ch$n.mp4 && break
    echo "ch$n failed (attempt $attempt)"; sleep 5
  done
  [ -s out/chapters/ch$n.mp4 ] || { echo "ch$n FAILED"; exit 1; }
  echo "$(date +%T) ch$n done: $(ffprobe -v error -show_entries format=duration -of csv=p=0 out/chapters/ch$n.mp4)s"
done
