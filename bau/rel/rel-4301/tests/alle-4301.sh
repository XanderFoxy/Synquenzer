#!/bin/sh
# 4.30.1: alle Testsätze gegen rel-4301/index.html, nacheinander (Video-Läufe unter Last streuen). Zusammenfassung in $O/zusammen.txt
D=$(cd "$(dirname "$0")" && pwd); R=$(cd "$D/.." && pwd); S=$(cd "$R/.." && pwd); A=$R/index.html; OLD=$S/synq-snapshots/R-4300.html
O=${O:-$D/out}; mkdir -p "$O"; export NODE_PATH=${NODE_PATH:-/opt/node-tools/node_modules}; Z=$O/zusammen.txt; : > "$Z"
t() { n=$1; d=$2; shift 2; s=$(date +%s); (cd "$d" && timeout 298 "$@") > "$O/$n.txt" 2>&1; rc=$?; echo "== $n rc=$rc $(( $(date +%s)-s ))s | $(grep -v '^\s*$' "$O/$n.txt" | tail -1 | cut -c1-170)" | tee -a "$Z"; }
P=${*:-"blatt logo regress stage edit north pipe"}
for x in $P; do case $x in
 blatt) t blatt "$D" node blatt.mjs "$A" ;;
 logo) O=$O "$D/logo-alle.sh" | tee -a "$Z" ;;
 regress) t logo-aus-regress "$D" node logo-aus-regress.mjs "$A" "$OLD" ;;
 stage) O=$R/sim/out "$R/sim/run-stage.sh" 2>&1 | tee -a "$Z" ;;
 edit) (cd "$R/tests-edit" && APP=$A ALT=$OLD WANTV=4.30.1 ALTV=4.30.0 O=$R/tests-edit/out sh alle.sh) 2>&1 | tail -20 | tee -a "$Z" ;;
 north) t north-smoke "$R/tests-north" node smoke.mjs "$A" "$O/north-smoke.png"; t north-vv4-e2e-wc "$R/tests-north" node north-vv4-e2e.mjs "$A" wc; t north-vv4-e2e-mr "$R/tests-north" node north-vv4-e2e.mjs "$A" mr ;;
 pipe) t ggb-h "$S/ggb427/tests" env APP=$A node ggb-h-zusammenspiel.mjs
       t g9b-smoke "$S/rel-4271/pruef/tests" env APP=$A WANTV=4.30.1 WANTC=4030001 node smoke.mjs
       t pipe-smoke "$S/dirigent-test" node smoke.mjs "$A" "$O/haupt-smoke.png"
       t pipe-orch "$S/dirigent-test" node orch-mk-check.mjs "$A"
       t pipe-mk2 "$S/dirigent-test" node v3-mk2-wellen.mjs "$A"
       t acorn "$S/rel-4271/tools" node topdefs.cjs "$A" ;;
esac; done
echo "fertig $(date +%T)" | tee -a "$Z"
