# CHANGES-V3 — SYNQUENZER v3

Fähigkeiten-Summe (EN-19, B.0), fortgeschrieben je Paket:

```js
capabilities: {
  downloads: { /* wie bisher – Form der letzten v2-Veröffentlichung, in den Dateien nicht festgehalten (vor VC1 nachsehen) */ },
}
```

V0a, V0b, V0d, V4a und V4b fügen keine Fähigkeit hinzu. Die App läuft weiter ohne jede Fähigkeit (`use()` → `null`, EN-13).

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
Offen durch V0d (in V0d-fix behoben, siehe unten): `wp7-accept fm4` — nativer ECO-Weg gegen Worklet bei 30 ms > 10 dB für Pop-Bass DX, Solid-Bass, Stapel-,
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
  verworfen (bei 44,1 kHz live liegt der Gleichanteil schon ohne Ausgleich bei ≈ 0). Ursache offen. → **In V0d-fix behoben**
  (Ursache gefunden, siehe V0d-fix).
- `node-fm` (Engine-Wechsel) und `wp4-offline` FX3 scheitern seit V0b-fix (nicht durch V0d); die Erwartung von `node-fm`
  ist durch die V0b-fix-Überblendung überholt, FX3 nicht untersucht.
- Die Bässe und Effekte sind gemessen, nicht angehört (E.11).
- Im LCD von L2 (667×375) bleibt für den Wert wenig Platz; die Ablesung steht dort im Graphen.

---

## V0d-fix — ECO-Anschlag ohne Gleichanteil, `wp7-accept fm4` besteht wieder · App 3.4.0

App: `dirigent-wt/index.html` (1 474 868 B; V0d 1 467 450 B → +7,4 KB), Snapshot `synq-snapshots/V0d-fix.html`.
Befunde: (1) ECO-Weg (nativ, `DXN.voice`) erzeugt bei Pop-Bass DX, Solid-Bass, Stapel-, Abgrund- und Knurr-Bass einen
Gleichanteil/Subbass-Stoß beim Anschlag (offline 48 kHz C4: Mittel 0–30 ms +0,131 bzw. −0,185 FS, Energie < 30 Hz −8,8 /
−6,5 dB statt −32 / −33 dB); (2) dadurch `wp7-accept fm4` bei 30 ms 11–18 dB (Grenze 10), ohne Adapt-Datei (V0d-17, V0d-2-20).

### Ursache

- Der ECO-Weg rechnete FM statt PM: `A·y'(θ)·2πf` in `frequency`. Der Term `A'(t)·y(θ)` fehlte, jede schnelle
  Modulator-Hüllkurve hinterließ einen festen Phasenversatz zwischen Träger und Modulator; bei den 1:1-Paaren der Bässe
  (EN-03) hebt sich das 0-Hz-Seitenband dann nicht mehr auf → Gleichanteil-Stufe mit zufälligem Vorzeichen je Note.
- Chromium: Ein Oszillator mit a-rate-Eingang an `frequency`/`detune`, der mitten in einem Render-Quantum startet, bekommt
  die Modulation erst ab der nächsten Quantum-Grenze (`v3-v0dfix-start2.mjs`) — jede Live-Note verlor so die ersten
  Modulationswerte, auch mit echter PM.
- Feedback-Bässe (Knurr-Bass): die statische Feedback-Welle hatte im Anschlag die dumpfere Körper-Klangfarbe.

### Geändert (nur `DXN.voice`, ECO-Weg; Worklet unverändert)

- **Echte Phasenmodulation:** jeder Modulator gibt `m = 2π·A(t)·y(θ)` (rad) aus; die Summe der Modulatoren eines Operators
  läuft durch ein Differenzfilter (`IIRFilterNode`, `(sr/2π)·(m[n]−m[n−1])`) in dessen `frequency` — die Phasensumme ist
  genau `m[n−1]`. Ohne `IIRFilterNode` (sehr altes WebKit) bleibt der alte FM-Weg.
- **Verstimmte Operatoren:** `detune` (cv, PEG) skaliert auch den FM-Eingang; der Eingang wird darum durch `2^(cents/1200)`
  geteilt (WaveShaper-Kurve über ±12 000 Cent). `v3-v0dfix-cvcomp.mjs`: cv ±1200/−700/300 Cent = Note ±12/−7/+3, Rest
  −72 … −89 dB (6/6).
- **Startzeiten:** die Quellen einer Stimme starten im Quantum vor dem von t0 (dort sind alle Modulationen noch 0, Hüllkurven,
  cv und PEG beginnen erst bei t0, also klingt nichts früher): die tiefsten Modulatoren auf der Grenze, jeder Operator ein
  Sample nach seinen Modulatoren (gleicht die Ein-Sample-Verzögerung des Differenzfilters aus wie die Operator-Kette im
  Worklet). Eine schon vergangene Grenze (späte Live-Note) → alle zusammen auf der nächsten.
- **Feedback folgt der Hüllkurve:** bis zu zwei weitere Oszillatoren mit den Wellen für 2× und 4× Körper-Feedback, gewichtet
  über eine WaveShaper-Kurve auf der Kopie der Operator-Hüllkurve (Körper-Welle bis Körperpegel, darüber die helleren);
  im Release mitgeführt.
- Der ECO-Hinweis „Klangfarbe bei hohem Pegel angenähert“ bleibt (Feedback ist weiter eine Wellen-Näherung).

### Nachweis (vorher = V0d)

| Prüfung | Vorher | Nachher |
|---|---|---|
| `wp7-accept.mjs fm4` und `v3-v0d-adapt-wp7-accept.mjs fm4` (30 ms) | 34/6: Pop 14,1 · Solid 12,1 · Stapel 11,0 · Abgrund 18,0 · Knurr 17,9–18,2 · DX-Tines 10,7 dB | **40/0** beide: 0,4 · 0,1–0,2 · 2,5 · 0,3–0,8 · 2,5 · DX-Tines 1,1 dB (600 ms ≤ 0,8 dB) |
| `v3-v0d-adapt-wp7-accept.mjs` (alle: FM1–FM10, PR1, PR8, MO, UI) | — | 88/0 |
| `v3-qa-v0d-ecolf.mjs` (offline 48 kHz, < 30 Hz in 0–60 ms) | Pop C4 −8,8 dB / Mittel +0,131; Knurr C4 −6,5 / −0,185; Pop C2 Mittel −0,168 | Pop C4 −31,8 (Worklet −32,3) / −0,006; Knurr C4 −28,4 (−33,4) / −0,013; Pop C2 −14,6 (−16,1) / +0,062 (Worklet +0,021; 30 ms = 2 Perioden) |
| `v3-repro-ecothump.mjs` live 44,1 kHz C4 (Mittel 0–30 ms, < 30 Hz) | Pop −0,034 / −14,8 dB · Solid −0,048 / −12,5 · Stapel −10,4 · Abgrund −10,8 · Knurr −17,1 | Pop −0,0015 / −37,5 (Worklet −36,2) · Solid −0,003 / −35,4 (−34,3) · Stapel −34,3 (−42,7) · Abgrund −31,0 (−32,2) · Knurr −42,2 (−37,5); C2 alle ≤ |0,016| |
| dasselbe bei 48 kHz (iPhone-Rate), C4 | Pop +0,044 / −12,5 · Solid +0,041 / −13,7 · Knurr −0,043 / −11,5 | Pop −0,001 / −36,5 (−36,3) · Solid −0,004 / −32,0 (−34,6) · Knurr −0,002 / −39,5 (−38,1) |
| `v3-fm4dc-indep.mjs` (Mittel 0–30 ms; LP 30 Hz 0–60 ms nativ/Worklet) | −0,044 … +0,030; Pop −29,1/−42,6 | \|Mittel\| ≤ 0,003; Pop −42,1/−42,6 · Solid −41,0/−40,7 · Stapel −45,5/−45,4 · Abgrund −45,3/−43,1 · Knurr −41,0/−40,9 |

Kontrollsounds (FM-Pluck, FM-Orgel) unverändert unauffällig; die Sinus-Stufe ab 300 ms ist auf beiden Wegen ≈ 0.

**Regression:** `v3-v0d-reg.sh` (Engine-Teil: wp7-accept ui/mo/fm4/fm7/fm10/f1, PR1, wp7-syx/-data/-fm9/-gates/-dod,
node-fm/-fm-pr1/-an1/-fx1/-engine/-check, wp4-engine/-offline/-gates/-dod, wp3-api/-store/-leak/-browser, func-build und
func2-build mit Worklet und nativ, wp1-perf, harm-pure; Ausgabe `v3-v0d-reg/v0dfix2/`): alles bestanden außer den schon in
V0d `run1` gleich scheiternden Prüfungen (`node-fm` 1, `v3-v0b-adapt-wp3-browser` 3, `wp3-adapt-func-build-native` 2,
`wp4-offline` 2, `wp7-adapt-sqr6-persist` 1 — Meldungen identisch). V0d-Suiten: `v3-v0d-eng1` 34/0, `-eng2` 34/0,
`-fm-sound` 12/0, `-sounds` 62/0, `v3-v0d-adapt-wp4-engine` 40/0, `-wp7-wp3-sound` 18/0, `v3-v0b-dod.mjs 60` nativ 10/0.
Smoke-Test: Titel SYNQUENZER, keine Fehler.

### Abweichung: V0d-2-18 nativ (`v3-v0dfix-adapt-v0d-native.mjs` statt `v3-v0d-native.mjs`)

Zwei Schranken von V0d-2-18 waren auf den alten FM-Weg geeicht („Gegen msfa wird nativ nicht geprüft, weil ECO FM statt PM
rechnet“). Jetzt rechnet ECO PM und trifft das Worklet (= msfa) genau — das Worklet selbst verfehlt diese Schranken:
- PEG ändert den Index nicht: H2/H1 ohne/mit +7,5 HT nativ −2,81 / −1,78 dB = Worklet −2,81 / −1,78 dB (Differenz 1,03 > 1).
  Die Messung (8192-FFT, 200 ms) schwankt ohne PEG schon von Ton zu Ton um ±1 dB (Worklet C3 −2,81, G3 −1,62, G#3 −1,70;
  `v3-v0dfix-pegwk.mjs`). Neu: nativ = Worklet ±0,3 dB mit und ohne PEG und die PEG-Änderung nativ = Worklet ±0,3 dB.
- SNAP-TEST ×1 M-PEGEL zu „ohne Modulator“ −4,0 … 0,5 (C2) / −4,6 … 0,9 dB (E1) — genau der msfa-Bereich, den V0d-2-05
  selbst nennt (−4,5 … +0,7). Neu: M-PEGEL gegen das Worklet ≤ 0,5 dB (Schranke aus V0d-2-05) in Fenstern von 2 Perioden
  (gemessen 0,13 / 0,14 dB); ein 20-ms-Fenster hält bei C2/E1 nur 1,3/0,8 Perioden und hängt dann von der Startphase ab
  (`v3-v0dfix-natprobe4/5.mjs`: 20 ms bis 2 dB, 2 Perioden ≤ 0,33 dB bei jedem Start im Quantum). M-BISS unverändert
  ≥ 25 dB (31,1 / 39,7). Alle anderen Punkte der Datei unverändert; 10/10 bestanden.

### Bekannte Lücken

- Offline-Render mit t0 < 1 Quantum (erste Note bei 0 s): die Quellen können nicht vorher starten; Stapel-Bass C4 dort
  < 30 Hz −26,8 dB statt −39,2 (Mittel −0,018). Live (t0 immer später) und bei t0 ≥ 1 Quantum nicht betroffen.
- Mehr Knoten je ECO-Stimme (Differenzfilter je modulierten Operator, bis zu 2 Feedback-Oszillatoren); `wp7-adapt-wp1-perf`,
  `wp4-dod`/`wp7-dod` und die native DoD bestehen, auf dem iPhone ungemessen.
- Kein WebKit-Test (Chromium only); `IIRFilterNode` gibt es in Safari seit 14.1.


---

## V4a — FM-Graph-Engine (`p.fmx` Format 2, 6 Operatoren) · App 3.8.0

Grundlage: Nachtrag 2 Teil A (A.3–A.7, K2-37 … K2-45, K2-58 … K2-62) mit `r7/kodamo-delta-pdf.md` (KP §4.8–4.11, §6, §7, §9 V4a)
und `r7/kodamo-delta.md` §6.2/§6.4/§6.5 (nur nach A.3); Spec v3 §9.3 und §17 V4a. Gebaut auf `synq-snapshots/V0-gruppe-fix.html`
(Gruppe 1 ohne V0c; Gruppe 2 ist noch nicht gebaut, V4a braucht nur V0d). Die Fähigkeiten-Summe ändert sich nicht.
Keine Oberfläche des FM-Felds (die kommt mit V4b); sichtbar ist in V4a nur die Hinweiszeile auf der FM-Seite.

### Gebaut

**Datenmodell `p.fmx` (KP §6.1, Format 2, `n` = 6)** — neues Modul `FMX` (eigener `<script>` vor SQStore, eigene DX-Tabelle):
- `FMX.norm` (`normFmx`): Bereiche und Vorgaben je Feld, Hüllkurven in DX-Form `{f:'dx', r[4], l[4]}` oder Punkt-Form
  `{f:'pt', y, t, sus, la, lb, skip, crv, run}` (Punkt-Form wird gespeichert, klingt aber erst ab V4f, s. Lücken);
  Reparatur in fester Reihenfolge (KP §6.2 ohne die 16-Kanten-Regel, K2-42): doppelte Zelle → nächste freie Spalte der
  Reihe; Kante gegen I2 oder mit unbekanntem OP → weg; Ausgang mit Ziel → Ziel weg (I4); OP ohne Ziel fällt nach R7 auf den
  obersten Nicht-Vorfahren darunter, sonst zum Ausgang (I3). Jede Reparatur schreibt eine Konsolenzeile; zweimal = gleich.
- `FMX.check` (I1–I4, genau 6 Operatoren) — `setFmx` wirft damit, die Daten bleiben unverändert (K2-37, V4a-05).
- `FMX.fromFm6` (`fmxFromFm6`, KP §6.3): Plätze nach `dxLayout`, Feedback am Empfänger `fbDst` mit Quelle `fbSrc`
  (Alg. 4/6: Empfänger 6, Quelle 4/5), DX-Form-Hüllkurven, `fm6.peg` in jeden Verhältnis-OP (`pr 'dx'`),
  `lfoAm = round(127·ams/3)`, `lfoFm = round(127·pms/7)`, `phm = osync 0 ? 'free' : 'fix'`.
- `FMX.dxLayout` (KP §6.5), `FMX.dxMatch` (eigene Nummerierung zuerst, dann alle 720), `FMX.dx` (DX-tauglich nach KP §6.4
  mit deutschen Gründen: „OP 3: Welle Säge“, „Feedback an OP 2 und OP 6“, „Nummern anders (wie DX 5)“ …), `FMX.toFm6`,
  `FMX.approxFm6` (nächster DX-Algorithmus: wenigste abweichende Kanten über alle Nummerierungen, `approx: true`).
- `SQStore`: `normSynthP` trägt `p.fmx` (normalisiert); `normFm6` behält jetzt `ams[6]`, `pms`, `osync: 0` und `approx`.
- `p.fm6` folgt dem Graph (`fmxApply`): DX-tauglich → derselbe Klang als fm6; sonst der nächste DX-Algorithmus mit
  `approx: true` für den nativen Rückfall. Eine Änderung auf den DX-Seiten (ALGO/OP/MAKRO, Zufall, v1-Pfade) macht fm6
  zum Klang und baut `p.fmx` daraus neu (Zellen bleiben, wenn der Algorithmus gleich bleibt); [Init] löscht `p.fmx`.

**Worklet: Graph-Renderer** (`fm6.x` = `p.fmx` reist in der `{fm6}`-Nachricht mit; ohne `x` läuft der fm6-Weg unverändert):
- `fmxCompile`: Ausgänge = OPs ohne Ziel, Modulator-Summen je Ziel, Reihenfolge topologisch (Modulatoren zuerst, unter den
  bereiten die höchste Nummer → für jeden DX-Graph genau die fm6-Reihenfolge 6…1, also dieselben Rechenschritte).
- **Feedback je Operator:** Selbst wie DX (2-Sample-Mittel, `2^(fbAmt−8)`, `fbAmt` in 0,1-Schritten, N4a-01); fremde Quelle
  mit 1 Sample Verzögerung. Liegt die Quelle oberhalb, rechnet der Block-Weg exakt (Quelle vor dem Empfänger); bildet sie
  eine echte Schleife, rechnet `fmxRenderPS` alle Operatoren Sample für Sample. DX-Alg. 4/6 (Empfänger 6, Quelle 4/5)
  laufen wie N7F-02 verlangt auf dem WP7-Weg (in OP 6 gefaltet).
- **Werkswellen 0–11** (K2-40, KD §6.2): 0 = der bisherige Sinus-Pfad (bitgleich), 1–11 Tabellen mit 512 Samples und
  linearer Interpolation, Teiltöne geschlossen gerechnet (Säge, Säge weich, Dreieck, Rechteck, Halbsinus, Puls 25 %,
  Oberton 2/3, Sinus weich = sin 2πx·sin πx, Sinus weich 2, Rauschen = flaches Spektrum mit festen Zufallsphasen), Spitze 1,
  gleichanteilfrei; **Mipmaps** mit einer Stufe je Oktave (Stufe L: Teiltöne ≤ 2^(8−L)); Wahl je Stimme und Operator in
  jedem Steuerblock aus der aktuellen Operatorfrequenz (mit Tonhöhen-Hk., LFO, Bend) mit Überblendung zwischen zwei
  Nachbarstufen, beide aliasfrei (Bandbreite zwischen fs/4 und fs/2).
- **Phase** `ph` 0…127 und `phm` 'fix' │ 'rnd' │ 'free' ('free' = die weiterlaufende Phase des Operators).
- **Anschlag ±:** `vs` −7…+7; negativ = gespiegelte DX-Kurve (leise Anschläge laut). `vs` 0…7 rechnet wie fm6.
- **LFO je Operator:** `lfoAm` (LFO 1 der Spur auf den Pegel, 127 = 24 dB Absenkung am LFO-Tiefpunkt) und `lfoFm`
  (Tonhöhe, Kurve der msfa-PMS-Tabelle, 127 = ±12 HT).
- **Tonhöhen-Hüllkurve je Operator** `pit` in DX-Form (`pr 'dx'`, msfa-PEG-Rechnung wie V0d); feste OPs ohne PEG (K2-58).
- **Stumm** `on 0` rechnet wie `ol 0`; Umschalten bei klingender Note über eine 30-ms-Rampe.
- **Live-Pegel** (N7F-09): `{fmxLv: [6]}` mit ~30 Hz nur auf Anforderung (`{fmxLv: true}`), Maximum über die Stimmen,
  Pegel × Hüllkurve auf der OL-Skala der Kachel (OL 99 voll = 1, OL 80 = 0,81). Host: `E.fmxLv(on)`, `fmxLvWant(t, on)`
  (V4b ruft das, solange das FELD sichtbar ist), `E.lv`.
- **Stimmen-Überblendung 30 ms (L3, Z11) in allen Worklet-Engines:** Ein Strukturwechsel bei klingenden Stimmen (XF_KEYS
  bei VA, ganzer Sound, FM-Algorithmus, fmx-Kanten/Wellen/Feedback-Quellen) kopiert die klingenden Stimmen in einen Geist
  mit dem alten Klang (cos), die Stimmen selbst laufen mit dem neuen weiter (sin), gleichleistungsgemäß. Ein Wechsel während
  der Blende wartet und wird zusammengefasst (höchstens ein Geist, Last höchstens ×2,2). Bei einem VA-Wellenwechsel startet
  die neue Welle mit ihrem Grundton in Phase mit der alten (`wavePhi`; Säge und Puls sind sonst gegenphasig: −7 dB Loch).
  Die WP4-Blende (96 Samples ab, 96 auf) bleibt als Rückfall ab Begrenzer-Stufe 2 (`xfLite` aus `limited()`) und für
  einen Wechsel Poly ↔ Mono. Geist als Spread-Kopie (die alte Kopie mit Schlüssel-Zuweisungen lief im V8-Wörterbuch-Modus,
  +15 % Last; betrifft auch den Engine-Wechsel aus V0b-fix).
- **Stimmenregel (K2-42):** Der schlechteste Fall mit echter Schleife lag mit 8 Stimmen bei 15,7 % je Spur → ab jetzt gilt
  „mehr als 12 Kanten → 6 Stimmen“; Grund in der Hinweiszeile der FM-Seite („6 Stimmen · mehr als 12 Verbindungen“),
  `engineInfo().perTrack[i].voiceCap`.
- Werkswellen werden beim Laden des Worklet-Moduls gebaut (FP-IPHONE, s. Fach-Prüfung).

