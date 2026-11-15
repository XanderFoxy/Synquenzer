# PERF1 – Plan: sichere Maßnahmen für Ladezeit, erstes Abspielen und Leerlauf

Grundlage: `MESSUNG.md` (4.69.0). Alle Maßnahmen ändern weder Aussehen noch Bedienung. Jede kommt als eigener Block
`/* PERF1x-BEGIN */ … /* PERF1x-END */`, Haken als Ein-Zeiler mit `typeof`-Schutz, vorhandene Zeilen bleiben (Ausnahme nur,
wo unten ausdrücklich genannt). Gewinne: gemessen bei 4× (in Klammern grob 1×). Reihenfolge = Nutzen je Risiko.

## Top 5

### 1. PERF1A – Aktualisierung lädt jede Fassung nur einmal (Service-Worker-/VW-Weg)
- Befund: je neuer Fassung lädt das Telefon ~2,9 MB **zweimal** (einmal `?v=<Fassung>`, beim nächsten Start vom Home-Bildschirm
  noch einmal die normale Adresse, deren Browser-Cache-Eintrag noch alt ist) und startet zweimal kalt.
- Maßnahme: `vwReload` bekommt einen Vorlauf (Block überschreibt die Funktion, Haken typeof-geschützt): zuerst
  `fetch(<normale Adresse>, {cache: 'reload'})` – das füllt Browser-Cache **und** Service-Worker-Kopie mit der neuen Fassung;
  prüfen, dass die Antwort `VERSION = '<neu>'` enthält; dann die normale Adresse laden. `?v=` bleibt als Rückfall, wenn der
  Vorlauf scheitert oder die alte Fassung liefert. Kein neuer Server, keine Änderung an `sw.js` nötig.
- Gewinn: **−2,9 MB und ein ganzer Kaltstart je Fassung**; schließt nebenbei die Lücke „alte Fassung aus dem Browser-Cache
  innerhalb 10 min“.
- Risiko: niedrig bis mittel. Nur online am Gerät prüfbar (Probe: Fassung X+1 hochladen, Telefon offen lassen, Netzprotokoll /
  Datenzähler). Rückfall unverändert vorhanden.

### 2. PERF1B – Trommel-Klänge vor dem ersten ▶ bereit
- Befund: beim ersten ▶ baut `drumBufs()` alle Trommel-Klänge synchron: **208–214 ms** in der ersten Aufgabe nach dem Tipp
  (404–559 ms lang). Grund: die Audio-Umgebung entsteht erst mit dem ersten Tipp, die Leerlauf-Schritte (`drumBufsIdle`) kommen
  zu spät.
- Maßnahme: nach „bereit“ im Leerlauf (`requestIdleCallback`, Rückfall `setTimeout`) die Schritte von
  `DrumSynth.buildSteps` mit einer gestengfreien Hilfs-Umgebung bei 48 kHz bauen (braucht nur `sampleRate` + `createBuffer`;
  `AudioBuffer` ist an keine Umgebung gebunden). Beim ersten echten Start: gleiche Abtastrate → fertige Puffer übernehmen,
  sonst der alte Weg wie heute.
- Gewinn: erste Antwort auf ▶ **~−200 ms** (~−50 ms), erstes Abspielen ohne Ruckler am ersten Schlag.
- Risiko: niedrig (Rückfall = heutiger Weg). Speicher: die Puffer (~2 s je Klang) liegen schon vor dem ersten ▶ im Speicher.

### 3. PERF1C – Bildschleife im Leerlauf und beim Abspielen entlasten (`renderPartBar`)
- Befund: im Leerlauf ist der Hauptthread 17–19 % belegt (4×), beim Abspielen ~85 %. `renderPartBar` läuft jedes Bild, liest
  `clientWidth` (erzwingt Layout) und baut die Signatur aus allen Teil-Namen: 130–193 ms je 6 s Leerlauf, 294–302 ms je 8 s
  Abspielen.
