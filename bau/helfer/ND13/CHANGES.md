# ND1 + ND3 — Drum-Modell-Engine „North“ (Helfer-Sitzung, Zweig `helfer-nd13`)

Basis: `bau/werkzeug/vs-base-B.html` (App 4.23.0). Ergebnis: `bau/helfer/ND13/index.html` (VERSION-Zeile unverändert).
Spezifikation: `spec/dirigent-spec-v3-nachtrag-6-drum.md` (ND1, ND3). ND2 (Editor) und ND4 (Einbindung) baut ein anderer Helfer.

## Was neu ist

**ND1 – Engine-Kern (Worklet `synq-md`)**
- Eigener AudioWorklet-Prozessor `'synq-md'` (ASCII, eigenes `<script type="text/plain" id="sq-md-src">`), 1 Stereo-Ausgang, kein Eingang,
  ein Knoten je Drum-Spur, bis 12 Kanäle (Pads mit Quelle `md`), je Kanal 2 Stimmplätze (Neuanschlag blendet die alte Stimme in 3 ms aus).
- TONE mit allen 34 Modellen (A1–A6, t1–t2, F1–F4, H1–H6, d1–d7, P1–P4, C1–C3, r1–r2) nach §1.4; NOISE mit 7 Filtern (§1.7);
  CLICK mit 12 Tabellen (§1.8); Abklingformen E1 E2 E3 L P G und Dynamic Decay (§1.5); BEND/TIME, PITCH (§1.6);
  Pegel/Pan/EQ/DIST (dr SA rn)/RVB/DLY je Kanal (§1.9); Kit-Hall (9 Typen, COLOR) und Echo je Kanal (RATE bzw. BPM-Strecke 471 Stellungen,
  FEEDBACK) (§1.10); Dynamik-Kurven Li–O2, Akzent, Locks TUNE/DECAY (§1.11); Mono-Gruppe sample-genau (§1.12). Alle Skalen exakt nach §1.2,
  Stufen-Tabellen VERH/VERST nach §1.15.
- Nachrichten genau nach ND1 Punkt 2: `ch`, `kit`, `hit` (Liste mit `at` in Kontextzeit), `mute` (SOLO PART), `stop`, `panic`, `reset`;
  zurück `{t:'load', v}` einmal je Sekunde und `{t:'late', n}`. Zusätzlich (siehe „Für das Zusammenführen“): `{t:'lim', s}` (CPU-Begrenzer-Stufe),
  `{t:'test', tap|q}` (Test-API) und `processorOptions.init` (erste Nachrichten für Offline-Render).
- Glätten τ 10 ms (Pegel, Pan, EQ mit Koeffizienten-Interpolation über 16 Samples, Dist-Menge, Anteile), Echozeit gleitet in 50 ms,
  Halltyp-Wechsel: Parameter gleiten, frühe Reflexionen 40-ms-Blende, Hallgröße je Sample gerampt (keine Stufen).
- Schutz: Denormal-Grenzen, NaN/Inf-Prüfung je Kanal und Block (Kanal stumm + neu) und am Ausgang; Meldung `{t:'err'}` (Hauptthread → `logErr`).
- Schlafen: Kanal ohne Stimme und ohne Echo wird übersprungen, Hall schläft nach 0,5 s Stille; ohne Aktivität schreibt `process()` nur Nullen.
- CPU-Begrenzer: Stufe ≥ 1 → Modalmodelle ≤ 24 Moden (H ≤ 16), Stufe ≥ 2 → ≤ 12 Moden und keine frühen Reflexionen; gespeicherte Werte unberührt.
- Hauptthread `MDX` (Block `/* ND1 */` nach SynthHost): `MD_NAME = 'North'` (einzige Schreibung des Namens), Konstanten/Listen/Bereiche,
  `MDX.INIT` (= INIT SOUND), `MDX.KIT0`, `MDX.norm/normKit` (Klemmen nach §1-Bereichen), Skalen, `MDX.scl` (SCL PRE, nicht gespeichert),
  `MDX.tap` (TAP → BPM-Stellung), Lader `MDX.load(ctx)` (erst bei Bedarf), `MDX.node(ctx, dest)`, `MDX.render(o)` (offline), `MDX.info()`.
- Haken (je eine Zeile): `cpuLoad()` zählt die Engine-Last; `applyLimiter()` schickt die Stufe; `engineInfo().md`; Test-API
  `SYNQUENZER.mdInfo() / mdRender(o) / mdTest(msg)` (in `NO_SYNC`).

**ND3 – Startklänge und Kits (keine Gerätedaten)**
- 45 eigene Programme in 9 Kategorien (bd Sn to HH Cy Pc Be Tu Ef), Werte aus der ND3-Tabelle, wo nötig per Messung nachgestimmt (Liste unten),
  CH LEVEL je Programm gemessen (`src/md-levels.json`). Schreibgeschützte Liste `MDX.progs`, `MDX.prog(name)`.
