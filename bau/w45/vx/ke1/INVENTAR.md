# KE1 – Code-Inventar „Klang einfangen, einfrieren, nachbauen“ (nur gelesen)

Stand 16.11.2026. Quelle: `scratchpad/rel-4780/index.html` (4.78.0, md5 68e92c03…, 114 431 Zeilen) – nur gelesen, nicht geändert.
Zeilennummern = genau diese Datei. Dieses Dokument ist markenfrei; Pfade/Fakten mit Gerätenamen stehen in
der privaten Zusatzdatei `ke1-inventar-privat.md` unter `scratchpad/vx-privat/`.
Einzige Ausführung: `vx/ke1/render-probe.mjs` (Node, 3 kurze Noten, keine Audiodateien geschrieben).

---

## 1. Mikrofon-Aufnahme: was bleibt, wie kommt man an die Samples

| Was | Wo (Zeile) | Befund |
|---|---|---|
| Sprach-Filter aus | 56431 `MIC_ASK = {echoCancellation:false, noiseSuppression:false, autoGainControl:false}` | gilt für jeden Mikro-Weg (VS0-Check, MICTAP, Stimme) |
| Mikro nur oberstes Fenster | 56432 `micAvail()` | in der Claude-App (iframe) kein Mikro, keine Takes (Spur grau, 58990/58991 `tkAudioOk`) |
| Eingang wählen (USB-Interface) | 30595 `MICIN`, 30603 `micInBuiltin`, 30604 `micInExt` (Name nicht „iPhone/eingebaut…“ und nicht Bluetooth = extern), 30612 `micInPick` (eigene Wahl `uiPrefs().micIn`, sonst extern bevorzugt), 30617 `micInOpen` (`deviceId: {exact}`, zweiter Versuch nach erster Erlaubnis, Rückfall Standard) | ein Kabel-Mischpult am iPhone wird als „extern“ erkannt und bevorzugt; Weg dann `wired` (57405) |
| Weg-Erkennung | 57291 `stGuessRoute(label)`: `bt` / `wired` (usb, lightning, headset…) / `speaker` | Latenz-Profil je Weg (localStorage, keine Audiodaten) |
| Gemeinsamer Abgriff | 30632 `micTapGet(user)` → 30653 `micTapNodes` (MediaStreamSource → Gain) | genutzt vom Vocoder-Eingang (MS 2000 E1/E2) |
| Stimme-Worklet | 57038 `ST_WK` (`synq-stimme`), Knoten 57411: `channelCount: 1, channelCountMode: 'explicit'` | **Stereo-Eingang wird zu Mono gemischt** ((L+R)/2 → ein Signal nur auf einem Kanal kommt −6 dB an); Int16, Blöcke à 4096 |
| Ringpuffer | 57322 `stRing(sr)`: Mikro + Referenz (was die App spielt) + 16-kHz-Kopie (3:1, für Tonhöhe) | Länge `max(120 s, g8RingSec())`, höchstens 300 s (65618 `G8_RING_MAX`); Abtastrate = AudioContext-Rate |
| Abtastrate | 30026 `new AC({latencyHint})` – **nie** eine feste Rate (WebKit-Fehler, Kommentar Z. 30025) | = Geräte-Rate (am iPhone meist 48 kHz [unbestätigt, nicht gemessen]); Mikro-Rate ≠ App-Rate → Warnung + Nachführen (57407) |
| Takes (VS3) | Kopf 58901–58916; 58922 `tkNormTake` (`{sr, len, chunks, route, latMs, created, src: fang/rec/song/import/dup/chor}`); 59093 `tkMakeTake` (aus Ring, ab 2 Takte Anlauf/1 Takt Ausklang); 59078 `tkStore` | **Audio bleibt erhalten**: PCM16 mono, Stücke ≤ 1 MB (`TK_CHUNK` 524288 Samples, 58981) in IndexedDB `synquenzer` v2, Store `audio` (24662); im Projekt nur IDs |
| Stimme-FANG | 58563 `vsFang` → Take + MELODIE-Noten; 58488 `vsAnalyse`; Quelle `cfg.src === 'inst'` = Instrument-Modus (58500, 58598) | FANG speichert den Take mit (58573 `tkQ('fang')`) |
| Samples eines Takes | 59004 `tkPcm(id)` → `Promise<Int16Array>`; 59002 `tkBuffer(id)` (AudioBuffer-Cache); 59045 `tkReadMic` | Test-API `window.SYNQUENZER` (113334): `takes()`, `tkPcmRange(id,a,b)`, `tkBufRange`, `tkWavInfo`, `tkExportWav`, `tkInject({pcm, sr})` (60474–60507); Ringpuffer: `stimmeRead(a,b,o)` (82800) |
| Export/Import | 60282 `tkWav` (WAV 16 Bit), 60308 `tkExportWav`, ZIP 60351 `tkImportZip`; Audio-Datei-Import 111399 `imp1Pick` (decodeAudioData) | WAV verlässt das Gerät nur per Teilen |
| MIDI | 55177 `connectMidi` – nur **Web-MIDI-Eingang** (Noten an die Tastatur), **kein MIDI-Ausgang** | Fremdgerät aus der App ansteuern geht heute nicht |

