# CHANGES – Zweig G (Nachtrag 5, Welle 1: G1, danach G2)

## G1 – Quantisieren des Gesangs prüfen und sichtbar machen (4.25.0, 31.10.2026)

Grundlage: Zweig-Kopie `n5-br-G/index.html` ab 4.23.0 (`vs-base-B.html`). Spec: `v3-ideen/dirigent-spec-v3-nachtrag-5.md`, Abschnitt „G1“.
Versionszeile `4.25.0` (APP_CODE 4025000). Format bleibt 5, **kein neues Feld**. Keine CSS-/HTML-Änderung, kein neuer Knopf.
Kein Supabase-Aufruf. **Am Server offen: `max_app` ≥ 4025000** (Xander hebt den Wächter selbst).
Snapshot: `synq-snapshots/G1.html`.

### Schritt 1 – geprüft: wirkt Quantisieren auf das, was man hört? (echte Läufe, gemessen)
Testsignal: 14 gesungene Silben (`vs-dsp/test-signals.mjs` `voice()`, mit Konsonanten, Grundrauschen −66 dBFS), Einsätze 0/±30…±60 ms neben dem
1/8-Raster bei 120 BPM. Gemessen wird am **Ausgang** (AudioWorklet-Aufnehmer aus VS5a-fix2, Blöcke in Ankunftsreihenfolge): Lage jeder Silbe
per Kreuzkorrelation ihrer ersten 15 ms gegen den Mitschnitt, bezogen auf Silbe 1 (liegt auf dem Raster). Skript `n5-g-t1.mjs`,
vorher = dasselbe Skript gegen 4.23.0 (`G_APP=…/vs-base-B.html`, Ausgabe `dirigent-test/n5g/t1-vorher.out`).

Die Abspielkette selbst ist richtig: Szene, Song und „Audio folgt“ spielen die gerechnete Fassung, Rasterbezug (`t0`) stimmt, Cache
und Fassungswechsel liefern die neue Fassung (4.23.0: Dehnen 100 % per API → gehört ±3,4 ms; Scheiben 100 % ±3,0 ms; Song ±3,4 ms).
Gefunden wurden **zwei Ursachen**, warum es für Xander „nicht einschnappt“:

| Ursache | vorher (4.23.0) gemessen | Behebung | nachher (4.25.0) gemessen |
|---|---|---|---|
| **Standard-Stärke** – der Editor öffnet Gesang mit „Dehnen“ **70 %**; ein Tipp auf [1/8] rückt nur 70 % des Wegs | Einsätze 60 ms daneben bleiben **16–20,5 ms** daneben (gehört: 0,4 20,5 −16,2 16,0 −13,9 20,5 −16,9 … ms) | Standard **100 %** auch in „Dehnen“ (`wpDefStr`) | Editor-Tipp [1/8]: alle 14 Einsätze **≤ 3,0 ms** am Raster |
| **Fangfenster ±40 %** – Einsätze weiter als 40 % des Rasterabstands von der Linie blieben stehen. Beim MELODIE-Quantisieren mit „Audio folgt“ gilt das Raster des Clips, nach dem Einsingen meist **1/16** → Fenster nur ±50 ms (120 BPM) | „Audio folgt“ 1/16: **7 von 14** Einsätzen (die 55–60 ms daneben) **unverändert**, gehört 57–62 ms daneben | Fangfenster **±50 %** (`WP_CATCH`): jeder Einsatz rückt auf seine nächste Linie – wie die Noten (`qPos` hat kein Fenster) | „Audio folgt“ 1/16: **14/14** Einsätze ≤ 3,4 ms am Raster |
| Nebenbefund echtes (Fake-)Mikro, ● REC mit 🎤 (`n5-g-probe3.mjs`): Einsätze im Mittelband 40–60 % blieben bei 1/8 stehen | 1/8 aus dem MELODIE-Blatt: 5 von 16 Marken 97–123 ms daneben | wie oben | nur noch Marken, die mit dem Nachbarn auf **dieselbe** Linie fielen, bleiben (Reihenfolge-Regel aus VS5a, unverändert) |

