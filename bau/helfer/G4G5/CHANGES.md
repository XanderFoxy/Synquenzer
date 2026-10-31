# G4 + G5 — Gesangs-Effekte („Gesang Synthpop“, [Auto], Silben-Dynamik) und „In Melodie umwandeln“ · Helfer-Zweig `helfer-g4g5`

Grundlage: `bau/werkzeug/vs-base-B.html` (App 4.23.0) → Kopie `bau/helfer/G4G5/index.html`. Spec: `spec/dirigent-spec-v3-nachtrag-5.md`,
Abschnitte „G4“, „G4 ergänzt“ (Nr. 4, G4-06) und „G5“. **VERSION-Zeile unverändert** (setzt der Dirigent). **Format bleibt 5**, nur ein
additives Feld (`track.gfx` an der STIMME-Spur). Kein Supabase-Aufruf, kein `alert/confirm/prompt`, „MS 2000“ weiter genau einmal, kein
Fremdname. VS-P, VS-L, G1/G2, G3/G8 und Video nicht angefasst.

## Was neu ist

### G4 — Gesangs-Effekte der STIMME-Spur
1. **Spur-Blatt der STIMME-Spur → [Effekte]** öffnet das Blatt „STIMME · Effekte“ (wie das Takes-Blatt):
   - oben **[Gesang Synthpop] [Aus] [Auto] [A/B]**, darunter eine Zustandszeile,
   - zehn große Regler: **Hochpass** (40–300 Hz) · **Entzischer** (0–12 dB) · **Silben-Dynamik** (0–100 %) · **Schwelle** (−40…0 dB) ·
     **Verhältnis** (1–10 : 1) · **Tief** · **Mitte** · **Präsenz** (je ±12 dB) · **Hall** · **Delay** (Sends, 0–100 %).
   - Hochkant eine Spalte (320 × 568: rollt mit dem Finger), quer zwei Spalten.
2. **Kette** (je Take, in dieser Reihenfolge): Hochpass 24 dB/Okt. → Silben-Dynamik → Entzischer → Kompressor → EQ (Tief 150 Hz Kuhschwanz,
   Mitte 500 Hz, Präsenz 3 kHz) → **[Haken für VS-P: Auto-Pegel → Begrenzer]**. Hall/Delay = die Sends der STIMME-Spur.
   - **Offline vorausgerechnet** aus dem bekannten Take im Worker (Blob, Rückfall Hauptfaden), wie VS4/VS5a: keine Verzögerung gegen die
     anderen Spuren, **keine Rechenlast beim Abspielen**, kein neuer Audio-Knoten. Neue Fassung (Regler, A/B, Undo) wird an einer passenden
     Stelle überblendet (`wpSwitch` aus VS5a-fix) – kein Knacken.
   - **Pegel bleibt:** am Ende wird auf die Lautheit des Takes zurückgestellt (gemessen unter 4 kHz, damit Entzischer/Präsenz die Gesamt-
     lautstärke nicht verschieben). VS-P gleicht danach auf −16 LUFS aus.
   - **Reihenfolge je Take:** Säubern (VS4) → G4 → Zeitkarte (VS5a/b). G4 steht in `tkExt().proc` direkt hinter `wpProc`.
     VS-P misst den Puffer, den `tkPlayBuf` liefert = **nach G4** – der Haken für VS-P ist damit schon da (nichts weiter einzubauen).
3. **Voreinstellung „Gesang Synthpop“** (an für jede neue STIMME-Spur, auch wenn eine leere Zusatzspur umgeschaltet wird; ↶ nimmt sie mit):
   Hochpass 100 Hz · Entzischer 4 dB · Silben-Dynamik 80 % · Schwelle −24 dB · 3 : 1 · Tief −1 · Mitte −2 · Präsenz +3 dB · Hall 18 % · Delay 10 %.
   Kompressor: RMS 10 ms über das Signal bis 3 kHz (Zischlaute regeln ihn nicht), weiches Knie 6 dB, Anstieg 15 ms (Anschlag bleibt „knackig“),
   Abfall 150 ms (kein Pumpen). Entzischer: Band 5–9 kHz gegen das ganze Signal, senkt nur das Obere ab 3,5 kHz, nur Zischlaute ≥ 20 ms (ein
   kurzer Anschlag „t“, „k“ bleibt).
