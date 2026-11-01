# VV-LOGO – Status (01.11.)

**Fertig gebaut, alle Tests grün – wartet auf Xanders Prüfung am iPhone (ohne sein Okay nicht fertig).**
Basis App 4.26.1 (`bau/snapshots/R-4261.html`), VERSION unverändert. Abgabe: `index.html`, `patch.diff`, `CHANGES.md`, `tests/`.

## Testzahlen (`tests/alle.sh`, Chromium 1243 headless, ffmpeg-Auswertung der fertigen Dateien)
| Test | Ergebnis |
|---|---|
| Export WebCodecs 16:9 / 9:16 / 1:1 | 20/20 · 20/20 · 20/20 |
| Export Echtzeit-Aufnahme (iPhone-Weg) 16:9 / 9:16 / 1:1 | 20/20 · 20/20 · 20/20 |
| Export WebCodecs mit nur `.mov` auf der Seite | 20/20 |
| Bedienung (an/aus, gemerkt, Logo fehlt ×3, .mp4→.mov, eigene Datei, Screen-Key, 6 Bildschirmgrößen) | 40/40 |
| Regression ohne Logo gegen R-4261 (beide Wege) | 22/22 |
| Abbruch im Abspann | 4/4 |
| Rauchtests `bau/tests/smoke.mjs`, `v3-mk8-smoke.mjs`, `v3-mk8b-smoke.mjs` | ohne Fehler |
| **Summe** | **226/226** |

Je Export-Lauf geprüft: Länge = Song + 1 s + Logo (3 s) + 0,5 s (Datei ±0,06 s WebCodecs / ±0,2 s Echtzeit), Tonspur bis zum Ende,
Abblende (nach 0,5 s halb dunkel, nach 1 s schwarz), Logo mittig, Größe ≤ 60 % der kürzeren Seite, Ecken des Logo-Felds und alles
außerhalb schwarz (kein Kasten), Einblenden, Logo läuft (wandernder Balken an der richtigen Stelle), 0,5 s Schwarz am Schluss,
Musik im Song, Ton am Song-Ende < −50 dBFS, Abspann still (< −60 dBFS; gemessen −200 = digitale Stille), keine Konsolenfehler.
Screen-Key über hellem Bild (Grau 200): Logo-Ecke bleibt 200 (normales Zeichnen ergäbe 0).

## Beispielbilder (`tests/bilder/`)
- `export-wc-16x9-1-song-ende.png` → `-2-abblende-halb.png` → `-5-logo-1s.png`; Kontaktblatt `export-wc-16x9-blatt.png`
- `export-mr-9x16-blatt.png` (iPhone-Weg hochkant, Zähler der Test-Animation läuft durch), `export-wc-1x1-5-logo-1s.png`
- Blatt „Video“: `ui-390x844.png`, `ui-844x390.png` (quer: Zeile unter der Vorschau), `ui-320x568.png`

## Offen / nicht prüfbar hier
- Echtes iPhone 12 Pro Max (Safari): Echtzeit-Weg mit MP4, Laden von `.mov`, Dateiauswahl – bitte Xander prüfen.
- Xanders echtes Logo liegt nicht im Repo (absichtlich); zum Einschalten `medien/abspann-logo.mp4` (oder `.mov`) neben die App legen.
- Fragen an Xander: siehe CHANGES.md (1:1-Format, Musik-Ausblendung, Logo-Ende, eigene Datei entfernen, offline, Vorschau).

## Bitte prüfen
1. Menü → Video: Zeile „Abspann“ – [Abspann-Logo] zeigt „an“ (mit Logo auf der Seite) bzw. ausgegraut „Logo fehlt“.
2. Video erstellen (9:16 und 16:9): am Ende 1 s Abdunkeln, Logo mittig, kein schwarzer Kasten, still, 0,5 s Schwarz.
3. Schalter aus → Video ohne Abspann; App neu laden → Wahl bleibt.
4. [Andere Datei wählen …] → eigene Datei → „an · eigene Datei“, nächstes Video mit dieser Datei.
