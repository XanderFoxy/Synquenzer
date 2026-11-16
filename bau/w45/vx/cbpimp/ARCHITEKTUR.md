# ARCHITEKTUR – mehr als 8 Spuren / 8 Szenen im Synquenzer

Stand 16.11.2026, ca. 21:16 UTC. Grundlage ist ausschließlich `rel-4780/index.html` (4.78.0, md5 68e92c03, 114 431 Zeilen).
Die Datei wurde nur gelesen, gebaut ist nichts. Alle Zeilennummern beziehen sich auf genau diese Datei.
**PRIVAT** – nennt Eckzahlen aus Xanders Projekt. Nicht in ein Repo, nicht hochladen.

Kennzeichnung: **BELEGT** = im Code oder in einer Messung nachgesehen · **GESCHÄTZT** = gerechnet, nicht gemessen · **OFFEN** = muss gemessen werden.

---

## 0. Kurzfassung

1. Die Grenze „8“ ist im Code gut gebündelt: `MAX_T = 8, N_SCN = 8` (Z. 28488) mit 51 bzw. 26 Verwendungen. Dazu kommen
   ≈ 15 Laufzeit-Felder mit fester Länge 8 (z. B. `R.slot`, Z. 32949) und die Bänke „SZ 1–4 │ 5–8“ und „Spur-Seite 1/2“,
   die fest nur **zwei** Bänke kennen (Z. 36808–36932). Insgesamt sind es ≈ 140 Stellen. Sie sind mechanisch zu ändern,
   aber über die ganze App verstreut.
2. **Die Rechenlast hängt an den klingenden Stimmen, nicht an der Zahl der Spuren.**
   - Eine leere Spur kostet im Worklet ≈ 0,1 % (BELEGT, Spec v3 §4.2). Der Prozessor rechnet ohne Stimmen fast nichts (Z. 18060–18112).
   - Dazu kommen je Spur ≈ 17 Web-Audio-Knoten (Z. 30214 ff.). Das ergibt GESCHÄTZT 0,3–0,5 % Leerlauf je Spur, also ≈ 7–12 % bei 24 Spuren.
   - Die Stimmen deckelt schon heute der CPU-Begrenzer (`LIM`, Z. 31694). 24 Spuren gehen also, solange nicht zu viele Stimmen gleichzeitig klingen.
   - Für „The Wall“ (15–20 Spuren je Teil gleichzeitig) liegt die Live-Last am iPhone 12 GESCHÄTZT bei 35–60 %. Das ist an der Grenze und muss gemessen werden (Paket XL0).
3. **Empfehlung: Variante A, „dynamische Größe mit Bänken“.**
   - Ein Projekt hat so viele Spuren und Szenen, wie es braucht: Spuren 6–24 (heute 6–8), Szenen 8–32 (heute genau 8).
   - Die Matrix bleibt, wie Xander sie kennt: 4 oder 8 Spalten ohne Rollen, dazu Spur-Seiten. Die vorhandenen Umschalter [SZ] und [▲▼] blättern statt durch 2 durch beliebig viele Bänke.
   - Alte Projekte bleiben **bitgleich**: Ein Projekt mit ≤ 8 Spuren und genau 8 Szenen wird geschrieben wie heute.
   - Erst ein größeres Projekt bekommt Format 8 und das Merkmal `need: ['xl']`. Ältere App-Fassungen öffnen es dann nur gesperrt, ohne es zu überschreiben. Diese Sperre gibt es schon (Z. 24123, 52697, 113445).
4. Obergrenzen: **24 Spuren / 32 Szenen** im Datenmodell. Ob am iPhone 12 alle 24 Spuren live klingen dürfen oder nur 16 (mit Einfrieren als Ausweg), entscheidet die Messung XL0.
5. **Paketschnitt:**
   - XL0: Messung
   - XL1: Datenkern, unsichtbar
   - XL2: Engine und Wiedergabe
   - XL3: Matrix, Song-Editor und Video (sichtbar; vorher im Funk vorschlagen)
   - XL4: Exporte
   - XL5: Anschluss an den Cubasis-Import

   Der Import (BRÜCKE A6) kann schon vor XL3 auf den neuen Datenkern bauen.

---

## 1. Ausgangslage (BELEGT)

| Was | Wo | Heute |
|---|---|---|
| Grenzen | Z. 28488 `const MAX_T = 8, BASE_T = 6, N_SCN = 8, DRUM_T = 4, MEL_T = 5;` | höchstens 8 Spuren, genau 8 Szenen |
| Feste Plätze | Z. 28485–28491 | 0–3 Synth 1–4, **4 DRUMS**, **5 MELODIE**, 6–7 Synth 5/6. „The data index never moves“. Anzeige-Reihenfolge `S.ui.order`, DRUMS zuletzt (`DEF_ORDER`) |
| Szenen-Zahl | Z. 28493 `const NS = () => N_SCN;` | **schon als Funktion gekapselt** (64 Aufrufe) – gut für eine dynamische Zahl |
| Spur-Zahl | Z. 28492 `const NT = () => S.tracks.length;` | dynamisch (262 Aufrufe) |
| Teile (Teil-Leiste) | Z. 28588 `N_PART = 8` | bleibt; Teile sind Schnappschüsse, nicht die Song-Teile im Song-Editor (`song.marks`, unbegrenzt) |
| Song | `song.lanes[t] = [{bar, slot}]`, `song.own` (≤ 256 eigene Clips), `song.marks` (Z. 28995–29003) | Song-Editor zeigt Szenen-Belegung je Spur; `slot` wird auf `N_SCN − 1` begrenzt |
| Sperre für Neueres | `fmtOf` Z. 24123, `PROJECT_FORMAT_READ = 7` Z. 24112, `needCalc/needNorm` Z. 113417/113445, `nvLockOf` Z. 52697 | eine ältere Fassung öffnet ein neueres Projekt nur gesperrt und schreibt die **Original-Datei** unverändert zurück (`nvFileOf`, Z. 52708) |

