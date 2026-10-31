# SYNQUENZER v3 — Nachtrag 7: Bit Mask (Bitmasken-Synthese nach dem Klangaufbau des Vorbild-Geräts, Xander 31.10.)

**Kurz für Xander**
1. Neue Synth-Engine **„Bit Mask“** mit dem ganzen Klangaufbau aus dem Handbuch: 2 Masken-Oszillatoren mit je 256 Masken, Rauschen, Filter, 4 Hüllkurven mit Schleife, Masken- und Tonhöhen-Hüllkurve, 2 LFOs, Anschlag/Rad/Druck, 9 Spielweisen, Schicht/Split, Arpeggiator und 2 Effekt-Stufen (64 + 48 Typen).
2. Den eingebauten Looper des Geräts bauen wir nicht nach, denn deine Clips, Szenen, der Song, FANG und ● können das schon besser. Dazu kommen ein paar logischere Lösungen: Masken-Karte 16 × 16, 8 Bit-Schalter, die Welle ist immer sichtbar und alle Werte haben Einheiten. Alles, was man anders sieht als am Gerät, steht unten zur Freigabe.
3. Sieben Pakete, zusammen ≈ 60 h, parallel baubar. Alte Projekte klingen bitgleich. Vorher gibt es 10 kurze Fragen an dich (Aussehen, Druck, Lautstärke der Masken …).

---

Status: **Entwurf zur Freigabe.** Auftrag Xander 31.10. (`fragen-xander-9.md`, ~16:00 und ~16:10 UTC): Bitmask-Synth nach dem
Vorbild-Gerät, „jede Syntheseform“, professionell, stabil, ohne Unterschiede. Über den Dirigenten (31.10.): Der Sequencer des
FM-Geräts desselben Herstellers „passt nicht gut“. Von Menschen gemachte Entwürfe sollen **verbessert und logischer** werden, nicht 1:1 kopiert.

**Kennzeichen:** **[H]** Handbuch-Fakt (in eigenen Worten) · **[Ö]** öffentliche Angabe (Hersteller-/Händlerseiten, Tests) · **[A]** Annahme
dieser Spec (der Builder baut genau das) · **[V]** bewusste Verbesserung gegenüber dem Gerät (sichtbare [V] stehen in §8 zur Freigabe) ·
**[X]** Entscheidung von Xander.

**Regeln, die hier besonders gelten** (`typische-fehler.md`):
- **27** Nichts selbst bestimmen. Wo das Handbuch schweigt, legt diese Spec Werte fest und markiert sie mit [A]. Was man anders sieht
  als am Gerät, ist mit [V] markiert und wird in §8 gefragt. Der Builder baut genau diese Spec und sonst nichts.
- **28** Alte Projekte klingen gleich: Die Engine ist **zusätzlich**. Ohne Bit-Mask-Klang wird ihr Modul nicht geladen, und das Synth-Worklet
  `dirigent-analog` bleibt **byte-gleich**. Spätere Änderungen an dieser Engine bekommen das Versionsfeld `p.bm.v` mit Umrechnung oder
  altem Pfad.
- **24 (sinngemäß)** Marke: Hersteller- und Gerätename stehen **nirgends in der App** (Oberfläche, Hilfe, Kommentare, Bezeichner,
  Testnamen, Dateinamen im Repo). Der Anzeigename kommt nur aus der Konstante `BM_NAME` (§0.3).
- **4 / 1 / 5** Trefferflächen ≥ 44 × 44 px, senkrecht ziehen mit Fein-Modus. In 390×844, 375×667, 320×568, 844×390, 667×375 und 926×428
  (dazu Xanders Hochformat 428×926) ist nichts abgeschnitten, und das Layout springt nicht. **3** Listen scrollen per Finger.
  **6/10** Überlagerungen und scharfe Modi enden auf jedem Weg.
- **7/8/9** „geändert“-Punkt und [A/B] sofort aktuell, eine Geste = ein Undo, Speichern → Laden deep-equal.
- **12/13/15/16/17** Keine Knackser, Stimmenübernahme ohne Sprung, Panik beendet auch Effekt-Fahnen, keine Allokation pro Block,
  Schutz vor NaN und Denormalen.
- **20** Kein Supabase-Aufruf. **29** Parallel in Zweigen bauen.
- **K1 (Xander 31.10. ~16:00)**: Oszillatoren starten beim Tastendruck phasengleich. Die Qualität „Auto“ ändert nie den Klang
  (bei Last werden die leisesten Stimmen geklaut, es gibt keine schlechteren Rechenwege). Keine versteckte Modulation: INIT hat 0 Cent und keine Route.
- **CLAUDE.md-Vorrang:** Schnelle Seite und stabile Verbindung gehen vor. Modul, Tabellen-Worker und Editor-Block werden **erst bei Bedarf**
  geladen, und die Tabellen entstehen im Worker statt im Haupt-Faden (§2.2). WebGL bringt hier **nichts**: Karte und Oszilloskop sind kleine,
  zwischengespeicherte Canvas-2D-Bilder (§3.2). Das sage ich gleich jetzt, nicht erst später.
- Format bleibt **5** (nur zusätzliche Felder). Die App-Version vergibt der Dirigent. `max_app` muss die neue Version decken
  (heute 4 030 000 = 4.30.0), das setzt Xander (Regel 20).

---

## 0. Quellen, Lesart, Name

### 0.1 Quellen
- **Handbuch des Vorbild-Geräts** (Kodamo MASK1, Ausgabe 1.5 von 2023, ManualsLib-PDF, 52 S.), privat unter `S/manuals/mask1/`. Es kommt
  **nie in ein Repo** und wird nie wörtlich zitiert. Diese Spec übernimmt nur Fakten (Parameternamen, Bereiche, Listen, Signalweg)
  in eigenen Worten. Seitenbilder zur Eichung liegen privat unter `S/mask1-render/`.
- **Öffentlich [Ö]** (Websuche 31.10.; die Hersteller- und Testseiten selbst waren im Netz dieser Sitzung gesperrt, die Angaben stammen aus
  den Suchtreffern): Das Gerät rechnet intern mit **16-facher Überabtastung**, die spätere Tischversion mit 8-facher. Neuere Angaben
  des Herstellers nennen **512 Masken** und 12 Stimmen. Die genaue Rechenvorschrift der Masken ist **nirgends veröffentlicht**.
- **App:** `CHANGES-V3.md` (Engines VA `analog`, FM `fm6` mit FM-FELD V4a–V4f, WT `wt`; Worklet `dirigent-analog`; `engineInfo`, `cpuLoad`,
  `forceNative`, `soundEdit`, Bibliothek), `CHANGES-MK.md` (MS 2000 = `eng 3` in `dirigent-analog`, `MK_LABEL`, MK0-Schutz für unbekannte
  Engines, Format 5, Block `sq-mk-src` bei Bedarf, Räder, MK3 zwei Timbres/Split, MK5 `ARPC`, `perfProbe`), Nachtrag 5 (K1
  Mod-Übersicht), Nachtrag 6 (eigener Prozessor `synq-md`, Laden bei Bedarf, Aufbau dieser Spec).
- **Alter Plan** `dirigent-spec-v3.md` §10.2–10.4 und V8a/V8b (Bitmask ohne Handbuch, 32 Segmente N/I/S/R, nach Schwerpunkt sortierter Pool):
  **wird durch diesen Nachtrag ersetzt** (§0.4).

### 0.2 Lesart des Handbuchs (wo es unklar ist)
| Stelle | Befund | Festlegung |
|---|---|---|
| Masken-Rechnung | Das Handbuch beschreibt nur das Prinzip (Sinus zerlegt, Teile gespiegelt, wiederholt, skaliert, stumm) und Beispiel-Masken | eigene **Masken-Regel** §1.2, geeicht an allen Anker-Masken des Handbuchs [A] |
| Anzahl Masken | Daten-Teil: 256 je Oszillator; neuere Herstellerangabe 512 [Ö] | **256** [H], Frage F10 |
| Stimmen | Handbuch 10, neuere Angabe 12 [Ö] | **10 je Spur** [H/V] |
| Masken-Bilder | Bedienfeld-Übersicht ausdrücklich „vereinfacht“ [H]; das Messbild von Maske 78 zeigt doppelt so viele Bögen wie die vereinfachten Symbole | **Messbilder gelten** (78, 7, 8, 25) [A] |
| Zahlenbereiche | genannt sind nur: Oszillator-SEMI 120 HT, PORT 0–13, FX-BAL 0–100, Tonhöhen-SPD 1–40, Bend ±12, Arp 20–400 BPM, Stimmton 400–470 Hz | übrige Skalen §1.3 [A] |
| ADSR-Bereich | Beispiele: Pad-Attack 9, „sehr kurze“ Decay 0–2, Sustain „13, 12, 11 … nicht ganz oben“ | **0–15** für A, D, S, R [A] |
| Tonhöhen-START | ohne Einheit; Blech „Speed etwa 15“, E-Piano „etwa 35“ | quadratische Halbton-Skala §1.3 [A] |
| Masken-Hüllkurve | nur START und SPD, kein END (END gibt es nur bei der Tonhöhe) [H] | so übernommen |
| LFO-Wellen | Datenblatt: 7 Formen + Rauschen; Liste: 8 Namen inkl. RAND | 8 Formen [H], Bauweise §1.8 [A] |
| Effekt-Typen | nur Familien, Reihenfolge der Wirkung und Sonderfälle (CH15/16 phaserartig, BC9–16 mit LFO, RM erst langsam, DL am Ende kammartig, RV von groß nach klein) [H] | Werte-Tabellen §1.12 [A] |
| LFO-Verzögerung | wird durch Bewegen von Rad/Druck aufgehoben, „folgende Noten“ bekommen sie wieder [H] | Neustart bei Phrasen-Beginn §1.8 [A] |
| Paraphon | erste Note startet die gemeinsamen ADSR, weitere setzen ein [H]; Loslassen einzelner Tasten offen | eigene Ausblendung je Stimme §1.11 [A] |
| Anschlag → Lautstärke | V-DEST VOL ist ein mögliches Ziel; Grunddynamik offen | Grunddynamik wie die anderen Synth-Engines der App (K1-Antwort 4), V-DEST VOL zusätzlich [A] |

### 0.3 Name
- **Entscheidung Xander [X] 31.10.:** Anzeigename **„Bit Mask“** (zwei Wörter, großes B und M). Konstante `BM_NAME = 'Bit Mask'`, **einmal**
  definiert. Jede Anzeige (Engine-Knopf/-Chip, Blattkopf, Bibliothek, Hilfe, Toasts, MIDI-Spurname) liest `BM_NAME`.
- Interne Bezeichner: Engine-Kennung `'bm'`, Daten `p.bm`, Prozessor `'synq-bm'`, Worker `synq-bm-tab`, Block `sq-bm-src`, Helfer `BM…`/`bm…`.
  Verboten in Code, Hilfe, Tests und Dateinamen: Hersteller-, Geräte- und FM-Gerätename. Prüfung: `grep -i -P 'kodamo|mask ?1(?![0-9])|essence'` über
  die Bit-Mask-Teile = 0. Deshalb heißen Mod-Ziele `o1m`/`o2m`, **nie** `mask1`/`mask2`.
- `BM_NAME` steht **nie direkt vor einer Ziffer** (also kein „Bit Mask 1“ als Spur-, Klang- oder MIDI-Name), sonst sähe es aus wie der Gerätename.
  Spuren heißen weiter „Synth 1 …“; neue Klänge „INIT Bit Mask“, Kopien „… Kopie“.
- Maskenwerte erscheinen überall **dreistellig** („MASK 001“, „MASK 078“, wie eine Geräte-Ziffernanzeige), nie als „MASK 1“.

### 0.4 Verhältnis zum alten Plan §10 / V8a–V8b
- §10.2–10.4 und die Pakete V8a/V8b (Engine `'mask'`, 32-Segment-Masken, Pool nach Schwerpunkt sortiert, UNTERTON, Euklid, Welle malen) waren
  **vor dem Handbuch** geplant und sind **nicht gebaut**. Sie entfallen und werden durch BM1–BM7 ersetzt.
- Von dort übernommen: der **Tabellen-Oszillator** §10.1 (Mip-Kette je Oktave, Überblendung, Speicherbedarf, Aliasing-Ziel ≤ −60 dB, gemessen in E7)
  und der Gedanke des **Δ-Pfeils** auf der Masken-Nummernleiste. Was UNTERTON und „eigene Masken“ wollten, leistet hier schon die Regel selbst:
  Die Bits 5–7 erzeugen stille Abschnitte und längere Perioden, und die 8 Bit-Schalter (§3.2) machen jede der 256 Masken direkt einstellbar.
- V9a (Tabellen-Additiv) kann den Tabellen-Leser dieses Prozessors später übernehmen.

---

## 1. Architektur (je Stimme und je Teil wie am Gerät)

### 1.1 Signalweg
```
 Taste ─► Δ TONHÖHE (START/SPD/END) ─┬─► OSC1: Masken-Oszillator (MASK + Δ MASKE) ─ × ADSR1·L1 ─┐
                                      ├─► OSC2: Masken-Oszillator (MASK + Δ MASKE) ─ × ADSR2·L2 ─┼─ Σ ─► FILTER 12 dB (SVF, LP/HP/BP/NOTCH,
                                      └─► RAUSCHEN (Sample & Hold, FREQ) ────────── × ADSR3·L3 ─┘        CUTF + ADSR4·L4, TRK von OSC1)
   ─► × VOL · Anschlag ─► PAN (PANS)  ── je Stimme, bis 10 Stimmen je Spur
   Σ Stimmen eines Programms ─► FX1 (CH/DT/BC/RM, 1BAL) ─► FX2 (DL/RV/DT, 2BAL) ─► Ausgang Stereo ─► Spur-Kette der App
   LFO1, LFO2 je Programm (nicht je Stimme), frei laufend, je ein Ziel aus 16; Anschlag, MOD-Rad, Druck je ein Ziel
```
- [H] Die Tonhöhen-Hüllkurve startet mit dem Tastendruck. Zwei Masken-Oszillatoren und das Rauschen haben je eine eigene ADSR mit Pegel.
  Jeder Oszillator hat eine eigene Masken-Hüllkurve. Das Filter hat seine eigene Cutoff-ADSR und kann der Tonhöhe von OSC1 folgen.
  Danach kommen FX1 (Chorus, Phaser, Verzerrung, Bitcrush, Ringmod) und FX2 (Echo, Hall, zweite Verzerrung) in Reihe. Zwei LFOs wirken
  auf fast alle Teile.
- [H] Es gibt **keine** eigene Verstärker-Hüllkurve hinter dem Filter: Die Lautstärke formen die drei Quellen-ADSR.
- [A] Ausgang des Prozessors (Stereo) = Eingang der Spur-Kette an derselben Stelle wie das Synth-Worklet (Spur-FX, Sends, Mute/Solo wie bei VA).

