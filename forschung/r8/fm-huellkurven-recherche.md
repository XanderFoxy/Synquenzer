# R8 – FM-Hüllkurven: Stand der Technik (DX7, FM-X, Moderne) und was SYNQUENZER daraus lernen muss

Stand 2026-10-17. Anlass: Xanders Beschwerde „FM-Hüllkurven – Katastrophe“ (`fragen-xander-9.md`, Z. 14–18) und I1 (`fragen-xander-6.md`, Z. 10–11). Bezug: Nachtrag 1, A.4 (V0d FM-Sofort).

**Kennzeichnung:**
- **BELEGT** – Primärquelle gelesen (Quelltext mit Zeile, Herstellerdoku, Rechnung aus dem Quelltext). Nur über einen Suchauszug gesehen: „BELEGT (Suchauszug)“.
- **WAHRSCHEINLICH** – Sekundärquelle (Forum, Tutorial) oder eigene Folgerung aus Belegtem.
- **UNBELEGT** – Erinnerung oder Vermutung; vor Verwendung prüfen.

**Zugriffslage.** Im Netz dieser Sitzung waren nur GitHub (raw und `git clone`) und die Websuche erreichbar. yamahasynth.com, manual.yamaha.com, data.yamaha.com, korg.com, elektron.se, soundonsound.com und homepages.abdn.ac.uk (DX7-Handbuch) lieferten DNS-Fehler oder Proxy-403. Alle Yamaha-, Korg- und Elektron-Angaben stammen deshalb aus Suchauszügen. Die DX7-Kernfakten sind dagegen aus Quelltext belegt: msfa (Raph Levien, Google; die Engine von Dexed), Dexed (Commit `fea2f0f`, 14.10.2026) und das msfa-Wiki (Messungen am echten DX7).

**Lokale Kopien:**
- `r8/src/msfa_*.cc|h`, `r8/src/msfa_wiki_*.wiki`, `r8/src/dexed-repo/`
- Rechnungen: `r8/calc/*.mjs` → `.out`
- App-Kopie: `r8/V0a-copy.html`

---

## 0. Kurzfassung (für Xander und den V0d-Bauer)

1. **Die Klang-Engine schneidet nicht ab. Das Problem liegt in der Bedienung.** Gemessen im Worklet der V0a-Kopie (`r8/calc/snap-hf.mjs`/`.out` und `mod-eg-check.out`): Der Träger klingt bei 300 ms unabhängig von der Modulator-Hüllkurve gleich laut (−10,8 dBFS, Spannweite 0,4 dB über 14 Varianten). Nur die Obertöne fallen. **BELEGT** (eigene Messung).
2. **Das „Schnapp“-Fenster ist schmal.**
   - Mit Modulator-R2 60–72 (OL 88, L2 74, C2) fällt der Obertonanteil oberhalb 300 Hz in 20–40 ms um 20 dB. Das ist der DX-Bass-Snap.
   - Ab R2 ≥ 75 dauert der Abfall ≤ 10 ms. Das klingt wie ein Klick, also „abgeschnitten“; das passt zu Xanders Wort.
   - Bei R2 ≤ 50 dauert er ≥ 70 ms und klingt wie ein Wah.
   - Auf der Lane der App (1 ms … 40 s logarithmisch, also 15,3 Verdopplungen auf ≈ 78 px Lane-Breite bei angenommen 360 px Feldbreite, `lw = (W−16)/4,4` aus `fmEnvPts` Z. 14009) liegt das Fenster 15–60 ms auf nur **≈ 10 px**. Dazu kommt die Achsensperre: Pegel **oder** Zeit je Geste.
   - Die DX-Logik koppelt die Zeit an den Pegelabstand: Ein Pegelzug verschiebt den Punkt waagrecht.
   - Diese drei Effekte erklären „hängt in irgendeinem Raster“ und „sperrig“. **WAHRSCHEINLICH** (aus Code und Messung gefolgert, nicht mit Xander verifiziert).
3. **„Werte extrem hochdrehen“ ist DX-authentisch.**
   - Der Modulationsindex wächst exponentiell mit OL: OL 50 ≈ 0,18 rad, OL 70 ≈ 1,0 rad, OL 85 ≈ 3,7 rad, OL 99 = 4π ≈ 12,6 rad.
   - Hörbare FM gibt es auf DX7 und FM-X ab OL ≈ 60 (Mark Phillips: „settings from 60–99 will give audible results“).
   - Die App rechnet genauso (msfa). Was fehlt, ist eine Fader-Kurve, die diesen Bereich spreizt. Die bringt A.4 Punkt 3. **BELEGT** (Rechnung aus msfa) bzw. **WAHRSCHEINLICH** (Zitat über Suchauszug).
4. **Die App kennt keine Pitch-Hüllkurve.** Beim .syx-Import wird sie verworfen (V0a Z. 15041: „The pitch EG is ignored“). DX7 (PEG, ±4 Okt.) und FM-X (Part-PEG plus eine PEG je Operator) haben sie. **BELEGT**.
5. **FM-X arbeitet mit Zeiten (Time), der DX7 mit Raten (Rate).**
   - Beim DX7 hängt die Dauer einer Stufe von Rate **und** Pegelabstand ab.
   - FM-X bietet zusätzlich Hold Time, also eine Einsatzverzögerung je Operator.
   - Für ein Touch-Gerät ist „Zeit in ms“ die richtige Anzeige. Die DX-Raten bleiben Datenformat (.syx). **WAHRSCHEINLICH** (Forum und Yamaha-Tutorial über Suchauszug).
6. **Nicht-DX-genau in der App** (klein, aber hörbar):
   - (a) Gleiche aufeinanderfolgende Pegel ergeben in der App 0 s. Dexed bildet die echte DX7-„Haltezeit“ nach (`ACCURATE_ENVELOPE`).
   - (b) Das Zeitraster von msfa gilt für 44,1 kHz; der DX7 läuft mit 49 096 Hz. Die App ist dadurch etwa 10 % langsamer als die Hardware, genau wie msfa und Dexed.
   - (c) Init-Operator R4 = 99: Loslassen schneidet hart ab (1,4 ms).

---

## 1. DX7-Operator-Hüllkurve (EG) – exakt

