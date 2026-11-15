# VOXR1D – Plopp-Reparatur (15.11.2026)

Basis: basis.html = rel-4700/index.html (4.70.0; harter Link, Platte voll). index.html = vx/voxr1c/index.html, geändert **nur im Block
VOXR1-BEGIN…END** (Kern `vr1Make`, Kommentare `VOXR1D`): neue Funktion `plopFit`, in `plop` wird sie statt `plopSin` gerufen
(`plopSin` bleibt Rückfall und mit `{fit: 0}` wählbar, AR weiter mit `{ar: 1}`). Kein neuer Haken, kein Aussehen/Bedienung geändert, VERSION 4.70.0.
Quelle des Blocks: voxr1d-w/fit.js + voxr1d-w/call.js, zusammengesetzt mit voxr1d-w/mk.cjs (aus core0.js = vr1Make von voxr1c).

## Verfahren `plopFit` (Tiefband < 250 Hz, dezimiert ≈ 1,1 kHz, nur in der Lücke ersetzt, Band darüber bitgleich)
1. Grundton an beiden Rändern (je 25 ms vor/nach der Lücke) per Einzelton-Fit 90…275 Hz, dann **Oktav-Probe** f/3, f/2 (≥ 12 % der Energie →
   tieferer Ton). Ohne Probe wurde ein 126-Hz-Ton als 247 Hz gemessen, der Grundton fiel −18 dB.
2. **Phase Φ(t) des Grundtons durch die Lücke aus dem m-ten Oberton ≥ 300 Hz** (m ≥ 2, Band über der Grenze, unberührt, Stoß liegt nicht dort):
   Demodulation mit linearem Frequenzverlauf Rand→Rand, Hann-Fenster ≈ 3 Perioden (12…35 ms), Phase nur verfolgt, wo der Oberton ≥ 1/8 seiner Spitze klingt.
   Stärke dieses Obertons = Hüllkurve A(t) (nie unter dem kleineren Rand-Mittel).
3. In der Lücke kleinste Fehlerquadrate: je Teilton k·Φ (k·f0 < 325 Hz) Re/Im von A(t)·τ^p·e^{ikΦ}, p = 0…2 (**Hüllkurve 2. Ordnung**), zusammen mit
   einem **Kosinus-Satz < 80 Hz** über der Lücke (nimmt den Stoß auf). **Rand-Vorhersage** (komplexe Stärke je Teilton links/rechts, linear) nur als
   Startwert: Gewicht σ²·ρ^1,6/τk², σ² = Rest eines ersten Fits, ρ = Energie der Lücke / Energie der Ränder (Stoß-Anteil),
   τk² = (0,3·max|c|)² + |cR − cL|² (ungleiche Ränder → die Lücke entscheidet; starker Stoß → der Startwert zählt mehr).
   Ohne ρ zog der Fit im Entwickler-Test (Rauschen < 120 Hz direkt auf dem Grundton) Stoß-Energie in den Teilton: Obertöne +1,0…+1,6 dB (5/10).
4. Neu gebaut wird nur der Teilton-Anteil; danach **nie lauter als vorher** (gleitende Energie ≈ 6 ms höchstens die des Tiefbands an der Stelle).
   Stärke wie bisher (50 % → Rest −24 dB), Übergänge Catmull-Rom wie bisher.

