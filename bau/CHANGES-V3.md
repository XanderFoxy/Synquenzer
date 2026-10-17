# CHANGES-V3 — SYNQUENZER v3

Fähigkeiten-Summe (EN-19, B.0), fortgeschrieben je Paket:

```js
capabilities: {
  downloads: { /* wie bisher – Form der letzten v2-Veröffentlichung, in den Dateien nicht festgehalten (vor VC1 nachsehen) */ },
}
```

V0a fügt keine Fähigkeit hinzu. Die App läuft weiter ohne jede Fähigkeit (`use()` → `null`, EN-13).

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
