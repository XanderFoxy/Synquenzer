#!/bin/bash
# VV-LOGO: alle Tests nacheinander (Playwright + Chromium, ffmpeg). Ergebnisse: tests/out/*.json, Bilder tests/out/*.png
# playwright muss für ESM auffindbar sein (z. B. Verweis node_modules → globale Module über dem Repository)
cd "$(dirname "$0")"
APP="$(cd .. && pwd)/index.html"; R=0
for a in "wc 16:9" "wc 9:16" "wc 1:1" "mr 16:9" "mr 9:16" "mr 1:1" "wc 16:9 mov"; do node vvl-export.mjs $a || R=1; done
node vvl-ui.mjs || R=1
node vvl-regress.mjs || R=1
node vvl-cancel.mjs || R=1
for t in smoke.mjs v3-mk8-smoke.mjs v3-mk8b-smoke.mjs; do echo "rauch $t: $(node ../../../tests/$t "$APP" out/rauch-$t.png)"; done
exit $R
