# CHANGES – MS 2000, Paket MK7 (Zweig-Kopie `mk-br-MK7`)

## MK7 — Vocoder mit 16 Bändern und Eingänge E1/E2 · App 4.15.0 (`APP_CODE` 4 015 000) · Format bleibt 5

**Vorgänger-Stand** für alle „bitgleich“-Abnahmen und das Budget: **4.12.0** (MK0–MK4 zusammengeführt =
`synq-snapshots/G-MK34-merge.html`, 2 874 742 B). Diese Kopie startet dort; MK5/MK6 entstehen in eigenen Zweigen.
Der Orchestrator führt zusammen und setzt die VERSION-Zeile endgültig. Server: keine Änderung nötig
(`max_app` 4 021 000 ≥ 4 015 000, Format 5). Kein Supabase-Aufruf in diesem Lauf. Nichts committet.

**Größe:** 2 927 671 B = **+52 929 B** (Budget MK7-14 ≤ +52 KB = 53 248 B) — eingehalten.
Davon grob: Worklet (MkVoc, Eingänge, Eingang-Welle) ≈ +20 KB, Bedienfeld `sq-mk-src` ≈ +22 KB, Hauptteil (Eingänge,
gemeinsamer Mikrofon-Abgriff, Undo, ECO, Probe, Test-API, Hilfe) ≈ +11 KB. Kommentare wurden dafür gekürzt.

### Gebaut
1. **Vocoder im Worklet** (`class MkVoc` im AM-Teil `/*MK{*/ … /*}MK*/`, ASCII), nur Timbre 1, MODUS 3:
   - **16 Analyse-Bänder** auf E2 (je 2 TPT-SVF-Bandpässe = 4. Ordnung, Güte fest 10), Mitten W-36-Raster,
     **Folger** je Band (W-38-Zeitkonstante, Anstieg τ/4), FOLGER 127 = Halten.
   - **16 Synthese-Bänder** auf dem summierten Träger (4. Ordnung, Q = 3 + 9·RESO/127), Lage aus W-36 mit
     FORMANT-SHIFT, CUTOFF, FC-MOD (Quelle + Intensität, W-37), Zwischenwerte log. in Noten interpoliert.
   - **Gate** (W-39, 3-ms-Spitzenfenster, exponentielles Schließen bis −60 dB in der Gate-Zeit), **HPF** 4. Ordnung
     Butterworth 6 kHz mit HPF-PEGEL und HPF-GATE (W-40), **DIREKT** (W-41), **K-PEGEL / K-PAN** je Band (W-42).
   - **Halten** (`voc.hold`, 16 × 0…127, 0,5-dB-Schritte): TIMBRE-Taste (LED „HALTEN“) friert die Folger ein und
     speichert sie mit dem Sound; nochmal = aus; FOLGER ganz auf hält ebenso. Ein gehaltener Sound klingt ohne Eingang.
   - **Begrenzer Stufe 1** (CPU): statt 2 Bandpässen einer mit Q × 2 (+ Ausgleich 0,91), Wechsel 30 ms Vorlauf +
     30 ms Gleichleistungs-Blende. Ausgang mit weichem Knie über ±1 (Spitze ≤ +6 dBFS).
   - **Ruhe-Sparen:** stille Analyse wird übersprungen (keine Denormale), unbenutzter Eingang kostet nichts im Kern.
   - **Träger-Stimmen** (4 Säge im INIT „Vocoder“): OSZ 1 (alle Wellen, auch Sinus mit STEUER 1/2) + Rauschen + E1
     (W-19-Kurve), × EG2 × Pegel/Anschlag/KEYTR., Verzerrung (W-23), mono in die Trägersumme.
2. **Eingänge E1/E2** (EN3-15): Worklet-Knoten mit einem Stereo-Eingang (discrete), je AM-Spur ein ChannelMerger.
   `tr.mkIn = {e1, e2, e1Dry, e2Dry}` mit Quelle `null | 'mic' | 't:<uid>'` (Spur **vor dem Fader**, Abgriff an der
   `duck`-Stufe). **„Quelle nur als Eingang“** nimmt die Quelle über einen neuen Knoten `N.cut` (20-ms-Rampe) aus Master
   und Sends. **Kreis-Schutz** über alle Spuren (nicht wählbare Zeile „nicht möglich (Kreis)“). Ein Undo je Änderung
   (Art `mkin`), übersteht Speichern/Laden.
