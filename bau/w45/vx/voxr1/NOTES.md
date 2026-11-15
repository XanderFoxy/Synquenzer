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


---------------------------------------------------------------------------------------------------------------------------
# VOX-R1 Teil 3/3 (Plan-Schritte 7–9): spektraler Entzischer, Assistent, Bedienung im Säubern-Blatt, Guide

## Gebaut (alles im Block VOXR1; Haken jetzt 5 Ein-Zeiler mit typeof-Schutz)
- Neue Haken: `clSheet` → `vr1Sheet(p, box, id, ok)`, `clPaint` → `vr1ClPaint(p, box)`, Entzischer der Gesangs-Effekte
  (`deess` in `g4DspMake`) → `return vr1EssCore(y, sr, amt)`. Dazu wie bisher `vr1PaintBreath` und `Object.assign(SYNQUENZER, VXR1_API)`.
  Außerhalb von Block + Haken ist index.html gleich basis.html (geprüft).
- **12 Zischen – spektraler Entzischer** `vr1EssCore(y, sr, amt, o)` (eigenständige Funktion, dient der Kette UND dem vorhandenen
  Entzischer der Gesangs-Effekte, auch in deren Worker: `g4DspMake.toString` stellt den Kern voran):
  STFT 1024/256 mit √Hann (≈ 23 ms bei 44,1 kHz, 2048 ab 50 kHz); je Rahmen Energie über der Grenze (5 kHz) gegen das Gesangsband
  300 Hz–4 kHz; Zischlaut = darüber + Schwelle (−6 dB, Erkennung 4 dB empfindlicher) und ≥ 20 ms (t/k/p bleiben knackig); je
  Drittel-Oktav-Band über der Grenze wird nur gesenkt, was gegen seinen Anteil vorsteht (höchstens Stärke dB, Angriff 5 ms,
  Rückkehr 40 ms, zwischen den Bandmitten interpoliert). Gerechnet wird nur die Differenz (G − 1)·X → wo nichts gesenkt wird, bleibt
  das Signal bitgleich. Offline vorausgerechnet (Kette und Gesangs-Effekte) → bei der Wiedergabe 0 ms Verzögerung; im Mithören
  („Mich selbst hören“) läuft er nicht (live wären es ≈ 23 ms). Aussehen der Gesangs-Effekte unverändert (Regler, Rückgabe {maxDb, sibMs}).
- **Kette** jetzt Klicks → Plopps → Brummen → Hochpass → Atmer → Raumton → Zischen (`VXR1_ORDER`, Plan §3 Nr. 12 zuletzt).
- **Assistent** `assist(B, lv)`: Startwerte × 0,5 / 1 / 1,5 (Klick-Empfindlichkeit 2/4/7, Plopp-Stärke 25/50/75 %, Brumm-Tiefe
  −15/−30/−45 dB, Atmer-Ziel −34/−40/−46 dBFS, Zischen 3/6/9 dB); es laufen nur Schritte, bei denen Prüfen etwas fand (Hochpass und
  Raumton immer – sie ändern nur, was da ist). `suggest(B)` schlägt eine Stufe vor; `worst(B, 10)` = 10-s-Fenster mit den meisten Funden
  (Klick 1, Plopp 3, Atmer 1, Zisch-Rahmen 0,05). Prüfen liefert dafür `sibSec` (Zisch-Rahmen je Sekunde).
- **Bedienung im vorhandenen Säubern-Blatt** (Stil der vorhandenen Zeilen `.clrow/.cllab/.clab`, Trefferflächen 44 px, kein neues CSS):
  Zeile „Gesang reinigen“ [leicht │ mittel │ stark], darunter [▶ 10 s │ Anwenden │ Mehr ▾]; Mehr ▾ = 7 Einzelschritte an/aus mit Fund
  (z. B. „✓ Klicks 8“, „✓ Brummen 50 Hz“), feste Reihenfolge. Zustandszeile: Befund + was die Stufe macht, Fortschritt in %,
  „Abbrechen“ während der Rechnung. Antippen einer Stufe prüft den Take (einmal je Take, im Worker).
