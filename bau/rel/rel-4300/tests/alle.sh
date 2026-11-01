#!/bin/sh
# 4.30.0 (rel-4300 = 4.29.0 VIDEO + North): North-Tests + Hauptlinien-Tests gegen ../index.html; „alt“ = 4.29.0 (synq-snapshots/R-4290.html).
# md2-ui hochkant/quer getrennt (zusammen ~270 s, knapp am 5-min-Rahmen). Ausgaben in $O. Echtzeit-/Bildraten-Tests laufen allein (unter Last messen sie zu wenig). Je Lauf höchstens 5 min (timeout 298).
D=$(cd "$(dirname "$0")" && pwd); A=$(cd "$D/.." && pwd)/index.html; S=$(cd "$D/../.." && pwd); OLD=$S/synq-snapshots/R-4290.html
O=${O:-$D/out}; mkdir -p "$O"; export NODE_PATH=${NODE_PATH:-/opt/node-tools/node_modules}
t() { n=$1; shift; s=$(date +%s); (cd "$D" && timeout 298 node "$@") > "$O/$n.txt" 2>&1; echo "rc=$? sek=$(( $(date +%s)-s ))" >> "$O/$n.txt"; echo "== $n: $(tail -1 "$O/$n.txt")"; }
# North (Chromium)
t smoke smoke.mjs "$A" "$O/north-smoke.png"; t md4-quick md4-quick.mjs "$A"; t md4-golden md4-golden.mjs "$A" "$OLD"; t md4-int md4-int.mjs "$A"
t md2-ui-P md2-ui.mjs "$A" "$OLD" --fmt=P; t md2-ui-L md2-ui.mjs "$A" "$OLD" --fmt=L; t tap44 ndstage-tap44.mjs "$A" "$O/tap44"
t north-songs north-songs.mjs "$A" "$OLD"; t north-video north-video.mjs "$A"; t north-chor-songs north-chor-songs.mjs "$A" "$OLD"
t north-kon-chor-ggb north-kon-chor-ggb.mjs "$A"; t north-startzeit north-startzeit.mjs "$A" "$OLD" 12
# neu 4.30.0: North × Video 4.29.0 (VV4-Bilder, Pegel-Meter, Abspann-Logo über http, Auto-Regie Drum-Sequenzer) – WebCodecs, Aufnahme-Weg
t north-vv4-e2e-wc north-vv4-e2e.mjs "$A" wc; t north-vv4-e2e-mr north-vv4-e2e.mjs "$A" mr
# Hauptlinie (EDIT + chor-frisch + ggb-video, G-GB h, G9b, Pipeline, acorn)
APP=$A ALT=$OLD BASE=$OLD O=$O/edit sh "$D/../tests-edit/alle.sh"
(cd "$S/ggb427/tests" && APP=$A timeout 298 node ggb-h-zusammenspiel.mjs) > "$O/ggb-h.txt" 2>&1; echo "== ggb-h: $(tail -1 "$O/ggb-h.txt")"
(cd "$S/rel-4271/pruef/tests" && APP=$A WANTV=4.30.0 WANTC=4030000 timeout 298 node smoke.mjs) > "$O/g9b-smoke.txt" 2>&1; echo "== g9b-smoke: $(tail -1 "$O/g9b-smoke.txt")"
(cd "$S/dirigent-test" && node smoke.mjs "$A" "$O/haupt-smoke.png" && node orch-mk-check.mjs "$A" && node v3-mk2-wellen.mjs "$A") > "$O/pipeline.txt" 2>&1; echo "== pipeline: $(tail -1 "$O/pipeline.txt")"
(cd "$S/rel-4271/tools" && node topdefs.cjs "$A") | tail -1
