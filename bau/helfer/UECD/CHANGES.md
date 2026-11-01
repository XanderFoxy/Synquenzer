# UE-C + UE-D „Übergänge“ – Änderungen (Helfer-Zweig `ue-cd`, Basis R-4300 = App 4.30.0)

Spec: `spec/konzept-schnitt-uebergaenge-video.md` §1.3 D/E, §1.4, §1.5 (Datenmodell, verbindlich), §1.6, §1.7.
VERSION bleibt 4.30.0. Gebaut wird reproduzierbar mit `werkzeug/bau.sh` (R-4300 + `werkzeug/ue-block.js` + `werkzeug/ue-ui.js`,
Haken per `werkzeug/einbau.py`, jede Ersetzung genau 1×).

## UE-C: Werks-Übergänge (Daten)
- `UE_WERK`: die 12 Übergänge aus §1.4 (Fill kurz, Fill lang, Tom-Wirbel ½/1, Snare-Wirbel, Build-up 2/4, Fill + Crash,
  Crash auf die Eins, Hi-Hat öffnen, Kick-Auftakt, Halbzeit-Fill, Clap-Treppe, Rim-Ping), je **3 Dichten** (leicht/mittel/voll).
- **Richtung** aufbauend/abbauend/gleich: Anschlagskurve über die Länge (bei ≤ 1 Schlag flach), aufbauend mit Crash auf der Eins
  (mittel/voll). „Auto“ zählt die aktiven Clips vor und nach der Kante (2 → 5 = aufbauend, 5 → 2 = abbauend); die Noten folgen,
  solange sie einem Werks-Stand entsprechen.
- Gespeichert werden nur Noten in Drum-Clip-Form `{t,d,n,v,a?,r?,lk?}`. Sie klingen mit dem Kit der Spur, auch mit North-Pads.
- **Pegel:** Anschlags-Faktor je Werk und Dichte (`UE_VK`), gemessen über alle 7 Kits (Lautheit ±3 LU zum Groove, Spitze ≤ −1 dBFS).

## UE-D: Breaks und Einwürfe
- **Breaks:** Stopp 1 Schlag, Stopp ½ Takt, Stopp 1 Takt, Breakdown (2 Takte, nur Drums). Auf eine Kante oder frei in einen Teil
  (1/16). Standard: alle Spuren außer Gesang (STIMME). Im Blatt: Spuren an/aus und [Kick bleibt].
  Abspielen: Noten der gewählten Spuren fallen weg, klingende Synth-Stimmen enden mit ihrem Release, und eine Blende pro Spur
  (12 ms, vor den Sends) macht alles still: Takes, Chor-Gruppen, North, Arp. Hall und Echo klingen aus. Nach dem Break setzt alles
  auf dem Schlag wieder ein.
- **Einwürfe:** Tom-Doppel, Becken, Wirbel kurz, Clap-Einwurf. Frei auf 1/16, verschiebbar (halten und ziehen), rücken beim
  Einfügen mit.

## Kern minimal (`// UE-Kern minimal – beim Merge durch UE-A ersetzt`)
- `song.ue` nach §1.5: `ueNorm` (in `normSong`), Haken in `songShift` / `songClear` / `songCut` / `songWrite` / `songTidy`,
  Undo über `songEdit`, Speichern/Laden, Video offline (derselbe Scheduler).
- Abspielen: `ueSongTick` in `songTickInner` (Treffer über `drumHit`, Quelle `'ue'`). „ersetzt“ und Breaks in
  `scheduleTrack` / `scheduleDrums` / `d1Sched` und in der Song-Melodie. Gleicher Treffer von Übergang und Groove: nur einmal.
- Bedienung: [◆ ÜBERG.] schwebt unten rechts in der Song-Fläche. Die Song-Leiste bleibt unverändert, denn sie ist hochkant schon
  voll. Darüber öffnet sich die Leiste [Übergänge] [Breaks] [Einwürfe].
  - Kachel antippen: vorhören (≤ 50 ms). Halten und ziehen: Geist, Einrasten ±½ Takt mit amber Kante und Schraffur. Daneben
    loslassen: Kachel fliegt zurück.
  - Chips in der DRUMS-Zeile (≥ 44 × 44). Tipp öffnet das Blatt. Halten und ziehen verschiebt. Aus dem Song ziehen löscht, mit
    Toast „Rückgängig“.
  - Kleine Höhe oder quer: Leiste einzeilig. Die Song-Zeilen rücken über die Leiste, die Tastatur bleibt sichtbar.
- Klangweg: je Spur ein Gain „Break-Blende“ (`N.ueB`) zwischen Panorama und Sends, je Chor-Gruppe eines (`G.ueB`).
  Verstärkung 1 = bitgleich (Regel 28, gemessen).

## Fragen an Xander / an UE-A
1. **[Kick bleibt]** hat im Modell §1.5 kein eigenes Feld. Gespeichert als `mode: 'dazu'` beim Break (bei Breaks sonst ungenutzt).
   UE-A bitte übernehmen oder ein Feld festlegen.
2. **Crash auf die Eins / Becken** haben die Länge „–“ (`len: 0`). Treffer auf der Eins (t = len) zählen zum Übergang.
3. [◆ ÜBERG.] liegt in der Song-Fläche statt in der Song-Leiste, weil die Leiste bei 390–428 px schon voll ist. Die endgültige
   Stelle entscheidet UE-B bzw. Xander (Funk).
4. Leiste ohne [Verknüpfer] und [Eigene]: Die kommen mit UE-G / UE-E.
