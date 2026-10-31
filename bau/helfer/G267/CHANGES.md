# CHANGES – Helfer G267 (Nachtrag 5: G1-Prüfung, G2, G6, G7)

Grundlage: Kopie `bau/vs/n5-br-G/index.html` (App 4.23.0 + G1, Versionszeile 4.25.0 unverändert). Basis für den 3-Wege-Merge:
`bau/werkzeug/vs-base-B.html`. Format bleibt 5 (nur additive Felder). Kein Supabase-Aufruf.

## G1 – unabhängige Prüfung (kein Code geändert)

G1 war gebaut, aber nicht unabhängig geprüft. Prüfung durch einen getrennten Prüf-Lauf (eigene Skripte, andere Werte als der
Bauende: 97 BPM, 1/16, ungerade Abstände, echte Touch-Tipps, Undo-Kette über 6 Schritte, Legato-Schnitte). Bericht:
`tests/g1/G1-REPORT.md`.

| ID | Ergebnis | Messung |
|---|---|---|
| G1-01 | ✓ | 97 BPM/1/16, Touch-Tipp, Dehnen 100 %: gehörte Einsätze max **3,5 ms** neben dem Raster (12/12); 50 %: halber Abstand max 2,0 ms; Scheiben 50 % 2,0 ms. Gegenprobe 4.23.0: 18,3 ms. Skript des Bauenden (120 BPM, 1/8): 3,4 / 1,8 ms, Song 3,4 ms, „Audio folgt“ 3,0 ms |
| G1-02 | ✓ | Pixel: 12/12 Marken auf der Linie (max 0,50 px; 4.23.0: 3/12); Animation 173–231 ms (≤ 250); Meldung „12 Einsätze gerückt“ = Zahl der Karte; Matrix-Zelle/Song = gehörte Fassung; 844×390 und 320×568 nichts abgeschnitten |
| G1-03 | ✓ | ↶ über 6 Schritte: Marken + Karte deep-equal, Klang hash-gleich; ganz zurück bitgleich zum Roh-Take (237 526 Samples); ↷ ×6 deep-equal. Legato-Schnitte: M-KLICK 31,6 / 23,1 dB gegen Original 30,7 dB |
| Smoke | ✓ | keine Fehler, Zeichnen 1,4 ms/Bild, Tipp Median 7,4 ms |

Abweichungen: keine. **Kein Fix nötig.**

### Fragen an Xander (G1)
1. Die Meldung „n Einsätze gerückt“ zählt auch Marken, die nur 1–2 ms rücken (auf dem Raster gesungen). Soll erst ab z. B. 3 ms gezählt werden?
2. Bei offenem Marken-Editor im Hochformat (390×844) verdeckt das Blatt den ↶-Knopf (schon vor G1 so). Soll der Editor ein eigenes ↶ bekommen?

### Für das Zusammenführen (G1)
Nichts – G1-Code unverändert. Tests: `tests/g1/` (Pfade auf `bau/helfer/G267/index.html`; `tests/node_modules` = Link auf Playwright, nicht im Repo).

## G2 – Tonhöhe quantisieren + Gesang als Noten bearbeiten

### Was neu ist
1. **Takes-Blatt → [♪ Tonhöhe · Noten]** (unter [✎ Marken · Quantisieren]; quer nebeneinander, das Blatt passt weiter ohne Scrollen)
   öffnet den **Noten-Editor des Takes** im Blatt des Marken-Editors: die erkannten Noten (VS2-Segmente) als **Blöcke über der
   Wellenform**, dahinter dünn die gemessene Tonhöhen-Spur, Tonart-Zeilen hell. Umriss = gesungen, Block = gehört.
2. **Tonhöhe quantisieren:** [Aus] [Weich] [Hart] + **Stärke 0–100 %**. Jede Note wird zum nächsten Ton der Tonart der Stelle gezogen
   (Voreinstellung: Szene-Clip → Tonart der Szene, Song-Stimme → Szene an dem Takt, sonst Projekt; im Feld gespeichert).
   **Weich** = gleiche Verschiebung über die ganze Note (Vibrato, Gleiten bleiben), Übergang zwischen Noten 40 ms;
   **Hart** = folgt der Stimme (15 ms) und rastet sie auf den Ton (Vibrato wird glatt). Meldung „n Töne auf die Tonart … gezogen“.
