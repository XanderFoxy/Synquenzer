# The Wall v13 – Timing Haupt + Doppel (Messung)

Stand 24.11.2026 · Agent „timing“ · Bau `bau/timing_v13.py` · Daten `analyse/timing_mess.json`. Messwerte, kein Hör-Urteil.

## Quellen
- **Haupt:** `projekt7/Haupt-3-trocken-v7.wav` (24 bit, trocken, v6-gestimmt). Nicht die 128-kbit-MP3 (`ende`).
  - Die Tonhöhe von v7 und v12 ist fast überall gleich (±10 Cent gemessen bei Who/see/no).
  - Ausnahme: Die v10-Retusche „Who“ in R2 (v10-07) fehlt, weil sie nur in der MP3 steckt.
- **Doppel:** `wall-v12/bau/stimmen/doppel_t.wav`. Das ist das v7-Doppel (24 bit), in v12 per rubberband auf die Haupt gestimmt. Die Stimmung bleibt also erhalten.
- **Anker in der Quelle:**
  - Haupt: Hüllkurven-Ausrichtung E5-trocken (gleiche Zeit wie die Rohaufnahme, ±1 ms) gegen v7, je Silbe. Median r = 0,98. „tised“ und „it“ habe ich von Hand gesetzt.
  - Doppel: Abstimmung aus 4 Messungen (Hüllkurve zur Haupt, Hüllkurve zur Doppel-Rohaufnahme, Einsatz-Detektor, Onset-Korrelation). Ein Anker kommt nur zustande, wenn mindestens 3 Messungen auf ±20 ms übereinstimmen.

## Verfahren (`bau/t_warp.py`)
- Die Ausgabe besteht nur aus Original-Abtastwerten. Es gibt keinen Phasenvocoder.
- **Dehnen/Stauchen** geschieht nur auf drei Wegen:
  - im stimmhaften Vokal, indem ganze Grundperioden wiederholt oder ausgelassen werden (Sprung an einem steigenden Nulldurchgang, Weite per Korrelation, Blende 8–16 ms),
  - in Pausen (Stille, Blende 5 ms),
  - im Atem (höchstens ±50 %).
- **Starr verschoben (bitgleich)** wird der Anlaut bis zur Spitze + 25 ms:
  - bei stimmlosem Anlaut (s, t, k, p, f, sch, h) der ganze stimmlose Teil,
  - bei see/sake/your der ganze Vorlauf.
- Die gesprochenen Zwischenteil-Wörter bleiben starr an ihrer Lage.

## Ergebnis Haupt (143 Silben, Transienten-Spitze gegen Ziel)
| | gegen Zielkarte | gegen v13-Ziel (3 Ausnahmen, s. u.) |
|---|---|---|
| v12 | {'n': 143, 'median': 16.0, 'p95': 74.8, 'max': 174.0} | – |
| v13 (Lage aus der Schnittkarte) | {'n': 143, 'median': 1.2, 'p95': 5.4, 'max': 126.3} | Median 1.2 · 95 % 3.7 · Max 40.6 ms |
| v13 (Detektor im fertigen Audio) | {'n': 143, 'median': 5.0, 'p95': 40.8, 'max': 128.0} | Median 5.0 · 95 % 36.8 · Max 57.0 ms |

Zum Detektor: Bei a, thing, lieve, low (2×) misst er im fertigen Audio 40–55 ms Abweichung, die Schnittkarte aber 1–3 ms. Das liegt daran, dass der Detektor bei weichen Einsätzen einen anderen Anstieg erwischt; es ist kein Versatz. Nicht sicher, bitte hören.

**Abweichungen von der Zielkarte (bewusst):**
- **ti:** 27 statt 26 (115,375 statt 115,250). Für 26 müsste no→ti auf 0,71× gestaucht und ti→sed auf 1,39× gedehnt werden, beides außerhalb von 0,8–1,25. Nach Xanders Regel („mehr Silben → im Ursprung lassen, nichts künstlich stretchen“) bleibt ti am nächsten 16tel zu seinem Ursprung (Original 26,8).
- **world (S1) und so (S2):** 17 statt 16. world→16 bräuchte 1,41×, so→16 würde das s von „is“ stauchen. Beide sind im Original spät (17,5 / 16,9). Ich setze beide gleich auf 17, damit „SO auf WORLD“ stimmt.
- Unsicher: Hört Xander lieber 16 (Taktstrich), muss die Silbe davor geschnitten werden. Das habe ich nicht gemacht.

