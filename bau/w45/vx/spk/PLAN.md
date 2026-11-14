# SPK1 – Spektral-Seite, Teil 1 · PLAN (Schritt 1/4, nur gelesen, nichts gebaut)

Basis: `vx/spk/index.html` = `vx/basis.html` (4.54.1, 97 562 Zeilen, bitgleich). Zeilennummern unten = Basis.
Grundprüfung Basis: topdefs „doppelt 0, Syntaxfehler 0“ · dupkeys 0 · smoke errors [] · „MS 2000“ 1× · „  live: true,“ 1×.
Markenwörter-Zählung der Basis ist notiert (privat); sie darf nicht steigen.

---------------------------------------------------------------------------------------------------------------------------

## 1. Was es schon gibt (wiederverwenden, nicht doppelt bauen)

| Thema | Wo (Zeile) | Was SPK1 davon nimmt |
|---|---|---|
| ≡-Menü | `openMenu(goto)` 52275; Abschnitt „Projekt“ `s1`, Helfer `sec/row/btn`; Zeilen-Haken `va1MenuRow(s1,row,btn)` 52341 (Export), `mx2MenuRow` 67304 (Mix) | eigene Zeile „Analyse › [Spektral …]“ direkt nach der Export-Zeile (dort, wo IMP1 seinen Import hinsetzt) |
| ORI-Einklappen | `ORI_RARE` 94374 / `oriMenuHook` 94412 | „Analyse“ steht NICHT in ORI_RARE → bleibt sichtbar |
| Vollbild-Seite | `.vvsheet` CSS 1486–1505 (fixed, inset 0, z 55, Safe-Area-Padding, Kopf `.vvh` 48 px, `.sh-x` 44×44), `vvOpen()` 74839 / `vvClose()` 74887 | gleiche Bauart: `section.spk1` fixed inset 0, z 55, Kopf wie `.vvh`, ✕ `.sh-x rb` |
| Werkzeugleisten-Look | PianoRoll-CSS (`G.PianoRoll = {create, GRID, CSS}` 22255; `.pr-bar button` 36 px, min 44 breit, `.on` = `--sel`, `.sep`, Raster `.pr` 40 px Tasten / 26 px Lineal) 20857 ff. | Klassen `.pr-bar`, `.pr-corner`, `.pr-keys`, `.pr-ruler` am Seiten-Element wiederverwenden (CSS liegt ab Start im Kopf: `#pr-css`, init 97517) |
| Tastatur links | PianoRoll `draw()` Tasten-Teil 21270–21284 (weiß `#ece6d8`, schwarz `#1a1b1f`, Namen `NAMES`, `--font-num` 10 px, außer Skala 45 % abgedunkelt) | genau so zeichnen (eigene kleine Funktion `spk1Keys`, gleiche Farben/Schrift; PianoRoll ist eine Closure, Teile nicht exportiert) |
| Zwei-Finger-Zoom | PianoRoll `mainDown` 21562 (2. Finger = abbrechen + Pinch), `pinch()` 21726 (waagrecht und senkrecht getrennt, Schwelle 40 px, Punkt unter den Fingern bleibt), iOS `gesturestart` gesperrt 20924, `touchstart` preventDefault | gleiche Regeln; Zeilenhöhe 4…48 px je Halbton (Spektrum braucht Übersicht über ≈ 10 Oktaven), Zeit px/s statt px/Schlag |
| Takt/Tempo | `spb()` 32929, `grid()` 32934, `tBarLen` 28684, Taktkarte `tkMap/barBeat/barAt/barLen` 28620–28690, `S.bpm`, `S.ts` | Lineal = Projekt-Tempo + Taktart; Haken `imp1Analyse` (s. §6) |
| Worker aus Text | `vsWorker()` 58343, `clWorker()` 60867, `g2Worker()` 69151 (Quelltext = `fn.toString()` als Blob, `URL.revokeObjectURL` nach 30 s, `onerror` → Rückfall Hauptfaden), `g2Call()` Muster mit Zeitwächter | gleiches Muster `spk1Worker()`; Quelltext = `vsDspMake.toString() + spk1DspMake.toString() + Kleber` |
| DSP-Kern VS2 | `vsDspMake()` 57740 → `{fft, pyin, segment, tapNotes, midiOf, median}` (fft = Radix-2 in place, Tabellen je N) | `fft` für die halbe Länge + eigener Real-FFT-Schritt; `pyin` für Harmonische/Bass/Gesang-Grundton; `segment` (Teil 2: Noten) |
| Tonhöhe G2 | `g2PitchMake` (G2-Block 68834) `analyse/render` | nicht nötig in Teil 1 (nur Muster) |
| Audio-Speicher | `KV()` 24646: IDB `synquenzer` v2, Stores `kv` + `audio`; `kv.aput/aget/adel/akeys` 24693 ff.; Takes = PCM16-Stücke `TK_CHUNK = 524288` 58866, `tkPcm(id)` 58889, `tkStore` | SPK-Daten als ArrayBuffer im Store `audio` unter `spk:…`, Metadaten im Store `kv` unter `spk:…` |
| Aufräumen | `tkGc()` 60245 (löscht jeden Audio-Schlüssel, dessen Teil vor „:“ kein Take ist!) und `g10cGcPlan()` 59977 (Größe vorher) | Haken nötig, sonst löscht [Aufräumen] alle Spektral-Daten (s. §3) |
| Takes-Blatt | `tkSheet(r, anchor)` 59657 (Tipp-Weiche `d.a`), `tkSheetPaint(p)` 59694 (Knopf „✎ Marken & Timing …“ 59711), `tkRef(r)` 59622, `tkBuffer/tkLoad` 58899/58901, Verarbeitungskette `tkExt().proc` (wie `g2Base` 69147) | Knopf „Im Spektrum öffnen“; Quelle = gehörte Fassung des Stücks (Kette wie `g2Base`), sonst roh (`tkPcm`) |
| Datei laden | `ggbReadFile` 75236, `ggbDecode(ab)` 75145 (OfflineAudioContext, 48 kHz), `GGB_ACCEPT` 75027, Dateiwahl `ggbPick()` 75243 (im Tipp öffnen) | gleiches Vorgehen, eigene Rate (s. §2.1) |
| ONNX-Laden (G9) | `G9A` 6510 (fester CDN-Pfad + Version, Stück-Laden mit Fortschritt, SHA-256, Cache `synq-g9-asr-v1`, Modul-Worker, Leerlauf-Ende 3 min, WebGPU/WASM-Weg mit Merker) `g9AsrWorker()` 6621 | Teil 2: optionale KI-Trennung genau so (eigener Cache-Name, nur auf ausdrücklichen Tipp mit Größe) |
| Oszilloskop KF2 | Block 96378–96684, `kf2Scope(sh,i)` | Teil 2 (Klang-Nachbau: Wellenbild der Ebene neben dem Nachbau) |
| Offline-Render | `mkRender(sound, ev, o)` 30862 (Klang offline durch das App-Worklet), `bmRender` 12130, `vvRenderAudio` 73858 | Teil 2: Analyse durch Synthese; vorher prüfen, ob `mkRender` auch VA/FM rendert |
| Undo | `UNDO/REDO` 34777, `undoPush` 34778, `undoState/undoApply` (Art-Weichen), V6A-Editor hat eigene Schritte (`v6aUndoGate`) | SPK hat eigene Schritte auf der Seite (s. §5), das Projekt-Undo bleibt unberührt |
| Guide | `ui1Entries` … `kf2Guide(UI1.ents)` 55807, Eintrag `E(id, Name, Wo, Text, Suchwörter, go, ziel)` | `spk1Guide(UI1.ents)` |
| Kurztasten | `onKeyDown` 56236; Video-Blatt sperrt sie 56243 | gleiche Sperre + Esc schließt |
| Test-API | `SYNQUENZER.beg1 = {…}` 96123, `Object.assign(SYNQUENZER, {kf2: …})` 96683 | `SYNQUENZER.spk1 = {…}` |
| WebGL | bisher nirgends in der App | SPK1 = erste WebGL2-Nutzung, mit Canvas2D-Rückfall |

