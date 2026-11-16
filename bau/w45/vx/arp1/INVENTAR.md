# ARP1 – Inventar „Arp für jede Synth-Spur“ (nur gelesen, Basis rel-4780 = 4.78.0)

`basis.html` = Kopie von `rel-4780/index.html` (md5 68e92c03…, 114 431 Zeilen). Alle Zeilennummern beziehen sich darauf.
Nichts an der Basis geändert. Machbarkeits-Probe nur in `pruef/` (siehe 7).

## 0. Ergebnis in drei Sätzen

1. **Der Arp-Kern ist schon da und fast engine-frei:** `ARPC` (Haupt-Faden, Block `sq-arp-src`) hält die gedrückten Töne,
   plant die Schritte im Takt-Raster, kennt Muster inkl. Treppe, räumt bei Stopp/Szenenwechsel/Neu-Planung auf und hat eine
   Test-API. Er hängt nur an **3 Zeilen** an MS 2000/Bit Mask (`A_`, `on`, `stepB`) und an **1 Zeile** in `arpOn`.
2. **Alle Noten-Quellen laufen schon durch `arpOn(i)` → `ARPC.clip/live`** (Live-Tastatur, Matrix-Clip, Song, Song-Melodie,
   Teil-Melodie, Anlauf G3, Begleiter BEG1). Offline-Render (Audio-/Video-Export) nutzt denselben Planer → kommt gratis mit.
3. **Gemessen (Prototyp, 4 Zeilen):** VA, FM und WT spielen den Arp live, in Matrix/Song und im Audio-Export; erste Note
   live nach 10 ms; Block laden 1,1 ms; Planer je tick 0,1 ms (Median, 1/32, 4-Ton-Akkord). **Fehlt:** Bedienung, Daten,
   neue Muster (Oktave, Gespielt, Wiederholen), 1/32 + Triolen frei, MIDI-Export mit Arp, Festschreiben, Hilfe.

## 1. Der vorhandene Arp der MS-Platte (MK5) – `ARPC`

Ort: `<script type="text/plain" id="sq-arp-src">` **6812** (still, erst bei Bedarf ausgewertet), `const ARPC` **6821–7103**.

| Teil | Zeilen | Was es tut |
|---|---|---|
| Raster/Typen | `RES` 6823 (1/24 … 1/4 × 4 Schläge), `TYP` 6824 (Up, Down, Alt 1, Alt 2, Random, Trigger, **Treppe**) | 6 feste Auflösungen, 7 Muster |
| Muster (rein, engine-frei) | `arpPattern(type, range, N, c, seed, cap)` **6834–6846**; Treppe 6843 (1-2-1-3-2-4 …), Zufall 6844 (Hash Saat+Zähler), Trigger 6836 | N = gehaltene Töne aufsteigend, U über `range` Oktaven (max 4, ≤ 127) |
| Zufall reproduzierbar | `fnv` 6830, `mix` 6831, `seedOf(i)` 7101 (Projekt-ID + Spur-uid) | gleicher Take klingt immer gleich |
| **Adapter** | `bmA` 6851–6852 (Bit Mask in Form des MS-Programms), **`A_(i)` 6853**, **`on(i)` 6854**, **`stepB(m)` 6855** | einzige engine-gebundene Stellen |
| Timbre-Teil (nur MS) | `voicesOf` 6857, `keyTim` 6865, `route` 6867 | bei mode 0 neutral: alles in den Arp, nichts gehalten |
| Zustand je Spur | `st(i)` 6873 (`ST` Map 6826), Protokoll `logOf` 6878 (`LOG` je uid 6827) | iv (gehaltene Intervalle), hist (geplante Schritte), next, pc, grid |
| Raster | `nomT` 6880, `swingT` 6881 (**Arp-Swing ersetzt Song-Swing**; 0 = Song-Swing über `swingOffset`), `gridSong` 6888 (Transport läuft), `gridFree` 6889 (steht: ab erster Taste) | |
| **Gehaltene Töne** | `add` 6891 (Akkord-Fang 30 ms), `query` 6900 (Gruppe; berührend = neuer Akkord; Latch hält letzte Gruppe, endet bei Szenenwechsel `s.brk`), `lateIdx` 6918 (Akkord auf dem gehörten Schlag) | |
| **Planer** | `plan(i, now, h)` **6999–7032** (Raster-Wechsel, Tempo-/Auflösungswechsel ohne Doppel, max 96 Schritte, nie Burst), `step` **6936–6977** (KEY SYNC 6947, Schritt-Tasten 6950, Abbildung `outPitch` je Schrittzeit 6954, Gate 6965, **`spawnVoice(…, {src:'arp'})` 6969**), `bmStep` 6979 | |
| **Aufräumen** | `rewind` 7034 (geplante Schritte ab t streichen, Zähler zurück), `end` 7047, `endAll` 7056, `cut` 7072 (Szenenwechsel), `cancelFrom` 7073, `carrier` 7076 (Träger-Wechsel: neu planen + retune) | |
| Quellen | `live` 7058, `liveUp` 7065, `clip` 7066 (Clip / Melodie `raw`) | |
| Takt | `tick` 7086 (vom Scheduler) | |
| Anzeige/Test | `cur` 7097 (laufender Schritt), `arpLog` 7098, `clearLog` 7099, `info` 7100; Export 7102 | |