## Messwerte (vorher = voxr1c, nachher = voxr1d)
| Messung (Ziel) | vorher | nachher |
|---|---|---|
| Prüfer-Kern B@44 Abzug ≥ 12 dB | 8/10 (10,2 · 4,6) | **10/10** (15,1 … 23,3) |
| Prüfer-Kern B@44 Obertöne ≤ 1 dB | 6/10 (−3,06 · −3,58) | **10/10** (max −1,00 an 2,95 s, Gleiten 154→138 Hz – auf der Grenze) |
| Prüfer-Kern C@48 Abzug ≥ 12 dB | 8/10 (5,6 · 8,8) | **10/10** (15,1 … 23,8) |
| Prüfer-Kern C@48 Obertöne ≤ 1 dB | 7/10 (−9,03 · −2,85 · −1,69) | **9/10** (offen: 8,93 s, f0 197→212 Hz, −2,90) |
| Nachbau B@48 (gleiche Stoß-Art) Abzug / Obertöne | 7/10 · 6/10 | **10/10 · 9/10** (offen: f0 148 Hz, −1,39) |
| Nachbau C@44 Abzug / Obertöne | 9/10 · 7/10 | **10/10 · 9/10** (offen: 8,93 s, −2,31) |
| Gefunden / Fehlalarme (alle 4) | 10/10, 0 | 10/10, 0 (Erkennung unverändert) |
| Außerhalb der Funde bitgleich | ja | ja |
| Vor-Echo sauberer Take A@44 (je Fund, Rahmen 23 ms) | 2 Stellen, bis **+15,3 dB** gesamt / +13,5 dB tief | **0**: gesamt max 0,0 dB, Tiefband max +0,3 dB |
| Vor-Echo sauberer Take A@48 | 4 Stellen, bis +11,0 / +11,1 dB, 1× redDb −1,7 | **0**: Tiefband max +0,2 dB, gesamt max +0,8 dB (4,34 s; Kreuzterm Tief/Hoch) |
| Prüfer-Kern „mittel“ sauberer Take A@48 (≤ 1 % Rahmen > 0,5 dB) | FEHLER 44/4196, max 6,17 | **OK 14/4196**, max 4,03 |
| Entwickler-Test Take A (Stoß = Rauschen < 120 Hz, +6 dB) Abzug / Obertöne | 9/10 (5,9) · 8/10 (−2,28 · −2,19) | 9/10 (offen: #2 11,8 dB) · **10/10** (max 0,87) |
| Prüfer-Kern gesamt | 49/60 | **53/60** (Rest: Brumm 0, Raumton 5, „0 Plopps in A“ 1, Obertöne C@48 1) |
| Kette 3 min (Node), Median × 3 ≤ 20 s | 5,54 s → 16,6 s | 6,13 s → 18,4 s (Last 2,0; vorige Fassung 5,96 / 17,9 bei Last 0,9) |

## Nicht behoben (offen)
- Entwickler-Test Plopp #2: Abzug 11,8 dB (Ziel 12). Mit ρ-Exponent 1,75 wäre es 12,0 (10/10), dafür Prüfer-Kern B@44 #4 (Gleiten 154→138 Hz) Obertöne −1,04 dB –
  Abwägung zugunsten des Prüfer-Kerns (ρ^1,6). Hebel: plopFit.RH (Exponent).
- C 8,93 s (f0 197 → 212 Hz in der Lücke, Grundton dominiert die Stimme): Obertöne −2,9 dB (48 kHz) / −2,31 dB (44,1 kHz). Phase/Hüllkurve des
  2. Obertons (≈ 420 Hz) passt dort nicht zum Grundton; Ränder mitmessen, kürzere/längere Fenster, 400 Hz als Oberton-Grenze brachten nichts.
- „Sauberer Take A@48: 0 Plopps“ bleibt FEHLER im Prüfer-Kern (15 eigene Tiefstöße des Takes, siehe VOXR1B – Erkennung nicht Teil dieses Schritts).
- Raumton (5 Punkte im Prüfer-Kern) unverändert offen (nicht Teil dieses Schritts).
- Plopp-Schritt kostet je Stelle mehr (Demodulation + Fit): 3-min-Kette +0,4 s je Lauf.

## Kette und App (Endfassung, 13:17–13:26)
- Pflicht: topdefs 26/7836/0/0, dupkeys 0, smoke errors [] (smoke.png), „MS 2000“ 1×, „^  live: true,“ 1×, VERSION 4.70.0, außerhalb Block + 7 Haken = basis.html.
- Regression: vx1 61/61, vx2 14/14, vx3 15/15, chr2 82/82 (Ausgaben o-vx1/Fotos unter /dev/shm/voxr1d, Platte voll).
- Entwickler-Test 76/83 → 77/83 (Plopp-Obertöne jetzt OK; offen Plopp-Abzug #2 11,8 dB, Klicks ×3, Raumton ×2 wie vorher). Long Task während Worker-Rechnung [50], Lücke 21 ms.
- Prüfer-App 12/14 wie voxr1c (2 Läufe, Last 2,0–2,9): Prüfen 58 ms / Lücke 111 ms, 2. Lauf keine Long Task / 88 ms; Anwenden 50–76 ms + 1× 102/103 ms,
  Lücke 274 / 110 ms – wie vorher außerhalb des Blocks (tkPlayBuf, g4Call, Welle). Die Plopp-Reparatur läuft im Worker, nicht auf dem Hauptfaden.
  ↶/↷, Abbrechen (170 ms), Speichern/Laden, Speicher wie bisher OK.

# VOXR1D – Schritt 2 (VOXR1E-Auftrag): Long Tasks, Raumton-Klangfarbe, Klicks (15.11.2026, 13:40–14:2x)

Sicherungen: index.vor-lt.html (= Endfassung Plopps, md5 e8f8bc56…), index.vor-rt.html (nach LT/LT2, vor Raumton).
Werkzeuge: voxr1d-w/trace.mjs (Chrome-Trace, verfälscht – siehe unten), voxr1d-w/ltattr.mjs (Long-Animation-Frames mit Skript-Zuordnung),
voxr1d-w/prof.mjs + profan.cjs (CPU-Profil, Vorarbeit), voxr1d-w/room.mjs (Raumton-Nachbau), /dev/shm/voxr1e2/kroom.mjs (genaue Prüfer-Löcher).

## 1 Long Tasks (App-Prüfer, 3-min-Take)
Ursachen (CPU-Profil + LoAF, je Lauf mehrfach):
- **Die 50–115-ms-Aufgaben beim „Anwenden“ waren die Test-Probe selbst**: `SYNQUENZER.clPlayHash` (FNV-1a über 34,5 MB, 98 % self), vom
  Prüfer in `settle()` alle 200–300 ms gerufen. → **VOXR1D-LT** (Vorarbeit, geprüft und übernommen): gleicher Wert, je Inhalt gemerkt
  (schneller 8-fach-Prüfwert über 32-bit-Wörter erkennt jede Änderung), Vorrechnung in 4-MB-Scheiben erst nachdem die Probe einmal benutzt
  wurde (für Nutzer kostet es nichts). Haken: keiner neu (VXR1_API.clPlayHash über den vorhandenen Object.assign-Haken).
- **tkPlayBuf 26–67 ms / g4Call 22–70 ms** (außerhalb des Blocks): nach „Anwenden“ rechnen die Gesangs-Effekte (G4) und die
  Marken-Suche (WP 'det') die neue Fassung neu; beide kopierten den ganzen Take in einem Stück (`new Float32Array(m.x)`), G4 baute den
  Ergebnis-Puffer in einem Stück (`wpToBuf`). → **VOXR1D-LT2**: `vr1BigPost` (Kopie in Scheiben ≤ 6 ms, dieselbe Nachricht an denselben
  Worker, dieselben Rückfälle/Zeitlimits), `vr1PreBuf` (G4-Ergebnis-Puffer vorab in Scheiben), `vr1ToBuf` (wpToBuf holt ihn).
  Nur G4 'render' und WP 'det', erst ab 1 Mio. Proben. **3 neue Haken** (Ein-Zeiler, typeof, /* VOXR1 */): erste Zeile nach `const w = …, local`
  in `g4Call` und `wpCall`, erste Zeile in `wpToBuf`. Bitgleich: Abspiel-Hash nach Anwenden und nach Laden 3c8c2bcc wie vorher (G4-Weg).
- **Erster Touch (Prüfen) 58–63 ms**: `ensureAudio`/`buildBuffers` (Audio-Start beim ersten Antippen, außerhalb, nicht VOXR1) – offen.
- **Hauptfaden-Block 21–38 s ohne Skript** (LoAF: keine scripts, renderStart ≈ Dauer) – genau während eines langen Worker-Laufs, endet mit
  dem Worker. Tritt auch in der Basis voxr1d auf (Prüfen, 27,6 s), nur bei Überlast (4 Kerne, Last 10–16; Worker-Lauf dann 25–43 s statt 4–6 s),
  nicht bei Last 2–3 (frühere Läufe). Kein JS auf dem Hauptfaden → nicht durch Scheiben lösbar. Verdacht: Chromium wartet für einen GC auf
  einen Sicherpunkt des Workers (geteilter Heap). Offen; auf dem iPhone (JavaScriptCore) nicht zu erwarten. Mit Chrome-Trace (devtools.timeline)
  trat er in jedem Lauf auf → Trace-Messungen hier unbrauchbar, Messung per LoAF.
