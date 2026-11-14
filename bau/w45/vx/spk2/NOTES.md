# SPK2 – NOTES (Stand Auftrag 1/5, halb)

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
