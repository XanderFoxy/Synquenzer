# VV4-B + VV4-D – Bild-Menü je Taktbereich und Auto-Regie 2 „erkennt Neues“

Basis: `bau/snapshots/R-4261.html` (App 4.26.1). VERSION unverändert. Diff: `patch.diff`.

## VV4-B Bild-Menü
- Zeile „Video“ (Marken-Blatt und ⋯ der Bereich-Leiste, `vvDirRow`) hat jetzt zwei Zeilen:
  `[Auto] [App] [Song] [Matrix]` / `[Spur …] [Tastatur] [Fokus …]`. Jede Taste ≥ 44 × 44 pt (gemessen in 428×926, 926×428, 390×844, 375×667, 320×568, 844×390, 667×375).
- „Spur …“ öffnet `[Piano-Roll] [Drum-Sequenzer] [Modulation]`, danach die Spur.
  Zur Wahl stehen bei Piano-Roll die Spuren mit Noten-Clips (ohne Drums), bei Drum-Sequenzer die Drum-Spuren und bei Modulation alle Spuren, die in diesem Bereich spielen. Ist keine passende Spur da, ist die Taste aus.
- „Fokus …“ öffnet `[Clip-Zelle] [Tastatur] [Teil-Kopf] [Übergang]`. Clip-Zelle fragt danach die Spur. Übergang ist nur wählbar, wenn im Bereich ein `song.ue` liegt.
- Datenform weiter `song.video = [{a, b, v, t?}]`. `VV_DIRV` hat neue Werte nur dazubekommen: `app`, `tast`, `roll`, `drum`, `mod`, `f-zelle`, `f-tast`, `f-teil`, `f-ue`.
  Die Werte mit Spur `t` sind `spur`, `roll`, `drum`, `mod` und `f-zelle`. Alte Einträge (`auto|song|matrix|spur`) laden unverändert (Test).
- Eine Wahl = genau 1 Undo-Schritt. Takte einfügen oder löschen verschiebt die neuen Einträge wie die alten. Speichern → Laden ist deep-equal, auch über den Browser-Speicher.
- Streifen im Song (`vvDrawStripe`), Farbe je Wahl:
  - App: Bernstein.
  - Song und Matrix: wie bisher.
  - Tastatur: Blau.
  - Piano-Roll, Drum-Sequenzer, Modulation: Spurfarbe, darunter eine 2-px-Linie in der Farbe der Bild-Art (Roll hell, Drum Bernstein, Modulation Grün).
  - Fokus: nur ein Rahmen in der Farbe des Ziels (Clip-Zelle Spurfarbe, Tastatur Blau, Teil-Kopf Bernstein, Übergang Pink).
  - Das gezeichnete Kamera-Symbol bleibt.
- Unverändert bleibt das Zell-Blatt „Im Video zeigen“ (setzt weiter das alte Spur-Bild `spur`).

## VV4-D Auto-Regie 2 (`vvCuts`)
Vorrang von oben nach unten:
1. Manueller Eintrag (gilt genau für seine Takte).
2. Übergang `song.ue`: Drum-Sequenzer über seine Länge, auf ganze Takte gerundet, mindestens 2 Takte.
3. Clip zum ersten Mal im Song: Piano-Roll mit seinen Noten, die ersten 2 Schläge davon Fokus auf seine Zelle (`f: 'zelle'`), Blende 300 ms. Ein späterer Auftritt desselben Clips bekommt keinen Fokus.
4. Drums setzen ein oder ein Drum-Clip ist neu: Drum-Sequenzer.
5. Teilanfang: ganze App.
6. Transposition (`song.xp` oder Träger `song.carrier`): Tastatur für 2 Takte.
7. Danach wie bisher: viele Clipwechsel → Matrix, einsetzende oder allein spielende Spur → Spur-Bild, Spur endet → Song.

- Kann etwas Neues wegen der 2-Takt-Grenze nicht sofort gezeigt werden, wartet es, solange sein Clip ohne Unterbrechung läuft. Eine Transposition wartet höchstens 2 Takte.
- Die Grenzen bleiben: Schnitte nur auf Taktstrichen, mindestens 2 und höchstens 8 Takte.
- Der Hash nimmt `f` nur auf, wenn es gesetzt ist. Listen ohne die neuen Bilder haben also denselben Hash wie in 4.26.1 (Test).
- Die neuen Bilder füllen das ganze Video-Bild ohne die 640×360-Kamera. Sie rufen `vvDrawApp(g,t,rect)`, `vvDrawRoll`, `vvDrawDrumSeq` und `vvDrawMod(g,t,rect,track)` auf.
  t ist die Videozeit in s, rect ist in Leinwand-Pixeln (wie `vvDrawTrackShot`).
