# SYNQUENZER v3 — Nachtrag 6: North (Drum-Synthese nach dem Klangaufbau des Nord Drum 3P, Xander 31.10.)

**Kurz für Xander**
1. Neue Drum-Engine (Arbeitsname „North“ – du hast „North“ gesagt, siehe Fragen): kompletter Klangaufbau des Geräts je Pad – TONE mit 34 Modellen (analog, T-Brücke, FM, Obertöne, Felle, Stabspiele, Becken, Ringmod), NOISE mit 7 Filtern, CLICK mit 12 Typen, Dist, EQ, Hall, Echo, Mono-Gruppe, Skalen.
2. Dein Drum-Sequencer bleibt, wie er ist; jedes Pad wählt nur, ob es die bisherige Drum-Stimme oder die neue Engine spielt. Alte Projekte klingen bitgleich wie vorher.
3. Vier Pakete (Engine, Editor, 45 eigene Startklänge + 4 Kits, Einbindung) ≈ 40 h, parallel baubar; vorher 7 kurze Fragen an dich (Name, Beschriftung, Aussehen …).

---

Status: **Entwurf zur Freigabe.** Auftrag Xander 31.10. (`fragen-xander-9.md`, Abschnitt 31.10., ~13:00, ~14:00, ~14:05 UTC):
„Nord-Drum-3P 1:1 nachbauen (eigene Engine, bestehender Drum-Sequencer bleibt), jeder Klang mit seinem perkussiven Charakter“;
Drum-Synth „mit logischem Fundament für Perkussion wie Kodamos schrittweise FM, schräge FX-Sounds“.

**Regeln, die hier besonders gelten** (`typische-fehler.md`):
- **27** Nichts selbst bestimmen. Wo das Handbuch schweigt, legt diese Spec einen Wert fest und kennzeichnet ihn mit **[A]**
  (Annahme). Handbuch-Fakten tragen **[H]**. Der Builder baut genau das; Abweichungen nur über „Fragen an Xander“.
- **28** Klang alter Projekte bleibt gleich: Die Engine ist **zusätzlich**; ohne Modell-Pad wird ihr Modul nicht einmal geladen.
  Für spätere Änderungen an dieser Engine gilt `md.v` (Versionsfeld) mit Umrechnung oder altem Pfad.
- **24 (sinngemäß)** Marke: Der Gerätename und der Herstellername stehen **nirgends in der App** (Oberfläche, Hilfe, Kommentare,
  Bezeichner, Dateinamen im Repo). Die Engine heißt in der App nur über die Konstante `MD_NAME` (§0.4).
- **4** Trefferflächen ≥ 44 × 44 px; senkrecht ziehen + Fein-Modus. **1/5** nichts abgeschnitten, kein Layout-Sprung in
  390×844, 375×667, 320×568, 844×390, 667×375, 926×428. **12/13** keine Knackser, Stimmenübernahme ohne Sprung.
  **15** Panik/Doppel-Stopp beenden auch Hall- und Echo-Fahnen. **16/17** keine Allokation pro Block, NaN-/Denormal-Schutz.
  **20** kein Supabase-Aufruf. **29** parallel in Zweigen bauen.
- **CLAUDE.md-Vorrang:** schnelle Seite und stabile Verbindung vor allem anderen → das Engine-Modul wird **erst bei Bedarf**
  geladen (§ND4), die Seite lädt ohne Modell-Pad exakt wie heute.
- Format bleibt **5** (nur additive Felder). App-Version vergibt der Dirigent beim Einplanen; `max_app` setzt Xander (Regel 20).

---

## 0. Quellen, Lesart, Name

### 0.1 Quellen
- Gerätehandbuch EN, Ausgabe C (OS 1.x), und DE (ältere Ausgabe), privat unter `S/manuals/nord-drum/` – **nie in ein Repo**,
  nie wörtlich zitieren. Diese Spec beschreibt nur Fakten (Parameternamen, Bereiche, Modell-Listen, Signalweg) in eigenen Worten.
- App: `CHANGES-V3.md`, Snapshot `synq-snapshots/VS-L.html` (4.24.0): Drum-Spur = `DrumSynth` (WP6, native Web-Audio-Knoten
  je Schlag, 12 Slots im Rytm-Layout, GM 36/38/37/39/42/46/45/47/50/49/56/70), Kit-Bus mit ROOM/GATE-Faltung, Pad-Strips,
  Sequencer-Lanes `vel acc prob rat nud tune dec`, Akzent nach §7.1 (`accentAmt`), Worklets `dirigent-analog`, `dirigent-hall`
  (Dattorro), `synq-miccap`, `synq-stimme`. V1a–V1d (Drum-Editor v3, Engine je Pad) sind **geplant, nicht gebaut**.
- Vorbild-Notizen `dirigent-spec-v3.md` §3 (Punch, Bend, Dyn Filter, Dynamic Decay als Vorbild), V4c Verhältnis-Raster
  (`FMX.ratioClass`), Nachtrag 1 A.5 (V1d, PAD-R1).

### 0.2 Lesart des Handbuchs (wo es unklar ist)
| Stelle | Befund | Festlegung |
|---|---|---|
| Ausgaben | EN (Ausgabe C) nennt Tone-Modi E1–E3 und zwei T-Brücken-Modelle t1/t2; die DE-Ausgabe nur E und t1 | **EN Ausgabe C gilt** (neueres OS) [A] |
| Drumhead-Modelle | Tabelle: d1–d7; Fließtext nennt einmal „d1–d9“ | **d1–d7** (Tabelle) [A] |
| Bend-Bereich | Anzeige-Glyphen der Siebensegment-Schrift nicht eindeutig; Beispiele ±26; 0 liegt laut Bedienteil in der Mitte | **−50 … +50**, Mittelraste bei 0 [A] |
| Dyn Filter Tone | Glyphe zeigt „0 – 9“ (einpolig) | **0 … 9** [A] |
| Dyn Filter Noise | ausdrücklich zweipolig, Glyphen ±9 | **−9 … +9** [H/A] |
| Pitch-Auflösung | Anzeige mit einer Nachkommastelle, 0.0 … 127.5 | **0,1-Schritte** (10 Cent) [A] |
| Zeit- und Frequenz-Skalen | Handbuch gibt nur 0–50 ohne Einheiten (außer Delay-Rate, EQ-Gain) | gemeinsame Skalen §1.2 [A] |
| Algorithmen F1–F4, Varianten H/d/P/C/r | nur Familienname + Spectra-Bedeutung | Bauweise §1.4 [A] |

### 0.3 Kanäle in der App
Das Gerät hat 6 Kanäle je Kit. Die App hat 12 Pads je Drum-Spur. **Jedes Pad kann ein Modell-Kanal sein** (bis 12 Kanäle) [A,
Frage F4]. „Kanal“ = Pad mit Quelle `md`. Reihenfolge der Kanäle (für SCL PRE und „niedrigster Kanal“): Slot-Reihenfolge
KICK, SNARE, RIM, CLAP, HH ZU, HH OFFEN, TOM TIEF, TOM MITTE, TOM HOCH, BECKEN, PERC, SHAKER, nur Pads mit Quelle `md`.

### 0.4 Name
- Eine Konstante `MD_NAME` (Anzeige-Name der Engine). **Wert im Bau: `'North'` (Platzhalter).** Jede Anzeige (Quelle-
  Wahl, Kopf, Bibliothek, Hilfe, Toasts) liest `MD_NAME`; kein zweites Vorkommen des Namens im Code.
- Xander hat am 31.10. ~14:05 UTC „North“ genannt. Das ist die englische Übersetzung des Markennamens → vor dem Eintragen
  Hinweis und Bestätigung (Frage F1). Umstellen = eine Zeile.
- Interne Bezeichner: `md…` / `MDX` / Prozessor `'synq-md'`. Kein `nord`, kein `nd` als Abkürzung des Geräts im App-Code.

---

## 1. Architektur (je Kanal wie am Gerät)

### 1.1 Signalweg
```
 je Kanal (Pad mit Quelle md) – eine Stimme + eine ausblendende (Neuanschlag, Mono-Gruppe)
 ┌ TONE  (Modell WAVE, PITCH, BEND, DECAY/MODE, FREQ/DYN FILTER, SPECTRA) ─ × TONE LVL ─┐
 ├ NOISE (Weißrauschen → Multimode-Filter mit Hüllkurve) ────────────────── × NOISE LVL ┼─ Σ ─ DIST ─ EQ ─ DELAY (Kanal,
 └ CLICK (Transient-Tabelle) ──────────────────────────────────────────── × LEVEL ─────┘        Zeit/Feedback global)
     ─ trocken × (1 − RVB/50) ─ PAN ─ × CH LEVEL ─────────────────────────────────────────► Summe L/R ─► Drum-Spur-Bus
     └ × RVB/50 × CH LEVEL ─► gemeinsamer Hall (Typ, Color global) ─────────────────────────► Summe L/R
```
- [H] Drei Teile TONE (tonaler Körper), NOISE (ungestimmter Anteil), CLICK (erster Anschlag-Transient); Summe → DIST → EQ →
  DELAY → REVERB → PAN → CH LEVEL; DELAY und REVERB sind Effekte des ganzen Kits, je Kanal mit eigenem Anteil.
- [A] Echo: **je Kanal eine eigene Verzögerungsleitung** (Zeit und Feedback für alle gleich, Kit-Wert) → die Wiederholungen
  stehen im Stereobild beim Kanal, wie im Signalweg. Hall: **ein** gemeinsamer Hall (Mono-Eingang, Stereo-Ausgang); sein Anteil je
  Kanal wird nach dem Echo und mit CH LEVEL abgegriffen; PAN wirkt nur auf den trockenen Teil (der gemeinsame Hall kann nicht je
  Kanal gepannt werden – Abweichung vom Bild, hörbar unbedeutend).
- [A] Alle Teile eines Schlags starten im selben Sample bei Phase 0 (phasenstarr, wie AR4 der App).
- Ausgang der Engine (Stereo) → `AU.kit.in` (Eingang des Drum-Spur-Busses). Spur-FX, globale Sends, Mute/Solo der Drum-Spur
  wirken wie auf alle Pads. Pad-Strip (Pad-Pegel, Pan, Raum, Gate) und die Kit-Faltungshalle der Drum-Stimme gelten für
  Modell-Pads **nicht**; dort gelten CH LEVEL, PAN, RVB, DLY des Kanals.

### 1.2 Gemeinsame Skalen – das „logische Fundament“ (Xander 31.10.)
Ein Wert bedeutet überall dasselbe. Alles, was zur Klangfarbe gehört, ist **relativ zur Tonhöhe** (Stimmen, Transponieren,
TUNE-Lock und SCL PRE erhalten den Charakter). Stufen-Tabellen statt beliebiger Zwischenwerte (§1.15), so wie das Verhältnis-
Raster im FM-FELD (V4c): jede Stufe ist ein bewusst gewähltes Verhältnis.

| Skala | Formel [A] | Stützwerte |
|---|---|---|
| **Zeit** `T(x)`, x 0–50 (TONE DECAY, NOISE DECAY, BEND TIME, Dynamic-Decay-Zahl) | `T = 4 ms · 2500^(x/50)` | 0 → 4 ms · 10 → 19 ms · 20 → 92 ms · 25 → 200 ms · 30 → 437 ms · 35 → 956 ms · 40 → 2,09 s · 45 → 4,57 s · 50 → 10 s |
| **Pegel** `G(x)`, x 0–50 (TONE LVL, NOISE LVL, CLICK LEVEL, CH LEVEL) | `G = (x/50)²`, 0 = aus | 50 → 0 dB · 45 → −1,8 · 40 → −3,9 · 30 → −8,9 · 25 → −12,0 · 10 → −28,0 · 1 → −68 |
| **Noise-Filterfrequenz** `fN(n)`, n 0–50 | `30 Hz · 600^(n/50)` | 0 → 30 Hz · 10 → 108 · 20 → 388 · 25 → 735 · 30 → 1,39 k · 35 → 2,64 k · 40 → 5,0 k · 45 → 9,5 k · 50 → 18 k |
| **EQ-Frequenz** `fE(n)`, n 0–50 | `40 Hz · 400^(n/50)` | 0 → 40 Hz · 10 → 133 · 25 → 800 · 40 → 4,83 k · 50 → 16 k |
| **Resonanz** NOISE RES 0–20 → Güte | `Q = 0,5 + 15,5 · (r/20)²` | 0 → 0,5 · 6 → 1,9 · 10 → 4,4 · 14 → 8,1 · 20 → 16 (keine Selbstoszillation) |
| **Bend** b −50…+50 → Halbtöne | `ΔHT = 48 · (|b|/50)²`, Vorzeichen: + = beginnt oben, fällt [H] | 5 → 0,48 · 10 → 1,92 · 15 → 4,32 · 20 → 7,68 · 26 → 12,98 · 30 → 17,28 · 40 → 30,72 · 50 → 48 |
| **Pitch** p 0,0–127,5 [H] | `f0 = 440 Hz · 2^((p − 69)/12)` [H: 69.0 = 440 Hz] | 33 → 55 Hz · 45 → 110 · 57 → 220 · 69 → 440 · 127,5 → 12,9 kHz |
| **Dyn-Filter-Zuschlag** (TONE 0–9, NOISE −9…9) | Zuschlag in Freq-Einheiten `Δ = 4,6 · DF · (0,35 + 0,65·v)` | DF 5, v 1 → +23 (Handbuch-Bild: FREQ 15 öffnet bis ≈ 38) |
| **Filter-Hüllkurve** (Dyn Filter, FM-Index, Pulsbreite) | fällt mit E1-Form, `T_f = 0,5 · T(Decay_eff)` | – |

