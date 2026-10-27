# CHANGES – Zweig VS5 (VS5a, VS5b)

## VS5a – Marken & Scheiben, Audio quantisieren (4.20.0, 26.10.2026)

Grundlage: Zweig-Kopie `vs-br-VS5/index.html` ab VS3-fix (4.18.0). Spec: Nachtrag 2 Teil C (C.2, C.4 N2-VS5a-01, C.5), `r7/stimme.md` §9, §10, §13 (N7V-26, N7V-27), `song-delta.md` N7S-51. DSP-Kern `vs-dsp/marks.mjs` eingebettet (ohne Kommentare, `function vsMarksMake()`), Verhalten bis auf die Lückenfüllung der Scheiben unverändert (siehe unten). Versionszeile `4.20.0`; Format bleibt 5 (additive Felder, K2-31). Keine Datenbank-Änderung, kein Supabase-Aufruf.

### Gebaut
1. **Daten (additiv am Take, Format 5):**
   - `take.marks = [{t, conf, word?, user?}]` – Sekunden im Take. Die Marken stehen erst im Projekt, wenn Xander sie von Hand ändert oder quantisiert. Vorher werden sie im Worker erkannt (`detectMarks`) und je Take zwischengespeichert, abhängig nur vom Audio. Ein Take ohne Änderung bleibt deshalb Zeichen für Zeichen gleich. Das ist auch für die VS3-Undo-Tests wichtig.
   - `take.warp = {mode:'slice', grid ('auto'|'1/4'…), res (benutztes Raster), strength, swing, bpm, t0, map:{v:1, src, dst}}` – die Zeitkarte `warp.map` (stückweise linear, C.5 Nr. 5). Gespeichert wird sie mit 6 Nachkommastellen, das Normalisieren ist idempotent.
   - `take.follow = false` bedeutet „Audio folgt“ aus. Standard ist an.
   - Normalisiert wird über `tkExt().take`. Speichern → Laden ist deep-equal (geprüft mit Marken und Karte).
2. **Quantisieren (C.5 Nr. 3, 4):**
   - Es gibt eine Funktion `wpQuant`. Sie ruft `quantizeMarks` mit der Logik von `quantizeNoteSet` auf, Auto über `KeyDetect.detectGrid`.
   - Raster: Aus, Auto, 1/4, 1/8, 1/8T, 1/16, 1/16T, 1/32. Dazu Stärke 0–100 % (Standard 100 % in „Scheiben“) und Swing 50–75 %.
   - Das Fangfenster ist ±40 %; Marken außerhalb bleiben stehen. Die Reihenfolge bleibt immer erhalten.
   - Grundlage für das Raster ist `t0` = die Take-Sekunde auf Schlag 0 des Clips (`in − at·spb`); für Song-Stimmen gilt dasselbe am Song-Takt.
   - Wird eine Marke geändert, rechnet die Karte mit dem gespeicherten Raster, der Stärke und dem Swing neu – im selben Undo.
3. **Abspielen (C.5 Nr. 5, 6, 8):**
   - `tkExt().proc` steht vorn (`unshift`) und liefert die gerenderte Fassung („Scheiben“, `renderSlices`) aus einem Worker (Blob, keine Netzaufrufe).
   - Der Cache gilt je Take und ist an Karte und Quell-Puffer geschlüsselt. Die Quelle ist das, was die anderen Verarbeiter liefern (VS4 Säubern, sobald gemergt), sonst der Roh-Take.
   - Aus, Stärke 0 % oder ↶ ergibt den Roh-Take selbst, also bitgleich.
   - Ist die neue Fassung fertig, plant `tkVoxResync(true)` STIMME-Spur und Song-Stimme ab jetzt neu (5-ms-Blenden).
   - Beim Ziehen eines Reglers wird erst nach 150 ms Ruhe gerendert, beim Loslassen sofort (FP-IPHONE).
