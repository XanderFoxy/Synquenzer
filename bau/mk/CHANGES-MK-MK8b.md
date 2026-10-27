# CHANGES MK8b: Sammlung „Kompakt“ – 128 eigene Klänge im Stil der kleinen Schwester (App 4.23.0)

Zweig-Kopie `scratchpad/mk-br-MK8b/index.html`, gebaut auf **4.21.0** (MS 2000 mit MK8, Platte, VS3–VS5b; 3 322 724 B,
Kopie `dirigent-test/v3-mk8b-base-4210.html`). Snapshot `synq-snapshots/MK8b.html`. Format bleibt 5.
Anlass: Xander 27.10. („Du hast am Anfang auch gesagt, dass du die Bibliothek von MicroCork reinmachst. Dann mach es auch.“).
Keine Korg-Daten (EN3-07): eigene Rezepte, eigene Namen, eigene ⓘ-Texte; aus der privaten Werksnamen-Liste wird nur geprüft.

## Gebaut

- **128 Programme in 8 Genres × 16** für die Engine „MS 2000“: TRANCE · TECHNO/HOUSE · ELECTRONICA · D&B/BREAKS ·
  HIPHOP/VINTAGE · RETRO · S.E./HIT · VOCODER. Rollen je Genre: Lead, Fläche, Bass, Arpeggio, Sequenz, Akkord, Tasten,
  Glocke, Effekt, Hit, Drum-artig (Kick, Tom, Snare, Hat in Tonhöhen spielbar). Je Genre ≥ 6 mit laufendem Arp oder Mod-Seq
  (genau 6 je Genre), 7 Programme mit Dual/Split, Speicherwellen-Klänge (Drift Wave, Wave Steps), Ring/Sync/Sinus×.
- **VOCODER-Genre:** 16 Vocoder (`mode` 3) **ohne Halten**, DIREKT 0, HPF ≤ 30. Beim Laden setzt die App **E2 = Mikrofon**
  (vorhandene Regel `mkVocAutoMic`, G-MKP8) im selben Undo-Schritt. 8 davon mit Kanal-Paaren wie 8 Bänder (Pegel und Pan
  paarweise gleich), 6 mit Arp. Im Claude-Fenster gilt der Hinweis wie in 4.17.0 („Mikrofon nur auf der GitHub-Seite“); dazu
  zeigt der Reiter VOCODER oben eine Zeile („Laden schaltet E2 = Mikrofon ein … ▶ hört mit einem Probe-Vokal“).
- **Daten** (Umfang 1): derselbe Generator und dieselbe Kodierung wie MK8 (geänderte Felder gegen INIT als Varint, je Genre ein
  Base64-Teil mit Salz-Byte gegen Markenwörter), Block `/*MKK{*/ SQ_MK_KOMPAKT /*}MKK*/` am Ende von `sq-mk-src` (nur bei
  Bedarf ausgewertet), Modul `window.MKK` (Entpacken je Genre beim ersten Bedarf, `tickAhead(.3)` vorher). Bau:
  `dirigent-test/v3-mk8b-bau.mjs` (Rezepte `v3-mk8b-rezepte.mjs`, Kalibrierung `v3-mk8b-cal.json`). Datenblock 23,1 KB.
- **Einträge** `f-mk-k<Genre><Nr>` (z. B. `f-mk-k103`) nur in `FACTORY_BY_ID` (Laden per id, Herkunft, „geändert“, A/B) –
  **nicht** in den Rollen-Listen; „Alle MS 2000“, Rollen-Chips und „Bank ▾“ bleiben wie in 4.21.0. Zeile: Name, darunter
  „TRANCE 03 · Arpeggio“. Projekte mit einem Kompakt-Klang laden den Block beim ersten Bedarf (`originRec`, wie MK8).
- **Bibliothek** (Umfang 4): im Filter „MS 2000“ neuer Chip **„Kompakt“** (nach „Bank ▾“). An: statt der Rollen-Chips stehen
  „Alle MS 2000“ (zurück) und die **8 Genre-Reiter** (hochkant kurz: TRANCE, TECHNO, ELECTRO, D&B, HIPHOP, RETRO, S.E./HIT,
  VOCODER; quer in der 120-px-Spalte die langen Namen). Eine Spur mit einem Kompakt-Klang öffnet seinen Genre-Reiter.
  ▶ = Vorhören, Name = Laden (ein Undo, Toast [▶ Hören] [Rückgängig]), **⋯ = [Laden] [Auf Platz schreiben]**.