---------------------------------------------------------------------------------------------------------------------------

## 2. Datenmodell

### 2.1 Analyse-Dokument („Analyse“ = eine geöffnete Quelle)
Nichts davon steht in der Projekt-Datei → alte Projekte bleiben bitgleich, kein Format-Wechsel. Die Seite ist wie eine Extra-App:
ihre Analysen leben im Gerät (IDB) neben den Projekten. Teil 2 bringt Ergebnisse als Takes/Audio-Clips ins Projekt (dann normales Undo, ZIP-Container).

`kv` (klein, JSON):
- `spk:idx` = `[{id, name, sec, mt, src}]` (Liste auf der Startfläche der Seite)
- `spk:doc:<id>` =
```
{ v: 1, id, name, ct, mt,
  src: {kind: 'take'|'datei'|'imp', take?, in?, out?, datei?, proj?},   // Herkunft (nur Anzeige / Rücksprung)
  sr, n, ch (1|2),                                                    // Quelle: Rate = AU.ctx.sampleRate beim Laden (Blöcke dann ohne Umrechnung abspielbar)
  grid: {bpm, off, ts, from: 'projekt'|'imp1'|'hand'},              // Takt-Lineal (off = Sekunde von Schlag 0)
  base: {N: 4096, hop: 1024},                                         // Masken-Raster, fest je Dokument (Hann, 75 % Überlappung = COLA)
  view: {N: 4096, lo: -90, hi: -12, x0, pps, top, rowH, tint: true},  // letzte Ansicht
  layers: [{id, name, art: 'bass'|'gesang'|'drums'|'lead'|'pads'|'eigene', col, vol (dB), solo, mute, ver}],
  rest: {vol, solo, mute},                                            // „Rest“ = 255 − Σ Masken, wird nie gespeichert
  patches: [{id, lid, t0, t1, f0, f1, N, hop, ver}],                   // „Verfeinern“-Ergebnisse mit eigener FFT
  jobs: {spec: {N, done}, zerlegen: {stufe, k, fertig}},               // Zwischenstände (Weiterrechnen nach Neuladen)
  teil2: {notes: {}, tmpl: {}, loops: []} }                            // nur angelegt, s. §8
```

