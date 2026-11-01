#!/bin/sh
# V6A-Tests gegen die zusammengeführte Datei bau/stage/B2/index.html. Aufruf: sh bau/stage/B2/tests/V6A/alle.sh
cd "$(dirname "$0")/../../../../.." || exit 1
APP=$PWD/bau/stage/B2/index.html; OUT=${V6A_TMP:-/tmp/b2-v6a}; mkdir -p "$OUT"; fail=0
for t in regeln regel28 rampe modi klick live-offline export matrix engines daten ui k1 paritaet cpu; do
  printf '%-14s ' "$t"; if node bau/stage/B2/tests/V6A/v6a-$t.mjs > "$OUT/v6a-$t.log" 2>&1; then echo grün; else echo "ROT  (siehe $OUT/v6a-$t.log)"; fail=1; fi
done
exit $fail
