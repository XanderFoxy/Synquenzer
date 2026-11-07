# SP1 – Synthie-Pop-Klangkiste (Basis 4.42.0)

## 1. Für Xander

- In jeder Synth-Spur: **SOUNDS** öffnen → neuer Chip **Synthie-Pop FX** (hinter „Init“). Dort liegen 20 neue Werksklänge: Computer-Dialing, Daten-Blubbern, Modem-Zirpen, Roboter-Blips, Laser-Zap, Resonanz-Sweep, Nasser Filter-Wah, Resonanz-Pfeifen und Funk-Arp-Blubber, dazu die Flächen Schwebe-Fläche, Strings-Ensemble, Chor-Pad, Morph-Sweep-Pad, Glas-Fläche, Glas-Pad FM, Schwebe-Strings und Bit-Schwebe.
- Unter VA siehst du die VA-Klänge, unter FM, WT, MS-Platte und Bit Mask die jeweils eigenen. Mit **Alle Engines** siehst du alle 20 auf einmal.
- Mit ▶ hörst du vor, ein Tipp auf den Namen lädt (↶ holt den alten Klang zurück), und ⓘ erklärt den Trick.
- Das **Mod-Rad** ist bei jedem Klang das Makro: Nässe (Resonanz), Schweben (Verstimmung) oder heller. Auf der Platte und bei Bit Mask macht es das Blubbern schneller (Blubber-Tempo).
- Alle Klänge sind so laut wie die übrigen Werksklänge (−18 LUFS). Nichts übersteuert, keiner ist stumm.

## 2. Technik

- **Ein neuer Block** `SP1-BEGIN … SP1-END` (154 Zeilen, nur eingefügt, 0 Zeilen geändert), direkt nach `const SYNTH_LIB = FACTORY.concat(BM_FACTORY, INIT_SYNTH);`.
  Der Text ist genau `lab/sp1-block.js`. `lab/apply.mjs` baut `index.html` = basis.html + dieser Block (gut für den 3-Wege-Merge).
- `const SP1 = (function () {…})()` gibt `{ROLE: 'spop', LABEL: 'Synthie-Pop FX', list, ids()}` zurück. Darin stehen nur lokale Helfer: `FXo, M, rec, VA, WT, FM (FMB, OP, OFF), MK, BMr, ECHO8`.
- Werks-Einträge haben die id `f-sp-*`, `role: 'spop'` und `cat` `'effekt'` oder `'flaeche'`. Die übrigen Felder `engine / ev / demo / ref / tip / p / mods / fx / bus` sind wie bei den vorhandenen Werksklängen:
  - VA (11): `p` ist ein sparse diff über ANALOG_BASE, wie bei `A()`.
  - WT (3): wie WT_FACTORY (ev 2, `p.wt`).
  - FM (2): flache Schlüssel wie FM_BASE plus `p.fm6` und **kein** `common`, damit LFO 1 auf S&H stehen darf.
  - Platte `mk` (2): `SQMK.init()` mit geänderten Pfaden → `SQMK.normMk`, `p` = INIT_VA_P plus `level .457`, `mw`, `mk`.
  - Bit Mask `bm` (2): `SQBM.init()` mit geänderten Pfaden → `SQBM.normBm`.
- Einhängen:
  - `FACTORY_BY_ID.set` und `FACTORY.push(...)` (an das Ende).
  - `SYNTH_LIB.splice` vor dem ersten INIT-Klang (dasselbe Muster wie die Platten-Programme).
  - `BROLES.push(['spop', 'Synthie-Pop FX'])`, `BM_ROLES.push(…)` (beide am Ende) und `ROLE_LABEL.spop`.
- Nicht angefasst: Engines, CSS, Projektformat, VERSION und CHANGES. Es gibt keine neuen Projekt-Felder, alte Projekte laden unverändert. Die Datei wird 19,8 KB größer, der Start bleibt gleich (nur Daten).
- Makros (Mod-Rad):
  - VA und FM: Routen `mw → res / unidet / fenv / noise / fmbright`, Knopf „Mod-Rad“ (`p.mw`).
  - Platte: PATCH 3 MOD-RAD → LFO 2 FREQ (Blubber-Tempo) bzw. → OSZ 2 TONH. (Schweben).
  - Bit Mask: Mod-Rad-Ziele `l1s` (Tempo) plus `fx2b` (Echo) bzw. `l1a` und `l2a`.

