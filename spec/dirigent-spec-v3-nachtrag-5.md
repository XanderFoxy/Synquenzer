# SYNQUENZER v3 — Nachtrag 5: Gesang 2 und Video-Ausgabe (Xander 31.10.)

Status: **gilt für den Bau.** Xander 31.10.: „Der Gesang hat Priorität, aber dann soll das gleich mit dem Video kommen. Oder mach es
wieder parallel. Credits sind genug da.“ Seine Wünsche wörtlich: `fragen-xander-9.md`, Abschnitt „31.10.“. Abgleich mit der alten
Roadmap: `roadmap-nachtrag-5-entwurf.md`.

**Regel 27 gilt:** nur bauen, was hier steht; keine eigenen Namen, Zusatzfunktionen oder Gestaltung. Unklares → „Fragen an Xander“
im Changelog. Nötiges aus der Fehlerliste (Tasten ≥ 44 × 44, nichts abgeschnitten, kein Layout-Sprung, kein Knacken) ohne Rückfrage.
**Vorrang immer:** schnelle Seite, flüssige Bedienung, kein Aussetzer im Ton (iPhone 12 Pro Max).
Format bleibt 5 (nur additive Felder). Version der Welle 1: **4.25.0** (`APP_CODE` 4 025 000), Welle 2: **4.26.0**.

## Wellen und Zweige

| Welle | Zweig (Kopie ab 4.23.0 `vs-base-B.html`) | Pakete (nacheinander im Zweig) |
|---|---|---|
| 1 | `n5-br-V` | **VV1** Song-Video → **VV2** Video-Regie + 9:16-Kamera → **VV3** Innenleben |
| 1 | `n5-br-H` | **VC2a** Verlauf-Rekorder (Spec: Nachtrag 1, Abschnitt „VC2a — Verlauf-Rekorder“, unverändert) |
| 1 | `n5-br-G` | **G1** Quantisieren prüfen + sichtbar → **G2** Tonhöhe quantisieren |
| 2 | nach 4.24.0 (Nachtrag 4) auf der Hauptlinie | **G3** Vorlauf/Ausklang → **G4** Gesangs-Effekte |

Welle 1 läuft gleichzeitig mit dem Bau von Nachtrag 4 (VS-L, VS-P). Danach führt der Dirigent zusammen.

---

## VV1 — Song-Video (Bild und Ton getrennt)

**Grundsatz.** Ton = der fertige Song, offline gerendert mit derselben Klangerzeugung wie live (Synths, MS 2000, FM, Drums,
Stimme/Takes, Effekte, Master), dazu der **Ausklang** nach dem letzten Takt (bis der Pegel < −60 dBFS fällt, höchstens 10 s).
Bild = eine eigene **Video-Bühne** (Canvas), die die Ansichten der App in deren Farben und Schrift zeichnet, berechnet aus dem
Song-Zeitstrahl zum Zeitpunkt t (Teil, Takt, spielende Clips, Noten). **Nichts wird beim Rendern verstellt; der Klang ändert sich
nicht.** Kein Bildschirm-Mitschnitt, keine DOM-Kopie.

1. **Menü → „Video“** öffnet das Blatt „Video“: Format **[9:16] [16:9]** (1080 × 1920 bzw. 1920 × 1080, 30 fps), Bild
   **[Auto] [Song] [Matrix]**, Bereich **ganzer Song** bzw. die gelbe Auswahl, **[▶ Vorschau]** (spielt Bild + Ton im Blatt in
   Echtzeit, Stopp jederzeit), **[Video erstellen]** mit Fortschritt und [Abbrechen]. Danach: Teilen (`navigator.share` mit Datei)
   bzw. Sichern; in der Claude-App über die erlaubten Download-Wege (Typen laut `downloads.d.ts`, sonst ZIP).
