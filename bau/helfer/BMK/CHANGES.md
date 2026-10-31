# Bit Mask – Zweig K „Klang“ (Helfer BMK, Zweig `helfer-bmk`)

Grundlage: `bau/werkzeug/vs-base-B.html` (App 4.23.0) → `bau/helfer/BMK/index.html`, gebaut mit `werkzeug/bau.mjs` (immer neu aus der Basis).
Spec: `spec/dirigent-spec-v3-nachtrag-7-bitmask.md` Rev. 2. Regeln: `spec/typische-fehler.md`.

Quellen im Zweig: `src/bm-wk.js` (Prozessor `'synq-bm'`, wird als Text `BM_WK` in den Block `sq-bm-src` gesetzt), `src/bm-host.js`
(Test-Teil BMK-TEST), `werkzeug/bau.mjs`, `werkzeug/hb-design.mjs` + `comp-design.mjs` (Entwurf Dezimierer), Tests in `tests/`.

## Zusammenführen (für den Dirigenten)
- Der neue Block `<script type="text/plain" id="sq-bm-src">` steht vor `sq-worklet-src` – an derselben Stelle wie bei BM6 (`helfer-bmu`).
  Beim 3-Wege-Merge: BM6-Block nehmen und darin den Abschnitt **von „BM-STUB:“ bis „Ende BM-STUB“** durch den Abschnitt
  **„/* BM-KLANG (branch K) */ … /* Ende BM-KLANG */“** aus diesem Zweig ersetzen (die Konstante heißt in beiden `BM_WK`).
  Der Abschnitt BMK-TEST (`bmkModule`, `bmkRender`, `bmkProbe`) bleibt nur, wo BM6 nichts Gleiches hat (er stört nicht).
- Sonst ist `index.html` byte-gleich zur Basis (`tests/bmk-regel28.mjs` prüft das).
- Schnittstelle: der Prozessor versteht §2.1 **und** die Zusätze von BM6: `on` mit `id`, `off` mit `id`/`tau`/`kill`, `rt` (Umstimmen),
  `ctl` als Liste `{list:[{k,v,at}]}` (§2.1) **oder** als Felder `{bend, mw, pr}`, `tr` mit `bpm`, `bpm`, `lim`, `seed`, `set` mit `ab` = `a`/`b`/`gl`/`ly`.
  Meldungen: `{t:'load', v, nv, q}` (v = Anteil Echtzeit, q = längstes Quantum in ms), `{t:'late', n}`, `{t:'end', n, id}`.
- **Hinweis an BM6:** `BmHost.prog` schickt bisher `ly`, `prog a`, `prog b`, aber **kein `{t:'gl', p}`** – ohne das gelten im Prozessor
  die GLOBAL-Werte von INIT (TUNE 440, PITCH BEND 2 …). Bitte beim Zusammenführen `post({t:'gl', p: b.gl})` ergänzen.
- `on.d` (BM6 setzt dort eine Programm-Maske): ab BM4 gilt 0 = nach Layer/Split, 1 = nur A, 2 = nur B, 3 = beide.

---

## BM1 — Masken-Oszillator 16-fach, Dezimierer, Körnungs-Takt (31.10.)

**Gebaut** (alles im Prozessor `'synq-bm'`, ASCII, ohne Tabellen-Worker):
- Masken-Regel §1.2 (9 Bit, 0–511): Phase als 32-Bit-Ganzzahl je Oszillator, Sinustabelle 32 × 1024 (128 KB beim Laden des Moduls), Sonderfall
  M = 0 (Spanne 1) ohne Schiebe-Fehler.
- 2 Masken-Oszillatoren + Sample-&-Hold-Rauschen (xorshift32, Saat aus Spur-Saat und Notenzähler) in 16-facher Rate, **ein** Dezimierer je Stimme:
  CIC 5. Ordnung (R 8, Ganzzahl), Halbband-FIR (2 → 1), Ausgleich des CIC-Abfalls (3 Taps), DC-Sperre 8 Hz.