„The Wall“ zum Vergleich (privat, ANALYSE-THE-WALL.md §1, BRÜCKE §6):
- 43 Spuren, davon 24 klingend (20 MIDI, 4 Audio).
- 10 Song-Teile, dabei je Teil 14–20 hörbare Spuren gleichzeitig.
- Unterschiedliche Teile: A/B-Akkordblöcke plus Sonderteile. Das sind ≈ 8–10 Szenen, mit Varianten ≈ 12.
- Ziel: Der Import soll ≈ 12 Szenen × 20–24 Spuren abbilden können.

---

## 2. Betroffene Stellen (Zeilen in 4.78.0)

### 2.1 Datenmodell, Normalisieren, Migration

| Z. | Stelle | Änderung |
|---|---|---|
| 28488 | Konstanten | `MAX_T = 24` (Datenobergrenze), neu `N_SCN_MAX = 32`, `N_SCN_DEF = 8`; `N_SCN` als Konstante entfällt → überall `NS()` |
| 28493 | `NS()` | `S.scenes.length` statt fest 8 |
| 28491, 28499 | `DEF_ORDER`, `orderFor(n)` | für n > 8: `[0,1,2,3,5,6,7,8,…,n−1,DRUM_T]` (DRUMS bleibt zuletzt) |
| 28497, 37116–37117 | `trackNameOf`, `svShort`, `trackTag` | funktionieren schon für i ≥ 8 („Synth 7“, „S7“) – nur prüfen |
| 28498 | `emptyClips()` | Länge = `NS()` des Zielprojekts (Parameter), nicht fest |
| 28545 | `newProjectRaw0` | bleibt 8 Szenen (neue Projekte unverändert) |
| 28877, 28913 | `normalizeProject` Szenen | `obj.scenes.slice(0, N_SCN)` → `slice(0, clamp(obj.scenes.length, 8, N_SCN_MAX))`; fehlende Szenen auf 8 auffüllen (nie weniger als 8) |
| 28882 | Spuren übernehmen | Schleife bis `MAX_T`; Regel „Drum nur auf Index 4“ bleibt |
| 28905–28908 | `ui.selS`, `sceneBank`, `trackBank` | Klemmen auf `NS()−1`; Bänke 0…B−1 statt nur 0/1 |
| 28911, 37497 | `parts` (`normPart(…, nt)`) | `slots` je Spur bis 24; Slot-Klemme auf `NS()−1` (Z. 37428) |
| 28915 | `normSong(obj.song, p.key, nt)` | zusätzlich `ns` übergeben; Z. 29002 `slot` auf `ns−1` |
| 29046–29057 | Song-Take-Herkunft (`from.t/s/e/prev`) | `MAX_T`/`N_SCN` → nt/ns des Projekts |
| 37454 | Teil-Lanes | Slot-Klemme `ns−1` |
| 83373, 83822, 85095 | `s0OffNorm`, `konChNorm`, `sx11MaskNorm` | Klemmen `N_SCN−1`/`MAX_T−1` → ns/nt |
| 52911 | `projBars` | läuft schon über Szenen, auf `NS()` umstellen |
| 60488 | Take in Szene s (STIMME) | Klemme `NS()−1` |

**Migration:** Es braucht keine. Ein Projekt ohne Zusatzszenen und mit ≤ 8 Spuren läuft durch denselben Weg wie heute. Ein Test prüft, dass dabei **bitgleich** gespeichert wird (Testplan T1).

### 2.2 Speichern, Format, ältere Fassungen

| Z. | Stelle | Änderung |
|---|---|---|
| 24112 | `PROJECT_FORMAT_READ = 7` | → 8 |
| 24123–24133 | `fmtOf(p)` | zuerst: `p.tracks.length > 8 \|\| p.scenes.length > 8` → **8** (wie T1 → 7) |
| 113416–113430 | `KNOWN_NEED`, `needCalc` | + `'xl'`, wenn mehr als 8 Spuren oder Szenen. Fassungen ab N8 sperren über `need` |
| 52697 | `nvLockOf` | unverändert; ältere Fassungen sperren automatisch: vor N8 über das Format, ab N8 über `need` |
| 24560, 24774, 53676 | Schreibwege (Datei, Autosave, Cloud-Meta) | benutzen schon `fmtOf` – nichts weiter |

