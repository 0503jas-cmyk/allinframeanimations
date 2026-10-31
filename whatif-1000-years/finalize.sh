#!/bin/bash
# Mux the rendered picture with the score/SFX mix; also make a version with burned-in English subtitles.
set -e
cd "$(dirname "$0")"
mkdir -p out
DUR=$(node -e "console.log(require('./src/timeline.json').duration.toFixed(3))")
COMMON="-c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -r 60 -profile:v high -c:a aac -b:a 256k -ar 48000 -movflags +faststart -t $DUR"
ffmpeg -y -loglevel error -i build/video_noaudio.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 $COMMON out/what_if_1000_years.mp4
STYLE="FontName=Inter,FontSize=13,Bold=1,PrimaryColour=&H00F4FAFF,OutlineColour=&H80201008,BorderStyle=1,Outline=1.6,Shadow=1,BackColour=&H60000000,MarginV=34,Alignment=2"
ffmpeg -y -loglevel error -i build/video_noaudio.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -vf "subtitles=subtitles_en.srt:force_style='$STYLE'" $COMMON out/what_if_1000_years_subtitled.mp4
cp subtitles_en.srt out/
ffmpeg -y -loglevel error -i audio/music.wav -c:a aac -b:a 256k out/stem_music.m4a
ffmpeg -y -loglevel error -i audio/sfx.wav -c:a aac -b:a 256k out/stem_sfx.m4a
ls -la out