- Steuertakt 1 ms (48 bzw. 44 Samples), **gemeinsam für alle Stimmen** (Raster ab `reset` bzw. ▶) plus ein Sofort-Schritt beim Tastendruck
  (Stand BM2, siehe dort): ADSR (OSC1, OSC2, Rauschen, Filter) mit LOOP, 10-Bit-Rundung, Masken-Δ, Tonhöhen; alles stufig. A/D/R = 0 → Sprung im nächsten Schritt.
- Key-Reset (K1): freie Stimme startet bei Phase 0. Drehen an MASK (`set o1.m`): 10-ms-Blende zwischen alter und neuer Maske (Regel 12);
  Wechsel durch Modulation hart am Steuerschritt, phasenstetig.
- Bitgleichheit: feste Saaten, CIC-/Filter-Zustände genullt bei freier Stimme, `reset`; das Ende einer Stimme wird am Steuerschritt entschieden
  (unabhängig von der Blocklage).
- Keine Allokation in `process()`: heiße Zahlen der Stimme in Typed Arrays (sonst legt V8 bei großen Ganzzahlen/Kommazahlen je Speichern ein Objekt an).
- Sparen ohne Klangänderung: Oszillator 2 und Rauschen rechnen nur bei Pegel > 0 (Phase läuft trotzdem bitgenau weiter); nach dem Ausklingen läuft
  nur noch die DC-Sperre aus.

**Abweichungen von der Bauweise [A] der Spec (nur Bauweise, um die Abnahme-Werte zu treffen; Klang „wie am Gerät“ bleibt):**
1. Halbband **27 Taps** bei 48 kHz (31 bei 44,1 kHz) statt 23: mit 23 Taps erreichen Prüftöne bei 32 kHz nur −67,5 dB (BM1-06 verlangt −70 dB).
   Kosten: ein bzw. zwei Multiplikationen mehr je Ausgabe-Sample.
2. CIC-Eingang × **2^14** statt 2^13: mit 2^13 lag M-ALIAS von Maske 255 auf C4 2,1 dB über der idealen Referenz (Quantisierungsrauschen bei −95 dB);
   mit 2^14 0,7 dB. Überlauf ausgeschlossen (3 × 2^14 × 8^5 < 2^31).
3. Ausgleich des CIC-Abfalls als 3-Tap-Filter `[c, 1−2c, c]`, c = −0,0769 (48 kHz) bzw. −0,0829 (44,1 kHz): Durchlass ±0,18 dB bis 16 kHz.
4. ~~Steuertakt je Stimme~~ (BM1-Stand, in BM2 ersetzt): BM2-04 verlangt „sample-gleich für alle Stimmen“, daher läuft der Takt jetzt **global**
   (§2.4). Damit der Notenbeginn sample-genau bleibt, rechnet eine neue Stimme beim Tastendruck sofort einen ersten Schritt; der erste Schritt
   dauert 1–48 Samples bis zum Raster. Gleiche Noten an verschiedenen Rasterlagen unterscheiden sich darum in der Hüllkurve um bis zu 1 ms
   (bei A = D = 0 gar nicht, BM1-08 bleibt 0,000 dB). Das Raster beginnt mit `reset` bzw. ▶ (`tr`), so ist ein Song offline und live gleich.