**Nativer Rückfall (Spec 9.3, V4a-07):** DXN spielt `p.fm6`; bei `approx` der nächste DX-Algorithmus. Hinweis auf der FM-Seite
„ECO: angenähert (nächster DX-Alg. n)“, dasselbe im Titel/LCD des ECO-Abzeichens.

**.syx-Import (A.4b P. 11, Diagnose 3h):** AMS je Operator (auch Modulatoren), PMS und „Key-Sync aus“ bleiben in fm6
(`ams`, `pms`, `osync: 0`); eine Empfindlichkeit ohne LFO-Tiefe (AMD/PMD 0) wird verworfen.

**Mod-Ziele:** `op1…op6` und `fmbright` wirken auf den Graph wie auf fm6 (N7F-11, N7F-12).

**Test-API (KP §7, V4a):** `getFmx(t)`, `setFmx(t, fmx)` (wirft bei I1–I4 / 7. Operator, ein Undo), `fmxLevels(t)`,
`fmxLevelWatch(t, on)`, `dxLayout(alg)`, `fmxDx(t)`, `fmxFromFm6(fm6)`; `engineInfo().perTrack[i].voiceCap`.

**Layout:** Die Hinweiszeile der FM-Seite (ECO / 6 Stimmen) lief auf kurzen Hochformaten (375 × 667, 320 × 568) in die
Fader-Reihe (auch der V0d-Hinweis „Kompatibel …“): Dort nimmt sie jetzt die Zeile der kleinen Hüllkurvenbilder, die
Fader werden kürzer (min. 40 px), der Text bleibt einzeilig.

### Abnahme (V4a: N7F-01 … N7F-12 mit K2-37/K2-40/K2-42; Spec V4a-02 … -11)

Tests: `dirigent-test/v3-v4a-node.mjs` (Node-Shim des Worklets, KP §9), `v3-v4a-ui.mjs` (Chromium, App),
`v3-v4a-bench.mjs` (CPU, Node), `v3-v4a-shot.mjs` (Bildschirmfotos, M-PLATZ). Ausgaben in `dirigent-test/v3-v4a/`.

| Punkt | Messung | Ergebnis |
|---|---|---|
| N7F-01 Format | 200 Zufallsgraphen (6 Op, alle Kantenzahlen, DX- und Punkt-Hüllkurven): `normFmx` zweimal gleich, `setFmx` = `getFmx`, Kopie (getSound/setSound), Undo, Speichern/Laden (10 Runden) deep-equal; Reparatur doppelte Zelle / Kante nach oben / schwebender OP / Ausgang mit Ziel → I1–I4, zweimal gleich | 200/200 · 10/10 · 4/4 |
| N7F-02 (V4a-01) | `fmxFromFm6` alle 32 Algorithmen, alle 6 OP an, Mod. OL 80, Ausgänge 99, fb 5, PEG [Fall], C3, Anschlag 0,8, 1 s, gegen fm6 | bitgleich (Differenz 0) · Alg. 4/6: Empfänger 6, Quelle 4/5 |
| N7F-03 Wellen | Welle 0 gegen den Sinus-Pfad · KD §6.2: Säge H2 −6,0 · Säge weich H2 −12,0 · Dreieck H3 −19,1 (H2 −119) · Rechteck H3 −9,5 · Halbsinus H2 −7,4 · Puls 25 % H4 −110 · Oberton 2 H2 −6,0 · Oberton 3 H3 −6,0 · Sinus weich H2 −10,9, Spitze 30,5 % · Sinus weich 2 H2 −1,9 / H3 −14,0, Spitze 36,5 % · Rauschen max. Teilton 0,0 dB über Median · Welle 4 bei C7 gefaltete Energie · Wellenwechsel bei gehaltener Note · Gleiten C5→C8 durch die Mip-Stufen (Säge, Rechteck, Rauschen) | bitgleich · alle ±0,5 dB / ±1 % · −76,9 dB (≤ −50) · M-KLICK 3,6 dB · 2,8 / 0,8 / 0,7 dB |
| N7F-04 Phase | 'fix' ph 0: zwei Anschläge 64 Samples · ph 64: Start umgekehrt · 'rnd': 10 Anschläge · 'free': 2. Start = fortgelaufene Phase | −147 dB · ja · 10/10 verschieden · Fehler 0/128 |
| N7F-05 Feedback | Selbst-Feedback fb 7 gegen DX · `fbSrc` an jedem OP (selbst und fremd) · 15 Kanten + 6 Wege (2 fremd, eine echte Schleife): 60 Zufallsgraphen × 1000 Blöcke = 60 000 Blöcke · `fbAmt` 4,5 im M-SP | bitgleich · 12/12 · kein NaN, Spitze −8,3 dBFS bei Pegel 0,35 (8 Stimmen zusammen −2,6) · 666 Hz zwischen 316 und 1542 |
| N7F-06 Stumm | `on 0` gegen `ol 0` · Umschalten bei gehaltener Note (Modulator / Ausgang) | identisch · M-KLICK 1,2 / 0,5 dB, M-EINBRUCH 0,3 / 0,5 dB |
| N7F-07 Anschlag | `vs` −7: Anschlag 0,3 gegen 1,0 · `vs` 0…7 gegen fm6 | +76 dB · bitgleich |
| N7F-08 LFO je OP | `lfoAm` 127 (LFO 1 5 Hz) · `lfoFm` 127 · 0 = keine Wirkung · .syx AMS 3 an Modulator OP 2 (AMD 50), PMS 3 (PMD 20), Key-Sync aus | 24,0 dB Spitze-Spitze · ±1198 Cent · identisch · `lfoAm` 127, `lfoFm` 54, `phm` 'free' |
| N7F-09 Live-Pegel | ohne Anforderung · mit (Node / AudioWorklet) · Werte · Mehrlast | 0 Nachrichten · 29,0 / 29,0 je s · 1,00 0,81 … (OL 99 / 80) · +0,001 % |
| N7F-10 (K2-42) CPU | Chromium-AudioWorklet, Median 10 s, Xeon: 15 Kanten + 6 Wege (2 fremd), Wellen 1–6, DX-Form, 8 Tasten; ohne / mit echter Schleife. Vor der Regel (8 Stimmen) gemessen: 10,7 % / **15,7 %** → Regel „mehr als 12 Kanten → 6 Stimmen“ greift (K2-42), Grund in der Hinweiszeile | 6 Stimmen: 4,1 … 5,6 % / 5,9 … 10,3 % (≤ 12; Chromium-Werte schwanken ±40 % von Lauf zu Lauf) |
| N7F-10 fm6-Weg | 6 Op DX-Form, 8 Stimmen, Node (stabil, bester von 5 × 10 s): vor V4a 2,87 / 3,03 / 3,08 / 3,14 % · nach V4a 2,74 / 2,83 / 2,94 / 2,98 %; derselbe Klang als fmx 2,82 … 3,31 % | ≤ vorher + 5 % ✓ (Chromium 1,5 … 3,5 % vorher wie nachher) |
| N7F-11 (V4a-08) | `lfo1→op2` und `lfo1→fmbright` auf einem Graph, Schwerpunkt max/min | 5,36 / 5,21 (> 1,5) |
| N7F-12: V4a-02 | FM1–FM10 (`wp7-accept` fm4/fm7/fm10, `node-fm`, `fm-pr1`, `wp7-fm9`, `wp7-gates`) | unverändert (node-fm: derselbe alte Fehler wie V0d) |
| V4a-03 | s. N7F-05 | bestanden |
| V4a-04 (K2-42) | 6 Operatoren, 8 gehaltene Tasten | 8 Stimmen; > 12 Kanten 6 Stimmen mit Grund |
| V4a-05 (K2-37) | `setFmx` mit 7. Operator, I1, I2, I3, I4 | wirft 5/5, Sound unverändert |
| V4a-07 | nicht DX-tauglicher Graph (Welle, fremdes Feedback 2,5, Zusatzkante), `forceNative(true)` | nächster DX-Alg. 1, −15,1 dBFS (> −40), Hinweis „ECO: angenähert (nächster DX-Alg. 1)“ |
| V4a-09 | Sounds ohne fmx bleiben ohne; Graph-Sound in die Bibliothek und zurück | ja / deep-equal |
| V4a-11 | VA-Fläche Säge → Puls (D5 + G5 gehalten): M-KLICK 2,8 dB, M-EINBRUCH −1,3 dB (kein Loch); alle 12 VA-Wellenwechsel: M-KLICK ≤ 3,8, M-EINBRUCH ≤ 0,2 dB; FM-Graph-Wechsel: 1,6 / 0,0 dB; fm6 Alg. 1 → 5: 2,2 / 0,0 dB. **Vergleich WP4-Blende** (jetzt nur `xfLite`): VA 2,8 / −0,4 dB, FM-Graph 2,9 / **6,8 dB** (Loch). Stimmen während der Blende 2 → 4; Rechenzeit je Block ×2,10 / ×2,11 (der Block mit der Kopie ×2,4 / ×3,0) | bestanden bis auf die Last-Grenze ×2 (Abweichung 1) |
| V4a-10 | Regression (`v3-v4a-reg.sh`, Liste von V0d mit 6 Versions-Anpassungen `v3-v4a-adapt-*` für 3.8.0) + V0d-Suiten + DoD | s. unten |

**Regression:** `v3-v4a-reg.sh` (Ausgaben `v3-v4a-reg/run1`, Einzel-Wiederholungen `v3-v4a-reg/rerun`): alles bestanden außer den
schon in V0d gleich scheiternden Prüfungen (`node-fm` 1, `v3-v0b-adapt-wp3-browser` 3, `wp3-adapt-func-build` und `-native`
je 2 (C2, D5), `wp4-offline` 2, `v3-v0b-adapt-wp3-ui` 2 (MO49, wie V0d `run1`)). Im Parallel-Lauf zusätzlich gescheitert und
einzeln bestanden: `wp7-accept fm4` 40/0, `v3-v0b-adapt-v0a-fix` 26/0, `v3-v0b-adapt-wp6-extras L` 20/0, `wp6-drums P` 38/0
(Zeit-Messungen unter Last). Versions-Prüfungen (3.4.0 fest im Test): neue Kopien `v3-v4a-adapt-wp1-brand` 41/0, `-wp1-misc`
104/0, `-wp1-store` 41/0, `-wp3-api` 30/0, `-wp3-store` 55/0, `-n0a`. DoD (wp1…wp7-dod, `wp7-adapt-wp1-perf`) bestanden.
V0d-Suiten: `v3-v0d-eng1` 34/0, `-eng2` 34/0, `v3-v0dfix-adapt-v0d-native` 10/0, `-sounds` 61/0, `-fm-sound` 11/0, `-migr` 5/0,
`-band` 1/0, `-ui-a…d` 17/15/46/51 ohne Fehler. V4a: `v3-v4a-node` 46/0, `v3-v4a-ui` 23/0, `v3-v4a-shot` 10/0.
Smoke-Test: Titel SYNQUENZER, keine Fehler. Worklet-ASCII-Prüfung bestanden (110 KB). Dateigröße 1 531 473 Byte (+54,5 KB).

Bildschirmfotos: `dirigent-test/v3-v4a/shots/fm-eco-*.png` und `fm-cap-*.png` (P 390 × 844, P375, P320, L 844 × 390, L667).

### Fach-Prüfung (Teil J: FP-DSP Haupt-Blick, FP-IPHONE Zweit-Blick; V4a ist blockierend ●)

Kein eigener Prüf-Agent verfügbar: Ich habe beide Checklisten (J.2) selbst über Diff, Testausgaben, Messwerte und Bilder
abgearbeitet. 7 Befunde, 6 behoben, 1 begründet:

1. **FP-IPHONE · Wellen-Bau auf dem Audio-Thread** (`waveTab`, erster Gebrauch): kalt 29 ms in einem Block (Node; iPhone
   eher mehr) → Aussetzer. **Behoben:** alle 11 Tabellen beim Laden des Moduls (einmal, vor jeder Stimme; danach ≤ 1 ms je
   Welle). Speicher ≈ 250 KB.
2. **FP-DSP · Geist im V8-Wörterbuch-Modus:** Der Geist (Engine-Wechsel V0b-fix und die neue Struktur-Blende) entstand per
   `Object.create` + Schlüssel-Zuweisung → langsame Eigenschaften (`%HasFastProperties` false), +15 % Last während der Blende.
   **Behoben:** Spread-Kopie (schnelle Eigenschaften), Stimmen-Kopie über den `Voice`-Konstruktor (gleiche Hidden Class).
3. **FP-DSP · Loch bei Säge → Puls:** gleichphasige Säge und Puls sind gegenphasig im Grundton; die gleichleistungsgemäße
   Blende hatte −6 dB (M-EINBRUCH). **Behoben:** die neue Welle startet mit ihrem Grundton in Phase (`wavePhi`); alle 12
   VA-Wellenwechsel ≤ 0,2 dB.
4. **FP-DSP · Stumm-Rampe 10 ms** an einem hellen Modulator: in der Grenzlage von M-KLICK. **Behoben:** 30 ms.
5. **FP-DSP/FP-IPHONE · Schlechtester Fall mit Schleife 15,7 % je Spur** (> 12 %). **Behoben** nach K2-42: > 12 Kanten →
   6 Stimmen, Grund in der Hinweiszeile; `fmxRenderPS` zusätzlich mit vorbereiteten Arrays (≈ 3 % schneller).
6. **FP-TOUCH (M-PLATZ) · Hinweiszeile über den Fadern** auf 375 × 667 und 320 × 568 (betraf schon den V0d-Hinweis
   „Kompatibel …“ im ECO). **Behoben:** einzeilig, nimmt dort die Zeile der kleinen Hüllkurvenbilder, Fader min. 40 px.
7. **FP-DSP · Last während der 30-ms-Blende ×2,1** (Spec: höchstens doppelt). **Begründet** (Abweichung 1).

### Abweichungen von der Spec

1. **V4a-11 Last ×2,1 statt ×2** während der 30 ms (Node, Rechenzeit je Block; der Block mit der Stimmen-Kopie ×2,4 bzw. ×3,0
   bei einem FM-Graph mit `fmxCompile`). Der Geist rechnet seine eigene Steuerung (LFO, Mod-Matrix, Hüllkurven); 6 gewöhnliche
   Stimmen statt 3 + 3 im Geist kosten ×1,87. Ein zweiter Wechsel während der Blende startet keinen zweiten Geist (wartet).
2. **K2-42 angewandt:** „mehr als 12 Kanten → 6 Stimmen“ gilt jetzt (der Messwert 15,7 % lag über 12 %). Gezählt werden nur
   Kanten (nicht Feedback-Wege), wie in K2-42 formuliert; DX-Algorithmen haben höchstens 5 Kanten.
3. **Mipmap-Bandbreite:** beide Nachbarstufen sind aliasfrei; dafür reicht der obere Teilton je nach Lage nur bis fs/4 … fs/2
   (12–24 kHz bei 48 kHz). KD §6.4 „Aufbau beim ersten Gebrauch“ → beim Laden des Moduls (FP-IPHONE 1).
4. **`lfoAm` / `lfoFm` Skalen** (die Specs nennen keine): `lfoAm` 127 = 24 dB Absenkung am LFO-Tiefpunkt (linear in 0…127),
   `lfoFm` nach der msfa-PMS-Kurve, 127 = ±12 HT. DX-tauglich verlangt zusätzlich `lfoFm` ∈ {round(127·p/7)}, damit
   fm6 ↔ fmx verlustfrei hin und zurück geht (KP §6.4 nennt nur „bei allen OP gleich“). `fmxFromFm6` bildet `pms` auch
   dann ab, wenn der Sound die vom .syx-Import angelegte Route `lfo1→pitch` hat (doppeltes Vibrato bei der Umwandlung eines
   Import-Klangs ins FELD; V4b muss die Route dabei entfernen); der Import speichert AMS/PMS nur bei AMD/PMD > 0.
5. **`vs` negativ** = gespiegelte DX-Kurve (Anschlag 1,0 bei `vs` −7 so leise wie Anschlag ≈ 0 bei +7; N7F-07 misst +76 dB).
6. **Nativer Rückfall nicht DX-tauglicher Graphen:** `p.fm6` ist der nächste DX-Algorithmus des aktuellen Graphen (mit den
   aktuellen Werten), nicht „der letzte DX-taugliche Stand“ (KP §6.3) – klingt näher am Graph und deckt Graphen ab, die nie
   DX-tauglich waren (Spec 9.3 / V4a-07 verlangen den nächsten Algorithmus).
7. **Bearbeiten auf den DX-Seiten** eines Sounds mit `p.fmx` baut `p.fmx` aus fm6 neu (ein nicht DX-tauglicher Graph geht
   dabei in seinen nächsten DX-Algorithmus über). KP §4.12 sperrt die DX-Seiten dann – das kommt mit V4b.
8. **Größe +54 KB** statt +48 KB (eigene DX-Tabelle im Modul `FMX`, damit es vor SQStore stehen kann; Kommentare).
9. **M-KLICK-Messung** wie in den V0b-fix-Werkzeugen (Hochpass 4. Ordnung, Fenster unter −80 dB werden nicht beurteilt);
   M-EINBRUCH misst das Loch gegen den leiseren der beiden Klänge (ein neuer, leiserer Klang ist kein Loch). Für
   Wellenwechsel klingen D5 + G5 (bei A3 + E4 enthält manches 2-ms-Fenster keine Sägezahn-Flanke und gewinnt den Median).

### iPhone-Prüfpunkte (Xander)

V4a hat noch kein FM-Feld (kommt mit V4b); auf dem Gerät prüfbar ist nur, dass nichts schlechter wurde:
1. FM-Pluck, FM-Bässe und E-Piano klingen wie vorher (der fm6-Weg ist bitgleich).
2. Eine VA-Fläche halten und im Editor die Welle (Säge → Puls → Dreieck) wechseln: kein Knacken, kein Loch.
3. Einen FM-Sound halten und den Algorithmus wechseln: weich überblendet, kein Aussetzer.
4. Eine .syx-Bank importieren: Klänge wie vorher.

### Bekannte Lücken

- **Punkt-Form-Hüllkurven** (`f:'pt'`) werden gespeichert und normalisiert, klingen aber erst mit V4f; bis dahin rechnet das
  Worklet eine grobe DX-Näherung daraus (nicht über die Oberfläche erreichbar, nur per `setFmx`). Ebenso Tonhöhen-Bereiche
  außer `'dx'` (V4f) und eigene Wellen 12–47 (V4e: bis dahin Sinus).
- Kein FM-Feld (V4b); `fmxLvWant`/`fmxLevelWatch` warten auf die Sichtbarkeit des Felds.
- Solo (`fmSoloPatch`) eines Graphs: alle Operatoren einzeln als Ausgang, nur der gewählte an (Oberfläche kommt mit V4b).
- Die DX-Seiten zeigen bei einem nicht DX-tauglichen Graph den Näherungs-Algorithmus ohne Sperre (V4b, KP §4.12).
- Kein WebKit-/iPhone-Test (Chromium und Node); iPhone-Faktor der CPU unbelegt.
- Chromium-Lastwerte (`engineInfo().perTrack[i].load`) schwanken von Lauf zu Lauf um ±40 %; der Vergleich vor/nach V4a
  stützt sich auf die Node-Messung (`v3-v4a-bench.mjs`, bester von 5 × 10 s).

---

## V4b — FELD und Wertefeld (FM-Feld nach EssenceFM) · App 3.9.0

Grundlage: Nachtrag 2 Teil A (A.2, A.3, A.6 Zeile V4b, A.7 N2-4b-01 … 04, K2-01, K2-37 … K2-44, K2-61) mit `r7/kodamo-delta-pdf.md`
(KP §4.1–4.9, 4.12, 4.13, §5, §6.4/6.5, §7, §9 N7F-13 … N7F-36); Nachtrag 1 A.7 (N4b-01 … N4b-04); Spec v3 §9.4/§17 V4b nur, wo KP
nichts ändert (V4b-07b, -08, -09, -13). Gebaut auf `synq-snapshots/V4a-fix.html`. Die Fähigkeiten-Summe ändert sich nicht.

### Gebaut

**FM-Reiter-Unterseiten FELD · DX · OP n · MAKRO · STIMME** (N4b-01, KP §4.12). DX ist die bisherige ALGO-Seite. Neue Sounds,
INIT FM und Klänge mit Graph öffnen FELD, Werks- und Bibliotheks-Sounds ohne Graph (auch .syx-Importe) DX; die letzte Wahl je
Spur steht in `S.ui.fmv` (Ansichtsfeld, nicht im Sound; `syncUi` trägt es mit). Ist der Graph nicht DX-tauglich, sind DX und OP
gesperrt: Überlagerung mit Badge, den Gründen aus `FMX.dx().reasons`, [Im FELD bearbeiten] und ggf. [Nummern angleichen].

