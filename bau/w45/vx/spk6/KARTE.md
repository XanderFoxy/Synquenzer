# KARTE SPK6 (Ebenen-Werkstatt) / SPK7 (Klangkorn) – Einbau-Karte
Quelle `vx/basis5.html` (4.60.0); alle Zeilen = basis5. Kern = `spk1DspMake` 97294–98160 (läuft im Worker aus toString).

## 1 Datenmodell Ebene, Rendern, Undo, Speichern
- Dokument `mkDoc` 98026: {meta, pcm:[Int16Array je Kanal ≤2], mid:Float32 mono, masks:Map lid→Map s→Streifen, dirty, cache (LRU 64), undo/redo, u, vc}.
- `meta` (`create` 98035): {id, name, sr, n, ch, grid{bpm,off,ts}, base{N 4096, hop 1024}, layers:[], rest{vol,solo,mute}, patches (= Verfeinern-Protokoll,
  kein Klang), jobs, teil2{notes:{lid:[…]}, tmpl, loops}}.
- Ebene = NUR Maske auf dem Original, kein eigenes Audio: {id 'L'n, name ≤40, art bass|gesang|drums|lead|pads|eigene, col '--tX', vol dB, solo, mute, ver, z?}
  (`newLayer` 97505). Maske Uint8 je Base-Frame×Bin, Kacheln 128×128 (`stNew/stPack/stUnpack` 97376–97389, `tileArr/tidy` 97392f), Streifen à 128 Frames,
  IDB-Schlüssel `spk:<id>:m<lid>:<s>` (`mkey` 97375). Rest = 255 − Σ. „Sichtbar“ gibt es nicht: nur solo/mute/vol + Tönung `tint` 97717.
- Anlegen/Löschen/Name/Farbe: op `layer` 98108 (was neu|weg|name|farbe|vol|solo|mute). Auswahl→Ebene: `transfer` 97512 (von orig|rest|lid, nach lid|'neu'|rest).
  „Kopieren“ = transfer modus 'kopieren' → nur zweite MASKE (Summe darf >255, op `sum`.over) – KEINE unabhängige Kopie.
- Rendern: `mixOf` 97557 (null = Mischpult, 'orig', lid, 'rest', {g,rest,orig}) → `gainFn` 97566 → `block(d,k,mx,sel,sv)` 97582 (Maske×STFT Original → ISTFT,
  16384 Proben, Cache-Schlüssel mit layers.ver; sel = Auswahl-Gewicht) → `render(d,mx,a,b)` 97617 (ohne sel). Ops `render` 98126 / `block` 98127.
- Abspielen (Hauptfaden): `spk1Play(from,mix,{sel,sv,bis})` 98256 (gestreamt, op block, an AU.masterSum), `spk1Stop` 98282, `spk1PlayFrom/spk1PlaySel` 98965/98969,
  Loop `spk3LpPlay` 100468.
- Undo (eigener Stapel der Seite, im Kern): `uBegin/uTouch/uEnd/uSwap` 97415–97439 = JSON von meta.layers+rest+teil2 + berührte Streifen; 30 Schritte/48 MB;
  op undo/redo 98124. App-Undo getrennt: `imp1Step(label,fn)` 102340, `soundEdit(t,label,fn)` 44203.
- Speichern: `flush` 97403 + `saveMeta` 97397 (kv `spk:doc:<id>`, `spk:idx`), PCM `spk:<id>:p<c>:<k>` (Stücke 524288). Projekt: S.spk=[{id,name}] `spk1Link` 98222,
  `spk1NormProject` 98227 (Aufruf 28895). ZIP: `spk1ZipAdd` 98233 (spektral/<id>/doc.json, p<c>.wav, m<lid>.bin; Aufruf 60256), `spk1ZipRead` 98242
  (Aufruf 60298; Regex nur `m(L\d{1,3})\.bin`), Kern `exportDoc` 98057 / `importDoc` 98066, `open` 98027 lädt Masken (98031).
