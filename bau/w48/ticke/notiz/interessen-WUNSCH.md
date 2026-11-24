# Wunsch von „interessen“ an den Zusammenbau

1. **sw.js – neue Datei offline mitnehmen:** `./module/interessen/texte.js` (Lern-Inhalt der Äste, wird von modul.js statisch importiert)
   muss in DATEIEN/PRUEF von sw.js (über `test/sw-liste.mjs` neu erzeugen). Ohne das lädt das Modul offline nicht.
2. **Quellen-Anzeige (kern.js zeigeBeleg + seiten.js Quellen-Seite):** module/interessen/quellen.js hat kein `url` mehr, dafür
   `erklaerung` (2–5 Sätze). Bitte `erklaerung` anzeigen (wie bei den anderen Modulen nach Regel 1).
   Neue Quellen-IDs: `holland1997`, `prediger1982` (nur in module/interessen/quellen.js).
3. **Routen, auf die das Modul verlinkt:** `#antworten/interessen`, `#muster`, `#muster/ast/interessen.<…>` (ehrlichkeit, riasec, R, I, A, S, E, C, rhythmus).
4. **antwortSetzen-Rückgabe:** `{ok:true, ergebnis:'neu'|'gemerkt'|'geloescht', hinweis?}` oder `{ok:false, fehler}` (dann nichts gespeichert).
   `hinweis` (z. B. Rhythmus: „Trag ein, wann du an Tagen mit fester Zeit …“) bitte auf der Antworten-Seite zeigen.
5. Optional, fremde Dateien: passt/modul.js zeigt Ehrlichkeit noch als `ui.band` mit „Bereich … von 100“, passt/regeln.js `weilR` schreibt
   „(Platz x von 6)“ und `weilY` „Schlafmitte … Uhr“ – das gehört zum passt-Agenten (Regel 2).
