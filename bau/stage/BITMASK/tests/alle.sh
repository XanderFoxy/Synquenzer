#!/bin/bash
# STAGE BITMASK 4.31.0: alle Tests nacheinander (Chromium/Playwright). Ergebnisse in ../ergebnisse/<name>.txt
# Aufruf: bash bau/stage/BITMASK/tests/alle.sh [muster]
D=$(cd "$(dirname "$0")" && pwd); E=$D/../ergebnisse; I=$(realpath $D/../index.html); R=$(realpath $D/../../../snapshots/R-4300.html); T=$(realpath $D/../../../tests)
export NODE_PATH=${NODE_PATH:-/opt/node-tools/node_modules}
mkdir -p $E
run() { local n=$1; shift; [ -n "$PAT" ] && [[ ! $n =~ $PAT ]] && return; echo "== $n"; (cd $(dirname $1) && timeout 2400 node "$@") > $E/$n.txt 2>&1; echo "rc=$?" >> $E/$n.txt; tail -3 $E/$n.txt | cut -c1-300; }
PAT=$1
run smoke $T/smoke.mjs $I /tmp/bm-smoke.png
run orch-mk-check $T/orch-mk-check.mjs $I
run v3-mk2-wellen $T/v3-mk2-wellen.mjs $I
run stage $D/STAGE/bm-stage.mjs $I $R 9
for t in bm1-node bm2-node bm2-modes bm2-slots bm2-review bm2-robust bm3-fx bm4-layer bm4-arp bm1-browser bm4-browser bm1-cpu bm2-cpu bm3-cpu; do run $t $D/BMK/$t.mjs; done
for t in bm6-golden bm6-store bm6-int; do run $t $D/BMU/$t.mjs $I $R; done
for f in XW XP P1 P2 P3 L1 L2; do run bm5-ui-$f $D/BM5/bm5-ui.mjs $f; done
run bm5-look $D/BM5/bm5-look.mjs; run bm5-regel $D/BM5/bm5-regel.mjs
for t in bm8-curves bm8-copy bm8-rec2 bm8-helfer bm8-review bm8-layout bm8-regel28; do run $t $D/BMC/$t.mjs; done
[ -z "$PAT" ] || [[ mk5 =~ $PAT ]] && { echo "== mk5"; bash $D/BMK/mk5/run.sh; for f in v3-mk5-arp v3-mk5-arp-audio; do diff -q $D/BMK/mk5/$f.base.txt $D/BMK/mk5/$f.neu.txt && echo "$f alt = neu"; done > $E/mk5.txt 2>&1; cat $E/mk5.txt; }
run chor3min $D/STAGE/bm-north-chor-play3min.mjs $I 180
