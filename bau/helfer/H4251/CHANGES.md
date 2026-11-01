# Abschnitte für bau/CHANGES-V3.md

## 4.25.1 — Hotfix „Einsingen entsperren“ (Nachtrag 9 §1, H1–H8)

Grundlage `bau/snapshots/G-GES-merge.html` (4.25.0). `VERSION '4.25.1'`, APP_CODE 4 025 001, `live: true` unverändert. Kein neues Projekt-Feld:
neue Schalter liegen im Geräteprofil (`uiPrefs`: `vocClick`, `stsess`) oder sind Laufzeit (`UI.recTg.vox`, `UI.recTgVox`, `UI.recGuide`, `rec.vox`,
`rec.withScene`, `MICW`). Patch: `bau/helfer/H4251/patch-4251.diff` (≈ 180 geänderte Zeilen, nur örtlich).

**Begriff Gesangs-Aufnahme** `vocalTake(ti)`: Zielspur ist die STIMME-Spur oder 🎤 ist an. Reine MIDI-Aufnahmen ohne 🎤 laufen in allen Punkten wie 4.25.0.

- **H1 ● startet die Begleitung (Szene).** Was: `recWithScene(ti, si)` in beiden Stopp-Zweigen von `recPress` vor `startTransport`: jede andere
  Spur mit Clip in der Szene und ohne Belegung (`R.slot −1`, kein `R.pend`) startet die Szene; Akkordzeile wie bei ▶ n. Belegte Spuren bleiben.
  Overlay `#ciTgt`: „Stimme · Szene 1 · Begleitung: Synth 1, Synth 2, Synth 3 +2“ (bis 3 Namen, dann +n, darf umbrechen), leer → „Ohne Begleitung – Szene n
  ist leer“ + Toast; Overdub auf STIMME-Clip → „alter Take läuft als Vorlage“. Warum: ● aus dem Stopp spielte nur den Klick. Gemessen: H-01…H-06 16/16
  (alle Spuren je Takt ≥ 1 Note, Ausgang −15,9 dBFS = ±0,1 dB zur Szene ohne Aufnahme, im Einzähler 0 Clip-Noten, 1 Undo-Schritt).
  **Befund:** Nach dem Laden setzt `applyProject` R.slot auf Szene 1 (nicht −1 wie in der Spec angenommen); H1 wirkt also vor allem nach ■/Stopp
  einzelner Spuren und bei Szenen ohne vorher gespielte Spuren. Verhalten wie Spec, Test setzt den Spec-Zustand explizit.
- **H2 Song-Aufnahme mit 🎤: Ziel „Gesang“.** Was: Schlüssel `vox` in den Song-Zielen; mit 🎤 ab Werk nur Gesang, bis die Ziele mit 🎤 selbst gewählt
  sind; `vox` in `setRecTargets`, Ziel-Übernahme, `recTgShort` („🎤“) / `recTgLong` („Gesang“), START-Freigabe, `songRecTargets`. Schutz in
  `songCommitNotes`: mit Stimme und 0 gespielten Noten im ersten Durchgang wird nichts gelöscht. Start-Blatt: Chip [🎤 GESANG] (≥ 44 px, bei 320 px und
  L2 ohne Beschriftung „Ziele“), Modus-Text „Gesang ersetzt …; alles andere spielt weiter. stumm: alte Stimme … / nichts stumm“. Ziele-Zeile im
  Querformat auf 44 px (vorher 40). Warum: ● SONG mit 🎤 schaltete die gewählte Spur stumm und löschte deren Noten. Gemessen: H-10…H-14 + H-70 grün;
  H-11/H-12 Ergebnis Zeichen für Zeichen wie 4.25.0 (Vergleichslauf).
- **H3 Klick beim Singen „Nur Einzähler“.** Was: Geräte-Einstellung `vocClick` ('ci' Standard | 'always'); Scheduler `rec.vox ? UI.vocClick ===
  'always' : S.settings.metroInRec`. Zeile „Klick beim Singen [Nur Einzähler] [Immer]“ im Menü → Aufnahme und im ●-Halten-Blatt (44 px). Projekt-Feld
  `metroInRec` unverändert. Gemessen: H-20…H-23 10/10 (4 Klicks −4…−1, betont −4, 0 im Take; MIDI-Take Klicks gleich 4.25.0; übersteht Neuladen).
- **H4 Vorzähler bei laufender Musik und im Song-Vorlauf.** Was: `recCdStart/recCdLeft/recCdClick/recCdCatchUp`; Overlay zählt bei „bereit“ und im
  Song-Vorlauf (≤ 4·max(1, Einzähler) Schläge), am Start 0,5 s „●“ (`.n.go`); Klicks im Einzähler-Fenster vor dem Start (bereits eingeplante Schläge
  bekommen ihren Klick sofort). Nur Gesangs-Aufnahmen. Gemessen: H-30…H-33 14/14 (3, 2, 1, ● auf 6/7/8 ±0,15 Schlag; Klicks 6 und 7; Song-Punch
  ab Takt 5: 4…1 und 4 Klicks; MIDI-Take gleich 4.25.0; renderTakt 0,001 ms/Bild).
- **H5 ● auf STIMME ohne 🎤.** Was: `recMicStart` startet das Mikro im selben Tipp; Aufnahme erst bei `live`, ≥ 0,5 s Ringpuffer, keine
  Kurz-Einmessung (Weg Lautsprecher: Ende abgewartet), höchstens 4 s, Overlay „🎤 wird bereit …“; zweites ● bricht ab. Ohne Mikrofon / ohne Einmessung /
  verweigert: Meldung, nichts startet. Gemessen: H-40…H-43 8/8 (Fake-Mikro: Einmessen fertig nach 2,8 s, Transport ab 3,05 s).
