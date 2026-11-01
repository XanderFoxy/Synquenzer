#!/bin/sh
# G9B: alle Tests (Chromium). NPMDIR = entpackte npm-Pakete (siehe h.mjs), Modell kommt echt von der Modell-Ablage.
cd "$(dirname "$0")" || exit 1
f=0; for t in smoke.mjs t1-asr.mjs t2-ui.mjs t3-regel28.mjs t4-webgpu.mjs; do echo "== $t"; node "$t" || f=1; done; exit $f