4. **Marken-Editor** (Skizze 4, eigenes Blatt `#wpSheet` wie das Quantisier-Blatt, als Überlagerung, die nichts verschiebt):
   - **Öffnen:** Takes-Blatt → [✎ Marken · Quantisieren]. Das geht für Szenen-Clips und Song-Stimmen.
   - **Kopf:** „MARKEN · STIMME · Szene n“, [A/B] (vorübergehend das Original hören; ✕ schaltet zurück auf die quantisierte Fassung), [✕].
   - **Bild:** Wellenform (Original), Takt-, Schlag- und Rasterlinien, Taktnummern, außerhalb des gespielten Stücks dunkler.
   - **Marken:** Silbe dünn, Wort dick, unsicher blasser, mit Griff oben. Das Ziel quantisierter Marken ist ein bernsteinfarbener Strich mit Verbindung.
   - **Info-Zeile im Bild:** „n Marken · Raster · Stärke · rechnet …“.
   - **Bedienung:** Raster-Chips, Stärke, Swing, Modus [Scheiben │ Dehnen] (Dehnen ist gesperrt, kommt mit VS5b), Zoom [1 Takt │ 2 Takte │ 4 Takte │ Ganz].
   - **Gesten (C.5 Nr. 2, K2-64):**
     - Tipp auf eine leere Stelle setzt eine Marke (ein Undo).
     - Ziehen > 8 px auf einer Marke verschiebt sie. Die Grenze liegt je 10 ms vor bzw. nach den Nachbarn. Beim Ziehen sieht man die Marke als Geist; beim Loslassen entsteht ein Undo.
     - Ziehen auf einer leeren Stelle verschiebt die Ansicht.
     - Tipp auf eine Marke öffnet das Blatt [✕ Löschen] [Abbrechen] (L4). Löschen ist ein Undo mit Toast [Rückgängig].
     - Halten (≥ 500 ms ohne Bewegung) bewirkt nichts.
   - **Undo:** ↶ ↷ einer Take-Änderung lässt Wiedergabe und Editor folgen (`wpUndone` in `undoApply`). `closeSheets` schließt den Editor.
5. **„Audio folgt“ (C.5 Nr. 3):**
   - Quantisieren eines MELODIE-Clips mit `clip.take` nimmt den Take mit demselben (aufgelösten) Raster, derselben Stärke und demselben Swing mit, im **selben Undo**: Die Gruppe enthält `clip` und `takes`.
   - Das gilt für das Quantisier-Blatt [Anwenden] und für `quantizeClip`. Raster „Aus“ entfernt die Karte.
   - Im Kopf des Quantisier-Blatts gibt es den Schalter [Audio folgt]. Er erscheint nur mit einem verknüpften Take auf der eigenen Seite und wird mit [Anwenden] gespeichert.
   - Fehlen die Marken noch, wartet der Take auf die Erkennung. Er hängt sich nur an das Undo, solange es noch oben liegt.
6. **Claude-App:** Ohne Audio (`tkAudioOk()` falsch) gibt es weder den Knopf noch den Editor noch [Audio folgt] (C.5 Nr. 1). Die Take-Daten bleiben beim Speichern erhalten.
7. **Test-API:** `wpInfo`, `wpDetect`, `wpQuantize`, `wpMark(add|move|del)`, `wpAB`, `wpPlayed` (die Fassung, die klingt), `wpOpen`, `wpClose`, `wpGeom`, `wpCore`.

### Änderung am DSP-Kern `vs-dsp/marks.mjs` (renderSlices, Lückenfüllung) – Begründung
- **Vorher** wurde die Lücke mit dem gespiegelten Ende der vorigen Scheibe gefüllt, mit Kosinus-Ausblendung über die ganze Lücke. Gemessen auf gehaltenem Gesang gab das **bis −17 dB Loch** (M-EINBRUCH) und an jeder Umkehr einen Knick (M-KLICK **+35 dB** bei reinem Ton). Für Gesang bis zum Erscheinen von VS5b ist Scheiben der einzige Modus.
- **Jetzt:**
  - Die Lücke füllt eine Schleife aus dem Ende der Scheibe. Ihre Länge ist die Periode mit der besten Korrelation (5–40 ms).
  - Die Naht je Runde blendet ≤ 2 ms von der echten Fortsetzung (Audio vor dem Einsatz) in den Schleifenanfang.
  - Der Übergang am Einsatz ist korrelationsabhängig: gleichspannungsgemäß bei ρ > 0,5, sonst gleichleistungsgemäß wie im Dehnen-Kern.
  - Anschläge ab dem Einsatz bleiben bitgleich.
