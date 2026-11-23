# SPKV – Stand
- Auftrag: Spektral „Verfeinern“ (Bass/Drums): Kick-Erkennung über Anschläge im Takt-Raster, Bass-Anschläge mit tonalem Verlauf nicht als Kick, Bass-Grundton-Lage prüfen.
- Ansatz: Nachbearbeitung der Verfeinern-Schätzung (nur Ziel bass/drums) als Block in spk1DspMake vor `async function verfeinern` + 1 Haken nach `refineEst(...)` in verfeinern. Läuft im Worker (toString).
- Kern-Test-Datei: test/kern-spkv.mjs (in Arbeit)
