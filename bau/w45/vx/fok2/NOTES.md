# FOK2 – Spektral-Fokus „Nur Rest“ genau (Gefundenes tief ausblenden)

Stand: index.html = basis.html (rel-4750, 4.75.0) + Änderungen NUR im vorhandenen Block `/* FOKUS1-BEGIN */ … /* FOKUS1-END */`
(Thema Fokus), Kennung `FOK2` in den Kommentaren. Keine neuen Haken außerhalb, keine Zeile außerhalb des Blocks geändert.
VERSION bleibt '4.75.0'. Diff: 83 Zeilen neu, 10 Zeilen im Block geändert (alle zwischen FOKUS1-BEGIN und FOKUS1-END).

## Verfahren (wie in fokus1/NOTES Befund 2 + 4 als „echter Weg“ beschrieben)
Vorher (4.72–4.75): „Nur Rest“ = Original-Bild × Rest-Anteil der Masken je Basis-Rahmen/Basis-Bin (eine Maske über dem Bild).
Das Bild des Originals enthält aber Fenster-Leckage (Nebenkeulen, Hauptkeule ±2 Bins, zeitliche Verschmierung bei N > Basis-N);
die Maske kann sie nicht entfernen → ausgeblendete Töne nur 15–21 dB unter dem Original, Schatten vor/nach Tönen bei N 16384.

Jetzt (nur „Nur Rest“, nur wo Ebenen wirken):
1. `trueRest(d, I, ci, W, src, ok)` im Fokus-Kern (Worker; Rückfall Hauptfaden gleich):
   - Rahmen-Prüfung: für jeden Basis-Rahmen des Stücks `gainFn(mixOf('rest'))` – Rahmen mit Rest-Anteil ≠ 1 (Ebenen, SPK6-Kopien
     wie beim Abspielen). Spalten, deren Anzeige-Fenster (±N/2) keinen solchen Rahmen berührt, bleiben unberührt (byte-gleich).
   - Rest-Audio = Original minus Ebenen, genau wie Abspielen „Rest“ (render mit Mix 'rest'), aus dem vorhandenen Zwischenspeicher
     `restMid` (ein Eintrag je Dokument-Objekt + Ebenen-Stand, blockweise, nach 90 s ohne Gebrauch frei; auch „Noten finden“ nutzt ihn).
     Nur die Blöcke der betroffenen Spalten, in Scheiben zu 4 Blöcken (Abbruch greift nach ≤ 4 Blöcken).
   - Anzeige-STFT des Rests genau wie `specChunk` der Anzeige: gleiches Hann-Fenster (`spk12Win`), zwei Spalten je komplexer FFT
     (`spk12Fft`, im Worker schon da), gleiche Zeilen-Zuordnung (`rows2` = Nachbau von `rmap`, Max über Zeilenband bzw. Zwischenwert),
     gleiche Byte-Formel. Rest-Byte wird genommen, wenn es ≥ 2 Stufen (≈ 0,9 dB) dunkler als das Original ist, sonst Original-Byte
     → keine Zelle heller als das Original, unberührte Zellen byte-gleich (FFT-Rundung kann sonst ±1 Stufe kippen).
   - In Scheiben (≈ 20 ms, dann `tick`), Abbruch über `ok()` (= gleicher Fokus-Auftrag + gleicher Schlüssel H).
2. `piece(…, TR)`: in betroffenen Spalten ist das Rest-Byte die Bild-Quelle (Ebenen schon genau drin); darauf wie bisher die weiche
   Ausblendung der gefundenen Noten (Teiltöne, Ein-/Ausschwingen, 42 dB), Flanken-Glättung nur für den Noten-Anteil (Gewicht = Leistung
   des Rest-Bilds). Spalten ohne Ebenen-Wirkung: alter Weg unverändert (Noten-only-Fall byte-gleich zu basis, gemessen).
   „übrig ≈ %“: eO aus dem Original-Byte, eR aus dem Ergebnis (wie bisher, jetzt mit dem genauen Rest).
3. Zwischenspeicher: Fokus-Stücke wie bisher (6 Stücke, Schlüssel H mit Ebenen id:ver + Noten). Rest-Audio in `restMid`
   (gemeinsam mit „Noten finden“, ein Ebenen-Stand) → Wechsel der FFT-Größe rechnet das Rest-Audio nicht neu.
