# SPK8 – unabhängige Prüfung (Noten auf der Bass-Ebene · Verfeinern Bass)

Geprüft: `index.html`. `python3 bau.py` aus `basis.html` + `spk8-block.js` ergibt die Datei bitgleich; `basis.html` ist bitgleich `basis6.html` (4.62.0). Nichts repariert.
Alle Läufe einzeln nacheinander auf einer bitgleichen Kopie (`pruef-spk8/p/index.html`), damit die Ergebnisdateien des Bauers nicht überschrieben werden.
Eigene Skripte und Ergebnisse liegen außerhalb von vx unter `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/pruef-spk8/`:
`pr-faelle.mjs` (Node, Kern wie im Worker: vs + spk1–5 + spk8), `pr-ui.mjs` (Touch 428×926 und 926×428), `pr-ki.mjs` (Profi-Ebene), `pr-fallback.mjs` (ohne Worker),
`render2.mjs` / `render3.mjs` (andere Basslinien mit dem App-Synth), Ergebnisse `faelle.jsonl`, `fotos-ui/`, `reg-*.out`.

## Kurz
- **Ziel 1 auf der Demo: bestätigt.** 0/32 → 29/32 (90,6 %), Präzision 0 → 0,806 (36 Noten). Node, Seite im Worker, Seite ohne Worker und Touch hochkant und quer liefern dasselbe.
- **Nichts wird schlechter.** Original + Bass-Band 14/32 (Noten bitgleich), Pads allein 24/28, „Überall finden“ fair 0,821/0,793, SDR Zerlegen 4,37: alles gleich.
  In 18 eigenen Fällen ist SPK8 nie schlechter als die Basis.
- **Ziel 2: nicht erreicht, nichts eingebaut – bestätigt.** Mittel 0,5: 4,37 → 4,37 (+0,00), geometrisch: 4,37 → 4,37 (+0,00).
- **Aber:** 70 %/70 % hält nur für die Demo-Basslinie. Andere Basslinien mit demselben Synth liegen bei 25–100 % Treffern und 22–67 % Präzision (Befund 1).

## Pflichtprüfungen (eigene Läufe)
- topdefs: Skripte 26, Namen 7347, doppelt 0, Syntaxfehler 0 · dupkeys: 0 · smoke: `errors []` (`pruef-spk8/smoke-pruef.png`)
- „MS 2000“ 1× (Basis 1×) · `^  live: true,` 1× · VERSION 4.62.0 unverändert (Kopf der Datei = Basis)
- Markenwörter: je Wort gleich wie die Basis (13 Wörter mit Treffern, keines gestiegen). In Block, bau.py, NOTES, LOG, spk8-seite.mjs und messb/: 0 Marken-, Datensatz- oder Produktnamen.

## Regression (einzeln, nacheinander)
| Lauf | Ergebnis | Bewertung |
|---|---|---|
| `spk4-test.mjs` gegen basis6 (371 s) | **18 OK / 5 FEHLER** (Bauer: 17/6) | alle 5 bekannt/erwartet: a1-gemisch und a3-unison gleiche Werte wie Basis (8/28, 0,96); a2-verfeinern-plus-1db −0,01; a3-nachbau-zeit nur „abstaendeGleich“ (Klang-Probe schwankt, lead 1,08 → 0,95; alle Zeiten ≤ 1,3×); reg-ki1 quer-428/quer-370 + vorbestehend besser-als-klassisch. reg-spk3 diesmal 15/17 (nachbau-abstaende-besser OK). vx1 61/61, spk2 28/30, spk4-ui 8/8. |
| `spk5-test.mjs` | **ALLES OK · 24** | – |
| `spk1-test.mjs` (mess/ neben der Datei) | **17 OK / 1 FEHLER** | verfeinern-verbessert-ziel 4,37 → 4,36, bekannt seit SPK4 |
| `messb/noten8.mjs` (SPK3-Wertung) | bass_ebene 29/32 · 0,806; orig_bassband 14/32 · 0,275; ueberall_fair 0,821/0,793; SDR 4,37 | = Bericht |
| `messb/x4.mjs` AVG (Ziel 2) | ohne 4,36 (−0,01) · AVG 0,5 4,37 (+0,00) · geometrisch 4,37 (+0,00) | = Bericht, richtig nicht eingebaut |
| Merge-Probe | SPK6-artige Änderungen (Haken nach SPK3, `const src`-Zeile) gegen SPK8 per `git merge-file`: **0 Konflikte** | Behauptung des Bauers stimmt |

