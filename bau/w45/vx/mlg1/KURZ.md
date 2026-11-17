# Neu: Klang aus DAW-Datei übernehmen + 10 Retro-Werksklänge
- Öffnen: Klang-Editor einer Synth-Spur › oben den Klangnamen (zwischen ‹ ›) antippen › Klang-Browser › unten **„Aus DAW-Datei“** (nur bei Synth-Spuren, nicht bei Drums).
- DAW-Projekt (.cbp) wählen. Es kommt eine Liste aller Synth-Spuren der Datei mit Wellen und Cutoff. Eine antippen = dieser Klang liegt auf der Spur. ↶ holt den alten zurück.
- Danach „↳ Hall/Echo wie im Preset“: stellt das Projekt-Echo so ein wie das Delay im Synth (links ganze, rechts halbe Zeit). Eigenes ↶.
- Die Datei wird nur gelesen, nichts wird gesendet. Sample-Spuren bleiben draußen.
- Neu in der Liste „Alle“ und in Bass/Lead/Fläche/Pluck/Poly/Sequenz/Effekte: Retro-Bass Rund/Tief, Retro-Lead Hell/Weich, Retro-Fläche Warm/Hauch, Retro-Pluck, Retro-Stab, Retro-Sequenz, Retro-Resonanz (eigene Werte).
- Wie nah: gegen echte Spur-Exporte gemessen. Nur der Klang: im Mittel 6,6 dB daneben. Mit dem Spur-EQ der App dazu: 3,4 dB (8 von 14 Spuren unter 3 dB). Der Rest steckt in den Effekten der DAW-Spur (EQ, Verzerrer), nicht im Synth.
- Vorschlag (noch nicht gebaut, sieht man): zusätzlich die EQ-Effekte der DAW-Spur in den Spur-EQ übernehmen („↳ EQ wie in der DAW“). Gemessen 6,6 → 5,1 dB, bei reinen EQ-Spuren bis 1,1 dB.
- Fotos: fotos/mlg1-p-browser.png, mlg1-p-liste.png, mlg1-p-geladen.png, mlg1-p-werk.png, mlg1-l-browser.png, mlg1-l-liste.png, mlg1-l-geladen.png
- Geprüft (unabhängig): Messung neu gemacht, mit dem echten Spur-EQ der App: 3,2 dB, 8 von 14 – die Zahlen oben stimmen. Kleine Korrekturen: das Lesen der Datei ist robuster (eine kaputte Spur verwirft nicht mehr die ganze Datei), und bei sehr kurzen Echo-Werten (1/16 punktiert, 1/16 Triole, 1/32) sagt die Meldung jetzt „angenähert“, weil rechts nicht genau die halbe Zeit möglich ist.
