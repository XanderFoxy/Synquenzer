# STATUS MAGIC
Stand: fertig gebaut und getestet (Test-Browser), **noch nicht von Xander am iPhone abgenommen**.
- SPEC.md, index.html, patch.diff (diff -u gegen bau/snapshots/R-4261.html), CHANGES.md, tests/ – vorhanden.
- `sh bau/helfer/MAGIC/tests/alle.sh` → alles grün (Rauchtest, Funktion, Layout + Bildrate, Regression).
- Marken-/Pflichtprüfung: „MS 2000“ 1×, `  live: true,` 1×, VERSION '4.26.1' unverändert, keine neuen Markennamen, keine Netzzugriffe.
- Merge-Hinweis: alle Eingriffe in PianoRoll mit `/* MAGIC */` markiert; Modul `G.MagicScale` als eigener Script-Block nach PianoRoll.
  Der Helfer „Melodie-Pinsel“ arbeitet im selben Editor → beim Zusammenführen auf die Grid-Zeile 6 (`.pr.ms-on`) und die Haken in
  promote/drag/tap achten.
- Offen: Fragen an Xander (CHANGES.md).
