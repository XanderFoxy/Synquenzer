# BAUPLAN – Cubasis-Projekt öffnen → Szenen + Song, transponierbar, so viele Spuren wie nötig

Stand 16.11.2026, ca. 21:35 UTC. Nur geplant, nichts gebaut. Quelle `rel-4780/index.html` (4.78.0, md5 68e92c03) nur gelesen;
Zeilennummern beziehen sich auf genau diese Datei. Grundlagen: `ARCHITEKTUR.md` (Variante A, Pakete XL0–XL5), `IMPORT-KERN.md`
(Prototyp `cbp-import.js`, 17/17 Tests grün, hier nachgeprüft), `PROBE-THE-WALL.md`, `cubasis/BRUECKE-KONZEPT.md` §3/§6.
**PRIVAT** – nennt Eckzahlen aus Xanders Projekt. Nicht in ein Repo, nicht hochladen. Tests nur mit synthetischen .cbp (`tests/gen_synth.py`).

Kennzeichnung: **BELEGT** = im Code/Test nachgesehen · **GESCHÄTZT** = gerechnet · **OFFEN** = muss gemessen/entschieden werden.

---

## 0. Xanders Wunsch → was gebaut wird

| Wunsch (Funk 16.11., ~21:10) | Umsetzung | Paket |
|---|---|---|
| Cubasis-Projektdatei in das Synquenzer-Format umwandeln | `.cbp` im vorhandenen Import-Wähler erkennen → neues Projekt | P2, P3 |
| „mit einem Klick in Szenen packen“ | Import-Blatt mit Teile-Vorschau, einmal „Passt“ | P3 |
| Song erkennen, Songteile → einzelne Szenen, gestaffelt | Teile-Erkennung des Kerns (Grenzen, gleiche Teile → gleiche Szene) | P2 |
| „trotzdem der Song von links nach rechts im Song-Editor“ | Wahl „Beides (empfohlen)“: Song-Lanes zeigen auf die Szenen, Varianten als eigene Song-Clips (Song bleibt Note für Note exakt) | P2, P3 |
| kleiner Loop → Szene | ein erkannter Teil → eine Szene, Clip-Länge je Spur = kleinste Wiederholung | P2 |
| „transponierfähig … spielen mit der Transponierung“ | Matrix: HALBTON (jede Taste verschiebt alle Szenen exakt) bzw. Song: Rückung je Teil | P4 |
| Spuren/Szenen erweitern „auf Basis der Originaldatei“ | Projekt wächst auf genau die gebrauchte Größe, bis 24 Spuren / 32 Szenen (Variante A) | P1, Anschluss in P3 |

Nicht in diesem Bauplan (später, eigene Pakete aus BRÜCKE §7): Akkord-Spur → Akkord-Zeilen (A7), Text-Spur (A8),
Gesang/Chor als Audio aus ZIP (A9), Insert-Effekte (A10), eingefrorene Audio-Spuren (D3), Klang-Kalibrierung (E6).

---

## 1. Reihenfolge und Wellen

Die Nummern P1–P5 benennen die Pakete. Gebaut wird in **Wellen**, damit Unabhängiges parallel läuft und Xander früh etwas in der Hand hat:

| Welle | Pakete (parallel) | Ergebnis |
|---|---|---|
| 1 | **P1a** Messung (XL0) · **P1b** Datenkern (XL1) · **P2** Import-Kern einbauen | nichts Sichtbares; Messseite für Xanders iPhone 12 |
| 2 | **P1c** Engine/Wiedergabe (XL2) · **P3** Import-Blatt (zunächst mit Grenze 8 × 8) | Import-Blatt fertig |
| 3 | **P4** Transponieren · **P5-A** Prüfen + Fassung A | **Fassung A**: Import mit bis zu 8 Spuren / 8 Szenen (falls Xander „vorab“ wählt, Entscheidung 3) |
| 4 | **P1d** Bänke Matrix/Song/Video (XL3, sichtbar, nach Funk-OK) · **P1e** Exporte (XL4) · Anschluss Import 24/32 (XL5) | – |
| 5 | **P5-B** Prüfen + Fassung B | **Fassung B**: bis 24 Spuren / 32 Szenen |

