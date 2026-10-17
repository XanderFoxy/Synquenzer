# R8 – FM6-Hüllkurven in V0a: Diagnose mit Messungen gegen DX7 (msfa/Dexed)

**Stand:** 17.10.2026 · Auftrag R8 „FM-Diagnose“ · Anlass: `fragen-xander-9.md` („FM-Hüllkurven – Katastrophe“).
**Prüfling:** `synq-snapshots/V0a.html` (= Xanders Stand App 3.1.0; Worklet und FM-Code identisch mit `dirigent-wt/index.html`, per diff geprüft).
**Referenz:** Dexed-msfa („Modern“-Engine, `ACCURATE_ENVELOPE` an), selbst mit g++ 13 als Kommandozeilen-Renderer gebaut.
**Ergänzung:** Den Stand der Technik (DX7/FM-X/moderne Editoren, Rezepte) beschreibt der Schwesterbericht `r8/fm-huellkurven-recherche.md`. Dieser Bericht misst und begründet.

**Kennzeichen:** **[g]** gemessen (Node-Worklet, Chromium-Offline-Render oder Playwright-Bedienung, nicht angehört, nicht am iPhone) · **[c]** aus dem Code abgelesen (Zeilennummern = `V0a.html`) · **[f]** Folgerung.

---

## 0. Kurzfazit

1. **Der Klangmotor ist DX7-genau.** Das gilt für das Worklet, also den Normalfall. Gemessen wurden 8 ROM1A-Stimmen, Snap-Bässe und ein OL-Sweep [g]:
   - Pegel in 5-ms-Fenstern (ab 5 ms): meist ≤ 0,6 dB Abweichung, höchstens 2,2 dB (BASS 2, Feedback 7).
   - Spektraler Schwerpunkt: im Median 3–12 Cent Abweichung.
   - Operator-Hüllkurven: im gehaltenen Teil identisch (≤ 0,07 dB); Unterschiede nur auf steilen Flanken, weil die Protokolle verschieden abtasten.
   - Gleicher Modulator-OL ergibt gleiche Helligkeit (±1 OL).
2. **Ein Modulator schneidet den Träger nicht ab.** Fällt der Modulator auf 0, klingt der Träger als Sinus weiter. Das gilt in allen drei Motoren: Spitze 0,705 gegen 0,705 (DX7), Klirrfaktor −72,7 dB gegen −72,7 dB [g].
3. **Die „Katastrophe“ entsteht in der Bedienung.** Fünf gemessene Ursachen:
   - (a) **Die OP-Seite öffnet zuerst auf OP 1** (nach jedem Neuladen). OP 1 ist in allen 32 Algorithmen ein **Ausgang**. „Hüllkurve zusammenziehen“ verkürzt dort die **Lautstärke**: FM-Pluck −9 dB nach 10 ms, −15 dB nach 100 ms [g].
   - (b) **Spur-Editor der OP-Hüllkurve:** Jede Phase hat eine eigene 78-px-Spur von 1 ms bis 40 s (logarithmisch).
     - Der ganze Snap-Bereich (Abfall 25–230 ms) liegt auf **16 px**. 1 px entspricht ×1,15 Zeit.
     - Die erste Bewegung springt um 5 px (D1 von 67 auf 34 ms).
     - Ganz links wird jede Phase ein Klick (D1 3 ms). Der Angriff wird dort sogar **langsamer** (R1 99 → 82).
     - Bei gleichen Pegeln (L1 = L2) setzt ein Zeitzug die Rate stumm auf **0**. Danach dauert D1 **32,7 s** [g].
   - (c) **Der Haupt-Reiter HÜLLK. zeigt bei FM die VA-ADSR.**
     - Mit DX-HÜLLKURVEN (Standard) wirkt sie **gar nicht**.
     - Mit ADSR wirkt sie auf den **ganzen** Klang: Form „Pluck“ ist nach 350 ms stumm.
     - Alte FM2-Sounds werden mit ADSR migriert (Z. 5196) [g/c].
   - (d) **MAKRO Härte/Länge/Release** ändern **alle** Operatoren, auch die Träger. Länge −30 macht FM-Pluck nach 200 ms stumm [g].
   - (e) **Der OL-Fader ist linear,** der Index exponentiell. 62 % des Faderwegs (OL < 62) sind „kaum hörbar“. Das ist DX-treu, fühlt sich aber an wie „extrem hochdrehen müssen“ [g/c].
4. **Echte DX7-Abweichungen der Engine** [g/c]:
   - **Pitch-EG fehlt ganz.** Import verwirft sie (Z. 15041). 27 % von 1088 Bank-Stimmen nutzen sie.
   - **Haltephase fehlt** (gleiche Pegel → DX7 wartet). Bei 12 % der Stimmen ≥ 50 ms hörbar; R2 50: −6 dB nach 30 statt 155 ms.
   - **DX-LFO/AMS nur angenähert.** AMS auf Modulatoren geht verloren (12 %).
   - **Key-Sync immer an** (32 % der Stimmen haben ihn aus).
   - **Release-Kappe 12 s.**
5. **Der Notpfad (ECO, native Knoten) ist bei hohem Index nicht DX-treu** [g]:
   - 1:1 bei OL 90–99: H2 weicht um bis zu 28 dB ab.
   - 1:2 bei C3, OL 75: Schwerpunkt +41 %.
   - Feedback ist eine statische Wellenform.
   - Nur relevant, wenn das ECO-Abzeichen sichtbar ist.

**Wichtigste Fixes** (Details in §6):
- OP-Seite mit dem Modulator öffnen, Rolle groß anzeigen.
- Neuer OP-Hüllkurven-Editor: Raten-Schritte mit festen Pixeln, Ziffern-Eingabe, Totzone nicht mitnehmen, Ratenfehler in `rateForTime` beheben.
- HÜLLK.-Reiter bei FM umbauen.
- „Snap“-Makro nur für Modulatoren.
- Pitch-EG und Haltephase nachbauen.

---

## 1. Referenz und Methode

