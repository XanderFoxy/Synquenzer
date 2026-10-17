# SYNQUENZER v3 — Song/FANG-Delta R7 (Nachtrag-Entwurf „N7S“)

Stand 17.10.2026 · Runde 7 · Auftrag: Xanders Priorität 2 (FANG TEIL / Song-Ablauf) und Priorität 4 (Akkord-Zeile und Audio quantisierbar) Punkt für Punkt mit Spec v3, Nachtrag 1 und dem App-Stand V0a abgleichen und die Spec auf Xanders Wortlaut bringen.

**Status:** Entwurf, verbindlich formuliert. Sobald der Orchestrator ihn übernimmt, gilt er für die hier genannten Stellen **vor** `dirigent-spec-v3.md` und `dirigent-spec-v3-nachtrag-1.md`. Was hier nicht steht, gilt unverändert.

**Grundlage**
- Xander: `fragen-xander-7.md` (F, S1–S8, A, P2, P4), `fragen-xander-8.md` (S9 = Präzisierung zu S1–S4), `fragen-xander-5.md` (H3, H4), `fragen-xander-6.md` (I2).
- Spec v3: §0.2, §0.5, §0.6 (E3-07, E3-08, E3-11, E3-31, E3-33, E3-35, E3-36), §2.3 (V0c S-01…S-04), §4.1–§4.11, §5.2, §13, §14, §16, §17 (V0c, V2c, V2c′, V2d, V2d′, V2e, V2f, V3a), §18.
- Nachtrag 1: A.3 (N0c, TA9, EN-06), A.6 (N2b, N2d, N2e), C.1–C.4, EN-07, EN-15.
- App-Stand **V0a** (`synq-snapshots/V0a.html`, 3.1.0): Code gelesen; Geometrie **gemessen** mit `r7/song-geo/geo.mjs` → `r7/song-geo/geo.out` (Chromium, Xeon-VM, nie iPhone; Bilder `r7/song-geo/P1-song.png`, `P1-clips.png`, `P1-roll.png`, `L1-song.png`, `L1-clips.png` u. a.). Taktstrich-Regel **gerechnet** mit `r7/song-geo/fang-ende.mjs` → `fang-ende.out`, Vergleich mit der heutigen Spec-Regel `r7/song-geo/fang-ende-spec.mjs` → `fang-ende-spec.out`.
- Recherche: Direkter Abruf war für fast alle Hersteller-Seiten gesperrt (www.ableton.com, support.apple.com, steinberg.help, bitwig.com, image-line.com, loopypro.com: „CONNECT 403“ bzw. „ENOTFOUND“). Erreichbar war nur developer.apple.com (direkt gelesen). Alles andere stammt aus Suchauszügen. Bewertung je Aussage in Teil 15.

**Kennzeichen** wie in der Spec: gemessen, gerechnet, eK (eigene Kenntnis, ungeprüft), (SE) = nur Suchauszug, *(P1)* = optional im Paket.
**IDs:** Entscheidungen `EN7-NN`, Regeln `N7-R…`, Abnahme `N7S-NN`. Ein N7S-Punkt gilt **zusätzlich** zur Checkliste des genannten Pakets bzw. ersetzt die in Teil 14.3 genannten Punkte.
**Trennung:** Was eine Quelle sagt, steht nur in Teil 15 und in den markierten „Vorbild“-Sätzen. Alles andere ist **eigener Entwurf**.

---

## 0 Kurzfassung

1. **FANG TEIL fängt je Takt alles ein:** Träger (auch ORIGINAL), welcher Clip aus welcher Szene läuft, Clip aus und wieder an mitten im Teil, die Phase laufender Clips. Die Spec kennt je Spur nur **einen** Zustand pro Teil.
2. **Schließen am letzten logischen Taktstrich (N7-R1):** Zuerst entscheidet die Phrasenlänge (Periode, sonst 1/2/4/8/16 Takte). Nur bei Gleichstand entscheidet die Zeit: weniger als 50 % des neuen Takts gespielt → Ende am vorigen Taktstrich. Die Spec schließt am laufenden Takt, ein später Tipp nimmt den angefangenen Takt also mit (gerechnet, `fang-ende-spec.out`):
   - nach zwei Durchgängen wird der Teil verdreht („F C G Am“ statt „Am F C G“);
   - nach einem Durchgang wird er auf 8 Takte aufgefüllt;
   - selbst das Spec-eigene Beispiel wird bei 20 % Verspätung zu „G C C F“.
3. **Song = Zeitleiste zuerst (EN7-01):** Beim Ablegen löst sich der Teil in seine Clips auf. Im Song bleibt von ihm nur der **Name in der gelben Markierung der Taktleiste**. Die Spec-Kette mit TEIL-Zeile, ⊙, Stellen-Blöcken, „Spuren ▸“ und ABWEICHUNG entfällt. Ihre Funktionen (×n, verschieben, kopieren, ersetzen, löschen) wandern ins **Marken-Blatt**.
4. **Ziehen & Ablegen (N7-R3/R4):** Teil halten → die Song-Seite öffnet sich (sofort über dem Feld „SONG ⇄“ oben links, sonst nach 0,6 s ruhigem Halten) → am Taktstrich ablegen → liegt dort schon etwas: „Takte n–m ersetzen“ oder „Einfügen“ (der Rest rückt nach hinten).
5. **Aufnehmen im Song (N7-R8):** ab Takt n (Überschreiben/Einfügen) oder im gelben Bereich (Ersetzen/Overdub). Gespielte Noten landen in **eigenen Clips an dieser Stelle**, die Szenen bleiben unberührt. Clip im Song halten → eigener Clip (N7-R9).
6. **Akkord-Zeile:** antippen und ändern (wie V0c geplant). Neu: **Akkorde quantisieren** (Raster Takt, ½ Takt oder Schlag; der zuletzt gespielte gewinnt).
7. **Song-Ansicht ohne neue Zeile (EN7-02):** Umschalter ▦ Kästchen (bleibt Standard) │ ◧ Glas (wie der Clip-Launcher, mit Mini-Noten). Keine Teil-Leiste in der Hochformat-Song-Ansicht. Die V0c-Zielzeile wird ein Blatt.
8. **Audio quantisieren:** nur in der Safari-Version (VS4); Regeln stehen fest (Einsätze, Raster, Stärke, Scheiben mit 8-ms-Blenden).

**Aufwand:** ≈ +8–9 h; V2e wird in V2e und **V2e′** geteilt (Teil 14).

---

## 1 Ist-Stand V0a (gelesen, gemessen)

| Bereich | Heute in V0a (3.1.0) | Ort im Code / Beleg |
|---|---|---|
| Feld oben links | Ecke des Clip-Rasters **„SONG ⇄“**; Tipp öffnet die Song-Ansicht. P1: 95×44 px bei x 8, y 56; L1: 142×44 px bei x 6, y 47 (gemessen) | `buildGrid` Z. 11037/11039; `onTap(EL.grid, …, '.corner')` Z. 17569 |
| Song-Ansicht P1 | ersetzt die Rasterfläche (390×382,8 px). Kopf 40 px: [CLIPS ⇄ 64][● SONG 73][▶ SONG 70][● MEL. 67][S4 ▾ 41][⟲ 40]. Etiketten-Spalte 64 px. Canvas 306×330,8 px: Lineal 20 px + 7 Zeilen à 44,4 px (5 Spuren, TRÄGER, MELOD.). 36 px je Takt → 8,5 Takte sichtbar (gemessen) | `buildSongView` Z. 11214, `svLayout` Z. 11257, `geo.out` |
| Song-Ansicht L1 | Transport als Spalte links (76 px), Etiketten 56 px, Canvas 392×207,4 px, Lineal 16 px, 7 Zeilen à 27,3 px, 10,9 Takte sichtbar. L2: Zeilen 25,9 px (gemessen) | `#songView.side`, `geo.out` |
| Spur-Zellen („kleine gleichmäßige Vierecke“) | je Takt ein Rechteck in Spurfarbe mit der Szenennummer; Starttakt 95 % deckend, Folgetakte 45 %; „–“ = gestoppt | `svDraw` Z. 11444–11455 |
| Lineal-Tipp | spielt ab diesem Takt (`songPlayStart(bar)`) | `svTap` Z. 11404 |
| Zellen-Tipp | Clip dieses Takts wechseln: – → 1 → 2 → … (nur Szenen mit Clip); Folgetakte bleiben | `songCycle` Z. 9988, `RecHelpers.cycleCell` Z. 4085 |
| TRÄGER-Zeile | Akkord-Chips an ihren Schlägen; Halten = löschen; Bearbeiten fehlt (kommt mit V0c S-03) | `svDraw` Z. 11457 ff. |
| Clip-Launcher „gläsern“ | belegte Zelle: durchscheinende Spurfarbe (`--t1a` = rgba(76,201,240,.22) usw.), Mini-Noten als SVG (≤ 160 Noten, Deckkraft 0,6, Spurfarbe), Länge „2T“, Fortschritt 2 px | CSS `.slot.filled` Z. 215, `.slot .mini` Z. 226; `miniSvg` Z. 11068 |
| PianoRoll-Taktleiste | Lineal 26 px; Taktnummer-Chip 24×20 px. Tipp auf eine Nummer wählt den Takt: Chip **amber #ffb22e** mit dunkler Zahl. Eine zweite Nummer ergibt einen Bereich, ein Tipp aufs Band hebt ihn auf. Das Band ist amber 35 % über dem Lineal und 7 % über den Noten; dazu der gelbe Knopf [Zuschneiden] | PianoRoll `draw` Z. 4344–4357, `rulerTap` Z. 4662 |
| FANG (Noten) | Phrase rückwärts bis 1 Takt Pause; Starttakt mit ¼-Schlag-Vorgriff; Länge 1/2/4/8/16; der Clip läuft phasengleich weiter; Träger je Note (K-07) | `RecHelpers.capturePhrase` Z. 4031, `capture` Z. 10886 |
| Ende einer Song-Aufnahme | Länge = Takt, in dem gedrückt wurde. Ein Druck bis ¼ Schlag nach einem Taktstrich zählt auf diesen (= 6,25 % eines Takts) | `songRecEnd` Z. 9820, Formel Z. 9831 |
| Song-Daten | `{bars, lanes[5]:[{bar, slot}], carrier:[{beat, target\|null}], melody, melodyTrack, loop}`; Slots −1…3; höchstens 999 Takte | `newSongRaw` Z. 8287, `normSong` Z. 8291 |
| „Kette aus Szenen …“ | Popover baut Lanes aus Szene × Takte | `openKette` Z. 11327, `songFromChain` Z. 10019 |
| FANG TEIL, Teile, Teil-Leiste, Marken, eigene Clips | **nicht vorhanden** | – |

---

## 2 Abgleich Punkt für Punkt

Urteil: **gleich** = in Spec/Nachtrag geplant wie Xander es will · **anders** = geplant, aber anders (Zitat) · **fehlt** = nirgends geplant.

| # | Xander (gekürzt) | Spec v3 / Nachtrag 1 (Zitat) | V0a heute | Urteil | → Nachtrag |
|---|---|---|---|---|---|
| P2 | Priorität 2: FANG TEIL / Song-Ablauf | C.1: Gruppe 3 „V2-1“ (V2a…V2c′), Gruppe 4 „V2-2“ (V2d, V2d′, V2e, V2f, V7a) nach V0 und V1 | – | **gleich** (Reihenfolge der Gruppen gegenüber Kodamo entscheidet der Orchestrator, `r7/kodamo-oberflaeche.md`) | Teil 14 |
| P4 | Priorität 4: Akkord-Zeile editierbar und quantisierbar, Audio quantisierbar | V0c S-03 „Tipp auf eine TRÄGER-Zelle … öffnet die Akkord-Auswahl“; Quantisieren nirgends; Audio §13 „später, nicht in diesem Bau“ | TRÄGER nur löschbar | editierbar **gleich**, quantisierbar **fehlt**, Audio **anders** (ohne Regeln) | N7-R10, N7-R11, N7-R14 |
| F1 | Transposition einfangen | §4.7 „CAPC: Träger-Log aller Commits mit Schlag (über `T.onCommit`)“; Teil-Akkorde = gespielte Akkorde | – | **gleich**; Lücke: ORIGINAL mitten im Teil hat kein Format (`ChordRow.tg` kennt kein `null`) | N7-R1, 12.1 |
| F2 | alle Clip-Zustände einfangen, Clips aus beliebigen Szenen, einzelne Clips zwischendurch aus und wieder an | §4.7 „`R.mem`: … je Takt {bar, slots:[…NT], part, rowSrc}“ (Gedächtnis je Takt: ja). Aber §4.4 „Ein Teil speichert je Spur: Clip aus Szene s, aus … oder bleibt“ und das Blatt „S1 S2 S3 DR (aus Szene 2)“: **ein** Zustand je Spur | – | **anders**: Aus/An mitten im Teil und die Phase laufender Clips gehen verloren | 4.1, `Part.lanes` (12.1) |
| F3 | Tipp schließt wie eine Quantisierung am **letzten logischen Taktende**, auch wenn man schon in den nächsten Takt gespielt hat | §4.7 „Phrase bestimmen … **Ende = laufender Takt**“; Regel 2 „Ein Wechsel bis ¼ Schlag vor einem Taktstrich zählt auf den Takt“ | FANG-Noten: ¼-Schlag-Vorgriff; Song-Aufnahme-Ende: ¼ Schlag Nachgriff | **anders**: Ein später Tipp nimmt den angefangenen Takt mit. Die Periode „vom Ende her“ verdreht dann den Teil, ohne Periode wird aufgefüllt (Beispiele 1, 4, 7 in 4.2) | N7-R1 |
| F4 | Danach als Song-Teil definieren (Strophe, Refrain …) | §4.7 „WELCHER TEIL? [Strophe✓][Refrain][Bridge][Intro][Outro][✎ Name]“, Vorschlag „Strophe → Refrain → Bridge → Intro → Outro → Teil n“ | – | **gleich**; offen: Nummern, Kurzform, Anzeige in der Taktleiste | N7-R2 |
| S1 | Song-Teil per Drag & Drop auf das Feld links oben „Song-Modus“ → Song-Modus öffnet sich → am Taktstrich ablegen | §4.7 Blatt „WOHIN IM SONG? ⊙[Intro]⊙[Strophe ×2]⊙ … Ende✓“; §4.9 „⊙ antippen → Liste aller Teile → einfügen ×1“. Kein Ziehen | Feld „SONG ⇄“ vorhanden (nur Tipp) | **fehlt** | N7-R3, N7-R4 |
| S9a | fertigen Teil gedrückt halten → Song-Seite öffnet sich **automatisch** → auf einen Taktstrich ziehen | §4.4 „Halten (450 ms …) öffnet das Teil-Blatt“ | – | **fehlt** (Halten ist anders belegt) | N7-R3 |
| S2 | am Taktstrich löst sich der Teil in seine Clip-Bestandteile aus den Szenen auf, so wie sie aufgenommen, zu- oder ausgeschaltet wurden | §4.9 „Abflachen (Wiedergabe): `flattenChain(S.chain)` erzeugt die WP6-Struktur“ – nur intern; sichtbar sind Blöcke („TEIL [Intro ][Strophe ×2 ]…“) und „Spuren ▸ … abgeleitet aus der Kette“; Bearbeitung nur als ABWEICHUNG | – | **anders** | EN7-01, N7-R6 |
| S3 | liegt rechts/links schon etwas (Ablegen bei Takt 3): „Takt 3–4 komplett ersetzen“ oder „dazwischen einfügen“ (alles ab Takt 3 rutscht nach hinten) | §4.7 „Eine Lücke mitten in der Kette fügt ein; spätere Stellen samt Melodie rücken nach (TA5)“ – nur an Stellengrenzen; §4.9 Stellen-Blatt „[Ersetzen durch …]“ ersetzt eine ganze Stelle; „Takte n–m ersetzen“ mitten in einem Teil gibt es nicht | – | **anders/teilweise fehlt** | N7-R4, N7-R5 |
| S4 | keine neuen Leisten; der eingefügte Bereich ist in der Taktleiste gelb wie die PianoRoll-Auswahl, mit dem **Namen statt der Taktnummern**; davor, dahinter, dazwischen bleiben die Nummern | §4.9 Song-Ansicht: Zeile **TEIL 44 px**, AKK. 40, MEL. 48, „Spuren ▸“ 28, Zeile „Aufnahme …“ 32, darunter die Teil-Leiste 40 px; V0c S-01 „unter dem Transport eine Zeile Aufnahme (32 px P, 28 px L)“ | Lineal grau mit Nummern; gelbe Chips nur in der PianoRoll | **widerspricht** | EN7-02, N7-R7, N7-R13 |
| S9b | im Song-Modus wird **nichts Neues** gebaut: kein Teil-Block, keine Überschrift, keine Zeile; einzige Kennzeichnung ist der Name in der gelben Markierung, ohne Layout-Verschiebung | wie S4 | – | **widerspricht** | wie S4 |
| S5a | in Takt 3 tippen, ab dort aufnehmen (Bounce/Punch) → Rückfrage: ab Takt 3 **überschreiben** oder **dazwischen aufnehmen** (Rest rutscht nach hinten) | V0c S-01 „● startet ▶ SONG ab Takt 1 (oder ab dem gewählten Lineal-Takt) und nimmt dabei auf“, „nur die gewählten Ziele im aufgenommenen Bereich“ | Lineal-Tipp spielt sofort ab; ● SONG ersetzt den ganzen Song | Überschreiben **gleich** (nicht zerstörend), Einfügen **fehlt**, Rückfrage **fehlt** | N7-R8 |
| S5b | Bereich markieren (gelb wie PianoRoll) → im Bereich Clips **ersetzen** oder **Overdub** | V0c S-02 „Bereich“ nur für SCHLEIFE (grünes Band); §4.8 „MELODIE: … Overdub“ | – | **fehlt** | N7-R7, N7-R8 |
| S6a | Akkord-Zeile unter allen Clips bearbeitbar: hineintippen, anderen Akkord eintippen/eintragen | V0c S-03 (Akkord-Auswahl mit Text ⌨, Tipp auf Chip mit [Löschen]); V2e „AKK.-Zeile … Tipp öffnet die Akkord-Auswahl für den **Teil** dieser Stelle (TA3: wirkt an allen Stellen)“ | nur Löschen | V0c **gleich**; V2e **anders** (wirkt auf alle Stellen) | N7-R10 |
| S6b | Akkorde quantisierbar, wenn nicht auf Takt/Tempo aufgenommen | nur FANG TEIL Regel 2 (¼ Schlag) | – | **fehlt** | N7-R11 |
| S7a | Umschaltung: kleine Vierecke (bleiben, „süß“) ↔ Clips wie im Clip-Launcher, „gläsern“, mit sichtbaren Noten | – | Vierecke vorhanden; Glas nur im Launcher | **fehlt** | N7-R12 |
| S7b | Clip halten → aus der Schatten-/Referenz-Kopie wird an dieser Stelle ein echter, einzeln editierbarer Clip | ABWEICHUNG nur für Slots/Akkorde (`alt.slots`, `alt.chords`); §18 „Clip-Ebenen (FANG ⤓, 👁)“ nicht in v3 | – | **fehlt** | N7-R9 |
| S8 | live im Song einspielen und Noten an dieser Stelle verändern, **ohne die Szenen anzutasten** | §4.8 MELODIE-Ziel schreibt die Song-Melodie (neben den Clips); E3-11 „Aufnahmen sind nie zerstörend“ | ● MEL. = Song-Melodie | **anders** (Melodie ja, Clip-Noten an einer Stelle nein) | N7-R8, N7-R9 |
| A | Audioaufnahmen quantisierbar | §13 „VS4 Audio bearbeiten“ ohne Regeln; Nachtrag EN-15 „nur in der eigenständigen Safari-Version“ | kein Mikrofon | **anders** (später, ohne Regeln) | N7-R14 |
| – | (aus F) FANG soll das zusätzlich können | E3-08: „♪ SPIELEN → FANG …; ⇅ TRANSPONIEREN → FANG TEIL“ | nur FANG | **gleich**; Lücke: nur Clip-Wechsel ohne Transposition in ♪ SPIELEN | EN7-09 |

