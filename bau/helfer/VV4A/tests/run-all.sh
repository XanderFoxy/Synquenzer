#!/bin/sh
# VV4-A: alle Tests (Playwright aus /opt/node22; Ergebnisse in tests/out/*.json). Aufruf: sh run-all.sh [perf]
cd "$(dirname "$0")"; [ -e ../node_modules ] || ln -s /opt/node22/lib/node_modules ../node_modules
ok=0; bad=0
for t in "vv4a-render.mjs webcodecs" "vv4a-render.mjs recorder" vv4a-kb-live.mjs vv4a-layout.mjs vv4a-alt.mjs vv4a-ui.mjs vv4a-layer.mjs $( [ "$1" = perf ] && echo vv4a-perf.mjs ); do
  if node $t > out/_last.txt 2>&1; then ok=$((ok+1)); else bad=$((bad+1)); fi; head -1 out/_last.txt
done
echo "Dateien grün: $ok, rot: $bad"
