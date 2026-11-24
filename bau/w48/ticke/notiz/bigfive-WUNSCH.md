# bigfive – Wünsche an den Zusammenbau

1. **sw.js** (DATEIEN + PRUEF): neue Datei `./module/bigfive/aeste.js` aufnehmen (wird von modul.js statisch importiert; fehlt sie im Cache, lädt das Modul offline nicht).
2. Optional: Wenn ui.richtung() vom Kern fertig ist, kann `poleHtml()` in module/bigfive/modul.js darauf umgestellt werden. Jetzt eigene Darstellung (bf-pole: zwei Kästen, der Pol, zu dem die Antworten zeigen, nur hervorgehoben – keine Linie, kein Punkt).
3. Für andere Leser (passt, training, textspiegel): Neue bigfive-Ergebnisse haben je Bereich `eigen: {pol, deutlich, n}` (Richtung nur aus den eigenen Antworten, pol 1 = BEREICHE.rechts, -1 = links, 0 = beides) und `wort` = gleicher Satz in Worten (z. B. „klar in Richtung „Neugier auf Neues““). Dazu top-level `facettenEigen`. `wert/stufe/klar/unten/oben` (T-Werte) bleiben nur zur Verträglichkeit – bitte NICHT mehr anzeigen. Feld `pr` (Prozentrang) gibt es in neuen Ergebnissen nicht mehr.
4. verwandt-IDs in aeste.js sind teils geraten: `interessen.riasec.A/I/S/E/C`, `interessen.ehrlichkeit`, `interessen.rhythmus`, `muster.*` – bitte an die echten IDs angleichen.