- Pad-Start nach Rolle: `MDX.roleProg(slotId)` (KICK → Rund … SHAKER → Shaker, ND3 Punkt 2).
- 4 Kits (`MDX.kits`): Fell & Holz (Hall r2, RVB 6–12), Modell-Analog (Hall p2), Gestimmt (Hall hA, Toms Marimba 57/64/65), Schräg (Echo BPM ⅛).

## Abnahme-Tabelle

Messung: Node-Shim des Worklets (`tests/md1-node.mjs`, 48 und 44,1 kHz, Messverfahren Anhang M), Chromium-Worklet (`tests/md1-chromium.mjs`),
CPU (`tests/md1-cpu.mjs`, Renderzeit im Chromium-OfflineAudioContext), ND3 (`tests/md3-kits.mjs`). Ergebnis-Zeilen siehe unten.

| Punkt | Ergebnis | Messwerte (48 kHz; 44,1 kHz gleich, wo nicht genannt) |
|---|---|---|
| ND1-01 Signalweg | ✓ | Summe der Teile M-NULL −147 dB; SOLO PART tone: Rest −∞ dBFS |
| ND1-02 Pitch | ✓ | 69.0 → 440,000 Hz (0,00 Cent); 69.1 → +10,00 Cent; 33.0 → 55,000 Hz; 127.5 klingt, kein NaN |
| ND1-03 Bend | ✓ | +26 → Anfangsversatz 1298 Cent (erste Halbwelle gegen Modell); −26 → −1298; v 0,3 → 662 (×0,51); +50 → 4803; bei 1,05·T(30) 0 Cent |
| ND1-04 Abklingen | ✓ 13/13 | E1 19,1 / 200,0 / 2091 ms; L −60 dB bei 200,1 ms, R² 0,9987; E2 −60 bei 437, −20 bei 91 ms; E3 −60 bei 437, −20 bei 49 ms; NOISE G ±0,45 dB, danach −587 dB; d2/P1/t1 Grundton-T60 ±1 % |
| ND1-05 Dynamic Decay | ✓ 6/6 | DECAY 12/MODE 38: v 1 → 26, v 0,01 → 1472, v 0,5 → 201 ms (umgekehrt ebenso) |
| ND1-06 Punch | ✓ | v 1: +4,6 dB (0–5 ms), T60 gleich ±5 %; v 0,2: +1,1 dB |
| ND1-07 Noise-Filter | ✓ 21/21 | Flanken L1 10,8 · L2 22,7 · b1 4,7 · b2 10,5 · H1 10,6 · H2 22,4 dB/Okt (1–2 Okt.); fc ±5 % bei n 10/25/40; H3 −3,01 dB; RES 20 +20,3 dB; RES 0 +0,00 dB |
| ND1-08 Dyn Filter | ✓ | DF +5 bei FREQ 15 = M-SP von FREQ 38 (±1); DF −5 bei 38 = FREQ 15; DF 0 v 0,3 = v 1; A3 DF 9: +3,9 Okt |
| ND1-09 Moden | ✓ 24/24 | d1–d7, P1–P4, H1–H6, C2 alle Spitzen ±0,3 %; d SPECTRA 33 → Fell = Körper (0,01 Cent); SPECTRA 66 → ×2,0000, Körper bleibt |
| ND1-10 Resonanz-Mitte | **✗ 3/5** | C1 Spearman 1,00 ✓; P1 SPECTRA 24: +12 dB/T60 ×1,46 ✓; **H1 0,41 / P1 0,61 ✗ – Spec-Widerspruch (Frage Q1)** |
| ND1-11 FM | ✓ 6/6 | Spitzen 200/600/1000 Hz, 400/800 < −120 dB; FREQ 0 Seitenbänder −149 dB; Index 0,4/2,5/10 Bessel ±0,05 dB; Bend +12 HT: Verhältnisse bleiben |
| ND1-12 Analog | ✓ | Spiegelfrequenzen −80 dB (A3 2,09 kHz, minBLEP); FREQ 0 2. Teilton −15,4 dB; A2 +7 HT ×1,4983; A6 Pulsbreite 5 % |
| ND1-13 T-Brücke | ✓ | t1 2. Teilton −47 … −23 dB steigend; t2 −106 / −0,04 / −106 dB |
| ND1-14 Ringmod | ✓ | r1 150,0 / 750,0 Hz, 300 Hz −121 dB; FREQ 0 nur 300 Hz |
| ND1-15 Becken | ✓ | C2 Grundfrequenzen exakt; SPECTRA 75/50 ×1,4142; Harmonizität C1 0,03, C3 0,06 |
| ND1-16 Click | ✓ 15/15 | 12 Längen ±3 %, P-Spitze im 1. Sample, Polarität = TONE (A1, d2, t1) |
| ND1-17 Pegel/Pan | ✓ | TONE/CH LEVEL 25: −12,04 dB; NOISE = TONE 0,5 dB; L9 rechts −∞; C 0,000 dB; Pan-Gesetz = Synth-Worklet (0,000 dB) |
| ND1-18 EQ | ✓ | ±24,0 dB bei fE(n) ±1 %; GAIN 0 bitgleich |
| ND1-19 Dist | ✓ | dr Klirr 0 → 42 % steigend, Pegel −1,0 … +1,7 dB; SA 25 → 4386 Hz; rn 25 → ±70,71 Hz |
| ND1-20 Anteile | ✓ | RVB/DLY 25 → −6,021 dB; 50 → −∞ |
| ND1-21 Echo | ✓ 12/12 | RATE 0/50/99 → 1149,98 / 104,69 / 9,98 ms; FB 0 → 1 Echo; FB 20 → −0,265 dB; BPM-Strecke exakt; L9 → rechts −∞ |
| ND1-22 Hall | ✓ 14/14 | RT60 alle Typen ±10 %; COLOR −9/−4,5/+4,5/+9 → 1503/5476/171/1500 Hz; 0 umgangen |
| ND1-23 Knackfrei | ✓ 13/13 (beide Raten) | Wirbel 1/64 4,3 dB; Mono-Gruppe −∞ nach 4 ms; 7 Regler-Fahrten ≤ 1,1 dB; Echo-RATE-Fahrt 2,1 dB (FEEDBACK 0, siehe Abw. 12); Halltyp, Programmwechsel, Panik −∞ |
| ND1-24 Dynamik-Kurven | ✓ 7/7 | Li −6,02; L1 −5,72; L2 −3,60; L3 −2,45; O1 −2,62; O2 −1,21 dB; Klangziel unabhängig |
| ND1-25 Akzent/Locks | ✓ | Akzent 0,5 → +3,67 dB; TUNE +12 → 1200,00 Cent; DECAY ×2 → ×2,00 |
| ND1-26 Bitgleich | ✓ | Node-Shim und Chromium-Offline je zwei Render bitgleich (44,1 + 48 kHz); Chromium gegen Node-Shim M-NULL −163 dB |
| ND1-27 Robust | **✗ teilweise** | 1 min Flug, 12 Kanäle: NaN 0, late 0; Gleichanteil 0,004 (48 kHz) ✓ / **0,0057 (44,1 kHz) > 0,005** (Frage Q8); **Spitze +20 dBFS > +12** (Frage Q2). `--long` = 10 min |
| ND1-28 CPU | **✗ teilweise** | siehe CPU-Tabelle; Leerlauf 0,07 % ✓; Modul-Laden 6,5–10 ms ✓; kein GC im Node-Shim (Felder vorab), Chromium-GC nicht messbar |
| ND1-29 ASCII/Marke | ✓ | Worklet ASCII, kein Markenwort in den neuen Blöcken |
| ND1-30 Gerätetest | offen | Xander (iPhone) nach ND4 |
| ND3-01 Anzahl/Namen | ✓ | 45 Programme, 9 × 5, 4 Kits, alle Pads `md`, kein Gerätename |
| ND3-02 Charakter | ✓ 37/37 | bd Grundton 43–58 Hz, Klick-Band ≥ −15 dB, M-AUS 50–230 ms; Sn Körper 185–222 Hz, Rauschen/Ton −6 … +6; Toms Bend 2,6–3,6 HT, T60 300–900, 500 Cent Abstand; HH M-SP ≥ 9 kHz, Zu schließt Offen; Cy T60/M-SP; Pc/Tu PITCH ±1 Cent; Be ≥ 2 unharmonische Spitzen; Ef |
| ND3-03 Pegel | ✓ | Kick −5,9 … −7,0; Snare −1 … −5; Hats −9 … −14; Toms ±1 dB; Kits −18 ± 3 LUFS (trocken) |
| ND3-04 NaN/DC/CPU | ✓ / CPU siehe Tabelle | Kits: kein NaN, DC ≤ 0,004 |
| ND3-05 Rolle | ✓ | alle 12 Slots → Programm laut Liste |
| ND3-06 Hörprobe | offen | Xander: `node tests/md3-kits.mjs --wav=DIR` |

