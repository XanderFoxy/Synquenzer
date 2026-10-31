# BMC – Paket BM8: Bend, Rad und Druck im Clip (Nachtrag 7 Rev. 2, §5.4, §6 BM8)

Zweig `helfer-bmc` · Basis `bau/werkzeug/vs-base-B.html` (App 4.23.0, Merge-Basis) → `bau/helfer/BMC/index.html`.
VERSION-Zeile und CLOUD-Zeile `  live: true,` unverändert. Format 5 nur zusätzlich. Kein Supabase-Aufruf. Keine Marken- oder Herstellernamen.

## Was gebaut ist
1. **Daten (`cv` im Noten-Behälter).** `cv = {bd, mw, at}`, je Kurve `[[t, v], …]` (t in Schlägen ab Behälter-Beginn, Bend auf 1/4096, Rad/Druck auf 1/1024).
   Gilt für Szenen-Clips, eigene Clips und die Song-Melodie. `normClip`, `ownNorm` (über `normClip`) und `melNorm` prüfen `cv`: sortieren, Grenzen klemmen,
   NaN und fremde Werte entfernen, höchstens 4096 Punkte, Startpunkt ergänzen. `cleanClip` nimmt `cv` mit. Ein Clip ohne Kurven bekommt kein Feld.
2. **Kopierwege zentral.** Alle Kopien laufen über `cleanClip`, `deep` oder die Normalisierer. Deshalb nehmen Clip kopieren/einfügen, Duplizieren,
   Undo, eigener Clip, Datei, Projekt-Kopie und Server die Kurven ohne Zusatzcode mit. Wo Noten Stück für Stück umgebaut werden, sind die Kurven jetzt dabei:
   - „Ganzer Block“ rollt die Kurven Takt für Takt ab, wie die Noten.
   - Song-Bereiche: Verschieben, Leeren, Ausschneiden/Einfügen, Kopieren, Markierungen, „Teil ersetzen“. Dafür hat ein Song-Stück das neue Feld `melCv`.
   - „Melodie → Clip“ und „Melodie-Spur wechseln (mitnehmen)“.
   - Melodie-Editor: Abbrechen nimmt die Kurven zurück.
3. **Zeit-Aktionen.**
   - Clip-Blatt: Länge ½, −1, +1, ×2.
   - Editor: Dupl. (×2), Takte −/+, Längen-Griff, Zuschneiden.
   - Tonhöhen-Aktionen (Transponieren, ±12, Tonart) lassen `cv` unverändert.
4. **Aufnahme** auf einer Bit-Mask-Spur, mit den Noten in denselben Behälter und als **ein** Undo:
   - ● neu (feste und automatische Länge).
   - ● Overdub nach „Berühren“: nur wo ein Regler bewegt wurde (± 20 ms), ersetzen neue Punkte die alten; an den Rändern läuft die alte Kurve weiter.
   - FANG.
   - Song-Aufnahme mit Ziel NOTEN: in die Melodie oder den eigenen Clip des Durchgangs; Ersetzen und Überschreiben ersetzen.
   - [● MEL.].

   Die Abtastung liegt im 10-ms-Raster (≤ 100 Punkte/s), danach wird ausgedünnt (Bend 0,002, sonst 0,004).
5. **Wiedergabe.** Der Planer schickt die Punkte des Planungsfensters als `BmHost.ctl(i, [{k, v, at}])`. Auf Geraden geht alle 10 ms ein Stufenwert.
   - Jeder Schleifen-Beginn bringt den Startwert.
   - Folgt ein Clip ohne Kurve, oder bei ■ und Panik: Bend 0, Druck 0, Rad = Radstellung.
   - Solange der Finger ein Rad oder den Druck berührt, gewinnt die Live-Eingabe. Danach folgt wieder die Kurve.
6. **Kurven löschen.**
   - Im Clip-Blatt steht „Kurven löschen“ mit „Bend · Rad · Druck“ in der zweiten Zeile, nur wenn der Clip Kurven hat. Ein Undo.
   - Ebenso im Zellen-Menü eines eigenen Clips im Song.
7. **Datei.** In der Projekt-Datei werden die Kurven eines Szenen-Clips ganzzahlig und als Differenzen geschrieben (`cz: 1`, wie `nz` bei den Noten).
   Das passiert nur, wenn der Rückweg exakt gleich ist. Grund: BM8-11 (16 Takte Dauerbewegung: 46 KB → 18 KB).
