# CHANGES – MS 2000, Paket MK4 (Zweig-Kopie `mk-br-MK4`)

## MK4 — Effekte je Sound: MOD-FX, DELAY, EQ · App 4.12.0 (`APP_CODE` 4 012 000) · Format bleibt 5

**Vorgänger-Stand** für alle „bitgleich“-Abnahmen: **4.10.0** (MK2 = `synq-snapshots/MK2.html`, 2 797 302 B).
Zweig-Bau: Diese Kopie startet bei MK2 (4.10.0); MK3 (4.11.0) entsteht gleichzeitig in `mk-br-MK3`, MK2-Prüfungen laufen in `mk-wt`.
Der Orchestrator führt zusammen und setzt die VERSION-Zeile. Server: keine Änderung nötig (`max_app` 4 021 000 ≥ 4 012 000, Format 5).
Kein Supabase-Aufruf in diesem Lauf.

Hinweis zum Neustart: Diese Kopie enthielt schon halb fertige MK4-Arbeit eines abgebrochenen Laufs (Effektkern, Bedienfeld,
Test-Skript ohne grünen Lauf, leeres CHANGES). Sie wurde übernommen, geprüft, an 7 Stellen nachgebessert (siehe Fach-Prüfung) und fertig gebaut.

### Gebaut
1. **Effektkern im AM-Zweig des Worklets** (`class MkFx`, zwischen `/*MK{*/` … `/*}MK*/`, ASCII), stereo je Spur, Reihenfolge
   **MOD-FX → DELAY → EQ**, hinter der Stimmensumme und vor der unveränderten Spur-Kette (Drive, Chorus, Hall-/Echo-Send, Pump, Vol, Pan).
   - **MOD-FX** (W-31): Chorus/Flanger (1 ms + Hub dep/127 · 4 ms, Rückkopplung max(0,(dep−64)/63) · 0,85, L/R-LFO 90° versetzt,
     Catmull-Rom-Abgriff), Ensemble (3 Abgriffe 120° versetzt um 8 ms, Hub dep/127 · 3 ms, L = A1 + ½A2, R = A3 + ½A2),
     Phaser (6 Allpässe je Kanal, 200 Hz … 4 kHz, Rückkopplung dep/127 · 0,7). Tempo 0,02 Hz · 2^(9·spd/127).
     Mischung für alle Typen w = min(0,5; 0,6·dep/127).
   - **DELAY** (W-32, W-12): Stereo, Kreuz (Rückkopplung L↔R), L/R (Mono-Summe, Echos abwechselnd). Pegel dep/127,
     Rückkopplung 0,8·dep/127. ZEIT 1 ms · 2^(10,45·time/127) (1 ms … 1,4 s), TEMPO SYNC mit NOTE 1/32 … 1/1 im Song-Tempo,
     jede Note im ganzen Bereich 40–240 BPM ohne Kürzung (Puffer 6 s). Verzögerung in **ganzen Samples** (keine Interpolation,
     die Wiederholungen werden nicht dumpfer). ZEIT-, NOTE- und Tempo-Wechsel: der Lesekopf blendet in 40 ms gleichleistungsgemäß
     auf die neue Stelle (kein Sprung, kein Tonhöhen-Jaulen).
   - **EQ** (W-33): Tiefen- und Höhen-Kuhschwanz 2. Ordnung (Q 0,707) als TPT-SVF (B.6 Nr. 10), 40 … 1000 Hz bzw. 1 … 18 kHz,
     ±12 dB in 0,5-dB-Schritten. Koeffizienten je Steuerblock (16 Samples) aus geglätteten Werten (5 ms, Frequenz im Log-Maß).
   - **Aus = bitgleich:** Jede Stufe rechnet nur, solange ihre Tiefe/ihr Gain (Ziel oder geglättet) ≠ 0 ist; sind alle aus, gehen die
     Stimmen wie bisher direkt zum Ausgang (bitgleich zu 4.10.0).
   - **Schalten ohne Knacken:** Typ-Wechsel MOD-FX und DELAY bei laufendem Effekt 30 ms Gleichleistungs-Blende (alter Typ aus, neuer ein;
     ein weiterer Wechsel wartet). MOD-FX ein: die Tiefe steht sofort, nur die Mischung blendet mit 20 ms ein; aus: die Tiefe bleibt
     stehen, während die Mischung ausblendet. Stetige Werte 5 ms geglättet, Bruchwerte während der Geste (EN3-03).
   - **Puffer:** 6 s stereo Float32 je AM-Spur (2 304 032 B bei 48 kHz, 2 116 832 B bei 44,1 kHz), angelegt erst beim ersten
     `dly.dep` > 0 im Nachrichten-Weg (oder beim Laden eines Sounds mit Delay), nie in `process()`; vorher 0 Byte. Meldung `{mkFxMem}` an
     den Hauptfaden, `mkInfo().fxBytes` zählt alle Spuren.
   - **Nachklang:** Echo, Chorus-Rückkopplung und Filter klingen ohne Stimme weiter (`fxHot`), bis der Ausgang länger als die längste
     Verzögerung unter −110 dBFS liegt; dann rechnet der Zweig nicht mehr. Denormale: alle Rückkopplungs- und IIR-Zustände werden am
     Blockende bzw. beim Schreiben unter 1e-15 auf 0 gesetzt (B.6 Nr. 11).
   - **Leistung:** Der Effektzweig läuft **einmal je Render-Quantum** (128 Samples, nach den 8 Steuerblöcken der Stimmen; Aufruf
     `this.mk.fxEnd(L, R)` im Prozessor vor der Mono-Halbierung) statt je 16er-Block — das halbiert seine Kosten.