### 1.1 Aufbau
- Je Operator 4 Raten R1–R4 und 4 Pegel L1–L4, je 0–99. Dazu Output Level (OL, 0–99), Keyboard Rate Scaling (0–7), Key Velocity Sensitivity (0–7) und Level Scaling (Breakpoint, Tiefe L/R 0–99, Kurven −LIN/−EXP/+EXP/+LIN). **BELEGT**: Dexed `doc/sysex-format.txt` Z. 124–140 (Kurven-Codierung Z. 135: „0=-LIN, -EXP, +EXP, +LIN“).
- Ablauf: Taste → Stufe 1 (Ziel L1), Stufe 2 (L2), Stufe 3 (L3). L3 wird gehalten, solange die Taste gedrückt ist. Loslassen → Stufe 4 (L4).
- Jede Stufe steigt oder fällt, je nachdem ob ihr Ziel über oder unter dem aktuellen Pegel liegt. Pegel dürfen in beliebiger Reihenfolge stehen (z. B. L1 < L2: „Schwell“-Modulator).
- **BELEGT**: msfa `env.cc` Z. 34–64 (`getsample`, `keydown`), Z. 83–92 (`advance`: `rising_ = targetlevel_ > level_`).
- msfa startet jede Note bei Pegel 0 (`env.cc` Z. 29). Das msfa-Wiki beschreibt die Hardware anders: „Typically, the envelope starts out at L4 and increases to L1“ (`Dx7Envelope.wiki` Z. 19). **BELEGT**.

### 1.2 Pegel → dB (0,75 dB je Schritt)
- Interne Einheit: 1/256 Verdopplung = 20·log10(2)/256 ≈ **0,0235 dB**. Die Hardware hat einen 12-Bit-Hüllkurvenwert als Q8-log2-Verstärkung, also ≈ 96 dB Dynamik. **BELEGT**: `Dx7Hardware.wiki` Z. 13–17, `Dx7Envelope.wiki` Z. 34–35.
- Pegel L: `scaleoutlevel(L) >> 1` mal 64 Einheiten. Oberhalb 20 ergibt `(28+L)>>1` 1,5 dB je 2 Schritte, also **im Mittel 0,75 dB je L-Schritt** in 1,5-dB-Stufen. Unter 20 gilt die Tabelle `[0,5,9,13,17,20,23,25,27,29,31,33,35,37,39,41,42,43,45,46]`, dort fällt der Pegel steiler. **BELEGT**: msfa `env.cc` Z. 75–81, 86–89; Wiki Z. 21–32.
- Output Level OL: 32 Einheiten je Schritt = **0,7526 dB je OL-Schritt** (volle Auflösung). **BELEGT**: Wiki Z. 50; `dx7note.cc` Z. 141 und 154.
- Gesamtpegel = 64·L′ + 32·OL′ − 4256, untere Grenze 16. Das msfa-Wiki misst den Boden bei 3824 Schritten unter Vollpegel (14,94 Verdopplungen). **BELEGT**: `env.cc` Z. 88–89; Wiki Z. 37–38.

Gerechnet aus msfa (`r8/calc/eg-table.mjs` → `eg-table-49096.out`). **BELEGT** (Rechnung):

| Wert | 99 | 90 | 80 | 70 | 60 | 50 | 40 | 30 | 20 | 10 | 0 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| L (bei OL 99), dB | 0 | −6,0 | −13,5 | −21,1 | −28,6 | −36,1 | −43,6 | −51,2 | −58,7 | −72,2 | −89,9 |
| OL, dB | 0 | −6,8 | −14,3 | −21,8 | −29,4 | −36,9 | −44,4 | −51,9 | −59,5 | −72,2 | −95,6 |

### 1.3 Rate → Zeit; Abklingen linear in dB
- `qrate = (R·41) >> 6` (0–63), plus Rate-Skalierung, höchstens 63. Inkrement je Sample: (4 + (q & 3))·2^(q>>2)/4096 Einheiten. **BELEGT**: `env.cc` Z. 95–98; Wiki Z. 40–42 („0.2819·2^(qrate/4)·(1+0.25·(qrate mod 4)) dB/s“).
- **Abklingen** = konstante dB/s, also exponentiell in der Amplitude. **BELEGT**: `env.cc` Z. 47–52; Wiki Z. 15 und 40.
- **Dauer = Pegelabstand ÷ Rate.** Eine DX-Rate ist keine Zeit. Dieselbe R2 braucht von L1 99 auf L2 0 etwa 11-mal so lange wie auf L2 90. **BELEGT** (folgt aus `env.cc` Z. 47–52). Dexed-Ausnahme siehe 1.6.
- Beim DX7 schnell = 99, langsam = 0. Bei FM-X ist es umgekehrt (Time: groß = lang). **WAHRSCHEINLICH**: Forum „MODX vs. DX7 envelopes“, yamahasynth.com (Suchauszug).

Zeiten bei 49 096 Hz (DX7-Takt, `Dx7Hardware.wiki` Z. 9). msfa und SYNQUENZER laufen mit dem 44,1-kHz-Raster, dort sind alle Zeiten ×1,113. **BELEGT** (Rechnung):

| R | qrate | dB/s | Abfall 99→0 (OL 99) | −20 dB | Anstieg 0→99 |
|---|---|---|---|---|---|
| 0 | 0 | 1,1 | 79,8 s | 17,7 s | 7,8 s |
| 20 | 12 | 9 | 10,0 s | 2,2 s | 0,97 s |
| 30 | 19 | 32 | 2,85 s | 634 ms | 278 ms |
| 40 | 25 | 90 | 997 ms | 222 ms | 97 ms |
| 50 | 32 | 289 | 312 ms | 69 ms | 30 ms |
| 55 | 35 | 505 | 178 ms | 40 ms | 17 ms |
| 60 | 38 | 866 | 104 ms | 23 ms | 10 ms |
| 65 | 41 | 1443 | 62 ms | 14 ms | 6,1 ms |
| 70 | 44 | 2309 | 39 ms | 8,7 ms | 3,8 ms |
| 72 | 46 | 3464 | 26 ms | 5,8 ms | 2,5 ms |
| 75 | 48 | 4619 | 19,5 ms | 4,3 ms | 1,9 ms |
| 80 | 51 | 8083 | 11 ms | 2,5 ms | 1,1 ms |
| 90 | 57 | 23093 | 3,9 ms | 0,9 ms | 0,4 ms |
| 99 | 63 | 64660 | 1,4 ms | 0,3 ms | 0,14 ms |

Folgerung: Der musikalisch wichtige Bereich „Snap bis Pluck“ (5–100 ms für −20 dB) liegt zwischen R ≈ 45 und R ≈ 75, also auf etwa 30 % der Rate-Skala. Der Bereich ab 80 ist praktisch „sofort“. **WAHRSCHEINLICH** (Folgerung).