| Baustein | Was | Datei |
|---|---|---|
| DX7-Referenz | Dexed `Source/msfa` (Commit `eebb748`, „Dexed 1.1.0 Refactor for JUCE 8“): `env.cc` mit `ACCURATE_ENVELOPE`-Haltetabelle, `fm_core.cc`, `fm_op_kernel.cc`, `dx7note.cc`, `exp2`, `sin`, `freqlut`, `pitchenv`, `lfo`, `porta`. Abhängigkeiten (JUCE-Tuning, MTS, Logger) durch Stubs ersetzt, Stimmung = Dexeds `StandardTuning`. | `r8/ref/src/msfa/`, Stubs `r8/ref/src/debugger/Logger.h`, `libMTSClient.h`, `Tunings.h`, `tuning_std.cc` |
| CLI | `dx7render voice.vced note vel gate dur out.f32 [sr] [envlog.csv] [nolfo]`. Rendert eine Stimme (155/156-Byte-VCED, Transponierung wie Dexed-keydown), f32 in Q24-Einheiten (Träger OL 99 = 2,0), dazu ein EG-Protokoll je 64 Samples. | `r8/ref/dx7render.cc`, Binärdatei `r8/ref/bin/dx7render` |
| Gegenprobe des Builds | Das Original-msfa (google/music-synthesizer-for-android) wurde zusätzlich geklont. `env.cc` weicht nur um die Haltetabelle von Dexed ab. ROM1A aus beiden Quellen: 31 von 32 Stimmen bytegleich (Platz 31 TRAIN/CHIME-STRG getauscht). | `r8/dl/msfa-android/repo` |
| V0a-Worklet | Der Quelltext von `<script id="sq-worklet-src">` läuft in Node (Shim wie `wp4work/tools/wk-load.mjs`), eng 1, flaches Patch = Worklet-Defaults + FM_BASE. | `r8/tools/lib.mjs` (`v0aRender`) |
| V0a nativ | `DXN.voice` im `OfflineAudioContext` von Chromium (Playwright). | `r8/tools/m3-native.mjs`, `m5-snap.mjs`, `m9-olmatch.mjs` |
| Gleiche Patches | Umrechnung fm6 ↔ VCED: OP6 zuerst; PEG flach (R 99, L 50); LFO aus; Transponierung 24 + trans. ROM1A wird wie V0as `parseSyxBank` gelesen. | `fm6ToVced`, `parseBank` in `lib.mjs` |
| Pegelabgleich | V0a skaliert Träger mit 0,5/√nCar (Z. 3237), msfa addiert sie. Die Referenz wird deshalb mit demselben Faktor multipliziert. | `matchScale` |
| AC-Kopplung | V0a hat am Ausgang einen 5-Hz-DC-Blocker (Z. 2699). Ohne denselben Filter auf der Referenz weichen verstimmte 1:1-Paare im Langzeit-RMS um bis zu 3 dB ab: Schwebungs-Seitenbänder unter 5 Hz, z. B. STRINGS 2 −11,35 gegen −8,20 dB. Mit Filter sind es 0,03 dB. Alle folgenden Vergleiche nutzen deshalb den Filter. | `hp5` |
| Messgrößen | RMS in dB je 5 ms; spektraler Schwerpunkt je 10 ms (Hann-Fenster 2048 = 43 ms); Harmonische H1…H6 (FFT 8192); EG-Pegel in 1/256-Verdopplungen (= msfa `level_in >> 16` = V0a `v.flvl`). 48 kHz, Anschlag 100 (V0a 100/127), Gate 1 s, wenn nicht anders angegeben. | `rmsTrack`, `centroidTrack`, `harm` |

**Einschränkung:** Referenz ist msfa/Dexed, nicht ein echter DX7. msfa rechnet im 44,1-kHz-Raster; laut Schwesterbericht §7 läuft der echte DX7 mit 49 096 Hz, seine Hüllkurven-Zeiten sind also um etwa 11 % kürzer. Für den Vergleich V0a ↔ Referenz spielt das keine Rolle, weil V0a dieselbe Zeitbasis nutzt.

---

## 2. Code-Befund V0a (Worklet und nativ) gegen DX7

| Aspekt | V0a-Worklet [c] | V0a nativ DXN [c] | DX7 (msfa) | Abweichung |
|---|---|---|---|---|
| Rate → Steigung | `qrate = (R·41)>>6 + rs`, `inc = (4+(q&3))·2^(q>>2)` → `LVL_PER_SEC` (Z. 2582, 3191–3199) | gleich (Z. 7385, 7415–7436) | `Env::advance` | keine |
| Kurvenform | Abfall linear in dB; Anstieg mit Sprung auf 1716 (= −50 dB) und Annäherung `(17 − l/256)·inc` im log-Bereich (Z. 3200–3213) | Abfall exakt; Anstieg je 6-dB-Band durch `setTargetAtTime` angenähert (Z. 7437–7446) | `Env::getsample` | Worklet keine; nativ angenähert |
| Takt der Hüllkurve | 16 Samples (`FENV_BLK = CR`, Z. 2581), Verstärkung je Sample interpoliert | Automation | 64 Samples | feiner; nur die 1. ms anders |
| Haltephase bei Ziel = Ist und Angriff mit L1 = 0 | **fehlt**: Ziel erreicht → sofort nächste Phase (Z. 3207/3210) | fehlt | `statics[]`-Tabelle (bis 40 s) | **ja** (§3e) |
| Pegeltabellen | OL: `scaleOL` (Z. 2569), 0,75 dB/Schritt ab 20; EG-L: `(scaleOL(L)>>1)<<6` → 1,5 dB je **2** Schritte (L 98 = L 99) | gleich | gleich | keine |
| Anschlag, Tastatur- und Raten-Skalierung | `scaleVel`, `scaleLevel`, `scaleRate` (Z. 2570–2580) = msfa-Tabellen | gleich | gleich | keine (msfa-Option `SUPER_PRECISE` aus) |
| OL → Index | Gewinn `2^(lvl/256 − 14)` in Zyklen; OL 99/L 99 = 2 Zyklen = **4π rad** (Z. 3225, 3237–3262) | FM über `frequency`, Hub = 2π·f·amp (Z. 7473–7482) | gleich (PM) | Worklet keine; nativ = FM statt PM (§3d) |
| Feedback | (y0+y1)/2 · 2^(fb−8) Zyklen (Z. 3152, 3247–3252) | **statische** PeriodicWave mit dem Pegel nach 300 ms (Z. 7465) | `compute_fb` | nativ: Feedback-Klang folgt der Hüllkurve nicht |
| Pitch-EG | **fehlt** (fm6 = `{alg, fb, trans, ops}`) | fehlt | PEG, ±4 Okt. | **fehlt**; .syx-Import verwirft sie (Z. 15041) |
| DX-LFO / AMS | kein DX-LFO; Import mappt auf LFO 1 → `pitch`/`amp`, AMS nur über Träger (Z. 15075–15089) | LFO-Routen | LFO + AMS je Operator | AMS auf Modulatoren geht verloren |
| Key-Sync | Phasen bei jeder Note auf 0 (Z. 3155–3158) | gleich | Byte 136 (aus = Phasen laufen frei) | immer an |
| Release | Gate aus → Phase 4 (R4 → L4), einmal (Z. 3217) | `release()` plant R4 | `keyup` | keine |
| Ende einer Stimme | Gate aus und kein Träger über `GAIN_THRESH` (−83,5 dB re 1,0) für 256 Samples, **oder 12 s nach Release** (Z. 2592, 3300–3305). Mit ADSR: Ende der ADSR (Z. 3275–3288) | Gate schließt 60 dB unter der lautesten Phase, max. 12 s (`releaseTime`, Z. 7499–7508) | `isPlaying()`: Träger-EG fertig (ohne Zeitkappe) | 12-s-Kappe; ADSR-Modus kürzt |
| Stimmenklau | poly ≤ 8; Opfer = losgelassene Stimme mit kleinstem Trägerpegel (`aOut = car·0,5`, Z. 3232), sonst die älteste; 96-Sample-Fade (Z. 2827–2837) | 4 ms | Punktwertung (frei > losgelassen > gleiche Taste) | gleichwertig |
| MONO | jede neue Note startet die Phasen vom aktuellen Pegel (`fmRetrig`, Z. 2903, 3162–3167) | – | Dexed-Mono: legato `transferState` (kein Neustart) | Legato startet in V0a neu (klein) |
| Trägersumme | ×0,5/√nCar (Z. 3237) | gleich (Z. 7450) | Summe | Lautheit je Algorithmus normiert (alg 32: DX7 relativ +7,8 dB); Absicht |
| Ausgangsgate | fmAmp 0: Gate mit τ 0,25 ms (Z. 2587–2591) | VCA-Gate 1,2 ms | – | erste ≈ 1 ms weicher |
| Live-Änderung | laufende Phase neu zielen; Sustain → Phase 3 (Z. 3186) | „ab der nächsten Note“ | Dexed `Env::update`: zurück auf Phase 3 | gleichwertig |

