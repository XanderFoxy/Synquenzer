# IMP1 – LESEN (Basis 4.54.1, Zeilen in index.html; alles vor Zeile 96685 ist gleich der Basis)

## Import-Wege (bündeln, nichts doppelt)
- Projekt-Datei: `<input id="fileIn" accept=".json,…,.zip">` Z. 5299; Knopf Öffnen Z. 52323 (`EL.fileIn.click()`), auch `boxin` Z. 75831; Handler `onFilePicked(file)` Z. 53048 (ZIP → `tkImportZip` Z. 60227, JSON → `parseAny` → `importProject` Z. 52998 / `importProjectUI`, Backup → `importBackup`, Klänge → `importSoundsText`).
- Gesang importieren (GGB): Block Z. 75012 ff. `GGB_ACCEPT` Z. 75030 ('audio/*,.wav,.m4a,.mp3,.aif,.aiff,.caf'); `ggbDecode(ab)` Z. 75145 (OfflineAudioContext 48 kHz decodeAudioData); `ggbMono(buf)` Z. 75149 (Int16 mono, stückweise mit `vvYield`); `ggbPlace(pcm, sr, name)` Z. 75160 (STIMME-Spur, `tkEnsureTrack`, `tkAddPcmTake`, Overdub-Logik, ein Undo „Gesang importiert“); `ggbImportBuf(ab, o)` Z. 75221; `ggbReadFile` Z. 75242; `ggbPick()` Z. 75244 (eigenes `<input id="ggbIn">`); Knopf im Takes-/STIMME-Blatt `ggbHtml()` Z. 75254 (data-a="ggbi"). Test-API `ggbImport(b64, o)` Z. 75306.
- MIDI-Import (VA1): `va1MidiParse(u8)` Z. 75622 (SMF 0/1, Spuren/Kanäle, Noten in Schlägen); `va1MidiTarget` Z. 75652; `va1MidiImport(u8, t0)` Z. 75658 (je Spur/Kanal ein Clip in freie Szenen der gewählten Spur, ≤ 64 Takte, ein Undo „MIDI importiert“); `va1MidiPick()` Z. 75684 (`<input id="va1MidiIn">` ohne accept – iOS). Kein Tempo/Taktart aus der MIDI-Datei (FF 51 / FF 58 werden übergangen) → in Schritt 2 ergänzen.
- Video-Datei (VVL) Z. 74531 – nicht betroffen.
→ Plan Schritt 2: ein gemeinsamer Wähler (Audio + MIDI), danach das Import-Blatt; Audio-Dekodieren über `ggbDecode`, Mono über `ggbMono`/`imp1Mono`; MIDI über `va1MidiParse`.

## Audio-Speicher (IDB) und Takes
- `kv` Z. 52608 (Speicher-Hülle), IndexedDB 'synquenzer' v2 Z. 24650, `aput(k, buf)` Z. 24693 (Audio-Stücke).
- `TK` Z. 58866, `TK_CHUNK` 524288; `tkStore(id, pcm, chunks)` Z. 58963; `tkPersist()` Z. 58971; `tkAddPcmTake(pcm, sr, src, id)` Z. 60297 (Int16 → S.takes[id], Puffer-Cache, IDB).
- Datenform: `clip.audio = {take, in, out (s), at (Schlag), gain, fadeIn, fadeOut, alt[]}` Kommentar Z. 58793; `tkNormSeg` Z. 58826, `tkNormAudio` Z. 58834, `tkNormVox` Z. 58844 (song.vox = Song-Stücke {id, bar, len, …audio}), `tkNormProject` Z. 58859 (genau eine STIMME-Spur, `stimmeT()` Z. 58869).
- Wiedergabe: `tkStartSrc(o)` Z. 59251 (Take-Stück als AudioBufferSourceNode, auch Offline-Render); `tkVoxResync` Z. 59404; `tkEnsureTrack(items)` Z. 59430; `tkVoxTrim` Z. 59580; Takes-Blatt `tkSheet` Z. 59657.
- Selbsttragende Datei: `va1Inventory()` Z. 75694 (Container-Inhaltsliste), ZIP `tkExportZip` Z. 60200 / `tkImportZip` Z. 60227.
- Dehnen: `vsStretchMake()` / `stretch(x0, sr, warp, o)` Z. 61503 (WSOLA, Marken bitgleich, Faktor 0,5–2,0) → für „Audio passend dehnen“ nutzen. G7 „folgt“ (Transponieren) Z. 72216 ff.

## Song / Szenen / Taktart
- `normClip(c, kind, pk)` Z. 28727; `clipChanged(t, s)` Z. 51797; `NT()`/`NS()` Z. 28480 (8 Szenen, N_SCN).
- Song: `normSong(o, pk, nt)` Z. 28975 (lanes[t] = [{bar, slot}], bars, own, vox, marks …); `songSetBars` Z. 28971; `songEnsure` Z. 37921; `songSnapshot`/`songChanged` Z. 33513/33514; `undoPush` Z. 34778; `setBpm(v)` Z. 34748 (ganzzahlig 40–240!).
- Taktart T1: `tsDefs()` Z. 28615 ('4/4','3/4','2/4','5/4','6/8' (b 3 Viertel),'7/8','12/8' (b 6)); `S.ts` Projekt, `clip.ts`, `song.marks[].ts`; `tsNorm`, `tsBeats`, `barBeat`, `tkMap`, `tkBump`. BPM = Viertel (`spb()` Z. 32929).
- Marken/Teile: `marksNorm(list, bars)` Z. 29052 (song.marks – Teil-Namen für „Strophe 1 …“).

## Offline-Render (VV1)
- `vvRenderAudio(o)` Z. 73858 → `int53cRender` → `vvRenderAudio0(o)` Z. 73863: OfflineAudioContext, ganze App-Engine, Rückgabe `{buf, ch:[L,R] (Song-Fenster), sr, dur, lead, …}`; `vvYield` Z. 74435 (MessageChannel-Atempause).
- Test: app-test.mjs baut Szenen + Song (lanes) und rendert damit.

## Worker-Muster in der App
- Blob-URL, sonst data:-URL (z. B. Z. 6380, 11957, 56445) → IMP1 gleich.
