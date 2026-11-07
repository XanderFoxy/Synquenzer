# GEN3 – eine Genre-Liste, eine Fill-Bibliothek, neue Groove-Stile, Tempo-Version, Remix in der Matrix

Basis: `w4490/basis.html` (4.48.0). Geändert nur `w4490/gen3/index.html`. VERSION/CHANGES nicht angefasst.

## Für Xander

- Überall dieselbe Genre-Liste: Remix, Grundmuster, Werkzeugkasten, Fills und Master-Stile heißen gleich (aus „Frühes House“ wird „House“, Master „Italo“ heißt „Italo-Disco“).
- 27 neue Stile, darunter Boom Bap, G-Funk, Trap, Reggae Steppers und Rockers, Dancehall, Dembow, Drum & Bass, Bossa Nova, Samba, Ska, Synthwave, Power Pop 80er, Freestyle und Halftime-Shuffle. Dazu „Motown-Beat 80er“ und „Eurodance“. Jeder Stil übersetzt **deine** Noten und bringt einen eigenen Fill und Werkzeugkasten-Figuren mit.
- Remix-Blatt: Die ersten zwei Kacheln heißen **Langsam · voller** und **Schnell · dezenter**. Damit ändern sich das Tempo und das Arrangement auf deinen Noten (Hats, Ghosts, Bindungen, Hall und Release). A/B und ↶ stellen das Tempo mit um. Remixt du nur einen Teil, bleibt das Tempo (es gilt für den ganzen Song); ♩ übernimmt es auf Wunsch.
- Remix-Blatt › Bereich **Matrix**: Die gewählte Szene wird als neue Szene übersetzt, der Song bleibt unberührt. A spielt das Original, B den Remix. Das Tempo einer langsamen/schnellen Version gilt dort nur, solange du B hörst; ✕ stellt es zurück, ♩ übernimmt es fest. Ohne Song findest du es unter ≡ › Song › Matrix-Remix … (ist die gewählte Szene leer, nimmt es die erste Szene mit Clips).
- Werkzeugkasten in Reitern: **Grundmuster │ Figuren │ Spielweise**, jeder mit der Zeile „Ziel: Neue Version · Neuer Clip · Diesen Clip“. Im Clip-Blatt steht nur noch [Werkzeugkasten ▾]. Quer scrollt die Genre-Zeile wie hochkant (jede Taste ≥ 44 px).
- In ◆ ÜBERGÄNGE gibt es jede Fill-Figur nur einmal, nach Genre sortiert. Die Drums-Füller im Werkzeugkasten sind dieselben Kacheln.

## Technik

Block `/* GEN3-BEGIN … GEN3-END */` direkt hinter `/* GR2-END */` (eigene Schlüssel mit Präfix `gen3`/`GEN3`, Kachel-Ids `gen3f-…`, Figuren `g3-…`, Drums-Füller `ue:<Bibliothek>`).