Nachprüfungs-Fehler: `tests/md1-retest.mjs` 18/18 (48 kHz, mit Chromium) und 17/17 (44,1 kHz). Gesamt ND1-Suite: 188/191 bei 48 und bei 44,1 kHz.

**CPU** (`tests/md1-cpu.mjs`, Renderzeit Chromium-OfflineAudioContext auf dieser VM, je Stimme; Bezug auf derselben Maschine: VA-Stimme der App 0,63 %,
FM-Stimme 0,42 %):

| Teil | gemessen | Rahmen [A] |
|---|---|---|
| A3 / A2 / A6 | 0,17 / 0,23 / 0,17 % | 0,15 % |
| t1 / t2 | 0,12 / 0,12 % ✓ | 0,15 % |
| r1 / r2, P4 | 0,22 / 0,16, 0,17 % | 0,15 % |
| F1 / F2 / F4 | 0,22 / 0,21 / 0,20 % | 0,15 % |
| F3, C2, C3 | 0,27, 0,37, 0,46 % | 0,25 % |
| d6 (16 Moden), d5 | 0,39, 0,40 % | 0,25 % |
| H1 (32 Moden) | 0,48 % | 0,35 % |
| C1 (48 Moden) | 0,72 % | 0,50 % |
| NOISE 24 dB | 0,35 % | 0,10 % |
| Kanal-Effekte (dr + EQ + Echo) | 0,35 % je Kanal | 0,10 % |
| Hall | 1,07 % | 1,0 % |
| schlimmster Fall (12 × C1 + NOISE + Dist + Echo + Hall, 16tel) | 13,6 % (Begrenzer Stufe 1: 11,8 %, Stufe 2: 10,3 %) | 8 % |
| typischer Groove (Kit Fell & Holz) | im Echtzeit-Test nicht verlässlich messbar (Worklet hat hier nur `Date.now`) | 3 % |


