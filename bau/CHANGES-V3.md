# CHANGES-V3 — SYNQUENZER v3

Fähigkeiten-Summe (EN-19, B.0), fortgeschrieben je Paket:

```js
capabilities: {
  downloads: { /* wie bisher – Form der letzten v2-Veröffentlichung, in den Dateien nicht festgehalten (vor VC1 nachsehen) */ },
}
```

V0a, V0b und V0d fügen keine Fähigkeit hinzu. Die App läuft weiter ohne jede Fähigkeit (`use()` → `null`, EN-13).

---

## V0a — Fehler und Stabilität (+ N0a Auslieferung nach EN-12) · App 3.1.0

App: `dirigent-wt/index.html` (1 310 652 B = 1,25 MB; v2-final 1 283 872 B → **+26,2 KB**, Budget V0a 25 + N0a 5 KB),
Snapshot `synq-snapshots/V0a.html`. Spec: `v3-ideen/dirigent-spec-v3.md` §2.1 K-01…K-17, §16, §17 V0a; Nachtrag A.1 (N0a), EN-12.
Arbeitsdateien: `v0a-work/` (`base.html` = v2-final für Vorher-Messungen, `repro/*.txt` Messausgaben alt/neu, `native/`
Kalibrier-Messungen V0a-19, `shots/` Bildschirmfotos). Tests in `dirigent-test/`: `v3-v0a-lib.mjs` (M-KLICK, M-PEGEL,
M-SP, Stereo-Rekorder), `v3-v0a-fix.mjs`, `v3-v0a-drum.mjs`, `v3-v0a-roll.mjs`, `v3-v0a-native.mjs`, `v3-v0a-natfeat.mjs`
(Merkmals-Kalibrierung), `v3-v0a-n0a.mjs`, `v3-v0a-shots.mjs`, `v3-v0a-dod.mjs`, `v3-pe1.mjs`, `v3-startup.mjs`, die
Anpassungen `v3-v0a-adapt-*.mjs` und der Lauf `v3-v0a-reg.sh` (Ausgabe `dirigent-test/v3-v0a-reg/<OUT>`).
`sq5-lib.mjs` und `rob-lib.mjs` lesen jetzt wie `wp1-lib.mjs` die Umgebungsvariable `SQ_FILE` (für Vorher-Läufe).

### Gebaut

1. **K-01 Clap-Pegel 0 / Doppelplanung.**
   - `DrumSynth.hit`: eine Schicht (TON, RAUSCHEN, METALL, KLICK) wird nicht gebaut, wenn `lvl·Schichtpegel < 1e-4`; jede
     `exponentialRampToValueAtTime` bekommt `Math.max(x, 1e-4)` (Hüllkurven-Spitze und die Klatsch-Bursts).
   - `tick()`: Carrier/LFO, Klick/Pumpen, `recTick`, `songTick`, jede Spur (`scheduleTrack`) und der Spurwechsel je in einem
     eigenen `try/catch`; `R.schedBeat = b1` steht im `finally` (nur wenn derselbe Lauf noch spielt und nur vorwärts).
     Fehler zählt `tickErrors()`; Test-Hook `__failTrack(i)` wirft in Spur i.
   - `logErr`: derselbe Fehler (Meldung + erste Stack-Zeile) höchstens einmal je 5 s, verschiedene Fehler je für sich.
2. **K-02 Gate-/Raum-Faltung ohne Abriss.** Jeder Rückweg (Raum, Gate) hat einen Eingangs-Gain, den nur die Blende
   automatisiert. Neue Raumantwort → **frische** `ConvolverNode`; der **Eingang** wandert in 40 ms gleichleistungsgemäß
   hinüber (`setValueCurveAtTime`, cos/sin, 32 Punkte; Rückfall `setTargetAtTime`). Die alte Faltung klingt mit dem, was
   sie schon hat, aus und wird nach ihrer Fahne getrennt. Ein Wechsel während einer laufenden Blende wartet auf deren Ende
   (nur der neueste gilt). `K.setGate` (Gate-Länge), `K.setRoom` (Raum-IR).
3. **K-03** `LAYER_LVL.fm = [['fmI', 2]]`: die FM-LED schaltet nur `fmI` (Gedächtnis `fmI0`), Osz. 2 gehört zu TON.
4. **K-04** `pageDrumSound` lässt Standard-Regler weg, deren Schlüssel schon ein Makro ist; jeder Regler trägt `data-key`.
5. **K-05 Loop-Klammer / Längengriff (PianoRoll).**
   - Beim Anfassen des Griffs ┃ friert die Ansicht ein (`ppb0`, `x00`, `V.freeze`): `len = clamp(len0 + round(dx/(4·ppb0)), 1, 16)`;
     `clampView` und das Mitlaufen des Abspielkopfs ruhen während der Geste; `viewState().follow` = `'hold'`.
   - Randzone ≤ 24 px: die Ansicht läuft mit ≤ 1 Takt/s mit, nur in Fingerrichtung.
   - Hinter dem Clip-Ende immer ≥ 1 Takt Platz (`ppb ≥ W/(L+4)`, `x0 ≤ L+4−W/ppb`); ⤢ lässt rechts 12 % Rand.
   - Der gelbe Knopf heißt „Zuschneiden“ (Undo-Text ebenso).
6. **K-06 versteckte Noten.** Beim Loslassen des Griffs (kürzer): Noten mit `t ≥ len·4` weg, Noten über das Ende enden dort
   (`trimToLen`, ein Undo mit der Länge). Dieselbe Regel für [Takte −] (`setLen`). Abwehr: `scheduleTrack`,
   `scheduleDrums`, `buildMidi`, `buildMidiSong` und die Tonart-Erkennung (`liveNotes` in `scenePartsOf`/`applySceneKeys`)
   ignorieren Noten mit `t ≥ len·4`.
7. **K-07 FANG über Akkordwechsel.** `CAP.open` merkt je Note den Träger beim Anschlag (`en`, `tm`) wie REC;
   `capturePhrase` reicht ihn durch; `capture()` rechnet jede Note mit **ihrem** Träger zurück, der Clip-Bezug kommt vom
   Träger der ersten Note (`keyForRecording`).
8. **K-08 Träger-Anzeige.** `shownShift`: Zahl aus der echten Abbildung (`ref = sceneRefKey()`, `n = 60 + ref.root`,
   `T.mapEvent(n…) − n`, TONART rastet an `ref`), dazu die Zieltonart im neuen Feld `#carTgt`: „+3 · → C-Dur“.
   `carrierShown()` (§16) liefert `{shift, target, text}`. Passt „· → C-Dur“ nicht neben die Zahl (P2/P3), steht dort
   „→ C“ (Kurzname, einmal je Text/Breite gemessen).
9. **K-09** `shownClipKey`: Editor-Kopf und Clip-Blatt zeigen bei gelatchtem Träger die erkannte Tonart (Szene/Clip), auch
   solange die gespeicherte Auto-Tonart auf ORIGINAL wartet (`R.keyPending`).
10. **K-10** `sceneRefKey`: leere oder reine Drum-Szene → zuletzt gehörte Szenen-Tonart (`HEARD`), sonst Projekt-Tonart.
11. **K-12** LFO-Tab-Chips: Schraffur nach `routeActive` (wie MOD-Tab).
12. **K-13** Texte: AKKORD „… (Prinzip OP-Z/OP-XY).“, TONART ohne „(wie OP-XY Brain)“, PARALLEL „(Halbtöne wie ein
    CV-Keyboard)“, OB-Brass „Oberheim OB-X/OB-Xa („Jump“, Quellen uneinig)“.
13. **K-14** CPU-Begrenzer ab Stufe 1 sichtbar: „CPU 1“ … „CPU 3“ (P: statt „Takt“, einzeilig; L/W: Chip `#bCpu` mit
    Stufe im aria-label).
14. **K-15** `routeIdle`: grauer Hinweis „wirkt erst mit …“ in der MOD-Zeile (anstelle des Bereichs, P bis 2 bzw. bei
    ≤ 360 px 3 Zeilen; Zeile gedimmt) und im Regler-LCD (statt des Bereichs; Ring grau): PW ohne Puls-Welle,
    Osz.-2-Tonhöhe ohne Anteil Osz. 2, Uni-Verstimm. ohne Unison, Filter-Ziele beim nativen FM-Filter-Bypass. Dazu nach §2.4
    (K11) der Regler FILTER-ANSCHLAG grau mit „wirkt nur mit Filter-Hüllkurve“, solange Hüllk.-Menge 0 ist (`o.idle` in
    `makeCtl`, bleibt bedienbar).
15. **K-16** Song-Träger-Chips: `songChipName` — Akkord = Akkordname, Einzelton = Name der gehörten Stufenleiter („Am“).
16. **K-17 nativer Rückfall.** Alle nativen Stimmen verlassen die Stimme mit dem Pan-Gesetz des Worklets (√2 in den
    StereoPanner = Mitte 1) und 5-Hz-DC-Blocker (VA/WT/FM2 wie WP7 für FM6). Für V0a-19 zusätzlich am VA-Rückfall
    (Messung je Merkmal mit `v3-v0a-natfeat.mjs`, Δ nativ − Worklet):
    - Wellenpegel: Browser-Säge/Rechteck sind auf Spitze 1 normiert (Gibbs 1,179 → −1,43 dB) → ×1,179; die Puls-Tabelle
      ohne Normierung (`disableNormalization`, schmale Pulse waren bis −5,8 dB); Rauschen ×0,4 wie im Worklet (+2 dB).
    - Unison wie im Worklet: die Stimmen eines Oszillators zusammen 1,4× (+2,9 dB), auch wenn nativ weniger Stimmen klingen.
    - Filter: Pegelkorrektur je Filtertyp über die Resonanz (`CALR`, Raster 2 Cutoff/Noten-Paare) und für Drive (`CALD` +
      cutoff-abhängig `CALDX`); Pfeifen (res > 0,9) mit eigener Pegeltabelle (`WHR`) und über res 1 mit Anschwingzeit
      (≈ 110 ms bei 1,02 wie die Selbstoszillation der Leiter). Nur für Engines mit Worklet-Zwilling (VA, FM6); WT/FM2
      behalten ihre v2-Pegel.
    - Hüllkurven-Form des Worklets (envCoefs: Ziel über das Stufenende hinaus, Anker am Ende, `aCurve`/`fCurve`) für VA
      statt τ = Zeit/3: Zupf-Sounds klangen nativ 1,7× länger aus (+2…+4 dB).
    - Startphasen: das Worklet startet jeden Oszillator/jede Unison-Stimme mit Zufallsphase; nativ jetzt ebenso (der
      Oszillator startet bis zu einer Periode vor der Note bei geschlossenem VCA). Gleichphasige Unison-Zupfer waren +2…3 dB.