## Eigene Fälle (Node, Wertung eins-zu-eins: Anschlag ±70 ms und gleicher Ton)
Basis → SPK8. Treffer/Wahr · Präzision (gefundene Noten). Zeit und Speicher: Noten finden, neu angelegte Typ-Felder.

| Fall | Basis | SPK8 | Zeit ms | MB |
|---|---|---|---|---|
| Demo (Auftrag) | 0/32 · 0 (69) | **29/32 · 0,81 (36)** | 943 → 1165 | 39 → 46 |
| Bass +6 dB | 0/32 · 0 (64) | 30/32 · 0,79 (38) | 1008 → 1146 | 39 → 46 |
| Bass −10 dB | 1/32 · 0,02 (63) | **16/32 · 0,50 (32)** | 973 → 1057 | 39 → 46 |
| nur Bass + Trommeln | 0/32 · 0 (33) | **19/32 · 0,66 (29)** | 1231 → 1076 | 39 → 46 |
| nur Bass + Synths (ohne Trommeln) | 3/32 · 0,05 (66) | 32/32 · 0,97 (33) | 1039 → 1120 | 39 → 46 |
| Raster falsch (120 statt 112) | 0/32 · 0 (62) | 24/32 · 0,73 (33) | 996 → 1020 | 39 → 46 |
| ohne Raster | 0/32 · 0 (62) | 24/32 · 0,73 (33) | 946 → 1015 | 39 → 46 |
| 48 kHz (wie Telefon-Dekodierung) | 0/32 · 0 (71) | 28/32 · 0,72 (39) | 1010 → 1067 | 43 → 49 |
| Zeit-Auswahl 2–6 s (nach Gesamtlauf) | innen 0/15 (18), außen 53 bleiben | innen 11/15 · 0,69 (16), außen 20 bleiben | 174 → 151 | 8 → 10 |
| Zerlegen nur in Auswahl 2–6 s (SPK5) | innen 0/15 (17) | innen 13/15 · 0,77 (17), außen 0 | 923 → 976 | – |
| **Laufender Bass** E1…A2, Achtel | 1/32 · 0,02 (67) | **8/32 · 0,22 (37)** | 995 → 1093 | 39 → 46 |
| **Oktav-Bass** A1/A2, G1/G2 | 0/32 · 0 (70) | 24/32 · 0,67 (36) | 966 → 1133 | 39 → 46 |
| **Liegende Noten** (je 4 Schläge) | 0/4 · 0 (51) | 4/4 · **0,24 (17)** | 939 → 1084 | 39 → 46 |
| **16tel** mit Oktavsprüngen | 0/64 · 0 (81) | 29/64 · 0,62 (47) | 941 → 1079 | 39 → 46 |
| **hohe Töne** bis E4 | 0/32 · 0 (70) | 13/32 · 0,45 (29), D4/E4 0/8 | – | – |
| Demo 3× (54 s) | 0/96 (187) | 80/96 · 0,78 (102) | 2563 → 2426 | 108 → 126 |
| Demo 10× (174 s) | 0/320 (619) | 264/320 · 0,74 (359) | 7489 → 7728 | 346 → 404 |
| ohne Bass (Kern-Zerlegen) | 66 Fehlnoten | 28 Fehlnoten | – | – |

Noten-Ansicht („Noten aller Ebenen“, SPK5): Demo 3639 → 3564 ms, 54 s 8904 → 8890 ms (gleich).
Zeitvergleich gepaart (Demo, 3× abwechselnd): Basis 1043/1017/1023 ms, SPK8 1146/1069/1087 ms (+5–10 %).

## Seite (eigene Läufe, Touch)
`pr-ui.mjs`: Datei laden → Zerlegen (Knopf + Klappfenster) → Bass-Ebene antippen → Noten ▾ → Noten finden → ↶ → ↷ → Noten-Ansicht.

