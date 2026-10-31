# SYNQUENZER v3 — Nachtrag 7: Bit Mask (Bitmasken-Synthese nach dem Vorbild-Gerät, Xander 31.10.) · Rev. 2

**Kurz für Xander**
1. „Bit Mask“ wird gebaut wie das Gerät in seiner neuesten Fassung: 2 Masken-Oszillatoren mit je **512 Masken**, **12 Stimmen**, Rauschen, Filter, 4 Hüllkurven mit Schleife, Masken- und Tonhöhen-Hüllkurve, 2 LFOs, 9 Spielweisen, Schicht/Split, Arpeggiator und FX1/FX2. Der Klang ist wie am Gerät (16-fach überabgetastet, körnige Hüllkurven). Das Bedienfeld ist eine eigene Zeichnung des Geräts mit 23 Tasten, roter Ziffernanzeige und Drehgebern, quer und hoch mit Tasten ≥ 44 px.
2. Deine Zusätze: Druck = Finger auf der Taste nach oben schieben; je Quelle bis zu 4 Mod-Ziele; Echo wahlweise im Song-Tempo; Bend, Rad und Druck werden fest im Clip mitgespeichert (sie wandern bei jedem Kopieren mit, „Kurven löschen“ je Clip).
3. Acht Pakete, zusammen ≈ 74 h, parallel baubar. Alte Projekte bleiben bitgleich. Alle Fragen sind beantwortet; nur Optionen wie das zweite Filter der neuesten Firmware oder eine Halte-Taste bleiben für später.

---

Status: **Rev. 2 zur Freigabe** (Rev. 1 vom 31.10. nachmittags; Xanders Antworten F1–F10 31.10. ~17:00 UTC eingearbeitet). Auftrag Xander 31.10.
(`fragen-xander-9.md`, ~16:00 und ~16:10 UTC): Bitmask-Synth nach dem Vorbild-Gerät, professionell, stabil, ohne Unterschiede. Über den Dirigenten:
Der Sequencer des FM-Geräts desselben Herstellers „passt nicht gut“. Von Menschen gemachte Entwürfe sollen verbessert werden, wo Xander das will.
Bei Klang und Aussehen hat er entschieden: **„alles wie am Gerät“** (F1, F4–F6).

**Kennzeichen:** **[H]** Handbuch-Fakt (eigene Worte) · **[Ö]** öffentliche Angabe (Hersteller-Firmwareliste, Testberichte; nur aus Suchtreffern)
· **[A]** Annahme dieser Spec (der Builder baut genau das) · **[X]** Entscheidung Xander · **[Z]** Zusatz, den Xander bestellt hat (F3, F7, F8, F9).

**Regeln, die hier besonders gelten** (`typische-fehler.md`, unverändert):
- **27** Nichts selbst bestimmen. Was das Handbuch offen lässt, legt diese Spec mit [A] fest. Optionen in §1.19 werden **nicht** gebaut.
- **28** Alte Projekte klingen gleich: Die Engine ist zusätzlich. Ohne Bit-Mask-Klang wird ihr Modul nicht geladen, und `dirigent-analog` bleibt
  byte-gleich. Spätere Änderungen an der Engine bekommen das Versionsfeld `p.bm.v` mit Umrechnung oder altem Pfad.
- **24 (sinngemäß)** Marke: Hersteller- und Gerätename stehen nirgends in der App, auch nicht als Logo auf dem nachgezeichneten Bedienfeld.
  Der Anzeigename kommt nur aus `BM_NAME` (§0.3).
- **4 / 1 / 5 / 3 / 6 / 10** Trefferflächen ≥ 44 × 44 px; nichts abgeschnitten, kein Layout-Sprung in 390×844, 375×667, 320×568, 844×390, 667×375,
  926×428 **und Xanders 428×926 hoch**; Listen per Finger; scharfe Modi enden auf jedem Weg.
- **7/8/9** „geändert“-Punkt und [A/B] sofort, eine Geste = ein Undo, Speichern → Laden deep-equal.
- **12/13** Knackfreiheit bei **Bedien-Änderungen** und Stimmenübernahme bleibt Pflicht. Die gewollte Körnung des Gerätes (F6) ist Klang, keine
  Bedien-Änderung. Wo „wie am Gerät“ mit Regel 12/13 kollidiert, gilt die Regel (§1.18).
- **15/16/17** Panik beendet auch Fahnen; keine Allokation pro Block; NaN-/Denormal-Schutz. **20** kein Supabase-Aufruf. **29** parallel in Zweigen.
- **K1 [X]:** Oszillatoren starten beim Tastendruck phasengleich. Unter Last ändert sich nie der Klang (nur die leisesten Stimmen werden geklaut).
  INIT hat 0 Cent und keine Route. Die Mod-Übersicht zeigt jede Route.
- **CLAUDE.md:** Schnelle Seite und Verbindung zuerst. Modul und Bedienfeld-Block werden erst bei Bedarf geladen. Es gibt **keine** Tabellen und keinen Worker
  mehr (§2), das spart 8 MB und alle Bauzeit. WebGL bringt hier nichts: Das Bedienfeld ist SVG/CSS wie beim MS 2000.
- Format bleibt **5** (nur zusätzliche Felder). App-Version vergibt der Dirigent; `max_app` (heute 4 030 000) setzt Xander (Regel 20).

---

## 0. Quellen, Lesart, Name

### 0.1 Quellen
- **Handbuch des Vorbild-Geräts** (Kodamo MASK1, Ausgabe 1.5 von 2023, 52 S.), privat unter `S/manuals/mask1/`. Es kommt **nie in ein Repo** und wird
  nie wörtlich zitiert. Seitenbilder (Bedienfeld-Zeichnung, Messbilder der Masken) liegen privat unter `S/mask1-render/`.
- **Öffentlich [Ö]** (Websuche 31.10.; die Seiten selbst waren im Netz dieser Sitzung gesperrt, die Angaben stammen aus den Suchtreffern):
  - Firmware 3.1 (Mai 2023): bis **12 Stimmen** statt 10, verbesserte Oszillator-Qualität.
  - Firmware 3.4 (März 2024): **512 Masken** (9 Bit) statt 256, die neuen „sehr eigen und pulsartig“; **zweites 12-dB-Filter** je Stimme
    (Einstellung EXTRA im Filter, allein oder mit dem ersten zu 24 dB kombinierbar); **Schleifen auf den Δ-Hüllkurven**; zwei Tasten zugleich
    bearbeiten beide Oszillator-Masken; 600 Nutzer-Plätze. Eine Version 3.5 ist genannt, ihr Inhalt nicht.
  - Das Gerät rechnet die Oszillatoren **16-fach überabgetastet** (die spätere Tischversion 8-fach).
  - Gerät: lackiertes Metall, in den Händlertexten „weiß“; 23 mechanische Taster, 2 Drehgeber. Testberichte bemängeln die kleine Zeichen-Anzeige.
  - Eine Rechenvorschrift der Masken ist **nirgends veröffentlicht**.
- **App:** `CHANGES-V3.md`, `CHANGES-MK.md` (MS 2000 als `eng 3`, `MK_LABEL`, MK0-Schutz, Format 5, Block `sq-mk-src`, Räder, MK3 Timbres/Split,
  MK5 `ARPC`, MK-P nachgezeichnetes Bedienfeld, MK8 Programm-Speicher, `perfProbe`), Nachtrag 5 (K1), Nachtrag 6 (Aufbau dieser Spec).
- **Alter Plan** `dirigent-spec-v3.md` §10.2–10.4, V8a/V8b: ersetzt (§0.4).

### 0.2 Lesart (wo Handbuch und öffentliche Angaben unklar sind)
| Stelle | Befund | Festlegung |
|---|---|---|
| Masken-Rechnung | nur Prinzip und Beispiel-Masken [H]; nichts veröffentlicht [Ö] | eigene **Masken-Regel** §1.2, geeicht an allen Anker-Masken [A] |
| Anzahl Masken | Handbuch 256 [H], Firmware 3.4: 512 [Ö] | **512** (0–511) [X F10] |
| Stimmen | Handbuch 10 [H], Firmware 3.1: 12 [Ö] | **12 je Spur** [X F10] |
| Klangcharakter | 16-fach überabgetastet [Ö]; körnige Hüllkurven, Geräusche bei schnellen Hüllkurven/LFOs auf reinen Tönen [H] | **nachgebildet als Standard** [X F6], Bauweise §2 [A] |
| zweites Filter, Δ-Schleifen (Fw 3.4) | öffentlich, Details unbekannt | **nicht gebaut**, Option §1.19 (Regel 27) |
| Masken-Bilder | Bedienfeld-Übersicht „vereinfacht“ [H]; Messbilder (7, 8, 25, 78) genau | Messbilder gelten [A] |
| Zahlenbereiche | genannt nur: Osz.-SEMI 120 HT, PORT 0–13, BAL 0–100, Tonhöhen-SPD 1–40, Bend ±12, Arp 20–400 BPM, Stimmton 400–470 Hz | übrige Skalen §1.3 [A] |
| ADSR-Bereich | Beispiele deuten auf eine kleine Skala | 0–15 [A] |
| Anzeige | 4 Stellen, 7 Segmente [H]; Parameternamen sind teils länger | lange Namen laufen einmal durch [A] |
| Global-Einstellungen | am Gerät für alle Klänge [H] | in der App **je Klang** gespeichert (jede Spur ist ein eigenes Gerät) [A] |
| LFO-Verzögerung, Paraphon-Loslassen, Anschlag → Pegel | teils offen | §1.8, §1.11, §1.9 [A] |

### 0.3 Name
- **[X] 31.10.:** Anzeigename **„Bit Mask“**, Konstante `BM_NAME = 'Bit Mask'`, einmal definiert; jede Anzeige liest sie.
- Interne Bezeichner: Engine `'bm'`, Daten `p.bm`, Prozessor `'synq-bm'`, Block `sq-bm-src`, Helfer `BM…`/`bm…`. Prüfung:
  `grep -i -P 'kodamo|mask ?1(?![0-9])|essence'` über alle Bit-Mask-Teile = 0. Mod-Ziele heißen `o1m`/`o2m`, nie `mask1`/`mask2`.
- `BM_NAME` steht nie direkt vor einer Ziffer (kein „Bit Mask 1“ als Spur-, Klang- oder MIDI-Name). Maskenwerte erscheinen überall
  **dreistellig** („078“, „511“, auch in der Anzeige), nie als „MASK 1“.
- Das nachgezeichnete Bedienfeld trägt **keinen** Hersteller- oder Modellnamen und kein Logo; die Rückseite wird nicht gezeichnet.

### 0.4 Verhältnis zum alten Plan §10 / V8a–V8b und zu Rev. 1
- §10.2–10.4 und V8a/V8b (nicht gebaut) entfallen.
- Rev. 1 hatte exakte bandbegrenzte Tabellen aus einem Worker, Masken-Karte, Bit-Schalter, Oszilloskop, Oktav-Hinweis und glatte Hüllkurven.
  Nach F1/F5/F6 rechnet Rev. 2 **wie das Gerät** (16-fach, körnig), und das Bedienfeld ist **wie das Gerät**. Karte und Bit-Schalter bleiben
  nur als Option O-1 (nicht gebaut).

---

## 1. Architektur

### 1.1 Signalweg
```
 Taste ─► Δ TONHÖHE ─┬─► OSC1 Masken-Osz. (MASK + Δ) × ADSR1·L ─┐   16-fach    ┌─► Dezimierer 16→1 ─► DC-Sperre ─► FILTER 12 dB SVF
                     ├─► OSC2 Masken-Osz. (MASK + Δ) × ADSR2·L ─┼── Σ ────────┘                                    (CUTF + ADSR4, TRK)
                     └─► RAUSCHEN (Sample & Hold)    × ADSR3·L ─┘                                                        │
   ─► × VOL · Anschlag ─► PAN (PANS) — je Stimme, bis 12 Stimmen je Spur ◄─────────────────────────────────────────────┘
   Σ Stimmen eines Programms ─► FX1 (CH/DT/BC/RM) ─► FX2 (DL/RV/DT) ─► Stereo ─► Spur-Kette der App
   LFO1/LFO2 je Programm, frei laufend · Anschlag, MOD-Rad, Druck, LFOs mit je bis zu 4 Zielen [Z F8]
```
- [H] Ablauf: Tonhöhen-Hüllkurve startet mit der Taste; zwei Masken-Oszillatoren mit eigener Masken-Hüllkurve und eigener Pegel-ADSR,
  Rauschen mit Pegel-ADSR; Filter mit eigener ADSR und Tracking von OSC1; FX1 und FX2 in Reihe; LFOs wirken fast überall. Es gibt keine eigene
  Verstärker-Hüllkurve hinter dem Filter.
- [Ö/A] Oszillatoren und Rauschen laufen mit 16-facher Abtastrate und werden je Stimme auf die App-Rate gebracht (§2.2). Filter, Pegel und FX laufen
  auf der App-Rate.

### 1.2 Die Masken-Regel (9 Bit, [A] – geeicht an [H] und [Ö])
```
M        Maske 0 … 511 (9 Bit)
S(M)     Spanne = 1 für M = 0, sonst 2^(Stelle des höchsten gesetzten Bits + 1)          → 1, 2, 4 … 512 Schritte
φ        Phase 0 ≤ φ < 1, läuft einmal je Notenperiode
s = φ · S(M);  p = ⌊s⌋;  f = s − p
m = p AND M
y = sin(2π · (m + f) / 32),   wenn m < 32;   sonst 0
```
- **Bit 0–4** wählen den gelesenen Teil einer 32-Schritt-Sinusperiode. Fehlt ein Bit, wird ein Teil wiederholt, und weil `f` weiterläuft, entstehen
  kleine Rampen. **Bit 4** = zweite Sinushälfte: Ist es gesetzt (M < 32), ist die Welle halbwellen-symmetrisch. **Bit 5–8** zeigen hinter den Sinus,
  dort ist die Welle still. Jedes dieser Bits verdoppelt die Spanne, die Note bleibt gleich: höhere Oktaven, pulsartige Formen, tief gespielt Rhythmen.
