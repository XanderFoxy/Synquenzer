# KI1 – „Profi-Trennung“ auf der Spektral-Seite · PLAN (Auftrag 1/3, 14.11.2026)

Basis 4.58.1 (`vx/basis3.html` = `vx/ki/index.html`, bitgleich). Block `/* ===== KI1-BEGIN … */ … /* KI1-END */` direkt nach
`/* MTX-END */` (Zeile 94205), Einhänge-Zeilen tragen „KI1“. Im App-Text heißt es nur **„Profi-Trennung“** (keine Produkt-,
Modell- oder Firmennamen; Quelle/Lizenz nur hier und im Code-Kommentar als „MIT-Modell, 4 Spuren“).

## 1. Prüfung des Modells (Ergebnis)

| Punkt | Befund |
|---|---|
| Ablage | Hugging Face `edgetools/umx-hq` (Karte + Tags: **MIT**; Gewichte = offizielles Release des MIT-Projekts, Zenodo 3370489) |
| Stolperstein | `main` enthält seit „Keep only the vocals stem“ nur noch `vocals.onnx`. **Alle 4 Dateien liegen im festen Commit `2cc0d6a71963504e3ef32156ea900dd54a1a9502`** – `/resolve/<commit>/<datei>` liefert sie (302 → CDN, CORS `*`, Range geht). Feste Revision wie bei G9A (`REV`). Risiko: Besitzer könnte die Historie löschen → Hinweis „nicht erreichbar“ + klassisches Zerlegen bleibt. |
| Dateien | `drums.onnx`, `bass.onnx`, `vocals.onnx`, `other.onnx` je **17 820 856 B** (71,3 MB zusammen) |
| SHA-256 | drums `18152f9240356a039ff0bba6b3cbaa810a50a895ddf31891bb70ef32bbf8431b` · bass `76e6156584763b401e44a3fb7fee41ec0c70760acbb519cf2c0928f6f06e4176` · vocals `3d05709ff7197bbd4a33aee759e4e82002acb491f41c94770227ab57507b6ccb` · other `f8b110f3db82d04ed2f106b86175dbb41134dc606f9f98b24933554da6c0bab6` (= Karte, geprüft) |
| Graph | opset 17, IR 8, Gewichte fp16 (8,9 Mio. Parameter), 3 × LSTM bidirektional (je 256), MatMul, BatchNorm, Tanh/Relu. Eingang `mag` float32 `[1, 2, 2049, frames]`, Ausgang `estimate` gleiche Form (geschätzter Betrag der Spur). |
| Signal | 44,1 kHz Stereo, STFT N 4096, Hop 1024, Hann periodisch, 2049 Bins → **identisch mit dem Base-Raster der Spektral-Seite** (`base: {N: 4096, hop: 1024}`). Der App-Kern `stft()` kann direkt benutzt werden (Rahmen-Lage um 1 Hop verschoben, Rand mit Nullen statt Spiegelung – misst sich nicht). |
| Laufzeit-Bibliothek | dieselbe Version wie G9A (`G9A.ORT`, 1.31.0-dev.20260914). WASM-Satz: `ort.wasm.min.mjs` 50 195 B (sha `1617c813ada08592706d29a9963ab6258864dce4299bd402d2196bd648b63bfe`) + `ort-wasm-simd-threaded.mjs/.wasm` (schon in G9A.FILES). WebGPU-Satz: `ort.webgpu.min.mjs` 66 543 B (sha `5dd65363be87d182ce0617665489cab4b78359cea9f04d813b2a423c9be651a1`) + `…asyncify.mjs/.wasm` (schon in G9A.FILES). Hashes aus dem npm-Paket; jsDelivr war aus dem Container gerade gesperrt (403 am Proxy) → in Auftrag 2 im Browser gegenprüfen. |
| Gesamt-Download | WASM 85,6 MB (≈ 82 MiB) · WebGPU 98,3 MB (≈ 94 MiB). Liegt der G9A-Laufzeit-Satz schon im Cache, nur 71,3 MB + 50/67 KB. Hinweis-Text rechnet aus der Liste: „Profi-Trennung laden (~86 MB, einmalig)“. |

