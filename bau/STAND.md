# Stand 28.11.12:39 UTC
## arp2
# ARP2 Stand
- Start 15:2x; Punkte a–e nachstellen
- apply.py + block.js geschrieben (a,b,d,e); c in Prüfung
- (a) echt: 3/4+6/8 alt 1. Note 67 (falsch), neu 60; 4/4 gleich
- (b) echt: alt 0 Stimmen nach Arp aus (Taste/Clip), neu 3/3; (e) echt: alt 4/33 falsch, neu 0/33
## arpg
# ARPG – Stand (fertig)
Arp-Gate (Spur-Arp, Blatt „Arp · Spur“) 5–200 %; > 100 % = Legato (Noten überlappen). MS-Platte/Bit Mask unverändert (Grenze dort 100).

## Bau
`python3 apply.py <eingang 4.88.0, md5 695af050…> <ausgang>` → index.html (md5 siehe Ausgabe). Anker je 1×:
## bm1
# BM1 – Stand (fertig)
- Ausgang: index.html = python3 apply.py ../rel-4860/index.html index.html (md5 e9f11848d2050250ff5fa59723e314b5).
- Kern-Test: **bm1-test.mjs** (node bm1-test.mjs <port>, Server im Ordner srv mit index.html = neu, base.html = 4.86.0) → OK BM1 12/12, Protokoll bm1-test.log.
- Aufbau: Block BM1-BEGIN/-END im Hauptskript direkt vor lkNoteX (BM1_WI, bm1Is, bm1LkAdd, bm1On), 12 Haken /*BM1*/:
  - Bit-Mask-Kern (Worklet-Text BM_WK, ASCII): Note-an liest fc (Halbtöne) → fq = 2^(fc/12); Stimme fq (Start 1); newVoice, takeKey
## chr6
# CHR6 – Stand (fertig)
Eingang 4.88.0 (md5 695af0504463a6385e21dc94e55b00c9) → `out.html` (md5 61d55dd9f17fef78c397b762f5b89e26) per
`python3 apply.py <eingang> <ausgang>` (block.js im selben Ordner).

## Änderung
## cmd3
# CMD3 – Stand (fertig)
Bau: `python3 apply.py <eingang> <ausgang>`. Erlaubter Eingang ist nur 4.88.0 (md5 695af0504463a6385e21dc94e55b00c9). Der Bau ist bitgleich wiederholbar.
Ausgang hier `index.html`, md5 58e7776394b54e05e5e9ebb907813ec1 (7 304 062 B, +3 487 B).
Block `block.js` (/* CMD3-BEGIN/-END */, im Hauptskript direkt nach /* IMP4-END */). Dazu kommen 6 Haken, je einzeilig mit `/* CMD3 */`:
- normTrack: Das Feld `ech` (eigenes Echo einer Synth-Spur, normiert wie fxBus.echo) bleibt beim Speichern, Laden und Rückgängigmachen erhalten.
## drum1
# DRUM1 – Stand
- Kern-Test-Datei: **kern.mjs** (Browser, 428×926 Touch: Lied laden → Zerlegen schnell → Drum-Ebene → Kit-Erkennung; Lieder songs.mjs,
  lieder-pruef.mjs, hart.mjs). Offline-Gegenprobe off.mjs auf dump/*.f32 (alt-hits.js = alter Code, neu-off.js = mit DRUM1).
- Bau: apply.py <eingang> <ausgang> (md5 a7515b98…, Anker = Zeile `try{window.__spk11b=…}catch(e){}` 1×, Block block.js dahinter).
- Basis 4.86.0: SUMME kick 515/528 +93 · snare 342/344 +82 · hihat 1546/1768 +1 (Fehler fast nur im Lied „hart“).
## dse
# DSE – Stand (fertig)
Bau: `python3 apply.py <eingang> <ausgang>` (Eingang 4.88.0 md5 695af0504463a6385e21dc94e55b00c9, Ausgang hier `index.html`, md5 c52c7093241d6e85a349b7d088dfb828).
Block `block.js` (/* DSE-BEGIN/-END */ direkt hinter `Object.assign(SYNQUENZER,{mtx3b:MTX3B_API});`), 9 Haken mit `/*DSE*/` bzw. tg.dse:
- mtx3bDrumView: FOLGEN-Chip vor ✕ (`folChip('steps')`, gleiche Einstellung wie DRUMS › SCHRITTE), `reg:folReg('steps')` (Finger hält),
  `pl1Deco` in decorate (Lock-Punkt/Bedingung), `dseView` (Länge-Knopf ┃n vor [Pad-Klang], Lock-Halten 480 ms, Blättern = „von Hand“, Edit = „bearbeitet“).
