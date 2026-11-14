# SPK4 – NOTES (Stand Auftrag 1/4: mehrstimmige Noten)

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