2. **Bedienfeld** (EDIT-WAHL 2, Stellungen 5–7 wie am Original, vorher dunkel „kommt mit MK4“):
   - **MOD-FX:** TYP (Liste Chorus/Flanger · Ensemble · Phaser, Anzeige CHO/EnS/PHA) · TEMPO (Hz des Effekt-LFO) · TIEFE (% Effekt-Anteil, 0 = aus).
   - **DELAY:** TYP (Stereo · Kreuz · L/R; StE/CrO/L-r) · TEMPO SYNC (an/aus) · **ZEIT │ NOTE** am selben Platz (wechselt mit TEMPO SYNC,
     Matrix-Zeile „ZEIT“/„NOTE“) · TIEFE (Echo-Pegel und Wiederholung in dB). NOTE ist ein stetiger Regler mit Rundung auf die 15 Werte
     (Haptik je Stufe), Tipp = Liste mit 15 Zeilen. LCD z. B. „DELAY · NOTE 1/8“ / „250 ms (Song-Tempo 120)“, Anzeige „1.8“ wie am Original.
   - **EQ:** TIEF-FREQ · TIEF-GAIN · HOCH-FREQ · HOCH-GAIN; Frequenzen logarithmisch (gleicher Weg = gleiches Verhältnis), Gains enden auf
     0,5-dB-Schritten, LCD in Hz/kHz und dB („EQ · TIEF-GAIN“ / „+4,5 dB“), Anzeige z. B. „4.5“, „6.00“, „18.0“.
   - Liste der EDIT-WAHL 2 zeigt je Effekt eine Zeile (z. B. „Kreuz · NOTE 1/8 · 250 ms · TIEFE 41“), Auswahl-LCD ebenso; ◎ markiert
     abweichende Effekt-Stellungen; ◎-Vergleich mit dem Original auch für `mfx`/`dly`/`eq`. Eine Geste = ein Undo. SHIFT+OKT ±1 kennt die
     0,5-dB-Schritte. Hilfe: zwei neue Zeilen (MOD-FX/DELAY/EQ, DELAY-Typen und TEMPO SYNC).
3. **Leistungs-Probe** (Menü → Info): Fälle „Kern“ und **„+FX“** (Kern mit allen drei Effekten: Phaser bzw. Cho/Flg, Delay Stereo 1/8
   TIEFE 64, EQ +6/−4 dB).
4. **Test-API:** `mkRender(sound, ev, {fxIn: {l, r}, fxFrz})` (Signal in den Effekteingang, Effekt-LFO eingefroren), Worklet-Nachrichten
   `{mkFxIn}`, `{mkFxFrz}`, Tap `'fx'` (Effektausgang ohne DC-Sperre), `mkInfo().fxBytes`.

