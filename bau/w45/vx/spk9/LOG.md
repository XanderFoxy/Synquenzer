# SPK9 – LOG (Legato-Noten der Spektral-Seite)

- 20:41 Start. index.html = basis.html = basis7.html (4.63.0, cmp gleich).
- 20:45 Ursache gefunden (SPK2 segNotes): Tonwechsel-Grenze wird verworfen, wenn ein Fluss-Anschlag ≤ 70 ms daneben liegt (`near`),
  der Anschlag selbst zählt aber nur mit Pegel-Anstieg ≥ 3 dB – bei Legato steigt der Pegel nicht → keine Grenze, eine Note (Median-Ton).
- 20:49 Block spk9-block.js + einbau.py (4 Anker je 1×). Befund-17-Fälle (Delle ohne/50/25/0 %): vorher 0/12 getrennt → nachher 12/12, 0 Zusatz.
- 20:53 leg/leg.mjs (Node, Kern aus der Datei, 76 Fälle, 48 kHz, Ebene Gesang, einstimmig). vorher (basis) → nachher (index):
  L Legato 32 Phrasen/172 Töne getrennt 13,4 % → 98,8 %, Zusatz 9,9 % → 1,2 % · V Vibrato 16 Zusatz 18,8 % → 0 % ·
  G Gleiten 16 getrennt 71,9 % → 96,9 %, Zusatz 96,9 % → 12,5 % · A Ausklang 8 Zusatz 25 % → 0 % · B Befund 17: 0/12 → 12/12.
  Schritte: a1 (Hysterese + ruhig 50 ct) G-Zusatz 97 % · a2 (ruhig 25 ct/60 ms, Vibrato-Band) 56 % · a3 (Übergang < 0,17 s) 50 % (alte G-Wahrheit) ·
  a4 (Übergang < 0,25 s, ≤ 1,5 HT zum Ziel, G-Wahrheit = Mitte des Gleitens) 12,5 %.
- 21:00 spk4-test: 6 FEHLER/23; neu gegenüber basis7: reg-spk2-test noten-erkannt (Bass-Band Original 14 → 12 Treffer, Präz. 0,275 → 0,214) → Regel nur für fb > 400 Hz (Bass-Band bleibt SPK2). Rest wie basis7 (gemisch/unison-besser identisch zu basis7, verfeinern +1 dB, ki1 quer).
- 21:02 Probe-Merge (git merge-file, Basis basis7): SPK9 + SPK8 (auf 4.63 gehoben) 0 Konflikte; SPK9 + VX2 (auf 4.63 gehoben) 0 zusätzliche Konflikte. Seiten-Test spk9-ui.mjs geschrieben (Befund 17 per Touch 428×926).
- 21:06 spk4-test (nach Bass-Band-Regel): 5 FEHLER von 23 = genau die Liste des SPK8-Pakets (gemisch-besser, verfeinern +1 dB, unison-besser, reg-spk3 [verfeinern/abstaende-besser/spk2 bekannt], reg-ki1 quer). reg-spk2-test 28/30 OK (noten-erkannt wieder 14/51). Pflicht im Lauf: topdefs 0/0, dupkeys 0, smoke [], MS 2000 1×, live 1×, VERSION 4.63.0. vx1-test 61/61.
