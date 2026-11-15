# VOXR1F – Gesang reinigen: Klicks + Raumton (15.11.2026, 16:18–)

Basis: basis.html = rel-4730/index.html (4.73.0). index.html = basis + Änderungen **nur im Block VOXR1-BEGIN…END** (Kern `vr1Make`),
Kommentar-Kennung `VOXR1F`. **Kein neuer Haken**, außerhalb des Blocks bitgleich zu basis.html, VERSION bleibt 4.73.0, nichts Sichtbares.
Sicherungen: index.vor-start.html (= basis), index.vor-klick.html, index.vor-erkennung.html, index.vor-raumton.html.
Werkzeuge (w/): `qc.mjs` (Klick- und Raumton-Teil des Entwickler-Tests, gleicher Code, mit Details; Optionen per CO=/RO= JSON),
`kroom.mjs` + `kroom-dump.mjs` (Raumton-Teil des Prüfer-Kerns mit dessen exakten Löchern), `prof.mjs` (Band > 2 kHz um einen Klick, 0,25-ms-Schritte),
`dbg.mjs` (warum ein Klick nicht erkannt wird), `gap.mjs` (Pegel/Höhenanteil/Oktaven um die Raumton-Lücken), `fp2.mjs` (Ereignisliste um eine Zeit).

## Verfahren

### Klick-Reparatur (`click`, neu `clickSpan`)
Befund (prof.mjs, Take A Klick 18, 38 dB über der Pause): die erkannte Spanne begann 0,6 ms vor dem Klick und endete 0,6 ms vor seinem Ende –
die Erkennung hört auf, wo das Band unter 20 % der Spitze fällt. Der Ausklang blieb stehen **und** war Randwert der LSAR-Interpolation
→ Füllung 6–8 dB über dem Rauschboden. Bei Klick 4 (6,844 s) blieb zudem der Teil des Klicks an der Filterflanke 1,5–2,5 kHz im Tiefband
stehen (LSAR rechnet nur das Band > 1,5 kHz neu).
1. `clickSpan`: Band > 1,5 kHz in 0,25-ms-Rahmen gegen den Median der Umgebung (links 1–12 ms, rechts 3–12 ms); verlängern, solange ein Rahmen
   > 4,8 dB (3×) darüber liegt – rechts ≤ 2 ms, links ≤ 0,5 ms, gesamt ≤ 8 ms, **nur für Funde ≤ 3 ms** (längere = Geräusche des Takes wie bisher).
2. Starker Klick (Band > 1,5 kHz im Fund > 20 dB über der Umgebung): Bandgrenze 700 Hz statt 1,5 kHz (Grundton/erste Obertöne bleiben unberührt).
3. Deckel: Füllung (Band über der Grenze) nie lauter als +3 dB über der Umgebung.
4. Gemeldete Spanne = ersetzte Spanne (floor/ceil auf 0,1 ms; vorher Rundung auf 0,1 ms – konnte die ±2-Proben-Toleranz knapp verfehlen).
Schalter: `{span: 0}`, `{lowF: 0}`, `{cap: 0}`, Feinwerte spanK/spanR/spanL/spanMax/lowH/capK.

### Klick-Erkennung (`clickScan`, VOXR1F-BIG)
Befund (dbg.mjs): Klick 6,844 s (Take A, Pause, 38,6 dB über der Umgebung) fiel durch den Nachbar-Test – 26–28 ms später setzt die Stimme ein,
drei lautere Spitzen im ±25-ms-Fenster. Neu: liegt die Spitze > 30× (≈ 30 dB) über dem Median der Umgebung, reicht der Nachbar-Test im engen
Fenster ±12 ms (Stimmlippen-Pulse ab 85 Hz kommen dort mindestens zweimal). `{big: 0}` = wie vorher.
Nicht gelöst: 3 Klicks auf gesungenen Vokalen (5,17 s 6,8 dB / 23,0 s 4,4 dB / 19,8 s 1,9 dB über der Umgebung im Band > 2 kHz; Spitze nur
1,7–1,8× über den Stimmlippen-Pulsen, Schwelle 2,28).

### Raumton (`room`)
Befund (gap.mjs): In den Entwickler-Lücken 2/3/5 (Take A) hat das Original **in** der Lücke 3–9 dB mehr Höhen (4–8 kHz) als die 60 ms direkt
daneben (Luft/Atem mitten in der Pause) – aus der Nachbarschaft nicht ableitbar. Der gelernte Raumton ist noch dunkler (Farbe 5,5–10 dB).
1. Klangfarbe: Fenster mit Gesangsrest (stärkster Bin 100–1500 Hz > 30× Median dieser Bins) zählen nicht; von den rauschartigen die nahe der
   Lücke (≤ 100 ms), darüber der Median je Terzband wie VOXR1D-RT. < 3 Fenster → wie bisher. `{ton: 0}` = aus, `{nw}`, `{pm: 1}`.
2. Pegel: liegt der Raumton direkt an der Lücke (3 Rahmen je Seite) über dem Median von weiter weg, zählt er – höchstens +2 dB darüber
   (VOXR1D-RP deckelte nur nach oben). `{up: 0}` = wie vorher.

