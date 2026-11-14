# SPK4 – NOTES (Stand Auftrag 4/4: Test spk4-test.mjs 22 OK / 1 FEHLER – nur Verfeinern +1 dB offen; mehrstimmig, Bass 4,37 dB, Unison, Rest aufteilen fertig)

Bau: `python3 bau.py` = `../basis5.html` (4.60.0) + `spk4-block.js` direkt nach `/* SPK3-END */` + 6 Haken „SPK4“:
spk1DspMake (`spk4DspMake(Z2)` nach SPK3), spk1Worker (Text `spk4DspMake.toString()` mitschicken), spk1Layers (`spk4Lab(U)`),
spk2Finden (`poly` + Text „mehrstimmig“/„einstimmig“ aus der Antwort), spk2NotenDd (Schalter + Text), `SPK1_API.spk2.noten(lid, sel, poly)`.
VERSION/CHANGES unberührt. Messwerkzeug `../spk3/messk/noten3.mjs` grabbt jetzt auch `spk4DspMake` (Sicherung `noten3.spk3.mjs`).

## Auftrag 1/4 – mehrstimmige Noten (Kern im Worker, `Z2.ops.noten` umhüllt)
- Wann: automatisch für Ebenen Pads, Rest und Original; Original mit Bass-Band-Auswahl (oben ≤ 400 Hz) bleibt einstimmig wie bisher
  (Bass-Weg bitgleich, `bass-neu.json` = `bass-alt.json`). Bass und Drums nie. Schalter „Mehrstimmig: an/aus“ in Noten ▾ je Ebene
  (nur Sitzung, `U.n4p`), sendet `poly`; ohne Schalter entscheidet der Kern. Hinweis in der Noten-Leiste (`U.n2lab`) und in Noten ▾ zeigt den Modus.
- Je Rahmen (N 8192, Hop der Analyse): Halbton-Kandidaten im Band, Salienz = Σ Gewicht·√Spitze (Obertöne 1–10, Fenster ±30 ct,
  nur echte lokale Spitzen). Iterativ: bester Ton, seine Obertöne abziehen (glatte Hüllkurve: zusammenfallende Obertöne nur so weit,
  wie die Nachbarn erwarten lassen; ±3 Bins anteilig), Sub-Oszillator f/2 mit abziehen, nächster Ton bis < 30 % der ersten Salienz, max. 5.
- Oktav-Schutz: Grundton muss Spitze sein (≥ 12 % von max(Oberton 2–4)), Grundton ≥ 50 % von Oberton 2, ungerade Obertöne 3/5/7
  ≥ 30 % der geraden 2/4/6 – sonst zählt der Kandidat zur Oktave darüber (Demo-Pad hat einen Sub-Oszillator: C3/E3/G3 −5…−14 dB).
- Halbton-Nachbarn: Aktivität ±3 Rahmen geglättet, je Rahmen trägt nur der stärkere Nachbar (Unison-Schwebung lässt die Spitze kurz
  einen Halbton springen, gemessen 59,0 ↔ 60,0).
- Dauer/Stetigkeit: Hysterese an 0,30 / aus 0,15 (relativ zum 95-%-Quantil), Lücken ≤ 10 Rahmen überbrückt, Mindestdauer 0,14 s, Sicherheit ≥ 0,3.
- Neue Anschläge je Ton: (a) Anschlag der Ebene, an dem der Ton selbst ≥ 6 dB in ~70 ms lauter wird (Klavier/Gitarre; Trommeln im
  Gemisch teilen nicht), (b) Akkord neu angeschlagen: je Schlag des Rasters Pegel 0,3 s davor/danach je gehaltenem Ton; Mittel ≥ 2 dB
  leiser danach und stärker als die Nachbarschläge → Grenze für alle Töne, die selbst ≥ 1 dB fallen (Takte 2,3–5,6 dB, sonst ≤ 1,8 dB).
  Anfang neuer Töne: zurück bis zum Beginn des Anstiegs (max. 1,5 s, nicht vor das Ende des Vorläufers), dann Anschlag der Ebene in
  −0,35…+0,06 s oder (Note ≥ 1 Schlag) der Schlag. Demo-Pad schwillt ~1,5 s an und hat keine Fluss-Anschläge.
