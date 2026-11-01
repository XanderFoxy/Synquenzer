#!/bin/sh
# Stage VIDEO 4.28.0: die Tests aller 5 Pakete gegen bau/stage/VIDEO/index.html. Aufruf: sh bau/stage/VIDEO/tests/alle.sh [paket …]
cd "$(dirname "$0")"; T=$(pwd); export APP="$(cd .. && pwd)/index.html"
for P in ${*:-VV4A VV4CE VV4BD VV4F VVLOGO}; do
  echo "######## $P $(date +%T)"
  case $P in
    VV4A) cd $T/VV4A && sh run-all.sh perf ;;
    VV4CE) cd $T/VV4CE && for t in vv4ce-abn.mjs vv4ce-mk.mjs vv4ce-ui.mjs; do node $t > out-$t.log 2>&1; echo "rc $t: $? $(tail -1 out-$t.log)"; done ;;
    VV4BD) cd $T/VV4BD && for t in vv4-regie.mjs vv4-menue.mjs vv4-layout.mjs vv4-bild.mjs; do node $t > out-$t.log 2>&1; echo "rc $t: $? $(tail -1 out-$t.log)"; done ;;
    VV4F) cd $T/VV4F && sh alle.sh 2>&1 | tail -40 ;;
    VVLOGO) cd $T/VVLOGO && bash alle.sh 2>&1 | tail -60 ;;
  esac
done
