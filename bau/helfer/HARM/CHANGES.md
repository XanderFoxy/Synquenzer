# HARM – Harmonie-Standard und Läufe (App 4.30.0, Basis R-4300)

Auftrag Xander, 01.11.: „Wenn ich Läufe mache und transponiere, wirkt das manchmal fremd. … Durchgangsnoten immer richtig
auf die Tonhöhe der Skala, in der wir uns gerade bewegen. Transponierung im Taktwechsel logisch auf dem Takt. Sachen, die
essentiell sind, müssen voreingestellt sein.“

Basis `bau/snapshots/R-4300.html` → `bau/helfer/HARM/index.html`. VERSION bleibt `4.30.0`, Format bleibt 5.
Alle geänderten Stellen sind mit `// HARM` (bzw. `/* HARM … */`) markiert, neue Namen beginnen mit `harm…`/`HARM…`.
Diff: `patch.diff` (gegen R-4300).

## 1. Regressions-Suche

### Prüf-Song (`tests/pruefsong.mjs`)
- Synth 1: Sechzehntel-Tonleiterlauf über 1,5 Oktaven hoch und zurück (2 Takte), am Taktende ein chromatischer
  Durchgang und ein Leitton.
- Synth 2: Achtel-Lauf mit diatonischen Durchgangsnoten zwischen Akkordtönen.
- Synth 3: Sechzehntel-Arpeggio 1-3-5-8-5-3.
- Synth 4: Lauf mit **langem chromatischem Durchgang** (Stufe 4 → 4♯ → 5, 0,9 Schläge) – der Fall aus G-P2a.
- Drums: Kick/Snare/Hihat.
- Akkord-Zeile je Takt: A-Moll `Am F C G | Am F Dm E` (i–VI–III–VII und i–VI–iv–V), C-Dur `C Am F G` (I–vi–IV–V),
  A-Moll-Folge `Am F C G` über C-Dur-Bezug.
- Je Fall zweimal: „alt“ (Eine Skala aus, wie ein gespeichertes Projekt) und „os“ (Eine Skala an, 100 %, Einrasten).
  Abgespielt wird erst nach der automatischen Tonart-Analyse (400 ms), so wie man den Song in der App hört.
- Dazu: Offline-Render (`vvRender`, ab 4.26) und Live-Tastatur/MIDI (altes Projekt geladen, Akkorde mitten im Takt).

### Ergebnis: Noten-Log über alle Snapshots (`tests/regression.mjs`, Ausgabe `tests/regression.json`)

Kennung = Hash über (Spur, Schlag, Ton) aller Synth-Noten der 8 Takte; „fremd“ = Töne außerhalb der Skala des Akkords
ihres Takts; „Bezug L3“ = Clip-Tonart von Synth 4 nach der Analyse; okt = Oktavsprünge; kontur = Richtungswechsel
gegenüber dem Original; dr = transponierte Drum-Schläge.