## Abweichungen (bewusst, mit Grund)

1. **Modal-Abklingen (§1.4 „für E1: T_M = 4·T, Hüllkurve 4T/3“):** gebaut ist für E1/P/Dynamic **T_M = T ohne Ausgangshüllkurve** und nur für
   E2/E3/L `T_M = 4·T` mit Ausgleich. Grund: Mit der Spec-Formel kann ND1-10 („P1 SPECTRA 24: T60 ×1,5“) nicht erfüllt werden (gemessen nur ×1,09);
   ND1-04 (Grundton-T60 = T) gilt in beiden Fällen. Hörbar: hohe Moden klingen relativ zum Grundton etwas kürzer.
2. **Antialiasing A-Familie:** PolyBLEP (§1.4) erreichte bei 2,09 kHz nur −34 dB Spiegelfrequenzen (ND1-12 verlangt ≤ −45 dB). Gebaut:
   minBLEP (minimalphasiger bandbegrenzter Sprung, 16 Nulldurchgänge, Tabelle vorberechnet in `src/minblep-gen.mjs`) → −80 dB. C2/C3/r2 nutzen weiter PolyBLEP.
3. **Oszillatoren über 0,45·fs:** PITCH + TUNE + BEND können > 20 kHz verlangen; die Oszillator-Frequenz wird auf 0,45·fs begrenzt (sonst NaN/
   Überlauf im Parameterflug). Das Dreieck (integriertes Rechteck) wird auf ±1,2 begrenzt (driftet nahe Nyquist).
4. **t1/t2 Sättigung:** „Antrieb 1 + 2·F/50, Pegel normiert“ — der Antrieb wirkt auf den Resonator mit Innenpegel 0,9 (`tanh(0,9·d·y)/tanh(0,9·d)`),
   damit ND1-13 (FREQ 0 ≤ −30 dB, FREQ 50 ≥ −20 dB) erreicht wird. „2. Teilton“ = stärkster Teilton über dem Grundton (tanh ist symmetrisch → 3. Harmonische).
   Anregungs-Impulsbreite höchstens 0,45 Periode (sonst Auslöschung bei Breite = Periode).
5. **Modal-Pegel:** Normierung über die Tabellen-Amplituden (Σa² ohne Schlägel-Härte und Resonator-Gewicht): FREQ/Resonanz-Mitte ändern Klang **und**
   Pegel (weicher Schlägel = leiser, Formant +18 dB bei H). d3 „0,85 schwach“: −12 dB, T60 0,15·T_M [A]. d7 Slap-Pegel ∝ F_eff/50 [A].
   Körper-Mode T60-Faktor bezogen auf T_M.
6. **C1** startet mit festen Phasen (Spec) und daher nicht bei 0 → 0,5-ms-Einblendung wie bei A (sonst Knack). Click-Polarität bei C1 = Vorzeichen der Startsumme.
7. **CLICK P1–P3:** „Spitze im ersten Sample“ und „0,1-ms-Flanken“ widersprechen sich → Anstieg sofort (Spitze im 1. Sample), Abfall 0,1 ms Kosinus.
   n3/n1 linearer Ausklang, C-Chirps 0,25 ms Ausblendung, H1–H3 Längen 1–3 ms ([A]).
8. **F2 Rückkopplung β = 0,6:** Einheit nicht angegeben → 0,6 Perioden-Anteil (×2π rad) auf das Mittel der letzten zwei Modulator-Werte.
9. **dr-Verzerrung:** ADAA auf der rationalen tanh-Näherung (ein `log` je Sample statt `exp`+`log1p`, CPU) und 5-Hz-Gleichanteil-Filter nach dem
   Vorspannungs-Term (sonst Gleichanteil, ND1-27). Unter DIST 1 wird zwischen trocken und verzerrt überblendet (0 = bitgleich umgangen).
