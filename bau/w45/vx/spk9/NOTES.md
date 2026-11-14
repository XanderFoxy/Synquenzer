# SPK9 – Legato-Noten der Spektral-Seite (Befund 17 der SPK6-Prüfung)

Bau: `python3 einbau.py` = `basis.html` (4.63.0, = basis7) + `spk9-block.js` direkt nach `/* SPK7-END */` + 4 Haken „SPK9“ (je Anker 1×):
1. `spk1DspMake`: `if (Z2 && typeof spk9DspMake === 'function') spk9DspMake(Z2);` – eigene Zeile direkt **vor** der SPK6-Zeile (zwei Zeilen
   Abstand zur SPK8-Zeile nach SPK4 → `git merge-file` ohne Konflikt).
2. `spk1Worker`: Text `spk9DspMake.toString()` nach SPK5 mitschicken (Zeile `const src`; SPK8 ändert die Zeile `const w` zwei Zeilen tiefer).
3. SPK2 `noten` (Noten finden, einstimmig): `(typeof opt.seg9 === 'function' ? opt.seg9 : segNotes)({…, art: artOf(d, lid)})` (art seit der Prüfung).
4. SPK2 `finden` („Überall finden“, von SPK3 für alles außer Bass benutzt): derselbe Ein-Zeiler mit `art` (seit der Prüfung, Befund 5).
Mehrstimmig (SPK4): kein Haken nötig – `spk9DspMake` läuft nach SPK4 und legt sich um `Z2.ops.noten` (eine Stimme → einstimmiger Weg).
VERSION/CHANGES unberührt, keine Bedienung, kein Aussehen geändert, kein neuer Knopf.

## Ursache
SPK2 `segNotes` setzt eine Tonwechsel-Grenze nur, wenn kein Fluss-Anschlag ≤ 70 ms daneben liegt (`near`). Ein Anschlag wird aber
selbst nur mit Pegel-Anstieg ≥ 3 dB zur Grenze. Beim Legato bringt der Tonwechsel neue Teiltöne (Fluss-Anschlag), aber keinen
Pegel-Anstieg → beide Grenzen fallen weg, die Phrase wird **eine** Note mit dem Median-Ton (A3 D4 H3 → „m 59, 0,99–4,01 s“).
Die alte Tonwechsel-Regel (3 Rahmen auf neuem Halbton) zerhackte dagegen Gleiten, Vibrato und Ausklang.

## Neu (`spk9DspMake`, Kern im Worker)
- `steps()`: Tonhöhen-Stufen mit Hysterese wie der Gesang-Weg VS2b (70 ms / 60 ct): 3-Rahmen-Median der Grundton-Spur; Mitte der
  laufenden Note = Median der letzten ≤ 0,6 s (ohne die ersten 40 ms). Wechsel erst, wenn die Spur ≥ 70 ms am Stück ≥ 60 ct neben der
  Mitte liegt **und** danach ruhig steht: 60 ms Spanne ≤ 25 ct, oder (Vibrato auf dem neuen Ton) 200 ms im Band ±60 ct mit Auf und Ab;
  150-ms-Median der neuen Höhe ≥ 60 ct neben der Mitte. Halbwelle < 160 ms, die ≥ 30 ct zur Gegenseite schwingt = Vibrato.
  Grenze dort, wo die Spur die Mitte zwischen alter und neuer Höhe kreuzt; beide Teile ≥ 80 ms; neuer Teil ≥ 12 dB leiser = Ausklang.
- Übergang statt Ton: Stück < 0,25 s zwischen zwei Stufen, tonhöhenmäßig zwischen den Nachbarn, ≤ 1,5 HT vor dem Ziel und ≥ 0,4 HT
  in Richtung Ziel unterwegs (Anfahrt eines Gleitens) → gehört zu den Nachbarn, eine Grenze auf halbem Weg.
- `segNotes9`: wie SPK2 (Anschläge mit Anstieg, Einsatz nach Pause, Ende −24 dB, Ton = Median, Oktav-Prüfung, Raster, fz) – nur die
  Tonwechsel-Grenzen kommen aus `steps()` und werden nur von **angenommenen** Anschlägen (≤ 70 ms) verdeckt.
- Nur oberhalb des Bass-Bands: Ebene Bass bzw. Auswahl oben ≤ 400 Hz bleibt bei SPK2 (siehe Regression). Schalter `Z2.o9.an`.
- Mehrstimmig (SPK4 `polyNoten`) und Bass (SPK3 Überall finden, SPK8 Bass-Noten) unverändert, siehe Offen.