### Abnahme BM1 (gemessen 31.10., `tests/bm1-node.mjs` 27/27, `tests/bm1-cpu.mjs` 3/3, `tests/bm1-browser.mjs` 4/4, `tests/bmk-regel28.mjs` 8/8)
| Punkt | Ergebnis |
|---|---|
| BM1-01 Regel | ✓ 16-fach-Abgriff gegen Formel §1.2, alle 512 Masken: größte Abweichung 1,92·10⁻⁴ (Sinustabelle) |
| BM1-02 Anker | ✓ 31 THD −94,3 dB · 7 Teiltöne 2–8 −6,59/−10,22/−12,75/−14,71/−16,30/−17,65/−18,81 dB (Abw. ≤ 0,06 dB) · 8 gerade 2–14 ≤ −134 dB, 3. −9,48 dB · 24/25 3. −9,60/−9,94 dB · 30 k15/k17 −23,99/−23,99 dB · 63/95/255 stärkster Teilton 2/4/7 |
| BM1-03 Schwerpunkt | ✓ auf dem eigenen 16-fach-Signal: 32/32 Masken 16k−1 lokale Minima, schwächster Block Rang −0,997 |
| BM1-04 Periode | ✓ alle 512 Masken auf A4: Abweichung 0,000 ct |
| BM1-05 Gerätekörnung | ✓ M-ALIAS 0–16 kHz gegen ideale 16-fach-Referenz, Masken 7/8/78/255/511, C4/C6/C7, 48 + 44,1 kHz: größte Abw. 0,73 dB (z. B. 48 kHz C4: 7 −48,9 · 8 −49,5 · 78 −50,1 dB; C7: 7 −39,7 · 511 −52,1 dB) |
| BM1-06 Dezimierer | ✓ Durchlass 100 Hz–16 kHz −0,18 … +0,17 dB (48 kHz), −0,25 … +0,24 dB (44,1 kHz); Prüftöne 32–384 kHz in 0–16 kHz: schlimmster −70,9 dB (bei 80,5 kHz). 44,1 kHz nur Messwert: −65,6 dB bei 72,4 kHz (dort begrenzt der CIC selbst) |
| BM1-07 Maskenwechsel | ✓ durch Modulation (Δ +24): 9 Wechsel, alle auf dem 48-Sample-Raster der Stimme, Phase stetig (Abw. zur Formel 1,9·10⁻⁴); durch Drehen 7 → 8 → 78 → 255 → 31: M-KLICK schlimmster 3,0 dB |
| BM1-08 Key-Reset | ✓ erster 16-fach-Wert 3,8·10⁻⁴, erste Ausgabe-Samples ≤ 1,3·10⁻⁷; 20 Noten O1 = O2: Spanne je Tonhöhe 0,000 dB |
| BM1-09 Rauschen | ✓ FREQ 99: 23 Terzen 100 Hz–16 kHz, größte Abw. −0,23 dB; FREQ 50: Halte-Rate 5050,8 Hz gegen 5052,5 Hz (−0,03 %) |
| BM1-10 Steuertakt | ✓ 48 kHz: Stufen alle 48 Samples, 44,1 kHz: alle 44; alle ADSR-Werte auf 1/1024; A = 0 → 1 im ersten Schritt, D = 0 → S im nächsten, R = 0 → 0 im ersten Schritt nach dem Loslassen |
| BM1-11 DC-Sperre | ✓ −3 dB bei 7,99 Hz; Maske 15 gehalten: Gleichanteil 2,8·10⁻⁶ nach 200 ms (ohne Sperre 0,18) |
| BM1-12 Bitgleich | ✓ Node und Chromium-Offline, 48 und 44,1 kHz: Differenz 0; im selben Prozessor nach `reset` (andere Blocklage) ebenfalls 0 |
| BM1-13 CPU | ✓ Node/Xeon, 9 verschachtelte Läufe, Mediane: Oszillator-Teil einer Stimme **0,70 × VA-Stimme** (0,70 % gegen 1,01 % Echtzeit; Läufe 0,61–1,19 %), 12 Stimmen 7,9 % (0,65 × VA je Stimme); Leerlauf 0,018 %; 60 s mit 12 Stimmen: 0 GC, Heap +0,90 MB (Rest = `performance.now()` je Quantum, wie im VA-Prozessor). Chromium (echter Worklet, Messwert): 1 Stimme 0,50 % gegen VA 0,40 % (1,25 ×), 12 Stimmen 6,6 % |
| BM1-14 Marke | ✓ `BM_WK` ASCII, `grep -i -P 'kodamo|mask ?1(?![0-9])|essence'` im Block = 0 |

