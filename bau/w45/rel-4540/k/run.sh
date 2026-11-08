#!/bin/bash
# Läufer 4.54.0-Kandidat (rel-4540/k): alle Tests nacheinander gegen k/index.html, je mit timeout.
# Aufruf: bash run.sh <name …> | all | paket | suite      Ausgaben: k/out/<test>/ und k/out/<test>.log, Übersicht k/out/summary.txt
# Kopien (vor jedem Lauf frisch aus k/index.html):
#   t-52/x/index.html + t-52/basis.html = 4.52.0 (w4530/basis.html)  → jam3, chq, beg1 (../basis.html = Paket-Basis), gl1 (wie fz-g in 4.53)
#   t-53/x/index.html + t-53/basis.html = 4.53-Kandidat (basis53.html) → Gegenprobe jam3-53, chq-53, beg1-53: Bildvergleiche gegen 4.53 statt 4.52
#   t-p/x/index.html  + t-p/basis.html  = w4500/basis.html          → gen4, vox2, mixg, mtx, snd1, int53, int53p (wie fz-p/t-p in 4.53)
#   t-j/x/index.html  + t-j/basis.html  = w4510/basis.html          → jam1, jam2 (wie fz-j)
#   t-v/x/index.html  + t-v/basis.html  = w4500/basis.html          → vd4 (wie fz-v)
#   out/basis.html = 4.51.0 (w4520/basis.html) → kf2, kf1 (<ordner>/../basis.html = KF12-Basis); out/kf2/NOTES.md = kf12/NOTES.md (wie beim KF12-Lauf)
#   t-kf/kf12/index.html + t-kf/kf2/index.html (= w4520/kf2) → kf1 (liest <index>/../../kf2/index.html für die Zeilen-Herkunft)
#   t-jx/x53/index.html = 4.53-Kandidat + t-jx/basis.html = w4510/basis → jam2-453 (Gegenlauf: dieselbe JAM2-Prüfung auf dem 4.53-Kandidaten); jam2b = 2. Lauf
#   out/b53/basis.html = 4.53-Kandidat → kf1-53 (Gegenprobe: Render/Werksklänge gegen 4.53 statt 4.51); kombi-53 bekommt basis53 als Argument
S=/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad
K=$S/rel-4540/k; F=$K/index.html; O=${OUT:-$K/out}; mkdir -p $O
for d in t-52 t-53 t-p t-j t-v; do mkdir -p $K/$d/x; cp $F $K/$d/x/index.html; done
cp $S/w4530/basis.html $K/t-52/basis.html; cp $K/basis53.html $K/t-53/basis.html; cp $S/w4500/basis.html $K/t-p/basis.html; cp $S/w4510/basis.html $K/t-j/basis.html; cp $S/w4500/basis.html $K/t-v/basis.html
cp $S/w4520/basis.html $O/basis.html; mkdir -p $O/kf2; cp $S/w4520/kf12/NOTES.md $O/kf2/NOTES.md
mkdir -p $K/t-kf/kf12 $K/t-kf/kf2 $O/b53; cp $F $K/t-kf/kf12/index.html; cp $S/w4520/kf2/index.html $K/t-kf/kf2/index.html; cp $K/basis53.html $O/b53/basis.html
run() { n=$1; shift; mkdir -p $O/$n; local t0=$(date +%s); timeout ${T:-2700} "$@" > $O/$n.log 2>&1; rc=$?
  echo "$n rc=$rc OK=$(grep -c '^OK' $O/$n.log) FEHLER=$(grep -cE '^(FEHLER|FAIL)' $O/$n.log) t=$(($(date +%s)-t0))s | $(grep -v '^\s*$' $O/$n.log | tail -1 | cut -c1-200)" | tee -a $O/summary.txt; }