17. **N0a `deliverNow` nach EN-12.** Viewer: `webm` → `.webm`, `m4a` → `.mp4` direkt; `mid`/`syx` → `.zip` (store-only)
    mit der Datei darin; JSON/TXT direkt. Toasts „Audio gespeichert“, „MIDI gespeichert (ZIP)“, „DX7-Bank gespeichert
    (ZIP)“. `rejected_extension`/`extension_not_enabled` → genau ein `save`, Toast „Dieses Format ist hier nicht verfügbar –
    App in Safari öffnen“, kein Ersatzformat. Safari-Weg: `syx` als `application/octet-stream`. Ohne Rahmen mit
    `use() → null` Safari-Weg (Teilen / `<a download>`); „Export hier nicht verfügbar“ nur im Rahmen.
18. **API (§16):** `tickErrors()`, `__failTrack(i)`, `viewState(kind)` (ROLLE/Melodie-Rolle: `x0`, `ppb`, `follow`
    `'on'|'hold'`, `reason`; LAUF/SCHRITTE: Seite), `carrierShown()`, `deliverNow(base, bytes, kind, label)`. Version 3.1.0.
19. **Hilfe** (Menü): vier Zeilen (Längengriff, Träger-Anzeige, grauer „wirkt erst mit“-Hinweis, CPU 1–3).

### Abweichungen (mit Grund)

- **K-02:** statt zweier fester Faltungen A/B eine frische `ConvolverNode` je Wechsel (die alte wird nach ihrer Fahne
  getrennt). Grund: eine „ruhende“ Faltung kann bei schnellen Wechseln noch klingen; so wird nie eine klingende Faltung neu
  beladen. Blende und Ergebnis wie verlangt. Der Raum-Hall ist in dieser App eine gemeinsame IR für alle Kits (Kits
  unterscheiden sich nur im Rückweg-Pegel, τ 20 ms) – ein Kit-Wechsel tauscht keine IR; `K.setRoom` steht mit derselben
  Blende bereit.
- **K-08:** die Zieltonart zeigt die Tonart, auf die die Musik abgebildet wird – bei G-Dur über a-Moll „G Mixolyd.“
  (V0a-10 prüft nur „−2“).
- **K-11** war in v2-final schon behoben (S&H FREI zieht je Phasenumbruch neu); nur gemessen (V0a-13).
- **N0a-05** (Seite ohne Rahmen) funktionierte in v2-final bereits (Bedingung `framed`); jetzt getestet.
- **K-06** auch für [Takte −] (`setLen` kürzte Noten nur auf `d ≤ nl`, nicht auf das Ende).
- **K-17 / WT:** das Pan-Gesetz gilt wie verlangt auch für WT (nur nativ): WT-Sounds mit Streuung sind jetzt 3 dB lauter
  (Werks-WT: −33,9/−36,9/−27,0/−25,9 → −31,2/−33,8/−23,9/−22,9 dB; VA-Ziel ≈ −24 dB). Die übrige V0a-19-Kalibrierung
  (Wellenpegel, Filter, Hüllkurven, Phasen) gilt nur für VA/FM6, WT/FM2 klingen sonst wie in v2.
- **V0a-19 Messung:** RMS = Leistung über beide Kanäle (Stereo-Rekorder; die L+R-Mittelung der WP3-Hilfe macht breites
  Worklet-Unisono bis 3 dB leiser), Mittel aus 3 Phrasen je Weg (Zufallsphasen).
- **logErr**: Schlüssel „Meldung + erste Stack-Zeile“ (derselbe Fehler aus 25-ms-Takt = einer).

### Messwerte der Checkliste

Vorher = v2-final (`v0a-work/base.html`, `SQ_FILE`), nachher = 3.1.0; Ausgaben in `v0a-work/repro/` und
`dirigent-test/v3-v0a-reg/final1|final2/`.

| ID | Test | Messwert nachher (vorher) |
|---|---|---|
| V0a-01 | `v3-v0a-fix.mjs` | Clap-Pegel 0: Noten je Spur in 2 Takten Bass 16 · Arpeggio 32 · Synth 3 7 · Drums 12 = wie bei 0,85 (vorher 34/50/7/22, 18/18/12 Doppelte, `RangeError` je Schlag, Pad-Tipp warf); `tickErrors()` 0; 0 Konsolenfehler |
| V0a-02 | `v3-v0a-fix.mjs` | `__failTrack(1)`, 4 Takte: Spur 0/2/4 planen 32/14/56 Noten = ohne Fehler, keine Doppelten; `tickErrors()` 324 (ohne Fehler 0); `schedBeat` monoton. Der Fehler erreicht die Konsole 2× in 8 s (`logErr` 5 s) |
| V0a-03 | `v3-v0a-drum.mjs` | Snare Gate 1, Gate-Länge 0,34 → 0,5 s in der Fahne: offline (geseedet) Fahne im 50-ms-Fenster −22,7 dB wie ohne Wechsel (Mehrabfall 0,00 dB; vorher 7,80 dB), M-KLICK schlechtestes Fenster +3,15 dB (≤ 6); in der App (Echtzeit) Mehrabfall 0,51 dB (vorher 11,87 dB), M-KLICK +2,84 dB |
| V0a-04 | `v3-v0a-drum.mjs` | Kit-Wechsel in einer Raum-Fahne: M-KLICK +3,16 dB; Kit-Wechsel mit neuer Gate-Länge in einer Gate-Fahne: +2,72 dB. Risiko „zwei Faltungen“: DR7 mit 4 Blenden 5,5 % eines Kerns (ohne Blende 5,45 %) ≤ 7 % |
| V0a-05 | `v3-v0a-drum.mjs` | Rom-Pop-Kick: LED aus bei `fmI 0`/`o2 .45`; Tipp → `fmI 2`, `o2 .45`, LED an; Tipp → `fmI 0`, `o2 .45` (vorher LED an bei 0, Tipp setzte `o2` 0) |
| V0a-06 | `v3-v0a-drum.mjs` | SOUND Snare/Clap/Tom L/M/H: je 9 Regler, jeder `data-key` einmal (vorher 10 mit doppeltem Gate/Raum) |
| V0a-07 | `v3-v0a-roll.mjs` P + L | Standard-Zoom, 4-Takt-Clip, CDP-Touch: Griff 1 Takt links (10 Moves) → `len 3`, zurück → `len 4`, Längenfolge nur 4/3; `viewState().x0` konstant, `follow 'hold'` (vorher 4→1 Takt, x0 12,8 → 1). ≥ 1 Takt Platz hinter dem Ende (4,00 Schläge), Randzone 4,04 Schläge/s (≤ 4 + Messtoleranz; Clip 4 → 6), ⤢ Ende bei 88,0 %, Knopf „Zuschneiden“ |
| V0a-08 | `v3-v0a-roll.mjs` P + L | 4 → 1 Takt per Griff: keine Note mit `t ≥ 4`, 3,75/d 1 → d 0,25; ein Undo-Schritt; 8 Durchläufe je genau 0 · 1,5 · 3,75 im `noteLog` (vorher stapelten sich die Noten ab Durchlauf 2) |
| V0a-09 | `v3-v0a-fix.mjs` | FANG über Am/F: nächster Durchlauf 72/76 unter Am, 72/77 unter F (vorher 76/79) |
| V0a-10 | `v3-v0a-fix.mjs` | a-Moll-Clip, AKKORD: C-Dur „+3 · → C-Dur“, a-Moll „±0 · → a-Moll“, G-Dur „−2 · → G Mixolyd.“ (`carrierShown()` und DOM; vorher ±0 / −3 / −5) |
| V0a-11 | `v3-v0a-fix.mjs` | Editor-Kopf unter gelatchtem Träger „a-Moll · 1 Takt“ (vorher „C-Dur“) |
| V0a-12 | `v3-v0a-fix.mjs` | leere Szene 3 nach der a-Moll-Szene: „a-Moll“ (vorher „C-Dur“) |
| V0a-13 | `v3-v0a-fix.mjs` | S&H FREI 8 Hz → Cutoff, 2 s: Worklet 17 Stufen / 3,38 Okt., nativ 23 / 3,56 Okt. (≥ 10 / ≥ ⅓; schon in v2-final erfüllt: 18 / 21) |
| V0a-14 | `v3-v0a-fix.mjs` | LFO-Chips o2pitch/cutoff/res bei laufendem Worklet ohne Schraffur (vorher o2pitch, res schraffiert) |
| V0a-15 | `v3-v0a-fix.mjs` | Texte AKKORD/TONART/PARALLEL/OB-Brass wörtlich nach K-13 |
| V0a-16 | `v3-v0a-fix.mjs` | `cpuInject(.5/.65/.8)` → P „CPU 1“/„CPU 2“/„CPU 3“ statt „Takt“, L Chip ebenso (vorher erst Stufe 3 „CPU“) |
| V0a-17 | `v3-v0a-fix.mjs` | `lfo1→pw` bei Säge: „wirkt erst mit Puls-Welle“; nach Wechsel auf Puls weg |
| V0a-18 | `v3-v0a-fix.mjs` | Song-Träger-Chips: Einzelton A in C → „Am“, Akkord Am → „Am“ |
| V0a-19 | `v3-v0a-native.mjs` (Mittel aus 3 Phrasen je Weg, Stereo-Leistung) | **25 von 30** Werks-VA-Sounds innerhalb ±1 dB, Median Δ −0,03 dB (vorher **3 von 30**, Median −2,81, Spanne −18,5 … +10,6 dB). Außerhalb: Nass & Quietsch +6,0, Tropfen −3,0, Pfeif-Lead +1,5, Gummi-Bass −1,2, Moog-Bass −1,2 dB — siehe Lücken. Nur mit nativ spielbaren Routen (`ROUTES=native`): ebenfalls 25/30 |
| V0a-20 | `v3-v0a-reg.sh`, DoD | siehe unten |
| N0a-01…05 | `v3-v0a-n0a.mjs` | 18/18 (vorher 9/17): Audio direkt `.mp4` (Rekorder `audio/mp4`) bzw. `.webm`, Toast „Audio gespeichert“; MIDI `.zip` mit `.mid`; `extension_not_enabled`/`rejected_extension` → genau ein `save`, Format-Toast; `.syx` im ZIP bzw. Safari `application/octet-stream`; JSON direkt, Prüfsumme gültig, `appVersion 3.1.0`; ohne Rahmen Download/Teilen, im iframe „Export hier nicht verfügbar“ |