## Messung (`leg/leg.mjs <html>`: Node, Kern aus der Datei, Ebene „Gesang“ aus Rechteck 150–9500 Hz, 48 kHz, einstimmig)
Prüffälle: L = 32 Legato-Phrasen (3–8 Töne, Sprünge 1–12 HT, 0,28–0,78 s, jede 2. mit Vibrato ±30–50 ct 4–7 Hz, Gleiten 0/40/80 ms,
24 Teiltöne mit Vokal-Formanten a/e/o/i, Zittern, Atemrauschen); V = 16 gehaltene Töne mit Vibrato ±20–50 ct 4–7 Hz; G = 16 Gleiten
2–7 HT in 0,25–0,6 s zwischen zwei gehaltenen Tönen (Wahrheit: zweiter Ton ab Mitte des Gleitens); A = 8 Ausklänge (Abklang 0,4–0,8 s,
Tonhöhe fällt 0,3–1 HT); B = Befund 17 (A3 → D4 → H3 je 1 s, phasenstetig, Delle ohne/50/25/0 %, Bass 55 Hz).
Treffer = gleiche Tonhöhe, Einsatz ±0,12 s; Zusatz = gefundene Noten ohne Wahrheit / Wahrheit.

| | vorher (4.63.0) | nachher (SPK9) | Ziel |
|---|---|---|---|
| L Legato-Töne getrennt | 13,4 % (23/172) | **98,8 %** (170/172) | ≥ 90 % |
| L Zusatz | 9,9 % | 1,2 % (2 Oktav-Fehler, s. Offen) | |
| V Vibrato Zusatz | 18,8 % | **0 %** | ≤ 5 % |
| G Gleiten getrennt / Zusatz | 71,9 % / 96,9 % | 96,9 % / **12,5 %** | ≤ 5 % (nicht ganz) |
| A Ausklang Zusatz | 25 % | **0 %** | |
| B Befund 17 | 0/12 (je eine Note m 59) | **12/12**, 0 Zusatz | 3 Noten |
| R schnelle Legato-Läufe (12×6 Töne 0,15–0,24 s) | 1,4 % (1/72) | **100 %** (72/72), 0 Zusatz | |
| Laufzeit (76 Fälle, Node) | 25,7 s | 27,3–28,6 s | |

44,1 kHz (Hop 23 ms): L 98,3 % / 1,7 % · V 0 % · G 96,9 % / 9,4 % · A 0 % · B 12/12. Zweite Stichprobe (ONLY=R,G): G 3,1 % Zusatz,
R 94,4 % getrennt. G-Zusatz schwankt mit der Stichprobe (16 Fälle) zwischen 3 und 12,5 %, zusammen 7,8 %.
Probe „Übergang bis 2,5 HT vor dem Ziel“ (`O9='{"trN":2.5}'`, nicht eingebaut): G 3,1 %, aber schnelle Läufe 91,7 % → verworfen.

Schritte (G-Zusatz): Hysterese + ruhig ≤ 50 ct 97 % → ruhig ≤ 25 ct/60 ms + Vibrato-Band 56 % → Übergangs-Regel 0,17 s 50 % →
0,25 s/≤ 1,5 HT 12,5 % (L, V, A, B unverändert gut).

## Seite (Befund 17 per Touch, `spk9-ui.mjs`, 428×926, Ergebnis `spk9-ui.json`, Fotos `fotos/spk9-0*.png`)
Gesang-Ebene aus Legato A3 → D4 → H3 (je 1 s, ohne Lücke): vorher eine Note 59 (0,99–4,08 s), D4 nicht wählbar →
nachher 57 (0,99–2,00) · 62 (2,00–3,00) · 59 (3,00–4,09) (+ kurzer Vorlauf 0,90–0,99 s durch den Hintergrundton, wie in der SPK6-Prüfung).
„Noten bearbeiten“: D4 per Touch 2 Zeilen hoch → Anwenden 513–580 ms → E4 +1,8 ct, A3 −0,1 ct, H3 −1,6 ct, ↶ „Noten bearbeiten“.

## Regression / Pflicht (Einzelheiten LOG.md)
- spk4-test: 5 FEHLER von 23 = dieselben wie im SPK8-Paket (gemisch-besser, verfeinern +1 dB, unison-besser, reg-spk3 bekannt, reg-ki1 quer);
  reg-spk2-test 28/30 (noten-erkannt 14/51 wie Basis), vx1-test 61/61, Pflicht im Lauf OK.