| Fassung | A-Moll alt | A-Moll os | C-Dur alt | C-Dur os | Am–F–C–G über C alt | Am–F–C–G über C os | Offline (os) |
|---|---|---|---|---|---|---|---|
| 4.25.2 | 0ea4bd17 · fremd 11 · äol. | 94cc24f5 · 0 · äol. | 8f1e58f6 · fremd 12 · **lyd.** · kontur 4 | 9f870992 · 0 · **lyd.** | 95494d18 · fremd 12 · **lyd.** · kontur 4 | 285a8e52 · 0 · **lyd.** | – |
| 4.25.3 | gleich | gleich | gleich | gleich | gleich | gleich | – |
| 4.25.4 | gleich | gleich | gleich | gleich | gleich | gleich | – |
| 4.26.0 | gleich | gleich | gleich | gleich | gleich | gleich | 94cc24f5 · Δ0 |
| 4.26.1 | gleich | gleich¹ | gleich | gleich | gleich | gleich | 94cc24f5 · Δ0 |
| 4.27.0 | gleich | gleich | gleich | gleich | gleich | gleich | 94cc24f5 · Δ0 |
| 4.27.1 | gleich | gleich | gleich | gleich | gleich | gleich | 94cc24f5 · Δ0 |
| 4.27.2 | gleich | gleich | gleich | gleich | gleich | gleich | 94cc24f5 · Δ0 |
| 4.28.0 | gleich | gleich | gleich | gleich | gleich | gleich | 94cc24f5 · Δ0 |
| 4.29.0 | gleich | gleich | gleich | gleich | gleich | gleich | 94cc24f5 · Δ0 |
| 4.30.0 | gleich | gleich | gleich | gleich | gleich | gleich | 94cc24f5 · Δ0 |
| **HARM** | 0ea4bd17 · fremd 11 | 94cc24f5 · 0 | 0f9a8097 · fremd 10 · **ion.** · kontur 2 | 01d60909 · 0 · **ion.** | 85c1d9ed · fremd 10 · **ion.** · kontur 2 | 20ded55d · 0 · **ion.** | 94cc24f5 · Δ0 |

„gleich“ = derselbe Hash wie 4.25.2, d. h. jede Note hat dieselbe Tonhöhe. Kein Oktavsprung in keiner Fassung,
Drums nie transponiert. Offline-Render = Live-Log (Δ0 Noten). ¹ Im Parallel-Lauf fehlten bei 4.26.1 einmal 12 Live-Noten
(Last durch drei Browser gleichzeitig); einzeln nachgeprüft: derselbe Hash 94cc24f5.

### Live-Tastatur / MIDI: altes Projekt geladen, Akkorde mitten im Takt gedrückt (1,4 · 6,2 · 9,8 · 13,5 · 17,1 · 22,6)

| Fassung | geladen als | Wechsel bei Schlag | mitten im Takt | fremde Töne | doppelt | hängend | Drums |
|---|---|---|---|---|---|---|---|
| 4.25.2 … 4.30.0 (alle 11) | Sofort / Eine Skala aus | z. B. 1,64 · 6,37 · 9,97 · 13,68 · 17,29 · 22,78 | **6/6** | 12–15 von ≈ 350 | 0 | 0 | 0 |
| **HARM** | Takt / Eine Skala an (umgestellt) | 4 · 8 · 12 · 16 · 20 · 24 | **0/6** | **0** von 347 | 0 | 0 | 0 |

### Eingrenzung über die älteren Snapshots (`tests/bisekt.mjs`)
Clip C D E F **F♯(lang)** G A im C-Dur-Projekt, nach der Analyse, unter E-Dur, Eine Skala an:

| Fassung | Bezug nach Analyse | C D E F F♯ G A klingt unter E als |
|---|---|---|
| 4.5.0, 4.5.1 | C-Lydisch | E F♯ G♯ **G♯ G♯** … (64 66 68 68 69 71 73 – F und F♯ fallen zusammen) |
| 4.6.0 … 4.30.0 (19 Fassungen geprüft) | C-Lydisch | **D♯** E F♯ G♯ A H C♯ (63 64 66 68 69 71 73 – der ganze Lauf eine Stufe tiefer) |
| **HARM** | **C-Dur** | **E** F♯ G♯ A H C♯ D♯ (64 66 68 69 71 73 75 – Grundton bleibt Grundton) |

### Befund
1. **Zwischen 4.25.2 und 4.30.0 hat sich nichts geändert.** Abbildung (`Harmony.mapNote`, `oneScale`, `oneScaleMap`),
   Transposer, Wechsel-Planung und Tonart-Analyse sind in allen elf R-4-Snapshots Zeichen für Zeichen gleich; das Noten-Log
   ist bitgleich. Es gibt keine Versions-Regression in diesem Bereich.
