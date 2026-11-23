# The Wall – Chor-Analyse für v12 (23.11.2026)

Messung: YIN-Tonhöhe (10 ms) aller trockenen Spuren aus projekt7, Töne ≥ 120 ms, Refrain 1–3 (je 32 s).
"Reibung" heißt: Halbton (kl. Sekunde/gr. Septime) oder Tritonus gegen den Lead-Ton bzw. Nicht-Akkordton mit einem Halbton-Nachbarn im Akkord.
Skripte: analyse/skripte/{f0,noten,proakkord,master,master2}.py. Daten: analyse/{f0.npz,noten.json,intervalle.json,master_profil.json}.

## 1. Was sind die „18 Chorstimmen“?

- **Nirgends belegt.** Die Bau-Skripte von v9–v11 sind verloren. Weder Funk, arbeitsstand, Ablage noch Werkstatt-Daten nennen eine Zahl 18.
- Als Rohmaterial gibt es nur **6 Begleitspuren**: Doppel, Terz drüber (aus Haupt), Terz drunter (aus Haupt), Gegengesang (Xander), KI-Terz drüber, KI-Terz drunter.
- Wahrscheinlichste Lesart: **v9 „großer Chor“ = 6 Quellen × 3 Kopien (L/Mitte/R)**. Im v9-Refrain liegt gegenüber dem Lead zusätzlich Energie bei −12 (Oktave tiefer), −8/−7 (Terz drüber eine Oktave tiefer bzw. Quinte drunter) und −4/−3 Halbtönen (alle Werte 2–4 % des Profils).
  - Vorbehalt: Das v9-Instrumental lässt sich nicht abziehen. Bass und Pads können −12/−7 mit erzeugen.
- **Echte Oktaven oder eigene Quinten-Spuren gibt es im Material nicht.** Quarten und Quinten kommen nur aus Xanders Gegengesang.
- v11 (Master minus v5-Instrumental):
  - Der Chor ist deutlich leiser als in v10. Der Terz-Anteil im Profil (+15/+16) fällt von 4,1 auf 1,9 %, also etwa −3 dB.
  - Der Chor ist schmal: Side/Mid im Refrain −13,7 dB (v10 −7,6 · v9 −5,1). v11 ist also ca. 6 dB schmaler als v10.
  - Hörbar sind vor allem Gegengesang-Intervalle (+5/−7/−5/+7) und Terzen.

## 2. Was jede Stimme macht (R1–R3, v7-Spuren)

| Stimme | Intervall zum Lead (Anteil Dauer) | Lage (MIDI-Median) | Reibung gegen Lead | Reibung gegen Akkord | Ton „zwischen zwei Tönen“ (> 35 Cent) | Pegel trocken (Lead −22 dBFS) |
|---|---|---|---|---|---|---|
| Lead Haupt | – | 55,9 (G3/Ab3) | – | 4 % | 7 % | −22 |
| Doppel | Prim 85 % · **gr. Septime drunter (= 1 Halbton tiefer) 14 %** | 55,7 | **13,5 %** | 7 % | 11 % | −26 |
| Terz drüber (aus Haupt) | gr. Terz 70 / kl. Terz 29 | 59,9 | 0 % | **28 %** | 4 % | −23 |
| Terz drunter (aus Haupt) | gr. Sexte drunter 70 / kl. 30 (also Terz drunter) | 53,0 | 0 % | **22 %** | 4 % | −24 |
| **Gegengesang Xander** | **Quarte drunter 36 · Quinte drunter 27** · gr. Sexte 7 · gr. Sekunde 7 | 49,5 (ca. 6 Halbtöne unter dem Lead) | 8,5 % | 20 % | **23 %** (ungestimmt; in v11 bis auf 4 von 89 Tönen gestimmt) | **−19** |
| KI-Terz drüber | gr. Terz 63 / kl. 30 | 60,0 | 0 % | **32 %** | 5 % | −16 |
| KI-Terz drunter | Terz drunter 90 | 53,2 | 0,6 % | 25 % | 8 % | −17 |

