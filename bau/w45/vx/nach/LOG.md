# NX1 – LOG (Nachzüge Gesang-Editor + Import)
- 14:3x Start Auftrag 1/2: index.html = basis2.html (cmp gleich).
- (a) Lineal Song-Stimme = Song-Takte: fertig (Code) – vx1rBuild opts.tk = nx1VoxTk(vox) (beat/at über barBeat/barAt relativ zum Block, lab = Song-Takt); PianoRoll tkLab im Lineal, fmtPos, vx2Pos. Szene-Clips ohne tk = unverändert. Test folgt.
- (b) Ecke „1 Stück“/„n Stücke“: fertig (Code) – PianoRoll Ecke nimmt opts.audio.unit; nur Gesang-Editor setzt es. Test folgt.
- (c) Marken-Editor Schneiden/Dehnen: fertig (Code) – dritter Knopf „Schnitt+Dehnen“ (hidden, nur bei Takes mit Ankern/hybrid), wpSetMode behält 'hybrid', Undo-Text. Test folgt.
- (d) Rückfall ohne Worker stückweise: fertig (Code) – vx1rRun → Generator nx1RunG (yield je Stück / je 32 Rahmen), Worker rechnet in einem Zug, nx1Local ≤ 25 ms je Schritt. Test folgt (bitgleich + max Schritt).
- (e) Import dehnen: fertig (Code) – nx1ImpView/nx1ImpStretch (op 'stretch' im Zeitkarten-Worker, eigener Aufruf ohne Hauptfaden-Rückfall), nx1HasAu zählt auch Song-Clips/Song-Gesang (imp1Prep). Test folgt.
- (g) Guide: fertig (Code) – Eintrag 'midiimp' heißt „Audio/MIDI importieren“, findet audio/mp3/tempo/teile.
- Pflicht nach Einbau: topdefs doppelt 0 / Syntax 0 (erst 1 Syntaxfehler: Kommentar mitten in imp1Prep-Zeile → behoben), dupkeys 0, smoke errors [] (smoke1.png), MS 2000 1×, live: true 1×.