## ent1a
# ENT1A Stand
- Start: Analyse Arp/Stopp. stop() kehrt bei !R.playing früh zurück -> arpEndAll fehlt (Verdacht).
- Sonde 1 (hoch+quer): Latch live + gehaltene Taste, ■ -> 0 Stimmen, ARPC leer nach 200ms; Latch bleibt an; ▶ danach Arp auf 1/16-Raster. Prüfe noch Pegel.
- Pegel: nach einfachem ■ klingt nur Hall/Echo aus (gewollt; zweites ■ -> Pegel 0, Stimmen 0). Kein Arp-Ton hängt.
- ERGEBNIS: schon gut, keine Änderung. Sonden je hoch 428x926 + quer 926x428, echte Touch-Taps, 0 Seitenfehler.
## ent1b
# ENT1B Stand: FERTIG
- apply.py: 7 Anker je 1x, Eingang md5 9cfae59f07ef6b087ffe339b125878b3 -> Ausgang 70a2e70eef805be45abc6bd8878c808a
- Projekt-Wert in settings.vid6n ('m' oder 1/2/4/8); vid6N liest Projekt zuerst, sonst Gerät-Wert
- Rückgängig über kind 'set' (Haken in settingApply zeichnet Video neu und setzt Gerät-Vorschlag)
- Neues Projekt übernimmt Gerät-Vorschlag; Beschriftung Chip: "· dieses Projekt"
## ent1c
# STAND ENT1C – FERTIG
- [x] Sonde vorher: Überlappung 0, Text gekürzt ok; Tippziel 26 px (hoch) / 22 px (quer) → zu klein
- [x] apply.py: Video-Spur auf Touch (pointer:coarse) 40 px hoch, Schrift 11 px; Computer unverändert 20/24 px
- [x] Sonde nachher: 12/12 OK (Tippziel 42 px, Überlappung 0, keine Fehler)
- [x] CHANGES.md, KURZ.md
## ent1d
# ENT1D Stand
- 12:55 Start: Kopf „Klang erkennen" untersuchen (✕, ↶, Synth-Reiter, hochkant/quer).
- 13:00 Sonde vorher: ✕/Kopf/Reiter sichtbar, ≥44 px, keine Überlappung; ↶ nach Übernehmen sichtbar. Mängel: ✕ 6 px (hoch) bzw. 25 px (quer) anders als in den übrigen Blättern; langer Name 2 Zeilen.
- apply.py geschrieben (3 Haken), jetzt Test.
- 13:05 FERTIG: Sonde nachher 24/24 OK (hoch+quer), Pflichtprüfungen ok. Ausgang: ausgang.html (md5 ffc7f9a61c3ee41c671ff55ba2124d13).
## farb
# FARB – Stand: fertig