`audio` (ArrayBuffer, Schlüssel beginnen alle mit `spk:` → ein Aufräum-Haken reicht):
- `spk:<id>:p<c>:<k>` Quelle PCM16 je Kanal c, Stücke à `TK_CHUNK` Samples (wie Takes)
- `spk:<id>:v<N>:<k>` Anzeige-Spektrogramm für FFT N, Stück k = 1024 Spalten × R Zeilen Uint8 (dB, s. §4)
- `spk:<id>:m<lid>:<s>` Masken-Streifen (s. 2.2)
- `spk:<id>:x<pid>:<s>` Masken eines Verfeinern-Bereichs (eigene N/Hop)
- `spk:<id>:z<stufe>:<k>` Zwischenstände von „Zerlegen“ (z. B. HPSS-Masken je Stück)
- `spk:<id>:f<lid>` Grundton-Spuren (pYIN) je Ebene (Teil 2: Noten)

### 2.2 Masken-Kachelung
- Raster: Spalte = Base-Frame (Hop 1024), Zeile = FFT-Bin (2049 bei N 4096). Wert Uint8 0…255 = Anteil des Originals in dieser Ebene.
- Kachel = 128 Frames × 128 Bins (16 KB). Streifen = 128 Frames × alle 17 Kachel-Zeilen = ein IDB-Datensatz:
  Kopf `Uint8Array(17)` (0 = alles 0, 255 = alles voll, 1 = Daten folgen) + nur die Kacheln mit Daten. Gleichförmige Kacheln kosten nichts.
- 3 min @ 44,1 kHz: 7 750 Frames → 61 Streifen. Dichte Maske ≈ 15,9 MB, typische Ebene (Band/Auswahl) < 2 MB.
- „Rest“ = max(0, 255 − Σ Ebenen). „Zerlegen“ hält Σ = 255 (Summe = Original); „kopieren“ darf die Summe überschreiten (bewusst).
- Verschieben aus A nach B: `B += s·A; A −= s·A` (s = Auswahl 0…1). Aus „Original“: `B += s·(255 − B)`, alle anderen `X *= (1 − s)`.
- Verfeinern-Bereich: eigene Kacheln mit eigener N; im Zeit-/Frequenzbereich des Patches gilt für die Ziel-Ebene das Patch,
  weiche Frequenz-Kante w(f) (Base nimmt 1 − w, Patch nimmt w) → Summe bleibt stimmig.

### 2.3 Cache-Schlüssel
- Anzeige: `spk:<id>:v<N>:<k>` – unabhängig von Masken; dB-Bereich und Farben sind Shader-Werte (kein Neurechnen).
- Wiedergabe-Blöcke (nur Speicher, LRU 64 Blöcke ≈ 24 s Stereo): Schlüssel `mixKey + ':' + k`,
  `mixKey = hash([ver je Ebene], vol/solo/mute, rest, selVer, orig)`. Jede Masken-Änderung erhöht `ver` → alter Block ungültig.
- Volle Ebenen-Wiedergabe für Teil 2 (Export/Clip): `spk:<id>:r<lid>v<ver>:<k>` (PCM16, wie Takes).

---------------------------------------------------------------------------------------------------------------------------

## 3. Einhänge-Zeilen (je eine Zeile, Kommentar „SPK1“; Block selbst direkt nach `/* BEG1-END */` 96142)