4. **[Auto]** misst die hörbaren Takes der STIMME-Spur (höchstens 2 min) und – während ▶ läuft – 4 s lang den Mix (Ausgang jeder anderen
   Spur, Präsenzband 2–5 kHz):
   - Dynamik → **Schwelle/Verhältnis** (kleinstes Verhältnis, das die Kurzzeit-Spanne auf ≤ 4 LU bringt),
   - Zischlaute → **Entzischer** (Spitzen 5–9 kHz sollen ≥ 8 dB unter dem Vokal liegen),
   - Maskierung → **Präsenz** anheben, wenn nötig **Mitte/Tief** absenken, bis der Gesang im Band 2–5 kHz ≥ 3,5 dB über der lautesten anderen
     Spur liegt (gerechnet mit dem Pegel, den VS-P der Stimme gibt; ohne VS-P mit dem tatsächlichen Pegel),
   - Ergebnis steht sofort in den Reglern (ein Undo „Effekte: Auto“); die Zustandszeile nennt Dynamik vorher → nachher und die Gegenspur.
5. **Silben-Dynamik (G4 ergänzt 4):** je Silbe (VS5a-Marken: von Hand gesetzte/quantisierte, sonst der VS5a-Erkenner an der Quelle, auf die G4
   wirkt) ein fester Ausgleich zur Mitte der Nachbar-Silben (±3 s), Stärke = Regler; der Wechsel endet 2 ms vor der Marke (Anschlag
   unverändert), Pausen und stimmlose Silben (Zischlaut, Atem) bleiben ±0 dB, Anschlag + Vokal näher als 80 ms = eine Silbe.
6. **A/B:** [A/B] schaltet sofort zwischen „mit Effekten“ und „ohne“ (der Take wie bisher, bitgleich; Sends wie im Klang). Blatt zu → wieder
   „mit Effekten“. **Aus** schaltet die Kette ab (die Werte bleiben); [Gesang Synthpop] setzt die Voreinstellung (je ein Undo).
7. **Daten:** `track.gfx = {on, hp, ds, sy, thr, ra, lo, mid, pre, rev, dly}` nur an der STIMME-Spur (`normTrack`), Werte geklemmt und
   gerundet (idempotent). **Fehlt das Feld (alle alten Projekte), ist die Kette aus – alte Projekte klingen bitgleich wie bisher.**
   Undo-Art `gfx` (eine Zeile in `undoState`/`undoApply`). In der Claude-App (kein Audio): Regler gesperrt, Daten bleiben deep-equal.

### G5 — Gesang jederzeit in Melodie umwandeln
1. **Takes-Blatt → [In Melodie umwandeln]** (Szene-Clip und Song-Stimme; nur mit Audio auf der eigenen Seite).
2. Die **VS2-Erkennung** läuft auf dem gespeicherten Take: gleiche 3:1-Dezimierung wie das Worklet (47 Abgriffe), pYIN im Worker, `vsNotesOf`
   (Segmentierung, Stimmung, Einrasten auf die Tonart der Szene bzw. des Songs). Bei SÄUBERN > 0 auf der gesäuberten Fassung.
   Funktioniert auch, wenn beim Aufnehmen keine Noten erkannt wurden.
3. **Szene-Clip → MELODIE-Clip in derselben Szene** (gleiche Länge, nennt den Take wie FANG → „Audio folgt“), **Ergebnis-Blatt wie FANG**
   („GESUNGEN · umgewandelt · T 1–n“: Oktave, Einrasten, Raster, [Verwerfen], [✎ Bearbeiten], OK). Ein vorhandener MELODIE-Clip wird
   ersetzt; ↶ bzw. [Verwerfen] stellt ihn wieder her. Ein Undo „In Melodie umwandeln“.
4. **Song-Stimme → Song-Melodie** (Spur der Song-Melodie) an derselben Stelle: die Noten im Bereich der Song-Stimme werden ersetzt,
   Raster wie im Stimme-Blatt; ein Undo (Song), Toast „n Noten → Song-Melodie · Takt a–b“ mit [Rückgängig].

### Test-API (neu)
`g4Info`, `g4Set(p, label)`, `g4Preset`, `g4Off`, `g4AB(v)`, `g4Auto`, `g4Wait`, `g4Played(id)`, `g4PlayRange`, `g4Core`, `g4Mix`, `g4Sheet`,
`g4Close`; `g5Convert(r)`, `g5Info`.

## Abnahme

Chromium 1243 headless, Mikro-Attrappe (VS2-Harness), Takes über `tkInject` (gleicher Weg wie ein Take ohne Noten). Skripte in
`bau/helfer/G4G5/tests/` (Ausgaben im Scratchpad). G4-03 im **zusammengeführten Stand G4G5 + VS-P** (`git merge-file`, 0 Konflikte), weil
die Stimme erst mit VS-P auf Mix-Pegel kommt.

