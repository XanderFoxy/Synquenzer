# SPK11 – unabhängige Prüfung (Spektral-Seite → Szenen anlegen · Klang nachbauen im ⋯-Menü)

Geprüft wurde `index.html` gegen `basis.html`. Repariert habe ich nichts.

- **Aufbau:** `basis.html` ist bitgleich mit `vx/basis10.html` und `rel-4660/index.html` (4.66.0). `index.html` ist genau die Basis plus drei Dinge:
  - der Block `spk11-block.js` (bitgleich mit dem Block in der Datei),
  - zwei Haken-Zeilen,
  - eine Leerzeile.
- **Läufe:** Alle Läufe liefen einzeln nacheinander auf einer bitgleichen Kopie (`pruef-spk11/p/index.html`, `mess/` daneben). So bleiben die Ergebnisdateien des Bauers unberührt.
- **Eigene Skripte und Ergebnisse** liegen außerhalb von vx unter `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/pruef-spk11/`:
  - `lied.mjs`: eigenes Prüflied mit Wahrheit. 100 BPM, 0,8 s Vorlauf, Form Intro 4 · Strophe 8 · Refrain 8 · Strophe 8 · Refrain 8 · Outro 4, Ebenen Bass, Drums, Flächen und Lead (nur im Refrain).
  - `pr-ui.mjs`: Touch-Ablauf in 3 Größen, inklusive ↶/↷, Seiten-↶ und Neuladen.
  - `pr-play.mjs`: 3-min-Wiedergabe mit Mitschnitt.
  - `pr-auswahl.mjs`: Auswahl, zweiter Lauf und 5 Ebenen.
  - `pr-tempo.mjs`: 97,3 BPM, Demo-Projekt, ohne Audio-Erlaubnis.
  - `pr-teile.mjs`: zweite Liedform mit Bridge.
  - `pr-loop.mjs`: Loop → Matrix nach dem Anlegen.
  - `pr-basis-bass.mjs`: Gegenprobe ohne SPK11.
  - `reg.sh` und Ausgaben `*.out`/`*.json`, Fotos in `fotos/`.

## Kurz
- **Funktioniert:**
  - Bedienweg hochkant (Ansicht ▾ → Szenen anlegen …).
  - Songteile: eigenes Lied 6/6 mit exakten Grenzen, zweite Form 8/8 mit Bridge und 16-Takt-Strophen.
  - Anlegen: 6 Szenen, 18 Audio-Clips, 24 MIDI-Clips.
  - App-↶ und ↷ per Touch.
  - Neuladen: alles gleich, auch die Takes.
  - 3 min Wiedergabe: keine Aussetzer, keine hängenden Noten, keine Konsolenfehler.
  - Audio und MIDI liegen bei ganzzahligem Tempo rund 8 ms auseinander.
  - Pflicht und Regression wie vom Bauer berichtet.
- **Zwei schwere Befunde** treffen den Kern des Auftrags („die MIDI-Noten entsprechend übernimmt … abgrenzen von der Auswahl automatisch“):
  - Mit Auswahl und noch ohne Noten wird nichts vorgewählt, und der Knopf ist gesperrt (Befund 1).
  - Hat eine Ebene schon irgendwo Noten, wird nicht weiter gesucht. Die übrigen Teile bekommen dann stumm keinen MIDI-Clip (Befund 2).
  - Der grüne Test des Bauers zur Auswahl hängt an der Testreihenfolge: Die Noten stammen aus dem Lauf davor.
- **Dazu acht mittlere Befunde:**
  - Tempo-Rundung ohne Dehnung: 61 ms Versatz Audio↔MIDI je 8 Takte bei 97,3 BPM.
  - Projekt-Tempo wird still umgestellt.
  - 5/9-Takt-Szenen durch Vorlauf und Nachlauf.
  - Szenen-Namen sind in der Matrix nicht sichtbar.
  - Das ↶ der Seite führt in die Irre.
  - Spurgrenze, Drum-MIDI und Qualität der Flächen- und Lead-Noten.

