# G9D – Stand (Zweig g9-br-D, Paket G9d Einbau Songtext/Silben)
- **Fertig gebaut, alle Tests grün** – wartet auf Xanders „Bitte prüfen“ (CHANGES.md). VERSION nicht hochgezählt.
- App: `index.html` = `bau/snapshots/G9STAGE.html` = Basis `stage-ges2.html` + `node build.mjs` (Kern/Erkennung aus `../G9S`, Text-Modus aus G9c, Hüllen in `src/`).
- Fertig: echter G9a-Kern (Haupt-Faden + VS5a-Worker, Ops `g9f`/`g9a`/`g9s`), Hüllen §7.12 (`g9Syl`, `g9Feat`, `g9Align`, `g9View`, `g9Set`),
  Normalisierer `K.normLy`, Undo-Art `'ly'`, `lyrics` = `K.lyText`, VS5b-Umwandlung `K.fromVs5b`, Marken-Haken in `wpEdit`,
  Silben-Muster mit SHA-256 + Cache `synq-g9-v1` (ohne wasm: Modus „einfach“ + Hinweis), Erkennungs-Ablauf ohne Modell (G9b-V: Fenster,
  [Stopp], Aufnahme hat Vorrang, automatisch erkennen, `G9.auto` + `wpUndone`) – [Erkennen] bleibt ausgeblendet (kein Modell).
- Tests: `tests/alle.sh` **226/226** (G9U-Tests t2–t9 160/160 auf der eingebauten App, neu t10 48/48, t11 Regel-28-Differenz 12/12, t12 Zeiten 6/6);
  Kern `G9S/tests/alle.mjs` grün; unabhängige Prüfung: 10 Funde, 8 behoben, Reproduktionen in `tests/pruefer/`.
- Offen: (1) Merge-Schritt `sw.js`: `synq-g9-` beim Aktivieren nicht löschen; (2) G9b-0/1/2 Sprachmodell nach Freigabe F0 (Andock-Stelle `G9.asr`,
  dazu [Stopp]-Taste/Download-Anzeige); (3) Gerätepunkte G9-60…64 + Geräte-Probe G9-61; (4) Nachmessen mit echtem Gesang (K-G9 a/b);
  (5) Budget +129 KB statt +45 KB; (6) Tastendruck-Spitze 7,6 ms im 64-Takt-Fall (Ziel 6 ms; Median 1,3 ms).
