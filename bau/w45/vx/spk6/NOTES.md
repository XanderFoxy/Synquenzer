# SPK6 Ebenen-Werkstatt – Teil 1 (Kern) · Entscheidungen

## Datenmodell (alles in meta.layers → Kern-Undo, Speichern, ZIP)
- `l.k6 = 1` Zusatz-Ebene (Kopie, Chorstimme): Maske zählt NICHT zum Rest (Haken gainFn: nach dem Aufsummieren wieder abziehen). So ist eine Kopie eine echte zweite Stimme (+ Quelle), der Rest bleibt unverändert. Gemessen: Mischung nachher − vorher = Quelle (max. Abw. 9e-8).
- `l.a6 = {id, b, o, n, sc, tr, fv, dt, bg, fmt}` Audio-Ebene: klingt aus eigenem Audio (Int16 mono, unveränderlich je id, d.a6 Map). Gerechnet aus der Maske der Grund-Ebene `b` nach dem Plan (Noten). Die Maske bleibt → der Rest behält sein Loch (Original-Gesang kommt nicht zurück).
- Noten einer Audio-Ebene: `o6 = {a, b, m}` = Lage in der Grundlage (beim ersten Umsetzen gesetzt), `a/b/m/c6` = Ziel (Anzeige folgt automatisch, m bleibt ganzzahlig, Feinanteil in c6 Cent). Jede Änderung rechnet NEU aus der Grundlage (nicht-destruktiv, keine Artefakt-Anhäufung).
- `l.fx = {pan, lo, mi, hi, hp, lp, hall, echo, sat}`; ohne aktive Effekte wird fx gelöscht.
- Audio-id unveränderlich: ↶ stellt nur die Ebenen-Daten zurück, das alte Audio liegt noch im Speicher. `prune` gibt Audio frei, das weder Ebene noch Undo/Redo braucht. IDB: `spk:<doc>:a<id>:<k>` nur für die aktuell benutzten ids (flush schreibt neue, löscht unbenutzte).
- ZIP: `spektral/<doc>/a<id>.bin` (Int16 roh); alte Leser ignorieren die Dateien (Regex nur m(L…).bin).

## Klang
- Haken am Kopf von `block()`: Ebenen mit Audio oder Effekten werden aus dem Spektral-Durchgang genommen (g = 0, Maske zählt weiter zum Rest) und getrennt gerechnet → gleiche Wirkung beim Abspielen (op block), render, Export, „In Matrix“. Ergebnis im selben LRU-Cache; Kennung `n6` verhindert Rekursion.
- Effekte deterministisch und unabhängig von der Abspiel-Reihenfolge: EQ/Filter mit Vorlauf aus Block k−1 (IIR eingeschwungen), Echo als feste Abgriffe (punktierte Achtel aus dem Takt-Tempo, 6 Wiederholungen, Ping-Pong), Hall als Faltung (fester Raum ≈ 1,6 s, L/R verschieden, 65536er-FFT, 1 Hin- + 1 Rück-FFT je Block). Gemessen: rückwärts gerechnete Blöcke = render, max. Abw. 0.
- Filter 24 dB/Okt. (Butterworth, 2 Biquads); Kuhschwanz tief 250 Hz, Glocke 1,2 kHz, Kuhschwanz hoch 4 kHz; Sättigung tanh mit Drive 1…6, Pegel/√Drive.
- Tonhöhe: eigener Phasen-Vocoder (wahre Frequenz je Bin, Verhältnis je Rahmen, Hop N/8, N = 2048 bei 48 kHz, Bass 4096), Formant-Erhalt über geglättete Log-Hüllkurve (Gesang + Chor), nur Bereiche mit r ≠ 1, Blenden 20 ms zum Original, 20-ms-Übergänge zwischen Noten, Lücken < 120 ms gleitend. Zeit: Note ausschneiden (12-ms-Kanten) und versetzt einsetzen. Grund: G2 (vorhandenes Werkzeug) läuft im Hauptfaden, ist einstimmig und kennt kein Verschieben in der Zeit; der eigene Weg läuft im Spektral-Worker, ist in Node messbar und deterministisch.
- Chor: Tonart aus den Noten (Dauer-gewichtet, Dur/Moll-Profile), leiter-eigene Terz/Quinte (sonst groß/rein), Oktave, Unisono. Je Stimme Versatz 5…25 ms, Streuung ±5…8 ct, Formant ×0,96…1,04, Pan ±0,3…0,8, −7 dB, zwischen den Noten 50 % (Konsonanten nicht n-fach). Arten: Satz (Terz ↑, Quinte ↑, Unisono, Oktave ↓, Terz ↓, Unisono), Terzen, Quinten, Oktaven, Dopplung.

