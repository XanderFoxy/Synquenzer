# SPK3 – NOTES (Stand Auftrag 4/4: Test spk3-test.mjs 13 OK / 4 FEHLER – Bass 3,01 dB, Verfeinern +0,52, mehrstimmig fehlt, Pad-Nachbau schlechter; Loop + Noten-Präzision fertig)

`index.html` = basis4.html (4.59.0) + Block `SPK3-BEGIN … SPK3-END` direkt nach `/* SPK2-END */` (Quelle `spk3-block.js`, bitgleich)
+ 2 Haken „SPK3“ im SPK1-Kern: `spk3DspMake(Z2)` nach der Z2-Anlage, Worker-Text schickt `spk3DspMake.toString()` mit. VERSION/CHANGES unberührt.

## Auftrag 1/4 – was drin ist (`spk3DspMake(Z2)`, läuft im Spektral-Worker)
- Ersetzt `Z2.lowSplit` und schaltet das SPK2-Tiefband ein (`opt.an = true`, misst jetzt besser als SPK1).
- Kick-Vorlage (`kickTpl`, einmal je Analyse und FFT-Größe, in `d.spk3kt`): Schlag-Raster aus `meta.grid` (bpm/off), je Phase im Schlag
  (Schritt 512 Proben) und Bin bis 200 Hz das 60-%-Quantil der Leistung über bis zu 32 Schläge gleichmäßig über das Stück
  (Snare auf 2/4 zählt mit). `kickAt` holt die Vorlage an der Phase jedes Rahmens (linear). Kein Tempo → keine Vorlage (wie vorher).
- Vor der Bass-Suche (N 16384) wird die Vorlage abgezogen; Teiltonpegel = Spitze − Vorlage; Wiener-Anteil b / max(x², b + Vorlage).
- Sub-Oszillator: Teilton bei f0/2 wird immer mitgeschätzt (0–40 Hz Treffer 0 % → 65 %).
- Oberhalb 180–300 Hz gibt der Bass nichts ab (Akkord-Teiltöne auf denselben Bins: Fehlalarm kostete mehr als fehlender Bass).
- Mess-Haken `Z2.o3` (q, nb, hA/hB, trk, dbg; aus).

## Messung (Demo-Song, Node `messk/zr.mjs` = Kern aus index.html; Browser spk2-test gleich)
| Fassung | Drums | Bass | Tonal | Verfeinern Bass | Zerlegen |
|---|---|---|---|---|---|
| SPK1 (Basis 4.59.0) | 5,99 | 0,77 | 8,16 | 0,77 → −0,46 | 1,7 s Browser |
| SPK2 an | 6,15 | −0,34 | 6,28 | −0,34 → −0,41 | |
| + Oberband-Grenze 200–400 | 6,22 | 0,96 | 8,77 | | |
| + Grenze 150–250 | 6,23 | 1,38 | 9,85 | 1,38 → 1,46 | |
| **SPK3 (Vorlage q 0,6, Grenze 180–300)** | **7,47** | **3,01** | **9,77** | **3,01 → 3,53 (+0,52)** | 4,1 s Browser |
| Obergrenze: richtiges An/Aus + richtiger Ton (Stem) | 7,54 | 3,21 | | | |
| Obergrenze: ideale feine Anteile | 8,46 | 4,84 | 10,0 | → 5,67 | |
Verfolgung (messk/trk.mjs, Bass-Leistung): richtig 27 %, Oktave +12 (Sub, jetzt unschädlich) 45 %, falscher Ton 22 %, fehlt 5 %;
244 Rahmen ohne Bass (Takt 5–8) werden als Bass erkannt. Oracle je Fehler: nur An/Aus richtig +0,6, nur Ton richtig +1,1.

## Offen (Auftrag 1)
1. Bass ≥ 4 dB: Verfolgung verbessern (falscher Ton 22 %, Fehlalarm Takt 5–8). Nächster Weg: Grundton nur < 120 Hz zulassen bzw. Kamm-Energie
   relativ zum Stück (Pads ab C3 fallen weg), Viterbi auf vorlage-bereinigtem √|X| mit Oktav-Paar (f0, f0/2) als ein Zustand.