2. Dass es „manchmal fremd“ klingt, hat drei Ursachen, die es schon länger gibt:
   - **a) Wechsel „Sofort“ war Standard** (`settings.harmony.change: 'now'`). Ein Akkord, der mitten im Takt gedrückt wird
     (Tastatur, MIDI, auch ein Akkord, der etwas vor dem Taktstrich aufgenommen wurde), schaltet mitten im Lauf die Skala um.
     Live: 6 von 6 Wechseln mitten im Takt.
   - **b) „Eine Skala“ war für gespeicherte Projekte aus** (`normalizeProject`: `normBool(h.oneScale, false)`; nur
     `newProjectRaw` schaltete sie an, die Demo blieb aus). Chromatische Durchgänge und Leittöne bleiben dann außerhalb der
     Skala des Akkords (10–15 fremde Töne im Prüf-Song).
   - **c) Echter Fehler – die verzögerte Tonart-Analyse stuft den Clip-Bezug wegen eines Durchgangstons um.**
     `applySceneKeys` → `KeyDetect.sceneKey` / `resolveClipKey` zählen einen langen chromatischen Durchgang (F → F♯ → G)
     wie einen Leiterton; `bestMode` wählt dann C-Lydisch statt C-Dur. Die Abbildung arbeitet danach mit F♯ als Stufe 4 und
     F als „fremd“; der Kollisionsschutz von „Eine Skala“ (`oneScaleMap`, seit 4.6.0) schiebt dann den ganzen Lauf eine Stufe
     nach unten (unter E: C → D♯). „Manchmal“, weil die Analyse erst 400 ms nach dem Bearbeiten bzw. nach dem nächsten
     ORIGINAL läuft (`scheduleAutoKey`, `R.keyPending`): der erste Durchlauf klingt richtig, die folgenden nicht.
     Der vorhandene Test `bau/tests/v3-qa-gp2a-os.mjs` (OS2, OS3) ist deshalb in allen R-4-Snapshots rot.
     Stelle: `scenePartsOf` / `shownClipKey` (Eingabe der Analyse) im Block „scene keys“; die Abbildung selbst ist richtig.

## 2. Behebung (Ursache c)
- Neu `harmKeyNotes(ns)`: ein Ton **außerhalb der Projekt-Tonart, genau zwischen zwei Tonart-Tönen im Ganztonabstand, durch
  den die Linie in einer Richtung läuft** (F → F♯ → G, G → F♯ → F, D → D♯ → E in a-Moll), zählt nicht für die Tonart-Analyse.
  Benutzt in `scenePartsOf` (Szenen-Tonart und Clip-Bezug) und `shownClipKey` (Anzeige). Die Noten selbst bleiben unverändert.
- Gegenproben (T5): ein echtes C-Lydisch (F♯ ohne F) bleibt Lydisch, ein e-Moll-Lauf behält F♯ als Leiterton, a-Moll mit
  D♯-Durchgang bleibt a-Moll. Abwärts A G F♯ F E D C: Bezug a-Moll (Tonvorrat von C-Dur, ohne F♯; vorher a-Dorisch mit F♯).
- Folge für alte Projekte: Clips mit Bezug „automatisch“ werden beim Laden ohnehin neu analysiert; ein Clip, der wegen eines
  Durchgangs als Lydisch/Dorisch/Mixolydisch eingestuft war, bekommt jetzt den Bezug der Tonart, in der er wirklich steht.
  Ein von Hand gesetzter Bezug (`src` ≠ `auto`) bleibt unberührt.

## 3. Neue Standards (für alle Projekte, Xander 01.11. – überholt Regel 28 genau für diese Werte)