---

## 3. Messungen

### 3a ROM1A-Stimmen: Worklet gegen DX7 [g]

Gemessen mit `tools/m1-rom.mjs`, LFO aus (beide), PEG dieser Stimmen flach, Anschlag 100, Gate 1 s. Die Tabelle zeigt RMS in dB (5-ms-Fenster) und den Schwerpunkt in Hz, jeweils V0a / DX7.

| Stimme (Note) | RMS bei 10 · 50 · 100 · 400 · 1000 · 1100 ms | Schwerpunkt bei 10 · 100 · 400 ms | max \|ΔRMS\| erste 5 ms / danach |
|---|---|---|---|
| BASS 1 (C2) | −9,0/−9,0 · −6,3/−6,3 · −6,0/−6,0 · −6,5/−6,5 · −10,5/−10,4 · −25,2/−25,4 | 392/392 · 229/229 · 110/110 | 0,20 / 0,20 dB |
| E.PIANO 1 (C4) | −4,3/−4,3 · −4,1/−4,1 · −5,7/−5,7 · −4,0/−4,0 · −5,9/−5,9 · −26,9/−26,9 | 1125/1129 · 864/865 · 580/581 | 0,50 / 0,13 dB |
| BRASS 1 (C4) | 1,5/1,3 · −8,1/−8,1 · −7,9/−7,9 · −2,9/−2,9 · −9,2/−9,2 · −64,6/−65,7 | 3050/3119 · 3622/3632 · 900/903 | 3,24 / 1,19 dB |
| BASS 2 (C2) | −2,1/−2,2 · −6,3/−6,3 · −1,3/−1,3 · −7,9/−7,9 · −30,6/−30,9 · −44,4/−44,4 | 73/73 · 90/90 · 66/66 | 3,12 / 2,22 dB |
| PIANO 1 (C4) | −3,1/−3,1 · −3,7/−3,7 · −5,0/−5,0 · −7,3/−7,3 · −21,4/−21,4 · −30,9/−30,9 | 567/567 · 562/562 · 510/510 | 0,69 / 0,03 dB |
| CLAV 1 (C4) | −8,3/−8,3 · −8,4/−8,4 · −9,7/−9,6 · −12,6/−12,6 · −21,5/−21,5 · −57,9/−57,4 | 4858/4859 · 4883/4889 · 4743/4750 | 0,06 / 0,61 dB |
| MARIMBA (C5) | −2,2/−2,3 · −2,7/−2,7 · −5,6/−5,5 · −47,9/−47,7 · stumm/stumm | 471/486 · 403/403 · 401/403 | 0,76 / 0,22 dB |
| TUB BELLS (C4) | −3,8/−3,8 · −6,1/−6,1 · −8,7/−8,7 · −12,2/−12,2 · −22,3/−22,3 · −22,2/−22,2 | 1153/1154 · 1232/1232 · 1210/1210 | 0,19 / 0,06 dB |

**Schwerpunkt im gehaltenen Teil (0–950 ms):** Median 3 Cent (BASS 1), 5 (BRASS 1), 12 (BASS 2), 8 (MARIMBA). Der Höchstwert liegt immer im ersten Fenster: Der Angriff liegt im 16- statt 64-Sample-Raster.

**EG-Spuren** (`tools/m4-egtrace.mjs`): Im gehaltenen Teil gleichen sich die Pegel auf 0–3 Einheiten (≤ 0,07 dB). Auf steilen Flanken (erste 1–5 ms, Release) sind es bis 0,9 dB, weil die Protokolle zu verschiedenen Zeitpunkten abtasten (V0a alle 128, msfa alle 64 Samples).

**Folgerung:** Die Engine ist kein Grund für die Beschwerde [f].

### 3b Modulator fällt auf 0, Träger hält 99: wird der Klang abgeschnitten? [g]

Patch: alg 1, OP1 Träger R 99 99 99 60 / L 99 99 99 0, OP2 Modulator R 99 *R2* 99 60 / L 99 0 0 0, C2, Gate 1,2 s (`tools/m2-modcut.mjs`, nativ `m3-native.mjs`). Werte V0a / DX7.

| Mod : Träger | OL | R2 | RMS 10 ms | RMS 300 ms | RMS 1000 ms | Klirrfaktor bei 0,6 s | Spitze 0,5–1,1 s |
|---|---|---|---|---|---|---|---|
| 1:1 | 99 | 99 / 80 / 60 | −4,6/−5,0 · −6,6/−6,6 · −5,0/−5,2 | −4,7/−4,7 | −7,1/−7,2 | −72,7/−72,7 dB | 0,705/0,705 |
| 1:1 | 90 | 99 / 80 / 60 | −4,4/−4,8 · −7,0/−7,6 · −7,3/−7,5 | −4,7/−4,7 | −7,1/−7,2 | −72,7/−72,7 dB | 0,705/0,705 |
| 2:1 | 99 | 99 / 80 / 60 | −4,8/−5,0 · −5,6/−5,7 · −6,6/−6,4 | −4,7/−4,7 | −7,1/−7,2 | −72,7/−72,7 dB | 0,705/0,705 |
| 0,5:1 | 99 | 99 / 80 / 60 | −4,4/−4,9 · −10,8/−10,8 · −6,2/−6,2 | −4,7/−4,7 | −7,1/−7,2 | −72,7/−72,7 dB | 0,705/0,705 |
| nativ 1:1 / 2:1 / 0,5:1 | 99 | 80 | – | – | – | −72,3 / −70,7 / −72,3 dB | 0,707 (DX7 0,707) |

**Antwort:** Nein, V0a schneidet nicht ab und schwächt nicht ab. Nach dem Modulator-Abfall bleibt ein reiner Sinus in voller Höhe, in allen drei Motoren.

Zwei Mess-Hinweise:
- Die RMS-Zacken (−4,7 gegen −7,1 dB) kommen vom 5-ms-Fenster, das kürzer ist als eine Periode von C2 (15 ms).
- Hörproben: `r8/tmp/b-modcut-v0a.wav` und `b-modcut-dx7.wav`.

### 3c Hüllkurven über die Zeit: Snap-Bass in drei Motoren [g]

Patch: alg 1, OP1 Träger R 99 50 40 70 / L 99 88 80 0, OP2 Modulator OL 99 R 99 *R2* 50 70 / L 99 0 0 0, Gate 0,4 s (`tools/m5-snap.mjs`). Schwerpunkt in Hz alle 10 ms, Werte **Worklet / nativ / DX7**.