L="$*"; [ "$L" = all ] && L="pflicht herkunft smoke int54 jam3 chq beg1 kf2 kf1 kombi gen4 vox2 mixg mtx snd1 jam1 jam2 gl1 vd4 ori vid5 int53 int53p int53c jam3-53 chq-53 beg1-53 kf1-53 kombi-53 jam2-453"
[ "$L" = paket ] && L="jam3 chq beg1 kf2 kf1 kombi"
[ "$L" = suite ] && L="gen4 vox2 mixg mtx snd1 jam1 jam2 gl1 vd4 ori vid5 int53 int53p int53c"
echo "== Lauf $(date +%F_%T) md5 $(md5sum < $F | cut -c1-32): $L" >> $O/summary.txt
for x in $L; do case $x in
 pflicht) NODE_PATH=/opt/node-tools/node_modules node $S/rel-4271/tools/topdefs.cjs $F > $O/topdefs.log 2>&1; NODE_PATH=/opt/node-tools/node_modules node $S/tools2/dupkeys.cjs $F > $O/dupkeys.log 2>&1
   python3 $K/tools/pflicht.py $F $K/basis53.html > $O/pflicht.log 2>&1
   echo "pflicht | $(tail -1 $O/topdefs.log) | $(tail -1 $O/dupkeys.log) | $(tail -1 $O/pflicht.log)" | tee -a $O/summary.txt;;
 herkunft) python3 $K/tools/herkunft.py > $O/herkunft.log 2>&1; echo "herkunft | $(tail -1 $O/herkunft.log)" | tee -a $O/summary.txt;;
 smoke) node $S/dirigent-test/smoke.mjs $F $O/smoke.png > $O/smoke.log 2>&1; echo "smoke rc=$? | $(tail -1 $O/smoke.log | cut -c1-200)" | tee -a $O/summary.txt;;
 jam3) run jam3 node $S/w4530/jam3/jam3-test.mjs $K/t-52/x/index.html $O/jam3;;
 chq) run chq node $S/w4530/chq/chq-test.mjs $K/t-52/x/index.html $O/chq;;
 beg1) run beg1 node $S/w4540/beg1/beg1-test.mjs $K/t-52/x/index.html $O/beg1;;
 jam3-53) run jam3-53 node $S/w4530/jam3/jam3-test.mjs $K/t-53/x/index.html $O/jam3-53;;
 chq-53) run chq-53 node $S/w4530/chq/chq-test.mjs $K/t-53/x/index.html $O/chq-53;;
 beg1-53) run beg1-53 node $S/w4540/beg1/beg1-test.mjs $K/t-53/x/index.html $O/beg1-53;;
 int54) run int54 node $K/int54-test.mjs $F $O/int54 $K/merge/step4.html;;
 kf2) run kf2 node $S/w4520/kf2/kf2-test.mjs $F $O/kf2;;
 kf1) run kf1 node $S/w4520/kf12/kf1-test-kf12.mjs $K/t-kf/kf12/index.html $O/kf1;;
 kf1-53) run kf1-53 node $S/w4520/kf12/kf1-test-kf12.mjs $K/t-kf/kf12/index.html $O/b53/kf1;;
 kombi-53) run kombi-53 node $S/w4520/kf12/kombi.mjs $F $O/kombi-53 $K/basis53.html;;
 kombi) run kombi node $S/w4520/kf12/kombi.mjs $F $O/kombi;;
 gen4) run gen4 node $S/w4500/gen4/gen4-test.mjs $K/t-p/x/index.html $O/gen4;;
 vox2) run vox2 node $S/w4500/vox2/vox2-test.mjs $K/t-p/x/index.html $O/vox2;;
 mixg) run mixg node $S/rel-4530/fix/tests/mixg-test.mjs $K/t-p/x/index.html $O/mixg;;
 mtx) run mtx node $S/w4500/mtx/mtx-test.mjs $K/t-p/x/index.html $O/mtx;;
 snd1) run snd1 node $S/rel-4530/fix/tests/snd1-test.mjs $K/t-p/x/index.html $O/snd1;;
 int53) run int53 node $S/rel-4530/fix/tests/int53-test.mjs $K/t-p/x/index.html $O/int53;;
 int53p) run int53p node $S/rel-4530/fix/tests/int53p-test.mjs $K/t-p/x/index.html $O/int53p;;
 jam1) run jam1 node $S/w4510/jam1/jam1-test.mjs $K/t-j/x/index.html $O/jam1;;
 jam2) run jam2 node $S/w4510/jam2/jam2-test.mjs $K/t-j/x/index.html $O/jam2;;
 jam2b) run jam2b node $S/w4510/jam2/jam2-test.mjs $K/t-j/x/index.html $O/jam2b;;
 jam2-453) mkdir -p $K/t-jx/x53; cp $K/basis53.html $K/t-jx/x53/index.html; cp $S/w4510/basis.html $K/t-jx/basis.html; run jam2-453 node $S/w4510/jam2/jam2-test.mjs $K/t-jx/x53/index.html $O/jam2-453;;
 gl1) run gl1 node $S/w4492/gl1/gl1-test.mjs $K/t-52/x/index.html $O/gl1;;
 vd4) run vd4 node $S/w4491/vd4/vd4-test.mjs $K/t-v/x/index.html $O/vd4;;
 ori) run ori node $S/w4500/ori/ori-test.mjs $F $O/ori $S/rel-4530/m3/vor-ori-vid5.html;;
 vid5) run vid5 node $S/w4500/vid5/vid5-test.mjs $F $O/vid5 $S/w4500/basis.html;;
 int53c) run int53c node $S/rel-4530/m3/int53c-test.mjs $F $O/int53c;;
 *) echo "unbekannt: $x";;
esac; done
echo "== fertig $(date +%T)" >> $O/summary.txt