- spk5-test 24/24 · spk5-fade-test ALLES OK · spk6-test ALLES OK · spk6-pruef-test fails 0 · spk1-test 17/18 (nur verfeinern-verbessert-ziel, Basis).
- topdefs 0/0 · dupkeys 0 · smoke errors [] · MS 2000 1× · live 1× · VERSION 4.63.0 · Markenwörter 25 = Basis, 0 in Block/Tests/Notizen.
- Probe-Merge (git merge-file): mit SPK8 0 Konflikte, mit VX2 0 zusätzliche Konflikte.

## Offen
1. Gleiten: 3–12,5 % Zusatz je Stichprobe (zusammen 7,8 %, Ziel ≤ 5 %). Rest = Anfahrt, die 0,25 s überschreitet, oder Spur-Ausreißer mitten im schnellen Gleiten
   (z. B. 57 → 52 ergibt kurz „65“). Weg: Grundton-Spur feiner als das Viertelton-Raster (parabolische Spitze) statt Treppe; dann
   „ruhig“ und „unterwegs“ sicherer.
2. Oktav-Fehler bei Vokal „i“ (Formanten 300/2200/2900 Hz: ungerade Teiltöne schwach → SPK2-Oktav-Prüfung verdoppelt) – vorbestehend,
   2 von 172 Tönen.
3. Mehrstimmig (SPK4) auf einstimmigem Gesang: viele Geister (Oberton-Oktaven, Einsätze bei 0 s), Legato-Trennung 14 % – der Weg ist für
   Pads gebaut, Gesang läuft automatisch einstimmig. Nicht angefasst (eigener Auftrag: Einsatz-Rückgriff nicht vor das Ende des Vorläufers
   eines **anderen** Tons, Oberton-Oktaven gegen den Grundton prüfen).
4. Bass-Band bleibt SPK2 (mit Stufen-Regel 14 → 12 Treffer im spk2-test); SPK8 bringt dort eine eigene Verfolgung.

## Prüfung (9 Befunde aus PRUEFUNG.md, nachgestellt und bearbeitet 14.11. 22:08–23:2x)

Vorher = Stand vor der Prüfung (`fix/index.vor-pruef.html`, `fix/spk9-block.vor-pruef.js`), nachher = `index.html`. Alle Zahlen frisch
gemessen mit den Prüfer-Skripten (`pruef/legx.mjs`, `pruef/rescore.cjs`, `pruef/bassband.mjs`) und `leg/leg.mjs`, Läufe in `fix/mess-alle.sh`,
Ergebnisse `fix/mess/*-vor.json` / `*-nach.json`, Tabelle `fix/tabelle.py` → `fix/tabelle.txt`. Getrennt / Zusatz, Oktav-Fehler = Treffer nur mit
gleicher Tonklasse. Neue Tests: `fix/poly9.mjs` (Mehrstimmig ohne Schalter: eine Stimme / Akkorde), `fix/finden9.mjs` („Überall finden“ auf Gesang).

