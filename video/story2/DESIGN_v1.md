# DESIGN v1 — Motion Designer / Technical Director
Working title: THE TIDE CLERK OF HARROW DEEP. Status: round 1, to be revised after the writer's script and critique.

Existing project facts I am building on: `theme.ts` (FPS 30, 1920x1080, `makeTimeline` that spreads text by character count), `Test.tsx` / `MoneyTest.tsx` (single-file compositions, `useSec()`, `interpolate` with clamp, `Easing.bezier(0.22,1,0.36,1)`, spring presses). The new film replaces the character-count timeline with real sentence timings from audio JSON (section 4).

---------------------------------------------------------------------
## 1. VISUAL LANGUAGE

### 1.1 Palette (restricted, all four families plus neutrals)
| Token | Hex | Use |
|---|---|---|
| `ink0` | `#050914` | deepest night, vignette edge |
| `ink1` | `#0a1226` | main background (ink-night blue) |
| `ink2` | `#12203f` | mid layers, water body |
| `ink3` | `#1d3159` | far hills, water highlights |
| `bone` | `#efe6d2` | parchment, ledger paper, main text |
| `boneShade` | `#d9ccb0` | page edge, paper shadow |
| `boneDim` | `#9a917c` | secondary text, ruled lines |
| `amber` | `#ffb347` | lantern, living things, "IN", warmth |
| `amberDeep` | `#c9741f` | lantern falloff, rope, bell wear |
| `teal` | `#5fd4c4` | tide-foam, tide clock, HUD, "OUT" water side |
| `tealDeep` | `#1f6f6a` | water mid-tones |
| `blood` (sparingly) | `#c4543f` | ONLY the single "wrong" number and the missing OUT; never used elsewhere |
| `pencil` | `#8d93a1` | the villagers' pencil IN strokes (cool grey, graphite) |

Rule: ink is black-blue `#141a2e` when written on bone, and bone when written on night. Amber means a person is present or counted; teal means the sea; red appears at most ~6 times in the film. Colour carries the story: the twist-2 payoff is amber flooding the teal frame.

### 1.2 Typography (only the four available families)
- **Liberation Serif italic** = Maren's handwriting/ledger hand (entries, names). Real handwriting fonts are unavailable, so the "hand" is made by SVG stroke (1.3) for names and key words, and Liberation Serif italic with a clip-mask wipe for long ledger lines. Child's hand (age seven) = same font, 2.2x size, rotated per-letter +-4 degrees, baseline jitter, wobble displacement, uneven stroke.
- **DejaVu Serif** = chapter titles and big typographic flashback words (wide, heavy, readable at distance). Uppercase, letter-spacing 0.18em.
- **FreeSerif** = narrator subtitles-as-art (used rarely: single words that the narrator stresses, set huge and low-opacity behind the scene), and Roman numerals.
- **Inter** = HUD only (numbers, labels, tabular-nums, weight 500/700). The HUD is the cold, mechanical voice; everything else is human.
Never any other family; every `fontFamily` stack comes from `theme2.ts` constants (`HAND`, `TITLE`, `ACCENT`, `HUD`).

