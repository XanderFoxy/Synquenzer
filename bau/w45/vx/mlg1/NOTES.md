# MLG1 – Klang aus DAW-Datei (analoger DAW-Synth → Analog-Motor) + 10 Retro-Werksklänge

Basis: rel-4780 (`basis.html`, md5 68e92c03), VERSION bleibt 4.78.0. Bau: `python3 apply.py` → `index.html`.
Block `/* MLG1-BEGIN */ … /* MLG1-END */` (vor dem Start, nach UPD-END) + 2 einzeilige Haken mit Kennung MLG1.
Keine Songdaten, keine Songtitel, keine Markennamen in Oberfläche oder Code (Test prüft das). Die Songklänge liegen nur privat
außerhalb des Pakets.

## 1. Was gebaut ist

| Teil | Wo | Was |
|---|---|---|
| Parser | `mlgCore().parse(b64 \| Uint8Array)` | Parameter-Baum des Synths (u32 Länge, Schlüssel, u16 Typ; 8 = Text, 2/6 = Ordner, 2/7 = Binär) → `{Hex-ID: Anzeigetext}`; BOM entfernt; robust (Wächter, Teilergebnis ab 20 Werten) |
| .cbp-Leser | `mlgCore().cbp(u8)` | Kennung + XOR 0x7C + CBOR (eigener kleiner Decoder), nur `Buses[].Track.Instrument` mit PluginId 1 → `[{nr, name, preset, patch}]`. Nur lesen, nichts wird gesendet |
| Übersetzer | `mlToVa(patch, name)` (DOM-frei) | → `{sound, rep: {ok, appr, miss}, echo}`; `sound.bus.echo` = Vorschlag für das Projekt-Echo |
| Werksklänge | `mlgWerk()` | 10 eigene Klänge im Klartext-Format des Synths (eigene Werte, keine fremden Presets), durch denselben Übersetzer: Retro-Bass Rund/Tief, Retro-Lead Hell/Weich, Retro-Fläche Warm/Hauch, Retro-Pluck, Retro-Stab, Retro-Sequenz, Retro-Resonanz |
| Bedienung | Klang-Browser, Fuß: **„Aus DAW-Datei“** (nur Synth-Spuren) | Datei wählen → Blatt „Klang aus DAW-Datei übernehmen“ mit allen Synth-Spuren (Wellen, Cutoff, Zahl angenähert/fehlt) → Antippen lädt auf die Spur (ein ↶). Danach „↳ Hall/Echo wie im Preset“ (vorhandener Knopf) stellt das Projekt-Echo ein (eigener ↶) |

Haken (je eine Zeile, Kennung MLG1):
1. nach `const FACTORY = SQF.ANALOG.concat(…)`: `FACTORY.push(...mlgWerk())` – Funktions-Deklarationen sind gehoben, der Kern nutzt keine Block-Konstanten (kein TDZ).
2. in `buildBrowser` nach `foot.append(…)`: `mlgFoot(foot, t)`.

Sichtbar neu (Regel 3): ein Knopf im Fuß des Klang-Browsers und 10 Zeilen in den Kategorien Bass/Lead/Fläche/Pluck/Poly/Sequenz/Effekte.
Sonst ändert sich nichts an Aussehen, Größe oder Bedienung.

## 2. Zuordnung (IDs aus PARAMS.md §3a, Kalibrierung K1 + MLG1)

