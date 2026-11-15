# VOXR1B – unabhängige Prüfung (15.11.2026)

Geprüft: `vx/voxr1b/index.html` (VERSION 4.70.0 unverändert). Nichts repariert.
Eigene Skripte und Rohdaten: `vx/voxr1b-p/` (`kern.mjs` → `kern.txt`/`kern.json`, `app.mjs` → `app.txt`/`app.json`, `smoke.png`).

**Testgut:** Die Fehler sind selbst gebaut und in **Take B und Take C** eingesetzt, jeweils bei 44,1 und 48 kHz. Die Entwickler-Tests
setzen sie in Take A ein. Take A dient hier nur als saubere Gegenprobe bei 48 kHz. Die Fehlerformen weichen bewusst ab:

- Brumm mit fallenden Obertönen und Zufallsphasen.
- Plopps als gedämpfter Tiefton 25–60 Hz plus Tiefrauschen, Pegel +2…+8 dB.
- Klicks als Resonanz-Impuls 1,5–8 kHz mit Q 2–8, auch auf Vokalen.
- Atmer als Rauschen mit zwei Formanten.
- „s“ als Rauschen über 4,5 kHz mit Spitze bei 7 kHz.

Stimmhaftigkeit misst ein eigener Tracker (YIN), nicht die Annotation.

## Pflicht

| Prüfung | Ergebnis |
|---|---|
| topdefs | 26 Skripte, 7836 Namen, 0 doppelt, 0 Syntax |
| dupkeys | 0 |
| smoke | errors [] |
| Zählungen | „MS 2000“ 1×, „^  live: true,“ 1× |
| basis.html | gleich rel-4700/index.html |

## P4-Abnahme

### Brumm (50/60 Hz + 6 Obertöne, zusammen −20 dB): **nicht bestanden (2 von 4)**
- Take B@44 mit 50 Hz und Take C@48 mit 60 Hz:
  - erkannt, alle 7 Kerben 29,4–30 dB weniger;
  - Gesangsband −0,21 / −0,50 dB (die 0,50 liegt genau auf der Grenze).
- **Take C@48 mit 50 Hz:** nicht erkannt, keine Kerbe. Das gilt auch bei gleich starken Obertönen und bei 49,6 Hz.
- **Take B@44 mit 60 Hz:** f0 richtig (60,001), trotzdem „aus“.
- Ursache im Code (`humFind`):
  1. Die Grundfrequenz wird über die rohe Summenleistung von 7 Obertönen gewählt. Bei hoher Stimme (Grundton 190–320 Hz) rastet
     sie auf einen Gesangs-Teilton ein (61,75 statt 50).
  2. „an“ verlangt 2 der ersten 4 Obertöne mit ≥ 10 dB Abstand zum Nachbarn. Bei tiefer Stimme verdecken die Gesangs-Teiltöne die
     Obertöne 2–4; bei 180 Hz entscheidet die Phase zwischen 9,8 und 12,5 dB.
- Die Entwickler-Tests bestehen nur, weil Take A, gleich starke Obertöne und feste Phasen verwendet werden.

### Plopps (10 × 40 ms): Erkennung bestanden, **Reparatur nicht bestanden**
- Gefunden: B@44 10/10, C@48 10/10, 0 Fehlalarme. Außerhalb der Funde bitgleich. Prüfen zählt 10.
- Abzug je Stoß (Ziel ≥ 12 dB):
  - B: 13,3 · 16,5 · 22,2 · 17,6 · 18,2 · **10,2** · 17,2 · 15,9 · 19,6 · **4,6** → 8/10;
  - C: 20,4 · 13,2 · **5,6** · **8,8** · 23,0 · 20,9 · 23,5 · 19,1 · 23,8 · 23,9 → 8/10.
- Obertöne, Summe bis 4 kHz (Ziel ≤ 1 dB):
  - B: −1,29 · −0,67 · −0,14 · −1,01 · −0,25 · **−3,06** · 0,24 · −0,09 · −0,50 · **−3,58** → 6/10;
  - C: 0,20 · 0,93 · **−9,03** · **−2,85** · 0,17 · −0,23 · 0,24 · **−1,69** · −0,24 · 0,12 → 7/10.