## Messtabelle (vorher = basis 4.73.0, nachher = Endfassung)
| Messung (Ziel) | vorher | nachher |
|---|---|---|
| Entwickler: Klicks Take A gefunden (≥ 18/20) | 16 (d1 23 / d2 4) | **17** (d1 24 / d2 3) – Ziel knapp verfehlt |
| Entwickler: Klicks A/B/C neue Fehlalarme | 0 / 0 / 0 | 0 / 0 / 0 |
| Entwickler: Überstand > 2 kHz nach Reparatur A / B / C (≤ 3 dB) | 7,5 / 3,2 / 2,9 | **2,6 / 0,5 / 1,2** |
| Entwickler: Klick-Fehlerenergie Median A / B / C (Info) | 10,9 / 4,3 / 6,9 dB | 13,2 / 3,7 / 6,9 dB |
| Entwickler: Raumton Pegel je Lücke ±3 dB | FEHLER (Lücke 3: −4,1) | **OK** (max −2,7) |
| Entwickler: Raumton Farbe ±4 dB | [2,1, 4,8, 6,3, 2,3, 6,7] | [1,7, 4,2, 6,2, 2,3, 5,9] – FEHLER bleibt (siehe Befund) |
| Prüfer-Kern Klicks B@44 / C@48 | 19 / 20, fehl 0, bitgleich | 19 / 20, fehl 0, bitgleich |
| Prüfer-Kern Raumton Farbe C@48 / C@44 (kroom, exakte Löcher) | [3,3, 3,5] / [3,8, 1,8] | [3,0, 1,4] / [2,5, 1,9] |
| Prüfer-Kern Raumton Pegel C@48 / C@44 | [0,3, −1,9] / [0,3, −1,8] | [2,3, 0,1] / [2,3, 0,2] |
| Prüfer-Kern gesamt | siehe LOG (Lauf Basis 56/60) | siehe LOG |
| Abnahme kern2 gesamt / Klicks | 41/62; B@48 18/20, fehl 0 | 41/62; B@48 19/20, fehl 1 (≤ 1 erlaubt; auch ohne BIG) |
| Abnahme kern3 (Raumton v2) gesamt / Pegel / Farbe | 29/50; 14/24; 8/24 | 29/50; 14/24; 9/24 (A Lücke 6 schlechter, C besser) |

Abschluss-Läufe (Kette, Zeit-A/B): siehe LOG.md, Endstand unten in „Ergebnis“.

## Abwägungen (gemessen, verworfen)
- Nachbar-Fenster der Erkennung 18–22 ms statt 25 ms: A 17 gefunden, aber neue Fehlalarme (A 1, B 1–3) → verworfen, stattdessen BIG.
- Spanne auch für lange Funde verlängern: C bekam im 2. Durchgang eine neue Stelle (7,164 s) → nur Funde ≤ 3 ms.
- Schwelle 6 dB statt 4,8 dB: B bleibt 3,2 dB; 3 dB (2×): B −0,1 dB, aber mehr Interpolation über Gesang. Gewählt 4,8 dB.
  Preis: Fehlerenergie gegen den sauberen Take sinkt in B (Median 4,3 → 3,7 dB) und bei einigen Prüfer-Klicks (INFO „Klick-Abzug“, z. B. C48 #15
  8,6 → 1,4 dB) – dort wird sauberer Höhen-Inhalt mitersetzt. Keine Zählprüfung betroffen.
- Ganzes Band per LSAR ersetzen (Klick in Pause): A 9,4 dB → verworfen; Tiefband-LSAR griff bei 6,844 s nicht (Tiefband nur 2× über der Umgebung) → 700-Hz-Grenze.
- Raumton: Leistungsmittel der rauschartigen Fenster (Take A Farbe Lücke 5 4,3, aber Prüfer C 5,8/6,5 – bricht den Prüfer-Kern), gelernter Raumton
  (alle 5,5–10 dB), nur 30–50 ms daneben (Lücke 1 4,7), Pegel bis +3 dB (Prüfer C +3,3) → verworfen.

## Haken
Keine neuen Haken. Alle Änderungen in `vr1Make` (VOXR1-Block): `clickScan` (BIG), neue Funktion `clickSpan`, `click`, `room`.

## Offen
- Klicks Take A 17/20: drei Klicks auf gesungenen Vokalen (1,9–6,8 dB über der Umgebung). Ansatz: Puls-synchroner Vergleich (Spitze gegen die Spitzen
  eine Periode davor/danach) statt „zweitgrößter Nachbar“.
- Raumton-Farbe Take A Lücken 2/3/5 (4,2 / 6,2 / 5,9 dB): das Original hat dort mehr Höhen als jede Nachbarschaft; ohne eine Annahme „Pausen-Mitte
  heller“ nicht erreichbar (wäre auf den Test zugeschnitten). kern3 A Lücke 6: Farbe schlechter (Nahbereich dort heller als die Lücke).
- Klick-Füllung zu leise in den Höhen (Rauschen in Nachbar-Farbe ergänzen) nicht gebaut: senkt den Überstand nicht und erhöht den Fehler gegen sauber.