2. **Bild „Song“:** Song-Ansicht mit Teilen (gelbe Kopfzeilen), Spuren/Lanes, Laufband (Abspielposition) – das Bild läuft mit.
   **Bild „Matrix“:** Clip-Matrix (Spuren × Szenen), spielende Clips leuchten im Takt, Noten der spielenden Clips als kleine Rolle.
   **Bild „Auto“:** wechselt nach dem Auto-Regisseur (VV2).
3. **Kodierung:** WebCodecs `VideoEncoder` H.264 + `AudioEncoder` AAC in MP4 (kleiner eingebetteter MP4-Muxer, Lizenz im Quelltext),
   schneller als Echtzeit, Bilder gestreamt (nie alle im Speicher). Fehlt WebCodecs oder AAC: Rückfall MediaRecorder in Echtzeit
   (Canvas-Stream + Song-Ton) mit Typwahl wie VC2c (`video/mp4…`, sonst `video/webm`); der gewählte Weg steht im Blatt.
4. **Ton = live:** Der Offline-Ton stimmt mit dem Live-Klang überein (Pegel ±0,5 dB, gleiche Noten/Takes, keine fehlende Spur).
5. Projekt bleibt unverändert (Video-Einstellungen des Blatts im Geräteprofil, nicht im Projekt; Regie siehe VV2).

**Abnahme VV1**
- [ ] VV1-01 Demo-Song, 16:9 und 9:16: MP4 (bzw. Rückfall-Typ) mit Bild- und Tonspur, Dauer = Songlänge + Ausklang ±0,1 s, Container
      geparst, Bildgröße und 30 fps stimmen.
- [ ] VV1-02 Ausklang: Song endet mit Hall/Delay-Fahne → Video läuft weiter, bis < −60 dBFS (≤ 10 s); kein harter Schnitt im Ton.
- [ ] VV1-03 Ton = live: Offline-Render gegen Echtzeit-Mitschnitt desselben Songs: Lautheit ±0,5 LU, alle Spuren hörbar (je Spur
      solo geprüft), Takes/Stimme dabei.
- [ ] VV1-04 Bild folgt dem Song: Laufband im Bild bei Takt n genau zur Zeit von Takt n (±1 Bild); spielende Clips im Matrix-Bild
      = `R.slot` zu dieser Zeit.
- [ ] VV1-05 Geschwindigkeit: 3-min-Song 9:16 mit WebCodecs in Chromium schneller als Echtzeit (Messung im Changelog); kein langer
      Task > 50 ms im Hauptfaden während des Renderns außer dem Kodieren in Häppchen; Bedienung bleibt (Abbrechen wirkt ≤ 300 ms).
- [ ] VV1-06 Klang unverändert: Projekt deep-equal vor/nach dem Rendern; Live-Wiedergabe danach bitgleich zur Wiedergabe davor.
- [ ] VV1-07 Blatt in P1, P2, P3, L1, L2, 926 × 428: alles im Bild, ≥ 44 × 44, kein Layout-Sprung.
- [ ] VV1-08 Rückfall-Tor: ohne `VideoEncoder` (im Test gelöscht) → MediaRecorder-Weg mit Typ; ohne beides → Knopf grau mit Grund.

## VV2 — Video-Regie (optional, im Song vorbereitet) + 9:16-Kamera

1. **Regie im Song** (zusätzliche, optionale Angaben; ohne sie macht der Auto-Regisseur alles):
   - Tipp auf die **gelbe Kopfzeile eines Teils** → im vorhandenen Teil-Blatt eine Zeile **„Video“**: [Auto] [Song] [Matrix] [Spur …]
     (Spur-Wahl öffnet die Liste der Spuren des Teils).
   - Gelbe **Taktauswahl** im Song → im vorhandenen Bereichs-Blatt dieselbe Zeile „Video“ für genau diese Takte.
   - **Clip im Teil** (Lane-Eintrag halten → vorhandenes Blatt) → „Im Video zeigen“ = Spur-Bild dieses Clips für seine Takte.
   - Gespeichert additiv im Song: `song.video = [{a, b, v: 'auto'|'song'|'matrix'|'spur', t?}]` (Takte a ≤ x < b, Spur t).
     Verschieben/Einfügen/Löschen von Takten im Song verschiebt bzw. kürzt die Einträge mit (wie `song.vox`). Undo wie alle
     Song-Änderungen.
   - Sichtbar in der Song-Ansicht als schmaler farbiger Streifen unter der Kopfzeile mit gezeichnetem Kamera-Symbol (kein Emoji),
     nur wenn Einträge existieren.