**there is so much more to see** (Ziel → v13, v12 in Klammern):
- there: Ziel 104.000 · v13 104.000 (+0 ms) · v12 103.996 (-4 ms zur Zielkarte)
- is: Ziel 104.750 · v13 104.750 (+0 ms) · v12 104.749 (-1 ms zur Zielkarte)
- so: Ziel 106.125 · v13 106.122 (-3 ms) · v12 106.002 (+2 ms zur Zielkarte)
- much: Ziel 106.750 · v13 106.752 (+2 ms) · v12 106.725 (-25 ms zur Zielkarte)
- more: Ziel 108.000 · v13 108.000 (+0 ms) · v12 107.993 (-7 ms zur Zielkarte)
- to: Ziel 108.750 · v13 108.750 (-0 ms) · v12 108.742 (-8 ms zur Zielkarte)
- see: Ziel 110.000 · v13 110.001 (+1 ms) · v12 110.167 (+167 ms zur Zielkarte)

**are we hypnotized:**
- Are: Ziel 112.000 · v13 112.000 (+0 ms) · v12 112.0 (+0 ms zur Zielkarte)
- we: Ziel 112.750 · v13 112.749 (-1 ms) · v12 112.78 (+30 ms zur Zielkarte)
- hyp: Ziel 114.000 · v13 113.999 (-1 ms) · v12 113.996 (-4 ms zur Zielkarte)
- no: Ziel 114.750 · v13 114.751 (+1 ms) · v12 114.74 (-10 ms zur Zielkarte)
- ti: Ziel 115.375 · v13 115.376 (+1 ms) · v12 115.42 (+170 ms zur Zielkarte)
- tised: Ziel 116.000 · v13 115.994 (-6 ms) · v12 115.982 (-18 ms zur Zielkarte)

**s in „see“:**
- Original 0.200 s, v12 0.418 s, v13 0.200 s (bitgleich aus v7).
- s-Beginn 109.632, Akzent 110.000 auf dem Taktstrich T56.

**Dehnfaktoren je Abschnitt** (Vokal-Läufe):
- Haupt: n=137, min 0.799, p5 0.822, Median 0.994, p95 1.147, max 1.249.
- Doppel: n=58, min 0.807, max 1.221.
- Verteilung Haupt (0,75–1,30 in 0,05-Schritten): [1, 11, 13, 17, 27, 35, 22, 4, 2, 5, 0].

**Spleiße:**
- Haupt 496, Wellenform-Korrelation Median 0.977, min 0.608.
- Doppel 151, Median 0.979.

**Nicht ganz erreicht** (Rest > 5 ms, Grenze 0,8–1,25 greift): H-049 +41 ms, H-066 +6 ms, H-075 -7 ms, H-125 -34 ms, H-155 +23 ms.
- H-049 und H-155 sind „eyes“ in R1 und R3: Ziel 32 verlangt +105 ms, erreicht ist es bis auf −41 bzw. −23 ms.
- H-125 ist „auf“ im Zwischenteil: −34 ms.

## Pegel / Transienten Haupt
- **Silben angeglichen:** je Silbe die halbe Abweichung zum Median des Teils, höchstens ±6 dB. Die Korrekturen liegen bei p5/p95 [-1.97, 3.0] dB, max 4.61 dB.
- **Pausen:** Expander unter −55 dBFS, bis −10 dB.
- **Spitzen:** weich begrenzt über aktivem Pegel + 14 dB, Schwelle -8.9 dBFS. Das greift in 1.6 % der aktiven Zeit mit mehr als 1 dB, max 8.6 dB.
- **„Open your eyes“-Rest im Zwischenteil** stumm (217,90–219,78), wie in v11/v12.

## Doppel
- 75 von 143 Silben sind sicher verankert. Doppel minus Haupt: min 5.8, Median 10.0, max 13.0 ms. Es liegt also nie früher und 5–15 ms später.
- Die übrigen 68 Silben haben keinen eindeutigen Anker (die Messungen widersprechen sich). Sie folgen ihren Nachbar-Ankern. Ob sie dort genau auf der Haupt liegen, ist **nicht sicher**.
