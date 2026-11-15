# MTX3b – Einzelspuren von DRUMS: die offenen Punkte (Notizen, 15.11.2026)

index.html = basis.html (Kandidat 4.68.0, rel-4680) + Block `/* MTX3B-BEGIN … MTX3B-END */` direkt hinter `/* MTX3-END */`
+ 24 Haken-Zeilen (je ein Einzeiler mit `/* MTX3B … */` und `typeof`-Schutz; keine vorhandene Zeile geändert, `diff` = nur `>`-Zeilen).
`block.js` = der Block allein, `ins.cjs` = baut index.html aus basis.html (Anker je Haken eindeutig geprüft).

| Stelle | Haken |
|---|---|
| gr2Role (oben) | `mtx3bRole(t, c)` – Einzelspur = Drum-Rolle wie DRUMS; merkt Spur + Clip für die Umrechnung |
| gr2Translate, gr1DrumNotes (1. Zeile) | `src = mtx3bIn(src)` – DRUMS + Einzelspuren zusammen umrechnen |
| gr2RemixDo, gen3MxRemix, gen4ClipConv, gr1Pattern, GR1-Remix (nach der Umrechnung) | `mtx3bPads(t, notes, src)` – jede Spur behält ihre Pads |
| gr1Pattern, GR1-Remix (davor) | `mtx3bRole(t, c)` – Kontext |
| gen4ClipConv (vor return), gen3MxRemix (nach normClip) | Einzelspur-Clip als Drum-Clip normalisiert (Saat, D1, Akzent/Chance/Wirbel) |
| gen4Tracks | Einzelspuren nicht einzeln im Stil-Blatt (folgen der Wahl für DRUMS) |
| snd1Build (vor mixaAfter) | `mtx3bSnd` – Stil-Klang der Drums (Drive/Hall/Echo, Mischung) auch auf den Einzelspuren |
| recNoteOn | `mtx3bRecO(o)` – Taste = Schlag des Pads |
| recBegin (fester Takt) / recClose | Saat für den neuen Clip der Einzelspur |
| normTrack (nach MTX3) | `mtx3bNormTr` – Drum-Felder auch mit anderem Klang |
| mtx3Split (nach MTX3.last) | `mtx3bShow(made)` – quer umblättern |
| buildRoll (nach VX1R / nach mtx3RollHook) | `mtx3bDrumView()` / `mtx3bRollHook` |
| Bild-Schleife (nach laufFrame) | `mtx3bFrame(bAud)` – Lauflicht, Nachziehen |
| undoApply (Clip-Zweig) | Drum-Schritt-Editor der Einzelspur bleibt nach ↶/↷ offen (vorher closeRoll) |
| pageDrumSteps (nach d1Tools) | `mtx3bDrumTools` – [Auslagern ▾] |

## Entscheidungen
1. **Remix doppelt (GR2/GEN4/GEN3/GR1):** DRUMS und ihre Einzelspuren werden *zusammen* umgerechnet (Partner-Clip je Spur = gleiche
   Saat/Länge/Taktart, wie beim Aufteilen kopiert; bei mehreren der in derselben Szene). Danach behält jede Spur nur ihre Pads: die
   Einzelspur ihr Pad, DRUMS lässt ein Pad weg, dessen Einzelspur hier einen Partner-Clip hat und das im DRUMS-Quell-Clip nicht mehr liegt.
   Ergebnis = Remix ohne Aufteilen, Pad für Pad (Pad-Zuordnung, Kern-Schläge, Ausdünnen identisch). Hat die Einzelspur in einer Szene
   keinen Clip (Pad dort nicht ausgelagert), bleibt das Pad auf DRUMS (nicht stumm, nicht doppelt). Ein ↶ wie bisher (songEdit /
   Gruppe / Szene). Stil-Klang (SND1) schreibt nur Klang – keine Noten; Drive/Hall/Echo + Mischung des Drum-Profils gehen jetzt auch
   auf die Einzelspuren (gleicher ↶-Schritt).
2. **Tastatur-Aufnahme** auf einer Einzelspur: wie die Pads (`recPad`): GM-Nummer des Pads, Schrittlänge 0,1, kein Träger-Rückrechnen;
   neuer Clip bekommt eine Saat (Overdub, feste Länge, freie Länge, Rest-Noten).
3. **L5 Laden im Synth-Modus:** normTrack liest den Clip wie bisher als Synth-Clip (Tonhöhen bleiben) und holt aus derselben Quelle die
   Drum-Felder dazu (Saat, D1-Spuren, a/p/r/m/lk an Drum-Noten, Klang-Locks). Rundreise byte-gleich; zurück zum Drum-Ton = alles da.
   Projekte ohne dvx: unverändert (Rundreise gleich).