### 1.3 Signature motif: ink that writes itself
Two techniques, both cheap:
1. **Stroke-write (names, numbers, short words, flourishes):** hand-authored single-line SVG paths (a `glyphs.ts` table: digits 0-9, the letters needed for MAREN, the mother's name, IN, OUT, tally strokes). Each path is rendered with `strokeDasharray = L`, `strokeDashoffset = L*(1-p)`, `strokeLinecap="round"`, `strokeLinejoin="round"`. A small "pen head" circle follows `path.getPointAtLength(p*L)` (precomputed samples, not live DOM calls). Stroke width varies by a pressure curve: two stacked strokes (width 3.2 under, 1.6 over, slight alpha) imitate ink pooling. Path length is precomputed with `getTotalLength` once at module load via an offscreen cache, or pre-baked into `glyphs.ts` by a Node script.
2. **Clip-write (long lines):** a line of Liberation Serif italic text sits under a `clipPath` rect whose width grows with eased progress plus a soft 24px gradient mask edge (`linear-gradient` in a CSS mask, not an SVG filter). A tiny nib sprite rides the clip edge with +-2px vertical wobble. Speed is driven by sentence timing (the line finishes exactly when the narrator finishes the sentence).
Ink "settling": after being written, text darkens from `#2a3350` to final ink over 20 frames (cheap colour interpolation), mimicking drying.
Pencil (villagers' IN): same stroke technique but `pencil` colour, 2 px, plus an `feTurbulence`-free fake texture: dashed-offset second stroke at 0.4 opacity. Pencil is always visibly lighter and cooler than ink; this contrast is the evidence in chapters 6 and 8.

### 1.4 Grain, vignette, light
- **Grain:** ONE pre-rendered 512x512 tileable noise PNG (generated once by a Node script, 8-bit grey), laid as a repeating background at 6-8% opacity with `mix-blend-mode: overlay`... blend modes are costly at full screen, so instead use plain alpha (no blend mode) and shift `backgroundPosition` by a hash of the frame number in steps of 3 frames (grain at 10 fps reads as filmic and costs nothing extra).
- **Vignette:** one static `radial-gradient` div (transparent centre to `ink0` at 0.65 alpha). Never animated; breathing is done by scaling its container 1.00 to 1.015 over 6 s.
- **Light:** lantern light is a layered pair of radial gradients (warm core + wide falloff), flicker = two summed sines plus a noise value from `noise.ts` (deterministic hash, seeded by frame). No blurs.
- **Paper macro:** parchment texture is a static baked PNG (fibre noise + faint stains, generated by Node script) at 2400x1350 so the camera can push into it without pixelation.

### 1.5 Camera rules
- Every shot has a **continuous move** from first frame to last (never a locked frame): push-in 1.00 to 1.06, drift 40 px, or slow rotate +-0.8 degrees. A single `<Camera>` wrapper applies one `transform` (translate/scale/rotate) to the whole scene root, so motion costs one compositing layer.
- **Parallax:** every scene has at least 3 depth layers (far/mid/near). Layer factors: far 0.2, mid 0.5, near 1.0, foreground-out-of-focus 1.6. Parallax is `translateX(camX * factor)`, no blur on the layers; "focus" is faked by lowering opacity and desaturating (tinted overlay colour) on foreground layers.
- **Match-motion on cuts:** direction of the camera move continues across the cut (exit drifting left, enter drifting left).
- **Beats:** whenever the narrator reaches a hard number or a name, the camera does a 12-frame ease-in "settle" (+2% scale) and the ink writes. Never shake. The only exception is the twist-1 and twist-2 frames (see 3).
- **Never cut on silence**: cuts land 4-6 frames BEFORE the first word of the next sentence so picture leads speech.

### 1.6 Transitions
Only four, reused (all from `@remotion/transitions` or hand-rolled):
1. **Tide wipe:** a sine-edged water mask sweeps across (the wave edge drawn as one SVG path with an animated phase; the incoming scene is clipped by it). Chapter-internal and cheap.
2. **Ink bloom:** a dark ink circle (one radial-gradient div) expands from the pen-nib point to cover the frame, then reveals the next scene by shrinking away. Used into/out of ledger pages.
3. **Page turn:** a ledger-page slide with a skewed shadow gradient (CSS `transform: perspective(1800px) rotateY()`); the page is two divs, no 3D engine.
4. **HUD glitch cut** (chapter ends): 8-frame stutter, see 3.0.
Crossfades are used only for sound-bed continuity (6-12 frames). No whip-pans, no zooms through objects: restraint matches the voice.

---------------------------------------------------------------------
## 2. THE KIT (11 components, `src/story2/kit/`)

All components are pure functions of `frame` and a `timeline` prop. No hooks with state, no randomness (use `noise(seed, frame)`). Shared hook `useScene()` returns `{t, p(start,end,ease), sentence(i)}`.

1. **`<Camera>`** props: `from:{x,y,s,r}`, `to:{x,y,s,r}`, `start`, `end`, `ease`, `shake=0`. Applies one transform to children and exposes `camX` via context for parallax layers. Also has `lock` keyframe list for settle beats.
2. **`<Layer>`** props: `depth` (0.2..1.6), `y`, `opacity`, `tint`. Reads camX from context and translates. The only way anything moves with the camera.
3. **`<WaterLayers>`** props: `layers:[{y,amp,wavelength,speed,fill,opacity,foam?}]`, `tide` (0..1 water level override), `lanternGlow?`. Each layer is ONE `<path>` computed from a sum of two sines at step 12 px (160 points), no filter. 3 to 6 layers. Foam = a second thin stroked path in teal on the top layer with dashed pattern. Reflections of lanterns = vertical amber gradient streak rects with sine x offset.
4. **`<Sky>`** props: `stars:number (<=140)`, `moon?`, `aurora=false`, `mood`. Static gradient + stars as one `<g>` of circles twinkling by `sin` (opacity only), low-poly cloud shapes drifting as paths. Mood tints the gradient (calm, tense, dawn).
5. **`<Silhouette>`** props: `kind:"village"|"walker"|"child"|"mother"|"clerkHut"|"lighthouseless-tower"|"stone"`, `x,y,scale`, `walk?:{speed,bob}`, `lit?:windows[]`. Pure vector shapes (rectangles, polygons, 1-2 curves). Walkers are 9-shape paper-puppet figures with leg swing by sine; no faces ever. Village = roofline polygon with windows that light up by sentence cue.
6. **`<Causeway>`** (map and in-world road) props: `mode:"map"|"world"`, `tide:number`, `prints:Footprint[]`, `highlight?`. Map mode: a hand-drawn chart look (bone on ink, compass, depth soundings in tiny Inter), the road drawn as a double-line stroke across water, footprints as pairs of small ellipses placed by data (`{x,t,size:"adult"|"small",dir}`) with a reveal time each. World mode: perspective road converging to a vanishing point, wet stones, water lapping in from both sides by `tide`. Footprint list can have up to ~400 prints but is rendered as one `<path>` per type (all ellipses merged with arc commands), not as 400 nodes.
7. **`<LedgerHUD>`** props: `out`, `in`, `night`, `delta`, `glitch:0..1`, `mode:"full"|"mini"|"hidden"`, `corner`. Bottom-left card in Inter: three tabular counters (OUT / IN / NIGHTS), thin bone frame, teal text, the DELTA cell is `blood` red only when non-zero. Counters roll with a digit-roller (translateY of stacked digit strips), 10-frame ease. Glitch: horizontal slice offsets (3-5 horizontal bands, each a duplicate clip of the HUD moved +-14 px), channel-split by duplicating the text in teal and amber at +-3 px, 4 frames of scanline bars, and a flatline readout `NIGHT ---`. All DOM-cheap: no filter.
8. **`<TideClock>`** props: `minutesToClose` (0..360), `ebbing:boolean`, `size`, `mood`. Circular dial drawn in SVG, a teal arc that shrinks as the six-hour window closes, tide marks as 12 ticks, a hand with a small pendulum jiggle. Numerals in FreeSerif. When under 20 minutes the arc turns amber then `blood` in the last 5. Can be docked in HUD corner or hero-sized in a chapter.
9. **`<Bell>`** props: `swing` (angle curve), `strike?:frames[]`, `ropeWear:0..1`, `size`, `showRope`. Bronze bell silhouette on a gibbet-style post; pendulum physics = damped cosine `A*e^(-kt)*cos(wt)`; clapper lags by a second damped term; a `ring` of 3 expanding arcs (stroke teal, fade) accompanies each strike; `ropeWear` draws the polished one-sided groove on the rope and a notch on the bell yoke that Maren later reads as evidence. Macro mode zooms into the rope fibres (a hatched path).
10. **`<InkText>`** (the motif) props: `mode:"stroke"|"clip"`, `text|glyphs`, `x,y,size`, `start,end` (seconds), `ink:'night'|'bone'|'pencil'|'amber'`, `hand:"adult"|"child"`, `underline?`, `strike?` (a strikethrough stroke that writes over), `settle=true`. Pen head optionally visible. Stroke mode takes `glyphs.ts` paths; clip mode takes any string.
11. **`<LedgerPage>`** props: `rows:Row[]`, `camera focus`, `lamp?:{x,y}`, `torn?`, `child?:boolean`. Bone page with ruled lines, a margin line, two columns OUT / IN, date column; rows are `{date, out:string[], in:string[], ink:'ink'|'pencil'|'child', writeAt}`; page has baked paper PNG, page edge shadow, curled corner, the lamp's moving warm radial. Because the camera lives inside a 2400x1350 page space, it supports macro pushes down to single letters (stroke-width scale-compensated). Also supports "ghost rows": rows whose ink appears from nothing at a cue.

Plus tiny helpers (not counted as components): `noise.ts` (hash noise), `glyphs.ts`, `sfxCues.ts`, `Grain`, `Vignette` (both pure divs inside a single `<Finish>` wrapper), `AnkleChain` below.

**Chained-ankle shot treatment (`<AnkleShot>` is a preset of Silhouette + Camera + Chain, within the 12 limit as a composition inside kit file `Silhouette.tsx`):** low camera at floor level, bone ledger-desk leg, an iron ring and 9-link chain drawn as stroked ellipses chained along a catenary (cosh) path, anchored to a ring on the desk leg. Chain tension animates the catenary sag from 0.2 to 0; link jingle = micro-rotation of each link by sine offset. Foot is a cut-off silhouette sock/stocking shape; no face, no body.

**Stone** (the Drowning Stone) is a `kind` of Silhouette: monolith polygon with hatch lines, tally scratches (`InkText mode=stroke` in the `stone` ink: pale `boneDim`, drawn by groups of five with diagonal), wet darkening line rising with `tide`.

Not in the kit on purpose: generic particles, blur FX, 3D.

---------------------------------------------------------------------
## 3. CHAPTER-BY-CHAPTER VISUAL PLAN

Provisional timing (re-fit to the real audio): Cold open + Ch1 0:00-1:55, Ch2 -3:50, Ch3 -5:45, Ch4 -7:40, Ch5 -9:50 (TWIST 1 at about 9:30), Ch6 -11:50, Ch7 -13:50, Ch8 -15:35 (TWIST 2 at about 14:30 gets placed early in Ch8; we may split the fourth 'tide' beat into Ch7 end), Epilogue -16:15. The bible says never under 15:00 and at least 15:30 target, so the plan above is 16:15 max with the narration governing real length.

**3.0 HUD glitch / chapter-end signature.** Every chapter ends with the HUD or the tide doing one named thing, so chapters have different "closings", never the same effect twice:
1. Ch1: HUD DELTA cell flickers 1 to 0 to 1 and the OUT digit stutters.
2. Ch2: tide clock hand snaps shut (arc closes with a sharp "latch" and the clock face cracks into 3 segments for 6 frames).
3. Ch3: HUD slices horizontally and drops 40 px (bands offset), then reassembles with DELTA reading 1 again.
4. Ch4: NIGHT counter runs, then the HUD displays `NIGHT ---` flatline for 2 s while the screen goes bone-white at 8% (dawn) with the ledger still short.
5. Ch5 (twist 1): HUD does not glitch; it is *erased* by a pen line, replaced by Maren's tally; the glitch is saved for the next chapter.
6. Ch6: HUD channel-splits (teal/amber) and the amber copy stays 8 frames behind, as if the system is being rewritten.
7. Ch7: tide arc turns blood-red and the whole HUD desaturates to ink grey, tide wipe takes it.
8. Ch8 (twist 2): HUD tears apart upward; DELTA cell burns amber and clears to ZERO.
9. Epilogue: no glitch, the HUD simply settles into a stable, quiet 0.

### Cold open + Chapter 1 — "One Short" (0:00-1:55)
- Signature visual: **the count writing itself**. Black. A pen nib point of amber light. 14,975 is written in stroke-mode ink in ONE continuous stroke while the narrator says it; the camera pulls back to reveal it is the sum at the bottom of a vast ledger column that extends off-frame. Hook by 0:12: the digit 1 beside OUT in `blood` while IN is blank.
- Beats: ledger macro, village silhouette on a night sea, Maren's hut with a window lantern, HUD introduced as a margin note that becomes the HUD (diegetic birth: the ledger's own margin tallies lift off the page into screen space).
- Distinct: pure ink-on-black, minimal water, maximum typography.

### Chapter 2 — "The Causeway" (1:55-3:50)
- Signature: **the Causeway map with tide**. Top-down chart. Road across water, six-hour tide clock docked, the sea closing from both sides (two water edge paths advancing). Walkers are tiny amber dots with footprint trails that fill the map; OUT dots go amber to right, IN dots return teal.
- Visual idea: cartography/diagram language, one big pull from chart to world view (Causeway `mode` morphs map to world over 30 frames via a crossfade with a scale match).
- Ends with: clock latch + the bell (first appearance, small silhouette).

### Chapter 3 — "Seven" (3:50-5:45)
- Signature: **typographic flashback in the child's hand**. The flashback is a bone-on-night chalk world: DejaVu Serif words drop and settle ("ASLEEP", "THE BELL", "MOTHER") in huge low-opacity type behind a tiny child silhouette sitting beside a bell rope. Colour-restricted: only amber and ink, no teal (the sea is absent until the last beat when teal creeps from the frame edges).
- The tomorrow-dated entry discovery: ledger macro; a rack-focus-like opacity change; child hand ink `IN: 1` appears with a date one day in the future (the date is drawn LAST, in stroke ink, with a hesitation: pen pauses 0.4 s then writes it). Seed cue.
- Ends: HUD slice-drop.

### Chapter 4 — "The Long Night" (5:45-7:40) — the chained test
- Signature: **the AnkleShot + a night clock**. Tight on a chain, the lamp, the pen. Ankle chain and desk leg. A big clock face without numerals: the lantern flame slowly shrinks while the tide clock sweeps through the night in time-lapse (Camera cuts between 4 fixed object studies, each with a continuous micro-drift): chain, hands, lamp, window with the causeway lights.
- Time-lapse treatment: night counter ticks hours as typographic watermark (FreeSerif numerals, 0.07 alpha) swapping each "hour", 6 swaps across the chapter, each paired with a different light angle on the page (lamp position shift).
- Mid-point trick: a cut to the window: footprints appear on the causeway map INSIDE a small inset. They are Maren's prints, but the shot never says so (see twist 1 planting).
- Morning: bone-white dawn tint, the chain is intact, the ledger still short. HUD flatline.

### Chapter 5 — "What the Rope Knows" (7:40-9:50) — TWIST 1 at 9:30
- Signature: **evidence montage, one clue every ~12 s, each in a different visual language** so no two feel alike: (a) rope macro with the bell yoke, one-sided wear groove (hatch path), the groove drawn in amber in 3 passes; (b) the footprint map, adult prints and small bare prints side by side, then the adult line turns back alone (a Causeway data highlight, the "turns back" arc drawn by stroke); (c) the Stone with tally scratches in ghost-ink, grouped in fives.
- Staging TWIST 1: a slow, hushed move. The narrator says the line; the camera does a very slow push into the Stone. The tally strokes' ink style *crossfades* to Maren's own hand (same slant, same sevens), the HUD fades to 0 opacity (silence before the line), then in the last second a single stroke writes `MAREN` in the OUT column, in ink she would never write, in the same hand as the tally. No shake, no flash, everything quiet. Sound: all ambience drops out for 1.5 s, only the bell's decay remains.
- Ends: HUD is erased by an ink line, replaced by a handwritten tally.

### Chapter 6 — "Every Night" (9:50-11:50)
- Signature: **the same shot repeated with variations, the loop**: a locked-in-composition (but slow-drifting) frame of the hut doorway at 3:07 each night. Maren's silhouette leaves; the footprints trail; the loop plays 6 times with accelerating cuts (tide wipe each time), the date counter in FreeSerif on the wall flickering through nights. Repetition made rhythmic by a stepped metronome SFX.
- The HUD now has a new line: `WALKS: 14,975` appearing as the unspoken subtext (the counter is the same number as nights). Channel-split glitch at the end.

### Chapter 7 — "Counted Once" (11:50-13:50)
- Signature: **the village rewriting**. Pencil enters. Macro of old ledger pages; each page shows the printed OUT/IN with Maren's ink and, in the IN column, a faint cool-grey pencil `1` that nobody mentions. Pages turn through the decades (Page-turn transition, 8 pages max, each page unique by row data and by pencil handwriting variation: round, slanted, shaky, a schoolchild's).
- Cuts to village windows lighting one by one (each window = a villager; Silhouette `lit`). The pencil strokes were written by many hands; each hand different (4 stroke styles). This is the visual setup for twist 2's 'many hands' payoff.
- Ends: tide arc turns red, tide wipe.