Hinweise zu den Messverfahren (Regel 26):
- **M-PERIODE** (BM1-04): „erste Spitze ≥ 0,9“ trifft bei Puls-Masken wie 32 eine Teil-Periode (Korrelation 0,97 nach einer Rampe). Der Test nimmt
  die erste Spitze ≥ 0,9, die auch ≥ 0,995 × die beste Spitze ist, und verfeinert an der Spitze bei 100 Perioden.
- **Maske 8, gerade Teiltöne** (BM1-02): Die Regel selbst hat bei k = 16 (Rampen-Rate) −26,2 dB; geprüft werden die geraden Teiltöne 2–14.
- **M-KLICK** beim Drehen an MASK (BM1-07) auf E5: bei tiefen Tönen sind Masken wie 255 selbst rhythmische Pulse (länger als die 2-ms-Fenster).

### Tor iPhone (§2.5)
- Der Prozessor meldet je Sekunde seine eigene Rechenzeit (`{t:'load', v, nv, q}`), wie der VA-Prozessor. Bis BM6 (`perfProbe` Fall `bm`)
  zusammengeführt ist, misst `bmkProbe({voices: 12, sec: 10})` aus diesem Zweig eine Spur mit 12 Stimmen (beide Oszillatoren + Rauschen).
- Der 16-fach-Pfad ist der einzige Klangpfad; der Schalter O-5 (exakte Tabellen) ist **nicht** gebaut (nur auf Wunsch, Regel 27).
  Die Oszillator-Schleife steckt in `run()`/`runX()`; ein späterer O-5-Pfad wäre eine eigene Schleife daneben.
- Empfehlung an BM6: die iPhone-Probe mit **12** Stimmen fahren (BM6 hat 10), weil das Tor „12 Stimmen über 50 %“ heißt.

### Bitte prüfen (BM1)
1. Hörprobe: im Test-Teil `bmkRender` (Konsole) Masken 7, 8, 31, 78, 255, 511 auf C2/C4/C6 – klingt die Körnung wie erwartet?
2. iPhone: nach dem Zusammenführen mit BM6 die Leistungs-Probe mit Bit Mask (12 Stimmen) – Wert < 50 %?
3. Die zwei Bauweise-Abweichungen (27 Taps, 2^14) – sie ändern den Klang nicht hörbar, nur die Messwerte.

### Fragen an Xander (BM1)
- keine neuen.

---

## BM2 — Stimme, Hüllkurven, LFOs, Modulation (4 Plätze), Spielweisen, Global (31.10.)

**Gebaut:**
- Stimme: Dezimierer → DC-Sperre → **SVF** (TPT, LP/HP/BP/NOTCH, Eingang × 0,5, Band-Zustand weich begrenzt → Selbstschwingung bei RESO 99),
  Koeffizienten je Steuerschritt (stufig) → VOL² · Anschlag (1 − 0,6 + 0,6 v′ wie die anderen Synth-Engines, VEL CURVE) → Panorama (gleiche Leistung).
- 4 ADSR mit LOOP (Attack linear, Decay/Release exponentiell, 10 Bit), RATE (Zeiten je Oktave), Filter-Hk (L Cutoff-Stufen), TRK (OSC1 inkl. SEMI).
- Δ: Masken-START als ganze Schritte (Ziel genau nach T_Δ), Tonhöhen-START → 0 und END beim Loslassen (1 % Rest nach T_Δ).
- 2 LFOs je Programm, 8 Formen, global und sample-gleich, Phase 0 bei ▶/`reset`, DLAY (Einblendung im letzten Viertel, MW/Druck auf Menge/Tempo
  hebt sie je LFO auf), DCAY.
- **4 Ziel-Plätze je Quelle** (Anschlag, MW, Druck, LFO1, LFO2) mit allen Zielen und Bereichen aus §1.9; gleiche Ziele addieren sich; Mengen-Gesetz
  (|a|/99)^1,5; MW/Druck/Bend gleiten 10 ms (in 1-ms-Stufen). l1a/l2a wirken auf Platz 1 und jeden Platz mit Menge ≠ 0 (Frage 3).
