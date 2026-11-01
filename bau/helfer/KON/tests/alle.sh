#!/bin/sh
# KON: alle eigenen Tests + die vorhandenen Rauchtests (bau/tests) gegen bau/helfer/KON/index.html
cd "$(dirname "$0")/../../../.." || exit 1
fail=0
for t in kon-block kon-konsol kon-save kon-layout; do node bau/helfer/KON/tests/$t.mjs | tail -1 || fail=1; done
for t in smoke v3-mk8-smoke v3-mk8b-smoke v3-qa-mk5reg-smoke; do echo "$t: $(node bau/tests/$t.mjs "$PWD/bau/helfer/KON/index.html" "$(mktemp -d)/smoke.png" | tail -1)"; done
exit $fail