| ID | Ergebnis | Messung |
|---|---|---|
| G4-01 | ✓ | Gesungene Phrasen mit Pegelsprüngen (−34 … −20 dBFS, 26 s): Kurzzeit-Lautheit 10–95 % (LRA, EBU 3342) **12,30 → 5,54 LU = 6,77 LU kleiner** (Soll ≥ 4); integrierte Lautheit −24,65 → −24,65 LUFS. Kein Pumpen: gehaltener Vokal −22 / −32 dBFS, 50-ms-Pegel nach dem Einschwingen schwanken 0,000 dB (Soll ≤ 0,5). `g4-accept.mjs 01` |
| G4-02 | ✓ | Gesang + 9 Zischlaute (Rauschen 4,5–10 kHz, 160 ms): Spitzen 5–9 kHz (10-ms-RMS), Kette „Gesang Synthpop“ gegen dieselbe Kette mit Entzischer 0: **−4,09 dB** (jeder Laut −4,0 … −4,1; Soll −4 ± 1). Vokale ohne Zischlaut 5–9 kHz: Median +0,06 dB (kein Fehlgriff). `g4-accept.mjs 02` |
| G4-03 | ✓ (mit VS-P) | Zusammengeführt G4G5 + VS-P, Demo-Projekt, Take in Szene 0, Ausgänge aller Spuren mitgeschnitten, Band 2–5 kHz. Korpus-Stimme weiblich: vor Auto +0,28 dB → **nach Auto +3,72 dB** über Drums (Präsenz +7, Mitte −5). Korpus-Stimme männlich: −1,26 → **+3,43 dB** (Präsenz +9, Mitte −5, Tief −3 = Anschlag). Ergebnis steht in den Reglern; ein Undo nimmt Auto zurück. Siehe Abweichungen 1–2. `g4-auto.mjs <merge> female|male` |
| G4-04 | ✓ | Demo-Projekt + Gesang, 2 × 90 s abwechselnd je Fassung, CPU-Zeit aller Chromium-Prozesse: aus 53,16 %, „Gesang Synthpop“ 53,36 % → **+0,20 %** (Soll ≤ +3; Messrauschen – beim Abspielen gibt es keinen zusätzlichen Knoten). Rechnen einmalig je Take im Worker: 149 ms für 4 Takte, 329 ms für 26 s. `g4-cpu.mjs 180` |
| G4-05 | ✓ | A/B sofort (ohne = Roh-Puffer bitgleich, zurück ohne Neurechnen), Regler + Hall-Send folgen; ein Undo / Redo deep-equal; Speichern → Laden deep-equal mit gfx; altes Projekt ohne gfx: keine Effekte, Takes bitgleich, kein Feld gfx im Projekt. Layout P1, P2, P3, L1, L2, 926 × 428: Spur-Blatt [Effekte] 96 × 44, Blatt „Effekte“ 14 Tasten/Regler ≥ 44 × 44, nichts abgeschnitten, im Bild (P3 rollt, letzter Regler erreichbar), kein Layout-Sprung (25/25). Kein Knacken bei 7 Wechseln im Spielen (A/B ×4, Präsenz, Aus, Voreinstellung): 2. Differenz 4,3·10⁻⁴ ≤ Ton-Krümmung 1,55·10⁻³. `g4-accept.mjs 05`, `g4g5-lay.mjs`, `g4-click.mjs` |
| G4-06 | ✓ | 40 Silben, Pegel zufällig ±6 dB, je mit Anschlag; Marken vom VS5a-Erkenner. Nur Silben-Dynamik: Spanne (10–90 %) **10,52 → 3,85 dB = 63 % kleiner** (Soll ≥ 50 %), Anschläge: Spitze der ersten 10 ms gegen den Silben-Pegel Median −0,03 dB, 90 % ≤ 0,60 dB. Ganze Kette: 75 % kleiner, Anschläge Median +1,29 dB (nicht gedämpft). `g4-accept.mjs 06` |
| G5-01 | ✓ | Drei Takes ohne Noten (Korpus-Stimme VS2, männlich/weiblich, je 24 Noten, a-Moll, 100 BPM) → [In Melodie umwandeln]: **Noten-F 1,000 / 1,000 / 1,000** (Einsatz ±50 ms, Ton exakt; Soll ≥ 0,9), 0,9 s je 15-s-Take; MELODIE-Clip nennt den Take; Ergebnis-Blatt „GESUNGEN · umgewandelt · T 1–7“. `g5-accept.mjs` |
| G5-02 | ✓ | Ein Undo nimmt den Clip zurück, Redo bringt ihn; vorhandener MELODIE-Clip wird ersetzt und mit [Verwerfen] deep-equal zurückgeholt. |
| G5-03 | ✓ | Song-Stimme Takt 3–8 → Song-Melodie (Spur 5): 20 Noten an derselben Stelle, **Noten-F 1,000**; ein Undo → Song deep-equal. |
| Reihenfolge | ✓ | `tkExt().proc` = [Zeitkarte, G4, Säubern]: mit Zeitkarte klingt die Scheiben-Fassung, gerechnet aus der G4-Fassung; A/B „ohne“ → aus dem Roh-Take. `g4-chain.mjs` |
| Rauchtest | ✓ | `smoke.mjs`: keine Konsolenfehler. |
| Regression | ✓ / siehe unten | VS3 (`v3-vs3-accept` über VS-P-Harness): **alles grün** mit G4G5. VS4/VS5a/VS5b mit G4 **aus** für neue Spuren (`g4off.html`): VS4-accept 25 ✓/1 ✗ (= Basis 4.23.0, gleicher Punkt „Audio-Store“), VS5a-t1 20/0, VS5b-t1 32/0 (Basis 31/1), VS4-click, VS5a-t3, VS5b-t3 gleich der Basis. Mit G4 an: absichtlich überholte Erwartungen (Regel 26), siehe unten. |
| Merge | ✓ | `git merge-file` G4G5 × vs-base-B × vs-br-VSP: **0 Konflikte**; × vs-br-VSL: **0 Konflikte**. |