Warum so: P1 (≈ 140 Stellen, Aufwand L) ist der längste Weg und das größte Rückschritt-Risiko. Import-Kern und Import-Blatt
hängen davon nur über zwei Zahlen ab (`maxT`, `maxS`). Deshalb laufen sie parallel und lesen die Grenzen aus der App
(`MAX_T`, Szenen-Höchstzahl), statt sie fest einzutragen. Ohne P1d sind Spuren über 8 in der Matrix nicht erreichbar
(`trackBankOf`/`sceneBankOf` kennen nur 0/1, Z. 36808–36809) – Fassung A begrenzt den Import deshalb auf 8 × 8.

Arbeitsschritte (je ≤ 45 min, GESCHÄTZT): P1a 1 · P1b 2 · P1c 2 · P1d 3 · P1e 2 · P2 2 · P3 3 · P4 1–2 · P5 je Fassung 2 → **≈ 18–20 Schritte**.

---

## 2. Pakete

### P1 – Spuren und Szenen erweitern (Variante A aus ARCHITEKTUR.md)

| Teil | Inhalt | Sichtbar | Aufwand |
|---|---|---|---|
| **P1a** Messung (XL0) | Test-Build, nicht ausgeliefert: 8/12/16/24 Analog-Spuren (Poly 4, typischer Patch), leer und spielend; **Graph-Probe** (Mini-Worklet zählt zu späte Quanten – sieht auch die Web-Audio-Knoten, die `cpuLoad()` Z. 31696 nicht sieht); `buildGrid`-Zeit; Wechsel in ein 18-Spur-Projekt (Long Tasks). Ein Lauf auf Xanders iPhone 12: Seite öffnen, 60 s warten, Foto | nein (eine Messseite) | S |
| **P1b** Datenkern (XL1) | `MAX_T = 24`, `N_SCN_MAX = 32`, `NS()` = `S.scenes.length` (Z. 28488/28493), `normalizeProject` klemmt 8…32 Szenen, `orderFor(n)` (DRUMS zuletzt), Format 8 + `need: ['xl']` nur wenn NT > 8 oder NS > 8 (`fmtOf` Z. 24123, `needCalc` Z. 113417) | nein | M |
| **P1c** Engine/Wiedergabe (XL2) | alle Felder der Länge 8 → `MAX_T` (`R.slot` … Z. 32948–32954, `WKSET`, `KEYC`, `CAP`, `MODS_DIRTY`, `AU.synth`), Meter-Master `MTR_M` statt `MAX_T` (Z. 48066 ff.), Hinweis „Viel Rechenlast“ ab 16 gleichzeitig spielenden Spuren | nein | M |
| **P1d** Bänke (XL3) | [SZ] und [▲▼] blättern durch beliebig viele Bänke (1–4 → 5–8 → 9–12 …), [SZ] halten = Blatt mit allen Bänken und Szenen-Namen, Punkt „läuft in verdeckter Bank“, Song-Editor-Seiten, Video-Matrix-Bank, Farben Spur 9–24, Guide-Texte nur für XL-Projekte | **ja** → vorher Funk-Vorschlag (ARCHITEKTUR §8) | M–L |
| **P1e** Exporte (XL4) | MIDI je Szene mit allen Spuren (heute `MIDI_T = 5`, Z. 54871), Kanal-Bericht ab Spur 16, Stems: Hinweis Größe/Dauer + Auswahl; später Stems in einem Durchlauf | Hinweistext im Export-Blatt | M |

- **Risiken:** ≈ 140 Stellen über die App verstreut; `R.slot[i]` wäre für Spur ≥ 8 `undefined` statt −1 (120 Verwendungen);
  WebKit-Höchstzahl an Worklet-Eingängen (Meter 25, MIX-A/MX1/MX3 bis 24) OFFEN – Ausweg Gruppen zu 8; Xanders Festlegung
  „Matrix ohne Rollen“ (E3-26) bleibt, deshalb Bänke statt Rollen; ältere Fassungen (≤ 4.78) müssen ein XL-Projekt gesperrt
  öffnen und die Original-Datei unverändert zurückschreiben (Sperre vorhanden, Z. 52697/52708).
