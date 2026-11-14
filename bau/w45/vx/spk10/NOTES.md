# SPK10 – NOTES (Bass-Ebene · Oktave je Note)

Bau: `python3 bau.py` = `basis.html` (4.64.0, unverändert) + `spk10-block.js` direkt nach `/* SPK8-END */` + 2 Haken „SPK10“ im SPK8-Block
(je ein Ein-Zeilen-Eingriff, typeof-Schutz; SPK9-Stellen – spk1DspMake-Hakenzeile, `const src`-Zeile, SPK2 `segNotes`-Zeile – nicht berührt):
1. SPK8 `bassNoten`: neue Zeile direkt nach der Sicherheits-Zeile des Leck-Schutzes (`if (o8.cf && o8.gS) found.forEach(…)`), vor „Liegende Töne“:
   `if (typeof spk10Okt === 'function') spk10Okt(Z2, d, found2, {R, hopS});` (Nachbesserung: vorher direkt nach `const found = …` auf allen Roh-Noten)
2. SPK8 `spk8WUrl`: Blob-Teil `';' + spk8DspMake.toString() + ';'` + `(typeof spk10Okt === 'function' ? spk10Okt.toString() + ';' : '')`
   → `spk10Okt` ist im Spektral-Worker vorhanden; Hauptfaden-Rückfall hat die globale Funktion.
VERSION/CHANGES unberührt. Schalter `Z2.o10` (wird bei jedem Aufruf über die Grundwerte gelegt; `an: 0` = genau SPK8).

## Was gebaut ist – `spk10Okt(Z2, d, found2, c)` (nur Bass-Ebene, nur über SPK8) – Stand nach der Nachbesserung
- Nur behaltene Noten (nach dem Leck-Schutz) und nur Töne **unter C2** (`f < 63,5 Hz`, `o10.fK`; Kick-/Unter-Oktaven-Bereich).
  Töne ab C2 bleiben unberührt (z. B. richtige G2, deren Oktave G3 ein Pad trägt – Prüfung Befund 1).
- Je solche Note Rahmen alle 25 ms von a + 50 ms bis b − 40 ms (mind. einer), Betragsspektrum des **Originals** (nichts abgezogen) mit
  **kurzem Fenster N 4096** (≈ 93 ms) über das SPK3-Unterabtasten (`Z2.magsLo`, R 4), Leistung.
- Merkmal r = 10·log10((P(3f) + P(5f)) / (P(2f) + P(4f))), Spitze ±1 Bin, über die Note summiert (Grundton-Bereich bewusst nicht benutzt).
- r < **−15 dB** → f ist die Unter-Oktave einer Note um 2f. Ton neu: **Halbton-Kandidaten im MIDI-Raster** m(2f) − 1 … + 1, Kamm 1–6
  (Gewicht 0,86^h) auf dem **zwischen den Bins linear gelesenen Betrag** (kein ±1-Bin-Maximum mehr, das Nachbarn gleich macht),
  Gleichstand → der Kandidat näher an 2f. `m`, `f`, `fz` umgerechnet.
- Sicherheit der umgestellten Note: `min(conf, 0,5 + 0,5 · min(1, (−15 − r) / 8))` → knapp unter der Schwelle 0,5, ab r ≤ −23 dB 1.
- Kein Kick-Abzug mehr im Code (war `kick: 0`, gleiche Noten), kein Feld `q.o10` mehr.

## Messung (`messb/faelle8.mjs` = Kopie aus spk8/messb, ergänzt um `spk10Okt`, `B10=` Block-Datei, `P10=` Schalter-JSON, `D10=1` Merkmal je Note)
WICHTIG: Die Kopie in `spk10/messb/` benutzen – `spk8/messb/faelle8.mjs` holt nur `spk8DspMake` aus der Datei und misst daher den SPK8-Stand.