- Noten wie einstimmig (`t0/t1` im Raster, `a/b`, `m`, `f`, `fz`, `conf`, `poly: 1`), ein ↶ „Noten finden“; Antwort `mehrstimmig: true`.
  Mess-Haken `Z2.o5` (Parameter, `dbg`).

## Messung (`TEIL=pad node ../spk3/messk/noten3.mjs`, Node = Kern aus der Datei; eigenes `messk/poly.mjs` gleich + Ton-Präzision)
| | vorher (basis5) | nachher (SPK4) |
|---|---|---|
| Pad-Spur allein: Treffer / Präzision | 0/28 · 0 % (1 Note) | **24/28 (85,7 %) · 75 %** (32 Noten) |
| Gemisch → Verfeinern Pads → Noten | 1/28 · 4,3 % (23 Noten) | 8/28 (28,6 %) · 11,1 % (72 Noten; Ton-Präzision 81 %) |
| Laufzeit Noten finden (20 s, Node) | 0,98–1,4 s | 1,1–1,2 s |
| Bass-Weg (TEIL=bass) | – | bitgleich |
Ziel „allein ≥ 50 % bei Präzision ≥ 50 %“ erreicht. Gemisch: Pads-Ebene enthält Bass/Lead/Trommeln; Takt-Grenzen dort nur 0,8–2,1 dB
(sonst bis 5 dB) → zu viele/zu wenige Schnitte.

## Offen (Auftrag 1)
1. Gemisch: Takt-Grenzen über die Pads-Ebene schwach; Weg: Grenzen aus der Pad-Aktivität (neue Töne) + Pegel nur der Töne, die
   allein stehen; Leck von Bass/Lead (C3/E3 Teiltöne) als Gegen-Vorlage.
2. „Noten finden“ ist auf Rest in Noten ▾ weiter gesperrt (Rest-Noten werden auf der Seite nicht gezeigt); Kern kann Rest.
3. Ton-Präzision allein 81 %: verbleibend B3/E3-Geister (Unison-Teil −90 ct) und B4 als Oberton 2 des tief verstimmten C4-Teils.

## Seite (Test `spk4-ui.mjs <abs index.html>`: 8 OK / 0 FEHLER, `spk4-ui.json`, Fotos `fotos/80-*`, `81-*`)
- Hinweis in der Noten-Leiste: Original ohne Auswahl „mehrstimmig“, mit Bass-Band „einstimmig“. Noten ▾: neue Taste „Mehrstimmig: an/aus“
  (44 px hoch, aria-pressed) in der Tastenreihe neben „Klang nachbauen“, Text darunter passt sich an; Umlegen ändert die Größe des
  Menüs nicht (340×259 beide). 428×926, 926×428, 926×370: im Bild, keine Überlappung, keine Taste < 44.
- Noten finden auf dem Original (ganzer Song, Browser): 98 Noten, gleichzeitige Töne, Text „… · mehrstimmig · …“, 883 ms, ein ↶ „Noten finden“.

## Pflicht / Regression (A1)
topdefs doppelt 0 / Syntaxfehler 0 · dupkeys 0 · smoke errors [] (`smoke-a1.png`) · „MS 2000“ 1× · „  live: true,“ 1× · VERSION wie basis5 ·
CHANGES unberührt · Markenwörter keine neuen. spk3-test (`spk3-test.out`, Basis basis5): 14 OK / 3 FEHLER – **mehrstimmig-akkord-toene OK**;
FEHLER nur bekannte Ziele (Bass 3,01 < 4 dB, Verfeinern +0,52 < +1 dB) und nachbau-abstaende-besser (Werte = Basis 4.60, kein Rückschritt);
spk2-test 29/30 (bekannt zerlegen-bass-ziel), Loop/Layout/Konsole OK. Bass-Noten-Weg bitgleich (`bass-neu.json` = `bass-alt.json`).

