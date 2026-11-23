- 16:14 apply.py + block.js gebaut (2 Haken: clipNoteFor, Takt-Planung), Test folgt
## Aufbau (Ausgang index.html md5 d33e9f1ed7baa69e92d7db5d729a65c4, Eingang a7515b98… = 4.86.0)
- Block TRP2-BEGIN…TRP2-END vor `function trp1Live` (neue Namen: trp2NoteFor, trp2Tick, trp2Re) + 3 Haken `/*TRP2*/`:
  1. clipNoteFor (1. Zeile): bei ▶ SONG in einem Stufen-Teil sucht trp2NoteFor die Clip-Note, deren outPitch (mit trp1Pre) = gespielte Note (sonst null → alter Weg).
  2. Takt-Planung vor `kf1Plan`: trp2Tick ruft an jeder Stufen-Grenze im Fenster applyCarrierChange({time}) → gehaltene Clip-Noten neu stimmen (wie XP.due bei Rückungen), nach dem Einplanen der Noten.
  3. markReplaceAll (Teil-Änderung auf alle Stellen, z. B. nach Konsolidieren): trs/trn der alten Marke auf die neue Marke (je Takt, trp1PerPut).
- Ohne Marke mit trs: alle 3 Wege kehren sofort zurück (bitgleich).
## Kern-Test-Datei: trp2-test.js  (node trp2-test.js <port> <srv-Ordner>; Ergebnisse vorher.json = Eingang, nachher.json = Ausgang)
## Ergebnis
- Aufnahme Teil 3: 12/12 → 0/12 falsch (fest + folgend, mit/ohne Akkorde), MIDI 69→71 → 69→69; Teil 2: 0/12 → 0/12.
- Gehalten über Grenze Takt 4|5 und 6|7: 2/2 → 0/2 falsch.
- Konsolidieren (konDo) behielt trs schon (0/339); Teil-Änderung danach (markReplaceAll): 118/339 → 0/339, trs weg → bleibt; Zurückholen 0/339.
- Pflicht: MS 2000 1×, live 1×, verbotene Zahlen 0, doppelt.js neu [] , smoke 428×926 + 926×428 ohne Fehler.
## Offen
- Teil aus der Teile-Leiste neu in den Song setzen (partChunk) bringt keine Stufen mit – Stufen gehören zur Marke, nicht zum Teil (wie bisher); Teil allein abspielen ebenso ohne Stufen.
- MIDI-Export: gehaltene Noten behalten die Tonhöhe ihres Anfangs (MIDI kann nicht umstimmen) – unverändert.
- Echte Mikrofon-/Tasten-Aufnahme nicht Ende-zu-Ende gefahren; geprüft über clipNoteFor/outPitch zur Wiedergabezeit + MIDI-Export.
