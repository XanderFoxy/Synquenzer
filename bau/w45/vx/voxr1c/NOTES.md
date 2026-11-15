# VOXR1C – Prüf-Befunde aus VOXR1B/PRUEFUNG.md (15.11.2026)

Basis: basis.html = rel-4700/index.html (4.70.0). index.html = vx/voxr1b/index.html + 16 Änderungen, **alle im Block VOXR1-BEGIN…END**
(Kommentar `VOXR1C`), außerhalb des Blocks gleich voxr1b (geprüft). Kein neues Aussehen, keine neue Bedienung. VERSION unverändert.
Erzeugt mit `patch.cjs` (reps.cjs, reps2.cjs, reps3.cjs; jede Ersetzung genau 1×).

## Behoben
1. **Brumm-Erkennung** (`humFind`, schwer):
   - Grobe f0-Suche nach Linien-Schärfe (Oberton gegen Nachbarn ±off, je 0…30 dB, Gewicht 1/k) statt roher Summenleistung –
     rastete bei hoher Stimme auf einen Gesangs-Teilton ein (61,75 statt 50).
   - Feine Suche (±0,1 Hz) nur über die klaren Obertöne (≥ 10 dB über den Nachbarn).
   - „an“: ≥ 2 der ersten 7 Obertöne ≥ 10 dB und Oberton 1 oder 2 ≥ 10 dB, oder eine klare Grundlinie allein (≥ 15 dB, ≤ 0,5 Hz neben 50/60).
   - Kerben-Güte 60 statt 30 (`HQ`): mit 30 kostete Take C@48/50 Hz 0,69 dB Gesangsband.
   - Prüfer-Kern: 4/4 erkannt, alle 28 Kerben 29,1–30 dB, Gesangsband −0,11 … −0,32 dB; 49,6 Hz: f0 49,6007, Kerben 29,9–30.
   - Eigene Reihe `hum.mjs` (6 Takes × 50/60/49,6/60,3 Hz × fallend/gleich × −20/−30 dB): 100/102; 0 Fehlalarme in 6 sauberen
     Takes; offen nur Take A bei −30 dB (60 Hz, außerhalb P4).
2. **Long Tasks Anwenden** (mittel/schwer):
   - „nur Entferntes“ wird im Worker zu Int16 (`run` mit `o.q16`, gleiche Formel wie `vr1Q16`) – die 141-ms-Schleife auf dem
     Hauptfaden entfällt (nur angewandte Fassung ohne SÄUBERN; mit SÄUBERN bleibt `vr1Q16`).
   - `vr1Job`: Kopie des Takes in Scheiben zu 1 Mio. Proben statt `x.slice()` (Prüfen und Anwenden).
   - `vr1Render`: AudioBuffer in Scheiben füllen; `clResync` in eigener Aufgabe nach `tkPlayBuf`.
3. **Raumton** (mittel):
   - Läge das Leiseste > 40 dB unter dem 10-%-Wert des Takes, zählen Rahmen darunter wie digitale Stille
     (Take B lernt −55,3 statt −93,9 dB). Sonst wie bisher (Take C unverändert −70,9).
   - Lücken nur zwischen Klang: stiller Anfang/Ende des Takes wird nicht gefüllt (sonst 15 456 Proben im Anlauf von B geändert).

## Nicht behoben (offen)
- **Plopp-Reparatur** (schwer): Abzug B 8/10, C 8/10; Obertöne B 6/10, C 7/10; Vor-Echo in Take A – unverändert (Zeit).
  Plan: Teiltöne im Stoß aus der Lücke selbst nachjustieren (kleinste Fehlerquadrate je Teilton mit Hüllkurve 2. Ordnung,
  zusammen mit einem Tiefton-Satz < 80 Hz für den Stoß; Vorhersage von Rand zu Rand als gedämpfter Ausgangswert). Das nimmt auch
  das Vor-Echo (Stärke folgt dem, was in der Lücke klingt).
- **Raumton-Klangfarbe** C (9,7 / 6,6 dB in einer Lücke), wenig Testgut (2 Lücken in C, keine in B).
- **Klick-Reparatur** an 2 Stellen größerer Fehler über 2 kHz (nur Info, Klicks im Ziel).
- Sauberer Take A@48: 15 eigene Tiefstöße (wie VOXR1B gedeutet), „mittel“ ändert 44 Rahmen – hängt an der Plopp-Reparatur.
- Long Tasks außerhalb des Blocks (`tkPlayBuf`, `g4Call`, Welle/Gesangs-Effekte) nicht angefasst.
