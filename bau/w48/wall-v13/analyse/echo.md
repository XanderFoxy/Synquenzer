# The Wall – Original-Echo-Kette aus Cubasis (für v13)

Stand 24.11.2026 · Agent „echo“ · alle Zahlen mit Herkunft in `analyse/echo.json`
(Legende: **cbp-roh** = Rohwert aus der Projektdatei · **pdf** = Einstellungen-PDF/Anleitung · **audio-gemessen** = an der Rohaufnahme `original/Gesang-Platzhalter-3.wav` bzw. `Doppel-Platzhalter-4.wav` gemessen · **angenommen**).

## 1. Kurz

- Die Effekte der Gesangsspuren sind in **v6, v7 und v8 bit-gleich** (`Data`-Strings verglichen). Nur der Master (Output 1) unterscheidet sich in v8 (StudioEQ „Wie Referenz“ davor, Brickwall 0,845).
- **VOX Haupt und VOX Doppel**: Slot 4 **Delay 1/4** → Slot 5 **Stereo Delay 1/2** → Slot 6 **RoomWorks SE 1,57 s** → Slot 7 **Chorus**, dazu **Send 1 (−22,22 dB, post-fader) auf den Echo-Bus** (Delay 1/4, 100 % nass, Feedback 0,35).
- **Chöre** (Chor 1/2, Chor 3 = Gegengesang, KI): nur **RoomWorks SE 1,50 s, Mix 12 %**. Kein Delay, kein Send. Der Gegengesang ist im Original also **ohne Echo, aber mit +4,6 dB mehr Hall** (nass −8,7 statt −13,3 dB) als die Hauptstimme. Das setzt ihn nach hinten.
- Am Audio gemessen: **1. Echo bei genau 0,5000 s, 2. bei 1,0000 s**. Andere Echo-Abstände gibt es nicht.
  - Echo 1 (Delay + Echo-Bus) liegt bei **−12,7 dB** unter dem Direktschall, Echo 2 (vor allem Stereo Delay) bei **−15,2 dB**.
  - Danach fällt der Echo-Bus-Schwanz um **−9,3 dB je Viertel**. Das ist Feedback 0,35, in allen Bändern gleich, also ohne Filter.
- **v12 hatte viel weniger Echo als das Original.** Die Cubasis-Kette auf dem v12-Lead ergibt in den Refrains Echo/Trocken **−10,9 dB**. v12 lag bei −24 dB (geduckt, fb 0,18). Der Hall ist fast gleich (−11,8 gegenüber −11 dB).
  - Wahrscheinlich ist genau das das „Anschieben“ der Echo-Zeiten, das Xander vermisst. Nicht sicher, nicht gehört.

## 2. Die Kette mit allen Werten

| Slot | Effekt | Rohwerte (cbp-roh) | Bedeutung | Herkunft |
|---|---|---|---|---|
| 4 | Delay „Default“ | 0,090458 · 0,150586 · 2,0 · 1,0 | Mix 9 % · Feedback 0,1506 (−16,4 dB je Echo) · Index 2 = **1/4** · Sync an | cbp-roh; Zeit audio-gemessen 0,5000 s |
| | | | **1. Echo −16,3 dB** rel. Direkt (Modell) | audio-gemessen ±1 dB (PDF: −15) |
| 5 | Stereo Delay „Default“ | 0,065276 · 1,0 · 0,65 · 1,0 · 0,500758 · 0,5 | Mix 6,5 % · L = R = **1/2 (1,0 s)** · Feedback ≈ 0 | Mix cbp-roh; Zeiten pdf + audio; Feedback audio |
| | | | **Echo −19,1 dB** rel. Direkt (Modell) | audio-gemessen ±1 dB (PDF: −18) |
| 6 | RoomWorks SE „Default“ | 0,055 · 0,519588 · 0,5 · 0,624196 · 0,0 · 0,045 · 0,1 | Zeit 0,1·200^n = **1,569 s** · Mix **4,5 %** (nass −13,3 dB, √-Gesetz) | cbp-roh + pdf (BELEGT) |
| | | 0,055 / 0,5 / 0,624 / 0,0 / 0,1 | Vorverzögerung, Dämpfung usw. (Skala unbekannt) | **angenommen**: 20 ms, Höhen > 6 kHz 55 % der Zeit |
| 7 | Chorus „Default“ | 0,386513 · 0,5 · 0,5 · 0,2 | Mix 0,2 (vermutet) · Rate/Tiefe/Spatial unbekannt | Mix cbp-roh; Rest **angenommen** (8 ms ± 2 ms, 0,6 Hz, L/R 90°) |
| Send 1 | Echo-Bus | OutputLevel 0,0774258 | **−22,22 dB**, post-fader, an | cbp-roh (PDF −22,2) |
| Bus | Delay „Default“ | 1,0 · 0,35 · 2,0 · 1,0 | 100 % nass · Feedback 0,35 (−9,12 dB) · **1/4** | cbp-roh; Abfall audio-gemessen −9,23…−9,33 dB |
| Chor | RoomWorks SE | 0,055 · 0,511115 · … · 0,12 · 0,1 | **1,502 s**, Mix **12 %** (nass −8,7 dB) | cbp-roh + pdf |

