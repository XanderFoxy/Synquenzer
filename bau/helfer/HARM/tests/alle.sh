#!/usr/bin/env bash
# HARM: alle Tests. Aufruf: tests/alle.sh [--ohne-regression]
# 1) Regeln (Text-Prüfungen der index.html)  2) HARM-T1 … T5  3) Regressions-Vergleich über die Snapshots (dauert ≈ 6 min)
# 4) vorhandene Rauch- und Harmonie-Tests aus bau/tests (bestand.sh), gegen HARM und zum Vergleich gegen R-4300
set -u
HERE=$(cd "$(dirname "$0")" && pwd); APP="$HERE/../index.html"; ROOT=$(cd "$HERE/../../../.." && pwd)
OUT="${HARM_OUT:-$(mktemp -d)}"; mkdir -p "$OUT"; rc=0
echo "== Regeln"
n=$(grep -o "  live: true," "$APP" | wc -l); [ "$n" = 1 ] && echo "PASS genau 1× '  live: true,'" || { echo "FAIL live: true ($n)"; rc=1; }
for w in Korg microKORG RADIAS DWGS Kodamo Mask1 Nord Kompakt; do c=$(grep -o "$w" "$APP" | wc -l); [ "$c" = 0 ] || { echo "FAIL verbotenes Wort $w: $c"; rc=1; }; done; echo "PASS verbotene Wörter = 0"
c=$(grep -o "MS 2000" "$APP" | wc -l); [ "$c" = 1 ] && echo "PASS 'MS 2000' genau 1×" || { echo "FAIL MS 2000: $c"; rc=1; }
grep -q "const VERSION = '4.30.0'" "$APP" && echo "PASS VERSION 4.30.0" || { echo "FAIL VERSION"; rc=1; }
grep -q "PROJECT_FORMAT = 5," "$APP" && echo "PASS Format 5" || { echo "FAIL Format"; rc=1; }
d=$(diff "$ROOT/bau/snapshots/R-4300.html" "$APP" | grep '^>' | grep -ciE "fetch\(|XMLHttpRequest|indexedDB\.open|WebSocket|supabase"); [ "$d" = 0 ] && echo "PASS keine neuen Netz-/Datenbank-Zugriffe" || { echo "FAIL Netz/DB in neuen Zeilen: $d"; rc=1; }
echo "== HARM-Tests"
for t in t-laeufe t-wechsel t-umstellung t-drums t-bezug; do
  node "$HERE/$t.mjs" "$APP" > "$OUT/$t.txt" 2>&1 || rc=1; tail -1 "$OUT/$t.txt"; grep '^FAIL' "$OUT/$t.txt" | cut -c1-200
done
if [ "${1:-}" != "--ohne-regression" ]; then
  echo "== Regression über die Snapshots (+ HARM)"; node "$HERE/regression.mjs" > "$OUT/regression.md" 2>&1 || rc=1; cat "$OUT/regression.md"
fi
echo "== vorhandene Tests (bau/tests) gegen HARM"; "$HERE/bestand.sh" "$APP" "$OUT/bestand-harm" || rc=1
echo "== dieselben gegen R-4300 (Vergleich)"; "$HERE/bestand.sh" "$ROOT/bau/snapshots/R-4300.html" "$OUT/bestand-4300" || true
echo "Ausgaben: $OUT"; exit $rc
