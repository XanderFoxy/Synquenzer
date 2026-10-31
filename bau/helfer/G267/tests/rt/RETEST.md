# RETEST – G2, G6, G7 (unabhängige Prüfung, Helfer G267)

Geprüft: Kopie `tests/rt/index.html` von `bau/helfer/G267/index.html` (App 4.25.0, G2/G6/G7; Original nicht verändert, nichts
committet). Chromium headless (Playwright), AudioContext lief mit **44,1 kHz** (Takes 44,1 bzw. 48 kHz). Eigene Skripte mit eigenen
Signalen (`tests/rt/sig.mjs`: Formant-Stimme mit durchgehender Phase/Legato, Zischlaut „s“ 70 ms, Plosiv „t“ 6 ms + 25 ms Stille)
und eigener Messung (`tests/rt/h.mjs`: YIN/CMND statt NSDF des Bauenden; Klick-Maß HP 4 kHz, 1-ms-Fenster, Spitze über Median ±30 ms).
Konsonanten werden **über ihre ganze Länge** verglichen (der Bauende prüfte nur die ersten 19 ms).

Skripte: `rt-g2.mjs`, `rt-g6.mjs`, `rt-g7.mjs`, `rt-old.mjs` (Ausgaben `out/*.out`, `out/*.log`, Bildschirmfotos `out/g6-*.png`).
Aufruf: `node bau/helfer/G267/tests/rt/rt-g2.mjs` (Kopie), `G_APP=<abs. Pfad>/index-fix.html node …` (Kopie mit Fix).

## Ergebnis

