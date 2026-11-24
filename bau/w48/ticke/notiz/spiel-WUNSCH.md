# spiel – Wünsche an fremde Dateien (für den Zusammenbau)

1. **sw.js** (Pflicht): neue Datei `./module/spiel/aeste.js` in `DATEIEN` und `PRUEF` aufnehmen (wird von `module/spiel/modul.js` statisch importiert; ohne Eintrag fehlt sie offline). Sonst keine neuen/entfallenen Dateien im Modul.

2. **module/liste.js**, Eintrag `spiel` (nur Kommentare, kein Verhalten):
   ```js
   routen: ['spiel'],                // spiel · spiel/runde · spiel/ergebnis · spiel/wahlen[?id=p01] · spiel/so
   fragen: []                        // bewusst leer: eigene Kachel „Entweder – oder: schnelle Wahl“ (Startseite, Karte in „Fragen“), nicht Teil des Start-Fragebogens
   ```

3. **seiten.js** Zeile ~57 und ~219: „etwa 4 Minuten“ → „etwa 3 Minuten“ (jetzt 40 Wahlen statt 53; Kopfnüsse, Kontroll- und leichte Fragen sind weg). Die übrigen Texte des Kerns zu „Entweder – oder“ passen schon.

4. **module/muster** (Hinweis, keine Änderung nötig): Ast-IDs von spiel sind `spiel.offenheit`, `spiel.gewissenhaftigkeit`, `spiel.extraversion`, `spiel.vertraeglichkeit`, `spiel.stabilitaet` (alle bereich 'Persönlichkeit') und `spiel.interessen` (bereich 'Interessen', unteraeste `spiel.interessen.R` … `.C`). `ueben[].route` ist eine Hash-Route **ohne** „#“ (z. B. `training/uebung/h-atem`, `fragen/interessen/riasec`). `muster(k)` liefert Einträge erst ab 4 beantworteten Paaren je Richtung bzw. 10 Tätigkeits-Wahlen; ohne Wahlen im aktuellen Lauf nimmt es das zuletzt gespeicherte Ergebnis (auch das alte Format 0.2.1, in Worte übersetzt).

5. **#antworten (Kern)**: `antwortListe` liefert 55 Einträge (`art: 'wahl'`, Optionen `a`/`b`, `route: 'spiel/wahlen?id=<id>'`), Gruppen „Zwei Aussagen“, „Noch einmal gefragt“, „Dreier-Vergleiche“, „Tätigkeiten (freiwillig)“. `antwortSetzen(k, id, 'a'|'b'|null)` gibt `true` (geändert) / `false` (nichts zu tun) zurück und wirft bei ungültigem Wert. Getestet: Die Kern-Seite `#antworten/spiel` zeigt die 55 Wahlen.