2. Verfeinern Bass +0,52 dB (Ziel +1): Verfeinern nutzt dasselbe Tiefband mit trust; Profi-Ebenen als Vorwissen noch nicht eingebaut.
3. Tempo: Zerlegen 1,7 → 4,1 s (Browser, 20-s-Stück). Kosten: SPK2-Tiefband (N 16384 je Streifen, Sortieren je Oberton) + Vorlage.
   Optimieren (Vorlage nur N 8192 und für 16384 umrechnen; Sortieren durch laufendes Quantil) bevor es auf dem iPhone 3-min-Songs trifft.

## Werkzeuge
`messk/zr.mjs` (Kern aus index.html, `HTML=` andere Datei), `messk/x.mjs` + `messk/kurz.sh` (Block-Datei einhängen, Umgebung
`O_q O_nb O_hA O_hB O_sub O_per O_stp TPL=0 TRK=stem AN=0 X3=0`), `messk/orc.mjs` (`OLO/OHI` ideal im Band, `DIAG=1` Treffer/Fehlalarm je Band),
`messk/trk.mjs` (Verfolgung gegen Stem, `MODE=on|f0|onf0` = Oracle-Teile).

## Pflicht / Regression (Auftrag 1)
topdefs doppelt 0 / Syntaxfehler 0 · dupkeys 0 · smoke errors [] (`smoke-a1.png`) · „MS 2000“ 1× · „  live: true,“ 1× · Markenwörter = Basis ·
VERSION 4.59.0. spk2-test 29/30 OK (nur zerlegen-bass-ziel 3,01 < 4), spk1-test ALLE OK (verfeinern-verbessert-ziel jetzt grün).

---------------------------------------------------------------------------------------------------------------------------
## Auftrag 2/4 – Noten sicherer (halb: Bass fertig gemessen, Profi ungemessen, mehrstimmig offen)

Bau: `python3 bau3.py` = `index.a1.html` (Stand A1) + `spk3-block.js` + 2 Haken „SPK3“: SPK2-`return` gibt `h: {magsX, onsetsOf, viterbi,
segNotes, gridOf, snapT, t2Of, nid, artOf, rangeOf, N2R, midiOf, trackF, noteSel, findN}` heraus; SPK1-`selRaster` (harm) kennt Anteil `s.g` (0…1).
Sicherungen: `index.a1.html`, `spk3-block.a1.js`, `spk2-test.a1.json`.

### Kern (spk3DspMake, Worker) – ersetzt `Z2.ops.finden` / `Z2.ops.zuordnen` nur für Bass, sonst SPK2 wie bisher
- `finden3` (Ebene der Art Bass): Quelle = Profi-Bass-Ebene (`l.z === 'bass'`, wenn `meta.jobs.profi.fertig`), sonst Original.
  Beträge N 8192 des ganzen Stücks, Kick-Vorlage (A1) abgezogen (`o4.kk` 1). Vorlage T aus bestätigten Noten; **Gegen-Vorlage G** = gleiche
  Tonhöhen in Rahmen, deren Obertöne 1–3 < 5 % der Vorlage liegen (Stellen ohne Bass) → T' = T − (T·G)·G. Wert = cos²(T')·Anteil·Pegel,
  **Pegel** = Obertöne 1–3 ≥ 10 % der Vorlage (`o4.gate`). Band: Vorlage −7 … +12 Halbtöne, **oben ≤ 260 Hz**. Danach **Ton je Note
  nachschärfen**: Halbtöne im Band, Obertöne 1–6 bis 230 Hz (mind. 2), log-Mittel relativ zur Vorlage, Betrag genau an der Frequenz
  (Halbton < 1 Bin bei 65 Hz). Befund: Pads C4-E4-G4 = Obertöne 4-5-6 von C2 → ohne Pegel-/Gegen-Prüfung überall „C2“.
- `zuordnen3` (Ziel Bass): Kamm nur bis 300 Hz; Ziel = zerlegte/Profi-Bass-Ebene (`l.z`) → nur Noten bestätigen (Anteil 0, Masken bleiben),
  sonst voller Kamm. Ein ↶ wie bisher.
- Parameter `Z2.o4` (`up, rf, kk, fbB, gate, gq, orth, ref, thr, zK, zg, dbg`); `sure/poly/pv/pr` sind Platzhalter für die nächsten Schritte.

