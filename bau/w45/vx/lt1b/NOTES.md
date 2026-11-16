# LT1B – Import-Vorbereitung: Speicher begrenzen und Neustart (Rest der LT1-Zweitprüfung, Basis 4.75.0 = rel-4750)

Auftrag (OFFEN.md „LT1 (4.74) Rest aus Zweitprüfung“):
(1) Die LT1-Vorbereitung (Take-Kopie Int16 + AudioBuffer Float32 = 6 Byte je Probe ≈ 17 MB/min bei 48 kHz) liegt im Speicher, solange
das Import-Blatt offen ist – auch nach „Als Gesang“. → Obergrenze, keine Vorbereitung bei Gesang.
(2) Nach „Blatt in die Leiste und zurück“, „1“ verschoben oder Tempo/Taktart mit anderem Versatz startet die Vorbereitung nicht neu
(Ergebnis richtig, nur der alte, langsame Weg). → Neustart entprellt, alte Vorbereitung sofort freigeben.

## Änderung
Alles im vorhandenen Block `LT1-BEGIN … LT1-END` (Kennung „LT1B“ in den Kommentaren) + 3 neue einzeilige Haken.
- `LT1_MAXB = 100 MiB` und **`lt1PreWant(c)`** (neu): eine Stelle für alle Bedingungen – Blatt offen, `IMP1.cur === c`, `st === 'fertig'`,
  Audio erlaubt, kein Dehnen (wie bisher) und neu:
  - `n · 6 Byte ≤ 100 MiB` (n = Take-Länge in Proben) → **≈ 364 s (6,07 min) Take-Länge für jede Datei**: der Import rechnet immer auf
    48 kHz um (`ggbDecode` = `OfflineAudioContext(1, 1, GGB_SR)`, `GGB_SR = 48000` → `c.sr` immer 48000; korrigiert nach Prüfer-Befund 1,
    vorher stand hier fälschlich „6,6 min bei 44,1 kHz, 3 min bei 96 kHz“); darüber alter Weg
    (`LT1.big` = Länge des zuletzt abgewiesenen Takes, nur Messung).
  - nicht, wenn im Blatt „Als Gesang importiert“ steht (`c.made`, das ist das im Blatt sichtbare zuletzt gewählte Ziel). Vor dem Tipp ist
    das Ziel im Blatt **nicht** erkennbar (drei Knöpfe, der Tipp legt sofort ab) – darum: nach „Als Gesang“ wird die liegende Vorbereitung
    sofort freigegeben (Haken imp1Paint am Ende von imp1Place) und nicht neu gestartet. Der Datei-Wähler mit Hinweis „gesang“ öffnet das
    Blatt gar nicht (ggbImportBuf) – dort gab es nie eine Vorbereitung.
  - nicht, wenn das Blatt schon einen Take hat (`c.take` in `S.takes`): imp1Place nimmt ihn wieder, imp1Take läuft gar nicht
    (z. B. nach dem ersten Ablegen oder beim Blatt aus einem Clip „Original“ / imp1OpenTake).
- **`lt1PreCheck()`** (neu, Haken in imp1Paint, imp1Sheet, pshUndock; außerdem im 1-s-Nachsehen der fertigen Vorbereitung):
  passt die liegende/laufende Vorbereitung nicht mehr (anderes c/Audio/Rate, Versatz `round(org·sr)` oder Länge anders, Gesang, Take liegt
  vor, Dehnen, Grenze) → **sofort** `lt1PreDrop()` (`LT1.drop` zählt). Lohnt eine Vorbereitung und es gibt keine → Start nach **400 ms Ruhe**
  (jede weitere Änderung schiebt den Start; `LT1.re` zählt die Neustarts).
- `lt1PreStart(c)`: nutzt `lt1PreWant` (vorher eigene Bedingungen), löscht einen wartenden Neustart. Füll-Schleifen, `lt1Take`,
  `lt1PreBuf`, `lt1StoreJobs` unverändert → gleiche Rechnung, gleiche Prüfung beim Ablegen (sonst alter Weg).