- **Auf Platz schreiben** (= WRITE wie MK8): Platzwahl Bank A–H, Platz 1–16 (Vorgabe: der zuletzt geladene Platz), Infozeile
  („A01 · Werksklang „…“ wird überdeckt (Werksklang zurück holt ihn wieder)“ bzw. „trägt … – er bleibt in Eigene“), Name,
  [Abbrechen] [Auf A01 schreiben]. Schreibt einen eigenen Klang mit `bank`/`slot`; ein älterer eigener Klang auf dem Platz
  verliert nur den Platz. Ein Undo (`mkslot`), Undo/Redo deep-equal, LED/Anzeige der Platte folgen (`MKUI.progRefresh`).
- **Vorhören eines Vocoders** ohne Mikrofon: die Vorhör-Kopie bekommt das eigene „a“-Spektrum aus MK8 als Halten
  (`MKK.pvFix`, Toast „Vorhören mit Probe-Vokal · geladen spricht das Mikrofon (E2)“); der Klang auf der Spur bleibt ohne Halten.
  Gilt für jeden Vocoder-Klang ohne Halten in der Bibliothek (vorher stumm).
- Trefferfläche ⓘ und ⋯ der Bibliotheks-Zeilen auf 44 × 44 (unsichtbare `::after`-Erweiterung, Aussehen gleich;
  typische Fehler A4). `factoryNames` kennt die 128 Namen. Hilfe-Zeile „Sammlung Kompakt“. **VERSION 4.23.0**.

## Abnahme MK8b (Chromium 1243, `dirigent-test/`)

| ID | Ergebnis |
|---|---|
| MK8b-01 | ✓ 128 Klänge = 8 × 16, je Name ≤ 12, Rolle, ⓘ; entpackt = Rezept deep-equal; alle 128 laden über die Bibliothek ohne Fehler, 0 Konsolenfehler. **Hörbar:** C3 gehalten 4 s, lautestes 400-ms-Fenster 128/128 > −40 dBFS (leisester −29,3 dBFS), Vocoder mit Mikro-Attrappe (eigene Vokal-Quelle a e i o u, ×3 entzerrt, −20 dBFS RMS) |
| MK8b-02 | ✓ Levenshtein gegen 256 Werksnamen (nur aus `manuals/werksnamen.local.json`) kleinster Abstand 3; keine doppelten Namen, auch nicht gegen alle übrigen Werks-Sounds und A01–H16; E9-Liste in Namen und ⓘ 0; Stichprobe 3 Werksnamen in MK8b-Dateien und App 0. Im Bau umbenannt (Abstand ≤ 2 oder > 12 Zeichen): 10 Namen |
| MK8b-03 | ✓ wie MK8-04: alle **−20,9 … −17,6 LUFS**, True Peak **≤ −1,6 dBTP**, Bässe M-HANDYrel bei C2 ≥ −18,9 dB; Phrasen wie MK8 (Bass 8 Achtel C2, Lead C4–C5, Fläche 4 Takte, Arp/Seq gehaltener Akkord durch das Arp-Muster, Vocoder gehaltene Akkorde mit Mikro-Attrappe, Drum 8 Achtel C2, Hit/Akkord/Tasten Akkord-Stöße, Glocke Melodie, Effekt lange Note) |
| MK8b-04 | ✓ Arp/Seq je Genre 6/6/6/6/6/6/6/6; VOCODER 16 × `mode` 3 ohne Halten, DIREKT 0; Laden (Bibliothek) → **E2 = mic 16/16**, Laden + Eingang = ein Undo, Undo deep-equal 16/16; mit Fake-Mikrofon live hörbar (−18,6 … −30,7 dBFS); 8 mit Kanal-Paaren |
| MK8b-05 | ✓ Laden = 1 Undo, Undo deep-equal, Redo (128×); **per Finger** Kompakt → ELECTRONICA → ⋯ → Auf Platz schreiben → D → 7 → „Auf D07 schreiben“: D07 trägt die Werte des Programms und lädt sie danach, 0 andere Plätze geändert, Undo deep-equal, Redo; zweites Schreiben: der ältere verliert nur den Platz; Speichern → Laden (Projektdatei in frische Seite) deep-equal, nicht „geändert“, Platz-Klang mit `bank`/`slot` gleich |
| MK8b-06 | ✓ / **Abweichung** P1, P2, P3, L1, L2, 926×428: nichts abgeschnitten (HIPHOP/VINTAGE quer mit 11 px), Zeilen, ▶, Name, ⓘ, ⋯, [Laden]/[Auf Platz schreiben] und alle Tasten der Platzwahl ≥ 44 px (Trefferfläche per `elementFromPoint` gemessen), Liste per Finger (CDP-Touch) scrollbar ohne Vorhören/Laden, 0 px Layout-Sprung über Kompakt an/aus und alle 8 Reiter. **Abweichung:** die Chip-Zeile (Kompakt, Genre-Reiter) hat die Höhe aller Bibliotheks-Chips seit V0b, 36 px (P1) bzw. 32 px (P2/P3/quer) – siehe „Vorschlag“ |
| MK8b-07 | ✓ grep: Korg/microKORG/RADIAS/DWGS 0 in der Datei, „MS 2000“ genau 1× (`MK_LABEL`), Kompakt-Block 0 Markenwörter; die Sammlung heißt „Kompakt“; kein Modellname der kleinen Schwester |

