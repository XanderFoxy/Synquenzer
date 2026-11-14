# NX1 – LOG (Nachzüge Gesang-Editor + Import)
- 14:3x Start Auftrag 1/2: index.html = basis2.html (cmp gleich).
- (a) Lineal Song-Stimme = Song-Takte: fertig (Code) – vx1rBuild opts.tk = nx1VoxTk(vox) (beat/at über barBeat/barAt relativ zum Block, lab = Song-Takt); PianoRoll tkLab im Lineal, fmtPos, vx2Pos. Szene-Clips ohne tk = unverändert. Test folgt.
- (b) Ecke „1 Stück“/„n Stücke“: fertig (Code) – PianoRoll Ecke nimmt opts.audio.unit; nur Gesang-Editor setzt es. Test folgt.
- (c) Marken-Editor Schneiden/Dehnen: fertig (Code) – dritter Knopf „Schnitt+Dehnen“ (hidden, nur bei Takes mit Ankern/hybrid), wpSetMode behält 'hybrid', Undo-Text. Test folgt.
- (d) Rückfall ohne Worker stückweise: fertig (Code) – vx1rRun → Generator nx1RunG (yield je Stück / je 32 Rahmen), Worker rechnet in einem Zug, nx1Local ≤ 25 ms je Schritt. Test folgt (bitgleich + max Schritt).
- (e) Import dehnen: fertig (Code) – nx1ImpView/nx1ImpStretch (op 'stretch' im Zeitkarten-Worker, eigener Aufruf ohne Hauptfaden-Rückfall), nx1HasAu zählt auch Song-Clips/Song-Gesang (imp1Prep). Test folgt.
- (g) Guide: fertig (Code) – Eintrag 'midiimp' heißt „Audio/MIDI importieren“, findet audio/mp3/tempo/teile.
- Pflicht nach Einbau: topdefs doppelt 0 / Syntax 0 (erst 1 Syntaxfehler: Kommentar mitten in imp1Prep-Zeile → behoben), dupkeys 0, smoke errors [] (smoke1.png), MS 2000 1×, live: true 1×.
- Test nx1-test.mjs (Touch über CDP, 2 Seiten, ~2 min): ALLE OK 33/33 (test5.log). Befunde unterwegs, behoben:
  · (c) drei Knöpfe passten nicht (60 px, „Scheiben“ abgeschnitten) → bei Gesang-Editor-Takes steht „Schnitt + Dehnen“ (2 Zeilen) AN DER STELLE von „Scheiben“ (zwei Knöpfe wie bisher; spielt der Take 'slice', bleibt Scheiben).
  · (e) gleichmäßiges WSOLA: Schläge bis 12,8 ms daneben → Abschnitte je Viertel des erkannten Rasters, Anschlag 30 ms bitgleich (lock) → max 2,1 ms.
  · (d) Schritt bis 56 ms unter Last → yields feiner, Budget 12 ms → längster Schritt 29 ms, längste Pause 33 ms.
- (a) fertig – Beleg: Song-Stimme Takt 3–5 → Lineal 3,4,5; Szene-Clip 1,2; Taktart-Karte (Takt 4–5 in 3/4) beat 0,4,7,10, Lineal 3,4,5.
- (b) fertig – Beleg: ALLE → „1 Stück“ (Touch-Tipp) → „3 Stücke“; Instrumente „1 Note“ unverändert. Foto fotos/nx1-gesang-ecke-hochkant.png.
- (c) fertig – Beleg: ohne Anker nur Dehnen│Scheiben (wie bisher); nach Quant. im Gesang-Editor „Schnitt + Dehnen“ gewählt; Dehnen → stretch, zurück → hybrid (Anker da), je ein ↶ („Modus · Schnitt+Dehnen“); Raster 1/16 bleibt hybrid; 44 px, Text passt in 428×926, 926×428, 926×370. Fotos nx1-marken-hybrid-*.png.
- (d) fertig – Beleg: Generator bitgleich zur Basis (Analyse + Schneiden/Dehnen, 61 s, 102 Stücke), Worker = Hauptfaden bitgleich, am Stück nicht langsamer (vxa 407→335, hyb 242→232 ms, Bestwert aus 3); ohne Worker stückweise, längster Schritt 29 ms, App-Weg Quantisieren ohne Worker 19,6 ms.
- (e) fertig – Beleg: leeres Projekt + Lied 91,6 → Projekt 92, Take = 3066341 × 0,99565 Proben, 95 Schläge ±2,1 ms auf dem 92er-Raster (ungedehnt letzter Schlag 271 ms daneben), Tonhöhe = Original (±0,04 Hz), ein ↶; Projekt mit Audio (92) + Lied 100 → bleibt 92, 100/92 gedehnt, Schläge ±1,7 ms; ↶↶ = Stand vorher; 96 in leeres Projekt → unverändert wie bisher. Dehnen im Worker 0,7 s für 64 s Audio, Hauptfaden-Pause beim Dehnen ≤ 23 ms (Ablegen selbst wie bisher 53–77 ms).
- (f) fertig (war schon da) – Beleg: Zelle der Spur „Original“ zeichnet tkMiniSvg wie Gesang-Clips (64 Säulen, Signatur au:); kein Code nötig.
- (g) fertig – Beleg: Suche „mp3 importieren“ → midiimp „Audio/MIDI importieren“, Sprung ringt den Knopf im Export-Blatt.
- (h) offen (ehrlich): Takes sind mono gespeichert (Int16-Stücke in IDB, tkPcm/tkLoad bauen 1-Kanal-AudioBuffer, Container schreibt takes/<id>.wav mono, Rundlauf/Normalisieren darauf gebaut). Die Wiedergabe-Quelle könnte Stereo spielen, aber Speichern/Laden/Container müssten einen zweiten Kanal bekommen = Umbau → nicht gemacht.
- Ende Auftrag 1: Pflicht final topdefs 0/0, dupkeys 0, smoke errors [] (smoke-end.png), Markenwörter 282 = Basis, VERSION unberührt; Regression vx1-test 61/61, imp1-test ALLE OK; NOTES.md geschrieben. Offen: (h).
- 15:03 Start Auftrag 2/2 (Test): nx1-test a–g war schon 33/33 (test5.log); jetzt h, Regression spk1, Nachprüfung.
- 15:04 Regression spk1-test (mess/ verlinkt): 17 OK, 1 FEHLER verfeinern-verbessert-ziel (Bass 0,77 → −0,46 dB) – IDENTISCH zur Basis 4.57.0 (reg-spk/spk1-basis.log, gleiche Zahlen) = bekannter offener Punkt aus SPK1, nicht durch NX1. Log reg-spk/spk1.log, Fotos reg-spk/.
- 15:05 (h) Test ergänzt: Stereo-WAV (links 440 Hz, rechts 660 Hz, 91,6 BPM) → Take mono, beide Seiten gleich laut (0,043/0,046), gedehnt auf 92, Tonhöhe 440,2/659,9 Hz, ein ↶ → OK. nx1-test ALLE OK 35/35 (test6.log). Stereo selbst bleibt offen (Umbau).