**Regression (§1.3):** `v3-v0a-reg.sh 3` (`final1`, 95 Läufe + Smoke) und die Wiederholung der betroffenen Läufe nach den
Layout-Korrekturen einzeln (`final2`). Wie v2-final scheitern weiter nur: `wp3-adapt-func-build` C2/D5 (auch
`?engine=native`), `wp3-ui` 2 (Schraffur-Prüfung `lfo1→pw`, MO49), `wp7-adapt-wp3-browser` PR2 (3). Unter Last (3 Jobs)
einmalig: PR1 Moroder-Puls −40,8 dB (Schwelle −40, einzeln 40/40), DR7 7,45 % (einzeln 5,5 %), SG6 Melodie 11 ms
(einzeln 27/27), `v3-v0a-adapt-wp6-extras` L einmal Zeitüberschreitung (AudioContext stand, einzeln 20/20).
Angepasst (Begründung im Kopf der Datei): `v3-v0a-adapt-wp1-brand`, `-wp1-misc`, `-wp1-store`, `-wp3-api`, `-wp3-store`
(Version 3.1.0, Nachtrag C.4), `-wp2-keys` (K-13-Texte), `-wp2-roll` („Zuschneiden“, K-05), `-wp4-engine` („CPU 3“,
K-14), `-wp6-extras` (Audio direkt statt ZIP, EN-12).

**DoD:** `v3-v0a-dod.mjs` 60 s Demo mit V0a-Aktionen in D, P1, L1 (Touch): 0 Konsolenfehler, `tickErrors()` 0, Stimmen
≤ 18 und 3,5 s nach Stopp 0 — mit Worklet und mit `?engine=native` (je 10/10). M-PLATZ (`v3-v0a-shots.mjs`, P1 P2 P3
L1 L2 W): Hauptansicht mit Träger-Anzeige und CPU 2, Rolle mit „Zuschneiden“, MOD mit grauem Hinweis, FILTER mit grauem
Anschlag, Drum-SOUND Snare — 54/54. Worklet-ASCII-Prüfung besteht (68 746 B). PE1 (`v3-pe1.mjs`, 10 s Demo, Editor offen):
P Synth 60 fps, keine Long Task > 50 ms, tick p95 0,8 ms (max 2,3); L 60 fps / 0,8 ms; P Rolle 60 fps / 0,8 ms. Start
(`v3-startup.mjs`, Median aus 5 Kaltstarts): 360 ms (v2-final 329, +31 ms), CPU ×4 1480 ms (1370, +110 ms) — Grenzen
1,5 s / 4 s / +150 ms. Smoke-Test: Titel SYNQUENZER, keine Fehler. Datei 1,25 MB ≤ 3,0 MB, +26,2 KB.

### iPhone-Prüfpunkte (Xander)

1. **Logo** „One Day in Rome“ in Kopfleiste und Menü: sind die Konturen glatt oder wellig (§2.4)?
2. **Drums:** Kit Rom Pop, Snare mit Gate 1 laufen lassen, im Kit die Gate-Länge ziehen und loslassen, dann Kit wechseln
   (Rom Pop ↔ Gated 84): die Hall-Fahne darf nicht abreißen und nicht knacken.
3. **Clip-Editor:** den hellen Griff ┃ am Ende des Lineals einen Takt nach links und zurück ziehen (auch am Bildrand): die
   Länge ändert sich um genau einen Takt, die Ansicht steht still; gekürzte Noten sind weg, ↶ holt sie zurück.
4. **Träger:** a-Moll-Clip, AKKORD, auf der Tastatur C halten: Anzeige „C +3 · → C-Dur“ (iPhone SE: „→ C“) und es klingt
   drei Halbtöne höher; der Editor-Kopf zeigt „a-Moll“.
5. **Export in der Claude-App:** MIDI → `.zip` mit `.mid`; „Song als Audio“ → `.mp4` direkt. Dieselben Exporte in Safari
   (Teilen-Blatt bzw. Download).

### Bekannte Lücken

- Kein WebKit-/iPhone-Test (nur Chromium erlaubt).
- **V0a-19 nicht ganz erfüllt (25/30).** Ursachen der Reste: (a) Routen außerhalb der nativen Teilmenge (§v2-9.5: nur LFO →
  Tonhöhe/Cutoff/Lautstärke/Pan): Nass & Quietsch `lfo1→res`, Tropfen `menv→pitch`, Moog-Bass `vel→cutoff` — das Worklet
  spielt diese Bewegung, der Rückfall nicht (Anzeige „nur mit Worklet“, unverändert). (b) Die Biquad-Nachbildung kann die
  nichtlineare Leiter nahe der Selbstoszillation nicht genau treffen: Nass & Quietsch (LP24 res .97, Cutoff G6 = 24.
  Teilton von C2 → der lineare Biquad hebt ihn +28 dB, die Leiter sättigt; auch ohne Route +7 dB), Tropfen (BP24 res .99),
  Pfeif-Lead (+1,5 dB, Anschwingen), Gummi-Bass (LP12 res .6 bei 180 Hz: Spitzenform; je nach Ton −3,4 … +3,7 dB, im Mittel
  −1,2). Eine nativ nachgebildete Notenkonstante (Anschlag/Taste/Zufall → Cutoff/Res/Hüllk.) oder ein Sättigungsmodell
  wären eigene Arbeit (widerspricht heute §v2-9.5 und den alten MO49-Tests).
- Die Filter-Pegelkorrektur ist an zwei Cutoff/Noten-Paaren (110 Hz/600 Hz, 262 Hz/2 kHz, Säge) gemessen; einzelne
  Paarungen von Teilton und Resonanz weichen bis ±1,5 dB ab (res ≥ .9). HP24/HP12 nur so kalibriert (kein Werks-VA nutzt HP).
- Messrauschen: Sounds mit Zufallsphasen (Unison, Drift) schwanken je Phrase um ±1,5 dB (Kristall-Fläche); deshalb 3 Phrasen.
- Die Knöpfe der Rollen-Aktionsleiste („Zuschneiden“ usw.) behalten ihre v2-Größe (P1/W 36, P2 34, P3 32, L 30 px hoch);
  L4 verlangt quer ≥ 36 px — nicht Teil von V0a.
- P3 (320 px): neben „CPU n“ wird der vierte Schlag-Punkt im TAKT-Feld leicht angeschnitten.
- Die Raum-IR ist eine für alle Kits; ein Kit mit eigener IR (V1c) nutzt `K.setRoom` (gleiche Blende), ungetestet mit
  echter zweiter IR.

---

## V0b — Schnell-UX (+ N0b Bibliothek „aktive Engine zuerst“, taktbündiges FOLGEN) · App 3.2.0

App: `dirigent-wt/index.html` (1 367 501 B = 1,30 MB; V0a-fix 1 316 464 B → **+49,8 KB**, Budget V0b 40 + N0b 10 KB,
Nachtrag C.4), Snapshot `synq-snapshots/V0b.html`. Spec: `v3-ideen/dirigent-spec-v3.md` §2.2 U-01…U-07, §5.1, §12.1,
§12.7, Anhang A.2, K-15-Zusatz (§2.1), §16, §17 V0b; Nachtrag 1 A.2 (N0b), EN-04, EN-07, EN-18, M-SEITE, Teil D, C.4.
Arbeitsdateien: `v0b-work/` (`base.html` = V0a-fix für Vorher-Messungen, `repro/` Befunde vorher, `acc/` Ausgaben der
einzelnen Abnahme- und DoD-Läufe, `shots/`, `heads/`, `dbg-steps/` Bildschirmfotos). Tests in `dirigent-test/`:
`v3-v0b-browser.mjs` (V0b-01…03, N0b-01…05), `v3-v0b-follow.mjs` (V0b-04…07, N0b-06…08), `v3-v0b-ux.mjs` (V0b-08…15),
`v3-v0b-gegen.mjs` (Gegenprobe N0b-07), `v3-v0b-init.mjs` (INIT-Lautheit), `v3-v0b-shots.mjs` (M-PLATZ mit echten Schriften),
`v3-v0b-heads.mjs` (Kopf-Geometrie), `v3-v0b-dod.mjs`, `v3-v0b-lib.mjs` (BS.1770-Lautheit im Browser, Worklet-Bereitschaft),
`v3-pe1.mjs` (jetzt auch `lauf`/`steps`), die Anpassungen `v3-v0b-adapt-*.mjs`, der Lauf `v3-v0b-reg.sh` (Ausgabe
`dirigent-test/v3-v0b-reg/<OUT>`) und `v3-v0b-post.sh` (Abnahme und DoD nacheinander → `v0b-work/acc/`).

### Gebaut

1. **U-01 Bibliothek: Tipp = laden, stumm** (§12.1). `brTap` → `brLoad`: lädt über `soundEdit` (ein Undo-Schritt), es
   erklingt nichts; Toast „‚Name‘ geladen“ mit [▶ Hören] [Rückgängig] (im Browser als Band über der Liste). ▶ links in der
   Zeile (44×48 P, 44×44 L) hört vor und wird ■; höchstens ein Vorhören; Stopp mit ■, ▶ eines anderen Sounds, Schließen,
   Tastendruck (20 ms Ausblendung wie bisher). Lädt man den gerade vorgehörten Sound, läuft das Vorhören weiter (es spielt
   über seine eigene Kette). Gilt ebenso für Kits. Die eigene Vorhör-Kette blendet beim Abbau jetzt aus (τ 6 ms, getrennt
   nach 60 ms) — vorher konnte das Trennen eines Rests 100 ms nach ■ ein kleines Knacken geben (M-KLICK +7 dB unter Last).
