# VA1 – Audio im Video, Exporte, sicherer Projekt-Container (Basis 4.42.0)

## 1. Für Xander

- **Video mit Ton auf dem iPhone:** Das iPhone (iOS 18) kann Bilder kodieren, aber keinen Ton (kein AudioEncoder). Bisher lief deshalb die Aufnahme in Echtzeit, und deren Datei kam ohne Tonspur an. Jetzt baut die App das Video selbst mit Bild **und** Ton (Datei `.mov`). Das spielt auf dem iPhone, in Fotos und in jedem Schnittprogramm. Im Video-Blatt steht unten: „Weg: WebCodecs · H.264 + Ton (PCM) · MOV“.
- **Menü → Export** (neben „Video“): ganzer Song als WAV, **Einzelspuren** (je Spur ein WAV in einer ZIP), **nur Gesang**, **nur Chor**, ganzer Song als MIDI (alle Spuren), **eine Spur als MIDI** (Spur antippen), Video 9:16 / 16:9, **Projekt-Container** sichern/öffnen und **MIDI importieren** (kommt als neue Clips in die gewählte Spur, ein ↶). Nach dem Rechnen tippst du auf **Teilen**.
- **Clip verschwindet nach dem WAV-Export:** behoben. Lud ein Take gerade, während der Export rechnete, war seine Welle danach weg (flache Linie) und er blieb stumm bis zum Neuladen.
- **Container:** „ZIP + Projekt“ im Takes-Blatt und „Container sichern“ zeigen vorher die Liste aller Audios (welcher Take, wo er liegt, wie lang) und wie viele es sind. Beim Öffnen prüft die App gegen diese Liste: „Container geöffnet: 5 von 5 Audios ✓“.
- **Ausprobieren:** Menü → Video → Video erstellen → Teilen → in Fotos sichern → mit Ton abspielen. Menü → Export → Einzelspuren → Teilen → in GarageBand oder Dateien öffnen.

## 2. Technik (alles im Block `VA1-BEGIN … VA1-END` direkt vor VV2, dazu Einhänge-Zeilen mit `// VA1`)

**Ursache „Video ohne Ton“ (iOS 18):** `vvPath` wählte die WebCodecs nur, wenn VideoEncoder **und** AudioEncoder (AAC) da waren. Safari 18 hat keinen AudioEncoder, also lief `vvEncodeMR` (MediaRecorder: canvas.captureStream + MediaStreamDestination). Dessen Datei hatte auf dem iPhone keine Tonspur. `vvBlobDb` gab bei einer nicht dekodierbaren Datei `null` zurück, und die Prüfung ließ sie durch. Headless-Chromium verhält sich genauso (H.264 ja, AAC nein → Aufnahme-Weg) und war damit das Testfeld.

