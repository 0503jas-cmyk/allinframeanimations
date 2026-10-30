#!/usr/bin/env bash
# Concatenate the muted chapter videos, mux the final audio, make delivery sizes.
set -euo pipefail
cd "$(dirname "$0")/.."
: > out/concat.txt
for n in 1 2 3 4 5 6 7 8 9; do echo "file 'chapters/ch$n.mp4'" >> out/concat.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/concat.txt -c copy out/video_silent.mp4
ffmpeg -y -loglevel error -i out/video_silent.mp4 -i out/audio/final.m4a -map 0:v -map 1:a -c:v copy -c:a copy -movflags +faststart -shortest out/film_1080p.mp4
ffmpeg -y -loglevel error -i out/film_1080p.mp4 -vf scale=1280:720 -c:v libx264 -preset medium -crf 24 -pix_fmt yuv420p -c:a copy -movflags +faststart out/film_720p.mp4
ls -la out/film_*.mp4
for f in out/film_1080p.mp4 out/film_720p.mp4; do
  echo "$f: $(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt -of csv=p=0 $f) | $(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels -of csv=p=0 $f) | $(ffprobe -v error -show_entries format=duration -of csv=p=0 $f)s"
done
