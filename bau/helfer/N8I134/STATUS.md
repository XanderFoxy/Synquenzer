# STATUS N8I134 (Zweig `n8-i134`, Basis 4.30.0, Version unverändert)

**Kurz:** Super-Regler-Kern, weicher Szenenwechsel (Klang-Teil) und NEIGEN-Logik laufen, nur über die Test-API erreichbar (die Bedienung wartet auf
die Fragen 2–4). Mal-LFO mit ✎, Form-Blatt, Bibliothek und Worklet-Fall 5 läuft. Tipp-Summen-Kern (`tapNotes`, eine Notenquelle, Zählzeile) läuft;
die Tippfläche selbst ist I4a. Alte Projekte: Nachrichten, JSON und alle verglichenen Renders gleich wie 4.30.0. **Nichts davon hat Xander gesehen –
nicht fertig ohne sein Okay.**

## Erledigt (mit Test)
- Baustein N: `need` aus den Daten, nur in der gespeicherten Kopie; unbekanntes Merkmal sperrt (I1-28 b/c, N8-02).
- I1c: Daten, Adressen, SRCore (I1-27 Abweichung 0), Weg (I1-11), Worklet-Endwert (I1-12), Glättung τ 20 ms und Einrasten (I1-13, I1-25 a),
  Undo (I1-22), Speichern/Laden (I1-10), Vormachen-Kern (I1-32), nativer Weg (I1-18), Drums je Schlag (I1-17), Verlauf-Prüfung `historyCheck()` = true.
- I1a: Szenen-Morph im Worklet monoton mit vielen Zwischenwerten (V6a-03), Regel 28.
- I1f: NEIGEN 33/33 + 15/15 (I1-60 … I1-67 im Chromium mit Sensor-Ersatz).
- I3: Form-Tabelle im Worklet, `l1f` Speichern/Laden, `need` 'lf'; Form-Blatt, ✎, Strich/Abbruch/Tipp, Bibliothek, Undo, Maße 428×926 / 926×428 / 428×650,
  Höhe ± 0 px, Block erst bei Bedarf geladen (I3-17, I3-18, I3-21, I3-23, I3-24, I3-40); Raster bei punktierten/triolischen Zyklen (I3-38); Zeit (I3-16).
- I4c: I4-21 … I4-26, I4-28, I4-32 (14,4 ms für 64 Takte, warm), I4-33.
- Regel 28 gegen 4.30.0: Engine-Nachrichten, Projekt-JSON, MIDI, MS-2000-Render, North-Render, Chor-Gruppe, Songtext-Silben, VV4-Probe,
  GarageBand-Instrumental-WAV, Konsolidieren gleich; Video-Offline-Render gleich lang, Pegel −0,01 dB.
- Layout: Start, Synth-Editor, Menü wie 4.30.0 in allen drei Formaten.

## Offen / Abweichungen (ehrlich)
1. **Aufräum-Korpus I3-11: 56 % statt ≥ 90 %.** Gut: Rampen, Dreieck, Säge, Rechteck, Treppe 4, Kurven. Schwach: Treppe 8/16 (Sprung 125 liegt unter
   der Kanten-Schwelle 150 der Spec), Gate, Achtel-Puls, Pumpen, Triller (32 Abschnitte bei 60-Hz-Abtastung), Sinus. I3-13 Treppe 8: 4/10.
   Der Korpus-Generator ist mein eigener (Weglänge-Abtastung, σ 1,5 %); `i3-korpus.json` aus der Spec gab es nicht.
2. **Stufige Werte je Stimme (`v.pv`)** gibt es noch nicht (Besitzer I2a). Stufige Super-Regler- und Zustands-Werte wechseln darum über die
   vorhandene 30-ms-Stimmen-Überblendung statt „klingende Töne behalten den Wert“ (I1-14, V6a-07 noch nicht erfüllt).
3. **Heiße Schlüssel**: im Worklet je 128er-Block mit vollem `derive()` statt linear in 16er-Steuerblöcken und Gruppen-`derive` (CPU nicht gemessen, I1-20).
4. **FM-Operatoren** (`fm6.ops.*`, `fmx.*`) fährt der Haupt-Faden über den vorhandenen 30-Hz-Patch, nicht der Worklet-Kern.
5. **Nicht gebaut** (gehören zu anderen Paketen oder warten): Locks/Fächer (I2), Fahrt im Song + Streifen (Frage 4), Feld/Vormachen-Leiste/„Was ändert
   sich?“ (Frage 2), V6a-Bedienung und Regler-Marke (Frage 3), Engine-Wechsel-Blatt (I1-23), Spur-Entfernen-Gruppe (`srDropUid` da, nicht verdrahtet,
   I1-29), Drive-Stufen ≤ 8 je ≥ 40 ms, `vvSwapIn`-Sicherung von `R.sr` (Offline nutzt die aktuelle Hand-Stellung), I3a nativer Form-Puffer (WT/ECO
   spielen bei Form 5 ein Dreieck), DX-Export/v2-API/VV3-Haken für Form 5, K1-Text „LFO 1 ✎ Name“, I3e/I3f, I4a Tippfläche, I4b Uhren-Brücke
   (`tipAlign`/`tipLearn`, Einwischen nutzt bis dahin den Rückfall aus FORMCLEAN), FANG-Bereich nach Tipp-Phrase.
6. Ungeprüft: STIMME-Spur mit `gfx.*` (I1-06, Demo hat keine STIMME-Spur), eigene Song-Clips mit `st`, I1-14/I1-16 (stufig/Überblend-Grenze
   gemessen), I1-19 (Voll-Abgleich bei Stellung ≠ 0 mit M-SP), CPU-Messungen, iPhone-Tore.
7. Befund (nicht geändert, A.9 c): Die Tasten der LFO-Form-Leiste sind schon in 4.30.0 40 × 40 (hoch) bzw. 40 × 32 (quer) – kleiner als 44 px.
   ✎ hat dieselbe Größe. Vorschlag: Leiste auf 44 px Höhe – nur nach deinem Okay.
8. Befund: Der Video-Offline-Render von 4.30.0 ist mit sich selbst nicht bitgleich (freie Start-Phasen je Note seit 4.24.1, Rauschen) – M-NULL ist
   damit nicht messbar; verglichen werden Länge und Pegel.
9. `bau/tests/v3-mk2-wellen.mjs` meldet wie schon bei 4.30.0 „OFFEN – Bezug am Bau-Ort fehlt“ (Daten `bau/dwgs-trace` nicht im Repo).

## Bitte prüfen (Xander am iPhone, wenn diese Stufe auf der Pages-Seite ist)
1. Alte Songs öffnen und abspielen: klingt alles wie vorher? (Video- und GarageBand-Export einmal starten.)
2. Synth → LFO 1 → ✎ tippen: Dreieck hörbar (Route LFO 1 → Cutoff), Form-Blatt öffnet; mit dem Finger eine Treppe malen – rastet sie ein?
3. Im Form-Blatt „Pumpen“ tippen, dann ↶: kommt deine Form zurück?
4. Form-Blatt quer (926 × 428): ist alles lesbar, nichts abgeschnitten, Tastatur bleibt frei?
5. Die LFO-Form-Leiste (6 Felder): sind die Felder zum Treffen groß genug? (Befund 7)