## Pflichtprüfungen (eigene Läufe)
- **topdefs:** Skripte 26, Namen 7506, doppelt 0, Syntaxfehler 0.
- **dupkeys:** 0 doppelte Schlüssel.
- **smoke:** `errors []` (`pruef-spk11/smoke-pruef.png`).
- **„MS 2000“:** genau 1× (Basis 1×). **„^  live: true,“:** genau 1× (Basis 1×).
- **VERSION:** `const VERSION = '4.66.0'` unverändert.
- **Markenwörter:** 45 Produkt- und Firmennamen gezählt.
  - In `index.html` ist keine Zählung gegenüber der Basis gestiegen.
  - In Block, `spk11-test.mjs`, NOTES, LOG und `work/` gibt es 0 Treffer.
- **Grafiken und Namen:**
  - Der Block enthält keine Emojis. Er nutzt nur ● (U+25CF) als Farbpunkt; Schloss- und Mikrofon-Zeichen stammen aus der Basis.
  - Keine Namen echter Personen oder Bands als Beschriftung.

## Regression (einzeln, nacheinander, `pruef-spk11/reg.log`)
| Lauf | Ergebnis | Bewertung |
|---|---|---|
| `spk6-test.mjs` | **ALLES OK** (31 s), kern-messwerte 24/0 | = Bericht (nach der Knopf-Verschiebung) |
| `spk5-test.mjs` | **ALLES OK · 24 Prüfungen** (53 s) | = Bericht |
| `spk1-test.mjs` (mess/ daneben) | **17 OK / 1 FEHLER** `verfeinern-verbessert-ziel` 4,37 → 4,36 | gegen `basis.html` gefahren: dasselbe 17/1, also vorbestehend |
| `imp1-test.mjs` | **ALLE OK** (121 s) | = Bericht |
| `spk8-seite.mjs` | **14 OK / 0 FEHLER** (24 s) | = Bericht |
| `spk11-test.mjs` des Bauers (Kopie, eigener Ordner) | **37 OK / 3 FEHLER** (nur drums-auf-kit) | = Bericht, siehe Nachtrag |

## Eigene Prüfung als Xander (Touch, 428×926 · 926×428 · 926×370)

### Bedienweg
- **Hochkant:** Ansicht ▾ → Abschnitt „Szenen“ → [Szenen anlegen …] (726–770 px, ohne Rollen sichtbar).
- **Quer:** Der Eintrag ist der letzte im Ansicht-Klappfenster.
  - 926×370: bei 679–723 px in einem 300 px hohen Fenster (Inhalt 688 px), also 2,3 Fensterhöhen rollen.
  - 926×428: ebenfalls rollen.
- **Blatt:**
  - Alle Knöpfe sind ≥ 44 px, nichts ragt heraus.
  - Quer ist das Blatt 356 bzw. 298 px hoch bei 823 px Inhalt. „6 Szenen anlegen“ erreicht man erst nach dem Rollen.
- **⋯ → Werkstatt → [Klang nachbauen]:**
  - Hochkant im Bild (699–743 px).
  - 926×370 bei 398–442 px, das Fenster endet bei 308 px, also nur nach dem Rollen erreichbar.
  - Bass ohne Noten: Erst werden 220 Noten gesucht, dann öffnet das Nachbau-Blatt. Ergebnis `fm`, Abstand 2,42, gemerkt, 8,1 s.

### Ergebnis (eigenes Lied, 428×926; quer gleiche Zahlen)
- **Teile:**
  - Erkannt: „Intro -1–4 · Strophe 1 4–12 · Refrain 1 12–20 · Strophe 2 20–28 · Refrain 2 28–36 · Outro 36–41“.
  - Wahr: 0–4 · 4–12 · 12–20 · 20–28 · 28–36 · 36–40.
  - IMP1 allein liefert „Intro · Refrain 1 4–20 · Refrain 2 20–36 · Outro“. `spk11Seg` ist also nötig und richtig.
  - Zweite Form (120 BPM): „Intro, Strophe 1 4–20, Refrain 1, Strophe 2 28–44, Refrain 2, Bridge 52–56, Refrain 3, Outro“ = Wahrheit (bis auf Vor- und Nachlauf, Befund 5).