### Chapter 8 — "The Name in the Column" (13:50-15:35) — TWIST 2 at 14:30
- Signature: **the 41-year-old night, replayed with new eyes**: the same night from Chapter 3 with the mother added. A flat 2D silhouette of the causeway at the last minutes of the tide; the mother wades *back out* (Silhouette `mother` moves against the camera drift), rings the bell (Bell full swing, the loudest strike), the small child silhouette crosses the causeway toward the village lanterns, the sea closes over the road behind; an amber lantern is left on the water for 3 s.
- Staging TWIST 2: the picture reverses what ch3 showed. Ch3's flashback was shown in the "wrong" colour grade (ink + amber only, no teal). Now the exact same shot layouts return with the teal present and the mother's direction flipped; the viewer feels the recomposition because shots match geometry from Ch3 (same camera path, reversed read). On the key line, the HUD tears upward, DELTA burns amber and clears to ZERO, and the ledger macro's OUT-only row gains an `IN: 1` in many pencil strokes superimposed (a pile-up of the 4 pencil hands) that resolve into Maren's name in ink.
- Then Maren writes her name (stroke mode, slowest write of the film, ~6 s) in the IN column, and her mother's name in the OUT column (first time). She rings the bell for the next walker. Last line over a held shot of the bell swing.

### Epilogue (15:35-16:15)
- Signature: **dawn + one walker silhouette** on the causeway, the lantern passing from Maren's hand to the walker's. Ledger HUD quiet at 0/0. A last close-up of the ink line drying (the `settle` effect) while the final line plays. Fade to ink0 over 45 frames. Title card in DejaVu Serif, small.