## Bedienung (minimal, Teil 2 verfeinert)
- Ebenen-Menü ⋯ → „Werkstatt“: Duplizieren · Oktave − · −1 · +1 · Oktave + · Chor … (2–6 Stimmen, Art) · Effekte … (9 Regler, Alle aus). Noten-Klappfenster → „Umsetzen“: −1/+1, ±10 ct, ←/→ 1/16 (Shift+±1 = ±10 ct). Jede Aktion ein ↶-Schritt, Statuszeile mit Ergebnis.
- Nur vorhandene Bausteine (spk1-dd, mbtn rb spk1-ck, makeSeg, h5); Regler 40 px hoch (Trefferfläche).

## Offen (Teil 2)
- Noten direkt ziehen (Tonhöhe/Zeit) in der Notenrolle, Mehrfachauswahl über Rahmen; Tasten ↑/↓ mit Shift = fein.
- Audio-Ebene wird nicht automatisch neu gerechnet, wenn sich ihre Maske ändert (In Ebene/Verfeinern auf eine umgesetzte Ebene) → Knopf „Neu rechnen“ oder automatisch über Masken-Version.
- „Noten finden“ auf einer Audio-Ebene findet die neuen Lagen; neue Noten ohne o6 werden beim ersten Umsetzen auf die Grundlage zurückgerechnet (tr, dt).
- Anzeige: Spektrum zeigt das Original (Maske), nicht das umgesetzte Audio; Kennzeichen „Audio/Effekte“ in der Ebenen-Zeile fehlt noch.
- Stereo der Audio-Ebenen: mono (Pan stellt sie in den Raum).
- Leistung: 6 s Test-Lied: Umsetzen ≈ 0,3 s, Chor 4 Stimmen 1,7 s im Worker; bei 3-min-Liedern Fortschritt in der Statuszeile, Rechnung nur in Noten-Bereichen.
- „In Matrix“ (spk2MxAudio) rendert die Ebene allein (mix = lid) → läuft über denselben block-Haken: Audio-Ebenen und Effekte (inkl. Pan) gehen mit, wie beim Abspielen.

# Teil 2 – Bedienung · Entscheidungen
- **Ebenen-Menü ⋯**: Abschnitt „Werkstatt“ steht jetzt OBEN (vor Name/Farbe): Kopieren · Noten bearbeiten · Chor erzeugen … · Effekte …, darunter „Ganze Ebene“ Oktave −/−1/+1/Oktave +. Nur vorhandene Bausteine (h5, spk1-g, mbtn rb, 44 px).
- **Noten bearbeiten** = eigenes Werkzeug `s6ed` (kein Knopf in der Werkzeugleiste; die Optionsleiste zeigt dafür eine eigene Zeile, wie die anderen Werkzeuge). Haken nur je 1 Zeile am Kopf von spk1ToolDown/Move/Up (typeof-Schutz) – damit laufen Zwei-Finger-Zoom, Pinch-Abbruch und die Abspiel-Linie unverändert weiter.
  - Balken = Noten der Ebene in Ebenenfarbe über dem Spektrum (auf der SPK2-Notenanzeige), 1/16-Raster (Viertel heller) wenn ≥ 6 px; verschobene Noten zeigen die alte Lage gestrichelt.
  - Tipp auf Note = wählen/abwählen (spielt kurz den Ton), Tipp auf zweite = Mehrfachauswahl, Rahmen ziehen auf leerer Fläche = mehrere wählen, Tipp ins Leere = Auswahl weg + Position. Ziehen einer Note: senkrecht = Halbtöne (eine Zeile = ein Halbton), waagrecht = Zeit im 1/16-Raster (relativ, die Note behält ihren Versatz zum Raster). Schwelle 6 px; beim Öffnen wird der Halbton auf ≥ 8 px gezoomt, sonst ist ein Halbton kleiner als die Schwelle (quer war das 2,6 px).
  - Knöpfe: Alle · −12 · −1 · +1 · +12 · ▶ Vorhören · A/B · Anwenden · Verwerfen · Fertig. Ohne Auswahl wirken ±1/±12 auf alle Noten. Tasten ↑/↓ (Shift = Oktave), ←/→ 1/16, Enter = Anwenden.
  - **Entwurf** (Teil-1-Weg rechnete jeden Klick sofort): Änderungen sammeln sich nur in der Seite (U.s6e.mv), erst „Anwenden“ rechnet – EIN Kern-Op `s6plan` mit allen Noten, ein ↶-Schritt „Noten bearbeiten“, Fortschritt in Statuszeile UND im Knopf („Rechne 45 %“), danach blinkt die Ebenen-Zeile. „Fertig“ mit offenem Entwurf fragt einmal („Entwurf weg?“).
  - Ohne Noten: „Noten bearbeiten“ ruft erst „Noten finden“ (SPK2-Op) und öffnet dann.