4. Zauberstab bei „Nur Rest“ (Prüfung „Stelle ≥ 20 dB leiser → nichts wählen“, wie 4.72): nimmt das Fokus-Stück der Anzeige, wenn es
   im Zwischenspeicher liegt (dann genauer Rest); sonst die schnelle Näherung wie 4.72 – ohne sie zu speichern (gleicher Schlüssel,
   sonst bekäme die Anzeige ein ungenaues Stück). So wird der Zauberstab nicht langsamer.
„Nur Gefundenes“, „Alles“, Klang, Ebenen, Noten, Export, Status-Texte, Bedienung: unverändert.

## Messung (fok2-test.mjs, Chromium 428×926 dpr 2, A/B neu/basis im selben Lauf, Last 2–8 durch andere Agenten)
Tiefe der Ausblendung, dB gegenüber dem Original, „wahr“ = render('rest') als eigenes Dokument zerlegt (Messung des Prüfers m2 a / m2 b):

| Fall | N | basis (4.75) | FOK2 | wahrer Rest |
|---|---|---|---|---|
| Kamm-Maske 220 Hz (8 TT), Haltephase | 16384 | −21,4 | −34,8 | −34,8 |
| Kamm-Maske 220 Hz, Haltephase | 4096 | −17,0 | −32,4 | −32,4 |
| Kamm-Maske 220 Hz, Haltephase | 1024 | −13,8 | −31,9 | −32,0 |
| Kamm-Maske 65 Hz (3 TT) | 16384 / 4096 / 1024 | −18,7 / −18,6 / −18,2 | −24,3 / −24,4 / −26,3 | −24,3 / −24,4 / −26,3 |
| Schatten VOR Ton (1,80–1,97 s) | 16384 | −7,4 | −25,6 | −25,6 |
| Schatten NACH Ton (6,03–6,20 s) | 16384 | −15,6 | −25,8 | −25,8 |
| Rechteck-Ebene über Ton A, Halten | 16384 / 4096 | −311,8 / −321,6 (zu tief: „schwarz“) | −98,2 / −80,4 | −98,2 / −80,4 |
| Rechteck, vor / nach A | 16384 | −24,0 / −1,4 | −26,6 / −33,5 | −26,6 / −33,4 |
| Rechteck 50–80 Hz über 65-Hz-Ton | 16384 / 4096 | −38,7 / −38,4 | −72,7 / −67,4 | −72,7 / −67,4 |
| Ton B frei (keine Ebene) | beide | ±0 | ±0 | ±0 |
| außerhalb (0–1 s) | alle | byte-gleich | byte-gleich (0 Abweichungen) | – |
| nur Noten, keine Ebene (Rest + Gefundenes) | 16384 / 4096 | Hash | gleicher Hash wie basis | – |

Ziel „≤ 3 dB Abstand zum wahren Rest“: erreicht, in allen Fällen ≤ 0,1 dB. Sonderfall Kamm N 4096 vor/nach: der wahre Rest ist dort
+19/+20 dB HELLER als das Original (Masken-Artefakt: Rahmen vor dem Spur-Beginn behalten die Einschwing-Fetzen) – die Anzeige zeigt
bewusst nie Helleres als das Original (wie FOKUS1), also 0 dB; das Testkriterium vergleicht deshalb mit min(wahr, 0).

Zeit (Worker-ms für den ganzen Fokus-Satz; Median aus 3 Läufen, abwechselnd; Ebene 200–1200 Hz über fast die ganze Länge = schlimmster
Fall, jede Spalte betroffen; N 4096 zuerst, N 16384 danach mit vorhandenem Rest-Audio):

| | basis | FOK2 v2 | Bemerkung |
|---|---|---|---|
| 20 s, N 4096 (2 Stücke) | 178 ms (erstes Stück 115) | 918 ms (erstes 668) | Rest-Audio + FFT |
| 20 s, N 16384 (1 Stück) | 378 ms | 809 ms | |
| 3 min, N 4096 (16 Stücke) | 1096 ms (erstes 127), 69 ms/Stück | 6542 ms (erstes 512), 409 ms/Stück | davon ≈ 70 % Rest-Audio (render) |
| 3 min, N 16384 (4 Stücke) | 3358 ms (erstes 852) | 5673 ms (erstes 1533) | Rest-Audio schon im Speicher |
| Long Tasks Hauptfaden (alle Läufe) | 0 | 0 | Rechnen im Worker, Scheiben ≈ 20 ms |

