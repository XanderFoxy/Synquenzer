# AK1 – Klanganker ◆ automatisch

**Für Xander:** Wenn du jetzt im Synth-Editor an einem Regler drehst, während ein Clip läuft (oder ohne Wiedergabe: der gewählte Clip), landet die Änderung sofort hörbar in genau diesem Clip, ohne dass du die Raute antippst. Wechselst du den Clip, hörst du dessen Einstellung, und nach dem Speichern und Laden klingt es wieder genauso. Die ◆-Taste oben heißt nach dem Antippen „Grundklang“: Dann ändern die Regler den Klang aller Clips, so wie früher. Noch einmal antippen schaltet zurück auf automatisch. Ein Undo nimmt immer eine ganze Drehbewegung zurück.

## Technik (nur `index.html`)
- Neuer Block „AK1“ direkt nach `v6aHeadBtn` mit `ak1Key`, `ak1Ref`, `ak1Go`, `ak1GkNote`, `ak1Wait`, `ak1Put`, `ak1End`, `ak1Sync`, `ak1Gk` und `ak1Hint`.
- Ablauf: Der erste Wert einer Geste öffnet still ein ◆-Bearbeiten (`V6A.ed` mit `ak1: true`, ohne Amber-Kante und ohne Toast). Das Ende der Geste (`commitSound`, sonst 1,5 s nach dem letzten Wert) schreibt `v6aDiff` in `clip.st` und legt einen Undo-Schritt `clip` bzw. `own` an. `track.sound` bleibt der Grundklang. Was ein Zustand nicht halten kann (mode, poly, mw, wt.tab, mk.mode, voc.hold, Routen), bleibt im Grundklang; nötigenfalls wird daraus eine Gruppe mit `sound` + `clip`.
- Einhänge-Zeilen (je 1 Zeile): `setP`, `mkSetP`, `fmSetOp`, `fmSetEnv`, `fmSetPatch`, `fmSetPeg` → `ak1Go`. `commitSound` → `ak1End(label)`. `applySound` → ein offenes Auto-◆ zuerst schließen. `v6aEdEnd`, `v6aUndoGate` und `v6aLcdText` haben je eine ak1-Zeile. `buildSynthEd` und `undoApply` (Art `clip`) rufen `ak1Sync` auf: Ohne Wiedergabe spielt und zeigt die Spur den Zustand des gewählten Clips. `lcdHint` hat 2 Zeilen für den LCD-Hinweis.
- ◆-Kopftaste: Antippen schaltet `V6A.gk` (Grundklang, für alle Spuren, nicht im Projekt gespeichert). Optik unverändert (Klasse `on` = „Grund-/klang“), neu sind `aria-pressed` sowie aria-Text und Titel. ◆ bearbeiten bleibt über das Clip-Blatt erreichbar.
- Nicht betroffen: Bit Mask (die Engine spielt keine Zustände, also bleibt dort der Grundklang), Perkussionsspur (north), Drum-Spur, ● Bewegung aufnehmen (AM) und der Song-Video-Render (`UI.vvOff`). Ohne offenen Editor geht alles wie bisher in den Grundklang.
- Test-API: `SYNQUENZER.ak1Gk(on)`, `ak1Open()`, `ak1Done()`.

## Tests
- `t/ak1-test.mjs` (Playwright, echte Zieh-Geste am CUTOFF-Regler): Clip 1 läuft, Regler drehen → `clip1.st.cutoff` gesetzt, Grundklang unverändert, die Engine bekommt den Wert (`E.set`), der Regler zeigt ihn, 1 Undo-Schritt „◆ …“. Clip 2 → Engine fährt (`E.v6a`) auf den Grundklang, Regler folgt. In Clip 2 drehen → eigener Wert. Zurück zu Clip 1 → dessen Wert. Undo. Grundklang-Taste (≥ 44 px, aria-pressed, LCD) → `tr.sound` ändert sich, Clip bleibt, Hinweis-Toast; Undo. FM, WT und AM gehen in den Clip. Speichern/Laden-Roundtrip (`serialize`/`importJSON`). Ohne Editor Grundklang, Drum ohne Zustand. Ohne Wiedergabe gewählter Clip. **Alles OK, errors [].**
- KV1-Regressionstest (`w4400/a/kv1-test.mjs`) gegen Basis und Kopie: gleiches Bild. Einziger gewollter Unterschied: Eine Hand während der Fahrt ändert jetzt den Clip statt den Grundklang.
- `topdefs`: 0 Syntaxfehler, 0 Doppelte. Smoke: errors []. Markenwörter 0, `MS 2000` 1, `  live: true,` 1.
- Fotos: `ak1-1-editor.png` (LCD „◆ automatisch“), `ak1-2-nach-drehen.png`, `ak1-3-grundklang.png`.