| Fall (Note C2) | 0 ms | 10 | 20 | 30 | 50 | 80 | 120 | 200 |
|---|---|---|---|---|---|---|---|---|
| C:M 1:1, R2 60 | 368/397/378 | 295/317/299 | 263/270/266 | 203/206/206 | 153/153/153 | 125/125/126 | 85/87/86 | 70/70/70 |
| C:M 1:2, R2 60 | 665/731/678 | 562/581/567 | 442/485/451 | 362/407/365 | 286/264/291 | 143/184/145 | 96/112/96 | 72/73/73 |
| C:M 2:1, R2 60 | 385/388/391 | 327/328/332 | 269/277/273 | 238/246/239 | 219/221/221 | 151/151/152 | 136/136/136 | 132/132/133 |
| C:M 1:0,5, R2 60 | 167/186/171 | 186/202/190 | 136/164/139 | 96/119/97 | 113/102/115 | 77/77/77 | 63/65/64 | 68/67/68 |
| C:M 1:1, R2 75 | 154/163/173 | 89/94/94 | 72/72/73 | 69/68/69 | 67/67/67 | 67/68/67 | 67/67/67 | 67/67/67 |

![Snap-Bass: Schwerpunkt](shots/f1-snap-centroid.png)
![Snap-Bass: RMS 5 ms](shots/f1b-snap-rms.png)

```
B) Snappy FM-Bass C2 (1:1, Mod. OL 99, R2 60): spektraler Schwerpunkt alle 10 ms
 400 Hz |
        |#
        |
 291 Hz |  #
        |    #
        |      #
 182 Hz |        #
        |           # # #
        |                 # # # d
  73 Hz |                       w # # #  # # # # # # # # # #  # # # # # #
        +----------------------------------------------------------------
         0                                                            300  ms
         d = DX7 (msfa)   w = V0a Worklet   (# = überlagert)
```

**Wichtig für den Snap:** R2 60 ergibt einen Schnapp über ≈ 100 ms. Bei R2 75 ist der Schnapp schon nach 20 ms vorbei (Schwerpunkt 72 Hz = fast Sinus). Zwischen „klickt nur“ und „wabert“ liegen etwa 15 Raten. §4 zeigt, wie viele Pixel das im Editor sind.

### 3d Wie viel Modulator-OL braucht V0a für dieselbe Helligkeit? [g]

`tools/m9-olmatch.mjs`, gehaltene 2-Op-Töne, OL 40–99 in 1er-Schritten. Die Tabelle nennt zu jedem DX7-OL das V0a-OL mit dem nächstliegenden Schwerpunkt, als **Worklet | nativ**.

| Modulator-Verhältnis, Note | DX7 60 | 70 | 75 | 80 | 85 | 90 | 95 | 99 |
|---|---|---|---|---|---|---|---|---|
| 1, C2 | 60\|60 | 70\|71 | 75\|78 | 81\|80 | 85\|82 | 90\|90 | 95\|95 | 99\|98 |
| 1, C3 | 60\|60 | 70\|71 | 75\|79 | 81\|80 | 85\|85 | 90\|90 | 95\|95 | 99\|98 |
| 2, C2 | 60\|60 | 70\|69 | 75\|73 | 80\|82 | 85\|85 | 90\|93 | 95\|96 | 99\|99 |
| 2, C3 | 60\|60 | 70\|68 | 75\|71 | 80\|81 | 85\|85 | 90\|92 | 95\|96 | 99\|99 |
| 0,5, C2 | 61\|61 | 70\|70 | 75\|75 | 80\|82 | 85\|85 | 90\|90 | 95\|95 | 99\|99 |

**Worklet:** Es braucht **genau dieselben OL-Werte** wie der DX7. Die Harmonischen sind identisch, z. B. 1:1 bei C3, OL 99: H2 −15,4/−15,4 dB rel. H1.

**Nativ (ECO):** Der Schwerpunkt passt auf ±4 OL. Das **Timbre** weicht bei hohem Index aber stark ab, wegen FM statt PM und anderer Seitenband-Phasen:
- 1:1 bei C3, H2 rel. H1, Werte nativ / DX7: OL 75: −1,4 / +9,0 dB; OL 90: +12,6 / −6,3 dB; OL 95: +17,8 / −10,6 dB; OL 99: +1,9 / −15,4 dB.
- 1:2 bei C3: OL 75 ergibt 436 statt 309 Hz; OL 90 ergibt 935 statt 1148 Hz.

**Warum „extrem hochdrehen“?**
- Der Index wächst ×2 je 8 OL: OL 50 = 0,18 rad, OL 62 = 0,5 rad, OL 70 = 1,0 rad, OL 80 = 2,4 rad, OL 90 = 5,8 rad, OL 99 = 4π.
- Der OL-Fader im ALGO-Streifen ist 108 px hoch und linear (1,1 px je OL).
- Alles unter OL 62 (H2 ≤ −13 dB rel. H1) liegt auf den unteren **62 % des Faderwegs**. Das ist DX-authentisch, aber für den Daumen ein langer toter Weg.
- Der Werks-Sound FM-Pluck zeigt Indizes von I 0,2–2,0 (Screenshot `u2-02`) und ist bewusst weich.
- Montage FM-X hat laut Forum dieselbe 0–99-Skala. Sein Höreindruck kommt plausibel von Spectral Forms (All/Odd/Res statt Sinus, laut Montage-Handbuch), 8 Operatoren und Part-Effekten. Einen Beleg für eine höhere Index-Skala gibt es nicht (siehe Schwesterbericht §3.5).

![OL → Index](shots/f4-ol-index.png)

**Nicht die Ursache** [g/c]:
- **Anschlag:** Tastatur und Vorhören spielen 0,8 = 102. Bei Anschlag-Empfindlichkeit 7 sind das +0,8 dB; erst bei Anschlag 64 kommen −10,5 dB.
- **Filter:** FM_BASE hat Cutoff 20 kHz, Resonanz 0, Hüllkurve 0, Drive 0. Dann wird der Ladder umgangen (`fmBypassCalc`).
- **Helligkeit:** Standard 0 dB.

### 3e Haltephase bei gleichen Pegeln fehlt [g]

DX7/msfa: Ist das Ziel einer Phase gleich dem aktuellen Pegel, wartet die Hüllkurve trotzdem `statics[Rate]` Samples (bei R 50 sind das 150 ms, bei R 0 rund 40 s). Ein Angriff mit L1 = 0 wartet `statics/20`. V0a springt sofort weiter.

Test: Träger L 99 99 0 0, R 99 *R2* 60 60, C4. Gemessen wurde die Zeit bis −6 dB, V0a / DX7 (`tools/m8-hold.mjs`):

| R2 | 90 | 80 | 70 | 60 | 50 | 40 |
|---|---|---|---|---|---|---|
| Haltezeit laut Tabelle | 4 ms | 9 ms | 19 ms | 51 ms | 150 ms | 500 ms |
| −6 dB erreicht nach | 30 / 40 ms | 30 / 40 ms | 30 / 45 ms | 30 / 70 ms | 30 / 155 ms | 30 / 450 ms |

In 1088 Stimmen aus 34 Bänken (ROM1A, Dexed_01, SynprezFM 1–32; `m8b-hold.mjs`) gibt es:
- eine **hörbare D1-Haltephase ≥ 50 ms bei 131 Stimmen (12 %)**, davon ≥ 200 ms bei 104 (10 %). Gezählt: L1 = L2 ≥ 50, und L3 weicht um ≥ 6 ab. Beispiele: PIPES 1 2,5 s, -WOBBLE 1- 4 s, FILTER-SWP 1,4 s.
- einen verzögerten Angriff (L1 = 0) ≥ 20 ms bei 7 Stimmen (1 %).

