#!/bin/sh
# EDIT 4.29.0: Tests aller drei Pakete gegen bau/stage/EDIT/index.html + Zusammenspiel + Rauchtests
# Playwright: bau/node_modules → Playwright-Ordner verlinken (ln -s /opt/node-tools/node_modules bau/node_modules)
D=$(cd "$(dirname "$0")" && pwd); R=$(cd "$D/../../../.." && pwd); F="$R/bau/stage/EDIT/index.html"; T=${TMPDIR:-/tmp}/edit-run; mkdir -p "$T"; rc=0
for t in kon-block kon-konsol kon-save kon-layout; do node "$D/KON/$t.mjs" | tail -1 || rc=1; done
for t in ms-funktion ms-layout ms-regress; do echo "## $t"; node "$D/MAGIC/$t.mjs" | tail -1 || rc=1; done
for t in t-pinsel t-bloecke t-mithoeren t-layout t-alt; do echo "## $t"; (cd "$D/PINSEL" && SHOTS="$T" node $t.mjs | tail -2) || rc=1; done
SHOTS="$D/shots" node "$D/zusammen.mjs" | tail -1 || rc=1
cd "$R/bau/tests" && for t in smoke v3-mk8-smoke v3-mk8b-smoke v3-qa-mk5reg-smoke; do echo "$t: $(node $t.mjs "$F" "$T/s.png" | tail -1)"; done
echo "orch-mk-check: $(node orch-mk-check.mjs "$F" | tail -1)"; echo "v3-mk2-wellen: $(node v3-mk2-wellen.mjs "$F" | tail -1)"
exit $rc