### Abnahme MK4 (Node-Offline `v3-mk4-fx.mjs`, `v3-mk4-cpu.mjs`; Chromium `v3-mk4-ui.mjs`, `v3-mk4-pe1.mjs`, `v3-mk1-look.mjs`, `smoke.mjs`)
| ID | Ergebnis |
|---|---|
| MK4-01 | ✔ 32 Renders (3 Timbres × Mod-FX-Typ 0–2 × TEMPO 0/64/127 bei TIEFE 0, Delay alle Typen TIEFE 0, EQ 0 dB, dazu VA und FM6) gegen 4.10.0: max \|Δ\| = 0. Ohne Delay-TIEFE 0 Byte Puffer. |
| MK4-02 | ✔ Cho/Flg auf Rauschen, LFO eingefroren: TIEFE 100 Kerbtiefe 15,6 dB (≥ 12; W-31 ≈ 16,8), TIEFE 40: 4,1 dB (≤ 6). Kammabstand wandert 56 % (erste Kerbe 504 → 223 Hz). LFO-Periode aus der Verzögerung je 20 ms: 2,16 s gegen W-31 2,156 s (TEMPO 64). |
| MK4-03 | ✔ Ensemble TIEFE 127: Korrelation der nassen Signale L/R 0,19 … 0,24 (≤ 0,5) in 7 LFO-Stellungen; nasser Pegel −0,72 … +0,96 dB (± 1). |
| MK4-04 | ✔ Phaser TIEFE 127: 3 Kerben 16,6 / 19 / 20,2 dB (LFO unten) bzw. 20,5 / 22,4 / 18,2 dB (oben); tiefste Kerbe 53 → 1172 Hz = 4,47 Okt. |
| MK4-05 | ✔ Sync 1/8 bei 120 BPM: erstes Echo +12 000 Samples in L und R; TIEFE 64: −5,95 dB (W-32 −5,95); TIEFE 127: jede Wiederholung −1,94 dB, Spitze Impuls −6 dBFS. Info: ein 4-stimmiger Akkord mit Anschlag 1 und TIEFE 127 erreicht am Engine-Ausgang +2,1 dBFS (trocken −3,9; Echos addieren sich); der Nachhall fällt danach stetig; Begrenzer und Soft-Decke der Summe folgen (siehe Abweichungen). |
| MK4-06 | ✔ Kreuz, Impuls nur links: Echos L, R, L (> 250 dB Trennung, also nur ein Kanal); L/R mit Mono-Impuls: L, R, L, R. |
| MK4-07 | ✔ ZEIT 0/64/127: 1,00 / 38,48 / 1398,83 ms = W-32 (Abweichung < 0,1 %). ZEIT-Sprünge (90→110→60→100→30) und Zug 64→120 in 1 s bei laufendem Echo: M-KLICK ≤ 2,3 dB, M-EINBRUCH ≥ −2,1 dB. |
| MK4-08 | ✔ 120 → 90 BPM während des Echos: Impuls 0,5 s nach dem Wechsel echot nach 333,33 ms (genau, also < 1 Takt); M-KLICK 2,3 dB, M-EINBRUCH ≥ −0,6 dB. |
| MK4-09 | ✔ Tiefen-Kuhschwanz 100 Hz +12 dB: 25 Hz +11,94, 400 Hz +0,06, 1 kHz 0,00 dB. Höhen-Kuhschwanz 8 kHz −12 dB: 16 kHz −11,81, 2 kHz −0,04 dB. |
| MK4-10 | ✔ Echo eines Rauschstoßes trägt die Phaser-Kerben (246 / 914 / 4242 Hz, 19–22 dB); EQ 8 kHz −12 dB im Echo: −11,8 dB bei 16 kHz. |
| MK4-11 | ✔ Node-Offline, je Fall eigener Prozess, Median aus 5: alle drei Effekte an = **+0,72 … +0,79 × VA-Stimme** je Spur (Cho/Flg 0,79, Ensemble 0,72, Phaser 0,78; ≤ 1,0). VA-Stimme 4,66 ms je s Audio. Spitze je Quantum (99,9 %): Kern 0,31 ms, +FX 0,35–0,47 ms (Rauschen der Maschine; p50 +0,009 ms). Leistungs-Probe mit „+FX“ läuft (frames_ok, 0 Netzaufrufe). |
| MK4-12 | ✔ M-PLATZ in P1, P2, P3, L1, L2, W, L1 mit Safe-Area, 926 × 428 mit Safe-Area, L1 mit Home-Balken (Halb-Ansicht quer), Halb-Ansichten LINKS/RECHTS: MOD-FX, DELAY ZEIT, DELAY NOTE (Ebene 1 und 2), EQ (Ebene 1 und 2), alle Treffer ≥ 44 × 44, keine Überlappung, nichts abgeschnitten, kein Scrollen. M-ANSICHT ZEIT │ NOTE und Effekt-Stellungen: 0,00 px. Listen TYP (3), NOTE (15), EDIT-WAHL 2 (11): Zeilen ≥ 44 px, im Bild, gewählte sichtbar. H-1 / H-3 aller Effekt-Regler: siehe unten. MK1-21/MK1-32 (`v3-mk1-look.mjs`, 88 Prüfungen, M-SKIZZE) bestehen weiter. |
| MK4-13 | ✔ Spur-Effekte unverändert (Spur-Kette nicht angefasst; VA/FM6 und AM ohne Effekte bitgleich). Worklet ASCII. Markenwörter (B.6 Nr. 9): AM-Teil 0, ganze Datei genau 1× `MS 2000` in `MK_LABEL`. Keine Konsolenfehler (alle Läufe), Smoke-Test ohne Fehler. PE1: rAF-Median 59,9–60 fps, keine longtask > 50 ms, Noten wie Grundstand, 0 Tick-Fehler. **Budget: +24 967 B (24,4 KiB) ≤ 25 KB.** |
| MK4-14 | ✔ 1/1 und 3/4 bei 120/60/40 BPM: erstes Echo nach 96 000 / 72 000 / 192 000 / 144 000 / 288 000 / 216 000 Samples (genau). Tempo 120 → 40 → 120 BPM während des Echos: M-KLICK 2,0 dB. Puffer vor der ersten TIEFE > 0: 0 Byte, danach **2 304 032 B ≈ 2,3 MB je Spur** (48 kHz; Chromium mit 44,1 kHz: 2 116 832 B), einmal angelegt (zweites Einschalten legt nichts neu an). |