**FELD (KP §4.1–4.4, §5):** Raster 6 × 6, Reihe 0 = Ausgang, freie Plätze; Kachel mit Nummer, Frequenz (≤ 4 Zeichen: „×1“, „×3,5“,
„14“, „62“, „437“, „9,8k“), zweiteiligem Pegelbalken (Fläche bis `ol` 45 %, 2-px-Marke, Live-Teil) und Feedback-Badge (Quellnummer,
bei Stärke 0 blass); Farben nach KP §4.3 mit K2-01 (#5B6170), OP 6 mit Halo #3A3F52 und #8A90A8; Linien unten-Mitte → oben-Mitte
#0AFFAD, vom stummen Modulator #3E435B; Linien-Animation nur beim Verbinden 200 ms (K2-41; Schalter, aus bei „Bewegung
reduzieren“); Boden „AUSGANG“. Kopfzeile „STIMME · DX 5 ✓ · 6 Op · 8 St“ bzw. „OP 4 · MODULATOR → 3 · ×14“ (Tipp = DX-Abgleich
im LCD). Geometrie P1 genau nach KP §5.1 (Kacheln 36 × 50 bei x = 40·c, y = 23 + 55·(5 − r); Wertefeld x 242–373, Zeilen
y = 76 + 47·i), L1 nach §5.2 (48 × 31, Reihenabstand 34, 4 Reihen sichtbar, Rollen per Wischen im Leerraum und Randzug, Streifen
„▲ n weitere“), P2/P3/L2/W nach §5.3 (P3: Werte als Blatt über den rechten 60 % des Felds, ✕ schließt).

**Gesten (KP §4.5, rein in `FMX.gesture`, gleiche Logik für Touch und Test-API):** R1 Aufsetzen wählt sofort (aus dem Zustand
Stimme → Basis; zwischen Operatoren bleibt die Seite, K2-61) · R2 Tipp ins Leere → Pegel-Seite · R3 Doppeltipp (≤ 300 ms, ≤ 8 px)
stumm/an · R4 Ziehen ab 8 px mit Geist, gestrichelter alter Zelle, Landeplatz und Geisterlinien, LCD-Vorschau („3 → 1 verbinden“,
„4 ↔ 3 tauschen“, „5 fällt → Ausgang“, „2 fällt auf 6 (moduliert 6)“, „geht nicht: …“, „kein Platz über 1“, „zurück“), Ziel =
Zelle unter dem Geist-Mittelpunkt (KD §5.2 Nr. 1), 8 px Hysterese, `haptic('tick')` je Zielwechsel · R5 Tauschen (Kanten bleiben
an den Plätzen) · R6 Verbinden (untere Verbindungen lösen, über das Ziel, nächste freie Spalte c+1, c−1 …, oberer Baum wandert mit,
Abweisen nach (e)) · R7 Fallen (zum Boden oder auf den obersten Operator darunter) · R8 außerhalb / eigene Zelle = nichts ·
R9 zwei Finger (Beginn ≤ 300 ms, je ≤ 8 px): verbinden, nochmal lösen (Z7), gleiche Reihe / letzte Verbindung mit LCD · R11 Wischen
im Leerraum = nichts (L: rollt) · R12 Badge, Budget, LCD-Statuszeile; Strukturwechsel über die 30-ms-Stimmen-Überblendung aus V4a.
R0: Eine Berührung im FELD, während ein Zug im Wertefeld oder Hüllkurven-Graph läuft (auch wenn der Finger schon vorher lag), ist
nur FEIN ×¼. Halten wählt nur (R10 entfällt). Jede Geste ist genau ein Undo.

**Wertefeld (KP §4.7, Schieber nach K2-38):** Reiterblock P 2 × 3 an fester Stelle: ohne Auswahl [Pegel] [Stimme] [⋯] / [Vorl. ▾]
[Zufall] [A│B], mit Auswahl [Basis] [Amp] [M] / [Mod] [Tonh.] [⋯]; L in der Kopfzeile (Rolle + Reiter, ohne Auswahl Badge-Text).
- Waagrechter Relativzug: 4 px Totzone, danach folgt die Füllkante genau dem Finger (Modulator-Pegel in der V0d-Kurve
  p = (OL/99)^(1/0,45), Ausgänge linear), FEIN ×¼ (ruhender Finger im FELD oder FEIN-Chip), senkrecht ≥ 12 px = kein Wertzug,
  Pointer-Capture, ein Undo je Zug; Tipp auf die Wertzone (30 px) = Ziffernblock (setzt exakt, ein Undo); Doppeltipp auf bipolare
  Werte = Mitte.
- **Pegel:** 6 zweizeilige Zeilen „×14 · I 1,6“ / „×1 · −3 dB“ (−∞ dB bei 0), Balken in OP-Farbe, Fahne 12 px mit Nummer.
- **Stimme:** Transponieren · DX-Abgleich mit [Nummern angleichen] · Budget „6 Op · 8 Stimmen · Kanten n“ · ☑ Frequenzen in Kacheln ·
  ☑ Linien-Animation · ⓘ Vorbild (einzige Stelle mit dem Gerätenamen und dem Pflichtsatz) und Hilfe.
- **Basis:** Welle (8 px je Welle, Vorschau, Tipp = Liste mit Bildern) · Pegel · Verhältnis (oben [×│Hz] + fine, unten coarse;
  Ziffernblock nimmt Verhältnis oder Hz) · Verstimmung · Phase (Chip Fest/Zuf./Frei + `ph`) · Feedback (Chip „← Quelle“ mit Liste
  aus/1…6, Stärke 0…7 in 0,1).
- **Mod:** Anschlag −7…+7 · LFO AM · LFO FM · Tasten-Skalierung als Kurve (links/rechts senkrecht = `ld`/`rd` mit Vorzeichen,
  Mitte waagrecht = `bp` mit Notenname; lin/exp über ⋯).
- **Amp / Tonh. (EK-13, DX-Form bis V4f):** P1/P2 Mini-Feld links (Kachel 20 × 42, nur Tipp/Doppeltipp/Tipp ins Leere), Vorlagen-
  Zeile Snap/Pluck/Pad/Orgel bzw. Aus/Ruck/Fall/Anstieg + FEIN über dem Feld, rechts Graph (log. Zeitachse Halten ┊ Release, Punkte
  ziehen: waagrecht = Zeit/Rate, senkrecht = Pegel, ein Undo), Zeiten-Zeile, Knöpfe [Alle Mod.] [Alle Ausg.] [Kopieren] [Einfügen] /
  [Auf alle] [Init] [−1] [+1], DX-Zeilen R1–R4 / L1–L4 (Relativzug 2 px je Schritt, Tipp = Ziffernblock). L/W: im Wertefeld mit
  [DX ▾] [FEIN] [Vorl. ▾]; P2/P3 kompakt ([DX ▾] tauscht Graph und DX-Zeilen). Tonh. bearbeitet `pit` dieses Operators
  (50 50 50 50 = keine Hüllkurve); feste Operatoren ohne Tonhöhen-Hüllkurve (DX).
- **M** = stumm (= R3). **⋯:** Solo (Laufzeit, nicht gespeichert) · Ziele … (Liste „→ 1 ✕“, [+ Ziel] + Tipp auf eine tiefere
  Kachel; ✕ auf der letzten Kante → fällt nach R7) · Kopieren (Operator ohne Zelle/Kanten bzw. nur Hüllkurve) · Einfügen ·
  ⤢ Hüllkurve groß (Amp/Tonh., K2-44) · Kurven lin/exp (Mod) · Modulieren mit … (Mod-Picker `op<k>`, Z13: Quelle wählen = Route
  mit 50 %, Tiefe im Tab MOD) · Mehrere wählen (N4b-02: Pegel-Zug relativ auf alle gewählten, ein Undo) · Hilfe.
- **Vorlagen ▾** (Algorithm Library): das WP7-Blatt mit 32 Bildern; Wahl ersetzt Kanten, Plätze (`dxLayout`) und Feedback-Weg
  (stärkster bisheriger Wert wandert zum neuen Empfänger), alles andere bleibt, ein Undo.
- **Zufall** (K2-59): ☑ Frequenzen ☑ Hüllkurven ☑ Tonhöhen-Hk. ☑ Algorithmus ☑ Pegel ☑ LFO ☑ Wellen (Z19, aus) + [Würfeln];
  Ergebnis erfüllt I1–I4 und hat einen Ausgang mit `ol` ≥ 80; Häkchen werden gemerkt; ein Undo.
- **A│B** (Z8, V4b-09): wechselt zwischen jetzt und dem Stand vor der letzten Geste (über die Stimmen-Überblendung, kein Undo).

**⤢ Hüllkurve groß (K2-44):** öffnet den A.4b-Editor (OP › HÜLLK. bzw. HÜLLK. › TONHÖHE) für diesen Operator, [✕ FELD] führt
zurück (Seite und Fokus wie vorher). Die DX-Seiten bearbeiten `p.fm6`; neu trägt `fmxAfterFm6Edit` geänderte Werte in den Graph
zurück, solange der Algorithmus gleich bleibt (Zellen, Wellen, Phasen, Feedback-Wege und `pit` je Operator bleiben; ein genäherter
fm6 trägt dazu seine Nummerierung `perm`). Tonh. schreibt nur `pit` dieses Operators.

**Weiteres:** Live-Pegel der Kacheln mit ~30 Hz nur, solange das FELD sichtbar ist (Blatt offen, Seite sichtbar; `fmxLvWant`).
LCD-Hinweis beim ersten Antippen von Feld, Pegel-Seite und Badge; Hilfe-Zeilen 1–7 (KP §4.6 + K2-43) im Menü › Hilfe.
`FMX.dxMatch`/`approxFm6` merken sich die Struktur-Suche (der Fehlfall kostete 25 ms je Aufruf; jetzt einmal je neuer Struktur).

**Test-API (KP §7):** `fmxView(t)` (Zustand, Fokus, Seite, Kacheln mit Box/Rahmen/Füllung/Balken/Text, Linien, Reiter, Wertzeilen,
Badge), `fmxPreview(t, g)`, `fmxGesture(t, g)` (`drop`/`two`/`dtap`/`tap`, gleiche Logik wie Touch, ein Undo), dazu `fmxOpen(t, page,
op)`, `fmxBadge(t)`. `setFmxOps` entfällt (K2-37).

### Abnahme (V4b: N7F-13 … N7F-36 ohne N7F-30, N2-4b-01 … 04; Spec V4b-07b, -08, -09, -13 nach N7F-36)

Tests (alle in `dirigent-test/`, Ausgaben in `dirigent-test/v3-v4b/`): `v3-v4b-logic.mjs` (Gesten-Logik in Node, 26/0),
`v3-v4b-field.mjs P|L` (CDP-Touch in Chromium, P 106/0, L 101/0), `v3-v4b-node.mjs` (Worklet-Shim, M-KLICK/M-EINBRUCH, 15/15),
`v3-v4b-platz.mjs` (M-PLATZ P1–P3, L1, L2, W, 59/0), `v3-v4b-view.mjs` (FELD/DX-Wahl, 3/0), `v3-v4b-perf.mjs` (4/0),
`v3-v4b-shots.mjs` (Bildschirmfotos). Bildschirmfotos: `v3-v4b/field-P/`, `v3-v4b/field-L/` (Handbuch-Ablauf a1–a6, Farben,
Vorlagen 1/5/16/22/32, DX gesperrt, ⤢ groß), `v3-v4b/platz/` (jede Seite in jeder Größe).

| Punkt | Messung | Ergebnis |
|---|---|---|
| N7F-13 | P1: Feld 236, Wertefeld x 242–373, Kacheln 36 × 50 bei x = 40·c, y = 23 + 55·(5 − r), Wertzeilen y = 76 + 47·i; Reiterblock auf Pegel/Basis/Amp an derselben Stelle; Amp: Mini-Feld 20 × 42 in x 0–131, Hüllkurve ab x 138. L1: 48 × 31 bei y = 10 + 34·(3 − r), Wertefeld ab x 320; Kette über 6 Reihen: 4 sichtbar, „▲ 2 weitere“, Wischen rollt. M-PLATZ P1–P3, L1, L2, W: nichts außerhalb der Seite, kein abgeschnittener Text, kein Scrollen des Körpers | bestanden (±1 px) |
| N7F-14 / V4b-01 | alle 32 Vorlagen (P und L): Badge „DX k ✓“, keine Überlappung, alles im Feld | 32/32 |
| N7F-15 | alle coarse/fine-Kombinationen und festen Frequenzen ≤ 4 Zeichen, Textbreite ≤ Innenbreite (P1 28 px); „×1“ „×3,5“ „14“ „62“ „437“ „9,8k“; Schalter aus → keine Zahl | bestanden |
| N7F-16 / N2-4b-01 | computed style: Pegel-Seite Rahmen = OP-Farbe; Stimme alle #5B6170; Auswahl #0A6E5B/#0ACA9F, andere #5B6170; stumm #3E435B; Linien #0AFFAD bzw. #3E435B; Kontraste Marke ≥ 3:1, Fahne ≥ 4,5:1. Pixelproben DPR 2 (P und L) ±8 | bestanden |
| N7F-17 | Linien aller 32 Vorlagen: Anfang/Ende ±1 px; Animation 200 ms an, Schalter aus = keine | bestanden |
| N7F-18 / K2-61 | Aufsetzen auf OP 4 → Fokus 4 vor dem Loslassen, Seite Basis; zwischen Operatoren bleibt Mod; Tipp ins Leere → Pegel, kein Undo | bestanden |
| N7F-19 … N7F-21, N2-4b-03 | CDP-Touch ab INIT FM, P und L: 3 auf 1 (LCD vorher „3 → 1 verbinden“), 4 auf 3, 5 in (2,3) → „DX 5 ✓“, 2 fällt auf 6, Doppeltipp OP 1 stumm/an, Aufsetzen OP 4, Tipp ins Leere, Pegel-Zeile 2 +20 px; je ein Undo, Undo deep-equal | bestanden |
| N7F-21b | Node: DX 3 in 2, Paare in 3, DX 32 in 4, DX 5 in 1 Geste(n), Zellen/Kanten deep-equal | bestanden |
| N7F-22 | (a) 3 auf 6 abgewiesen „geht nicht: 6 moduliert schon 3 …“; (b) K2-42 5→2 + 4 in (2,0) → „geht nicht: 5 → 2 zeigt dann nicht mehr nach unten“; (c) außerhalb / eigene Zelle nichts; 400 Zufallszüge erfüllen I1–I4 | bestanden |
| N7F-23 / V4b-07 | zwei Finger 6 + 1 → 6→1, nochmal gelöst, gleiche Reihe + LCD, 500 ms → nichts; ruhender Finger im Leerraum → FEIN ×¼ im Wertefeld, Feld unverändert; R0 Finger auf Kachel 3 (1 s) → Fokus bleibt, kein Picker, FEIN | bestanden |
| N7F-24 | Doppeltipp und [M] je ein Undo; ⋯ › Solo Laufzeit, nicht gespeichert | bestanden |
| N7F-25 / V4b-07b | Halten 1 s → nur Auswahl; 600 ms + 40 px → Zug mit Geist, kein Picker; ⋯ › „Modulieren mit …“ → Quellen für op4, LFO 1 → Route | bestanden |
| N7F-26 | P1: +45 px → Füllkante +45 (±1), −45, FEIN 40 → +10, 3 px / 30 px senkrecht unverändert, 0 → 99 in einem Zug, OL nach der Anzeigekurve, Marke ±1 px, Ausgang linear, Extremwerte ohne Überlauf, Kontrast 7,9:1; L1 mit ±½ OL-Stufe (Abweichung 4) | bestanden |
| N7F-27 / 27b | Welle 24 px → 3; fine oben / coarse unten getrennt; [×│Hz]; Ziffernblock ol 42, det −3, ph 64, fbAmt 2,5 (je ein Undo); Phase-Chip; Feedback-Quelle, Badge blass bei 0, weg bei „aus“ | bestanden |
| N7F-28 | Anschlag bipolar, Doppeltipp = 0; Tasten-Skalierung links/rechts mit Vorzeichen, Mitte bp mit Notenname | bestanden |
| N7F-29 | Ziele-Liste, [+ Ziel] + tiefere Kachel (Kante ohne `amt`), ✕, ✕ auf der letzten Kante → fällt zum Ausgang | bestanden |
| N7F-31 | Kopieren/Einfügen ganzer OP; Vorlagen-Blatt (DX 5, Werte gleich); Zufall 50 Würfe mit/ohne ☑ Algorithmus | 50/50 · 50/50 |
| N7F-32 | Modulator D1 fallend, gehaltene Note: Live-Teil 50 ms nach dem ersten Pegel ≥ 1,3 × bei 1 s (P 35 / 2,3 px, L 18,4 / 1,4 px); ≥ 10 Aktualisierungen je s; nur bei sichtbarem FELD | bestanden |
| N7F-33 / N4b-01 | Badge „DX k ✓“ / „wie DX k – Nummern anders“ / „kein DX: Welle“ / „kein DX-Alg. · nächster: k“; [Nummern angleichen] → ✓, ein Undo; FELD ↔ DX ändert weder fm6 noch fmx; DX gesperrt bei nicht tauglichem Graph; INIT FM öffnet FELD, Werks-Sound DX, Wahl je Spur gemerkt | bestanden |
| N7F-34 / V4b-11 | Worklet-Shim, eine gehaltene Note: Verbinden, Tauschen, Fallen, Zwei Finger, Doppeltipp (Modulator/Ausgang), Vorlage DX 1 → 5/32/16, jeweils auch A│B zurück: M-EINBRUCH −0,7 … 0,3 dB; M-KLICK 5,0 … 5,9 dB, Tauschen 14,1 / 12,2 dB (Abweichung 1) | 15/15 |
| N7F-35 | Hilfe-Zeilen 1–7 im Menü; LCD-Hinweis beim ersten Antippen von Feld, Pegel-Seite, Badge | bestanden |
| N7F-36 | V4b-07b, -08, -09 (A│B), -13 (WP7-Diagramm-Tests `wp7-accept ui/pr1` bestehen auf dem Vorlagen-Blatt); N4b-01 … 04 (N4b-02: 3 Modulatoren +Δ relativ, ein Undo stellt alle her); V1d-02 entfällt bis V1d (K2-03) | bestanden |
| N2-4b-02 | weder „Kodamo“ noch „EssenceFM“ in LCD, Hilfe, Beschriftungen; nur im ⓘ mit Pflichtsatz | bestanden |
| N2-4b-04 | P1, OP 4, Amp → ⋯ › ⤢ Hüllkurve groß → A.4b-Editor für OP 4; Punkt ziehen → `getFmx` OP 4 geändert, ein Undo; [✕ FELD] → Amp, Fokus 4, Mini-Feld | bestanden |

**Regression:** `v3-v4b-reg.sh` (Liste von V4a, Versions-Kopien `v3-v4b-adapt-*` für 3.9.0; Ausgaben `v3-v4b-reg/run1`, Nachläufe
`v3-v4b-reg/run2` mit `v3-v4b-reg2.sh`). Gescheitert sind nur die schon in V4a gleich scheiternden Prüfungen (`node-fm` 1,
`v3-v0b-adapt-wp3-browser` 3, `v3-v0b-adapt-wp3-ui` 2, `wp3-adapt-func-build` und `-native` je 2 (C2, D5), `wp4-offline` 2) und drei
beabsichtigte Änderungen mit neuen Anpassungen: `v3-v4b-adapt-v0b-ux` (V0b-09 „kein Etikett heißt Pegel“ gilt nicht für die
FELD-Seite, KP §4.7), `v3-v4b-adapt-wp1-brand` (Kopf „SYNQUENZER 3.9“), `v3-v4b-adapt-wp3…wp7-dod` (Dateigrenze 5,0 MB nach EN2-28
statt 1,5 MB aus v2) – alle bestanden. V0d-Suiten `eng1`, `eng2`, `sounds`, `fm-sound`, `migr`, `band`, `ui-a…d`,
`v3-v0dfix-adapt-v0d-native` bestanden (V0d-2-09 L lief erst 2 px über: fünf Unterreiter ließen der LCD-Zeile weniger Platz →
Unterreiter in L kompakter, danach 51/0). V4a: `v3-v4a-node` 4/4 (V4a-11 einzeln; im Parallel-Lauf Last ×2,25), `v3-v4a-ui` 23/0
(einzeln; N7F-10 10,2 %), `v3-v4a-shot` 10/0. `v3-qareg-v4a-fmxio` (QA-Lauf der V4a-Prüfer, Version auf 3.9.0 angepasst) scheitert
an „klingt wie vorher“ – genauso auf `V4a-fix.html` (der erste Mitschnitt nach dem Audio-Start ist 1,5 dB lauter); keine Folge von
V4b. DoD bestanden. Smoke-Test: Titel SYNQUENZER, keine Fehler. Worklet-ASCII-Prüfung bestanden (116,7 KB, unverändert).
Dateigröße 1 657 636 Byte (+117 KB gegenüber V4a-fix; Budget 95 KB, +23 %: Wertefeld mit fünf Seiten, Hüllkurven-Ansicht EK-13,
Ziffernblock, Test-API).