### Messung (`messk/noten3.mjs`, Node = Browser; Wahrheit = Bass-Clip Synth 1, 4 Noten aus Takt 1 bestätigt)
| | vorher (A1) | nachher (A2) |
|---|---|---|
| Überall finden: Quote / Präzision (Wahrheit Takt 2–4) | 45,8 % / 23,4 % | **58,3 % / 58,3 %** |
| … ab „Sicher ab“ 0,5 | 45,8 % / 23,4 % (Sicherheit 0,76–0,96 = trennt nicht) | 54,2 % / 65,0 % |
| … fair (Wahrheit = alle 32 − 4 bestätigte, Takt 1 zählt mit) | – | 17/24 = **71 %** Präzision, Quote 61 % |
| Fehlalarme Takt 5–8 (kein Bass) | 27 (alle „C2“) | 2 |
| Bass-SDR: zerlegt → 4 Noten zuordnen → Alle übernehmen → Verfeinern nach Noten | 3,01 → 0,73 → −5,30 → 2,81 | **3,01 → 3,01 → 3,01 → 3,29** |
| Laufzeit Überall finden (20 s, Node) | 0,55 s | 1,0 s |
Zuordnen-Versuche (Takt 1 / Alle): voller Kamm 0,73 / −5,30 · ≤300 Hz g 1 1,48 / −1,24 · g 0,5 2,55 / 1,57 · g 0,25 2,87 / 2,67 · g 0 3,01 / 3,01.
Restfehler: C2 auf Zählzeit 3 (Kick) wird G2/C3 (3×), ±1 Halbton (2×), Oktave (1×). „Sicher ab“ trennt noch schwach (richtig 0,39–0,73, falsch 0,34–0,68).

### Offen (Auftrag 2)
1. **Profi-Bass messen** (Quelle ist eingebaut, ungemessen): ki1-Ablauf im Prüf-Chrome (`ki/ki1-test.mjs`-Routen, Modell `ki/modell`), danach
   `SYNQUENZER.spk1.spk2.finden` + Wertung wie `noten3.mjs`; „Noten finden“ auf dem Original (Bass-Band) ebenfalls auf Profi-Bass umstellen.
2. **Mehrstimmig (Pads)**: nicht gebaut. Plan: in `noten` für Art Pads iterative Obertonsumme je Rahmen (bester Ton, Obertöne mit Fensterbreite
   abziehen, nächster ≥ 50 %, max. 5), Halbton-Aktivität je Ton glätten (Hysterese), Anschläge je Ton; Anzeige gleich, Text „mehrstimmig“
   (`spk2Pane`/`spk2Finden`/`spk2NotenDd`, Haken „SPK3“). Messung steht: `TEIL=pad node messk/noten3.mjs` – vorher Pad-Spur allein 0/28,
   Gemisch → Verfeinern Pads → Noten 1/28 (Präzision 4 %). Wahrheit: Pad-Clip (C-E-G / C-E-G-H je Takt, 28 Noten).
3. Sicherheit: Rand-Abstand der Tonwahl (beste − zweitbeste) in `conf` einrechnen, damit „Sicher ab“ trennt; Kick-Zählzeiten (C2 → G2).
4. Zuordnen in eine zerlegte Bass-Ebene ändert den Klang nicht mehr (nur Noten) – im Funk erklären: Klang wird über „Verfeinern nach Noten“ besser.

### Pflicht / Regression (A2)
topdefs doppelt 0 / Syntaxfehler 0 · dupkeys 0 · smoke errors [] (`smoke-a2.png`) · „MS 2000“ 1× · „  live: true,“ 1× · VERSION 4.59.0 ·
spk2-test 29/30 (nur zerlegen-bass-ziel 3,01 < 4, wie A1; `spk2-test.json/log`). spk1-test nicht neu gelaufen (Zerlegen unverändert seit A1).

---------------------------------------------------------------------------------------------------------------------------
## Auftrag 3/4 – Nachbau genauer (halb) + Loop im Dokument (fertig)

Bau: `python3 bau4.py` = `index.a1.html` + `spk3-block.js` + Haken A2 + 20 Haken „SPK3“ (SPK2: spk2KlP/Snd/Start/Opt/Txt, spk2LpRow/Tap/LpEnd/ViewLp;
SPK1: spk1PlayPos, spk1PlayFrom, spk1Layers, spk1BtnState, Tipp-Weiche `lpplay`). Sicherungen `index.a2.html`, `spk3-block.a2.js`, `spk2-test.a2.json`.
Teile des Blocks liegen auch einzeln in `a3-worker.js`, `a3-main.js`, `a3-loop.js` (nur Quelle, in spk3-block.js eingefügt).