- Für 0–255 ist die Regel dieselbe wie in Rev. 1; die Erweiterung ändert dort nichts.

**Anker-Prüfung** (`S/bm-tools/maskrule.mjs`, `check512.mjs`; genaue Fourier-Reihe):
| Maske | Handbuch / öffentlich (eigene Worte) | Regel ergibt | passt |
|---|---|---|---|
| 31 | Sinus [H] | reiner Sinus | ✓ |
| 7 | reine Säge, wie die analoge Kondensator-Säge [H] | steigender Viertel-Sinus, dann Sprung; Teiltöne 2–4 −6,6/−10,3/−12,8 dB, Neigung −6,1 dB/Okt | ✓ Messbild |
| 8 | Rechteck, unterer Teil aus kleinen Sägen [H] | untere Hälfte 8 Rampen (Höhe 0,195), obere fast flach; nur ungerade Teiltöne (−9,5/−14,0/−16,9 dB) | ✓ Messbild |
| 25, 20–25 | rechteckartig [H] | 25: hoch · Mitte mit fallenden Zähnchen · tief · Mitte mit steigenden Zähnchen; 16–31 ohne gerade Teiltöne | ✓ Messbild |
| 16k−1 (15, 31, 47 …) | rund und weich; mit steigender Nummer dunkler bis 16k−1, dann ein Sprung zu hell [H] | **32/32** Masken 16k−1 (0–511) sind lokale Schwerpunkt-Minima; in den Blöcken 1–31 fällt der Schwerpunkt streng (Rang −1,00) | ✓ |
| 28–30 | ätherisch, FM-glockig [H] | Sinus + Paare hoher Teiltöne (30: k15/k17 −24 dB) | ✓ |
| 56 | Puls [H] | 0 / +1 / 0 / −1, dann Stille | ✓ |
| 63, 95, 255 | andere Oktaven [H] | stärkster Teilton 2 / 4 / 7 | ✓ |
| 78 | summend, gleiche Periode wie der Sinus [H] | 4 gezackte Bögen, dann Stille; Grundton = Note | ✓ Messbild |
| 256–511 | neue Masken „sehr eigen, pulsartig“ [Ö] | klingender Anteil im Mittel 0,21 statt 0,42 (0–255), Schwerpunkt im Mittel 36 statt 18 | ✓ |
- Rohe Pegel reichen von 0 dB (Sinus) bis −29 dB. Gebaut wird **roh** [X F4].
- Grenze: Die Regel trifft alle Anker. Bitgenauigkeit zum Gerät ist nicht belegbar [A].

### 1.3 Gemeinsame Skalen
| Skala | Formel [A] | Stützwerte |
|---|---|---|
| **Zeit** `T(x)`, x 0–15 (A, D, R, LFO-DLAY/-DCAY) | x = 0 → **sofort** (ein Steuerschritt, §2.4); sonst `2 ms · 7500^(x/15)` | 1 → 3,6 ms · 3 → 12 · 6 → 71 · 9 → 424 ms · 12 → 2,5 s · 15 → 15 s |
| Attack / Decay, Release | linear [H] / exponentiell [H], −60 dB bzw. Sustain + 0,1 % nach `T(x)` | – |
| Sustain S 0–15 | `(S/15)²` | 13 → −2,5 dB · 8 → −10,9 dB |
| Pegel L, VOL 0–99 | `(L/99)²` | 70 → −6,0 dB · 50 → −11,9 dB |
| Cutoff CUTF 0–99 | `20 Hz · 1000^(CUTF/99)`, begrenzt 10 Hz … 0,45 fs | 20 → 81 Hz · 37 → 264 Hz · 50 → 655 Hz · 70 → 2,64 kHz |
| Filter-Hk L 0–99 | Spitze addiert L Cutoff-Stufen | – |
| RESO 0–99 | SVF-Dämpfung `1,414 · (1 − RESO/99)`, bei 99 Selbstoszillation mit tanh-Begrenzung | 0 → Q 0,71 · 90 → Q 7,8 |
| TRK 0–100 % | `fc · (f_OSC1 / 261,63 Hz)^(TRK/100)`, f_OSC1 inkl. OSC1-SEMI [H] | – |
| Rausch-FREQ 0–99 | S&H-Rate `30 Hz · (16·fs/30)^(FREQ/99)`; 99 = jedes Sample der 16-fachen Rate | 50 → ≈ 5 kHz (48 kHz) |
| Δ-SPD 1–40 (Tonhöhe [H], Maske [A]) | `T_Δ = 5 s · 2500^(−(SPD−1)/39)`, exponentiell, 1 % Rest nach `T_Δ` | 10 → 0,82 s · 15 → 0,30 s · 20 → 0,11 s · 30 → 15 ms · 40 → 2 ms |
| Masken-START | −256 … +256, Ziel geklemmt 0–511, ganzzahlig | – |
| Tonhöhen-START/END −63 … +63 | `ΔHT = Vorzeichen · 48 · (|x|/63)²`, + = höher | 6 → 0,44 · 16 → 3,1 · 32 → 12,4 · 63 → 48 HT |
| Osz.-SEMI / TUNE | −60 … +60 HT [H] / −50 … +50 ct | – |
| PORT 0–13 [H] | 0 aus; sonst `8 ms · 1,6^(PORT−1)` | 7 → 134 ms · 13 → 2,2 s |
| LFO-SPD 0–99 | `0,05 Hz · 8000^(SPD/99)` | 50 → 4,7 Hz · 99 → 400 Hz |
| Mod-Menge AMT 0–99 (LFO), −99 … +99 (V, MW, AT) | `u = Vorzeichen · (|a|/99)^1,5` × Zielbereich `D` (§1.9) | 25 → 12,7 % · 50 → 35,9 % |
| PANS 0–15, RATE 0–15 | Auslenkung `PANS/15`; Zeiten × `2^(−(RATE/15)·(Note−60)/12)` | – |
| BAL 0–100 [H] | trocken × (1 − b/100) + nass × b/100 | – |

### 1.4 Oszillatoren OSC1 / OSC2
| Parameter | Bereich | Anzeige | Wirkung |
|---|---|---|---|
| MASK | 0–511 [X F10] | „078“ | Welle nach §1.2 |
| SEMI | −60 … +60 HT [H] | „ 12“, „-24“ | Transponieren, gleicht Masken-Oktaven aus [H] (kein automatischer Ausgleich, kein Hinweis [X F5]) |
| TUNE | −50 … +50 ct [A] | „ -3“ | Verstimmen |
| START | −256 … +256 [A] | „ 24“ | Masken-Hüllkurve: Startabstand [H] |
| SPD | 1–40 [A] | „ 20“ | Masken-Hüllkurve: Tempo [H] |
| Hülle L A D S R LOOP | §1.3 | Zahl / „ON“ | Pegel-ADSR [H]; LOOP wiederholt A + D [H] |
- Wirksame Maske `clamp(round(MASK + ΔMaske + Anteile), 0, 511)`, ganzzahlig, keine Überblendung [H: harte oder weiche Übergänge je nach Bereich].
- **Wechsel durch Modulation** (Δ, LFO, Rad, Druck, Anschlag): ab dem **nächsten Steuerschritt** (≤ 1 ms), hart, phasenstetig [A, Gerätecharakter].
- **Wechsel durch Bedienung** (Drehen an MASK): 10-ms-Überblendung zwischen alter und neuer Maske (Regel 12).
- Start einer freien Stimme bei φ = 0 (K1 [X]); jede Maske beginnt dort bei y = 0.

### 1.5 Rauschen
Eigenes Sample-&-Hold-Rauschen je Stimme [H], FREQ = Halte-Rate (§1.3), 99 = weiß [H], ADSR mit L und LOOP [H]. Bauweise [A]: xorshift32,
Saat = Hash(Spur-Saat, Notenzähler); läuft in der 16-fachen Rate **ohne** Kantenglättung, also mit der Körnung des Geräts.

### 1.6 Filter
12-dB-Zustandsvariablen-Filter je Stimme, selbstresonant, LP/HP/BP/NOTCH, CUTF, RESO, MODE, TRK, ADSR mit L und LOOP [H]. Bauweise [A]: TPT-Form,
`tan`-Tabelle, tanh im Resonanzweg, Eingang × 0,5. Koeffizienten wechseln **stufig je Steuerschritt** (Körnung bei schnellen Filter-Hüllkurven [H]).

### 1.7 Hüllkurven (körnig wie am Gerät [X F6])
- 4 ADSR je Stimme (OSC1, OSC2, RAUSCHEN, FILTER) mit L und LOOP [H]; Attack linear, Decay/Release exponentiell [H].
- 3 Δ-Hüllkurven (Maske OSC1, Maske OSC2, Tonhöhe) [H]; END nur bei der Tonhöhe [H].
- **Körnung [A, nach H „körnig wie frühe Digitalsynths“, „kleine Geräusche, die ein Tiefpass glättet“]:** Alle Hüllkurven rechnen im Steuertakt
  von 1 ms und wirken **stufig** (ohne Zwischenwerte). Die ADSR-Ausgänge sind auf 1/1024 des Vollpegels gerundet (10 Bit, linear).
  A, D oder R = 0 = Sprung im nächsten Steuerschritt [H: „sofort“].
- Bedien-Änderungen an Hüllkurven-Werten gelten ab dem nächsten Steuerschritt (keine Knackser durch die Änderung selbst, Regel 12).

### 1.8 LFO1, LFO2
- Je Programm, frei laufend, zweipolig, für alle Stimmen gleich [H]. AMT, SPD, DEST, WAVE, DLAY, DCAY [H] + Ziel-Plätze 2–4 [Z F8, §1.9].
- Wellen [H Namen, A Form]: SIN (Maske 31) · SQR · UP · DOWN · SAWS (Form der Maske 23) · STEP (8 Stufen) · HSIN (Bogen der Maske 15, ±1) · RAND
  (je Periode neuer Wert). Ausgabe **stufig je Steuerschritt** (Geräusche bei LFO-Tremolo auf reinen Tönen sind am Gerät bekannt [H]).
- DLAY [H]: Einsatz nach `T(DLAY)` (Einblendung im letzten Viertel [A]); MW- oder Druck-Bewegung auf Menge/Tempo dieses LFOs hebt die Verzögerung auf [H].
  DCAY [H]: 0 = aus, sonst nach `T(DCAY)` bei −60 dB. Neustart beider bei Phrasen-Beginn (Taste ohne andere gehaltene) [A].
- Phase 0 bei ▶ und vor jedem Offline-Render [A] (gleicher Song = gleicher Klang; sonst frei laufend wie am Gerät).

### 1.9 Modulation (bis zu 4 Ziele je Quelle [Z F8])
- **Quellen:** Anschlag (6 Ziele [H]), MOD-Rad (16 [H]), Druck (16 [H]), LFO1, LFO2 (je 16 [H]).
- **Ziel-Plätze [Z, A]:** je Quelle **4 Plätze** (Ziel + Menge). Platz 1 = der Geräte-Parameter (V-DEST/V-AMT, M-DEST/M-AMT, AT-DEST/AT-AMT,
  LFO DEST/AMT). Plätze 2–4 heißen in der Anzeige V-DEST2/V-AMT2 … AT-AMT4 bzw. DEST2/AMT2 … DEST4/AMT4. Ein Platz erscheint in der
  Parameterfolge erst, wenn der vorige eine Menge ≠ 0 hat. Gleiche Ziele in mehreren Plätzen oder Quellen addieren sich.
- Ziele und Zielbereiche `D` [A, Liste H]:
| Ziel (Kennung) | LFO | MW/AT | V | Wirkung |
|---|---|---|---|---|
| Tonhöhe beider `freq` / OSC1 `o1f` / OSC2 `o2f` | ✓/✓/✓ | ✓/–/– | – | ±24 HT |
| Stimm-Pegel `vol` | ✓ | ✓ | ✓ | Faktor `1 + u` (≥ 0); V: `1 − |u|·(1 − v)` |
| OSC1/OSC2/Rausch-Pegel `o1v` `o2v` `nv` | ✓ | ✓ | – | Faktor `1 + u` |
| Cutoff `flt` (Anzeige FILT bzw. FLT) | ✓ | ✓ | ✓ | ±99 Cutoff-Stufen |
| Filter-Hk-Menge `feg` | – | – | ✓ | `L · (1 + u·(v − 1))` |
| Maske beider `mask` / OSC1 `o1m` / OSC2 `o2m` | ✓ | ✓ | ✓ (nur `mask`) | ±256 Masken-Stufen |
| Panorama `pan` | ✓ | – | – | ±100 % |
| Rausch-FREQ `nf` | ✓ | ✓ | – | ±99 Stufen |
| LFO-Menge/-Tempo `l1a` `l1s` `l2a` `l2s` | – | ✓ | – | ±99 Stufen |
| FX-Typ `fx1t` `fx2t` | ✓ | – | – | ±15 Typen in der Familie, 30-ms-Blende |
| FX-Anteil `fx1b` / `fx2b` | –/✓ | ✓ | – | ±100 BAL |
| Tonhöhen-Hk-Start `peg`, Attack-Tempo `atk` | – | – | ✓ | Start × `(1 + u·(v−1))`; Attack × `2^(−4·u·v)` |
- Grunddynamik Anschlag → Pegel wie die anderen Synth-Engines der App (K1-Antwort 4), durch VEL CURVE geformt (§1.10).
- MW, Druck und Bend glätten 10 ms [H: geglättet].
- **Mod-Übersicht (K1):** Jeder belegte Platz aller Quellen erscheint dort (bis 20 je Programm), dazu Masken-Δ, Tonhöhen-Δ, Filter-Hk und PANS; [✕] setzt die Menge auf 0 (ein Undo).