Damit gilt: 4.78 und älter öffnen ein XL-Projekt **gesperrt**. Sie zeigen es nur an und speichern die Original-Datei unverändert weiter.
Sie verlieren also keine Spuren 9–24 und keine Szenen 9–32. Das ist dieselbe Logik wie bei Format 6 (Chor) und 7 (Taktarten).

### 2.3 Engine, Worklet, Wiedergabe-Zustand

| Z. | Stelle | Änderung |
|---|---|---|
| 30004, 75110 | `AU.synth = new Array(8)` (live und Offline-Render) | `new Array(MAX_T)` |
| 30239 | `syncTrackChains` | läuft bis `MAX_T`, baut Ketten nur für `i < NT()` – passt |
| 30214–30234 | `buildChain`: 14 Gain, 1 Panner, 2 WaveShaper je Spur | unverändert; Kosten siehe §3 |
| 25876 | `H.track`: **ein AudioWorkletNode je Synth-Spur** | unverändert (24 Knoten möglich). Variante „mehrere Spuren in einem Knoten“ siehe §4 (verworfen) |
| 30727, 30741 | `mkInRoute` (Vocoder-Eingänge) | `MAX_T` – passt |
| 30986, 30996 | `WKSET`, `WKFM`, `WKFM_AT` (Länge 8) | → `MAX_T` |
| 32684 | `percBoot` | `MAX_T` – passt |
| 32948–32954 | `R.slot`, `R.cstart`, `R.pend`, `R.prev`, `R.own`, `R.lastNote`, `R.songOverride` (je `new Array(8)`) | → `MAX_T`. **Wichtig:** `R.slot[i]` ist sonst `undefined` statt −1 (120 Verwendungen) |
| 33720 | `R.songPlay.cs = new Array(8)` | → `MAX_T` |
| 34132, 34254 | Song-Aufnahme `ev` | `MAX_T` – passt |
| 36422, 52885 | `KEYC.cache` (Länge 8) | → `MAX_T` |
| 36518 | `CAP.last` (Länge 8) | → `MAX_T` |
| 43577 | `MODS_DIRTY` (Länge 8) | → `MAX_T` |
| 52853 | Laden: `R.slot` … für `i < MAX_T` | passt |
| 31694–31760 | CPU-Begrenzer `LIM` (Summe `E.load`, Stufen bei 0,45/0,60/0,75) | unverändert. Er sieht aber **nur die Worklet-Last**, nicht die Web-Audio-Knoten; siehe §3 „Graph-Probe“ |
| 35776–35791 | `cpuHeavyCheck` (Hinweis „Viel Last“) | Regel ergänzen: ab 16 gleichzeitig spielenden Spuren ein Hinweis (nur nach Messung) |
| 28529–28530 | Synth 5/6 starten mit Poly 4 | gilt dann für alle Zusatzspuren (i > DRUM_T) – passt schon |
| 71471–71500 | G10J (Vorlage-Verstärkung) | `MAX_T` – passt |

### 2.4 Pegel-Meter

| Z. | Stelle | Änderung |
|---|---|---|
| 48066 | `MTR_IN = MAX_T + 1` (Master = Eingang `MAX_T`) | neu `MTR_M` = Master-Eingang. Der Index ist nicht gespeichert, nur zur Laufzeit; trotzdem überall `k === MAX_T` → `k === MTR_M` (Z. 48169–48173, 66972, 75440, 75513, 75647–75648, 78024–78025, 78302) |
| 48104, 48111 | Meter-Worklet mit `numberOfInputs: MTR_IN` | 25 Eingänge (GESCHÄTZT ≈ 10 µs je Quantum, vernachlässigbar). OFFEN: Höchstzahl der Eingänge in WebKit prüfen |

### 2.5 Matrix (Hauptansicht)