### Loop (fertig)
- Dokument: `meta.teil2.loops = [{a, b}]` (Takte), Kern-op `loopSet` (ein ↶ „Loop“ / „Loop entfernt“, Speichern über uEnd → saveMeta). Gespeichert nach
  Ziehen-Ende, „Loop setzen“ (Ansicht ▾), ✕. `spk3LpFromMeta` (in spk1Layers) holt den Loop beim Öffnen und nach ↶/↷; während des Ziehens bleibt U.loop.
- ▶ in der Loop-Zeile (44×44, zwischen Text und „In die Matrix ▾“): spielt den Loop im Kreis (`spk3LpPlay`): Blöcke vom Kern wie spk1Play (im Loop
  gemerkt, ≤ 200 Blöcke), je Durchgang ein Pegel mit 3 ms Blende über die Naht (Proben hinter dem Ende / vor dem Anfang) → lückenlos, taktgenau.
  ■ stoppt; Haupt-▶ „■ Stopp“ stoppt auch. Tipp ins Lineal während des Loops = weiter im Loop ab da. Loop ändern/↶ während er läuft → läuft mit den neuen Grenzen weiter.
- Test `spk3-loop-test.mjs <abs index.html>`: ALLE OK (10, 29 s) – Dokument, ↶/↷, nach Neu-Laden, ✕, im Kreis (2 Nähte in 11 s, Lücke 0 ms, Blende 2,99 ms),
  Stopp, Layout hochkant + quer 370 (3 Tasten ≥ 44). Fotos `fotos/70-loop-im-kreis-hochkant.png`, `71-loop-quer-370.png`. Test-API `__spk.spk3.loop`.

### Nachbau (halb)
- Worker `bewegung()` (an op klang/klangFeat → `feat.x3`): je 5 ms, Fenster 4 Perioden, Obertöne 1–12 genau an h·f0: Schwankung (cv) + Rate je Oberton
  → Verstimmung Osz 2 (Δf = Rate/h, Median), Tonhöhe aus dem Phasen-Zuwachs → Vibrato (Tiefe ct, Rate), Schwerpunkt → Wah.
- VA-Versuch +5 Werte (u[11] Osz-2-Verstimmung ±25 ct, u[12] Unison-Verstimmung bei fix.uni 5, u[13] LFO 0,2–10 Hz, u[14] Vibrato 0–60 ct, u[15] Wah);
  Startwerte aus x3, Varianten „det“ (2 gleiche Wellen verstimmt) und „uni“ (Unison 5) nur bei Schwebung; was die Analyse nicht sieht bleibt fest (`fz`),
  Rauschen nur bei Analyse > 10 %. Abstand = SPK2-Abstand + 0,2 × Bewegung (nur wenn nicht reines FM). Text: „+9 ct“, „Unison 5“, „Wah n HT“, „Vibrato x Hz y ct“.
- Messung `spk3-klang-probe.mjs <vorher.html> <nachher.html>` (beide Ergebnisse mit demselben Maß; „alt“ = SPK2-Abstand):
| Klang (Wahrheit) | vorher | nachher | erkannt |
|---|---|---|---|
| Lead: Säge, Vibrato 5,5 Hz 25 ct | 1,69 | **0,95** | Vibrato 5,2 Hz 25 ct |
| FM 1:2 | 2,06 | 2,06 | gleich (reines FM rechnet wie vorher) |
| VA Säge + Rechteck 50 % +9 ct | 3,91 | 3,89 | Verstimmung 9,5 ct erkannt, Osz 2 nicht gehalten (Mix 0,03) |
| Pad: Säge Unison 5 · 0,3 | 1,62 | 2,36 (Bewegung 5,32 → 2,85) | wählt 2 verstimmte Sägen +16 ct statt Unison |
  Laufzeit 50 Versuche 2,3–3,6 s (vorher 2,0–2,9 s, Prüf-Chrome). Hall nicht gebaut (optional).