### 1.4 Anstieg: Sprung plus Annäherung im log-Bereich
- Steigt eine Stufe, springt der Pegel zuerst auf **1716** Einheiten. Das liegt ≈ 40 dB über dem Boden bzw. ≈ 50 dB unter Vollpegel (OL 99/L 99). Das Wiki: „level _immediately_ rises to 39.98 dB (1700 steps) above the minimum level, which helps create a crisper attack“. **BELEGT**: msfa `env.cc` Z. 37–40; Dexed `env.cc` Z. 84–87; Wiki Z. 44.
- Danach gilt `level += (17 − floor(level/256)) · inc`. Das ist eine Annäherung im log-Bereich an ein virtuelles Ziel 17 Verdopplungen hoch: unten schnell, oben langsamer. Das ergibt eine Form „approximating linear“ (Chowning). **BELEGT**: `env.cc` Z. 41; Dexed `env.cc` Z. 88; Wiki Z. 15 und 44.
- Darum klingen DX-Attacks mit R1 ≥ 90 knackig, ohne zu klicken: Der Sprung überspringt die leisen 40 dB. **WAHRSCHEINLICH** (Folgerung).

### 1.5 Rate-Skalierung und Anschlag
- **Rate Scaling (0–7):** `x = min(31, max(0, Note/3 − 7))`, `Δqrate = (RS·x) >> 3`. **BELEGT**: `dx7note.cc` Z. 81–93. Faktoren gerechnet (`vel-rs.out`): Bei RS 7 ist E1 ×1,19, C2 ×2, C4 ×6,7, C7 ×38 schneller. Bei RS 2 bleibt C2 bei ×1,19. Tiefe Bässe werden von der Rate-Skalierung also kaum beschleunigt. **BELEGT** (Rechnung).
- **Key Velocity Sensitivity (0–7)** wirkt auf den Ausgangspegel, nicht auf die Zeiten. Tabelle `velocity_data`, Formel `((KVS·(vd[vel>>1] − 239) + 7) >> 3) << 4`. **BELEGT**: `dx7note.cc` Z. 65–79, Z. 155.

| KVS | vel 1 | vel 32 | vel 64 | vel 100 | vel 127 |
|---|---|---|---|---|---|
| 3 | −33,5 dB | −10,2 | −4,5 | +0,4 | +2,3 |
| 5 | −56,1 | −16,9 | −7,5 | +0,4 | +3,8 |
| 7 | −78,6 | −23,7 | −10,5 | +0,4 | +5,3 |

- Bei einem Modulator verschiebt KVS also direkt den Index: −10,5 dB entsprechen OL −14, etwa Index 5,8 → 1,7 rad. Das ist der DX-Weg zu „härter anschlagen = heller“. **BELEGT** (Rechnung).
- Velocity 127 erzeugt mehr als Vollpegel. Das bestätigt das Wiki: „velocity values > 100 can cause amplitudes greater than full scale“ (Z. 38). **BELEGT**.

### 1.6 Haltezeit bei gleichen Pegeln (Dexed „ACCURATE_ENVELOPE“)
- Ist das Ziel einer Stufe gleich dem aktuellen Pegel, vergeht in msfa **keine** Zeit. Dexed misst und emuliert die DX7-Wartezeit: Tabelle `statics[]` mit Samples bei 44,1 kHz für R < 77, darüber `20·(99−R)`. Für einen Attack auf L1 = 0 gilt ÷20. **BELEGT**: Dexed `source/msfa/env.h` Z. 25 (`#define ACCURATE_ENVELOPE`), `env.cc` Z. 33–44 und 134–150 (Kommentar: „empirically gathered using 2 TF1s“).
- Beispiel: `statics[50]` = 6615 Samples ≈ 150 ms, `statics[70]` = 1234 ≈ 28 ms. Auf dem DX7 erzeugt man so ein Plateau, z. B. L1 = L2 = 99 mit R2 als „Hold“. **BELEGT** (Tabelle).
- SYNQUENZER folgt msfa (V0a `envPlan` Z. 7415 ff. und Worklet `fmEnvStep` ≈ Z. 3199 ff.). Gleiche Pegel ergeben 0 s; ein DX-Patch mit Plateau klingt kürzer. **BELEGT** (Code).

### 1.7 Ausgangspegel → Modulationsindex
- Verstärkung = `Exp2(level − 14·2^24)`. Volle Skala (L 99, OL 99, Pegel 3840) ergibt den Faktor 2. Die Phase hat 2^24 Einheiten je Umlauf. Damit ist der **Spitzenindex 2·2π = 4π ≈ 12,57 rad**. **BELEGT**: msfa `dx7note.cc` Z. 197; `fm_op_kernel.cc` (24-Bit-Phase, Maske `0x7fffff`, Z. 31 und 65–73); App V0a Z. 7538 (`modIndex`, gleiche Formel). Ein Forum nennt für den DX7 „max modulation index … 13 radians“. **WAHRSCHEINLICH** (Suchauszug, yamahasynth.com).
- Gerechnet (`eg-table-49096.out`). **BELEGT** (Rechnung):

| OL | 99 | 95 | 90 | 85 | 80 | 75 | 70 | 65 | 60 | 55 | 50 | 40 | 30 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Index (rad) | 12,57 | 8,89 | 5,76 | 3,74 | 2,42 | 1,57 | 1,02 | 0,66 | 0,43 | 0,28 | 0,18 | 0,08 | 0,03 |

- Jede 8 OL-Schritte (≈ 6 dB) halbieren den Index.
- Nach Carson (Bandbreite ≈ 2·(I+1)·f_m) haben bei ratio 1:1 etwa I + 1 Teiltöne Gewicht. Unter OL 55 bleibt die Bandbreite fast die eines Sinus.
- „Settings from 60–99 will give audible results“: Mark Phillips, *Basic FM Synthesis on the Yamaha DX7*. **WAHRSCHEINLICH** (Suchauszug).
- Der Index hängt also logarithmisch am Regler. Darum „passiert unten nichts“. Das ist DX-treu; die Bedienung muss es ausgleichen (A.4 Punkt 3: `OL = round(99·p^0,45)`).

