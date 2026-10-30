# One Keypress: from finger to pixel (15:00, English, 1920x1080, 30 fps)

Stack: Remotion (React) + ElevenLabs narration (Daniel, British) + ffmpeg. Rendered in the cloud container.

| # | Chapter | Time | Visual idea |
|---|---------|------|-------------|
| 0 | Cold open | 0:00-0:45 | Keyboard, a key is pressed, the 4-stage chain (electricity, number, decision, letter) |
| 1 | The switch | 0:45-3:00 | Keyboard matrix: rows/columns scanned, a closed circuit lights up |
| 2 | Bits on a wire | 3:00-5:00 | USB: differential signal, packet bytes, scan code 0x0E |
| 3 | Interrupt and kernel | 5:00-7:30 | CPU gets interrupted, driver, key map, event queue |
| 4 | The app | 7:30-9:30 | Event loop, text buffer, cursor |
| 5 | A letter becomes pixels | 9:30-12:00 | Font outline, curves, rasterization, anti-aliasing |
| 6 | GPU and the screen | 12:00-14:15 | Compositing, framebuffer, scan-out, pixels switching |
| 7 | Outro | 14:15-15:00 | Replay of the whole chain in 5 seconds |

Narration: about 2,200 words. Timing by character count for now; word-level alignment via transcription before the full render.
Render estimate: test took 90 s for 25 s of video, so the full video is about 55 minutes.
