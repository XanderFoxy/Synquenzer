# A/B 4.77.0 ↔ 4.76.1 (12:24:50 UTC)

Tests 55 · {"BEKANNT":12,"GRÜN":38,"OFFEN":5}

| Test | A/B-Urteil | 4.77.0 | 4.76.1 | allein 4.77 / 4.76.1 | Grund |
|---|---|---|---|---|---|
| beg1 | BEKANNT | LAST 54/4 · 315 s · fremd 8.1 (Pool UNGÜLTIG (Last) 43/15, fremd 26.8) | UNGÜLTIG (Last) 54/4 · 314 s · fremd 8 (Pool UNGÜLTIG (Last) 43/15, fremd 26.5) | – / – | in 4.76.1 gleich: Prüfung 6, Prüfung 5 |
| clip1 | OFFEN | ROT 0/1 · 10 s · fremd 16.6 | GRÜN 109/0 · 85 s · fremd 19.3 | – / – | nur 4.77: STRUKTUR Exit 1 mit Stacktrace (Absturz): TypeErr (struktur), STRUKTUR nur 1 von 109 Prüfungen gelaufen (Refere (struktur), 428x926 C1 Abschnitt „Als neuer Clip · Synth 1“ mit so vielen Knöpfen wie freie Szenen (rot) |
| fok2 | BEKANNT | LAST 17/4 · 257 s · fremd 8.6 (Pool ROT 18/3, fremd 35.3) | ROT 18/3 · 257 s · fremd 8.6 (Pool ROT 18/3, fremd 35.5) | – / – | in 4.76.1 gleich: zeit s20N4096 (Long Tasks Hauptfaden <, zeit s20N16384 (Long Tasks Hauptfaden <, zeit s180N4096 (Long Tasks Hauptfaden <, zeit s180N16384 (Long Tasks Hauptfaden < |
| fokus1 | BEKANNT | LAST 45/6 · 103 s · fremd 4.5 (Pool LAST 44/7, fremd 14.5) | LAST 45/6 · 104 s · fremd 4.5 (Pool LAST 44/7, fremd 15) | – / – | in 4.76.1 gleich: 428x926 umschalten-rest longtasks<=50, 428x926 umschalten-gef longtasks<=50, 428x926 3min-umschalten longtasks<=50 (wiederholt), 926x428 umschalten-rest longtasks<=50, 926x428 umschalten-alles longtasks<=50, 926x428 umschalten-gef longtasks<=50 |
| ki1 | BEKANNT | BEKANNT 16/3 · 70 s · fremd 14.9 | BEKANNT 16/3 · 71 s · fremd 14.5 | – / – | bekannt.json, in 4.76.1 gleich: besser-als-klassisch-demo, gesang-besser-als-klassisch, guide-eintrag |
| mtx4 | BEKANNT | LAST 116/2 · 132 s · fremd 4.2 (Pool UNGÜLTIG (Last) 114/4, fremd 21.6) | UNGÜLTIG (Last) 115/3 · 133 s · fremd 5.3 (Pool UNGÜLTIG (Last) 114/4, fremd 22.6) | – / – | in 4.76.1 gleich: ±1 / Dorisch / Quantisieren über alle 64 Clips je <, P2 1×: 64 dichte Clips (4096 Noten), 7 Aktionen inkl. ↶ ↷ der Leiste: kein Long Task > |
| rv1 | OFFEN | ROT 52/2 · 164 s · fremd 8 (Pool ROT 52/2, fremd 24) | GRÜN 53/0 · 464 s · fremd 24.9 | – / – | nur 4.77: #14 Stück 31 (rot), 1/53 (164 s) (rot) |
| spk1 | BEKANNT | BEKANNT 17/1 · 55 s · fremd 20.1 | BEKANNT 17/1 · 51 s · fremd 16.8 | – / – | bekannt.json, in 4.76.1 gleich: verfeinern-verbessert-ziel |
| spk10s | BEKANNT | ROT 0/0 · 2 s · fremd 14.7 | ROT 0/0 · 2 s · fremd 14.7 | – / – | in 4.76.1 gleich: STRUKTUR Exit 1 mit Stacktrace (Absturz):   path:, STRUKTUR nur 0 von 16 Prüfungen gelaufen (Referen, STRUKTUR leerer Lauf: keine OK-/FEHLER-Zeile und |
| spk12 | OFFEN | ROT 97/2 · 89 s · fremd 4.3 (Pool ROT 97/2, fremd 16.8) | GRÜN 98/0 · 110 s · fremd 19.6 | – / – | nur 4.77: 926x428 hauptfaden-ohne-long-task (zeit) |
| spk12b | BEKANNT | ROT 70/3 · 74 s · fremd 6 (Pool ROT 69/4, fremd 14.9) | GRÜN (allein) 72/0 · 63 s · fremd 3.2 (Pool ROT 69/4, fremd 15.1) | – / – | in 4.76.1 gleich: 428x926 keine-long-task-50ms, 926x370 keine-long-task-50ms |
| spk12c | BEKANNT | LAST 45/2 · 68 s · fremd 10 (Pool LAST 45/2, fremd 13.3) | LAST 46/1 · 62 s · fremd 5.4 (Pool LAST 45/2, fremd 13.4) | – / – | in 4.76.1 gleich: 428x926 hauptfaden-ohne-long-task, 926x428 hauptfaden-ohne-long-task |
| spk12d | BEKANNT | ROT 27/1 · 64 s · fremd 6.9 (Pool ROT 26/2, fremd 16.8) | ROT 27/1 · 78 s · fremd 7.9 (Pool ROT 26/2, fremd 16.1) | – / – | in 4.76.1 gleich: abtasten-aus-aehnlich-fortschritt |
| spk4 | OFFEN | LAST 17/4 · 492 s · fremd 11 | ROT 16/5 · 374 s · fremd 7.1 (Pool LAST 15/6, fremd 11) | – / – | nur 4.77: a3-nachbau-zeit (zeit) |
| spk6p | BEKANNT | ROT 11/1 · 411 s · fremd 16.6 (Pool ROT 9/3, fremd 35.7) | GRÜN (allein) 12/0 · 220 s · fremd 8.3 (Pool ROT 9/3, fremd 35.6) | – / – | in 4.76.1 gleich: b1-anwenden-12x-bereich |
| teil1 | OFFEN | ROT 58/3 · 164 s · fremd 10.2 (Pool ROT 53/8, fremd 30.6) | ROT 52/9 · 419 s · fremd 29.8 | – / – | nur 4.77: 428x926 T1 teile (rot) |
| voxr1 | BEKANNT | UNGÜLTIG (Last) 77/6 · 100 s · fremd 9.2 (Pool UNGÜLTIG (Last) 76/7, fremd 20.5) | UNGÜLTIG (Last) 77/6 · 223 s · fremd 17.4 (Pool UNGÜLTIG (Last) 75/8, fremd 19.4) | – / – | in 4.76.1 gleich: Entzischer: Rechen-Scheiben im Rückfall klein (60-s-Take, größte Scheibe ≤, App: 3-min-Take im Worker, Prüfen + Kette × 3 ≤, Hauptfaden ohne Long Task >, Klicks Take A: ≥ 18 von 20 gefunden (2 Durchgänge), Klicks Take B: repariert, Raumton: Klangfarbe (Oktavbänder 250 Hz–8 kHz) wie der Raumton an der Stelle ± 4 dB |