- **H6 Ausgang beim Singen.** Was: Zeile `#ciHint` (12 px, höchstens 2 Zeilen) bei jeder Gesangs-Aufnahme: Lautsprecher-/Bluetooth-Hinweis, Kabel
  nichts. `?stsess=par|auto|none` (gespeichert nur, wenn der Parameter in der Adresse steht; Test-API `stimmeSess`) für `stStart`/`micTapGet`.
  Gemessen: H-50…H-52 9/9 (Attrappe: ohne Parameter 'play-and-record' wie 4.25.0, auto → 'auto', none → nichts; aus → 'playback').
- **H7 Vorlage beim Song-Ersetzen.** Was: Start-Blatt-Zeile „Alte Stimme [stumm] [hören]“ (wenn 🎤 an und im Bereich alte Stimme), `UI.recGuide`
  → `sr.guide` → `tkSongMute` null. Gemessen: H-60/61 (alte Stimme in Takt 3–4 eingeplant bzw. stumm wie 4.25.0; Ergebnis neuer Take, ↶ stellt her).
- **H8 Leerer Song + 🎤:** Toast „🎤 Gesang wird beim ersten Song-Durchgang nicht aufgenommen – …“. Gemessen: H-70.

**Gemeinsam (Regel 28):** Golden-Klangtest `bau/tests/n5-k-golden.mjs` 4.25.1 gegen 4.25.0: 320/320 Klänge ≤ −90 dB. Demo: normalisiertes Projekt
gleich, Noten-Plan 8 Takte Szene 1 + 2 gleich (H-90). Regression aus `bau/tests` vorher/nachher identisch: Smoke, `v3-v2d2-rec` 65/65 (N7S-27…32),
`v3-qa-vs3-reg` „all ok“. H-92: 180 s mit 3 Gesangs-Takes und 19 Szenenwechseln, keine Fehler, keine hängenden Stimmen; lange Tasks wie 4.25.0
(Take-Auswertung). Nach unabhängiger Prüfung zusätzlich: H5 wartet auf dem Kabel-/BT-Weg nicht mehr vergeblich auf eine Kurz-Einmessung, ■ /
Projektwechsel / andere Zelle während „🎤 wird bereit“ brechen ab, Vorzähler-Klicks werden bei Abbruch zurückgenommen, Hinweis nur bei echter
Gesangs-Aufnahme, Meldung wenn „nur Gesang“ nicht aufgenommen werden kann. Hinweis: `?stsess` bleibt gespeichert, zurück mit `?stsess=par`.

## 4.25.2 — Nachschub „kleine Gesangs-Fehler“ (Nachtrag 9 §1.2, K1–K4)

Auf 4.25.1. `VERSION '4.25.2'`, APP_CODE 4 025 002. Patch `bau/helfer/H4251/patch-4252.diff` (≈ 45 Zeilen).

- **K1 G3-Ausklang nach Kürzen/Punch.** `g3Exit`/`g3PostDraw`: kein Ausklang, wenn der Take über das (gekürzte) Clip-Ende ragt; `g3VoxSeg`: `full` als
  Gleichheit ±1e-3; `tkVoxTrim` kürzt `out` (auch in `alt`) auf das Stückende. Warum: nach „Länge −1“ sprang der Ausklang einen Takt nach vorn, das linke
  Reststück eines Punch lief bis zu 1 Takt in die neue Aufnahme. Gemessen: K-01/K-02 (4.25.1: Ausklang bei Takt 1 und 2, Reststück out 17,0 s statt 7,0 s;
  4.25.2: kein Ausklang, out = 7,0 s), K-03 Undo + Laden deep-equal. Regel 28: betrifft nur Zustände seit 4.25.0 (Clip kürzer als Take mit gemessenem
  Ausklang); im Repo-Snapshot gibt es keine Projekte mit Song-Stimme.
- **K2 Marken-Editor ohne versehentliches Verschieben.** `wpHit`: Fangradius ≤ 16 px und ≤ halber Nachbarabstand, zwei Kandidaten < 6 px → keiner;
  `wpGest`: greifen nur im oberen 44-px-Streifen (dort sitzt das Griff-Dreieck), auf der Welle schwenkt ein Finger immer; zweiter Finger (auch neben der
  Welle) verwirft den Zug. Tipp wie bisher (trifft die nächste Marke ±16 px). [V] Bedienung ändert sich (Funk). Gemessen: K-04 500 Wische 0 Marken bewegt (4.25.1: 40 Wische → 6
  Verschiebungen), K-05 0 bewegt/0 Undo, K-06 1 Undo.
- **K3 Clip-Blatt STIMME.** +1/×2 gesperrt erst ab 64 Takten (alle Clips, wie `clipLength`); „Quantisieren…“ öffnet bei STIMME den Marken-Editor;
  Untertitel „N Takte · Gesang · K Takes“; ×2 heißt „Doppelte Länge (Gesang einmal, danach Stille)“. Gemessen: K-07…K-09.
- **K4 Feste Take-Nummern** nach Alter (`created`, dann `in`), nur Anzeige. Gemessen: K-10 (Take 3 nach oben bleibt Take 3; gelöscht → 4…7 werden 3…6).
