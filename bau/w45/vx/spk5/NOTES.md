# SPK5 – NOTES (Stand Auftrag 3/3: Hybrid + Gesamttest – fertig; 2/3 Noten-Überblendung – fertig; 1/3 Zerlegen sichtbar + Farbstufen – fertig)

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
3. Auftrag 3/3 erledigt (unten).

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

---------------------------------------------------------------------------------------------------------------------------
## Auftrag 3/3 – Hybrid sichtbar + Gesamttest (fertig)
Bau wie oben (`python3 einbau.py`, jetzt 23 Haken); Sicherung vor Auftrag 3: `spk5-block.a2.js`, `index.a2.html`, `spk5-test.a1.mjs`, `spk5-profi-test.a1.mjs`.

### Hybrid (Profi-Trennung als Grundlage, klassische Werkzeuge zum Herausarbeiten)
- Ist die Profi-Trennung auf dem Gerät, steht im Klappfenster „Zerlegen ▾“ (hochkant ▾ neben Zerlegen, quer „Zerlegen ▾“) zuerst
  **„Profi-Trennung (genauer, ≈ 10 s)“** (Bernstein-Kante links), danach „Zerlegen (schnell, ohne Download)“; Hinweis darunter:
  „Genauer, vor allem Gesang und Bass. Danach arbeiten Verfeinern, Harmonische, Pinsel, In Ebene und Gehört zu auf diesen Ebenen weiter.“
  Ohne Modell bleibt alles wie bisher (Zerlegen zuerst, „Profi-Trennung laden (~86 MB, einmalig)“).
- Reihenfolge wird beim Öffnen sofort entschieden (`spk5KiDa`: KI1-Zustand ready/cached → letzter Cache-Blick `KI1.scan` → Merker
  `localStorage synq-ki1` aus ki1Scan) – nichts springt, wenn der Cache-Blick später antwortet. Der hochkant große Knopf „Zerlegen“
  rechnet weiter sofort klassisch (bewusst nicht geändert: Bedienung wie festgelegt; Profi = ein Tipp auf ▾).
- Geprüft, dass es wirklich ein Hybrid ist: Profi-Ebenen sind dieselben Ebenen wie beim Zerlegen (`z` = drums/bass/gesang, `art` gleich) →
  Verfeinern Bass trifft die Profi-Bass-Ebene (L2), In Ebene verschiebt in eine Profi-Ebene, Noten finden + Gehört zu → Bass legt die Note
  in die Profi-Bass-Ebene; keine neue Ebene, je Aktion ein ↶, 4× ↶ = zurück auf „Profi-Trennung (Auswahl)“.
- Guide „Spektral (Frequenzspektrum)“ +3 Sätze (Profi zuerst, normale Ebenen + Werkzeuge, Werkzeuge holen heraus, was übersehen wurde);
  Suche zusätzlich „profi“, „hybrid“, „genauer“ (der Eintrag „Profi-Trennung“ bleibt Treffer 1).
- Kleiner Fehler behoben: das Klappfenster wurde nach dem Cache-Blick breiter (Texte kommen später; mit Ersatzschrift) und ragte quer bis
  10 px über den rechten Rand. Jetzt steht „vom Gerät löschen (86 MB)“ bei geladenem Modell gleich drin, und `spk5DdFit`
  (ResizeObserver, wirkt nur bei Größenänderung) hält das Fenster rechts im Bild.
- Haken (SPK5): `ki1Dd` → `spk5KiOrder(U, dd, z, p, tx, x)`; Guide-Text/Suchwörter in `spk1Guide`. Test-API `SYNQUENZER.spk5.kiDa()`.