---------------------------------------------------------------------------------------------------------------------------
## Auftrag 2/4 – Bass ≥ 4 dB (erreicht) · Verfeinern ≥ +1 dB (nicht erreicht)
Bau: `python3 bau.py` = basis5 + `spk4-block.js` + 8 Haken „SPK4“ (neu: `Z2.magsLo = magsLo` im SPK3-Block; in `zerlegen` Tiefband < 520 Hz
ungeglättet, nur wenn `Z2.o6.nosm`). Sicherungen Stand A1: `index.a1.html`, `spk4-block.a1.js`, `bau.a1.py`.
Kern: Abschnitt „Auftrag 2/4“ am Anfang von `spk4DspMake` (Block `if (Z2.magsLo …)`), ersetzt `Z2.lowSplit` (SPK3), Schalter `Z2.o6`.
- Eigene Verfolgung `bassTrack4` (Kopie SPK2 bassTrack) + **Grundton-Pflicht**: Kandidat f, dessen Grundton-Spitze < φ 0,8 × max(2., 3. Oberton)
  liegt, verliert Salienz × (Verhältnis)^3. Grund (messb/hist.mjs): Fehltöne = Pad-Grundton C2/C3 (Kamm C2 trifft C3+G3+C4 der Pads) statt Bass F#/E.
- **Teiltöne breiter** (bw 1,5 × Fensterantwort, ±6 Bins): der Bass ändert Pegel/Ton im 186-ms-Fenster; die Spitze ist breiter als ein stehender Sinus.
- **Zerlegen glättet das Tiefband nicht mehr 3×3** (Drums/Bass < 520 Hz): Glätten kostete 0,6 dB Bass und 0,6 dB Drums.
- Verfeinern Bass mit **Profi-Bass als Startwert** (nur wenn Profi-Lauf fertig): Anteil |Profi|²/|X|² je feinem Bin, wo der Grundton verfolgt
  wird Maximum mit dem Kamm-Anteil. Simuliert (Profi = zerlegte Ebene): 4,40 statt 4,36; echter Modell-Lauf ungemessen (ki1-Ablauf im Browser).
  Ohne Profi bleibt Verfeinern klassisch (zerlegte Ebene als Startwert brächte +0,03 dB für +0,7 s → aus, `o6.pri 2`).

### Messung (Demo 20 s; Node = `messb/x4.mjs` Kern aus der Datei, `NOB=1`; Browser = spk3-test/spk2-test)
| | vorher (basis5 4.60) | nachher |
|---|---|---|
| Zerlegen Bass (SDR) | 3,01 | **4,37** (Browser 4,37) |
| Zerlegen Drums / Tonal | 7,47 / 9,77 | 8,55 / 9,95 |
| Verfeinern Bass 20–300 Hz | 3,01 → 3,53 (+0,52) | 4,37 → 4,36 (−0,01) |
| Verfeinern Drums | 7,41 | 7,90 |
| Zerlegen Zeit | Node 1,8–2,0 s · Browser 1770–2375 ms | Node 1,9–2,2 s · Browser 1986 / 2323 ms (Last 5,6) |
| Überall finden Bass (Präzision fair / streng) | 0,84 / 0,72 | 0,79 / 0,69 (Quote 0,75 → 0,82) |
Schritte (Node): bw 1,5 → 3,23 · + Grundton-Pflicht → 3,75 (Verf 4,36) · + ungeglättet → 4,37.
Oracle (Stem, `messb/orc4.mjs`): Ton vom Stem 4,34 (unsere Verfolgung ist jetzt so gut wie die Stem-Verfolgung), An/Aus vom Stem +0,0,
Ton + Teiltonpegel vom Stem + bw 2 → 5,00 (Zerlegen und Verfeinern). → Verfeinern +1 dB (≥ 5,37) liegt über dem Kamm-Modell selbst mit idealem Pegel.
Warum Verfeinern nicht mehr gewinnt: die alten +0,52 kamen nur daher, dass Verfeinern ungeglättet schrieb; jetzt tut das Zerlegen auch.
Verworfen (gemessen): Ton-Vorwissen < 100 Hz (3,11), Kick-Vorlage q 0,45 (0,69), N 16384 / 4096 im Verfeinern (4,19 / 2,61),
Verfeinern mit eigener Breite/Grenze (bwT 2: 4,08; robT 1–2: 3,99–4,23), zerlegte Ebene als Mischung (4,04).