| Z. | Stelle | Änderung |
|---|---|---|
| 36803–36806 | `MX` (Bänke) | `sceneBank`/`trackBank` als Zahl 0…B−1 |
| 36808–36809 | `sceneBankOf`/`trackBankOf` (nur 0/1) | Zahl begrenzen auf Bank-Zahl |
| 36823 | `MX.scenes = [0..3]+bank*4 \| [0..7]` | `cols = MX.cols (4/8)`, `MX.scenes = range(bank*cols, min(NS(), (bank+1)*cols))` |
| 36815–36818, 36865–36880 | Spur-Seiten `MX.pages` | rechnen schon beliebig viele Seiten (`chsPages`); nur `setTrackBank` begrenzt auf 0/1 |
| 36838–36840, 36898–36926 | `buildGrid` / `mxApply`: Zellen für alle `N_SCN`; Füller `3 × (N_SCN+2)` | Schleifen auf `NS()`. Zellen nur für tatsächliche NT × NS bauen (dynamisch, siehe §3 DOM) |
| 36931–36932 | `setSceneBank`/`setTrackBank` | beliebige Bank; „nächste“ = `(b+1) % B` |
| 37066–37075 | Punkt am Umschalter („läuft in verdeckter Bank“), Beschriftung `'1–4'/'5–8'` | Beschriftung aus Bank berechnen („9–12“); Punkt, wenn in **irgendeiner** verdeckten Bank etwas läuft |
| 43104, 43108, 52062 | Auswahl folgt Bank (`R.selS >= 4`) | Bank = `floor(s / cols)` |
| 52228, 55362, 51907 | Federnde Umschalter, Tipp auf [SZ] | nächste Bank statt 1−b |
| 96331–96336, 96500–96501 | MTX-2 Rand-Blättern beim Ziehen, „Szene duplizieren → SZ 5–8“ | ±1 Bank; Text aus Bank |
| 73127–73189 | CHS: Chor-Zeilen der STIMME je Szene (`N_SCN`) | → `NS()` |
| 81710 | Layout-Schlüssel | enthält Bänke schon; NS ergänzen |
| 82846–82847 | Test-API `sceneBank`/`trackBank` | Zahl statt 0/1 |
| 56387 | Tastatur `Digit1–4` startet Szene 1–4 | Ziffern auf die **sichtbare** Bank beziehen (sonst unverändert) |
| 25–28 | Spurfarben `--t1 … --t8` (+ `a`), 22 Stellen `var(--t${i+1})` | Helfer `tcVar(i)`; Farben 9–24 siehe §8 (sichtbar → vorschlagen) |
| 35674, 35707–35751, 96560, 96832–96841, 96989–97006, 97049, 97280, 97566–97567, 108163, 108266 | `canAddTrack`, Texte „Höchstens 8 Spuren“, MTX3/SPK11 „freie Plätze = MAX_T − NT()“ | rechnen automatisch mit dem neuen Wert. Texte mit fester „8“ (Z. 35708, 59563) anpassen. Ob [＋ Spur] von Hand über 8 hinaus geht, entscheidet Xander (§8) |
| 35675 | `removableTrack` (nur die zuletzt angefügte) | bleibt (Daten-Indizes ohne Lücken) |

### 2.6 Song-Editor

| Z. | Stelle | Änderung |
|---|---|---|
| 37108–37117 | `SV` (Zeilen = sichtbare Spuren) | unverändert |
| 37230–37256 | `svLayout`: Seiten beliebig, aber `trackBankOf()` nur 0/1; `SV.bankVp` mit fester „8“ (Z. 37250) | Seite 0…P−1; `bankVp` mit `max(8, NT())` |
| 37186 | [▲▼] im Song | `(b+1) % P` – passt nach 2.5 |
| 41751 | Ordnungs-Schlüssel | passt |
| Song-Zellen | Szenen-Nummer je Takt (`slot+1`) | bis „32“ zweistellig – Zellbreite 36 px reicht (prüfen 320 px) |

Der Song bleibt „von links nach rechts“, wie Xander es will. Die Song-Teile stehen als Marken über dem Lineal (`song.marks`).
Die Spuren werden geblättert wie heute (DRUMS bleibt sichtbar).

### 2.7 Mixer, Auto-Master, Analyse

| Z. | Stelle | Änderung |
|---|---|---|
| 66921 | MIX-A Einschub je Spur (`synq-mixa`, mode track) | je Spur ein Knoten, nur wenn benutzt – skaliert |
| 66993 | Auto-Master | Master, unabhängig von der Spurzahl |
| 67021–67025, 67652–67655, 68748–68756 | Analyse-Worklets mit `numberOfInputs: NT()` (MIX-A, MX1, MX3) | skaliert. OFFEN: 24 Eingänge in WebKit testen; sonst Gruppen zu je 8 |
| 93506 ff., 94668 | Rollen (`snd1Roles`, `gen4Roles`, `mx2Roles`) über `S.tracks.map` | skaliert; feste Indizes nur DRUM_T/MEL_T – bleiben |
| MIX-Blatt (Spurliste) | Liste je Spur | bei 24 Einträgen rollbar; prüfen |

### 2.8 Exporte

| Z. | Stelle | Änderung |
|---|---|---|
| 54871–54872 | `MIDI_T = 5`: MIDI je Szene / alle Szenen nur Synth 1–4 + DRUMS | für XL-Projekte alle Spuren (wie `va1MidiSong`) |
| 54874 | `midiCh(i)`: 0–8, 10–15, ab Spur 15 alle auf Kanal 16 | bleibt; jede Spur hat ihren eigenen MTrk-Block, Cubasis trennt nach Block. Kanal-Doppelung im Bericht nennen |
| 54875 | `midiArrs` (`MAX_T`) | passt |
| 76883–76944 | `va1MidiSong` (alle Spuren) | passt |
| 76784–76795 | `va1Stems`: **ein Offline-Durchlauf je Stem** | bei 20+ Stems dauert das N × die Song-Renderzeit. Vorschlag XL4b: Stems in **einem** Durchlauf mit Abgriff je Spur (wie `synq-mx3-cap`, Z. 68766), dabei Blob-Stücke statt eines großen Puffers |
| 76815 | `va1ZipBlob` (STORE, Blob-Stücke) | passt. Größe: Stereo PCM16 ≈ 11,5 MB/min je Stem → bei 4,5 min × 20 Stems ≈ 1 GB. Hinweis und Auswahl der Stems nötig |
| 78633–78645 | Video-Matrix: 4 Spalten, Bank `hi >= 4 ? 4 : 0`, Seite nur 0/1 | Bank = `floor(hi/4)*4`, Seite 0…P−1 |
| 75440, 75513, 78021–78025, 78302 | Video-Meter, Master = `MAX_T` | → `MTR_M` (siehe 2.4) |