- **Vorhören + A/B**: `s6plan`/`s6chor` mit `dry` rechnen im Worker nur einen 8-s-Ausschnitt (baseOf mit Bereich) und machen danach alles rückgängig (abort + prune → kein ↶-Schritt, kein Speicher-Rest). A und B laufen GLEICHZEITIG als zwei Puffer, A/B blendet nur die Pegel um (12 ms) – Umschalten an derselben Stelle wie am Pult. Abspiel-Linie/■ über SPK1.pl (pos-Funktion wie SPK3), ▶ Abspielen stoppt das Vorhören.
  - Noten: A = Grundlage (Original der Ebene), B = Entwurf. Chor: A = Ebene allein, B = Ebene + Stimmen (Stereo, Pan/Pegel wie beim Erzeugen).
- **Chor-Blatt**: Stimmen 2–6 (Kopfzeile „Stimmen“, Knöpfe nur Ziffern – „6 Stimmen“ ragte hochkant aus dem Blatt), Art Satz/Terzen/Quinten/Oktave/Unisono, Breite (Pan × 0…1, Grund 1 = Teil-1-Werte), Streuung (Versatz/Verstimmung/Formant × 0…2, Grund 0,5 = Teil-1-Werte → Kern-Test unverändert grün). Ergebnis: neue Ebenen mit `r6 = 'chor'`.
- **Kennung** in der Ebenen-Zeile unter dem Namen (Name oben, kleine Marke darunter, sonst hochkant abgeschnitten): „Kopie“, „Chor“, „neu“ (= klingt aus eigenem, neu gerechnetem Audio), „FX“ (Effekte; reiner Chor-Pan zählt nicht). Neue/geänderte Ebenen blinken 3× (vorhandene Animation `stepFl`), Liste rollt zur Zeile.
- Haken Teil 2 (einbau.py, jetzt 19): spk1ToolDown/Move/Up-Kopf, Ende spk1OvDraw (nach der Abspiel-Linie, Abstand zur SPK2/SPK5-Zeile), Ende spk1Layers. Keiner direkt hinter SPK4/SPK5/CHR4-Ankern.

