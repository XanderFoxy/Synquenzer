# TON2 – Stand (fertig)
- Ausgang: index.html = python3 apply.py ../rel-4860/index.html index.html (md5 f714174b731b2d82d47ff897ca2ef62f)
- 4 Haken (/*TON2*/) + Block TON2-BEGIN/-END vor tkLoad:
  1. tkPcm: Stücke mit Vorab-Fenster (TON2_W=6) parallel anfordern, weiter in Reihenfolge einsetzen (gilt für alle Leser von tkPcm).
  2. tkLoad: ton2Load = tkPcm + gemerkte Analyse (<take>:lv1 im Audio-Speicher, ArrayBuffer: Kopf-JSON + Float32-Hüllkurve nur in Begrenzer-Abschnitten) gleichzeitig.
  3. tkLoad: ton2Use übernimmt die gemerkte Analyse in VP.m (prüft Kennung des Rechenwegs = Hash über vp*-Funktionen + Konstanten, und Fingerabdruck des Puffers: Länge, Rate, 4096 Proben) -> vpKick rechnet nichts.
  4. vpFinish: ton2Done merkt jede frisch fertig gerechnete Analyse eines Roh-Take-Puffers (TK.buf) einmal (alte Projekte: erstes Laden rechnet und merkt).
- Aufräumen: Schlüssel <take>:lv1 folgt der Take-Kennung (tkGc/g10cGcPlan behalten/löschen nach Präfix wie clMake-Info).
- Debug vpEnv: Hüllkurve außerhalb der Begrenzer-Abschnitte nach Übernahme = 1 (Klang unberührt; eb/segs/g bitgleich).
- Kern-Test: sonde.js (node sonde.js <port> orig 180 [verz] [amp] [alt]) bzw. lauf.sh <port> <label> 180 …
- Weitere Tests: gleich.js (bitgleich gemerkt vs. frisch, altes Projekt, falscher Fingerabdruck, Aufräumen), zeit.js / lesen.js (Teilschritte), rauch.js, doppelt.js.
- Offen/ehrlich: Puffer bauen (Int16->Float, ~27–36 ms) bleibt; Verzögerungs-Option der Sonde (verz) wirkt nicht auf den Audio-Speicher (der wartet auf Transaktions-Ende), daher keine Zahlen für langsamen Speicher.