| | 428×926 Basis → SPK8 | 926×428 Basis → SPK8 |
|---|---|---|
| Treffer · Präzision | 0/32 · 0 (69) → **29/32 · 0,806 (36)** | 0/32 · 0 (69) → **29/32 · 0,806 (36)** |
| Noten finden | 1015 → 937 ms | 997 → 1192 ms |
| Text | „36 Noten in Bass · einstimmig · Note antippen = zuordnen“ | gleich, quer abgeschnitten wie in der Basis |
| ↶ per Touch | 0 Noten, Ebenen 3 → 3 (nur Noten finden zurück) | gleich |
| ↷ per Touch | 36 Noten wieder da | gleich |
| Noten-Ansicht | 830 → 945 ms, Bass 36 Noten | 802 → 807 ms |
| Menü-Knöpfe | alle 44 px hoch, im Bild | gleich |
| Konsole | leer | leer |

- **Profi-Bass-Ebene** (Modell lokal, `pr-ki.mjs`): 0/32 · 0 (32 Noten, alle zu tief: m 21–35 statt 36–48) → **28/32 · 0,90 (31)**, 1152 → 1219 ms.
- **Ohne Worker** (Hauptfaden-Rückfall, `pr-fallback.mjs`): SPK8 29/32 (36), 1406 → 976 ms, Konsole leer. Der Haken in spk1DspMake greift auch dort.
- Fotos: `pruef-spk8/fotos-ui/spk8-428x926-noten.png`, `spk8-926x428-noten.png`, `ki-spk8-noten.png` (Basis-Fotos daneben).

## Befunde

### 1. [mittel] 70 %/70 % gilt nur für die Demo-Basslinie
Auf der Demo ist das Ziel erreicht. Mit demselben Bass-Synth, denselben Pads und Trommeln, aber anderen Noten (gerendert mit dem App-Synth, `render2.mjs`):

| Basslinie | Treffer | Präzision | Hauptfehler |
|---|---|---|---|
| Laufender Bass E1…A2 | 8/32 (25 %) | 0,22 | 8× eine Oktave zu tief (−12); H1, D2, G2, A2 je 0 Treffer, E2 1/4 |
| Oktav-Bass A1/A2 | 24/32 (75 %) | 0,67 | A1 nur 2/8 |
| Liegende Noten | 4/4 | 0,24 | 4 Noten zerfallen in 17 (Schnitte auf den Trommelschlägen); im Ausklang von F2 kippen Teilstücke auf F1 (−12) |
| 16tel mit Oktavsprüngen | 29/64 (45 %) | 0,62 | C3/D3-Sprünge 0/12, alles klebt an C2 |
| Bass −10 dB | 16/32 (50 %) | 0,50 | C4 der Pads als Bass-Note (m 60) |
| Bass + Trommeln ohne Pads | 19/32 (59 %) | 0,66 | G2/E2 als G#1 bzw. F#1 (52/46 Hz, Kick-Bereich) |

- Ohne Pads wird es schlechter (19/32) als mit Pads (29/32).
- Die Schwellen gS/gL und die Verfolgung sind an einem einzigen 4-Takt-Muster gemessen. Die Oktavfehler kommen aus der Verfolgung: Unter-Oktave des Synths und Kick-Rest unter 60 Hz, nicht aus den Schwellen. Der Bericht nennt als offenen Punkt nur die Schwellen.
- Gegenüber der Basis (0–3 %) ist es überall deutlich besser. Ein Rückschritt ist das also nicht, das Ergebnis trägt aber nicht allgemein.
- Vorschlag zum Messen: diese vier Linien als feste Prüffälle in bn8 aufnehmen, bevor weitere Schwellen gedreht werden.

### 2. [leicht] Bass-Töne über 290 Hz sind auf Bass-Ebenen nicht mehr findbar
- `track8` sucht fest 27–290 Hz. Der Bass-Bereich der App ist 28–400 Hz (`N2R.bass`), und die Auswahl (R.fa/R.fb) wirkt nur als Filter danach.
- Messung „hohe Töne“: D4 (294 Hz) und E4 (330 Hz) 0/8, höchste gefundene Note C4.
- Die Basis fand dort auch nichts. Bei hohen Bass-Läufen (Slap, Fills) fehlt der Weg aber jetzt ganz.