10. **Akzent/Dynamik-Kurve** wirken je Stimme vor DIST (die Spec sagt „nach CH LEVEL“; ein Kanal-DIST ist nicht je Schlag teilbar). Ohne DIST identisch.
11. **NOISE 2. Stufe** (L2/H2/b2) Q 0,7071 ohne Resonanz; b1/b2 normierte Bandpässe (Spitze 0 dB).
12. **Echo/Stop:** `stop` verwirft geplante Schläge ab `at` (sonst klängen nach ■ noch vorausgeschickte Schläge); Schläge davor (auch im selben
    128er-Block) klingen mit τ aus; nach ≈ 6τ beendet eine 2-ms-Blende die Stimme (wie die Drum-Stimme, ≤ 200 ms bei τ 0,02/0,03).
    `panic` verwirft ebenfalls die geplanten Schläge. Echozeit im Ruhezustand auf ganze Samples gerundet (≤ 0,5 Sample = 10 µs) → die Rückkopplung
    filtert nicht (§1.10 „ohne Klangfilter“); nur während des 50-ms-Gleitens wird zwischen Samples gelesen. Echo-Zeitwechsel gleitet (50 ms) —
    bei FEEDBACK > 0 entsteht beim Durchdrehen der Zeit ein Flanger-artiges Gleiten (Absicht des Gleitens, kein Knack).
13. **Hall:** Dattorro-Tank als eigene Instanz; Lowcut im Tank 40 Hz, Mod 0,5 (hA 0,6); frühe Reflexionen als feste Abgriffe [A]
    (stark/hell 8, mittel 6, spärlich 4 Abgriffe). Vorverzögerung gleitet ≤ 0,1 Sample je Sample; Größe je Sample gerampt.
14. **Offline-Render:** `MDX.render` gibt die ersten Nachrichten als `processorOptions.init` mit (im OfflineAudioContext kamen Port-Nachrichten teils erst
    nach Renderbeginn an → verspätete Schläge) und schickt je Suspend-Punkt genau **eine** Nachricht (mehrere als `{t:'all', list}`; Chromium wendete
    von mehreren gleichzeitig nur die erste an). Echtzeit nutzt wie spezifiziert den Port.
15. **Größe:** Worklet-Quelle in der App ≈ 70 KB (Budget 45 KB): minBLEP-Tabelle (2,8 KB), vorab angelegte Felder (V8: keine Zahlen-Boxen je Block).
    ND1 + ND3 zusammen +97 KB → mit ND2 (+30) und ND4 (+10) wird ND4-01 „Seitengröße +≤ 100 KB“ überschritten (≈ +137 KB). Frage Q9.
16. **ND3 nachgestimmt** (Spec: „Startwerte, nachstimmen per Messung“): Rund TONE LVL 46; Brücke TONE LVL 44; Fellkick SPC 36, DEC 28 E1, NOISE LVL 12; FM-Druck DEC 34; Verzerrt TONE LVL 50, DIST 20; Klassisch TONE LVL 46, NOISE LVL 31; Gated DEC 22 E1, TONE LVL 50, NOISE LVL 13;
    FM-Snare TONE LVL 50, NOISE LVL 28; Rausch-Klatsch RES 3, NOISE LVL 50, CLICK 38; Rausch-Hat NOISE LVL 50; Ride P 72.0 SPC 76; Splash DEC 35;
    Gong-Becken FREQ 50, P 62.0; Kristall SPC 45; Doppelglocke SPC 37 (×1,618, sonst rein harmonisch → ND3-02 „≥ 2 unharmonische Spitzen“ unerfüllbar).
    CH LEVEL je Programm gemessen; Kategorien ohne Pegelziel (to Cy Pc Be Tu Ef) auf Spitze −9 dBFS [A]; Kit-Pegel-Trimm Fell & Holz +2,5 dB,
    Gestimmt −4,5 dB [A] (Groove-Lautheit −18 LUFS). Groove-Muster für M-LUFS/CPU selbst gewählt [A] (Spec nennt keins).
17. **Messverfahren** (wo die Spec-Fenster physikalisch nicht reichen, im Test begründet): Bend-Start aus der ersten Halbwelle gegen das Modell
    (3-ms-Fenster < Halbperiode bei 52 Hz); E2/E3 −20-dB-Punkt gegen den Anfangspegel der Hüllkurve (Spitze liegt bei √-Form schon −2 dB tiefer);
    M-MODEN mit 1,36-s-Fenster für kurze Moden; M-AUS mit Hilbert-Hüllkurve (5-ms-RMS-Fenster < Periode eines 50-Hz-Tons); M-BAND mit Rechteckfenster
    ab dem Anschlag; M-KLICK mit Hochpass 24 dB/Okt bei 5 kHz, tonalen Testklängen (sonst wertet Rauschen/Periodik als Knack) und einem Boden: 2-ms-Fenster unter −80 dBFS
    (nach dem Hochpass) zählen nicht (bei 44,1 kHz meldete ein Fenster bei −99 dBFS sonst +9 dB über dem Median).
18. **Neuanschlag/Mono-Gruppe:** die 3-ms-Ausblendung der alten Stimme ist kosinusförmig (statt linear), gleiche Dauer. Bekannte Grenze (2 Stimmplätze
    laut Spec): kommen 3 Schläge auf einen Kanal innerhalb von 3 ms (Flam-Sonderfall), wird die noch ausblendende Stimme hart übernommen.
