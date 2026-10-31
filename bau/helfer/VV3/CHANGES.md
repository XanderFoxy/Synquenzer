# CHANGES – Nachtrag 5, VV3 „Innenleben“ (Helfer-Zweig `helfer-vv3`, ab `bau/snapshots/VV1.html`)

Stand: `bau/helfer/VV3/index.html` = VV1 (App 4.25.0) + VV3. **VERSION-Zeile unverändert.** Format bleibt 5, kein neues Feld im
Projekt, keine Server-Änderung, kein Supabase-Aufruf. „MS 2000“ steht weiter genau einmal im Quelltext (`MK_LABEL`); die Platte
und die Kopfzeile nehmen den Namen aus `MK_LABEL`.

## Was neu ist

**Spur-Bild** auf der Video-Bühne: das Instrument einer Spur, gezeichnet (Canvas, nur gezeichnete Formen, keine Emoji) mit seinen
Werten zur Videozeit t. Kopfzeile: Spurfarbe, Spurname, Klangerzeuger · Klangname.

- **MS-Spur (`engine: 'mk'`)**: die **Platte wie in der App** – Abschnitte, Drucke, Regler, Tasten, LEDs und Anzeige aus denselben
  Daten (`MKUI.SEC` / `MKUI.ELS`, Positionen in Plattenmaß, Farben der Platte). Die Regler stehen auf den Werten des Klangs.
  **Modulation sichtbar:** CUTOFF (und die PATCH-/SEQ-Ziele STEUER 1, NOISE, PAN, die übrigen SEQ-Ziele auf der Platte) bekommen
  einen gelben Zweitzeiger mit Bogen vom Reglerwert zum Wert, den die Klangerzeugung gerade hat. LEDs: Wellen OSZ 1/2, Filtertyp,
  LFO-Wellen, VIRTUAL-PATCH-Quellen/-Ziele, SEQ AN, GATE/DIST, ARP; die **16 Schritt-Tasten leuchten als Lauflicht des
  Mod-Sequenzers**. Daneben/darunter: **LFO 1 und LFO 2 als laufende Welle mit Phasenpunkt** (Frequenz bzw. Notenwert, Key Sync),
  **EG 1 und EG 2 mit laufender Position** (Kurve der aktuellen Note, Punkt auf der Kurve), **MOD SEQUENCE** (Schrittwerte, laufender
  Schritt), **CUTOFF** groß (Reglerwert und wirksamer Wert).
- **FM-Spur (`fm6`)**: der **Algorithmus** als Operator-Graph (Lage wie `algLayout` der App, Träger mit kräftigem Rand, Summen-Schiene,
  Feedback-Schleife); jede Operator-Box füllt sich mit ihrem **Pegel aus der Hüllkurve** (60-dB-Skala), aktive Modulationswege
  leuchten; daneben die sechs **Operator-Pegel** als Balken.
- **Übrige Klangerzeuger (VA `analog`, WT)**: Hauptregler (CUTOFF, RESONANZ, FILTER-HK, DRIVE, PEGEL; grüner Zweitzeiger = wirksamer
  Wert), **Filter** als Kurve beim wirksamen Cutoff (Reglerwert grau), **LFO 1/2** als laufende Welle mit Phasenpunkt, **Hüllkurve
  (AMP)** mit laufender Position.
- **Drums**: die 12 Pads (Namen wie in der App), ein Pad **blinkt** beim Schlag (Stärke nach Anschlag, 180 ms).
- **STIMME**: die **Wellenform** des spielenden Takes mit grünem **Laufband** an der gehörten Stelle (Clip-Start, Schleife, `a.at`).

**Werte = Rechnung, nicht Audio-Faden.** Der Offline-Durchlauf von VV1 nimmt jetzt nach jedem Scheduler-Schritt die neuen Einträge
des Notenlogs (Clip, Arp, Melodie, Drums – mit Zeit, Dauer, Ton, Anschlag) je Spur mit (`vv3Cap`, nur Lesen). Daraus und aus Klang +
Tempo rechnet das Bild mit **denselben Formeln wie die Klangerzeugung**:
- MS: LFO-Phase wie `MkTim.block/voice` (Tempo-Sync + Key Sync aus = an der Song-Position; Key Sync Timbre = ab der ersten Note nach
  „alle Tasten los“; Key Sync Stimme = ab dem Anschlag der Note; sonst frei laufend ab Start der Klangerzeugung = Kontextzeit 0),
  Frequenz `MKW.lfoHz` / `LSYNC`, Wellen wie `mkLfoV`; Hüllkurven = `mkEnvC`-Koeffizienten, `mkEnvB` je Steuerblock (16 Samples)
  geschlossen gerechnet; VIRTUAL PATCH (W-18, `MK_PSPAN`), Cutoff = Regler + SEQ + PATCH + EG1·EG-INT + KBD + VEL (W-01…05);
  Mod-Sequenzer = `sqPrep`/`sqAdv`/`sqVal` (Reihenfolge nach TYP, Schrittlängen nach AUFLÖSUNG und Schrittlänge-Spur, Song-Raster bei
  KEY SYNC aus, Glatt/Stufe).