2. **EN-04 / EN-18 (N0b 1–2): aktive Engine zuerst.** Kopf „SOUNDS · SYNTH 2 · FM“; erste Chip-Zeile [FM ▾ │ Alle Engines]
   (bleibt beim Wischen stehen), dahinter die Rollen der Engine: „Alle FM“ · Bass · Sequenz · Lead · Akkord · Fläche · Keys ·
   Atmo · Effekt · Glocke (nur FM) · Init · Eigene — ein Rollen-Chip nur, wenn die gezeigte Engine Sounds dieser Rolle hat.
   Rollen: FM nach der Phrasen-Art (Tabelle N0b), VA/WT nach ihrer Kategorie (§12.2-Abbildung, Plucks und WT je Sound;
   „Tropfen“ = Effekt). [Alle Engines]: alle Sounds, die aktive Engine zuerst, jede Zeile mit VA/FM/WT; ein Sound einer
   anderen Engine lädt nur von dort (Toast „‚Moog-Bass‘ geladen · wechselt zu VA“, [Rückgängig]). [FM ▾] ein zweites Mal →
   „Andere Engine ansehen“ (VA/FM/WT, Laden wechselt die Engine). ‹ › im Editor-Kopf lädt den nächsten Sound der gezeigten
   Liste (Engine + Rollen-Chip), im Kreis, ohne Vorhören. Drum-Spur: Kits · Eigene Kits · Init. API `browserTap`,
   `browserPreview`, `browserScope`, `browserRows`.
3. **U-02 FOLGEN** (§5.1, EN-07, M-SEITE) in ROLLE, LAUF, Drum-SCHRITTE, Melodie-Rolle und Song-Ansicht (`folStep`): die
   Ansicht zeigt im Zustand FOLGT die Seite mit der Abspielmarke; Seitenbreite = sichtbare Schläge auf ganze Takte abgerundet
   (≥ 1 Takt; < 1 Takt sichtbar: ganze Schläge), `x0 = floor(beat / Breite) · Breite`. Gewechselt wird, wenn die (hörbare)
   Marke in die nächste Seite läuft — am Taktstrich —, sofort nur auf Wunsch (Öffnen, ▶, Tipp auf den Chip).
   HÄLT bei (a) Finger (Raster, Lineal, Tasten, VEL-Spur, Schritt-Raster, Song-Raster), (b) markierten Noten/Takten oder
   offenem Popover/Quantisier-Blatt, (c) Werkzeug ⬚/⌫/Schritt, (d) Bearbeitung < 3 s, (e) „von Hand“ (Zoom, Lineal-Schieben,
   ⤢, Seite/Takt gewählt, Song gewischt) — (e) endet nur mit Tipp auf den Chip, Schließen des Editors oder Neustart des
   Transports. Kopf-Chip [⟶ FOLGT] grün / [⏸ HÄLT · Grund] amber / [⟶ AUS] grau (Tipp: FOLGT → AUS, sonst → FOLGT und Sprung
   zur Marke); AUS je Editor-Art in `S.ui.follow` (nur `false`-Einträge; die Melodie-Rolle teilt den Schalter der ROLLE).
   Lauf-Punkt: ROLLE im Lineal auf dem Takt-Chip des laufenden Takts (ruhig, wenn die Marke sichtbar ist, sonst blinkend;
   außerhalb „◂ 3“/„3 ▸“ am Rand), LAUF/SCHRITTE auf dem Seiten-Chip (blinkt, wenn eine andere Seite gezeigt wird; Ein-Knopf-
   Blätterer „▸ n“), Song-Ansicht Randmarke. Die 85-%-Regel und der Sprung bei `x < 0` in `PianoRoll.playhead` sind weg
   (`api.showPage`, `api.fol`, `opts.onHand`). LAUF und SCHRITTE wechseln die Seite ohne Neuaufbau (`laufSetPage`,
   `drumSetPage`; `stepModel` liest die Seite live); Euklid merkt sich seinen Takt beim Öffnen. Song-Ansicht: der Chip
   [⏸ HÄLT · Grund] erscheint oben rechts nur, solange sie hält; `svAutoScroll` blättert ganze Seiten. Seitenwechsel ändern nie
   Auswahl, Werkzeug oder Undo. Kopf-Layout: Titel über der Info-Zeile (P bei Bedarf, L immer), damit der Chip Platz hat.
   API `viewState(kind)` (+ `'song'`, `pw`, `run`), `setFollow(kind, on)`.
4. **U-03 Pad wählt Instrument.** `padSelect` nach `padHit` (nur Pad-Tipps, nicht Tasten/MIDI): bei offenem Drum-Editor zeigt
   SOUND/TIEF das Instrument, SCHRITTE seine Zeile; nicht während ● (auch Einzählen), ● SONG oder ● MEL. aufnimmt und nicht,
   wenn der letzte Tipp auf ein anderes Pad < 300 ms zurückliegt. KIT-Schalter „Pad wählt Instrument“ (Projekt-Einstellung
   `settings.padSel`, Standard an, ein Undo-Schritt `kind:'set'`).
5. **U-04 Benennung.** OSZ › MIX-Gruppe „ANTEIL“, Mod-Ziele „Anteil Osz n“, „KLANG-PEGEL“, FX › SPUR „LAUTSTÄRKE“ mit dB
   (`80 % · −3,9 dB`, `20·log10(vol²/(1 + 1,5·drive))`), Drum „PAD-PEGEL“, TIEF „ANTEIL“, KIT „GATE-RÜCKWEG“/„RAUM-RÜCKWEG“,
   Menü „MASTER-AUSGANG“, Seite „LAUTST.-HÜLLK.“, „Gehaltene Töne bei Akkordwechsel: mitziehen / halten“, Harmonie-Modus
   „HALBTON“ (auch „Einzelton: Halbton (CV)“). Band „GLOBAL · wirkt auf alle Spuren“ (24 px, P ≤ 600 px hoch 20 px) über
   HALL/ECHO/MASTER im Synth- und Drum-Editor.
6. **U-05 Init und Neu.** Menü → Projekt → [Neu ▾] → [Mit Startsounds] │ [Leer (Init)] (`newProject({init:true})`: INIT
   Analog ×4, INIT Drums, keine Clips, kein Song, 120 BPM, C-Dur, Sends 0). INIT-Sounds (Anhang A.2) als Bibliotheks-Rolle
   „Init“: INIT Analog / INIT FM / INIT Tabelle auf −18,0 LUFS kalibriert (Lead-Phrase, trockener Stimmausgang), INIT Drums
   (ev2). Projektnamen „Projekt · Sa 17.10. 15:50“ (dieselbe Minute: „(2)“), Sichern ohne Namen „BASS 17.10. 15:52“ (Rolle
   bzw. KIT/SOUND + Zeit). Verlauf je Projekt `hist:<id>:<ts>` (alte globale Einträge bleiben lesbar und erscheinen bei
   ihrem Projekt). Editor-Kopf ⋯ → [Init] (Synth: INIT der Engine; Drums: INIT Drums; ein Undo, Toast [Rückgängig]); ⋯ sitzt
   in P auf der LCD-Zeile, in P3 in Kopfzeile 2 (dort mit ◎), in L in Kopfzeile 1. API `initSound(t)`.
7. **U-06 Tastatur-Anschlag** (E15/E3-29). Menü → Bedienung → „Tastatur-Anschlag: POSITION │ FEST (0,8)“ (`settings.kbVel`,
   Standard POSITION, ein Undo-Schritt). POSITION: 0,45 an der Oberkante der eigenen Taste … 1,0 an ihrer Unterkante (weiße
   Taste 0…h, schwarze 0…0,62·h), auch beim Gleiten auf eine andere Taste. Computer-Tastatur 0,8, MIDI eigene Velocity.
   **K-15-Zusatz:** bei FEST tragen FILTER-ANSCHLAG, Anschlag → Lautstärke, die FM-Operator-Anschläge und Routen mit Quelle
   Anschlag den grauen Hinweis „Tastatur spielt fest 0,8 – wirkt bei Noten mit eigener VEL oder mit Anschlag POSITION“ (Regler:
   grau + LCD-Zeile mit [POSITION ▸]; MOD-Zeile: Hinweis); Tipp darauf → POSITION (ein Undo); dazu ⋯ → [Anschlag POSITION].
8. **U-07 Hilfe:** neue/erneuerte Zeilen für Bibliothek, FOLGEN, Pad wählt Instrument, Namen/GLOBAL/HALBTON, Init/Neu/Verlauf,
   Tastatur-Anschlag.
9. Version **3.2.0** (Nachtrag C.4).
10. **Seiten-Blätterer der SCHRITTE** (Fehler seit WP6, für FOLGEN nötig): auf kurzen Hochformaten (P ≤ 700 px hoch) teilt
    der Blätterer seine Zeile mit [Euklid…] [Muster ▾] und lag bei 2–16 Takten unter ihnen (375×667: ‹ Takt 1/4 › ganz
    verdeckt, kein Takt wählbar; 320×568 und 667×375: › verdeckt). Jetzt misst er seinen Platz selbst (Container-Abfrage):
    unter 150 px [1][2] ohne Etikett bzw. nur [k/n] (öffnet das Takt-Raster), bis 210 px schmalere ‹ ›; die Info „Szene 1 ·
    n Takte“ entfällt dort; quer schrumpfen die Spur-Reiter (sie scrollen) statt des Blätterers. Kopf-Chip der SCHRITTE in
    P2 so hoch wie ✕ (40 px).
11. **Ansichtsfeld für `HIST.volatile` (M-REKON):** `S.ui.follow` (nur `false`-Einträge) liegt in `S.ui`, das als Ganzes auf
    der Startliste steht; `settings.padSel` und `settings.kbVel` sind Undo-Schritte (`kind:'set'`), keine Ansichtsfelder.
    V0b fügt keine Fähigkeit hinzu (Summe oben unverändert).

### Abweichungen (mit Grund)

- **HALBTON-Daten:** der frühere Modus PARALLEL heißt in den Daten dieser App `mode:'chromatic'` (nicht `'parallel'` wie in
  U-04/V0b-15 angenommen); er bleibt unverändert `'chromatic'`, nur das Etikett ist neu. Ebenso heißt die Einzelton-Wahl
  `'parallel'` jetzt „Halbton (CV)“ (Daten unverändert). V0b-15 prüft deshalb `'chromatic'`.
