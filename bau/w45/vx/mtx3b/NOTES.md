# MTX3b – Einzelspuren von DRUMS: die offenen Punkte (Notizen, 15.11.2026)

index.html = basis.html (Kandidat 4.68.0, rel-4680) + Block `/* MTX3B-BEGIN … MTX3B-END */` direkt hinter `/* MTX3-END */`
+ 35 Haken-Zeilen (nach der Prüfung; je ein Einzeiler mit `/* MTX3B … */` und `typeof`-Schutz; keine vorhandene Zeile geändert, `diff` = nur `>`-Zeilen).
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
| gr2RemixDo (nach gr2VerPut) | Stil-Muster-Version einer Einzelspur ohne D1-Spuren (wie DRUMS) |
| ownNorm (nach normClip) | `mtx3bOwnNorm` – Version (song.own) einer Einzelspur = Drum-Clip (Prüfung 3) |
| normalizeProject (vor normSong / nach normPart) | `mtx3bOwnNorm.tr` = die geladenen Spuren / zurück auf null (Prüfung 3) |
| mtx3Merge (nach den Schnappschüssen) | `mtx3bMergeVer(L)` – Song-Versionen der Einzelspuren zurück nach DRUMS (Prüfung 2) |
| mtx3Split (nach den Song-Zeilen) | `mtx3bVerMove` – Song-Versionen (Remix) geben das Pad mit (Prüfung 6) |
| gen4DoScene / gen4DoAll | `mtx3bZ(Z, …)` – Einzelspur rechnet mit dem Original von DRUMS (Prüfung 1, GEN4) |
| commitRecNote (3 × nach dem Ablegen) | `mtx3bRecDup` – ein Schlag je Stelle auf der Einzelspur (Prüfung 8) |

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
- Summen-Audio Stil-Muster aufgeteilt ↔ ohne Aufteilen: −119,9 dB (Song-Render, Math.random fest; Grenze −60 dB).
- GEN4 Szene: Schläge gesamt 14 = 14, jede Spur nur ihr Pad, Saat bleibt, 1 ↶. Matrix-Remix: Einzelspuren bekommen Drum-Clips.
  Grundmuster: DRUMS ohne ausgelagerte Pads. Stil-Klang: Drive/Hall/Echo gleich DRUMS, Noten gleich, 1 ↶.
- Tastatur: Overdub +4 Schläge GM 42 / 0,1; neuer Slot 4 Schläge GM 42 / 0,1 + Saat. L5: Rundreise gleich (a/p/r/m/D1).
- Auslagern ganze Töne: Summen-Audio −130,4 dB; Schritte: 4 von 6 gewählt → neue Spur 4, DRUMS 2 + Szene 2 unverändert; Rest „dazu“.
- Quer: nach Aufteilen Seite 2 (Spuren 6, 7 im Bild). Schritt-Editor der Einzelspur: 16 Zellen = HH-Schritte, Tipp = GM 42 / 0,1,
  ↶ in der Leiste, CHANCE-Spur ziehen setzt p, ROLLE ↔ SCHRITTE, Lauflicht, keine Konsolenfehler.

## Regression (nacheinander, reg/)
mtx3-test 51/51 · mtx3p-test 21/21 (Kopie reg/mtx3p-test.mjs: M6 erwartet jetzt Drum-Rolle 'dr' statt null für Einzelspuren – keine
Synth-Rolle, Absicht) · ux2-test 22 OK / 5 FAIL = basis.html zeilengleich (alte Erwartungen vor MTX) · imp1-test ALLE OK (116 s).
Nach den letzten zwei Kleinigkeiten (Blatt-CSS, D1-Haken) erneut: mtx3b 67/67, mtx3 51/51, mtx3p 21/21, smoke errors [].

## Funk (sichtbar anders – kurz sagen)
- Drum-Editor › SCHRITTE: neuer Knopf [Auslagern ▾] (quer in der Werkzeug-Zeile, hochkant rechts in der Zeile „Szene n“).
- Clip einer Einzelspur öffnet jetzt den Drum-Schritt-Editor (statt Klavierrolle); [ROLLE] bleibt einen Tipp entfernt.
- Stil-Blatt (GEN4) listet Einzelspuren nicht mehr einzeln – sie folgen der Wahl für DRUMS.