| Punkt | Ergebnis | Messung |
|---|---|---|
| **G2** – Aufbau | ✓ | Es-Dur-Szene, Take **44,1 kHz** (370 440 Samples), tiefe Stimme 87–117 Hz + hohe 311–415 Hz, 14 Noten 30–45 Cent daneben, 2 Legato-Phrasen (keine Pause, Verschiebung springt je Note), 4 Einzeltöne mit s/t davor |
| G2 echter Bedienweg | ✓ | `tkSheet` → **Tipp ♪ Tonhöhe · Noten** (Touch) öffnet den Editor; **Tipp [Hart]** → Feld `hard/1`, Tonart **Es-Dur der Szene** übernommen, hörbar nach 242–278 ms |
| G2-06 Blöcke = Noten | ✓ | 14/14 erkannt, Höhe max **2,5 Cent** neben dem Gesungenen, Start max 18 ms (Phrasen-/Toneinsätze; ±10 ms in der Spec bezieht sich auf die gemessenen Noten – Block = Analyse ist exakt) |
| G2-01 Hart 100 % | ✓ | je Note max **0,26 Cent** neben dem Skalenton (44,1 kHz, 87–415 Hz) |
| G2-01 Hart 50 % | ✓ | halber Abstand max **0,57 Cent** |
| G2-01 Weich 100 % | ✓ | max **1,79 Cent** |
| G2-03 Legato-Grenzen | ✓ | 8 Grenzen ohne Pause, Sprünge z. B. +38→−36 Cent: HP-Spitze max **+1,6 dB** (Hart) / **+0,9 dB** (Weich) gegenüber dem Original; Dauer 370 440 = 370 440 |
| G2-03 Ränder stimmhafter Strecken | ✗ (knapp) | Ende des Tons „i“ D4 (6,92 s): **+3,2 dB** über Original (mit Fix: max +1,8 dB, gleiche Ursache wie D1) |
| **G2-05 Zisch-/Plosivlaute** | **✗** | „s“ vor „i“ (D4, 294 Hz): **659 Samples (15 ms) verändert**, max −46,6 dBFS = **−31,8 dB** unter der Konsonant-Spitze (Spec: bitgleich bzw. ≤ −60 dB). Die anderen 3 Konsonanten bitgleich. → **D1** |
| G2 Block ziehen (Maus) | ✓ | 2 Zeilen ↑ → `sh = 2`, gehört **+200,1 Cent**; alle anderen Noten ±0,02 Cent; Grenzen +1,2/+1,7 dB; außerhalb der Legato-Phrase bitgleich (innerhalb nur die Phasenlage der Nachbarnoten anders, s. Hinweis H1) |
| G2-04 Undo/Redo | ✓ | ↶ Ziehen → deep-equal + bitgleich; ↶ ×4 → kein Feld, **Roh-Take bitgleich**, Spuren-JSON zeichengleich; ↷ ×5 → deep-equal + bitgleich; Hart nach 50 %/Weich erneut = bitgleich (Cache) |
| G2-04 Speichern/Laden | ✓ | Speichern → Seite neu laden → Laden: Feld deep-equal, Klang bitgleich, Take bleibt 44,1 kHz |
| G2-04 lange Tasks | ✓ | **keine** > 50 ms während Blatt / ♪ / Hart / 50 % / Weich / Ziehen (Rechnen im Worker; Analyse 586–602 ms, Rendern 132–135 ms) |
| **G6** – Aufbau | ✓ | G-Dur-Szene **mit Begleitung** (Synth 1: G-H-D │ D-Fis-A, Synth 2: Bass G │ D), `sceneKey` = G-Dur; Melodie G4 H4 D5 H4 │ A4 Fis4 D4 Fis4 |
| G6-01 Terz (Tipp im Blatt) | ✓ | G→H, H→D, D5→**Fis5**, A→C, **Fis→A**, **D4→Fis4** (8/8 leitereigen inkl. Fis); Kopie 1 max 0,8 Cent neben Soll (−6 Cent), Kopie 2 max 1,1 Cent neben Soll (+8 Cent); gegen reine Terz max 8,0 Cent (±10) |
| G6 Dreistimmig mit Begleitung | ✓ | 8/8 = Akkordtöne der Begleitung, z. B. **D4 über D-Dur → Fis4/A4** (ohne Begleitung wäre es G/H) |
| G6 Barbershop | ✓ | Tenor/Bariton/Bass 8/8 Akkordtöne, Bass = Grundton (G3 bzw. D3/D4) |
| **G6-02 Lautheit Terz 80er** | **✗** | Chor **6,1 / 6,9 / 5,9 LU** unter dem Lead (3 Läufe; Soll 6…10, Ziel des Baus 8) – ein Lauf außerhalb, alle 1,1–2,1 LU zu laut → **D2** |
| G6-02 Lautheit Terz Pop | ✓ | **8,7–8,9 LU** unter dem Lead (Ziel 9); Summe −30,5 LUFS, Spitze −17,6 dBFS (nichts übersteuert) |
| G6 Selbst singen (API) | ✓ | Führung = Stimme 2 solo (gemessen 589,2 Hz, Soll D5 587,3 Hz); Aufnahme → Stimme 2 = neuer Take, Lead bleibt, kein `alt`-Eintrag, Solo wieder aus, Pan/Sends/Pegel gleich |
| G6 Song | ✓ | Song aus Szene 0 ×2: Chor spielt mit (8 Puffer-Quellen = 2 × [Lead + 2 Kopien + selbst gesungen]), Chor-Solo im Song −38,3 LUFS, keine langen Tasks |
| G6-05 Speichern/Laden | ✓ | Chor mit selbst gesungener Stimme deep-equal |
| G6 Layout | ✓ | Blatt Chor 320×568 (56–526, ohne Scroll) und 844×390 (50–381, ohne Scroll): nichts abgeschnitten, alle Tasten ≥ 44×44, keine Seiten-Überbreite; Noten-Editor einer Stimme in beiden Größen vollständig |
| G6 lange Tasks / Fehler | ✓ | keine > 50 ms bei Tipp Chor/Terz/Dreistimmig/Barbershop und im Song; keine Seitenfehler |
| **G7** Alt-Stand | ✓ | ohne Feld und ohne Transponieren nach 4,5 s Abspielen (G7 sucht Noten im Hintergrund): **Roh-Take bitgleich**, Projekt-JSON ohne `pitch`/`chor`, Spuren/Takes deep-equal |
| G7-01 Transponieren (setKbMode('transpose') + chord) | ✓ | a-Moll-Clip, Träger **d-Moll** (+5), **E-Dur** (−5/−4, Gis), **F-Dur** (−4/−3): je Note = `outPitch(STIMME, Note)`, max **0,71 Cent**; Verschiebung je Note = Tabelle; bereit nach 181–204 ms |
| G7-04 Cache | ✓ | d-Moll erneut: 0 neue Renders |
| **G7-02 Zischlaute** | **✗** | „s“ vor „i“ (D4): **239 Samples (5 ms)** verändert, in allen 4 Lagen (gleiche Ursache D1); andere 3 Konsonanten bitgleich |
| G7-03 zurück | ✓ | Akkord a-Moll → bitgleich (0 Samples), `resetCarrier` → bitgleich |
| G7-04 Wechsel beim Abspielen | ✓ | gehaltene Fläche, **8 Wechsel** a-Moll ↔ d-Moll im Abstand 0,9 s: **0 Löcher** ≥ 6 dB (5 ms), beide Lagen gehört (975/772 Frames, 0/+500 Cent), Klick-Maß **22,7 dB** mit Wechseln vs. **22,6 dB** ohne; Überblendung 0,46 dB; keine langen Tasks |
| G7 + G2 | ✓ | quantisierter Take (Hart 100 %) unter d-Moll je Note = outPitch, max 0,22 Cent; zurück → bitgleich zur Quantisier-Fassung |
| Alt-Projekt 4.23.0 | ✓ | Projekt + Take in `bau/werkzeug/vs-base-B.html` (4.23.0) angelegt, als ZIP in 4.25.0 geöffnet: Projekt-JSON gleich, nach 5 s Abspielen gespielt = Roh-Take bitgleich (144 000 Samples), danach JSON weiter ohne neue Felder |
| Allgemein | ✓ | keine Seitenfehler in allen Läufen |

