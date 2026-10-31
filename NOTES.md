# THE DROWNED MERIDIAN — project notes (working file)
- 12-min (720 s) English animated short, 1920x1080@60, burned-in subtitles + .srt, ElevenLabs voices, procedural music/SFX.
- Plan: script.json (timing, voices) -> audio/lines/*.mp3 (ElevenLabs v4, flow Bh8YWW2K35KCbbRgVUq7) -> src/ (Canvas2D renderer in Chromium, deterministic renderAt(t)) -> render frames in parallel -> ffmpeg mux.
- Voices cost ~1 credit/char (~4.3k credits total, ~$0.85).
- Audio download: signed GCS URLs from creative_get_flow_run_status (valid 2h), curl works through proxy.
