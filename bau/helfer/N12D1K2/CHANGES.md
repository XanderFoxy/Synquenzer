# Helfer N12D1K2 — K2 · N1 · N2 · D1 (Basis App 4.23.0, `vs-base-B.html`)

Zweig `helfer-n12d1k2`, Datei `bau/helfer/N12D1K2/index.html`. VERSION-Zeile unverändert (4.23.0). Format 5, nur additive Felder.

---

## K2 — FM-FELD: Hüllkurven bei mehr als 3 Operatoren

### Was gemessen wurde (Ursache)
- **Hüllkurven-Rechnung selbst ist richtig.** Die Hüllkurve jedes Operators (DX- und Punkt-Form, parallel, Paare, Kette, 1…6
  Operatoren) ist im Verbund gleich wie derselbe Operator allein (Verstärkung je Block exakt gleich, 0,000 dB) und gleich auf
  OP 1…6 (Lage-unabhängig). Im Klang (6 Ausgänge, Teilton je OP per Goertzel) höchstens 0,25 dB. Die Normierung 0,5/√(Ausgänge)
  ist laut Nachtrag 1 so gewollt und verändert die Form nicht.
- **Ursache der „falschen Hüllkurven“: Stimmenklau durch den CPU-Begrenzer.** Mehr Operatoren = mehr Rechenzeit (gemessen: 6-OP-Stimme
  ≈ 2× eine VA-Stimme). Ab Last 0,60 / 0,75 setzt der Begrenzer die Stimmenzahl auf 6 / 4 (bei schwerem Graph oder Punkt-Schleife
  auf 4). Der Worklet hat dann auch **gehaltene** Noten geklaut: ein 6-Ton-Akkord verlor bei Stufe 3 zwei Töne mitten in der
  Hüllkurve (gemessen 4 gehaltene Noten gestohlen in 2 Akkorden), dazu mit nur 96 Samples (2 ms) Ausblende = Knackser.

### Was neu ist
1. Die Stimmen-Grenzen des Begrenzers (6 / 4, und 4 für schwere Graphen ab Stufe 2) kürzen nur noch **ausklingende** Stimmen.
   Gehaltene Noten werden erst über der eigenen Stimmenzahl des Klangs geklaut (neues Worklet-Feld `polyH` = gespeicherte
   Stimmenzahl, nur solange der Begrenzer kappt; nicht im Projekt gespeichert). Stimmenzahl muss nicht von Hand erhöht werden.
   Die Grenze „> 12 Verbindungen → 6 Stimmen“ (K2-42) bleibt hart.
2. Stimmenklau-Ausblende 5 ms statt 2 ms (wie beim AM-Klang `MK_STEAL`): Knackser > 3 kHz einer geklauten lauten Note
   −50,2 dB statt −43,2 dB.
3. Ohne Stimmenklau ist der Klang bitgleich zu 4.23.0 (FM und VA, `k2-gleich.mjs`).

### Abnahme
| Punkt | Prüfung | Ergebnis |
|---|---|---|
| K2-01 | 1…6 OP, dx/Punkt, parallel/Paare/Kette: Hüllkurve je OP im Verbund = OP allein | 0,000 dB (≤ 1) — bestanden |
| K2-01 | gleiche Hüllkurve auf OP 1…6 = auf OP 1 | 0,000 dB — bestanden |
| K2-01 | Klang: 6 Ausgänge, Teilton je OP gegen OP allein (Worklet in Node und App-Worklet im Browser) | 0,25 dB — bestanden |
| K2-02 | 6-Ton-Akkord über ausklingendem 6-Ton-Akkord, 3/4/6 OP, poly 8 und Begrenzer poly 6 / 4 | 0 gehaltene Noten geklaut, kein NaN — bestanden (vorher bei poly 4: 4 geklaut) |
| K2-02 | App: Begrenzer Stufe 3 → poly 4 + polyH 8, zurück auf 0 → polyH 0 | bestanden |
| K2-02 | Klau-Knackser > 3 kHz | −50,2 dB (vorher −43,2 dB) |
| K2-03 | CPU je Stimme (Node, Xeon): VA ≈ 10–12 µs, FM 1 OP ≈ 7–17 µs, 6 OP ≈ 14–28 µs je 128er-Block; 6 Stimmen × 6 OP ≈ 0,15 ms von 2,67 ms | im Rahmen (kein Mehr gegen 4.23.0) |

Tests: `tests/k2-abnahme.mjs`, `tests/k2-click.mjs`, `tests/k2-cpu.mjs`, `tests/k2-gleich.mjs`, `tests/k2-app.mjs`, `tests/k2-app-lim.mjs`
(Lib `tests/k2-lib.mjs`: der Worklet aus index.html in Node). Regression: `bau/tests/smoke.mjs` ohne Fehler, `n5-k-path-fm.mjs` −324,6 dB (wie vorher).

