# NX1 – Nachzüge Gesang-Editor + Import (Auftrag 1/2) – Stand 14.11.2026

Arbeitskopie index.html (Basis 4.57.0 = vx/basis2.html). Block `/* ===== NX1-BEGIN … NX1-END ===== */` direkt nach `KF2-END` (vor IMP1-BEGIN),
Präfix nx1. Quelle des Blocks auch als nx1-block.js. Einhänge-Zeilen (Kommentar „NX1“):
- PianoRoll: `tkLab(k)` (opts.tk.lab, sonst k + 1) im Lineal, fmtPos, vx2Pos; Ecke `tb.scope` nimmt `opts.audio.unit`.
- vx1rBuild: `tk: r.vox ? nx1VoxTk(r.vox) : null`, `audio.unit = [' Stück', ' Stücke']`.
- vx1rRun = Wrapper (rechnet nx1RunG in einem Zug); der alte Rumpf ist der Generator `nx1RunG` (yield je 16 Rahmen / 1024 Hüllkurven-Schritte /
  64 Marken / ein Stück). wpWorker hängt `nx1RunG.toString()` an; wpCall-Rückfall (`local`) → `nx1Local(m)` für Ops 'hyb'/'vxa'.
- wpSetMode: 'hybrid' bleibt (nur wenn nx1HyOk), Undo-Text „Modus · Schnitt+Dehnen“; wpOpen: `+ nx1SegBtn()`; wpPaint: `nx1SegPaint(E, id)`.
- imp1Prep: `nx1HasAu()` (Matrix-Clips, eigene Song-Clips, Song-Gesang); imp1Place: `c = nx1ImpView(c0, kind)` (null = rechnet, legt danach selbst ab),
  Meldung + „Audio 91,6 → 92 BPM“, gedehnter Take wird wiederverwendet (c0.sx.take).

Entscheidungen:
- (a) Song-Stimme: opts.tk relativ zum Block (beat(k) = barBeat(bar+k) − barBeat(bar), at(b) = barAt(barBeat(bar)+b) − bar), lab(k) = bar + k + 1.
  Immer gesetzt (auch ohne Taktart-Karte), damit das Lineal den Song-Takt zeigt. Szene-Clips: kein tk (unverändert).
- (c) Drei Knöpfe passten nicht (60 px je Knopf, Text abgeschnitten). Darum: Takes mit Ankern (Gesang-Editor) zeigen „Dehnen │ Schnitt + Dehnen“
  (zweizeilig, an der Stelle von „Scheiben“ – Schnitt + Dehnen schneidet am Einsatz wie Scheiben und dehnt zusätzlich den Vokal). Takes ohne
  Anker: „Dehnen │ Scheiben“ wie bisher. Spielt ein Take mit Ankern 'slice', bleibt Scheiben sichtbar.
- (d) Generator statt Neubau: gleiche Rechnung, gleiche Reihenfolge → bitgleich (geprüft gegen den Kern der Basis), Worker nicht langsamer.
  nx1Local: je Schritt ≤ 12 ms + ein Generator-Schritt, dann setTimeout.
- (e) Ziel-Tempo wie imp1Prep (leer/kein Audio → gerundetes Tempo des Liedes, sonst Projekt-Tempo). Dehnen nur bei |q − 1| ≥ 1e-4 und q in 0,5–2
  und Worker vorhanden (sonst wie bisher: eigenes Tempo + Hinweis). Op 'stretch' des Zeitkarten-Workers (vsStretchMake, WSOLA, Tonhöhe bleibt),
  Abschnitte 5 ms vor jedem Viertel des erkannten Rasters, lock 30 ms → Anschläge bitgleich genau auf dem neuen Raster (gemessen ±2 ms statt
  ±13 ms bei gleichmäßigem Dehnen). Eigener Worker-Aufruf nx1Call (240 s, KEIN Hauptfaden-Rückfall – ein ganzer Song würde blockieren).
  Gedehnter Take trägt imp.bpm = Projekt-Tempo (imp1OpenTake zeigt dann das passende Raster). Teile/„1“/Loop bleiben an ihren Takten (×q).
- (f) war schon da: die Matrix-Zelle jedes Audio-Clips (auch „Original“) zeichnet tkMiniSvg wie Gesang-Clips – geprüft, kein Code.
- (g) Guide-Eintrag 'midiimp' umbenannt/erweitert statt zweitem Eintrag (ein Knopf, ein Eintrag).
- (h) NICHT gemacht: Takes sind mono gespeichert (IDB-Stücke Int16, tkPcm/tkLoad 1 Kanal, Container takes/<id>.wav mono). Stereo bräuchte einen
  zweiten Kanal in Speicher, Laden, Container und Rundlauf = Umbau.

Tests: nx1-test.mjs `<index.html> <basis.html> <fotos>` (Touch über CDP, 2 Seiten, ~2 min): ALLE OK 33/33 (test5.log).
Regression: rolle/vx1-test.mjs 61/61 (reg/vx1.log), imp/imp1-test.mjs ALLE OK (Kopie in reg-imp/, reg-imp/imp1.log).
Pflicht: topdefs doppelt 0 / Syntax 0, dupkeys 0, smoke errors [] (smoke-end.png), MS 2000 1×, „  live: true,“ 1×, Markenwörter 282 = Basis,
VERSION 4.57.0 / CHANGES unberührt. Fotos: fotos/nx1-*.png.
Offen: (h) Stereo; echte MP3s mit schwankendem Tempo (Dehnen setzt festes Raster voraus); Import-Dehnen ohne Worker (Claude-App) bleibt beim eigenen Tempo.