### 1.10 GENERAL und GLOBAL
| Taste | Parameter [H] | Bereich [A] |
|---|---|---|
| General | MODE · VOL · SEMI · PORT · PANS · RATE | 9 Modi · 0–99 · −48…+48 HT · 0–13 · 0–15 · 0–15 |
| Global (je Klang gespeichert [A]) | TEMP · SEMI · TUNE · VEL CURVE · AT CURVE · PITCH BEND · TIME FX | ET ARAB JMAJ JMIN MEAN PYTA · −24…+24 HT · 400–470 Hz [H] · 1–5, MAX [H] · 1–6, NONE [H/A] · 0–12 HT [H] · ON/OFF [H] |
- **TEMP:** Alle Stimmungen gehen von C aus [H]. Die Stimmung wird auf die gespielte Note **vor** dem Global-SEMI angewandt. So verschiebt Global-SEMI
  den Grundton wie am Gerät [H]. Tabellen (Cent je Stufe 0–11) [A, ARAB nach H]: ET 0, 100 … 1100 · ARAB wie ET, aber E und B −50 ct, F# und G# +50 ct ·
  JMAJ 0 111,73 203,91 315,64 386,31 498,04 590,22 701,96 813,69 884,36 996,09 1088,27 · JMIN wie JMAJ, aber F# 609,78 und B♭ 1017,60 ·
  MEAN 0 76,05 193,16 310,26 386,31 503,42 579,47 696,58 772,63 889,74 1006,84 1082,89 · PYTA 0 90,22 203,91 294,13 407,82 498,04 611,73 701,96
  792,18 905,87 996,09 1109,78. Wo `MKW.SCL` (MS 2000) dieselbe Stimmung hat, gelten dieselben Werte.
- **TUNE** 400–470 Hz: Stimmton dieser Spur (Standard 440). **TIME FX** OFF umgeht DL und RV in FX2 (DT bleibt) [H].
- **VEL CURVE** [A]: `v' = v^γ`, γ = 2,2 / 1,8 / 1,4 / 1,0 / 0,7 für 1–5; MAX = immer voll [H]. **AT CURVE** [A]: γ = 2,0 / 1,6 / 1,3 / 1,0 / 0,8 für 1–5;
  6 = `min(1, 3a)` („leicht, schnell voll“ [H]); NONE = aus [H].
- Nicht übernommen: LOCAL KB, MIDI CH, RANGE BEEP.

### 1.11 Spielweisen und Stimmen
**12 Stimmen je Spur** [X F10]. Gehaltene Tasten haben Vorrang [H]. Geklaut wird zuerst die am längsten losgelassene Stimme, dann die älteste gehaltene [A].
Klau mit 3-ms-Blende (Regel 13; am Gerät klickt es dort [H]). „Legato“ = neue Taste, während eine andere gehalten wird [A].
| MODE | Stimmen | ADSR bei neuer Note | Portamento | Besonderheit |
|---|---|---|---|---|
| POLY | 12 | kein Neustart [H] (läuft vom aktuellen Pegel) | Poly-Portamento [H] | – |
| POLY RETRIG | 12 | Neustart [H] | wie POLY | – |
| MONO | 1 | kein Neustart [H] | immer [H] | letzte Note [H]; Rückkehr zur gehaltenen Taste [A] |
| MONO PORTA | 1 | Neustart ohne Legato [A] | legato [H] | – |
| MONO RETRIG | 1 | immer [H] | legato [H] | – |
| SLUR | 12 | wie POLY | gebundene Töne [H] | Legato 1–2 HT neben einer gehaltenen Taste: Diese Stimme gleitet hin [H]; die alte Taste gilt als losgelassen [A] |
| PARA | 12 Tonhöhen, ein ADSR-Satz | erste Note startet, weitere setzen ein [H] | ab 2 Tasten [H] | Δ je Note [H]; einzeln losgelassene Stimme blendet mit R aus [A] |
| PARA SLUR | | PARA + SLUR [H] | | |
| MOLY | 12 | staccato neue Stimme, legato Mono-Verhalten [H] | legato [H] | – |
- Halte-Pedal: kein Bedienelement (F9 → Option O-4). Der Kern kennt das Halten bereits für spätere MIDI-Eingabe [A].

### 1.12 Effekte FX1 / FX2 (je Programm)
Typen [H Familien] und Bauweise [A]:
- **CH1–14** Chorus: 2 Leitungen, 7 ms, L/R 90°. (Hz; ms): 1 (0,15; 2,5) · 2 (0,25; 3,0) · 3 (0,35; 1,5) · 4 (0,5; 2,5) · 5 (0,7; 1,2) · 6 (0,9; 2,0) · 7 (1,2; 1,0) ·
  8 (1,5; 1,8) · 9 (2,0; 0,8) · 10 (2,5; 1,4) · 11 (3,2; 0,6) · 12 (4,0; 1,0) · 13 (5,5; 0,5) · 14 (7,0; 0,8).
- **CH15/16** phaserartig: 6 Allpässe, 200 Hz – 3 kHz, intern 50/50; 0,25 Hz / Rk 0,3 bzw. 0,8 Hz / 0,5.
- **DT1–16** (FX1 und FX2): Antrieb +2·n dB, ungerade n symmetrisch, gerade n mit Versatz 0,25; Tiefpass `12 kHz · 0,8^⌊(n−1)/2⌋`; Pegelausgleich `1/(1 + 0,1·n)`; ADAA.
- **BC1–16:** (Bits; Rate) für 1–8: (12; fs/2) (10; fs/3) (9; fs/4) (8; fs/6) (7; fs/8) (6; 11 025) (5; 8 000) (4; 5 512); gerade n mit Tiefpass 0,45·Rate;
  9–16 wie n − 8 mit Rate × (1 ± 0,5 · Dreieck 0,3 Hz).
- **RM1–16:** Sinusträger `0,4 Hz · 2^(0,84·(n−1))` (0,4 Hz … 2,5 kHz), rechts 90° versetzt.
- **DL1–16** (FX2): `800 ms · (1/800)^((n−1)/15)` (800 · 512 · 328 · 210 · 134 · 86 · 55 · 35 · 22,6 · 14,5 · 9,3 · 5,9 · 3,8 · 2,4 · 1,6 · 1,0 ms);
  Rückkopplung 0,45 / 0,6 / 0,75 (n ≤ 6 / 7–10 / 11–16), Tiefpass 5 kHz im Rückweg n ≤ 6, Ping-Pong n ≤ 4.
- **SYNC [Z F7]:** zusätzlicher Parameter nach 2TYP, OFF (Standard, feste Zeiten wie am Gerät) │ ON. Bei ON nehmen **DL1–DL8** den nächstgelegenen
  Notenwert im Song-Tempo (logarithmisch nächster aus 1/1, 1/2., 1/2, 1/4., 1/4, 1/8., 1/8, 1/16., 1/16, 1/32., 1/32, 1/64); bei 120 BPM:
  DL1 → 1/4. (750 ms), DL2 → 1/4, DL3 → 1/8., DL4 → 1/16., DL5 → 1/16, DL6 → 1/32., DL7 → 1/32, DL8 → 1/64. DL9–DL16 bleiben fest (sie sind
  Kammfilter, ihre Zeit ist ihre Tonhöhe). Tempowechsel: Lesezeiger gleitet 50 ms.
- **RV1–16** (FX2): Dattorro wie `dirigent-hall`, RT60 `8 s · (0,3/8)^((n−1)/15)`.
- BAL wie §1.3, Typwechsel 30-ms-Blende, FX schlafen bei Stille.

### 1.13 Schicht und Split
[H] Ein zweites Programm klingt mit (Layer) oder rechts vom Splitpunkt (Split). SEMI, BAL, PAN und TUNE gelten für beide und gehören zum Klang.
Effekt-Typen kommen vom Grund- bzw. linken Programm, die FX1-Anteile sind je Programm frei. Der Arp wirkt nur auf das Grund- bzw. linke Programm.
In der App [A]: Programm B ist eine **eingebettete Kopie**, die beim Wählen mit Value aus dem Werk- bzw. Nutzerplatz kopiert wird. FX1 läuft je Programm,
FX2 einmal (aus A). LFOs je Programm. 12 Stimmen gesamt, Layer braucht 2 je Note.

### 1.14 Arpeggiator
- [H] 26 Muster in Spielreihenfolge (1OCT, DBL, 2OCT, ALT, 3OCT, PONG, PON2, PON3, RND, RND2, RND3; fest von der letzten Taste: MIN, MAJ, SUS2, SUS4, 7TH, MIN2,
  MAJ2, SU22, SU42, 7TH2, 1O, 2O, 3O, 5TH, 5TH2), SPD 20–400 BPM (Sechzehntel), HOLD, TRIG (aus = eine Note, nur ihre Tonhöhe springt).
- Muster-Bauweise [A] (Tasten in Spielreihenfolge t1 … tn): 1OCT = t1…tn wiederholt · DBL = t1 t1 t2 t2 … · 2OCT/3OCT = Durchlauf, dann +12 (und +24) ·
  ALT = t1 t1+12 t2 t2+12 … · PONG = t1…tn…t2 (Ränder einmal) · PON2/PON3 = PONG über 2/3 Oktaven · RND/RND2/RND3 = Zufall über 1/2/3 Oktaven (Saat aus
  Projekt-id + Spur-uid + Schrittzähler). Fest (Halbtöne über der letzten Taste, aufsteigend wiederholt): MIN 0 3 7 · MAJ 0 4 7 · SUS2 0 2 7 · SUS4 0 5 7 ·
  7TH 0 4 7 10 · MIN2/MAJ2/SU22/SU42/7TH2 = dieselben + 12 · 1O 0 · 2O 0 12 · 3O 0 12 24 · 5TH 0 7 · 5TH2 0 7 12 19.
- **SPD wie am Gerät [H]:** Ohne äußere Clock läuft der Arp frei in Sechzehnteln bei SPD-BPM; mit Clock legt SPD die Teilung fest. In der App
  [A]: **Transport steht** → frei mit SPD (Raster ab der ersten Taste). **Transport läuft** → das Song-Tempo ist die Clock; die Teilung ist der nächstgelegene Wert
  (logarithmisch) des Verhältnisses SPD/Song-BPM aus {0,25 → 1/4 · 0,5 → 1/8 · 0,75 → 1/8T · 1 → 1/16 · 1,5 → 1/16T · 2 → 1/32}. Bei 120 BPM: SPD 120 → 1/16,
  60 → 1/8, 90 → 1/8T, 240 → 1/32. Swing folgt dem Song.
- HOLD beenden wie am Gerät [H]: Klang wechseln oder die **Arp-Taste 1 s halten**; HOLD OFF beendet ebenfalls.
- Technik: `ARPC` aus MK5 (gemeinsamer Block, §5.2).

### 1.15 Sequencer: was die App ersetzt
| Gerät [H] | App | Entscheidung |
|---|---|---|
| Looper: eine Spur, beliebig lang, Start mit erster Note, Play setzt die Schleife | ●, FANG, Clips, Szenen, Teile, Song | kein Looper; Seq-Taste + « » bedienen ● und ▶/■ der App (§3.3) |
| nimmt Noten, Bend, Rad, Druck, Pedal auf | ● nimmt Noten auf | **Bend, Rad und Druck werden fest im Clip gespeichert [Z F9]** (§5.4); Pedal nicht (O-4) |
| Arp mit Clock-Teilung | `ARPC` im Song-Raster | §1.14 |
| 4 Teile über MIDI | bis 8 Spuren | jede Bit-Mask-Spur = ein Teil |
| – | V5 P-Locks, V6a Morph geplant | Pfad-Schlüssel `bm.a.o1.m` usw. vorbereitet, hier nichts gebaut |

### 1.16 Nicht übernommen
Hardware (Kalibrierung, Werks-Reset, Firmware, Pedal-Polarität), MIDI-Kanäle/CC/SysEx/Program Change, LOCAL KB, MIDI CH, RANGE BEEP, Verwaltungs-Software,
gemeinsamer Stimmenvorrat über alle Teile, die Werks-Klänge (eigene Startklänge §4), die Rückseite des Geräts, Hersteller- und Modellname.

### 1.17 Bedienfunktionen → §3 (das Bedienfeld bildet das Gerät 1:1 nach)

### 1.18 Wo die App vom Gerät abweicht (Regeln und App-Rahmen)
| Punkt | Gerät | App | Grund |
|---|---|---|---|
| Drehen an MASK / Bedien-Änderungen | sofort | MASK 10-ms-Blende; andere Werte ab dem nächsten Steuerschritt | Regel 12 |
| Stimmenklau | kann klicken [H] | 3-ms-Blende | Regel 13 |
| Phase beim Tastendruck | – | φ = 0 (Key-Reset) | K1 [X] |
| LFO-/Zufalls-Start | frei | Phase 0 bei ▶ | gleicher Song = gleicher Klang (Regel 28, Video, Einfrieren) |
| Klangwechsel verwirft Änderungen [H] | ja | Autosave + Undo; Compare = A/B der App | App-Rahmen |
| Global-Werte | für das ganze Gerät | je Klang | jede Spur ist ein eigenes Gerät |
| Stimmen | 12 für alle Teile | 12 je Spur | App-Rahmen |
| Namen eingeben | Zeichen für Zeichen mit Value [H] | Namensfeld der App (wie MS 2000, MK8) | Bedienbarkeit am iPhone |
| Zusätze | – | Druck-Geste, 4 Ziel-Plätze, SYNC, Kurven im Clip | **[Z]** Xander F3, F7, F8, F9 |

