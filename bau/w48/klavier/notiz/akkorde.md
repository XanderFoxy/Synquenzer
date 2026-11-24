# akkorde – Stand
Dateien: app/js/akkorde.js, tastatur.js, wiedergabe.js, uebungen.js. Tests: test/akkorde.test.mjs (Node, grün), test/rauch.mjs + test/rauch-akkorde.html (Chrome 428×926 hell, 926×428 dunkel). Fotos: fotos/akkorde-rauch-*.png.

## Für die Einbindung (über den Vertrag hinaus)
- akkorde.js: analysiere(stück, {nurSystem}) → Segmente; zusätzlich farbKarte(segmente,{dunkel,nurSystem}) → Map noteId→Hex (direkt für zeichne({farben})), rollenKarte, segmentBei(segmente,q), akkordAusMidis(midis), notenName(midi|schreibweise) (A₂ … C … c … c1), ortImSystem(s,'bass'|'violin'), intervallName(h), ROLLEN_FARBEN/rollenFarbe.
  Segment: {von,bis,takt,name,kurz,grundton,art,artText,umkehrung,umkehrungText,bassFremd,bass,bassVoll,bassMidi,rollen,neu,noten,intervalle,lage:'eng'|'weit',spanne,erklaerung,sicherheit,unvollstaendig}.
  Oktave in schreibweise wie MusicXML (4 = c1).
- tastatur.js: tastatur(el,{von,bis,namen:'c'|'alle'|'aus',breite,hoehe,sofort,beiTipp}) → {zeige(set,farben,beschriftung), leuchte(midi,rolle,ms), aus, alleAus, scrolleZu, scrolleZuBereich(a,b), zeigeBereich(a,b,text), setNamen}. farben-Werte: Rollenname oder CSS-Farbe. Stil wird selbst eingefügt (kl-*), hell/dunkel über prefers-color-scheme oder data-theme="dark|dunkel|light|hell".
- wiedergabe.js: spieler(stück,{onNote(note,{an,stumm,runde}),onZeit(q),onEnde}) → {spiele(vonTakt,bisTakt,{schleife,tempoFaktor,nurHand}), stopp, setzeTempo(f), laeuft}. nurHand: andere Hand stumm, onNote kommt trotzdem (stumm:true). Außerdem ton(), klinge(midis,{arpeggio}), audioKontext()/entsperren() (im Tipp aufrufen; setzt navigator.audioSession='playback' für iPhone-Stummschalter).
- uebungen.js: uebungen(el,{start:'lesen'|'akkord'|'intervall'}) → {zeige(id), tastatur, zerstoere}. Eigene große Bass-System-Grafik (zeichneBassSystem exportiert), Merksätze „Geh Heim, Du Fauler Affe" / „Alle Cowboys essen Gras", ohne Punkte.
