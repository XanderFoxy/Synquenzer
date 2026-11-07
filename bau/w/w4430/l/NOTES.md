# KL1 – Konsolidieren erweitert den alten Clip

**Für Xander:** Beim Konsolidieren wird kein Clip mehr überschrieben. Was du im Song dazugeschrieben hast, kommt in den alten Clip als „ganzer Inhalt“. In der Matrix spielt der Clip weiter genau seine alten Loop-Klammern (das Fenster), nur der neue Teil öffnet die Klammern und spielt alles.
Im Clip-Blatt steht jetzt „Fenster Takt 1–2 von 4“. Mit ◀ ▶ schiebst du das Fenster durch den ganzen Inhalt, mit Länge (½ −1 +1 ×2) machst du es kürzer oder länger. Zurückholen und ↶ machen alles wieder wie vorher.

## Technik (alles im Block `/* KL1 */` direkt nach `/* /KON */`, dazu kleine Haken mit Kürzel KL1)
- Daten (Format bleibt 5): `clip.lw = {a, b, len, notes}`. Der Clip selbst (len, notes, key, st …) **ist** das Fenster [a, b) in Schlägen, darum klingen Matrix, Szenen, jeder andere Teil, Song, Video und MIDI ohne jede Änderung gleich. `lw.len` = ganzer Inhalt in Takten, `lw.notes` = seine Noten außerhalb des Fensters. Ohne `lw` ist alles wie vorher.
- „ganz“: Spur-Eintrag im Teil `{bar: 0, slot, own: '~'}`. `R.own` trägt '~' wie bei einem eigenen Clip (kein echter Name kann '~' sein). `ownPlaying` → `kl1Play` → `kl1Whole` (zwischengespeichert, eigenes Tonart-Objekt, ohne Kurven und ohne D1-Spuren). `songClipBeats` kennt die ganze Länge. `partStateAt`/`partLaneTick` reichen '~' an `laneSwitch` weiter.
- Im Song steht nie '~': `partChunk` → `kl1Chunk` legt beim Einsetzen des Teils einen eigenen Clip mit dem ganzen Inhalt an (gilt auch für `markReplaceAll`). `songTidy` würde '~' ohnehin entfernen.
- `konDo` → `kl1Kon`: eine Spur wird nur erweitert, wenn sie im ganzen Bereich nur ihren Szenen-Clip spielt (auch eigene Clips oder SX9-Versionen davon mit gleicher Tonart, gleichem ◆-Zustand, Seed, Auftakt) und das anders klingt als die bloße Schleife. Fenster = der erste Durchlauf im Bereich, der genau wie der Clip klingt, sonst wird der alte Clip hinter den Bereich gelegt. Ausgenommen sind Clips mit Taktart, D1-Spuren, Kurven, freien Reihen, Audio sowie die STIMME-Spur und Songs mit Taktarten (dann wie bisher). Song-Melodie-Noten (`song.mel`) bleiben die Melodie des Teils, weil sie anders gestimmt werden. Die Clip-Änderung ist ein Teil desselben Undo-Schritts (Gruppe aus Teil, Song und Clip). `kn.kl` merkt sich das alte Fenster (`konKonsNorm` behält es).
- `konRestore` → `kl1Back`: Bleibt der Teil nicht übrig, bekommt der Clip sein altes Fenster zurück und `lw` fällt weg, im selben Undo-Schritt.
- Clip-Blatt: Zeile „Fenster Takt a–b von n“ mit ◀ ▶ (je 56×44 px, auch quer), erscheint nur bei `lw`. `clipLength` mit `lw` ändert die Länge des Fensters im Inhalt (`kl1Len`). Jeder Schritt ist ein Undo vom Typ 'clip'.
- Speichern/Laden: `normClip` → `kl1Norm`, `cleanClip` nimmt `lw` mit, `ownNorm` streicht `lw` an eigenen Clips, `normPart` → `kl1PartNorm` behält '~'. Prüfliste: `KNOWN_NEED` + 'lw', `needCalc` setzt es bei Clips mit `lw`. Damit sperrt eine ältere Fassung (4.42.0) so ein Projekt, statt still den Inhalt zu verlieren.
- V6A/AK1: `v6aEdRef`/`ak1Ref` geben bei '~' den Szenen-Clip als Bezug (`kl1Ref`), damit kein Undo vom Typ 'own' mit '~' entsteht. `vvClip` kennt '~'. Der Hinweis im geführten Blatt lautet jetzt „… · Clip erweitert“ (`konDo` gibt `ext` zurück).
- Test-API: `clipWindow(t, s)`, `clipWindowMove(t, s, ±1)`, `clipWhole(t, s)`.

## Tests
- Pflicht: topdefs: 0 Syntaxfehler, 0 doppelt. smoke: errors []. Markenwörter 0, „MS 2000“ 1, „  live: true,“ 1.
- `w4430-kl1tools/kl1-test.mjs`: 103/103 grün, mit echten Noten-Logs bei 240 BPM. Geprüft wurden:
  - Fall A: neue Note im 2. Durchlauf → Fenster 0–8.
  - Fall B: neue Note im 1. Durchlauf → Fenster 8–16.
  - Fall C: beide Durchläufe anders → altes Fenster hinter dem Bereich, 6 Takte.
  - Fall E: SX9-Version v2 im Bereich und ◆-Zustand am Clip.
  - Fall F: geführtes Blatt.
  - Fall D: nichts dazugeschrieben → kein Erweitern.
  - In allen Fällen: Szene, anderer Teil und Song klingen exakt gleich. Der neue Teil entspricht Takt 3–6 inklusive der neuen Noten. MIDI (Szene und Song) ist byte-gleich. Undo/Redo, Zurückholen (exakt gleiches JSON) und Speichern/Laden funktionieren. Der eingesetzte Teil klingt wie der Bereich. Fenster ◀ ▶ und Länge funktionieren, Tasten ≥ 44 px, ✕ sichtbar (428×926 und 926×370).
