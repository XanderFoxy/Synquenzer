# KSM – Stand (fertig, kleiner Umfang ehrlich unten)
Bau: `python3 apply.py <eingang> <ausgang>` (Eingang 4.88.0 md5 695af0504463a6385e21dc94e55b00c9; Ausgang hier `index.html`, md5 171211a57a73f348b5823c45c677ac1f).
Quellen: `block-wk.js` (Worklet, ASCII, /* KSM-BEGIN (worklet) */ vor `function ks4Def(){`), `block.js` (Hauptskript, /* KSM-BEGIN */ vor `function ks4PageLfo(pg,i,n){`).
Haken (Code-Anker, je feste Trefferzahl): Worklet `startVoice` → `this.ksmV(v,this.lkEv)` nach lkStart; lkStart überspringt Paare -9000…-9017 (kein lkBad);
`ks4Lfo`/`ks4Ctl`-Aufruf → `ksmLfo`/`ksmCtl` (ohne v.ksm exakt alter Aufruf); `ks4Post` m/k je Stimme (v.ksmF); `ks4Der` liest Takt-Schläge aus P statt Q (gleiche Werte)
und rechnet auch, wenn nur die Stimme TAKT hat; `deriveInto(v.Dv,VP)` ×2 (lkView/lkRamp) wendet Stimmen-TAKT an. Hauptskript: `lkNoteX` schickt Lock-Paare (Kennung -9000-j)
nur für VA/FM; `pageLfo` → `ksmPv(pv,i,n)` (Linien). Laufzeit: DST_ID (40…47), SQStore.MOD_DST, MOD_DST/MDST, VA_ONLY_DST (Filter 2), LKT-Einträge für 18 Schlüssel.

## Kern-Test
`kern-ksm.cjs` – `node kern-ksm.cjs <neu.html> [basis.html]` (eigener Temp-Server 9000–9099, version.json 4.88.0). Gegen andere Fassung: erste Datei = Kandidat, zweite = Vergleich.
Ausgabe `kern-ksm.out`: **ALLE OK**. Misst: 13 Locks über den echten Weg lkNoteX → Worklet (ksF2c/r/e/m, ksPe, ksR1/G1/R2/G2, ksAa/Ar/Fa/Md) und 8 Routen
(pe, f2cut, f2res, f2amt, f2mix, ras1, ras2, takt) je Offline-Render (Unterschied −45 … +4 dB); ohne Lock/Route Hash neu = 4.88 (schlichter Klang und KS4-Klang mit Filter 2/Raster);
Tipp: MOD › + Modulation › LFO 1 › „Filter 2 Cutoff“ → Route im Klang; Ziel-Chips ohne Überlappung/abgeschnitten (hochkant 428×926, quer 926×428); Raster-Linien (15) nur neu;
Konsole ohne Fehler. Fotos: foto-vorher(.png/-quer), foto-nachher(.png/-quer) = LFO 1 im TAKT 1/1 + Raster 8 Stufen; foto-ziele(-quer) = Ziel-Auswahl.
Pflicht (`pflicht.out`): doppelt.js neu [], „MS 2000“ 1×, „  live: true,“ 1×, verbotene Zahlen 0×.

## Grenzen / offen
- Locks der KS-Regler nicht per Fingertipp im Lock-Modus getestet (nur über lkToN/lkNoteX); der Lock-Modus nimmt sie jetzt an (LKT-Eintrag), keine Reihen/Lanes dafür.
- TAKT-Lock nur Notenwerte (kein „FREI“ je Schritt); Filter-2-Typ/Weg/Quelle nicht lockbar; Filter-2-Locks/-Routen wirken nur bei Filter 2 an.
- Raster-Route ändert nur die Stufenzahl (3–16), wenn RASTER auf Stufen steht; TAKT-Route skaliert die TAKT-Zeiten beim Anschlag in Zweierpotenzen (±4 Stufen).
- Legato-Wiederanschlag übernimmt Stimmen-Werte nicht neu; WT/MS/Bit-Mask: Locks werden gespeichert, wirken aber nicht.
