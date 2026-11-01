#!/bin/sh
# DOPPEL: eigene Tests + alte Tests N1 / PINSEL (angepasst, siehe CHANGES.md) + Rauchtests.
# Playwright aus /opt/node22/lib/node_modules (bau/node_modules wird bei Bedarf dorthin verlinkt).
cd "$(dirname "$0")" || exit 1
HERE="$(pwd)"; APPF="$(cd .. && pwd)/index.html"; T="$(cd ../../../tests && pwd)"; TMP="${TMPDIR:-/tmp}"
[ -e ../../../node_modules ] || ln -s /opt/node22/lib/node_modules ../../../node_modules
rc=0
run() { echo "== $*"; "$@" || { echo "!! FEHLER: $*"; rc=1; }; }
run node t-doppel.mjs
run node t-gleich.mjs
run node t-bilder.mjs
cd "$HERE/alt-n1" && { run node n1-abnahme.mjs; run node n1-hit.mjs; }
cd "$HERE/alt-pinsel" && for t in t-pinsel t-bloecke t-mithoeren t-layout t-alt; do run node $t.mjs; done
cd "$T" || exit 1
# Rauchtests geben nur „errors […]“ aus: grün nur bei „errors []“
for s in smoke v3-mk8-smoke v3-mk8b-smoke v3-qa-mk5reg-smoke; do echo "== $s"; o=$(node $s.mjs "$APPF" "$TMP/doppel-$s.png" 2>&1); echo "$o"; echo "$o" | grep -q 'errors \[\]' || { echo "!! FEHLER: $s"; rc=1; }; done
echo "== Ergebnis: $([ $rc = 0 ] && echo alles grün || echo FEHLER)"
exit $rc