- **Genre-Liste:** `GEN3_NEW` (27 Stile im GR1-Format) → `GR1_STYLES`; `GEN3_TV` (Tempo-Versionen, `only`) → `GR2_ONLY`. `GR2_ORDER` wird nach Familien neu geordnet (Disco/Pop · Dance · Hip-Hop/Breaks · Welt · Rock/Country), es bleiben alle alten Ids. `BB1_GEN` wird aus `gr2Order()` gebaut, `BB1_FIG.g` wird über `GEN3_BBMAP` auf Stil-Ids umgestellt (BB1 'disco' → 'euro', 'detroit' (Detroit-House-Figuren) → 'house', 'soul60' → 'detroit', 'country' → 'train' …). `MX2_PF`-Namen der Genre-Profile werden zur Laufzeit gesetzt (`GEN3_MXNAME`), nur `name`, die Ids bleiben.
- **Triolen/Wirbel:** `gr1DrumNotes`/`gr1BassNotes` rechnen mit `gr2T` (bei 16tel-Swing gleiches Ergebnis wie `gr1SwT`, zusätzlich `sw8`). Mit `x.post` gibt es: `'trap'` (Hat-Noten bekommen `r` 2/3 auf `x.roll`-Schritten, der Bass gleitet ab 60 %), `'glide'` (G-Funk) und `'lay'` (Boom Bap: Snare +0,025 Schläge). Gleiten heißt: Überlappung 1/64 wie LAUF › BINDUNG.
- **Tempo-Version:** `gr2Translate` leitet `st.tv` auf `gen3TvNotes` um. Langsam: 16tel-Hats, Ghost-Snares, ein Füller am Clip-Ende bei ≥ 2 Takten, Fläche und Bass gebunden, Sequenzen verdoppelt, Oberstimme mit Nachbarton. Schnell: 16tel-Hats und Ghosts fallen weg, Bass und Sequenz auf Achtel, kürzere Gates. `gen3VerSt` schreibt den Klangzustand der Version (`st.fx.rev`, `st.p.aR`, nur Synth-Spuren). Tempo: `gen3TvTarget` gibt base × (1 − 0,35·k) bzw. × (1 + 0,3·k). `clip.gr.o`/`.t` merken Tempo vorher/nachher, `gen3TvPre/Post` stellen das Tempo nach Remix und A/B.
- **Matrix-Remix:** `gen3MxRemix(src, st, k, art)` schreibt in eine freie Szene (`gen3MxFree`). Eine schon vorhandene Remix-Szene derselben Quelle wird wiederverwendet. Die Clips tragen `clip.gr = {s, v: 1, u, m: Quelle}`, die Akkord-Zeile kommt mit, alles in einem Undo (Gruppe aus Clips und Part). Eigenes Blatt `gen3MxOpen` (Klassen wie das GR2-Blatt), Bereich-Knöpfe wechseln zwischen den Blättern.
- **Fill-Bibliothek:** `gen3Sync()` (gecacht über die Längen von UE_LIB/BB1_FIG) baut die Genres je Kachel (`gs` + `GEN3_UEGS` + Genres der Doppel). Doppel werden über die Signatur erkannt (Reiter, Länge, Schläge, Pads). Doppelt war nur `gr2f-itdance` = `p-snare-lauf`. Die Drums-Füller entstehen als `ue:<Id>`-Figuren aus sichtbaren Kacheln (fill/tom/build, vor der Kante).
- **Prüfung (Nacharbeit):** Tempo-Undo-Art `gen3bpm` (`gen3BpmUndo` hängt das Tempo vorher per `undoMergeSince` an den Remix-Schritt, `gen3BpmPut`, `HIST.kind('gen3bpm')`); `gen3TvPre` gibt `{tv, whole, u0, bpm}`, `gen3TvPost` stellt das Tempo nur beim ganzen Song. Matrix: `gen3MxRemix` setzt kein Tempo mehr; `gen3MxBpm(b)` (B/▶ Hören = Tempo der Version, A = vorher), `gen3MxClose` (✕ zurück), `gen3MxUndo` (↶ aus dem Toast), `GEN3.mx = {src, dst, o, set, keep}` (♩ oder eigenes Tempo = keep). `gen3MxSrc` nimmt bei leerer Szene die erste mit Clips. `gen3GensKeep` (Genre-Zeile behält Stelle), CSS quer `.bb1-gens .rb{flex:1 0 auto;min-width:44px}`. `gen3FillGs` (Genre-Auswahl in ◆ ÜBERGÄNGE). `gen3Trip`/`gen3T8` (Werkzeugkasten-Figuren eines sw8-Stils auf Triolen). Bossa: Rim und comp als Zwei-Takt-Clave. Samba-Fill `k: 'fill'`. 14 Figuren dazu (`g3-…`, Begleitung, kein Bass).
- **Daten:** additiv. `gen3GrNorm` behält `clip.gr.o`, `.t` (40–240) und `.m`. Ohne GEN3-Aktion ist das Standard-Projekt byte-gleich mit der Basis (getestet).