### Fach-Prüfung (Teil J: FP-TOUCH Haupt-Blick, FP-DSP Zweit-Blick; V4b ist blockierend ●)

Kein eigener Prüf-Agent verfügbar: beide Checklisten (J.2) selbst über Diff, Testausgaben, M-PLATZ-Skript und Bilder abgearbeitet.
12 Befunde, 10 behoben, 2 begründet:
1. **FP-TOUCH · Touch-Anpassung (Chromium/Android) lenkte Züge auf Etikett oder Chip** (Balken waren keine Tipp-Ziele). Behoben:
   Balken sind eigene Tipp-Ziele.
2. **FP-TOUCH · R0 nur in einer Reihenfolge:** Ein Finger, der schon im Feld lag, bevor der Zug im Wertefeld begann, wirkte nicht als
   FEIN (und hätte beim Heben „Tipp ins Leere“ ausgelöst). Behoben: er wird beim Zugbeginn zum FEIN-Finger.
3. **FP-TOUCH · Wertefeld-Ebene lag über der Hüllkurve** (L1 und P1 rechts): Punkte und Knöpfe nicht erreichbar. Behoben.
4. **FP-TOUCH · P2: 6. Wertzeile mit dem iOS-Schutz (touchstart preventDefault) nicht erreichbar.** Behoben: die Liste darf senkrecht
   rollen (Abweichung 2).
5. **FP-TOUCH · abgeschnittene Texte** („Stimme“, „Alle Mod.“, „×4,5“, „Anstieg“, Budget-Zeile, Tasten-Skalierung) in P1/P2/L.
   Behoben (Schriftgrößen, zweizeilige Knöpfe, kürzere Anzeigen); das M-PLATZ-Skript prüft es jetzt in allen Größen.
6. **FP-TOUCH · W (Tablet): Mini-Feld mit NaN-Geometrie.** Behoben: W zeigt die Hüllkurve im Wertefeld wie L (KP §5.3).
7. **FP-TOUCH · P3: Frequenz in den Kacheln unsichtbar; ✕ verdrängte einen Reiter.** Behoben.
8. **FP-TOUCH · fmxOpen setzte den Fokus ohne die DX-Seiten nachzuführen** („OP 1“ im Unterreiter bei Fokus 2). Behoben.
9. **FP-DSP · Struktur-Suche bei jeder Wertbewegung** (`dxMatch`/`approxFm6` 25 ms im Fehlfall, über 720 Nummerierungen). Behoben:
   gemerkt je Struktur; Wertzug jetzt Median 1,2–1,4 ms, Geste 4,5–5,1 ms (Spitze 10 ms, Xeon).
10. **FP-DSP · Live-Pegel liefen weiter bei geschlossenem Blatt** (das FELD bleibt im DOM). Behoben: nur bei offenem Blatt und
    sichtbarer Seite (N7F-09).
11. **FP-DSP · Tauschen: M-KLICK 14,1 dB** (Abweichung 1). Begründet.
12. **FP-TOUCH · [A│B] steht nur im Reiterblock ohne Auswahl** (KP §4.7): nach einer Geste ist der Operator gewählt, erst Tipp ins
    Leere. Begründet (KP-Layout); Rückfrage beim Gerätetest.

### Abweichungen von der Spec

1. **N7F-34 Tauschen:** M-KLICK 14,1 dB (zurück 12,2 dB), M-EINBRUCH 0,3 dB. Der Tausch 4 ↔ 3 macht aus dem Klang einen um 15 dB
   helleren (OP 3 mit OL 99 wird Modulator); die 2-ms-HF-Fenster steigen in der 30-ms-Blende. Eine ideale Überblendung der beiden
   Klänge allein (offline, gleichleistungsgemäß) zeigt schon 11,4 / 11,6 dB: der Detektor sieht den Klangfarben-Sprung, keinen
   Knack. Kriterium im Test: M-KLICK besteht oder liegt ≤ 3 dB über der idealen Überblendung. Alle anderen Gesten ≤ 5,9 dB.
2. **P2 (375 × 667):** die 6. Wertzeile erreicht man durch senkrechtes Rollen der Liste statt über ‹ › (KP §5.3).
3. **„Pegel“ als Etikett** auf der FELD-Seite (Reiter, Basis-Zeile) gegen V0b U-04 („kein Etikett heißt Pegel“): KP §4.7 (Nachtrag 2)
   hat Vorrang.
4. **N7F-26 in L1:** `ol` ist ganzzahlig; bei 200 px Balken ist eine OL-Stufe oben bis 3,3 px breit. Toleranz dort ±1 px + ½ Stufe.
5. **N7F-32** wird ab dem ersten gemeldeten Pegel gezählt (Audio- und Nachrichten-Latenz im Headless-Chromium ≈ 100 ms).
6. **Modulieren mit …** wählt die Quelle und legt die Route mit 50 % an; die Tiefe stellt man im Reiter MOD (kein Tiefen-Zug im FELD).
7. **Mehrere wählen** wirkt auf den Pegel-Zug (N4b-02: relativ); Verhältnis-Raster (V4c) und Hüllkurve „absolut auf alle“ für die
   Auswahl fehlen – Hüllkurven gehen über [Alle Mod.]/[Alle Ausg.]/[Auf alle].
8. **L1 Randzug beim Ziehen** rollt eine Reihe je 350 ms statt 8 px je 50 ms (Reihen-Raster).
9. **DX/OP gesperrt** für nicht DX-taugliche Graphen (KP §4.12); ⤢ Hüllkurve groß öffnet trotzdem den A.4b-Editor, dessen Werte
   über die neue Rückführung `fmxAfterFm6Edit` (mit `perm`) in den Graph gehen.
10. **Größe +117 KB** statt +95 KB (+23 %, unter der 50-%-Regel).
11. **M-REKON:** `S.ui.fmv` ist ein Ansichtsfeld; `HIST.volatile` gibt es erst mit VC2a – VC2a trägt `fmv` dort ein.
12. Die Spec-v3-Punkte V4b-02 … -06, -07, -10, -11, -12 (Zonen, Schiene, Parkplatz, [+], Anfasser) sind nach KP N7F-36 ersetzt.

### iPhone-Prüfpunkte (Xander)

1. FM-Spur, ⋯ → Init (INIT FM): FM öffnet FELD – unten die Ausgänge 1 und 3, darüber 2 und 4–5–6, rechts die Pegel-Seite in denselben Farben.
2. OP 3 auf OP 1 ziehen → verbunden (das Feld zeigt es schon vor dem Loslassen); OP 4 auf OP 3 → Plätze getauscht; OP 5 ins Leere
   rechts → fällt nach unten, oben „DX 5 ✓“.
3. Doppeltipp auf einen Operator → stumm (grau), nochmal → an.
4. Operator antippen → rechts Basis/Amp/Mod/Tonh.; Pegel waagrecht ziehen (kein Sprung), Tipp auf die grüne Zahl = Ziffernblock.
5. Amp: links das kleine Feld, rechts die Hüllkurve; Punkte ziehen; ⋯ → „⤢ Hüllkurve groß“ und „✕ FELD“ zurück.
6. Zwei Finger gleichzeitig auf OP 6 und OP 1 → zusätzliche Linie; nochmal → weg.
7. Querformat: Feld links, Werte rechts; eine lange Kette rollt mit einem Wisch im leeren Feld.
8. Kleines iPhone (375 × 667): die Werte-Liste rechts rollt senkrecht; waagrecht ziehen ändert den Wert.

### Bekannte Lücken

- Punkt-Form-Hüllkurven, Tonhöhen-Bereiche, Punkt-Knöpfe (V4f); Vorhersage, Raster, [DX-tauglich machen], .syx-Export (V4c).
- Kein WebKit-/iPhone-Test (Chromium mit CDP-Touch, Node); iOS-Rollen der P2-Liste und Haptik nur im Code geprüft.
- Feld-Gesten erscheinen erst mit VC2a im Verlauf (N2-C2a-01); PAD-R1 (N2-1d-01) und die Mod-Pfade `fmx.<k>.…` (N2-5d-01) kommen mit
  V1d bzw. V5d.

## V4b-fix — FELD: Ziehen, Rollen, FEIN, Rückweg, LCD, P3-Blatt, Sicht FELD/DX, Pegel 0 · App 3.9.0

App: `dirigent-wt/index.html`, Snapshot `synq-snapshots/V4b-fix.html`. Neun bestätigte Befunde der V4b-Prüfung behoben;
Tests mit echter Schrift (Seite über http, Barlow/JetBrains geladen: `dirigent-test/v3-v4bfix-lib.mjs`).

- **Ziehen auf die Nachbarkachel (KD §5.2 Nr. 1, R4):** der Geist hängt am Aufsetzpunkt (kein 8–20-px-Nachlauf); die
  8-px-Hysterese hält die alte Zelle nur noch, solange der Geist-Mittelpunkt nicht in der neuen Kachel liegt.
  `v3-qa4b-dbg2.mjs`, `v3-repro-ghostlag.mjs`: 4↔3, 2↔1, 5↔4, 6↔5 in P1–P3, L1, L2 bei 1–18 px je Bewegung, ein Undo.
- **P2/P3-Werteliste rollt per Finger:** `.fxv.scr` steht in der Ausnahme des Blatt-`touchstart`, Zeilen/Balken/Wertzone/Chip
  dort `touch-action: pan-y`; waagrecht bleibt Wertzug. Rollstand bleibt bei Neuaufbau derselben Seite. Feedback, Quelle,
  OP-6-Pegel, Hilfe erreichbar (`v3-v4bfix-p2row6.mjs`, `v3-v4bfix-scroll.mjs`).
- **R0 FEIN mitten im Zug:** Hüllkurvenpunkte, DX-Zellen R/L und Tasten-Anfasser setzen bei Faktorwechsel an Wert und
  Fingerort neu auf (wie die Wertbalken) – kein Sprung (`v3-qa4b-o.mjs`, `v3-repro-r0fine.mjs`).
- **⤢ Hüllkurve groß:** „✕ FELD“ ist jetzt ein eigener Unterreiter (OSZ: statt „FELD“, HÜLLK.: vorn), kein Knopf über der
  Seite; nichts verdeckt in P1–P3, L1, L2 (`v3-v4bfix-big.mjs`). Rückweg merkt FELD für die Spur.
- **LCD und Feldkopf schneiden nicht mehr ab (L6):** zu langer Text läuft zweizeilig (Etikett + Text, UI-Schrift 10,5 px);
  reicht auch das nicht, Laufschrift; Tipp aufs LCD zeigt den ganzen Text. Feldkopf ebenso zweizeilig
  (`v3-v4bfix-lcd.mjs`, auch Erst-Hilfe und Status nach der Geste).
- **P3:** Tipp (nach dem Doppeltipp-Fenster 300 ms) öffnet das Werte-Blatt, Aufsetzen nur wählt; ein Zug schließt das Blatt,
  Landeplatz und Ergebnis bleiben sichtbar; Doppeltipp = M ohne Blatt (`v3-v4bfix-p3.mjs`).
- **N4b-01 Sicht:** erste FM-Öffnung, Bibliothek, .syx und Spurwechsel zeigen die gemerkte Wahl der Spur, sonst deren Vorgabe
  (Werks-FM ohne Graph/.syx = DX, INIT/Graph = FELD) – nie die FELD/DX-Seite der vorigen Spur (`v3-repro-n4b01-view.mjs`).
- **Gesperrte DX/OP-Seite:** Gründe in L1/L2 in eigener Spalte rechts, in P3 bei Platzmangel zweispaltig; alle Gründe lesbar,
  Knopf frei, auch mit 6 Gründen (`v3-v4bfix-lock.mjs`).
- **Pegel 0 / [×│Hz] am gehaltenen Ton (L3):** Worklet: OL 0 eines fmx-Operators läuft über die 30-ms-Stummrampe statt harter
  Abschaltung; ein Live-Pegelsprung blendet die Verstärkung in 30 ms über; [×│Hz] zählt als strukturell (30-ms-Überblendung).
  Offline (gleiche Worklet-Quelle, App-Nachrichten): OP1 99→0 9,9 → 5,1 dB, OP2 78→0 15,2 → 5,1 dB, Chip Note 57 5,1 dB
  (Kontrolle 4,9). Rest: Chip bei Note 45 10,6 dB (vorher 24), dort liegt schon der ruhige Klang bei 7,9 dB.
  FM6-bitgleich unverändert (`v3-v4a-node.mjs` 46/46).

## V4f — EssenceFM-Hüllkurven (Punkt-Form) · App 3.10.0

Grundlage: Nachtrag 2 Teil A (A.5, A.6 Zeile V4f, A.7 N2-4f-01/-02, K2-39, K2-40 Zusatz N7F-42, K2-44, K2-45, K2-55 … K2-62) mit
`r7/kodamo-delta-pdf.md` (KP §4.11, §5.1 d, §5.2 c, §6.1/6.2, §7, §9 N7F-37 … N7F-48) und HK §3.7 (Handbuch S. 31–33). Gebaut auf
`synq-snapshots/V4b-fix.html`. Format und alte Projekte bleiben: `Env {f:'pt', …}` gab es schon im Schema (V4a), jetzt klingt es.

### Gebaut

**Klang (Worklet, `ptCompile` / `ptRun`, ASCII):** Punkt-Form für `amp` und `pit` jedes Operators, 2–6 Punkte, Segmentzeiten
0,5 ms … 20 s, blockgenau (16 Samples) mit Bruchteil-Blöcken.
- **Exp** fallend linear im DX-Pegelraum (dB-linear wie der msfa-Abfall); **steigend nach dem msfa-Anstieg** (Sprung auf −50 dB,
  +⌊17 − l/256⌋ je Schritt, K2-57) – dieselben Bänder wie der A.4b-Angriff, auf die Segmentzeit gestreckt; **Lin** amplitudenlinear.
  Tonhöhe: Exp linear in Halbtönen, Lin linear in Hz.
- **Sustain** hält bis zum Loslassen; **Skip** (nur mit Sustain): Loslassen vor Psus → sofort das Segment nach Psus ab dem
  aktuellen Pegel; ohne Skip läuft die Hüllkurve erst bis Psus und dann weiter.
- **Loop A/B:** an Plb weiter mit dem Segment nach Pla ab dem aktuellen Pegel (Periode = Summe der Schleifensegmente). Schleife
  vor dem Sustain (`la < sus`) läuft nur bei gedrückter Taste; danach weiter bis zur 12-s-Kappe (bestehende Regel `FM_MAXREL`).
- **Frei (FreeRun):** eine gemeinsame Hüllkurve je Spur und Operator (`this.fr`, nach Frames weitergezählt, auch zwischen den
  Noten), Start beim ersten Anschlag, ohne Loop erst nach dem Ende neu, Sustain aus; jede Stimme liest sie mit ihrem eigenen
  Pegel (Anschlag, Tasten-Skalierung).
- **Tonhöhen-Bereiche** Ton ±2, Quinte ±7, 1/2/4/8 Okt.; y 0/50/99 = −B/0/+B linear in HT; in der Punkt-Form auch an festen
  Operatoren (K2-58); `pr 'dx'` bleibt die A.4b-PEG.
- Time/Key (`rs`) und die MAKRO-Knöpfe wirken auch auf die Punkt-Form (HÄRTE Segment 1, RELEASE nach dem Sustain, LÄNGE übrige
  Segmente der Ausgänge, BISS Segmente 2/3 der Modulatoren), mit den Vorzeichen von `fmAdvance`.
- **Live-Änderung bei gehaltener Note ohne Sprung:** das laufende Segment geht vom aktuellen Wert mit dem Rest seiner neuen Zeit
  weiter; am Sustain-Punkt / am Ende 20-ms-Gleiten; DX ↔ Punkt-Form und Retrig ↔ Frei übernehmen den laufenden Stand.
- K2-62 (§15.2 Stufe 2): bei Begrenzer-Stufe ≥ 2 spielt ein Graph mit > 12 Kanten oder einer Schleife in der Punkt-Form höchstens
  4 Stimmen.
- **Nativer Rückfall (`DXN.voice`, opt.pt):** dieselbe Rechnung als Automations-Plan (fall/rise/hold/lin, Schleifen bis 12,5 s
  ausgerollt), Loslassen nach denselben Regeln, Tonhöhe als Hz-Versatz auf `frequency` (Rampen ≤ 10 ms). Dabei gefunden und
  behoben: ein End-`setValueAtTime` wenige ulp nach dem Start des nächsten Ereignisses beendete dessen `setTargetAtTime` (eine
  Schleife hielt nativ ihren Pegel) – das End-Ereignis entfällt, wenn das nächste dort beginnt.

**Daten (FMX):** `FMX.ptFromDx` wandelt eine DX-Form in Punkte mit den Zeiten, die sie spielt (Angriff ab 0, Haltephasen,
Release ab L3; ohne `rs` und MAKRO, die beide Formen gleich bekommen): P0 = Start, P1–P3 = L1–L3, Sustain 3, P4 = L4, Skip an
(die DX-Form verlässt ihre Stufe beim Loslassen sofort), Exp, Retrig; Tonhöhe mit dem kleinsten passenden Bereich.
`FMX.envAct` führt jede Editor-Aktion rein aus (add, del, sus, skip, loopA, loopB, unloop, crv, run, scale, center, range, set,
pt); eine DX-Hüllkurve wird dabei erst umgewandelt (A.5 Nr. 4, K2-60: auch [✗] und [Skip]). `normEnv` behält eine einzelne
Loop-Marke (A gesetzt, B folgt).

**Editor (KP §4.11, EK-13, K2-55 … K2-57):** FELD › Amp/Tonh. in beiden Formen:
- Punkt gewählt: [Sustain] [Loop A] [Loop B] [Loop weg] / [✗] [+] [Mitte] [☑ Skip] – [Loop weg] nur an einem Loop-Punkt,
  [Skip] nur am Sustain-Punkt, [Mitte] nur Tonh., [+] fehlt bei 6, [✗] bei 2 Punkten (und an P0); unsichtbare Knöpfe behalten
  ihren Platz.
- Nichts gewählt: [Exp│Lin] [Skala] [Retrig│Frei] [+] / [Alle Mod.] [Alle Ausg.] [Kopieren] [Einfügen]; Tonh.: [Bereich ▾]
  [Alle Mod.] [Kopieren] [Einfügen] (K2-56), [Alle Ausg.], [Auf alle] und [Init] unter ⋯.
- Graph der Punkt-Form: **eine** logarithmische Zeitachse (log(1 + t/0,5 ms) über die Gesamtlänge + 25 %), blaue Sustain-Linie
  #0A6AFF, violette Loop-Zone mit A/B, Punkte in den Reglerfarben, Lin gerade, Exp als Annäherungskurve; Punkt frei ziehen
  (x = Zeit seines Segments, y = Pegel), ein Undo je Zug; Tipp ins Leere = keine Auswahl; **Pinch** ×1…×8 (Abstand ≥ 12 px,
  Mitte bleibt stehen), ruhender zweiter Finger = FEIN.
- Fußzeile „Gesamt …“ bzw. „X … · Y …“ (+ „Zoom ×n“); **Warnchips** an Ausgängen: „endet nicht (Schleife)“ / „endet nicht bei 0“
  (Tipp = ganzer Satz im LCD).
- Wertzeilen P0–P5 (y, Relativzug 2 px je Schritt, Tipp = wählen, zweiter Tipp = Ziffernblock) statt R/L in der Punkt-Form.
- DX-Form im FELD rechnet jetzt nach A.4b (N7F-44): Klick-Grenze auf der Zeitachse (ein Zug ab der Grenze darf schneller),
  ein Pegelzug hält die Zeiten seiner und der nächsten Stufe (ggf. auf die Grenze angehoben), ganz rechts = R 0.
- Skala-Blatt: Zeit ×0,25…4, Höhe ×0…1,5, [Anwenden] = ein Undo.
- Größen: P1 nach §5.1 d (Graph 236 × 117 + Lineal, 2 Knopfzeilen, 2 Wertzeilen); L1/L2 Graph links, 3 Knopfzeilen
  ([DX-Zeile ▾]/[Punkte ▾] [FEIN] [Vorl. ▾] [Bereich ▾ bzw. Auf … ▾]); P2 eine Zeile mit [Loop ▾] / [Mehr ▾]; P3 drei Knöpfe mit
  Menüs.
