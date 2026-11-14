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