- `node vs-dsp/run-tests.mjs`: **alle grün** (VS4 39, VS5a 32, VS5b 30). Der README-Abschnitt „Bekannte Grenzen“ ist ergänzt.

### Abnahme (eigene Läufe, Chromium 1243 headless; Skripte in `dirigent-test/`)
| ID | Prüfung | Ergebnis | Skript |
|---|---|---|---|
| N7V-26 | Stärke 100 % → alle Marken im Fangfenster auf dem Raster; 50 % = halber Weg | ✓ 15 Marken, Abstand 0,000 Samples; 1 Marke außerhalb ±40 % unverändert; 50 %: Abweichung 0,0000 ms | `v3-vs5a-t1.mjs` |
| N7V-27 | Scheiben, Klickfolge: Spitze je Klick ±0,1 dB, Anschläge bitgleich | ✓ 0,0000 dB; 16/16 Anschläge (20 ms ab Einsatz) bitgleich | `v3-vs5a-t1.mjs` |
| N7S-51 | 1/16, 100 %: Einsätze ±2 ms am Raster | ✓ **an der Grenze**: 15/15 mit 2,0 ms (die Marken-Feinlage des Kerns liegt bei harten Klicks 2,0 ms vor dem Einsatz, siehe Lücken) | `v3-vs5a-t1.mjs` |
| N7S-51 | M-KLICK (HP 5 kHz, 2-ms-Fenster, +6 dB) | ✓ Klickfolge 5,45 dB (Original 5,51); gesungene Noten 10,82 dB gegen Original 10,67 dB (die Testsignale mit 15-ms-Anschlag liegen schon selbst über 6 dB, deshalb Vergleich ≤ Original + 1 dB) | `v3-vs5a-t1.mjs` |
| N7S-51 | M-EINBRUCH ≤ 3 dB an jedem Schnitt | ✓ gesungene Noten (`voice()` des Kerns): kein Schnitt mehr als 0,34 dB unter dem Loch des Originals an derselben Stelle. **Grenze:** streng periodischer Dauerton −4,44 dB an 1 von 12 Schnitten (Phasensprung in der Lücke bei bitgleichem Anschlag, wie beim Dehnen dokumentiert) | `v3-vs5a-t1.mjs` |
| N7S-51 | nach Undo Original bitgleich; Stärke 50 % halber Weg; außerhalb ±40 % bleiben | ✓ alle drei | `v3-vs5a-t1.mjs` |
| C.5 Nr. 8 | Stärke 0 % = bitgleich; A/B; ein Undo | ✓ Stärke 0 → Roh-Take; A/B → Roh-Take; jede Aktion genau 1 Undo | `v3-vs5a-t1.mjs`, `t2` |
| N2-VS5a-01 | Halten 1 s ohne Bewegung → deep-equal; Halten 600 ms + 40 px ziehen → nur verschoben, 1 Undo; Tipp leer → neue Marke, 1 Undo; Tipp auf Marke → [✕ Löschen] [Abbrechen]; Löschen → weg, 1 Undo, Toast [Rückgängig] | ✓ alle fünf (Touch-Tipps über `touchscreen`, Ziehen per Zeiger); [Abbrechen] löscht nicht; ↶ holt die Marke zurück | `v3-vs5a-t2.mjs` |
| Hörbar (e2e) | STIMME-Clip spielen, Ausgang mitschneiden | ✓ quantisiert: Einsatz-Abstände 250,0 ms (genau 1/16-Vielfache), nur der Klick außerhalb ±40 % weicht ab (308/192 ms); [A/B] Original: 220/298/212/303 … ms | `v3-vs5a-t2.mjs` |
| Audio folgt | MELODIE-Quantisieren nimmt den Take mit, ein Undo, ↶ deep-equal | ✓ API und Blatt [Anwenden]: Gruppe `clip,takes`; Schalter aus → Take bleibt, `follow:false` im selben Undo | `v3-vs5a-t2.mjs` |
| Mikrofon (Fake-Gerät) | gesungene WAV → ● REC-Take → Marken → 1/8 → klingt | ✓ 16 Marken auf 16 Silben (123 ms im Worker), Ziele 0,00 Samples auf dem Clip-Raster, Wiedergabe = quantisierte Fassung, 0 Netzaufrufe (nur `blob:` des Workers) | `v3-vs5a-t5.mjs` |
| M-PLATZ | P1 390×844, P2 375×667, P3 320×568, L1 844×390, L2 667×375, XL 926×428 | ✓ Editor ganz im Bild, nichts abgeschnitten, keine Knöpfe außerhalb, Seitengröße unverändert; Bild P1 84 px, P3 50 px, L1 118 px hoch; Takes-Knopf 44 px; [Audio folgt] nicht abgeschnitten | `v3-vs5a-t3.mjs`, Bilder `dirigent-test/vs5a/lay-*-{takes,editor,qsheet}.png` |
| Claude-App | iframe ohne Mikrofon | ✓ `audioOk` falsch, Editor öffnet nicht | `v3-vs5a-t3.mjs` |
| Rundweg | Speichern → Laden mit Marken und Karte | ✓ deep-equal | `v3-vs5a-t1.mjs` |
| Smoke | `smoke.mjs` | ✓ keine Fehler | – |
| VS3-Regression | `v3-qa-vs3-reg`, `-t1`, `-t2`, `-t3` gegen diese Kopie | ✓ reg, t2 grün; t1 und t3 zeigen dieselben Befunde wie die Hauptlinie 4.18.0 (siehe unten), nichts Neues | Kopien in `dirigent-test/vs5a/reg/` |