Anschlag `v` (0–1) kommt aus Sequencer-VEL, Pad-Tipp-Höhe (0,35–1,0) bzw. Tastatur. Siehe §1.11.

### 1.3 TONE – Parameter
Bedien-Paare wie am Gerät (obere Reihe / untere Reihe) [H]: SPECTRA/WAVE · FREQ/DYN FILTER · DECAY/MODE · BEND/TIME · PITCH/SCL PRE.

| Parameter | Bereich [H] | Anzeige | Wirkung |
|---|---|---|---|
| WAVE | A1–A6, t1–t2, F1–F4, H1–H6, d1–d7, P1–P4, C1–C3, r1–r2 (34) | Code + LCD-Erklärung | Synthesemodell §1.4 |
| SPECTRA | 0–99 | Zahl + LCD (Verhältnis, HT, Hz) | je Familie §1.4; bei A1 und t1 ohne Wirkung („–“) [H] |
| FREQ | 0–50 | Zahl + LCD | Anfangs-Klangfarbe: 0 = wenig Obertöne (Dyn Filter und Anschlag wirken stärker), 50 = volle Obertöne [H]; analoge Wellen: Tiefpass, sonst Änderung des Obertongehalts [H]; FM: FM-Menge [H]; T-Brücke t2: Mischung der zwei Oszillatoren [H]; bei A1 ohne Wirkung [H] |
| DYN FILTER | 0–9 | Zahl | anschlagsabhängige Hüllkurve auf FREQ [H]; bei A1 ohne Wirkung [H]; Zuschlag §1.2 |
| DECAY | 0–50 | Zahl + LCD Zeit | Länge des Tons [H]; Zeit-Skala `T(x)` |
| MODE | E1, E2, E3, L, P, dann 0–50 | „E1“…„P“, danach Zahl | Abklingform; Zahl = Dynamic Decay (Decay bei Anschlag 0) [H]; §1.5 |
| BEND | −50…+50 | Zahl, Mittelraste | anschlagsabhängige Tonhöhenbiegung; + startet höher und fällt, − startet tiefer und steigt [H]; §1.6 |
| TIME | 0–50 | Zahl + LCD Zeit | Dauer der Biegung bis zur Nenn-Tonhöhe [H]; `T(x)` |
| PITCH | 0,0–127,5 | „45.0“ + LCD „A2 · 110,0 Hz“ | Grundtonhöhe in Halbtönen als MIDI-Notennummer [H] |
| SCL PRE | h1–h7, P1–P2, H1–H5, Av, bL | Code + LCD | Makro auf die Tonhöhen aller Modell-Kanäle, wird nicht gespeichert [H]; §1.6 |

### 1.4 TONE – Modelle (WAVE) und DSP-Bauweise im Worklet

**Gemeinsame Bausteine** (einmal gebaut, von mehreren Familien genutzt) [A]:
- `OSC` PolyBLEP-Oszillator (Dreieck über integriertes BLEP-Rechteck, Säge, Rechteck, Puls); Sinus aus 4096er-Tabelle mit
  linearer Interpolation (beim Laden des Moduls gebaut, Regel 16).
- `SVF` Zustandsvariablen-Filter (TPT-Form, stabil unter Modulation), Koeffizienten alle 16 Samples aus `tan`-Tabelle; 24 dB =
  zwei Stufen, Resonanz nur in der ersten.
- `MODAL` Modalbank: je Mode ein komplexer Zeiger `z ← z · r·e^{iω}` (4 Mul + 2 Add, amplitudenstabil auch beim Biegen),
  Ausgang = Imaginärteil (Start bei Phase 0 → kein Knack), Moden über 0,45·fs werden nicht gerechnet, Renormierung alle
  1024 Samples, Frequenz-Update alle 16 Samples (Bend). Anschlag = Startamplitude je Mode `a_k · H_S(f_k)`; Schlägel-Härte
  `H_S(f) = 1 / (1 + (π · f · τc)²)` mit Kontaktzeit `τc = 4 ms · 0,025^(F_eff/50)` (FREQ 0 → 4 ms weich, 50 → 0,1 ms hart).
  Abklingen je Mode `T60_k = T_M · g_k` (Modell-Gesetz); `T_M` so, dass zusammen mit der Hüllkurve (§1.5) die gemessene T60 des
  Grundtons = `T(Decay)` ± 10 % ist (für E1: `T_M = 4·T`, Hüllkurve `4T/3`).
- `RES2` Zwei-Pol-Resonator (T-Brücke): SVF-Bandpass, `Q = π · f · T60 / 6,91`, angeregt durch einen Rechteckimpuls.
- Stufen-Tabellen VERH (Verhältnisse) und VERST (Verstimmung) §1.15.

`F_eff = FREQ + Dyn-Zuschlag(t)` (§1.2; für Modalmodelle zählt der Wert im Anschlag-Sample, die zeitliche Abnahme der Helligkeit
entsteht dort durch die schnellere Dämpfung hoher Moden).

**Übersicht SPECTRA / FREQ / DYN FILTER je Familie**
| Familie | SPECTRA | FREQ | DYN FILTER |
|---|---|---|---|
| A1 Sinus | – [H] | – [H] | – [H] |
| A2–A5 | Verstimmung des 2. Oszillators [H], Tabelle VERST | Tiefpass 12 dB/Okt mit Tonhöhe: `fc = f0 · 2^(9·F_eff/50)` (≤ 0,45 fs) | Hüllkurve auf `fc` |
| A6 Puls | Anfangs-Pulsbreite [H]: `PW0 = 50 % − 45 % · S/99` | wie A2 | wie A2; Pulsbreite gleitet mit der Filter-Hüllkurve von `PW0` zu 50 % [A] |
| t1 | – [H] | Anregung: Impulsbreite `2 ms · 0,025^(F_eff/50)` + leichte Sättigung `tanh` mit Antrieb `1 + 2·F_eff/50`, Pegel normiert | Zuschlag im Anschlag |
| t2 | Verstimmung des 2. Resonators [H], VERST | Mischung Resonator 1 ↔ 2 [H]: 0 = nur 1, 25 = gleich, 50 = nur 2 | Zuschlag zur Anregungs-Helligkeit beider |
| F1–F4 | Modulatorfrequenz [H] als Verhältnis, Tabelle VERH | FM-Index [H]: `I = Imax · (F_eff/50)²` | Index-Hüllkurve |
| H1–H6 | Resonanz-Mitte [H] = Formant `fc = f0 · 2^(8·S/99)` | Helligkeit: Teilton-Neigung `a_k = k^(−α)`, `α = 2 − 1,7·F_eff/50` | Zuschlag im Anschlag |
| d1–d7 | Resonanz-Mitte [H] = Fell getrennt vom Körper gestimmt [H]: `fF = f0 · 2^((S − 33)/33)` (33 = Fell = Körper) | Schlägel-Härte `τc` | Zuschlag zur Härte |
| P1–P4 | Resonanz-Mitte [H] = Resonator(rohr) `fR = f0 · 2^((S − 24)/25)` (24 = auf den Grundton) | Schlägel-Härte | Zuschlag zur Härte |
| C1–C3 | Becken-Stimmung und Filter [H]: Faktor `κ = 2^((S − 50)/50)` auf alle Teiltöne + Filter mitgeführt | Helligkeit | Zuschlag |
| r1–r2 | Verstimmung des Modulators [H] als Verhältnis, Tabelle VERH | r1: Ringmod-Tiefe `m = F_eff/50` (0 = nur Träger); r2: Tiefpass wie A2 | Hüllkurve auf `m` bzw. `fc` |

**A – analoge Wellen** [H: Sinus, Dreieck, Säge, Rechteck, hochpassgefiltertes Rechteck, Puls; analog gefiltert]
- A1: ein Sinus, sonst nichts (keine Obertöne, FREQ/DYN FILTER/SPECTRA ohne Wirkung).
- A2/A3/A4: zwei gleiche Oszillatoren (je ×0,5), Osz. 2 um VERST(S) verstimmt; Spectra 0 = deckungsgleich.
- A5: wie A4, danach Hochpass 12 dB bei `1,0 · f0` (Q 0,7) – hohl, ohne Grundton-Körper [A].
- A6: ein Pulsoszillator mit Anfangs-Pulsbreite (oben).
- Start mit 0,5-ms-Einblendung (Säge/Rechteck springen sonst) [A].

**t – T-Brücken-Oszillator** [H: t1, t2 mit 2. Oszillator]
- Ein angeregter Zwei-Pol-Resonator wie der Bassdrum-Kreis klassischer Analog-Maschinen: abklingender, fast reiner Sinus, Bend
  verschiebt die Resonanzfrequenz (der Resonator gleitet mit, kein Neustart). T60 des Resonators = `T(Decay)` (Modi L/P/Gate
  über die Ausgangshüllkurve mit Ausgleich wie bei `MODAL`).
- t2: zweiter Resonator, Verstimmung aus VERST, FREQ mischt.

**F – FM-Algorithmen** [H: Spectra = Modulatorfrequenz, Freq = FM-Menge] – Bauweise [A]:
| Wave | Aufbau | `Imax` | Charakter |
|---|---|---|---|
| F1 | M → C | 10 | klassische 2-Operator-FM: Kick-Biss, Toms, Glocken |
| F2 | M (Selbst-Rückkopplung β = 0,6) → C | 8 | rauer, geräuschhaft: Snare-Körper, Zaps |
| F3 | M2 → M1 → C; `f_M1 = r·f0`, `f_M2 = 1,41·f_M1`, `I_M2 = 0,5·I` | 8 | metallisch, glockig, Gong |
| F4 | M → C1 + C2; `C2 = 1,5·f0` mit −6 dB | 8 | Doppelton: Kuhglocke, Agogo, Clang |
- Phasenmodulation über Sinus-Tabelle; Bend wirkt auf alle Operatoren gleich (Verhältnis bleibt).
- Anzeige der Stufe mit der Klasse aus `FMX.ratioClass` (gleiche Zeichen wie im FM-FELD-Raster) – das ist das „schrittweise“ der
  Kodamo-Logik: harmonisch → tiefer Grundton → inharmonisch → FX.

**H – harmonische Resonanz-Modelle** [H: Resonanz-Mitte] – Bauweise [A]: `MODAL` mit harmonischen Teiltönen, bis 32 (≤ 0,45 fs),
Amplitude `a_k = k^(−α) · W(f_k)`, Formant `W(f) = 1 + 7 · exp(−(log2(f/fc))² / (2 · 0,35²))` (≈ +18 dB),
Abklingen `g_k = k^(−0,5)`.
| Wave | Teiltöne | Charakter |
|---|---|---|
| H1 | alle k = 1, 2, 3 … | voll, saitenartig |
| H2 | nur ungerade | hohl, röhrenartig |
| H3 | ohne Vielfache von 3 (Anschlag bei ⅓) | nasal |
| H4 | 1 und gerade | oktavig, orgelartig |
| H5 | alle, zwei Formanten (`fc` und `2,5·fc`, zweiter +12 dB) | sprechend, Talking-Drum |
| H6 | gestreckt `f_k = k·f0·√(1 + B·k²)`, B = 0,0008, k ≤ 24 | Stahl, Klavier-Glanz |

**d – Fell-Modelle** [H: Fell getrennt vom Körper (PITCH) stimmbar] – Bauweise [A]: `MODAL` für das Fell (Grundfrequenz `fF`),
dazu **Körper-Resonanz** als eigene Mode bei `f0` (PITCH). Fell-Verhältnisse aus den Nullstellen der Bessel-Funktionen
(ideale kreisförmige Membran, gerechnet: `nd-tools/bessel.py`). Amplituden `a_k = r_k^(−γ)`, Abklingen `g_k = r_k^(−β)`.
| Wave | Fell-Moden (Verhältnis zu fF) | γ | β | Körper (Pegel, T60) | Charakter / Besonderheit |
|---|---|---|---|---|---|
| d1 | nur Rundmoden: 1 · 2,295 · 3,598 · 4,903 · 6,209 · 7,515 | 0,6 | 0,8 | −6 dB, 1,3·T | Mitte angeschlagen: Bauch, Bassdrum, Standtom |
| d2 | alle (12): 1 · 1,593 · 2,136 · 2,295 · 2,653 · 2,917 · 3,155 · 3,500 · 3,598 · 3,647 · 4,059 · 4,132 | 0,8 | 1,0 | −6 dB, 1,3·T | außermittig: Tom, Snare-Fell |
| d3 | luftbelastet: 0,85 (schwach, 0,15·T) · 1 · 1,50 · 1,98 · 2,44 · 2,94 · 3,40 | 0,7 | 0,6 | −12 dB, 1,0·T | Kessel/Pauke: fast harmonisch, lang |
| d4 | beladenes Fell: 1 · 2 · 3 · 4 · 5 · 6 (+ 1,5 mit −18 dB) | 0,9 | 0,4 | −12 dB, 1,0·T | gestimmte Handtrommel (Fleck auf dem Fell) |
| d5 | d2-Moden (erste 8) + **Teppich**: eigenes Rauschen, Bandpass 5 kHz (Q 1), Hüllkurve = gleichgerichteter Fell-Ausgang (2 ms geglättet), −8 dB | 0,7 | 1,4 | −9 dB, 1,0·T | Fell mit Snare-Teppich |
| d6 | 16 Moden: d2-Liste + 4,230 · 4,601 · 4,610 · 4,832 | 0,5 | 0,9 | 0 dB, 1,6·T | dünnes Rahmenfell: Boom + Glanz |
| d7 | 1 · 1,593 · 2,136 · 2,295 + Slap-Gruppe 4,601 · 4,832 · 5,131 · 5,412 (Slap β 2,0, Pegel steigt mit FREQ) | 0,9 | 1,2 | +3 dB, 1,0·T | tiefer Kessel, Conga-artig |