| # | Funktion · Zeile | Zeile, die dazukommt |
|---|---|---|
| H1 | `openMenu` · nach 52341 (`va1MenuRow(s1, row, btn);`) | `spk1MenuRow(s1, row, btn);   // SPK1: Analyse › [Spektral …]` |
| H2 | `tkSheetPaint` · nach 59711 (Knopf „✎ Marken & Timing …“) | `(ok ? spk1TkBtn(x) : '') +   // SPK1: Im Spektrum öffnen` |
| H3 | `tkSheet` Tipp-Weiche · nach 59678 (`if (d.a === 'wp') …`) | `if (d.a === 'spk1') { closePop(); spk1Open({take: rr}); return; }   // SPK1` |
| H4 | `onKeyDown` · nach 56243 (Video-Sperre) | `if (typeof SPK1 !== 'undefined' && SPK1.open) { if (code === 'Escape') spk1Close(); return; }   // SPK1` |
| H5 | `g10cGcPlan` · nach 59979 (`const keep = …`) | `keep.add('spk');   // SPK1: Spektral-Analysen räumt die Seite selbst auf` |
| H6 | `tkGc` · nach 60250 (`const keep = …`) | `keep.add('spk');   // SPK1` |
| H7 | `ui1Entries` · nach 55807 (`kf2Guide(UI1.ents);`) | `spk1Guide(UI1.ents);   // SPK1: Spektral-Seite` |
| H8 | (optional, erst nach Messung in Schritt 2) `uiFrame` 43102 | `if (SPK1.open && spk1Covers()) return;   // SPK1: Seite deckt alles, die Ansichten darunter warten` – nur wenn ▶ des Projekts aus ist und der Lauf ohne uiFrame sicher ist (prüfen!) |

Keine weiteren Eingriffe in fremde Blöcke. Die Seite registriert ihre eigenen `pagehide`/`visibilitychange`-Hörer erst beim ersten Öffnen.

---------------------------------------------------------------------------------------------------------------------------

## 4. Leistung (Vorrang: Seite schnell, nichts beim Start)

- App-Start: Block enthält nur `const`/`function`. Kein DOM, kein CSS-Element, kein Worker, kein IDB-Zugriff, kein WebGL beim Start.
  CSS als String, eingefügt beim ersten Öffnen (`spk1Css()`, wie `va1Css`). Messung Schritt 2: Startzeit vorher/nachher (Browser-Test, 5 Läufe).
- Rechnen nur im Worker (Blob aus Text). Worker hält Quelle (Mitte mono Float32 + Stereo Int16) und Masken; der Hauptfaden nur Anzeige.
  Worker liest/schreibt IDB selbst (gleiche DB, Store `audio`) → keine großen Kopien über `postMessage`.
- Leerlauf: Seite zu → Worker sichert und endet nach 3 min (wie G9A.IDLE); wieder auf → lädt aus IDB weiter.
- Anzeige: WebGL2. Spektrogramm-Textur R8 (Kacheln ≤ 4096 Spalten breit, Mipmaps), Zeilen = log. Frequenz mit 8 Zeilen je Halbton
  (MIDI 12…135 → 984 Zeilen; obere Bins je Zeile = Maximum, untere = Interpolation). Farbtabelle 256×1 als Textur,
  dB-Boden/Decke/Gamma als Uniforms → Pegelbereich-Regler = ein Neuzeichnen, kein Neurechnen.
  Ebenenfarben: 2 RGBA8-Texturen (je 4 Ebenen) mit ¼ Zeit- und ½ Frequenzauflösung der Anzeige.
  Zoom/Scroll/Pinch = nur Uniforms → ein Draw je rAF. Auswahl, Abspiel-Linie, Grundton-Linien, Treffer = darüberliegende 2D-Leinwand.
- Canvas2D-Rückfall (kein WebGL2): Ausschnitt aus denselben Uint8-Daten in ein ImageData in Leinwandgröße; während einer Geste
  nur CSS-Transform des letzten Bilds, neu gerendert erst am Gestenende.
- Spalten-Obergrenze 24 000 je Anzeige-FFT (sonst Hop × 2) → 3 min @ N 4096 Hop 512: 15 500 × 984 ≈ 15 MB Uint8.
- Wiedergabe = gestreamte ISTFT im Worker: Mischmaske M = Σ g_l·m_l (Solo/Stumm/Lautstärke) auf das STFT des Originals,
  Overlap-Add, Blöcke à 16 384 Samples (≈ 0,34 s @ 48 kHz) 3 Blöcke voraus, im Hauptfaden als AudioBufferSourceNode
  sample-genau aneinander (Quelle schon in `AU.ctx.sampleRate`) → Gain (5 ms Ein/Aus-Blende) → `AU.masterSum`.
  Aufwand ≈ 2 FFT 4096 je 1024 Samples → wenige % CPU; Lautstärke/Solo wirkt nach ≤ 1 s, ohne Vorrechnen des ganzen Stücks.
- Zwischenstände: Spektrogramm je Stück (1024 Spalten) sofort in IDB; „Zerlegen“ je Stufe und Stück; Masken-Streifen werden
  2 s nach der letzten Änderung und beim Schließen/`pagehide` gesichert. Nach Tab-Neuladen läuft die Rechnung ab dem letzten Stück weiter.
- Grenzen: Quelle bis 10 min; länger → Hinweis, nur die ersten 10 min. Fortschritt + [Abbrechen] in einer festen Statuszeile.

