# Wünsche von passt an andere Bereiche

1. module/muster/baum.js Zeile ~43: `${e.deutlich} · ${e.wort}` zeigt „undefined“, wenn ein Modul kein `wort` liefert (gehört nicht zum Vertrag).
   Vorschlag: `${e.deutlich} · ${e.wort || (e.richtung || '').split(/[.–]/)[0]}` oder nur `e.deutlich`. passt liefert wort+pol schon.
2. sw.js: keine neue Datei in module/passt/ – nur Prüfsummen neu erzeugen.
3. Optional (kern): wenn ui.richtung() fertig ist, kann passt/modul.js richtungHtml() darauf umgestellt werden (gleiche Daten: titel, pole, deutlich, text).
