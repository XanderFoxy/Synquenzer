# MX1 – Automatischer Mix und Master (Arbeitskopie w4440/mx, Basis 4.42.0)

## 1. Für Xander

- **MASTERN:** FX › MASTER → AUTO-MASTER → Stil wählen (**Synth-Pop · Disco · House · Sanft**) und Ziel (Streaming −14 / Laut −9 LUFS) → **MASTERN**. Die App hört den Song einmal durch und stellt Multiband-Kompressor (3 Bänder), sanfte Sättigung, Bus-Kompressor und Limiter so ein, dass er genau auf der Ziel-Lautheit liegt, ohne Übersteuern (gemessen: −1,5 dBTP). Mit **Vorher/Nachher** hörst du den Unterschied.
- **Mix-Assistent:** Jede Spur zeigt jetzt Rolle, Frequenzbild (9 Balken), Breite, Hall- und Echo-Anteil und von wem sie zugedeckt wird. Die Vorschläge denken im Zusammenhang: wer in einem Band Vorrang hat (z. B. Lead bei 1 kHz), Bass bleibt voll (nur Subsonic), Fläche nach hinten (mehr Hall, weniger Höhen), Lead nach vorne. Einzeln **Übernehmen** oder **Alle übernehmen** (ein Schritt zurück mit ↶), dazu **Vorher/Nachher**.
- **Rolle selbst setzen:** Im Mix-Assistenten auf „Rolle: …“ tippen → Drums, Bass, Lead, Fläche, Sequenz, Gesang oder Automatisch. Die Vorschläge rechnen sofort neu.
- **EQ · KOMP je Spur:** FX › SPUR → neue Taste **EQ · KOMP** (oder im Mix-Assistenten). Low-Cut, Bass, Mitte (Frequenz, dB, Güte), Höhen und Kompressor (Schwelle, Ratio, Attack, Release, Make-up) mit Kurve; wirkt auch im Video und Export.

## 2. Technik (alles mit Kürzel `MX1`, neuer Block `MX1 BEGIN … MX1 END` direkt nach der MIX-A-Test-API, CSS-Block nach dem MIX-A-CSS)

Neuer Block (JS):
- `mx1DspMake(D)` – DOM-freier Kern (Worklet, Worker, Hauptfaden): `MB3` (3-Band, Linkwitz-Riley 4. Ordnung bei f1/f2 + Allpass im Tiefband, je Band RMS-Kompressor 5 ms, weiches Knie, Make-up gleitend), `Master` (MB3 → Sättigung `tanh(k·x)/k` → MIX-A-Master; ohne `mb`/`sat` = MIX-A-Master), `pre`, `bands`, `fit` (Stil + Ziel → `mb`, `sat`, Bus-Kompressor, Pegel per Sekante wie MIX-A), `analyse` (Oktavspektrum, Breite, Hall/Echo-Anteil aus den Werten, Überdeckungsmatrix je Band mit Fader/EQ/Pan), `refine` (Subsonic statt Bass-Low-Cut, Überdeckung → Glocke, Bass-Shelf, Tiefe über Hall-Send + Höhen, Echo an Bass/Drums, Breite-Hinweise), `eqDb`, `STYLES`, `OCT`.
- Worklet-Prozessor `synq-mx1-an` (im MIX-A-Modul, nur im Messdurchlauf): je Spur 9 Oktavbänder 63 Hz … 16 kHz des Mono-Mittels, Mitte- und Seitenenergie, Fenster 2048 Proben.
- Hauptfaden: `mx1TapBuild`, `mx1Wait`, `mx1Msg`, `mx1JobEnd`, `mx1Fit`, `mx1WorkerSrc`, `mx1ModSrc`, `mx1SetRole`, `mx1Resuggest`, `mx1AbMark`/`mx1MixAB`/`mx1AbEnd`, `mx1EqSet`/`mx1EqSheet`/`mx1EqBtn`/`mx1EqPath`, `mx1MixTop`, `mx1CardHtml`, `mx1MixTap`, `mx1AmTop`, `mx1AmRows`, `mx1AmTap`, `mx1Master`, Normalisierer `mx1NormRole`, `mx1NormAmX` (in sich geschlossen, laufen schon beim Start), `mx1AmP`, `mx1AmPick`, `mx1AmSame`, `mx1Style`, `MX1_API`.
- Test-API (ans Ende vor `NO_SYNC`): `mx1Info, mx1Role, mx1Resuggest, mx1EqSet, mx1EqSheet, mx1Close, mx1MixAB, mx1Style, mx1Master, mx1Core, mx1Node`.

Einhänge-Zeilen in MIX-A (je eine Zeile bzw. ein Ausdruck, Kommentar `MX1`):
- `mixaDspMake` Track: `TDEF.ls`, Zustand 16 statt 12, `cL` (Bass-Shelf 150 Hz) in `coefs`/`glide`/`process`. `mixaMixR` + `ls`.
- `MIXA_PROC_SRC`: Master-Knoten = `MX1_D.Master`; `mixaModSrc` + `mx1ModSrc()`; Worker-Quelle + `mx1WorkerSrc()`; `mixaJob`: `op 'am'` mit Stil → `mx1Fit`, Ende → `mx1JobEnd`.
- `mixaNormAm` + `...mx1NormAmX(a)`; `mixaAmP` → `mx1AmP`; `amApply` + `mx1AmPick(P)`; `amPaint` (`same` + `mx1AmSame`, `mx1AmTop`, `mx1AmRows`); `amSheet`-Tipp → `mx1AmTap`.
- `mixaFxOf` + `rev`/`dly`; `mixaSnap`/`mixaRestore` + Rolle; Spur-Normalisierer + `mxRole`.
- `mixaTapBuild` + `mx1TapBuild`; `mixaRender` + `mx1Wait`; `mixaMeasure` (`MX1.tap`, `mx1Msg` an den Worker, `st` für den Master-Fit); `mixaApply` + `mx1AbMark`.
- `mixaSheet` (Tipp → `mx1MixTap`, `mx1AbEnd`; `onClose`), `mixaPaint` (`mx1MixTop`, `mx1CardHtml`).
- `pageFxSpur` und `pageDrumSpur`: + `mx1EqBtn(…)`.

