# THE DROWNED MERIDIAN — storyboard (12 min, 1920×1080 @ 60 fps)

**One thread:** *a ship that cannot move is slowly learning what is holding it.* The same object — a **light** — escalates:
dead-calm reflections → the aurora curtain → ring of fires on the island → a ghost lantern in the walls → bioluminescent leviathan → flares against the kraken → the Lamp that is really an **eye** → the beam that cuts the wall open → plain dawn. Every transition is carried by light (a glow that becomes the next scene's light source).

**Look:** dark graphic-novel / paper-cutout 2.5D. Teal-black sea, cold cyan anomaly light, warm amber ship lamps, violet ghost-light. Wren wears the only saturated yellow (raincoat) so the eye always finds her.
**Cast:** Capt. Mara Voss · 1st Mate Eli Brandt · Dr. Noor Haddad · Eng. Jonas Kell · Wren Hale (15, deckhand) · Narrator · The Drowned (ghost whisper) · Grandfather Hale (ghost).
**Camera rule:** never static while the story moves — slow dolly/arc + parallax (sky 0.05 · wall/island 0.1 · far sea 0.2 · ship 0.6 · near waves 1.0 · foreground fog 1.4), roll ≤ 2.5°, DOF via downscale-blur on near/far layers, motion blur by sub-frame averaging on whips and strikes.
**Sound rule:** score is a dark-ambient piece in D phrygian that grows with the story; SFX are tied to named visual events (`events.json`); speech ducks music/SFX by ~9 dB. Key accents (see sync map in `src/events.js`): crossing the wall (110.0 s), island reveal (≈198 s), first ghost through wall (≈279 s), leviathan eye (≈360 s), kraken strike (≈428 s), engine catch (≈445 s), lamp turn (≈643.5 s), dawn (≈692 s).

| # | Time | Scene | Variants considered (chosen **bold**) |
|---|------|-------|----------------------------------------|
| 1 | 0:00–0:55 | The Silence | a) pull back from compass needle · b) **fog opens on an unmoving ship, rising crane-up from mirror-sea, title born out of the reflected lamp** · c) log-book pages flipping to sea |
| 2 | 0:55–1:50 | Dead Calm | a) crew portrait montage · b) **walk-and-talk deck: engine-room hatch → bridge wing → look up; stars mirror** · c) drone orbit |
| 3 | 1:50–2:50 | The Wall | a) storm · b) **horizon line becomes a rising curtain of light; ship dragged in; clocks freeze (watch macro)** · c) top-down vortex |
| 4 | 2:50–3:50 | The Island | a) island seen through binoculars · b) **glassy mirror sea with floating stones; spire rises, ring of fires drifts toward ship** · c) island under ship |
| 5 | 3:50–4:50 | Below Deck | a) mess hall · b) **long one-point corridor, dolly forward, lamps die one by one, first face in bulkhead** · c) engine-room |
| 6 | 4:50–5:50 | The Drowned | a) séance table · b) **mess hall, ghosts stream through walls in spirals; ghost portrait speaks; Wren's reveal** · c) flashback |
| 7 | 5:50–6:50 | Leviathan | a) from above · b) **underwater cut-away: hull above, a living mountain of lights passes beneath; eye turns** · c) crew POV only |
| 8 | 6:50–8:00 | Kraken | a) deck-level melee · b) **tentacles rise on rhythm of the engine sputter; hull wrap; flare burst whitens frame, tentacles recoil** · c) kraken from below |
| 9 | 8:00–8:55 | The Plan | a) map table · b) **quiet deck, shared lantern, faces lit from below; boat lowered into black glass** · c) montage |
| 10 | 8:55–9:55 | Shipwreck Shore | a) beach walk · b) **boat enters a canyon of fused hulls, masts like trees, ghost procession, grandfather appears** · c) aerial |
| 11 | 9:55–11:00 | The Lamp | a) boss fight · b) **spiral stair of reaching hands → the crystal opens as an eye → hundreds of ghost hands turn the wheel → beam cuts the wall** · c) dream |
| 12 | 11:00–12:00 | Open Water | a) epilogue only · b) **gap in the light, island dives, ship runs; dawn; compass turns back; names written on the waves** · c) credits crawl |

Per-scene plan cards (time · state/action · space · text · camera/optics · link in/out · sound · risk):