## Offen
- Begleiter (BEG1) spielt live alle Pads auf DRUMS (kein Doppel im Clip, aber HH dann über den DRUMS-Kanal).
- FANG (letzte Phrase einfangen) und Melodie-Spur im Song speichern auf einer Einzelspur weiter die Tonhöhe der Taste.
- Stil-Muster in einer Szene, in der die Einzelspur keinen Clip hat: das Pad bleibt dort auf DRUMS (eigener Kanal erst nach Auslagern).
- Schritt-Editor der Einzelspur: ohne FOLGEN-Chip, ohne PL1-Locks (lange drücken) und ohne D1-Länge/Euklid/Muster – Vorschlag Funk.
- MIDI-Export / Klang-Editor „ECO“ wie MTX3 (unverändert).

## Prüfung MTX3b (PRUEFUNG.md, 11 Befunde) – behoben 15.11.
Gebaut wie zuvor: `block.js` + `ins.cjs` (35 Haken, 10 neu, Anker eindeutig in basis.html) → index.html. Messungen: Prüfer-Sonden
`pruef/a … j` auf der neuen Fassung grün; im Bauer-Test neuer Abschnitt „Prüfung MTX3b“ (20 Prüfungen, mtx3b-test jetzt 87).

| # | Befund | Stand | Was jetzt gilt |
|---|---|---|---|
| 1 | [schwer] „Nur diese Schritte“, dann Remix/GEN4: HH doppelt | behoben | `mtx3bPads`: hat die Einzelspur den Partner-Clip, geht das Pad ganz auf sie – auch wenn DRUMS noch Schläge davon hat (die Umrechnung kennt beide Teile über `mtx3bIn`). GEN4 ersetzt Spur für Spur: die Einzelspur rechnet über `mtx3bZ`/`mtx3bOrig` mit dem Original von DRUMS (Z.src), nicht mit dem schon umgerechneten Clip. Gemessen: Stil-Muster hatC 48 = ohne Aufteilen, 0 Doppel; GEN4 Szene DRUMS 0 / HH ZU 6 = 6 |
| 2 | [schwer] Zusammenführen nach Remix löscht HH | behoben | `mtx3bMergeVer` (vor dem Zusammenführen der Szenen-Clips): je Song-Abschnitt kommt, was die Einzelspuren dort spielen (Version oder Szenen-Clip), in das, was DRUMS spielt – Version von DRUMS in place (spielt sie anderswo anders: Kopie als neue Version), Szenen-Clip von DRUMS → neue Version an der Stelle (`sx9Set`). Danach keine Versionen mit `from.t` einer entfernten Spur. Gemessen: Treffer je Pad gleich, Summe −119,7 dB; DRUMS-Original + HH-ZU-Version −120,3 dB; gemischt (SNARE Original) gleich; ↶ holt alles zurück |
| 3 | [schwer] Laden: Versionen der Einzelspur verlieren Saat/Chance/Wirbel | behoben | ownNorm-Haken `mtx3bOwnNorm`: Version einer aktiven Einzelspur = `normClip(…, 'drum')`; mit anderem Klang wie die Szenen-Clips (Synth + Drum-Felder, `mtx3bAug`). Beim Laden kennt normalizeProject die neuen Spuren (`mtx3bOwnNorm.tr`). Gemessen: HH ZU 8 Chance / 6 Wirbel + Saat vor = nach, Summe −119,9 dB (Prüfer −123,3 dB), Rundreise byte-gleich. Container: gleiches Projekt-JSON über normalizeProject (nicht einzeln gemessen) |
| 4 | [mittel] „→ HH ZU dazu“ in kürzeren Clip / belegte Stelle | behoben | `mtx3bInto`: kürzerer Ziel-Clip wird bis zur Länge des DRUMS-Clips wiederholt (klingt gleich, nicht bei D1-Spur des Pads oder anderer Taktart); längerer: die Schläge wiederholen sich darin wie auf DRUMS. Was nicht passt, bleibt auf DRUMS (Toast „n bleiben auf DRUMS“). Belegte Stelle: ein Schlag, der lautere bleibt, Toast „n doppelte zusammengefasst“ (zwei gleiche Schläge an einer Stelle = der Doppel-Schlag, den MTX3b vermeidet). Gemessen: 3/3 im Clip, Summe −124…−126 dB |
| 5 | [mittel] Duplizierte Szene + Grundmuster: HH doppelt | behoben | `mtx3bPartner`: Szene aus dem Kontext (`MTX3B.ctx.c`), bei Versionen `from.s`, bei GEN4 der Z-Schlüssel. Gemessen: DRUMS 0 HH, HH ZU 6 |
| 6 | [mittel] Erst Remix, dann HH auslagern: HH bleiben auf DRUMS | behoben | `mtx3bVerMove` (Auslagern „Ganze Töne“ und Aufteilen): die Song-Versionen von DRUMS geben die Schläge des Pads an eine Version der Einzelspur (gleiche Szene/Nummer/Stil, also findet ein späterer Remix sie), die Zeile der Einzelspur spielt sie dort, wo DRUMS die Version spielt (vorher Stopp). Spielt die Einzelspur dort schon etwas, bleibt die Version auf DRUMS (Toast). Eigene Clips des Songs (keine Versionen) bleiben wie in MTX3 ganz auf DRUMS. Gemessen: HH im Song 16× auf HH ZU, 0× auf DRUMS; ↶ zurück; Aufteilen ebenso. **Sichtbar anders gegenüber MTX3:** Aufteilen nimmt Remix-Versionen jetzt mit – im Funk erwähnen |
| 7 | [mittel] Schritt-Editor ignoriert D1-Länge | behoben | Zellen hinter dem Spur-Ende gedimmt (`d1o`), Klammer am letzten Schritt (`d1e`) – dieselben Klassen wie DRUMS (d1Decorate); Signatur enthält die D1-Spuren (Neuzeichnen nach ↶). Gemessen: Länge 12 → Zellen 13–16 gedimmt, Klammer an 12 |
| 8 | [mittel] Tastatur-Akkord = gestapelte Schläge | behoben | commitRecNote-Haken `mtx3bRecDup`: auf einer Einzelspur ein Schlag je Stelle (mit Raster gleiche Stelle, ohne Raster ±0,09 Schläge), der lautere bleibt. Gemessen: 0 gestapelte Schritte |
| 9 | [leicht] Blatt wählt KICK vor | behoben | Vorwahl = Pad im Drum-Editor, außer dem Ton, der beim Aufteilen auf DRUMS bleibt (KICK); dann Hi-Hat zuerst (Reihenfolge wie MTX3) |
| 10 | [leicht] 926×370: [Auf eigene Spur] unter dem Rand | behoben | quer mit wenig Höhe: Blatt breiter (min(800 px, 100vw − 16)), Schritte in einer Reihe (16 × 44 px), Erklärzeile aus, [Auf eigene Spur] klebt unten (sticky). Gemessen: Oberkante 297, Unterkante 349 bei 370 px, ohne Wischen. Das Blatt deckt den Drum-Editor weiter ab (wie alle Blätter quer) – offen, nur Hinweis |
| 11 | [leicht] [Pad-Klang] 90×36 | behoben | Klasse `mtx3rb` (vorhandene ::after-Trefferfläche, −8/+8 px) → 52 px, Leiste bleibt 36 px |