Bau: `apply.py <eingang> <ausgang>` (md5 4.88.0 = 695af0504463a6385e21dc94e55b00c9) fügt `block.css` (Marker FARB-BEGIN/-END) direkt
nach der Alias-Zeile `:root{--t9:var(--t1);…;--t24a:var(--t8a)}` im Haupt-Stil ein. Der spätere `:root`-Block gewinnt; nur
`--t9…--t16` und `--t9a…--t16a` werden neu gesetzt, `--t17…--t24` bleiben (= 1–8, MAX_T ist 16). Anker: Ende der Alias-Zeile
## fok4
# FOK4 – Stand: fertig (gebaut, gemessen; Grenzen unten)
Ausgang `index.html` md5 496e9d9d146f8bd7d48c2e61f0e04caf (Eingang 4.88.0 695af0504463a6385e21dc94e55b00c9).
Bau: `python3 apply.py <eingang> <ausgang.html>` – Block `block.js` (FOK4-BEGIN/-END) direkt vor `function fokus1Post`; 3 Haken `/*FOK4*/`:
fokus1Pre (Hochladen → fok4Up), fokus1Pre (Tönung aus, solange ein Stück im Hintergrund lädt – wie bisher bei „more“), fokus1Load/onChunk (fok4Next).
Diff: 84 Zeilen neu, 3 geändert (Block 81 Zeilen + 3 Haken-Zeilen). Pflicht: `pflicht.out`.
## ges2
# GES2 Stand
- Start: Code gefunden: Stufensuche = segment() in vsDspMake (Worker-Text via toString!), Gesang-Editor = vx2Pick/vx2AnLead/vx3Lead.
- Plan: (1) Glätten Gleiten+Vibrato in segment (Block innerhalb vsDspMake), (2) Anlauf, (3) Marken.
- apply.py + seg-block.js gebaut (Block GES2-SEG in vsDspMake vor segment, 1 Haken vor minF). Kern-Test 17/18 -> 18/18 (Noten 56 -> 53, Soll 53).
- Anlauf lagefest / Konsonant über stimmhafte Rahmen: nicht angefasst (VX3 macht Letzteres schon bis 3 Rahmen).
## ges3
# GES3 Stand
- Start 17:0x. Code: Gesang→Noten = vsNotesOf (VSD.segment, t0 = Rahmen*hop + 12 ms), Marken = detectMarks in vsMarksMake (Worker, Op 'det' über wpDetect/vxr2Det).
- Plan: (A) ges3Onset nach segment in vsNotesOf: Einsatz-Noten auf die echte Onset-Probe (A.x). (B) ges3Echt in detectMarks: 'onset'-Marken in durchgehend stimmhaftem Vokal ohne Tonhöhen-Sprung, ohne tiefes Pegel-Tal und ohne Klangfarben-Wechsel fallen weg – nur für Takes ab GES3_AB (neu).
- Gebaut: apply.py + on-block.js + mk-block.js; Kern-Test kern-test.cjs (A: Fehler 4,1→1,5 ms, Lage-Streuung 9→0,4 ms; B: Fehlmarken 44→3, Treffer 18/18). Nächstes: GES2-Test, Pflicht, Laden.
- FERTIG. Ausgang index.html (md5 siehe apply-Ausgabe, zuletzt 2ea13a3af2cf74b7c5db7a97aa39a555). Bau: python3 apply.py <eingang 4.87.0> <ausgang> (on-block.js, mk-block.js).
## ges4
# GES4 Stand
- Start 17:5x. Eingang 4.88.0 (695af…). Plan: Konsonant-Anlauf in ges3Onset genauer + Vibrato-Glätten vor Stufensuche (VSD.segment).
- 18:3x: apply.py + block.js (Vibrato-Tal + Gleit-Lücke, nur o.ges4) + kons-block.js (ges4Kons). Kern-Test kern-test.cjs läuft (A/B/C).
- FERTIG. Ausgang index.html (md5 cd3fe9bb41a0cb43c37cb0d38981f3c6). Bau: python3 apply.py <eingang 4.88.0> <ausgang> (braucht block.js, kons-block.js im selben Ordner).
- Was: (A) kons-block.js = ges4Kons vor ges3Onset: schmales (≤ 6 ms), tiefes Pegel-Tal mit Konsonant-Pegel davor und ≥ 25 dB Anstieg danach → Einsatz = Tal-Boden (sonst GES3-Regel). (B) block.js in VSD.segment, nur mit o.ges4 (nur vsNotesOf übergibt ges4:1): Pegel-Tal < 12 dB mitten im Vibrato (Tonhöhe schwingt 0,2–2,5 HT, ≥ 2 Umkehrpunkte in ±150 ms, keine Stufe) schneidet nicht; stimmlose Lücke ≤ 45 ms mitten in einem Gleiten (Steigung ≥ 0,25 HT/20 ms, Ziel passt ±1 HT, kein Pegel-Tal > 3 dB) wird überbrückt.
## imp4
# IMP4 – Stand (fertig)
Bau: `python3 apply.py <eingang> <ausgang>` (Eingang md5 a7515b98…, bitgleich wiederholbar; Ausgang hier `index.html`, md5 4e8506a9d44f95f4a1f6b67ff093e27c).
Blöcke: `xla-block.js` (/* IMP4-XLA-BEGIN/-END */ im Import-Kern sq-xla-src, vor toProject), `block.js` (/* IMP4-BEGIN/-END */ im Hauptskript nach `window.MLG2=…`).
Haken (je eine Stelle, Kommentar `/* IMP4 */`): notesIn → `imp4Stack` (nur Drums), toProject → Bericht-Zeile „DRUMS: n Schläge gleichzeitig …“ in `al.merged`,
xlaHtml → `res.report.tracks.map(r=>imp4Rep(c,res,r))` vor dem vorhandenen Zeilen-Template.
## impd
# IMPD – Stand (fertig)
Bau: `python3 apply.py <eingang> <ausgang>` (Eingang 4.87.0 md5 280c5b0b6a9ed1f8ac77868fb8d5d38f, Ausgang hier `index.html`, md5 3bdc49820caa74b8caf8902f4e01c4eb).
Block `block.js` (/* IMPD-BEGIN/-END */ direkt vor `async function nx1ImpStretch`), ein Haken mit `/*IMPD*/` in nx1ImpStretch:
`const W=await impdWarp(c,q,src)` – Anker `W.src`/`W.dst` statt `src`/`src.map(t=>t*q)`.