## 2. Vorhandenes „Klang nachbauen“ (Spektral-Seite)

- **Einstieg:** Takes-Blatt „Im Spektrum öffnen“ (59796) bzw. Clip-Blatt (103859) → `spk1Open({take})` (103830) → Ebene → Note antippen
  oder Ebenen-Menü ⋯ „Klang nachbauen“ (SPK11, 108450 `spk11Klang`; sucht vorher selbst Noten). **Ein Mikro-Take kann also
  heute schon nachgebaut werden** – nur über die Spektral-Seite, eine Note, kein Ein-Tipp-Weg.
- **Merkmale** (Worker, 104249 `klangFeat`): f0, Obertöne `hdb` (16–24, dB), Rauschanteil (1 − harmonisch/gesamt), Bänder je
  Abschnitt (Anschlag 0–60 ms, früh 60–250 ms, gehalten, Ausklang), Pegel-Hüllkurve 64 Punkte, eine Periode (128 Punkte), ADSR;
  SPK3 `x3`: Schwebung je Oberton, Verstimmung, Vibrato {Rate, Tiefe}, Wah {Rate, Tiefe}.
- **Schätzung:** Wellen-Mischung Säge/Puls(Breite)/Dreieck/Sinus (nicht-negative kleinste Quadrate) × Tiefpass (Grenze in
  Obertönen, Resonanz 0/.25/.5/.75) per Rastersuche; FM-Verhältnis r und Index I über Bessel-Tabelle (`e` = Fehler, FM wenn
  `fm.e < 0.5·va.e`); Unison (105659 `spk4KlUni`).
- **Optimierer:** 104740 `spk2KlOpt` / 105189 `spk3KlOpt`: (1+6)-Evolution, ~50 Versuche, jeder Versuch offline gerendert durch
  **dieselbe Engine** (104684 `spk2KlRender`: OfflineAudioContext + Worklet-Text + `SynthHost.track`), Abstand 104732
  `spk2KlDist` = 0,45·Bänder + 0,3·Obertöne + 0,25·Hüllkurve (dB) + Bewegung (SPK3).
- **Schreibt in:** 104705 `spk2KlSnd` → `engine: 'analog'` (VA): `o1w/o2w` 0–3, `o2lvl` (Mischung), `o1pw/o2pw`, `noise`,
  `ftype 0` (nur LP24), `cutoff`, `res`, `fenv`, `fD` (fA fest .001, fS 0), ADSR `aA aD aS aR`; SPK3 (105149): `o2fine` ±25 ct,
  `o1uni/o2uni` 5 + `uniDet`, LFO 1 → Tonhöhe (Vibrato) / Cutoff (Wah). Oder `engine: 'fm6'`: 2 Operatoren (Träger 1,
  Modulator r, `ol`, Abfall `mD`, Halten `mS`), ADSR, Filter. Effekte neutral. „Als Klang übernehmen“ = ein ↶.
- **Qualität (Notizen `vx/spk4/NOTES.md` Z. 114–120, CHANGES-V3 4.62):** Abstand VA 3,89 · FM 2,06 · Pad Unison 1,62 → 0,96 ·
  Lead Vibrato 0,95; Zeit je Nachbau 1,7–2,9 s (Browser, Xeon). Probe-Test `vx/spk2/spk2-klang-probe.json`: VA Filter 1535 statt
  1200 Hz, ADSR nah.
- **Grenzen:** eine Note, nur VA oder 2-OP-FM; **kein Ziel „MS 2000“**, keine Speicherwelle, kein OSC 3/Sub/Sync/Ring/Saite/
  VOKAL, Filtertyp fest LP24, Filter-Anschlag/Halten fest, Unison-Breite/-Pegel nicht geschätzt (fest 0/0,6, 5 Stimmen), keine
  Effekte (Hall/Chorus/Echo), keine Anschlagstärke, keine Wahrscheinlichkeiten (nur „bester Versuch“ + Text 104775 `spk2KlEstTxt`).

## 3. Engines und Parameterräume

