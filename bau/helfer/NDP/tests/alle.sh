#!/usr/bin/env bash
# ND-P: alle Tests der North-Platte. Aufruf: bau/helfer/NDP/tests/alle.sh   (Playwright + Chromium vorinstalliert)
# Baut vorher index.html aus R-4300 + quelle/ neu (quelle/bau.py), schreibt Bilder nach tests/bilder/, Ergebnis-Tabelle nach stdout.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"; cd "$HERE"
[ -e node_modules ] || ln -s "$(npm root -g)" node_modules
python3 ../quelle/bau.py || exit 1
rc=0; sum=""
run() { local n="$1"; shift; local out; out="$("$@" 2>&1)"; local r=$?; echo "$out"; local z; z="$(echo "$out" | grep -E '^== ' | tail -1)"; [ -z "$z" ] && z="$(echo "$out" | grep -c '^OK ')/$(echo "$out" | grep -cE '^(OK|FEHL) ')"; sum="$sum\n| $n | ${z#== } | $([ $r = 0 ] && echo grün || echo ROT) |"; [ $r = 0 ] || rc=1; }
run "Regeln (Wörter, Zählungen, Emoji, Block)" node ndp-regeln.mjs
run "Öffnen/Schließen 428×926 · 926×428 · 428×650" node ndp-oeffnen.mjs
run "Sektionen: jeder Regler, Abgleich Editor" node ndp-sektionen.mjs
run "Spielen: Kanal-Tasten, Rad, PROG/KIT" node ndp-spielen.mjs
run "Undo, Speichern/Laden, Instrument-Wahl, bitgleich" node ndp-undo-daten.mjs
run "Leistung" node ndp-leistung.mjs
run "Rauchtests bau/tests" ./rauch.sh
run "MK-Platte (vorhandene Tests, Vergleich R-4300)" ./mk-alt.sh
echo; echo "| Test | Ergebnis | Stand |"; echo "|---|---|---|"; echo -e "$sum" | sed '/^$/d'
exit $rc
