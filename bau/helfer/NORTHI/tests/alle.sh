#!/usr/bin/env bash
# NDI: alle Tests der Abgabe (Playwright + vorinstalliertes Chromium). Aufruf: bash bau/helfer/NORTHI/tests/alle.sh
cd "$(dirname "$0")" || exit 2
HERE=$(pwd); ROOT=$(cd ../../../.. && pwd); FILE=$(cd .. && pwd)/index.html
fail=0; declare -a RES
run() { local name=$1; shift; echo "=== $name"; if "$@"; then RES+=("PASS  $name"); else RES+=("FAIL  $name"); fail=$((fail+1)); fi; }
run "T0 Regeln" bash t0-regeln.sh
for t in t1-kits t2-ohne-engine t3-instrument t4-update t5-gleich t6-bilder; do run "${t}" timeout 600 node "$t.cjs"; done
# Rauchtests aus bau/tests (ESM: import 'playwright' braucht ein node_modules neben dem Skript – vorübergehend in .smoke/)
SM="$HERE/.smoke"; rm -rf "$SM"; mkdir -p "$SM"; ln -s "$(npm root -g 2>/dev/null)" "$SM/node_modules"
[ -d "$SM/node_modules/playwright" ] || { rm "$SM/node_modules"; ln -s /usr/local/lib/node_modules_global "$SM/node_modules"; }
for s in smoke v3-mk8-smoke v3-mk8b-smoke v3-qa-mk5reg-smoke; do
  cp "$ROOT/bau/tests/$s.mjs" "$SM/$s.mjs"
  run "bau/tests/$s.mjs" bash -c "out=\$(timeout 120 node '$SM/$s.mjs' '$FILE' '$HERE/bilder/rauch-$s.png' 2>&1); echo \"\$out\"; echo \"\$out\" | grep -q 'errors \[\]'"
done
rm -rf "$SM" "$HERE"/.tmp-*.html
echo; echo "===== Ergebnis"; printf '%s\n' "${RES[@]}"; echo "Fehlgeschlagen: $fail"
exit $fail
