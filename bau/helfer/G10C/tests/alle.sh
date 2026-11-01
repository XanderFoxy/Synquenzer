#!/bin/sh
# G10c-Tests (Playwright + Chromium, Touch). Aufruf: sh bau/helfer/G10C/tests/alle.sh
# braucht das globale playwright (NODE_PATH) und für g10c-runden.mjs bau/node_modules → globales node_modules (ESM-Harness aus bau/tests)
cd "$(dirname "$0")" || exit 1
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"
[ -e ../../../node_modules ] || ln -s "$NODE_PATH" ../../../node_modules
F=0
for t in g10c-core.mjs g10c-wave.mjs g10c-layout.mjs g10c-ggb-alt.mjs g10c-perf.mjs g10c-runden.mjs; do
  echo "== $t"; OUT="${OUT:-$(pwd)/bilder}" node "$t" > "/tmp/g10c-$t.log" 2>&1; r=$?
  grep -c '^ok' "/tmp/g10c-$t.log" | sed 's/^/   ok: /'; grep -v '^ok' "/tmp/g10c-$t.log"; [ $r -eq 0 ] || F=1
done
for s in smoke.mjs v3-mk8-smoke.mjs v3-mk8b-smoke.mjs v3-qa-mk5reg-smoke.mjs; do echo "== bau/tests/$s"; node "../../../tests/$s" "$(pwd)/../index.html" "/tmp/g10c-$s.png" | tail -1; done
exit $F