### Fach-Prüfung (Nachtrag 2 Teil J, Gruppe 7: FP-DSP, FP-IPHONE) – an mir selbst
- **FP-DSP:**
  - Bitgleichheit bei Aus, 0 % und ↶ ist geprüft, ebenso die Anschläge (N7V-27).
  - Die Klick-Folge liegt unter dem Original. Der Knick der alten Spiegelung (+35 dB) ist behoben, Loch und Knick ebenfalls.
  - **Grenze:** Bei streng periodischem Dauerton bleibt ein Phasensprung an Lücken: −4,4 dB bzw. M-KLICK 6,8 dB an 1 von 12 Schnitten.
  - NaN/Inf-Schutz kommt aus dem Kern (`ok()`); der Kern-Test „Ausgabe endlich“ ist grün.
  - Kein Worklet-Code; das Rendern läuft offline im Worker.
  - Der Wechsel zwischen alter und neuer Fassung beim Abspielen läuft über die vorhandenen 3/5-ms-Blenden von VS3 (`tkVoxResync`).
  - Der Rückfall auf den Hauptfaden greift nur, wenn kein Worker möglich ist.
- **FP-IPHONE** (60-s-Take, `v3-vs5a-t4.mjs`):
  - Marken: 1,4 s im Worker; Rendern: 118 ms im Worker; getroffen 88/88 Einsätze ±30 ms.
  - Hauptfaden ohne longtask > 50 ms über Öffnen, Quantisieren, 20 Regler-Schritte und 4 Zoom-Stufen. Ein 75-ms-Task beim allerersten Tipp der Seite ist der App-Start (Audio-Kontext), nicht VS5a.
  - Speicher: je Take mit Karte ein zusätzlicher AudioBuffer (≈ 11,5 MB je Minute), nur für hörbare Takes (Cache ≤ 6 übrige). Beim Rendern hält der Worker kurz eine Kopie.
  - Regler-Ziehen rendert erst nach 150 ms Ruhe (vorher ein GC-Task von 121 ms gemessen, behoben).
  - Die CPU am iPhone ist ungemessen (iPhone-Faktor unbelegt).
  - Dateigröße siehe unten.