2. **Auto-Regisseur:** Schnitt immer auf Taktstrichen, an Teilgrenzen; in langen Teilen spätestens alle 8 Takte; nie kürzer als
   2 Takte; zeigt was neu passiert (Teilanfang → Song; viele Clipwechsel → Matrix; neu einsetzende oder allein spielende Spur →
   Spur-Bild, ab VV3 mit Innenleben). Übergänge weich (Zoom/Blende ≤ 400 ms), kein Flackern. Gleiche Eingabe → gleiches Video.
3. **9:16:** **[Kamera]** (Standard): eine virtuelle Kamera fährt und zoomt weich (gedämpfte Feder, Zoom 1–3×) über die quer
   gezeichnete Ansicht zum gerade wichtigen Bereich (Laufband, spielende Clips, gezeigte Spur); zeigt nie leere Fläche außerhalb
   der Ansicht. **[Ganz mit Balken]**: ganze Ansicht, oben/unten Balken in Hintergrundfarbe.

**Abnahme VV2**
- [ ] VV2-01 Teil „Refrain“ auf Matrix, Takte 9–12 auf Spur 3: das Video zeigt genau dort diese Bilder (Bildvergleich je Schnitt).
- [ ] VV2-02 Takte einfügen/löschen vor einem Eintrag verschiebt bzw. kürzt ihn; Undo → deep-equal; Speichern/Laden behält ihn; ein
      Projekt ohne `song.video` bleibt Zeichen für Zeichen gleich.
- [ ] VV2-03 Auto: Schnitte nur auf Taktstrichen, Abstand ≥ 2 Takte, ≤ 8 Takte ohne Schnitt in Teilen > 8 Takte; zwei Läufe
      ergeben dasselbe Video (Hash der Schnittliste).
- [ ] VV2-04 9:16 Kamera: Bildausschnitt bewegt sich weich (Beschleunigung begrenzt, kein Sprung > 5 % Bildbreite je Bild außer an
      Schnitten), nie außerhalb der Ansicht.
- [ ] VV2-05 Bedienung: neue Zeilen in den vorhandenen Blättern ≥ 44 × 44, in allen Formaten im Bild; Streifen in der Song-Ansicht
      verdeckt nichts.

## VV3 — Innenleben (was intern passiert)

1. **Spur-Bild** zeigt das Instrument der Spur gezeichnet auf der Video-Bühne mit den Werten zum Zeitpunkt t:
   MS 2000 (Platte mit Reglern wie in der App, Modulation sichtbar, LFO als laufende Welle mit Phasenpunkt, Hüllkurven mit
   laufender Position, Lauflicht des Mod-Sequenzers), FM-Synth (Operatoren mit Algorithmus und Pegeln), übrige Klangerzeuger
   (Hauptregler, Filter, Hüllkurve), Drums (Pads blinken), STIMME (Wellenform mit Laufband).
2. Werte werden aus Noten + Parametern + Tempo **berechnet** (gleiche Formeln wie die Klangerzeugung, z. B. LFO-Phase aus Tempo-
   Sync und Startzeit), nicht aus dem Audio-Faden gelesen.
3. Regler-Automation/Bewegungen aus Aufnahmen (falls im Clip) bewegen die gezeichneten Regler mit.

**Abnahme VV3**
- [ ] VV3-01 LFO 1 Hz auf Cutoff: gezeichnete LFO-Phase und Cutoff-Zeiger stimmen je Bild mit der Rechnung (±2 % Phase).
- [ ] VV3-02 FM-Spur: Operator-Pegel im Bild folgen den Hüllkurven der gespielten Noten.
- [ ] VV3-03 Kein Einfluss auf den Klang (VV1-06) und Render-Geschwindigkeit weiter wie VV1-05.

