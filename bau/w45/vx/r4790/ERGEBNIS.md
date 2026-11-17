# REG – Ergebnis /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/r4790

Start 03:20:56 UTC · Datei /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/rel-4790/index.html (md5 d29d696f, Soll 4.79.0) · vorher /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/rel-4780/index.html · Spuren 3 · CPUs 4 · SOLO 1 · Last vor dem Start 2.04 2.96 3.33
Pool Ende 03:56:10 UTC · Pool 2114 s · Last – (run.sh-Bash 03:21 beendet, xargs-Pool lief zu Ende; Ende = Zeit der letzten Ausgabe run.out; Last am Pool-Ende nicht mitgeschrieben, Container danach neu gestartet)


Urteile: {"UNGÜLTIG (Last)":3,"GRÜN":41,"LAST":2,"BEKANNT":2,"INFO":1,"ROT":6} · Tests 55 (erwartet 55)

| Test | alt (r4760, 4.76.0) | neu | Hinweise |
|---|---|---|---|
| beg1 | – | **UNGÜLTIG (Last)** 50 OK / 8 FEHLER · 317 s · Last 9.3 | ROT: Ausgang (Summe, Echtzeit): die Band klingt (Pegel), kein Übersteuern/NaN, keine Aussetzer; nach dem SCHLUSS-Stopp klingt alles gleichmäßig aus (nach 3,5 s still<br>ROT: Altes Projekt (aus der Basis gespeichert) lädt und klingt in der neuen Fassung gleich (Szene 2, noteLog) – 34 Noten<br>ZEIT: CPU: der Begleiter plant je Spur und Fenster in Ø 88 µs (Spitze 14.2 ms), keine Planer-Fehler – 777 Fenster, 181 Töne · lange Aufgaben 0  ⟶ Planer-Spitze unter Last (A1)<br>ZEIT: Prüfung 6 – ● AUTO mit dem Begleiter: der Song spielt hinterher die Band Ton für Ton wie live (Ziel-Spuren, mit A→B und 3 Akkorden) – 96 Töne live, 100 aus dem   ⟶ Echtzeit-Aufnahme live ↔ Song (● AUTO): BEG1-Code 4.76.0 = 4.76.1 (diff 0), r4760 grün; Probelauf rot bei Last 14–36<br>ZEIT: Prüfung 6 – ein ↶ nimmt Song und Band-Szene zusammen zurück, ↷ bringt beides wieder (klingt gleich) – Song aufgenommen · ↶: Song false, Clips [false,false,false  ⟶ Echtzeit-Aufnahme live ↔ Song (● AUTO): BEG1-Code 4.76.0 = 4.76.1 (diff 0), r4760 grün; Probelauf rot bei Last 14–36<br>ZEIT: Prüfung 6 – Speichern/Laden: der Song mit der Band klingt nach dem Laden gleich  ⟶ Echtzeit-Aufnahme live ↔ Song (● AUTO): BEG1-Code 4.76.0 = 4.76.1 (diff 0), r4760 grün; Probelauf rot bei Last 14–36<br>ZEIT: Prüfung 6 – Begleiter nur eine Weile im Song (im Lauf geöffnet, ✕ vor dem Ende): der Song spielt alle Spuren Ton für Ton wie live – davor/danach die Clips in ih  ⟶ Echtzeit-Aufnahme live ↔ Song (● AUTO): BEG1-Code 4.76.0 = 4.76.1 (diff 0), r4760 grün; Probelauf rot bei Last 14–36<br>bekannt: Prüfung 5 – 5/4 ohne passenden Stil: Akkord und ▶ der Leiste starten nichts, keine Spur wird still gestellt, ein Hinweis sagt warum – Rückgängig: Begleiter → Sz  ⟶ A12: auch auf Basis 4.75 rot (A/B r4760/ab) |
| chrk | – | **GRÜN** 82 OK / 0 FEHLER · 124 s · Last 13.7 |  |
| clip1 | – | **GRÜN** 109 OK / 0 FEHLER · 57 s · Last 3.1 |  |
| fok2 | – | **GRÜN** 21 OK / 0 FEHLER · 323 s · Last 21.7 |  |
| fokus1 | – | **LAST** 45 OK / 6 FEHLER · 84 s · Last 8.2 | ZEIT: 428x926 umschalten-rest longtasks<=50 {"ms":882,"lt":[61,75,58],"max":75,"name":"rest","fr":[{"t":5145,"d":32,"w":"spk1ViewDd"}]}  ⟶ A1/A3: Umschalten unter Last<br>ZEIT: 428x926 umschalten-gef longtasks<=50 {"ms":668,"lt":[62],"max":62,"name":"gef","fr":[]}  ⟶ A1/A3: Umschalten unter Last<br>ZEIT: 428x926 3min-umschalten longtasks<=50 (wiederholt) {"grundlast_original_laden":[55,52,50,81,64],"grundlast_6_bilder_alles":[57,54,61],"rest":{"ms":5915,"lt":[92  ⟶ A1/A3: Umschalten unter Last<br>ZEIT: 926x428 umschalten-rest longtasks<=50 {"ms":912,"lt":[59,100,58,53],"max":100,"name":"rest","fr":[]}  ⟶ A1/A3: Umschalten unter Last<br>ZEIT: 926x428 umschalten-alles longtasks<=50 {"ms":577,"lt":[79],"max":79,"name":"alles","fr":[]}  ⟶ A1/A3: Umschalten unter Last<br>ZEIT: 926x428 umschalten-gef longtasks<=50 {"ms":641,"lt":[79],"max":79,"name":"gef","fr":[]}  ⟶ A1/A3: Umschalten unter Last |
| fokus1k | – | **GRÜN** 26 OK / 0 FEHLER · 12 s · Last 3.1 |  |
| imp1 | – | **GRÜN** 48 OK / 0 FEHLER · 278 s · Last 27.8 |  |
| imp2n | – | **GRÜN** 8 OK / 0 FEHLER · 17 s · Last 3.1 |  |
| ki1 | – | **BEKANNT** 16 OK / 3 FEHLER · 30 s · Last 2.9 | bekannt: besser-als-klassisch-demo {"profi":{"drums":9.71,"bass":4.59,"gesang":0,"rest":0.82,"tonal":11.81},"klassisch":{"drums":8.55,"bass":4.37,"gesang":0.71,"rest":2.  ⟶ vorbestehend (KI1/spk4 „vorbestehend“)<br>bekannt: gesang-besser-als-klassisch {"fehlt":true}  ⟶ ohne Solo-Gesang-Datei nicht gemessen (vorbestehend)<br>bekannt: guide-eintrag {"gd":{"a":["ki1","mxgpro","spk1"],"b":["ki1","spk1"],"n":"Profi-Trennung (Drums, Bass, Gesang, Rest)","d":"Trennt die Auswahl (ohne Auswahl das g  ⟶ vorbestehend ohne Solo-Gesang (spk4-Regel) |
| lt1 | – | **INFO** 0 OK / 0 FEHLER · 901 s · Last 27.1 | reine A/B-Messung (kein Urteil): Median/Max Long Tasks basis↔index |
| mtx3 | – | **GRÜN** 51 OK / 0 FEHLER · 172 s · Last 32 |  |
| mtx3b | – | **GRÜN** 87 OK / 0 FEHLER · 105 s · Last 10 |  |
| mtx3c | – | **GRÜN** 26 OK / 0 FEHLER · 50 s · Last 4.5 |  |
| mtx3cfix | – | **GRÜN** 5 OK / 0 FEHLER · 3 s · Last 3.2 |  |
| mtx3p | – | **GRÜN** 21 OK / 0 FEHLER · 41 s · Last 3.5 |  |
| mtx4 | – | **UNGÜLTIG (Last)** 113 OK / 5 FEHLER · 136 s · Last 13.8 | ROT: ab dem Taktstrich der neue Inhalt: 1-Takt-Clip (nur 60, nicht der alte 2. Takt mit 62) · [60,60,60,60,60,60,60]<br>ROT: ÷2 und danach ×2: jede Achtel genau einmal, Wiedergabe läuft, Aktion < 50 ms · {"miss":1,"dt":2.1,"len":2}<br>ROT: Bild der Matrix mit Auswahl (renderGrid ohne Zwischenspeicher, alle Zellen) ≤ 16 ms · {"median":1.7,"max":69.8,"frameP95":38.7}<br>ZEIT: ±1 / Dorisch / Quantisieren über alle 64 Clips je < 50 ms, kein Long Task > 50 ms ab den Aktionen · {"semi":6,"fit":3,"quant":6,"longtasksAktion":[149,53,77,57]  ⟶ A1: MTX4-Aktionen unter Last<br>ZEIT: P2 1×: 64 dichte Clips (4096 Noten), 7 Aktionen inkl. ↶ ↷ der Leiste: kein Long Task > 50 ms, synchroner Teil < 50 ms · [{"n":"+1 (64 Versionen)","sync":9,"maxF  ⟶ Long Tasks (alle Tests) |
| pflicht | – | **GRÜN** 0 OK / 0 FEHLER · 7 s · Last 3.2 |  |
| rv1 | – | **ROT** 52 OK / 2 FEHLER · 327 s · Last 29.6 | ROT: #14 Stück 31 60 ms nach links: Ausklang des Vorgängers bitgleich (361 ms), kein Knacken, ein ↶ – {"k":31,"D":-60,"du":1,"undo":true,"quelle":"gewechselt","undoB<br>ROT: 1/53 (319 s) |
| rv1k | – | **GRÜN** 53 OK / 0 FEHLER · 201 s · Last 18.7 |  |
| spk1 | – | **BEKANNT** 17 OK / 1 FEHLER · 18 s · Last 2.8 | bekannt: verfeinern-verbessert-ziel {"vor":4.37,"nach":4.36}  ⟶ A29: Verfeinern ≈ 0 (seit 4.61) |
| spk10p | – | **GRÜN** 11 OK / 0 FEHLER · 28 s · Last 3.1 |  |
| spk10s | – | **ROT** 0 OK / 0 FEHLER · 1 s · Last 2.5 | STRUKTUR: Exit 1 mit Stacktrace (Absturz):   path: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/r4790/mess/3.f32' / } / Node.js v22.22.0<br>STRUKTUR: nur 0 von 16 Prüfungen gelaufen (Referenz r4760)<br>STRUKTUR: leerer Lauf: keine OK-/FEHLER-Zeile und keine Pflicht-Ausgabe-Regel |
| spk11 | – | **GRÜN** 41 OK / 0 FEHLER · 162 s · Last 25.7 |  |
| spk11b | – | **GRÜN** 17 OK / 0 FEHLER · 498 s · Last 39 |  |
| spk12 | – | **GRÜN** 98 OK / 0 FEHLER · 81 s · Last 5.8 |  |
| spk12b | – | **ROT** 71 OK / 2 FEHLER · 58 s · Last 3.5 | ROT: 71 OK / 1 FEHLER<br>ZEIT: 926x428 keine-long-task-50ms {"spk12":[65],"ansichtSprung":0}  ⟶ Long Tasks (alle Tests) |
| spk12c | – | **GRÜN** 47 OK / 0 FEHLER · 53 s · Last 2.4 |  |
| spk12d | – | **GRÜN** 28 OK / 0 FEHLER · 50 s · Last 2.3 |  |
| spk4 | – | **LAST** 15 OK / 6 FEHLER · 389 s · Last 11.6 | ZEIT: a3-andere-klaenge-nicht-schlechter ["va2 3.89 → 4.54","fm 2.57 → 2.47","lead 0.95 → 1.08"]  ⟶ Wackler unter Last (STAND 15.11. 14:54)<br>ZEIT: a3-nachbau-zeit {"je":["va2 4105 → 4986 ms","fm 2897 → 4427 ms","pad 5234 → 7062 ms","lead 4769 → 5652 ms"],"abstaendeGleich":false,"regel":"≤ 1,3× vorher + 0,3  ⟶ Zeitgrenze ≤ 1,3× + 0,3 s<br>ZEIT: a3-nachbau-gleich-2laeufe {"va2":false,"fm":false,"pad":true,"lead":false}  ⟶ Klang-Suche mit Zeitbudget: zwei Läufe unter Last verschieden<br>ZEIT: reg-spk3-test {"ok":14,"von":17,"fehler":["verfeinern-plus-1db","nachbau-abstaende-besser","regression-spk2-test"],"bekanntVerfeinern":["verfeinern-plus-1db","r  ⟶ nachbau-abstaende-besser = Klang-Suche mit Zeitbudget (Wackler)<br>bekannt: a2-verfeinern-plus-1db {"zerlegt":4.37,"verfeinert":4.36,"plus":-0.01,"ziel":"+1","vorher":[3.01,3.53,0.52],"hinweis":"offen (A2): Kamm-Modell selbst mit ideale  ⟶ A29: Verfeinern ≈ 0 statt +1 dB (seit SPK4/4.61)<br>bekannt: reg-spk2-test {"ok":27,"von":30,"fehler":["verfeinern-verbessert","noten-erkannt","verfeinern-nach-noten"],"verfeinernNachNoten":[4.37,4.37],"basisNachNoten":3.  ⟶ A29 + spk2 noten-erkannt rot seit ≤ 4.74 (r4740/r4750/r4760 gleich) |
| spk5 | – | **GRÜN** 24 OK / 0 FEHLER · 47 s · Last 2.4 |  |
| spk5f | – | **GRÜN** 16 OK / 0 FEHLER · 30 s · Last 2.8 |  |
| spk5p | – | **GRÜN** 6 OK / 0 FEHLER · 13 s · Last 3.1 |  |
| spk6 | – | **GRÜN** 26 OK / 0 FEHLER · 31 s · Last 2.9 |  |
| spk6k | – | **GRÜN** 24 OK / 0 FEHLER · 7 s · Last 3.1 |  |
| spk6p | – | **ROT** 11 OK / 1 FEHLER · 321 s · Last 22 | ROT: b2-bloecke-waehrend-rechnung {"ganzeEbeneMs":64396,"bloecke":1155,"maxMs":411,"mittelMs":19.38} |
| spk6u | – | **GRÜN** 12 OK / 0 FEHLER · 45 s · Last 2.5 |  |
| spk7 | – | **GRÜN** 13 OK / 0 FEHLER · 32 s · Last 2.9 |  |
| spk7k | – | **GRÜN** 12 OK / 0 FEHLER · 4 s · Last 3.2 |  |
| spk7p | – | **ROT** 11 OK / 2 FEHLER · 30 s · Last 2.7 | ROT: b5-als-klangkorn-ohne-stillstand {"ms":353,"longtasks":[168],"worker":"worker","quelle10s":{"f0":196,"gesamtMs":114,"longtasks":[]}}<br>ROT:  |
| spk8f | – | **GRÜN** 13 OK / 0 FEHLER · 29 s · Last 3.4 |  |
| spk8s | – | **GRÜN** 14 OK / 0 FEHLER · 21 s · Last 2.7 |  |
| spk9f | – | **GRÜN** 0 OK / 0 FEHLER · 1 s · Last 3.1 |  |
| spk9p | – | **GRÜN** 0 OK / 0 FEHLER · 22 s · Last 2.7 |  |
| spk9poly | – | **GRÜN** 0 OK / 0 FEHLER · 1 s · Last 3.1 |  |
| spk9u | – | **GRÜN** 0 OK / 0 FEHLER · 6 s · Last 3.1 |  |
| spkfix | – | **GRÜN** 11 OK / 0 FEHLER · 18 s · Last 2.9 |  |
| teil1 | – | **ROT** 60 OK / 1 FEHLER · 218 s · Last 23.2 | ROT: 926x428 T1 teile {"n":6,"takte":[0,4,12,20,28,36],"namen":["Intro","Strophe 1","Refrain 1","Strophe 2","Refrain 2","Outro"],"an":1,"segMs":5.9} |
| trp1 | – | **GRÜN** 81 OK / 0 FEHLER · 84 s · Last 5.6 |  |
| voxr1 | – | **UNGÜLTIG (Last)** 78 OK / 5 FEHLER · 75 s · Last 8.1 | ROT: Mehr ▾ offen: Zustandszeile (Befund, Fortschritt, Abbrechen) im Bild, unterer Rand ≤ 926 px – {"top":894,"bottom":937,"h":926}<br>ROT: Touch (CDP) im Streifen über einer Atmer-Marke: leiser → weg, Editor bleibt offen – {"vorher":"leiser","nachher":{"act":"leiser","taps":1,"offen":true}}<br>bekannt: Klicks Take A: ≥ 18 von 20 gefunden (2 Durchgänge) – {"gefunden":17,"d1":24,"d2":3}  ⟶ A14 (17/20)<br>bekannt: Klicks Take B: repariert – keine gefundene Stelle ragt danach mehr als 3 dB aus ihrer Umgebung (Band > 2 kHz) – {"vorherMedian":4.9,"nachherMax":3.2,"fehlerEner  ⟶ A14<br>bekannt: Raumton: Klangfarbe (Oktavbänder 250 Hz–8 kHz) wie der Raumton an der Stelle ± 4 dB – [2.1,4.8,6.3,2.3,6.7]  ⟶ A14 |
| vx1 | – | **GRÜN** 61 OK / 0 FEHLER · 28 s · Last 2.5 |  |
| vx2 | – | **GRÜN** 14 OK / 0 FEHLER · 7 s · Last 3.3 |  |
| vx3 | – | **GRÜN** 15 OK / 0 FEHLER · 5 s · Last 3.3 |  |
| vxr2 | – | **GRÜN** 11 OK / 0 FEHLER · 649 s · Last 36.5 |  |
| vxr2lyr | – | **GRÜN** 5 OK / 0 FEHLER · 3 s · Last 3.1 |  |
| zrl1 | – | **GRÜN** 7 OK / 0 FEHLER · 80 s · Last 7.1 |  |
