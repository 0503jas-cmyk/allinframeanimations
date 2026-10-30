# Designer critique of SCRIPT_v1

## 1. Samey or static
- Ch2 and Ch3 are both "object macro + talking hands". Fix: Ch2 stays macro/typography; Ch3 turns into a map-and-cards chapter (atlas unfolds, three fact cards jitter, then the chain close-up).
- Ch4 is one room for 120 s. Fix: four studies (oil gauge, chain, tide clock time-lapse, window inset with the lamps), each with its own drift, plus hour watermarks.
- Ch5, Ch6 and Ch7 are all "night on the causeway". Fix by camera language. Ch5 is low, sea-side and macro (stone, rope). Ch6 is entirely top-down plan view (flour floor, atlas, case card). Ch7 is raking-light macro, then one long wide silhouette.
- Ch8 is the flat silhouette flashback, no HUD until the end.

## 2. Expensive or impossible
- Raking-light relief on the pencil groove: fake it with a light and a dark copy of the stroke offset 1px, plus a sliding gradient. No normal maps.
- Strongroom storm: 2D only (door as skewX, ledger bobbing, water layers).
- Wet cobbles: gradient sheen strips, not texture.
- Page riffle: 8 baked pages, transforms only.
- Flour: at most 30 dust dots; prints are a masked baked path.
- Eleven lamps: gradient discs, no blur.
- The nightdress figure drawn in the OUT column (Ch5) breaks your strokes-only rule. Put the figure on the Stone, or make it a stroke that leans.

## 3. Continuity
- Night count. Storm night is 14,975. The chained night is 14,976. The flour night is 14,977. The watch night is 14,978. The Ch8 telling night is at least 14,979, not 14,977. Please fix the number in Ch8.
- Ch5: "Two nights ago a stroke, one night ago a stroke, then a space". The gap should be last night (the chained night), not older. Reorder it.
- HUD OUT 1 / IN 0 reads as lifetime. Ch4 logs two fishermen. Decide: the HUD shows OUTSTANDING 1 plus tonight's OUT/IN. I will build it that way.
- Ch7: the oldest ledger was never opened, yet it has 41 years of grooves. Say she turns the daily ledgers.
- Ch2 telegraphs twist 1 heavily: salt, aching feet, pencil smear and Kell's grey thumb in Ch3. Keep the pencil, trim one of the salt or feet beats.

## 4. Cuts, in visual order
1. Ch6 case-file dictation (it repeats Ch5).
2. Ch2 hem, boots and ache glyph.
3. Ch3 Wenna scene.
4. Ch4 opening arithmetic paragraph and the fishermen log.
5. Ch7 pages-for-four-hours.
That is about 600 words. Cut about 150 more in Ch1 and Ch8 prose.

## 5. My three questions
- Prints glimpsed in the atlas at the end of Ch4: good, keep it.
- Full flashback not needed earlier. I do need a fixed "post at dusk" composition (post, lamps right, sea behind) shown in Ch1 and the Ch4 atlas so Ch8 can mirror it.
- Chapter-end cliffhangers are fine.

## 6. Sentence ids
Yes. Please give one sentence per line as [c1.01], keep ids stable across edits, and tag numbers and names (14,975, Elin Voss, Maren Voss, "In, one") as cue words.
