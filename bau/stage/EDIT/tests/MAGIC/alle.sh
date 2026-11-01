#!/bin/sh
# alle MAGIC-Tests + Rauchtest (bau/tests/smoke.mjs) – Aufruf: sh bau/helfer/MAGIC/tests/alle.sh
D=$(cd "$(dirname "$0")" && pwd); R=$(cd "$D/../../../.." && pwd); T=${TMPDIR:-/tmp}/ms-run; mkdir -p "$T"
ln -sfn "$(dirname "$(dirname "$(node -e "console.log(require.resolve('playwright'))")")")" "$T/node_modules"
cp "$R/bau/tests/smoke.mjs" "$T/"; F=0
(cd "$T" && node smoke.mjs "$D/../index.html" "$T/smoke.png") | tee "$T/smoke.txt"; grep -q 'errors \[\]' "$T/smoke.txt" || F=1
for t in ms-funktion ms-layout ms-regress; do echo "## $t"; node "$D/$t.mjs" || F=1; done
[ $F = 0 ] && echo "== MAGIC: alles grün" || { echo "== MAGIC: FEHLER"; exit 1; }