Haupt-Faden-Kleber: `arpSrcLoad` **30779**, `arpOn(i, sync)` **33201–33210** (BM-Zweig 33203, mk 33206), `arpLoadSoon` 33211,
`arpK` 33212, `arpTick` 33213, `arpEndAll` 33214. Test-API `SYNQUENZER.arpLog/arpClear/arpInfo` **83062**, KF1 `treppe` 106082.
Bedienung MS-Platte (Block sq-mk-src): Regler `arpRes/arpGate/arpTyp/arpOct/arpLat/arpSw/arpKs/arpTgt` **9309–9319**
(Texte `ATYP_T` 9310), Tasten ARP/LATCH 10448–10460, LEDs 10144, Lauflicht `MKUI.arpFrame` (Aufruf 43202).
Daten MS: `sound.p.mk.arp` {on, res 0–5, latch, ks, last 1–8, steps (Bitmaske), type 0–6, range 1–4, gate %, swing −100…100, tgt}.

**Bit Mask (BM4):** `BMARP` **7107–7150**: 28 Muster `T` 7109 (u. a. `alt` 7126 = Ton/Oktave im Wechsel, `dbl` 7123 = jeder
Ton zweimal, `trp/trp2` Treppe), `seq` 7119, `step` 7136, `div` 7143 (SPD frei bzw. nächste Song-Teilung, `DIV` 7142 inkl.
1/8T, 1/16T, 1/32). Läuft über ARPC mit Adapter `bmA` + `bmStep` (Reihenfolge = Anschlag-Reihenfolge). Daten `p.bm.a.ar`
{t, sp, ho, tr} (Grundwert 12238/23872).

**Wiederverwendbar?** Ja. Muster (`arpPattern`, `BMARP.seq/step`) sind rein. Der Planer braucht nur ein Objekt „in Form des
MS-Programms“ (`{mode, split, sb, t[], vmax, arp:{on,res,latch,ks,last,steps,type,range,gate,swing,tgt}}`) – genau so ist
Bit Mask schon angeschlossen. Hindernisse: (a) `A_`, `on`, `stepB` sind einzeilige `const`/Funktionen in der IIFE – nur durch
**Ändern** dieser 3 Zeilen erweiterbar (Einfügen reicht nicht: `const` nicht überschreibbar, `plan` ruft `on`/`A_` intern);
(b) `stepB` nimmt sonst nur `RES[0…5]` (kein 1/32, keine 1/4-Triole) → Adapter liefert `sb` direkt wie Bit Mask;
(c) Gate auf 100 % gekappt (6965) → kein überlappendes Legato-Gate; (d) „Takt“ für KEY SYNC aus = fest 4 Schläge (6943,
`gb`), in 3/4 ungenau (vorhandene MK5-Grenze).

## 2. Noten-Weg aller anderen Synth-Engines (VA `analog`, FM `fm6`/alt `fm2`, WT `wt`, Klangkorn = WT mit `p.wt.h`)

Engines: `SYNTH_ENGINES` 24191 (analog, fm6, wt, fm2→fm6, mk, north, bm). Kein eigener „Kompakt“-Motor in dieser Fassung
(Kompakt-Programme laufen als MS 2000 = haben den MK5-Arp). Ausgenommen für ARP1: mk, bm (eigener Arp), north (Perkussion),
MTX3-Einzelspur (`tr.dvx`), STIMME/Original (Audio).