**P – Stabspiele** [H: Marimba, Vibraphon u. a.; Resonanz-Mitte] – Bauweise [A]: `MODAL` mit Stab-Moden, Resonator `fR` hebt
nahe Moden an: `W(f) = 1 + 3 · exp(−(log2(f/fR))² / (2 · 0,08²))` (+12 dB, schmal), solche Moden klingen ×1,5 länger.
| Wave | Moden (Verhältnis) | Amplituden | Abklingen g_k | Charakter |
|---|---|---|---|---|
| P1 | 1 · 3,99 · 9,95 · 16,4 | 1 · 0,30 · 0,12 · 0,04 | 1 · 0,25 · 0,10 · 0,05 | Marimba (gestimmter Holzstab) |
| P2 | 1 · 4,00 · 10,0 | 1 · 0,35 · 0,15 | 1 · 0,6 · 0,35 | Vibraphon (Metallstab, lang) |
| P3 | 1 · 3,00 · 6,0 · 9,8 | 1 · 0,45 · 0,2 · 0,1 | 1 · 0,4 · 0,2 · 0,1 | Xylophon (Duodezime, kurz) |
| P4 | 1 · 2,756 · 5,404 · 8,933 · 13,344 | 1 · 0,5 · 0,3 · 0,15 · 0,08 | 1 · 0,6 · 0,4 · 0,25 · 0,15 | freier Stab, Glockenspiel |

**C – Becken** [H: Spectra = Becken-Stimmung und Filter] – Bauweise [A]:
| Wave | Aufbau | Filter (mit κ) | FREQ |
|---|---|---|---|
| C1 | `MODAL`, 48 Teiltöne `f_k = κ·f0·24^((k − 1 + 0,8·u_k)/48)`, `u_k` aus fester LCG-Folge (a 1664525, c 1013904223, Start 12345), Startphasen ebenso fest; `a_k = ρ_k^(−0,3)`, `g_k = ρ_k^(−0,35)` | Hochpass 12 dB bei `1,5·κ·f0` | Tiefpass-Gewichtung der Teiltöne, Grenze `f0 · 2^(10·F_eff/50)` |
| C2 | 6 Rechteck-Oszillatoren `κ·f0 · {1; 1,483; 1,800; 2,546; 2,630; 3,897}` (Verhältnisse der klassischen analogen Metall-Schaltung) | Bandpass Q 1,5 bei `16·κ·f0`, danach Hochpass 12 dB bei der halben Frequenz | Tiefpass 12 dB von `16·κ·f0` (F 0) bis 20 kHz (F 50) |
| C3 | 3 Ringmod-Paare aus Rechtecken: (1; 1,414) (1,732; 2,236) (2,646; 3,317) × κ·f0 | Hochpass 12 dB bei `8·κ·f0` | wie C2 |
Hi-Hats entstehen aus C2/C3 + NOISE (H1/H2-Filter) mit kurzer Decay; offen/zu über die Mono-Gruppe.

**r – Ringmodulations-Oszillatoren** [H: Spectra verstimmt den Modulator] – Bauweise [A]:
- r1: Sinus-Träger `f0` × `[(1 − m) + m · sin(r·f0)]`, `r` = VERH(S), `m = F_eff/50`.
- r2: Rechteck `f0` × Rechteck `r·f0` (PolyBLEP), danach Tiefpass wie A2.

### 1.5 Abklingen: Modi und Dynamic Decay (TONE und NOISE)
| Modus | TONE | NOISE | Form [A, Handbuch beschreibt nur die Gestalt] |
|---|---|---|---|
| E1 | ✓ (Anzeige „E1“) | ✓ (Anzeige „E“) | `g(t) = 10^(−3·t/T)` → −60 dB bei T, schneller Abfall am Anfang [H] |
| E2 | ✓ | ✓ | `g(t) = 10^(−3·(t/T)^0,7)` (−20 dB schon bei 0,21·T) |
| E3 | ✓ | ✓ | `g(t) = 10^(−3·(t/T)^0,5)` (−20 dB bei 0,11·T) |
| L | ✓ | ✓ | `g(t) = 1 − t/T`, linear [H] |
| P (Punch) | ✓ | – | E1 + kurzer anschlagsabhängiger Anfangsteil [H]: `g(t) = E1(t) · (1 + v · e^(−t/6 ms))` (+6 dB bei v 1) |
| G (Gate) | – | ✓ | voller Pegel bis T [H], dann 2-ms-Kosinus-Ausblendung |
| 0–50 (Dynamic Decay) | ✓ | ✓ | Zahl = Decay bei Anschlag 0 [H]; DECAY = Wert bei vollem Anschlag; `x_eff = Zahl + (DECAY − Zahl) · v` (in Parameter-Einheiten), Form E1 [A] |
- Handbuch-Bild (DECAY 12 / Zahl 38): hart → kurz (12), weich → lang (38); umgekehrt bei 38 / 12. Pegel folgt zusätzlich dem
  Anschlag (§1.11).
- T bezeichnet `T(x_eff)` aus der Zeit-Skala.

### 1.6 BEND, TIME, PITCH, SCL PRE
- **Bend** [H: anschlagsabhängig; + von oben nach unten, − von unten nach oben]: Versatz zu Beginn
  `ΔHT₀ = sign(b) · 48·(|b|/50)² · (0,3 + 0,7·v)` [A]; Verlauf `Δ(t) = ΔHT₀ · (e^(−4t/Tb) − e^(−4)) / (1 − e^(−4))` für
  `t < Tb`, danach 0; `Tb = T(TIME)` [H: TIME = Dauer bis zur Nenn-Tonhöhe]. Wirkt auf alle Oszillatoren/Moden/Resonatoren des
  TONE-Teils, nicht auf NOISE und CLICK [A]. Mittelraste: beim Ziehen über 0 hält der Wert 12 px lang bei 0 [H: Bedienrad
  stoppt kurz in der Mitte].
- **Pitch** 0,0–127,5 in 0,1-Schritten. Display „45.0“, LCD Notenname + Hz.
- **SCL PRE** [H: Harmonien/Akkorde h1–h7, Pentatonik P1–P2, Hang-Stimmungen H1–H5, hexatonisch übermäßig Av, hexatonisch Blues bL;
  Start beim Pitch des niedrigsten Kanals; kein gespeicherter Parameter, sondern Makro; beim Wählen ist Edit All automatisch an].
  Inhalte [A] (Halbtöne über dem Start; Akkord-/Skalenmengen wiederholen sich je Oktave, Hang-Listen sind fest):
  | Code | Inhalt | | Code | Inhalt |
  |---|---|---|---|---|
  | h1 | Dur-Dreiklang 0 4 7 | | P1 | Dur-Pentatonik 0 2 4 7 9 |
  | h2 | Moll-Dreiklang 0 3 7 | | P2 | Moll-Pentatonik 0 3 5 7 10 |
  | h3 | Dur-Septakkord (maj7) 0 4 7 11 | | H1 | 0 7 8 10 12 14 15 17 19 20 22 24 („Kurd“) |
  | h4 | Moll-Septakkord 0 3 7 10 | | H2 | 0 7 10 12 14 15 17 19 22 24 26 27 („Keltisch-Moll“) |
  | h5 | Sus4 0 5 7 | | H3 | 0 7 8 11 12 14 15 17 19 20 23 24 („Hijaz“) |
  | h6 | Quinten 0 7 | | H4 | 0 3 5 7 10 12 14 15 19 22 24 26 („Pygmy“) |
  | h7 | Quarten 0 5 10 | | H5 | 0 4 7 11 12 14 16 18 19 23 24 26 („Ägäisch“) |
  | Av | 0 3 4 7 8 11 | | bL | 0 3 5 6 7 10 |
  Kanal i (0 = niedrigster) bekommt `Start + Stufe(i)`. **Relativ verschieben** [H]: Nach SCL PRE (und immer bei Edit All) ändert
  ein PITCH-Zug an einem Kanal alle Modell-Kanäle um denselben Betrag; die Gruppe hält an, sobald ein Kanal 0,0 oder 127,5 erreicht.

### 1.7 NOISE
[H] Weißrauschen → dynamisches Multimode-Filter; Grenzfrequenz von einer anschlagsabhängigen Hüllkurve bewegt.
Bedien-Paare [H]: RESONANCE/FILT TYPE · FREQ/DYN FILTER · DECAY/MODE.
| Parameter | Bereich [H] | Bauweise [A] |
|---|---|---|
| FILT TYPE | L1 Tiefpass 12 dB · L2 Tiefpass 24 dB · b1 Bandpass 6 dB · b2 Bandpass 12 dB · H1 Hochpass 12 dB · H2 Hochpass 24 dB · H3 Hochpass 24 dB mit leichter Höhen-Dämpfung [H] | SVF; 24 dB = zwei Stufen; b1 = SVF-Bandausgang (6 dB/Okt je Seite), b2 = zwei Bandstufen; H3 = H2 + Tiefpass 6 dB bei `max(3·fc, 6 kHz)` |
| RESONANCE | 0–20 [H] | `Q` nach §1.2 (bei 24 dB nur erste Stufe) |
| FREQ | 0–50 [H] | `fN(n)` §1.2 |
| DYN FILTER | −9…+9 [H: + öffnet, − schließt] | Zuschlag §1.2, abklingend mit `T_f` |
| DECAY | 0–50 [H] | `T(x)` |
| MODE | E, E2, E3, L, G, dann 0–50 [H] | §1.5 |
- Rauschquelle: xorshift32 je Kanal, Startwert fest aus der Slot-ID; jeder Schlag schreitet weiter (zwei Wiedergaben derselben
  Folge ab „Reset“ sind bitgleich) [A, nötig für Golden-Render, Video und Einfrieren].
- Pegelbezug [A]: NOISE bei LVL 50 hat denselben RMS wie ein TONE-Sinus bei LVL 50 (gleiche Zahl = ähnlich laut).
- Weitere NOISE-Parameter nennt das Handbuch nicht; keine dazuerfinden.

### 1.8 CLICK
[H] LEVEL 0–50; TYPE n1–n3 (Rauschformen), P1–P3 (kurze Impulse), H1–H3 (hochpassgefilterte kurze Impulse), C1–C3 (gestimmt,
„zirpend“). Bauweise [A]: 12 Tabellen, beim Laden des Moduls bei der Kontext-Abtastrate gerechnet (fester Zufalls-Startwert),
Spitze 1,0, Wiedergabe ohne Rechenlast; Pegel `G(LEVEL) · v`; Polarität wie die erste Halbwelle des TONE-Teils; unabhängig von
PITCH und BEND.
| Typ | Inhalt | Länge |
|---|---|---|
| n1 | Weißrauschen, lineares Ende | 1,5 ms |
| n2 | Rauschen, Bandpass 5 kHz (Q 1), exp. τ 1 ms | 4 ms |
| n3 | Rauschen, Tiefpass 1,5 kHz („Holz“) | 8 ms |
| P1 / P2 / P3 | Rechteckimpuls 0,05 / 0,3 / 1,2 ms (0,1-ms-Flanken) | wie angegeben |
| H1 / H2 / H3 | P1 → Hochpass 12 dB 2 kHz / P2 → HP 4 kHz / P2 → HP 8 kHz | 1–3 ms |
| C1 / C2 / C3 | Sinus-Chirp 8 → 2 kHz / 4 → 0,8 kHz / 2 → 0,2 kHz, exponentiell | 2 / 4 / 8 ms |

### 1.9 MIX und Kanal-Effekte
Bedien-Paare [H]: LEVEL/TYPE (Click) · NOISE LVL/TONE LVL · CH LEVEL/PAN · EQ FREQ/EQ GAIN · DIST/TYPE · REVERB/DELAY (Anteile).
| Parameter | Bereich [H] | Bauweise [A] |
|---|---|---|
| NOISE LVL, TONE LVL, CH LEVEL | 0–50 | Pegel-Skala `G(x)`, geglättet τ 10 ms |
| PAN | L9 … C … r9 (19 Stufen) | gleiches Pan-Gesetz wie die Synth-Worklets der App |
| EQ FREQ | 0–50, feste Bandbreite [H] | Glocken-EQ (RBJ peaking), Q 1,0, `fE(n)` |
| EQ GAIN | −9…+9 = ±24 dB [H] | 2,667 dB je Stufe; bei 0 umgangen (bitgleich trocken) [H: dann wirkt EQ FREQ nicht] |
| DIST | 0–50 | 0 = umgangen |
| TYPE | dr Röhren-Übersteuerung · SA Abtastraten-Reduktion · rn Ringmodulation mit Sinus (von leichtem Vibrato bis Glockenklang) [H] | **dr:** `tanh(g·x + 0,2) − tanh(0,2)`, `g = 10^(1,5·D/50)` (bis +30 dB), Antialiasing erster Ordnung (ADAA), Pegelausgleich `1/(1 + 0,04·D)` (Ziel ±3 dB RMS über den Weg); **SA:** Halteglied, Rate `48 kHz · (400/48000)^(D/50)` (50 → 400 Hz); **rn:** `x · sin(2π·f_rm·t)`, `f_rm = 1 Hz · 5000^(D/50)` (1 Hz … 5 kHz) |
| RVB (Anteil) | 0–50; 25 = halb/halb, 50 = nur Hall [H] | trocken `× (1 − a/50)`, Hall-Abgriff `× a/50` |
| DLY (Anteil) | 0–50 [H: Pegel des Echos zum trockenen Signal] | gleiches Gesetz wie RVB [A] |