---------------------------------------------------------------------------------------------------------------------------

## 5. Worker-Nachrichten

Haupt → Worker (`{op, id, …}`, jede Antwort trägt `id`; lange Aufgaben melden `prog`, `cancel` bricht nach dem aktuellen Stück ab):

| op | Inhalt | Antwort |
|---|---|---|
| `open` | `doc` (Meta) | `ready {n, sr, ch, have: {spec: [N…], masks: [lid…]}}` |
| `import` | `sr, ch: [Int16Array…]` (übertragen; nur beim ersten Laden) | schreibt `p<c>:<k>`, dann `ready` |
| `spec` | `N, hop, from, to` | `specChunk {N, k, x0, w, R, data: Uint8Array}` je Stück (übertragen), `prog`, `done` |
| `sel` | `selVer, shapes: [{art: 'rect'|'zeit'|'freq'|'pinsel'|'harm'|'treffer', …}], kante` (Vektor) | `selInfo {selVer, box, anteil}` |
| `harm` | `t, f, oberton (1…32), breite (ct)` | `harmRes {spur: Float32Array [t, f0…], stimmhaft}` |
| `aehnlich` | `selVer` (Beispiel), `empf` | `simRes {treffer: [{t0, t1, wert}]}` (Werte bleiben im Worker → neue Empfindlichkeit = nur neu filtern) |
| `transfer` | `von: lid|'orig', nach: lid|'neu', modus: 'verschieben'|'kopieren', selVer, label` | `masks {lid, ver, view: [RGBA-Ausschnitte]}`, `undo {n, m, label}` |
| `ebene` | `was: 'neu'|'weg'|'name'|'farbe', lid, …` | `undo …` (Name/Farbe/Löschen = je ein Schritt) |
| `zerlegen` | `opts` | `prog {stufe, p}` … `masks …`, `undo …` (ein Schritt für alles) |
| `verfeinern` | `selVer, ziel: 'bass'|'gesang'|'drums'|'lead'|'pads'|'rest', N` | `refineRes {pid, vorher, nachher}` (Anzeige), `undo …` |
| `play` | `seq, ab (Sample), mix: {lids: [[lid, g]], rest, orig, selVer?}, bis?` | `pcm {seq, k, L, R}` (übertragen) laufend 3 Blöcke voraus |
| `mix` | `seq, mix` (Änderung während ▶) | ab dem nächsten Block neue Mischung |
| `stop` | `seq` | – |
| `undo` / `redo` | – | `masks …`, `undo {n, m, label}` |
| `save` | – | `saved {bytes}` |
| `cancel` / `close` | – | `closed` (nach Sichern) |

Worker → Haupt zusätzlich: `prog`, `err {text}`, `log`. Absturz (`onerror`) → Hinweis „Rechnung neu gestartet“, Worker neu, `open` lädt aus IDB.
Rückfall ohne Worker: derselbe Kern im Hauptfaden, in Stücken mit `setTimeout(0)` (Hinweis „ohne Hintergrund-Rechnung“).

Undo (eigene Schritte der Seite, das Projekt-Undo bleibt unberührt): im Worker Stapel `{label, tiles: Map(Schlüssel → vorheriger
Inhalt oder 0/255), meta}`; Budget 48 MB / 30 Schritte (Älteste fallen weg); Redo spiegelbildlich. Ein Schritt je Aktion
(Verschieben/Kopieren, Zerlegen, Verfeinern, Ebene neu/weg/umbenennen/Farbe). Kein Schritt: Auswahl ändern, Ansicht,
Solo/Stumm/Lautstärke (Abhören). Seite: [↶] [↷] in der Werkzeugleiste (gleicher Look wie im Noten-Editor), Toast „Rückgängig: …“.

---------------------------------------------------------------------------------------------------------------------------

## 6. DSP (ohne KI, Kern `spk1DspMake(V)`, V = `vsDspMake()`)

- STFT: Hann, Real-FFT über `V.fft` mit halber Länge + Umsortier-Schritt; ISTFT Overlap-Add (Hop N/4, COLA), Phase des Originals.
  Anzeige-Hop N/8; FFT-Stufen 1024 · 2048 · 4096 (Standard) · 8192 · 16384.
- Rechteck/Zeit/Frequenz: analytisch mit weicher Kante (Kante in ms bzw. Cent). Pinsel: Polylinie + Radius (Zeit/Freq aus der aktuellen
  Ansicht umgerechnet) + Weichheit; Radierer = Abziehen.
- Harmonische: Tipp (t, f) → pYIN (VS2, 16 kHz, fmin/fmax = f/1,6…f·1,6) ±4 s um t, Spur vor/zurück verfolgen solange stimmhaft und
  stetig → Kamm-Maske k·f0(t), k = 1…K, Breite je nach N (mind. 1,5 Bins), leichte Inharmonizität erlaubt; als Linien angezeigt.