| Synth (ID) | App `sound` | Umrechnung | Status |
|---|---|---|---|
| Welle 14/24 | `o1w/o2w` | Saw 0, Square 1, Triangle 2, Sine 3 | genau |
| Fußlage 10/20, Coarse 11/21, Fine 12/22 | `oNoct`, `oNsemi`, `oNfine` | Coarse außerhalb ±12 (Osz 2: −12…+24) wandert in die Fußlage (−24 → Fußlage −1, −12 HT) | genau |
| Volume 18/28, an 19/29, PW 15/25 | `oNlvl`, `oNpw` | % → 0…1 | genau |
| Typ 13/23 Multi, 16/17 | `oNuni`, `uniDet` | Stimmen auf 3/5/7 gerundet | angenähert |
| Phase 1A/2A | `reset` | „Free Phase“ → 0 | genau |
| Rauschen 34 (+35) | `noise` | × 2 (gemessen); Schalter aus bei beiden Osz. 0 % → an (so klingt die echte Spur); über 1 trägt der Klang-Pegel den Rest | angenähert |
| Filter 41/42/43 | `ftype`, `cutoff`, `res` | LP24 → 0; Hz direkt (> 20 kHz → 20 kHz); Resonanz % × 0,96; `bass = 1` (Original verliert bei Resonanz keinen Bass, K1) | angenähert |
| Filter-Hüllkurve 45 (±%) | `fenv` + Weg Filt.-Hk. → Cutoff | Menge × 137,4 HT (= ganzer Cutoff-Bereich 6 Hz·2800^n, K1); bis 72 HT über `fenv`, Rest über den Weg (120 HT/Einheit) | kalibriert |
| Key Follow 46 (±200 %) | `kt` + Weg Tonhöhe → Cutoff | 0…100 % → `kt`; Rest/negativ: Weg mit (kf − kt)/5 (Weg-Einheit = 5 HT/HT); Mitte C3 wie die App | genau im Wert |
| Hüllkurven 60–63, 64–67 | `fA…fR`, `aA…aR` | ms → s, % → 0…1; Grenzen der App A/D ≤ 10 s, R ≤ 15 s (als angenähert gemeldet) | angenähert über 10/15 s |
| Anschlag 50/69 | `ampVel = fvel = 0` | gemessen: das Original reagiert praktisch nicht (K1) | genau |
| Mono 2, Stimmen C, Glide 3/4 | `mode`, `poly`, `glide` | ms → s | genau |
| LFO 1/2 Welle/Rate 70/72, 80/82 | `l1shape/l1rate`, `l2…` | Tiefen der fest verdrahteten Wege stehen nicht im Klartext → keine Wege (gemeldet) | offen |
| Chorus 105/102/101/106 | `fx.chorus` | Modus I, Rate Hz / 0,5, Tiefe %/50, Mischung %/50 | angenähert |
| Delay 200/207/204/206/205 | `bus.echo` + `fx.dly` | **Modus st**: links X, rechts X/2 (Prüfung W1), Rückkopplung %, Hi-Cut 9 kHz; „D“ = punktiert; Anteil × 1,6 auf den Echo-Send. Exakt für 1/1 … 1/16 (rechts genau halbe Zeit, getestet) | Zeit genau, Klang angenähert |
| Pegel E | `level` | 0,55 × E/100 (gemessen: gleiche Lautheit wie das Original bei Fader 0 dB) | kalibriert |

## 3. Kalibrierung (gemessen, Zusammenfassung – Einzelwerte privat)

Methode: 14 Synth-Spuren eines echten Projekts, je zwei getrennte 8-s-Fenster (A, B). Offline-Render in Chromium durch die App-Engine
(Analog-Worklet über `SynthHost.track`, OfflineAudioContext) mit **denselben MIDI-Noten** wie im Original, gegen die echten Spur-Exporte.
Maße: Terzband-Abweichung (31,5 Hz–16 kHz, beide auf Gesamtpegel normiert, Bänder bis 45 dB unter dem lautesten), Pegel (dB RMS),
Spektral-Schwerpunkt, Hüllkurve (20-ms-RMS). Globale Konstanten per Gitter in Fenster A gewählt:

- Filter-Hüllkurve 72 / 90 / 100 / 110 / 120 / 137,4 HT → **137,4 HT** (Mittel 5,9 dB; 72 HT 11,2 dB, 90 HT 7,9 dB).
- Resonanz-Skala 0,85 / 0,96 / 1,05 → **0,96** (1,05 kippt einzelne Klänge in Eigenschwingung).
- Rauschen ×2 (Rausch-Klänge waren 12 dB zu leise), Pegel 0,55 (Median-Abweichung 0 dB).
- Offline-Render: ganz stille Ergebnisse (Nachrichten zu spät im Worklet, selten) werden erkannt und wiederholt.