### 1.8 Warum DX-Bässe „schnappen“
- Der Modulator startet per Sprung (1.4) praktisch sofort auf L1 = 99. Bei OL 85–95 sind das 3,7–8,9 rad, also ein sehr breites Spektrum.
- Dann fällt er **linear in dB**, z. B. mit R2 70 um 2300 dB/s. Der Index halbiert sich alle 6 dB, also alle ≈ 2,6 ms (DX-Takt).
- Die Bandbreite stürzt in wenigen Millisekunden von Dutzenden Teiltönen auf wenige. Der Träger mit eigener, langsamerer Hüllkurve klingt als Grundton weiter.
- Ergebnis: ein Knall aus Obertönen über einem stehenden Körper. **BELEGT** (Mechanik aus msfa) / **WAHRSCHEINLICH** (Hörbeschreibung).
- Eine analoge Filterhüllkurve wirkt ähnlich. Der Unterschied: Beim FM-Snap fallen die Obertöne mit dem **Index**, nicht mit einer festen Grenzfrequenz. Das ist der „glasige“ Biss. Das Keyboard-Magazin von 1985 vergleicht Modulator-OL mit dem Filter-Cutoff und die Modulator-EG mit der VCF-EG. **WAHRSCHEINLICH** (Suchauszug: scribd „DX7 programming“, Arturia DX7 V).
- Werks-Beleg, DX7 ROM1A (lokal `fmresearch/proto/rom1a.json`). **BELEGT** (Daten):
  - BASS 1 (Alg 16, FB 7): Modulatoren OP4 ×5 OL 93 R2 42 L2 30, OP6 ×9 OL 85 R2 56 L2 28 KVS 7, OP3 ×0,5 OL 99 R2 96. Rate-Skalierung 5–7 an allen Operatoren.
  - BASS 2 (Alg 17, FB 7): Modulator OP2 ×0,5 OL 80, R1 28 (!), L2 0; OP5 ×1 OL 75 R2 51.
  - Auch Yamaha baut den Biss also aus mehreren Modulatoren mit gestaffelten Raten. Rate-Skalierung und Anschlag sind dabei hoch.

---

## 2. DX7-Pitch-EG (PEG)
- 4 Raten und 4 Pegel, je 0–99, für alle Operatoren gemeinsam (Parameter 126–133). **BELEGT**: Dexed `doc/sysex-format.txt` Z. 148–155.
- **Pegel 50 = keine Verstimmung.** Tabelle `pitchtab` (100 Werte, −128 … +127 in 1/32 Oktave). Gerechnet in Halbtönen:

| Pegel | 0 | 10 | 20 | 30 | 40 | 45 | 49 | **50** | 51 | 55 | 60 | 70 | 80 | 85 | 90 | 95 | 99 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Halbtöne | −48 | −18,4 | −11,3 | −7,5 | −3,75 | −1,9 | −0,38 | **0** | +0,38 | +1,9 | +3,75 | +7,5 | +11,3 | +13,1 | +18,4 | +30,8 | +47,6 |

  Um die Mitte gilt 0,375 HT je Schritt; an den Rändern wird es grob, bis ±4 Oktaven. **BELEGT**: msfa `pitchenv.cc` Z. 35–43 und 85; Rechnung `eg-table-49096.out`.
- **Rate:** linear in Oktaven pro Sekunde (keine Annäherung, kein Sprung), `ratetab[R]/21,3` Okt./s: R 0 = 0,05, R 50 = 1,9, R 70 = 3,7, R 90 = 8,0, R 99 = 12 Okt./s. **BELEGT**: `pitchenv.cc` Z. 23, 26–33, 55–71.
- Start bei L4 (`level_ = pitchtab[l[3]]`), dann L1 → L2 → L3, Halten; Loslassen → L4. **BELEGT**: `pitchenv.cc` Z. 50, 74–78.
- Typischer Bass-Einsatz: L4 = L3 = L2 = 50, L1 = 52–56 (+0,75 … +2,25 HT) mit R1 99 und R2 70–85. Das ergibt einen kurzen Tonhöhen-„Blip“ am Anfang („Knack“), ähnlich dem Kick-Pitch. **UNBELEGT** (gängige Praxis; keine Quelle gefunden).
- SYNQUENZER V0a: keine PEG; beim Import verworfen (Z. 15041). **BELEGT**.

---

## 3. Yamaha Montage/MODX FM-X

Alle Angaben stammen aus Suchauszügen; die Herstellerseiten waren nicht abrufbar.

### 3.1 Operator-EG
- Je Operator: **Hold Time** sowie Attack, Decay 1, Decay 2 und Release als **Zeiten**. Pegel Attack, Decay 1, Decay 2 und Release (Hold), je 0–99. **BELEGT (Suchauszug)**: Yamaha „FM 101, Part Four“ (yamahasynth.com).
  - Ein Yamaha-Tutorial-Beispiel: „Times: Hold = 0; Attack = 58; Decay1 = 54; Decay2 = 50; Release = 44; Levels: Attack = 99; Decay1 = 0; …“ („Mastering MONTAGE: An FM-X Exploration Part 2“).
- **Hold Time** verzögert den Beginn jeder EG-Aktivität nach Note-On, wirkt also als **Key-On-Delay je Operator**. Der Höchstwert 99 entspricht etwa anderthalb Minuten. **BELEGT (Suchauszug)**: FM 101 Part Four.
- **Release Level > 0** ist erlaubt, der Klang läuft dann nach dem Loslassen weiter („Release/Hold Level“). Anders als beim DX7 beginnt die FM-X-EG dennoch immer bei 0 („the EG assumes an initial starting level of 0“). **BELEGT (Suchauszug)**: FM 101 Part Four.
- **Time statt Rate:** Ein hoher Wert bedeutet lang. Ein DX7-Rate-Wert von 82 wirkt am MODX als langer Attack. Der FM-Konverter trifft DX-Zeiten nicht immer. **WAHRSCHEINLICH**: Forum „MODX vs. DX7 envelopes“.
- **Level/Vel −7 … +7:** Bei positiven Werten wird der Operator mit härterem Anschlag lauter, bei negativen leiser. Die Richtung wird in einem Yamaha-Artikel widersprüchlich beschrieben. **BELEGT (Suchauszug)**: MONTAGE M Operation Manual (JA), Operator Edit.
  - Ein **negativer Anschlagwert** ist ein Unterschied zum DX7 (KVS nur 0–7, 1.5) und ein Kandidat für Xanders „±“.
- **Time/Key** (AEG Time Key Follow, 0–7): Die Hüllkurve wird zur Höhe hin schneller. Laut Manny Fernandez ändert sich nur die Attack-Zeit, nicht Hold. **BELEGT (Suchauszug)**: Montage-M-Handbuch; „Manny's FM-Xpert #4“.
- **Level Scaling** (Breakpoint, Low/High Depth, Kurven ±LIN/±EXP wie beim DX7): **UNBELEGT** für FM-X; sehr wahrscheinlich DX-kompatibel, weil der FM-X-Konverter DX7-Patches übernimmt.

