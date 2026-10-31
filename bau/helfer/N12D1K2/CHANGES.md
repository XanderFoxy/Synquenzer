# Helfer N12D1K2 — K2 · N1 · N2 · D1 (Basis App 4.23.0, `vs-base-B.html`)

Stand: alle vier Pakete gebaut, Abnahme grün (Einzelheiten je Paket). Keine Supabase-Aufrufe; „MS 2000“ genau einmal, kein Korg-Wort.

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
  Töne bleiben in der Skala, Intervalle gespiegelt (C-D-E-G → G-F-E-C in C-Dur); zweimal = Ausgangslage. Ein leiterfremder Ton
  bleibt leiterfremd, wenn gegenüber ein Ganzton-Schritt liegt; landet er gegenüber in einem Halbton-Schritt (E–F, H–C), gibt es dort
  keinen leiterfremden Ton – er rastet in die Tonart ein (dann ist zweimal nicht mehr die Ausgangslage). Zeit, Länge, Anschlag bleiben.
  Ergebnis außerhalb C1…C8 (Zeilen der Rolle) → nichts geändert, Blase.
- **Umdrehen:** zeitlich rückwärts: Start' = a + b − Start − Länge. Bereich: Auswahl = erste Note bis letztes Ende; ganzer Clip
  = 0 … Clip-Länge. Länge, Anschlag, Ton je Note bleiben; der Roh-Einsatz `o` wandert mit (zweimal = deep-equal).
- Beide nacheinander möglich (rückwärts gespiegelt). Nichts zu ändern → kein Undo-Schritt, kurze Blase.

### Abnahme
| Punkt | Prüfung (echte Touch-Tipps) | Ergebnis |
|---|---|---|
| N1-01 | C-D-E-G → Spiegeln → G-F-E-C, alle Töne in C-Dur, Zeit/Länge/Anschlag gleich; Auswahl D,E → E,D | bestanden |
| N1-02 | Umdrehen ganzer Clip: Starts 0 / 1,25 / 2,75 / 3,5 (Soll), Anschlag/Länge je Note gleich; Auswahl im Bereich 1…2,75 | bestanden |
| N1-03 | Spiegeln ×2, Umdrehen ×2 = Ausgangslage deep-equal (auch `o`, auch A-Moll mit C♯/F♯ gegenüber Ganztönen); beide + 2× Undo = Ausgangslage | bestanden (leiterfremd gegenüber Halbton: rastet ein, s. o.) |
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

---

## N2 — Weite Wege beim Ziehen: Mini-Karte und Achsen-Einrasten

### Was neu ist
- **Mini-Karte:** Sobald Noten gehalten und gezogen werden (Zeichnen oder Auswahl, Geste „Verschieben“), erscheint im Notenfeld
  eine Karte des ganzen Clips (bzw. der Song-Melodie): 48 px hoch, volle Breite (8 px Rand), Noten als Striche (die gehaltenen
  hell), sichtbarer Ausschnitt als gelber Rahmen. Sie liegt oben; beginnt der Finger im oberen Band (< 78 px), liegt sie unten –
  sie liegt nie unter der Stelle, an der der Finger aufsetzt. Die Info-Blase rückt unter die Karte.
- **Finger auf die Karte:** Die Ansicht gleitet dorthin (≈ 0,2 s, mitlaufend), die Noten bleiben in der Hand: die gefasste Note
  steht am Takt/Schritt unter dem Finger (Raster), Tonhöhe bleibt (bei waagrechter Sperre die gesperrte). Loslassen auf der Karte
  setzt sie dort ab; zurück ins Notenfeld = normal weiterziehen. Eine Geste = ein Undo, Länge und Anschlag bleiben.
- **Achsen-Einrasten:** nach den ersten 12 px: klar waagrecht (|dx| ≥ 2·|dy|) → Tonhöhe fest; klar senkrecht → Zeit fest;
  schräg → frei. Einrasten mit leichter Haptik (`haptic('tick')`). Die Sperre löst sich erst nach 48 px quer (≈ 2 Reihen).
  Bei senkrechter Sperre ist die Karte aus (sie würde sonst die Zeit verschieben).
- Ohne Ziehen ändert sich nichts (Regression gegen 4.23.0: Knöpfe, gerade Züge, Länge, Zeichnen gleich).