3. **Noten frei verschieben:** Note antippen (gewählt = hell mit Rand), **senkrecht ziehen** = Halbtöne (eigene Melodie), [▲] [▼] = ±1,
   **[Teilen]** an der zuletzt getippten Stelle (Höhe je Teil neu gemessen), **[Verbinden]** mit der nächsten Note. Je ein Undo.
4. **Nur stimmhafte Teile werden verschoben.** Zisch-/Plosivlaute (s, sch, t, p, k, f), Atmer, Pausen und jede nicht verschobene Note
   bleiben **bitgleich**. 15 ms Schutz an jedem Rand einer stimmhaften Strecke (dort klingt der Konsonant noch nach), dann 10-ms-Blende.
5. **Formant-erhaltend**, nicht zerstörend: Roh-Take bleibt; Render-Cache je Take + Plan + Quelle (bis 8 Fassungen: ↶ ↷, A/B ohne
   Neurechnen); Rechnen im Worker (Rückfall Hauptfaden). Kette je Take: SÄUBERN (VS4) → **Tonhöhe** → Zeitkarte (VS5) → Abspielen;
   gilt in Szene und Song. **[A/B]** = Original hören (wie beim Marken-Editor). **[WAV]** = die gehörte Fassung als WAV.
6. Takes-Blatt offen → die Töne werden schon im Worker gesucht (der Tipp auf Weich/Hart muss danach nur noch rechnen).

Daten (additiv am Take, Format 5): `take.pitch = {mode 'soft'|'hard', str, q, key {root, scale}, notes: [{t0, t1, m, sh?}]}`.
Ein Take ohne Änderung bleibt Zeichen für Zeichen gleich; ↶ ganz zurück entfernt das Feld.

### Verfahren (Kern `dsp/g2pitch.js`, in der App wörtlich im Block `/* G2-BEGIN */`)
Analyse einmal je Take: pYIN (VS2-Kern) auf 16 kHz, 10-ms-Frames → VS2-Segmente = Noten; Periode je Frame auf voller Rate nachgemessen;
Notenhöhe = Median des Kerns. **Harmonisches Modell** je stimmhafter Strecke: Phase Φ = ∫2π·f0, alle 10 ms die komplexen Teilton-
Amplituden bis 7 kHz (Hann über 3 Perioden, chirp-fest über Φ). Verschieben: Ziel-Phase Φ' = ∫2π·f0·r(t); jeder neue Teilton bekommt die
Hülle des Originals **an seiner neuen Frequenz** (Log-Betrag zwischen den Nachbar-Teiltönen) → formant-erhaltend; Ausgang =
Original + Blende·(Modell verschoben − Modell original), d. h. Hauch/Rauschen (der Rest) bleibt unverschoben.

