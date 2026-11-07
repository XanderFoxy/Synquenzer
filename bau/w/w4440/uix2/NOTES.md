# UX2 – Spuren/Clips/Szenen per Ziehen umordnen, Kopieren/Einfügen mit Lupe

## 1. Für Xander (was du siehst, wie du es ausprobierst)

- **Spur verschieben:** Finger ganz links auf den Farbbalken einer Spur (linker Rand), nach **rechts** ziehen → die Spur hebt sich ab. Dann hoch oder runter, eine orange Linie zeigt den neuen Platz, loslassen. Clips, Klang, Effekte und Song gehen mit. DRUMS bleibt unten. Lautstärke-Wischen, Halten = Solo und mehrere Solos funktionieren wie vorher (auch am Rand: Halten = Solo, nach links = leiser).
- **Clip verschieben/tauschen:** Clip halten, bis er größer wird und das Kreuz mit vier Pfeilen zeigt. Ohne Bewegung loslassen = das Clip-Blatt wie bisher. Ziehen auf ein leeres Feld = verschieben, auf einen Clip = tauschen. Ein **zweiter Finger** irgendwo = Kopie (oben am Clip steht „⧉ Kopie“). In derselben Spur bleibt der Song gleich.
- **Szene verschieben:** Finger an den **oberen Rand** eines Szenen-Kopfs (▶ 2, oberste 12 px) und nach **unten** ziehen → die Szene hebt sich ab. Nach links/rechts ziehen, loslassen. Im Hochformat blättert [SZ] um, wenn du kurz darauf stehen bleibst. Song und Teile spielen danach genau wie vorher, die Nummern rücken nach.
- **Kopieren/Einfügen mit Lupe (Noten-Editor ✎):** unten [Kopieren] (Auswahl, sonst alle Noten), dann in einem anderen Clip oder einer anderen Spur [Einfügen]. Die Noten erscheinen orange als Vorschau. Mit dem Finger an die gewünschte Stelle schieben (eine Lupe über dem Finger zeigt das Raster und die Stelle, z. B. 2.1.1), dann [✓ Einfügen]. [Dupl.] (hinter die Auswahl) bleibt wie es war.
- Jede Aktion = ein Schritt für ↶.

## 2. Technik

**Neuer Block `/* UX2-BEGIN … UX2-END */`** (vor „menu (§2.5, §12.2)“), Präfix `ux2`:
- `UX2` (Zustand/Konstanten: EDGE 14 px, TOPZ 12 px, MOVE 10 px, LIFT 12 px, HOLD 440 ms, SPRING 450 ms), `UX2_MOVE_SVG` (Zieh-Symbol als SVG).
- Spur-Reihenfolge: `ux2OrderFit(n)`, `ux2OrderOk`, `ux2OrderPut`, `ux2MoveTrack(i, pos)` – nur `S.ui.order` (Anzeige), DRUMS bleibt letzte Zeile (wie `normalizeProject` es verlangt). Kein neues Projektfeld.
- Zellen: `ux2CellOk`, `ux2Exchange`, `ux2DoExchange` (leer ↔ Clip = verschieben, Clip ↔ Clip = tauschen; gleiche Art und gleiche STIMME-Eigenschaft), `ux2DoCopy` (Clip-Undo `pushUndo`, wie `pasteClip`).
- Verweise: `ux2Walk`/`ux2Remap(fs, fp)` schreiben Szenen-Plätze um in `S.song` (lanes, own.from s/e/prev, marks.part „S n“, off/dn-Einträge, Konsolidierungen) und `S.parts` (slots, lanes, own) sowie Laufzeit (`R.slot/pend/prev`, `MEM.ev`). Gleiche Spur: Tausch der beiden Plätze dieser Spur; Szenen: Permutation.
- Szenen: `ux2ScenePerm(arr)`, `ux2MoveScene(from, to)` – Clips aller Spuren, `S.scenes` (uid, Name, Akkord-Zeile) wandern; Standard-Name „Szene n“ nimmt die neue Nummer an; `R.selS`, `R.lastScene`, `R.row/rowPend.src`, `KETTE.chain` folgen.
- Undo-Art `'ux2'`: `ux2UndoState`/`ux2UndoApply` (op `o` = Reihenfolge als Zustand, `x` = Tausch selbst-invers, `s` = Permutation/Gegen-Permutation); `HIST.kind('ux2', …)` für den VC2a-Rekorder.
- Gesten auf `document` (Einfangphase, `pointerdown/move/up/cancel`): `ux2Down/ux2Move/ux2Up/ux2Cancel`, `ux2Start` (Geist = Klon, Quelle gedimmt, Linie), `ux2Paint` (Ziel, Linie, Etikett), `ux2Spring` ([SZ] 450 ms, [▲▼] 700 ms), `ux2Drop`, `ux2Clean`; `click`-Fresser für den zweiten Finger. Die SX4-Geste wird nur beim „nach rechts aus dem Rand“ mit `sx4End(null)` beendet; Clip-Halten übernimmt `UI.slotPress` (dead + `slotProvRevert`) und öffnet das Clip-Blatt beim Loslassen.
- Test-API `UX2_API`: `ux2Order, ux2MoveTrack, ux2Exchange, ux2Copy, ux2MoveScene, ux2Info, ux2Roll, ux2RollCopy, ux2RollPaste`.