- **⤢ Hüllkurve groß:** eine Punkt-Form-Hüllkurve öffnet den Punkt-Editor in voller Höhe (Kopf „OP n · … · Punkt-Form“, drei
  Knopfzeilen, Wertzeilen; auf kleinen Telefonen ohne Wertzeilen bzw. einzeilig); eine DX-Form den A.4b-Editor, dessen ⋯ (Tonh.:
  Knopf im Kopf) die „Punkt-Knöpfe …“ anbietet; „✕ FELD“ wie bisher.
- Hilfe-Zeile 8 zur Hüllkurve. Test-API: `fmxEnvAction(t, op, which, a)` (OP 1–6, ein Undo), `fmEnvView()` mit `form, sus, la,
  lb, skip, crv, run, zoom` (A.4b-Editor oder Punkt-Editor).

### Abnahme (Skripte in `dirigent-test/`)

- **`v3-v4f-node.mjs` 33/33** (Node-Shim des Worklets, 44,1 und 48 kHz):
  - N7F-37: 6 Punkte 0,5 ms … 1,5 s, Exp/Lin, höchstens 0,39 dB neben der Rechnung innerhalb ±(1 ms + 1 % t); 20-s-Segment 0 dB;
    K2-57 Exp 0 → 99 / 100 ms: nach 50 ms Pegel 77 von 99 (Abweichung 1).
  - N7F-38: Sustain ±0,000 dB über 2 s; Loslassen → Segment nach Psus; Skip an: sofort weiter, M-KLICK 0,8 dB; Skip aus: wie gehalten
    bis Psus (0,000 dB), dann Release.
  - N7F-39: Schleife vor Sustain Periode 70,00 ms (Soll 70 ±2 %), endet beim Loslassen; nach Sustain läuft weiter (6 s / 11,9 s) und
    endet an der 12-s-Kappe.
  - N7F-40: Frei – zweite Note folgt der laufenden Hüllkurve (0,00 dB), Sustain aus; Retrig – neue Hüllkurve je Note.
  - N7F-41: Zeit ×0,25 / ×4 genau, Höhe ×1,5 klemmt auf 99, ×0 = 0.
  - N7F-42: alle 6 Bereiche y 99/0/50 = +B/−B/0 (±0,03 HT); fest mit `pr 'dx'` −0,001 HT; fest mit 1 Okt. y 99 +12,00 HT; Welle 4,
    C4, +4 Okt.: gefaltete Energie −71,9 dB, M-KLICK 2,2 dB.
  - N7F-45 / N2-4f-01: [pt], [Skip], [+] an DX-Hüllkurven eines FM-Basses (Alg. 5, kurze Modulator-Hk., Noten 33/40/52) ≤ 0,09 dB
    (M-PEGEL 20 ms); ganzer Bass in Punkt-Form ≤ 0,21 dB (Noten 28–45); PEG [Fall] umgewandelt ≤ 0,42 dB.
  - N7F-48: Sound ohne Punkt-Form: fmx bitgleich zu fm6. LIVE: DX → Punkt → Sustain-Pegel → Lin → DX an gehaltener Note, M-KLICK
    besteht (kein Fenster über dem Boden).
- **`v3-v4f-native.mjs` 7/7** (Chromium OfflineAudioContext, `DXN.voice`): N7F-37 nativ Exp 0,27 dB, Lin 0,35 dB; Sustain/Release,
  Skip; Schleife 70,00 ms; Tonhöhe 1 Okt. +12,00 HT.
- **`v3-v4f-ui.mjs` 417/0** (CDP-Touch, echte Schriften, P1, P2, P3, L1, L2): N7F-43 Knöpfe je Zustand und Sichtbarkeitsregeln,
  Textbreiten (56/52 px), Fußzeilen, [Bereich ▾] nur ohne Punkt, Taps = `fmxEnvAction` (skip, unloop), ein Undo je Knopf, Undo →
  DX-Form deep-equal, Badge „kein DX: Hüllkurve“; N7F-47 P1-Geometrie (Hüllkurve x 138–373 ab y 76, Mini-Feld x 0–131, Graph 236 ×
  117 + 12), kein Scrollen, blaue Sustain-Linie ±0 px #0A6AFF, sus −1/Frei ohne Lücke, DX-Form mit Lücke, Treffer 18/16 px neben
  dem Punkt, Mini-Feld: Tipp wählt (Seite bleibt, K2-61), Ziehen ändert nichts; N7F-39 Warnchips (Schleife, letzter Punkt > 0, kein
  Chip am Modulator); Pinch 40 → 160 px = ×4, zu = ×1, Kappe ×8, Zoom in der Fußzeile, Werte unverändert; ruhender zweiter Finger
  = FEIN (40 px: 37 → 9 Schritte in P1); N7F-46 [Alle Mod.] [Alle Ausg.] Kopieren/Einfügen deep-equal, je ein Undo; N7F-41
  Skala-Blatt (Zeit ×2, Höhe ×0,5) ein Undo; N2-4f-01 [Exp│Lin] + Undo deep-equal; Punktzug ändert nur sein Segment; Wertzellen
  P0–P5 (Tipp wählt, Zug +10); N7F-44 Klick-Grenze (R4 ≤ 93, zweiter Zug 99), Pegelzug hält D1/D2 ±15 %, Vorlagen = T2; großer
  Editor: ⋯ › Punkt-Knöpfe › Lin → Punkt-Editor in voller Höhe, nichts verdeckt, „✕ FELD“ zurück auf OP 4 / Seite.
  `v3-v4f-cellfit.mjs` 20/0: Wertzellen passen in allen Größen (Tonh. „+7,6“).
- **N2-4f-02 CPU** (`v3-v4f-cpu.mjs`, Chromium-AudioWorklet, Xeon, Median von 10 s, 8 Tasten → 6 Stimmen nach K2-42): Punkt-Form mit
  Schleifen an allen 6 OP, Tonhöhe 8 Okt., 15 Kanten + 6 Feedback: 6,49 / 6,29 / 6,39 % je Spur (DX-Form 5,09 / 5,49 / 5,89 %);
  mit echter Feedback-Schleife (Sample-Pfad) 12,08 / 8,19 / 9,69 % (DX-Form 8,79 / 8,59 / 7,69 %) – Median der drei Läufe 9,69 %
  ≤ 12; der erste Lauf lag einmal 0,08 % darüber. Node-Bank (`v3-v4f-bench.mjs`): +1,6 % (Block-Pfad) bzw. +0,9 % (Sample-Pfad).
- **Regression:** `v3-v4f-reg.sh` (V4b-Liste, 99 Suiten, Versionskopien `v3-v4f-adapt-*` für 3.10.0): alle wie V4b-fix; die
  roten (`node-fm`, `v3-v0b-adapt-wp3-browser`, `-wp3-ui`, `wp4-offline`, `wp3-adapt-func-build(-native)`) haben dieselben
  FAIL-Zeilen wie im V4b-Lauf; `wp5-mod` MO44 (fps unter Last) allein grün, Versions-Suiten nach Korrektur der Kopie grün.
  `v3-v4f-reg2.sh`: V0d-Suiten 10/10 (V0d-2-01 … 20, N7F-48), `v3-v0dfix-adapt-v0d-native`, `v3-v4a-node` 46/46 (allein; im
  Lauf N7F-09 Mehrlast 0,32 % unter Last), `v3-v4a-ui`, `v3-v4b-field` P/L (L nach `data-n` an den Vorlagen-Menüpunkten wieder
  101/0), `-logic`, `-view`, `-platz`, `-node`, `v3-v4bfix-chip/-lcd/-lock/-p2row6/-p3/-scroll` grün. Wie schon auf V4b-fix rot:
  `v3-v4bfix-big` (prüft `.fxback`, das die Unterreiter-Klasse seit V4b-fix trägt; am Snapshot gleich) und
  `v3-v4f-adapt-qareg-v4a-fmxio` (Echtzeit-Aufnahme ±1,5 dB, am Snapshot ebenso rot). Smoke ohne Fehler.

### Abweichungen

1. **K2-57 / N7F-37 „nach 50 ms ≥ 75 % des Endpegels“** ist auf der **Pegelskala** (y) erfüllt (77 von 99), nicht in Amplitude
   (15 %): Der geforderte msfa-Anstieg („dieselbe Rechnung wie der A.4b-Angriff“) erreicht in der halben Zeit gerechnet nur
   ≈ 17 % Amplitude – beide Sätze von K2-57 zugleich sind nicht erfüllbar; der Klang folgt dem msfa-Anstieg.
2. **Exp bei der Tonhöhe** = linear in Halbtönen (wie die DX-PEG), **Lin** = linear in Hz (eigene Festlegung; KP nennt Exp/Lin nur
   für den Pegel).
3. **Frei im nativen Rückfall** läuft wie Retrig (keine gemeinsame Hüllkurve über native Stimmen); Live-Änderungen nativ ab der
   nächsten Note (bestehende Regel).
4. **Großer Editor:** Die DX-Form bleibt der A.4b-Editor (K2-44, N2-4b-04); seine Punkt-Knöpfe liegen hinter ⋯ › „Punkt-Knöpfe …“
   (Tonh.: Knopf im Kopf), weil das 365-px-Budget des A.4b-Editors keine zwei weiteren Knopfzeilen hat. Nach der ersten Aktion
   zeigt der große Bereich den Punkt-Editor.
5. **[Auf alle] / [Init] / [−1] [+1]** aus V4b: [Auf alle] und [Init] stehen jetzt unter ⋯ (P) bzw. [Auf … ▾] (L, groß), −1/+1
   entfallen (Ziffernblock auf den Wertzeilen); die Knopfzeilen sind nach KP §4.11 belegt.
6. **P2/P3** zeigen eine Knopfzeile mit Menüs (KP bemaßt die Punkt-Knöpfe nur für P1 und L1).
7. **Konvertierung mit Skip an:** Damit ein früh losgelassener Ton gleich bleibt, bekommt die umgewandelte DX-Form `skip 1`;
   [☑ Skip] zeigt das schon in der DX-Form an (ein Tipp schaltet es aus und wandelt dabei um).
8. **N7F-44:** Das FELD-Amp hat die A.4b-Regeln (Klick-Grenze, Pegelzug hält Zeiten, Vorlagen T2, ein Undo je Geste); die
   Pixel-Maße von V0d-2-07 (49,1 px je Dekade usw.) gelten für den A.4b-Editor (⤢ Hüllkurve groß), nicht für den 236-px-Graphen.
9. **Größe +58,5 KB** statt +40 KB (+46 %, unter der 50-%-Regel): der Punkt-Editor ersetzt den V4b-Amp/Tonh.-Teil (16 KB → 39 KB), dazu Worklet- und
   native Engine (≈ 13 KB) und FMX-Aktionen (≈ 6 KB). Die FMX-Umwandlung nutzt die Tabellen von FMH/DXN statt eigener Kopien.

### Fach-Prüfung (Nachtrag 2 Teil J, FP-DSP + FP-TOUCH, als eigener Durchgang über Diff, Tests und Bilder)

Blick FP-DSP (Haupt) und FP-TOUCH (Zweit) über Diff, Testausgaben und Bilder; **10 Befunde, alle behoben**:
1. FP-DSP: nativ hielt eine Schleife ihren Pegel (End-`setValueAtTime` ulp-genau nach dem nächsten `setTargetAtTime`) → behoben
   in `schedule`, Test N7F-39 nativ.
2. FP-DSP: Worklet-Quelle enthielt Nicht-ASCII-Zeichen in neuen Kommentaren → ersetzt (Worklet-ASCII).
3. FP-DSP: Tonhöhen-Punkt-Form live gelöscht (Init) ließ die Tonhöhe bei gehaltener Note stehen → `xpL` 0.
4. FP-DSP: K2-62 Begrenzer-Stufe 2 fehlte für Schleifen → Poly ≤ 4 bei Stufe ≥ 2.
5. FP-DSP: DX → Punkt beim früh losgelassenen Ton hätte den Klang geändert → Umwandlung mit Skip an (Abweichung 7).
6. FP-DSP: CPU-Spitze mit Sample-Pfad einmal 12,08 % → zwei Wiederholungen 8,19 / 9,69 %, Median ≤ 12 (oben).
7. FP-TOUCH: großer Editor auf P2/P3 überlief die Seite (Wertzeilen verdeckt) → ohne Wertzeilen bzw. einzeilig.
8. FP-TOUCH: Tonh. im großen A.4b-Editor (P2) ohne Weg zu den Punkt-Knöpfen → Knopf „Punkt-Knöpfe ▾“ im Kopf.
9. FP-TOUCH: Wertzellen der Tonh. in P3/L2 abgeschnitten → 3 bzw. 2 Spalten.
10. FP-TOUCH: Vorlagen-Menü ohne `data-n` brach die V4b-Suite in L → wieder gesetzt.
Geprüft ohne Befund: NaN/Spitzen (Feedback-Pfade unverändert), M-KLICK bei Live-Änderungen und Mip-Wechseln, ein Undo je Geste,
Pinch vs. FEIN-Finger, `touch-action:none` / `guardTouch` am Graphen, Popover-Schieber ohne `preventDefault`, kein Gerätename in
LCD/Hilfe/Knöpfen (N2-4b-02), deutsche Texte.

### iPhone-Prüfpunkte (Xander)

1. FM-Spur, INIT FM → FELD → OP 2 antippen → Amp: rechts die Hüllkurve, links das kleine Feld.
2. Punkt 2 antippen → [Sustain] → Hüllkurve wird frei (blaue Linie am Punkt); [Loop A] auf Punkt 1, [Loop B] auf Punkt 3 → violette
   Zone; Taste halten: der Klang pulsiert, loslassen: Schleife endet.
3. Ins Leere tippen → [Exp] → „Lin“; [Retrig] → „Frei“: zwei Tasten nacheinander folgen einer Kurve.
4. Zwei Finger im Graphen auseinanderziehen → Zeit-Zoom bis ×8; zusammen → ×1.
5. Tonh.: [Bereich ▾] → 2 Okt., Punkt hochziehen → Tonhöhensprung bis +2 Oktaven.
6. ⋯ → ⤢ Hüllkurve groß → großer Punkt-Editor; „✕ FELD“ zurück.
7. Ein Ausgang mit Schleife nach dem Sustain zeigt „endet nicht (Schleife)“.
8. Undo nach dem ersten Punkt-Knopf → wieder DX-Form, Badge „DX 1 ✓“.

### Bekannte Lücken

- [DX-tauglich machen] (Punkt-Form → DX mit Abweichung), Vorhersage, Raster, .syx-Export: V4c.
- Mod-Pfade `fmx.<k>.amp.<t1…t5|y0…y5>` kommen mit V5d; Hüllkurven als Mod-Quelle §18.
- Kein WebKit-/iPhone-Test (Chromium mit CDP-Touch, Node-Shim); Pinch und Skala-Schieber unter iOS nur im Code geprüft.

## V4f-fix — Umwandlung DX → Punkt-Form klanggleich, Kopieren mit Bereich, große Tonh., Nyquist, 12-s-Kappe, Frei, Ziehen, Pinch · App 3.10.0

App: `dirigent-wt/index.html`, Snapshot `synq-snapshots/V4f-fix.html`. Zehn Befunde der V4f-Prüfung (`v4f-findings.json`).

- **N7F-45 / N2-4f-01 Umwandlung klanggleich (zwei Befunde):**
  - *Skip-Release hält die Rate:* Loslassen vor Psus betritt das Segment nach Psus ab dem aktuellen Pegel mit **seiner Rate**
    (Zeit × Abstand jetzt / Abstand ab Psus), wie die DX-Form mit R4; ein flaches Segment nach Psus (L3 = L4) zählt seine Zeit je
    256 Pegelschritte (6 dB) bzw. je Oktave – die Umwandlung schreibt dort die R4-Zeit statt der Haltezeit. Worklet (`ptRelScale`)
    und nativ (`ptRelPlan`) gleich.
  - *msfa-Anstieg genau:* ⌊17 − l/256⌋ = 16 − Band (bisher 17 − Band, ≈ 4 dB zu schnell) in `riseG`/`riseAt`, nativ, `FMH.segTime`
    (angezeigte A-Zeiten) und im nativen DX-Plan.
  - *Time/Key und MAKRO wie DX:* `ptDxF` rechnet die Segmentzeit mit der DX-Arithmetik (qrate + rsd, HÄRTE/LÄNGE/RELEASE am
    Raten-Index, BISS mit Klick-Grenze, Haltephasen über die Static-Tabelle). Die Umwandlung speichert dazu je Segment die DX-Rate
    (`dxr`, optional; `normEnv` behält es); sie gilt nur, solange sie die Segmentzeit noch ergibt (nach einem Zug/Skala gilt die
    kontinuierliche Rechnung). Mit `dxr` folgt die Zeit wie bei DX dem Pegelabstand der Stimme (Anschlag, Tasten-Skalierung).
  - *Stufen über 20 s* werden einmal geteilt (Zwischenpunkt auf dem Pegelraster, bis dorthin exakt); [+] wandelt dann um und meldet
    „höchstens 6 Punkte“.
  - Nachweis: `v3-v4ffix-conv.mjs` (19 Werksklänge, alle 6 OP Amp + DX-PEG umgewandelt, Noten 36/60/84, Gate 0,1/0,3/1,5 s, vel 0,8)
    **171/171 ≤ 1 dB, schlimmstens 0,21 dB** (vorher 116/171, bis 8,9 dB; mit `KIND=add` ebenso); `v3-qa4f-n5g.mjs` alle PASS (FM-Flügel
    53,7 → 0,7 dB, Marimba 51,6 → 0,0, FM-Pluck 19,2 → 0,9, Funk 8,2 → 0,1, E-Piano 4,8 → 0,0); `v3-qa4f-n5f.mjs` 2-Op-Pluck 70 → 0,1 dB,
    E-Piano alle sechs 0,1 dB; `v3-rp4f45-indep.mjs` 0 Fälle über 1 dB (vorher 19); `v3-rp4f45-att.mjs` langsamer Angriff ≤ 0,17 dB
    (vorher 3,9–4,8); `v3-rp4f45-bass.mjs` FM-Bass ≤ 0,41 dB; `v3-rp-n7f45b.mjs` FM-Flügel/Marimba Taste los 0,3/3 s ≤ 0,3 dB;
    `v3-fp4f-conv.mjs` 58/60 (Rest: ein Extremfall mit allen vier MAKRO-Knöpfen 1,13 dB im ersten 20-ms-Fenster – Rest der
    Block-Stufung der DX-Form selbst; ein 30-ms-Ton mit 5 dB Unterschied erst unter −85 dBFS nach dem Stimmende).
- **N7F-46 ⋯ › Kopieren/Einfügen (Hüllkurve):** nimmt den Tonhöhen-Bereich `pr` mit und setzt ihn wie [Einfügen] (feste OP ohne
  Punkt-Form bleiben unberührt). `v3-repro-n7f46.mjs`: OP 3 deep-equal OP 2 (pr 8), +7,52 HT wie die Quelle, ein Undo.
- **⤢ Hüllkurve groß auf Tonh. in Punkt-Form:** `fxBigEnv` und der fm6-Abgleich lesen `r`/`l` nur aus einer DX-Form; der große
  Punkt-Editor öffnet ohne Fehler (`v3-repro-bigpit-indep.mjs` P und L: Modus BIG/BIGL, keine Fehler; DX-Form und Amp unverändert).
- **Nyquist-Wächter ohne Schlag (L3):** über 0,45 fs blendet der Operator in 5 ms aus (und wieder ein), seine Phase läuft mit
  0,45 fs weiter – kein eingefrorener Phasenwert, kein Gleichanteil. In fmx- und fm6-Pfad; darunter bitgleich. `v3-v4ffix-engine.mjs`:
  tiefpassgefilterter Spitzenwert am Übergang −105,6 / −105,1 / −68,5 dBFS (vorher −17,2 / −20,2 / −35,7 bei Ton −19,9 dBFS),
  M-KLICK ≤ 0,4 dB; `v3-rpnyq-chrome.mjs` (Chromium-Worklet) −87,8 / −91,6 dBFS gesamt.
- **12-s-Kappe blendet aus (L3):** Worklet 20-ms-Ausblendung, die 12 s nach dem Loslassen endet; nativ eine Ausblend-Rampe
  (Punkt-Form-Stimmen). `v3-v4ffix-engine.mjs`: Schleife nach Sustain / Frei + Schleife / Schleife ohne Sustain still ab 12,300 s,
  M-KLICK −99 dB (vorher 34,8 / 88,7 dB); `v3-repro-cap-native*.mjs`: linear auf 0 bis 12,30 s.
