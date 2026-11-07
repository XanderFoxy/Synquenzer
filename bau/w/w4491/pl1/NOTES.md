# Paket PL1 – Parameter-Locks bedienbar + Lauflichter an/aus

## Für Xander
- **LAUF:** Schritt lang drücken → im Schritt-Menü steht jetzt „🔒 Regler nur für Schritt 3“ mit 4 Reglern (Filter, Reso, Hüllk., Decay; bei FM Helligkeit, Biss, Länge, Pegel; bei der Platte Filter, Reso, Decay, Pegel). Mit dem zweiten Finger drehen, während der erste den Schritt hält – wie bei einer Groovebox. Loslassen und in Ruhe drehen geht auch.
- **Drum-SCHRITTE:** einen gesetzten Schritt lang drücken → Tune, Decay, Pegel, Drive nur für diesen Schlag. **ROLLE:** Noten wählen → [🔒 Locks] am Ende der Aktionszeile.
- Ein **Punkt** am Schritt bzw. an der Note zeigt den Lock. Darunter die Lock-Leiste („Filter 2,4 kHz ✕“), [Locks löschen] und [Alle Regler ›] (Klang-Editor, Drum-Editor oder Platte mit Lock-Leiste oben: jeder Regler gilt dann nur für diese Note, [Fertig] führt zurück). Jeder Dreh ist ein ↶. ◆ (ganzer Clip) bleibt, wie er ist.
- **≡ › Bedienung › Lauflichter An/Aus:** Aus = Matrix, LAUF, Schritte, ROLLE, Takt-LEDs, Pad-Blitze und Platten-LEDs stehen still, der Song zeigt die Stelle nur noch je Takt. Das spart Rechenzeit (gemessen: LAUF 585 → 253 ms, Schritte 736 → 156 ms Rechenzeit in 4 s).
- Beides steht im „Wo finde ich …?“ (Suchwörter „Lock“, „Lauflicht“).

