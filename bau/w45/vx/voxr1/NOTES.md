# VOX-R1 „Gesang reinigen – Grundstufe“ · Teil 1/3 (Plan-Schritte 1–3)

## Gebaut (Block VOXR1, nichts Sichtbares geändert)
- **Kern `vr1Make()`** (ohne DOM, in Node prüfbar, im Worker als Blob): jeder Schritt ein Generator mit Fortschritt; Blöcke à 16 384 Samples.
  Worker: läuft durch, meldet Fortschritt alle ≥ 60 ms; **Abbruch = Worker beenden** (wirkt sofort, nächster Auftrag startet neuen Worker).
  Rückfall Hauptfaden: Scheiben ≤ 8 ms (`setTimeout`), gleiches Ergebnis bitgleich.
- **0 Prüfen** `check(x, sr)`: Übersteuerung (Läufe ≥ 2 Samples), Spitze, Rauschboden, Abstand, **Brumm 50/60 Hz** (ruhigster 10-s-Ausschnitt,
  dezimiert auf ≈ 2,6 kHz, Goertzel mit Hann, Grundton auf ±0,001 Hz, Zahl der Obertöne bis 16), **Plopp-Kandidaten**, **Klick-Kandidaten**
  (Spitze > 2 kHz ≥ 16 dB über örtlichem Mittel), **Atmer-Kandidaten** (leise, kaum < 300 Hz, 1–6 kHz, 120–900 ms), **Zisch-Anteil** > 5 kHz.
  Befund-Zeile z. B. „30 Klicks · 4 Plopps · Brumm 50 Hz · Raumton −57 dB“. Klicks/Atmer sind hier nur Kandidaten (Feinarbeit Teil 2).
- **5 Brummen** `hum`: Kerben mit begrenzter Tiefe (H = g + (1 − g)·Kerbe), −30 dB bis zum 7. Oberton, darüber flacher (bis −15 dB beim 16.),
  Güte 30·√k (im Gesangsband schmaler). **Live-fähig:** `vr1HumLive(ctx, {f0, n})` baut dieselben Biquads als IIRFilterNode-Kette
  (Rückfall BiquadFilterNode „notch“); Abweichung zum Kern 7·10⁻⁹.
- **6 Hochpass 80 Hz** rückt hinter Plopps und Brummen: feste Reihenfolge `VXR1_ORDER = plop → hum → hp` (gleiche Plopps wie allein).
- **4 Plopps** `plopFind` + `plop`: Sprung von (< 150 Hz − 300…3000 Hz) gegen beide Seiten (250…30 ms davor, 100…300 ms danach),
  20–100 ms; Reparatur nur unter der Grenze (250 Hz): nullphasiger Tiefpass, tiefes Band dezimiert (≈ 1,1 kHz), über dem Stoß per
  AR-Interpolation (Ordnung 40, kleinste Fehlerquadrate) neu berechnet, Stärke 50 % = Stoß-Rest −24 dB. Band über der Grenze und alles
  außerhalb der Stöße bleibt bitgleich.
- API: `SYNQUENZER.vr1Check(id)`, `vr1Run(id, {steps})`, `vr1Abort()`, `vr1Info()`; Test-Zugang `window.__vr1`. Ergebnis = neue Fassung
  (Float32), der Roh-Take bleibt unberührt.

## Messwerte (echter Gesangs-Take A, 33 s, 44,1 kHz; Fehler synthetisch eingesetzt)
- Brumm 50 Hz + 6 Obertöne, −20 dB unter dem Gesang: erkannt 50,0009 Hz, 7 Kerben je **−30,0 dB**; Gesangsband 200 Hz–4 kHz **−0,11 dB**.
- Brumm 60 Hz: erkannt 59,999 Hz, Kerben **−30,0 … −30,2 dB**; Gesangsband **−0,09 dB**. Ohne Brumm: kein Brumm gemeldet (Takes A, B, C).
- Plopps (10 × 40 ms, +6 dB über dem Gesang): **nur 3/10 gefunden** (Ziel ≥ 9), gefundene −10 … −24 dB; außerhalb bitgleich.
- 3-min-Take: Node Prüfen 1,9 s + Kette 1,9 s (× 3 = 11 s ≤ 20 s); App/Worker 2,6 s + 2,6 s (× 3 = 15,7 s); **keine Long Tasks**, größte
  Lücke im 16-ms-Takt 22 ms; Abbruch 12 ms.

## Tests `voxr1-test.mjs` – 22/27
OK: Brumm 50/60 erkannt, Kerben ≥ 25 dB, Band ≤ 0,5 dB, kein Brumm auf sauberem Take, Kette-Reihenfolge, Takes B/C ohne Fehlalarm,
3-min-Zeit (Node + App), Worker = Node bitgleich, Fortschritt, Rückfall Hauptfaden bitgleich, Abbruch, keine Long Tasks, Brummen live = offline,
nichts Sichtbares geändert, nichts ragt aus dem Bild, keine Konsolenfehler.
FEHLER (offen): Plopps ≥ 9/10 (3), je ≥ 12 dB (nur die gefundenen), Obertöne ≤ 1 dB (die verfehlten Stöße bleiben drin: bis 3,5 dB),
Prüfen zählt die Plopps, Take A 2 Kandidaten (evtl. echte Verschlusslaute – nicht geprüft).