- **Leistungsgrenzen:** Last hängt an klingenden Stimmen, nicht an der Spurzahl. Leere Spur ≈ 0,1 % (BELEGT); 17 Web-Audio-Knoten
  je Spur ≈ 0,2–0,4 % (GESCHÄTZT) → Leerlauf 24 Spuren ≈ 7–12 % (GESCHÄTZT); ein Song wie der Testsong live am iPhone 12
  ≈ 35–60 % (GESCHÄTZT, an der Begrenzer-Schwelle 0,45/0,60). **Live-Grenze 16 oder 24 erst nach P1a.** Matrix malt nur sichtbare
  Zellen (`renderGrid` Z. 36949) → Bildrate unabhängig von der Projektgröße; `buildGrid` einmalig Ziel < 50 ms; `mxApply` beim
  Blättern ≈ 1–2 ms; Projekt-JSON < 0,3 MB; Code + < 10 KB.
- **Tests:** T1 alte Projekte **bitgleich** (alle Fixtures Format 3–7); T2 XL-Rundweg 24 × 32 (Speichern/Laden/Autosave/Cloud-Datei,
  `format 8`, `need ['xl']`); T2b XL-Datei in 4.78 = gesperrt, Original unverändert; T3 Engine (Noten auf Spur 8–23 im `noteLog`,
  Mute/Solo, Meter, Szene 9–32, Übergang 8→9 im Takt, `R.slot` nie `undefined`); T4/T5 Matrix und Song bei 390×844, 844×390, 320 px
  (GL1-Überlappung, kein waagrechtes Rollen, Bildzeit ± 10 %); T6 Exporte; T7 Leistung (LT1: keine Long Task > 100 ms beim Laden
  eines 24 × 32-Projekts); Such-Test im Build: keine `N_SCN`-Konstante, kein `new Array(8)` in Spur-Feldern.
- **Sichtbar:** nur P1d/P1e und nur in Projekten mit mehr als 8 Spuren oder Szenen. Normale Projekte sehen gleich aus.

### P2 – Import-Kern in die App einbauen

Inhalt:
1. `cbp-import.js` (45 KB, 16 KB gzip, BELEGT) als `<script type="text/plain" id="sq-cbp-src">` in die App – gleiches Muster wie
   `sq-worklet-src` (Z. 13965): wird mitgeladen, aber **erst beim Import** übersetzt und in einem **Worker** ausgeführt (Blob-Worker
   wie IMP1, Z. 111338–111356; ohne Worker stückweise im Hauptfaden). Datei per `postMessage` als übertragbarer `ArrayBuffer`
   (keine Kopie); Worker nach 20 s Ruhe beenden (wie `imp1Idle`).
2. Erkennung im vorhandenen Wähler: `imp1File` (Z. 111444) prüft vor MIDI/Audio die 8-Byte-Kennung der .cbp → Cubasis-Weg.
   Der Wähler hat absichtlich kein `accept` (Z. 111402), .cbp ist also auf dem iPhone wählbar.
3. Kern-Ergänzungen (klein): Modus „Als Song“ behält die erkannten Teil-Marken (heute: ein Block „Song“); neuer Modus
   „nur Szenen“ (Song leer); `maxT`/`maxS` aus der App; Ergebnis um Teile-Vorschau-Daten (Farbe = Szene) ergänzen.
4. App-Anbindung: Werksverweise `{factory:'f-…'}` auflösen (alle 11 Verweise des Kerns gibt es in 4.78, BELEGT), dann
   `normalizeProject`; neues Projekt über `importProjectUI` (Z. 53099) – das offene Projekt wird vorher geparkt und bleibt in der
   Projektliste. Kein Eingriff in das offene Projekt, also kein ↶ nötig.
5. Bericht wie beim DX7-Export: je Spur übernommen / angenähert / fehlt, dazu Hilfsspuren, Audio-Spuren, „kein Platz“.

