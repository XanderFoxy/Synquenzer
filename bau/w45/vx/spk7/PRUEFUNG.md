# SPK7 „Klangkorn" – unabhängige Prüfung (Teil 1 + Teil 2)

Geprüft: `index.html` (= `python3 einbau.py` aus basis.html, byte-gleich nachgebaut; basis.html = basis5). Nichts repariert.
Eigene Läufe (Playwright, Touch über CDP, 428×926 und 926×428, dazu 926×370) auf Kopien unter
`/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/pruef-spk7/` (Skripte `pr1.mjs` … `pr10.mjs`, Ergebnisse `pr*.json`, Fotos `fotos-pr/`).

## Pflichtprüfungen und Regression (eigene Läufe)
- topdefs: Skripte 26, doppelt 0, Syntaxfehler 0 · dupkeys: 0 · smoke: `errors []`
- „MS 2000" 1× (Basis 1×) · `^  live: true,` 1× · vwStart 3× · Krypto-grep 0 (Basis 0)
- Markenwörter: alle 21 je Wort = Basis; in Quellen, Tests, NOTES, LOG, KARTE, einbau.py 0
- spk1-test: ALLE OK
- spk3-test (gegen basis5): 13 OK / 4 FEHLER
  - bass 3,01/4, verfeinern +0,52, mehrstimmig 0/28: bekannte offene SPK3-Ziele, gleiche Zahlen wie beim Bauer
  - nachbau-abstaende-besser: „2,13 → 2,13, schlechter []". Alle vier Werte sind gleich wie basis5. Das ist erklärbar, weil SPK7 den Nachbau nicht berührt.
  - layout-3-groessen OK; regression-spk2-test 29/30 (bekannt: zerlegen-bass-ziel)
- Bauer-Tests nachgefahren: spk7-kern-test ALLES OK (7), spk7-test ALLES OK (13) – reproduzierbar.
- chr2-test (Chor, `vx/chr4/chr2-test.mjs`, gegen basis5): 77 OK / 5 FEHLER.
  - Die 5 Fehler sind „Tuning … Knackser weniger"-Vergleiche; vorher und nachher sind die Werte gleich (z. B. LSD 2,18/3,15 → 2,18/3,15).
  - Der Test verlangt eine Verbesserung gegenüber der Vergleichsdatei. Weil SPK7 Tuning und Chor nicht berührt, ist das erklärbar.
  - Chor-Import, Stimmen trennen, ↶/↷, Speichern/Laden, Container und Blätter in 3 Größen sind OK; Konsole ohne Fehler.
  - Nebenwirkung des Tests: Er schreibt seine Fotos nach `vx/chr4/fotos/chr2t-*.png` (9 Stück überschrieben). Seine zwei Messdateien in `vx/chr4/src/` habe ich wieder gelöscht.

**Funktioniert als Nutzer (bestätigt):**
- Pinsel → „Als Klangkorn" → Blatt mit Quellbild, Marker, Mini-Tastatur (Gleiten ohne Knackser, Sprung 0,96 × Grenze), Tastatur links halten/leuchten.
- Als Instrument: neue Spur über den echten App-↶-Knopf zurück (7 → 6 Spuren).
- Song live: RMS 0,018, bis 2 Stimmen. Export offline (Einzelspur) warm und ohne Cache: RMS 0,012, NaN 0.
- Speichern → Neuladen: Klang + Take da, Export nach Neuladen klingt, erster Ton nach Neuladen nach 87 ms.
- Spur-Engine bei Quellwechsel während der Wiedergabe: 0 NaN.
- Spektrum-Höhe in allen drei Größen unverändert; Blatt 926×370 rollbar, letzter Knopf treffbar. Konsole leer.

## Befunde

### 1. [schwer] NaN in der ganzen App-Ausgabe, wenn die Klangkorn-Quelle wechselt, während eine Vorhör-/Tasten-Note noch klingt
- **Wiederholen (reiner Nutzerweg, `pr9.mjs`):**
  1. Langen Pinsel-Strich malen (15 → 75 %) und „Als Klangkorn" tippen.
  2. Im Blatt Ausklang 6 s, Filter 70 % und Position 90 % einstellen, dann das Blatt schließen.
  3. Eine Taste links antippen; der Ton klingt aus.
  4. Sofort „Verwerfen", einen kurzen Pinsel-Strich (40 → 46 %) malen und „Als Klangkorn" tippen.
- **Messung** hinter der Master-Kette (`AU.M.ceil`):
  - 114 160 NaN-Proben = 2,59 s; die Quelle wechselt von 249 986 auf 57 093 Proben.
  - Mit „▶ Vorhören" statt Taste: 70 155 NaN (`pr3.mjs`). Per Kern-Zugang mit Filter: 66 315 NaN; ohne Filter einzelne NaN-Proben (9, `pr1.mjs`).