- **Anlegen:**
  - 20,0 s (hochkant), 26,2 s (926×428) und 31,3 s (926×370) für 98 s Audio, 4 Ebenen, inklusive Notensuche für Pads und Lead.
  - Ergebnis: 6 Szenen mit Namen, 18 Audio-Clips (Drums, Bass, Pads), 24 MIDI-Clips (892 Noten).
  - Der Bass bekommt den Nachbau-Klang „Bass Nachbau“, Lead auf einer leeren Spur den Rollen-Klang.
- **Audio-Clips:**
  - Ein- und Auspunkte liegen genau auf den Teilgrenzen, je Ebene ein Take von 100,8 s.
  - Nur-Audio-Wiedergabe von Refrain 1 gegen die Summe der Takes:
    - Korrelation 0,917, Versatz 12 ms.
    - Pegel −16,9 dB gegen erwartet −16,7 dB.
- **MIDI gegen Wahrheit** (Anschlag ±70 ms, gleicher Ton):

  | Ebene | Teil | gefunden | Treffer | Recall | Präzision | sonst |
  |---|---|---|---|---|---|---|
  | Bass | Strophe 1 | 66 | 58 / 64 | 0,91 | 0,88 | 3 Oktavfehler |
  | Bass | Refrain 1 | 34 | 29 / 32 | 0,91 | 0,85 | – |
  | Bass | Strophe 2 | 62 | 57 / 64 | 0,89 | 0,92 | 4 Oktavfehler |
  | Bass | Refrain 2 | 38 | 27 / 32 | 0,84 | 0,71 | – |
  | Bass | Intro, Outro | je 10 | – | – | – | Phantomnoten, dort spielt kein Bass |
  | Lead | Refrain 1 | 26 | 14 / 20 | – | 0,54 | – |
  | Lead | Refrain 2 | 26 | 13 / 20 | – | 0,50 | – |
  | Lead | Strophe 1, Strophe 2 | 54 bzw. 52 | – | – | – | Phantomnoten, dort spielt kein Lead |

  - Pads: Nur 35 von 120 Akkordtönen erscheinen im richtigen Takt (29 %). Nur 38 % der 128 Noten sind Akkordtöne.
  - Drums:
    - Kick 74/80 echte Schläge, dazu 18 zusätzliche (Strophe 22 statt 16 je 8 Takte).
    - Snare 64/64, dazu 7 zusätzliche.
    - Hi-Hat 211/288, auf 2 und 4 fehlt sie immer.
- **Takt-Ausrichtung beim Abspielen** (Kick-Einsatz gegen Rasterzeit):
  - Audio 49,8 ms, MIDI 41,8 ms (gemeinsame Kette). Unterschied ≈ 8 ms, passt zum Raster 0,79 statt 0,80 s.

### ↶ / ↷, Speichern / Laden
- **↶ in der Matrix-Kopfleiste (Touch):**
  - Spuren 8 → 6, Clips 42 → 0, Namen „Szene 1…6“.
  - Tempo 100 → 120, Takes 3 → 0.
- **↷ per Toast-Knopf „↷ Wiederholen“:** Clips, Noten, Namen, Spuren, Klänge und Takes (3, im Speicher) sind identisch. Gilt in allen drei Größen.
- **Neu laden** (Autosave abgewartet, `page.reload()`):
  - 42 Clips, 892 Noten, Namen, Spuren und Klänge gleich.
  - 3 Takes je 100,8 s, aus IndexedDB lesbar (Spitzen 0,66 / 0,35 / 0,23), keiner fehlt. `spk` 1 (Analyse verlinkt).
  - Das ist stärker als der Test des Bauers, der nur `buildProjectFile`/`projFromFile` im Speicher prüft.

