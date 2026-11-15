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