---

## G1 — Quantisieren des Gesangs prüfen und sichtbar machen

Xander: „Es gibt mir gar nicht den Eindruck, dass die Vocals vom Timing her überhaupt auf die Quantisierung einschnappen … kein
optisches Feedback … ich höre keinen Unterschied.“

1. **Erst prüfen** (echte Läufe, gemessen): wirkt Quantisieren (VS5a, C.5) auf den Take, den man hört (Scheiben und Dehnen,
   „Audio folgt“ beim MELODIE-Clip)? Einsätze vor/nach in ms gegen das Raster. Jede Ursache, warum es nicht hörbar wird
   (z. B. Fangfenster, Standard-Stärke, falsche Fassung, Cache), wird behoben und mit Zahlen im Changelog belegt.
2. **Sichtbar:** im Marken-Editor/Takes-Blatt beim Quantisieren: Rasterlinien deutlich, jede Marke springt sichtbar (≤ 250 ms
   Animation) auf ihre Linie, die Wellenform zeigt vorher blass / nachher kräftig, kurze Meldung „n Einsätze gerückt“.
   In der STIMME-Spur (Clip-Ansicht und Song) zeigt die Wellenform die quantisierte Fassung.

**Abnahme G1**
- [ ] G1-01 Gesang mit Einsätzen ±60 ms neben dem 1/8-Raster, Stärke 100 % → gehörte Einsätze (Onset-Messung am Ausgang) ±5 ms auf
      dem Raster; bei 50 % halber Abstand ±5 ms.
- [ ] G1-02 Sichtbar: Marken nach dem Quantisieren auf den Rasterlinien (Pixelvergleich), Meldung mit richtiger Zahl, Wellenform
      der Spur = gehörte Fassung.
- [ ] G1-03 Undo stellt Marken und Klang her (deep-equal, Klang bitgleich); kein Knacken an den Schnitten.

## G2 — Tonhöhe quantisieren

Xander: „ob es möglich wäre … dass wir unsere Vocals einfach ganz easy auch auf Tonhöhe quantisieren können“ (kein Vocaloid).

1. Im Takes-Blatt/Marken-Editor neben dem Timing-Quantisieren: **„Tonhöhe“** mit **Stärke 0–100 %** und **[Weich] [Hart]**.
   Jede erkannte Note (VS2-Segmente) wird zum nächsten Ton der Tonart der Szene (bzw. des Trägers) gezogen; Weich lässt Vibrato und
   Gleiten, Hart rastet schnell ein. Nur Noten, keine Atmer/Konsonanten.
2. Verschiebung formant-erhaltend (PSOLA/WSOLA-Familie wie VS5b), nicht zerstörend (Roh-Take bleibt, Render-Cache wie Dehnen),
   im Worker, A/B wie Säubern, gilt in Szene und Song, WAV-Export der hörbaren Fassung wie bei Dehnen.

**Abnahme G2**
- [ ] G2-01 Gesungene Töne 30–45 Cent daneben, Stärke 100 %, Hart → gemessene Tonhöhe je Note ±5 Cent auf dem Skalenton;
      50 % → halber Abstand ±5 Cent.
- [ ] G2-02 Weich: Vibrato-Tiefe bleibt ≥ 70 % des Originals; Formanten (Spektralhülle) ±1 dB bis 4 kHz.
- [ ] G2-03 Keine Knackser/Artefakte an Notengrenzen (Klick-Detektor wie VS3); Dauer unverändert (±1 ms).
- [ ] G2-04 Undo/A-B/Speichern-Laden; Rechnen im Worker ohne langen Task; 16-Takt-Take fertig ≤ 3 s (Chromium).

---

## G3 — Vorlauf und Ausklang beim Einsingen (Welle 2, nach 4.24.0)

Xander: Anlauf vor dem ersten Takt soll erhalten bleiben; im Loop bleibt der Clip in seiner Klammer; im Song sieht man das kleine
„Schwänzchen“ vor dem Teil; ausklingender Gesang des vorigen Teils und Anlauf dürfen sich überlappen.

