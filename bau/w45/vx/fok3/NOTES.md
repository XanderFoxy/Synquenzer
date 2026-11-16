# FOK3 – „Nur Rest“: erst die Näherung sofort, dann genau nachreichen

Endfassung v4 md5 edfc49a6f7eb2900337e2b9e2408ba3f. Stand: index.html = basis.html (rel-4760, 4.76.0 = FOK2 v6) + Änderungen NUR im Block `/* FOKUS1-BEGIN */ … /* FOKUS1-END */`, Kennung `FOK3`.
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