- **A/B dreiteilig**: das vorhandene A/B bekommt „nur Entferntes“ (Roh │ Sauber │ nur Entferntes). Beim Vorhören laufen alle drei
  zeitgleich, A/B blendet in 20 ms um (kein Neustart); bei der angewandten Fassung liefert der Verarbeiter Fassung bzw. Differenz.
  Blatt zu → wieder „Sauber“.
- **10 s Vorhören** an der schlimmsten Stelle: nur dieses Stück wird gerechnet (≈ 0,3 s), stoppt nach 10 s oder wenn das Blatt zugeht.
- **Anwenden = neue Fassung**: `take.vr1 = {lv, steps, br}` (Stufe, Schritte, Atmer-Wahl), ein ↶ (undoPush „Gesang reinigen mittel“);
  der Roh-Take bleibt bitgleich. Abspielen: `vr1Proc` in `tkExt().proc` vor SÄUBERN (Quelle = SÄUBERN bzw. roh), Zeitkarte/G2/G4
  liegen davor – die Gesangs-Effekte rechnen danach auf der gereinigten Fassung. Rechnung im Worker, abbrechbar, danach Tausch während
  der Wiedergabe (clResync). Der Take-Normalisierer übernimmt `vr1` (geprüft und begrenzt) beim Laden.
- **Atmer-Marken antippen** (Marken-Editor): Tipp in den oberen Streifen (≤ 56 px) über einer Marke wechselt leiser → weg → lassen
  (Trefferbreite mindestens 44 px); ist „Gesang reinigen“ angewandt, wird mit ↶ neu gerechnet.
- **Guide „Wo finde ich …?“**: Eintrag „Gesang reinigen“ (STIMME › Takes-Blatt › Säubern › Gesang reinigen, Mehr ▾ = Einzelschritte).
- API: `vr1Pick`, `vr1Plan`, `vr1Apply`, `vr1Preview`, `vr1PvStop`, `vr1Ab`, `vr1Ver`; `window.__vr1.ess`/`.proc`.

## Messwerte (echter Gesangs-Take A, Fehler synthetisch eingesetzt)
| Messung | Ergebnis | Ziel |
|---|---|---|
| Zischen: 10 „s“ (Rauschen > 5 kHz, 150 ms, −3 dB unter dem Gesang), S-Energie > 5 kHz | −6,0 dB Median; −5,9…−6,0 an 9 von 10; 1 × −3,2 (auf lautem Vokal-Ende) | −6 dB |
| Zischen: Vokale (1862 stimmhafte Rahmen) | 0,000 dB gesamt, größter Rahmen 0,2 dB; 1826 von 1873 Rahmen bitgleich | ≤ 0,5 dB |
| Entzischer Blocklänge | 1024 → 23,2 ms (offline: 0 ms bei der Wiedergabe, beim Mithören aus) | – |
| Gesangs-Effekte: Entzischer spektral | Hauptfaden und Worker gleich (−6 dB, 2485 ms Zischlaute) | – |
| 3-min-Take Node: Prüfen + ganze Kette inkl. Zischen | 1,45 + 2,87 s (× 3 = 13,0 s) | ≤ 20 s |
| 3-min-Take App/Worker: Prüfen + ganze Kette inkl. Zischen | 2,33 + 3,65 s (× 3 = 17,9 s) | ≤ 20 s |
| Hauptfaden während der Rechnung | 0 Long Tasks, größte Lücke 26 ms (unter Last einmal 54 / 72 ms, s. u.) | keine > 50 ms |
| Abbruch | 12 ms | – |
| 10 s Vorhören | Fenster 11–21 s (meiste Funde), A/B weg ↔ sauber ohne Neustart | – |