### Messung (Demo-Song, Summe der Stems, App-Kern-STFT, Masken Uint8 mono wie die Ebenen)
Skripte: `scratchpad/ki-ort/umx-mess.mjs` (Node, onnxruntime-node 1.31.1), `ki-ort/web-test.mjs` (Chromium, onnxruntime-web WASM
1 Faden im Modul-Worker, ohne Cross-Origin-Isolation), Ergebnisse `ki-ort/r10.json`, `r196.json`, `r196b.json`.

| SDR (dB) | Drums | Bass | Tonales (Gesang+Rest gegen Lead+Fläche) | Summe = Original |
|---|---|---|---|---|
| klassisch Zerlegen, 10 s (0–10 s) | 5,8 | 1,3 | 7,6 | 85 |
| **Profi-Trennung, 10 s** | **9,2** | **4,5** | **10,1** | 147,6 |
| klassisch, ganze 19,6 s (NOTES) | 6,0 | 0,8 | 8,2 | 147 |
| **Profi-Trennung, ganze 19,6 s** | **9,7** | **4,4** | **11,8** | 148,1 |
| ideale Maske (Obergrenze, NOTES) | 12,1 | 6,9 | – | – |

- Anteile: Drums 89 % in „Drums“ (klassisch 75 %); Bass 57 % in „Bass“, 29 % in „Drums“ (klassisch 28 % / 60 %); Lead 91 % / Fläche 91 % im Rest.
  „Gesang“ bleibt leer (0 %) – richtig, der Demo-Song hat keine Stimme (klassisch legt dort Lead-Anteile hin).
- Varianten: Wiener p = 2 (Leistung) **+0,6 dB** Drums/Bass gegenüber Verhältnis p = 1; 3×3-Glätten **−0,8 dB** (weglassen);
  eine Maske für beide Kanäle als Uint8 statt je Kanal float: −0,01 dB; Stücke 256 Frames + 32 Kontext je Seite: ±0,1 dB (9,7 / 4,6 / 11,8).
- Zeit: nativ 1 Faden 46–55 ms je Sekunde Audio (alle 4 Spuren). **Browser WASM 1 Faden: 153 ms je Sekunde** (6-s-Stück: je Spur
  215–244 ms, Sitzung anlegen 200 ms je Spur, Ergebnis = Node bis auf −88 dB). Mit 25 % Kontext-Aufschlag: 3-min-Song ≈ 35 s im
  Container; iPhone 12 (A14, ähnlich schneller Einzelkern) geschätzt **≈ 40–90 s** + STFT/Masken ≈ 10 s. Ziel ≤ 2 min erreichbar.
- WebGPU im Container: Adapter da, aber ohne `shader-f16` → Graph rechnet fp16 (Cast am Eingang) → „requires f16“. Darum wie G9A:
  WebGPU nur mit Adapter **und** `shader-f16`, sonst WASM; Fehler → WASM gemerkt. Ob WebGPU auf dem iPhone schneller ist (LSTM
  kann auf die CPU fallen), misst die Diag-Zeile (`?ki1diag=1`); ist es nicht schneller, wird WASM Standard (eine Zeile).

**Entscheidung: Modell taugt** (deutlich besser als klassisch, klein, schnell, MIT). Kein Ersatz-Kandidat nötig. Rückfall, falls die
Commit-Dateien verschwinden: kein anderer Download, klassisches Zerlegen bleibt; Ersatz wäre ein eigener Export aus den Original-
Gewichten (gleiche Signal-Parameter) auf einer eigenen Ablage – nur nach Rückfrage (nicht im Repo).

## 2. Lade-Weg (wie G9A, nichts doppelt bauen)

```
const KI1 = { CACHE: 'synq-ki1-v1', MODEL: 'edgetools/umx-hq', REV: '2cc0d6a71963504e3ef32156ea900dd54a1a9502',
  HF: G9A.HF, ORT: G9A.ORT, IDLE: 120000, w: null, q: new Map(), qid: 0, ready: null, loadP: null, how: '', st: 'none', diag: [] };
KI1.FILES = [['ort.wasm.min.mjs', 50195, '1617…', 'w'], ['ort.webgpu.min.mjs', 66543, '5dd6…', 'g'],
  …die 4 Laufzeit-Zeilen aus G9A.FILES übernehmen (filter f.startsWith('ort-')) …,
  ['drums.onnx', 17820856, '1815…', 'wg'], ['bass.onnx', …], ['vocals.onnx', …], ['other.onnx', …]]  → u wie G9A (HF + MODEL + '/resolve/' + REV + '/' + f)
```
- **Worker = G9A-Lader + KI1-Teil:** Quelle `'(' + g9AsrWorkerMain + ')();(' + ki1WorkerMain + ')();'` als Modul-Worker aus Blob.
  `ki1WorkerMain` merkt sich `const g9 = onmessage` und setzt einen Verteiler: `op` `load` → G9A-Code (Laden in Stücken, Größe,
  SHA-256, `cache.put`, `prog`/`net`-Meldungen – unverändert wiederverwendet, nur `m.cache = KI1.CACHE`), `kinit`/`krun`/`kfree` → KI1.