### 1.2 Die Masken-Regel (Kern, [A] – geeicht an [H])

Das Handbuch sagt nur, **dass** ein Sinus in Teile zerlegt wird, die wiederholt, gespiegelt, skaliert oder stumm geschaltet werden, und dass eine
einzige Zahl die Welle wählt [H]. Eine Rechenvorschrift ist nicht veröffentlicht [Ö]. Diese Spec legt deshalb eine eigene, einfache Regel fest. Sie
behandelt die Maskennummer wörtlich als **Bitmaske auf die Phasen-Bits** eines Sinus mit 32 Schritten:

```
M        Maske 0 … 255 (8 Bit)
S(M)     Spanne = 1 für M = 0, sonst 2^(Stelle des höchsten gesetzten Bits + 1)      → 1, 2, 4 … 256 Schritte
φ        Phase 0 ≤ φ < 1, läuft genau einmal je Notenperiode
s = φ · S(M);  p = ⌊s⌋ (Schritt);  f = s − p (Bruchteil im Schritt)
m = p AND M
y = sin(2π · (m + f) / 32),   wenn m < 32
y = 0,                         wenn m ≥ 32
```

**Was die Bits tun:**
- **Bit 0–4** wählen, welcher Teil der Sinusperiode gelesen wird. Ist ein Bit aus, springt die Leseposition zurück: Dieser Teil wird
  **wiederholt**, und weil der Bruchteil `f` weiterläuft, entstehen kleine Rampen („Zähnchen“).
- **Bit 4** ist die zweite Sinushälfte. Ist es gesetzt (bei M < 32), ist die Welle halbwellen-symmetrisch und hat nur ungerade Teiltöne
  (hohl, rechteckartig). Fehlt es, bleiben nur positive Bögen.
- **Bit 5–7** zeigen über den Sinus hinaus: Dort ist die Welle **still**. Jedes dieser Bits verdoppelt die Spanne. Die Notenperiode bleibt gleich,
  der klingende Teil wird kürzer. So entstehen höhere Oktaven, pulsartige Formen und bei tiefen Tönen rhythmische Muster.
- **Periode = Spanne:** Jede Maske klingt auf der gespielten Note, denn die Spanne wird auf die Notenperiode gelegt.

**Anker-Prüfung** (gerechnet mit `S/bm-tools/maskrule.mjs`, genaue Fourier-Reihe; Bilder privat in `S/mask1-render/`):
| Maske | Handbuch [H] (eigene Worte) | Regel ergibt [A] | passt |
|---|---|---|---|
| 31 | Sinus | reiner Sinus | ✓ |
| 7 | reine Säge, ähnlich der analogen Kondensator-Säge | steigender Viertel-Sinus, dann Sprung; Teiltöne 2–4: −6,6 / −10,3 / −12,8 dB (ideale Säge −6,0 / −9,5 / −12,0), Neigung −6,1 dB/Okt | ✓ (Messbild) |
| 8 | Rechteck, dessen unterer Teil aus kleinen Sägen besteht | zwei Pegel; untere Hälfte 8 Rampen der Höhe 0,195, obere fast flach; nur ungerade Teiltöne (−9,5 / −14,0 / −16,9 dB) | ✓ (Messbild) |
| 25 | auch rechteckartig | Folge hoch · Mitte mit fallenden Zähnchen · tief · Mitte mit steigenden Zähnchen (je 4); nur ungerade Teiltöne, 3. −10,0 dB | ✓ (Messbild, auch Zahnrichtung) |
| 20–25 | klingen wie ein Rechteck | alle 16–31 sind halbwellen-symmetrisch: gerade Teiltöne exakt 0; 24/25: 3. Teilton −9,7 / −10,0 dB | ✓ |
| 15, 31, 47, 63, 79, 95, 111, 127, 143 … (16k−1) | rund, weich, wenig Obertöne; mit steigender Nummer wird es dunkler bis 16k−1, danach springt es hell | alle 16 Masken 16k−1 sind lokale Minima des Klangschwerpunkts; in den 16er-Blöcken 1–15 fällt der Schwerpunkt **streng** (Rang-Korrelation −1,00, Block 0: −0,67) | ✓ |
| 28–30 | ätherisch, FM-glockig | Sinus + Paare hoher Teiltöne (30: k15/k17 bei −24 dB; 28: k7/k9 bei −17/−19 dB), wie Träger mit Seitenbändern | ✓ |
| 56 | Puls | erste Hälfte 0 / +1 / 0 / −1, zweite still; Teiltöne 1 und 2 fast gleich stark | ✓ (Symbol vereinfacht) |
| 63, 95, 127, 255 | Masken verschieben die Oktave, SEMI gleicht aus | stärkster Teilton 2 / 4 / 3 / 7 → klingt ≈ +1 / +2 / +2 / +3 Oktaven | ✓ |
| 78 | summende Welle mit **derselben Periode** wie der Sinus | erste Hälfte 4 gezackte Bögen, zweite still; Grundton = Note | ✓ (Messbild) |
| 47, 72, 79, 120 | Symbole: Bögen/Pulse, dann flach | Bögen/Pulse in der ersten Hälfte (47, 72, 79) bzw. im ersten Viertel (120), Rest still | ✓ (Anzahl im Symbol halbiert) |
| höhere Nummern | pulsartiger, teils fraktal, tief transponiert rhythmisch | klingender Anteil = 2^−(Anzahl gesetzter Bits 5–7); Mittel des Schwerpunkts je 32er-Block steigt von 3,6 auf ≈ 21 | ✓ |
| kleine Nummern | einfacher | 0–7 sind Sägen (0, 1, 3 leise), 8–15 Rechteck- und Bogenformen | ✓ |

**Grenze:** Die Regel trifft alle Anker. Ob sie bitgenau der Rechnung im Gerät entspricht, ist **nicht belegt** [A]. Lautstärke: Die Regel ergibt
rohe Pegel von 0 dB (Sinus) bis −26 dB (Maske 224). Gebaut wird **roh** wie die Regel [A]; einen Ausgleich fragt F4.

### 1.3 Gemeinsame Skalen (ein Wert bedeutet überall dasselbe)
| Skala | Formel [A] | Stützwerte |
|---|---|---|
| **Zeit** `T(x)`, x 0–15 (A, D, R, LFO-DLAY, LFO-DCAY) | x = 0 → 1 ms (sofort, knackfrei); sonst `2 ms · 7500^(x/15)` | 1 → 3,6 ms · 3 → 12 · 6 → 71 · 8 → 234 · 9 → 424 ms · 10 → 0,77 s · 12 → 2,5 s · 14 → 8,3 s · 15 → 15 s |
| **Attack** | linear über `T(A)` [H: linear] | – |
| **Decay/Release** | exponentiell [H], −60 dB (bzw. Sustain + 0,1 %) nach `T(x)` | – |
| **Sustain** S 0–15 | `(S/15)²` | 15 → 0 dB · 13 → −2,5 · 11 → −5,4 · 8 → −10,9 · 0 → aus |
| **Pegel** L 0–99 (Osz., Rauschen), VOL 0–99 | `(L/99)²` (gleiches Gesetz wie Nachtrag 6) | 99 → 0 dB · 70 → −6,0 · 50 → −11,9 · 25 → −23,9 |
| **Cutoff** CUTF 0–99 | `fc = 20 Hz · 1000^(CUTF/99)`, begrenzt 10 Hz … 0,45 fs | 20 → 81 Hz · 30 → 162 · 37 → 264 · 50 → 655 · 60 → 1,32 k · 70 → 2,64 k · 80 → 5,3 k · 99 → 20 k |
| **Filter-Hüllkurve** L 0–99 | Spitze addiert L Cutoff-Stufen (33 Stufen = ×10) | – |
| **Resonanz** RESO 0–99 | SVF-Dämpfung `k = 1,414 · (1 − RESO/99)`; bei 99 Selbstoszillation mit weicher Begrenzung (tanh im Rückweg) | 0 → Q 0,71 · 50 → Q 1,4 · 90 → Q 7,8 · 99 → schwingt |
| **Tracking** TRK 0–100 % | `fc · (f_OSC1 / 261,63 Hz)^(TRK/100)`, f_OSC1 inkl. OSC1-SEMI [H] | 100 % → gleiche Klangfarbe auf allen Tasten [H] |
| **Rauschen** FREQ 0–99 | S&H-Rate `30 Hz · (fs/30)^(FREQ/99)`; 99 = jedes Sample neu (weiß) [H] | 50 → ≈ 1,2 kHz (48 kHz) |
| **Δ-Geschwindigkeit** SPD 1–40 (Tonhöhe [H], Maske [A]) | `T_Δ = 5 s · 2500^(−(SPD−1)/39)`; Annäherung exponentiell, 1 % Rest nach `T_Δ` | 1 → 5 s · 10 → 0,82 s · 15 → 0,30 s · 20 → 0,11 s · 25 → 40 ms · 30 → 15 ms · 35 → 5,4 ms · 40 → 2 ms |
| **Masken-START** −128 … +128 | Start bei `MASK + START`, geklemmt 0–255, ganzzahlig | – |
| **Tonhöhen-START/END** −63 … +63 | `ΔHT = Vorzeichen · 48 · (|x|/63)²`; + = beginnt bzw. endet höher | 4 → 0,19 HT · 8 → 0,77 · 16 → 3,1 · 32 → 12,4 · 63 → 48 |
| **Osz.-SEMI** | −60 … +60 HT [H: 120 HT] | – |
| **Osz.-TUNE** | −50 … +50 Cent | – |
| **PORT** 0–13 [H] | 0 = aus; sonst `8 ms · 1,6^(PORT−1)` bis 1 % des Intervalls, exponentiell in der Tonhöhe | 1 → 8 ms · 4 → 33 · 7 → 134 · 10 → 550 ms · 13 → 2,2 s |
| **LFO-SPD** 0–99 | `0,05 Hz · 8000^(SPD/99)` | 0 → 0,05 Hz · 25 → 0,48 · 40 → 1,9 · 50 → 4,7 · 60 → 11,6 · 75 → 45 · 99 → 400 Hz |
| **Mod-Menge** AMT 0–99 (LFO), −99 … +99 (V, MW, AT) | `u = Vorzeichen · (|a|/99)^1,5`, mal Zielbereich `D` (Tabelle §1.9) | 4 → 0,8 % · 25 → 12,7 % · 50 → 35,9 % · 99 → 100 % |
| **PANS** 0–15 | Noten abwechselnd links/rechts, Auslenkung `PANS/15` | – |
| **RATE** 0–15 | Hüllkurven-Zeiten × `2^(−(RATE/15) · (Note − 60)/12)` [H: tief langsamer, hoch schneller] | 15 → je Oktave × 0,5 |
| **BAL** 0–100 [H] | trocken × (1 − b/100) + nass × b/100 [H: 50 = halb/halb] | – |

### 1.4 Oszillatoren OSC1 / OSC2
| Parameter | Bereich | Anzeige | Wirkung |
|---|---|---|---|
| MASK | 0–255 [H] | Zahl + Bits + Oszilloskop | Welle nach §1.2 |
| SEMI | −60 … +60 HT [H] | „+12“, LCD Intervall | Transponieren, gleicht Masken-Oktaven aus [H] |
| TUNE | −50 … +50 ct [A] | „−3“, LCD Cent | Verstimmen; symmetrisch verstimmen hält die Mitte [H-Tipp] |
| START | −128 … +128 [A] | „+24“, LCD Startmaske | Masken-Hüllkurve: Startabstand zur MASK [H] |
| SPD | 1–40 [A, wie Tonhöhe] | „20“, LCD ms | Masken-Hüllkurve: Tempo bis zur MASK [H] |
| L A D S R LOOP | §1.3 | Zahl + ms | Pegel-ADSR dieses Oszillators [H]; LOOP wiederholt A+D, solange die Taste hält [H] |
- Wirksame Maske: `clamp(round(MASK + ΔMaske(t) + Anschlag/Rad/Druck/LFO-Anteile), 0, 255)` [A]. Ganzzahlig, **keine Überblendung** zwischen
  Masken: Das Handbuch beschreibt je nach Bereich weiche oder harte Übergänge [H].
- Wechsel der wirksamen Maske **nur an der Periodengrenze** (φ springt auf 0) [A]. Dort steht jede Maske bei y = 0, also gibt es keinen zusätzlichen Sprung.
- Start beim Tastendruck mit φ = 0 (Key-Reset, K1 [X]). Das gilt nur für eine freie Stimme. Eine klingende Stimme, die in POLY übernommen wird,
  läuft phasenstetig weiter (§1.11).

### 1.5 Rauschen
- Eigenes Rauschen je Stimme, **Sample & Hold** [H]. FREQ = Halte-Rate (§1.3), 99 = weiß [H]. Pegel-ADSR mit L und LOOP wie die Oszillatoren [H].
- Bauweise [A]: xorshift32 je Stimme, Startwert = Hash(Spur-Saat, Zähler der Noten). Stufen mit polyBLEP geglättet (FREQ < 99). Keine Tastaturverfolgung.

### 1.6 Filter
- Ein **12-dB-Zustandsvariablen-Filter** je Stimme, selbstresonant, Modi **LP, HP, BP, NOTCH** [H]. Parameter CUTF, RESO, MODE, TRK und dazu
  ADSR mit L und LOOP [H]. NOTCH wirkt am stärksten bei RESO 0 [H].
- Bauweise [A]: TPT-Form, Koeffizienten alle 16 Samples aus einer `tan`-Tabelle (wie Nachtrag 6), tanh-Begrenzung im Resonanzweg, Eingang × 0,5.
- Cutoff aus `CUTF + L·ADSR4 + Anteile (V, MW, AT, LFO)` in Cutoff-Stufen, dann Tracking (§1.3).

### 1.7 Hüllkurven
- **4 ADSR je Stimme** (OSC1, OSC2, RAUSCHEN, FILTER), jede mit L und **LOOP** [H]. Attack linear, Decay und Release exponentiell [H].
  Zeiten nach `T(x)` × RATE-Faktor. A, D und R = 0 heißt „sofort“ (1 ms Rampe [V], damit nichts knackt).
- **3 Δ-Hüllkurven je Stimme** (Maske OSC1, Maske OSC2, Tonhöhe) [H]: Beim Tastendruck springt der Wert um START versetzt und läuft mit SPD
  zum Ziel. Bei der Tonhöhe läuft er beim Loslassen mit derselben SPD um END weg [H]. Die Masken haben kein END [H].
- Die Tonhöhen-Δ wirkt auf OSC1 und OSC2 [H].
- Glättung [V]: Die Gerätehüllkurven sind bewusst „körnig“ [H]. Hier rechnen Hüllkurven, LFOs und Mod-Anteile alle 16 Samples und werden je Sample
  linear interpoliert: kein Treppen-Geräusch. Ein Schalter für die Körnung kommt nur nach Frage F6.

