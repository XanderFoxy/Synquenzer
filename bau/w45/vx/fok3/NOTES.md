# FOK3 – „Nur Rest“: erst die Näherung sofort, dann genau nachreichen

Endfassung v6 (nach Prüfung, FOK3-P) md5 a6b259187c1036bd0bc780dd78397bca – siehe Abschnitt „Nachbesserung nach Prüfung“ unten. Vorher v4 md5 edfc49a6f7eb2900337e2b9e2408ba3f (Sicherung index.vor-pruef.html). Stand: index.html = basis.html (rel-4760, 4.76.0 = FOK2 v6) + Änderungen NUR im Block `/* FOKUS1-BEGIN */ … /* FOKUS1-END */`, Kennung `FOK3`.
Keine neuen Haken außerhalb, keine Zeile außerhalb des Blocks geändert. VERSION bleibt '4.76.0'. Zwischenstand v1: index.v1.html.
Anlass: Xander 16.11. „Wenn es hilfreich ist, entscheide selber.“ – Entscheidung Lead: „Nur Rest“ soll sofort ein Bild zeigen.

## Verfahren
Kern (Worker, Rückfall Hauptfaden gleich):
1. `ops.fokus` bekommt `vorab` (nur „Nur Rest“). Vor dem Satz schätzt `fk3Est` die Kosten des GENAUEN Wegs für die Stücke from…to, die nicht im
   Fokus-Zwischenspeicher liegen – ohne zu rechnen:
   - Masken-Streifen (128 Basis-Rahmen) mit Inhalt: `fk3Sig` = je Streifen eine billige Kennung über alle Ebenen (Reihenfolge, SPK6-Kopie-Kennung,
     Kachel-Köpfe h, Kennung der Kachel-Felder t über eine WeakMap). Beim Rest-Audio-Stand (rsSync) wird sie als `RS.sg` gemerkt.
   - Neu zu rechnende Rest-Audio-Blöcke = Blöcke um Streifen mit Inhalt, die nicht fertig sind oder deren Streifen sich seit `RS.sg` geändert hat
     (kein Rest-Audio dieses Dokuments im Speicher → alle).
   - FFT-Spalten = Spalten der Stücke mit Ebenen-Wirkung ohne gültiges Rest-Bild (`RS.tr`).
   - Kosten = Blöcke × FK3.cB + Spalten × FK3.cC × (N/4096)^1,4. cB/cC werden beim echten Rechnen laufend gemessen (restMid je Block, trueRest je
     Spalte; Startwerte aus FOK2: 7 ms/Block, 0,068 ms/Spalte bei N 4096).
   - Teuer = Summe > 300 ms ODER > 60 s Rest-Audio neu. Dann bekommt jedes Stück, das selbst > 40 ms kostet, sofort die Näherung
     (`piece(…, null)` = Masken-Weg wie 4.72–4.75, Antwort-Stück mit `ap: 1`), NICHT im Zwischenspeicher (C bleibt „genau“ – Zauberstab und
     „Noten finden“ sehen nie die Näherung). Billige Stücke (Rest-Bild/-Audio schon da, keine Ebene) kommen direkt genau – so wird ein schon genaues
     Bild nach einer örtlichen Änderung nie vorübergehend schlechter.
   - Sonst (klein/kurz): direkt genau wie FOK2 v6, kein Zwischenbild.
2. Der genaue Weg (`trueRest` + `piece`) ist unverändert → genaue Stücke byte-gleich mit v6.

Anzeige (fokus1Load, fokus1Pre, im Block):
3. Erster Durchgang wie bisher (sichtbare Stücke zuerst, dann rechts, dann links), mit `vorab`. Kommen Stücke mit `ap`, folgt der zweite Durchgang:
   EIN Kern-Auftrag mit `list` = alle genäherten Stücke in Reihenfolge (sichtbare zuerst, dann nach Abstand zum Bild), `vorab: 0`. Der Kern rechnet
   sie nacheinander wie FOK2 (Scheiben, ok()-Abbruch). v2 hatte je Stück einen Auftrag – unter Last wartete jedes Stück auf den Hauptfaden
   (↶-Fall 2,8 s statt 1,6 s), darum v3 ein Auftrag.
4. Austausch: gleiche Stelle im Satz, die alte Textur (Näherung) bleibt, bis die genaue oben ist (vorhandener `old`-Weg) → kein Leerbild, gleiche
   Größe/Lage. Eine Näherung legt sich nie über ein genaues Stück desselben Stands (gleicher Schlüssel H).