---------------------------------------------------------------------
## 4. PERFORMANCE PLAN

Targets: 1920x1080, 30 fps, 4 cores, ~16 min = 28,800 frames. At 3.5x realtime budget = roughly 4.6 hours max; target 3 hours (about 2.3 fps equivalent per core... i.e. render concurrency 4, ~0.25 s per frame per core).

**Expensive (avoid or tightly bound):**
- SVG filters (`feTurbulence`, `feGaussianBlur`, `feDisplacementMap`) at full screen: banned. Grain is a pre-baked PNG, "roughness" on ink is a second offset stroke.
- CSS `filter: blur()` and `backdrop-filter` full-screen: banned. Allowed only on small (<300 px) elements where truly needed, max 2 per frame.
- `mix-blend-mode` full-screen: avoided. Use alpha.
- Huge radial gradients on large elements that change every frame: allow only 2 animated gradients (lantern + vignette static).
- DOM node count: cap about 1,200 per frame. Footprints merged into single paths, stars merged into one path with per-star opacity groups (4 groups, not 140 nodes), brick/stone textures baked.
- `HtmlInCanvasMotionBlur` (8 samples = 8x cost): ONLY on the page-turn and the bell strike (a total of about 90 s of footage, small region), with `samples=4`. Everything else uses analytic "fake blur" (ghost trails, opacity-stepped duplicates, 2 copies at -1 and -2 frames' offset at 30%/15% opacity) for fast objects.
- Per-frame `getTotalLength`/`getPointAtLength` DOM calls: forbidden at render. Pre-bake path lengths and pen-head sample tables into `glyphs.ts`.
- Full-screen video/GIF: none exist.
- `random()` per frame: forbidden; use deterministic `noise()`.

**Cheap (use freely):** transforms and opacity on layers, a single large `<path>` per water layer, solid-colour rects, CSS gradients that do not change, SVG strokes with dash offset, `will-change: transform` on Camera and Layers, baked PNG textures (paper, grain) loaded once, pure functions with `useMemo`-free closure (frame-driven).

**Mitigations / process:**
1. Render per chapter as separate Remotion compositions into `out/ch{n}.mp4` (ProRes not required; h264 CRF 16) with `--concurrency=4` using 8 s test strips first; concat with ffmpeg stream-copy plus the final mixed audio. Allows a re-render of one chapter without redoing 16 minutes.
2. `--gl=angle` / default Chrome headless; `--disable-gpu` is not required; check `--timeout` with 120000 for macro pages.
3. Per-chapter perf smoke test: render frames at 5 evenly spaced positions + the worst frame (the one with most DOM), measure ms/frame, reject chapters >0.9 s/frame/core.
4. `staticFile` assets are small (two PNGs ~600 KB each + audio).
5. Use `<Sequence from durationInFrames>` with `premountFor` of 15 frames to hide font/image loading, `delayRender` for fonts (`@remotion/fonts`/local fonts per `local-fonts.md`).
6. Pre-compute per-chapter data in `calculateMetadata`.

**Audio-driven timing:**
- Pipeline: script text split into sentences (writer provides `script.json` with `{chapter, id, text}`); ElevenLabs "Daniel" generates MP3 per sentence (or per paragraph with `creative_generate_speech`), `creative_transcribe_audio` or ffmpeg `silencedetect` (per `silence-detection.md`) produces `timing.json`: `[{id, chapter, start, end, words?:[{w,s,e}]}]` in absolute seconds in the final narration track (gaps of 0.35 s inserted between sentences, 0.9 s between paragraphs, 1.6 s at chapter ends by concatenating with ffmpeg `adelay`/silence files, so narration and picture share one clock).
- `timing.json` is committed; the code imports it as data. A single `cue(id, "word"?)` helper replaces the old `makeTimeline` and returns seconds; components accept cue seconds, never frames.
- Scene durations: `calculateMetadata` per chapter sets `durationInFrames = ceil((chapterEnd + tail) * 30)`, with `Sequence` offsets = `round(start*30)`.
- Resync loop: if the writer edits a sentence, only the affected sentence re-generates, `timing.json` shifts downstream times automatically (the concat step recomputes offsets), and visuals follow because they key off ids. 
- Visual beats are authored as `{at: cue('c3.s14'), dur: 1.2}`, ink writing ends when its sentence ends; a "slack" param lets a beat float +-0.3 s without rework.
- Narration is the only master clock; music is ducked under it with a precomputed volume envelope from `timing.json` (-9 dB while speaking, smoothed 250 ms).

---------------------------------------------------------------------
## 5. SOUND DESIGN (synthesized: numpy + scipy + ffmpeg, no samples)

Script `audio/synth.py` generates 44.1 kHz stereo WAVs, then `audio/mix.py` mixes with ffmpeg filter-complex (sidechain-like envelope computed in numpy from timing.json; no heavy plugins).

### Three-mood ambient score (each a looped/long bed, crossfaded 4 s)
1. **Mood A "Ink Tide"** (calm, ch1, ch2, ch3, epilogue): A minor drone built from detuned saw+sine pairs (55, 110, 164.8 Hz), slow filter sweep (lowpass 400 to 900 Hz over 40 s), a soft sine-bell pad playing every 6 s from a pentatonic (A C D E G), reverb via a convolution with synthesized exponential-decay noise IR (3.5 s). Tide noise: pink noise lowpassed 600 Hz modulated by a 9 s LFO.
2. **Mood B "Tight Lantern"** (tension, ch4, ch5, ch6, ch7 start): sparse detuned minor second dyads (A/Bb), a ticking 0.5 Hz sine pulse (clock, not heartbeat; strictly no heartbeat), rising shepard-like shimmer through high sines with slow tremolo; low rumble at 40 Hz at -30 dB. Ch6's loop section gets a metronome-like rhythmic bed (see SFX).
3. **Mood C "Many Hands"** (release, ch7 end, ch8, epilogue): major mode resolution: A major open fifths + added 9th, warm wide choral pad (stacked sines with vibrato + formant-ish bandpass), a slow arpeggio on a sine-bell at 0.5 Hz. Enters at the twist 2 pivot with a 6 s swell, never louder than -18 LUFS under narration.
Transitions between moods only at chapter ends; twist 1 is *silent* (music stops 1 s before, dry room tone resumes after).

### SFX list (14), with synthesis recipe and cue
1. **Bell strike, long decay:** additive synthesis, partials at 1, 2.0, 2.76, 5.4, 8.9 x f0 (f0 = 392 Hz) with decays of 9 s, 6 s, 4 s, 2 s, 1 s plus a 3 ms noise click; slight beating (two detuned copies at 0.7 Hz); 8 s tail. Fires at: ch1 cold-open hit (once, early), ch2 bell intro, ch3 flashback sleeping (should have rung, here it does NOT ring, silence), ch5 twist 1 decay, ch8 mother ringing (series of 5 strikes), final line.
2. **Tide wash:** filtered noise (band 300-2500 Hz) with 7-11 s amplitude swells; stereo panned by an LFO; louder with `tide` value; fires as bed in all water scenes and swells at each tide wipe.
3. **Rope creak:** bandpass-filtered sawtooth with random FM modulation 80-260 Hz for 0.6-1.1 s, gain envelope; fires at bell rope pulls and ch5 macro rope.
4. **Pencil scratch:** high-passed noise bursts shaped by short envelopes following stroke speed (matches InkText progress derivative); used for pencil writing (ch7, ch8).
5. **Pen/ink scratch:** same as above but lower band (1.5-4 kHz), softer attack, tied to InkText stroke progress; fires for each `InkText`, volume proportional to pen speed.
6. **Ledger page turn:** noise burst 2-6 kHz with a fast swoosh envelope (0.35 s) plus soft low thud at the end; each page-turn transition.
7. **Chain link jingle:** clusters of 6-9 metal ticks (short sine+noise at 2-5 kHz) with randomized gaps (deterministic seed); ch4 shifts.
8. **Chain lock/ankle click:** a short two-stage metal clack (80 ms apart); ch4 start.
9. **Clock tick (soft):** 4 kHz click -25 dB, 1 Hz; ch4 during the time-lapse; changes pitch to 2 Hz as dawn comes.
10. **HUD glitch:** bit-crushed square sweeps and digital hiss, 10-14 frames with 3 stutter repeats; played at each chapter end (variation by chapter via parameter, tied to the closing described in 3.0).
11. **HUD counter roll tick:** tiny 6 kHz tick per digit roll, -28 dB.
12. **Footstep on wet stone:** low thump + noise tap, alternating pitch; used for the Causeway walkers and the ch6 loop (pitch-shifted for a child's lighter steps: a small, quicker pair).
13. **Lantern flame/fire flutter:** brown noise crackle with random pops; under all lantern close-ups.
14. **Wind/room tone:** low noise bed at 80-400 Hz; exists as a thread throughout; goes to *nothing* at twist 1.
15. **Dawn birds / gull cry (epilogue):** FM-synth chirps and glides on 2-4 kHz carriers; two gulls only.
Heartbeat is not used anywhere.

### Mix notes
Narration -16 LUFS integrated; music -28 LUFS under speech with ducking; SFX peaks -12 dBFS; final true peak -1.5 dB. Silence beats of 0.6 s before each twist line.

---------------------------------------------------------------------
## 6. DIVISION OF LABOUR AND REVIEW PROTOCOL

**Engineer A (kit + chapters 1-4):**
- Day 0: `theme2.ts` (palette, fonts), `noise.ts`, `glyphs.ts` (digits, letters, names; path lengths pre-baked), `Camera`, `Layer`, `Finish` (grain + vignette), `InkText`, `LedgerPage`, `LedgerHUD`, `WaterLayers`, `Sky`, `Silhouette` (+AnkleShot, Stone).
- Then chapters 1, 2, 3, 4 in order.
- Owns the timing helper `cue()` and the chapter composition scaffolding (`Chapter.tsx` template, `Root.tsx` registration, `calculateMetadata`).

**Engineer B (audio + chapters 5-8 + epilogue):**
- Hour 0-3: audio first, since it controls everything: ElevenLabs narration generation, `timing.json`, `synth.py` (three beds + 15 SFX), `mix.py`, preview mix. Start with a stub timing file from the character-count method so A and B can build before narration exists.
- Then `Causeway`, `TideClock`, `Bell` (kit items B owns), and chapters 5, 6, 7, 8 and epilogue, using A's finished kit.

**Handshake:** kit API frozen after 90 minutes (types in `kit/types.ts`); changes after that need a message to the partner. 

**Review protocol:**
1. Each chapter is rendered as **stills at fixed checkpoints**: first frame, every 5 s, each beat cue, the twist frames, last frame (`npx remotion still`), saved to `review/ch{n}/`.
2. The *other* engineer reviews: Engineer B reviews A's chapters 1-4 and vice versa. Checklist: (a) readable at thumbnail size (b) palette respected, no stray hues (c) numbers match the script (d) ink writes finish with the sentence (e) no empty frame for more than 10 s without a visual change (f) no overlap/clipping of text (g) one distinct idea per chapter honoured (h) grain/vignette present.
3. Fix pass limited to 45 minutes per chapter, then a 20-second render test for performance and an A/V sync check against narration.
4. Final: full assembly, then 3 spot checks of sync at 3 random timecodes; a joint pass on twist 1, twist 2, and last line.

---------------------------------------------------------------------
## 7. RISKS
- Handwriting realism without a script font: mitigated by stroke-authored glyphs for key words and italic serif for the rest; if time is short, the clip-wipe on Liberation Serif italic is the fallback for everything except names and numbers.
- Chapter 4 is a static room for 2 minutes: managed by 4 object studies, time-lapse typography, and the window inset.
- Chapter 7 can become repetitive pages: pencil hands vary per page, and pages move in different directions.
- Narration length drift changes all timing: cue-based design absorbs this.