- **INIT Drums (ev2):** die WP6-`DEFAULTS` allein sind für jedes Modell stumm (alle Schichtpegel 0). Jedes Pad bekommt
  deshalb die Grundschicht seines Modells (Kick Ton + Pitch-Fall, Snare Ton + Rauschen, Clap Bursts, Hats/Becken Metall,
  Toms Ton in ihrer Lage …), sonst `DEFAULTS`; Pegel .85, Raum 0, Gate 0, Drive 0, keine Locks — so besteht „jedes Pad
  RMS > −40 dBFS“ (V0b-11). Geschlossene Hi-Hat `mLvl 1,4`, `mDec .08` (sonst −39,4 dBFS).
- **Projektnamen:** zwei neue Projekte in derselben Minute heißen „… 15:50“ und „… 15:50 (2)“ (sonst wären die drei Namen
  aus V0b-11 nicht verschieden). Sichern ohne Namen: Rolle des Sounds (BASS, LEAD …), bei Kits „KIT“, sonst „SOUND“.
- **FOLGEN:**
  - Ist weniger als ein Takt sichtbar (starker Zoom), sind die Seiten ganze Schläge (M-SEITE verlangt „ganze Takte“, das
    ginge dann nicht ohne Überspringen); gewechselt wird weiter am Taktstrich oder an der Seitengrenze.
  - Ein offenes Popover (Notenwerte, Akkord-Auswahl im Song) und das Quantisier-Blatt zählen als (b) „Auswahl“.
  - Song-Ansicht: der Chip erscheint nur, solange sie hält (sonst wäre er dauernd über dem Raster); AUS gibt es dort nur
    über die API (`setFollow('song', false)`), nicht als Tipp.
  - Die Melodie-Rolle teilt den AUS-Schalter der ROLLE (eine Editor-Art „Rolle“).
  - Song-Ansicht: „Akkord-Auswahl offen“ = ihr Popover (→ „Auswahl“); eine markierte Zelle gibt es in der WP6-Song-Ansicht
    nicht (ein Tipp schaltet die Zelle sofort um → (d) „gerade bearbeitet“). LOCK-Modus und ● SCHRITT gibt es in der App
    noch nicht; ihre HÄLT-Gründe kommen mit V3c bzw. V5b/V5c.
- **K-15 FEST-Hinweis antippen:** am Regler zeigt die LCD-Zeile den Hinweis mit [POSITION ▸] (P1, P2, L); in P3 ist die
  LCD-Zeile ausgeblendet (P ≤ 600 px hoch, wie bisher), dort führen ⋯ → [Anschlag POSITION] und die MOD-Zeile zurück
  (am Regler nur grau).
- **‹ ›** laufen im Kreis durch die zuletzt gezeigte Liste dieser Spur (Engine + Rollen-Chip); war die Bibliothek für die
  Spur noch nicht offen, durch die Liste, mit der sie öffnen würde (Rolle des Sounds, sonst „Alle <Engine>“).
- **U-03** wählt auch während ● SONG und ● MEL. nicht (dort wird ebenfalls eingespielt).
- **U-06** gilt für die Bildschirmtastatur; die Computer-Tastatur spielt weiter 0,8, MIDI seine eigene Velocity.
- **Toast:** „‚Name‘ geladen“ / „Init“ docken wie jeder Toast mit Knöpfen (5 s) über der LCD-Zeile und decken ⋯ dort so
  lange ab (vorhandene Toast-Regel).
- **Editor-Kopf ROLLE/LAUF:** der FOLGEN-Chip braucht Platz — der Titel steht über der Info-Zeile (P bei Bedarf, L immer);
  P ≤ 360 px und L ≤ 759 px zeigen den Chip kompakt (kleinere Schrift, „bearbeitet“ statt „gerade bearbeitet“).
- **Bibliothek P ≤ 380 px:** im Kopf entfällt „SOUNDS ·“ (sonst würde ✕ abgeschnitten), ebenso bei sichtbarem A/B.
- **V0b-14** misst Ober-/Unterkante 5 px innerhalb der Taste (Chromiums Touch-Anpassung rückt Tipps genau auf der Kante
  auf die Nachbarfläche).
- **Song-Ansicht-Chip** [⏸ HÄLT · Grund] liegt oben rechts (64 × 32 px) über dem Lineal und dem oberen Rand der Zeile SYN 1,
  nur solange die Ansicht hält; ein Tipp darauf ist der Tipp auf den Chip (→ FOLGT).

### Messwerte der Checkliste

Vorher = V0a-fix (`v0b-work/base.html` = `synq-snapshots/V0a-fix.html`, `SQ_FILE`), nachher = 3.2.0; Ausgaben in
`v0b-work/acc/` (einzeln) und `dirigent-test/v3-v0b-reg/run2/`.

| ID | Test | Messwert nachher (vorher) |
|---|---|---|
| V0b-01 | `v3-v0b-browser.mjs` P + L | Tipp auf „Glas-EP“ (FM-Spur) lädt (`getSound`), Master-RMS 1 s lang −∞ dBFS, kein `noteLog`-Eintrag `preview`; Toast „‚Glas-EP‘ geladen“ mit [▶ Hören] (spielt) und [Rückgängig] (ein Undo → FM-Pluck) — vorher: Tipp auf „Äther“ lud und spielte sofort (5 Vorhör-Stimmen) |
| V0b-02 | `v3-v0b-browser.mjs` | ▶ links in der Zeile, 44×48 (P) / 44×44 (L); erster Ton 49,8 ms nach ▶ (+ 44 ms Ausgabe-Latenz) ≤ 150 ms; ▶ wird ■; ▶ an einem zweiten Sound beendet das erste Vorhören (eine Vorhör-Stimme); ■: −19,3 → −29,7 dBFS (mit Hallfahne), M-KLICK schlechtestes Fenster +4,0 dB einzeln, +3,8 dB in der Regression (vor der Ausblendung der Vorhör-Kette unter Last +7,0 dB); ein Tastendruck beendet |
| V0b-03 | `v3-v0b-browser.mjs` | Kit „909“: Tipp lädt still (−∞ dBFS), ▶ spielt (−18,1 dBFS) |
| V0b-04 | `v3-v0b-follow.mjs` | SCHRITTE, 2-Takt-Clip, 150 BPM: an jedem Taktstrich (Schlag 4/8/12/16) zeigt die Seite den Takt der Marke; 4 Seitenwechsel, alle am Taktstrich (in drei Läufen höchstens 0,038 Schläge = 15 ms danach; 1 Bild = 0,042); Lauflicht in Takt 2 in jedem Bild — vorher: Seite immer Takt 1, Lauflicht ab Schlag 4 aus |
| V0b-05 | `v3-v0b-follow.mjs` | LAUF ebenso: 4 Wechsel, höchstens 0,045 Schläge (18 ms) nach dem Taktstrich (drei Läufe); Lauflicht in Takt 2 — vorher Seite immer Takt 1 |
| V0b-06 | `v3-v0b-follow.mjs` | ROLLE, 4-Takt-Clip, 1 Takt sichtbar: x0 0/4/8/12, 8 Wechsel am Taktstrich (≤ 0,045 Schläge); Note gewählt → x0 über 2 Durchläufe gleich, Kopf „⏸ HÄLT · Auswahl“; nach dem Aufheben folgt sie an der nächsten Seitengrenze nach 3 s, am Taktstrich — vorher: Sprünge bei Schlag 3,57 / 6,47 / 9,59 (85-%-Regel), auch mit gewählter Note |
| V0b-06b | `v3-v0b-follow.mjs` | Zwei-Finger-Zoom (CDP) auf Takt 3: `reason 'hand'`, x0 6,16 über 2 Durchläufe (auch mit der Marke außerhalb), Kopf „⏸ HÄLT · von Hand“; Tipp → FOLGT und Sprung zur Marke; nach waagrechtem Schieben ebenso; nur ✎ gewählt, keine Geste: folgt (bei < 1 Takt Sicht Seiten zu 3 Schlägen) |
| V0b-06c | `v3-v0b-follow.mjs` | SCHRITTE und LAUF: Seite 2 von Hand bleibt über 3 Taktstriche stehen, der Lauf-Punkt wandert (laufender Takt 1 und 2 gesehen), Kopf „⏸ HÄLT · von Hand“; Schließen und Öffnen → FOLGT |
| V0b-07 | `v3-v0b-follow.mjs` | Tipp auf [⟶ FOLGT] → [⟶ AUS], die Ansicht steht, der Lauf-Punkt läuft durch die Takt-Chips 1–4; `S.ui.follow.roll = false` im Projekt; Tipp → FOLGT |
| V0b-08 | `v3-v0b-ux.mjs` | Pad SNARE bei KICK: SOUND, TIEF und SCHRITTE zeigen SNARE; Schalter aus → KICK bleibt; ein zweites Pad < 300 ms wählt nicht; während ● nicht; Schalter = ein Undo — vorher blieb `ED.dVoice` 0 |
| V0b-09 | `v3-v0b-ux.mjs` P + L | 69 Seiten (VA, FM, WT, Drum, FX, Menü, Bibliothek): kein Etikett „Pegel“; 14/14 Umbenennungen; LAUTSTÄRKE „80 % · −3,9 dB“ |
| V0b-10 | `v3-v0b-ux.mjs` P + L | HALL, ECHO, MASTER (Synth- und Drum-Editor) tragen das Band „GLOBAL · wirkt auf alle Spuren“, SPUR und CHORUS nicht |
| V0b-11 | `v3-v0b-ux.mjs`, `v3-v0b-init.mjs` | Leer (Init): 0 Clips, kein Song, 4× INIT Analog (C4 −24,9 dBFS), INIT Drums (Pads −34,4 … −20,3 dBFS, alle > −40; Pegel .85, Raum/Gate 0, keine Locks), 120 BPM, C-Dur, Sends 0; dreimal Neu → drei verschiedene Namen im Muster. Lautheit auf der Lead-Phrase (trocken): INIT Analog −18,01, INIT FM −18,00, INIT Tabelle −18,00 LUFS |
| V0b-12 | `v3-v0b-ux.mjs` | ⋯ → Init: INIT Analog / INIT FM (fm6) / INIT Tabelle (wt) / INIT Drums, Toast mit [Rückgängig]; ein ↶ stellt den alten Sound deep-equal her |
| V0b-13 | `v3-v0b-ux.mjs` | A und B mit je 3 Sicherungen: `history()` in A nur A-Einträge (≥ 3), in B dessen 3; „Ältere Versionen“ in A nur A; Schlüssel `hist:<id>:<ts>` |
| V0b-14 | `v3-v0b-ux.mjs` P + L | Standard POSITION (neues Projekt und Bestand ohne Einstellung). POSITION, Ober-/Unterkante (5 px innerhalb): weiß 0,461 / 0,989, schwarz 0,468 / 0,982 (P); 0,473 / 0,975 und 0,487 / 0,961 (L); FEST: jede Live-Note 0,8 |
| V0b-14b | `v3-v0b-ux.mjs` P + L | FEST: FILTER-ANSCHLAG grau, Cutoff-Ring mit nur der `vel`-Route grau, LCD „Tastatur spielt fest 0,8 …“; Tipp → POSITION (ein Undo, ↶ → FEST); Route Anschlag → Cutoff mit Hinweis, Tipp → POSITION, Hinweis weg, ein Undo |
| V0b-15 | `v3-v0b-ux.mjs` | Popup „HALBTON“; die Daten bleiben `'chromatic'` (s. Abweichungen) |
| V0b-16 | Regression, DoD, `v3-v0b-shots.mjs` | siehe unten |
| N0b-01 | `v3-v0b-browser.mjs` P + L | Kopf „SOUNDS · SYNTH 2 · FM“, [FM ▾ │ Alle Engines], erster Rollen-Chip „Alle FM“, Glocke und Bass vorhanden; für alle 9 Rollen-Chips jede Zeile `data-engine fm6`; VA-Spur nur analog, WT-Spur nur wt, Drum-Spur Kits |
| N0b-02 | `v3-v0b-browser.mjs` | Synth 1 → [FM]: Filter FM; „Bass“ = Pop-Bass DX, Solid-Bass, kein VA-Bass; Tipp auf die erste Zeile → `getSound(0).engine === 'fm6'` — vorher öffnete die Bibliothek in „Bass“ mit den VA-Bässen, › lief durch Sub-Bass, Acid 303 … (analog) |
| N0b-03 | `v3-v0b-browser.mjs` | 20 × › und 20 × ‹ auf der FM-Spur (Liste Marimba-Holz · Kalimba · FM-Pluck): nach jedem Schritt fm6, im Kreis vor und zurück |
| N0b-04 | `v3-v0b-browser.mjs` P + L | Alle Engines: 46 Werks-Zeilen, jede mit VA/FM/WT, FM zuerst; VA-Sound auf der FM-Spur → Toast „wechselt zu VA“ mit [Rückgängig] → FM-Sound deep-equal |
| N0b-05 | `v3-v0b-browser.mjs` | Filter- und Chip-Wechsel: −∞ dBFS, 0 Vorhör-Noten, kein Sound geändert |
| N0b-06 | `v3-v0b-follow.mjs` | ROLLE, 1 Takt sichtbar: jedes x0 ein Vielfaches von 4, 8 Wechsel ≤ 0,045 Schläge nach dem Taktstrich; 2 Takte sichtbar: x0 0 / 8, 4 Wechsel ≤ 0,045; Melodie-Rolle bei ▶ SONG, 112 BPM: x0 0 4 8 12 16, 4 Wechsel ≤ 0,034 |
| N0b-07 | `v3-v0b-follow.mjs`; Gegenprobe `v3-v0b-gegen.mjs` | 13 CDP-Tipps (gleiches x, je eine Reihe tiefer, 1 s Abstand): 13 Noten auf Schlag 1 in Takt 1, `viewState('mel').x0` unverändert — Gegenprobe am Ausgangsstand: 13 Noten auf 9 Schlägen in 7 Takten (1 · 4 · 7 · 10,25 … 25,25) |
| N0b-08 | `v3-v0b-follow.mjs` | 16-Takt-Song, 8 Takte sichtbar: FOLGT x0 ∈ {0, 8}; hält nach einer Änderung 3 s (dann folgt sie), bei offenem Popover und nach Wischen („von Hand“, Chip); Tipp → FOLGT und Sprung zur Seite der Marke |
| Blätterer | `v3-v0b-adapt-fixd-steps.mjs` | SCHRITTE in 390×844, 375×667, 320×568, 844×390, 667×375 mit 1/2/4/8/16 Takten: jeder Takt per Touch gewählt und bearbeitet, kein Blätterer-Knopf verdeckt, Körper ohne Überlauf — 117/117 (Ausgangsstand 17 Fehler: in 375×667 lag ‹ Takt 1/4 › unter Euklid… / Muster ▾, kein Takt wählbar; in 320×568 und 667×375 war › verdeckt) |

