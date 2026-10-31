#!/bin/bash
# Aufruf: ./run.sh <parallel> test1.mjs test2.mjs ...  → out/<name>.log, Zusammenfassung out/summary.txt
cd "$(dirname "$0")"; N=$1; shift
run1() { local f=$1 n=$(basename $1 .mjs); local d=$(dirname $1); local t0=$(date +%s); (cd $d && timeout 1500 node $(basename $f) > $OLDPWD/out/$n.log 2>&1); local rc=$?; echo "$n rc=$rc $(( $(date +%s)-t0 ))s" >> out/summary.txt; }
export -f run1
printf '%s\n' "$@" | xargs -P $N -I{} bash -c 'run1 {}'