## Mängel

### D1 – Zischlaut vor einem Vokal wird am Ende mit verschoben (G2-05, G7-02) ✗

**Beobachtung:** Steht ein Zischlaut direkt vor einem Vokal, dessen Stimmhaftigkeit pYIN früh erkennt (hier „i“ auf D4 294 Hz),
werden die **letzten 5–15 ms des „s“** verändert: −46,6 dBFS bzw. −31,8 dB unter der Konsonant-Spitze (Spec: bitgleich bzw. ≤ −60 dB).
Tritt beim Quantisieren (G2), beim Ziehen und beim Transponieren (G7, alle Lagen) auf; ebenso das Ende eines Tons (Ausklang, +3,2 dB
Klick-Maß). Der Test des Bauenden sah das nicht, weil er nur die ersten 19 ms eines Konsonanten verglich.

**Ursache:** `model()` im G2-Kern (`g2PitchMake`, Zeile ~42038; gleich in `dsp/g2pitch.js` Z. 101) setzt den Anfang der verschobenen
Strecke auf `A = Frame-Index × Hop + 15 ms`. pYIN markiert Frames nach der Fenstermitte; das Analysefenster eines Frames 20 ms **vor**
dem Vokal ragt schon in den Vokal → der Frame gilt als stimmhaft (gemessen: stimmhaft ab 0,55 s, Vokal ab 0,57 s). Die 15-ms-Schutzzone
beginnt damit 20 ms zu früh und die 10-ms-Blende liegt noch im „s“. Die volle-Rate-Messung (`ap`, YIN-Rest je Frame) zeigt an diesen
Frames klar „nicht periodisch“, wird aber für die Grenze nicht genutzt.

**Fix (minimal):** Schutzzone erst ab dem ersten Frame mit `ap ≤ 0,3` (höchstens 3 Frames = 30 ms je Rand, damit hauchige Stimmen
weiter verschoben werden), ebenso am Ende. `tests/rt/fix.diff` (App und `dsp/g2pitch.js`, 1. und 3. Hunk). An der Kopie geprüft
(`tests/rt/index-fix.html`): alle Konsonanten **bitgleich** (G2 und G7, alle Lagen), Rand-Klick +1,8 dB, Tonhöhen unverändert
(Hart 100 % max 0,34 Cent), Regression siehe unten.

### D2 – Chor 80er mit einer Stimme zu laut (G6-02) ✗

**Beobachtung:** Terz + „80er großer Refrain“: Chor nur **5,9–6,9 LU** unter dem Lead (BS.1770 am Ausgang, Begleitung stumm, 3 Läufe),
einmal außerhalb der Spec (6…10). „Pop modern“ trifft sein Ziel (8,6–8,9 LU, Ziel 9).

