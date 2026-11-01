#!/usr/bin/env bash
# KONUX: alle Tests. Aufruf: bash bau/helfer/KONUX/tests/alle.sh   (Playwright + Chromium vorinstalliert)
# Ergebnis: je Zeile ein JSON-Befund, am Ende die Summe; Exit-Code 0 = alles grün
set -u
cd "$(dirname "$0")"
export NODE_PATH="${NODE_PATH:-}:/opt/node-tools/node_modules:/usr/local/lib/node_modules_global"
NEU="$(cd .. && pwd)/index.html"; TESTS="$(cd ../../../tests && pwd)"; mkdir -p bilder
rc=0; sum=""
lauf() { local n="$1"; shift; echo "== $n"; if "$@"; then sum+="GRÜN  $n"$'\n'; else sum+="ROT   $n"$'\n'; rc=1; fi; }
# statische Regeln (Datei-Inhalt)
regeln() {
  local f="$NEU" ok=0
  [ "$(grep -c '  live: true,' "$f")" = 1 ] || { echo "live: true, nicht genau 1×"; ok=1; }
  [ "$(grep -o 'MS 2000' "$f" | wc -l)" = 1 ] || { echo "MS 2000 nicht genau 1×"; ok=1; }
  local w c; for w in Korg microKORG RADIAS DWGS Kodamo Mask1 Nord Kompakt; do c=$(grep -o "$w" "$f" | wc -l); [ "$c" = 0 ] || { echo "verbotenes Wort $w: $c"; ok=1; }; done
  grep -q "const VERSION = '4.30.0'" "$f" || { echo "VERSION nicht 4.30.0"; ok=1; }
  [ "$(grep -c 'KONUX-CSS-BEGIN' "$f")" = 1 ] && [ "$(grep -c 'KONUX-CSS-END' "$f")" = 1 ] || { echo "CSS-Block-Marken fehlen"; ok=1; }
  if grep -nE "fetch\(|XMLHttpRequest|indexedDB\.open|createClient" <(sed -n '/\/\* KONUX ----------/,/\/\* \/KONUX \*\//p' "$f"); then echo "Netz/Datenbank im KONUX-Block"; ok=1; fi
  [ $ok = 0 ] && echo '{"test":"regeln","ok":true}'; return $ok
}
lauf "Regeln (live, Wörter, MS 2000, VERSION, Marken)" regeln
lauf "Wege per Finger = 4.30.0, 1 Undo, Name im selben Blatt" node konux-wege.mjs
lauf "Vorschau erscheint / wechselt / verschwindet" node konux-vorschau.mjs
lauf "Layout 428×926, 926×428, 428×650, 375×667" node konux-layout.mjs
lauf "Animation ≤ 250 ms, Haptik, keine Aufgabe > 50 ms" node konux-anim.mjs
lauf "Format 5, altes Projekt Zeichen für Zeichen gleich" node konux-format.mjs
# die Rauchtests importieren „playwright“ als ESM: aus einem Temp-Ordner mit node_modules-Verweis starten
RT="$(mktemp -d)"; ln -s /opt/node-tools/node_modules "$RT/node_modules"; BI="$(pwd)/bilder"
for t in smoke v3-mk8-smoke v3-mk8b-smoke v3-qa-mk5reg-smoke; do
  cp "$TESTS/$t.mjs" "$RT/"
  lauf "Rauchtest $t" bash -c "out=\$(node '$RT/$t.mjs' '$NEU' '$BI/rauch-$t.png' 2>&1); echo \"\$out\"; echo \"\$out\" | grep -q 'errors \[\]'"
done
rm -rf "$RT"
echo; echo "$sum"; exit $rc
