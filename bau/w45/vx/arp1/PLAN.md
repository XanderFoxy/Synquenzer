# ARP1 – Bauplan „Arp für jede Synth-Spur“ (Basis 4.78.0, VERSION bleibt)

Grundidee: **kein zweiter Arp-Kern.** ARP1 schließt VA/FM/WT an den vorhandenen MS-2000-Kern `ARPC` an – genauso, wie Bit Mask
schon angeschlossen ist (Adapter). Der Prototyp (`pruef/proto.py`, 4 Zeilen) spielt damit schon live, in Matrix/Song und im
Audio-Export (INVENTAR 7). Dazu kommen: Daten je Spur, neue Muster, MIDI/Festschreiben, Bedienung, Hilfe.

## 0. Entscheidungen (im Funk mit Xander bestätigen, Vorschlag in Klammern)

1. **Arp gehört zur Spur, nicht zum Klang** (`tr.arp`): bleibt beim Durchblättern der Klänge an, wandert mit „Spur
   duplizieren“, nicht mit „Sichern“ eines Klangs. (Alternative: im Klang wie bei MS 2000.)
2. **Swing:** Arp-Swing 0 = Song-Swing gilt; ≠ 0 = eigener Arp-Swing statt Song-Swing (Regel des MS-2000-Arps, gleiche
   Bedienung überall). „Song-Swing + Arp-Swing addiert“ nur, wenn Xander es so will (dann 1 Zeile mehr im Kern).
3. **„Kurze Noten: ganze Figur“** (neu, Standard **an**): eine kurze Clip-Note (z. B. 1/16 lang auf einem Achtel-Platz) hält im
   Arp bis zur nächsten Note, höchstens eine ganze Figur. Ohne das fehlt das „dub“ nach kurzen Noten (gemessen).
4. **Muster „Oktave“** = je gehaltenem Ton Grundton, Oktave höher im Wechsel („Da dub“); Oktaven 2–4 setzen das Paar eine
   Oktave höher fort. Bei einem Einzelton klingt „Auf, 2 Oktaven“ gleich.
5. **Haupt-Zugang** unten auf der Seite **OSZ › STIMME** (eine Zeile), dazu **⋯ › Arpeggiator**. Kein neuer Reiter.

## 1. Daten (`tr.arp`, nur Synth-Spuren, additiv)

```
tr.arp = {on: 0|1, m: 'auf'|'ab'|'aufab'|'zufall'|'gespielt'|'treppe'|'oktave'|'akkord',
          r: 4|8|16|32, tri: 0|1, o: 1–4, g: 5–100 (Gate %), sw: −100…100 (0 = Song-Swing),
          ks: 0|1 (Key Sync), la: 0|1 (Latch), rep: 1–4 (Wiederholen), fig: 0|1 (ganze Figur)}
```
Erstes Einschalten: `{on:1, m:'auf', r:16, tri:0, o:1, g:80, sw:0, ks:1, la:0, rep:1, fig:1}`. Schritt in Schlägen
`sb = 4 / r × (tri ? 2/3 : 1)` → 1/4 … 1/32, 1/4T … 1/32T. Muster → ARPC-Typ: auf 0, ab 1, aufab 2 (Alt 1, Enden nicht
doppelt), zufall 4, akkord 5 (optional, kostet nichts), treppe 6; neu (nur ARP1): gespielt, oktave. Fehlt das Feld = aus,
Datei bitgleich wie 4.78.0. Kein Format-Sprung (ältere Fassungen lassen das Feld beim Laden einfach weg).

Gilt für Engines `analog`, `fm6` (`fm2` wird zu fm6), `wt` (inkl. Klangkorn). Nicht: `mk`, `bm` (eigener Arp), `north`,
MTX3-Einzelspur (`tr.dvx`), STIMME/Original. Wechselt eine Spur mit Arp auf MS 2000/Bit Mask, ruht `tr.arp` (Toast:
„Arp der Spur ruht – {MK_LABEL} hat einen eigenen: GERÄT › ARP“; Namen nur über `MK_LABEL`/`BM_NAME`, sonst kippt die
Pflicht „MS 2000 genau 1×“).

## 2. Paketaufbau (wie NST1)