**H-1 (min → max)** MOD-FX TYP Cho/Flg → Phaser 10,2 dB (Band) · TIEFE 12,1 dB · TEMPO Periode ×108 (64 → 127; 0 = 50 s wäre zu lang für
einen Render) · DELAY TIEFE +42 dB Echo · ZEIT ×1399 · NOTE ×32 · TEMPO SYNC ×13 · TYP (Kreuz) Kanalwechsel · EQ TIEF-GAIN 24,0 dB ·
TIEF-FREQ 11,9 dB · HOCH-GAIN 23,1 dB · HOCH-FREQ 11,8 dB. **H-3** (0, ¼, ½, ¾, 1, kein Rückgang > 0,5 dB): Cho/Flg-Kerbtiefe
0 → 3,1 → 7,7 → 14,3 → 19,6; Phaser tiefste Kerbe 0 → 3,0 → 7,5 → 15,2 → 20,2; Ensemble L/R-Unterschied −120 → −31,7 → −25,1 → −22,1 → −19,8 dB;
Delay-Echo −48,1 → −17,9 → −12,0 → −8,5 → −6,0 dB; ZEIT, alle EQ-Regler stetig steigend. **Umschalten** (M-KLICK ≤ 6 dB, M-EINBRUCH
≥ −3 dB): Mod-FX-Typ 0→1→2→0 3,9 dB; Mod-FX-TIEFE 0→127→0 als Sprung 4,0 dB; Delay-Typ 2,3 dB; Delay-TIEFE und TEMPO SYNC 2,5 dB;
EQ-Sprünge 2,1 dB; Züge in 1 s (Phaser-TIEFE, Ensemble-TEMPO, Cho/Flg-TIEFE, Delay-TIEFE, NOTE 1/32→1/1, TIEF-FREQ, HOCH-GAIN) ≤ 4,7 dB.
**Im App-Pfad** (mkRender über das echte Worklet): Echo nach 250 ms bei −5,95 dB; EQ 4 kHz −12 dB senkt 8/12 kHz um 11,3/11,9 dB;
Ensemble macht aus Mono Stereo; Sound-Normalisierung (Laden/Speichern) behält alle Effektwerte (auch −3,5 dB).