### 1.10 Kit-Effekte (einmal je Drum-Spur)
| Parameter | Bereich [H] | Bauweise [A] |
|---|---|---|
| REVERB TYPE | ti gekachelter Raum · r1, r2 Raum · p1–p4 Platte · St Bühne · hA Halle (klein bis sehr groß) | Dattorro-Tank wie `dirigent-hall` (Code übernehmen, eigene Instanz im Engine-Prozessor) + frühe Reflexionen; Werte unten |
| COLOR | −9…+9; negativ = Höhen weg, positiv = Tiefen weg, 0 = neutral [H] | Hall-Eingang: −c → Tiefpass 12 dB `20 kHz · (1,5k/20k)^(|c|/9)`; +c → Hochpass 12 dB `20 Hz · 75^(c/9)` |
| DELAY RATE | 0–99 = 1,15 s … 10 ms [H] | `t = 1,15 s · (0,01/1,15)^(r/99)` (50 → 105 ms) |
| FEEDBACK | 0–20; 0 = ein Echo, 20 = fast endlos [H] | Rückkopplung `0,97 · f/20`, ohne Klangfilter |
| BPM | Viertel 60–179, danach Achtel 90–179, Sechzehntel 90–300, danach Zeit 0,050–0,001 s [H]; Tap ≥ 4 Schläge [H] | eine Dial-Strecke mit 471 Stellungen (`dlB` 0–470) in dieser Reihenfolge; Tap: Mittel der letzten 3 Abstände |
- Zeitwechsel bei klingendem Echo: Lesezeiger gleitet 50 ms (kein Knack) [A]. Typwechsel: Parameter gleiten, frühe Reflexionen
  mit 40-ms-Blende (wie K-02).
- Hall-Typen [A] (RT60 mittlere Frequenzen, Größe `size`, Dämpfung `damp`, Vorverzögerung, frühe Reflexionen ER):
  | Typ | RT60 | size | damp | vorverz. | ER |
  |---|---|---|---|---|---|
  | ti | 0,7 s | 0,45 | 12 kHz | 4 ms | stark, hell |
  | r1 | 0,4 s | 0,38 | 7 kHz | 2 ms | mittel |
  | r2 | 0,9 s | 0,60 | 6 kHz | 6 ms | mittel |
  | p1 / p2 / p3 / p4 | 0,8 / 1,3 / 2,0 / 3,2 s | 0,5 / 0,7 / 0,9 / 1,1 | 11 kHz | 0 | keine, hohe Diffusion |
  | St | 1,6 s | 1,0 | 5 kHz | 18 ms | spärlich |
  | hA | 3,0 s | 1,4 | 4 kHz | 25 ms | spärlich, mod 0,6 |
- Hall und Echos schlafen, wenn Eingang und Fahne < −100 dBFS für 0,5 s (wie `dirigent-hall`).

### 1.11 Anschlag und Akzent
- **Dynamik-Kurve je Kanal** [H: am Gerät eine Pad-Einstellung je Kanal mit Li linear, L1–L3 logarithmisch verdichtet, O1–O2 Offset
  = wenig Dynamik]. In der App im Kit je Kanal gespeichert (`mCrv`), weil es keine Geräte-Pads gibt [A]. Sie wirkt **nur auf den
  Pegel** [A]: Li `a = v` · L1 `ln(1+3v)/ln 4` · L2 `ln(1+15v)/ln 16` · L3 `ln(1+63v)/ln 64` · O1 `0,6 + 0,4v` · O2 `0,8 + 0,2v`.
- Klangziele (Dyn Filter, Dynamic Decay, Bend, Punch, Click-Pegel) nutzen den linearen Anschlag `v` [A].
- **Akzent** wie die Drum-Stimme heute (§7.1, `accentAmt`): Pegel `× (1 + 0,6·a)` nach CH LEVEL; Klang-Anschlag `min(1, v + 0,3·a)`.
- **Locks** aus den Lanes wie `DrumSeq.lockParams`: TUNE +n → PITCH + n Halbtöne (auch bei C-Modellen die Teiltöne); DECAY ×k →
  TONE- und NOISE-Zeit × k (in Sekunden, nach der Skala).

### 1.12 Stimmen, Neuanschlag, Mono-Gruppe
- Ein Kanal klingt **einstimmig** [H: sechs Kanäle = sechs gleichzeitige Klänge]; ein neuer Schlag übernimmt, die alte Stimme blendet
  in 3 ms aus (zwei Stimmplätze je Kanal, also höchstens 24 Stimmen) [A, wie AR8 der App]. Kanal-Effekte (Dist, EQ, Echo)
  laufen pro Kanal durch, ihr Zustand springt nie.
- **Mono-Gruppe** [H: eine Gruppe je Kit, wird mit dem Kit gespeichert; ein Schlag auf einen Kanal der Gruppe bringt die anderen
  Kanäle der Gruppe zum Schweigen]. Bauweise: `mMono` je Kanal; im Worklet sample-genau, 3-ms-Ausblendung. Nur zwischen
  Modell-Kanälen [A, Frage F6]; die Choke-Gruppen der Drum-Stimme bleiben unverändert.
- Parameter-Änderung während eines Schlags [A, wie §3.5 der App]: Pegel, Pan, EQ, Dist-Menge, RVB/DLY-Anteil gleiten (τ 10 ms);
  alle anderen TONE/NOISE/CLICK-Werte gelten ab dem nächsten Schlag (der klingende läuft unverändert aus).

### 1.13 Bedienfunktionen des Geräts (Umsetzung in ND2)
| Gerät [H] | App |
|---|---|
| CH SELECT, PAD FOLLOW | Instrument-Wahl wie heute (Chips, ‹ ›, „Pad wählt Instrument“ U-03) |
| TRIG | ▶ im Editor (Anschlag 0,8) |
| EDIT ALL CH (nicht gespeichert; SCL PRE schaltet es selbst an; Paste geht dann an alle) | Schalter „ALLE KANÄLE“ |
| SOLO PART (nur der gerade bearbeitete Teil klingt; der Kanal ist für eingehende Noten solo) | Schalter „SOLO PART“ |
| COPY, PASTE, SWAP, INIT SOUND | ⋯-Menü des Kanals |
| DRUM SELECT (Kategorien bd Bassdrums, Sn Snares, to Toms, HH Hi-Hats, Cy Becken, Pc Percussion, Be Glocken, Tu gestimmte Perc., Ef Effekte + Nutzer-Bänke), STORE DRUM | „Programm ▾“ (Bibliothek, Kategorie-Chips + Eigene), „Programm sichern“ |
| DRUM KIT SELECT, STORE KIT | Kits der App (vorhandener Kit-Browser, Sichern) |
| PANIC | Panik der App (beendet auch Hall-/Echo-Fahnen) |

### 1.14 Nicht übernommen (Hardware, MIDI, Speicherverwaltung)
Pads/Trigger-Eingang, Pad Thres/Sens/Type, Pad Layout, Peak-LEDs, Master Level, MIDI-Kanäle/Noten/CC/Program Change/Local,
Sys-Ex, Manager-Programm, Memory Protect, OS-Update, temposensibles Rad (schnell drehen = Anschlag), Tonhöhe über MIDI-Noten.

### 1.15 Stufen-Tabellen (gerechnet: `nd-tools/tables.py`, `nd-tools/t2.py`)

**VERH – Verhältnis-Stufen** (SPECTRA bei F1–F4 und r1–r2; Modulator : Träger):
```
 0– 9  0,5 · 1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9                       ┐ Raster des FM-FELDS (V4c): ½, 1 … 14, 1,41
10–15  10 · 11 · 12 · 13 · 14 · 1,41                                 ┘
16–31  0,25 · 0,333 · 0,667 · 0,75 · 1,25 · 1,333 · 1,5 · 1,667 ·    einfache Brüche (Grundton sinkt, dicht)
       1,75 · 2,25 · 2,333 · 2,5 · 2,667 · 3,5 · 4,5 · 5,5
32–63  0,707 · 1,19 · 1,483 · 1,571 · 1,593 · 1,618 · 1,732 · 1,8 ·  Perkussions-Verhältnisse (Fell, Stab, Glocke,
       1,98 · 2,136 · 2,236 · 2,295 · 2,38 · 2,44 · 2,546 · 2,63 ·   Wurzeln, Metall-Schaltung, Pauke), aufsteigend
       2,646 · 2,653 · 2,67 · 2,718 · 2,756 · 2,917 · 2,94 · 3,142 ·
       3,155 · 3,236 · 3,317 · 3,5 · 3,598 · 3,606 · 3,897 · 5,404
64–99  0,125 · 2^(i·0,2), i = 0 … 35  (0,125 … 16, gleichmäßige       FX-Zone („schräg“)
       Fünftel-Oktaven)
```
**VERST – Verstimm-Stufen** (SPECTRA bei A2–A5 und t2; Halbtöne für Oszillator/Resonator 2):
```
 0      0 (deckungsgleich)
 1–24   +0,02 … +0,48 HT in 2-Cent-Schritten (Schwebung, Breite)
25–48   +1 … +24 HT (alle Intervalle bis zwei Oktaven, exakt temperiert)
49–72   −1 … −24 HT
73–99   die Verhältnisse der VERH-Stufen 37–63 als Halbtöne: +8,33 · +9,51 · +10,18 · +11,83 · +13,14 · +13,93 · +14,38 ·
        +15,01 · +15,44 · +16,18 · +16,74 · +16,85 · +16,89 · +17,00 · +17,31 · +17,55 · +18,53 · +18,67 · +19,82 ·
        +19,89 · +20,33 · +20,76 · +21,69 · +22,17 · +22,20 · +23,55 · +29,21
```

---

## 2. Pakete

Abhängigkeiten und Zweige (Regel 29): **Zweig A** `nd-br-E`: ND1 → ND3. **Zweig B** `nd-br-U`: ND4 (mit Platzhalter-Engine, die
nur A1 spielt, gegen die Nachrichten-Schnittstelle aus ND1 Punkt 2) → ND2. Der Dirigent führt zusammen: ND1 + ND4, dann ND2,
dann ND3. Die Schnittstelle (Nachrichten, Datenfelder) ist in dieser Spec festgelegt und ändert sich im Bau nicht.

### ND1 — Engine-Kern (Worklet `synq-md`)

**Ziel.** Alle Klangteile aus §1 sample-genau in einem AudioWorklet-Prozessor, deterministisch, knackfrei, sparsam.

**Umfang.**
1. **Prozessor** `'synq-md'` in einem eigenen Modul (ASCII-only, Blob/data-URL wie die anderen Worklets), 1 Ausgang stereo,
   kein Eingang. Ein Knoten je Drum-Spur. Alle Tabellen (Sinus 4096, `tan`-Tabelle, 12 Click-Tabellen, Moden-Listen, VERH, VERST,
   C1-Teiltöne) entstehen einmal beim Laden des Moduls (≤ 10 ms Xeon). Alle Puffer (Stimmen 12 × 2, Moden-Zustände bis 48 je
   Stimme, Echo-Leitungen 12 × 1,2 s ≈ 2,8 MB, Hall) im Konstruktor; `process()` legt nichts an (Regel 16).
2. **Nachrichten** (Hauptthread → Worklet, gebündelt je Planungs-Tick):
   `{t:'ch', ch, p}` vollständiges Kanal-Programm (flache `m*`-Werte, §ND4 Daten), höchstens 30/s beim Ziehen;
   `{t:'kit', p}` Kit-Effekte; `{t:'hit', list:[{ch, at, v, acc, tune, dec}]}` mit `at` in Kontextzeit;
   `{t:'mute', ch, solo}` (SOLO PART: `solo` = 'tone'|'noise'|'click'|'all'); `{t:'stop', at, tau}`; `{t:'panic'}`;
   `{t:'reset'}` (Rauschfolgen und Echos auf Anfang, für Offline-Render und Tests).
   Worklet → Hauptthread: `{t:'load', v}` einmal je Sekunde (gleiche Messart wie die Synth-Worklets, M-CPU),
   `{t:'late', n}` Zähler verspäteter Schläge (kommt ein Schlag nach seinem `at`, spielt er sofort; nie verwerfen).
3. **Alle 34 Modelle** nach §1.4, NOISE §1.7, CLICK §1.8, Abklingen §1.5, Bend §1.6, Mix/Dist/EQ/Anteile §1.9, Hall/Echo §1.10,
   Anschlag/Akzent/Locks §1.11, Stimmen/Mono §1.12. Abbildungen exakt nach §1.2.
4. **Glätten** (Regel 12): Pegel, Pan, EQ (Koeffizienten-Interpolation 16 Samples), Dist-Menge, Anteile τ 10 ms; Echozeit 50 ms;
   Halltyp siehe §1.10. Strukturwerte ab dem nächsten Schlag.
5. **Schutz** (Regel 17): Denormal-Grenze 1e-15 in Resonatoren, Filtern, Echo, Hall; Endlichkeits-Prüfung je Block: ein Kanal mit
   NaN/Inf wird stumm geschaltet und neu initialisiert (`logErr` höchstens einmal je 5 s).
6. **Schlafen:** ein Kanal ohne Stimme, dessen Echo < −100 dBFS ist, wird übersprungen; ohne jede Aktivität schreibt `process()` nur
   Nullen (Leerlauf ≤ 0,1 % M-CPU).
