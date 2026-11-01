#!/bin/bash
# Stage B2 – Pflicht-Regeln gegen ../index.html (und R-4300 für „alte Projekte“ siehe Paket-Tests)
H="$(cd "$(dirname "$0")" && pwd)"; APP="$H/../../index.html"; fail=0
chk() { if [ "$2" = "$3" ]; then echo "  ✓ $1 ($2)"; else echo "  ✗ $1: $2 (soll $3)"; fail=1; fi; }
chk "VERSION 4.30.0" "$(grep -c "^const VERSION = '4.30.0';" "$APP")" 1
chk "genau 1× '  live: true,'" "$(grep -c '^  live: true,' "$APP")" 1
PAT=$(echo 'a29yZ3xtaWNyb2tvcmd8cmFkaWFzfGR3Z3N8a29kYW1vfG1hc2sxfFxibm9yZFxifGtvbXBha3Q=' | base64 -d)   # verbotene Wörter, kodiert
chk "verbotene Wörter (Datei)" "$(grep -ciE "$PAT" "$APP")" 0
chk "verbotene Wörter (B2-Ordner)" "$(grep -rciE "$PAT" "$H/../.." --include=*.md --include=*.diff --include=*.mjs --include=*.sh --include=*.cjs --include=*.py --exclude-dir=node_modules | awk -F: '{s+=$2} END {print s+0}')" 0
chk "'MS 2000' genau 1×" "$(grep -o 'MS 2000' "$APP" | wc -l | tr -d ' ')" 1
chk "kein Netz-/Datenbankzugriff neu (fetch/supabase/XMLHttpRequest/WebSocket)" "$(diff <(grep -oE 'fetch\(|supabase|XMLHttpRequest|new WebSocket' "$H/../../../../snapshots/R-4300.html" | sort | uniq -c) <(grep -oE 'fetch\(|supabase|XMLHttpRequest|new WebSocket' "$APP" | sort | uniq -c) | grep -c '^[<>]')" 0
NODE_PATH="$H/../node_modules" node "$H/acorn-pruefung.cjs" "$APP" || fail=1
exit $fail