Merkmal r je gefundener Note (vor dem Leck-Schutz), Wahrheit = Abstand zum nächsten richtigen Ton:
| Fall | richtige Noten r (tiefster Wert) | Oktav-zu-tief r |
|---|---|---|
| ohne Pads (bassdrums) | −11,3 … | −20,6 / −22,6 / −22,9 / −23,0 (3× davon 32 statt 43 → Ton um 2f nötig) |
| Demo / mit Pads | −16,2 (G2: Pad G3 = 2·G2 hebt die geraden Obertöne) | – |
| Lauf (walk) | −6,8 … | −12 … +1 (Nachbarton-Obertöne: 5·G1 ≈ 3·E2, Snare auf 3f/5f; Notengrenzen 80 ms daneben) |
| okt / basspads / ohneraster / laut | −14 … −16,6 | – |
Schwelle −19 dB liegt zwischen −16,6 (richtig, alle Fälle) und −20,6 (falsch); Rand 2,4 / 1,6 dB.

| Fall | vorher (4.64) | nachher (SPK10) |
|---|---|---|
| bassdrums (ohne Pads) | 19/32 · 0,655 (29) | 22/32 · 0,759 (29) → Nachbesserung **23/32 · 0,793 (29)** |
| demo | 29/32 · 0,806 (36) | 29/32 · 0,806 (36) |
| walk | 8/32 · 0,216 (37) | 8/32 · 0,216 (37) |
| sech | 29/64 · 0,617 (47) | 29/64 · 0,617 (47) |
| okt 24/32 · 0,686 · lang 4/4 · 0,333 · leise 16/32 · 0,50 · hoch 13/32 · 0,448 · laut 30/32 · 0,789 · basspads 32/32 · 0,97 · ohneraster 24/32 · 0,727 · sr48 28/32 · 0,718 · ohnebass 0 (28) | – | alle gleich (`reg/faelle8.out`) |

`faelle8 SOLL=1` (13 Fälle): 13 OK / 0 FEHLER; Untergrenze bassdrums in `messb/faelle8-soll.json` (Kopie) auf 22 · 0,739 gehoben (Nachbesserung: 23 · 0,773 + 11 Prüfer-Mischungen).
Hinweis: Merkmal-Tabelle und Schwelle −19 oben = erste Fassung; Stand nach der Prüfung s. Abschnitt „Prüfung“.
Zeit „Noten finden“ Bass-Ebene gepaart (o10.an 0/1, Last ~4,8): demo 1489/1369, 1411/1322, 1284/1252 ms; walk 1657/1408, 1328/1307,
1080/1085 ms → ≈ 1,0× (zusätzlich nur wenige kurze FFTs 4096→1024 je Note; Kick-Vorlage für N 4096 bewusst aus).

## Verworfen (gemessen, nicht eingebaut)
- Schwelle −15 dB: demo 29 → 28, okt 24 → 23 (richtige G2 mit Pad G3 kippen).
- `nd` Merkmal auf Original ohne Trommel-Ebene (Render aller anderen Ebenen + Rest): Lauf-Oktavfehler weiter −12 … +2 dB, demo 29 → 28,
  basspads 32 → 31, Zeit +40 % → verworfen.
- `rp` Ton jeder Note ±2 Halbtöne im kurzen Fenster neu (gegen den Halbton-Verschmier der Verfolgung N 16384): Kamm 2–6: walk 8 → 7,
  demo 29 → 26, okt 24 → 13; Kamm 1–6: walk 2, demo 20 → verworfen (93 ms Fenster: 10,8 Hz Bins, ein Halbton bei 65 Hz = 3,9 Hz;
  Pad-Teiltöne und Unter-Oktave ziehen).

## Ziel – NICHT erreicht (ehrlich)
Ziel Lauf ≥ 20/32 und 16tel ≥ 45/64 und ohne Pads ≥ 24/32: erreicht nur ohne Pads 22/32 (+3, Präzision +0,10); nach der Nachbesserung 23/32 · 0,793 (+4), Ziel ≥ 24 weiter offen. Ursachen gemessen:
- Lauf: nur ~9 der 24 Fehler sind Oktavfehler; der Rest sind Halbton-Verschmierung (Fenster 370 ms über zwei 268-ms-Noten: 32 statt 33,
  36 statt 38) und Notengrenzen 80–150 ms daneben. Das Oktav-Merkmal ist mit Pads und Nachbartönen nicht trennscharf (s. Tabelle).