### Abnahme (Chromium headless, Skripte in `tests/`)
| ID | Ergebnis | Messung |
|---|---|---|
| G2-01 | ✓ | 10 gesungene Töne 30–45 Cent daneben (C-Dur, Konsonanten, Vibrato ±25 Cent). Hart 100 %: je Note **max 0,15 Cent** neben dem Skalenton; Hart 50 %: halber Abstand max 0,14 Cent; Weich 100 %: max 0,12 Cent (`g2-app.mjs`, gemessen an der gespielten Fassung mit unabhängigem NSDF) |
| G2-02 | ✓ | Weich: Vibrato-Tiefe **99 %** des Originals. Hülle: jeder Teilton des Ausgangs auf der Hülle des Originals an seiner Frequenz 300 Hz–4 kHz, 5 Vokale × 130–262 Hz × ±38/42 Cent: **max 0,00 dB** (`g2-core.mjs`) |
| G2-03 | ✓ | M-KLICK 30,5 dB = Original 30,5 dB (alle Fälle); Dauer gleich (288 000 = 288 000 Samples, Abweichung 0 ms) |
| G2-04 | ✓ | A/B = Roh-Take; ↶ → vorige Einstellung; ↶ ganz → Feld weg, Klang **bitgleich**; ↷ deep-equal + bitgleich; Speichern → neu laden → Laden: Feld deep-equal, Klang bitgleich. Worker, **keine langen Tasks > 50 ms** im Hauptfaden. 16-Takt-Take (32 s): kalt **2,5–3,2 s** (Lauf zu Lauf), wie bedient (Takes-Blatt offen, dann [Hart]) **1,5 s** |
| G2-05 | ✓ | Note +3 HT: **300,0 Cent**; Zischlaute **bitgleich** (0 Samples anders); außerhalb der Note bitgleich; kein Klick (M-KLICK gleich). Kern zusätzlich −3/+4/+7/±12 HT: Fehler ≤ 0,1 Cent |
| G2-06 | ✓ | Blöcke im Editor = gemessene Noten: Start **0,0 ms**, Höhe **0,0 Cent** neben den Noten der Analyse (P1, P2, P3, L1, L2, XL); Tipp wählt, ▲ +1, Ziehen 2 Zeilen = +2, Teilen/Verbinden, je ein Undo |
| Layout | ✓ | Editor und Takes-Blatt in 6 Größen: nichts abgeschnitten, keine Seiten-Überbreite, Takes-Blatt quer ohne Scrollen (356/356) (`g2-lay.mjs`) |
| Regression | ✓ | G1 `n5-g-t1` (14 ✓), `n5-g-t2` (40 ✓), smoke ohne Fehler |

### Abweichungen
- **Verfahren:** Die Spec nennt „PSOLA/WSOLA-Familie wie VS5b“. Gebaut und gemessen wurde zuerst TD-PSOLA (Tonhöhe ±3 Cent, Zischlaute
  bitgleich), aber die **Formanten wichen um 3–10 dB ab** (schmale Formanten werden durch die 1–2-Perioden-Körner verschmiert; Messung
  gegen dieselbe Stimme auf dem Zielton: ideal ≤ 1 dB). G2-02 verlangt ±1 dB → Kern auf **harmonisches Modell + unverschobenen Rest**
  umgestellt (Tonhöhe exakt, Hülle ±0 dB an den Teiltönen). Bitte am iPhone hören, ob es natürlich klingt (Fragen 1).
- **Formant-Messung:** Ein Cepstrum-Vergleich gegen eine neu gesungene Referenz hat schon für die **unveränderte** Stimme 4,7 dB
  Messboden (die Hülle ist zwischen den Teiltönen nicht bekannt, wenn Formanten schmaler sind als der Teiltonabstand). Gemessen wird
  darum je Teilton gegen die Hülle des Originals an dessen Frequenz.
- **16-Takt-Zeit kalt** schwankt auf der VM 2,5–3,2 s (Analyse 1,6–2,4 s + Rendern 0,7 s); deshalb wird beim Öffnen des Takes-Blatts
  schon analysiert (wie bedient: 1,5 s).
- Die **Tonart** ist im Editor nur angezeigt (Voreinstellung der Stelle), nicht wählbar – die Spec nennt keine Wahl.
- **[WAV]** im Noten-Editor (gehörte Fassung): die Spec nennt „WAV-Export der hörbaren Fassung wie bei Dehnen“; für Dehnen gab es
  bisher keinen eigenen Knopf (Takes-Blatt [WAV] = Roh-Take, N7V-20 bitgleich, unverändert).

### Fragen an Xander (G2)
1. Klingt die verschobene Stimme natürlich (Weich und Hart, auch +3/+7 Halbtöne)? Bitte mit Kopfhörern und A/B.
2. Soll die Tonart im Noten-Editor wählbar sein (z. B. ‹ › wie im Ergebnis-Blatt)?
3. Soll [♪ Tonhöhe] auch im Marken-Editor neben dem Timing stehen (dort ist im Hochformat kein Platz in der Kopfzeile)?