- **Frei nach langer Pause:** das Nachholen in `ptRun` überspringt ganze Schleifenperioden (gleicher Zustand wie Schritt für
  Schritt, `v3-v4ffix-freeskip.mjs` 3/3 über 60 s; vorher brach der 4096er-Wächter nach ≈ 2 s Nachholzeit ab). Anschlag-Block nach
  20/120 s Pause 0,10–0,16 ms (vorher 1,75–2,25 ms; `v3-fp4f-free3.mjs`, `v3-repro-freecatch.mjs`).
- **Ein Zug erreicht 0,5 ms … 20 s:** über den rechten Rand hinaus wächst die Zeitachse mit dem Überstand (× 2 je 24 px), und
  solange der Finger am Rand bleibt, wächst sie weiter (≈ × 2,8/s, weiter draußen schneller); der Punkt bleibt am Finger, zurück
  nach links ist stetig. `v3-qa4f-ui8.mjs`: ein Zug → 20 s (vorher × 1,25 je Zug); `v3-repro-ptdrag.mjs` 1 Zug statt 17.
- **Pinch mit einem Finger auf einem Punkt:** der zweite Finger bleibt FEIN, solange er ruht; bewegen sich beide und ändert sich der
  Abstand ≥ 12 px, geht der Punkt zurück (kein Undo-Schritt) und die Zeitachse zoomt. `v3-fp4f-touch.mjs` Teil 1 P/L: Zoom ×1,94 /
  ×1,90, Hüllkurve unverändert, Undo +0 (vorher Zoom ×1, Segment 46,4 → 0,5 ms, Undo +1).

### Offen: K2-57 / N7F-37 „nach 50 ms ≥ 75 % Amplitude“ (Entscheidung nötig)

Nicht als Klang geändert. K2-57 verlangt für Exp steigend „den msfa-Anstieg (dieselbe Rechnung wie der A.4b-Angriff)“ und
zugleich ≥ 75 % Amplitude nach der halben Zeit. Der msfa-Anstieg (jetzt genau: 16 − Band) erreicht bei 0 → 99 / 100 ms nach 50 ms
19 % Amplitude (77 % erst bei 90 ms; Pegelskala ≈ 77 von 99). Eine Kurve mit ≥ 75 % nach halber Zeit (in Amplitude „schnell, dann
flach“) kann einen DX-Angriff nicht nachbilden: jede Umwandlung eines langsamen DX-Angriffs wiche dann um bis zu ≈ 15 dB ab und
bräche N7F-45, A.5 Nr. 4 und N2-4f-01. Vorschlag für die Spec: den Prüfsatz auf die Pegelskala („≥ 75 von 99“) stellen, oder für
Exp steigend eine eigene Kurve zulassen und N7F-45 für umgewandelte Angriffe über `dxr` sichern (hörbarer Formwechsel, sobald ein
umgewandelter Angriff gezogen wird).

### Geprüft ohne Rückschritt
- `v3-v4f-reg2.sh` (OUT=fix): V0d-Suiten, `v3-v0dfix-adapt-v0d-native`, V4b-Suiten, `v3-v4bfix-chip/-lcd/-lock/-p2row6/-p3/-scroll`,
  `v3-v4f-node` 33/33, `v3-v4f-native` 7/7, `v3-v4f-ui` 417/0, `v3-v4f-adapt-qareg-v4a-fmxio` grün. Wie schon vorher rot:
  `v3-v4bfix-big` (10, gleiche Zeilen wie run2). `v3-v4a-node` N7F-09 Mehrlast schwankt (allein 0,18 % PASS / 0,32 % FAIL; der
  Stand vor dem Fix ebenso 0,003 % / 0,44 %); `v3-v4a-ui` N7F-10 im Lauf 16,5 %, allein 9,69 % PASS (Last durch Parallelbetrieb).
- Smoke ohne Fehler (`v3-v4ffix-smoke.png`). `v3-fp4f-touch.mjs` Teile 2 (P2 bleibt bei y-Anschlag nicht unter dem Finger, Punkte
  rücken nach dem Loslassen um ≤ 7 px, weil die Achse wieder „Gesamt + 25 %“ wird) sind am Stand vor dem Fix gleich rot – nicht
  Teil dieser Befunde.

### Abweichung (neu)

- **V0d-2-11 / Tabelle T2 angezeigte Zeiten:** Mit dem genauen msfa-Anstieg zeigt die Anzeige jetzt die Zeit, die das Worklet
  spielt: Angriffe und steigende Stufen ≈ 20–28 % länger als in T2 (Pad-Ausgang A 108 → 138 ms, Pad-Modulator A 113 → 130 ms,
  D1 143 → 183 ms, A bei R 99 0,6 → 0,8 ms). T2 war mit demselben Rundungsfehler (17 − Band) gerechnet; die R/L-Werte der Vorlagen
  sind unverändert (deep-equal). Belegt durch `v3-rp4f45-att.mjs`: ein Punkt-Angriff mit 138 ms liegt ≤ 0,17 dB neben der DX-Form,
  mit 108 ms waren es 4,2 dB. `v3-v0d-ui-d.mjs` prüft noch die alten T2-Texte (1 FAIL, nur diese Zeitangaben).

## V4c — Vorhersage, Verhältnis-Raster, DX-Brücke (DX-tauglich machen, .syx-Export, Import ins FELD) · App 3.11.0

Grundlage: Nachtrag 2 Teil A (A.6 Zeile V4c, K2-37, K2-39, A.5 Nr. 4, N2-4c-01) mit `r7/kodamo-delta-pdf.md` (KP §4.6 Z9, §4.7
Basis Zeile 3 und Stimme Zeile 3, §4.12, §6.3–6.5, §9 „V4d“: V4c-01 … V4c-07 und N7F-49 … N7F-52), Spec §9.5/§9.6 und §17 V4c,
Nachtrag 1 A.4b Nr. 3 (PEG-Bytes zurückschreiben), N0a-03/N4c-01 (.syx im ZIP); Forschung `r4/g5/ratio-raster` (Regel, 15/15) und
`r4/g5/vorhersage-bench` (Rechenweg). Gebaut auf `synq-snapshots/V4f-fix.html` (3.10.0). Format und alte Projekte bleiben.

### Gebaut

**Vorhersage im LCD beim Ziehen (V4c-01, Z9).** Bei jedem Zonenwechsel einer Kachel-Geste rechnet `fxPredict` das Ergebnis der
Regel (`FMX.gesture`) im Hauptthread wie das Worklet (Sinus/Werkswellen als 512er-Tabellen, Kanten in Rechenreihenfolge,
Feedback selbst = 2-Sample-Mittel · 2^(fb−8), fremd = 1 Sample, Pegel am Hüllkurven-Gipfel), 2048 Samples bei f = 48000/2048·6
(jeder Teilton auf seinem FFT-Bin), Hann + FFT. Das LCD zeigt links **eine Periode** und **16 Teilton-Balken**, rechts zweizeilig
die Geste („3 → 1 verbinden“) und das **Etikett**: Klasse (alle Teiltöne · nur ungerade · lückig · dünn · Glocke/Metall · rein),
„▼ tiefer“ bei Teiltönen auf ½ f, dann „heller/dunkler“ gegen den Graph vor dem Ziehen (Schwerpunkt ±15 %), sonst die Helligkeit,
dann das Paar „×2 auf ×1“. Abgewiesene Zonen zeigen wie bisher nur den Grund. Nach dem Loslassen kommt die Status-Zeile zurück.
L2 (667 × 375): das LCD ist dort ≈ 150 px breit – während des Ziehens liegt die Vorhersage über den Unterreitern daneben
(`.lcdpv`, nicht antippbar), danach sind die Reiter wieder da. P3 (320 × 568) hat keine LCD-Zeile: dort steht die Vorhersage
unter dem Feld-Kopf (`.fxhpv`). L6: passt die zweite Zeile nicht, fallen erst das Paar, dann die Helligkeit weg; passt die Geste
nicht neben das Bild, zeigt das LCD die normale Zeile (zweizeilig/Laufschrift wie V4b-fix).
- Rechenzeit (Chromium, Xeon): je Vorschau 0,4–1,4 ms im Ziehen; schlechtester Fall N7F-52 (6 Op, 15 Kanten + 6 Feedback-Wege,
  Wellen ≠ 0, Punkt-Hüllkurven mit Schleife) Median 0,5–0,9 ms, p95 0,7–1,8 ms. Damit das schon beim ersten Ziehen gilt, rechnet die
  Seite FELD beim Öffnen 12 Vorhersagen in 50-ms-Abständen vor (JIT); die Schleife liest nur typisierte Felder (eine Vorbereitung
  liest den Graph) – vorher kostete die erste Geste 5–16 ms, weil JSON-Kopien des Graphen den optimierten Code verwarfen.
- Spec-Risiko §9.5: bei > 8 ms je Vorschau (langsames Gerät) höchstens 15 Hz; eine übersprungene Zone folgt 70 ms später.

**Verhältnis-Raster (V4c-02, V4c-03; KP §4.7 Basis Zeile 3).** Tipp auf die Wertzone „Verhältnis“ öffnet das Raster (feste
Frequenz: weiter der Ziffernblock). Kopf „Raster 4 → 3 (×1)“ = Partner (erstes Ziel eines Modulators, sonst erster Modulator
eines Ausgangs). 16 Felder ½ · 1 … 14 · 1,41, je mit Klasse █ ▓ ▒ ░ ◇ und ▼ (klingt tiefer) nach der Regel aus `ratio-raster`
(Linien |C + kM|, a = 2C, b = 2M, g = ggT → Grundton g/2, Teilton n ⇔ n ≡ ±a′ mod b′; `FMX.ratioClass`). Darunter der aktuelle
Wert mit Klasse, [◁] [▷] (fine ±1, je ein Undo), [Zahl …] (Ziffernblock), Legende. **Gleiten:** Finger auf das Raster und über die
Felder ziehen – das Verhältnis wechselt laufend, bei stehendem Transport klingt dabei die Referenznote (Vorhören), Loslassen
lässt den Wert stehen, **ein** Undo für das ganze Gleiten. Felder P1 40 × 48, L1 42 × 48, P3 4 × 4 Felder à 66 × 48 (L4).
- Worklet: eine Verhältnis-Änderung bei klingender fmx-Stimme gleitet jetzt 10 ms (logarithmisch, `FRX_N`, wie die 30-ms-Pegel-
  Blende aus V4b-fix) statt zu springen – M-KLICK der Raster-Stufen ×1 … ×7 auf gehaltener Note am Modulator 7,2 → 4,5 dB
  (Grenze 6), am Ausgang 5,8 → 5,7 dB (`v3-v4c-glide.mjs`). Statische Klänge bleiben bitgleich.

**[DX-tauglich machen] (V4c-06, N7F-49; KP §4.12, A.5 Nr. 4).** In Stimme › DX-Abgleich (die ganze Zeile, 132 × 44, solange nicht
DX-tauglich; [Nummern angleichen] bleibt) und auf der gesperrten DX-/OP-Seite. Das Blatt nennt jede Änderung mit ihrer Folge, ein
Tipp auf [Anwenden] macht alles in **einem** Undo-Schritt, danach Badge „DX n ✓“, fm6 wird mitgeschrieben (kein „angenähert“),
die DX-Seite ist frei. `FMX.makeDx` in fester Reihenfolge:
1. Verbindungen: gleiche Kanten mit anderer Nummerierung → „Nummern angeglichen (wie DX 7)“; keine DX-Form → nächster Algorithmus
   (wenigste abweichende Kanten über alle 720 Nummerierungen) mit Liste „Verbindungen → DX 5 · 6 → 1 gelöst – klingt anders“.
2. Feedback: ein Weg am DX-Empfänger/-Quelle, ganze Stärke („Feedback an OP 2 (← 2) entfernt – weniger rau“, „Feedback-Stärke
   4,5 → 5“).
3. Je Operator: Welle → Sinus („OP 3: Welle Säge → Sinus – weniger Obertöne“); **Punkt-Form → DX-Form mit Abweichung**
   („OP 2: Hüllkurve frei → DX, Abweichung 1,8 dB“): eine aus der DX-Form umgewandelte, unveränderte Punkt-Form geht exakt zurück
   (5/5 deep-equal); sonst 3 Haltepunkte vor dem Sustain + Release, Raten nach `FMH.stageTime` gesucht, Abweichung = RMS der dB-
   Kurven (gehalten bis Sustain + 0,3 s, dann 1,5 s Release; Modell = msfa-Fall/-Anstieg, Skip mit der Rate des Folgesegments wie
   `ptRelScale`; Selbsttest DX ↔ Punkt 0,05–0,14 dB). Tonhöhe ebenso in HT (PEG-Tabellen), feste OP ohne Tonhöhen-Hk., eine PEG
   für alle Verhältnis-OP; Phase → 0, Phase-Modus einheitlich, Anschlag < 0 → 0, LFO AM auf 0/42/85/127, LFO FM einheitlich.
- `FMX.dx` nennt zwei Feedback-Wege auf DX-Verbindungen jetzt als „Feedback an OP 2 und OP 6“ statt „Verbindungen: kein DX-
  Algorithmus“ (der Badge-Text bleibt).

**DX7-Bank exportieren (V4c-05, N7F-50; Spec §9.6).** Menü › Sounds › [DX7-Bank exportieren (.syx)]: bis 32 DX-taugliche
FM-Sounds der eigenen Bibliothek als 32-Stimmen-Bank (F0 43 00 09 20 00 · 4096 · Prüfsumme · F7, gepacktes VMEM wie der Import),
freie Plätze INIT VOICE. Nicht taugliche werden übersprungen und im Toast mit dem ersten Grund genannt („DX7-Bank gespeichert
(ZIP) · 32 Stimmen · übersprungen: Welle drin (OP 3: Welle Dreieck), …“). Viewer: `….zip` mit `….syx` (N0a-03); Safari: die
`.syx` selbst als `application/octet-stream`. Rückweg je Stimme: alle fm6-Felder inkl. PEG (A.4b Nr. 3), AMS/PMS/Osz.-Sync; der
LFO aus den Klang-Werten zurückgerechnet (Rate → Geschwindigkeit, Einblenden → Verzögerung, Form, `lfo1→pitch`/`lfo1→amp` →
PMD/AMD); Namen ASCII mit ä → ae (10 Zeichen). Ein FELD-Klang mit LFO FM schreibt PMD 99 (dort wirkt LFO 1 voll).
- `fmxApply` behält die PEG einer Stimme mit nur festen Operatoren in fm6 (wirkungslos, aber der Export schreibt die Bank-Bytes
  zurück; ROM1A REFS WHISL).

**Import ins FELD (N7F-51).** Unverändert über `fmxFromFm6` (V4a), jetzt für 32/32 ROM1A-Stimmen geprüft: Plätze = `dxLayout`,
PEG in jedem Verhältnis-OP, AMS/PMS/Osz.-Sync, Badge ✓, FELD ↔ DX deep-equal.

**Test-API:** `fmxPredict(t, g?)`, `fmxPredictX(x)`, `fmxRaster(t, op)`, `fmxMakeDx(t, apply?)`, `exportSyx(ids?)`,
`syxVoiceOf(sound)`, `buildSyx(voices)`, `parseSyx(bytes)`.

### Abnahme (Chromium + CDP-Touch, Worklet-Shim; P1, L1, P2, P3, L2)

| ID | Ergebnis | Beleg |
|---|---|---|
| V4c-01 | ✓ Etikett, 16 Balken, Periode bei jedem Zonenwechsel 20–39 ms nach der Bewegung; Rechenzeit 0,4–1,4 ms | `v3-v4c-accept.mjs` A (5 Größen) |
| V4c-02 | ✓ 15/15 Raster-Klassen = FFT der echten Engine (Modulator-Index 2; 1 : 3,5 als 2 : 7, weil ×3,5 kein DX-Verhältnis ist) | `v3-v4c-node.mjs` |
| V4c-03 | ✓ Gleiten ×1 → ×7: M-SP 573–723 Hz → 1017–1028 Hz (≥ ⅓ Okt., H-1), Loslassen setzt ×7, ein Undo, Undo stellt ×2 her; M-KLICK offline ≤ 5,7 dB | `v3-v4c-accept.mjs` B, `v3-v4c-glide.mjs` |
| V4c-04 | ✓ dxMatch 32/32 (je 103 Nummerierungen, 3296/3296); Nicht-Treffer ≤ 0,8 ms | `v3-v4c-node.mjs` |
| V4c-05 | ✓ Export → Import: 32/32 Stimmen deep-equal (Feld für Feld ohne Zeitstempel; der Import meldet alle 32 „schon vorhanden“); Viewer `.zip` mit `.syx` (4104 Byte), Toast „DX7-Bank gespeichert (ZIP) …“ mit den übersprungenen; Safari `.syx` als octet-stream | `v3-v4c-accept.mjs` D |
| V4c-06 | ✓ Änderungsliste, danach Badge ✓, ein Undo (Stimme-Seite und gesperrte DX-Seite) | `v3-v4c-accept.mjs` C, `v3-v4c-node.mjs` |
| V4c-07 | ✓ Regression wie V4f-fix (unten); Smoke ohne Fehler; DoD: Größe +50,8 KB (Budget 30, Begründung unten) | `v3-v4c-reg.sh`, `v3-v4c-reg2.sh` |
| N7F-49 | ✓ 6-Op-Graph mit Wellen, Punkt-Hüllkurven (Lin, Schleife), zwei Feedback-Wegen (2 und 6): jede Abweichung mit Folge, danach „DX 1 ✓“, ein Undo | C |
| N7F-50 | ✓ übersprungene Sounds im Toast je mit dem ersten Grund | D |
| N7F-51 | ✓ 32/32 (ROM1A) | D |
| N7F-52 | ✓ Median ≤ 0,9 ms, p95 ≤ 1,8 ms | A |

- **Regression** `v3-v4c-reg.sh` (V4f-Liste, 84 Suiten + 15 allein, Versionskopien `v3-v4c-adapt-*` für 3.11.0) und
  `v3-v4c-reg2.sh` (V0d-, V4a-, V4b-, V4b-fix-, V4f-Suiten, dann die V4c-Suiten): rot wie schon auf V4f-fix mit denselben FAIL-Zeilen
  `node-fm`, `v3-v0b-adapt-wp3-browser`, `-wp3-ui`, `wp4-offline`, `wp3-adapt-func-build(-native)`, `wp5-mod` (fps unter Last),
  `v3-v0d-ui-d` (V0d-2-11, auf V4f-fix gleich), `v3-v4bfix-big` (`.fxback`, gleich), `v3-v4c-adapt-qareg-v4a-fmxio`
  (Echtzeit-Aufnahme ±1,4 dB, auf dem Snapshot ebenso rot). Unter Last rot, allein grün: `v3-v0a-drum` 19/0, `v3-v0b-adapt-wp6-extras`
  P/L 20/0, `wp6-song-P` 27/0, `wp7-accept-fm4` 40/0, `wp3-adapt-func-build` (allein dieselben 2 FAIL wie V4f). Angepasst:
  `v3-v4c-adapt-v4bfix-lcd` (prüft im Vorhersage-Modus beide LCD-Zeilen statt `.lk`) 109/0. Grün u. a.: alle DoD-Läufe (60 s),
  `wp1-dod`/`wp7-adapt-wp1-perf` (Startzeit), V0d 10/10, `v3-v4a-node` 46/46, `v3-v4b-field` P 106/0, L 101/0, `-platz` 59/0,
  `v3-v4f-node` 33/0, `-native` 7/0, `-ui` 417/0, Worklet-ASCII, Smoke.

### Abweichungen

1. **Vorhersage ohne ▶** (Spec §9.5 „▶ spielt die vorhergesagte Struktur kurz an“): KP legt die Vorhersage ins LCD während des
   Ziehens; der Finger zieht noch, ein Knopf wäre nicht erreichbar. Nach dem Loslassen hört man das Ergebnis ohnehin.
2. **Raster ohne Magnete** auf halben Werten: [◁] [▷] gehen in fine-Schritten (×1 %); halbe Werte wie ×1,5 = fine 50 sind exakt,
   ×3,5 ist in DX-Schritten nicht darstellbar (3,51). Das Raster selbst bietet die ganzen Werte, ½ und 1,41.
3. **V4c-02 Paar 1 : 3,5** als 2 : 7 geprüft (gleiches Linienmuster 2 5 9 …, „dünn“), weil ×3,5 kein DX-Verhältnis ist.
4. **Rückweg Punkt-Form → DX** ist eine Näherung (A.5 Nr. 4): Schleifen, Lin, Frei und mehr als 3 Punkte vor dem Sustain gehen
   verloren; das Blatt nennt die Abweichung in dB bzw. HT. Gestreckte Zeiten (×1,3) liegen bei ≤ 3,3 dB (Raster der DX-Raten).
