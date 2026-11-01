#!/bin/bash
# Rauchtests aus bau/tests gegen die G10a-Datei (Kopie mit node_modules-Verweis, weil die Skripte 'playwright' als ES-Modul laden)
set -u
H="$(cd "$(dirname "$0")" && pwd)"; APP="$(cd "$H/.." && pwd)/index.html"; BT="$(cd "$H/../../../tests" && pwd)"; BASE="$(cd "$H/../../../snapshots" && pwd)/R-4300.html"
W="$H/.tmp/rauch"; mkdir -p "$W"; ln -sfn "$(npm root -g)" "$W/node_modules"
fail=0
for t in smoke.mjs v3-mk8-smoke.mjs gmkp8-voc-mic.mjs; do cp "$BT/$t" "$W/$t"; done
echo "== smoke.mjs";        out=$(cd "$W" && timeout 120 node smoke.mjs "$APP" "$H/bilder/rauch-smoke-390x844.png" 2>&1); echo "$out"; echo "$out" | grep -q 'errors \[\]' || fail=1
echo "== v3-mk8-smoke.mjs"; out=$(cd "$W" && timeout 120 node v3-mk8-smoke.mjs "$APP" "$W/mk8.png" 2>&1); echo "$out"; echo "$out" | grep -q 'errors \[\]' || fail=1
echo "== gmkp8-voc-mic.mjs (neu gegen Basis)"; out=$(cd "$W" && timeout 300 node gmkp8-voc-mic.mjs "$APP" "$BASE" 2>&1); echo "$out" | tail -25; echo "$out" | grep -q '^FAIL' && fail=1
exit $fail
