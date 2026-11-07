# Paket TAKT (Kürzel TKT) – 3/4 richtig, Clips umwandeln, Dur ↔ Moll, Effekt-Rack, Öltank-Hall

## Für Xander
- 3/4 stimmt jetzt überall: Metronom (Betonung), Einzähler (3 Klicks), TAKT-Anzeige und die Takt-Lampen zeigen 3 – auch wenn nur die Clips auf 3/4 stehen. LAUF zeigt je Seite einen 3/4-Takt (12 Schritte). Szenen wechseln am 3/4-Taktstrich, nicht mitten im Takt.
- Taktart eines Teils oder des ganzen Songs gewechselt? Die Meldung hat jetzt **[Clips umwandeln]**: jeder Takt wird ins neue Raster gefaltet, ein ↶. Beim Teil als neue Version (das Original bleibt v1), beim ganzen Song auch die Clips in der Matrix.
- **≡ › Song › Dur ↔ Moll …**: macht eine Moll-Version (C-Dur → c-Moll oder a-Moll) – Melodie, Akkorde, Bass, Akkord-Zeilen; Drums bleiben, Gesang wird nicht umgerechnet. A/B zum Vergleichen, ↶. Geht auch Moll → Dur.
- **FX › [RACK]**: alle Effekte als Geräte untereinander (SPUR, CHORUS, EQ · KOMP, HALL, ECHO, MASTER) mit An/Aus-Lampe, großen Reglern und Pegel live. Das alte FX-Blatt bleibt.
- **FX › HALL › [RAUM ▾]**: Studio, Kammer, Saal, Kirche – und der **Öltank** (riesiger Betontank, 8 / 30 / 75 s Nachhall, die Tiefen klingen am längsten). Zum Ausprobieren: lange Flächen, einzelne Schläge.
- Auch im „Wo finde ich …?“ (Öltank, Rack, Moll, Taktart).

## Technik
Ein Block `/* ===== TKT BEGIN … */ … /* TKT-END */` direkt hinter `Object.assign(SYNQUENZER, {vd3: VD3_API});` (vor `const NO_SYNC`), CSS per `<style id="tkt-css">` aus dem Block. Neue Schlüssel nur mit Präfix: `clip.tkt`, `S.fxBus.hall.tktRaum`, `S.fxBus.hall.tktLen`, Undo-Art `'tkt'`, Blätter `tktmode`/`tktrack`/`tktroom`, `SYNQUENZER.tkt`. Ohne diese Felder byte-gleich; VERSION/CHANGES nicht angefasst.