| Einstellung | vorher (Standard bzw. alte Projekte) | jetzt Standard |
|---|---|---|
| Wechsel (`change`) | Sofort (`now`) | **Takt (`bar`)** – ein neuer Akkord wirkt am nächsten Taktstrich; ein laufender Lauf bleibt bis dahin in seiner Skala |
| Eine Skala (`oneScale`) | neue Projekte an, gespeicherte + Demo aus | **an**, überall |
| Stärke (`osAmt`) | 100 % | **100 %** |
| Durchgangstöne (`osPass`) | Einrasten | **Einrasten** – jeder Durchgang landet in der Skala des Akkords, der gerade gilt |
| Oktave | Nächste | Nächste (unverändert, geprüft: kein Oktavsprung) |
| Drums mittransponieren | aus | aus (unverändert; eine bewusste Wahl im Projekt bleibt) |

- `defaultSettings().harmony`: `change: 'bar'`, `oneScale: true`, neues Feld `harmStd: HARM_STD` (= 1).
- **Einmalige Umstellung mit Merker** (`normalizeProject`): ein Projekt ohne `harmStd` (alle bisher gespeicherten Projekte,
  Autosave, Dateien, Cloud, Demo) bekommt einmal Wechsel = Takt, Eine Skala an, 100 %, Einrasten und den Merker
  `harmStd: 1`. Hinweis „Harmonie-Standard: Wechsel am Takt · Eine Skala an. Umstellen: Menü → Harmonie“ (auch beim Start
  mit dem Autosave), das Projekt wird als geändert markiert, damit der Merker gespeichert wird. Mit Merker bleibt jede gespeicherte
  Wahl (auch Sofort, Eine Skala aus, 60 %, Erlauben) erhalten; ein Merker einer neueren Fassung (> 1) wird nie zurückgestellt.
- Menü › Harmonie: die Zeilen bleiben änderbar; unter „Wechsel“ und unter „Durchgangstöne“ steht ein kurzer Hilfetext.
  Die Knöpfe der Zeilen Wechsel, Oktave, Eine Skala, Durchgangstöne, Drums sind jetzt 44 px hoch (vorher 40 px).
- Test-API: `SYNQUENZER.harmInfo()` → `{std, val, migrated, last, cur}`.

## 4. Geprüft (alles am Takt, keine hängenden/doppelten Noten) – siehe STATUS.md
Tastatur-Transposition, MIDI-Eingang (`onMidiMsg`), Gnadenzeit (knapp nach dem Taktstrich = dieser Takt), Szenen-Wechsel,
Clip-Wechsel, Teil-Wechsel über die Teile-Leiste mit Teil-Akkordzeile, Song-Akkordzeile, ▶ Ab hier, Drums (auch North-Pads)
nie transponiert, Gegenprobe „Drums mittransponieren“ an.
Die Song-Akkordzeile spielt ihre Akkorde weiter genau an der geschriebenen Stelle (das Raster 4/2/1 Schläge ist gewollt);
mit Wechsel = Takt landen neu eingespielte Akkorde ohnehin auf dem Taktstrich.

## 5. Vorhandene Tests, deren Erwartung die neuen Standards bewusst überholen
- `bau/tests/v3-v2c2-onescale.mjs` V2c′-04 „Demo → aus, gespeichertes Projekt ohne Feld → aus“: jetzt **an** (Standard 01.11.).
- `bau/tests/v3-qa-v2c2reg-os.mjs` recCar/recCarChr `car`: liest die Tastatur-Skala zwei Schläge nach dem Akkord-Druck –
  mit Wechsel = Takt gilt der Akkord erst am Taktstrich; Aufnahme und Gehörtes sind gleich.
- `bau/tests/v3-qa-gp2a-os.mjs` OS0 meldet weiter „an“; OS2/OS3 waren in allen R-4-Snapshots rot und sind mit HARM grün.
- Unverändert rot (schon in R-4300, unabhängig von HARM): V2c′-04 „aus … bitgleich zu 4.5.2“ (Vergleichsdatei 4.5.2 fehlt,
  der Lauf vergleicht gegen R-4300), V2c′-06 „Version 4.5.3“ (erwartet eine alte Versionsnummer).