| Klang | Engine | Phrase | Trick | Mod-Rad |
|---|---|---|---|---|
| Computer-Dialing | VA | fx | S&H 1/16 → Tonhöhe ±12 HT + Cutoff, LFO 2 Rechteck tastet Lautstärke, Echo | Nässe |
| Daten-Blubbern | VA | fx | S&H 1/32 → Cutoff ±30 HT, Res 90 % | Nässe |
| Modem-Zirpen | VA | fx | S&H 22 Hz → Tonhöhe ±18 HT, HP, Rauschen, 11 Hz Zerhacken | Rauschen |
| Roboter-Blips | VA | seq8 | Sinus hoch, Hüllk. 2 → Tonhöhe, S&H ±7 HT je Blip | Nässe |
| Laser-Zap | VA | seq8 | Hüllk. 2 → Tonhöhe +24 HT in 180 ms | Nässe |
| Resonanz-Sweep | VA | lead | Res 105 %, Keytrack 100 %, Sweep landet gestimmt auf der Oktave | weiterer Sweep |
| Nasser Filter-Wah | VA | chord | LFO-Dreieck 1/4 → Cutoff ±36 HT, Chorus + Echo | Nässe |
| Resonanz-Pfeifen | VA | arp | Res 110 % pfeift gestimmt 2 Okt. über der Note | höherer Ansatz |
| Funk-Arp-Blubber | VA | arp | Res 82 %, Filter-Hk. 120 ms + S&H 1/16 | Nässe |
| Schwebe-Fläche | VA | pad | 5× Unisono + 2 Osz, LFO 0,12 Hz, ENS, langer Hall | Schweben |
| Strings-Ensemble | VA | chord | 3× Säge + Oktave, ENS-Chorus, Vibrato nach 1 s | Schweben |
| Chor-Pad | WT | pad | Vokal-Tabelle scannt 4 s, ENS, Hall | – |
| Morph-Sweep-Pad | WT | pad | Digital-Tabelle scannt 4 s + Filter-LFO 0,1 Hz | – |
| Glas-Fläche | WT | pad | Glas-Tabelle, langsamer Scan | – |
| Daten-Zirpen FM | FM | fx | S&H 1/16 → Tonhöhe + Helligkeit, Rechteck-Gate | heller |
| Glas-Pad FM | FM | pad | 3 Paare (Alg. 5), 7:1-Glanz, langsam | heller |
| Zufalls-Blubber | Platte | fx | LFO 2 S/H → Cutoff + Tonhöhe, Delay 1/8. | Blubber-Tempo |
| Schwebe-Strings | Platte | chord | 2 Sägen verstimmt, Ensemble | Schweben |
| Bit-Dialing | Bit Mask | fx | LFO 1 Zufall → Tonhöhe, LFO 2 Rechteck → Lautstärke | Tempo + Echo |
| Bit-Schwebe | Bit Mask | pad | 2 Masken verstimmt, LFOs auf Filter und Maske, CH4 + RV2 | Schweben |

## 3. Tests und Ergebnis

- **`sp1-test.mjs`** (ein Skript, Ergebnis 24/24 OK):
  - Registrierung, Rolle und Chip am Ende; Namen eindeutig, auch gegen die Platten-Programme.
  - Jeder Klang lädt mit „geändert“ aus.
  - Chip hochkant und quer: Text ganz (119 × 36 bzw. 107 × 32 px, Trefferfläche wie die übrigen Chips); ✕ sichtbar.
  - 11 VA-Zeilen. Der Chip erscheint auch unter FM, WT, Platte und Bit Mask; unter „Alle Engines“ stehen 20.
  - Tipp auf den Namen lädt, ↶ holt den alten Klang zurück; ▶ und ■ beim Vorhören.
  - Laden über die Engines hinweg; Speichern → Laden ist gleich.
- **Pegel**, gemessen mit `mkRender` / `bmRender` auf der Vorhör-Phrase bei 112 BPM, BS.1770-LUFS:
  - Die Methode ist geeicht: Juno-Pad, Rom-Fläche, Mini-Lead und Pop-Pluck messen −17,8 bis −17,9.
  - Neu: alle −17,9 … −19,1 LUFS trocken, Spitze ≤ −1,9 dBFS, kein NaN.
  - Song-Render (`vvRender`, mit Hall, Echo und Master): −18,6 … −22,1 LUFS, Spitze ≤ −5,9 dBFS. Keiner ist stumm.
  - WT wurde über den Song-Render gegen das Juno-Pad abgeglichen.