### Offen
1. Verfeinern ≥ +1 dB: braucht ein anderes Modell als den Obertonkamm – z. B. Teiltonpegel per kleinster Quadrate gegen Kick-Vorlage + Pad-Teiltöne
   (Oracle-Pegel bringt +0,6) oder Profi-Bass (allein 4,59) als Startwert mit echtem Modell messen.
2. spk2-test: `verfeinern-verbessert` (> +0,3) und `verfeinern-nach-noten` jetzt FEHLER (Verfeinern = Zerlegen, nicht schlechter: −0,01).
3. Klang-Probe unter Last (Load 5,6) einmal va2 3,89 → 5,17; erneut allein: 3,89 → 3,89 (Zeit-abhängig, nicht SPK4).

## Pflicht / Regression (A2)
topdefs doppelt 0 / Syntaxfehler 0 · dupkeys 0 · smoke errors [] (`smoke-a2.png`) · „MS 2000“ 1× · „  live: true,“ 1× · VERSION wie basis5 ·
CHANGES unberührt · keine Markenwörter. spk3-test (`spk3-test.out`): 14 OK / 3 FEHLER – **bass-zerlegen-4db OK (4,37)**; FEHLER verfeinern-plus-1db,
regression-spk2-test (28/30: verfeinern-verbessert, verfeinern-nach-noten) und nachbau (Last, s. o.). Mehrstimmig, Loop, Layout, Konsole, Undo OK.
Werkzeuge: `messb/x4.mjs` (Zerlegen/Verfeinern Bass; `FULL=1` Drums/Tonal, `PROFI=1` Profi simuliert, `O_*` = Z2.o6, `P_*` = Z2.o3),
`messb/orc4.mjs` (`MODE=on|f0|onf0`, `LVL=1`), `messb/hist.mjs` (Ton-Fehler je Intervall), `messb/bass4.js` (Versuchsstand).

---------------------------------------------------------------------------------------------------------------------------
## Auftrag 3/4 – Unison im Nachbau (erreicht) · „Rest aufteilen“ → Lead/Pads (gebaut)
Bau: `python3 bau.py` = basis5 + `spk4-block.js` + 15 Haken „SPK4“ (neu A3: `x4`-Innereien an spk2DspMake, ⋯ an der Rest-Zeile, `spk1MoreDd` → `spk4RestDd`,
spk3KlStart (Unison-Start), spk3KlMore (Start „uni0“), spk3KlOpt (Spielraum Kette B)). Sicherungen Stand A2: `index.a2.html`, `spk4-block.a2.js`, `bau.a2.py`.

### (1) Unison erkennen + nachbauen (`spk4KlUni`, `spk4KlAdsr`, `SPK4_UNI`)
- Erkennen aus der Bewegung (x3): ≥ 5 der Obertöne 1–6 schwanken > 0,2 und Obertöne 1–4 ≥ 0,15 (jeder Oberton schwebt, auch der Grundton).
  Zwei verstimmte Oszillatoren (VA-Probe: cv 0,05/0,007/0,38/0,007/0,48) und FM (Grundton 0,017) fallen nicht darunter → dort bitgleich wie vorher.
- Verstimmung: äußere Stimme = kd 0,92 × x3.det (gemessen an 3 Unison-Klängen: det / äußere Stimme 1,077 · 1,087 · 1,094), uniDet über die Kurve
  der Engine ((0,25·d + 0,75·d⁴)·1,8 HT) zurückgerechnet → 0,300 / 0,448 / 0,201 (Wahrheit 0,30 / 0,45 / 0,20).