8. **Test-API.** `clipCurves(t, ort)` und `setClipCurves(t, ort, cv)` (ort = Szene · `'mel'` · `{own: id}`), außerdem `clipCurvesClear`, `clipMenuItems`,
   `historyCheck()`, `bmcLive`, `bmcLog`, `bmcState` und `bmcFake` (Platzhalter-Spur, nur zur Laufzeit).

## Schnittstelle für die Zusammenführung (bitte beachten)
- **`BmHost.ctl(i, list)`** mit `list = [{k: 'bd'|'mw'|'at', v, at, cut?}]`.
  - Der Platzhalter gibt an den Bit-Mask-Knoten der Spur als `E.ctl({list})` weiter. Das ergibt genau die Nachricht `{t:'ctl', list}` aus §2.1.
  - In helfer-bmu nimmt `E.ctl` heute `{bend, mw}` (sofort, ohne Zeit). Der echte Prozessor (Zweig K) muss die Liste mit `at` verstehen.
  - `cut: 1` (zusätzlich, je Regler): Ereignisse desselben Reglers, die schon hinter `at` geplant sind, fallen weg. Das gilt bei ■, Panik und bei einem Wechsel innerhalb des Planungsfensters.
- **Live-Eingabe:** `bmcInput(i, k, v, ret)` (Wert in den Verlauf) und `bmcTouch(i, k, an/aus)` (Live gewinnt).
  - Das MOD- und BEND-Rad rufen das schon auf (`mkWheelSet`, Rad-Geste).
  - Die **Druck-Geste aus BM5** muss `bmcInput(i, 'at', v)` und `bmcTouch(i, 'at', …)` aufrufen.
- **Bit-Mask-Spur:** `bmcIs(i)` prüft `sound.engine === 'bm'`. Bis BM6 kommt, gibt es die Test-Platzhalter `bmcFake`.

## Lesart (wo die Spec offen ist – bitte bestätigen)
- Zwischen zwei Punkten gilt die **Gerade**. Die Ausdünnung nach §5.4 setzt das voraus; „stufig“ gilt für die gesendeten 10-ms-Werte.
- Die Zeit eines Regler-Ereignisses ist `currentTime`, zwischen den Audio-Blöcken mit `performance.now()` verfeinert.
  `currentTime` springt im Browser in Blöcken von 5–40 ms.
- Bewegungen, die weniger als 100 ms auseinanderliegen, zählen als eine Spanne. Grund: Touch-Ereignisse kommen manchmal verspätet.
  Eine Pause über 60 ms hält den alten Wert.
- Ein Regler, der während einer Aufnahme nicht bewegt wurde, bekommt keine Kurve. Im Ersetzen-Modus werden nur bewegte Regler ersetzt.
- Spielen Song-Melodie und Clip auf derselben Spur gleichzeitig Kurven, hat der Clip Vorrang. So spielt eine Song-Aufnahme ab, wie sie aufgenommen wurde: Takte mit Szenen-Clip → eigener Clip, die anderen → Melodie.

## Was es in der App nicht gibt (darum nicht gebaut, Regel 27)
„rückwärts“, „Spiegeln“, „Dehnen“, „Teilen“ und „Zusammenfassen“ als Aktionen am ganzen Behälter gibt es in 4.23.0 nicht. „Teilen“ und „Verbinden“
im Editor wirken auf Noten. „Szene duplizieren“ und „Teil übernehmen“ kopieren keine Clip-Daten (Teile verweisen nur auf Szenen-Plätze).
Die Helfer `cvReverse` und `cvScale` liegen bereit, sind aber nirgends angebunden.