# Abnahme (Teil 2)
**spk6-test.mjs (Playwright chromium, Touch, 428×926 + 926×428): ALLES OK, 26 Prüfungen, 34 s, Konsole ohne Fehler.**
- Menü: „Werkstatt“ ist die erste Überschrift; alle 8 Knöpfe ≥ 36 px (44 hoch), hochkant und quer im Bild.
- Kopieren: Zeile „Gesang Kopie“ mit Marke „Kopie“, blinkt; Render bitgleich zur Quelle (Abw. 0).
- Noten bearbeiten: Werkzeug s6ed, 10 Knöpfe je ≥ 44×36; Tipp/Tipp = 2 gewählt, nochmal = 1; Touch-Zug A3 +3 Zeilen/+1/16 → Entwurf {dm 3, dt 0,25 s}; +12/−12 → 15/3.
- Vorhören (Entwurf, nichts angewendet): A und B laufen, B hörbar, Linie läuft; A/B → A (Gain 1, Knopf „A · Original“). Messung im Vorhör-Puffer: B 261,63 Hz (0,0 ct zu C4), A 220,00 Hz (0,0 ct).
- Anwenden: Fortschritt sichtbar („Rechne 5 %“), 0,7 s, Note 57 → 60 mit o6 = 57, Einsatz +1/16, ↶-Label „Noten bearbeiten“, Zeile blinkt + Marke „neu“. Gerendert: 261,63 Hz (0,0 ct), Nachbarnote D4 0,0 ct. ↶ → 57, ↷ → 60 (Touch auf Kopf-Tasten).
- Rahmen über alle Noten = 3 gewählt; Fertig → Werkzeug zurück (rect).
- Chor-Blatt: Stimmen/Art/Breite/Streuung/Vorhören/A/B/Erzeugen (15 Bedienelemente ≥ 36 px, im Bild). Vorhören 3 Terzen 1,9 s (A + B, keine Ebene angelegt), A/B schaltet. Erzeugen 1,4 s → 3 Ebenen „Terz ↑/↓/↑“ mit Marke „Chor“, blinken; Breite 50 % → Pan −0,275/+0,275/−0,15; Versatz 11 ms. Terz ↑ über A3 (D-Dur) gemessen 278,14 Hz = Cis4 + 5,99 ct (Ziel +6 ct Streuung).
- Effekte: 9 Regler ≥ 40 px; Echo 0,4 gesetzt → Marke „Kopie · neu · FX“.
- Abspielen im Worker mit Audio-Ebenen/Chor/Echo läuft (Position 2,06 s nach 1,3 s ab 0,9 s).
- ZIP rund: 4 Audio-Dateien, Mischung und bearbeitete Ebene bitgleich nach Neuladen.
- Quer: Noten bearbeiten auf Ebene ohne Noten findet sie selbst (1 Note), Optionsleiste rollbar (768/472 px), Touch-Zug +2 Zeilen → Entwurf dm 2 → Anwenden → 246,94 Hz (0,0 ct zur Quelle 220 Hz + 2 Halbtöne).
- Kern-Messwerte aus Teil 1 erneut (spk6-kern-test.mjs aus dem Abnahme-Test): 24/24 OK.
- spk6-ui-test.mjs (Teil 1) angepasst (Menütext „Kopieren“, Stimmenzahl „4“): 17/17 OK.
- Fotos: fotos/spk6-10 … spk6-20.

**Pflichtprüfungen (Endstand)**: topdefs doppelt 0 / Syntaxfehler 0 · dupkeys 0 · smoke errors [] (smoke-b1.png) · „MS 2000“ 1× · „  live: true,“ 1× · vwStart 3× · Krypto-grep 0 (= Basis) · Markenwörter je Wort nicht gestiegen, 0 in Block/Tests/Notizen.
**Regression**: spk1-test 18/18 OK. spk3-test (gegen basis5): dieselben 4 bekannten Fehler wie die unveränderte Basis (Bass 3,01 dB, Verfeinern +0,52, mehrstimmig 0/28, Nachbau 2,13→2,19 mit pad 1,62→1,85) + spk2 klang-abstand 22,96 im Parallel-Lauf; allein (NUR=spk2) 29/30 wie Basis, klang-abstand 3,12/4,02 identisch → keine Abweichung durch SPK6.

# Offen nach Teil 2
- Audio einer umgesetzten Ebene wird nicht automatisch neu gerechnet, wenn sich danach ihre Maske ändert (In Ebene/Verfeinern) – „Anwenden“ ohne Änderung rechnet nicht; Knopf „Neu rechnen“ oder Masken-Version fehlt noch.
- Spektrum zeigt weiter das Original (Maske), nicht das umgesetzte Audio; die Balken zeigen die neue Lage.
- Noten-Länge ziehen (Kante) gibt es nicht; nur Lage/Tonhöhe. Feine Cent nur über das Noten-Klappfenster (±10 ct).
- Vorhören rechnet 8 s ab der ersten gewählten Note; bei langen Chor-Teilen hört man nur den Anfang.
- SPK2-Notenfinder gab für einen reinen 220-Hz-Ton m = 56 statt 57 (quer-Test); das Umsetzen rechnet relativ und stimmt (0,0 ct), nur der Name am Balken ist dort einen Halbton daneben.
- Audio-Ebenen mono (Pan stellt sie in den Raum).