---

## 3 Neue Entscheidungen

| # | Entscheidung | Begründung |
|---|---|---|
| **EN7-01** | **Zeitleiste zuerst.** Der Song ist der WP6-Abspielplan `S.song` (Lanes je Spur und Takt, Träger, Melodie je Spur), erweitert um Teil-Marken (`song.marks`), eigene Clips (`song.own`), Phase (`ph`) und Neustart (`re`). Ein Teil (`S.parts`) ist eine **Vorlage**. Ablegen kopiert seine Struktur in die Zeitleiste; die Clips bleiben Verweise auf die Szenen-Clips. **`S.chain`, `ChainItem`, `alt` (ABWEICHUNG), `flattenChain` und `song.src:'chain'` entfallen** (ersetzt E3-07 in diesem Punkt, E3-31, E3-35, E3-36, TA3). | S2 („löst sich … auf“), S4/S9 (keine Blöcke, nur Name), S5–S8 (alles wirkt „an dieser Stelle“). Wiedergabe bleibt `songTick` (I-02) ohne Abflachen. WP6-Songs sind sofort bearbeitbar, [In Teile zerlegen] wird überflüssig. Was wegfällt: „Teil ändern = alle Stellen ändern sich“. Das wird die ausdrückliche Aktion [Auf alle übertragen] bzw. ⟳ beim FANG TEIL. V2d/V2e sind noch nicht gebaut, der Wechsel kostet also keinen Umbau. |
| **EN7-02** | **Die Song-Ansicht bekommt keine neue Zeile und keine Blöcke.** Zeilen: Taktleiste, je Spur eine Zeile, AKKORDE, MELODIE – sonst nichts. Keine TEIL-Zeile, kein ⊙, kein „Spuren ▸“, keine Zielzeile (V0c), **keine Teil-Leiste in der Hochformat-Song-Ansicht**. Im Querformat bleibt die Teil-Leiste im Seitenfeld (ändert die Song-Fläche nicht). Reichen 26 px je Zeile nicht, blättert die Spurbank. | S4, S9b. Gerechnet aus V0a-Maßen: Mit Zielzeile (28 px) fielen die L1-Zeilen auf (207,4 − 28 − 3 − 16)/7 = 22,9 px und verfehlten V0c-11 („Zeilen ≥ 26 px“). |
| **EN7-03** | **Taktstrich-Regel N7-R1:** erst die Struktur (Periode bzw. 1/2/4/8/16 Takte), dann die Zeit (Schwelle 50 % des angefangenen Takts). | F3. Die Struktur unterscheidet „zu spät“ von „zu früh“ auch bei 80 % (gerechnet, 4.2). |
| **EN7-04** | **Szenen bleiben unberührt.** Keine Song-Bearbeitung (Ablegen, Marken-Aktionen, Aufnahme, Noten im Song) ändert `S.tracks[].clips`. Noten an einer Song-Stelle entstehen als **eigener Clip** (Kopie beim ersten Schreiben). | S8; Xanders „Schatten-/Referenz-Kopie“ (S7b). |
| **EN7-05** | **Farben:** Gelb (`--amber` #ffb22e) = Auswahl **und** Teil-Marke (wie die PianoRoll); Grün = Schleife und Abspielposition; Weiß (`--sel`) = Positionsmarke und gewählte Marke; Rot = Aufnahme. | S4 „gelb … wie in der PianoRoll“; die Schleife war in V0c ein grünes Vollband und würde sich mit Gelb mischen. |
| **EN7-06** | **Ablegen fragt nur, wenn ab der Ablagestelle Inhalt liegt.** „Ersetzen“ ersetzt **komplett** (Clips, Akkorde, Melodie, eigene Clips in diesen Takten). | S3 „komplett ersetzen“; L7 über Undo. |
| **EN7-07** | **Clip halten im Song = eigener Clip** für den Durchlauf unter dem Finger. Ein Tipp bleibt wie in WP6 (Clip wechseln). | S7b; Tipp-Verhalten aus WP6 bleibt erhalten. |
| **EN7-08** | **Audio quantisieren nur in der Safari-Version (VS4)**, mit den Regeln N7-R14. | EN-15 (kein Mikrofon in der Claude-App). |
| **EN7-09** | Der FANG-Platz heißt auch in ♪ SPIELEN **FANG TEIL**, wenn in den letzten 8 s keine Note gespielt wurde, seit dem letzten Grenzpunkt aber Clip- oder Szenenwechsel geschahen. Die Beschriftung wechselt sichtbar (E3-08: „Ort statt versteckter Zustand“ bleibt gewahrt). | F: Clips zwischendurch aus/an auch ohne Transposition einfangen. |

---

## 4 FANG TEIL v2 (V2d; Datenfeld `Part.lanes` ab V2d)

### 4.1 Was eingefangen wird (ergänzt §4.7 „Song-Gedächtnis“)

- `R.mem[k] = {bar, slots:[NT], cs:[NT] /*Clip-Startschlag*/, own:[NT], carrier, part, mute?:[NT]}` je Takt, Ringpuffer 64 Takte (Spec: ohne `cs`/`own`). Geschrieben in `tick()` an jedem Taktstrich, wie gehört (nach Start-Quantisierung).
- `CAPC` wie Spec, **auch ORIGINAL** (Eintrag mit `target:null`).
- Daraus wird der Teil über S…E gebaut (S = Phrasenanfang, E = Ende nach N7-R1):
  - **Lanes je Spur, relativ zum Teil-Anfang:** Takt 0 = Zustand bei S mit Phase `ph = ((S − cs) mod (Clip-Länge·4))` Schläge. Danach je Takt, in dem sich `slot` oder `cs` ändert, ein Eintrag `{bar, slot, re:1 bei Neustart desselben Slots}`. „Aus“ = `slot:-1`.
  - **Akkorde:** `ChordRow {len: L, ch:[{b, tg}]}` aus CAPC zwischen S und E. Der Träger bei S kommt als Eintrag bei `b = 0` hinzu, `tg:null` = ORIGINAL.
  - Szenen, aus denen die Clips kommen: beliebig je Spur und Takt (Xanders Beispiel: Drums Sz1, Fläche Sz2, Sequenz Sz3, Bass Sz4).
  - *(P1)* **Stumm (M):** Ein M-Wechsel im Fenster wird auf den **nächstgelegenen** Taktstrich gerundet als `mute`-Eintrag gespeichert und im Song am Taktstrich angewandt (eigene Stumm-Schicht `R.songMute`, `tr.mute` bleibt unberührt). Ohne P1 zeigt das Blatt den Hinweis „Stummschalten (M) wird nicht eingefangen – Clip antippen = aus/an am Taktstrich“.
- Nicht eingefangen: Harmonie-Modus (global), Tempo, Klangänderungen (später V6b „Teil-Klang“).

### 4.2 Taktstrich-Regel N7-R1 (ersetzt in §4.7 „Ende = laufender Takt“)

Gilt für **FANG TEIL** (V2d) und für das **Ende jeder offenen Song-Aufnahme** (● SONG ohne Bereich, V2d′, 7.4).

Eingaben: `t` = hörbarer Schlag beim **Aufsetzen** des Fingers (wie `nextBarFromAudible(atT)`, Ausgangslatenz abgezogen). `S` = Phrasenanfang (Grenzpunkt nach §4.7 Regel 1, bei Aufnahmen der Aufnahmestart). Ein Takt = 4 Schläge.

1. `k = ⌊t/4⌋`, `f = t/4 − k` = Anteil des angefangenen Takts (0 … < 1).
   Kandidaten: **E0** = Taktstrich vor dem Tipp (`4k`), **E1** = nächster Taktstrich (`4k+4`).
   Längen `n0 = (E0 − S)/4` und `n1 = n0 + 1`.
2. `n0 = 0` → E1 (mindestens ein Takt).
3. Periode `p` aus den vollen Takten S…E0, „vom Ende her“ wie §4.7 Regel 3, mit **p ∈ {1, 2, 3, 4, 6, 8}** (Spec: {1, 2, 4, 8}).
   **Logisch** heißt: Mit Periode ist n ein Vielfaches von p. Ohne Periode ist n ∈ {1, 2, 4, 8, 16}.
4. **Genau ein Kandidat ist logisch → dieser**, egal wie weit der Takt gelaufen ist (Struktur vor Zeit).
5. **Beide oder keiner logisch → Zeit:** `f < 0,50` → E0, sonst E1.
6. **Wird E1 gewählt,** gehört der angefangene Takt zum Teil, mit dem Zustand **im Moment des Tipps** (Clips, Träger). Was danach in diesem Takt passiert, gehört nicht dazu. **Bei E0** gehört der angefangene Takt nicht zum Teil.
7. Der Teil gilt als **ab E geschlossen** und läuft phasengleich weiter, als hätte man genau bei E gedrückt. Übernahme am nächsten Taktstrich (E1) mit Teil-Takt `((E1 − E)/4 mod L) + 1`. Nach einem späten Tipp kommt dort also Teil-Takt 2 (kein doppelter erster Takt).
8. **Vorschlag der Länge** (ersetzt §4.7 Regel 3, letzter Satz): mit Periode die letzten p Takte bis E (wie Spec). Ohne Periode die Phrase S…E **unverändert**, höchstens die letzten 16 Takte, **ohne Auffüllen** (Spec: „auf 1/2/4/8/16 Takte aufgerundet (fehlende Takte halten den letzten Akkord)“).
9. **Anzeige** im Blatt, eine Zeile: „Ende Taktstrich 9 · 30 % in Takt 9 gedrückt (zu spät, zählt)“ bzw. „… 85 % in Takt 4 (zu früh, zählt)“.

**Gerechnete Beispiele** (120 BPM, 1 Takt = 2,0 s; Schlüssel je Takt = Akkord, bei Nr. 8 Akkord + Slots; N7-R1: `fang-ende.out`, Spec: `fang-ende-spec.out`, * = aufgefüllter Takt):

| Nr. | Gespielt (ab S) | Tipp | Ergebnis N7-R1 | Spec v3 heute (Ende = laufender Takt) |
|---|---|---|---|---|
| 1 | Am F C G, dann wieder Am | T5 + 0,60 s (30 %) | Taktstrich 5 (Struktur: 4 logisch, 5 nicht) → **Am F C G** | 5 → 8 aufgefüllt: Am F C G Am Am* Am* Am* |
| 2 | wie 1 | T5 + 1,60 s (80 %) | Taktstrich 5 (Struktur) → Am F C G | wie 1 |
| 3 | Am F C G | T4 + 1,70 s (85 %, zu früh) | Taktstrich 5 (Struktur: 3 nicht, 4 logisch) → Am F C G, T4 = Zustand beim Tipp | Am F C G |
| 3b | Am F C G | T4 + 0,20 s (10 %) | Taktstrich 5 (Struktur) → Am F C G | Am F C G |
| 4 | Am F C G ×2, dann Am | T9 + 0,60 s (30 %) | Taktstrich 9, Periode 4 → Vorschlag 4 Takte **Am F C G** | Periode 4 über T6–9 → **F C G Am** (verdreht) |
| 5 | 7 gleiche Takte Am | T7 + 0,80 s (40 %) | Zeit (beide logisch, p = 1) → Taktstrich 7, 1 Takt | 1 Takt |
| 5b | wie 5 | T7 + 1,20 s (60 %) | Zeit → Taktstrich 8, 1 Takt (nur die Phase ändert sich) | 1 Takt |
| 6 | Am F Dm G E Am7, dann C | T7 + 0,80 s (40 %) | Zeit (keiner logisch) → Taktstrich 7 → **6 Takte, kein Auffüllen** | 7 → 8: … Am7 C C* |
| 6b | wie 6 | T7 + 1,20 s (60 %) | Zeit → Taktstrich 8 → 7 Takte (T7 = Zustand beim Tipp) | wie 6 |
| 7 | Spec-Beispiel §4.7 Nr. 4: Am F C G ×2, F G C C ×2, dann F | T17 + 0,40 s (20 %) | Taktstrich 17, Periode 4 → **F G C C** | Periode 4 → **G C C F** (verdreht) |
| 8 | Xanders Fall: DR Sz1, FL Sz2, SEQ Sz3 ab T3, BASS Sz4 aus in T5–6; Am F C G ×2 | T9 + 0,15 s (7 %) | Taktstrich 9 (8 logisch; keine Periode, weil der Bass abweicht) → 8 Takte mit allen Wechseln | 9 → 16 aufgefüllt (7 Takte*); Bass-Wechsel ohnehin verloren (ein Zustand je Spur) |
| 9 | Am F C ×2, dann Am | T7 + 0,60 s (30 %) | Taktstrich 7, Periode 3 → **Am F C** | 7 → 8: Am F C Am F C Am Am* |

**Deutung von Xanders Satz.** „Ist der neue Takt prozentual noch nicht weit gelaufen (kein voller Viertakter begonnen)“ lese ich als: Ist im neuen Takt noch nicht viel passiert und hat noch keine neue Vier-Takt-Phrase begonnen, endete der Teil am vorigen Taktstrich. Genau das machen Schritt 4 (Phrase) und Schritt 5 (Takthälfte). Ob „Viertakter“ ein „Viertel“ meint (Schwelle 25 %), ist offen (Frage 1 in Teil 16). Mit 25 % ändern sich nur die Gleichstand-Fälle 5/5b und 6/6b.

**Vorbild (Teil 15):** Loopy Pro beendet eine Aufnahme ohne Auto-Count-Out am **nächsten** Vielfachen. Eine Nutzer-Anfrage wünscht „Backward Trimming to Nearest Cycle Point“. Ein Rückwärts-Fenster wie N7-R1 habe ich als Standard nirgends gefunden.

### 4.3 Grenzpunkte (präzisiert §4.7 Regel 1)

- Unverändert: ≥ 2 Takte ohne Wechsel, ▶n, Tipp auf eine Teil-Taste, ORIGINAL, [↩ …], angenommener FANG TEIL.
- „Wechsel“ umfasst jetzt auch Clip-Start, Clip-Stopp und Neustart einzelner Spuren (F2).
- Der Anfang lässt sich in der Mini-Zeitleiste über einen Grenzpunkt hinaus zurücksetzen (innerhalb der letzten 16 Takte). Die Länge ergibt sich dann **exakt** (keine Rundung auf 1/2/4/8/16).

### 4.4 Teil-Name N7-R2

- **Vorschlag:** der nächste freie Name in der Folge Strophe → Refrain → Bridge → Intro → Outro → Teil n (wie §4.7).
- **Chips** (eine wischbare Zeile, 36 px): Intro · Strophe · Pre · Refrain · Bridge · Break · Outro · ✎.
- **Name schon vorhanden:** Der Chip bietet zwei Wahlen: **[＋ Strophe 2]** (Standard, neuer Teil) und **[⟳ Strophe ersetzen]**. Ersetzen tauscht die Vorlage und **alle Marken dieses Teils** (Aktion „Auf alle übertragen“, 6.3). Der Toast nennt die Zahl der Stellen.
- **Nummern:** Der zweite Teil gleichen Typs heißt „Strophe 2“, dann „Strophe 3“. Der erste bleibt „Strophe“.
- **Freitext ✎:** 1–12 Zeichen. Erlaubt sind Buchstaben mit Umlauten, Ziffern, Leerzeichen, „-“ und „'“. Leerzeichen am Rand werden entfernt; leer → Vorschlag.
- **Kurzform** (automatisch): Intro INT · Strophe STR · Pre PRE · Refrain REF · Bridge BRI · Break BRK · Outro OUT · Teil n T n · Szene n SZn · Freitext = erste 3 Buchstaben groß. Die Nummer wird angehängt („STR2“).
- **Anzeige:**
  - Teil-Taste: GROSS, ≤ 8 Zeichen, sonst Kurzform + Nummer.
  - Taktleiste: die längste Form, die in `len·36 − 10` px passt: Name → Kurzform → Anfangsbuchstabe + Nummer → nur Farbe. Bei 36 px je Takt heißt das: 1 Takt = Kurzform, ab 2 Takten der Name.
- **Teil′:** Weicht der Inhalt einer Marke von ihrer Vorlage ab (Lanes, Akkorde), zeigt der Name „′“ („STROPHE′“). Das wird berechnet und nicht gespeichert.
- **Marke ohne eigenen Namen** zeigt den aktuellen Teil-Namen, Umbenennen wirkt also überall. „Nur diese Stelle umbenennen“ setzt `mark.name`.
- **Teil-Leiste voll (8):** [Als Teil ✓] fragt „Platz ersetzen ▾“. Ziehen in den Song geht immer: Ohne Platz wird die Marke `part:null` mit eigenem Namen.

### 4.5 Blatt „Teil gefangen“ (ersetzt das Blatt in §4.7; Mockup P-1)

- **Kopf:** „TEIL GEFANGEN · läuft ∞“ und der **Teil-Chip [⠿ STROPHE · 8 T]** (amber). Den Chip halten = ziehen (N7-R3).
- **Zeile Ende:** Anzeige nach N7-R1 Schritt 9.
- **Mini-Zeitleiste:** die letzten 16 Takte mit Akkord-Kürzel; der gewählte Bereich ist hell; ein Tipp verschiebt den Anfang (4.3). Neu: Wechselpunkte von Clips als 4-px-Punkte unter den Kästchen.
- **Zeile Clips** (neu): „DR Sz1 · FL Sz2 · SEQ Sz3 ab T3 · BASS Sz4, aus T5–6“ (gekürzt, ≤ 2 Zeilen).
- **Länge** [1][2][4][8][16] wie Spec.
- **Name:** Chips nach N7-R2.
- **Knöpfe:** [Verwerfen] · [＋ Ans Song-Ende] · **[ALS TEIL ✓]** (= Teil auf die Teil-Leiste, nicht in den Song). Darüber klein: „⇢ Teil-Chip halten und in den Song ziehen“.
- **Entfällt:** die Zeile „WOHIN IM SONG? ⊙ …“, [×1][×2][×4], [nur als Teil-Taste] (= jetzt [ALS TEIL ✓]).
- **Undo:** [ALS TEIL ✓] = `part`; [＋ Ans Song-Ende] und Ziehen aus dem Blatt = `group` [part, song].
- **Höhe** P ≤ 270 px (wie Spec). Im Querformat rechts als Seitenfeld-Blatt (x 545–844, y 44–390), damit das Clip-Raster links frei bleibt (Mockup L-2).

### 4.6 Teil-Wiedergabe mit Lanes

Teil-Tasten, FANG-TEIL-Kreis und Song spielen dieselben Lane-Einträge. `laneEventsIn(lanes, b0, b1, origin, len)` liefert Launches (mit `re`, `ph` → `cs = beat − ph`) und Träger-Abrufe (`T.recall(tg, b2t(beat), null)`, bzw. `T.reset` bei `tg:null`). Ein Teil läuft modulo `len` im Kreis. Spuren ohne Eintrag bei Takt 0 bleiben, wie sie laufen („bleibt“, TA4).

---

## 5 Teil in den Song: Ziehen, Ablegen, Auflösen

### 5.1 Ziehen – N7-R3 (S1, S9; Gesten V2e′, Daten V2d)

**Quellen:**
- (a) Teil-Taste auf der Teil-Leiste (P: Clip-Ansicht; L: Seitenfeld).
- (b) Teil-Chip im Blatt „Teil gefangen“.
- (c) Teil-Marke in der Song-Taktleiste (verschieben/kopieren, 6.2).
- *(P1)* (d) Szenen-Starter ▶n (Teil „Szene n“).

**Ablauf:**
1. **Halten 450 ms** (Bewegung ≤ 8 px) → **angehoben**: Haptik „pop“; Geist 24 px über dem Finger (durchscheinend amber mit Name, Länge und Mini-Spuren); die Quelle wird grau. Das Feld **SONG ⇄** oben links leuchtet amber und zeigt „↖ IN DEN SONG“.
2. **Loslassen ohne Bewegung** → (a) Teil-Blatt (Spec §4.4, wie Matrix-Clip V2a′), (b) nichts, (c) Marken-Blatt. Das ändert §4.4: Halten öffnet das Teil-Blatt erst beim Loslassen.
3. **Die Song-Seite öffnet sich**, sobald eines eintritt – was zuerst kommt:
   - **(S1)** der Finger berührt das Feld SONG ⇄ („Federtaste“, wie Apples *spring loading*), oder
   - **(S9)** 600 ms nach dem Anheben, solange der Finger hält (egal wo; der Geist zeigt dabei einen Fortschrittsring).
   Überblendung 150 ms; kein Element springt (L3).
4. **Schutz:** Nach dem Öffnen zählt ein Ablegen erst, wenn sich der Finger danach ≥ 12 px bewegt hat. Wer nur gehalten hat, landet sonst ungewollt auf der Zeile, die jetzt unter dem Finger liegt.
5. **Ablegen** über dem Song-Canvas (Taktleiste oder Spuren, Höhe egal) → Taktstrich n (5.2).
   **Ablegen anderswo** (Transport, Etiketten, Tastatur, Seitenfeld, Teil-Leiste in L) = **Abbruch**: Der Geist fliegt zurück (200 ms), die Daten bleiben unverändert, die Ansicht kehrt zur Ausgangsansicht zurück.
6. **Rand-Rollen:** Ist der Finger ≤ 24 px am linken oder rechten Canvas-Rand, rollt die Ansicht 2 Takte/s, nach 1 s 6 Takte/s. Nie vor Takt 1, nie weiter als Song-Ende + 4.
7. Ein zweiter Finger wird ignoriert (L4). Während des Ziehens startet nichts, keine Zelle ändert sich, FOLGEN hält (Grund „Finger“, EN-07).

**Vorbild (Teil 15):**
- Ableton Live: Session-Clips lassen sich mit Tab-Taste beim Ziehen ins Arrangement legen.
- Bitwig: Launcher-Clips lassen sich ins Arranger-Zeitlineal ziehen.
- Apple: Federtaste (spring loading) beim Ziehen über Schaltflächen.

### 5.2 Ablegen – N7-R4

- **Einfüge-Strich:** amber, 2 px, über Taktleiste und Spuren am **nächsten** Taktstrich `n = round(x/36)`. Haptik „tick“ bei jedem neuen n (höchstens 10/s).
- **Vorschau:** Über der Taktleiste erscheint die künftige Marke gestrichelt (Name, L Takte). In den Spuren erscheinen die künftigen Zellen mit 30 % Deckkraft. Der Geist „wächst“ auf die Länge, die er einnehmen wird.
- **n ≥ Song-Länge** → anhängen, ohne Rückfrage. Ein Ablegen hinter dem Ende rastet am Ende ein (keine Lücke).
- **n < Song-Länge** → Blatt (Mockup P-4):
  - Kopf: „STROPHE (4 Takte) bei Takt 3“.
  - [Takte 3–6 ersetzen] mit Unterzeile „was dort ist, wird ersetzt – auch Melodie“.
  - [Einfügen] mit Unterzeile „ab Takt 3 rückt alles 4 Takte nach hinten“.
  - [Abbrechen].
  - Keine Wahl ist vorbelegt. Solange das Blatt offen ist, zeigt der Song die Vorschau der gewählten Wahl.
- **Wirksam** ab dem nächsten Taktstrich, auch bei laufendem Song (L8).
- **Undo:** ein Eintrag `song`; aus dem FANG-Blatt `group` [part, song].

### 5.3 Zeitleisten-Operationen – N7-R5 (Daten V2d; Oberfläche V2e)

Begriffe:
- **Zustand bei Takt x** = je Spur der Slot bzw. der eigene Clip und die Phase. Die Phase ergibt sich aus dem letzten Lane-Eintrag ≤ x: `ph + (x − bar)·4 mod (Clip-Länge·4)`.
- Dazu der Träger bei Schlag 4x und `xp` bei Schlag 4x.
- Melodie-Noten gehören zu dem Takt, in dem sie beginnen. Eine Note bis ¼ Schlag vor einer Grenze zählt nach TA5 als Auftakt zum Folgenden.

**EINFÜGEN(n, L, Inhalt)**
1. Nach rechts verschieben um L Takte: Lane-Einträge mit `bar ≥ n`, Träger und `xp` mit `beat ≥ 4n`, Melodie-Noten mit `t ≥ 4n − ¼`, Marken mit `a ≥ n`, eigene Clips (über ihre Einträge).
2. Eine Marke, die n überdeckt (`a < n < a+len`), wird geteilt: `[a, n)` und `[n+L, a+len+L)`. Beide behalten Teil und Namen.
3. **Fortsetzung:** Hat eine Spur bei `n+L` keinen Eintrag, bekommt sie `{bar:n+L, slot bzw. own: Zustand_alt(n), ph: Phase_alt(n)}`. Ebenso Träger und `xp`. So läuft der alte Inhalt nach dem eingefügten Teil **phasengleich** weiter.
4. Inhalt nach N7-R6 in `[n, n+L)` schreiben; `bars += L`.

**ERSETZEN(n, L, Inhalt)**
1. Zustand_alt(n+L) merken.
2. In `[n, n+L)` entfernen: Lane-Einträge, Träger, `xp`, Melodie-Noten aller Spuren mit `4n − ¼ ≤ t < 4(n+L) − ¼` sowie eigene Clips, deren Eintrag im Bereich liegt (sie bleiben im Undo).
3. Marken: Liegt eine ganz innen → weg. Überlappt eine → gekürzt (der Rest behält den Namen). Umschließt eine den Bereich → zwei Reste.
4. Inhalt schreiben (N7-R6). Fortsetzung bei `n+L` mit Zustand_alt(n+L).
5. `bars = max(bars, n+L)`.

**LÖSCHEN(a, b)** (Takte entfernen, der Rest rückt): Zustand_alt(b) merken; `[a, b)` wie Ersetzen-2/3 leeren; alles ab b um `b − a` nach links; Fortsetzung bei a mit Zustand_alt(b).

**Zusammengesetzt** (je ein Undo):
- VERSCHIEBEN = LÖSCHEN(Quelle) + EINFÜGEN(Ziel).
- KOPIE = EINFÜGEN mit Kopie inklusive Melodie und eigener Clips (neue IDs).
- ×n = n−1 Kopien direkt dahinter.
- ERSETZEN DURCH Teil Q = LÖSCHEN(Marke) + EINFÜGEN(a, Q). Die Länge darf sich ändern.
- LEEREN(a, b) = alle Spuren aus, kein Träger, keine Melodie, die Länge bleibt.

**Grenzen:** ≤ 5 ms für 64 Marken / 256 Takte (Xeon), sonst im Leerlauf; wirksam ab dem nächsten Taktstrich. **Nie** wird `S.tracks[].clips` geändert (EN7-04).

**Vorbild (Teil 15):**
- Logic Pro, Arrangement-Marker: Verschieben/Kopieren nimmt alle Regionen mit; zwischen zwei Markern abgelegt rückt der rechte nach rechts; Löschen schließt die Lücke.
- Studio One, Arranger: Abschnitte einfügen und ersetzen.
- Ableton Live: „Insert Silence“, „Delete Time“.

### 5.4 Auflösen – N7-R6 (S2)

Teil P (Länge L) bei Takt n:
- **Je Spur:** Für jeden Eintrag e in `P.lanes[t]` entsteht `{bar: n+e.bar, slot: e.slot, re:1 (nur bei slot ≥ 0), ph: e.ph (nur bei e.bar = 0)}`. Fehlt der Eintrag bei 0 („bleibt“), entsteht bei n nichts: Der vorige Zustand läuft samt Phase weiter.
- **Träger:** Die Akkord-Zeile (Länge `cl`) wird über L Takte wiederholt: `{beat: 4n + b + 4·m·cl, target: tg}`, nur `< 4(n+L)`. Ohne Akkord-Zeile entsteht `{beat:4n, target:null}` (ORIGINAL); mit `xp.tg` entsteht `{beat:4n, target: xp.tg}`.
- **`xp.semi`:** `{beat:4n, semi}`. Bei `4(n+L)` wird der Wert davor wiederhergestellt, falls er abweicht.
- **Marke:** `{id, a:n, len:L, part:P.id}`. Ab V6b gilt der Teil-Klang ◆ im Bereich der Marke.
- **Melodie:** Teile tragen keine Melodie (FANG TEIL fängt Träger und Clips, Noten fängt FANG).
- **„Entfalten wie von Zauberhand“ (S9):**
  - Der Geist schrumpft in 150 ms in die Marke.
  - Die Zellen erscheinen von links nach rechts (je Takt 15 ms Versatz, höchstens 300 ms) und färben sich von Amber in die Spurfarbe.
  - Haptik „snap“; kein Element verschiebt sich (M-ANSICHT).

### 5.5 Beispiel (Daten für N7S-19…21, dieselbe Lage wie die Mockups P-3…P-8)

Spuren: Synth 1 = Bass, Synth 2 = Fläche, Synth 3 = Sequenz, Synth 4 = Intro-Klang. Takte im Text 1-basiert (T3), in den Daten 0-basiert (`bar:2`).

**Ausgangs-Song** (7 Takte):

| Takte | Abschnitt | Inhalt | Akkorde |
|---|---|---|---|
| T1–2 | INTRO (Marke) | Synth 4 Sz4 | Am Am |
| T3 | Break, **ohne Marke** | nur Drums Sz2 | G |
| T4–7 | REFRAIN (Marke) | Bass Sz3 (2-Takt-Clip ab T4), Fläche Sz2, Sequenz Sz3, Drums Sz2 (Neustart) | F G Am Am |

**Teil STROPHE** (4 Takte, aus FANG TEIL, legt also jede Spur fest): Bass Sz1, Fläche Sz2, Drums Sz1 je ab Takt 0; Sequenz, Synth 4 und MELODIE aus; Akkorde Am F C G.

- **Einfügen bei Takt 3** → STROPHE T3–6, Break jetzt T7, REFRAIN T8–11; `bars` 7 → 11.
  - Bass: `{bar:2, slot:0, re:1}` (Strophe), dann die **Fortsetzung `{bar:6, slot:-1}`**: Im Break war der Bass aus; ohne diesen Eintrag liefe der Strophen-Bass durch den Break. Danach der verschobene REFRAIN-Eintrag `{bar:7, slot:2}`. Die Fläche bekommt ebenso `{bar:6, slot:-1}`.
  - Synth 4: `{bar:2, slot:-1}` aus dem Teil; der INTRO-Klang endet also bei T3 wie vorher.
  - Drums: `{bar:2, slot:0, re:1}`, danach der verschobene Break-Eintrag `{bar:6, slot:1}`. Eine Fortsetzung ist nicht nötig, weil bei T7 schon ein Eintrag liegt.
  - Träger: Am F C G bei Schlag 8/12/16/20, G bei 24, F G Am Am ab 28.
- **„Takte 3–6 ersetzen“** → STROPHE ersetzt den Break (T3) und REFRAIN T4–6; vom REFRAIN bleibt T7 (Marke, Länge 1); `bars` bleibt 7.
  - Fortsetzung bei T7: Bass `{bar:6, slot:2, ph:4}`, denn der 2-Takt-Clip ab T4 stand bei T7 in seinem zweiten Takt: (6 − 3)·4 mod 8 = 4.
  - Melodie-Noten mit 7,75 ≤ t < 23,75 entfallen.
- **Einfügen bei Takt 5** (mitten im REFRAIN):
  - REFRAIN wird geteilt in T4 (Länge 1) und T9–11 (Länge 3).
  - Bass-Fortsetzung `{bar:8, slot:2, ph:4}`: Der 2-Takt-Clip stand bei T5 in seinem zweiten Takt und läuft nach der Strophe genau dort weiter.

---

## 6 Taktleiste mit Teil-Marken (S4, S9b) – N7-R7

### 6.1 Zeichnung (P: Lineal 20 px; L: 16 px; 36 px je Takt)

- **Taktnummern** wie heute (grau #8b919c, 10 px, mittig) – **nicht innerhalb von Marken**. Davor, dahinter und dazwischen bleiben sie sichtbar.
- **Teil-Marke:**
  - Form: ein durchgehender Chip von `x(a)+2` bis `x(a+len)−2`, Höhe Lineal − 4 (P 16 px, L 12 px), Radius 4.
  - Farbe: Füllung **amber #ffb22e** (= `--amber`, derselbe Ton wie der PianoRoll-Chip); Text #111, fett, 10 px (L 9 px), linksbündig +6 px.
  - Bei ≥ 60 px Breite steht vor dem Namen ein 6-px-Punkt in der Teil-Farbe.
  - Zwischen zwei Marken 4 px Lücke; Teil′ zeigt „′“.
- **Bei Wiedergabe:** Die laufende Takt-Spalte ist wie heute grün 10 % getönt. In der laufenden Marke steht rechts „3/4“ (Takt in der Marke), wenn Platz ist.
- **Auswahl** (wie PianoRoll):
  - Jeder gewählte Takt ist ein eigener amber Chip (30 px × Lineal − 4) mit dunkler Zahl.
  - Dahinter liegt ein Band amber 35 % über die Lineal-Höhe; die Spuren darunter sind amber 7 % getönt.
- **Gewählte Marke:** weißer Rand 2 px (`--sel`), Spuren darunter amber 7 %.
- **Positionsmarke:** weißes ▼ 8×5 px oben am Taktstrich.
- **Schleifen-Bereich** (ändert V0c S-02): eine grüne Linie 3 px am oberen Lineal-Rand mit Griffen ┃ (Trefferzone 36×34 px) statt eines vollflächigen grünen Bands.
- **Die Lineal-Höhe ändert sich nie.** Keine neue Zeile, kein Element verschiebt sich um mehr als 2 px.

### 6.2 Gesten auf der Taktleiste

| Geste | Wirkung |
|---|---|
| Tipp auf eine Taktnummer | Positionsmarke dorthin **und** Auswahl = dieser Takt (gelb). **Läuft der Song, springt die Wiedergabe nicht** (Sprung über [▶ Ab hier], wirksam am nächsten Taktstrich). Ändert WP6 „Tipp = ab hier spielen“. |
| Tipp auf eine zweite Nummer bei bestehender Auswahl | Bereich (wie `rulerTap` der PianoRoll) |
| Tipp in die Auswahl | Auswahl weg; die Positionsmarke bleibt |
| Tipp auf eine Marke | Marke gewählt (ganzer Bereich) + Marken-Blatt |
| zweiter Tipp in eine gewählte Marke | Takt-Auswahl in der Marke. Solange sie besteht, zeigt die Marke Taktnummern; der Name rückt als Kurzform an den linken Rand |
| Halten 450 ms auf eine Marke | anheben (5.1, Quelle c). Ziehen = verschieben. Gleitet der Finger ≥ 250 ms über das Feld **⧉**, wird es eine Kopie. ⧉ erscheint während des Ziehens links in der Transportzeile anstelle von CLIPS ⇄ (64×40 px), wie die Ablage-Leiste in V2a′. Loslassen ohne Bewegung = Marken-Blatt |
| waagrechter Zug > 8 px | rollen (WP6), nie bearbeiten |

### 6.3 Bereich-Leiste und Marken-Blatt (ersetzen TEIL-Zeile, ⊙ und Stellen-Blatt aus §4.9)

**Bereich-Leiste** (bei Auswahl ohne Marke oder bei einer Takt-Auswahl in einer Marke):
- Ort: In P ersetzt sie die Träger-Leiste in **gleicher Höhe (56 px)**, wie die V3a-Aktionsleiste die Werkzeugleiste ersetzt. In L ersetzt sie die Träger-Anzeige im Seitenfeld. Sie verschwindet mit der Auswahl.
- Knöpfe: `[▶ Ab hier] [● Aufnehmen …] [Als Teil …] [⧉ Kopie →] [✕ Takte löschen] [⋯]`.
- Unter ⋯: [○ Leeren] [＋ Teil einsetzen ▾] [Akkorde quantisieren …] [Als Schleife].
- „Als Teil …“ = aus dem Bereich (≤ 16 Takte) wird eine Teil-Vorlage plus Marke; Namens-Chips nach N7-R2. Das ersetzt [In Teile zerlegen].

**Marken-Blatt** (Tipp auf eine Marke; Bottom-Sheet über der Tastatur, P ≈ 190 px, L ≈ 116 px):
- Kopf: Name · Takt a+1–a+len · Tonart (V2f) · [✕].
- Zeile 1: [▶ Ab hier] [×2] [×4] [◀] [▶] – ◀/▶ tauschen mit der Nachbar-Marke; ohne Nachbar grau.
- Zeile 2: [⧉ Kopie …] (danach Ablage-Taktstrich tippen) · [⇄ Ersetzen durch ▾] (alle Teile und Szenen) · [✕ Löschen] (Takte entfernen, der Rest rückt) · [Nur Name weg] (der Inhalt bleibt).
- Zeile 3: [✎ Name] (nur hier │ Teil überall, Standard „überall“) · [Farbe] · [Teil-Vorlage ›] (Teil-Blatt §4.4) · **[Auf alle 3 „Strophe“ übertragen]** (nur bei ≥ 2 Marken des Teils).
- [● Neu aufnehmen …] (Bereich = Marke, 7.3).

**„Auf alle übertragen“:**
- Diese Stelle wird die neue Vorlage (Lanes und Akkorde aus dem Bereich). Danach wird jede andere Marke des Teils mit ERSETZEN neu aufgelöst; ändert sich die Länge, rückt der Rest.
- Melodie und eigene Clips mit gleichem Slot bleiben an den Zielstellen.
- Ein Undo (`group` [part, song]).

### 6.4 Was aus §4.9 wird

| §4.9 (Spec) | Neu |
|---|---|
| Zeile TEIL mit Blöcken, ⊙ | entfällt; Name als Marke in der Taktleiste; Einfügen per Ziehen oder [＋ Teil einsetzen ▾] |
| Stellen-Blatt (×n, ◀▶, [Nur hier ändern], [Ersetzen durch …], [Teil bearbeiten ›], [Löschen]) | Marken-Blatt (6.3); [Nur hier ändern] entfällt, weil jede Bearbeitung lokal ist |
| AKK.-Zeile „wirkt an allen Stellen (TA3)“ | AKKORDE-Zeile wirkt an dieser Stelle; Toast [Für alle „Strophe“] (N7-R10) |
| MEL.-Zeile | bleibt (WP6 MELODIE); V2b-Chip [MEL: … ▾] im Etikett |
| Spuren ▸ (eingeklappt, `alt.slots`) | Spuren immer sichtbar (WP6), Spurbank bei < 26 px; Zellen-Tipp ändert direkt |
| SCHLEIFE ▾ [aus][Song][Teil][Bereich] | bleibt; „Teil“ = Marke unter der Abspielposition; „Bereich“ = gelbe Auswahl |
| Mitschnitt-Block + [In Teile zerlegen] | entfällt (WP6-Song ist schon Zeitleiste); *(P1)* [Teile erkennen] schlägt Marken für gleiche Abschnitte vor |
| Kette leer: Hinweis mit ⊙ | „Noch kein Song. FANG TEIL beim Spielen, dann den Teil in den Song ziehen – oder ● SONG.“ + [Kette aus Szenen …] (WP6) |
| Song-MIDI: Teilnamen als Marker | Marken als Marker (FF 06) |

### 6.5 Song-Ansicht-Layout – N7-R13 (V2e; EN7-02)

- **Zeilen:** Taktleiste, je Spur eine Zeile (Anzeige-Reihenfolge `S.ui.order`), AKKORDE, MELODIE – sonst nichts.
- **Zeilenhöhe** = (Canvas-Höhe − Lineal) / Zeilenzahl, mindestens **26 px**. Reicht das nicht, blättert die **Spurbank**: DRUMS, AKKORDE und MELODIE bleiben immer sichtbar, die Synth-Spuren blättern.
- **Gerechnet aus den V0a-Maßen** (`geo.out`):

  | Viewport | 6 Spuren (+ AKK + MEL) | 8 Spuren |
  |---|---|---|
  | P1 | 8 Zeilen à 38,9 px | 10 Zeilen à 31,1 px – kein Blättern |
  | P2 | 8 Zeilen à 28,1 px | Spurbank |
  | P3 | Spurbank: 7 Zeilen à 28,7 px | Spurbank |
  | L1 | Spurbank: 7 Zeilen à 27,3 px (wie V0a) | Spurbank |
  | L2 | Spurbank: 7 Zeilen à 25,9 px (wie V0a; Toleranz 0,5 px) | Spurbank |

  Spurbank-Seite 1 = Synth 1–4, DRUMS, AKK, MEL; Seite 2 = MELODIE, Synth 5/6, DRUMS, AKK, MEL.
- **Spurbank-Umschalter [▲▼]** 44×40 px: in P2 in der Transportzeile, in L und P3 in der Transport-Spalte. Er steht nur in Viewports, die ihn brauchen (fest je Viewport, kein Zustandswechsel). Läuft auf der verdeckten Seite ein Clip, zeigt er einen Punkt (wie die Matrix-Spurbank V2a).
- **Etikett antippen** = Spur wählen (die Tastatur spielt sie, das NOTEN-Ziel zeigt sie). Das MEL.-Etikett trägt den V2b-Chip [MEL: … ▾].
- **Transportzeile (V2e):**
  - P1: [CLIPS ⇄ 64][● ▾ 76][▶ SONG 76][⟲ Song ▾ 86][▦│◧ 44] = 362 px + 4 Lücken ≤ 374 px.
  - P2: [CLIPS ⇄ 56][● ▾ 64][▶ SONG 64][⟲ ▾ 56][▦│◧ 44][▲▼ 44] = 328 px + 5 × 3 ≤ 359 px.
  - L und P3 (Transport-Spalte, 4 Zeilen): [CLIPS ⇄] · [● ▾][▶] · [⟲ Song ▾] · [▦│◧][▲▼].
  - ● MEL. entfällt (Ziel NOTEN im Start-Blatt, V2d′); [S4 ▾] wandert ins MEL.-Etikett (V2b).
- **Teil-Leiste:** in P nur in der Clip-Ansicht, in L im Seitenfeld (beide Ansichten; ändert die Song-Fläche nicht).
- **Leerer Song:** „Noch kein Song. FANG TEIL beim Spielen, dann den Teil in den Song ziehen – oder ● SONG.“ + [Kette aus Szenen …].

---

## 7 Aufnehmen im Song (S5, S8) – N7-R8 (V0c Grundlage, V2d′ vollständig)

### 7.1 Start-Blatt statt Zielzeile (ändert V0c S-01; EN7-02)

- **Song leer:** ● startet sofort wie V0c (alle Ziele an).
- **Song vorhanden:** ● öffnet das **Start-Blatt** (Mockup P-8). Halten auf ● öffnet es jederzeit.
  - Kopf: „AUFNAHME AB TAKT 3“ bzw. „TAKTE 3–6“ (aus Positionsmarke bzw. Auswahl).
  - **Ziele:**
    - V0c: [CLIPS] [AKKORDE] [MELODIE].
    - ab V2d′: [CLIPS] [AKKORDE] [NOTEN · Synth 2].
    - Die Spec-Namen SZENEN/TEILE heißen jetzt **CLIPS** (Szenen- und Clip-Starts).
  - **Modus:** bei Einzeltakt [Überschreiben] [Einfügen]; bei Bereich [Ersetzen] [Overdub]. Liegt hinter der Startstelle nichts, fällt die Modus-Zeile weg. V0c kennt nur Überschreiben.
  - **Vorlauf** [1 Takt ✓ │ aus].
  - Zeile „überschreibt Akkorde ab Takt 3“ (V0c-Text).
  - [● Start].
- Das ● zeigt die Ziele wie V0c („● AKK+NOTEN“).
- Das **Banner** ist eine Überlagerung über der Taktleiste (rot, Lineal-Höhe): „● Takt 3 · Einfügen · AKK + NOTEN S2“; der aufgenommene Bereich ist rot 12 % getönt. In der Clip-Ansicht liegt es über der Teil-Leiste. Es verschiebt nichts.

### 7.2 Regeln je Ziel und Modus

| Ziel | Überschreiben ab n | Einfügen ab n | Bereich: Ersetzen | Bereich: Overdub |
|---|---|---|---|---|
| **CLIPS** | je Spur ab ihrem ersten Start/Stopp bis zum Ende ersetzt (V0c); Spuren ohne Ereignis spielen weiter | neuer Abschnitt; Spuren laufen mit dem Zustand von Takt n−1 weiter, bis du etwas änderst | wie Überschreiben, auf den Bereich begrenzt | wie Ersetzen (ein Clip-Start kann nicht „dazukommen“) |
| **AKKORDE** | Takte mit neuem Akkord ersetzt, je Takt gewinnt der jüngste Durchgang (V0c) | der letzte Akkord läuft weiter, bis du einen spielst | wie Überschreiben, begrenzt | wie Ersetzen |
| **NOTEN**, MELODIE-Spur | `song.mel`: je Takt mit neuen Noten werden die alten Noten dieses Takts ersetzt | Noten in den neuen Abschnitt | alle alten Noten der Spur im Bereich weg (während der Aufnahme stumm), neue rein | Noten kommen dazu |
| **NOTEN**, andere Spur | eigener Clip je berührtem Durchlauf (N7-R9); je Takt mit neuen Noten werden die alten ersetzt | eigene Clips im neuen Abschnitt | alle alten Noten der Spur im Bereich weg (in den eigenen Kopien; während der Aufnahme stumm), neue rein | Noten kommen dazu (eigene Kopien) |

- **Einfügen:** Ab Takt n läuft während der Aufnahme der Zustand von Takt n−1 weiter. Der alte Inhalt ab n folgt nach dem Ende E (EINFÜGEN um E − n, N7-R5) und ist ab dem nächsten Taktstrich phasengleich zu hören.
- **Überschreiben:** Der alte Inhalt spielt weiter, bis du auf einer Spur bzw. bei einem Ziel etwas tust. Nach dem Ende spielt der alte Inhalt ab E weiter (Bandmaschinen-Prinzip).
- **Szenen-Clips bleiben immer unberührt** (EN7-04). Teil-Tasten (Clip-Ansicht) während der Aufnahme schreiben ihre Lanes ab dem nächsten Taktstrich und setzen eine Marke (ersetzt V2d′-03).
- **Vorbild (Teil 15):**
  - Cubase: MIDI-Aufnahme „New Parts / Merge / Replace“.
  - Logic Pro: Autopunch mit „Replace“ (Regionen an den Punch-Punkten geschnitten, Daten dazwischen gelöscht).

### 7.3 Bereich (S5b)

- Bereich = gelbe Auswahl bzw. Marke ([● Neu aufnehmen …]).
- Vorlauf ab dem Takt vor dem Bereich. Eingestiegen wird am ersten Bereichstakt, ausgestiegen automatisch am Taktstrich nach dem letzten Bereichstakt. Danach läuft die Wiedergabe weiter, die Aufnahme ist aus.
- Mit SCHLEIFE Bereich: Jeder Durchgang ist Teil derselben Aufnahme. Bei Ersetzen gewinnt je Takt der jüngste Durchgang, Overdub sammelt.

### 7.4 Ende und Vorlauf

- **Ende** offener Modi: ● erneut oder ■. Die Länge ergibt sich nach **N7-R1** mit S = Aufnahmestart. Ab V2d′ gilt das für **jede** Song-Aufnahme und ersetzt das ¼-Schlag-Fenster in `songRecEnd` (Adaption der SG-Tests mit Verweis auf N7S-27).
- **Vorlauf** 1 Takt ab n−1. Bei n = 1 gibt es einen Einzähler wie bei der Clip-Aufnahme.
- **Undo:** eine Aufnahme = **ein** Eintrag `song` (Lanes, Träger, Melodie, eigene Clips, Marken), auch über mehrere Schleifen-Durchgänge.

---

## 8 Akkord-Zeile und Akkord-Quantisierung (S6)

### 8.1 Bearbeiten – N7-R10 (V0c; in Marken ab V2e)

- **Tipp auf einen vorhandenen Chip** → Akkord-Auswahl für **genau diesen** Eintrag; der Schlag bleibt (z. B. 6,5), mit [Löschen]. Ergänzt V0c S-03.
- **Tipp auf eine leere Stelle eines Takts** → neuer Eintrag am Taktanfang; vorhandene Einträge dieses Takts werden ersetzt (V0c S-03 unverändert).
- **„Eintippen“:** Text ⌨ (`parseChord`, V0c-09).
- **In einer Marke:** wirkt nur hier. Toast [Für alle „Strophe“] überträgt den Akkord an dieselbe relative Stelle aller Marken des Teils und in die Vorlage. Das ersetzt TA3 und E3-36.
- Das Etikett „TRÄGER“ heißt **„AKKORDE“** (Wortliste: Akkord-Zeile). Tipp auf das Etikett → [Akkorde quantisieren …] [Akkorde im Bereich löschen].

### 8.2 Quantisieren – N7-R11 (Song-Träger V0c; Akkord-Zeilen von Szene/Teil V2c)

- **Wo:** Etikett AKKORDE, Bereich-Leiste ⋯, Akkord-Auswahl unten rechts, Akkord-Zeilen-Blatt (V2c, Knopf [Quantisieren]).
- **Bereich:** gelbe Auswahl, sonst ganzer Song bzw. die ganze Zeile.
- **Raster** [Takt │ ½ Takt │ Schlag], Standard **Takt** (locker gespielte Wechsel liegen oft mehr als ½ Schlag daneben).
- **Regel:**
  1. Jeder Eintrag springt auf den nächsten Rasterpunkt. Bei Gleichstand gewinnt der spätere Punkt (wie N7-R1 Schritt 5: ab 50 % zählt der nächste).
  2. Landen mehrere Einträge auf demselben Punkt, gewinnt der **zuletzt gespielte** (die Korrektur gilt).
  3. Danach entfällt bei gleichen Akkorden hintereinander der spätere.
  4. ORIGINAL (`null`) zählt wie ein Akkord.
- **Vorschau** im Blatt: „6 Akkorde · 5 rücken · 1 fällt zusammen“; [Quantisieren] = ein Undo; Toast [Rückgängig].
- **Beispiel** (Raster Takt): Am 0 · F 3,8 · C 8,3 · G 11,6 · G 12,2 · Am 16,1 → Am 0 · F 4 · C 8 · G 12 · Am 16. 5 Einträge rücken, 1 fällt zusammen: G 12,2 landet wie G 11,6 auf 12, der später gespielte gewinnt, es bleibt ein G.
- *(P1)* Stärke 50 % (halber Weg), nur bei Raster Schlag.
- **Beim Aufnehmen:** AKKORDE nutzt den ¼-Schlag-Vorgriff wie FANG (§4.7 Regel 2); die Einstellung „Wechsel: am Takt/Schlag“ quantisiert wie heute schon beim Spielen.

---

## 9 Ansicht Kästchen/Glas und eigener Clip (S7)

### 9.1 Umschalter und Glas – N7-R12 (V2e′)

- **Umschalter [▦│◧]** 44×40 px rechts in der Transportzeile. In L und P3 sitzt er in der Transport-Spalte (Zeile 4). Zustand `S.ui.songView` (Ansicht, flüchtig, `HIST.volatile`); kein Undo, keine Datenänderung.
- **▦ Kästchen:** wie heute und **Standard**. Eigene Clips bekommen einen weißen Rand 1,5 px und einen Punkt oben rechts.
- **◧ Glas** (wie der Clip-Launcher):
  - je **Durchlauf** eine Kachel von `x(b)+2` bis `x(b+n)−1`, Höhe Zeile − 6, Radius 6;
  - Füllung Spurfarbe 22 % (`--tNa` wie `.slot.filled`), Rand 1 px weiß 5 %;
  - **Mini-Noten** wie `miniSvg` (Tonhöhe relativ, ≤ 160 je Kachel, Deckkraft 0,6, Spurfarbe);
  - Szenennummer 9 px oben links; laufende Kachel mit Fortschritt 2 px unten;
  - gestoppte Takte leer (kein „–“);
  - eigene Clips mit Rand 2 px in Spurfarbe und „eigen“ (8 px) oben links.
- **Gleiche Zeilenhöhe und Taktbreite** in beiden Ansichten (nichts springt).
- **Zeichnen:** nur sichtbare Kacheln; Notenbild je (Clip, Spur) zwischengespeichert, neu nur bei geänderter `clipSig`. PE1 bleibt ≥ 55 fps.

### 9.2 Eigener Clip – N7-R9 (Daten und Wiedergabe V2d′, Gesten V2e′)

- **Verweis** = Zelle, die einen Szenen-Clip spielt („Schatten-/Referenz-Kopie“). Ändert man den Szenen-Clip, ändern sich alle Verweise.
- **Eigener Clip** = Kopie, die nur an dieser Song-Stelle gilt: `song.own[id]`, Lane-Eintrag `{bar, slot (Herkunft), own:id, ph}`. Ändert man den Szenen-Clip, bleibt der eigene Clip.
- **Durchlauf** = ein Stück eines Blocks von einer Clip-Länge, ausgerichtet am Blockstart (mit `ph`).
- **Halten 450 ms auf eine Verweis-Zelle** (beide Ansichten) → der Durchlauf unter dem Finger wird ein eigener Clip (≤ 16 Takte). Haptik; Toast „Takt 5–6: eigener Clip (aus Szene 2)“ [Bearbeiten] [Ganzer Block] [Rückgängig]. [Ganzer Block] macht alle Durchläufe des Blocks zu einem eigenen Clip; längere Blöcke werden in 16-Takt-Stücke geteilt.
- **Tipp auf einen eigenen Clip** → ROLLE (Drums: SCHRITTE) auf diesem Clip. Kopf: „Synth 2 · Song Takt 5–6 · eigener Clip“. Jede Geste ist ein Undo `own`.
- **Halten auf einen eigenen Clip** → Blatt: [Bearbeiten] · [Zurück zum Szenen-Clip] (verwirft die Kopie, ein Undo) · *(P1)* [Als Szenen-Clip ablegen] (erster freier Slot) · [Ganzer Block].
- **Tipp auf eine Verweis-Zelle** bleibt WP6 (Clip wechseln).
- **Wiedergabe:** `R.own[t]`; `scheduleTrack` spielt `song.own[id]` statt `tracks[t].clips[slot]`. Tonart-Erkennung (V2f), MIDI-Export und FANG lesen den eigenen Clip.
- **Grenzen:** ≤ 256 eigene Clips je Song; Speichern, Laden und Undo verlustfrei.
- **Vorbild (Teil 15):** Cubase „Convert to Real Copy“ für Shared Copies; FL Studio „Make unique“.

---

## 10 Audio quantisieren (A) – N7-R14 (VS4, nur Safari-Version, EN-15/EN7-08)

- **Gilt für** Audio-Aufnahmen der Safari-Version (Gesang, Hör-Spur VS3). Beatbox (VS2) und gesungene Melodie (VS1) werden MIDI und nutzen das vorhandene Noten-Quantisieren. In der Claude-App gibt es den Menüpunkt nicht.
- **Abstimmung:** Parallel misst ein R7-Auftrag die Stimme (`r7/stimme-proto/`, Einsatz-Erkennung, Latenz). Weichen dessen gemessene Werte ab, gelten sie. Die Zahlen hier sind Startwerte (eigener Entwurf, ungemessen).
- **Einsätze:** spektraler Fluss (Hann 1024, Schritt 256 bei 48 kHz ≈ 5,3 ms); Schwelle = gleitender Median (±150 ms) + 1,5 × MAD; Mindestabstand 60 ms; bei Gesang zusätzlich der stimmhafte Beginn aus YIN (VS1).
- **Raster:** 1/4, 1/8, 1/16, 1/8T, 1/16T oder Auto (wie die MIDI-Raster-Erkennung). **Stärke** 0–100 %; Standard 100 % für Perkussives, 70 % für Gesang.
- **Fangfenster:** Nur Einsätze innerhalb ±40 % des Rasterabstands um einen Rasterpunkt rücken; andere bleiben (Schutz für gewollte Offbeats).
- **Verfahren A „Scheiben“** (Standard):
  - Schnitt 3 ms vor jedem Einsatz (Nulldurchgang ±2 ms); die Scheiben rücken.
  - Entsteht eine Lücke, klingt die vorige Scheibe natürlich aus (sonst Stille).
  - Überlappungen werden mit 8 ms gleichleistungsgemäß überblendet.
- *(P1)* **Verfahren B „Dehnen“** (Gesang): WSOLA je Abschnitt zwischen Ankern, Faktor 0,5–2,0, sonst Rückfall auf A. Die Tonhöhe bleibt.
- **Nicht zerstörend:** Das Original bleibt, gespeichert wird eine Schnittliste `qmap:[{src, dst}]`. Ein Undo; nach Undo ist das Original bitgleich.
- **Vorbild (Teil 15):**
  - Logic Flex Time: „Monophonic“ für Gesang/Bass; „Slicing“ mit Fill Gaps.
  - Pro Tools Beat Detective: Separation, Conform, Edit Smoothing mit Blenden.
  - Ableton: Audio-Quantisierung über Transienten bzw. Warp-Marker.

---

## 11 Mockups

Maße aus `geo.out` (V0a, gemessen). Spalten sind schematisch: 1 Zeichen ≈ 6,3 px (P) bzw. ≈ 8,1 px (L). Zeichen in den Spur-Zeilen:

| Zeichen | Bedeutung |
|---|---|
| `[█1█]` | Takt mit Clip-Start, Szene 1 |
| `[▓1▓]` | Folgetakt |
| `  –  ` | gestoppt |
| `{▓1▓}` | eigener Clip |
| `(▁▃▅)` | Glas-Kachel mit Mini-Noten |
| `▐NAME···▌` | gelbe Teil-Marke (amber) |
| `[3]` in der TAKT-Zeile | gelb gewählter Takt |
| `▼` | Positionsmarke |
| `┃` | Einfüge-Strich |

### P-1 · 390×844 · Clip-Ansicht nach FANG TEIL (Xanders Fall 4.2 Nr. 8: 8 Takte, Tipp in Takt 9)

```
y   0 ┌────────────────────────────────────────────────────────────┐
      │ ◎ [▶] [● AUTO] [ TAKT 9.1 ●○○○ ] [BPM 112] [♩] [≡]          │ 52
y  52 ├────────────────────────────────────────────────────────────┤
      │ [  SONG ⇄  ] [▶1 c] [▶2 c] [▶3 c] [▶4 c] [■]                │ 44
      │ SYNTH 1     [    ] [    ] [    ] [▒2T▒]  [■]                │ Bass aus Sz4
      │ SYNTH 2     [    ] [▒4T▒] [    ] [    ]  [■]                │ Fläche aus Sz2
      │ SYNTH 3     [    ] [    ] [▒1T▒] [    ]  [■]                │ Sequenz aus Sz3
      │ SYNTH 4     [    ] [    ] [    ] [    ]  [■]                │ 6 Reihen à 48
      │ MELODIE     [    ] [    ] [    ] [    ]  [■]                │
      │ DRUMS       [▒1T▒] [    ] [    ] [    ]  [■]                │ Drums aus Sz1
y 381 │ [STROPHE ●] [REFRAIN ] [  ＋  ] [  ＋  ] [●○]                │ 40 Teil-Leiste (V2c)
y 435 │ SYNTH 2 · KLANG ✎ ⇅ M ↶  /  TRÄGER Am  (bleiben sichtbar)   │
y 574 ├────────────────────────────────────────────────────────────┤
      │ TEIL GEFANGEN · läuft ∞              [⠿ STROPHE · 8 T]  [✕] │ 32 Chip halten = ziehen
      │ Ende Taktstrich 9 · 7 % in Takt 9 gedrückt (zu spät, zählt)  │ 18 N7-R1
      │ ▕Am▕F ▕C ▕G ▕Am▕F ▕C ▕G ▏· · · · · · · ·   ← 16 Takte       │ 32 Tipp = Anfang
      │   •           •  •      (Punkte = Clip-Wechsel)              │
      │ DR Sz1 · FL Sz2 · SEQ Sz3 ab T3 · BASS Sz4, aus T5–6         │ 18
      │ Länge [1][2][4][8✓][16]                                      │ 36
      │ [Intro][Strophe✓][Pre][Refrain][Bridge][Break][Outro][✎] ⇢  │ 36 wischbar
      │ ⇢ Teil-Chip halten und in den Song ziehen                    │ 14
      │ [Verwerfen]      [＋ Ans Song-Ende]      [  ALS TEIL ✓  ]    │ 44
y 844 └────────────────────────────────────────────────────────────┘ Blatt ≈ 270
```

### P-2 · Teil angehoben (Halten auf STROPHE in der Teil-Leiste; ab hier der 4-Takt-Teil aus 5.5)

```
y  52 ├────────────────────────────────────────────────────────────┤
      │ ╔══════════╗ [▶1 c] [▶2 c] [▶3  ] [▶4  ] [■]                │ SONG ⇄ leuchtet amber
      │ ║↖ IN DEN  ║                                                 │ = Federtaste (S1):
      │ ║   SONG   ║                                                 │ Finger hierher → öffnet
      │ ╚══════════╝                                                 │
      │ SYNTH 1     [▒1T▒] [    ] [    ] [    ]  [■]                │
      │   …                                                          │
      │            ╭────────────────────╮                            │ Geist, 24 px über
      │            │ STROPHE · 4 T    ◔ │                            │ dem Finger; ◔ = Ring:
      │            │ ▂▅▂▃ ▅▅▂ ▃▂▅ ▂▃▅   │                            │ nach 0,6 s ruhigem
      │            ╰────────────────────╯                            │ Halten öffnet die
y 381 │ [░░░░░░░░░░] [REFRAIN ] [  ＋  ] [  ＋  ] [●○]                │ Song-Seite (S9)
      │      ▲ Finger (Quelle grau)                                  │
```

### P-3 · Song-Ansicht offen, Finger am Taktstrich 3 (Song aus 5.5: INTRO T1–2, Break T3, REFRAIN T4–7)

```
y  52 ┌────────────────────────────────────────────────────────────┐
      │[CLIPS ⇄][● SONG ▾][▶ SONG][⟲ Song ▾][▦│◧]                  │ 40
y 100 │TAKT     │▐INTRO····▌ ┃  3   ▐REFRAIN··············▌   +    │ 20
      │         │            ┃╎STROPHE · 4 T ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╎       │ künftige Marke (gestrichelt)
      │SYN 1    │  –     –   ┃[░1░] [░1░] [░1░] [░1░] [▓3▓]        │ 39
      │SYN 2    │  –     –   ┃[░2░] [░2░] [░2░] [░2░] [▓2▓]        │
      │SYN 3    │  –     –   ┃  –   [█3█] [▓3▓] [▓3▓] [▓3▓]        │
      │SYN 4    │[█4█] [▓4▓] ┃  –     –     –     –     –          │
      │MELODIE  │  –     –   ┃  –     –     –     –     –          │
      │DRUMS    │  –     –   ┃[░1░] [░1░] [░1░] [░1░] [▓2▓]        │
      │AKKORDE  │ Am    Am   ┃ G     F     G     Am    Am          │
      │MEL. ⋯   │            ┃       ▁▃▅▃  ▃▅▇                     │
y 431 └────────────────────────┃─────────────────────────────────────┘
                          ╭─────┸──────────╮
                          │ STROPHE · 4 T  │ ← Geist; ┃ = Einfüge-Strich am Taktstrich 3
                          ╰────────────────╯
 ░ = Vorschau 30 % über dem alten Inhalt (Break T3, REFRAIN T4–7); der weicht erst nach der Wahl in P-4.
```

### P-4 · Rückfrage beim Ablegen auf Inhalt (S3)

```
y 664 ├────────────────────────────────────────────────────────────┤
      │ STROPHE (4 Takte) bei Takt 3                            [✕] │ 32
      │ ┌──────────────────────────────────────────────────────────┐│
      │ │ Takte 3–6 ersetzen                                       ││ 52
      │ │ was dort ist, wird ersetzt – auch Melodie                ││
      │ └──────────────────────────────────────────────────────────┘│
      │ ┌──────────────────────────────────────────────────────────┐│
      │ │ Einfügen                                                  ││ 52
      │ │ ab Takt 3 rückt alles 4 Takte nach hinten                ││
      │ └──────────────────────────────────────────────────────────┘│
      │                         [Abbrechen]                          │ 44
y 844 └────────────────────────────────────────────────────────────┘ ≈ 180
```

### P-5 · Nach „Einfügen“ (Kästchen): Nummern davor, dazwischen, dahinter sichtbar (S4)

```
y  52 ┌────────────────────────────────────────────────────────────┐
      │[CLIPS ⇄][● SONG ▾][▶ SONG][⟲ Song ▾][▦│◧]                  │ 40
y 100 │TAKT     │▐INTRO····▌ ▐STROPHE··············▌   7   ▐REFRAIN▶│ 20 T1–6 und T8 ff. als Namen,
      │SYN 1    │  –     –   [█1█] [▓1▓] [▓1▓] [▓1▓]   –   [█3█] │ 39 „7“ (Break) bleibt Nummer
      │SYN 2    │  –     –   [█2█] [▓2▓] [▓2▓] [▓2▓]   –   [█2█] │
      │SYN 3    │  –     –     –     –     –     –     –   [█3█] │
      │SYN 4    │[█4█] [▓4▓]   –     –     –     –     –     –   │
      │MELODIE  │  –     –     –     –     –     –     –     –   │
      │DRUMS    │  –     –   [█1█] [▓1▓] [▓1▓] [▓1▓] [█2█] [█2█] │ T8 = Neustart (re)
      │AKKORDE  │ Am    Am    Am    F     C     G     G     F    │
      │MEL. ⋯   │                                          ▁▃▅▃ │ Melodie ist mit dem
y 431 └────────────────────────────────────────────────────────────┘ REFRAIN nach T8 gewandert
 Weiter rechts (gerollt): …▐REFRAIN····▌   +     ← hinter dem Song-Ende wieder „+“ wie heute.
```

### P-6 · Glas-Ansicht (◧), gerollt auf Takt 3; eigener Clip Synth 1 in T5

```
y 100 │TAKT     │▐STROPHE··············▌   7   ▐REFRAIN···········▶│ 20
      │SYN 1    │(▁▃▅) (▁▃▅) {▁▅▇} (▁▃▅)       (▅▃▁▃▅▃▁▃▅) (▅▃▁…│ 39 1-Takt-Clip = je Takt eine
      │SYN 2    │(▂▅▂▅▂▅▂▅▂▅▂▅▂▅▂▅▂▅▂▅▂)       (▂▅▂▅▂▅▂▅▂▅▂▅▂…│    Kachel; 4-Takt-Fläche =
      │SYN 3    │                              (▃▃▃▃▃▃▃▃▃) (▃▃▃…│    eine breite Kachel
      │SYN 4    │                                                │
      │MELODIE  │                                                │
      │DRUMS    │(╷╷╷) (╷╷╷) (╷╷╷) (╷╷╷) (╷╷╷) (╷╷╷) (╷╷╷) (╷╷╷)│
      │AKKORDE  │ Am    F     C     G     G     F     G     Am   │
      │MEL. ⋯   │                              ▁▃▅▃  ▃▅▇         │
 {…} = eigener Clip: Rand 2 px in Spurfarbe + „eigen“; Zeilenhöhe und Taktbreite wie bei ▦.
```

### P-7 · Marken-Blatt (Tipp auf STROPHE)

```
y 654 ├────────────────────────────────────────────────────────────┤
      │ STROPHE · Takt 3–6 · a-Moll                             [✕] │ 32
      │ [▶ Ab hier] [ ×2 ] [ ×4 ] [ ◀ ] [ ▶ ]                       │ 44
      │ [⧉ Kopie …] [⇄ Ersetzen durch ▾] [✕ Löschen] [Nur Name weg] │ 44
      │ [✎ Name] [Farbe ●] [Teil-Vorlage ›] [Auf alle übertragen]*  │ 44
      │ [● Neu aufnehmen …]                                          │ 26
y 844 └────────────────────────────────────────────────────────────┘ ≈ 190
 * nur bei ≥ 2 Marken dieses Teils. Die Song-Ansicht darüber zeigt die Marke mit weißem Rand,
   die Spuren darunter amber 7 %.
```

### P-8 · Auswahl Takt 7 → ● → Start-Blatt (S5a)

```
y 100 │TAKT     │▐STROPHE··············▌  [7]▼ ▐REFRAIN···········▶│ [7] gelb, ▼ Positionsmarke
y 483 │ [▶ Ab hier] [● Aufnehmen…] [Als Teil…] [⧉ →] [✕ Takte] [⋯] │ 56 Bereich-Leiste statt
      │                                                              │    Träger-Leiste
y 604 ├────────────────────────────────────────────────────────────┤
      │ AUFNAHME AB TAKT 7                                      [✕] │ 32
      │ Ziele  [✓CLIPS] [✓AKKORDE] [ NOTEN · Synth 2 ]              │ 40
      │ ┌ Überschreiben ─────────────┐ ┌ Einfügen ─────────────────┐│ 56
      │ │ was du änderst, ersetzt ab │ │ Neues kommt dazwischen,   ││
      │ │ Takt 7; der Rest bleibt    │ │ ab Takt 7 rückt alles nach││
      │ └────────────────────────────┘ └───────────────────────────┘│
      │ Vorlauf [1 Takt ✓ │ aus]     überschreibt Akkorde ab Takt 7  │ 36
      │                      [  ● START  ]                           │ 44
y 844 └────────────────────────────────────────────────────────────┘ ≈ 240
 Bei einem Bereich (z. B. Marke REFRAIN → [● Neu aufnehmen …]) heißen die Modi [Ersetzen] [Overdub].
 Während der Aufnahme liegt ein rotes Banner als Überlagerung auf der TAKT-Zeile
 („● T7 · Einfügen · AKK + NOTEN S2“); die aufgenommenen Takte sind rot 12 % getönt.
```

### P-9 · Akkord-Chip in Takt 4 antippen (S6) + Quantisieren

```
y 628 ├────────────────────────────────────────────────────────────┤
      │ AKKORD · Takt 4, Schlag 1 (STROPHE)                     [✕] │ 40
      │ [ F ]  →  Text ⌨ [ Dm7          ]                [Löschen]  │ 44
      │ Stufe [i Am][ii° H°][III C][iv Dm][v Em][V E][VI F][VII G]  │ 44 wischbar
      │ Zuletzt  Am · F · C · G7                                     │ 36
      │ [Frei ▾]                          [Akkorde quantisieren …]   │ 44
y 844 └────────────────────────────────────────────────────────────┘ 216 (wie §4.5)
 → Toast nach der Änderung: „Takt 4: Dm7 · [Für alle „Strophe“] [Rückgängig]“

 Quantisieren (Mini-Blatt):
      │ AKKORDE QUANTISIEREN · Bereich [Auswahl T3–6 │ ganzer Song✓] │
      │ Raster [Takt✓ │ ½ Takt │ Schlag]                            │
      │ 6 Akkorde · 5 rücken · 1 fällt zusammen     [Quantisieren]  │
```

### L-1 · 844×390 · Song-Ansicht (Kästchen) mit Teil-Marken

```
x 0       82 86     142 146                                        538 545                                844
y  0 ┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
     │ ◎ [▶] [● AUTO] [ TAKT 3.1 ●●○○ ] [BPM 112] [♩] [Q AUTO] [LÄNGE AUTO] [FANG ⤓]                     [≡] │ 44
y 44 ├─────────┬───────┬────────────────────────────────────────────────┬────────────────────────────────────┤
     │[CLIPS ⇄]│TAKT   │▐INTRO·▌▐STROPHE·······▌ 7  ▐REFRAIN·······▌ +  │ TRÄGER  Am                         │ 16
     │         │SYN 1  │ –   –  █1█ ▓1▓ ▓1▓ ▓1▓  –  █3█ ▓3▓ ▓3▓ ▓3▓     │ [AKKORD ▾] [ LATCH ] [ORIGINAL]    │ 27
     │[● ▾][▶ ]│SYN 2  │ –   –  █2█ ▓2▓ ▓2▓ ▓2▓  –  █2█ ▓2▓ ▓2▓ ▓2▓     │ Verlauf  Am · F · C · G            │ 27
     │         │SYN 3  │ –   –   –   –   –   –   –  █3█ ▓3▓ ▓3▓ ▓3▓     │ [STROPHE●][REFRAIN][INTRO][ ＋ ][●○]│ Teil-Leiste
     │[⟲ Song▾]│SYN 4  │█4█ ▓4▓  –   –   –   –   –   –   –   –   –      │                                    │ (Seitenfeld,
     │         │DRUMS  │ –   –  █1█ ▓1▓ ▓1▓ ▓1▓ █2█ █2█ ▓2▓ ▓2▓ ▓2▓     ├────────────────────────────────────┤  bleibt)
     │[▦│◧][▲▼]│AKK.   │Am  Am  Am  F   C   G   G   F   G   Am  Am       │ SYNTH 2 [KLANG][✎][⇅][M][↶]        │
     │         │MEL. ⋯ │                            ▁▃▅▃▃▅▇             │                                    │
y257 ├─────────┴───────┴────────────────────────────────────────────────┴────────────────────────────────────┤
     │ ♪ SPIELEN │ ▕▔▔▕▔▔▕▔▔▕▔▔▕▔▔▕▔▔▕▔▔▕▔▔▕▔▔▕▔▔▕▔▔▕▔▔▕▔▔▕▔▔▕▔▔▕▔▔▕▔▔▕▔▔▕▔▔▕▔▔▕▔▔▕▔▔▕▔▔▕ Tastatur         │ 133
y390 └───────────────────────────────────────────────────────────────────────────────────────────────────────┘
  Spurbank (EN7-02): 7 Zeilen à 27,3 px wie V0a. Seite 1 = Synth 1–4 + DRUMS + AKK + MEL;
  [▲▼] → Seite 2 = MELODIE, Synth 5/6 + DRUMS + AKK + MEL.
```

### L-2 · Querformat: Teil aus dem Seitenfeld ziehen

```
y 44 ├─────────┬────────────────────────────────────────────────────────┬──────────────────────────────────┤
     │╔════════╗│ [▶1 c] [▶2 c] [▶3  ] [▶4  ] [■]                       │ TRÄGER  Am                       │
     │║↖ SONG  ║│ SYNTH 1   [▒1T▒] [    ] …                             │ [AKKORD ▾] [LATCH] [ORIGINAL]    │
     │╚════════╝│ SYNTH 2   [    ] [▒1T▒] …    ╭──────────────────╮     │                                  │
     │          │ …                             │ STROPHE · 4 T  ◔ │ ←──│ [░░░░░░░░][REFRAIN][ ＋ ][●○]     │
     │          │                               ╰──────────────────╯    │   ▲ Quelle (grau)                │
  1) Halten 450 ms → Geist.
  2) Finger über „↖ SONG“ (oben links) ODER 0,6 s ruhig halten → die Song-Ansicht ersetzt das
     Clip-Raster (links); das Seitenfeld rechts bleibt.
  3) Nach ≥ 12 px Bewegung über dem Song-Canvas loslassen = Ablegen am Taktstrich;
     über dem Seitenfeld loslassen = Abbruch.
```

### L-3 · Querformat: Glas-Ansicht und Marken-Blatt

```
y 44 ├─────────┬───────┬────────────────────────────────────────────────┬────────────────────────────────────┤
     │[CLIPS ⇄]│TAKT   │▐STROPHE·······▌ 7  ▐REFRAIN·······▌ +          │ TRÄGER  F                          │
     │[● ▾][▶ ]│SYN 1  │(▁▃)(▁▃){▁▅}(▁▃)    (▅▃▁▃▅▃▁)(▅▃▁▃▅▃▁)          │ …                                  │
     │[⟲ Song▾]│SYN 2  │(▂▅▂▅▂▅▂▅▂▅▂▅▂▅)    (▂▅▂▅▂▅▂▅▂▅▂▅▂▅)            │                                    │
     │[▦│◧][▲▼]│ …     │ (weißer Rand = gewählte Marke STROPHE)          │                                    │
y257 ├─────────┴───────┴────────────────────────────────────────────────┴────────────────────────────────────┤
     │ STROPHE · Takt 3–6 · a-Moll                                                                       [✕] │ 28
     │ [▶ Ab hier] [×2] [×4] [◀] [▶] [⧉ Kopie …] [⇄ Ersetzen ▾] [✕ Löschen] [Nur Name weg]                 │ 44
     │ [✎ Name] [Farbe ●] [Teil-Vorlage ›] [Auf alle übertragen]* [● Neu aufnehmen …]                       │ 44
y390 └───────────────────────────────────────────────────────────────────────────────────────────────────────┘ 116
```

---

## 12 Datenmodell, Test-API, Undo

### 12.1 Daten (ändert §4.11 und §14; Format 4)

```js
// Teil-Vorlage (S.parts, 8 Plätze wie §4.4)
Part = { id:'P1', name:'Strophe', color:'t2', len /*1..16 Takte*/, start:'bar'|'end',
         lanes: [ [ {bar /*0..len-1*/, slot:-1|0..7, ph?:Schläge /*nur bar 0*/, re?:1} ] × NT ],  // leer = „bleibt“
         chords: ChordRow|null, xp: null|{semi:-12..12}|{tg}, src:'fang'|'manual'|'rec'|'song', st?,
         mute?: [ [ {bar, on:0|1} ] × NT ] /*(P1)*/ }
// Part.slots (Spec §4.4) bleibt nur als abgeleitete Kurzform (= Zustand bei Takt 0) für Teil-Blatt und alte Daten;
// beim Laden ohne lanes: lanes[t] = slots[t] == null ? [] : [{bar:0, slot: slots[t] === -1 ? -1 : slots[t].s}]
ChordRow = { len, ch:[{ b, tg: Target|null /*null = ORIGINAL (T.reset)*/ }] }

// Song = WP6-Abspielplan, Zeitleiste zuerst (EN7-01)
Song = { bars, loop:{on, a, b},
         lanes:   [ [ {bar, slot:-1|0..7, re?:1, ph?:Schläge, own?:'o3'} ] × NT ],
         carrier: [ {beat, target|null} ],  mel: {[t]: {notes}},  xp: [ {beat, semi} ],
         marks:   [ {id:'M4', a /*Takt*/, len, part:'P1'|'S3'|null, name?:string /*nur wenn eigener Name*/} ],  // sortiert, überlappungsfrei
         own:     { 'o3': Clip & {from:{t, s, bar}} },                 // ≤ 256
         src:'rec'|'plan', melodyTrack? }
S.ui += { songView:'squares'|'glass', songSel:null|{a, b}, songPos:Takt }      // flüchtig: in HIST.volatile (M-REKON)
R.mem[k] = { bar, slots:[NT], cs:[NT], own:[NT], carrier, part, mute?:[NT] }   // 64 Takte
R.own[t] = id|null                                                            // spielt song.own[id]
```

**Entfällt** (nie gebaut): `S.chain`, `ChainItem`, `alt`, `Song.src:'chain'`, `flattenChain`.
**Migration:** Ein WP6-Song bekommt `marks:[]`, `own:{}`, `xp:[]`, `src:'rec'`. Es gibt nichts zu zerlegen. `normSong`: Slots bis 7, NT Lanes, `re`/`ph`/`own` erhalten (V2a schreibt die leeren Felder).
**`songFromChain(chain)`** (WP6-API) bleibt und setzt zusätzlich je Glied eine Marke „Szene n“ (`part:'Sn'`).

### 12.2 Test-API (ersetzt in §16 `chain`, `setChain`, `chainInsert`, `chainMove`, `chainDelete`, `flatten`, `splitRecording`)

```ts
// V0c
songSelect(a: number|null, b?: number): {a, b}|null                      // gelbe Auswahl (0-basiert, b inklusive)
quantizeChords(o: {grid: 4|2|1, a?: number, b?: number, src?: 'song'|'S1'..'S8'|'P1'..'P8'}): {moved: number, merged: number}
songRecFrom(o?: {from?: number, to?: number, mode?: 'over'|'insert'|'replace'|'overdub',
                 targets?: {clips?: boolean, chords?: boolean, notes?: boolean}, preroll?: 0|1}): boolean   // V0c: nur 'over'; neben songRec(on) aus WP6 (I-04)
// V2d
fangPart(): null | {len, end: {bar, rule: 'struktur'|'zeit'|'min1', f}, lanes, chords, period, suggest: {name, sceneAlt}}
fangClose(o?: {beat?: number}): {bar, rule, f}                            // Test: Tipp bei hörbarem Schlag `beat`
memory(): {bars: {bar, slots, cs, own, carrier}[], capc}                  // erweitert
placePart(part: string|number, bar: number, mode?: 'insert'|'replace'): {mark: string}
songMarks(): {id, a, len, part, name, short, dev: boolean}[]              // dev = Teil′
markAction(id: string, kind: 'rep'|'move'|'copy'|'replaceBy'|'delete'|'unname'|'rename'|'applyAll'|'swapL'|'swapR', arg?: any): void
songRange(kind: 'insertEmpty'|'delete'|'clear'|'copy'|'asPart', a: number, b: number, arg?: any): void
// V2d′
songRecRange(a: number, b: number, mode: 'replace'|'overdub', targets?: {...}): boolean
ownClip(t: number, bar: number): Clip|null;  makeOwn(t: number, bar: number, whole?: boolean): string|null;  dropOwn(t: number, bar: number): void
// V2e / V2e′
songViewMode(m?: 'squares'|'glass'): 'squares'|'glass'
svLayoutInfo(): {rulerH, rowH, cellW, x0, rows: string[], bank: number, marks: {id, x0, x1, label}[], sel: {a, b}|null, pos: number}
```

- `runtime().song` ergänzt `pos`, `sel`, `own: (string|null)[]`.
- `noteLog`-Quelle `'own'` für Noten aus eigenen Clips.
- Alte Namen gelten weiter (I-04): `songLoop`, `songLoopRange`, `songMel`, `songMelNotes`, `songPos` (N0c).

### 12.3 Undo-Gruppen (ergänzt TA8, E3-33)

| Geste | Undo |
|---|---|
| FANG TEIL [ALS TEIL ✓] | `part` |
| FANG TEIL [＋ Ans Song-Ende] · Ziehen aus dem FANG-Blatt | `group` [part, song] |
| Ablegen (Einfügen/Ersetzen) aus der Teil-Leiste | `song` |
| Marken-Aktionen ×n, ◀▶, Kopie, Verschieben, Ersetzen durch, Löschen, Nur Name weg, Name nur hier | `song` |
| Name „Teil überall“, Farbe | `part` (Marken zeigen den Teil-Namen) |
| Auf alle übertragen · ⟳ ersetzen (FANG) · [Für alle „Strophe“] (Akkord) | `group` [part, song] |
| Bereich: Takte löschen, Leeren, Kopie, Teil einsetzen | `song` · „Als Teil …“ = `group` [part, song] |
| Aufnahme im Song (jede Art, auch über Schleifen-Durchgänge) | `song` (ein Eintrag) |
| Eigener Clip anlegen (Halten), [Ganzer Block], [Zurück zum Szenen-Clip] | `song` |
| Bearbeiten in einem eigenen Clip (ROLLE/SCHRITTE) | **neu `own`** `{id, before}` je Geste |
| *(P1)* Als Szenen-Clip ablegen | `group` [clip, song] |
| Akkord ändern/löschen im Song | `song` (WP6) |
| Akkorde quantisieren | `song` bzw. `part` (Szenen- und Teil-Zeilen, TA8) |
| Ansicht ▦/◧, Auswahl, Positionsmarke, abgebrochenes Ziehen | kein Undo |

- **VL-R1:** Der Verlauf-Rekorder (VC2a) meldet die Art `own` an.
- `S.ui.songView`, `songSel` und `songPos` stehen in `HIST.volatile`.

---

## 13 Abnahme (N7S-01 …)

Alle Punkte mit CDP-Touch in Chromium, P1 und L1 (M-PLATZ zusätzlich P2, P3, L2, W). Zeiten mit M-ZEIT, Lage mit `svLayoutInfo()`. „deep-equal“ heißt über `project()`.

**V0c**
- [ ] **N7S-01** (V0c) Keine Zielzeile: Der Song-Canvas hat nach V0c die V0a-Maße (P1 306×330,8, L1 392×207,4, je ±2 px). Ziele erscheinen im Start-Blatt (● bei vorhandenem Song) und beim Halten auf ●; das ● zeigt die Ziele („● AKK+MEL“).
- [ ] **N7S-02** (V0c) Banner als Überlagerung: Während ● SONG liegen alle Elemente der Song-Ansicht ±2 px an derselben Stelle (M-ANSICHT, L3); der aufgenommene Bereich ist rot getönt.
- [ ] **N7S-03** (V0c) Tipp auf einen Träger-Chip bei Schlag 6,5 → Akkord-Auswahl, Text „Dm7“ → Eintrag bei 6,5 mit Grundton D, Art m7 (Schlag unverändert); ein Undo stellt deep-equal her.
- [ ] **N7S-04** (V0c) `quantizeChords({grid:4})` auf Am 0 · F 3,8 · C 8,3 · G 11,6 · G 12,2 · Am 16,1 → genau Am 0 · F 4 · C 8 · G 12 · Am 16; Rückgabe `{moved:5, merged:1}`; Toast nennt die Zahlen; ein Undo.
- [ ] **N7S-05** (V0c) Raster ½ Takt: C 9,9 → 10, G 11,1 → 12. Mit Bereich = Auswahl T3 (Schläge 8–12) bleiben alle Einträge außerhalb des Bereichs deep-equal.
- [ ] **N7S-06** (V0c) Taktleiste: Tipp auf „3“ → Positionsmarke auf Takt 3 (`songPos()`, Index 2), `songSelect()` = {a:2, b:2}. Pixel in der Chip-Mitte ≈ #ffb22e (±12 je Kanal), die Zahl dunkel. Tipp auf „5“ → {a:2, b:4}. Tipp in die Auswahl → `null`. Bei laufendem Song gibt es durch den Tipp keinen Neustart (`noteLog` lückenlos, `runtime().song.play` bleibt). ▶ oben startet bei T3 (N0c).
- [ ] **N7S-07** (V0c) SCHLEIFE Bereich als grüne 3-px-Linie mit Griffen (Trefferzone ≥ 36×34); Gelb und Grün überlagern sich nicht (Pixelprobe in der Lineal-Mitte).

**V2c**
- [ ] **N7S-08** (V2c) `ChordRow`-Eintrag `tg:null` → Wiedergabe ruft `T.reset` (Träger ORIGINAL ab diesem Schlag, `noteLog` out = clip).
- [ ] **N7S-09** (V2c) Akkord-Zeilen-Blatt [Quantisieren], Raster Takt, auf Szene 2 → Ergebnis wie N7S-04 sinngemäß; ein Undo (`part`).
- [ ] **N7S-10** (V2c) Teil-Taste: Tipp startet; Halten 450 ms ohne Bewegung → Teil-Blatt erst beim Loslassen; Halten + Ziehen → kein Teil-Blatt.

**V2d**
- [ ] **N7S-11** (V2d) `memory()` führt je Takt `slots`, `cs`, `own` und den Träger, 64 Takte; ORIGINAL steht im CAPC als `target:null`.
- [ ] **N7S-12** (V2d) Xanders Fall (4.2 Nr. 8): DR Sz1, FL Sz2, SEQ Sz3 ab T3, BASS Sz4 aus T5–6 und wieder an T7, Akkorde Am F C G ×2. Alle Clips sind bei T1 gestartet, daher ohne `ph`. FANG TEIL bei T9 + 7 % → `fangPart()`:
  - DR `[{bar:0,slot:0}]`, FL `[{bar:0,slot:1}]`, SEQ `[{bar:0,slot:-1},{bar:2,slot:2}]`, BASS `[{bar:0,slot:3},{bar:4,slot:-1},{bar:6,slot:3}]`;
  - Akkorde Am F C G Am F C G; `len 8`; `end {bar:8, rule:'struktur'}`.
- [ ] **N7S-13** (V2d) Phase: 2-Takt-Drum-Clip, gestartet 1 Takt vor dem Teil-Anfang → `lanes[DR][0].ph === 4`. Teil-Taste spielt die Drum-Noten an denselben Positionen relativ zum Teil-Anfang wie beim Einfangen (M-ZEIT ±0,002).
- [ ] **N7S-14** (V2d) Taktstrich-Regel: Die Fälle 1–9 aus 4.2 über `fangClose({beat})` liefern genau Ende, Grund, Länge und Akkorde aus `fang-ende.out`.
- [ ] **N7S-15** (V2d) Übernahme phasengleich (Fall 1): Am F C G, Tipp T5 + 30 % → ab Schlag 20 klingt F (Teil-Takt 2), kein zweites Am (Recalls im `noteLog`).
- [ ] **N7S-16** (V2d) Eingefroren bei E1 (Fall 3): Ein Clip-Start nach dem Tipp im selben Takt erscheint nicht in `fangPart().lanes`.
- [ ] **N7S-17** (V2d) Name:
  - Erster Fang schlägt „Strophe“ vor, der zweite „Refrain“.
  - Ein zweiter Strophen-Fang zeigt [＋ Strophe 2] (Standard) und [⟳ Strophe ersetzen].
  - Freitext 13 Zeichen wird auf 12 gekürzt; leer → Vorschlag.
  - Teil-Taste ≤ 8 Zeichen, sonst Kurzform („REFRAIN 2“ → „REF2“).
- [ ] **N7S-18** (V2d) EN7-09: Nur Clip-Wechsel, keine Noten seit 8 s → der FANG-Platz zeigt in ♪ SPIELEN „FANG TEIL“; nach einer gespielten Note „FANG“.
- [ ] **N7S-19** (V2d) `placePart(STROPHE, 2, 'insert')` auf den Song aus 5.5 → Daten wie 5.5 „Einfügen“ (deep-equal gegen erwartetes JSON).
  - Bass-Lane enthält `{bar:6, slot:-1}`: Im Break T7 schweigt der Bass (`noteLog` ohne Synth-1-Noten in Schlag 24–28).
  - Der REFRAIN-Bass setzt bei T8 (Schlag 28) mit Phase 0 ein (M-ZEIT).
  - Ein Undo.
- [ ] **N7S-20** (V2d) `placePart(STROPHE, 4, 'insert')` (mitten im REFRAIN) → REFRAIN geteilt in T4 und T9–11; Bass-Fortsetzung `{bar:8, slot:2, ph:4}`; ab T9 dieselben Bass-Noten wie vorher ab T5 (M-ZEIT ±0,002).
- [ ] **N7S-21** (V2d) `placePart(STROPHE, 2, 'replace')` → T3–6 = STROPHE; REFRAIN-Rest T7 mit Länge 1; `bars` 7.
  - Fortsetzung `{bar:6, slot:2, ph:4}`: T7 klingt wie vorher T7 (M-ZEIT).
  - Melodie-Noten mit 7,75 ≤ t < 23,75 entfernt, auch eine Note bei t = 7,8 (Auftakt).
  - T1–2 deep-equal; ein Undo.
- [ ] **N7S-22** (V2d) Ablegen bei `bar ≥ bars` hängt ohne Rückfrage an; `bar > bars` rastet bei `bars` ein.
- [ ] **N7S-23** (V2d) `markAction`: rep 2 → eine Kopie dahinter; move → LÖSCHEN + EINFÜGEN; copy (neue `own`-IDs); replaceBy Q (Länge 2 statt 4, Rest rückt um −2); delete (Rest rückt); unname (Lanes deep-equal, Marke weg); applyAll bei 3 Stellen. Je ein Undo; `S.tracks[].clips` jedes Mal deep-equal.
- [ ] **N7S-24** (V2d) 64 Marken, 256 Takte: `placePart` ≤ 5 ms (Xeon); die Änderung wirkt ab dem nächsten Taktstrich.
- [ ] **N7S-25** (V2d) Teil-Taste mit Lanes (N7S-12) läuft im Kreis: Bass stumm in T5–6 jedes Durchlaufs, Neustart T7 (`noteLog`).
- [ ] **N7S-26** (V2d) Song-MIDI: Marker FF 06 mit Teil-Namen an jedem Marken-Anfang.

**V2d′**
- [ ] **N7S-27** (V2d′) Ab Takt 3, Überschreiben, Ziel CLIPS: Pad-Start in T3, Ende per ● bei T5 + 20 % (N7-R1 → Taktstrich 5).
  - Nur die Pad-Lane T3–4 ist ersetzt; ab T5 spielt der alte Inhalt phasengleich weiter; Drums deep-equal; ein Undo.
  - SG-Tests mit der neuen Ende-Regel angepasst (`v2d2-adapt-*.mjs`, Verweis N7-R1).
- [ ] **N7S-28** (V2d′) Ab Takt 3, Einfügen, 4 Takte, Ende bei T7 + 30 % → eingefügt 4 Takte. Alter T3 ist jetzt T7 (Lanes, Träger, Melodie, Marken um +4 deep-equal); ab T8 phasengleich.
- [ ] **N7S-29** (V2d′) Bereich T3–6, Ersetzen, NOTEN auf Synth 2:
  - In T3–6 sind nur die neuen Noten zu hören, die alten waren während der Aufnahme stumm.
  - Eigene Clips sind angelegt; `S.tracks[1].clips` deep-equal (S8).
- [ ] **N7S-30** (V2d′) Bereich T3–6, Overdub: alte und neue Noten erklingen; Szenen-Clip deep-equal.
- [ ] **N7S-31** (V2d′) NOTEN auf der MELODIE-Spur → `songMelNotes(5)`. Überschreiben ersetzt je Takt nur Takte mit neuen Noten.
- [ ] **N7S-32** (V2d′) Eigener Clip: Wiedergabe spielt an der Stelle `song.own`, an allen anderen den Szenen-Clip (`noteLog` src `own` bzw. `clip`). Eine Änderung am Szenen-Clip ändert den eigenen Clip nicht.

**V2e**
- [ ] **N7S-33** (V2e) Keine neuen Zeilen (DOM und `svLayoutInfo().rows`): Taktleiste, je Spur eine Zeile, AKKORDE, MELODIE. Keine TEIL-Zeile, kein ⊙, kein „Spuren ▸“, keine Teil-Leiste in P.
  - Canvas-Maße wie V0a ±2 px.
  - Zeilen ≥ 26 px, sonst Spurbank: L1 Seite 1 = Synth 1–4, DRUMS, AKK, MEL; DRUMS/AKK/MEL immer sichtbar.
- [ ] **N7S-34** (V2e) Marke STROPHE a = 8, len 4 bei `SV.x = 0`:
  - `svLayoutInfo().marks[0]` x0 = 290, x1 = 430 (±1); Label „STROPHE“.
  - Pixel in der Mitte amber; die Nummern 9–12 werden nicht gezeichnet, 8 und 13 schon.
  - Eine 1-Takt-Marke zeigt die Kurzform „STR“.
- [ ] **N7S-35** (V2e) Tipp auf eine Marke → weißer Rand + Marken-Blatt. Zweiter Tipp → Takt-Auswahl in der Marke mit sichtbaren Nummern.
- [ ] **N7S-36** (V2e) Bereich-Leiste ersetzt die Träger-Leiste in derselben Höhe (P1 56 px ±1); kein Element außerhalb verschiebt sich (M-ANSICHT).
- [ ] **N7S-37** (V2e) Ein Zellen-Tipp in einer Marke ändert nur diesen Takt (WP6) und setzt „STROPHE′“. Nach [Auf alle übertragen] ist der Strich weg und alle Stellen sind gleich.
- [ ] **N7S-38** (V2e) Akkord in einer Marke ändern → nur diese Stelle. [Für alle „Strophe“] setzt ihn in allen 3 Stellen und in der Vorlage (ein Undo).
- [ ] **N7S-39** (V2e) Etikett antippen wählt die Spur (`runtime().selT`); das NOTEN-Ziel zeigt sie.
- [ ] **N7S-40** (V2e) M-PLATZ in P1–P3, L1, L2, W: Marken-Blatt, Bereich-Leiste, Ersetzen/Einfügen-Blatt, Start-Blatt, Akkord-Quantisieren-Blatt. Treffer ≥ 44×44 (P) bzw. ≥ 40×36 (L).

**V2e′**
- [ ] **N7S-41** (V2e′) Ziehen aus der Teil-Leiste (P1):
  - Halten 450 ms → Geist, Feld SONG ⇄ amber.
  - (a) Finger auf SONG ⇄ → die Song-Ansicht ist ≤ 1 Bild später offen.
  - (b) 600 ms ruhig halten → offen.
  - Loslassen vor jeder Bewegung nach dem Öffnen → Abbruch (deep-equal).
- [ ] **N7S-42** (V2e′) Ablegen: Der Einfüge-Strich rastet am nächsten Taktstrich (Finger bei x = 3·36 + 10 → n = 3). Auf Inhalt → Blatt mit beiden Wahlen; „Einfügen“ = Daten wie N7S-19. Ablegen auf Transport/Etiketten → Abbruch, zurück zur Clip-Ansicht, deep-equal.
- [ ] **N7S-43** (V2e′) Rand-Rollen 2 Takte/s (±10 %), nach 1 s 6 Takte/s. Ein zweiter Finger ändert nichts. Während des Ziehens kein Launch im `noteLog`; FOLGEN hält.
- [ ] **N7S-44** (V2e′) Ziehen aus dem FANG-Blatt (Teil-Chip) = Teil anlegen + ablegen in **einem** Undo (`group`). Marke halten + ziehen verschiebt; über ⧉ ≥ 250 ms = Kopie.
- [ ] **N7S-45** (V2e′) Entfalten ≤ 300 ms; M-ANSICHT ±2 px für alle Bedienelemente; Haptik-Aufruf einmal.
- [ ] **N7S-46** (V2e′) Glas:
  - Umschalter 44×40 (P1) in der Transportzeile.
  - Je Durchlauf eine Kachel; die Zahl der Noten-Rechtecke je Kachel = Notenzahl des Durchlaufs (≤ 160).
  - Zeilenhöhe gleich wie Kästchen; Umschalten lässt `project()` deep-equal; PE1 ≥ 55 fps mit 8 Spuren in Glas.
- [ ] **N7S-47** (V2e′) Halten auf eine Verweis-Zelle (Song aus 5.5 nach „Einfügen“):
  - (a) Synth 1 in T5 (1-Takt-Clip Sz1 ab T3) → eigener Clip nur T5 (Durchlauf = 1 Takt);
  - (b) Synth 1 in T9 (2-Takt-Clip Sz3 ab T8) → eigener Clip T8–9 (der ganze Durchlauf).
  - Je Toast mit [Bearbeiten][Ganzer Block][Rückgängig]; Szenen-Clips deep-equal; je ein Undo.
  - [Ganzer Block] bei (b) → eigener Clip T8–11.
- [ ] **N7S-48** (V2e′) Eigenen Clip aus (a) antippen → ROLLE auf dem eigenen Clip. Eine gezeichnete Note erklingt nur in T5, nicht in T3, T4, T6 (`noteLog`); das Undo hat die Art `own`. [Zurück zum Szenen-Clip] stellt den Verweis her (deep-equal zum Zustand vor N7S-47).

**V2f / V3a / VS4**
- [ ] **N7S-49** (V2f) Die Song-Tonart zählt eigene Clips an ihrer Stelle statt des Szenen-Clips (Testfall: eigener Clip in E-Dur verschiebt die Erkennung messbar); das Marken-Blatt zeigt die Tonart der Marke.
- [ ] **N7S-50** (V3a) Takt-Chips der Taktleiste in ROLLE, LAUF und SCHRITTE und der Song-Taktleiste nutzen dieselben Tokens (Chip `--amber`, Band 35 %, Körper 7 %); Pixelprobe in beiden.
- [ ] **N7S-51** (VS4) Audio quantisieren, Raster 1/16, Stärke 100 %:
  - Einsätze ±2 ms am Raster.
  - M-KLICK besteht; M-EINBRUCH ≤ 3 dB an jeder Schnittstelle.
  - Nach Undo ist das Original bitgleich.
  - Stärke 50 % → halber Weg (±2 ms).
  - Einsätze außerhalb ±40 % bleiben.

---

## 14 Pakete, Aufwand, ersetzte Spec-Punkte

### 14.1 Zuordnung und Aufwand (ergänzt C.4)

| Paket | Aus diesem Delta | Dauer (C.4 → neu) | Budget KB |
|---|---|---|---|
| **V0c** | Start-Blatt statt Zielzeile, Banner als Überlagerung, Chip-Bearbeitung (N7-R10), Akkorde quantisieren im Song (N7-R11), gelbe Auswahl + Positionsmarke + „Tipp springt nicht“ (N7-R7, nur Auswahl), Schleife als grüne Linie | 5–6 → **6–7 h** | 35 → 42 |
| **V2c** | `ChordRow.tg:null`, [Quantisieren] im Akkord-Zeilen-Blatt, Teil-Taste: Halten = anheben, Teil-Blatt beim Loslassen | 5 → **5,5 h** | 60 → 64 |
| **V2c′** | keine Änderung. „Eine Skala“ wirkt auch auf aufgelöste Teile und eigene Clips, weil sie dieselbe Abbildung nutzen | ± 0 | – |
| **V2d** | FANG TEIL v2 (4.1–4.6, EN7-09), `Part.lanes`, Teil-Wiedergabe mit Lanes, Zeitleisten-Operationen und Marken (Daten, API), `re`/`ph` in `songTick`; **ohne** Kette und `flattenChain` | 4–5 → **5–6 h** | 30 → 40 |
| **V2d′** | Aufnahme ab Takt n / Bereich mit Modi, NOTEN-Ziel, eigene Clips (Daten und Wiedergabe), Ende nach N7-R1 | 4 → **5 h** | 25 → 35 |
| **V2e** | Song-Ansicht: Marken in der Taktleiste, Bereich-Leiste, Marken-Blatt, Ersetzen/Einfügen-Blatt, Spurbank, Etikett = Spur, MIDI-Marker; **ohne** TEIL-Zeile, ⊙, Spuren ▸, [In Teile zerlegen] | 5 → **5 h** | 60 → 55 |
| **V2e′ (neu)** | Ziehen & Ablegen (Teil-Taste, FANG-Blatt, Marke) mit Federtaste SONG ⇄, Entfalten, Glas-Ansicht + Umschalter, eigener Clip per Halten + Bearbeiten | – → **4–5 h** | 40 |
| **V2f** | Tonart zählt eigene Clips; Tonart je Marke | 3–4 → **3,5–4 h** | 20 |
| **V3a** | gemeinsames Auswahl-Bild (Tokens), sonst unverändert | ± 0 | – |
| **VS4** | Audio-Quantisierung nach N7-R14 (keine Bau-Gruppe, EN-15) | – | – |

- **Summe:** ≈ **+8–9 h** und ≈ +66 KB (V0c +7, V2c +4, V2d +10, V2d′ +10, V2e −5, V2e′ +40).
- **App-Version:** V2e′ = 4.7.1; die übrigen Nummern bleiben.
- **Gruppe V2-2** hätte damit 6 Pakete (V2d, V2d′, V2e, V2e′, V2f, V7a, ≈ 30 h). Vorschlag gegen die 3–5-Regel aus C.1: V7a wird erstes Paket der folgenden Gruppe (braucht nur V2a; E3-32 sinngemäß „direkt nach dem Song-Block“).
- **Reihenfolge der Gruppen** (Kodamo P1 gegen Song P2) ist Sache des Orchestrators. Dieses Delta hängt davon nicht ab, nur V0c ist zeitkritisch: Es ist das nächste Song-Paket und bringt Xanders P4 sofort.

### 14.2 V0c-Hinweis

Falls V0c beim Übernehmen dieses Deltas schon läuft: N7S-01/02 (keine Zielzeile, Banner als Überlagerung) und N7S-06 (Tipp springt nicht) **in V0c nachziehen**, weil sonst eine Zeile gebaut wird, die V2e wieder entfernt. N7S-03…05 und N7S-07 dürfen in V0d nachrücken (+1 h).

### 14.3 Ersetzte oder entfallende Spec- und Nachtrag-Punkte

| Spec/Nachtrag | Neu |
|---|---|
| E3-07 „TEIL + KETTE ersetzen …; ein WP6-Song bleibt Mitschnitt; `songFromChain` … ab V2d eine Kette“ | TEIL bleibt; KETTE entfällt (EN7-01); WP6-Song = Zeitleiste; `songFromChain` wie WP6 + Marken |
| E3-31 [In Teile zerlegen] | entfällt; *(P1)* [Teile erkennen] |
| E3-35/E3-36, TA3, ABWEICHUNG, [Nur hier ändern], [Für alle …] als Abweichungs-Auflösung | Bearbeitung lokal; „′“; [Auf alle übertragen], [Für alle „Strophe“] |
| TA8 Art `chain` | entfällt; neu `own` |
| §0.5 KETTE, ABWEICHUNG, SONG-ANSICHT „mit den Zeilen TEIL, AKK., MEL. und Spuren ▸“, AUFNAHME-ZIELE | KETTE/ABWEICHUNG entfallen; neu TEIL-MARKE, AUSWAHL, POSITIONSMARKE, EIGENER CLIP, VERWEIS, TAKTSTRICH-REGEL; Ziele CLIPS · AKKORDE · MELODIE/NOTEN |
| §4.4 Teil-Leiste „in Clip- und Song-Ansicht an derselben Stelle“; Halten = Teil-Blatt | P: nur Clip-Ansicht; L: Seitenfeld; Halten = anheben, Blatt beim Loslassen |
| §4.7 „Ende = laufender Takt“, Regel 3 Auffüllen, Blatt-Zeile „WOHIN IM SONG?“ | N7-R1, 4.5 |
| §4.8 (Ziele über die Kette) | N7-R8 |
| §4.9 (Zeilen, Gesten, Abflachen, Mitschnitt) | 6.4, N7-R5/R6/R13 |
| §4.11 / §14 (`S.chain`, `ChainItem`, `alt`, `src:'chain'`) | 12.1 |
| §16 `chain`, `setChain`, `chainInsert`, `chainMove`, `chainDelete`, `flatten`, `splitRecording` | 12.2 |
| V0c S-01 Zielzeile 32/28 px, Banner 28 px über dem Raster | Start-Blatt, Überlagerung (N7S-01/02) |
| V0c S-02 grünes Band | grüne Linie + gelbe Auswahl (N7S-06/07) |
| V2c-01 „beim Wechsel CLIPS ⇄ SONG an derselben Stelle“ | gilt nur in L (Seitenfeld); P: nur Clip-Ansicht |
| V2d-05, -06, -07, -09, -10, -14 | N7S-19…24 (sinngemäß, Daten auf Zeitleiste) |
| V2d-03c (▶2 als Grenze) | bleibt; dazu 4.3 (Anfang über die Grenze verschiebbar) |
| V2d′-01, -02, -03, -04 | N7S-27…31 |
| V2e-01, -03, -04, -05, -06, -08, -09, -10 | N7S-33…40, N7S-26 |
| N2d-01 „Kette“ | gilt mit „Song“ statt „Kette“ |
| N2b-01, N2e-01/02, N0c, TA9, EN-06, EN-07 | bleiben; FOLGEN hält zusätzlich bei Ziehen, offener Auswahl und offenem Marken-Blatt; ▶ oben startet an der Positionsmarke (= gelber Takt) |

---

## 15 Vorbilder und Quellen

**Bewertung:** **BELEGT** = Primärquelle oder zwei unabhängige Quellen · **WAHRSCHEINLICH** = eine Sekundärquelle · **UNBELEGT** = nichts gefunden. „(SE)“ = nur Suchauszug gelesen, Seite nicht abrufbar.

| Nr. | Aussage | Status | Quelle |
|---|---|---|---|
| Q1 | Apple HIG: „Spring loading lets people activate certain controls … by dragging selected content over them“; Ziehbild ab ≈ 3 pt, durchscheinend, darf sich zur Vorhersage des Ergebnisses verändern; zeigen, ob ein Ziel annimmt; Ziehen-Ablegen rückgängig machbar; im selben Behälter = verschieben, in anderen = kopieren | **BELEGT** (direkt gelesen) | https://developer.apple.com/design/human-interface-guidelines/drag-and-drop |
| Q2 | UIKit `UISpringLoadedInteraction`: „spring-loaded, user-driven navigation during a drag activity“ | **BELEGT** (direkt) | https://developer.apple.com/documentation/uikit/uispringloadedinteraction |
| Q3 | Logic Pro, Arrangement-Marker: Verschieben/Kopieren bewegt alle Regionen des Abschnitts; zwischen zwei Markern abgelegt rückt der rechte nach rechts; auf einen anderen gezogen = Tausch; Löschen schließt die Lücke; Option-Ziehen = Kopie | **BELEGT** (Apple-Handbuch, SE) | https://support.apple.com/en-bh/guide/logicpro/lgcpf7c0c09c/mac · https://help.apple.com/logicpro/mac/10.4/en.lproj/lgcpf7c0c09c.html |
| Q4 | Studio One, Arranger: Abschnitte einfügen und ersetzen, Option-Ziehen = Duplikat; ein gezogener Abschnitt nimmt seinen Inhalt mit | **BELEGT** (2 Sekundärquellen, SE) | https://www.soundonsound.com/reviews/presonus-studio-one-3 · https://ask.audio/articles/experimenting-with-musical-ideas-using-presonus-studio-ones-arranger-and-scratch-pad |
| Q5 | Ableton Live: Session-Clips lassen sich beim Ziehen mit Tab ins Arrangement legen, auch eine ganze Szene über alle Spuren | **BELEGT** (2 Sekundärquellen, SE; Handbuch nicht erreichbar) | https://flypaper.soundfly.com/produce/ableton-live-when-how-to-go-from-session-to-arrangement-view/ · https://forum.ableton.com/viewtopic.php?p=1763992 |
| Q6 | Ableton Live: ins Arrangement gezogene Clips sind nicht mit den Session-Clips verknüpft | **WAHRSCHEINLICH** (Forum, SE) | https://forum.ableton.com/viewtopic.php?p=1794829 |
| Q7 | Bitwig: Launcher-Clip per Ziehen an eine Position im Arranger kopieren; Szenen lassen sich ebenfalls ins Arranger kopieren | **BELEGT** (Handbuch, SE) | https://www.bitwig.com/userguide/latest/acquiring_and_working_with_launcher_clips |
| Q8 | Loopy Pro: Ist Auto Count-Out aus, endet die Aufnahme am **nächsten** Vielfachen der Count-Out-Dauer | **BELEGT** (Hersteller-Wiki, SE) | https://wiki.loopypro.com/Working_with_Record_Count-In/Out_and_Quantization |
| Q9 | Loopy Pro: Nutzer-Wunsch „Loop Quantization with Backward Trimming to Nearest Cycle Point“ (ein spät gestoppter Loop verlängert sich heute bis zum nächsten Zyklus) | **WAHRSCHEINLICH** (eine Quelle, SE) | https://roadmap.loopypro.com/feature-requests/p/loop-quantization-with-backward-trimming-to-nearest-cycle-point |
| Q10 | Ein Rückwärts-Fenster („spät gedrückt → voriger Taktstrich“) als Standard eines Loopers oder einer DAW | **UNBELEGT** (nicht gefunden; Bitwig „Launch Tolerance“ ebenfalls nicht gefunden) | – |
| Q11 | Ableton Capture MIDI: Live hört auf scharf geschalteten Spuren dauernd mit, der Capture-Knopf macht daraus einen Clip | **BELEGT** (Hersteller-Hilfe, SE) | https://help.ableton.com/hc/en-us/articles/360000776450-Capture-MIDI |
| Q12 | Cubase/Nuendo: Shared Copies; „Edit > Functions > Convert to Real Copy“ erzeugt eine unabhängig bearbeitbare Fassung | **BELEGT** (Steinberg-Handbuch, SE) | https://archive.steinberg.help/nuendo/v8/en/cubase_nuendo/topics/parts_events/parts_creating_shared_copies_c.html |
| Q13 | FL Studio: „Make unique“ macht einen Clip unabhängig vom Eltern-Clip (Automations-Clips) | **BELEGT** (Image-Line-Handbuch, SE) | https://www.image-line.com/fl-studio-learning/fl-studio-online-manual/html/playlist_automationclip.htm |
| Q14 | FL Studio: „Make unique“ auf einem Pattern-Clip erzeugt ein neues Pattern | **WAHRSCHEINLICH** (eine Sekundärquelle, SE) | https://hub.packtpub.com/using-playlist/amp/ |
| Q15 | Cubase/Nuendo MIDI-Aufnahmemodi: New Parts, Merge, Replace | **BELEGT** (Steinberg-Handbuch, SE) | https://steinberg.help/nuendo/v12/en/cubase_nuendo/topics/recording/recording_midi_record_modes_r.html |
| Q16 | Logic Pro Autopunch + Replace: bestehende Regionen werden an Punch-In/-Out geschnitten, Daten dazwischen gelöscht | **BELEGT** (Apple-Handbuch Logic 9 für Audio + Sekundärquelle für MIDI, SE) | https://help.apple.com/logicpro/mac/9.1.6/en/logicpro/usermanual/chapter_14_section_16.html · https://djmag.com/pointblank/point-blank-tutorial-improve-your-midi-workflow-using-logic-pro-x-s-autopunch-replace |
| Q17 | Ableton Live: „Insert Silence“ schiebt alles rechts der Auswahl nach rechts; „Delete Time“ schließt die Lücke | **WAHRSCHEINLICH** (Forum + Tutorial, SE; Handbuch nicht erreichbar) | https://forum.ableton.com/viewtopic.php?p=1431985 · https://musictech.com/tutorials/ableton-live-tutorial-november-2 |
| Q18 | Logic Flex Time: „Monophonic“ für einstimmiges Material wie Gesang und Bass; „Slicing“ schneidet an Transienten und spielt die Scheiben in Originaltempo, mit „Fill Gaps“ | **BELEGT** (Apple-Handbuch iPad, SE) | https://support.apple.com/en-my/guide/logicpro-ipad/flex-time-algorithms-and-parameters-lpipab631a74/1.0/ipados/16.0 |
| Q19 | Pro Tools Beat Detective: Clip Separation an Transienten, Clip Conform ans Raster, Edit Smoothing füllt Lücken und setzt Blenden | **BELEGT** (Avid + Sekundärquelle, SE) | https://www.avid.com/pro-tools/user-guide/beat-detective · https://www.soundonsound.com/techniques/pro-tools-using-beat-detective |
| Q20 | Ableton Live: Audio-Quantisierung über erkannte Transienten bzw. Warp-Marker | **BELEGT** (2 Sekundärquellen, SE) | https://www.soundonsound.com/node/4908697 · https://flypaper.soundfly.com/produce/how-to-warp-audio-in-ableton-live/ |
| Q21 | Logic Pro 11 hat eine Akkordspur mit „Edit chords“ und „Move and resize chords“ | **BELEGT** nur als Inhaltsverzeichnis (Apple, SE); Einzelheiten **UNBELEGT** | https://support.apple.com/en-ae/guide/logicpro/lgsia129a0b/11.2/mac/14.4 |
| Q22 | BandLab quantisiert Audio | **UNBELEGT** (nicht gefunden) | – |

**Eigene Belege (keine Produkt-Aussagen):** V0a-Code gelesen (Teil 1, Zeilenangaben); Geometrie gemessen (`r7/song-geo/geo.out`); Taktstrich-Regel gerechnet (`r7/song-geo/fang-ende.out`), heutige Spec-Regel gerechnet (`r7/song-geo/fang-ende-spec.out`). Alles in Teil 3–13 außerhalb der „Vorbild“-Sätze ist **eigener Entwurf**.

---

## 16 Offene Fragen an Xander (nicht blockierend; der Bau nimmt die Vorgabe)

| # | Frage (kurz) | Vorgabe |
|---|---|---|
| 1 | Zu spät gedrückt: Zuerst zählt die Phrase (4/8 Takte), sonst die Takthälfte (unter 50 % = voriger Taktstrich). Lieber nur das erste Viertel (25 %)? | 50 % |
| 2 | „Ersetzen“ beim Ablegen löscht in diesen Takten auch die Melodie („komplett“). Passt das? | ja |
| 3 | Clip im Song halten macht **diesen Durchlauf** zum eigenen Clip; den ganzen Block gibt es per [Ganzer Block]. Passt das? | Durchlauf |
| 4 | Soll Stummschalten (M) während FANG TEIL mit eingefangen werden (auf den nächstgelegenen Taktstrich gerundet)? Clip aus/an wird immer eingefangen | nein *(P1)* |
| 5 | Teil-Namen: Intro · Strophe · Pre · Refrain · Bridge · Break · Outro – fehlt einer? | so |
| 6 | Tipp auf die Taktleiste wählt jetzt Takte (gelb) und springt nicht mehr sofort; abspielen mit ▶ oder [▶ Ab hier]. Passt das? | ja |
| 7 | Brauchst du die Teil-Tasten auch in der Song-Ansicht im Hochformat? Sie wären eine zusätzliche Zeile | nein (im Querformat sind sie im Seitenfeld) |