### Abweichungen
- Die Spec nennt „1…8 Operatoren“; das FELD hat 6 Operatoren (ein 7. wird abgelehnt). Geprüft: 1…6.
- Bei Begrenzer-Stufe 2/3 kann ein großer Akkord jetzt mehr Rechenzeit kosten als vorher (gehaltene Noten bleiben); die
  Ausklänge werden weiter gekürzt.

### Fragen an Xander
- K2: Hattest du die falschen Hüllkurven auf dem iPhone bei mehreren Spuren gleichzeitig (dann war es der Begrenzer, jetzt behoben)?
  Falls es auch mit nur einer FM-Spur und wenigen Noten passiert: welcher Klang/welches Feld? Dann bitte das Projekt schicken.

### Für das Zusammenführen
- Worklet: `STEAL_N` (neben `FMX_EDGE_CAP`), `stealIfFull()` (Block `/* K2 */`), `defaults()` + `polyH: 0`.
- Hauptteil: `limited()` (+ `polyH` ab Stufe 2), `applyLimiter()` (polyH zurück auf 0), `wkFlush()` (eine Zeile).
- Berührt nicht K1 (Osz 3 / LFO / Ladder / Mod-Übersicht).

---

## N1 — Noten umdrehen

### Was neu ist
- Noten-Editor (Clip, Song-Melodie, eigener Clip – alle nutzen dieselbe Rolle), Aktionsleiste hinter „−12“: **[Spiegeln]** und
  **[Umdrehen]**, je mit gezeichnetem Symbol (SVG: Pfeile ↑↓ bzw. ←→ über einer gestrichelten Achse, kein Emoji).
  Wirkung auf die Auswahl, sonst auf den ganzen Clip (wie die anderen Aktionen, Anzeige „ALLE“ / „n Noten“). Ein Undo je Tipp.
- **Spiegeln:** Tonhöhen um die Mitte (tiefster + höchster Ton) in **Tonleiter-Stufen** der Clip-Tonart gespiegelt → alle
  Töne bleiben in der Skala, Intervalle gespiegelt (C-D-E-G → G-F-E-C in C-Dur). Leiterfremde Töne bleiben leiterfremd
  (halbe Stufe), so ist zweimal Spiegeln immer die Ausgangslage. Zeit, Länge, Anschlag bleiben.
- **Umdrehen:** zeitlich rückwärts: Start' = a + b − Start − Länge. Bereich: Auswahl = erste Note bis letztes Ende; ganzer Clip
  = 0 … Clip-Länge. Länge, Anschlag, Ton je Note bleiben; der Roh-Einsatz `o` wandert mit (zweimal = deep-equal).
- Beide nacheinander möglich (rückwärts gespiegelt). Nichts zu ändern → kein Undo-Schritt, kurze Blase.

### Abnahme
| Punkt | Prüfung (echte Touch-Tipps) | Ergebnis |
|---|---|---|
| N1-01 | C-D-E-G → Spiegeln → G-F-E-C, alle Töne in C-Dur, Zeit/Länge/Anschlag gleich; Auswahl D,E → E,D | bestanden |
| N1-02 | Umdrehen ganzer Clip: Starts 0 / 1,25 / 2,75 / 3,5 (Soll), Anschlag/Länge je Note gleich; Auswahl im Bereich 1…2,75 | bestanden |
| N1-03 | Spiegeln ×2, Umdrehen ×2 = Ausgangslage deep-equal (auch `o`, auch A-Moll mit C♯/F♯); beide + 2× Undo = Ausgangslage | bestanden |
| Undo | genau ein Undo-Schritt je Tipp | bestanden |
| Bedienung | 6 Formate: sichtbar (Leiste scrollt), Symbol gezeichnet, nichts abgeschnitten, Breite 92/102 px, Trefferfläche = volle Leistenhöhe | bestanden |

Tests: `tests/n1-abnahme.mjs` (18/18), `tests/n1-hit.mjs` (12/12), Hilfen `tests/touch-lib.mjs`.

### Abweichungen
- Die Aktionsleiste des Editors ist in der App 36–44 px hoch (P1 44, P2 40, P3 38, quer 36; bestehendes Layout, nicht geändert,
  sonst Layout-Sprung). Die neuen Knöpfe nutzen die volle Leistenhöhe als Trefferfläche (Breite ≥ 92 px); 44 px hoch ist in
  P2/P3/quer nur mit einer höheren Leiste möglich → Frage.

### Fragen an Xander
- N1: Soll „Umdrehen“ ohne Auswahl im ganzen Clip (0 … Ende, so gebaut) oder nur zwischen erster und letzter Note drehen?
- N1/allgemein: Die Editor-Leisten sind quer 36 px hoch – sollen sie für 44-px-Tasten höher werden (weniger Platz fürs Raster)?

### Für das Zusammenführen
- Nur im PianoRoll-Block: `N1_SVG`/`N1_ICON` (neben `EDGE`), CSS `.n1b`/`.n1i` (vor `.pr-bar .sep`), zwei Knöpfe hinter „−12“,
  `n1Pos`/`n1Note`/`mirrorNotes`/`reverseNotes` (vor `quantizeNotes`). Alle mit `/* N1 */` markiert.
