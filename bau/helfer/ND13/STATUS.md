# Helfer ND13 – Stand

- Zweig: `helfer-nd13` · Basis `bau/werkzeug/vs-base-B.html` (App 4.23.0, VERSION unverändert)
- Pakete: **ND1** (Engine-Kern `synq-md`) und **ND3** (45 Programme, 4 Kits, Pad-Start nach Rolle) – gebaut, gemessen, Changelog `CHANGES.md`.
- Ergebnis: `index.html` (= Basis + ND1/ND3-Blöcke + 5 einzeilige Haken), Quellen in `src/`, Tests in `tests/`.
- Neu bauen: `node src/build.mjs` (aus der Basis, idempotent).
- Tests: `node tests/md1-node.mjs [48000|44100] [--long]`, `node tests/md1-chromium.mjs [--quick]`, `node tests/md1-cpu.mjs [Sekunden]`,
  `node tests/md3-kits.mjs [--calib] [--wav=DIR]`.
- Offen: Fragen Q1–Q5 in `CHANGES.md` (u. a. Spec-Widerspruch ND1-10, Peak-Grenze ND1-27, CPU-Rahmen, Feldnamen `mDec`/`mLvl` für ND4),
  Gerätetest ND1-30 (iPhone) und Hörprobe ND3-06 durch Xander.