### 1.19 Optionen (nicht gebaut, nur auf Xanders Wunsch)
- **O-1 Masken-Hilfe (Vorschlag):** Zweitansicht per langem Druck auf die Anzeige: Karte 16 × 32 (Zeile = obere Bits, Spalte = untere 4 Bits, Spalte 15 =
  „rund“) und 9 Bit-Schalter. Hilft, unter 512 Masken zu finden, ist aber nicht Teil des Geräts.
- **O-2 Zweites Filter (EXTRA, Fw 3.4):** öffentlich bekannt, Bauweise nicht.
- **O-3 Schleifen der Δ-Hüllkurven (Fw 3.4).**
- **O-4 HALTEN-/Pedal-Taste** (Xander unsicher, F9).
- **O-5 SAUBER-Schalter:** exakte bandbegrenzte Tabellen (Bauweise nach §10.1 der Haupt-Spec, Spektrum mit `fastbuild.mjs`), ≈ ¼ der CPU, falls das iPhone
  den Geräteklang nicht schafft (§2.5). Nur als Schalter, nie automatisch (K1).
- **O-6 Kurven** auch für MS 2000 und im MIDI-Export.

---

## 2. DSP im AudioWorklet (Geräteklang als Standard [X F6])

### 2.1 Prozessor und Nachrichten
- Eigener Prozessor **`'synq-bm'`** (ASCII, Blob/data-URL), Stereo-Ausgang, ein Knoten je Bit-Mask-Spur; `dirigent-analog` byte-gleich.
- Haupt-Faden → Prozessor: `{t:'prog', ab, p}` · `{t:'set', ab, k, v}` (≤ 60/s je Geste) · `{t:'ly', p}` · `{t:'gl', p}` · `{t:'on', list:[{n, v, at, d}]}` ·
  `{t:'off', list:[{n, at}]}` · `{t:'ctl', list:[{k:'bd'|'mw'|'at', v, at}]}` (live und aus Clip-Kurven, §5.4) · `{t:'tr', run, at}` · `{t:'stop', at, tau}` ·
  `{t:'panic'}` · `{t:'reset'}` · `{t:'tap', on}` (Test: Hüllkurven-/Masken-Abgriff).
- Prozessor → Haupt-Faden: `{t:'load', v}` (1/s), `{t:'late', n}`, `{t:'end', n}`, `{t:'tap', …}` (nur Test).
- Keine Tabellen, kein Worker: Der Prozessor braucht nur eine Sinustabelle (32 768 Werte, 128 KB, beim Laden des Moduls gebaut).

### 2.2 Oszillator 16-fach und Dezimierer
- **Oszillator [A]:** Phase als 32-Bit-Ganzzahl je Oszillator, Schritt `round(f/(16·fs) · 2^32)`; b = Stellen von M (S = 2^b);
  `p = phase >>> (32 − b)`, Bruchteil = 10 Bit `(phase << b) >>> 22`, `m = p & M`, `y = m < 32 ? SIN[(m << 10) | bruch] : 0`; Sinustabelle eine Periode
  über 32 Schritte × 1024, ohne Interpolation (Fehler ≤ −70 dB). **Sonderfall b = 0** (M = 0) ausprogrammieren (JS schiebt um 32 nicht).
- **Rauschen** in derselben 16-fachen Rate (S&H, §1.5). Je Stimme wird `osc1·g1 + osc2·g2 + rausch·g3` (Pegel aus den stufigen Hüllkurven) gebildet und
  **einmal je Stimme** dezimiert.
- **Dezimierer [A], Bauweise wie Prototyp `S/bm-tools/bench16d.mjs`:** CIC 5. Ordnung, R = 8 (16-fach → 2-fach), Ganzzahl mit Überlauf-Arithmetik
  (Eingang × 2^13), dann Halbband-FIR mit 23 Taps (2-fach → 1-fach), danach Ausgleich des CIC-Abfalls (gemessen −2,1 dB bei 16 kHz) auf ±0,5 dB bis 16 kHz.
  Bei 44,1 kHz gleicher Aufbau. CIC-Zustände werden genullt, wenn eine Stimme frei wird (Bitgleichheit).
- **Gemessen** (Prototyp, Node, geteilte Xeon-Maschine; `ref16.mjs`, `qual16d.mjs`): Faltung im Bereich 0–16 kHz wie bei idealer 16-facher Rechnung, ±1,5 dB.
  Werte bei Säge 7 / Rechteck 8 / Maske 78 / Maske 255: C4 −49,6 / −50,2 / −51,5 / −92,8 dB; C6 −43,4 / −43,9 / −44,8 / −78,6 dB; C7 −40,2 / −40,8 / −42,8 / −67,3 dB.
  Das ist die hörbare digitale Körnung, die gewollt ist. Zum Vergleich: ohne Überabtastung wären es −14 … −24 dB.
  Was der Dezimierer selbst zusätzlich faltet, liegt zwischen 16 und 20 kHz.
- DC-Sperre je Stimme nach dem Dezimierer: Hochpass erster Ordnung, 8 Hz (die Messbilder des Handbuchs zeigen so eine Kopplung).

### 2.3 Stimme
Dezimiert → DC-Sperre → SVF (App-Rate, Koeffizienten stufig je Steuerschritt) → VOL · Anschlag → Pan. Keine Allokation in `process()`; 12 Stimmen × 2 Programme
im Konstruktor. Denormal-Grenze 1e-15, Endlichkeits-Prüfung je Block (Stimme mit NaN wird stumm und neu gesetzt).

### 2.4 Steuertakt und Körnung [A nach H]
- Steuertakt **1 ms** (48 kHz: 48 Samples, 44,1 kHz: 44 Samples). Je Schritt werden ADSR, Δ, LFOs, Mod-Summen, Tonhöhen, Masken und Filterwerte einmal
  gerechnet und **stufig** angewandt.
- ADSR-Ausgang auf 10 Bit gerundet (1/1024, linear). Dadurch klingen schnelle Hüllkurven und LFO-Tremolo auf reinen Tönen leicht geräuschhaft, wie am Gerät [H].
  Ein Tiefpass glättet das, wie im Handbuch empfohlen.
- Bedien-Änderungen: stetige Werte laufen in 5 ms (in 1-ms-Stufen) zum Ziel, MASK mit 10-ms-Blende (Regel 12).

### 2.5 CPU-Rahmen und Begrenzer
| Teil (Xeon, M-CPU) | höchstens |
|---|---|
| Oszillator-Teil einer Stimme (2 Masken-Osz. + Rauschen 16-fach, Dezimierer) | **1,5 × VA-Stimme** (Prototyp gemessen 0,8–1,5 % auf geteilter Maschine; VA-Stimme ≈ 1,1 %) |
| ganze Stimme | 1,8 × VA-Stimme (≈ 2 %) |
| 12 Stimmen | ≤ 22 % |
| FX1 / FX2 (RV) | 0,4 % / 1,0 % |
| schlimmster Fall (Layer, 12 Stimmen, 2 × FX1, RV) | ≤ 26 % |
| typischer Akkord (6 Stimmen, CH + RV) | ≤ 13 % |
| Leerlauf | ≤ 0,1 % |
- **Sparen ohne Klangänderung:** Oszillatoren mit L = 0 oder Hülle unter −100 dB rechnen nicht; das Rauschen nur bei L > 0; freie Stimmen schlafen.
- **iPhone-Risiko:** Faktor unbelegt (1,5–2,5×). Eine voll gespielte 12-Stimmen-Spur kann 35–65 % des Audio-Fadens brauchen; mehrere volle Bit-Mask-Spuren
  gleichzeitig gehen dann nicht. **Tor nach BM1 + BM6:** Xander startet die `perfProbe` mit Bit Mask am iPhone. Liegt eine Spur mit 12 Stimmen über 50 %,
  meldet der Dirigent das, bevor BM2 weiterläuft. Der Klang wird dabei nicht still geändert (O-5 nur auf Wunsch).
- **Begrenzer (K1 [X]):** Stufe 1 → höchstens 8 Stimmen, Stufe 2 → 6; neue Noten klauen die leiseste; klingende Stimmen bleiben unverändert; nie offline.

### 2.6 Bitgleichheit
Feste Saaten (Rauschen, RAND-LFO, RND-Arp, RAND-Init); LFO-Phase 0 bei ▶/`reset`; CIC-Zustände genullt. Zwei Offline-Render nach `reset` sind bitgleich.

---

## 3. Bedienfeld (wie das Gerät, eigene Zeichnung [X F1])

### 3.1 Aufbau nach der Bedienfeld-Zeichnung im Handbuch [H Anordnung, A Maße]
```
Reihe A:   (Vol)   [«][»] Octave    [Voice][Layer][Split][Init][Write][Global]    ▐ 8.8.8.8 ▐    [«][»] Param
           Seq ── ●Rec ── ▶/■   (Beschriftung über/unter den Octave-Tasten, mit Linie zur Seq/Env-Taste)
           Env ── Osc1 ── Osc2 ── Noise ── Filter   (Linie über den ersten vier Tasten von Reihe B)
Reihe B:   [Seq/Env]   [Osc1][Osc2][Noise][Filter][LFO1][LFO2][FX][Arp][Pitch][Mod][General]    Value (◯)   [Compare]
rechts:    Masken-Übersicht wie auf dem Gerät: 7 · 8 · 15 · 28 · 31 · 47 / 56 · 63 · 72 · 79 · 95 · 120 (eigene Linienzeichnung aus der Regel §1.2)
links neben der Tastatur: BEND- und MOD-Rad [H]
```
- 23 quadratische Tasten mit Leuchtfläche, 2 runde Drehgeber (Vol, Value), 4-stellige rote 7-Segment-Anzeige [H/Ö].
- **Material [A, Ö]:** helles, weiß lackiertes Blech, schwarze Beschriftung und Linien, schwarze Anzeige mit roten Segmenten, Tasten hell mit
  warmweiß leuchtender Fläche. Kein Logo, kein Name. Schickt Xander Fotos, werden die Farben danach angepasst (wie G-MKP8 beim MS 2000).
- **LEDs [H]:** Die Modus-Taste leuchtet. Layer bzw. Split blinkt, wenn aktiv, aber nicht angezeigt. Arp blinkt bei laufendem Arp. Seq/Env und Compare
  leuchten als Schalter. Bei Mehrfach-Bearbeitung leuchten mehrere Tasten.
- **Anzeige [H, A]:** eigene SVG-Segmente (wie MK1). Parameternamen bis 4 Zeichen stehen direkt, längere laufen einmal mit 6 Zeichen/s durch, danach
  steht der Wert. Masken dreistellig („078“), Klangplätze „P00“ / „U12“, „COMP“ im Vergleich, „DONE“ nach dem Sichern [H].
- **App-LCD-Zeile wie beim MS 2000 [X F2]:** Sektion · Gerätename des Parameters · Gerätewert · Klartext (z. B. „OSC1 · MASK · 078 · Maske 78“,
  „FILTER · CUTF · 37 · 264 Hz“). Darüber hinaus keine Zusatz-Erklärungen.
- Darüber bleibt der Kopf der App (✕, Spurname, Engine-Knöpfe/Chip mit `BM_NAME`, A/B, ↶ ↷).

### 3.2 Formate (Trefferzone 44 × 44, gezeichnete Taste 40 × 40, die Lücke liegt in der Trefferzone)
| Format | Anordnung |
|---|---|
| quer W 926×428 (Xanders iPhone, Safe-Area 832 px nutzbar) · L1 844×390 (750 px) | **ganzes Feld wie das Gerät** in zwei Reihen; Reihe B ≈ 44 + 11 × 44 + Value 56 + Compare 44 + Lücken ≈ 650 px; Masken-Übersicht rechts (≈ 100 px); Höhe ≈ 2 × (44 + 14 Beschriftung) + Linien ≈ 140 px |
| quer L2 667×375 | wie oben, Lücken 2 px; Masken-Übersicht entfällt (kein Platz) |
| hoch 428×926 (Xander) · P1 390×844 · P2 375×667 · P3 320×568 | **gefaltet:** jede Reihe in der Mitte geteilt, die rechte Hälfte darunter, Reihenfolge bleibt: A1 Vol · « » · Voice · Layer · Split │ A2 Init · Write · Global · Anzeige (2 Zonen) · « » │ B1 Seq/Env · Osc1 · Osc2 · Noise · Filter · LFO1 · LFO2 │ B2 FX · Arp · Pitch · Mod · General · Value · Compare; höchstens 7 Zonen je Zeile = 308 px (P3: Rand 6 px); Seq-/Env-Linien als kurze Beschriftung über den betroffenen Tasten; Masken-Übersicht als schmale fünfte Zeile in 428×926 und P1 (12 Symbole à 26 px), in P2/P3 entfällt sie; Höhe ≈ 4 × 58 (+ 40) px |
- Kein Zoom nötig (anders als beim MS 2000): Jedes Bedienelement trifft in jeder Ansicht ≥ 44 px. Drehen des iPhones wechselt zwischen gefaltet und ganz,
  ohne Layout-Sprung innerhalb einer Lage. Kein waagrechtes Scrollen. Räder links in `#kbArea` (MK1-Bauteil).

