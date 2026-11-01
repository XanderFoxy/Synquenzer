#!/bin/sh
# 4.30.1 Logo-Abspann deckungsgleich: alle Formate, beide Wege, Song länger (8 Takte = 16 s + Ausklang) und kürzer (3 Takte = 6 s + Ausklang)
# als das Logo (10 s). Nacheinander (unter Last streut schon der Offline-Ton), je Lauf höchstens 5 min.
D=$(cd "$(dirname "$0")" && pwd); APP=${APP:-$(cd "$D/.." && pwd)/index.html}; O=${O:-$D/out}; mkdir -p "$O"; export NODE_PATH=${NODE_PATH:-/opt/node-tools/node_modules}
r() { n=logo-$1-$(echo $2 | tr : x)-$3t; (cd "$D" && timeout 298 node logo-ende.mjs "$APP" $1 $2 $3) > "$O/$n.txt" 2>&1; echo "rc=$?" >> "$O/$n.txt"; echo "== $n: $(grep -v '^rc=' "$O/$n.txt" | tail -1 | cut -c1-200)"; }
r wc 16:9 8; r wc 9:16 8; r wc 1:1 8; r wc 16:9 3
r mr 16:9 8; r mr 9:16 8; r mr 1:1 8; r mr 9:16 3
