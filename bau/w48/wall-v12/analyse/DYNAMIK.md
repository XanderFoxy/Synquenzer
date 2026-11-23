# The Wall – Dynamik und Hall der Vocals (v11, mit v10 zum Vergleich), Empfehlung für v12

Skripte: wall-v12/analyse/skripte/d1–d6 · Zwischendaten: wall-v12/analyse/dyn/
Methode:
- Gesangsbus = Master minus v5-Instrumental (Stereo, Faktor je 0,25 s).
- Kette = Impulsantwort vom trockenen v11-Lead (wall/roh/ende.npy) zum Gesangsbus (Kreuzspektrum, Strophen und Refrains getrennt).
- Regelung = Lead-Anteil im Bus je 20 ms gegen den Eingangspegel.
- Die v11-Chorstems sind verloren, deshalb ist der Chor-Hall nicht direkt messbar.
- v9 lässt sich nicht trennen, weil es kein Instrumental-Stem gibt.

## 1. Messung: Woher die Kompression kommt

| | roh | v11 Lead trocken | v10 Bus | **v11 Bus** |
|---|---|---|---|---|
| Silbenspitzen p90–p10 (S1/R1/S2/R2/R3) | 11,1/7,9/13,9/10,1/6,3 | 9,7/11,3/14,5/8,3/5,5 | 5,2/5,1/6,0/4,9/5,1 | **4,8/6,4/6,7/3,6/5,0 dB** |
| 50-ms-Pegel-Spreizung p95–p10 (Mittel) | 14,8 | 17,8 | 8,3 | **10,5 dB** |

- **Die trockene Spur ist nicht platt.** Die Silbendynamik ist so groß wie in der Rohaufnahme, das Angleichen der Silben in v10 (±6 dB) hat nicht gequetscht. Im Bus ist sie **ungefähr halbiert** (≈ 10,6 → 5,3 dB).
- **Regelung am Lead in v11** (aus der Gesangskette):
  - Gain-Reduction im Median **−4,9 dB** beim Singen, **−8,2 dB** an den lautesten 5 %.
  - Kennlinie: Einsatz etwa 22 dB unter den Spitzen, danach wirkt sie wie 1,5:1 über einen langen Bereich (Fehler 1,2 dB).
  - Ausgangspegel je 3-dB-Eingangsstufe: 0 / 0 / −0,8 / −1,9 / −2,3 / −3,0 / −3,7 / −4,5 / −5,9 / −6,9 dB.
  - Zum Vergleich v10: −7,1 dB Median, −11,3 dB an den Spitzen, 2:1. v11 ist also schon weniger, aber immer noch zu viel.
- **Zeitverhalten:**
  - Vor dem Silbeneinsatz hält die Kette noch −3,2 dB, 70–100 ms nach dem Einsatz sind es −5,8 dB.
  - Attack also etwa 30–60 ms, Release ≥ 0,5 s. Die Kette kommt zwischen den Silben nie zurück und reitet als „Teppich“ durch. Das hört man als „sehr komprimiert“.
- **Summe/Master ist nicht die Ursache:**
  - Musik im Intro = v5-Master (−0,06 dB).
  - Sobald Gesang da ist, liegt die Musik bei −0,54 dB (leiser Gesang) bis −0,88 dB (lauter Gesang), Korrelation −0,57.
  - Schwankung nur 0,18 dB je 0,25 s, also kein hörbares Pumpen. In v10 waren es noch −0,26 → −1,26 dB.
  - Der Summenlimiter trägt also höchstens ≈ 0,4 dB dynamisch zur Gesangsdynamik bei, **≈ 90 % kommen aus der Gesangskette.**
  - Master v11: −10,0 LUFS, −1,2 dBTP, PLR 8,8 dB (Instrumental allein −10,9 LUFS, PLR 10,5 dB). v9 und v10 liegen gleich.

## 2. Messung: Hall am Lead (v11)

- **Hall+Delay/Direkt −10,1 dB (Strophe) bzw. −10,3 dB (Refrain), also identisch.** Der Refrain bekommt am Lead keinen extra „80er“-Raum. v10 lag bei −5,0/−5,5 dB.
- **Hall:**
  - Diffuser Anteil ab ≈ 20 ms, das entspricht einer **Vorverzögerung von nur ≈ 15–20 ms**. Dichtemaximum bei 30–50 ms (−20 dB/10 ms).
  - **RT60 ≈ 1,25–1,3 s** (v10 1,4 s).
  - Breite Fahne: Seiten-/Mittenanteil S/M 0,6.