- Maßnahme: Block mit Vorprüfung vor `renderPartBar` (Haken am Anfang der Funktion, typeof-geschützt): Breite über
  `ResizeObserver` merken statt jedes Bild lesen; Signatur nur neu bauen, wenn sich Lauf-Teil, Warte-Teil, Seite, Auswahl,
  `UI.partsVer` oder die Teil-Liste (Länge + Kennung) geändert haben. Sonst sofort zurück.
- Gewinn: Leerlauf ~−3 bis −4 % Hauptthread dauerhaft (weniger Akku/Wärme), beim Abspielen ~−300 ms je 8 s (4×) – flüssigere
  Bilder und mehr Luft für den Planer.
- Risiko: niedrig (bei jeder Unsicherheit fällt die Prüfung auf „neu zeichnen“ zurück). Pflicht: Teil-Leiste in allen
  Zuständen (Lauf, Warten, schmal/breit, Umbenennen, Farbe) wie bisher – Bildvergleich.

### 4. PERF1D – Ausgelieferte Datei ohne Kommentare (Bau-Schritt, Quelle bleibt wie sie ist)
- Befund: 16,5 % des Haupt-Skripts sind Kommentare (1,1 M Zeichen) + 0,2 M Einrückung. Übersetzen kostet das nichts (gemessen
  121 → 121 ms), aber Netz, Dekodieren und HTML-Lesen hängen an den Bytes.
- Maßnahme: beim Ausliefern (Werkstatt-Schritt, nicht in der Quelle) Kommentare und Einrückung **nur im Haupt-Skript und den
  kleinen Skripten** entfernen, mit einem echten Parser (kein Regex). Worklet-Texte (`text/plain`) **nicht** anfassen: der
  Code sucht darin nach Kommentaren (`vv3Fmx` sucht `// V0d (A.4b 3)`, `lkWkCheck` sucht `const PVA = '…'`). Alle Sonden
  laufen weiter auf der Quelle **und** einmal (Rauchtest + Kernsonden) auf der ausgelieferten Datei. Die Pflicht-Zählungen
  („MS 2000“, „live: true,“, Marker) gelten für die Quelle.
- Gewinn: Übertragung **2,93 → ~2,38 MB** gzip je Fassung (−19 %), mit PERF1A zusammen −3,4 MB je Fassung gegenüber heute;
  HTML dekodieren/lesen ~−14 % (~−100 ms bei 4×).
- Risiko: mittel (neuer Bau-Schritt; Code, der eigenen Quelltext liest, muss vorher gesucht werden: `toString()` von Funktionen,
  `textContent` von Skripten). Unsichtbar für den Nutzer.

### 5. PERF1E – Code der zu Seiten erst beim Öffnen (Spektral zuerst)
- Befund: Spektral (SPK*, 575 K Code im Haupt-Skript), Video (VD/VID/VV), Import (IMP 75 K), Gesang (VX 114 K, VOX, CHR), KI
  tun beim Start nichts, werden aber jedes Mal übersetzt (Haupt-Skript übersetzen = 925 ms bei 4×, längste Aufgabe 1,2 s).
  Gemessen: ohne SPK-Blöcke **−10 % Übersetzungszeit** (121 → 110 ms ungedrosselt; ~−90 ms bei 4×), −1,1 MB Quelltext-Speicher.
- Maßnahme: dasselbe Muster wie schon bei `sq-form-src` / `sq-sr-src` / `sq-ndp-src` (`blockLoad`): Block als
  `<script type="text/plain" id="sq-spk-src">`, beim ersten Öffnen der Spektral-Seite (und vor jedem Test-Zugriff über
  `__spk`) auswerten. Erst SPK, nach grünen Sonden Video, dann Import/Gesang.
- Gewinn: SPK allein ~−90 ms (−12 ms) Start; mit Video/Import/Gesang zusammen ~−25 % Übersetzen (~−230 ms bei 4×) und die
  längste Start-Aufgabe ~1,2 → ~0,95 s.