### 3.2 Pitch-EG
- **Je Operator eine Pitch-EG** (Attack Time, Decay Time, Initial Level, Attack Level). Beide Pegel reichen von −50 bis +50; Decay führt zurück auf 0. **BELEGT (Suchauszug)**: manual.yamaha.com, MONTAGE M, `om02screenparameters0150` (Part Edit FM-X → Operator Edit).
  - Manny Fernandez nennt die Operator-PEG das zeitaufwendigste Feintuning seines FM-X-Klaviers. **WAHRSCHEINLICH**: „Manny's FM-Xpert“.
- **Part-PEG** (gemeinsam, wie beim DX7) mit Depth: Im MODX ergeben Level +127 und Depth +16 etwa +12 HT. **WAHRSCHEINLICH**: Forum yamahamusicians.com „MODX Pitch EG – very confusing!“. PEG-Zeiten 0–99, PEG Time Key Follow 0–7 **BELEGT (Suchauszug)**: Montage-M-Handbuch `om02screenparameters0140`.

### 3.3 Amp-EG und Operator-EG
- Bei FM-X **ist die Operator-EG die Lautstärke- bzw. Klangfarben-Hüllkurve**. Part-Werte sind nur Offsets: „Any performance-level or part-level are only offsets to the operator settings“. **WAHRSCHEINLICH**: Synth-Forum, Verweis auf MODX RM S. 149/157.
- „FM Attack“ in den Schnell-Einstellungen verschiebt Modulatoren **und** Träger. Über die Control-Matrix lässt sich „Op AEG Offset“ gezielt auf ausgewählte Operatoren legen, z. B. nur auf die Träger. **WAHRSCHEINLICH**: Forum.
- Montage M bringt „7 offset parameters on the part level“ für FM-X. **WAHRSCHEINLICH**: yamahamusicians.com.
- SYNQUENZER hat Entsprechendes: `fmAtk`/`fmDec`/`fmRel` als Raten-Offsets auf R1, R2/R3 und R4 aller Operatoren (V0a Z. 3189–3197) sowie `fmAmp` (DX-Pegel oder ADSR als Lautstärke). **BELEGT** (Code). Ein Offset „nur Modulatoren / nur Träger“ fehlt.

### 3.4 Was „±-Hüllkurven“ bedeuten kann (Deutung, mit Xander klären)
| Lesart | DX7 | FM-X | SYNQUENZER V0a |
|---|---|---|---|
| a) Pitch-EG mit ± um die Mitte | PEG, L 50 = 0, ±4 Okt. (BELEGT) | ±50 je Operator, ± Part-PEG (BELEGT Suchauszug) | **fehlt** |
| b) Hüllkurve, die steigt **und** fällt (L1 < L2, Schwellen) | ja (BELEGT, 1.1) | ja (WAHRSCHEINLICH) | ja (BELEGT, `envPlan`) |
| c) Negative Anschlagdynamik (leiser = heller) | nein (KVS 0–7) | Level/Vel −7…+7 (BELEGT Suchauszug) | nein (`vs` 0–7) |
| d) Tastaturskalierung ± (−LIN/+LIN, −EXP/+EXP) | ja (BELEGT) | WAHRSCHEINLICH | ja (`ks.lc/rc`) |
| e) Mod-Offsets ± per Regler (Op AEG Offset, Rate −7…+7) | – | ja (WAHRSCHEINLICH Suchauszug) | `fmAtk/Dec/Rel` ±30 (BELEGT) |

Am wahrscheinlichsten meint Xander (a) und (c): „auch bei Lautstärken“ ist das Level/Vel ±. **UNBELEGT** (Deutung).

### 3.5 „Montage klingt bei gleichen Werten stärker“
- Für eine höhere Index-Skala bei FM-X gibt es **keine Quelle**. Yamaha-Forenbeiträge nennen FM-X für einfache Sinuspaare „DX7-kompatibel“. **UNBELEGT** bzw. **WAHRSCHEINLICH** (Suchauszug).
- Plausible Gründe für den Höreindruck: Spectral Forms (all1/odd/res) statt Sinus, Level/Vel, Part-Effekte (Insert-Drive, EQ), lautere Werks-Voices. **UNBELEGT**.
- Der lange tote Fader-Weg (1.7) erklärt Xanders Eindruck allein schon. **WAHRSCHEINLICH**.

---

## 4. Moderne FM-Geräte (kurz)
- **Korg opsix** (Hardware/native): ADSR je Operator (ATK, DECAY, SUS, REL) plus CURVE, die die Decay- und Release-Kurve formt. Die Anschlagdynamik sitzt als „Level Velocity Sens“ (0–100 %) auf der L.MOD-Seite. Daneben gibt es eine Pitch-EG und frei zuweisbare EGs. **BELEGT (Suchauszug)**: opsix Owner's Manual E3/E6, opsix native OM (cdn.korg.com, storage.korg.com). Der Bezug „Attack/Decay formen den Gesamtklang als erste Hüllkurve“ (bonedo-Test) ist **WAHRSCHEINLICH**.
- **Elektron Digitone (1):** zwei Operator-Hüllkurven (A und B, wobei B für B1 und B2 gilt). AD mit einstellbarem End-Pegel; je nach Gate verhalten sie sich als ADE oder ASDE. LEV setzt die Modulationsmenge. ARST/BRST bestimmen den Neustart beim Retrigger. **BELEGT (Suchauszug)**: support.elektron.se, Artikel 43000566573.
  - Bedienung über Drehregler mit einer Hüllkurvengrafik im Display, ohne Touch. **WAHRSCHEINLICH**.
- **Kodamo EssenceFM:** 6 Operatoren, **6-stufige Hüllkurven mit Loop-Punkt**, 14 Hüllkurven je Stimme. Editiert wird auf dem 7″-Multitouch-Bildschirm durch Verschieben der Punkte und Setzen von Attributen (Sustain, Loop-Start, Loop-Ende). Loops dienen auch als LFO-Ersatz. **BELEGT (Suchauszug)**: Thomann-Produktseite, synthanatomy.com, sonicstate.com.
- **NI FM8:** mehrstufige Breakpoint-Hüllkurven mit Sustain-Loop und Easy/Morph-Seite. **WAHRSCHEINLICH** (Herstellerseite nennt nur „flexible envelopes“; Details aus Erinnerung). Absynth (NI-Schwester) kennt die Modi Slide, Lock und Grid beim Verschieben von Breakpoints. **WAHRSCHEINLICH** (Suchauszug: elephorm.com).

---

