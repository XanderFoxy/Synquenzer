# CBPIMP – Import-Kern Cubasis-Projekt (.cbp) → Synquenzer (Prototyp)

Stand 16.11.2026. Nur gelesen und gebaut im Arbeitsordner `vx/cbpimp/`, nichts an der App (4.78.0, `rel-4780/index.html`, md5 68e92c03) geändert, nichts veröffentlicht.
**Privat:** Xanders `.cbp` wurde nur lokal gelesen (Probelauf → `PROBE-THE-WALL.md`). Die Tests nutzen nur synthetische Projekte.

Xanders Wunsch: Cubasis-Projekt öffnen → **mit einem Klick** als Szenen (transponierbar), Song-Teile erkannt und in Szenen
einsortiert, **der Song bleibt von links nach rechts** im Song-Editor, und **so viele Spuren/Szenen wie nötig**.

## 1. Kernaussagen

1. **Lesen geht im Browser vollständig und schnell.** Eigener CBOR-Leser (≈ 90 Zeilen, keine Fremdbibliothek), Kennung + XOR 0x7C.
   Echte Datei (636 KB, 43 Spuren, 8 700 Noten): Lesen 6–16 ms, ganzer Import 17–30 ms warm, ≈ 60–100 ms kalt (Node, Server).
   Auf dem iPhone 12 grob 2–4× → **unter ¼ s, einmal beim Import**. Modul 45 KB (16 KB gzip) → nur bei Bedarf nachladen, nicht ins Start-Paket.
2. **Teile-Erkennung trifft Xanders Song genau:** alle 9 Teilgrenzen von „The Wall“ wie in der bisherigen Handanalyse
   (`ANALYSE-THE-WALL.md`), keine zusätzliche Grenze; Strophe 1 = Strophe 2, Refrain 1 = 2 = 3, Intro = Zwischenspiel 2 (gleiche Musik)
   → **10 Teile → 6 Szenen**, passt in die 8 Szenen.
3. **Der Song bleibt exakt.** Jeder Song-Takt spielt entweder den Szenen-Clip (wenn er dort Note für Note passt) oder einen eigenen
   Song-Clip (Variante/Rest). Geprüft: Original-Noten = abgespielte Noten, **3 228 von 3 228** (8 Spuren) bzw. **3 566 von 3 566**
   (alle 18 klingenden MIDI-Spuren), synthetische Songs ebenso. Nur 8 eigene Song-Clips nötig (bei 18 Spuren 15).
4. **Kurzer Loop → 1 Szene**, Clip-Länge je Spur = kleinste Wiederholung (Drums 1 Takt, Bass 4 Takte …), wie der Synquenzer Clips loopt.
5. **Transponierbar ohne Noten zu verbiegen:** importierte Spuren `os:false` (Eine Skala aus) und `⇅ fest` → Noten exakt; die
   **Rückung je Teil** (Marken-Blatt +1) nimmt feste Spuren schon heute mit (JAM3) – Halbton-genau. Für das Live-Transponieren in der
   Matrix gibt es den Modus **HALBTON** (Vorschlag, Abschnitt 5).
6. **Die Grenze ist die Spurenzahl, nicht die Szenen:** „The Wall“ braucht 18 Spuren (17 Synth + 1 Drums), der Synquenzer hat 8.
   Der Kern rechnet aus, wie viele nötig sind, und baut für **jede** Grenze (`maxT`, `maxS`); mit 24 Spuren fehlt nichts.
   Mehr als 8 Spuren in der App ist ein sichtbarer Umbau → **Vorschlag für den Funk**, nicht gebaut (Abschnitt 6).

## 2. API (`cbp-import.js`, DOM-frei; Browser `window.CBPImport`, Node `require`)