**VA „analog“** (Worklet `dirigent-analog`, Text ab 13965, `registerProcessor` 18683; Bereiche 24166–24182 `AN`, 24196 `normAnalog`):
3 Osz `o{1,2,3}w` 0–4 (Säge, Puls, Dreieck, Sinus, 4 = Saite/Karplus mit `strDmp/strHel/strAnr`), `oct` ±2, `semi` ±12 (o2 −12…24),
`fine` ±50 ct, `pw` .03–.97, `lvl` 0–1, `uni` 1–7; `o2sync`; `uniDet/uniMix/uniWidth`; Sub `subLvl/subOct 1–2/subW`; `noise` 0–1,
Rauschfarbe `kfNc` 0–3, Ringmod `kfRm`; `analog`, `reset`; Filter `ftype` 0–6 (28405: LP24 LP12 BP24 BP12 HP24 HP12 VOKAL), `cutoff`
20–20000, `res` 0–1,15, `drive`, `kt`, `fenv` ±1, `fvel`, `bass`; Hüllkurven Amp/Filter/Mod je A .001–10, D .005–10, S 0–1, R .005–15,
Kurve; 2 LFO (`shape` 0–5, `rate` .01–40, sync, retrig, fade, S&H in Tonart `kfSh1/2`); `glide`, `mode`, `poly` 1–8, `spread`, `level`;
Mod-Routen 9 Quellen × 25 Ziele (24186–24189).
**FM:** `fm6` (24214 `normOp`, 24230 `normFm6`): 6 OP, `alg` 1–32, `fb` 0–7, je OP `coarse` 0–31, `fine` 0–99, `det` ±7, `ol` 0–99,
EG `r[4]/l[4]` 0–99, `ks`, `vs`, `rs`, Tonhöhen-EG `peg`, `ams/pms/pmd`; frei verschaltbar `p.fmx` (23633 `G.FMX`, ≤ 12 Kanten 14128).
**WT:** `p.wt` {table digital/vocal/glas/orgel, pos, scan, scanTime} (24192, 24204); **Klangkorn** `p.wt.h` = Körnchen/Spektral-Schleife
aus einem Take (111878–112413; Regler `SPK7_RG` 112066: pos, bew, gs, dc, spo, spt, form, ADSR, fc, q, br, vol, poly).
**MS 2000** (`mk`, 23644 `MK_LABEL`; Bereiche 23650 `TR`, 23670 `normT`, 23680 `normMk`; Beschriftungen 9216 `L_`):
2 Timbres; OSC1 `w` 0–7 (Säge, Puls, Dreieck, Sinus×, Stimmwelle, **Speicherwelle**, Rauschen, Eingang), `c1/c2` 0–127
(Speicherwelle n = ⌊c2/2⌋+1, 30876 `mkWaveOf`); OSC2 `w` 0–2 (Säge, Rechteck, Dreieck), `mod` 0–3 (aus/Ring/Sync/Ring+Sync), `semi` ±24,
`tune` ±63; Mixer o1/o2/Rauschen 0–127; Filter `type` 0–3 (24LPF 12LPF 12BPF 12HPF), `cut/res` 0–127, `eg/vel/kbd` ±63; Amp `lvl, pan,
gate, dist, vel, kbd`; EG1 (Filter) / EG2 (Amp) A D S R 0–127; LFO1/2 (`w` 0–3, `f` 0–127, sync, Note); 4 PATCH (Quelle/Ziel 0–7, ±63);
`asg` Mono/Poly/Unison, `udet` 0–99, `porta`, `vib`, `bend`; Programm: `mode` Synth/Vocoder, Schicht/Split, Skalen, MOD-FX, DELAY, EQ,
ARP, Vocoder `voc`, SEQ je Timbre. Ersatz-Abbildung auf VA: 23707 `mkToFlat`.
**„Kompakt“** = keine eigene Engine, sondern 128 MS-2000-Programme (Block `/*MKK{*/` 11688, CHANGES-MK-MK8b).
Weitere: `bm` (Bit Mask, eigenes Worklet), `north` (Perkussion), `fm2` (alt). Liste 24191.
**Patch-Datenformat:** Sound `{engine, name, cat, p, mods, fx}` über `SQStore.normalizeSound` (24344); an das Worklet als flacher
Patch `wkFlat` (30435: `eng` 0 = VA, 1 = FM6, 3 = MS 2000) + `wkMods` + `wkFmOf` (31002) + `p.mk`.

## 4. Offline-Rendern der echten Engine