- **Laufzeit-Dateien nicht doppelt laden:** vor `load` im Haupt-Faden `caches.match(u, {cacheName: G9A.CACHE})` für jede `ort-…`-Datei;
  Treffer → `put` in `synq-ki1-v1` (lokal, kein Netz). G9A.FILES wird nur gelesen (keine Änderung an G9A).
- `kinit {how}`: Bündel aus dem Cache als Blob-URL importieren (`ort.wasm.min.mjs` bzw. `ort.webgpu.min.mjs`), `env.wasm.wasmPaths =
  {mjs, wasm}` als Blob-URLs, `numThreads = 1`, `proxy = false` (kein SharedArrayBuffer, **kein coi-serviceworker**), 4 Sitzungen aus
  `(await CA.match(u)).arrayBuffer()` mit `executionProviders: [how === 'webgpu' ? 'webgpu' : 'wasm']`, `graphOptimizationLevel: 'all'`.
- Weg wählen `ki1How()` = Muster `g9AsrHow` (URL `?ki1how=`, localStorage `synq-ki1-how`, Adapter + `shader-f16`, vollständiger anderer
  Satz im Cache wird genommen). Fehler bei `kinit`/`krun` unter WebGPU → `ki1ToWasm` (merken, nur-WebGPU-Dateien löschen, neu).
- Prüfen/Melden: `ki1Scan()` (Cache lesen, kein Netz) → Zustand `none | teil (x MB) | cached`; localStorage `synq-ki1` = '1' wenn voll.
  `navigator.storage.persist()` beim ersten Laden. Safari kann nach 7 Tagen ohne Besuch löschen → Scan beim Öffnen des ▾.
- Worker endet nach `IDLE` (2 min) ohne Arbeit, bei ✕, bei Abbrechen sofort (`terminate`) → Speicher (4 Sitzungen ≈ 150–250 MB) frei.
- Nie beim App-Start: `KI1` ist nur ein `const` + Funktionen; kein Worker, kein `caches`-Zugriff, bis der Nutzer das ▾ öffnet.

## 3. Worker-Ablauf (drei Beteiligte)

```
Haupt (UI)  ── spk1Call('profi', {doc}) ──►  SPK1-Kern-Worker (Dokument, PCM, STFT, Masken, Undo, IDB)
            ◄── prog {stufe, p, k, n} ───            │  MessagePort (einmal: 'kiport' an beide)
                                                     ▼
                                               KI1-Worker (Laufzeit + 4 Sitzungen)
```
1. UI: `ki1Ensure()` (laden falls nötig, Fortschritt „Profi-Trennung lädt … 12/82 MB · 15 %“) → `kinit` → MessageChannel; `port1` an
   den SPK1-Kern (`op: 'kiport'`), `port2` an KI1 (`op: 'kport'`). Die großen Stücke laufen Worker ↔ Worker, der Haupt-Faden sieht nur `prog`.