| Aufruf | Ergebnis |
|---|---|
| `decode(u8)` | Wurzel-Objekt der .cbp. Fehler mit Klartext: „Keine Cubasis-Projektdatei“, „Datei abgeschnitten“ |
| `read(u8 \| root)` | `{meta: {bpm, ts, tpq, barT, bars, tempoChanges, sigChanges, version, name}, tracks: [...], warn}` – je Spur `type` midi/audio, `kind` micrologue/microsonic/sonicdrum/classic/none/fremd, `role` synth/drums/audio/hilfe/ohne, `helper` akkorde/text/teile/hilfe, `mute`, `noOutput`, `empty`, `sounding`, `notes [{tick, len, n, vel, ch}]` (nur gespielte), `notesOutside`, `regions` |
| `parts(model, opts)` | `{bars, segments: [{a, len, group, name, sim}], groups: [{id, name, len, a, count, bars, per[], alias}], named, sounding}` |
| `toProject(model, parts, opts)` | Synquenzer-Daten (unten) |
| `importCbp(u8, opts)` | alles zusammen + `parts`, `meta`, `ms` (Zeiten) |
| `soundFor(track)`, `micrologueSound(params)`, `retroParams(dataB64)` | Klang-Zuordnung einzeln |
| `drumNote(n)`, `keyOf(tracks)`, `allocate(model, opts)` | Helfer |

Optionen: `mode` (`'szenen'` Standard │ `'loop'` alles eine Szene │ `'song'`), `transpose` (`'rueckung'` Standard │ `'halbton'`),
`maxT` (8), `maxS` (8), `withMuted`, `phrase` (true), `maxPart` (16), `runMax` (8), `sameSim` (0,8), `splitSim` (0,35).

Ergebnis von `toProject` – Felder wie im Synquenzer-Projekt (Abschnitt 1.1 BRUECKE-KONZEPT, `normTrack`/`normClip`/`normSong`):

```
{bpm, ts, key:{root, scale}, settings: null | {harmony:{mode:'chromatic', oneScale:false}},
 tracks: [ {kind:'synth'|'drum', name ≤24, mute, follow, os:false, sound, clips:[8× {len, key, notes:[{t, d, n, v}]} | null], mix?, cubasis:[busId]} | null ],
          // Index 4 = DRUMS (fest), 0–3/5–7 Synth in Cubasis-Reihenfolge
 scenes: [{name ≤12}],
 song: {bars, lanes:[[{bar, slot, re?, own?}]], own:{id: {len, key, notes, from:{t, s, bar, e:null}}}, marks:[{a, len, name, part:'S1'…}], xp:[], carrier:[]},
 need: {tracks, tracksAfterMerge, scenes, own},
 report: {tracks:[{name, quelle, status, ok[], appr[], miss[]}], merged, gone, helper, audio, warn, keyConf}}
```
`sound` ist entweder ein voller Analog-Klang `{engine:'analog', name, cat, p, mods, fx}` (Micrologue) oder ein Werksverweis
`{factory:'f-moog-bass'}` – den löst die App-Anbindung über die Werksliste auf (`SQStore.normalizeSound` normalisiert den Rest).

## 3. Wie es arbeitet (A1–A12 aus BRUECKE-KONZEPT §3)

- **A1 Lesen:** Kennung prüfen, XOR, CBOR mit allen Haupttypen (auch unbestimmte Längen, Float16, Tags, Bytes), Tiefen- und
  Längenschutz. Unbekannte Schlüssel stören nicht; fehlende bekommen Standardwerte (Tempo 120, 4/4, 960 Ticks) → robust gegen andere Fassungen.
- **A2 Tempo/Takt:** ein Tempo; Tempo-/Taktart-Automation → Warnung (nicht übertragbar).
- **A3 Spuren:** Hilfsspuren (ohne Instrument bzw. ohne Ausgang, Namen AKKORDE/TEXT/TEILE…) werden nicht als Instrument übernommen,
  sondern als Quelle (Teil-Namen). Stumm/leer/ohne Ausgang zählt nicht als klingend.
- **A4 Noten:** nur Noten **in** der Region (196 außerhalb fallen weg, wie belegt), Region und Note nicht stumm; Note endet spätestens
  am Regionsende (VERMUTET wie in Cubasis). `t/d` in Vierteln, `v = Anschlag/127` auf 1/1000 – genau das Format von `normClip`.
