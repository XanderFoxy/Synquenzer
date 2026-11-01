# MIX-A · Auto-Master + Mix-Assistent (Spec, Basis 4.30.0 = bau/snapshots/R-4300.html)

Xanders Wunsch (zusammengefasst): automatisch mastern; Kompressoren & Co. zuschalten, die die Dynamik eines Parts erkennen
und entscheiden, wie durchsetzungsfähig er im Mix sein soll – besonders wenn der Song an der Stelle ausgedünnt ist; den
Charakter eines Parts erkennen (Sequenz, Basslauf …) aus Noten, Notenlängen, Hüllkurve (kurz/staccato, ausklingend,
schwebend wie eine Fläche) und Frequenzbild; daraus Werkzeug- und Einstellungsvorschläge.

Grundsatz: **Nichts ändert sich ohne Tipp** (Regel 28). Messen ist rein lesend. Ein Projekt ohne übernommene Vorschläge
erzeugt keinen einzigen zusätzlichen Audio-Knoten → bitgleicher Klang (live, Video, GarageBand-Instrumental).

## 1. Bedienung
FX › MASTER bekommt in der Zeile „Pump-Quelle“ zwei Knöpfe (≥ 44 px): **[AUTO-MASTER]** und **[MIX-ASSISTENT]**. Beide
öffnen ein Blatt (wie STIMME › Effekte), hochkant und quer bedienbar, Finger-Scrollen.

**Mix-Assistent-Blatt**
- [Analysieren] → Fortschritt in % (Offline-Durchlauf des Songs; ohne Song: Hinweis „Noch kein Song – erst ● SONG“).
- Je Spur eine Karte: Name · **Rolle** (Bass, Sequenz/Arp, Fläche/Pad, Lead, Drums, Gesang/Chor) · **Charakter**
  (kurz, ausklingend, schwebend) · Kennwerte (Lage, Dichte, Länge, Attack, Schwerpunkt, Tiefen-/Höhenanteil, Crest, LUFS).
- Darunter die Vorschläge der Spur, jeder mit **[Übernehmen]**; übernommen → **[Zurück]** (stellt genau die Werte vor der
  Übernahme wieder her). Oben **[Alle übernehmen]** (ein Undo-Schritt). Jede Übernahme/Zurück = ein Undo-Schritt (↶ ↷).
- Vorschlagsarten: *Kompressor* (Schwelle/Verhältnis/Attack/Release/Make-up passend zum Charakter, oder „kein Kompressor
  nötig“), *EQ aufräumen* (Hochpass bei Nicht-Bass, Höhen-Shelf, Glocke Bass↔Kick), *Pegel*, *Pan*, *Ducking Kick*
  (Option, nutzt das vorhandene PUMPEN der Spur mit Pump-Quelle KICK), *je Songteil* (ausgedünnter Teil → Spur darf
  vorne sein: +dB; dichter Teil → Fläche macht Platz: −dB).

**Auto-Master-Blatt**
- Ziel: **[Streaming −14 LUFS]** **[Laut −9 LUFS]**. [Messen] → Offline-Durchlauf, Vorschlag: Bus-Kompressor
  (Schwelle, Verhältnis, Attack, Release), EQ-Neigung (Tief-/Hoch-Shelf ±dB), Pegel, True-Peak-Limiter −1 dBTP.
  Anzeige: gemessen → erwartet (LUFS integriert, True-Peak, Kompressor- und Limiter-Arbeit).
- **[Übernehmen]** (ein Undo-Schritt) · **[Vorher/Nachher]** (nur Hören, wird nicht gespeichert; gleicher Zeitversatz,
  Überblendung 30 ms) · **[Aus]** (ein Undo-Schritt). Hinweis „Mix geändert – neu messen“, wenn sich seit der Messung
  Spuren/Master geändert haben.

## 2. Analyse (Hauptthread frei)
Ein Offline-Durchlauf mit der App-eigenen Klangerzeugung (vvRenderAudio, wie Video/GarageBand), dabei
- Analyse-Worklet `synq-mixa-an` (eigenes Modul) an jeder Spur vor dem Mix-Einschub (nach Drive/Chorus/Tremolo):
  je 512 Samples (≈ 10,7 ms) Energie, Spitze, K-gewichtete Energie, 5 Bänder (< 150, 150–500, 0,5–2 k, 2–6 k, > 6 kHz) und
  7 Tiefbänder (40 … 160 Hz, Grundton Kick/Bass);