## Offen für Teil 2
1. **Plopp-Erkennung**: Take A ist eine tiefe Stimme (f0 107–200 Hz); der Grundton liegt im Band < 150 Hz, das Verhältnis tief/mitte
   springt beim Stoß zu wenig. Vorschlag: Erkennung auf „tief minus vorhergesagtes tiefes Band“ (AR-Rest im dezimierten Band) oder Band
   < 100 Hz bei tiefen Stimmen (f0 aus dem Tonhöhen-Tracker), dann Schwelle neu eichen.
2. Touch-Teil: das Takes-Blatt ließ sich im Test nicht öffnen (`pop: null`) – nur „nichts ragt raus / nichts geändert“ geprüft. Für Teil 3
   (Zeile im Säubern-Blatt, nach Funk-Vorschlag) muss der Öffnungsweg in den Test.
3. Neue Take-Fassung mit einem ↶ (Anwenden) und Rauschboden-Kerne für Teil 2/3; Live-Kette (`vr1HumLive`) ist noch nicht in die
   Wiedergabe eingehängt.


---------------------------------------------------------------------------------------------------------------------------
# VOX-R1 Teil 2/3 (Plan-Schritte 4–6): Klicks, Atmer, Raumton in Lücken

## Gebaut (im Block VOXR1; ein neuer Haken-Ein-Zeiler im Marken-Editor: `vr1PaintBreath` nach `vx1Paint`)
- **Klicks & Schmatzer** `clickScan` / `click` / `clicks2`: AR-Rest (Ordnung 10) im Band > 2 kHz („Mund“; „tief“ = ganzes Band) und
  Band-Hüllkurve je 0,5 ms; Treffer = Spitze ≥ k1 × Median der Umgebung (±12 ms ohne das Ereignis) und ≥ k2 × zweitgrößte örtliche Spitze
  in ±25 ms (allein stehend; Stimmlippen-Pulse kommen periodisch); ≤ 5 ms; nicht unter −60 dBFS im Band; Einsatz-Schutz (Band 2–20 ms
  danach > 15 dB über davor = t/k/p, bleibt). Reparatur LSAR (Ordnung 40, 20 ms Umgebung) nur über 1,5 kHz (Grundton/tiefe Obertöne
  bleiben). **Zwei Durchgänge**: der zweite sucht ±30 ms um die reparierten Stellen mit Empfindlichkeit + 1. Empfindlichkeit 1–10 (4),
  Art Mund/tief, Breite = Mindestbreite der Reparatur (1 ms). Außerhalb der reparierten Stellen bitgleich.
- **Atmer** `voicing` / `breathFind` / `breath`: Kandidat = Energie 1–6 kHz dominant, kaum < 150 Hz, kein Zischen (> 5 kHz unter 1–6 kHz),
  über Raumton + 10 dB; stimmlos = Periodizität des LPC-Rests (Ordnung 10, dezimiert ≈ 5,5 kHz) < 0,45; 120–900 ms; 20 ms Abstand zu
  Stimmhaftem; zwischen zwei Silben eingeklemmt und < 300 ms = Konsonant (bleibt); leise Ränder bis 120 ms nachgezogen. Ziel −40 dBFS
  (RMS) mit 10-ms-Rampen innen; die Verstärkung wird so gelöst, dass der RMS mit Rampen genau das Ziel trifft; nie lauter; „absenken“
  (−12 dB) als Modus; act je Atmer lassen/leiser/weg.
- **Atmer-Marken** im Marken-Editor (vorhandener Stil: Band über der Welle wie die Auswahl, Farbe der Welle, Schild „Atmer −14 dB“ im
  Kasten wie die Auswahl-Länge; „weg“ kräftiger, „lassen“ gestrichelt). Sie erscheinen nur, wenn für den Take geprüft/gerechnet wurde –
  ohne die (noch nicht gebaute) Zeile „Gesang reinigen“ also nie: heute nichts Sichtbares geändert. API `vr1Breaths(id)`,
  `vr1BreathAct(id, k, act)`; Trefferliste `E.vr1b` für das Antippen in Teil 3.
- **Raumton in Lücken** `roomLearn` / `room`: Raumton = ruhigste 200-ms-Fenster (Median je Fenster, ohne digitale Stille, alle bis 3 dB über
  dem ruhigsten, ≤ 2 s), nur wenn ≥ 25 dB unter dem Gesang (sonst „kein Raumton“, z. B. Takes mit Tor). Lücke = ≥ 30 ms ≥ 10 dB unter
  dem Raumton (Ränder auf 1 ms genau). Füllung: Pegel und Klangfarbe von daneben (je 300 ms, rauschartige Rahmen), sonst gelernt; liegt
  daneben auch digitale Stille, wird nichts erfunden. Zufallsphase, Überlappen-Addieren mit √Hann, 10-ms-Blenden innen; gefüllt wird nur
  die fehlende Leistung; außerhalb bitgleich.
