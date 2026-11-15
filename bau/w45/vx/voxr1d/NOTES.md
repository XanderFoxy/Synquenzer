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
   Startwert: Gewicht σ²/τk², σ² = Rest eines ersten Fits, τk² = (0,3·max|c|)² + |cR − cL|² (ungleiche Ränder → die Lücke entscheidet).
4. Neu gebaut wird nur der Teilton-Anteil; danach **nie lauter als vorher** (gleitende Energie ≈ 6 ms höchstens die des Tiefbands an der Stelle).
   Stärke wie bisher (50 % → Rest −24 dB), Übergänge Catmull-Rom wie bisher.

## Messwerte (vorher = voxr1c, nachher = voxr1d)
| Messung (Ziel) | vorher | nachher |
|---|---|---|
| Prüfer-Kern B@44 Abzug ≥ 12 dB | 8/10 (10,2 · 4,6) | **10/10** (15,2 … 23,2) |
| Prüfer-Kern B@44 Obertöne ≤ 1 dB | 6/10 (−3,06 · −3,58) | **10/10** (max −0,81) |
| Prüfer-Kern C@48 Abzug ≥ 12 dB | 8/10 (5,6 · 8,8) | **10/10** (15,7 … 23,8) |
| Prüfer-Kern C@48 Obertöne ≤ 1 dB | 7/10 (−9,03 · −2,85 · −1,69) | **9/10** (offen: 8,93 s, f0 211 Hz, −2,39) |
| Nachbau B@48 (gleiche Stoß-Art) Abzug / Obertöne | 7/10 · 6/10 | **10/10 · 10/10** |
| Nachbau C@44 Abzug / Obertöne | 9/10 · 7/10 | **10/10 · 9/10** (offen: 8,93 s, −2,0) |
| Gefunden / Fehlalarme (alle 4) | 10/10, 0 | 10/10, 0 (Erkennung unverändert) |
| Außerhalb der Funde bitgleich | ja | ja |
| Vor-Echo sauberer Take A@44 (je Fund, Rahmen 23 ms) | 2 Stellen, bis **+15,3 dB** gesamt / +13,5 dB tief | **0**: gesamt max 0,0 dB, Tiefband max +0,5 dB |
| Vor-Echo sauberer Take A@48 | 4 Stellen, bis +11,0 / +11,1 dB, 1× redDb −1,7 | Tiefband max **+0,2 dB**; gesamt 1 Rahmen +1,3 dB (4,34 s, Kreuzterm Tief/Hoch, Tiefband dort +0,1) |
| Prüfer-Kern „mittel“ sauberer Take A@48 (≤ 1 % Rahmen > 0,5 dB) | FEHLER 44/4196, max 6,17 | **OK 10/4196**, max 4,03 |
| Prüfer-Kern gesamt | 49/60 | **53/60** |
| Kette 3 min (Node), Median × 3 ≤ 20 s | 5,54 s → 16,6 s | 5,96 s → 17,9 s |

## Nicht behoben (offen)
- C 8,93 s (f0 197 → 212 Hz in der Lücke, Grundton dominiert die Stimme): Obertöne −2,4 dB (48 kHz) / −2,0 dB (44,1 kHz). Phase/Hüllkurve des
  2. Obertons (≈ 420 Hz) passt dort nicht zum Grundton; Ränder mitmessen, kürzere/längere Fenster, 400 Hz als Oberton-Grenze brachten nichts.
- „Sauberer Take A@48: 0 Plopps“ bleibt FEHLER im Prüfer-Kern (15 eigene Tiefstöße des Takes, siehe VOXR1B – Erkennung nicht Teil dieses Schritts).
- Raumton (5 Punkte im Prüfer-Kern) unverändert offen (nicht Teil dieses Schritts).
- Plopp-Schritt kostet je Stelle mehr (Demodulation + Fit): 3-min-Kette +0,4 s je Lauf.
