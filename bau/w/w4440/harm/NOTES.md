# HM1 – Harmonie-Werkzeuge (Glätten, Skalen-Sperre, Lauf, Gegenstimme, Akkordvorschläge)

## 1. Für Xander
- **Noten-Editor → Aktionsleiste ganz rechts → [Harmonie]**: unten öffnet sich ein Blatt mit vier Reitern.
  **Glätten**: zeigt die erkannten Akkorde je Takt (oder ½ Takt / aus der Akkord-Zeile), Mini-Bild alt/neu, ▶ Vorschau, dann
  **Als Clip → Sz. N**: das Grundmuster (alles auf C bzw. in Moll auf a) kommt auf den nächsten freien Platz, das Original bleibt.
  Mit **✓ Akkord-Zeile** stehen die Akkorde gleich in der Szene – dann klingt das Grundmuster wieder genau wie gespielt.
- **Lauf**: Doppeln · Fortsetzen ▲/▼ (eine Stufe weiter in der Tonart, mehrmals tippen = Sequenz läuft weiter, der Clip wächst mit) · Takte −/+.
  Mit Auswahl wird nur die Auswahl verlängert.
- **Gegenstimme**: Terzen · Sexten · Gegenbewegung durchschalten, ▶ Vorschau (Melodie + Gegenstimme), Ziel-Spur wählen, Übernehmen.
- **Akkorde**: 3–4 Vorschläge für den nächsten Akkord – ein Tipp schreibt ihn in die Akkord-Zeile. Im Akkord-Zeilen-Blatt (Tipp auf TRÄGER)
  tragen die passenden Stufen jetzt eine kleine Nummer 1–4.
- **Skalen-Sperre beim Wischen**: **SPIELEN halten** (½ s) schaltet Frei → Skala (Schloss + „C-Dur“) → Akkord (Schloss + „Am“) → Frei.
  Beim Wischen über die Tasten werden gesperrte Tasten übersprungen, der Ton klingt weiter, nichts schlägt doppelt an.

## 2. Technik
- Neuer Block `/* ===== HM1-BEGIN … HM1-END */` direkt nach `crGrabUp` (Akkord-Zeilen-Code), CSS-Block `/* HM1-CSS-BEGIN … END */`
  nach `.cr-gd{…}`. Funktionen: `hm1Deg, hm1Prof, hm1Chord, hm1Pcs, hm1Segs, hm1Inv, hm1Smooth, hm1RowOf, hm1Extend, hm1Line, hm1Ctx,
  hm1Counter, hm1RowClips, hm1MelProf, hm1Suggest, hm1CrBox, hm1CrMark, hm1KbChord, hm1KbNote, hm1KbGlide, hm1KbHold, hm1KbCycle,
  hm1PvStart/Stop/Btn, hm1Acts, hm1Free, hm1Targets, hm1Sel, hm1Open, hm1Data, hm1Paint, hm1NextBox, hm1Draw, hm1Act, hm1Preview,
  hm1DoGlatt, hm1DoGegen, hm1DoLauf, hm1SgPut`; Konstanten `HM1, HM1_TRK, HM1_Q, HM1_VAR, HM1_FN, HM1_POP, HM1_WHY, HM1_API`.
- Glätten = Umkehrung der echten Träger-Abbildung (`T.mapEvent` mit Clip-Tonart als Bezug, Suche ±19 HT, nur Leitertöne): Akkordtöne
  exakt rückführbar, Fremdtöne stufentreu auf den nächsten Leiterton. Akkorderkennung je Stück: Dauer×Anschlag-Profil, Bass-Bonus,
  leitereigen-Bonus, Einzelton = leitereigener Dreiklang.
- Einhänge-Zeilen (alle mit `HM1` markiert): PianoRoll `opts.extraActs` (1 Zeile nach „Löschen“) · `buildRoll` `extraActs: hm1Acts(t, s)` ·
  `crPaint` `hm1CrMark(p)` · `kbLockNote` Akkord-Zweig · `kbPaint` 2 geänderte + 1 neue Zeile (Akkord-Töne, Name, Schloss-Klasse `hm1lk`) ·
  Tastatur-`pointermove` `hm1KbGlide` · `hm1KbHold(EL.segPlay)` · `normEnum` kbScale +'chord' (2 Stellen) · Menü-Zeile „Tastatur beim
  Spielen“ +[Akkord] am Ende · Test-API `Object.assign(SYNQUENZER, {hm1: HM1_API})` vor `NO_SYNC`.