3. **Gemeinsamer Mikrofon-Abgriff** `MICTAP` (ref-gezählt, Nutzer `voc` und `st`): ein `getUserMedia` mit MIC_ASK
   (echoCancellation/noiseSuppression/autoGainControl aus), nur nach Tipp; der letzte Nutzer stoppt die Spuren.
   VS1 🎤 Stimme nutzt ihn jetzt ebenfalls (`stStart`/`stRelease`). Für den Vocoder laufen kein MPM und kein Ringpuffer.
   In der Claude-App gibt es keinen Mikrofon-Eintrag. Versteckte Seite = Vocoder-Mikrofon aus.
4. **Welle „Eingang“ (OSZ 1 = 7, W-30)** im Synth: (1 − BALANCE)·E1 + BALANCE·E2 durch Filter/Amp; TRANSP./FEIN wirkungslos.
5. **Bedienfeld:** Vocoder-Zeilen in EDIT-WAHL 1/2 (grüne Namen, Farbton 138°), SPIEL-Belegung im Vocoder,
   QUELLE 1/2 ▾ (Listen aus | Mikrofon | Spuren, „Quelle nur als Eingang“, „Mikrofon stoppen“), TIMBRE = HALTEN,
   SHIFT + 1/+ 2 = Pegel/Pan zurück (ein Undo), Zusatz-Ansicht **16 BÄNDER** (Canvas 2D, K-PEGEL oder K-PAN je Band
   ziehen, Bandpegel live ≤ 30 Hz, nur solange sichtbar), LEDs E1/E2 (an ab −50 dBFS, rot ab −1 dBFS).
   Modus Synth ↔ Vocoder startet die Tasten von T1 in der anderen Art neu; alle Elemente bleiben an ihrem Platz.
6. **Vokal-Quelle** `mkVowel` (W-44, DOM-frei, im `sq-mk-src` zwischen `/*MKV{*/ … /*}MKV*/`): Glottis (W-28) →
   F1–F4-Kaskade → Abstrahlung. Für Probe, Tests und später MK8/MK12.
7. **ECO:** Vocoder-Sound bleibt ohne Worklet stumm (keine Stimme), LCD „Vocoder braucht den Worklet-Klang – im ECO-Klang stumm“.
8. **Leistungs-Probe** mit drittem Fall „Vocoder“ (Vokalfolge in E2). **Hilfe:** 3 kurze MS-2000-Zeilen (Vocoder,
   Formant halten, Eingänge mit Latenz-/Kabel-Kopfhörer-Hinweis).
9. **Test-API:** `mkIn`, `mkInInfo`, `mkVocMic`, `mkHold`, `mkVowel`; `mkRender` mit `inputs {e1, e2}` und `at`.

### Abnahme MK7-01 … MK7-16
Tests: `dirigent-test/v3-mk7-voc.mjs` (Node-Offline, 37/37), `v3-mk7-inputs.mjs` (Chromium, Fake-Mikrofon, 24/24),
`v3-mk7-ui.mjs` (Chromium, 102/102), `v3-mk7-cpu.mjs`, Bilder `v3-mk7-shot.mjs` → `dirigent-test/v3-mk7-shots/`.