- **Ursache** (spk7-kern.js, `msg` `t:'src'` und `seg`):
  - Die Quelle `X`/`XL` wird sofort ersetzt. Laufende Körner lesen weiter an ihrer alten Stelle `p ≥ neues XL`, also `X[i0]` = undefined und damit NaN.
  - Bei Filter < „offen" bleibt das NaN im SVF-Zustand der Stimme, bis die Stimme endet.
- **Folge:**
  - Alles, was über `AU.masterSum` läuft (auch ein laufender Song), ist für diese Zeit NaN.
  - Chromium erholt sich danach (eigener Lauf: danach wieder Ton, 0 NaN). Auf dem iPhone ist das nicht prüfbar; ein Kompressor-/Filterzustand mit NaN kann dort hängen bleiben.
  - Die Spur-Engines sind nicht betroffen (`pr5.mjs`: 0 NaN), weil applySound eine neue Spur-Kette baut.

### 2. [mittel] Knackser, wenn bei klingender Note Modus oder Filter umgestellt werden
Auftrag: „keine Klicks". Gemessen mit Sinus-Quelle 220 Hz, Taste A3 (`pr1.mjs`), Kriterium wie Kern-Test: größter Probensprung / (Spitze · ω). Grenze 1,5, Ruhe-Referenz 1,0.

| Fall | Sprung |
|---|---|
| Körnchen → Schleife bei gehaltener Note | **15,1** |
| Filter von „offen" auf 0,45 | **31,3** |
| Filter von 0,45 zurück auf „offen" | **11,6** |

- **Ursache:**
  - `art` schaltet die Signalquelle hart um.
  - `filt = P.fc < 0.995` schaltet zwischen ungefiltert und SVF mit Null- bzw. altem Zustand um.