### Abnahme
| Punkt | Prüfung (CDP-Touch-Züge) | Ergebnis |
|---|---|---|
| N2-01 | 16-Takt-Clip, Note in Takt 16 → auf die Karte links → Takt 1 in ≈ 0,93 s (inkl. Zug), Anschlag 0,37 und Länge 0,75 gleich, +1 Undo; 6 Formate | bestanden |
| N2-02 | waagrecht 180 px mit ±20 px Zittern → Ton unverändert, Haptik | bestanden (P1, L1) |
| N2-03 | senkrecht 112 px mit ±20 px Zittern → Zeit unverändert, Haptik | bestanden (P1, L1) |
| N2-04 | Karte 48 px hoch, ganz im Bild, nicht unter dem Finger (auch Finger oben → Karte unten); 6 Formate | bestanden |
| N2-05/06 | Sperre löst sich bei 90 px quer; schräger Zug bleibt frei | bestanden |
| Layout | Seitenhöhe gleich, Karte weg nach dem Loslassen, keine Fehler | bestanden |
| Regression | `roll-regress.mjs`: gleiche Aktionen auf 4.23.0 und neu → gleicher Clip, gleiches Layout (P1, P3, L1) | 30/30 |

Tests: `tests/n2-abnahme.mjs` (28/28), `tests/roll-regress.mjs` (30/30).

### Abweichungen
- „Bestehende Tasten zum Sperren bleiben“: Die Rolle hatte keine Sperr-Tasten (nur „Tonart sperren“ an der Tastatur, unberührt).
- Liegt die Karte oben, deckt sie beim Ziehen die obersten ~2 Reihen ab; ein Zug dorthin wird zum Kartensprung. Zum Ablegen
  dort kurz scrollen (oder senkrecht ziehen: dann ist die Karte aus).
- N1-Nachtrag: die Trefferflächen-Erweiterung der N1-Knöpfe ragte 2 px seitlich über (Text galt als abgeschnitten) – behoben.

### Fragen an Xander
- N2: Soll die Karte auch die Tonhöhe übernehmen (Finger auf der Karte höher = höherer Ton)? Gebaut: nur die Zeit.
- N2: Karte auch beim Ändern der Länge (rechtes Ende ziehen) oder beim Zeichnen? Gebaut: nur beim Verschieben (Spec: „hält und zieht“).

### Für das Zusammenführen
- Nur im PianoRoll-Block: Konstanten `MMH/MMG/AX_ON/AX_OFF`, CSS `.pr canvas.pr-mm`, Canvas `cMM`, `mmOn/mmRect/mmSpan/mmBeat/mmDraw/mmGlide`
  (vor `rr`), ein Aufruf `mmDraw(C)` in `draw()`, `move`-Zweig in `drag()` (Achse, Karte), zwei Zeilen Animationsende
  (`mainUp`, `abort`), Test-Hook `_mm()`. Markiert mit `/* N2 */`.

---

## D1 — Drum-Sequencer: Länge je Spur, Richtung

### Was neu ist
- **Daten (Format 5, additiv):** Drum-Clip bekommt `lanes` = `{GM-Nummer: {len 1–64, dir 'rev'|'pend'|'rnd', seed 1–99}}`, nur
  Abweichungen vom Standard (fehlt `len` = Clip-Länge, fehlt `dir` = vorwärts). In `normClip` (normiert/geprüft) und `cleanClip`
  (Undo, Kopie, Speichern). Clips ohne `lanes` spielen exakt wie 4.23.0.
- **Polymeter:** Eine Spur mit eigener Länge zählt ihre Schritte ab Clip-Start durch (nicht je Clip-Runde): Hi-Hat 12 gegen
  Kick 16 ist nach 48 Schritten wieder deckungsgleich. Schritte hinter der Spur-Länge schweigen (bleiben gespeichert). Der Clip
  selbst bleibt so lang wie bisher. Chance, Wirbel, Timing, Akzent, Locks und Swing wirken wie bisher (gleiche `expandStep`).
- **Richtung je Spur:** vorwärts · rückwärts · Pendel (0…n−1…1, ohne doppelte Enden) · Zufall (Schritt = Zufall aus Startwert
  und Schrittzahl → jedes Abspielen gleich; anderer Startwert = andere Folge).
