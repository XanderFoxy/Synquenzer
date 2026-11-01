# SX4 Status: fertig (wartet auf Xanders Okay)

Zweig `sx4-spurkopf` · Datei `bau/helfer/SX4/index.html` · VERSION bleibt '4.31.0' · Basis `bau/snapshots/R-4310.html` · Diff: `patch.diff`

## Gebaut
- Gesten am Spurkopf (Matrix `.th`, Song `.sv-l.trk`): Tipp = stumm (+ wählen, Undo-Art `sx4m`), Halten 450 ms = Solo, waagrecht > 10 px = Lautstärke `fx.vol` (Sound-Undo, 1 je Geste), Doppeltipp auf den stehenden Schieber = 0 dB ↔ Ausgangswert.
- Solo = eigener Gain `N.sx4` je Spurkette (zwischen Panorama und `N.cut`, also vor Pegelmessung und Hall/Echo-Sends). Offline-Kontext (Video/WAV/Instrumental) und `SREC.on` („Song als Audio“) → immer 1. Chor-Gruppe: `g6pcChorOn` fragt `sx4Pass`.
- Spur-Blatt jetzt auf ■ halten. Marken: `// SX4`, CSS `/* SX4-CSS-BEGIN */ … /* SX4-CSS-END */`, JS `/* SX4-BEGIN */ … /* SX4-END */`. Test-API: `sx4Info`, `sx4Solo`, `sx4SoloClear`.

## Tests (alle grün)
- `node tests/sx4-check.cjs` – „  live: true,“ 1×, verbotene Wörter 0, „MS 2000“ 1×, VERSION, acorn: keine doppelten Top-Level-Namen.
- `node tests/sx4-abnahme.cjs` – Playwright mit Touch (CDP), 428×926 und 926×428: je 17 Punkte (Tipp/Undo, 2 Solos + Gains, Solo sichtbar, Export/„Song als Audio“ ohne Solo, Schieben + dB + 1 Undo, Doppeltipp 0 dB / zurück, Schieber verschwindet, ■ halten = Spur-Blatt, Song: Tipp/Halten/Schieben, keine Seitenfehler). Laufzeit ≈ 25 s.
- `bau/tests/smoke.mjs` – Titel SYNQUENZER, keine Fehler.
- Bildschirmfotos (selbst angesehen): `tests/shot-solo-428.png`, `tests/shot-vol-428.png`, `tests/shot-song-926.png`.

## Bitte prüfen
1. **Tipp = stumm** am Spurkopf: Vorher hat ein Tipp nur gewählt (und ein zweiter Tipp den Klang geöffnet). Jetzt schaltet er stumm und wählt die Spur mit. Passt das so, oder soll Tipp **nicht** wählen?
2. **Spur-Blatt auf ■ halten** (rechts in der Matrix-Zeile), weil „Halten“ am Namen jetzt Solo ist. Findest du es dort?
3. **Solo hören:** zwei Spuren halten → nur die zwei spielen; im Video/WAV ist alles wieder drin. Mit STIMME + Chor ausprobieren.
4. **Lautstärke schieben:** fühlt sich der Weg gut an (ganze Spanne ≈ 240 px)? Doppeltipp auf den Schieber = 0 dB, noch einmal = vorher.
5. **Querformat:** Spurkopf 96×36 und Song-Name 56×27 px sind Bestand (R-4310 genauso) – kleiner als 44 px hoch. SX4 ändert das Raster nicht; wenn es zu fummelig ist, eigenes Paket.