- 16tel: 21 Noten fehlen ganz – die Verfolgung (N 16384) bleibt bei C2, kurze C3/G2/E2-Einwürfe (96 ms) erscheinen gar nicht als
  eigene Tonhöhe; D2 wird C2/C#2. Eine Oktav-Entscheidung je Note kann fehlende Noten nicht erzeugen.
Weg (nächster Auftrag, erst messen): zweite Stufe nach den Anschlägen – je Anschlag-Abschnitt (O.ons, auch ohne 3-dB-Anstieg) Tonhöhe aus
einem Fenster, das genau den Abschnitt deckt (Zero-Padding auf 16384 für feines Raster), Kandidaten nur aus den Pad-freien Teiltönen:
Pad-Ebene (SPK4 polyNoten) als Vorlage abziehen statt Trommel-Ebene; Oktave über die ungeraden Obertöne erst danach.
Kick-Rest je Schlag (kleinste Quadrate) bringt für die Oktave nichts mehr, seit das Merkmal den Grundton-Bereich nicht benutzt
(Kick-Abzug an/aus gab gleiche Noten).

## Pflicht / Regression (Endstand, einzeln nacheinander, `reg.sh` → `reg/*.out`)
- Pflicht: topdefs Skripte 26 / doppelt 0 / Syntaxfehler 0 · dupkeys 0 · smoke `errors []` (`smoke.png`) · „MS 2000“ 1× · „  live: true,“ 1× ·
  VERSION 4.64.0 unverändert · eingefügter Text ohne Marken-/Datensatz-/Produktnamen (Markenwörter je Wort = Basis).
- faelle8 (Kopie spk10/messb) 13/13 · spk8-seite 14/14 (Worker, hochkant + quer, Demo 29/32 · 0,806, ↶/↷, Konsole []) ·
  spk5-test ALLES OK 24 · spk5-fade-test ALLES OK · spk1-test 17 OK / 1 FEHLER verfeinern-verbessert-ziel 4,37 → 4,36 (bekannt seit SPK4).
- spk4-test (gegen basis5): 19 OK / 4 FEHLER: pflicht/Version, a2-verfeinern-plus-1db, reg-ki1 (alle erwartet) und a3-nachbau-zeit
  (Last: FM-Abstand im 2. Klang-Probe-Lauf vorher und nachher 0 statt 2,06). Gegenprobe Klang-Probe allein basis 4.64 → SPK10: alle Abstände und
  Texte gleich (va2 3,89 · fm 2,06 · pad 0,96 · lead 0,95), Zeiten im Rauschen – der Nachbau-Weg ist von SPK10 nicht berührt.
- Worker-Probe `messb/worker10.mjs`: `spk10Okt` im Worker-Text und im Worker als Funktion vorhanden, Seitenfehler [].
- Misch-Lage: Block nach SPK8-END (SPK9 liegt nach SPK7-END), Haken nur im SPK8-Block; keine SPK9-Stelle (spk1DspMake-Haken, `const src`,
  SPK2 segNotes) berührt.

## Prüfung (Nachbesserung nach PRUEFUNG.md, 22:05–22:4x)
Werkzeuge (alle im Paket): `messb/faelle8p.mjs` (Prüfer-Fassung: `FALL=name@Bass,Pad1,Pad2,Trommeln`, Fälle mit „;“ getrennt; 5. Listenfeld =
nächste Wahrheit; `SOLL=1` auch je Mischung), Prüfer-Linien in `messb/faelle/` (adur, chrom, chromab, chromdunkel, dunkel120, dunkel200, fdemo,
gdemo, hell, sinus), `messb/faelle-alle.txt` (54 Prüfer-Läufe + 13 Prüf-Satz = 67), `messb/cmp10.mjs` (Vergleich an/aus je Note:
falsch→richtig, richtig→falsch, neue Tonklassen-Fehler), Debug-Lauf `messb/nb/spk10-dbg.js` + Auswertung `messb/nb/eval.mjs` (alle Varianten
aus EINEM Lauf), Basis `messb/nb/basis.jsonl` (an 0), Ergebnis `messb/nb/v2.jsonl`.

