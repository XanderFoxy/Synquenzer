#!/bin/bash
# Stage B2: alle Testsätze aller Pakete gegen ../index.html (Playwright + Chromium). Aufruf aus jedem Ordner:
#   bash bau/stage/B2/tests/alle.sh [muster]       muster = Teil des Satznamens (z. B. V6A, B1, BITMASK, b2), leer = alles
# Logs: $B2_OUT (Vorgabe /tmp/b2-tests). Der 3-Minuten-Lauf von BITMASK und die BMK-Dauertests brauchen zusammen ≈ 1 h.
T="$(cd "$(dirname "$0")" && pwd)"; APP="$(cd "$T/.." && pwd)/index.html"; ROOT="$(cd "$T/../../../.." && pwd)"
OUT="${B2_OUT:-/tmp/b2-tests}"; mkdir -p "$OUT"; PAT="$1"; fail=0
sh "$T/umgebung.sh"                                   # node_modules-Verweise für die ES-Module (playwright, acorn)
export NODE_PATH="$T/node_modules"
satz() { local n=$1; shift; [ -n "$PAT" ] && [[ ! $n =~ $PAT ]] && return; echo "######## $n"; "$@" > "$OUT/$n.log" 2>&1; local rc=$?; [ $rc -eq 0 ] || fail=1; tail -${TAILN:-30} "$OUT/$n.log" | grep -E "grün|GRÜN|ROT|rot|FAIL|FEHL|✗|rc=|PASS|OK|ok |ERGEBNIS|errors|fail=" | cut -c1-200; echo "→ $n rc=$rc"; }
cd "$ROOT" || exit 1
LINK=""; [ -e "$ROOT/node_modules" ] || { ln -s "$T/node_modules" "$ROOT/node_modules" && LINK=1; }   # bau/tests/*.mjs laden playwright als ES-Modul
satz b2-regeln   bash "$T/B2/regeln.sh"
satz b2-takt     node "$T/B2/b2-takt.mjs" "$APP"
satz V6A         env V6A_TMP="$OUT/v6a" sh "$T/V6A/alle.sh"
satz G10A        bash "$T/G10A/alle.sh"
satz UEAB        sh "$T/UEAB/alle.sh"
[ -f "$T/UECD/alle.sh" ] && satz UECD sh "$T/UECD/alle.sh"
satz B1          env B1_OUT="$OUT/b1" sh "$T/B1/alle.sh"
satz BITMASK     env BM_OUT="$OUT/bm" bash "$T/BITMASK/alle.sh"
for t in smoke v3-mk8-smoke v3-mk8b-smoke v3-qa-mk5reg-smoke orch-mk-check; do satz "rauch-$t" node "bau/tests/$t.mjs" "$APP" "$OUT/$t.png"; done
[ -n "$LINK" ] && rm -f "$ROOT/node_modules"
echo; [ $fail = 0 ] && echo "ALLES GRÜN" || echo "ES GIBT ROT (Logs: $OUT)"
exit $fail
