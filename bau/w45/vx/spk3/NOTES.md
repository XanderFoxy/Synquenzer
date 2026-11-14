# SPK3 – NOTES (Stand Auftrag 1/4: Bass ohne Download 0,77 → 3,01 dB – Ziel 4 dB noch offen)

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
