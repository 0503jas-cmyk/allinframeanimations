#!/bin/sh
# Mac/Linux: склеить части в один файл и проверить его
cat what_if_1000_years_VOICE_subtitled.mp4.part0 what_if_1000_years_VOICE_subtitled.mp4.part1 what_if_1000_years_VOICE_subtitled.mp4.part2 what_if_1000_years_VOICE_subtitled.mp4.part3 > what_if_1000_years_VOICE_subtitled.mp4
shasum -a 256 -c what_if_1000_years_VOICE_subtitled.sha256 2>/dev/null || sha256sum -c what_if_1000_years_VOICE_subtitled.sha256