**Noten-Editor `/* UX2P-BEGIN … UX2P-END */`** (in `PianoRoll.create`, nach [Dupl.]): Knöpfe [Kopieren] [Einfügen], Ablage `create.ux2` (für alle Rollen gemeinsam, Art `note`/`perc` getrennt), Einfüge-Modus mit Überlage `.ux2p-ov` (Finger setzt/zieht den Punkt, Raster, Rand rollt mit), Geist-Leinwand, Lupe `.ux2p-lupe` (2,5×, am `document.body`, nur während des Ziehens), Leiste [Einfügen bei x.y.z] [✓ Einfügen] [✕]; ein `model.begin/end`-Schritt. `acts._ux2p` für die Test-API.

**Einhänge-Zeilen (je eine, mit Kürzel):** `undoState` (erste Zeile), `undoApply` (erste Zeile, `… else`), `restoreTrack` (`orderFor(NT())` → `ux2OrderFit(NT())`, damit ＋ Spur / Spur entfernen die eigene Reihenfolge behält – einzige geänderte Basiszeile), PianoRoll-`draw()` (`ux2pFrame(C)` vor `onRender`), Test-API (`Object.assign(SYNQUENZER, UX2_API)` vor `NO_SYNC`).

**CSS `/* UX2-CSS-BEGIN … END */`** (vor NDP-CSS): `.ux2gh`, `.ux2bd`, `.ux2src`, `.ux2ln`, `.slot.ux2lift/.ux2mvw`, `.slot.ux2tg/.ux2sw/.ux2cp/.ux2no`, `.ux2p-ov`, `.ux2p-lupe`, `.ux2pb` (Trefferfläche ≥ 44 px wie n1b), **`#clipGrid{touch-action:none}`** (sonst bricht der Browser das Ziehen an Szenen-Köpfen/Rand mit pointercancel ab).

Keine Formatänderung, kein neues Projektfeld, VERSION/CHANGES unberührt.

## 3. Tests

- `ux2-test.mjs` (echte Touch-Ereignisse über CDP, 428×926 und 926×428): **41/41 OK** – u. a. Wisch-Lautstärke, Halten = Solo, Mehrfach-Solo, Halten im Rand = Solo, Tipp wählt; Spur vom Rand ziehen (Reihenfolge, Lautstärke unverändert, Speichern/Laden, ＋ Spur, ↶, DRUMS bleibt); Clip halten = Zieh-Symbol + Blatt wie bisher; verschieben (Song-Bezug folgt), tauschen, Kopie mit zweitem Finger (auch vor dem Ziehen), zweiter Finger löst nichts anderes aus; Szene von oben ziehen (Clips, Namen, Song-Bezüge, startet nichts), Tipp oben startet beim Loslassen, Mitte startet weiter beim Aufsetzen; `undoRedoCheck` = true; Wiedergabe läuft bei Tausch/Szenen-Umzug ohne Bruch weiter; Einfügen mit Lupe (Lupe sichtbar, Raster, verschwindet beim Loslassen, ✓ = ein Undo, ↶), Leiste ✓/✕ ≥ 44 px und sichtbar, Editor-✕ sichtbar; keine Konsolenfehler.
- Fotos: `ux2-spur-ziehen-hochkant.png`, `ux2-clip-tauschen-hochkant.png`, `ux2-einfuegen-lupe-hochkant.png`, `ux2-szene-ziehen-quer.png`.
- Pflicht: topdefs 0 Syntaxfehler, 0 doppelt (Namen 4951 → 4984); smoke `errors []`; Marken 0, „MS 2000“ 1, `^  live: true,` 1; HIST.unknown leer.

## 4. Offen / Risiken

- **Safari (nicht als Home-Bildschirm-App):** Wischen ganz vom Bildschirmrand kann iOS als „Zurück“ deuten. Die Randzone reicht 22 px (hochkant) ins Bild – etwas weiter innen ansetzen hilft; als Home-App kein Thema.
- **Zeitverhalten geändert (bewusst, wie im Song-Ziehen V2e′):** Clip halten öffnet das Clip-Blatt jetzt beim Loslassen statt nach 450 ms unter dem Finger. Ein Tipp in die obersten 12 px (bei flachen 32-px-Köpfen 9 px) eines Szenen-Kopfs startet beim Loslassen (knapp < 0,35 s vor dem Taktstrich wie bisher beim Aufsetzen); die Mitte startet unverändert beim Aufsetzen.
- **Clip in eine andere Spur verschieben/tauschen:** Song und Teile zeigen weiter auf die Zellen (sie können einer anderen Spur nicht folgen) – der Song spielt dort dann, was jetzt in der Zelle liegt. In derselben Spur folgt alles.
- **DRUMS** lässt sich nicht verschieben (Datenregel: DRUMS ist die letzte Zeile, auch Seiten/Song-Ansicht bauen darauf).
- **Song-Ansicht:** Spuren dort nicht ziehbar (folgt aber der Reihenfolge). Mehrfachauswahl per Ziehen in der Matrix nicht gebaut.
- `#clipGrid{touch-action:none}` gilt für die ganze Matrix (sie scrollt nicht; Doppeltipp-Zoom war schon aus).
- Merge: der Szenen-Umschreiber erfasst neue Song-/Teil-Felder automatisch, wenn sie Spur-Einträge als `{bar, slot}` bzw. `from:{t, s}` speichern; ein paralleles Paket mit anders benannten Szenen-Verweisen müsste in `ux2Walk` ergänzt werden.
