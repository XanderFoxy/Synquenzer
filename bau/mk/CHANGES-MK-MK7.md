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
   - **Begrenzer Stufe 1** (CPU): ~~statt 2 Bandpässen einer mit Q × 2 (+ Ausgleich 0,91)~~ – **ersetzt in MK7-fix:**
     dieselben Bänder 4. Ordnung bei halber Abtastrate. Wechsel 60 ms Vorlauf + 30 ms Blende je Sample. Ausgang mit weichem Knie über ±1 (Spitze ≤ +6 dBFS).
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
- ~~Begrenzer Stufe 1 = ein Bandpass mit Q × 2 und Ausgleich 0,91~~ – ersetzt in MK7-fix (halbe Rate statt halber Ordnung, siehe unten).
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

---

## MK7-fix — fünf Prüf-Befunde behoben · App bleibt 4.15.0 · Format 5 · keine Server-Änderung

Ausgangsstand: `mk-br-MK7/index.html` 4.15.0 (2 927 671 B). Neuer Stand 2 931 675 B, Schnappschuss
`synq-snapshots/MK7-fix.html`. Nur MK7-Code berührt (MkVoc im Worklet, `mkInRoute`/`mkInLink`, `setMute`, `paintEin`).
Nichts committet, kein Supabase-Aufruf.

### 1. Stumme Vocoder-Spur ließ DIREKT und HPF (und das Mikrofon) in den Master
- **Ursache:** `setMute` beendet nur Clip-Stimmen; DIREKT und HPF brauchen keine Note.
- **Fix:** Der Eingang einer AM-Spur läuft jetzt Merger → **Tor-Gain** → Knoten. `mkInRoute` setzt das Tor auf 0, solange
  die Spur stumm ist (20-ms-Rampe wie `mkDryCut`), `setMute` ruft `mkInRoute` sofort. Eine stumme AM-Spur hört also keinen
  Eingang mehr: kein DIREKT, kein HPF, keine Analyse. Live-Tasten auf einer stummen Spur klingen wie bisher (ohne Eingang).
- **Belege** (Chromium, Live-Kontext): `v3-qa7-mute2.mjs` 2/2 (stumm −300 dB statt −46,7 / −30,2 dBFS);
  `v3-repro-mk7-mutevoc.mjs`: DIREKT 127 stumm −300 dB, HPF stumm −300 dB, Mikrofon (Fake) stumm −300 dB, nach dem
  Entstummen wieder −46,8 dBFS; `v3-repro-mk7-mutevoc-clip.mjs` (Clip-Fall, echter M-Knopf): −29,8 → −300 dB.
- `v3-qa7-mute.mjs` stummte für seine Messung die Vocoder-Spur selbst (hing am Fehler). Ersatz `v3-mk7fix-mute-src.mjs`
  (Träger still statt stumm): „Stummschalten der Quelle schweigt den Eingang“ besteht (−24,6 → −168,5 dB).

### 2. 16 BÄNDER zeigte keine Live-Bandpegel
- **Ursache:** `paintEin()` brach ab, weil die Ansicht keine E1/E2-LEDs hat; `bandsLive()` wurde nie erreicht.
- **Fix:** `bandsLive(m.b)` steht vor der LED-Prüfung.
- **Belege:** `v3-qa7-bands.mjs` 2/2; `v3-mk7fix-bands6.mjs` 6/6 (P1, P2, P3, L1, L2, W: 561–726 grüne Pixel);
  `v3-mk7fix-bandsrate.mjs`: Zeichnen 28 Hz (≤ 30), rAF 58–60 fps. Bild `dirigent-test/qa-mk7/bands-live-fix-P1.png`.

### 3./5. Begrenzer Stufe 1 änderte den Vocoder-Pegel um −4,5 … +21,5 dB (MK7-11 M-PEGEL ± 1 dB, B.4)
- **Ursache:** Ein Bandpass 2. Ordnung mit fester Ausgleichszahl 0,91 trifft die Bandenergie nur bei Rauschen; Teiltöne
  zwischen den Bandmitten gehen viel stärker durch. Kein fester Ausgleich kann das lösen.