- **Neuer Weg `acodec: 'pcm'`:** `va1PcmPath(W, H, T)` (H.264 via `isConfigSupported`) → `{how: 'webcodecs', acodec: 'pcm', mime: 'video/quicktime', ext: 'mov'}`. In `vvPath` eingehängt vor dem Aufnahme-Weg (Test-Schalter `noPCM`).
- `vvEncodeWC`: eine Zeile verdeckt im Block `AudioEncoder`/`AudioData` durch `Va1PcmEnc`/`Va1PcmData` (gleiche Schleife, f32-planar → 16 bit LE interleaved). Eine weitere Zeile setzt die Spur auf `codec: 'pcm'`, `durs` = Frames je Paket und `fb: 4`.
- `VVMP4`: `va1PcmTables` (stsd `sowt` v0, stts `[frames, 1]`, stsc = Frames je Chunk, stsz `size 4 × frames`). Geändert sind zwei Zeilen: `ftyp` ist bei PCM `qt  `, der Blob-Typ `video/quicktime`.
- `vvMake`: Liefert AAC/Opus keinen brauchbaren Ton (`va1WcBad`), folgt **zuerst PCM** (`va1PcmRetry`, `aChk.fallback = 'pcm'`) und erst danach die Aufnahme. Auf dem Aufnahme-Weg prüft `va1HasSound(blob)` die Tonspur (MP4: `moov › trak › mdia › hdlr 'soun'`, WebM: `A_OPUS/VORBIS/AAC/PCM`). Ist die Datei nicht dekodierbar und hat keine Tonspur, gilt sie als stumm → Meldung `VA1_NOTRACK`.
- **Bug Clip-Matrix:** `vvSwapOut` setzte `TK` samt Zwischenspeichern auf den Stand vor dem Rendern zurück. `va1TkHold/va1TkBack` behalten `TK.buf/wait/missing/peaks/pend` jetzt wie aktuell (2 Zeilen um die `vvRest`-Schleife).
- **Export-Durchläufe:** `va1Pass(only, dry)` → `vvRenderAudio` des ganzen Songs. Nach `vvSwapIn` trennt `va1OnlyApply()` im **Offline**-Graph `AU.tracks[i].cut` der anderen Spuren ab. Lead/Chor über `G6.solo` (−2 nur Lead, −1 nur Chor), danach zurückgesetzt. `tkStartSrc`: `va1SkipLead(o)` lässt bei „Nur Chor“ Gesang ohne Chor schweigen. Nicht-Gesangsspuren rechnen mit `GGB.dry` (schneller), Meter aus (`VV.noMtr`).
- `va1Run(kind)` mit `song | stems | lead | chor` → `VA1.res`, danach Teilen in einem eigenen Tipp (iOS braucht für das Teilen-Blatt eine frische Geste). Ergebnis bleibt 10 min. WAV: 16 bit Stereo mit der Rate des Renders, mit Ausklang. Stems: eigene ZIP als Blob aus Blobs (`va1ZipBlob`, CRC in Scheiben `va1Crc`, kein großes Kopieren). Stille Stems werden weggelassen und genannt.
- **MIDI:** `va1MidiSong(idxs, withC)` arbeitet wie `buildMidiSong`, aber für jede Spur (auch über Synth 1–4/DRUMS hinaus; Kanal `midiCh`). `va1MidiClip` nimmt ohne Song den Clip der gewählten Szene. Träger-Einstellung wie im MIDI-Export (`UI.expCarrier`).
- **MIDI-Import:** `va1MidiParse` (Format 0/1, laufender Status, Note-off/vel 0, hängende Noten bis Spur-Ende) → `va1MidiImport(u8, t)`. Je MIDI-Spur (Format 0: je Kanal) ein Clip in den nächsten freien Szenen der Zielspur (gewählte Spur; nicht STIMME/Perkussion), Länge `ceil(Ende/4)` Takte (≤ 64), `normClip`. Ein ↶ (Gruppe aus `clip`-Einträgen).
- **Container:** `tkZipBytes` hängt `manifest.json` an (`va1Manifest`: `{kind: 'synquenzer-container', v: 1, app, created, project, takes: [{id, file, name, sec, sr, where[]}], missing[], sounds, files[]}`). `projekt.json` bleibt die erste JSON-Datei, ältere Fassungen öffnen die ZIP wie bisher. `tkExportZip` öffnet zuerst das Blatt (`VA1.direct` = wirklich sichern). `tkImportZip` → `va1ImportNote` prüft gegen die Liste (`VA1.lastImport`). Liste/Anzahl: `va1Inventory()` (alle Clip-Slots, Song-Stimmen, eigene Clips, Chor-Takes, Namen wie im Takes-Blatt).
- **UI:** `va1MenuRow` setzt [Export] in die Zeile von [Video], darunter verschiebt sich nichts. Das Blatt `va1Sheet()` (openPop + psh-Kopf mit ✕/Ablegen) enthält Statuszeile (immer da, kein Springen), Audio, MIDI (+ Spur-Tasten), Video, Container. CSS wird einmalig als `<style id="va1Css">` eingefügt, an der CSS-Sektion selbst ändert sich nichts.
- **Test-API** (am Ende angehängt): `va1Sheet, va1Close, va1Info, va1Export, va1ResB64, va1Share, va1Midi, va1MidiParse, va1MidiImport, va1BoxB64, va1BoxSave, va1BoxImport, va1VideoB64, va1HasSound`. Test-Schalter in `vvTest`: `noPCM`, `va1BadAE`, `va1NoTrack`.
- Projektformat unverändert (keine neuen Felder). VERSION/CHANGES nicht angefasst.

## 3. Tests