1. **0–55 The Silence.** Black → fog-lit mirror sea, Meridian Star dead still, amber window lights doubled in water. Slow crane-up (parallax: fog 1.4 / ship 0.6 / stars 0.05). Title *THE DROWNED MERIDIAN* forms from the reflected lamp at 36 s (Cinzel, letter-spacing relaxes 0.5→0.18 em, letters rise out of water-line mask). Out: lamp glow washes to next scene. Sound: single bowed drone, distant bell, water lap, log VO. Risk: title legibility over bright glow → darken plate 30%.
2. **55–110 Dead Calm.** Deck walk: Jonas (hatch), Mara, Eli; Noor looks up. Aurora ribbons start; star field **mirrors** (second constellation rotates counter-clockwise). Lip-sync on every spoken line; speaker gets cool rim-light, others drop to 70 %. Camera tracks right along the rail, ends tilt-up to sky. Sound: engine-room tick, creaks, rising string pad.
3. **110–170 The Wall.** Horizon sprouts a vertical curtain of pale light (ribbons, 18 % → 100 %), sea flows backward (wave phase reversed), ship slides; whip-pan with 5-sample motion blur at the crossing (t = 150–155 s); watch macro: second hand stops, glass cracks. Cross line at 155 s: white-cyan flash ≤ 3 frames fade (no strobe). Sound: swell + sub drop + tick stop.
4. **170–230 The Island.** Glass sea mirrors an inverted sky; floating stones drift; mist parts; spire with ring of fires rises (parallax 0.1 → 0.3 as ship approaches); binocular iris vignette on Eli at 216 s as lights move. Sound: choir pad, wind, eerie harmonics.
5. **230–290 Below Deck.** Corridor one-point perspective, dolly forward 6 m, lamps flicker/die, steam pipes; Wren & Jonas walk; whispers (ghost voice w/ reverb) panned L/R; at 279 s a face presses out of the bulkhead then slides through the wall. Sound: whisper layers, pipe groans, heartbeat.
6. **290–350 The Drowned.** Mess hall; spiral ghost streams along walls, Noor's instrument needle spikes; frost creeps on glass; ghost bust appears speaking (v-lights) ; Wren's reveal close-up. Sound: choir, string tremolo.
7. **350–410 Leviathan.** Cut-away: ship above, water line mid-frame, light shafts, caustics, bioluminescent chain passes 4 layers deep; eye opens near the hull (≈ 360 s hit); slow, big, silent—music thins to sub + bell. Sound: leviathan call (descending FM), water rumble.
8. **410–480 Kraken.** Tentacle chains erupt on beat; hull wrap, wood groans; Jonas' engine sputter drives rhythm (3 coughs → catch at 445 s); flares light the water → white bloom → tentacles recoil. Camera: handheld-style shake with damping, whip to starboard. Sound: taiko hits, braams, engine, flare hiss.
9. **480–535 The Plan.** Calm; lantern-lit faces; slow orbit; boat lowered; glass-sea reflection of four lights. Sound: warm pad, solo bell motif.
10. **535–595 Shipwreck Shore.** Canyon of hull-cliffs, masts, rope; ghost procession (blue figures); Grandfather materialises, translucent, with Wren in close-up. Sound: whistles of wind in rigging, choir, bells.
11. **595–660 The Lamp.** Spiral stair rises in screw-camera; hands reach from walls; the crystal turns into an iris/eye (pupil dilates), whole tower shudders; ghost hands on the wheel; at 643.5 s the beam swings out and cuts the wall — white bloom (soft, ramped over 20 frames). Sound: climax: drums, choir, crystal grind, beam hum.
12. **660–720 Open Water.** Gap in the light, leviathans part, kraken releases, island dives (spray, glow dies); dawn grades warm; compass shot; last log VO over names appearing on waves; title card + "A Claude animated short" credit fade-out (last 4 s black). Sound: release → unresolved final chord.

**Primary risks checked first:** (1) Canvas2D at 1080p60 — benchmarked ≈ 60 ms/frame for a layered scene; full film rendered in 4 parallel workers. (2) Speech coverage — 71 ElevenLabs lines measured, 0 overlaps, 0 scene overruns. (3) Subtitles — burned-in (Inter) + `.srt` sidecar generated from the same timeline.