Davor (macht der Mix selbst, nur zur Vollständigkeit, Rohwerte in echo.json):
- Channel Strip: −23 dB, 4:1, 1/80 ms.
- StudioEQ: Haupt Low-Cut 0,326, Doppel 0,391, Chor 0,371, Chor 3 0,201; dazu −2 dB/350 Hz, +5,3 dB, +4,8 dB Shelf.
- Tune RT: aus.
- Compressor „Vocal 1“: 0,68125 · 0,5125 · 0,513 · 0,0205 · 0,1667.

Fader v8:
- Haupt 0,944 (−0,5 dB), Doppel 0,422 (−7,5), Chor 1 0,335 (−9,5, L 60), Chor 2 0,2985 (−10,5, R 60), Chor 3 = Gegengesang 0,237 (−12,5, Mitte).
- KI je 0,2985, stumm.

## 3. Gegenprobe am Audio (Rohaufnahme mit alter Kette)

Die Rohaufnahme `original/Gesang-Platzhalter-3.wav` ist nass. Sie ist sehr wahrscheinlich die Mitte (L+R)/2 einer Stereo-Spur: Die getunte Fassung `projekt/…` korreliert mit der Mitte des v6-Stereo-Gesangs mit r = 0,96.

1. **Autokorrelation über das ganze Lied** (0,3–10 kHz):
   - Spitzen nur bei 0,5 / 1,0 / 1,5 / 2,0 s, mit 0,2448 / 0,1587 / 0,0424 / 0,0092.
   - Doppel: 0,2454 / 0,1653 / 0,0433 / 0,0149.
   - In 6 Bändern von 100 Hz bis 16 kHz gleich. Die Delays haben also keine Filter.
   - Die trockene v7-Spur hat dort nichts (≤ 0,005).
2. **Mischgesetz der Delays** ist nicht dokumentiert. Zwei Kandidaten:
   - *Sinus* (cos/sin(m·π/2)): Delay −16,9, Stereo Delay −19,8 dB. Er trifft die Autokorrelation ohne jede Dekorrelation genau.
   - *Doppelt* (2·m): −14,9 / −17,7 dB, so wie im PDF. Er braucht einen unkorrelierten Anteil von 14 % (Chorus).
3. **Energie in den Echo-Zonen** (Nachbau mit der trockenen v7-Spur über die Zeitkarte, 27 Phrasenenden). Angegeben ist Original minus Nachbau:

   | | Sinus | Doppelt | **gemessen (1,70·m)** |
   |---|---|---|---|
   | Haupt, 0–0,5 s nach Ende | +0,33 | −0,61 | **−0,02 dB** |
   | Haupt, 0,5–1,0 s nach Ende | +1,21 | −0,12 | **+0,76 dB** |
   | Doppel, 0–0,5 s | +1,44 | +0,14 | **+1,00 dB** |
   | Doppel, 0,5–1,0 s | +1,53 | +0,04 | **+1,03 dB** |

   - Autokorrelation des Nachbaus („gemessen“, mit Chorus): Haupt 0,2505 / 0,1648 / 0,0475 / 0,0174, Doppel 0,2533 / 0,1680 / 0,0434 / 0,0185.
   - **Gewählt: nass/trocken = 1,70·Mix**, die Mitte. Das liegt in beiden Tests innerhalb von ±1 dB.
   - Die Doppel-Zonen sprechen eher für „doppelt“. Für das Doppel gilt aber die Zeitkarte der Hauptstimme, deshalb ist das nicht sicher.
