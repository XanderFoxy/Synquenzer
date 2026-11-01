#!/bin/sh
# V6A: alle Tests nacheinander (Playwright + Chromium). Aufruf aus dem Repo: sh bau/helfer/V6A/tests/alle.sh
cd "$(dirname "$0")/../../../.." || exit 1
APP=$PWD/bau/helfer/V6A/index.html; OUT=${V6A_TMP:-/tmp}; fail=0
for t in regeln regel28 rampe modi klick live-offline export matrix engines daten ui k1 paritaet cpu; do
  printf '%-14s ' "$t"; if node bau/helfer/V6A/tests/v6a-$t.mjs > "$OUT/v6a-$t.log" 2>&1; then echo grün; else echo "ROT  (siehe $OUT/v6a-$t.log)"; fail=1; fi
done
printf '%-14s ' smoke; node bau/tests/smoke.mjs "$APP" "$OUT/v6a-smoke.png" 2>&1 | tail -1
printf '%-14s ' orch-mk-check; node bau/tests/orch-mk-check.mjs "$APP" 2>&1 | tail -1
printf '%-14s ' v3-mk2-wellen; node bau/tests/v3-mk2-wellen.mjs "$APP" 2>&1 | tail -1
exit $fail