### 1.8 LFO1, LFO2
- **Je Programm, nicht je Stimme**, immer frei laufend, zweipolig [H]. Alle Stimmen sehen sample-gleich denselben LFO-Wert [H].
  Parameter AMT, SPD, DEST (16), WAVE (8), DLAY, DCAY [H].
- **Wellen** (alle ±1) [H Namen, A Form]: SIN (= Maske 31) · SQR (sauberes Rechteck) · UP (Säge steigend) · DOWN (Säge fallend) ·
  SAWS (Form der Maske 23: zweimal steigend, zweimal fallend) · STEP (Sinus in 8 Stufen) · HSIN (Bogen der Maske 15, auf ±1 gelegt) ·
  RAND (je Periode ein neuer Zufallswert, gehalten).
- **DLAY** [H]: Erst nach `T(DLAY)` setzt der LFO ein [A: Einblendung über das letzte Viertel]. Bewegt man MOD-Rad oder Druck mit dem Ziel
  „LFO-Menge“ oder „LFO-Tempo“ dieses LFOs (Änderung > 2 %), endet die Verzögerung sofort [H].
- **DCAY** [H]: 0 = aus; sonst fällt die Menge exponentiell und ist nach `T(DCAY)` bei −60 dB („LFO hört auf“, für Anschlag-Wackler).
- **Neustart** von Verzögerung und Abklingen [A]: bei jeder Note, die gedrückt wird, während keine andere Taste hält (Phrasen-Beginn).
- **Phase** [A, V]: Der LFO läuft frei. Bei ▶ (Transport-Start) und vor jedem Offline-Render beginnt er bei Phase 0, die RAND-Folge bei
  ihrer Saat. So klingt jede Wiedergabe des Songs gleich.

### 1.9 Modulation
**Quellen** [H]: Anschlag (6 Ziele), MOD-Rad (16), Druck (16), LFO1/LFO2 (je 16). **Je Quelle genau ein Ziel und eine Menge** [H] (zwei Ziele: Frage F8).

| Ziel (Kennung) | LFO | MW/AT | V | Zielbereich `D` und Wirkung [A] |
|---|---|---|---|---|
| Tonhöhe beider Osz. `freq` | ✓ | ✓ | – | ±24 HT |
| OSC1-/OSC2-Tonhöhe `o1f`/`o2f` | ✓ | – | – | ±24 HT |
| Stimm-Lautstärke `vol` | ✓ | ✓ | ✓ | Faktor `1 + u` (LFO/MW/AT, ≥ 0); V: `1 − |u|·(1 − v)` (u < 0: umgekehrt) |
| OSC1/OSC2/Rausch-Pegel `o1v`/`o2v`/`nv` | ✓ | ✓ | – | Faktor `1 + u`, ≥ 0 |
| Filter-Cutoff `flt` (Anzeige LFO: FILT, sonst FLT) | ✓ | ✓ | ✓ | ±99 Cutoff-Stufen (V: mal v) |
| Filter-Hk-Menge `feg` | – | – | ✓ | `L · (1 + u·(v − 1))` [H: skaliert die Filter-Hüllkurve] |
| Maske beider Osz. `mask` | ✓ | ✓ | ✓ | ±128 Masken-Stufen (V: einmal je Note) |
| OSC1-/OSC2-Maske `o1m`/`o2m` | ✓ | ✓ | – | ±128 Masken-Stufen |
| Panorama `pan` | ✓ | – | – | ±100 % |
| Rausch-FREQ `nf` | ✓ | ✓ | – | ±99 FREQ-Stufen |
| LFO1/2-Menge `l1a`/`l2a`, -Tempo `l1s`/`l2s` | – | ✓ | – | AMT ±99 bzw. SPD ±99 Stufen |
| FX1-/FX2-Typ `fx1t`/`fx2t` | ✓ | – | – | ±15 Typen innerhalb der Familie des gesetzten Typs, geklemmt 1–16; Wechsel mit 30-ms-Blende |
| FX1-/FX2-Anteil `fx1b`/`fx2b` | – (nur FX2) | ✓ | – | ±100 BAL |
| Tonhöhen-Hk-Start `peg` | – | – | ✓ | `START · (1 + u·(v − 1))` [H: skaliert den Start] |
| Attack-Tempo `atk` | – | – | ✓ | alle Attack-Zeiten × `2^(−4·u·v)` [H: schnellerer Attack] |
- Liste der LFO-Ziele [H]: FREQ, VOL, FILT, MASK, PAN, O1 FREQ, O1 VOL, O1 MASK, O2 FREQ, O2 VOL, O2 MASK, N FREQ, N VOL, FX1 TYP, FX2 TYP, FX2 BAL.
  MW/AT [H]: FLT, LFO1 AMT, LFO1 SPD, LFO2 AMT, LFO2 SPD, VOL, MASK, FREQ, O1 VOL, O1 MASK, O2 VOL, O2 MASK, N FREQ, N VOL, FX1 BAL, FX2 BAL.
  Anschlag [H]: FLT, F EG, VOL, MASK, P EG, ATK.
- Grunddynamik Anschlag → Pegel wie bei den anderen Synth-Engines (App-Standard, wird nicht als Modulation gelistet, K1-Antwort 4 [X]).
- MW, Druck und Bend werden geglättet (τ 10 ms) [H: geglättet].
- **Mod-Übersicht (K1):** Jede Route mit Menge ≠ 0 erscheint dort (V, MW, AT, LFO1, LFO2, Masken-Δ je Osz. bei START ≠ 0, Tonhöhen-Δ bei START/END ≠ 0,
  Filter-Hk bei L ≠ 0, PANS > 0). Tipp springt zum Regler, [✕] setzt die Menge auf 0 (ein Undo).