1. Der Take behält bis **2 Takte Anlauf** vor dem Clip-Anfang und bis **1 Takt Ausklang** nach dem Clip-Ende (aus dem Ringpuffer),
   die Quantisierung/Länge des Clips bleibt unverändert (Klammer).
2. **Szene:** die Schleife bleibt in der Klammer; der Anlauf klingt nur beim Einstieg des Clips (Start am Taktstrich: Anlauf beginnt
   vorher), nicht bei Wiederholungen.
3. **Song:** Anlauf klingt vor dem Teil und ist als kleines Schwänzchen vor dem Teil gezeichnet; Ausklang klingt nach dem Teil.
   Gesang benachbarter Teile darf überlappen (beide klingen); Verschieben eines Teils nimmt Anlauf/Ausklang mit.
4. Ein-/Ausblenden 5 ms an allen Rändern, kein Knacken.

**Abnahme G3** — G3-01 Anlauf ½ Takt vor Takt 1 aufgenommen → in Szene beim Einstieg hörbar, bei Wiederholung nicht; G3-02 im Song
vor dem Teil hörbar und gezeichnet, nach Verschieben des Teils mit; G3-03 Überlappung zweier Teile: beide hörbar, kein Knacken;
G3-04 Undo/Speichern/Laden deep-equal; G3-05 M-PLATZ der Song-Ansicht mit Schwänzchen in allen Formaten.

## G4 — Gesangs-Effekte mit Voreinstellung und „Auto“ (Welle 2)

1. STIMME-Spur → „Effekte“: Kette **Hochpass · Entzischer · Kompressor · EQ (Tief/Mitte/Präsenz) · Hall/Delay (Sends)**,
   Voreinstellung **„Gesang Synthpop“** an für neue STIMME-Spuren; wenige große Regler, A/B.
2. **[Auto]** misst Take(s) und Mix (Offline-Render der anderen Spuren): Dynamik → Kompressor (Schwelle/Verhältnis), Zischlaute →
   Entzischer, Maskierung durch andere Spuren → EQ (Präsenz anheben/Gegenspur-Kerbe nur im Gesang); Ergebnis sichtbar in den Reglern.
3. Baut auf dem Auto-Pegel/Begrenzer von VS-P auf (Reihenfolge: Hochpass → Entzischer → Kompressor → EQ → Auto-Pegel → Begrenzer).

**Abnahme G4** — G4-01 Dynamik (Kurzzeit-Lautheit, 10–95 %-Spanne) nach „Gesang Synthpop“ ≥ 4 LU kleiner, ohne Pumpen; G4-02 Zischlaute
(5–9 kHz-Spitzen) −4 dB ±1; G4-03 Auto im Demo-Mix: Gesang im Präsenzband 2–5 kHz ≥ 3 dB über der lautesten anderen Spur in dem Band;
G4-04 CPU 3 min ≤ +3 %; G4-05 A/B, Undo, Speichern/Laden; Regler ≥ 44 px in allen Formaten.

---

## Ergänzung 31.10. ~12:10 (Xander, wörtlich in fragen-xander-9.md) — gilt für den Bau

### G3 ergänzt: Einstieg aus dem Loop, Auftakt
5. **Einsingen aus einem laufenden Loop** (● REC mit 🎤 und Stimme-FANG): der Clip beginnt am Takt des ersten Worts auf bzw. nach dem
   Taktstrich (Phrasen-Regel wie FANG); was davor gesungen wurde (Auftakt, Ansingen, ≤ 2 Takte) ist **Vorlauf** und wird nicht
   abgeschnitten – der Loop beginnt deshalb **nicht** einen Takt früher. Gilt für den STIMME-Take und für die erkannten Noten:
   der MELODIE-Clip bekommt die Auftakt-Noten als Vorlauf (additives Feld), die wie der Audio-Vorlauf nur beim Einstieg und im Song
   vor dem Teil klingen.