### Haken (außerhalb des Blocks, je eine neue Zeile, mit typeof abgesichert)
| # | Stelle | Haken |
|---|---|---|
| 7 | `imp1Paint` letzte Zeile | `if (typeof lt1PreCheck === 'function') lt1PreCheck();   /* LT1B: „1“/Tempo/Ziel geändert → … */` |
| 8 | `imp1Sheet` vor `return p` | `if (typeof lt1PreCheck === 'function') lt1PreCheck();   /* LT1B: Blatt wieder offen → … */` |
| 9 | `pshUndock` vor `haptic('tick')` | `if (typeof lt1PreCheck === 'function') lt1PreCheck();   /* LT1B: Import-Blatt aus der Leiste zurück → … */` |
Haken 1–6 aus LT1 unverändert. imp1Paint läuft nach jeder Änderung im Blatt (Tempo ±, ½×, 2×, Tippen, Taktart, „1“ loslassen, Teile,
Ablegen, Erkennen); während des Ziehens der „1“ nur imp1Draw → der Neustart kommt nach dem Loslassen. pshUndock ist allgemein (alle
Blätter); lt1PreCheck tut nur etwas, wenn das Import-Blatt offen ist.
Diff gegen basis: `git diff --no-index --stat` 35 insertions(+), 5 deletions(-) (Block + 3 Haken). Keine sichtbare Änderung.

## Verfahren
`t/ab.mjs` = Kopie von `vx/lt1/pruef2/ab.mjs` (Prüfer-Randfälle a1–a14, index vs basis je frischer Kontext, Vergleich Fall-Ergebnis,
Take-Daten + AudioBuffer-Hash + PCM-Stücke aus IndexedDB (`tkPcm`), Daten-/Raster-Signatur, ↶/↷, a9 Speichern/Neu laden) + neue Fälle
b1–b8 (b8 aus der Prüfung; Schlüssel `q*` = Messung, nicht verglichen; Speicher = CDP `Runtime.getHeapUsage().backingStorageSize` nach 3× gc()).
basis = 4.75.0 (LT1 Teil 2 ohne LT1B) = „vorher“.

## Messung (23:20–23:36 UTC, Last 0,4–7,8 auf 4 Kerne; Rohdaten t/*.out, t/*.json)
„vorher“ = basis 4.75.0, „nachher“ = index; je Fall frischer Kontext 926×428; b1–b7 zweimal gelaufen (t/ab-b1.out + t/ab-b2b7.out
und im Gesamtlauf t/ab-a.out), Werte unten: Lauf 1 / Lauf 2.

### Speicher (backingStorageSize nach 3× gc, MB)
| Fall | vorher (basis) | nachher (index) | Unterschied |
|---|---|---|---|
| b1 Datei über der Grenze, 401 s 48 kHz, Blatt offen nach „fertig“ | 232 / 232 (Vorbereitung liegt: 19,3 Mio × 6 B) | **121 / 121** (keine Vorbereitung, `LT1.big` = 19 344 480) | −111 MB |
| b2 100 s 48 kHz vorbereitet → „Als Gesang“, Blatt offen | 94 / 94 (Vorbereitung bleibt liegen) | **66 / 66** (sofort frei) | −28 MB |
| b2 vor dem Tipp (beide vorbereitet) | 67 / 67 | 67 / 67 | 0 |
| Prüfer mem.mjs (3 min, WAV 44,1 kHz → intern 48 kHz): nach Gesang, Blatt offen | 170,2 | **120** | −50 MB |
| mem.mjs: nach Gesang, Blatt zu | 120 | 120 | 0 |
| mem.mjs: 5× öffnen/schließen (offen / zu) | 126,3 / 76 | 126,3 / 76 | gleich, WeakRefs alle frei |

