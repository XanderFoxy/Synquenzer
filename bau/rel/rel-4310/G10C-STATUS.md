# STATUS G10c – Takes-Verwaltung

**Stand:** fertig gebaut und getestet (Chromium/Playwright, Touch). Noch nicht von Xander auf dem iPhone geprüft → nicht „abgenommen“.
Basis `bau/snapshots/R-4300.html` (4.30.0), VERSION unverändert, Zweig `g10c-takes`.

## Abgabe
- `index.html` – App 4.30.0 + G10c
- `patch.diff` – gegen `bau/snapshots/R-4300.html`
- `CHANGES.md` – was, wie, Daten, überholte Erwartungen, Fragen an Xander
- `tests/` – `alle.sh` (alles), `g10c-*.mjs`, `bilder/` (Bildschirmfotos 428×926, 926×428, 428×650 inkl. „unten“ und „bearbeiten“, 390×844, 375×667, 320×568)

## Testergebnisse (`sh tests/alle.sh`, 161 × ok, 0 FAIL)
| Datei | Inhalt | ok |
|---|---|---|
| g10c-core.mjs | 7 Takes, Kopfzeile, feste Nummern (nach oben holen, A/B, Löschen, neuer Take = 8), Undo/Redo, Halten → Bearbeiten, Name/Farbe/★ per Touch, Felder wandern mit dem Stück, WAV-Name, Speichern/Laden deep-equal + Datei Zeichen für Zeichen stabil, ZIP, Kopie, Andere Takes löschen (1 Undo), Aufräumen (Größe ±5 %), Wisch nach links löscht / senkrecht nicht, ✕ schließt | 35 |
| g10c-wave.mjs | Einsatz-Lage exakt, Ausschnitt [in, out] ±1 Punkt, Hüllkurve wie `tkPeaks` (r ≥ 0,95), quantisierter Take an der gehörten Stelle (Zeitkarte, Scheiben), Chips je Zeile, Cache, Zeichnung, Vorhören (klingt am Ausgang, Lauflinie, ■ stoppt, hörbarer Take bleibt) | 15 |
| g10c-layout.mjs | 6 Größen: Blatt im Bild, ✕ sichtbar (auch nach Bildlauf), Ziele ≥ 44 px, nichts abgeschnitten, Zeilen ≥ 44 px, kein Überlauf, Chips „+n“, GarageBand-Feld und „Als Chor-Stimme duplizieren“ erreichbar, Bearbeiten-Ziele ≥ 44 px | 73 |
| g10c-ggb-alt.mjs | GarageBand-Import erscheint als „Take 1 · GarageBand hh:mm · Datei“, zweiter Import = Take 2, ★/Undo im Song, A/B im Song; altes 4.30.0-Projekt lädt und speichert Zeichen für Zeichen gleich, K4-Nummern, Löschen hält Nummern fest, ↶ stellt Zeichen für Zeichen wieder her | 17 |
| g10c-perf.mjs | G10-20: 16 Takes à 32 s → alle Mini-Wellen in ≈ 0,9 s (≤ 1,5 s), Blatt öffnen ≈ 3 ms (≤ 16 ms), Heap nicht gewachsen (≤ 2 MB), keine Aufgabe > 50 ms | 7 |
| g10c-runden.mjs | G10-24/24a in Echtzeit mit Mikro-Attrappe: Länge 4 fest, 4 Runden → 4 Segmente, je genau ein Durchgang (±1 Sample), lückenlos, eine Take-id; Blatt „Take 5 · REC · Runde 4“; Felder je Runde nach Wählen/Löschen/ZIP; „Aus“ → Clip wächst wie 4.30.0; Schalter im Mikro-Blatt | 14 |
| bau/tests smoke.mjs, v3-mk8-smoke, v3-mk8b-smoke, v3-qa-mk5reg-smoke | Rauchtests | grün (0 Fehler) |
| bau/tests n4-vs-l-mus-od.mjs (16 2 Takte, STIMME) | VS-L-Overdub (Länge AUTO) – Ergebnis gleich wie 4.30.0 | gleich |

## Abnahme G10c (Spec)
- [x] G10-20 Leistung (siehe oben)
- [x] G10-21 Mini-Welle = Ausschnitt, quantisiert an der gehörten Stelle
- [x] G10-22 Name/Farbe/★ über Speichern/Laden, ZIP, Kopie (Online-Abgleich nutzt dieselbe Projekt-Datei; nicht gegen den Server getestet – keine Datenbank-Zugriffe), auch in `alt`; WAV-Name
- [x] G10-23 Andere Takes löschen (★ + hörbarer bleiben, 1 Undo), Aufräumen meldet die freie Größe (±5 %)
- [x] G10-24 / G10-24a Durchgänge als Takes
- [x] G10-25 Chips je Zeile
- [x] G10-26 Zeilen ≥ 44 px, Chips nie abgeschnitten („+n“)

## Regeln geprüft
„MS 2000“ genau 1×, `  live: true,` genau 1×, verbotene Namen 0×, VERSION '4.30.0' unverändert, keine Emojis als Grafik (Play/Stopp/Stern als SVG), keine Datenbank-Zugriffe.

## Offen / Fragen (siehe CHANGES.md)
- Aufräumen leert den Verlauf (↶) – Rückfrage an Xander.
- Vorhören bei laufendem Transport nur Hinweis – Rückfrage an Xander.
- Gerätetest iPhone 12 Pro Max (Safari) steht aus.

## Bitte prüfen (Xander)
1. STIMME-Clip mit mehreren Takes antippen → siehst du je Take Welle, „HÖRBAR“/„STUMM“, Nummer, Uhrzeit?
2. ▶ an einem stummen Take → hörst du ihn allein, läuft die Linie über die Welle?
3. Halten auf einem Take → Name eintippen, Farbe, ★ → bleibt es nach Neuladen?
4. Einen Take löschen → behalten die anderen ihre Nummern? „Rückgängig“ holt ihn zurück?
5. Querformat und kleines Fenster: ✕ oben rechts immer sichtbar?
6. Länge 4 fest, 🎤, ● über 4 Runden → 4 Takes „Runde 1…4“?