- **9 Spielweisen** nach §1.11 (POLY, POLY RETRIG, MONO, MONO PORTA, MONO RETRIG, SLUR, PARA, PARA SLUR, MOLY), 12 Stimmen, Klau mit 3-ms-Blende
  (eigene Blend-Plätze, die ganze Stimme wird kopiert), Poly-Portamento von der letzten Tonhöhe der Stimme, MONO kehrt zur gehaltenen Taste zurück,
  Halten (`ctl sus`) im Kern.
- GLOBAL je Klang: TEMP (6 Tabellen der Spec, vor dem Global-SEMI), SEMI, TUNE (Hz), VEL/AT CURVE, PITCH BEND; TIME FX → BM3.
- Begrenzer `{t:'lim', level}`: Stufe 1 → 8, Stufe 2 → 6 Stimmen; neue Noten nehmen die leiseste; klingende Stimmen bleiben.
- Bedien-Glätten (Regel 12): jeder stetige Wert per `set` gleitet 5 ms in 1-ms-Stufen; MASK mit 10-ms-Blende (BM1).
- Ausgangspegel geeicht: INIT (C4, Anschlag 0,8) = −18,0 LUFS.
- **Gemeinsamer 1-ms-Takt** statt Takt je Stimme (siehe BM1 Punkt 4), Raster ab `reset`/▶; Sofort-Schritt beim Tastendruck.
- Leerlauf: ohne Stimme, mit schlafenden FX und ohne Gleiten wird nichts gerechnet außer den LFO-Phasen (bitgleich zum vollen Pfad).

**Unabhängiger Prüfer** (Teilagent, liest nur, Bericht gegen Spec): 17 Befunde, alle bearbeitet und mit Gegentests `tests/bm2-review.mjs`:
PARA + Halten hing (R1) · CIC-Überlauf bei Pegel-Routen über Faktor 4 → Summe der drei Pegel auf 3,9 × Skala begrenzt (R2) · MONO auf ausblendender
Stimme (R3) · Halten: gehaltene Stimme gilt als losgelassen, erneuter Anschlag derselben Taste (R4) · off vor on bei gleicher Zeit (R5) · `reset`
setzt den Transport zurück, jedes ▶ startet das Raster (R6) · keine Allokation in `prep`/`smoothStep` · Klau-Blende startet am aktuellen Pegel ·
**je Noten-id genau ein `end`** (Ring der gemeldeten ids; eine geklaute, noch gehaltene Taste meldet `end` mit ihrem off) (R10, 3597 Zufallsnoten) ·
PARA-Portamento von der letzten Taste · DLAY-Aufhebung je LFO · MONO-Legato übernimmt die Anschlag-Routen der neuen Note · `reset` meldet `end` ·
MONO „Portamento immer“ auch nach ausgeklungener Stimme · Doku Takt. Offen nur Befund 17 (Frage 2).
Dazu eigene Funde: neue Stimmen hatten Ausblend-Pegel 0 (■ schnitt hart ab statt mit τ) · ■ blendet jetzt nur mit τ aus, die Hüllkurve bleibt ·
ein nicht eingebetteter Aufruf erzeugte je Steuerschritt ein Zahl-Objekt (Heap) → eingebettet.