### Wiedergabe 3 min (428×926, Last 2,3, `play3.out`)
- **Ablauf:**
  - Phase A: nur Audio, Szene 3.
  - Phase A2: nur MIDI-Drums.
  - Danach alles mit 8 Szenenwechseln per Touch, auch über die Szenen-Bank 5–8.
- **Master:**
  - 0 Aussetzer, 0 NaN, 0 verspätete Noten.
  - Nach dem Stopp 0 Stimmen, Ausklang −180 dB: keine hängenden Noten. Konsole leer.
- **Hauptfaden während der Wiedergabe:** 6 Stockungen > 60 ms (max. 99 ms) und 3 Long Tasks (max. 87 ms). Sie liegen beim Bankwechsel 5–8 → 1–4 und gehören zur Basis-App.
- **Bass-Spur:** 1014 HF-Spitzen und 311 Sprünge in der 2. Differenz.
  - Gegenprobe ohne SPK11 (dieselben Achtel von Hand, Grund-Bassklang von Synth 1): 102 bzw. 51 in 25 s.
  - Je Sekunde gleiche Größenordnung (ca. 7 gegen 4 bzw. 2,2 gegen 2). Das ist der Klang selbst, kein SPK11-Knackser.
- **Erster Lauf bei Last 9,7** (andere Läufe aktiv): 8 verspätete Noten (bis −49 ms) und 32 Stockungen (max. 175 ms). Wegen Fremdlast nicht gewertet.

## Befunde

### 1. [schwer] Mit Auswahl wird nichts vorgewählt, der Knopf ist gesperrt (im normalen Ablauf)
- **Ablauf:** Laden → Zerlegen → Auswahl (Rechteck Strophe 2, 30–250 Hz) → Ansicht ▾ → Szenen anlegen.
- **Gemessen:**
  - Das Blatt zeigt richtig „1 Teile · … · nur die Auswahl 48,8–67,9 s“ und „Strophe 2 · Takt 21–28“.
  - Alle 5 Ebenen stehen aber auf **Aus**. Der Knopf „1 Szene anlegen“ ist `disabled: true`.
  - Jede Zeile sagt „Noten werden gesucht“, obwohl nichts gesucht wird. Foto `pruef-spk11/fotos/a-s1-blatt.png`.
- **Ursache:** Vorgewählt werden nur Ebenen mit Noten in der Auswahl (`spk11Rows`, `pick = rows.filter(r => r.n > 0)`).
  - Vor dem ersten „Noten finden“ hat aber keine Ebene Noten.
  - Drums haben immer `n = 0` und werden mit Auswahl nie vorgewählt, auch nicht bei einer reinen Zeit-Auswahl.
- **Warum der Bauer-Test grün ist:** Die Bass- und Pads-Noten stammen dort aus dem ersten Anlegen vorher (Testreihenfolge).
- **Was danach geht:** Erst nach drei Taps auf „Beides“ funktioniert die Begrenzung (Befund-Zahlen unter „Bestätigt“).

### 2. [schwer] Vorhandene Teil-Noten verhindern die Notensuche – MIDI-Clips fehlen still
- **Ursache:** `spk11Go` sucht nur für Ebenen ohne jede Note (`|| r.all) continue`). Hat eine Ebene Noten nur in einem Bereich, bekommen alle anderen Teile keinen MIDI-Clip.
  - Das Blatt zeigt dabei „Bass 62 Noten“, also nichts Auffälliges.
- **Gemessen:**
  - Zuerst Szenen aus einer Auswahl Takt 20–28 (Noten für Bass und Pads nur dort).
  - Dann Zeit-Auswahl Takt 10–14: „Bass A2 **M0**“, „Pads A2 **M0**“, also 0 MIDI-Clips.
  - Danach ein voller Lauf und ein zweiter Lauf ohne ↶: Im Plan steht „Bass … 62 Noten“, das Ergebnis ist Bass M0 und Pads M0 (`auswahl.out`).