19. **DIST TYPE** während ein Kanal klingt: die Menge gleitet mit dem alten Typ auf 0, dann wird umgeschaltet und wieder aufgeblendet (kein Sprung).
20. **Schlafen/Schutz:** Echo hält den Kanal wach, solange etwas über −100 dBFS geschrieben wurde; Hall schläft 0,5 s nach −100 dBFS; die NaN-Wache prüft
    jedes Sample (Kanal und Ausgang) und meldet höchstens einmal je 5 s.

## Nachprüfung (unabhängig, zweite Sitzung) und Korrekturen

Eine unabhängige Nachprüfung (eigene Messungen, Chromium + Node) bestätigte die meisten Punkte und fand 9 Fehler; behoben und als Dauer-Test
`tests/md1-retest.mjs` abgesichert (48 kHz 18/18, 44,1 kHz 17/17):
- **Säge (A3) hatte Gleichanteil** (minBLEP-Rest nur bei Aufwärtssprüngen; bis −0,17 bei PITCH 96) → Ausgleich über das Integral des Rests: jetzt ≤ 5·10⁻⁴.
- **Echo-Rückkopplung filterte** (lineare Interpolation, 10 kHz −21 dB nach 10 Wiederholungen) → ganze Samples im Ruhezustand: −0,265 dB je Wiederholung, 10 kHz ±0 dB.
- **Click-Pegel** war v² und folgte der Dynamik-Kurve → jetzt G(LEVEL)·v (§1.8/§1.11), mit Akzent.
- **Stopp** erfasste Schläge im selben 128er-Block nicht; **Stimmen lebten nach ■ bis 230/350 ms** → beides behoben (≤ 123/184 ms).
- **`MDX.render`** verlor eine von zwei gleichzeitigen Nachrichten → eine Nachricht je Suspend-Punkt.
- **Rausch-Hat** hatte ohne Tabellen-Grundlage die Mono-Gruppe → entfernt.
- Plausible Punkte ebenfalls umgesetzt: Schlaf-Schwellen −100 dBFS, NaN-Wache über jedes Sample mit 5-s-Meldegrenze, DIST-Typwechsel ohne Sprung.
- Bleibt als Frage (nicht geändert, Regel 27): Modal-Abklingen E1 (Abweichung 1), F2-Rückkopplungseinheit (Abweichung 8), 3-Schläge-in-3-ms (Abweichung 18).
- Hinweis zur Messung: der Node-Shim gab dem Prozessor das `Math` des Host-Realms; das täuscht Zahlen-Boxen vor → Shim nutzt jetzt das eigene `Math`.

### Zweite Runde: Verifikation mit 26 unabhängigen Prüfern (Gegenprobe je Befund)

Je Korrektur ein Skeptiker, dazu drei frische Fehlersuchen (Spec-Treue der Modelle, Echtzeit/Knackfreiheit, Schnittstelle für ND4); jeder Befund
wurde von einem weiteren Prüfer nachgemessen (18 bestätigt, 1 widerlegt). Alle 18 behoben, Dauer-Tests in `tests/md1-retest.mjs` (R11–R24):
- Säge-DC: Konstante mit Trapezregel (blepAdd interpoliert linear) → |DC| ≤ 4·10⁻⁵ bis PITCH 127.5.
- Stummer TONE (TONE LVL 0 / SOLO PART) lief ohne Phasenumbruch → beim Hörbarwerden Spitzen bis +93 dBFS. Jetzt läuft der Ton immer mit.
- TONE/NOISE-Pegel und SOLO-Masken glitten in 16-Sample-Stufen (M-KLICK 9–11 dB) → durchgehende Rampen (0,1 dB).
- Positives BEND warf Moden über 0,45·fs für den ganzen Schlag weg → Moden bleiben, rotieren während des Biegens höchstens mit 0,45·fs.
- DIST-Typwechsel auf `rn` brach kurz ein → `rn` startet bei Phase ¼ (y = x bei kleiner Menge); schlafende Kanäle übernehmen Pegel/Pan/EQ/DIST
  (auch den Typ) beim nächsten Schlag sofort statt aus alten Werten zu gleiten.
- Echo: Zeitwechsel im Leerlauf ließ den nächsten ersten Echo gleiten (36 statt 10 ms) → im Leerlauf rastet die Zeit sofort ein; DLY 0 fror eine
  klingende Leitung ein, die später wiederkam → bei DLY 0 wird die Leitung geleert. FEEDBACK gleitet (τ 10 ms), COLOR gleitet (τ 30 ms; Tief- und
  Hochpass laufen immer mit und werden über ihr Gewicht eingeblendet, bei 0 bitgleich umgangen); frühe Reflexionen blenden beim CPU-Begrenzer 40 ms.