CPU-Frage (Prüfer): kein Befund; die neuen Wege laufen nur bei Remix/Auslagern/Zusammenführen/Laden, nicht im Planer.
Offen/Hinweis: Teile (S.parts) mit eigenen Clips einer Einzelspur werden beim Zusammenführen wie in MTX3 behandelt (Zeile gekürzt);
spielt DRUMS an einer Stelle gar nicht, die Einzelspur aber schon, geht diese Stelle beim Zusammenführen weiter verloren (wie MTX3).

### Läufe nach der Prüfung (nacheinander, md5 19ae2cc4)
- mtx3b-test **87/87** (67 + 20 „Prüfung MTX3b“, Foto `fotos/mtx3b-p-auslagern-schritte-926x370.png`) · mtx3-test **51/51** · mtx3p-test **21/21**
  (Kopie reg/, wie zuvor) · ux2-test 22 OK / 5 FAIL = basis.html zeilengleich · imp1-test ALLE OK (116 s).
- Prüfer-Sonden auf der neuen Fassung: a 6/6 · b 4/4 · d 4/4 · e 3/3 · f 3/3 · h 4/4 · i 3/3 · j 2/2 · g [Pad-Klang] 90×36/52.
  c: alles OK außer C7 (Lauflicht in einem 2-s-Fenster ≥ 5 von 20 Bildern; gemessen 4). Gegenprobe über 8 s: Lauflicht auf Takt 2 in 43
  von 80 Bildern (54 %, erwartet 50 %) – das kurze Fenster hängt von der Testzeit ab, kein Fehler.
- Pflicht: topdefs 26/0/0 · dupkeys 0 · smoke errors [] · „MS 2000“ 1× · „^  live: true,“ 1× · VERSION 4.68.0 · diff basis→index nur Zusätze.