4. **L6 quer:** nach Aufteilen / Auslagern blättert die Spur-Seite zu den neuen Spuren (mxApply + setTrackBank, Song-Ansicht folgt).
5. **L7 Hi-Hats im Drum-Editor → eigene Spur:** Drum-Editor › SCHRITTE › [Auslagern ▾] (Knopf wie [Euklid…]/[Muster ▾], Trefferfläche
   50/44 px per ::after). Blatt „Auslagern“ im MTX3-Stil: Töne (Pad-Knöpfe, das gewählte Pad vorgewählt, „→ HH ZU dazu“ wenn es die
   Spur schon gibt), „Was“: [Ganze Töne · alle Szenen] │ [Nur diese Schritte · Szene n] (Schritt-Knöpfe 44 px, alle vorgewählt,
   abwählbar). Neue Einzelspur wie beim Aufteilen (Kanal = DRUMS, vor DRUMS, Song-Zeile/Teile wie DRUMS) oder dazu in die vorhandene;
   DRUMS behält den Rest (D1-Spur/Locks gehen mit, sobald das Pad im Clip leer ist). Ein ↶. Drum-Editor bleibt offen.
   **Hochkant** ist die Werkzeug-Zeile voll (Euklid · Muster · Länge = 265 px) – dort steht [Auslagern ▾] in der Zeile darunter
   rechts neben „Szene n“ (gleiche Höhe 34 px); quer in der Werkzeug-Zeile. → im Funk erwähnen (sichtbar: ein Knopf mehr).
6. **M3 Drum-Editor je Einzelspur:** ein Clip einer aktiven Einzelspur öffnet im Noten-Editor-Blatt den Drum-Schritt-Editor ihrer
   Pad-Zeile (StepEditor wie DRUMS: VEL, AKZENT, CHANCE, WIRBEL, TIMING, TUNE, DECAY; Takt-Wahl, ↶ ↷ [⌨] quer; unten „Pad … · Klang
   von DRUMS“ + [Pad-Klang] = Pad-Editor von DRUMS). Aufbau/Größen wie LAUF ([SCHRITTE │ ROLLE] wie [LAUF │ ROLLE]); in der Klavierrolle
   der Einzelspur heißt [LAUF] jetzt [SCHRITTE]. Schritte hören über den eigenen Kanal der Spur; Lauflicht beim Spielen.

## Messung (mtx3b-test.mjs, 67/67, Touch über CDP, 428×926 / 926×428 / 926×370)
- Treffer je Pad im Song (int54MidiClips), Bezug ohne Aufteilen: Stil-Muster kick 12 · hatC 48 · hatO 8 · snare 6 · clap 6, Stil 70 %
  kick 12 · hatC 16 · snare 6 · clap 2 · hatO 2 · perc 1 → **mit Einzelspuren gleich, Doppel 0**. Basis 4.68.0: Stil-Muster
  hatC 48 (DRUMS) + 16 (HH ZU) = **16 Doppel-Schläge**, Rolle der Einzelspur null (ihr HH wird nicht umgebaut), Matrix-Remix: HH landet auf DRUMS, SNARE fehlt in der neuen Szene.
- Summen-Audio Stil-Muster aufgeteilt ↔ ohne Aufteilen: ≤ −60 dB (gemessen −12x dB, Math.random fest).
- GEN4 Szene: Schläge gesamt 14 = 14, jede Spur nur ihr Pad, Saat bleibt, 1 ↶. Matrix-Remix: Einzelspuren bekommen Drum-Clips.
  Grundmuster: DRUMS ohne ausgelagerte Pads. Stil-Klang: Drive/Hall/Echo gleich DRUMS, Noten gleich, 1 ↶.
- Tastatur: Overdub +4 Schläge GM 42 / 0,1; neuer Slot 4 Schläge GM 42 / 0,1 + Saat. L5: Rundreise gleich (a/p/r/m/D1).
- Auslagern ganze Töne: Summen-Audio −124,9 dB; Schritte: 4 von 6 gewählt → neue Spur 4, DRUMS 2 + Szene 2 unverändert; Rest „dazu“.
- Quer: nach Aufteilen Seite 2 (Spuren 6, 7 im Bild). Schritt-Editor der Einzelspur: 16 Zellen = HH-Schritte, Tipp = GM 42 / 0,1,
  ↶ in der Leiste, CHANCE-Spur ziehen setzt p, ROLLE ↔ SCHRITTE, Lauflicht, keine Konsolenfehler.

## Regression (nacheinander, reg/)
siehe LOG.md (mtx3-test, mtx3p-test – Kopie: M6 erwartet jetzt Drum-Rolle 'dr' statt null für Einzelspuren –, ux2-test gegen Basis, imp1-test).

## Offen
- Begleiter (BEG1) spielt live alle Pads auf DRUMS (kein Doppel im Clip, aber HH dann über den DRUMS-Kanal).
- FANG (letzte Phrase einfangen) und Melodie-Spur im Song speichern auf einer Einzelspur weiter die Tonhöhe der Taste.
- Stil-Muster in einer Szene, in der die Einzelspur keinen Clip hat: das Pad bleibt dort auf DRUMS (eigener Kanal erst nach Auslagern).
- Schritt-Editor der Einzelspur: ohne FOLGEN-Chip, ohne PL1-Locks (lange drücken) und ohne D1-Länge/Euklid/Muster – Vorschlag Funk.
- MIDI-Export / Klang-Editor „ECO“ wie MTX3 (unverändert).
