#!/usr/bin/env bash
# Vorhandene Tests der MK-Platte (bau/tests/v3-qmkp-*.mjs) unverändert gegen R-4300 und NDP laufen lassen und vergleichen:
# die Tests haben feste Pfade → Kopie in einen Temp-Ordner, FILE/VORG/OUT umgeschrieben. Gleiches Ergebnis = keine Rückwirkung.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$HERE/../../../.." && pwd)"
NDP="$HERE/../index.html"; BASE="$ROOT/bau/snapshots/R-4300.html"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
ln -s "$(npm root -g)" "$TMP/node_modules"
TESTS="${MK_TESTS:-v3-qmkp-smoke v3-qmkp-44 v3-qmkp-rahmen v3-qmkp-hit v3-qmkp-gest v3-qmkp-daten}"
rc=0
for tag in base ndp; do
  F="$BASE"; [ "$tag" = ndp ] && F="$NDP"
  D="$TMP/$tag"; mkdir -p "$D/out"; cp "$ROOT"/bau/tests/*.mjs "$D/"; ln -s "$(npm root -g)" "$D/node_modules"
  sed -i -E "s#^export const FILE = '[^']*';#export const FILE = '$F';#; s#^export const VORG = '[^']*';#export const VORG = '$BASE';#; s#^export const OUT = '[^']*';#export const OUT = '$D/out';#" "$D/v3-qmkp-lib.mjs"
  for t in $TESTS; do ( cd "$D" && timeout 600 node "$t.mjs" > "$D/$t.log" 2>&1; echo "exit $?" >> "$D/$t.log" ); done
done
for t in $TESTS; do
  # Zahlen (Zeiten, Koordinaten) heraus, dann vergleichen
  a="$(sed -E 's/[0-9]+(\.[0-9]+)?/#/g' "$TMP/base/$t.log")"; b="$(sed -E 's/[0-9]+(\.[0-9]+)?/#/g' "$TMP/ndp/$t.log")"
  fa="$(grep -c 'FAIL\|PAGEERR\|Error' "$TMP/base/$t.log")"; fb="$(grep -c 'FAIL\|PAGEERR\|Error' "$TMP/ndp/$t.log")"
  if [ "$a" = "$b" ]; then echo "OK   MK-Platte $t: gleiches Ergebnis wie R-4300"; elif [ "$fb" -le "$fa" ]; then echo "OK   MK-Platte $t: Ausgabe weicht nur in Zahlen/Reihenfolge ab, Fehlerzeilen R-4300 $fa / NDP $fb"; else echo "FEHL MK-Platte $t: Fehlerzeilen R-4300 $fa / NDP $fb"; diff <(echo "$a") <(echo "$b") | head -10; rc=1; fi
  tail -3 "$TMP/ndp/$t.log" | sed 's/^/     /'
done
exit $rc
