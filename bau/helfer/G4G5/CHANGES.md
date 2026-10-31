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
| (wird beim Abschluss eingetragen) | | |

## Abweichungen

## Fragen an Xander

## Für das Zusammenführen