### 2.9 Undo, Speicher

- Undo (Z. 34819–34840): 60 Einträge, Schnappschüsse je Clip, Spur oder Song. Das skaliert mit der Größe einer Aktion, nicht mit der Projektgröße.
  „Spur entfernen“ (Z. 35716–35735) und „Szene duplizieren“ arbeiten je Index. Eine neue Undo-Art `scenes` (Szene anfügen/entfernen) ist nötig, falls Xander [＋ Szene] von Hand bekommt.
- Projektgröße: „The Wall“ hat ≈ 3 600 Noten. Kompakt sind das ≈ 70–100 KB, dazu 24 Klänge à ≈ 3 KB. Insgesamt **< 0,3 MB JSON** (GESCHÄTZT). Autosave, Cloud und Undo bleiben unkritisch.

### 2.10 Feste Rollen-Indizes (Remix, Begleiter, Chor, Melodie)

- `DRUM_T = 4` (257 Stellen) und `MEL_T = 5` (54) **bleiben**. Zusatzspuren werden nur hinten angefügt (8, 9, …). Dadurch verschiebt sich kein fester Index.
- STIMME (`stimmeT()`, 213 Stellen) und „Original“ werden über Merkmale gefunden, nicht über den Index. Das passt.
- Chor-Lanes c1…c8 hängen unter STIMME und sind von MAX_T unabhängig.
- Remix (GEN3/GEN4), Klang-Stile (SND1) und Begleiter (BEG1) bestimmen Rollen über den Inhalt (`S.tracks.map`). Sie wirken also auch auf Spuren ≥ 8.
  OFFEN ist nur, ob die Blätter bei 24 Spuren übersichtlich bleiben (rollbare Liste).
- Eine Drum-Spur gibt es weiterhin nur einmal. Ein zweites Cubasis-Kit wird wie bisher als MTX3-Einzelspur oder PERC-Spur übernommen.

### 2.11 Guide und Texte

Diese Stellen sprechen von „1–4/5–8“ oder „8 Spuren“: Z. 51907, 52502, 52507, 55826, 55967, 96253–96254, 35708, 35719, 35760.
Sie bekommen neue Texte, aber nur für XL-Projekte. Für normale Projekte bleibt der Text gleich.

---

## 3. Leistung und Speicher (iPhone 12)

### 3.1 CPU

| Posten | Wert | Quelle |
|---|---|---|
| leere Synth-Spur (Worklet) | ≈ 0,1 % | **BELEGT** (Spec v3 §4.2, „Leere Spuren kosten nichts (gemessen 0,1 %)“); Code: ohne Stimmen nur `fill(0)` + LFO-Phase (Z. 18056, 18103–18110) |
| eine VA-Stimme | 0,47–1,07 % Echtzeit (Xeon, Node) | **BELEGT** (CHANGES-MK: MK1-24, MK4-11). iPhone-Faktor **OFFEN** (GESCHÄTZT 1–2×) |
| Web-Audio-Kette je Spur | 17 Knoten (`buildChain`), + MIX-A-Knoten, wenn benutzt | Zahl BELEGT; Kosten GESCHÄTZT 0,2–0,4 % je Spur |
| Leerlauf 24 Spuren | GESCHÄTZT 7–12 % | 24 × (0,1 % + 0,2–0,4 %) |
| Live 16 Spuren (Ø 2–3 klingende Stimmen) | GESCHÄTZT 25–45 % | 40 Stimmen × 0,5–1 % + Leerlauf |
| Live 24 Spuren („The Wall“, 14–20 aktiv, Ø 2–3 Stimmen) | GESCHÄTZT 35–60 % | an der Begrenzer-Schwelle (Stufe 1 ab 0,45, Stufe 2 ab 0,60) |
| Offline (Song-WAV, Stems, Video) | nicht an Echtzeit gebunden | dauert länger. VV3-03: 3-min-Song 9:16 2,39× schneller als Echtzeit (bei heutiger Spurzahl) |

Folgerungen:
1. Die Zahl der Spuren ist kaum ein Problem; entscheidend ist die Zahl der Stimmen. Die vorhandenen Stimmen-Deckel und der Begrenzer greifen ohne Umbau.
2. **Lücke im Messen:** `cpuLoad()` (Z. 31696) summiert nur die Worklet-Lasten. Die Kosten der ≈ 400 Web-Audio-Knoten bei 24 Spuren sieht niemand.
   Deshalb kommt in XL0 eine **Graph-Probe** dazu: Ein Mini-Worklet misst den Abstand der `process()`-Aufrufe und zählt zu späte Quanten.
   Gemessen wird live mit 8, 12, 16 und 24 Spuren.
3. Regel nach Messung (Vorschlag):
   - Liegt die Last mit 24 Spuren live unter 0,45 (Graph und Worklets zusammen): Grenze 24.
   - Sonst gilt live 16 Spuren gleichzeitig. Die übrigen Spuren klingen „eingefroren“ als Audio (BRÜCKE D3/E9), oder der Hinweis „Viel Rechenlast“ erscheint.
   - Die Daten können in jedem Fall 24 Spuren halten.

### 3.2 Speicher und Ladezeit

