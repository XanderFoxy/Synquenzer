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