- `control()` gab Zahlen aus nicht eingebetteten Hilfsfunktionen zurück (V8-Boxen → GC) → Ergebnisse über ein Float64-Feld; `tests/md1-gc.mjs`:
  60 s Render ohne GC-Ereignis, Heap +0,3 MB.
- Warteschlange 512 → 4096 Schläge, Überlauf wird gemeldet; `MDX.render` schickt lange Muster in 1-s-Paketen (8 Takte × 6 Pads: 128/128 Schritte);
  Nachrichten mitten in einem Render-Quantum kommen sampelgenau (vorher bis 64 Samples spät); `E.test` ordnet Antworten über eine ID zu (nie hängend);
  Knoten eines OfflineAudioContext bekommen keine Begrenzer-Stufe und zählen nicht in `cpuLoad()` (ND1 Punkt 7, ND4-10).
- Widerlegt: „Knoten geschlossener Kontexte bleiben in `MDX.nodes`“ (dispose räumt auf; ND4 muss bei neuem Kontext `dispose()` rufen).
- Offen/niedrig (dokumentiert, nicht geändert): sehr schnelles Drehen der Echozeit zu **längeren** Zeiten auf klingender Fahne kann knacksen
  (Lesezeiger ändert die Richtung; die Spec prüft nur 0 → 99, das ist sauber); 3 Schläge in 3 ms (Abweichung 18).

## Fragen an Xander

- **Q1 (ND1-10, Spec-Widerspruch):** H1–H6 „Resonanz-Mitte“ `fc = f0·2^(8·S/99)` reicht bis 256·f0, die Modelle haben aber nur 32 Teiltöne (bis 32·f0).
  Ab SPECTRA ≈ 62 liegt der Formant über allen Teiltönen und der Klang wird wieder dunkler → M-SP steigt nicht streng (Spearman 0,41).
  Vorschlag: `fc = f0·2^(5·S/99)` (bleibt im Teiltonbereich). Ebenso P1–P4: schmaler Resonator (σ 0,08 Okt) zwischen wenigen Moden → M-SP
  ändert sich nur, wenn er eine Mode trifft (Spearman 0,61). Vorschlag: Prüfkriterium für P ändern oder Resonator breiter. Nicht geändert (Regel 27).
- **Q2 (ND1-27 Spitze ≤ +12 dBFS):** Mit EQ +24 dB, Formant +18 dB (H), phasengleichen Teiltönen und 12 Kanälen auf vollem Pegel erreicht der
  Zufallsflug +20 dBFS vor dem Master-Limiter (ohne NaN, Gleichanteil ≤ 0,005). Soll die Engine einen eigenen Pegelschutz bekommen, oder gilt der Master-Limiter?
- **Q3 (CPU-Rahmen [A]):** Gemessen (Xeon, Chromium-Offline) liegen mehrere Modelle über dem angenommenen Rahmen je Stimme (Tabelle oben),
  schlimmster Fall ≈ 13 % statt 8 %. Weitere Senkung ginge nur mit weniger Moden/Qualität (z. B. C1 24 statt 48 Teiltöne ohne Begrenzer).
  Gerätetest auf dem iPhone entscheidet (ND1-30). Soll ich die Moden-Grenzen enger setzen?
- **Q4 (Datenfelder, wichtig für ND4):** Die Spec-Felder `mDec` (TONE DECAY) und `mLvl` (CH LEVEL) heißen genauso wie bestehende Felder der
  Drum-Stimme (Metall-Decay `mDec` in Sekunden, Metall-Pegel `mLvl` der Slots HH ZU, HH OFFEN **und BECKEN** in `DrumKits`; in den Werks-Kits
  13 Slots, auch der DECAY-Lock `Q.mDec *= lk.dec` liest es). `MDX.norm` auf einen Drum-Slot angewandt würde diese Werte zerstören. Flach im selben Slot gespeichert überschreiben sie sich.
  Die Engine nimmt im `ch`-Programm genau die Spec-Namen; die Ablage im Slot (z. B. eigener Unterschlüssel) muss ND4/der Dirigent entscheiden.
- **Q8 (ND1-27 Gleichanteil):** Im 1-min-Zufallsflug liegt der Gleichanteil bei 48 kHz bei 0,003–0,004, bei 44,1 kHz bei 0,005–0,006 (Grenze 0,005).
  Ursache sind die laut §1.8 einseitigen Rechteck-Clicks P1–P3 (immer positive Fläche) bei 16tel-Schlägen auf 12 Kanälen. Ein Hochpass 3 Hz am Ausgang
  wurde probiert und wieder entfernt (verschiebt tiefe Phasen, langer leiser Nachlauf). Soll die Engine einen Gleichanteil-Filter bekommen (z. B. nur
  im Click-Weg), oder gilt der Gleichanteil-Schutz des Master-Busses?
- **Q9 (Seitengröße):** ND4-01 erlaubt +100 KB für den ganzen Nachtrag; ND1+ND3 brauchen allein ≈ +97 KB. Budget erhöhen oder soll ich die
  Worklet-Quelle verdichten (Bezeichner kürzen/minifizieren; die kommentierte Quelle bleibt im Repo)?
