# FOKUS1 LOG
11:45 Paket angelegt (basis.html, index.html = rel-4710, mess kopiert)
11:52 Kern-Block FOKUS1 + 3 Haken eingesetzt (Sicherung index.vor-kern.html)
11:56 Überlappung relativ zur kürzeren Note (Sicherung index.vor-ueberlappung.html)
11:57 Kern-Test kurz: 24 OK / 0 FEHLER
11:57 Kern-Test voll: 26 OK / 0 FEHLER (3 min: 16 Stücke, 25–32 ms je Stück im Worker, 0 Long Tasks)
11:58 Rückfall Hauptfaden: 24 OK / 0 FEHLER (fokus 2 Stücke 77 ms). Pflicht: topdefs 0/0, dupkeys 0, smoke errors [], MS 2000 = 1, live = 1, diff: 4 Einfüge-Stellen, 0 gelöschte Zeilen
11:58 Kern-Test voll erneut: 26 OK / 0 FEHLER (kern-test-voll.log, fokus1-kern-ergebnis.json). NOTES.md geschrieben. Kern-Teil fertig.
12:04 Anzeige-Teil begonnen (Sicherung index.vor-ui.html)
12:15 Anzeige eingebaut (Haken: spk1Frame Pre/Post, spk1Layers, spk1ViewDd, spk1SpecFree); Zauberstab-Sperre im Kern; Test fokus1-test.mjs
12:26 Hochladen: höchstens 2 Texturen je Bild, bei langsamer Grafik Abstand (adaptiv), Neuzeichnen beim Streamen gedrosselt (90 ms); Sicherungen index.vor-ui2/-drossel/-abstand.html
12:28 Nur Gefundenes: Tönung erst, wenn alle Stücke da sind (Long Tasks 8 → 0); Sicherung index.vor-toenung.html
12:31 Endstand: fokus1-test 51/0, Kern 26/0, Hauptfaden 24/0, Pflicht grün (topdefs 0/0, dupkeys 0, smoke [], MS 2000 1, live 1, Diff nur Einfügungen). fokus1-block.js aktualisiert.
12:34 Prüfung iPhone gestartet (pruef-iphone/pruef.mjs, dpr 3)
12:37 UI-Stufe: Status-Fehler Rest→Alles→Rest nachgestellt (ergebnis-ui.json)
12:37 krist: 2 Runden ok (B, dann C; nichts doppelt, 1 Phantom verworfen)
12:40 lang/lt: Speicher +18 MB GPU/+13,6 MB Daten, frei nach 20 s; erstes Umschalten 3 min: 4 Long Tasks 51-62 ms (außerhalb JS), Wiederholung 0
12:45 Prüfung iPhone fertig: Befunde in NOTES.md (Abschnitt Prüfung iPhone/Bedienung), Fotos pruef-iphone/fotos
13:00 Prüfung Regression+Regeln (pruef-regress/, Logs pruef/): Diff nur 8 Haken + Block, Pflicht grün, spk1/6k/6/6u/12/12b/12c/11/11b wie r4710 (spk6/6u erster Lauf 'Target crashed' = Umgebung, Wiederholung grün); Nebenprodukte der Tests aus fotos/ nach pruef/nebenprodukte/ verschoben
13:00 Fix-Runde gestartet (Befunde der drei Prüfer)
13:04 Sicherung index.vor-fix.html
13:07 Fixes eingesetzt: Kern (Kennung je Dokument, Zeilen-Gewichtung, Zeit-Mittel N>4096, Energie nach Zeilenbreite), Anzeige (Status am Satz, Texte, 1 Textur/Bild, Liedwechsel → Alles)
13:13 Platte voll (Seite stürzt auch mit basis.html ab) → alte Sicherungen gepackt (*.html.gz)
13:13 Platte voll (auch basis.html stürzt ab): index.vor-kern.html (= basis.html) und Prüfer-Kopie pruef-iphone/exp/index.html und index.vor-ueberlappung.html gelöscht; Tests mit TMPDIR=/dev/shm/fk1tmp (Browser-Profil im RAM)
13:16 Glätten (Frequenz, Leistung des Originalbilds ±2,5 Bins) + Rahmen-Mittel N>4096; m2 a/b nachgemessen