- **A5 Teile:** (a) Regionsgrenzen aller klingenden Spuren, (b) Ein-/Aussetzen von Spuren, (c) Namen aus einer TEILE-Spur bzw.
  benannten Regionen („Strophe …“, „Refrain 1 – …“; **Platzhalter-Regionen „ganze Datei“ zählen nicht** – bei „The Wall“ liegen sie
  15,7 Takte vor dem echten Teil), (d) Inhaltswechsel im 4-Takt-Raster. Ähnlichkeit je Takt und Spur = Jaccard der Einsätze
  (1/32-Raster × Tonhöhe), gewichtet nach Notenzahl → **ähnlich, nicht nur exakt** (Schwelle 0,8).
  **Phrasen:** kurze Stücke (≤ 4 Takte), deren Folge sich wiederholt, werden zu 8/16-Takt-Teilen (4+4+4+4 = Strophe);
  einmalige kurze Stücke direkt hintereinander bis 8 Takte. Ein übrig gebliebenes Stück, das sonst Anfang eines Teils ist,
  spielt den Anfang dieser Szene (z. B. „halber Refrain“) statt eine eigene Szene zu belegen.
- **Namen (Vorschlag):** vorhandene Namen zuerst; sonst Intro = was am Anfang steht, Refrain = der häufigste wiederholte Teil,
  Strophe = der nächste, Pre-Refrain = steht immer direkt vor dem Refrain, Bridge = einmaliger Teil nach den Wiederholungen,
  Outro = einmaliger Schluss, sonst „Teil A/B…“. Xander bestätigt/ändert im Blatt (wie IMP1).
- **A6 Szenen + Song:** gleiche Teile → dieselbe Szene; höchstens `maxS` Szenen nach Gewicht (Takte im Song); der Rest und jede
  Abweichung → eigener Song-Clip (`song.own`, `from.s` = Szene des Teils), Clips ≤ 64 Takte, längere Stücke in 64er-Stücken (wie
  `imp1Place('scenes')`). `song.marks` mit Teil-Namen und `part: 'S…'`. Gleiche Szene hintereinander → `re: 1` (neu starten).
- **A12 Klang:** siehe Abschnitt 4.

## 4. Klang-Zuordnung (Bericht „übernommen / angenähert / fehlt“)

| Cubasis | Synquenzer | Status |
|---|---|---|
| **Micrologue** (Daten = Klartext-Werte, PARAMS §3a) | eigener **Analog**-Klang: Wellen (Sine/Saw/Square/Triangle → 3/0/1/2), Fußlage, Coarse/Fine, Pegel, Pulsbreite, Rauschen, LP24, Cutoff in Hz, Resonanz, Filter-Hüllkurven-Menge, Key Follow (negativ → Weg key→cutoff), beide ADSR (ms → s), Glide, Mono, Stimmen, LFO 1 Rate, Chorus, Delay → Projekt-Echo „st“ mit Notenwert | **angenähert** – Zahlen 1:1, wo die Grenzen reichen (über 10/15 s → Grenze, im Bericht); Anschlag 0 (K1: Micrologue reagiert nicht auf Anschlag); fehlt: Vibrato LFO2 × Mod-Rad, LFO-Tiefen (OFFEN) |
| **MicroSonic** | nächster Werksklang nach Name: Bass → `f-moog-bass`, String/Pad → `f-juno-pad`, Flute/Bottle → `f-pfeif-lead`, Brass, Bell, Pluck, Lead, Piano/Orgel | **angenähert** (Samples sind Steinberg-Inhalt → nie in die App) |
| **Classic Machines** / MicroSonic-Kit | DRUMS (Index 4), Werks-Kit nach Name (Electro → 808, SIN V/Classic → Disko 85 …), Noten auf die 12 GM-Pads (35→36, 41/43→45, 44→42, 51→49 …) | **angenähert** (Pad-Belegung Classic Machines OFFEN) |
| Audio (Gesang/Chor) | nicht im Kern – braucht die WAVs (ZIP, A9) | **fehlt** mit Hinweis |
| Effekte, Mix | Fader linear (K5a) → `mix.vol = √Volume`, Pan 1:1; Insert-Effekte noch nicht | Mix angenähert, Effekte fehlt (A10 folgt) |