- Ähnliche: Log-Frequenz-Ausschnitt der Auswahl als Schablone, Kosinus-Ähnlichkeit über das ganze Stück (Spalten-Schritt Hop × 2),
  Treffer über Schwelle(empf) → Auswahl = Treffer × Frequenzform des Beispiels; Treffer-Marken im Lineal.
- Zerlegen (ganzes Stück, Stück für Stück mit Rand):
  1. HPSS mit Rest (Median zeitlich 17 Frames / spektral 17 Bins, Trennfaktor 2) → Drums = perkussiv.
  2. Bass = harmonischer Anteil × (Tiefband < 250 Hz weich ∪ Kamm aus pYIN-Grundton 30…300 Hz, Obertöne bis 1,5 kHz fallend).
  3. Gesang = REPET-SIM (Ähnlichkeit auf Spalten × 4 verdichtet, k = 10 ähnlichste, Median-Modell → Vordergrund) × Kamm aus
     Gesangs-Grundton (pYIN 80…1000 Hz), verstärkt bei Vibrato 4–7 Hz und stimmhaft/Formant-Hinweis (Energie 300 Hz–3 kHz).
  4. Wiener-artig: Schätzungen S_i → Maske_i = S_i² / Σ S_j², 3×3 geglättet; Rest = alles Unerklärte → Summe = Original.
- Verfeinern (Auswahl + Ziel „Was steckt hier?“): nur im Bereich neu, mit feinerer/passender FFT: Bass 16384, Pads 8192, Gesang/Lead
  4096, Drums 1024; Methode je Ziel (Bass: Grundton-Kamm + HPSS gegen Kick; Gesang: Kamm + REPET-SIM lokal; Drums: HPSS kurz;
  Lead: lautester einstimmiger Verlauf; Pads: tonaler Rest mit langer Zeit-Glättung; Rest: Rest) → Patch in die Ziel-Ebene.
  Vorher/Nachher: [Vorher │ Nachher] umschaltbar (Bild = Ebenen-Tönung im Bereich, Ton = Ziel-Ebene im Bereich), [Übernehmen] [Verwerfen].
- Takt-Lineal: `grid = typeof imp1Analyse === 'function' ? (imp1Analyse(quelle) || projekt) : projekt` (einzige Stelle, `spk1Grid()`),
  projekt = `{bpm: S.bpm, off: 0, ts: S.ts || '4/4'}`; Anfang (off) im Lineal per Ziehen verschiebbar (Taktstrich auf den ersten Schlag).

---------------------------------------------------------------------------------------------------------------------------

## 7. Bildschirm-Aufteilung

Allgemein: Seite fixed, Safe-Area-Padding, alle Tasten ≥ 44 px, feste Höhen (Statuszeile, Optionszeile reserviert) → nichts springt.
Werkzeug-Symbole als gezeichnete SVG (wie N1_SVG im Noten-Editor), keine Emojis. Texte kurz, deutsch.

### Hochkant 428 × 926 (nutzbar ≈ 428 × 845 nach Safe-Area)
```
┌──────────────────────────────────────────────┐
│ SPEKTRAL · Demo-Song.mp3          [↶][↷] [✕] │ 48  Kopf (.vvh-Look)
├──────────────────────────────────────────────┤
│[▭][⟷][↕][Pinsel][Harm.][Ähnl.] │ [Ansicht ▾] │ 44  Werkzeuge (.pr-bar, waagrecht rollbar)
├────┬─────────────────────────────────────────┤
│TAKT│ 1     │ 2     │ 3     │ 4     │ 5        │ 26  Takt-Lineal (.pr-ruler-Look, Loop-Band)
├────┼─────────────────────────────────────────┤
│ C6 │                                         │
│    │      Spektrogramm (WebGL)               │
│ C5 │      + Auswahl / Linie (2D darüber)     │ ≈ 380
│ C4 │                                         │
│ .. │                                         │
├────┴─────────────────────────────────────────┤
│ Weich ▬▬●▬▬  Größe ▬●▬▬▬   (Werkzeug-Optionen)│ 44  Optionszeile (immer da)
│ Analyse 45 % · 4096 · [Abbrechen]            │ 24  Statuszeile (immer da)
├──────────────────────────────────────────────┤
│ [▶] [▶ Auswahl] [In Ebene ▾] [Verwerfen]     │ 44  Aktionen
│ [Zerlegen] [Verfeinern …]                    │ 44
├──────────────────────────────────────────────┤
│ ● Original             [▶ A/B]               │
│ ● Bass        S  M  ▬▬▬●▬▬ −3 dB   [⋯]       │ 4 × 44 sichtbar,
│ ● Gesang      S  M  ▬▬●▬▬▬         [⋯]       │ Liste rollt
│ ● Drums       S  M  …                        │
│ ● Rest        S  M  …         [＋ Ebene]     │
└──────────────────────────────────────────────┘
```