## imps
# IMPS – Stand (fertig)
Bau: `python3 apply.py <eingang> <ausgang>` (Eingang md5 a7515b98…, Ausgang hier `index.html`, md5 74e7f025a65581cc38f5ea7a9ef8d53d).
Block `block.js` (/* IMPS-BEGIN/-END */ direkt vor `function imp1Geo`), Haken mit `/* IMPS */`:
- imp1Run: Analyse über `impsAnalyse(c,…)` statt `imp1Analyse(c.x.slice(),…)`; Teile über `impsSeg(r,c)` statt `spk11Seg(r,c.x,c.sr)`.
- imp1Geo: Auftakt-Zahl k ab der ersten hörbaren Probe (`zs = impsZs(c)`); ohne Stille vorn (zs = 0) Rechnung wie bisher.
## ke2
# KE2 Stand (FERTIG, kleiner geliefert als bestellt)
- Eingang 4.86.0 (md5 a7515b980ddc423e84f9d5cdf8f132a6). Ausgang `out.html` = `python3 apply.py <eingang> <ausgang>` (md5 851db9d4df97e9ec25438604d6dd730b).
- Änderung: EINE Zeile im stillen Block sq-ke1-src: `const CAL = /*KE2*/ {...}` – nur die Gewichte `mk` (Engine 3) neu (aus `cal.json`), `va`/`fm` unverändert.
  Ansicht, Texte, Erkennung (Welle, Filter, Suche) bitgleich; nur die angezeigten Gewissheits-Werte/Wörter der Engine-3-Karte ändern sich.