### iPhone (Xander)
1. 2 Takte singen, STIMME-Clip ✎ → [♪ Tonhöhe · Noten]. Stimmen die Blöcke mit dem Gesungenen?
2. [Hart] → klingt jeder Ton sauber auf der Tonart? [Weich] → bleibt das Vibrato? Stärke ziehen.
3. Eine Note antippen, nach oben ziehen (eigene Melodie). Klingen s/sch/t unverändert, kein Knacken?
4. [A/B] vergleichen, ↶ ↷, speichern und neu laden.

### Für das Zusammenführen (G2)
- Neuer Block `/* G2-BEGIN */ … /* G2-END */` direkt vor `function voicesInfo()` (Kern `g2PitchMake` + App-Teil).
- `Object.assign(SYNQUENZER, G2_API);` eine Zeile nach `Object.assign(SYNQUENZER, WP_API);`.
- `tkSheetPaint`: eine Zeile `tkedrow` nach der `tk-wp`-Zeile; eine Zeile `g2Pre(...)` nach `clSheet(p, x)`.
- `tkSheet` onTap: eine Zeile `d.a === 'g2'`.
- `wpUndone`: erste Zeile `g2Undone()`.
- CSS: Block `/* G2: … */` nach `.tksheet .tk-wp{…}` (4 Zeilen + eine Zeile `#wpSheet.g2 .qchips`).
- `tkExt().proc`: g2Proc wird hinter wpProc eingefügt (im G2-Block, keine Zeile außerhalb).

## G6 – Chor-Generator (Background-Gesang per Knopf)

### Was neu ist
1. **Takes-Blatt → [Chor]** (neben [♪ Tonhöhe · Noten]) öffnet das Blatt **„Chor“** mit 8 Rezepten: **Terz, Sexte, Quinte, Oktave,
   Dreistimmig, Falsett-Chor 80er, Barbershop 4-stimmig, Unisono-Doppel**; bei Terz/Sexte/Quinte/Oktave [oben] [unten].
   Ohne Chor steht dort der kurze Hilfetext zu den Rezepten (Spec: „im Hilfetext kurz erklärt“).
2. Ein Tipp auf ein Rezept rechnet die **Noten der Stimmen** aus der Lead-Melodie (Noten der gehörten Fassung, G2-Analyse) und den
   **Akkorden der Stelle** (Töne der anderen Synth-Spuren der Szene am Schlag der Note; ohne Begleitung der leitereigene Dreiklang,
   der den Ton enthält, I/IV/V zuerst) in der Tonart der Stelle:
   Terz/Sexte = leitereigen (groß oder klein je nach Ton), Quinte = rein, wenn leitereigen, sonst leitereigen; Oktave ±12;
   Dreistimmig = die zwei nächsten Akkordtöne über dem Lead (eng); Falsett = Oktave + (Terz + Oktave); Barbershop = Tenor (Akkordton
   darüber), Bariton (darunter), Bass (Grundton darunter); Unisono = gleiche Töne.
3. Jede Stimme wird aus der **gehörten Lead-Fassung** gerechnet (G2-Technik: nur stimmhaft, formant-erhaltend; Tonhöhen-Quantisieren,
   Zeitkarte und Säubern des Leads gelten also mit) und **künstlich gedoppelt**: 2 Kopien je Stimme, +12 ms/−6 Cent und
   +24 ms/+8 Cent, leicht auseinander im Panorama; Stimmen links/rechts (3 Stimmen: links, rechts, Mitte), Lead bleibt Mitte vorn.
4. **Pegel nach Lautheit:** der Chor liegt gesamt (trocken + Hall) **8 LU (80er) bzw. 9 LU (Pop) unter dem Lead** – gemessen an der
   K-bewerteten Leistung der Puffer (Worker), Hall-Anteil aus Send und Nachhallzeit geschätzt. **Hall und Echo als Send vor dem
   Chorspur-Pegel:** Chorspur-Pegel 0 → nur noch Hall.