`vx/arp1/`: `basis.html` · `arp1-core.js` (Einfügungen in `sq-arp-src`) · `arp1-block.js` (`/* ARP1-BEGIN … ARP1-END */` hinter
`/* LT2-END */` 110383, Haupt-Faden) · `arp1-ui.js` (stiller Block `<script type="text/plain" id="sq-arp1-src">`, erst beim
ersten Öffnen ausgewertet, Muster `ksLoad`/`arpSrcLoad`) · `apply.py` (Anker müssen genau 1× treffen) · `arp1-test.mjs` ·
`test-ergebnis.txt` · `fotos/` (428×926 hochkant, 926×428 quer) · `hoeren/` · `pruef/` · `NOTES.md` (inkl. Funk-Entwurf) ·
`LOG.md`. Alle Code-Zeilen tragen „ARP1“. Kein Worklet-Teil.

## 3. Einhängepunkte

### 3a. Kern (`sq-arp-src`) – **3 geänderte Zeilen**, Rest eingefügt (Einfügen allein geht nicht, siehe INVENTAR 1)

| Ort | Art | Inhalt |
|---|---|---|
| vor `const A_` **6853** | neu | `const gnA = i => (typeof arp1Adapt === 'function' ? arp1Adapt(S.tracks[i]) : null);   /* ARP1 */` |
| `A_` **6853** | **geändert** | zuerst `const g = gnA(i); if (g) return g;` dann wie bisher |
| `on(i)` **6854** | **geändert** | nach dem Kopf-Test `if (gnA(i)) return true;` |
| `stepB` **6855** | **geändert** | `m.bm \|\| m.gn ? m.sb : RES[…] * 4` (1/32 und Triolen frei) |
| nach `} else notes = arpPattern(…)` **6964** | neu | `if (m.gn) { notes = gnNotes(m, q, c, byP, N, seedOf(i)); if (!notes.length) { rec(s, r); return r; } }` – Gate, Swing, Spawn, Protokoll laufen danach unverändert (6965–6977) |
| vor `// plan track i up to now + h` **6998** | neu | `function gnNotes(…)`: Wiederholen (`cc = floor(c / rep)`), **Gespielt** (Reihenfolge von `q.mem` wie `bmStep` 6980, Oktaven als Blöcke), **Oktave** (Paare Ton/Ton+12 je Oktave, ≤ 127), sonst `arpPattern(type, o, N, cc, seed, voicesOf(m, 1))` |
| nach `function rewind(i, t) {` **7034** | neu | `{ const s0 = ST.get(i); if (s0 && typeof nst1Cancel === 'function' && s0.hist.some(r => r.t >= t - 1e-6 && r.vs.length)) nst1Cancel(i, t); }` – NST1-Zähler bei Arp-Neuplanung zurück (gilt auch für den MS-2000-Arp) |
| nach `const s = st(i), L = s.iv;` in `add` **6892** | neu | `if (x.src !== 'live' && typeof arp1Fig === 'function') arp1Fig(i, x, L);` – „ganze Figur“: kurze Note bis zur nächsten verlängern (`x.ext0` = echtes Ende), eine früher verlängerte endet an der neuen (nie zum Akkord verschmelzen); `add` plant danach ohnehin neu (6897) |

Adapter `arp1Adapt(tr)` (Haupt-Faden) liefert, nur wenn `tr.arp.on` und Engine erlaubt:
`{gn:1, a1:cfg, mode:0, split:60, sb, t:[{asg:1},{asg:1}], vmax:8, arp:{on:1, res: round(sb·96000), latch, ks, last:1, steps:1,
type, range:o, gate:g, swing:sw, tgt:0}}` (`res` als Zahl, damit `plan` 7007–7012 einen Raten-Wechsel ohne Doppel/Lücke
übernimmt). Rückgabe je Spur zwischenspeichern (Schlüssel = JSON von `tr.arp` + Engine), damit `plan` pro tick nichts neu baut.

### 3b. Haupt-Faden (Einzeiler, eingefügt)