- Kern-Test: `w/kt.mjs` (Node; Kern direkt aus der HTML über `w/kern.mjs`, Testtöne per renderH der App-Engine 3, Mikro-Simulation; Vorlagen `w/tpl.json` aus `w/tpl.cjs`),
## kks
# KKS – Stand (fertig)
Bau: `python3 apply.py <eingang> <ausgang>` (Eingang 4.88.0, md5 695af0504463a6385e21dc94e55b00c9; Ausgang hier `index.html`, md5 bd0d0ab9a14eeb310630fad54c2f67bf).
Änderungen (je Anker genau 1×):
1. Block `block.js` (`/* KKS-BEGIN … KKS-END */`, JS + kleines CSS per `<style id="kks-css">`) direkt vor `function spk7NormWt(w,base){` (gleicher Skript-Block wie der Klangkorn-Kern).
2. `function pageWt(pg,i){` + Haken `if(typeof kksPage==='function'&&kksPage(pg,i))return;/*KKS*/` – Klangkorn-Klang (engine wt mit `p.wt.h.take`) → Seite KORN.
## kmp1
fertig: KMP1 gebaut und getestet (index.html md5 b4943476ff3b5bc6951d20cbf9d37914, apply.py, block.js, kern.js, hoch.png, quer.png, KURZ.md, CHANGES.md)
als Nächstes: nichts – bereit zur Übernahme
## ksm
# KSM – Stand (fertig, kleiner Umfang ehrlich unten)
Bau: `python3 apply.py <eingang> <ausgang>` (Eingang 4.88.0 md5 695af0504463a6385e21dc94e55b00c9; Ausgang hier `index.html`, md5 171211a57a73f348b5823c45c677ac1f).
Quellen: `block-wk.js` (Worklet, ASCII, /* KSM-BEGIN (worklet) */ vor `function ks4Def(){`), `block.js` (Hauptskript, /* KSM-BEGIN */ vor `function ks4PageLfo(pg,i,n){`).
Haken (Code-Anker, je feste Trefferzahl): Worklet `startVoice` → `this.ksmV(v,this.lkEv)` nach lkStart; lkStart überspringt Paare -9000…-9017 (kein lkBad);
`ks4Lfo`/`ks4Ctl`-Aufruf → `ksmLfo`/`ksmCtl` (ohne v.ksm exakt alter Aufruf); `ks4Post` m/k je Stimme (v.ksmF); `ks4Der` liest Takt-Schläge aus P statt Q (gleiche Werte)
## ksm2
# KSM2 – Stand (fertig, Umfang ehrlich unten)
Bau: `python3 apply.py <eingang> <ausgang>` (Eingang 4.90.0 md5 a23eefd7ac3f52251e5bc881f1de4628; Ausgang hier `index.html`, md5 941cc0f750f8273b0bd63143fb236681).
Quellen: `block.js` (Hauptskript, /* KSM2-BEGIN */ vor `function lkNoteX(i,clip,nt,rb){`), `block-bm.js` (Bit-Mask-Worklet-Vorlage BM_WK, ASCII, vor `class BmProc extends AudioWorkletProcessor{`).
Haken (je feste Trefferzahl 1): lkNoteX – KSM-Locks (LKT[k].ksm) bei wt/mk/bm gehen an `ksm2Put` (vorher: wt verworfen wegen nat:'nein', mk/bm schon an lkFamOk gescheitert);
nativer spawnVoice nach `NativeVoice.source` → `ksm2NatPe` (nur wenn PL.ksm2Pe); sq-bm-src `if(lk)bm1On(o,lk);` → zusätzlich `ksm2Bm(o,lk)`;
## lt2
# LT2 STAND
- 15:2x block.js + apply.py gebaut (Stückweise-Vorzeichnen bei Tönung), Test folgt
- 15:3x erster Lauf: Endbild/Bildschirm gleich (926x428), basis bei Last <1 ohne LT; großer Lauf run1.out läuft
- 15:4x Blit durch Kopier-Shader ersetzt + Zaun (fenceSync) vor dem Zeigen; Schnelltest: Bilder gleich, Bildabstand alles 23/19 statt 31/39 ms; großer A/B-Lauf run2.out läuft (index md5 43e05a35…)
## Aufbau (index md5 43e05a3592d31884bf73f8e2eb67d3c8, Eingang 9c7f63cf…)
## lt3
# LT3 – Stand: fertig (gebaut, gemessen)
Ausgang `index.html` md5 83cb473e0c0a4d214456f7e3480423f4 (Eingang 4.90.0 a23eefd7ac3f52251e5bc881f1de4628, VERSION unverändert).
Bau: `python3 apply.py <eingang> <ausgang.html>` – Block `block.js` (LT3-BEGIN/-END) direkt hinter `// LT2-END`; 3 Haken `/*LT3*/` in lt2sDraw:
Startbedingung LT2S `(P.slow||lt3Slow(P))` (statt nur `P.slow`, Reihenfolge der übrigen Bedingungen gleich, lt3Slow zuletzt), Streifenzahl
`P.cost||lt3Est()`, Messung des Bildabstands nach jedem vollen Bild ohne Farben (`lt3Measure`). Diff `lt3.diff` +11/−3. Pflicht: `pflicht.out`.
## mlg3
fertig: MLG3 gebaut und getestet (index.html, apply.py, block.js, kern.js, quer.js, KURZ.md, CHANGES.md)
als Naechstes: nichts – bereit zur Uebernahme
## perf4
# PERF4 – Stand (fertig)
Kern-Test-Datei: **kern-test.cjs** (`node kern-test.cjs <port>`; Server-Ordner mit a/index.html = vorher, b/index.html = nachher,
je version.json {"version":"4.87.0"}; Ergebnis tests/kern.out „ERGEBNIS bitgleich“). Dazu ke1-test.cjs (voller Zustand Klang
erkennen a/b/a, tests/ke1-*.json), rauch.js `<port> b` (tests/rauch-b.out), tests/doppelt.out.