- G3-06 Auftakt ½ Takt vor Takt 5 aus einem laufenden 4-Takt-Loop gesungen → STIMME- und MELODIE-Clip beginnen bei Takt 5 (nicht 4),
  Vorlauf hörbar beim Einstieg und im Song vor dem Teil, sichtbar als Schwänzchen.

## Welle 3 (parallel, sobald Rechenplatz frei ist; je ein Zweig)

### S0 — Teil bearbeiten (Fehler „Strophe ersetzen“)
Xander: „wenn ich … Strophe ersetzen mache, dann weiß ich nicht, welche Strophe der ersetzt, dann macht der mir meistens eine kaputt“.
1. Erst den Fehler nachstellen und beheben: Ersetzen trifft genau den Teil, den man gewählt hat (bei mehreren gleichnamigen Teilen
   fragt das Blatt „welche: Strophe 1 (Takt 9) · Strophe 2 (Takt 25)“, die gewählte ist im Song markiert).
2. Tipp auf die gelbe Kopfzeile → Teil-Blatt bekommt **„Bearbeiten“**: Name ändern; Liste der Spuren/Clips des Teils über seine
   Länge; je Clip/Spur **an/aus für diesen Teil** (z. B. „im letzten Teil schweigen die Drums“) → gespeichert im Teil; Undo.
- S0-01 zwei „Strophe“-Teile, Ersetzen der zweiten → nur die zweite geändert (deep-equal der ersten); S0-02 Umbenennen, Undo;
  S0-03 Drums im Teil aus → im Song dort still, sonst unverändert; Speichern/Laden; S0-04 Blatt ≥ 44 px in allen Formaten.

### S1 — Teil überarbeiten im Lauf (unverbindlich, mit FANG)
Xander: Songteil antippen zum Hören, „ändere ihn on the fly … so easy, dass es nicht bindend ist, sondern dass ich das mit Fang auch
wieder einfangen kann“.
1. Läuft ein Teil (Tipp auf den Teil bzw. seine Kopfzeile), werden Änderungen im Lauf (Clips/Spuren an/aus, Szenenwechsel, Dazuspielen)
   **nur gemerkt**, nichts wird überschrieben. **FANG** (bzw. FANG TEIL) fängt den letzten Durchlauf mit den Änderungen als
   **neue Fassung des Teils** ein; Ergebnis-Blatt: [Teil ersetzen] [Als neuen Teil] [Verwerfen]. Ein Undo.
- S1-01 Teil läuft, Drums in Takt 3 aus, FANG → neue Fassung mit Drums ab Takt 3 aus; alter Teil unverändert bis [Teil ersetzen];
  S1-02 Dazugespielte Noten landen in der Fassung; S1-03 Undo/Speichern/Laden deep-equal.

### S2 — Zusammenfassen (Teil konsolidieren, zwei Teile verketten)
1. Tipp auf die gelbe Kopfzeile → **„Zusammenfassen“**: alles im Bereich des Teils (Lanes, im Song dazu Aufgenommenes, Stimme) wird
   ein neuer Teil. Zwei oder mehr hintereinander liegende Teile auswählen (gelbe Auswahl über beide) → „Zusammenfassen“ → ein Teil.
- S2-01 Teil + im Song dazugespielte Melodie → neuer Teil klingt gleich (bitgleicher Render des Bereichs); S2-02 zwei Teile →
  ein Teil mit Summe der Längen, klingt gleich; S2-03 Undo/Speichern/Laden.

### N1 — Noten umdrehen
Xander: Notenbild „von oben nach unten … invertiert“ oder „von links nach rechts drehen“, „mit einem Klick“.
1. Im Noten-Editor (Auswahl, sonst ganzer Clip): **[Spiegeln ↕]** (Tonhöhen gespiegelt um die Mitte der Auswahl, in der Tonart
   eingerastet) und **[Umdrehen ↔]** (zeitlich rückwärts, Längen und Anschlag bleiben je Note), beide zusammen möglich. Ein Undo je
   Klick. Symbole gezeichnet.