| Stelle | Zeilen | Bezug ARP1 |
|---|---|---|
| Scheduler | `TICK_MS 25`, `LOOKAHEAD 0,100` 32943, `LIVE_LEAD 0,01` 32944; `tick(h)` **33222**; Arp bei Stillstand 33230, im Lauf **33283** (nach den Clips des Fensters) | trägt ARPC schon |
| `spawnVoice` | **32010–32088**: MTX3 32013, SPK7 32015, PERC 32016, mk 32018, bm 32021, Worklet VA/FM 32030 → `spawnWkVoice` 31958 (`E.on` 31972), sonst nativ | Arp-Noten kommen mit `src:'arp'` an – kein Haken nötig |
| Clip-Note | `spawnClipVoice` 32090; `scheduleTrack` **33290**, Arp-Abzweig **33335** (`arpOn(i)` → `ARPC.clip`, `mask==null` → keine direkte Stimme) | fertig |
| Live-Tastatur | `inputDown` **36531**, Arp **36555** (`arpOn(R.selT, true)` → `ARPC.live`), `inputUp` 36589, `liveUp` **36598**; Akkord-Tasten/MIDI-In (`onMidiMsg` 55192) gehen über `inputDown` | fertig |
| Song | `songTick` 33781 → Clips über `scheduleTrack`; Song-Melodie **33870**; Teil-Melodie `s1PartMelTick` 83457 (**83469**); Anlauf `g3Entry` 65450 (**65473**); Begleiter `beg1Sched` 101089 (**101370**) | fertig |
| Neu-Planung | `cutTrackAt` 33416 (Arp 33420), `cancelTrackFrom` **33422** (Arp 33424), Stopp `stop()` 34704 (`arpEndAll` 34729), Panik 36723/36731, Klang laden `applySound` 44409 (`rewind+plan` **44435**, Laden 44418), Träger 33184/37601 | fertig |
| Transport | `startTransport` 34682 (kein Arp-Haken nötig: `plan` wechselt Raster selbst, 7004) | – |
| Offline-Render (Audio-Export, Stems, Video) | `vvRenderAudio` 75198 → `vvRenderAudio0` **75203**, `vvSwapIn` 75090 / `vvSwapOut` 75168, im Render `tick(h)` (onSusp) | **Arp-Noten klingen mit** (gemessen). `ARPC.ST` wird beim Tausch nicht gesichert: ein bei stehendem Transport *gelatchter* Akkord liefe in den Render → ARP1 ruft `ARPC.endAll()` beim Render-Start |
| Video-Bild | Noten über `logNote` (src 'arp', 6973) → `vv3Cap` | Arp-Noten erscheinen im Spur-Bild |
| MIDI-Export | `assembleMidi` **54855**, `buildMidi` 54876 (Szene/alle), `buildMidiLog` 54916 (Mitschnitt = PERF, **enthält Arp-Noten schon**), `buildMidiSong` 54955, `int54MidiClips` 54940, `exportMidi` **55167**; Export-Blatt D7 `wegeVa1Html` **87511** (Schalter „Transposition: mit Träger“ `UI.expCarrier` 87518/87537), je Spur `va1MidiSong` 76891, `va1MidiClip` 76942, `va1MidiBuild` 76955 | Szene/Song/Spur schreiben **nur Clip-Noten** (auch beim MS-Arp) → Haken + Schalter nötig. MIDI ohne Song-Swing (wie bisher) |
| Undo | `undoPush` 34820, `pushUndo` (clip) 34846, `undoState` **34851**, `undoApply` **34888**, Gruppe `groupSwap` 34840; Klang `soundSnapshot/commitSound` 44228/44244; Spur `trackSnapshot` 35673 | neue Art `'arp1'` (oder Gruppe clip+arp1 beim Festschreiben) |
| Speichern/Laden | `normTrack` **28779–28818** (übernimmt nur bekannte Felder → `tr.arp` braucht Haken vor `return o`), `normalizeProject` 28820, `serializeProject` 52733 / `buildProjectFile` 24557 (ganzes S, `stripReplacer` 29515) | Feld fehlt = Datei bitgleich wie 4.78.0 |
| Spur duplizieren | `mtxTrackDup` 96554 (über `trackSnapshot` → `restoreTrack`) | `tr.arp` wandert mit |
| Klang-Editor | `subTabsFor` 44758 (OSZ: … **STIMME** für analog/fm6/wt), `buildSynthEd` 44771, ⋯-Menü `openEdMore` **44890**, `pageVoice` **45040–45051** (Modus, Poly, Glide, Unison, Spread, Anschlag, Phasen-Reset), Bausteine `sSeg` 44690, `sToggle` 44697, `makeSeg` 44042, `lgrp` 44058, `openPop` 42483 | **Platz für ARP-Zeile: unten auf STIMME** (Spielweise, kein neuer Reiter) + Eintrag im ⋯-Menü |
| Guide/Hilfe | `ui1Entries` **55816**; KF1-Eintrag „Arp Treppe“ `kf1trp` 106049 (nur MS-Platte/Bit Mask), GD1-Hinweis 100267–100278 | neuer Eintrag `arp1`; `kf1trp`-Text erweitern |
| Werkzeugkasten | BB1-Figuren „Arp aufwärts/abwärts/auf-ab mit Oktave“ 86624–86629 (schreiben Noten, kein Arp) | nicht berührt |

