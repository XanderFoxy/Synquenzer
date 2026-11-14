# SPK9 – LOG (Legato-Noten der Spektral-Seite)

- 20:41 Start. index.html = basis.html = basis7.html (4.63.0, cmp gleich).
- 20:45 Ursache gefunden (SPK2 segNotes): Tonwechsel-Grenze wird verworfen, wenn ein Fluss-Anschlag ≤ 70 ms daneben liegt (`near`),
  der Anschlag selbst zählt aber nur mit Pegel-Anstieg ≥ 3 dB – bei Legato steigt der Pegel nicht → keine Grenze, eine Note (Median-Ton).
- 20:49 Block spk9-block.js + einbau.py (4 Anker je 1×). Befund-17-Fälle (Delle ohne/50/25/0 %): vorher 0/12 getrennt → nachher 12/12, 0 Zusatz.
