# SPK5 – NOTES (Stand Auftrag 2/3: Noten-Überblendung – fertig; Auftrag 1/3 Zerlegen sichtbar + Farbstufen – fertig)

`index.html` = basis5.html (4.60.0) + Block `SPK5-BEGIN … SPK5-END` direkt nach `/* GD1-END */` (Quelle `spk5-block.js`) + 19 Haken „SPK5“.
Bau: `python3 einbau.py` (jede Ersetzung genau 1×, bricht sonst ab). VERSION/CHANGES unberührt.

## Ursache „Auswahl → Zerlegen → keine Ebene / kein Feedback“ (repro.mjs, Touch hochkant + quer)
Im Prüf-Browser entstehen Ebenen – aber: (1) Zerlegen ignorierte die Auswahl und rechnete immer das ganze Stück (iPhone, 3-min-Song ≈ 20–60 s);
(2) einziges Zeichen war die 24-px-Statuszeile, derselbe Knopf wurde sofort „■ Abbrechen“ → ein zweiter Tipp („passiert nichts?“) brach ab:
„nichts geändert“; (3) danach lagen die Ebenen unten in der Liste (hochkant Gesang/Rest außerhalb), die Tönung lag übers ganze Bild,
bei schon zerlegtem Stück entstand keine neue Ebene. → Kein Fehler im Rechenkern, sondern fehlende Bereichs-Wirkung + fehlendes Feedback.

## Was jetzt passiert
- Knopf zweizeilig: „Zerlegen / AUSWAHL“ (Bernstein) bzw. „Zerlegen / ALLES“; aria „Zerlegen: Auswahl|alles“; quer „AUSWAHL ▾“; Klappfenster-Titel
  „Nur die Auswahl trennen“ / „Ganzes Stück trennen“. Gilt für Zerlegen UND Profi-Trennung.
- Mit Auswahl: Kern rechnet nur die Streifen der Auswahl (Haken sA/sB im SPK1-Zerlegen) und mischt neu·w + alt·(1−w) mit dem Auswahl-Gewicht
  (weiche Kante wie die Auswahl) → außerhalb bitgleich wie vorher (gemessen: außen 0, Summe ohne Überlauf). Profi: nur die Modell-Stücke, die die
  Auswahl berühren (Demo: 2 von 4), Stücke eines angefangenen Laufs werden genutzt, der Lauf-Stand bleibt unberührt.
- Während der Rechnung: Bereich schraffiert + Bernstein-Rahmen + Balken „Zerlegen · Auswahl · Trennen 53 %“ (nur Leinwand, kein DOM).
- Danach: Tönung an, neue Ebenen + Rest 3 s hervorgehoben und in die Liste gerollt, Meldung über dem Spektrum (fester Platz) mit ↶ und ✕ (12 s),
  z. B. „Zerlegt: Drums · Bass · Rest (Auswahl) – kein Gesang gefunden“. Anteil < 2 % der Energie im Bereich = „nicht gefunden“; neu angelegte
  leere Ebenen fallen im selben ↶-Schritt weg. „S“ an einer neuen Ebene spielt sofort den Bereich (Auswahl) bzw. ab Position.
- Ein ↶ je Aktion: „Zerlegen (Auswahl)“, „Profi-Trennung (Auswahl)“, „Zerlegen“. Ein angefangenes Ganz-Zerlegen bleibt fortsetzbar.
- Farben (Ansicht ▾ → Farben): Glut (schwarz → rot → orange → gelb → weiß, neuer Standard) · Magma · Grün-Blau (wahrnehmungsgleich) · Graustufen ·
  Blau (bisher). Nur Farbtabelle (texSubImage2D bzw. CPU-Tabelle), kein neues Spektrum; `localStorage synq-spk5-farbe`. Tönung auf allen Stufen erkennbar.
- Test-API `SYNQUENZER.spk5` (farbe, lut, area, last, msg, run).

