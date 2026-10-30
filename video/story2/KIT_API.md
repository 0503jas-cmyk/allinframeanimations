# KIT API — `src/kit/` (import everything from `./kit` or `../kit`)

Frame: 1920x1080, 30 fps. All components are pure functions of `useCurrentFrame()`; all time props are SECONDS in the current Sequence's local clock (use `timing.cue(id)`; remember `<Sequence from>` resets the clock). Positions are frame px unless said otherwise. Nothing uses SVG filters, blur, blend modes or Math.random.
Demo of every component: `src/KitDemo.tsx` (composition `KitDemo`, 720 frames). Textures are baked by `tools/make_kit_textures.py` into `public/kit/grain.png` and `public/kit/paper.jpg`.

## theme.ts
- `P` palette: ink0 `#050914`, ink1 `#0a1226` (main bg), ink2 `#12203f`, ink3 `#1d3159`, ink4 `#2a4474`, bone `#efe6d2`, boneShade, boneDim, penInk `#141a2e`, amber `#ffb347`, amberDeep, amberHot, teal `#5fd4c4`, tealDeep, blood `#c4543f` (only the wrong number / missing OUT), pencil.
- `FONT.hand` Liberation Serif (italic hand), `FONT.title` DejaVu Serif (caps, letterSpacing .2em), `FONT.accent` FreeSerif (numerals, subtitle words), `FONT.hud` Inter. No other families.
- Helpers: `FPS W H`, `rgba(hex,a)`, `mix(h1,h2,t)`, `clamp01 lerp smooth easeOut easeInOut prog(t,a,b)`, `hash(n)`, `noise(seed,x)` (deterministic, -1..1).

## timing.ts
```ts
import raw from './timing.json';           // [{id,text,start,end}] absolute seconds
const timing = loadTiming(raw);            // or stubTiming([{id,text}], startSec, charsPerSec, gap)
timing.cue('c1.01')      // start sec;  timing.cue(id, +0.2) offset
timing.end(id)  timing.dur(id)  timing.get(id)  timing.has(id)  timing.at(sec)
sec(frame) fr(seconds) useSec()
const {t, p, active, started, done} = useCue(timing, id, lead=0.15)  // t sec since (start-lead), p 0..1
useSpan(timing, fromId, toId)  // 0..1 across a span of sentences
```
Unknown ids throw (fail loudly). Inside a chapter Sequence, offset: `timing.cue(id) - sequenceStartSec`.

## Camera.tsx
- `<Camera from={{x,y,s,r}} to={...} start end keys={[{t,x,y,s,r}]} settles={[{at,dur,amount}]} drift={px}>` one transform (scale+rotate) for the scene; `keys` overrides from/to; `settles` = push-in beats; `drift` = slow noise handheld (never shake). `useCamera()` returns `{x,y,s,r,t}`.
- `<Layer depth={0.2|0.5|1|1.6} x y opacity>` translates by `-cam.x*depth`. Anything not inside a Layer stays screen-fixed in x/y (but still gets scale). Layers fill the frame; for water/sky wider than the screen pass `x={-140}` and a wider `width`.

## Finish.tsx — `<Finish grain=0.07 vignette=0.62 wash?>`
Put last. Baked grain tile shifted at 10 fps (plain alpha), static vignette that breathes 1.00-1.015 over 6 s, optional full-frame colour `wash` (dawn flash etc).

## Sky.tsx — `<Sky mood='calm'|'tense'|'dawn'|'dusk' stars=110 moon={{x,y,r}}|false aurora clouds=3 horizon=720 seed>`
Gradient, stars as 4 merged paths (twinkle by group), moon with glow + craters, low-poly clouds drifting (drawn behind the moon).

## WaterLayers.tsx — `<WaterLayers layers tide reflections reflectFrom width height step>`
Each layer `{y, amp, wavelength, speed, fill, fillBottom, opacity, foam, chop}` = ONE path of two summed sines. Default 4 layers (ink). `tide` -1..1 raises/lowers all layers (150px). `reflections=[{x,length,width,color}]` shimmer streaks (amber default, bone for moon). Teal hairline + dashed teal foam on `foam:true`.

## Lantern.tsx — `<Lantern x y scale glow=260 lit seed hang glowOnly>`
Cage + flame + two radial-gradient glows with deterministic flicker. `lit` boolean or 0..1. `flicker(t,seed)` exported.

