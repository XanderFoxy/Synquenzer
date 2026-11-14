# SPK2 – NOTES (Stand Auftrag 2/5, halb)

Datei `vx/spk2/index.html` = basis2.html (4.57.0) + Block `SPK2-BEGIN … SPK2-END` direkt nach `/* SPK1-END */` + 4 Haken mit „SPK2“
im SPK1-Block. Quelle des Blocks: `spk2-block.js`, Einbau: `python3 bau.py` (baut immer neu aus basis2.html). VERSION/CHANGES unberührt.

## Was drin ist
- `spk2DspMake(I)` läuft im selben Worker (Worker-Text schickt `spk2DspMake.toString()` mit); `I` = Innereien des SPK1-Kerns.
- `Z2.opt = {an: false, rob: 4, robq: 0.5, kick: true, diag: null}`. **an = false** → SPK1-Verhalten bitgleich (gemessen).
  Mit an = true: `lowSplit` (Tiefband) und `projRow` (fein → Basis) laufen über SPK2.
- `bassTrack`: N 16384, Obertonsumme auf √|X| (27–290 Hz, Viertelton-Raster), Viterbi (±1 Viertelton frei, Sprung kostet 1,2),
  Noten-Prüfung: Dauer ≥ 0,1 s, Kamm-Anteil, deutliche Obertöne 2.–6. (Spitze ≥ 4× Umgebung ±4…8 Bins), fallende Tonhöhe = Kick,
  Unter-Oktave (Sub-Oszillator) per Spitzen-Verhältnis.
- `lowSplit`: Obertonkamm-Leistungsmodell (parabolische Spitze, Hann-Fensterantwort `w2`), Pegel je Oberton stetig je Note
  (≤ rob × Quantil robq im Fenster ±0,25 s), Wiener-Anteil b / max(x², b + kick); Drums = (1 − sb)·((1 − h) + h·tief).
- `kickModel`: je Rahmen/Bin bis 200 Hz zweitkleinstes von 7 Werten im Schlag-Abstand (Tempo aus `d.meta.grid.bpm`).
- `projLk`: Leistung über die Fensterantwort der Basis-FFT (±4 Bins) gewichtet.

## Messung (Demo-Song, `messk/`, Gemisch = Summe der Stems, Tempo 112)
| Fassung | Drums | Bass | Verfeinern Bass |
|---|---|---|---|
| SPK1 (= SPK2 aus) | 5,99 | 0,77 | 0,77 → −0,46 |
| SPK2 an (rob 4, Median, Kick-Modell) | 6,15 | −0,34 | −0,34 → −0,41 |
| SPK2 an, rob 2 / unteres Fünftel | 5,69 | −0,03 | |
| SPK2 an, ohne Stetigkeit | 5,84 | −0,66 | |
| nur projLk, SPK1-Tiefband | 6,06 | 0,45 | |
| ideale feine Anteile (N 8192) durch die ganze Kette | 8,46 | **4,84** | → 5,67 |
| ideale Maske N 4096 (Obergrenze) | 12,1 | 6,88 | |
Fein-Diagnose (diag.mjs, an): Bass-Treffer 40–60 Hz 0,41 / 60–100 Hz 0,52 / 100–200 Hz 0,38 / 0–40 Hz 0,00; Fehlalarm 10–40 %.

## Befund
Bass hat einen Sub-Oszillator eine Oktave tiefer (32/40/48 Hz, −8 dB zum Grundton). Kick-Ausklang 51 Hz (67 → 48 Hz, ~0,4 s, auf
jedem Schlag), 7–13 dB lauter als der Bass im Band 40–60 Hz. Sub 48,5 Hz und Kick 51 Hz liegen < 1 Bin (N 8192) auseinander → nur
über die Zeit trennbar. Die Kette selbst schafft ≥ 4 dB (ideale feine Anteile 4,84), Engpass ist die Schätzung.

