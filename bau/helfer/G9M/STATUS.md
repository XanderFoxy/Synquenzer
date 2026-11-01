# G9M – Stand (Zweig g9-merge): 4.25.2 + Songtext G9 = **4.25.3**
- **Fertig gebaut, getestet** – wartet auf Xanders „Bitte prüfen“. Nicht online (kein main, kein PR).
- Lieferung: `index.html` (4.25.3, APP_CODE 4025003, `live: true` unverändert), `patch-g9.diff` (gegen `bau/snapshots/R-4252.html`,
  `patch` ergibt genau `index.html`), `sw.js` + `sw.diff` (`synq-g9-*` bleibt beim Aktivieren), `vendor/g9/` (→ `/Synquenzer/vendor/g9/`),
  `CHANGES.md` (Abschnitt für `bau/CHANGES-V3.md`), `tests/`.
- Merge: 3-Wege, 4 Konflikte, alle mit beiden Seiten gelöst (vs.mel + g9, vpKick + map, VP_API + G9_API).
- Probe-Ergebnis eingearbeitet: Tastatur offen → keine Haptik-Labels und auf iOS kein Tick per Code; Tastatur zu → Tick nur vom echten Label-Tipp.
- Tests: G9D 224/226 (2 erwartet: Version, JSON-Vergleich mit alter Basis) · Regel 28 gegen 4.25.2 12/12 · Zeiten 6/6 ·
  H1 16/16 · H3 10/10 · K1–K4 19/19 · Smoke 12/12 · Take abspielen 4/4 (−23,9 dB, 4.25.2 −23,8 dB) · Dock-Probe 5/5.
- Offen: (1) auf dem iPhone prüfen (Text-Modus mit Tastatur, Silben-Muster laden, offline neu starten → Muster bleibt);
  (2) Ziehen von Warp-/Silben-Markern außerhalb von G9 ruft weiter `haptic()` (tickt auf iOS nicht, schadet nicht) – nicht umgebaut;
  (3) Größe +143 KB; (4) aus G9D: Sprachmodell (F0), Gerätepunkte G9-60…64; (5) Patch danach in 4.26.0 (Video) einspielen.