### Ablegen-Dauer (imp1Place, ms) – Fälle, in denen vorher der alte Weg lief
| Fall | vorher (basis) | nachher (index) | Vorbereitung genommen (index) |
|---|---|---|---|
| b3 3 min 48 kHz: Blatt in die Leiste 1,5 s, zurück, Szenen | 100 / 109 | **30 / 25** | ja (`LT1.re` 1) |
| b4 3 min: „1“ +0,137 s verschoben, Spur | 93 / 97 | **29 / 24** | ja (alte sofort frei: `drop` 1, `re` 1) |
| b5 3 min (WAV 44,1k → intern 48k): Tempo +1 und 3/4 (Versatz −1,71 → −1,09 s), Szenen | 120 / 123 | **25 / 24** | ja |
| b6 100 s: 6 Tempo-Tipps im Abstand 80 ms | – | – | 1 Neustart (`re` 1), frei ab dem 1. Tipp (`pre` 0 in allen 6 Messpunkten; basis hielt die alte) |
| b7 nach dem 1. Ablegen Tempo +1 | – | – | keine neue Vorbereitung (`re` 0) – greift über die **Dehnen-Regel** (q≠1), belegt die Take-Regel nicht (Prüfer-Befund 3) |
| b8 (neu, Nachbesserung) nach dem 1. Ablegen nur „1“ +0,137 s, q = 1 | – | – | keine neue Vorbereitung (`re` 0, `pre` 0); `lt1PreWant` false, mit `c.take = null` true → **nur die Take-Regel** weist ab |

### Gewollte Rückschritte (Speicher statt Tempo)
| Fall | vorher (basis) | nachher (index) |
|---|---|---|
| b1 401-s-Datei Szenen ablegen | 26 / 33 ms (vorbereitet) | **203 / 215 ms** (alter Weg, wie vor LT1) |
| b2/a10 nach „Als Gesang“ noch Szenen ablegen | 20 / 28 ms | 58 / 56 ms (alter Weg) |
| a14 Ablegen 300 ms nach dem Zurückholen (Neustart wartet 400 ms) | alter Weg | alter Weg (gleich) |

### Normalweg unverändert (lt1-imp-ab.mjs s10 = 3 min, WAV 44,1 kHz → intern 48 kHz, STOP=1, abwechselnd; Last 1,5–3,3)
926×428 index 27/34/30 · basis 44/32/52 (basis 1 Long Task 54); 428×926 index 27/26/32 · basis 23/23/26 → Median index 28,5 / basis 29 ms
(n 6), gleich=true, Vorbereitung in allen index-Läufen genommen; längste Vorbereitungs-Scheibe 6,3–9,9 ms (basis 7–8).
Erster Lauf parallel zu mem.mjs (Last ~6): index 47/32, basis 31/30, index 1× Long Task 55 – Lastspitze, Wiederholung allein s. o.

## Gleichheit (Ergebnis immer wie basis)
- t/ab.mjs alle 28 Fälle (a1–a14 Prüfer-Randfälle + b1–b7): **28/28 gleich=true**, keine Konsolenfehler (t/ab-a.out); b1–b7 zusätzlich
  einzeln (t/ab-b1.out, t/ab-b2b7.out) ebenfalls gleich. Verglichen: Fall-Ergebnisse, Take-Daten (len, sr, route, name, imp, Stück-Zahl,
  src, follow, latMs), **AudioBuffer-Hash**, **PCM aus IndexedDB** (tkPcm-Hash), Daten- und Raster-Signatur, ↶ und ↷ danach, a9
  Speichern → Neu laden → Takes aus IndexedDB.
- lt1-test.mjs ONLY=c REPS=3 (t/lt1-test-c.out): Ergebnis gleich true in beiden Größen; Long Task beim Ablegen index 0× (beide Größen),
  basis 1×53 / 1×62; imp1Place index 25–28 ms, basis 23–59 ms.
- Regression: imp1-test (Kopie t/imp, Fotos/Audio in t/imp) **ALLE OK (145 s)**; imp2-node realvox/imp2rs **ALLE OK**.

## Pflichtprüfungen (Fassung vor der Prüfung md5 b5dd6b364cf60f3f4077c8e8bd6714ac, basis b8009096f96446a5d06f1c0a393b6312; Endfassung s. „Prüfung“)
topdefs „Skripte 26, Namen 7929, doppelt 0, Syntaxfehler 0“ · dupkeys „0 doppelte Schlüssel“ · smoke errors [] (smoke.png) ·
„MS 2000“ 1× · „^  live: true,“ 1× · VERSION '4.75.0' unverändert · `git diff --no-index --stat` 35 insertions(+), 5 deletions(-).