| Anker (je genau 1×, geprüft) | Haken |
|---|---|
| vor `  if (tr.sound.engine === 'bm') { const a = tr.sound.p.bm …` in `arpOn` **33203** | `if (typeof arp1Gn === 'function' && arp1Gn(tr)) return arp1On(i, sync);` – lädt `sq-arp-src` **synchron** (gemessen 1,1 ms, einmalig), auch im Scheduler, damit die ersten Noten nicht ohne Arp durchrutschen |
| nach `{ const ro = mx1NormRole(t.mxRole); if (ro) o.mxRole = ro; }` in `normTrack` **28817** | `if (def.kind === 'synth' && t.arp && typeof arp1Norm === 'function') { const a = arp1Norm(t.arp); if (a) o.arp = a; }` |
| nach `function undoState(e) {` **34851** | `if (e.kind === 'arp1') return arp1Snap(e.track);` |
| nach `function undoApply(e, val) {` **34888** | `if (e.kind === 'arp1') { arp1Put(e.track, val); UI.dirty.all = true; markDirty(); if (typeof edUndoBtns === 'function') edUndoBtns(); return; }` |
| nach `  const PPQ = 480, tm = tempoMap …` in `assembleMidi` **54856** | `if (typeof arp1Midi === 'function') evs = arp1Midi(evs, idxs \|\| midiBaseIdx());` |
| vor `  return assembleMidi(evs, [{tk: 0, b: metaText(6, 'Mitschnitt')` **54933** | `ARP1X.skip = 1;` (Mitschnitt hat die Arp-Noten schon, nie doppelt) |
| nach `h = h.replace('<h5>Video</h5>', mx + '<h5>Video</h5>');` **87522** | `if (typeof arp1ExpRow === 'function') h = h.replace('<h5>Video</h5>', arp1ExpRow() + '<h5>Video</h5>');` |
| nach `  const a = b.dataset.va; if (!a …` in `wegeVa1Tap` **87534** | `if (a === 'wg-arp') { UI.expArp = b.dataset.v === '1'; haptic('tick'); va1Paint(); return true; }` |
| nach `  if (V6A.ed) v6aEdEnd(true); …` in `vvRenderAudio0` **75205** | `arpEndAll();` – kein gelatchter Live-Akkord läuft in den Render |
| nach `  if (!sv \|\| sv.done) return; sv.done = true;` in `vvSwapOut` **75169** | `arpEndAll();` – kein Offline-Arp-Zustand (mit Offline-Zeiten) bleibt nach Abbruch im Live-Betrieb |
| nach `  pg.append(r1, kRow(ks.slice(0, 4)), k2);` in `pageVoice` **45050** | `if (typeof arp1VoiceRow === 'function') arp1VoiceRow(pg, i);` |
| nach `(!drum ? kf2MoreBtn() : '') +` in `openEdMore` **44899** (gleicher Anker wie NST1, verträglich) | `(!drum && !percIs(tr) && typeof arp1MoreBtn === 'function' ? arp1MoreBtn(t) : '') +` |
| nach der `onTap(p, b => { closePop(); …}, 'button[data-a]');`-Zeile in `openEdMore` | `if (typeof arp1MoreTap === 'function') arp1MoreTap(p, anchor, t);` |

Die letzten beiden Render-Haken betreffen auch den MS-2000-/Bit-Mask-Arp (kleine Fehlerbehebung, im NOTES nennen).

### 3c. Block `ARP1-BEGIN … ARP1-END` (Haupt-Faden, klein)

`ARP1X` (Zustand), `arp1Gn/arp1Adapt/arp1On`, `arp1Norm`, `arp1Snap/arp1Put` (Änderung im Lauf: `cancelTrackFrom(i, now+.006)` +
`scheduleTrack(…, true)` wie `clipRestored` 34882, damit schon geplante Clip-Noten der nächsten 100 ms mit/ohne Arp neu
kommen; Arp aus → `ARPC.end(i)`), `arp1Edit(i, label, fn, mergeKey)` (ein ↶ je Geste, Ziehen an Gate/Swing zusammengefasst wie
`pushUndo` 34846), `arp1Fig`, `arp1Render` (reine Rechnung, 4), `arp1Midi`, `arp1Bake` (5), Guide-Eintrag, Test-API
`SYNQUENZER.arp1`. Lader `arp1UiLoad()` für `sq-arp1-src`.

## 4. Reine Rechnung `arp1Render(notes, cfg, o)` (für MIDI und Festschreiben)