## 3. NST1 „Je Note weiterschalten“ (`vx/nst1`) – Vorbild und Verträglichkeit

**Paketaufbau (Vorbild):** `basis.html` + `nst1-block.js` (Block `/* NST1-BEGIN … NST1-END */` hinter `/* LT2-END */` 110383) +
`worklet.py` + `apply.py` (Haken nur als **neue Zeilen** über eindeutige Anker `after()/before()`, Abbruch bei ≠ 1 Treffer) →
`index.html`; `nst1-test.mjs` (Abschnitte A Basis-gleich … I Startzeit, `ok()`-Zähler), `test-ergebnis.txt`, `fotos/` (hochkant/quer),
`hoeren/`, `pruef/`, `NOTES.md` (inkl. Funk-Entwurf), `LOG.md`, `INVENTAR.md`, `RECHERCHE.md`.

**Selber Noten-Weg:** NST1 hakt in `spawnVoice` (nach `snd0`), `cancelTrackFrom`, `normalizeSound`, `pickerOpen`,
`openEdMore` (2×), `buildSynthEd`, Worklet (2×). ARP1 sitzt **vor** `spawnVoice` (Quelle → ARPC → spawnVoice → NST1).
Folgen:
- Jede Arp-Note ist für NST1 eine neue Note (zählt; gewollt: „Sendersuche je Arp-Schritt“). Akkord-Regel 35 ms gilt für
  Arp-Typ „Akkord“ ebenso.
- **Lücke:** `ARPC.rewind` 7034 bricht Arp-Stimmen mit `v.cancel()` ab, **ohne** `cancelTrackFrom` → NST1-Zähler wird bei
  Arp-Neuplanung (neue Taste, Latch, Tempo, Träger) nicht zurückgenommen. ARP1 fügt in `rewind` einen Einzeiler
  `if (typeof nst1Cancel === 'function') nst1Cancel(i, t)` ein (wirkt nur, wenn NST1 da ist).
- Anker kollidieren nicht: ARP1 braucht keine NST1-Anker außer evtl. `openEdMore` (beide `after()` auf eindeutige Zeilen →
  Reihenfolge egal). **Prüfen: ARP1 allein, NST1 allein, NST1+ARP1, ARP1+NST1** (gleiche Klänge, Test beider Pakete grün).

## 4. Pflichtprüfungen (an basis.html ausgeführt, Ausgangswerte)

| Prüfung | Befehl | Basis |
|---|---|---|
| topdefs | `NODE_PATH=/opt/node-tools/node_modules node …/rel-4271/tools/topdefs.cjs <index>` | 26 Skripte, 8052 Namen, **0 doppelt, 0 Syntaxfehler** |
| dupkeys | `NODE_PATH=/opt/node-tools/node_modules node …/tools2/dupkeys.cjs <index>` | **0** doppelte Schlüssel |
| smoke | `node …/dirigent-test/smoke.mjs <abs index> <abs png>` | `errors []` (`pruef/smoke-basis.png`) |
| „MS 2000“ | `grep -o "MS 2000" <index> \| wc -l` | **1** (nur `MK_LABEL` 23644 → ARP1 darf den Namen nie ausschreiben, nur `MK_LABEL`) |
| `^  live: true,` | `grep -c "^  live: true," <index>` | **1** |
| VERSION | `const VERSION = '4.78.0'` 27574 | bleibt |