## Unabhängige Prüfung (eigener Prüfer-Agent) – Befunde und Korrekturen
| Nr. | Befund | Korrektur | Test |
|---|---|---|---|
| 1 | Die Kurven-Helfer ließen am Ende eines Stücks den Haltewert weg. Bei ×2, Zuschneiden, Kürzen, Song-Bereichen und „Ganzer Block“ entstanden Rampen statt Stufen. | Jedes Stück hält seinen Wert bis zu seinem Ende (Punkt 1/10000 Schlag davor). | `bm8-helfer.mjs` 22/22 gegen die Bedeutung, nicht gegen die Helfer; Clip-Blatt ×2/½ abgetastet |
| 2 | Eigener Clip mit neuen Kurven: `cv` stand hinter `from`, deshalb war `historyCheck()` falsch. | `cvSet` schreibt `cv` vor `from` (wie `ownNorm`). | `bm8-review` #2 |
| 3 | Ersetzen ohne Reglerbewegung ließ die alte Kurve stehen. | Im Bereich wird ersetzt, auch wo nichts bewegt wurde (nur wo schon eine Kurve war, kein neuer Behälter). | #3 |
| 4 | Die feste Aufnahme schloss einen Planungsvorlauf zu früh: Die letzten ~100 ms Bewegung fehlten. | Die Kurven werden geschrieben, sobald das Ende gehört ist. Gleicher Undo-Schritt. Das Ende selbst gehört nicht mehr dazu. | #4 |
| 5 | Melodie-Kurve und Clip-Kurve derselben Spur sendeten gleichzeitig. | Die Clip-Kurve hat Vorrang. Die Melodie-Kurve endet vor einem anstehenden Clip mit dieser Kurve und setzt danach mit ihrem Wert sofort fort. | #5 |
| 6 | Das Abtasten des Startwerts legte im Song einen leeren eigenen Clip an. | Abtasten legt nie einen Behälter an. | #6 |
| 7 | Der Startwert des Rads im Verlauf war der Wert nach der ersten Bewegung. | Der Verlauf beginnt vor der Bewegung. | #7 |
| 9 | Die Meldung nach der Aufnahme zählte die Kurven als Note. | Es werden nur die Noten gezählt. | – |
| 10 | Song-Schlag nahe einem Schleifen-Sprung ungenau. | Jeder Sprung des Songs wird gemerkt; jeder Schlag wird genau umgerechnet. | #6, Song-Aufnahme in `bm8-rec2` |
| 8 | „Melodie-Spur wechseln (mitnehmen)“: Hat das Ziel schon eine Kurve desselben Reglers, bleibt dessen Kurve; die mitgenommene fällt weg (zwei Kurven lassen sich nicht zusammenlegen). | nicht geändert | Frage 5 |

## Abnahme (echte Läufe, Chromium headless, Platzhalter-Host)
| Punkt | Ergebnis |
|---|---|
| BM8-01 Aufnahme ● fest 4 Takte | cv.bd/mw/at, Startpunkt 0, ≤ 100 P/s (31/19/28 je s), Abweichung an den 10-ms-Abtastpunkten 0,0021 / 0,0043 / 0,0044 ≤ 0,005 ✔ |
| BM8-01 ● automatische Länge, FANG | Kurven + Noten, Startpunkt 0, ein Undo („Aufnahme“ / „Fang“) ✔ |
| BM8-01 Song NOTEN, [● MEL.] | Kurven in eigenen Clip (Takte 1–2) und Song-Melodie (Takte 3–4), Szenen-Clip unberührt, ein Undo ✔ |
| BM8-02 Wiedergabe | Korrelation 0,9998 / 0,995 / 0,998 ≥ 0,99 ✔; Zeitlage 0 / 0 / 0 ms (± 1) ✔; jeder Schleifen-Beginn = Startwert ✔; ■ → Bend 0, Druck 0, Rad = Radstellung ✔ |
| BM8-03 Mitwandern | 15 Wege einzeln: kopieren/einfügen, Einfügen in andere Spur, Duplizieren, getClip, Undo-Schnappschuss, makeOwn, Ganzer Block (4 Durchläufe abgerollt), Song-Bereich kopieren/löschen + Undo, Markierung kopieren, Melodie → Clip, Datei-Rundweg, Server (Fake: Körper → `cloudApply`), Projekt-Kopie ✔ |
| BM8-04 Zeit-/Tonhöhen-Aktionen | ×2, ½, −1, +1, Undo, Editor Dupl./Takte −/Zuschneiden ✔; ±12 und Tonart: cv unverändert ✔ |
| BM8-05 Overdub = Berühren | Rad nur in Takt 2 → Takt 1, 3, 4 gleich, Bend/Druck gleich ✔ |
| BM8-06 Kurven löschen | nur bei Clips mit Kurven, löscht alle drei, ein Undo, Redo ✔; eigener Clip im Song ebenso ✔ |
| BM8-07 Undo | Aufnahme = 1 Schritt, Overdub = 1 Schritt, Undo stellt die alten Kurven her, `historyCheck()` = true ✔ |
| BM8-08 Speichern/Laden | ganzes Projekt deep-equal; Normalisierer repariert unsortiert, > 4096, NaN, Grenzwerte, fremde Werte ✔ |
| BM8-09 Live-Berührung | während der Berührung keine Bend-Kurve, Rad-Kurve läuft weiter; danach folgt die Kurve ✔ |
| BM8-10 andere Engine (VA) | gleiche Noten mit und ohne Kurven, 0 Kurven-Ereignisse, cv bleibt ✔ |
| BM8-11 Größe | 16 Takte Dauerbewegung (Bend 1,5 Hz voll, Rad, Druck): 18,3–18,7 KB ≤ 20 KB ✔ |
| Regel 28 | altes Projekt (Clips, Song, Melodie, eigene Clips, Ganzer Block) Datei byte-gleich zu 4.23.0; Demo gleich; Demo spielt dieselben 112 Noten zu denselben Schlägen; kein Kurven-Zustand ✔ |
| Regel 1/4/5 | „Kurven löschen“ in 428×926, 926×428, 390×844, 375×667, 320×568, 844×390, 667×375: sichtbar, trifft, nicht abgeschnitten, keine Seitenhöhen-Änderung ✔ |