| Nr. | Ergebnis |
|---|---|
| MK7-01 | ✓ Bandtrennung k±1 ≥ 13,1 dB (≥ 12), k±3 ≥ 30,5 dB (≥ 30) |
| MK7-02 | ✓ Bandmitten W-36 (FORMANT 0/+1/−2, CUTOFF +63) max. 0,07 %; CUTOFF +32 0,4 % einer Stufe; FC-MOD EG2 +63 = +2 Stufen (0,39 %); SPIEL-Belegung im Bedienfeld |
| MK7-03 | ✓ FOLGER 0/64/126: 11,6 / 274,5 / 5 895 ms gegen W-38 11,5 / 273,7 / 5 894,6 ms; Halten (FOLGER 127 und TIMBRE) 5 s: 0,04 dB; gehaltener Sound ohne Eingang −19,8 dBFS; hold Speichern → Laden deep-equal |
| MK7-04 | ✓ Gate 64: −60 dB nach 68,0 ms (W-39 65,8); Gate 100: 452 ms (469,2); SCHWELLE 0: Ausgang folgt bis −90 dB |
| MK7-05 | ✓ HPF-PEGEL 127: Modulator > 6 kHz −3,1 dB; HPF-GATE: ohne Trägerstimme still, mit Stimme −3,1 dB |
| MK7-06 | ✓ DIREKT 127 ohne Stimme: Korrelation 0,9996; DIREKT 0 still |
| MK7-07 | ✓ K-PEGEL 0: −∞ dB; K-PAN L63: rechts −∞ dB; SHIFT + 1/+ 2, Init und SHIFT + 3 behalten den Vocoder |
| MK7-08 | ✓ jede OSZ-1-Welle als Träger hörbar; Akkord C-E-G-H 54–86 dB über der Lücke; EINGANG 1 im Träger; Sinus STEUER 1 +1,72 Okt., STEUER 2 mit LFO 1 |
| MK7-09 | ✓ Eingang durch 24LPF −34,4 dB = Ladder-Kurve; BALANCE ≥ 113 dB Trennung; TRANSP./FEIN Δ = 0; QUELLE 1/2 an Regler 4/5 |
| MK7-10 | ✓ Kreis abgelehnt (auch 3er-Kette), Graph kreisfrei; Spur → Eingang 0 Samples; Claude-App: 0 getUserMedia, kein Mikrofon-Eintrag; getUserMedia erst nach Tipp, MIC_ASK-Flags, Stopp → `ended`; Stimme + Vocoder: Stoppen des einen lässt den anderen laufen, erst der letzte → `ended`; „Quelle nur als Eingang“ Master −∞, Eingang weiter −17,1 dBFS; Fader 0 ändert den Eingang nicht; Stummschalten wie bisher; 0 Netzaufrufe |
| MK7-11 | ✓ Vocoder-Spur 1,92–2,15 × VA-Stimme (≤ 2,4, drei Läufe); Stufe 1: Nachbarband 8,1 dB (≥ 8), M-PEGEL Rauschen −0,76 dB, M-KLICK/M-EINBRUCH bestanden; Probe „Vocoder“ läuft (load_med 0,17, frames_ok) |
| MK7-12 | ✓ bitgleich (max \|Δ\| = 0) für AM Säge, AM Dual+FX, AM Split Rauschen, VA gegen 4.12.0. Unverbundener Eingang: 0,07 / 0,09 / 0,15 / 0,17 × VA in vier Läufen — **an der Grenze 0,16 und vom Mess-Rauschen bestimmt** (Differenz < 1 ms je s Audio; der Kern tut bei stillem Eingang nichts, der Rest ist Chromium-Graph-Arbeit) |
| MK7-13 | ✓ M-PLATZ Vocoder-Stellungen (Ebene 1/2) und 16 BÄNDER in P1–P3, L1, L2, W, mit Safe-Area/Home-Balken; M-SKIZZE grün 120–138°; M-ANSICHT Synth ↔ Vocoder; LEDs (E2 −26 dBFS an; +1,6 dBFS rot; −46 an; −54 aus); Bandpegel 28,6 Hz, rAF 59,9 fps |
| MK7-14 | ✓ Budget +52 929 B; VS2-Abnahme (`v3-mk7-vsacc.mjs`): alles grün bis auf „Stimme rechtzeitig geplant“ (−9 ms), das **auch auf 4.12.0** fehlschlägt (Zeitmessung im Test-Browser, nicht MK7); Mikro-Wege laufen über den gemeinsamen Abgriff |
| MK7-15 | ✓ ECO: Worklet −18,1 dBFS, ECO −∞ dBFS mit LCD-Hinweis, keine Konsolenfehler |
| MK7-16 | ✓ Vokal-Quelle F1/F2 für C2/C3 × a e i o u: größte Abweichung 0,5 % (≤ 7); `tr.mkIn` Speichern → Laden deep-equal |