### Tests
- `spk5-test.mjs <abs index.html>` – **ALLES OK, 24 Prüfungen, 54 s** (Touch, 428×926 + 926×428 + 926×370): Start lädt nichts · Knopf sagt
  Auswahl/alles · Fortschritt über dem Bereich (CPU gedrosselt) · Ebenen angelegt + Hervorhebung + Tönung an · Meldung mit ↶ · nur in der
  Auswahl (außen 0, Summe ohne Überlauf) · Solo = sofort hören · ↶ aus der Meldung · ehrlich „kein Bass“ (keine leere Ebene) · Farbstufen
  (5 Stufen, Tasten 44, kein Neurechnen) + gemerkt nach Neuladen · Zerlegen alles · Layout hochkant (Regler im Bild, ✕ 44) ·
  **neu:** Klappfenster ohne Profi = Zerlegen zuerst · Überblendung 50/100/0 % (Deckkraft 0,5/0,9 · 1/1 · 0/0, 129 Noten aus den Ebenen,
  drei verschiedene Bilder) · Note antippen (100 %) → Gehört zu → Gesang = „Note zuordnen“, keine neue Ebene, ↶ über die Kopf-Taste 44×44 ·
  quer 428/370: Zerlegen Auswahl + Layout + Überblendung 50 % + Klappfenster bleibt im Bild auch beim Breiterwerden · keine Fehler.
- `spk5-profi-test.mjs <abs index.html> <abs vx/ki/modell> <abs ki-ort/web>` – ALLES OK (6): Profi nur in der Auswahl (außen 0) ·
  vor dem Laden Zerlegen zuerst · mit Modell Profi zuerst (Kante, bleibt an Ort nach dem Cache-Blick, Hinweis) · Werkzeuge auf Profi-Ebenen
  (s. o.) · keine Fehler. Routen nach Dateiendung (keine Host-Namen in der Datei).
- `spk5-fade-test.mjs` ALLES OK (16) · `../spk/spk1-test.mjs` ALLE OK.
- `../spk3/spk3-test.mjs <abs index.html> <abs basis5.html>`: 13 OK / 4 FEHLER = die bekannten offenen SPK3-Ziele (bass-zerlegen-4db 3,01 ·
  verfeinern-plus-1db +0,52 · mehrstimmig 0/28 → SPK4 · nachbau-abstaende-besser „gleich“, weil basis5 SPK3 schon enthält); regression-spk2 OK.
- `../ki/ki1-test.mjs`: quer-428/quer-370 erwarten bei geladenem Modell „Zerlegen (schnell)“ als 1. Eintrag – genau das ändert Auftrag 3
  absichtlich. Kopie `ki1-test-spk5.mjs` (gleicher Aufruf) mit neuer Erwartung: quer OK; übrig dieselben 3 vorbestehenden FEHL wie basis5
  (besser-als-klassisch-demo, gesang ohne WAV-Argument, guide-eintrag ohne gemessene Geschwindigkeit). Beim Übernehmen in den
  Release-Satz: die Erwartung in `ki1-test.mjs` Zeile „quer-“ ebenso umstellen.
- Pflicht: topdefs doppelt 0 / Syntaxfehler 0 · dupkeys 0 · smoke errors [] (`smoke-a3.png`) · „MS 2000“ 1× · „  live: true,“ 1× ·
  VERSION 4.60.0, CHANGES unberührt · Block direkt nach „/* GD1-END */“ · keine Marken-/Hostnamen in Block, Tests, LOG, NOTES.
- Fotos: `fotos/spk5-08-hybrid-klappfenster.png` (Profi zuerst), `spk5-30-fade-0`, `-31-fade-50`, `-32-fade-100` (Ausschnitt Spektrum),
  `-33-note-antippen`, `-34-quer-428-fade-50`, `-35-quer-370-fade-50`.

### Funk-Vorschlag (nicht gebaut, sichtbar anders)
- Hochkant: soll der große Knopf „Zerlegen“ bei geladenem Modell direkt die Profi-Trennung rechnen (statt erst ▾)? Heute bewusst nicht,
  weil Xander die Bedienung so festgelegt hat – ein Satz im Funk genügt.
