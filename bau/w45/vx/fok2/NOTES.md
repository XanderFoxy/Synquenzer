# FOK2 – Spektral-Fokus „Nur Rest“ genau (Gefundenes tief ausblenden)

**Stand nach Prüfung (16.11., 00:20–00:45 UTC): Endfassung v6 md5 74cc722a2d6e8d63f0700f17e81046a4 – siehe Abschnitt „Prüfung“ unten.**

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
3b. Stereo (v4): `restMid` rendert bei mehreren Kanälen nur die Mitte. Der Mix 'rest' ist linear und je Kanal gleich (gleiche Gewinne je
   Bin, keine SPK6-Effekte – s6.block gibt für 'rest' null) → Rest der Mitte = Mitte der Rest-Kanäle. d.mid wird als ein „Kanal“
   gerendert (smp teilt durch 32768, Ergebnis × 32768 – Zweierpotenz, exakt), mit eigenem Block-Speicher (kein Schlüssel-Konflikt mit dem
   Abspielen). Halbe Arbeit für Anzeige UND „Noten finden“ auf dem Rest; Mono unverändert. Geprüft: fok2-stereo-noten.mjs – gleiche Noten
   wie basis (2 Noten, gleiche Zeiten/Sicherheit), 549 statt 757 ms.
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

Zeit (Worker-ms für den ganzen Fokus-Satz; Median aus 3 Läufen, abwechselnd neu/basis; Ebene 200–1200 Hz über fast die ganze Länge =
schlimmster Fall, jede Spalte betroffen; N 4096 zuerst, N 16384 danach mit vorhandenem Rest-Audio; Endfassung, Last 2,7–3,9):

| | basis | FOK2 | Bemerkung |
|---|---|---|---|
| 20 s, N 4096 (2 Stücke) | 132 ms (erstes Stück 95) | 606 ms (erstes 386) | Rest-Audio + FFT |
| 20 s, N 16384 (1 Stück) | 293 ms | 548 ms | |
| 3 min, N 4096 (16 Stücke) | 794 ms (erstes 86), 50 ms/Stück | 5166 ms (erstes 410), 323 ms/Stück | davon ≈ 2/3 Rest-Audio (render) |
| 3 min, N 16384 (4 Stücke) | 2727 ms (erstes 730) | 4663 ms (erstes 1256) | Rest-Audio schon im Speicher |
| Kamm-Fall 8 s (Ebene nur 4 s, schmal), N 16384 / 4096 / 1024 | 51 / 91 / 144 ms | 148 / 143 / 178 ms | nur betroffene Spalten |
| Long Tasks Hauptfaden (alle Läufe) | 0 | 0 | Rechnen im Worker, Scheiben ≈ 20 ms |
| Abbruch (fokusStop mitten im Satz, 3 min) | 37 ms | 13 ms bis zur Antwort 'abgeloest' | Scheiben + ok() |
| 3 min STEREO, N 4096 (2 Läufe) – v3 (je Kanal) | 807 ms (erstes 85) | 7842 ms (erstes 621) | Rest-Audio je Kanal → ≈ doppelt |
| 3 min STEREO, N 4096 (2 Läufe) – v4 (Mitte) | 845 ms (erstes 107) | 5870 ms (erstes 455) | Endfassung |
| 3 min STEREO, N 16384 – v4 | 2690 ms (erstes 762) | 5049 ms (erstes 1288) | Endfassung |

v1 (Verhältnis |Rest|/|Original|, eine FFT je Spalte, ohne restMid) war gleich genau, aber 3 min N 4096 7,7 s, N 16384 10,4 s (erstes
Stück 3,0 s) → verworfen zugunsten v2. Kosten-Aufteilung je Stück N 4096: FFT 512 × 0,13 ms ≈ 70 ms (spk12Fft, gemessen in Node),
alter Fokus-Rechenweg ≈ 50 ms, Rest der Zeit = Rest-Audio (Basis-STFT/ISTFT je Block, wie beim Abspielen).
Speicher: Rest-Audio Float32 je Dokument-Länge (3 min ≈ 32 MB, 10 min ≈ 106 MB) im Worker, frei 90 s nach letztem Gebrauch (gleicher
Speicher wie „Noten finden“ auf dem Rest, wird geteilt). Je Stück vorübergehend 1 MB (Rest-Bytes). Fokus-Stücke und Texturen wie bisher.
Abbruch: fokusStop während eines Satzes → Antwort 'abgeloest' (gemessen in fok2-test, Zeile „abbruch“).