Hinweis Worklet: kein Worklet-Teil nötig. Falls doch: Worklet-Quelltext nur ASCII (NST1-Fund, `btoa`).

## 5. Lücken (was ARP1 bauen muss)

1. Daten `tr.arp` + Normierung (`normTrack`) + Undo-Art.
2. Adapter `gnA` in ARPC (3 geänderte Zeilen + eingefügte Zeilen) + `arpOn`-Zweig (eingefügt) + Laden des Blocks.
3. Neue Muster: **Oktave** (Grundton/Oktave im Wechsel; bei Einzelton = Auf über 2 Oktaven), **Gespielt** (Anschlag-Reihenfolge,
   Muster von `bmStep`), **Wiederholen** (jeder Schritt n-mal). Raten 1/4 1/8 1/16 1/32 + Triolen über `sb`.
4. Kurze Noten: eine Achtel-Note, die nur 1/16 lang klingt, bekommt beim Arp 1/16 nur den Grundton (gemessen) → Schalter
   „ganze Figur“ (Haltezeit bis zur nächsten Note, höchstens eine Figur).
5. MIDI-Export mit Arp-Noten (Schalter), reine Rechnung (gleiche Regeln wie der Planer) + Festschreiben in den Clip (ein ↶).
6. Bedienung (STIMME-Zeile, Arp-Blatt, ⋯-Eintrag), Hilfe, Test-API, NST1-Rücknahme, `ARPC.endAll()` beim Render-Start.

## 6. Recherche-Notiz (Fachwissen, nicht web-geprüft)

Übliche Arp-Grundausstattung (Hardware-Synths, DAW-Arps): Richtung Up/Down/Up-Down (mit/ohne Wiederholung der Enden)/Random/
As played/Chord; Oktaven 1–4; Rate inkl. Triolen und punktiert; Gate; Swing; Latch/Hold; Key Sync bzw. Retrigger;
Repeat/Ratchet (jeder Ton n-mal); manchmal Transpose-/Step-Sequenz. „Oktav-Bass“ = Up über 2 Oktaven auf 1/16 mit einem Ton.
Ein DAW-Kanal-Arp wird beim MIDI-Export meist **nicht** mitgeschrieben → ein „Festschreiben“-Knopf (Arp → Noten) ist der
übliche Weg. Arp in den meisten DAWs = Spur-Effekt (bleibt beim Klangwechsel), in Hardware = Teil des Programms.

## 7. Machbarkeits-Probe (nur `pruef/`, kein Paketstand)

`pruef/proto.py` ändert 4 Zeilen der Basis (Adapter `gnA` + `A_`, `on`, `stepB`, `arpOn`); `proto-test.mjs`, `proto-live.mjs`,
`proto-ms.mjs`. Ergebnisse (Clip: zwei Achtel C, zwei Achtel G, eine 1/16-lange Note F auf Achtel-Platz, 1 Takt):
- VA, FM, WT: Arp „Auf, 2 Oktaven, 1/16, Gate 80 %, Key Sync“ = C c C c G g G g F – F f (Schläge 0, .25, .5 …) – **„Da dub“** auf
  jeder Achtel; die kurze Note hat am 2. Sechzehntel nichts mehr gehalten (Lücke). Alle Noten `src 'arp'`, im Audio-Export.
- 1/32 (Gate 50 %): 22 Noten, Abstand 0,125 Schlag. Latch: läuft nach der letzten Note bis Taktende weiter (16 Noten).
- Live: erste Arp-Note 10 ms nach der Taste, nach dem Loslassen kein Rest-Zustand. MIDI-Export Szene: nur die 2 Clip-Noten.
- Block laden 1,1 ms; Planer je tick Median 0,1 ms / max 0,3 ms (1/32, Auf-Ab, 3 Oktaven, 4-Ton-Akkord). Konsole ohne Fehler.