| Posten | GESCHÄTZT | Bemerkung |
|---|---|---|
| Projekt-JSON („The Wall“-Größe) | < 0,3 MB | Laden/Normalisieren < 20 ms |
| Worklet-Instanzen | < 0,1 MB je Spur ohne MK-Effekte; MK-Delay ≈ 0,4–1,5 MB je MK-Spur (`mkFxMem`) | 24 Spuren typisch < 5 MB |
| Matrix-DOM | je Zelle ≈ 10 Elemente (Z. 36916). 24 × 12 = 288 Zellen ≈ 3 200 Elemente; 24 × 32 = 768 Zellen ≈ 8 500 Elemente | `renderGrid` (Z. 36949) malt nur **sichtbare** Zeilen/Spalten → die Bildrate hängt nicht an der Projektgröße. `buildGrid` einmalig: OFFEN (Ziel < 50 ms am iPhone 12; sonst Zellen erst beim ersten Blättern anlegen) |
| `mxApply` beim Blättern | schaltet `mxoff` an allen Zellen | ≈ 768 classList-Schalter ≈ 1–2 ms – in Ordnung |
| Ladezeit der App | unverändert | keine neuen Bibliotheken; der Code wächst GESCHÄTZT um < 10 KB |

---

## 4. Varianten

| | **A – Dynamische Größe mit Bänken (Empfehlung)** | **B – Rollbare Matrix** | **C – Grenzen bleiben, Import faltet** |
|---|---|---|---|
| Idee | Projekt wächst auf bis 24 Spuren / 32 Szenen; Matrix zeigt wie heute 4/8 Spalten + Spur-Seiten; [SZ] und [▲▼] blättern durch **alle** Bänke | Matrix rollt waagrecht (Szenen) und senkrecht (Spuren), Köpfe kleben | 8 × 8 bleibt; Import legt die 8 wichtigsten Teile als Szenen ab, Varianten als eigene Song-Clips (`song.own`), Spuren > 8 werden zusammengelegt (D1) oder als Audio eingefroren (D3) |
| Erfüllt Xanders Wunsch | ja: Song wird Szenen, Song-Editor zeigt ihn, Spuren „wie gebraucht“ | ja | nur teilweise (keine echten Zusatzspuren) |
| Sichtbare Änderung | klein: Umschalter-Beschriftung („9–12“, „2/3“), mehr Seiten | groß: Bedienung ändert sich (Rollen statt Blättern), Konflikte mit Gesten (Kopf waagrecht = Lautstärke, Clip-Ziehen, MTX-2 Rand-Blättern, CHQ-Rollkasten) | keine |
| Xanders Festlegung E3-26 „Matrix ohne Rollen“ | bleibt | gebrochen | bleibt |
| Code-Stellen | ≈ 140, mechanisch | ≈ 140 + neues Layout/Gesten (≈ 2× Aufwand) | ≈ 20 (nur Import) |
| Risiko Rückschritt | mittel (viele Stellen, aber klare Regel) | hoch | gering |
| Leistung | wie heute je sichtbarer Zelle | Rollen am iPhone mit vielen Zellen + Touch-Handlern: OFFEN, eher schlechter | wie heute |
| Alte Projekte | bitgleich | bitgleich | bitgleich |
| Aufwand | L (in 5 Paketen) | XL | S–M |

Verworfen sind außerdem:
- **„Mehrere Spuren in einem Worklet-Knoten“**: Das spart Knoten-Aufrufe, bricht aber die Spur-Isolation (Solo, Mute, Vocoder-Eingänge, Begrenzer je Spur) und ist ein großer Engine-Umbau. Es kommt erst in Frage, wenn die Graph-Probe es wirklich verlangt.
- **„Projekt-Ebenen“** (mehrere 8er-Matrizen in einem Projekt): Das ist für Xander schwerer zu verstehen als Bänke.

---

## 5. Empfehlung im Einzelnen (Variante A)

1. **Größe je Projekt, nicht global:**
   - `NT()` liegt zwischen 6 und 24, `NS()` zwischen 8 und 32.
   - Neue Projekte haben wie heute 6 Spuren und 8 Szenen.
   - Größer wird ein Projekt nur durch den Import oder durch [＋ Spur] / [＋ Szene], falls Xander das will.
   - Kleiner als 8 Szenen wird es nie.
2. **Datenregel:**
   - Feste Plätze 0–5 bleiben. Zusatzspuren kommen ab Index 6 hinten dazu, und es bleibt genau eine Drum-Spur auf 4.
   - `clips.length === NS()` für jede Spur, damit die Matrix rechteckig bleibt.
   - Szenen haben weiterhin `{name, uid, chords}`.
3. **Format und Sperre:**
   - Format 8 und `need: ['xl']` werden **nur** geschrieben, wenn NT > 8 oder NS > 8.
   - Alle Schreibwege berechnen das schon heute aus dem Inhalt (`fmtOf`, `needSync`).