## Technik
Ein Block `/* ===== PL1-BEGIN … */ … /* ===== PL1-END ===== */` direkt hinter `Object.assign(SYNQUENZER, {vd3: VD3_API});` (vor `const NO_SYNC`), danach `Object.assign(SYNQUENZER, {pl1: PL1_API});`. CSS per `<style id="pl1-css">` aus dem Block. Neue Schlüssel nur mit Präfix: `UI.pl1` (Zustand), `UI.pl1ll`/`UI.pl1llC` (Lauflichter), `uiPrefs().pl1ll` (Gerät), `SYNQUENZER.pl1`. Projektdaten: **keine neuen Felder** – es wird nur der vorhandene Lock-Kern von 4.38 geschrieben (`note.lk.v[Pfad]` über `lkW`, `lkToN`/`lkFromN`, `LKT`, `LK_MAX.note`; Drums zusätzlich `lk.tune`/`lk.dec` wie die TUNE/DECAY-Spuren). Wiedergabe, Song-Render/Export/Video spielen das über `lkNoteX` bzw. `DrumSeq.lockParams` im selben Planer (sample-genau, nichts am Kern geändert). VERSION/CHANGES nicht angefasst. Quelle des Blocks und das Einhänge-Skript: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4491/pl1lab/pl1-block.js`, `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4491/pl1lab/patch.py` (`python3 patch.py <basis-kopie.html> pl1-block.js`, prüft jeden Anker auf genau 1 Treffer).

- Ziel = gehaltene Noten `{t, s, src, lbl, keys:[{t,n}], sid}` (über Ort+Tonhöhe wiedergefunden, ↶ ersetzt Notenobjekte). Regler = vorhandenes `makeCtl` mit eigenem `undo {snap: cleanClip, commit}` → je Geste ein `pushUndo(… 'Lock · Filter')` + `afterClipEdit` (laufender Clip hört es sofort). Doppeltipp (Standard) = Lock weg.
- Lock-Modus ([Alle Regler ›]): `selectSlot` + `openEditor` (Drums: `ED.dTab='sound'`, Pad des Schritts); `pl1Wr` fängt in den Settern nur **Gesten** ab (Finger auf dem Schirm oder < 400 ms her), schreibt in die Ziel-Noten und sammelt bis zum Loslassen zu einem ↶. Struktur-/Spur-Werte (`LKT.cls` s/r, z. B. Mono/Poly, Welle, fx.*) werden kein Lock und bleiben – die Leiste sagt es; ein anderes Drum-Pad ebenso. Anzeige über `kv1Ov`/`dSlotGet` (zeigt den Lock-Wert). Die Leiste liegt über der LCD-Zeile (48 px, rückt unter das ✕ des Editors, wenn es im Weg ist), Kontrolle alle 250 ms nur solange der Modus an ist; Editor zu = Modus aus.
- Lauflichter: `pl1Ll()` (Gerät, Standard an). Aus: `renderProgress` setzt die Balken einmal auf 0 und kehrt dann sofort zurück (Aufnahme-Füllung bleibt), Song-Leinwand bekommt die Stelle auf den Taktanfang gerundet (`barBeat(barAt(sb))` → 1 Bild je Takt), LAUF/SCHRITTE/ROLLE-Marke −1, Takt-LEDs aus, Pad-/Chip-Blitze aus, `MKUI.arpFrame` (Platten-LEDs, ARP-Blinken auch im Stand) ruht.

**Einhänge-Zeilen (alle mit `PL1` markiert):**
- PianoRoll `draw`: `if (opts.noteDeco) opts.noteDeco(x, nt, r);` vor der `nt.off`-Zeile · PianoRoll `playhead`: erste Zeile `if (typeof pl1Ll === 'function' && !pl1Ll()) beat = -1;`
- `mkSetP`: erste Zeile `if (pl1Wr(i, 'mk.' + path, v)) return v;` · `kv1Ov`: erste Zeile `{ const x = pl1Shown(i, k); if (x !== undefined) return x; }`
- `renderProgress`: erste Zeile `if (pl1LlProg()) return;` · `songFrame`: `const sb = pl1SongSb(svSongBeat(bAud));`
- `padFlashes`: `if (fire && pl1Ll() && UI.padEls[i] …` und `if (fire && pl1Ll() && UI.drumChips …`
- `uiFrame`: `if (R.editor === 'synth' && pl1Ll() && typeof MKUI … MKUI.arpFrame(…)` · `renderTakt`: `const led = !R.playing || !pl1Ll() ? -1 : …`
- `setP`: erste Zeile `if (pl1Wr(i, key, v)) return v;` · `fmSetOp` / `fmSetEnv`: erste Zeile `if (pl1Wr(i, 'fm6.ops.' + …, v)) return v;`
- `drumSet`: erste Zeile `if (pl1Wr(DRUM_T, 'drum.' + id + '.' + key, v)) return v;` · `dSlotGet`: zeigt `pl1Shown(DRUM_T, …)` zuerst
- `pageDrumSteps`: `decorate: (c, n, i) => { d1Decorate(c, i); pl1Deco(c, n); }` und danach `pl1DrumHold(ED.step);`
- `drumEdFrame` und `laufFrame`: `if (!pl1Ll()) st = -1;` vor dem Setzen der Marke
- `buildRoll`: `endActs: hm1Acts(t, s).concat(pl1Acts(t, s)), noteDeco: pl1RollDeco,`
- `buildLauf` decorate: `pl1Deco(cell, n);` nach `lf1Deco(…)` · `lf1StepRender`: `pl1LaufSect(p, t, s, k);` nach `p.innerHTML = h;`
- Menü: `pl1MenuRow(s6, row);` nach `ui1MenuHook(…)` · `ui1Entries`: zwei Einträge `locks`, `lauflicht` ans Ende (nach `help`)

## Tests
`node /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4491/pl1/pl1-test.mjs /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4491/pl1/index.html /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4491/pl1` → **38/38 OK** (`pl1-test-ergebnis.json`). Gemessen u. a.:
- LAUF mit echter Zwei-Finger-Geste (CDP-Touch): Finger 1 hält Schritt 3, Finger 2 dreht Filter → Lock entsteht während der Geste, nur Note 2, Grundklang 380 Hz bleibt, genau 1 ↶ „Lock · Filter“, Punkt nur an Schritt 3, Chip „Filter 20 kHz ✕“; ↶ nimmt ihn weg (Punkt weg), ↷ zurück.
- **Render (Song als Audio = Export-/Video-Weg), Spektralschwerpunkt je Achtel, mit/ohne Lock:** Schritt 3 → 2583 Hz statt 308 Hz (×8,4) und im 2. Takt ×8,0; alle anderen 14 Schritte ×1,000. Speichern → Datei hat den Lock nur an Note 2 → Laden → gleicher Render.
- Lock-Leiste: ✕ am Chip löscht nur diesen Lock (1 ↶); SCHRITTE: langer Druck öffnet „KICK · Schritt 5“ (Tune/Decay/Pegel/Drive), Tune +5 HT → Kern stimmt um (55 → 73 Hz), Punkt; „Locks löschen“ = 1 ↶; leerer Schritt wie bisher.
- ROLLE → [🔒 Locks] (Trefferfläche 44 px wie [Harmonie]) → [Alle Regler ›] → Klang-Editor im Lock-Modus: Cutoff mit der Maus gezogen → nur Note 5 (20 Hz), Klang bleibt 380 Hz, Regler + Leiste zeigen den Lock, 1 ↶; Mono/Poly → kein Lock, Leiste sagt es; [Fertig] → zurück in die ROLLE (Note gewählt), amberfarbener Punkt per Pixel geprüft. Drum-Editor und Platte im Lock-Modus ebenso (Decay bzw. F.CUT nur als Lock, Anzeige zeigt ihn, anderes Pad wird abgewiesen).
- **Lauflichter an → aus (4 s Wiedergabe, Chromium, CDP-Metriken):** Matrix DOM-Änderungen 2342 → 1310, Stil-Rechnungen 456 → 224, Rechenzeit 790 → 661 ms · Song: Leinwand-Bilder 107 → 2, Stil 444 → 234, Rechenzeit 497 → 383 ms · LAUF: DOM 1190 → 102, Bilder mit Änderung 268 → 31, Rechenzeit 585 → 253 ms · SCHRITTE: DOM 1959 → 100, Stil 291 → 8, Rechenzeit 736 → 156 ms; keine Marke, keine Takt-LED. Wieder an: alles läuft wie vorher.
- Lage gegen die Basis (frische Seiten, hochkant 428×926 und quer 926×428): LAUF, Schritt-Menü (quer gleiche Knopf-Rechtecke), ROLLE-Aktionen, SCHRITTE, Klang-Editor, Menü bis „Leucht-Look“ unverändert; Projektdaten gleich. Quer: Lock-Abschnitt rechts neben dem Schritt-Menü, ohne Rollen, auch 926×370; alle neuen Tasten ≥ 44 px; ✕ der Fenster und des Editors frei.
- Pflicht: topdefs 0/0, dupkeys 0, Rauchtest errors [], Markenwörter 0, „MS 2000“ 1, „  live: true,“ 1, Konsole ohne Fehler.
- Fotos: `pl1-lauf-hochkant.png`, `pl1-lauf-quer.png`, `pl1-lauf-quer370.png`, `pl1-schritte-hochkant.png`, `pl1-schritte-quer.png`, `pl1-rolle-hochkant.png`, `pl1-lockmodus-hochkant.png`, `pl1-lockmodus-quer.png`, `pl1-platte-hochkant.png`, `pl1-menu-hochkant.png`.

## offen
- Locks nur in Szenen-Clips (Matrix). ROLLE auf eigenen Song-Clips/Versionen und der Song-Melodie hat noch kein [🔒 Locks]; Bit Mask, Perkussions-Spuren und North-Pads haben keine Locks (Kern kennt sie dort nicht) – das Fenster sagt es.
- Lock-Modus: die Hüllkurven der FM-Operatoren (`fmSetEnv`) schreiben Locks, die Grafik zeigt aber den Grundwert. Die FM-FELD-Seite (fmx) geht nicht über `setP`/`mkSetP`/`fmSetOp`/`fmSetEnv`/`drumSet` und ändert im Lock-Modus weiter den ganzen Klang.
- Lauflichter aus: die Pegel-Balken (Meter) laufen weiter – sie sind keine Lauflichter (eigener Schalter wäre möglich). Auf dem echten iPhone nicht gemessen (Chromium-Messung oben).
- Mehrere Noten mit unterschiedlichen Locks: der Regler zeigt den Wert der ersten Note, ein Dreh setzt alle gewählten gleich.
- Vorhandene Eigenheit (nicht PL1): der VA-Klang hat leichte Zufalls-Drift (Analog), zwei Renders ohne Lock unterscheiden sich an einzelnen Noten – der Test vergleicht deshalb mit großem Abstand (×8 gegen ×1,000).
