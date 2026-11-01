#!/bin/bash
# SX126: alle Tests gegen ../index.html (APP=… überschreibt). Ergebnis je Test in ergebnis/*.json, Fotos in bilder/.
# Voraussetzung: Playwright + Chromium; für ESM-Import einmal im Repo-Wurzelordner: ln -s "$(npm root -g)" node_modules
cd "$(dirname "$0")"
APP="${APP:-$(cd .. && pwd)/index.html}"; export APP
mkdir -p ergebnis bilder
ok=0; fail=0; rm -f ergebnis/zusammenfassung.txt
run() { local n="$1"; shift; if timeout 600 "$@" > "ergebnis/$n.log" 2>&1; then echo "OK      $n" | tee -a ergebnis/zusammenfassung.txt; ok=$((ok+1)); else echo "FEHLER  $n" | tee -a ergebnis/zusammenfassung.txt; fail=$((fail+1)); fi; }
smoke() { timeout 300 node "../../../tests/$1.mjs" "$APP" "bilder/rauch-$1.png" > "ergebnis/$1.log" 2>&1 && grep -q 'errors \[\]' "ergebnis/$1.log"; }
for t in ${NUR:-t0-regeln t1-sx1-render t2-sx1-live t3-sx1-abspann t4-format t5-sx2 t6-sx6 t7-bilder}; do run "$t" node "$t.mjs"; done
for s in smoke v3-mk8-smoke v3-mk8b-smoke v3-qa-mk5reg-smoke; do
  if smoke "$s"; then echo "OK      $s" | tee -a ergebnis/zusammenfassung.txt; ok=$((ok+1)); else echo "FEHLER  $s" | tee -a ergebnis/zusammenfassung.txt; fail=$((fail+1)); fi
done
echo "-- $ok OK, $fail FEHLER" | tee -a ergebnis/zusammenfassung.txt
[ "$fail" = 0 ]
