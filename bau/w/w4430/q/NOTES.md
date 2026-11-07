# QF1 – Querformat: nichts abgeschnitten, ✕ immer da

**Für Xander:**
Wenn du das iPhone quer drehst, wird jetzt nichts mehr unten abgeschnitten: Passt eine Seite trotz Verdichtung nicht ganz (quer mit Safari-Leisten), rollt nur der Inhalt darunter mit dem Finger – Kopf, Reiter und ✕ bleiben oben stehen.
Die Seite NORTH der Perkussionsspur ließ sich vorher mit dem Finger gar nicht rollen, jetzt geht es; das FM-Feld passt quer wieder ganz drauf.
Das ✕ steht quer in jedem Editor am selben Platz ganz rechts (vorher wanderte es je nach Klang), und hochkant verschwindet es bei Drums mit North auf SCHRITTE nicht mehr rechts aus dem Bild.

**Technisch (alles im Block „QF1“, VERSION/CHANGES unberührt):**
- `fitBody` → neu `qf1Fit`: reicht auch fit3 nicht (Rest ≥ 3 px), bekommt `.sh-body` die Klassen `qf1s pan-y` → `overflow-y:auto`, `touch-action:pan-y`, `overscroll-behavior:contain`, kein Balken. Nur Synth-/Drum-Editor; passt alles, keine Änderung. Gemessen aktiv nur quer 926×370 (FX MASTER aller Klangerzeugungen +3 px, Drum TIEF +6 px).
- Gleiche Seite neu aufgebaut (Wert getippt, `safeRebuild`) → Scroll-Stand von Körper und `.pg.pan-y` bleibt (`sheetFrame` merkt Spur|Reiter|Unterreiter).
- Touch-Wächter des Synth-Blatts lässt `.pan-y` durch (vorher blockierte er die seit 4.40.0 rollende Seite NORTH – auf dem iPhone ging sie nie zu rollen; im echten Touch-Test: Basis 0 px, jetzt 89 px).
- FM-Feld quer (`fxGeo`, L1/L2): ist das Feld niedriger als 4 Reihen, erst weniger Rand oben, dann Abstand/Kachel maßvoll kleiner (34→33 px bei 926×370; immer 4 Reihen). Die Werte-Spalte rollt quer wie hochkant (`.fxv.scr`), statt unten abzuschneiden.
- `guardTouch`: ein `.pop`, das höher ist als der Schirm, rollt mit dem Finger (`qf1PopScr`); `.pop{overscroll-behavior:contain}`.
- Quer: ↶ ↷ ✕ in jedem Editor-Blatt am rechten Rand (`.r1 > .ur:not(.ur ~ .ur){margin-left:auto}` – die alte Regel `.sh-sp + .ur` griff nicht mehr, sobald ⋯/Platte davor eingefügt wurden). ✕ jetzt bei VA, North, Drums, BM, FM, WT gleich (x = 880 bei 926 px).
- Hochkant: Kopfzeile 1 zu breit (`qf1Head`) → FOLGT-Chip in der vorhandenen Kurzform, 4 px Abstand; reicht das nicht, bleibt das ✕ `sticky` rechts, die Zeile davor wischt seitlich (`pan-x`). Vorher lag das ✕ in 9 von 16 gemessenen Hochkant-Zuständen außerhalb des Schirms (428 px: Drums+North auf SCHRITTE).
- MS 2000-Platte und North-Platte unverändert (eigene Wisch-/Zoom-Gesten; ✕ dort quer links oben – Vorschlag für den Funk: auch nach rechts?).