![Haltephase](shots/f5-static-hold.png)

```
C) Träger L 99 99 0 0, R2 50: RMS (5 ms) – DX7-Haltephase fehlt in V0a
   0 dB |
        |#####dddddddddddddddd
        |    wwwww            ddddd
 -22 dB |         wwwwww           dddddd
        |               wwww             ddddd
        |                   wwwwww            ddddd
 -44 dB |                         wwwww            dddddd
        |                             wwwwww             dddddd
        |                                   wwwwww            ddddd
 -65 dB |                                         wwwww           dddddd
        |                                              wwwww            d
        |                                                   wwwwwwwwwwwww
        +----------------------------------------------------------------
         0                                                            450  ms
         d = DX7 (msfa)   w = V0a Worklet
```

### 3f Pitch-EG [g]

V0a hat keine Pitch-EG. Gemessen wurde die Tonhöhe aus Nulldurchgängen, alle 10 ms (`tools/m10-peg.mjs`).

| Fall | 0 ms | 20 | 50 | 120 | 200 | 300 | 500 ms |
|---|---|---|---|---|---|---|---|
| PEG-„Blip“ R 99 50 99 99 / L 70 50 50 50 (typisch für Bass/Tom), DX7 | +2,6 HT | +5,2 | +7,2 | +5,6 | +3,8 | +1,4 | 0 |
| dieselbe Stimme in V0a | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 |
| PEG-Fall R 99 60 99 99 / L 30 50 50 50, DX7 | −2,5 | −5,2 | −7,1 | −4,9 | −2,3 | 0 | 0 |

Zu den Zahlen:
- Die DX7-PEG ist langsam: R 99 entspricht etwa 12 Oktaven pro Sekunde (msfa `pitchenv_rate`). +7,5 HT werden deshalb erst nach ≈ 50 ms erreicht.
- **TAKE OFF** (ROM1A, PEG L4 99 = +4 Okt.) beginnt auf dem DX7 40,6 HT höher und fällt dann. Der V0a-Import hat keinen Sweep.
- PEG wirkt nicht auf Operatoren mit fester Frequenz. Deshalb klingt REFS WHISL mit und ohne PEG gleich.
- Verbreitung: In den 1088 Bank-Stimmen ist die PEG bei **292 (27 %)** nicht flach, bei 121 (11 %) um ≥ 3 Stufen.

**Ersatz in V0a:** MOD-Hüllkurve → Route `pitch` (±24 HT, Z. 3218). Das ist ein ADSR (einpolig, nur der Betrag ist ±), keine 4-Raten/4-Pegel-PEG. Im nativen Pfad existiert diese Route nicht.

### 3g „±-Hüllkurven“ und Hüllkurve auf der Lautstärke [c/g]

- **DX7:** Die Operator-EG ist einpolig (L 0–99). Sie kann aber in jeder Phase steigen oder fallen (z. B. L1 < L2). V0a kann das auch (`fmEnvStep` steigend/fallend je Phase). Bipolar ist nur die PEG (L 50 = 0), und die fehlt.
- **Lautstärke:** Bei „DX-HÜLLKURVEN“ (fmAmp 0, Standard) formen die Träger-Hüllkurven die Lautstärke. Das ist DX-korrekt und gemessen.
  - Bei „ADSR“ (fmAmp 1) liegt zusätzlich die VA-ADSR über dem ganzen Klang.
  - Ihr gespeichertes Release von 50 ms kappt das DX-Release: −100,5 statt −62,9 dB bei 1050 ms (§4c).
  - Alte FM2-Sounds kommen automatisch mit fmAmp 1 (Z. 5196).
- **Negativer Anschlag** (FM-X Level/Vel −7…+7) gibt es nicht. `vs` geht nur von 0 bis 7.

### 3h Weitere Feature-Abweichungen in den Bänken [g]

`tools/m7-stats.mjs`, 1088 Stimmen:
- LFO-Tonhöhe (PMD > 0 und PMS > 0) bei 45 %. Import über LFO 1 → `pitch`, angenähert.
- LFO-AMD bei 25 %. AMS auf einem **Modulator** bei 12 %. Diese Klangfarben-Modulation geht beim Import verloren (Z. 15084 nimmt nur Träger).
- Osc Key Sync **aus** bei 32 %. V0a setzt die Phasen immer auf 0, jede Note startet also gleich.

---

## 4. Bedienung: OP-Hüllkurven-Editor und Umgebung (Playwright, 390 × 844, Touch über CDP) [g]

Skripte: `tools/u1-envui.mjs`, `u2-envui.mjs`, `u3-op1default.mjs`. Screenshots liegen in `r8/shots/`.

**Wege zu „der Hüllkurve“ bei einem FM-Sound:**
1. Haupt-Reiter **HÜLLK.** zeigt LAUTST./FILTER/MOD. Das sind VA-ADSR-Editoren (`subTabsFor`, Z. 13632; `pageEnv`, Z. 13813).
2. Die echten DX-Hüllkurven liegen unter **FM → OP n → HÜLLK.** (`pageFmOp`, Z. 14208; Editor `fmEnvGraph`, Z. 14139).

![OP 2 HÜLLK.](shots/u1-04-fm-op2-huellk.png)

### 4a Die OP-Seite öffnet auf OP 1 = Ausgang
- `ED.fmOp` ist anfangs undefiniert; `ED.fmOp | 0` ergibt 0 (Z. 14209). Die Kopfzeile zeigt „OP 1 · Ausgang“, die erste Unterseite ist FREQ (`u3-01`). OP 1 ist in **32 von 32** Algorithmen ein Ausgang.
- Test mit FM-Pluck: In OP 1 wurden D1 und D2 je 120 px nach links gezogen. Ergebnis R 99 46 33 62 → 99 94 94 62.
  - RMS bei 10 · 30 · 100 · 200 ms: −16,7 · −17,2 · −21,1 · −27,1 → **−25,9 · −28,1 · −35,7 · −47,2 dB**.
  - Der Schwerpunkt bleibt flach bei 262 Hz: kein FM-Verlauf mehr.
- Dasselbe in **OP 2** (Modulator): Der Pegel bleibt gleich (−17,5 dB bei 30 ms). Die Helligkeit bei 10 ms sinkt aber von 295 auf 176 Hz. Der Snap ist weg, er wird zum 3-ms-Klick.
- **Das sind genau Xanders zwei Beobachtungen:** „schneidet den Sound total ab“ (OP 1) und „schneidet die FM ab“ (OP 2, zu weit gezogen).

![OP-Seite öffnet auf OP 1](shots/u3-01-op-page-opens-on-op1.png)

### 4b Spur-Editor: Raster, Auflösung, Sprünge
**Aufbau:**
- Vier Spuren A | D1 | D2 | (S) | R, je `lw = (W−16)/4,4` = **78 px** breit (Feld 360 × 185 px).
- Jede Spur ist eine eigene log-Achse 1 ms … 40 s (`FM_TLO`/`FM_THI`, `fmLaneX`, Z. 14007–14015).
- Ein Punkt kann seine Spur nie verlassen. Die Kurve zeigt **keine echten Zeitverhältnisse**: Eine 2-ms-Phase ist so breit gezeichnet wie der Rest der Spur (`u1-05`).
- Das ist das „Raster“: Jede Phase sitzt in ihrem eigenen Kasten.