5. **.syx-Export: Bytes, die der Klang nicht trägt,** werden auf DX-Standard geschrieben (Breakpoint 39 ohne Skalierung,
   flache PEG-Raten 99, LFO-Sync 1, PMS ohne PMD); der Rundlauf ist parametergleich (32/32), nicht bytegleich zur Ausgangsbank.
   Eine Route `lfo1→amp` ohne AMS an einem Ausgang geht im Export verloren (DX kann das nicht).
6. **L2-LCD / P3:** die Vorhersage überdeckt während des Ziehens die Unterreiter (L2) bzw. liegt unter dem Feld-Kopf (P3, ohne LCD).
7. **Größe +50,8 KB** statt +30 KB (+69 %, über der 50-%-Regel): Vorhersage mit FFT und Etikett (≈ 9 KB), Hüllkurven-Rückweg mit
   zwei Hüllkurven-Modellen und Abweichung (≈ 12 KB), DX-tauglich-Logik und Blatt (≈ 7 KB), .syx-Export (≈ 7 KB), Raster (≈ 6 KB),
   CSS (≈ 3 KB), Worklet-Gleiten (0,5 KB), Kommentare. Gruppe 3 (V4a, V4b, V4f, V4c) zusammen +312 KB gegen +213 KB geplant;
   die Datei hat 1,80 MB (Grenze 5,0 MB, EN2-28), die Startzeit-Abnahme §15.3 bleibt der Wächter (wp1-dod/-perf in der Regression).

### Fach-Prüfung (Nachtrag 2 Teil J: FP-DSP Haupt-, FP-TOUCH Zweit-Blick; eigener Durchgang über Diff, Tests und Bilder)

**9 Befunde, alle behoben:**
1. FP-DSP: Raster-Stufen auf gehaltener Note sprangen im Verhältnis (M-KLICK am Modulator 7,2 dB) → 10-ms-Gleiten im Worklet.
2. FP-DSP / FP-IPHONE: erste Vorhersage einer Sitzung 5–16 ms (Deopt durch JSON-Kopien des Graphen) → typisierte Rechenschleife,
   Vorrechnen beim Öffnen; jetzt ≤ 1,4 ms ab dem ersten Ziehen.
3. FP-DSP: `fmxApply` verwarf die PEG einer Stimme nur mit festen OP → FELD ↔ DX nicht deep-equal (ROM1A REFS WHISL) → bleibt in fm6.
4. FP-DSP: Abweichungs-Modell der Punkt-Form ohne die Skip-Rate (`ptRelScale`) → 8,8 dB Selbstfehler → Modell ergänzt (≤ 0,14 dB).
5. FP-TOUCH: Raster-Felder in P3 nur 31 px breit → 4 × 4 Felder (66 × 48).
6. FP-TOUCH: [DX-tauglich machen] als 24-px-Knopf → ganze Zeile antippbar (132 × 44).
7. FP-TOUCH: L2-LCD zu schmal für die Vorhersage → Überlagerung der Unterreiter während des Ziehens.
8. FP-TOUCH: P3 blendet die LCD-Zeile aus – die Vorhersage war dort unsichtbar → Zeile unter dem Feld-Kopf.
9. FP-TOUCH (L6): Vorhersage-Zeile endete mit „…“ (L1, P3) → Teile fallen nach Wichtigkeit weg, nie abgeschnitten.
Ohne Befund geprüft: ein Undo je Geste (Gleiten, ◁ ▷, Anwenden), zweiter Finger auf dem Raster ignoriert (Pointer-Capture),
`touch-action:none` auf dem Raster, Abbruch (pointercancel, Blur) beendet die gehaltene Vorhör-Note, Texte deutsch und ohne
Gerätenamen (N2-4b-02), Worklet-Quelle ASCII, keine NaN, M-PLATZ der Blätter in P1/P2/P3/L1/L2.

### iPhone-Prüfpunkte (Xander, N2-4c-01 nach KP §8 plus V4c)

1. FM-Pluck öffnen → FELD: unten die Ausgänge, darüber die Modulatoren, rechts die Pegel-Seite in denselben Farben.
2. Einen Modulator auf einen Ausgang ziehen und **noch nicht loslassen**: oben im LCD erscheinen eine Welle, 16 grüne Balken und
   z. B. „alle Teiltöne · heller · ×2 auf ×1“; loslassen → verbunden; nochmal auf denselben → Plätze getauscht; ins Leere → fällt.
3. Doppeltipp → stumm. Operator antippen → Basis/Amp/Mod/Tonh.; Amp → Punkte ziehen, [Sustain] mit [Skip], [Loop A]/[Loop B], [Loop weg].
4. Basis › rechts neben „Verhältnis“ auf die grüne Zahl tippen → Raster. Finger auf „1“ legen und langsam bis „7“ gleiten:
   der Ton wird heller; loslassen → bleibt; ↶ → zurück.
5. Einen Klang mit Welle ≠ Sinus: Stimme › DX-Abgleich antippen → Liste → [Anwenden] → „DX 1 ✓“, Seite DX ist frei; ↶ → zurück.
6. Menü › Sounds › [DX7-Bank exportieren (.syx)] → Teilen-Blatt bzw. Download der `.syx`; in Dexed laden.
7. Querformat: Feld und Hüllkurve nebeneinander; beim Ziehen liegt die Vorhersage über den Unterreitern.
8. Pegel-Seite: waagrecht ziehen ändert den Wert ohne Sprung, Tipp auf die Zahl öffnet den Ziffernblock. FM-Bass mit kurzer
   Modulator-Hüllkurve bauen und tief spielen.

### Bekannte Lücken

- N2-4c-01: der Zwischenstand an Artifact-Adresse und Pages-Seite ist Sache des Orchestrators (kein Commit/Push hier).
- Kein WebKit-/iPhone-Test (Chromium + CDP-Touch, Node-Shim); die Vorhersage-Zeit am iPhone ist unbekannt (Annahme 3–7 ms,
  sonst greift die 15-Hz-Grenze).
- Die Echtzeit-Aufnahme im Browser zeigt beim Gleiten M-KLICK 5,5–7,9 dB (Aufnahme-Jitter unter CDP); bindend ist die
  Offline-Messung im Worklet-Shim.

## V4c-fix — LFO-Tiefen PMD/AMD durch Import, FELD und .syx-Export; Einbruch bei [Anwenden]/↶; FERTIG am Taktstrich · App 3.11.0

**5 Befunde (Abnahme + Fach-Prüfung V4c), alle behoben:**

1. **V4c-05: PMS > 0 mit winzigem PMD wurde als PMD 99 exportiert** (8 von 1088 Stimmen der Synprez-Bänke, z. B. WATER GDN
   PMS 1 / PMD 1: keine Route, weil 0,0047 HT unter der Schwelle). Der Import hält jetzt `fm6.pmd` (und `fm6.amd`) neben
   PMS/AMS (nur Werte < 99; fehlend = volle Tiefe); der Export schreibt bei fm6-Klängen ohne Route diesen Wert (ist die Route
   über der Schwelle entfernt worden, PMD 0 = was die App spielt). Rundlauf jetzt 1088/1088 parametergleich (ROM1A + 33 Bänke).
2. **N7F-51: Import ins FELD verlor PMD/AMD** (Vibrato ×20, Tremolo +20 dB nach einer Null-Bearbeitung; Export danach PMD 99).
   Neu im Graphen `p.fmx.pmd` / `p.fmx.amd` (0..99, `FMX.norm` hält sie, `fromFm6`/`toFm6` tragen sie): das Worklet spielt
   `lfoFm × PMD/99` (= die frühere Route lfo1 → pitch) und `lfoAm` an einem Ausgang wie die frühere Route lfo1 → amp
   (Verstärkung 1 − AMD/99 · s · ½ · LFO), an einem Modulator × AMD/99 in dB. `fxEnsure` nimmt die Tiefe aus der Route
   (lfo1 → pitch und jetzt auch lfo1 → amp gehen in den Graphen, keine Verdopplung). Ohne die Felder (jeder FELD-Klang) wie bisher.
   Gemessen: BRASS 1 17,3 → 17,2 Cent (vorher 274,9), PMD 30/PMS 1 28,5 → 28,3 Cent, AMD 20/AMS 3 1,9 → 1,9 dB (vorher 22,3),
   AMD 99/AMS 3 9,5 → 9,5 dB; Export nach der FELD-Bearbeitung PMD 5 / AMD 20 wie die Bank.
3. **V4c-05: AMD 99 bei AMS nur an Modulatoren** (ROM1A GUITAR 1 3 → 99, FLUTE 1 13 → 99, VOICE 1 2 → 99): der Export schreibt
   `fm6.amd`; ROM1A → Export ohne Bearbeitung hat jetzt nur noch AMD-Abweichungen bei Stimmen mit AMS 0 (klangneutral).
4. **[DX-tauglich machen] [Anwenden] / ↶ auf klingender Note: 6–7 dB Einbruch für ~10 ms** (Welle + Hüllkurven-Form zusammen).
   Ursache: die Vorzeichen-Messung vor der 30-ms-Überblendung (2 ms) sah anfangs korrelierte Signale, nach ~3 ms −0,9 →
   Auslöschung. Messfenster jetzt 5 ms (`SX_M`), die Überblendung selbst bleibt 30 ms. Offline-Scan 57 Schaltzeiten × 48/44,1 kHz:
   0 Einbrüche > 3 dB (vorher 9 bzw. 6), schlimmster −1,3 dB (Kontrolle −1,2); Echtzeit 44 Schaltungen, Spur und Master 0.
5. **● FERTIG am Taktstrich warf die Aufnahme weg** (P1/P2/P3; L schaltete LATCH): FERTIG wirkt auf pointerdown, die Ergebnis-
   Meldung mit [Rückgängig] liegt danach unter dem Finger, der Kompatibilitäts-Klick traf sie. ▶, ● und ● FERTIG legen beim Loslassen
   den Geisterklick-Schutz (`UI.ghost`, jetzt auch für Klicks mit `detail 0`, wie Chromes Tap); die Meldung bleibt stehen.

**Abnahme (Skripte in `dirigent-test/`):** `v3-acc4c-syx.mjs` (1088/1088), `v3-verify-pmd99.mjs` (1024/1024),
`v3-qa4cfp-vib.mjs`, `-trem.mjs`, `-brass.mjs` (PASS), `v3-indep-syxamd.mjs`, `v3-qa4cfp-syx.mjs`, `v3-fix4c-n7f51.mjs` (echte
Worklet-Quelle in OfflineAudioContext), `v3-fix4c-amd-audible.mjs` (X.amd hörbar: Modulator-Helligkeit 7,7 / 1,8 / 1,3 dB bei
AMD 99 / 20 / 3, Ausgangs-Tremolo 9,1 / 1,7 dB), `v3-rv-dxdip-scan.mjs`, `v3-rv-dxdip-rt.mjs many`, `v3-acc4c-msg2.mjs`
(−1,12 dB, ideal −1,09), `v3-acc4c-apply4.mjs`, `v3-qrg4c-recdone.mjs` P/P375/P320, `v3-qrg4c-recdone2.mjs` (3,3 … 4,1),
`v3-repro-fertig-ind(-l).mjs` (P 390/375/320, L 844/667: Aufnahme bleibt, LATCH unverändert), Smoke ohne Fehler.

**Abweichung:** ältere Bibliotheks-Sounds aus einem .syx-Import (vor diesem Fix, ohne `fm6.pmd/amd`) bekommen beim ersten
FELD-Schritt die Tiefe aus ihrer Route; ohne Route ist sie 0 (klingt wie vorher im DX-Pfad). Ein erneuter Import derselben Bank
wird wegen der neuen Felder nicht als „schon vorhanden“ erkannt.

## G3-FM-gruppe-fix — Punkt-Form zeigt die Zeiten der DX-Form; DX-tauglich-Blatt mit den FELD-Nummern · App 3.11.0

1. **Punkt-Form: Anzeige = Klang am Bezugston** (Nachtrag 2 A.5 Nr. 4, KP §4.11). Die Punkte speichern weiter die Zeiten ohne
   Time/Key und MAKRO (die Stimme rechnet beides zu, `ptDxF`, Klang unverändert). Achse, Fußzeile, X-Anzeigen, LCD und Ziehen zeigen
   jetzt die Zeit, die am Bezugston klingt (`FMX.ptDispT`, gleiche Rechnung wie das Worklet); Ziehen auf „X 100 ms“ speichert die
   Zeit, die dort 100 ms klingt (`FMX.ptStoreT`, Umkehrung). Das Segment nach dem Sustain-Punkt zeigt den Release wie die DX-Form
   (vom Körperpegel max(L2, L3); alles flach: DX-Haltephase). Fußzeile mit Sustain vor dem Ende: „Gesamt ‹bis Sustain› · R ‹Rest›“
   wie in der DX-Form; sonst „Gesamt ‹alles›“. Ein neuer End-Punkt [+] liegt 100 ms (angezeigt) hinter dem letzten.
   Prüfung: alle 108 Werks-FM-Hüllkurven × Noten 36/60/84 zeigen nach der Umwandlung dieselben Zeiten wie die DX-Form (vorher 81/108
   > 25 % daneben); Worklet: angezeigte = gehörte Zeit am C4 (rs 0/2/4), auch nach einem Zug auf „X 1,0 s“.
2. **[DX-tauglich machen] nennt die Nummern aus dem FELD** (KP §4.12, V4c-06). Verbindungen („4 → 3 gelöst“, „… neu“), Wellen,
   Hüllkurven, Feedback und die Tonhöhen-Quelle stehen mit der FELD-Nummer; ändert sich die Nummer, endet die Zeile mit
   „· wird OP 3“, und eine Zeile „Neue Nummern: OP 2 wird OP 3, OP 3 wird OP 2“ listet alle neuen Nummern.

**Abnahme (`dirigent-test/`):** `v3-g3fix-conv.mjs` (324/324), `v3-g3fix-audio.mjs` (18/18), `v3-g3fix-ui.mjs` P/L/P375 mit den
echten Schriften (Barlow Semi Condensed, JetBrains Mono über http), `v3-g3fix-dxnum-node.mjs` (600 Zufallsgraphen, 318 mit neuen
Nummern, 3838 Zeilen), `v3-rep-dxnum-ui.mjs`, `v3-grpG3-convui.mjs`, `v3-repro-ptconv-ui.mjs`; ohne Rückschritt: `v3-v4f-ui`
(198/198), `v3-v4f-node`, `v3-v4f-native`, `v3-v4ffix-conv` (171/171), `v3-v4c-node`, `v3-v4c-accept`, `v3-qa4f-*`; Smoke ohne Fehler.

**Bekannt, unverändert:** die DX-Fußzeile ist auf P1/P2/L1 breiter als ihr Feld und wird mit „…“ gekürzt (z. B. 326 > 236 px);
eine flache DX-Stufe > 20 s bleibt in der Punkt-Form 20 s (längstes Segment); Lin rechnet Time/Key über die lineare Strecke, ein
Angriff unter 1 ms kann nach [Exp] → Lin bis 0,5 ms anders lesen.

## G3-klein-fix — 🎲 auf FELD-Sounds verliert nichts, Loop zwischen Nachbarpunkten pendelt, „1 Stimme“, zwei Testerwartungen · App 3.11.0

1. **Kopf-🎲 auf einem FELD-Sound, den die DX-Form nicht tragen kann** (Badge nicht ✓: freier Graph, andere Nummern, Wellen,
   Punkt-Hüllkurven, Phasen, Feedback-Wege): würfelt jetzt FELD-gerecht wie das Zufall-Blatt (`fxRandGraph`, gemeinsam mit
   `fxRandomize`) – Frequenzen, DX-Form-Hüllkurven und Pegel; Verbindungen, Plätze, Feedback, Wellen, Phasen und Punkt-Hüllkurven
   bleiben. LCD „Zufall (FELD) · Verbindungen, Wellen und Punkt-Hüllkurven bleiben“. Ein Undo je 🎲 stellt den Sound exakt her.
   Ein reiner DX-Graph (Badge ✓) würfelt wie bisher (auch den Algorithmus); dort geht nichts verloren.
2. **[Loop A]/[Loop B] auf Nachbarpunkten** (Worklet, nativer Pfad, Abgleichs-Simulation): die Schleife pendelt A ↔ B – von B zurück
   nach A in der Zeit von A → B, dann wieder A → B (Periode 2 × Segment). Vorher lief das Segment von B nach B und blieb flach.
   Schleifen über drei oder mehr Punkte unverändert. Auch mit A = P0, vor dem Sustain (endet beim Loslassen) und mit [Frei]
   (Aufholen ganzer Perioden). LCD „Schleife 1 → 2 · Nachbarpunkte: pendelt 1 ↔ 2“.
3. **DX7-Bank-Toast:** „1 Stimme“, „n Stimmen“.
4. **`v3-acc4c-syx.mjs` „FELD stumm“ / „FELD Nummern“: Testerwartung falsch, App richtig** (KP §6.4): Nr. 1 – DX-tauglich nur mit
   der eigenen Nummerierung; ein Graph „wie DX 1 – Nummern anders“ braucht erst [Nummern angleichen], der Export überspringt ihn mit
   Grund (N7F-50). Nr. 7 – das DX7-Stimmenformat (VMEM) hat kein Operator-an-Bit, ein stummer OP wird mit Pegel 0 geschrieben und
   kommt als an · OL 0 zurück (klingt gleich). Test angepasst: 5 exportiert, „FELD Welle“ und „FELD Nummern“ übersprungen, stumm ≙ OL 0.
5. **V0d-2-11 (`v3-v0d-ui-d.mjs`) und Tabelle T2 (Nachtrag 1):** die angezeigten Zeiten folgen seit V4f-fix der msfa-Anstiegskurve
   (K2-57 bleibt) und sind richtig: Ausgang A 0,8 ms (statt 0,6), Pad-Ausgang A 138 ms (108), Pad-Modulator A 130 ms (113),
   D1 183 ms (143). Testerwartung und T2 angepasst, App unverändert.

**Abnahme (`dirigent-test/`):** `v3-g3k-dice.mjs` (13/13), `v3-g3k-loopnb.mjs` (Worklet und nativ über die App, 7/7; auf dem
alten Stand 6 rot), `v3-g3k-loopnb-off.mjs` (Periode ±3 % bei 44,1/48 kHz, M-KLICK, Release, 18/18), `v3-g3k-loopnb-free.mjs`,
`v3-g3k-lcdfont.mjs` (P/P375/P320/L/L667 mit Barlow Semi Condensed: nichts abgeschnitten), `v3-grpG3-loopadj.mjs`,
`v3-acc4c-syx.mjs` (6/6), `v3-v0d-ui-d.mjs` (51/51); Regression `v3-g3k-reg.sh`; Smoke ohne Fehler.

## V0c — Song-Sofortmaßnahmen (+ N0c ▶ oben / Träger gehören dem Song, + N7S-01 … N7S-07 nach EN2-05) · App 3.11.1

Grundlage: Spec §2.3 (S-01 … S-04), §4.5, §4.8, §17 V0c; Nachtrag 1 A.3 (N0c: TA9, EN-06); Nachtrag 2 Teil B (EN2-05, B.1 Nr. 4, 8,
9, 10, 15, K2-05, K2-27, K2-63) mit `r7/song-delta.md` 6.1–6.2, 7.1–7.4, 8.1–8.2, 12.2 und den Maßen aus `r7/song-geo/geo.out`.
V0c war beim Erscheinen von Nachtrag 2 nicht begonnen → N7S-01 … N7S-07 komplett in V0c (K2-05 Fall A). Gebaut nach V4c/G3-klein-fix;
Version **3.11.1** statt 3.3.0, weil die Versionen streng steigen (E.5 Punkt 3: nachgeholte Pakete bekommen die nächste Zwischennummer).

**Was neu ist**
1. **● im Song nimmt nur seine Ziele auf (S-01, N7-R8 „Überschreiben ab n“).** Ist ein Song da, legt ● keinen neuen Song mehr an,
   sondern öffnet das **Start-Blatt** (Halten auf ● öffnet es jederzeit): Kopf „AUFNAHME AB TAKT n“ (Positionsmarke) bzw.
   „AUFNAHME TAKT n“ / „TAKTE a–b“ (gelbe Auswahl), Ziele **[CLIPS] [AKKORDE] [MELODIE]** (Standard: leerer Song alles, sonst nur
   MELODIE), Zeile „Überschreiben – was du änderst, ersetzt …“, **Vorlauf [1 Takt │ aus]** (bei Takt 1 Einzähler), „überschreibt …
   ab Takt n“, **[● START]**. Stehend: ▶ SONG ab n (bzw. n−1); Clips laufen: der Song übernimmt am nächsten Taktstrich; Song läuft:
   Einstieg im laufenden Takt. **CLIPS:** jede Spur, die du startest/stoppst, wird ab ihrem ersten Ereignis bis zum Ende ersetzt,
   danach spielt der alte Teil weiter („Bandmaschine“); **AKKORDE:** Takte mit neuem Akkord werden ersetzt (¼-Schlag-Vorgriff,
   je Takt gewinnt der jüngste Durchgang), der Song spielt seine übrigen Akkorde weiter; **MELODIE:** Overdub. Mit gelber Auswahl
   steigt die Aufnahme am Auswahlende von selbst aus; mit SCHLEIFE ist jeder Durchgang Teil derselben Aufnahme (nach jedem
   Durchgang folgen die aufgenommenen Spuren dem neuen Stand). Nach dem Ende folgen die aufgenommenen Spuren wieder dem Song.
   **Ein Undo für die ganze Aufnahme.** Szenen-Clips bleiben unberührt (EN7-04). Leerer Song: wie WP6 (alles, SG1–SG8).