4. **Echo-Bus-Schwanz** nach dem Outro (257–261,5 s): je 0,5 s −9,23 bis −9,33 dB in 150–600 Hz, 0,6–2,4 kHz und 2,4–9,6 kHz. Das bestätigt Feedback 0,35 (−9,12 dB) ohne Dämpfung.
5. **Stereo-Zeiten**: Im v6-Stereo-Gesang (`gesang/The-Wall_v6_Gesang-Haupt.mp3`) ist das 1-s-Echo in L und R gleich stark (0,019 / 0,018). Auch die Kreuzkorrelation L↔R ist gleich. Es gibt also kein Ping-Pong und keine L/R-Zeitdifferenz.
6. **Nicht messbar**:
   - RoomWorks-Vorverzögerung und -Dämpfung. Die Hüllkurven-Regression ist zu verrauscht, und der Echo-Bus überdeckt den Hall-Schwanz.
   - Chorus-Rate und -Tiefe. Die Tonhöhen-Periodik der Stimme überdeckt sie.
   - Die Breite des Originals: L/R-Korrelation 0,68, Seite/Mitte −7,2 dB. Der Nachbau hat 0,84 / −10,6 dB, ist also schmaler. Im v6-Stereo-Gesang steckt Tune RT; ob das die Breite erklärt, ist **nicht sicher**.

## 4. Nachbau `bau/echo_cubasis.py`

```python
import sys; sys.path.insert(0, '…/wall-v13/bau')
import echo_cubasis as ec
tr, echo, hall = ec.kette(lead_mono, 48000, 'haupt')     # oder 'doppel', 'chor' (= Chor 1/2/3, Gegengesang, KI)
spur = tr + echo + hall                                   # Stereo (N,2); danach Fader/Pan wie im Mix
# Werte direkt aus einer .cbp: P = ec.parameter('haupt', roh=ec.roh_aus_cbp('…/The-Wall-v8.cbp', 'VOX Haupt'))
# A/B der Mischgesetze: ec.kette(x, 48000, 'haupt', gesetz='sinus' | 'doppelt')
```

- Tempo-synchron: Viertel = 60/bpm, Halbe = 120/bpm.
- Linear: Kette(2x) = 2·Kette(x). Laufzeit ≈ 10 s für 266 s.
- Eingang ist das Signal **nach** Slot 3 (Compressor). Fader/Pan kommen danach, der Send ist post-fader, also bleibt das Verhältnis gleich.
- `echo` enthält Delay, Stereo Delay und den ganzen Echo-Bus-Rücklauf. `hall` ist der RoomWorks-Nassanteil, `tr` der Direktschall samt Chorus.

**Impulsantwort-Test** `pruef/echo_ir_test.py` → `pruef/echo_ir_test.json`: **33/33 OK**.
- 1. Echo bei 0,5 s auf das Sample genau, −12,72 dB.
- Insert-Delay −16,26 dB, Abfall je Echo −16,44 dB.
- Stereo Delay L und R bei 1,000 s, je −19,10 dB, bei 2,0 s nichts.
- Echo-Bus −22,22 dB, Abfall −9,12 dB je Viertel.
- Hall T30 1,555 s (Soll 1,569 s), nass −13,4 dB im Mittenband (Soll −13,3).
- Chor: kein Echo, Hall −8,8 dB (Soll −8,7).
- Bei 100 BPM: Echos bei 0,600 / 1,200 s.

