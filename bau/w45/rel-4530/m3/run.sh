#!/bin/bash
S=/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad
R=$S/rel-4530; L=$1; shift
O=$R/m3/out2/$L; mkdir -p $O
run() { n=$1; t=$2; f=$3; shift 3; mkdir -p $O/$n; local t0=$(date +%s); timeout 2700 node $t $f $O/$n "$@" > $O/$n.log 2>&1; rc=$?; echo "$n rc=$rc OK=$(grep -c '^OK' $O/$n.log) FEHLER=$(grep -cE '^(FEHLER|FAIL)' $O/$n.log) t=$(($(date +%s)-t0))s | $(tail -1 $O/$n.log | cut -c1-200)" | tee -a $O/summary.txt; }
for x in "$@"; do case $x in
 gen4) run gen4 $S/w4500/gen4/gen4-test.mjs $R/fz-p/x/index.html;;
 vox2) run vox2 $S/w4500/vox2/vox2-test.mjs $R/fz-p/x/index.html;;
 mixg) run mixg $R/fix/tests/mixg-test.mjs $R/fz-p/x/index.html;;
 mtx) run mtx $S/w4500/mtx/mtx-test.mjs $R/fz-p/x/index.html;;
 snd1) run snd1 $R/fix/tests/snd1-test.mjs $R/fz-p/x/index.html;;
 int53) run int53 $R/fix/tests/int53-test.mjs $R/fz-p/x/index.html;;
 int53p) run int53p $R/fix/tests/int53p-test.mjs $R/fz-p/x/index.html;;
 ori) run ori $S/w4500/ori/ori-test.mjs $R/fz-p/x/index.html $S/w4500/basis.html;;
 vid5) run vid5 $S/w4500/vid5/vid5-test.mjs $R/fz-v/x/index.html $S/w4500/basis.html;;
 jam1) run jam1 $S/w4510/jam1/jam1-test.mjs $R/fz-j/x/index.html;;
 jam2) run jam2 $S/w4510/jam2/jam2-test.mjs $R/fz-j/x/index.html;;
 gl1) run gl1 $S/w4492/gl1/gl1-test.mjs $R/fz-g/x/index.html;;
 vd4) run vd4 $S/w4491/vd4/vd4-test.mjs $R/fz-v/x/index.html;;
 smoke) node $S/dirigent-test/smoke.mjs $R/fz-p/x/index.html $O/smoke.png > $O/smoke.log 2>&1; echo "smoke rc=$? $(tail -1 $O/smoke.log)" | tee -a $O/summary.txt;;
esac; done
echo ALLDONE >> $O/summary.txt