**Überholte Test-Erwartungen (Regel 26, durch G4 absichtlich):** Neue STIMME-Spuren haben „Gesang Synthpop“ an, also klingt nicht mehr der
Roh- bzw. gesäuberte Take selbst. Diese Punkte prüfen „bitgleich zum Roh-Take“ an einer neuen STIMME-Spur und schlagen deshalb fehl:
- VS4-accept: „N7V-24 bei 0 % spielt der Roh-Puffer bitgleich“, „N7V-21 SÄUBERN 100 %“ (liest den Puffer, solange die G4-Fassung der neuen Stärke noch rechnet).
- VS5a-t1 (6 Punkte): „attacks bit-identical“, „peak per click“, „M-KLICK slices“, „A/B original“, „strength 0 → raw“, „after undo bit-identical“.
- VS5b-t1 (8 Punkte): „first 20 ms after each mark bit-identical“, „length per slice“ und die „→ original bit-identical“-Punkte.
Mit G4 aus sind alle wie in der Basis (oben). Für diese Tests: `SYNQUENZER.g4Off()` nach dem Anlegen der Spur.

## Abweichungen
1. **G4-03 nur zusammen mit VS-P messbar.** Ohne VS-P kommt die Stimme mit dem Mikrofon-Pegel in den Mix (≈ 13–14 dB unter den Drums im
   Band 2–5 kHz); Auto setzt dann alles auf Anschlag und erreicht trotzdem nur −8,7 dB. Mit VS-P (zusammengeführt) ✓. Auto rechnet mit dem
   Pegel, den VS-P geben wird (`typeof vpGet`), und ohne VS-P mit dem tatsächlichen.
2. **G4-03 mit dem synthetischen Vokal „a“** der VS-P-Bibliothek nicht erreichbar (−9,2 dB): der Vokal hat fast keine Energie bei 2–5 kHz
   (kein Sänger-Formant). Mit den Korpus-Stimmen ✓. Die männliche Stimme braucht den ganzen Bereich (Präsenz +9, Mitte −5, Tief −3) und
   liegt mit 3,4 dB knapp über dem Soll.
3. **Mix-Messung nur bei ▶:** Ein echtes Offline-Rendern aller Synth-Spuren gibt es in der App nicht. [Auto] misst deshalb den Mix 4 s live
   an den Ausgängen der Spuren (nach Pegel/Pan/Mute), während ▶ läuft. Ohne ▶ setzt Auto nur Dynamik und Entzischer, und die Zustandszeile
   sagt „Mix nur bei ▶“.
4. **„Gegenspur-Kerbe nur im Gesang“** habe ich als „nur die Gesangsspur wird verändert“ gelesen: Präsenz anheben, wenn nötig Mitte/Tief
   der Stimme senken. Eine Kerbe in der anderen Spur gibt es nicht (siehe Fragen).
5. **Kette offline je Take statt Echtzeit-Knoten:** Das ist dasselbe Muster wie VS4/VS5a. Der Gewinn: Rechenlast beim Abspielen 0 und keine
   Verzögerung. Der Preis: Nach einem Regler kommt die neue Fassung nach dem Rechnen (150 ms Ruhe, dann 0,1–0,4 s) mit einer Überblendung;
   bis dahin klingt die vorige.