### 1.10 Allgemein (GENERAL)
| Parameter | Bereich | Wirkung |
|---|---|---|
| MODE | 9 Spielweisen §1.11 [H] | |
| VOL | 0–99 [A] | Programm-Lautstärke `(VOL/99)²`; INIT so, dass −18 LUFS |
| SEMI | −48 … +48 HT [A] | Transponieren des ganzen Programms [H] |
| PORT | 0–13 [H] | Portamento §1.3 |
| PANS | 0–15 [A] | Pan-Spreizung [H] |
| RATE | 0–15 [A] | Tastatur-Skalierung der Hüllkurven [H] |
| BEND | 0–12 HT [H] | Bend-Bereich je Klang (am Gerät global) [A] |
| STIMMUNG | ET, ARAB, JMAJ, JMIN, MEAN, PYTA [H] | Tabelle unten |
| GRUNDTON | C … B [V] | Am Gerät gilt C, und man verschiebt durch Transponieren der Tastatur [H]. Hier ist der Grundton wählbar |
- Stimmungen (Cent über dem Grundton, je Stufe 0–11) [A, ARAB nach H]:
  ET 0 100 … 1100 · **ARAB** wie ET, aber 3. und 7. Stufe (E, B) −50 ct, 6. und 8. Stufe (F#, G#) +50 ct [H] ·
  JMAJ 0 111,73 203,91 315,64 386,31 498,04 590,22 701,96 813,69 884,36 996,09 1088,27 ·
  JMIN 0 111,73 203,91 315,64 386,31 498,04 609,78 701,96 813,69 884,36 1017,60 1088,27 ·
  MEAN (¼-Komma) 0 76,05 193,16 310,26 386,31 503,42 579,47 696,58 772,63 889,74 1006,84 1082,89 ·
  PYTA 0 90,22 203,91 294,13 407,82 498,04 611,73 701,96 792,18 905,87 996,09 1109,78.
  Wo das MS 2000 (`MKW.SCL`) dieselbe Stimmung hat, müssen die Werte gleich sein (Abnahme BM2-11).

### 1.11 Spielweisen und Stimmen
**Stimmen** [H]: höchstens 10 je Spur. Gehaltene Tasten haben Vorrang. Geklaut wird zuerst die am längsten losgelassene Stimme, danach die älteste
gehaltene [A]. Klau mit 3-ms-Blende [V]: Das Gerät nennt Klicks beim Klauen als bekannt [H], hier gibt es sie nicht.
„Legato“ = neue Taste, während mindestens eine andere gehalten wird [A].

| MODE | Stimmen | ADSR bei neuer Note | Portamento | Besonderheit |
|---|---|---|---|---|
| POLY | 10 | **kein Neustart** [H]: Eine wiederverwendete Stimme läuft vom aktuellen Pegel in den Attack | Poly-Portamento [H]: gleitet von der letzten Tonhöhe dieser Stimme (PORT > 0) | – |
| POLY RETRIG | 10 | Neustart bei 0 [H] | wie POLY | – |
| MONO | 1 | kein Neustart [H] | immer [H] | letzte Note hat Vorrang [H]; Loslassen kehrt zur noch gehaltenen Taste zurück [A] |
| MONO PORTA | 1 | Neustart nur ohne Legato [A] | nur legato [H] | – |
| MONO RETRIG | 1 | immer Neustart [H] | nur legato [H] | – |
| SLUR | 10 | wie POLY | nur gebundene Töne [H] | Legato-Taste 1 oder 2 HT neben einer gehaltenen: Deren Stimme **gleitet** dorthin, ohne Neuanschlag [H]. Die alte Taste gilt danach als losgelassen [A] |
| PARA | 10 Tonhöhen, **ein** ADSR-Satz je Programm | Nur die erste Note (nach „alle los“) startet die vier ADSR [H]. Weitere Noten setzen auf dem aktuellen Pegel ein [H] | bei > 1 gehaltener Taste [H] | Masken- und Tonhöhen-Δ bleiben je Note [H]. Lässt man eine einzelne Taste los, blendet ihre Stimme mit dem R der Osz.-Hüllkurven aus [A] |
| PARA SLUR | wie PARA | wie PARA | wie SLUR | PARA + SLUR [H] |
| MOLY | 10 | staccato: neue Stimme, Ausklänge überlappen; legato: Mono-Verhalten (Stimme übernimmt und gleitet) [H] | nur legato [H] | – |
- Halte-Pedal (Sustain): Der Kern kennt es (gehaltene Noten bleiben, Stimmen-Vorrang gilt weiter [H]). Eine Bedien-Taste gibt es nur nach F9.

### 1.12 Effekte FX1 und FX2 (je Programm, vor der Spur-Kette)
Zwei Stereo-Stufen in Reihe, je **Typ** + **BAL** [H]. Typwechsel mit 30-ms-Blende [A]. FX schlafen bei Stille < −100 dBFS für 0,5 s (wie `dirigent-hall`).
| Typ | Handbuch [H] | Bauweise [A] |
|---|---|---|
| **CH1–CH14** | Chorus, verschiedene Tempi und Tiefen; bei BAL 100 ein warmes Vibrato | 2 modulierte Leitungen, Grundverzögerung 7 ms, LFO L/R 90° versetzt. (Tempo Hz, Tiefe ms): 1 (0,15; 2,5) · 2 (0,25; 3,0) · 3 (0,35; 1,5) · 4 (0,5; 2,5) · 5 (0,7; 1,2) · 6 (0,9; 2,0) · 7 (1,2; 1,0) · 8 (1,5; 1,8) · 9 (2,0; 0,8) · 10 (2,5; 1,4) · 11 (3,2; 0,6) · 12 (4,0; 1,0) · 13 (5,5; 0,5) · 14 (7,0; 0,8) |
| **CH15, CH16** | phaserartig, volle Wirkung bei BAL 100 | 6 Allpässe erster Ordnung, Lauf 200 Hz – 3 kHz, interne Mischung 50/50; 15: 0,25 Hz / Rückkopplung 0,3; 16: 0,8 Hz / 0,5 |
| **DT1–DT16** (FX1 und FX2 gleich) | weiche bis knackige Verzerrung, erst dezent, später früher sättigend, färben verschieden | Antrieb +2·n dB; ungerade n symmetrisch `tanh` (ungerade Obertöne), gerade n mit Versatz 0,25 (gerade Obertöne); danach Tiefpass `12 kHz · 0,8^⌊(n−1)/2⌋`; Pegelausgleich `1/(1 + 0,05·2n)`; ADAA erster Ordnung |
| **BC1–BC16** | Bitcrush, 9–16 mit eingebautem LFO auf die Rate, einige wärmer | n = 1–8 (Bits; Rate): (12; fs/2) (10; fs/3) (9; fs/4) (8; fs/6) (7; fs/8) (6; 11 025 Hz) (5; 8 000 Hz) (4; 5 512 Hz); gerade n „warm“: Tiefpass bei 0,45 · Rate; n = 9–16 wie n − 8, Rate × (1 ± 0,5 · Dreieck 0,3 Hz) |
| **RM1–RM16** | Ringmod: erst langsam (Stereo-Tremolo), später hörbar (mit Resonanz formantartig) | Sinusträger `0,4 Hz · 2^(0,84·(n−1))` (1 → 0,4 Hz · 4 → 2,9 Hz · 8 → 41 Hz · 12 → 242 Hz · 16 → 2,5 kHz), rechts 90° versetzt |
| **DL1–DL16** (FX2) | Echo: erst lang, später so kurz, dass es kammartig klingt | Zeit `800 ms · (1/800)^((n−1)/15)` (1 → 800 · 4 → 210 · 8 → 35 · 12 → 5,9 · 16 → 1,0 ms); Rückkopplung 0,45 (n ≤ 6), 0,6 (7–10), 0,75 (11–16); Tiefpass 5 kHz im Rückweg für n ≤ 6; n ≤ 4 Ping-Pong |
| **RV1–RV16** (FX2) | Hall von Kathedrale bis kleiner Raum | Dattorro-Tank wie `dirigent-hall` (Code übernehmen, eigene Instanz), RT60 `8 s · (0,3/8)^((n−1)/15)` (1 → 8 s · 4 → 4,2 · 8 → 1,7 · 12 → 0,72 · 16 → 0,3 s); Größe und Dämpfung mitgeführt |
- Der Gerät-Schalter TIME FX (Echo/Hall global aus) [H] wird nicht übernommen: Das leistet 2BAL = 0.

### 1.13 Schicht und Split
- [H] Zwei Programme klingen zusammen (SCHICHT) oder links/rechts geteilt (SPLIT, der Splitpunkt ist die erste Taste rechts). Für beide gelten
  SEMI (Transponieren der zweiten Stimme), BAL (Verhältnis), PAN (Stereo-Abstand) und TUNE (Verstimmung zwischen beiden). Diese Werte gehören
  zum Klang. Effekt-**Typen** kommen vom Grund- bzw. linken Programm, die **FX1-Anteile** dürfen je Programm verschieden sein. Der Arpeggiator
  wirkt nur auf das Grund- bzw. linke Programm.
- In der App [A]: Programm B ist eine **eingebettete Kopie** im selben Klang (kein Verweis auf die Bibliothek; sonst würde sich der Klang
  ändern, wenn der Bibliotheks-Klang sich ändert). FX1 läuft je Programm einmal (Typ aus A, Anteil eigen), FX2 einmal auf der Summe (Typ und
  Anteil aus A). LFOs je Programm (jedes Programm ist ein eigener Teil [H]). Stimmen: 10 je Spur gesamt, SCHICHT braucht 2 je Note [A].

### 1.14 Arpeggiator
- [H] Die Muster nehmen die Tasten **in der gespielten Reihenfolge**. 26 Muster: 11 aus den gehaltenen Tasten (1OCT, DBL, 2OCT, ALT, 3OCT,
  PONG, PON2, PON3, RND, RND2, RND3) und 15 feste Akkorde/Intervalle, die von der zuletzt gespielten Taste aus transponiert werden (MIN, MAJ,
  SUS2, SUS4, 7TH, MIN2, MAJ2, SU22, SU42, 7TH2, 1O, 2O, 3O, 5TH, 5TH2). Dazu HOLD (rastet ein, passt sich neuen Akkorden an) und TRIG
  (an = jede Note neu; aus = eine Note, nur ihre Tonhöhe springt).
- Muster-Bauweise [A] (Tasten in Spielreihenfolge t1 … tn): 1OCT = t1…tn wiederholt · DBL = t1 t1 t2 t2 … · 2OCT/3OCT = Durchlauf, dann
  +12 (und +24) · ALT = t1 t1+12 t2 t2+12 … · PONG = t1…tn…t2 (Ränder einmal) · PON2/PON3 = PONG über 2/3 Oktaven · RND/RND2/RND3 =
  Zufall über 1/2/3 Oktaven (Saat aus Projekt-id + Spur-uid + Schrittzähler, wie MK5). Fest (Halbtöne über der letzten Taste, aufsteigend
  wiederholt): MIN 0 3 7 · MAJ 0 4 7 · SUS2 0 2 7 · SUS4 0 5 7 · 7TH 0 4 7 10 · MIN2/MAJ2/SU22/SU42/7TH2 = dieselben + 12 dazu ·
  1O 0 · 2O 0 12 · 3O 0 12 24 · 5TH 0 7 · 5TH2 0 7 12 19.
- **Tempo [V]:** Das Gerät hat 20–400 BPM in Sechzehnteln, mit externer Clock wird der Wert zur Teilung [H]. Die App hat immer eine Clock,
  deshalb gibt es **TEILUNG** 1/4, 1/8, 1/8T, 1/16 (Standard), 1/16T, 1/32 im Song-Tempo. Läuft der Transport nicht, beginnt das Raster mit
  der ersten Taste (wie MK5). Swing folgt dem Song-Swing.
- **HOLD beenden [V]:** HOLD aus (ein Tipp). Am Gerät muss man den Klang wechseln oder die Arp-Taste 1 s halten [H].
- Technik: der Arp-Kern `ARPC` aus MK5, mit zusätzlichen Mustern und der Reihenfolge „gespielt“ (§6, BM4).

### 1.15 Sequencer: was die App ersetzt (Xander: der Geräte-Sequencer „passt nicht gut“)
| Gerät [H] | App heute | Entscheidung |
|---|---|---|
| Looper mit einer Spur, bis 10 000 Ereignisse, beliebig lang. Die Aufnahme wartet auf die erste Note, Play setzt den Schleifenpunkt | ● REC in Clips (Takt-Raster, Tempo, Quantisieren, Overdub), **FANG** (fängt nachträglich ein, was gespielt wurde), Szenen, Teile, Song | **kein Looper.** ● und FANG decken alles ab und zusätzlich Takt, Tempo, Undo, mehrere Spuren und Song |
| Darüberspielen, Klang wechseln und bearbeiten, während die Schleife läuft | Live-Tastatur spielt zu laufenden Szenen, Editor offen | wie App |
| nimmt Noten, Bend, MOD-Rad, Druck und Pedal auf | ● nimmt Noten mit Anschlag auf; Räder nicht (wie MS 2000, MK1) | wie App; Räder/Druck aufnehmen = Frage F9 |
| Arp in BPM bzw. Clock-Teilung | `ARPC` im Song-Raster | TEILUNG [V] (§1.14) |
| 4 Teile über MIDI-Kanäle | bis 8 Spuren | jede Bit-Mask-Spur = ein Teil mit eigenen 10 Stimmen [V] |
| – | Szenen-Übergang/Morph (V6a) und P-Locks (V5) **geplant** | Bit-Mask-Parameter bekommen Pfad-Schlüssel (`bm.a.o1.m`, `bm.a.f.cu` …), damit V5/V6a sie später ansprechen. Hier wird nichts davon gebaut |

### 1.16 Bedienfunktionen des Geräts → App
| Gerät [H] | App |
|---|---|
| Voice-Wahl P00–P119 / U00–U399, Write mit Platz und Namen | Bibliothek (Werk + Eigene), „Sichern“ wie bei allen Engines |
| Compare (Original vor den Änderungen hören) | **[A/B]** im Editor-Kopf (gibt es schon) |
| Klangwechsel verwirft ungesicherte Änderungen | nichts geht verloren: Autosave, Undo, A/B [V] |
| Init (1×: Auswahl 1OSC/2OSC/VEL/RAND, 2×: einfache Säge) | ⋯ → **Init ▸** [1 OSZ │ 2 OSZ │ ANSCHLAG │ ZUFALL]; INIT = 1 OSZ |
| Seq/Env-Umschalter (zweite Tastenebene für die Hüllkurven) | entfällt: Die Hülle steht direkt in ihrer Sektion [V] |
| Mehrere Hüllkurven gleichzeitig bearbeiten (Tasten zusammen drücken) | Chip-Reihe **VERKNÜPFT** [OSC1][OSC2][NOISE][FILTER] in jeder Hüllen-Ansicht |
| Param ‹ › + Value-Rad; Rad als Echtzeit-Regler | Regler-Zellen (ziehen, Fein-Modus); jede Zelle ist auch live bedienbar |
| Octave ‹ › | Oktav-Tasten der App-Tastatur |
| Layer, Split, Splitpunkt per Taste | Sektion LAYER, [Split ← nächste Note] (wie MK3) |
| Arp-Taste blinkt bei aktivem Arp | ARP-Punkt in der Sektionsleiste blinkt im Tempo |

### 1.17 Nicht übernommen
Hardware (Tasten, Kalibrierung, Werks-Reset, Firmware, Pedal-Polarität, Range-Beep), MIDI-Kanäle/CC/SysEx/Program Change/Local KB,
Verwaltungs-Software, globaler Stimmton 400–470 Hz (die App stimmt alle Spuren gemeinsam auf 440 Hz), globale Anschlags- und Druck-Kurven
(App-Standard; Druck-Kurve nur, falls F3 = ja), TIME-FX-Schalter, gemeinsamer 10-Stimmen-Vorrat über alle Teile, die 120 Werks-Klänge
(keine Gerätedaten, eigene Startklänge §4).

### 1.18 Verbesserungen [V] im Überblick
| Nr. | Gerät | Hier | sichtbar? |
|---|---|---|---|
| V1 | eine Zahl und 4 Ziffern, die Welle sieht man nur auf dem Druck-Symbol | **Masken-Karte 16 × 16** (Zeile = obere 4 Bits, Spalte = untere 4 Bits; die runden Masken 16k−1 stehen alle in Spalte 15) und **8 Bit-Schalter** | ja → F1 |
| V2 | Oktavsprünge muss man selbst mit SEMI ausgleichen | Oszilloskop + **Oktav-Hinweis** „klingt ≈ +1 Okt“ | ja → F5 |
| V3 | Werte ohne Einheit | LCD zeigt ms, Hz, Cent, HT, Startmaske | ja (nur Anzeige) |
| V4 | körnige Hüllkurven, Klicks beim Klauen | glatte Hüllkurven, 3-ms-Blende beim Klauen, Maskenwechsel an der Periodengrenze | Klang → F6 |
| V5 | Hüllkurven auf einer zweiten, versteckten Ebene | Hülle direkt in der Sektion | ja |
| V6 | Arp in freien BPM | TEILUNG im Song-Tempo | ja |
| V7 | Stimmung immer auf C | GRUNDTON wählbar | ja |
| V8 | LFO-Phase zufällig je Einschalten | gleiche Phase bei jedem ▶ (gleicher Song = gleicher Klang) | nein |
| V9 | HOLD nur über Klangwechsel oder 1-s-Druck beenden | HOLD-Tipp | ja |
| V10 | Änderungen gehen beim Klangwechsel verloren | Autosave, Undo, A/B | nein |
| V11 | 10 Stimmen für alle Teile zusammen | 10 je Spur | nein |
| V12 | – | alle Routen in der Mod-Übersicht (K1), auch die Masken-Hüllkurve | ja (K1 verlangt) |

---

## 2. DSP im AudioWorklet

### 2.1 Prozessor und Nachrichten
- Eigener Prozessor **`'synq-bm'`** in einem eigenen Modul (ASCII-only, Blob/data-URL wie die anderen Worklets), 1 Ausgang stereo, ein Knoten
  je Bit-Mask-Spur. `dirigent-analog` bleibt **byte-gleich** (Regel 28).
- Nachrichten Haupt-Faden → Prozessor (gebündelt je Planungs-Tick):
  `{t:'prog', ab:'a'|'b', p}` ganzes Programm · `{t:'set', ab, k, v}` ein Wert (höchstens 60/s je Geste) · `{t:'ly', p}` Schicht/Split ·
  `{t:'on', list:[{n, v, at, d}]}` (`d` = Ziel A/B/beide wie MK5) · `{t:'off', list:[{n, at}]}` · `{t:'ctl', bend, mw, af, sus, at}` ·
  `{t:'tr', run, at}` (Transport; LFO-/RAND-Neustart) · `{t:'stop', at, tau}` · `{t:'panic'}` · `{t:'reset'}` (Saat, LFO, FX-Puffer; für
  Offline und Tests) · `{t:'scope', on}`.
  Tabellen kommen **direkt vom Worker** über einen `MessagePort` (`{t:'tab', m, lv:[Float32Array…]}`, übertragen, nicht kopiert).
- Prozessor → Haupt-Faden: `{t:'load', v}` (1/s, wie die Synth-Worklets), `{t:'late', n}`, `{t:'need', m}` (Tabelle fehlt), `{t:'end', n}`,
  `{t:'scope', m1, m2, ph}` (höchstens 30/s, nur wenn angefordert).

### 2.2 Tabellen: Bau im Worker, Mip-Kette, Speicher
- **Worker `synq-bm-tab`** (Blob, eigener Faden) rechnet je Maske das Spektrum **exakt nach §1.2**:
  flächengemittelte Abtastung von 32 768 Punkten je Periode (jeder Punkt ist das genaue Integral eines Sinusstücks), eine reelle FFT, dann
  Box-Korrektur `÷ sinc(πk/N)` für k ≤ 1024. Gemessen mit dem Prototyp `S/bm-tools/fastbuild.mjs`: **≈ 2 ms je Maske** (Node, Xeon),
  Abweichung zur genauen Fourier-Reihe ≤ **−80 dB**. Ganzer Pool ≈ 0,5 s Xeon (iPhone geschätzt 1–1,5 s, unbelegt).
- **Mip-Kette** wie §10.1: 11 Oktavstufen, Größen 2048, 2048, 1024, 1024, 512, 512, 256, 256, 128, 128, 64; Teiltöne je Stufe ≤ Nyquist der
  Stufe; ≈ 32 KB je Maske, **≤ 8,2 MB** für alle 256 (Float32). Der Gleichanteil bleibt in der Tabelle (§2.3).
- **Ablage:** im `AudioWorkletGlobalScope`, geteilt von allen `synq-bm`-Knoten eines AudioContext (beim Bau prüfen; sonst je Knoten kopieren).
- **Reihenfolge:** Beim Laden eines Klangs berechnet der Haupt-Faden die **benötigten Masken** (MASK, MASK + START, alle Masken-Anteile von
  V/MW/AT/LFO als Bereich, beide Programme). Diese baut der Worker **zuerst**, danach den Rest in Bereichen um die benötigten herum, bis der Pool
  voll ist (Leerlauf-Priorität).
- **Bereit-Regel:** Noten eines Klangs, dessen benötigte Masken noch fehlen, werden gepuffert (nicht verworfen) und spielen, sobald die Tabellen da
  sind (Ziel ≤ 150 ms Xeon). Fehlt im Lauf eine Maske außerhalb dieses Bereichs, nimmt der Oszillator die nächste gebaute Nachbarin und meldet
  `need`. Das wird gezählt (`bmInfo().fallbacks`) und muss in allen Abnahmen 0 sein.
- Nichts davon im Projekt, in der Bibliothek oder online: Tabellen werden immer neu erzeugt. Ein Klang ist ≈ 2 KB JSON (gut für die Verbindung zu
  anderen, CLAUDE.md).

### 2.3 Oszillator lesen, Maske wechseln, Gleichanteil
- Phase in Notenperioden, `Δφ = f/fs`. Stufenwahl nach `Δφ`, Überblendung zur nächsten Stufe über die oberste halbe Oktave, lineare
  Interpolation in der Tabelle (wie §10.1, gemessen −61 … −102 dB, 0,20–0,36 % je Osz. und Stimme).
- Maskenwechsel nur, wenn φ über 1 läuft (§1.4). Ein Wechsel dazwischen wird bis zur nächsten Periode gemerkt.
- **Gleichanteil:** je Oszillator ein Hochpass erster Ordnung bei 8 Hz [A]. Die Messbilder des Handbuchs zeigen genau so eine Kopplung (abfallende
  Dächer, langsames Einschwingen nach Stille) [H-Bild]. Weil jede Maske bei y = 0 beginnt, wechseln Masken an der Periodengrenze ohne Sprung.

### 2.4 Bandbegrenzung: Strategie
- Das Gerät rechnet naiv mit 16-facher Überabtastung [Ö]. Die Zähnchen hoher Masken haben bis zu 256 Sprünge je Periode, bei hohen Noten mehr als
  Samples. polyBLEP je Sprung scheidet aus, naive 16-fache Überabtastung kostet etwa 16 × die Lesearbeit.
- Gewählt: **exakte, bandbegrenzte Tabellen** (§2.2). Jede Maske behält ihre ganze Form (Zähnchen, Stille, Rampen), aber nichts faltet zurück.
  Ziel ≤ −60 dB Faltung bei allen Masken bis C8 (BM1-04).
- Was hörbar anders sein kann als am Gerät: der Rest an Faltung, den 16-fache Überabtastung übrig lässt („digitale Körnung“). Ein Schalter ROH
  kommt nur nach F6.

### 2.5 Stimme, Steuer-Takt, Schutz
- Steuer-Takt alle 16 Samples: Hüllkurven, Δ-Hüllkurven, LFOs, Mod-Summen, Filter-Koeffizienten. Pegel je Sample linear interpoliert.
  Struktur-Werte (MODE, Filter-MODE, Schicht/Split) wechseln mit 30-ms-Neuverteilung wie MK3 (`engXf`-Art).
- Stetige Parameter werden bei Gesten mit τ 5 ms geglättet. Maskenwerte springen ganzzahlig an der Periodengrenze.
- **Keine Allokation** in `process()`: 10 Stimmen × 2 Programme, Filter, FX-Puffer (Echo bis 0,85 s, Hall) im Konstruktor.
- Denormal-Grenze 1e-15 in Filter, DC-Sperre, FX. Endlichkeits-Prüfung je Block: Eine Stimme mit NaN/Inf wird stumm und neu gesetzt
  (`logErr` höchstens alle 5 s).
- Schlafen: Stimmen unter −100 dBFS nach dem Release sind frei. Ohne Stimmen und mit stillen FX schreibt `process()` nur Nullen (Leerlauf ≤ 0,1 %).

### 2.6 CPU-Rahmen und Begrenzer
| Teil (M-CPU, Chromium-Worklet, Xeon) | höchstens |
|---|---|
| eine Stimme (2 Osz., Rauschen, Filter, 4 ADSR, 3 Δ) | **1,0 × VA-Stimme** (≈ 1,1 %) |
| 10 Stimmen | 11 % |
| LFO1+2 je Programm | 0,05 % |
| FX1 (CH/DT/BC/RM) | 0,4 % |
| FX2 RV / DL | 1,0 % / 0,3 % |
| **schlimmster Fall** (SCHICHT, 10 Stimmen, 2 × FX1, FX2 RV) | **≤ 13 %** |
| typischer Pad-Akkord (6 Stimmen, CH + RV) | ≤ 8 % |
| Leerlauf | ≤ 0,1 % |
- iPhone 12 Pro Max: Faktor unbelegt, Annahme 1,5–2,5×. `perfProbe` (MK1) bekommt eine Bit-Mask-Probe (10 Stimmen + FX); Gerätetest durch Xander.
- **Begrenzer (K1-konform [X]):** Unter Last ändert sich nie der Klang klingender Stimmen. Stufe ≥ 1: höchstens 6 Stimmen je Spur, neue Noten klauen
  die **leiseste**. Stufe ≥ 2: höchstens 4. Hinweis-Chip „CPU“ wie heute. **Nie im Offline-Render.** Gespeicherte Werte bleiben unverändert.

### 2.7 Bitgleichheit
- Alle Zufallsquellen (Rauschen, RAND-LFO, RND-Arp, ZUFALL-Init) mit fester Saat aus Projekt/Spur/Zähler. LFO-Phase 0 bei ▶ und bei `reset`.
- Zwei Offline-Render derselben Folge nach `reset` sind bitgleich (44,1 und 48 kHz je für sich). Das ist nötig für Golden-Render, Video (VV)
  und Einfrieren (FR1).

---

## 3. Editor (App-Stil, an den Gerätesektionen orientiert)

### 3.1 Grundaufbau
```
Zeile 1  Kopf wie heute: ✕ · Spurname · Engine-Knöpfe/Chip (+ „Bit Mask“) · A/B · ↶ ↷ · ●                     44 px
Zeile 2  ‹  OSC1  ›   ·   ●●○○○○○○○○○○ (Lage im Signalfluss)   ·   [A │ B] (nur bei SCHICHT/SPLIT)            44 px
Zeile 3  LCD-Zeile (lcdShow): Sektion · Parameter · Wert in Geräte-Schreibweise · Einheit/Bedeutung              36 px
Feld     Inhalt der Sektion (feste Blatthöhe je Format, kein Layout-Sprung)
```
- **Sektionen in Signalfluss-Reihenfolge** [V, Xanders Wunsch beim MS 2000, 26.10.]: PITCH → OSC1 → OSC2 → NOISE → FILTER → FX → LFO1 → LFO2 →
  MOD → ARP → GENERAL → LAYER. Wischen links/rechts im Feld oder ‹ › blättert, Tipp auf den Namen öffnet die Liste (12 Zeilen à 44 px, per Finger scrollbar).
- Beschriftung der Parameter wie am Gerät (MASK, SEMI, TUNE, START, SPD, L A D S R LOOP, FREQ, CUTF, RESO, MODE, TRK, AMT, DEST, WAVE, DLAY,
  DCAY, 1TYP 1BAL 2TYP 2BAL, TYPE HOLD TRIG, V-DEST …). Die deutsche Erklärung steht in der LCD-Zeile, wie beim MS 2000 (H-16) → F2.
- LCD-Beispiele: „OSC1 · MASK 078 · ≈ Grundton · ½ still · −5 dB · Bits 0100 1110“, „OSC1 · START +24 · beginnt bei Maske 102“,
  „FILTER · CUTF 37 · 264 Hz“, „OSC2 · A 9 · 424 ms“, „LFO1 · SPD 50 · 4,7 Hz“, „PITCH · START +6 · beginnt 0,44 HT höher“,
  „FX · 2TYP DL5 · Echo 134 ms, Rückkopplung mittel“.

### 3.2 OSC1/OSC2: Welle, Bits, Karte
- **Welle (Block W):** Oszilloskop mit einer Periode der aktuellen Maske (aus der Tabelle, gezeichnet einmal je Maskenwechsel). Darüber die
  Nummer groß, daneben ‹ › (je ≥ 44 × 44), der Oktav-Hinweis („≈ +1 Okt“) aus `mask-stats.json`-Werten (stärkster Teilton) und [KARTE].
  Während eine Note klingt und die Maske sich bewegt (Δ, LFO, Rad), folgt die Anzeige höchstens 30/s und hört auf, sobald der Editor zu ist.
- **Bit-Schalter (Block B):** 8 Schalter in zwei Reihen: oben b7 b6 b5 b4 (= Zeile der Karte), unten b3 b2 b1 b0 (= Spalte). Je Schalter ≥ 72 × 44.
  Tipp kippt ein Bit = neue Maske (ein Undo). LCD erklärt das Bit („b5: zweite Hälfte still, klingt höher“, „b4: zweite Sinushälfte“,
  „b0: feinste Wiederholung, Zähnchen“).
- **MASKEN-KARTE (Popover in derselben Blatthöhe):** 16 × 16 Felder, Zeile r (0–15) = obere 4 Bits, Spalte c (0–15) = untere 4 Bits, Maske = 16r + c.
  Farbe = Klangschwerpunkt (dunkel = weich, hell = scharf), Spalte 15 trägt die Überschrift „rund“. So sieht man die Handbuch-Regel „dunkler bis
  16k−1, dann Sprung“ direkt. Die Karte ist **eine** Wischfläche (≥ 44 px): Finger aufsetzen und ziehen zeigt eine **Lupe** mit 3 × 3 Nachbarn
  à 44 × 44 px (Nummer + Mini-Welle), die LCD nennt Werte. Loslassen wählt die Maske und spielt sie bei stehendem Transport an (ein Undo).
  Dazu ZEILE ‹ › und SPALTE ‹ › (je 44 px) für genaue Wahl. Ist START ≠ 0, zeigt ein **Δ-Pfeil** den Weg von MASK + START nach MASK.
  Die Karte wird einmal als Bild berechnet und zwischengespeichert (Canvas 2D). WebGL wäre hier ohne Nutzen.
- **Regler (Block R):** MASK · SEMI · TUNE · START · SPD.
- **Hülle (Block H):** L · A · D · S · R · LOOP + kleine Kurve. Chip-Reihe **VERKNÜPFT** [OSC1][OSC2][NOISE][FILTER]: Eine Geste ändert alle
  verknüpften Hüllen auf denselben Wert (ein Undo). Die Verknüpfung endet mit dem Schließen des Editors.

### 3.3 Weitere Sektionen (Zellen)
| Sektion | Zellen | Extra |
|---|---|---|
| PITCH | START · SPD · END | Kurve des Tonhöhenverlaufs |
| NOISE | FREQ · L · A · D · S · R · LOOP | VERKNÜPFT |
| FILTER | CUTF · RESO · MODE · TRK · L · A · D · S · R · LOOP | kleine Frequenzgang-Kurve (nur Anzeige [V]) |
| FX | 1TYP · 1BAL · 2TYP · 2BAL | Typ-Liste mit Familien-Chips (CH DT BC RM │ DL RV DT), 16 Zeilen je Familie à 44 px |
| LFO1/LFO2 | AMT · SPD · DEST · WAVE · DLAY · DCAY | Live-Punkt auf der Wellenform |
| MOD | V-DEST · V-AMT · M-DEST · M-AMT · AT-DEST · AT-AMT | [Übersicht ▸] = K1-Mod-Übersicht |
| ARP | TYPE · TEILUNG · HOLD · TRIG | TYPE-Liste 2 Spalten (aus Tasten 11 │ feste 15) + AUS, Zeilen 44 px |
| GENERAL | MODE · VOL · SEMI · PORT · PANS · RATE · BEND · STIMMUNG · GRUNDTON | – |
| LAYER | MODUS (EIN │ SCHICHT │ SPLIT) · SEMI · BAL · PAN · TUNE · SPLIT | [Split ← nächste Note] (wie MK3), [Programm B ▾]: Kopie von A │ INIT │ aus Bibliothek (kopiert Programm A eines Bit-Mask-Klangs) |
- Bei SCHICHT/SPLIT wählt [A │ B] in Zeile 2, welches Programm alle Sektionen bearbeiten. Die LCD trägt dann „A ·“ bzw. „B ·“. FX-Typen sind bei B
  grau mit dem Hinweis „kommt von A“ [H].

### 3.4 Gesten (wie Nachtrag 6 / ND2)
Senkrecht ziehen = Wert, seitlich weg = Fein-Modus, Doppeltipp = INIT-Wert, Tipp = auswählen (LCD). Listenwerte (MASK über ‹ ›, MODE, DEST,
WAVE, TYPE, 1TYP/2TYP, STIMMUNG) gehen beim Ziehen Stufe für Stufe und öffnen beim Tipp eine Liste. Zweipolige Werte (TUNE, START, Tonhöhen-
END, V/M/AT-AMT, SEMI) haben eine Mittelraste. Loslassen spielt den Klang einmal an (Anschlag 0,8), beim Ziehen höchstens alle 300 ms, nicht bei
laufendem Transport. Jede Geste = **ein** Undo über `soundEdit(t, …)`.

### 3.5 Formate (M-PLATZ mit echter App-Schrift; Blatthöhe bei jedem Umschalten ± 0 px)
| Format | OSC-Sektion | andere Sektionen |
|---|---|---|
| P1 390×844 (auch 428×926) | W 100 px (Oszilloskop 220 breit, rechts Nummer/‹ ›/Hinweis/[KARTE]) · B 2 × 44 + 4 · R 5 Zellen à ≥ 64 × 64 · H 6 Zellen à ≥ 56 × 64; Summe ≈ 340 px | Zellen ≥ 64 × 64, bis 5 je Reihe |
| P2 375×667 | Unter-Reiter **WELLE │ HÜLLE** (WELLE = W + B + R, HÜLLE = H + Kurve + VERKNÜPFT), damit die Blatthöhe hält | wie P1, Zellen ≥ 60 × 60 |
| P3 320×568 | wie P2; Bit-Schalter 72 × 44, Zellen 5 × 58, Hülle 6 × 48 × 56 | Zellen ≥ 56 × 56 |
| L1 844×390 (mit 47-px-Safe-Area: 750 px nutzbar) | eine Reihe: W (200 × 96 + Zeile 44) │ B (4 × 50) │ R-Reihe 5 × 60 und H-Reihe 6 × 50 übereinander (Summe ≈ 743 px); Feld ≈ 140 px hoch | alle Zellen einer Sektion in einer Reihe (bis 10 × ≥ 56) |
| L2 667×375 | WELLE │ HÜLLE wie P2, nebeneinander angeordnet | eine Reihe, Zellen ≥ 52 × 56; bei > 8 Zellen zwei Reihen |
| W 926×428 (Xanders iPhone quer, Safe-Area) | wie L1, Oszilloskop 240 × 110 | wie L1 |
- Masken-Karte: P1 Felder 22 px (Fläche 352 × 352), P3 18 px, L1 16 px (256 × 256) mit Lupe; Zeilen-/Spalten-Stepper immer ≥ 44 px.
- Keine Beschriftung läuft über, kein waagrechtes Scrollen der Seite. Listen scrollen per Finger.

### 3.6 Tastatur-Bereich
- BEND- und MOD-Rad (Bauteil aus MK1) erscheinen auch bei Bit-Mask-Spuren. Nichts wird gespeichert, kein Undo (wie MK1).
- **Druck** gibt es am iPhone nicht (kein 3D-Touch). Vorschlag: Finger auf der gehaltenen Taste nach oben schieben = Druck 0 → 1 über 60 px, ein
  schmaler Balken auf der Taste zeigt ihn → **F3**. Bis zur Antwort wird nichts davon gebaut (die AT-Ziele bleiben einstellbar).

---

## 4. Eigene Startklänge (keine Gerätedaten)

**Regeln:** keine Werks-Programme des Geräts, keine Namen aus seiner Werksliste, keine Künstlernamen. Auch die Rezepte aus dem Handbuch-Kapitel
„erste Klänge“ werden **nicht** nachgebaut. Der Schwerpunkt ist Synthpop (Xander). Kurzschrift: `Maske/SEMI/TUNE`, `Δ START@SPD`,
Hülle `A·D·S·R` (L 99, wenn nicht genannt), Filter `CUTF RESO MODE TRK%` und Filter-Hk `L·A·D·S·R`, Tonh. `START@SPD`, LFO
`Ziel WAVE AMT/SPD (DLAY)`, FX `Typ BAL`. Nicht Genanntes = INIT (§5.1). Startwerte, nachstimmen per Messung (BM7).

| Kat. | Name | Programm |
|---|---|---|
| Bass | Säge-Bass | MONO PORTA, PORT 3 · O1 7/0/0 · O2 8/−12/0 L70 · F 24 30 LP 40 · Hk 38·0·6·2·3 · O-Hülle 0·0·15·3 · V→F EG +40 · FX1 DT3 25 |
| Bass | Gummi-Bass | MONO RETRIG · O1 15/0/0 Δ −8@26 · O2 31/−12/0 L60 · F 55 20 LP · Hülle 0·7·9·3 · V→VOL +30 |
| Bass | Puls-Bass | MONO, PORT 2 · O1 56/−12/0 (Oktave der Maske ausgeglichen) · O2 7/0/+6 L50 · F 30 40 LP 30 · Hk 30·0·5·1·3 |
| Bass | Summ-Bass | POLY RETRIG · O1 78/0/0 · O2 78/0/+7 L80 · F 35 25 LP · Hk 25·0·6·3·4 · FX1 CH5 30 |
| Bass | Digital-Bass | MONO RETRIG · O1 28/0/0 Δ +36@28 · O2 24/−12/0 L60 · F 70 0 · FX1 BC4 30 |
| Bass | Sub & Kante | O1 31/−12/0 L95 · O2 7/0/0 L55, Hülle 0·6·5·3 · F 48 15 LP 50 · Hk 20·0·5·0·3 · V→F EG +30 |
| Lead | Quadrat-Lead | MONO PORTA, PORT 4 · O1 8/0/−4 · O2 8/+12/+4 L60 · F 62 20 LP 60 · LFO1 FREQ SIN 5/50 (DLAY 8) · MW→LFO1 AMT +60 · FX2 DL5 22 |
| Lead | Spiegel-Lead | MONO · O1 29/0/0 · O2 30/+12/+3 L50 · F 80 10 · LFO1 FREQ SIN 4/48 (DLAY 9) · FX2 RV6 25 |
| Lead | Hohl-Lead | MONO PORTA · O1 24/0/0 · O2 20/0/+8 L70 · F 50 45 BP 70 · Hk 20·3·8·6·5 · AT→FLT +40 |
| Lead | Kreisch-Lead | MONO · O1 255/−36/0 · O2 7/0/+5 L60 · MW→O1 MASK −60 · FX1 DT10 40 |
| Lead | Sägen-Solo | MOLY, PORT 3 · O1 7/0/−6 · O2 7/0/+6 · F 58 30 LP 50 · Hk 18·2·7·7·4 · LFO1 FREQ SIN 4/52 (DLAY 9) · FX1 CH3 30 · FX2 DL4 20 |
| Pad | Weite Fläche | O1 7/0/−5 · O2 7/0/+5 L95 · Hülle 9·0·15·10 · F 55 10 LP 30 · FX1 CH2 50 · FX2 RV3 25 · PANS 8 |
| Pad | Masken-Wandel | PARA SLUR · O1 31/0/0 Δ −24@6 · O2 47/0/+4 L70 Δ +16@5 · Hülle 8·0·15·10 · LFO2 O1 MASK SIN 25/20 · FX2 RV2 30 |
| Pad | Hohl-Chor | O1 24/0/−3 · O2 15/+12/+3 L60 · F 52 35 BP 50 · Hülle 8·0·15·9 · LFO1 FILT SIN 12/26 · FX1 RM13 25 · FX2 RV4 30 |
| Pad | Nachtfläche | PARA · O1 7/0/−4 · O2 24/−12/+4 L70 · F 38 25 LP · Hk 35·10·11·6·10 · FX1 CH4 45 · FX2 RV2 35 |
| Pad | Glimmer | O1 63/−12/0 · O2 95/−24/+6 L60 · Hülle 7·0·15·10 · LFO2 MASK SIN 20/30 · FX1 CH6 40 · FX2 DL3 25 |
| Pad | Kerb-Fläche | O1 7/0/−4 · O2 8/0/+4 L80 · F 60 0 NOTCH 0 · LFO1 FILT SIN 25/20 · Hülle 9·0·15·10 · FX2 RV5 25 |
| Keys | Masken-Klavier | O1 31/0/0 Δ +40@30, Hülle 0·10·4·6 · O2 15/+12/0 L40, Hülle 0·8·0·5 · Tonh. +6@35 · V→VOL +50 · FX2 RV7 15 |
| Keys | Elektro-Tasten | O1 31/0/0, Hülle 0·11·3·6 · O2 30/+12/+3 L50, Hülle 0·7·0·5 · LFO1 VOL SIN 6/48 · FX1 CH3 30 |
| Keys | Clavi-Bit | POLY RETRIG · O1 56/−12/0, Hülle 0·8·0·3 · F 45 30 LP · Hk 30·0·5·0·3 · V→F EG +50 |
| Keys | Glocken-Piano | O1 29/0/0, Hülle 0·11·2·7 · O2 31/+12/0 L45 · V→MASK −12 · FX2 RV6 20 |
| Keys | Samt-Piano | O1 15/0/0 · O2 31/+12/+2 L45, Hülle 0·9·0·5 · F 60 · Tonh. +4@36 · LFO1 PAN SIN 30/45 · FX1 CH4 25 |
| Blech/Str. | Blech-Stoß | O1 7/0/−5 · O2 7/0/+5 · F 37 15 LP 40 · Hk 22·6·7·10·5 · Tonh. −8@15 · PANS 7 · V→F EG +35 |
| Blech/Str. | Streicher | PARA · O1 7/0/−6 · O2 24/0/+6 L70 · F 62 5 LP · Hülle 8·0·15·9 · FX1 CH2 55 · FX2 RV3 25 |
| Blech/Str. | Solo-Streich | MONO PORTA · O1 7/0/0 · F 56 15 · Hülle 6·0·15·7 · LFO1 FREQ SIN 5/51 (DLAY 9) · AT→LFO1 AMT +50 |
| Blech/Str. | Blech-Satz | SLUR · O1 8/0/−3 · O2 24/0/+3 L80 · F 40 10 · Hk 24·5·8·8·5 · Tonh. −6@17 |
| Pluck/Glocke | Holz-Pluck | O1 30/0/0 · O2 15/+19/0 L40 · F 45 20 BP 60 · Hülle 0·7·0·5 · V→F EG +40 |
| Pluck/Glocke | Kristall-Pluck | O1 30/0/0 · O2 63/0/+4 L50 · Hülle 0·7·0·6 · FX2 DL6 25 |
| Pluck/Glocke | Kalimba-Bit | O1 15/0/0 Δ −8@32 · Hülle 0·8·0·5 · Tonh. +3@38 · FX2 RV9 15 |
| Pluck/Glocke | Glocke | O1 29/0/0, Hülle 0·13·0·11 · O2 30/+19/+4 L60, Hülle 0·11·0·9 · FX2 RV2 30 |
| Pluck/Glocke | Harfen-Bit | O1 7/0/0 · O2 31/+12/0 L50 · F 50 10 · Hk 30·0·6·0·6 · Hülle 0·9·0·8 · PANS 10 |
| Orgel/Chor | Bit-Orgel | O1 31/0/0 · O2 95/−24/0 L60 · Rauschen 99 L10, Hülle 0·4·0·2 · Hülle 0·0·15·2 · FX1 CH16 60 |
| Orgel/Chor | Röhren-Orgel | O1 47/−12/0 · O2 79/−12/+2 L60 · F 70 · Hülle 1·0·15·3 · FX1 CH15 50 · FX2 RV5 20 |
| Orgel/Chor | Vokal-Chor | O1 24/0/−4 · O2 24/0/+4 · F 55 60 BP 80 · LFO1 FILT SIN 10/22 · Hülle 7·0·15·9 · FX1 RM14 30 · FX2 RV3 30 |
| Orgel/Chor | Luft-Chor | O1 15/0/0 · Rauschen 99 L45, Hülle 7·0·15·8 · F 58 50 BP 60 · Hülle 7·0·15·9 · FX2 RV2 35 |
| FX/Arp | Arp-Glitzer | ARP 2OCT, TRIG an · O1 63/−12/0 · Hülle 0·7·0·5 · FX2 DL4 30 |
| FX/Arp | Sequenz-Puls | ARP 1OCT · O1 8/0/0 · F 35 40 · Hk 30·0·5·0·3 · LFO1 O1 MASK SAWS 30/30 · FX2 DL5 25 |
| FX/Arp | Sturz-Ton | O1 7/0/0 · Tonh. +63@12 · F 70 · FX2 DL3 30 |
| FX/Arp | Rausch-Welle | O1 L0 · Rauschen 70 L90, Hülle 8·0·15·10 · F 45 60 BP · LFO1 N FREQ SIN 40/15 · LFO2 FILT SIN 30/12 · FX2 RV1 40 |
| FX/Arp | Rhythmus-Maske | O1 248/−24/0 (Spanne 256, ⅞ still: tief gespielt ein Rhythmus) · F 60 · FX2 DL7 20 |
- **INIT-Varianten** [H Namen, A Werte]: INIT = 1 OSZ (O1 7 L 99, sonst neutral, keine Route) · 2 OSZ (O1/O2 7, TUNE −3/+3, L 99/99) ·
  ANSCHLAG (2 OSZ + F 40 0 LP, Hk 35·0·8·5·4, V→F EG +60) · ZUFALL (🎲: hörbar, mindestens ein Osz. L ≥ 60, CUTF ≥ 30, RESO ≤ 85 bei CUTF < 40,
  Saat je Wurf aus Zeit, Ergebnis wie jede Änderung mit Undo).
- 40 Programme als Daten (≤ 10 KB) im Block `sq-bm-src`, Bibliothek-Zeilen schreibgeschützt („Werk“), Kategorien wie oben.

---

## 5. Einbindung

### 5.1 Daten (Format 5, zusätzlich)
```js
Sound.engine = 'bm'                                   // ENGINE_LABEL.bm = BM_NAME
p.bm = { v:1,
  ly: { md:'ein', semi:0, bal:50, pan:0, tune:0, sp:60 },          // 'ein'|'sch'|'spl'; sp = MIDI-Note des Splitpunkts
  a: PROG, b: null }                                               // b: PROG bei SCHICHT/SPLIT
PROG = {
  o1:{ m:7, st:0, tu:0, ds:0, dv:20, e:{l:99,a:0,d:0,s:15,r:2,lp:0} },   // m Maske, st SEMI, tu TUNE, ds Δ-START, dv Δ-SPD
  o2:{ m:7, st:0, tu:0, ds:0, dv:20, e:{l:0, a:0,d:0,s:15,r:2,lp:0} },
  n: { fr:99,                        e:{l:0, a:0,d:0,s:15,r:2,lp:0} },
  f: { cu:99, re:0, md:'lp', tk:0,   e:{l:0, a:0,d:0,s:15,r:2,lp:0} },   // md lp|hp|bp|notch
  pe:{ ds:0, dv:20, de:0 },                                              // Tonhöhen-Δ START/SPD/END
  l1:{ am:0, sp:50, ds:'freq', w:'sin', dl:0, dc:0 },
  l2:{ am:0, sp:50, ds:'flt',  w:'sin', dl:0, dc:0 },
  mo:{ vd:'flt', va:0, md:'l1a', ma:0, ad:'flt', aa:0 },                 // Anschlag, MOD-Rad, Druck: Ziel + Menge
  fx:{ t1:'CH1', b1:0, t2:'RV1', b2:0 },
  ar:{ t:'off', dv:'1/16', ho:0, tr:1 },
  g: { mo:'poly', vo:80, st:0, po:0, ps:0, ra:0, pb:2, tm:'et', rt:0 } } // vo: Wert so, dass INIT = −18 LUFS
```
- Kennungen: MODE `poly mono slur mport para moly pslur mretrig pretrig` · LFO-Ziele `freq vol flt mask pan o1f o1v o1m o2f o2v o2m nf nv fx1t fx2t
  fx2b` · MW/AT-Ziele `flt l1a l1s l2a l2s vol mask freq o1v o1m o2v o2m nf nv fx1b fx2b` · V-Ziele `flt feg vol mask peg atk` · Wellen `sin sqr up
  down saws step hsin rand` · Arp `off 1oct dbl 2oct alt 3oct pong pon2 pon3 rnd rnd2 rnd3 min maj sus2 sus4 7th min2 maj2 su22 su42 7th2 1o 2o 3o
  5th 5th2` · Stimmungen `et arab jmaj jmin mean pyta`.
- `SQBM.normBm` (neu): klemmt und rundet jeden Wert auf §1, prüft Kennungen gegen die Listen, Fehlendes = INIT, feste Schlüssel-Reihenfolge,
  **unbekannte Schlüssel bleiben erhalten** (vorwärts-verträglich). Nicht gespeichert: [A │ B]-Wahl, VERKNÜPFT, Karte, Druck-Balken.
- **Ältere App-Versionen:** MK0-Schutz greift (unbekannte Engine `'bm'` → Klang bleibt unverändert, Spur spielt INIT mit Hinweis, Projekt
  gesperrt gegen Überschreiben). `SOUNDS_FORMAT` bleibt 2, außer der Dirigent findet beim Bau einen Grund. `max_app` muss die neue Version decken (Xander).

### 5.2 Engine je Spur, Host, Laden bei Bedarf
- Engine-Wahl im Kopf: fünfter Knopf `BM_NAME`, wo Kopf und Namensfeld (≥ 72 px) es erlauben, sonst Eintrag im Engine-Chip (Liste 5 × 44 px),
  gemessen wie MK1 (§B.3). `setEngineOf` behält `p.bm` beim Wechsel weg, ein unberührtes INIT-`p.bm` wird aufgeräumt.
- **`BmHost`** (Haupt-Faden) bietet dieselben Aufrufe wie der Synth-Host (Note an/aus mit Zeit, Werte, Räder, Stopp, Panik, Klang setzen,
  Offline-Render). `spawnVoice`, `scheduleTrack`, `inputDown`, MELODIE, „Eine Skala“, ⇅, FANG und ● laufen unverändert darüber.
- **Engine-Wechsel** auf einer klingenden Spur: alter und neuer Knoten blenden gleichleistungsgemäß über 30 ms, gehaltene Tasten gehen an den
  neuen Knoten [A].
- **Laden bei Bedarf:** Modul, Worker und Editor-Block `sq-bm-src` entstehen erst, wenn eine Spur Bit Mask wählt oder ein geladenes Projekt
  einen Bit-Mask-Klang hat (beim Projekt-Laden parallel, vor dem ersten ▶, mit `tickAhead(.3)` vorher). Ohne Bit-Mask-Klang: kein `addModule`, kein
  Worker, Startzeit unverändert.
- **Ohne AudioWorklet** (`?engine=native`, sehr altes WebKit): NativeVoice mit `PeriodicWave` aus den ersten 64 Teiltönen der Tabellen von O1/O2
  (Start-Maske) und dem nativen Filter. Hinweis „`BM_NAME` braucht AudioWorklet – vereinfacht“. Kein Absturz.
- **Arp-Kern:** `ARPC` und `arpPattern` wandern aus `sq-mk-src` in einen gemeinsamen Block `sq-arp-src` (bei Bedarf geladen), den MS 2000 und
  Bit Mask nutzen. Das MS 2000 bleibt bitgleich (MK5-Abnahmen erneut).
- **Räder:** Das MK1-Bauteil gilt auch für `bm`-Spuren.
- **Stopp/Panik:** ■ lässt Stimmen mit der τ der App ausklingen, FX-Fahnen klingen aus; ■■ und Panik: alles inkl. Fahnen ≤ 50 ms still.
- **Offline-Render** (Video VV, Einfrieren FR1): Modul im OfflineAudioContext, vorher `bmReady(masken)` (Worker liefert alle benötigten Tabellen),
  `reset`, gleiche Nachrichten.

### 5.3 Undo, Bibliothek, Hilfe, Test-API
- Undo/Verlauf über `soundEdit(t, label, fn)` (Art `sound`), keine neue Undo-Art. `historyCheck()` = true. Kopieren/Einfügen/Duplizieren von Spur,
  Klang und Clip tragen `p.bm` mit.
- Bibliothek: Engine-Chip „`BM_NAME`“, Kategorien Bass · Lead · Pad · Keys · Blech/Streicher · Pluck/Glocke · Orgel/Chor · FX/Arp, Werk +
  Eigene, Tipp = laden (stumm), ▶ = hören (wie U-01). INIT-Liste mit den vier Varianten.
- Hilfe (U-07-Stil, mit `BM_NAME`): je eine Zeile für Masken, Bits/Karte, Masken-Hüllkurve, Spielweisen, Schicht/Split, Arp, Effekte, VERKNÜPFT.
- Test-API: `bmGet(t)`, `bmSet(t, pfad, wert)`, `bmRender(klang, ereignisse, opt)`, `bmScope(t)`, `bmInfo()` ({geladen, tabellen, poolFertig,
  speicher, fallbacks}), `bmMask(m)` ({spanne, aktiv, kmax, okt, schwerpunkt, rmsDb}), `bmVoices(t)`, `bmReady(masken)`, `perfProbe` mit Bit Mask.

---

## 6. Pakete

Zweige (Regel 29): **A** `bm-br-K` (Klang): BM1 → BM2 → BM3 · **B** `bm-br-U` (Oberfläche): BM6 (mit Platzhalter-Prozessor, der nur Maske 31 spielt,
gegen die Nachrichten aus §2.1) → BM5 · **C** `bm-br-P`: BM4 nach BM2, BM7 nach BM3 + BM5. Zusammenführung: BM1 + BM6 → BM2 → BM5 → BM3 → BM4 → BM7.
Schnittstelle (Nachrichten §2.1, Daten §5.1) ist hier festgelegt und ändert sich im Bau nicht. Jede Stufe mit Changelog, Snapshot,
„Bitte prüfen“-Liste (Regel 22) und offenen Fragen.

### BM1 — Masken-Kern und Tabellen
**Ziel.** Die Masken-Regel klingt exakt, sauber und sofort. **Umfang.** §1.2, §1.4 (ohne Hülle), §2.2–2.4: Worker, Spektrum, Mip-Kette, Ablage,
Bereit-Regel, Tabellen-Leser, Maskenwechsel an der Periodengrenze, DC-Sperre, Key-Reset, `bmMask`, `bmInfo`.
**Dauer** 8–10 h · **Budget** +16 KB.
- [ ] BM1-01 **Regel:** Alle 256 Masken, Tabellen-Spektren der vollen Stufe gegen `S/bm-tools/maskrule.mjs`: Fehlerenergie ≤ −70 dB.
- [ ] BM1-02 **Anker:** 31 THD ≤ −60 dB · 7: Teiltöne 2–8 ± 0,5 dB zur Referenz, Neigung −5,5 … −6,7 dB/Okt · 8: gerade Teiltöne 2–14 ≤ −60 dB,
  3. bei −9,5 ± 0,3 dB, untere Halbperiode (Grundton 55 Hz, vor der DC-Sperre) hat 8 steigende Rampen der Höhe 0,195 ± 0,02 · 16–31: gerade
  Teiltöne ≤ −60 dB · 24/25: 3. Teilton −9,7/−10,0 ± 0,3 dB · 30: k15 und k17 bei −24,1 ± 0,5 dB · 63/95/255: stärkster Teilton 2/4/7.
- [ ] BM1-03 **Schwerpunkt-Regel:** 16/16 Masken 16k−1 sind lokale Minima, Rang-Korrelation in den 16er-Blöcken 1–15 ≤ −0,95.
- [ ] BM1-04 **Periode:** jede der 256 Masken auf A4 → Periode 1/440 s (Autokorrelation), Teilton 1 bei 440 Hz ± 0,5 ct (wo vorhanden).
- [ ] BM1-05 **Faltung** (M-ALIAS): Masken 7, 8, 28, 56, 78, 120, 248, 255 auf C2, C5, C7, C8 bei 44,1 und 48 kHz ≤ −60 dB.
- [ ] BM1-06 **Stufen:** Gleiten C1 → C8 in 4 s, kein Pegelsprung > 0,5 dB an Stufengrenzen (M-EINBRUCH), M-KLICK ≤ 6 dB.
- [ ] BM1-07 **Maskenwechsel:** LFO-Fahrt 0 → 255 (0,5 Hz): jeder Wechsel genau an einer Periodengrenze (± 1 Sample); Fahrt 15 ↔ 31: M-KLICK ≤ 6 dB.
- [ ] BM1-08 **Key-Reset (K1):** erstes Sample einer freien Stimme |y| ≤ 0,02; 20 Noten mit O1 = O2 (gleiche Tonhöhe) → Pegel je Note ± 0,1 dB gleich.
- [ ] BM1-09 **DC-Sperre:** Maske 15 gehalten: Gleichanteil ≤ 0,005 nach 200 ms; −3 dB bei 8 Hz ± 10 %.
- [ ] BM1-10 **Bau:** je Maske ≤ 3 ms (Worker, Xeon, Median), Pool ≤ 1 s, Speicher ≤ 8,5 MB, zweite Spur +≤ 1 MB; Haupt-Faden: keine Aufgabe > 50 ms (PE1).
- [ ] BM1-11 **Bereit:** Klang laden → benötigte Masken ≤ 150 ms (Xeon); Noten davor gepuffert, keine verloren; `fallbacks` = 0 in allen Abnahmen.
- [ ] BM1-12 **Bitgleich:** zwei Offline-Render nach `reset` M-NULL = −∞ (44,1 und 48 kHz je für sich).
- [ ] BM1-13 **CPU:** zwei Masken-Osz. einer Stimme ≤ 0,45 % (Xeon); Leerlauf ≤ 0,1 %; kein GC-Ereignis in 60 s Node-Shim, Heap ± 1 MB.
- [ ] BM1-14 ASCII-Prüfung der Worklet- und Worker-Quelle; `grep -i -P 'kodamo|mask ?1(?![0-9])|essence'` = 0.
**Tests.** `bm1-node.mjs` (Node-Shim), `bm1-alias.mjs`, `bm1-worker.mjs` (Chromium).

### BM2 — Stimme, Hüllkurven, LFOs, Modulation, Spielweisen
**Ziel.** Der ganze Klangaufbau §1.3–1.11 sample-genau. **Umfang.** Rauschen, Filter, 4 ADSR + LOOP, 3 Δ, LFO1/2, V/MW/AT, Bend, Portamento, PANS,
RATE, Stimmungen, 10 Stimmen + Klau, 9 Spielweisen, Glättung, Schutz, Begrenzer. **Dauer** 12–15 h · **Budget** +24 KB.
- [ ] BM2-01 **Filter:** LP/HP 12 ± 1 dB/Okt, BP 6 ± 1 dB/Okt je Seite, NOTCH ≥ 30 dB tief bei RESO 0; fc nach §1.3 ± 5 % (CUTF 20/50/80); RESO 99 schwingt
  bei fc ± 3 %, Spitze ≤ −6 dBFS; TRK 100 %: fc/f0 über C2–C6 ± 2 % konstant; OSC1-SEMI +12 bei TRK 100 % → fc +1 Okt ± 2 %.
- [ ] BM2-02 **ADSR:** Attack linear (R² ≥ 0,99); Zeiten nach `T(x)` ± 10 % für x = 1/3/6/9/12/15; D/R −60 dB bei T ± 10 %; Sustain `(S/15)²` ± 0,2 dB;
  L `(L/99)²` ± 0,2 dB; LOOP: Periode T(A) + T(D) ± 10 %, Loslassen aus der Schleife ohne Sprung.
- [ ] BM2-03 **Δ:** Tonhöhe START +32, SPD 15 → Anfang +12,38 HT ± 2 %, nach 0,30 s ± 10 % unter 1 % Rest; END −32 beim Loslassen; Maske START +24, SPD 20 →
  erste Periode Maske MASK + 24, Ziel nach 0,11 s ± 10 %, nur ganze Masken.
- [ ] BM2-04 **Rauschen:** FREQ 99 flach ± 1 dB (Terzen 100 Hz – 16 kHz); FREQ 50: Halte-Rate ± 2 %, Spektral-Nullstellen bei Vielfachen der Rate.
- [ ] BM2-05 **LFO:** 8 Formen (Korrelation ≥ 0,99 zur Definition); Tempo ± 1 % bei SPD 0/50/99; zwei Stimmen sample-gleicher LFO-Wert; Phase läuft über Noten
  weiter; Phase 0 bei ▶; DLAY: Menge 0 bis T(DLAY); MW-Zug auf LFO-Menge beendet DLAY sofort; DCAY: −60 dB nach T(DCAY) ± 10 %; Neustart bei Phrasen-Beginn.
- [ ] BM2-06 **Ziele:** jede der 6 + 16 + 16 + 16 Kombinationen wirkt messbar (Liste der Messgrößen im Test); Mengen-Gesetz bei a = 25/50/99 auf FREQ (Cent),
  FILT (fc), MASK (Stufen) ± 2 %.
- [ ] BM2-07 **Spielweisen:** für alle 9 Modi geskriptete Folgen (staccato, legato, Nachbartöne ±1/±2/±3 HT, Akkord + Einzelton, alle los): Stimmenzahl,
  Hüllen-Neustart ja/nein (Pegel beim Einsatz), Gleiten ja/nein, gemeinsame ADSR bei PARA (alle Stimmen gleiche Kurve) laut Tabelle §1.11.
- [ ] BM2-08 **Stimmen:** 11. Note klaut die am längsten losgelassene, dann die älteste gehaltene; Klau-Blende ≤ 5 ms, M-KLICK ≤ 6 dB.
- [ ] BM2-09 **Portamento:** PORT 7 → 134 ms ± 10 %; POLY: jede Stimme gleitet von ihrer letzten Tonhöhe.
- [ ] BM2-10 **PANS/RATE:** PANS 15 → abwechselnd L/R (≥ 30 dB Kanalunterschied); RATE 15 → Zeiten je Oktave × 0,5 ± 5 %.
- [ ] BM2-11 **Stimmungen:** 6 Tabellen ± 0,5 ct je Taste, Grundton verschiebt; gleiche Stimmungen wie `MKW.SCL` ± 0,1 ct; BEND 2/12 ± 1 ct.
- [ ] BM2-12 **Glätten:** jeden stetigen Parameter in 1 s über den ganzen Weg auf einem klingenden Akkord: M-KLICK ≤ 6 dB, M-EINBRUCH ≤ 3 dB.
- [ ] BM2-13 **Robust:** 10 min Zufallsflug (RESO 99, alle Modi, extreme Mengen, 16tel-Noten): kein NaN/Inf, Gleichanteil ≤ 0,005, Spitze ≤ +12 dBFS vor dem Master-Limiter.
- [ ] BM2-14 **CPU:** eine Stimme ≤ 1,0 × VA-Stimme, 10 Stimmen ≤ 11 % (Xeon, M-CPU); Begrenzer-Stufe 1/2 → 6/4 Stimmen, klingende Stimmen unverändert
  (M-NULL ≤ −90 dB gegen ohne Last auf den verbleibenden Stimmen), Offline unberührt.
- [ ] BM2-15 **INIT (K1):** −18 ± 1 LUFS; keine Route; Tonhöhe 0 ± 0,1 ct.
**Tests.** `bm2-node.mjs`, `bm2-modes.mjs`, `bm2-click.mjs`.

### BM3 — Effekte FX1 / FX2
**Ziel.** 64 + 48 Typen nach §1.12, knackfrei. **Dauer** 6–8 h · **Budget** +14 KB (Hall-Code aus `dirigent-hall`).
- [ ] BM3-01 BAL 0 → trocken bitgleich (Weg umgangen); 50 → trocken −6,02 ± 0,1 dB; 100 → trocken ≤ −90 dB.
- [ ] BM3-02 CH1–14: Tempo und Tiefe ± 5 % (Tonhöhenschwankung eines Sinus); CH15/16: wandernde Kerben 200 Hz – 3 kHz, volle Wirkung bei BAL 100.
- [ ] BM3-03 DT1–16: Klirrfaktor steigt streng mit n; ungerade n gerade Obertöne ≤ −50 dB; gerade n 2. Oberton ≥ −30 dB; Pegeländerung ≤ ± 3 dB.
- [ ] BM3-04 BC1–16: Rate und Auflösung nach Tabelle (Spiegelbilder ± 2 %); BC9–16 Rate schwankt mit 0,3 Hz ± 5 %.
- [ ] BM3-05 RM1–16: Seitenbänder bei f ± f_n (± 1 %, n ≥ 8); RM1–4: Hüllkurven L/R 90° ± 5° versetzt.
- [ ] BM3-06 DL1–16: Zeit ± 1 ms (n ≥ 10: ± 0,05 ms); Abfall je Wiederholung nach Rückkopplung ± 0,3 dB; Kammspitzen bei Vielfachen von 1/t (n ≥ 11).
- [ ] BM3-07 RV1–16: RT60 ± 15 % der Tabelle.
- [ ] BM3-08 LFO → FX1-/FX2-Typ: Stufen innerhalb der Familie, jeder Wechsel 30-ms-Blende, M-KLICK ≤ 6 dB.
- [ ] BM3-09 ■■/Panik: Fahnen (DL16, RV1) ≤ −90 dBFS nach 50 ms; ■: Fahnen klingen aus.
- [ ] BM3-10 CPU nach Tabelle §2.6; FX schlafen bei Stille.
**Tests.** `bm3-fx.mjs`.

### BM4 — Schicht/Split und Arpeggiator
**Ziel.** §1.13 und §1.14. **Dauer** 5–7 h · **Budget** +8 KB.
- [ ] BM4-01 SCHICHT: jede Note klingt A und B; B-SEMI +12 → +1200 ± 0,5 ct; BAL 0/50/100 → nur A / gleich (± 0,2 dB) / nur B; PAN trennt A links, B rechts; TUNE ± 1 ct.
- [ ] BM4-02 SPLIT: Note < sp → A, ≥ sp → B; [Split ← nächste Note] setzt sp (ein Undo), die Note klingt dabei.
- [ ] BM4-03 FX in SCHICHT/SPLIT: Typen aus A; FX1-Anteil je Programm wirksam (zwei Instanzen); FX2 einmal (A).
- [ ] BM4-04 LFOs je Programm: A und B laufen mit eigenen Werten.
- [ ] BM4-05 Stimmen: SCHICHT braucht 2 je Note, die 6. Note klaut.
- [ ] BM4-06 **26 Muster:** Tasten E4, C4, G4 in dieser Reihenfolge → je Muster die Notenfolge der Referenztabelle im Test (z. B. 1OCT E C G E C G …, 2OCT E C G
  E5 C5 G5 …, PONG E C G C E …, MAJ von G4: G B D G …); RND reproduzierbar je Saat.
- [ ] BM4-07 TEILUNG 1/16 bei 120 BPM → 125 ms ± 1 Sample (offline); Transport aus: Raster ab der ersten Taste; Song-Swing wirkt.
- [ ] BM4-08 HOLD (Tipp beendet), TRIG aus = eine Stimme, nur die Tonhöhe springt (Hülle startet nicht neu); Arp nur auf A in SCHICHT/SPLIT.
- [ ] BM4-09 `sq-arp-src`: MK5-Suite unverändert grün, MS-2000-Arp-Renders bitgleich zum Stand vorher.
**Tests.** `bm4-layer.mjs`, `bm4-arp.mjs`, MK5-Regression.

### BM5 — Editor
**Ziel.** Jeder Parameter mit dem Finger, die Welle immer sichtbar, alle Formate. **Umfang.** §3. **Dauer** 10–12 h · **Budget** +36 KB (Block bei Bedarf).
- [ ] BM5-01 M-PLATZ in P1, P2, P3, L1, L2, W und 428×926 für jede Sektion, WELLE/HÜLLE, Karte, alle Listen: nichts abgeschnitten, jede Trefferfläche ≥ 44 × 44,
  kein waagrechtes Scrollen, Blatthöhe vor/nach jedem Umschalten gleich (± 0 px).
- [ ] BM5-02 Alle ≈ 75 Bedienelemente: Ziehen ändert, Anzeige in Geräte-Schreibweise + Einheit (Grenzen und Mitte je Parameter geprüft), Doppeltipp = INIT,
  Fein-Modus, Mittelraste bei den zweipoligen.
- [ ] BM5-03 Bit-Schalter: jeder Tipp = genau das Bit (256 Masken erreichbar), ein Undo; Karte: Zug + Lupe wählt die Maske unter dem Finger, Stepper ZEILE/SPALTE,
  Δ-Pfeil bei START ≠ 0; Wischen auf der Karte wählt nicht vor dem Loslassen.
- [ ] BM5-04 Oszilloskop zeigt die Tabelle der aktuellen Maske (Formvergleich ≥ 0,99); Zeichnen ≤ 2 ms je Bild, ≤ 30/s, Stopp bei geschlossenem Editor.
- [ ] BM5-05 Sektionen: Wischen/‹ › in Signalfluss-Reihenfolge, Liste per Finger; [A │ B] bei SCHICHT/SPLIT, FX-Typen bei B grau mit Grund.
- [ ] BM5-06 VERKNÜPFT: eine Geste ändert alle verknüpften Hüllen, ein Undo; endet mit dem Schließen.
- [ ] BM5-07 A/B, „geändert“-Punkt sofort (Regel 7); jede Geste ein Undo; Init ▸ vier Varianten je ein Undo.
- [ ] BM5-08 Editor öffnen: keine Aufgabe > 50 ms (Chromium Performance), Anspielen ≤ 30 ms nach Loslassen; PE1 mit offenem Editor 59+ fps.
- [ ] BM5-09 Marke: `grep -i -P 'kodamo|mask ?1(?![0-9])|essence'` in DOM, Hilfe, CSS = 0; Austausch von `BM_NAME` im Test → alle Anzeigen folgen.
- [ ] BM5-10 Bilder für Xander (alle Formate, OSC1, Karte, FILTER, LAYER) in `bm5-shots/`.
**Tests.** `bm5-ui.mjs` (P/L, CDP-Touch), `bm5-shots.mjs`.

### BM6 — Einbindung
**Ziel.** Neue Engine je Synth-Spur, ohne Risiko für Bestehendes. **Umfang.** §5. **Dauer** 7–9 h · **Budget** +10 KB.
- [ ] BM6-01 **Regel 28:** Demo-Projekt, alle Werks-Klänge, die Snapshot-Projekte in `synq-snapshots/` gegen den Vorgänger-Stand offline **bitgleich**;
  `dirigent-analog` byte-gleich; ohne Bit-Mask-Klang kein `addModule('synq-bm')`, kein Worker; Startzeit ± 5 %; Seitengröße +≤ 25 KB (Rest bei Bedarf).
- [ ] BM6-02 Engine-Wahl: Knopf/Chip in allen Formaten (Treffer ≥ 44, Namensfeld ≥ 72 px), VA → Bit Mask → VA: VA-Felder deep-equal, `p.bm` gemerkt, je ein Undo;
  Wechsel auf klingender Spur M-KLICK ≤ 6 dB, gehaltene Tasten klingen weiter.
- [ ] BM6-03 `normBm`: 1000 Zufalls-Programme geklemmt, Kennungen gültig, unbekannte Schlüssel erhalten; Speichern → Laden deep-equal; Kopieren/Einfügen/Duplizieren deep-equal.
- [ ] BM6-04 Zeit: 16tel-Muster offline auf ± 1 Sample am Soll; live mit Vorlauf `late` = 0 über 32 Takte; FANG, ●, MELODIE, „Eine Skala“, ⇅ wie bei VA.
- [ ] BM6-05 Stopp/Panik nach §5.2; Mute/Solo der Spur wie bisher.
- [ ] BM6-06 Offline = live: Video-Render (VV) 8 Takte zweimal bitgleich, gegen Echtzeit-Mitschnitt Korrelation ≥ 0,99.
- [ ] BM6-07 Ohne Worklet: `?engine=native` mit Bit-Mask-Spur → hörbar (RMS > −40 dBFS), Hinweis sichtbar, keine Konsolenfehler, DoD 10/10.
- [ ] BM6-08 Ältere Version (Vorgänger-Snapshot) öffnet ein Bit-Mask-Projekt: gesperrt mit Leiste, Klang unverändert, zurück auf die neue Version deep-equal.
- [ ] BM6-09 Bibliothek: Sichern, Laden, Engine-Chip, Kategorien, Werk schreibgeschützt; Neuladen behält eigene Klänge.
- [ ] BM6-10 Mod-Übersicht (K1): Jede Route aus §1.9 erscheint genau einmal, [✕] wirkt hörbar mit Undo; INIT zeigt keine Route.
- [ ] BM6-11 `perfProbe` enthält die Bit-Mask-Probe (10 Stimmen + FX); JSON-Felder vollständig.
- [ ] BM6-12 Kein Supabase-Aufruf; Hilfe-Zeilen da; Regression: Smoke, DoD (Worklet und nativ), MS-2000-Kern-Suiten, North (falls gebaut), K1-Suite.
**Tests.** `bm6-int.mjs`, `bm6-golden.mjs`, `bm6-store.mjs`.

### BM7 — Startklänge
**Ziel.** 40 eigene Programme + 4 INIT, jeder mit hörbarem Charakter. **Dauer** 5–7 h · **Budget** +9 KB.
- [ ] BM7-01 40 Programme, 8 Kategorien (6/5/6/5/4/5/4/5), 4 INIT-Varianten; keine Namensgleichheit und keine Übersetzung eines Namens aus der Werksliste des Geräts, keine Künstlernamen (Prüfliste).
- [ ] BM7-02 **Charakter** (Offline 48 kHz, v 0,8/1,0): Bass Grundton 40–130 Hz bei C2, Schwerpunkt < 1,5 kHz; Lead Mono-Modi, Vibrato erst nach DLAY;
  Pad Attack ≥ 300 ms, Release ≥ 600 ms; Keys/Pluck Abfall auf −20 dB in 0,3–3 s; Glocke ≥ 2 Teiltöne oberhalb k 7 innerhalb −30 dB; Orgel Sustain = voll;
  FX/Arp: Arp-Programme spielen ihr Muster, Sturz-Ton Bend ≥ 36 HT, Rhythmus-Maske bei C1 ≥ 4 Pegel-Einbrüche je Periode.
- [ ] BM7-03 Pegel: Kategorie-Mittel −18 ± 3 LUFS, Spitzen ≤ −1 dBFS; kein NaN, Gleichanteil ≤ 0,005.
- [ ] BM7-04 CPU je Programm (4-Ton-Akkord) ≤ 6 % Xeon; `fallbacks` = 0 beim Laden.
- [ ] BM7-05 Hörprobe für Xander: 44 WAV (je C-Dur-Phrase oder Akkord) als ZIP in der „Bitte prüfen“-Liste.
**Tests.** `bm7-prog.mjs`.

---

## 7. Dauer, Größe, Reihenfolge

| Paket | Inhalt | Dauer | Budget |
|---|---|---|---|
| BM1 | Masken-Kern, Worker-Tabellen, Leser | 8–10 h | +16 KB |
| BM2 | Stimme, Filter, Hüllkurven, LFOs, Modulation, 9 Spielweisen | 12–15 h | +24 KB |
| BM3 | FX1 (64) / FX2 (48) | 6–8 h | +14 KB |
| BM4 | Schicht/Split, Arp (26 Muster, gemeinsamer `ARPC`) | 5–7 h | +8 KB |
| BM5 | Editor (Sektionen, Karte, Bits, Oszilloskop, 7 Formate) | 10–12 h | +36 KB |
| BM6 | Einbindung, Format 5, Bibliothek, K1, Regel-28-Golden, nativer Rückfall | 7–9 h | +10 KB |
| BM7 | 40 Startklänge + 4 INIT | 5–7 h | +9 KB |
| **Summe** | + ≈ 3 h Zusammenführen und Fach-Prüfung | **≈ 60 h (56–71 h)** | **≈ +117 KB**, davon ≈ 95 KB nur bei Bedarf geladen |

Mit drei Helfer-Sitzungen (Zweige A, B, C) ≈ 25–30 h Kalenderzeit. Reihenfolge der Freigaben: BM1 + BM6 (hörbar mit INIT) → BM2 → BM5 → BM3 → BM4 → BM7.

---

## 8. Fragen an Xander

- **F0 Name — erledigt [X]:** „Bit Mask“ (`BM_NAME`).
- **F1 Aussehen.** Geplant ist der App-Stil: Sektionen in Signalfluss-Reihenfolge durchblättern (wie beim MS 2000), Beschriftung wie am Gerät, dazu die
  **Masken-Karte 16 × 16** und **8 Bit-Schalter**. Oder soll es aussehen wie das Gerät (Tastenreihen, 4-stellige rote Anzeige, ein Drehrad)? Das Gerät hat
  kaum Regler; das Nachbilden wäre am iPhone mühsamer.
- **F2 Beschriftung.** Englisch wie am Gerät (MASK, CUTF, DLAY …) mit deutscher Erklärzeile, wie beim MS 2000? (So geplant.)
- **F3 Druck (Aftertouch).** Das iPhone kennt keinen Druck. Vorschlag: Finger auf der gehaltenen Taste nach oben schieben = Druck. Gewünscht, oder weglassen?
  Die Druck-Ziele bleiben dann nur einstellbar und wirken später mit MIDI.
- **F4 Lautstärke der Masken.** Laut der Regel sind manche Masken bis zu 26 dB leiser als der Sinus. Geplant ist **roh** wie am Gerät. Oder soll die App jede
  Maske auf ähnliche Lautheit bringen? (Dann klingen Masken-Fahrten gleichmäßiger, aber anders als am Gerät.)
- **F5 Oktav-Hinweis.** Manche Masken klingen eine bis drei Oktaven höher. Geplant ist nur der Hinweis „≈ +1 Okt“. Soll die App das automatisch über SEMI ausgleichen?
- **F6 Sauber oder roh.** Wir rechnen ohne Spiegelfrequenzen und mit glatten Hüllkurven. Das Gerät hat etwas digitale Körnung (Überabtastung statt exakter
  Tabellen, „körnige“ Hüllkurven). Soll es einen Schalter **ROH** geben, der das nachahmt?
- **F7 Echo-Zeiten.** DL1–DL16 haben feste Zeiten wie am Gerät (geplant). Oder sollen sie dem Song-Tempo folgen?
- **F8 Mod-Ziele.** Am Gerät hat jede Quelle (Anschlag, Rad, Druck, LFO) genau **ein** Ziel (geplant). Sollen es zwei sein?
- **F9 Räder und Pedal.** Der Geräte-Looper nimmt Bend, Rad, Druck und Pedal mit auf; die App nimmt bisher nur Noten auf. Sollen Bit-Mask-Spuren
  Räder/Druck in Clips aufnehmen? Und braucht die Tastatur eine Taste **HALTEN** (Pedal)?
- **F10 Anzahl Masken.** Das Handbuch nennt 256, neuere Geräte haben laut Hersteller 512 (ein Bit mehr, noch längere Stille-Muster). Geplant 0–255. Auf 0–511 erweitern?

---

## Anhang M — Neue Messverfahren (ergänzen §0.3 der Spec und Anhang M von Nachtrag 6)
| Kürzel | Name | Definition |
|---|---|---|
| **M-SPEKTRUM** | Teiltöne | Render auf exakt ganzzahlige Periodenlänge (z. B. 48 kHz, f0 = 46,875 Hz → 1024 Samples), 64 Perioden, FFT rechteckig; Teilton k = Bin 64·k; Pegel in dB re Teilton 1 |
| **M-ALIAS** | Faltung | wie M-SPEKTRUM bei der Prüf-Note; Energie aller Bins, die nicht auf Vielfachen von f0 liegen, re Gesamtenergie |
| **M-PERIODE** | Periode | Autokorrelation über 1 s, erste Spitze ≥ 0,9 nach Verschiebung 0, mit parabolischer Interpolation |
| **M-SCHWERPUNKT** | Klangschwerpunkt | Σ k·a_k² / Σ a_k² über k = 1 … 256 aus M-SPEKTRUM (bzw. aus der Referenz `maskrule.mjs`) |
Vorhandene Verfahren (M-T60, M-CENT, M-NULL, M-PEGEL, M-SP, M-KLICK, M-EINBRUCH, M-ZEIT, M-LUFS, M-CPU, M-PLATZ) gelten unverändert.

## Anhang Q — Rechenhilfen (eigene Rechnungen, keine Handbuch-Inhalte)
- `S/bm-tools/maskrule.mjs`: Masken-Regel §1.2 als genaue Fourier-Reihe; `node maskrule.mjs anchors` (Anker-Tabelle §1.2), `cent` (Schwerpunkt-Regel,
  Lautheit), `stats` (schreibt die Kennwerte).
- `S/bm-tools/fastbuild.mjs`: schneller Tabellenbau (flächengemittelt + FFT), gemessen ≈ 2 ms je Maske bei −80 dB (N = 32 768).
- `S/bm-tools/mask-stats.json`: alle 256 Masken mit Spanne, klingendem Anteil, stärkstem Teilton, Oktav-Hinweis, Schwerpunkt, RMS (dB re Sinus), Gleichanteil.
  Quelle für Karte (Farbe) und Oktav-Hinweis; der Bau rechnet sie im Worker neu und vergleicht (BM1-01).
- Seitenbilder des Handbuchs unter `S/mask1-render/` sind privat und werden nicht weitergegeben.

> **Entscheidung Xander 31.10.:** Anzeigename der Engine = **„Bit Mask“** (`BM_NAME`). Frage F0 ist damit beantwortet.
