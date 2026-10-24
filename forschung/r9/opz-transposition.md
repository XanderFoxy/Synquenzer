# OP-Z: Transposition über die Master-Spur (Quelle: OP-Z Guide, Kapitel 14 „master“, von Xander am 24.10. geschickt)

- Die Master-Spur transponiert ausgewählte Spuren und erzeugt Akkordfolgen.
- Der OP-Z analysiert die Noten der Spuren Bass, Lead, Arp und Chord und erkennt daraus **Tonart und Modus** des aktiven Patterns; der **Bass** ist die Hauptquelle.
- Mit den Klaviertasten wird das Pattern transponiert und dabei **Tonart und Modus** gewechselt → musikalische (tonleitergebundene) Transposition, nicht nur Halbtöne.
- Welche Spuren mitgehen: Shift halten + Spurtasten (LED an = dabei). Oktave über die Transpose-Tasten. Tipp: Drums transponieren für Fills.
- Akkordfolgen: Akkorde auf der Master-Spur programmieren; Abspielgeschwindigkeit über Track+Shift+Wertetasten (4 = Vier-Takt-Schleife).
- Notenstil der Master-Spur: **latch** (ab OS 1.2.12; quantisiert auf gerade Schritte, Note bleibt bis Taktende) │ **free** (Micro-Timing, kein Latch).
- Nicht im Guide beschrieben: wie Noten außerhalb der erkannten Tonleiter behandelt werden.

## Folgerung für SYNQUENZER
Unser Modus AKKORD + feste/erkannte Tonart + „Ein Ton = Stufe in der Tonart“ entspricht dem OP-Z-Prinzip; dazu kommt der Skala-Quantisierer (V2c′, vorgezogen nach VS2) für schräge Töne. Offener Punkt: Tonart-Erkennung mit Bass-Gewichtung wie beim OP-Z prüfen/ergänzen.

# OP-XY „brain“ (Quellen: Sound On Sound Review, TE-Guide „auxiliary“/„how to“, Elektronauts, op-forums; 24.10.)
- Brain = Transpositions-Spur (Hilfsspur 1): erkennt Tonart und Skala des Songs (oder gewählter Spuren); Schalter automatisch │ manuell.
- Tastatur transponiert die ins Brain geführten Spuren **in Skalenstufen innerhalb der Tonart** (SOS: in C-Dur führt E zu E-Phrygisch = Töne von C-Dur ab E). Transponierte Töne werden **in die Skala gezwungen** (laut Nutzer anders als beim OP-Z).
- Routing je Spur (M2-Seite): nicht geführte Spuren bleiben fest. „Link“ erlaubt über den Song zu spielen, während live transponiert wird.
- Akkordwechsel als Schritte auf der Brain-Spur programmierbar (Geschwindigkeit z. B. 4 = langsame Folge).

# Abgleich SYNQUENZER (Stand 4.5.0)
| OP-Z / OP-XY | SYNQUENZER |
|---|---|
| Tonart/Modus automatisch erkennen, Bass zählt am meisten | vorhanden (detectKey, Bass ×2, Modus nach geringstem Rest) |
| Spuren wählen, die mitgehen | vorhanden (FOLGEN je Spur, ⇅ fest) |
| Brain: Stufen-Transposition in der Tonart (E in C → E-Phrygisch) | vorhanden als TONART |
| OP-Z: Taste wechselt Tonart und Modus | vorhanden als AKKORD (+ „Ein Ton = Stufe“), folgt zusätzlich der Akkordqualität |
| Akkordfolge auf Master-/Brain-Spur | vorhanden (Akkord-Zeile je Szene, V2c) |
| Latch | vorhanden (LATCH) |
| Töne zwangsweise in die Skala (Brain) | **fehlt → Skala-Quantisierer (V2c′, nach VS2)** |
| Drums mittransponieren (Fills) | prüfen/klein ergänzen |
| Tonart automatisch │ manuell sichtbar umschalten | prüfen |
Folgerung: kein eigener OP-Z-Nachbau für die Transposition nötig; Lücken mit dem Skala-Quantisierer schließen.
