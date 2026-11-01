#!/usr/bin/env bash
# PERC – alle Tests: Perkussionsspur, North-Regression, CPU, Bildschirmfotos, Rauchtests (bau/tests)
# Aufruf aus beliebigem Ordner: bash bau/helfer/PERC/tests/alle.sh
set -u
T="$(cd "$(dirname "$0")" && pwd)"; P="$(cd "$T/.." && pwd)"; ROOT="$(cd "$P/../../.." && pwd)"
APP="$P/index.html"; BASE="$ROOT/bau/snapshots/R-4300.html"
# Playwright ist global installiert; ESM-Importe brauchen ein node_modules in der Nähe (nicht eingecheckt)
[ -e "$T/node_modules" ] || ln -s "$(npm root -g)" "$T/node_modules"
[ -e "$ROOT/node_modules" ] || ln -s "$(npm root -g)" "$ROOT/node_modules"
fail=0
run() { echo "== $1"; shift; if "$@"; then echo "   GRÜN"; else echo "   ROT"; fail=$((fail+1)); fi; }
run "perc (Funktion)"        node "$T/perc.mjs" "$APP" "$BASE"
run "north-regress"          node "$T/north-regress.mjs" "$APP" "$BASE"
run "cpu"                    node "$T/cpu.mjs" "$APP"
run "bilder 428×926 926×428 428×650" node "$T/bilder.mjs" "$APP"
for s in smoke v3-mk8-smoke v3-mk8b-smoke v3-qa-mk5reg-smoke; do
  run "bau/tests/$s" bash -c "out=\$(node '$ROOT/bau/tests/$s.mjs' '$APP' '/tmp/perc-$s.png' 2>&1 | tail -1); echo \"   \$out\"; echo \"\$out\" | grep -q 'errors \[\]'"
done
# Regeln der Datei
c() { grep -c "$1" "$APP"; }
[ "$(c '  live: true,')" = 1 ] || { echo "Regel: live: true ≠ 1×"; fail=$((fail+1)); }
[ "$(c 'MS 2000')" = 1 ] || { echo "Regel: MS 2000 ≠ 1×"; fail=$((fail+1)); }
for w in Korg microKORG RADIAS DWGS Kodamo Mask1 Nord Kompakt Clavia; do [ "$(c "$w")" = 0 ] || { echo "Regel: verbotenes Wort $w"; fail=$((fail+1)); }; done
grep -q "const VERSION = '4.30.0';" "$APP" || { echo "Regel: VERSION"; fail=$((fail+1)); }
echo "== Regeln geprüft"
echo "FEHLER: $fail"; exit $fail