## Offen
- Datei über der Grenze (> 100 MiB Vorbereitung = Take-Länge > ≈ 364 s, für jede Datei, da intern immer 48 kHz): Ablegen wieder ~200 ms am Stück (Long Task, wie vor LT1).
  Besser ginge es nur ohne zusätzliche Kopie, z. B. Take-Stücke/AudioBuffer erst im Tipp, aber in Scheiben über mehrere Aufgaben
  (synchrones place() mit einem ↶ aufbrechen) – eigener Punkt.
- Nach „Als Gesang“ ist ein weiteres Ablegen derselben Datei als Szenen/Spur wieder der alte Weg (~56 ms bei 100 s, ~130 ms bei 3 min).
  Das Ziel ist vor dem Tipp im Blatt nicht erkennbar (Tipp = Ablegen); eine Vorbereitung „nur bis zum ersten Gesang-Tipp“ ist der
  Kompromiss.
  Das gilt auch **nach ↶ des Gesang-Ablegens**: `c.made` bleibt „Als Gesang importiert“, darum lehnt `lt1PreWant` weiter ab (Prüfer c3:
  Szenen danach index 79 / basis 12 ms bei 100 s, Ergebnis gleich). `c.made` beim ↶ zurückzusetzen wäre sichtbar (es steht in der
  Statuszeile des Blatts, imp1Paint „… · Als Gesang importiert“) → nicht ohne Xanders OK, eigener Punkt.
- Neustart wartet 400 ms Ruhe + Vorbereitung (3 min ≈ 0,1–0,3 s): wer innerhalb ~0,5 s nach Zurückholen/Ändern tippt, bekommt den alten
  Weg (Ergebnis gleich). Für das Zurückholen aus der Leiste könnte die Ruhezeit 0 sein (kein Tipp-Gewitter) – nicht gemessen, nicht gebaut.
- Grenze ist fest (100 MiB). Freien Speicher des Geräts kann die Seite auf dem iPhone nicht abfragen (`performance.memory` /
  `navigator.deviceMemory` gibt es in Safari nicht) – Messung auf dem iPhone mit sehr langer Datei wäre der nächste Beleg.
- `c.made === 'Als Gesang importiert'` hängt am Text in imp1Place (labels.vox); wird der Text geändert, greift die Gesang-Regel nicht mehr
  (dann wird nur wieder vorbereitet – Ergebnis bleibt gleich).

## Prüfung (Nachbesserung nach unabhängigem Prüfer, 00:14–00:33 UTC, Last 1,1–11,1 – fremde Agenten)
Prüfer: LT1B nicht widerlegt (34 Fälle gleich wie basis, Freigabe empfohlen), 3 kleine Befunde, kein hoher/mittlerer.
Sicherungen: index.vor-lt1b2.html (= b5dd6b36…), t/ab.mjs.vor-lt1b2, NOTES.md.vor-lt1b2.

| # | Befund (klein) | Behandlung |
|---|---|---|
| 1 | Grenze falsch beschrieben: Import rechnet immer auf 48 kHz (`ggbDecode` → `OfflineAudioContext(1, 1, GGB_SR)`, `GGB_SR = 48000`, `c.sr = buf.sampleRate`), Grenze also immer ≈ 364 s | **behoben** (nur Text): Blockkommentar LT1B in index.html (1 Zeile im Block, kein Code) und NOTES („Änderung“, Tabellen b5/mem.mjs/s10, „Offen“). imp1OpenTake setzt `c.sr = m.sr` des Takes, hat aber immer `c.take` → dort nie Vorbereitung; die Aussage „jede Datei“ gilt damit für alle Wege mit Vorbereitung. |
| 2 | Nach „Als Gesang“, auch nach ↶ davon, nimmt Szenen/Spur derselben Datei den alten Weg (Prüfer c3: 79 / 12 ms) | **bewusst gelassen, dokumentiert** („Offen“). `c.made` ist die sichtbare Statuszeile des Blatts (imp1Paint: „… · Als Gesang importiert“); sie beim ↶ zurückzusetzen ändert, was Xander sieht → nur mit seinem OK, eigener Punkt. Ergebnis gleich (gleich=true). |
| 3 | b7 belegt die Regel „Take liegt vor“ nicht (Dehnen-Regel greift vorher) | **behoben** im Test: b7-Text korrigiert (belegt die Dehnen-Regel), **neuer Fall b8** in t/ab.mjs (nach Szenen nur „1“ +0,137 s, q = 1): index `lt1PreWant` false, mit `c.take = null` **true**, `re` 0, `pre` 0, `take` true → nur die Take-Regel weist ab; Spur danach nimmt den Take wieder (pl2 ok, 19 / 13 ms); gleich=true. |