- Daten: nur normale Clips (`key.src: 'user'`, damit die Erkennung die Bezugstonart nicht verschiebt) und Akkord-Zeilen
  (`S.scenes[x].chords`). Neu nur der Wert `'chord'` in `S.settings.kbScale` (ältere Stände lesen ihn als 'show'); Format unverändert.
- Undo: Glätten mit Akkord-Zeile = eine Gruppe (clip + part); Gegenstimme, Doppeln/Fortsetzen, Akkord-Tipp = je ein Schritt.
- CSS-Klassen: `.hm1p` (Blatt, angedockt, ✕ im Kopf, Tasten 44 px), `.hm1b` (Trefferfläche der Taste in der Aktionsleiste),
  `.cp-c.hm1s/.hm1r` (Vorschlags-Nummer), `#kbRef.hm1lk` (Schloss, SVG-Maske, keine Emoji-Grafik).
- Vorschau: eigene kleine Planung (setInterval 50 ms, 0,25 s voraus) über `spawnVoice(…, {src: 'audition'})`, stoppt mit dem Blatt.

## 3. Tests (`hm1-test.mjs`, ein Lauf, Fotos `hm1-glaetten-hoch.png`, `hm1-gegenstimme-hoch.png`, `hm1-akkorde-hoch.png`, `hm1-glaetten-quer.png`)
- **47/47 OK**: Akkorde C·Am·F·G erkannt (Takt, ½ Takt, aus Akkord-Zeile); Grundmuster in C-Dur, jeder Takt C-E-G, Bass ≤ 6 HT
  gerückt, unter C·Am·F·G exakt wieder wie gespielt; Auswahl rückt nur gewählte Noten; Moll (a-Moll, Am·F·C·G) → jeder Takt A-C-E; [Harmonie] letzte Taste der Aktionsleiste, Trefferfläche 44 px; Blatt ✕ sichtbar, Tasten ≥ 44 px (hochkant +
  quer 926×428); Vorschau an/aus; Als Clip + Akkord-Zeile = ein Undo, Undo/Redo; Szene spielen → Bass 48/45 wie Original;
  SPIELEN halten → Skala / Akkord / frei, Wischen C…E → C D E, C…G (Akkord) → C E G, ohne Doppelanschlag, Tipp ändert nichts;
  Fortsetzen ▲×2 (C D E F | D E F G | E F G A), neue Noten gewählt, Clip wächst, Doppeln, Takte +, 6× Undo zurück; Gegenstimme
  Terzen/Sexten/Gegenbewegung (unter der Melodie, gegenläufig), Übernehmen auf Synth 3, Undo; Vorschläge nach C (F, G, Am, Dm),
  mit fester Melodie H·D → G zuerst; Nummern im Akkord-Zeilen-Blatt; Reiter Akkorde schreibt in Takt 2; Speichern→Laden gleich;
  altes Projekt mit 'lock' unverändert; quer kein Überlauf; Konsole ohne Fehler.
- Pflicht: topdefs 0 Syntaxfehler / 0 doppelt (Namen 4951 → 5004, nur neue); Rauchtest errors []; Marken 0, „MS 2000“ 1, `  live: true,` 1.

## 4. Offen / Risiken
- Der Schalter „Sperre“ ist **SPIELEN halten** (kein neuer Knopf, damit nichts verrutscht; ein Tipp auf SPIELEN bleibt wie bisher, auch
  für alte Tests). Wenn Xander einen sichtbaren Knopf will, bitte Platz nennen. Menü › Harmonie › Tastatur beim Spielen hat [Akkord] dazu.
- Akkord-Sperre ohne Träger nimmt den Akkord der gerade klingenden Clip-Noten (1,5 s gehalten), sonst den Grundakkord der Tonart.
- [Harmonie] gibt es im Editor der Szenen-Clips; für eigene Clips / Versionen im Song und die Song-Melodie noch nicht.
- Glätten-Vorschau spielt das Grundmuster (ohne Akkorde); „Vorschau mit Akkorden“ wäre ein kleiner Zusatz.
- Akkord-Zeile aus Glätten deckt höchstens 16 Takte ab (Grenze der Akkord-Zeile); Tritonus-Akkorde (z. B. F♯ in C) können eine Oktave
  anders liegen (Gleichstand der Verschiebung).
- Gegenstimme rechnet im gespeicherten Tonraum (Clip-Tonart); liegt die Melodie auf einer festen Spur und das Ziel folgt dem Träger,
  wird unter einer Akkord-Zeile nur das Ziel mittransponiert.