2. Kern-Op **`profi`** (neu, im Block KI1, als Text in den Kern-Worker gehängt – Einhänge-Zeile im `switch` von `spk1DspMake`):
   für Stück c = `jobs.profi.k` … n−1:
   - Frames des Kerns: m0 = 256·c … m0 + 255 (= Masken-Streifen 2c, 2c+1), Kontext 32 Frames je Seite.
   - Eingang: `sr === 44100` → Beträge je Kanal direkt mit dem App-Kern (`magsAt` je Kanal / `stft`), Frames = Doc-Frames.
     `sr !== 44100` (iPhone meist 48 kHz!) → PCM des Abschnitts auf 44,1 kHz umrechnen (gefensterter Sinc, 16 Stützstellen), dort
     STFT 4096/1024; Ergebnis später auf das Doc-Raster abbilden (Zeit und Frequenz linear interpoliert).
   - `port.postMessage({op: 'krun', c, mag: Float32Array[2·2049·L]}, [buf])` → KI1 rechnet die 4 Sitzungen, liefert je Spur die
     Leistung über beide Kanäle `v_j = Σ_c est²` als Float32Array[4·L·2049] (übertragen, ≈ 10 MB, kein Kopieren).
   - Kern: Wiener p = 2 → Anteile a_j = v_j / Σ v (Drums, Bass, Gesang; „other“ = Rest), **ohne Glätten**, als Uint8 (Σ ≤ 255) →
     sofort in IDB (§5), `jobs.profi.k = c + 1`, Meta sichern, `prog`.
   - Abbrechen: UI → `zstop` (wie Zerlegen) + KI1 `terminate` → Kern verwirft das laufende Stück, die fertigen bleiben in IDB
     (für „fortsetzen“), Ebenen unverändert („Abgebrochen – nichts geändert · fortsetzen möglich“).
3. Alle Stücke da → **derselbe Schreib-Weg wie Zerlegen**: `zerlegen(d, {profi: true})` (Einhänge-Zeile KI1 in `zerlegen`: statt
   HPSS/Tiefband/REPET liest es je Streifen ED/EB/EV aus den q-Stücken, `sm` = ohne Glätten). Damit gleich: Ebenen `l.z ===
   'drums'|'bass'|'gesang'` (gleiche Ebenen wie Zerlegen, ein zweiter Lauf füllt sie neu), eigene Ebenen bleiben unberührt (verteilt
   wird nur der freie Teil), Rest = 255 − Σ → **Summe = Original**, `uBegin`/`uEnd` → **ein ↶** für alles. Danach q-Stücke löschen,
   `jobs.profi = {fertig: true, ms, how, rev}`, KI1-Worker darf ruhen.
4. Nach Neuladen/Absturz: `jobs.profi.k < n` und gleiche `rev`/`sr` → ▾ zeigt „Profi-Trennung fortsetzen (40 %)“; Start ab Stück k.
5. Rückfall ohne Worker (Kern im Haupt-Faden): Profi-Trennung nicht anbieten (Eintrag grau „braucht Hintergrund-Rechnung“).

## 4. Stückelung
- Kern 256 Frames = 2 Masken-Streifen = 5,94 s, Kontext 32 Frames (0,74 s) je Seite → Modell-Eingang 320 Frames (5,2 MB). Gemessen
  gleich gut wie am Stück (bidirektionales LSTM braucht nur kurzen Kontext). Ein 3-min-Song = 31 Stücke.
- Die Oberfläche bleibt frei: alles in Workern; zwischen zwei Stücken `await tick()` im Kern (Aufträge wie Wiedergabe kommen dran).
  Während der Profi-Trennung sind ↶/↷, In Ebene, Verfeinern, Zerlegen gesperrt (wie bei Zerlegen; ▶ Abspielen bleibt).

## 5. Speicher-Schlüssel
| Ort | Schlüssel | Inhalt |
|---|---|---|
| Cache API | `synq-ki1-v1` / URL je Datei | Laufzeit + 4 Modelle (geprüft), wird von App-Aufräumen (`/^synq-app-/`) und sw.js (`/^dma-/`) nicht berührt |
| localStorage | `synq-ki1` ('1' = voll im Cache), `synq-ki1-how` ('wasm' nach WebGPU-Fehler) | – |
| IDB `audio` | `spk:<id>:q<c>` | Zwischenstand Stück c: `Uint8Array(3·256·NB)` Anteile Drums/Bass/Gesang (Frames × Bins), ≈ 1,6 MB je Stück, 3 min ≈ 49 MB, nach Fertig gelöscht. Präfix `spk:` → `tkGc`/`g10cGcPlan` behalten es schon (SPK1-Haken). |
| Doc-Meta | `jobs.profi = {k, n, core: 256, ctx: 32, rev, how, sr, t0}` | Weiterrechnen; nach Fertig `{fertig, ms, how, rev}` |
| ZIP | – | q-Stücke werden nicht exportiert (Zwischenstand); Ergebnis sind normale Masken-Streifen `m<lid>` (schon im Export). |