5. Status: In der Statuszeile steht während des Nachreichens „Fokus · genauer · xx %“ (vorher „Fokus · xx %“), danach wie bisher
   „Fokus: Rest · … übrig ≈ …“ (Energie aus den genauen Stücken). Sonst nichts Neues sichtbar.
6. Abbruch/Ablösung: Fokus-Wechsel, FFT-Wechsel, Dokument, Ebenen-Änderung, ↶ → neuer Auftrag (seq) wie bisher; Antworten alter Aufträge werden
   verworfen (seq-Prüfung je Stück), der Kern bricht über d.fkTok/Schlüssel ab. Rollen/Zoomen: fokus1Pre prüft je Bild (höchstens alle 250 ms) – ist
   das Stück in Arbeit (erstes noch genähertes der Liste) unsichtbar und sind sichtbare noch genähert → `fokusStop`, der zweite Durchgang plant neu
   (Rest-Audio und Rest-Bilder bleiben im Kern-Speicher, verloren ist höchstens die FFT des laufenden Stücks).
   „noch aktuell“ gilt erst, wenn kein Stück mehr genähert ist; `idle()` erst nach dem zweiten Durchgang.
7. Test-Zugang: `info()` + `ap` (genäherte Stücke), `gn` (Nachreichen läuft), `gk` (Stück in Arbeit); `chunks()` + `ap`.

## Haken-Liste
Keine neuen Haken. Im FOKUS1-Block (Kommentar FOK3): neu `FK3`, `fk3Sig`, `fk3Est`; `trueRest` (Zeitmessung je Spalte), `ops.fokus` (vorab,
Näherung je Stück, `ap` im Stück, `vorab`/`est` in der Antwort), `rsSync` (`RS.sg`), `restMid` (Zeitmessung je Block), `fokus1Load`
(onChunk, zweiter Durchgang), `fokus1Pre` (Rollen/Zoomen → neu planen), `FOKUS1_API.info/chunks`.

## Messung (fok3-test.mjs über die Anzeige, Chromium 428×926 dpr 2, A/B neu/basis(=4.76.0=v6) im selben Lauf; Last 3–8 durch andere Agenten
## und eigene Regressionsketten; „erstes Bild“ = erstes neues Fokus-Stück mit Textur, „genau“ = idle, alle Texturen, keine Näherung mehr)
Lauf 2 (v2, Last 2,5–5,5) – ms:

| Fall | v6 erstes Bild | FOK3 erstes Bild | v6 genau | FOK3 genau | Näherung (Stücke) |
|---|---|---|---|---|---|
| 20 s, Ebene über alles, N 4096 | 582 | 299 | 741 | 917 | 2 |
| Kamm 8 s, N 16384 | 316 | 285 | 316 | 285 | 0 (direkt genau) |
| Kamm 8 s, N 4096 (FFT-Wechsel) | 308 | 278 | 308 | 278 | 0 |
| 3 min STEREO, Ebene über alles | 687 | 394 | 6262 | 7658 | 15 |
| 3 min mono, Ebene über alles | 860 | 257 | 6635 | 6406 | 15 |
| 3 min mono, örtliche Ebene 60–70 s | 187 | 180 | 1885 | 1813 | 3 |
| 3 min mono, ↶ | 172 | 293 | 1594 | 2827 (v2, je Stück ein Auftrag) | 3 |

Hashes Endbild (alle 10 Fälle, auch Abbruch-Fälle) gleich v6 – Lauf 2 und Lauf 3.

fok3-zeit Lauf 1 (s20 + 3 min mono, neu / v6 / 4.75, Last ≈ 5): erstes Bild s20 345 / 598 / 261 ms, m1 235 / 574 / 683 ms;
genau s20 1036 / 664 / (4.75 Näherung fertig 312), m1 5683 / 5829 / (3016). Das erste Bild liegt damit auf dem Niveau des alten Näherungswegs
(Streuung ±100 ms durch Textur-Hochladen und 90-ms-Neuzeichnen-Drossel), deutlich vor v6. „Genau fertig“ ≈ v6 + Näherungs-Durchgang
(3 min: ≈ 0,5–1,4 s mehr unter Last; s20 ≈ +0,3 s), weil der Kern zuerst alle teuren Stücke nähert und dann genau rechnet (ein Worker).