v1 (Verhältnis |Rest|/|Original|, eine FFT je Spalte, ohne restMid) war gleich genau, aber 3 min N 4096 7,7 s, N 16384 10,4 s (erstes
Stück 3,0 s) → verworfen zugunsten v2. Kosten-Aufteilung je Stück N 4096: FFT 512 × 0,13 ms ≈ 70 ms (spk12Fft, gemessen in Node),
alter Fokus-Rechenweg ≈ 50 ms, Rest der Zeit = Rest-Audio (Basis-STFT/ISTFT je Block, wie beim Abspielen).
Speicher: Rest-Audio Float32 je Dokument-Länge (3 min ≈ 32 MB, 10 min ≈ 106 MB) im Worker, frei 90 s nach letztem Gebrauch (gleicher
Speicher wie „Noten finden“ auf dem Rest, wird geteilt). Je Stück vorübergehend 1 MB (Rest-Bytes). Fokus-Stücke und Texturen wie bisher.
Abbruch: fokusStop während eines Satzes → Antwort 'abgeloest' (gemessen in fok2-test, Zeile „abbruch“).

Bewertung „tragbar“: ja für Xanders Ablauf (Rechnen im Worker, sichtbare Stücke zuerst, Hauptfaden ohne Long Task, abbrechbar,
Zwischenspeicher je Dokument-Stand). Preis: das erste sichtbare Stück kommt bei einer Ebene über dem ganzen Lied ≈ 0,4 s später
(N 4096) bzw. ≈ 0,7–2 s später (N 16384, großes Stück 47 s), der ganze Satz 3 min dauert ≈ 6 s statt ≈ 1 s. Bis dahin zeigt die
Anzeige wie bisher das Original bzw. den alten Fokus-Satz. Nur Spalten mit Ebenen-Wirkung kosten (kleine Ebenen = kaum Mehrkosten,
Kamm-Fall 8 s: 207 statt 69 ms).

## Haken-Liste
Keine neuen Haken. Alle Änderungen im FOKUS1-Block (Kommentar FOK2):
- neu: `FK2`, `RM2`, `rows2()`, `trueRest()` (vor `piece`)
- `piece(…, TR)`: Parameter TR, `SB` (Bild-Quelle Rest-Byte), Spalten-Weiche `tc`, Noten-Glättung auf dem Rest-Bild, `sb` in der Byte-Formel
- `ops.fokus`: `trueRest` vor `piece` (nur Modus 'rest'), Abbruch → stop wie bisher
- `ops.spk12zauber` (Fokus-Prüfung): Stück aus dem Zwischenspeicher oder Näherung ohne Speichern
Die drei Kern-Haken aus FOKUS1 (spk1DspMake, spk1Call, spk8WUrl) und die fünf Anzeige-Haken sind unverändert.

## Regression (Endfassung, siehe reg2/*.log)
siehe Bericht / LOG.md (Ergebnisse je Test mit Uhrzeit und Last).

## Offenes
- Erstes Stück bei N 16384 und Ebenen über das ganze Lied 0,7–2 s statt 0,4–0,9 s. Profi-Weg für später: erst das sichtbare
  Spaltenfenster (statt ganzes 1024er-Stück) rechnen, oder Rest-Audio nach jeder Ebenen-Änderung im Leerlauf vorab rechnen.
- Rest-Audio-Speicher wächst mit der Lied-Länge (Float32 voll); bei sehr langen Liedern (> 10 min) wäre ein Block-LRU sparsamer.
- Masken-Artefakte (wahrer Rest heller als Original, z. B. vor dem Beginn einer Kamm-Spur bei N 4096) werden bewusst nicht gezeigt.
- Zauberstab-Prüfung nutzt den genauen Rest nur, wenn das Stück gerade angezeigt (im Zwischenspeicher) ist – sonst Näherung wie 4.72.
- Die Regressionstests spk12/spk6/spk5/spkfix/fokus1-kern schreiben ihre Ergebnis-Dateien (json/fotos) in ihre eigenen Ordner
  (so vom Auftrag aufgerufen); fokus1-test und zrl1-test liefen als Kopie in reg2/.