## 5. Transponierbarkeit – wie es wirkt und Vorschlag

So wirkt der Synquenzer heute (Code 4.78.0):
- `mapOut` → `T.mapEvent`: Spuren mit **⇅ folgt** werden vom Akkord-Träger **stufenweise** umgedeutet (Modus AKKORD/TONART) –
  das verbiegt fremde Noten (Durchgangstöne, Moll/Dur). Mit **Eine Skala** rasten Töne zusätzlich ein (`osActive`).
- `follow:false` (⇅ fest): Träger und Eine Skala lassen die Spur **ganz in Ruhe** (BRUECKE A7b).
- `song.xp` (Song transponieren) gilt nur für folgende Spuren; die **Rückung je Teil** (Marke → +1, `mark.rk`) nimmt aber
  **auch feste Spuren mit** (JAM3-2, `jam3FtNow` in `outPitch`) – reine Halbtonverschiebung, Drums nie.
- Harmonie-Modus **HALBTON** (`harmony.mode 'chromatic'`): `targetScale` gibt die Skala unverändert zurück → der Träger verschiebt
  **exakt in Halbtönen** wie ein CV-Keyboard.

Vorschlag (im Kern als Option umgesetzt, in der App nichts geändert):
- **Standard „Rückung“** (`transpose:'rueckung'`): Spuren `⇅ fest` + `Eine Skala aus`. Noten klingen exakt wie in Cubasis; im Song
  transponiert Xander je Teil mit der vorhandenen Rückung (+1 … ±12) – alle importierten Spuren gehen mit, die Noten bleiben unverbogen.
- **„HALBTON“ für die Matrix** (`transpose:'halbton'`): Spuren `⇅ folgt` + `Eine Skala aus` + Projekt-Harmonie HALBTON; Clip-Tonart =
  erkannte Song-Tonart (Krumhansl). Dann verschiebt **jede Taste der Tastatur** alle importierten Szenen exakt um Halbtöne
  (Grundton gedrückt = Original) – live spielbar. Weil die Harmonie-Einstellung projektweit ist, nur für das importierte Projekt.
  Das ist sichtbar anders als Xanders Standard (AKKORD, Eine Skala an) → **im Funk als Wahl im Import-Blatt vorschlagen**.

## 6. Spuren erweitern – was der Kern kann und was die App bräuchte

- Der Kern ist **grenzenlos**: `need.tracks` / `need.scenes` sagen, was das Projekt braucht; `maxT`/`maxS` bauen für jede Grenze.
  Bei 8 Spuren: (1) Spuren mit **gleichem Klang ohne Überschneidung** werden zusammengelegt (D1), (2) Drum-Spuren → eine DRUMS,
  (3) der Rest (wenigste Noten zuerst) wird im Bericht als „kein Platz“ genannt. Szenen über 8 → eigene Song-Clips (Song bleibt exakt).
- „The Wall“: **18 Spuren nötig, 6 Szenen** → die Szenen passen, die Spuren nicht (10 fehlen bei 8).
- Für „so viele Spuren, wie er braucht“ müsste die App `MAX_T` (heute fest 8, > 40 Stellen) und ggf. `N_SCN` erweitern – Datenformat 8,
  Matrix-Bänke (es gibt schon `trackBank`), MIDI über 16 Kanäle, Meter, Song-Ansicht. Aufwand **L**, Regressions-Risiko hoch
  (BRUECKE D2). **Leistung:** jede Synth-Spur = ein AudioWorklet-Knoten auf einem Audio-Faden; 18 Analog-Spuren auf dem iPhone 12 sind
  ungemessen → vorher mit `perfProbe` messen (8/12/16/24 Spuren). Günstiger Zwischenweg (D4): bis 8 live, der Rest als „gefrorene“
  Audio-Spuren. **Beides ist sichtbar → nur als Vorschlag in den Funk.** Den Umbau selbst beschreibt der parallele Schritt
  `vx/cbpimp/ARCHITEKTUR.md` (Stellen, Leistung iPhone 12, Varianten); der Kern liefert ihm `need.tracks`/`need.scenes` und baut für jede Grenze.