Einhänge-Zeilen (außerhalb des Blocks):
- `undoState`: `if (e.kind === 'gen3bpm') return String(S.bpm);` · `undoApply`: `if (e.kind === 'gen3bpm') gen3BpmPut(val); else` (Prüfung)
- `gr2UegPick`: `const gs = gen3FillGs();` (Prüfung)
- `bb1Notes`: Rückgabe über `gen3Trip(F, {...})` (Prüfung)
- UI1-Hilfe: Eintrag `grund` (wo: „Clip-Blatt › Werkzeugkasten ▾ › Grundmuster“, Sprung `gen3GmOpen`, Stelle `[data-g3t="gm"]`), Eintrag `remix` (Stilzahl aus `gr2Order()`, Tempo-Version, Matrix), Anleitung „Groove bauen“ Schritt `grund` (Prüfung)
- `uePaintBar`: `gen3UeBarPaint(bar)` nach `gr2UeBarPaint`
- `gr1ClipNorm`: `gen3GrNorm(g, o)` nach `gr2GrNorm`
- `gr1DrumNotes`: `gr2T(st, i)` statt `gr1SwT`, Rückgabe über `gen3DrumX(...)`
- `gr1BassNotes`: `gr2T(st, i)` statt `gr1SwT`
- `gr1PatternsHook`: `gen3GmOpen(...)`, sonst wie bisher `gr1PatPop`
- `gr1MenuRow`: ohne Song `gen3MenuRow(...)`
- `gr1ClipSheet`: [Grundmuster ▾] ersetzt durch eine Kommentarzeile
- `bb1List`: `gen3BbList(U) || …`
- `bb1Paint`: am Anfang `if (gen3BbPaint()) return;`, am Ende `gen3BbHead(p)`
- `bb1Act`: am Anfang `if (gen3BbAct(b)) return;`
- `bb1Insert`: `o.F || bb1Fig(figId)` und `o.mk ? o.mk(Z.k) : bb1Build(...)`
- `bb1PvStart(t, s, figId, mk)`: `mk` für fertige Noten
- `gr2Translate`: Weiche für `st.tv`, Rückgabe über `gen3Post(...)`
- `gr2RemixDo`: `gen3VerSt(...)` nach `gr2VerPut`
- `gr2Remix` und `gr2AB`: je `gen3TvPre` vorher und `gen3TvPost` nachher
- `gr2Paint`: `gen3RxPaint(p)` vor `popDock`

Test-API: `SYNQUENZER.gen3` (genres, names, ue, bbDrum, tv, mxRemix, mxOpen, bbOpen, bbAct, gmInsert, swInsert …).

## Tests

- `node gen3-test.mjs <index.html> <ordner>`: **98 Prüfungen OK, 0 FEHLER**. Geprüft werden:
  - Namen in allen Listen und die Master-Namen
  - keine doppelten Fill-Ids oder Schlag-Muster
  - Drums-Füller = Kacheln
  - je neuer Stil ein Fill und eine Figur
  - Boom Bap: Swing, Laid back, Kick auf 1,8
  - Trap: Snare nur auf der 3, Wirbel, 808-Gleiten, Kick-Raster
  - Dembow: Snare .75/1.5/2.75/3.5, Bass 3-3-2
  - Steppers: Kick auf allen Vierteln, Rim auf der 3
  - Halftime-Shuffle: Triolen
  - Tempo-Version langsam: 120 → 86 BPM, Drums 15 → 25 Noten, Gate, Hall 0,3 → 0,62, Release
  - Tempo-Version schnell: 120 → 149 BPM, Drums 15 → 12 und Bass 9 → 5 Noten, Gate 3,5 → 2,8, Hall 0,3 → 0,13
  - A/B-Tempo, Rückkehr des Tempos, ↶
  - Matrix: neue Szene, zweiter Stil in derselben Szene, Song byte-gleich, Tempo-Version, Speichern/Laden von gr.m/o/t, ↶
  - Werkzeugkasten-Reiter, Grundmuster als neuer Clip mit ↶, Spielweise mit Ziel und ↶, Clip-Blatt
  - Tasten ≥ 44 px und ✕ sichtbar (hochkant 428×926, quer 926×428 und 926×370)
  - Standard-Projekt = Basis, Konsole ohne Fehler
  - Abschnitt 8 „Prüfung“: Genre-Zeile Figuren (Drums 46, Bass 21 Tasten) quer 926×428, 926×370 und hochkant – jede ≥ 44 px, jeder Touch-Tipp trifft, die Zeile behält ihre Stelle; ↶/↷ mit Tempo; Teil ändert das Song-Tempo nicht (Kachel + Tipp sagen es); Matrix per Touch (Hören 91, A 120, B 91, ✕ 120, ↶ 120, ♩ bleibt); Hilfe-Sprung „Stil-Grundmuster“ öffnet den Reiter; Remix-Hilfe nennt 44 Stile; [Genre] in ◆ ÜBERGÄNGE 44 Genres; Drums-Füller 55 von 57 (ohne die zwei Crash-Kacheln auf der Eins); Klavier-Achtel Halftime-Shuffle auf 0,667; Bossa-Clave 0 / 1,5 / 3 │ 5 / 6,5 (Drums und Gitarre); Figuren je neuem Stil; leere gewählte Szene → Quelle Szene 1