Regression auf dieser Datei: Rauchtest ohne Fehler (`dirigent-test/v3-mk7-smoke.png`); `v3-mk1-look.mjs` 88/88;
`v3-mk2-marke.mjs` alles PASS (Markenwörter 0, „MS 2000“ genau 1, keine neue Schrift/Bild-Daten, Worklet ASCII);
`v3-mk4-ui.mjs` 63/64 — MK4-12 schlägt genauso auf 4.12.0 fehl (Test erwartet eine ältere Liste);
`v3-mk3-ui.mjs` MK3-10: einziger Befund ist die neue LED-Leiste `ein` (16 × 44), die der alte Test als Trefferfläche zählt —
sie ist nur Anzeige (kein Tipp), der MK7-Test prüft sie richtig. Testanpassung beim Zusammenführen.

### Fach-Prüfung
- **FP-DSP ● (Haupt):** Extremwerte 20 s (Resonanz 127, FC-MOD 50 Hz voll, alle Pegel 127): 0 NaN/Inf, Spitze +3,4 dBFS
  (vorher 7,5 dBFS → weiches Knie eingebaut). 60 s Stille nach Vollaussteuerung: keine Denormal-Spitzen (Analyse wird bei
  Stille übersprungen). Bandtrennung zuerst nur 29 dB bei k±3 → Analyse-Güte von 7,5 auf 10 gehoben. Stufe 1 mit zwei
  Filtern 2. Ordnung dämpfte das Nachbarband nur 3,5 dB → ein Bandpass mit Q × 2 (8,1 dB). Pegel abgeglichen: Vokal
  −20 dBFS auf 4 Säge-Stimmen ≈ Synth-Pegel (−15 dBFS). Koeffizienten je 16-Sample-Block, Glättung aller Sprünge.
- **FP-IPHONE (Zweit-Blick):** keine neuen Dauer-Timer; Bandansicht malt nur sichtbar (~30 Hz); Bandpegel-Meldungen nur
  solange die Ansicht offen ist; Mikrofon aus bei versteckter Seite; Touch-Ziele ≥ 44 (Ausnahme unten).
  Latenz ≈ 70–75 ms laut VS1-Messung → Hilfe und Hinweis „Kabel-Kopfhörer“; INIT hat DIREKT 0 und HPF-PEGEL ≤ 40.
- **FP-SICHER (Zweit-Blick):** Mikrofon nur nach Tipp, nie in der Claude-App, nichts wird aufgenommen oder gesendet
  (0 Netzaufrufe); ein gemeinsamer Abgriff, der letzte Nutzer stoppt die Spuren (`ended`); N7V-35 eingehalten
  (Quelle `t:<uid>` geprüft gegen UID_RE, `normMkIn` verwirft alles andere); Kreis-Schutz über alle Spuren, auch bei
  Laden/Undo (`mkInRoute` verbindet nie einen Kreis). B.6 Nr. 9: keine Markenwörter (Vokal-Tabelle heißt `VOW`, nicht
  `VOX`), „MS 2000“ genau einmal, keine Schrift/Bilder.

### Abweichungen von der Spec
- Analyse-Güte fest 10 (Spec nannte keinen Wert, 7,5 erreichte MK7-01 nicht).
- Begrenzer Stufe 1 = ein Bandpass mit Q × 2 und Ausgleich 0,91; bei harmonischen Trägern +0,7 … +1,7 dB (nur Info; Rauschen −0,76 dB).
- MK7-03 Folger gemessen als Abfall −6 → −26 dB (die Spitze am Anfang verfälscht den 0-dB-Bezug).
- MK7-04 Gate-Zeit mit langsamen Folgern und festem Säge-Träger gemessen (sonst überdeckt der Folger das Gate).
- MK7-16 F1/F2 über Vibrato-Hüllkurve (max-hold Vokal/roh), weil LPC auf 4 Formanten unzuverlässig war; dafür Vokal-Quelle
  als Kaskade + Abstrahlung, Bandbreiten 70/80/120/150 Hz.
