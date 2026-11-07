# GR1 – Groove: Stil-Grundmuster, Remix per Knopf, Zwingen-%, Small/Full, Song transponieren

## 1. Für Xander

- **Remix:** ≡ → Zeile „Song“ → **Remix …** (ganzer Song) oder im Song eine Marke antippen → Zeile **Rhythmus** → **Remix …** (nur dieser Teil). Wähle einen Stil (New Jack Swing, Euro Disco, Detroit Pop, Frühes House, Funk House, Garage 2-Step, Synth-Pop) und Zwingen 0–100 %. Dann **Remix erzeugen**. Drums und Bass werden neue Versionen (v2 …) mit deinen Kit-Sounds und Klängen. **A Original** / **B Remix** schaltet hin und her, beim Abspielen ab dem nächsten Takt. ♩ übernimmt das typische Tempo des Stils.
- **Grundmuster:** Clip halten → Clip-Blatt → **Grundmuster ▾** (Drum-Clips und Bass-Clips). Im Drum-Editor auch unter Muster ▾ → **Stil-Grundmuster ›**. Ersetzt den Clip, ↶ holt ihn zurück.
- **Small/Full:** Drum-Clip halten → Clip-Blatt → **Small** oder **Full** markieren. Eine Version im Song: Zelle halten → „v2 ist: Small | Full“. Im Marken-Blatt wählt **Small** / **Full** für den ganzen Teil die markierte Version. **Vorschlag** markiert selbst (dünn = Small) und legt bei nur einem Clip eine ausgedünnte Version an.
- **Song transponieren:** ≡ → Song → **Transponieren …** → −1 / +1 / Auf 0. Gilt für alles außer Drums und Perkussion. Gesang geht nur bei Takes mit „folgt Transponieren“ mit.

## 2. Technik

Neuer Block `/* GR1-BEGIN … GR1-END */` direkt vor `const NO_SYNC = new Set([` (Ende des Haupt-Skripts). Einhänge-Zeilen (je 1 Zeile, Kürzel GR1):
- `normClip`: `gr1ClipNorm(c, out);` vor `return out` (clip.sf, clip.gr)
- `cleanClip`: `if (c.sf) o.sf = …; if (c.gr) o.gr = …;` vor `return o`
- `openMarkSheet` → paint: `gr1MarkSheetPaint(p, m);` nach `sx126MarkSheetPaint`
- `openCellSheet`: `(vh ? gr1CellRow(song, t, vh) : '')` nach der SX9-Versionszeile + `if (gr1CellTap(a, b, t, bar)) return;` nach `vvshow`
- `openPatterns` (Drum-Editor Muster ▾): `gr1PatternsHook(p, anchor);`
- `openClipSheet`: `gr1ClipSheet(g, t, s, clip, reopen);` nach dem ◆-Knopf
- Menü (Projekt): `gr1MenuRow(s1, row, btn);` nach `vvMenuRow`

Daten (additiv, ohne Feld byte-gleich, Format bleibt):
- `clip.sf: 's' | 'f'` – Small/Full (Szenen-Clips und Versionen)
- `clip.gr: {s: Stil-ID, v: Quell-Version, z?: Zwingen-%}` – nur an Versionen (`song.own`, SX9 `ver ≥ 2`), die der Remix erzeugt
- Song transponieren schreibt `song.xp` (vorhandene Teil-Transposition, ±12)

Funktionen/Daten: `GR1_STYLES` (7 Stile: Drum-Muster je Pad, Swing, Bass-Rhythmus, Tempo; eigene Daten), `GR1_SUB` (Pad-Ersatz nach den Pads des Clips: Clap/Rim statt Snare, Shaker statt Hi-Hat …), `gr1DrumNotes`, `gr1Roots`/`gr1BassNotes` (Grundton je halbem Takt aus dem Clip), `gr1ForceNotes` (KeyDetect.quantize, Raster 1/16 + Swing, Stärke = Zwingen), `gr1Role`, `gr1Spans`, `gr1Src`, `gr1Find`, `gr1VerPut`, `gr1RemixDo`/`gr1Remix`, `gr1ABDo`/`gr1AB`, `gr1Info`, `gr1Pattern`/`gr1PatPop`/`gr1PatternsHook`, `gr1ClipSf`, `gr1VerSf`, `gr1MarkInfo`, `gr1MarkSf`, `gr1Thin`, `gr1Vorschlag`, `gr1XpInfo`/`gr1XpShift`/`gr1XpLive`/`gr1XpOpen`, `gr1RemixOpen`, `gr1MenuRow`, `gr1MarkSheetPaint`/`gr1MarkTap`, `gr1ClipSheet`, `gr1CellRow`/`gr1CellTap`.
Undo: Remix, A/B, Small/Full im Teil, Version markieren, Transponieren = je 1 Schritt `song` (Labels in `SX.lab`, damit ↶/↷ beim Abspielen am nächsten Takt greift); Grundmuster / Clip markieren = 1 Schritt `clip`; Vorschlag = 1 Gruppe (clip + song).
CSS: wird vom Block als `<style id="gr1-css">` eingesetzt (Klassen `gr1r`, `gr1sf`, `gr1b`, `gr1sheet`, `gr1-st`, `gr1-zr`, `gr1-ar`, `gr1-xr`, `gr1-xv`, `gr1-tip`, `gr1pat`, `gr1-sfc`, `gr1-cv`, `gr1cb`); alle neuen Tasten ≥ 44 px (auch quer im Clip-Blatt).
Test-API (am Ende, `GR1_API`): `grStyles, grPattern, grDrumNotes, grBassNotes, grRemix, grAB, grRemixInfo, grRemixOpen, grSetUi, grClipSf, grVerSf, grMarkSf, grMarkInfo, grVorschlag, grXp, grXpInfo, grXpOpen`.