- **Q6 (Abweichung 1):** Modal-Abklingen bei E1 wie gebaut (Moden mit T, ohne Hüllkurve – erfüllt ND1-10 „T60 ×1,5“) oder wie in §1.4 (T_M = 4T,
  Hüllkurve 4T/3 – dann ist ND1-10b nicht erfüllbar und hohe Moden klingen länger)?
- **Q7 (Abweichung 8):** F2 „Selbst-Rückkopplung β = 0,6“ – in Perioden (gebaut, sehr rau) oder in Radiant (deutlich zahmer)?
- **Q5:** Die Basis-App enthält schon vor diesem Paket das Markenwort (Hilfe-/Tipp-Texte „… Drum / Waldorf Attack“ bei Zeilen ~13994, 14384, 14421,
  15382, 15765, 16468 der Basis) und `nOrd` in Bezeichnern → `grep -i 'nord'` ist in der App nicht 0. Nicht angefasst (nicht mein Paket); entfernen?

## Für das Zusammenführen

- Blöcke: `<script type="text/plain" id="sq-md-src">` direkt nach dem Synth-Worklet-Skript; `<script>` mit `/* ND1 */` (MDX) + `/* ND3 */`
  (Programme/Kits) direkt nach dem SynthHost-Block, Ende `/* /ND1 /ND3 */`. Quelle: `src/md-worklet.js`, `src/md-host.js`, `src/md-progs.js`,
  `src/md-levels.json`; `node src/build.mjs` baut `index.html` aus der Basis neu (idempotent, prüft ASCII, Marke, Skript-Ende).
- Haken (je 1 Zeile, alle mit `ND1` markiert): `cpuLoad()` (+ `MDX.cpu()`), `applyLimiter()` (+ `MDX.setLim(LIM.level)`), `engineInfo()` (+ `md`),
  `SYNQUENZER` (+ `mdInfo`, `mdRender`, `mdTest`) und `NO_SYNC` (+ diese drei).
- **`MD_NAME` ist hier definiert** (genau einmal). ND2/ND4 dürfen es nicht noch einmal definieren.
- **Für ND4:** `await MDX.load(AU.ctx)` erst, wenn ein Pad `md` wird oder ein geladenes Projekt eins hat; dann `E = MDX.node(AU.ctx, <Drum-Spur-Bus>)`;
  je Modell-Pad `E.ch(i, slotProgramm)` (i = Slot-Index 0–11 in `MDX.ORDER`), `E.kit(p.md)`; Schläge `E.hit([{ch, at, v, acc: accentAmt(...), tune, dec}])`
  (gebündelt je Task); ■ → `E.stop(t, tau)`, ■■/Panik → `E.panic()`; SOLO PART → `E.mute(ch, 'tone'|'noise'|'click'|'all')` bzw. `E.mute(-1, null)`.
  Neuer AudioContext → neuer `MDX.load` + `MDX.node` (je Kontext gemerkt). Ohne AudioWorklet liefert `MDX.load` `false` (Hinweis ND4 Punkt 4).
  Offline (VV1/FR1): `MDX.render({sr, sec, chans, kit, hits, msgs})` oder eigener Knoten mit `processorOptions: {init: [...]}`.
- `MDX.norm(p)` klemmt ein Kanal-Programm (für `normDrum`), `MDX.normKit(p)` die Kit-Effekte; `MDX.INIT` ist INIT SOUND (mit `src:'md'`).
- ND3 für ND2/ND4: `MDX.progs` (45, `mName`, `mCat`), `MDX.CATS`, `MDX.prog(name)`, `MDX.roleProg(slotId)`, `MDX.kits` (`slots` je Slot-ID, `md`).
- Test-API: `SYNQUENZER.mdTest({q:'modes'})` → Moden je Kanal (ND4-10), `{q:'state'}` Zähler, `{tap:1|2}` Messabgriffe, `mdRender(o)`;
  jede Antwort `{t:'test', id, ok, ...}` (null nach 2 s / bei geschlossenem Kontext).
- Live-Schläge: höchstens 4096 im Voraus (Worklet-Warteschlange); `panic` verwirft geplante Schläge; `{t:'all', list}` bündelt Nachrichten.
- Bei neuem AudioContext den alten Knoten mit `E.dispose()` abmelden (sonst zählt seine letzte Last weiter in `MDX.info()`).
- Bekannte Grenzen siehe Abweichungen 15 (Größe) und Q3 (CPU).

## Bitte prüfen (Xander)

- ND1-30 Gerätetest iPhone 12 Pro Max (nach Einbindung ND4): Kit „Schräg“ + 4 Synth-Spuren, 16 Takte, keine Aussetzer; `engineInfo().md.load`.
- ND3-06 Hörprobe: `node tests/md3-kits.mjs --wav=<Ordner>` schreibt 45 WAV (je 2 Schläge v 0,8 / 1,0).
