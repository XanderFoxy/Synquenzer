# IMP2 – LOG (Tempo unabhängig von der Abtastrate)

- 20:58 Start. Paket-Ordner vx/imp2: index.html = basis.html (4.63.0). Gelesen: real/NOTES.md (Befund 4), imp/NOTES.md, imp1Core (down: k = floor(sr/11000) → 44,1k: 11 025 Hz, 48k/96k: 12 000 Hz, Dreieck-Filter).
- 20:59 Node-Prüfung imp2-node.mjs (imp1Core aus der Datei auf dieselben Stücke bei 22,05/44,1/48/96 kHz, mit ffmpeg-soxr umgerechnet, Audio liegt
  außerhalb von vx unter realvox/imp2rs). Basis (node-vorher.txt): App-Renders 92 4/4 · 120 3/4 · 120 6/8 · MP3 · Melodie 96 überall gleich und richtig;
  #10 gleich (112); #14 120,7 (22,05k/44,1k) gegen 132,6 (48k/96k); #1 118,6 (bis 48k) gegen 119,7 (96k, Box-Filter 8). FEHLER 2 Gruppen.
  Wichtig: die App dekodiert Importe immer auf 48 kHz (ggbDecode, GGB_SR 48000) → im Browser-Test gilt die 48k-Spalte; 44,1k kommt über Takes (m.sr) / SPK1.
- 21:07 Block IMP2 in imp1Core (nach down(), läuft so im Worker mit) + Haken 1. Zeile in down(). Erst 1 Stufe (Kaiser 50 dB, 140 Abgriffe bei 48k):
  Kennlinie gleich, aber 515 ms/180 s → 2 Stufen (→ 22 050 Hz breit, dann Halbband → 11 025 Hz): 220 ms; schrittweise Phase + 2er-Schleife: 175 ms (alt 35 ms).
  40/35 dB getestet: kaum schneller, Kennlinie je Rate bis 0,3 dB verschieden → verworfen, 50 dB bleibt. resp.mjs: Durchlass bis 5 kHz ±0,1 dB bei 22,05/44,1/48/96k,
  6 kHz −40 dB, ab 7 kHz ≤ −49 dB (alt: Dreieck, 5 kHz −5…−6 dB, 7 kHz −10…−13 dB, je Rate anders).
- 21:07 imp2-node.mjs nachher (node-nachher.txt): ALLE OK – #14 120,6 bei allen Raten (Spanne 0,05), #1 118,6 (0,00), #10 112,13 (0,00), Renders gleich+richtig.
  Unabhängige Einsätze aus der Tonhöhe (pitchons.mjs + fitcurve.mjs): an #1 geeicht (beste 119,5 = Annotation 119); #14: 120,6 Rang 0,8 % (mit ½×), 132,6 Rang 59 % → 132,6 (alt, 48k) war falsch.
  #10: 112 Rang 76 % (Tonhöhe) / 53 % (Modell-Noten) – bei allen Raten gleich, aber wohl nicht richtig (Rest-Befund, nicht abtastraten-bedingt).