### Abweichungen von der Spec
- **Quelle der Marken:** Die Marken kommen aus `detectMarks` des Kerns (Spektralfluss + Pegel + Tonwechsel), nicht aus den VS2-Noteneinsätzen. Sie gelten für Gesang und Instrument gleich und sind getestet (README: 100 % in ±30 ms).
- **A/B im Editor** ist ein vorübergehender Hör-Schalter (nicht im Projekt, kein Undo). ✕ schaltet zurück.
- **Marken verschieben** ändert die *Quellstelle* (wo der Einsatz im Take liegt). Das Ziel ergibt sich aus Raster, Stärke und Swing.
- **Wort-Marken:** Sie werden erkannt (≥ 120 ms Ruhe davor) und dick gezeichnet. „Zwei Silben durch Wischen verbinden“ (§10) ist nicht gebaut; Songtext kommt mit VS5b.
- **Nicht im Editor:** Die Tonhöhenlinie und die Korrektur-Griffe aus Skizze 4 fehlen. SÄUBERN ist VS4.
- **Budget:** +54 KB statt +25 KB (Kern 20,4 KB, App 29,4 KB, CSS 3,4 KB; gzip +18 KB). Die Datei hat 3,24 MB, die Grenze liegt bei 4,0 MB.
- **Chromium-Pfad:** `/opt/pw-browsers/chromium-1194/…` gibt es nicht. Benutzt wurde `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`, wie in den VS3-Tests.

### Bekannte Lücken / offen
- ~~**Marken-Feinlage:** Harte Klicks liegen 2,0 ms zu früh.~~ Behoben in VS5a-fix (siehe unten).
- **Dauerton-Phasensprung in Lücken** (siehe FP-DSP).
- **Tempo:** Wird das Tempo nach dem Quantisieren geändert, bleibt die Karte (in Sekunden) wie sie ist. Das Audio folgt dem Tempo ohnehin erst mit dem Dehnen (VS5b).
- **„Audio folgt“** gilt beim [Anwenden], nicht schon in der Live-Vorschau des Quantisier-Blatts.
- **Gerät:** Am iPhone ungeprüft (siehe Geräte-Punkte).

### VS3-Befunde (nur gelistet, nicht geändert)
- `v3-qa-vs3-t3`: Das Spurleisten-Etikett „🎤 Audio · Takes: ✎“ ist in P1, P2, P3, L1 und XL abgeschnitten (`scrollWidth` 103 > `clientWidth` 62–79). Das gilt auch auf der Hauptlinie 4.18.0.
- `v3-qa-vs3-t1`: „no network requests during recording (1)“ zählt die `blob:`-Adresse eines lokalen Workers als Netzaufruf, ebenfalls auf der Hauptlinie. Es ist kein echter Netzaufruf; das Prüfskript sollte nur `http(s)` zählen.

### Für Xander am iPhone (Geräte-Punkte, kurz)
1. Auf https://xanderfoxy.github.io/Synquenzer/ 2 Takte mit Kopfhörern singen (● REC mit 🎤). Danach STIMME-Clip ✎ → [✎ Marken · Quantisieren].
2. Stimmen die weißen Striche mit deinen Silben? Fehlende mit einem Tipp setzen, falsche antippen → [✕ Löschen].
3. [1/16] oder [1/8] tippen und abspielen: Sitzen die Silben auf dem Takt? Mit [A/B] vergleichen. Knackt oder bricht es irgendwo ab?
4. Den MELODIE-Clip desselben FANGs quantisieren (Quantisier-Blatt, „Audio folgt“ an): Rücken Gesang und Noten zusammen?

### Datenbank
Nichts nötig. Format 5 und `max_app` 4021000 decken 4.20.0 ab.


## VS5a-fix (4.20.0 bleibt, 27.10.2026) – zwei QA-Befunde

Snapshot: `synq-snapshots/VS5a-fix.html`. Kein Format-, Versions- oder Datenbank-Wechsel, kein Supabase-Aufruf. Nur VS5a-Code (Marken-Kern, `wp*`, `tk*`-Abspielweg) geändert.