- Hüllkurve: die Schwebung verfälscht die ADSR-Schätzung (Stimmen laufen auseinander = scheinbares Abklingen, Anstieg wirkt langsamer). Befund:
  Wahrheit + Analyse-ADSR 2,59, + Analyse-udet 0,32 statt 0,30 → 1,43, + Analyse-Filter 0,88. Unison-Start: Anstieg × 0,5, Halten ÷ 0,7 (Start 2,96 → 2,03).
- Startwerte Kette B: „uni“ (Wellen wie Analyse) und neu „uni0“ (eine Welle), beide mit Unison 5 + geschätzter Verstimmung. Bei erkanntem Unison
  bekommt Kette B 15 % Spielraum beim Wechsel (sonst 5 %) – es läuft weiter nur eine Kette (keine Mehrzeit außer einem Start-Klang).
- Text im Nachbau: „VA · Säge · Unison 5“.

| Klang (Wahrheit) – `spk3-klang-probe.mjs basis5 → Datei` | vorher (4.60) | nachher | Zeit vorher → nachher |
|---|---|---|---|
| VA Säge + Rechteck 50 % +9 ct | 3,89 | 3,89 | 2534 → 2537 ms |
| FM 1:2 | 2,06 | 2,06 | 1819 → 1985 ms |
| **Pad Säge Unison 5 · 0,3** | **1,62** | **0,96** (Unison 5 erkannt) | 2511 → 2891 ms |
| Lead Säge Vibrato 5,5 Hz 25 ct | 0,95 | 0,95 | 2310 → 2382 ms |
Zusatz (`messu/uni.mjs`, `UD`/`MM`): Unison 0,45 auf D3: Kette A 2,47 → Unison 1,51 · Unison 0,20 auf D4: 2,43 → 1,64.

### (2) „Rest aufteilen“ (Kern-op `restAuf` in spk4DspMake, Seite `spk4RestDd`/`spk4RestAuf`)
- Ebenen-Menü ⋯ jetzt auch an der Rest-Zeile (gleiche Spalte/Größe wie bei den Ebenen, Zeile bleibt 46 px), darin „Rest aufteilen“ + ein Satz.
- Kern: nur der Rest (255 − Summe der Ebenen) gibt ab: Lead-Anteil wie Verfeinern Lead (Grundton-Kamm × tonal) × lg 3, vom Übrigen Pads-Anteil wie
  Verfeinern Pads (tonal², ab 120–220 Hz); Rauschen/Tiefes bleibt Rest. Ganzes Stück in Blöcken von 4 Streifen (Speicher ~4 MB je Schätzung),
  Lead/Pads-Ebene wird angelegt, falls sie fehlt; andere Ebenen unverändert; Summe = Original; ein ↶ „Rest aufteilen“. Läuft im Worker.
- Messung (`messb/rest4.mjs`, Node, Demo 20 s, nach Zerlegen; Stems mess/ spur1 = Lead, spur2 = Pad):

| | vorher | nachher |
|---|---|---|
| Pads (SDR gegen Pad-Stem) | Rest als Pad 2,29 · Verfeinern Pads ganzes Stück 2,46 | **Pads-Ebene 2,94** |
| Lead | Rest als Lead 0,18 · Gesang-Ebene 0,72 · Verfeinern Lead 0,52 | **Lead-Ebene 0,96** · Lead + Gesang 1,45 |
| Summe aller Ebenen + Rest = Original | – | 144 dB (nur Rundung) · ↶ Rest bitgleich (159 dB) |
| Laufzeit | – | Node 1,35 s · Browser 2,16 s |
  Varianten (verworfen): ganzer Rest verteilt (voll 1) Lead 0,50 / Pads 2,66 · lg 1: 0,40 / 2,85 · lg 6: 1,22 / 2,58 · lg 12: 1,24 / 2,12 · Pads-Exponent 0,5/2 ohne Gewinn.
  Grund für den kleinen Lead-Anteil (2 %): Zerlegen legt den Lead schon fast ganz in die Gesang-Ebene; im Rest steckt v. a. das Pad.
