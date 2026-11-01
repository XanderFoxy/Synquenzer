#!/usr/bin/env bash
# G10g: alle Tests gegen bau/helfer/G10G/index.html (Playwright + vorinstalliertes Chromium). Aufruf: bash bau/helfer/G10G/tests/alle.sh
# ESM findet 'playwright' nur über node_modules eines Elternordners: bei Bedarf einmal
#   mkdir -p ~/node_modules && ln -s "$(npm root -g)/playwright" ~/node_modules/ && ln -s "$(npm root -g)/playwright-core" ~/node_modules/
cd "$(dirname "$0")" || exit 1
APPF="$(cd .. && pwd)/index.html"; ROOT="$(cd ../../../.. && pwd)"; fail=0
run() { local n="$1"; shift; printf '== %s\n' "$n"; if out=$(timeout 900 "$@" 2>&1); then echo "$out" | tail -1; else echo "$out" | grep -v '^PASS' | tail -8; fail=$((fail+1)); fi; }
for t in g10g-regeln g10g-60-leiter g10g-61-gesang g10g-62-stufen g10g-63-oktav g10g-64-stimmlos g10g-65-regel28 g10g-66-platz g10g-quelle; do run "$t" node "$t.mjs"; done
for s in smoke v3-mk8-smoke v3-mk8b-smoke v3-qa-mk5reg-smoke; do
  printf '== %s\n' "$s"; out=$(cd "$ROOT/bau/tests" && timeout 120 node "$s.mjs" "$APPF" "/tmp/g10g-$s.png" 2>&1); echo "$out"
  echo "$out" | grep -q 'errors \[\]' || fail=$((fail+1))
done
echo; [ $fail -eq 0 ] && echo "ALLE GRÜN" || echo "FEHLER: $fail"
exit $fail