Weitere geprüfte mögliche Ursachen ohne Befund: falsche Fassung (gespielter Puffer = gerechnete Fassung, `wpPlayed`), Cache (nach Laden
rechnet der erste Matrix-Neuaufbau die Fassung vor), Song (gleiche Fassung, ±3,0 ms), „Auto“ im Editor (meldet bei Gesang „Kein Raster
erkannt – Audio bleibt“, wie bisher).

### Was neu ist (Schritt 2 – sichtbar)
1. **Marken springen auf ihre Linie:** Im Marken-Editor stehen die Marken jetzt dort, wo sie **klingen** – quantisiert also auf der
   Rasterlinie (gleiche Pixelspalte wie die Linie). Ändert sich das Ziel (Raster-Chip, Stärke, Modus, ↶ ↷, A/B), gleiten sie in
   **200 ms** (ease-out) dorthin; A/B „Original“ lässt sie zurück an die Quelle gleiten. Der bernsteinfarbene Zielstrich mit Verbindung
   zur Quelle (VS5a) bleibt und zeigt, woher die Marke kam.
2. **Rasterlinien deutlicher:** Takt `#6c7586`, Schlag `#4a5466`, Rasterlinie `#343c4a` (vorher `#59606e`/`#363b46`/`#22262e`).
3. **Wellenform vorher blass / nachher kräftig:** quantisiert zeigt der Editor das Original mit 38 % Deckkraft und darüber die
   **gehörte** Fassung kräftig (die gerechnete; bis sie fertig ist, das Original über die Zeitkarte gelegt). Ohne Quantisierung wie bisher.
4. **Meldung „n Einsätze gerückt“** nach einem Raster-Chip und nach dem Loslassen des Stärke-Reglers (n = Marken, deren Ziel ≠ Quelle).
5. **Gesten auf der quantisierten Ansicht:** Tipp auf eine leere Stelle setzt die Marke an die Take-Stelle, die **dort klingt**
   (Umkehr der Zeitkarte); Ziehen verschiebt die Quelle unter dem Finger, das Ziel rastet wieder ein. Sonst unverändert (K2-64).
6. **STIMME-Spur (Matrix-Zelle) und Song-Stimme** zeigen die gehörte Fassung – das war seit F1 schon so (`tkHeard`), jetzt gemessen (G1-02).
7. **FP-IPHONE:** Die Spitzen der Wellenform je Pixel werden je Ansicht zwischengespeichert; die Animationsbilder zeichnen nur neu.
   Zeichnen je Bild (60-s-Take, 926 px, 236 Marken): 1,4–3,5 ms statt 7–9 ms in 4.23.0.
8. **Test-API:** `wpGeom()` liefert die gezeichneten Marken (`marks`), dazu `src` (Quelle) und `anim`; neu `wpMoved(r)`.

