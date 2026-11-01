#!/usr/bin/env bash
# T0: Regeln der Abgabe (index.html und alle NDI-Dateien)
cd "$(dirname "$0")/.." || exit 2
export LC_ALL=C.UTF-8; n=0
F=index.html; f=0; p=0
chk() { if [ "$2" = "$3" ]; then echo "  PASS $1 ($2)"; p=$((p+1)); else echo "  FAIL $1: $2 statt $3"; f=$((f+1)); fi; }
chk 'live: true genau 1x' "$(grep -o -F '  live: true,' $F | wc -l)" 1
chk '"MS 2000" genau 1x' "$(grep -o 'MS 2000' $F | wc -l)" 1
# die Liste steht verschlüsselt hier, damit diese Datei selbst sauber bleibt
for w in $(echo 'S29yZyBtaWNyb0tPUkcgUkFESUFTIERXR1MgS29kYW1vIE1hc2sxIE5vcmQgS29tcGFrdA==' | base64 -d); do chk "Wort Nr. $((++n)) = 0 (index.html, CHANGES, STATUS, Tests)" "$(cat $F CHANGES.md STATUS.md tests/*.cjs tests/*.sh tests/*.py 2>/dev/null | grep -o "$w" | wc -l)" 0; done
chk "VERSION bleibt 4.30.0" "$(grep -c "^const VERSION = '4.30.0';$" $F)" 1
chk "CSS-Block NDI-CSS-BEGIN/END je 1x" "$(grep -c 'NDI-CSS-BEGIN\|NDI-CSS-END' $F)" 2
chk "keine neuen Netz-/Datenbank-Aufrufe (fetch/XMLHttpRequest/indexedDB.open/supabase im Diff)" "$(grep '^+' patch.diff | grep -v '^+++' | grep -c -E 'fetch\(|XMLHttpRequest|indexedDB\.open|\.from\(.[a-z_]+.\)\.(select|insert|upsert)|sendBeacon|WebSocket')" 0
chk "sw.js unverändert (keine Kopie in der Abgabe)" "$(ls sw.js 2>/dev/null | wc -l)" 0
# Emoji als Grafik im Diff (Bereiche 1F300–1FAFF, 2600–27BF ausser den in der App üblichen Zeichen ✕ ▶ ■ ‹ ›)
chk "kein neues Emoji im Diff" "$(grep '^+' patch.diff | grep -v '^+++' | grep -c -P '[\x{1F300}-\x{1FAFF}\x{2600}-\x{26FF}]')" 0
# Syntax: jedes ausführbare Skript der Seite parst (node --check je Block)
TMP=$(mktemp -d); python3 - "$F" "$TMP" <<'PY'
import re, sys
s = open(sys.argv[1], encoding='utf-8').read()
for i, m in enumerate(re.finditer(r'<script(?![^>]*type="text/plain")[^>]*>(.*?)</script>', s, re.S)):
    open('%s/b%03d.js' % (sys.argv[2], i), 'w', encoding='utf-8').write(m.group(1))
PY
bad=0; for j in "$TMP"/b*.js; do node --check "$j" 2>/dev/null || { echo "    Syntaxfehler in $(basename $j)"; bad=$((bad+1)); }; done; rm -rf "$TMP"
chk "alle Skript-Blöcke parsen" "$bad" 0
# „// NDI“ darf keinen Code verschlucken: steht vor dem Kommentar Code, darf keine Zeile in R-4300 genauso beginnen und danach weiteren Code haben
sw=$(python3 - <<'PY'
o = open('../../snapshots/R-4300.html', encoding='utf-8').read().split('\n'); oset = set(o); bad = 0
for l in open('index.html', encoding='utf-8').read().split('\n'):
    if '// NDI' not in l or l in oset: continue
    code = l[:l.find('// NDI')].rstrip()
    if code.strip() and any(ol.startswith(code) and len(ol.rstrip()) > len(code) and not ol[len(code):].lstrip().startswith('//') for ol in o): bad += 1
print(bad)
PY
)
chk "// NDI verschluckt keinen Code" "$sw" 0
echo "T0 Regeln: $p PASS, $f FAIL"; [ $f -eq 0 ]
