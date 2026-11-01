# STATUS VV4-B + VV4-D (Zweig vv4-bd)

**Stand: fertig gebaut und getestet. Xander hat noch nicht geprüft, darum ist es noch nicht abgenommen.**

- `index.html` = R-4261 + VV4-B (Bild-Menü) + VV4-D (Auto-Regie 2) + Platzhalter für VV4-A/C/E. VERSION bleibt unverändert.
- `patch.diff` = `diff -u bau/snapshots/R-4261.html index.html`.
- Tests in `tests/` sind grün: menue, regie, layout (7 Formate), bild. `bau/tests/smoke.mjs` ist grün. Es gibt keine Konsolenfehler.
- Regeln geprüft:
  - „MS 2000“ kommt 1× vor.
  - `  live: true,` kommt 1× vor.
  - Keine neuen Markennamen.
  - Keine Netzzugriffe.
  - Keine Datenbank.
- Beim Merge:
  - Die Platzhalter `vvDrawApp`, `vvAppFocus`, `vvDrawRoll`, `vvDrawDrumSeq` und `vvDrawMod` durch VV4-A/C/E ersetzen (Suche: „VV4-Platzhalter“).
  - `vvAppFocus` muss die echte Lage der Elemente im App-Bild liefern.
  - `n5-v-vv2-05` und `n5-v-qa2-cuts` haben bewusst überholte Erwartungen (siehe CHANGES.md).
- Offene Fragen an Xander: siehe CHANGES.md, 4 Punkte (Vorrang Neues/Teilanfang, Träger als Transposition, Fokus-Länge, Tastatur-Länge).

Tests starten (aus dem Repo-Wurzelordner, Playwright muss auflösbar sein):
`node bau/helfer/VV4BD/tests/vv4-regie.mjs`, `vv4-menue.mjs`, `vv4-layout.mjs`, `vv4-bild.mjs`
