# SX9 – Status: **fertig** (wartet auf Xanders Okay)

Basis `bau/snapshots/R-4310.html` → `bau/helfer/SX9/index.html`, VERSION bleibt `4.31.0`.
Code-Stellen mit `// SX9` markiert, CSS in `/* SX9-CSS-BEGIN */ … /* SX9-CSS-END */`, Funktionen `sx9…`. Diff: `patch.diff`.

## Bauweise (kurz)
Versionen hängen am vorhandenen Weg „eigener Clip“ (`song.own`, Lane-Eintrag `own:id`), mit Feld `ver` und **geteilt** von allen Stellen.
Dadurch nehmen Wiedergabe, MIDI, Video/WAV, Konsolidieren, Speichern und Online-Abgleich die Version ohne eigene Sonderwege.
Angepasst, damit Versionen sich nicht wie eine Einmal-Kopie verhalten: `songTidy` (Version bleibt ohne Stelle), `songWrite` und
S0-Wiederherstellen (bestehende v2 wird wiederverwendet), `ownEnsure` / `ownWhole` (Aufnahme bzw. „Ganzer Block“ macht eine Kopie,
die Version bleibt), `ownRefSong`, `ownNorm` (Feld `ver` bleibt beim Laden). „Schläge je Takt“: `sx9Bpb()`.

## Tests
- `tests/sx9-abnahme.mjs` (Playwright, Touch, 428×926 und 926×428): **16/16 ok** – Blatt-Tasten ≥ 44 px und im Bild, ＋ → v2 nur im
  2. Refrain, Phase gleich wie Original, Editor-Kopf „v2“, Original unverändert, Tipp v2 nur Refrain 1, Schild auf den Zellen,
  1 Undo je Geste, [Überall v2], Teil-Kopie behält dieselbe v2, Speichern/Laden, MIDI-Export nimmt v2, keine Konsolen-Fehler.
- `bau/tests/smoke.mjs`: ok, keine Fehler. acorn: 20 Skripte, 0 Fehler.
- Regeln: `  live: true,` 1×, verbotene Wörter 0, „MS 2000“ 1×, Plus-Taste als SVG.
- Nicht eigens getestet (laufen über denselben Weg wie „eigener Clip“): Konsolidieren, Video-/WAV-Export, Online-Abgleich.
- Bilder: `tests/sx9-P-kaestchen.png`, `tests/sx9-P-editor.png`, `tests/sx9-L-blatt.png`.

## Bitte prüfen
1. Bass-Zelle im 2. Refrain halten → **＋** → Bass ändern → Song abspielen: Refrain 2 anders, Refrain 1 wie vorher?
2. Ist „an dieser Stelle“ = **ganzer Teil** (Refrain) so richtig – oder willst du nur den einen Durchlauf?
3. Schild „v2“ auf der Zelle gut lesbar (Kästchen und Glas)?
4. [Überall v2] und danach einmal **Rückgängig**: kommt genau der Stand davor zurück?
5. Projekt speichern, neu laden, als MIDI/Video exportieren: v2 ist dabei?