### Abnahme BM2 (`bm2-node` 24/24, `bm2-modes` 11/11, `bm2-slots` 4/4, `bm2-review` 7/7, `bm2-cpu` 2/2, `bm2-robust` 1/1)
| Punkt | Ergebnis |
|---|---|
| BM2-01 Filter | ✓ LP −12,55, HP +12,01, BP −6,27/+5,99 dB/Okt, Kerbe −140 dB; fc 80,9/655,0/5312,9 Hz gegen 80,7/654,9/5312,2 (0,2 %); RESO 99 schwingt bei 654,9 Hz (−0,01 %), Spitze −10,1 dBFS; TRK 100: fc/f0 1,246 über C2–C6 (0 %), SEMI +12 → × 2,000; Koeffizienten nur auf dem 1-ms-Raster |
| BM2-02 ADSR | ✓ T(9) = 422,7 ms: A 422 · D 423 · R 423 ms; Attack R² 1,000; S 13 −2,487 dB, L 70 −6,021 dB; LOOP 200,0 gegen 199,6 ms |
| BM2-03 Δ | ✓ Tonhöhe +12,384 HT, 1 % nach 302 ms (Soll 301,4); END −12,384 HT; Maske 124 → 100 in ganzen Schritten, Ziel nach 111 ms (T 110,6) |
| BM2-04 LFO | ✓ 7 Formen Korrelation 1,000, RAND je Periode konstant; 4,6798 Hz (0,00 %); 262 gemeinsame Schritte zweier Stimmen gleich; Phase 0 bei ▶; DLAY 0/0/0,605/1 bei 0,6/0,74/0,9/1,05 T, MW hebt auf; DCAY −60,04 dB bei T |
| BM2-05 Plätze | ✓ 60 Routen (alle Quellen × Ziele ohne FX) messbar, die 4 FX-Ziele in `bm3-fx`; Addition exakt (49,747 Stufen); Gesetz 12,69/35,89/100/−35,89 %. „Platz n+1 erscheint erst …“ = Bedienfeld (BM5) |
| BM2-06 Übersicht | ◐ Prozessor-Teil ✓ ([✕] wirkt sofort, −4,4 dB Unterschied); Übersicht, [✕]-Knopf und Undo sind BM5/BM6 |
| BM2-07 Spielweisen | ✓ 9 Modi × 3–6 Folgen (Akkord, staccato, legato, ±1/±2/±3 HT, Rückkehr, alle los) laut Tabelle |
| BM2-08 Stimmen | ✓ 12; 13. nimmt die losgelassene, 14. die älteste gehaltene; Blende 2,7 ms, M-KLICK 4,0 dB |
| BM2-09 Global | ✓ TEMP 6 × 12 Stufen ≤ 0,0001 ct (Ausgang JMAJ E4 0 ct); Global-SEMI +2 → 586,31 ct; TUNE 415 → 415,00 Hz; VEL/AT CURVE ± 0 %; PITCH BEND 200/1200 ct; TIME FX in BM3 ✓ |
| BM2-10 | ✓ PORT 7: 136 ms (Soll 134,2); POLY gleitet von der letzten Tonhöhe der Stimme; PANS 15: ±60 dB L/R im Wechsel; RATE 15: × 0,500 je Oktave |
| BM2-11 Glätten | ✓ 16 Fahrten auf Akkord, schlimmster M-KLICK 5,9 dB (o2.e.l), sonst 3–5,3 dB |
| BM2-12 Robust | ✓ 10 min Zufallsflug (150 Programme inkl. FX1/FX2, 13 606 Noten): NaN 0, Gleichanteil (je 10 s) 2,3·10⁻³, Spitze +5,0 dBFS |
| BM2-13 CPU | ✓ ganze Stimme **1,06 × VA** (1,00 % gegen 0,95 %), 12 Stimmen **8,7 %**; Begrenzer 12/8/6 Stimmen, übrige −142 dB gleich; offline schickt der Host keinen Begrenzer (BM6) |
| BM2-14 INIT | ✓ −18,0 LUFS, A4 −0,0001 ct, keine Route |

Hinweise zu Messverfahren (Regel 26): BM2-12 Gleichanteil als Mittel je 10 s (Noten unter 1 Hz sind Klang, kein Gleichanteil); Tap-Werte sind float32
(BM2-04 Toleranz 10⁻⁵).

---

## BM3 — Effekte FX1 / FX2 + SYNC (31.10.)