### 3. [leicht] „Sicherheit“ fast immer 100 %, auch bei Fehlnoten
- SPK8 setzt `sc = on` (meist 1), daher hat jede Note `conf` 1. Demo 36/36, Liegende 17/17, Demo 10× 349/359.
- Auch bei den Fehlnoten nach dem Bass-Ende (14,9 s, 15,0 s, G1 bei 8,57 s) und im Kern-Fall ohne Bass (19/28).
- In der Notenrolle heißt das volle Deckkraft und im Antipp-Blatt „sicher 100 %“. Der Leck-Wert cL + cR wird berechnet, aber nicht als Sicherheit weitergegeben.

### 4. [leicht] Kleine Auswahl auf langem Stück 1,6× langsamer
- Messung: 4-s-Auswahl in einem 174-s-Stück, Noten finden 332/355 → 548/561 ms. Das liegt über der 1,3×-Regel, absolut sind es +0,2 s.
- Ursache gemessen: Das Unterabtasten (`o8.dec`) filtert die ganze, auf Songlänge angelegte Ebenen-Spur. Mit dec 0 sind es 442 ms.
- Beim ganzen Stück ist es dagegen gleich (7489 → 7728 ms).

### 5. [leicht] Mehr Speicher beim Noten finden auf langen Stücken
- 174 s, Node, maxRSS-Zuwachs während Noten finden: Basis +125 MB, SPK8 +155 MB.
- Neu angelegte Felder 346 → 404 MB. Ursache: drei Spektren gleichzeitig, nämlich Ebene, Original und Kick-Vorlage mit je F × 894 Werten.
- Im Worker auf dem Telefon ist das +30 MB Spitze (+22 % gegenüber der Basis) bei 3-Minuten-Stücken.

### 6. [leicht] Zeitangabe im Bericht zu günstig
- Bericht: Node „1,13–1,38 → 0,98–1,19 s“, also schneller.
- Eigene gepaarte Läufe: 1,02–1,04 → 1,07–1,15 s, also +5–10 %. Seite: 997–1015 → 937–1192 ms.
- Innerhalb der 1,3×-Regel. Die Aussage „schneller“ ist nicht belegt.

### 7. [leicht, vorbestehend, durch SPK8 jetzt sichtbar] Meldung „Zerlegt: …“ verdeckt die gefundenen Bass-Noten
- Nach Zerlegen per Knopf bleibt die SPK5-Meldung über dem unteren Spektrum stehen, hochkant und quer.
- Die richtigen Bass-Noten liegen jetzt bei C2–C3, also genau unter der Meldung. Die falschen Noten der Basis lagen bei C4 und waren sichtbar.
- Fotos: `fotos-ui/spk8-428x926-noten.png`, `spk8-926x428-noten.png` gegen `basis-926x428-noten.png`.
- Wer „Noten finden“ tippt, sieht den Großteil der neuen Noten erst nach ✕. Das ist kein Code von SPK8, wirkt aber genau auf diesen Ablauf.

### 8. [leicht] Lücken im Seiten-Test des Bauers
- `spk8-seite.mjs` startet Zerlegen und die Ebenenwahl per API, nicht per Touch, und läuft nur hochkant.
- Die ↶-Prüfung liest kein Etikett (`letzter: null`) und prüft nicht, dass die Ebenen bleiben.
- In meinem Touch-Lauf ist das alles in Ordnung (s. o.). Die Lücke betrifft nur den Test.

## Hinweise (kein Befund)
- Ohne Bass im Stück liefert der Kern auf der leeren Bass-Ebene 28 Fehlnoten (Basis 66). Der Knopf „Zerlegen“ (SPK5) verwirft diese Ebene aber (`weg: bass`, Anteil 0,8 %), beim Nutzer kommt das nicht an.
- Zeit-Auswahl nach einem Gesamtlauf: Innen 11/15 statt 13/15 wie im Gesamtlauf, weil die Quantile nur über die Auswahl laufen. Außerhalb bleiben alle Noten.
- Statuszeile quer (926×428) abgeschnitten (sichtbar 190 von 290 px). Das ist in der Basis genauso.
- Klick/Knackser: SPK8 berührt keinen Ton-Weg. Die Klang-Probe in spk4-test schwankt zwischen Läufen wie vorher.