Gesamtbild 67 Läufe (an 0 → an 1):
| Stand | Treffer | falsch→richtig | richtig→falsch | anders falsch | neue Tonklassen-Fehler | Läufe mit Änderung |
|---|---|---|---|---|---|---|
| SPK10 vorher (thr −19, Viertelton ±1,5, ±1-Bin-Max) | 1164 → 1174 (+10) | 13 | **3** | 8 | **6** | – |
| SPK10 nachher (unter C2, thr −15, Halbton ±1, Betrag zwischen Bins) | 1168 → **1207 (+39)** | **39** | **0** | 5 | **0** | 17 / 67 |
(„vorher“ aus der Offline-Auswertung desselben Debug-Laufs, „nachher“ echter Lauf `nb/v2.jsonl`; die 1164/1168 unterscheiden sich nur in der
Zählweise der Auswahl-Fälle.)

Je Befund:
1. [schwer] Richtige G2 → G3 – **behoben.** Nachgestellt: `demo@1,0,1,0` 32 → 31 (1,38 s 43 → 55), `gdemo@1,1.4,1.4,0` 17 → 16, `gdemo@1,1.6,1.6,1`
   8 → 7. Ursache bestätigt: r richtiger G2 bis −20,3 dB, wenn ein Pad G3 trägt. Lösung: nur Töne unter C2 (f < 63,5 Hz) prüfen – dort liegen
   alle Unter-Oktaven/Kick-Reste der Prüfer- und Prüf-Fälle (Wahrheit G2 = 98 Hz → verfolgt 49–52 Hz). Die tiefsten r richtiger Noten unter
   C2 über die 54 Prüfer-Läufe: −10,2 dB (97 Noten) → Abstand zur Schwelle −15: 4,8 dB. Jetzt: `demo@1,0,1,0` 32/32 · 0,97, `gdemo@1,1.4,1.4,0`
   17/32, `gdemo@1,1.6,1.6,1` 8/32 = 4.64. Gemessen verworfen: Grenze 70 Hz (C♯2 noch drin) kippt `sech@1,0,0,1` 4,47 s richtiges C2 (f 65,15) → C3;
   Grenze 65 Hz hängt an der Verfolgungs-Streuung innerhalb von C2 (64,22 Hz falsch / 65,15 Hz richtig) → 63,5 Hz = Mitte B1–C2.
2. [mittel] Gewinn nur Rundungsglück am Fensterrand – **behoben.** Ursache bestätigt (±1-Bin-Maximum macht Viertelton-Nachbarn gleich, `s > bs`
   nimmt den tiefsten). Lösung: Kandidaten genau auf dem MIDI-Raster (m(2f) − 1 … + 1, kein Runden mehr), Betrag linear zwischen den Bins
   (verglichen: ±1-Bin-Max auf Halbtönen +36, linear kurz +39, Fenster 8192 bzw. 16384 je +39 … +41 mit Zusatz-FFT → kurz genügt),
   Gleichstand → näher an 2f. Jetzt Gewinne auch außerhalb von G2: `gdemo@1,0,0,1` 17 → 20 (30/31 → 43 = G2 der G-Linie), `fdemo@1,0,0,1`
   24 → 25 (29 → 41), `chrom` / `chrom@1,0,0,1` / `chrom@1,2,2,1` / `chromdunkel` je +1 (34 → 45), `chromab@1,0,0,1` +1 (25 → 37), `okt@1,0,0,1`
   22 → 26 (auch 32 → 45). Linien ohne Unter-C2-Fehler (adur, walk, hoch, lang, sech) bleiben gleich. Ziel-Fälle: Lauf 8/32 · 0,216 und 16tel
   29/64 · 0,617 unverändert, ohne Pads **23/32 · 0,793** (vorher 22 · 0,759; Ziel ≥ 24 weiter nicht erreicht – die übrigen 9 Fehler sind keine
   Unter-C2-Oktaven).