Budget: **+36 854 B** gegen 4.21.0 (≤ +45 KB = 46 080 B). Ein Genre entpackt 0,5–1,8 ms, Block auswerten ≈ 16–18 ms (bei Bedarf,
wie MK8). Startzeit ohne MS 2000 unverändert (303 → 303 ms, Median aus 5). Worklet unverändert.

Skripte: `v3-mk8b-daten.mjs` (01, 02, 04, 07, Größe; `--changes` = Herkunftstabelle), `v3-mk8b-pegel.mjs` (01 hörbar, 03;
`--cal N`), `v3-mk8b-ui.mjs` (01, 04 mit Fake-Mikrofon, 05, 06, Vorhören), `v3-mk8b-namen.mjs` (schnelle Namensprüfung),
`v3-mk8b-bau.mjs`, `v3-mk8b-rezepte.mjs`, `v3-mk8b-mkk.js` (Quelltext des Moduls). Ausgaben `v3-mk8b-*.out`,
Bilder `v3-mk8b-shots/` (`<Format>-kompakt.png`, `-vocoder.png`, `-aktionen.png`, `-platz.png`), Rauchtest `v3-mk8b-smoke.png`.

## Fach-Prüfung (selbst, vor der Abnahme; wie MK8: FP-KLANG ● Haupt-, FP-TOUCH Zweit-Blick)

10 Befunde, alle behoben bzw. begründet:
1. FP-KLANG: unkalibriert lagen 94 Programme außerhalb −18 ± 3 LUFS. Kalibrierung wie MK8 (AMP LEVEL bzw. VOCODER LEVEL
   darunter, flache EQ-Anhebung darüber, ≤ +12 dB); 20 Programme waren danach noch zu leise oder zu spitz → im Rezept
   nachgestimmt (längeres Ausklingen statt Mini-Hüllkurven, etwas Verzerrung, weniger harte Pegel-Gates, offeneres Filter):
   Rain Pluck, Tick Hat, Minimal Blip, Strobe, Echo Stab, Data Burst, Snare Crack, Echo Pluck, Funk Clav, Scratcher, Twang Pluck,
   Synth Toms, Laser Zap, Zap Gun, Far Storm, Glitch Hit, Horn Hit, Robo Voice, Gate Voc, Sing Arp.
2. FP-KLANG: Bass „Sub Pulse“ M-HANDYrel −25,8 dB → schmalerer Puls, Filter höher (jetzt −14,3 dB).
3. FP-KLANG: ⓘ-Treue: „Downlifter“ stieg statt zu sinken (EG1 → Tonhöhe negativ fällt zurück auf 0) → EG1 mit langsamem
   Anstieg; „Peak Hit“ ebenso (Vorzeichen); „Echo Pluck“ nannte Achtel-Triolen, das Echo steht auf 1/6 → Text „Viertel-Triolen“.