## 5. Touch-Bedienung: Hüllkurven schnell editieren

### 5.1 Wie es andere lösen
| Produkt | Editieren | Belegt? |
|---|---|---|
| Dexed | Nur Drehregler (R1–4, L1–4) mit Live-Positionsanzeige. Die Grafik `EnvDisplay` zeichnet nur (`paint`, keine Maus-Handler). Kontextmenü „Copy Operator Values“ und **„Paste Envelope Values“** | BELEGT: `source/ui/component/EnvDisplay.cpp` (0 × „mouse“), `source/ui/OperatorEditor.cpp` Z. 35–45 |
| KQ Dixie (iOS) | Antippen öffnet ein „sehr berührungsempfindliches“ Grafikfeld, mit Zahlenoptionen für feine Schritte | WAHRSCHEINLICH (Forum loopypro, Suchauszug) |
| Montage/MODX | Touchscreen mit Hüllkurvengrafik; Werte per Antippen und Drehregler/Data-Dial, Part-Offsets über Knobs | WAHRSCHEINLICH (Tutorials) |
| opsix native | ADSR-Regler plus Kurve | BELEGT (Suchauszug) |
| Digitone | Regler plus Mini-Grafik, kein Touch | WAHRSCHEINLICH |
| Kodamo | Punkte direkt ziehen, Multitouch | BELEGT (Suchauszug) |
| FM8 | Breakpoints ziehen, Loop | WAHRSCHEINLICH |
| Korg Gadget (Chiang Mai, VPM) | Regler-ADSR | UNBELEGT |

### 5.2 Grundsätze (eigene Ableitung, gestützt auf 1.3, 1.7 und die Messung in 0)
1. **Freie Zeitachse statt fester Lanes.**
   - Die x-Position eines Punkts ist die echte kumulierte Zeit, logarithmisch: ms-Bereich breit, Sekunden gestaucht.
   - Bei Mobilbreite soll das Fenster 5–100 ms mindestens ⅓ der Breite einnehmen.
   - Ohne festes Raster: Der gezogene Wert ist kontinuierlich, die Speicherung rundet auf DX-Rate. Die Anzeige zeigt die echte Zeit der gerundeten Rate, damit der Punkt nicht springt.
2. **Zeit konstant halten, wenn der Pegel gezogen wird.**
   - Beim Ziehen von L die Rate nachführen (`rateForTime`), sodass die Stufendauer gleich bleibt (FM-X-Logik).
   - Heute wandert der Punkt waagrecht, weil die Rate fest bleibt (V0a Z. 14177–14179 setzt nur `l`).
3. **Diagonal ziehen erlauben.** Die heutige Achsensperre nach 4 px (Z. 14175) aufheben oder per Option. Ein Punkt (Zeit, Pegel) ist eine 2-D-Größe.
4. **Feinmodus** wie vorhanden (zweiter Finger bzw. senkrechter Abstand, ×¼, ×1/16; `ctlPrecision` Z. 12505). Dazu ein **Lupen-Zoom** der Zeitachse um den gefassten Punkt.
5. **Zahlenanzeige beim Ziehen:** „D1 · 24 ms · −19 dB (L 74) · R2 72“. Die LCD-Zeile gibt es (`show`, Z. ≈ 14158). Neu wäre dB und ms groß, Rate klein.
6. **Schnapp-Schutz für Modulatoren.** Wird eine Modulator-Stufe unter 8 ms gezogen (R2 ≥ 78), erscheint der Hinweis „Klick – unter 10 ms hört man nur noch einen Knack“, mit Rastpunkt bei 15 ms. Eine harte Sperre gibt es nicht.
   - Für Träger: R4 = 99 mit L4 = 0 meldet „Ende hart (1 ms)“.
   - Init-Operator R4 ≈ 70 statt 99 (heute `FM_INIT_OP` Z. 13931: R 99/99/99/99). **Hypothese:** Xanders „schneidet den Sound total ab“ entsteht bei Trägern mit R4 99 aus dem Init oder dem Doppeltipp-Reset. **UNBELEGT**.
7. **Form-Vorlagen je Rolle** (ein Tipp, ein Undo):
   - Modulator: „Snap“, „Pluck“, „Wah“, „Schwell“.
   - Träger: „Orgel“, „Perkussiv“, „Pad“.
   - Werte siehe 6.
8. **Hüllkurve kopieren:** „auf alle Modulatoren“, „auf alle Träger“, „auf alle“ (A.4 Punkt 4). Dazu „nur Zeiten“ bzw. „nur Pegel“ kopieren; Dexed kopiert nur die ganze Hüllkurve.
9. **Rollen-Makros wie FM-X Op-AEG-Offset:** „Snap“ als ein Regler = Rate-Offset nur auf R2 der Modulatoren, ± in ms. Das ist die eigentliche Lösung für „Modulator-Hüllkurve schnell bedienen“. **WAHRSCHEINLICH** (Vorbild FM-X Control Assign).
10. **Zielgrößen Touch:** Griffpunkte ≥ 44 pt (Apple HIG) bzw. 48 dp (Material) als Trefferfläche, sichtbar auch kleiner. **BELEGT** (Apple Human Interface Guidelines „Accessibility – minimum 44×44 pt“; Material Design „touch targets 48×48 dp“, aus Erinnerung; Quellen vor Zitat prüfen = **WAHRSCHEINLICH**).

---

## 6. FM-Bass-Rezept (DX7/FM-X-Stil, in SYNQUENZER-FM6-Parametern)

### 6.1 Prinzip (belegt)
- Träger: Ratio 1 (bzw. 0,5 als Sub) mit eigener, ruhiger Hüllkurve.
- Modulator: Ratio 1 ergibt alle Harmonischen (sägeähnlich). Ratio 2 ergibt nur ungerade Harmonische neben dem Träger, also hohl.
- Modulator: R1 99, L1 99, dann R2 im Schnapp-Fenster auf ein mittleres L2, Sustain L3 etwas tiefer.
- Feedback 5–7 am Modulator-Stapel für Biss (ROM BASS 1/2: FB 7).
- KVS am Modulator 3–7, Rate-Skalierung 2–7 (ROM: 5–7).
- **BELEGT**: ROM1A-Daten (1.8); Tutorial-Konsens „Modulator hoch starten und schnell fallen lassen, wie ein Filter“ (musictech.com Dexed-Tutorial). **WAHRSCHEINLICH** (Suchauszug).

### 6.2 Gemessenes Schnapp-Fenster
Messung: V0a-Kopie, Worklet, Alg 1, Träger ×1 OL 99 R 99/40/25/65 L 99/92/84/0, Modulator ×1, C2, Anschlag 0,9 (`r8/calc/snap-hf.out`). **BELEGT**:

