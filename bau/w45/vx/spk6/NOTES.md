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

# Prüfung (Befunde aus PRUEFUNG.md, 17) – Korrekturen
Nachgestellt: Kern-Befunde 1, 4a, 4b, 5, 6 mit `spk6-pruef-test.mjs` auf dem Stand vor der Korrektur (`alt/index.html` = index.t2.html):
12× Anwenden 4,1–5,5 s, erster Fortschritt nach 4,2 s (1 Meldung); Quelle nach „In Ebene → Kopie“ RMS 0,0735 → 0; Gesang nach erneutem Zerlegen 0,066 → 0,004;
nach Löschen der Quelle 0,208 statt 0,161; „▶ Auswahl“ Energie 0. Seiten-Befunde 7–16 nach den Messwerten/Fotos der Prüfung (spk6p/).
Sicherung vorher: spk6-block.t2.js, einbau.t2.py, index.t2.html, spk6-test.t2.mjs.

## Entscheidungen
- **Audio der Ebenen in geteilten Stücken** (64k Proben, Int16, unveränderlich): eine neue Fassung teilt alle Stücke, die gleich bleiben; ↶/↷ teilen sich das Audio.
  Speichern/ZIP/IDB unverändert (beim Schreiben wird zusammengesetzt) → alte Projekte laden wie bisher.
- **Nur der geänderte Bereich** (Befund 1): Noten, die sich geändert haben (alte + neue Lage, Quelle + Ziel) + 0,2 s; verschobene Noten, die hineinragen, ganz dazu;
  die Ränder an die leiseste Stelle im Umkreis von 0,5 s, dort 10 ms Überblendung; Grundlage nur dort (+0,25 s Vorlauf). Rest bitgleich (gemessen 0).
  Voraussetzung: gleiche Grundlage/Ebenen-Werte und gleicher Masken-Abdruck `hs` (sonst – z. B. nach „In Ebene“ auf die Grundlage – wird einmal alles gerechnet;
  damit ist auch „Audio passt nicht mehr zur Maske“ aus „Offen nach Teil 2“ für Anwenden gelöst). Mehr als 60 % der Noten geändert → ganz.
  Wird die neue Stelle lauter als die alte Skalierung, wird einmal neu skaliert (Abweichung außerhalb ≤ 1 Stufe). Neue Fassungen haben 12 % Luft.
- **Rechnen ohne das Dokument anzufassen**: Kopien von Ebene + Noten → Audio; erst am Ende EIN ↶-Schritt. Lange Rechnungen geben alle 25 ms ab (MessageChannel im
  Worker, in Node setTimeout) → Abspiel-Blöcke kommen dazwischen (Befund 2). `d.busy = 's6'` sperrt ↶/In Ebene/Löschen/Zerlegen währenddessen (Kern-Meldung „Rechnung läuft“).
  Fortschritt auch beim Grundlage-Rendern (blockweise) → kein „0 %“-Stehen mehr.
- **↶-Audio-Grenze** (Befund 3): Audio, das nur noch ↶/↷ braucht, höchstens 64 MB – sonst fallen die ältesten ↶-Schritte weg (wie die 48-MB-Grenze der Masken).
- **Kopie unabhängig** (Befund 4): Haken in transfer (`tAll`): „aus Original“ in eine Kopie nimmt den anderen nichts weg; in eine normale Ebene nimmt der Kopie nichts weg;
  zwischen zwei Ebenen (von = Ebene) wie gewohnt. Zerlegen und Profi-Trennung zählen Kopien/Chorstimmen nicht als belegt (je 1 Zeile, Daten-Filter `k6`).
  Für das Zusammenführen mit SPK5: dessen „Zerlegen in der Auswahl“ (eigene `own`-Liste) sollte Kopien ebenso auslassen.
- **Quelle löschen** (Befund 5): Haken im Kern-Löschen (`gone`): die erste Kopie (`q6` = Quelle) übernimmt den Platz (k6/r6 weg → keine Kennung „Kopie“ mehr), Stimmen mit
  Grundlage = Quelle bauen auf der Kopie auf; die Noten der gelöschten Ebene werden mit gelöscht (sonst erbte eine neue Ebene mit derselben id sie – gefunden beim Test). ↶ stellt alles her.
- **▶ Auswahl mit Audio-Ebenen** (Befund 6): eigenes Audio im STFT-Raster des Kerns mit denselben Auswahl-Gewichten (je Rahmen/Bin), dann Effekte wie sonst.
- **Notenmodus endet** (Befund 7), wenn seine Ebene oder sein Dokument weg ist (Prüfung am Ende von spk1Layers, Haken vorhanden) – Werkzeug zurück auf Rechteck, Statuszeile sagt warum.
- **Warteschlange** (Befund 8): Werkstatt-Aktionen während einer Rechnung warten (FIFO) und laufen danach; Statuszeile „… wartet“, im Fortschritt „· 1 wartet“.
  Vorhören während einer Rechnung: Meldung „gleich noch einmal tippen“ (kein verspätetes Abspielen).