Bewertung „tragbar“: ja für Xanders Ablauf (Rechnen im Worker, sichtbare Stücke zuerst, Hauptfaden ohne Long Task, abbrechbar,
Zwischenspeicher je Dokument-Stand). Preis: das erste sichtbare Stück kommt bei einer Ebene über dem ganzen Lied ≈ 0,3 s später
(N 4096: 0,41 statt 0,09 s) bzw. ≈ 0,5 s später (N 16384: 1,26 statt 0,73 s, großes Stück 47 s); der ganze Satz 3 min dauert
≈ 5 s statt ≈ 0,8 s (N 4096). Bis dahin zeigt die
Anzeige wie bisher das Original bzw. den alten Fokus-Satz. Nur Spalten mit Ebenen-Wirkung kosten (kleine Ebenen = kaum Mehrkosten,
Kamm-Fall 8 s: 207 statt 69 ms).

## Haken-Liste
Keine neuen Haken. Alle Änderungen im FOKUS1-Block (Kommentar FOK2):
- neu: `FK2`, `RM2`, `rows2()`, `trueRest()` (vor `piece`)
- `piece(…, TR)`: Parameter TR, `SB` (Bild-Quelle Rest-Byte), Spalten-Weiche `tc`, Noten-Glättung auf dem Rest-Bild, `sb` in der Byte-Formel
- `ops.fokus`: `trueRest` vor `piece` (nur Modus 'rest'), Abbruch → stop wie bisher
- `ops.spk12zauber` (Fokus-Prüfung): Stück aus dem Zwischenspeicher oder Näherung ohne Speichern
- `restMid` (v4): Stereo → Mitte als ein Kanal rendern (`mono`, eigener Block-Speicher), Faktor 32768
Die drei Kern-Haken aus FOKUS1 (spk1DspMake, spk1Call, spk8WUrl) und die fünf Anzeige-Haken sind unverändert.