### 3.3 Bedienung wie am Gerät [H] mit Touch-Gesten [A]
- **Modus-Taste** tippen → Modus und erster Parameter; « Param » oder **dieselbe Taste erneut** → nächster Parameter; Value ändert; hat ein Modus nur
  einen Parameter, ändern « Param » den Wert [H].
- **Value:** kreisend oder senkrecht ziehen; geschwindigkeitsabhängig (langsam 1 Schritt je 8 px, schnell bis × 8) [H: schnell drehen = schneller];
  seitlich weg = Fein-Modus, Doppeltipp = INIT-Wert [A, App-Standard]. Value bleibt Echtzeit-Regler des gewählten Parameters [H].
- **Vol** = Lautstärke der Spur [A].
- **Seq/Env** (ein Schalter) [H]: an → « Octave » werden **●** (Aufnahme der App für diese Spur, gleiche Regeln wie ● im App-Kopf) und **▶/■** (Transport),
  und Osc1/Osc2/Noise/Filter öffnen ihre Hüllkurve (L A D S R LOOP). Aus → Octave ±2 Oktaven [H] (Tastatur-Oktave der Spur), Osc-Tasten zeigen die Oszillator-Werte.
- **Mehrfach-Bearbeitung [H/Ö]:** eine Taste halten und eine zweite tippen → beide leuchten, jede Änderung gilt für beide (Env an: Hüllkurven; Env aus:
  Osc1 + Osc2 = beide Oszillatoren). Ein Undo je Geste; ein Tipp auf eine einzelne Taste beendet das.
- **Voice** [H]: Value nach rechts P00, P01 … (eigene Startklänge §4), nach links U00, U01 … (eigene gesicherte Bit-Mask-Klänge der Bibliothek in
  Sicher-Reihenfolge). Wechsel = Laden (ein Undo), gehaltene Tasten klingen neu an [H].
- **Layer / Split** [H]: Taste → Anzeige zeigt den zweiten Klang, Value wählt (Kopie nach B); « Param » → SEMI, BAL, PAN, TUNE. Voice zweimal = aus,
  einmal = Grundklang ansehen (Layer/Split blinkt). Splitpunkt: **Split halten + Taste auf der App-Tastatur** [H].
- **Init** [H]: einmal → Wahl 1OSC / 2OSC / VEL / RAND (Value oder « Param »), Init bestätigt; zweimal = einfache Säge. Ein Undo.
- **Write** [H]: Platz U00 … wählen (Value / « Param »), Write → Name im Namensfeld der App (wie MS 2000) → Write → „DONE“. Dreimal Write = gleicher Platz [H].
- **Global** [H]: Parameter §1.10. **Compare** [H]: „COMP“, spielt den gespeicherten Stand (A/B-Mechanik der App), Compare oder Voice beendet.
- **Arp** 1 s halten = gehaltenen Arp stoppen [H].
- Parameterfolge je Modus (Gerätenamen, [H] außer [Z]):
  Osc1/Osc2: MASK SEMI TUNE START SPD · Env: L A D S R LOOP · Noise: FREQ · Filter: CUTF RESO MODE TRK · LFO1/LFO2: AMT SPD DEST WAVE DLAY DCAY
  (+ DEST2 AMT2 … [Z]) · FX: 1BAL 1TYP 2BAL 2TYP (+ SYNC [Z]) · Arp: TYPE SPD HOLD TRIG · Pitch: START SPD END · Mod: V-DEST V-AMT M-DEST M-AMT AT-DEST AT-AMT
  (+ Plätze 2–4 [Z]) · General: MODE VOL SEMI PORT PANS RATE · Global: TEMP SEMI TUNE VEL CURVE AT CURVE PITCH BEND TIME FX · Layer/Split: SEMI BAL PAN TUNE.

### 3.4 Tastatur: Räder und Druck [Z F3]
- BEND- und MOD-Rad (MK1-Bauteil) bei Bit-Mask-Spuren.
- **Druck:** Ein Finger auf einer gehaltenen Taste schiebt nach oben: 6 px tote Zone, danach 0 → 1 über 60 px, zurückschieben senkt. Die AT CURVE formt den Wert.
  Ein schmaler Balken auf der Taste zeigt ihn. Kanal-Druck wie am Gerät [H: Kanal-Aftertouch] = Höchstwert aller gehaltenen Tasten. Waagrechte Bewegung
  > 20 px folgt dem bisherigen Verhalten der Tastatur. Loslassen setzt den Druck dieser Taste auf 0. Druck wird bei ● in den Clip aufgenommen (§5.4).

---

## 4. Eigene Startklänge (P00–P39, keine Gerätedaten)

Regeln: keine Werks-Programme, Namen, Übersetzungen von Werksnamen, Künstlernamen oder Handbuch-Rezepte. Kurzschrift wie Rev. 1: `Maske/SEMI/TUNE`,
`Δ START@SPD`, Hülle `A·D·S·R`, Filter `CUTF RESO MODE TRK%`, Filter-Hk `L·A·D·S·R`, Tonh. `START@SPD`, LFO `Ziel WAVE AMT/SPD (DLAY)`, FX `Typ BAL`;
sonst INIT. Startwerte, nachstimmen per Messung.

| Nr. | Kat. | Name | Programm |
|---|---|---|---|
| P00 | Bass | Säge-Bass | MONO PORTA, PORT 3 · O1 7/0/0 · O2 8/−12/0 L70 · F 24 30 LP 40 · Hk 38·0·6·2·3 · Hülle 0·0·15·3 · V→F EG +40 · FX1 DT3 25 |
| P01 | Bass | Gummi-Bass | MONO RETRIG · O1 15/0/0 Δ −8@26 · O2 31/−12/0 L60 · F 55 20 LP · Hülle 0·7·9·3 · V→VOL +30 |
| P02 | Bass | Puls-Bass | MONO, PORT 2 · O1 56/−12/0 · O2 7/0/+6 L50 · F 30 40 LP 30 · Hk 30·0·5·1·3 |
| P03 | Bass | Summ-Bass | POLY RETRIG · O1 78/0/0 · O2 78/0/+7 L80 · F 35 25 LP · Hk 25·0·6·3·4 · FX1 CH5 30 |
| P04 | Bass | Digital-Bass | MONO RETRIG · O1 28/0/0 Δ +36@28 · O2 24/−12/0 L60 · F 70 0 · FX1 BC4 30 |
| P05 | Bass | Sub & Kante | O1 31/−12/0 L95 · O2 7/0/0 L55, Hülle 0·6·5·3 · F 48 15 LP 50 · Hk 20·0·5·0·3 · V→F EG +30 |
| P06 | Lead | Quadrat-Lead | MONO PORTA, PORT 4 · O1 8/0/−4 · O2 8/+12/+4 L60 · F 62 20 LP 60 · LFO1 FREQ SIN 5/50 (DLAY 8) · MW→LFO1 AMT +60 · FX2 DL5 22 |
| P07 | Lead | Spiegel-Lead | MONO · O1 29/0/0 · O2 30/+12/+3 L50 · F 80 10 · LFO1 FREQ SIN 4/48 (DLAY 9) · FX2 RV6 25 |
| P08 | Lead | Hohl-Lead | MONO PORTA · O1 24/0/0 · O2 20/0/+8 L70 · F 50 45 BP 70 · Hk 20·3·8·6·5 · AT→FLT +40 |
| P09 | Lead | Kreisch-Lead | MONO · O1 255/−36/0 · O2 7/0/+5 L60 · MW→O1 MASK −60 · AT→FX1 BAL +40 · FX1 DT10 40 |
| P10 | Lead | Sägen-Solo | MOLY, PORT 3 · O1 7/0/−6 · O2 7/0/+6 · F 58 30 LP 50 · Hk 18·2·7·7·4 · LFO1 FREQ SIN 4/52 (DLAY 9) · FX1 CH3 30 · FX2 DL4 20 |
| P11 | Pad | Weite Fläche | O1 7/0/−5 · O2 7/0/+5 L95 · Hülle 9·0·15·10 · F 55 10 LP 30 · FX1 CH2 50 · FX2 RV3 25 · PANS 8 |
| P12 | Pad | Masken-Wandel | PARA SLUR · O1 31/0/0 Δ −24@6 · O2 47/0/+4 L70 Δ +16@5 · Hülle 8·0·15·10 · LFO2 O1 MASK SIN 25/20 · FX2 RV2 30 |
| P13 | Pad | Hohl-Chor | O1 24/0/−3 · O2 15/+12/+3 L60 · F 52 35 BP 50 · Hülle 8·0·15·9 · LFO1 FILT SIN 12/26 · FX1 RM13 25 · FX2 RV4 30 |
| P14 | Pad | Nachtfläche | PARA · O1 7/0/−4 · O2 24/−12/+4 L70 · F 38 25 LP · Hk 35·10·11·6·10 · FX1 CH4 45 · FX2 RV2 35 |
| P15 | Pad | Glimmer | O1 63/−12/0 · O2 95/−24/+6 L60 · Hülle 7·0·15·10 · LFO2 MASK SIN 20/30 · FX1 CH6 40 · FX2 DL3 25 |
| P16 | Pad | Kerb-Fläche | O1 7/0/−4 · O2 8/0/+4 L80 · F 60 0 NOTCH 0 · LFO1 FILT SIN 25/20 · Hülle 9·0·15·10 · FX2 RV5 25 |
| P17 | Keys | Masken-Klavier | O1 31/0/0 Δ +40@30, Hülle 0·10·4·6 · O2 15/+12/0 L40, Hülle 0·8·0·5 · Tonh. +6@35 · V→VOL +50, V→MASK +20 · FX2 RV7 15 |
| P18 | Keys | Elektro-Tasten | O1 31/0/0, Hülle 0·11·3·6 · O2 30/+12/+3 L50, Hülle 0·7·0·5 · LFO1 VOL SIN 6/48 · FX1 CH3 30 |
| P19 | Keys | Clavi-Bit | POLY RETRIG · O1 56/−12/0, Hülle 0·8·0·3 · F 45 30 LP · Hk 30·0·5·0·3 · V→F EG +50 |
| P20 | Keys | Glocken-Piano | O1 29/0/0, Hülle 0·11·2·7 · O2 31/+12/0 L45 · V→MASK −12 · FX2 RV6 20 |
| P21 | Keys | Samt-Piano | O1 15/0/0 · O2 31/+12/+2 L45, Hülle 0·9·0·5 · F 60 · Tonh. +4@36 · LFO1 PAN SIN 30/45 · FX1 CH4 25 |
| P22 | Blech/Str. | Blech-Stoß | O1 7/0/−5 · O2 7/0/+5 · F 37 15 LP 40 · Hk 22·6·7·10·5 · Tonh. −8@15 · PANS 7 · V→F EG +35 |
| P23 | Blech/Str. | Streicher | PARA · O1 7/0/−6 · O2 24/0/+6 L70 · F 62 5 LP · Hülle 8·0·15·9 · FX1 CH2 55 · FX2 RV3 25 |
| P24 | Blech/Str. | Solo-Streich | MONO PORTA · O1 7/0/0 · F 56 15 · Hülle 6·0·15·7 · LFO1 FREQ SIN 5/51 (DLAY 9) · AT→LFO1 AMT +50, AT→FLT +25 |
| P25 | Blech/Str. | Blech-Satz | SLUR · O1 8/0/−3 · O2 24/0/+3 L80 · F 40 10 · Hk 24·5·8·8·5 · Tonh. −6@17 |
| P26 | Pluck | Holz-Pluck | O1 30/0/0 · O2 15/+19/0 L40 · F 45 20 BP 60 · Hülle 0·7·0·5 · V→F EG +40 |
| P27 | Pluck | Kristall-Pluck | O1 30/0/0 · O2 63/0/+4 L50 · Hülle 0·7·0·6 · FX2 DL6 25 (SYNC ON) |
| P28 | Pluck | Kalimba-Bit | O1 15/0/0 Δ −8@32 · Hülle 0·8·0·5 · Tonh. +3@38 · FX2 RV9 15 |
| P29 | Glocke | Glocke | O1 29/0/0, Hülle 0·13·0·11 · O2 30/+19/+4 L60, Hülle 0·11·0·9 · FX2 RV2 30 |
| P30 | Pluck | Harfen-Bit | O1 7/0/0 · O2 31/+12/0 L50 · F 50 10 · Hk 30·0·6·0·6 · Hülle 0·9·0·8 · PANS 10 |
| P31 | Orgel | Bit-Orgel | O1 31/0/0 · O2 95/−24/0 L60 · Rauschen 99 L10, Hülle 0·4·0·2 · Hülle 0·0·15·2 · FX1 CH16 60 |
| P32 | Orgel | Röhren-Orgel | O1 47/−12/0 · O2 79/−12/+2 L60 · F 70 · Hülle 1·0·15·3 · FX1 CH15 50 · FX2 RV5 20 |
| P33 | Chor | Vokal-Chor | O1 24/0/−4 · O2 24/0/+4 · F 55 60 BP 80 · LFO1 FILT SIN 10/22 · Hülle 7·0·15·9 · FX1 RM14 30 · FX2 RV3 30 |
| P34 | Chor | Luft-Chor | O1 15/0/0 · Rauschen 99 L45, Hülle 7·0·15·8 · F 58 50 BP 60 · Hülle 7·0·15·9 · FX2 RV2 35 |
| P35 | FX/Arp | Arp-Glitzer | ARP 2OCT, SPD 120, TRIG ON · O1 63/−12/0 · Hülle 0·7·0·5 · FX2 DL4 30 (SYNC ON) |
| P36 | FX/Arp | Sequenz-Puls | ARP 1OCT, SPD 120 · O1 8/0/0 · F 35 40 · Hk 30·0·5·0·3 · LFO1 O1 MASK SAWS 30/30 · FX2 DL5 25 |
| P37 | FX/Arp | Sturz-Ton | O1 7/0/0 · Tonh. +63@12 · F 70 · FX2 DL3 30 |
| P38 | FX/Arp | Rausch-Welle | O1 L0 · Rauschen 70 L90, Hülle 8·0·15·10 · F 45 60 BP · LFO1 N FREQ SIN 40/15 · LFO2 FILT SIN 30/12 · FX2 RV1 40 |
| P39 | FX/Arp | Rhythmus-Maske | O1 319/−48/0 (Spanne 512: vier kurze Sinus-Stöße, dann Pause; tief gespielt ein Rhythmus) · O2 287/−48/0 L40 · F 60 · FX2 DL7 20 |
- **INIT-Varianten** [H Namen]: 1OSC (= INIT: O1 7 L 99, sonst neutral, keine Route) · 2OSC (O1/O2 7, TUNE −3/+3) · VEL (2OSC + F 40 0 LP, Hk 35·0·8·5·4,
  V→F EG +60) · RAND (hörbar: ein Osz. L ≥ 60, CUTF ≥ 30, RESO ≤ 85 bei CUTF < 40).
