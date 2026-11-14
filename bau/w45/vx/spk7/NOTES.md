# SPK7 – NOTES (Klangkorn, Teil 1 Kern + Teil 2 Bedienung)

`index.html` = basis.html (4.60.0, = basis5) + Block `SPK7-BEGIN … SPK7-END` direkt nach `/* INT53D-END */` (Quellen `spk7-kern.js` + `spk7-main.js`
+ `spk7-blatt.js`) + 6 Haken „SPK7“ (je eine Zeile mit typeof-Schutz). Bau: `python3 einbau.py` (jede Ersetzung genau 1×, bricht sonst ab). VERSION/CHANGES unberührt.

## Haken (je eine Zeile)
1. `spawnVoice` nach `const snd0 = …`: Klang mit `p.wt.h` → `spk7Voice` (Proxy-Stimme wie die Worklet-Stimmen, `WkVoiceProto`).
2. `normWt` nach `w = …`: `p.wt.h` bleibt beim Normalisieren erhalten (`spk7NormWt`, Werte geprüft/geklemmt).
3. `tkUsedIds` vor `return`: Klangkorn-Takes gehören zum Projekt (Container-ZIP `takes/<id>.wav`, Aufräumen löscht sie nicht).
4. `spk1Build` nach der Zeile mit „Ansicht ▾“: Werkzeugleiste „Klangkorn ▾“ + Tastatur-Listener (`spk7Ui`).
5. Kopf `spk1Tone`: im Klangkorn-Modus kein Probeton (Halten/Loslassen macht `spk7Ky`).
6. (Teil 2) `spk1BtnState` nach der SPK3-Zeile `spk3LpBtn`: `spk7Btn(U)` – Knopf „Als Klangkorn“ frei/gesperrt wie die anderen Auswahl-Aktionen.

## Entscheidungen
- Quelle: dieselbe Rechnung wie „▶ Auswahl“ (op `block` mit `sel`, Quelle = Original oder gewählte Ebene). Ohne Auswahl, aber mit gewählter
  Ebene: sichtbarer Bereich der Ebene. ≤ 10 s, leise Ränder weg, Spitze 0,9, 5 ms Blende. Grundton: YIN (16–24 Fenster, Median); nicht
  erkannt → C4 (Text sagt „nicht erkannt“). Kein Kern-Haken im Worker nötig (kein Konflikt mit SPK4/5/6 im Worker-Text).
- Engine `spk7CoreMake(SR)`: ein Text für AudioWorklet (Blob-Modul), Rückfall ScriptProcessor (auch Offline-Kontexte), Node-Test.
  Körnchen: je Stimme bis 12 Körner, Tukey-Fenster (Kornform, Flanken ≥ 2 ms), Ort = Position + Bewegung (auch rückwärts) + Streuung,
  **tonsynchron**: jedes Korn startet phasengleich zum Grundton (sonst Kamm im Korn-Takt → Tonhöhe falsch, gemessen +13 ct), Pegel
  kohärent normiert. Spektral-Schleife: 8 eingefrorene Spektren (je 16384, eine Zufallsphase je Zeile für alle Bilder → Überblenden
  ohne Auslöschung), Grundton auf eine ganze Zeile gedehnt + Faktor fk beim Abspielen (sonst ±1,5 Hz Raster, gemessen +11 ct).
  Je Stimme: ADSR, Tiefpass (TPT-SVF) + Resonanz, Breite; Lautstärke/Breite/Bild-Ort gleiten (keine Sprünge bei Reglern);
  16 Stimmen-Plätze, Polyfonie 8 (Abgabe mit 6 ms Blende); weiche Grenze erst über 0,8; Pegel 0,4 je Stimme (Reserve für Akkorde).
  Ereignisse auf die Probe genau (Zeit → Bild); Wartendes geht beim Bau des Worklets über processorOptions mit (offline sonst zu spät).
- Tastatur links: Schalter „Probeton | Klangkorn“ im Klappfenster „Klangkorn ▾“ (Werkzeugleiste, nach „Ansicht ▾“); die Ecke über
  den Tasten zeigt dann „KORN“ (Bernstein). Tipp = kurzer Ton, Halten = Ton hält, Ziehen ≥ 8 px = rollen wie bisher (Ton aus).
  Modus + Regler bleiben im Gerät (localStorage `synq-spk7`, nur Bequemlichkeit).