- Seite (`spk4-rest.mjs <abs index.html>`: 7 OK / 0 FEHLER, `spk4-rest.json`, Fotos `fotos/82-*`, `83-*`): ⋯ an der Rest-Zeile 44×44 an derselben Stelle
  wie bei den Ebenen; Menü in 428×926, 926×428, 926×370 im Bild, Taste ≥ 44; Zerlegen → Rest aufteilen: Ebenen Lead + Pads da, Text „Rest aufgeteilt:
  Lead 2 % · Pads 22 % · ↶ macht es rückgängig“, Summe = Original (144 dB), ein ↶ (Ebenen wie vorher); Konsole [].

### Offen (A3)
1. Lead aus dem Rest bleibt klein, solange die Gesang-Ebene den Lead-Synth hält – „Gesang → Lead“ wäre ein eigener Schritt (Gesang-Ebene ohne Stimme).
2. Unison-Breite (uniWidth) und Unison-Pegel (uniMix) werden nicht geschätzt (fest 0 / 0,6); Stimmenzahl fest 5.

## Pflicht / Regression (A3)
topdefs doppelt 0 / Syntaxfehler 0 · dupkeys 0 · smoke errors [] (`smoke-a3.png`) · „MS 2000“ 1× · „  live: true,“ 1× · VERSION wie basis5 · CHANGES unberührt ·
keine neuen Markenwörter. spk3-test (`spk3-test.out`, Basis basis5): **15 OK / 2 FEHLER** (A2: 14/3) – nachbau-abstaende-besser jetzt OK (Mittel 2,13 → 1,97,
schlechter []); FEHLER nur die aus A2 bekannten: verfeinern-plus-1db (−0,01) und spk2-test 28/30 (verfeinern-verbessert, verfeinern-nach-noten).
spk1-test (`spk1-test.out`) 17 OK / 1 FEHLER verfeinern-verbessert-ziel (4,37 → 4,36) – gleich mit `index.a2.html` (`spk1-test.a2.out`), kommt aus A2, nicht aus A3.
Seite `spk4-rest.mjs` 7/0. Nicht neu gelaufen (Bereiche unberührt): ki1, chr2, vx1, imp1.
Werkzeuge A3: `messb/rest4.mjs` (Rest aufteilen, `R_voll`/`R_lg`/`R_pw` = Z2.o7, `VERF=1` Vergleich Verfeinern), `messu/uni.mjs <datei>` (Pad-Unison, Ketten-Verlauf;
`MODE='{"ab":99,"kd":…}'`, `UD`/`MM` = anderer Unison-Klang), `messu/uni2.mjs` (Startwert-Raster, Wahrheit mit einzelnen Analyse-Werten).