- **Kette** fest: Klicks → Plopps → Brummen → Hochpass → Atmer → Raumton (`VXR1_ORDER`). Prüfen zählt Klicks und Atmer mit denselben
  Suchen (Befund-Zeile z. B. „11 Klicks · 2 Plopps · 10 Atmer · Raumton −51 dB“).
- Tempo: Merkmale je Band als enge Schleife (3 min: 1,7 s → 0,44 s).

## Messwerte (echte Gesangs-Takes A/B/C, Fehler synthetisch eingesetzt)
| Messung | Ergebnis | Ziel |
|---|---|---|
| Klicks gefunden (20 je Take, 0,5–3 ms) | A 16 · B 20 · C 20 | ≥ 18 |
| Klicks: falsche Treffer an Stellen ohne Geräusch | A 0 · B 0 · C 0 | ≤ 1 |
| Klicks: eigene Geräusche der Takes (vorher schon da, mitrepariert) | A 7 (6 in Pausen, 1 im Gesang) · B 1 · C 5 | – |
| Klicks: Überstand im Band > 2 kHz vorher (Median) → nachher (max.) | A 13,1 → 7,5 dB · B 4,9 → 3,2 · C 6,6 → 2,9 | ≤ 3 dB |
| Atmer (10, −26…−34 dBFS, in Pausen von Take A, Gesang −20 dBFS) | 10/10 gefunden, 10/10 auf −40,7…−40,9 dBFS | ≥ 9 auf −40 ± 3 |
| Atmer: gesungene Rahmen verändert (3642 Rahmen ±10 ms) | 0 (mit Atmern und am sauberen Take) | 0 |
| Atmer-Fehlalarme (sauber A/B/C) | 0 / 0 / 0 | – |
| Raumton: 5 Schnitte in Pausen von Take A, Pegel vorher → gefüllt | −64,4→−65,5 · −65,8→−68,6 · −66,6→−70,8 · −64,1→−64,3 · −65,0→−66,3 | ± 3 dB |
| Raumton: Klangfarbe Oktavbänder (größte Abweichung) | 1,9 / 4,6 / 5,9 / 2,5 / 4,4 dB | ± 4 dB |
| 3-min-Take Node: Prüfen + ganze Kette | 1,5 + 1,7 s (× 3 = 9,8 s) | ≤ 20 s |
| 3-min-Take App/Worker: Prüfen + ganze Kette | 2,3 + 2,6 s (× 3 = 14,8 s) | ≤ 20 s |
| Hauptfaden während der Rechnung | 0 Long Tasks, größte Lücke 21 ms | keine > 50 ms |

## Tests `voxr1-test.mjs` – 41/51
Neu OK: Klicks B/C ≥ 18, keine neuen Fehlalarme (A/B/C), außerhalb bitgleich (A/B/C), Klicks C repariert; Atmer ≥ 9 auf −40 ± 3, keine
Silbe, Prüfen zählt sie; Raumton Blenden/bitgleich; Kette fest; App: Marken nach Prüfen, Lauf bringt sie aufs Ziel, Marken-Editor zeichnet
sie, Touch über CDP auf eine Marke (Editor bleibt, „weg“ setzbar), nichts ragt raus, Roh-Take bitgleich; Worker = Node (ganze Kette),
3-min App ≤ 20 s, keine Long Tasks, keine Konsolenfehler.
FEHLER: Plopps (5, aus Teil 1, unverändert), Klicks A ≥ 18 (16), Klicks A/B Überstand ≤ 3 dB (7,5 / 3,2), Raumton Pegel ± 3 dB
(2 von 5 Lücken 2,8 / 4,2 dB zu leise), Raumton Klangfarbe ± 4 dB (2 von 5: 4,6 / 5,9).

## Offen für Teil 3
1. **Klicks in lauten tiefen Vokalen (Take A)**: die 4 verfehlten liegen im Gesang, ihr Rest ist kaum größer als die Stimmlippen-Pulse
   (1,7×). Nächster Schritt: Langzeit-Vorhersage (Pitch-Prädiktor mit Periode aus dem Tonhöhen-Tracker) vor dem Allein-Test; ein schneller
   Versuch über die Rahmen-Maxima brachte +1 Treffer und +3 Fehlalarme (zurückgenommen). Der Überstand nach der Reparatur (Take A bis
   7,5 dB) kommt von einem Klick, der nur teilweise erfasst war (Durchgang 2 erweitert die Stelle nicht).
2. **Raumton**: wenn die Lücke fast die ganze Pause frisst, fällt die Füllung auf den gelernten (leiseren, dumpferen) Raumton zurück →
   bis 4 dB zu leise, Höhen zu schwach. Abhilfe: Fallback-Klangfarbe aus allen rauschartigen Rahmen ±2 s statt global.
3. Plopp-Erkennung (aus Teil 1).
4. „Anwenden“ als neue Take-Fassung mit einem ↶, Zeile „Gesang reinigen“ (Funk-Vorschlag vorher), Antippen der Atmer-Marken
   (lassen/leiser/weg), spektraler Entzischer, Assistent leicht/mittel/stark, A/B „nur Entferntes“.