- Fokus = `vvDrawApp`, vergrößert auf das Element (Zoom 2–3×, Tastatur-Bild 1,3×). Die Lage des Elements liefert `vvAppFocus(kind, track, t, rect)`.

## Platzhalter (beim Merge ersetzen)
`vvDrawApp`, `vvAppFocus`, `vv4AppLay`, `vv4Keys`, `vvDrawRoll`, `vvDrawDrumSeq`, `vvDrawMod` sind markiert mit „// VV4-Platzhalter – beim Merge ersetzt“. Sie nutzen die vorhandenen Zeichner:
- `vvDrawApp`: Matrix, Song und eine schlichte Tastatur.
- `vvDrawRoll` und `vvDrawDrumSeq`: `vvDrawSpur`.
- `vvDrawMod`: `vv3Shot`.

**Wichtig für den Merge mit VV4-A:** `vvAppFocus` muss zur echten Lage in `vvDrawApp` passen (Clip-Zelle, Tastatur, Teil-Kopf, Übergang).

## Tests (`tests/`, Playwright)
| Test | Inhalt | Ergebnis |
|---|---|---|
| `vv4-menue.mjs` | über die echte Bedienung setzen, ändern und Undo/Redo je Bereich; Listen; Streifen-Farbe; Speichern/Laden; Neuladen; alter Song; Takte einfügen | grün |
| `vv4-regie.mjs` | exakte Schnittliste des Testsongs; manuell schlägt Auto (auch den Übergang); Hash; Tastatur 2 Takte | grün |
| `vv4-layout.mjs` | 7 Formate inkl. 428×926 und 926×428: ≥ 44 px, nichts abgeschnitten, Treffer, kein Seitensprung | grün |
| `vv4-bild.mjs` | Offline-Render; alle 9 neuen Bilder in 9:16 und 16:9 nicht leer; Auto Bild für Bild; manueller Eintrag im Video | grün |

In keinem Test gibt es Konsolenfehler. Der Rauchtest `bau/tests/smoke.mjs` ist grün.

Erwartete Liste des Testsongs, Takte 1-basiert:

| Takte | Bild | Grund |
|---|---|---|
| 1–4 | Piano-Roll Synth 1 mit Fokus | neu-clip |
| 5–8 | Drum-Sequenzer | neu-drum |
| 9–12 | Piano-Roll Synth 2 mit Fokus | neu-clip |
| 13–15 | Tastatur | transposition |
| 16–17 | Drum-Sequenzer | ue |
| 18–20 | Song | – |
| 21–24 | Drum-Sequenzer | neu-drum |
| 25–32 | App | teil, zweiter Auftritt von Clip A ohne Fokus |

## Absichtlich überholte Test-Erwartungen (Regel 26)
- `bau/tests/n5-v-vv2-05.mjs` erwartet nach [Spur …] sofort die Spurliste. Jetzt kommt zuerst Piano-Roll / Drum-Sequenzer / Modulation (VV4-B).
- `bau/tests/n5-v-qa2-cuts.mjs` meldet „samePic“, wenn zwei Nachbar-Bilder dieselbe Art mit verschiedener Spur haben, z. B. roll0 → roll2. Diese Meldung ist falsch, denn der Test kennt nur `spur` als Bild mit Spur.
  Alle echten Regeln halten über 300 Zufallssongs: Abdeckung, Taktstriche, ≥ 2 Takte, ≤ 8 Takte ohne Schnitt, Hash.
- Teilanfang ohne Neues zeigt jetzt die **ganze App** statt Song. Tests mit fester Liste aus VV2 erwarten dort `song`.
- `n5-v-vv2fix-undo.mjs` scheitert in dieser Umgebung schon an der Basis (NetworkError).
- `n5-v-qa2-data.mjs` hat in Basis und neu dieselben Abweichungen. Beides kommt nicht von diesem Paket.

## Fragen an Xander
1. Hat **Neues** Vorrang vor dem **Teilanfang**? So gebaut, weil VV4-10 bei Takt 9 (= Teilanfang) „neu-clip“ erwartet. Der Song beginnt deshalb mit Fokus und Piano-Roll des ersten Clips, nicht mit der ganzen App.
2. Zählen **Träger-Wechsel** (Akkorde, `song.carrier`) als Transposition oder nur die Teil-Transposition `song.xp`? Heute zählen beide. Bei Akkordwechseln in jedem Takt wechseln Tastatur und ein anderes Bild alle 2 Takte, aber nie vor einem neuen Clip oder einem Teilanfang.
3. **Länge des kurzen Fokus:** 2 Schläge, dann Blende in die Piano-Roll. Passt das?
4. **Tastatur 1–2 Takte:** Bleiben bis zum nächsten festen Bild weniger als 2 Takte, läuft die Tastatur bis dorthin, weil das 2-Takt-Minimum Vorrang hat. Im Testsong ist das Takt 13–15.