1. **Taktart der Stelle** (`tktMx`): in der Matrix (ohne ▶ SONG) gilt die *ausdrückliche* Taktart der klingenden Clips (alle gleich, ≠ S.ts), Anker = Clip-Start; Clips ohne Taktart-Feld (4/4) übertönen eine gesetzte Song-Taktart nicht – außer sie haben nach einem Wechsel neben dem Song-Raster begonnen (dann ihr Takt ab ihrem Anfang, Prüfung 4). Starten/Wechseln am Takt (`tktNextBar` in `nextBarFromAudible`) folgt demselben Anker. Klicks (`tktClicks` → `tktClickRun`, gleiche Bedingungen wie `t1Clicks`), Einzähler-Länge (`tCountBeats` → `tktCountTs`), TAKT-Text/LED (`t1BarPos` → `tktBarPos`), LED-Anzahl (`tktLeds`: `visibility:hidden`, kein Verschieben). `LAUF_PER` bekommt Getter (`tktLaufPerOf`, ein Takt der Clip-Taktart, > 16 → halber). Start-Quantisierung: nur mit gültigem `tktMx` anders (Prüfung 4), sonst wie bisher.
2. **Clips umwandeln** (`tktFoldNotes`: Takt anteilig × LB/LA, Raster 1/16, Doppel raus; `tktFoldRange` über `gr2Spans`, Versionen via `tktVerPut` mit `tkt:{f,v}`, eigene Clips an Ort und Stelle, `gr2Restart` an den Teilgrenzen; `tktFoldMarks` (Song-Undo) / `tktFoldSong(from)` (erst die Szenen-Clips der alten Taktart an Ort und Stelle, dann die Song-Stellen, Teile mit eigener Taktart vom Original über `TKT.fsrc`; Undo-Art `ts`)). Meldung im Marken-Blatt: 3. Taste über `tktToastMore`.
3. **Dur ↔ Moll** (`tktModePlan`/`tktMapNote`: Stufen-Abbildung Dur↔natürliches Moll, gleichnamig oder parallel (±3); Leitton nach der Harmonie der Stelle (`tktHarmFn`/`tktHarmSong`/`tktHarmCls`: V/vii° → H, B oder H ohne Dominante → B), sonst Dominant-Klang/Auflösung zum Grundton (`tktRaised`); Akkorde über Töne neu bestimmt (`tktMapTarget`, V bleibt Dur); Song-Clips → Versionen `tkt:{m,k,v}` mit Ziel-Tonart, Song-Melodie, Träger, Akkord-Zeilen (Szenen/Teile), Projekt-Tonart; Undo-Art `tkt` = {Tonart, Song, Teile}; A/B = gespeicherte Stände im Blatt).
4. **Hall-Räume** (`tktHallApply` am Ende von `applyHall`, je Kontext eine Kette in `TKT.hxm`): `hallPre → Raum → hallRet` statt `hallPre → eingebauter Hall` (nicht doppelt). Faltung mit `FX.irGenerator` (Studio 0,7 s · Kammer 1,5 s · Saal 2,4 s · Kirche 4,5 s), Öltank = IR 2,6 s (45 ms Vorverzögerung, Flatterecho 52,5 ms, 12 Tank-Moden 41–700 Hz, tiefer Schwerpunkt) + natives FDN (4 Leitungen 149–297 ms, Householder I−½J, Kuhschwanz 160 Hz/3,5 kHz je Leitung; RT tief = 1,5 × mid, hoch = 0,3 × mid). IR-Cache je Raum/Abtastrate → Offline-Render sofort. Ungenutzte Zweige werden abgehängt (schlafen). Panik/zweites ■ leert auch den Raum (`tktHallClear`).
5. **Effekt-Rack** (`tktRackOpen`): Geräte-Fronten, LEDs (Spur stumm, Chorus aus/letzter Modus, EQ·KOMP aus/zurück, Hall/Echo-Rückweg 0/zurück, Master-Kompressor transparent/zurück) – jeweils ein ↶; Regler = vorhandene `makeCtl`/`busKnob`/MX1-Regler; Pegel über eigene Analyser (nur offen), GR Spur über den MIX-A-Knoten (wie MX2), GR Master `AU.M.reductionDb()`.

**Einhänge-Zeilen (alle mit `TKT`-Kommentar):**
- `tick`: `if (!tkPlain() || tktClickOn(b0)) t1Clicks(b0, b1);`
- `t1Clicks`: erste Zeile `if (tktClicks(b0, b1)) return;`
- `tCountBeats`: `const tc = tktCountTs(); if (tc) return n * tsBeats(tc);` vor dem `tkPlain()`-Zweig
- `ciMax`: `tkPlain() && !TKT.ci ? …`
- `t1BarPos`: erste Zeile `{ const mx = tktMx(b); if (mx) return tktBarPos(b, mx); }`
- `renderTakt`: `let txt, cls = ''; tktLeds(bAud);` · `else if (!tkPlain() || tktMx(bAud)) txt = …` · `tkPlain() && !tktMx(bAud) ? … : t1Led(bAud)`
- Marken-Blatt (Taktart-Tipp): `tktMarkTsToast(id, nm, same);` statt des alten toast
- `setSongTs`: `if (cand || S.song) tktSongTsToast(ts, old); else toast(…)` statt des alten toast
- `nextBarFromAudible`: zweite Zeile `{ const q = tktNextBar(c, tRef, atT); if (q != null) return q; }` (Prüfung 4)
- `normClip`: `tktClipNorm(c, out);` nach `gr1ClipNorm` · `cleanClip`: `tktClipClean(c, o);` vor `return o`
- `normFxBus`: `tktFxNorm(h, d.hall);` nach `d.hall.freeze = …`
- `applyHall`: letzte Zeile `tktHallApply(h, commit, t);` · `hallClear`: `tktHallClear();` nach der ersten Zeile
- `pageFx`: `tktFxPage(pg, sub, i);` nach `fxLongLabels(pg);` · Drum-Editor: `if (ED.dTab === 'fx') tktFxPage(pg, ED.dFx, DRUM_T);`
- `undoState`: `if (e.kind === 'tkt') return tktUndoState(e);` · `undoApply`: `else if (e.kind === 'tkt') tktUndoApply(e, val);`
- Menü: `tktMenuRow(s1, row, btn);` nach `mx2MenuRow(…)` (Knopf landet in der Zeile „Song“ neben Transponieren)