**Reibung gegen den Akkord je Akkord (Anteil der Dauer, R1–R3):**

| Stimme | Ebm | Gb | Db | Ab/C | Hauptursache |
|---|---|---|---|---|---|
| Lead | 8 | 0 | 3 | 3 | kurze Gleittöne |
| Terz drüber | 6 | **44** | **56** | 23 | Lead Ab → **C** über Db (gr. Septime) und über Gb (#11) · Lead Bb → **Db** über Ab/C |
| Terz drunter | **38** | **44** | 17 | 0 | Lead Ab → **F** über Ebm/Gb (reibt mit Gb) · Lead Bb → **Gb** über Db (reibt mit F) |
| KI-Terz drüber | 6 | **55** | **59** | 33 | wie Terz drüber |
| KI-Terz drunter | 36 | 35 | 26 | 5 | wie Terz drunter |
| Gegengesang | 20 | 0 | 32 | 11 | ungestimmte Töne D/A/B (zwischen Db und Eb) – in v11 korrigiert |
| Doppel | 1 | 0 | 9 | 15 | Doppel singt bei Db und Ab/C stellenweise einen Halbton tiefer als der Lead |

**Kern:** Die Melodie liegt zu 35 % auf **Ab**, das über Ebm, Gb und Db kein Akkordton ist (sus4 bzw. add9). Jede **parallele** Terz zu diesem Ab landet auf C oder F und reibt mit dem Akkord. Diese Dissonanzen kommen also von den Terzen, nicht von Xanders Gegengesang.

v11 hat die Terzen dem Akkord nachgeführt. Laut v11-Notiz reiben danach noch 26 statt 78 Töne. Die v11-Spuren sind verloren, deshalb lässt sich das hier nicht nachmessen.

## 3. Vergleich mit der 80er-Power-Pop-Praxis

**So machte man es** (Def Leppard/Mutt Lange, Bon Jovi, Journey, Europe):
- Wenige **konsonante** Stimmen (Unisono, akkordeigene Terz/Quinte, Oktave), jede **vielfach gedoppelt** und breit gestellt.
- Breite durch ADT oder Mikro-Pitch (H910/H3000, ±7–10 Cent, 10–25 ms).
- Der Chor-Bus ist hart komprimiert und nasser (Plate/Hall 2–2,5 s, 40–60 ms Vorverzögerung). Der Lead ist trockener, hat ein Delay und liegt vorn.
- Keine Halbtonreibung gegen den Lead. Über Sus- oder Durchgangstönen singt der Chor Akkordtöne oder pausiert.

**Unsere Spuren dagegen:**
- Die **Zahl** der Spuren (18) wäre für die 80er nicht ungewöhnlich, Lange stapelte noch mehr. Falsch waren **die Noten**, nämlich parallele Terzen über Ab.
- Hinzu kamen **doppelte Funktionen**: Terz und KI-Terz machen dasselbe mit fremder Stimmfarbe, und die Unterterz liegt in derselben Lage wie der Gegengesang.
- Der **Gegengesang war der leiseste Teil** (v8 −12 dB zum Lead).
- **Zu wenig Breite** in v11.

## 4. Stimmsatz-Empfehlung v12 (Refrains, Tag, Outro)

Pegel = RMS der Spur nach dem Fader gegenüber dem Lead. Achtung: Der Gegengesang ist trocken schon 3 dB lauter aufgenommen als der Lead. Ziel: Chor gesamt ca. −4 dB unter dem Lead, Gegengesang klar die zweitlauteste Stimme.

| # | Spur | Quelle | Tonhöhe | Pegel | Panorama | Status |
|---|---|---|---|---|---|---|
| 1 | Lead | Haupt v11 | – | 0 dB | Mitte | bleibt, eigener Kompressor (3:1, 3–4 dB) + Delay, Hall kürzer als der Chor |
| 2 | **Gegengesang** | Xander, Tonhöhe wie v11 (seine Töne) | Quarte/Quinte drunter; die 4 Rest-Töne „zwischen“ auf den nächsten Akkordton | **−5 dB** (v8: −12) | Mitte | **Fokus, +7 dB gegenüber v8** |
| 3–4 | Gegengesang-ADT | Kopie von 2, ±8 Cent, 15/22 ms | wie 2 | je −12 dB | L70/R70 | neu: Breite, ohne andere Noten |
| 5 | Doppel | Doppel v7 | **auf die Lead-Töne stimmen** (14 % liegen 1 Halbton tiefer), sonst stumm | −10 dB | Mitte | bleibt, korrigiert |
| 6–7 | Oberstimme | Terz drüber, **nur akkordeigen**: über Ebm wie bisher; über Gb/Db Lead Ab → **Db** (Quarte drüber); über Ab/C Lead Bb → **Eb** (Quarte drüber, Akkordton) | Terz oder Quarte drüber | je −14 dB | L60/R60 (L: Original, R: ADT ±8 Cent) | bleibt, umgestimmt, 5 dB leiser als in v8 (−9) |
| 8 | Unterstimme | Terz drunter, **nur in Ab/C-Takten** (dort 0 % Reibung) | Terz drunter | −16 dB | Mitte | stark reduziert |
| – | Terz drunter in Ebm/Gb/Db | | | weg | | doppelt die Lage des Gegengesangs und reibt 38–44 % |
| – | KI-Terz drüber/drunter | | | weg | | fremde Stimmfarbe, Kopien, 25–32 % Reibung |
| opt. | Oktave tiefer | Lead −12, formanterhaltend | | −18 dB | Mitte | nur als Hörprobe vorschlagen (80er-„Fülle“), nicht ungefragt |

- **8 Spuren statt 18**, musikalisch 3 Stimmen: Lead, Gegengesang, Oberstimme, dazu Doppel und Breite.
- Erwartete Reibung gegen den Akkord: Oberstimme 28 % → unter 5 %, Unterstimme 22 % → 0 %, Doppel 13,5 % → ca. 0 %. Übrig bleiben nur Gleittöne des Leads (4 %).
- **Mix:**
  - Chor-Bus getrennt vom Lead komprimieren (4:1, 5–6 dB, langsamer Attack), Hall nur auf dem Chor-Bus (Plate 2,2 s, 50 ms vor).
  - Dynamischer EQ auf dem Chor-Bus bei 1–4 kHz, gesteuert vom Lead (−2 dB): Der Lead bleibt vorn, ohne den Chor dünn zu machen.
  - Breite im Refrain: Side/Mid etwa −7 dB (v10-Niveau statt v11 −13,7).

## 5. Die Stelle „Open your eyes“ → „Siehst du mich nicht“ (217,8–221,4 s)

- Dort liegen noch drei Chor-Quellen:
  - Terz drüber/drunter aus Haupt enthalten den gesungenen Rest **und die Sprache**, tonhöhenverschoben (218,0–221,3 s).
  - KI-Terzen bei 218,18–221,03 s: eine Kopie aus R2/R3.
  - Gegengesang ZT-7 bei 219,58–221,39 s: eigenes Material.
- **v12:**
  - Alle Chorspuren von 217,8 bis 221,4 s stumm schalten. „Siehst du mich nicht“ (219,24–221,27 s) läuft dann allein, mit eigenem kurzem Raum.
  - Falls vor der Sprache ein Chor-„open your eyes“ gewünscht ist: dieselbe Zeile aus R1 (89,9 s, also −128,000 s) nehmen und bis 219,2 s ausblenden. Die Refrain-Chöre sind dort ohnehin identische Kopien.