- Daten ≤ 10 KB im Block `sq-bm-src`; in der Bibliothek schreibgeschützt („Werk“), Kategorien wie oben.

---

## 5. Einbindung

### 5.1 Daten (Format 5, zusätzlich)
```js
Sound.engine = 'bm'                                                   // ENGINE_LABEL.bm = BM_NAME
p.bm = { v:1,
  ly:{ md:'ein', semi:0, bal:50, pan:0, tune:0, sp:60 },              // 'ein'|'lay'|'spl'
  gl:{ tm:'et', st:0, tn:440, vc:4, ac:4, pb:2, tf:1 },               // GLOBAL je Klang: TEMP, SEMI, TUNE Hz, VEL/AT CURVE, PITCH BEND, TIME FX
  a: PROG, b: null }
PROG = {
  o1:{ m:7, st:0, tu:0, ds:0, dv:20, e:{l:99,a:0,d:0,s:15,r:2,lp:0} },
  o2:{ m:7, st:0, tu:0, ds:0, dv:20, e:{l:0, a:0,d:0,s:15,r:2,lp:0} },
  n: { fr:99,                        e:{l:0, a:0,d:0,s:15,r:2,lp:0} },
  f: { cu:99, re:0, md:'lp', tk:0,   e:{l:0, a:0,d:0,s:15,r:2,lp:0} },
  pe:{ ds:0, dv:20, de:0 },
  l1:{ sp:50, w:'sin', dl:0, dc:0, t:[['freq',0],['flt',0],['mask',0],['vol',0]] },   // 4 Plätze [Ziel, Menge 0–99]; Platz 1 = DEST/AMT
  l2:{ sp:50, w:'sin', dl:0, dc:0, t:[['flt',0],['freq',0],['mask',0],['vol',0]] },
  mo:{ v: [['flt',0],['feg',0],['vol',0],['mask',0]],                // je 4 Plätze [Ziel, Menge −99…99]
       mw:[['l1a',0],['flt',0],['mask',0],['vol',0]],
       at:[['flt',0],['l1a',0],['mask',0],['vol',0]] },
  fx:{ t1:'CH1', b1:0, t2:'RV1', b2:0, sy:0 },                        // sy = SYNC [Z F7]
  ar:{ t:'off', sp:120, ho:0, tr:1 },
  g: { mo:'poly', vo:80, st:0, po:0, ps:0, ra:0 } }                   // vo so, dass INIT = −18 LUFS
```
- Kennungen: MODE `poly mono slur mport para moly pslur mretrig pretrig` · LFO-Ziele `freq vol flt mask pan o1f o1v o1m o2f o2v o2m nf nv fx1t fx2t fx2b`
  · MW/AT-Ziele `flt l1a l1s l2a l2s vol mask freq o1v o1m o2v o2m nf nv fx1b fx2b` · V-Ziele `flt feg vol mask peg atk` · Wellen `sin sqr up down saws step
  hsin rand` · Arp `off 1oct dbl 2oct alt 3oct pong pon2 pon3 rnd rnd2 rnd3 min maj sus2 sus4 7th min2 maj2 su22 su42 7th2 1o 2o 3o 5th 5th2` · Stimmungen
  `et arab jmaj jmin mean pyta` · Layer `ein lay spl` · Maske 0–511.
- `SQBM.normBm`: klemmt und rundet, prüft Kennungen, Fehlendes = INIT, feste Reihenfolge, **unbekannte Schlüssel bleiben**. Nicht gespeichert:
  Modus-/Parameter-Wahl, Seq/Env-Stellung, Mehrfach-Bearbeitung, Compare.
- Ältere Versionen: MK0-Schutz (unbekannte Engine, Projekt gesperrt). `SOUNDS_FORMAT` bleibt 2, außer der Bau findet einen Grund.

### 5.2 Engine je Spur, Laden bei Bedarf, Host
- Engine-Wahl im Kopf: Knopf `BM_NAME` bzw. Eintrag im Engine-Chip (gemessen wie MK1). `setEngineOf` behält `p.bm`.
- **`BmHost`** mit denselben Aufrufen wie der Synth-Host; `spawnVoice`, `scheduleTrack`, `inputDown`, MELODIE, „Eine Skala“, ⇅, FANG, ● laufen darüber.
- Engine-Wechsel auf klingender Spur: 30-ms-Überblendung der Knoten, gehaltene Tasten wandern mit.
- **Laden bei Bedarf:** Modul `synq-bm` und Block `sq-bm-src` (Bedienfeld, Startklänge) erst bei Wahl oder beim Laden eines Projekts mit Bit-Mask-Klang
  (parallel, vor dem ersten ▶). Bis das Modul bereit ist (≤ 300 ms), werden Noten gepuffert.
- **Ohne AudioWorklet:** NativeVoice mit `PeriodicWave` aus den ersten 64 Teiltönen der Startmasken (genaue Formel §1.2, schneller Bau wie `fastbuild.mjs`)
  und Hinweis „`BM_NAME` braucht AudioWorklet – vereinfacht“.
- **Arp-Kern:** `ARPC`/`arpPattern` in einen gemeinsamen Block `sq-arp-src` (MS 2000 bitgleich, MK5-Abnahmen erneut).
- **Stopp/Panik:** ■ lässt Stimmen mit der τ der App ausklingen, FX-Fahnen klingen aus; ■■ und Panik: alles inkl. Fahnen ≤ 50 ms still.
- **Offline-Render** (Video VV, Einfrieren FR1): Modul im OfflineAudioContext, `reset` vor dem Render, gleiche Nachrichten.

### 5.3 Undo, Bibliothek, Hilfe, Test-API
- Undo über `soundEdit(t, …)`; `historyCheck()` = true. Bibliothek: Engine-Chip `BM_NAME`, Kategorien, Werk P00–P39 + Eigene (= U-Plätze der Voice-Taste).
- Hilfe (U-07-Stil) je eine Zeile: Masken, Seq/Env, Mehrfach-Bearbeitung, Layer/Split, Arp, Druck-Geste, Kurven im Clip, SYNC, Ziel-Plätze.
- Test-API: `bmGet`, `bmSet`, `bmRender`, `bmInfo`, `bmMask(m)` (Referenzwerte der Regel), `bmVoices`, `bmTap` (Hüllkurven-/Masken-Abgriff),
  `bmPanel()` (Modus, Parameter, Anzeige-Text, LEDs), `perfProbe` mit Bit Mask, `clipCurves(t, ort)`, `setClipCurves`.

### 5.4 Bend, Rad und Druck im Clip [Z F9]
**Grundsatz:** Die Kurven sind **ein Feld des Noten-Behälters** selbst, keine eigene Spur und keine Nebenliste. Wo der Behälter hingeht (Kopie, Einfügen,
Duplizieren, eigener Clip, Teil, Datei, Server), gehen sie mit.

- **Daten** (Format 5, zusätzlich, in jedem Noten-Behälter: Szenen-Clip `S.tracks[t].clips[s]`, eigener Clip `song.own[id]`, Song-Melodie `song.mel[t]`):
```js
cv: { bd:[[t, v], …],    // Bend   v −1 … +1 (= ± PITCH-BEND-Bereich), auf 1/4096 gerundet
      mw:[[t, v], …],    // Rad    v 0 … 1, auf 1/1024 gerundet
      at:[[t, v], …] }   // Druck  v 0 … 1, auf 1/1024 gerundet
// t in derselben Zeitbasis wie die Noten des Behälters (Schläge ab Behälter-Beginn), 0 ≤ t < Länge, aufsteigend.
// Jede vorhandene Kurve hat einen Punkt bei t = 0 (Startwert). Fehlt cv oder eine Kurve, gibt es keine.
```
- **Aufnahme:** ● (NOTEN- oder CLIPS-Ziel) und FANG auf einer Bit-Mask-Spur nehmen Bend, Rad und Druck mit den Noten in denselben Behälter auf.
  Abtastung ≤ 100 Punkte/s, danach ausgedünnt (Punkt entfällt, wenn die Gerade dazwischen um ≤ 0,002 bei Bend bzw. ≤ 0,004 sonst abweicht),
  höchstens 4096 Punkte je Kurve und Behälter. Ersetzen-Modus: Kurven im Bereich werden ersetzt. **Overdub = „Berühren“:** Nur in den Zeitspannen, in denen
  ein Regler bewegt wurde (± 20 ms), ersetzen neue Punkte die alten; sonst bleiben die alten. Eine Aufnahme ist **ein** Undo (mit den Noten).
- **Wiedergabe:** Der Planer schickt die Punkte des Planungsfensters als zeitgestempelte `ctl`-Ereignisse, wie die Noten. Die Werte gelten stufig, die Engine
  glättet 10 ms (wie die Räder). An jedem Behälter- bzw. Schleifen-Beginn gilt der Startwert. Endet der Behälter (Szenen-/Teilwechsel, ■), kehren
  Bend → 0, Druck → 0 und Rad → aktuelle Radstellung zurück (10 ms). Berührt der Finger live ein Rad oder drückt eine Taste, gewinnt die Live-Eingabe für
  diesen Regler, solange sie dauert. Danach folgt wieder die Kurve ab ihrem nächsten Punkt.
- **Bearbeiten:** Zeit-Aktionen am Behälter nehmen die Kurven mit (verschieben, kürzen, teilen, Länge verdoppeln, rückwärts, zusammenfassen).
  Tonhöhen-Aktionen (Transponieren, Spiegeln oben/unten, „Eine Skala“, ⇅) lassen sie unverändert. Es gibt keinen Kurven-Editor.
- **Kurven löschen:** Im ⋯-Menü eines Clips steht „Kurven löschen (Bend · Rad · Druck)“, **nur** wenn der Clip Kurven hat. Löscht `cv` ganz, ein Undo.
- **Kopieren/Einfügen/Duplizieren:** Alle Wege kopieren den ganzen Behälter samt `cv` als tiefe Kopie (Clip kopieren/einfügen, Szene duplizieren,
  `makeOwn`, Teil übernehmen, FANG übernehmen, Projekt-Kopie, Datei, Server). Kein Weg kopiert Noten ohne `cv`.
- **Speichern/Laden:** Die Normalisierer (Clip, `ownNorm`, Song-Melodie) prüfen `cv`: sortieren, Grenzen klemmen, NaN entfernen, höchstens 4096 Punkte,
  Startpunkt ergänzen. Speichern → Laden deep-equal. Ältere Versionen: Projekte mit Bit Mask sind gesperrt (MK0). Ein Projekt mit Kurven ohne
  Bit-Mask-Klang kann dort `cv` verlieren; das Hinweisband „neuere Version“ (VO-R1) warnt.
- **Andere Engines:** Kurven bleiben in den Daten und werden ignoriert (Klang bitgleich). MS 2000 und MIDI-Export = Option O-6.

---

## 6. Pakete

Zweige (Regel 29): **A** `bm-br-K` (Klang): BM1 → BM2 → BM3 → BM4 · **B** `bm-br-U` (Oberfläche): BM6 (Platzhalter-Prozessor spielt nur Maske 31 gegen §2.1)
→ BM5 · **C** `bm-br-C` (Clips): BM8 (gegen `BmHost.ctl` mit Platzhalter), danach BM7. Zusammenführung: BM1 + BM6 → **Tor iPhone (§2.5)** → BM2 → BM5 →
BM8 → BM3 → BM4 → BM7. Schnittstellen (§2.1, §5.1, §5.4) sind hier festgelegt. Jede Stufe mit Changelog, Snapshot, „Bitte prüfen“-Liste.
Der gestoppte Klang-Helfer startet auf Zweig A mit BM1 dieser Rev. 2 neu.

### BM1 — Masken-Oszillator 16-fach, Dezimierer, Körnungs-Takt
**Umfang.** §1.2 (9 Bit), §1.4, §1.5, §2.1–2.4, §2.6, Key-Reset, DC-Sperre, Steuertakt. **Dauer** 9–11 h · **Budget** +12 KB.
- [ ] BM1-01 **Regel:** Das 16-fach-Signal (Test-Abgriff vor dem Dezimierer) entspricht der Formel §1.2 für alle 512 Masken auf ≤ 2·10⁻⁴ je Abtastwert (Sinustabelle).
- [ ] BM1-02 **Anker** (M-SPEKTRUM, C2, Abstand zur Referenz `maskrule.mjs`): 31 THD ≤ −60 dB · 7 Teiltöne 2–8 ± 0,5 dB · 8 gerade Teiltöne ≤ −45 dB, 3. −9,5 ± 0,5 dB ·
  24/25 3. −9,7/−10,0 ± 0,5 dB · 30 k15/k17 −24,1 ± 0,5 dB · 63/95/255 stärkster Teilton 2/4/7.
