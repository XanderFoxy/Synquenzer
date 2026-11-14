# SPK6 LOG
- 18:17 Start: index.html = basis.html = basis5 (4.60.0, cmp gleich). KARTE gelesen, Kern spk1DspMake (block/gainFn/render/Undo/flush/export) und SPK2-Noten gelesen.
- 18:35 Plan: Kern spk6DspMake im Spektral-Worker (Ops über Z2.ops), Haken: block-Kopf, gainFn (Kopien zählen nicht zum Rest), open/flush/export/import, Worker-Text, ZIP, Ebenen-Menü, Noten-Klappfenster. Eigener Phasen-Vocoder mit Formant-Erhalt (Node-testbar, deterministisch).
- 18:35 Kern gebaut (spk6-block.js, einbau.py 14 Ersetzungen). spk6-kern-test.mjs (Node) ALLES OK nach 2 Korrekturen: Filter 24 dB/Okt. (Butterworth, 2 Biquads), Kuhschwanz tief 250 Hz / hoch 4 kHz; Versatz-Messung im 1-ms-Raster statt Korrelation.