### Fach-Prüfung (vor der Abnahme, selbst ausgeführt): FP-DSP (Haupt-Blick), FP-IPHONE (Zweit-Blick) — 9 Befunde, 8 behoben, 1 begründet
1. **FP-DSP / CPU (behoben):** Erster Stand mit Effekt je 16er-Block kostete +1,23 … +1,35 × VA-Stimme (MK4-11 verfehlt). Jetzt einmal je Quantum: +0,72 … +0,79.
2. **FP-DSP / Mod-FX-Sprung (behoben):** TIEFE 0 → 127 als Sprung blendete die Mischung nur in 5 ms ein (M-KLICK 6,1 dB). Jetzt Mischung 20 ms,
   Tiefe beim Einschalten sofort, beim Ausschalten gehalten: 4,0 dB.
3. **FP-DSP / Echo-Klang (behoben):** Lineare Interpolation bei gebrochener Verzögerung (z. B. 112 BPM bei 44,1 kHz: 1/8 = 11 812,5 Samples)
   machte jede Wiederholung dumpfer (−2,4 dB bei 10 kHz je Durchlauf). Jetzt ganze Samples; Prüfung: jede Wiederholung liegt ganz in einem Sample.
4. **FP-DSP / Nachklang (behoben):** Die Ruhe-Schwelle 1e-7 (−140 dB) ließ ein Echo 1,4 s / TIEFE 127 über 100 s weiterrechnen. Jetzt −110 dBFS.
5. **FP-DSP / EQ-Bauform (behoben):** Koeffizienten je 32 Samples → je Steuerblock 16 (B.6 Nr. 10). Abweichung: g wird je 16er-Block aus dem
   geglätteten Wert gesetzt, nicht je Sample interpoliert (TPT verträgt das; M-KLICK der EQ-Sprünge 2,1 dB).
6. **FP-DSP / Messung (begründet):** Ein Flanger mit Rückkopplung auf einem harmonischen Akkord schwillt von selbst an, wenn Kammspitzen und
   Teiltöne zusammenfallen (+6,0 dB im 2-ms-Fenster, auch in einem idealen float64-Flanger, `v3-mk4-dbg5.mjs`). M-KLICK auf diesem Akkord wird
   deshalb an den Umschaltpunkten (−5 … +80 ms) und über die Gesten gemessen, auf Rauschen über das ganze Signal.
7. **FP-DSP / LCD (behoben):** EQ-Gain zeigte „005“ statt „+4,5 dB“; EQ-LCD jetzt nur in Hz/kHz und dB.
8. **FP-IPHONE / PE1 (geprüft):** unbeschränkt rAF 59,9–60 fps, 0 longtasks, Noten wie Grundstand. Mit 4× CPU-Drossel haben Grundstand
   und MK4 gleichermaßen longtasks (Grundstand 1–5, MK4 0–7 je Lauf, beide 47–60 fps) — kein MK4-eigener Befund.
9. **FP-IPHONE / Speicher (geprüft):** 2,3 MB je AM-Spur mit Delay (8 Spuren ≈ 18,4 MB höchstens); der Puffer bleibt bis zum Neubau des
   Spur-Knotens (bewusst, damit ein Wieder-Einschalten nichts anlegt). Anlegen im Nachrichten-Weg des Audio-Fadens (Spec W-32); Chromium
   legt große Float32Arrays als genullte Seiten an (keine Kopierarbeit). Startzeit unverändert (Effekt-UI im nachgeladenen `sq-mk-src`).

### Abweichungen von der Spec (bewusst)
- **MK4-05 „kein Überlauf“** gilt für den Prüf-Impuls (Spitze −6 dBFS) und den stetig fallenden Nachhall; ein voller 4-stimmiger Akkord mit
  Anschlag 1 und TIEFE 127 erreicht am Engine-Ausgang +2,1 dBFS (wie am Gerät addieren sich Echos), danach folgen Begrenzer und Soft-Decke der Summe.