- [ ] BM1-03 **Schwerpunkt-Regel** (Formel-Ebene): 32/32 Masken 16k−1 lokale Minima, Rang-Korrelation in den Blöcken 1–31 ≤ −0,95.
- [ ] BM1-04 **Periode:** alle 512 Masken auf A4 → Periode 1/440 s (M-PERIODE ± 0,5 ct).
- [ ] BM1-05 **Gerätekörnung:** M-ALIAS (0–16 kHz) der Masken 7, 8, 78, 255, 511 auf C4, C6, C7 bei 48 und 44,1 kHz = ideale 16-fach-Referenz (`ref16.mjs`) ± 2 dB.
- [ ] BM1-06 **Dezimierer:** Durchlass ± 0,5 dB bis 16 kHz; Sinus-Prüftöne 32–384 kHz im 16-fach-Bereich erscheinen in 0–16 kHz ≤ −70 dB.
- [ ] BM1-07 **Maskenwechsel:** durch Modulation ab dem nächsten Steuerschritt (≤ 1 ms + 1 Sample), phasenstetig; durch Drehen an MASK 10-ms-Blende, M-KLICK ≤ 6 dB.
- [ ] BM1-08 **Key-Reset (K1):** freie Stimme beginnt bei |y| ≤ 0,02; 20 Noten O1 = O2 → Pegel je Note ± 0,1 dB gleich.
- [ ] BM1-09 **Rauschen:** FREQ 99 flach ± 1 dB (Terzen 100 Hz – 16 kHz); FREQ 50 → Halte-Rate ± 2 %.
- [ ] BM1-10 **Steuertakt:** `bmTap` zeigt Stufen alle 48 (44) Samples, ADSR-Werte auf Vielfachen von 1/1024; A/D/R = 0 → Sprung im nächsten Schritt.
- [ ] BM1-11 **DC-Sperre** 8 Hz ± 10 %; Maske 15 gehalten → Gleichanteil ≤ 0,005 nach 200 ms.
- [ ] BM1-12 **Bitgleich:** zwei Offline-Render nach `reset` M-NULL = −∞ (48 und 44,1 kHz).
- [ ] BM1-13 **CPU:** Oszillator-Teil einer Stimme ≤ 1,5 × VA-Stimme (Xeon, Mediane wie MK1-24); Leerlauf ≤ 0,1 %; kein GC in 60 s, Heap ± 1 MB.
- [ ] BM1-14 ASCII; `grep -i -P 'kodamo|mask ?1(?![0-9])|essence'` = 0.
**Tests.** `bm1-node.mjs` (Node-Shim, Referenzen `maskrule.mjs`, `ref16.mjs`), `bm1-cpu.mjs`.

### BM2 — Stimme, Hüllkurven, LFOs, Modulation (4 Plätze), Spielweisen, Global
**Umfang.** §1.3, §1.6–1.11, §2.5, Begrenzer. **Dauer** 13–16 h · **Budget** +27 KB.
- [ ] BM2-01 **Filter:** LP/HP 12 ± 1 dB/Okt, BP 6 ± 1 dB/Okt je Seite, NOTCH ≥ 30 dB tief bei RESO 0; fc nach §1.3 ± 5 % (CUTF 20/50/80); RESO 99 schwingt bei fc ± 3 %,
  Spitze ≤ −6 dBFS; TRK 100 %: fc/f0 über C2–C6 ± 2 % konstant; OSC1-SEMI +12 bei TRK 100 % → fc +1 Okt ± 2 %; Koeffizienten wechseln stufig je Steuerschritt.
- [ ] BM2-02 **ADSR:** Zeiten nach `T(x)` ± max(10 %, 1 ms); Attack linear (R² ≥ 0,99 über die Stufen); Sustain/L-Gesetz ± 0,2 dB; LOOP-Periode ± max(10 %, 1 ms).
- [ ] BM2-03 **Δ:** Tonhöhe START +32 SPD 15 → +12,38 HT ± 2 %, 1 % Rest nach 0,30 s ± 10 %; END beim Loslassen; Maske START +24 SPD 20 → ganzzahlige Folge, Ziel nach 0,11 s ± 10 %.
- [ ] BM2-04 **LFO:** 8 Formen (Korrelation ≥ 0,99 nach Entfernen der Stufen), Tempo ± 1 %, sample-gleich für alle Stimmen, frei laufend, Phase 0 bei ▶, DLAY/Aufhebung/DCAY wie §1.8.
- [ ] BM2-05 **Ziel-Plätze:** für jede Quelle 4 Plätze; jeder der 6 + 16 + 16 + 16 Zielarten wirkt messbar; zwei Plätze auf dasselbe Ziel addieren (± 2 %);
  Mengen-Gesetz bei 25/50/99; Platz n + 1 erscheint in der Parameterfolge erst bei Menge(n) ≠ 0.
- [ ] BM2-06 **Mod-Übersicht (K1):** jeder belegte Platz genau einmal, [✕] wirkt hörbar, ein Undo; INIT ohne Eintrag.
- [ ] BM2-07 **Spielweisen:** 9 Modi mit geskripteten Folgen (staccato, legato, ±1/±2/±3 HT, Akkord + Einzelton, alle los) laut Tabelle §1.11.
- [ ] BM2-08 **Stimmen:** 12; die 13. Note klaut nach Regel; Blende ≤ 5 ms, M-KLICK ≤ 6 dB.
- [ ] BM2-09 **Global:** TEMP-Tabellen ± 0,5 ct, Global-SEMI +2 → Stimmung bezogen auf die gespielte Taste; TUNE 415 Hz → A4 = 415 ± 0,1 Hz; VEL/AT CURVE nach Formel ± 1 %;
  TIME FX OFF → DL/RV umgangen (bitgleich trocken), DT bleibt; PITCH BEND 2/12 ± 1 ct.
- [ ] BM2-10 PORT 7 → 134 ms ± 10 %, in POLY gleitet jede Stimme von ihrer letzten Tonhöhe; PANS 15 → abwechselnd L/R (≥ 30 dB Kanalunterschied);
  RATE 15 → Zeiten je Oktave × 0,5 ± 5 %.
- [ ] BM2-11 **Bedien-Glätten:** jeden stetigen Parameter in 1 s über den Weg auf klingendem Akkord: M-KLICK ≤ 6 dB gegen dieselbe Fahrt im Takt (die Körnung des Steuertakts ist erlaubt, kein zusätzlicher Sprung).
- [ ] BM2-12 **Robust:** 10 min Zufallsflug: kein NaN/Inf, Gleichanteil ≤ 0,005, Spitze ≤ +12 dBFS vor dem Master-Limiter.
- [ ] BM2-13 **CPU:** ganze Stimme ≤ 1,8 × VA-Stimme, 12 Stimmen ≤ 22 %; Begrenzer 8/6 Stimmen, verbleibende Stimmen unverändert (M-NULL ≤ −90 dB), offline unberührt.
- [ ] BM2-14 **INIT (K1):** −18 ± 1 LUFS, keine Route, 0 ± 0,1 ct.
**Tests.** `bm2-node.mjs`, `bm2-modes.mjs`, `bm2-slots.mjs`.

### BM3 — Effekte FX1 / FX2 + SYNC
**Dauer** 6–8 h · **Budget** +15 KB.
- [ ] BM3-01 BAL 0 → trocken bitgleich (Weg umgangen); 50 → trocken −6,02 ± 0,1 dB; 100 → trocken ≤ −90 dB.
- [ ] BM3-02 CH1–14 Tempo und Tiefe ± 5 % (Tonhöhenschwankung eines Sinus); CH15/16 wandernde Kerben 200 Hz – 3 kHz, volle Wirkung bei BAL 100.
- [ ] BM3-03 DT1–16 Klirrfaktor steigt streng mit n; ungerade n: gerade Obertöne ≤ −50 dB; gerade n: 2. Oberton ≥ −30 dB; Pegeländerung ≤ ± 3 dB.
- [ ] BM3-04 BC1–16 Rate und Auflösung nach Tabelle (Spiegelbilder ± 2 %); BC9–16 Rate schwankt mit 0,3 Hz ± 5 %.
- [ ] BM3-05 RM1–16 Seitenbänder bei f ± f_n ± 1 % (n ≥ 8); RM1–4 Hüllkurven L/R 90° ± 5° versetzt.
- [ ] BM3-06 DL1–16 Zeit ± 1 ms (n ≥ 10: ± 0,05 ms), Abfall je Wiederholung nach Rückkopplung ± 0,3 dB, Kammspitzen bei Vielfachen von 1/t (n ≥ 11).
- [ ] BM3-07 RV1–16 RT60 ± 15 % der Formel.
- [ ] BM3-08 LFO → FX1-/FX2-Typ: Stufen innerhalb der Familie, jeder Wechsel 30-ms-Blende, M-KLICK ≤ 6 dB.
- [ ] BM3-09 ■■/Panik: Fahnen (DL16, RV1) ≤ −90 dBFS nach 50 ms; ■: Fahnen klingen aus.
- [ ] BM3-10 CPU FX1 ≤ 0,4 %, FX2 RV ≤ 1,0 % (Xeon); FX schlafen bei Stille.
- [ ] BM3-11 **SYNC:** OFF → DL-Zeiten fest, bitgleich zum Stand ohne SYNC-Feld; ON bei 120 BPM → DL1 750 · DL2 500 · DL3 375 · DL4 187,5 · DL5 125 · DL6 93,75 · DL7 62,5 ·
  DL8 31,25 ms (± 0,1 ms); DL9–16 unverändert; Tempo 120 → 90 BPM: Zeit gleitet in 50 ms, M-KLICK ≤ 6 dB.
**Tests.** `bm3-fx.mjs`.

### BM4 — Layer/Split und Arpeggiator
**Dauer** 5–7 h · **Budget** +8 KB.
- [ ] BM4-01 Layer: jede Note klingt A und B; B-SEMI +12 → +1200 ± 0,5 ct; BAL 0/50/100 → nur A / gleich (± 0,2 dB) / nur B; PAN trennt A links, B rechts; TUNE ± 1 ct.
- [ ] BM4-02 Split: Note < sp → A, ≥ sp → B; Split halten + Taste setzt sp (ein Undo), die Note klingt dabei.
- [ ] BM4-03 FX-Typen aus A; FX1-Anteil je Programm wirksam (zwei Instanzen); FX2 einmal (Typ und Anteil aus A).
- [ ] BM4-04 LFOs je Programm: A und B laufen mit eigenen Werten.
- [ ] BM4-05 Layer braucht 2 Stimmen je Note; die 7. Note klaut (12 Stimmen).
- [ ] BM4-06 **26 Muster** in Spielreihenfolge (Referenztabelle im Test; E4, C4, G4 gedrückt).
- [ ] BM4-07 **SPD:** Transport aus, SPD 120 → Abstand 125 ms ± 1 Sample; Transport an bei 120 BPM: SPD 120 → 1/16, 60 → 1/8, 90 → 1/8T, 240 → 1/32, 400 → 1/32.
- [ ] BM4-08 HOLD: Arp-Taste 1 s halten stoppt, Klangwechsel stoppt, HOLD OFF stoppt; TRIG OFF = eine Stimme, nur Tonhöhe springt; Arp nur auf A.
- [ ] BM4-09 `sq-arp-src`: MK5-Suite grün, MS-2000-Arp-Renders bitgleich.
**Tests.** `bm4-layer.mjs`, `bm4-arp.mjs`.

### BM5 — Bedienfeld wie das Gerät
**Umfang.** §3. **Dauer** 11–14 h · **Budget** +40 KB (Block bei Bedarf).
- [ ] BM5-01 **M-SKIZZE:** Anordnung quer = Bedienfeld-Zeichnung des Handbuchs (Reihen, Reihenfolge, Gruppen, Seq/Env-Linien, Anzeige zwischen Global und Param,
  Value zwischen General und Compare, Vol links); Referenz-Skizze `bm-skizze.json` aus §3.1, IoU je Zone ≥ 0,95. Hoch: Faltung laut §3.2.
- [ ] BM5-02 **M-PLATZ** in 428×926, 926×428, P1, P2, P3, L1 (Safe-Area), L2: 23 Tasten, 2 Drehgeber, Räder treffen ≥ 44 × 44, keine Überlappung, nichts
  abgeschnitten, kein Scrollen, kein Layout-Sprung bei Modus-/Seq-Env-/Layer-Wechsel; Drehen des Geräts wechselt sauber.
- [ ] BM5-03 **Bedienlogik:** jede Modus-Taste → Parameterfolge §3.3; « Param » und erneutes Tippen blättern; Value ändert; Ein-Parameter-Modi; Anzeige zeigt
  Namen (≤ 4 Zeichen direkt, länger durchlaufend) und Wert; Masken dreistellig.
