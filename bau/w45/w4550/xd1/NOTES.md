# XD1 – acht Punkte („eigenmächtig entscheiden, was logischer ist … Sachen richtig darstellen“)

Datei: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4550/xd1/index.html`
(Basis `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4550/basis.html` = R-4530 = 4.53.0).
Ein Block `XD1-BEGIN … XD1-END` direkt nach `INT53D-END`, dazu drei Einhänge-Zeilen außerhalb, alle mit „XD1“ markiert:
`stSheetFill` (1), `bindStSheet` (1), `vvSwapIn` (7). VERSION/CHANGES unverändert.

## Für Xander

1. **Gesang – alles zum Aufnehmen an einer Stelle.**
   - „Beim Singen hören“ [Begleitung │ + Melodie │ nur Klick] steht jetzt im Mikrofon-Blatt (Schritt 1 Aufnehmen), oben in der Spalte „Stimme → Noten“.
   - Darunter neu: **„Mich selbst hören“ [An │ Aus]**, wie in jeder DAW. Standard ist Aus.
   - An = du hörst deine Stimme direkt im Kopfhörer, mit dem Pegel und dem Hall der STIMME-Spur.
   - Über den Lautsprecher bleibt es stumm (sonst pfeift es), das steht klein darunter in Gelb.
   - Im Takes-Blatt steht nur noch „Abhören: Gesang │ Melodie │ beides“ und ein Satz, wo du „Beim Singen“ einstellst. ● halten zeigt dieselbe Einstellung.
2. **Video quer:** „Live-Vorschau beim Komponieren“ sitzt jetzt rechts im Extras-Kasten (wie hochkant). Bühne und fertiges Video werden quer 50 px höher: bei 926×370 hat das Video 148 statt 98 px.
3. **Matrix, Szenen-Kopf ▶ im STOPP:**
   - Antippen startet die Szene beim Loslassen.
   - Halten öffnet nur das Szenen-Menü, es startet nichts.
   - Wegziehen startet auch nichts.
   - Während der Wiedergabe bleibt alles wie bisher (Start am Taktstrich).
4. **Echtzeit-Mitschnitt:** Steht irgendwo ein Vergleich auf VORHER (Mix & Master, Klang-Editor, Marken, Tonhöhe, Chor), schaltet der Start sichtbar auf NACHHER und meldet „Mitschnitt mit Nachher“. Die Datei hat immer deinen neuen Stand.
5. **Klang-Editor:**
   - Schließt du den Editor, während der Vergleich auf VORHER (Original) steht, endet er auf NACHHER (deine Änderung), wie bei Mix & Master. Das gilt für ✕, Wischen, ≡-Menü, Klang-Browser-✕ und das Öffnen des Noten-Editors.
   - Projekt und Autosave behalten so nie aus Versehen das Original.
   - Der Wechsel zwischen Editor und Klang-Browser lässt den Vergleich stehen.
   - Abgelegtes Mix & Master (⌄) bleibt, wie es ist.
6. **Mix & Master, Remix, Dur ↔ Moll:** Bei ▶/■ wird das offene Blatt nicht mehr neu gebaut. Nur die ▶-Taste und der Satz ändern sich. Ein Tipp genau in diesem Moment geht nicht mehr verloren. Sichtbar ist nichts anders.
7. **Mix & Master ① Messen:**
   - Die Messung hört jetzt den ganzen Song ab Schlag 1. Vorher fehlten die ersten Synth-Noten, und unter Last schwankten die Vorschläge (z. B. 910 statt 890 Hz).
   - Die Vorschläge der Demo bleiben dieselben und stimmen musikalisch: Bass −3 dB bei 50 Hz für den Grundton der Kick, Fläche −2,5 dB bei 890 Hz gegen die Sequenz, Drums −2 dB bei 300 Hz.
   - Die Schwellen musste ich darum nicht verschieben.
8. **„Wo bin ich“-Zeile:**
   - Sie wird jetzt mit der echten Schrift gemessen. Passt „● Szene 1“ nicht (Drum-Blatt hochkant), steht „● Sz 1“ da statt „● Sze…“, im Song „Ref. 2“.
   - Kein Kopf ist höher, keine Taste verschoben. Geprüft: alle Blatt-Köpfe in allen drei Größen.

**Gefunden, nicht geändert (Vorschlag für den Funk):**
- Im Matrix-Remix-Blatt (Szene) bleibt die Taste „▶ Vorhören“ stehen, wenn du die Wiedergabe außerhalb des Blatts startest oder stoppst. Dort gibt es keine MIXG-Zeile, also auch keinen Takt, der sie nachführt. Das ist schon in 4.53.0 so.
- Video quer: Die Taste im Extras-Kasten braucht 50 px in der rechten Spalte. Quer 370 ist [Video erstellen] dadurch nur 26 von 44 px sichtbar (antippbar, die Spalte rollt). Quer 428 liegt [Teilen] nach dem Erstellen 8 px unter der Kante.

## Technik

### (1) Mikrofon-Blatt: Beim Singen hören + Mich selbst hören (Schritt 1)
- `xd1MicHtml` (Einhänge-Zeile in `stSheetFill`) stellt die beiden Zeilen vor „Stimme → Noten“ (`.st-c2`).
  - Hochkant stehen sie unter Weg/Verzögerung, quer rechts oben. Die linke Spalte [Einmessen] [Mikro an] [● REC] bleibt quer wie in der Basis.
  - Taps laufen über `xd1MicTap` (Einhänge-Zeile in `bindStSheet`).
- „Beim Singen“ = `vox2Tap` (VOX2-Zustand `vox2Sm`, ein Zustand mit ● halten). Ein Tipp dort zeichnet ein offenes Mikrofon-Blatt nach.
  - `vox2TkHtml` (Takes-Blatt) zeigt nur „Hören“ und den Verweis-Satz.
- Mithören `xd1MonSync`:
  - Weg: Mikro → eigener Gain → direkt `destination`, am Master vorbei (kein Kompressor-Vorlauf).
  - Pegel = vol² der STIMME. Hall-Send = Pegel × Hall der STIMME in `AU.hallIn`.
  - Still bei Lautsprecher, beim Einmessen, außerhalb „live“, im Offline-Render, bei STIMME stumm und bei Solo auf einer anderen Spur.
  - Im Echtzeit-Mitschnitt fällt nur der Hall-Send weg.
  - Gemerkt in `uiPrefs.xd1Mon`, nie im Projekt. Takt 400 ms nur, solange Mikro und Mithören an sind.
- Maße:
  - hochkant Blatt 646 → 774 px.
  - quer 428: 342 → 410 px, rollt nicht.
  - quer 370: nur die rechte Spalte rollt, [Mikro an] bleibt sichtbar.
- Guide: `vox2sing` → `.xd1sing`, neu `xd1mon`.

### (2) Video quer
- `vd4LvFit` legt die Taste quer wie hochkant in den Extras-Kasten. Die Zeile unter der Bühne entfällt.
- Quer 428: Bühne 206 → 256 px, Video 156 → 206 px.
- Quer 370: Bühne 148 → 198 px, Video 98 → 148 px.
- Hochkant pixelgleich zur Basis.

### (3) Matrix-Szenenkopf im STOPP
- Hüllen um `mtxScnDown` und `mtxHoldEnd`. Gestoppt: Aufsetzen setzt nur `defer`.
- Loslassen ≤ 12 px vom Aufsetzen (wie `onTap`) → `launchScene`.
- Halten (450 ms, ≤ 8 px) → nur das Blatt, auch nach dem Loslassen kein Start. Weggezogen → nichts.
- Wiedergabe unverändert wie MTX.

### (4) Echtzeit-Mitschnitt
- Hülle um `songAudioStart`. `xd1ToNach` stellt jeden aktiven Vergleich mit den echten Umschaltern auf NACHHER:
  - `mx2AbEnd` (Mix & Master)
  - `toggleAB` (Klang-Editor)
  - `WP.ab` / `G2.ab` mit Neuzeichnen (Marken, Tonhöhe)
  - `ch1AB('B')` (Chor)
- Meldung „Song wird aufgenommen – n Takte · Mitschnitt mit Nachher“.

### (5) Klang-Editor schließen = NACHHER (Schritt 2)
- `xd1SndEnd` macht dasselbe wie `toggleAB` B → A (inkl. `ak1End` eines offenen ◆), ohne Meldung und ohne Neuaufbau.
- Ausgelöst von:
  - jedem `closeSheets`: ✕, Wischen, `openMenu`, Noten-/Clip-Editor öffnen;
  - `closeBrowser(false)`, also Klang-Browser ✕. Das geht nicht über `closeSheets`, Lauf 1 hatte es nicht.
- Kein Ende bei `openEditor`/`openBrowser` (Wechsel Editor ↔ Browser oder andere Spur, Zähler `XD1.sw`) und bei `applyProject`. Das alte Projekt ist dann schon geparkt; über ≡ war der Editor längst zu.
- Steht der Editor auf einer Drum-Spur, während der Vergleich einer Synth-Spur auf B steht, endet er beim Schließen ebenfalls.
- Hat ein Export gerade den Nachher-Stand geliehen (`INT53C.n`/`hold`), wartet das Ende, bis er zurückgegeben hat (250-ms-Takt nur in diesem Fall). Sonst gäbe INT53C das Original zurück, während die Seite „Nachher“ sagt.
- Abgelegtes Mix & Master: nicht berührt.
- Folge für INT53C/INT53D: „Klang-Editor auf Vorher bei geschlossenem Editor“ gibt es nicht mehr.
  - Die Kopien `tests/int53c-test.mjs` und `tests/int53d-test.mjs` lassen den Editor offen (4 Stellen `closeEditor()` → offen, Kopf-Kommentar). Der Vergleich ist dann sichtbar.
  - Das ist der Vorher-Zustand, der beim Export noch vorkommen kann. Sonst ist alles unverändert.
  - Die Original-Skripte fallen genau an diesen Stellen (Lauf 1, `out/r4`: int53c 51/56, int53d 22/31).

### (6) MIXG ohne Neuaufbau bei ▶/■ (Schritt 2 nachgeprüft und ergänzt)
- Hülle um `mxgSync`: Wechselt ▶/■, setzt sie `MXG.pl` vorher, damit der alte Weg (`P.repaint()` = innerHTML des ganzen Blatts) nicht läuft. Danach setzt `xd1PlUpd` nur die Teile, die vom Transport abhängen:
  - Remix: [▶ Vorhören] ⇄ [■ Stopp], A/B bei „neue Szene“, „Stil antippen = …“
  - Dur ↔ Moll: [▶ Hören] ⇄ [■ Stopp]
  - Mix & Master: „Kompression … live/im Schnitt“ und „Messen aus: Live – … (Matrix/Song/startet die Szene)“
- Neu in Schritt 2:
  - MIXG stellt die „Messen aus“-Zeile als `.mxgsrc` in Schritt ①. Lauf 1 suchte `.mx3st` und ließ sie stehen.
  - Bei ■ zeigen die Kompressor-Balken wieder den Schnitt wie `mx2Paint`. Vorher blieben die letzten Live-Werte mit Klasse `live` stehen; `mx2Loop` setzt nur beim Abspielen.
- Geprüft per Gleichheit mit dem alten Weg: 8 Blatt-Zustände × 3 Größen, je ▶ ■ ▶ ■. innerHTML danach = innerHTML nach `MXG_HEAR[id].repaint()`, alle Tasten dieselben Elemente.
- Einzige Abweichung beim Abspielen: die Live-Balken, die `mx2Loop` im Bildtakt setzt; der Test blendet sie aus.

### (7) MIX-A-Messung mit Quittung (Schritt 2 nachgemessen)
- Einhänge-Zeile in `vvSwapIn`: `off.mixa` → `int53WkSync(oc)`, dieselbe Quittung wie Video/Audio.
- `XD1.ack` ist nur ein Test-Schalter, Standard an.
- Gemessen mit `s2/p7.mjs` und xd1-test (7), Demo 2 × 4 Takte:

  | | ohne Quittung | mit Quittung |
  |---|---|---|
  | Spitze der Summe in den ersten 40 ms | 0,287 | 0,489 (zweimal gleich) |
  | Fläche (Glocke) | 890 Hz, einmal 910 Hz | immer 890 Hz |

- Mit Quittung sind die Vorschläge fest:
  - Bass: Low-Cut 30 Hz, −3 dB bei 50 Hz „der Grundton der Kick bekommt Platz“
  - Sequenz: Low-Cut 185 Hz
  - Fläche: Low-Cut 185 Hz, −2,5 dB bei 890 Hz „Fläche überdeckt Sequenz (Synth 2, 56 %)“, kein Höhen-Shelf (Höhenanteil −30 dB)
  - Drums: Low-Cut 30 Hz, −2 dB bei 300 Hz „Pappkarton-Klang“
  - Einziger Unterschied zu ohne Quittung: die Kompressor-Schwelle der Fläche (−17,5 statt −17 dB).
- Folge: Die MIXG-Schwellen bleiben, der mixg-Test braucht keine neuen Zahlen (48/48, Original-Kopie `rel-4530/fix/tests/mixg-test.mjs`).
- Die Befürchtung aus INT53 Vorschlag A (Kick-Platz fällt weg, Fläche bekommt Shelf 6 kHz) tritt auf 4.53.0 mit der echten Quittung nicht ein.

### (8) ORI „Wo bin ich“ (Schritt 2 nachgeprüft und ergänzt)
- `oriFit` misst die Zeile mit der echten Schrift des `::before`: Canvas-`measureText` plus Buchstabenabstand, Platz = Kopfbreite − Innenabstände − Lampe 13 px.
- Reihenfolge: ganzer Pfad → ohne Bereich → nur der Teil → Kurzform `xd1Short`. „Szene n“ → „Sz n“, „Refrain 2“ → „Ref. 2“, „Intro“ → „Intr.“; die Nummer bleibt immer.
- Neu in Schritt 2: Schrift und Abstände je Kopf zwischengespeichert (`xd1WoStyle`, neu gelesen nur bei anderer Fenstergröße oder Klasse). `oriFrame` läuft alle 100 ms und liest `getComputedStyle` sonst nicht mehr.
- Textbreiten im Speicher, höchstens 300 Einträge.

## Tests (nacheinander, je mit timeout; Ausgaben `out/s2run/<test>.log`, Zusammenfassung `out/s2run/summary.txt`)

Endlauf `out/s2final` auf der fertigen Datei (md5 vor und nach dem Lauf gleich):

| Test | Ergebnis | Bemerkung |
|---|---|---|
| Pflicht `topdefs.cjs` | Skripte 26, Namen 6683, **doppelt 0, Syntaxfehler 0** | |
| Pflicht `dupkeys.cjs` | **0 doppelte Schlüssel** | |
| Rauchtest `dirigent-test/smoke.mjs` | Titel SYNQUENZER, **errors []** | `out/s2final/smoke.png` |
| `xd1-test.mjs` (alle 8 Punkte, p/q/q2, Basis-Gegenproben) | **143/143** | siehe Aufschlüsselung unten |
| vox2 (Kopie `tests/vox2-test.mjs`) | **111/111** | |
| vd4 (Kopie `tests/vd4-test.mjs`) | 30/31 | nur VD4-02 (Matrix-Bild pixelgleich zu 4.48.1); fällt genauso auf der Basis (`out/r3b`), kein XD1-Befund |
| vid5 (Basis `w4500/basis.html`) | **56/56** | |
| mtx (Kopie `tests/mtx-test.mjs`) | **92/92** | |
| mixg (`rel-4530/fix/tests/mixg-test.mjs`, unverändert) | **48/48** | MIX-A-Messung mit Quittung, alte Zahlen gelten |
| ori (Kopie `tests/ori-test.mjs`, Basis `w4550/basis.html`) | 87/88 | nur „Menü: kürzer“: vergleicht Basis (hat ORI schon) mit ORI, 2801 = 2801; kein XD1-Befund |
| int53c (Kopie `tests/int53c-test.mjs`, Editor offen) | **56/56** | Original-Skript: 51/56 (`out/r4`), nur die Fälle „Editor zu auf Vorher“ |
| int53d (Kopie `tests/int53d-test.mjs`, Editor offen) | **31/31** | Original-Skript: 22/31 (`out/r4`), Grund wie int53c |
| Datei-Pflicht | „MS 2000“ 1×, „  live: true,“ 1×, Markenwörter nicht mehr als Basis, VERSION 4.53.0/CHANGES unverändert | in xd1-test „Pflicht“ |

xd1-test je Punkt: Pflicht/Block 3 · (1) Gesang 34 · (2) Video 9 · (3) Matrix 15 · (4) Mitschnitt 12 · (5) Klang-Editor 16 · (6) MIXG 31 ·
(7) Messung 5 · (8) Wo bin ich 12 · Regression (pixelgleich zur Basis: Matrix, Song, Klang-Editor, Menü, Remix) 6.
Zwischenläufe: `out/s1run` (Schritt 1), `out/s2a` (int53c/d), `out/s2run` (erster Endlauf; deckte in ori den Messfehler beim ersten Bild auf und
in xd1-test (7) eine zu strenge Gleichheit 0,490/0,489 – beides behoben, siehe BAU-LOG), `out/s2/x567.log` (Punkte 5–7).

Eigene Sonden Schritt 2:
- `s2/p6.mjs`: MIXG-Gleichheit mit dem alten Weg, Basis-Gegenlauf.
- `s2/p7.mjs`: MIX-A erste 40 ms mit/ohne Quittung.
- `dev/p-mixa.mjs`: MIX-A-Merkmale und Vorschläge.

Bau-Log: `BAU-LOG.md`.