Ergebnis:

| | Mittel Terz-Abweichung | Spuren ≤ 3 dB |
|---|---|---|
| nur Übersetzer (roh), Fenster A / B | 5,9 / 6,6 dB | 2 von 15 / 3 von 14 |
| Übersetzer + Spur-Ausgleich (gelernt in A, **gemessen in B**) | 2,6 dB | 11 von 14 (+1 Spur nur mit Fenster A: 1,9 dB) |

Die Restabweichung „roh“ kommt überwiegend aus den Inserts der Original-Spuren (EQ-Low-Cuts bis 2,5 kHz, Präsenz +5 dB bei 3 kHz,
Kanalzug, Amp-Simulation), die nicht im Synth stecken. Der Spur-Ausgleich ist ein Terzband-EQ (geglättet) je Spur und steht im privaten
Projekt. 3 Spuren erreichen 3 dB nicht: Amp-Simulation (Obertöne entstehen erst im Insert), Fenster mit anderer Lage als das Lern-Fenster,
und eine Spur, deren Export fast nur Hallfahne einer einzelnen Note ist.

## 4. Tests

- `node mlg1-core-test.mjs index.html` – Kern DOM-frei (vm): **30 OK, 0 FEHLER** (Parser, .cbp-Leser, Übersetzer inkl. Grenzen, Key Follow ±,
  Hüllkurve ±, Delay st für alle Notenwerte, Robustheit, Werksklänge, keine Markennamen).
- `node mlg1-test.mjs index.html` – Playwright Chromium, Touch, echter Datei-Wähler, 428×926 + 926×428, Fotos DPR 2: **33 OK, 0 FEHLER**
  (Knopf nur auf Synth-Spuren, falsche Datei → Meldung ohne Änderung, Liste ohne Sample-Spur, Klang = Kern, Echo st 1/4. | 1/8.,
  ↶ Echo, ↶ Klang, ↷, Rundreise, 10 Werksklänge in Liste + offline hörbar ohne Übersteuern, keine Konsolenfehler). Ausgabe `mlg1-test.out`.
- Testdatei `tests/test-3synth.cbp` aus `tests/gen_cbp.py` (eigene Werte).
- Pflicht (`pflicht.sh` → `pflicht.out`): topdefs 0 doppelt / 0 Syntaxfehler, dupkeys 0, Rauchtest ohne Fehler, „MS 2000“ 1×, „live: true,“ 1×,
  VERSION 4.78.0 wie Basis, Markenwörter nicht mehr als Basis, keine Emojis; Größe +26 KB roh / +9,4 KB gzip.

Fotos: `fotos/mlg1-{p,l}-browser.png`, `mlg1-{p,l}-liste.png`, `mlg1-{p,l}-geladen.png`, `mlg1-p-werk.png`, `smoke-end.png`.

## 5. Offen / Merge-Hinweise

- **XLA-Import**: XLA baut auf einem anderen Stand. Beim Zusammenführen in `xla-core.js` `soundFor` den Patch mitgeben (`tr._P`) und im
  Hauptfaden eine Zeile: `if (typeof mlToVa === 'function' && s.origin === 'daw:va' && s._P) s = mlToVa(s._P, s.name).sound;` – dann nutzt
  der Projekt-Import denselben kalibrierten Übersetzer statt `vaSound`. Kennung MLG1.
- LFO-Tiefen und Vibrato am Mod-Rad: stehen nicht im Klartext (Gruppe A0…BF) – eine Kalibrier-Aufnahme mit LFO-Fahrten würde sie klären.
- Ein Echo für alle Spuren: verschiedene Delay-Notenwerte mehrerer Spuren gehen nur über „Delay je Spur“ (BRUECKE C2).
- Hüllkurven über 10/15 s werden begrenzt (gemeldet). Ring/Sub sind nur übersetzt, wenn sie an sind (im Original-Projekt nie).