## Tests `voxr1-test.mjs` – 57/67
Neu OK (16): Zischen −6 dB (Median), Vokale ≤ 0,5 dB, spektral/23 ms, Assistent 3/6/9 dB, Vorhören an der schlimmsten Stelle,
Zeile + A/B dreiteilig + 44 px, Touch „mittel“ prüft, Mehr ▾ (7 Schritte), nichts ragt raus (hochkant, quer 926×428, quer 926×370),
Touch ▶ 10 s + A/B „nur Entferntes“, Touch „Anwenden“ (neue Fassung spielt auch durch die Gesangs-Effekte, Roh-Take bitgleich), ein ↶,
Gesangs-Effekte spektral (Hauptfaden + Worker), Guide, Touch auf Atmer-Marke (leiser → weg). Kette inkl. Zischen: Worker = Node bitgleich.
FEHLER (unverändert aus Teil 1/2): Plopps (5), Klicks Take A ≥ 18 (16), Klicks A/B Überstand ≤ 3 dB (7,5 / 3,2), Raumton Pegel
(2 von 5 Lücken) und Klangfarbe (2 von 5).
Fotos: voxr1-blatt.png (428×926, Zeile + Mehr ▾ offen), voxr1-quer.png (926×428), voxr1-quer370.png (926×370), voxr1-atmer.png.

## Offen
1. **Funk-Vorschlag**: Die Zeile „Gesang reinigen“ und das dritte A/B-Feld sind sichtbar neu → vor der Auslieferung im Funk vorschlagen
   (Regel 3; Plan P4 „Funk: Vorschlag“).
2. Plopp-Erkennung (Teil 1), Klicks in lauten tiefen Vokalen (Take A), Raumton-Fallback bei fast ganz weggeschnittenen Pausen (Teil 2).
3. Zischen auf einem lauten Vokal-Ende (1 von 10) nur −3,2 dB: Vergleich gegen den Gesangspegel desselben Rahmens; Abhilfe wäre ein
   geglätteter Gesangspegel (±150 ms) als Bezug.
4. Der vorhandene Regler 0–100 % ist noch nicht „Gesamtstärke“ der Kette (Plan §3) – das würde eine vorhandene Bedienung umdeuten,
   daher erst nach Rückfrage. Je Schritt gibt es unter Mehr ▾ nur an/aus, noch keine 1–2 Regler.
5. Die gereinigte Fassung wird nach dem Laden neu gerechnet (nur Parameter im Projekt, wie SÄUBERN); ein Speicher im Takes-Store fehlt.
6. Zischen kostet 1,2 s je 3 min (Node); Reserve App 17,9 von 20 s. Schneller: reelle FFT halber Länge, Analyse-Durchgang ohne
   stille Rahmen.
7. Long Tasks: in 2 von 7 Läufen (Rechner unter Last, Lastmittel ≈ 6) 54 / 72 ms – sonst 0. Nicht reproduzierbar ohne Last.


---------------------------------------------------------------------------------------------------------------------------
# VOX-R1 – Prüfung (17 Befunde aus PRUEFUNG.md nachgearbeitet, 15.11.2026)

Alles weiter nur im Block VOXR1-BEGIN … END; Haken jetzt **7 Ein-Zeiler** mit typeof-Schutz (neu: je einer am Anfang von `g4Proc`
und `g2Proc`: `if (typeof vr1Skip === 'function' && vr1Skip(id)) return null;   /* VOXR1 */`). Außerhalb Block + Haken = basis.html.
Namenskonflikt beim Bauen gefunden (topdefs): `vr1Key` gab es schon (Notenrolle) → `vr1VerKey`.