- **Bedienung (SCHRITTE, gewähltes Instrument):** Im Fuß neben „Euklid…“/„Muster ▾“ ein Knopf mit gezeichneter Loop-Klammer und
  der Länge (z. B. „] 12 ←“). Tipp → Blatt „HH ZU – Länge und Richtung“: Regler Länge (1–64 Schr.), vier Richtungs-Tasten
  (44 px), Regler Startwert (nur bei Zufall), Taste **„×2 – Clip verdoppeln (mit Inhalt)“** (bis 16 Takte, Spuren behalten ihre
  Länge). Alles sofort hörbar; ein Undo, wenn das Blatt schließt (ohne Änderung keins); ×2 = ein Undo. Gespeichert wird nur, was
  vom Standard abweicht: eine Spur so lang wie der Clip hat keine eigene Länge und wächst mit ×2 mit. Der Länge-Regler reicht bis
  zur Clip-Länge (max. 64); längere Spuren nach ×2. Die Werkzeug-Zeile lässt sich per Finger seitlich wischen (P2/P3 mit Takt-Wahl).
- **Im Schritt-Raster:** der letzte Schritt der Spur trägt eine gelbe Klammer, Schritte dahinter sind gedimmt; der Laufpunkt
  zeigt beim Abspielen den Schritt der Spur (auch rückwärts/Pendel/Zufall).

### Abnahme
| Punkt | Prüfung | Ergebnis |
|---|---|---|
| D1-01 | Clip spielt (240 BPM, echte Planung, gemessene Treffer): Hi-Hat 12 Schritte (Schritte 1, 6, 14) gegen Kick 16 → Treffer bei g mod 12 ∈ {0, 5}, Schritt 14 schweigt, Schritte 0–47 = 48–95 | bestanden |
| D1-02 | rückwärts (5), Pendel (4), Zufall (8, Startwert 5): Treffer = Definition, zweiter Lauf gleich, Zufall ≠ vorwärts, Startwert 6 anders | bestanden |
| D1-03 | ×2 per Touch: 1 → 2 Takte, Inhalt doppelt, Spuren bleiben, +1 Undo; Undo deep-equal; Richtung per Touch +1 Undo; Speichern → Laden deep-equal; ungültige Felder normiert | bestanden |
| D1-03 | alter Clip ohne `lanes` (mit Chance/Wirbel/Timing/Akzent): gleiche Treffer wie 4.23.0 | bestanden |
| D1-04 | Knopf und Blatt in 6 Formaten im Bild, nichts abgeschnitten, Blatt-Tasten ≥ 44 × 44, Seitenhöhe gleich | 18/18 |
| Laufpunkt/Klammer | rückwärts 12: Laufpunkt = Spur-Schritt 24/24, Klammer auf Schritt 12, 4 gedimmt | bestanden |
| Regression | Schritt-Seite ohne `lanes` gegen 4.23.0: Zellen, Leiste, Overview, Seitenhöhe, Tipp-Ergebnis gleich (alle Formate) | gleich; Abweichungen siehe unten |

Tests: `tests/d1-abnahme.mjs` (11/11), `tests/d1-layout.mjs` (18/18), `tests/d1-playhead.mjs` (3/3), `tests/d1-regress.mjs`.

### Abweichungen
- „Loop-Klammer im Schritt-Raster ziehbar“: gebaut als Länge-Regler im Blatt + gezeichnete Klammer im Raster (Spec: „Länge
  bzw. Loop-Klammer“). Ein Zug an der Klammer selbst kollidiert mit dem Malen der Schritte (Wischen = malen) und mit dem
  8×2-Raster hochkant → Frage.
- Der neue Knopf braucht 50 px im Fuß: quer rücken Euklid/Muster/Takt-Wahl 50 px nach links, die Spur-Tabs werden 50 px
  schmaler (alle 7 ganz sichtbar außer 667×375 mit mehrtaktigem Clip: dort scrollt die Tab-Zeile wie vorher, TIMING jetzt auch
  im Scrollbereich). Hochkant P2/P3 mit mehrtaktigem Clip: die Takt-Wahl ist 96 px breit und die Werkzeug-Zeile scrollt seitlich
  (wie die Werkzeugleisten der Rolle). Fuß-Knöpfe sind 28–34 px hoch wie Euklid/Muster (bestehendes Layout).
- MIDI-Export schreibt die gespeicherten Schritte (ohne Polymeter/Richtung); der Klang in der App folgt `lanes`.

### Fragen an Xander
- D1: **Wahrscheinlichkeit je Schritt und Wirbel (Ratchets) gibt es schon** (Reiter CHANCE und WIRBEL in SCHRITTE). Vorschläge
  für weitere „Spielereien“ (nicht gebaut): Wahrscheinlichkeit je Spur statt je Schritt, Wirbel-Zufall, Spur-Versatz (Start
  verschieben), „Schritt überspringen“, Swing je Spur.