- `va1-test.mjs` (ein Skript): **38/38 OK** (≈ 110 s). Geprüft wurden:
  - **Wege:** ohne AAC (= iOS 18) und „kein AudioEncoder“ simuliert → PCM/MOV; Opus → MP4; ohne VideoEncoder → Aufnahme.
  - **MOV-Boxen:** `ftyp qt`, moov vor mdat, `vide/avc1` + `soun/sowt`, 2 ch/16 bit, 1 Sample = 1 Frame. Ton so lang wie das Bild (±0,1 s), PCM-Spitze −1,9 dBFS, Ton in der Datei bitgleich zum Offline-Ton. `va1HasSound` = ja.
  - **Rückfälle:** Opus mit kaputtem Ton → Rückfall PCM. Aufnahme-Weg: WebM mit Tonspur ok; nicht dekodierbar ohne Tonspur → klare Meldung; nicht dekodierbar mit Tonspur → angenommen.
  - **Bug nachgestellt:** Take lädt (verzögertes `kv.aget`) während des Instrumental-WAVs → danach geladen, `TK.wait` leer. Auf 4.42.0 blieb er hängen (`buf: []`, `wait: [id]`).
  - **Exporte:** Song-WAV; nur Gesang (Nulldurchgänge ≈ Sinus, beide Takte hörbar); Einzelspuren-ZIP (5 WAV, CRC stimmt, Gesang ohne Drums); Chor über `g6Make`; nur Chor (Takt mit Chor hörbar, Takt ohne Chor ohne Lead); nur Gesang mit Chor im Projekt = ohne Chor (±1 dB). Danach Live-Zustand unverändert (Solo null, dry aus).
  - **MIDI:** ganzer Song mit 4 Notenspuren; eine Spur; Import in Synth 4 → Noten, Länge und Anschlag gleich, ein ↶.
  - **Container-Rundlauf:** 2 Takes → ZIP (projekt.json, 2 WAV, manifest.json) → **frischer Browser-Speicher** → geöffnet, 2/2, beide Takes bitgleich, geladen und im Takt 1 und 2 hörbar.
  - **Bedienung:** „ZIP + Projekt“ öffnet das Blatt mit Liste. Blatt hochkant 428×926 und quer 926×428: ✕ sichtbar, alle Tasten ≥ 44 px, nichts abgeschnitten, kein Überlauf. Menü → Export neben Video. Keine Konsolenfehler.
- **Fotos:**
  - `va1-hochkant-428x926.png`
  - `va1-quer-926x428.png`
  - `va1-video-weg-428x926.png` (Video-Blatt mit „Weg: … Ton (PCM) · MOV“)
- **Pflicht:** topdefs: 0 Syntaxfehler, 0 doppelt (Namen 4951 → 5006). Rauchtest `errors []` (`smoke.png`). Marken 0, „MS 2000“ 1×, `  live: true,` 1×.
- Basis unberührt. Diff zur Basis: 2 geänderte Zeilen (ftyp, Blob-Typ), sonst nur Einfügungen.

## 4. Offen / Risiken

- **Echtes iPhone ungetestet:** Der VideoEncoder lief in dieser App auf iOS bisher nie (ohne AudioEncoder kam der Weg nicht dran). Kodierzeit, Speicher und Fotos-Import mit `.mov` (H.264 + LPCM) bitte auf dem iPhone 12 Pro Max abnehmen. Schlägt der VideoEncoder dort fehl, folgt wie bisher die Aufnahme. Hat deren Datei keine Tonspur, kommt jetzt die klare Meldung statt eines stummen Videos.
- **Dateigröße:** PCM-Ton macht die Datei um ≈ 10 MB je Minute größer (bei 5 Mbit/s Bild ≈ 37 MB/min, also ≈ +27 %).
- **Claude-App:** `.mov` lässt die Claude-App-Ablage evtl. nicht zu (Meldung „App in Safari öffnen“).
- **Einzelspuren:** Jede Spur ist ein eigener Offline-Durchlauf (3-min-Song mit 6 Spuren auf dem iPhone geschätzt einige Minuten; Fortschritt und Abbrechen sind da). Jede Einzelspur läuft durch den Master (Auto-Master/Limiter). Die Summe der Spuren ist deshalb nicht exakt der Mix. Stems beginnen gleich (Song-Anfang), ihre Länge endet je mit eigenem Ausklang.
- **1:1-Video:** Das Format gibt es in der App nicht (nur Test-Schalter). Im Blatt stehen 9:16 und 16:9.
- **Determinismus:** Schon 4.42.0 rendert in Headless-Chromium nicht bitgleich von Lauf zu Lauf (Ausklang-Ende ±50 ms, PCM-Hash verschieden; gemessen Basis gegen VA1, gleiches Verhalten). VA1 ändert daran nichts: Der Ton im Video ist bitgleich zum Offline-Ton.
- **„Clip verschwindet“:** Die gefundene und behobene Ursache (Take-Zwischenspeicher nach Instrumental-WAV/Video zurückgesetzt) passt zum Bild „flache Linie, stumm“. Meinte Xander einen anderen WAV-Knopf (Take-WAV im Takes-Blatt), bitte genau nachfragen. Dort habe ich im Test kein Verschwinden gefunden.
- **„Eigene Klänge“** im Container sind die eigenen Sounds und Programme der Bibliothek (wie bisher in der Projektdatei). Weitere eigene Dateien (z. B. Abspann-Logo) sind nicht drin.
- **MIDI-Import:** Tempo und Taktart der Datei werden nicht übernommen (Schläge bleiben Schläge). Perkussions- und STIMME-Spur sind kein Ziel. Mehr Teile als freie Szenen → Rest weggelassen (Hinweis).