7. **CPU-Begrenzer** (bestehende Stufen §14.3): Engine-Last zählt in `cpuLoad()`. Stufe ≥ 1: Modalmodelle höchstens 24 Moden
   (C1 48 → 24, H 32 → 16); Stufe ≥ 2: höchstens 12 Moden, frühe Reflexionen aus. **Nie im Offline-Render.** Gespeicherte Werte
   bleiben unverändert (Arbeitskopie wie `limited()`).
8. **Abtastraten** 44,1 und 48 kHz (iPhone): alle Zeiten, Frequenzen und Tabellen aus `sampleRate`.

**CPU-Rahmen** [A] (M-CPU, Chromium-Worklet, Xeon, Median 10 s; iPhone 12 Pro Max: Faktor unbelegt, Annahme 1,5–2,5 ×,
Gerätetest durch Xander, siehe Abnahme):
| Teil | je Stimme höchstens |
|---|---|
| A, t, r, P, F1/F2/F4 | 0,15 % |
| F3, C2, C3, d1–d7 | 0,25 % |
| H1–H6 (32 Moden) | 0,35 % |
| C1 (48 Moden) | 0,50 % |
| NOISE (24 dB), CLICK | 0,10 % / ≈ 0 |
| Kanal-Effekte (Dist, EQ, Echo) | 0,10 % je aktivem Kanal |
| Hall (gemeinsam) | 1,0 % |
| **Engine gesamt, schlimmster Fall** (12 Kanäle C1 + NOISE + Dist + Echo, Hall) | **≤ 8 %** |
| **typischer Groove** (Kit ND3 „Fell & Holz“, 16tel, 16 Takte) | **≤ 3 %** |

**Berührungspunkte.** Neues Modul; Lade-Kette wie `dirigent-analog` (Blob → data-URL); `cpuLoad()`; Offline-Render-Pfad
(`addModule` im OfflineAudioContext wie Zeile `oc.audioWorklet.addModule`).

**Dauer** 16–20 h · **Budget** +45 KB (Worklet-Quelle).

**Abnahme ND1** (Node-Shim des Worklets und Chromium-Worklet, 48 und 44,1 kHz; Messverfahren Anhang M):
- [ ] ND1-01 **Signalweg:** TONE, NOISE, CLICK je allein (andere LVL 0) und zusammen: Summe = Einzelteile (M-NULL ≤ −90 dB, ohne Dist).
  SOLO PART 'tone' an einem Kanal: NOISE/CLICK ≤ −120 dBFS, andere Kanäle stumm.
- [ ] ND1-02 **Pitch:** A1 bei 69.0 → 440,00 Hz ± 0,5 Cent (M-CENT); 69.1 → +10 ± 0,5 Cent; 33.0 → 55 Hz; 127.5 klingt, kein NaN.
- [ ] ND1-03 **Bend:** A1, PITCH 45, BEND +26, TIME 30, v 1: Versatz im ersten 3-ms-Fenster = +1298 Cent ± 2 %; bei `t = T(30)`
  (437 ms) ± 5 % < 5 Cent; BEND −26 spiegelbildlich (Start −1298 Cent, steigt); v 0,3 → Versatz × 0,51 ± 3 %; BEND 50, v 1 →
  +4800 Cent ± 2 %.
- [ ] ND1-04 **Abklingen:** A1, DECAY 10/25/40: E1 → M-T60 = 19 / 200 / 2091 ms ± 10 %; L → −60 dB bei T ± 5 %, Hüllkurve linear
  (R² ≥ 0,99 im Amplitudenmaß); E2/E3 → −60 dB bei T ± 10 % und −20 dB bei 0,21·T bzw. 0,11·T ± 15 %; NOISE G → Pegel bis
  0,95·T innerhalb 1 dB, danach in ≤ 3 ms um > 40 dB gefallen. Gleiche Werte bei d2, P1, t1 (Grundton-T60 ± 10 %).
- [ ] ND1-05 **Dynamic Decay:** DECAY 12, MODE 38: v 1 → T60 = T(12) ± 10 %, v 0,01 → T(38) ± 10 %, v 0,5 → T(25) ± 10 %;
  DECAY 38, MODE 12 umgekehrt.
- [ ] ND1-06 **Punch:** P gegen E1 (sonst gleich), v 1: M-PEGEL 0–5 ms +3 … +5 dB, T60 ± 10 % gleich; v 0,2: +0,8 … +1,6 dB.
- [ ] ND1-07 **Noise-Filter:** je Typ mit Dauerrauschen (Decay-Modus G, 50), FFT-Mittel: Flanken 12/24/6/12/12/24 dB je Oktave
  ± 2 dB (1–2 Oktaven von fc), fc = `fN(n)` ± 5 % für n 10/25/40; H3 hat bei `max(3fc, 6 kHz)` −3 dB ± 1 gegenüber H2;
  RES 20 (L1): Überhöhung ≥ +20 dB, RES 0: ≤ +0,5 dB.
- [ ] ND1-08 **Dyn Filter:** NOISE L1, FREQ 15, DF +5, v 1: M-SP im ersten 10-ms-Fenster entspricht `fN(38) ± 1 Einheit`; DF −5 bei
  FREQ 38: entspricht `fN(15) ± 1`; DF 0: kein Unterschied zwischen v 0,3 und v 1 im M-SP (± 2 %). TONE A3, DF 9 gegen 0: M-SP 0–10 ms
  ≥ +1 Oktave.
- [ ] ND1-09 **Moden-Verhältnisse** (M-MODEN): d1–d7, P1–P4, H1–H6, C2 – die stärksten 6 Spitzen (d2/d6: 8) liegen bei den
  Tabellen-Verhältnissen § 1.4 ± 0,3 % (H6 nach Streckformel); d-Modelle: SPECTRA 33 → Fell-Grundton = Körper ± 3 Cent,
  SPECTRA 66 → Fell ×2 ± 0,3 %, Körper-Spitze bleibt bei `f0`.
- [ ] ND1-10 **Resonanz-Mitte:** H1, P1, C1 – SPECTRA in 10 Schritten über 0–99: M-SP steigt streng (Spearman ρ ≥ 0,95);
  P1 SPECTRA 24: Grundton +12 dB ± 2 und T60 ×1,5 ± 15 % gegen SPECTRA 0.
- [ ] ND1-11 **FM:** F1, f0 200 Hz, VERH-Stufe 2 (×2): Spitzen bei 200, 600, 1000 Hz (± 1 Hz), keine bei 400/800 (≤ −50 dB);
  FREQ 0 → reiner Sinus (Seitenbänder ≤ −60 dB); FREQ 10/25/50 → Index 0,4/2,5/10 (Bessel-Abgleich J0/J1 ± 1 dB);
  Bend +12 HT verschiebt alle Seitenbänder um ×2 ± 0,3 % (Verhältnis bleibt).
- [ ] ND1-12 **Analog:** A3, PITCH 96 (2,09 kHz), FREQ 50, 48 kHz: Spiegelfrequenzen ≤ −45 dB unter dem Grundton; FREQ 0:
  2. Teilton ≤ −15 dB; A2 SPECTRA 31 (+7 HT): zweite Spitze bei ×1,498 ± 0,1 %; A6 SPECTRA 99: Anfangs-Pulsbreite 5 % ± 1 %.
- [ ] ND1-13 **T-Brücke:** t1 FREQ 0 → 2. Teilton ≤ −30 dB, FREQ 50 → ≥ −20 dB (stetig steigend in 5 Schritten); t2 FREQ 0/25/50 →
  Resonator 2 bei −∞/0/+∞ dB relativ (≤ −60 dB, 0 ± 1 dB, Resonator 1 ≤ −60 dB).
- [ ] ND1-14 **Ringmod:** r1, f0 300 Hz, VERH ×1,5, FREQ 50: Spitzen 150 und 750 Hz ± 1 Hz, 300 Hz ≤ −30 dB; FREQ 0: nur 300 Hz.
- [ ] ND1-15 **Becken:** C2 – die 6 Grundfrequenzen der Rechtecke bei den Tabellenwerten × κ·f0 ± 0,3 % (vor dem Bandpass gemessen);
  SPECTRA 75 gegen 50: alle Spitzen ×1,414 ± 0,5 %; C1/C3: Harmonizitäts-Maß < 0,3 (kein Teiltonraster).
- [ ] ND1-16 **Click:** 12 Typen: Länge und M-SP je Tabelle ± 10 %; P-Typen haben ihre Spitze im ersten Sample nach `at`; Polarität =
  erste Halbwelle des TONE-Teils (A1, d2, t1 geprüft).
- [ ] ND1-17 **Pegel:** TONE LVL 50 → 25: −12,0 ± 0,2 dB; CH LEVEL ebenso; NOISE LVL 50 und TONE A1 LVL 50: RMS-Differenz ≤ 1 dB;
  PAN L9: rechts ≤ −90 dB, C: L = R ± 0,1 dB, gleiches Pan-Gesetz wie die Synth-Worklets (Vergleich ± 0,1 dB bei 7 Stellungen).
- [ ] ND1-18 **EQ:** GAIN ±9 → ±24,0 ± 0,5 dB bei `fE(n)` ± 3 % (n 10/25/40); GAIN 0 → M-NULL gegen ohne EQ ≤ −120 dB.
- [ ] ND1-19 **Dist:** dr 0 → 50: Klirrfaktor steigt stetig, M-PEGEL-Änderung ≤ ±3 dB; SA 25 → Halterate 4,4 kHz ± 5 %
  (Spiegelbilder messbar); rn 25 → Seitenbänder bei `f ± 70,7 Hz` ± 1 Hz.
- [ ] ND1-20 **Anteile:** RVB 25 → trockener Anteil −6,02 ± 0,1 dB; RVB 50 → trocken ≤ −90 dB; DLY ebenso.
- [ ] ND1-21 **Echo:** RATE 0 → 1150 ms ± 1 ms, 50 → 104,7 ms, 99 → 10,0 ms; FEEDBACK 0 → genau ein Echo; 20 → je Wiederholung
  −0,26 ± 0,05 dB; BPM-Strecke: Viertel 120 → 500 ms, Achtel 120 → 250 ms, Sechzehntel 300 → 50 ms, dann 1 ms-Schritte;
  Tap 4 × 500 ms → Viertel 120. Echo eines gepannten Kanals (L9) kommt links (rechts ≤ −90 dB).
- [ ] ND1-22 **Hall:** RT60 je Typ ± 15 % der Tabelle §1.10; COLOR (Hall-Eingang über Test-API, −3-dB-Punkt): −9 → Tiefpass 1,5 kHz,
  −4,5 → 5,48 kHz, +4,5 → Hochpass 173 Hz, +9 → 1,5 kHz (je ± 10 %); 0: ± 0,5 dB 40 Hz – 16 kHz.
- [ ] ND1-23 **Knackfrei** (M-KLICK ≤ 6 dB, M-EINBRUCH ≤ 3 dB): Neuanschlag in 16tel-Wirbel (1/64 bei 180 BPM); Mono-Gruppe
  (offene Hi-Hat 2 s, geschlossene schlägt) – offene ist nach ≤ 4 ms unter −60 dB; Ziehen von CH LEVEL, PAN, EQ, DIST, RVB, DLY über
  den ganzen Weg in 1 s auf klingendem Ton; Echo-RATE 0 → 99 bei klingender Fahne; Halltyp-Wechsel; Programmwechsel auf klingendem
  Kanal; Panik.
- [ ] ND1-24 **Dynamik-Kurven:** v 0,5 → Li −6,02 ± 0,2 dB; v 0,35 → L1 −5,7, L2 −3,6, L3 −2,5, O1 −2,6, O2 −1,2 dB (je ± 0,3);
  Klangziele (ND1-08) unabhängig von der Kurve.
- [ ] ND1-25 **Akzent und Locks:** Akzent 0,5 → +3,7 ± 0,2 dB (wie Drum-Stimme); TUNE +12 → +1200 ± 1 Cent; DECAY ×2 → T60 ×2 ± 10 %.
- [ ] ND1-26 **Bitgleich:** zwei Offline-Render derselben Folge nach `reset` M-NULL = −∞ (bitgleich); 44,1 und 48 kHz je für sich.
- [ ] ND1-27 **Robust:** 10 min Zufalls-Parameterflug (alle Grenzen, RES 20, FM 50, FEEDBACK 20, BEND ±50, DIST 50) mit 16tel-Schlägen
  auf 12 Kanälen: kein NaN/Inf, Gleichanteil ≤ 0,005, Spitze ≤ +12 dBFS vor dem Master-Limiter, `late` = 0 bei 25-ms-Vorlauf.
- [ ] ND1-28 **CPU** nach Tabelle (Chromium, Xeon, M-CPU); Leerlauf ≤ 0,1 %; Modul-Laden (Tabellen) ≤ 10 ms; kein GC-Ereignis
  während 60 s Render im Node-Shim (`--trace-gc`), Heap ± 1 MB.
- [ ] ND1-29 **ASCII-Prüfung** der Worklet-Quelle; kein Gerätename in Quelle/Kommentaren (`grep -i 'nord'` = 0 Treffer).
- [ ] ND1-30 **Gerätetest Xander (iPhone 12 Pro Max, Pages-Seite):** Kit „Schräg“ + 4 Synth-Spuren, 16 Takte: keine Aussetzer; Engine-
  Last aus `engineInfo()` im Changelog. (Kein WebKit im Bau verfügbar – „Bitte prüfen“-Liste.)

**Tests.** `dirigent-test/md1-node.mjs` (Node-Shim, Messungen ND1-01…27), `md1-cpu.mjs` (Chromium), `md1-click.mjs` (M-KLICK).