- **Typischer Weg:** „▶ Vorhören" läuft (hält den Ton), dann „Schleife" tippen oder den Filter-Regler aus „offen" ziehen/antippen.
- Der Kern-Test („keine-klicks", 6 Läufe) deckt genau diese Fälle nicht ab.

### 3. [mittel] Position (Marker/Regler) wirkt bei klingender Note im Körnchen-Modus nicht
- **Wiederholen (`pr3.mjs`):**
  1. Quelle: 1 s 300 Hz, danach 1 s 1200 Hz; Grundton 300; Körnchen, Bewegung 0, Streuung 0.
  2. „▶ Vorhören" tippen.
  3. Den Marker im Quellbild von 15 % auf 85 % ziehen.
- **Messung:**
  - 1200-Hz-Anteil: vorher −148 dB, nach dem Ziehen −142 dB (unverändert); bei einer neuen Note −61 dB.
  - `pr1.mjs`: Schwerpunkt der gehaltenen Note 370 Hz, neue Note 862 Hz.
- **Ursache:** `v.pos = P.pos * XL` wird nur in `on()` gesetzt.
- Bewegung und Streuung wirken live, die Schleife auch. Für Vorhören und das Marker-Ziehen ist das aber der Hauptweg; ohne Wirkung wirkt das kaputt.

### 4. [mittel] Klang-Editor einer Klangkorn-Spur: Regler ohne Wirkung, Engine-Wechsel ohne Wirkung
- **Was der Editor zeigt (`pr2.mjs`):** die Wavetable-Seite (Tabelle Digital/Vokal/Glas/Orgel, Position 30 %, Scan …).
- **Regler ohne Wirkung:** Cutoff 0,05 und Anschlag 1,5 s ändern den Klang praktisch nicht (Schwerpunkt 398 → 377 Hz).
- **Engine-Wechsel ohne Wirkung (`pr6.mjs`):**
  - Mit `setEngine` (der Weg des Editor-Kopfs) auf VA / FM / WT gestellt, spielt die Spur weiterhin Klangkorn: `korn: true`, `p.wt.h` bleibt.
  - Der Haken in spawnVoice prüft die Engine nicht.
- **Folge:**
  - Der Nutzer sieht „VA", hört aber Klangkorn.
  - Zurück zum normalen Synth geht es nur über einen Werksklang.
- Teil davon steht beim Bauer unter „Offen 1"; der Engine-Wechsel ist neu.

### 5. [mittel] Hauptfaden blockiert bei „Als Klangkorn" (Ladezeit / flüssige Seite)
- **Messung (Desktop-Chromium):**
  - Auswahl 5,7 s: Longtasks 282 ms + 94 ms (`pr1.mjs`), gesamt 647 ms bis zum offenen Blatt.
  - Quelle 10 s: Grundton (YIN) 108 ms, Spektren 44 ms, Quellbild 59 ms.
- Auf dem iPhone sind grob das 2- bis 4-Fache zu erwarten, also 0,5–1 s Stillstand der Seite, auch für Chat und Verbindung.
- Nach dem Laden eines Projekts rechnet `spk7Src` die Spektren (44 ms) beim ersten Ton im Hauptfaden.
- Vorschlag: Grundton, Spektren und Quellbild in den vorhandenen Spektral-Worker legen.

### 6. [mittel] Tastatur links im KORN-Modus: jedes Rollen erzeugt einen kurzen Ton
- **Wiederholen (`pr1.mjs`):** KORN-Modus, auf der Tastenleiste 20 % der Höhe nach unten ziehen; das rollt 16,8 Halbtöne.
- **Messung:** Aufnahme-Spitze 0,208 (Pegel einer vollen Note).
- **Ursache:** pointerdown startet den Ton sofort; aus geht er erst nach 8 px Bewegung.
- In der Basis (Probeton) klingt nur ein Tipp ohne Bewegung.

### 7. [mittel] Sichtbare Layout-Änderung ohne Freigabe (CLAUDE.md Regel 3)
Gemessen nach „Zerlegen", 5 Zeilen in der Ebenenliste (`pr4.mjs`, Basis gegen Paket):

| Größe | Ebenenliste | voll sichtbare Zeilen | Aktionsfeld |
|---|---|---|---|
| 428×926 | 180 → 129 px | **3 → 2** | 96 → 147 px |
| 926×428 | 284 → 236 px | 3 → 3 | – |
| 926×370 | 226 → 178 px | 2 → 2 | – |

- Spektrum überall unverändert.
- Die Werkzeugleiste wird 703 → 792 px breit („Klangkorn ▾" am Ende, nur durch Wischen erreichbar).
- Der Bauer hat das selbst als „vorschlagen" markiert. Es muss vor der Auslieferung im Funk freigegeben werden.

### 8. [leicht] Ecke TON|KORN überdeckt 18 px der Tastenleiste
- Tipp 8 px unter der Oberkante der Tasten: Treffer ist `spk7-cob`, der Modus springt KORN → TON (`pr1.mjs`).
- Rollen, das dort beginnt, schaltet ebenfalls um. Bei hineingezoomter Ansicht liegen dort spielbare Tasten.
- Das Wort „TAKT" an der Ecke entfällt; der Auftrag hat das erlaubt.

### 9. [leicht] Überlast und volle Akkorde
- 20 schnelle Noten mit Ausklang 6 s: Sprung 2,9 × Grenze (Stimmen-Raub ohne Blende, sobald alle 16 Plätze belegt sind) und Spitze 1,0 (weiche Grenze greift).
- Kern-Test „standard" 8 Stimmen: Spitze 0,988, also ist die weiche Begrenzung bei vollen Akkorden schon aktiv (hörbare Verdichtung/Verzerrung).

### 10. [leicht] Einsatz weich und spät; „Anschlag" 2 ms wirkt nicht
- Note bei 100 ms, Standard-Korn 80 ms / Kornform 30 % (`pr8.mjs`): 10 % Pegel bei 110 ms, 50 % bei 131 ms. Rückfall-Kontext +2,7 ms.
- Nur kurzes hartes Korn erreicht 50 % nach 5 ms.
- Song-Export: Einsatz 16 ms nach einer normalen Synth-Spur mit denselben Noten (`pr7.mjs`). Rhythmisch spürbar.

### 11. [leicht] Alle Spuren belegt: falscher Knopftext und verwaister Take
- Bei 8 Spuren fehlt der Chip „+ Neue Spur", der Knopf sagt trotzdem „Als Instrument (neue Spur)" (`pr10.mjs`).
- Ein Tipp zeigt den Hinweis „Keine Spur frei"; es gibt keinen ↶-Schritt, aber S.takes geht 0 → 1.
- Ursache: `tkAddPcmTake` läuft im imp1Step vor der `canAddTrack`-Prüfung. Das Audio bleibt verwaist bis zum Aufräumen.

### 12. [leicht] Spektral-Kopf-↶ nach „Als Instrument"
- Die Statuszeile sagt „· ↶ macht es rückgängig", aber das ↶ im Spektral-Kopf ist gesperrt.
- Rückgängig geht nur über den Hinweis-Knopf oder das App-↶ nach Schließen von Seite und Menü.
- Das gleiche Muster gibt es schon bei „Klang nachbauen".

### 13. [leicht] Kleinigkeiten in Bedienung und Klang
- „Halten" wirkt quadratisch (Hüllkurve²): 80 % ergibt 64 % Pegel (−3,9 dB).
- Korngröße, Dichte, Kornform und Streuung Ton bleiben im Schleife-Modus sichtbar, wirken dort aber nicht.
- Mini-Tastatur: schwarze Tasten ≈ 14 px, weiße 23 px breit.

### 14. [leicht] Aufräumen
- Jedes Öffnen der Spektral-Seite hängt einen weiteren `visibilitychange`-Listener an (Schutz nur je Tasten-Element).
- Spur-Engines bleiben nach Klangwechsel oder Spur-Löschen am alten `trackIn` hängen und rechnen weiter (`process` → true).
- Eine Freigabe beim Wechsel fehlt.

### 15. [leicht] Hilfe fehlt
- „Wo finde ich …?" kennt Klangkorn nicht; es gibt keinen Guide-Eintrag (Bauer: Offen 4).