- Nur unter 250 Hz (dort wird neu gebaut) bis −13,2 dB. Einzelne Teiltöne bis −23 dB.
- In einem früheren Lauf derselben Stöße (andere Platzierung) fiel der Grundton bei 125 Hz um −25 dB ab.
- Bild: In 2–4 von 10 Stellen je Take nimmt die Teilton-Neubildung den Grundton bzw. 2. Oberton der Stimme mit oder lässt den Stoß
  stehen. Die Entwickler-Messung zeigt dasselbe, auf anderen Takes ist es eher häufiger.

### Klicks (20 × 0,5–3 ms): **bestanden (knapp)**
- B@44: 19/20 (16/16 auf Gesang), 0 falsch. C@48: **18/20** (16/17 auf Gesang), 0 falsch. Außerhalb der Funde bitgleich.
- Nur zur Info, kein Abnahmepunkt: Der Abzug über 2 kHz ist uneinheitlich (−5,8 … +19,9 dB). An 2 Stellen ist der Fehler nach der
  Reparatur größer als vorher (−2,2 / −5,8 dB). Das deckt sich mit dem offenen Überstand aus dem Entwickler-Test.

### Atmer (10): **bestanden**
- 5 Atmer in Pausen von B+C@48 und 5 in B+C@44 gesetzt. Mehr echte Pausen haben die beiden Takes nicht.
- Pegel danach −40,4 … −40,9 dBFS → 10/10 im Ziel.
- Keine stimmhafte Stelle verändert (0 von 3143 Rahmen ±10 ms). Prüfen findet 10, 0 falsch. Im sauberen Take 0 Atmer.

### Zischen: **bestanden**
- „s“-Energie über 5 kHz: B −5,98 dB, C −5,95 dB (Median); alle 20 „s“ zwischen −5,85 und −6,00 dB.
- Vokale 0,00 dB (0 von 1075 bzw. 1558 Rahmen über 0,5 dB).

### Raumton (Schritt 11; kein P4-Abnahmepunkt, Entwickler-Ziel ±3 / ±4 dB): **nicht bestanden, wenig Testgut**
- C@48 / C@44: nur 2 brauchbare Pausen.
  - Pegel −0,3/+0,3 bzw. −2,0/−1,7 dB (in ±3 dB);
  - Klangfarbe 2,5–2,8 dB bzw. **9,7 / 6,6 dB** (Ziel ±4).
- **B:** Gelernter Raumton −93,9 dB, obwohl der Rauschboden des Takes bei −36,9 dB liegt (10-%-Wert der 10-ms-Rahmen).
  - Gelernt wird offenbar am nahezu stillen Anlauf am Take-Anfang.
  - Eine Lücke in B würde mit −94 dB „gefüllt“ und bliebe tot.
- Außerhalb der Lücken bitgleich.

### Saubere Takes unverändert: **bestanden für B und C; Take A siehe unten**
- B@44, B@48, C@44, C@48: 0 Plopps, kein Brumm.
  - Assistent „mittel“ wählt nur Klicks, Hochpass, Raumton.
  - „nur Entferntes“ im Band 300 Hz–4 kHz −44,6 … −57,7 dB.
  - Stimmhafte Rahmen über 0,5 dB (200 Hz–4 kHz): 0–2 von 1353–1815, höchstens 0,84 dB.
- Take A@48 (Gegenprobe): Prüfen meldet **15** Plopps (bei 44,1 kHz 13).
  - „mittel“ ändert 43 stimmhafte Rahmen um bis 6,1 dB, und zwar allein durch den Schritt Plopps.
  - Die Funde liegen an Einsätzen; das deckt sich mit der Entwickler-Deutung „eigene Tiefstöße“.
  - **Aber:** Bei 44,1 kHz macht die Reparatur an der Stelle 29,66 s einen 23-ms-Rahmen kurz vor dem Einsatz um **+15,3 dB lauter**.
    Bei 17,84 s (48 kHz) wird das Tiefband lauter statt leiser (redDb −1,7).
  - Vermutlich zieht die Teilton-Neubildung den Ton der Gegenseite in den stillen Bereich vor dem Einsatz. Das ist ein Vor-Echo im
    Band < 250 Hz, das der Kommentar „kein Vor-Echo“ ausschließen will.

