#!/bin/sh
# PINSEL: alle eigenen Tests + Rauchtest (Playwright aus /opt/node22/lib/node_modules; bau/node_modules → dorthin verlinken)
cd "$(dirname "$0")" || exit 1
rc=0
for t in t-pinsel t-bloecke t-mithoeren t-layout t-alt; do echo "== $t"; node $t.mjs || rc=1; done
echo "== Rauchtest"; node ../../../tests/smoke.mjs "$(cd .. && pwd)/index.html" "${TMPDIR:-/tmp}/pinsel-smoke.png" || rc=1
exit $rc