- das Master-Signal vor dem Auto-Master (nach Bus-Kompressor/Drive/Master-Ausgang) als Stereo-Puffer.
Auswertung im Worker:
- **Noten** (aus den Clips des Songs, gewichtet nach gespielten Takten, + Song-Melodie): Median-Lage, Umfang, Noten je
  Schlag, Median-Länge (Schläge), Legato-Anteil, mittlere Stimmenzahl.
- **Hüllkurve** (aus dem Audio): Einsätze (+6 dB), Attack (Einsatz → 90 % Spitze), Abfall nach 200/500 ms, Sustain-Anteil.
- **Spektrum**: Schwerpunkt, Tiefen-/Höhenanteil, stärkstes Tiefband.
- **Dynamik**: Crest-Faktor, Kurzzeit-Lautheit (3 s) Median und Spanne, je Songteil.
- **Klassen** (Punktwerte aus Noten + Audio; Drum-Spur = Drums, STIMME-Spur = Gesang/Chor); Charakter: kurz
  (Abfall ≥ 20 dB vor dem nächsten Einsatz bzw. Länge ≤ 0,3 Schlag), schwebend (Attack ≥ 60 ms oder lange Noten mit
  hohem Sustain), sonst ausklingend.
- **Songteile**: die Teil-Marken des Songs, sonst Abschnitte gleicher Besetzung (≥ 2 Takte). Dichte = Zahl der hörbaren
  Spuren (> −30 LU unter der lautesten) je Teil; ausgedünnt ≤ 60 % des dichtesten Teils.

## 3. Klang (nur nach Übernahme)
- Spur: Worklet `synq-mixa` (Modus Spur) zwischen Tremolo und Pump-Ducking: Hochpass 12 dB/Okt., Glocke, Höhen-Shelf
  6 kHz, Kompressor (Spitze, Stereo gekoppelt, weiches Knie 6 dB, ohne Vorausschau = keine Latenz), Make-up,
  Songteil-Pegel (vom Scheduler an den Taktgrenzen gesetzt, 20 ms Gleiten). Ein-/Ausblenden 30 ms, Werte gleiten.
- Master: Worklet `synq-mixa` (Modus Master) parallel zu Limiter/Soft-Ceiling: Tief-Shelf 150 Hz, Hoch-Shelf 5 kHz,
  Bus-Kompressor (RMS, Stereo gekoppelt), Pegel, True-Peak-Limiter (4× überabgetastete Spitzen, Vorausschau = die
  gemessene Kompressor-Latenz ≈ 6 ms → gleicher Zeitversatz wie bisher, graphLat bleibt), Decke −1 dBTP (intern −1,5;
  Erkennung 4× mit 48 Stützstellen + Parabel-Verfeinerung, damit auch höhenreiche Signale nahe Nyquist sicher bleiben).
- Die Einstellung wird im Worker mit genau demselben DSP-Code auf das gemessene Signal gerechnet und der Pegel so lange
  nachgeführt, bis die Ziel-Lautheit ±0,1 LU erreicht ist. Live, Video und GarageBand spielen denselben Code.

## 4. Daten (gespeichert, normalisiert, Undo-Art `mixa`)
- `track.mix = {hp, pf, pg, pq, hs, thr, ra, at, rl, mk, sec: {<Teil>: dB}}` (fehlt = nichts).
- `fxBus.am = {on, ziel, lo, hi, thr, ra, at, rl, gain, ceil}` (fehlt = nichts).
- Pegel/Pan/Ducking ändern die vorhandenen Felder `sound.fx.vol / pan / pump / pumpRel`.

## 5. Abnahme
1. Klassifikation: Testsong mit Bass, Arp, Pad, Lead, Drums, Gesang → alle richtig, Charakter passend.
2. Vorschlag übernehmen → Klang/Feld geändert; [Zurück] und ↶ stellen bitgleich her; ↷ wieder.
3. Auto-Master: Video-Render und GarageBand-Instrumental treffen Ziel −14 und −9 LUFS ±0,5, True-Peak ≤ −1 dBTP
   (unabhängig 8× gemessen).
4. Ohne Übernahme bitgleich: Render vor/nach Analyse und gegen 4.30.0 (gleicher Zufall) identisch.
5. Hauptthread: keine Aufgabe ≥ 50 ms während Analyse/Messen.
6. Layout 428×926, 926×428, 428×650: Blätter passen, nichts abgeschnitten, Ziele ≥ 44 px.
7. smoke.mjs, orch-mk-check.mjs, v3-mk2-wellen.mjs grün; VERSION unverändert; Marken-Regeln.