- **Warum das oft vorkommt:**
  - Loop → Matrix (MIDI) sucht Noten nur im Loop (`spk2MxMidi`: „Noten im Loop“).
  - Noten finden mit Auswahl sucht ebenfalls nur dort.
  - Beides ist ein üblicher Weg vor „Szenen anlegen“.

### 3. [mittel] Tempo wird gerundet, das Audio nicht angepasst – Audio und MIDI laufen auseinander
- **Gemessen:** Lied mit 97,3 BPM (Raster 97,3). Projekt danach 97 BPM (`imp1Prep`: `Math.round`).
  - Audio-Clip 19,733 s gegen Clip-Länge 19,794 s.
  - Am Ende jeder 8-Takt-Szene liegen Audio- und MIDI-Clip derselben Ebene **61 ms** auseinander. Bei den 5-Takt-Teilen sind es 38 ms.
- **Vergleich:** Der Import dehnt das Audio in diesem Fall mit NX1 (`nx1ImpView`, `q ≠ 1`), SPK11 nicht.
- **Ganzzahlige Tempi** (100 und 120 BPM) sind unauffällig (≈ 8 ms).
- **Aus dem Code:** Liegt schon Audio im Projekt und das Tempo weicht ab, bleibt das Projekt-Tempo (`imp1Prep`-Toast). MIDI in Schlägen und Audio in Sekunden passen dann gar nicht mehr zusammen.

### 4. [mittel] Projekt-Tempo wird still umgestellt
- **Gemessen:** Demo-Projekt (112 BPM, eigene Szenen „Groove“ und „Break“) → Szenen anlegen → Projekt **100 BPM**.
  - Die eigenen Szenen laufen danach langsamer.
  - Das Blatt nennt nur „100 BPM“ (Tempo des Dokuments).
  - Der Toast „6 Szenen · 12 Audio-Clips · 12 MIDI-Clips (594 Noten)“ erwähnt den Wechsel nicht.
- **Was richtig ist:**
  - ↶ stellt 112 wieder her.
  - Die eigenen Clips bleiben unberührt, belegt werden die Szenen 3–8.
- **Vergleich:** Loop → Matrix nennt das Tempo im Toast.

### 5. [mittel] Vor- und Nachlauf werden zu ganzen Takten: Intro und Outro laufen als 5-Takt-Schleife mit stillem Takt
- **Eigenes Lied (0,8 s Vorlauf):**
  - „Intro · Takt 0–4“ ist 5 Takte lang. Der erste Takt besteht aus 1,6 s Stille plus 0,8 s Vorlauf.
  - „Outro · Takt 37–41“ ist 5 Takte lang: 1,2 s Ausklang, dann Stille.
- **Zweite Form (0,29 s Vorlauf):** Intro -1–4 mit ganz stillem erstem Takt, Outro 64–69.
- **Lied des Bauers:** „Refrain 2 · Takt 25–33“ ist 9 Takte lang.
- **In der Matrix:** Diese Szenen stehen als „5T“ (Foto `p-matrix-428x926.png`) und loopen mit einem stillen Takt.
- **Ursache:** `k0 = -ceil((g.off-0,03)/bar)` ab 30 ms Vorlauf, `nb = ceil(dur/bar - 0,02)` am Ende.
- **Anzeige:** Die Zählung „Takt 0“ ist für Xander ungewohnt.

### 6. [mittel] Szenen-Namen sind in der Matrix nicht zu sehen
- **Gemessen:** Die Szenen-Köpfe heißen danach „▶1 F“, „▶2 F mix“, „▶3 Am“, „▶4 C mix“, „▶5“, „▶6“ (`UI.scenes`).
  - „Strophe 1“ und „Refrain 1“ erscheinen nur nach Halten im Szenen-Blatt („Szene 2 · Strophe 1“).
  - Ein Song-Ablauf und Marken werden bewusst nicht angelegt (NOTES).
