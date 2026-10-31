# G9U – Stand (Zweig g9-br-U, Paket G9c Text-Modus)
- **Fertig gebaut, alle Tests grün** (t2 34/34 · t3 41/41 · t4 23/23 · t5 25/25 · t6 15/15 · t7 4/4 · t8 4/4 · t9 14/14; Funde der unabhängigen Prüfung behoben) – wartet auf Xanders „Bitte prüfen“ (CHANGES.md).
- App: `index.html` = Basis `bau/snapshots/stage-ges2.html` + `node build.mjs` (Quellen in `src/`, Eingriffe als Einmal-Ersetzungen in `build.mjs`).
- Platzhalter: Rechen-Kern `G9K` (→ g9-br-S), Erkennung `G9.rec` (→ g9-br-E, Taste ausgeblendet bis dahin).
- Geräte-Probe: `probe.html` (M-PROBE) – Ergebnis entscheidet Haptik-Labels im Dock und `g9KbSim`-Höhen.
- Tests: `tests/alle.sh` (Chromium aus /opt/node-tools/playwright, Touch-Emulation).
- Snapshot: `bau/snapshots/G9U.html` (= index.html dieses Stands).