## Tests
`node /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4490/takt/takt-test.mjs <index.html> <ordner>` → **47/47 OK** (Ergebnis `takt-test-ergebnis.json`; Abschnitt 9 = Prüfer-Befunde P1–P7). Gemessen u. a.:
- 3/4 nur in den Clips: Klicks `-3A -2n -1n 0A 1n 2n 3A …`, TAKT `3 2 1 1.1 1.2 1.3 2.1`, LEDs `100x/010x/001x`; Song-Taktart 3/4 weiter 3/4; 4/4 unverändert; 6/8 `A s s n s s`, 2 LEDs. LAUF 12 / 16, Drum-Schritte 12.
- Teil → 3/4 über das Marken-Blatt → [Clips umwandeln]: 3 Spuren als v2 mit `ts 3/4`, Noten auf 1/16, ▶ SONG im Teil `AnnAnnA`, ↶ stellt alles her; Song ganz auf 3/4: 14/14 Stellen 3/4; ohne Song Szenen-Clips gefaltet, ↶.
- Dur→Moll (C-Dur-Song): Melodie `0,2,4,5,7,9,11,0 → 0,2,3,5,7,8,11,0` (Leitton zum C bleibt), Akkorde `C→Cm, G bleibt G, F→Fm, Am→A♭`, Akkord-Zeile `Cm G Fm A♭`, Bass A→A♭, Drums gleich, A/B, ↶/↷, Moll→Dur zurück, parallel `57,59,60,62,64,65,68,69` (a-Moll).
- Rack: 6 Geräte, 23 Regler, LED Hall 0,8 → 0 → 0,8, Chorus ENS, Rückweg-Regler mit dem Finger gezogen 0,8 → 0,5 (ein ↶), live `spur −55 dB · hall −21 dB · master GR −1,8 dB`; ✕ hochkant + quer sichtbar, alle Tasten ≥ 44 px.
- Öltank RT60 (Impuls, Bänder, −5…−25 dB): 75 s → 125 Hz **108 s**, 1 kHz **70 s**, 4 kHz 17 s, Tiefen +9,7 dB; 30 s → 43/32/11 s; 8 s → 11,5/9,4/4,3 s. CPU: 20 s Audio bei 48 kHz in 0,5 s gerechnet (≈ 2,5 % eines Kerns, Desktop-Chromium); Speicher: IR 1,0 MB + FDN 0,27 MB. Offline-Render (Song als Audio/Video) mit Öltank: Ende −23,6 dB statt Stille; live bleibt der Raum dran.
- FX-Seiten hochkant + quer: [RACK]/[RAUM ▾] je 44 px, kein vorhandenes Element verschiebt sich (Lage vorher/nachher gemessen).
- Pflicht: topdefs 0/0, dupkeys 0, Rauchtest errors [], Markenwörter 0, „MS 2000“ 1, „  live: true,“ 1.
- Fotos: `takt-moll-hochkant.png`, `takt-rack-hochkant.png`, `takt-rack-quer.png`, `takt-hall-raum-quer.png`.

## offen
- Matrix, wenn *nur* die Clips 3/4 sind (Song-Taktart 4/4): Starten/Wechseln und der Aufnahme-Beginn liegen jetzt am 3/4-Taktstrich (Prüfung 4); die *Länge* einer neuen Aufnahme rechnet weiter in Takten der Song-Taktart (Tipp: Song-Taktart auf 3/4 stellen). Gemischte Taktarten gleichzeitig (z. B. 3/4 + 4/4): Raster der Song-Taktart wie bisher.
- Dur ↔ Moll: A/B nur im offenen Blatt dieser Sitzung (nach Neuladen: ↶ oder Versionen v1/v2 im Zell-Blatt). Auftakt-Noten (G3) und Gesang werden nicht umgerechnet; Tonhöhen-Korrektur für Takes wäre ein eigener Schritt.
- Effekt-Rack: GR des Spur-Kompressors nur, wenn der MIX-A-Einschub läuft; Drum-Spur hat keinen Chorus im Rack. Rack-Geräte sind Schnellzugriff, keine neue Effekt-Kette (kein Umsortieren).
- Öltank auf dem echten iPhone noch nicht gemessen (Faltung 2,6 s + 27 native Knoten; Erwartung: unkritisch). Im Headless-Render fehlt der *Standard*-Hall am Song-Ende (vorbestehend, nicht TKT).
- Dur ↔ Moll: der Träger (Song-Akkorde) zählt nur für die Song-Melodie; Clips fragen die Akkord-Zeile ihrer Szene und die Töne der Szene (ein Clip, der im Song über anderen Akkorden läuft als in seiner Szene, folgt der Szene).
- Vorbestehend (Basis gleich, nicht TKT): eine Meldung mit Tasten dockt auf der Träger-Leiste; liegt das Marken-Blatt darüber (hochkant, Demo-Größe), ist sie dort verdeckt, bis das Blatt zu ist (Basis: [Für alle] [Rückgängig] ebenso).