- Als Instrument: Audio als Take (`tkAddPcmTake`, Quelle 'import'), neue Synth-Spur, Klang `engine 'wt'` mit `p.wt.h = {take, f0,
  art, pos, bew, gs, dc, spo, spt, form, a, d, s, r, fc, q, br, vol, poly}` – ein App-↶ (`imp1Step`). Die Spur spielt über eine eigene
  Klangkorn-Engine an `trackIn` (Spur-FX/Mischer wirken), Noten aus Song/Matrix/Tastatur mit Zeitstempel. Ältere Fassungen ohne SPK7
  spielen die Spur als normale Wavetable (Tabelle „vocal“) – kein Fehler.

## Tests
- `spk7-kern-test.mjs <abs index.html>` (Node, Kern aus der fertigen Datei): ALLES OK (7) – Grundton, Tonhöhe Körnchen (±0,1 ct),
  Schwerpunkt Sägezahn (Quelle 436 Hz, Taste A3 435, A4 870 = ×2,00), Spektral-Schleife (±0,1 ct), keine Klicks (Sprung ≤ 0,94 × ω·Spitze,
  Grenze 1,5; 6 Läufe inkl. Abgabe/Schnell-Aus/Regler), CPU 8 Stimmen × 5 s = 96 ms / 311 ms (schwer) / 96 ms (Schleife), Polyfonie 8.
- (Teil 1, Test inzwischen durch die Abnahme unten ersetzt) `spk7-test.mjs` (Playwright, Touch): ALLES OK (10) – Pinsel → Quelle, Tastatur halten (Worklet, RMS), Regler +
  Spektral-Schleife, Probeton-Modus, Als Instrument + ↶/↷, Spur-Stimme, Worklet/Rückfall offline (220,02 / 440,02 Hz), CPU im Browser
  (Worklet offline 8 × 5 s = 114 ms), Speichern/Laden (JSON gleich, ZIP mit takes/<id>.wav, Audio aus dem Gerätespeicher), quer 926×428.

## Offen (Stand nach der Prüfer-Runde)
1. Klang-Editor einer Klangkorn-Spur: zeigt weiter die Wavetable-Seite. Position, Cutoff, Resonanz, Hüllkurve und Stimmen wirken jetzt
   auf das Klangkorn; Tabelle und Scan wirken nicht. Eine eigene Klangkorn-Seite im Editor wäre sichtbar neu → im Funk vorschlagen.
2. Erster Ton nach dem Laden eines Projekts kann still sein, bis das Audio aus dem Gerätespeicher geholt ist (einige 10 ms; Spektren jetzt im Worker).
3. (erledigt) Song-Export: Einsatz 4,7 ms gegen 0,5 ms bei einer normalen Synth-Spur (Anschlag 2 ms, Schwelle 10 %; vorher 16 ms später).
4. (erledigt) Hilfe-Eintrag.
5. **Vorschlag für den Funk:** Knopf „Als Klangkorn“ als 3. Zeile im Aktionsfeld (hochkant Ebenenliste 180 → 129 px, nach „Zerlegen“ 2 statt 3
   Ebenen ganz sichtbar; quer 284 → 236 px). Gebaut hinter `SPK7_ROW = false`; ohne Freigabe bleibt das Layout wie in der Basis.
   Ebenfalls sichtbar: „Klangkorn ▾“ am Ende der Werkzeugleiste (hochkant nur per Wischen erreichbar) – ohne diesen Knopf gäbe es keinen Weg.

## Teil 2 – Bedienung (Entscheidungen)
- **Knopf „Als Klangkorn“** im Aktionsfeld (neben ▶ Auswahl / In Ebene / Verwerfen / Zerlegen / Verfeinern), als 3. Zeile über die volle Breite
  (das 3×2-Feld war voll; 4 Spalten passen quer nicht: 61 px je Knopf). Die Zeile kommt aus der Ebenenliste, NICHT aus dem Spektrum:
  hochkant Spektrum 464 px wie vorher, Ebenenliste 180 → 129 px; quer Spektrum 310 px wie vorher, Ebenenliste 284 → 236 px.
  **Sichtbare Änderung → im Funk vorschlagen** (Xander kann sie ablehnen; dann bliebe nur „Klangkorn ▾“ in der Werkzeugleiste).
  Frei mit Auswahl oder gewählter Ebene (Haken 6). Tipp: Auswahl holen → Tastatur links auf Klangkorn → Blatt auf.