- Hauptfaden: `spk1Call(op,a,tr,cb)` 98181, Worker-Text `spk1Worker` 98162 (Zeile 98165), Seite `spk1Build` 98386 (U), Liste `spk1Layers` 98783,
  Ebene ⋯ `spk1MoreDd` 98863, Tipps `spk1Tap` 98878, API `SPK1_API` 99092 (SYNQUENZER.spk1 99123).

## 2 Noten je Ebene, Anzeige, Loop → Matrix
- Kern `spk2DspMake` 99128: `noten` 99366 (Ebene rendern → trackF/segNotes; einstimmig, SPK4 macht poly), Ablage `meta.teil2.notes[lid]` (t2Of 99261) =
  [{id,t0,t1,a,b,m,f,v,conf,fi,fz(f0-Spur),st ok|zu|neu}]; `noteSel(d,q,K,bw)` 99386 = Obertonkamm einer Note (für transfer), `zuordnen` 99394, `finden` 99412
  (SPK3 ersetzt: finden3 100237, zuordnen3), Ops-Tabelle 99559 (noten, zuordnen, notenWeg, finden, klang 99565, klangFeat) + SPK3 loopSet 100347.
  Dispatch: op-Switch default → `Z2.ops[m.op]` 98144.
- Seite: Werkzeug 'noten' 99579, `spk2Each` 99590, `spk2OvDraw` 99595 (Kästchen in Ebenenfarbe; SPK5 legt Notenrolle/Überblendung darüber), `spk2NoteUp` 99611,
  `spk2NoteDd` 99629, `spk2Finden` 99656, `spk2NotenDd` 99674.
- Loop → Matrix: `spk2MxDd` 99796; `spk2MxAudio` 99823 (render → mono Int16 → `tkAddPcmTake` 60358 → Spur „Original“ `imp1OrigT` 102610, `imp1Clip` 102626,
  ein App-↶ `imp1Step`); `spk2MxMidi` 99850 (1/16-Raster → normClip → Synth-Spur `newSynthTrack` 28518). Klang nachbauen: `spk2KlOpen` 100003 … `spk2KlTake` 100085.

## 3 Chor / Tonhöhe (CHR2/CHR3/G2/G6)
- G2 68901–69578 (CHR4 ändert intern model/render → nur über die API rufen): `g2PitchMake` 68914 → {analyse, render, curve, model,…} 69159. Harmonisches Modell
  (Teiltöne ≤64 bis 7 kHz, Phase ∫f0), formanterhaltend, EINSTIMMIG (pYIN). Hauptfaden `g2Call({op:'an'|'render', key, x:Float32, sr, plan})` 69257 → {notes,f0} | {y}
  (Worker, Rückfall Hauptfaden). Plan {mode soft|hard, notes:[{t0,t1,m,to,s,e}]}, Cent = e + s·(to−m)·100. Stimmlose Teile bleiben bitgleich.
- Noten einer Ebene umsetzen (direkt): spk1Call('render',{mix:lid}) → mono → g2Call render mit je Note {t0:a, t1:b, m, to:m, s:0, e:100·Halbtöne}. Mehrstimmig
  (Pads/Akkorde): kein Phase-Vocoder vorhanden → neu im SPK6-Kern (noteSel-Kamm × Bin-Verschiebung mit Phasenfortschreibung).
- G6 Chor 69579ff: `g6Recipe(rec,dir,key)` 69664 (terz, sexte, quinte, oktave, drei, falsett, barber, unisono), `g6Step` 69629, `g6Chord` 69637, `g6Build` 69679,
  `g6Plan(v,c)` 69688 (Plan je Kopie e = iv·100 + ct), `g6Make(r,rec,dir,mix)` 69823 nur auf Audio-Clip r={t,s}|{vox}. v2-Weg G6PB 73168 (`g6pCall` 73572,
  `renderMulti` 73242 = CHR4-Zone). Echter Chor `CHR2R`/`chr2RealPlan` 94308/94310 nur im Clip-Chor (grp.echt = 1).