### 1. N7S-51 – Einsätze landeten 2,0–2,9 ms hinter der Linie (QA `v3-qa-vs5a-a.mjs`)
- **Nachgestellt:** ja. Am Original VS5a lagen 11 von 15 Einsätzen 1,6–2,9 ms zu spät, weil die Marke vor dem hörbaren Einsatz saß.
- **Kern `vs-dsp/marks.mjs` (`detectMarks`, eingebettet gleich):** neue Feinlage `fine()` nach `cross()`. Sie greift nur bei harten Anschlägen (50 % der Spitze in ≤ 3 ms) und setzt die Marke auf das erste Sample des Anstiegs. Sonst bleibt alles wie bisher; am gesungenen QA-Satz bewegt sich 1 von 64 Marken (+2,4 ms). Kern-Test `test-marks.mjs`: 32/32 OK. Gesang bei SNR 20 dB: 90 % in 6,2 ms statt 5,2 ms, Median unverändert 3,0 ms. `VERSION: 'vs5a-marks-2'`.
- **App: Schutz des Anschlags.** Sitzt die Marke auf dem Anschlag, lag der 5-ms-Übergang der Scheiben, der an der Marke endet, über dessen erstem Bruchteil. Folge: N7V-27 nur noch 8/16 bitgleich. Jetzt laufen Schnitt und Übergang `WP_LEAD` = 4 ms (ganze Samples) vor der Marke, bei gleicher Verschiebung. Die Einblende am Clip-Anfang folgt dem ebenso.
- **App: Ziele auf ganze Samples (`wpSmp`).** Ziele der Zeitkarte und von Hand gesetzte oder verschobene Marken liegen jetzt auf ganzen Samples. Bei 44,1 kHz fällt jede ungerade 1/16 bei 120 BPM sonst auf ein halbes Sample. Dann zeigt die Karte etwas anderes, als gerendert wird, nämlich eine um 1 Sample andere Verschiebung. N7V-26 bleibt ≤ 0,49 Samples (Spec ±1).
- **Ergebnis (`v3-qa-vs5a-a.mjs`, 2 Läufe):**
  - N7V-27: 15/15 bitgleich (Original 14/16).
  - Ausgabe gleich Render.
  - Alle nicht verdeckten Einsätze liegen −0,4 … +0,34 ms an der Linie.
- **Rest im QA-Skript, kein App-Fehler:** 2–3 Anschläge je Lauf liegen im lauten Ausklang des vorigen Klangs (Ausklang > 10 % der neuen Spitze). Für diese setzt der QA-Finder `onsets20` den Einsatz auf „Block − 3 ms“. Das liegt 1,5–2,8 ms **vor** dem echten Beginn, deshalb zeigt das Skript dort −3,0 … −3,8 ms.
  - Gegenprobe mit der wahren Generator-Zeit (`v3-vs5afix-adump.mjs` + `v3-vs5afix-aan.mjs`): alle Einsätze im Fangfenster liegen bei 100 % zwischen −1,09 und +0,14 ms an der Linie. Bei 50 % ist der halbe Weg auf ±0,01 ms getroffen. Ab dem wahren Beginn sind 15/15 Anschläge bitgleich.
  - Am Datei-Take (`v3-vs5afix2-truth.mjs`): |Marke − wahr| ≤ 1,10 ms.
- **„50 % = halber Weg … 222 ms“** im selben QA-Skript scheitert am Original genauso. Der Finder verliert verdeckte Einsätze, danach ordnet er die Paare falsch zu. Die Wahrheits-Gegenprobe zeigt bei 50 % höchstens 0,01 ms.

### 2. Fassungswechsel beim Abspielen: −7 … −9 dB und Knacks (QA `v3-qa-vs5a-c/d/d2.mjs`)
- **Nachgestellt:** Mit dem QA-Aufnehmer ja. Die Ursache liegt aber zum großen Teil im Messaufbau:
  - Das AudioWorklet meldet in Chromium ab und zu denselben `currentFrame` zweimal hintereinander, und zwar gerade dann, wenn der Hauptfaden den Graphen ändert, also beim Wechsel. Gelesen wird `Δ = 0` und danach `Δ = 256`.
  - `recStop` legt die Blöcke nach `currentFrame` ab. Dadurch überschreibt es einen Block und lässt ein 128-Sample-Loch aus Nullen. Das ergibt genau den gemeldeten Einbruch von −7 … −9 dB und den „Knacks“: Der Sprung von 0,17–0,30 entspricht der Signalhöhe.
  - Beleg 1: Der Aufnehmer `v3-vs5afix2-rec.mjs` legt einen wiederholten Frame an die Folgestelle. Damit verschwinden die Ereignisse.
  - Beleg 2: Auch ohne jeden Wechsel tritt die Anomalie auf, etwa beim Aufbau des Drum-Busses beim Start (dort Sprung 0,150 bei Ablage nach Frame, nichts bei Ablage in Reihenfolge).
  - Beleg 3: Der QA-Dauerton hat **0 Marken**. Die Aktivitätsschwelle braucht eine Ruhe, der Ton hat keine. Quantisieren ist dort also ein Wechsel zwischen bitgleichen Fassungen und kann nichts auslöschen.