## Tests
- `spk5-test.mjs <abs index.html>`: ALLES OK, 17 Prüfungen, ~40 s (hochkant + quer 926×428/926×370, Touch, CPU gedrosselt für das Fortschritts-Foto).
- `spk5-profi-test.mjs <abs index.html> <abs ki/modell> <abs ki-ort/web>`: ALLES OK (Profi nur in der Auswahl, 2,4 s Rechnung, außen 0).
- Regression: `spk/spk1-test.mjs` ALLE OK; `ki/ki1-test.mjs` = Basis (dieselben 3 vorbestehenden FEHL wie basis5).
- Fotos: fotos/spk5-00 … 07 (Glut, Fortschritt, Ergebnis Auswahl, ehrlich „kein Bass“, alles, quer, Profi), spk5-10 … 14 (Farbstufen), repro-*.

## Offen / Hinweise
1. Doppeltipp-Schutz nur 0,12 s (Prellen) – ein echter zweiter Tipp bricht ab; die Meldung sagt das dann deutlich („abgebrochen – nichts geändert“).
2. Ganz-Stück-Profi läuft über den alten Weg (fortsetzbar); leere neue Ebenen fallen dort nicht weg, nur die Meldung sagt „nicht gefunden“.
3. Auftrag 3/3 offen.

---------------------------------------------------------------------------------------------------------------------------
## Auftrag 2/3 – Überblenden Spektrum ↔ Noten (fertig)
Bau wie oben (`python3 einbau.py`, jetzt 22 Haken); Sicherung vor Auftrag 2: `spk5-block.a1.js`, `index.a1.html`.

### Bedienung
- Regler rechts in der Werkzeugleiste (156 × 44 px, hochkant und quer, die Werkzeug-Leiste wird um seine Breite schmaler und rollt wie
  bisher): links Zeichen „Spektrum“ (Balken), rechts „Noten“ (Kästchen), Daumen 24 px. Ziehen = stufenlos (relativ, kein Springen),
  Doppeltipp = 50 %, Tipp links/rechts = 0/100 %, Tipp auf die Bahn = dort hin (Tipps 0,3 s verzögert, damit der Doppeltipp nicht flackert).
  Tasten ←/→/Pos1/Ende. Statuszeile erst beim Loslassen (einmal).
- 0 % = Spektrum wie bisher (alles bitgleich: Leinwände unsichtbar, SPK2-Kästchen wie gewohnt).
  100 % = Notenrolle wie im Noten-Editor der Instrumente: Tastatur links bleibt, Zeilen weiß/schwarz (wie die Tasten, Fuge 1 px),
  Takt-Linien hell, Schlag-Linien mittel, 1/16 fein (ab 9 px Abstand), Oktav-Linie bei C; Noten als abgerundete Kästchen auf Tonhöhe
  und Raster-Zeit (t0/t1 auf 1/16), Farbe der Ebene (Original = hell), Sicherheit = Deckkraft (bestätigt voll, sonst 0,28 + 0,72·Sicherheit),
  Vorschläge gestrichelt und erst ab „Sicher ab“, Notenname im Kästchen ab 30 px × 12 px. Dazwischen: Spektrum wird blasser (Raster deckend
  mit Deckkraft f), Noten + Takt-Linien kräftiger (Deckkraft 1,8 · f, voll ab 56 %). Ab 20 % zeichnet die Notenrolle die Kästchen (SPK2-Kästchen
  auf dem Spektrum aus, Loop-Kanten bleiben) – keine doppelten Kästchen.
- Noten: tonale Ebenen (alle außer Drums); ohne solche Ebenen das Original. Sobald der Regler das erste Mal über 0 geht (und nach
  Zerlegen/Profi-Trennung, wenn neue Ebenen ohne Noten da sind), sucht der Kern im Hintergrund (op `spk5Noten`, nacheinander je Ebene,
  Fortschritt oben links in der Notenrolle „Suche Noten · Bass 40 %“). Je Dokument und Ebene einmal (danach Noten ▾ wie bisher).
  Kein eigener ↶-Schritt (Ansicht, keine Aktion): die Noten hängen am Zustand davor – ↶ Zerlegen nimmt sie mit, ↷ bringt sie zurück.