**Tests:**
- Mess-Durchlauf (236 Ansichten × 6 Größen: alle Editor-Seiten jeder Klangerzeugung inkl. MS 2000-/North-Platte, Drum-Editor Drums+North, Clip/Roll/Quant/Sounds, Song-Blätter Teil/Marke/Zelle, Mix, Menü ≡ und seine Blätter, ~45 Popups): vorher quer 21 Seiten×Größen mit abgeschnittenen, nicht erreichbaren Elementen (144 Elemente) und hochkant 8 Fälle mit ✕ außerhalb des Bildes – nachher 0 / 0, keine JS-Fehler, App rollt nirgends – Bericht `report.md`.
- Echter Finger-Wisch (CDP-Touch): Seite NORTH rollt, Drum TIEF rollt, Regler im rollenden Körper dreht weiter (Körper rollt dabei nicht), App/Matrix/Song rollen nicht.
- topdefs: 0 Syntaxfehler, 0 doppelt (+3 neue Namen: qf1Fit, qf1Head, qf1PopScr). smoke: errors []. Markenwörter 0, „MS 2000“ 1×, „  live: true,“ 1×.
  (nach der Gegenprüfung: +6 neue Namen, siehe unten)

**Gegenprüfung (QF1, 07.11.):**
Für Xander: Wo eine Seite quer innen rollt, schützt ein gehaltener Regler wieder wie vorher vor der iPhone-Lupe (Halten = modulieren); gerollt wird mit dem Finger neben den Reglern. Hochkant bei 390 px steht neben dem Punkt kein einzelner Strich mehr vom abgeschnittenen Titel.
- Befund: Der rollende Körper (`.qf1s.pan-y`), die Seite NORTH und ein überhohes `.pop` ließen jeden `touchstart` ungebremst durch, auch auf Reglern (`touch-action:none`). Damit fehlte dort der Lupen-Schutz, den Basis 4.42.0 auf jedem Regler hat (gemessen: Basis `defaultPrevented` = true, Kopie = false). Behoben mit `qf1Ctl`/`qf1Knob`/`qf1Pan`: Ein Ziel mit `touch-action:none` zwischen Finger und rollender Fläche wird wie bisher geblockt; es rollt dort ohnehin nicht. Gilt für `guardTouch` (nur innerhalb `.qf1s`, sonst wie Basis), `qf1PopScr` und den Wächter des Synth-Blatts.
- Befund: Hochkant 390 px, Drums auf SCHRITTE: Der kürzere FOLGT-Chip ließ dem Titel 4 px, sichtbar war nur der Strich des „D“. Neu: Ist der Titel schmaler als 24 px, wird er ausgeblendet (`.r1.qf1t`), so wie vorher bei 0 px. Bei 428 px steht weiter „D…“.
- Bleibt (Risiko, nicht geändert): Hochkant bei Drums mit North auf SCHRITTE liegt ↷ unter dem festen ✕ (428: 26 px, 390: 41 px zu breit). Man erreicht es nur durch seitliches Wischen der Kopfzeile. Das ✕ hat Vorrang.
- Tests Gegenprüfung (`mess/gp/`): voller Mess-Durchlauf auf der Endfassung, 6 Größen × 236 Ansichten: 0 Befunde, ✕ 0, App rollt 0, JS-Fehler 0 (`n2a/b/c.json`). Hochkant Pixelvergleich Basis gegen Kopie über alle 472 Ansichten: Abweichungen nur in der Drum-Kopfzeile (gewollt) und in Animationen (LFO, Platten-LED); `edpop:alg` ist beim Einzelaufruf gleich (`alg.mjs`). `lupe.mjs`: Regler geblockt (wie Basis), Rand rollt (Körper 6 bzw. 3 px), Regler dreht und Körper steht. `rand.mjs`: Undo/Redo im rollenden Körper behält Wert, Scroll-Stand und `qf1s`; Drehen hochkant → quer → 370 → hochkant setzt die Kopfzeile richtig (✕ trifft immer, quer x = 880); `serializeProject` enthält nichts von QF1. touch1, touch2 und keep1 erneut grün. topdefs: 0 Syntaxfehler, 0 doppelt (+6 Namen gegenüber Basis). smoke `errors []`. Markenwörter 0, „MS 2000“ 1×, „  live: true,“ 1×.