| Befund | Stand | Was geändert (alles im Block, Schalter in `Z2.o9`, 0 = aus) |
|---|---|---|
| 1 mittel, langes Gleiten = 1 falsche Note | **behoben** | nichts Ruhiges in `look` → 0,25 s weiter suchen statt ans Laufende springen (`adv`); Mitte der neuen Note erst ab der ruhigen Stelle (`cst`); Tonhöhe = Median der dichtesten Halbton-Breite, nur nahe am Median (`dicht`, `dichtA`, `dichtW`) |
| 2 mittel, Gleiten-Zusatz | **behoben bis 1,4 s**, Rest offen | Viertelton-Treppe eines Gleitens ist kein ruhiger Ton (`stair`); Übergangs-Regel bis 0,5 s / 3 HT, aber geschützt: flache Mitte ≥ ¾ HT vor dem Ziel = Ton, langes Stück nur bei gleichmäßigem Lauf (`tr`, `trN`, `trFlat`) |
| 3 mittel, kurze Verzierungen | **behoben ab 0,1 s** | Vibrato-Regel nur bis 0,875 HT Hub (`vibMax`); Durchgangston mit flacher Mitte bleibt (`trFlat`); kurzer Ton: Höhe nur aus seinem Plateau, wenn die 150-ms-Höhe schon den nächsten Ton enthält (`nlP`) |
| 4 mittel, Oktav-Fehler | **behoben** | Oktave höher nur, wenn ungerade Obertöne < 12 % der geraden (`okt`) oder < 30 % UND der Grundton selbst schwach (< 0,3 × gerader Mittelwert, `oktG`) – reine 12-%-Regel war mit Begleitung im selben Layer (MX) schlechter |
| 5 mittel, SPK3/SPK4 | **behoben** (eine Stimme) | Haken 4 in SPK2 `finden` („Überall finden“); `Z2.ops.noten` umhüllt: Mehrstimmig (automatisch oder Schalter) prüft, ob nur EINE Stimme klingt (Spektral-Spitzen bis 2,5 kHz, fremde Spitzen ≤ 15 %, Grundton da, in ≥ 70 % der lauten Rahmen, jeder 3. Rahmen) → einstimmiger Weg, Ergebnis bleibt „mehrstimmig“ (`mono`, `qMono`, `pMono`). Akkorde: Anteil 0 → unverändert SPK4 |
| 6 leicht, Pegelsprung ≥ 11 dB | **behoben** | Ausklang nur, wenn der leise Teil weiter fällt (≥ 4 dB in 0,25 s) oder bald endet (< 0,45 s); Bezug = lautester Teil der laufenden Note (`fall`, `fallT`) |
| 7 leicht, Tremolo-Zusatz | **teilweise** | Anschlag mitten im gehaltenen Ton (stimmhaft ±0,1 s, gleiche Höhe ±0,5 HT) erst ab 6 dB statt 3 dB (`rise2`); 9 dB probiert: kaum besser → 6 |
| 8 leicht, Auswahl ≤ 400 Hz | **behoben** | Bass-Band nach Ebene: nur Ebene Bass bzw. Original mit Auswahl oben ≤ 400 Hz bleiben SPK2 (`art` im Haken) |
| 9 leicht, Stichprobe | **behoben** | zwei Stichproben je Satz (legx Samen 987654321 und 13579; leg mit/ohne R), 44,1 kHz, Gleiten nur nach Tonhöhe bewertet (Prüfer-Maß SG) |

### Zahlen vorher → nachher (getrennt / Zusatz, Oktav-Fehler)
| Satz | vorher | nachher |
|---|---|---|
| SG Gleiten 0,6 / 0,8 / 1,0 / 1,4 / 2,0 s (Start+Ziel) | 88 / 75 / 50 / 75 / 75 % | **100 / 100 / 100 / 100 / 94 %** |
| SG Zusatz 0,45 / 0,6 / 1,0 / 1,4 / 2,0 s | 12,5 / 25 / 44 / 56 / 94 % | **0 / 0 / 0 / 12,5 / 25 %** |
| M8 Glissandi (2 Stichproben) | 87,5 / 87,5 % · 84,4 / 65,6 % | 100 / 43,8 % · 100 / 28,1 % |
| SZ Wechselnote 0,15 s · SS Lauf 0,15 s | 63,3 / 16,7 % · 83,3 / 10 % | **100 / 0 % · 100 / 0 %** |
| SM Melisma 0,08 / 0,10 / 0,12 / 0,14 / 0,17 / 0,20 s | 42 / 73 / 81 / 75 / 83 / 98 % | 46 / **96** / 81 / 85 / 96 / 100 % |
| M5 Melisma 0,09–0,14 s (2 Stichproben) | 63,2 % · 64,8 % | 75,5 % · 80,0 % |
| SD Pegelsprung −9 / −11 / −13 / −16 / +10 dB | 89 / 72 / 39 / 11 / 94 % | **100 / 100 / 100 / 100 / 100 %**, Zusatz 0 |
| ST Tremolo 0 / 10 / 20 / 30 % (Zusatz) | 25 / 25 / 150 / 375 % | 0 / 0 / 37,5 / 112,5 % |
| M7 gehaltene Töne (2 Stichproben, Zusatz) | 129 % · 112,5 % | 79 % · 29 % (Rest = Tremolo-Fälle) |
| Oktav-Fehler M1–M10 (Stichprobe 1 · 2) · M1 M2 M3 M7 M10 bei 44,1 kHz | 20 · 38 · 18 | **0 · 0 · 1** |
| M1 tief / M2 hoch / M3 kleine Schritte+Vibrato (Stichprobe 1) | 89,3/17,6 · 93,3/20,0 · 88,4/13,7 % | 89,9/11,9 · 97,3/9,3 · 93,7/10,5 % |
| dieselben, Stichprobe 2 | 89,1/20,5 · 90,3/13,8 · 85,2/18,2 % | 95,5/8,3 · 96,6/4,1 · **98,9/4,5 %** |
| dieselben, 44,1 kHz | 90,6/16,4 · 91,3/18,7 · 84,2/16,8 % | 91,8/6,9 · 95,3/8,7 · 95,8/6,3 % |
| M4 Pegel −14…+10 dB / M6 Konsonanten / M9 Anschleifen+Fall | 67,1 / 83,8 / 90,9 % | 93,7 / 92,6 / 95,5 % |
| MX Begleitung −12 dB / −6 dB im selben Layer | 86,4/47,7 · 56,3/60,4 % | 88,6/40,9 · 54,2/56,3 % (−6 dB: 1 Ton weniger von 48, s. Offen) |
| leg.mjs L / V / G / R / A / B (mit R) | 98,8/1,2 · 0 · 93,8/15,6 · 97,2/1,4 · 0/12,5 · 12/12 | **100/0 · 0 · 100/0 · 98,6/0 · 0/0 · 12/12** |
| leg.mjs ohne R (Stichprobe des Bauers) | L 98,8/1,2 · G 96,9/12,5 | L 100/0 · G 100/0 |
| Mehrstimmig (Gesang-Ebene, Schalter an): L / Befund 17 | 17,4 % / 147 % · 0/12 | **97,7 % / 4,7 % · 12/12** |
| Mehrstimmig ohne Schalter auf dem Original (poly9): Befund 17 · Legato+Vibrato · Lauf · Pad-Akkorde | 0/3 · 1/5 · 2/5 · 5/9 | **3/3 · 5/5 · 5/5** · 5/9 (unverändert SPK4, Anteil eine Stimme 0,00) |
| „Überall finden“ Gesang (finden9): 2. Phrase A3 D4 H3 | 0/3 (eine Note 59) | **3/3** |
| Befund 17, Auswahl 150–380 Hz (bassband) | eine Note 59 | **57 · 62 · 59** |
| Laufzeit legx 88 Fälle / leg 88 Fälle (Node) | 71,8 s / 23,9 s | 75,1 s / 25,9 s |