## perf5
# PERF5 – Stand (fertig)
Kern-Test-Datei: **kern-test.cjs** – `node kern-test.cjs <port> [<server-ordner>]` (Standard-Ordner: ./srv). Im Server-Ordner
a/index.html = vorher, b/index.html = nachher, je version.json {"version":"4.88.0"}; Server z. B. `cd srv && python3 -m http.server <port>`.
Gegen eine andere Fassung: die andere Datei als b/index.html (oder a/) hineinlegen und neu laufen lassen. Ergebnis tests/kern.out,
Schluss-Zeile „ERGEBNIS bitgleich“. Prüft: 12 Werksklänge bitgleich (FNV je Kanal, Kontrolle a/a), Worklet-Vorlagen laden (MIC_WK,
## spkv
# SPKV auf 4.87.0 – Stand: fertig (gebaut, gemessen; Grenzen unten)
Ausgang `index.html` md5 81347f5bb25e53205c248fa1e4b6eaeb (Eingang 280c5b0b6a9ed1f8ac77868fb8d5d38f). Bau: `python3 apply.py <eingang> <ausgang>`
(Block `block.js` mit SPKV-BEGIN/-END direkt vor `async function verfeinern` in spk1DspMake → läuft im Worker, kein neuer Top-Level-Name;
1 Haken `/*SPKV*/` nach `refineEst(...)` in verfeinern). Diff zur Basis: 1 Zeile ersetzt + Block.

## spkv2
# SPKV2 auf 4.88.0 – Stand: fertig (gebaut, gemessen; Grenzen unten)
Ausgang `index.html` md5 2b2ae4e36cd18528b270f499a3465ae3 (Eingang 695af0504463a6385e21dc94e55b00c9). Bau: `python3 apply.py <eingang> <ausgang>`.
apply.py ersetzt den ganzen SPKV-Block (`alt.js`, 1 Treffer, liegt in spk1DspMake → Worker) durch `block.js` (SPKV2-BEGIN/-END,
gleicher Funktionsname spkvFix, kein neuer Top-Level-Name). `SPKV2_DEV=1` baut eine Dev-Fassung mit Debug-Haken (nur für test/dev-spkv2.mjs, Hauptfaden).

## szn
# SZN – Stand (fertig)
Bau: `python3 apply.py <eingang> <ausgang>` (Eingang 4.88.0 md5 695af0504463a6385e21dc94e55b00c9, Ausgang hier `index.html`, md5 7c866eb7b57260fed5029e15e4ac2a3d).
Drei Anker, je genau 1×:
- CSS `block.css` (/* SZN-BEGIN/-END */) direkt nach `.scn .sc:empty{display:none}` (Regel der Akkord-Zeile im Szenen-Kopf).
- JS `block.js` (/* SZN-BEGIN/-END */: `sznName`, `sznHead`) direkt vor `function buildGrid(){`.
## ton1
# TON1 – Stand (fertig)
- Ausgang: index.html = python3 apply.py ../rel-4850/index.html index.html (md5 125767aed0f89918371d0729d07a6f82).
- 9 Haken (/*TON1*/) + Block TON1-BEGIN/-END vor spk7TrE. Worklet-Kern: wartende Stimmen laufen weiter (Hüllkurve, Wartezeit),
  bei Ankunft Einstieg an der richtigen Stelle + 5-ms-Blende; Vorab-Quelle (ohne Spektren) wird bei der vollen Quelle übernommen.
  Hauptfaden: ton1Got (PCM gelesen → sofort an wartende Engines), ton1Pre (Engine wartet, PCM schon da → sofort füttern).
## ton2
# TON2 – Stand (fertig)
- Ausgang: index.html = python3 apply.py ../rel-4860/index.html index.html (md5 f714174b731b2d82d47ff897ca2ef62f)
- 4 Haken (/*TON2*/) + Block TON2-BEGIN/-END vor tkLoad:
  1. tkPcm: Stücke mit Vorab-Fenster (TON2_W=6) parallel anfordern, weiter in Reihenfolge einsetzen (gilt für alle Leser von tkPcm).
  2. tkLoad: ton2Load = tkPcm + gemerkte Analyse (<take>:lv1 im Audio-Speicher, ArrayBuffer: Kopf-JSON + Float32-Hüllkurve nur in Begrenzer-Abschnitten) gleichzeitig.
## tpfl
# TPFL – Stand (fertig, nur Tests)
Kein App-Code geändert, kein apply.py: Die App bleibt 4.90.0 (md5 a23eefd7ac3f52251e5bc881f1de4628). Pflicht für 4.90 siehe `pflicht.out`: „MS 2000“ 1×, „  live: true,“ 1×, verbotene Zahlen 0×.
Geänderte Testdateien (Original je `*.bak` daneben):
- `../imp4/imp4-test.cjs` (T6 neuer Bericht-Text; Aufruf jetzt `node imp4-test.cjs <port> [basis-ordner] [neu-ordner]`)
- `../arpg/arpg-test.cjs` (A2 ohne `appVersion`)
## trp2
- 16:14 apply.py + block.js gebaut (2 Haken: clipNoteFor, Takt-Planung), Test folgt
## Aufbau (Ausgang index.html md5 d33e9f1ed7baa69e92d7db5d729a65c4, Eingang a7515b98… = 4.86.0)
- Block TRP2-BEGIN…TRP2-END vor `function trp1Live` (neue Namen: trp2NoteFor, trp2Tick, trp2Re) + 3 Haken `/*TRP2*/`:
  1. clipNoteFor (1. Zeile): bei ▶ SONG in einem Stufen-Teil sucht trp2NoteFor die Clip-Note, deren outPitch (mit trp1Pre) = gespielte Note (sonst null → alter Weg).
  2. Takt-Planung vor `kf1Plan`: trp2Tick ruft an jeder Stufen-Grenze im Fenster applyCarrierChange({time}) → gehaltene Clip-Noten neu stimmen (wie XP.due bei Rückungen), nach dem Einplanen der Noten.
## vl3
fertig: VL3 gebaut + Kern-Test 10/10 grün, KURZ.md + CHANGES.md geschrieben (Ausgang md5 9bb6ee81)
als Nächstes: nichts – bereit zur Übergabe
## vox2
# VOX2 Stand
- Start: Eingang 4.85.0 geprüft (md5 9c7f63cf…). Keine echten Takes vorhanden (realvox fehlt) -> synthetische Testsignale.
- Plan: (1) Klicks in lauten tiefen Vokalen: puls-synchroner Vergleich in clickScan.test; (2) Plopps messen; (3) Raumton nur wenn Zeit.
- 20 min: Test-Gerüst w/ (gen.mjs synth. Gesang, kt.mjs Klick-Test) fertig; Basis: Treffer 76–80/80, Fehlalarme sauberer tiefer Take A2: 3 (letzter Stimmlippen-Puls am Notenende). block.js Entwurf.
- FERTIG (Endfassung md5 a40c87ea50c3b8dcdbb75647e1e72158 = out.html aus apply.py):
## vox3
# VOX3 Stand
- Start 16:2x: Eingang 4.86.0 (md5 a7515b98…). Plan: (1) Test-Gerüst w/pt.mjs (Plopps) + w/rt.mjs (Raumton-Farbe), synthetisch; (2) Plopp-Erkennung/-Reparatur; (3) Raumton-Farbe.
- 16:3x: block.js+apply.py v1 (Plopps 2. Durchgang, Raumton-Farbverlauf). Plopp-Test w/pt.mjs: 90/120 -> 107/120, fehl 0, sauber 0. Offen: tiefe Takes A/A2.
- 16:4x: v2 (Dominanz-Regel für tiefe Stimmen): 113/120, fehl 0, sauber 0.
- 16:5x: Raumton-Test w/rt.mjs: Farbfehler Mittel 2,05 -> 1,27 dB, max 4,25 -> 2,44, beide Enden <=2 dB 8/20 -> 13/20.
## vtrim
# VTRIM – Stand (fertig)
Ausgang: index.html (md5 siehe unten) = rel-4910/index.html (4.91.0, md5 44fa0f187f10e18dfc5944fcfe1b5bdb) + apply.py (17 Anker, atomar, Block `/* VTRIM-BEGIN … VTRIM-END */` direkt hinter `/* VL3-END */`, Quelle vtrim-block.js).

## Bau
- Daten: `clip.audio.vt={k,e,a}` (Take-Id, Ende/Anfang in Sekunden im gespielten Take). Normalisierer-Hook `tkExt().audio` speichert nur gültige Werte und nur, wenn `k` zum Take passt; `a.v3e=1` = Vorlauf-Fähnchen wurde gezogen.
## vxrr
# VXRR – Gesang reinigen: Regler (fertig)

Bau: `python3 apply.py <rel-4880/index.html> <ausgang.html>` (md5-Prüfung 695af050…, 9 Anker je genau 1×, Block VXRR-BEGIN/-END vor `function vr1BreathTap(E){`, kein CSS nötig – nutzt `.clrow/.cllab/.clr` des Säubern-Blatts).

## Was geändert ist
## werkzeug
# STAND werkzeug (Grundlage)
- [ ] pflicht.py
- [ ] rauch.mjs
- [ ] KARTE.md
- [ ] base geprüft
## zrl2
# ZRL2 auf 4.85.0 – Stand: fertig (2 von 3 Punkten)
Ausgang `index.html` md5 cbdf7b2e629b5d3306eb03e1c5890a20 (Eingang 9c7f63cf…). Bau: `python3 apply.py <eingang> <ausgang>` (Blöcke `block-q.js`, `block-lo.js`).
Gebaut (bitgleich):
1. Tiefband (`magsLo`, spk3DspMake): Rand-Rahmen des vorigen Streifens werden übernommen (gleiche FFT-Paare, Prüfung Signal-Objekt, Fenster, N/R/K, cen je Rahmen, Versatz gerade). Speicher kopiert vor der Rückgabe (lowSplit4 ändert Y in place), 2 Einträge je Schlüssel, Freigabe im finally von zerlegen.
2. zPrep-Quantisierung ohne log10: Tabelle über float32-Bits (Exponent + 6 Mantissen-Bits), je Zelle höchstens eine Schwelle (per Binärsuche mit der alten Formel gefunden), nahe der Schwelle (±2,5e-4 relativ) und Sonderwerte genau gerechnet.
## zrl3
# ZRL3 auf 4.86.0 – Stand: fertig (Kern gebaut und gemessen; Grenzen unten)
Ausgang `index.html` md5 f0a4ae8ced20e9fa72efc8dc57e89f76 (Eingang a7515b98…). Bau: `python3 apply.py <eingang> <ausgang>` (Block `block.js`, 1 Haken `/*ZRL3*/`).
**Kern-Test-Datei: `test/test-zrl3.mjs`** (`node test-zrl3.mjs <neu.html> <basis.html>`, SEK=40 RUNDEN=2). Ausgaben: `test/test-zrl3.out` (40 s, 2 Runden),
`test/test-zrl3-final20.out` (Endfassung, 20 s). Der 40-s-Lauf lief auf der Vorfassung mit 48 MB Speichergrenze; einziger Unterschied zur Endfassung ist die
Grenze (32 MB), die nicht auf die Bits wirkt. Die Endfassung ist mit 20 s nachgeprüft.