**A) Reines Node, ohne Browser (geprüft in diesem Lauf):**
`dirigent-test/v3-mk1-node.mjs` (`makeScope` lädt den Text `sq-worklet-src` mit Ersatz-`AudioWorkletProcessor`, `render(pmk, events,
{file, eng, flat, mods, sec, sr, at})`), `dirigent-test/v3-mk2-node.mjs` (`renderW`, Speicherwellen über `MKTAB` aus Block `/*MKT{*/`),
FM6 wie `dirigent-test/n5-k-golden-node.mjs` (`processorOptions.fm6`). Befehl:
`cd scratchpad && nice -n 10 node vx/ke1/render-probe.mjs` (setzt `MK_FILE=rel-4780/index.html`). Ergebnis: VA 220 Hz, MS 2000,
Speicherwelle 23 – alle endlich, je 1,2-s-Note ≈ 0,4–0,6 s inkl. Laden. Hinweis: der flache Patch muss wie `wkFlat(normalizeSound(s))`
gebaut sein (Store-Teil nicht in Node; am sichersten einmal im Browser erzeugen wie n5-k-golden-node, oder Felder selbst setzen).
**B) Playwright (Chromium, Paket `playwright` löst ohne Zusatz auf):** Seite über lokalen HTTP-Server öffnen, dann
`SYNQUENZER.mkRender(sound, ev, {sec, sr})` (30888, Test-API 83052; jede Engine, gibt `{l, r}`), `__spk.spk2.klang.probe(sound, midi,
dur, {n})` (104890: rendern → analysieren → nachbauen), `__spk.spk2.klang.render/snd/dist` (103902). Vorlage:
`vx/spk2/spk2-klang-probe.mjs <index.html>`, `vx/spk3/spk3-klang-probe.mjs` [in diesem Lauf nicht gestartet].

## 5. „Wellen aufnehmen“ / Speicherwellen-Tabelle

- **Keine Aufnahme-Seite und kein Wellen-Import in 4.78** (grep `sq-mkrec`, `synq-mkwaves`, „Wellen aufnehmen“: 0 Treffer).
  `mkInfo().waves === 'platzhalter'` (30886); Texte „64 nachgezeichnete Wellen (≈ = Nr. 60)“ (9648, 9670, 52531).
- **Tabelle:** 9019 `MK_WD` (Base64, Salz-Byte; je Welle r-Code + K = 32…128 Teiltöne à 12 Bit Pegel (0,025 dB) + 12 Bit Phase),
  zwischen `/*MKD{*/…` im Block `/*MKT{*/` (9006) … `/*}MKT*/` (9174), Dekoder 9020 `MKTAB.data()`, Gruppen `GRP` 9026, Oktav-Wellen
  35 und 61–64 (`isOct`), Mipmaps 11 Stufen (9022), `mkTables/builder/wave` 9141–9169. Hauptfaden baut und schickt `{mkw}`
  (10950–11002), Worklet-Seite ab 14540.
- **Echte Wellen einsetzen:** (a) gleiche Kodierung, neue Teiltöne → `MK_WD` neu schreiben mit dem Bau-Skript
  `dirigent-test/v3-mk2-wellen.mjs [index.html] --write` (liest heute die private Nachzeichnung; Eingabe = Liste `{n, r, a[K], p[K]}`);
  (b) Plan MK10 (Spec Nachtrag 3, Abschnitt „MK10“ ab Z. 1581): Aufnahme-Seite `sq-mkrec-src`, eigene DB `synq-mkwaves`, Analyse
  (Periode bis 2 Notenperioden, periodensynchrone Mittelung, DFT, Korrektur über Bezugs-Säge, je Oktave), Paket ≤ 200 KB,
  Einbau-Skript `mk10-einbau.mjs` → Datenblock ≤ 45 KB, dann `waves: 'eingebaut'`. Nichts davon gebaut.

## 6. Sample-Instrument / Multisample

- **Kein Multisample-Weg** (keine Zonen/Tastenbereiche, kein „Sampler“ im Code).
- Nächstes Vorhandene: **Klangkorn „Als Instrument“** (112326–112360): eine Auswahl (≤ 10 s) als Take + Klang `wt` mit `p.wt.h`
  (eine Quelle, Grundton `f0`, Tonhöhe = Taste/Grundton per Körnchen/Spektral-Schleife; 32015 `spk7Voice`). Also **ein** Sample,
  über die Tastatur verschoben, keine Verteilung mehrerer Aufnahmen auf Tasten/Anschlag.

## Folgerungen für den Prototyp (kurz)

1. Daten sind da: jeder Mikro-Take liegt als PCM16 + `sr` vor (`tkPcm`), FANG speichert ihn mit. Für „einfrieren“ braucht es keinen
   neuen Speicher.
2. Stereo wird gemischt (57411): für ein Instrument nur an einem Eingangskanal −6 dB, sonst unkritisch.
3. Der Nachbau-Kern (Merkmale, Optimierer, Offline-Render) ist wiederverwendbar; es fehlen: Ziel MS 2000 (Parameterraum oben,
   Speicherwelle als Kandidat), Filtertypen/Filter-Hüllkurve voll, Wahrscheinlichkeiten je Parameter (z. B. Streuung der besten
   Versuche), Ein-Tipp-Weg vom Take.
4. Für Messreihen ohne Browser: Node-Harness (Abschnitt 4 A); für Ende-zu-Ende: `klang.probe` im Browser.