## Silhouette.tsx
`<Silhouette kind='village'|'walker'|'child'|'mother'|'clerkHut'|'tower'|'post'|'stone' x y scale flip fill rim walk={{speed,bob}} lantern={0..1} lit={n|number[]} tally tide seed>`; x,y = ground point. No faces.
- walkers/mother/child: paper-puppet, leg/arm swing from `walk.speed` (cycles/s), optional lit lantern in hand, `rim` colour edge light.
- village: 11 houses + tower; `lit` = how many windows are lit (or index list); each lit window glows (3 concentric discs).
- clerkHut: `lit` 0..1 lights the window. tower: dark, no light. post: gibbet post.
- stone (Drowning Stone, ~330px tall at scale 1): `tally` count (fractional = stroke being scratched; groups of five with diagonal), `tide` 0..1 wet darkening line.
- `<AnkleShot tension=0.2 jingle=0 links=10 lamp=1/>` full-frame floor-level shot: desk slab + desk leg with iron ring, sagging chain (tension 0 slack .. 1 taut, `jingle` link micro-rotation), stockinged ankle with iron ring cut off by the frame. Wrap in `<Layer>` for parallax; add a `Lantern` behind it for light.

## Causeway.tsx — `<Causeway mode='map'|'world' tide prints highlight box now chart opacity>`
`prints: {x 0..1 along road, t sec (reveal), size 'adult'|'small', dir 'out'(amber)|'in'(teal), lane -1..1}`; any count, rendered as 4 merged paths. `tide` 0..1 closes the sea over the road (map: bands advance from top and bottom; world: lapping edges). map: chart with grid, soundings, compass, contour lines, shores, title; `highlight=[x0,x1]` dashed amber ellipse; `box` = chart rect. world: perspective road to vanishing point (960,430), wet-stone sheens; draw a `<Sky horizon={430}>` behind it.

## LedgerHUD.tsx — `<LedgerHUD out in night delta? glitch mode corner nightText opacity tone>`
Inter card: OUT / IN / NIGHT (comma, 5 digits) / DELTA (blood red when non-zero; default out-in). Counters are digit rollers: pass a fractional number to roll, e.g. `night={rollValue(t, 2.2, 14974, 14975)}`. `mode` 'full'|'mini'|'hidden'; `corner` 'bl'|'br'|'tl'|'tr'. `glitch` 0..1 = 4 horizontally offset clipped bands + amber channel split + scan bars; `nightText='---'` = flatline. `tone` recolours digits (grey for desaturation).

## TideClock.tsx — `<TideClock minutesToClose ebbing size x y cracked label>`
Centre-positioned dial. Teal arc = time left of six hours; amber under 20 min, blood under 5; hand jiggles; roman XII III VI IX (FreeSerif); label below dial; `cracked` paints chapter-end cracks.

## Bell.tsx — `<Bell x y size strikes=[sec] swing amp=18 ropeWear showRope macro rings>`
x,y = bottom centre of the gibbet post (post ~470px tall at size 1). Damped-cosine swing per strike with clapper lag; 3 teal expanding rings per strike; `swing` (deg) overrides physics; `ropeWear` 0..1 draws the polished groove + yoke notch; `macro` thickens the rope with fibre dashes.

## InkText.tsx — `<InkText mode='stroke'|'clip' text x y size start end ink hand align underline strike settle penHead tracking slant weight>`
x = left (or centre with `align='center'`), y = BASELINE; start/end in seconds (use `timing.cue(id)` / `timing.end(id)` so the writing ends with the sentence). `ink` 'night' (dark, for paper) | 'bone' (on night) | 'pencil' (cool grey, for paper) | 'amber' | 'blood' | 'stone'. Ink starts wet (lighter/amber) and dries over `settle` seconds.
- stroke: authored pen glyphs A-Z (case-insensitive), 0-9, `, . - : ' /` ; drawn with pathLength dash + pen head; size = cap height. Use for names, numbers, short words. `inkWidth(text,size)` to measure.
- clip: any string in Liberation Serif italic, wiped by a soft CSS mask with a travelling nib; size = font size; single line.
- `hand='child'`: 1.5x nib, per-letter rotation/baseline jitter.
- `underline` / `strike` draw a stroke after the text (strike in blood).

## LedgerPage.tsx — `<LedgerPage rows x y width=1200 height=820 scale rotate lamp torn child title opacity>`
Baked paper jpg, ruled lines, margin, DATE/OUT/IN. `rows: {date, out?:string[], in?:string[], ink:'ink'|'pencil'|'child', writeAt, writeDur=1.6, ghost, flag}`; row i occupies line i (74px). `ghost` rows fade in from nothing; `flag` writes the OUT entry in blood. `lamp={{x,y}}` page-local warm radial (animate x/y for a moving lamp). Put in a `Camera`/`Layer` for macro pushes (text is vector, so scaling is clean).

## Performance notes
Measured on this box (4 cores): see lead summary. Rules kept: no filters, no blur, <= 2 animated gradients per lantern, footprints/stars merged into few paths, grain is one baked PNG, DOM ~300-600 nodes per scene. Pass `Finish grain` ~0.07; heavy grain raises the h264 bitrate (10 s at crf 20 = ~16 MB).