Schläge statt Sekunden, **dieselben Regeln wie der Planer**: Intervalle `on=t`, `off=t+max(d,1/32)` (wie `scheduleTrack`),
„ganze Figur“; Raster `idx·sb` ab Song-/Datei-Schlag 0; Gruppe = `query` (berührend = neuer Akkord, Latch hält die letzte bis
Szenen-/Clip-Ende); Zähler KS an: neuer Akkord → 0, sonst +1; KS aus: `idx − round(gb/sb)`, `gb` = Takt (4 Schläge, wie 6943);
Töne je Schritt eine je Tonhöhe (lautester), dann `gnNotes`; Dauer `g/100·sb` (100 % = bis zum nächsten Schritt); eigener Swing
`sw/100·0,5·sb` auf ungeraden Schritten. Unquantisierte Noten: Regel „später erster Schritt“ (`lateIdx` 6918, LATE 60 ms /
0,4 Schritt) nachbilden. Gleiche Muster-Funktion `gnNotes`/`arpPattern` aus ARPC (Block vorher laden).
**Nachweis im Test:** für jedes Muster × Rate (4, 8, 16, 32, 16T) × KS × Latch × Wiederholen × Figur × Gate × Swing auf drei
Clips (Achtel-Paare mit kurzen Noten, 3-Ton-Akkorde, unquantisiert) Offline-Render (`noteLog` src 'arp') = `arp1Render`
(Zeit ± 0,002 Schlag, Tonhöhe exakt, Anzahl gleich).

## 5. MIDI-Export und Festschreiben

- **Schalter** im Export-Blatt (D7) unter „Transposition“: `Arp: [als Noten] [wie im Clip]` – nur sichtbar, wenn eine Spur
  Arp an hat; Standard „als Noten“ (das Gehörte). `arp1Midi` paart je Spur Note-an/aus aus `evs`, rechnet `arp1Render` (Höhen
  schon „wie gehört“ abgebildet, wie der Planer) und baut die Ereignisse neu; Programmwechsel bleiben. Gilt für Szene, Alle
  Szenen, Song, je Spur (`va1MidiSong/Clip`); Mitschnitt unverändert. Song-Swing wie bisher nicht im MIDI, eigener Arp-Swing ja.
- **Festschreiben** (Arp-Blatt: „In den Clip schreiben – Szene n“): Clip-Noten (Clip-Raum, vor Träger) einmal über die
  Clip-Länge durch `arp1Render`, neue Noten `n + 12·o`, Locks der Quellnote mit; danach `tr.arp.on = 0`. **Ein ↶:**
  `undoPush({kind:'group', label:'Arp festschreiben', items:[{kind:'clip', track, scene, before}, {kind:'arp1', track, before}]})`,
  dann `clipRestored` (hörbar sofort). Toast mit „Rückgängig“. Leerer Clip / Arp aus → Knopf grau mit Grund.

## 6. Bedienung (sichtbar neu → vorher im Funk vorschlagen)

1. **OSZ › STIMME, unterste Zeile** (VA/FM/WT): `ARP [AUS|AN]` + Zusammenfassung „Oktave · 1/16 · 1 Okt.“ (Tipp öffnet das
   Blatt). Höhe ≥ 44 px, hochkant und quer prüfen (Foto).
2. **⋯ › Arpeggiator** (alle Synth-Spuren). Auf MS 2000 / Bit Mask: kein zweiter Arp, sondern Hinweis + Sprung zum eigenen
   (GERÄT › ARP bzw. Bit Mask › Arp).
3. **Arp-Blatt** (aus `sq-arp1-src`, hochkant ganz sichtbar, quer innen rollend, alle Tasten ≥ 44 px, keine Emojis):
   Kopf `Arp · {Spur}` [AN/AUS] ✕ · **Bild der nächsten 8 Schritte** (Probe-Ton bzw. Probe-Akkord, Lauflicht über `ARPC.cur`
   solange etwas spielt) · **Schnellwahl**: „Oktav-Bass“ (Oktave, 1/16, 1 Okt., Gate 80, KS, ganze Figur), „Treppe 1/16“,
   „Akkord-Puls 1/8“ · **Muster** als SVG-Bildknöpfe: Auf · Ab · Auf-Ab · Zufall · Gespielt · Treppe · Oktave (· Akkord) ·
   **Rate** 1/4 1/8 1/16 1/32 + [Triole] · **Oktaven** 1–4 · **Wiederholen** 1–4 · **Gate** (5–100 %) · **Swing** (−100…100,
   „0 = Song-Swing“) · **Key Sync** · **Latch** · **Kurze Noten: ganze Figur** · [▶ Probe] (2 Takte über den Arp, nur wenn
   nichts läuft) · [In den Clip schreiben]. Jede Änderung = ein ↶.
4. **Export-Blatt**: Zeile „Arp“ (5). 5. Optional, nur auf Wunsch: kleines „ARP“-Zeichen am Spurnamen in der Matrix.