- D1: Soll die Klammer im Raster direkt ziehbar sein (dann z. B. nur mit Halten > 0,5 s, damit Wischen weiter malt)?
- D1: Soll der MIDI-Export die Polymeter-Folge ausschreiben (dann so lang wie bis zur Deckung, z. B. 48 Schritte)?
- D1: Zählt die Spur bei jedem Neustart des Clips (Szenenwechsel) von vorn (so gebaut) oder soll sie über Szenen weiterlaufen?

### Für das Zusammenführen
- `/* D1 */`-Blöcke: `D1_DIRS`, `d1Norm`, `d1Lane`, `d1Pos`, `d1Map` (vor `cleanClip`), eine Zeile in `cleanClip`, eine in `normClip`;
  `scheduleDrums` (zwei Zeilen) + `d1Sched` (vor `cutTrackAt`); Laufpunkt (eine Zeile im Schritt-Rahmen); `pageDrumSteps`
  (`decorate` + `d1Tools`); `d1Decorate`, `d1Tools`, `d1Double`, `d1Pop`, `D1_ICON` (vor `openEuclid`); CSS nach `.dtools`.

---

## Unabhängiger Nachtest (zweiter Prüfer) und Korrekturen

Ein zweiter Prüfer hat den Diff gelesen und mit eigenen Touch-/Klang-Skripten geprüft. Bestätigte Fehler und was daraus wurde:

| # | Fund | Korrektur | Nachweis |
|---|---|---|---|
| 1 | D1: Werkzeug-Zeile in 375×667 (2 Takte) per Finger nicht wischbar (Blatt hat `touch-action:none`), Länge-Knopf unerreichbar | Zeile scrollt per Pointer-Zug (Tipp bleibt Tipp, > 12 px ist kein Tipp) | `qa-fixes.mjs` QA-1: echter Wisch, Knopf ganz sichtbar, Tipp öffnet Blatt |
| 2/8 | D1: Antippen von Richtung schrieb die Länge fest (nach ×2 / kürzerem Clip schwieg die Spur taktweise) und machte ohne Änderung einen Undo-Schritt | nur Abweichungen speichern; ohne Änderung kein Undo | QA-2 Leerlauf (keine lanes, +0 Undo), QA-2 ×2 (Spur 32) |
| 3 | N1: Behauptung „leiterfremd bleibt leiterfremd, zweimal = Ausgangslage“ stimmte nicht gegenüber Halbtonschritten | Beschreibung korrigiert (rastet dort in die Tonart ein); Tonumfang auf die Rollen-Zeilen C1…C8 begrenzt | – (Verhalten bewusst, siehe Frage) |
| 4 | N2: Loslassen direkt auf der Karte → Ansicht blieb auf halbem Weg stehen, abgesetzte Note nicht im Bild | Gleiten läuft nach dem Loslassen zu Ende | QA-4 |
| 5 | N2: Schließen der Rolle während des Gleitens → TypeError | Gleiten hat eigenen Zustand, `destroy` stoppt es | QA-5 |
| 6 | D1: Spur länger als der Clip = nur unbearbeitbare Stille | Länge-Regler bis Clip-Länge (64 nach ×2…) | QA-6 |
| 7 | Trefferflächen < 44 px (Fuß-Knopf D1 28–34 px, N1-Knöpfe = Leistenhöhe 36–44 px) | nicht geändert (bestehende Leisten-/Fußhöhe der App) | offen → Frage |

Nicht bestätigte Verdachtsfälle (offen gelassen): K2 – bei Begrenzer-Stufe 3 können gehaltene Noten jetzt bis zur eigenen Stimmenzahl
klingen (weniger Aussetzerschutz, CPU nur mit 6 Stimmen gemessen); der Vorhör-Klang (`PV.chain`) bekommt `polyH: 0` nicht zurück
(wirkt nur, wenn dort poly gesenkt wird); N1 mit automatischer Tonart kann zwischen zwei Tipps die Tonart neu erkennen; Umdrehen einer
Note, die über das Clip-Ende ragt, schneidet sie auf 0 (zweimal ≠ Ausgangslage).

### Fragen an Xander (Nachtest)
- N1: Leiterfremder Ton gegenüber einem Halbtonschritt – einrasten (so gebaut) oder chromatisch spiegeln (dann bleibt die Ausgangslage, aber Töne außerhalb der Tonart entstehen)?
- Allgemein: Editor-Leisten und Drum-Fuß höher machen (44 px Tasten) auf Kosten des Rasters?
- K2: Soll der Begrenzer auf Stufe 3 gehaltene Noten doch kürzen dürfen (Aussetzerschutz vor vollem Akkord)?
