# VK4 – Video-Matrix wie in der App (Konzept V4)

## Für Xander

- Die Matrix im Video sieht jetzt aus wie die Matrix in der App. Jeder Clip hat seine Spurfarbe, und in jedem Clip stehen die kleinen Noten. Drums erscheinen als Schlag-Raster, so wie du es aus der App kennst.
- Ein laufender Clip ist wie in der App markiert: grüner Rahmen, ■ in der Spurfarbe, Fortschritt unten, „1/2“. Dazu kommt ein dünner Laufstrich durch die Noten, und was gerade klingt, leuchtet voll auf.
- Drum-Clips glühen bei jedem Schlag kurz auf. Ein fester Schlag glüht hell, ein leiser nur schwach.
- Die Spurköpfe zeigen Name, Klang und ⇅ bzw. Schloss wie in der App. Das Video wird dadurch nicht langsamer, das Zeichnen der Matrix geht sogar schneller als vorher.

## Technisch (nur `index.html`, Kürzel VK4, ein zusammenhängender Abschnitt)

- **`vvDrawMatrix` neu gezeichnet.** Das Layout `vvMatrixLayout` ist unverändert, deshalb bleiben Kamera, `vvMatrixCells` und die Pegel (VV4-F) wie sie sind.
  - **Szenen-Tasten (`.scn`):** erhabene Taste mit ▶ in Grün, Nummer und Szenen-Tonart darunter (`sceneKeyOf`/`keyShort`). Der grüne Rahmen erscheint nur, wenn die ganze Szene läuft (`.scn.full`), wie in der App.
  - **Spurköpfe (`.th`):** Farbstreifen, NAME (12 px), Klang (`soundLabel`, 10 px), unten rechts ⇅ / FEST / Schloss / Mikro. Eine stumme Spur ist durchgestrichen und ihre Clips sind auf 55 % gedimmt.
  - **Clips (`.slot.filled`):** Spurfarbe mit 22 %, Mini-Noten mit 60 % (Einzug 3/3/14/3 wie `.slot .mini`), „4T“, ◆ bei Klangzustand. Ein leeres Feld ist gestrichelt.
  - **Laufender Clip:** grüner 2-pt-Rahmen, Fortschritt in der Spurfarbe über dem Rahmen (`.pg`), ■, „n/len“. „4T“ macht Platz, wenn beides nicht passt, nach der App-Regel. Neu sind der dünne Laufstrich und die klingenden Noten mit 100 %.
- **Mini-Noten:** `vk4MiniRects` liest die Rechtecke aus `miniSvg`, der Funktion, die in der App-Matrix die Noten malt. Damit stimmt das Aussehen genau mit der App überein, und es gibt keine zweite Kopie der Geometrie. Note j entspricht Rechteck j (höchstens 160).
- **Bilder-Cache (`vk4Put`):** Jede ruhende Clip-Zelle, jeder Spurkopf, jede Szenen-Taste und das leere Feld werden einmal in ein Offscreen-Canvas in Video-Pixelgröße gezeichnet und danach 1 : 1 auf ganze Pixel kopiert.
  - Das gilt für 16:9 (3 px/pt), für 9:16 Kamera ohne Zoom (5⅓), für 9:16 Balken (1,69) und für die Vorschau.
  - Schlüssel: `clipSig`, Farbe, Größe, Name, Klang, Stumm. Höchstens 8 Mpx, die ältesten fallen zuerst heraus (Breite 0, damit iOS den Speicher sofort freigibt). Wenn die Schriften nachladen (`C.gen`), wird der Cache geleert.
  - Während die 9:16-Kamera zoomt, wird direkt gezeichnet, denn skaliertes Kopieren großer Bilder war messbar teurer als das Zeichnen selbst.
  - Was außerhalb des Kamera-Fensters liegt, wird nicht gezeichnet.