| Mod R2 (OL 88, L2 74) | 50 | 60 | 65 | 70 | 72 | 75 | 80 | 90 | 99 |
|---|---|---|---|---|---|---|---|---|---|
| HF > 300 Hz: −20 dB nach | 70 ms | 40 | 25 | 20 | 20 | 10 | 5 | 10 | 5 |
| Gesamt bei 300 ms (dBFS) | −11,2 | −10,9 | −10,9 | −10,8 | −10,8 | −10,8 | −10,8 | −10,8 | −10,8 |

| Mod OL (R2 72) | 70 | 80 | 88 | 92 | 99 |
|---|---|---|---|---|---|
| HF-Spitze (dBFS) | −25,6 | −20,0 | −14,8 | −12,5 | −9,0 |

- Fenster-Auflösung 5 ms; die Werte sind grob.
- Die Gesamtlautstärke bei 300 ms bleibt in allen Fällen gleich: Der Modulator schneidet nichts ab.
- Bezug A.4 Punkt 5: Modulator-R2 70–75 deckt sich mit dem R6-Audit.

### 6.3 Rezept „Schwerer DX-Snap-Bass“ (Startwerte)
- Algorithmus 5 (drei Paare). OP-Nummern wie im DX7; `r`/`l` = R1–R4/L1–L4.
- Gerendert ohne NaN (`snap-recipe.mjs`/`.out`). Klanglich vor Aufnahme ins Werk von einem Menschen abzuhören. **WAHRSCHEINLICH** (Rezept) / **BELEGT** (Parameter laufen).

| OP | Rolle | Ratio | OL | R1–R4 | L1–L4 | KVS | RS | Zweck |
|---|---|---|---|---|---|---|---|---|
| 1 | Träger | 1 | 99 | 99/40/25/65 | 99/92/84/0 | 0 | 2 | Körper, Ende ≈ 0,3 s |
| 2 | Mod → 1 | 1 | 85–90 | 99/**65–72**/35/65 | 99/**70–78**/62–70/0 | 4 | 3 | **Snap** (Index ≈ 5 → 1,5 rad) |
| 3 | Träger | 0,5 | 90–94 | 99/45/25/65 | 99/90/82/0 | 0 | 2 | Sub-Oktave |
| 4 | Mod → 3 | 0,5 | 55–62 | 99/50/30/65 | 99/70/60/0 | 0 | 0 | leichte Rundung des Subs |
| 5 | Träger | 1, Verst. +3 | 78–82 | 99/50/30/65 | 99/85/75/0 | 0 | 0 | Schwebung, Breite |
| 6 | Mod → 5, FB 5–6 | 3 | 70–76 | 99/**85**/40/70 | 99/**0**/0/0 | 6 | 0 | Anschlag-Klick, nur bei hartem Anschlag |

Varianten:
- **Härter:** OP2 OL 92–95, FB 6–7.
- **Runder:** OP2 R2 55–60.
- **Hohl, Square-artig:** OP2 Ratio 2.
- **Synth-Pop-Bass „Pluck“:** OP1 R2 50, L2 0 → Ton endet nach ≈ 0,3–0,5 s auch bei gehaltener Taste.
- **Mit PEG-Blip (sobald es eine PEG gibt):** L4 = L3 = L2 = 50, L1 53, R1 99, R2 80. **UNBELEGT**.
- **Tiefe Lage (E1):** Tastaturskalierung links +LIN, BP C2, Tiefe 35–50 an OP2/OP4 (A.4 Punkt 5, gemessen in R6).

Herkunft der Zahlen:
- Schnapp-Fenster: eigene Messung, BELEGT.
- Indizes: msfa-Rechnung, BELEGT.
- Struktur „Sub-Paar ×0,5 neben ×1-Ausgang“: Nachtrag 1, EN-03.
- Tutorial-Richtwerte (WAHRSCHEINLICH, Suchauszug): Modulator-Decay 90–140 ms für Subbass (Blog), OL 60–66 für „Bassgitarre“ (musictech Dexed).
- Diese Richtwerte sind **weicher** als der DX-Snap; für „schwer und snappy“ gelten die Messwerte oben.
- Sound On Sound „Synth Secrets“ (FM-Teile) war nicht abrufbar; keine Zahlen von dort.

---

## 7. Abgleich mit SYNQUENZER V0a

| Thema | DX7/FM-X | V0a | Bewertung |
|---|---|---|---|
| EG-Mathematik (Pegel, Raten, Sprung 1716, Annäherung) | msfa | identisch (Worklet Z. 3191–3211, DXN Z. 7415 ff.) | **ok** (BELEGT) |
| Raster des Hüllkurventakts | Hardware 1 Sample, msfa 64 | 16 Samples (`FENV_BLK = CR`, CR 16) | ok (≈ 0,33 ms) |
| Zeitbasis | DX7 49 096 Hz | 44,1-kHz-Raster (`LVL_PER_SEC`, Z. 2582) | ≈ 11 % langsamer, wie msfa/Dexed |
| Haltezeit bei gleichen Pegeln | ja (Dexed) | nein | fehlt (klein) |
| Index-Skala (4π bei 99) | msfa | identisch (Z. 7538) | ok; Bedienkurve fehlt → A.4/3 |
| Pitch-EG | DX7 ±4 Okt., FM-X je Operator ±50 | **fehlt** | **Lücke** (Xander fragt ausdrücklich) |
| Anschlag ± | FM-X −7…+7 | 0–7 | Lücke (klein) |
| Hold/Key-On-Delay je Operator | FM-X Hold Time | fehlt | optional |
| Editor | FM-X: Zeiten; Kodamo: Punkte frei | Lanes, log 1 ms–40 s, Achsensperre, Rate fest bei Pegelzug | **Hauptursache der Beschwerde** (WAHRSCHEINLICH) |
| Init/Reset | – | R4 = 99 (harter Schluss) | Kandidat für „schneidet ab“ (UNBELEGT) |
| Hüllkurve auf mehrere | Dexed: Paste Envelope | nur „Auf alle Ausgänge“ | A.4/4 bringt es |