- **Delay:** Viertel (500 ms), Echos bei 0,5 s (−25) und 1,0 s (−30 dB/10 ms). In v10 war das Echo bei 0,5 s mit −12 dB deutlich lauter.
- **Klang der Fahne (Hall/Direkt je Band):** 150–400 Hz −12 · 400 Hz–1,5 kHz −26 · 1,5–5 kHz −19 · 5–11 kHz −11 dB.
  Die Fahne ist also **dröhnig unten und zischelig oben**, in der Mitte dünn: Die Zischlaute laufen in den Hall.
- **Urteil:**
  - Die Menge am Lead ist nicht zu viel (−10 dB, 1,3 s). Das „zu viel Hall“ kommt von der **Form**: Die kurze Vorverzögerung legt den Hall auf die Konsonanten (verwischt), und die ungefilterten Tiefen und Höhen machen Mulm und Zischen.
  - Dazu kommt sehr wahrscheinlich der **Chor**. In v8 hatte jede Chorspur ihr eigenes RoomWorks plus Kompressor. Bei vielen Stimmen mit je eigenem Hall summiert sich der Hall um ≈ 10·log10(n) dB: bei 18 Stimmen +12,6 dB gegenüber einer Stimme. In v11 ist das nicht direkt messbar, weil die Stems verloren sind.

## 3. Empfehlung v12 – getrennt je Spur

**Lead (Haupt)**, Ziel ≤ 3–4 dB GR an den Spitzen, Median ≈ 1,5–2 dB (heute 4,9/8,2 dB):
- Silbenpegel-Angleichung aus v10 behalten, nichts weiter fahren.
- Stufe 1, Spitzen fangen (FET-artig): 3:1, Attack 5 ms, Release 60–80 ms, nur 1–2 dB auf Spitzen.
- Stufe 2, Glätten (Opto-artig): 2:1, Soft Knee 6 dB, Attack 20–30 ms, Release 150–250 ms, Median 1–2 dB.
- Danach De-Esser 5,5–8 kHz, −3 bis −4 dB, vor dem Hall-Send.
- Parallel nur falls der Refrain zu dünn wirkt: Bus 8:1, Attack 1 ms, Release 100 ms, 10–12 dB GR, 12–15 dB unter dem Lead beimischen. Erst Automation probieren: Refrain-Lead +1 dB.

**Gegengesang (Xander, Fokus):**
- Eigene Kette 2:1, Attack 20 ms, Release 150 ms, GR 2–3 dB, HP 120 Hz.
- Pegel **4–6 dB unter dem Lead** (v8: −12 dB, die leiseste Chorspur). Mitte oder leicht gespreizt.

**Chor-Bus (Terzen usw.):**
- Einzelstimmen ohne oder mit sehr leichter Kompression.
- Auf den **Bus** (80er-Standard: dichter Hintergrund): 3–4:1, Attack 10–20 ms, Release 100–200 ms, 4–6 dB GR. Hier ist das erlaubt, weil es Hintergrund ist.
- HP 180–200 Hz, −2 bis −3 dB bei 2–4 kHz (Platz für den Lead), De-Esser kräftig.
- Sidechain vom Lead auf den Chor-Bus −1,5 bis −2 dB, damit der Lead führt.

**Summe:**
- „Master nur auf der Musik“ beibehalten. End-Limiter höchstens 1 dB GR, Ziel weiter −10 LUFS / −1 dBTP.
- Prüfen, dass die Musik im Refrain höchstens ≈ 1 dB weicht (heute 0,9 dB, ok).

**Hall (ein gemeinsamer Hall je Gruppe, nicht je Spur):**
- **Lead:** Plate 1,6–1,8 s im Refrain, 1,2–1,4 s in der Strophe (oder gleiche Plate, Send in der Strophe −3 dB). **Vorverzögerung 60–90 ms** (62,5 ms = 1/32 bei 120 BPM). Rücklauf HP 350 Hz, LP 7 kHz, Send entzischt. Hall/Direkt −11 dB im Refrain, −14 dB in der Strophe. Hall-Rücklauf vom Lead 2–3 dB ducken.
- **Delay Lead:** Viertel 500 ms (oder punktierte Achtel 375 ms). Gefiltert 300 Hz–5 kHz, Feedback 15–20 %, ≈ −22 dB, per Automation nur an den Zeilenenden.
- **Chor und Gegengesang:** gemeinsamer Hall-Bus, Plate/Hall 2,0–2,4 s, Vorverzögerung 30–40 ms, HP 400 Hz, LP 6 kHz.
  - Nasser als der Lead: Chor Hall/Direkt −6 bis −8 dB, Gegengesang −8 dB.
  - So bekommt der Refrain die 80er-Größe aus dem Hintergrund, während der Lead trocken und vorn bleibt.
