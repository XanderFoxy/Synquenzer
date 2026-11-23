# KE2 Stand (FERTIG, kleiner geliefert als bestellt)
- Eingang 4.86.0 (md5 a7515b980ddc423e84f9d5cdf8f132a6). Ausgang `out.html` = `python3 apply.py <eingang> <ausgang>` (md5 851db9d4df97e9ec25438604d6dd730b).
- Änderung: EINE Zeile im stillen Block sq-ke1-src: `const CAL = /*KE2*/ {...}` – nur die Gewichte `mk` (Engine 3) neu (aus `cal.json`), `va`/`fm` unverändert.
  Ansicht, Texte, Erkennung (Welle, Filter, Suche) bitgleich; nur die angezeigten Gewissheits-Werte/Wörter der Engine-3-Karte ändern sich.
- Kern-Test: `w/kt.mjs` (Node; Kern direkt aus der HTML über `w/kern.mjs`, Testtöne per renderH der App-Engine 3, Mikro-Simulation; Vorlagen `w/tpl.json` aus `w/tpl.cjs`),
  Auswertung `w/ausw.cjs <präfix>`, Nach-Eichung `w/fit.cjs` (logistisch, zum alten Gewicht gezogen), `w/neucal.cjs` (rechnet gespeicherte Merkmale mit cal.json neu).
  Aufruf z. B.: `node w/kt.mjs out.html w/x-0.json 20261118 48 0/4 full` (4 Teile parallel), dann `node w/ausw.cjs w/x`.
- Läufe: Testsaat 20261118 (48 Töne, `w/vor-*.json` / mit neuer Eichung `w/vorC-*.json`), Eichsaat 20261117 (`w/eichv-*.json`, nur zum Eichen).
  - ECE 0,112 -> 0,091, Brier 0,158 -> 0,149 (Testsaat). src 0,088 -> 0,082, amp 0,173 -> 0,105, flt 0,181 -> 0,215 (schlechter), noi/mov gleich.
  - Wörter: sicher 93 Zeilen/98 % -> 101/98 %; ungefähr 10/90 % -> 20/50 %; geraten 137/41 % -> 119/39 %.
  - Eichsaat selbst: Brier 0,145 -> 0,130, ECE 0,056 -> 0,064 (10 Fächer, 240 Zeilen – rauscht).
- Welle aus dem Anschlag (`versuch-anschlag.js`, zwei Ansätze, NICHT eingebaut):
  (a) Rahmen-Fehler in den hellsten Anschlag-Rahmen (kurzes Fenster): Stufe 1 Eichsaat 30/60 -> 28/60.
  (b) filterfeste Merkmale (gerade Teiltöne 2/4 gegen Nachbarn, Krümmung 1-3-5), Gewicht 6: Eichsaat 30/60 -> 33/60, aber Testsaat Endergebnis 25/48 -> 23/48,
      Stufe 1 29/48 -> 24/48 (`w/nach-*.json`). => verworfen.
- Pflicht: MS 2000 1x, "  live: true," 1x, Sperrwörter 0, doppelt.js: neu [] ; Browser 428x926 Touch: errors [], echte Erkennung im Worker liefert Ergebnis (`w/smoke.cjs`).
- OFFEN (ehrlich): Welle bleibt das schwache Glied (~50 % auf diesem Korpus). Häufigste Verwechslung: Puls/Dreieck + 2. Oszillator -> Sägezahn.
  Nächster Hebel wohl die Wellen-Entscheidung zusammen mit OSZ 2 (Schwebung) statt getrennt; Filter-Zeile der Eichung braucht ein besseres Merkmal.