## 7. Hilfe

Guide-Eintrag `arp1` „Arpeggiator (jede Synth-Spur)“ · Wo: „Klang-Editor › OSZ › STIMME › ARP (oder ⋯ › Arpeggiator)“ ·
Text: gehaltene Töne nacheinander, Muster, „Oktave = Grundton und Oktave im Wechsel (Da-dub)“, Festschreiben · Suche: `arp
arpeggiator oktave oktavbass da dub treppe latch key sync gate swing triole festschreiben wiederholen gespielt zufall` · Sprung
öffnet STIMME + Blatt. Vorhandenen Eintrag `kf1trp` 106049 zur Laufzeit ergänzen („… · jede andere Synth-Spur: STIMME › ARP ›
Treppe“) und den GD1-Hinweis 100267–100278 („erst MS 2000 / Bit Mask“) für VA/FM/WT-Spuren auf das Arp-Blatt lenken.

## 8. Tests (`arp1-test.mjs`, Abschnitte wie NST1)

A Basis-gleich: Start-Bild pixelgleich, Projekt ohne Arp bitgleich serialisiert, golden.mjs (vx/perf2) bitgleich,
**MS-2000-Arp und Bit-Mask-Arp: arpLog vorher = nachher** (Werksprogramme mit Arp, Live + Clip) – wegen der 3 geänderten
Kernzeilen. · B Kern: alle Muster/Raten/Triolen/Oktaven/Wiederholen/Gate/Swing/KS/Latch/Figur gegen Erwartungstabellen; Live
(erste Note ≤ 15 ms, nichts hängt nach Loslassen), Matrix, Song, Song-Melodie, Begleiter; Szenenwechsel/FILL/Träger-Wechsel
(rewind); Tempowechsel; Spur stumm; Engine-Wechsel VA↔FM↔WT↔MS 2000. · C Render: Audio-Export und Video (Arp-Noten im
Spur-Bild), Render-Abbruch lässt nichts hängen. · D Rechnung = Planer (4). · E MIDI: Schalter an/aus, Mitschnitt unverändert,
Szene/Song/Spur. · F Festschreiben: Noten = gehört, ein ↶/↷, Arp danach aus. · G Speichern/Laden, Undo je Geste, Spur
duplizieren. · H Bedienung per Touch hochkant/quer (Fotos), Tastengrößen, keine Überlappung. · I Hilfe-Sprung. · J NST1+ARP1 in
beiden Reihenfolgen (Zähler nimmt bei Arp-Neuplanung zurück, beide Testskripte grün). · K Kosten: Startzeit (KS-`startzeit.mjs`)
nicht schlechter, tick mit Arp ≤ 0,5 ms, `sq-arp1-src` laden < 5 ms. · Pflicht: topdefs 0/0, dupkeys 0, smoke `[]`,
„MS 2000“ 1×, `^  live: true,` 1×, VERSION 4.78.0.

Hörbeispiele (`hoeren/`, neutrale Noten, App-Render → MP3): Oktav-Bass auf Achtel-Paaren (mit und ohne „ganze Figur“) ·
Treppe 1/16 über Moll-Akkord · Auf-Ab 1/8T über 2 Oktaven · Gespielt + Wiederholen 2. Prüfung am privaten Lied nur im
privaten Ordner, Ergebnisse nur dort.

## 9. Reihenfolge und Aufwand

1. Kern + Daten + Undo + Test-API (B, C, J) – ½ Tag. 2. Rechnung, MIDI, Festschreiben (D, E, F) – ½ Tag. 3. Bedienung, Hilfe,
Fotos (H, I) – ½ Tag. 4. Pflicht, Hörbeispiele, NOTES/LOG, Funk-Entwurf. Ausliefern erst nach Xanders OK zu 0 und 6.

## 10. Grenzen / später

Gate über 100 % (Legato-Arp) braucht eine 4. Kernzeile (6965 kappt auf 100). KEY SYNC aus zählt den Takt fest mit 4 Schlägen
(vorhandene MK5-Grenze, in 3/4 ungenau). MIDI-Export der MS-2000-/Bit-Mask-Arps (heute nur Clip-Noten) wäre mit derselben
Rechnung machbar, eigener Schritt. Arp je Clip an/aus (z. B. nur im Refrain) wäre ein späterer Wunsch über den Klangzustand ◆.