- `kl1-video.mjs`: Video-Offline-Render vor und nach dem Konsolidieren gleich (Noten-Log und RMS bitgleich), der eingesetzte Teil klingt im Render wie der Bereich.
- `old-load.mjs`: ein 4.42.0-Projekt mit konsolidiertem Teil, eigenem Clip und Version wird in der neuen Fassung gleich serialisiert.
- Regression gegen die Basis:
  - KON-Speichern 11/11, KON-Block 41/41, S2-Abnahme 25/25.
  - kon-konsol: Nur ein Fehler ist neu, und er ist gewollt („eigener Clip ist im Teil“: Der eigene Clip steckt jetzt im erweiterten Clip). Der Rest ist grün, auch „Teil hinten eingesetzt klingt wie Takt 3–10“ mit Akkord und +2 Transposition. Der Fehler zu Marken-Blatt/Knopf gibt es auch in der Basis.
  - S0-04 und S1-acc schlagen in der Basis genauso fehl, weil diese Tests veraltet sind.

## Risiken / offen
- Ein Song, der mit ● SONG aufgenommen wird, während der konsolidierte Teil getippt wird, bekommt (wie bisher bei eigenen Clips und bei der Teil-Melodie) nur den Clip-Start: Dort spielt dann das Fenster, nicht der ganze Inhalt. Anders ist es beim Einsetzen und Ziehen des Teils, beim Ersetzen und bei „Alle Stellen“: Dort steht der ganze Inhalt (als eigener Clip).
- Mit „Eine Skala“ und Akkorden rechnet ein langer Clip seine Tonhöhen-Statistik über den ganzen Inhalt statt je Durchlauf. In seltenen Grenzfällen kann ein Durchgangston deshalb anders einrasten als im Song (im KON-Test mit Am und +2 kein Unterschied).
- FANG TEIL bzw. TEIL ÜBERARBEITET, während der konsolidierte Teil läuft: Die neue Fassung bekommt nur Slots, also wieder die Schleife.
- Bei Fenster-Clips (nur dort) erscheint im Clip-Blatt eine Zeile mehr (≈ 50 px). Hochkant mit Safari-Leisten (428×745) und quer scrollt das Blatt dann etwas weiter, so wie heute schon die Länge-Zeile. Bei normalen Clips ist das Blatt pixelgleich.

## Gegenprüfung (KL1-GP)
**Für Xander:** Eine Lücke war noch offen: Wenn du die Länge eines erweiterten Clips im Noten-Editor änderst (Längen-Griff, Länge, ×2, Zuschneiden), ging ein Stück vom ganzen Inhalt verloren, beim Kürzen sofort und beim Verlängern nach Speichern/Laden. Der konsolidierte Teil klang dann anders. Jetzt verhält sich der Editor wie die Länge-Tasten im Clip-Blatt, und der ganze Inhalt bleibt erhalten.
- Gefunden mit eigenem Test: Länge 2→3 im Editor → nach Laden fehlen Takt 3 des Inhalts (4 Noten); Länge 2→1 → Takt 2 sofort weg, Teil klingt anders.
- Behoben (Kürzel KL1/KL1-GP): `rollModel.end` → `kl1Roll(t, s, Stand davor)`. Nur Länge geändert = wie Länge im Blatt (`kl1Len`), ×2 = wie ×2 im Blatt, Zuschneiden = das gewählte Stück wird das Fenster (`kl1Put` mit Versatz). Alles andere, z. B. Verschieben über das Ende: Das Fenster gilt, so wie es nach dem Laden ohnehin wäre (`kl1Fit`). `afterClipEdit` ruft `kl1Fit` auch für andere Wege auf (Drum-Editor ×2), damit Speicher und geladene Datei immer gleich sind.
- Geprüft: `w4430-gp/gp2.mjs` 34/34 (Länge +1, −1, ×2, Zuschneiden, Verschieben über das Ende, Noten-Edit, Drum-×2-Weg: ganzer Inhalt bleibt, Teil klingt gleich, Speicher = nach Laden, Undo exakt, Redo). `gp.mjs`: Fall C, der Teil wiederholt nach 4 Takten richtig von vorn. Das Clip-Blatt ist bei normalen Clips in 428×926, 428×745, 375×667 und 926×370 gleich wie in 4.42.0. kl1-test, topdefs (0/0), smoke (errors []) und Markenwörter/„MS 2000“/„live: true,“ sind wieder grün.
- Bleibt offen (klein): Taktart an einem erweiterten Clip stellt den ganzen Inhalt still, der Teil spielt dann nur das Fenster, und nach dem Laden ist der Inhalt weg (Taktart-Clips haben kein Fenster). Im Noten-Editor zeigt der Abspielkopf nichts, solange der Teil den Clip „ganz“ spielt.
