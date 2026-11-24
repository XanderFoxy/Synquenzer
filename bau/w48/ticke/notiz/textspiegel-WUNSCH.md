# textspiegel – Wünsche an fremde Dateien (Zusammenbau)

1. **sw.js / test/sw-liste.mjs**: neue Datei `./module/textspiegel/aeste.js` in DATEIEN + PRUEF aufnehmen (statisch von modul.js importiert – fehlt sie im Cache, bricht der Text-Spiegel offline).
2. **module/liste.js**, Eintrag textspiegel, Kommentar der Routen: `text · text/schreiben/<aufgabe> · text/spiegel · text/tiefer · text/blindtest` (text/claude leitet nur noch auf text/tiefer um).
3. **seiten.js ~Z. 315** (Hinweise-Seite): Satz „„Mit Claude tiefer lesen“ erzeugt nur einen Text zum Kopieren …“ ersetzen durch:
   „„Tiefer lesen“ im Text-Spiegel liest deine Texte genauer – ganz in der App, auf diesem Gerät. Nichts wird gesendet.“
4. **seiten.js ~Z. 64** Kachel Text-Spiegel: Untertitel „Was dein Text verrät – und was nicht“ kann bleiben; Vorschlag ohne Wertungsklang: „Wohin deine Texte gehen – in Worten“.
5. **ui.js marke()** (Kern): Evidenz-Marken sind 30 px hoch (< 44 px Tippfläche). Vorschlag in stil.css: `.marke{position:relative}.marke::after{content:"";position:absolute;inset:-7px -4px}` (Tippfläche größer, Aussehen gleich).
6. **Globale Quellen**: forer1949 (Blindtest) liegt in ./quellen.js – braucht dort `erklaerung`, url weg (macht Agent kern).
7. **passt** liest weiterhin `ergebnis('textspiegel').woerter` – unverändert vorhanden. Neues Feld `richtungen: { <ast>: { seite, deutlich, richtung } }` steht für andere Module bereit.
