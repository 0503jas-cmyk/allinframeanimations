#!/usr/bin/env python3
# usage: python3 tools/mux.py RENDER_DIR OUT.mp4  — concat chunks, two-pass loudnorm audio (-16 LUFS), encode H.264 1080p60 yuv420p + AAC
import sys, subprocess, json, re, glob, os
R = sys.argv[1]; OUT = sys.argv[2]; os.makedirs(os.path.dirname(OUT), exist_ok=True)
chunks = sorted(glob.glob(f'{R}/c[0-9][0-9][0-9].mp4')); assert len(chunks) == 72, f'expected 72 chunks, got {len(chunks)}'
open('build/concat.txt', 'w').write(''.join(f"file '{os.path.abspath(c)}'\n" for c in chunks))
base = ['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', '48000', '-ac', '2', '-i', 'build/audio/mix_raw.f32']
r = subprocess.run(base + ['-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
j = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', r.stderr, re.S).group(0)); print('pass1', j)
af = f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true:print_format=summary"
subprocess.run(base + ['-af', af, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', 'build/audio/final.m4a'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'build/concat.txt', '-i', 'build/audio/final.m4a', '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '60', '-g', '120', '-movflags', '+faststart', '-c:a', 'copy', OUT], check=True)
print('wrote', OUT, os.path.getsize(OUT) // 1_000_000, 'MB')
