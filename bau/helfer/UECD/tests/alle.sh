#!/bin/sh
# Alle UE-C/D-Tests (Playwright + Chromium). Ergebnisse: tests/out/*.json, Bilder: tests/out/*.png. Danach: python3 status.py
cd "$(dirname "$0")"
mkdir -p out
for t in ue-abnahme.mjs ue15-break.mjs ue-bedienung.mjs ue-r28-perf.mjs; do echo "== $t"; node $t | tail -1; done
echo "== ue12-pegel.mjs (≈ 10 min)"; node ue12-pegel.mjs all auto,auf,ab > out/ue12.log 2>&1; tail -2 out/ue12.log
echo "== bau/tests Rauchtests"
for f in smoke.mjs v3-mk8-smoke.mjs v3-mk8b-smoke.mjs v3-qa-mk5reg-smoke.mjs; do node ../../../tests/$f "$PWD/../index.html" out/rauch.png | tail -1; done