## Prüfung (unabhängiger Prüfer, 7 Befunde – alle nachgemessen, alle behoben)
1. **Song-Taktart 3/4 + [Clips umwandeln] ließ die Szenen-Clips in 4/4** – stimmt (p1/p1b). Behoben: `tktFoldSong(from)` wandelt zuerst die Szenen-Clips der alten Taktart an Ort und Stelle (wie T1 „Clips umrechnen“), dann im Song, was noch nicht passt (Teile mit eigener Taktart, Versionen, eigene Clips); Teile mit eigener Taktart werden dabei vom *Original* gefaltet (`TKT.fsrc`, nie doppelt). Ein ↶ (Art `ts`: Taktart + Clips + Song). Gemessen: Szenen-Clips `3/4` mit 3/3/6/3 Schlägen, Matrix-Schleifen 3,3,6,3, 14/14 Song-Stellen 3/4, 0 neue Versionen (vorher 7 doppelte); 7/8-Teil bleibt byte-gleich.
2. **iii-Akkord wurde übermäßig (Es G H)** – stimmt. Ursache wie beschrieben (jedes G galt als Dominant-Klang). Behoben: `tktHarmFn`/`tktHarmCls` – über den Leitton entscheidet die Harmonie der Stelle: Akkord-Zeile der Szene, sonst die Akkorde (≥ 3 Tonklassen je Spur) aller Spuren der Szene, sonst alle Töne (`Harmony.detectChord`). V/vii° → H, Akkord mit B oder H ohne Dominante (iii, maj7) → B, unbekannt → alte Regel. Gemessen: Em → **Es G B** (mit und ohne Akkord-Zeile), Zeile „E♭“.
3. **Melodie-H über G wurde B, Akkord behielt H** – stimmt. Behoben mit 2.: jede Spur fragt dieselbe Stelle, „über V/vii° immer H“ (ein G-Akkord in irgendeiner Spur gewinnt). Gemessen: über G klingen nur **G H D** (mit und ohne Zeile), über Es-Dur wird die Melodie B (**Es G B**). Song-Melodie: Träger, sonst die Song-Spuren an der Stelle (`tktHarmSong`).
4. **Szenenwechsel im 4/4-Raster zerschnitt den 3/4-Takt** – stimmt (p10). Behoben: `tktNextBar` (Einhänger in `nextBarFromAudible`, nur Matrix ohne ▶ SONG und nur, wenn `tktMx` gilt) startet am nächsten Taktstrich der klingenden Clips; `tktMx` ankert auch 4/4-Clips, die so neben dem Raster begonnen haben. Gemessen: Wechsel bei 1,42 → Start **Schlag 3**, Klicks `0A 1n 2n 3A 4n 5n 6n 7A 8n 9n 10A` (3/4 → 4/4 → 3/4). Reine 4/4- bzw. Song-3/4-Projekte: Startschläge wie Basis (4/8 bzw. 3/6, gemessen gegen basis.html).
5. **Marken-Blatt-Meldung ohne ↶** – stimmt (toast zeigt höchstens 2). Behoben ohne fremden Code: `tktToastMore` hängt die 3. Taste an dieselbe Meldung (gleiches Verhalten), ↶ als Symbol (≥ 44 px, aria „Rückgängig“), neu eingepasst; zu langer Teilname → „Für alle“ (voller Name als aria). Gemessen: [Clips umwandeln] [Für alle „Szene 1“] [↶] in der Meldung, nichts abgeschnitten, ↶ wirkt.
6. **GR „0 dB“ nach LED-An im offenen Rack** – stimmt. Behoben: die Anzeige-Schleife meldet sich ≈ alle 0,4 s neu an, wenn `A.mixa.node` neu ist (alter Knoten abgemeldet). Gemessen: −21 … −42 dB ohne Neu-Öffnen.
7. **„MASTER-AU…“ abgeschnitten** – stimmt. Behoben: im Rack heißt der Regler „Ausgang“ (`busKnob(…, {label})`, FX-Blatt unverändert). Gemessen: 0 abgeschnittene Beschriftungen auf allen Spuren, hochkant + quer.

Prüfung danach: `takt-test.mjs` 47/47, Prüfer-Sonden p1/p1b/p2/p7/p10/p12b/p13 grün, topdefs 0/0, dupkeys 0, Rauchtest errors [], Markenwörter 0, „MS 2000“ 1, „  live: true,“ 1. Fotos neu (`takt-*.png`, Rack zeigt „AUSGANG“).