### ND2 — Editor (Bedienung wie am Gerät, App-Stil)

**Ziel.** Jeder Parameter aus §1 ist mit dem Finger erreichbar, zeigt seinen Wert wie das Gerät und sagt im LCD auf Deutsch, was er
tut. Die Drum-Stimme und ihr Editor bleiben für Pads mit Quelle „Drum“ unverändert.

**Umfang.**
1. **SOUND-Reiter eines Modell-Pads** (Drum-Editor, `buildDrumEd` → `pageMdSound`):
   - Zeile A: Instrument-Chips wie heute (auf kurzen Schirmen `drumInstBtn`, wie heute).
   - Zeile B: [■ KICK ▾] · **[Quelle: `MD_NAME` ▾]** (aus ND4) · **[Programm ▾]** (DRUM SELECT).
   - Zeile C: Unter-Reiter **TONE │ NOISE │ CLICK │ MIX │ FX** (Unter-Reiter-Zeile von `sheetFrame`).
   - Feld: Zellen in Geräte-Paaren, je Zelle Name (Geräte-Beschriftung), Wert groß, Unterzeile klein:
     TONE 5 × 2 (SPECTRA FREQ DECAY BEND PITCH / WAVE DYN FILTER MODE TIME SCL PRE) · NOISE 3 × 2 (RESONANCE FREQ DECAY /
     FILT TYPE DYN FILTER MODE) · CLICK 1 × 2 (LEVEL / TYPE) · MIX 2 × 2 (NOISE LVL CH LEVEL / TONE LVL PAN) ·
     FX 3 × 2 (EQ FREQ DIST REVERB / EQ GAIN TYPE DELAY).
   - Zeile E: **[ALLE KANÄLE]** · **[SOLO PART]** · **[▶]** · **[⋯]** (Kopieren, Einfügen, Tauschen, Init, Programm sichern).
   - LCD-Zeile der App (`lcdShow`) = Wert-Display des Geräts: zuletzt berührter Parameter, Wert in Geräte-Schreibweise und deutsche
     Bedeutung (z. B. „WAVE d3 · Fell, luftbelastet (Kessel)“, „FREQ 32 · Härte 0,4 ms“, „BEND -26 · beginnt 13,0 HT tiefer“).
2. **Zellen-Bedienung** (Regel 4): senkrecht ziehen = Wert, seitlich weg = Fein-Modus (§v2-10.2), Doppeltipp = INIT-Wert,
   Tipp = auswählen (LCD). Listen-Werte (WAVE, MODE, FILT TYPE, TYPE, DIST TYPE, SCL PRE) gehen beim Ziehen Stufe für Stufe
   (wie das Rad) und öffnen beim Tipp eine Liste. Zweipolige Werte (BEND, NOISE DYN FILTER, EQ GAIN, PAN) mit Mittelraste (§1.6).
   PITCH: normal 1 HT je Stufe, Fein 0,1.
3. **WAVE-Liste:** Popover mit 34 Feldern in 8 Familienzeilen (A, t, F, H, d, P, C, r), je Feld Code groß + 1 Wort (z. B. „d3 Kessel“),
   ≥ 44 × 44; Tipp = wählen + hören (bei stehendem Transport), ein Undo.
4. **Werte wie am Gerät** [H]: Codes (A1…r2, L1 L2 b1 b2 H1 H2 H3, n1…C3, dr SA rn, ti r1 r2 p1–p4 St hA, Li L1–L3 O1 O2, h1…bL),
   Zahlenbereiche §1, PITCH „45.0“, PAN „L9 … C … r9“, MODE „E1 E2 E3 L P“ (NOISE „E E2 E3 L G“), danach Zahlen 0–50.
   Zellen ohne Wirkung sind grau mit „–“ (SPECTRA bei A1/t1; FREQ, DYN FILTER bei A1; EQ FREQ bei GAIN 0) [H].
5. **ALLE KANÄLE** (Edit All): jede Änderung gilt für alle Modell-Kanäle (gleicher Wert); PITCH relativ mit Gruppen-Grenze (§1.6);
   Einfügen geht an alle Modell-Kanäle. SCL PRE schaltet es für die Wahl selbst an [H]. Nicht gespeichert; endet mit Schließen des
   Editors, ■, Szenenwechsel (Regel 6). Alle Kanal-Chips/Pads zeigen den Fokus (Rahmen) solange an.
6. **SOLO PART:** nur der Teil des offenen Unter-Reiters klingt (TONE/NOISE/CLICK; bei MIX/FX der ganze Kanal), andere Kanäle
   schweigen – im Vorhören und im Sequencer. Endet wie ALLE KANÄLE. Anzeige „SOLO PART“ im Kopf, solange an.
7. **TIEF-Reiter eines Modell-Pads** zeigt die Seite **KANAL**: DYNAMICS (Kurve Li…O2), MONO-GRUPPE (an/aus), Übersicht der
   12 Pads (Quelle, Programmname, Mono ●), Tipp auf eine Zeile = dieses Pad wählen. Die TIEF-Schichten der Drum-Stimme bleiben
   gespeichert und erscheinen wieder, wenn das Pad zurück auf „Drum“ geht.
8. **KIT-Reiter:** Block „`MD_NAME` · HALL & ECHO“ (nur sichtbar, wenn mindestens ein Modell-Pad existiert): REVERB TYPE, COLOR,
   [RATE │ BPM], RATE bzw. BPM (Anzeige „120 ♩“, „150 ♪“, „200 ♬“, danach „0.050 s“), FEEDBACK, **[TAP]** (≥ 64 × 44; Anzeige der
   Schläge 1–3, ab dem 4. das Tempo [H]).
9. **Programm ▾** (DRUM SELECT) und **Programm sichern** (STORE DRUM): Liste wie `openSlotLoad`, oben Kategorie-Chips
   bd · Sn · to · HH · Cy · Pc · Be · Tu · Ef · Eigene (deutsche Unterzeile: Bassdrum, Snare, Toms, Hi-Hats, Becken, Percussion,
   Glocken, Gestimmt, Effekte), Liste per Finger scrollbar (Regel 3). Tipp = Programm in den Kanal + hören, ein Undo.
   Sichern: Name (≤ 16 Zeichen) + Kategorie → eigene Programme (Bibliothek, `engine:'mdp'`, je Konto wie eigene Sounds).
10. **Vorhören:** wie bei den Drum-Reglern heute – Loslassen → einmal hören (Anschlag 0,8), beim Ziehen höchstens alle 300 ms;
    nicht bei laufendem Transport.
11. **Formate** (M-PLATZ, echte App-Schrift): 390×844 (wie oben, Zeilen 44 px, Zellen ≥ 64 × 64), 375×667 (Zellen 56 hoch),
    320×568 (Zeile A als `drumInstBtn`, Zellen 57 × 52), Querformat 844×390 / 667×375 / 926×428: Zeile B und E zusammen in
    einer Zeile, darunter Unter-Reiter C, darunter alle Zellen des Unter-Reiters in **einer** Reihe (TONE 10 Zellen ≥ 58 px breit,
    64 px hoch); Gesamthöhe ≈ 44 + 44 + 44 + 64 px; kein Layout-Sprung beim Wechsel von Unter-Reiter, Quelle oder Popover
    (Blatthöhe konstant).
12. Undo: jede Geste/Wahl **ein** Schritt über `soundEdit(DRUM_T, …)`; ALLE KANÄLE-Geste = ein Schritt für alle Kanäle;
    Kopieren/Einfügen/Tauschen/Init je ein Schritt.

**Berührungspunkte.** `buildDrumEd`, `DTABS`-Seitenwahl (SOUND/TIEF/KIT je Quelle), `dKnob`/`dKnobs` (Zellen-Bauteil wiederverwenden),
`lcdShow`, `openPop`, `openSlotLoad`-Muster, `drumAudition`, `pageDrumKit`, Hilfe-Zeilen (U-07).

**Dauer** 8–10 h · **Budget** +30 KB.

**Abnahme ND2** (Chromium + CDP-Touch, P1 P2 P3 L1 L2 W):
- [ ] ND2-01 Pad mit Quelle „Drum“: SOUND/TIEF/KIT wie 4.24.0 (Bildvergleich, DOM-Struktur gleich).
- [ ] ND2-02 M-PLATZ in allen 6 Formaten für jeden Unter-Reiter, KANAL, KIT-Block, WAVE-Liste, Programm-Liste: nichts abgeschnitten,
  jede Trefferfläche ≥ 44 × 44, kein waagrechtes Scrollen, Blatthöhe vor/nach jedem Umschalten gleich (± 0 px).
- [ ] ND2-03 Jedes der 30 Kanal-Bedienelemente (TONE 10 inkl. SCL PRE, NOISE 6, CLICK 2, MIX 4, FX 6, KANAL 2) und der 6 Kit-
  Bedienelemente: Ziehen ändert den Wert, Anzeige in Geräte-Schreibweise (Tabelle §1 je
  Grenze und Mitte geprüft), Doppeltipp = INIT, Fein-Modus 0,1 bei PITCH, Mittelraste bei den 4 zweipoligen.
- [ ] ND2-04 Wirkung jedes Parameters (H-1 sinngemäß): min → max ändert die zugehörige Messgröße aus ND1 (Liste im Test) messbar;
  graue Zellen wirken nachweislich nicht (M-NULL ≤ −120 dB).
- [ ] ND2-05 ALLE KANÄLE: DECAY auf 4 Modell-Kanälen = gleicher Wert, ein Undo stellt alle 4 her; PITCH +3 an einem → alle +3; Gruppe hält
  am Rand (127.5) an; Ende mit Editor-Schließen, ■, Szenenwechsel.
- [ ] ND2-06 SCL PRE h1 mit Start 40.0 auf 6 Kanälen → 40 44 47 52 56 59; H1 auf 12 Kanälen → Liste H1; danach PITCH +2 an Kanal 3 →
  alle +2. Kein gespeichertes Feld `scl` (deep-equal ohne).
- [ ] ND2-07 SOLO PART: im Unter-Reiter NOISE klingt nur NOISE des Kanals (TONE/CLICK ≤ −120 dBFS), andere Kanäle im laufenden Muster stumm;
  aus → alles wie vorher (M-NULL ≤ −90 dB gegen Render ohne SOLO).
- [ ] ND2-08 Kopieren/Einfügen/Tauschen/Init: Ergebnis deep-equal zur Erwartung; je ein Undo; Einfügen mit ALLE KANÄLE → alle Modell-Kanäle.
- [ ] ND2-09 WAVE-Liste: 34 Felder, Tipp = Wahl + Vorhören (nur bei stehendem Transport), ein Undo; Wischen in der Liste scrollt, wählt nicht.
- [ ] ND2-10 KIT-Block: TAP 4 × im Abstand 500 ms → „120 ♩“; RATE/BPM-Umschalter ändert die Echo-Zeit hörbar (ND1-21-Werte).
- [ ] ND2-11 Programm ▾: Kategorie-Chip filtert, Tipp lädt (deep-equal Programm), ein Undo; Sichern → erscheint unter „Eigene“,
  nach Neuladen noch da.
- [ ] ND2-12 Kein Gerätename und kein Marken-Logo in DOM, Hilfe und CSS (`grep -i 'nord'` im App-HTML = 0); `MD_NAME` steht an allen
  Anzeigeorten (Austausch des Werts im Test → alle Anzeigen folgen).
- [ ] ND2-13 Öffnen des Editors auf einem Modell-Pad: keine lange Aufgabe > 50 ms (Chromium Performance), Vorhören ≤ 30 ms nach Loslassen.

**Tests.** `md2-ui.mjs` (P/L, Touch), `md2-shots.mjs` (Bilder für Xander).

### ND3 — Eigene Startklänge und Kits (keine Gerätedaten)

**Ziel.** Jeder Klang bekommt, was sein perkussiver Charakter braucht (Xander 31.10.): Kick = Körper + Klick, Snare = Ton + Rauschen,
Hats = Metall, Toms = Fell mit Bend, Percussion/Glocken/Gestimmt = passende Modelle, Effekte = schräg. **Keine Werks-Programme des
Geräts**, keine Namen von Geräten, Herstellern oder Künstlern.