Dateien `analyse/ir_haupt.wav`, `ir_doppel.wav`, `ir_chor.wav` (ganze Kette, Stereo, 32 bit float), dazu `ir_*_echo.wav` und `ir_*_hall.wav`.

**Nur angenähert:**
- RoomWorks-Algorithmus: Rauschfahne in 3 Bändern statt Steinberg-Algorithmus. Vorverzögerung und Höhendämpfung sind angenommen.
- Chorus: alles außer dem Mix angenommen.
- Stereo-Delay-Rohwerte 2/4/5 sind nicht entschlüsselt.
- Mischgesetz der Delays: audio-gemessen ±1 dB.

## 5. Cubasis-Projekt v13: `bau/cubasis_v13.py` (+ `bau/cbp_codec.py`)

- **Ja, das geht.**
  - `cbp_codec` liest und schreibt die .cbp **bit-genau**: Der Rundweg ist für v6, v7 und v8 Byte für Byte identisch.
  - Der Aufbau: 8 Byte Kennung unverändert, dann CBOR XOR 0x7C, mit Float32/64-Breite je Wert.
  - Mit cbor2 ginge das nicht, weil es die Float-Breiten verliert.
- `baue_projekt({'haupt': wav, 'doppel': wav, 'chor1': …, 'chor2': …, 'gegengesang': …}, ziel_zip, modus='ausschnitte'|'ganz'|'wie_v8', bits=24)`
  - nimmt die **v8-Struktur unverändert**: alle 32 Busse, Effekt-Daten, Fader, Pan, Sends, Arranger, UIParams.
  - ersetzt nur die Regions der VOX-Spuren. Clips liegen auf dem Tick-Raster: 1 Tick = 25 Samples, Pos/1920 = s.
  - vergibt neue IDs oberhalb des bisherigen Maximums.
  - schreibt den ZIP-Ordner wie v8: `.cbp`, `LIESMICH.txt`, WAVs.
  - Nicht übergebene Spuren behalten ihre v8-Clips.
- `pruefe_projekt(zip)` entschlüsselt die Datei wieder, vergleicht sie mit v8 und prüft jeden Clip (WAV vorhanden, Länge = Ticks, Inhalt an Pos sample-genau).
- `spur_aus_projekt(zip, spur)` und `gesang_mit_effekten(zip, spur)` lesen das Projekt wieder aus: Clips an ihrer Lage, dann die Kette mit den Werten **aus dieser .cbp**. Heraus kommt die Gesangs-WAV mit fertigen Effekten.
- Test `pruef/cubasis_v13_test.py` → `pruef/cubasis_v13_test.json`: **OK**.
  - Probe aus den v12-Stimmen: 149 Clips, Länge auf das Sample genau, Rundweg bit-gleich.
  - Alle Effekte, Fader, Pan und Sends sind gleich wie in v8.
  - Außerhalb der Clips bleibt höchstens −54,7 dBFS. Davor fehlten die Atmer vor den Zeilen; deshalb setzt ein Clip 0,4 s vor dem ersten Ton ein.
  - Die Probe-ZIPs liegen in `out/test/` (122 MB / 61 MB). Sie sind **nur Test, keine Lieferung**.
- **Nicht sicher:**
  - Ob Cubasis das Projekt öffnet, lässt sich hier nicht testen. Es ist gleich gebaut wie v8: Arranger mit 44,1 kHz, Dateien mit 48 kHz wie in v6 und v8.
  - Ob Xander v8 je geöffnet hat, ist nicht belegt.

## 6. Für den v13-Mix

- Lead und Doppel: `ec.kette(…, 'haupt' / 'doppel')` statt Platte + Echo aus v12.
- Gegengesang und Chöre: `ec.kette(…, 'chor')`. Das sind 12 % Hall und kein Echo; das setzt den Gegengesang nach hinten, wie im Original.
- Wenn das Echo zu viel wird: lieber den Send-Pegel (`P['send']['pegel']`) als die Zeiten ändern. Das wäre eine sichtbare Abweichung vom Original und gehört deshalb vorher in den Funk.
