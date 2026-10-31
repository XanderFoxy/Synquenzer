# STATUS – VIDSTAGE (Zweig helfer-vidstage)

Stand 31.10. · App 4.25.0 · `bau/helfer/VIDSTAGE/index.html`

- Zusammenführung VV1 + VV2 + VV3 + VC2a: **fertig**, drei Zusammenführungsfehler behoben (s. CHANGES.md §1).
- Zusatz Xander (volle Klangqualität, [Ganzer Song]/[Auswahl], Ausklang bei Auswahl, Teilname klebt): **eingebaut**, Test `tests/n5-v-vs-zusatz.mjs` 4/4.
- Tests VV1/VV2/VV3/VC2a gegen die Staging-Datei: **alle bestanden** bzw. Abweichungen wie in den Zweigen; einzige neue Meldung
  (VV2-03 Blende) ist ein Messartefakt (CHANGES.md „Abweichungen“).
- Regeln: VERSION 4.25.0, CLOUD `  live: true,` unverändert, „MS 2000“ 1×, Tasten ≥ 44 px, kein Supabase-Aufruf.
- Tests ausführen: `cd tests && ./run.sh 3 <skripte…>` (Playwright: `tests/node_modules/playwright` → globales Paket verlinken),
  Gegenprobe: `APP=/pfad/zur/datei.html node <skript>`.
- Offen: VC2a-05 / VV1-05 auf ruhigem Rechner wiederholen; iPhone-Prüfung durch Xander.