Code-Änderung gegenüber der geprüften Fassung: nur die eine Kommentarzeile (git diff index.vor-lt1b2.html index.html: 1 Zeile). Diff gegen basis
weiterhin 35 insertions(+), 5 deletions(-). Test-Werkzeug t/ab.mjs: b8, ENV WAITUR (Wartezeit nach ↶/↷, Standard 600 ms wie bisher) und
ENV URMS (Messung: Zeit bis zur letzten Raster-Änderung nach ↷) – ohne ENV läuft alles wie vorher.

### Endstand-Messung (Endfassung md5 **ec02d14a12374cdd755e01ce9061d00d**)
- t/ab.mjs alle 29 Fälle (a1–a14, b1–b8), parallel zu imp1-test (Last bis ~5): **28/29 gleich=true**, keine Konsolenfehler (29× errs [] / []).
  **b1 gleich=false nur in `redo.grid`** (DOM-Signatur des Rasters 600 ms nach ↷): index zeigte noch den ↶-Stand (dc958b4b/767), basis schon
  a53567ed/859; Daten-Signatur, Take-Daten, AudioBuffer-/PCM-Hash, ↶ gleich. Nachgemessen (t/ab-b1-w*.json, t/ab-b1-ur*.json, t/ab-b1-ur-alt.out):
  b1 allein 3× (WAITUR 600/600/2500) und 7× mit URMS → **10/10 gleich=true**, ↷-Raster in beiden immer a53567ed/859 (eingeschwungener Stand).
  Zeit bis zur letzten Raster-Änderung nach ↷: abwechselnde Reihenfolge 4× index 42/57/59/47, basis 48/46/49/73 ms (Last 8,9–11,1);
  davor (index immer zuerst) index 55/489/172, basis 94/106/39 ms (Last 2,6→10,4). Gesamt-Median index 57 / basis 49 ms.
  undo()/redo() rufen kein imp1Paint (nur Render-Schleife) → LT1B-Code liegt nicht auf diesem Weg; Bewertung: Lastspitze beim Neuzeichnen
  des 401-s-Imports (37 Stücke), kein Unterschied im Ergebnis.
- Messwerte im Gesamtlauf (index / basis): b3 Leiste 31 / 134 ms (re 1), b4 „1“ 39 / 97 ms (re 1), b5 Tempo 29 / 102 ms (re 1),
  b1 Speicher 121 / 232 MB (Ablegen 181 / 37 ms, gewollt), b2 nach Gesang 84 / 107 MB (Szenen danach 65 / 18 ms, gewollt), b8 re 0.
- Einzellauf b7, b8, b1 (t/ab-b7b8.out): 3/3 gleich=true.
- Regression: imp1-test **ALLE OK (127 s)** (t/imp1b.out); imp2-node realvox/imp2rs **ALLE OK** (t/imp2b.out).
- Pflicht (pflicht2.out, smoke2.out): topdefs „Skripte 26, Namen 7929, doppelt 0, Syntaxfehler 0“ · dupkeys „0 doppelte Schlüssel“ ·
  smoke errors [] (smoke2.png) · „MS 2000“ 1× · „^  live: true,“ 1× · VERSION '4.75.0'.