## 6. Bedienung (UI-Stelle) – sichtbar neu, darum im Funk ansagen
- **Knopf „Zerlegen“ bleibt** und rechnet wie bisher sofort klassisch (Standard, ohne Download). Neu nur ein schmaler Teil **„▾“
  (44 × 44 px) rechts im selben Feld** (Split-Knopf, Zelle 135 px hochkant / Spalte 264 px quer). Er öffnet das vorhandene
  Klappfenster `spk1Dd` mit:
  - „Zerlegen (schnell, ohne Download)“
  - „Profi-Trennung laden (~86 MB, einmalig)“ – bzw. wenn im Cache: „Profi-Trennung (genauer, ≈ 1 min)“, bei Teil-Download
    „Profi-Trennung weiter laden (noch 40 MB)“, bei Zwischenstand „Profi-Trennung fortsetzen (40 %)“
  - Kleine Zeile: „Trennt Drums, Bass, Gesang und Rest genauer. Lädt einmal aus dem Netz, danach offline. Am besten mit Ladekabel.“
  - „Profi-Trennung vom Gerät löschen (82 MB)“ (nur wenn im Cache).
- Laden und Rechnen: Fortschritt in der festen Statuszeile („Profi-Trennung lädt … 12/82 MB · 15 %“, „Profi-Trennung · Stück 3/31 ·
  10 %“), der Knopf „Zerlegen“ wird zu „■ Abbrechen“ (wie beim Zerlegen). Fertig: „Profi-getrennt: Drums, Bass, Gesang, Rest ·
  52 s · ↶ macht es rückgängig“. ✕ bleibt immer sichtbar; ✕ während der Rechnung = anhalten (Stücke bleiben, später fortsetzen).
- Alternative, falls Xander den Split-Knopf nicht will: Angebot nur in der Statuszeile nach einem klassischen Zerlegen
  („Genauer? Profi-Trennung ›“, 44 px hoch). Keine weiteren sichtbaren Änderungen; Guide-Eintrag „Profi-Trennung“ (Text ohne Namen).
- Quer 926×428 / 926×370: gleiche Zelle, ▾ bleibt 44 × 44; Test prüft „keine Taste < 44 px, keine Überlappung, ✕ sichtbar“.

## 7. Einhänge-Zeilen (je eine Zeile mit „KI1“)
1. `spk1DspMake` → `switch`: `case 'profi'`, `case 'kiport'` (Aufruf von `ki1KernProfi(...)`, dessen Text mit in den Kern-Worker geht).
2. `zerlegen()` → Quelle der Anteile: `if (o.profi) {…aus q-Stücken…}` und `sm` ohne Glätten.
3. `spk1Build()` → Split-Teil „▾“ am Knopf `zerl`; `spk1BtnState()` → Zustände; `spk1Zerl()` bleibt klassisch.
4. ✕/Schließen der Seite → `ki1Kill('zu')`. 5. Guide-Eintrag. 6. Test-API `__spk.profi(o, cb)` / `__ki1` (Zustand, Diag).
`SPK1_T2.ki` („KI-Trennung … kommt in Teil 2“) wird durch die echte Funktion ersetzt (Text dort nie mehr gezeigt).

## 8. Schritte
- **Auftrag 2/3 BAUEN** (~40 min): Block KI1 (Lade-Weg, Worker, Kern-Op `profi`, Zerlegen-Haken, Port), Node-Test des Kerns mit
  onnxruntime-node als „KI1-Worker-Ersatz“ (Summe = Original, SDR wie oben, Weiterrechnen ab Stück k, Abbrechen = nichts geändert,
  ein ↶), 48-kHz-Fall messen (Demo auf 48 kHz umgerechnet: SDR darf höchstens 0,5 dB schlechter sein). Pflichtprüfungen.
- **Auftrag 3/3 BEDIENUNG + TEST** (~40 min): Split-Knopf + Klappfenster + Statuszeile, Browser-Test mit lokal gespiegelten
  Dateien (Server liefert die URLs aus `vx/ki/modell/`, Netz-Abrufe gezählt): Start lädt nichts; ▾ → Laden mit Fortschritt →
  Abbrechen → weiter laden; Rechnen mit Fortschritt; Neuladen mitten drin → fortsetzen; ↶ ein Schritt; Summe = Original; hochkant/
  quer ohne Überlappung, ✕ sichtbar, Tasten ≥ 44 px; keine Konsolen-Fehler; Fotos; NOTES.md.
