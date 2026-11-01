# MIX-A · Auto-Master + Mix-Assistent – Änderungen (Basis 4.30.0 = bau/snapshots/R-4300.html, VERSION unverändert)

Gebaut mit `src/build.py` (Basis + `src/mixa-dsp.js`, `src/mixa-app.js`, `src/mixa.css`; jeder Einhängepunkt muss genau einmal
passen → lässt sich auf spätere Stände neu anwenden). Vollständiger Unterschied: `patch.diff` (4 geänderte Zeilen, Rest neu).

## Schritt für Schritt
1. **Spec** `SPEC.md` (Analyse, Vorschläge, Bedienung, Daten, Abnahme).
2. **DSP-Kern `mixaDspMake()`** – ein Code für Worklet, Worker und (Notlösung) Hauptthread:
   - Biquads (RBJ), K-Gewichtung BS.1770-4 für jede Abtastrate, integrierte Lautheit (Gates −70/−10), Kurzzeit-Lautheit, LRA.
   - `Track`: Hochpass 12 dB/Okt., Glocke, Höhen-Shelf 6 kHz, Spitzen-Kompressor (Stereo gekoppelt, Knie 6 dB, **ohne
     Vorausschau = keine Latenz**), Make-up, Songteil-Pegel, Ein-/Ausblenden 30 ms; wet 0 = Eingang bitgleich.
   - `Master`: Tief-Shelf 150 Hz, Hoch-Shelf 5 kHz, RMS-Bus-Kompressor, Pegel, **True-Peak-Limiter** (4× mit 48 Stützstellen
     + Parabel-Verfeinerung, gleitendes Minimum über die Vorausschau, Release 80 ms, Rechteck-Glättung). Latenz = die
     gemessene Kompressor-Latenz (≈ 6 ms) → parallel zum alten Limiter-Weg exakt zeitgleich, graphLat unverändert.
   - `amFit`: EQ-Neigung aus Tief-/Höhenanteil, Bus-Kompressor aus den lauten Stellen (Streaming 1,5:1 ≈ 1,5 dB, Laut 2:1
     ≈ 3 dB, Release ≈ Achtel), Pegel per Sekante mit genau dem Master-Code bis ±0,1 LU am Ziel.
   - `feats` (Energie, Spitze, K-Lautheit, 5 Bänder, 7 Tiefbänder je 10,7 ms → Lautheit, Crest, Schwerpunkt, Tiefen-/
     Höhenanteil, Kick-/Bass-Grundton, Einsätze, Attack, Abfall, Lücke, Sustain), `classify`, `character`, `suggest`.
3. **Worklet-Modul** `synq-mixa` (Spur/Master) und `synq-mixa-an` (Analyse) – eigenes Modul, nur geladen, wenn etwas
   übernommen ist oder gemessen wird. `sq-worklet-src`, `sq-md-src`, MKD-Block: unverändert.
4. **Einbindung** (je eine Zeile): `applyTrackParams` → `mixaTrackSync` (Knoten zwischen Tremolo und Pump-Ducking, nur mit
   `track.mix`); `buildFx`/`applyFxBus` → `mixaMasterSync` (A = bisher, B = Auto-Master, Ausgang `out` übernimmt Analyser,
   Meter, Song-Aufnahme, Stimme-Referenz); `tick` → `mixaTick`/`mixaIdle` (Songteil-Pegel an Song-Taktgrenzen, 20 ms);
   Undo-Art `mixa`; `normTrack`/`normFxBus` (Felder `track.mix`, `fxBus.am`); `vvRenderAudio0`/`vvSwapIn` (Modul im
   Offline-Kontext, Messdurchlauf mit Analyse-Abgriffen, Meter dort aus); MASTER-Seite: zwei Knöpfe.
5. **Messdurchlauf** = der Video-Offline-Durchlauf mit Abgriffen; Auswertung im Worker (Hauptthread frei); Noten-Werte aus
   den Clips des Songs (gewichtet nach gespielten Takten) + Song-Melodie; Songteile = Teil-Marken, sonst gleiche Besetzung.
6. **Vorschläge** je Rolle/Charakter (Kompressor oder „kein Kompressor nötig“, Hochpass bei Nicht-Bass, Höhen-Shelf,
   Glocke Bass ↔ Kick am gemessenen Kick-Grundton, Pegel gegen Drums/Gesang/Bass, Pan, Ducking als Option, je Songteil).
   [Übernehmen] / [Zurück] / [Alle übernehmen] = je ein Undo-Schritt. Gesang: Hinweis auf STIMME › Effekte › Auto.
7. **Auto-Master-Blatt**: Ziel Streaming −14 / Laut −9 LUFS, [Messen] [Übernehmen] [Vorher/Nachher] [Aus], Anzeige
   gemessen → erwartet. Vorher/Nachher nur Hören; Video und GarageBand spielen immer den Auto-Master.
8. Fixes aus den Tests: Charakter ohne Noten (Gesang) erst mit schnellem Abfall „kurz“; Abfall ab Erreichen der Spitze;
   Limiter-Erkennung von 12 auf 48 Stützstellen + Parabel (vorher bis 0,7 dB über −1 dBTP bei Rauschen nahe Nyquist);
   „Vorher“ wirkte in den Offline-Render hinein → dort ignoriert; Knopf-Beschriftung „Vorher/Nachher“.

## Hinweise für den Dirigenten
- Live wird beim Zurücknehmen nichts umgesteckt: Spur-Knoten bleiben als Durchgang (bitgleich, Test), der Master-Ausgang
  bleibt über Gewinn 1 (bitgleich). Ein neuer Graph (Laden, Video, GarageBand) enthält keine MIX-A-Knoten mehr.
- 4.30.0 rendert die volle Mischung **nicht** bitgleich von Lauf zu Lauf (Lead/Fläche, Drums; Zufall/Zeitpunkte im Klang-Worklet).
  „Bitgleich“ wird daher über den Audio-Graphen + deterministische Spuren (Bass solo) geprüft (`tests/mixa-bitgleich.mjs`).
- Kein Datenbank-Zugriff, keine Marken-Wörter, „MS 2000“ 1×, `  live: true,` 1×, VERSION 4.30.0.

## Fragen an Xander
1. Ziele: reichen **Streaming −14** und **Laut −9**, oder zusätzlich z. B. −16 (Apple Music) / −11?
2. Vorher/Nachher: soll „Vorher“ lautheitsgleich abgehört werden (fairer Vergleich) oder wie jetzt im Original-Pegel?
3. Pegel-Bezug der Balance: Drums = 0, Gesang 0, Bass −2, Lead −3, Sequenz −6, Fläche −8 LU (Profi-Faustregel Synthpop) – passt das?
