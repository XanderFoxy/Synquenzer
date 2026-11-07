# NS1 – North-Klang geprüft (Drum-Synthese)

## 1. Für Xander
- **„Manchmal gar nichts“ – gefunden und behoben:** Wurde der Song neu gestartet, während er lief (Song ab einem Takt antippen, Abspielen ab Stelle, Szene neu starten), verschluckte North den **ersten Schlag nach dem Neustart** – meist genau die Kick auf der Eins. Jetzt klingt jeder Schlag. Ausprobieren: Song läuft → einen anderen Takt antippen → die Kick auf der Eins ist sofort da.
- **„Manchmal hart“ – gezähmt:** Die Wellen **H1–H6** waren bei kleinem SPECTRA bis zu 16 dB lauter als alle anderen Wellen (Kick auf H2 gedreht = harte, übersteuerte Bassdrum). Jetzt bleiben sie im Rahmen der anderen Wellen. Alle 45 Werksklänge und die 4 Kits klingen **bitgleich** wie vorher.
- Die Zeile unter SPECTRA zeigte bei H-Wellen eine falsche Formant-Frequenz – stimmt jetzt mit dem Klang überein.
- **Tipp zum iPhone-Lautsprecher:** Eine Sinus-Kick (Welle A1) um 50 Hz kann der Handy-Lautsprecher kaum abspielen. Ohne BEND und CLICK ist sie dort fast stumm (mit Kopfhörer kräftig). Für das Handy: BEND +20…+30 und CLICK 15–25 lassen, oder eine Welle mit Obertönen (A4, t1, F1). DECAY 12–18 ist für eine Kick sehr kurz (26–67 ms); 25–30 ist eine normale Kick.

## 2. Technische Liste (nur `sq-md-src`-Worklet + eine Editor-Zeile; Kürzel NS1)
- **Worklet `synq-md`, Nachricht `stop`** (Ursache „nichts“): Bisher filterte `process()` im Stopp-Block *alle* Schläge ab `stopFr` aus der Warteschlange – auch die, die **nach** der Stopp-Nachricht kamen (■ und ▶ in derselben Aufgabe: `songPlayStart`, `chsPlayFrom`, `launchScene` nach `stop()`, `applyProject`). Jetzt:
  - `case 'stop'` verwirft die geplanten Schläge ab `stopFr` **sofort bei der Nachricht** und zählt `this.stopGen = ++this.gen`.
  - jeder Schlag trägt `rec.gen` (Warteschlangen-Einträge `+gen: 0`, vorab angelegt, keine Allokation), jede Stimme `v.gen` (`nv.gen = h.gen`).
  - der Filter im Stopp-Block behält Schläge mit `gen >= stopGen`; das Ausklingen (`stpK`) gilt nur für Stimmen mit `gen < stopGen` → ein Schlag nach dem Neustart wird weder verworfen noch gedämpft. Alte Stimmen klingen wie bisher mit τ aus.
  - Gilt für Drum-Spur und Perkussionsspur (gleicher Prozessor).
- **Worklet, H-Familie** (Ursache „hart“): `const H_GCAP2 = 4`; nach dem Anlegen der Teiltöne in `initTone` (FAM_H) Energie `Σ|z|²` der angelegten Teiltöne (= Formant-Gewinn² gegen die reine Neigung); über +6 dB wird auf +6 dB skaliert. Darunter bitgleich. Werksprogramme liegen bei höchstens +5,6 dB (Kristall 5,52, Stahltrommel 4,95; über alle Tonhöhen 0–127,5 geprüft).
- **Editor-Zeile SPECTRA (MD_CELL.mSpc.sub, H-Familie):** Formant `f0·2^(5·S/99)` statt `8·S/99` – dieselbe Formel wie die Engine (`H_FC = 5`). Nur Anzeige.
- Keine Datenfelder, kein Format, kein CSS, keine neuen Funktionen/Test-API. Worklet-Quelle bleibt ASCII (geprüft: 0 Nicht-ASCII-Zeichen). Größe +1 282 B.

## 3. Tests + Ergebnis
Messwerkzeuge in `work/` (Node-Nachbau des Worklets aus der HTML: `shim.mjs`; `golden.mjs`, `t-progs.mjs`, `t-grid.mjs`, `t-waves.mjs`, `t-dec.mjs`, `fuzz.mjs`, `t-stop.mjs`, `e2e-probe.mjs`, `synth-check.mjs`, `cpu-chromium.mjs`). Ein Prüflauf: `node ns1-test.mjs index.html ../basis.html` → **10/10 OK**.