4. **Bänke:**
   - Bankgröße = sichtbare Spalten (4 hochkant, 8 quer/breit). Bank-Zahl = ⌈NS / Bankgröße⌉.
   - Tippen auf [SZ] → nächste Bank. **Halten** → kleines Blatt mit allen Bänken, mit Szenen-Namen (z. B. „Intro · Strophe · Refrain“). Das folgt der bestehenden Regel „Halten = Blatt“.
   - [▲▼] arbeitet für Spur-Seiten genauso.
   - Der Punkt am Umschalter zeigt: „In einer verdeckten Bank oder Seite läuft etwas.“
5. **Song-Editor:** Er bleibt der klassische Ablauf von links nach rechts. Szenen 9–32 erscheinen als Nummern in den Spur-Zeilen, die Teil-Namen als Marken. Die Spur-Seiten blättern wie in der Matrix.
6. **Grenze für Live-Spuren:** Sie wird erst nach XL0 festgelegt. Bis dahin gilt 24 mit Hinweis „Viel Rechenlast“ und den bestehenden Stimmen-Deckeln.
7. **Cubasis-Import (BRÜCKE A6):**
   - „Höchstens 8 Szenen“ wird zu „bis 32 Szenen“. Gleiche Teile ergeben dieselbe Szene; nur echte Varianten werden eigene Szenen oder `song.own`.
   - Bis 24 klingende Spuren wird je eine Spur angelegt. Hilfsspuren, leere und stumme Spuren werden **nicht** angelegt (nur im Bericht genannt).
   - Mehr als 24: D1 (Zusammenlegen) bzw. D3 (Audio) wird vorgeschlagen.
   - Der Import legt also „so viele wie gebraucht“ an. Ein 8-Spur-Loop bleibt ein normales Projekt (Format 5), ohne XL.

---

## 6. Paketschnitt

| Paket | Inhalt | Sichtbar? | Aufwand | hängt ab von | Abnahme |
|---|---|---|---|---|---|
| **XL0 Messung** | Messprobe im Test-Build (nicht ausgeliefert): 8/12/16/24 Analog-Spuren (Poly 4, typischer Patch), leer und spielend; Graph-Probe (zu späte Quanten); `buildGrid`-Zeit; Speicher (Chromium `measureUserAgentSpecificMemory`). Ein Lauf am iPhone 12 durch Xander (eine Seite öffnen, 60 s warten, Ergebnis-Foto) | nein | S | – | Tabelle Last/Spätquanten je Stufe → Live-Grenze 16 oder 24 |
| **XL1 Datenkern** | §2.1, §2.2: Konstanten, `NS()` dynamisch, Normalisieren/Klemmen, `orderFor`, Format 8 + `need 'xl'`, Teile/Song mit ns | nein | M | – | T1, T2 grün; alte Projekte bitgleich |
| **XL2 Engine/Wiedergabe** | §2.3, §2.4: alle 8er-Felder → `MAX_T`, Meter `MTR_M`, Begrenzer-Hinweis ab 16 | nein | M | XL1 | T3 grün; 24-Spur-Projekt spielt fehlerfrei 3 min |
| **XL3 Matrix/Song/Video** | §2.5, §2.6, Video-Teil von §2.8: Bänke 0…B−1, Beschriftung, Halten-Blatt, Rand-Blättern, Auswahl folgt, Tasten, Farben 9–24, Guide-Texte | **ja** → vorher im Funk vorschlagen | M–L | XL1, XL2 | T4, T5 grün, Fotos 390×844 / 844×390 / 320 |
| **XL4 Exporte** | MIDI je Szene mit allen Spuren; Kanal-Bericht; Stems-Hinweis zur Größe; XL4b Stems in einem Durchlauf | Export-Blatt: Hinweistext | M | XL2 | T6 grün |
| **XL5 Import-Anschluss** | BRÜCKE A6 auf NS ≤ 32 / NT ≤ 24; Bericht nennt, was nicht angelegt wurde | im Import-Blatt | S | XL1 (Daten), XL3 (Ansicht) | T8 grün |

Reihenfolge: XL0 ∥ XL1 → XL2 → XL5 (Import kann schon Daten anlegen; angesehen wird zunächst im Song-Editor) → XL3 → XL4.
Jedes Paket ist für sich auslieferbar. XL1 und XL2 ändern für Xander nichts Sichtbares.

---

## 7. Testplan