- **M-KLICK auf dem Akkord** an Umschaltpunkten und Gesten (Befund 6).
- **EQ-Koeffizienten je 16er-Block** statt je Sample interpoliert (Befund 5).
- **MK4-11** in Node (V8) gemessen; der iPhone-Faktor ist weiter unbelegt (§15.1).
- **MK4-02 Periode** über die laufende Verzögerung (Kreuzkorrelation je 20 ms) statt aus einer Impulsantwort; H-1 von TEMPO als 64 → 127.

### Bekannte Lücken / für den Hauptstrang
- **ECO-Klang ohne Effekte** (Spec B.5: „ohne T2, FX …“).
- **MK2-Test veraltet:** `v3-mk2-ui.mjs` MK2-10 erwartet MOD-FX … SEQ dunkel; ab MK4 sind MOD-FX/DELAY/EQ aktiv → Erwartung nach dem Zusammenführen anpassen.
- **Schon im MK2-Stand (nicht hier behoben):** `v3-mk2-ui.mjs` MK2-08 „Welle ≤ 30 ms nach dem Laden“ schwankt (MK2.html: 37,7/57,8 ms, MK4: 24,6/36,0 ms);
  `v3-mk1-ui.mjs` MK1-31 „🎲 jeder hörbar“ fällt zufällig (MK2.html: 1 stummer Wurf von 100; hier einmal 1, einmal 0).
- **Zusammenführen:** MK4 berührt `MkCore.block` (Stimmensumme in den Effektpuffer, Zeilen um `this.fx`), `MkCore`-Konstruktor/Laden/`set`/`idle`,
  `process()` des Prozessors (eine Zeile `this.mk.fxEnd(L, R)` vor der Mono-Halbierung, `fxHot()` in den zwei `busy()`-Bedingungen), die
  Nachrichten `{mkFxIn}`/`{mkFxFrz}`, `mkFxMem` im Host, `mkInfo`, `mkRender`, im Bedienfeld `L_`, `KN`, `SEC2` (Stellungen 5–7), `knobs()`,
  `fmtv`, `lcdOf`, `setWahl`, die Matrix-Namen, `paintKnob` (Log-Regler), `wiaPos2`, `knobGesture`, `octBtn`, Probe, Hilfe. MK3 ändert ebenfalls
  `MkCore.block` (Timbre-Verteilung) — dort zusammenführen: die Stimmen beider Timbres summieren in `VL/VR` mit `vo = off`.

### Geräte-Abgleich (für Xander am eigenen Gerät, EN3-16)
1. MOD-FX Chorus/Flanger TIEFE 40 (sanfter Chorus) und TIEFE 100 (deutlicher Flanger mit Pfeifen).
2. MOD-FX Ensemble TIEFE 127 auf einer Fläche: breit, schwebend.
3. MOD-FX Phaser TEMPO 30: langsames Wandern (≈ 0,09 Hz, eine Runde ≈ 11 s).
4. DELAY TIEFE 64, NOTE 1/8: Wie viele Wiederholungen hörst du? Die App: erstes Echo −6 dB, dann je −7,9 dB → ≈ 5 hörbare Wiederholungen.

### iPhone-Prüfpunkte (Pages-Stand nach MK4, EN3-17)
1. MS-2000-Spur, EDIT-WAHL 2 auf **DELAY** (Stellung 6): TEMPO SYNC an, NOTE 1/8, TIEFE 60, Song läuft → Echo im Takt, kein Knacken beim Drehen.
2. BPM während des Songs ändern → Echo folgt sofort, ohne Knacken.
3. **MOD-FX** Ensemble auf einer Fläche (TIEFE hoch) → breiter Stereoklang; TIEFE auf 0 → genau der Klang ohne Effekt.
4. **EQ** TIEF-GAIN +6 dB → mehr Bass; HOCH-GAIN −12 dB → dumpfer.

### Tests und Dateien
- `dirigent-test/v3-mk4-fx.mjs` (Node, 61 Prüfungen, Ausgabe `v3-mk4-fx.out`), `v3-mk4-cpu.mjs` (`v3-mk4-cpu.out`), `v3-mk4-ui.mjs`
  (Chromium, 64 Prüfungen, `v3-mk4-ui.out`), `v3-mk4-pe1.mjs` (`v3-mk4-pe1.out`), `v3-mk4-shot.mjs`, Hilfen `v3-mk4-dbg*.mjs`, `v3-mk4-qpk.mjs`.
