# VX1 Gesang-Notenrolle – Notizen

## Schritt 2 (Kern ohne Oberfläche) – Stand 14.11.2026
Block `/* ===== VX1-BEGIN … */ … /* VX1-END */` direkt nach der Haupt-Zeile `/* KF1-END */` (index.html ~96382–96714).
Präfix `vx1r`/`VX1R` (das alte Paket VX1 belegt `vx1…`). Einhänge-Zeilen (Kommentar „VX1R“), sonst nichts geändert:
- `wpNormMarks`: `vx1rNormMark(k, o, len)` – Marke behält `an` (Anker-Abstand, s) und `vd` (eigenes Ziel des ANKERS, s).
- `wpNormWarp`: Modus `'hybrid'` bleibt, `vx1rNormWarp` hält `warp.an` (Anker je Kartenpunkt). Alte App-Fassungen spielen 'slice'.
- `wpKey`: `+ vx1rKeyX(w)` (Anker gehören zur Fassung; ohne hybrid = '' → alte Schlüssel gleich).
- `wpRun`: Ops `'hyb'`/`'vxa'` → `vx1rRun(M, m)`; `wpWorker`: `vx1rRun.toString()` im Worker-Quelltext.
- `wpRender`: `w.mode === 'hybrid'` → `vx1rMsg(b, w)`.
- `wpQuant`: `o.mode === 'hybrid'` → `vx1rQuant(id, m, o)` (Anker statt Marke auf das Raster, vd überschreibt; nie in den
  Einsatz des Vorgängers: Ziel ≥ Vorgänger-Ziel + Anker + 30 ms). wpRequant/wpSetQ/wpEdit des Marken-Editors laufen damit mit.

Kern-Funktionen: `vx1rRun` (DSP, in sich geschlossen), `vx1rAnalyse(id)` (Marken + Op 'vxa' im Zeitkarten-Worker + G2-Analyse
parallel, Cache je Take+Quelle+Marken), `vx1rPieces(id)` (Stücke: t, end, an, at, vb, uv, m, tx, vd, dst, da), `vx1rCommit`
(ein Undo 'takes', Marken normalisiert, Karte 'hybrid', wpAfter), `vx1rMove`, `vx1rQuantize` (alle: Raster+Stärke, vd weg;
Auswahl: vd je Stück mit Stärke), `vx1rSplit`, `vx1rJoin`, `vx1rPitch` (G2-Noten an Stück-Grenzen teilen, sh), `vx1rSnap`, `vx1rReady`.
Test-Zugang `window.__vx1` = analyse, list, move, quant, split, join, pitch, ready, warp, marks, render, dsp, norm, state.

Definitionen:
- Anker = lautestes Sample im ersten Gipfel der Spitzen-Hüllkurve (max |x| ±2,5 ms, Schritt 1 ms; Rahmen ≥ 90 % des Höchstwerts,
  zusammenhängend) in [Marke, Marke + 120 ms) und vor der nächsten Marke; an der Quelle, die gerendert wird (wpBase).
- Konsonant/Vokal: Rahmen 10 ms; gesungen = Autokorrelation (8 kHz, 80–400 Hz) > 0,6 und Nulldurchgangsrate < 0,2; sonst stimmlos
  (über Pegelschwelle). vb = Beginn des gesungenen Laufs, in dem der Anker liegt. uv = stimmlose Läufe im Stück.
- Tonhöhe m = Median der G2-f0 (VS2) im Stück; Rückfall eigene f0 (kleinste Periode nahe am Bestwert).
- Silbe tx = g9LabelsOf (G9) bzw. wpLyr (Songtext) an Index k; '·'/'–' = leer.
- Anlauf (lead): wpDetect setzt die Marke oft an den Vokal-Beginn. Liegt direkt davor ein stimmloser Lauf (≤ 150 ms, nicht vor
  Vorgänger + 40 ms), beginnt das Stück dort: in vx1rPieces sofort, gespeichert beim ersten Bearbeiten (Marke rückt auf den
  Konsonanten, an wächst um denselben Betrag; ein Undo). Test: erkannte Stücke beginnen 0–1 ms am Konsonanten.
- Hybrid (Op 'hyb'): Schnitt ≤ 4 ms (WP_LEAD) vor der Marke am Nulldurchgang; fest (bitgleich): Schnitt … Anker + 20 ms.
  Unveränderte Nachbarn nahtlos. Platz kleiner → Ausklang bitgleich bis zur Ausblende, Ausblende 10–30 ms gleiche Leistung,
  endet im Vorlauf des Nachfolgers (dort dessen Einblende ≤ 6 ms). Platz größer → Vokal-Teil per VSX.stretch (WSOLA) bis 1,5×,
  Inhalt reicht in den Vorlauf des Nachfolgers (Überblendung); darüber Lücke mit Ausblende 10–30 ms. Länge = Take-Länge.

Messung (vx1r-kern-test.mjs, synthetischer Gesang 6 Silben, 120 BPM, 1/8): 34/34 OK – Anker = lautestes Sample (≤ 0,13 ms),
Anker-Ziel auf 1/8 (≤ 0,01 ms), gehörter Spitzenwert auf dem Taktstrich (≤ 0,1 ms), Einsatz bitgleich, links nicht gestaucht
(bitgleich bis zur Ausblende, 376–378 ms je Stück), max. Sprung an jeder Grenze ≤ Sprung im Vokal der Quelle (z. B. 0,025/0,029),
Dehnen rechts 1,17× ohne Lücke, Hauptfaden = Worker bitgleich, Undo je Aktion, Container enthält an/vd/hybrid, alte Takes gleich.
Leistung (Hauptfaden, Testrechner, 60-s-Take, 120 Stücke): Analyse 330 ms, Hybrid-Render 481 ms (im Worker; Rückfall Hauptfaden blockiert so lange).

Offen für Schritt 3/4: Editor (PianoRoll + opts.audio, noteDeco), Zugänge (openRoll/buildRoll/rollFrame/tkSheet/svTap), wpUndone-Haken
für den offenen Editor, Marken-Editor zeigt 'hybrid' (wpSetMode macht daraus 'slice'), G10e-Feinregeln (Q-Bereich, Nur Wortanfänge)
gelten im Modus 'hybrid' nicht, .json-Hinweis (Gesang nur im Container), Hauptfaden-Rückfall stückweise.