| Prüfung | vorher (4.42.0) | nachher |
|---|---|---|
| Golden Node: 45 Programme × (v 1 · v 0,5 · v 0,8+Akzent) + 5 Neuanschlag/Lock-Fälle + 4 Kit-Grooves = 144 Renders | – | **144/144 bitgleich** |
| Golden Chromium (MDX.render, NEU gegen BASIS): 45 Programme (2 Schläge, Tune/Decay-Lock) + 4 Kits | – | **bitgleich** |
| Live Chromium: Kicks über den Transport (2–4 Takte) | 17/17 hörbar (−7,4 dBFS) | 17/17 |
| Live: ■ und sofort ▶ (5 Zyklen, 20 Kicks) | **15/20** – jeder erste Kick nach dem Neustart fehlte (−63…−66 dBFS) | **20/20** |
| Node: Stopp + neuer Schlag im selben Block | neuer Schlag verworfen | klingt (−6,6 dB, allein −6,0); alte Stimme klingt aus wie vorher |
| Wellen bei INIT (Spitze dBFS) H1/H2/H5/H6 | +3,9 / +4,7 / +4,3 / +3,9 | −6,7 / −6,8 / −6,4 / −6,7 (A1 −12,6, A4 −11,3, d6 −3,6) |
| Kick „FM-Druck“ → Welle H2 / „Brücke“ → H2 | +8,7 / +10,3 dBFS | unter 0 dBFS (nicht mehr gemeldet) |
| Raster 5 Kick-Programme × WAVE (34): Spitze > 0 dBFS | 29 Fälle (bis +10,3) | 9 Fälle (d2/d5/d6 +1…+4, H +0,6…+1,1; Rest der normalen Modell-Unterschiede) |
| Raster Hauptregler (SPECTRA, FREQ, DYN, DECAY, MODE, BEND, TIME, PITCH, Pegel, PAN, EQ, DIST, Kurve) | stumm nur bei CH LEVEL ≤ 10 / TONE LVL ≤ 10 (Pegelkurve (x/50)², gewollt) | unverändert |
| Fuzz 1 500 Zufallsprogramme: NaN / stumm bei sinnvollen Pegeln | 0 / 0 (3 Grenzfälle mit kleinem Pegel + starker Dist) | 0 / 0 |
| ND1-Abnahme (Node, 48 kHz) | 195/195 | 195/195 (einzige Abweichung: Zufallsflug-Spitze 11,0 → 10,7 dBFS) |
| ND1-Nachprüfung `md1-retest` | 40/40 | 40/40 |
| SPECTRA-Zeile H1, SPECTRA 20, Kick 49 Hz | „Formant 150 Hz“ (Klang: 99 Hz) | „Formant 99 Hz“ |
| Erster Tipp, bevor das Modul geladen ist | klingt | klingt |
| CPU Chromium offline: eine Stimme / Kit „Schräg“ 12 Kanäle 16tel | 0,7–1,1 % / 3,6 % | 0,65–0,97 % / 4,05 % (Messrauschen, kein Unterschied im Code-Pfad) |
| Synth-Engines (VA, FM, WT; je 6 Werksklänge, offline, Note an/aus) | NaN 0, kein Sprung am Notenstart (≤ −27 dB der Spitze), Loslassen ohne Knack (Sprung ≤ +1,8 dB über dem Dauerton), Nachklang → 0 | nicht geändert |
| Pflicht: topdefs | 0 Syntaxfehler, 0 doppelt | 0 Syntaxfehler, 0 doppelt |
| Pflicht: smoke.mjs | – | errors [] (`smoke.png`) |
| Pflicht: Markenwörter / „MS 2000“ / `  live: true,` | – | 0 / 1 / 1 |

Fotos: `ns1-hoch-editor.png` (428×926, Kick auf H1, Zeile „Formant 99 Hz“, ✕ sichtbar), `ns1-quer-platte.png` (926×428, Platte, ✕ sichtbar), `smoke.png`.

Was ich *nicht* als Fehler gefunden habe: Abklingformen, Dynamic Decay, BEND/TIME, Dyn-Filter, Noise-Filter, Click-Tabellen, Mono-Gruppe, Neuanschlag (2 Stimmplätze, Flam 2 ms), Locks, Pegel-/Akzentwege, Pad-Tipp (Anschlag 0,35–1), Platte-Gesten während des Laufs (Welle, Decay, Pitch, Bend wechseln: jeder Kick klingt). NaN-/Denormal-Schutz im North-Worklet ist vorhanden (Moden-Abbau < 1e-7, Filter/Echo/EQ/DC-Sperre mit Untergrenzen, Hall-Dither, NaN-Wache je Kanal und Ausgang).

## 4. Offen / Risiken
- **Eigene Klänge mit H-Welle und kleinem SPECTRA** (etwa unter 45, je nach FREQ) werden leiser (bis −11 dB) – das ist genau die Korrektur der übersteuerten Fälle. Werksklänge und Kits sind bitgleich. Wer so einen Klang absichtlich laut hatte: CH LEVEL / TONE LVL hochziehen.
- **Panik / ■■ und sofort ▶** (innerhalb von 10 ms): ein Schlag in dieser Rampe wird noch mit ausgeblendet. Nicht von Hand erreichbar, nicht geändert.
- **Perkussionsspur:** Noten außerhalb C4–H4 verschieben die Kanal-Tonhöhe um ±12 HT je Oktave. Eine Kick auf C2 (MIDI 36, üblicher Drum-Standard) liegt dann bei 12 Hz = unhörbar. So gebaut (PERC); **Frage an Xander:** Soll die Verschiebung für KICK (oder für alle Kanäle) nach unten begrenzt werden, z. B. nie unter 30 Hz?
- **Handy-Lautsprecher:** Sinus-Kicks unter ~80 Hz sind auf dem iPhone-Lautsprecher physikalisch kaum hörbar (gemessen: ohne BEND/CLICK −28 dB Anteil über 150 Hz, mit BEND +28 −19 dB, Snare −12 dB). **Vorschlag (nicht gebaut, würde den Klang ändern):** ein „Handy-Bass“ im Master, der nur bei Lautsprecher-Wiedergabe Obertöne der Bassdrum ergänzt (wie es Telefone/Laptops mit Bass-Verstärkern machen). Nur auf Wunsch.
- Synth-Engines: Werksklang „Tropfen-Ping“ (VA) erreicht offline +4,9 dBFS am Spur-Eingang (übrige VA/FM/WT −5…−23 dBFS). Kein Knack, kein NaN; der Master-Limiter fängt es. Nicht geändert (Werksklang, Regel 28) – zur Pegel-Angleichung der Werksklänge vormerken. MS 2000 und Bit Mask hier nicht erneut geprüft (eigene Prüfreihen MK*/BM*).
- Golden- und Rasterläufe im Node-Nachbau; Live-Prüfung in Chromium headless. Gerätetest iPhone steht aus (Ausprobieren wie oben unter 1.).