### Offen (Auftrag 3)
1. VA 2 Osz: Optimierer verliert Osz 2 – Mix und Verstimmung gemeinsam mutieren, Variante „det“ mit der Welle der Analyse (hier Rechteck) statt gleicher Welle; Periode (Phase) in den Abstand.
2. Pad Unison: Unison-Variante verliert gegen 2 Sägen – Schwebung von Unison ist unregelmäßig (viele Raten): Maß „Streuung der Raten“ statt Median; Pegel uniMix mitschätzen.
3. Bewegungs-Maß nur 0,2 gewichtet; Wah-Erkennung bei Schwebung abgeschaltet (Fehlalarm). Hall-Anteil (Ausklang nach dem Loslassen) fehlt.
4. Ergebnisse je Lauf streuen (50 Versuche, ein Startwert) – für Vergleiche mehrere Läufe mitteln.

### Pflicht / Regression (A3)
topdefs doppelt 0 / Syntaxfehler 0 · dupkeys 0 · smoke errors [] (`smoke-a3.png`) · „MS 2000“ 1× · „  live: true,“ 1× · VERSION 4.59.0 · Markenwörter = Basis ·
spk2-test 29/30 (nur zerlegen-bass-ziel 3,01 < 4, wie A1/A2; klang-abstand-bekannt 3,16; gelaufen vor der letzten FM-Weiche, VA-Weg unverändert) · spk3-loop-test ALLE OK.

---------------------------------------------------------------------------------------------------------------------------
## Auftrag 4/4 – Gesamt-Test `spk3-test.mjs` (13 OK / 4 FEHLER, 162 s) + 1 Verbesserung

Aufruf: `node spk3-test.mjs <abs index.html> [<abs vorher.html> = ../basis4.html]` (mess/ neben der Datei, basis2.html eine Ebene höher; NODE_PATH wird gesetzt).
Ruft nacheinander mit Zeitgrenze auf und wertet mit den SPK3-Zielen (Ergebnis `spk3-test.json`, Ausgabe `spk3-test.log`):
Kern `messk/noten3.mjs TEIL=alle PROFI=1` (Datei und Basis) · `../spk2/spk2-test.mjs` · `spk3-loop-test.mjs` · `spk3-klang-probe.mjs <basis> <datei>`.
`NUR=kern,spk2,loop,klang` wählt Teile. noten3.mjs neu: `ueberall_fair` (Wahrheit = 32 − bestätigte, Takt 1 zählt mit) und `PROFI=1`
(Profi-Lauf simuliert: `meta.jobs.profi.fertig`, Bass-Ebene `z 'bass'`; Sicherung `messk/noten3.a3.mjs`).

| Prüfung | Ergebnis (Basis 4.59.0 → SPK3) |
|---|---|
| **bass-zerlegen-4db** | **FEHLER** 0,77 → 3,01 dB (Ziel 4) |
| **verfeinern-plus-1db** | **FEHLER** 0,77 → −0,46 (−1,23) → jetzt 3,01 → 3,53 (+0,52; Ziel +1) |
| verfeinern-undo · zerlegen-undo | OK (zurück 3,01 bitgleich; Zerlegen ↶ 0 / ↷ 3 Ebenen) |
| noten-praezision-70 | OK fair 23 % → **84 %** (21/25, Quote 75 %); streng Takt 2–4 23 → 72 %; Browser 58,3 → 72 % |
| uebernehmen-verschlechtert-nicht | OK Bass-SDR zerlegt → Zuordnen Takt 1 → Alle (25): Basis 0,77 → −0,59 → −5,6 · SPK3 3,01 → 3,01 → 3,01; Verfeinern nach Noten 3,01 → 3,39 |
| uebernehmen-undo | OK (25 Noten, ↶ 4/25, ↷ 29/0) |
| profi-ebene-als-quelle | OK (simuliert: Quelle = Profi-Bass, profi/vorlage true, 84 %); echter Modell-Lauf + Noten nicht gemessen |
| **mehrstimmig-akkord-toene** | **FEHLER** Pad allein 0/28, Gemisch 1/28 (nicht gebaut, A2 offen) |
| **nachbau-abstaende-besser** | **FEHLER** Lead 1,69 → 0,95 · FM 2,06 → 2,06 · VA 2 Osz 3,91 → 3,89 · **Pad 1,62 → 2,36** (Mittel 2,32 → 2,31) |
| nachbau-ohne-fehler · keine-konsolenfehler | OK [] |
| loop-gespeichert · loop-abspielbar · loop-undo | OK (Dokument {a 0, b 2}, nach Neu-Laden da, 2 Nähte in 11 s, Lücke 0 ms, Blende 3 ms, ■, ↶/↷, ✕) |
| layout-3-groessen | OK 428×926 (+ Matrix ▾ offen), 926×428, 926×370; Loop-Zeile hochkant + quer 370, Tasten ≥ 44, ✕ sichtbar |
| regression-spk2-test | OK 29/30 (nur zerlegen-bass-ziel, bekannt) |