- **Klangkorn-Blatt** = Klappfenster der Spektral-Seite (`spk1Dd`, Bausteine wie „Klang nachbauen“: h5, Bild, mbtn, makeSeg, Regler, Spur-Chips).
  Öffnet aus „Als Klangkorn“ und „Klangkorn ▾“. Hochkant ab x = 48, damit die Tasten links sichtbar bleiben und mitleuchten.
  Inhalt: Quellbild (kleines Spektrogramm der Quelle, Farben `spk1Lut`, auf den Frequenzbereich mit Energie gezoomt, Grenzen in Hz/kHz),
  Marker = Position (ziehen/tippen, Band = Streuung Ort, ◀/▶ = Bewegung) · Quelle-Text + „Aus Auswahl holen“ + „▶ Vorhören“ (hält den
  Grundton bis „■ Stopp“, endet mit dem Blatt / nach 30 s) · Mini-Tastatur 2 Oktaven (Okt −/+, startet so, dass der Grundton der Quelle
  in der oberen Oktave liegt; Gleiten wechselt den Ton, mehrere Finger = Akkord) · „✓ Auf Tastatur links“ (an/aus) · Modus
  „Körnchen | Schleife“ · Regler Position, Bewegung, Korngröße, Dichte, Streuung Ort/Ton, Kornform, Anschlag, Abfall, Halten, Ausklang,
  Filter, Resonanz, Breite, Lautstärke · „Als Instrument in Spur …“ (Chips „+ Neue Spur“ und alle Synth-Spuren, Klangkorn-Spuren mit
  „· Korn“) + „Als Instrument (neue Spur)“ / „Als Instrument in <Spur>“.
- Mini-Tastatur: Tasten 21–24 px breit, 76 px hoch (2 Oktaven in 300–340 px; Tasten sind keine Knöpfe – Gleiten macht sie spielbar).
  Alle Knöpfe im Blatt ≥ 36 px (Test zählt 0 kleinere, hoch und quer).
- **Ecke über den Tasten** = Umschalter: „TON“ (Probeton) | „KORN“ (Bernstein, Strich darunter). Trefferfläche 40 × 44 px (wie alle Knöpfe der Seite, SPK2-Layoutregel ≥ 44 px; reicht 18 px
  über die obersten Tasten, C10-Bereich). Ohne Quelle und ohne Auswahl: Hinweis in der Statuszeile statt Umschalten. Modus wird nicht mehr gemerkt
  (ohne Quelle hätte „KORN“ nach dem Neuladen nur den Probeton gespielt).
- **Leuchtende Tasten**: jede Klangkorn-Note (Tastatur links, Mini-Tastatur, Vorhören) leuchtet auf der Mini-Tastatur (Klasse `on`) und
  links als Bernstein-Balken (Überlage `.spk7-lt` im Tasten-Streifen, folgt dem Rollen per rAF solange etwas leuchtet).
- **Als Instrument in vorhandene Spur**: Klang der Spur wird Klangkorn (ein App-↶ `imp1Step`, ↶ stellt den alten Klang her). Gleiche Quelle
  = gleicher Take (kein doppeltes Audio). So lassen sich Regler einer Klangkorn-Spur nachträglich ändern: Spur-Chip wählen, übernehmen.

