#!/bin/sh
# Stufe B1 (in B2): alle Testsätze (T1, SX11, N8I134, B1-Zusammenspiel) + Rauchtests aus bau/tests gegen ../index.html
# Aufruf: sh bau/stage/B2/tests/B1/alle.sh   (aus jedem Ordner)
T="$(cd "$(dirname "$0")" && pwd)"
APP="$(cd "$T/../.." && pwd)/index.html"
ROOT="$(cd "$T/../../../../.." && pwd)"
OLD="$ROOT/bau/snapshots/R-4300.html"
OUT="${B1_OUT:-$(mktemp -d)}"; mkdir -p "$OUT"
cd "$ROOT" || exit 1
# playwright/acorn: ESM-Importe suchen node_modules neben den Dateien – vorübergehend auf die globalen Module zeigen
LINK=""
if [ ! -e "$ROOT/node_modules" ]; then G="$(npm root -g)"; [ -d "$G/playwright" ] && ln -s "$G" "$ROOT/node_modules" && LINK=1; fi
export NODE_PATH="$(npm root -g):/opt/node-tools/node_modules"
fail=0
lauf() {   # Name, Befehl … → letzte Zeile + Status
  name="$1"; shift
  "$@" > "$OUT/$name.log" 2>&1; rc=$?
  [ $rc -eq 0 ] || fail=1
  printf '%-22s rc=%s  %s\n' "$name" "$rc" "$(grep -v '^\s*$' "$OUT/$name.log" | tail -1 | cut -c1-140)"
}
echo "App: $APP   Logs: $OUT"
# T1 Taktarten
lauf t1-taktarten  node "$T/t1/t1-taktarten.mjs" "$APP" "$OUT/t1-tempo.png"
lauf t1-bitgleich  node "$T/t1/t1-bitgleich.mjs" "$OLD" "$APP"
lauf t1-layout     node "$T/t1/t1-layout.mjs" "$APP" "$OUT"
# SX11 leicht/voll
for t in sx-fassung sx-live sx-kon sx-layout; do lauf "$t" env SX_APP="$APP" SX_OUT="$OUT" node "$T/sx11/$t.mjs"; done
# N8I134 Super-Regler-Kern, Mal-LFO, Tipp-Summen
lauf i1f-math-node node "$T/n8/i1f-math-node.mjs"
lauf i1f-neigen    env I1F_APP=index.html node "$T/n8/i1f-neigen.mjs"
lauf i3-korpus     node "$T/n8/i3-korpus.mjs"
lauf i3c-ui        env SHOTS="$OUT" node "$T/n8/i3c-ui.mjs" "$APP"
lauf i4c-tapnotes  node "$T/n8/i4c-tapnotes.mjs" "$APP"
lauf n8-core       node "$T/n8/n8-core.mjs" "$APP"
lauf n8-layout     node "$T/n8/n8-layout.mjs" "$APP"
lauf n8-regel28    node "$T/n8/n8-regel28.mjs" "$APP"
# B1: Zusammenspiel + Regeln + Syntax
lauf b1-regeln     node "$T/b1/b1-regeln.mjs" "$APP"
lauf b1-zusammen   node "$T/b1/b1-zusammen.mjs" "$APP"
lauf b1-lfoleiste  node "$T/b1/b1-lfoleiste.mjs" "$APP" "$OUT"
lauf b1-shots      node "$T/b1/b1-shots.mjs" "$APP" "${B1_SHOTS:-$OUT}"
# Rauchtests
for t in smoke v3-mk8-smoke v3-mk8b-smoke v3-qa-mk5reg-smoke orch-mk-check; do lauf "$t" node "bau/tests/$t.mjs" "$APP" "$OUT/$t.png"; done
[ -n "$LINK" ] && rm -f "$ROOT/node_modules"
echo "fail=$fail"
exit $fail
