#!/bin/bash
# G10a: alle Abnahme-Tests (G10-01 … G10-05), Regel 28, Rauchtests, statische Prüfungen. Ergebnis je Test in .tmp/<NAME>.json
set -u
H="$(cd "$(dirname "$0")" && pwd)"; cd "$H"; APP="$H/../../index.html"
fail=0; run() { echo; echo "######## $1"; timeout 600 node "$1" || { fail=1; echo "!! $1 ROT"; }; }
echo "######## statisch"
n=$(grep -c '^  live: true,' "$APP"); [ "$n" = 1 ] && echo "  ✓ genau 1× live: true" || { echo "  ✗ live: true = $n"; fail=1; }
PAT=$(echo 'a29yZ3xtaWNyb2tvcmd8cmFkaWFzfGR3Z3N8a29kYW1vfG1hc2sxfFxibm9yZFxifGtvbXBha3Q=' | base64 -d)   # Liste der verbotenen Wörter (kodiert, damit sie nicht im Klartext im Repo stehen)
n=$(grep -ciE "$PAT" "$APP"); [ "$n" = 0 ] && echo "  ✓ verbotene Wörter = 0" || { echo "  ✗ verbotene Wörter = $n"; fail=1; }
n=$(grep -o 'MS 2000' "$APP" | wc -l); [ "$n" = 1 ] && echo "  ✓ MS 2000 genau 1×" || { echo "  ✗ MS 2000 = $n"; fail=1; }
grep -q "const VERSION = '4.30.0';" "$APP" && echo "  ✓ VERSION 4.30.0" || { echo "  ✗ VERSION"; fail=1; }
grep -q "PROJECT_FORMAT = 5," "$APP" && echo "  ✓ Projektformat 5" || { echo "  ✗ Format"; fail=1; }
for t in g10-01-hoermuschel.mjs g10-02-erster-durchgang.mjs g10-03-pegel.mjs g10-04-wort-ende.mjs g10-05-anlauf.mjs regel28.mjs; do run "$t"; done
echo; echo "######## Rauchtests (bau/tests)"; ./rauch.sh || fail=1
echo; [ $fail = 0 ] && echo "ALLES GRÜN" || echo "ES GIBT ROT"
exit $fail