**Umfang.**
1. **45 Programme**, 5 je Kategorie. Startwerte (nachstimmen per Messung, Kanal sonst INIT §ND4; Zeiten nach `T(x)`):
| Kat. | Name | TONE | NOISE | CLICK / Rest |
|---|---|---|---|---|
| bd | Rund | A1, P 31.0, DEC 28 E1, BEND +28, TIME 18 | – | P2 22 · Dist dr 6 |
| bd | Brücke | t1, P 29.0, FREQ 18, DEC 34 E1, BEND +18, TIME 20 | – | H1 18 |
| bd | Fellkick | d1, P 33.0, SPC 40, FREQ 20, DF 4, DEC 27 E2, BEND +12, TIME 16 | L2, FREQ 20, DEC 12, LVL 18 | n3 20 |
| bd | FM-Druck | F1, SPC 1 (×1), FREQ 8, DF 6, P 34.0, DEC 26 P, BEND +30, TIME 15 | – | P1 25 |
| bd | Verzerrt | A2, FREQ 14, P 32.0, DEC 30 E1, BEND +25, TIME 17 | – | H2 24 · dr 30 · EQ 18/−3 |
| Sn | Klassisch | t2, SPC 35 (+11 HT), FREQ 25, P 54.0, DEC 20 E1, BEND +8, TIME 12 | H1, FREQ 36, RES 2, DF +3, DEC 24 E2, LVL 42 | P2 20 · TONE LVL 38 |
| Sn | Fell | d5, P 55.0, SPC 33, FREQ 30, DF 5, DEC 22 E2, BEND +5, TIME 10 | b2, FREQ 40, RES 4, DEC 22 E1, LVL 34 | n1 18 |
| Sn | Gated | d2, P 57.0, SPC 40, FREQ 34, DEC 16 E3 | H2, FREQ 42, DEC 26 G, LVL 44 | P1 18 · RVB 14 |
| Sn | FM-Snare | F2, SPC 22 (×1,5), FREQ 24, DF 5, P 57.0, DEC 18 E1, BEND +10, TIME 10 | L2, FREQ 44, DEC 22 E1, LVL 36 | n2 16 |
| Sn | Rausch-Klatsch | TONE LVL 0 | b2, FREQ 34, RES 6, DF +2, DEC 24 E3, LVL 46 | n2 30 · RVB 10 |
| to | Fell tief | d2, P 43.0, SPC 36, FREQ 18, DF 4, DEC 31 E1, BEND +14, TIME 22 | L1, FREQ 22, DEC 14, LVL 10 | n3 14 |
| to | Fell mitte | wie Fell tief, P 48.0 | wie oben | wie oben |
| to | Fell hoch | wie Fell tief, P 53.0 | wie oben | wie oben |
| to | Elektro-Tom | A2, SPC 3, FREQ 12, P 50.0, DEC 28 E1, BEND +30, TIME 24 | – | P2 12 |
| to | Kessel | d3, P 45.0, SPC 33, FREQ 16, DEC 38 E1, BEND +4, TIME 26 | – | n3 10 · RVB 10 |
| HH | Zu | C2, P 58.0, SPC 50, FREQ 38, DF 3, DEC 14 E3 | H2, FREQ 44, DEC 12 E3, LVL 22 | Mono ● |
| HH | Offen | wie Zu, DEC 30 E1 | wie Zu, DEC 28 E1 | Mono ● |
| HH | Pedal | wie Zu, DEC 10 E3 | LVL 10 | n1 10 · Mono ● |
| HH | Ring-Metall | C3, P 62.0, SPC 55, FREQ 40, DEC 13 E2 | H2, FREQ 45, DEC 11, LVL 16 | Mono ● |
| HH | Rausch-Hat | TONE LVL 0 | H2, FREQ 45, RES 6, DF +2, DEC 13 E3, LVL 46 | H3 12 |
| Cy | Crash | C1, P 64.0, SPC 50, FREQ 40, DF 4, DEC 40 E1 | H1, FREQ 40, DEC 34, LVL 20 | – |
| Cy | Ride | C1, P 70.0, SPC 62, FREQ 30, DEC 42 E1 | – | C1 16 |
| Cy | China | C3, P 61.0, SPC 40, FREQ 44, DEC 38 E2 | – | dr 10 |
| Cy | Splash | C1, P 72.0, SPC 70, FREQ 44, DEC 33 E2 | H1, FREQ 42, DEC 26, LVL 14 | – |
| Cy | Gong-Becken | F3, SPC 41 (×2,136), FREQ 30, P 52.0, DEC 42 E1, BEND −3, TIME 30 | – | RVB 16 |
| Pc | Holzblock | P3, P 79.0, SPC 40, FREQ 40, DEC 14 E2 | – | P1 16 |
| Pc | Kuhglocke | A4, SPC 31 (+7 HT), FREQ 30, P 73.0, DEC 22 E3 | – | EQ 37/+3 |
| Pc | Conga | d7, P 57.0, SPC 36, FREQ 26, DF 5, DEC 26 E1, BEND +4, TIME 12 | – | n3 12 |
| Pc | Shaker | TONE LVL 0 | H1, FREQ 44, DEC 14 L, LVL 40 | – |
| Pc | Klangholz | t1, P 99.0, FREQ 10, DEC 12 E1 | – | P1 20 |
| Be | Glocke | F3, SPC 29 (×3,5), FREQ 26, DF 3, P 72.0, DEC 40 E1 | – | RVB 12 |
| Be | Röhre | P4, P 67.0, SPC 50, FREQ 32, DEC 42 E1 | – | – |
| Be | Ring-Glocke | r1, SPC 15 (×1,41), FREQ 40, P 76.0, DEC 36 E1 | – | – |
| Be | Kristall | H6, P 84.0, SPC 30, FREQ 34, DEC 38 E1 | – | RVB 14 |
| Be | Doppelglocke | F4, SPC 2 (×2), FREQ 22, P 81.0, DEC 24 E2 | – | – |
| Tu | Marimba | P1, P 60.0, SPC 24, FREQ 22, DF 4, DEC 32 E1 | – | – |
| Tu | Vibra | P2, P 65.0, SPC 24, FREQ 26, DEC 40 E1 | – | RVB 14 |
| Tu | Xylo | P3, P 72.0, SPC 24, FREQ 34, DEC 22 E2 | – | – |
| Tu | Stahltrommel | H1, P 62.0, SPC 40, FREQ 30, DEC 30 E1 | – | – |
| Tu | Handtrommel | d4, P 62.0, SPC 33, FREQ 28, DF 5, DEC 28 E1, BEND −8, TIME 20 | – | n3 10 |
| Ef | Laser | A3, SPC 36 (+12 HT), FREQ 40, P 84.0, DEC 24 L, BEND +45, TIME 26 | – | – |
| Ef | Tropfen | A1, P 79.0, DEC 18 E1, BEND −36, TIME 14 | – | RVB 18 |
| Ef | Lo-Fi-Zap | F2, SPC 70, FREQ 36, P 70.0, DEC 22 E1, BEND +40, TIME 22 | – | SA 30 |
| Ef | Ringmod-Blech | r2, SPC 57 (×3,236), FREQ 44, P 55.0, DEC 30 E2 | – | rn 26 |
| Ef | Rausch-Sweep | TONE LVL 0 | b2, FREQ 20, RES 16, DF +9, DEC 36 L, LVL 44 | DLY 20 |
2. **Pad-Start nach Rolle:** Der erste Wechsel eines Pads auf `md` lädt das passende Programm statt eines neutralen Klangs:
   KICK → bd Rund · SNARE → Sn Klassisch · RIM → Pc Klangholz · CLAP → Sn Rausch-Klatsch · HH ZU → HH Zu · HH OFFEN → HH Offen ·
   TOM TIEF/MITTE/HOCH → to Fell tief/mitte/hoch · BECKEN → Cy Crash · PERC → Pc Kuhglocke · SHAKER → Pc Shaker.
3. **4 Kits** (alle 12 Pads `md`, Kit-Effekte gesetzt): **Fell & Holz** (Fellkick, Fell, Holzblock, Rausch-Klatsch, Zu, Offen, Fell tief/
   mitte/hoch, Crash, Conga, Shaker; Hall r2, RVB 6–12) · **Modell-Analog** (Rund, Klassisch, Klangholz, Rausch-Klatsch, Zu, Offen,
   Elektro-Tom auf 45/50/55, Ride, Kuhglocke, Rausch-Hat; Hall p2) · **Gestimmt** (Brücke, FM-Snare, Klangholz, Doppelglocke,
   Ring-Metall + Offen, Marimba auf TOM TIEF/MITTE/HOCH mit PITCH 57.0/64.0/65.0 = Stufen 0, 7, 8 der Hang-Liste H1, Gong-Becken,
   Vibra, Kristall; Hall hA) · **Schräg** (FM-Druck, FM-Snare,
   Lo-Fi-Zap, Ringmod-Blech, Rausch-Hat, Offen/C3, Laser, Tropfen, Elektro-Tom, China, Ring-Glocke, Rausch-Sweep; Echo BPM ⅛).
   Kit-Namen und ⓘ-Texte ohne Vorbild-Namen.
4. Die Programme liegen als Daten (≤ 12 KB) im App-HTML, Kategorie `mCat`, Bibliothek-Zeilen schreibgeschützt („Werk“).

**Dauer** 5–7 h · **Budget** +12 KB.

**Abnahme ND3** (Offline-Render 48 kHz, v 0,8 und 1,0):
- [ ] ND3-01 45 Programme, 9 Kategorien × 5, 4 Kits; keine Namensgleichheit mit Geräte-Werkslisten (Prüfliste V10b-04 erweitert um den
  Gerätenamen); jedes Pad der Kits ist `src:'md'`.
- [ ] ND3-02 **Charakter je Kategorie** (alle Programme der Kategorie):
  bd: Grundton 40–70 Hz (M-MODEN), Klick-Band 2–6 kHz in 0–5 ms höchstens 20 dB unter dem Körperband 30–150 ms (M-BAND),
  M-AUS 50–400 ms;
  Sn (außer Rausch-Klatsch): Körper 150–260 Hz und Rauschen ≥ 2 kHz, Energieverhältnis Rauschen/Ton −6 … +6 dB (M-BAND 30–150 ms);
  to: „Fell tief/mitte/hoch“ Bend abwärts 2–5 HT bei v 0,8–1,0 (M-CENT), T60 300–900 ms, je 5 HT auseinander ± 10 Cent;
  Elektro-Tom Bend ≥ 12 HT; Kessel Bend ≤ 1 HT, T60 ≥ 1,2 s;
  HH: M-SP ≥ 6 kHz, Harmonizität < 0,3, Zu T60 ≤ 150 ms, Offen ≥ 400 ms, Zu schließt Offen in ≤ 4 ms (Mono);
  Cy: T60 ≥ 1,2 s (Splash ≥ 0,6 s), M-SP ≥ 4 kHz;
  Pc/Tu: stärkste tiefe Spitze = PITCH ± 10 Cent (außer Shaker; Handtrommel nach dem Bend); Be: Teiltöne nach Modell bzw.
  FM-Stufe (M-MODEN), mindestens 2 inharmonische Spitzen;
  Ef: mindestens 3 Programme mit |Bend| ≥ 24 HT (Laser, Tropfen, Lo-Fi-Zap), je eines mit SA, rn und FM-FX-Zone (VERH ≥ 64).
- [ ] ND3-03 **Pegel** wie V1c-02: Spitzen Kick −5 … −7 dBFS, Snare −1 … −5, Hats −9 … −14, Toms innerhalb 2 dB; Kits: 16-Takt-Groove
  −18 ± 3 LUFS (M-LUFS, trocken).
- [ ] ND3-04 Kein NaN, Gleichanteil ≤ 0,005; CPU je Kit im 16-Takt-Groove ≤ 3 % (M-CPU, Xeon).
- [ ] ND3-05 Pad-Start nach Rolle: alle 12 Pads einmal auf `md` → Programm laut Liste (deep-equal), je ein Undo.
- [ ] ND3-06 Höreindruck für Xander: 45 Programme als Hörprobe (WAV in ZIP, je 2 Schläge v 0,8/1,0) in der „Bitte prüfen“-Liste.

**Tests.** `md3-kits.mjs`.

### ND4 — Einbindung: Pads wählen die Engine, Sequencer, Speichern, Undo, Bibliothek

**Ziel.** Der Drum-Sequencer bleibt; jedes Pad hat eine Quelle (Drum-Stimme oder `MD_NAME`). Alles Bestehende klingt bitgleich.

**Umfang.**
1. **Quelle je Pad:** Knopf „Quelle ▾“ (Zeile B in SOUND, ≥ 44 × 44) → Popover [Drum-Stimme │ `MD_NAME`]. Wechsel = ein Undo.
   Zurück auf Drum: alle Drum-Felder deep-equal wie vor dem Wechsel; die `m*`-Felder bleiben im Slot gemerkt (wie `syn.mem` in V1d).
   Wird V1d später gebaut, nimmt sein Quelle-Blatt `md` als Eintrag auf (PAD-R1 sinngemäß).
2. **Schlag-Weg:** `drumHit(gm, vel, t, src, ex, o)` verzweigt bei `src === 'md'` des Slots auf `mdHit()` → Nachricht `hit` (gebündelt je
   Tick), mit Akzent (`ex.acc` → `accentAmt(drumKit().accent)`), Locks (`ex.lk.tune`, `ex.lk.dec`), Anschlag wie heute. Buchführung wie
   bei Drum-Schlägen: `logNote`, `perfAdd`, `padFlashAt`, VS2-Maske, Pumpen-Auslöser bei GM 36. Lanes VEL, AKZENT, CHANCE, WIRBEL,
   TIMING, TUNE, DECAY wirken.
3. **Knoten-Leben:** Modul + Knoten entstehen erst, wenn ein Pad `md` wird oder ein geladenes Projekt ein solches Pad hat (beim Laden
   parallel, vor dem ersten ▶). Bis das Modul bereit ist (≤ 300 ms), werden Schläge gepuffert, nicht verworfen. Der Knoten bleibt bis
   zum Neuladen (Leerlauf ≈ 0). Neu-Anlage bei neuem AudioContext wie die anderen Worklets.
4. **Ohne AudioWorklet** (`?engine=native`, sehr altes WebKit): Modell-Pads spielen ihre gespeicherten Drum-Felder (die Drum-Stimme), im
   Kopf der Hinweis „`MD_NAME` braucht AudioWorklet“. Kein Fehler, kein Absturz.
5. **Stopp/Panik** (Regel 15): ■ → Stimmen klingen mit derselben τ aus wie Drum-Schläge (`silenceAll`), Hall/Echo-Fahnen laufen aus;
   ■■ und Panik → alles inkl. Fahnen in ≤ 50 ms still. Mute/Solo der Drum-Spur wie bisher.