- Risiko: **mittel bis hoch**: Haken anderer Blöcke greifen über `typeof` auf SPK-Funktionen zu (die fehlen dann bis zum
  ersten Öffnen); Menü-Einträge (z. B. „Klang nachbauen im Ebenen-Menü“, SPK11 Szenen) müssen den Block vorher laden.
  Vorher mit `topdefs` die Liste aller Namen je Block und aller Zugriffe von außen erstellen. Dies ist eine Ausnahme von
  „vorhandene Zeilen nicht umschreiben“ (Block wandert in einen Text-Block) – in NOTES begründen.

## Weitere Kandidaten (kleiner oder erst messen)

| Nr | Maßnahme | Gewinn (4×) | Risiko |
|---|---|---|---|
| 6 | Werksklänge der Bit Mask (`BM_FACTORY`, BM7, zwei sofort laufende Funktionen) erst beim ersten Zugriff bauen (Getter) | ~60–80 ms Start | mittel (viele Leser) |
| 7 | Adress-Tabelle `lktBuild` (I2a) erst beim ersten Zugriff | ~40–57 ms | niedrig–mittel |
| 8 | `demoProject` wird zweimal gebaut (Rumpf Z 32938 und `init`) – das erste Ergebnis weiterverwenden, wenn noch unberührt | ~40 ms | mittel (geteilte Objekte) |
| 9 | `gl1MxFlat` in `buildGrid` (65–96 ms) – Ergebnis zwischenspeichern bis sich Spuren ändern | ~50 ms | niedrig–mittel |
| 10 | Hilfe-Einträge (`jam2Guide` u. a.) erst beim Öffnen der Hilfe | ~10–20 ms | niedrig |
| 11 | Abspielen: Compositor-Abgleich 2,2 s je 8 s (4×). Eigenes Paket PERF2: Ebenen zählen (Lauflichter, Abspielmarke, Pegel), nur `transform`/`opacity` bewegen, viele kleine Ebenen zu einer Zeichenfläche zusammenfassen. Auf dem Telefon (anderer Compositor) gesondert messen | groß, beim Spielen | mittel |
| 12 | Service-Worker wartet bei jedem Kaltstart auf den Server (≥ 1 Rückfrage, bis 3 s). Kürzere Wartezeit oder „Kopie sofort, Prüfung danach“ wäre schneller, widerspricht aber dem erzwungenen Update (Xander 01.11.) | 0,1–3 s je Kaltstart | **Xander fragen** |
| 13 | Unveränderte Teile (Worklet-Texte 0,42 MB gzip, CSS, Bibliotheken) als eigene Dateien mit Inhalts-Kennung, die nur bei Änderung neu geladen werden; das Haupt-Skript als eigene Datei bekäme im Browser auch einen Übersetzungs-Zwischenspeicher | bis −0,6 MB je Fassung, Übersetzen beim 2. Start fast frei (nur Chromium sicher belegt) | hoch – bricht „eine HTML-Datei“, **nur mit Xanders Okay** |

Was Profis anders machen (und was hier wirklich etwas bringt): Code-Aufteilung nach Seiten (Nr. 5), Auslieferung ohne
Kommentare (Nr. 4), Arbeit in den Leerlauf schieben (Nr. 2, 6–10), Updates nur einmal laden (Nr. 1). WebGL bringt für die
Ladezeit nichts; beim Abspielen könnte eine einzige Zeichenfläche für Lauflichter/Abspielmarke/Pegel den Compositor entlasten
(Nr. 11) – das ist zuerst eine Messfrage auf dem Telefon, kein Umbau auf Verdacht.

## Reihenfolge und Prüfung

1. PERF1A + PERF1B + PERF1C zusammen (klein, niedriges Risiko, unsichtbar) → Sonden, Rauchtest, `mess/serie.sh` vorher/nachher.
2. PERF1D als Werkstatt-Schritt (Auslieferung) → Rauchtest + Kernsonden auf beiden Dateien.
3. PERF1E Spektral → alle SPK-Sonden; danach Video/Import/Gesang einzeln.
4. PERF2 (Abspielen, Compositor) eigenes Paket mit Messung auf dem Telefon.

Messung nachher immer mit `mess/serie.sh` (gleiche Läufe, Median) und `mess/spur.cjs` (Blöcke).