2. **● zeigt die Ziele** („● MEL“, „● AKK+MEL“, „● ALLES“; in der schmalen Spalte zweizeilig). **Banner als Überlagerung**
   (N7S-02): rot in Lineal-Höhe über der Taktleiste („● Takt 3 · Überschreiben · AKK + MEL · Clips bleiben“), der aufgenommene
   Bereich rot 12 % getönt, die beschriebenen Zeilen rot gesäumt; **in der Clip-Ansicht in der Kopfzeile** über BPM … ≡ (K2-63,
   gleiche Höhe, Tipp = Song zeigen), nie über Raster oder Teil-Leiste. Nichts verschiebt sich (±2 px gemessen).
3. **Taktleiste wählt (N7-R7, N7S-06):** Tipp auf eine Taktnummer = Positionsmarke ▼ + gelber Chip (#ffb22e, dunkle Zahl, Band
   35 % / Zeilen 7 %), zweite Nummer = Bereich, Tipp in die Auswahl hebt sie auf. **Kein Sprung** bei laufendem Song.
4. **▶ oben im Song = ▶ SONG (EN-06):** ab der Positionsmarke, sonst ab dem Takt, in dem zuletzt gestoppt wurde; die Taste zeigt
   „SONG“ unter ▶ (Breite gleich). **[⏮]** in der Song-Transportzeile setzt auf Takt 1. ▶ SONG in der Zeile startet ebenso an der
   Marke. Song-Ansicht zu: ▶ wie WP7.
5. **TA9 Träger gehören dem Song (N0c):** Start von ▶ SONG / ● SONG merkt Ziel, Latch, Modus, Verschiebung; sobald keins mehr läuft
   (Ende, ■, Ende einer Aufnahme auch bei laufenden Szenen), kommt der Stand im selben Moment zurück – Toast „Träger zurück auf
   ORIGINAL“ mit [F behalten]. Song-Daten unverändert, Harmonie-Kern unverändert (I-01).
6. **SCHLEIFE (S-02, N7S-07):** Text-Taste **[SCHLEIFE: aus │ Song │ Takt 3–4]** (zweizeilig, P1 83×40) → Blatt [aus] [Song]
   [Bereich] (Bereich = gelbe Auswahl, sonst der Takt der Marke). Auf dem Lineal **grüne 3-px-Linie** mit Griffen ┃ (Treffer
   36 × 34, Ziehen mit stehender Ansicht, ein Undo); Gelb und Grün überlagern sich nicht. Daten `song.loop = {on, a, b}`
   (Migration `loop:true|false` → `{on, a:0, b:bars}`), am Bereichsende Sprung an den Anfang **phasengleich**; eine Schleife über
   den ganzen Song spielt bitgleich wie vorher (gegen G3-klein-fix gemessen). API `songLoop(on)` unverändert, neu `songLoopRange`.
7. **Akkorde von Hand (S-03, N7-R10):** Etikett **AKKORDE** (statt TRÄGER). Tipp auf einen Chip → **Akkord-Auswahl** für genau
   diesen Eintrag (Schlag bleibt, z. B. 6,5), Tipp auf eine leere Stelle → neuer Eintrag am Taktanfang (ersetzt den Takt).
   Blatt über der Tastatur (P ≈ 216 px, L zweispaltig ≈ 150 px): Kopf „AKKORD · Takt 4, Schlag 1“, aktueller Chip → **Text ⌨**
   (`parseChord`: Am, A#m7, Bb/B/H je nach Notennamen, C/E, Fmaj7, Gsus, Esus2, D5, F#m7b5, Cdim7, Eaug, C+, Am6, Cadd9, Cis, Es …;
   ungültig rot mit „z. B. Am7/G“), [✓] [ORIG.] [Löschen]; **Stufe** (7 leitereigene Dreiklänge der Tonart an dieser Stelle, in
   Moll zusätzlich „V (Dur)“, wischbar), **Zuletzt** (Träger-Verlauf), **[Frei ▾]** (Grund 12 · Art 15 · Bass, [Übernehmen]),
   [Akkorde quantisieren …]. Ein Undo je Änderung, Toast „Takt 4: Dm7 · [Rückgängig]“. Lang-Druck auf einen Chip löscht wie WP6.
   Ohne [♪ greifen] und [÷2] (Spec), ohne [– halten] (bei Song-Einträgen sinnlos).
8. **Akkorde quantisieren (N7-R11):** Etikett AKKORDE → [Akkorde quantisieren …] / [Akkorde (in Takt a–b) löschen]; Mini-Blatt
   Bereich [Auswahl │ ganzer Song], Raster [Takt │ ½ Takt │ Schlag], Vorschau „6 Akkorde · 5 rücken · 1 fällt zusammen“,
   [Quantisieren] = ein Undo, Toast mit den Zahlen. Regel: nächster Rasterpunkt (Gleichstand: der spätere), mehrere auf einem
   Punkt → der zuletzt gespielte gewinnt, danach gleiche Akkorde hintereinander → der spätere fällt weg; ORIGINAL zählt als Akkord;
   außerhalb der Auswahl bleibt alles deep-equal.
9. **Melodie verständlich (S-04):** Zeile „MELODIE · S4 · ⇅ fest“. Melodie-Spur-Vorschlag beim ersten ● SONG bzw. bei einer
   Melodie-Aufnahme ohne Melodie: die gewählte Spur, wenn sie frei ist, sonst eine Synth-Spur ohne Clips im Song (nicht MONO/LEGATO
   bevorzugt). Spielt die Melodie-Spur Clips mit MONO/LEGATO-Klang: Toast „Melodie und Clips teilen sich eine Stimme – Melodie
   klingt abgehackt“ mit [Freie Spur nehmen] (ein Undo).
10. **Hilfe** (Menü → Hilfe): SONG-AUFNAHME, TAKTLEISTE IM SONG, SCHLEIFE, AKKORDE IM SONG, TRÄGER GEHÖREN DEM SONG, MELODIE IM SONG.
11. **Test-API:** `songLoopRange`, `songRecTargets`, `songRecFrom({from, to, preroll, targets})` (nur 'over'), `songPos`,
    `songSelect`, `songSetChord(bar, chord, {k})`, `parseChord(text, {names})`, `quantizeChords({grid, a, b, dry})`,
    `openChordPick`, `openRecStart`; `runtime().song` + `posBar`, `pos`, `sel`, `targets`, `recFrom`, `recTo`, `loop`, `beat`,
    `carrierSaved`. Alte Namen unverändert (`songRec`, `songPlay`, `songLoop`, `songMel`).

**Abnahme** (`dirigent-test/`, Chromium + CDP-Touch, 240 BPM; Skripte `v3-v0c-song.mjs` P/L 40/0, `v3-v0c-ui.mjs`
P/P375/P320/L/L667 je 41/0, `v3-v0c-frei.mjs` 6/0)

| ID | Ergebnis | Messung |
|---|---|---|
| V0c-01 | ✓ Ziel AKKORDE: Lanes und Melodie deep-equal, F in Takt 2 (4,80), G ersetzt C in Takt 3 (8,97), Rest unverändert; ein Undo → deep-equal | song P/L |
| V0c-02 | ✓ Ziel MELODIE: Lanes + Träger deep-equal, 3 Noten zusätzlich an den gespielten Schlägen (±0,02) | song |
| V0c-03 | ✓ Ziel CLIPS: Start Spur 2 in Takt 3 → nur Lane 2 ab Takt 3 ersetzt, alle anderen deep-equal; nach dem Ende spielt der alte Teil weiter | song |
| V0c-04 | ✓ leerer Song: alle Ziele an; `wp6-song` P/L 27/0 (SG1–SG8) | wp6-song |
| V0c-05 | ✓ Banner mit Ziel und Starttakt, ●-Chip „● MEL“ → „● AKK+MEL“, Start-Blatt „überschreibt Akkorde, Melodie ab Takt 3“ | ui ×5 |
| V0c-06 | ✓ SCHLEIFE 83×40 (P1) / 76×37–39 (L); `songLoopRange({on:true,a:2,b:4})`: 3 Durchläufe, jede Note ±0,002 Schlag, an Takt 3 der 3. Clip-Takt (phasengleich) | song, ui |
| V0c-07 | ✓ Migration `loop:true` → `{on:true,a:0,b:3}`; Wiedergabe gegen G3-klein-fix identisch (noteLog > 40 Noten, ±0,002); `songLoop(true/false)` boolean, Bereich bleibt | song |
| V0c-08 | ✓ Tipp AKKORDE-Zelle Takt 5 → „Dm7“ ⏎ → Schlag 16, D, m7, ein Undo; Wiedergabe ruft Dm7 bei Song-Schlag 16 ab (±0,01); hörbar: F in Takt 2 macht aus 45 → 53 | ui, song |
| V0c-09 | ✓ alle 16 Fälle + Es, Cism; X7 und Am/Q → null | song |
| V0c-10 | ✓ Demo-artig (Synth 1–3 mit Clips) → Synth 4; MONO-Spur mit Clips → Toast mit [Freie Spur nehmen] → Synth 4 | song |
| V0c-11 | ✓ Regression (unten); M-PLATZ Song-Ansicht + Blätter in P1–P3, L1, L2; Zeilen 44,4 / 32,1 / 28,7 / 27,3 / 25,9 px (L2 wie V0a) | ui |
| N0c-01 | ✓ ■ oben, ▶ oben (Touch auf `#bPlay`) → `song.play`, kein Szenen-Start, Taste zeigt „SONG“ | ui |
| N0c-02 | ✓ ■ in Takt 5, ▶ oben → erstes Ereignis bei Song-Schlag 16 ± 0,002; Marke Takt 3 hat Vorrang; [⏮] → Takt 1 | song, ui |
| N0c-03 | ✓ Song-Ansicht zu: ▶ startet die Szenen | ui |
| TA9 | ✓ Xanders Weg I2: leerer Song, Szenen laufen, ● SONG, F gespielt, ● Ende → Träger ORIGINAL, Szenen laufen weiter, Bass 48 statt 53; Toast mit [F behalten] | song |
| N7S-01 | ✓ Canvas P1 306×330,8, L1 392×207,4 (= V0a, auch P2/P3/L2); Ziele im Start-Blatt und beim Halten auf ● | ui |
| N7S-02 | ✓ während ● alle Elemente ±2 px gleich; Bereich rot getönt (Pixelprobe) | ui |
| N7S-03 | ✓ Chip bei 6,5 → Dm7 bei 6,5; per Touch „Takt 2, Schlag 3,5“, Stufen-Chip lässt den Schlag | song, ui |
| N7S-04 | ✓ Am 0 · F 3,8 · C 8,3 · G 11,6 · G 12,2 · Am 16,1 → Am 0 · F 4 · C 8 · G 12 · Am 16, `{moved:5, merged:1}`, Toast, ein Undo | song |
| N7S-05 | ✓ ½ Takt: C 9,9 → 10, G 11,1 → 12; Auswahl T3: außerhalb deep-equal | song |
| N7S-06 | ✓ „3“ → `songPos()` 2, `songSelect()` {2,2}, Chip (255,178,46) ±12, Zahl dunkel; „5“ → {2,4}; Tipp hinein → null; laufend kein Neustart (noteLog ohne Lücke); ▶ oben startet bei T3 | ui |
| N7S-07 | ✓ grüne Linie (Pixel oben grün, Lineal-Mitte amber), Griff am Bereichsanfang; Griff ziehen → Takt 3–5, Ansicht steht, ein Undo | ui |
| FP-SONG | ✓ ● über laufende Clips → Song am nächsten Taktstrich; Schleifen-Durchgänge (jüngster gewinnt, Melodie im Bereich, ein Undo); Auswahl-Aufnahme steigt selbst aus; `S.tracks[].clips` deep-equal; Speichern/Laden mit Bereich, WP6-Dateien migrieren | song |

**Regression** (`v3-v0c-reg.sh` = V4c-Liste mit Versionskopien `v3-v0c-adapt-*` für 3.11.1, `v3-v0c-reg2.sh`, `v3-v0c-reg3.sh`
= G3-Suiten + V0c-Suiten; Ausgaben `dirigent-test/v3-v0c-reg/`): rot nur, was auf G3-klein-fix bzw. V4c genauso rot ist
(`node-fm`, `v3-v0b-adapt-wp3-browser` PR2, `-wp3-ui` MO49, `wp4-offline`, `wp3-adapt-func-build(-native)` C2/D5, `v3-v4bfix-big`,
`v3-v4b-node` N7F-34 – auf dem Snapshot identisch 14/15, `fp4f-loop` 1/10 wie vorher, `v3-v4a-node` N7F-09 Last), dazu unter Last
rot und allein bzw. auf dem Snapshot gleich: `wp6-song-P` SG4 (allein P/L 27/0, Snapshot ebenso), `v3-v0b-adapt-v0a-fix` V0a-16 L
(150-ms-Probe, auf G3-klein-fix 3 × ebenso rot), `wp7-adapt-wp1-perf` PE1 Bildzahl (Snapshot identisch 8/2), `v3-v4a-ui` N7F-10
CPU 13,2 % (Last). `v3-v0c-adapt-wp1-misc` nach Korrektur der Versionskopie 104/0. Grün u. a. alle DoD-Läufe (wp1–wp7, 60 s),
`wp1-dod` (Startzeit), `v3-v0b-follow` 52/0, `wp6-drums` P/L, V0d-, V4a-, V4b-, V4f-, V4c-Suiten, `v3-g3fix-*`, Smoke ohne Fehler.

**Fach-Prüfung** (Teil J: FP-TOUCH Haupt-, FP-SONG Zweit-Blick; als zweiter Durchgang über Diff, Tests und Bilder auf mich selbst
angewandt – ein eigener Agent stand in diesem Bau nicht zur Verfügung). **11 Befunde, alle behoben:**
1. FP-TOUCH: Segmente (Vorlauf, Art/Bass, Bereich/Raster) in den berührungsgeschützten Blättern reagierten nicht auf den Finger
   (guardTouch unterdrückt den synthetischen Klick) → `bindSegTap`; Touch-Tests dafür.
2. FP-TOUCH: [✕] der Blätter 44×32 → 44×40.
3. FP-TOUCH: Start-Blatt im Querformat 245 px hoch (verdeckte den Song) → zweispaltig ≈ 150 px.
4. FP-TOUCH: ●-Beschriftung „AKK+MEL“ in der 37-px-Spalte (L, P3) abgeschnitten → zweizeilig.
5. FP-TOUCH: Banner-Texte im Hochformat abgeschnitten (Song: „… Clips bleibe“, Kopfzeile „ab Ta“) → Kurzformen nach Breite.
6. FP-TOUCH: „MELODIE“/„AKKORDE“ im schmalen Etikett abgeschnitten → kleinere Schrift in der Seitenspalte.
7. FP-SONG: ↶/↷ während einer Aufnahme hätte den Song unter der laufenden Aufnahme getauscht → „Erst Aufnahme beenden“.
8. FP-SONG: ein Song, der hinter der Abspielmarke endet (kürzer gemacht, oder Aufnahme über das Ende ohne Inhalt dort), lief stumm
   weiter → endet sofort.
9. FP-SONG: die Abspielmarke sprang nach einem Bereichs-Sprung ≈ 100 ms zu früh (Planer schon im nächsten Durchgang) → `songBeatOf`.
10. FP-SONG: Einstieg bei laufendem Song erst am nächsten Taktstrich – Melodie-Noten davor gingen verloren → Einstieg im laufenden Takt.
11. FP-SONG / M-ANSICHT: [↩ SONG] konnte während der Aufnahme erscheinen und die Transportzeile umbrechen → während ● verborgen,
    die aufgenommenen Spuren werden am Ende zurückgegeben.
Begründet, nicht geändert: Transportzeile 40 px hoch (V0a; N7S-01 verlangt den Canvas unverändert), [S4 ▾] 33–41 px breit und ●/▶
in der Seitenspalte 30–37 px breit (V0a-Stand); Griff-Trefferzone 36 × 34 reicht bis in die erste Zeile – ein Wisch, der genau auf
einem Griff beginnt, verschiebt den Griff statt zu rollen (ein Undo, LCD-Hinweis); TA9-Toast nach jedem Song-Ende mit Akkorden (Spec).

**Abweichungen**
1. **[● MEL.] ist aus der Transportzeile entfernt** (V2e-Plan vorgezogen): ● mit Ziel MELODIE macht dasselbe (Overdub, Einstieg im
   laufenden Takt), zwei „● MEL“ nebeneinander wären verwirrend; API `songMel` bleibt, ebenso [S4 ▾].
2. „Verlassen des Song-Modus“ (TA9) = Ende der Song-Wiedergabe, nicht das Schließen der Song-Ansicht (der Song darf bei offener
   Clip-Ansicht weiterspielen wie in WP6).
3. Aufnahme über das Song-Ende hinaus verlängert den Song, wenn dort etwas aufgenommen wurde (Bandmaschine; Spec sagt dazu nichts).
4. Stufen-Chips nach der Tonart, die an dieser Stelle klingt (`songKeyAtBar`); Song-Tonart kommt mit V2f. [Für alle „Strophe“] erst mit V2e (Marken).
5. Kopfzeilen-Banner liegt über BPM … ≡ – einen Projekttitel gibt es in `#top` nicht (K2-63 „an der Stelle des Projekttitels“).
6. V0c kennt nur „Überschreiben“ (wie Spec); „Einfügen“, „Ersetzen/Overdub im Bereich“ und NOTEN auf anderen Spuren: V2d′.
7. **Größe +64,4 KB** statt +42 KB (+53 %, über der 50-%-Regel): Aufnahme-Ziele mit Durchgängen/Bereich/Rückgabe (≈ 12 KB),
   ChordPick mit Frei/Text/Stufen (≈ 11 KB), Start-Blatt, Schleifen- und AKKORDE-Blätter (≈ 8 KB), N0c TA9/EN-06 (≈ 5 KB),
   Taktleiste/Schleife/Banner-Zeichnung (≈ 6 KB), `parseChord`/Quantisieren (≈ 5 KB), CSS (≈ 9 KB), Hilfe und Kommentare.
   Datei 1,88 MB (Grenze 5,0 MB), Startzeit-Abnahme (`wp1-dod`) grün.

**iPhone-Prüfpunkte für Xander** (N2-0c-01 + Nachtrag 1 C.5 Punkt 3)
1. Song-Ansicht: einen Akkord-Chip antippen, „Dm7“ eintippen, ⏎ – der Chip heißt Dm7, Schlag gleich; ↶ holt den alten.
2. Etikett AKKORDE → „Akkorde quantisieren …“ → Raster Takt → [Quantisieren]: alle Chips stehen auf den Taktstrichen.
3. Auf die Taktnummer 3 tippen: gelb; ▶ oben (zeigt „SONG“) startet dort, nicht die Szenen.
4. Szenen laufen, leerer Song: ● SONG, einen Akkord (F) spielen, ● beenden → die Szenen spielen wieder untransponiert, Toast [F behalten].
5. Song mit Inhalt: ● → Start-Blatt, nur AKKORDE an, [● START], in Takt 2 einen anderen Akkord spielen, ● → nur Takt 2 hat sich geändert.
6. SCHLEIFE → Bereich (vorher Takt 3–4 gelb wählen) → die grüne Linie; den rechten Griff ziehen. (Noten in der Melodie-Rolle während
   ▶ SONG treffen: V0b, unverändert.)

Fähigkeiten-Summe unverändert (V0c deklariert keine Fähigkeit). Für Xander im Dashboard: nichts.

**Bekannte Lücken:** kein WebKit-/iPhone-Test (Chromium + CDP-Touch); der Zwischenstand an Artifact-Adresse und Pages-Seite
(EN-20/EN2-15) ist Sache des Orchestrators; Text-Eingabe mit iOS-Tastatur nicht am Gerät geprüft (das Blatt springt beim Fokus
nach oben).