## Nächster Schritt (Auftrag 1/5 fortsetzen)
1. Sub-Erkennung reparieren: Umgebung ohne den Kick-Bereich messen (Kick-Modell abziehen, dann Spitzen-Verhältnis) → 0–40 Hz Treffer.
2. Kick als Vorlage statt Minimum: Anschläge im Schlag-Raster finden, 2-D-Vorlage (Zeit × Bin, ~0,5 s) über alle Anschläge des
   ganzen Stücks mitteln (zPrep, einmal), je Anschlag Verstärkung schätzen → Kick-Leistung subtrahieren, Rest = Bass-Kandidat.
3. Bass-Pegel je Note: Hüllkurve aus den Obertönen 2–4 (kaum Kick) und auf den Grundton/Sub übertragen.
4. Danach Verfeinern je Ziel (NMF mit Vorlagen aus der Auswahl; Drums HPSS fein + Transienten; Pads lange Glättung).

## Werkzeuge
`messk/kurz.sh` (Kurzausgabe; `ZR=v.mjs SPK2=1 messk/kurz.sh` = an, `ROB=… ROBQ=… KICK=0`), `messk/diag.mjs` (Treffer/Fehlalarm je Band),
`messk/orsb.mjs` (ideale feine Anteile durch die Kette), `messk/exp1.mjs` (Obergrenze Projektion), `messk/dbg.mjs`, `messk/pk.mjs`
(Spitzen der Stems). Alle laufen in Node mit dem Kern aus `spk2/index.html` (~3 s je Lauf).

## Pflicht (Stand)
topdefs doppelt 0 / Syntaxfehler 0 · dupkeys 0 · smoke errors [] (`smoke-a1.png`) · „MS 2000“ 1× · „  live: true,“ 1× · Markenwörter
wie Basis · VERSION gleich · spk1-test 17 OK / 1 FEHLER (wie SPK1, verfeinern-verbessert-ziel).

---------------------------------------------------------------------------------------------------------------------------
## Auftrag 2/5 – Noten je Ebene · Zuordnen · Überall finden (halb: Bedienung fertig, Güte im Gemisch offen)

### Kern (spk2-block.js, im Worker; `Z2.ops` hängt an der op-Weiche `default:` des SPK1-Kerns)
- `noten {lid, sel}`: Ebene (render mono) oder Original (`d.mid`); Bereich = Art der Ebene (Bass 28–400 Hz, Gesang 75–1100, Lead 90–2100,
  Pads 55–1500, eigene 40–2000, Original 40–1000), eingeschränkt durch Rechteck/Zeit/Frequenz-Auswahl. Grundton: Obertonsumme auf √|X|
  (N 8192 unter 70 Hz, sonst 4096, Hop = Basis-Hop), Viterbi (Viertelton, Sprung kostet 1,2), Anwesenheit q = Kamm/Band.
  Anschläge: Fluss N 2048/Hop 512 im Band bis 4·f, Grenze nur bei Anstieg ≥ 3 dB; dazu Tonwechsel und weicher Einsatz. Ende = nächste
  Grenze oder Hüllkurve −24 dB. Oktav-Prüfung (ungerade 3/5/7 gegen gerade 2/4/6 < 0,3 → Oktave höher; Sub-Oszillator).
  Raster: Anfang/Ende auf 1/16 (Takt aus `meta.grid`), Rohzeiten a/b bleiben. Bestätigte Noten bleiben, alte Funde im Bereich ersetzt.
- `zuordnen {notes:[{lid,id}], nach, art}`: Kamm je Note (Harmonische entlang `fz`, 16 Obertöne, 45 ct) → SPK1-`transfer` von „Original“
  (verschiebt aus allen Ebenen) in die Ziel-Ebene; gibt es keine der Art → neue Ebene. Noten wandern mit, st = 'zu'. Ein Undo-Schritt.
- `finden {lid}`: Vorlage = mittleres Obertonprofil (√-Beträge, 12/16 Obertöne, normiert) der bestätigten Noten aus dem Original,
  über die Tonhöhe verschoben (Viertelton-Raster, Bereich der Vorlage ±7 Halbtöne); Wert = cos² × Anteil; Viterbi; Vorschläge st = 'neu'
  mit `conf`; was schon bestätigt ist (gleiche Zeit, gleiche Tonklasse) fällt weg. `teil2.tmpl[lid]` = Vorlage. Ein Undo-Schritt.
