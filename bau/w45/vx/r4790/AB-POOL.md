# A/B 4.79.0 ↔ 4.78.0 (04:46:14 UTC)

Tests 55 · {"OFFEN":4,"GRÜN":42,"BEKANNT":9}

| Test | A/B-Urteil | 4.79.0 (REG) | 4.78.0 (Referenz) | allein 4.79 / 4.78 | Grund |
|---|---|---|---|---|---|
| beg1 | OFFEN | UNGÜLTIG (Last) 50/8 · 317 s · fremd 6.3 | UNGÜLTIG (Last) 46/12 · 347 s · fremd 8.5 ; ROT 56/2 · 309 s · fremd 3.1 ; BEKANNT 57/1 · 305 s · fremd 3.1 | – / – | nur 4.79: Ausgang (Summe, Echtzeit): die Band klingt (Pegel), kein Übersteuern/NaN, keine Aussetzer; nach dem SCHLUSS-Stopp klingt alles gleichmäßig aus (nach (rot), CPU: der Begleiter plant je Spur und Fenster in Ø 88 µs (Spitze (zeit) |
| fokus1 | BEKANNT | LAST 45/6 · 84 s · fremd 5.2 | LAST 44/7 · 147 s · fremd 10.8 ; ROT 46/5 · 98 s · fremd 1.7 | – / – | in 4.78 gleich: umschalten-rest longtasks<=50, umschalten-gef longtasks<=50, 3min-umschalten longtasks<=50 (wiederholt), umschalten-alles longtasks<=50 |
| ki1 | BEKANNT | BEKANNT 16/3 · 30 s · fremd 0 | BEKANNT 16/3 · 52 s · fremd 8.3 | – / – | bekannt.json, in 4.78 gleich: besser-als-klassisch-demo, gesang-besser-als-klassisch, guide-eintrag |
| mtx4 | BEKANNT | UNGÜLTIG (Last) 113/5 · 136 s · fremd 10.8 | UNGÜLTIG (Last) 112/6 · 216 s · fremd 29.9 ; UNGÜLTIG (Last) 115/3 · 136 s · fremd 8.7 | – / – | in 4.78 gleich: ab dem Taktstrich der neue Inhalt: 1-Takt-Clip (nur 60, nicht der alte 2. Takt mit 62) ·, ÷2 und danach ×2: jede Achtel genau einmal, Wiedergabe läuft, Aktion <, Bild der Matrix mit Auswahl (renderGrid ohne Zwischenspeicher, alle Zellen) ≤, ±1 / Dorisch / Quantisieren über alle 64 Clips je <, P2 1×: 64 dichte Clips (4096 Noten), 7 Aktionen inkl. ↶ ↷ der Leiste: kein Long Task > |
| rv1 | BEKANNT | ROT 52/2 · 327 s · fremd 26.6 | ROT 52/2 · 724 s · fremd 22.3 ; ROT 52/2 · 115 s · fremd 1.4 | – / – | in 4.78 gleich: #14 Stück 31 |
| spk1 | BEKANNT | BEKANNT 17/1 · 18 s · fremd 0 | BEKANNT 17/1 · 28 s · fremd 5.5 | – / – | bekannt.json, in 4.78 gleich: verfeinern-verbessert-ziel |
| spk10s | BEKANNT | ROT 0/0 · 1 s · fremd 0 | ROT 0/0 · 1 s · fremd 6.7 ; GRÜN 16/0 · 23 s · fremd 1.8 | – / – | in 4.78 gleich: STRUKTUR Exit 1 mit Stacktrace (Absturz):   path:, STRUKTUR nur 0 von 16 Prüfungen gelaufen (Referen, STRUKTUR leerer Lauf: keine OK-/FEHLER-Zeile und |
| spk12b | BEKANNT | ROT 71/2 · 58 s · fremd 0.6 | ROT 70/3 · 80 s · fremd 10 ; GRÜN 72/0 · 60 s · fremd 0.2 | – / – | in 4.78 gleich: keine-long-task-50ms |
| spk4 | OFFEN | LAST 15/6 · 389 s · fremd 8.6 | LAST 16/5 · 774 s · fremd 14.7 ; BEKANNT 19/2 · 275 s · fremd 1.7 | – / – | nur 4.79: a3-nachbau-zeit (zeit) |
| spk6p | BEKANNT | ROT 11/1 · 321 s · fremd 19 | ROT 9/3 · 884 s · fremd 23.3 ; GRÜN 12/0 · 229 s · fremd 9 | – / – | in 4.78 gleich: b2-bloecke-waehrend-rechnung |
| spk7p | OFFEN | ROT 11/2 · 30 s · fremd 0 | GRÜN 12/0 · 35 s · fremd 7 | – / – | nur 4.79: b5-als-klangkorn-ohne-stillstand (rot),  (rot) |
| teil1 | BEKANNT | ROT 60/1 · 218 s · fremd 20.2 | ROT 56/5 · 413 s · fremd 26 ; ROT 59/2 · 160 s · fremd 6.4 | – / – | in 4.78 gleich: T1 teile |
| voxr1 | OFFEN | UNGÜLTIG (Last) 78/5 · 75 s · fremd 5.1 | UNGÜLTIG (Last) 76/7 · 222 s · fremd 12.6 ; ROT 78/5 · 87 s · fremd 0.7 ; UNGÜLTIG (Last) 77/6 · 90 s · fremd 7 ; BEKANNT 80/3 · 81 s · fremd 0.6 | – / – | nur 4.79: Mehr ▾ offen: Zustandszeile (Befund, Fortschritt, Abbrechen) im Bild, unterer Rand ≤ 926 px (rot) |