4. FP-KLANG: zu wenige Arp/Seq in D&B und HIPHOP (5) → „Echo Pluck“ mit Arp, „Lo-Fi Pad“ mit langsamer Filterfolge; Dual/Split
   in TECHNO und S.E./HIT ergänzt („Warehouse“, „Big Hit“ zweistimmig).
5. FP-KLANG: zehn Namen zu nah an Werksnamen oder > 12 Zeichen → umbenannt (Prüfung druckt nur eigene Namen).
6. FP-KLANG: Vocoder ohne Halten waren im Vorhören stumm (die Vorhör-Stimme hat keine Eingänge) → Probe-Vokal nur im Vorhören.
7. FP-KLANG: „Whisper Voc“ live mit Fake-Mikrofon zwischen den Pieptönen still (Gate) – gewollt; der Test misst jetzt das
   lauteste Fenster über 2 s.
8. FP-TOUCH: ⓘ (36 × 44) und ⋯ (40 × 40) der Zeilen unter 44 px → unsichtbare Trefferflächen-Erweiterung, Aussehen gleich.
9. FP-TOUCH: „HIPHOP/VINTAGE“ quer in der 120-px-Spalte abgeschnitten → Reiter quer 11 px, Innenabstand 4 px.
10. FP-TOUCH: Chip-Höhe 32/36 px der Bibliothek (Bestand V0b) – nicht still geändert (sichtbar), Vorschlag unten.

## Abweichungen und Lücken

- **„Antippen = Vorhören“** (Umfang „Ziel“): in der Bibliothek lädt ein Tipp auf den Namen überall (V0b U-01, von Xander so
  festgelegt); Vorhören ist ▶ links in der Zeile. [Laden] und [Auf Platz schreiben] stehen unter ⋯ der Zeile.
- **Chip-Zeile < 44 px** (MK8b-06): Kompakt-Chip und Genre-Reiter sind so hoch wie alle Bibliotheks-Chips (36 px hochkant P1,
  32 px sonst). **Vorschlag an Xander (sichtbare Änderung, nicht gebaut):** die ganze Chip-Zeile der Bibliothek auf 44 px
  (hochkant +8 px bzw. +12 px Höhe, die Liste wird entsprechend kürzer).
- Pegel über die flache EQ-Anhebung wie MK8 (auf der EQ-Seite stehen dann LOW/HIGH 1000 Hz +x dB).
- Vocoder-Pegel sind mit einer Mikro-Attrappe bei −20 dBFS RMS kalibriert; ein echtes iPhone-Mikrofon kann lauter oder
  leiser sein (am Gerät prüfen).
- Kein Mensch hat die Klänge gehört (EN3-16): alle gemessen, nicht angehört → iPhone-Punkte.
- Chromium-Pfad: `/opt/pw-browsers/chromium-1194/…` gibt es hier nicht; benutzt `chromium-1243/chrome-linux64/chrome`.

## Supabase / Am Server offen

- **`max_app` muss vor dem Ausliefern auf ≥ 4 023 000** (heute 4 021 000; 4.23.0 = `APP_CODE` 4 023 000, `save_project`
  lehnt sonst Online-Speichern mit `bad_version` ab). SQL für den Orchestrator (nicht ausgeführt, kein Supabase-Aufruf):
  `update private.settings set max_app = 4023000;` (Projekt `dbdnsryoivvezspgydpx`). Format bleibt 5, sonst nichts.

## Fehler früherer Pakete (nur gemeldet, nicht in diesem Zweig behoben)

- MK8/G-MKP8: `v3-mk8-ui` MK8-08 „Laden ≤ 50 ms ohne longtask“ scheitert schon auf 4.21.0 (H11 laden 68–79 ms, 1 longtask):
  das Laden eines Vocoder-Programms startet seit G-MKP8 das Mikrofon (`mkVocAutoMic` → `getUserMedia`) synchron im Laden.
  Gilt genauso für die Kompakt-Vocoder.
