#!/usr/bin/env bash
# HARM: vorhandene Tests aus bau/tests gegen eine App-Datei laufen lassen (Kopie in einen Temp-Ordner; die fest eingetragenen
# Pfade alter Sitzungen werden auf diese Datei / R-4300 / Temp umgebogen; node_modules = globale Installation)
# Aufruf: bestand.sh <app.html> <ausgabe-ordner> [nur-diese-Tests, z. B. "v3-qa-gp2a-os"]
set -u
APPF=$(readlink -f "$1"); OUTD=$(mkdir -p "$2" && readlink -f "$2")
HERE=$(cd "$(dirname "$0")" && pwd); ROOT=$(cd "$HERE/../../../.." && pwd)
W=$(mktemp -d); mkdir -p "$W/out"
ln -s "$(npm root -g)" "$W/node_modules"
cp "$ROOT"/bau/tests/{smoke.mjs,v3-mk8-smoke.mjs,v3-mk8b-smoke.mjs,v3-qa-mk5reg-smoke.mjs,v3-v2c2-onescale.mjs,v3-v2d-pw.mjs,v3-v2d-lib.mjs,v3-qa-v2c2reg-os.mjs,v3-qa-gp2a-os.mjs,v3-qa-gp2a-lib.mjs,v3-qa-grp-lib.mjs} "$W/"
OLDP=/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad
for f in "$W"/*.mjs; do
  sed -i -e "s#$OLDP/dirigent-wt/index.html#$APPF#g" -e "s#$OLDP/synq-snapshots/VS2b-fix.html#$ROOT/bau/snapshots/R-4300.html#g" \
         -e "s#$OLDP/dirigent-test/#$W/out/#g" "$f"
done
cd "$W"
rc=0
ONLY="${3:-}"
for t in smoke v3-mk8-smoke v3-mk8b-smoke v3-qa-mk5reg-smoke; do
  [ -n "$ONLY" ] && [[ " $ONLY " != *" $t "* ]] && continue
  node $t.mjs "$APPF" "$OUTD/$t.png" > "$OUTD/$t.txt" 2>&1; e=$?
  grep -q 'errors \[\]' "$OUTD/$t.txt" && [ $e -eq 0 ] && echo "PASS $t" || { echo "FAIL $t"; rc=1; }
done
for t in v3-v2c2-onescale v3-qa-v2c2reg-os v3-qa-gp2a-os; do
  [ -n "$ONLY" ] && [[ " $ONLY " != *" $t "* ]] && continue
  SYNQ_APP="$APPF" timeout 600 node $t.mjs > "$OUTD/$t.txt" 2>&1; e=$?
  echo "$( [ $e -eq 0 ] && echo PASS || echo FAIL ) $t · $(grep -cE '^PASS' "$OUTD/$t.txt") PASS / $(grep -cE '^FAIL' "$OUTD/$t.txt") FAIL"
done
rm -rf "$W"; exit $rc