**Regression (§1.3):** `v3-v0b-reg.sh 3` (`run2`: 98 Läufe + Smoke, 3 084 PASS / 18 FAIL). Wie am
Ausgangsstand scheitern nur: `rgq-old17` 5 (C2/C3/E2, exit 0), `v3-v0b-adapt-wp3-browser` PR2 (3), `v3-v0b-adapt-wp3-ui` 2
(Schraffur `lfo1→pw`, MO49), `wp3-adapt-func-build` C2/D5 (auch `?engine=native`), `wp7-adapt-sqr6-persist` Slot-Rundreise
(Ausgangsstand einzeln ebenso), `wp7-accept` fm4 DX-Tines 10,7 dB bei 30 ms (Grenze 10; Ausgangsstand V0a-fix einzeln 2×
gleich 10,7, auch in der V0a-fix-Regression; V0a.html 2,5; in `run1` einmal 2,5) und `v3-v0b-adapt-v0a-fix` V0a-13 nativ
(Rekorder-Lücke `gaps`; einzeln 3 von 3 Läufen bestanden) und V0a-16 L (Abfrage 150 ms nach `cpuInject`; einzeln in 1 von
3 Läufen bestanden, am Ausgangsstand in 0 von 1). Nach den letzten Layout-Korrekturen (Blätterer, Kopf-Chip P2) einzeln wiederholt und
bestanden: `wp6-steps` P/L/L667/P375/P320, `wp6-drums` P/L, `v3-v0a-drum`, `v3-v0b-ux`, `v3-v0b-follow` (steps, lauf),
`v3-v0b-shots`, `v3-v0b-adapt-fixd-steps`. Angepasst (Begründung im Kopf der Datei): `v3-v0b-adapt-wp1-brand`, `-wp1-misc`,
`-wp3-api` (Version 3.2.0, C.4), `-wp1-store`, `-wp3-store`, `-sq5-confirm`, `-wp1-shield` ([Neu ▾] → [Mit Startsounds],
Projektname mit Zeit), `-n0a` (3.2.0, Dateiname), `-wp6-extras` (Audio-Dateiname nach dem Projektnamen), `-wp3-ui`,
`-wp5-wp3-ui` (LAUTST.-HÜLLK., Sichern-Vorschlag „BASS 17.10. 15:52“), `-wp3-browser` und `-wp7-data` (Kopf, Engine- und
Rollen-Chips, stilles Laden), `-wp2-keys` und `-v0a-fix` (HALBTON), neu `-fixd-steps` (Blätterer, steht jetzt in der Liste).

**DoD:** `v3-v0b-dod.mjs` 60 s Demo mit V0b-Aktionen (Bibliothek: stilles Laden, ▶, Engine-Filter, Alle Engines;
⋯ Init; FOLGEN in ROLLE, LAUF, SCHRITTE und Song-Ansicht inkl. AUS; Pad wählt; Tastatur-Anschlag; Neu (Init); Verlauf;
`viewState`) in D, P1, L1 (Touch): 0 Konsolenfehler, `tickErrors()` 0, Stimmen ≤ 18 (nativ ≤ 21), 3,5 s nach Stopp 0 — mit
Worklet und mit `?engine=native` (je 10/10). M-PLATZ mit echten Schriften (`v3-v0b-shots.mjs`, P1 P2 P3 L1 L2 W, 102 Bilder
in `v0b-work/shots/`): Bibliothek FM / Alle Engines / Init, Editor-Köpfe mit [⟶ FOLGT] und [⏸ HÄLT · …] (ROLLE, LAUF,
Melodie-Rolle, SCHRITTE), KIT „Pad wählt Instrument“, ⋯ → Init, FEST-Hinweis (LCD, MOD-Zeile), Menü Neu ▾ und
Tastatur-Anschlag, Song-Ansicht-Chip — 156/156 (keine waagrechte Rolle, Körper ohne Scroll, L4 der neuen Bedienelemente).
Worklet-ASCII-Prüfung besteht (68 746 B). PE1 (`v3-pe1.mjs`, 10 s Demo, Editor offen, P und L): Synth, ROLLE, LAUF und SCHRITTE
je 60 fps, keine Long Task > 50 ms, tick p95 0,6–0,7 ms (Ausgangsstand ROLLE/SCHRITTE: 60 fps, 0,5–0,6 ms). Start
(`v3-startup.mjs`, Median aus 5 Kaltstarts, P1): 241 ms (V0a-fix 271 ms, −30 ms), CPU ×4 970 ms (949 ms, +21 ms) — Grenzen
1,5 s / 4 s / +150 ms. Smoke-Test: Titel SYNQUENZER, keine Fehler. Datei 1,30 MB ≤ 3,0 MB.

### iPhone-Prüfpunkte (Xander)

1. **Bibliothek:** einen Sound antippen → es erklingt nichts, Toast „‚Name‘ geladen“; ▶ links in der Zeile hört vor
   (wird ■), ■ beendet ohne Knacken; auf der FM-Spur zeigt die Liste nur FM, [Alle Engines] alle mit Kennzeichen.
2. **FOLGEN:** Clip-Editor mit 4-Takt-Clip bei ▶: die Ansicht blättert am Taktstrich um ganze Seiten; eine Note antippen
   → Kopf „⏸ HÄLT · Auswahl“, die Ansicht steht; zoomen oder schieben → „HÄLT · von Hand“ bis zum Tipp auf den Chip.
   Ebenso LAUF und Drum-SCHRITTE (Seite 2 von Hand wählen, der Punkt am Seiten-Chip läuft weiter).
3. **Melodie-Rolle bei ▶ SONG:** mehrmals an dieselbe Stelle tippen → alle Noten im selben Takt (früher sprang die
   Ansicht dazwischen weiter).
