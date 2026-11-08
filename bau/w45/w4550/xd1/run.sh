#!/bin/bash
# XD1: Paket-Tests nacheinander (je mit timeout); Aufruf: run.sh <lauf> <tests…>   Ausgabe: xd1/out/<lauf>/<test>.log
S=/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad
W=$S/w4550; X=$W/xd1; L=$1; shift
O=$X/out/$L; mkdir -p $O
cp $X/index.html $W/t/x/index.html
T() { [ -f $X/tests/$1 ] && echo $X/tests/$1 || echo $2; }   # angepasste Kopie (begründet in NOTES) vor dem Original
run() { n=$1; t=$2; f=$3; shift 3; mkdir -p $O/$n; local t0=$(date +%s); timeout 2700 node $t $f $O/$n "$@" > $O/$n.log 2>&1; rc=$?; echo "$n rc=$rc OK=$(grep -cE '^OK' $O/$n.log) FEHLER=$(grep -cE '^(FEHLER|FAIL)' $O/$n.log) t=$(($(date +%s)-t0))s | $(basename $t) | $(tail -1 $O/$n.log | cut -c1-160)" | tee -a $O/summary.txt; }
for x in "$@"; do case $x in
 xd1) run xd1 $X/xd1-test.mjs $X/index.html $W/basis.html;;
 vox2) run vox2 $(T vox2-test.mjs $S/w4500/vox2/vox2-test.mjs) $W/t/x/index.html;;
 vd4) run vd4 $(T vd4-test.mjs $S/w4491/vd4/vd4-test.mjs) $W/t/x/index.html;;
 vid5) run vid5 $(T vid5-test.mjs $S/w4500/vid5/vid5-test.mjs) $W/t/x/index.html $S/w4500/basis.html;;
 mtx) run mtx $(T mtx-test.mjs $S/w4500/mtx/mtx-test.mjs) $W/t/x/index.html;;
 mixg) run mixg $(T mixg-test.mjs $S/rel-4530/fix/tests/mixg-test.mjs) $W/t/x/index.html;;
 ori) run ori $(T ori-test.mjs $S/w4500/ori/ori-test.mjs) $X/index.html $W/basis.html;;
 int53c) run int53c $(T int53c-test.mjs $S/rel-4530/m3/int53c-test.mjs) $X/index.html;;
 int53d) run int53d $(T int53d-test.mjs $S/rel-4530/m3/int53d-test.mjs) $X/index.html;;
 smoke) node $S/dirigent-test/smoke.mjs $X/index.html $O/smoke.png > $O/smoke.log 2>&1; echo "smoke rc=$? $(tail -1 $O/smoke.log)" | tee -a $O/summary.txt;;
 pflicht) (NODE_PATH=/opt/node-tools/node_modules timeout 600 node $S/rel-4271/tools/topdefs.cjs $X/index.html; NODE_PATH=/opt/node-tools/node_modules timeout 600 node $S/tools2/dupkeys.cjs $X/index.html) > $O/pflicht.log 2>&1; echo "pflicht $(tr '\n' ' ' < $O/pflicht.log | cut -c1-200)" | tee -a $O/summary.txt;;
esac; done
echo ALLDONE >> $O/summary.txt