## Prüfung / Tests (Kopien im Paketordner, Logs: fok3-lauf2/3/4.log, reg/*.log, smoke.log)
- fok3-test (A/B v6): alle 10 Endbild-Hashes gleich v6 (20 s, Kamm 16384, Kamm 4096 nach FFT-Wechsel, 3 min stereo, 3 min mono, örtliche Ebene,
  ↶, Rollen + Fokus-Wechsel während des Nachreichens, ↶ während des Nachreichens, Zauberstab während der Näherung); ↶ = erster Satz; ↶ während
  Nachreichen = Stand davor. Kleine Fälle (Kamm) ohne Zwischenbild; örtliche Änderung nähert nur die 3 betroffenen Stücke. Zauberstab während
  der Näherung: Fokus-Prüfung auf dem genauen Weg (46,6 dB → nichts wählen, wie v6). Konsole 0 Fehler (neu und basis).
- Hauptfaden: kein Bild/fokus1Pre in JS > 50 ms (gemessen ≤ 13 ms). Long Tasks > 50 ms gibt es in beiden Fassungen außerhalb von JS (Textur-
  Hochladen mit Mipmaps in der Software-Grafik des Test-Chromiums, s. FOKUS1-Notizen; am iPhone 1–2 ms je Textur). FOK3 lädt sichtbare Stücke
  zweimal hoch (Näherung, dann genau) → in dieser Umgebung mehr solcher Long Tasks als v6 (Lauf 2: s20 1/0, stereo 19/8, m1 5/11, m2 9/10).
- Worker-Antwort (fokusKey alle 40 ms) während des Nachreichens: Median 8–20 ms, P95 120–155 ms – wie v6 (Median 15–19, P95 133–152).
- Regression (Kopien in reg/): fokus1-kern 26/0 (v2 und v3), fok2-test LANG=0 16/0 (alle Tiefen wie v6), spk5 24/0, spk12 98/0, spk12-2 71/1, spk12-3 45/2 –
  spk12-3 (Long Tasks der SPK12-Werkzeuge unter Last 6–8, kein Fokus), spk6 25/2 (UI alles OK; „kern-messwerte-teil1“ liest spk6-kern-test.json
  neben index.html – Eingabedatei eines anderen Pakets, hier nicht vorhanden), spkfix ALLES OK 11 (sonde braucht spk7/lib.mjs, kopiert),
  fokus1-test (LONG=0 CPU=0) 43/5 – alle 5 Long Tasks unter Last 8, auch in „Alles“/„Gefundenes“ (FOK3 wirkt dort nicht).
- Pflicht: topdefs doppelt 0 / Syntaxfehler 0; dupkeys 0; smoke errors []; „MS 2000“ 1×; „  live: true,“ 1×; VERSION '4.76.0'.
- Diff (fok3.diff, v4): 101 Zeilen neu, 23 geändert, 21 Abschnitte, alle zwischen FOKUS1-BEGIN und FOKUS1-END.

## Offen
- Long Tasks in der Test-Grafik: zweimaliges Hochladen sichtbarer Stücke (Näherung + genau). Falls das am Gerät stört (nicht erwartet, 1–2 ms):
  Näherungs-Textur ohne Mipmaps oder texSubImage2D in die vorhandene Textur – nicht gebaut (Aussehen beim Herauszoomen).
- „Genau fertig“ ≈ v6 + Näherungs-Durchgang. Profi-Weg: zweiter Worker für die Näherung (parallel) oder Näherung nur für sichtbare Stücke und
  unsichtbare erst beim Rollen – nicht gebaut.
- Schätzung: Kosten je Block/Spalte werden gemessen; Masken-Änderungen ohne neues Kachel-Feld (in-place) würden als „unverändert“ geschätzt →
  dann kommt das Stück direkt genau (wie v6), nie ein falsches Bild.
- Statuszeile: während des Nachreichens „Fokus · genauer · xx %“ (neues Wort „genauer“ in der vorhandenen Fortschrittsanzeige) – bitte abnicken.

