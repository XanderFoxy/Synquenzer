# FOK3 – „Nur Rest“: erst die Näherung sofort, dann genau nachreichen

Stand: index.html = basis.html (rel-4760, 4.76.0 = FOK2 v6) + Änderungen NUR im Block `/* FOKUS1-BEGIN */ … /* FOKUS1-END */`, Kennung `FOK3`.
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
   je Aufruf EIN Stück genau (`vorab: 0`), das nächste wird jedes Mal neu gewählt: sichtbare zuerst, dann nach Abstand zum Bild.
4. Austausch: gleiche Stelle im Satz, die alte Textur (Näherung) bleibt, bis die genaue oben ist (vorhandener `old`-Weg) → kein Leerbild, gleiche
   Größe/Lage. Eine Näherung legt sich nie über ein genaues Stück desselben Stands (gleicher Schlüssel H).
5. Status: In der Statuszeile steht während des Nachreichens „Fokus · genauer · xx %“ (vorher „Fokus · xx %“), danach wie bisher
   „Fokus: Rest · … übrig ≈ …“ (Energie aus den genauen Stücken). Sonst nichts Neues sichtbar.
6. Abbruch/Ablösung: Fokus-Wechsel, FFT-Wechsel, Dokument, Ebenen-Änderung, ↶ → neuer Auftrag (seq) wie bisher; Antworten alter Aufträge werden
   verworfen (seq-Prüfung je Stück), der Kern bricht über d.fkTok/Schlüssel ab. Rollen/Zoomen: fokus1Pre prüft je Bild – läuft ein unsichtbares
   Stück, während sichtbare noch genähert sind → `fokusStop`, der zweite Durchgang wählt neu (Rest-Audio bleibt im Kern-Speicher).
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
