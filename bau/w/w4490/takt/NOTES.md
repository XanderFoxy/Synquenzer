# Paket TAKT (Kürzel TKT) – 3/4 richtig, Clips umwandeln, Dur ↔ Moll, Effekt-Rack, Öltank-Hall

## Für Xander
- 3/4 stimmt jetzt überall: Metronom (Betonung), Einzähler (3 Klicks), TAKT-Anzeige und die Takt-Lampen zeigen 3 – auch wenn nur die Clips auf 3/4 stehen. LAUF zeigt je Seite einen 3/4-Takt (12 Schritte).
- Taktart eines Teils oder des ganzen Songs gewechselt? Die Meldung hat jetzt **[Clips umwandeln]**: jeder Takt wird ins neue Raster gefaltet, als neue Version (das Original bleibt v1), ein ↶.
- **≡ › Song › Dur ↔ Moll …**: macht eine Moll-Version (C-Dur → c-Moll oder a-Moll) – Melodie, Akkorde, Bass, Akkord-Zeilen; Drums bleiben, Gesang wird nicht umgerechnet. A/B zum Vergleichen, ↶. Geht auch Moll → Dur.
- **FX › [RACK]**: alle Effekte als Geräte untereinander (SPUR, CHORUS, EQ · KOMP, HALL, ECHO, MASTER) mit An/Aus-Lampe, großen Reglern und Pegel live. Das alte FX-Blatt bleibt.
- **FX › HALL › [RAUM ▾]**: Studio, Kammer, Saal, Kirche – und der **Öltank** (riesiger Betontank, 8 / 30 / 75 s Nachhall, die Tiefen klingen am längsten). Zum Ausprobieren: lange Flächen, einzelne Schläge.
- Auch im „Wo finde ich …?“ (Öltank, Rack, Moll, Taktart).

## Technik
Ein Block `/* ===== TKT BEGIN … */ … /* TKT-END */` direkt hinter `Object.assign(SYNQUENZER, {vd3: VD3_API});` (vor `const NO_SYNC`), CSS per `<style id="tkt-css">` aus dem Block. Neue Schlüssel nur mit Präfix: `clip.tkt`, `S.fxBus.hall.tktRaum`, `S.fxBus.hall.tktLen`, Undo-Art `'tkt'`, Blätter `tktmode`/`tktrack`/`tktroom`, `SYNQUENZER.tkt`. Ohne diese Felder byte-gleich; VERSION/CHANGES nicht angefasst.

1. **Taktart der Stelle** (`tktMx`): in der Matrix (ohne ▶ SONG) gilt die *ausdrückliche* Taktart der klingenden Clips (alle gleich, ≠ S.ts), Anker = Clip-Start; Clips ohne Taktart-Feld (4/4) übertönen eine gesetzte Song-Taktart nicht. Klicks (`tktClicks` → `tktClickRun`, gleiche Bedingungen wie `t1Clicks`), Einzähler-Länge (`tCountBeats` → `tktCountTs`), TAKT-Text/LED (`t1BarPos` → `tktBarPos`), LED-Anzahl (`tktLeds`: `visibility:hidden`, kein Verschieben). `LAUF_PER` bekommt Getter (`tktLaufPerOf`, ein Takt der Clip-Taktart, > 16 → halber). Start-Quantisierung unverändert.
2. **Clips umwandeln** (`tktFoldNotes`: Takt anteilig × LB/LA, Raster 1/16, Doppel raus; `tktFoldRange` über `gr2Spans`, Versionen via `tktVerPut` mit `tkt:{f,v}`, eigene Clips an Ort und Stelle, `gr2Restart` an den Teilgrenzen; `tktFoldMarks` / `tktFoldSong` (ohne Song: Szenen-Clips, Undo-Art `ts`)).
3. **Dur ↔ Moll** (`tktModePlan`/`tktMapNote`: Stufen-Abbildung Dur↔natürliches Moll, gleichnamig oder parallel (±3); Leitton bleibt bei Dominant-Klang/Auflösung zum Grundton (`tktRaised`); Akkorde über Töne neu bestimmt (`tktMapTarget`, V bleibt Dur); Song-Clips → Versionen `tkt:{m,k,v}` mit Ziel-Tonart, Song-Melodie, Träger, Akkord-Zeilen (Szenen/Teile), Projekt-Tonart; Undo-Art `tkt` = {Tonart, Song, Teile}; A/B = gespeicherte Stände im Blatt).
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
- `setSongTs`: `if (cand || S.song) tktSongTsToast(ts); else toast(…)` statt des alten toast
- `normClip`: `tktClipNorm(c, out);` nach `gr1ClipNorm` · `cleanClip`: `tktClipClean(c, o);` vor `return o`
- `normFxBus`: `tktFxNorm(h, d.hall);` nach `d.hall.freeze = …`
- `applyHall`: letzte Zeile `tktHallApply(h, commit, t);` · `hallClear`: `tktHallClear();` nach der ersten Zeile
- `pageFx`: `tktFxPage(pg, sub, i);` nach `fxLongLabels(pg);` · Drum-Editor: `if (ED.dTab === 'fx') tktFxPage(pg, ED.dFx, DRUM_T);`
- `undoState`: `if (e.kind === 'tkt') return tktUndoState(e);` · `undoApply`: `else if (e.kind === 'tkt') tktUndoApply(e, val);`
- Menü: `tktMenuRow(s1, row, btn);` nach `mx2MenuRow(…)` (Knopf landet in der Zeile „Song“ neben Transponieren)