- [ ] BM5-04 **Seq/Env:** « » = ● und ▶/■ mit derselben Wirkung wie die App-Knöpfe; Osc1–Filter öffnen die Hüllen; LEDs laut §3.1.
- [ ] BM5-05 **Mehrfach-Bearbeitung:** halten + tippen → beide leuchten, Änderung an beiden, ein Undo; Einzel-Tipp beendet.
- [ ] BM5-06 **Voice/Layer/Split/Init/Write/Global/Compare** laut §3.3 (je Ablauf ein Test), Split halten + Taste setzt den Splitpunkt (ein Undo).
- [ ] BM5-07 **Value:** langsam 1 Schritt je 8 px, schnell bis × 8, Fein-Modus, Doppeltipp = INIT; Vol = Spurpegel.
- [ ] BM5-08 **Druck-Geste:** 6/36/66 px → 0/0,5/1 (AT CURVE 4); Kurven 1–6, NONE; Höchstwert über gehaltene Tasten; waagrecht > 20 px = alte Tastatur-Bedienung; Balken sichtbar.
- [ ] BM5-09 **LCD-Zeile** wie MS 2000 für jeden Parameter; „geändert“-Punkt und A/B sofort; jede Geste ein Undo.
- [ ] BM5-10 Öffnen: keine Aufgabe > 50 ms; Anzeige zeichnet nur bei Änderung; PE1 mit offenem Bedienfeld 59+ fps.
- [ ] BM5-11 Marke: kein Logo, kein Name; `grep` wie BM1-14 in DOM, Hilfe, CSS = 0; `BM_NAME`-Austausch → alle Anzeigen folgen.
- [ ] BM5-12 Bilder für Xander (alle Formate, je Voice, Osc1, Env, Mod, Global) in `bm5-shots/`.
**Tests.** `bm5-ui.mjs` (CDP-Touch, Mehrfinger), `bm5-look.mjs`, `bm5-shots.mjs`.

### BM6 — Einbindung
**Umfang.** §5.1–5.3. **Dauer** 6–8 h · **Budget** +9 KB.
- [ ] BM6-01 **Regel 28:** Demo, alle Werks-Klänge und die Snapshot-Projekte offline **bitgleich** zum Vorgänger; `dirigent-analog` byte-gleich; ohne Bit-Mask-Klang
  kein `addModule('synq-bm')`; Startzeit ± 5 %; Seitengröße +≤ 25 KB (Rest bei Bedarf).
- [ ] BM6-02 Engine-Wahl: Knopf/Chip in allen Formaten (Treffer ≥ 44, Namensfeld ≥ 72 px); VA → Bit Mask → VA: VA-Felder deep-equal, `p.bm` gemerkt, je ein Undo;
  Wechsel auf klingender Spur M-KLICK ≤ 6 dB, gehaltene Tasten klingen weiter.
- [ ] BM6-03 `normBm`: 1000 Zufalls-Klänge (Masken 0–511, 4 Plätze je Quelle) geklemmt, Kennungen gültig, unbekannte Schlüssel erhalten; Speichern → Laden und
  Kopieren/Einfügen/Duplizieren deep-equal.
- [ ] BM6-04 Zeitlage: 16tel-Muster offline ± 1 Sample am Soll; live mit Vorlauf `late` = 0 über 32 Takte; FANG, ●, MELODIE, „Eine Skala“, ⇅ wie bei VA.
- [ ] BM6-05 Stopp/Panik nach §5.2; Mute/Solo der Spur wie bisher.
- [ ] BM6-06 Offline = live: Video-Render 8 Takte zweimal bitgleich, gegen Echtzeit-Mitschnitt Korrelation ≥ 0,99.
- [ ] BM6-07 Ohne Worklet (`?engine=native`): hörbar (RMS > −40 dBFS), Hinweis sichtbar, keine Konsolenfehler, DoD 10/10.
- [ ] BM6-08 Ältere Version (Vorgänger-Snapshot) öffnet ein Bit-Mask-Projekt gesperrt, Klang unverändert; zurück auf die neue Version deep-equal.
- [ ] BM6-09 Bibliothek: Write-Ablauf sichert auf U-Plätze, Laden, Engine-Chip, Kategorien, Werk P00–P39 schreibgeschützt, U-Plätze = eigene Klänge in Sicher-Reihenfolge.
- [ ] BM6-10 `perfProbe` mit Bit-Mask-Probe (12 Stimmen + FX); Ergebnis-JSON für das iPhone-Tor.
- [ ] BM6-11 Kein Supabase-Aufruf; Hilfe; Regression (Smoke, DoD Worklet/nativ, MS-2000-Kern, K1-Suite).
**Tests.** `bm6-int.mjs`, `bm6-golden.mjs`, `bm6-store.mjs`.

### BM7 — Startklänge P00–P39
**Dauer** 5–7 h · **Budget** +9 KB.
- [ ] BM7-01 40 Programme + 4 INIT; keine Namensgleichheit oder Übersetzung zur Werksliste, keine Künstlernamen.
- [ ] BM7-02 Charakter (Offline 48 kHz, v 0,8/1,0): Bass Grundton 40–130 Hz bei C2, Schwerpunkt < 1,5 kHz; Lead Mono-Modi, Vibrato erst nach DLAY;
  Pad Attack ≥ 300 ms, Release ≥ 600 ms; Keys/Pluck Abfall auf −20 dB in 0,3–3 s; Glocke ≥ 2 Teiltöne oberhalb k 7 innerhalb −30 dB; Orgel Sustain voll;
  Sturz-Ton Bend ≥ 36 HT; Arp-Programme spielen ihr Muster; Rhythmus-Maske bei C2 ≥ 4 Pegel-Einbrüche je Periode; Kristall-Pluck/Arp-Glitzer folgen mit SYNC dem Tempo.
- [ ] BM7-03 Pegel −18 ± 3 LUFS je Kategorie, Spitzen ≤ −1 dBFS; CPU je Programm (4-Ton-Akkord) ≤ 9 % Xeon.
- [ ] BM7-04 Hörprobe (44 WAV, ZIP) für Xander.
**Tests.** `bm7-prog.mjs`.

### BM8 — Bend, Rad und Druck im Clip
**Umfang.** §5.4. **Dauer** 7–9 h · **Budget** +8 KB.
- [ ] BM8-01 **Aufnahme:** ● 4 Takte mit Bend-Zug, Rad-Fahrt, Druck → `cv.bd/mw/at` im Behälter, Startpunkt bei t = 0, ≤ 100 Punkte/s, Abweichung zur Eingabe ≤ 0,005; FANG ebenso.
- [ ] BM8-02 **Wiedergabe:** Offline-Render des Clips gegen Echtzeit-Mitschnitt der Aufnahme Korrelation ≥ 0,99; Zeitlage ± 1 ms; jeder Schleifen-Beginn nimmt den Startwert;
  Clip-Ende/■ → Bend 0, Druck 0, Rad = Radstellung.
- [ ] BM8-03 **Mitwandern:** Clip kopieren/einfügen, Szene duplizieren, `makeOwn`, Teil und FANG übernehmen, Projekt-Kopie, Datei-Rundweg, Server (Fake) → `cv` deep-equal
  (bzw. zeitlich verschoben, wo die Aktion verschiebt). Kein Weg liefert Noten ohne `cv`.
- [ ] BM8-04 **Zeit-Aktionen** (rückwärts, Länge ×2, kürzen, teilen, zusammenfassen) → Kurven passend (Prüfwerte im Test); Tonhöhen-Aktionen → `cv` unverändert.
- [ ] BM8-05 **Overdub = Berühren:** Rad nur in Takt 2 bewegt → Punkte in Takt 1, 3, 4 unverändert.
- [ ] BM8-06 **Kurven löschen:** Menüpunkt nur bei Clips mit Kurven; löscht alle drei; ein Undo, Redo.
- [ ] BM8-07 Eine Aufnahme = ein Undo (mit Noten); `historyCheck()` = true.
- [ ] BM8-08 Speichern/Laden deep-equal; Normalisierer repariert unsortierte, zu viele, NaN- und Grenzwerte.
- [ ] BM8-09 Live-Berührung während der Kurve: Live gewinnt, danach folgt die Kurve.
- [ ] BM8-10 VA-/FM-/MS-2000-Spur mit Kurven-Clip: kein Fehler, Klang bitgleich zu ohne Kurven, `cv` bleibt erhalten.
- [ ] BM8-11 Größe: 16 Takte ständige Bewegung aller drei Regler ≤ 20 KB je Clip.
**Tests.** `bm8-curves.mjs`, `bm8-copy.mjs`.

---

## 7. Dauer, Größe, Reihenfolge

| Paket | Inhalt | Dauer | Budget |
|---|---|---|---|
| BM1 | Masken-Osz. 16-fach (9 Bit), Dezimierer, Steuertakt | 9–11 h | +12 KB |
| BM2 | Stimme, Hüllkurven, LFOs, 4 Ziel-Plätze, 9 Spielweisen, Global | 13–16 h | +27 KB |
| BM3 | FX1/FX2 + SYNC | 6–8 h | +15 KB |
| BM4 | Layer/Split, Arp (SPD wie Gerät) | 5–7 h | +8 KB |
| BM5 | Bedienfeld wie das Gerät, Druck-Geste | 11–14 h | +40 KB |
| BM6 | Einbindung, Format 5, Bibliothek, Regel-28-Golden, `perfProbe` | 6–8 h | +9 KB |
| BM7 | 40 Startklänge + 4 INIT | 5–7 h | +9 KB |
| BM8 | Bend/Rad/Druck im Clip | 7–9 h | +8 KB |
| **Summe** | + ≈ 3 h Zusammenführen und Fach-Prüfung | **≈ 74 h (65–83 h)** | **≈ +128 KB**, davon ≈ 105 KB nur bei Bedarf |

Gegenüber Rev. 1 (≈ 60 h): +BM8 (Kurven), Bedienfeld-Nachbau statt App-Stil, 4 Ziel-Plätze, SYNC, Global-Seite. Dafür entfallen Worker, Tabellen und
Karte. Mit drei Helfer-Sitzungen (Zweige A, B, C) ≈ 30–35 h Kalenderzeit, plus das iPhone-Tor nach BM1 + BM6.

---

## 8. Fragen an Xander — alle beantwortet (31.10. ~17:00 UTC)
| Nr. | Frage | Antwort [X] | umgesetzt in |
|---|---|---|---|
| F0 | Name | „Bit Mask“ | §0.3 |
| F1 | Aussehen | wie das Gerät (Tastenreihen, rote 4-stellige Anzeige, Drehgeber), eigene Zeichnung, ≥ 44 px, quer und hoch | §3, BM5; Karte/Bits nur als Option O-1 |
| F2 | Beschriftung | wie am Gerät; LCD-Zeile wie beim MS 2000 | §3.1 |
| F3 | Druck | ja: Finger auf gehaltener Taste nach oben | §3.4 |
| F4 | Masken-Lautstärke | roh wie am Gerät | §1.2 |
| F5 | Oktav-Ausgleich | wie am Gerät (keiner, kein Hinweis) | §1.4 |
| F6 | Klangcharakter | wie am Gerät als Standard (16-fach, körnige Hüllkurven) | §1.7, §2 |
| F7 | Echo-Zeiten | fest wie am Gerät + Schalter SYNC ins Song-Tempo | §1.12 |
| F8 | Mod-Ziele | mehr als eins je Quelle: 4 Plätze | §1.9 |
| F9 | Pedal / Kurven | Halte-Taste offen (Option O-4); Bend/Rad/Druck fest im Clip, „Kurven löschen“ | §5.4, BM8 |
| F10 | Masken-Anzahl | neueste Fassung: 512 Masken, 12 Stimmen | §1.2, §1.11 |
- Hinweis ohne Rückfrage: Die Farben des Bedienfelds folgen den öffentlichen Angaben (weiß lackiertes Metall). Fotos von Xander würden helfen.

---

## Anhang M — Messverfahren (ergänzt)
| Kürzel | Definition |
|---|---|
| **M-SPEKTRUM** | Render mit ganzzahliger Periodenlänge, 64 Perioden, FFT rechteckig, Teilton k = Bin 64·k, dB re Teilton 1 |
| **M-ALIAS** | Energie der Bins in 0–16 kHz, die nicht auf Vielfachen von f0 liegen, re Teiltöne; Vergleich mit `ref16.mjs` (ideale 16-fach-Rechnung, FFT-Dezimierung) |
| **M-PERIODE** | Autokorrelation 1 s, erste Spitze ≥ 0,9, parabolisch interpoliert |
| **M-SCHWERPUNKT** | Σ k·a_k² / Σ a_k², k = 1 … 512 (Referenz `maskrule.mjs`) |
| **M-SKIZZE** | wie MK1: IoU je Zone gegen die Referenz-Skizze `bm-skizze.json` |
Vorhandene Verfahren (M-T60, M-CENT, M-NULL, M-PEGEL, M-SP, M-KLICK, M-EINBRUCH, M-ZEIT, M-LUFS, M-CPU, M-PLATZ) unverändert.

## Anhang Q — Rechenhilfen (eigene Rechnungen, keine Handbuch-Inhalte; `S/bm-tools/`)
- `maskrule.mjs` – Regel als genaue Fourier-Reihe (Anker, Schwerpunkt); `check512.mjs` – 9-Bit-Prüfung (32/32 Minima, Blöcke, „pulsartig“);
  `mask-stats.json` – 512 Masken (Spanne, klingender Anteil, stärkster Teilton, Schwerpunkt, RMS, Gleichanteil).
- `ref16.mjs` – Referenz „wie am Gerät“: naiv 16-fach + ideale Dezimierung, Faltungswerte; `bench16d.mjs` + `qual16d.mjs` – Prototyp CIC5 + Halbband
  (CPU je Stimme, Faltung, Durchlass); `bench16b/c.mjs` – verworfene FIR-Varianten (zu teuer).
- `fastbuild.mjs` – schneller exakter Spektrum-Bau (nur für den nativen Rückfall und Option O-5).
- Seitenbilder des Handbuchs unter `S/mask1-render/` sind privat.

> **Entscheidungen Xander 31.10.:** Name „Bit Mask“ (~16:30); F1–F10 (~17:00 UTC) wie in §8.