- Pflicht: topdefs 0/0 (5810 Namen), dupkeys 0, smoke errors [], Markenwörter 0, „MS 2000“ 1×, „  live: true,“ 1×.
- Fotos: `gen3-remix-hochkant.png`, `gen3-matrix-quer.png`, `gen3-werkzeugkasten-quer.png` (jetzt Reiter Figuren quer mit scrollender Genre-Zeile), `gen3-uebergaenge-hochkant.png`.
- Alte Paket-Tests gegen diese Kopie:
  - GR2-Test: 30/36. Die 6 Abweichungen sind gewollt: 44 statt 17 Stile, Grundmuster nicht mehr im Clip-Blatt, BB1-Genre-Ids sind jetzt Stil-Ids, die letzte Kachel liegt quer im Scrollbereich.
  - BB1-Test: Abweichungen bei Genre-Zahl und Drums-Füllern (jetzt 55 Fill-Kacheln statt 6 Figuren), ebenfalls gewollt. Der Schritt „alte Projekte“ läuft dort auf einen Basis-Pfad, den es hier nicht gibt.
  - Nach der Prüfung: GR2 30/36 (dieselben Zeilen wie vorher), BB1 52/55 (dieselben drei gewollten), UI1 33/38 = die Fehler der Basis (Remix-Sprung, Anleitung song:6, VA-Chip) plus die gewollte Doppel-Entfernung in ◆ ÜBERGÄNGE (57 statt 58); „grund“ hochkant/quer und Anleitung groove:2 sind wieder grün.

## Offen

- Ziel-Zeile im Harmonie-Blatt (HM1) und im Remix-Blatt: Funk-Frage an Xander (siehe Prüfung, Befund 8).
- ROLLE behält [Spielweise] für die **Auswahl** im Editor (der Reiter wirkt auf den ganzen Clip). Frage an Xander: diesen Knopf in den Werkzeugkasten legen?
- Tempo-Version: Tempo je Teil gibt es nicht; im Teil bleibt das Song-Tempo (♩ übernimmt es). In der Matrix gilt das Tempo nur beim Hören im Blatt – eine Remix-Szene, die später von Hand gestartet wird, spielt im Song-Tempo. „Zusätzliche Begleitfiguren“ (neues Instrument auf leerer Spur): Funk-Vorschlag (Befund 9).
- Matrix-Remix: Gesang- und Audio-Clips kommen nicht mit in die Remix-Szene. Die Quelle ist die gewählte Szene (leer → erste Szene mit Clips), eine Auswahl im Blatt gibt es nicht. Szenen-Namen werden nicht geändert.
- Stil-Namen „Motown-Beat 80er“ (Plattenfirmen-Name als Genre-Begriff, von Xander so gewünscht) und „Jersey Club“: prüfen, ob das so bleiben darf.
- Werkzeugkasten-Figuren: 8 der 27 neuen Stile haben noch eine Figur (Big Beat, UK Funky, Jersey Club, Go-Go, Steppers, Rockers, Halftime-Shuffle, Rock-Halftime).

## Prüfung (unabhängiger Prüfer, 11 Befunde)