- `notenWeg`: Vorschläge verwerfen (ein Undo-Schritt). Undo: `uBegin/uSwap` sichern jetzt auch `meta.teil2` (Haken „SPK2“).

### Seite
- Werkzeug „Noten“ (letzte Taste der Leiste); Optionszeile: [Noten ▾] · „Sicher ab“ (Filter für Vorschläge) · „einstimmig“.
- Kästchen über dem Spektrum in der Farbe der Ebene (Original = hell): bestätigt voll, gefunden halb, Vorschlag gestrichelt + %;
  bei anderem Werkzeug blasser. Tipp auf Kästchen / Rahmen ziehen → Klappfenster „Gehört zu: Bass │ Gesang │ Lead │ Pads │ Neue Ebene“
  (+ Verwerfen). Tipp ins Leere = Abspielposition wie bisher.
- Noten ▾ (Quelle = gewählte Ebene der Liste): Noten finden (Auswahl) · Überall finden · Alle übernehmen (n) · Verfeinern nach Noten
  (Auswahl = Kämme der bestätigten Noten → SPK1-Verfeinern mit Ziel = Art der Ebene, Vorher/Nachher wie gewohnt).
- Test-API `SYNQUENZER.spk1.spk2` (noten, zuordnen, finden, weg, page.*). Nichts lädt beim App-Start (nur 1 Eintrag in SPK1_TOOLS).

### Messung (messk/noten.mjs; Wahrheit = Bass-Noten aus `demoProjectRaw`, 32 Noten in Takt 1–4; Treffer = Anschlag ±70 ms + richtiger Ton)
| Quelle | Quote | Präzision | Oktave | falscher Ton | Fehlalarm |
|---|---|---|---|---|---|
| Bass-Stem allein (Tracker-Obergrenze) | 87,5 % | 87,5 % | 0 | 1 | 3 |
| Original, Auswahl 28–400 Hz | 44 % | 28 % | 5 | 8 | 24 |
| Bass-Ebene nach Zerlegen (SPK1-Bass 0,77 dB) | 0 % | 0 % | 0 | 29 | 27 |
| Überall finden (Vorlage aus 5 bestätigten Noten Takt 1 → Takte 2–4) | 46 % | 23 % | 3 | 6 | 27 |
Anschlag-Lage gut (Mittel −4…+9 ms). Fehlalarme v. a. in Takt 5–8 (kein Bass; Pads/Lead C4…E4 liegen im Band bis 400 Hz) und
Kick-Ausklang (≈ 48–51 Hz). „Sicherheit“ trennt noch schlecht (Vorschläge 0,84–0,95).

### Nächster Schritt Auftrag 2 (offen)
1. Sicherheit schärfen: Vorlage + Gegen-Vorlage (was im Takt 5–8 ohne Bass klingt) → Wert = Abstand; Mindestpegel relativ zur Vorlage.
2. Bass-Band oben enger (bis ~260 Hz bzw. Vorlage +7) und Kick-Modell (Auftrag 1, `kickModel`) vor dem Grundton abziehen.
3. Mehrstimmig nur „einfach“: Harmonie-Summe iterativ (beste Note abziehen, nächste ≥ 50 %) für Pads; bis dahin ehrlich „einstimmig“.
4. Bass-Ebene selbst verbessern (Auftrag 1 offen) – dann trägt auch „Noten finden“ auf der Ebene.

### Dateien
`spk2-block.js` (Kern + Seite), `bau.py` (Haken), `messk/noten.mjs` (Trefferquote; `STEM=1` = Bass-Stem allein), `spk2-noten-test.mjs`
(+ `spk2-noten-test.json`), Fotos `fotos/30-noten-hochkant.png`, `31-gehoert-zu.png`, `32-ueberall-finden.png`,
`33-verfeinern-nach-noten.png`, `34-noten-quer-428.png`, Rauchtest `smoke-a2.png`.
