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
- 21:07 spk9-ui.mjs (Playwright, Touch 428×926): nachher Legato → 57 0,992–1,995 · 62 1,995–2,997 · 59 2,997–4,087 (+ kurzer Vorlauf 57 0,90–0,99 wie in der SPK6-Prüfung); D4 per Touch 2 Zeilen hoch → Anwenden 513 ms: E4 +1,77 ct, A3 −0,1 ct, H3 −1,58 ct → ok. vorher (basis): eine Note 59 0,992–4,082, D4 nicht wählbar.
- 21:09 spk5-test ALLES OK 24/24 (53 s) · spk5-fade-test ALLES OK (35 s) · spk9-ui erneut ok (Anwenden 580 ms). Markenwörter-Zähler basis 25 = index 25, 0 in Block/Tests/Notizen; MS 2000 1×, live 1×, VERSION 4.63.0.
- 21:14 spk6-test ALLES OK (36 s, kern 24/24) · spk6-pruef-test ALLES OK fails 0 (139 s) · spk1-test 17/18, FEHLER nur verfeinern-verbessert-ziel (wie in spk4-test reg-spk1, Basis 4.63).
  Pflicht direkt: topdefs doppelt 0 / Syntaxfehler 0 · dupkeys 0 · smoke errors [] (smoke-spk9.png) · einbau.py baut bitgleich.
  Endmessung leg.mjs (nachher-mono.json): wie a4. 44,1 kHz (nachher-mono-44k.json): L 98,3 % / 1,7 % · V 0 % · G 96,9 % / 9,4 % · A 0 % · B 12/12.
  Neue Kategorie R (schnelle Legato-Läufe, Töne 0,15–0,24 s, 1–2 HT): vorher 1,4 % (1/72) → nachher 100 % (72/72), 0 Zusatz.
  Probe trN (Übergangs-Regel bis 2,5 HT vor dem Ziel, nur Node per O9, nicht eingebaut): G-Zusatz 3,1 %, aber R 91,7 % → verworfen;
  zweite Stichprobe (ONLY=R,G) mit eingebautem trN 1,5: G 3,1 % Zusatz, R 94,4 %. G-Zusatz je nach Stichprobe 3–12,5 % (beide zusammen 7,8 %).

## Prüfung (Prüfer, unabhängig)
- 22:05 Pflicht direkt auf index.html: topdefs Skripte 26 / Namen 7460 / doppelt 0 / Syntaxfehler 0 · dupkeys 0 · smoke errors [] (pruef/smoke-pruef.png) ·
  „MS 2000“ 1× · „  live: true,“ 1× · VERSION 4.63.0 = Basis · Markenwörter (13er-Liste) 17 = Basis 17 · keine Marken-/Datensatz-/Produktnamen in Block, Tests,
  Notizen, pruef/ · einbau.py baut bitgleich.
- Regression einzeln nacheinander (Kopie pruef/reg/): spk4-test 6 FEHLER/23 (bekannt/erwartet, s. PRUEFUNG.md) · spk5 24/24 · spk5-fade OK · spk6 OK ·
  spk6-pruef fails 0 · spk1 17/18 (verfeinern-verbessert-ziel wie Basis).
- Befunde (9, davon 5 mittel, 4 leicht) mit Messwerten in PRUEFUNG.md.
