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
- Steuertakt 1 ms (48 bzw. 44 Samples) **je Stimme ab ihrem Tastendruck**: ADSR (OSC1, OSC2, Rauschen, Filter) mit LOOP, 10-Bit-Rundung,
  Masken-Δ, Tonhöhen; alles stufig. A/D/R = 0 → Sprung im nächsten Schritt.
- Key-Reset (K1): freie Stimme startet bei Phase 0. Drehen an MASK (`set o1.m`): 10-ms-Blende zwischen alter und neuer Maske (Regel 12);
  Wechsel durch Modulation hart am Steuerschritt, phasenstetig.
- Bitgleichheit: feste Saaten, CIC-/Filter-Zustände genullt bei freier Stimme, `reset`; das Ende einer Stimme wird an ihrem eigenen Steuerschritt
  entschieden (unabhängig von der Blocklage).
- Keine Allokation in `process()`: heiße Zahlen der Stimme in Typed Arrays (sonst legt V8 bei großen Ganzzahlen/Kommazahlen je Speichern ein Objekt an).
- Sparen ohne Klangänderung: Oszillator 2 und Rauschen rechnen nur bei Pegel > 0 (Phase läuft trotzdem bitgenau weiter); nach dem Ausklingen läuft
  nur noch die DC-Sperre aus.

**Abweichungen von der Bauweise [A] der Spec (nur Bauweise, um die Abnahme-Werte zu treffen; Klang „wie am Gerät“ bleibt):**
1. Halbband **27 Taps** bei 48 kHz (31 bei 44,1 kHz) statt 23: mit 23 Taps erreichen Prüftöne bei 32 kHz nur −67,5 dB (BM1-06 verlangt −70 dB).
   Kosten: ein bzw. zwei Multiplikationen mehr je Ausgabe-Sample.
2. CIC-Eingang × **2^14** statt 2^13: mit 2^13 lag M-ALIAS von Maske 255 auf C4 2,1 dB über der idealen Referenz (Quantisierungsrauschen bei −95 dB);
   mit 2^14 0,7 dB. Überlauf ausgeschlossen (3 × 2^14 × 8^5 < 2^31).
3. Ausgleich des CIC-Abfalls als 3-Tap-Filter `[c, 1−2c, c]`, c = −0,0769 (48 kHz) bzw. −0,0829 (44,1 kHz): Durchlass ±0,18 dB bis 16 kHz.
4. Der Steuertakt läuft je Stimme ab ihrem Tastendruck (nicht global): so ist jede Note sample-genau gleich (BM1-08, BM6-04 ±1 Sample).
   LFOs (BM2) laufen global; eine Stimme liest an ihrem Schritt den aktuellen LFO-Wert.

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