- QUELLE 1/2 bei Synth-Welle „Eingang“ an OSZ-1-Reglern 4/5; im Vocoder an MIXER / EING. 1 mit SHIFT.
- HALTEN = Array `voc.hold`; FOLGER 127 hält ebenfalls. INST-PEGEL folgt der W-19-Kurve. DIREKT/HPF in der Mitte −3 dB.
- Vocoder-Ausgang mit weichem Knie. ECO-Vocoder startet keine Stimme (statt leiser Stimme).
- Bandsäulen in P2/P3 schmaler als 44 px (16 Säulen bei der Spec-Breite, keine Überlappung); gegriffen wird über die ganze
  Säulenhöhe (≥ 44 hoch), der Wert folgt dem senkrechten Ziehen.
- `getSettings().echoCancellation === false` nur am Gerät prüfbar (die Fake-Kamera liefert keine Settings); getestet ist die Anfrage.

### Bekannte Lücken
- **MK7-12** Leerlauf-Kosten des verbundenen, stillen Eingangs liegen im Rauschen um die Grenze 0,16 × VA (0,07–0,17).
- **iPhone-Punkte** (Pages, Kopfhörer) offen: 1) STIMME → Vocoder, QUELLE 2 = Mikrofon, sprechen + Akkord; 2) TIMBRE/HALTEN,
  Mikrofon aus, weiterspielen; 3) gehaltenen Sound in der Claude-App spielen; 4) `ST.latMs` je Weg (Lautsprecher, Kabel,
  Bluetooth) ablesen und hier eintragen.
- **Geräte-Abgleich** offen: Vocoder mit FORMANT +1/−1, FOLGER Halten, HPF-PEGEL hoch (Zischlaute).
- Bluetooth-Hinweis „Kabel-Kopfhörer empfohlen“ kommt über den bestehenden Mikrofon-Weg (`bt`); der Vocoder nennt ihn in
  Hinweiszeile und Hilfe immer.
- Vocoder-Werksklänge folgen mit MK8 (hier nur INIT „Vocoder“).
- Alte Tests MK3-10 (LED-Leiste) und MK4-12 (Liste) beim Zusammenführen anpassen; VS2 „Stimme rechtzeitig geplant“ ist
  im Test-Browser auch auf 4.12.0 wackelig.

### Hinweise zum Zusammenführen (berührte Stellen)
- Worklet: MKW-Tabelle (VR, vocPos/vocQ/vocTau/vocThDb/vocGate/vocHpf/vocDir/vocChl/vocK, holdQ/holdA, VOW/vowB/vowG/vowOQ),
  `MkVoice` (vm), `MkTim.voice`/`block` (Eingang-Welle, Träger-Stimmen), neue Klasse `MkVoc` vor `MkCore`, `MkCore`
  (inE1/inE2/io/vc, load/set mit voc.*, inSet, vocHot, vmOn, block), `AnalogCore.process` (inputs, vocHot, mkLv,
  mkHoldGet, mkLed), Knoten `numberOfInputs 1`, `channelCount 2`.
- Hauptteil: `SynthHost.track` (Eingänge, mkLv, mkHoldGet), `buildChain` (`N.cut`, `N.dryCut`), neuer Block vor
  „sq-mk-src: evaluated on first need“ (normMkIn … mkInSet, MICTAP), `stStart`/`stGot`/`stRelease` (gemeinsamer Abgriff),
  `normTrack` (mkIn), Undo-Art `mkin`, `syncEngine`/`cpuTick` → `mkInRoute`, `mkEco`/`spawnVoice`/`ecoMsg`, `initSound`,
  `mkRange`/`mkSetP` (voc.hold), `mkRender` (inputs, at), Probe-Fall `voc`, Hilfe-Zeilen, Test-API, NO_SYNC.
- `sq-mk-src`: `mkVowel`, KN-Vocoder-Regler, SEC1 [4]/[5], SEC2 [5], SPIELV, srcPop/holdToggle/chReset/paintEin,
  16-BÄNDER-Ansicht, render/timbreKey/numKey/knobGesture, CSS.
- Keine Datenbank-Änderung.
