# VTRIM – Stand (fertig)
Ausgang: index.html (md5 siehe unten) = rel-4910/index.html (4.91.0, md5 44fa0f187f10e18dfc5944fcfe1b5bdb) + apply.py (17 Anker, atomar, Block `/* VTRIM-BEGIN … VTRIM-END */` direkt hinter `/* VL3-END */`, Quelle vtrim-block.js).

## Bau
- Daten: `clip.audio.vt={k,e,a}` (Take-Id, Ende/Anfang in Sekunden im gespielten Take). Normalisierer-Hook `tkExt().audio` speichert nur gültige Werte und nur, wenn `k` zum Take passt; `a.v3e=1` = Vorlauf-Fähnchen wurde gezogen.
- Wiedergabe-Kern `tkPlace`: nur mit `a.vt` eigener Weg `vtrStart` (kappt Anfang/Ende, Blende 10 ms an der Schnittkante, sonst identische Parameter). Darüber laufen Matrix, Loop, Song, Faltung (↻), Vorlauf-Einsatz und Mixdown. `g3PostOf` (Nachlauf hinter dem Loop-Ende) wird am Fähnchen gekappt (`vtrPostCap`).
- Clip-WAV (Vorlage sq-vl2x-src) und Faltpunkt: `vtrData` = Take-Daten mit gleicher Blende (Cache je Kanal-Array). Wellenbilder (Matrix-Zelle, Song): Weggeschnittenes leer, Schlüssel enthalten `vt`.
- ▶ im Gesang-Editor (vx1rPlay) begrenzt auf das Fenster; Gesang→Noten (`scheduleTrack`, verknüpfte Noten `clip.take`) überspringt Noten außerhalb.
- UI: Overlay `.vtro` am Bildschleifen-Takt des Vorlauf-Fähnchens (vl3Tick → vtrPaint), gleiche Bedien-Muster wie VL3 (48-px-Griff, ziehen = ↶-Schritt, tippen = Menü ≥ 44 px). Einrasten: Raster ROLLP.grid, Taktgrenzen (12 px), Loop-Ende/ganze Länge (18 px, haptic). Knopf „Ende auf Loop-Ende“ (36 px hoch) nur bei Nachlauf über das Loop-Ende. Texte kippen an den Rand.
- VL3-Korrektur: `vl2PreOf` nimmt nach dem Ziehen (`v3e`) die Fähnchen-Stelle auch in „▸ einmal“; `vl3Pos` zeigt in „einmal“ ohne `v3e` den gehörten Vorlauf.

## Prüfung
- test/kern2.cjs (Server srv/ auf Port 9537: srv/neu = index.html, srv/basis = 4.91): 29/29 OK (test/kern2.log, test/kern2.json).
- Pflicht: „MS 2000“ 1×, „  live: true,“ 1×, 0× Verbotswerte/xander-krypto, doppelt.js „neu: []“, 0 Seitenfehler (version.json 4.91.0).
- Hinweis Messung: 4.91 selbst rendert den Mix nicht bitgleich von Lauf zu Lauf (letzte Stelle, 2,4e-7; Quellen-Plan identisch – Ursache im Klang-Graph). Darum: Quellen-Plan + trockener Render streng bitgleich, ganzer Mix = gleicher Hash kommt in 4.91 und neu vor.
- test/alt/ = Dateien des abgebrochenen ersten Laufs (Sinus-Take, ohne Loop-Klammer-Knopf).

## Offen
- Song-Gesang (direkt im Song aufgenommene `song.vox`-Blöcke) hat kein Ende-Fähnchen; dort begrenzt weiter die Blocklänge.
- Gesang→Noten: Noten, die vor dem Ende beginnen, klingen bis zu ihrem Notenende (werden nicht gekürzt).
- Die Werkstatt (Wellenform/Warp) zeigt den Schnitt nicht – bewusst getrennt (Sequencer ≠ Werkstatt).
- Nachlauf länger als 4 Schläge hinter dem Loop-Ende: Ansicht rollt nur 4 Schläge über das Clip-Ende (PianoRoll), Knopf „Ende auf Loop-Ende“ reicht trotzdem.
eced0dc7bd2b4ce7cd5fb344a2322e06  index.html

## Xander-Prüfung (unabhängig, test/xp/xander.cjs, 38/38, hochkant + quer, echte Touch-Ereignisse)
Weg über die Oberfläche: Clip-Blatt → ✎ Bearbeiten → Takt-Leiste wischen → Ende ziehen → „Ende auf Loop-Ende“ (Knopf + Menü) → ↶ ↶ (Editor-Leiste) → ▶ Loop → Song (kein g3p-Nachlauf hinter dem Ende) → Export (Ende 1 s vor Loop-Ende: danach −41,6 statt −23,8 dB) → Speichern + Seite neu laden (Schnitt bleibt).
Behoben: (1) Ende-Fähnchen ganz nah am Vorlauf-/Anfang-Fähnchen (< 64 px, z. B. weit gezoomt und Gesang fast ganz gekürzt) überdeckte dessen Griff und Text → Ende-Griff rückt dann nach unten (top 112 px), Text rechts vom Pol. (2) Knopf „Ende auf Loop-Ende“ verschwand, wenn das Loop-Ende in den ersten 24 px der Ansicht lag → sichtbar, solange das Loop-Ende im Bild ist. Kern-Test danach wieder 29/29, Pflicht unverändert erfüllt.