- Solo/Stumm der Ebenen wirkt auf die Notenrolle (Solo = nur diese Ebene(n), Stumm = weg; bei Solo kein Original).
- Noten-Ansicht (≥ 50 %): Tipp auf eine Note (jedes Werkzeug; Fangbereich ±6 px, mind. 16 px hoch) = dasselbe Klappfenster wie Werkzeug
  „Noten“: Kopf „Bass · G3 · 0,57 s · sicher 99 %“, Gehört zu (Bass/Gesang/Lead/Pads/Neue Ebene), Verwerfen, Klang nachbauen, dazu
  **Überall finden** (Vorlage = bestätigte Noten dieser Ebene; ohne bestätigte Note ausgegraut mit Hinweis „erst Gehört zu“).
  Tipp ins Leere / Ziehen = Werkzeug wie bisher.
- Flüssig: Überblenden ändert nur `style.opacity` zweier Leinwände und `transform` des Daumens; gezeichnet wird nur bei neuer Ansicht
  (Zoom/Rollen/Abspiel-Seite), neuen Noten, Wahl, Größe (Schlüssel-Vergleich in `spk5Roll`). Gemessen: Ziehen 50→100→20 % = 0 DOM-Änderungen,
  0 Neuzeichnungen. Leinwände entstehen erst beim ersten Überblenden (nichts beim App-Start, nichts beim Öffnen).
- Haken (alle „SPK5“): spk1Build (spk5UiAdd), spk1OvDraw (SPK2-Kästchen ab 20 % aus; spk5OvDraw ruft spk5Roll), spk1ToolUp (spk5Tap).
- Test-API `SYNQUENZER.spk5.fade(v)`, `.roll()` (f, n Neuzeichnungen, vis, search, lids, Deckkraft, auto), `.hit(i)`.

### Test `spk5-fade-test.mjs <abs index.html>` – ALLES OK (16 Prüfungen, 34 s, Touch)
Start lädt nichts · Regler in der Leiste (428×926, 926×428, 926×370: 156×44, im Bild, nicht über dem Kopf, letzte Werkzeug-Taste ganz
sichtbar erreichbar, ✕ 44×44) · Ziehen setzt 50 % · Hintergrund-Suche Bass/Gesang (129 Noten) bzw. ohne Ebenen Original (52) · kein
↶-Schritt · flüssig (0 DOM, 0 Neuzeichnen) · Doppeltipp = 50 % (Deckkraft 0,5/0,9) · Tipp rechts = 100 %, links = 0 % · Note antippen mit
Werkzeug Rechteck → Klappfenster mit Gehört zu/Klang nachbauen/Überall finden, Tasten ≥ 44 · Solo/Stumm · keine Fehler.
Fotos: `fotos/spk5-20-hoch-0.png`, `-21-hoch-50`, `-22-hoch-100`, `-23-hoch-note-antippen`, `-24-quer-428-{0,50,100}` (Original-Noten),
`-26-quer-370-{0,50,100}` (zerlegt).
Regression: `spk5-test.mjs` ALLES OK (17) · `spk/spk1-test.mjs` ALLE OK. Pflicht: topdefs 0/0 · dupkeys 0 · smoke errors [] (`smoke-a2.png`) ·
„MS 2000“ 1× · „  live: true,“ 1× · 4.60.0 wie Basis, CHANGES unberührt · keine Markennamen im Block/Test/LOG.

### Grenzen
1. Noten-Güte = SPK2/SPK3-Erkennung (einstimmig je Ebene; mehrstimmig kommt mit SPK4). Bei 84 Halbtönen im Bild sind die Kästchen
   hochkant ~5 px hoch – zwei Finger senkrecht = größer (wie bisher); kein automatischer Zoom (nichts springt).
2. Hintergrund-Suche läuft je Ebene über das ganze Stück (Demo 20 s: ~1 s; 3-min-Song auf dem iPhone geschätzt 5–15 s je Ebene),
   blockiert nichts; andere Kern-Aufträge warten in der Schlange dahinter.
3. Neu zerlegte Bereiche (Zerlegen Auswahl auf vorhandene Ebenen) suchen nicht automatisch neu – Noten ▾ → Noten finden.