- Bildschirmfotos: `dirigent-test/v3-mk4-shots/` — je Format P1, P2, P3, L1, L2, W: `-modfx`, `-delay-zeit`, `-delay-note`, `-eq`; dazu
  `mk1-look-*` (SPIEL/FILTER aller Formate inkl. Safe-Area und Halb-Ansichten). Smoke: `dirigent-test/v3-mk4-smoke.png`.
- Schnappschuss: `synq-snapshots/MK4.html`. Größe 2 822 269 B (MK2 + 24 967 B).

## MK4-fix — zwei Befunde aus der Prüfung behoben · App bleibt 4.12.0 · Format 5 · keine Server-Änderung

### 1. Änderung in der Stille wirkte erst beim nächsten Ton (TIEFE 0 / EQ 0 dB nicht bitgleich trocken)
- **Ursache:** Nur `MkFx.run()` führte die Glätter (`sMd`, `sW`, `sDd`, `sLg/sHg/sLf/sHf`) und die Typ-Überblendungen nach — und `run()` läuft
  nur, solange eine Stimme oder ein Effekt-Nachhall klingt. Außerdem blieb `mOn` nach dem Ausblenden stehen. Folge: Wer zwischen zwei Tönen
  TIEFE auf 0 drehte, ein Programm wechselte (Zifferntasten) oder den TYP umschaltete, hörte am Anschlag des nächsten Tons noch den alten Effekt
  (bis −5 dB in 0–5 ms; Programmwechsel max |d| 0,134 > Tonspitze; Typwechsel +4,5 dB).
- **Behoben:** neue `MkFx.settle()`: Klingt nichts (keine Stimme, kein Effekt-Nachhall — oder die Effekte waren vor der Änderung aus), springen
  alle Glätter, Mischung, Delay-Zeit/-Typ und der Mod-FX-Typ sofort auf ihr Ziel; eine laufende Mod-FX-Stufe startet mit leeren Leitungen und
  frischen Abgriffen (kein Gleiten von der LFO-Stellung vor der Pause), eine abgeschaltete Stufe ist wirklich aus. Aufgerufen von
  `MkCore.load` und `MkCore.set` (nur bei mfx/dly/eq-Pfaden, `fxSettle`) und am Quantums-Ende, sobald der Nachhall still ist (`fxEnd`).
  Zusätzlich fällt `mOn` schon im Durchlauf ab, in dem die Mischung 0 erreicht. Änderungen bei klingendem Ton laufen unverändert geglättet.
  Delay-Länge als `dLen()` ausgelagert (gleiche Rechnung).
- **Nachweis (Node, echter Worklet-Code):** `v3-qa-mk4-idle.mjs` gegen 4.10.0: Programmwechsel, Ensemble TIEFE 127→0, TIEF-GAIN +12→0 jeweils
  max |d| **0** (vorher 0,134 / 0,062 / 0,053), Pegel 0,0 dB in allen Fenstern; Kontrolle (Änderung bei klingendem Ton) unverändert ≤ 2,9e-6.
  `v3-qa-mk4-idle2.mjs` Typwechsel Phaser→Cho/Flg in der Stille gegen „immer Cho/Flg“: max |d| **0** (vorher +4,5 dB). Neu
  `v3-mk4fix-idle3.mjs` (Gegenrichtung: TIEFE 0→127, 40→127, Ensemble→Phaser, EQ 0→+12/−6, DELAY 0→100 in der Stille gegen „immer so“):
  alle ≤ 3,7e-7 (vorher bis 0,13). **Chromium** (`v3-rep-mk4-idle-chrom.mjs`, OfflineAudioContext über SynthHost): alle Stille-Änderungen
  max |d| 0, Kontrollen ≤ 2,9e-6, keine Konsolenfehler. **Live** (`v3-rep-mk4-idle-live.mjs`, Echtzeit, `SYNQUENZER.mkSet`): erster Ton nach der
  Änderung minus späterer Ton 0,39/−0,66/0,30/−0,06 dB — innerhalb des Rauschbodens später-gegen-später (1,45/−1,72/0,70/−0,35 dB; vorher −5,65/−4,72 dB in 0–5 ms).