### Quer 926 × 428 (nutzbar ≈ 838 × 407 mit Notch-Rand) und 926 × 370
```
┌───────────────────────────────────────────────────────────────┬──────────────────────┐
│ SPEKTRAL · Name  [▭][⟷][↕][Pinsel][Harm.][Ähnl.][Ansicht▾][↶][↷]│                 [✕] │ 44  Kopf + Werkzeuge in einer Zeile
├────┬──────────────────────────────────────────────────────────┼──────────────────────┤
│TAKT│ 1      │ 2      │ 3      │ 4                              │ ● Original  [A/B]    │ 26
├────┼──────────────────────────────────────────────────────────┤ ● Bass   S M ▬●▬ [⋯] │
│ C5 │                                                          │ ● Gesang S M ▬●▬ [⋯] │
│    │          Spektrogramm                                    │ ● Drums  S M ▬●▬ [⋯] │ Seitenleiste 260 px:
│ C4 │                                                          │ ● Rest   S M ▬●▬     │ Ebenen (rollt) oben,
│    │                                                          ├──────────────────────┤ Aktionen unten
├────┴──────────────────────────────────────────────────────────┤ [▶] [▶ Ausw.] [Ebene▾]│
│ Optionen ▬●▬ ▬●▬            │ Status 45 % [Abbr.]              │ [Zerlegen][Verfeinern]│ 44
└───────────────────────────────────────────────────────────────┴──────────────────────┘
```
- 926 × 428: Spektrogramm ≈ 620 × 290 px. 926 × 370: Spektrogramm ≈ 620 × 232 px; Ebenen-Liste zeigt 3 Zeilen, rollt.
- Gleiche DOM-Teile, nur CSS-Raster wechselt (`@media (orientation:landscape)`), kein Umbau beim Drehen.

### Startfläche (noch keine Analyse offen)
Kopf + Liste „Analysen“ (Name, Länge, Datum, [Öffnen], [Löschen] mit Rückfrage `twoStep`) + [Datei laden …] (MP3/WAV/M4A) +
„Aus dem Projekt“ (Takes der STIMME-Spur, Tipp = laden). Aus dem Takes-Blatt kommt man direkt in die Analyse dieses Stücks.

### Gesten (wie Noten-Editor)
Ein Finger = Werkzeug · zwei Finger = Zoom (waagrecht/senkrecht getrennt) und Schieben · Tasten: Ziehen = senkrecht rollen,
Tipp = Ton hören · Lineal: Ziehen = waagrecht rollen, Tipp auf Taktzahl = Wiedergabe-Bereich (Loop-Band, später Loop-Klammer) ·
Doppeltipp leer = ganze Länge zeigen. Wechsel ✕ → zurück: aus dem Menü → `openMenu()` (Zeile „Analyse“ im Blick),
aus dem Takes-Blatt → `tkSheet(r)` wieder auf.

Farben der Ebenen = vorhandene Spur-Farben: Bass `--t1`, Lead `--t4`, Pads `--t3`, Drums `--t5`, Gesang = Farbe der STIMME-Spur
(sonst `--t6`), Rest `--text-dim`, eigene `--t8`, `--p*`. Original = Farbtabelle (`--bg` → `--t1` → `--amber` → `--sel`).

---------------------------------------------------------------------------------------------------------------------------

## 8. Vorbereitung Teil 2 (nur Daten/Schnittstellen, nicht bauen)
- Noten je Ebene: `doc.teil2.notes[lid] = [{t0, t1, m, v, conf, quelle: 'pyin'|'nmf'}]`; Weg: Ebenen-Wiedergabe → `V.pyin` + `V.segment`
  → aufs Raster (`grid`) → MIDI-Clip. Schnittstelle `spk1Notes(lid)`.
- „Diese Noten sind Bass“ → Vorlagen W (NMF, 2–8 Spalten) aus den Noten-Stellen lernen, `spk:<id>:w<lid>` + `doc.teil2.tmpl[lid]`,
  dann H über das ganze Stück, Treffer = neue Noten/Maske (Empfindlichkeit wie „Ähnliche“). Schnittstelle `spk1Learn(lid)`, `spk1Find(lid)`.
- Loop-Klammern: `doc.teil2.loops = [{a, b, name}]` (Sekunden, aufs Raster gerastet); in Teil 1 nur das Loop-Band im Lineal.
  Schnittstelle `spk1ToMatrix(lid, loop, als: 'audio'|'midi')` – Audio-Clip in die Matrix erst nach dem Zusammenführen mit IMP1.