## 3. Tests

- Skript: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4440/groove/gr1-test.mjs` → **30/30 OK**, keine Seiten-/Konsolenfehler. Geprüft: Song mit 2 Teilen → Remix New Jack Swing → neue Drum-Version (v2, gr njs), nur Kit-Pads, Kit unverändert, Backbeat auf den Pads des Clips (Snare + Clap), **Swing gemessen 0,620** (Hi-Hat-Off-Sechzehntel), v1 unverändert, 1 Undo-Schritt, Bass-Version; A → Original, B → Remix; Zwingen 100 % (alle Noten auf Raster + Swing) und 0 % (unverändert); ↶/↷; Small/Full (Clip-Blatt, Vorschlag mit ausgedünnter Version, Teil-Schalter Small → Full); Grundmuster Drums (leere Szene) + Bass (↶); Song transponieren +2/−2, Grenze ±12; Speichern/Laden (serialisieren → normalisieren → anwenden) Song + Clips gleich inkl. sf/gr/xp; echte Tipps im Remix-Blatt während ▶ SONG (erzeugen → A → B); Einstiege Menü und Muster ▾; Tastengrößen + ✕ hochkant 428×926 und quer 926×428 (zusätzlich Marken-Blatt bei 926×370 und 375×667 nachgemessen: passt, ✕ sichtbar).
- Fotos: `gr1-marke-hochkant.png`, `gr1-remix-hochkant.png`, `gr1-remix-quer.png`, `gr1-clipblatt-quer.png` (gleicher Ordner).
- Pflicht: topdefs 0 Syntaxfehler, 0 doppelt (Namen 4951 → 5001, alle neu mit `gr1`/`GR1`); Rauchtest `errors []` (`smoke.png`); Marken 0, „MS 2000“ 1, `  live: true,` 1. basis.html unverändert.

## 4. Offen / Risiken

- Das Marken-Blatt ist eine Zeile (44 px) höher. Quer bei 926×370 geht es jetzt fast bis oben (✕ bei y = 14). Bringt ein anderes Paket beim Zusammenführen noch eine Zeile dazu, reicht der Platz quer nicht mehr. Dann muss die Rhythmus-Zeile quer mit einer anderen Zeile zusammengelegt werden.
- Remix lässt eigene Clips („eigen“, keine Version) und Clips mit anderer Taktart als 4/4 aus (Drums/Bass); die Song-Melodie (`song.mel`) und STIMME/Audio werden nicht gezwungen.
- Versionen gelten im ganzen Song: Ein Teil-Remix legt die Version an, die auch ein späterer Song-Remix desselben Stils wieder nimmt. Neu erzeugen mit anderem Zwingen ändert die Version überall, wo sie spielt.
- Höchstens 8 Versionen je Clip (SX9): Werden es mehr, meldet der Remix „ohne Platz“.
- Tempo: ♩ setzt das BPM direkt, wie der BPM-Regler, ohne ↶ (der Hinweis hat „Zurück auf …“).
- Song transponieren läuft über die Teil-Transposition: Sie wirkt beim Abspielen im Song, im Export und im Video, nicht beim Starten einzelner Clips in der Matrix. Wird beim Abspielen ↶ gedrückt, gilt die alte Lage erst beim nächsten Wechsel der Teil-Transposition, beim Schleifensprung oder beim nächsten Start (↶ ruft kein `gr1XpLive` auf).
- Bass-Erkennung über `sx11Role` (Klang-Kategorie „bass“ oder tiefe Einzeltöne). Erkennt die App eine Spur nicht als Bass, wird sie beim Remix nur gezwungen und nicht neu gebaut, und im Clip-Blatt fehlt dort „Grundmuster ▾“.
- Die Stil-Muster sind ein erster Satz: ein Takt (Garage zwei Takte), ohne Fills. Feinschliff nach Xanders Gehör.