### Abnahme (eigene Läufe, Chromium 1243 headless; Skripte in `dirigent-test/`, Bilder in `dirigent-test/n5g/`)
| ID | Ergebnis | Messung/Skript |
|---|---|---|
| G1-01 | ✓ Editor öffnen, Tipp [1/8] (Standard jetzt Dehnen 100 %): gehörte Einsätze **max 3,0 ms** am Raster (14/14); Stärke 50 % (Regler): halber Abstand **max 1,8 ms**; Scheiben 100 % max 3,4 ms, 50 % max 1,9 ms; im Song max 3,0 ms; „Audio folgt“ 1/16 max 3,4 ms. Vorher (4.23.0) Editor-Tipp: max **20,5 ms** | `n5-g-t1.mjs` (Ausgang mitgeschnitten, Kreuzkorrelation je Silbe), `n5g/t1.out`, `n5g/t1-vorher.out` |
| G1-02 | ✓ in P1, P2, P3, L1, L2, XL: Marken nach dem Tipp **14/14 auf den 1/8-Linien** (Pixelvergleich der weißen Spalten: max 0,50 px neben der Linie; vorher 1–2/14); Animation sichtbar 124–237 ms mit 3–9 Zwischenbildern (Entwurf 200 ms); Meldung „14 Einsätze gerückt“ = Zahl aus der Karte; Wellenform blass/kräftig (z. B. P1: vorher 7 blasse Pixel, nachher 803); Matrix-Zelle = gehörte Fassung (Abweichung 0,0011 gegen 0,795 zum Roh-Take); Song-Stimme 0,0000; Tipp leer und Ziehen auf der quantisierten Ansicht treffen die klingende Stelle (±0,01 ms), ein Undo | `n5-g-t2.mjs`, `n5g/t2.out`, Bilder `n5g/ed-*-vorher.png`, `ed-*-nachher.png`, `song-P1.png` |
| G1-03 | ✓ ↶ (6 Schritte) → keine Karte, keine gespeicherten Marken, Klang = Roh-Take **bitgleich** (192 000 Samples); ↷ → Marken und Karte deep-equal, gehört wieder ≤ 3,4 ms; kein Knacken: M-KLICK der gerechneten Fassung 12,19 dB gegen Original 11,99 dB (Dehnen und Scheiben 100 %), am mitgeschnittenen Ausgang 13,14 gegen 13,07 dB (Ausnahmen nur der gewollte Anschlag jeder Silbe) | `n5-g-t1.mjs` |
| Leistung | ✓ synchroner Teil eines Chip-Tipps (60-s-Take): Median 8,0 ms (4.23.0: 20,7 ms, gleiche VM, schwankt stark); Zeichnen je Bild 1,4–3,5 ms | `n5-g-t4.mjs`, `n5-g-t3.mjs` |
| Smoke | ✓ keine Fehler | `smoke.mjs` |
| Regression | ✓ `v3-vs5a-t2`, `-t3` (Layout, Claude-App), `-t5` (Mikro), `v3-vs5b-t3`, `-t5`; `v3-vs5a-t1`, `v3-vs5b-t1`, `-t2` bis auf die überholten Zeilen unten | `N4APP=…/n5-br-G/index.html node n4-vs-p-reg-gs7-v3-*.mjs` |

**Durch G1 absichtlich überholte Test-Erwartungen (typische-fehler Nr. 26):**
- `v3-vs5a-t1` N7V-26 „1 outside ±40 % unchanged“: die Marke 60 ms neben einer 1/16 rückt jetzt (Fangfenster ±50 %). Alle anderen Zeilen grün.
- `v3-vs5b-t1` „Scheiben 100 % → Dehnen: Stärke wird 70 %“ und `v3-vs5b-t2` „Editor öffnet mit Dehnen 70 %“ / „Chip 1/8 → Dehnen 70 %“
  (je P1, P2, P3, L1, L2): jetzt 100 %. Alle anderen Zeilen (Songtext-Lage, Modus, Layout) grün.

**Vorhandene Befunde (nicht G1):** `v3-vs4-accept` „Audio-Store: … 60 % aufgeräumt“ scheitert an 4.23.0 genauso; „Stimme bleibt im
Pegel (100 %)“ schwankt je Lauf (−0,76 … −1,27 dB, Lage des Fake-Mikros).

### Abweichungen
- **C.5 Nr. 3 und Nr. 4 (Nachtrag 2) geändert, weil G1 sie als Ursache nennt und die Messung sie bestätigt:** Standard-Stärke in
  „Dehnen“ 100 % statt 70 %; Fangfenster ±50 % statt ±40 % (für beide Modi, wie das Noten-Quantisieren). Der Stärke-Regler bleibt;
  wer weniger will, zieht ihn zurück.
