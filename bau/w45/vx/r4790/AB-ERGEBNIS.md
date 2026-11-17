# A/B 4.79.0 ↔ 4.78.0 (05:22:57 UTC)

Tests 55 · {"BEKANNT":10,"GRÜN":44,"LAST":1}

| Test | A/B-Urteil | 4.79.0 (REG) | 4.78.0 (Referenz) | allein 4.79 / 4.78 | Grund |
|---|---|---|---|---|---|
| beg1 | BEKANNT | UNGÜLTIG (Last) 50/8 · 317 s · fremd 6.3 | UNGÜLTIG (Last) 46/12 · 347 s · fremd 8.5 ; ROT 56/2 · 309 s · fremd 3.1 ; BEKANNT 57/1 · 305 s · fremd 3.1 | UNGÜLTIG (Last) 53/5 · 316 s · fremd 11.8 + UNGÜLTIG (Last) 55/3 · 313 s · fremd 8.2 / BEKANNT 57/1 · 316 s · fremd 11.8 + UNGÜLTIG (Last) 56/2 · 316 s · fremd 8.2 | allein A/B (2 Runden): 4.79 UNGÜLTIG (Last) + UNGÜLTIG (Last) / 4.78 BEKANNT + UNGÜLTIG (Last) · in 4.78 gleich: Prüfung 5 · Pool nur 4.79: Ausgang (Summe, Echtzeit): die Band klingt (Pegel), kein Übersteuern/NaN, keine Aussetzer; nach dem SCHLUSS-Stopp klingt alles gleichmäßig aus (nach, CPU: der Begleiter plant je Spur und Fenster in Ø 88 µs (Spitze |
| fokus1 | BEKANNT | LAST 45/6 · 84 s · fremd 5.2 | LAST 44/7 · 147 s · fremd 10.8 ; ROT 46/5 · 98 s · fremd 1.7 | – / – | in 4.78 gleich: umschalten-rest longtasks<=50, umschalten-gef longtasks<=50, 3min-umschalten longtasks<=50 (wiederholt), umschalten-alles longtasks<=50 |
| ki1 | BEKANNT | BEKANNT 16/3 · 30 s · fremd 0 | BEKANNT 16/3 · 52 s · fremd 8.3 | – / – | bekannt.json, in 4.78 gleich: besser-als-klassisch-demo, gesang-besser-als-klassisch, guide-eintrag |
| mtx4 | BEKANNT | UNGÜLTIG (Last) 113/5 · 136 s · fremd 10.8 | UNGÜLTIG (Last) 112/6 · 216 s · fremd 29.9 ; UNGÜLTIG (Last) 115/3 · 136 s · fremd 8.7 | – / – | in 4.78 gleich: ab dem Taktstrich der neue Inhalt: 1-Takt-Clip (nur 60, nicht der alte 2. Takt mit 62) ·, ÷2 und danach ×2: jede Achtel genau einmal, Wiedergabe läuft, Aktion <, Bild der Matrix mit Auswahl (renderGrid ohne Zwischenspeicher, alle Zellen) ≤, ±1 / Dorisch / Quantisieren über alle 64 Clips je <, P2 1×: 64 dichte Clips (4096 Noten), 7 Aktionen inkl. ↶ ↷ der Leiste: kein Long Task > |
| rv1 | BEKANNT | ROT 52/2 · 327 s · fremd 26.6 | ROT 52/2 · 724 s · fremd 22.3 ; ROT 52/2 · 115 s · fremd 1.4 | – / – | in 4.78 gleich: #14 Stück 31 |
| spk1 | BEKANNT | BEKANNT 17/1 · 18 s · fremd 0 | BEKANNT 17/1 · 28 s · fremd 5.5 | – / – | bekannt.json, in 4.78 gleich: verfeinern-verbessert-ziel |
| spk12b | BEKANNT | ROT 71/2 · 58 s · fremd 0.6 | ROT 70/3 · 80 s · fremd 10 ; GRÜN 72/0 · 60 s · fremd 0.2 | ROT 70/3 · 77 s · fremd 11.7 / ROT 70/3 · 75 s · fremd 11.6 | allein A/B (1 Runde): 4.79 ROT / 4.78 ROT · in 4.78 gleich: keine-long-task-50ms |
| spk4 | LAST | LAST 15/6 · 389 s · fremd 8.6 | LAST 16/5 · 774 s · fremd 14.7 ; BEKANNT 19/2 · 275 s · fremd 1.7 | LAST 17/4 · 596 s · fremd 20.1 + LAST 17/4 · 305 s · fremd 5.6 / LAST 18/3 · 593 s · fremd 20.1 + LAST 18/3 · 305 s · fremd 5.6 | allein nur 4.79 Zeit-Prüfungen bei Fremdlast 5.6 > 4: reg-spk3-test |
| spk6p | BEKANNT | ROT 11/1 · 321 s · fremd 19 | ROT 9/3 · 884 s · fremd 23.3 ; GRÜN 12/0 · 229 s · fremd 9 | – / – | in 4.78 gleich: b2-bloecke-waehrend-rechnung |
| teil1 | BEKANNT | ROT 60/1 · 218 s · fremd 20.2 | ROT 56/5 · 413 s · fremd 26 ; ROT 59/2 · 160 s · fremd 6.4 | – / – | in 4.78 gleich: T1 teile |
| voxr1 | BEKANNT | UNGÜLTIG (Last) 78/5 · 75 s · fremd 5.1 | UNGÜLTIG (Last) 76/7 · 222 s · fremd 12.6 ; ROT 78/5 · 87 s · fremd 0.7 ; UNGÜLTIG (Last) 77/6 · 90 s · fremd 7 ; BEKANNT 80/3 · 81 s · fremd 0.6 | LAST 78/5 · 111 s · fremd 11.8 / UNGÜLTIG (Last) 77/6 · 106 s · fremd 11.5 | allein A/B (1 Runde): 4.79 LAST / 4.78 UNGÜLTIG (Last) · in 4.78 gleich: App: 3-min-Take im Worker, Prüfen + Kette × 3 ≤, Hauptfaden ohne Long Task >, Klicks Take A: ≥ 18 von 20 gefunden (2 Durchgänge), Klicks Take B: repariert, Raumton: Klangfarbe (Oktavbänder 250 Hz–8 kHz) wie der Raumton an der Stelle ± 4 dB · Pool nur 4.79: Mehr ▾ offen: Zustandszeile (Befund, Fortschritt, Abbrechen) im Bild, unterer Rand ≤ 926 px |

## Urteil (von Hand, 05:25 UTC)

- **Echte 4.79-Fehler: keine.** 55/55 Tests mit Ergebnis, Struktur-Fehler 0, alle `.err` leer. A/B: GRÜN 44 · BEKANNT 10 · LAST 1 (spk4) · ROT 0.
- Allein A/B (rel-4790/pruef/reg/ab-solo.sh, nice -10, 4.79 und 4.78 gleichzeitig): Runde 1 spk7p spk10s spk12b voxr1 spk4 beg1 · Runde 2 beg1 spk4.
- spk7p (Pool ROT b5 Long Task 168 ms) → allein GRÜN 12/0 = 4.78. spk10s (Pool ROT in 4.78 und 4.79) = Werkzeug: Umgebungsvariable SPUREN des Pools
  wird von spk10-seite.mjs als Spurenliste gelesen (mess/3.f32) → ohne SPUREN allein GRÜN 16/0 = 4.78.
- voxr1 Pool „Zustandszeile unten 937 > 926 px“ und „Atmer-Marke leiser → weg“ → allein in 4.79 und 4.78 OK (909 px, weg nach 2 Tipps); Rest = 4.78.
- beg1: in keiner Runde eine Prüfung, die in jeder 4.79-Runde und in keiner 4.78-Runde rot ist (Runde 1: 4.79 „Drums im Stil“ 63 statt 64 Schläge,
  Runde 2: dort OK, beide rot „Aufnahme = Live 185/184“). Planer Ø je Fenster 4.79 88/43/98 µs, 4.78 74/75 µs → kein fester Unterschied.
- spk4 LAST: `reg-spk3-test` → `nachbau-abstaende-besser` in beiden 4.79-Runden rot, in den zwei 4.78-Runden grün; im 4.78-Pool (vx/r4780) aber genauso rot.
  Sonde pruef/reg/sonde/klang-ab.mjs (beide Fassungen im selben Chromium abwechselnd, spk2KlOpt n 50 seed 7, 4 Runden): Ergebnis lead 0,9483 in 8/8,
  va2 3,8883 in 7/8 (einmal 4.79 3,8858 = besser) → die Klang-Suche findet dieselben Klänge; der rote Lauf ist der bekannte Wackler der Klang-Suche.
  Zeit (Median, Last 3,5–5): Suche va2 1931/1892 ms, lead 1902/1784 ms; 20× Rendern 1578/1508 ms (10 Runden, Streuung 1400–2064), 10× addModule
  328/341 ms → Unterschied ≤ 5 % bei ± 15 % Streuung, kein nachweisbarer Rückschritt (Worklet 4.79 = 4.78 + NST1W 2 KB, läuft nur bei Wellen-Wechsel).