| # | Befund | Stand | Was geändert wurde / Messung |
|---|---|---|---|
| 1 | Abbrechen bricht nicht ab | **behoben** | `vr1Cancel`: stoppt den Auftrag, setzt die vorige Fassung zurück (bzw. keine), nimmt den ↶-Eintrag dieses Anwendens wieder heraus; Fehler setzen denselben Schlüssel (`fail`) → keine Schleife; nach Abbruch kein `tkPlayBuf`-Neustart. Touch-Test: Rechnung stoppt, renders bleibt gleich (4 s beobachtet), Knopf „Anwenden“, kein ↶-Eintrag. |
| 2 | „nur Entferntes“ = vor allem Stimme | **behoben** | Hochpass nullphasig (vorwärts/rückwärts); „nur Entferntes“ = Summe Eingang − Ausgang je Schritt (Raumton zählt nicht, SÄUBERN nicht). Nur Hochpass: 80–160 Hz −19,1 dB, 160–320 Hz −28,8 dB (Prüfer-Skript); saubere Takes „mittel“: 300 Hz–4 kHz −44,6 … −57 dB unter dem Original. |
| 3 | P4-Abnahme | **teilweise** | Plopps: Suche jetzt im Band < 70 Hz (unter jedem gesungenen Grundton) mit „Stoß trägt ≥ −10 dB der Energie“ und ≥ Spitze − 20 dB → 6/10 statt 3/10, Fehlalarme auf gesungenen Tönen des alten Bandes weg. Weiter offen: 6/10 (Ziel 9), Abzug 9–13 dB, Obertöne bis 6 dB. Klicks A 16/20, Überstand 7,5/3,2 dB und Raumton 2/5 unverändert offen (Fenster bis ±2 s erweitert, ändert die 5 Test-Lücken nicht). |
| 4 | Zischen auf jedem Take, ohne Bezug | **behoben** | Bezug = Gesangspegel (Mittel der lauteren Hälfte der Rahmen unter 5 kHz im Take, auf Vokalen der Rahmen selbst), Schwelle −6 dB, Senkung 3 × Überstand bis Stärke; Zischlaut nur, wenn über 5 kHz ≥ 6 dB mehr als 2–5 kHz. Prüfen zählt mit derselben Analyse (`sibHot`), Befund-Zeile „8× Zischen“, der Assistent schaltet Zischen nur dann ein. „s“ in Pausen/Vokalen: 0 dB → −5,5 dB; −6 dB → ≈ −0,5; −12/−18/−24 dB → 0,0 (Prüfer-Skript). Saubere Takes „mittel“: B, C ohne Zischen; A (8 scharfe S gefunden) 86 von 3050 Rahmen > 3 dB, alle an den gefundenen S. |
| 5 | doppelt entzischt | **behoben** | Entzischen die Gesangs-Effekte (Entzischer > 0), lässt die Kette Zischen weg (Zeile sagt „Zischen (über die Gesangs-Effekte)“); Schlüssel der Fassung enthält diesen Zustand → nur ein Entzischer. |
| 6 | „nur Entferntes“ ohne Reinigung spielt „Sauber“ | **behoben** | Knopf nur frei mit Vorhören oder fertiger angewandter Fassung (Touch-Test). |
| 7 | Plopp-Fehlalarme beschädigen gesungene Töne | **behoben (s. Hinweis)** | Suche < 70 Hz statt < 150 Hz; Reparatur-Grenze unter dem gesungenen Grundton der Umgebung (stärkste Spitze 90–400 Hz × 0,8, mindestens 120 Hz). Hinweis: Die 11 verbliebenen Funde im sauberen Take A sind echte Tiefstöße: dort liegt das Band < 70 Hz nur 2–5 dB unter dem Gesamtpegel, obwohl der Ton bei 110–200 Hz liegt (ein Ton bei 202 Hz ergibt < 70 Hz etwa −37 dB). Der Builder-Test „Take A sauber ≤ 1 Plopp“ bleibt deshalb rot. |
| 8 | Reihenfolge mit SÄUBERN | **behoben** | Quelle ist der Roh-Take; mit SÄUBERN: Klicks → Plopps → Brummen → SÄUBERN (Echo-Abzug, Entrauschen, sein Hochpass) → Atmer → Raumton → Zischen; der Schritt Hochpass entfällt dann (nur ein Hochpass). Touch-Test: `info.order` mit `saeubern` hinter click/plop/hum, kein `hp`. |
| 9 | Gesangs-Effekte doppelt so lang | **behoben** | Entzischer: Sprung N/2 (√Hann 50 %) und zwei Rahmen je komplexer FFT (Analyse und Synthese). 3-min-Take „Gesang Synthpop“: alt 1,99/1,53 s, neu 1,81/1,51 s; Entzischer allein 0,38 s je 3 min (vorher 1,2 s unbelastet / 4,0 s belastet). |
| 10 | Speicher ohne Grenze | **behoben** | Fassung als AudioBuffer, „nur Entferntes“ als Int16 (halber Speicher), als AudioBuffer nur bei offenem Blatt dieses Takes (stückweise ≤ 6 ms gebaut); Fassungen nicht aktiver Takes und ohne `vr1` fliegen raus, Obergrenze 160 MB (älteste zuerst). 3 min ≈ 47,6 MB statt 61 MB. |
| 11 | A/B bei angewandter Fassung nicht sofort | **behoben** | „nur Entferntes“ läuft an Gesangs-Effekten und Tonhöhe vorbei (Haken in g4Proc/g2Proc), Auto-Pegel wie die saubere Fassung. Touch-Test: sofort, `G4.renders` unverändert, zurück auf „Sauber“. |
| 12 | Atem als Stilmittel gesenkt | **behoben** | Zischlaut braucht das S-Spektrum (über 5 kHz ≥ 6 dB mehr als 2–5 kHz); Atmer aus dem Schritt Atmer (auch „lassen“) sind für den Entzischer gesperrt. Test: eingesetzte Atmer bei „stark“ < 1 dB über 5 kHz. |
| 13 | Rückfall Scheibe 212 ms | **behoben** | Entzischer gibt alle 32 Rahmen ab: größte Scheibe 10,8 ms (60-s-Take, Prüfer-Skript). Der Rückfall der vorhandenen Gesangs-Effekte (`local()`) ist nicht Teil des Blocks – unverändert. |
| 14 | Plan-Lücken | **offen** | Regler 0–100 % als Gesamtstärke und Regler je Schritt unter Mehr ▾ ändern sichtbare Bedienung → erst Funk-Vorschlag. `vr1HumLive` bleibt Kern für das Mithören (live), eingehängt ist es nicht. |
| 15 | Zustandszeile außer Sicht | **behoben** | Beim Öffnen von Mehr ▾, beim Anwenden und beim Neubau mit offenem Mehr ▾ rollt das Blatt die Zustandszeile ins Bild (kein neues Aussehen). Test prüft jetzt den unteren Rand. |
| 16 | „stark“ Klick-Empfindlichkeit 7 | **behoben** | 2 / 4 / 6. |
| 17 | Test-Lücken | **behoben** | Neu: Abbrechen per Touch, „nur Entferntes“ gesperrt/sofort/Inhalt, SÄUBERN-Reihenfolge, Speicher-Zähler, Speichern/Laden, Zustandszeile im Bild, Atmer „weg“ per Touch (auch Treffer = nächste Marke, nicht die erste), saubere Takes, Zischen gegen Pegel, Atem-Stilmittel, Scheibengröße, 2/4/6. |

Nebenbei gefunden: Antippen einer Atmer-Marke traf bei eng liegenden Marken die erste in der Liste statt der nächsten → behoben.

Tests `voxr1-test.mjs` – **71/81** (vorher 57/67; alle Bedienungs-Tests grün). Rot bleiben nur die DSP-Abnahmen aus Teil 1/2:
Plopps (5: 6/10 gefunden, Abzug, Obertöne, Prüfen zählt, Take A „sauber“), Klicks (3: Take A 16/20, Überstand A/B), Raumton (2).

## Offen
1. Plopps 6/10 (Ziel ≥ 9) – nächster Schritt: Langzeit-Vorhersage im tiefen Band (Pitch-Prädiktor) statt Pegel-Sprung; Abzug ≥ 12 dB.
2. Klicks in lauten tiefen Vokalen (Take A) und Raumton-Pegel an 2 Lücken (Teil 2).
3. Funk-Vorschlag für die sichtbar neue Zeile „Gesang reinigen“ + drittes A/B-Feld, dazu Regler 0–100 % als Gesamtstärke und Regler je Schritt (Befund 14).