---------------------------------------------------------------------------------------------------------------------------
## Auftrag 4/4 – Gesamt-Test `spk4-test.mjs` (22 OK / 1 FEHLER – nur Verfeinern +1 dB, offen aus A2; Lauf 2 in einem Zug 356 s)
Aufruf: `node spk4-test.mjs <abs index.html> [<abs vorher.html> = ../basis5.html]` (mess/ neben der Datei, basis2.html eine Ebene höher).
Läuft nacheinander, jeder Teil mit Zeitgrenze, `NUR=pflicht,kern,ui,rest,spk3,zeit,spk1,ki1,vx1` wählt Teile, `ALT=1` wertet nur die Ergebnis-Dateien
neben der Datei aus (nichts neu). Ergebnis `spk4-test.json`, Ausgabe `spk4-test.out`, Teil-Ausgaben `kern-*.out`, `spk3-test.out`, `spk1-test.out`, `ki1-test.out`,
`vx1-test.out`; Zwischen-Dateien `spk4-pflicht.json`, `spk4-kern.json`, `spk4-zeit.json`. Ganzer Lauf ≈ 6–7 min.
Teile: Pflicht (topdefs, dupkeys, smoke → `smoke-a4.png`, MS 2000/live: true/VERSION/Block-Lage) · Kern Node vorher/nachher (`messb/x4.mjs FULL=1`,
`messb/rest4.mjs VERF=1`) · Seite (`spk4-ui.mjs`, `spk4-rest.mjs`) · `../spk3/spk3-test.mjs` (noten3 Datei+Basis, spk2-test, Loop, Klang-Probe) ·
Zeit (Noten finden Pads vorher/nachher abwechselnd ×2, Klang-Probe 2. Lauf; je Minimum, weil andere Agenten parallel rechnen) ·
`../spk/spk1-test.mjs` · `../ki/ki1-test.mjs` (Modell + Laufzeit lokal gespiegelt, mit Solo-Gesang aus `realvox/dl`) · `../rolle/vx1-test.mjs`.

| Prüfung | vorher (basis5 4.60) → nachher (SPK4) |
|---|---|
| pflicht | topdefs 0/0 · dupkeys 0 · smoke [] · MS 2000 1× · live: true 1× · VERSION 4.60.0 = 4.60.0 · Block SPK4 1× direkt nach SPK3-END |
| a1-mehrstimmig-pad-allein | 0/28 (Präz 0) → **24/28 (Präz 75 %)**, mehrstimmig |
| a1-mehrstimmig-gemisch-besser | 1/28 (4 %) → 8/28 (11 %) – offen: Pads-Ebene im Gemisch enthält Bass/Lead/Trommeln |
| a1-bassband-einstimmig-unveraendert | Original + Bass-Band: 14/32 → 14/32, gleiche Noten (bitgleich bis auf Zeit) |
| a1-noten-zeit | Pads allein 986 → 1189 / 1045 → 1178 ms · Gemisch 947 → 1177 / 1010 → 1140 ms (Lauf 1 / 2, je Minimum aus 2; +13–24 % für mehrstimmig) · Seite 98 Noten 865–1044 ms |
| a1-seite | spk4-ui 8/8 (Hinweis, Schalter 44 px in 3 Größen, Menü springt nicht, ein ↶) |
| a2-bass-zerlegen-4db | 3,01 → **4,37 dB** (Browser = Node) |
| a2-drums-tonal-nicht-schlechter | Drums 7,47 → 8,55 · Tonal 9,77 → 9,95 · Verfeinern Drums 7,41 → 7,90 |
| **a2-verfeinern-plus-1db** | **FEHLER** 4,37 → 4,36 (−0,01; vorher +0,52) – offen aus A2 (Kamm-Modell selbst mit idealem Pegel 5,00) |
| a2-verfeinern-nicht-schlechter | Verfeinern-Ergebnis 3,53 → 4,36 dB (absolut besser), gegen Zerlegen −0,01 |
| a2-zerlegen-zeit | Zerlegen Node 1984 → 2134 / 2002 → 2052 ms (+3–8 %), Verfeinern 826 → 846 / 787 → 820 ms |
| a2-bass-noten-praezision | Überall finden fair 84 → 79 % (Ziel 70), Quote 75 → 82 % |
| a3-unison-pad-besser | Pad 1,62 → **0,96** („VA · Säge · Unison 5“) |
| a3-andere-klaenge-nicht-schlechter | VA 3,89 → 3,89 · FM 2,06 → 2,06 · Lead 0,95 → 0,95 (kein Unison erkannt) |
| a3-nachbau-zeit | Minimum aus 2: VA 2243 → 2364 · FM 1704 → 1795 · Pad 2427 → 2513 · Lead 2072 → 2211 ms (≤ +7 %; Abstände in beiden Läufen gleich) |
| a3-rest-aufteilen-kern | Pads 2,29 (Rest) / 2,46 (Verfeinern) → **2,94** · Lead 0,18 / 0,52 → **0,96** · Lead + Gesang 1,45 · 1,4 s |
| a3-rest-summe-und-undo | Summe = Original 144,5 dB · ↶ Rest gleich 158,8 dB, Ebenen wie vorher |
| a3-rest-seite | spk4-rest 7/7 (⋯ 44×44, Menü in 3 Größen, Rest aufteilen 1,8 s, ein ↶) |
| reg-spk3-test | 15/17 – FEHLER nur verfeinern-plus-1db + regression-spk2-test (beide = Verfeinern relativ, s. u.) |
| reg-spk2-test | 28/30 – verfeinern-verbessert, verfeinern-nach-noten (4,37 → 4,37; Basis 3,01 → 3,39, absolut besser) |
| reg-spk1-test | 17/18 – verfeinern-verbessert-ziel (4,37 → 4,36) |
| reg-ki1-test | 18/19 – besser-als-klassisch-demo (vorbestehend auf basis5; Profi 4,59 gegen klassisch jetzt 4,37) · Gesang + Guide OK |
| reg-vx1-test | 61/61 |