Probiert und nicht eingebaut: Vibrato-Weg mit Drift-Prüfung (Höhe läuft 0,1 s danach ≥ 0,45 HT weiter → kein Ton) gegen Gleiten mit Vibrato –
M8/M3 unverändert; Anschlag im gehaltenen Ton erst ab 9 dB – M7 nur 87,5 → 83,3 %. Prüfer-Ergebnis `pruef/mx-index.json` ließ sich mit dem
heutigen `legx.mjs` nicht nachstellen → alle Vorher-Werte frisch gemessen.

### Offen nach der Prüfung
1. Gleiten MIT Vibrato (~3 HT/s): das Vibrato macht aus dem Gleiten Stufen (Plateau je Halbwelle) → in Halbtönen zerhackt (M8 Zusatz 28–44 %,
   Beispiel 55 → 47 in 2,5 s mit ±30 ct = 8 Noten). Weg: Tonhöhen-Spur vor der Stufen-Suche über eine Vibrato-Periode glätten (gleitendes Mittel
   ~0,2 s) und nur für „läuft weiter?“ benutzen.
2. Sehr langsames Gleiten (1 HT/s über 2 HT): die Mitte (Median 0,6 s) folgt mit → eine Note (Zielton), Start fehlt (SG2 ±2, 2 von 8).
3. Tremolo ≥ 20 %: noch Zusatz-Noten (ST 37,5 / 112,5 %), Ursache nicht mehr die Anschlag-Regel allein.
4. Melisma < 0,1 s (SM 0,08 s 46 %): unter den 70/80-ms-Regeln, bewusst so (Vorgabe ab ~0,1 s).
5. Überschwingen ≥ 1 HT für ~0,1 s bleibt eine kurze eigene Note (M1/M9 Zusatz 8–14 %, die Höhe wurde gesungen).
6. Begleitung −6 dB im selben Layer (MX-6): Spur folgt oft dem Pad (Unter-Oktave), 54 % – Sache der Ebenen-Trennung, nicht der Stufen.
7. Mehrstimmig mit Akkorden UND Stimme: weiter die SPK4-Rechnung (Geister-Oktaven, frühe Einsätze); nur reine Ein-Stimm-Stellen gehen den
   einstimmigen Weg.
8. Vorschlag (sichtbar, daher nicht gebaut): Statuszeile nach „Noten finden“ im Modus Mehrstimmig mit erkannter einer Stimme:
   „… · mehrstimmig (eine Stimme erkannt)“ statt nur „· mehrstimmig“.