- **Fix (Abweichung von der Spec-Formulierung „halbiert die Filterordnung“, Ziel von B.4 erfüllt):** Stufe 1 rechnet
  **dieselben Bänder 4. Ordnung bei halber Abtastrate** (halbe Filterarbeit). Halbband-Filter: polyphasiges IIR
  (2 + 2 Allpass-Koeffizienten, elliptisch, Übergang 0,06 fs, Alias ≤ −57 dB) für E2 und Träger hinunter, für L/R hinauf.
  Bandmitten bei halber Rate enden bei 0,21 fs (nur FORMANT/CUTOFF ganz oben betroffen). Die Dämpfung je Band wird so
  angepasst, dass die Bandbreite in Hz der vollen Rate entspricht (bilineare Verengung). Der Weg mit voller Rate bekommt
  3 Samples Verzögerung (= Laufzeit der Halbband-Kette), damit die Blende keine Phasenlöcher hat. Blende jetzt je Sample
  (vorher 10-%-Stufen je Block), 60 ms Vorlauf, 30 ms Blende; das Abschalten der alten Bank erst nach dem letzten Blendblock.
  Halbraten-Koeffizienten nur aus Tabellen (keine `Math.tan`/`pow` je Block) und nur, solange Stufe 1 läuft.
- **Belege:** `v3-qa-mk7-lim2.mjs` 0 von 35 außerhalb ± 1 dB (größter Sprung −0,04 dB; vorher 17 von 35, bis +21,5 dB);
  `v3-qa-mk7-lim.mjs` 8/8 ok; `v3-qa7-pegel.mjs` (App-`mkRender`) max |Δ| 0,00 dB; `v3-rep-mk7-limchr.mjs` alle Fälle
  ≤ 0,03 dB; live `v3-qa7-lim-live.mjs` (cpuInject) −0,02 dB statt −2,86 dB; `v3-mk7fix-lvl.mjs` (24 Fälle: Rauschen/Säge,
  RESO 0/64/127, Halten, Vokale) schlechtester −0,30 dB; `v3-mk7fix-lvl2.mjs` (FORMANT ± 2 + CUTOFF ± 63, FC-MOD LFO,
  Rauschen, 48 und 44,1 kHz) M-PEGEL ≤ 0,02 dB, M-KLICK beim Umschalten = Klang der Stufe 1 selbst.
  Builder-Suite `v3-mk7-voc.mjs` 37/37 (Stufe 1 Nachbarband jetzt 13,1 dB statt 8,1; M-PEGEL Rauschen −0,03 dB).
- **CPU** (`v3-mk7-cpu.mjs`, Median aus 5): Vocoder-Spur 1,94 × VA-Stimme (≤ 2,4, unverändert), Stufe 1 1,48 × (vorher
  1,55 ×), unbenutzter Eingang −0,02 × (≤ 0,16).
- **Info:** `v3-mk7fix-lvl2.mjs` Fall „FC-MOD LFO 63, RESO 127“ bei 48 kHz: M-EINBRUCH beim Zurückschalten −4,03 dB,
  der Klang ohne Umschalten selbst −3,47 dB (LFO-Schwankung); Grenze „Klang − 0,5 dB“ um 0,06 dB verfehlt. Der alte Stand
  hatte hier −7,24 dB.

### 4. Gehaltener Formant verstummte bei SCHWELLE ≥ 1 (MK7-03)
- **Ursache:** Die Synthese rechnete `env × Gate`; ohne oder mit leiser Quelle schloss das Gate den gehaltenen Klang.
- **Fix:** Das Gate wirkt auf den Modulator (W-39). Bei HALTEN, FOLGER 127 oder gespeichertem `hold` blendet `hw` die
  Synthese in 5 ms auf „offen“; ohne Halten bleibt alles bitgleich (`hw` = 0). Die 16-BÄNDER-Pegel folgen demselben Wert.