- Klang-Nachbau (Analyse durch Synthese mit VA/FM): `spk1Recipe(lid, bereich)`; vorher prüfen, ob `mkRender` auch VA/FM-Klänge
  durch das App-Worklet rendert, sonst kleiner Offline-Pfad über dieselbe Worklet-Quelle; Wellenbild über KF2-Oszilloskop.
- Optionale KI-Trennung als Zusatz-Download: genau wie G9A (feste Version, Stück-Laden, SHA-256, eigener Cache, Modul-Worker,
  WebGPU/WASM-Weg, Größe vorher anzeigen, nur auf Tipp); Ausgabe = Masken in dieselben Ebenen (Wiener-Glättung wie oben).

---------------------------------------------------------------------------------------------------------------------------

## 9. Teilschritte 2–4 (je ≈ 40 min, nach jedem Teilpunkt LOG-Zeile, Pflichtprüfungen)

**Schritt 2 – Gerüst, Quelle, Anzeige**
2a Block `SPK1-BEGIN … SPK1-END` nach 96142: Zustand `SPK1`, `spk1Css()`, `spk1Open/Close`, Kopf mit ✕, Startfläche, Haken H1–H7.
2b Quelle: Datei laden (`ggbReadFile` + Dekodieren in `AU.ctx.sampleRate`, Stereo), Take (Kette wie `g2Base`, sonst `tkPcm`), Speichern
   `spk:idx`, `spk:doc`, `p<c>:<k>`; 10-min-Grenze.
2c Worker `spk1Worker()` + Kern `spk1DspMake` (Real-FFT, STFT, log-Zeilen, dB-Uint8), `spec`-Stücke mit Fortschritt + IDB-Sichern +
   Weiterrechnen; Rückfall Hauptfaden.
2d Anzeige WebGL2 (Kacheln, Mipmaps, LUT, dB-Uniforms) + Canvas2D-Rückfall; Tasten links, Takt-Lineal, Pinch/Schieben, Abspiel-Linie.
2e Wiedergabe Original (gestreamt, Blöcke) ▶/■; Ansicht ▾ (Pegelbereich, FFT-Stufe, Ebenenfarben).
2f Test `spk1-test.mjs` (Browser-Test, 428×926 / 926×428 / 926×370, synthetische WAV mit Bass-Sinus + Klicks + Ton mit Vibrato):
   Startzeit vorher/nachher, keine Anfrage/kein Worker beim Start, Spektrum-Spitzen an der richtigen Taste, Pinch ohne DOM-Umbau,
   ✕ sichtbar in allen drei Maßen, Rückfall ohne WebGL. Messen, ob H8 nötig ist.

**Schritt 3 – Auswahl, Ebenen, Undo**
3a Werkzeuge Rechteck/Zeit/Frequenz/Pinsel (Vektor-Auswahl, Overlay), Optionszeile, ▶ Auswahl, Verwerfen.
3b Harmonische (Tipp → pYIN-Spur → Kamm), Ähnliche (Schablone + Empfindlichkeit, Treffer im Lineal).
3c Ebenen-Liste (Farbe, S, M, Lautstärke, ⋯ Umbenennen/Farbe/Löschen, ＋ Ebene, Rest), Masken-Kacheln + Streifen-Speicher,
   „In Ebene ▾“ verschieben/kopieren, Ebenen-Tönung im Bild, Wiedergabe-Mischung (Solo/Stumm/Lautstärke) gestreamt.
3d Undo/Redo der Seite (Worker-Stapel, Budget), Toasts, Tastatur Esc.
3e Test: Auswahl → Ebene → Summe aller Ebenen = Original (Rest ≤ 1 LSB), Undo stellt Kacheln bitgleich her, Speicher/Neuladen-Rundweg,
   [Aufräumen] löscht keine `spk:`-Daten, alte Projekte unverändert.

**Schritt 4 – Zerlegen, Verfeinern, Abschluss**
4a Zerlegen (HPSS mit Rest → Drums, Bass, Gesang, Rest; Wiener-Glättung), Stufen/Stücke mit Zwischenständen, [Abbrechen], ein Undo-Schritt.
4b Verfeinern (Ziel-Frage, feinere FFT im Bereich, Patch, Vorher/Nachher hören und sehen, Übernehmen/Verwerfen).
4c Teil-2-Felder und Schnittstellen-Stummel (`spk1Notes/Learn/Find/ToMatrix/Recipe` melden „kommt in Teil 2“), Guide-Einträge.
4d Messungen: Trenn-Güte auf synthetischem Gemisch (Bass/Drums/Ton bekannt → SDR je Ebene), Laufzeit Zerlegen 3 min (Ziel iPhone
   < 60 s geschätzt aus Container-Zeit ×2), Speicher-Spitze; volle Pflicht + Rauchtest; NOTES/Fotos für die Werkstatt.