- **Drum-Glühen (`vk4Glow`):** Gewertet wird der stärkste Schlag der letzten 0,16 s, Glühen = Anschlag × (1 − Δt/0,16)².
  - Quelle im Video ist das Noten-Log des Offline-Durchlaufs (`src.nt`, wie VV3/VK3, also so, wie es klingt). In der Live-Vorschau ohne Durchlauf sind es die Schläge des Clips.
  - Sichtbar als Lichthof im Spalt um die Zelle, als hellere Zellfarbe und als weißer Blitz auf dem gerade gespielten Schlag.
  - Kein Zufall und keine Uhr: Das Bild ist deterministisch.
- `vvDrawSong` und alle anderen Ansichten sind nicht angefasst. Neue globale Namen: `VK4`, `VK4_D`, `VK4_PX`, `vk4Vis`, `vk4In`, `vk4Clear`, `vk4Put`, `vk4MiniRects`, `vk4Glow`, `vk4Cell`. `VK4.probe` ist die Test-Sonde.

## Tests

Die Skripte liegen in `tests/`, die Bilder in `vk4-out/` und `vk4-zeit/`. Die wichtigsten Bilder liegen als `vk4-*.png` hier im Ordner.

- **`vk4-test.mjs` (kleiner Song, 8 Spuren, Regie Matrix): alles grün.**
  - Laufposition je laufendem Clip.
  - Kick-Glühen 0,87, das nach 0,2 Schlägen auf 0,11 abklingt. Ein leiser Hi-Hat glüht mit 0,33, weniger als der Akzent.
  - 8 Spurnamen.
  - Gleiches Standbild zweimal.
  - Cache: 961 Treffer bei 78 Fehlschüssen.
  - Mini-Rechtecke gleich `miniSvg`.
  - Echter WebCodecs-Render 16:9 und 9:16; Einzelbilder ausgelesen mit ffmpeg.
- **`vk4-extra.mjs`: alles grün.**
  - STIMME-Take als Wellen-Clip, stumme Spur, ◆, 9:16 Kamera mit Zoom bis 1,84 (2,1 ms/Bild, 2 Mpx Cache), 9:16 Ganze App unberührt.
  - Live-Vorschau Matrix.
  - Zwei Durchläufe ergeben dasselbe Bild, sofern die Pegel ausgeblendet sind (siehe Risiko).
- **Zeit je Bild, gemessen direkt nacheinander (Basis 4.42.0 → VK4):**

  | Ansicht | Basis | VK4 |
  |---|---|---|
  | 16:9 | 3,4–4,5 ms | 2,3–2,4 ms |
  | 9:16 Kamera | 2,7–3,1 ms | 1,9–2,3 ms |
  | 9:16 Balken | 3,3–3,5 ms | 1,4–1,5 ms |

  - Das erste Bild kostet einmalig 15–30 ms, weil dann die Bilder entstehen.
  - Video Takt 1–4 (≈ 340 Bilder) je Bild: Basis 9,3–13,9 ms, VK4 7,5–10,5 ms. Der Render wird also nicht langsamer.
- **Pflichtprüfungen:**
  - topdefs: 0 Syntaxfehler, 0 doppelt (+10 neue Namen).
  - smoke: errors [] (`smoke.png`).
  - Markenwörter 0, „MS 2000“ 1×, „  live: true,“ 1×.

## Risiken / Vorschlag

- **Fund aus der Basis, nicht von VK4:** Die Pegelbalken im Video (VV4-F, Meter-Fenster des Offline-Renders) unterscheiden sich zwischen zwei Durchläufen leicht. Ohne Pegel sind die Bilder bitgleich.
- **Vorschlag für den Funk:** In 9:16 Kamera liegen die Spurnamen oft außerhalb des Fensters. Das ist das Kamera-Verhalten wie bisher, die Zeilen bleiben an der Spurfarbe erkennbar. Ein schmales, mitlaufendes Namensschild am linken Fensterrand wäre möglich. Gebaut habe ich es nicht, weil es das Bild sichtbar ändert.
- **Kleine Abweichungen von der App:**
  - Bei Perkussion steht im Kopf „FEST“ statt „folgt nicht“.
  - Die Auswahl (gewählte Spur/Zelle) wird im Video nicht gezeigt, wie bisher.