Testskripte: `tests/bm8-curves.mjs` (17/17), `tests/bm8-copy.mjs` (39/39), `tests/bm8-rec2.mjs` (7/7), `tests/bm8-regel28.mjs` (7/7),
`tests/bm8-layout.mjs` (22/22), `tests/bm8-helfer.mjs` (22/22), `tests/bm8-review.mjs` (7/7). Alle nach den Korrekturen erneut gelaufen, die
zeitkritischen mehrfach hintereinander. Bilder: `bm8-shots/clip-menue-*.png`.

**Nicht geprüft (braucht den echten Prozessor):** das hörbare Ergebnis von BM8-02 (Offline-Render gegen Echtzeit-Mitschnitt) und die 10-ms-Glättung
in der Engine. Geprüft ist der Strom der `ctl`-Ereignisse. Nach dem Zusammenführen mit BM1/BM2/BM6 erneut prüfen.
Bei den rohen Eingabe-Ereignissen liegt die Abweichung bei 0,005–0,01. Das liegt am Timer-Zittern im Test-Browser zwischen den 10-ms-Abtastpunkten.

## Hinweise
- In den Querformaten 926×428, 844×390 und 667×375 sind **alle** Tasten des Clip-Blatts 34–36 px hoch (so schon in 4.23.0).
  „Kurven löschen“ hat dieselbe Höhe. Regel 4 verlangt ≥ 44 px. Nicht geändert (Regel 27), Frage unten.

## Fragen an Xander
1. Zwischen den Punkten gilt die Gerade, gesendet wird alle 10 ms ein Wert. Passt das?
2. Regler, die während einer Aufnahme nicht bewegt wurden, bekommen keine Kurve. Im Ersetzen-Modus wird nur ersetzt, was bewegt wurde. Passt das?
3. Song-Melodie und Clip auf derselben Spur mit Kurven: Der Clip hat Vorrang (so gebaut). Passt das?
4. Sollen die Clip-Blatt-Tasten im Querformat (heute 34–36 px) auf 44 px wachsen?
5. Melodie auf eine andere Spur mitnehmen, die schon eine Kurve desselben Reglers hat: Welche Kurve soll bleiben?

## Bitte prüfen
1. Bit-Mask-Spur (nach dem Zusammenführen): ● 4 Takte mit Bend, MOD-Rad und Druck aufnehmen. Klingt die Wiedergabe wie gespielt?
2. Clip kopieren, einfügen, duplizieren, „Eigener Clip“, „Ganzer Block“, Song-Takte kopieren/verschieben: Die Kurven müssen jedes Mal mitkommen.
3. Overdub: nur das Rad in einem Takt bewegen. Der Rest bleibt wie vorher.
4. Clip-Blatt: „Kurven löschen“ erscheint nur bei Clips mit Kurven. Danach ↶ holt sie zurück.
5. Altes Projekt öffnen: Es klingt und speichert genau wie vorher.