- CHR2/3 Stimmen trennen: `chr2Core().sep(x,sr,o,prog)` 93880 → {f0[], y[Int16 je Stimme ≤4], rest}; Worker `chr2Run` 94218; `CHR2_API.core` 94299.
- Chor aus Ebene: (a) im Spektral-Kern/Seite: g6Recipe + je Stimme g2Call(plan) + Versatz 10–40 ms/±Cent/Pan → neue Audio-Ebene; (b) App-Weg: Ebene als Take
  (wie spk2MxAudio) auf STIMME-Clip → g6Make (mit Hall/Echo/Lautheit der App).

## 4 Effekte
Spektral-Kern hat keine Effekte. App (Web Audio, in OfflineAudioContext nutzbar): Biquad (EQ/Filter), DelayNode, WaveShaper `driveCurve` 30079, Convolver mit
`tktIR(id,sr)` 90992 (`TKT_ROOMS` 90951 studio/kammer/saal/kirche/oel), `g6pGroupNodes(ctx,grp)` 73635 (Hochpass/Glocke/Höhen), `g6pcGroup` 70707 (+Hall/Echo-Sends).
Spur-FX nur live: `trackFx` 30253 / `fxOfSound` (drive, chorus, rev, dly, pan, pump, Körnung). Offline-Muster: `spk2KlRender` 99901, `g6pcMeasure` 70692, VV1 73982.

## 5 Auswahl
- `SPK1_TOOLS` 98291: rect, zeit, freq, pinsel, harm, aehn (+ noten 99579). Formen in U.sel (Vektor): `spk1ToolDown/Move/Up` 98692–98725, harm `spk1Harm` 98733
  (Kern `harmTrack` 97643), aehn `spk1Aehn` 98744 (`similar` 97693). Optionen U.opt (kante, size, weich, minus, K, bw, empf).
- Kern: `selFn(d,sel)` 97474 → {fnc(m,k) 0…1, box{m0,m1,k0,k1}}; pinsel/harm als Raster `selRaster` 97440 (Uint8 je Frame; Radierer = neg).
- Auswahl → Ebene: `spk1Into` 98809 → op transfer (1 ↶). „Zerlegen“ `zerlegen` 97855 = ganzes Stück → Drums/Bass/Gesang (Ebenen mit z), SPK5: nur Auswahl.
  `verfeinern` 97974. Auswahl hören `spk1PlaySel` 98969 (block mit sel) – liefert das Audio NUR der Auswahl.

## 6 Tastatur links
`spk1KeysDraw` 98562 zeichnet MIDI 12…135 = feste Spektrum-Zeilen (ROWS 984, 8 je Halbton, 16,4 Hz … ~19,9 kHz), unabhängig vom Song (über Nyquist leer).
`spk1SideGest` 98669: Ziehen = rollen, Tipp (pointerup ohne Bewegung, 98679) → `spk1Tone(m)` 98686 = Dreieck-Oszillator 0,16, 0,6 s Abklingen, MIDI 12…120,
an AU.masterSum – Probeton ohne Bezug zum Audio. Einhaken: Kopf `function spk1Tone(m) {` (Tipp ersetzen) und für Halten/Loslassen eigene pointerdown/up auf U.ky
aus einem Init nach `  spk1Gest(U); spk1SideGest(U);` (98428). Klangquelle: Auswahl-Audio (op block mit sel) → AudioBuffer, playbackRate 2^((m−m0)/12).

