# SYNQUENZER v2 (formerly DIRIGENT) — Extension Specification

Status: build-ready. Audience: the builder agents that extend the single-file app in 7 sequential work packages (§17), and the testers who verify each package.
Deliverable: the same single file `index.html` (vanilla JS + Web Audio, no libraries, German UI). It runs as an iPhone Safari standalone app and inside the claude.ai artifact viewer sandbox.

**How to read this document**

- **Base:** `scratchpad/dirigent-spec.md` (called **old spec** here, sections `§old-N`) and the current build `scratchpad/dirigent-wt/index.html` (app version 2.0.0, called **current build**). Everything in the old spec stays valid unless this document says otherwise. This is especially true for the harmony core (`§old-6`), the Transposer (`§old-7`), the scheduler and launch quantization (`§old-9`) and the recording timing rules (`§old-10`). Port nothing new into them except what is written here.
- **Naming:** the product is now called **SYNQUENZER**. This follows the user's binding addendum `scratchpad/dirigent-v2-addendum.md`. The user calls the result of this document "v2". Internally it is **app version 3.0.0, project format 3**.
- **Reference code:** every new subsystem was prototyped and measured. The source of truth for algorithms is the research code listed in §1.2. Embed it as described; do not rewrite it from scratch. Where this document and a research file disagree, **this document wins**. Every conflict between research outputs is resolved explicitly here, marked **(Entscheidung)**.
- **Priorities:** everything is **P0** unless marked *(P1)*. P2 items are listed in §18 and are not built.
- Section numbers §3–§14 correspond to the 12 requested topics. Each has the same five parts: **UI** (portrait 390×844 / landscape 844×390), **Bedienung** (interaction), **Daten** (data model), **Audio** (audio graph) and **Tests** (acceptance).

---

## 0. Overview

### 0.1 What the user asked for → where it is specified

| User's wish (quote, shortened) | Feature | § | Work package |
|---|---|---|---|
| „man sieht nicht richtig, wie man aufnimmt“ | Recording states you can see: pulsing REC, count-in in the slot, live recording lane, red keys, result toast | 3.1 | WP2 |
| „das Editieren fehlt mir“ | Piano roll (draw/select/erase, zoom, velocity, step input, loop range), drum step grid with lanes, quantize sheet, copy/duplicate | 3.3–3.7 | WP2 |
| „einen einzelnen Clip … stoppen … kann man nicht so richtig“ | Tap a playing clip = stop at the bar line; ■ double-tap = stop now | 3.2 | WP2 |
| „ganze Sessions aufnehmen … zusätzlich eine Melodiespur … patternmäßig festhalten … mit dieser Transponier-Funktion“ | Song recording (scene/clip launches + Träger changes **+ live-played notes**), song view, melody lane; *(P1)* melody bars → clip that follows the Träger | 3.9 | WP6 |
| „Muss man jeden Clip seiner Tonart zuordnen …? … kann das System die Noten aussperren …? … wie Brain im OP-XY/OP-Z“ | Automatic key per clip and per scene; a single key moves in the scale (OP-Z), chords as before (Improvisor), lit in-key keys; **keyboard shows the key while playing and can lock out-of-key notes** | 4 | WP2 |
| „Hüllkurve besser bedienen, schöne weiche Flächen, Unisono, Brot-und-Butter, analoge klassische Sounds“, „dritter Oszillator“, „Ladder-Filter von Moog“, „Feedback“, „Mischungsverhältnis“ | Analog engine: 3 osc, footage switch + semitone + fine, PWM, sub, noise, unison 1–7, glide, ZDF ladder up to self-oscillation, drive, 3 ADSRs with a touch graph (A ≤ 10 s, R ≤ 15 s) | 5 | WP3 (UI, native), WP4 (worklet) |
| „Der erste schnappt auf Tonwerte ein, der andere gibt Prozentwerte dazu. Wie ist das gemeint?“ | Every oscillator gets the same strip: Fußlage 32'–2' · HT · Fein · Pegel, plus a plain-language readout | 5.2 | WP3 |
| „FM … mehr Operatoren, wie DX7“ | 6-operator FM, all 32 DX7 algorithms, operator envelopes, feedback, diagrams, .syx import | 6 | WP7 |
| „Drums … wie Waldorf Attack oder Nord Drum … Drumsounds selber erstellen“ | Universal drum voice (tone/noise/metal/click), 12 pads, 7 kits, step grid with accent/chance/ratchet/locks | 7 | WP6 |
| „satter Chorus, Hall mit langer Fahne, Echo mit synchronen Zählzeiten“ | Juno chorus I/II/I+II, ensemble, wide; Dattorro hall up to 20 s with freeze; tempo-synced echo with exact timing; master glue + limiter | 8 | WP4 |
| „LFOs mit Synchronizität … Modulationsmatrix … wie Bitwig … Regler gedrückt halten … LFO 1 oder LFO 2“ | 2 LFOs + mod envelope per synth, 8-slot matrix, hold a knob to pick a source, modulation rings | 9 | WP3 (engine), WP5 (UX) |
| „Eingabe für Basslauf oder irgendwelche Sequenzen … ganz flexibel“ | **LAUF**: a mono step view for synth clips (pitch by scale step, tie/slide, accent, octave), plus step input in the piano roll | 3.10, 3.3 | WP5, WP2 |
| „Eingabe … ohne dass Markierungen auftauchen und die Seite sich sperrt … verstellt man irgendwas“ | Knob/fader v2, touch hygiene, gesture registry, undo/redo for every edit, no one-tap destructive edits in the piano roll, nothing pops up over the keys, visual and optional device haptics, screen stays awake while playing | 10, 3.3, 3.6, 1.7 | WP1, WP2 |
| „Sound-Presets … abspeichern“, „Preset-Bibliothek … geile Sounds … Filtersounds … Sphärenflächen … wo man sich was abgucken kann“ | 30 analog + 12 FM factory sounds + 7 kits, each with a "Trick" text; objective quality gates (§11.1); *(P1)* „Was ist anders?“ highlights the knobs that make the sound; user library | 11 | WP3, WP5, WP6, WP7 |
| „als Projektdatei abspeichern mit allem Drum und Dran“ | One versioned JSON file containing project, sounds, effects and the user library | 12 | WP1, WP3 |
| „Das Logo One Day in Rome soll scharf in die UI“ | Inline SVG logo in the top bar, menu header and app icon | 13 | WP1 |

### 0.2 Answers to the user's direct questions (also used as in-app help text, §4.2)

1. **Do I have to assign a key to every clip?** No. Every clip's key (**Bezug**) is detected automatically when it is recorded or edited. All following clips of a scene share one detected **scene key**, with the bass weighted most, as on the OP-Z. The detected key is shown as a small label („a-Moll“). You only touch it if you want to.
2. **Does it lock out notes that do not fit?** Clips that follow the Träger stay in key automatically. A single key that lies **inside** the key (shown lit in TRANSPONIEREN) moves everything by scale steps, like the OP-Z/OP-XY: D in C major turns C-E-G into D-F-A (D dorian). A key **outside** the key is a real key change by semitones. A **chord** makes every clip follow that chord's harmony, like the Zyklus Improvisor (C-E-G-E becomes A-C-E-C under Am). TONART (strictly in key, like the OP-XY Brain) and PARALLEL (exact semitones, CV, like a KeyStep) stay available. **When you play (SPIELEN)** the keyboard lights the notes of the current key by default („Tastatur: Tonart zeigen“), so you can play matching parts with basic knowledge. „Tastatur: Tonart sperren“ goes one step further: out-of-key keys play the nearest in-key note below, so a wrong note is impossible (§4.2).
3. **Is it the Improvisor principle, and is the OP-Z behaviour in it too?** Yes, both. AKKORD = Improvisor (chord-scale mapping, inversions, 15 chord types). One finger in AKKORD = OP-Z (in-key → mode/scale step; out-of-key → key change). TONART = OP-XY Brain. PARALLEL = MPS/KeyStep CV transpose. All three are computed by the existing tested harmony core (`§old-6`). Only the default for one finger changes (`single: 'key'`, §4).
4. **"The first oscillator snaps to notes, the second adds percent?"** In v1 there was „Osz 2 Okt.“ (steps), „Verstimmung“ (cents) and a mix knob „Osz 2“ shown in %. In v2 every oscillator has the identical classic strip: **Fußlage** 32' 16' 8' 4' 2' (octave switch), **HT** (semitones, detented), **Fein** (cents, centre detent) and **Pegel** (level). A readout spells it out: „8' +7 HT +5 ct = Quinte“. The mix lives on a Minimoog-style **MIX** page.

### 0.3 Vocabulary additions (exact German UI terms)

| Term | Meaning |
|---|---|
| **Aufnahme-Leiste** | Live view of the recording (bars, playhead, notes) that replaces the carrier bar while recording. |
| **FANG** | Turns what you just played (without REC) into a clip that keeps looping in time. |
| **Editor** | Piano roll for synth clips: **Zeichnen**, **Auswahl**, **Radieren**, **Raster**, **Notenlänge**, **Schritt** (step input). |
| **Schritte** | The drum step grid. Lanes **VEL · AKZENT · CHANCE · WIRBEL · TIMING · TUNE · DECAY**. |
| **Quantisieren** | **Raster** (1/4 … 1/32, triplets, Aus, Auto), **Stärke** 0–100 %, **Swing** 50–75 %, **Humanize**. |
| **Szenen-Tonart** | The key shared by the following clips of a scene, shown under the scene launcher („Am“). |
| **Song** | A recorded arrangement: launches per bar, Träger changes, **Melodie** lane. View switch **CLIPS ⇄ SONG**. |
| **LAUF** | Step view for mono bass lines and sequences in the clip editor (§3.10); its counterpart is **ROLLE** (piano roll). |
| **Tonart zeigen / Tonart sperren** | Keyboard in SPIELEN: light the in-key notes / also replace out-of-key notes by the in-key note below (§4.2). |
| **Projekte** | The list of all projects kept in the browser (§12.2). |
| **Fußlage** | Oscillator octave as organ footage: 32' 16' 8' 4' 2'. |
| **HT / Fein** | Semitone offset (−12…+12, detented) and fine tune (±50 ct). |
| **Unison** | 1/3/5/7 voices per oscillator, **Verstimmung**, **Breite**. |
| **Qualität** | Ladder **ANALOG** (5 nonlinearities) or **ECO** (1). |
| **Quelle / Ziel / Tiefe** | Modulation source / destination / depth. Sources: **LFO 1, LFO 2, Hüllk. 2** (mod envelope), **Anschlag**, **Filt.-Hk.**, **Tonhöhe**, **Zufall**, **Mod-Rad**, **Lautst.-Hk.** |
| **Modulieren** | Mode after picking a source: dragging any knob sets that source's depth. Banner „LFO 1 moduliert · Fertig“. |
| **Operator / Algorithmus / Träger-Op / Modulator** | FM terms. "Träger" is already taken by the transposition carrier, so FM carriers are called **Ausgang** (output operator) in the UI. |
| **Hall · Echo · Chorus · Pumpen · Master** | Effects (§8). |
| **Sound / Bibliothek / Eigene** | A sound = a complete preset of one track. The library holds factory sounds and the user's own (**Eigene**). |
| **Sichern / Als Datei sichern** | Save a sound into the library / export the project as a .json file. |

### 0.4 Decisions at a glance (conflicts between research outputs, resolved)

| # | Decision | Where |
|---|---|---|
| 1 | Product name SYNQUENZER, app 3.0.0, project format 3; `window.DIRIGENT` stays as an alias | §1.1, §16 |
| 2 | VA **and** FM6 run in **one AudioWorkletNode per synth track** (`dirigent-analog`, eng 0/1); native per-voice fallback; WT stays native; drums native | §1.3 |
| 3 | 6 operators × all 32 algorithms; the UI shows 8 favourites first | §6.1 |
| 4 | Mod amounts are stored in **engine units** (as the factory file does); the UI shows knob units via `K[dst]` | §9.2 |
| 5 | One finger in AKKORD = in the scale (`single:'key'`, OP-Z) by default; harmony core unchanged | §4.1 |
| 6 | Raw onset field is `o` (the research's `r` collides with the drum ratchet) | §3.5 |
| 7 | A tap on a playing clip queues a stop at the bar line (GarageBand rule) | §3.2 |
| 8 | Per-hit drum drive and all shapers without oversampling (no latency jumps) | §7.1, §8.1 |
| 9 | Track FX block `{drive, chorus, rev, dly, pump, pumpRel, vol, pan}`; buses in `S.fxBus` | §8.2 |
| 10 | Compact notes keep extra fields as a 5th element | §12.1 |
| 11 | FM carriers are called „Ausgang“ in the UI („Träger“ means the transposition carrier) | §0.3 |
| 12 | Editor sheets also cover the carrier row in P; the keyboard shrinks but stays playable | §2.3 |
| 13 | The data model changes once, in WP3 (synths) and WP6 (drums); FM v2 patches live as `fm2` until WP7 | §17 |
| 14 | Logo in the top bar (left), vector, no filter; the metronome button stays | §13 |
| 15 | Piano roll, tool Zeichnen: a tap on a note **selects and auditions** it; it never deletes (deviation from `pianoroll.js`). Deleting = Radieren tool or [Löschen] | §3.3 |
| 16 | The addendum's „Loop-Bereich“ = a bar range on the ruler + [Loop = Auswahl], which crops the clip (one undo). No loop sub-range in the scheduler | §3.3 |
| 17 | FANG never overlays the keys: it lives in a fixed slot at the right end of the mode bar | §3.6 |
| 18 | „Tastatur: Tonart zeigen“ is P0 and on by default; „Tonart sperren“ is P0, off by default | §4.2 |
| 19 | Bass lines and sequences get the **LAUF** step view (mono, scale-step pitch), built in WP5 on the WP2 `StepEditor` | §3.10 |
| 20 | Song recording also records live-played notes into the melody lane; the melody track is chosen by a chip, never by long-press | §3.9 |

---

## 1. Architecture

### 1.1 One file, ordered blocks

`index.html` keeps the old structure: `<head>` with metas, CSS and fonts; `<body>` with the static skeleton; then the scripts. New in v3: each embedded module is a **separate classic `<script>` block**, in this order, with a header comment naming its research source:

| # | Block | Source (scratchpad/…) | Global | First WP |
|---|---|---|---|---|
| 1 | `<script type="text/plain" id="sq-worklet-src">` **ASCII only, never contains `</script`** | `presetlib/analog-core-sync.js` + scope patch from `modux/analog-core-scope.js` (§5.4) + FM block (§6.3, WP7) + `fxresearch/fx-worklet.js` | (text) | WP4 |
| 2 | Harmony + Transposer (unchanged) | current build | `Harmony`, `Transposer` | – |
| 3 | KeyDetect | `recresearch/keydetect.js` | `KeyDetect` | WP2 |
| 4 | RecHelpers | `recresearch/rec-helpers.js` | `RecHelpers` | WP2 (FANG), WP6 (Song) |
| 5 | PianoRoll | `recresearch/pianoroll.js` (rename field `r`→`o`, §3.5) | `PianoRoll` | WP2 |
| 6 | DrumSeq + StepEditor | `drumresearch/drum-seq.js`, `drumresearch/step-editor.js` | `DrumSeq`, `StepEditor` | WP2 |
| 7 | SQStore | `presetlib/preset-store.js` (extensions §12.3) | `SQStore` | WP1 (KV, Autosave), WP3 (rest) |
| 8 | SQ_FACTORY | `presetlib/presets-factory.js` | `SQ_FACTORY` | WP3 (analog), WP6 (kits), WP7 (FM) |
| 9 | Native voices | `analog-research/fallback.js` (split, §5.5) | `NativeVoice` | WP3 |
| 10 | Envelope editor | `analog-research/adsr-editor.js` (fine-mode change, §10.3) | `makeEnvEditor` | WP3 |
| 11 | SynthHost | `analog-research/host.js` (loader generalized, §1.4) | `SynthHost` | WP4 |
| 12 | FX | `fxresearch/fx-native.js` | `FX` | WP3 (TempoLFO for native LFOs), WP4 (buses) |
| 13 | DrumSynth + DrumKits | `drumresearch/drum-engine.js`, `drumresearch/kits.js` | `DrumSynth`, `DrumKits` | WP6 |
| 14 | DXN + FMH + algorithm SVG | `fmresearch/proto/dx6-native.js`, `fmresearch/proto/dx6-presets.js` (FMH only, ROM presets **not** shipped), `fmresearch/proto/algsvg.js` | `DXN`, `FMH`, `algSvg` | WP7 |
| 15 | App | current build, extended | `SYNQUENZER` (alias `DIRIGENT`) | all |

Rules:

- Strip each module's `module.exports` line. Do not add ES modules or imports.
- The worklet source block must stay **ASCII only**, because the data: URL path uses `btoa`. Add a dev check, `node tools/check-worklet.mjs` (or any equivalent script kept next to the scratchpad), that extracts the block and fails on any non-ASCII character or `</script`.
- The file may grow to about 1.2 MB. That is fine: the parse cost on an iPhone is under 100 ms, and the artifact limit is 16 MB.
- `<title>SYNQUENZER</title>`, `apple-mobile-web-app-title` = `SYNQUENZER`, and the description meta mentions "One Day in Rome".

### 1.2 Research code to reuse (all tested; read the file header before integrating)

| Area | Files | Verified facts that the integration must keep |
|---|---|---|
| Analog synth core | `presetlib/analog-core-sync.js`, `modux/analog-core-scope.js`, `analog-research/{host,fallback,adsr-editor}.js`, tests `analog-research/test-*.mjs` | Ladder LP24 −12.04 dB at fc; self-oscillation from res 1.0; no NaN in 60 000 random blocks; 40 voices at 13–31 % of one Xeon core; Blob, then data: loading from an opaque origin works |
| FM | `fmresearch/proto/{dx6-worklet,dx6-native,dx6-presets,algsvg}.js`, `fmresearch/tools/syx.mjs` | Algorithm table identical to msfa/Dexed; 32 voices at about 30 % of a core; native path within 0.3–9 dB of the worklet for 7 of 8 patches |
| Drums | `drumresearch/{drum-engine,kits,drum-seq,step-editor}.js` | 60 kit sounds render without NaN; clap bursts about 11 ms apart; choke within 30 ms; 15/15 step-editor touch tests |
| FX | `fxresearch/{fx-native,fx-worklet,fx-lfo-worklet}.js`, `fxresearch/tools/*` | Hall RT60 2.14 s for a 2 s setting, 18.9 s for 20 s; echo repeats within 1 frame; Juno chorus sweep 1.66–5.35 ms; compressor makeup formula exact |
| Mod UX | `modux/modknob-lab.html`, `modux/test-modknob.mjs` | 45/45 touch tests; two-finger knob bug in the current build confirmed |
| Recording/editing | `recresearch/{keydetect,pianoroll,rec-helpers}.js` + tests | Key detection 90–98 % exact on random loops; 28/28 piano-roll touch tests; 14/14 song/capture tests |
| Presets/storage | `presetlib/{presets-factory,preset-store,analog-core-sync}.js` + tests | 30 analog sounds calibrated to −18 LUFS; IndexedDB survives a reload; checksum, history and rescue copy work |

### 1.3 Engine matrix (Entscheidung)

| Track sound engine | Primary path | Fallback (no AudioWorklet) | Notes |
|---|---|---|---|
| **VA** `engine:'analog'` | One AudioWorkletNode `dirigent-analog` per synth track (eng 0). The worklet owns voice allocation | `NativeVoice.analog` per voice: unison ≤ 3 on osc 1, Biquad with dB-Q mapping, fake whistle | Badge „ECO-Klang“ in the editor header when on the fallback |
| **FM** `engine:'fm6'` (WP7) | **Same per-track node** with eng 1. The DX6 operator block replaces the oscillator section; the ladder, envelopes, LFOs and matrix are shared | `NativeVoice.fm6` = `DXN.voice` inside the native filter/VCA chain | Replaces the v2 2-op engine. Until WP7, v2 FM sounds run as legacy `engine:'fm2'` on the native chain (§5.5) |
| **WT** `engine:'wt'` | Native per-voice (current WT code) + native filter/envelopes using the new flat parameters | – | Kept so no current feature is lost. Modulation is limited to the native subset (§9.5) |
| **Drums** `engine:'drum'` (WP6) | Native per-hit `DrumSynth.hit` + per-pad strips + kit bus | – | No worklet, so drums always work |
| **Hall** | AudioWorkletNode `dirigent-hall` (registered by the same module) | `FX.ConvHall` (convolution, decay ≤ 10 s) | |

**Why FM goes into the per-track synth worklet** instead of one worklet node per note (as the FM research proposed):

1. One node per track avoids the measured ~9 % per-node overhead and the main-thread cost of creating 6+ nodes per note. Setup for 32 voices took 2–4 ms in the worklet versus 11–31 ms natively.
2. FM voices get the ladder filter, the three ADSRs, both LFOs, the 8-slot matrix and voice stealing for free. The user then has one modulation model for every synth.
3. The native per-voice DX path stays as the fallback, so nothing depends on the worklet.

The FM operator code is ported from the tested `dx6-worklet.js`. The acceptance test compares the merged engine against that file (§6.8).

### 1.4 Worklet module and loader

- **One module string** contains both processors, `dirigent-analog` (synth) and `dirigent-hall`. It is loaded once per AudioContext by `SynthHost.load(ctx, src)`.
- **Loader chain:** Blob URL first, then `data:application/javascript;base64,` + `btoa(src)`, each with a 2.5 s guard timeout. On success, create a probe node and dispose it. State: `SynthHost.state` = `'idle'|'loading'|'ready'|'failed'`, plus `SynthHost.how` (`'blob'|'data'`) and `SynthHost.err` (shown in Menü → Info).
- **Start-up race:** call `SynthHost.load()` from `ensureAudio()` without awaiting it. Notes spawned before the module is ready use the native path. Once ready, the next note uses the worklet. The engine choice is made per note at spawn time, so mixing during the first ~40 ms is harmless.
- **Hall:** built with the convolution fallback first. When `SynthHost.state` becomes `'ready'`, replace it with the worklet hall: connect the new one, then disconnect the old one after its tail (≤ 3 s).
- Never set `sampleRate` in the AudioContext constructor (WebKit bug 274507). Keep `navigator.audioSession.type = 'playback'`.

### 1.5 Audio graph v3 (final state after WP7)

```
SYNTH TRACK i (0..3)
  [worklet] SynthHost node (stereo, all voices)  ─┐
  [native ] per-voice chains (WT, fallback)       ─┼─► trackIn ─► drive(WaveShaper, oversample 'none') ─► chorus(FX.Chorus insert, only if mode≠off)
                                                   │            ─► trem(Gain) ─► duck(Gain, pump) ─► vol(Gain) ─► pan(StereoPanner) ─► post
DRUM TRACK 4: per hit DrumSynth.hit ─► pad strip[slot] (pan, room send, gate send) ─► kitBus.in ─► trackIn ─► … same chain …
              kitBus.room(Convolver 0.7 s) / kitBus.gate(Convolver gated) ─► returns ─► trackIn
post ─► masterSum
post ─► revSend(Gain) ─► hallIn = hallPre(Delay, mono) ─► hall (worklet | ConvHall) ─► hallRet ─► hallDuck ─► masterSum
post ─► dlySend(Gain) ─► echoIn(Gain) ─► echo.input ── FX.Echo (one DelayNode per loop) ─► echo.output ─► masterSum
                                                                         └► echo.toHall ─► hallIn
masterSum ─► glue(Compressor) ─► trim(makeup − autoMakeup) ─► drive ─► vol ─► limiter ─► pre(0.5) ─► ceil(WaveShaper) ─► destination
                                                                                                                     └► analyser
metronome & count-in clicks ─► masterSum   (they now get the same graph latency as the music)
FX LFOs (FX.TempoLFO, only when routed, §9.6) ─► Gain(amt·span) ─► send gains / pan / trem / chorus params
```

### 1.6 Runtime state additions (names the builders share)

- `AU.synth[i]` = SynthHost engine of track i (or `null`). `AU.hall`, `AU.hallIn`, `AU.echo`, `AU.M` (FX.Master), `AU.graphLat`, `AU.loopExtra`, `AU.drumBufs`, `AU.kit` (kit bus), `AU.strips[slotId]`.
- `R.songRec`, `R.songPlay`, `R.songOverride[5]`, `R.carrierLive`. A queued per-clip stop is `R.pend[i] = {slot:-1, beat}` (§3.2).
- `UI.modSrc`, `UI.modFocus` (§9), `GEST` and `RESTPTR` (gesture registry, §10.5), `UNDO` and `REDO` (§10.4), `CAP` (FANG buffer, §3.6), `UI.wake` (wake lock sentinel, §1.7.6).
- `ED.page` (sub-tab per tab), `ED.roll` (piano roll API), `ED.step` (step editor API), `ED.lauf` (LAUF view, §3.10), `ED.fmOp`, `ED.fmSub`.
- `S.fxBus`, `S.song`, `track.sound` (§15).

### 1.7 Platform rules (additions to `§old-1`)

1. Keep every hard constraint of `§old-1`: no `alert/confirm/prompt`, only Google Fonts over the network, `safeGet/safeSet` wrappers, the downloads capability for files, audio started by a gesture, and the lookahead scheduler.
2. **Touch hygiene, global.**
   - CSS: `*{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}`, with `input,textarea{-webkit-user-select:text;user-select:text}`.
   - `html,body{touch-action:pan-x pan-y;overscroll-behavior:none}`. Every custom gesture surface gets `touch-action:none`: keyboard, pads, knobs, faders, XY pad, envelope editor, piano-roll canvases, step grid, mod picker, song grid cells.
   - Buttons get `touch-action:manipulation`. Hover styles only inside `@media (hover:hover)`.
   - JS: `preventDefault` on `gesturestart/gesturechange/gestureend`, on `selectstart` outside inputs, and on `contextmenu`.
   - A **non-passive `touchstart` preventDefault** on every gesture surface. This is the only reliable way to stop the iOS loupe. Because `click` then does not fire on those surfaces, they act on `pointerup`.
3. **No vertical scrolling on pages that contain knobs or faders.** Every editor page fits its area (§2.4). Only lists scroll (preset list, matrix list, menu), and only via their label columns (`touch-action:pan-y`); their sliders stay `touch-action:none`.
4. **One popover layer.** Its backdrop takes the outside tap on `pointerdown` (with `preventDefault` and `stopPropagation`), so closing never edits what lies underneath. Escape closes it.
5. **Long tasks:** no main-thread task over 50 ms during playback. JSON serialization of autosave and convolver buffer swaps first call `tickAhead(0.30)`, which runs the scheduler once with a 300 ms horizon, and then do the work (§12.4, §8.1).
6. **Screen stays awake while making music (WP1).** iOS locks the screen after 30 s–5 min without touches, and a locked screen stops Web Audio, so a song or a long take would die mid-way. On `play()`, on REC start and on `visibilitychange(visible)` while playing: `try { UI.wake = await navigator.wakeLock.request('screen') } catch {}`. Release it 60 s after the transport stops. Inside the artifact iframe the permission policy may refuse it, and iOS < 18.4 ignores it in standalone mode: fail silently and show „Bildschirm bleibt an: ja / nicht verfügbar“ in Menü → Info.
7. **No `requestIdleCallback`.** iOS Safari does not have it. Every "idle" job in this spec (drum buffers §7.1, worklet hall swap, history snapshots) uses `const idle = window.requestIdleCallback || (f => setTimeout(f, 50))`, and runs only while the transport is stopped or right after `tickAhead(.3)`.
8. **File pickers on iOS.** iOS greys out files whose extension has no system type when `accept` lists it. Therefore `accept` lists only types iOS knows (`.json,application/json`). The .syx picker (§6.6) has **no** `accept` attribute and checks the content instead.

---

## 2. Layout v3

Layouts are chosen by media queries only (`§old-2`): **P** portrait, **L** landscape phone (max-height 560 px), **W** wide. Below, "usable" means after safe-area insets.

### 2.1 Portrait main screen (390×844, usable about 374×763)

```
┌──────────────────────────────────────────────┐
│[LOGO][▶][●] TAKT●○○○ 3.2 │112│ ♩ │ ≡         │ TOP BAR 52 (logo 50×36, §13)
├──────────────────────────────────────────────┤
│ SONG ⇄ │ ▶1 Am │ ▶2 Am │ ▶3   │ ▶4   │ ■     │ scene row 40, scene key under the number (§4.2)
│SYNTH 1⇅│ ███ ■ │ ███   │      │      │ ■     │ ■ = playing (tap = stop at the bar line, §3.2)
│SYNTH 2⇅│ ███ ■ │       │      │      │ ■     │
│SYNTH 3⇅│ ███ ■ │ ███   │      │      │ ■     │
│SYNTH 4⇅│  [+]  │       │      │      │ ■     │
│DRUMS 🔒 │ ███ ■ │       │      │      │ ■     │
├──────────────────────────────────────────────┤
│● Synth 4 · Mini-Lead [KLANG][✎][⇅][M][↶]     │ TRACK STRIP 48
├──────────────────────────────────────────────┤
│[AKKORD▾] TRÄGER Am7 −3 🔒   [LATCH][ORIG.]    │ CARRIER BAR 56 → AUFNAHME-LEISTE while recording
├──────────────────────────────────────────────┤
│ [‹] [ ♪ SPIELEN | ⇅ TRANSPONIEREN ] [›][FANG]│ MODE BAR 52 (FANG slot 64, empty unless lit)
├──────────────────────────────────────────────┤
│  KEYBOARD (or 12 PADS 4×3)                   │ clamp(170px,30dvh,260px)
└──────────────────────────────────────────────┘
```

- Top bar widths (gap 4, side padding 8): logo 50, ▶ 44, ● 44, TAKT 76 (label row with „TAKT“ and LEDs, value 26 px digits), BPM 52, ♩ 40, ≡ 40. Total 386 ≤ 390.
- **360–389 px** (iPhone SE, 12/13 mini = 375 px): gap 2, side padding 6, BPM 48, ♩ 36, ≡ 36 → 358 px. Use `@media (max-width:389px)`; the touch targets stay ≥ 36×44.
- Below 360 px width, the logo leaves the top bar and moves into the clip-grid corner cell (as in the current build).
- The grid corner cell holds the **SONG ⇄** view switch (WP6). Before WP6 it shows the caption „SZENE“.
- The track strip gains **✎** (open the clip editor for the selected slot, §3.3). FOLGT becomes a 52 px icon toggle „⇅✓“ / „⇅ fest“.

### 2.2 Landscape main screen (844×390, usable about 750×369)

```
┌───────────────────────────────────────────────────────────────────────────┐
│[LOGO][▶][●] TAKT 3.2 ●○○○│112 BPM│♩│Q AUTO│LÄNGE AUTO│[FANG]│     [CPU] [≡]│ TOP 44 (logo 46×34)
├───────────────────────────────────────────────┬───────────────────────────┤
│ SONG ⇄ │▶1 Am│▶2 Am│▶3  │▶4  │ ■             │ TRÄGER  Am7  −3  🔒         │
│ SYNTH 1│ ███ │ ███ │    │    │ ■             │ [AKKORD▾] [LATCH] [ORIG.]   │ side 300
│ …  5 track rows (≥ 30 px)                     │ Am · F · G7 · C  (Verlauf)  │
│ DRUMS  │ ███ │     │    │    │ ■             │ ● Synth 4 [KLANG][✎][⇅][M][↶]│
├──────────┬────────────────────────────────────┴───────────────────────────┤
│ ♪ SPIELEN│  KEYBOARD (≈15 white keys) or 12 PADS 6×2                      │ clamp(110px,34dvh,150px)
│ ⇅ TRANSP.│                                                                │
│ [‹]  [›] │                                                                │
└──────────┴────────────────────────────────────────────────────────────────┘
```

- While recording, the **Aufnahme-Leiste** replaces the readout and the mode-chip row at the top of the side panel (96 px tall).
- The **CPU** badge (amber text, 9 px caps) appears only while the CPU limiter is active (§14.3). Tapping it opens Menü → Info.
- **Small landscape (667×375, iPhone SE/mini; usable ≈ 667×355):** below 760 px width the top-bar chips „Q AUTO“ and „LÄNGE AUTO“ are hidden (both stay in Menü → Aufnahme and in the REC options popover), the side panel shrinks to 260 px and the keyboard shows ≈ 12 white keys. Nothing scrolls horizontally.

### 2.3 Sheets (editors) — geometry change

| Sheet | P: covers | L: covers | Keyboard while open |
|---|---|---|---|
| Sound editor (synth), drum editor, clip editor (piano roll), sound browser | rows grid + strip + **carrier** (y 52 → 541, height 489) | row 2 (grid + side), height ≈ 215. Exception: the clip editor in L covers rows 2 **and** 3 (keyboard hidden; [⌨] shows it, §3.3) | P: keyboard row shrinks to **170 px**; L: to **110 px** (150 ms transition; release live play inputs before) |
| Clip sheet (long-press) | bottom sheet over the grid area | same | unchanged |
| Menu | full screen | full screen | hidden |

- The **song view** (§3.9) is not a sheet: it replaces the clip grid inside the grid area, and the keyboard keeps its normal height.
- In P the carrier bar is hidden while a sheet is open. An amber chip „⇅ Am7“ in the sheet header shows an active Träger. The mode bar and the keyboard stay usable: you can still transpose, play and do step input.
- All sheets share one frame: **header row** (44 P / 40 L), an optional second header row (P only, 40), an **LCD line** (28 P; in L it shares the tab row), a **tab row** (40 P / 32 L), an optional **sub-tab row** (32 P; in L it shares the tab row) and a **body** with no vertical scroll.
- Body heights: in P about 305 px, i.e. 3 knob rows of 92 px, or 2 knob rows plus segments. In L about 140 px, i.e. 1 knob row plus a 44 px segment row.

### 2.4 Control sizes v3 (replaces `§old-2.6` where larger)

| Control | P | L | Notes |
|---|---|---|---|
| Knob cell | 72×92 (SVG 60) | 72×92 | label 11 px caps above, value 12 px mono below |
| Vertical fader | 56×170 (travel 120) | 56×120 (travel 80) | mixer, FM operator levels |
| Segment button | h 40, min w 44 | h 32, min w 40 | LED dot for the active one |
| Toggle (switch) | 56×36 | 52×32 | LED + text („SYNC 2→1“) |
| Step cell | 42×44 (8×2) | 36×40 (16×1) | §3.4 |
| Pad | ≥ 84×60 (4×3) | ≥ 110×52 (6×2) | §7.2 |
| List row | 48 | 44 | browser, matrix, song tracks |

Nothing causes horizontal page scroll at 320 px width. Pages lay out their controls as **rows of up to 4 knobs (P)** or **1 row of up to 9 (L)**. The page definitions in §5.2, §6.5, §7.3 and §8.3 list controls in reading order. Wrap them into P rows of 4 and L rows of ≤ 9, and put segments on their own row.

### 2.5 Menu (≡) v3 — sections and help text

| Section | Content (new in v3 in **bold**) | WP |
|---|---|---|
| Projekt | Name, [Neu], [Demo laden], [Als Datei sichern (.json)], [Datei öffnen], **[Projekte]**, **[Ältere Versionen]**, **status line**, **7-day reminder** (§12.2); *(P1, WP6)* **[Song als Audio]** (§3.9) | WP1 |
| **Sounds** | **[Alle eigenen Sounds exportieren], [Sounds importieren], [DX7-Bank importieren (.syx)]** (WP7) | WP3 |
| MIDI-Export | Szene / Alle Szenen / Mitschnitt, „mit Träger“, **Song** *(P1)* | WP6 |
| Harmonie | Projekt-Tonart, Modus, **Einzelton: In Tonart (Standard) / Parallel (CV)**, Moll-Akkorde, Wechsel, Oktave, Split *(P1)*, Notennamen, **Tastatur beim Spielen: Tonart zeigen (Standard) / Tonart sperren / Aus** (§4.2), **[So funktioniert's]** (coach card) | WP2 |
| Aufnahme | Länge, **Quantisieren (Auto / Aus / 1/4 … 1/32)**, **Einzähler (Aus / 1 Takt / 2 Takte *(P1)*)**, Metronom bei Aufnahme, Metronom-Lautstärke, Swing | WP2 |
| Klang | Master-Lautstärke (= `fxBus.master.vol`), **Qualität (Auto / Analog / Eco)**, **Puffer (Interaktiv / Stabil)**, [Alle Töne aus] | WP4 |
| **Bedienung** | **Haptik (an/aus)**, Notennamen | WP1 |
| MIDI-Eingang *(P1)* | unchanged | – |
| Hilfe | the lines below | each WP adds its line |
| **Info** | version; storage (IndexedDB / localStorage / nur Speicher, persist result); audio state, sample rate, output and graph latency; „Bildschirm bleibt an“ (§1.7.6); **Synth: Worklet (blob/data) / Kompatibel + reason**; **Hall: Worklet / Faltung**; CPU load and limiter level; FM note on the algorithm 4/6 feedback | WP1, WP4, WP7 |

**Hilfe** (German, one line each; replaces the 5 old lines):
- „Spur wählen, leeren Platz antippen, ● drücken – nach dem Einzählen einspielen, ● nochmal = fertig. Die Aufnahme-Leiste zeigt, was gerade aufgenommen wird.“
- „Gespielt ohne Aufnahme? FANG macht daraus einen Clip, der im Takt weiterläuft.“
- „✎ öffnet den Editor: Zeichnen, Auswählen, Radieren; zwei Finger zoomen. Jede Geste lässt sich mit ↶ rückgängig machen.“
- „Szene starten: ▶ 1–4. Laufenden Clip antippen = stoppt zum nächsten Takt. ■ zweimal = sofort.“
- „TRANSPONIEREN: Die Tastatur ist stumm. Leuchtende Taste = Stufe in der Tonart (wie OP-Z), dunkle Taste = neue Tonart, Akkord = alle Spuren folgen (wie Improvisor). Die Tonart jedes Clips wird automatisch erkannt.“
- „KLANG: Regler ziehen = ändern, seitlich wegziehen = fein, doppelt tippen = Standard, gedrückt halten = modulieren (LFO 1, LFO 2 …).“
- „SONG: Szenen live starten und aufnehmen – was du dabei spielst, wird als Melodie mitgeschnitten. Später eine Melodie dazu spielen.“
- „LAUF: Basslauf oder Sequenz Schritt für Schritt – Schritt antippen = an, hoch/runter ziehen = Ton in der Tonart.“

---

## 3. Recording comfort and editing (topic 1)

### 3.1 Recording you can see

**UI**

| rec.state | REC button | TAKT block | Target slot | Carrier row (P) / side top (L) | Keyboard |
|---|---|---|---|---|---|
| off | ● red outline, sub-label = length („AUTO“, „2T“) | normal | – | carrier bar | normal |
| armed (transport running, waiting for the bar line) | ● blinks once per beat (class toggled in `uiFrame` on each beat change) | normal | red border blinks; large digit „in 3“ (beats to start) | **Aufnahme-Leiste**: „START IN 3 · Synth 4 · Szene 1“ | normal |
| countin | same as armed | value 4-3-2-1 in red (existing) | large red digit 4-3-2-1 | „EINZÄHLEN 3“ | normal |
| recording | solid red; 80 ms scale pulse (1 → 1.06) on every beat | label „REC“ in red instead of „TAKT“ | fills red left→right (progress); mini notes redrawn at most every 250 ms from `rec.temp` | Aufnahme-Leiste live (below) | pressed keys turn red (`.kb.rec .key.dn{background:#ffb3ad}`) |
| overdub | red with sub-label „OD“ | „REC“ | existing playing look + red border | „OVERDUB · Takt 1/2 · +3 Noten“ | red pressed keys |

**Aufnahme-Leiste.** P: 56 px, replacing the carrier bar. L: 96 px at the top of the side panel. Contents:

- A canvas, redrawn every frame while recording. It shows bar lines (brighter on bar 1), the playhead (2 px red), recorded notes in the track colour and held notes as red bars growing to the playhead. View: the whole clip if ≤ 4 bars, otherwise the last 4 bars, scrolling. Pitch range = lowest to highest recorded note ±1, with at least 12 semitones.
- A text line, written to the DOM only when it changes: „AUFNAHME · Takt 2/AUTO · 7 Noten · endet Takt 4“. The fixed-length variant reads „Takt 2/4“.
- A **[● FERTIG]** button (56×44) at the right edge. It does the same as pressing ●. Reference code: Anhang D.3 (`recLaneFrame`).

**Result.** When a recording or overdub closes with notes, show a toast for 5 s: „2 Takte · 14 Noten · a-Moll · 1/16“ with two actions, **[Bearbeiten]** (opens the editor, §3.3) and **[Rückgängig]**. The toast component therefore gets up to 2 action buttons. A recording with nothing played shows „Nichts aufgenommen“, as before.

**Count-in.** `settings.countIn` becomes `0 | 1 | 2` bars (old `true` → 1, `false` → 0). *(P1: 2 bars.)* The overlay digit counts the remaining beats; the first beat of each count-in bar is accented. The overlay additionally shows the target: „Synth 4 · Szene 1“.

**Bedienung.** Unchanged from `§old-4.3/4.4`. ● starts or ends the recording; a long-press on ● opens the options popover, which in v3 gets one more row: [FANG – Gespieltes einfangen] (§3.6).

**Daten.** `runtime().rec` gets `notes` (count so far) and `lane` (true while the Aufnahme-Leiste is shown).

**Audio.** None new. Clicks go through `masterSum` from WP4 on (§8).

**Tests**
- [ ] R1 ● from stopped: during the count-in the slot shows „4“…„1“ and the Aufnahme-Leiste reads „EINZÄHLEN n“. At beat 0, `runtime().rec.state === 'recording'` and the leiste text starts with „AUFNAHME“.
- [ ] R2 Four notes played: the leiste text contains „4 Noten“, and `runtime().rec.notes === 4` before closing.
- [ ] R3 While recording, the REC button has class `pulse` toggled once per beat (± 1 frame) and the TAKT label reads „REC“.
- [ ] R4 After closing, the toast contains the bar count, the note count and the detected key, and offers [Bearbeiten] and [Rückgängig]. [Rückgängig] restores the empty slot.
- [ ] R5 Pressing [● FERTIG] ends the recording exactly like ● (same close beat as `§old-10`).
- [ ] R6 In P the carrier bar is hidden (display:none) while `rec.state !== 'off'` and returns afterwards. No layout shift of the keyboard (its `getBoundingClientRect().top` is unchanged).

### 3.2 Stopping a single clip (GarageBand rule)

**UI.**
- Every playing slot shows a small ■ glyph (10 px, bottom-right, track colour) so the gesture is visible.
- A clip with a queued stop blinks dim at 4 Hz with the text „stopp in N“ (N = beats to the bar line).
- The ■ column stays, with a tooltip/aria-label „Spur stoppen (2× = sofort)“.

**Bedienung (changed rule; replaces `§old-4.2` step 3)**

| Tap on … | Transport running | Effect |
|---|---|---|
| playing clip, no stop queued | yes | **stop at the next bar line** (`R.pend[i] = {slot:-1, beat:nextBar}` via `switchTrackAt`); selection moves to it |
| playing clip with a stop queued | yes | cancel the stop (`R.pend[i] = null`), toast „Stopp abgebrochen“ |
| queued clip | yes | cancel the launch (as before) |
| other filled clip | yes | launch at the next bar (as before) |
| any filled clip | no | launch and play (as before) |
| ■ of a track | – | stop at the next bar; a second tap within 400 ms = **stop now**: cancel the track's clip voices with start ≥ now, release sounding ones with a 30 ms fade, `R.slot[i] = -1` |
| header ■ | – | all tracks at the next bar; double tap = all now (the transport keeps running). While the transport is stopped: `panic()` (as before) |

- Selection always follows the tap, so the tapped slot is the REC/edit target.
- `recPress` on a playing clip with a queued stop first cancels the stop, then starts the overdub. Without this, ● would relaunch the clip at the bar line.
- **Selecting to edit never stops by accident.** A stop that was queued by a tap is cancelled silently (no toast) when, before it lands, the user opens that clip with ✎, opens its clip sheet, or starts LAUF/step input on it. Users often tap a playing clip only to select it for editing; the clip must keep playing while they edit.
- The stop boundary uses the press time (`pressTime(atT)`, `nextBarFromAudible`), like launches.
- Long-press still opens the clip sheet and never stops anything.

**Daten.** No persisted change. `runtime().queued[i]` shows `{slot:-1, beat}` for a queued stop.

**Audio.** Existing `cutTrackAt/cancelTrackFrom`. For "stop now", release sounding voices with `fastTau = 0.01`. Reference code: Anhang D.6.

**Tests**
- [ ] S1 CEGE playing, tap at beat ≈ 5.3 → `queued[0]` = `{slot:-1, beat:8}`. No clip notes of track 0 at beat ≥ 8. The cell shows „stopp in 3“ at beat 5.
- [ ] S2 Tap again at beat ≈ 6 → `queued[0] === null`, notes continue after beat 8, toast „Stopp abgebrochen“.
- [ ] S3 Double tap on ■ of track 0 → no `clip` note of track 0 starts later than 50 ms after the second tap, and `voices()` of track 0 are all released within 50 ms.
- [ ] S4 A tap on a playing clip followed by ● within the same bar → overdub starts, no stop happens and the clip keeps its phase (`cstart` unchanged).
- [ ] S5 A tap on a playing clip followed by ✎ within the same bar → `queued[i] === null`, the editor is open and the clip is still playing two bars later.

### 3.3 Clip editor (piano roll) for synth clips

**UI P** (sheet 374×489; keyboard 170 px below stays playable)
```
┌──────────────────────────────────────────────┐
│ SYNTH 1 · SZENE 2   a-Moll · 2 Takte    [✕]  │ 44 header
│[✎][⬚][⌫]│[1/16][♪1/8][Tonart][Schritt][LAUF][⤢]│[↶][↷]│ 44 toolbar (pan-x if needed)
│TAKT│1        │2        │┃(clip end)       │ 26 ruler: drag = scroll, ┃ = length, tap a bar number = loop range
│ A4 ▒│   ▬▬     ▬                            │
│ G4  │ ▬▬    ▬▬▬                             │ ≈275 grid (22 px rows, keys 40 px)
│ …   │                                       │ in-key rows lighter, tonic row tinted
├─────┼───────────────────────────────────────┤
│ VEL │ ▌ ▌  ▌ ▌                              │ 56 velocity lane
│[▲Stufe][▼Stufe][+12][−12][Dupl.][Quant.][Legato][Takte−][Takte+][Löschen]│ 44 action bar (pan-x)
└──────────────────────────────────────────────┘
```
**UI L.** The editor covers rows 2 **and** 3 (height ≈ 325; keyboard hidden). The toolbar includes **[⌨]**, which shows the keyboard (110 px) for step input and listening. Header and toolbar share one 36 px row, the velocity lane is 44 and the action bar 36. That leaves ≈ 187 px of grid.

**Bedienung.** Exactly the gesture set of `recresearch/pianoroll.js`. It is binding because it is the fix for "nothing may lock up or change by accident":
- **Zeichnen** (default): tap empty = note of the current length; drag on empty = draw it longer or shorter (pitch follows the finger); tap a note = **select it and play it** (it is never deleted by a tap; **(Entscheidung)** deviation from `pianoroll.js`, where a tap deletes — a stray finger must never destroy a note); drag a note = move it with snap (keeping off-grid offsets); drag its right end (last 35 %, ≥ 10 px) = length.
- **Auswahl:** tap = select/deselect; drag on empty = marquee; drag a selected note = move the selection.
- **Radieren:** tap or swipe deletes. The tool button is red while active, and the tool falls back to Zeichnen when the editor is closed, so nobody returns to a "deleting" editor.
- **Two fingers** always pinch-zoom (each axis separately) and scroll; they never edit. Dragging the keys column scrolls vertically; tapping a key plays it. Dragging the ruler scrolls horizontally; the ┃ handle sets the clip length in whole bars.
- No long-press and no double-tap actions anywhere in the editor. Slop 7 px. A finger resting > 500 ms edits nothing. A second finger cancels what the first one started. `pointercancel` reverts the gesture. **One undo entry per gesture.**
- Toolbar: **Raster** cycles 1/4 → 1/8 → 1/8T → 1/16 → 1/16T → 1/32 → frei. **♪** = note length (last drawn length or the grid). **Tonart** folds the rows to the clip's scale plus pitches already used. **Schritt** = step input (below). **⤢** = fit the whole clip / one bar.
- Action bar (on the selection, or on all notes when nothing is selected, shown as „ALLE“): ▲/▼ Stufe (by scale step of the clip key), ±12, Dupl. (copy right after the selected span; with nothing selected the clip is doubled), Quant. (opens the sheet of §3.5, applied to the selection), Legato, Takte −/+, Löschen. „ALLE“ + [Löschen] asks in place first („Alle Noten löschen?“ [Löschen] [Abbrechen], no modal).
- **Loop-Bereich** (addendum item 4): a tap on a bar number in the ruler selects that bar; a second tap on another bar number extends the range (amber band in the ruler). The action bar then shows **[Loop = Auswahl]**: the clip is cropped to the range (notes before it shift left, notes after it are removed, `len` = range length), one undo step. A tap on the band clears it. The ┃ handle still sets only the end. The scheduler is unchanged (the loop is always the whole clip).
- **Step input (Schritt):** an amber cursor column. Tapping the ruler moves it. Keys played in SPIELEN while the editor is open sound and are written at the cursor; a chord = all keys within 40 ms. The step length is the grid, and the cursor advances. Buttons: **Pause** (empty step), **Bindung** (last entry one step longer), **⌫** (step back and delete). No REC is needed; step input never also records.
- **Open from:** the clip sheet [✎ Bearbeiten] · the result toast [Bearbeiten] · ✎ in the track strip. On an empty slot, ✎ creates an empty clip (len = LÄNGE if numeric, else 1 bar; key = scene key, `src:'auto'`) as one undo step. On the drum track, ✎ opens the drum editor STEPS tab.
- The playhead follows in clip coordinates while the clip plays (`api.playhead(beatInClip)`, transform-only).

**Daten.** Notes are edited in place (stable identity). A manual move deletes `o` (§3.5). After every committed gesture: sort, `pushUndo` (one entry), `afterClipEdit` (below) and schedule auto-key (§4.3).

**Audio.** `afterClipEdit(t, s)`: if the clip is playing, `cancelTrackFrom(t, now+0.006)` and then `scheduleTrack(t, t2b(now+0.006), R.schedBeat, true)`, so the edit is heard at once. Audition = `auditionStart(t, n, v)` released after 180 ms (key tap, note creation, note move to a new row).

**Integration** (model adapter for `PianoRoll.create(root, model, {color, follow:true})`): `getClip`, `begin()` (snapshot `cleanClip`), `end(changed, label)` (pushUndo + afterClipEdit), `revert()` (assign the snapshot back into the **same** clip object), `audition(n, v)`, `undo/redo/canUndo/canRedo`. Reference code: Anhang D.4.

**Tests**
- [ ] P1–P28 Port `recresearch/test-pianoroll.mjs` to the app (iPhone 390×844, CDP touch): tap empty creates a note; drag creates longer; tap a note **selects it (note count unchanged; adapt the research test)**; drag moves with snap; right end sets length; marquee; erase swipe; pinch zooms without editing; keys drag scrolls; ruler drag scrolls; ┃ sets the length; velocity lane; no text selection or scroll on a 1.2 s press; pointercancel reverts; one undo per gesture.
- [ ] P29 Editing a playing clip: a note added 1 beat ahead of the playhead is heard in the same pass (`noteLog` shows it within 1 bar).
- [ ] P30 Step input: with Schritt on and grid 1/8, playing C, then E+G within 40 ms, then [Pause], then D gives notes at t = 0 (C), t = .5 (E, G), t = 1.5 (D). No `rec` state change.
- [ ] P31 L: the editor covers the keyboard row; [⌨] brings the keyboard back without closing the editor.
- [ ] P32 Loop range: a 4-bar clip with notes in every bar; select bars 2–3, [Loop = Auswahl] → `len === 2`, the former bar-2 notes start at t 0–4; `undo()` restores the 4-bar clip deep-equal.
- [ ] P33 50 random taps (CDP touch) on existing notes in Zeichnen → note count unchanged, at most one note selected at a time.

### 3.4 Drum step grid (STEPS tab)

**UI P** (drum editor tab STEPS)
```
┌──────────────────────────────────────────────┐
│[KICK][SNARE][RIM][CLAP][HH ZU][HH OF]        │ instrument chips 2×6 (8 in WP2)
│[TOM T][TOM M][TOM H][BECK.][PERC][SHAK.]     │
│[VEL][AKZENT][CHANCE][WIRBEL][TIMING][TUNE][DECAY] │ lane tabs (TUNE/DECAY from WP6)
│ ■ □ ■ □ ■ □ ■ □                              │ steps 8×2 (42×44)
│ ■ □ □ ■ ■ □ ■ □                              │
│ ▁▃▅▇▅▃▁▃ …  (lane strip 72 px)               │
│ overview 12×16 dots · [Takt 1|2] [Euklid][Muster]│
└──────────────────────────────────────────────┘
```
**UI L.** Steps 16×1 (36×40). Lane strip 48 px. The overview is a 12×16 grid of 10 px cells to the right of the chips.

**Bedienung.** As in `drumresearch/step-editor.js`, with no long-press and no hidden mode:
- Tap = on/off, with an audition on.
- Horizontal swipe = paint (on if you started on an empty step, off if you started on a set step). Skipped cells are filled in.
- Vertical drag on a step = its value in the current lane (relative, 120 px = full range). Dragging an empty step turns it on.
- On the lane strip, touching or dragging draws absolute values across the set steps.
- One undo per gesture. A second finger is ignored. `pointercancel` reverts.
- The AKZENT lane toggles accent on tap.
- The old tap cycle aus → an → Akzent is **removed**.
- Bar page selector for clips longer than one bar. The step under the playhead is outlined.
- An empty selected slot gets a clip on the first tap (`§old-4.8` rule, in phase).

Visual encoding: fill height = velocity, white pip = accent, hatching = chance < 100 %, dots = ratchet, shifted fill = timing, outline = playhead.

**Daten.** Drum notes `{t, d, n, v, a?, p?, r?, m?, lk?}`:
- `a:1` accent
- `p` chance 0.05–1 (absent = 1)
- `r` ratchet 2–4
- `m` timing shift ±0.45 step
- `lk` = `{tune: semitones, dec: factor}` parameter locks (WP6)

Old clips play unchanged. Each drum clip gets `seed` (random int, created with the clip, persisted).

**Audio (scheduler).** In the drum branch of `scheduleTrack`, expand each note with `DrumSeq.expandStep(nt, loopIdx, clip.seed)`, where `loopIdx = round((B − cs − nt.t)/L)`:
- Probability is decided by a hash, so rescheduling never flips a hit.
- Ratchet repeats run at 80 % velocity.
- Clamp a negative timing shift to ≥ the loop start and ≥ `ctx.currentTime`.
- Accent: WP2 (old 8-voice engine) uses `vel × 1.4` (cap 1.2); from WP6 on, the accent goes to `DrumSynth.hit(..., {accent})` (§7).

**Tests**
- [ ] T1–T15 Port `drumresearch/test-step-editor.mjs` (tap, paint, value drag, lane draw, undo per gesture, cancel, no selection or menu on a long press, 8×2 layout at 390 px).
- [ ] T16 `p = .3` on one step over 2000 loops → 30 ± 2 % hits, identical on a second run (same seed).
- [ ] T17 `r = 3` on a 1/16 step → 3 hits 1/12 beat apart (step length .25 / 3); the 2nd and 3rd at 80 % velocity.
- [ ] T18 Accent: an accented hit has ≥ 3 dB more peak than an unaccented one of the same velocity (analyser on an isolated pad).

### 3.5 Quantize (raw onsets, auto grid, sheet)

**Daten.**
- Every note recorded live (keys, pads, FANG) stores its unquantized onset `o` (beats, 4 decimals) next to `t`. **(Entscheidung)** The research used `r` for this; `r` is the drum ratchet. Rename it in `pianoroll.js` (two places: `quantizeNotes` reads `nt.o`, the move gesture deletes `nt.o`).
- `clip.q = {grid, swing, strength}` = the last applied quantize (shown on the clip chip).
- `settings.inQuant` gains `'auto' | '1/4' | '1/8T' | '1/16T' | '1/32'`. The new default is **'auto'**; migrated projects keep their value.

**UI.** The quantize sheet is a bottom sheet. P: 374×300 over the lower half of the sheet area, with the grid chips in 2 rows of 4, then Stärke, Swing and Humanize as horizontal sliders (44 px) and [Anwenden] [Abbrechen]. L: a 360 px wide panel on the right side of the editor, with the chips in one row.

**Bedienung.**
- **On record close** with `inQuant:'auto'`: `KeyDetect.detectGrid(raw onsets, {bpm})` → `{grid, swing}`, then `KeyDetect.quantize` with strength 1, and store `clip.q`. With a fixed grid: quantize with that grid. With 'off': keep `o`.
- **Quantize sheet** (from the clip sheet [Quantisieren…] or the editor's [Quant.]):
  - Grid chips [Auto | 1/4 | 1/8 | 1/8T | 1/16 | 1/16T | 1/32 | Aus].
  - **Stärke** slider 0–100 %, **Swing** 50–75 %, *(P1)* **Humanize** 0–20 ms.
  - [Anwenden] [Abbrechen].
  - While the clip plays, changes are previewed live through the model's begin/revert. Anwenden = one undo step; Abbrechen = revert.
- „Aus“ restores `t = o` (notes without `o` keep `t`).
- Swing at 66 % on 1/8 counts as a shuffle. Triplets win only if the middle third of a beat is used (KeyDetect rules).

**Tests**
- [ ] Q1 Record 8 notes with ±30 ms jitter on 1/8 → `clip.q.grid === '1/8'`, all `t` multiples of 0.5, `o` preserved.
- [ ] Q2 Re-quantize to 1/16 at 50 % → each `t = o + (round(o/.25)·.25 − o)·.5`.
- [ ] Q3 „Aus“ → `t === o` for every recorded note; undo returns to Q2's state.
- [ ] Q4 A shuffled 1/8 recording (66 %) is detected as `{grid:'1/8', swing≈.66}`, not as triplets.

### 3.6 FANG (capture what you just played)

**UI.**
- A chip **„FANG ⤓“** (64×40, amber outline) lights up for 8 s after the last live note, but only while the transport runs, REC is off and the selected track has a free slot. It sits in a **fixed 64 px slot at the right end of the mode bar** (P: the segment shrinks to fit; L: the permanent top-bar [FANG] lights up instead). The slot is empty otherwise, so nothing appears over the keys and nothing shifts while you play. In P the mode segment is then ≈ 210 px wide (≈ 195 px at 375 px); below 390 px it reads „♪ SPIELEN | ⇅ TRANSP.“. **(Entscheidung)** The keyboard area never shows overlays.
- L also has a permanent **[FANG]** button in the top bar.
- The REC options popover has [FANG – Gespieltes einfangen].

**Bedienung.** Tap → the last phrase of the selected track becomes a clip (`RecHelpers.capturePhrase`): everything back to a gap of ≥ 1 bar, length 1/2/4/8/16 bars, a note up to ¼ beat before the bar line counts as on it.
- The clip goes into the selected empty slot, or the first free slot of the track; it never overwrites.
- It keeps playing **in phase** from the next bar line: `R.pend[i] = {slot, beat: nextBar, cs: phraseStart}`, and `tick()` uses `p.cs ?? p.beat` for `R.cstart`.
- Toast „Eingefangen: 2 Takte · a-Moll“ with [Bearbeiten]. Reference code: Anhang D.5.
- Nothing to capture → „Nichts zum Einfangen – erst spielen, dann FANG“.

**Daten.** `CAP = {buf: [], open: Map}`. In `inputDown('play')` with the transport running and REC off: `CAP.open.set(id, {track, n, v, b: audBeat()})`. In `inputUp`: push with `d`. Pads push `d: .1`. The buffer keeps ≤ 4096 entries and is cleared on stop. Clip key: Träger active → `keyForRecording` with `src:'carrier'`; otherwise auto. Notes are stored via `clipNoteFor` (heard = stored) and carry `o`.

**Tests**
- [ ] FG1 Play notes live between beat 8 and beat 16 (transport running, no REC), then FANG at beat ≈ 18 → a new clip with `len 2`; after its launch at beat 20, `R.cstart[t] === 8`; the phrase's first note sounds again at beat 24 (= 8 + 2·8), i.e. the clip runs in phase with what was played.
- [ ] FG2 FANG with no played notes → toast, no clip, no undo entry.

### 3.7 Clip sheet v3 (long-press a clip)

**UI P** (bottom sheet, 2 columns of buttons ≥ 44 px):
- Title „Synth 1 · Szene 2 — 2 Takte · 14 Noten“.
- Key chip „Auto: a-Moll“ (or „Fest: a-Moll“ / „Aufnahme: a-Moll“) with [Fest…]. That button opens the old 12 root chips and the scale segment; choosing sets `src:'user'`. [Auto] returns to detection. When the clip's key differs from its scene key, [= Szenen-Tonart] appears (§4.1.6).
- Buttons: [✎ Bearbeiten] (large, first), [Quantisieren…], [Kopieren], [Einfügen], [Duplizieren → freier Platz], [■ Stopp] (only if playing), Länge [½] [−1] [+1] [×2], [Löschen] (two-step, as before), [Rückgängig], [✕].

**UI L.** The same sheet as a 420 px wide panel over the grid area, with 3 button columns.

**Bedienung.** Every action is one undo step.
- Clipboard = `cleanClip` + track kind. Paste between drum and synth is refused with the toast „Drum- und Synth-Clips sind nicht austauschbar“.
- Duplicate goes to the next free slot of the same track; none free → toast.
- Length −1/+1 keep notes (−1 removes notes ≥ the new end); ×2 duplicates the content; ½ halves (`§old-4.5`).

**Tests**
- [ ] CL1 Copy from (0,0), paste into (1,2) → deep-equal notes; `undo()` empties (1,2).
- [ ] CL2 Paste a drum clip into a synth slot → refused, slot unchanged.
- [ ] CL3 Duplicate fills the first free slot; Länge ×2 doubles the notes with an offset of `len·4`.

### 3.8 Undo and redo for clips

Every clip mutation pushes `{kind:'clip', track, scene, before, label}`. This covers recording, overdub, editor gestures, quantize, paste, duplicate, length, key (Fest/Auto), clear, steps and song cells (`kind:'song'`, §3.9).

**Redo:** `undo()` pushes the current state onto `REDO`; any new push clears `REDO`. The toast after an undo shows **[↷ Wiederholen]**. The editors show ↶ ↷ buttons. The stack holds 60 entries (was 30). The full rules are in §10.4.

- [ ] U1 Record, undo (slot empty), redo (clip back, deep-equal), a new edit clears redo (`D.redo()` returns false).

### 3.9 Song recording, song view and melody lane (WP6)

**UI P** (grid area, after tapping **SONG ⇄** in the grid corner cell; tap again = CLIPS)
```
┌──────────────────────────────────────────────┐
│CLIPS⇄│[● SONG][▶ SONG][● MEL.][Mel: S4▾][↩][⟲]│ 40 song transport (⟲ = Schleife)
│      │ 1  │ 2  │ 3  │ 4  │ 5  │ 6  │ 7  │ 8 │ 20 bar ruler (tap = play from here, P1)
│SYN 1 │ 1  │ 1  │ 2  │ 2  │ 2  │ –  │    │   │ rows ≥ 30; cells 36 px; pan-x scroll
│SYN 2 │ 1  │ 1  │ 1  │ 1  │ –  │ –  │    │   │ number = scene slot, track colour
│SYN 3 │ 1  │ 1  │ 2  │ 2  │ 2  │ 2  │    │   │ – = stopped
│SYN 4 │ –  │ –  │ –  │ 1  │ 1  │ 1  │    │   │
│DRUMS │ 1  │ 1  │ 1  │ 1  │ 2  │ 2  │    │   │
│TRÄGER│Am  │    │F G7│    │ C  │    │    │   │ chord chips at their beats
│MELOD.│▁▃▅ │▂▆  │    │▃▅  │    │    │    │   │ mini notes (tap = editor)
└──────────────────────────────────────────────┘
```
**UI L.** Same, in the grid area (≈ 450 px wide → about 11 bars visible). The playhead is a green 2 px line and the current bar column is tinted. The view auto-scrolls while recording or playing unless the user scrolled within the last 3 s.

**Gestures in the song grid (no accidental edits).** The cells have `touch-action:none` (§1.7.2), so the grid scrolls by its own code: a one-finger drag of more than 8 px on any cell scrolls horizontally (with momentum, like the browser list) and never edits. A cell changes only on a clean tap (≤ 8 px movement, ≤ 350 ms). The ruler and the lane labels scroll the same way.

**Bedienung**
- **[● SONG]**
  - Stopped: start the transport at 1.1 (no count-in) and record from beat 0.
  - Playing: recording starts at the next bar line, which becomes song bar 1 (`R.songRec = {startBeat}`). The current slot of every track is logged at song beat 0.
  - While recording, every launch or stop is logged at its bar (all of them pass through `switchTrackAt`): scene launches, single clips and stops, including §3.2. Every Träger commit is logged with its exact beat.
  - **The whole session is kept:** live SPIELEN notes played during song recording go into `song.melody` (as heard, absolute song beats), together with `song.melodyTrack` = the synth track selected when [● SONG] was pressed (if the melody is still empty). Notes played on other tracks are not recorded (one melody lane; a toast „Melodie wird nur auf Synth n mitgeschnitten“ appears once if you switch tracks and play).
  - Press again, or stop the transport → `song.bars = ceil(lastBeat/4)`. One undo step (`kind:'song'`).
- **[▶ SONG]** plays from song bar 1 (the transport restarts) with `R.songPlay = true`. It shows ■ while playing. At the end: loop (⟲ on) or stop.
- **Take-over:** while the song plays, any manual launch or stop of a track sets `R.songOverride[i]`, and live TRANSPONIEREN keys set `R.carrierLive`. An orange **[↩ SONG]** appears; tapping it hands the tracks back to the song from the next bar line.
- **[● MEL.]** (only while the song plays) records live SPIELEN notes into `song.melody` at absolute song beats. The notes are stored **as heard** and are never mapped. Each pass until it is pressed again (or the song ends) is one undo step. Notes already in the lane under the new ones stay (overdub); [Mel. leeren] in the lane's ⋯ removes them (undo).
- **[Mel: S4 ▾]** chip (tap, not long-press — §10.3) opens a list of the 4 synth tracks. Tracks that have clips anywhere in the song are marked „spielt Clips“; the others are marked „frei“ and listed first. Reason: the melody voices share the track's sound and polyphony, so a MONO lead that also plays clips would cut its own notes. Choosing a track sets `song.melodyTrack` (one undo).
- **Edit cells:** a tap cycles – → 1 → 2 → 3 → 4 → – for that track and bar, offering only slots that hold a clip. The following bars are not changed (`RecHelpers.cycleCell`). Consecutive taps on the same cell within 2 s merge into one undo step.
- Tapping the MELODIE lane opens the piano roll on `song.melody`. A long-press on a Träger chip deletes it (with undo).
- *(P1)* **Melodie → Clip** („patternmäßig festhalten“): in the melody lane, tap a bar number to select a 1/2/4-bar range, then [Als Clip]. The notes go into the first free slot of the melody track as a clip (`len` = range, notes relative to the range start, raw `o` kept). Its key is computed like FANG: the Träger in effect at the range start → `keyForRecording(…)`, `src:'carrier'`, so the clip sounds as played at that place **and** follows the Träger from then on; with no Träger, `src:'auto'`. The lane keeps its notes. One undo step.
- *(P1)* "Kette": converting a scene chain (1×4, 2×4, 3×8) with `RecHelpers.fromChain`. *(P1)* MIDI export mode „Song“ (as heard).
- *(P1)* **Song als Audio** (Menü → Projekt): plays the song once in real time and records the master through `ctx.createMediaStreamDestination()` + `MediaRecorder` (`audio/mp4` on iOS ≥ 14.3, else `audio/webm`), then delivers `synquenzer-song-<name>.m4a` through `deliverFile` (§12.2; if the downloads capability refuses the type, use the share sheet). The screen stays awake (§1.7.6). Feature-detect `MediaRecorder` and hide the button if it is missing.

**Daten**
```js
S.song = { bars: 8, loop: false, melodyTrack: 3 /* = the synth track selected at the first [● SONG]; 3 if the drum track was selected */,
  lanes: [[{bar:0, slot:0}, {bar:2, slot:1}], …5 tracks],   // slot -1 = stopped from that bar
  carrier: [{beat: 0, target: <detectChord result>|null}, …],
  melody: {len: 8 /* bars */, key: {root, scale, src:'user'}, notes: [{t /* absolute song beat */, d, n, v}]} }
```
Song beats are relative to the song start (beat 0 = song bar 1). `S.song` is `null` until the first song recording.

**Audio / scheduler.** In `tick()`, **before** the per-track loop, when `R.songPlay`:
1. `RecHelpers.eventsIn(S.song, b0−off, b1−off, R.songOverride)` → `R.pend[track] = {slot, beat: e.beat+off}`. The existing pend code applies them exactly at the beat.
2. Unless `R.carrierLive`: for each carrier entry in the window, call `T.recall(target, b2t(beat+off), grid())`.
3. Schedule melody notes in the window with `spawnVoice(melodyTrack, n, v, t, {src:'melody'})` and release at `t + d·spb`. They are not mapped and are logged with `src:'melody'`.
4. Song end: `loop` → re-anchor `off += song.bars·4` and continue; otherwise `stop()` at that beat.

Reference code: Anhang D.7.

**Tests** (rec-helpers unit tests stay in place: `node recresearch/test-rec-helpers.js` = 14 ok)
- [ ] SG1 Song record: scene 1 at bar 0, `launchScene(1)` during bar 3 (lands at bar 4), `stopTrack(0)` during bar 5 (lands at bar 6), then stop at bar 8 → `song.lanes` equal the expected lists from `test-rec-helpers.js`; `song.bars === 8`.
- [ ] SG2 SONG ▶ → `noteLog` launch beats equal the recorded ones (±0.002 beat); Träger entries recalled at their beats.
- [ ] SG3 Take-over: during song playback `launchClip(2,3)` → `songOverride[2] === true`, other tracks still follow the song; [↩ SONG] → track 2 follows again from the next bar.
- [ ] SG4 Melody overdub: 4 notes played → `song.melody.notes.length === 4` with absolute beats; playback logs them with `src:'melody'` at the same pitches regardless of the Träger.
- [ ] SG5 Cell cycle on a bar → one undo entry; `undo()` restores the lanes deep-equal.
- [ ] SG6 Song record with Synth 4 selected; play 6 notes live during recording → after stopping, `song.melody.notes.length === 6`, `song.melodyTrack === 3`; ▶ SONG plays them at the same beats (± 0.01 beat).
- [ ] SG7 A 40 px horizontal drag across 3 cells (CDP touch) scrolls the song grid and changes no lane (`song.lanes` deep-equal before/after; no undo entry). A clean tap changes exactly one cell.
- [ ] SG8 The melody track chip opens on tap; a long-press on it does nothing different from a tap.

### 3.10 LAUF — step view for bass lines and sequences (WP5)

The user wants to enter a bass line or a sequence "flexibly, knowing at once what you do". The piano roll is precise but small on a phone. LAUF is the classic SH-101 / TB-303 / Moog-sequencer way: a row of steps, each step one note, pitch chosen **inside the key**, so a wrong note is impossible.

**UI P** (inside the clip editor; the toolbar button [LAUF] switches the body between piano roll and LAUF; the header, toolbar and action bar stay)
```
┌──────────────────────────────────────────────┐
│ SYNTH 1 · SZENE 2   a-Moll · 1 Takt     [✕]  │ 44 header
│[ROLLE|LAUF] [1/16▾] [Takt 1|2] │[↶][↷]        │ 44 toolbar
│ A2  C3  –   E3   A2  ⌒  G2  A2   …           │ 22 note names (– = pause, ⌒ = tied)
│ ■   ■   □   ■    ■   ■  ■   ■                │ 8×2 steps 42×44 (L 16×1), height = pitch
│ ■   □   ■   ■    ■   □  ■   ■                │
│[TON][OKT][VEL][AKZENT][BINDUNG]               │ 32 lane tabs
│ ▁▃▅▇▅▃▁▃ …  lane strip 72 px                  │
│ [Skala ▾: a-Moll]  [Zufall in Tonart]  [Leeren]│ 44
└──────────────────────────────────────────────┘
```
**Bedienung** (reuses `StepEditor` from WP2; same gesture rules as §3.4: no long-press, one undo per gesture, a second finger is ignored):
- Tap a step = on/off. A new step gets the pitch of the nearest set step to its left (else the clip key's root in the track's `kbOct`) and plays it.
- **Vertical drag on a step = pitch in scale steps** of the clip key (14 px per step, with a `haptic('tick')` and an audition on every step change). The note name follows the finger. Lane **TON** draws absolute pitches across steps (a melodic contour by one swipe). Chromatic notes are only possible in the piano roll.
- Lanes: **OKT** (−1/0/+1 octave per step), **VEL**, **AKZENT** (velocity 1.0 and filter accent via the existing velocity routes), **BINDUNG** (tap = the step is tied/slid from the previous one: the previous note is lengthened to overlap this one by 1/64 beat, so LEGATO sounds glide like a 303 slide; with POLY sounds it is a plain tie).
- **Step length** 1/8, 1/16 (default), 1/16T, 1/32. Up to 16 bars, paged by [Takt n].
- **[Zufall in Tonart]** fills the empty steps of the current bar with in-key notes near the existing contour (one undo). **[Leeren]** = in-place two-step.
- Playing keys in SPIELEN while LAUF is open writes the pitch into the **selected** step and advances (the same step input as §3.3, mono).
- The clip keeps playing and every gesture is heard on the next pass (`afterClipEdit`).

**Daten.** No new fields: steps are ordinary notes `{t, d, n, v}` at the grid. Ties extend `d`. A step's on/off and pitch map 1:1 to notes; the view is offered when every grid position has at most one note start. Otherwise [LAUF] is disabled with the hint „Clip ist mehrstimmig – bitte die Rolle benutzen“. Notes off the grid are shown on their nearest step and are snapped only when that step is edited.

**Tests**
- [ ] LF1 Empty 1-bar clip in A minor (scene key), LAUF 1/16: tap steps 1, 5, 9, 13, drag step 5 up 28 px → notes at t 0, 1, 2, 3; pitches A, C, A, A (C = 2 scale steps up); 4 undo entries for 4 taps + 1 for the drag.
- [ ] LF2 BINDUNG on step 5 → the note at t 0 has `d ≥ 1 + 1/64`; with the Moog-Bass (LEGATO), the log shows a glide (no retrigger) into the step-5 note.
- [ ] LF3 A clip with a 3-note chord → [LAUF] disabled with the hint; the clip is unchanged.
- [ ] LF4 OKT +1 on a step raises exactly that note by 12; Zufall in Tonart writes only notes of the clip key.

---

## 4. Transposition without thinking (topic 2)

### 4.1 Behaviour (Entscheidung)

1. **Every synth clip knows its key automatically.** `clip.key = {root, scale, src}` with `src` = `'auto'` (detected, recomputed), `'carrier'` (recorded under an active Träger: `keyForRecording`, exact, never recomputed) or `'user'` (set in the clip sheet, never touched).
2. **One key per scene** (OP-Z master track). `KeyDetect.sceneKey(parts, projectKey)` runs over all **following** synth clips of a scene that have notes. The bass (the track with the lowest median pitch) is weighted ×2, and each part counts equally. Each `'auto'` clip then gets `KeyDetect.resolveClipKey(notes, sceneKey, projectKey)`: the scene key if ≥ 90 % of its note weight fits that scale (chromatic passing notes allowed), otherwise its own detected key. Clips with too few notes fall back to the scene key, then to the project key.
3. **When it runs:** debounced 400 ms after recording close, FANG, an editor gesture, paste, duplicate, clip delete (scene re-run) and project load/migration. **Never while a Träger is active.** Then set `R.keyPending = true` and run after the next ORIGINAL, so nothing re-harmonizes audibly mid-performance. Under ORIGINAL a key change is inaudible (identity), so no remap is needed.
4. **Default one-finger behaviour = OP-Z:** `settings.harmony.single = 'key'` for new projects. A key inside the clip's (= scene's) key → modal/scale-step move; a key outside → parallel key change. Chords are unchanged (Improvisor). TONART/PARALLEL are unchanged. Migrated projects are switched to `'key'` once, with the toast „Transponieren: Ein Ton bleibt jetzt in der Tonart (wie OP-Z). Umstellen: Menü → Harmonie“. „Einzelton: Parallel (CV)“ stays in the menu.
5. The harmony core (`§old-6`) and the Transposer (`§old-7`) stay **byte-for-byte unchanged**. Only defaults and inputs change.
6. **Known limit and its guard.** The core decides "in key or not" per clip, from that clip's own key. Inside one scene all `'auto'` clips normally share the scene key, so a single key moves them all the same way. A clip that kept its **own** key (< 90 % fit, e.g. a lead with harmonic-minor notes) can react differently to the same key (e.g. D dorian for the scene, D locrian for that clip). Guard: such a clip shows its key badge (§4.2) and its clip sheet offers **[= Szenen-Tonart]** (sets the scene key with `src:'user'`, one undo). The TRANSPONIEREN readout adds „· 1 Clip eigene Tonart“ while such a clip is audible, so the user can see why it sounds different.

### 4.2 UI

- **Scene key under each scene launcher** (P and L): 9 px text under „▶ 1“: `C`, `Am`, `D dor`, `G mix`, `F lyd`, `E phr`, `B lok`. It appears when the scene has following clips with notes.
- **Clip cell key badge** (top-right) only when the clip key **differs from its scene key** (was: from the project key).
- **Lit keys in TRANSPONIEREN.** The reference is the key of the playing scene: the key of the first following track's audible clip, else the selected scene's scene key, else the project key. In-key keys get class `inkey` (warm highlight, `--key-w-tr`); out-of-key white keys are dimmed (`#bfae8c`); in-key black keys get an amber inner bottom bar; the tonic gets a 6 px amber dot (`tonic`). This replaces the C-dot of `§old-5.3` in octave mode „nächste“; „absolut“ keeps the refNote dot. Reference code: Anhang D.8.
- **Readout for single keys:** in-key → „D · Stufe II · Dorisch“, out-of-key → „E♭ · Tonart +3“. Chords as before („Am7 −3“).
- **Mode popover** (AKKORD ▾) texts:
  - AKKORD: „Folgt Akkorden (wie Improvisor). Ein Ton = Stufe in der Tonart (wie OP-Z).“
  - TONART: „Bleibt immer in der Tonart (wie OP-XY Brain).“
  - PARALLEL: „Verschiebt exakt in Halbtönen (CV, wie MPS/KeyStep).“
  - Plus a link [? So funktioniert's] that opens the coach card.
- **Coach card** (first time TRANSPONIEREN is entered; remembered in `settings.coach.trans`), four lines with [Verstanden]:
  - „Jeder Clip kennt seine Tonart – automatisch erkannt (z. B. a-Moll).“
  - „Taste leuchtet = Stufe in der Tonart: alles bleibt in der Tonart (wie OP-Z).“
  - „Dunkle Taste = neue Tonart: alles wird verschoben.“
  - „Akkord = alle Spuren folgen dem Akkord (wie Improvisor).“
- **Clip sheet key chip** „Auto: a-Moll“ (§3.7). The editor header shows „a-Moll“.
- **Keyboard in SPIELEN** (Menü → Harmonie → „Tastatur beim Spielen“, `settings.kbScale`):
  - **Tonart zeigen** (default): the same lit keys and tonic dot as in TRANSPONIEREN, but quieter (in-key white keys normal, out-of-key white keys slightly darker `#d9d2c3`), so the user sees which notes fit while playing. Out-of-key keys still play normally.
  - **Tonart sperren:** out-of-key keys are dimmed (`#bfae8c`) and play the nearest in-key note **below** (the pressed key flashes the substituted key). Recording, FANG, step input and LAUF store the substituted note (heard = stored).
  - **Aus:** the plain v2 keyboard.
  - The reference is the same as for the lit keys (`sceneRefKey`, Anhang D.8). Drum pads are never affected. Under an active Träger the reference is the Träger's scale (`keyForRecording` of the current target), so the lit keys always match what you hear.
  - A small text under the mode segment shows the reference: „a-Moll“ (9 px). Changing the setting does not touch any clip.

### 4.3 Data and algorithms

- `KeyDetect` API (embedded as is): `detectKey(notes|parts, {fallback})`, `sceneKey(parts, projectKey)`, `resolveClipKey(notes, sceneKey, projectKey)`, `detectGrid(notes, {bpm})`, `quantize(notes, opts)`, `NAMES_DE`, `MODE_DE`.
- `applySceneKeys(s)`: collect parts `[{i, notes, isBass}]` from tracks 0–3 with `follow` and notes in scene `s`; compute the scene key; write keys only into `'auto'` clips; set `UI.dirty.grid`; `markDirty()`. Reference code: Anhang D.5.
- Clip info text = `NAMES_DE[root] + ('-Dur' | '-Moll' | ' ' + MODE_DE[scale]) + (q ? ' · ' + q.grid : '')`. It is computed, never stored.
- Migration: format-2 clips get `src:'user'` if their key differs from the project key, else `'auto'`. All scenes are then analysed once.

### 4.4 Tests

- [ ] K1 No Träger: record C4 E4 G4 E4 (1 bar) on an empty slot → `key = {root:0, scale:'ionian', src:'auto'}`; the toast contains „C-Dur“.
- [ ] K2 Scene 0: Synth 1 = A-minor bass (A2 E2 C3 A2), Synth 2 = C4-E4-G4 pad → both clips `{root:9, scale:'aeolian'}`; the launcher shows „Am“.
- [ ] K3 (replaces old E14) Latch Am (AKKORD), record C4 E4 G4 → key `{9, aeolian, src:'carrier'}`; playback under Am = 60, 64, 67; under ORIGINAL = 60, 64, 67; under the single key C = **64, 67, 71**.
- [ ] K4 CEGE (C major), single key D → 62, 65, 69, 65. Single key E♭ → 63, 67, 70, 67. Chord A3-C4-E4 → 57, 60, 64, 60 (old E2 unchanged). Single key F → 65, 69, 72, 69 (old E1 unchanged).
- [ ] K5 A `'user'` key is never changed by detection (edit the notes → key unchanged).
- [ ] K6 With a Träger latched, editing a clip does not change any key; after ORIGINAL the key is updated within 500 ms.
- [ ] K7 TRANSPONIEREN with a C-major scene playing: the white keys have `inkey`, the black keys do not, and C has `tonic`. Readout for D: „D · Stufe II · Dorisch“.
- [ ] K8 `D.harmony.mapNote` still reproduces every row of old tables B and C (`§old-6.4`), and `detectChord` every row of table A.
- [ ] K9 SPIELEN, C-major scene, `kbScale 'show'`: white keys have `inkey`, C has `tonic`, F♯ plays 66. With `'lock'`: F♯ plays 65 (F), and a clip recorded with F♯ pressed stores 65. With `'off'`: no `inkey` class in SPIELEN.
- [ ] K10 Latch Am (AKKORD) on a C-major scene, `kbScale 'lock'`: the reference is A aeolian, G♯ plays G (67).

---

## 5. Analog engine (topic 3)

WP3 builds the data model, the editor pages and the **native** rendering. WP4 adds the **worklet** rendering, which is the quality path. The UI is identical on both paths.

### 5.1 Parameters (flat patch, schema `ev:2`)

The flat patch is the `defaults()` object of `presetlib/analog-core-sync.js` plus the keys marked *new*. Every synth sound (`analog`, `fm6`, `wt`, `fm2`) stores the **full** flat object in `sound.p`. Engine-specific blocks are `p.fm6` (§6), `p.wt` (`{table, pos, scan, scanTime}`, ranges as in `§old-8.5`) and `p.fm2` (`{ratio, index, modDecay, modSus}`, legacy, WP3–WP6). The table below is binding for UI labels, ranges and defaults.

| key | UI label | page | range (stored) | knob law / steps | default | shown as | mod dst |
|---|---|---|---|---|---|---|---|
| `o1w o2w o3w` | Welle | OSZ n | 0 Säge, 1 Puls, 2 Dreieck, 3 Sinus | segment ⟋ ⊓ ∧ ∿ | 0, 0, 1 | – | – |
| `o1oct o2oct o3oct` | Fußlage | OSZ n | −2…2 | segment 32' 16' **8'** 4' 2' | 0, 0, −1 | `8'` | – |
| `o1semi o3semi` / `o2semi` | HT | OSZ n | −12…12 / −12…24 | integer; sticky detents (12 px) at 0, ±5, ±7, ±12 | 0 | `+7 HT` | osc 2: `o2pitch` |
| `o1fine o2fine o3fine` | Fein | OSZ n | −50…50 ct | linear, centre detent | 0, 7, 0 | `+5 ct` | – |
| `o1lvl o2lvl o3lvl` | Pegel | OSZ n and MIX | 0…1 | linear | 1, 0, 0 | `%` | `o1lvl o2lvl o3lvl` |
| `o1pw o2pw o3pw` | PW | OSZ n (active only for Puls) | .05….95 | linear | .5 | `%` | `pw` (all osc) |
| `o1uni o2uni o3uni` | Unison | OSZ n | 1, 3, 5, 7 | stepped | 1 | `3×` | – |
| `o2sync` | SYNC 2→1 | OSZ 2 | 0/1 | toggle | 0 | – | – |
| `subLvl` | Sub | MIX | 0…1 | linear | 0 | `%` | – |
| `subOct` | Sub-Lage | MIX | 1 or 2 | segment −1 Okt / −2 Okt | 1 | – | – |
| `subW` | Sub-Form | MIX | 0 ⊓, 1 ∿ | segment | 0 | – | – |
| `noise` | Rauschen | MIX | 0…1 | linear | 0 | `%` | `noise` |
| `level` | Ausgang | MIX | 0…4 (linear gain) | knob over −40…+12 dB, norm 0 = 0 (−∞) | .3 | `−10,5 dB` | – (use the matrix-only `amp`) |
| `analog` | Analog | MIX | 0…1 | linear | .15 | `%` | – |
| `mode` | Modus | STIMME | 0 POLY, 1 MONO, 2 LEGATO | segment | 0 | – | – |
| `poly` | Stimmen | STIMME | 1…8 | integer | 8 | `6` | – |
| `glide` | Glide | STIMME | 0…2 s | pow k=2 | 0 | `70 ms` | – |
| `uniDet` | Uni-Verstimm. | STIMME | 0…1 | linear | .25 | `%` | `unidet` |
| `uniMix` | Uni-Mix | STIMME | 0…1 | linear | .6 | `%` | – |
| `uniWidth` | Breite | STIMME | 0…1 | linear | .8 | `%` | – |
| `spread` | Streuung | STIMME | 0…1 | linear | .2 | `%` | – |
| `ampVel` | Anschlag | STIMME | 0…1 | linear | .6 | `%` | – |
| `reset` | Phasen-Reset | STIMME | 0/1 | toggle | 0 | – | – |
| `mw` | Mod-Rad | LFO | 0…1 | linear | 0 | `%` | – |
| `ftype` | Typ | FILTER | 0 LP24, 1 LP12, 2 BP24, 3 BP12, 4 HP24, 5 HP12 | segment (6) | 0 | – | – |
| `cutoff` | Cutoff | FILTER | 20…20000 Hz | exp | 1200 | `1,2 kHz` | `cutoff` |
| `res` | Resonanz | FILTER | 0…1.15 | linear; LED „EIGENSCHW.“ lights at ≥ 1.0 | .2 | `20 %` | `res` |
| `drive` | Drive | FILTER | 0…1 | linear | .2 | `%` | `drive` |
| `fenv` | Hüllk.-Menge | FILTER | −1…1 (±6 octaves) | bipolar, centre detent | .35 | `+35 %` | `fenv` |
| `kt` | Keytrack | FILTER | 0…1 | linear | .5 | `%` | – |
| `fvel` | Anschlag | FILTER | 0…1 | linear | .2 | `%` | – |
| `bass` | Bass | FILTER | 0…1 | linear | .5 | `%` | – |
| `lq` | Qualität | FILTER | 0 ECO, 1 ANALOG | segment | 1 | – | – |
| `aA aD aS aR aCurve` | A D S R Kurve | HÜLLK. · LAUTST. | A .001–10 s, D .005–10 s, S 0–1, R .005–15 s, Kurve 0–1 | exp, exp, lin, exp, lin | .005 .3 .8 .25 .5 | – | – |
| `fA fD fS fR fCurve` | A D S R Kurve | HÜLLK. · FILTER | same | same | .005 .3 .3 .3 .5 | – | – |
| `mA mD mS mR mCurve` | A D S R Kurve | HÜLLK. · MOD | same | same | .001 .5 0 .5 .5 | – | – |
| `l1shape l2shape` | Form | LFO n | 0 ∿, 1 ∧, 2 ⟋, 3 ⊓, 4 S&H | segment | 0, 1 | – | – |
| `l1rate l2rate` | Rate | LFO n (FREI) | .01…40 Hz | exp | 4, .3 | `Hz` | – |
| `l1sync l2sync` | Takt | LFO n (TAKT) | beats per cycle; 0 = FREI | stepped list below | 0 | `1/8.` | – |
| `l1retrig l2retrig` | Start | LFO n | 0 FREI (song-locked), 1 NOTE | segment | 0 | – | – |
| `l1fade l2fade` | Einblenden | LFO n | 0…10 s | pow k=2 | 0 | `s` | – |
| `fmAmp` *new* | Lautstärke-Form | FM MAKRO | 0 DX-Hüllkurven, 1 ADSR | segment | 0 | – | – |
| `fmBright` *new* | Helligkeit | FM MAKRO | −24…+24 dB | linear, centre detent | 0 | `dB` | `fmbright` |
| `fmAtk fmDec fmRel` *new* | Härte · Länge · Release | FM MAKRO | −30…+30 (DX rate offset) | linear, centre detent | 0 | `±n` | – |

- **LFO Takt list** (stored as beats per cycle; shown as divisions): 1/32 .125 · 1/16T .1667 · 1/16 .25 · 1/16. .375 · 1/8T .3333 · 1/8 .5 · 1/8. .75 · 1/4T .6667 · 1/4 1 · 1/4. 1.5 · 1/2 2 · 1/2. 3 · 1/1 4 · 2/1 8 · 4/1 16 · 8/1 32. Switching FREI→TAKT picks the division nearest to the current rate; TAKT→FREI sets `rate = bpm/60/sync`.
- **The worklet must apply `D_UNIDET`.** It is declared but not applied in the research core. Per voice and per control block, when a route targets `unidet`: `det = clamp(uniDet + dst[D_UNIDET], 0, 1)` and recompute that voice's unison ratios. Skip the computation entirely when no route targets `unidet`.
- **Oscillator readout** under the strip: „8' +7 HT +5 ct = Quinte“. For osc 2/3 it additionally shows the relation to osc 1: „gegen Osz 1: Quinte + 1 Okt.“. Interval names for semitones mod 12: Grundton/Oktave, kl. Sekunde, gr. Sekunde, kl. Terz, gr. Terz, Quarte, Tritonus, Quinte, kl. Sexte, gr. Sexte, kl. Septime, gr. Septime.

### 5.2 UI pages (synth editor)

**Header (P).**
- Row 1 (44): `● SYNTH 1` · engine segment `[VA | FM | WT]` · amber chip „⇅ Am7“ if a Träger is active · „ECO-Klang“ badge if the track is on the native fallback · [↶] [↷] · [✕].
- Row 2 (40): `[‹ Moog-Bass • ›]`. The name opens the **sound browser** (§11); the dot means "geändert" (§11.3). Then [Sichern] · [🎲] · [▶ Hören] (hold).
- **LCD line** (28): `<LABEL> <value>`. When modulated, the range is added: „CUTOFF 240 Hz ↕ 180 Hz … 320 Hz“. It doubles as the mod-mode banner (§9).
- **Tabs** (40): OSZ · FILTER · HÜLLK. · LFO · MOD · FX. With engine FM the first tab reads **FM**; with WT it reads **WT**.
- **Sub-tabs** (32): OSZ 1 · OSZ 2 · OSZ 3 · MIX · STIMME | FILTER: REGLER · XY | HÜLLK.: LAUTST. · FILTER · MOD | LFO: LFO 1 · LFO 2 | FX: SPUR · CHORUS · HALL · ECHO · MASTER (§8).

**Header (L).** One 40 px row with all header items (the preset name truncates), then one 32 px row with tabs, sub-tabs and LCD text.

**Pages** (controls in reading order; P wraps into rows of 4, L uses one row; `seg` = segment row):

| Page | Controls |
|---|---|
| OSZ n (P example below) | seg Welle · seg Fußlage · knobs HT, Fein, Pegel, PW (dimmed and inert unless Puls), Unison · (OSZ 2 only) toggle SYNC 2→1 · readout line |
| MIX | 5 **vertical faders**: Osz 1, Osz 2, Osz 3, Sub, Rauschen · seg Sub-Lage · seg Sub-Form · knobs Ausgang, Analog |
| STIMME | seg Modus (POLY/MONO/LEGATO) · knobs Stimmen, Glide, Uni-Verstimm., Uni-Mix, Breite, Streuung, Anschlag · toggle Phasen-Reset |
| FILTER · REGLER | seg Typ (6) · knobs Cutoff, Resonanz (LED), Drive, Hüllk.-Menge, Keytrack, Anschlag, Bass · seg Qualität ECO/ANALOG · hint line when `res ≥ .6`: „Für Quietschen: Oszillatoren leiser, Drive nach dem Filter (FX)“ |
| FILTER · XY | pad X = Cutoff (exp), Y = Resonanz (0–115 %, line at 100 %), crosshair + values; applies only after 4 px of movement; one undo per gesture. P 340×250, L 300×120 |
| HÜLLK. | (LAUTST./FILTER/MOD is chosen in the sub-tab row only, not repeated on the page) · envelope graph (§5.3; P 360×150, L 300×110) · knobs A, D, S, R, Kurve · seg **Form** [Pluck · Stab · Orgel · Fläche · Schwelle] (sets A/D/S/R/Kurve of the shown envelope in one undo step: Pluck .001/.35/0/.3/.6 · Stab .002/.45/0/.25/.5 · Orgel .005/.05/1/.06/.5 · Fläche 1.2/2/.85/3.5/.65 · Schwelle 4/1/1/6/.4; the graph animates to the new shape in 150 ms). P: the Form row replaces nothing (44 + 150 + 92 = 286 ≤ 305); L: it shares the 44 px segment row |
| LFO n | seg Form (5) · seg FREI/TAKT · knob Rate (Hz, or stepped divisions in TAKT) · seg Start FREI/NOTE · knob Einblenden · knob Mod-Rad · live preview (120×56 canvas, moving dot) · route chips „→ Cutoff +25 %“ (tap = MOD tab, row highlighted) · hint „Regler gedrückt halten → LFO wählen“ (WP5; in WP3 „Ziele im Tab MOD“) |
| MOD | §9.3 (WP3 ships the list, WP5 the full UX) |
| FX | WP3: knobs Drive, Hall, Echo, Lautstärke, Panorama + seg Bei Wechsel (as today). WP4: §8.3 |
| WT | seg Tabelle (Digital/Vokal/Glas/Orgel) · knobs Position, Scan, Scan-Zeit, Glide |
| FM (legacy fm2, WP3–WP6) | knobs Ratio, Menge, Mod-Abkling, Mod-Halten, Glide (old FM page) |

```
P · OSZ 2 page (body 305)
┌──────────────────────────────────────────────┐
│ WELLE    [⟋ Säge][⊓ Puls][∧ Dreieck][∿ Sinus]│ 44
│ FUSSLAGE [32'][16'][ 8' ][4'][2']            │ 44
│ 8' +7 HT +5 ct = Quinte · gegen Osz 1: Quinte│ 20
│  (HT)   (FEIN)  (PEGEL)  (PW)   (UNISON)     │ 92  (5 × 72 = 360)
│  +7     +5 ct    90 %   50 %     3×          │
│ [● SYNC 2→1]                                 │ 44
└──────────────────────────────────────────────┘
L · OSZ 2 page (body ≈140): [WELLE seg][FUSSLAGE seg][SYNC] on the 44 px row, the 5 knobs + readout on the 92 px row.
```

**Visual design ("mehr Haptik").**
- Each page is a raised panel (`--chassis-2` gradient, 1 px inner highlight) with an engraved caps title.
- Knob caps are radial-gradient metal, with the value arc in the track colour, an indicator line and tick marks at detents and steps.
- Faders have an LED-segment fill in the track colour and a 36×18 cap.
- Active segment buttons light their LED. Readouts use `--font-num`.
- Interaction details are in §10.

**Bedienung.**
- Engine switch (VA/FM/WT) keeps all shared parameters (filter, envelopes, LFOs, mods, fx) and keeps the other engines' blocks (`p.fm6`, `p.wt`), so switching is lossless. A missing block gets its default (FM: `FMH.fromV1({ratio:2,index:3,modDecay:.3,modSus:.2})`).
- One undo entry per engine switch.
- 🎲 randomizes the oscillator, filter and envelope keys within the "random range" of Anhang A.1 and never touches `fx`, `level` or mods. At least one oscillator is ≥ .5 and `aS + aD` stays audible (as in v1).
- *(P1, WP5)* **„Was ist anders?“** („abgucken“): a toggle [◎] in header row 2. While on, every knob, fader and segment whose value differs from `ANALOG_BASE` (FM: from `FMH` init) gets a white 4 px dot and the page tabs show the count of such controls („FILTER ·5“). Tapping the toggle again hides the dots. The factory „Trick“ text of the loaded sound is shown in the LCD line while the toggle is on. This lets the user see in seconds which few knobs make a preset (e.g. Pfeif-Lead: Resonanz, Keytrack, Cutoff, Pegel).
- **Extreme filter play** (the user's „ins Extreme von Feedback“): Resonanz goes to 115 % (self-oscillation from 100 %, the LED „EIGENSCHW.“ lights), Drive saturates the ladder input, and track Drive (FX) adds grit after the filter. The master limiter (§8.1) catches the level. The FILTER page hint line explains this order once: „Pfeifen: Resonanz > 100 %, Keytrack 100 %. Brutzeln: Drive. Dreck danach: FX → Drive.“

**Daten.** See §15: `track.sound`, with the patch in `sound.p` and mods in `sound.mods`.

**Audio.** See §5.4–5.5.

### 5.3 Envelope editor (soft pads)

Use `analog-research/adsr-editor.js` (`makeEnvEditor`).
- **Four lanes** A | D | S | R. A finger anywhere in a lane grabs that lane's handle.
- Left/right = time (log; A .001–10 s, D .005–10 s, R .005–15 s). Up/down = sustain (D and S lanes) or curve (A and R lanes).
- One axis per gesture, 4 px dead zone, relative drag (never jumps), double tap = default of that lane, a value bubble above the finger.
- The drawn curve uses the engine law, so what you see is what you hear.

**Changes to the research file:**
1. Fine mode = horizontal offset ≥ 64 px from the touch-down point while dragging vertically (×¼), or a second finger resting on an empty panel spot. Remove "hold still 350 ms" (§10.3).
2. Call the app's `haptic('tick')` at musical steps (1 ms, 10 ms, 100 ms, 1 s, 10 s; sustain 0/50/100 %), and only from pointer handlers. Remove its own `label.click()` from `pointermove`.
3. *(P1, WP5)* A long-press on a lane opens the mod picker for that time parameter (velocity → attack is the classic route). This needs a dst for env times: not in v2; show „nicht modulierbar“.

The A/D/S/R/Kurve knobs under the graph stay in sync. Native path: A ≤ 10 s and R ≤ 15 s also work, because `setTargetAtTime` has no length limit.

### 5.4 Worklet integration (WP4)

- **One node per synth track** whose engine is `analog` (or `fm6` from WP7): `SynthHost.track(ctx, A.trackIn, flat, engineMods)` with `outputChannelCount:[2]`. WT and fm2 tracks have no node; dispose it on an engine switch to WT and recreate it on a switch back.
- **Patch messages:** a whole sound (preset load, undo, engine switch) → `E.set(fullFlat)` + `E.mods(engineMods)` (+ `{fm6}` in WP7). A knob turn → `E.set({key: value})`, coalesced to at most one message per animation frame per track (merge pending keys).
- **Voices:** `spawnVoice(i, …)` returns a **proxy** (`WkVoiceProto`, Anhang D.1) with the same API as the native voice: `release(t, fastTau)`, `cancel()`, `retune(out, t)`, `state()`, `start/end/relT/stopAt/out/baseOut`, perf/log hooks. So the scheduler, Transposer retune, recording, audition and `voices()` stay unchanged.
  - Events are batched per tick and flushed with `queueMicrotask` (host.js does this).
  - `glideFrom` comes from the existing `grpOuts/prevOuts` logic.
  - Skip `makeRoom()` for worklet tracks: the worklet allocates and steals (released voices first, lowest level first, else the oldest; 96-sample fade).
  - `{end:[ids]}` marks proxies dead. `stopAt = t + aR·1.2 + 0.1` only as a GC safety net.
- **Tempo:** `E.tempo(S.bpm, R.playing ? R.startTime : null)` on play, stop, BPM change and project load. *(P1)* Defer it to the exact re-anchor time with `{tempo:{bpm, start, at}}` (TempoMap from `fxresearch/fx-lfo-worklet.js`), so synced LFOs never lose phase.
- **Panic / ALL-OFF:** `E.panic()` per track in `panic()` and `silenceAll()`. Stopping the transport releases via the proxies.
- **Scope** (WP5): `E.scope(true)` while the editor of that track is open (§9.4).
- **Load reports** `{load, voices}` feed the CPU limiter (§14.3).
- **Merging the two research variants:** start from `presetlib/analog-core-sync.js` (hard sync) and apply the 5 hunks of `diff analog-research/analog-core.js modux/analog-core-scope.js` (scope). The hunks do not overlap.

### 5.5 Native path: fallback, WT and legacy FM (WP3)

- **Split** `analog-research/fallback.js` into:
  - `NativeVoice.source(c, P, engine, note, vel, cvOut)` → `{out, srcs, nodes}`. Engines: `analog` (3 osc, unison ≤ 3 on osc 1, PW via cached PeriodicWave in 5 % steps, sub, noise), `wt` (the current WT oscillators and scan weights, reading `P.wt`), `fm2` (the current 2-op code, reading `P.fm2`) and, in WP7, `fm6` (`DXN.voice`).
  - `NativeVoice.tail(c, P, note, vel, t0, srcOut, dest, cvOut)`:
    - drive: tanh WaveShaper only when `drive > .02`, `oversample 'none'`
    - Biquad LP/HP/BP with **Q in dB**: `fA.Q = 20·log10(.54)`, `fB.Q = 20·log10(interp(RES, Q24, res))`, LP12/HP12 via the Q12 table; bandpass Q stays linear `.7 + res·12`
    - level trim as in fallback.js
    - fake whistle sine when `res > .9` and the type is LP
    - filter envelope via ConstantSource → cents on `detune` (×7200·fenv·velocity factor)
    - keytrack via `cvOut → ktGain`
    - VCA with the amp ADSR
- **Envelopes:** use the current build's `envStart / envValueAt / VoiceProto.release` (cancel-safe, only `setValueAtTime` + `setTargetAtTime`). **Do not** use `cancelAndHoldAtTime` from fallback.js. A ≤ 10 s, R ≤ 15 s. Stop sources at `tr + R·1.6 + .02`.
- **Native LFOs:** per synth track, two `FX.TempoLFO` (embed `fx-native.js` already in WP3 as a library) with the patch's shape, rate or sync and retrig = FREI only.
  - Routes from `lfo1/lfo2` to `pitch` (cents ×2400 per 1.0 → `cv.offset`), `cutoff` (cents ×12000 per 1.0 → filter `detune`), `amp` (→ `trem.gain`, depth = |amt|/2) and `pan` (→ `pan.pan`) are realized as GainNodes connected per voice (pitch, cutoff) or per track (amp, pan). Voice connections are disconnected in cleanup (as `lfoPitch` today).
  - All other routes are ignored on the native path. The MOD tab marks them „nur mit Worklet“ (§9.5).
- **Limits:** native poly per track = `P.poly`; global native cap 24 voices (steal as today).

### 5.6 Migration of v2 patches (WP3)

Use `SQStore.migratePatchV2` with one change: `engine 'wt'` → a **wt** sound (flat params converted exactly like `va`, plus `p.wt = pt.wt`), and `engine 'fm'` → an **fm2** sound (`p.fm2 = pt.fm`). The FM tracks are converted again in WP7 (§6.7). Other mappings:
- `wave1/2` → `o1w/o2w`; `o1lvl = 1 − .5·mix2`; `o2lvl = mix2`; `o2oct = oct2`; `o2fine = det2`; `subLvl = min(1, sub·1.4)`; `noise·1.5`
- filter type `lp24/lp12/bp/hp` → `ftype 0/1/3/5`; `res·.95`
- the old LFO becomes LFO 1 + one route (pitch `d²/2`, cutoff `.4·d`, amp `−d/2`)
- `track.poly` → `p.poly`; poly 1 → `mode 1`
- `fx.reverb/delay` → `fx.rev/dly`

### 5.7 Tests

- [ ] AN1 Port `analog-research/test-node.mjs` to run against the **extracted** worklet source of the built file: LP24 −12.04 dB at fc, LP12 −6.02, BP12 0 dB; self-oscillation at res 1.05 (ECO within ±10 ct from 220 Hz to 14 kHz); res .95 decays; no NaN in 60 000 random blocks; aA = 10 s peaks at 9.8 ± .3 s; aR = 15 s reaches −60 dB at 13.9 ± .5 s.
- [ ] AN2 Loader: in Chromium `runtime().engine.synth === 'worklet'` with `how === 'blob'`. With a page CSP that blocks `blob:` and `data:` → `'native'` within 3 s, `err` set, and `audition()` RMS > −40 dBFS.
- [ ] AN3 `o1oct` +1 doubles the fundamental (FFT peak ×2 ± 1 %); HT +7 = ×1.498 ± .3 %; Fein +50 = ×1.0293.
- [ ] AN4 The HT knob dragged slowly across 0 stays at 0 for 12 px (detent); a double tap resets to 0.
- [ ] AN5 `o1uni 7`, `uniWidth 1` → L/R correlation < .9; `uniWidth 0` → mono (correlation > .99).
- [ ] AN6 Pfeif-Lead preset (res 1.02, kt 1): whistle pitch at C3, C4, C5 within ±10 ct of the expected harmonic (worklet).
- [ ] AN7 E9 (old stress test) passes on worklet tracks: after `stop()` + 2.5 s, `voices().length === 0`. E10 (retune log without retrigger) passes on worklet tracks.
- [ ] AN8 Port `analog-research/test-ui.mjs` (8 envelope-editor checks at 390 px). Taps change nothing; a full swipe in the R lane reaches 15 s.
- [ ] AN9 Old tests F1–F5 pass through the legacy path aliases (Anhang C.1), e.g. `setParam(t,'filter.cutoff',200)` vs `8000` → centroid ratio > 2.
- [ ] AN10 Native path (WP3: always; from WP4: `?engine=native` URL flag or `D.forceNative(true)` before audio start): all 30 analog factory presets sound (RMS > −40 dBFS). From WP4 on, the badge „ECO-Klang“ is visible whenever a VA/FM track runs natively.
- [ ] AN11 Readout: `o2oct 0, o2semi 7, o2fine 5` → „8' +7 HT +5 ct = Quinte“.

---

## 6. FM engine: 6 operators, 32 algorithms (topic 4, WP7)

### 6.1 Decision and justification (Entscheidung)

**6 operators with all 32 DX7 algorithms, not 4×8.**

- **CPU (measured, Chromium, one 2.8 GHz Xeon core):** 32 sustained E.PIANO voices in the per-voice worklet took about 30 % of real time, including about 9 % per-node overhead. Without the per-node overhead that is ≈ 0.65 % per voice. Assume 2–2.5× slower on older iPhones: 16 FM voices ≈ 20–26 % worst case. Typical use is 2 FM tracks with ≤ 4 sounding voices each, ≈ 8–12 %.
- **Cost reducers already in the code:**
  - Operators below the msfa level threshold are skipped, so decayed modulators cost nothing.
  - Envelopes step at block rate with per-sample gain interpolation.
  - Integer phase accumulator with a 4096-point sine table.
  - Operators above 0.45·sr are silenced.
- **A 4-op design would save at most a third of the operator cost** but lose the classic patches (the DX E-piano needs 3 operator pairs = algorithm 5), .syx import and DX know-how.
- **Algorithms:** the engine implements all 32, because every algorithm costs the same (it is only routing) and .syx banks use all of them. The UI offers the useful **subset of 8 favourites first** (§6.5); the other 24 are one tap further in the algorithm sheet.
- **Polyphony:** FM poly defaults to 8 per track. The CPU limiter lowers it to 6/4 (§14.3).

### 6.2 Parameters

- `sound.p` = full flat patch (§5.1). FM defaults (**FM_BASE**, applied when a sound is created as FM): `ftype 1, cutoff 20000, res 0, drive 0, kt 0, fenv 0, fvel 0, bass 0, lq 0, aA .002, aD .05, aS 1, aR .05, ampVel 0, fmAmp 0, analog 0, spread .15, level 1`.
- `sound.p.fm6 = {alg 1–32, fb 0–7, trans −24…24, ops:[6 × {on 0/1, fixed 0/1, coarse 0–31 (0 = ×0.5), fine 0–99, det −7…7, ol 0–99, r:[R1..R4] 0–99, l:[L1..L4] 0–99, vs 0–7, rs 0–7, ks?:{bp 0–99, ld 0–99, rd 0–99, lc 0–3, rc 0–3}}]}` — DX7 units, so .syx import is lossless. Normalize with `SQStore.normFm6`.
- Macros (flat keys): `fmBright` (dB on all modulators), `fmAtk` (added to R1 of every operator), `fmDec` (added to R2 and R3), `fmRel` (added to R4); rates are clamped 0–99 after the offset. `fmAmp` 0 = the DX envelopes shape the volume (VCA = gate, the voice ends when the outputs are silent); 1 = the amp ADSR applies on top (it can cut tails).
- UI translations (`FMH`): ratio = `coarse·(1+fine/100)` (coarse 0 = 0.5); fixed = `10^(coarse%4 + fine/100)` Hz; modulation index of a modulator at level `ol` = `FMH.modIndex(ol)` (OL 99 → 12.57 rad, 91 → 6.28, 83 → 3.14, 75 → 1.57); stage times `FMH.envTimes(op, note=60)`; time → rate `FMH.rateForTime`.

### 6.3 Worklet FM block (port of `fmresearch/proto/dx6-worklet.js` into `dirigent-analog`)

1. **Constants and tables** copied verbatim: `SIN` (4096+1), `LEVEL_LUT`, `VEL_TAB`, `EXP_SCALE`, `DX_ALGS` (32 strings, msfa order), `scaleOL`, `scaleVel`, `scaleRate`, `scaleCurve`, `scaleLevel`, `LVL_PER_SEC`, `GAIN_THRESH`.
2. **Message** `{fm6: patch}` → `this.fm = patch; this.alg = ALGS[alg-1]; this.fbShift = fb > 0 ? 2^(fb−8) : 0`. Sounding voices re-target their running envelope stage (DX6 `setPatch(P, true)` semantics). Messages are throttled to 30 Hz by the host while knobs move.
3. **Param** `eng` (sent with `{set:{eng}}`): 0 = analog oscillator section, 1 = FM section. Changing it while voices sound fades all voices out (64 samples).
4. **Per voice** (allocated once in the `Voice` constructor, never in `process`): `fph Uint32Array(6)`, `finc Float64Array(6)`, `flvl, ftgt, frate, fg0, fg1, foutLvl Float64Array(6)`, `fix Int8Array(6)`, `frise Uint8Array(6)`, `frs Int8Array(6)`, `fratio, ffixed Float64Array(6)`, `fon Uint8Array(6)`, `fbuf = 6 × Float32Array(16)`, `fmodIn Float32Array(16)`, `ffb0, ffb1, fdone, fnote, fvel`.
5. **Note on (eng 1):**
   - phases to 0 (key sync)
   - `outLvl[k] = max(0, (min(127, scaleOL(ol)+scaleLevel(note, ks)) << 5) + scaleVel(vel127, vs))`
   - `rs[k] = scaleRate(note, rs)`
   - ratio including msfa detune, or the fixed frequency
   - `advance(k, 0)` with the macro rate offsets
   - `trans` is added to the note for pitch, rate and level scaling
6. **Per control block (16 samples)** — the DX6 code used 32-sample blocks; scale the rate by 16 samples:
   - step every operator's envelope
   - gains = `2^(lvl/256 − 14) · 10^(dB/20)`, where `dB = fmBright + dst[D_FMBRIGHT]·24` for modulators, plus `dst[D_OPk]·99·0.75` for operator k
   - `f0 = lut(FREQ, v.pitch + fm.trans + dst[D_PITCH]·24)` (glide, retune and LFO pitch work as for analog; the host always sends plain notes)
   - `inc = round(f/sr·2^32)` for `f < .45·sr`, else 0
7. **Render:** operators k = 5 … 0, exactly as in dx6-worklet: modulation input = sum of modulator buffers; feedback on `fbDst` with the 2-sample average; per-sample linear gain interpolation; outputs summed × `0.5/√nCar` into `bl`. FM voices are mono (`stereo = false`) and panned by `spread`.
8. **Filter bypass** (eng 1 only, gain exactly 1) when `ftype ≤ 1 && cutoff ≥ 18000 && res ≤ .02 && fenv === 0 && drive ≤ .01` and no route targets `cutoff/res/drive/fenv`. Otherwise the ladder runs as for analog.
9. **Amp and voice end:**
   - `fmAmp 0`: the amp envelope acts as a gate (2 ms attack to 1, no release stage); the voice ends when the gate is off and no output operator is above `GAIN_THRESH` for > 256 samples (or after 12 s).
   - `fmAmp 1`: the normal analog amp ADSR, plus the DX end rule.
10. **New mod destinations:** `D_FMBRIGHT = 15`, `D_OP1..D_OP6 = 16..21`, `NDST = 22`. String ids `fmbright`, `op1`…`op6` (§9.2). Amount 1.0 = +24 dB brightness, or +99 OL steps for an operator.
11. Algorithms 4 and 6 fold their cross-feedback into OP6 self-feedback (as in msfa/Dexed). Document this in Menü → Info → FM.

Anhang D.16 has the code outline.

### 6.4 Native fallback

`NativeVoice.source(…,'fm6')` = `DXN.voice(c, fm6, note+trans, vel, t0, srcOut, cvOut)`. Requirements:
- cosine (derivative) modulator waves
- the audio-rate multiply for operators in the middle of a stack
- static feedback waves from `fbHarmonics`
- only `setValueAtTime` + `setTargetAtTime`

The VCA is a gate whose release tau comes from `DXN.releaseTime(fm6, note, vel)`. Macros apply at note-on only (bright = an OL offset on modulators). Live edits apply to new notes only; the editor shows the hint „Kompatibel: Änderungen ab der nächsten Note“.

### 6.5 UI (FM tab)

Sub-tabs **ALGO · OP · MAKRO**. Carriers are called **Ausgang** in the UI (never „Träger“).

```
P · FM / ALGO (body 305)
┌──────────────────────────────────────────────┐
│ ┌─────────────┐  ALGORITHMUS  [‹] 5 [›]      │
│ │ [6] [4] [2] │  „3 Paare (E-Piano/Glocke)“  │ diagram 170×150 (algSvg, box 26,
│ │  │   │   │  │  [Liste]      (FEEDBACK)     │ outputs filled in the track colour,
│ │ [5] [3] [1] │                 6            │ feedback = orange loop, thickness ~ fb)
│ └─────────────┘                              │
│  1     2     3     4     5     6             │ strip 6 × 56 = 336
│ ●AN   ●AN   ●AN   ●AN   ●AN   ●AN            │ on/off LED (tap)
│ ×1,00 ×14   ×1,00 ×1,00 ×1,00 ×1,00          │ ratio or „324 Hz“ (tap = select operator)
│ ▮▮    ▮     ▮▮    ▮     ▮▮    ▮              │ vertical level faders (drag, 0–99)
│ 0 dB  I 3,1 0 dB  I 1,6 0 dB  I 0,8          │ outputs: dB; modulators: index
│ ⌒     ⌒     ⌒     ⌒     ⌒     ⌒              │ envelope sparkline 24 px
└──────────────────────────────────────────────┘
L: [diagram 130×120] [strip 336×130] [‹5›, Liste, FEEDBACK] in one row.
```

- **Diagram:**
  - Tap an operator box = select it (the OP page follows).
  - Tap empty space or [Liste] = algorithm sheet: 32 thumbnails (box 14) in a 4×8 grid, favourites first with names (1 „Stapel + Paar“, 2 „Stapel (FB auf 2)“, 5 „3 Paare (E-Piano/Glocke)“, 7 „Y-Zweig“, 16 „Ein Ausgang“, 19 „Orgel/Bläser“, 22 „Fächer (1 Mod → 3 Ausgänge)“, 32 „Additiv (Orgel)“).
  - A horizontal swipe on the diagram = algorithm ±1.
  - The diagram has a fixed height so the page never jumps.
- **Strip:**
  - The fader is the most used DX parameter. Long-press on a fader = mod picker (`op1`…`op6`).
  - The operator on/off is the LED button above the fader, **not** a long-press.
- **OP page:**
  - Header „OP 2 · Modulator → OP 1“ with [‹][›] and [Solo] (hear only this operator, monitor-only, not saved).
  - seg **FREQ | HÜLLK. | SKAL.**
  - **FREQ:** seg RATIO/FEST · large readout „×3,50“ / „324 Hz“ · knobs Grob (stepped with detents), Fein, Verstimmung (±7), Pegel · info line „Index 3,1 rad“ (modulators) or „−4,5 dB“ (outputs).
  - **HÜLLK.:** a 4-point rate/level graph (P 340×120, L 300×100). Drag a point vertically = its level (L1–L4); drag a segment horizontally = its **time**, converted to the DX rate with `FMH.rateForTime`. Below it a times row „A 2 ms · D1 340 ms · D2 1,2 s · R 460 ms“ (computed at C4 including rate scaling, capped at „>20 s“). Buttons [Auf alle Ausgänge] [Kopieren] [Einfügen] [Init].
  - **SKAL.:** knobs Anschlag (vs), Key→Zeit (rs), Breakpoint (note name), Tiefe L, Tiefe R · seg Kurve L, seg Kurve R (−LIN −EXP +EXP +LIN).
- **MAKRO page:** knobs Helligkeit, Härte, Länge, Release, Transponieren (±24 HT) · seg Lautstärke-Form [DX-HÜLLKURVEN | ADSR] · [Init FM]. These four macros are the obvious targets for hold-to-modulate.
- The FILTER, HÜLLK., LFO, MOD and FX tabs are shared with VA. For FM sounds the filter is open by default.

**Bedienung.** Every gesture is one undo step. Live edits reach sounding worklet voices at 30 Hz.

### 6.6 DX7 .syx import

Menü → Sounds → **[DX7-Bank importieren (.syx)]** (`<input type=file>` **without** an `accept` attribute, because iOS greys out `.syx` files otherwise, §1.7.8; the content check below rejects other files).
- Parse 32-voice bulk dumps (`F0 43 0n 09 20 00` + 4096 bytes + checksum + `F7`, 4104 bytes) with the field layout of `fmresearch/tools/syx.mjs` (verified on ROM1A).
- Each voice becomes a user sound: engine `fm6`, cat `fm`, the name from the bank, `p = FM_BASE + {fm6}`.
- *(P1)* LFO mapping: DX LFO speed/delay → LFO 1 rate/fade, PMD·PMS → `lfo1→pitch`, AMD → `lfo1→amp`. The pitch EG is ignored.
- A bad checksum gives a warning toast and still imports. Not a DX7 bank → toast „Keine DX7-Bank (32 Stimmen)“.
- Merge into the library with hash dedupe. Toast „32 FM-Sounds importiert (11 schon vorhanden)“.
- *(P1)* Single-voice dumps (VCED, 155 bytes).

Licensing: ship only our own FM presets (§11). The ROM1A values in `dx6-presets.js` / `rom1a.json` are **test fixtures only**.

### 6.7 Presets and migration of legacy FM

- The 12 factory FM sounds of `SQ_FACTORY.FM6` (Anhang B.2). Conversion of a factory record:
  - `p = FM_BASE + {fm6: f.p}`
  - `level = 10^(common.gain/20)`
  - `glide/mode/poly` from `common`
  - `common.lfo` → LFO 1: `wave` sine/tri/square/saw → shape 0/1/3/2, `rate`, `fade = delay`, plus routes `lfo1→pitch` with `amt = lfo.pitch/24` and `lfo1→amp` with `amt = lfo.amp`
- **fm2 → fm6:** `p.fm6 = FMH.fromV1(p.fm2)`, `fmAmp = 1` (keep the v2 ADSR feel), shared params kept, `level` matched by RMS within ±4 dB (`level = .3 · 10^(−12/20)` as the start value, then adjusted by the migration test). `p.fm2` is deleted.
- The FM tab replaces the legacy fm2 page.

### 6.8 Tests

- [ ] FM1 Algorithm table in the worklet source == msfa table (port `fmresearch/tools/algcheck.mjs` against the extracted source).
- [ ] FM2 Merged engine vs standalone `dx6-worklet.js` (offline render, the 12 factory patches + the ROM1A E.PIANO 1 fixture, filter bypass, `fmAmp 0`, notes C3/C4/C5 × vel .5/1): spectral distance ≤ 3 dB at 30 ms and 600 ms, peak within ±1 dB, no NaN.
- [ ] FM3 Loudness: each factory FM sound's preview phrase lands at −18 ± 3 LUFS (harness `presetlib/harness.mjs`).
- [ ] FM4 Native fallback: with the worklet disabled, all FM factory sounds sound (RMS > −40 dBFS); spectral distance to the worklet ≤ 10 dB except feedback-7 patches.
- [ ] FM5 Live edit: changing OP2 `ol` while a note sustains changes the spectral centroid within 60 ms (worklet).
- [ ] FM6 .syx import of a valid bank → 32 sounds with the bank's names; checksum corrupted → warning toast + import; random bytes → error toast, no change.
- [ ] FM7 CPU: 16 sustained DX-Tines voices → worklet load ≤ 25 % on the test machine; the limiter caps FM poly at 6 above 60 %.
- [ ] FM8 UI (CDP touch, 390×844): tap box 3 selects OP3; a swipe changes the algorithm by 1; the LED toggles `on`; a fader drag changes `ol` with one undo entry; the diagram height is constant across all 32 algorithms.
- [ ] FM9 Migration: a v2 project with FM Arp plays on fm6 with RMS within ±4 dB of the v2 render.
- [ ] FM10 Mod routes `lfo1→op2` and `vel→fmbright` change the spectrum audibly (centroid difference > 15 % between min and max).

---

## 7. Drum synth (topic 5, WP6)

### 7.1 Engine

Use `drumresearch/drum-engine.js` (`DrumSynth`) and `kits.js` (`DrumKits`). There is **one universal voice per pad** (Waldorf Attack principle) with four layers (Nord Drum principle):
- **TON:** 2 oscillators incl. the `cos` click wave, 2-op FM, pitch sweep, optional tone filter.
- **RAUSCHEN:** white or pink, LP/BP/HP plus an optional HP, filter sweep, `nBur > 1` = clap bursts.
- **METALL:** the 808 six-square bank through 7.1 kHz and 3.44 kHz bands and an HP.
- **KLICK:** 4 pre-rendered transients — Puls, Tick, Blip, Knock (phone-audible).

Each layer has attack/hold/decay with curves from exponential to gated; `tSpk` is the initial drop.

The `model` (bd sd cp rs ch oh cy tm cb sh fm) only chooses the front-panel macros (`DrumSynth.MODELS`). Any pad can become an FM drum.

- **Velocity:** `level = lvl·v²` (half velocity = −12 dB). Timbre follows velocity through `dyn`.
- **Accent:** the per-step flag plus the kit's `accent` amount (+up to 4 dB, +.3 timbre velocity).
- **Choke:** each pad is monophonic (a new hit cuts its previous one, τ 3 ms). Choke groups are symmetric (hats = group 1).
- **Drive per hit:** create the shaper inside `hit()` only when `drv > .01`. **(Entscheidung)** `oversample 'none'` (the research used '2x'). '2x' adds 128 frames of latency only to driven hits, which would shift driven kicks against the hats.
- **Kit bus:** shared ROOM (0.7 s) and GATE (gated "Nonlin", length .15–.6 s) convolvers. Levels live in the return gains (ROOM ×1.4, GATE ×4 by default); GATE has a 280 Hz HP. Send gains are initialized to 0. The gate IR is rebuilt only when its length changes.
- **Choke cancel fix:** record chokes on the choking hit. When that hit is cancelled (`cancelTrackFrom` on a scene switch or an edit), restore the victim: `cancelScheduledValues(t)` on its `out.gain`, `setValueAtTime(1, t)` and re-issue its stop at the old end.
- **Buffers:** `DrumSynth.buildBuffers(c)` (≈ 80 ms) runs lazily on the first drum use, or via `idle()` (§1.7.7: `setTimeout` fallback, Safari has no `requestIdleCallback`) right after the audio unlock, never while the transport plays.

### 7.2 Pads

- 12 pads in `DrumKits.SLOTS` order: KICK 36, SNARE 38, RIM 37, CLAP 39, HH ZU 42, HH OFFEN 46, TOM TIEF 45, TOM MITTE 47, TOM HOCH 50, BECKEN 49, PERC 56, SHAKER 70.
- **P:** 4×3 in that order. **L/W:** 6×2.
- Each pad shows a colour stripe, its name and the slot's model in 9 px.
- **Velocity from the finger position:** bottom edge .35, top edge 1.0 (`DrumSeq.padVel`). The kit setting „Pad-Anschlag: POSITION | FEST“ (FEST = .8).
- Pads flash on sequencer hits. Computer keys: KeyA S D F G H J K L, Semicolon, Quote, Backslash = pads 1–12 (on German keyboards …L Ö Ä #).
- Old GM numbers (36, 38, 39, 42, 46, 45, 50, 56) keep their pads, so old clips play unchanged. Unknown notes map with `mapV1Drum`.

### 7.3 Drum editor

Header: `● DRUMS` · `[‹ Rom Pop • ›]` (kit/sound browser) · [Sichern] · [🎲] (randomizes the selected instrument's macros within the inner 80 %) · [▶] (audition the selected instrument) · [↶][↷][✕]. Tabs **SOUND · TIEF · SCHRITTE · KIT · FX**.

| Tab | Content (P; L puts it in one row where possible) |
|---|---|
| SOUND | 12 instrument chips (P 2×6, L 1×12; tap = select + audition) · [Modell ▾] popover (Kick, Snare, Clap, Rim, HH zu, HH offen, Becken, Tom, Cowbell, Shaker, FM) · the model's 4–6 macro knobs (`MODELS[model].macros`) · knobs Pegel, Panorama, Raum, Gate · [Sound laden] = this instrument from every kit + own drum sounds (the per-instrument library) |
| TIEF | seg layer [TON · FM · RAUSCHEN · METALL · KLICK · AUSGANG]; each layer has an on/off LED (sets its level to 0 and remembers it) and ≤ 10 knobs/segments (Anhang A.3 lists every parameter per layer) |
| SCHRITTE | §3.4 (12 chips; lanes incl. TUNE and DECAY = `lk` locks) · [Takt n] · **[Euklid…]** popover (instrument, Schläge k 0–16, Drehung 0–15, live preview, Anwenden = one undo) · **[Muster ▾]** (4 starter patterns, Anhang D.15; they replace the current bar of the clip, one undo) |
| KIT | Kit ‹ › and list · knobs Gate-Länge (.15–.6 s), Gate-Pegel, Raum-Pegel, Akzent (0–1), Swing (global) · seg Pad-Anschlag POSITION/FEST · [Kit sichern] |
| FX | the SPUR page of §8.3 for the drum track |

### 7.4 Data

- `DrumTrack.sound = {engine:'drum', name, cat:'drums', p:{base, slots, kit}, fx, origin}`:
  - `base` = the kit name (display only; may be null).
  - `slots[id]` = the **full** parameter copy of that slot at the time the kit was chosen, stored as a diff against `DrumSynth.DEFAULTS`. Later code changes therefore never change a saved song.
  - `kit = {gate:.34, gateLvl:4, room:1.4, accent:.5, padVel:'pos'}`.
- Extend `SQStore.normDrum` to keep `kit`. The slot-id regex already allows the 12 ids.
- Old drum tracks (`kit`, `voices`, `fx`) are migrated by `SQStore.migrateDrumsV2` (808 → 808, 909 → 909, Lo-Fi → Rom Pop, Industrial → FM Labor, with level/tune/decay carried over) when WP6 loads them. The project stays format 3; `normalizeProject` detects `voices` and migrates. Toast for kit substitutions.
- Drum clip notes and `clip.seed`: §3.4.

### 7.5 Audio integration

```
DrumSynth.hit(c, AU.drumBufs, AU.strips[slot].in, P, vel, t, {accent}) → {srcs, nodes, out, end}
AU.strips[slot] = AU.kit.strip()  (pan + room/gate sends, set(P) on every param change)
AU.kit = DrumSynth.kitBus(c, AU.drumBufs, A.trackIn) → trackIn → the normal track chain (§1.5)
```

`drumHit(gm, vel, t, src, ex)` keeps the bookkeeping (HITS, hitCleanup, choke, perfAdd, logNote, padFlashAt) and only swaps the sound part (Anhang D.10). It applies locks with `DrumSeq.lockParams` (a new object; the kit is never mutated).

Kick hits (GM 36, src `clip` or `pad`) call `onKickScheduled(t)` for the pump (§8).

### 7.6 Kits, sounds, patterns

7 kits: 808, 909, **Rom Pop** (new default, audible on phone speakers), Gated 84, FM Labor (from `kits.js`) and Disko 85, Resonanz-Perc (from `presets-factory.js` `NEW_KITS`). Every kit slot is also a single "drum voice sound" („808 · KICK“) in [Sound laden]. Patterns and Euklid: Anhang D.15.

### 7.7 Tests

- [ ] DR1 Port `drumresearch/test-drums.mjs`: 7 kits × 12 slots render without NaN; peaks per category in the measured ranges (kick −5…−7 dBFS, snare −1…−5, hats −9…−14, toms within 2 dB of each other).
- [ ] DR2 Port `drumresearch/verify-drums.mjs`: clap bursts 11 ± 3 ms apart; HH ZU silences a ringing HH OFFEN within 30 ms; the gate plateau is flat (±3 dB) from 200 to 375 ms, then cut.
- [ ] DR3 Choke cancel fix: an HH OFFEN hit, then a scheduled HH ZU that gets cancelled by a scene switch → the open hat rings to its full decay.
- [ ] DR4 Old test D7 and F7 pass (alias `tune`→`frq` for the kick). `pad('kick')` and `pad(36)` still work; `pad('rim')` plays GM 37.
- [ ] DR5 Pad velocity: CDP taps at 10 % and 90 % of the pad height (measured from the top edge) → logged velocity ≈ .94 and ≈ .41.
- [ ] DR6 Migration of a v2 drum track (kit 909, kick tune 60) → drum sound with base '909' and `slots.kick.frq === 60`; old clips play the same GM notes.
- [ ] DR7 CPU (Chromium, busy 16-bar groove of Rom Pop): ≤ 7 % of a core; no oversampled WaveShaper exists in the graph while idle.
- [ ] DR8 Unit: `DrumSeq.euclid(3,8)` = x..x..x., `euclid(5,8)` = x.x.xx.x. UI: Euklid k = 5, Drehung 0 on KICK writes steps 0, 4, 7, 10, 13 of the current bar; one undo restores the row.
- [ ] DR9 Phone audibility: the Rom Pop kick's level after a 24 dB/oct HP at 220 Hz (first 150 ms) is ≥ 15 dB higher than the 808 kick's.

---

## 8. Effects (topic 6, WP4)

Use `fxresearch/fx-native.js` (`FX`) and `fxresearch/fx-worklet.js` (`dirigent-hall`, inside the shared worklet module).

### 8.1 Audio graph and rules

The graph is in §1.5. Binding details:

- **Per track:** `trackIn → drive → [chorus insert] → trem → duck → vol → pan → post`.
  - The drive WaveShaper uses `oversample 'none'`. Set it once and never toggle it, so its latency never jumps.
  - `FX.Chorus` is created only while `fx.chorus.mode !== 'off'` and torn down completely on AUS (≈ 1 % CPU each).
  - `duck` is the pump gain.
  - Sends are post-fader: `revSend.gain = fx.rev`, `dlySend.gain = fx.dly` (0…1, no extra scaling). Change every gain with `setTargetAtTime(v, now, .015)`.
- **Hall:**
  - Pre-delay: `hallPre = DelayNode(1 s)` with `channelCount 1, 'explicit'` (mono sum). Its value is in ms or a division (1/64, 1/32, 1/16).
  - Worklet primary: `new AudioWorkletNode(c, 'dirigent-hall', {numberOfInputs:1, outputChannelCount:[2], channelCount:1, channelCountMode:'explicit'})`.
  - Then `hallRet → hallDuck → masterSum`. All parameters are live (`setTargetAtTime(v, t, .03)`); freeze uses `setValueAtTime`.
  - Fallback `FX.ConvHall`: decay ≤ 10 s; the IR is regenerated only on knob **release**; call `tickAhead(.35)` before the buffer swap; spillover swap.
- **Echo:**
  - `FX.Echo(c, {loopExtra: AU.loopExtra, maxSec: 6})`, where `AU.loopExtra = await FX.measureLoopExtra(sr)` at startup (Chromium 128 frames, otherwise 0). Exactly one DelayNode per feedback loop.
  - Modes PING-PONG / STEREO / MONO.
  - A BPM change glides the delay times (τ .06, tape repitch).
  - `echo.toHall → hallIn`. The tracks connect to `AU.echoIn` (a GainNode created synchronously), which is connected to `echo.input` once the echo exists after the ~20 ms latency measurement (Anhang D.9).
- **Master:**
  - `AU.M = FX.Master(c)`, set from `S.fxBus.master`. The trim cancels the compressor's hidden makeup (`FX.autoMakeupDb`). The soft ceiling uses `oversample 'none'`.
  - `AU.analyser = AU.M.analyser`, so `meter()` keeps working.
  - Defaults: glue −16 dB, 2:1, knee 8, attack 20 ms, release 200 ms, makeup +1.5 dB; limiter −1.5 dB.
- **Latency:** `AU.graphLat = 2·await FX.measureCompLatency(sr)` (≈ 12 ms). Use `outLat + graphLat` everywhere the old spec uses `outLat` (TAKT display, launch boundaries, recording compensation).
- **Metronome and count-in clicks** now enter `masterSum`. They were 6 ms early in v1 because they bypassed the glue.
- **Pump (Pumpen):**
  - The scheduler calls `onKickScheduled(t)` for every scheduled or played kick, or, per `fxBus.pumpSrc`, on every 1/4 or 1/8.
  - It calls `FX.pump(AU.tracks[i].duck, t, fx.pump, divSec(fx.pumpRel))` for each track with `pump > 0`, and pumps `hallDuck` by `fxBus.hall.pump`.
  - On transport stop: `cancelScheduledValues(now)` and `setTargetAtTime(1, now, .02)` on every duck gain.
- **Tails:** stopping lets the hall and echo ring out. A second ■ within 1 s (or `panic`) calls `AU.echo.kill()` and posts `{clear:true}` to the worklet hall.
- **Effect hints of presets:** a sound may carry `bus` (e.g. Äther: hall 8 s). The sound browser shows a chip „Hall/Echo wie im Preset“ that applies it on tap (one undo step, `kind:'fx'`). It is **never** applied automatically, because the buses are shared by all tracks.

### 8.2 Parameters (project-level `S.fxBus`, per-track `sound.fx`)

| Block | Key | UI | Range | Default |
|---|---|---|---|---|
| hall | `decay` | Länge | 0.2–20 s exp (60 = endless, shown „∞“) | 3.2 |
| | `size` | Größe | 0.35–1.6 | 1.0 |
| | `predelay` | Pre-Delay | 0–250 ms or '1/64','1/32','1/16' | '1/64' |
| | `damp` | Höhen-Dämpfung | 400–20000 Hz exp | 6500 |
| | `lowcut` | Bass-Cut | 10–600 Hz exp | 90 |
| | `tone` | Ton | 500–20000 Hz exp | 12000 |
| | `mod` | Bewegung | 0–1 | .5 |
| | `width` | Breite | 0–2 | 1 |
| | `freeze` | EINFRIEREN | bool | false |
| | `ret` | Rückweg | 0–1 | .8 |
| | `pump` | Pumpen | 0–1 | 0 |
| echo | `mode` | Modus | 'pp' PING-PONG, 'st' STEREO, 'mono' MONO | 'pp' |
| | `divL`, `divR` | Zeit L / R | 1/32, 1/16T, 1/16, 1/16., 1/8T, 1/8, 1/8., 1/4T, 1/4, 1/4., 1/2T, 1/2, 1/2., 1/1 | '1/8.', '1/4' |
| | `fb` | Feedback | 0–1.1 (> 100 % = dub self-oscillation, bounded by tanh) | .4 |
| | `lowcut`, `highcut` | Low Cut, High Cut (inside the loop) | 20–2000 / 1000–16000 Hz exp | 250, 4500 |
| | `drive` | Sättigung | 0–1 | .15 |
| | `wow` | Band-Leiern | 0–1 | .2 |
| | `toHall` | Echo → Hall | 0–1 | .15 |
| | `ret` | Rückweg | 0–1 | .8 |
| master | `thr ratio knee attack release makeup drive vol` | Schwelle, Ratio, (knee fixed 8), Attack, Release, Make-up, Drive, Lautstärke | −30–0 dB, 1–8, –, 1–100 ms, 50–1000 ms, 0–12 dB, 0–1, 0–1 | −16, 2, 8, .02, .2, 1.5, 0, .85 |
| `fxBus` | `pumpSrc` | Pump-Quelle | 'kick', '1/4', '1/8' | 'kick' |
| sound.fx | `drive` | Drive | 0–1 | 0 |
| | `chorus.mode` | Chorus | 'off','I','II','I+II','ENS','BREIT' | 'off' |
| | `chorus.rate`, `.depth`, `.mix` | Tempo (× mode rate), Tiefe (×), Mischung | .25–4 exp, 0–2, 0–1 | 1, 1, 1 |
| | `rev`, `dly` | Hall, Echo (sends) | 0–1 | .15, 0 |
| | `pump`, `pumpRel` | Pumpen, Release | 0–1; '1/16','1/8','1/4' | 0, '1/8' |
| | `vol`, `pan` | Lautstärke, Panorama | 0–1 (gain = vol²), −1…1 | .8, 0 |

Chorus modes (measured Juno values): I = 0.513 Hz, 1.66–5.35 ms, right line inverted; II = 0.863 Hz; I+II = 9.75 Hz, 3.3–3.7 ms mono; ENS = 3 lines at 0/120/240°; BREIT = 0.25 Hz with anti-phase cross-mix. Each has a 9 kHz BBD low-pass on the wet signal. Mix 1 = Juno (dry + wet equal).

### 8.3 UI (FX tab of every editor; the global pages are shared)

Sub-tabs **SPUR · CHORUS · HALL · ECHO · MASTER**. HALL, ECHO and MASTER carry the caption „GLOBAL – wirkt auf alle Spuren“.

| Page | Controls (reading order) |
|---|---|
| SPUR | knobs Drive, Hall, Echo, Lautstärke, Panorama, Pumpen · seg Pump-Release (1/16, 1/8, 1/4) · seg Bei Wechsel (Mitziehen/Halten; synths only) |
| CHORUS | seg mode (AUS, I, II, I+II, ENS., BREIT) · knobs Tempo, Tiefe, Mischung · line „Juno-60 Chorus I: 0,51 Hz“ |
| HALL | knobs Länge, Größe, Pre-Delay (ms; long-press menu = 1/64, 1/32, 1/16), Dämpfung, Bass-Cut, Ton, Bewegung, Breite, Rückweg, Pumpen · toggle EINFRIEREN · status „Hall: Worklet“ or „Hall: Faltung (vereinfacht)“ |
| ECHO | seg Modus · Zeit L and Zeit R as stepped knobs over the division list (R only in STEREO) · knobs Feedback (LED above 100 %), Low Cut, High Cut, Sättigung, Band-Leiern, Echo→Hall, Rückweg |
| MASTER | knobs Schwelle, Ratio, Attack, Release, Make-up, Drive, Lautstärke · seg Pump-Quelle · GR meter (bar, `AU.M.reductionDb()` read in rAF) · output peak LED |

P fits 3 rows of 4; L fits one row of ≤ 9 (HALL has 10 knobs plus a toggle, so in L the toggle and Pumpen go to the segment row). Menü → Klang keeps Master-Lautstärke as a shortcut to `master.vol`.

### 8.4 Data and migration

- `S.fxBus = {hall, echo, master, pumpSrc}` (§15) and `sound.fx` (§8.2).
- From v2: `settings.delayDiv` → `fxBus.echo.divL`; `settings.masterVol` → `master.vol`; track `fx.reverb/delay` → `fx.rev/dly` (values kept); the old 2.4 s convolver → hall decay 3.2 s.
- Extend `SQStore.normFx` with `pump` (0–1, default 0) and `pumpRel` (enum, default '1/8').

### 8.5 Tests

- [ ] FX1 Run `node fxresearch/tools/node-hall.mjs 48000` against the **extracted** hall source: mid-band T30 within ±15 % of the set decay for 2, 3, 8 and 20 s.
- [ ] FX2 Echo timing (offline, port `tools/bench.mjs`): an impulse in each mode → repeats within ±2 frames of k·T for k = 1…8. Feedback 1.1 stays bounded (peak < .6 after 20 s).
- [ ] FX3 Chorus I: left delay sweeps 1.66–5.35 ms; left + right delay constant (±0.02 ms).
- [ ] FX4 Master: +12 dB input → output peak ≤ .98. `FX.autoMakeupDb(-16,2,8)` equals the measured compressor gain below threshold (±0.2 dB).
- [ ] FX5 No long task > 50 ms while turning hall knobs (worklet mode); in convolution mode the IR rebuild happens only on pointerup.
- [ ] FX6 Metronome click and a kick on the same beat leave the master within 1 ms of each other (they were 6 ms apart).
- [ ] FX7 Pump 0.6 on Synth 3 with a kick on each beat: Synth 3's RMS dips ≥ 6 dB 20 ms after each kick; after stop the duck returns to 1 within 100 ms.
- [ ] FX8 Synced LFO phase error < 1° after a BPM change 120 → 90 (`node fxresearch/tools/test-lfo.cjs` logic, adapted).
- [ ] FX9 The old acceptance tests B2 (clicks in `noteLog`) and G4/G6 (export) still pass. `meter()` returns RMS > −40 dBFS for `audition`.
- [ ] FX10 With the worklet blocked, the hall falls back to convolution: `runtime().engine.hall === 'convolver'`, and the hall send is audible.

---

## 9. Modulation (topic 7; engine in WP3/WP4, UX in WP5)

### 9.1 Sources

Every synth sound has **LFO 1, LFO 2** (shapes ∿ ∧ ⟋ ⊓ S&H; FREI in Hz or TAKT in divisions; Start FREI = song-locked phase, NOTE = per voice; Einblenden) and **Hüllk. 2** (the mod ADSR). Further sources:

| id | UI | colour token | polarity |
|---|---|---|---|
| `lfo1` | LFO 1 | `--m-lfo1:#b9f227` | bipolar |
| `lfo2` | LFO 2 | `--m-lfo2:#ff8a3d` | bipolar |
| `menv` | Hüllk. 2 | `--m-menv:#ffe14d` | unipolar |
| `vel` | Anschlag | `--m-vel:#f4f1ea` | unipolar |
| `fenv` | Filt.-Hk. | `--m-fenv:#d8c49a` (**not amber**: amber is reserved for transposition) | unipolar |
| `key` | Tonhöhe | `--m-key:#c9a7ff` | bipolar ((note−60)/24) |
| `rnd` | Zufall | `--m-rnd:#8fd3c7` | bipolar (per note) |
| `mw` | Mod-Rad | `--m-mw:#aab4c3` | unipolar (the `mw` knob) |
| `aenv` | Lautst.-Hk. | `--m-aenv:#d1d5db` | unipolar |

### 9.2 Destinations, units and storage (Entscheidung)

`sound.mods = [{src, dst, amt}]`, max **8** per sound. `amt` is stored in **engine units**, as the factory library does, so files map 1:1 to the worklet (`SQ_FACTORY.toEngineMods`). The UI shows and edits **knob units** (1.0 = the full knob range): `knob = engine / K[dst]`. Clamp the engine value to ±1.

| dst | knob it rings on | engine meaning of amt 1.0 | K | available on |
|---|---|---|---|---|
| `pitch` | (matrix only) „Tonhöhe“ | ±24 HT | 1 | worklet VA/FM; native (LFO only) |
| `o2pitch` | OSZ 2 HT | 24 HT | 1 | worklet VA |
| `cutoff` | Cutoff | 120 HT | 0.9966 | worklet; native (LFO only) |
| `res` | Resonanz | +1.0 res | 1.15 | worklet |
| `drive` | Drive | +1.0 | 1 | worklet |
| `pw` | PW (all osc) | ±0.45 | 2 | worklet VA |
| `o1lvl o2lvl o3lvl` | Pegel / MIX faders | +1.0 | 1 | worklet VA |
| `noise` | Rauschen | +1.0 | 1 | worklet VA |
| `unidet` | Uni-Verstimm. | +1.0 | 1 | worklet VA |
| `fenv` | Hüllk.-Menge | +1.0 (±72 HT) | 2 | worklet |
| `amp` | (matrix only) „Lautstärke“ | +100 % | 1 | worklet; native (LFO only) |
| `pan` | (matrix only) „Stimmen-Panorama“ | +1.0 | 2 | worklet; native (LFO only, track pan) |
| `fmbright` | Helligkeit | +24 dB on modulators | 2 | worklet FM |
| `op1`…`op6` | operator faders | +99 OL steps | 1 | worklet FM |
| *(P1)* `fx.rev fx.dly fx.pan fx.vol` | SPUR knobs | knob units | 1 | all synth tracks, sources LFO 1/2 only (§9.6) |

- Because the engine value is clamped to ±1, the depth in knob units is limited to ±1/K: the depth drag and the matrix slider stop at ±50 % for PW, Hüllk.-Menge, Stimmen-Panorama and Helligkeit, and at ±87 % for Resonanz. The slider shows that limit as a darker end zone.
- Extend the `SQStore` lists `MOD_DST` and `normMods` with these ids, and allow mods for every synth engine (not only analog).
- Unknown ids are dropped on load.
- `SQ_FACTORY.toEngineMods` gets the new ids: `fmbright 15`, `op1 16` … `op6 21`.

### 9.3 UI

**Rings on knobs and faders** (`modux/modknob-lab.html` is the reference implementation, screenshot-verified):
- The base value arc is r=22 in the track colour (bipolar knobs draw from the centre).
- The **modulation range ring** is r=26.5, stroke 2.5, in the colour of the route with the largest |amt|. In mod mode it shows only the active source. The range = base + the sum of route intervals: a bipolar source gives ±|amt|, a unipolar one [min(0,amt), max(0,amt)]. The part beyond the knob range is drawn at 35 % opacity.
- A live dot with a halo rides the ring at the modulated value (≈ 30 fps).
- Small source dots ●● sit under the value text.
- All arcs are drawn as fixed 270° paths with `stroke-dasharray/-dashoffset` **attributes**; never rebuild `d` per frame. No CSS filter on animated SVG.
- The LCD line shows the range in real units: „CUTOFF 1,20 kHz ↕ 213 Hz … 6,75 kHz“.

**Hold to modulate (knob-first):**
- Long-press a modulatable knob or fader (450 ms, slop 4 px). A progress ring shows from 150 to 450 ms. The source picker opens **above** the knob (clamped 8 px into the viewport).
- Row 1 (chips 52 px): LFO 1 · LFO 2 · Hüllk. 2 · Anschlag. Each chip shows the existing depth.
- Row 2 (36 px): Filt.-Hk. · Tonhöhe · Zufall · Mod-Rad · ↺ Std. · ✕ n (removes all mods of this knob).
- Slide onto a chip and lift = choose (expert path; track the chip with `document.elementFromPoint`). Lift in place = the picker stays open; tap a chip (novice path).
- The backdrop swallows the outside tap. `pointercancel` closes the picker.
- For non-modulatable controls the picker shows only ↺ Std. and the line „<Param> ist nicht modulierbar“. FX knobs show only LFO 1/2 with the note „nur LFO“.
- Choosing a source enters **mod mode**.

**Mod mode (source-first is also possible):**
- Entry: the picker, or a tap on a source chip in the MOD tab's source strip.
- Look: `body[data-mod=src]`. The banner overlays the LCD line: „LFO 1 moduliert“ / „Regler ziehen = Tiefe · doppelt tippen = weg“ + [Fertig]. Modulatable knobs get a dashed ring in the source colour; every non-modulatable control gets opacity .3 and `pointer-events:none`.
- A vertical drag on a knob sets that source's depth: −1…+1 knob units, 200 px per unit, 12 px sticky zero. The route is created on the first movement; a route at 0 is removed on lift. Tap = focus. Long-press = switch source. Double tap = remove the route (undo toast).
- Exit: [Fertig], Esc, tapping the same source chip, or closing the sheet. Mod mode persists across tabs and sub-tabs.
- More than 8 routes → toast „Maximal 8 Modulationen“.

**L layout:** the picker opens above the knob as in P (all chips in one 52 px row when space allows). The mod banner shares the 32 px tab row. In the MOD tab the source strip is a 36 px row and the matrix shows 3 rows at a time; the list scrolls on its label column.

**MOD tab:**
- **Source strip** (48 px, chips with live meters).
- **Matrix list** of up to 8 rows (48 px): [source chip with colour bar] [destination name + live range in real units] [bipolar slider −100…+100 %, centre detent, never jumps to the finger, half the width = full swing] [✕].
- **[+ Modulation]:** pick a source, then a destination from a list grouped OSZ / FILTER / AMP / FM / FX.
- **Empty state:** „Halte einen Regler gedrückt und wähle eine Quelle – oder tippe oben auf eine Quelle und ziehe dann Regler.“
- Rows are redrawn in place while a finger is on a slider; full rebuilds are deferred (`safeRebuild`).
- Unavailable routes (native path) are hatched and labelled „nur mit Worklet“.
- WP3 ships the list with [+ Modulation] and the slider. WP5 adds the source strip, live ranges, mod mode, picker, rings and the coach toast „Tipp: Regler halten = modulieren“ (once, after the first knob drag).

### 9.4 Live values

- The host sends `{scope:true}` while the editor of a worklet track is open (`false` on close or track switch).
- The worklet posts `{scope:[NSRC values], t, nv}` at ~30 Hz for the focus voice (the newest gated voice, else the newest sounding one). With no voice sounding it posts the global LFO 1/2 values, so the dots move while editing silently.
- The UI computes each knob's offset from the routes.
- Native path: LFO values from `lfoAt()` (copy the function from `fxresearch/fx-lfo-worklet.js`) on `ctx.currentTime`; envelope and velocity sources read as 0.
- Update the dots in `uiFrame` at ≤ 30 fps, only for visible knobs with routes.

### 9.5 Native subset (WT, legacy FM, worklet fallback)

Routes with source `lfo1`/`lfo2` and destination `pitch`, `cutoff`, `amp` or `pan` work (§5.5). Everything else is stored and shown, hatched, but not applied.

### 9.6 *(P1)* FX destinations

Per synth track and per LFO used by an `fx.*` route, create one `FX.TempoLFO` with the same shape and rate/division. It runs FREI (song-locked phase) even if the LFO is set to NOTE. Route it through `GainNode(amt · span)` to `revSend.gain`, `dlySend.gain`, `pan.pan` or `trem.gain`. A gain target may swing below 0; the ring shows that part dimmed. Create the LFO on the first route and stop and disconnect it with the last one.

### 9.7 Tests

- [ ] MO1–MO45 Port `modux/test-modknob.mjs` against the app's synth editor (390×844, CDP touch): tap = no change; exact slop; no scroll; one undo per gesture; fine via side offset and via a resting finger; two knobs at full speed; long-press → slide → mod mode; depth and zero detent; non-modulatable controls inert; sticky picker; the outside tap is swallowed; double-tap reset + undo; touchcancel and blur cleanup; the matrix slider does not jump and is not rebuilt under the finger; 12 animated routes stay ≥ 55 fps.
- [ ] MO46 Audible: route `lfo1→cutoff` amt .3 with LFO 1 at 2 Hz → the master spectral centroid oscillates (max/min > 1.5 over 2 s).
- [ ] MO47 Ring = sound: with scope on and a sustained note, the dot's normalized position matches the worklet's modulated cutoff (from a debug `{scopeDst}` reply or an offline render) within 2 %.
- [ ] MO48 Routes survive sound save/load and the project round-trip; `pw` routes from factory presets show half-range rings (K = 2).
- [ ] MO49 Native fallback: `lfo2→pitch` on Mini-Lead gives vibrato (pitch deviation ≥ 5 ct); a `vel→cutoff` row shows „nur mit Worklet“.

---

## 10. Controls, haptic feel, no locking, undo (topic 8, WP1)

### 10.1 Knob v2 (replaces `makeKnob`; reference `modux/modknob-lab.html`, sketch 2 in its code)

- **State machine** DOWN → DRAG | PICK | TAP:
  - **DOWN:** pointer capture, class `press` in the same frame, long-press timer 450 ms.
  - **DRAG:** after ≥ 4 px movement on any axis. Subtract exactly the slop; never drop the first move event.
  - **PICK:** 450 ms without movement → the picker (WP1: only „↺ Standardwert“ and the not-modulatable hint; WP5: sources).
  - **TAP:** pointerup without movement; a tap **never edits**.
- **Value mapping:** vertical only (the old knob summed dx+dy, which is wrong now); 200 px = full range; incremental travel clamped to the range, so reversing responds at once.
  - Stepped: px per step = `clamp(200/(n−1), 18, 40)`.
  - Bipolar parameters and depth have a sticky centre/zero detent of 12 px of dead travel, mapped in travel space (`travel()` in the lab), disabled in fine mode.
  - No acceleration.
- **Double tap** (< 300 ms, < 6 px) = default, plus the toast „<Param> zurückgesetzt“ with [Rückgängig].
- **Desktop:** wheel ±1 % (Shift ±10 %), arrow keys, right-click or the M key = picker. `role=slider` with `aria-valuetext` including routes („Cutoff 1,20 kHz, moduliert: LFO 1 +25 %“).
- **Value bubble:** `position:fixed` **above** the knob (the thumb covers what is below it).
- **Faders** use the same machine. Travel = the visible fader length (P 120 px, L 80 px), relative (a tap on the track never jumps). Value bubble beside the cap.

### 10.2 Fine mode (replaces "hold still 500 ms" and "any second pointer on the sheet")

- Horizontal offset from the touch-down point while dragging: |dx| < 64 px → ×1, 64–140 → ×¼, > 140 → ×1/16.
- **Or** a second finger resting on an **empty** panel spot (class `.rest`) → at least ×¼.
- Fingers on other controls **never** count. This fixes the current bug where two knobs turned at once both run at ×0.2 (`fine = … || ED.sheetPtrs > 1`; confirmed by `modux/verify-build-twofinger.mjs`).
- Re-anchor the travel from the current value whenever the factor changes. Show the pill „FEIN ×¼“ on the knob.

### 10.3 One gesture, one meaning, across the app

- Long-press is used only for: knob or fader → modulation picker; clip → clip sheet; ● → REC options; transport-segment momentary (old); Träger chip → delete (song).
- The envelope editor's "hold still = fine" is replaced by the §10.2 rules.
- The step grid, piano roll and XY pad have **no** long-press actions.
- Long-press timings: 450 ms with 4 px slop (knobs) or 8 px slop (clips, buttons).

### 10.4 Undo / redo for every edit

- `UNDO` entries: `{kind:'clip'|'sound'|'song'|'fx'|'kit', track?, scene?, before, label, time}`.
- **Sound:** snapshot `{sound}` (JSON of `track.sound`) at pointerdown; at pointerup commit only if it changed. This gives one entry per gesture, for value edits and route edits alike.
- **fx** = `S.fxBus` snapshot; **song** = `S.song` snapshot; **kit** = drum `sound.p.kit`.
- 60 entries. `undo()` pushes the current state to `REDO`; any new entry clears `REDO`.
- UI:
  - ↶ in the track strip.
  - ↶ ↷ in every editor header.
  - After an undo, the toast „Rückgängig: <label>“ with [↷ Wiederholen].
  - Every destructive one-tap action (double-tap reset, route ✕, „✕ n“, delete sound, clear clip) shows a [Rückgängig] toast.
- Applying a sound undo: replace `track.sound`, then `applySound(i, sound)` (Anhang D.11) and `safeRebuild(openEditor)`.
- Recording blocks undo, as before („Erst Aufnahme beenden“).

### 10.5 Nothing ever locks up (gesture registry)

Port sketch 1 of the lab (`GEST`, `RESTPTR`, `gestBegin/gestEnd`, `safeRebuild`, `guardTouch`):
- Every pointer gesture registers an abort callback keyed by `pointerId`. The control handles `pointerup / pointercancel / lostpointercapture`.
- A window-level bubble-phase `pointerup/pointercancel` aborts any gesture still registered.
- `blur`, `visibilitychange(hidden)` and `pagehide` abort all gestures and release all live inputs (as today).
- DOM rebuilds (preset load, engine switch, tab change, matrix rebuild, undo) go through `safeRebuild()`, deferred until no gesture is active, so a finger never loses its element.
- Every sheet has [✕], and Escape closes it. No modal stays without a close. No `confirm`.

### 10.6 Haptics (optional) and visual "haptics" (always)

- **Visual feedback, in the same frame as the event:**
  - press: scale .95 and a darker cap
  - long-press progress ring (150–450 ms)
  - armed pop: scale 1.08
  - detent pulse at zero or centre
  - lit tick marks for stepped values
  - pads and steps flash on hit
- `haptic(kind)` (kinds `tick`, `snap`, `pop`):
  - Uses `navigator.vibrate(6|10|14)` when it exists (Android).
  - On iOS ≥ 18 it clicks a hidden `<label>` of an `<input type=checkbox switch>`, **only inside pointerdown/pointerup handlers** (transient activation; WebKit bug 285120; reportedly closed in iOS 26.5 — fails silently). "Hidden" means rendered but invisible (`position:fixed; left:0; bottom:0; width:1px; height:1px; opacity:.01; pointer-events:none`), **not** `display:none` or `visibility:hidden` — WebKit does not fire the switch haptic for unrendered controls. Throttle to ≥ 30 ms between ticks.
  - The hidden nodes carry `data-haptic`. The long-press click guard (`UI.lpGuard`) must ignore events whose target is inside `[data-haptic]`; otherwise the synthetic click consumes the guard and the real ghost click hits the control underneath.
  - Setting Menü → Bedienung → **Haptik** (default an).
- Haptic moments: detents (HT, Fein, centre, zero), step toggles, a clip stop being queued, a note snapping to a new row, the length handle crossing a bar line, picker choice.

### 10.7 Tests (WP1)

- [ ] KN1 Tap on a knob → no value change, no undo entry; 3 px move → no change; 5 px → change of exactly (5−4)/200 of the range.
- [ ] KN2 Two knobs dragged 60 px at the same time → both change by 0.30 (±.01) of their range (regression for the bug).
- [ ] KN3 Fine: vertical 60 px with 100 px side offset → change 0.075 (±.01); resting finger on `.rest` + 60 px → 0.075.
- [ ] KN4 Double tap → default + toast with [Rückgängig]; [Rückgängig] restores the old value.
- [ ] KN5 1.2 s long-press (CDP touch) on knob, key, pad, step, clip, piano-roll canvas and an empty panel → no text selection (`getSelection().toString() === ''`), no `contextmenu` default, no page scroll (`scrollY` unchanged), no zoom (`visualViewport.scale === 1`).
- [ ] KN6 `touchcancel` mid-drag and `blur` mid-drag → no gesture left in `GEST`, values stay at the last applied value, one undo entry.
- [ ] KN7 Undo/redo: knob drag → `undo()` restores the sound (deep-equal) → `redo()` reapplies → a new drag clears redo.
- [ ] KN8 Every sheet closes via ✕ and via Escape; the popover backdrop tap does not change the control below.

---

## 11. Preset library (topic 9)

### 11.1 Contents (factory, read-only)

| Category (chip) | Sounds | Engine | WP |
|---|---|---|---|
| Bass | Moog-Bass, Sub-Bass, Acid 303, Synthpop-Bass, Gummi-Bass | VA | WP3 |
| Lead | Mini-Lead, Sync-Lead, Supersaw-Hymne, Puls-Lead, Pfeif-Lead | VA | WP3 |
| Poly & Brass | OB-Brass, Prophet-Poly, Juno-Streicher, Ensemble-Streicher, Poly-Stab | VA | WP3 |
| Fläche | Juno-Pad, PWM-Fläche, Rom-Fläche, Äther, Weite 82, Kristall-Fläche, Samtpolster | VA | WP3 |
| Pluck & Keys | Glas-Pluck, Pop-Pluck, Analog-Harfe | VA | WP3 |
| Sequenz (wet, squeaky filter sequences) | Moroder-Puls, Pfeif-Sequenz, Nass & Quietsch, Berlin-Schule, Tropfen | VA | WP3 |
| FM | DX-Tines E-Piano, Glas-EP, Pop-Bass DX, Solid-Bass, FM-Pluck, FM-Orgel, DX-Brass | FM6 | WP7 |
| Glocken | Röhrenglocke, Kristallglocke, Marimba-Holz, Kalimba, Glocken-Fläche | FM6 | WP7 |
| WT (klassisch) | WT Vokal-Fläche, WT Glas, WT Orgel, WT Digital (built from the v2 Pad/Glocke/Brass/Lead WT blocks, Anhang B.3) | WT | WP3 |
| Drums | 808, 909, Rom Pop, Gated 84, FM Labor, Disko 85, Resonanz-Perc (+ every kit slot as a single drum voice in [Sound laden]) | Drum | WP6 |
| Eigene | the user library | any | WP3 |

The source of truth for every value is `presetlib/presets-factory.js`. Anhang B lists the concrete parameters. Each record has a German name, a category, a **Vorbild** (reference instrument) and a **Trick** sentence that teaches the idea, for example: „Für Quietschen: Oszillatoren leiser, Resonanz hoch, Grit erst nach dem Filter“. It also carries mod routes, track fx and an optional `bus` hint.

**Measured facts to keep when integrating** (do not "fix" them by ear):
- All analog sounds are calibrated to −18 LUFS on their preview phrase. That is why `level` reaches up to 3.54 (Nass & Quietsch).
- The ladder self-oscillates only **above** res 1.0 and runs flat (−7 ct at 1.02). Pfeif-Lead therefore sets cutoff 525.4 Hz (= C5 + 7 ct) with keytrack 100 %, measured within ±1 ct from C3 to C5.
- Resonant sounds need a low oscillator sum (≈ .3–.6), bass ≤ .3 and filter drive ≤ .2 to reach +12…+25 dB of resonance. Grit goes after the filter (track drive).
- FM sounds use `common.gain` −1.6…−15.7 dB (an output operator at OL 99 is full scale per voice).

Everything was calibrated by measurement only. Before release, someone must **listen** to the renders in `presetlib/wav/`, `analog-research/wav/` and `drumresearch/wav/`. Tuning by ear is a follow-up task for the user and not part of the build.

**Objective quality gates** (the user asked for „fett und einzigartig“; the builders cannot listen, so these measurable proxies are binding; run them on the worklet path with the preset's own fx, offline at 48 kHz, preview phrase at 120 BPM):

| Category | Gate |
|---|---|
| all | no NaN; no DC offset > .005; true peak of a 4-note chord (or the phrase) at velocity 1 ≤ −1 dBFS after the master; no click > −40 dBFS at note start/end of a 1-note phrase (100 Hz HP, 2 ms window) |
| Bass | ≥ 55 % of the energy below 250 Hz; level after a 220 Hz 24 dB/oct HP (phone speaker proxy) within 12 dB of the full-band level (audible on a phone) |
| Fläche, Poly & Brass | L/R correlation ≤ .85 (wide); RMS ripple of a held chord after the attack ≤ 3 dB (smooth, no pumping); release tail reaches −60 dB no sooner than 0.8·`aR` |
| Sequenz | for presets with `res ≥ .8`: the resonance peak in the spectrum of a 1/16 phrase is ≥ 12 dB above the neighbouring ⅓ octaves (it "whistles") **and** the energy above 4 kHz is ≤ 25 % of the total (it whistles musically, it does not pierce) |
| Lead | the fundamental tracks the played note within ±10 ct from C3 to C6 |
| FM | the attack spectrum (30 ms) has a centroid ≥ 1.5× the sustain centroid (600 ms) for E-pianos and bells (the "tine" bite) |
| Drums | DR1/DR9 (§7.7) |

A preset that fails a gate is fixed in `presets-factory.js` (with a note in `CHANGES-WPn.md`), never by changing the gate.

### 11.2 Sound browser — UI

```
P (sheet 374×489)                                   L (sheet ≈ 750×215)
┌──────────────────────────────────────────────┐  ┌──────────┬───────────────────────────────────────┐
│ SOUNDS · SYNTH 1                         [✕] │  │Alle      │ ▶ Moog-Bass   Minimoog Model D  VA ⋯│
│[Alle][Bass][Lead][Poly][Fläche][Pluck][Seq]→ │  │Bass    ● │ ▶ Sub-Bass    Moog Taurus       VA  │
├──────────────────────────────────────────────┤  │Lead      │ ▶ Acid 303    Roland TB-303     VA  │
│ ▶ Moog-Bass          Minimoog Model D  VA  ⋯ │  │Poly      │ …                                    │
│   ⓘ Drei Oszillatoren, Filter fast zu …      │  │Fläche    │                                      │
│ ▶ Sub-Bass           Moog Taurus       VA    │  │…         │                                      │
│ ▶ Acid 303           Roland TB-303     VA    │  │Eigene    │ [Sichern] [Import] [Export] [Hall wie │
│ …                                            │  └──────────┴───────────────────────────────────────┘
├──────────────────────────────────────────────┤
│ [Sichern] [Importieren] [Exportieren]        │
└──────────────────────────────────────────────┘
```

- P: the category chips scroll horizontally (`touch-action:pan-x`) and the list vertically (`pan-y`). L: categories in a left column of 120 px.
- A row is 48 px: ▶ (preview) · name (bold) · Vorbild (dim) · engine badge · ⋯ (actions: user sounds only).
- The ⓘ line expands the Trick text (tap on the row's right half).
- The loaded sound is outlined. The „geändert“ dot shows in the header.
- Drum track: the categories are „Kits“ and „Eigene Kits“; [Sound laden] in the SOUND tab lists single instruments.

### 11.3 Bedienung

- **Tap a row** = load it onto the track (one undo step, `kind:'sound'`) **and** play the category's preview phrase.
  - Preview: `SQ_FACTORY.PREVIEW[demo]`, transposed to the project key root (nearest octave), at the current BPM, through the track's chain as preview voices (`src:'preview'`, logged as such).
  - It stops on the next row tap, on close or on any key press.
  - It never touches the transport or the clips. With the transport running it plays over the music (the user hears the sound in context).
  - Drum kits preview the „Rom Pop“ pattern for 1 bar.
- **▶ alone** previews without loading.
- **Bus hint chip** „Hall/Echo wie im Preset“ appears after loading a sound that has `bus`. Tap = apply to `S.fxBus` (one undo, `kind:'fx'`).
- **Sichern** (header button or browser footer):
  - If the track's sound came from a user sound: two buttons [Überschreiben] [Als neu].
  - Otherwise save directly as new, with the name prefilled and made unique („Rom-Fläche 2“) in an inline text input (16 px font, no zoom).
  - `SQStore.Library.save` assigns the `u-…` id. The track's `sound.origin` becomes that id.
- **⋯ on own sounds:** Umbenennen (inline), Duplizieren, Exportieren (single sound .json), Löschen.
  - Delete is **immediate** with the 5 s toast [Rückgängig] (`Library.remove/restore`). Never a blocking confirm.
- **Exportieren** (footer): „Alle eigenen Sounds“ → a sounds file `synquenzer-sounds-…json` via §12.2.
- **Importieren** opens the file picker: a sounds file or single sound → `Library.importMany` (hash dedupe; id clash → new id; name clash → „Name 2“) and the toast „12 Sounds importiert, 3 schon vorhanden“. A project file opened here imports only its library sounds.
- **A/B:** while the sound is „geändert“, [A/B] appears next to the dot. It toggles between the edited sound and its origin (the edited state is kept in memory until the next load). Not persisted.
- **Edited detection:** `SQStore.soundHash(track.sound) !== soundHash(origin)`.

### 11.4 Data

- A track owns a **copy** of its sound. Library operations never touch tracks.
- The user library is stored under the KV key `lib`, and the full library is embedded in every project file (§12).
- The factory library is code (`SQ_FACTORY`), materialized on load (`soundFromFactory` + FM conversion §6.7 + WT records of Anhang B.3). It is never stored. Only `origin: 'f-…'` points to it.

### 11.5 Tests

- [ ] PR1 Every factory sound loads onto the matching track kind and sounds: RMS of the preview phrase > −40 dBFS, no NaN in the meter. Worklet path: loudness −18 ± 3 LUFS for analog (offline harness `presetlib/harness.mjs` against the extracted worklet).
- [ ] PR2 Save → appears under „Eigene“; reload page → still there (IndexedDB); export all → import into a clean profile → identical hashes; importing twice skips all as duplicates.
- [ ] PR3 Delete → gone; [Rückgängig] within 5 s → back with the same id.
- [ ] PR4 Overwrite keeps the id and creation time and changes `mt`; „Als neu“ creates „Name 2“.
- [ ] PR5 Loading a preset while notes sound: no click above −40 dBFS (sounding voices continue with the new params in the worklet; the native path fades them out in 20 ms).
- [ ] PR6 The bus hint applies only on tap and is undoable.
- [ ] PR7 The browser list scrolls with one finger without changing anything; tapping a category chip never loads a sound.
- [ ] PR8 Every factory sound passes the quality gates of §11.1 (script `tools/preset-gates.mjs` in the scratchpad, reusing `presetlib/harness.mjs`).

---

## 12. Project files and saving (topic 10)

### 12.1 Formats (all JSON, all versioned; SQStore is the implementation)

| File | Shape | Name |
|---|---|---|
| Project | `{app:'SYNQUENZER', kind:'project', format:3, saved, appVersion:'3.0.0', sum, project, sounds:[…library]}` | `synquenzer-<name>-YYYY-MM-DD-HHMM.json` |
| Sounds | `{app:'SYNQUENZER', kind:'sounds', format:1, saved, sounds:[…]}` | `synquenzer-sounds-<name>-….json` |
| Single sound | a bare Sound record `{$:'snd', …}` | `synquenzer-sound-<name>-….json` |
| Legacy | `{app:'DIRIGENT', format:2, project}`, a raw v2 project, a raw v1 object | read only |

- `sum` = FNV-1a over `JSON.stringify(project)`. A mismatch gives a warning toast but still loads.
- Notes are stored compact as `[t, d, n, v]` plus an optional object for extra fields (see below), via `packClipNotes`.
- A file from a newer format is read best-effort with the warning „Projekt aus einer neueren Version …“.
- **Compact notes with extra fields (Entscheidung):** a note that has any of `o, a, p, r, m, lk` is stored as `[t, d, n, v, {o?, a?, p?, r?, m?, lk?}]`. Extend `packClipNotes/unpackClipNotes` accordingly; the research version drops these fields.

### 12.2 Save, open, export, import (Menü → Projekt)

The menu (≡) stays a full-screen sheet. P: sections stacked (Projekt, Sounds, MIDI-Export, Harmonie, Aufnahme, Klang, Bedienung, MIDI-Eingang, Hilfe, Info), scrolling vertically. It contains no knobs, only buttons, segments and inputs. L: two columns (Projekt/Sounds/Hilfe/Info left, settings right).


- **[Als Datei sichern]:**
  - `const dl = await window.claude?.use?.('downloads')` — lazily, on the click, never on load.
  - If present: `dl.save({filename, data: new Blob([text], {type:'application/json'})})`. A rejection with code `declined/cancel/abort` stays silent; anything else shows the toast „Export fehlgeschlagen: <code>“.
  - Else, on touch devices with `navigator.canShare({files})`: the share sheet.
  - Else: `<a download>` plus a visible „⬇ dateiname“ link in the menu for 30 s (`§old-12.3` `deliver()`).
  - Afterwards: `Autosave.markSaved()` (history snapshot), `SQStore.requestPersist()` on the first explicit save (show the result in Info), and remember `lastExport`.
- **[Datei öffnen]:** a hidden `<input type=file accept=".json,application/json">` → `SQStore.parseFile(text, {migrateV1, normalizeProject})`.
  - A project → the current project is parked in [Projekte] (no confirm needed; toast „Vorheriges Projekt liegt unter Projekte“) → `applyProject` + `Library.importMany(file.sounds)` + warnings as toasts. Only with `kv.mode === 'memory'`: in-page two-step confirm „Aktuelles Projekt ersetzen?“ [Ersetzen] [Abbrechen] first.
  - Sounds → import into the library.
  - Errors → toast with the reason.
- **[Ältere Versionen]:** a list of the history snapshots („heute 21:40“, „gestern 18:02“ …). Tap → two-step confirm → load (the current state first becomes a snapshot).
- **[Projekte]** („alles an einem Platz“): a list of all projects kept in the browser, newest first (48 px rows: name, „vor 2 Tagen“, length in bars, the current one marked „offen“). Tap = open it. ⋯ = Umbenennen, Duplizieren, Als Datei sichern, Löschen (immediate, 5 s [Rückgängig] toast).
  - Storage: each project has `S.id` (random, created once). Index `projIndex = [{id, name, mt}]` in KV; each **parked** project is stored under `proj:<id>` (the serialized project file without the library). The open project lives in the autosave as before.
  - **Switching never loses work:** before [Neu], [Demo laden], [Datei öffnen] or opening another project, the current project is parked (`tickAhead(.3)` first, then the write). [Neu] and [Demo laden] therefore need no two-step confirm any more.
  - With `kv.mode === 'memory'` the list is disabled with the hint „Nur ein Projekt möglich – bitte ‚Als Datei sichern‘“, and [Neu] keeps its two-step confirm.
  - Quota: parked projects are kept until the user deletes them; on a quota error the history is dropped first (§12.4), then a toast names the largest parked project.
  - This replaces the old *(P1)* „Speicherplätze 1–4“ of the old menu (`§old-14`, Projekt).
- **Status line:** „Gespeichert vor 2 min · im Browser (IndexedDB)“, or the warning „Speichern im Browser nicht möglich – bitte ‚Als Datei sichern‘“ when `kv.mode === 'memory'`.
- **Reminder:** if the project has unsaved-to-file changes and `lastExport` is older than 7 days, show the toast „Projekt seit 7 Tagen nicht als Datei gesichert“ with [Sichern], at most once a day. Non-blocking.
- **MIDI export** (`§old-12`) is unchanged and adds the mode „Song“ *(P1)*. Filenames: `synquenzer-szene-1.mid` etc.

### 12.3 Required changes to `presetlib/preset-store.js`

1. `normalizeSound`: engines `'analog'|'fm6'|'wt'|'fm2'|'drum'`.
   - For every synth engine `p = normAnalog(p)` (full flat; the ranges `AN` are extended with `fmAmp [0,1,int], fmBright [-24,24], fmAtk/fmDec/fmRel [-30,30]`), and `Sound.ev = 2`.
   - `fm6` → `p.fm6 = normFm6(p.fm6)`; `wt` → `p.wt = {table ∈ digital|vocal|glas|orgel, pos 0–1, scan −1–1, scanTime .05–4}`; `fm2` → `p.fm2 = {ratio ∈ list, index 0–10, modDecay .01–4, modSus 0–1}`.
   - `mods` allowed for every synth engine.
   - `common` is accepted on input only and converted (§6.7).
2. `normDrum`: keep `kit = {gate .15–.6, gateLvl 0–8, room 0–4, accent 0–1, padVel 'pos'|'fix'}`.
3. `normFx`: add `pump` and `pumpRel`.
4. `MOD_SRC/MOD_DST/normMods`: §9.2 lists.
5. `migratePatchV2`: `wt` → wt sound, `fm` → fm2 sound (§5.6). FM6 conversion happens in WP7.
6. `migrateProject2to3`: additionally migrate settings (§12.6) and set clip `key.src` **only where it is missing** (WP2 builds already write it). It must not convert drum tracks before WP6 (gate it with a flag `opts.drums`). Keep every clip field written by WP2 (`o`, `q`, `seed`, `a`, `p`, `r`, `m`).
7. `packClipNotes/unpackClipNotes`: keep extra note fields (§12.1).
8. `buildProjectFile`: `appVersion '3.0.0'`. Runtime keys stripped: `born`, `bornRun`, `playing`, `_dirty`, `_audio`. **`o` is not runtime.**

### 12.4 Autosave and storage

- `const kv = SQStore.KV()` (IndexedDB database `synquenzer`, store `kv`; fallback localStorage with prefix `synquenzer.`; fallback memory) and `SQStore.Autosave({kv, getProject: () => S, onWarn: toast, …})`.
- **Stopped:** debounce 800 ms, max-wait 4 s. **Playing:** debounce 2 s, max-wait 20 s, and the write calls `tickAhead(.3)` before `JSON.stringify`. The serialization of a 250 KB project costs about 100 ms on an iPhone, and the 300 ms horizon covers it.
- `autosave.install()` writes a synchronous localStorage **rescue copy** on `pagehide` and `visibilitychange(hidden)`. On start the newer of {KV project, rescue} wins.
- **History ring:** 12 snapshots (one per 10 min of editing, plus every explicit file save).
- **Quota:** drop the history, retry once, then the single toast pointing to „Als Datei sichern“.
- `markDirty()` is called on every project mutation (it only marks; never serialize per knob tick).
- UI prefs stay in localStorage `synquenzer.ui` via `safeGet/safeSet` (hint and coach flags, last tab, haptics).
- **Every** storage access (IndexedDB open/transactions, `localStorage.getItem/setItem/removeItem`, `navigator.storage.persist`) is wrapped in try/catch, as `SQStore.KV` already does. The app must run fully with all storage throwing (old test A3).

### 12.5 Start-up load order

1. `await kv.ready`; `await lib.load()`.
2. `autosave.load()` → the newer of project and rescue → `normalizeProject`.
3. Else `safeGet('dirigent.v2')` → format 2 → `migrateProject2to3` → toast „Projekt aus DIRIGENT übernommen“.
4. Else `safeGet('dirigent.v1')` → `migrateV1` → 2→3 → toast „Projekt aus Version 1 übernommen“.
5. Else the **Demo** (§15.4).

The old keys are never deleted. While loading (≤ 1.5 s guard), show the old demo layout disabled with a small spinner on the TAKT display, never a blank screen.

### 12.6 Migration v2 → v3 (complete)

| v2 | v3 |
|---|---|
| `format: 2` | `format: 3` |
| `tracks[i].patch, preset, poly` | `tracks[i].sound` (§5.6); `poly` → `sound.p.poly` |
| drum `kit, voices, fx` | WP3–WP5: kept as is; WP6: `sound` via `migrateDrumsV2` |
| `settings.delayDiv`, `masterVol` | `fxBus.echo.divL`, `fxBus.master.vol` |
| `settings.inQuant` | kept (new projects: 'auto') |
| `settings.countIn` (bool) | 0/1 |
| `settings.harmony.single` | set to `'key'` once + toast (§4.1) |
| clip `key` | + `src` ('user' if ≠ project key, else 'auto') |
| (none) | `id` (new random), `fxBus` defaults, `song: null`, `ui: {selT, selS}`, `settings.haptics: true`, `settings.quality: 'auto'`, `settings.kbScale: 'show'`, `settings.coach: {}` |

### 12.7 Tests

- [ ] G1–G7 (old) pass. G3 now means `importJSON(serialize())` round-trips the v3 project deep-equal, including `o`, `q`, `seed`, `lk`, mods and fxBus.
- [ ] PF1 Reload with IndexedDB: the project and library are restored. With a newer rescue copy (simulate pagehide after an edit, then block IndexedDB writes), the rescue wins.
- [ ] PF2 Storage blocked entirely (`localStorage` and `indexedDB` throw): the app runs, `kv.mode === 'memory'`, exactly one warning toast, and file save still works.
- [ ] PF3 `downloads` stub: [Als Datei sichern] calls `save` once with a filename matching `/^synquenzer-.*\.json$/` and a Blob of type `application/json` whose parsed `kind === 'project'` and `sounds.length` equals the library size.
- [ ] PF4 Open a DIRIGENT format-2 file → a v3 project with `track.sound` on all synth tracks, the toast mentions DIRIGENT, and the clip notes are identical.
- [ ] PF5 Checksum mismatch → warning toast, project still loads.
- [ ] PF6 History: 3 explicit saves → 3 entries; restoring an entry replaces the project after the two-step confirm.
- [ ] PF7 A 10 240-note project with 40 library sounds: file ≤ 300 KB; `serialize()` ≤ 60 ms on the test machine; no audio dropout during autosave while playing (no long task > 50 ms in a trace).
- [ ] PF8 Projects: edit project A, [Neu], record a clip in B, open A from [Projekte] → A is deep-equal to its state before [Neu]; B is in the list; reload → both still there; delete B + [Rückgängig] → B back.

---

## 13. Branding: One Day in Rome logo (topic 11, WP1)

### 13.1 Asset

`scratchpad/logo/one_day_in_rome.svg` has two paths: white `#fff` lettering and the red `#c8261e` "1" mark, `viewBox="25 80 433 314"` (aspect 1.379). Embed it inline as `const LOGO_SVG` (the current build already holds it):
- `role="img" aria-label="One Day in Rome"`, `shape-rendering="geometricPrecision"`, `preserveAspectRatio="xMidYMid meet"`.
- No CSS `filter` (remove the current drop-shadow), no transforms on it or its ancestors, height in **integer CSS px**, width auto.
- It stays sharp at every device pixel ratio because it is vector and never rasterized.

### 13.2 Placements

| Where | Size | Behaviour |
|---|---|---|
| Top bar P, leftmost | 36 px high (50 px wide incl. padding) | inert (`pointer-events:none`); below 360 px viewport width it moves to the grid corner cell |
| Top bar L/W, leftmost | 34 px (L), 40 px (W) | inert |
| Menu header | 64 px | next to „SYNQUENZER 3.0“ and the line „Ein Instrument für One Day in Rome“ |
| App icon *(P1)* | 180×180 | at start-up render the SVG onto a canvas (background `#0d0e11`, logo 76 % wide, centred), then set the `apple-touch-icon` and `icon` hrefs to the PNG data URL; the static v1 icon stays as the fallback |

**Tasteful rules:** no animation, no glow, no colour change in TRANSPONIEREN mode, never over content. The red of the logo is the only brand colour. It does not replace `--rec` (recording red stays `#ff4538`).

### 13.3 Tests

- [ ] BR1 At 390×844 the top bar contains an inline `<svg aria-label="One Day in Rome">` with computed `filter: none`, an integer `height` and no transformed ancestor. At 320 px it is in the grid corner instead. No horizontal overflow at 320, 390 and 844 px.
- [ ] BR2 Screenshot at DPR 3: the logo's bounding box is ≥ 36 CSS px high in P and contains both colours (sampled pixels near `#c8261e` and `#ffffff`).
- [ ] BR3 The menu header shows the 64 px logo and the version.

---

## 14. Performance and voice management (topic 12)

### 14.1 Budget

| Resource | Target on iPhone 12 (A14), demo project playing with transposition | Measured proxy (Chromium, 2.8 GHz Xeon, one core) |
|---|---|---|
| Audio thread total | ≤ 45 % of real time (worklet load reports summed ≤ .45) | — |
| Synth worklet per track | ≤ 10 % typical | 4–9 % per track in real time; 40 voices: 13 % (2 osc ECO) … 31 % (7-voice stereo supersaw ANALOG) |
| FM6 voices | ≤ 1.5 % per voice | ≈ 0.65 % per voice (excl. node overhead) |
| Drums (busy groove) | ≤ 10 % | 3.7–6.5 % |
| FX scene (hall, echo, 2 chorus, master) | ≤ 8 % | hall worklet 1.0–1.4 %, chorus ≈ 1 % each; scene ≈ 10 % incl. 15 test oscillators |
| Main thread | scheduler tick p95 ≤ 4 ms; `uiFrame` p95 ≤ 6 ms; **no task > 50 ms while playing** | — |
| Memory | JS heap ≤ 120 MB after 10 min; `voices()` bounded (≤ 32 + drum tails) | — |
| Start | first gesture → audio running ≤ 300 ms; worklet ready ≤ 2.5 s (typically 20–40 ms); drum buffers lazily (≈ 80 ms, idle) | blob load 17–36 ms in a sandboxed iframe |
| File | `index.html` ≤ 1.5 MB | current 0.29 MB + modules ≈ 0.45 MB + new code |

### 14.2 Voice management

| Path | Polyphony | Stealing | End / cleanup |
|---|---|---|---|
| Synth worklet | `p.poly` 1–8 per track (POOL 12 slots absorb fades) | released voices first (lowest level), else the oldest; 96-sample fade; mono/legato = last-note priority with legato return | the worklet frees the voice and posts `{end:[ids]}`; the host proxy goes dead; GC safety net `stopAt + 1 s` |
| Native voices (WT, fallback) | `p.poly` per track; global native cap **24** | oldest released first, else the oldest; `release(t, .004)` | `onended` cleanup disconnects every node incl. LFO taps |
| FM in the worklet | `p.poly` default 8 | as above | DX end rule (§6.3) |
| Drums | monophonic per pad; choke groups | the new hit cuts the old one (τ 3 ms) | per-hit nodes disconnected on the last source end |
| Audition / preview | counts toward the track's poly | – | released after the phrase |

Live and audition voices are never transposed (`§old-4.6`); handles not pitches (`§old-7.4`).

### 14.3 CPU limiter (WP4)

Once per second, sum the `{load}` reports of the synth nodes. Thresholds and actions (hysteresis):

| Level | Condition | Action |
|---|---|---|
| 0 | default | patch values as set |
| 1 | load > .45 | `lq = 0` (ECO ladder) on tracks with poly > 1 |
| 2 | load > .60 | + unison capped at 3, poly ≤ 6, FM poly ≤ 6 |
| 3 | load > .75 | + poly ≤ 4, FM poly ≤ 4, badge **CPU** in the top bar |
| restore | load < .30 for 10 s | step back one level |

- The badge: in L/W an amber „CPU“ chip before ≡; in P the TAKT label „TAKT“ is replaced by an amber „CPU“ (the LEDs stay). A tap opens Menü → Info.
- The limiter changes only the worklet's working parameters (`E.set`), **never** the stored sound.
- Menü → Klang → **Qualität: Auto | Analog | Eco**. Analog = the limiter is disabled except level 3 (to protect against dropouts). Eco = level 2 permanently.

### 14.4 CPU-saving rules (binding)

1. Create nodes only when used: chorus insert (mode ≠ AUS), per-hit drive (`drv > .01`), native sub/noise/second filter only when needed.
2. No oversampled WaveShaper anywhere in the signal path (latency jumps, CPU even in silence).
3. Worklets sleep: the hall outputs zeros after 3 silent blocks; the synth worklet's idle path does no DSP when no voice is active. FM skips operators below the gain threshold; the FM filter bypass applies when open.
4. Coalesce knob → engine updates: one `E.set` per track per animation frame; AudioParam targets once per frame per parameter.
5. Scope only while the editor is open, ≤ 30 Hz. Animate only visible knobs that have routes. No `innerHTML` in the frame loop (`§old-16`).
6. Autosave, IR generation and big rebuilds call `tickAhead(.3)` first, then run sliced (≤ 8 ms slices) where possible.
7. Measure `loopExtra` and `compLatency` once per AudioContext.
8. When the page is hidden **and** the transport is stopped, `ctx.suspend()` after 30 s; resume on the next gesture (existing unlock code).
9. Menü → Klang → **Puffer: Interaktiv | Stabil** (`latencyHint 'interactive'|'playback'`). It takes effect at the next start of the app (the AudioContext is created once). Use Stabil for devices that crackle.
10. Never force `sampleRate`. Keep `navigator.audioSession.type = 'playback'`.

### 14.5 Tests

- [ ] PE1 10 s trace of the demo while transposing every 500 ms: no long task > 50 ms, tick p95 ≤ 4 ms, no forced synchronous layout in rAF (old H3).
- [ ] PE2 5 min of demo playback with random transpositions and preset changes every 20 s: `voices().length` ≤ 40 throughout, no growth trend; JS heap growth < 10 MB.
- [ ] PE3 The limiter fed fake load reports (.8 for 3 s): level 3, badge visible, worklet poly ≤ 4; then .2 for 12 s → level 2, … → back to 0.
- [ ] PE4 Idle with the transport stopped and the editor closed: summed load ≤ .02.

---

## 15. Data model v3 (complete)

### 15.1 Project

```js
Project = {
  format: 3, id: 'p-…' /*random, created once, §12.2 Projekte*/, name: 'Mein Projekt', bpm: 120 /*40..240*/, key: {root: 0, scale: 'ionian'},
  settings: {
    metro: false, metroVol: .6, metroInRec: true, countIn: 1 /*0|1|2 bars*/,
    recLength: 'auto' /*'auto'|1|2|4|8*/, inQuant: 'auto' /*'auto'|'off'|'1/4'|'1/8'|'1/8T'|'1/16'|'1/16T'|'1/32'*/,
    swing: 0 /*0..1, global*/, noteNames: 'intl' /*'intl'|'de'*/,
    harmony: {mode: 'chord', latch: true, change: 'now', octaveMode: 'nearest', single: 'key', minor: 'aeolian',
              keyAware: true, split: null, gatherMs: 40},
    kbScale: 'show' /*'show'|'lock'|'off'*/, haptics: true, quality: 'auto' /*'auto'|'analog'|'eco'*/, buffer: 'interactive',
    hintDismissed: false, coach: {trans: false, mod: false, fang: false}
  },
  scenes: [{name: 'Szene 1'}, {name: 'Szene 2'}, {name: 'Szene 3'}, {name: 'Szene 4'}],
  tracks: [SynthTrack, SynthTrack, SynthTrack, SynthTrack, DrumTrack],
  fxBus: {hall: {decay: 3.2, size: 1, predelay: '1/64', damp: 6500, lowcut: 90, tone: 12000, mod: .5, width: 1, freeze: false, ret: .8, pump: 0},
          echo: {mode: 'pp', divL: '1/8.', divR: '1/4', fb: .4, lowcut: 250, highcut: 4500, drive: .15, wow: .2, toHall: .15, ret: .8},
          master: {thr: -16, ratio: 2, knee: 8, attack: .02, release: .2, makeup: 1.5, drive: 0, vol: .85},
          pumpSrc: 'kick'},
  song: null | Song,                 // §3.9
  ui: {selT: 3, selS: 0}
}
SynthTrack = {kind: 'synth', name: 'Synth 1', color: 't1', follow: true, onChange: 'follow', mute: false, kbOct: 4,
              sound: Sound, clips: [Clip|null ×4]}
DrumTrack  = {kind: 'drum', name: 'Drums', color: 't5', mute: false, kbOct: 3, sound: Sound /*engine 'drum'*/, clips: [Clip|null ×4]}
              // WP3–WP5 only: {kind:'drum', kit, voices, fx, …} as in format 2
Clip = {len: 1..16, key: {root: 0..11, scale, src: 'auto'|'carrier'|'user'}, q?: {grid, swing, strength}, seed?: int /*drum clips*/,
        notes: [Note]}
Note = {t, d, n, v, o? /*raw onset, beats*/, a? /*accent*/, p? /*chance*/, r? /*ratchet 2..4*/, m? /*timing ±.45 step*/,
        lk? /*{tune, dec}*/}            // runtime only (never saved): born, bornRun
```

### 15.2 Sound

```js
Sound = {$: 'snd', v: 1, id: 'f-…'|'u-…'|null, name, cat /*bass|lead|poly|flaeche|pluck|sequenz|fm|glocke|wt|drums|eigene*/,
  engine: 'analog'|'fm6'|'wt'|'fm2'|'drum', ev: 2,
  p,            // synth: full flat patch (§5.1) [+ fm6 | wt | fm2 block]; drum: {base, slots, kit}
  mods: [{src, dst, amt}],          // ≤ 8, engine units (§9.2)
  fx: {drive, chorus: {mode, mix, rate, depth}, rev, dly, pump, pumpRel, vol, pan},
  bus?: {hall?: {…}, echo?: {…}},   // hint only (§8.1)
  origin: 'f-…'|'u-…'|null, tip?: string, ct, mt}
```

### 15.3 Defaults for new projects

- Synth 1 = **Moog-Bass** (VA, `kbOct 2`), Synth 2 = **Pop-Pluck** (VA), Synth 3 = **Rom-Fläche** (VA), Synth 4 = **Mini-Lead** (VA). Drums = **Rom Pop** (from WP6; before that the v2 909 kit).
- From WP7: Synth 2 = **FM-Pluck** (FM6).
- `fxBus` defaults as above.

### 15.4 Demo project

The clips and notes of `§old-13.4` stay **identical** (so the old acceptance tests that use the demo still hold), with the v3 sounds of §15.3 and the name „Demo“. All demo clip keys are `{0, 'ionian', src:'auto'}`; detection confirms C major for scene 1.

---

## 16. Test API v3 (`window.SYNQUENZER`, alias `window.DIRIGENT`)

Everything in `§old-15` stays, with `version: '3.0.0'`. `setParam/getParam` accept the flat keys **and** the legacy paths of Anhang C.1. Additions (all synchronous unless they return a Promise; all returns are deep clones):

```ts
// engine / diagnostics
engineInfo(): {synth: 'worklet'|'native'|'loading', how: 'blob'|'data'|null, err: string|null, hall: 'worklet'|'convolver',
               load: number, limiter: 0|1|2|3, perTrack: {voices: number, load: number}[], loopExtra: number, graphLat: number,
               storage: 'indexedDB'|'localStorage'|'memory'}
forceNative(on: boolean): void          // before ensureAudio(): never load the worklet (tests of the fallback)
cpuInject(load: number, seconds: number): void   // feeds the limiter (test only)
// sounds
getSound(t): Sound; setSound(t, sound: Sound): void /*undoable*/; loadPreset(t, idOrName): void; setEngine(t, 'va'|'fm'|'wt'): void
setParam(t, keyOrLegacyPath, value): any; getParam(t, keyOrLegacyPath): any; randomize(t): void
setFm(t, key: 'alg'|'fb'|'trans', v): void; setFmOp(t, op: 0..5, key, v): void; importSyx(bytes: Uint8Array): Promise<{added, skipped, names}>
mods(t): {src, dst, amt}[]; setMod(t, src, dst, amtKnobUnits): void; clearMods(t, dst?): void
library(): Sound[]; saveSound(t, name?, mode?: 'new'|'overwrite'): Promise<Sound>; deleteSound(id): Promise<void>; restoreSound(sound): Promise<void>
factory(): {id, name, cat, engine}[]; preview(t, id, on?: boolean): void
// drums
pad(slotIdOrGm, vel?): void; setDrumParam(slotId, key, value): void; loadKit(name): void; setKit(key, value): void
euclid(slotId, k, rot?, bar?): void; applyPattern(name): void
// fx
setBusFx(path: string /* 'hall.decay' etc. */, v): void; getBusFx(): FxBus; setTrackFx(t, key, v): void
// recording & editing
tapSlot(t, s): void                     // same as a finger tap on a clip cell (selection + launch/stop rules of §3.2)
stopTrackNow(t): void; capture(): boolean /*FANG*/; redo(): boolean
quantizeClip(t, s, {grid, strength?, swing?}): void; copyClip(t, s): void; pasteClip(t, s): boolean; duplicateClip(t, s): number
openRoll(t, s): void; roll(): null | {tool, grid, step, fold}   // editor state (for tests)
detectKey(notes): {root, scale}; sceneKey(s): {root, scale}
// song
song(): Song|null; songRec(on: boolean): void; songPlay(on: boolean): void; songCycle(t, bar): void; backToSong(): void
// storage
exportProject(): Promise<void>; history(): Promise<{key, mt}[]>; restoreHistory(key): Promise<boolean>
projects(): Promise<{id, name, mt, open: boolean}[]>; openProject(id): Promise<boolean>; newProject(): Promise<void>; deleteProject(id): Promise<void>
// keyboard, LAUF
setKbScale(mode: 'show'|'lock'|'off'): void; openLauf(t, s): void; lauf(): null | {grid, page, lane, steps: {on, n, v, tie}[]}
```

- `runtime()` adds: `engine` (= `engineInfo()` subset), `rec.notes`, `rec.lane`, `stopQ` (per track: the beat of a queued stop or `null`, derived from `R.pend`), `song: {rec, play, override: boolean[5], carrierLive}`, `modSrc`, and `editor ∈ {null,'synth','drum','clip','roll','browser','menu','song'}`.
- `noteLog` sources add `'melody'` (song melody) and `'preview'` (browser preview).

---

## 17. Work packages (topic 13)

Seven packages, built **in this order** by separate builder agents on the same `index.html`. Each package:

- is self-contained,
- leaves the app fully working (every feature that worked before still works),
- ends with its own checklist **plus** the regression rule below.

**Rules for every package**

1. Read this spec's sections listed for the package, `§old` where referenced, and the current file. Do not refactor code outside the package's touch points.
2. Embed research modules as listed in §1.1. Adapt only what this spec says to change.
3. **Regression rule:** all checklists of earlier packages and all old acceptance tests (`§old-17`) still pass. These old tests changed on purpose:
   - A1 (title is now „SYNQUENZER“)
   - E14 (now K3)
   - `§old-4.2` step 3 (a tap on a playing clip now queues a stop, §3.2)
   - F5 (factory presets instead of 8 presets × 3 engines, from WP3)
4. **Definition of done (every package):**
   - no console errors on load and during 60 s of demo playback in Chromium (desktop, 390×844 and 844×390 touch emulation) and WebKit 390×844;
   - no horizontal scroll at 320/375/390/844 px portrait widths and at 667×375 and 844×390 landscape;
   - the worklet-source ASCII check passes (from WP4);
   - PE1 passes;
   - the file is ≤ 1.5 MB;
   - a short `CHANGES-WPn.md` note in the scratchpad lists what was built, what is interim, and any deviation from this spec, with its reason.
5. Interim states are allowed only where the package text says so.

### WP1 — Fundament: Name, Logo, Bedienung, Rückgängig, Speichern

**Goal.** Make every existing screen safe and pleasant to touch, give the app its name and logo, and put storage on a robust base before the big features arrive.

**Scope**
1. **Name.** SYNQUENZER (§1.1, §13): title, metas, menu header, `VERSION '3.0.0'`, `window.SYNQUENZER` with the alias `window.DIRIGENT`, file names `synquenzer-…`, UI prefs key `synquenzer.ui` (read the old `dirigent.v2.ui` once).
2. **Logo and top bar** (§2.1, §2.2, §13): P re-layout (logo 50, ▶ 44, ● 44, TAKT 76, BPM 52, ♩ 40, ≡ 40); L/W logo; menu header; remove the drop-shadow; the grid-corner fallback below 360 px; corner caption „SZENE“.
3. **Touch hygiene** (§1.7.2), the gesture registry, `safeRebuild`, `guardTouch` (§10.5).
4. **Knob v2 and fader** (§10.1–10.3), replacing `makeKnob` everywhere (synth editor, drum editor, popovers). The long-press picker stub (↺ Standardwert / „nicht modulierbar“). The value bubble sits above. The **LCD line** in the synth and drum editor headers. Fix the two-finger fine bug.
5. **Sheet geometry** (§2.3: sheets also cover the carrier row in P, the keyboard shrinks to 170/110 px while a sheet is open). Re-lay out the existing editor pages so that no page scrolls vertically (§1.7.3); split a page into sub-tabs where it does not fit.
6. **Undo/redo** (§10.4) for `clip` and `sound` (`sound` = the v2 `patch`/`voices` snapshot until WP3). `REDO`, 60 entries; the toast with up to 2 actions; ↶ in the strip, ↶ ↷ in the editor headers.
7. **`haptic()`** + the lpGuard fix + the setting Haptik (§10.6).
8. **Storage:**
   - Embed `SQStore` and use **only** `KV`, `Autosave`, `fileName` and `requestPersist` for now.
   - Autosave (§12.4) holds the format-2 project; rescue copy; history + [Ältere Versionen]; status line; quota handling; `tickAhead()`.
   - Start-up order (§12.5) with KV first.
   - File save keeps the format-2 content in the new wrapper `{app:'SYNQUENZER', kind:'project', format:2, saved, appVersion, sum, project}` with `sum = SQStore.fnv(JSON.stringify(project))`, so WP3's `parseFile` can read these files. The import accepts `DIRIGENT` and `SYNQUENZER` wrappers and verifies `sum` when present (warning toast on a mismatch, the project still loads).
9. **Menu:** sections Projekt (incl. status, history, **[Projekte]** list §12.2), Bedienung (Haptik, Notennamen) and Info (version, storage mode, audio state, sample rate, latency, screen wake).
10. **Platform:** screen wake lock (§1.7.6), `idle()` helper (§1.7.7), file-picker `accept` rule (§1.7.8), top bar at 360–389 px (§2.1) and the small landscape rules (§2.2).

**Touch points:** `makeKnob`, `sheetCountPointers` (remove the fine-by-pointer-count logic), `bindUI` click guard, `toast`, `pushUndo/undo`, `markDirty/saveNow/loadSaved/init`, `openMenu`, CSS top bar, `buildGrid` corner.

**Interim:** sounds, engines and recording are unchanged. Long-press on a knob only offers „↺ Standardwert“.

**Checklist WP1:**
- [ ] KN1–KN8 (§10.7)
- [ ] BR1–BR3 (§13.3)
- [ ] PF1 (project only; the library comes in WP3), PF2, PF5, PF6, PF8 with format-2 content (§12.7)
- [ ] Wake lock: with a stub `navigator.wakeLock.request`, `play()` requests it once and `stop()` releases it after 60 s; with `request` throwing, nothing breaks and Info shows „nicht verfügbar“
- [ ] At 375×667 and 667×375 the top bar fits without overflow and the logo is in the top bar (BR1 extended)
- [ ] U1 (§3.8)
- [ ] The two-finger regression `modux/verify-build-twofinger.mjs` adapted: two knobs move 0.30 each
- [ ] All `§old-17` tests (A1 with the new title)

### WP2 — Aufnahme, Clip-Editor, Stoppen, Transponieren ohne Nachdenken

**Goal.** Solve the user's first complaints: see the recording, edit clips, stop single clips, never think about keys.

**Scope**
- §3.1 Recording states, Aufnahme-Leiste, result toast, count-in 0/1/2 *(2 = P1)*
- §3.2 Per-clip stop; ■ double tap
- §3.3 Piano roll (`PianoRoll`, rename `r` → `o`), ✎ in the strip, the L exception of §2.3 (the clip editor covers the keyboard row; [⌨])
- §3.4 Step grid with `StepEditor` on the **current 8-voice drum engine** (lanes VEL, AKZENT, CHANCE, WIRBEL, TIMING); `DrumSeq.expandStep` in the scheduler; `clip.seed`; the accent as velocity ×1.4 (interim until WP6)
- §3.5 Quantize: `o`, `clip.q`, the 'auto' default for new projects, the sheet
- §3.6 FANG (`RecHelpers.capturePhrase`, the `cs` field on `R.pend`)
- §3.7 Clip sheet v3; §3.8 clip redo (already from WP1) applied to all new actions
- §4 complete: `KeyDetect`, `key.src`, scene keys, `single:'key'` default + migration toast, lit keys, readout, mode texts, coach card, scene key labels, [= Szenen-Tonart], keyboard in SPIELEN (zeigen/sperren/aus)
- §1.7.6 is WP1; §3.3 additions in this package: tap selects, Loop-Bereich, ALLE-Löschen guard; §3.2 stop cancel on ✎; §3.6 FANG slot in the mode bar

**Touch points:** `slotTap`, `stopTrack` (+ `stopTrackNow`), `renderGrid`, `recPress/recBegin/recClose/commitRecNote/recPad`, `uiFrame` (lane, playhead), `inputDown/inputUp` (CAP, step input), `scheduleTrack` (drum expand), `tick` (`p.cs`), `kbPaint`, `renderCarrier`, `popHMode`, `openClipSheet`, `buildDrumEd` (STEPS tab), `normClip/normalizeProject` (new fields).

**Interim:** drums still have 8 voices; the TUNE/DECAY lanes are hidden.

**Checklist WP2:**
- [ ] R1–R6
- [ ] S1–S4
- [ ] P1–P31 (P-tests adapted to „tap selects“)
- [ ] T1–T18
- [ ] Q1–Q4
- [ ] FG1–FG2
- [ ] CL1–CL3
- [ ] K1–K10
- [ ] S5, P32, P33
- [ ] Old C1–C5, D1–D7, E1–E16 (E14 → K3)

### WP3 — Klang-Datenmodell, Synth-Editor, Sound-Bibliothek (native Klangerzeugung)

**Goal.** One data model for sounds, the new editor (3 oscillators, footage/HT/Fein, ladder parameters, envelope graph, two LFOs, MOD list), and user and factory presets — all rendered natively for now.

**Scope**
- §5.1–5.3 Parameter table, all synth editor pages (OSZ 1/2/3, MIX with faders, STIMME, FILTER + XY, HÜLLK. with `makeEnvEditor`, LFO 1/2, the MOD list, FX as today, WT page, legacy FM page), header row 2 (browser, Sichern, 🎲, Hören), engine switch
- §5.5 Native voice: `NativeVoice.source/tail` from the split `fallback.js`; WT and fm2 on the new tail; native LFO 1/2 via `FX.TempoLFO` (embed `fx-native.js` as a library); dB-Q mapping
- §5.6 Migration of v2 patches
- §9.2 Data and the §9.3 MOD list (basic: rows, slider, ✕, [+ Modulation])
- §11 Sound browser, preview, library (save, overwrite, rename, duplicate, delete-undo, import/export), the analog and WT factory sounds
- §5.2 HÜLLK. Form chips; the FILTER hint line for extreme filter play
- §12.1–12.6 Project format 3, full `SQStore` (with the §12.3 changes), `parseFile`, sounds files, project file with the library inside
- §15 Synth part, §15.3 defaults, §15.4 demo with VA sounds
- §16 Sound API part
- Anhang C.1 legacy aliases

**Touch points:** `presetPatch/PRESETS` (replaced by the factory), `newSynthTrack`, `normPatch/normTrack/normalizeProject`, `spawnVoice` (native rewrite), `liveUpdate`, `applyTrackParams`, `buildSynthEd/fillSynthTab`, `setParam/getParam/setEngine/loadPreset/randomize`, `GM_PROGRAM` (by category: bass 38, lead 81, poly 62, flaeche 89, pluck 45, sequenz 80, fm 4, glocke 14, wt 89, eigene 81), `serialize/importJSON/saveFile/onFilePicked`.

**Interim:** analog sounds run on the native fallback (unison ≤ 3 on osc 1, Biquad instead of the ladder, fake whistle). No „ECO-Klang“ badge yet. FM tracks are legacy fm2. Drum tracks keep the v2 model (the project is format 3 with v2 drum tracks). Chorus values in sounds are stored but not rendered.

**Checklist WP3:**
- [ ] AN3, AN4, AN8, AN9, AN10, AN11 (native)
- [ ] PR1 (RMS part), PR2–PR7
- [ ] PF1–PF8 (format 3)
- [ ] MO46 (on native: `lfo1→cutoff` audible)
- [ ] MO48, MO49
- [ ] Old F1–F7 via aliases (F5 = every factory sound sounds)
- [ ] G1–G7

### WP4 — Synth-Worklet (Analog-Kern) und Effekte

**Goal.** Studio-quality sound: the real ladder, unison 7, hard sync and exact envelopes in the AudioWorklet; the Dattorro hall with a long tail, Juno chorus, tempo-exact echo, glue master, pump — with safe fallbacks.

**Scope**
- §1.4 Worklet module text block (analog-core-sync + the scope hunks + `D_UNIDET` applied + hall), `SynthHost` loader chain, start-up race, Info status
- §5.4 Voice proxy (`WkVoiceProto`), patch messages, tempo, panic; the „ECO-Klang“ badge when the worklet failed; `forceNative()`
- §14.3 CPU limiter, Qualität and Puffer settings
- §8 complete: graph changes in `buildTrack/buildMaster`, metronome to `masterSum`, `graphLat`, hall (worklet + ConvHall fallback, upgrade swap), echo with `loopExtra`, chorus insert, master, pump hooks, the FX pages (SPUR, CHORUS, HALL, ECHO, MASTER), `S.fxBus` + migration, the bus-hint chip, double-■ tail kill
- §16 Engine and FX API

**Touch points:** `ensureAudio`, `buildMaster`, `buildTrack`, `applyTrackParams`, `applyTempoDependents`, `setBpm`, `startTransport/stop`, `spawnVoice` (proxy branch), `cleanupVoice`, `gcVoices`, `silenceAll`, `panic`, `click`, `meter`, `drumHit` (pump hook for the old kick), `uiFrame` (badge, GR meter).

**Interim:** none for the synths. Drums are still the v2 engine.

**Checklist WP4:**
- [ ] AN1, AN2, AN5, AN6, AN7
- [ ] PR1 (loudness on the worklet), PR8 (quality gates, analog sounds)
- [ ] FX1–FX10
- [ ] PE1–PE4
- [ ] Old B1–B5, C1–C5, E9, E10, H1–H4 with the worklet active **and** with `forceNative(true)`

### WP5 — Modulation: halten, Quelle wählen, Ringe · LAUF

**Goal.** Bitwig-style modulation on every knob, and the LAUF step view for bass lines and sequences.

**Scope**
- §9.3 Picker, mod mode, banner, rings, live dots, the full MOD tab (source strip, live ranges), coach toast
- §9.4 Scope (worklet `{scope}` + native `lfoAt`)
- §9.5 Native subset marking
- *(P1)* §9.6 FX destinations; *(P1)* §5.3 point 3 (envelope lanes)
- Faders of the MIX page get rings too
- §3.10 LAUF (on the WP2 `StepEditor`, with a `pxPerUnit` lane option for the pitch lane); *(P1)* „Was ist anders?“ (§5.2)

**Touch points:** knob/fader components (from WP1), `openEditor/closeEditor` (scope on/off, mod mode exit), synth worklet message handler, `uiFrame` (dots), the clip editor toolbar ([ROLLE|LAUF]), `inputDown` (step input into LAUF).

**Checklist WP5:**
- [ ] MO1–MO49
- [ ] LF1–LF4
- [ ] WP1 KN tests still pass (the picker now has sources)

### WP6 — Drum-Synth v2 und Song-Modus

**Goal.** Drums like Attack/Nord Drum with 12 pads and 7 kits; record whole sessions as songs with a melody lane.

**Scope**
- §7 complete: `DrumSynth`, `DrumKits`, 12 pads (P 4×3, L 6×2), key map, kit bus, strips, per-hit drive without oversampling, the choke cancel fix, drum sound records + `migrateDrumsV2` (inside `normalizeProject`), the drum editor tabs SOUND/TIEF/SCHRITTE/KIT/FX, Euklid, Muster, kits in the browser, [Sound laden] per instrument
- §3.4 TUNE/DECAY lanes and locks, accent via the engine
- §3.9 Song complete: SONG ⇄ switch, song view with its own scroll gesture, recording (incl. live notes into the melody lane), playback, take-over and ↩ SONG, melody lane and overdub, the melody-track chip, cell editing, undo `kind:'song'`; *(P1)* MIDI export „Song“, Melodie → Clip, Song als Audio

**Touch points:** `DRUM_VOICES/KITS/kitVoices` (replaced), `newDrumTrack`, `drumHit`, `chokeVoice`, `hitCancel`, `buildPads/padPaint/padHit`, `buildDrumEd`, `setDrumParam/loadKit/randomizeDrumVoice`, `PADKEYS`, `scheduleTrack` (locks), `tick` (song block), `switchTrackAt` (song log), `T.onCommit` (song log), `buildGrid` (corner switch), `buildMidi` (song, P1).

**Checklist WP6:**
- [ ] DR1–DR9
- [ ] T1–T18 on the new engine
- [ ] SG1–SG8
- [ ] PR8 for the kits (DR1/DR9)
- [ ] Old D7, E6, F7

### WP7 — FM6-Engine (6 Operatoren, 32 Algorithmen)

**Goal.** A DX7-class FM synth inside the same synth worklet, with a touch-friendly operator UI and .syx import.

**Scope**
- §6 complete: the FM block in the worklet (`eng 1`, `{fm6}` message, macros, mod dsts `fmbright`/`op1..6`, filter bypass, DX amp mode, voice end)
- The native fallback via `DXN`; `FMH` helpers; the FM tab (ALGO, OP, MAKRO; the algorithm sheet; the operator strip with faders and LEDs; the rate/level envelope editor)
- .syx import; the 12 FM factory sounds and their conversion; fm2 → fm6 migration
- Demo Synth 2 = FM-Pluck; MIDI program for FM = 4

**Touch points:** the worklet source block, `SynthHost` (`{fm6}` message), `NativeVoice.source` (fm6), the synth editor tabs, the factory and browser categories, `normalizeSound` (fm6), the menu Sounds section (syx).

**Checklist WP7:**
- [ ] FM1–FM10
- [ ] MO tests with `fmbright` and `op2` routes
- [ ] PR1 and PR8 for the FM sounds
- [ ] Old F1 with engine FM

---

## 18. Not in v2 (P2)

- Modulation of drum parameters; bus-level LFOs for the hall and echo; modulation of chorus rate/depth; modulation of envelope times.
- Hard sync from osc 3; audio-rate filter FM; voice stacking (layering two sounds per note); the DX7 pitch EG; .syx export; editing of single DX voices as VCED.
- MIDI out, MIDI clock, MIDI CC → Mod-Rad mapping (the Mod-Rad is a knob in v2).
- Audio input recording; offline WAV/stem rendering of the song (a real-time m4a recording of the song is *(P1)*, §3.9).
- More than 4 scenes, other time signatures, scene renaming in the grid, per-scene tempo, a loop sub-range inside a clip (v2: the loop is the whole clip; its length is set with the ┃ handle).
- Cloud sync through the artifact `db` capability; sharing sounds between users inside the app.
- Restart profile (Zyklus), per-track follow-mode override, slash-bass routing, toms/perc following the Träger.
- Sample import and sample playback.

---

## Anhang A — Parameter tables

### A.1 VA: 🎲 random ranges (everything not listed is kept)

| keys | random range |
|---|---|
| `o1w o2w o3w` | any |
| `o2oct o3oct` | −1…1 (`o1oct` kept) |
| `o2semi o3semi` | 0 (70 %), else one of 7, 12, −12, 5 |
| `o1fine o2fine o3fine` | −10…10 |
| `o1lvl` | .6–1 |
| `o2lvl` | 0–1 |
| `o3lvl` | 0–.6 (60 % → 0) |
| `o*pw` | .2–.8 |
| `o1uni` | 1 (60 %), 3, 5, 7 |
| `o2uni o3uni` | 1 (80 %), 3 |
| `subLvl` | 0–.6 (70 % → 0) |
| `noise` | 0–.2 (70 % → 0) |
| `ftype` | 0 or 1 (85 %), else any |
| `cutoff` | 200–6000 exp |
| `res` | 0–.7 |
| `drive` | 0–.5 |
| `fenv` | −.2….8 |
| `kt` | .2–.7 |
| `fA aA` | .001–.5 (70 % < .02) |
| `fD aD` | .05–1.5 |
| `fS aS` | 0–1 |
| `fR aR` | .05–1.5 |

Kept: mode, poly, glide, LFOs, mod envelope, mods, `level`, `fx`. Afterwards: at least one oscillator level ≥ .5; if `aS < .1` then `aD ≥ .15`.

### A.2 FM operator parameters (UI)

| key | UI | range | knob / display |
|---|---|---|---|
| `on` | AN (LED) | 0/1 | toggle above the fader |
| `fixed` | RATIO / FEST | 0/1 | segment |
| `coarse` | Grob | 0–31 (0 = ×0.5) | stepped knob with detents; display „×3“ or (FEST) „100 Hz“-decade |
| `fine` | Fein | 0–99 | knob; display „×3,50“ (ratio) or Hz (FEST) |
| `det` | Verstimmung | −7…7 | stepped, centre detent |
| `ol` | Pegel / Mod-Index | 0–99 | **vertical fader** in the strip; knob on the OP page; display dB (outputs: `(ol−99)·0.75 dB`) or „I 3,1“ (modulators, `FMH.modIndex`) |
| `r[0..3]` | Rate 1–4 | 0–99 | edited as **time** in the graph (`FMH.rateForTime`) |
| `l[0..3]` | Level 1–4 | 0–99 | edited as point height in the graph |
| `vs` | Anschlag | 0–7 | stepped |
| `rs` | Key→Zeit | 0–7 | stepped |
| `ks.bp` | Breakpoint | 0–99 | display as note name (0 = A-1, 39 = C3) |
| `ks.ld ks.rd` | Tiefe L / R | 0–99 | knob |
| `ks.lc ks.rc` | Kurve L / R | 0 −LIN, 1 −EXP, 2 +EXP, 3 +LIN | segment |
| patch `alg` | Algorithmus | 1–32 | stepper + sheet |
| patch `fb` | Feedback | 0–7 | stepped knob |
| patch `trans` | Transponieren | −24…24 | stepped knob (MAKRO page) |

### A.3 Drum voice parameters by layer (TIEF tab; keys of `DrumSynth.DEFAULTS`)

| Layer | Controls (UI label = key, range) |
|---|---|
| TON | Welle `wav` (Sinus, Dreieck, Rechteck, Säge, Cos-Klick) · Tune `frq` 20–2000 Hz exp · Pitch `pAmt` 0–48 HT · Pitch-Zeit `pDec` .005–.8 s exp · Attack `tAtk` 0–.05 s · Hold `tHld` 0–.2 s · Decay `tDec` .01–3 s exp · Kurve `tCrv` 0–1 (exp → gated) · Knack `tSpk` 0–1 · level `tLvl` 0–1.5 (on/off LED) |
| FM | Osz 2 `o2` 0–1 · Welle 2 `o2w` · Ratio `o2r` .5–8 exp · O2-Decay `o2d` .05–2 · FM `fmI` 0–12 · FM-Zeit `fmDec` .005–1 exp · Ton-Filter `tfTyp` (aus/LP/BP/HP) · Freq `tfFrq` 50–16000 exp · Q `tfQ` .5–8 · F-Hüllk. `tfEnv` −1…1 |
| RAUSCHEN | Farbe `nCol` (weiß/rosa) · Filter `nTyp` (LP/BP/HP) · Freq `nFrq` 100–16000 exp · Q `nQ` .5–8 · HP `nHp` 0–8000 · Sweep `nEnv` −2…2 Okt · Sweep-Zeit `nEnvDec` .005–.5 · Attack `nAtk` 0–.05 · Hold `nHld` 0–.2 · Decay `nDec` .01–2 exp · Kurve `nCrv` · Klatscher `nBur` 1–6 · Abstand `nGap` .003–.03 · level `nLvl` 0–1.5 |
| METALL | Tune `mTun` .5–2 exp · Hoch `mHi` 0–1.5 · Tief `mLo` 0–1.5 · Q `mQ` .5–4 · HP `mHp` 2000–12000 exp · Attack `mAtk` · Hold `mHld` · Decay `mDec` .01–4 exp · Kurve `mCrv` · level `mLvl` 0–1.5 |
| KLICK | Typ `cTyp` (Puls, Tick, Blip, Knock) · Ton `cTon` 0–1 · level `cLvl` 0–1 |
| AUSGANG | Pegel `lvl` 0–1.2 · Panorama `pan` · Dyn `dyn` 0–1 · Drive `drv` 0–1 · Raum `sRoom` 0–1 · Gate `sGate` 0–1 · Choke `choke` (–, 1, 2) · Modell `model` |

The SOUND tab macros come from `DrumSynth.MODELS[model].macros` (`[key, label, min, max, curve]`; `int` = stepped).

### A.4 Numeric ids sent to the synth worklet

Sources: `lfo1 1, lfo2 2, fenv 3, menv 4, vel 5, key 6, mw 7, rnd 8, aenv 9` (NSRC 10).
Destinations: `pitch 1, o2pitch 2, cutoff 3, res 4, drive 5, pw 6, o1lvl 7, o2lvl 8, o3lvl 9, noise 10, amp 11, pan 12, unidet 13, fenv 14, fmbright 15, op1 16 … op6 21` (NDST 22). 8 slots.
`toEngineMods` drops `fx.*` routes (these are native, §9.6).

---

## Anhang B — Factory sounds with concrete parameters

The source of truth is `presetlib/presets-factory.js` (sparse diffs over `ANALOG_BASE`, i.e. the AnalogCore v1 `defaults()` + `o2sync:0`; FM in DX7 units; kits as diffs over `DrumSynth.DEFAULTS`). The tables below are generated from that file and let reviewers see the sound design at a glance. Each preset also has a German „Trick“ text in the file; show it in the browser.

### B.1 Analog (30) — `p` = diff over ANALOG_BASE (`SQ_FACTORY.ANALOG_BASE`), mods in engine units

| # | Name (cat) | Vorbild | p (diff) | mods | fx | bus hint |
|---|---|---|---|---|---|---|
| A1 | **Moog-Bass** (Bass) | Minimoog Model D | `{o2fine:-5, o2lvl:0.85, o3w:1, o3oct:-1, o3lvl:0.55, cutoff:240, res:0.3, drive:0.5, bass:0.7, kt:0.35, fenv:0.45, fvel:0.45, fA:0.001, fD:0.32, fS:0.18, fR:0.12, fCurve:0.7, aA:0.001, aD:0.8, aS:0.85, aR:0.07, ampVel:0.45, mode:1, poly:1, reset:1, analog:0.12, spread:0, level:0.6}` | vel→cutoff 0.04 | rev 0.04 | – |
| A2 | **Sub-Bass** (Bass) | Moog Taurus / moderner Pop-Sub | `{o1w:3, o2w:2, o2oct:1, o2fine:0, o2lvl:0.25, cutoff:900, res:0, drive:0.25, kt:0.5, fenv:0, fvel:0, aA:0.004, aD:0.1, aS:1, aR:0.09, ampVel:0.35, mode:2, poly:1, glide:0.03, reset:1, analog:0, spread:0, level:0.536}` | – | rev 0 | – |
| A3 | **Acid 303** (Bass) | Roland TB-303 | `{o1lvl:0.6, o2lvl:0, cutoff:300, res:0.86, drive:0.2, bass:0.2, kt:0.3, fenv:0.55, fvel:0.6, fA:0.001, fD:0.2, fS:0, fR:0.1, fCurve:0.75, aA:0.001, aD:2, aS:0.75, aR:0.04, ampVel:0.5, mode:2, poly:1, glide:0.055, reset:1, analog:0.05, spread:0, l1shape:1, l1sync:16, level:1.702}` | lfo1→cutoff 0.06; vel→fenv 0.25; vel→res 0.06 | drive 0.25, rev 0.08, dly 0.28 | `{echo:{mode:"pp", divL:"1/8.", fb:0.35, highcut:4000}}` |
| A4 | **Synthpop-Bass** (Bass) | Sequential Pro-One / Roland SH-101 (Depeche Mode, Erasure) | `{o2w:1, o2pw:0.35, o2oct:1, o2fine:0, o2lvl:0.45, subLvl:0.45, cutoff:380, res:0.22, drive:0.35, kt:0.4, fenv:0.42, fvel:0.35, fA:0.001, fD:0.17, fS:0.12, fR:0.08, aA:0.001, aD:0.35, aS:0.7, aR:0.05, ampVel:0.5, mode:1, poly:1, reset:1, analog:0.1, spread:0, level:0.924}` | – | rev 0.05 | – |
| A5 | **Gummi-Bass** (Bass) | Funk-Bass der 80er (Minimoog, Prophet) | `{o1lvl:0.6, o1w:1, o2w:0, o2oct:-1, o2fine:3, o2lvl:0.3, ftype:1, cutoff:180, res:0.6, drive:0.1, bass:0.3, kt:0.5, fenv:0.5, fvel:0.5, fA:0.002, fD:0.28, fS:0.08, fR:0.15, fCurve:0.6, aA:0.002, aD:0.6, aS:0.8, aR:0.08, ampVel:0.5, mode:2, poly:1, glide:0.045, analog:0.15, spread:0, level:0.627}` | – | drive 0.15, rev 0.06 | – |
| A6 | **Mini-Lead** (Lead) | Minimoog-Solo | `{o2fine:6, o2lvl:0.9, o3w:0, o3oct:1, o3fine:-3, o3lvl:0.25, cutoff:1300, res:0.38, drive:0.4, kt:0.66, fenv:0.32, fvel:0.3, fA:0.008, fD:0.5, fS:0.45, fR:0.3, aA:0.004, aD:0.3, aS:0.92, aR:0.22, ampVel:0.4, mode:2, poly:1, glide:0.07, l2shape:0, l2rate:5.3, l2fade:0.7, analog:0.2, spread:0, level:0.52}` | lfo2→pitch 0.0045 | rev 0.22, dly 0.22 | – |
| A7 | **Sync-Lead** (Lead) | Prophet-5 Sync („Let’s Go“), Nord Lead | `{o1lvl:0.35, o2sync:1, o2semi:7, o2fine:0, o2lvl:1, cutoff:2600, res:0.18, drive:0.3, kt:0.5, fenv:0.2, fA:0.002, fD:0.4, fS:0.5, aA:0.003, aD:0.2, aS:0.9, aR:0.2, ampVel:0.4, mA:0.001, mD:0.5, mS:0.15, mR:0.3, mode:2, poly:1, glide:0.04, l2shape:0, l2rate:5.5, l2fade:0.6, analog:0.12, spread:0, level:0.58}` | menv→o2pitch 0.5; lfo2→pitch 0.004; mw→o2pitch 0.3 | rev 0.2, dly 0.25 | – |
| A8 | **Supersaw-Hymne** (Lead) | Roland JP-8000 Supersaw | `{o1uni:7, uniDet:0.42, uniMix:0.75, uniWidth:1, o2oct:1, o2fine:0, o2lvl:0.4, o2uni:5, ftype:1, cutoff:5200, res:0.1, drive:0.15, kt:0.3, fenv:0.12, fD:0.6, fS:0.5, aA:0.012, aD:0.8, aS:0.9, aR:0.6, ampVel:0.35, analog:0.2, poly:6, level:0.189}` | vel→cutoff 0.06 | rev 0.4, dly 0.2 | – |
| A9 | **Puls-Lead** (Lead) | Roland SH-101 / Pro-One | `{o1w:1, o1pw:0.28, o2w:1, o2pw:0.5, o2oct:-1, o2fine:4, o2lvl:0.45, cutoff:1800, res:0.32, drive:0.3, kt:0.6, fenv:0.28, fD:0.35, fS:0.4, aA:0.003, aD:0.25, aS:0.9, aR:0.18, ampVel:0.4, mode:2, poly:1, glide:0.05, l1shape:1, l1rate:0.55, l2shape:0, l2rate:5.6, l2fade:0.5, analog:0.15, spread:0, level:0.417}` | lfo1→pw 0.3; lfo2→pitch 0.004 | rev 0.25, dly 0.25 | – |
| A10 | **Pfeif-Lead** (Lead) | Selbstschwingendes Moog-Filter | `{ftype:1, o1w:2, o1lvl:0.15, o2lvl:0, noise:0.08, cutoff:525.4, res:1.02, drive:0.15, bass:0, kt:1, fenv:0, fvel:0, aA:0.06, aD:0.3, aS:0.9, aR:0.35, ampVel:0.3, mode:2, poly:1, glide:0.09, l2shape:0, l2rate:5, l2fade:0.8, analog:0.02, spread:0, level:1.265}` | lfo2→pitch 0.003; lfo2→cutoff 0.0006 | rev 0.35, dly 0.2 | – |
| A11 | **OB-Brass** (Poly & Brass) | Oberheim OB-Xa („Jump“) | `{o2fine:9, o2lvl:0.9, ftype:1, cutoff:520, res:0.12, drive:0.25, kt:0.55, fenv:0.5, fvel:0.45, fA:0.06, fD:0.55, fS:0.45, fR:0.3, fCurve:0.6, aA:0.025, aD:0.4, aS:0.95, aR:0.25, ampVel:0.4, mA:0.001, mD:0.1, mS:0, analog:0.3, spread:0.55, level:0.377}` | menv→pitch -0.006 | rev 0.28 | – |
| A12 | **Prophet-Poly** (Poly & Brass) | Sequential Prophet-5 | `{o2w:1, o2pw:0.42, o2fine:-6, o2lvl:0.75, cutoff:900, res:0.25, drive:0.25, kt:0.5, fenv:0.35, fvel:0.35, fA:0.004, fD:0.75, fS:0.35, fR:0.5, aA:0.004, aD:1.1, aS:0.75, aR:0.5, ampVel:0.4, analog:0.35, spread:0.35, poly:6, level:0.261}` | vel→cutoff 0.05 | rev 0.3, dly 0.08 | – |
| A13 | **Juno-Streicher** (Poly & Brass) | Roland Juno-60 Strings | `{o1w:1, o2w:0, o2fine:5, o2lvl:0.55, ftype:1, cutoff:3400, res:0.05, drive:0.1, kt:0.5, fenv:0.06, aA:0.38, aD:1, aS:0.9, aR:1.3, ampVel:0.3, l1shape:1, l1rate:0.7, analog:0.2, spread:0.15, poly:6, level:0.158}` | lfo1→pw 0.5 | chorus II 1, rev 0.38 | – |
| A14 | **Ensemble-Streicher** (Poly & Brass) | ARP Solina String Ensemble | `{o2oct:1, o2fine:3, o2lvl:0.6, ftype:1, cutoff:4200, res:0.04, drive:0.05, kt:0.4, fenv:0, aA:0.22, aD:0.5, aS:1, aR:1.1, ampVel:0.25, analog:0.2, spread:0.1, poly:6, level:0.214}` | – | chorus ENS 1, rev 0.35 | – |
| A15 | **Poly-Stab** (Poly & Brass) | House- und 80er-Akkord-Stab | `{o1uni:3, uniDet:0.3, uniMix:0.7, o2w:1, o2pw:0.4, o2oct:-1, o2fine:0, o2lvl:0.35, cutoff:650, res:0.28, drive:0.3, kt:0.5, fenv:0.52, fvel:0.4, fA:0.001, fD:0.22, fS:0, fR:0.2, aA:0.002, aD:0.45, aS:0, aR:0.25, ampVel:0.5, analog:0.2, spread:0.3, poly:6, level:0.529}` | vel→cutoff 0.05 | rev 0.32, dly 0.18 | – |
| A16 | **Juno-Pad** (Fläche) | Roland Juno-60 Pad | `{o1w:1, subLvl:0.35, cutoff:1300, res:0.18, drive:0.1, kt:0.4, fenv:0.15, fA:0.5, fD:1.6, fS:0.6, fR:1.8, aA:0.55, aD:1.4, aS:0.85, aR:1.9, ampVel:0.25, l1shape:1, l1rate:0.45, analog:0.2, spread:0.2, poly:6, level:0.189}` | lfo1→pw 0.6 | chorus I 1, rev 0.45 | – |
| A17 | **PWM-Fläche** (Fläche) | Oberheim-Doppel-PWM | `{o1w:1, o2w:1, o2pw:0.3, o2fine:-8, o2lvl:0.85, o3w:3, o3oct:-1, o3lvl:0.3, cutoff:1700, res:0.15, drive:0.12, kt:0.4, fenv:0.12, fA:0.8, fD:2, fS:0.7, fR:2, aA:0.9, aD:1.5, aS:0.9, aR:2.4, ampVel:0.25, l1shape:1, l1rate:0.31, l2shape:0, l2rate:0.13, analog:0.3, spread:0.4, poly:6, level:0.158}` | lfo1→pw 0.55; lfo2→cutoff 0.03 | chorus BREIT 1, rev 0.5 | – |
| A18 | **Rom-Fläche** (Fläche) | One-Day-in-Rome-Sphäre (Supersaw + Oktave + Sub-Dreieck) | `{o1uni:7, uniDet:0.35, uniMix:0.65, uniWidth:0.95, o2oct:1, o2fine:-4, o2lvl:0.3, o2uni:3, o3w:2, o3oct:-1, o3lvl:0.35, cutoff:1500, res:0.22, drive:0.1, kt:0.4, fenv:0.18, fvel:0.3, aA:1.8, aD:2.5, aS:0.85, aR:5.5, aCurve:0.6, ampVel:0.25, fA:2.6, fD:3, fS:0.45, fR:5, analog:0.35, l1shape:1, l1rate:0.17, l2shape:0, l2rate:4.8, l2fade:1.6, poly:6, level:0.249}` | lfo1→cutoff 0.05; lfo2→pitch 0.003 | chorus ENS 0.5, rev 0.6, dly 0.12 | `{hall:{decay:7, size:1.2, mod:0.6}}` |
| A19 | **Äther** (Fläche) | Sphären-Fläche (Vangelis, Jarre) | `{o1w:2, o2w:3, o2oct:1, o2fine:4, o2lvl:0.5, o3w:3, o3oct:2, o3fine:-3, o3lvl:0.18, noise:0.22, cutoff:2400, res:0.35, drive:0, kt:0.3, fenv:0.1, fA:2, fD:3, fS:0.8, fR:6, aA:2.5, aD:3, aS:0.9, aR:7, aCurve:0.7, ampVel:0.2, l1shape:0, l1rate:0.09, l2shape:1, l2rate:0.21, analog:0.25, spread:0.6, poly:6, level:0.336}` | lfo1→cutoff 0.07; lfo2→noise 0.12; lfo2→pan 0.3 | chorus BREIT 0.6, rev 0.75, dly 0.2 | `{hall:{decay:8, size:1.3, mod:0.7, damp:6000}}` |
| A20 | **Weite 82** (Fläche) | Yamaha CS-80 (Vangelis, „Blade Runner“) | `{o2fine:-9, o2lvl:0.9, o3w:3, o3oct:-1, o3lvl:0.35, ftype:1, cutoff:480, res:0.22, drive:0.15, kt:0.5, fenv:0.42, fvel:0.5, fA:1.1, fD:2.4, fS:0.55, fR:2.5, aA:0.35, aD:2, aS:0.9, aR:3.2, ampVel:0.4, l2shape:0, l2rate:4.6, l2fade:1.4, analog:0.35, spread:0.5, poly:6, level:0.216}` | lfo2→pitch 0.003; vel→cutoff 0.06 | rev 0.55, dly 0.1 | `{hall:{decay:6, size:1.1}}` |
| A21 | **Kristall-Fläche** (Fläche) | Moderne Glanz-Fläche | `{o1uni:5, uniDet:0.3, uniMix:0.6, uniWidth:1, o2oct:1, o2fine:-6, o2lvl:0.55, o2uni:3, ftype:3, cutoff:1500, res:0.2, drive:0, kt:0.2, fenv:0.2, fA:1.5, fD:3, fS:0.3, aA:0.9, aD:2, aS:0.85, aR:3.5, ampVel:0.25, l1shape:1, l1sync:16, analog:0.2, spread:0.3, poly:6, level:0.207}` | lfo1→cutoff 0.1 | chorus I 1, rev 0.55, dly 0.25 | – |
| A22 | **Samtpolster** (Fläche) | Warme Analog-Fläche | `{o2fine:-12, o2lvl:0.8, subLvl:0.3, subW:1, cutoff:520, res:0.1, drive:0.2, bass:0.6, kt:0.35, fenv:0.22, fA:1.6, fD:3, fS:0.6, fR:3, aA:1, aD:2, aS:0.9, aR:3, ampVel:0.25, l1shape:0, l1rate:0.11, analog:0.4, spread:0.35, poly:6, level:0.256}` | lfo1→cutoff 0.025 | chorus BREIT 0.7, rev 0.45 | – |
| A23 | **Glas-Pluck** (Pluck & Keys) | Analoger Glas-Pluck | `{o1w:2, o2w:3, o2oct:1, o2fine:3, o2lvl:0.6, o3w:1, o3oct:2, o3pw:0.2, o3lvl:0.15, cutoff:2200, res:0.3, kt:0.6, fenv:0.45, fA:0.001, fD:0.25, fS:0, fR:0.3, aA:0.001, aD:0.7, aS:0, aR:0.5, ampVel:0.65, analog:0.15, level:0.803}` | vel→cutoff 0.08 | rev 0.35, dly 0.35 | – |
| A24 | **Pop-Pluck** (Pluck & Keys) | Future-Pop-Pluck | `{o1uni:3, uniDet:0.22, uniMix:0.7, uniWidth:0.9, o2w:1, o2oct:1, o2fine:0, o2lvl:0.25, cutoff:500, res:0.2, drive:0.15, kt:0.6, fenv:0.58, fvel:0.4, fA:0.001, fD:0.16, fS:0, fR:0.15, fCurve:0.7, aA:0.001, aD:0.5, aS:0, aR:0.35, ampVel:0.6, analog:0.1, spread:0.3, poly:6, level:0.86}` | vel→cutoff 0.06 | rev 0.3, dly 0.35 | `{echo:{mode:"pp", divL:"1/8.", fb:0.35}}` |
| A25 | **Analog-Harfe** (Pluck & Keys) | Weiche Arpeggio-Harfe | `{o1w:2, o2oct:1, o2fine:2, o2lvl:0.22, ftype:1, cutoff:1100, res:0.22, kt:0.75, fenv:0.38, fA:0.001, fD:0.4, fS:0.05, fR:0.6, aA:0.002, aD:1.4, aS:0, aR:1, ampVel:0.6, analog:0.15, spread:0.4, level:0.662}` | vel→cutoff 0.07 | rev 0.45, dly 0.15 | – |
| A26 | **Moroder-Puls** (Sequenz) | Moog-Modular-Sequenz („I Feel Love“) | `{o2fine:-4, o2lvl:1, cutoff:280, res:0.35, drive:0.5, bass:0.6, kt:0.45, fenv:0.5, fvel:0.4, fA:0.001, fD:0.13, fS:0.04, fR:0.06, aA:0.001, aD:0.22, aS:0.6, aR:0.05, ampVel:0.4, mode:1, poly:1, reset:1, analog:0.25, spread:0, level:0.978}` | – | rev 0.1, dly 0.38, pan -0.25 | `{echo:{mode:"pp", divL:"1/16", fb:0.2}}` |
| A27 | **Pfeif-Sequenz** (Sequenz) | Resonanz-Sequenz (Berliner Schule, Jarre) | `{o1lvl:0.25, o1w:1, o1pw:0.3, o2oct:1, o2fine:0, o2lvl:0.08, ftype:1, cutoff:1046.5, res:0.97, drive:0, bass:0.1, kt:1, fenv:0.3, fvel:0.4, fA:0.001, fD:0.3, fS:0, fR:0.2, aA:0.002, aD:0.35, aS:0.35, aR:0.2, ampVel:0.5, analog:0.05, spread:0.25, poly:4, level:1.956}` | vel→fenv 0.2 | chorus I 0.5, rev 0.32, dly 0.35 | `{echo:{mode:"pp", divL:"1/8.", fb:0.4, highcut:4500}}` |
| A28 | **Nass & Quietsch** (Sequenz) | S&H-Filter-Sequenz | `{o1lvl:0.3, o2w:1, o2fine:-7, o2lvl:0.15, cutoff:785, res:0.9, drive:0.15, bass:0.15, kt:1, fenv:0.45, fvel:0.5, fA:0.001, fD:0.18, fS:0, fR:0.12, fCurve:0.7, aA:0.001, aD:0.3, aS:0.5, aR:0.08, ampVel:0.5, poly:4, l1shape:4, l1sync:0.25, analog:0.1, spread:0.3, level:3.544}` | lfo1→cutoff 0.04; vel→fenv 0.2 | drive 0.15, chorus I 0.6, rev 0.35, dly 0.42 | `{echo:{mode:"pp", divL:"1/8.", fb:0.5, highcut:3500}}` |
| A29 | **Berlin-Schule** (Sequenz) | Tangerine Dream / Klaus Schulze | `{o1lvl:0.5, o2w:1, o2pw:0.45, o2oct:-1, o2fine:3, o2lvl:0.4, cutoff:330, res:0.6, drive:0.2, bass:0.2, kt:0.6, fenv:0.48, fvel:0.3, fA:0.001, fD:0.12, fS:0.02, fR:0.1, aA:0.001, aD:0.3, aS:0.45, aR:0.1, ampVel:0.4, mode:1, poly:1, reset:1, l1shape:1, l1sync:32, analog:0.3, spread:0, level:2.133}` | lfo1→cutoff 0.13 | drive 0.1, rev 0.4, dly 0.4 | `{echo:{mode:"pp", divL:"1/8", fb:0.45}}` |
| A30 | **Tropfen** (Sequenz) | Wassertropfen-Sequenz (Jarre) | `{o1w:2, o2w:3, o2oct:1, o2fine:0, o2lvl:0.5, cutoff:650, res:0.8, drive:0.3, bass:0.6, kt:0.8, fenv:0.5, fvel:0.3, fA:0.001, fD:0.1, fS:0, fR:0.08, aA:0.001, aD:0.5, aS:0, aR:0.25, ampVel:0.5, mA:0.001, mD:0.05, mS:0, mR:0.05, poly:4, analog:0.1, spread:0.5, level:1.262}` | menv→pitch 0.35 | rev 0.45, dly 0.4 | `{echo:{mode:"pp", divL:"1/8.", fb:0.45}}` |

### B.2 FM6 (12) — DX7 units; `OPn: ratio-coarse(.fine) ol r[R1/R2/R3/R4] l[L1/L2/L3/L4] det vs rs`

| # | Name (cat) | Vorbild | alg / fb / trans | operators | common (gain dB, mode/poly, LFO) | fx |
|---|---|---|---|---|---|---|
| F1 | **DX-Tines E-Piano** (FM) | FM-E-Piano der 80er (DX7-Ballade) | 5 / 5 / 0 | OP1 x1 ol99 r96/26/24/55 l99/78/0/0 d2 vs2 rs3<br>OP2 x1 ol80 r95/34/26/70 l99/70/0/0 vs6 rs3<br>OP3 x1 ol92 r96/60/30/55 l99/50/0/0 vs3 rs3<br>OP4 x14 ol60 r95/55/35/78 l99/50/0/0 vs7 rs3 ks50/0/30/0/0<br>OP5 x1 ol90 r96/27/24/55 l99/76/0/0 d-4 vs2 rs3<br>OP6 x1 ol76 r95/30/24/70 l99/70/0/0 d5 vs6 rs3 | gain -13, poly/8, LFO sine 5 Hz, delay 0.8 s, pitch 0 HT, amp 0.12 | chorus I 0.6, rev 0.3 |
| F2 | **Glas-EP** (FM) | Balladen-EP mit mehr Glas | 5 / 4 / 0 | OP1 x1 ol99 r96/28/25/60 l99/78/0/0 d3 vs2 rs3<br>OP2 x14 ol66 r95/55/40/78 l99/70/0/0 vs7 rs3<br>OP3 x1 ol99 r95/22/20/50 l99/95/0/0 vs2 rs3<br>OP4 x1 ol84 r95/32/22/50 l99/90/0/0 vs6 rs3<br>OP5 x2 ol92 r95/25/20/50 l99/90/0/0 d-6 vs3 rs3<br>OP6 x1 ol72 r95/40/25/50 l99/85/0/0 d6 vs6 rs3 | gain -15.7, poly/8, LFO – | chorus II 0.7, rev 0.3 |
| F3 | **Pop-Bass DX** (FM) | FM-Bass der 80er (Lately, Take On Me) | 5 / 5 / -12 | OP1 x0 ol99 r99/45/30/70 l99/85/0/0 vs2 rs2<br>OP2 x0 ol82 r99/70/40/70 l99/50/0/0 vs5 rs3<br>OP3 x1 ol86 r99/60/30/70 l99/70/0/0 d2 vs2 rs2<br>OP4 x3 ol72 r99/85/50/70 l99/0/0/0 vs6 rs3<br>OP5 x0 ol80 r99/50/30/70 l99/80/0/0 d-2 rs2<br>OP6 x1 ol70 r99/60/35/70 l99/60/0/0 vs3 rs2 | gain -1.6, mono/1, LFO – | rev 0.05 |
| F4 | **Solid-Bass** (FM) | Slap-artiger FM-Bass | 5 / 6 / 0 | OP1 x0 ol92 r99/40/30/72 l99/88/0/0 vs1 rs2<br>OP2 x0 ol50 r99/50/40/72 l99/70/0/0 vs2<br>OP3 x1 ol95 r99/52/30/72 l99/70/0/0 vs2 rs3<br>OP4 x1 ol84 r99/74/45/72 l99/32/0/0 vs5 rs3<br>OP5 x1 ol80 r99/70/40/72 l99/40/0/0 d3 vs3 rs3<br>OP6 x3 ol72 r99/80/60/72 l99/0/0/0 vs6 rs4 | gain -2.2, mono/1, LFO – | rev 0.04 |
| F5 | **Röhrenglocke** (Glocken) | FM-Röhrenglocke | 5 / 4 / 0 | OP1 x1 ol96 r95/33/70/30 l99/0/0/0 d2 rs2<br>OP2 x3.17 ol76 r98/30/70/30 l99/0/0/0 d3 vs3 rs2<br>OP3 x1 ol96 r95/33/70/30 l99/0/0/0 d-4 rs2<br>OP4 x3.17 ol73 r98/30/70/30 l99/0/0/0 d-2 vs3 rs2<br>OP5 x2 ol70 r95/60/70/40 l99/0/0/0 vs2 rs2<br>OP6 x5 ol60 r98/70/0/40 l99/0/0/0 vs4 rs2 | gain -10.2, poly/8, LFO – | rev 0.4 |
| F6 | **Kristallglocke** (Glocken) | Glas-Glocke / Celesta-artig | 5 / 3 / 0 | OP1 x1 ol97 r96/36/30/40 l99/40/0/0 vs2 rs2<br>OP2 x3.17 ol70 r96/45/30/40 l99/30/0/0 vs4 rs2<br>OP3 x4 ol82 r99/62/40/50 l99/0/0/0 vs4 rs3<br>OP4 x7.7 ol60 r99/70/40/50 l99/0/0/0 vs5 rs3<br>OP5 x1 ol80 r80/40/30/40 l99/70/0/0 d5 vs1 rs2<br>OP6 x1 ol55 r80/40/30/40 l99/60/0/0 vs1 | gain -5.8, poly/8, LFO – | rev 0.45, dly 0.2 |
| F7 | **Marimba-Holz** (Glocken) | FM-Marimba | 5 / 0 / 0 | OP1 x1 ol99 r96/52/40/60 l99/0/0/0 vs2 rs3<br>OP2 x3 ol76 r99/85/40/60 l99/0/0/0 vs4 rs3<br>OP3 x4 ol74 r99/72/40/60 l99/0/0/0 vs3 rs3 ks54/0/40/0/0<br>OP4 x1 ol50 r99/80/40/60 l99/0/0/0 vs2<br>OP5 x1 ol0 r99/99/99/99 l0/0/0/0<br>OP6 x1 ol0 r99/99/99/99 l0/0/0/0 | gain -4, poly/8, LFO – | rev 0.3 |
| F8 | **Kalimba** (Glocken) | FM-Kalimba / Daumenklavier | 5 / 2 / 0 | OP1 x1 ol99 r96/45/35/55 l99/0/0/0 vs2 rs2<br>OP2 x8 ol66 r99/86/40/55 l99/0/0/0 vs5 rs3<br>OP3 x3 ol70 r99/70/40/55 l99/0/0/0 vs3 rs3<br>OP4 x1 ol40 r99/70/40/55 l99/0/0/0<br>OP5 x1 ol80 r96/50/35/55 l99/0/0/0 d-3 vs2 rs2<br>OP6 x5 ol52 r99/85/40/55 l99/0/0/0 vs4 | gain -9.5, poly/8, LFO – | rev 0.3, dly 0.3 |
| F9 | **FM-Pluck** (FM) | Kurzer glasiger FM-Pluck | 7 / 2 / 0 | OP1 x1 ol99 r99/46/33/62 l99/72/0/0 vs2 rs2<br>OP2 x4 ol78 r99/64/45/70 l99/40/0/0 vs6 rs3<br>OP3 x2 ol88 r99/52/38/62 l99/62/0/0 d4 vs2 rs2<br>OP4 x1 ol74 r99/62/45/70 l99/35/0/0 vs5 rs3<br>OP5 x7 ol60 r99/80/60/70 l99/0/0/0 vs7 rs4<br>OP6 x1 ol50 r99/70/50/70 l99/30/0/0 rs3 | gain -10, poly/8, LFO – | rev 0.25, dly 0.3 |
| F10 | **Glocken-Fläche** (Glocken) | Glocke über weicher FM-Fläche | 5 / 3 / 0 | OP1 x1 ol92 r95/30/25/40 l99/60/0/0 vs3 rs2<br>OP2 x3.17 ol76 r95/35/25/40 l99/40/0/0 vs4 rs2<br>OP3 x1 ol90 r42/30/25/38 l99/90/85/0 d-4<br>OP4 x1 ol66 r40/25/20/38 l90/80/72/0<br>OP5 x2 ol82 r40/30/25/36 l99/90/85/0 d5<br>OP6 x1 ol62 r38/25/20/36 l90/80/70/0 | gain -7, poly/8, LFO tri 4.5 Hz, delay 1.5 s, pitch 0.06 HT, amp 0 | chorus ENS 0.5, rev 0.55, dly 0.15 |
| F11 | **FM-Orgel** (FM) | Zugriegel-Orgel mit Perkussion | 32 / 4 / 0 | OP1 x0 ol84 r99/99/99/85 l99/99/99/0<br>OP2 x1 ol99 r99/99/99/85 l99/99/99/0<br>OP3 x2 ol88 r99/99/99/85 l99/99/99/0<br>OP4 x3 ol86 r99/62/99/85 l99/0/0/0 vs3<br>OP5 x4 ol76 r99/99/99/85 l99/99/99/0<br>OP6 x1 ol70 r99/99/99/85 l99/99/99/0 d2 | gain -15.7, poly/8, LFO sine 6.5 Hz, delay 0 s, pitch 0.03 HT, amp 0.1 | chorus I+II 0.5, rev 0.25 |
| F12 | **DX-Brass** (FM) | FM-Blech der 80er | 22 / 6 / 0 | OP1 x1 ol96 r60/50/60/60 l99/92/90/0 d2 vs1<br>OP2 x1 ol80 r41/36/55/60 l90/82/80/0 vs3<br>OP3 x1 ol95 r60/50/60/60 l99/92/90/0 d-3 vs1<br>OP4 x1 ol92 r60/50/60/60 l99/92/90/0 d5 vs1<br>OP5 x0 ol80 r60/50/60/60 l99/92/90/0 vs1<br>OP6 x1 ol78 r38/36/55/60 l92/84/82/0 vs3 | gain -14.2, poly/8, LFO sine 5.2 Hz, delay 0.9 s, pitch 0.05 HT, amp 0 | rev 0.3 |


### B.3 WT (klassisch) (4) — built in the app from the v2 WT presets with the §5.6 conversion

| Name | p (flat, diff over ANALOG_BASE) | p.wt | mods | fx |
|---|---|---|---|---|
| **WT Vokal-Fläche** | `ftype 0, cutoff 1400, res .14, fenv .25, kt .2, fA .8, fD 1.5, fS .6, fR 1.5, aA .6, aD 1, aS .85, aR 1.6, l1shape 1, l1rate .3, poly 6` | `{table:'vocal', pos:.2, scan:.7, scanTime:3}` | lfo1→cutoff .1 | rev .45, dly .1, vol .7 |
| **WT Glas** | `ftype 1, cutoff 6000, res .1, fenv .1, kt .3, fA .001, fD .8, fS .3, fR .8, aA .001, aD 1.6, aS 0, aR 1.4` | `{table:'glas', pos:.8, scan:-.5, scanTime:1.5}` | – | rev .35, dly .15, vol .7 |
| **WT Orgel** | `ftype 1, cutoff 700, res .19, fenv .55, kt .4, fA .06, fD .4, fS .55, fR .25, aA .03, aD .3, aS .85, aR .2` | `{table:'orgel', pos:.6, scan:.3, scanTime:.4}` | – | rev .2, vol .75 |
| **WT Digital** | `ftype 1, cutoff 2400, res .33, fenv .3, kt .6, fA .005, fD .3, fS .5, fR .2, aA .005, aD .2, aS .85, aR .18, glide .06, mode 2, poly 1, l1shape 0, l1rate 5.5` | `{table:'digital', pos:.7, scan:0, scanTime:1}` | lfo1→pitch .0072 | drive .1, rev .2, dly .25, vol .75 |

All four use `level .3`, `cat:'wt'` and `engine:'wt'`.

### B.4 Drum kits (7) — slot params as diffs over `DrumSynth.DEFAULTS` (full data: `drumresearch/kits.js`, `presetlib/presets-factory.js` NEW_KITS)

| Kit | Character (Trick) | KICK | SNARE | other highlights |
|---|---|---|---|---|
| **808** | Langer Kick-Ausklang (1,1 s), Kuhglocke aus zwei Rechtecken – das Original-Rezept. | `{tLvl:1, frq:49, pAmt:7, pDec:0.09, tDec:1.1, cLvl:0.35, cTyp:0, drv:0.12, dyn:0.4}` | `{tLvl:0.9, frq:238, pAmt:2, pDec:0.02, o2:0.55, o2r:2, o2d:0.6, tDec:0.16, nLvl:0.75, nTyp:"highpass", nFrq:1800, nQ:0.7, nDec:0.2}` | `clap {nLvl:1.2, nTyp:"bandpass", nFrq:1100, nQ:1.4, nHp:600, nBur:4, nGap:0.011, nDec:0.32, sRoom:0.15}`<br>`hatC {mLvl:1.1, mTun:1, mHi:1, mLo:0, mQ:1.5, mHp:7000, mDec:0.045, dyn:0.6}` |
| **909** | Kick mit großem Pitch-Sweep (30 Halbtöne in 50 ms) + Klick = der Schlag der 909. | `{tLvl:1, frq:52, pAmt:30, pDec:0.05, tHld:0.02, tDec:0.5, cLvl:0.55, cTyp:0, nLvl:0.15, nTyp:"lowpass", nFrq:5000, nDec:0.012, drv:0.3, dyn:0.4}` | `{tLvl:0.8, frq:180, pAmt:4, pDec:0.03, o2:0.7, o2r:1.8333333333333333, o2d:0.55, tDec:0.14, nLvl:1, nTyp:"lowpass", nFrq:7000, nHp:1500, nDec:0.18}` | `clap {nLvl:1.2, nTyp:"bandpass", nFrq:1200, nQ:1.2, nHp:800, nBur:4, nGap:0.009, nDec:0.28, sRoom:0.1}`<br>`hatC {mLvl:0.8, mTun:1.25, mHi:1, mLo:0, mQ:1.5, mHp:8000, mDec:0.05, dyn:0.6, nLvl:0.45, nTyp:"highpass", nFrq:9000, nDec:0.05}` |
| **Rom Pop** | Jede Stimme hat Energie zwischen 100 Hz und 8 kHz – klingt auch auf dem Handy. Toms und Snare mit kurzem Gate-Hall. | `{tLvl:1, frq:50, pAmt:34, pDec:0.06, tHld:0.035, tDec:0.42, o2:0.45, o2r:2, o2d:0.5, cLvl:0.6, cTyp:3, cTon:0.55, nLvl:0.12, nTyp:"highpass", nFrq:4000, nDec:0.008, drv:0.5, dyn:0.35}` | `{tLvl:1, wav:"triangle", frq:195, pAmt:7, pDec:0.03, o2:0.45, o2r:1.59, tDec:0.18, tSpk:0.3, nLvl:1, nCol:1, nTyp:"bandpass", nFrq:4500, nQ:0.5, nHp:1200, nDec:0.24, nCrv:0.3, sGate:0.45, sRoom:0.1, drv:0.2}` | `clap {nLvl:1.2, nTyp:"bandpass", nFrq:1500, nQ:1.1, nHp:700, nBur:4, nGap:0.008, nDec:0.22, sGate:0.3, sRoom:0.2}`<br>`hatC {mLvl:0.6, mTun:1.4, mHi:1, mLo:0, mQ:1.5, mHp:7500, mDec:0.035, dyn:0.6, nLvl:0.45, nTyp:"highpass", nFrq:7000, nDec:0.03, pan:0.15}` |
| **Gated 84** | Alles durch den Gate-Hall: dichter Raum, der nach 340 ms hart abreißt (Phil-Collins-Trick). | `{tLvl:1, frq:58, pAmt:20, pDec:0.03, tDec:0.3, tCrv:0.35, cLvl:0.5, cTyp:3, drv:0.2}` | `{tLvl:0.8, frq:190, o2:0.5, o2r:1.59, tDec:0.16, tSpk:0.4, nLvl:1.2, nTyp:"bandpass", nFrq:3500, nQ:0.6, nHp:900, nDec:0.24, nCrv:0.6, sGate:0.8}` | `clap {nLvl:1.2, nTyp:"bandpass", nFrq:1300, nQ:1.2, nHp:700, nBur:3, nGap:0.012, nDec:0.3, sGate:0.5}`<br>`hatC {mLvl:0.5, mTun:1.3, mHi:1, mLo:0, mQ:1.5, mHp:8500, mDec:0.04, dyn:0.6, nLvl:0.7, nTyp:"highpass", nFrq:8500, nDec:0.04}` |
| **FM Labor** | Hats und Becken aus FM (krumme Verhältnisse 2,73 / 1,47) statt Rauschen – metallisch und eigen. | `{tLvl:1, frq:48, pAmt:24, pDec:0.04, o2r:1, fmI:3, fmDec:0.03, tDec:0.5, drv:0.2}` | `{tLvl:0.9, frq:210, o2r:1.41, fmI:4, fmDec:0.08, tDec:0.18, nLvl:0.7, nTyp:"highpass", nFrq:2500, nDec:0.15}` | `clap {nLvl:1.2, nTyp:"bandpass", nFrq:1200, nQ:1.2, nHp:800, nBur:4, nGap:0.01, nDec:0.25, sRoom:0.15}`<br>`hatC {model:"ch", tLvl:0.7, frq:1530, o2r:2.73, fmI:9, fmDec:0.1, tDec:0.05, tfTyp:"highpass", tfFrq:6000, nLvl:0.3, nTyp:"highpass", nFrq:9000, nDec:0.04, dyn:0.6}` |
| **Disko 85** | Synth-Pop 1985: runder Kick mit „Knock“-Klick, fette Snare mit Raum, Tamburin-Shaker. Shaker auf 1/16 mit Anschlag-Akzenten = Groove. | `{tLvl:1, frq:56, pAmt:18, pDec:0.04, tHld:0.01, tDec:0.38, tCrv:0.2, cLvl:0.45, cTyp:3, cTon:0.45, drv:0.25, dyn:0.35}` | `{tLvl:0.9, wav:"triangle", frq:185, pAmt:5, pDec:0.025, o2:0.5, o2r:1.6, tDec:0.15, tSpk:0.35, nLvl:1.1, nCol:1, nTyp:"bandpass", nFrq:4200, nQ:0.55, nHp:1100, nDec:0.22, nCrv:0.25, sRoom:0.25, drv:0.15}` | `clap {nLvl:1.2, nTyp:"bandpass", nFrq:1350, nQ:1.1, nHp:700, nBur:4, nGap:0.01, nDec:0.3, sRoom:0.3}`<br>`hatC {mLvl:0.55, mTun:1.35, mHi:1, mLo:0, mQ:1.5, mHp:8000, mDec:0.03, dyn:0.6, nLvl:0.55, nTyp:"highpass", nFrq:8500, nDec:0.03, pan:0.2}` |
| **Resonanz-Perc** | Wie ein Nord Drum / Waldorf Attack: Toms mit langen Pitch-Bends (16 Halbtöne), Snare aus resonantem Rauschfilter (Q 4), FM-Glöckchen. Toms auf Grundton, Quinte, Oktave stimmen (82 / 123 / 164 Hz ≈ E2 H2 E3). | `{tLvl:1, frq:46, pAmt:26, pDec:0.07, tDec:0.7, o2r:1, fmI:1.4, fmDec:0.02, cLvl:0.3, cTyp:1, drv:0.35, dyn:0.4}` | `{tLvl:0.9, frq:230, pAmt:3, pDec:0.03, tDec:0.12, nLvl:1.7, nTyp:"bandpass", nFrq:2800, nQ:4, nEnv:1, nEnvDec:0.06, nHp:600, nDec:0.2, sRoom:0.2}` | `clap {nLvl:1.2, nTyp:"bandpass", nFrq:1600, nQ:2.2, nHp:900, nBur:3, nGap:0.013, nDec:0.35, sRoom:0.35}`<br>`hatC {model:"ch", tLvl:0.6, frq:1420, o2r:2.69, fmI:8, fmDec:0.06, tDec:0.04, tfTyp:"highpass", tfFrq:7000, nLvl:0.35, nTyp:"highpass", nFrq:9000, nDec:0.035, dyn:0.` |


**Preview phrases** (`SQ_FACTORY.PREVIEW`, `[beat, dur, note, vel]` at the project BPM): bass, seq16, seq8, lead, chord, pad, stab, arp, keys, bell (lengths in `PREVIEW_SEC`). Each factory record names its phrase in `demo`.

---

## Anhang C — Legacy aliases and migration helpers

### C.1 `setParam/getParam` legacy paths (old tests and v2 data keep working)

| legacy path | v3 key | conversion (set → v3; get is the inverse) |
|---|---|---|
| `va.wave1`, `va.wave2` | `o1w`, `o2w` | saw 0, square 1, triangle 2, sine 3 |
| `va.oct2` | `o2oct` | same |
| `va.det2` | `o2fine` | same (cents) |
| `va.mix2` | `o2lvl`, and `o1lvl = 1 − .5·mix2` | |
| `va.sub` | `subLvl` | ×1.4 (cap 1) |
| `va.noise` | `noise` | ×1.5 (cap 1) |
| `fm.ratio/index/modDecay/modSus` | `p.fm2.*` (WP3–WP6); from WP7 rebuild `p.fm6 = FMH.fromV1(...)` | same |
| `wt.table/pos/scan/scanTime` | `p.wt.*` | same |
| `glide` | `glide` | same |
| `filter.type` | `ftype` | lp24 0, lp12 1, bp 3, hp 5 |
| `filter.cutoff`, `filter.env`, `filter.kt` | `cutoff`, `fenv`, `kt` | same |
| `filter.res` | `res` | ×.95 |
| `fenv.a/d/s/r` | `fA/fD/fS/fR` | same |
| `aenv.a/d/s/r` | `aA/aD/aS/aR` | same |
| `lfo.shape` | `l1shape` | sine 0, triangle 1, sawtooth 2, square 3 |
| `lfo.rate` | `l1rate` | same |
| `lfo.sync` | `l1sync` | off 0, 1/1 4, 1/2 2, 1/4 1, 1/8 .5, 1/16 .25 |
| `lfo.depth` + `lfo.target` | one route `lfo1→cutoff` (.4·d), `lfo1→pitch` (d²/2) or `lfo1→amp` (−d/2) | `getParam` derives d from the route |
| `fx.drive`, `fx.vol`, `fx.pan` | `fx.drive`, `fx.vol`, `fx.pan` | same |
| `fx.reverb`, `fx.delay` | `fx.rev`, `fx.dly` | same |
| track `poly` | `p.poly` | same; 1 → also `mode 1` |

**Drum aliases** (`setDrumParam(voice, key, v)` with the v2 key names; these are the drum research migration mappings):

| voice | legacy → v3 |
|---|---|
| kick | level→`lvl`, tune→`frq`, punch→`pAmt` (×48), sweep→`pDec`, decay→`tDec`, click→`cLvl` (×.8), drive→`drv` |
| snare | level→`lvl`, tune→`frq`, ton→`nFrq` (3000 + ton·9000), snappy→`nLvl` (×.9), decay→`tDec` |
| clap | level→`lvl`, ton→`nFrq` (600·(2600/600)^ton), spread→`nGap` (.004 + spread·.018), decay→`nDec` |
| hatC, hatO | level→`lvl`, ton→`mTun` (.8 + ton·.6), decay→`mDec` |
| tomL, tomH | level→`lvl`, tune→`frq`, decay→`tDec`, bend→`pAmt` (×12) |
| perc | level→`lvl`, tune→`frq`, ton→`tfQ` (1 + ton·8), decay→`tDec` |

### C.2 Old-test mapping

| Old test (`§old-17`) | Status in v3 |
|---|---|
| A1 | title „SYNQUENZER“ |
| C3, §old-4.2 step 3 | a queued launch is still cancelled by a tap; a tap on a **playing** clip now queues a stop (S1) |
| D7 | still valid (the first step tap on an empty drum slot creates the clip in phase) |
| E12 | still valid (harmony functions unchanged) |
| E14 | replaced by K3 (under single C: 64, 67, 71) |
| F1, F5 | engines VA, FM, WT; F5 = every factory sound sounds (PR1) |
| F2, F3, F4 | via the C.1 aliases |
| F7 | via the drum aliases (kick tune 35 vs 80 Hz audibly different) |
| G2 | v1 → v3 migration (old key untouched) |
| G3 | round trip of the v3 project |

---

## Anhang D — Integration sketches (reference code; names match the current build)

These sketches come from the research outputs and are adapted to the decisions in this spec. They are **not** stored in the research folders, so they are reproduced here. Treat them as reference code: keep the logic, adapt names where the build differs.

### D.1 Voice proxy for the synth worklet (WP4)

```js
// AU.synth[i] = SynthHost.track(ctx, AU.tracks[i].trackIn, flatWithEng, engineMods) or null; AU.tracks[i].wkVoices = new Map()
const WkVoiceProto = Object.assign(Object.create(VoiceProto), {
  release(t, fastTau) {
    if (this.dead) return; if (t < this.start) t = this.start;
    if (!fastTau && t >= this.relT) return;
    if (fastTau) this.E.fastOff(this.id, t, fastTau); else this.E.off(this.id, t);
    this.relT = Math.min(this.relT, t); if (t < this.end) this.end = t;
    const P = S.tracks[this.track].sound.p;                                 // GC safety net only (the worklet reports {end})
    this.stopAt = t + (fastTau ? fastTau * 5 : Math.max(P.aR, .005) * 1.2 + (this.fm ? 12 : 0)) + .1;
    if (R.playing) perfCut(this.perfAll, t2b(t));
  },
  cancel() {                                                                // KILL also purges this id's queued ON/OFF in the worklet
    if (this.dead) return; this.E.kill(this.id);
    const now = nowT(); if (this.start > now + 1e-4) logDrop(this.log);
    if (this.perfAll) { if (R.playing) perfCut(this.perfAll, t2b(now), true); else for (const p of this.perfAll) if (!isFinite(p.endBeat)) p.dead = true; }
    wkVoiceDead(this);
  },
  retune(newOut, t) {
    if (this.dead) return; const P = S.tracks[this.track].sound.p;
    this.E.retune(this.id, newOut, t, P.glide > 0 ? P.glide / 3 : .004);
    const now = nowT();
    if (t > now + .001) { if (!this.rt || this.rt.t <= now) this.rt = {t, from: this.out}; else this.rt.t = Math.min(this.rt.t, t); } else this.rt = null;
    this.out = newOut; perfRetune(this, newOut, t);
    logNote({track: this.track, src: 'retune', clipNote: this.clipNote, out: newOut, time: t, dur: null, vel: this.vel});
  },
});
function spawnWkVoice(i, out, vel, t0, o) {
  const A = AU.tracks[i], E = AU.synth[i], P = S.tracks[i].sound.p, v = Object.create(WkVoiceProto);
  Object.assign(v, {id: ++VSEQ, track: i, src: o.src, clipNote: o.clipNote == null ? null : o.clipNote, clipKey: o.clipKey || null,
    out, baseOut: out, vel, start: t0, end: Infinity, relT: Infinity, stopAt: Infinity, dead: false, stolen: false,
    A, E, wk: true, fm: S.tracks[i].sound.engine === 'fm6', perf: null, perfAll: [], log: null});
  let from = -1;
  if (!o.noGlide) {                                                          // same grouping rule as the native spawnVoice
    if (A.grpT == null || Math.abs(t0 - A.grpT) > .035) { if (A.grpOuts && A.grpOuts.length) A.prevOuts = A.grpOuts; A.grpOuts = []; A.grpT = t0; }
    if (P.glide > 0 && A.prevOuts && A.prevOuts.length) { from = A.prevOuts[0]; for (const x of A.prevOuts) if (Math.abs(x - out) < Math.abs(from - out)) from = x; if (from === out) from = -1; }
    A.grpOuts.push(out); A.lastOut = out;
  }
  E.on(v.id, out, vel, t0, from);
  VOICES.push(v); A.wkVoices.set(v.id, v);
  v.perf = perfAdd(i, out, t0, null, vel); if (v.perf) v.perfAll.push(v.perf);
  return v;
}
function wkVoiceDead(v) { if (v.dead) return; v.dead = true; v.A.wkVoices.delete(v.id); const k = VOICES.indexOf(v); if (k >= 0) VOICES.splice(k, 1); }
// spawnVoice(i, out, vel, t0, o): first line
//   const eng = S.tracks[i].sound.engine; if ((eng === 'analog' || eng === 'fm6') && AU.synth[i] && !UI.forceNative) return spawnWkVoice(i, clamp(Math.round(out), 0, 127), vel, t0, o);
// makeRoom(): count and steal only native voices (v.wk !== true); global native cap 24.
// gcVoices(): for a wk voice past stopAt + 1 s: v.E.kill(v.id); wkVoiceDead(v).
// E.onEnd = id => { const v = AU.tracks[i].wkVoices.get(id); if (v) wkVoiceDead(v); };
// silenceAll / panic: for each E: E.panic(); proxies: release(now, tau) as before.
```

### D.2 CPU limiter (WP4)

```js
const LIM = {level: 0, quietSince: 0};
function cpuTick() {                                       // once per second (from tick(), using performance.now())
  const load = AU.synth.reduce((s, E) => s + (E ? E.load : 0), 0) + (UI.cpuInject || 0), q = S.settings.quality, now = performance.now();
  let want = load > .75 ? 3 : load > .60 ? 2 : load > .45 ? 1 : LIM.level;
  if (q === 'eco') want = Math.max(want, 2); else if (q === 'analog' && want < 3) want = 0;
  if (want > LIM.level) { LIM.level = want; LIM.quietSince = 0; applyLimiter(); return; }
  if (load < .30) { if (!LIM.quietSince) LIM.quietSince = now;
    else if (now - LIM.quietSince > 10000 && LIM.level > (q === 'eco' ? 2 : 0)) { LIM.level--; LIM.quietSince = now; applyLimiter(); } }
  else LIM.quietSince = 0;
}
function limited(P) {                                      // working copy sent to the worklet; the stored sound is never changed
  const L = LIM.level, fm = P.eng === 1, cap = (v, c) => Math.min(v, c);
  return {lq: L >= 1 && P.poly > 1 && !P.mode ? 0 : P.lq,
    o1uni: L >= 2 ? cap(P.o1uni, 3) : P.o1uni, o2uni: L >= 2 ? cap(P.o2uni, 3) : P.o2uni, o3uni: L >= 2 ? cap(P.o3uni, 3) : P.o3uni,
    poly: L >= 3 ? cap(P.poly, 4) : L >= 2 ? cap(P.poly, 6) : P.poly};
}
function applyLimiter() { for (let i = 0; i < 4; i++) if (AU.synth[i]) AU.synth[i].set(limited(S.tracks[i].sound.p)); UI.dirty.top = true; }
// every E.set(diff) for keys lq/o*uni/poly passes the diff through limited() first.
```

### D.3 Aufnahme-Leiste (WP2)

```js
const RL = {last: ''};
function recLaneFrame(bAud) {                               // from uiFrame(), every frame
  const on = rec.state !== 'off'; EL.app.classList.toggle('recording', on); EL.kb.classList.toggle('rec', recActive());
  if (!on) return;
  if (rec.state === 'countin' || rec.state === 'armed') {
    const n = Math.max(1, Math.ceil(rec.startBeat - bAud - 1e-6));
    const txt = (rec.state === 'countin' ? 'EINZÄHLEN ' : 'START IN ') + n + ' · ' + S.tracks[rec.track].name + ' · Szene ' + (rec.scene + 1);
    if (txt !== RL.last) { RL.last = txt; EL.recLaneTxt.textContent = txt; } return;
  }
  const cv = EL.recLaneCv, w = cv.clientWidth, h = cv.clientHeight, d = Math.min(3, devicePixelRatio || 1);
  if (cv.width !== Math.round(w * d)) { cv.width = Math.round(w * d); cv.height = Math.round(h * d); }
  const g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, w, h);
  const od = rec.state === 'overdub', clip = rec.clip, sb = rec.startBeat;
  const L = od || rec.fixedLen ? (clip ? clip.len * 4 : 4) : Math.max(4, Math.ceil((bAud - sb + .01) / 4) * 4);
  const now = od ? (((bAud - R.cstart[rec.track]) % L) + L) % L : bAud - sb;
  const view = Math.min(L, 16), t0 = od || L <= 16 ? 0 : Math.floor(now / 4) * 4 - 12, ppb = w / view, X = t => (t - t0) * ppb;
  const notes = od || rec.fixedLen ? (clip ? clip.notes : []) : rec.temp;
  let lo = 127, hi = 0; for (const n of notes) { lo = Math.min(lo, n.n); hi = Math.max(hi, n.n); }
  for (const o of rec.open.values()) { lo = Math.min(lo, o.n); hi = Math.max(hi, o.n); }
  if (lo > hi) { lo = 48; hi = 72; } const span = Math.max(12, hi - lo + 2), Y = n => h - 4 - (n - lo + 1) / span * (h - 8);
  for (let b = Math.ceil(t0); b <= t0 + view; b++) { g.fillStyle = b % 4 ? '#2d323c' : '#5d636e'; g.fillRect(X(b), 0, 1, h); }
  g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--t' + (rec.track + 1));
  for (const n of notes) g.fillRect(X(n.t), Y(n.n) - 2, Math.max(2, n.d * ppb), 4);
  g.fillStyle = '#ff4538';
  for (const o of rec.open.values()) { const t = od ? (((o.b - R.cstart[rec.track]) % L) + L) % L : o.b - sb; g.fillRect(X(t), Y(o.n) - 3, Math.max(3, (now - t) * ppb), 6); }
  g.fillRect(X(now), 0, 2, h);
  const txt = (od ? 'OVERDUB' : 'AUFNAHME') + ' · Takt ' + (Math.floor(now / 4) + 1) + (rec.fixedLen ? '/' + rec.fixedLen : '/AUTO') + ' · ' + notes.length + ' Noten'
    + (rec.endBeat != null && !rec.fixedLen ? ' · endet Takt ' + Math.round((rec.endBeat - sb) / 4) : '');
  if (txt !== RL.last) { RL.last = txt; EL.recLaneTxt.textContent = txt; }
}
// CSS: #app.recording .carrier{display:none} #app.recording .reclane{display:grid} .kb.rec .key.dn{background:#ffb3ad}
```

### D.4 Clip editor wiring, redo, step input (WP2)

```js
const REDO = [];                                           // pushUndo(): REDO.length = 0;  undo(): REDO.push({...current state of that entry})
function openRoll(t, s) {
  const tr = S.tracks[t]; if (tr.kind === 'drum') { ED.dTab = 'steps'; openEditor(); return; }
  if (!tr.clips[s]) { pushUndo(t, s, null, 'Neuer Clip');
    tr.clips[s] = {len: S.settings.recLength === 'auto' ? 1 : +S.settings.recLength, key: Object.assign({}, sceneKeyOf(s), {src: 'auto'}), notes: []}; clipChanged(t, s); }
  closeSheets(); R.editor = 'roll'; if (ED.roll) ED.roll.destroy(); ED.rollAt = {t, s};
  const col = getComputedStyle(document.documentElement).getPropertyValue('--t' + (t + 1)).trim();
  ED.roll = PianoRoll.create(EL.rollBody, rollModel(t, s), {color: col, follow: true});
  EL.rollSheet.classList.add('open'); UI.dirty.all = true;
}
function rollModel(t, s) {
  let snap = null; const cur = () => S.tracks[t].clips[s];
  return {
    getClip: cur,
    begin() { snap = cleanClip(cur()); },
    end(changed, label) { if (changed && snap) { pushUndo(t, s, snap, label || 'Bearbeiten'); afterClipEdit(t, s); } snap = null; },
    revert() { if (snap) { Object.assign(cur(), deep(snap)); afterClipEdit(t, s); } snap = null; },   // same object: the roll keeps its references
    undo: () => { undo(); ED.roll && ED.roll.refresh(); }, redo: () => { redo(); ED.roll && ED.roll.refresh(); },
    canUndo: () => UNDO.length > 0, canRedo: () => REDO.length > 0,
    audition(n, v) { const vo = auditionStart(t, n, v); if (vo) vo.release(AU.ctx.currentTime + .18); }
  };
}
function afterClipEdit(t, s) {
  const c = S.tracks[t].clips[s]; if (!c) { clipChanged(t, s); return; }
  c.notes.sort((a, b) => a.t - b.t);
  if (R.playing && R.slot[t] === s && AU.ctx) { const now = AU.ctx.currentTime + .006; cancelTrackFrom(t, now); scheduleTrack(t, t2b(now), R.schedBeat, true); }
  scheduleAutoKey(s); clipChanged(t, s); markDirty();
}
// uiFrame(): if (ED.roll) { const {t, s} = ED.rollAt, c = S.tracks[t].clips[s], vs = R.playing ? visualSlots(t, bAud) : null;
//   ED.roll.playhead(c && vs && vs.playing === s && bAud >= 0 ? ((((bAud - audCstart(t, bAud)) % (c.len * 4)) + c.len * 4) % (c.len * 4)) : -1); }
// inputDown(), route 'play', after the live voice: STEP INPUT (chord = keys within 40 ms); never recorded at the same time
//   if (ED.roll && ED.roll.state.step != null && ED.rollAt.t === R.selT && rec.state === 'off') {
//     STEPQ.notes.push(note); STEPQ.vel = vel; clearTimeout(STEPQ.timer);
//     STEPQ.timer = setTimeout(() => ED.roll && ED.roll.stepInput(STEPQ.notes.splice(0), STEPQ.vel), 40); }   // UI only, no audio timing
```

### D.5 FANG, analysis after recording, scene keys (WP2)

```js
const CAP = {buf: [], open: new Map()};
// inputDown 'play':  if (R.playing && rec.state === 'off') CAP.open.set(id, {track: R.selT, n: note, v: vel, b: audBeat()});
// inputUp:           const o = CAP.open.get(id); if (o) { CAP.open.delete(id); o.d = Math.max(1/32, audBeat() - o.b); CAP.buf.push(o); if (CAP.buf.length > 4096) CAP.buf.splice(0, 1024); UI.fangUntil = performance.now() + 8000; }
// padHit (live):     if (R.playing && rec.state === 'off') { CAP.buf.push({track: 4, n: gm, v: vel, b: audBeat(), d: .1}); UI.fangUntil = performance.now() + 8000; }
// stop():            CAP.buf.length = 0; CAP.open.clear();
function capture() {
  const ti = R.selT, tr = S.tracks[ti], ph = RecHelpers.capturePhrase(CAP.buf, ti, audBeat());
  if (!ph) { toast('Nichts zum Einfangen – erst spielen, dann FANG'); return false; }
  const si = !tr.clips[R.selS] ? R.selS : tr.clips.findIndex(c => !c);
  if (si < 0) { toast('Kein freier Platz in dieser Spur'); return false; }
  const tm = AU.ctx.currentTime, tgt = T.targetAt(tm).target, h = S.settings.harmony;
  const key = tgt && tr.kind === 'synth' ? Object.assign(Harmony.keyForRecording(tgt, S.key, h.mode, Object.assign(hopts(), {octaveMode: h.octaveMode})), {src: 'carrier'})
                                        : {root: S.key.root, scale: S.key.scale, src: 'auto'};
  const notes = ph.notes.map(n => Object.assign({}, n, {o: n.t, n: tr.kind === 'drum' ? n.n : clipNoteFor(ti, key, n.n, tm)}));   // heard = stored
  pushUndo(ti, si, null, 'Fang'); tr.clips[si] = {len: ph.len, key, notes};
  if (tr.kind === 'drum') tr.clips[si].seed = (Math.random() * 2147483647) | 0;
  analyseClip(ti, si, true);
  R.pend[ti] = {slot: si, beat: nextBarFromAudible(), cs: ph.startBeat};   // tick(): R.cstart[i] = p.cs != null ? p.cs : p.beat
  selectSlot(ti, si); toast('Eingefangen: ' + ph.len + ' Takt' + (ph.len > 1 ? 'e' : '') + ' · ' + clipInfo(tr.clips[si]), {label: 'Bearbeiten', fn: () => openRoll(ti, si)});
  return true;
}
// commitRecNote(): const raw = Math.max(0, o.b - rec.startBeat); let t = raw; if (q) t = Math.round(t / q) * q;  ... push({t, o: +raw.toFixed(4), d, n, v, born...})
function analyseClip(ti, si, recorded) {
  const c = S.tracks[ti].clips[si]; if (!c) return;
  if (recorded && S.settings.inQuant === 'auto') {
    const g = KeyDetect.detectGrid(c.notes.map(n => Object.assign({}, n, {t: n.o != null ? n.o : n.t})), {bpm: S.bpm});
    c.q = {grid: g.grid, swing: g.swing, strength: 1};
    if (g.grid !== 'off') for (const n of c.notes) if (n.o != null) n.t = KeyDetect.quantize([Object.assign({}, n, {t: n.o})], {grid: g.grid, swing: g.swing, len: c.len * 4})[0].t;
    c.notes.sort((a, b) => a.t - b.t);
  }
  if (S.tracks[ti].kind === 'synth' && c.key.src === 'auto') scheduleAutoKey(si);
}
function clipInfo(c) { const k = c.key; return KeyDetect.NAMES_DE[k.root] + (k.scale === 'aeolian' ? '-Moll' : k.scale === 'ionian' ? '-Dur' : ' ' + KeyDetect.MODE_DE[k.scale]) + (c.q ? ' · ' + c.q.grid : ''); }
let AUTOKEY_T = 0;
function scheduleAutoKey(si) { clearTimeout(AUTOKEY_T); AUTOKEY_T = setTimeout(() => applySceneKeys(si), 400); }   // UI-only timer
function applySceneKeys(si) {                               // OP-Z: one key per scene, bass counts most
  if (T.current().target) { R.keyPending = true; return; }  // never re-key audibly under an active Träger (run after ORIGINAL)
  const parts = [0, 1, 2, 3].filter(i => S.tracks[i].follow && S.tracks[i].clips[si] && S.tracks[i].clips[si].notes.length)
    .map(i => ({i, c: S.tracks[i].clips[si], med: median(S.tracks[i].clips[si].notes.map(n => n.n))}));
  if (!parts.length) return; const bassI = parts.reduce((a, b) => (b.med < a.med ? b : a)).i;
  const sk = KeyDetect.sceneKey(parts.map(p => ({notes: p.c.notes, isBass: p.i === bassI})), S.key);
  for (const p of parts) if (p.c.key.src === 'auto') { const k = KeyDetect.resolveClipKey(p.c.notes, sk, S.key); p.c.key = {root: k.root, scale: k.scale, src: 'auto'}; }
  UI.dirty.grid = UI.dirty.kb = true; markDirty();
}
```

### D.6 Stopping a single clip (WP2)

```js
function slotTap(i, s, atT) {
  const clip = S.tracks[i].clips[s];
  selectSlot(i, s);                                          // selection always follows (REC / ✎ target)
  if (!clip) return;
  ensureAudio(); if (!AU.ctx) return;
  if (!R.playing) { launch(i, s); play(); return; }
  if (R.pend[i] && R.pend[i].slot === s) { R.pend[i] = null; UI.dirty.grid = true; /* + cancel an overdub armed on it (as today) */ return; }
  const tP = pressTime(atT), vs = visualSlots(i, t2b(tP));
  if (vs.playing === s) {
    if (R.pend[i]) { R.pend[i] = null; toast('Stopp abgebrochen'); }                    // second tap: keep playing
    else if (vs.queued !== -1) { switchTrackAt(i, -1, nextBarFromAudible(tP)); haptic('tick'); }   // stop at the next bar line
    UI.dirty.grid = true; return;
  }
  if (vs.queued === s) return;
  launch(i, s, tP);
}
function stopTrackNow(i) {                                   // ■ tapped twice within 400 ms
  const now = AU.ctx.currentTime;
  R.pend[i] = null; R.prev[i] = null; R.slot[i] = -1;
  cancelTrackFrom(i, now);
  for (const v of VOICES.slice()) if (!v.dead && v.track === i && v.src === 'clip') v.release(now + .005, .01);
  if (S.tracks[i].kind === 'drum') for (const h of HITS.slice()) if (!h.dead && h.src === 'clip') { try { h.out.gain.setTargetAtTime(0, now, .01); } catch (e) {} hitStopAll(h, now + .06); }
  UI.dirty.grid = true;
}
// recPress(), overdub branch, first: if (R.pend[ti] && R.pend[ti].slot === -1 && visualSlots(ti, t2b(c.currentTime)).playing === si) R.pend[ti] = null;
// renderGrid(): playing cell gets a '■' glyph; a waiting stop: class 'qstop', text 'stopp in ' + Math.max(1, Math.ceil(vs.qBeat - bAud - 1e-6))
```

### D.7 Song recording and playback (WP6)

```js
const _switchTrackAt = switchTrackAt;                        // every launch/stop already passes through here (bar lines)
switchTrackAt = function (i, slot, beat) {
  _switchTrackAt(i, slot, beat);
  if (R.songRec && R.playing && beat >= R.songRec.startBeat) RecHelpers.logLaunch(S.song, i, slot, beat - R.songRec.startBeat);
  if (R.songPlay && !R.songApplying) { R.songOverride[i] = true; UI.dirty.song = true; }   // the user took this track over
};
// song record start (beat b0 = 0 when the transport starts with it, else the next bar line):
//   S.song = Object.assign(RecHelpers.newSong(5), {melody: {len: 1, key: Object.assign({}, S.key, {src: 'user'}), notes: []}, melodyTrack: R.selT < 4 ? R.selT : 3, loop: false});
//   while R.songRec: inputDown 'play' on R.selT === S.song.melodyTrack uses the same MEL.open/inputUp path as the melody overdub (below), offset = R.songRec.startBeat
//   R.songRec = {startBeat: b0}; for (let i = 0; i < 5; i++) RecHelpers.logLaunch(S.song, i, R.slot[i], 0);
// T.onCommit wrapper: if (R.songRec && R.playing) RecHelpers.logCarrier(S.song, t2b(entry.time) - R.songRec.startBeat, entry.target);
//                     if (R.songPlay && !R.songApplying) { R.carrierLive = true; UI.dirty.song = true; }
// tick(), BEFORE the per-track loop:
if (R.songPlay) {
  const off = R.songPlay.off;                                // transport beat of song beat 0 (moves by bars*4 per loop)
  R.songApplying = true;
  for (const e of RecHelpers.eventsIn(S.song, b0 - off, b1 - off, R.songOverride)) {
    if (e.end) { if (S.song.loop) R.songPlay.off += S.song.bars * 4; else R.songEndBeat = e.beat + off; continue; }
    R.pend[e.track] = {slot: e.slot, beat: e.beat + off};    // applied exactly at the beat by the existing pend code
  }
  if (!R.carrierLive) for (const c of S.song.carrier) { const bb = c.beat + off; if (bb >= b0 - 1e-9 && bb < b1 - 1e-9) T.recall(c.target, b2t(bb), grid()); }
  const mi = S.song.melodyTrack, mel = S.song.melody;
  if (mel && !S.tracks[mi].mute) for (const n of mel.notes) { const bb = n.t + off;
    if (bb >= b0 - 1e-9 && bb < b1 - 1e-9) { const v = spawnVoice(mi, n.n, n.v, b2t(bb), {src: 'melody'}); if (v) { v.release(b2t(bb) + Math.max(n.d, 1 / 32) * spb()); v.log = logNote({track: mi, src: 'melody', clipNote: null, out: n.n, time: b2t(bb), dur: n.d * spb(), vel: n.v}); } } }
  R.songApplying = false;
  if (R.songEndBeat != null && b1 >= R.songEndBeat) { /* stop() at R.songEndBeat (schedule via the same pend mechanism: all tracks -1, then stop) */ }
}
// melody overdub: inputDown 'play' with R.songPlay && R.melRec: MEL.open.set(id, {n: note, v: vel, b: audBeat() - R.songPlay.off});
//   inputUp: push {t: o.b, d: max(1/32, now - o.b), n, v} into S.song.melody.notes; melody.len = max(len, ceil(o.b/4)); one undo entry per pass.
// '↩ SONG': R.songOverride.fill(false); R.carrierLive = false; for each track set R.pend from RecHelpers.slotAt(S.song, track, nextBar - off) (cs = blockStart*4 + off).
```

### D.8 Lit keys, reference key, readout (WP2)

```js
function sceneRefKey() {                                     // the key the keyboard lights in TRANSPONIEREN
  const b = AU.ctx && R.playing ? audBeat() : 0;
  for (let i = 0; i < 4; i++) { const tr = S.tracks[i]; if (!tr.follow) continue;
    const sl = R.playing ? visualSlots(i, b).playing : R.selS, c = sl >= 0 && tr.clips[sl]; if (c && c.notes.length) return c.key; }
  return sceneKeyOf(R.selS) || S.key;
}
// kbPaint(), in TRANSPONIEREN:
//   const ref = sceneRefKey(), SC = Harmony.SCALES[ref.scale];
//   for (const k of KB.keys) { const deg = SC.indexOf(PCx(k.note - ref.root));
//     setCls(k.el, k.st, 'inkey', deg >= 0); setCls(k.el, k.st, 'tonic', deg === 0); }
// kbPaint(), in SPIELEN with S.settings.kbScale !== 'off': same classes on .kb.pl (quieter CSS); 'lock' adds class 'locked' to the keyboard.
//   Under an active Träger: ref = Harmony.keyForRecording(T.current().target, S.key, h.mode, hopts())  (what you hear is what is lit)
// inputDown('play'), before the live voice, only for synth tracks:
//   if (S.settings.kbScale === 'lock') { const SC = Harmony.SCALES[ref.scale]; let n = note; while (SC.indexOf(PCx(n - ref.root)) < 0) n--; if (n !== note) flashKey(n); note = n; }
//   the substituted note is what is played, recorded, captured (CAP) and step-entered
// readout for single keys (kind 'single'): deg >= 0 ? `${name} · Stufe ${['I','II','III','IV','V','VI','VII'][deg]} · ${MODE_DE[modeOfDegree(ref.scale, deg)]}`
//                                                  : `${name} · Tonart ${fmtShift(shift)}`
// modeOfDegree: SCALE_ORDER[(SCALE_ORDER.indexOf(scale) + deg) % 7]   (ionian, dorian, phrygian, lydian, mixolydian, aeolian, locrian)
// CSS: .kb.tr .key.white:not(.inkey){background:#bfae8c} .kb.tr .key.black.inkey{box-shadow:inset 0 -6px 0 var(--amber)}
//      .key.tonic::after{content:'';position:absolute;left:50%;bottom:8px;width:6px;height:6px;margin-left:-3px;border-radius:50%;background:var(--amber)}
```

### D.9 Effect buses, transport hooks, pump (WP4)

```js
async function buildFx() {                                   // from ensureAudio(), after buildMaster-like basics; do not block audio start
  const c = AU.ctx, F = S.fxBus;
  AU.M = FX.Master(c); AU.M.set(F.master); AU.masterSum = AU.M.input; AU.analyser = AU.M.analyser;
  AU.hallRet = c.createGain(); AU.hallDuck = c.createGain(); AU.hallRet.connect(AU.hallDuck); AU.hallDuck.connect(AU.masterSum);
  AU.hallPre = c.createDelay(1); AU.hallPre.channelCount = 1; AU.hallPre.channelCountMode = 'explicit'; AU.hallIn = AU.hallPre;
  AU.hall = FX.ConvHall(c); AU.hall.beforeSwap = () => tickAhead(.35); AU.hallPre.connect(AU.hall.input); AU.hall.output.connect(AU.hallRet);
  AU.echoIn = c.createGain();                                // tracks connect dlySend -> AU.echoIn synchronously (buildTrack runs right after)
  applyHall(F.hall, true);
  [AU.loopExtra, AU.compLat] = await Promise.all([FX.measureLoopExtra(c.sampleRate), FX.measureCompLatency(c.sampleRate)]);   // offline, ~20 ms
  AU.graphLat = 2 * AU.compLat;
  AU.echo = FX.Echo(c, {loopExtra: AU.loopExtra, maxSec: 6}); AU.echo.set(F.echo, S.bpm); AU.echoIn.connect(AU.echo.input);
  AU.echo.output.connect(AU.masterSum); AU.echo.toHall.connect(AU.hallIn);
  SynthHost.load(c, document.getElementById('sq-worklet-src').textContent).then(ok => { if (ok) upgradeHall(); });
}
function upgradeHall() {                                     // worklet hall replaces the convolution hall; old tail rings out
  const c = AU.ctx, old = AU.hall;
  AU.hall = new AudioWorkletNode(c, 'dirigent-hall', {numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2], channelCount: 1, channelCountMode: 'explicit'});
  AU.hallPre.connect(AU.hall); AU.hall.connect(AU.hallRet); try { AU.hallPre.disconnect(old.input); } catch (e) {}
  setTimeout(() => { try { old.output.disconnect(); old.dispose && old.dispose(); } catch (e) {} }, 3000);   // UI timer, not audio timing
  applyHall(S.fxBus.hall, true);
}
function applyHall(h, commit, t = AU.ctx.currentTime) {
  const pre = typeof h.predelay === 'string' ? FX.divSec(h.predelay, S.bpm) : h.predelay / 1000;
  AU.hallPre.delayTime.setTargetAtTime(Math.min(pre, .99), t, .02);
  if (AU.hall instanceof AudioWorkletNode) {
    for (const k of ['decay', 'size', 'damp', 'lowcut', 'tone', 'mod', 'width']) AU.hall.parameters.get(k).setTargetAtTime(h[k], t, .03);
    AU.hall.parameters.get('freeze').setValueAtTime(h.freeze ? 1 : 0, t);
  } else if (commit) AU.hall.set({decay: Math.min(h.decay, 10), size: (h.size - .35) / 1.25, damp: 1 - Math.log(h.damp / 400) / Math.log(50), bass: 1, predelay: 0, lowcut: h.lowcut, highcut: h.tone, ret: 1});
  AU.hallRet.gain.setTargetAtTime(h.ret, t, .02);
}
// buildTrack(i): A.chorus = null (created by applyTrackParams when mode !== 'off'); A.duck = c.createGain();
//   trackIn → drive → (chorus.input…chorus.output | direct) → trem → duck → vol → pan → post; post → masterSum, revSend → AU.hallIn, dlySend → AU.echoIn
// click(): connect to AU.masterSum (was AU.masterVol)
// transport hooks
function onTempoReanchor(tA) { AU.echo.set(S.fxBus.echo, S.bpm, tA); if (typeof S.fxBus.hall.predelay === 'string') applyHall(S.fxBus.hall, false, tA);
  for (let i = 0; i < 4; i++) if (AU.synth[i]) AU.synth[i].tempo(S.bpm, R.playing ? R.startTime : null); }
function onKickScheduled(t) {                                // drumHit for GM 36 (clip or pad) when fxBus.pumpSrc === 'kick'
  for (let i = 0; i < 5; i++) { const fx = S.tracks[i].sound ? S.tracks[i].sound.fx : null; if (fx && fx.pump > 0) FX.pump(AU.tracks[i].duck, t, fx.pump, FX.divSec(fx.pumpRel, S.bpm) * .9); }
  if (S.fxBus.hall.pump > 0) FX.pump(AU.hallDuck, t, S.fxBus.hall.pump, spb() * .6);
}
function onTransportStop(now, hard) {
  for (const g of AU.tracks.map(a => a.duck).concat([AU.hallDuck])) { g.gain.cancelScheduledValues(now); g.gain.setTargetAtTime(1, now, .02); }
  if (hard) { AU.echo.kill(now); if (AU.hall.port) AU.hall.port.postMessage({clear: true}); }
}
function tickAhead(sec) { const keep = LOOKAHEAD_DYN; LOOKAHEAD_DYN = sec; try { tick(); } finally { LOOKAHEAD_DYN = keep; } }   // tick() reads LOOKAHEAD_DYN
```

### D.10 drumHit v2 and the drum branch of the scheduler (WP6)

```js
const SLOTS = DrumKits.SLOTS, SLOT_BY_GM = Object.fromEntries(SLOTS.map((s, k) => [s.gm, Object.assign(s, {idx: k})])), SLOT_BY_ID = Object.fromEntries(SLOTS.map(s => [s.id, s]));
// buildTrack(4): AU.drumBufs = AU.drumBufs || DrumSynth.buildBuffers(c); AU.kit = DrumSynth.kitBus(c, AU.drumBufs, A.trackIn);
//   AU.strips = {}; for (const s of SLOTS) { AU.strips[s.id] = AU.kit.strip(); AU.strips[s.id].set(slotParams(s.id)); }
//   const K = S.tracks[4].sound.p.kit; AU.kit.setGate(K.gate, K.gateLvl); AU.kit.roomRet.gain.value = K.room;
function slotParams(id) { const p = S.tracks[4].sound.p.slots[id] || {}; return Object.assign({}, DrumSynth.DEFAULTS, {model: SLOT_BY_ID[id].model, choke: SLOT_BY_ID[id].choke || 0}, p); }
function drumHit(gm, vel, t, src, ex /* {acc, lk} from DrumSeq.expandStep */) {
  const c = AU.ctx; if (!c) return null;
  const sl = SLOT_BY_GM[gm] || SLOT_BY_GM[mapV1Drum(gm)]; if (!sl || !AU.kit) return null;
  const P0 = slotParams(sl.id), P = ex && ex.lk ? DrumSeq.lockParams(P0, ex.lk) : P0;
  chokeVoice(sl.id, t);                                       // monophonic per pad (records the choke for the cancel fix)
  if (P0.choke) for (const s of SLOTS) if (s.id !== sl.id && slotParams(s.id).choke === P0.choke) chokeVoice(s.id, t);
  const r = DrumSynth.hit(c, AU.drumBufs, AU.strips[sl.id].in, P, vel, t, {accent: ex && ex.acc ? S.tracks[4].sound.p.kit.accent : 0});
  const h = {id: ++VSEQ, voice: sl.id, gm: sl.gm, track: 4, src, start: t, stopAt: r.end, end: t + .1, srcs: r.srcs, nodes: r.nodes, out: r.out, dead: false, left: r.srcs.length, chokes: []};
  for (const s of h.srcs) s.onended = () => { if (--h.left <= 0) hitCleanup(h); };
  HITS.push(h); h.perf = perfAdd(4, sl.gm, t, t + .1 * spb(), vel);
  h.log = logNote({track: 4, src, clipNote: src === 'clip' ? sl.gm : null, out: sl.gm, time: t, dur: null, vel});
  padFlashAt(sl.idx, t); if (sl.gm === 36 && S.fxBus.pumpSrc === 'kick') onKickScheduled(t);
  return h;
}
// scheduleTrack(), drum branch inside the per-note loop (L = clip.len*4, cs = R.cstart[i], B = nominal beat of this occurrence):
//   const loop = Math.round((B - cs - nt.t) / L);
//   for (const x of DrumSeq.expandStep(nt, loop, clip.seed || 0)) {
//     let tt = b2t(Math.max(cs, B + x.beat) + swingOffset(nt.t));
//     if (tt < now) { if (!late && tt < now - .02) continue; tt = now; }       // a negative timing shift at slow BPM
//     const key = tt.toFixed(4) + ':' + nt.n, o = ev.get(key);
//     if (o) o.v = Math.max(o.v, x.v); else ev.set(key, {t: tt, n: nt.n, v: x.v, ex: x});
//   }
//   ... later: drumHit(e.n, e.v, e.t, 'clip', e.ex);
```

### D.11 Applying a sound to a track (WP3/WP4)

```js
function applySound(i, snd, opts = {}) {                      // snd = full Sound (the track owns this copy)
  const T = S.tracks[i], A = AU.tracks[i]; T.sound = snd; markDirty(); UI.dirty.strip = true;
  if (!A) return;
  if (T.kind === 'synth') {
    const wk = snd.engine === 'analog' || snd.engine === 'fm6';
    if (wk && SynthHost.state === 'ready' && !UI.forceNative) {
      if (!AU.synth[i]) { AU.synth[i] = SynthHost.track(AU.ctx, A.trackIn, Object.assign({}, snd.p, {eng: snd.engine === 'fm6' ? 1 : 0}), toEngineMods(snd.mods));
        AU.synth[i].onEnd = id => { const v = A.wkVoices.get(id); if (v) wkVoiceDead(v); }; }
      else { AU.synth[i].set(Object.assign({}, snd.p, {eng: snd.engine === 'fm6' ? 1 : 0}, limited(snd.p))); AU.synth[i].mods(toEngineMods(snd.mods)); }
      if (snd.engine === 'fm6') AU.synth[i].node.port.postMessage({fm6: snd.p.fm6});
      AU.synth[i].tempo(S.bpm, R.playing ? R.startTime : null);
    } else if (AU.synth[i]) { AU.synth[i].dispose(); AU.synth[i] = null; }   // WT / fm2 / forced native
    rebuildNativeLfos(i);                                   // FX.TempoLFO per used LFO route (native subset §5.5)
  }
  applyTrackParams(i, !!opts.immediate);                    // drive, chorus insert, sends, vol, pan, pump (sound.fx)
}
const toEngineMods = mods => SQ_FACTORY.toEngineMods((mods || []).filter(m => !String(m.dst).startsWith('fx.')));
// knob unit <-> engine unit for the ring/matrix display (§9.2)
const MOD_K = {cutoff: .9966, res: 1.15, pw: 2, fenv: 2, pan: 2, fmbright: 2};
const toKnobAmt = (dst, amt) => amt / (MOD_K[dst] || 1), toEngineAmt = (dst, k) => clamp(k * (MOD_K[dst] || 1), -1, 1);
```

### D.12 Storage, library, file save/open (WP1/WP3)

```js
const kv = SQStore.KV(), lib = SQStore.Library(kv);
const projectForSave = () => S;                                // SQStore strips runtime keys and packs notes
const autosave = SQStore.Autosave({kv, getProject: () => projectForSave(), onWarn: m => toast(m), debounceMs: 800, maxWaitMs: 4000, historyEvery: 600000, historyMax: 12});
autosave.install();
function markDirty() { if (R.playing) autosave.markDirtyPlaying(); else autosave.markDirty(); }   // add markDirtyPlaying: debounce 2 s, maxWait 20 s, tickAhead(.3) before snapshot
async function boot() {
  await kv.ready; await lib.load();
  let p = await autosave.load(), msg = null;
  if (!p) { const r2 = safeGet('dirigent.v2'); if (r2) { try { p = SQStore.migrateProject2to3(JSON.parse(r2), []); msg = 'Projekt aus DIRIGENT übernommen'; } catch (e) { p = null; } } }
  if (!p) { const r1 = safeGet('dirigent.v1'); if (r1) { try { p = SQStore.migrateProject2to3(migrateV1(JSON.parse(r1)), []); msg = 'Projekt aus Version 1 übernommen'; } catch (e) { p = null; } } }
  applyProject(p ? normalizeProject(p) : demoProject(), {first: !p});
  if (msg) toast(msg);
  if (kv.mode === 'memory') toast('Speichern im Browser nicht möglich – bitte „Als Datei sichern“ benutzen');
}
async function saveFile() {
  const text = SQStore.serializeProjectFile(projectForSave(), lib.all(), VERSION);
  await deliverFile(SQStore.fileName('project', S.name), text, 'application/json');   // §12.2: downloads capability → share → <a download>
  autosave.markSaved(); if (!UI.persistAsked) { UI.persistAsked = true; UI.persist = await SQStore.requestPersist(); }
  setUiPref('lastExport', Date.now());
}
async function onFilePicked(text) {
  const r = SQStore.parseFile(text, {migrateV1, normalizeProject});
  if (!r.ok) { toast(r.error); return; }
  if (r.kind === 'sounds') { const x = await lib.importMany(r.sounds); toast(x.added.length + ' Sounds importiert' + (x.skipped ? ', ' + x.skipped + ' schon vorhanden' : '')); return; }
  confirmInPage('Aktuelles Projekt ersetzen?', async () => { applyProject(r.project, {}); await lib.importMany(r.sounds); r.warnings.forEach(w => toast(w)); });
}
async function deliverFile(filename, text, type) {           // generalizes the old deliver(); .json is allowed directly in the viewer
  let dl = null; try { dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null; } catch (e) { dl = null; }
  if (dl) { try { await dl.save({filename, data: new Blob([text], {type})}); toast('Gespeichert: ' + filename); }
    catch (e) { const c = String((e && (e.code || e.name || e.message)) || ''); if (!/declin|cancel|abort/i.test(c)) toast('Export fehlgeschlagen' + (c ? ': ' + c : '')); } return; }
  const file = new File([text], filename, {type});
  try { if (navigator.canShare && navigator.canShare({files: [file]}) && matchMedia('(pointer:coarse)').matches) { await navigator.share({files: [file], title: filename}); return; } }
  catch (e) { if (e && e.name === 'AbortError') return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = filename; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000); showDlLink(a.href, filename);
}
```

### D.13 Sound undo, one entry per gesture (WP1)

```js
function soundSnapshot(t) { const tr = S.tracks[t]; return JSON.stringify(tr.sound || (tr.kind === 'drum' ? {kit: tr.kit, voices: tr.voices, fx: tr.fx} : {patch: tr.patch, preset: tr.preset})); }
function commitSound(t, before, label) {                     // call at pointerup of any sound gesture
  if (soundSnapshot(t) === before) return;                   // a tap or a drag back to the start adds nothing
  UNDO.push({kind: 'sound', track: t, before, label, time: performance.now()}); REDO.length = 0;
  if (UNDO.length > 60) UNDO.shift(); UI.dirty.strip = true; markDirty();
}
// in undo(): if (u.kind === 'sound') { REDO.push({kind: 'sound', track: u.track, before: soundSnapshot(u.track), label: u.label});
//   restoreSoundSnapshot(u.track, JSON.parse(u.before)); if (R.editor && u.track === R.selT) safeRebuild(openEditor);
//   toast('Rückgängig: ' + u.label, {label: '↷ Wiederholen', fn: redo}); return true; }
// restoreSoundSnapshot(t, o): o.$ === 'snd' ? applySound(t, o) : (v2 shape) assign patch/preset or kit/voices/fx + applyTrackParams(t, false)
```

### D.14 Touch guard and gesture registry (WP1; from `modux/modknob-lab.html`)

```js
const GEST = new Map(), RESTPTR = new Set(); let pendingRebuild = null;
function gestBegin(id, abort) { GEST.set(id, {abort}); }
function gestEnd(id) { GEST.delete(id); if (!GEST.size && pendingRebuild) { const f = pendingRebuild; pendingRebuild = null; f(); } }
function safeRebuild(fn) { if (GEST.size) pendingRebuild = fn; else fn(); }
['pointerup', 'pointercancel'].forEach(t => window.addEventListener(t, e => {        // bubble phase: after the control's own handler
  RESTPTR.delete(e.pointerId);
  const g = GEST.get(e.pointerId); if (g) { GEST.delete(e.pointerId); try { g.abort('window-' + t); } catch (_) {} gestEnd(-1); }
}));
const abortAll = why => { RESTPTR.clear(); for (const [id, g] of [...GEST]) { GEST.delete(id); try { g.abort(why); } catch (_) {} } gestEnd(-1); };
document.addEventListener('visibilitychange', () => { if (document.hidden) abortAll('hidden'); });
window.addEventListener('blur', () => abortAll('blur')); window.addEventListener('pagehide', () => abortAll('pagehide'));
document.addEventListener('pointerdown', e => { if (e.pointerType === 'touch' && e.target.classList && e.target.classList.contains('rest')) RESTPTR.add(e.pointerId); }, true);
function guardTouch(node) { node.addEventListener('touchstart', e => { if (e.cancelable) e.preventDefault(); }, {passive: false}); }   // stops the iOS loupe; act on pointerup
```

### D.15 Drum starter patterns and Euklid (WP6)

```js
// 16 chars = 1 bar: X accent (v 1, a 1), x normal (.8), o ghost (.45), . rest
const DRUM_PATTERNS = {
  'Rom Pop':     {kick: 'x...x...x...x...', snare: '....X.......X...', clap: '............x...', hatC: 'x.o.x.o.x.o.x.o.', hatO: '..............x.', shaker: '.o.o.o.o.o.o.o.o'},
  'Synthpop 84': {kick: 'x.....x.x.......', snare: '....X.......X...', hatC: 'x.x.x.x.x.x.x.x.', tomH: '..........x.....', tomL: '...........x..x.'},
  'Halftime':    {kick: 'x......x..x.....', snare: '........X.......', hatC: 'x.o.x.o.x.o.x.o.', rim: '...x.......x....'},
  'Disco':       {kick: 'x...x...x...x...', clap: '....x.......x...', hatC: 'x.x.x.x.x.x.x.x.', hatO: '..x...x...x...x.'},
};
const patternToNotes = p => Object.entries(p).flatMap(([id, s]) => [...s].flatMap((ch, i) => ch === '.' ? [] :
  [Object.assign({t: i * .25, d: .1, n: SLOT_BY_ID[id].gm, v: ch === 'X' ? 1 : ch === 'x' ? .8 : .45}, ch === 'X' ? {a: 1} : {})])).sort((a, b) => a.t - b.t);
// Euklid: DrumSeq.euclid(k, 16, rot) -> 16 flags; write v .8 notes for the selected instrument into the current bar (replace that row), one undo.
```

### D.16 FM block inside the synth worklet (WP7; port from `fmresearch/proto/dx6-worklet.js`)

```js
// worklet (ASCII). Tables/helpers copied verbatim: SIN, LEVEL_LUT, VEL_TAB, EXP_SCALE, DX_ALGS -> ALGS, scaleOL, scaleVel, scaleRate, scaleCurve, scaleLevel, LVL_PER_SEC, GAIN_THRESH
const FENV_BLK = CR;                                          // 16-sample control blocks (DX6 used 32): rate per block = LVL_PER_SEC(q) * 16 / SR
// onMsg: if (m.fm6) this.setFm(m.fm6, true);
setFm(P, live) { this.fm = P; this.alg = ALGS[(P.alg | 0) - 1] || ALGS[0]; this.fbShift = P.fb > 0 ? Math.pow(2, (P.fb | 0) - 8) : 0;
  if (live) for (const v of this.V) if (v.on && this.P.eng === 1) this.fmVoicePatch(v, true); }
fmNoteOn(v) {                                                 // called from startVoice when P.eng === 1
  const P = this.fm, note = v.note + (P.trans | 0), vel127 = Math.max(1, Math.min(127, Math.round(v.vel * 127)));
  v.fdone = 0; v.ffb0 = v.ffb1 = 0;
  for (let k = 0; k < 6; k++) { v.fph[k] = 0; v.flvl[k] = 0; v.fg1[k] = 0; }
  this.fmVoicePatch(v, false, note, vel127);
  for (let k = 0; k < 6; k++) this.fmAdvance(v, k, 0);
}
fmVoicePatch(v, live, note = v.fnote, vel127 = v.fvel) {        // per-op output level, rate scaling, ratio/fixed (msfa maths)
  v.fnote = note; v.fvel = vel127; const P = this.fm, lf = Math.log2(440 * Math.pow(2, (note - 69) / 12));
  for (let k = 0; k < 6; k++) { const op = P.ops[k];
    v.fon[k] = op.on !== 0 && op.ol > 0 ? 1 : 0;
    v.foutLvl[k] = Math.max(0, (Math.min(127, scaleOL(op.ol | 0) + scaleLevel(note, op.ks)) << 5) + scaleVel(vel127, op.vs | 0));
    v.frs[k] = scaleRate(note, op.rs | 0);
    if (op.fixed) { v.ffixed[k] = Math.pow(10, (op.coarse & 3) + op.fine / 100); v.fratio[k] = 0; }
    else { const det = (op.det || 0) * 0.0209 * Math.exp(-0.396 * lf) / 7 * lf; v.fratio[k] = (op.coarse ? op.coarse : 0.5) * (1 + (op.fine || 0) / 100) * Math.pow(2, det); v.ffixed[k] = 0; }
    if (live && v.fix[k] < 4) this.fmAdvance(v, k, v.fix[k]); }
}
fmAdvance(v, k, ix) {                                         // stage target + rate; macro offsets: fmAtk on R1, fmDec on R2/R3, fmRel on R4
  v.fix[k] = ix; if (ix > 3) return; const op = this.fm.ops[k], P = this.P;
  const off = ix === 0 ? P.fmAtk : ix === 3 ? P.fmRel : P.fmDec, r = Math.max(0, Math.min(99, op.r[ix] + Math.round(off)));
  const t = Math.max(16, ((scaleOL(op.l[ix]) >> 1) << 6) + v.foutLvl[k] - 4256);
  v.ftgt[k] = t; v.frise[k] = t > v.flvl[k] ? 1 : 0;
  v.frate[k] = LVL_PER_SEC(Math.min(63, ((r * 41) >> 6) + v.frs[k])) * FENV_BLK / SR;
}
// control(): for eng 1 per voice: step each op envelope (DX6 envStep; gate off -> advance(k, 3) once);
//   f0 = lut(FREQ, v.pitch + this.fm.trans + dst[D_PITCH] * 24); per op: f = ffixed[k] || f0 * fratio[k]; finc[k] = f < .45*SR ? Math.round(f / SR * 4294967296) : 0;
//   dB = (alg.car[k] ? 0 : P.fmBright + dst[D_FMBRIGHT] * 24) + dst[D_OP1 + k] * 99 * .75;
//   fg0[k] = fg1[k]; fg1[k] = v.fon[k] ? Math.pow(2, v.flvl[k] / 256 - 14) * (dB ? Math.pow(10, dB / 20) : 1) : 0;
// renderVoice(): if eng 1 -> this.fmRender(v) fills this.bl (mono) instead of renderOsc/sub/noise; then ladder unless this.fmBypass; then amp:
//   fmAmp 0: gate envelope (attack 2 ms to 1, no release), voice ends when !v.gate and no output op above GAIN_THRESH for > 256 samples (or 12 s);
//   fmAmp 1: the normal amp ADSR + the same DX end rule.
// fmRender(v): ops k = 5..0 exactly as DX6Voice.process (modIn sum, feedback 2-sample average on alg.fbDst with this.fbShift,
//   per-sample linear gain interpolation fg0 -> fg1, Uint32 phase with SIN table interpolation); outputs summed * 0.5 / sqrt(alg.nCar) into bl.
// derive(): this.fmBypass = P.eng === 1 && P.ftype <= 1 && P.cutoff >= 18000 && P.res <= .02 && P.fenv === 0 && P.drive <= .01 && !routesTo(D_CUT, D_RES, D_DRIVE, D_FENV);
```
