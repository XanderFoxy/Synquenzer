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