## Endfassung v4 (md5 edfc49a6f7eb2900337e2b9e2408ba3f) – fok3-test Lauf 4: 28 OK / 0 FEHLER (Last 4,8–7,7)
| Fall | v6 erstes Bild | FOK3 erstes Bild | v6 genau | FOK3 genau | genähert | Hash |
|---|---|---|---|---|---|---|
| 20 s, Ebene über alles | 591 | 477 | 682 | 1589 | 2 | gleich |
| Kamm 8 s N 16384 / N 4096 | 294 / 311 | 492 / 246 | 294 / 311 | 492 / 246 | 0 | gleich |
| 3 min stereo | 579 | 280 | 5427 | 6497 | 15 | gleich |
| 3 min mono | 568 | 280 | 5380 | 7421 | 15 | gleich |
| örtliche Ebene 60–70 s | 192 | 167 | 1501 | 1693 | 3 | gleich |
| ↶ | 171 | 161 | 1430 | 1517 | 3 | gleich (= erster Satz) |
| Rollen + Fokus-Wechsel beim Nachreichen | 602 | 251 | 5476 | 6592 | 16 | gleich; neu geplant: Stück 12 (sichtbar) statt 0 |
| ↶ während Nachreichen | 643 | 355 | 2523 | 2798 | 16 | gleich (= Stand davor) |
| Zauberstab während Näherung | – | – | – | – | 16 | gleich; Prüfung genau (46,6 dB, 188 ms) |
Long Tasks > 50 ms neu/v6 (alle außerhalb JS): s20 5/1, st 12/0, m1 22/10, m2 5/2, m3 2/1, m4 8/2, m5 4/1, m6 2/2. Worker-Antwort m1 Median 15,8 /
P95 141 ms (v6 16,8 / 136), stereo 20,3 / 155 (v6 20,4 / 149).

## Nachbesserung nach Prüfung (FOK3-P) – Endfassung v6 md5 a6b259187c1036bd0bc780dd78397bca
Sicherung vorher: index.vor-pruef.html (= v4 edfc49a6…). Zwischenstand v5 (nur Befund 1 + eigener Befund): index.v5.html. Alle Änderungen im FOKUS1-Block,
Kennung „FOK3-P“; keine neuen Haken, vor/nach dem Block byte-gleich mit basis.html. VERSION '4.76.0'. Skripte: fix-p.py (v5), fix-p2.py (v6).

### Befunde nachgeprüft und behoben
1. (mittel) Grenze `guard < 40` beim Neu-Planen – BESTÄTIGT (Code + Prüfer-Logs: p2-kipp16384 37 Neu-Planungen in 30 s ohne ein genaues Stück; p2-g3 mit
   erschöpfter Grenze: Näherung bleibt, idle() true, Status „fertig“, Hash falsch). Ursache: jede Ablösung verwirft das Stück in Arbeit; beim Hin-und-Her
   trifft es immer das gerade begonnene. Behoben:
   - jedes Stück wird je Satz höchstens EINMAL abgelöst (`F.rpX`) → Fortschritt garantiert, spätestens nach nC + 1 Durchgängen fertig;
   - Sicherung: ab Durchgang nC + 2 kein Ablösen mehr (`F.noRp`); Schleifengrenze 2·nC + 8 (wird nie erreicht);
   - nie „fertig“ melden, solange eine Näherung oder ein übersprungenes Stück steht: stattdessen neu laden (höchstens 2× hintereinander, `F.rl`).
   Test fok3p-test P1 (3 min, N 16384, 12 s lang alle 270 ms Anfang ↔ Ende, Ansicht 10 s): v6 Lauf 3 (Last 9–14) 3 Listen-Aufträge, 2 Ablösungen,
   alle 4 Stücke genau nach 9,6 s – noch während des Rollens; Lauf 1 (v5, Last 12) 4 / 3 / 9,9 s; Lauf 2 (Last 21) 4 / 3, nach dem Rollen fertig.
   v4 (Prüfer, Last 17): 37 Aufträge in 30 s ohne Fortschritt. Endhash bd0a615d = v6, kein veraltetes Stück gezeichnet, Status Endergebnis.
2. (klein) „genau fertig“ später als v6, erstes Bild 20 s 1,4–1,5× des alten Wegs – TEILS umgesetzt (Vorschlag des Prüfers): nur der SICHTBARE Teil wird
   genähert; unsichtbare teure Stücke überspringt der Kern im ersten Durchgang (`vorab: 2` → `skip`) und die Anzeige holt sie im zweiten Durchgang direkt
   genau (nach Abstand zum Bild, sichtbare zuerst). Unsichtbare Stücke zeigen bis dahin, was sie vorher zeigten (wie v6), nie ein Leerbild.
   Wirkt nur bei hineingezoomter Ansicht – in der Standardansicht ist das ganze Lied sichtbar, dann werden wie in v4 alle teuren Stücke genähert.
   A/B fok3-zeit RUNS=2 abwechselnd (Last 9–12, ms): siehe Messung unten – erstes Bild 20 s jetzt 0,9× von 4.75 (die 1,4–1,5× des Prüfers liegen in der
   Streuung ±100 ms durch Textur-Hochladen und die 90-ms-Neuzeichnen-Drossel); „genau fertig“ in der Standardansicht weiter ≈ v6 + Näherungs-Durchgang.