- **Folge:** Die erkannten Songteile, der Kern des Wunsches, sind nach dem Anlegen nirgends auf einen Blick sichtbar. Fotos `p-matrix-428x926.png`, `u-matrix-926x428.png`.

### 7. [mittel] Das ↶ auf der Spektral-Seite nimmt die Szenen nicht zurück, obwohl die Seite das sagt
- **Gemessen:**
  - Direkt nach dem Anlegen steht in der Statuszeile „Szenen 1, 2, 3, 4, 5, 6 angelegt · ↶ macht es rückgängig“.
  - Das ↶ oben auf derselben Seite heißt aber „Rückgängig: Noten finden“.
  - Tippen nimmt nur die von SPK11 selbst gestartete Notensuche zurück. Die Szenen bleiben (Clips 42 → 42, App-↶-Stapel 1 → 1).
- **Was wirklich zurücknimmt:** nur das ↶ im Toast (verschwindet nach Sekunden) oder das ↶ der Matrix-Kopfleiste.

### 8. [mittel] Spurgrenze, Umbau einer Grundspur, doppelte Spurnamen
- **4 Ebenen:** Lead bekommt kein Audio („Audio → keine Spur frei“).
  - Die Spur „Melodie“ bleibt dabei leer. Sie zählt wegen `t.mel` nicht als leer.
- **5 Ebenen** (dazu Gesang): Lead und Gesang ohne Audio.
- **Umbau einer Grundspur:**
  - Die Grundspur „Synth 4“ wird zur Audio-Spur „Pads“. Im Blatt steht das vorher.
  - Sie zeigt weiter „VA · Mini-Lead“, ebenso die neuen Audio-Spuren „VA · INIT Analog“.
  - Das ist eine sichtbare Änderung des Projekt-Aufbaus (CLAUDE.md Regel 3).
- **Doppelte Namen:** Je Ebene gibt es zwei gleichnamige Spuren, getrennt angeordnet: „Bass“ (Spur 1) und „Bass“ (Spur 8), „Drums“ und „Drums“, „Pads“ und „Pads“.

### 9. [mittel] Drum-MIDI (vom Bauer offen gelassen, bestätigt)
- **Eigenes Lied:** Kick 74/80 echte Schläge plus 18 zu viel (Bass-Achtel), Snare 64/64 plus 7 zu viel.
  - Die Hi-Hat fehlt auf 2 und 4 immer (`if (sn) … else if (nh…)`): 211 von 288.
- **Lied des Bauers:** Kick 63/64 plus 26 zu viel, Snare 42/64.
- **Mit Frequenz-Auswahl < 250 Hz:** Das Drum-MIDI enthält trotzdem Hi-Hats (höchster Ton 42). Normiert wird auf das gefilterte Rauschen.

### 10. [mittel] Pads- und Lead-MIDI sind kaum brauchbar und werden standardmäßig mit angelegt
- **Gemessen:**
  - Pads: 29 % der Akkordtöne vorhanden, 38 % der Noten sind Akkordtöne.
  - Lead: 52–54 Phantomnoten je Strophe (dort spielt kein Lead), Präzision im Refrain 0,50–0,54.
  - Bass: je 10 Phantomnoten in Intro und Outro.
- **Ursache:** Die Notenerkennung der Ebenen, nicht die SPK11-Logik. Mit Vorgabe „Beides“ landen diese Noten aber ungefragt als Clips auf den Spuren.
- **Bauer-Test:** prüft nur Anzahlen (Bass 145 gegen 128 „OK“) und keine Tonhöhen.

### 11. [leicht] Loop → Matrix (Audio) landet nach dem Anlegen auf der falschen Spur
- **Gemessen:** Der Bass-Loop Takt 9–12 geht auf Spur 7 „**Drums**“ (die erste Audio-Spur, `imp1OrigT`).
- **Gleiches gilt laut Code** für Import → „In Szenen“.