**Ursache:** `g6Auto` rechnet den Chor-Pegel aus der K-bewerteten Leistung und **schätzt** den Hall-Anteil (`g6HallK`, Send²·Hall-
Energie). `G6_CAL = 1,9 dB` wurde an Falsett 80er (zwei Stimmen) auf 8,0 LU eingemessen. Bei 80er (Send 75 %) ist der Hall-Anteil
groß und die Schätzung zu klein; mit Lead-Hall 30 % und einer Stimme ergibt sich ≈ 1,5 LU Fehler + Lauf-zu-Lauf-Streuung ±0,5 LU,
d. h. das Ziel 8 liegt zu nah an der Spec-Grenze 6.

**Fix (minimal):** `G6_MIX['80'].below` 8 → 9 (`fix.diff`). An der Kopie gemessen: Terz 80er **7,6 / 7,0 LU**, Pop 8,6 LU, Falsett 80er
(Skript des Bauenden) **8,6 LU**, Pop 9,0 LU – alle mit Abstand in 6…10. Besser (größer): den Hall-Anteil messen statt schätzen bzw.
je Rezept kalibrieren.

## Hinweise (keine Mängel)

- **H1 – Legato-Phrase, eine Note gezogen:** die Nachbarnoten derselben stimmhaften Strecke sind nicht bitgleich (Phase Φ′ wird über
  die ganze Strecke aufsummiert), ihre Tonhöhe bleibt aber ±0,02 Cent gleich und es gibt keinen Klick. Hörbar ist das nicht; die
  Aussage „außerhalb der Note bitgleich“ im CHANGES gilt nur für getrennte Töne.
- **H3 – Legato-Töne < 30 Cent auseinander** (z. B. As −42 Cent → G +33 Cent = 25 Cent Abstand) fasst die VS2-Segmentierung zu einer
  Note zusammen; Hart zieht dann beide auf einen Ton. Das ist bei diesem Abstand erwartbar (mehrdeutig) und im Editor mit [Teilen]
  lösbar – im ersten Lauf meines Tests war das ein Fehler im Testentwurf, kein App-Fehler.
- **H4 – Chor an einer Song-Stimme:** `g6HeardPcs` liefert für Song-Stimmen (`r.t == null`) keine Akkorde → leitereigener Dreiklang
  statt der Akkorde der anderen Spuren. Nicht getestet (kein Bedienweg geprüft), im CHANGES nicht als Abweichung genannt.
- **H5 – K-Filter 48 kHz fest:** `g2Kw` (Chor-Pegel) nutzt BS.1770-Koeffizienten für 48 kHz auch bei 44,1-kHz-Takes (kleiner Fehler
  < 0,1 dB, nicht gemessen).
- Test-API: `SYNQUENZER.closePop` gibt es nicht (die Tests des Bauenden rufen es mit `&&` auf – wirkungslos, Blatt bleibt offen).

## Regression mit Fix (`index-fix.html`)

Kopie mit **beiden** Fixes: `rt-g2` alle ✓ (Konsonanten 0/0/0/0 Samples anders, Hart 100 % max 0,34 Cent, Rand-Klick +1,8 dB),
`rt-g7` alle ✓ (Konsonanten in allen 4 Lagen bitgleich), `rt-g6` 2× alle ✓ (Terz 80er 7,6/7,0 LU). Tests des Bauenden auf der
Fix-Kopie: `g2-core.mjs` (Kern mit Fix, `fixcore/`) alle grün (Konsonanten bitgleich, ±0,16 Cent, Hülle 0,00 dB, 32-s-Take 2,2 s),
`g2-app.mjs`, `g6-app.mjs` (Falsett 80er 8,6 LU, Pop 9,0 LU), `g7-app.mjs` alle grün. Protokolle `out/regress-fix.log`,
`out/regress-fix2.log`. (Der erste `rt-g6`-Lauf auf der Fix-Kopie *nur mit D1-Fix* zeigte Terz 80er 5,9 LU – D1-Fix ändert die
Lautheit nicht, das ist D2.)

## Dateien

- `bau/helfer/G267/tests/rt/RETEST.md` – dieser Bericht
- `bau/helfer/G267/tests/rt/fix.diff` – Fix D1 (App + `dsp/g2pitch.js`) und D2 (App)
- `bau/helfer/G267/tests/rt/index.html` – geprüfte Kopie, `index-fix.html` – Kopie mit Fix, `fixcore/` – Kern-Test mit Fix
- `bau/helfer/G267/tests/rt/{h,sig}.mjs`, `rt-g2.mjs`, `rt-g6.mjs`, `rt-g7.mjs`, `rt-old.mjs`; Ausgaben `out/`
