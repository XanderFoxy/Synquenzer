# SX9 – Versionen eines Clips (Basis R-4310, App 4.31.0)

Dein Wunsch vom 24.10.: „Refrain 2 mit anderem Bass, ohne das Original zu verlieren.“

- **Zelle im Song halten** → im Blatt steht jetzt oben **„Versionen: v1 · v2 · ＋“**.
  - **＋** macht eine Kopie der Version, die hier gerade spielt, setzt sie an diese Stelle und öffnet gleich den Editor.
  - **Tipp auf v1 / v2 …** setzt diese Version **an dieser Stelle** – das ist der ganze Teil (z. B. „Refrain“), in dem die Zelle liegt. Ohne Teil-Marke nur dieser Durchlauf.
  - **[Überall v2]** setzt die Version an jeder Stelle im Song, wo dieser Clip spielt.
  - **[v2 bearbeiten]** öffnet v2 im Editor. Eine Änderung gilt überall, wo v2 steht.
- **Schild „v2“** auf der Zelle (Kästchen- und Glas-Ansicht, auch in der Song-Ansicht im Video).
- **Editor-Kopf** zeigt, was du bearbeitest: „SYNTH 2 · SZENE 1 [v2]“, darunter „Version v2 · 16 Noten“. Beim Original steht „[v1]“, sobald es Versionen gibt.
- **v1 bleibt immer das Original** (der Szenen-Clip). Versionen gehen nicht verloren, auch wenn sie gerade nirgends im Song stehen.
- Die Version spielt **im Takt weiter wie das Original** (gleiche Phase), danach geht es genauso weiter wie vorher.
- **Je Geste ein Rückgängig** (＋, Tipp, Überall). Eine Bearbeitung im Editor ist ein Rückgängig wie bisher.
- Wiedergabe, Konsolidieren, Video-/WAV-Export, MIDI-Export, Speichern/Laden und Online-Abgleich nehmen die gewählte Version (gleicher Weg wie „eigener Clip“).
- Teil kopieren / verschieben: die Kopie spielt **dieselbe** v2 (kein zweites „v2“).
- Höchstens 8 Versionen je Clip (v1 … v8).

Daten (Format 5, nur additiv): eine Version ist ein Eintrag in `song.own` mit `ver: 2…8` und `from {t, s, bar: 0}`; die Song-Zelle verweist mit `own: id` darauf. Alte Projekte ohne `ver` bleiben Zeichen für Zeichen gleich.