## Abnahme (Teil 2)
Lauf 19:05 auf der fertigen `index.html` (nach `python3 einbau.py`), alles nacheinander (kein Parallel-Lauf):
- **`spk7-test.mjs`** (Playwright, Touch, 428×926 + 926×428): **ALLES OK (13)** – `spk7-test.json`, Ausgabe `spk7-test.out`
  1. als-klangkorn-knopf-blatt: vor der Auswahl gesperrt, nach Pinsel frei (416×44, im Aktionsfeld); Quelle 5,7 s, Grundton D#5 (638 Hz);
     Tastatur links → KORN; Blatt im Bild (48…388 × 8…864); Quellbild Kontrast 691; 24 Tasten. Spektrum 464 px (wie vorher), Ebenenliste 129 px.
  2. marker-ziehen-position: Ziehen 30 % → 72 % ⇒ pos 0,72, Regler 0,72, Anzeige „72 %“.
  3. mini-tastatur-spielen-gleiten: C4 halten RMS 0 → 0,0115, leuchtet im Blatt UND links; Gleiten bis C5 → leuchtet nur C5, RMS 0,019;
     loslassen → 0, nichts leuchtet. Tasten 23 × 76 px.
  4. tastatur-links-halten-leuchtet: Halten RMS 0,0103 (Worklet), Bernstein-Balken genau über dem gehaltenen Ton (m 68, y 350 in 347…352); los → 0.
  5. ecke-umschalter: 40 × 44 px; TON → Tipp auf Taste spielt kein Klangkorn; wieder KORN.
  6. regler-schleife-vorhoeren: gs 0,25, Dichte 6, Filter 0,7, Breite 0,9, Anschlag, Ausklang 0,8 in der Engine; Schleife + Vorhören RMS 0,025,
     Knopf „■ Stopp“, danach 0.
  7. als-instrument-neue-spur: 6 → 7 Spuren (Klang wt, p.wt.h mit gs 0,25/fc 0,7, Take im Projekt + tkUsedIds), ↶ 6, ↷ 7, Chip „✓ Korn Original · Korn“.
  8. als-instrument-vorhandene-spur: Synth 1 (analog „Moog-Bass“) → Klangkorn, gleiche Spurenzahl, GLEICHER Take; ↶ = wieder analog „Moog-Bass“, ↷ Klangkorn.
  9. im-song-abspielen: Clip mit 4 Noten auf der Klangkorn-Spur, launchClip + Wiedergabe: RMS max 0,0122, bis 2 Stimmen (Quelle „clip“), Spur-Engine
     Worklet; Stopp → RMS 0,00005, 0 Stimmen.
  10. messwerte-teil1-tonhoehe-cpu (erneut): Körnchen Worklet 220,03 / 440,03 Hz (+0,24 / +0,12 ct), Rückfall 220,02 / 440,02 (+0,16 / +0,08 ct),
      Schleife 219,6 / 440,03 (−3,2 / +0,1 ct; Grenze ±10 ct), CPU Worklet offline 8 Stimmen × 5 s = 174 ms (Grenze 1250).
  11. speichern-laden: p.wt.h nach serialize → importJSON gleich, ZIP mit takes/<id>.wav, Audio 249986 Proben aus dem Gerätespeicher, Spur klingt (RMS 0,0076).
  12. quer-bedienbar 926×428: Knopf 255×44 im Feld, Ecke 40×44, Spektrum 310 px (wie vorher), Ebenenliste 236 px; Blatt im Bild, 15 Knöpfe, 0 unter 36 px;
      Mini-Tastatur quer spielt (RMS 0,0119, leuchtet), los → 0.
  13. keine-fehler: Konsole leer.
- **`spk7-kern-test.mjs`** (Node, Kern aus index.html): **ALLES OK (7)** – Grundton 440,02/220/110/0; Körnchen 220,01/439,99/659,26/880,00 Hz
  (≤ 0,05 ct); Schwerpunkt Säge 436 → A3 435 / A4 870 (×2,00); Schleife 439,99/880,00; Klicks max 0,94 (Grenze 1,5); CPU 84/156/65 ms; Polyfonie 8.
- Fotos: `fotos/spk7-10-als-klangkorn-hochkant.png`, `-11-mini-tastatur`, `-12-tasten-links-leuchten`, `-13-spurwahl`, `-14-quer-blatt`,
  `-15-quer-spielen`, `-16-quer-gesamt`, `-17-hochkant-gesamt` (Fotos 01–03 von Teil 1 entfernt: altes Klappfenster).