1. **Genre-Zeile quer nicht bedienbar (hoch)** – behoben. Quer gilt jetzt dieselbe Regel wie hochkant (`flex:1 0 auto;min-width:44px`, die Zeile scrollt). Zusätzlich behält die Zeile nach einem Tipp ihre Stelle und holt das gewählte Genre ins Bild (`gen3GensKeep`; sonst sprang sie nach jedem Tipp an den Anfang). Test: alle 46 / 21 Tasten ≥ 44 px, jeder Touch-Tipp trifft (quer 926×428, 926×370, hochkant).
2. **↶ nimmt das Tempo nicht zurück (mittel)** – behoben. Das Tempo ist Teil desselben ↶-Schritts (neue Undo-Art `gen3bpm`, zwei Einhänge-Zeilen in `undoState`/`undoApply`, Gruppe über `undoMergeSince`). Gilt für Remix und A/B. Test: 120 → 86, ↶ 120, ↷ 86.
3. **Tempo ändert den ganzen Song auch bei Teil und Matrix (mittel)** – behoben. Teil: das Song-Tempo bleibt (Tempo je Teil gibt es nicht); Kachel („Tempo bleibt · ♩ 86“) und Tipp sagen es, ♩ übernimmt es auf Wunsch für den ganzen Song. Matrix: der Remix setzt kein Tempo mehr; ▶ Hören/B = Tempo der Version, A = Tempo vorher, ✕ und ↶ (Toast) = zurück auf das Tempo vorher; ♩ oder ein eigenes Tempo bleibt. „Der Song bleibt unberührt“ stimmt jetzt auch fürs Tempo.
4. **Hilfe „Stil-Grundmuster“ ins Leere (mittel)** – behoben. „Clip-Blatt › Werkzeugkasten ▾ › Grundmuster“, der Sprung öffnet den Reiter Grundmuster (Rahmen um den Reiter); Anleitung „Groove bauen“ angepasst; Remix-Eintrag nennt die Stilzahl aus der Liste (44) und Tempo-Version/Matrix. Alter UI1-Test: „grund“ und groove:2 wieder grün.
5. **Genre-Listen nicht überall gleich (niedrig)** – behoben. [Genre] in ◆ ÜBERGÄNGE kommt aus derselben Quelle wie die Kacheln (`gen3FillGs`, 44 Genres, mit Disco klassisch und Eurodance). Samba-Fill ist jetzt ein Füller (`k: 'fill'`) → Drums-Füller 55. **Teilweise abgelehnt:** die zwei Crash-Kacheln (p-becken-stopp, fx-crash) liegen *auf* der Eins nach der Kante; ein Drums-Füller schreibt ans Clip-Ende – dort wäre ein Crash falsch. 55 von 57 ist gewollt.
6. **Halftime-Shuffle-Figur gerade (niedrig)** – behoben. Werkzeugkasten-Figuren eines Triolen-Stils laufen über dieselbe Zeitkurve wie `gr2T` (`gen3Trip`, Einhänge-Zeile in `bb1Notes`): 0 / 0,667 / 1 / 1,667 …
7. **Bossa-Clave doppelt so schnell (niedrig)** – behoben. Rim und Begleit-Raster als Zwei-Takt-Clave im Achtel-Raster: Takt 1 auf 1, 2+, 4 (0 / 1,5 / 3), Takt 2 auf 2, 3+ (5 / 6,5). Die Figur „Bossa-Gitarre“ folgt demselben Rhythmus.
8. **Ziel-Zeile fehlt im Remix- und Harmonie-Blatt (niedrig)** – nicht gebaut, Funk-Frage. Remix: der Bereich ist dort das Ziel (Ganzer Song/Teil = neue Versionen, Matrix = neue Szene); „Diesen Clip“ würde das Original überschreiben, das A/B braucht. Harmonie › Glätten schreibt ein Grundmuster *samt Akkord-Zeile* in eine freie Szene – in „Diesen Clip“ oder als Version klänge es ohne diese Zeile anders; Gegenstimme hat als Ziel eine andere Spur. Das ist eine sichtbare Bedienungsänderung in HM1 → erst Vorschlag an Xander (Regel 3).
9. **Langsam: keine zusätzlichen Begleitfiguren (niedrig)** – nicht gebaut, Funk-Vorschlag. Xanders Wunsch (7) sagt „auf SEINEN Noten“ (Fülle durch feinere Hats, Ghosts, Füller, längere Flächen, Hall, Release – alles da). Ein neues Instrument auf einer leeren Spur ist fremdes Material und eine sichtbare Änderung (welche Spur, welcher Klang) → Vorschlag: „Langsam ab 80 %: auf einer freien Synth-Spur eine Werkzeugkasten-Figur des Song-Stils als Version dazu?“
10. **Quell-Szene im Matrix-Blatt nicht wählbar (niedrig)** – behoben (automatisch). Ist die gewählte Szene leer, nimmt das Blatt die erste Szene mit eigenen Clips (keine Remix-Szene); Kopf zeigt „Szene 1 → Szene 3“, ▶ Hören erzeugt die Szene. Eine eigene Auswahl im Blatt: offen.
11. **Wenige Figuren für die neuen Stile (niedrig)** – teilweise. 14 Begleitfiguren dazu (Streicher-Stöße Disco, Retro-Arp, Gitarren-Arpeggio, Synth-Stöße Freestyle, Fläche Soundtrack-Sequenz, Roboter-Sequenz, Bläser-Ruf Boom Bap, Glocken-Ostinato Trap, Dunkle Antwort, Schwebende Fläche D&B, Digi-Stöße 3-3-2, Dembow-Akkorde, Bläser-Riff Afrobeat, Cavaquinho-Akkorde). **Abgelehnt** für Bass: den Bass jedes der 44 Stile gibt es schon im Reiter Grundmuster (auf den Grundtönen des Clips) – eigene Bass-Figuren je Stil wären eine doppelte Funktion.

Ohne Befund laut Prüfer: Pflichtprüfungen, altes Basis-Projekt, Ladezeit, MX2 – unverändert.