- N1-01 Lauf C-D-E-G → Spiegeln → G-E-D-C-artig in der Tonart (Intervalle gespiegelt, alle Töne in der Skala); N1-02 Umdrehen:
  Startzeiten gespiegelt im Bereich, Anschlag je Note erhalten; N1-03 zweimal = Ausgangslage (deep-equal).

### N2 — Weite Wege beim Ziehen: Mini-Karte und Achsen-Einrasten
Xander: einzelne Note oder Auswahl über einen 16-Takt-Loop nach vorn ziehen „dauert ewig“; „wie bei Spielen … eine Landkarte“;
„dass das System … erkennt, man will auf dieser Tonhöhe bleiben … so einen Schnappeffekt“.
1. Sobald man Noten **hält und zieht**, erscheint oben eine **Mini-Karte** des ganzen Clips/Song-Rasters (Noten als Striche, sichtbarer
   Ausschnitt als Rahmen). Mit dem Finger, der zieht, auf die Mini-Karte → die Ansicht springt dorthin (weich), die Noten bleiben in
   der Hand und werden dort abgesetzt. Kein Warten auf Randscrollen.
2. **Achsen-Einrasten:** zieht man klar waagrecht (erste ~12 px überwiegend waagrecht), bleibt die Tonhöhe fest (leichte Haptik beim
   Einrasten); klar senkrecht → Zeit fest; erst eine deutliche Bewegung in die andere Richtung löst die Sperre. Bestehende Tasten zum
   Sperren bleiben.
- N2-01 Note in Takt 16 → Mini-Karte → Takt 1 in < 1,5 s, Anschlag/Länge erhalten, ein Undo; N2-02 waagrechter Zug mit ±20 px
  Zittern → Tonhöhe unverändert; N2-03 senkrecht → Zeit unverändert; N2-04 Mini-Karte ≥ 44 px hoch, in allen Formaten im Bild,
  verdeckt nicht die Stelle unter dem Finger.

### D1 — Drum-Sequencer: Länge je Spur, Richtung
Xander: Hi-Hats sollen länger/abwechslungsreicher sein können, „doppelte Länge“, „Loop-Klammer kleiner … bei den Hi-Hats“, Kick
kurzer Clip, „rückwärts laufen lassen … diese coolen Sachen, Spielereien“.
1. Je Drum-Spur (Pad-Zeile) eine eigene **Länge** (1–64 Schritte) bzw. **Loop-Klammer** im Schritt-Raster ziehbar; Spuren laufen
   unabhängig (Polymeter), der Clip selbst bleibt so lang wie bisher bzw. **[×2]** verdoppelt den Clip mit Inhalt.
2. **Richtung** je Spur: vorwärts · rückwärts · Pendel · Zufall (Zufall wiederholbar mit Startwert, gleiches Ergebnis bei jedem
   Abspielen).
3. Weitere „Spielereien“ (Wahrscheinlichkeit je Schritt, Ratchets) **nicht bauen** – als Vorschlag unter „Fragen an Xander“.
- D1-01 Hi-Hat 12 Schritte gegen Kick 16 → nach 48 Schritten wieder deckungsgleich (gemessene Treffer); D1-02 rückwärts/Pendel/Zufall
  hörbar und wiederholbar (zwei Läufe gleiche Treffer); D1-03 ×2 → Inhalt doppelt; Undo/Speichern/Laden; ältere Projekte klingen
  unverändert; D1-04 Bedienung ≥ 44 px in allen Formaten.

---

## K1 — Klang-Prüfung: Synth stabil, nichts Verstecktes, gleicher Klang nach Speichern (Xander 31.10. ~13:00, Fehler zuerst)

