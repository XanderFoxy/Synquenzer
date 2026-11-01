# G9B – Änderungen gegen App 4.26.0 (basis.html) · 4.26.2

- VERSION 4.26.2 (APP_CODE 4026002), `live: true` unverändert.
- **Neu: Sprachmodell im Browser** (Block in `sq-g9-src`, Quelle auch als `src-asr.js`): `G9A`-Liste (13 Dateien, Größe + SHA-256),
  Modul-Worker aus Blob (Laden in Stücken mit Fortschritt, SHA-256, `caches.put` in `synq-g9-asr-v1`; Bibliothek + Laufzeit als Blob-URLs
  aus dem Cache; `env.fetch` wirft → die Bibliothek lädt nie selbst; feste Revision in `remotePathTemplate`), Weg-Wahl WebGPU/WASM
  (`?g9how=` für Tests), eigene Sprach-Erkennung de/en (ein Decoder-Schritt), Wort-Zeiten, Token-Obergrenze je Fenster,
  Rückfall WebGPU → WASM (beim Start oder Rechnen; gemerkt, WebGPU-Dateien wieder gelöscht), Worker-Ruhe nach 3 min.
- Andock-Stelle `G9.asr` = `g9AsrRun`, `G9.rec` = {cached, size, load, recognize, remove, stop}; Ablauf Vorstufe/Fenster/Rückrechnung/
  Silben/Undo bleibt der vorhandene G9-Kern (G9b-V).
- Kopf-Taste [Erkennen] sichtbar; während Laden/Erkennen [Stopp]. Info-Zeile zeigt „Sprachmodell lädt … x/y MB · %“.
- Erkennen-Blatt: freier Platz (+ „WLAN empfohlen“), Diagnose-Zeile mit `?g9diag=1`.
- [Stopp]/Aufnahme hat Vorrang/Projektwechsel beenden auch den Modell-Worker (Aufnahme unterbricht kein laufendes Laden).
- Automatik (F1): nur wenn das Modell im Cache liegt; nach einer Aufnahme lädt der G9-Block dafür auch ohne vorher geöffneten Text-Modus
  (Merker `synq-g9-asr` in localStorage).
- Test-API: `g9Asr()`, `g9AsrLoad()`, `g9AsrStop()`, `g9AsrRemove()`; `g9AsrSim(null)` dockt das echte Modell wieder an.
- sw.js: nur Kommentar (`synq-g9-*` war schon geschützt) → `sw.diff`.
