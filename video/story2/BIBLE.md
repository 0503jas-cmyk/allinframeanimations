# BIBLE — "The Tide Clerk of Harrow Deep" (working title)

Jury verdict (4 jurors, strict): winner of 4 original pitches, 33/40. Goal for the finished script and film: 38-40/40.
Deliverable: a 16-minute (at least 15:30, never under 15:00) English narrated animated story, 1920x1080, 30 fps, rendered by CODE (Remotion/React, SVG, canvas). One AI narrator (British male, steady, ElevenLabs "Daniel"), synthesized music and SFX. No photos, no stock footage, no 3D characters, no realistic faces, no image generation.

## Premise
Harrow Deep is a village on a tidal island. A stone causeway is open for six hours between tides; a bell warns walkers when the sea is about to close the road. Maren is the tide clerk (first-person narrator, 48). Every crossing she logs OUT (walkers leaving the village) and IN (walkers who come back) in a ledger. For forty-one years, 14,975 nights, the ledger has been exactly one short: one OUT with no IN. The village thinks the missing person is a ghost. Maren says she knows exactly who is missing: she says she wrote the name herself the night she was seven, and let her drown.

## Spine and twists (do not change the spine; improve execution)
- Her want: one night with a perfect ledger, nobody lost. Her wound: the guilt she has carried since age seven (she fell asleep on bell duty; her mother crossed uncounted; the tide closed).
- Cold open: the count (14,975 nights, one short), the voice, the confession. Hook inside 15 seconds.
- Seed: the tomorrow-dated entry. Maren finds, on the page she wrote at age seven, in her own childish hand, an entry dated the NEXT night: "IN: 1" beside a blank. She assumes it is a name she failed to count.
- Mid-story test (about 35-40%): she stays awake, chained to her desk by the ankle, to prove nobody walks out. The ledger is still one short in the morning. Easy explanations are closed off.
- TWIST 1 at about 60% (around minute 9:30): Maren herself is the phantom. She sleepwalks to the Drowning Stone every night; the missing OUT is her.
- Discovery by EVIDENCE, not telling: the bell hanging at the causeway has 41 years of rope-wear on one side only; the footprint map shows small bare prints beside an adult's set that turn back alone; her own tally scratches on the Stone.
- TWIST 2 at about 90% (around minute 14:30): she was the "In: 1". Her mother did not drown. Her mother waded back out, rang the bell until the child was across, and the sea took the mother. The gap was never a loss; it was an unrecorded name: Maren's own. The village has written IN: 1 in pencil every night for 41 years to keep her alive, so she is held up by many hands, not only her mother's.
- Final act: Maren writes her own name in the IN column and, for the first time, her mother's name in the OUT column. She rings the bell for the next walker; the debt passes on instead of ending. Last line: "I was never the one who failed to count. I was the one who was counted."

## Tone and craft rules
- Restrained, precise, dry first-person voice; no melodrama, no moralizing, no direct address to the viewer ("that's what you did tonight" is banned), no recaps.
- Child's guilt and loss handled with tenderness and nothing graphic.
- One reveal or one visual change at least every 10-15 seconds. Each chapter ends on a cliffhanger. Every number on screen is consistent with the narration.
- Narration must be TTS-friendly: spell out numbers in the text ("fourteen thousand, nine hundred and seventy-five"), short and medium sentences, no parentheses, no unusual symbols; sentences end with full stops so pauses land.
- Narration length: 2,450 to 2,650 words in total (the narrator speaks about 150 words per minute). Eight chapters of roughly two minutes, plus a short epilogue.

## On-screen mechanic (persistent)
Ledger HUD (OUT / IN counters and nights counted), tide clock (six-hour window, closing), causeway map that fills with footprints; the HUD glitches or the tide closes at each chapter end.

## Visual world (restricted palette)
Ink-night blue, bone parchment, lantern amber, tide-foam teal; one signature motif: handwriting in ink that writes itself. Layered parallax water made of sine waves, silhouettes, lanterns, a pendulum bell, ledger pages in macro, typographic flashbacks.

## Production constraints
Two engineers will build this overnight on 4 CPU cores, Remotion; average render budget about 3.5x realtime, so avoid heavy per-frame blur/filters at full screen; reuse a small kit of components. Fonts available: Inter, DejaVu Serif, Liberation Serif, FreeSerif. Reference docs for Remotion best practice: /home/user/remotion-dev/skills/skills/remotion-markup/*.md. Principles from the motion skill: continuous purposeful camera, depth and parallax, typography as action, motion blur by relative motion where affordable, music and SFX synced to actions.