3. [mittel] Oktavfehler → Tonklassen-Fehler – **behoben.** Nachgestellt (alle 6 + bassdrums 5,68 s). Jetzt: `demo@1,1,0,1` 5,62/7,77 s → 43 ✓
   (26 → 28), `demo@1,1.6,0,1` → 43 ✓ (27 → 29), `dunkel200@1,0,0,1` 5,62 s → 43 ✓ (13 → 17), `demo@1,0,0,2` 1,34/7,77 s → 43 ✓ (10 → 16),
   bassdrums 5,68 s → 43 ✓. Neue Tonklassen-Fehler über 67 Läufe: 0. Rest „falsch → anders falsch“ (5): `chrom` 0,01 s 27 → 38 (w 28),
   `chromdunkel` 1,34 s 24 → 36 (w 33), `dunkel120@1,0,0,1` 1,88 s 33 → 44 (w 43), dazu zwei Noten ohne Wahrheit in der Nähe
   (`dunkel200@1,0,0,1` 8,42 s, `walk@1,0,0,1` 3,84 s) – alle vorher schon falsch, keine davon vorher nur in der Oktave falsch.
4. [leicht] Seite übt SPK10 nicht – **behoben (Test ergänzt).** Neu `spk10-seite.mjs` (aus dem Prüfer-Lauf `seite-p.mjs`): Bass + Trommeln als WAV
   (`SPUREN=spur0,spur4`), Touch, Worker, 428×926 und 926×428, zusätzliche Prüfung „spk10-soll“ Treffer ≥ 26. Ergebnis: **27/32 · 0,90** (30 Noten) hochkant und quer, 16/16 OK
   (Prüfer-Lauf mit demselben Aufbau: 4.64 23/32 · 0,767, SPK10 erste Fassung 24/32 · 0,800) – der Test fällt ohne SPK10 durch.
5. [leicht] Soll nur in der Kopie / Prüfer-Fälle fehlen – **behoben im Paket**: `messb/faelle8-soll.json` bassdrums 23 · 0,773 (max 32) und
   11 Prüfer-Mischungen (Befund 1: `demo@1,0,1,0`, `gdemo@1,1.4,1.4,0`, `gdemo@1,1.6,1.6,1`; Befund 3: `demo@1,1,0,1`, `demo@1,1.6,0,1`,
   `demo@1,0,0,2`, `dunkel200@1,0,0,1`; Gewinne: `okt@1,0,0,1`, `dunkel120@1,0,0,1`, `gdemo@1,0,0,1`, `chrom@1,0,0,1`), Aufruf über `faelle8p.mjs`
   (`reg2.sh`). **Für das Mischen:** `spk8/messb/faelle8.mjs` lädt `spk10Okt` nicht – nach dem Mischen `spk10/messb/faelle8.mjs` bzw.
   `faelle8p.mjs` samt `faelle8-soll.json` übernehmen (spk8-Ordner bewusst nicht angefasst).
6. [leicht] Kommentar / Sicherheit / `q.o10` – **behoben.** Kopf-Kommentar sagt jetzt „Original (nichts abgezogen)“, Kick-Code entfernt;
   Sicherheit umgestellter Noten `0,5 + 0,5 · min(1, (−15 − r)/8)` (bassdrums: Sicherheit richtig 0,97 / falsch 0,75); Feld `q.o10` entfernt.
7. [leicht] Läuft vor dem Leck-Schutz – **behoben.** Haken nach dem Leck-Schutz (nur `found2`), zusätzlich nur Noten unter C2: Demo 67 → 1 Note,
   Lauf 24, bassdrums 6 (Median 4, höchstens 31 je Lauf). Zeit „Noten finden“ Summe über 67 Läufe 78,6 s → 77,8 s (Rauschen, ≈ 1,0×),
   Speicher +0,0 … 0,1 MB.

Misch-Probe: `git merge-file` SPK9 (basis7 → spk9) auf das neue SPK10: 0 Konflikte (`merge/spk10+spk9.html`).