### Behoben / verbessert in Auftrag 4 (Haken „SPK3 A4“ in spk3-block.js, Bau `python3 bau4.py`; Sicherungen `*.a3.*`)
- **Überall finden (Bass) rechnet auf der zerlegten Bass-Ebene**, wenn kein Profi-Lauf da ist (`quelleBass` = Profi-Bass, sonst Ebene `z 'bass'`, sonst Gemisch).
  Befund im Test: Profi-Weg mit der zerlegten Ebene als Ersatz war besser als das Gemisch. Kern: fair 70,8 → 84 %, Oktav-/Ton-Fehler 5 → 0,
  Laufzeit 1,1 → 0,6 s; Browser: Quote/Präzision 58,3/58,3 → 75/72 %, „Sicher ab“ 0,65–0,80 (vorher 0,54–0,73); Verfeinern nach Noten 3,29 → 3,39 dB.
  Feld `profi` bleibt ehrlich (nur echter Profi-Lauf), neu `quelle` (Ebenen-id oder 'orig'). Nichts sichtbar geändert.

### Offen (Stand nach Auftrag 4)
1. Bass ≥ 4 dB / Verfeinern +1 dB: Wege s. Auftrag 1 (Verfolgung falscher Ton 22 %, Fehlalarm Takt 5–8); neu: Verfeinern könnte wie finden die Bass-Noten
   (84 % richtig) als Vorwissen nehmen (Kamm nur auf bestätigten Noten).
2. Mehrstimmig (Pads) bauen – Plan in Auftrag 2, Messung steht (`TEIL=pad messk/noten3.mjs`).
3. Pad-Nachbau: Optimierer findet Unison nicht (wählt 2 Sägen +16 ct); Schutz: SPK2-Start ohne Bewegung immer mitlaufen lassen und im
   gemeinsamen Maß vergleichen; Maß „Streuung der Raten“ für Unison.
4. Befund: „Noten finden“ auf der zerlegten Bass-Ebene selbst (nicht Überall finden) trifft 0/32 (26 falscher Ton, Anschläge richtig) – Ursache prüfen
   (vermutlich Sub-Oberton f0/2 bzw. Kick-Vorlage im SPK2-noten-Weg); Überall finden und Original-Bassband (43,8 %) sind nicht betroffen.
5. Profi-Bass mit echtem Modell messen (ki1-Ablauf + finden im selben Prüf-Chrome).

### Pflicht / Regression (A4, Datei nach dem Fix)
topdefs doppelt 0 / Syntaxfehler 0 · dupkeys 0 · smoke errors [] (`smoke-a4.png`) · „MS 2000“ 1× · „  live: true,“ 1× · VERSION 4.59.0 · CHANGES wie Basis.
spk2-test 29/30 (nur zerlegen-bass-ziel) · spk1-test ALLE OK · vx1-test 61/61 · spk3-loop-test ALLE OK (10) · ki1-test (mit Solo-Gesang
`realvox/dl/vocadito_1.wav` als 4. Argument; ohne ihn fehlen gesang-besser + sps im guide-eintrag): alles OK bis auf **besser-als-klassisch-demo**:
Profi Bass 4,59 / Drums 9,71 / tonal 11,81 gegen klassisch jetzt 3,01 / 7,47 / 9,77 – die Prüfung verlangt Bass +2 dB, es sind +1,58, weil
„Zerlegen“ durch SPK3 von 0,77 auf 3,01 dB besser wurde (kein Rückschritt; Schwelle in ki1-test auf SPK1 geeicht, nicht angefasst).
Nebenbefund: mit Profi-Trennung erreicht der Bass 4,59 dB ≥ Ziel 4. Protokoll `regression-a4.log`, Ergebnisse `spk1-test.json`, `ki1-test.json`.