Regel „bekannt“: Seit A2 schreibt Zerlegen das Tiefband ungeglättet – genau das war der alte Gewinn von „Verfeinern“ (3,01 → 3,53). Darum fallen die
relativen Prüfungen „Verfeinern verbessert“ in spk1/spk2/spk3; der Test lässt nur genau diese zu und prüft dafür das Verfeinern-Ergebnis absolut
(≥ Basis 3,53, nach Noten ≥ 3,39). Alles andere muss grün sein.

### Behoben in Auftrag 4 (nur Test, App unverändert seit A3 – `index.html` = Stand A3, Pflicht erneut grün)
1. Pflicht-Werkzeuge liefen im Test mit dem NODE_PATH der Umgebung (fehlendes Modul) → im Test fest `/opt/node-tools/node_modules`.
2. spk1-/ki1-Ergebnisse enthalten Mess-Einträge ohne „ok“ (messung, sek, sdrProfi, net …) → als FEHLER gezählt; jetzt zählen nur Prüfungen.
3. Zeit-Prüfungen unter Last (Load 5, andere Agenten): Noten finden Pads 1448 → 2776 ms, VA-Nachbau 3059 → 4994 ms in einem Lauf; ruhig nachgemessen
   986 → 1189 bzw. 2746 → 2350 → Teil „zeit“ misst abwechselnd zweimal und nimmt das Minimum.
4. Name des Gesang-Datensatzes steht nicht mehr im Test (erste `*_1.wav` im Ordner, oder `VOX=`).

### Nebenbefund (SPK3 offen 4, nicht SPK4): „Noten finden“ auf der zerlegten Bass-Ebene
`messb/bassnot.mjs [GP=3]`: 0/32 vorher wie nachher – die einstimmige Verfolgung bleibt am unteren Bandrand 28–29 Hz hängen (MIDI 21/22; die Ebene
hat dort echte Energie vom Kick/Rumpeln). Grundton-Pflicht wie in A2 allein: 0 → 5/32 → kein kleiner Fix, nicht eingebaut. Weg: auf Bass-Ebenen
die A2-Verfolgung `bassTrack4` (ab 30 Hz, Kick-Vorlage) statt `trackF` nehmen. Überall finden (79 %) und Original + Bass-Band (14/32) sind nicht betroffen.

### Offen nach SPK4
1. Verfeinern Bass ≥ +1 dB (anderes Modell als der Obertonkamm, s. A2 Offen 1).
2. Mehrstimmig im Gemisch (8/28): Takt-Grenzen aus der Pad-Aktivität, Leck von Bass/Lead als Gegen-Vorlage (A1 Offen 1).
3. Noten finden auf der Bass-Ebene (s. Nebenbefund).
4. Unison-Breite/-Pegel schätzen, Lead aus dem Rest bleibt klein, solange die Gesang-Ebene den Lead hält (A3 Offen).