**Empfehlung für Nachträge** (nicht Teil von V0d, sofern A.4 nicht erweitert wird):
1. Editor nach 5.2 Punkte 1–3, 5, 6 (freie log-Zeitachse, Zeit konstant bei Pegelzug, diagonal, ms/dB-Anzeige, Klick-Hinweis).
2. Rollen-Makro „Snap“ (R2-Offset nur Modulatoren) und Form-Vorlagen.
3. Pitch-EG (DX7-Format L 50 = Mitte; .syx-Import übernimmt sie statt sie zu verwerfen).
4. Anschlag ± (FM-X-Stil) als Erweiterung von `vs`.
5. Dexed-Haltezeit (`statics`) für DX-Treue beim Import.
6. Init-Operator R4 ≈ 70.

---

## 8. Quellen

**Quelltext und Wiki (gelesen, lokal in `r8/src/`):**
- msfa = google/music-synthesizer-for-android, `app/src/main/jni/env.cc`, `env.h`, `dx7note.cc`, `pitchenv.cc`, `fm_op_kernel.cc`, `fm_core.cc`, `synth.h` (master). https://github.com/google/music-synthesizer-for-android
- msfa-Wiki `wiki/Dx7Envelope.wiki`, `wiki/Dx7Hardware.wiki` (Messungen am DX7, 49 096 Hz, Chowning-Verweis).
- Dexed = asb2m10/dexed, Commit `fea2f0f0f2c397799f59b27eb11c038cd34b22c5`: `source/msfa/env.cc`, `env.h`, `pitchenv.cc`, `source/ui/OperatorEditor.cpp`, `source/ui/component/EnvDisplay.cpp`, `doc/sysex-format.txt`. https://github.com/asb2m10/dexed
- DX7 ROM1A (lokal `scratchpad/fmresearch/proto/rom1a.json`, Werks-Voices BASS 1/BASS 2).
- SYNQUENZER V0a (Kopie `r8/V0a-copy.html`): Z. 2582, 3189–3211, 7380–7560, 12505, 13931, 13948–13974, 14007–14200, 15041.

**Eigene Rechnungen und Messungen (`r8/calc/`):**
- `eg-table.mjs` → `eg-table-49096.out`, `eg-table-44100.out`
- `vel-rs.mjs` → `vel-rs.out`
- `mod-eg-check.mjs` → `.out`
- `snap-hf.mjs` → `.out`
- `snap-recipe.mjs` → `.out`
- Lader: `fm-lib.mjs` (Kopie von `r6/fm-lib.mjs`, zeigt auf die V0a-Kopie).

**Nur über Suchauszug (Seiten nicht abrufbar):**
- Ken Shirriff, „Yamaha DX7 chip reverse-engineering“ Teil 1–6: https://www.righto.com/2021/11/reverse-engineering-yamaha-dx7.html, https://www.righto.com/2022/02/yamaha-dx7-chip-reverse-engineering_7.html. Behandelt den OPS-Chip; die EGS liefert die Hüllkurve an die OPS. Eine EGS-Analyse wurde **nicht** gefunden.
- Yamaha „FM 101, Part Four: Going from Static to Dynamic“: https://yamahasynth.com/learn/modx-series-synthesizers/fm101-part-four-going-from-static-to-dynamic/
- „FM 101, Part Five“: https://yamahasynth.com/learn/synth-programming/fm-101-part-five-expanding-your-sound/
- „Mastering MONTAGE: An FM-X Exploration Part 2“: https://yamahasynth.com/learn/montage-series-synthesizers/mastering-montage-fm-x-exploration-part-2/
- „Manny's FM-Xpert #4: The Envelope(s), Please“: https://yamahasynth.com/learn/montage-series-synthesizers/mannys-fm-xpert-4-the-envelopes-please/
- MONTAGE M Operation Manual: https://manual.yamaha.com/mi/synth/montage_m/en/om02screenparameters0140.html, …/en/om02screenparameters0150.html, …/ja/om02screenparameters0150.html
- Forum „MODX vs. DX7 envelopes“: https://yamahasynth.com/community/modx-series-synthesizers/modx-vs-dx7-envelopes/
- yamahamusicians.com „MODX Pitch EG – very confusing!“: https://yamahamusicians.com/forum/viewtopic.php?t=20154
- „New FM-X options in Montage M“: https://yamahamusicians.com/forum/viewtopic.php?t=20222
- Synthtopia „Yamaha FM-X Synthesis: Way More Powerful Than A DX-7“: https://www.synthtopia.com/content/2016/02/05/yamaha-fm-x-synthesis-way-more-powerful-than-a-dx-7/
- Korg opsix Owner's Manual: https://cdn.korg.com/us/support/download/files/b74b68a3bc5971433f2352d8e7721900.pdf
- opsix native OM: https://storage.korg.com/korgms/support/opsix_native/opsix_native_OM_E.pdf
- Elektron Digitone, Hüllkurven: https://support.elektron.se/support/solutions/articles/43000566573
- Kodamo EssenceFM: https://www.thomannmusic.com/kodamo_essence_fm_mkii_b_stock.htm, https://synthanatomy.com/2025/05/kodamo-essencefm-7-0-new-firmware-adds-multi-track-sequencer-second-lfo-and-more.html, https://sonicstate.com/news/2019/06/17/essencefm-modern-high-end-fm-synthesizer
- KQ Dixie: https://forum.loopypro.com/discussion/comment/1073841/, https://synthanatomy.com/2018/01/kq-dixie-new-6-operator-fm-synthesizer-ios-dx7-patch-compatibility.html
- NI FM8: https://www.native-instruments.com/en/products/komplete/fm8/
- Absynth-Breakpoints (elephorm): https://www.elephorm.com/komplete-10-synthetiseurs/absynth-enveloppes-deplacements-points-lock-slide-grid
- Mark Phillips, „Basic FM Synthesis on the Yamaha DX7“: https://www.flitemedia.com/downloads/dx7/BasicFM.pdf
- musictech Dexed-Tutorials: https://musictech.com/tutorials/fm-synthesis-basics-dexed/, https://musictech.com/tutorials/learn-advanced-fm-synthesis-with-dexed/
- DX7-Handbuch (nicht abrufbar, nur verlinkt): https://homepages.abdn.ac.uk/d.j.benson/pages/dx7/manuals/dx7-man.pdf
- Index-Grenze 13 rad (Forum): https://yamahasynth.com/community/modx-series-synthesizers/fm-x-ratio-11-what-exactly-is-going-on/

**Nicht gefunden bzw. offen:**
- Sound On Sound „Synth Secrets“ FM-Teile (kein Treffer, Seite blockiert).
- Ken Shirriffs EGS-Analyse (existiert anscheinend nicht).
- FM-X-Level-Scaling-Bereiche; FM-X Time/Vel; Key On Delay bei FM-X jenseits von Hold Time.
- Korg-Gadget-FM-Bedienung.