6. **Offline-Render** (Video VV1, später Einfrieren FR1): Modul im OfflineAudioContext, `reset` vor dem Render, gleiche Nachrichten.
7. **CPU-Begrenzer:** Engine-Last in `cpuLoad()`; Stufen §ND1 Punkt 7.
8. **Daten (Format 5, additiv).**
```js
// Drum-Sound p: Slots bleiben flach (normDrum behält Zahlen und Strings ≤ 16 Zeichen, Schlüssel ≤ 12 Zeichen)
slots[id] += { src: 'drum'|'md',                       // fehlt = 'drum'
  mWav:'A1', mSpc:0, mFrq:25, mDyf:0, mDec:20, mDm:'E1', mDd:20, mBnd:0, mBt:10, mPit:45,      // TONE (mDm: E1 E2 E3 L P D)
  mNres:0, mNtyp:'L1', mNfrq:30, mNdyf:0, mNdec:15, mNdm:'E1', mNdd:15,                         // NOISE (mNdm: E1 E2 E3 L G D)
  mClv:0, mCty:'n1',                                                                            // CLICK
  mNlv:0, mTlv:40, mLvl:40, mPan:0,                                                              // MIX (mPan −9…9)
  mEqf:25, mEqg:0, mDst:0, mDty:'dr', mRvb:0, mDly:0,                                            // EQ/DIST/Anteile
  mMono:0, mCrv:'Li', mName:'', mCat:'' }                                                        // Kanal, Herkunft
p.md = { v:1, rvT:'r1', rvC:0, dlR:50, dlM:'r', dlB:60, dlF:0 }                                 // Kit-Effekte (dlB 60 = Viertel 120)
```
   - Die Zeile oben **ist** INIT SOUND (Gerät nennt keine Werte [A]): A1, Pitch 45.0, TONE LVL 40, alles andere neutral.
   - `normDrum` (neu): `src` nur 'drum'|'md' (später 'synth'); jeder `m*`-Wert geklemmt auf §1-Bereiche, Codes gegen Listen geprüft,
     Fehlendes = INIT; `p.md` mit denselben Regeln. Unbekannte Felder bleiben erhalten (Regel 9).
   - Ältere App (≤ 4.24): behält `src` und `m*` (flach), spielt die Drum-Stimme; `p.md` geht beim Speichern dort verloren – Versions-
     Wächter VO-R1 zeigt das Hinweisband „neuere Version“. `max_app` muss die neue Version decken (Xander, Regel 20).
   - SCL PRE, ALLE KANÄLE, SOLO PART werden **nicht** gespeichert [H].
9. **Undo/Verlauf:** alles über `soundEdit(DRUM_T, label, fn)` (Art `sound`); keine neue Undo-Art. Prüfen: `historyCheck()` = true (VL-R1).
   Kopieren/Einfügen/Duplizieren von Drum-Sounds und Kits tragen `src`, `m*`, `p.md` mit.
10. **Bibliothek:** eigene Programme `engine:'mdp'` (Name, Kategorie, `m*`-Werte); ältere Versionen ignorieren den Eintrag (prüfen, dass
    `LIB` unbekannte Engines nicht löscht; sonst eigener Speicher-Schlüssel). Kits mit Modell-Pads in „Kits“/„Eigene Kits“ wie bisher.
11. **Hilfe** (U-07-Stil): je eine Zeile für Quelle, Programm, ALLE KANÄLE, SOLO PART, MONO-GRUPPE, SCL PRE, HALL & ECHO – mit `MD_NAME`.
12. **Unverändert:** MIDI-Export (GM-Noten der Pads), MIDI-Import (Pads), Beatbox-Pads (VS6, wenn gebaut), D1-Polymeter, Song/FANG.

**Nicht-Umfang.** P-Locks auf Modell-Parameter (V5), Mod-Ziele (MOD-R1, V5d), Szenen-Übergang (V6a), eigene Optik nach dem Gerät
(Frage F3), Mono-Gruppe gemeinsam mit Drum-Chokes (F6), Echo folgt Song-Tempo (F5).

**Berührungspunkte.** `drumHit`, `scheduleDrums` (unverändert bis auf den Zweig), `silenceAll`/`panic`, `normDrum`, `slotParams`,
`loadKit`/Kit-Browser, `openSavePop`, `LIB`, Offline-Render, `cpuLoad`, `ensureAudio`, Lade-Kette der Worklets, Hilfe.

**Dauer** 6–8 h · **Budget** +10 KB.

**Abnahme ND4:**
- [ ] ND4-01 **Regel 28:** Demo-Projekt, INIT Drums, alle Werks-Kits, die Snapshot-Projekte in `synq-snapshots/` – Offline-Render neu gegen
  `VS-L.html` (4.24.0): bitgleich (M-NULL = −∞; höchstens ≤ −90 dB mit Begründung). Ohne Modell-Pad: kein `addModule` für `synq-md`
  (Netz-/Modul-Log), Startzeit (`wp1-dod`-Messung) ± 5 % gleich, Seitengröße +≤ 100 KB.
- [ ] ND4-02 Jedes der 12 Pads: Drum → `md` → Drum: Drum-Felder deep-equal; `m*` bleiben; zweiter Wechsel auf `md` lädt die gemerkten Werte
  deep-equal; je ein Undo; Undo bis vor den ersten Wechsel = Slot deep-equal ohne `src`/`m*`.
- [ ] ND4-03 **Zeit:** 16tel-Muster, Offline: Einsatz jedes Modell-Schlags auf ± 1 Sample am Soll (`at`); gegen ein Drum-Pad auf demselben
  Schritt ± 1 ms; live mit 25-ms-Vorlauf `late` = 0 über 32 Takte (M-ZEIT).
- [ ] ND4-04 **Lanes:** VEL 0,5 → −6,0 dB (Li); AKZENT +3,7 dB; CHANCE 50 % → 50 ± 10 % Treffer (gleicher Startwert = gleiche Treffer wie
  Drum-Pad); WIRBEL 1/32 → alle Schläge da; TUNE +12 → +1200 Cent; DECAY ×2 → T60 ×2 ± 10 %.
- [ ] ND4-05 **Stopp/Panik:** 200 ms nach ■ keine Stimme mehr aktiv (Fahnen dürfen klingen); nach ■■ bzw. Panik Engine-Ausgang ≤ −90 dBFS
  nach 50 ms, inklusive Echo FEEDBACK 20 und Halle hA.
- [ ] ND4-06 **Speichern/Laden:** Projekt mit 12 Modell-Pads + `p.md` → speichern → laden: deep-equal; Kopieren/Einfügen/Duplizieren von Kit,
  Pad und Clip tragen alles; Online-Speichern mit Format 5 angenommen (nur in der Pages-Abnahme durch Xander; Bau ohne Supabase);
  4.24.0 lädt das Projekt ohne Fehler (Drum-Stimme spielt), Hinweisband erscheint.
- [ ] ND4-07 Undo/Redo jeder Aktion aus ND2/ND4 einzeln, `historyCheck()` = true; „geändert“-Punkt sofort aktuell (Regel 7).
- [ ] ND4-08 **Offline = live:** Video-Render (VV1) eines 8-Takt-Musters zweimal → bitgleich; gegen Echtzeit-Mitschnitt Korrelation ≥ 0,99
  nach Zeitausgleich.
- [ ] ND4-09 **Ohne Worklet:** `?engine=native` mit Modell-Pads: DoD (`v3-v0b-dod.mjs 60`) 10/10, Hinweis sichtbar, keine Konsolenfehler.
- [ ] ND4-10 **CPU-Begrenzer:** `cpuInject(.5, 3)` → Modalmodelle ≤ 24 Moden (Abfrage über Test-API), gespeicherte Werte unverändert;
  Offline-Render davon unberührt (bitgleich zu ohne Last).
- [ ] ND4-11 Marke: `grep -i 'nord'` im App-HTML, Hilfe, Testnamen im Repo = 0; `MD_NAME` genau einmal definiert.
- [ ] ND4-12 Regression: DR*, T1–T18, V0a/V0b-Drum-Suiten, `wp6-drums` P/L, Smoke, Worklet-ASCII; DoD mit Worklet und nativ je 10/10.

**Tests.** `md4-int.mjs`, `md4-golden.mjs` (Regel 28), `md4-store.mjs`.

---

## 3. Dauer, Größe, Reihenfolge

| Paket | Inhalt | Dauer | Budget |
|---|---|---|---|
| ND1 | Engine-Kern (34 Modelle, Noise, Click, Dist, EQ, Echo, Hall, Stimmen) | 16–20 h | +45 KB |
| ND2 | Editor (SOUND/TIEF/KIT für Modell-Pads, alle Formate) | 8–10 h | +30 KB |
| ND3 | 45 eigene Programme, 4 Kits, Pad-Start nach Rolle | 5–7 h | +12 KB |
| ND4 | Einbindung, Quelle je Pad, Speichern (Format 5), Undo, Bibliothek, Regel-28-Golden-Test | 6–8 h | +10 KB |
| **Summe** | (+ ≈ 2 h Zusammenführen/Fach-Prüfung) | **≈ 40 h (35–45 h)** | **≈ +97 KB** |

Zweige: A (`nd-br-E`) ND1 → ND3 ‖ B (`nd-br-U`) ND4 → ND2; Zusammenführung ND1+ND4 → ND2 → ND3. Jede Stufe mit Changelog-
Abschnitt, Snapshot, „Bitte prüfen“-Liste (Regel 22) und Fragen.

---

## 4. Fragen an Xander

- **F1 Name der Engine.** Du hast am 31.10. „North“ gesagt. Hinweis: „North“ ist die englische Übersetzung des Markennamens; beim Verkauf
  der App kann das als Anlehnung an die Marke gelten (wie beim MS 2000 besprochen). Bis du bestätigst, steht im Code der Platzhalter
  „North“ in **einer** Konstante `MD_NAME`; Umstellen ist eine Zeile. → „North“ bestätigen, „North“ lassen oder anderer Name?
- **F2 Beschriftung.** Parameter englisch wie am Gerät (TONE, NOISE, SPECTRA, DYN FILTER …) mit deutscher Erklärzeile – wie beim MS 2000 –
  und Werte in Geräte-Schreibweise („45.0“, „L9“, „d3“, „E1“)? (So geplant.)
- **F3 Aussehen.** Geplant ist der App-Stil (Regler-Zellen im Drum-Editor). Möchtest du stattdessen ein Bedienfeld nach dem Vorbild des Geräts
  (Tastenreihen, Drehrad, Ziffernanzeige)? Rote Gerätefront und Logo bleiben in jedem Fall weg.
- **F4 Anzahl Kanäle.** Das Gerät hat 6 Kanäle, die App 12 Pads. Geplant: alle 12 Pads dürfen die neue Engine spielen. Einverstanden?
- **F5 Echo-Tempo.** Am Gerät hat das Echo ein eigenes Tempo (BPM/Tap). Soll es in der App so bleiben (geplant) oder automatisch dem
  Song-Tempo folgen?
- **F6 Mono-Gruppe.** Geplant wie am Gerät nur zwischen Pads der neuen Engine. Sollen auch die Choke-Gruppen der bisherigen Drum-Stimme
  mitwirken (z. B. offene Hat bisherig, geschlossene neu)?
- **F7 Vorschlag (nicht gebaut):** Anzeige „Grundton schwach“, wenn eine FM-Einstellung den Grundton fast auslöscht (wie die BISS-Grenze der
  Kick) – nur ein Hinweis, keine Sperre, schräge FX bleiben möglich. Gewünscht?

---

## Anhang M — Neue Messverfahren (ergänzen §0.3 der Spec)
| Kürzel | Name | Definition |
|---|---|---|
| **M-T60** | Abklingzeit | Hüllkurve (Hilbert-Betrag, 2-ms-Glättung) in dB; lineare Regression zwischen −5 und −35 dB unter der Spitze, auf −60 dB hochgerechnet (L-Modus: Zeitpunkt −60 dB direkt) |
| **M-MODEN** | Teilton-Spitzen | FFT 65 536, Hann, Fenster 0–500 ms (bzw. ≥ 4 · T60 der schwächsten geprüften Mode); lokale Maxima ≥ −50 dB unter dem Maximum, Frequenz durch quadratische Interpolation; Verhältnisse zur gemessenen Grundmode |
| **M-CENT** | Tonhöhe | Augenblicksfrequenz aus Nulldurchgängen mit linearer Interpolation (A1, t1) bzw. STFT-Spitzenverfolgung (1024, Hop 64), in Cent zur Nenn-Tonhöhe; Fenster 3 ms |
| **M-NULL** | Differenz | `20·log10(rms(a − b) / rms(b))`; „bitgleich“ = alle Samples gleich |
| **Harmonizität** | Teiltonraster | Anteil der Energie der 20 stärksten Spitzen, die innerhalb ± 1 % auf Vielfachen der stärksten tiefen Spitze liegen |

Vorhandene Verfahren (M-PEGEL, M-SPITZE, M-BAND, M-SP, M-AUS, M-KLICK, M-EINBRUCH, M-ZEIT, M-LUFS, M-CPU, M-PLATZ) gelten unverändert.

## Anhang Q — Rechenhilfen
`S/nd-tools/tables.py` (VERH, VERST, Skalen-Stützwerte), `S/nd-tools/t2.py` (VERST 73–99), `S/nd-tools/bessel.py` (Fell-Verhältnisse).
Nur eigene Rechnungen; keine Handbuch-Inhalte. Die Handbuch-Seitenbilder unter `S/nd-render/` sind privat und werden nicht weitergegeben.


> **Entscheidung Xander 31.10. ~14:05 UTC:** Anzeigename der Engine = **„North“** (). Frage F1 ist damit beantwortet.