- **Kennung** (Befund 9): zuerst das Unterscheidende (Chorstimme „Terz↑“, „Quint↓“, „Okt↓“, „Uni 2“ bzw. „Kopie“), dann „FX“, „neu“; Name und Kennung bleiben in der
  Namensspalte (… am Ende), voller Text im Hinweis/aria-label. Gleiche Stimmen werden nummeriert („Gesang Unisono 1/2“), Namen sind eindeutig.
- **Fein** (Befund 10): Knopf „Fein“ in der Optionszeile: −1/+1 werden −10 ct/+10 ct, Ziehen = 10 ct je Zeile (je Zug höchstens ±50 ct, keine Zeitverschiebung),
  ↑/↓ = 10 ct (auch Alt+↑/↓). Balken stehen auf der Cent-Lage, Beschriftung „A3+20“.
- **Filter-Regler logarithmisch** (Befund 11): Hochpass links = aus, 20 Hz…2 kHz; Tiefpass rechts = aus, 20 kHz…200 Hz (Mitte = 2 kHz). Gespeichert wird weiter Hz.
- **Chor ohne Noten** (Befund 12): sucht erst die Noten (wie „Noten bearbeiten“); erwartete Meldungen („Keine Noten …“, „Rechnung läuft“) gehen nicht mehr in die Konsole.
- **Leicht**: Optionszeile Anwenden, −1, +1, Fertig, ▶ Vorhören zuerst (hochkant ohne Wischen), Beschriftung nur „Noten“; „Verwerfen“ dort heißt jetzt „Entwurf weg“ (13).
  Trefferfläche der Balken 36 px hoch (Balken selbst 8 px, bei Überschneidung zählt der nächste) (14). Erfolgsmeldung bleibt 4 s stehen, auch wenn der
  Spektrum-Fortschritt kommt (15). ⋯-Menü: gewohnte Reihenfolge Name, Farbe, Ebene löschen – die Werkstatt steht darunter (16; Vorschlag an Xander, ob sie nach oben soll).
- **Befund 17** (gebundener Gesang = eine Note) liegt in der Notenerkennung (SPK2/SPK3), nicht in SPK6 → nicht geändert. Vorschlag: Knopf „Teilen“ im Notenmodus
  (Note an der Abspiel-Linie teilen) – sichtbare Änderung, daher erst im Funk vorschlagen.

## Abnahme (Prüfung)
- spk6-pruef-test.mjs (Node, Kern): ALLES OK (lang + kurz). 3-min-Lied: erstes Anwenden 5,1 s (wandelt die Ebene, 546 Fortschritts-Meldungen, erste nach 57 ms,
  größte Lücke 99 ms), danach 12× je eine Note 105–205 ms (vorher 5,1–6,2 s), außerhalb bitgleich, Ziel ±0,1 ct, Nachbarn ±0,3 ct, Naht-Knack ≤ 0,73 × Note;
  ↶-Audio nach 12 Schritten 3,3 MB (vorher 201 MB), ↶/↷ bitgleich; während „Ganze Ebene +1“ (24,9 s mit 703 parallelen Block-Anfragen) jeder Block ≤ 54 ms;
  nach 6 ganzen Rechnungen ↶-Audio 50,4 MB (≤ 64). Kurz: Kopie unabhängig (In Ebene beide Richtungen, Zerlegen 0,0665 = ohne Kopie), Quelle löschen 0,1607 = Original,
  Auswahl mit Audio-Ebene/Chorstimme = ohne Auswahl, kleine Auswahl nur innen; Bereichs-Rechnung auf Kopie (geteiltes Audio) und Chorstimme (Schritt 100,0 ct).
- spk6-pruef-ui.mjs (Playwright, Touch): ALLES OK. Fein (+70 ct → 0,0 ct Abweichung), Trefferfläche (Tipp 14 px daneben trifft), Löschen/Dokumentwechsel beenden den
  Notenmodus (Rechteck wählt wieder), Chor ohne Noten (findet 1 Note, 2 Stimmen, Konsole leer), Hall-Regler + Kopieren während Chor (wartet, danach hall 0,55, Kopie da),
  Kennungen hochkant/quer in der Namensspalte (Abstand zum S-Knopf ≤ −9 px), Namen eindeutig, Tiefpass-Zug zur Mitte = 2193 Hz, Meldung bleibt; 3-min-Lied im Browser:
  Anwenden während der Wiedergabe 6,9 s (erstes, wandelt) bzw. 187 ms – Stille 0 ms, Wiedergabe lief weiter; 12 Schritte 123–200 ms, ↶-Audio 3,7 MB.
- spk6-test.mjs (Abnahme Teil 2, angepasst: Menü-Reihenfolge, 11 Knöpfe, Chor-Kennung): ALLES OK (27). spk6-ui-test.mjs 17/17, spk6-kern-test.mjs 24/24.