| # | Was | Wie | Erwartung |
|---|---|---|---|
| T1 | Alte Projekte unverändert | alle vorhandenen Fixture-Projekte (Format 3–7, Demo, Leer, mit Chor/Taktarten/Takes) laden → speichern | JSON **bitgleich** zu 4.78; `format`, `need` unverändert; `scenes.length === 8` |
| T2 | XL-Rundweg | synthetisches Projekt 24 Spuren × 32 Szenen (alle Clip-Arten, STIMME auf Index ≥ 8, Song mit Slots 0–31, Marken, own) → speichern/laden/Autosave/Cloud-Datei | gleich nach Normalisieren; `format 8`, `need ['xl']` |
| T2b | Ältere Fassung | XL-Datei in 4.78 öffnen (rel-4780 als „alt“) | gesperrt geöffnet, Original-Datei unverändert zurückgeschrieben (`nvFileOf`), keine Daten verloren |
| T3 | Engine | 24 Spuren: Noten auf Spur 8–23 kommen an (`noteLog`), Mute/Solo, Meter je Spur, Begrenzer-Stufen, Szene 9–32 starten/stoppen, Übergang Szene 8→9 im Takt | keine Hänger, keine Aussetzer, `R.slot` nie `undefined` |
| T4 | Matrix-UI | iPhone 12 hochkant 390×844 und quer 844×390, 320 px: Bänke blättern, Halten-Blatt, Auswahl folgt, Clip ziehen über Bankrand (MTX-2), Szene duplizieren, GL1-Überlappungsprüfung | keine Überlappung, kein waagrechtes Seitenrollen, Bildzeit wie heute (± 10 %) |
| T5 | Song-Editor | 24 Zeilen blättern, Song spielt Szenen 9–32, Marken, Teil-Wiedergabe, Rückung | wie heute |
| T6 | Exporte | MIDI Song (24 MTrk), MIDI je Szene (alle Spuren), Stems (Dauer, Größe), Video 9:16/16:9 mit Bank > 1 | Dateien vollständig; Video-Matrix zeigt die richtige Bank |
| T7 | Leistung | XL0-Probe in Chromium + Xanders iPhone 12; LT1 Long Tasks beim Laden eines 24×32-Projekts | `buildGrid` < 50 ms, keine Long Task > 100 ms, Live-Last unter der Grenze aus XL0 |
| T8 | Rollen/Import | Remix, Klang-Stil, Begleiter, Mix-Assistent auf Spuren ≥ 8; synthetische .cbp (mit `cubasis/werkzeug/cbp.py`, ohne Xanders Namen/Noten): (a) 8-Spur-Loop 1 Teil, (b) 12 Spuren × 10 Teile, (c) 24 Spuren × 12 Teile, (d) 40 Spuren | (a) normales Projekt ohne XL; (b)/(c) XL mit genau gebrauchter Größe; (d) 24 + Bericht D1/D3 |
| T9 | Regression | bestehende Paket-Tests (mtx, chq, gl1, vv, mix3, jam, beg1, …) + Rauchtest | grün |

---

## 8. Sichtbare Änderungen – für Xander (kurz, zum Vorschlagen im Funk)

- **Deine bisherigen Projekte sehen genauso aus wie jetzt.** Nichts wird größer, wenn du es nicht brauchst.
- Ein Cubasis-Song mit vielen Spuren und Teilen wird **so groß angelegt, wie er ist**: zum Beispiel 20 Spuren und 12 Szenen. Jeder Song-Teil wird eine Szene.
- In der Matrix siehst du weiterhin 4 (hochkant) bzw. 8 (quer) Szenen auf einmal:
  - **[SZ]** blättert weiter: 1–4 → 5–8 → 9–12 → …
  - **[SZ] halten** zeigt alle Szenen-Gruppen mit ihren Namen zum direkten Hinspringen.
- Bei vielen Spuren zeigt **[▲▼]** „1/3“, „2/3“, „3/3“. DRUMS bleibt immer unten sichtbar.
- Ein Punkt am Knopf zeigt: In einer Gruppe, die du gerade nicht siehst, läuft etwas.
- Im **Song-Editor** läuft der Song wie gewohnt von links nach rechts, mit den Teil-Namen oben.
- **Zu entscheiden (bitte kurz Ja/Nein):**
  1. Sollen die Spuren 9–24 die 8 bekannten Farben wiederholen (mit einem kleinen Zusatzstrich) oder eigene neue Farben bekommen?
  2. Sollen [＋ Spur] und [＋ Szene] auch **von Hand** über 8 hinaus gehen, oder nur über den Import?
  3. Wenn dein iPhone bei sehr vielen gleichzeitigen Spuren an die Grenze kommt: Lieber den Hinweis „Viel Rechenlast“ (der Klang bleibt), oder einzelne Spuren automatisch „einfrieren“ (als Audio, kaum Last, aber nicht mehr direkt editierbar)?

---

## 9. Risiken und offene Punkte

- **Viele Stellen (≈ 140).** Gegenmittel:
  - Ein Such-Test im Build: keine `N_SCN`-Konstante mehr, keine `new Array(8)` in Spur-Feldern.
  - Dazu T1 (bitgleich) und T3 (`R.slot` nie `undefined`).
- **iPhone-Last:** Sie ist nicht gemessen (OFFEN). Bevor XL0 vorliegt, keine Live-Grenze über 16 versprechen.
- **WebKit-Grenzen:** Wie viele Eingänge darf ein AudioWorkletNode haben? (Meter 25; MIX-A/MX1/MX3 bis 24.) Das wird in XL0 geprüft. Ausweg: Gruppen zu je 8.
- **Stems:** ≈ 50 MB je Stem bei 4,5 min. Bei 20 Stems ist das sehr groß und dauert N Renderzeiten. Deshalb Hinweis plus Auswahl, Ein-Durchlauf-Abgriff in XL4b.
- **MIDI-Kanäle über 16 Spuren:** Die Kanäle wiederholen sich. Jede Spur hat aber ihren eigenen MTrk-Block, Cubasis trennt also sauber. Der Bericht nennt es.
- **Teile (`N_PART = 8`)** bleiben 8. Song-Teile und Marken sind unbegrenzt. Falls Xander mehr als 8 Teil-Speicherplätze will, ist das ein eigenes kleines Paket.