### 12. [leicht] Ohne Audio-Erlaubnis (eingebettet, `micAvail` false) entstehen leere Audio-Spuren
- **Gemessen:**
  - Das Blatt verspricht „Audio → neue Spur“.
  - Angelegt werden 2 **leere** Audio-Spuren („Drums“, „Bass“) und 0 Audio-Clips.
  - Die Statuszeile meldet nur „… angelegt“. Der Hinweis „Audio nur auf der eigenen Seite“ ist überschrieben.

### 13. [leicht] Querformat: beide neuen Einträge nur nach Rollen erreichbar
- Zahlen stehen oben unter „Bedienweg“.
- „Szenen anlegen …“ steht als letzter Eintrag im Ansicht-Menü (nach den Farben). Das erschwert das Finden.

### 14. [leicht] Texte
- „Noten werden gesucht“ steht auch bei „Aus“ (Rest) und bei aktiver Auswahl, obwohl nichts gesucht wird.
- „1 Teile“ statt „1 Teil“.

### 15. [leicht, Risiko] Speicher
- **Aufwand:** Je Ebene ein Take über die ganze Liedlänge, hier 3 × 100,8 s, also je Ebene 17,8 MB Float32 im Speicher plus 8,9 MB in IndexedDB.
- **Hochgerechnet:** 4-min-Lied mit 4 Audio-Ebenen ≈ 170 MB Audio-Puffer und 85 MB gespeichert. Auf dem Telefon nicht gemessen.
- **Vergleich:** Der Import „In Szenen“ hält einen einzigen Take.

## Bestätigt (Zahlen)
- **Auswahl nach Hand-Wahl** (Beides für Drums, Bass, Pads):
  - 1 Szene in 5,9 s.
  - Audio nur aus der Auswahl: unter 250 Hz 57–67 dB, über 400 Hz −16,7 dB.
  - Noten nur in der Auswahl: Bass 61 Noten, höchster Ton 55. Pads 39 Noten, höchster Ton 60.
  - Zeit-Auswahl Takt 10–14 über eine Teilgrenze: 2 Szenen „Strophe 1“ und „Refrain 1“ mit je 2 Takten.
- **Zweiter Lauf ohne ↶:** Das Blatt sagt vorher „4 Teile passen nicht mehr – nur 2 Szenen frei (Szene leeren oder ↶)“. Belegt werden nur die Szenen 7–8.
- **Demo-Projekt:** Die eigenen Szenen und Clips bleiben, belegt werden die freien Szenen 3–8.
- **Klang nachbauen über ⋯:**
  - Bass ohne Noten: Erst wird gesucht, dann das Blatt geöffnet.
  - Pads: 5,0 s.
  - Das Ergebnis wird gemerkt und landet auf der leeren Bass-Spur als „Bass Nachbau“.
- **Konsole:** In allen eigenen Läufen keine Fehler.

## Nachtrag: `spk11-test.mjs` des Bauers (Kopie in `pruef-spk11/bauer-test/`)
- **Ergebnis:** Der Test reproduziert genau **37 OK / 3 FEHLER**, mit denselben Zahlen wie im Bericht. Fehler sind nur `drums-auf-kit` je Größe: Kick 89, davon 63 echt, Snare 43, davon 42 echt.
- **Ausgabe:** `pruef-spk11/bauer-spk11-test.out`.
- **Zum Auswahl-Teil:** „auswahl-begrenzt OK (on: bass, pads)“ läuft erst, nachdem das erste Anlegen die Pads-Noten gesucht hat und „Klang nachbauen“ die Bass-Noten. Mit einem frischen Dokument wäre derselbe Schritt gesperrt (Befund 1).
- **Was der Test nicht prüft:**
  - Tonhöhen (nur Anzahlen).
  - ↷.
  - Echtes Neuladen.
  - Wiedergabe.
  - Tempo ≠ ganzzahlig.
  - Bestehendes Projekt.
  - Zweiter Lauf.
  - Notensuche bei schon vorhandenen Teil-Noten.