Xander (Kern, wörtlich in fragen-xander-9.md): dritter Oszillator „hört man im Mischungsverhältnis meistens gar nicht … scheint sogar
die anderen Oszillatoren zu beeinflussen“; LFOs „halten manchmal einfach an“; in der Übersicht bewegen sich Modulationen, „man kommt
aber nicht rein und sieht nicht, was … die Tonhöhe moduliert, obwohl ich das nie adressiert habe, … könnte ich auch nicht löschen“;
neue Datei/Programme haben schon Modulation („ein paar Cent“); Filter/Ladder „Abbrüche“, „gleiche Werte … klingt plötzlich anders“;
„was man zuletzt gehört hat, auch wieder öffnet … genauso klingt“; früher optimierte Sounds klingen heute anders. Sample & Hold soll
klanglich bleiben, wie es ist.

Gilt für alle Klangerzeuger (Haupt-Synth mit 3 Oszillatoren und Ladder-Filter, FM, MS 2000, Drums). Keine neue Gestaltung außer der
Mod-Übersicht (Punkt 3), die Xander verlangt.

1. **Oszillator 3:** Pegel und Tonhöhe von Osz 3 wirken hörbar und messbar wie bei Osz 1/2; Ändern von Osz 3 verändert Osz 1/2 nicht
   (Spektrum je Oszillator solo geprüft). Ursache finden und beheben.
2. **LFOs:** laufen stabil (kein Stehenbleiben bei Notenwechsel, Szenenwechsel, Tempo-Sync, Neustart, Hintergrund); **Sample & Hold**
   prüfen: je LFO-Takt ein neuer Zufallswert, bis zum nächsten gehalten (klassisch) – Klang unverändert lassen, nur Fehler beheben.
3. **Keine versteckten Modulationen:** eine Übersicht je Klang listet **jede** aktive Modulation mit Quelle → Ziel → Menge (auch aus
   Programmen/Voreinstellungen und Standard-Klängen), Tipp springt zum Ziel-Regler, **[✕]** löscht sie (Undo). Was sich in der
   Übersicht bewegt, hat genau einen Eintrag. Ein neues Projekt/INIT-Klang hat **keine** Modulation (Tonhöhe auf 0 Cent genau).
   Woher kommen die „ein paar Cent“? Ursache belegen (Programm, Vorbelegung, Drift, Fehler) und, falls Fehler, beheben.
4. **Filter (Ladder u. a.):** keine Aussetzer/Abbrüche (NaN/Denormal/Instabilität bei hoher Resonanz, Selbstoszillation, schnellem
   Drehen); **gleiche Einstellung = gleicher Klang**, egal welchen Weg die Regler vorher gingen (kein verbleibender Zustand außer dem
   gewollten Ausklang); Regleränderungen kommen in Echtzeit und vollständig im Klang an (keine verlorenen Nachrichten).
5. **Speichern = Klang:** Projekt speichern → neu laden → Offline-Render bitgleich bzw. ≤ −90 dB Abweichung, für jeden Klangerzeuger
   und alle Parameter. **Alte Projekte:** Xanders gespeicherte Projekte/Demo aus früheren Versionen klingen wie in ihrer Version
   (Golden-Render mit den Snapshots in `synq-snapshots/` vergleichen); Abweichungen = Fehler beheben oder belegen, warum gewollt.
6. Leistung: kein Mehr an CPU; was nur wackelt und Rechenzeit frisst, raus.

**Abnahme K1** — K1-01 Osz 3 solo/Mix messbar, keine Wirkung auf Osz 1/2; K1-02 LFO-Dauerlauf 10 min mit Wechseln ohne Stillstand,
S&H-Stufen = Zufall je Takt, Klang gegen 4.23.0 gleich; K1-03 Mod-Übersicht vollständig (Abgleich mit der Engine-Liste), Löschen
wirkt hörbar, Undo; INIT/neues Projekt ohne Modulation, 0 Cent; K1-04 Ladder bei Res max und schnellem Drehen: kein NaN, kein
Aussetzer, Zustandsfreiheit (zwei Wege → gleiche Einstellung → Render gleich ≤ −90 dB); K1-05 Speichern/Laden bitgleich je Engine;
alte Projekte gegen ihre Snapshots; K1-06 Übersicht ≥ 44 px, alle Formate; CPU ≤ 4.23.0.