- **Belege:** `v3-qa-mk7-hold.mjs`: gespeichertes `hold` ohne Eingang bei SCHWELLE 0/1/20/40/64/100 je +1,9 dBFS
  (vorher −240 ab SCHWELLE 1); TIMBRE/HALTEN live bei SCHWELLE 30/64 bleibt −19,7 dBFS; FOLGER 127 mit −70-dBFS-Rauschboden
  bleibt −19,7 dBFS. `v3-rep-mk7-holdgate.mjs` alle −5,2 dBFS. Chromium `v3-qa-mk7-holdbr.mjs`: Render SCHWELLE 0…64 je
  −1,8 dBFS, live Spitze −4,7 dBFS bei SCHWELLE 0 und 30; `v3-rep-mk7-holdgate-br.mjs` alle −7,7 dB.

### Regression
- `v3-mk7-voc.mjs` 37/37 (MK7-12 bitgleich gegen G-MK34 für AM Säge, Dual+FX, Split, VA), `v3-mk7-inputs.mjs` 24/24,
  `v3-mk7-ui.mjs` 102/102, `v3-qa7-bit.mjs` 7/7, `v3-qa7-live` 11/11, `v3-qa7-mic` 6/6, `v3-qa7-amp` 5/5, `v3-qa7-w30`,
  `v3-qa-mk7reg-sends.mjs` (Stumm/Entstumm wie vorher). Smoke: keine Fehler (`dirigent-test/v3-mk7fix-smoke.png`).
- Der Vocoder-Ausgang im normalen Betrieb ist um 3 Samples (62 µs) später als vor dem Fix (Verzögerungs-Ausgleich); sonst
  gleich. Synth-Programme bitgleich.
- Wackelig auch auf dem alten Stand: Leistungs-Probe „Vocoder“ in `v3-mk7-ui.mjs` meldet im Test-Browser gelegentlich
  `frames_ok: false` (alt 1 von 4, neu 1 von 4 Läufen). `v3-qa7-pegel.mjs` lieferte einmal einen stillen Render (+288 dB);
  in 3 Wiederholungen und 36 weiteren Renders nicht wieder aufgetreten.
- Unverändert offen (QA-Skripte, schon vor dem Fix gleich, nicht Teil dieses Auftrags): `v3-qa7-dsp1/sep` k±3 = 29,9–30,0 dB,
  `v3-qa7-dsp2` FOLGER 0 / FOLGER 127 / K-PEGEL 0 mit strengerer Messung, `v3-qa7-dsp4` Stufe-1-M-KLICK +6,3 dB (alt +6,4),
  `v3-qa7-vowel` F1/F2 9,3 %.

### Budget
- **MK7-14 Budget überschritten:** 2 931 675 B = **+56 933 B** gegen G-MK34 (≤ +52 KB = 53 248 B; vor dem Fix +52 929 B).
  Die +4,0 KB sind Halbband-Weg, Band-Hilfsfunktion und das Tor für stumme Spuren. Kommentare sind schon gekürzt; weiteres
  Sparen ginge nur über Minifizieren. Entscheidung beim Orchestrator (Datei-Grenze 5,0 MB weit entfernt).

### Für den Hauptstrang / Zusammenführen
- Berührt: Worklet `MK_VXF`-Zeile, neue Helfer vor `class MkVoc` (`MK_VHB`, `MK_VH`, `MK_VD`, `mkVgH`, `mkAp`, `mkHbDown`,
  `mkHbUp`, `mkB4`), `MkVoc` (Konstruktor, `settle`, `block`, `bands`), MKW ohne `vocC2`; Hauptteil `mkInRoute`/`mkInLink`/
  neues `mkInMute`, `setMute`; `sq-mk-src` `paintEin`.
- Nichts aus MK4 oder früher geändert.
- iPhone offen (Pages): Stufe 1 am Gerät hören (Vocoder-Akkord, viele Spuren bis LIM 1), Stummschalten einer Vocoder-Spur
  mit Mikrofon.