- **Klang-Prüfung** (lab):
  - Resonanz-Sweep landet genau auf der Oktave (C4 → 527 Hz, D → 586, Es → 621, G → 785, F → 703).
  - Resonanz-Pfeifen trifft zwei Oktaven darüber (1043/1240/1568/1862/2093 Hz).
  - Bei Computer-Dialing, Modem und Zirpen FM springt die Tonhöhe je Schritt, und es gibt Gate-Lücken von −60 dB.
  - Wah: der Schwerpunkt pendelt im Viertel-Takt zwischen 150 und 2700 Hz.
  - Mod-Rad wirkt (Zirpen FM heller: Schwerpunkt 440 → 1400 Hz; Platte schneller).
- **Pflicht-Prüfungen:**
  - topdefs: 26 Skripte, 0 doppelt, 0 Syntaxfehler (1 Name mehr: `SP1`).
  - Rauchtest: errors [].
  - Marken 0, „MS 2000“ 1×, `  live: true,` 1×.
- Fotos: `sp1-p-browser.png` (hochkant, Chip + ⓘ), `sp1-l-browser.png` (quer, Chip-Spalte), `sp1-l-alle.png` (quer, alle Engines), `smoke.png`.
- Hilfswerkzeuge in `lab/`: `apply.mjs` (Bau), `lab.mjs` (trocken: Pegel, Tonhöhe, Schwerpunkt, Varianten), `vvlab.mjs` (Song-Render), `det.mjs` (Gleichheit zweier Renders).

## 4. Offen und Risiken

- **Engine-Befund (gemeldet, nicht geändert):** Im Song-Render hat Sample & Hold keinen festen Startwert.
  - Ursache: VA und FM im Worklet holen den Zufall direkt aus `Math.random` (`gsh1/gsh2`, `sh1/sh2`; in 4.42.0 die Zeilen ~16048, 16779, 16795, 17713). Die Platte und WT nativ sind ebenfalls nicht bitgleich.
  - Folge: Zwei Audio-Renders desselben Songs unterscheiden sich in den Zufallswerten. Das gilt schon für das alte „Nass & Quietsch“.
  - Bit Mask ist bitgleich, Juno-Pad (ohne S&H) auch.
  - Lösung wäre ein Startwert je Render (wie `{mkSeed}`). Das ist eine Engine-Änderung, also ein eigenes Paket.
- **Super-Regler:** Er gilt für das ganze Projekt (`S.sr`) und lässt sich nicht im Klang speichern. Deshalb sind die Makros auf das Mod-Rad gelegt.
  - „Blubber-Tempo“ per Mod-Rad gibt es nur auf der Platte und bei Bit Mask.
  - VA hat kein Modulationsziel „LFO-Tempo“. Dort geht es über die LFO-1-Rate oder über einen Super-Regler auf `l1rate`.
- Bei Bit Mask ist das Mod-Rad ein Live-Rad (wird nicht gespeichert); es wirkt nur beim Drehen.
- Chip-Platz: „Synthie-Pop FX“ steht hinter „Init“ (neue Einträge ans Ende). Soll er weiter vorn stehen, bitte sagen.
- Absichtlich überholte Test-Erwartungen: `SYNQUENZER.factory()` hat jetzt 66 statt 46 Einträge. `browserRows()` unter VA bzw. „Alle“ wächst um 11 bzw. 20.
- Merge: Der Block steht direkt hinter der `SYNTH_LIB`-Zeile. Fügt ein anderes Paket dort auch etwas ein, bleiben beide Blöcke hintereinander stehen; die Reihenfolge ist egal.
- Die Klänge sind nur offline gemessen und nicht auf dem iPhone abgehört; das bleibt Xanders Abnahme.
- Die CPU auf dem iPhone ist nicht gemessen. Die Schwebe-Fläche (5× Unisono + 2 Osz, 6 Stimmen) liegt unter der vorhandenen Rom-Fläche (7× Unisono).