- **Aufwand:** S–M.
- **Risiken:** Bisher nur **eine** echte Datei (Cubasis 3080603) gesehen – andere Fassungen können Felder anders haben (Leser ist
  tolerant: unbekannte Schlüssel stören nicht, fehlende bekommen Standardwerte; trotzdem OFFEN). Teile-Erkennung an einem echten
  und vier synthetischen Songs geprüft – Namen sind ein Vorschlag. Klang nur angenähert (Micrologue gut, MicroSonic/Drum-Kits grob).
  Index 5 ist MELODIE (`MEL_T`): eine Cubasis-Spur dort erbt MELODIE-Sonderwege (FANG-Ziel, `song.mel` …) – prüfen; ggf. die
  melodieführende Spur gezielt auf Index 5 legen. Privat: Der Worker gibt nie Noten in Logs oder Fehlermeldungen aus.
- **Leistungsgrenzen:** Startzeit der App unverändert (Text-Block wird nicht übersetzt; + 16 KB gzip ≈ 0,5 % der 3 MB, PERF1-Sonde
  vorher/nachher). Import (Node, Server, BELEGT): Lesen 6–16 ms, ganzer Import 17–30 ms warm, 60–100 ms kalt; iPhone 12
  GESCHÄTZT < 250 ms, im Worker → Hauptfaden frei. Ergebnis < 0,3 MB (Strukturkopie wenige ms). Obergrenze Dateigröße 20 MB mit
  klarer Meldung (Schutz vor Speicherspitzen). OFFEN: Projektwechsel in ein 18-Spur-Projekt (Knotenaufbau) – in P1a messen,
  bei Long Task > 100 ms den Aufbau über Frames verteilen.
- **Tests:** die 17 Kern-Tests (Node) weiter grün; neu: gleiches Ergebnis im Worker wie in Node (tief gleich); Fehlerfälle
  (keine .cbp, abgeschnitten, leer, 0 klingende Spuren, 20 MB+); Zeit unter 4× CPU-Drosselung in Chromium < 250 ms; keine Long Task
  > 50 ms im Hauptfaden während des Imports (LT1); Worker nach 20 s beendet; alle Werksverweise lösen auf; Startzeit unverändert.
  Nur synthetische .cbp (erzeugt mit `cubasis/werkzeug/cbp.py`), dazu neue: Spur 5 = Melodie-Kandidat, 3/4-Takt, Tempo-Automation (Warnung).
- **Sichtbar:** nichts (erst P3).

### P3 – Import-Blatt „Cubasis-Projekt öffnen“

Aufbau (gleiches Muster wie IMP1 „In Szenen zerschneiden“, Z. 111566, und SPK11 „Szenen anlegen“, Z. 108214 ff.):
1. **Einstieg:** Menü-Eintrag „Audio/MIDI importieren“ (Z. 77141) bleibt der eine Weg; Untertitel „· Cubasis-Projekt“. Datei wählen →
   Blatt öffnet sofort mit „liest …“, das Ergebnis kommt aus dem Worker.
2. **Kopf:** Name, Tempo, Taktart, Takte; Warnungen (Tempowechsel) in einer Zeile.
3. **Teile-Vorschau:** farbige Leiste von links nach rechts, gleiche Farbe = gleiche Szene, darunter die Namen
   (Intro · Strophe · Refrain …). Tippen auf einen Teil: **Name ändern**, **eigene Szene** / **wie Teil …** (zusammenlegen).
   Ein Loop zeigt „1 Teil → 1 Szene“.
4. **Wahl** (drei große Knöpfe, wie IMP1):
   - **Als Song** – alles im Song-Editor von links nach rechts, Teil-Marken oben; Szenen bleiben frei.
   - **In Szenen** – jeder unterschiedliche Teil eine Szene, Song leer (zum Jammen).
   - **Beides (empfohlen)** – Szenen + Song, der Song spielt die Szenen ab, Varianten als eigene Song-Clips.
5. **Transponieren** (Wahl nach Entscheidung 2, siehe P4): „In der Matrix mit der Tastatur (HALBTON)“ │ „Noten fest, Rückung im Song“.
6. **Spuren:** „18 Spuren, 6 Szenen“ – bei Grenze 8 (Fassung A) zusätzlich „10 Spuren haben noch keinen Platz“ mit Liste.
   Aufklappbar: Bericht je Spur (übernommen / angenähert / fehlt).