4. **Drum-Editor:** ein Pad antippen → SOUND/SCHRITTE zeigen dieses Instrument; schnelles Fingerdrumming auf zwei Pads
   wechselt nicht hin und her; im KIT „Pad wählt Instrument“ ausschalten.
5. **Neu ▾ → Leer (Init)** und Menü → Bedienung → Tastatur-Anschlag: bei POSITION oben auf einer Taste leise, unten laut;
   bei FEST trägt FILTER-ANSCHLAG den grauen Hinweis, ein Tipp auf [POSITION ▸] stellt zurück.

### Bekannte Lücken

- Kein WebKit-/iPhone-Test (nur Chromium erlaubt).
- Mit der Ersatzschrift (ohne die Webfonts) rollt die Werkzeugleiste der Melodie-Rolle in L2 um 48 px; mit den echten
  Schriften passt sie (M-PLATZ besteht).
- P3: am Regler zeigt FEST nur das Grau (die LCD-Zeile ist dort ausgeblendet); zurück über ⋯ → [Anschlag POSITION] oder die
  MOD-Zeile.
- HÄLT-Gründe für die Takt-Markierung (§5.2, V3a), ● SCHRITT (V3c) und den LOCK-Modus (V5b/V5c) kommen mit diesen Paketen;
  `viewState` meldet heute `finger`, `sel`, `tool`, `hand`, `edit`.
- `wp7-accept` fm4 (DX-Tines, 30-ms-Fenster 10,7 dB > 10) besteht seit V0a-fix nicht mehr; V0b ändert daran nichts (gleicher
  Wert am Ausgangsstand), die Ursache ist nicht untersucht.
- Das ⏸-Zeichen (U+23F8 als Text) zeichnet Barlow als schmalen Balken; auf dem iPhone kommt es aus der Systemschrift.

---

## V0d — FM-Sofort (+ N0d-2 FM-Hüllkurven-Editor, Haltephase, Tonhöhen-Hüllkurve, BISS) · App 3.4.0

App: `dirigent-wt/index.html` (1 467 450 B = 1,40 MB; V0b-fix 1 377 177 B → **+90,3 KB**, Budget V0d gesamt +65 KB, siehe Abweichungen), Snapshot `synq-snapshots/V0d.html`. Ausgangsstand V0b-fix
(`synq-snapshots/V0b-fix.html`, V0c nicht gebaut). Spec: Nachtrag 1 A.4 (V0d-01…17), A.4b (N0d-2, V0d-2-01…20), Teil D.
Arbeitsdateien: `v0d-work/` (Patch-Skripte `p1…p9-*.py`, Editor-Quelle `fmev.js`/`fmev.css`, Bildschirmfotos `*.png`,
Messdaten `ui-d-results.json`, `bass1-fixed.json`). Tests in `dirigent-test/` (alle `v3-v0d-*`): `-lib` (Worklet im
Node-Shim, msfa-Referenz `refSR`), `-eng1` (Haltephase, PEG), `-eng2` (V0d-2-01/02/03/05/06/15/16/17), `-native`
(V0d-2-02/04/15/18 nativ), `-sounds`/`-snd` (V0d-11/13/14/15/16, PR1), `-fm-sound` (V0d-05/08/12), `-migr` (V0d-2-15
Migration), `-band` (V0d-2-20 M-BAND), `-ui-a` (V0d-01…04/06/07/09/10/12), `-ui-b` (V0d-06/14, V0d-2-14 Import), `-ui-c`
(V0d-2-01/13/16/19), `-ui-d` (V0d-2-06…12 mit CDP-Touch), `-shot` (Bildschirmfotos), der Lauf `v3-v0d-reg.sh` (Ausgabe
`dirigent-test/v3-v0d-reg/<OUT>`).

### Gebaut

1. **Engine (Worklet, A.4b 2/3/9).** Haltephase wie Dexed ACCURATE_ENVELOPE (gleiche Pegel hintereinander = Haltezeit aus der
   statics-Tabelle, n/44 100 s, Angriff ab 0 n/20; eine Änderung derselben Stufe behält die abgelaufene Haltezeit),
   Tonhöhen-Hüllkurve (msfa: Geschwindigkeit `PEG_RATE/21,3` Okt./s, Pegel `PEG_TAB/32` Okt., L 50 = 0; Gate-aus → Stufe 4,
   Retrigger ab dem aktuellen Wert), BISS (`fmBite` −20…+20): Zeitfaktor 2^(B/10) auf Modulator-Stufen, ein Abfall ≥ 12 dB
   nie schneller als R 82 (`BITE_LIMQ`); LÄNGE (`fmDec`) wirkt nur noch auf Ausgänge. Migration: gespeicherte Sounds ohne
   `fmBite` bekommen das alte LÄNGE-Offset in R2/R3 der Modulatoren eingebrannt (bit-gleich, `migrateBite`), dann
   `fmBite = 0`. Init-Operator R4 80 (`FM_INIT_OP`). `.syx`-Import behält die PEG (Bytes 102–109) als `fm6.peg`
   (`normPeg`); flache PEG = kein Feld.
2. **Nativer Rückfall (ECO, `DXN.voice`).** Haltephase (`holdSec`, Ereignis „hold“ im `envPlan`), PEG über einen
   ConstantSource auf `detune` mit linearen Rampen und Release, BISS/Helligkeit wie im Worklet. ECO-Hinweis
   (`fmNativeHint`), sobald ein Modulator OL ≥ 75 hat.
3. **FMH (UI-Mathematik).** `segTime`, `stageTime`, `stageFrom`, `envTimes` (mit Haltephase und Makros), `limitR`
   (Klick-Grenzen: Ausgang ≥ 20 dB Fall/Anstieg ≤ R 93, Modulator ≥ 12 dB Fall ≤ R 82), `rateForTime` (bei Gleichstand die
   Rate nahe der jetzigen), `holdSec`, `effR`, `qOf`.
4. **A.4 FM-Sofort.** ALGO-Bild zeichnet die Feedback-Schleife immer (inaktiv grau gestrichelt), Etikett
   „FEEDBACK · OP n“, FB-Regler grau mit Grund („wirkt erst, wenn OP n klingt“ / „Weg über OP m stumm“); Wechsel zwischen
   Algorithmen mit gleichen Kanten → LCD „Unterschied nur: Feedback auf OP x statt OP y – hörbar ab FB ≈ 5“ (Paare aus der
   Tabelle berechnet). Hüllkurven-Bildchen je Operator (`fmSparkPx`, ≥ 16 px, Kompaktfassung 10 px; Tipp → OP › HÜLLK.).
   Modulator-Fader OL = round(99·p^0,45), Anzeige „I 0,08“ (2 Stellen unter 1) und OL-Zahl auf der Kappe; Helligkeit
   24·sgn(v)·|v|^0,5 dB. [Auf alle Modulatoren] / [Auf alle] (je ein Undo).
5. **A.4b Editor (`fmEnvEditor`).** Log-Zeitachse ohne Raster (0,5 ms–10 s Halte-/Abklingteil, Lücke, 5 ms–12 s Release;
   32 px Rand links), Punkte A/D1/D2/R mit Auffächern (≥ 16 px, Haarlinie, Etiketten), Ablesung im Graphen
   „D1 70 ms · R2 60“ / „L2 80 · −13,5 dB · I 1,9“, LCD nur die gezogene Achse (in L kurz: „D1“, Pegel ohne Index),
   Totzone 6 px geschluckt und Anker an der Grenze des qrate-Bands (erste Änderung nach dem ersten px), ganz rechts = R 0,
   Klick-Grenze mit Bernstein-Punkt („Klick-Grenze 5 ms · nochmal ziehen = schneller“, zweiter Zug darüber hinaus),
   Pegelzug hält die Zeiten (R_i, R_i+1 folgen; „Zeit auf Klick-Grenze angehoben“ / „Zeit nicht haltbar“), FEIN
   ([FEIN] eingerastet ×¼, ruhender zweiter Finger), Doppeltipp = Init-Wert, Abbruch (blur) = ein Undo. Vorlagen
   [Snap] [Pluck] [Pad] [Orgel] (Tabelle T2 je Rolle), [+ Modulator] (Init FM), [Pegel 95] + „Biss braucht OL ≥ 90“,
   DX-Zeile R1…R4 L1…L4 (Wisch ±1, [R│L] in P3), [−1] [+1], [Auf alle Mod./Ausg.], [Auf alle], [⋯], Bezugsnote mit 🔒,
   Vorhören bei gestopptem Transport. `fmDefaultOp` (erster Modulator), Kopfzeile mit Rolle „MODULATOR → OP 1 ·
   Klangfarbe“ / „AUSGANG · Lautstärke“.
6. **HÜLLK. bei FM.** Unterreiter OPERATOREN · TONHÖHE · FILTER · MOD-HK (FILTER grau mit Grund bei `fmBypass`, MOD-HK grau
   ohne Route); bei fmAmp 1 LAUTST. (ADSR) vorn mit Band und [DX-Hüllkurven]. TONHÖHE = PEG-Editor mit [Aus] [Ruck] [Fall]
   [Anstieg], Halbton-Ablesung.
7. **MAKRO** Helligkeit · Biss · Härte · Länge · Release (`fmBite`, LCD „Biss +10 · D1 OP 2: 70 → 35 ms“); [Init FM] setzt
   BISS 0.
8. **Sounds.** Pop-Bass DX und Solid-Bass nachgestimmt (Tastatur-Skalierung links), 7 neue FM: Stapel-Bass FM,
   Abgrund-Bass FM, Knurr-Bass FM, Kristall-Lead, Funk-Stich, Atem-Orgelfläche, FM-Flügel; Tropfen = N69, neu
   Tropfen-Ping (VA), Effekte Pfeif-Rampe, Sturzflug, Aufsteiger, Absteiger, Wellen-Sweep, Kassetten-Laden in der neuen
   Kategorie „Effekt“ (Rolle Effekt). `.syx`-Hinweis (`syxHint`) und Lage-Anpassung beim Laden ([An Spur anpassen]).
9. **Hilfe** (Menü → Hilfe): neue Zeilen FM-HÜLLKURVEN und FEEDBACK; MAKRO-Zeile nennt BISS.
10. **Test-API** (Teil D): `fmDefaultOp`, `fmEnvView`, `fmAuditions`, `fmEnvPreset`, `setFmPeg`, `fmFader`,
    `fmBrightFader`, `syxHint`; `VERSION = '3.4.0'`.

