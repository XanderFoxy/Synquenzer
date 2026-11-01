#!/bin/sh
# alle UE-A/B-Tests nacheinander (aus diesem Ordner): sh alle.sh
cd "$(dirname "$0")"
for t in ue-kern ue-layout ue-schleife ue-regress ue-live; do echo "== $t"; node $t.mjs 2>&1 | grep -E "^(OK|FEHL)|ERGEBNIS"; done
for v in "428 926" "926 428" "428 650"; do set -- $v; echo "== ue-touch $1×$2"; W=$1 H=$2 node ue-touch.mjs 2>&1 | grep -E "^(OK|FEHL)|ERGEBNIS"; done
