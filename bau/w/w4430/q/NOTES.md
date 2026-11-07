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
- Mess-Durchlauf (236 Ansichten × 6 Größen: alle Editor-Seiten jeder Klangerzeugung inkl. MS 2000-/North-Platte, Drum-Editor Drums+North, Clip/Roll/Quant/Sounds, Song-Blätter Teil/Marke/Zelle, Mix, Menü ≡ und seine Blätter, ~45 Popups): vorher 37 Ansichten mit abgeschnittenen, nicht erreichbaren Elementen (quer), nachher 0 – Bericht `report.md`.
- Echter Finger-Wisch (CDP-Touch): Seite NORTH rollt, Drum TIEF rollt, Regler im rollenden Körper dreht weiter (Körper rollt dabei nicht), App/Matrix/Song rollen nicht.
- topdefs: 0 Syntaxfehler, 0 doppelt (+3 neue Namen: qf1Fit, qf1Head, qf1PopScr). smoke: errors []. Markenwörter 0, „MS 2000“ 1×, „  live: true,“ 1×.