## Regression (Logs in reg2/; volle Kette auf v3 md5 6c5a05646d88866ecf71bb5f6176728c, Endfassung v4 md5 313593d6172c5401280bc9152c4c41bd
## – v4 ändert nur den Stereo-Zweig von restMid; auf v4 erneut: kern 26/0, fokus1-test 48/3 (nur Long Tasks, auch im unveränderten „Gefunden“),
## fok2-test mono 16/0 + stereo 19/0, fok2-stereo-noten gleich, smoke errors [], Pflicht wieder grün)
| Test | Ergebnis | Bemerkung |
|---|---|---|
| fokus1-kern-test | 26 OK / 0 | |
| fokus1-test (Kopie reg2/) | 50 OK / 1 | einziger Fehler Long Tasks 3 min (Texturen, außerhalb JS); basis unter gleicher Last 44 / 7 (alle Long Tasks) |
| spk12-test / -test2 / -test3 | 98/0 · 72/0 · 47/0 | erster Lauf unter Last 8: test2/test3 je 1 Long-Task-Fehler (Werkzeuge, nicht Fokus) |
| spk6-test | ALLES OK (24 Kern-Messwerte) | |
| spk5-test | ALLES OK, 24 Prüfungen | braucht mess/*.f32 neben index.html (aus spk5/mess kopiert) |
| spkfix-test | ALLES OK, 11 Prüfungen | |
| zrl1-test (Kopie reg2/) | Zerlegen 20 s A 1243 / B 1252 ms (5 Runden, Faktor 1,01), SDR + Energie je Ebene gleich, Speicher OK | erster Lauf (3 Runden + 3 min, Last 3–5,6): 1362/1253 bzw. 10060/9610 – Streuung; Zerlegen-Code unberührt |
| fok2-test | 21 OK / 0 | |
| Pflicht | topdefs doppelt 0 / Syntaxfehler 0; dupkeys 0; smoke errors []; MS 2000 = 1; live = 1; VERSION 4.75.0 | |

## Offenes
- Erstes Stück bei N 16384 und Ebenen über das ganze Lied 0,7–2 s statt 0,4–0,9 s. Profi-Weg für später: erst das sichtbare
  Spaltenfenster (statt ganzes 1024er-Stück) rechnen, oder Rest-Audio nach jeder Ebenen-Änderung im Leerlauf vorab rechnen.
- Rest-Audio-Speicher wächst mit der Lied-Länge (Float32 voll); bei sehr langen Liedern (> 10 min) wäre ein Block-LRU sparsamer.
- Masken-Artefakte (wahrer Rest heller als Original, z. B. vor dem Beginn einer Kamm-Spur bei N 4096) werden bewusst nicht gezeigt.
- Zauberstab-Prüfung nutzt den genauen Rest nur, wenn das Stück gerade angezeigt (im Zwischenspeicher) ist – sonst Näherung wie 4.72.
- Die Regressionstests spk12/spk6/spk5/spkfix/fokus1-kern schreiben ihre Ergebnis-Dateien (json/fotos) in ihre eigenen Ordner
  (so vom Auftrag aufgerufen); fokus1-test und zrl1-test liefen als Kopie in reg2/.

## Prüfung (Prüfer FOK2, Nachbesserung FOK2-P, 16.11. 00:20–00:45 UTC, Last 3,4–11)
Ausgang: v4 md5 313593d6172c5401280bc9152c4c41bd (Freigabe empfohlen, zwei mittlere Punkte, ein kleiner). Endfassung **v6 md5
74cc722a2d6e8d63f0700f17e81046a4**. Alle Änderungen weiter nur im FOKUS1-Block (Kennung FOK2-P), keine neuen Haken außerhalb; Diff (fok2.diff,
alt: fok2-v4.diff) hat nur Abschnitte zwischen FOKUS1-BEGIN und FOKUS1-END. Sicherungen: index.vor-pruef.html (= v4), index.vor-pruef2.html (= v5).
Messskripte: nach/p4.mjs, nach/p2.mjs (Kopien der Prüfer-Skripte), nach/p5.mjs (neu), Logs in nach/ und nach/reg/.

### Befund 1 (mittel) – Zauberstab-Prüfung passte bei langen Liedern nicht zur Anzeige → behoben
`trueRest(…, one)` rechnet bei Bedarf nur EINE Spalte (Rahmen-Prüfung nur für ihr Fenster, Rest-Audio-Blöcke um die Spalte, eine FFT) –
gleicher Rechenweg wie die Anzeige. `ops.spk12zauber`: liegt das Fokus-Stück nicht im 6er-Speicher, wird das Stück wie 4.72 genähert, aber die
angetippte Spalte genau (nicht gespeichert, Abbruch bei geändertem Ebenen-/Noten-Stand → dann Näherung wie bisher).
| p4 (3 min, Kamm-Ebene über 2 Töne, Stück 5 verdrängt) | 43 s @220 | 43 s @440 | 67 s @220 | 67 s @440 |
|---|---|---|---|---|
| v4: Anzeige / Zauberstab | 32 / 32 (0 Zellen) | 24,9 / 24,9 | 32 / **12,2 (11987 Zellen)** | 24,9 / **17,4 (5728 Zellen)** |
| v6: Anzeige / Zauberstab | 32 / 32 (0 Zellen) | 24,9 / 24,9 | 32 / 32 (0 Zellen) | 24,9 / 24,9 (0 Zellen) |
| basis: Anzeige / Zauberstab | 12,2 / 12,2 (11982) | 17,4 / 17,4 (5724) | 12,2 / 12,2 (11987) | 17,4 / 17,4 (5728) |
Zeit Zauberstab (p5, Stück verdrängt, Rest-Audio im Speicher): v6 79 / 70 ms, basis 41 / 41 ms.

### Befund 2 (mittel) – Zeitpreis → für das schrittweise Arbeiten behoben, erster ganzer Satz bleibt (begründet)
- **Rest-Audio bleibt über Ebenen-Änderungen:** `rsSync` bildet je Masken-Streifen (128 Basis-Rahmen) einen Fingerabdruck über alle Ebenen
  (Inhalt der Kacheln, Reihenfolge, Kopie-Kennung k6; `fpOf`). Bei neuem Ebenen-Stand werden nur Blöcke verworfen (genullt, done = 0), deren
  Streifen sich geändert haben – der Mix 'rest' hängt nur an den Masken (gainFn), gleiche Streifen ⇒ byte-gleicher Block. Vorher: ganzes Feld neu.
  Fingerabdruck in Scheiben (12 ms, dann tick): am Stück kostet er bei 4 voll teilbelegten Ebenen 55–213 ms (3 min) bzw. 152–225 ms (10 min,
  Node-Messung nach/fpbench.mjs) – zu lang für die Worker-Antwortzeit, darum v6. Ein Lauf je Stand (`RS.pend`), Notweg bei Dauer-Änderung: ganz neu.
- **Rest-Bild je Stück** (`RS.tr`, höchstens 16 Stücke ≈ 16 MB, frei mit dem Rest-Audio nach 90 s): gleich, solange die Streifen seiner Rahmen
  und Rest-Blöcke gleich sind → nach einer örtlichen Änderung keine FFT für unberührte Stücke (die Fokus-Stücke selbst werden wie bisher neu
  gemischt, Schlüssel H mit Ebenen-Versionen).
- **„Noten finden“ auf dem Rest** hält das Feld (`RS.hold`): ändert sich währenddessen der Ebenen-Stand, wird kopiert statt überschrieben.
- Byte-Gleichheit: p5 „gleichFrisch“ – Satz nach zwei örtlichen Änderungen = frisch geöffnetes Dokument mit denselben Ebenen (Hash af7fb9b2);
  p2: ↶ der zweiten Ebene = erster Satz (45d36813, wie Prüfer); fok2-test 16/0 mit denselben Zahlen wie v4.

| Zeit 3 min mono, N 4096, Fokus-Satz (A/B abwechselnd) | v4 (Prüfer) | v6 | basis |
|---|---|---|---|
| erster Satz, Ebene über das ganze Lied (p5, Last 5–8) | 8949 / 8762 (Last 12–14) | 6549 / 4901 (erstes Stück 552 / 517) | 765 / 841 (91 / 117) |
| nach örtlicher Ebene 60–70 s (p5) | ≈ voller Satz (Feld neu) | **1096 / 936** (erstes 49 / 56) | 792 / 846 (78 / 101) |
| nach zweiter örtlicher Ebene 120–125 s (p5) | ≈ voller Satz | **812 / 797** | 686 / 753 |
| nach zweiter Ebene über das ganze Lied (p2) | 8353 / 8160 | 4776 (Last 3,6–4) | 526 |
| UI 3 min auf „Nur Rest“ (fokus1-test) | 5179 (basis 1555) | 5190 | 1962 |
| Abbruch in der Rest-Audio-Phase (p2) | 26 ms | 52 ms (Last 4) | 3 ms |
| Worker-Ping während des Satzes (p2) Median / P95 / max | 7,3 / 75–111 / 160–185 | 20,5 / 150 / 188 | 29,8 / 80 / 80 (nur 16 Werte) |
| Long Tasks Hauptfaden (p2, p5) | 0 | 0 | 0 |

Begründung für den verbleibenden Preis: Der genaue Rest braucht das Rest-Audio (je Basis-Rahmen FFT → Masken-Gewinn → inverse FFT, genau wie
beim Abspielen). Ändert sich eine Ebene über das ganze Lied (Zerlegen, Ebene über alles verschieben), ist das ganze Rest-Audio wirklich neu –
das ist kein Zwischenspeicher-Problem, sondern die Rechnung selbst. Der Hauptfaden bleibt frei, das sichtbare Stück kommt zuerst (0,4–0,6 s),
Abbruch wirkt. **Zur Entscheidung (Lead/Xander):** so lassen (genau, nach dem ersten Satz schnell) – oder bei Ebenen über > 60 s zuerst die
Näherung zeigen und den genauen Satz im Leerlauf nachreichen (sichtbar anders: Bild wird kurz nach dem Umschalten tiefer – darum nicht gebaut).

### Befund 3 (klein) – Speicher Rest-Audio schon beim Anzeigen → nicht geändert (Risiko), dokumentiert
Float32 je Lied-Länge (3 min ≈ 32 MB, 10 min ≈ 106 MB) + jetzt `RS.tr` ≤ 16 MB, beides frei 90 s nach letztem Gebrauch. Block-LRU / Rückfall auf die
Näherung bei sehr langen Liedern bleibt offen (siehe Offenes).

### Kleinigkeit – „Abstand ≤ 0,4 dB“ vs „≤ 0,1 dB“
Gemessen ≤ 0,1 dB (fok2-test, v4 und v6 gleich). „0,4“ im Bericht war falsch.

### Haken-Liste (Nachbesserung, alles im FOKUS1-Block, Kennung FOK2-P)
- neu: `fpOf(d)` (async, Scheiben), `rsKey(d)`, `rsSync(d)` (async), `RS` um base/fp/tr/hold/pend erweitert
- `trueRest(…, ok, one)`: Parameter `one` (eine Spalte), Merker `RS.tr` mit Fingerabdruck-Signatur (`keep`)
- `restMid`: `await rsSync(d)` statt eigener Schlüssel-Prüfung (sonst unverändert, Stereo-Mitte wie v4)
- `ops.noten` (Rest): `RS.hold` mit try/finally
- `ops.spk12zauber` (Fokus-Prüfung): Stück aus dem Zwischenspeicher, sonst Näherung + genaue Spalte
Keine Zeile außerhalb des Blocks, keine neuen Haken.

### Endstand v6 (Last 3,4–11, andere Agenten aktiv)
| Test | Ergebnis |
|---|---|
| fok2-test LANG=0 (Kopie nach/) | 16 OK / 0 (alle Tiefen wie v4: Kamm −34,8/−32,4, Schatten −25,6/−25,8, Rechteck −98,2/−80,4, 65 Hz −72,7/−67,4, außen byte-gleich, „nur Noten“ = basis-Hash) |
| p4 Zauberstab (Prüfer-Skript) | Anzeige = Zauberstab an allen 4 Stellen, 0 Konsolenfehler |
| p5 (neu) | gleichFrisch true, Zeiten s. Tabelle, LT 0, 0 Fehler |
| p2 (Prüfer-Skript, RUNS=1) | Hashes wie v4, ↶ = erster Satz, Abbruch 'abgeloest' 52 ms, LT 0, 0 Fehler |
| fok2-stereo-noten | gleiche 2 Noten wie basis, 729 vs 780 ms |
| fokus1-kern-test (Kopie) | 26 / 0 |
| fokus1-test (Kopie, A/B gleiche Zeit) | neu 47 / 4, basis 44 / 7 – alle Fehler Long Tasks, auch in „Alles“/„Gefundenes“ |
| spk12-test / -test2 / -test3 (Kopien) | 98/0 · 72/0 · 47/0 |
| spk6-test | ALLES OK |
| spk5-test | ALLES OK, 24 Prüfungen |
| spkfix-test (Kopie mit sonde/ + spk7/lib.mjs) | ALLES OK, 11 Prüfungen |
| zrl1-test (RUNDEN=3) | Zerlegen 20 s A 1356 / B 1260 ms (Einzel A 1356/1179/1547, B 1260/1788/1224 – Streuung), 3 min A 10559 / B 10928 (1,03); SDR + Energie je Ebene gleich, Speicher OK; „schneller“-Prüfung ist das ZRL1-Ziel gegen 4.74 (hier gleicher Zerlegen-Code, unberührt) |
| Pflicht | topdefs doppelt 0 / Syntaxfehler 0; dupkeys 0; smoke errors []; MS 2000 = 1; live = 1; VERSION 4.75.0 |
Die Regression lief diesmal vollständig als Kopie in nach/ bzw. nach/reg/ (keine Ergebnis-Dateien in fremden Paketordnern).

### Offenes nach der Prüfung
- Erster ganzer Satz nach einer Ebene über das ganze Lied bleibt 5–7× basis (s. Begründung) – Entscheidung Lead/Xander.
- Worker-Ping während der Rest-Audio-Phase bis ≈ 190 ms (ein Block-Render am Stück unter Last; wie v4).
- Rest-Audio-Speicher (Float32 voll) + Rest-Bild-Merker ≤ 16 MB; Block-LRU für > 10 min offen.
- Fingerabdruck setzt voraus, dass jede Masken-Änderung die Ebenen-Version erhöht (verUp) – so ist es im Kern (gleiche Annahme wie der
  bisherige Schlüssel von restMid); Masken, die ohne Versionswechsel geändert würden, wären auch vorher veraltet gewesen.
