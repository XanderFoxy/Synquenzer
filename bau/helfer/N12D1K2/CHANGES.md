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