5. **Mischung** [80er großer Refrain] [Pop modern] (Voreinstellung, beim ersten Chor gleich mit, ein Undo): Hall-/Echo-Send der
   Chor-Stimmen (80er 75 %/12 %, Pop 40 %/18 %), Lead-Sends der STIMME-Spur (30 %/10 % bzw. 15 %/12 %), **Hall-Vorverzögerung im
   Tempo** (1/32 bzw. 1/64) und **Echo im Tempo** (1/4 bzw. 1/8 punktiert).
6. Je Stimme: **[Solo]** (nur diese Stimme, der Lead schweigt), **[♪ Noten]** = die Stimme als Noten im Noten-Editor (Lead-Note +
   Intervall; ▲ ▼ und Ziehen ändern die Stimme, ein Undo; A/B dort = Solo), **[Selbst singen]**: die Stimme spielt allein als
   Führung, die nächste Aufnahme (● REC mit 🎤, Overdub in diesem Clip) **ersetzt die errechnete Stimme** und wird gleich mit Panorama,
   Sends und Pegel eingemischt; oben im Clip bleibt der Lead (gleiches Undo wie die Aufnahme). [Chor löschen].
7. Abspielen: zu jedem Lead-Stück (Szene und Song) laufen die Stimmen-Stücke mit (gleiche Zeit und Blenden, enden mit ihm);
   eine neu gerechnete Stimme setzt beim Abspielen mit 10-ms-Blende ein, der Lead läuft durch.

Daten (additiv am Audio-Stück, Format 5): `audio.chor = {rec, dir, mix, voices: [{name, n: [{t0, t1, m, iv}], pan, db, vol, rev, dly, take?}]}`.

### Abnahme (`tests/g6-app.mjs`, Chromium)
| ID | Ergebnis | Messung |
|---|---|---|
| G6-01 | ✓ | Refrain C-Dur C4…C5, Terz oben: Tabelle C→E, D→F, E→G, F→A, G→H, A→C, H→D, C→E (8/8). Gemessene Tonhöhe je Chornote: Kopie 1 max 6,3 Cent, Kopie 2 max 8,5 Cent neben der Terz (die Kopien sind absichtlich −6/+8 Cent verstimmt). Weitere Rezepte als Tabelle geprüft (Sexte, Quinte, Oktave unten, Dreistimmig, Barbershop, Unisono) |
| G6-02 | ✓ | Falsett: Oktave 72…84 + Terz+Oktave 76…88; je Stimme 2 Doppel (beim Start 1 Lead + 4 Quellen); Lautheit am Ausgang (BS.1770, Stereo): Chor **8,0 LU** unter dem Lead (80er), **9,2 LU** (Pop) |
| G6-03 | ✓ | Chorspur-Pegel 0: Ausgang −46,4 dBFS, Nachhall nach dem Notenende −63,7 dBFS (nur Hall); Send zusätzlich 0 → −135,6 dBFS (Stille) |
| G6-04 | ✓ | [Selbst singen] Stimme 2 + Aufnahme → Stimme 2 = der neue Take, Lead bleibt oben, Panorama/Sends gleich; beim Abspielen 1 Lead + 2 Kopien Stimme 1 + selbst gesungene Stimme 2 |
| G6-05 | ✓ | ↶ (Pegel, Sends) deep-equal; Chor löschen → ↶ → deep-equal; Speichern/Laden deep-equal; Abspielen mit Chor ohne lange Tasks; 2 Stimmen = 4 Puffer-Quellen + 1 Lead (Rechnen im Worker, 2 Renders ≈ 250 ms für 4 s) |
| Layout | ✓ | Blatt Chor in P1, P2, P3, L1, L2, XL: alle Tasten ≥ 44 × 44, nichts abgeschnitten, quer ohne Scrollen (329/329) |
| Regression | ✓ | `g2-app.mjs` (alle ✓), `g2-lay.mjs`, smoke |