### 2. Panik und ■■ („Hall und Echo aus“ / „Alle Töne aus“) ließen das MS-2000-DELAY weiterklingen (> 30 s)
- **Ursache:** `tailKill()` leerte nur Bus-Echo und Hall; `MkCore.panic()` blendete nur die Stimmen aus; `MkFx` hatte keinen Löschweg.
- **Behoben:** `MkFx.kill()`: klingt ein Effekt-Nachhall, blenden die Delay-Wiederholungen (Rückkopplung und Ausgang) und die Mod-FX-Mischung
  über `MK_KQ` Quanten (10 ms) linear aus, danach vergisst das Delay seinen Puffer (`dWr = 0`, nur Neues kommt zurück) und die Mod-FX-Stufe
  startet leer neu (Mischung blendet in 20 ms wieder ein); ist alles still, sofort (`wipe()`). Aufgerufen von `MkCore.panic()` (Worklet-Ereignis 6)
  und von der neuen Nachricht `{mkFxKill}` (`E.mkFxKill()` im Host), die `tailKill()` an jede Synth-Spur (und die Vorhör-Kette) schickt.
  Eine neue Note danach bekommt wieder ihr Echo. Alles ASCII im Worklet-Quelltext (btoa-Weg).
- **Nachweis:** `v3-rp-mk4-dlytail.mjs` (Chromium, echte Taps, P1 390×844 und L1 844×390): ■■ mit TIEFE 127: 0–300 ms −97/−87 dB, ab 300 ms
  Stille (vorher −26 … −34 dB über 4 s); panic(): 0–300 ms −90/−124 dB, ab 300 ms Stille bis 10 s (vorher −30 … −55 dB); panic + Stumm genauso;
  Kontrollen TIEFE 0 still; keine Seitenfehler. `v3-qa-mk4reg-tailui.mjs`: Bus-Echo Basis/neu unverändert (−33 dB, dann Stille), MS-2000-Delay
  jetzt −102/−94 dB, dann Stille. `v3-qa-mk4reg-panic.mjs` (ZEIT 127, Akkord): ab 0 s −200 dB, nichts über −60 dB (vorher noch bei 29,3 s).
  Neu `v3-mk4fix-kill.mjs` (Node, 30 Prüfungen, `v3-mk4fix-kill.out`): Delay 127, Delay + Cho/Flg, Phaser, Cross + EQ +12, je Panik und Kill:
  20 ms danach < −80 dB (Rest = Ausschwingen des DC-Blockers), ab 0,5 s < −100 dB, kein Knack (größter Sprung beim Kill ≤ Sprünge des laufenden
  Nachhalls), neue Note hat wieder Echo.

### Regression
- `v3-mk4-fx.mjs` 61/61 PASS (`v3-mk4fix-fx.out`), `v3-mk4-ui.mjs` 64/64 PASS (`v3-mk4fix-ui.out`), `v3-mk1-dsp.mjs` 64 PASS
  (`v3-mk4fix-mk1dsp.out`), Smoke ohne Fehler (`dirigent-test/v3-mk4fix-smoke.png`). Keine sichtbare Änderung (keine Layout-Prüfung nötig).
- Chromium: `/opt/pw-browsers/chromium-1194` gibt es nicht; alle Läufe mit `chromium-1243` (wie die übrigen MK4-Tests).
- **Zusammenführen:** zusätzlich berührt: `MkFx` (`settle`, `kill`, `wipe`, `dLen`, `mFresh`, `kq` in `run`/`hot`/`idle`), `MkCore.load`/`set`/`fxEnd`/
  `fxSettle`/`panic`, `onMsg` (`mkFxKill`), Host `E.mkFxKill`, `tailKill()` im Hauptfaden.
- Offen/Beobachtung: Stummschalten einer Spur schneidet einen laufenden Effekt-Nachhall nicht ab (gilt für das Spur-Ende vor der Stumm-Stufe;
  nicht Teil des Befunds, nicht geändert).
- Schnappschuss: `synq-snapshots/MK4-fix.html`, 2 826 589 B (MK4 + 4 320 B).