## 7 Instrumente / Spuren
- `SYNTH_ENGINES` 24191: analog, fm6, wt, fm2, mk, north, bm (+ drum). KEIN Sampler, KEINE Granular-Engine; KF1 „Körnung“ 24303 = Bitcrusher (Bits/Rate).
- WT (nativ): p.wt {table digital|vocal|glas|orgel, pos, scan, scanTime} `normWt` 24204 (`WT_TABLES` 24192); Tabellen `makeWaves` 30067 (je 4 Frames × 32 Teiltöne
  PeriodicWave; `AU.waves` 30066); Stimme `NativeVoice.source` Zeile 25551 (`o.waves[wt.table]`). Bester Andock für eine „Spektral-Welle“ (4 Frames aus der Auswahl,
  Scan = Klangwandel): Haken in normWt + 25551 + Ablage p.wt.h im Klang.
- MK-Kern Speicherwelle: `MKTAB` 9020 (64 feste Wellen, 512 Teiltöne, Mip), Worklet `mkwAdd` 14548 nimmt nur n 1…64 → eigene Welle nur mit Worklet-Änderung.
  MK „Eingang“ (o1w 7, tr.mkIn) = Live-Eingang/Abgriff einer anderen Spur.
- Audio-Spur: Takes (`tkAddPcmTake` 60358, S.takes, IDB), clip.audio {take,in,out,at} – spielt ab, nicht über Tasten in der Tonhöhe.
- Klang anlegen: `SQStore.normalizeSound({engine,name,cat,p,mods,fx})` (SQStore 24862), `applySound(i,snd)` 44358 in `soundEdit` 44203 (↶); neue Spur
  `newSynthTrack` 28518 + restoreTrack (Muster `spk2KlTake` 100085). Merkmale einer Note: Z2.ops.klang 99565 (feat.hdb Teiltonpegel, adsr, noise).

## 8 Ankerstellen
Belegt: SPK4 = Block nach `/* SPK3-END */` + Haken spk3DspMake-Zeile 98157, Worker-Text (SPK3-Teil), spk1Layers-Kopf, spk2Finden, spk2NotenDd, API noten,
SPK3 Z2.lowSplit, zerlegen ED/EB. SPK5 = Block nach `/* GD1-END */` + 22 Haken (spk1Lut, Zerlegen-Text, spk2OvDraw-Zeile, `sh.append(…)`-Zeile, spk1ToolUp
noten-Zeile, spk1Zerl-Kopf, spk1Tap solo/mute, spk1ViewDd, spk3DspMake-Zeile, Worker `'const K = '`, zerlegen s0/Schleife/emit, KI1, Guide). RV1 nach
`/* KI1-END */`. CHR4: G2 model/render, G6PB modelRuns/renderMulti.
Frei (je genau 1× gefunden):
- Block SPK6 direkt nach `/* ===== NX1-END ===== */\n` (101909); Block SPK7 direkt nach `/* INT53D-END */\n` (102771). Beide nach SPK1–3, vor der
  SYNQUENZER-Umhüllung 103062 (Test-API als Objekt anhängen).
- Kern: vor `  return {on, stft, istft, specInfo, docs, lowSplit, Z2};` (98159) → `spk6DspMake({…})`, Ops in `Z2.ops` eintragen (kein Switch-Haken).
- Audio-Ebenen mitmischen: in `block` vor `    d.cache.set(mk, outs);` (97614); render() läuft über block → mit erfasst.
- Worker-Text: Zeilenanfang `vsDspMake.toString() + ';' + spk1DspMake.toString()` (98165) – dieselbe Zeile ändern SPK4/SPK5 an anderer Stelle (beim Zusammenführen beachten).
- Export/Import: exportDoc-return 98064, importDoc 98075, spk1ZipAdd 98239, spk1ZipRead 98250 (+ Regex), open 98031.
- Seite: spk1MoreDd vor `const del = el('button', 'mbtn rb spk1-ck', 'Ebene löschen')` (98873) = Ebenen-Menü (Duplizieren, Umsetzen, Chor, Effekte, Als Klang);
  spk1Tap nach `case 'lmore'` (98896); Init nach `  spk1Gest(U); spk1SideGest(U);` (98428); Tastatur Kopf `spk1Tone` 98686. SPK7 zusätzlich normWt 24204, 25551.