3. (klein) Wort „genauer“ in der Statuszeile nicht abgenickt – BESTÄTIGT, Code unverändert: bitte im Funk vorschlagen („Nur Rest zeigt sofort ein
   ungefähres Bild, das sich dann schärft; solange steht ‚Fokus · genauer · xx %‘“). Lehnt Xander ab: eine Zeile in fokus1Load/onChunk (Text ohne „genauer“).
4. (klein) Pflichtbefehl dupkeys bricht ohne NODE_PATH ab – BESTÄTIGT (Umgebung, nicht Code). Pflicht hier mit NODE_PATH=/opt/node-tools/node_modules;
   bitte Pflichtliste ergänzen.
5. EIGENER Befund beim Nachprüfen von 1 (schon in v6/4.76.0): Wird ein Satz abgebrochen (Ebene ändern → während des Neu-Rechnens „Alles“ → wieder „Nur Rest“),
   galt der halbe Satz als „noch aktuell“ (F.sig wird schon beim Start gesetzt, alte Stücke desselben Modus liegen noch am Satz) → das ALTE Bild blieb als
   „fertig“ stehen. Nachweis fok3p P2 (3 min mono, örtliche Ebene 60–70 s / 2000–2600 Hz): v6 45d36813 (= Bild vor der Ebene) statt 59ae0369 (frischer
   Satz), in Lauf 2 und 3. Behoben: `S.ok` = Kennung eines ABGESCHLOSSENEN Satzes; nur dann gilt der Satz als „noch aktuell“. Neu: 59ae0369 = frischer Satz.

### Messung vorher/nachher (fok3-zeit A/B, RUNS=2 abwechselnd, Last 9–12, Kette A lief parallel; ms je Lauf)
| Fall | v6-FOK3-P (neu) | v4 (vor Prüfung) | 4.76.0 = FOK2 v6 | 4.75 (alte Näherung) |
|---|---|---|---|---|
| 3 min mono, erstes Bild | 383 / 332 | 325 / 416 | 1069 / 812 | 535 / 426 |
| 20 s, erstes Bild | 372 / 406 | 354 / 868 | 770 / 922 | 404 / 466 |
| 3 min mono, genau fertig | 12161 / 7917 | 10283 / 8029 | 7932 / 8161 | (Näherung 2943 / 1625) |
| 20 s, genau fertig | 1631 / 1355 | 1574 / 1980 | 1068 / 1188 | – |
| Worker-Antwort P95 (3 min) | 117 / 164 | 115 / 160 | 121 / 173 | – |
Hashes in allen Läufen gleich v6 (s20 bcbde967, m1 45d36813). „Genau fertig“ streut unter Last stark (neu Lauf 1 12,2 s, Lauf 2 7,9 s); kein
systematischer Unterschied zwischen v4 und v6-FOK3-P.

### Prüfung (Tests als Kopien im Paketordner; Logs fok3-lauf6.log, fok3p-lauf1–3.log, fok3-zeit-p.log, reg5/*.log, smoke5.log)
- fok3p-test.mjs (NEU, Befund 1 + eigener Befund): v6 Lauf 3 8 OK / 0 FEHLER (Lauf 2 unter Last 21: 7/1 – die damalige Prüfung „alle genau noch während
  des Rollens“ war lastabhängig, jetzt „mindestens ein Stück genau während des Rollens“; v4 hätte 0).
- fok3-test.mjs (m6 prüft jetzt die Näherung beim Tippen `ap0`, sonst unverändert): siehe Endlauf unten.
- Regression (reg5/, Kopien): fok2-test LANG=0 16/0; spk5 24/0; spk12 98/0; spk12-3 47/0; spkfix ALLES OK 11; smoke errors []; spk12-2 69/3 (nur Long
  Tasks der SPK12-Werkzeuge unter Last 12, wie v4 71/1); spk6 1 FEHLER „kern-messwerte-teil1“ (Eingabedatei eines anderen Pakets fehlt, wie v4);
  fokus1-kern siehe unten.