## Gegenprüfung VK4 (Bilder angesehen, Tests neu, kleine Fehler behoben)

- **Für Xander:** Die Matrix im Video passt zur App (Farben, Mini-Noten, Drum-Raster, Laufstrich, Glühen). Drei kleine Dinge habe ich nachgebessert: Die STIMME-Zeile zeigte im Kopf einen Synth-Klang („VA · INIT …“), jetzt steht dort „Audio“ wie in der App. Außerdem stürzt das Video nicht mehr ab, wenn der iPhone-Speicher für Bilder knapp wird, und der Bild-Speicher der Matrix wird beim Schließen des Video-Blatts freigegeben.
- **Geprüft und in Ordnung:** echte Spurfarben (`--tNa` = Spurfarbe 22 %), Mini-Noten = Rechtecke von `miniSvg` (Einzug 3/3/14/3, 60 %), Drum-Raster (12 Pad-Zeilen), Laufposition auch bei 3/4-Clips („2/2“ an der richtigen Stelle), Glühen nach Anschlag, `.scn.full` wie in der App, leerer Song (16:9, 9:16 Kamera, 9:16 Balken, Vorschau vor dem Start) ohne Fehler.
- **Basis-Befund bestätigt:** Auch in 4.42.0 unterscheiden sich die Pegelbalken zwischen zwei Renders (mit Pegel ungleich, ohne Pegel bitgleich – in Basis und Kopie gleich).
- **Tempo nachgemessen (ms je Bild, gleiche Maschine):** Basis 3,7 / 3,3 / 3,1 → VK4 2,4 / 2,0 / 1,6 (16:9 / 9:16 Kamera / 9:16 Balken). Video-Render je Bild gleich oder schneller.

**Behoben (VK4):**
- `vk4Put`: `getContext('2d')` liefert auf iOS `null`, wenn der Canvas-Speicher voll ist → vorher `TypeError` und Abbruch des Videos. Jetzt: Bilder frei (`vk4Clear`), `VK4.noc = true`, direkt zeichnen (wie beim Kamera-Zoom).
- `vvClose`: eine Zeile `vk4Clear(1)` – die Bilder (bis 8 Mpx ≈ 32 MB Canvas-Speicher) bleiben nach dem Video nicht mehr liegen; `noc` wird zurückgesetzt. **Merge:** damit 3 Stellen statt 2 (Hunk `vvDrawMatrix`, VK4-Block, eine Zeile in `vvClose`).
- Spurkopf STIMME: „Audio“ statt `soundLabel` (App-Kopf: „🎤 STIMME · Audio“; 🎤 = das gezeichnete Mikro).

**Tests der Gegenprüfung:** `tests/vk4-pruef.mjs` (leerer Song, 3/4-Clip, Determinismus mit/ohne Pegel, `getContext` = null, `vvClose` gibt frei, STIMME-Kopf) – alles grün; `vk4-test.mjs` und `vk4-extra.mjs` erneut ALLE OK; topdefs 0 Syntaxfehler / 0 doppelt; smoke errors []; Markenwörter 0, „MS 2000“ 1×, „  live: true,“ 1×. Bilder: `vk4-pruef/`, `vk4-matrix-16x9-stumm-stimme.png` neu.

**Offen / klein (nicht gebaut):** Tonart-Abzeichen `.kbg` (Clip-Tonart ≠ Szenen-Tonart) fehlt im Video; ⇅ leuchtet im Video nie amber (App: bei aktivem Träger); der Lichthof eines glühenden Drum-Clips reicht 1 Punkt über die halbe Lücke hinaus (kaum sichtbar).
