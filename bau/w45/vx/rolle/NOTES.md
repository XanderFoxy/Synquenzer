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

## Schritt 3 (Editor-Oberfläche) – Stand 14.11.2026
Gesang-Editor = dieselbe `PianoRoll.create` im Blatt des Noten-Editors (EL.rollSheet, R.editor 'roll', `ED.rollAt = {t, s, vx: 1}` bzw.
`{t: stimmeT(), s: -1, vox, vx: 1}`). Öffnen heute nur per `vx1rOpen(r)` / Test `__vx1.open(r)` (Zugänge = Schritt 4).
Die Stücke sind virtuelle Noten `{t, d, n, v: 1, _k (Marke), _a (Anker in Schlägen), _p (Stück), _sh}` eines Modells `vx1rModel()`;
Schlag ↔ gehörte Take-Zeit: T = a.in + (b − a.at)·spb (Raster-Ursprung = wpT0). Gezeigt erst nach der Analyse (Kopf „Analyse …“) – nichts springt.
Neue Einhänge-Zeilen (Kommentar „VX1R“, ohne `opts.audio` bitgleich):
- PianoRoll: `hitNote` (keine Längen-Zone), `case 'move'` (q = opts.audio.snap → Anker rastet ABSOLUT am Raster; Untergrenze −4 Schläge,
  damit der Anschwung vor Schlag 0 liegen darf), Lineal-Längengriff aus, `tap()` meldet die getippte Stelle (opts.audio.tap).
- `buildRoll` → `vx1rBuild`, `rollHeadUpdate` → `vx1rHead`, `rollFrame` → `vx1rFrame` (Szene wie Instrumente, Song-Stimme im Song-Takt,
  Vorhören), `closeSheets` → `vx1rClosed` (Vorhören + QUANT.-Blatt enden), `wpUndone` → `vx1rUndone` (Editor folgt ↶ ↷).
- CSS `/* VX1R-CSS-BEGIN … END */`: `.pr.vx1r` ohne Anschlag-Zeile (--pr-vh 0), `.vx1rx{display:none!important}`.
Bedienung: Werkzeug fest ⬚ (Tipp = wählen/Mehrfachwahl, leer ziehen = Rahmen, Stück ziehen = verschieben mit Achsen-Sperre der PianoRoll).
Sichtbar: Raster (1/4 … 1/32, aus – der Raster-Knopf der PianoRoll), ⤢, ▶ (ab Auswahl, ■ stoppt; Tipp auf ein Stück spielt es allein),
↶ ↷, Teilen (an der getippten Stelle, sonst wo die PianoRoll teilt; neues Stück behält seinen Platz: vd = gehörter Anker), Verbinden
(alles zwischen erstem und letztem gewählten Stück), Quant. (Blatt im Stil des Quantisier-Blatts: 1/4 1/8 1/8T 1/16 1/16T Aus, Stärke
0–100 %, Auswahl oder alle → vx1rQuantize), Text erkennen (nur ohne Silben; G9 `g9RecJob`, sonst Marken-Editor), Takes … (altes Blatt), ✕.
Gesten → Daten beim Loslassen (vx1rApply): waagrecht = vd (Anker auf Raster), senkrecht = `vx1rPitchMany` (G2, ein g2Edit), beides =
EIN Undo (zweiter Eintrag wird zusammengelegt). Während des Ziehens nur Neuzeichnen (keine Analyse/Render je Bewegung).
Zeichnen (`vx1rDeco`, Canvas der PianoRoll): Körper Spurfarbe, stimmlos grau getönt + schraffiert, Welle (Hüllkurve, √-Skala), Tonhöhenkurve
(G2-f0, ±1 Zeile), Anker = 4-px-Linie (hell mit dunklem Rand), Silbe dunkles Schild/Bernstein rechts unten vom Anker, Raster-Linie leuchtet
beim Einrasten 0,5 s (Bernstein).
Test `vx1r-ed-test.mjs` (Touch über CDP): 36/36; Fotos fotos/vx1r-hochkant.png, -ziehen.png, -quant.png, -quer-428.png, -quer-370.png.
Knopfhöhe wie im Noten-Editor (36 px hochkant, 30 px quer; Trefferfläche = Leistenhöhe, unverändert übernommen).