## Tests
`node /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4490/takt/takt-test.mjs <index.html> <ordner>` → **39/39 OK** (Ergebnis `takt-test-ergebnis.json`). Gemessen u. a.:
- 3/4 nur in den Clips: Klicks `-3A -2n -1n 0A 1n 2n 3A …`, TAKT `3 2 1 1.1 1.2 1.3 2.1`, LEDs `100x/010x/001x`; Song-Taktart 3/4 weiter 3/4; 4/4 unverändert; 6/8 `A s s n s s`, 2 LEDs. LAUF 12 / 16, Drum-Schritte 12.
- Teil → 3/4 über das Marken-Blatt → [Clips umwandeln]: 3 Spuren als v2 mit `ts 3/4`, Noten auf 1/16, ▶ SONG im Teil `AnnAnnA`, ↶ stellt alles her; Song ganz auf 3/4: 14/14 Stellen 3/4; ohne Song Szenen-Clips gefaltet, ↶.
- Dur→Moll (C-Dur-Song): Melodie `0,2,4,5,7,9,11,0 → 0,2,3,5,7,8,11,0` (Leitton zum C bleibt), Akkorde `C→Cm, G bleibt G, F→Fm, Am→A♭`, Akkord-Zeile `Cm G Fm A♭`, Bass A→A♭, Drums gleich, A/B, ↶/↷, Moll→Dur zurück, parallel `57,59,60,62,64,65,68,69` (a-Moll).
- Rack: 6 Geräte, 23 Regler, LED Hall 0,8 → 0 → 0,8, Chorus ENS, Rückweg-Regler mit dem Finger gezogen 0,8 → 0,5 (ein ↶), live `spur −55 dB · hall −21 dB · master GR −1,8 dB`; ✕ hochkant + quer sichtbar, alle Tasten ≥ 44 px.
- Öltank RT60 (Impuls, Bänder, −5…−25 dB): 75 s → 125 Hz **108 s**, 1 kHz **70 s**, 4 kHz 17 s, Tiefen +9,7 dB; 30 s → 43/32/11 s; 8 s → 11,5/9,4/4,3 s. CPU: 20 s Audio bei 48 kHz in 0,5 s gerechnet (≈ 2,5 % eines Kerns, Desktop-Chromium); Speicher: IR 1,0 MB + FDN 0,27 MB. Offline-Render (Song als Audio/Video) mit Öltank: Ende −23,6 dB statt Stille; live bleibt der Raum dran.
- FX-Seiten hochkant + quer: [RACK]/[RAUM ▾] je 44 px, kein vorhandenes Element verschiebt sich (Lage vorher/nachher gemessen).
- Pflicht: topdefs 0/0, dupkeys 0, Rauchtest errors [], Markenwörter 0, „MS 2000“ 1, „  live: true,“ 1.
- Fotos: `takt-moll-hochkant.png`, `takt-rack-hochkant.png`, `takt-rack-quer.png`, `takt-hall-raum-quer.png`.

## offen
- Aufnehmen/Starten in der Matrix, wenn *nur* die Clips 3/4 sind (Song-Taktart 4/4): Metronom/Anzeige stimmen, aber neue Aufnahmen und das Starten am Takt folgen weiter der Song-Taktart (Tipp: Song-Taktart auf 3/4 stellen). Bewusst nicht umgebaut (Quantisierung = Risiko).
- Dur ↔ Moll: A/B nur im offenen Blatt dieser Sitzung (nach Neuladen: ↶ oder Versionen v1/v2 im Zell-Blatt). Auftakt-Noten (G3) und Gesang werden nicht umgerechnet; Tonhöhen-Korrektur für Takes wäre ein eigener Schritt.
- Effekt-Rack: GR des Spur-Kompressors nur, wenn der MIX-A-Einschub läuft; Drum-Spur hat keinen Chorus im Rack. Rack-Geräte sind Schnellzugriff, keine neue Effekt-Kette (kein Umsortieren).
- Öltank auf dem echten iPhone noch nicht gemessen (Faltung 2,6 s + 27 native Knoten; Erwartung: unkritisch). Im Headless-Render fehlt der *Standard*-Hall am Song-Ende (vorbestehend, nicht TKT).