**Zuordnung:**
- Waagrecht = Zeit. `rateForTime` sucht die DX-Rate, deren Phasenzeit im log-Maß am nächsten liegt (Z. 7531–7536).
- Senkrecht = Pegel, etwa 0,6 L-Schritte je px (1,7 px je Schritt, 1 L-Schritt = 0,75 dB, gepaart 1,5 dB).
- Eine Achse je Geste (Z. 14175).
- Fein-Modus nur, wenn der Finger ≥ 64 px quer zur Zugrichtung wandert (`ctlPrecision`, Z. 12505).

**Gemessen** (FM-Pluck OP 2, D1 = 67 ms):

| Geste | Ergebnis |
|---|---|
| 3 px nach links | nichts (4-px-Totzone) |
| 5 px | **Sprung** R2 64 → 71: D1 67 → 34 ms. `dx` zählt ab dem Aufsetzpunkt, die Totzone wird mitgenommen (Z. 14175/14182). Der VA-Editor schluckt sie dagegen (Z. 6398–6404). |
| je 1 px weiter | R2 71, 72, 72, 74, 75, 77, 79, 79, 80, 82, 83, 83, 85 → D1 34 → 7 ms in 12 px: **1 px ≈ ×1,15 Zeit ≈ 1,4 Raten** |
| Fein-Modus (Finger 70 px tiefer) | 4 px ≈ 1–1,5 Raten (×¼); der Weg dahin ist umständlich |
| ganz links, je Spur 120 px | **A: R1 99 → 82** (0,3 → 1,1 ms, also *langsamer*); D1: R2 64 → 93 (67 → 3 ms); D2: R3 45 → 93 (470 → 2,1 ms); R: R4 70 → 93 (29 → 2,1 ms). Ursache: Das Ziel wird auf ≥ 1 ms geklemmt, die Rate mit der nächsten Zeit gewinnt. Für den Angriff ist das nicht R 99. |
| L1 = L2 = 99, D1-Spur 25 px waagrecht | **R2 → 0** ohne Hinweis. Bei Ziel = Ist ist die Zeit für jede Rate 0, also gewinnt die erste (r = 0) (Z. 7534). Danach D1-Pegel 40 px herunter (L2 76): **D1 = 32,7 s** (Anzeige „>20 s“, `u2-01`). |
| Pegelzug bei fester Rate | Die Zeit ändert sich mit, ein Punkt wandert schräg. Beispiel OP 2 R2 64: L2 60/40/20/0 ergibt D1 44/67/91/114 ms. Das ist DX-treu, aber für Touch verwirrend. |

**Der Snap-Bereich in Pixeln** (Abfall L 99 → 0 bei OL 99, Tabelle aus `tools/m12-ratetab.mjs`):

| Rate | 99 | 92 | 87 | 82 | 77 | 72 | 67 | 62 | 55 | 50 | 40 | 30 | ≤ 20 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Abfall 99→0 | 6,2 ms | 14 ms | 25 ms | 43 ms | 69 ms | 116 ms | 231 ms | 396 ms | 793 ms | 1,39 s | 4,4 s | 12,7 s | ≥ 44 s |
| bis −40 dB | 2,7 ms | 6,3 ms | 11 ms | 19 ms | 30 ms | 50 ms | 101 ms | 172 ms | 345 ms | 604 ms | 1,9 s | 5,5 s | ≥ 19 s |
| x in der 78-px-Spur | 13,4 | 19,7 | 23,6 | 27,7 | 31,2 | 35,0 | 40,1 | 44,0 | 49,1 | 53,3 | 61,8 | 69,5 | 78 |

Daraus folgt:
- Der hörbare Snap-Bereich (Abfall auf −40 dB in 10–100 ms, Raten 87–67) liegt auf **x 23,6–40,1 = 16 px**.
- Links davon (x < 13 px) ist die Spur tot: Unter 6 ms geht es für diese Phase nicht.
- Rechts von 62 px liegen Zeiten über 4 s.

![Spur → Zeit](shots/f3-lane-map.png)

![zusammengezogen](shots/u1-05-op2-pulled-together.png) ![Gleiche-Pegel-Falle](shots/u2-01-equal-level-trap.png)

### 4c Haupt-Reiter HÜLLK. bei FM-Sounds
- FM-Pluck (fmAmp 0) mit Form „Pluck“ (aA .001, aD .35, aS 0, aR .3) gerendert: **bitgleich mit dem Original**, also ohne Wirkung. Die LCD meldet trotzdem „Form Pluck“, nirgends steht „wirkt nicht“ (`u2-04`).
- Mit fmAmp 1 (ADSR) und „Pluck“: −159 dB bei 400 ms, der ganze Klang ist nach 350 ms weg. Mit den gespeicherten ADSR-Werten (Release 50 ms) wird das DX-Release gekappt (`tools/m6-adsr.mjs`).
- Der Sub-Reiter „MOD“ ist die Modulations-Hüllkurve (Quelle `menv`). Er ist **nicht** die Modulator-Hüllkurve und ohne Route wirkungslos (`u1-03`). Bei FM liegt die Verwechslung nahe.

![HÜLLK. auf FM](shots/u1-02-tab-huellk-lautst-on-fm.png)
![ADSR-Wirkung](shots/f2-adsr-on-fm.png)

```
A) FM-Pluck C3, RMS (10 ms) – Haupt-Reiter HÜLLK. auf einem FM-Sound
   0 dB |
        |###oooo
 -27 dB |  xxx  ooooooooo
        |     xxx       ooooooooooooooooooooooooo
        |       xxx                           o ooooooooooooooo
 -55 dB |          xxx                                         oo
        |            xxx                                        oo
        |              xx                                        oo
 -82 dB |                xx                                        oo
        |                 x                                         oo
        |                  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx###
        +----------------------------------------------------------------
         0                                                           1200  ms
         o = DX-HK (mit/ohne „Pluck“ identisch)   x = ADSR + „Pluck“
```

### 4d MAKRO Härte/Länge/Release wirken auf alle Operatoren
`fmAdvance` verschiebt R1 (Härte), R2/R3 (Länge) und R4 (Release) jedes Operators (Z. 3195), Träger eingeschlossen. Gemessen mit `tools/m11-macro.mjs`, RMS bei 10 · 100 · 200 · 400 ms:

| Fall | RMS | Schwerpunkt bei 10 ms |
|---|---|---|
| FM-Pluck C3, Länge 0 | −16,7 · −21,1 · −27,1 · −36,4 dB | 295 Hz |
| Länge −15 | −20,9 · −37,6 · −44,3 · −58,0 dB | 156 Hz |
| Länge −30 | −35,0 · −66,9 · −94,5 · −149 dB | 125 Hz |
| 2-Op-Bass C2, Länge −30 | Snap ganz weg: Schwerpunkt 66 Hz ab 10 ms; Träger-D1 auch schneller | 66 Hz |
| nur Modulator-R2 +30 (60 → 90) | auch hier Snap weg (67 Hz): +30 Raten ist zu viel | 67 Hz |