- `v3-mk8-ui` M-PLATZ L1/L2 (2 FAIL): überholt seit MK-P (kein „Sichern“ im 44-px-Kopf quer), wie im G-MKP8-Changelog.
- Demo-Projekt: die Synth-Spur heißt „Moog-Bass“ (Markenname in einem Klangnamen der Demo, E9-Liste) – im Kopf der Bibliothek sichtbar.
- MK8-08 „eine Bank entpackt ≤ 5 ms“ schwankt beim allerersten Aufruf (einmal 6 ms, Wiederholung 2,5 ms).

## Regression

- Rauchtest `smoke.mjs` ohne Fehler (`dirigent-test/v3-mk8b-smoke.png`).
- `v3-mk8-daten` 0 Fehler; `v3-mk8-ui` 36 PASS / 2 FAIL (überholt, s. o.); `gmkp8-mk8-09-platte` 27/27; `gmkp8-mk8-platz-quer` 9/9;
  `gmkp8-voc-mic` 8/8; `v3-mk7-voc` 37/37; `v3-mk2-marke` alles PASS.

## Für das Zusammenführen

- Block `sq-mk-src`: neuer Abschnitt nach dem MKF-IIFE (`/*MKK{*/ … /*}MKK*/` + IIFE `window.MKK`); im MKF-Code nur
  `bankPop` (setzt `BR.kp = 0`).
- Hauptskript: `VERSION`, `factoryNames`, `BR` (`kp`), `brList`, `openBrowser`, `buildBrowser` (Reiter-Tipp), `brScope` (`kp`),
  `brChipsHTML`, `brRefresh` (Auswahl-Schlüssel, Vocoder-Zeile, ⋯ für Kompakt-Zeilen, Aktionen), `brTap` (`kpw`), `previewFor`
  (`MKK.pvFix`), Hilfe-Zeile; CSS `.mkkvoc`, `.brow .binfo/.bmore::after`, quer `#sndSheet .brcats .chip.brkg`. Worklet unverändert.

## iPhone (Xander)

1. Spur auf MS 2000 → Bibliothek → Chip **Kompakt** → jeden Genre-Reiter einmal mit ▶ durchhören (Lautsprecher und Kopfhörer);
   Ausreißer melden (zu leise, zu laut, langweilig).
2. VOCODER: einen Klang laden (Safari fragt nach dem Mikrofon), Kopfhörer auf, sprechen und Tasten halten.
3. Einen Kompakt-Klang über ⋯ → „Auf Platz schreiben“ auf einen Platz legen, mit BANK/SELECT der Platte laden, dann
   WERKSKLANG ZURÜCK.

## Herkunft je Programm (alle: eigenes Rezept)