- **Pflicht**: topdefs Skripte 26, doppelt 0, Syntaxfehler 0 · dupkeys 0 · smoke errors [] (`smoke-a2.png`) · „MS 2000“ 1× (Basis 1×) ·
  „  live: true,“ 1× · vwStart 3× · Krypto-grep 0 · Markenwörter alle 21 = Basis, 0 im Paket (Quellen, Tests, NOTES, LOG, KARTE).
- **Regression**: spk1-test ALLE OK. spk3-test 13 OK / 4 FEHLER = die drei offenen SPK3-Ziele mit denselben Zahlen wie auf basis5
  (bass 3,01/4 · verfeinern +0,52 · mehrstimmig 0/28) + nachbau-abstaende-besser „2,13 → 2,13, schlechter []“ (gleich gut; im Lauf davor OK –
  Zufall des Optimierers, SPK7 berührt den Nachbau nicht). layout-3-groessen OK, regression-spk2-test 29/30 (bekannt: zerlegen-bass-ziel).
  Der erste Lauf fand den 38-px-Eckknopf (SPK2-Regel ≥ 44 px) → behoben.

## Prüfung (Prüfer-Runde, PRUEFUNG.md: 1 schwer, 6 mittel, 8 leicht)
Jeder Befund erst nachgestellt (alte Fassung = Nachbau des Prüfers `pruef-spk7/rebuild.html`), dann behoben, dann Test ergänzt.
Neue Tests: `spk7-kern-test.mjs` +5 (Node, Kern aus index.html) und `spk7-pruef-test.mjs` (12, Browser, Touch, 428×926).

| # | Befund | Stand | Nachweis neu (alt) |
|---|---|---|---|
| 1 | NaN bei Quellwechsel mit klingender Note | behoben: jede Stimme behält ihre Quelle bis zum Ende; Filterzustand und Summe nie NaN; Vorhören läuft mit der neuen Quelle weiter | Kern 0 NaN (230 400); Nutzerweg wie pr9: 0 NaN in 163 840 Proben hinter der Master-Kette |
| 2 | Knackser Modus/Filter | behoben: Moduswechsel blendet die Stimme 6 ms aus und wieder ein; Filter läuft immer, Grenzfrequenz/Resonanz gleiten 12 ms, „offen“ blendet 10 ms auf trocken | Kern 1,02 / 1,01 / 1,10 / Resonanz 1,03 (43,6 / 33,5 / 26,4 / 25,0); Browser 1,0 / 1,0 / 1,0 |
| 3 | Position wirkt nicht bei klingender Note | behoben: Position folgt live, Bewegung bleibt | Kern 1200/300-Anteil 0 → 16 644 (0 → 0); Browser Vorhören + Marker ziehen: Schwerpunkt 360 → 832 Hz |
| 4 | Klang-Editor / Engine-Wechsel | behoben: andere Engine = normaler Klang, zurück auf WT = Klangkorn; Position, Cutoff (Hz), Resonanz, Hüllkurve, Stimmen aus dem Klang wirken. Rest siehe Offen 1 | Browser: Cutoff 300 Hz → fc 0,32, VA/FM kein Korn, WT Korn |
| 5 | „Als Klangkorn“ blockiert die Seite | behoben: Grundton, Spektren und Quellbild im eigenen kleinen Worker (Blob, erst bei Bedarf; Rückfall im Hauptfaden). Nicht im Spektral-Worker, damit SPK4/5/6 dort ohne Konflikt einbauen. Laden eines Projekts ebenso | 5,7-s-Auswahl: 0 Longtasks (282 + 94 ms); 10-s-Quelle: 0 Longtasks, 142–162 ms im Worker (108 + 44 + 59 ms im Hauptfaden) |
| 6 | Rollen links macht Ton | behoben: Ton erst nach 70 ms ohne Bewegung (Halten); Tipp = kurzer Ton beim Loslassen | Rollen 16,8 Ht: Spitze 0 (0,208); Tipp 0,22 |
| 7 | Layout ohne Freigabe | zurückgenommen: Aktionsfeld + Ebenenliste wie Basis (hochkant 96/180 px, quer 284 px). Weg: „Klangkorn ▾“ holt eine neue Auswahl, Tastatur links → KORN, Blatt auf. Zeile im Aktionsfeld = Vorschlag (Offen 5) | spk7-test 1 + 12 |
| 8 | Ecke überdeckt 18 px Tasten | behoben: Druck unter der Tasten-Oberkante geht an die Tasten (Ton/Rollen), oben schaltet die Ecke um (44 px bleibt) | Tipp 8 px unter Oberkante: Modus bleibt, Ton klingt |
| 9 | Überlast / volle Akkorde | behoben: Stimmen-Raub mit 4-ms-Blende (Note wartet so lange); gleiche Taste neu blendet den alten Ausklang 30 ms aus; Pegel-Ausgleich √(2/Σ Hüllkurve²), gleitet 10 ms | Sprung 0,90 (3,04), Spitze 0,65 (1,0); 8-Stimmen-Akkord 0,74 (0,99) – unter der weichen Grenze. Folge: Akkorde ab 3 Stimmen leiser als vorher |
| 10 | Einsatz weich und spät | behoben: Körner beim Anschlag vorgefüllt (wie eingeschwungen) | 50 % nach 2 ms bei Anschlag 2 ms (26 ms); Anschlag 0,3 s → 219 ms; Song-Export 4,2 ms nach der Synth-Spur (16 ms) |
| 11 | 8 Spuren: Knopf + verwaister Take | behoben: Knopf „Keine Spur frei – oben wählen“ gesperrt; Prüfung vor dem Take | Takes 1 → 1, Spuren 8 → 8 |
| 12 | „↶ macht es rückgängig“ | behoben: Statuszeile „Rückgängig im Hinweis unten“ (der Hinweis hat ↶). Spektral-Kopf-↶ unverändert (Basis-Muster, auch „Klang nachbauen“) | Browser b11-b12 |
| 13 | Halten quadratisch, Regler, schwarze Tasten | behoben: Halten-Ziel √s (80 % → 0,800); Korngröße/Dichte/Streuung Ton/Kornform im Schleife-Modus ausgeblendet; schwarze Tasten 16 px (14) | Kern + Browser b13 |
| 14 | Listener / Spur-Engines | behoben: visibilitychange nur einmal; Spur-Engines ohne Klangkorn-Spur und ohne Stimme nach ≥ 3 s abgebaut (Worklet endet, Rückfall getrennt) | 1 → 0 Engines nach Klangwechsel |
| 15 | Hilfe fehlt | behoben: „Wo finde ich …?“ → „Klangkorn (Auswahl als Instrument)“ | Suche „klangkorn“ → Eintrag |