Datenfelder (alle additiv, Format unverändert):
- `track.mix.ls` (−12 … 12 dB, Bass-Shelf 150 Hz), `track.mxRole` ('drums'|'bass'|'lead'|'pad'|'arp'|'voc', fehlt = automatisch).
- `fxBus.am.st` (Stil), `fxBus.am.mb` = `{f1, f2, b: [[thr, ratio, attack ms, release ms, make-up dB] × 3]}`, `fxBus.am.sat` = `{k}`.

CSS (Block `MX1 BEGIN/END`): `.mx1b` (Zelle in FX › SPUR: hochkant Reihe 2 Spalte 3–4, quer Reihe 1 Spalte 7–9; mit Preset-Hinweis-Chip teilen sie sich die Zellen), `.mx1eqs` (Blatt, Kurve, Reglergitter), `.mx1rl/.mx1rs/.mx1sw/.mx1sp/.mx1kv` (Mix-Karte), `.mx1amt` (Stil + MASTERN, quer in einer Reihe), `.mx1g`.

## 3. Tests (`mx1-test.mjs`, ein Lauf) – 30/30 OK

Aufruf: `node mx1-test.mjs <index.html> <basis.html> <ordner>`; Ergebnis in `mx1-test-ergebnis.json`, Fotos `mx-p-mix.png`, `mx-p-eq.png` (hochkant 428×926), `mx-l-am.png`, `mx-l-spur.png` (quer 926×428).
- DSP: Spur-Einschub ohne Bass-Shelf und Auto-Master ohne Multiband **bitgleich** zum 4.42.0-Kern (alte Projekte klingen gleich); Multiband neutral flach (Rauschen −0,004 dB, Sinus 40 Hz … 15 kHz 0,000 dB); Bass-Shelf −2,98 dB bei 40 Hz, 0 dB bei 2 kHz.
- Demo-Song (8 Takte + Lead-Clip): Rollen Bass/Sequenz/Fläche/Drums/Lead erkannt; Werte je Spur; Bass nur Subsonic 30 Hz (unter 65 Hz), Fläche Low-Cut 185 Hz; Überdeckung nur bei Spuren ohne Vorrang (Sequenz/Fläche bei 1 kHz); Alle übernehmen = 1 Undo-Schritt, Undo/Redo; Vorher/Nachher; Lead vorne (−21,3 vs −24,9 dB, Hall −13 vs −4,3 dB); Rolle überschreiben (1 Schritt, Vorschläge neu ohne Durchlauf); EQ · KOMP (Knoten läuft, neutral = kein Einschub, Undo).
- Mastern am **Render gemessen**: Synth-Pop −14 → −14,01 LUFS, −1,50 dBTP; House −9 → −9,08 LUFS, −1,50 dBTP; Standard ohne Pumpen/Verzerren (Band-Arbeit Ø ≤ 1,4 dB, Limiter Ø 0,04 dB, Sättigung −0,36 dB an den Spitzen). Master Vorher/Nachher; Speichern/Laden (Rolle, Spur-EQ, st/mb/sat).
- Oberfläche: Tasten ≥ 44 px, nichts abgeschnitten, EQ-Blatt hochkant und quer ganz im Bild, EQ · KOMP überdeckt keinen Regler (Synth und Drums, hochkant und quer), ✕ sichtbar, keine Konsolenfehler.
- Pflicht: topdefs 0 Syntaxfehler / 0 doppelt; smoke `errors []`; Markenwörter 0, „MS 2000“ 1×, `  live: true,` 1×.

## 4. Offen / Risiken

- CPU live (iPhone) nicht gemessen: Der Master-Knoten rechnet mit Multiband + Sättigung etwa doppelt so viel wie vorher (18 Biquads + 6 log/exp + 2 tanh je Probe, nur ein Knoten, nur wenn `am.mb` da ist). Ohne Übernahme: kein Knoten.
- Spur-Analyse misst im **einen** Offline-Durchlauf jede Spur einzeln (Abgriff vor dem Einschub, ganzer Song) statt eines eigenen Renders je Spur (8–16 Takte) – genauer und schneller; „Analysieren“ dauert dadurch etwas länger (ein Analyse-Knoten mehr).
- Hall-/Echo-Anteil je Spur ist aus den Werten gerechnet (Send · Rückweg · Länge/Feedback), nicht gemessen – der Hall ist ein gemeinsamer Bus.
- Ziel-Lautheit bleibt bei den zwei MIX-A-Zielen (−14 „Streaming“, −9 „Laut“); ein eigenes „Club“-Schild habe ich nicht vergeben.
- Ältere App-Fassungen kennen `am.mb/sat/st`, `mix.ls`, `mxRole` nicht und lassen sie beim Speichern weg (nicht in der N8-Prüfliste eingetragen).
- Mix-Vorher/Nachher stellt den Stand vor dem ersten Übernehmen wieder her (inkl. Master) und markiert das Projekt als geändert; Schließen des Blatts = wieder Nachher.
- Schon in 4.42.0: Taste „Vorher/Nachher“ im Auto-Master ist bei 375 px Breite zu schmal für den Text (bei 428 px in Ordnung) – nicht angefasst.