| Nr. | Genre | Name | Rolle | Modus | Merkmale | Herkunft |
|---|---|---|---|---|---|---|
| 101 | TRANCE | Gate Saws | seq | Single | Seq, Delay-Sync | eigenes Rezept |
| 102 | TRANCE | Euphoric Ld | lead | Single | Delay-Sync | eigenes Rezept |
| 103 | TRANCE | Starfall | arp | Single | Arp, Delay-Sync | eigenes Rezept |
| 104 | TRANCE | Roll Bass | bass | Single | Seq | eigenes Rezept |
| 105 | TRANCE | Cloud Bloom | pad | Single | Delay-Sync | eigenes Rezept |
| 106 | TRANCE | Rain Pluck | keys | Single | Delay-Sync | eigenes Rezept |
| 107 | TRANCE | Anthem Stab | chord | Single | Delay-Sync | eigenes Rezept |
| 108 | TRANCE | Ice Run | arp | Single | Arp, Delay-Sync | eigenes Rezept |
| 109 | TRANCE | Hymn Strings | pad | Single |  | eigenes Rezept |
| 110 | TRANCE | Sub Pulse | bass | Single |  | eigenes Rezept |
| 111 | TRANCE | Cut Chords | seq | Single | Seq, Delay-Sync | eigenes Rezept |
| 112 | TRANCE | Acid Glide | lead | Single | Delay-Sync | eigenes Rezept |
| 113 | TRANCE | Crystal Bell | bell | Single | Delay-Sync | eigenes Rezept |
| 114 | TRANCE | Lift Off | fx | Single | Delay-Sync | eigenes Rezept |
| 115 | TRANCE | Twin Spiral | arp | Dual | Arp, Delay-Sync | eigenes Rezept |
| 116 | TRANCE | Peak Hit | hit | Single | Delay-Sync | eigenes Rezept |
| 201 | TECHNO/HOUSE | Club Organ | keys | Single |  | eigenes Rezept |
| 202 | TECHNO/HOUSE | Dub Chord | chord | Single | Delay-Sync | eigenes Rezept |
| 203 | TECHNO/HOUSE | Acid Loop | seq | Single | Seq, Delay-Sync | eigenes Rezept |
| 204 | TECHNO/HOUSE | Rubber Low | bass | Single |  | eigenes Rezept |
| 205 | TECHNO/HOUSE | Rave Horn | lead | Single |  | eigenes Rezept |
| 206 | TECHNO/HOUSE | Tribal Tom | drum | Single |  | eigenes Rezept |
| 207 | TECHNO/HOUSE | Deep Kick | drum | Single |  | eigenes Rezept |
| 208 | TECHNO/HOUSE | Tick Hat | drum | Single | Arp | eigenes Rezept |
| 209 | TECHNO/HOUSE | House Piano | keys | Single |  | eigenes Rezept |
| 210 | TECHNO/HOUSE | Pump Pad | seq | Single | Seq | eigenes Rezept |
| 211 | TECHNO/HOUSE | Minimal Blip | seq | Single | Seq, Delay-Sync | eigenes Rezept |
| 212 | TECHNO/HOUSE | Warehouse | fx | Dual |  | eigenes Rezept |
| 213 | TECHNO/HOUSE | Octave Jack | bass | Single | Arp | eigenes Rezept |
| 214 | TECHNO/HOUSE | Strobe | arp | Single | Arp, Delay-Sync | eigenes Rezept |
| 215 | TECHNO/HOUSE | Echo Stab | chord | Single | Delay-Sync | eigenes Rezept |
| 216 | TECHNO/HOUSE | Ride Wash | fx | Single |  | eigenes Rezept |
| 301 | ELECTRONICA | Bit Lead | lead | Single | Delay-Sync | eigenes Rezept |
| 302 | ELECTRONICA | Glitch Line | seq | Single | Seq | eigenes Rezept |
| 303 | ELECTRONICA | Blip Rain | arp | Single | Arp, Delay-Sync | eigenes Rezept |
| 304 | ELECTRONICA | Wobble Low | bass | Single |  | eigenes Rezept |
| 305 | ELECTRONICA | Haze Pad | pad | Single |  | eigenes Rezept |
| 306 | ELECTRONICA | Prism Keys | keys | Single |  | eigenes Rezept |
| 307 | ELECTRONICA | Ring Bell | bell | Single | Delay-Sync | eigenes Rezept |
| 308 | ELECTRONICA | Drift Wave | pad | Single | ≈ Welle | eigenes Rezept |
| 309 | ELECTRONICA | Wave Steps | seq | Single | Seq, ≈ Welle, Delay-Sync | eigenes Rezept |
| 310 | ELECTRONICA | Fold Bass | bass | Single |  | eigenes Rezept |
| 311 | ELECTRONICA | Pixel Arp | arp | Single | Arp | eigenes Rezept |
| 312 | ELECTRONICA | Noise Sweep | fx | Single |  | eigenes Rezept |
| 313 | ELECTRONICA | Formant Ld | lead | Single | Delay-Sync | eigenes Rezept |
| 314 | ELECTRONICA | Chime Pan | seq | Single | Seq, Delay-Sync | eigenes Rezept |
| 315 | ELECTRONICA | Split Duo | arp | Split | Arp, Delay-Sync | eigenes Rezept |
| 316 | ELECTRONICA | Data Burst | hit | Single | Delay-Sync | eigenes Rezept |
| 401 | D&B/BREAKS | Reese Low | bass | Single |  | eigenes Rezept |
| 402 | D&B/BREAKS | Neuro Growl | bass | Single |  | eigenes Rezept |
| 403 | D&B/BREAKS | Deep Sub | bass | Single |  | eigenes Rezept |
| 404 | D&B/BREAKS | Liquid Pad | pad | Single | Delay-Sync | eigenes Rezept |
| 405 | D&B/BREAKS | Roller | seq | Single | Seq | eigenes Rezept |
| 406 | D&B/BREAKS | Snare Crack | drum | Single |  | eigenes Rezept |
| 407 | D&B/BREAKS | Tom Roll | drum | Single | Arp | eigenes Rezept |
| 408 | D&B/BREAKS | Minor Rush | chord | Single | Delay-Sync | eigenes Rezept |
| 409 | D&B/BREAKS | Break Arp | arp | Single | Arp, Delay-Sync | eigenes Rezept |
| 410 | D&B/BREAKS | Siren Call | lead | Single | Delay-Sync | eigenes Rezept |
| 411 | D&B/BREAKS | Dark Atmos | pad | Single |  | eigenes Rezept |
| 412 | D&B/BREAKS | Dive Lead | lead | Single | Delay-Sync | eigenes Rezept |
| 413 | D&B/BREAKS | Chop Bass | seq | Single | Seq | eigenes Rezept |
| 414 | D&B/BREAKS | Echo Pluck | keys | Single | Arp, Delay-Sync | eigenes Rezept |
| 415 | D&B/BREAKS | Dual Roller | bass | Dual | Seq | eigenes Rezept |
| 416 | D&B/BREAKS | Rewind | fx | Single | Delay-Sync | eigenes Rezept |
| 501 | HIPHOP/VINTAGE | Dusty Keys | keys | Single |  | eigenes Rezept |
| 502 | HIPHOP/VINTAGE | Soul Organ | keys | Single | Seq | eigenes Rezept |
| 503 | HIPHOP/VINTAGE | Boom Low | bass | Single |  | eigenes Rezept |
| 504 | HIPHOP/VINTAGE | Funk Clav | keys | Single | Arp | eigenes Rezept |
| 505 | HIPHOP/VINTAGE | Lo-Fi Pad | pad | Single | Seq | eigenes Rezept |
| 506 | HIPHOP/VINTAGE | Horn Hit | hit | Single |  | eigenes Rezept |
| 507 | HIPHOP/VINTAGE | Whistler | lead | Single | Delay-Sync | eigenes Rezept |
| 508 | HIPHOP/VINTAGE | Smooth Lead | lead | Single |  | eigenes Rezept |
| 509 | HIPHOP/VINTAGE | Vinyl Arp | arp | Single | Arp | eigenes Rezept |
| 510 | HIPHOP/VINTAGE | Strings 70s | pad | Single |  | eigenes Rezept |
| 511 | HIPHOP/VINTAGE | Scratcher | fx | Single |  | eigenes Rezept |
| 512 | HIPHOP/VINTAGE | Mellow Seq | seq | Single | Seq | eigenes Rezept |
| 513 | HIPHOP/VINTAGE | Swell Horns | chord | Single |  | eigenes Rezept |
| 514 | HIPHOP/VINTAGE | Bounce Arp | arp | Single | Arp | eigenes Rezept |
| 515 | HIPHOP/VINTAGE | Twang Pluck | keys | Single |  | eigenes Rezept |
| 516 | HIPHOP/VINTAGE | Split Lounge | bass | Split |  | eigenes Rezept |
| 601 | RETRO | Poly Brass | chord | Single |  | eigenes Rezept |
| 602 | RETRO | Sync Rider | lead | Single | Delay-Sync | eigenes Rezept |
| 603 | RETRO | Square Run | arp | Single | Arp, Delay-Sync | eigenes Rezept |
| 604 | RETRO | Ladder Low | bass | Single |  | eigenes Rezept |
| 605 | RETRO | Polysweep | pad | Single |  | eigenes Rezept |
| 606 | RETRO | Chip Arp | arp | Single | Arp | eigenes Rezept |
| 607 | RETRO | Chip Lead | lead | Single |  | eigenes Rezept |
| 608 | RETRO | Space Seq | seq | Single | Seq, Delay-Sync | eigenes Rezept |
| 609 | RETRO | Disco Octave | bass | Single | Arp | eigenes Rezept |
| 610 | RETRO | Lush Strings | pad | Single |  | eigenes Rezept |
| 611 | RETRO | Sync Sweep | lead | Single | Delay-Sync | eigenes Rezept |
| 612 | RETRO | Synth Toms | drum | Single | Arp | eigenes Rezept |
| 613 | RETRO | Pioneer Seq | seq | Single | Seq, Delay-Sync | eigenes Rezept |
| 614 | RETRO | Laser Zap | fx | Single | Delay-Sync | eigenes Rezept |
| 615 | RETRO | Combo Organ | keys | Single |  | eigenes Rezept |
| 616 | RETRO | Brass+Bows | chord | Dual |  | eigenes Rezept |
| 701 | S.E./HIT | Big Hit | hit | Dual | Delay-Sync | eigenes Rezept |
| 702 | S.E./HIT | Impact | hit | Single | Delay-Sync | eigenes Rezept |
| 703 | S.E./HIT | White Riser | fx | Single |  | eigenes Rezept |
| 704 | S.E./HIT | Downlifter | fx | Single | Delay-Sync | eigenes Rezept |
| 705 | S.E./HIT | Alarm | fx | Single |  | eigenes Rezept |
| 706 | S.E./HIT | Zap Gun | fx | Single | Delay-Sync | eigenes Rezept |
| 707 | S.E./HIT | Far Storm | fx | Single |  | eigenes Rezept |
| 708 | S.E./HIT | Wind Gust | fx | Single |  | eigenes Rezept |
| 709 | S.E./HIT | Robot Chat | seq | Single | Seq | eigenes Rezept |
| 710 | S.E./HIT | Saucer | fx | Single |  | eigenes Rezept |
| 711 | S.E./HIT | Glitch Hit | seq | Single | Seq | eigenes Rezept |
| 712 | S.E./HIT | Bubbles | seq | Single | Seq, Delay-Sync | eigenes Rezept |
| 713 | S.E./HIT | Ping Storm | arp | Single | Arp, Delay-Sync | eigenes Rezept |
| 714 | S.E./HIT | Chop Stab | seq | Single | Seq | eigenes Rezept |
| 715 | S.E./HIT | Sci-Fi Arp | arp | Single | Arp, Delay-Sync | eigenes Rezept |
| 716 | S.E./HIT | Crash Noise | hit | Single |  | eigenes Rezept |
| 801 | VOCODER | Robo Voice | voc | Vocoder | E2 = Mikrofon, Kanal-Paare | eigenes Rezept |
| 802 | VOCODER | Choir Voc | voc | Vocoder | E2 = Mikrofon, Kanal-Paare | eigenes Rezept |
| 803 | VOCODER | Whisper Voc | voc | Vocoder | E2 = Mikrofon | eigenes Rezept |
| 804 | VOCODER | Talkbox Ld | voc | Vocoder | Delay-Sync, E2 = Mikrofon | eigenes Rezept |
| 805 | VOCODER | Voc Arp | voc | Vocoder | Arp, Delay-Sync, E2 = Mikrofon | eigenes Rezept |
| 806 | VOCODER | Voc Strings | voc | Vocoder | E2 = Mikrofon, Kanal-Paare | eigenes Rezept |
| 807 | VOCODER | Metal Voc | voc | Vocoder | E2 = Mikrofon | eigenes Rezept |
| 808 | VOCODER | Deep Voc | voc | Vocoder | E2 = Mikrofon, Kanal-Paare | eigenes Rezept |
| 809 | VOCODER | Bright Voc | voc | Vocoder | Arp, E2 = Mikrofon | eigenes Rezept |
| 810 | VOCODER | Gate Voc | voc | Vocoder | Arp, Delay-Sync, E2 = Mikrofon | eigenes Rezept |
| 811 | VOCODER | Wah Voc | voc | Vocoder | Delay-Sync, E2 = Mikrofon | eigenes Rezept |
| 812 | VOCODER | Pad Voc | voc | Vocoder | E2 = Mikrofon, Kanal-Paare | eigenes Rezept |
| 813 | VOCODER | Voc Bass | voc | Vocoder | Arp, E2 = Mikrofon | eigenes Rezept |
| 814 | VOCODER | Wide Voc | voc | Vocoder | E2 = Mikrofon, Kanal-Paare | eigenes Rezept |
| 815 | VOCODER | Echo Voc | voc | Vocoder | Arp, Delay-Sync, E2 = Mikrofon, Kanal-Paare | eigenes Rezept |
| 816 | VOCODER | Sing Arp | voc | Vocoder | Arp, Delay-Sync, E2 = Mikrofon, Kanal-Paare | eigenes Rezept |