- Fallen zwei benachbarte Einsätze auf **dieselbe** Linie, bleibt der mit dem weiteren Weg stehen (Reihenfolge-Regel aus VS5a, nicht
  geändert). Die Meldung „n Einsätze gerückt“ zählt ihn dann nicht mit.
- Die Meldung kommt im Marken-Editor (Chip, Stärke-Regler). Beim MELODIE-Quantisieren mit „Audio folgt“ bleibt der bisherige Toast
  „Quantisiert: …“.
- Messverfahren: Der ScriptProcessor-Aufnehmer verlor in einem Lauf einen 128-Sample-Block (2,9 ms Sprung); deshalb der Worklet-Aufnehmer
  aus VS5a-fix2. M-KLICK mit Grundrauschen statt digitaler Stille (in digitaler Stille zählt ein Rest von −97 dBFS als „+40 dB“).

### Fragen an Xander
1. Fangfenster: Soll im Modus **„Scheiben“** (Beatbox, Perkussives) wieder ein Fenster gelten, damit gewollte Offbeats stehen bleiben?
   (Jetzt rückt in beiden Modi jeder Einsatz auf die nächste Linie.)
2. Soll die Meldung „n Einsätze gerückt“ auch beim MELODIE-Quantisieren mit „Audio folgt“ kommen?
3. In der Song-Ansicht zeigen Szenen-Clips der STIMME-Spur nur die Szenennummer (keine Wellenform); die Song-Stimme (im Song eingesungen)
   zeigt die gehörte Wellenform. Soll auch dort eine Wellenform stehen? (Wäre eine neue sichtbare Änderung – nicht gebaut.)

### iPhone (Xander)
1. Auf https://xanderfoxy.github.io/Synquenzer/ 2 Takte mit Kopfhörern singen (● REC mit 🎤). STIMME-Clip ✎ → [✎ Marken · Quantisieren].
2. [1/8] tippen: Springen die weißen Marken sichtbar auf die Linien? Kommt „n Einsätze gerückt“? Ist die Wellenform dahinter blass und die neue kräftig?
3. Abspielen und mit [A/B] vergleichen: Sitzt der Gesang jetzt hörbar auf dem Takt? Knackt etwas?
4. Den MELODIE-Clip quantisieren („Audio folgt“ an, Raster wie vorgeschlagen): rückt der Gesang mit?

### Für das Zusammenführen
Nur der VS5a/VS5b-Block (`wp*`) und die Versionszeile:
- `const VERSION` → `'4.25.0'`.
- `wpQuant`: neue Konstante `WP_CATCH = 0.5` direkt davor, `catch: WP_CATCH` im Aufruf `VSM.quantizeMarks` (eine Zeile).
- `wpDefStr` → `mode => 1` (eine Zeile + Kommentar).
- `wpOpen`: Kommentar der Zeile `md0`; Chip-Handler (`.then` + `wpMovedToast`); `qset` (Undo-Zeile + `wpMovedToast`).
- `wpPaint`: Rasterfarben (eine Zeile), Wellenform-Abschnitt ersetzt (`wave` mit Zwischenspeicher `E.wc`), Marken über `wpMarkPos`,
  Songtext-Lage `pos = P.map(X)` (die Zeile mit `live` dort entfällt, `live` steht jetzt oben).
- Neu vor `wpHit`: `WP_ANIM`, `wpSame`, `wpMarkPos`, `wpSrcT`, `wpMovedN`, `wpMovedToast`; `wpHit` liest `E.mpos`.
- `wpGest`: zwei Zeilen (`wpSrcT` beim Verschieben und beim Setzen).
- `WP_API.wpGeom` (+ `src`, `anim`), neu `WP_API.wpMoved`.
- Neue Test-Skripte: `dirigent-test/n5-g-h.mjs`, `n5-g-t1.mjs` … `n5-g-t4.mjs`, `n5-g-probe*.mjs`, `n5-g-klick.mjs`.
- Dateigröße +3,7 KB (3 373 859 Bytes).