### Abweichungen
- **„je Stimme eine Spur“**: Die App hat genau eine STIMME-Spur. Die Chor-Stimmen sind darum eigene Abspiel-Stücke **an der STIMME-Spur**
  (eigener Pegel, Panorama, Sends je Stimme), keine zusätzlichen Spuren in der Matrix.
- **G4-Kette** (Hochpass → Entzischer → Kompressor → EQ) und **Auto-Pegel (VS-P)** kommen aus anderen Zweigen: der Chor läuft über die
  STIMME-Spur (deren Kette gilt dann für Lead und Chor). Haken für das Zusammenführen: Chor-Stimmen gehen in `AU.tracks[i].trackIn`
  (`g6Node`) – soll der Chor eine eigene G4-Einstellung bekommen, wird dort die Kette eingesetzt.
- **Pegel-Kalibrierung:** die Lautheits-Rechnung lag am Ausgang 1,9 dB zu leise (Spur-Lautstärke wirkt nur trocken, Sends vorher) →
  mit der Messung kalibriert (`G6_CAL`).
- Die Mischung ändert **globale** Einstellungen (Hall-Vorverzögerung, Echo-Teilung) – das wirkt auf alle Spuren (ein Undo).
- Solo „nur Chor“ / „nur Lead“ gibt es nur in der Test-API (Messung), nicht als Knopf.

### Fragen an Xander (G6)
1. Sollen die Chor-Stimmen eigene Spuren in der Matrix bekommen (dann mehr als eine STIMME-Spur)?
2. Sollen die Pegel (8/9 LU unter dem Lead), die Verstimmung der Doppel (−6/+8 Cent) und die Versätze (12/24 ms) einstellbar sein?
3. Soll die Mischung die globalen Hall/Echo-Einstellungen ändern dürfen, oder nur die Sends?
4. „Selbst singen“ startet nicht selbst die Aufnahme: man tippt danach ● REC mit 🎤. Soll der Knopf gleich aufnehmen?

### iPhone (Xander)
1. 2–4 Takte Refrain singen, STIMME-Clip ✎ → [Chor] → [Terz] → abspielen. Klingt die Terz richtig (groß/klein je Ton)?
2. [Falsett-Chor 80er] + [80er großer Refrain] → klingt es nach großem Refrain? [Pop modern] vergleichen.
3. [Solo] je Stimme, [♪ Noten] einer Stimme ansehen, eine Note mit ▲ ändern.
4. [Selbst singen] bei Stimme 2 → ● REC mit 🎤 → nachsingen → klingt deine Stimme jetzt im Chor?

### Für das Zusammenführen (G6)
- Neuer Block `/* G6-BEGIN */ … /* G6-END */` direkt hinter `/* G2-END */`; `Object.assign(SYNQUENZER, G6_API);` hinter der G2-Zeile.
- `tkStartSrc`: eine Zeile `g6Start(o, r)` vor `return r;`. `tkDrop`/`tkKill`: je ein Ausdruck `if (r.ch) g6Drop/g6Kill(r);` am Anfang;
  `tkFadeAt`: erste Zeile `g6Fade`; `tkXfOut`: eine Zeile `g6Fade` nach `r.o = null;`.
- Aufnahme (`tkRecToClip`-Pfad, Overdub-Zweig): eine Zeile `g6Took(...)` nach `clip.audio.alt = …`; `tkInject` (Test-API): `g6Took` in der Overdub-Zeile.
- `tkSheetPaint`: `tkedrow` enthält jetzt auch [Chor]; `tkSheet` onTap: eine Zeile `d.a === 'g6'`.
- G2-Editor: Stimmen-Modus (`g2Open(r, {voice})`, `g2Voice`, Zweige in Chips/Malen/Ziehen – alles im G2-Block).
- G2-Worker `g2Run`: gibt mit `kw` die K-bewertete Leistung zurück (`g2Kw`).
- CSS: Block `/* G6: Blatt „Chor“ … */` nach der G2-CSS-Zeile; `.tksheet .tkedrow` 2 Spalten, quer drei Teile.