## Zeit, Abbrechen, ↶, Speicher, Long Tasks (App, Chromium, 428×926, Touch über CDP, 3-min-Take 48 kHz mit eigenen Fehlern)

| Punkt | Ergebnis |
|---|---|
| Kette 3 min im Node-Kern, Prüfen + 7 Schritte (Median aus 3) | 4,69 s → × 3 = 14,1 s ≤ 20 s – **bestanden** |
| Prüfen per Touch „mittel“ im Worker | 2,8 s, Befund in der Zustandszeile – bestanden |
| Abbrechen (Touch auf „Abbrechen“ 0,8 s nach „Anwenden“) | steht nach 170 ms. Keine Fassung, kein ↶-Eintrag, Worker beendet, kein Neustart in 3 s, es spielt die vorige Fassung – **bestanden** |
| Anwenden per Touch | 3,5 s bis die Fassung spielt – bestanden |
| ↶ / ↷, 3 Runden | ↶ spielt bitgleich die vorige Fassung, ↷ bitgleich dieselbe Fassung – **bestanden** |
| Speicher | Zähler 51,8 MB (1 Fassung, ≤ 160 MB). Der JS-Heap nach GC pendelt zwischen 199 MB (nach ↶) und 285 MB (nach ↷). Das bleibt über 3 Runden gleich, also kein Leck – **bestanden** |
| Speichern/Laden | Stufe steht im Projekt, wird nach dem Laden wieder angewandt und spielt bitgleich wie vorher; Roh-Take bitgleich – **bestanden** |
| Long Tasks beim Prüfen (3 min) | 54 und 64 ms, 16-ms-Takt bis 137 ms Lücke – **nicht bestanden** (knapp). `vr1Job` kopiert den Take auf dem Hauptfaden (`x.slice()`, 24 ms). |
| Long Tasks beim Anwenden (3 min) | **209 ms** plus 19 Aufgaben zwischen 51 und 112 ms, Takt-Lücke bis 240 ms – **nicht bestanden**. Gemessen: `vr1Q16` (nur Entferntes → Int16, zwei Schleifen über 8,6 Mio. Proben auf dem Hauptfaden) **141 ms**, `vr1Job` 23–31 ms, `tkPlayBuf` 24–32 ms, `g4Call` 24 ms. Die übrigen 51–70-ms-Aufgaben sind keiner VOXR1-Funktion zuzuordnen; vermutlich kommen sie aus dem Neu-Rechnen der Gesangs-Effekte bzw. der Welle für die neue Fassung. |

Auf dem iPhone ist mit etwa dreimal so langen Aufgaben zu rechnen. Der Entwickler-Test misst Long Tasks nur während eines rohen
Worker-Auftrags, nicht auf dem Weg „Anwenden“ und nicht beim Prüfen über das Blatt.

## Ergebnis
- Node-Kern: 45/60.
- App: 12/14.

Offen bzw. abgelehnt:
1. **Brumm-Erkennung** versagt auf 2 von 4 Take/Netz-Kombinationen (hohe Stimme bei 50 Hz, tiefe Stimme bei 60 Hz). Das ist ein
   P4-Abnahmepunkt.
2. **Plopp-Reparatur:**
   - Abzug ≥ 12 dB nur 8/10 und 8/10;
   - Obertöne ≤ 1 dB nur 6/10 und 7/10, Grundton bis −13 dB;
   - Vor-Echo +15 dB an einem Einsatz im sauberen Take A.
3. **Long Tasks:**
   - `vr1Q16` 141 ms auf dem Hauptfaden beim Anwenden eines 3-min-Takes;
   - weitere 51–112-ms-Aufgaben;
   - beim Prüfen 54/64 ms durch die Kopie des Takes.
4. **Raumton:**
   - Klangfarbe 9,7 / 6,6 dB in einer von 2 Lücken;
   - in Take B wird der stille Anlauf (−94 dB) als Raumton gelernt.
5. Klicks knapp im Ziel (18/20 in C@48). Die Reparatur macht an 2 Stellen den Fehler größer.
