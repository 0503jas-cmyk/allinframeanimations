# The Man Who Saved the World — YouTube Short (1:37, 9:16)

**Story:** Stanislav Petrov, 26 Sept 1983. A Soviet early-warning system reports five US missiles; Petrov, the duty officer, judges it a false alarm and does not escalate. (True story; the satellites had mistaken sunlight glinting off high-altitude clouds for missile launches.)

| File | What |
|---|---|
| `final.mp4` | 1080x1920, 30 fps, H.264 High / yuv420p (BT.709), AAC-LC 44.1 kHz stereo, 97.5 s, 52 MB |
| `subtitles.srt` | English subtitles (readable phrases; the video also has burned-in karaoke captions) |
| `thumbnail.png` | 1080x1920 thumbnail still |
| `narration.txt` | spoken script |
| `audio/narration.mp3` | the ElevenLabs narration (model `eleven_v3`, voice "Mark – Professional – Gravitas & Calm") |
| `src/` | editable sources (see below) |

## Unifying idea
*The red button as a character.* It opens the film (hook) and closes it — untouched. Everything between is the world leaning on that button: a cold-war globe, a bunker, a dying airliner, a clock hitting midnight, a map filling with red arcs, a chain of command lighting up toward "counter-strike", then one man's doubt (five dots vs. the hundreds a real attack would show), a phone, "FALSE ALARM", a clock, a skyline holding its breath, a calm blue relief and the satellite explainer, a warm window, a CRT shutting off, and a night-side Earth whose lights say *we are all still here*.

## Storyboard (13 scenes, one camera idea each)
1. **0:00 Hook** — orbit/spiral push-in on a lit red button in a dark console, slammed type "ONE MAN / RED BUTTON / ONE DECISION / THE WORLD".
2. **0:06 Date + globe** — odometer roll to "1983", dotted globe rotates and dollies to a pulsing Moscow pin.
3. **0:13 Bunker** — parallax control room (CRT radar wall, neon officer silhouette, bokeh consoles), lower-third kinetic name card.
4. **0:19 KAL 007** — tracking shot of an airliner, missile tracer, breakup + fireball, "WAR" slammed with shake.
5. **0:27 Midnight** — ticking 23:59:5x clock, rollover, rotating-beacon alarm strobe, launch-detected map.
6. **0:34 Five missiles** — tilted-map camera, five red arcs on the beat, counter pops, terminal "> LAUNCH", confidence bar.
7. **0:44 Chain of command** — vertical node chain, camera dollies down it, nodes ignite on the words, swarm eruption, countdown ring.
8. **0:51 Doubt** — chromatic-split close-up, "?", five dots vs. 500 ghost dots, empty ground-radar sweep, "NOTHING".
9. **0:59 Instinct** — NO PROOF stamp, ECG line, phone handset lifts, held-breath silence, "FALSE ALARM" slam.
10. **1:05 Waiting** — clock close-up with depth of field; skyline with rising glow ("cities would burn").
11. **1:10 Relief** — time-lapse clock in cool blue, calm skyline, animated satellite/sunlight/cloud-glint explainer.
12. **1:19 Legacy** — warm window light, 1939–2017, a CRT labelled LAUNCH×5 collapses to a line, Earth's night side lights up.
13. **1:31 Close** — the button again, unpressed, title card, fade.

## How it was built
* `src/index.html`, `core.js`, `scenes1-3.js` — HTML5 Canvas 2D with a small 3D camera (perspective projection, yaw/pitch/roll, planes at different depths for parallax, depth-of-field layers, dust/bokeh), deterministic `renderFrame(t)`.
  Motion blur = 3 temporal sub-samples per frame; bloom, vignette, grain in post. Kinetic type = `slam()` overshoot animations; captions = word-timed karaoke chunks in the Shorts safe area (kept above the bottom ~20 %, left of the right-hand button column).
* `src/render.js` (Playwright/Chromium, headless) + `render_all.sh` (4 parallel workers) → JPEG frames → `encode.sh` (ffmpeg, libx264 CRF 21, maxrate 5 Mbit/s, loudnorm + limiter).
* `src/audio.py` — numpy-only synthesis of the score and the SFX (drones, pulses, risers, impacts, alarm, ticks, pings, heartbeats, CRT collapse), reverb send, voice-activated ducking, mixed with the narration.
* `src/fix_words.py`, `make_srt.py` — word timings & subtitles.

Rebuild: `cd src && ./render_all.sh /tmp/frames && python3 -I audio.py ../audio/narration.mp3 /tmp/mix.wav && ./encode.sh /tmp/frames /tmp/mix.wav ../final.mp4` (Node + Playwright, ffmpeg, Python+numpy; fonts Inter, JetBrains Mono must be installed). `index.html?play` previews in real time without audio.

## Verified
* `ffprobe` on the final file: 1080x1920, h264 High, yuv420p, 30 fps, 2925 frames, 97.500 s; AAC-LC 44.1 kHz stereo; no black bars.
* The **decoded** final video was reviewed as 1-fps contact sheets (all 98 s) plus targeted stills; defects found and fixed in that pass: small globe, overlapping "?"/"ONLY FIVE", clipped chain node, blown-out CRT, oversized slam, illegible glow text, phone overlapping captions.
* Subtitle timing: the transcript's word starts after pauses included the silence (e.g. "September" appeared 1.2 s early). Starts were corrected with voice-activity detection on the audio and re-checked (captions are blank during pauses, appear on the first spoken word); three visual cues (FALSE ALARM, "Petrov had minutes", "Report it") were retimed to the real speech onsets.
* Loudness: −13.9 LUFS integrated, true-peak −0.8 dBFS; voice-to-music/SFX ratio during speech measured at ≈ +7.7 dB.

## NOT verified / honest limits
* **I could not listen to the audio.** Narration naturalness, music taste and the final mix balance are judged by measurements only (levels, onset timing), not by ear. SFX are synchronised to cue times by construction, not checked by ear. Please listen once before publishing.
* I did **not** watch the three reference Shorts (no video access in this environment), so pacing/typography are my own interpretation of the brief, not borrowed from them.
* Not tested in the YouTube uploader/phone UI; the safe-zone margins are by design (caption centre at 69 % height, text width ≤ 820 px), not checked against YouTube's overlay on a device. Some HUD labels in the map scene sit near the right edge.
* The video is lossy twice (JPEG frames at q 0.93 → H.264 CRF 21); fine detail/grain is softened. File size (52 MB) was kept under GitHub's limit.
* Visual liberties: the officer is a generic silhouette (not a likeness), map/plane/satellite are stylised, the countdown timer and node chain are illustrative. Facts used: date, 5 missiles, Oko satellites + sunlight on high clouds, KAL 007 (1 Sept 1983, 269 aboard), Serpukhov-15, 1939–2017. "Never made a hero at home" is a simplification of how the Soviet authorities treated him at the time.
* The narration was generated with a paid ElevenLabs voice (credits spent: one generation, 1329 credits).