7. **„Passt – öffnen“**: neues Projekt; das bisherige wird vorher gesichert (`parkCurrent`) und bleibt unverändert in der Projektliste. Meldung danach:
   „Cubasis-Projekt geöffnet · 6 Szenen · Song 132 Takte“.

- **Aufwand:** M.
- **Risiken:** Bedienung muss ohne Erklärung verständlich sein (wenige Knöpfe, Standard vorgewählt); Zusammenlegen/Trennen von Teilen
  ändert Szenen und `song.own` – Neuberechnung im Worker, nicht im Hauptfaden; Namen ≤ 12 Zeichen (Szene) bzw. ≤ 24 (Spur);
  320-px-Breite: Teile-Leiste mit vielen kurzen Teilen → Mindestbreite je Teil, sonst zusammengefasste Anzeige.
- **Leistungsgrenzen:** Blatt öffnet < 100 ms; Teile-Leiste = höchstens ≈ 64 einfache Elemente (kein Canvas); Neuberechnung nach
  „Name ändern“ ohne Kern-Lauf, nach „zusammenlegen“ ein Kern-Lauf im Worker (≈ 20–30 ms warm, GESCHÄTZT iPhone < 100 ms).
- **Tests (Playwright, Touch):** drei Wahlen ergeben die erwarteten Strukturen (Szenen/Song-Lanes/Marken/`song.own`); Song exakt
  (Abspiel-Nachbau gegen Original, wie im Kern-Test) auch nach Umbenennen/Zusammenlegen; Abbrechen ändert nichts; das vorige Projekt
  liegt in der Liste und ist unverändert; Fassung A: mehr als 8 Spuren → Hinweis + Liste; 390×844, 844×390, 320 px ohne Überlappung
  (GL1); Guide-Eintrag; Fotos.
- **Sichtbar:** ja – neues Blatt, neuer Untertitel im Menü. **Dieser Bauplan ist der Funk-Vorschlag dafür.**

### P4 – Transponieren

So wirkt die App heute (BELEGT):
- Spuren mit **⇅ fest** (`follow:false`) lässt der Akkord-Träger in Ruhe; die **Rückung je Teil** (Marken-Blatt, −2 … +2, Z. 90539 ff.)
  und „Abschnitt transponieren“ (TRP1, ±1 … ±12, Z. 91475) nehmen sie trotzdem halbtongenau mit (`jam3FtNow`, Z. 91221; `outPitch`
  Z. 33150). Drums nie.
- Harmonie-Modus **HALBTON** (`chromatic`, Einstellung Z. 52438): der Träger verschiebt folgende Spuren **exakt in Halbtönen**
  (Z. 20226). „Eine Skala“ ist dabei aus (`osActive` Z. 33032).

Inhalt:
1. **Matrix (live):** Import-Wahl HALBTON → importierte Spuren ⇅ folgt, Eine Skala aus, Projekt-Harmonie HALBTON, Clip-Tonart =
   erkannte Song-Tonart. Jede Taste verschiebt alle Szenen exakt; der Grundton der Song-Tonart = Original. Oktav-Verhalten wie
   eingestellt (`octaveMode` nächster Weg / absolut, Z. 20266). Im Kern schon vorhanden (`transpose:'halbton'`, getestet).
2. **Song:** Jeder erkannte Teil hat eine Marke → Rückung je Teil und TRP1 wirken sofort, in beiden Wahlen.
3. **Ausbau, nur wenn Xander im importierten Projekt auch eigene AKKORD-Spuren mischen will:** je Spur „⇅ Halbton“
   (gespeichert als `follow:false` + Merkmal `xs:1` → ältere Fassungen spielen die Noten fest und exakt, nichts verbiegt sich).
   Eigenes Mini-Paket (M), nur nach Funk-OK.

- **Aufwand:** S (Punkte 1–2); Ausbau 3: M.
- **Risiken:** HALBTON ist projektweit – eigene neue Spuren im importierten Projekt folgen dann auch nur in Halbtönen (nicht AKKORD);
  Oktavsprung beim „nächsten Weg“ (z. B. F♯ → G springt eine Oktave) – im Test sichtbar machen und im Guide erklären; Begleiter
  (BEG1) schaltet „Eine Skala“ bei TONART ab – Zusammenspiel prüfen.