## 7. Genauigkeit der Teile-Erkennung

| Prüfling | Grenzen | Gruppen (gleiche Teile) | Namen | Song exakt |
|---|---|---|---|---|
| synthetisch Loop 4 Takte | 1 Teil ✔ | 1 Szene ✔ | „Loop“ | 78/78 Noten ✔ |
| synthetisch Song (8 Teile, ohne Namen) | 7/7 ✔, 0 falsch | Strophe 1 = 2 (eine Note anders, ~0,95) ✔, Refrain ×3 ✔, Intro = Outro (gleicher Inhalt) | Intro/Strophe/Refrain/Bridge ✔ | 894/894 ✔ |
| synthetisch Song mit TEILE-Spur | 7/7 ✔ | wie oben, Intro ≠ Outro (Namen) ✔ | aus der Spur ✔ | 894/894 ✔ |
| synthetisch 12 Spuren | – | – | – | übernommene Spuren exakt ✔; Grenze 16: alle 12 ✔ |
| **„The Wall“ (echt, lokal)** | **9/9 ✔, 0 falsch** (gegen Handanalyse) | Strophe 1=2 ✔, Refrain 1=2=3 ✔, Intro = Zwischenspiel 2 (gleiche Akkorde AA) | Intro/Strophe/Refrain/Outro ✔; Zwischenspiel 1 → „Bridge“, Übergang → „Teil A“ | 3 228/3 228 ✔ (18 Spuren: 3 566/3 566) |

Grenzen der Erkennung: Namen sind ein **Vorschlag** (ohne Text-/Teile-Spur nur aus dem Ablauf geraten); Teile, die sich nur im
Gesang unterscheiden (Audio), sieht der Kern nicht; Tempo-/Taktartwechsel nicht; Ähnlichkeit ab 0,8 → dieselbe Szene, kleine
Abweichungen landen als eigene Song-Clips (Song exakt, Szene = erstes Vorkommen).

## 8. Tests

- `tests/gen_synth.py` – erzeugt synthetische .cbp mit `cubasis/werkzeug/cbp.py` (Loop 4 Takte; Song Strophe/Refrain-Wiederholung,
  ohne und mit TEILE-Spur; 12 Spuren; Micrologue-Daten als synthetischer RetrologueDoc). Keine Namen/Noten von Xander.
- `node tests/test.cjs` – **17/17 bestanden**: CBOR-Randfälle, Fehlermeldungen, Loop → 1 Szene, Teile/Gruppen/Namen, Song exakt
  (Abspiel-Nachbau gegen Original), Klang Micrologue/MicroSonic/Kit, 12 Spuren bei Grenze 8 und 16, Szenen-Grenze 3, HALBTON, Loop-Modus, Tonart.
- `node tests/probe.cjs <datei.cbp> [optsJSON]` – lokaler Probelauf, gibt nur Struktur/Zahlen aus (keine Noten).

## 9. Nächste Schritte (App-Anbindung, Vorschlag)

1. Import-Blatt wie IMP1: Datei wählen → farbige Teile mit Namen, „Passt“ → **ein ↶**; Wahl „Szenen │ Loop │ Song“ und
   „Transponieren: Rückung │ HALBTON“. Kern in einem Worker (bleibt flüssig), Modul erst beim Import laden (Ladezeit).
2. Werksverweise auflösen, `normalizeProject` drüber, Bericht wie beim DX7-Export (übernommen/angenähert/fehlt).
3. Danach: AKKORDE-Spur → `song.carrier`/Akkord-Zeilen (A7), TEXT-Spur (A8), Audio/Gesang aus ZIP (A9), Effekte (A10).
