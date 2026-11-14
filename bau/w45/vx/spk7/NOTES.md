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
- `spk7-test.mjs <abs index.html>` (Playwright, Touch): ALLES OK (10) – Pinsel → Quelle, Tastatur halten (Worklet, RMS), Regler +
  Spektral-Schleife, Probeton-Modus, Als Instrument + ↶/↷, Spur-Stimme, Worklet/Rückfall offline (220,02 / 440,02 Hz), CPU im Browser
  (Worklet offline 8 × 5 s = 114 ms), Speichern/Laden (JSON gleich, ZIP mit takes/<id>.wav, Audio aus dem Gerätespeicher), quer 926×428.

## Offen
1. Klangkorn-Werte einer Spur: über das Blatt (Spur-Chip wählen → übernehmen, ein ↶). Der Klang-Editor der Spur kennt p.wt.h noch nicht
   (zeigt die Wavetable-Seite); eigene Klangkorn-Seite im Klang-Editor wäre ein Folgeschritt.
2. Erster Ton nach dem Laden eines Projekts kann still sein, bis das Audio aus dem Gerätespeicher geholt ist (einige 10 ms).
3. Offline-Export (Video/WAV): Spur-Engine im Offline-Kontext = ScriptProcessor-Rückfall (in Chromium geprüft über spk7Render); der
   Song-Export selbst ist noch nicht mit einer Klangkorn-Spur gemessen.
4. Guide-Text (Hilfe) fehlt noch.
5. Sichtbare Änderung Aktionsfeld/Ebenenliste (siehe Teil 2) – vorschlagen, Xander entscheidet.

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
- **Ecke über den Tasten** = Umschalter: „TON“ (Probeton) | „KORN“ (Bernstein, Strich darunter). Trefferfläche 40 × 38 px (reicht 12 px
  über die obersten Tasten). Ohne Quelle und ohne Auswahl: Hinweis in der Statuszeile statt Umschalten. Modus wird nicht mehr gemerkt
  (ohne Quelle hätte „KORN“ nach dem Neuladen nur den Probeton gespielt).
- **Leuchtende Tasten**: jede Klangkorn-Note (Tastatur links, Mini-Tastatur, Vorhören) leuchtet auf der Mini-Tastatur (Klasse `on`) und
  links als Bernstein-Balken (Überlage `.spk7-lt` im Tasten-Streifen, folgt dem Rollen per rAF solange etwas leuchtet).
- **Als Instrument in vorhandene Spur**: Klang der Spur wird Klangkorn (ein App-↶ `imp1Step`, ↶ stellt den alten Klang her). Gleiche Quelle
  = gleicher Take (kein doppeltes Audio). So lassen sich Regler einer Klangkorn-Spur nachträglich ändern: Spur-Chip wählen, übernehmen.

## Abnahme (Teil 2)