- **Leistungsgrenzen:** keine zusätzliche Last – die Abbildung je Note gibt es schon (`mapOut`, Z. 33132); HALBTON ist der billigste
  Weg (Skala unverändert).
- **Tests:** `noteLog`: für jede Taste −12 … +12 ist jede importierte Note um genau k Halbtöne versetzt, keine eingerastet, Drums
  unverändert; Rückung +1 im Song versetzt feste Spuren, MIDI-Export und Video-Ton gleich; Wahl „Noten fest“: Tastatur ändert nichts,
  Rückung wirkt; alte Projekte unverändert (HALBTON nur im importierten Projekt).
- **Sichtbar:** ja, wenn HALBTON gewählt ist (Modus-Anzeige im importierten Projekt) → **Entscheidung 2**.

### P5 – Prüfen und ausliefern (je Fassung)

1. Paket-Tests (P1–P4) + bestehende Regression (`run.sh all`: mtx, chq, gl1, vv, mix3, jam, beg1 …) + Rauchtest.
2. Fach-Prüfung durch einen zweiten Prüfer (Befunde nachprüfen und beheben, wie bei jedem Paket).
3. Leistung: PERF1-Sonde (Ladezeit, Startgröße) vor/nach, LT1 (Long Tasks), bei Fassung B die Live-Grenze aus P1a.
4. Lokaler Probelauf mit Xanders Datei **nur hier im Scratchpad** (nie in Tests, Repo oder Fotos für die Öffentlichkeit):
   Teile wie in `PROBE-THE-WALL.md`, Song exakt.
5. Auslieferung wie gewohnt: Sonden, SPIELSYSTEM.md, Werkstatt, Funk-Antwort (CLAUDE.md Regel 4). Xander prüft am iPhone 12 mit
   seiner eigenen Datei.

- **Aufwand:** M je Fassung.
- **Risiken:** Fassung B berührt viele Stellen → Fassung A zuerst senkt das Risiko (Daten- und Engine-Teil von P1 laufen in A
  schon unsichtbar mit und werden im Alltag erprobt, abgesichert durch T1 „bitgleich“).

---

## 3. Leistung – Zusammenfassung

| Was | Wert | Stand |
|---|---|---|
| App-Start | unverändert, + 16 KB gzip (≈ 0,5 %) als nicht übersetzter Text-Block | GESCHÄTZT, P2 misst |
| Import einer .cbp (636 KB, 43 Spuren) | Node 17–30 ms warm; iPhone 12 < 250 ms, im Worker | BELEGT / GESCHÄTZT |
| Projekt mit 18–24 Spuren, Leerlauf | ≈ 7–12 % bei 24 Spuren | GESCHÄTZT, P1a misst |
| Song live mit 15–20 gleichzeitigen Spuren | ≈ 35–60 % iPhone 12 | GESCHÄTZT, P1a misst → Live-Grenze 16 oder 24 |
| Matrix-Bildrate | unabhängig von der Projektgröße (nur sichtbare Zellen) | BELEGT (Code) |
| Speicher | Projekt < 0,3 MB, Worklets 24 Spuren < 5 MB | GESCHÄTZT |

---

## 4. Entscheidungen für Xander

1. **Obergrenze 24 Spuren / 32 Szenen je Projekt** (Empfehlung). Live gleichzeitig 16 oder 24 – nach der Messung an seinem iPhone 12.
2. **Transponieren in der Matrix: HALBTON im importierten Projekt** (Empfehlung) – oder Noten fest und Transponieren nur im Song (Rückung).
3. **Fassung A vorab** (Import mit höchstens 8 Spuren, große Songs zuerst unvollständig) – oder warten bis Fassung B.

Später im Funk (mit P1d): Farben der Spuren 9–24, [＋ Spur]/[＋ Szene] von Hand über 8 hinaus, „Viel Rechenlast“-Hinweis oder Einfrieren.
Eine Bitte an Xander (keine Entscheidung): die Messseite aus P1a einmal 60 s am iPhone 12 offen lassen und ein Foto schicken.