Ein „knackiger“ Dreh am Makro kürzt also immer auch die Lautstärke. Ein Modulator-only-Snap fehlt.

### 4e Weitere Bedien-Fallen
- **Init:** „Init“ auf der HÜLLK.-Seite und „Init FM“ (FM_INIT_OP, Z. 13931) setzen R4 = 99. Das ist ein Release von 6,2 ms und klingt wie abgeschnitten. Der DX7-Init macht es genauso. Das Worklet-Init (Z. 2586) hat dagegen R4 70.
- **Solo:** Solo macht den gewählten Operator zum Ausgang (alg 32, Z. 13959). Hört man einen Modulator mit Solo, formt seine Hüllkurve die Lautstärke. Zieht man sie zusammen, ist der Klang weg. Das ist korrekt, aber nur am Solo-Knopf erkennbar.
- **Nativer Pfad:** Hinweis „Kompatibel: Änderungen ab der nächsten Note“. Hüllkurvenzüge sind erst bei der nächsten Note hörbar.

---

## 5. Zuordnung: Xanders Sätze → Ursache

| Xander | Ursache (gemessen) | Abschnitt |
|---|---|---|
| „Zieht man die Hüllkurve zusammen, schneidet sie den Sound total ab“ | (1) Die OP-Seite steht auf OP 1 = Ausgang; Zusammenziehen kürzt die Lautstärke (−15 dB bei 100 ms). (2) Ganz links in den Spuren gibt es nur 2–3-ms-Phasen. (3) Haupt-HÜLLK. mit ADSR-Modus oder migrierte FM2-Sounds. (4) Länge-Makro. (5) Init mit R4 99. | 4a, 4b, 4c, 4d, 4e |
| „weil sie in irgendeinem Raster hängt“ | Jede Phase hat einen eigenen 78-px-Kasten. Punkte können ihn nicht verlassen und kleben am linken Rand (Minimum 1 ms, real 3–6 ms). Raten springen ×1,15 je px. Der erste Zug springt ×2. Bei gleichen Pegeln fällt die Rate stumm auf 0. Die Zeichnung zeigt keine echten Zeiten. | 4b |
| „stellt man sie weniger scharf, ist sie sperrig“ | Der Snap-Bereich ist 16 px breit. Der Fein-Modus braucht 64 px Querweg. Es gibt keine Ziffern-Eingabe für R/L. Pegelzüge verschieben die Zeit. | 4b |
| „Modulator-Hüllkurve darf den Gesamtklang nicht abschneiden“ | Tut sie nicht (Engine korrekt, 3b). Man landet aber auf OP 1, im ADSR-Reiter oder beim Makro, die den Gesamtklang ändern. | 3b, 4a, 4c, 4d |
| „FM-Effekte viel schwächer als am Montage, extrem hochdrehen“ | Der OL-Index entspricht dem DX7 1:1 (3d). Die unteren 62 % des linearen Faders sind „kaum hörbar“. Der Standard-FM-Sound FM-Pluck ist weich (I 0,2–2,0). FM-X hat Spectral Forms und 8 Operatoren. Im ECO-Pfad kommt ein falsches Timbre bei hohem Index dazu. | 3d |
| „Funktionieren Yamaha-Hüllkurven, ±-Hüllkurven, Pitch-Hüllkurve?“ | Die Operator-EG ist DX7-genau (ohne Haltephase). ± (PEG) und die Pitch-Hüllkurve **fehlen**; der Import verwirft sie. | 3e, 3f, 3g |

---

## 6. Priorisierte Fix-Liste

Jeder Fix hat eine messbare Abnahme. Die Zeilen beziehen sich auf V0a.html.

**P1 – Bedienung (behebt die Beschwerde)**

1. **OP-Seite und Rolle**
   - Beim ersten Öffnen den ersten Modulator des Algorithmus wählen, nicht OP 1. Die letzte Wahl pro Sound merken (`ED.fmOp`, Z. 14209).
   - Die Rolle groß im Editor zeigen: „AUSGANG = Lautstärke“ bzw. „MODULATOR → OP 1 = Klangfarbe“, mit Farbe wie im ALGO-Diagramm.
   - Ein Tipp auf die Mini-Hüllkurve im ALGO-Streifen öffnet direkt die HÜLLK.-Seite dieses Operators (`fmStripCol`).
   - *Abnahme:* Ein frischer FM-Pluck öffnet OP 2; die Rolle ist ohne Scrollen sichtbar.
2. **OP-Hüllkurven-Editor neu** (`fmEnvGraph`, Z. 14139 ff.; `FMH.rateForTime`, Z. 7531)
   - (a) Totzone schlucken wie im VA-Editor (Z. 6398–6404). *Abnahme:* Der erste Zug ändert höchstens 1 Rate.
   - (b) Waagrecht in **Raten-Schritten mit fester Pixelzahl** ziehen (z. B. 5 px je Rate = 495 px für 0–99, mit Fein ×¼). Daneben ms und Rate anzeigen. *Abnahme:* Der Snap-Bereich R 87–67 umfasst ≥ 100 px statt 16.
   - (c) `rateForTime` korrigieren:
     - Ziel unter dem Minimum → Rate 99 (größte Rate mit kürzester Zeit).
     - Bei `from == to` die aktuelle Rate behalten (statt 0).
     - Bei gleicher Zeit die Rate wählen, die der aktuellen am nächsten liegt.
     - *Abnahme:* Ganz links ergibt R1 = 99. Bei L1 = L2 bleibt R2 unverändert.
   - (d) Ziffern-Bedienung im DX-Stil: R1–R4 und L1–L4 als 8 Werte mit ‹ ›-Schritten und Wischen, langer Druck = Eingabe, unter dem Graphen. *Abnahme:* Jeder Wert ist ohne Graph in 1er-Schritten einstellbar.
   - (e) Zeitachse ehrlich zeigen:
     - Option „Zeit“ mit **einer** durchgehenden Zeitachse (ms-Lineal; Phasen nacheinander, Haltephase zum Sustain).
     - Zusammenziehen ist dann sichtbar.
     - Spur-Bereiche je Phase passend wählen: A 0,5 ms–5 s, D/R 3 ms–40 s, Snap-Zoom 2–300 ms per Doppeltipp.
   - (f) Klick-Warnung: Phasen unter 5 ms bei einem **Ausgang** markieren („klickt“).
3. **Haupt-Reiter HÜLLK. bei FM** (`subTabsFor`, Z. 13632; `pageEnv`, Z. 13813)
   - Bei fmAmp 0 die DX-Hüllkurven zeigen: Ausgänge (Lautstärke) und Modulatoren (Klangfarbe) als je eine Zeile.
   - Alternativ die VA-ADSR ausgrauen mit dem Text „wirkt nur bei Lautstärke-Form ADSR“ und dem Knopf „zu den Operator-Hüllkurven“.
   - Bei fmAmp 1 ein Band „ADSR liegt über dem ganzen FM-Klang“ anzeigen.
   - Den Sub-Reiter MOD bei FM in „MOD-HK (Route)“ umbenennen.
   - Migration FM2 (Z. 5196): fmAmp 1 nur behalten, wenn die alte ADSR wirklich formt. Sonst 0 setzen oder sichtbar anzeigen.
   - *Abnahme:* Tippen auf Form „Pluck“ bei fmAmp 0 ist nicht möglich oder erklärt sich selbst.