6. **Speicher:** je hörbarem Take liegt zusätzlich die G4-Fassung im Speicher (≈ 11,5 MB je Minute Gesang, wie der VS4-Cache). „Aus“ gibt
   den Speicher frei.
7. **Hall/Delay:** Solange die Effekte an sind, kommen die Sends der STIMME-Spur aus dem Blatt „Effekte“. Hall/Delay im (versteckten)
   Klang der Spur wirken dann nicht; mit „Aus“ oder A/B „ohne“ wieder die des Klangs.
8. **G5:** Die Analyse läuft auf der gesäuberten Fassung, wenn SÄUBERN > 0 ist, sonst auf dem Roh-Take (nicht auf der G4-Fassung). Eine
   Zeitkarte (VS5a/b) wird auf die Noten übertragen. Song-Stimme → Song-Melodie zeigt kein Ergebnis-Blatt (das FANG-Blatt gehört zu einem
   Szenen-Clip), sondern einen Toast mit [Rückgängig]. Die Tonart ist die des Songs an diesem Takt.
9. **Mitschnitt-Knackser:** Spitzen genau an den 4096er-Blockgrenzen des ScriptProcessor-Mitschnitts treten genauso in der unveränderten
   4.23.0 ohne jede Aktion auf (4·10⁻²). Sie sind wie in VS3 ausgenommen.

## Fragen an Xander
1. „Maskierung → EQ (Präsenz anheben/**Gegenspur-Kerbe nur im Gesang**)“: Meinst du eine Kerbe **in der anderen Spur** (z. B. Drums/Synth bei
   3 kHz), die nur wirkt, **während gesungen wird**? Gebaut ist nur die EQ der Stimme.
2. Wo soll [Effekte] noch erscheinen? Jetzt: Spur-Kopf der STIMME halten → Spur-Blatt → [Effekte]. Zusätzlich im Takes-Blatt?
3. [Auto] misst den Mix nur, während ▶ läuft (4 s). Reicht das, oder soll Auto die Szene dafür selbst kurz (stumm) abspielen?
4. G5: Liegt in der Szene schon ein MELODIE-Clip, wird er ersetzt (↶/[Verwerfen] holt ihn zurück). Lieber in einen freien Platz?
5. Voreinstellung „Gesang Synthpop“: Präsenz +3 dB, Silben-Dynamik 80 %, 3 : 1 ab −24 dB, Hall 18 %, Delay 10 % – passt das am iPhone mit
   Kopfhörer? (bitte anhören: ein Take, [A/B]).

## Für das Zusammenführen (geänderte Funktionen / Blöcke)
- **Neuer Block** `/* G4 … */` + `/* G5 … */` direkt nach `WP_API` (vor `function voicesInfo()`): `g4DspMake`, `G4D`, `G4P`, `G4`, `g4*`,
  `G4_API`, `G5`, `g5*`, `G5_API`; am Ende die Zeile `tkExt().proc.splice(…)` (G4 hinter `wpProc`).
- **CSS:** neue Zeilen nach `.tksheet .clab .mbtn{…}` (`.tk-g5`, `.g4sheet …`).
- **Ein-Zeilen-Haken in fremden Funktionen:**
  - `trackFx`: `g4Fx(tr, …)`
  - `normTrack`: `gfx` nur bei `stimme`
  - `tkNormProject`: `delete t.gfx` bei doppelter STIMME
  - `undoState` / `undoApply`: Art `gfx`
  - `tkEnsureTrack`: `g4NewTrack(t)`
  - `tkFlag`: `g4NewTrack` / `delete tr.gfx`
  - `openTrackSheet`: Knopf + Handler `g4`
  - `tkSheetPaint`: Knopf `g5`; `tkSheet`: Handler `g5`
  - `vsNotesOf`: `A.key`
  - `vsResPaint`: „umgewandelt“
  - `vsResDrop`: Label `G5_LABEL`
  - `wpBase`: Parameter `noG4`; `wpDetect`: `wpBase(id, null, true)`
- **API:** `Object.assign(SYNQUENZER, G4_API, G5_API)` steht **vor** der TK_API-Zeile (keine Kollision mit VS-P, das hinter WP_API einfügt).
- **VS-P-Haken:** keiner nötig. VS-P misst `o.buf` in `tkStartSrc`, also die von `tkPlayBuf` gelieferte G4-Fassung. Die Reihenfolge Hochpass →
  Entzischer → Kompressor → EQ → Auto-Pegel → Begrenzer ergibt sich von selbst.
- VERSION-Zeile unverändert (4.23.0).