- FM: DX-Hüllkurven wie `fmVoicePatch`/`fmAdvance`/`fmEnvStep` (Ausgangspegel, Tastatur-/Anschlag-Skalierung, Rate-Skalierung,
  Statik-Phase, Anstieg in 256er-Bändern, Abfall linear, ATTACK/DECAY/RELEASE-Makros, BISS); die Tabellen werden **aus dem
  Worklet-Quelltext selbst** gelesen (gleiche Zahlen, keine Kopie).
- VA/WT: LFO wie `control()` des Worklets (Sync am Song-Start, Retrig, Einblenden), Hüllkurven `envValueAt` + Release wie `envCoefs`,
  Modulationsmatrix (`dst += amt · src`), Cutoff in Halbtönen wie im Worklet (Hüllkurve × 72, Mod × 120).

**Für die Regie (VV2):** `vvDrawTrackShot(g, i, t, rect, src)` zeichnet das Spur-Bild der Spur i zur Videozeit t in ein Rechteck
(Pixel; `src` = Render-Ergebnis, Standard `VV.last`, ohne = live/Vorschau). In `vvDraw` gibt es die Ansicht **`'spur'`** (Spur aus
`st.spur`). `vvStateAt` liefert dafür `st.t` und (nicht aufzählbar) `st.src`.

Test-API: `vv3Probe(i, t, fmt)` (die gezeichneten Werte), `vv3Png(i, t, fmt)`, `vv3Ms(i, t, n)` (ms je Bild), `vv3Notes(i)`, `vv3Log()`,
`vv3T0()`; `vvTest({spur: i, probe: true})` (nur Tests: jedes Video-Bild zeigt Spur i, jedes Bild schreibt seine Werte ins Log).

## Abnahme

Chromium (Playwright, headless, 4 vCPU), Skripte in `bau/helfer/VV3/tests/`, Ergebnisse `out-vv3-0*.json`, Beispielbilder in
`frames/`. Test-Song: 8 Takte, 120 BPM, Synth 3 = MS-Spur mit LFO 1 → PATCH 1 → CUTOFF, Synth 2 = FM (Werk), Synth 1 = VA, Drums.

| ID | Ergebnis | Messung / Skript |
|---|---|---|
| VV3-01 | **bestanden** | `vv3-01.mjs`. (a) **Rechnung des Bildes gegen die Klangerzeugung selbst**: MS-Klang durch das App-Worklet (`mkRender`, Test-Abgriff `lfo` = LFO-1-Wert der klingenden Stimme je Sample), Sägezahn, 1,006 Hz frei bzw. 1 Hz Tempo-Sync (1/2 bei 120 BPM), je 138 Bilder (30 fps): größter Phasenfehler **frei 0,037 %, Tempo-Sync 0,032 %, Key Sync Timbre 0,041 %, Key Sync Stimme 0,041 %** (Grenze ±2 %). (b) **echter Video-Auftrag** (16:9, WebCodecs, 550 Bilder): gezeichnete LFO-Phase je Bild gegen frac(t · Hz) **0,000 %** (Sync 1 Hz und frei 1,006 Hz), gezeichneter Cutoff-Zeiger gegen CUTOFF + 20/63 · 127 · LFO **0,000** Einheiten. |
| VV3-02 | **bestanden** | `vv3-02.mjs`. **Bild gegen den Ton**: ein Träger-Operator allein (Alg. 32) durch das App-Worklet, Pegel je 10 ms in dB gegen den gezeichneten Operator-Pegel (6,02 dB je 256 Einheiten), drei Hüllkurven (schneller Anschlag + Abfall, langsamer Anschlag, DECAY-Makro), alles oberhalb −50 dB: **größte Abweichung siehe out-vv3-02.json (≤ 0,32 dB)**, Anschlag, Halten, Loslassen folgen. Video-Auftrag FM-Spur 9:16 (550 Bilder, 128 Noten): gezeichnete Pegel = Rechnung aus den mitgenommenen Noten in allen Bildern, Träger steigt 128 × mit den Anschlägen, fällt danach. |
| VV3-03 | siehe unten | `vv3-03.mjs` |

## Abweichungen