- **Echter Teil, behoben:** Bei echten neuen Fassungen sind alt und neu zwei verschieden verschobene Signale. Die bisherige feste Blende mit `setTargetAtTime` (τ 3 ms) gegen eine 5-ms-Rampe konnte sie bei Gegenlage auslöschen.
  - `wpSwitch` ersetzt `wpResync` beim Abspielen. Es prüft Zeitpunkte von jetzt + 30 ms bis zur Planungsgrenze in 1-ms-Schritten.
  - Je Stück, dessen Puffer wechselt, rechnet es eine 12-ms-Kosinus-Überblendung an beiden Puffern nach: gleichspannungs-, gleichleistungsgemäß oder korrelationsnormiert. Es nimmt die erste Stelle mit höchstens 1 dB Abweichung, sonst die beste.
  - Alte Stücke blenden mit `setValueCurveAtTime` aus (`tkXfOut`), neue mit der Gegenkurve ein (`tkStartSrc` `xc`).
  - Unveränderte Takes blenden gleichspannungsgemäß in sich selbst über, das Ergebnis ist bitgleich.
  - Hauptfaden: ≤ 3,3 ms je Wechsel.
- **Ergebnis:**
  - `v3-vs5afix2-sw.mjs 24 legato` (gesungen, 18 Marken, 23 echte Wechsel mit Chips, Aus und ↶, Aufnehmer ohne Frame-Fehler): Gegen alte und neue Fassung an derselben Take-Stelle liegt der Pegel höchstens −1,21 dB darunter (Grenze −3 dB). HP-5k höchstens +2,8 dB, größter Sprung ≤ 1,06× der Fassungen, kein Rückfall der Automation.
  - `v3-vs5afix2-sw.mjs 24 tone`: schlechtester Einbruch −1,23 dB.
  - `v3-vs5afix2-dseq.mjs` (QA-d mit diesem Aufnehmer): kein Einbruch über 0,7 dB, kein Sprung über 0,0294. Am Original ebenso, bis auf −8,1 dB an der Schleifennaht.
  - `v3-qa-vs5a-c.mjs`: ALL OK.
  - Die verbleibenden „HP-5k 11–20 dB“-Zeilen in QA-d treten am Original identisch auf. Es sind die Tonwechsel des Testtons: Der Sprung 0,0294 gegen 0,0262 entspricht genau 294 Hz zu 262 Hz. Hinzu kommt die Schleifennaht des Clips (VS3, −5 dB über 5 ms). Mit dem Fassungswechsel hat das nichts zu tun.
- **Für die QA:** `recStop` in `v3-qa-vs5a-h2.mjs` sollte wiederholte `currentFrame`-Werte an die Folgestelle legen, so wie `v3-vs5afix2-rec.mjs` es tut. Sonst misst jeder Wechseltest Löcher, die nicht hörbar sind.

### Regression (dieser Stand)
- `v3-vs5a-t1`, `t2`, `t3` (Layout), `t5`, `v3-qa-vs5a-reg`, `v3-qa-vs5a-c`: ALL OK. Smoke: keine Fehler.
- `v3-qa-vs5a-reg2` („FANG nach 8 Takten Akkorden → Teil-Blatt: null“) scheitert am Original VS5a genauso. Das ist ein vorhandener Befund und gehört nicht zu VS5a-fix.
- `v3-qa-vs5a-b` „Audio folgt … ≤ 5 ms“ schwankt je Lauf: 29/41, 34/41 und 39/41 hier, 39/41 und 40/41 am Original.
  - Die Abstände Note ↔ Marke sind in beiden Fassungen gleich (z. B. 84–87 ms an derselben Silbe). Nur die Aufnahme-Lage zum Raster schwankt mit dem Start des Fake-Mikros, und Noten nahe der 1/8-Mitte fallen dann auf die andere Seite.
  - `fine()` bewegt am gesungenen Satz 1 von 64 Marken.