**Gebaut** (`src/bm-fx.js`, im Prozessor): FX1 je Programm (CH1–16, DT1–16, BC1–16, RM1–16), FX2 einmal aus A (DL1–16, RV1–16, DT1–16), BAL,
Typwechsel mit 30-ms-Blende (zwei Einheiten je Steckplatz), LFO → fx1t/fx2t (Stufen in der Familie), fx1b/fx2b, TIME FX OFF, SYNC für DL1–8
(nächster Notenwert, Lesezeiger gleitet 50 ms), Schlafen bei Stille (mit Fahnen-Dauer je Typ), Panik: Fahnen 10 ms aus, dann 50 ms Ruhe.
Bauweise-Entscheidungen [A] (Spec offen, nur Technik): Chorus lineare Interpolation; Phaser: Koeffizient alle 8 Samples; DT: algebraische Kennlinie
u/√(1+u²) mit ADAA (statt tanh: CPU), Versatz 0,25 **vor** dem Antrieb (sonst verschwindet der 2. Oberton bei starkem Antrieb), Tiefpass 1-polig,
gerade n mit 5-Hz-DC-Sperre; BC-Tiefpass 2-polig; DL-Tiefpass 1-polig; Hall = Dattorro wie `dirigent-hall` (Vorgaben) mit **geeichter Abklingzeit**
(Tabelle `RV_CAL`, `werkzeug/rv-cal.mjs`) und kleinerem Tank bei kurzen Hallen (Größe = RT60/1 s, mind. 0,35), sonst wären RV14–16 mit ≥ 0,47 s zu lang.
Typwechsel: Chorus übernimmt die Eingangs-Geschichte, Echo/Hall starten leer und blenden ihren Eingang 30 ms ein (kein Einsatz-Sprung).

### Abnahme BM3 (`bm3-fx` 14/14, `bm3-cpu` 1/1)
| Punkt | Ergebnis |
|---|---|
| BM3-01 BAL | ✓ 0: Differenz 0 (Weg umgangen); 50: −6,021 dB; 100: −99,8 dB |
| BM3-02 Chorus | ✓ CH1–14 Tempo ≤ 1,8 %, Tiefe ≤ 3,8 % Abw. (L und R); CH15/16 Kerben bei 200 Hz −18/−10,9 dB und 3 kHz −23,7/−15,3 dB |
| BM3-03 DT | ✓ (Sinus voll ausgesteuert) Klirrfaktor steigt je Reihe streng; ungerade n gerade Obertöne ≤ −143 dB; gerade n 2. Oberton ≥ −16,7 dB; Pegel ≤ 2,1 dB |
| BM3-04 BC | ✓ Raten aus den Spiegelbildern ≤ 0,02 %; 7 Bit genau auf dem 1/64-Raster; Schwankung 0,299 Hz |
| BM3-05 RM | ✓ Seitenbänder ≤ 0,45 % von fn; RM1–4 L/R 90,0° |
| BM3-06 DL | ✓ alle 16 Zeiten exakt (Schwerpunkt der Antwort), Abfall −6,94/−4,44/−2,50 dB exakt, Ping-Pong DL1–4, Kamm 5/5 |
| BM3-07 RV | ✓ RT60 (M-T60) größte Abw. 6 % (RV1 8,32 s … RV16 0,32 s) |
| BM3-08 Typ per LFO | ✓ M-KLICK FX1 3,2 dB, FX2 1,2 dB (Säge A5) |
| BM3-09 Panik/■ | ✓ Panik: DL16 und RV1 nach 50 ms still (−∞); ■: Fahnen klingen weiter (−27/−16 dBFS) |
| BM3-10 CPU | ✓ je Steckplatz: CH 0,10–0,17 %, DT 0,10 %, BC 0,11–0,12 %, RM 0,07 %, DL 0,11 %, **RV 0,68–0,70 %**; Leerlauf mit FX 0,07 % |
| BM3-11 SYNC | ✓ 120 BPM: 750/500/375/187,5/125/93,75/62,5/31,25 ms exakt; DL9–16 unverändert; OFF bitgleich ohne Feld; 120 → 90 BPM M-KLICK 0,04 dB |
| BM2-05 FX-Ziele / BM2-09 TIME FX | ✓ fx1t/fx2t/fx1b/fx2b messbar; TIME FX OFF: DL/RV bitgleich trocken, DT bleibt |