- **„Regler-Automation/Bewegungen aus Aufnahmen (falls im Clip)“ (Punkt 3):** Clips tragen im Format 5 keine Regler-Bewegungen
  (nur Noten, Tonart, Quantisierung, Takes; die Drums Schritt-Sperren `lk` für Stimmung/Abklingen). Deshalb bewegen sich die Regler
  hier nur durch Modulation (LFO, Hüllkurven, VIRTUAL PATCH, Mod-Sequenzer – dessen Schritte sind die aufgenommenen Bewegungen der
  MS-Spur). Kommt eine Aufnahme von Regler-Bewegungen in den Clip (z. B. mit VC2a), ist die Stelle `vv3PlateN`/`vv3Knob`.
- **S/H-Wellen** (Zufall) zeichne ich als Phase ohne Höhe (Punkt auf der Mittellinie): der Zufallswert der Klangerzeugung hängt am
  Zähler im Worklet, den das Bild nicht liest.
- **Vorschau (live):** frei laufende LFOs (Key Sync aus, kein Tempo-Sync) haben dort eine unbekannte Startphase (die Klangerzeugung
  läuft seit dem Laden); Sync- und Key-Sync-LFOs, Hüllkurven, Pads stimmen. Im **Video** ist alles gerechnet (Startzeit bekannt).
- **WT** spielt in der App über native WebAudio-LFOs (ohne Retrig/Einblenden, wie der Hinweis in der App sagt); das Bild nimmt
  dieselbe Formel (`lfoPhase`), für WT also ohne Retrig.
- **Dual/Split** der MS-Spur: Platte und Werte zeigen Timbre 1.
- Eine Ansicht des Spur-Bilds im Blatt gibt es nicht (VV1 hat keine Spur-Ansicht): Auswahl kommt mit VV2 (Regie „Spur …“ /
  Auto-Regisseur). Bis dahin nur über `vvDrawTrackShot` / `vvTest({spur})`.

## Fragen an Xander

1. Spur-Bild der MS-Spur: Platte oben + darunter/daneben LFO, Hüllkurven, Sequenzer und CUTOFF groß. Reicht dir die Platte allein,
   oder soll es so bleiben (die Platte ist im 9:16-Bild nur 360 Punkte breit, die Beschriftung ist klein)?
2. Farbe der Modulation: Zweitzeiger + Bogen gelb (Bernstein der App), laufende Positionen grün (Laufband-Grün). Passt das?
3. Drums: blinken 180 ms, Stärke nach Anschlag. Länger/kürzer?

## iPhone (Xander)

Erst nach VV2 sichtbar (dort wählst du „Spur …“). Dann: Spur-Bild einer MS-Spur mit LFO auf Cutoff im Video ansehen – Welle,
Punkt und Zeiger laufen ruhig mit dem Klang; FM-Spur – Operator-Boxen füllen sich beim Anschlag; Drums – Pads blinken auf dem Schlag.

## Für das Zusammenführen

- **Neuer Block** direkt nach `/* VV1-END */`: von „VV3 (Nachtrag 5): Innenleben – das Spur-Bild“ bis `/* VV3-END */`
  (`VV3`, `vv3Cap`, `vv3Notes`, `vv3LiveSrc`, `vv3MkEnv`, `vv3MkLfoV`, `vv3MkLfo`, `vv3MkSeq`, `vv3MkState`, `vv3VaLfo`, `vv3Adsr`,
  `vv3VaState`, `vv3Fmx`, `vv3FmLevel`, `vv3FmState`, Zeichnen `vv3Knob/vv3Panel/vv3Wave/vv3EnvCurve/vv3PlateStatic/vv3PlateN/
  vv3DrawPlate/vv3DrawMk/vv3DrawVa/vv3DrawFm/vv3DrawDrums/vv3DrawVoice/vv3Shot`, **`vvDrawTrackShot`**, `vv3Api`).
- **Einzeilige Haken in VV1-Funktionen:**
  - `vvRenderAudio` / `onSusp`: nach `if (R.playing) tick(h);` die Zeile `vv3Cap(live, t0);`
  - `vvRenderAudio` / `finishLive`: `vv3Cap(live, t0);` vor `off.log = noteLog(4096);`
  - `vvRenderAudio`, Ergebnis `r`: `, nt: live.nt || [], t0: live.t0` angehängt.
  - `vvStateAt`: Zeile `st.t = t; Object.defineProperty(st, 'src', …)` vor `return st;`
  - `vvDraw`: Zeile `if (view === 'spur' || (VV.test && VV.test.spur != null)) vv3Shot(…); else` vor der Matrix/Song-Wahl
    (**VV2**: dort die Spur aus `st.spur` setzen bzw. `vvViewOf` um `'spur'` erweitern).
  - Test-API: Zeile `Object.assign(SYNQUENZER, vv3Api());` nach der VV1-Zeile.
- Keine Änderung an Engines, Worklet, Format, Speichern/Laden, CSS oder Blatt.
