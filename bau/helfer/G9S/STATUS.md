# STATUS g9-br-S (31.10.2026)

- **G9a Kern:** fertig (DOM-frei, Node-Tests grün). Schnittstelle fest: `SCHNITTSTELLE.md` (für `g9-br-U` / G9d).
- **G9b-V:** fertig (ohne Modell, ohne Netz). Andock-Stellen für G9b-2: `plan()` → Fenster an die Pipeline, Wörter je Fenster → `zurueck()` → `silben()`.
- **Offen:** G9b-0/1/2 (nach Freigabe F0), Einbau in die App (G9d: `tkExt().take`-Normalisierer, Undo `'ly'`, Marken-Haken in `wpEdit`,
  Worker-Ops `g9f`/`g9a`, Muster laden + Cache `synq-g9-v1`), Nachmessen auf echtem Gesang (K-G9 a/b).
- **Tests:** `cd bau/helfer/G9S/tests && node alle.mjs`. Messwerte: `CHANGES.md`.