Hinweise (Regel 26): BM3-03 „Klirrfaktor steigt streng mit n“ gilt je Reihe (ungerade/gerade n): mit Versatz bei geraden n kann eine Formel mit festem
Versatz nicht über alle 16 streng steigen (Frage 4). „Pegeländerung ± 3 dB“ gilt bei voller Aussteuerung; bei INIT-Pegel (−18 LUFS) wird DT bis
+6 dB lauter (Formel 1/(1+0,1 n) der Spec). M-T60 nach Nachtrag 6 (Hüllkurve, Regression −5 … −35 dB).

### Bitte prüfen (BM2/BM3)
1. Spielweisen am Gerät-Gefühl: MONO/MONO PORTA/SLUR/PARA mit Akkorden und Legato-Läufen.
2. Filter-Resonanz (RESO 90–99) und die Körnung schneller Filter-Hüllkurven.
3. Effekte: Chorus/Phaser, DT gerade gegen ungerade, Bitcrusher, Ringmod, Echo mit SYNC (Tempo ändern), Hall RV1/RV16.
4. iPhone-Tor: `bmkProbe()` misst jetzt 12 Stimmen mit Filter, LFOs, FX1 Chorus und FX2 Hall (Chromium/Xeon: 8,0 %, Spitzen 10 %).

### Fragen an Xander (BM2/BM3)
1. **Kodierung VEL/AT CURVE:** Der Prozessor versteht `vc` 1–5 und 6/'max', `ac` 1–6 und 0/'none'. Welche Werte speichert BM6/BM5? (Schnittstelle)
2. **POLY gegen POLY RETRIG** (Prüfer-Befund 17): „kein Neustart“ wirkt nur, wenn eine Stimme übernommen wird (Klau): Die neue Note läuft dann vom
   Pegel der alten Stimme weiter. Eine erneut angeschlagene Taste bekommt bei freien Stimmen eine neue Stimme ab 0. Ist das so gemeint?
3. **MW/Druck → LFO-Menge (l1a/l2a):** wirkt auf Platz 1 und jeden weiteren Platz mit Menge ≠ 0 (leere Plätze bleiben leer). Recht so?
4. **DT „Klirrfaktor streng steigend“** geht mit dem festen Versatz nur je Reihe (ungerade/gerade); und der Pegelausgleich 1/(1+0,1 n) hält ± 3 dB nur bei
   voller Aussteuerung. Soll der Ausgleich an den Eingangspegel angepasst werden?
5. **Stimmungen:** Die Spec-Tabellen weichen von den MS-2000-Tabellen ab (ARAB F#/G# +50 ct, JMIN F# 609,78, PYTA C#/G#); gebaut ist die Spec.
   Die Spec sagt „wo MKW.SCL dieselbe Stimmung hat, gelten dieselben Werte“ – welche gilt?
6. **STEP-Welle** (8 Stufen): gebaut als Treppe von −1 bis +1 aufwärts. Richtig?

### Hinweise an den Dirigenten / BM6
- **Datenform:** BM6 (`helfer-bmu`, Stand e38ae78/343783b) hat in `SQBM` noch die Rev.-1-Form (`l1:{am, ds,…}`, `mo:{vd, va, …}`, Masken 0–255, `ar.dv`,
  `g.pb/tm/rt`, `ly.md 'sch'`). Der Prozessor folgt Rev. 2 §5.1 (`l1.t`, `mo.v/mw/at`, `gl`, Masken 0–511, `fx.sy`, `ar.sp`). Beim Zusammenführen muss `SQBM`
  auf Rev. 2.
- `BmHost.prog` muss `{t:'gl', p: b.gl}` schicken; `perfProbe` 'bm' am besten mit 12 Stimmen + FX (wie `bmkProbe`).
- Lautstärke: der Prozessor gibt INIT bei −18 LUFS aus (OUTG); die Spur-Kette der App kommt danach.
