#!/bin/bash
# usage: encode.sh <frames_dir> <mix.wav> <out.mp4>
ffmpeg -y -v error -framerate 30 -i "$1/f%05d.jpg" -i "$2" \
  -vf "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" \
  -c:v libx264 -preset slow -crf 21 -maxrate 5M -bufsize 10M -profile:v high -level 4.2 -r 30 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -af "loudnorm=I=-15:TP=-2.5:LRA=11,alimiter=limit=0.89" -c:a aac -b:a 192k -ar 44100 \
  -movflags +faststart -shortest "$3"