4. **Snap-Makro nur für Modulatoren** (`fmAdvance`, Z. 3195; `pageFmMakro`, Z. 14285)
   - Neuer Knopf „Biss“: R2/R3-Offset und optional L2-Offset nur für Nicht-Ausgänge.
   - „Länge“ und „Release“ wirken nur auf Ausgänge (oder getrennt beschriftet: „Länge Klang“ / „Länge Biss“).
   - *Abnahme:* Biss ±30 ändert den RMS bei 100 ms um < 1 dB, den Schwerpunkt bei 30 ms deutlich.
5. **OL-Fader lesbarer**
   - Skalenstriche bei I 0,5 / 1 / 2 / 4 / 8 rad am Modulator-Fader.
   - Oder ein Fader-Gesetz, bei dem 60 % des Wegs auf OL 60–99 liegen (gespeichert bleibt OL).
   - Hinweis „unter 60 kaum hörbar“.

**P2 – DX7-Treue der Engine**

6. **Pitch-EG** (fehlt im Format, im Worklet, nativ, im Import (Z. 15041) und in der Bedienung)
   - Format: `fm6.peg = {r[4], l[4]}` (L 50 = 0) und optional Tiefe.
   - Worklet: msfa `pitchenv.cc` portieren (`pitchenv_rate`, `pitchenv_tab`, `unit_ = N·2^24/(21,3·sr)`). Wirkung nur auf Verhältnis-Operatoren, Gate aus → Phase 4 (L4).
   - Nativ: über `detune`-Automation.
   - .syx-Import übernimmt Byte 102–109. Neue Seite „PITCH“ mit bipolaren Pegeln in HT.
   - *Abnahme:* Der PEG-Blip aus 3f trifft den DX7 auf ±0,1 HT; TAKE OFF beginnt +40 HT höher.
7. **Haltephase** (`ACCURATE_ENVELOPE`)
   - `statics[]` aus msfa `env.cc` in `fmAdvance`/`fmEnvStep` (Worklet), `envPlan` (nativ) und `FMH.segTime`/`envTimes` (Anzeige) übernehmen.
   - Bedingung: Ziel = Ist, oder Angriff mit L1 = 0.
   - *Abnahme:* Tabelle 3e (R2 50 → −6 dB nach 155 ms ±10 ms).
8. **DX-LFO und AMS je Operator**
   - Eigener FM-LFO mit msfa-`lfo.cc`-Raten, Delay und Wellenformen.
   - AMS 0–3 je Operator, Modulatoren eingeschlossen (`ampmodsenstab`).
   - Key-Sync-Schalter.
   - *Abnahme:* Stimmen mit AMS auf Modulatoren (12 %) wobbeln in der Klangfarbe.
9. **Nativer ECO-Pfad**
   - Prüfen, ob Xanders Gerät ihn je nutzt (ECO-Abzeichen).
   - Falls ja: FM-Klänge dort deutlich kennzeichnen. Feedback-Welle je Note mehrfach neu rechnen, oder FM nativ auf den 2-Operator-Kern beschränken.
   - *Abnahme:* Bei OL ≤ 85 stimmen Schwerpunkt und H2 auf ±3 dB.

**P3 – Kleinkram und Doku**

10. Die 12-s-Release-Kappe (Z. 2592) und die Normierung 0,5/√nCar dokumentieren. Bei Bank-Import gegen den DX7 eichen: alg 32 liegt relativ +7,8 dB höher.
11. Init-Operator mit R4 70 wie das Worklet-Init (Z. 2586), nicht 99. Oder Hinweis „Release 6 ms“.
12. Solo-Zustand auf der HÜLLK.-Seite deutlich anzeigen („Solo: OP 2 klingt als Ausgang“).
13. Negativen Anschlag (FM-X −7…+7) als Erweiterung von `vs` prüfen (siehe Schwesterbericht §3.4).

---

## 7. Dateien

| Was | Pfad (unter `scratchpad/v3-ideen/r8/`) |
|---|---|
| Bericht | `fm-diagnose.md` |
| msfa-Renderer (Quelle, Stubs, Binärdatei) | `ref/dx7render.cc`, `ref/src/`, `ref/bin/dx7render` |
| Original-msfa (Gegenprobe) | `dl/msfa-android/repo` |
| Mess-Bibliothek (Worklet-Shim, VCED, Analyse) | `tools/lib.mjs`, Playwright `tools/pw.mjs` |
| Messskripte | `tools/t0-init.mjs`, `m1-rom.mjs`, `m2-modcut.mjs`, `m3-native.mjs`, `m4-egtrace.mjs`, `m5-snap.mjs`, `m6-adsr.mjs`, `m7-stats.mjs`, `m8-hold.mjs`, `m8b-hold.mjs`, `m8c-holddata.mjs`, `m9-olmatch.mjs`, `m10-peg.mjs`, `m11-macro.mjs`, `m12-ratetab.mjs` |
| Bedien-Skripte | `tools/u1-envui.mjs`, `u2-envui.mjs`, `u3-op1default.mjs` |
| Messdaten | `data-m1-rom.json`, `data-m2-modcut.json`, `data-m3-native.json`, `data-m5-snap.json`, `data-m6-adsr.json`, `data-m8-hold.json`, `data-m9-olmatch.json`, `data-fmpluck.json` |
| Abbildungen | `shots/f1-snap-centroid.png`, `f1b-snap-rms.png`, `f2-adsr-on-fm.png`, `f3-lane-map.png`, `f4-ol-index.png`, `f5-static-hold.png` (Erzeuger `tools/figs.mjs`; ASCII `tools/ascii.mjs` → `tmp/ascii.txt`) |
| Screenshots | `shots/u1-01…06`, `u2-01…04`, `u3-01` |
| Hörproben | `tmp/b-modcut-v0a.wav`, `tmp/b-modcut-dx7.wav`, `tmp/snap-11-v0a.wav`, `tmp/snap-11-native.wav`, `tmp/snap-11-dx7.wav` |

## 8. Quellen

- Dexed, `Source/msfa` (env.cc, dx7note.cc, fm_core.cc, fm_op_kernel.cc, pitchenv.cc, lfo.cc), Commit `eebb748`: [github.com/asb2m10/dexed](https://github.com/asb2m10/dexed)
- music-synthesizer-for-android (Original-msfa, ROM1A): [github.com/google/music-synthesizer-for-android](https://github.com/google/music-synthesizer-for-android)
- Montage/MODX FM-X: Ausgangspegel 0–99 wie DX7, DX7-Maximalindex ≈ 13 rad (Forum, nicht amtlich): [yamahasynth.com – FM: how to calculate modulation index on Montage](https://yamahasynth.com/community/montage-series-synthesizers/fm-how-to-calculate-modulation-index-on-montage)
- Montage M, Spectral Form (Sine/All/Odd/Res, Skirt): [manual.yamaha.com – Montage M Operator-Parameter](https://manual.yamaha.com/mi/synth/montage_m/en/om02screenparameters0150.html); [yamahasynth.com – Manny's FM-Xplorations Article 1](https://yamahasynth.com/learn/modx-series-synthesizers/mannys-fmxplorations-article-1/)
- Stand der Technik und Rezepte: Schwesterbericht `r8/fm-huellkurven-recherche.md`