### Abnahme

Alle Prüfungen mit echten Läufen; Ausgaben in `dirigent-test/v3-v0d-reg/acc/` (Abnahme) und `…/adapt/` (Anpassungen).

| Punkt | Test | Ergebnis |
|---|---|---|
| V0d-01…04, 06, 07, 09, 10, 12 | `v3-v0d-ui-a.mjs` (CDP-Touch) | 17/17 — FB-Schleife in allen 32 Algorithmen, Etikett, Grau mit Grund, LCD-Paare aus der Tabelle (1↔2 …), Bildchen in 8 Viewports, OL-Fader p 0/0,13/0,35/0,5/0,68/1 → 0/40/62/72/83/99, I-Anzeige, [Auf alle …] je ein Undo |
| V0d-05, 08, 12 | `v3-v0d-fm-sound.mjs` | 11/11 |
| V0d-11, 13, 14, 15, 16, PR1 | `v3-v0d-sounds.mjs` | 61/61 — Bässe C2/E1: Pop-Bass DX −12,5/−15,8 dB, Solid-Bass −12,8/−19,0, Stapel −11,9/−16,2, Abgrund −11,2/−12,6, Knurr −14,8/−17,9 (M-HANDYrel); alle −18,0 LUFS; Tropfen C5/G5 −5,8 HT → 0, Tropfen-Ping, N71–N76 |
| V0d-06, 14, V0d-2-14 (Import) | `v3-v0d-ui-b.mjs` | 15/15 |
| V0d-2-01, 13, 16, 19 | `v3-v0d-ui-c.mjs` | 46/46 — Startoperator, Kopfzeile in P1–P3/L1/L2, Unterreiter, Init R4 80, M-PLATZ, Trefferflächen |
| V0d-2-01 (Klang), 02, 03, 05, 06 (Klang), 15, 16, 17 | `v3-v0d-eng2.mjs` | 34/34 — Init + [+ Modulator] C2/E1: −10,1/−21,6 dB, 0,82/0,75 Okt., 25,6/33,5 dB; ROM1A-Schlauch und RMS gegen msfa; R4 93 HF-KNALL −60,5/−55,2/−50,6 dB; R3 93 Anstieg −50,5 dB; R2 82: M-PEGEL gegen msfa 0,13/0,26 dB, M-BISS 21,5/34,2 dB |
| V0d-2-04, 14 | `v3-v0d-eng1.mjs` | 34/34 (Haltephase gegen msfa, PEG-Spur, TAKE OFF) |
| V0d-2-02/04/15/18 nativ | `v3-v0d-native.mjs` | alle bestanden (Haltezeit 182,8 vs 182,3 ms, PEG ±0,07 HT, SNAP-TEST 30,9/38,3 dB) |
| V0d-2-06…12 | `v3-v0d-ui-d.mjs` (CDP-Touch, P1 + L1/P2/P3/L2) | 51/51 |
| V0d-2-15 Migration | `v3-v0d-migr.mjs` | 5/5 — (a) fmDec ±30 alter Sound: Differenz ≤ −160 dB, `fmBite` 0, R2/R3 eingebrannt; (b) Laden → Speichern → Laden deep-equal |
| V0d-2-20 M-BAND | `v3-v0d-band.mjs` | 10 unveränderte V0a-FM-Sounds: max. 0,00 dB je Band (bit-gleich in den ersten 300 ms) |

**Regression (§1.3, V0d-17, V0d-2-20):** `v3-v0d-reg.sh 3` (`run1`: 102 Läufe + Smoke, 3 236 PASS / 45 FAIL), danach die
Anpassungen einzeln (`…/adapt/`, alle bestanden). Wie am Ausgangsstand (V0b-`run2`) scheitern `rgq-old17` 5,
`v3-v0b-adapt-wp3-browser` 3, `v3-v0b-adapt-wp3-ui` 2, `wp3-adapt-func-build` 2 (auch nativ), `wp7-adapt-sqr6-persist` 1.
Seit V0b-fix (nicht V0d; mit `synq-snapshots/V0b-fix.html` nachgeprüft, mit `V0b.html` bestanden): `node-fm` „engine switch
… the voice ends“ (V0b-fix überblendet gehaltene Töne absichtlich in die neue Engine) und `wp4-offline` FX3 Juno-Chorus (2).
Offen durch V0d: `wp7-accept fm4` — nativer ECO-Weg gegen Worklet bei 30 ms > 10 dB für Pop-Bass DX, Solid-Bass, Stapel-,
Abgrund- und Knurr-Bass (11–19 dB; bei 600 ms ≤ 5,8 dB; DX-Tines wie seit V0a-fix um 10,7–11,2 dB), siehe Lücken.
Angepasst (Kopf der Datei nennt den Grund): `v3-v0d-adapt-wp1-brand`, `-wp1-misc`, `-wp1-store`, `-wp3-store`, `-n0a`
(Version 3.4.0), `-wp3-api` (3.4.0, 60 Werks-Sounds, 19 FM), `-wp7-data` (19 FM, „Alle FM“ 20), `-wp7-accept` (PR1 19 FM),
`-wp4-engine` (37 VA, 60 gesamt), `-wp7-wp3-sound` (Kategorie „effekt“ 7, fm 14). Funk-Stich FM übersteuerte im trockenen
PR1-Render (Spitze 1,15) → Pegel −2 dB (−20,0 LUFS, Spitze 0,92; V0d-13 erlaubt −18 ± 3).

**DoD:** `v3-v0b-dod.mjs 60` mit Worklet und nativ je 10/10 (keine Konsolenfehler, `tickErrors()` 0, Stimmen-Grenzen, 0
nach dem Stopp). Worklet-ASCII-Prüfung besteht (81 273 B, 0 Nicht-ASCII). Smoke-Test: Titel SYNQUENZER, keine Fehler.
Bildschirmfotos `v0d-work/final/` (OP › HÜLLK. in P1/P2/P3/L1/L2, HÜLLK. › OPERATOREN, TONHÖHE, ALGO, MAKRO) angesehen.

### Abweichungen von der Spec

- **Größe:** +90,3 KB statt +65 KB (Editor, PEG-Editor, 14 Sounds, native Haltephase/PEG).
- **BISS −10:** Pegel bei 90–110 ms liegt 2,4 dB über den anderen Stufen (PM-Pegelschwankung; die Spec misst nur
  −20/0/+20, dort 0,95 dB) — geprüft wird wie in der Spec −20/0/+20.
- **TAKE OFF (V0d-2-14 e):** Vergleich als Mittel über 0–200 ms (das erste 10-ms-Fenster schwankt durch Feedback-Rauschen
  um 1,9 HT).
- **LCD in L:** Kopf nur die Stufe („D1“), Pegelwert ohne Index — die volle Ablesung steht im Graphen (sonst passt das
  Wertfeld in L1 nicht, V0d-2-09).
- **Kopf in L:** „OP 2 · MOD.→1“ (Kurzform); Unterreiter-Kurzformen (z. B. „OPERAT.“, „LAUTST. (ADSR)“) in P3/L2.
- **Effekte:** neue Kategorie „effekt“ (Rolle Effekt) statt Sequenz/Fläche, weil die Effekt-Sounds die Gates dieser
  Kategorien nicht erfüllen; N75 hat die Rolle Effekt.
- **Solid-Bass:** E1 −19,0 dB (Regel ≥ −20 erreicht; die Ausweichregel ≥ −24 war nicht nötig).
- **Startpunkt des Ziehens:** Der Anker liegt nach der Totzone am Rand des qrate-Bands (sonst käme die erste Änderung
  erst nach 8–10 px, V0d-2-07 fordert ≤ 7); ganz rechts (hinter dem Achsen-Ende) = R 0.
- **.syx-Export** gibt es weiterhin nicht (kommt mit V4c); der Import übernimmt die PEG.

### iPhone-Prüfpunkte (Xander)

1. **OP › HÜLLK.** eines FM-Sounds: D1 des Modulators waagrecht ziehen — die Zeit läuft in ms, kein Sprung am Anfang;
   ganz nach links bleibt der Punkt an der Klick-Grenze stehen (Bernstein), ein zweiter Zug geht darüber hinaus.
2. Zweiten Finger irgendwo auf den Editor legen, während der erste zieht → fein (¼); [FEIN] rastet ein.
3. **Init FM → [+ Modulator]**: C2/E1 spielen — hörbarer Biss, der Ton schneidet nicht ab.
4. **MAKRO → Biss** −20 … +20 am Snap-Bass: dumpfer ↔ bissiger, gleich laut.
5. **HÜLLK. › TONHÖHE → [Fall]**: der Ton fällt hörbar in den ersten 200 ms.
6. **Hüllkurven-Bildchen** im ALGO-Streifen in WebKit (Darstellung ungeprüft).
7. Bässe (Pop-Bass DX, Solid-Bass, Stapel-/Abgrund-/Knurr-Bass) auf dem Handy-Lautsprecher anhören (E.11).

### Bekannte Lücken

- Kein WebKit-/iPhone-Test (nur Chromium erlaubt); Hüllkurven-Bildchen und Touch-Gesten des Editors auf dem iPhone
  ungeprüft (Prüfpunkte oben).
- **ECO-Weg (nativ) bei tiefen FM-Bässen:** `wp7-accept fm4` misst bei 30 ms 11–19 dB Abstand zum Worklet (zu viel Energie
  unter 60 Hz im nativen Anschlag) für die nachgestimmten und neuen Bässe; ab 600 ms ≤ 5,8 dB. V0d-2-18 (nativ) besteht.
  Ein Versuch, den Phasenfehler der FM-Integration im ECO-Weg auszugleichen, half nur im 48-kHz-Offline-Render und wurde
  verworfen (bei 44,1 kHz live liegt der Gleichanteil schon ohne Ausgleich bei ≈ 0). Ursache offen.
- `node-fm` (Engine-Wechsel) und `wp4-offline` FX3 scheitern seit V0b-fix (nicht durch V0d); die Erwartung von `node-fm`
  ist durch die V0b-fix-Überblendung überholt, FX3 nicht untersucht.
- Die Bässe und Effekte sind gemessen, nicht angehört (E.11).
- Im LCD von L2 (667×375) bleibt für den Wert wenig Platz; die Ablesung steht dort im Graphen.