Offen für Schritt 4: Zugänge (openRoll-Weiche STIMME-Clip → vx1rOpen; Takes-Blatt „✎ Bearbeiten“; Song-Stimme svTap), Ecke „1 Note“ der
Aktionsleiste heißt bei Gesang noch „Note“, Hinweis .json ohne Audio, Projekt laden/Clip gelöscht mit offenem Editor, Song-Stimme mit
Taktart-Karte (opts.tk), Marken-Editor zeigt 'hybrid', Hauptfaden-Rückfall stückweise.

## Schritt 4 (Zugänge + Speichern) – Stand 14.11.2026
Neue Einhänge-Zeilen (Kommentar „VX1R“):
- `openRoll`: STIMME-Clip mit Audio (`vx1rCan`: Audio auf der eigenen Seite, Take da, nicht in TK.missing) → `vx1rOpen({t,s})`; sonst wie bisher
  `tkSheet` (leerer Platz → G-GB-Blatt, Claude-App, Take fehlt). Damit öffnen ✎ (EL.bEdit), Clip-Blatt „✎ Bearbeiten“, Toasts „Bearbeiten“, Guide
  denselben Editor wie bei Instrumenten. Ein Tipp in der Matrix startet/stoppt weiter (wie bei Instrumenten).
- `svTap`: Gesang-Block → `vx1rAt(vox, bar)` merkt die Stelle, dann Takes-Blatt wie bisher.
- `tkSheet`: `d.a === 'vx1r'` → `closePop(); vx1rOpen(rr)`. `tkSheetPaint`: `vx1rTkBtn(x)` = `[✎ Bearbeiten]` (`.tk-vx1r`, 44 px, grau ohne Audio)
  vor „✎ Marken & Timing …“. `oriTkOrder`: `.tk-vx1r` ist der erste Knopf im Abschnitt „3 · Bearbeiten“.
- `vx1rOpen`: Song-Stimme → `vx1rShowBar` (showPage auf den getippten Takt, sobald die Fläche gemessen ist).
- `saveFile`: `vx1rJsonHint()` – nach „Als Datei sichern“ mit Gesang 1,6 s später Toast „Gesang-Audio ist nicht in der .json“ [Mit Audio sichern]
  (= `va1BoxSave`, der vorhandene Container). Ohne Gesang / Claude-App: nichts.
- CSS: `.tksheet .tk-vx1r` = Maße von `.tk-wp`. Guide-Eintrag `vx1rroll` „Gesang bearbeiten wie Noten“ (ui1Entries, Sprung öffnet den Editor).
Wiedergabe: keine eigene Kette – `vx1rCommit` → `wpAfter` → `wpPlay`/Render im Worker → `wpSwitch` (Überblendung im Lauf). Ein Take = eine Zeitkarte:
Matrix-Clip und Song-Stimme mit demselben Take hören dieselbe Fassung. Container: alles sind Felder in `S.takes` (marks an/vd, warp 'hybrid', pitch sh)
+ `takes/<id>.wav` + manifest → nichts zu ergänzen. Rundlauf geprüft (Zip → parseAny → importProject): Daten gleich, Render bitgleich.
Befund behoben (Schritt 3): in `vx1rDeco` stand `g.beginPath(); let on = false;` hinter einem `//` – die Tonhöhenkurve überschrieb damit die globale
Hilfsfunktion `on()` (danach TypeError z. B. im Clip-Blatt). Jetzt eigene Variable.
Tests: `vx1r-zug-test.mjs` 24/24, `vx1r-blatt-test.mjs` 13/13 (Takes-Blatt 428×926, 926×428, 926×370; Überlappung ohne klebenden Kopf, Basis gleich),
`vx1r-ed-test.mjs` 36/36, `vx1r-kern-test.mjs` 34/34. Fotos: fotos/vx1r-takes-blatt.png, vx1r-takes-*.png, vx1r-song-editor.png.
Andere Tests: nur ggb/pruef-ausrichtung/a10 ruft openRoll auf der STIMME-Spur – leerer Platz, bleibt beim G-GB-Blatt.

Offen für Schritt 5: Lineal der Song-Stimme zählt Takte ab dem Block (Kopf „Song · Takt 3–5“ stimmt; Lineal „1, 2 …“) – Taktart-Karte (opts.tk)
wie die Song-Melodie; Ecke „1 Note“ der Aktionsleiste heißt bei Gesang „Note“; Marken-Editor zeigt Modus 'hybrid' nicht eigens; Hauptfaden-Rückfall
(ohne Worker) stückweise; Chor-Spuren (G6) mit eigenem Clip öffnen ebenfalls den Editor (tkRef) – nicht eigens getestet.
