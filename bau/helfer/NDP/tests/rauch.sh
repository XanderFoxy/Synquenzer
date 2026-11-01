#!/usr/bin/env bash
# Rauchtests aus bau/tests (unverändert) gegen NDP: Seite lädt ohne Fehler, Bild nach tests/bilder/
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$HERE/../../../.." && pwd)"; F="$HERE/../index.html"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT; cp "$ROOT"/bau/tests/{smoke,v3-mk8-smoke,v3-mk8b-smoke,v3-qa-mk5reg-smoke}.mjs "$TMP/"; ln -s "$(npm root -g)" "$TMP/node_modules"
rc=0
for t in smoke v3-mk8-smoke v3-mk8b-smoke v3-qa-mk5reg-smoke; do
  out="$(cd "$TMP" && node "$t.mjs" "$F" "$HERE/bilder/rauch-$t.png" 2>&1)"
  if echo "$out" | grep -q 'errors \[\]'; then echo "OK   Rauchtest $t: $out"; else echo "FEHL Rauchtest $t: $out"; rc=1; fi
done
exit $rc