Weitere Entscheidungen dieser Runde:
- Kern: Quelle als Objekt je Stimme (`v.S`); Filter immer an (CPU Node 8 × 5 s: 109–119 / 170–272 / 87–113 ms, Grenze 1250).
- Test-Aufnahme im Browser: Lücken der ScriptProcessor-Aufnahme (Hauptfaden zu spät) werden erkannt; Sprünge genau an so einer Naht zählen nicht
  (ein Lauf zeigte sonst 19,4 an einer Puffer-Naht; der Kern-Test misst ohne diese Unsicherheit).
- Keine neuen Haken, einbau.py unverändert (6 Haken + Block); `SPK7_ROW` steht im Block.

Regression und Pflicht dieser Runde (index.html = `python3 einbau.py`, byte-gleich geprüft; basis.html = basis5):
- spk7-kern-test ALLES OK (12) · spk7-test ALLES OK (13) · spk7-pruef-test ALLES OK (12) · spk1-test ALLE OK
- spk3-test 13 OK / 4 FEHLER: dieselben vier wie beim Bauer und beim Prüfer, gleiche Zahlen (bass 3,01/4 · verfeinern +0,52 · mehrstimmig 0/28 ·
  Nachbau 2,13 → 2,13 gleich gut); layout-3-groessen OK, spk2 29/30 (bekannt). SPK7 berührt Spektral-Kern, Worker-Text und Nachbau nicht.
- topdefs 26/0/0 · dupkeys 0 · smoke errors [] · MS 2000 1× · live 1× · vwStart 3× · Krypto 0 · Markenwörter = Basis, 0 im Paket.
