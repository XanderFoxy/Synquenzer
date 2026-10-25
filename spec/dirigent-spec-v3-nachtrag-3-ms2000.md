# SYNQUENZER v3 — Nachtrag 3 zur Bau-Spezifikation: MS2000-Klangerzeuger (Pakete MK1–MK13)

Stand 25.10.2026 · Status: **Entwurf zur Freigabe.** Er gilt für den Bau, sobald der Orchestrator ihn Xander gezeigt hat. Bis Xander die offenen Fragen (Teil H) beantwortet, gilt jeweils die genannte **Vorgabe**. Builder und Tester lesen Spec v3, Nachtrag 1, Nachtrag 2 **und** diesen Nachtrag. **Vorrang für die MK-Pakete: Nachtrag 3 vor Nachtrag 2 vor Nachtrag 1 vor Spec v3.** Alles, was hier nicht geändert wird, bleibt gültig: L1–L10, M-Messverfahren und DoD der Spec, Teil J (Fach-Prüfung), EN2-28 (Größe), E.5 (Bau-Regeln).

## Überblick (für den Orchestrator)

- **13 Pakete** MK1–MK13, zusammen **≈ 82–96 h** reine Bauzeit. Dazu kommt die Fach-Prüfung mit 1–2 h je Paket. Die Datei wächst um **≈ +440 KB**. App-Version **4.9.0 → 4.21.0**. Das **Speicherformat** steigt nur einmal, mit MK1 (4 → 5).
- **Kern (MS2000 komplett):** MK1–MK7 bauen die Klangerzeugung, die Effekte, den Arpeggiator, den Mod-Sequenzer und den Vocoder. MK8 bringt eigene Werksklänge in 8 Genre-Bänken.
- **MK9** importiert eigene .syx/.prg-Dateien, nur lokal. Tor: ein Formatbeleg.
- **MK10** baut die Speicherwellen aus Xanders Aufnahmen. Tor: die Aufnahmen nach Teil D.
- **MK11–MK13** bringen die RADIAS-Teile ohne Samples: zweites Filter, Verzerrer, dritte Hüllkurve, Formant-Oszillator, mehr Stimmen.
- **Größe (wichtig, H-1):** Der Restplan ohne MK endet schon bei ≈ 4,98 MB, weil die gebauten Pakete über Plan lagen. Mit MK wären es ≈ 5,43 MB, also mehr als die Grenze von 5,0 MB (EN2-28). Die MK-Pakete selbst passen. Das Problem entsteht erst am Ende des Gesamtplans. Lösungswege stehen in H-1.
- **Was wiederverwendet wird:** der Stimmenpool von AnalogCore mit Ereignisprotokoll, Tempo, 30-ms-Stimmenblende und Lastbericht. Dazu Ladder-Filter mit 4 der 6 Abgriffe, polyBLEP-Säge/-Puls/-Sync, Hüllkurven-Kern, LFO-Formen und Mod-Matrix. Außerdem die Mipmap-Tabellen aus V4a, der Mikrofon-Weg aus VS1, der .syx-Dateiweg, sowie Bibliothek, Undo, Blatt-Rahmen und Regler. Neu ist alles, was A.12 nennt (Teil A).

---

## N3.0 Grundlagen

### N3.0.1 Xanders Plan (24.10.2026, verbindlich, Kurzfassung des Auftrags)

1. **Kern = kompletter MS2000-Klangerzeuger.** Dazu gehört die microKORG-Engine: 2 Oszillatoren mit allen Wellenformen und Modi inkl. Ring/Sync, Rauschen, Mixer, Filter mit allen Typen, 2 Hüllkurven, 2 LFOs, 4 virtuelle Patches, Timbres/Layer/Split, Stimmen-Modi, Mod-FX, Delay, EQ. Dazu kommen Mod-Sequenzer 3×16, 16-Band-Vocoder und Step-Arpeggiator.
2. **Oberfläche wiedererkennbar wie microKORG:** Bedien-Logik, Regler-Gruppen, Preset-Bänke nach Genres. **Kein Korg-Name, kein Logo, keine Werksdaten von Korg im Werk.** Die Presets sind eigene Klänge nach Kategorien. Eigene .prg/.syx-Dateien werden nur lokal im Browser importiert: nie hochladen, nie mitliefern.
3. **DWGS-Wellen kommen später aus Xanders eigenen microKORG-Aufnahmen** (Filter offen, OSC2 aus, Effekte aus, mehrere Oktaven). Das ist ein eigenes, späteres Paket mit Aufnahme-Anleitung. Bis dahin gibt es additiv nachgebildete Platzhalter, klar als Platzhalter markiert.
4. **Danach die RADIAS-Teile ohne Samples:** 2. Filter (seriell/parallel/individuell), Verzerrer/Drive, 3. Hüllkurve, Formant-Oszillator, mehr Stimmen. Kein 1:1-RADIAS.
5. **Muss auf dem iPhone 12 Pro Max flüssig laufen.** Dazu gehören ein Stimmen-Budget, CPU-Messung und AudioWorklet, wo nötig. WebGL nur, wo es wirklich etwas bringt. Dateigrenze 5,0 MB gesamt (EN2-28).
6. **Reihenfolge** (Nachtrag 2, „Korrektur 24.10.“): G-P1b → G-P2 (V2d′ ✓, V2e, V2e′, VS3) → **microKORG** → V2a′, V2c′ ✓, V2f, VL, V7a, VC2a, VS4 …

### N3.0.2 Quellen und Kürzel

| Kürzel | Quelle | Seitenangabe |
|---|---|---|
| **HB-MS** | `scratchpad/manuals/ms2000.txt`, MS2000/MS2000R Owner's Manual (83 S.) | gedruckte Seitenzahl „S. 39“. PDF-Seite = S. + 6 |
| **HB-MK** | `scratchpad/manuals/microkorg.txt`, microKORG Owner's Manual | gedruckte Seitenzahl. PDF-Seite = S. + 6. Die Listen am Ende (Voice Name List, Parameter List) haben keine Seitenzahl: „PDF 77/78“ |
| **KF** | `/home/user/synquenzer/forschung/r9/korg-familien.md` (Recherche 24.10.) | Kennungen [B]/[W]/[U] wie dort |
| **N2** | `v3-ideen/dirigent-spec-v3-nachtrag-2.md` | Teil J, EN2-28, E.4, E.5, „Nachtrag zur Reihenfolge“, Synth-Plan |
| **App** | `scratchpad/dirigent-wt/index.html`, Stand V2d′ = **4.6.0**, 2 473 307 Byte, gelesen am 25.10. | Zeilennummern „Z. 3887“ beziehen sich auf diese Datei |

- **Urheberrecht:** Aus den Handbüchern sind nur Fakten übernommen: Parameternamen, Wertebereiche, Tabellenwerte, Reihenfolgen. Es gibt keine Textpassagen. Die Handbücher bleiben privat: nicht im Repo, nicht in der App, nicht in Hilfe-Texten.
- **Kennzeichen:** **[B]** belegt (Handbuch mit Seite) · **[W]** wahrscheinlich · **[U]** unbelegt · **eK** eigene Festlegung. Jede eK-Kurve steht genau einmal in der W-Tabelle (B.2). Ein späterer Abgleich ändert dann nur diese Tabelle.
- **Nicht möglich:** Es gibt kein RADIAS-Handbuch (Xander: „nicht nötig“, `fragen-xander-9.md`). Es gibt keinen Korg-Formatbeleg für SysEx-Programmdaten: HB-MS S. 64 verweist auf eine eigene „MIDI Implementation“, die nicht im Handbuch steht. Daraus folgt das Tor für MK9. Kein Klang wurde angehört, nichts wurde am iPhone gemessen.

### N3.0.3 Neue Entscheidungen

| # | Entscheidung | Begründung |
|---|---|---|
| **EN3-01** | **Geltung.** Dieser Nachtrag regelt die Pakete MK1–MK13 und ihre Reihenfolge. Bei Widerspruch gilt er vor N2, N1 und Spec. Die bestehenden Pakete werden nur in Teil G berührt, und zwar nur als Hinweis oder als Versionsnummer. | Auftrag „Bau-Spezifikation MS2000“. |
| **EN3-02** | **Eigene Engine `mk` als Zweig `eng 2` in AnalogCore**, nicht als Erweiterung der VA-Engine. Der Stimmenpool (`POOL` 12), das Ereignisprotokoll, das Tempo, die Stimmenblende (SXF, V4a), die Last-Berichte und der Ladder werden mitbenutzt. Die VA-Klänge bleiben bitgleich. | Die MS2000-Logik weicht von VA ab: zwei Timbres, Wellen-Algorithmen mit CONTROL 1/2, Ganzzahl-Einheiten, Unison als Stimmenstapel. Ein Umbau von VA würde gespeicherte Klänge gefährden (I-10, L7). |
| **EN3-03** | **Daten in Geräte-Einheiten.** `p.mk` speichert Ganzzahlen genau in den Bereichen der Handbücher (000…127, ±63, Listen-Indizes). Die Umrechnung in Hz, s und ct macht nur die W-Tabelle (B.2). | Import 1:1 (MK9), prüfbare Bereiche, ein Ort für Kurven-Abgleich. |
| **EN3-04** | **Speicherformat 5 mit MK1.** `PROJECT_FORMAT` 4 → 5 und `SOUNDS_FORMAT` 1 → 2, weil `normalizeSound` (Z. 7916) eine unbekannte Engine verwirft. Ein 4.x-Stand würde MK-Sounds also stillschweigend verlieren. Danach gibt es keinen Formatsprung mehr. Neue Schlüssel sind neutral (I-10). Online braucht es `max_format` 5 und `max_app` je Version, jeweils nur mit Xanders Okay (N2 G.8). | Daten-Sicherheit (L7) und Versions-Wächter VO-R1. |
| **EN3-05** | **Keine Marken im Werk.** Die ausgelieferte Datei enthält keines dieser Wörter: Korg, microKORG, MS2000, MS-2000, RADIAS, DWGS, DW-6000, DW-8000. Das gilt auch für Kommentare und Hilfe-Texte. Die Engine heißt sichtbar „AM“ (Vorgabe, H-4). Wellen, Sektionen und Funktionen tragen eigene deutsche Namen, zum Beispiel „Speicherwelle“, „Stimmwelle“, „Formant halten“ und „Bewegung aufnehmen“. Genre-Namen der Bänke sind allgemeine Stilwörter. | Xanders Plan Punkt 2. Die App enthält heute 0 Treffer (geprüft). |
| **EN3-06** | **Handbuch-Fakten nur in der Spec, nicht in der App.** Hilfe-Zeilen (L10) und ⓘ-Texte sind eigene Sätze. | Urheberrecht. |
| **EN3-07** | **Werksklänge = eigene Rezepte.** Eine Namensprüfung läuft gegen die Werks-Programmlisten (HB-MK PDF 77, HB-MS S. 68–70). Diese Listen stehen nur im Testskript und nie in der App. | Plan Punkt 2. |
| **EN3-08** | **Import nur lokal.** Importierte Klänge tragen 🔒 (`loc: 1`). Eine einzige Funktion `mkLocalStrip()` ersetzt sie in **allen** Upload-Wegen durch einen Platzhalter. Das gilt für Server-Autosave, `save_library`, Paar-Raum/Realtime, Mitmach-Link/`#import` und später VO3. Die Tests verwenden nur synthetische Dumps aus einem eigenen Schreiber. | Plan Punkt 2: „nie hochladen, nie mitliefern“. |
| **EN3-09** | **Speicherwellen:** Bis MK10 gibt es 64 additive Platzhalter mit „≈“. Was MK10 aus Xanders Aufnahmen gewinnt, bleibt **lokal auf seinem Gerät**, bis Xander anders entscheidet. Andere Geräte hören die Platzhalter. | Wie EN2-11 (DX7-ROM): Die Wellen sind Korg-Daten aus seinem Gerät, die Lizenz ist ungeklärt → H-2. |
| **EN3-10** | **Ein Tempo.** Arp, LFO-Sync, Delay-Sync und Mod-Seq folgen dem Song-Tempo `S.bpm`. Das Feld `arp.tempo` (20…300) wird nur gespeichert, für Import und Anzeige. Es verhält sich wie am Gerät mit „Clock = External“ (HB-MS S. 45, HB-MK S. 44). | In einem Sequencer gibt es eine Uhr. Zwei Tempi würden auseinanderlaufen. |
| **EN3-11** | **Arp im Hauptfaden, Mod-Seq und Vocoder im Worklet.** Der Arp setzt zwischen Notenquelle und `spawnVoice` an (Z. 12610). Er plant mit dem vorhandenen Vorlauf (`LOOKAHEAD` 0,1 s, Z. 12917) und schreibt `noteLog`. Aufnahmen speichern die **gespielten Tasten**, nicht die Arp-Noten (Vorgabe, H-8). | M-ZEIT-Prüfung über `noteLog`. Die Ereignisse sind sampelgenau (16-Sample-Blöcke). Seq und Vocoder brauchen Stimmen- bzw. Audiotakt. |
| **EN3-12** | **Stimmen-Budget:** 4 Stimmen je AM-Spur wie MS2000 (HB-MS S. 2). MK13 erlaubt 8. Der CPU-Begrenzer ändert nie Gespeichertes (I-08), Stufen in B.4. | Plan Punkt 5. |
| **EN3-13** | **Kein WebGL im AM-Bedienfeld.** Die Regler bleiben DOM. Schritt- und Bandanzeigen (≤ 16 Säulen, ≤ 30 Hz, nur sichtbar) zeichnet Canvas 2D. | WebGL lohnt erst bei Tausenden Elementen. Ein zusätzlicher GL-Kontext kostet Speicher und Startzeit auf dem iPhone. PE1 (rAF ≥ 55 fps) ist die Prüfung. |
| **EN3-14** | **AM-Code nachladen.** Der Worklet-Teil steht im vorhandenen Worklet-Quelltext (ASCII). Der Hauptfaden-Teil steht als `<script type="text/plain" id="sq-mk-src">`: Bedienfeld, Arp, Import, Werksdaten, Tabellen-Bau. Ausgewertet wird er erst beim ersten Bedarf: AM-Sound im Projekt, Engine-Knopf AM, Bibliothek mit AM-Filter oder Leistungs-Probe. | Ladezeiten haben Vorrang (CLAUDE.md, Punkt 2). Projekte ohne AM starten wie bisher. Der Block lässt sich später als Ganzes packen (H-1). |
| **EN3-15** | **Zwei Eingänge je AM-Spur.** **E1** heißt „Instrument“ (MS2000 AUDIO IN 1), **E2** heißt „Stimme“ (AUDIO IN 2, Vocoder-Modulator). Jeder Eingang ist wählbar: Mikrofon (nur auf der Pages-Seite, über den VS1-Weg, Start nur auf Tipp), eine andere Spur (nach ihrem Fader) oder aus. Die Wahl gehört zur Spur (`tr.mkIn`), nicht zum Sound. | HB-MS S. 4, S. 38, S. 49. Das Mikrofon geht nur außerhalb der Claude-App (EN2-06). |
| **EN3-16** | **Geräte-Abgleich.** Xander besitzt einen microKORG. Jedes Paket nennt Punkte, die er nach Gehör am Gerät vergleicht. Das blockiert nicht. Ergebnisse ändern nur die W-Tabelle, mit Wert und Grund in CHANGES. | Viele Kurven sind eK. Das Gerät ist die beste Referenz, die wir haben. |
| **EN3-17** | **Zwischenstände.** Artifact und Pages bekommen je einen Stand nach MK1, MK4, MK7, MK8, MK10 und MK13 (EN2-15 sinngemäß; die Untergruppen stehen in E.1). | Xander will früh hören. Der Vocoder mit Mikrofon geht nur auf Pages. |
| **EN3-18** | **Regel MK-R1:** Jeder neue stetige AM-Regler ist automatisch ein Ziel des Mod-Sequenzers (ab MK6) und ein Patch-Ziel, wenn A.5 es nennt. In das App-Mod-System (Halten → Mod-Picker, `MODT`) kommen AM-Regler erst mit V5d (MOD-R1). Als Pad-Quelle kommt AM erst mit V1d (PAD-R1). | Die MS2000-Modulation (PATCH, SEQ) ist Teil des Plans. Das App-Mod-System ist es noch nicht (N1 EN-21). |

### N3.0.4 Was die App schon hat (Wiederverwendung)

| Baustein | Ort in der App (4.6.0) | Nutzung durch AM |
|---|---|---|
| Worklet-Prozessor AnalogCore, `eng` 0 VA / 1 FM6, Stimmenpool `POOL` 12, Steuerblock `CR` 16 | Z. 3517–5226 | `eng 2` = AM. Die Pool-Plätze 5–12 fangen wie bisher die Stehl-Blenden ab |
| Ereignisprotokoll `{ev: [[t, typ, id, a, b, c]]}`, `{tempo}`, `{load}`, `{end}` | Kopf Z. 3527–3543 | unverändert. AM ergänzt `{mkw}` (Tabellen) und `{mkIn}` (Eingänge) |
| Stimmenblende bei Strukturwechsel (SXF 30 ms, V4a/V4a-fix), Engine-Blende 40 ms | Z. 3566–3579 | Welle, OSC Mod, Filtertyp, Assign, Routing |
| polyBLEP-Säge/-Puls, Hard-Sync-Pfad | Z. 4474 ff. | OSC1 Säge/Puls, OSC2, Sync, RingSync |
| Ladder mit Abgriffen `FMIX` (LP24, LP12, BP24, BP12, HP24, HP12) | Z. 3557 | MS2000-Typen 24LPF = 0, 12LPF = 1, 12BPF = 3, 12HPF = 5 |
| Hüllkurven-Kern `envCoefs`/`envBlock` | Z. 3866–3886 | EG1, EG2 (MK12: EG3) |
| LFO-Formen `lfoVal` (Sinus, Dreieck, Säge, Rechteck, S&H), globale/je Stimme-Phase | Z. 4338 | LFO1/LFO2. Neu: Squ(+) unipolar, Key Sync „Timbre“ |
| Mod-Matrix (8 Plätze, Quellen/Ziele) | Z. 3559–3562 | PATCH 1–4 mit AM-eigenen Zielen |
| Tabellen-Wellen mit einer Mipmap je Oktave, Überblendung je Steuerblock (V4a, K2-40) | Worklet „Wave 0 … 11“ | Speicherwellen, Stimmwelle, Endlos, MK10 |
| Spur-Kette (Drive, Chorus, Trem, Duck, Vol, Pan, Hall-/Echo-Send) | `buildChain` Z. 12013 | unverändert **hinter** dem AM-Ausgang (Reiter FX) |
| ECO-Rückfall (NativeVoice), Badge | `trackEco`, Z. 12215 | AM → VA-Näherung (B.5) |
| Klang-Datenmodell, `normalizeSound`, `soundHash`, Bibliothek, INIT je Engine | Z. 7739–8000, Z. 11060 ff. | Engine `mk`, `normMk`, INIT AM |
| Undo je Geste `soundEdit`/`commitSound` | Z. 20327 | jede AM-Geste |
| Blatt-Rahmen `sheetFrame`, `sKnob`, `knobRow` mit Klasse `k5`, `lcdShow`, `openPop`, fit-Klassen | Z. 20260, 20725, 20175, 19579 | AM-Bedienfeld |
| Mikrofon-Weg (VS1: `getUserMedia` nur auf Tipp, play-and-record, Wege-Erkennung) | Z. 29500 ff., Z. 30007 ff. | Eingang „Mikrofon“ (MK7) |
| .syx-Dateiwahl ohne `accept` (iOS), lokale Verarbeitung | `importSyx` Z. 24724, Z. 26513 | MK9 |
| Verstecktes Testblatt mit JSON-Ergebnis (VS0 Mikro-Check) | CHANGES VS0 | Leistungs-Probe (MK1) |
| Test-API `engineInfo().perTrack[i].load`, `noteLog`, `viewState` | Z. 31579 | Abnahmen |

---

## Teil A — Abgleich MS2000 ↔ SYNQUENZER-Synth (heute 4.6.0)

Spalten: Parameter wie im Handbuch · Wertebereich · Seite HB-MS · Seite HB-MK · was die App heute hat (VA-Engine) · Status (✓ vorhanden · ≈ teilweise · ✗ fehlt · – entfällt) · Paket.

### A.1 Programm (COMMON, NAME, UTILITY)

| Parameter | Bereich | HB-MS | HB-MK | App heute | St. | Paket |
|---|---|---|---|---|---|---|
| Mode | Single, Dual, Split, Vocoder | S. 34 | S. 16 (Synth/Vocoder, Single/Layer) | eine Klangerzeugung je Spur | ✗ | MK3, MK7 |
| Timbre Voice | 1+3, 2+2, 3+1 | S. 34 | S. 16 (aus VOICE ASSIGN abgeleitet) | – | ✗ | MK3 |
| Split Point | C-1…G9 | S. 34 | – | – | ✗ | MK3 |
| Scale | Equal Temp, Pure Major, Pure Minor, Arabic, Pythagorea, Werckmeist, Kirnberger, Slendro, Pelog, User Scale | S. 34–35 | – | gleichstufig | ✗ | MK3 |
| Scale Key | C…B | S. 35 | – | – | ✗ | MK3 |
| User Scale (Global) | Key C…B, Detune −100…+100 ct | S. 57 | – | – | ✗ | MK3 (je Sound, Abweichung) |
| Name | Zeichensatz S. 35 | S. 35 | – | Sound-Name ≤ 32 | ✓ | – |
| Timbre Select (Taste) | 1, 2 | S. 35 | S. 16 | – | ✗ | MK3 |
| Utility InitProgram, InitTimbre, CopyTimbre, SwapTimbre | – | S. 46–47 | S. 59–64 (SHIFT) | ⋯ → Init | ≈ | MK1, MK3 |
| Utility InitSeq, CopySeq, CopySeqAll, SwapSeq | SEQ1…ALL, S1…S3 | S. 47–48 | – | – | ✗ | MK6 |

### A.2 Stimme und Tonhöhe

| Parameter | Bereich | HB-MS | HB-MK | App heute | St. | Paket |
|---|---|---|---|---|---|---|
| Assign | Mono, Poly, Unison (4 Stimmen) | S. 35 | S. 16 | `mode` poly/mono/legato, `poly` 1–8 | ≈ (Unison als Stapel fehlt) | MK1 |
| Priority | Last, Low, High | S. 35 | – | nur „letzte“ | ✗ | MK1 |
| Trigger | Single, Multi | S. 35 | S. 16 | legato ≈ Single | ≈ | MK1 |
| Detune (Unison) | 0…99 ct | S. 36 | S. 16 | `uniDet` je Oszillator | ≈ | MK1 |
| MIDI ch | GLB, 01…16 | S. 35 | – | keine MIDI-Eingabe | – | – |
| Transpose | −24…+24 HT | S. 36 | S. 17 | Fußlage/HT je Oszillator | ≈ | MK1 |
| Tune | −50…+50 ct | S. 36 | S. 17 | `o*fine` | ✓ | MK1 |
| Vibrato Int | −63…+63 (LFO2, Mod-Rad) | S. 36 | S. 17 | Route `mw` → pitch | ≈ | MK1 |
| Bend Range | −12…+12 HT | S. 36 | S. 17 | kein Bend | ✗ (gespeichert; ohne Rad wirkungslos, H-5) | MK1 |
| Portamento | 0…127 | S. 36 | S. 17 | `glide` 0–2 s | ✓ (Kurve W-13) | MK1 |

### A.3 Oszillatoren und Mixer

| Parameter | Bereich | HB-MS | HB-MK | App heute | St. | Paket |
|---|---|---|---|---|---|---|
| OSC1 Wave | Saw, Pulse, Tri, Sin (Cross), Vox Wave, DWGS, Noise, Audio In | S. 36–38, S. 65 | S. 18–21 | Säge, Puls, Dreieck, Sinus (polyBLEP) | ≈ | MK1 (Saw/Pulse/Tri), MK2 (Sin/Vox/DWGS/Noise), MK7 (Audio In) |
| Saw: C1 Form (0 = Säge, 127 = Säge eine Oktave höher), C2 = LFO1-WFM | 0…127 | S. 36 | S. 18 | – | ✗ | MK1 |
| Pulse: C1 Pulsbreite (0 = 50 %, 127 = 0 % stumm), C2 = PWM durch LFO1 | 0…127 | S. 36 | S. 18 | `o1pw` + Route | ≈ | MK1 |
| Tri: C1 Form (127 = Oktave + Quinte höher), C2 = WFM | 0…127 | S. 37 | S. 19 | – | ✗ | MK1 |
| Sin: C1 Kreuzmodulation durch OSC2, C2 = LFO1 auf die Tiefe | 0…127 | S. 37 | S. 19 | – (VK plant `ofm`) | ✗ | MK2 |
| Vox Wave: C1 Form, C2 = LFO1 (Spektrum bleibt bei Tonhöhenwechsel) | 0…127 | S. 37 | S. 19 | – | ✗ | MK2 |
| DWGS: C1 ohne Wirkung, C2 = Welle 1…64 (Werte 2n−2, 2n−1 → Welle n) | 1…64 | S. 37, S. 66 | S. 20 | FM-Werkswellen 0–11 + Mipmaps (Technik) | ✗ | MK2 (Platzhalter), MK10 |
| Noise (OSC1): C1 LPF-Cutoff, C2 Resonanz (C1 24 = Bezugstonhöhe) | 0…127 | S. 37 | S. 20 | Rauschen nur als Pegel | ✗ | MK2 |
| Audio In: C1 Balance IN1/IN2, C2 = LFO1 auf die Balance; Tonhöhe ohne Wirkung | 0…127 | S. 38, S. 17 | S. 21 (Richtung umgekehrt) | Mikrofon nur in VS | ✗ | MK7 |
| OSC2 Wave | Saw, Squ, Tri | S. 38 | S. 22 | Säge, Puls, Dreieck | ✓ | MK1 |
| OSC Mod | OFF, Ring, Sync, RingSync | S. 38 | S. 22 | Sync ✓ (`o2sync`), Ring ✗ (VK plant `p.ring`) | ≈ | MK1 |
| Semitone | −24…+24 | S. 38, S. 66 | S. 22 | `o2semi` −12…+24 | ≈ | MK1 |
| Tune (OSC2) | −63…+63 (±48 = ±1 Okt, ±63 = ±2 Okt, nahe 0 fein) | S. 38 | S. 22 | `o2fine` ±50 ct | ≈ | MK1 |
| Mixer OSC1, OSC2, Noise Level | 0…127 | S. 38 | S. 23 | `o1lvl`, `o2lvl`, `noise` | ✓ | MK1 |

### A.4 Filter, Verstärker, Hüllkurven, LFOs

| Parameter | Bereich | HB-MS | HB-MK | App heute | St. | Paket |
|---|---|---|---|---|---|---|
| Filter Type | 24LPF, 12LPF, 12BPF, 12HPF | S. 39, S. 65 | S. 24 | Ladder LP24, LP12, BP12, HP12 (+ BP24, HP24) | ✓ | MK1 |
| Cutoff, Resonance | 0…127 | S. 39 | S. 24 | `cutoff` Hz, `res` | ✓ (Kurven W-01, W-02) | MK1 |
| EG1 Int | −63…+63 | S. 39 | S. 24 | `fenv` ±1 | ✓ | MK1 |
| Vel Sense (Filter) | −63…+63 | S. 39 | – (nur über PATCH) | `fvel` 0…1 | ≈ (negativ fehlt) | MK1 |
| KBD Track (Filter) | −63…+63 (+48 = 1:1 ab C4) | S. 39 | S. 25 | `kt` 0…1 | ≈ (negativ fehlt) | MK1 |
| Amp Level | 0…127 | S. 40 | S. 27 | `level` | ✓ | MK1 |
| Panpot | L63…CNT…R63 | S. 40 | S. 27 | Spur-Pan | ≈ (je Timbre fehlt) | MK1 |
| Amp Sw | EG 2, Gate | S. 40 | – | – | ✗ | MK1 |
| Distortion | ON, OFF (Tiefe über die Mixer-Pegel) | S. 40 | S. 27 | Spur-Drive (eigener Regler, nach der Stimme) | ≈ | MK1 |
| Vel Sense (Amp) | −63…+63 | S. 40 | – | `ampVel` 0…1 | ≈ | MK1 |
| KBD Track (Amp) | −63…+63 (um C4) | S. 40 | S. 27 | – | ✗ | MK1 |
| EG1/EG2 Attack, Decay, Sustain, Release | 0…127 | S. 40 | S. 26, S. 28 | `fA…fR`, `aA…aR` in s | ✓ (Kurve W-06) | MK1 |
| EG Reset | ON, OFF | S. 41 | S. 26, S. 28 | – | ✗ | MK1 |
| LFO1 Wave / LFO2 Wave | Saw, Squ, Tri, S/H / Saw, Squ(+), Sin, S/H | S. 41 | S. 29 | Sinus, Dreieck, Säge, Rechteck, S&H | ≈ (Squ(+) fehlt) | MK1 |
| Key Sync (LFO) | OFF, Timbre, Voice | S. 41 | S. 29 | `retrig` 0/1 | ≈ (Timbre fehlt) | MK1 |
| Tempo Sync, Frequency, Sync Note | ON/OFF · 0…127 · 1/32…1/1 (15 Werte) | S. 41, S. 66 | S. 29 (1.1…1.32) | `l*sync` Schläge, `l*rate` Hz | ≈ | MK1 |
| feste Verdrahtung | LFO1 → OSC1 C1 (über C2), LFO2 → Tonhöhe (Vibrato × Mod-Rad), EG1 → Cutoff, EG2 → Amp | S. 3, S. 40–41 | S. 18, S. 17 | Routen frei | ≈ | MK1 |

### A.5 Virtual Patch (4 je Timbre)

| Parameter | Bereich | HB-MS | HB-MK | App heute | St. | Paket |
|---|---|---|---|---|---|---|
| Source | EG 1, EG 2, LFO 1, LFO 2, Velocity, KBD Trk, MIDI 1, MIDI 2 | S. 42 | S. 30 (MIDI 1/2 = Pitch Bend, MOD.Wheel) | `fenv`, `aenv`, `lfo1`, `lfo2`, `vel`, `key`, `mw` | ≈ (Bend fehlt) | MK2 |
| Destination | Pitch, OSC2Ptch, OSC1Ctr1, NoiseLvl, Cutoff, Amp, Pan, LFO2Freq | S. 42 | S. 30 | pitch, o2pitch, cutoff, noise, amp, pan | ≈ (OSC1 C1, LFO2 Freq fehlen) | MK2 |
| Intensity | −63…+63 | S. 42 | S. 30 | `amt` ±1 | ✓ | MK2 |

### A.6 Mod Sequence (nur MS2000; je Timbre)

| Parameter | Bereich | HB-MS | App heute | St. | Paket |
|---|---|---|---|---|---|
| ON/OFF | – | S. 16, S. 65 (CC 89) | – | ✗ | MK6 |
| Last Step | 01…16 | S. 42 | – | ✗ | MK6 |
| Seq Type | Forward, Reverse, Alt 1, Alt 2 | S. 42 | – | ✗ | MK6 |
| Run Mode | 1Shot, Loop | S. 43 | – | ✗ | MK6 |
| Key Sync | OFF, Timbre, Voice | S. 43 | – | ✗ | MK6 |
| Resolution | 1/48…1/1 (16 Werte) | S. 43, S. 66 | – | ✗ | MK6 |
| Knob (SEQ 1–3) | None, Pitch, Step Length, die Bedienfeld-Regler (Vorrang SEQ3 > SEQ2 > SEQ1) | S. 43 | – | ✗ | MK6 |
| Motion | Smooth, Step | S. 43 | – | ✗ | MK6 |
| Step Value | 16 × (±6 Step Length · ±24 Pitch/OSC2 Semi · ±63 sonst) | S. 43–44, S. 62 | – | ✗ | MK6 |
| Motion Rec | Regler-Bewegung in Echtzeit in die Schritte | S. 26 | – | ✗ | MK6 |

### A.7 Effekte (je Programm)

| Parameter | Bereich | HB-MS | HB-MK | App heute | St. | Paket |
|---|---|---|---|---|---|---|
| Mod FX Type | Cho/Flg, Ensemble, Phaser | S. 44 | S. 40 | Spur-Chorus (I, II, I+II, ENS, BREIT); Phaser/Flanger erst VK2 | ≈ | MK4 |
| LFO Speed, Depth | 0…127, 0…127 (Depth 0 = aus) | S. 44 | S. 40 | – | ✗ | MK4 |
| Delay Type | StereoDelay, CrossDelay, L/R Delay | S. 44 | S. 41 | Echo-Bus (Send, Tempo) | ≈ | MK4 |
| Tempo Sync, Delay Time, Sync Note, Depth | ON/OFF · 0…127 · 1/32…1/1 · 0…127 | S. 44, S. 66 | S. 41 | – | ✗ | MK4 |
| EQ | LowEQFreq 40 Hz…1000 Hz, LowEQGain −12,0…+12,0, HiEQFreq 1,00…18,0 kHz, HiEQGain −12,0…+12,0 | S. 44–45 | S. 42 | – | ✗ | MK4 |
| Reihenfolge | Mod FX → Delay → EQ | [W] | S. 31 [B] | – | – | MK4 |

### A.8 Arpeggiator

| Parameter | Bereich | HB-MS | HB-MK | App heute | St. | Paket |
|---|---|---|---|---|---|---|
| ON/OFF, LATCH | ON, OFF | S. 45 | S. 11, S. 45 | – | ✗ | MK5 |
| Type | Up, Down, Alt 1, Alt 2, Random, Trigger | S. 45, S. 60 | S. 44 | – | ✗ | MK5 |
| Range | 1…4 Oktaven | S. 45 | S. 44 | – | ✗ | MK5 |
| Tempo | 20…300 | S. 45 | S. 44 | Song-Tempo | ≈ (EN3-10) | MK5 |
| Gate Time | 0…100 % | S. 45, S. 60 | S. 44 | – | ✗ | MK5 |
| Target | Both, Timbre 1, Timbre 2 | S. 45 | S. 45 | – | ✗ | MK5 |
| Key Sync | ON, OFF | S. 46 | S. 45 | – | ✗ | MK5 |
| Resolution | 1/24, 1/16, 1/12, 1/8, 1/6, 1/4 | S. 46, S. 66 | S. 44 | – | ✗ | MK5 |
| Swing | −100…+100 % | S. 46 | S. 45 | – | ✗ | MK5 |
| Last Step + Schritte an/aus (Step-Arp) | 1…8, 8 Schalter | – | S. 11, S. 45 (nur microKORG) | – | ✗ | MK5 |

### A.9 Vocoder

| Parameter | Bereich | HB-MS | HB-MK | App heute | St. | Paket |
|---|---|---|---|---|---|---|
| Aufbau | 2 × 16 Bandpässe (Analyse, Synthese) + Hüllkurvenfolger, 4 Stimmen | S. 2, S. 4 | S. 31 (8 Kanäle aus 16 Filtern in Paaren) | – | ✗ | MK7 |
| Bandmitten (16 Filter, Formant Shift 0) | 125, 185, 270, 350, 430, 530, 630, 780, 950, 1150, 1380, 1680, 2070, 2780, 3800, 5000 Hz; Raster für Shift/Cutoff 39 … 12 600 Hz | – | S. 35 (Tab. 6-1) [B]; für MS2000 gleich [W] | – | ✗ | MK7 |
| Träger OSC1 | Saw, Pulse, Tri, Sin (ohne Kreuzmod.), VoxWave, DWGS, Noise, Audio In | S. 49 | S. 32 | – | ✗ | MK7 |
| AUDIO IN 2 (Modulator) | Gate Sense 0…127, Threshold 0…127, HPF Level 0…127, HPF Gate ENA/DIS | S. 49 | S. 33 (dort AUDIO IN 1) | – | ✗ | MK7 |
| Mixer | OSC 1 Level, Inst Level (AUDIO IN 1), Noise Level, je 0…127 | S. 50 | S. 34 | – | ✗ | MK7 |
| Filter | Formant Shift −2…+2, Cutoff −63…+63, Resonance 0…127, Mod Src (EG 1…MIDI 2), Mod Int −63…+63, E.F.Sense 0…127 (127 = Halten) | S. 50 | S. 35–36 (E.F.Sense 0…126, Hold) | – | ✗ | MK7 |
| Amp | Level 0…127, Direct Level 0…127, Distortion ON/OFF, Vel Sense ±63, KBD Track ±63 | S. 50–51 | S. 37 | – | ✗ | MK7 |
| EG 1/2, LFO 1/2, Effekte, Arp | wie Synth | S. 51 | S. 32 | – | – | MK7 |
| CH Level, CH Pan | 16 × 0…127, 16 × L63…R63; Init 127/CNT | S. 51–52 | S. 38 (8 Kanäle), S. 60 | – | ✗ | MK7 |
| Formant Hold | Taste; der gehaltene Zustand wird im Programm gespeichert | – | S. 10, S. 35 | – | ✗ | MK7 |

### A.10 Nicht übernommen (mit Grund)

- **Global** (Mst.Tune 430–450 Hz, Transpose, Vel.Curve, Position, AudioInThru, Protect, MIDI-Kanal, Local, Clock, Filter, Dump, Pedal/Switch; HB-MS S. 53–57, HB-MK S. 47–51): Das regelt die App auf Projekt- und Geräte-Ebene (Tempo, Tastatur FEST/POSITION). Es gibt keine MIDI-Eingabe in der App.
- **CC/NRPN-Tabellen** (HB-MS S. 60–65): Sie dienen nur als Hilfe beim Import (Wertzuordnung), nicht als Funktion.
- **Demos, Write/Protect, Program-Banks A–H mit je 16** (HB-MS S. 2): Das übernimmt die Bibliothek. Die Bänke folgen dem microKORG-Muster (A.11).

### A.11 microKORG ↔ MS2000 (die Oberfläche zeigt den microKORG; die Fähigkeiten folgen dem MS2000)

1. Layer (microKORG) = Dual (MS2000). Split gibt es nur beim MS2000 → übernommen.
2. Vocoder: microKORG 8 Kanäle (16 Filter paarweise, S. 35), MS2000 16 Kanäle → 16. Der Import ordnet Kanal k den Bändern 2k−1 und 2k zu.
3. Step-Arp (Last Step 1–8, Schritt-Tasten) gibt es nur beim microKORG → übernommen.
4. Mod-Seq, Scale, Priority, Filter/Amp Vel Sense, Amp Sw und Split gibt es nur beim MS2000 → übernommen, als 6. Regler bzw. eigene Sektion (B.3).
5. Audio-In-Balance: MS2000 0 = nur IN 1, 127 = nur IN 2 (S. 38). Beim microKORG ist es umgekehrt (S. 21) → der Import dreht.
6. Die Patch-Quellen heißen am microKORG FILTER EG, AMP EG, …, Pitch Bend, MOD.Wheel (S. 30). Das entspricht EG 1, EG 2, …, MIDI 1, MIDI 2 beim MS2000 (S. 42). FC-Mod-Quellen hat der microKORG ohne EG 1 (S. 36).
7. **Programme:** Der microKORG hat 8 Genre-Bänke × 2 Seiten × 8 Nummern = 128 (S. 8). Die Bänke heißen TRANCE, TECHNO/HOUSE, ELECTRONICA, D&B/BREAKS, HIPHOP/VINTAGE, RETRO, S.E./HIT und VOCODER (PDF 77). Das wird **übernommen als Bedien-Logik**: Genre-Bank ▾, Seite A│B, Tasten 1–8, Anzeige „A.24“.
8. **Performance Edit** (S. 8–9): Ist keine Sektion gewählt, steuern die Regler 1–5 Cutoff, Resonance, EG Attack (Filter- + Amp-EG), EG Release (Filter- + Amp-EG) und Tempo → Seite **SPIEL**.

### A.12 Zusammenfassung — was dem SYNQUENZER-Synth fehlt

1. **Struktur:** zwei Timbres (Dual/Split), Timbre-Stimmenteilung, Programm-Effekte, Vocoder-Modus, Eingänge in die Klangerzeugung.
2. **Oszillator:** 6 von 8 OSC1-Algorithmen (Form-Säge, Form-Dreieck, Kreuzmodulation, Stimmwelle, 64 Speicherwellen, Rauschen mit Filter, Eingang). Dazu Ring und RingSync, OSC2-Tune-Kurve über ±2 Oktaven, Halbton bis −24.
3. **Hüllkurven/Amp:** EG2/Gate, EG Reset, bipolare Anschlag- und Keytrack-Werte, Amp-Keytrack, Distortion abhängig von den Mixer-Pegeln, Pan je Timbre.
4. **Stimmen:** Unison als Stimmenstapel, Priorität Low/High, MS2000-Trigger.
5. **Modulation:** LFO Squ(+), Key Sync „Timbre“, MS2000-Sync-Noten, Patch-Ziele OSC1 C1 und LFO2 Freq, Mod-Sequenzer 3×16 mit Motion Rec.
6. **Stimmung:** 10 Skalen, Grundton, eigene Stimmung.
7. **Effekte:** Cho/Flg, Ensemble, Phaser, 3 Delay-Typen und 2-Band-EQ, je Klang und mit Tempo.
8. **Spielhilfen:** Step-Arpeggiator.
9. **Vocoder:** 16 Bänder, Halten, Kanal-Pegel und -Pan.
10. **Bedienung/Bibliothek:** Bedienfeld nach microKORG-Logik, Genre-Bänke, Import, Speicherwellen aus Aufnahmen.
11. **RADIAS-Teile:** Filter 2 mit Routing, Verzerrer, EG3, Formant-Oszillator, 8 Stimmen.

---
## Teil B — Bauweise (gilt für alle MK-Pakete)

### B.1 Engine, Datenmodell, Format

**Engine.** `engine: 'mk'` kommt in `SYNTH_ENGINES` (Z. 7794). Sie läuft im Worklet `dirigent-analog` als `eng 2` (`wkFlat`: `o.eng = 2`, `isWkEngine` um `'mk'` erweitert). Der flache VA-Patch bleibt im Sound wie bei jeder Synth-Engine erhalten (verlustfreier Engine-Wechsel, §5.2). Dazu kommt der Block **`p.mk`**. Beim ersten Wechsel einer Spur zu AM entsteht `p.mk` aus INIT AM. Eine Umrechnung VA → AM gibt es nicht (bewusst; L7 bleibt erfüllt, weil der VA-Block bleibt). Nach dem Wechsel stellt **ein** Undo den alten Sound deep-equal her.

**`p.mk` (Ganzzahlen in Geräte-Einheiten, EN3-03; Vorgaben = INIT AM).** Die Paketnummern in Klammern sagen, wann ein Feld wirkt. Gespeichert wird das Feld ab MK1 mit seinem neutralen Wert.

```
p.mk = {
  v: 1,
  mode: 0,        // 0 Single, 1 Dual (= Layer), 2 Split, 3 Vocoder              HB-MS S. 34        (MK3, MK7)
  tv: 1,          // Timbre Voice: 0 = 1+3, 1 = 2+2, 2 = 3+1 (MK13 bei 8 Stimmen: 2+6, 4+4, 6+2)
  split: 60,      // Split Point 0…127 (MIDI-Note, C-1…G9); Noten < split → T1, ≥ split → T2 [W]
  scale: 0,       // 0 Gleichstufig … 9 Eigene (Reihenfolge HB-MS S. 34–35)        (MK3)
  skey: 0,        // Grundton 0…11 (C…B)
  usc: null,      // Eigene Stimmung: 12 × −100…+100 ct, nur bei scale 9 (Abweichung: HB-MS hat sie global, S. 57)
  vmax: 4,        // 4 | 8                                                          (MK13)
  t: [T, T],      // Timbre 1, Timbre 2 (T2 wird immer gespeichert, klingt nur bei mode 1/2)
  mfx: {type: 0, spd: 64, dep: 0},                       // Cho/Flg, Ensemble, Phaser; dep 0 = aus   (MK4)
  dly: {type: 0, sync: 0, time: 64, note: 8, dep: 0},    // Stereo, Cross, L/R; note = Index W-12  (MK4)
  eq:  {lf: 320, lg: 0, hf: 6000, hg: 0},                // Hz, Hz, dB (Schritt 0,5)               (MK4)
  arp: {on: 0, latch: 0, type: 0, range: 1, gate: 75, tgt: 0, ks: 0, res: 1, swing: 0,
        last: 8, steps: 255, tempo: 120},                // res = Index W-11; steps = Bitmaske 1…8 (MK5)
  voc: {gs: 0, th: 0, hpl: 0, hpg: 1, ins: 0, fs: 0, cut: 0, res: 0, msrc: 1, mint: 0,
        efs: 64, hold: null, lvl: 127, dir: 0, dist: 0, vel: 0, kbd: 0,
        chl: [127 ×16], chp: [0 ×16]}                    // hold = 16 × 0…127 oder null          (MK7)
}
T = {
  asg: 1, prio: 0, trig: 1, udet: 10,     // Assign 0 Mono 1 Poly 2 Unison · Priority 0 Last 1 Low 2 High · Trigger 0 Single 1 Multi
  trans: 0, tune: 0, vib: 0, bend: 2, porta: 0,
  o1: {w: 0, c1: 0, c2: 0},               // w: 0 Säge 1 Puls 2 Dreieck 3 Sinus× 4 Stimmwelle 5 Speicherwelle 6 Rauschen 7 Eingang (8 Formant, MK12)
  o2: {w: 0, mod: 0, semi: 0, tune: 0},   // w: 0 Säge 1 Rechteck 2 Dreieck · mod: 0 aus 1 Ring 2 Sync 3 Ring+Sync
  mix: {o1: 127, o2: 0, n: 0},
  f: {type: 0, cut: 127, res: 0, eg: 0, vel: 0, kbd: 0},   // type: 0 24LPF 1 12LPF 2 12BPF 3 12HPF
  a: {lvl: 127, pan: 0, gate: 0, dist: 0, vel: 0, kbd: 0}, // gate: 0 EG2 1 Gate
  e1: {a: 0, d: 64, s: 0, r: 0, rst: 1},
  e2: {a: 0, d: 64, s: 127, r: 8, rst: 1},
  l1: {w: 2, ks: 0, sync: 0, f: 64, note: 6},  // LFO1 w: 0 Säge 1 Rechteck 2 Dreieck 3 S/H
  l2: {w: 2, ks: 0, sync: 0, f: 64, note: 6},  // LFO2 w: 0 Säge 1 Rechteck(+) 2 Sinus 3 S/H · ks: 0 aus 1 Timbre 2 Stimme · note = Index W-09
  p: [{s: 0, d: 0, i: 0}, {s: 2, d: 4, i: 0}, {s: 3, d: 0, i: 0}, {s: 4, d: 5, i: 0}],
        // s: 0 EG1 1 EG2 2 LFO1 3 LFO2 4 Anschlag 5 Keytrack 6 Bend 7 Mod-Rad (8 EG3, MK12)
        // d: 0 Tonhöhe 1 OSZ2-Tonhöhe 2 OSZ1-Steuer 1 3 Rauschen 4 Cutoff 5 Amp 6 Pan 7 LFO2-Freq (8 Cutoff 2, 9 Verzerrer, MK11)
  seq: {on: 0, last: 16, type: 0, run: 1, ks: 1, res: 3, q: [{k: 0, m: 1, v: [0 ×16]} ×3]}  // res = Index W-10 (MK6)
  // MK11: f2 {type, cut, res, eg, kbd, vel, egs}, fr, fbal, drv {typ, amt} · MK12: e3 {a, d, s, r, rst}
}
```

- **Mod-Rad:** Für AM gilt der vorhandene flache Wert `p.mw` (0…1, „Mod-Rad“, Z. 11203). Er ist die Quelle „Mod-Rad“ (MIDI 2) und skaliert das Vibrato.
- **Eingänge** (EN3-15) gehören zur Spur: `tr.mkIn = {e1: null | 'mic' | 't:<uid>', e2: …}`. Das Format bleibt 5, das Feld ist neutral.
- **`normMk(p)`** klemmt jedes Feld auf die Bereiche aus Teil A (Listen: Index 0…n−1, auf ganze Zahlen gerundet). Fehlende Felder bekommen die INIT-Werte, unbekannte Felder fallen weg. `normSynthP` ruft `normMk` auf, wenn `p.mk` existiert oder `engine === 'mk'`. Der Block bleibt bei jedem Engine-Wechsel erhalten (wie `p.fmx`, Z. 7872).
- **`soundHash`** bleibt (Z. 7765). `p.mk` ist Teil von `p` und zählt also mit.
- **Format 5** (EN3-04): `PROJECT_FORMAT` 5, `SOUNDS_FORMAT` 2. Format 3 und 4 laden unverändert. Ein 4.x-Stand meldet bei Format 5 schon heute „Projekt aus einer neueren Version“ (Z. 8163). Online: `p_format` 5 wird erst nach dem Rollout `max_format` 5 angenommen. Bis dahin speichert die App lokal und meldet `bad_version` wie bisher.
- **INIT AM** (`f-init-am`, cat `init`, `INIT_IDS.mk`): genau die Vorgaben oben (Säge, Filter offen, EG2 Sustain 127, Release 8). Pegel wie MK1-20.

### B.2 Werte-Kurven (W-Tabelle; alle eK, außer wo [B] steht)

Notation: v = gespeicherter Wert. Note = MIDI-Note (C4 = 60). vel = Anschlag 0…1. HT = Halbton.

| ID | Größe | Formel / Liste | Herkunft |
|---|---|---|---|
| **W-01** | Cutoff | f = 20 Hz · 1000^(v/127) (20 Hz … 20 kHz; v 64 ≈ 652 Hz; ≈ 0,94 HT je Schritt) | eK |
| **W-02** | Resonanz (Ladder) | `res` = 0,98 · v/127; keine Selbstoszillation | eK (Abgleich EN3-16) |
| **W-03** | Filter-Keytrack | Cutoff + (Note − 60) · v/48 HT (+48 = 1:1) | [B] S. 39 (+48 = proportional, ab C4) |
| **W-04** | EG1 Int | Cutoff + EG1 · v/63 · 60 HT | eK |
| **W-05** | Filter-Anschlag | Cutoff + v/63 · 24 · (2·vel − 1) HT | eK |
| **W-06** | Hüllkurvenzeiten | Attack: 0,5 ms · 2^(15·v/127) (0,5 ms … 16,4 s). Decay/Release: 2 ms · 2^(13·v/127) (2 ms … 16,4 s). Stufenzeit nach `envCoefs` mit Kurve 0,5 | eK |
| **W-07** | Sustain | Pegel v/127 (linear) | eK |
| **W-08** | LFO-Frequenz | 0,05 Hz · 2^(10·v/127) (0,05 … 51,2 Hz) | eK |
| **W-09** | LFO-Sync-Note (15) | 1/1, 3/4, 2/3, 1/2, 3/8, 1/3, 1/4, 3/16, 1/6, 1/8, 3/32, 1/12, 1/16, 1/24, 1/32. Periode = Wert × 4 Schläge | [B] S. 41, S. 66 |
| **W-10** | Seq-Auflösung (16) | 1/48, 1/32, 1/24, 1/16, 1/12, 3/32, 1/8, 1/6, 3/16, 1/4, 1/3, 3/8, 1/2, 2/3, 3/4, 1/1. Schritt = Wert × 4 Schläge | [B] S. 43, S. 66 |
| **W-11** | Arp-Auflösung (6) | 1/24, 1/16, 1/12, 1/8, 1/6, 1/4 | [B] S. 46 |
| **W-12** | Delay-Sync-Note (15) | 1/32, 1/24, 1/16, 1/12, 3/32, 1/8, 1/6, 3/16, 1/4, 1/3, 3/8, 1/2, 2/3, 3/4, 1/1. Zeit = Wert × 4 Schläge | [B] S. 66 |
| **W-13** | Portamento | v 0 = aus, sonst exponentielles Gleiten mit τ = 2 ms · 2^(12·v/127) (… 8,2 s). Bei Mono/Unison + Single nicht auf die erste Note | eK; Regel [B] S. 36 |
| **W-14** | OSZ2-Fein | ct = sign(v) · 1200 · (|v|/48)² für |v| ≤ 48, sonst sign(v) · (1200 + 80 · (|v| − 48)) | Eckwerte [B] S. 38, Verlauf eK |
| **W-15** | Unison-Verstimmung (d ct) | 4 Stimmen: −d/2, −d/6, +d/6, +d/2 · 3: −d/2, 0, +d/2 · 2: ±d/2 · 8 (MK13): gleichmäßig über ±d/2 | eK |
| **W-16** | Vibrato | Spitzenhub = v/63 · 200 ct · Mod-Rad (0…1), Quelle LFO2 | eK; Verdrahtung [B] S. 36 |
| **W-17** | Bend | Bereich v HT. Die App hat kein Rad → Wert 0 (H-5) | [B] S. 36 |
| **W-18** | Patch-Intensität i | Ziel = i/63 · volle Spanne: Tonhöhe ±24 HT · OSZ2-Tonhöhe ±63 Fein-Einheiten (über W-14) · OSZ1-Steuer 1 ±127 · Rauschen ±127 · Cutoff ±127 Cutoff-Einheiten · Amp ±127 Pegel-Einheiten · Pan voller Weg L63↔R63 · LFO2-Freq ±127 (über W-08). Quellen: EG 0…1, LFO −1…+1 (LFO2 Rechteck(+) 0…1), Anschlag vel, Keytrack (Note − 60)/60, Bend 0, Mod-Rad `p.mw` | eK; Liste [B] S. 42 |
| **W-19** | Amp-Pegel | Gain = K · (v/127)². K so gewählt, dass INIT AM bei C3, vel 0,8 so laut ist wie INIT Analog (±1 dB, MK1-20) | eK |
| **W-20** | Pan | Equal-Power, −63…+63 | eK |
| **W-21** | Amp-Anschlag | v ≥ 0: dB = 24 · (v/63) · (vel − 1). v < 0: dB = 24 · (|v|/63) · (−vel) | eK |
| **W-22** | Amp-Keytrack | dB = (v/63) · 0,3 · (Note − 60) | eK; „um C4“ [B] S. 40 |
| **W-23** | Distortion | y = tanh(g·x) / tanh(g), g = 1 + 8 · (mix.o1 + mix.o2 + mix.n)/381 | eK; „Tiefe über die Mixer-Pegel“ [B] S. 40 |
| **W-24** | Säge, Form | y = (1 − m) · Säge(φ) + m · Säge(2φ), m = (C1 + LFO1 · C2)/127 geklemmt 0…1 | eK; Endpunkte [B] S. 36 |
| **W-25** | Puls | Breite = 50 % · (1 − (C1 + LFO1 · C2)/127), geklemmt 0…50 % | eK; Endpunkte [B] S. 36 |
| **W-26** | Dreieck, Form | y = (1 − m) · Dreieck(φ) + m · Dreieck(3φ) (bandbegrenzt, polyBLAMP), m wie W-24 | eK; „127 = Oktave + Quinte“ [B] S. 37 |
| **W-27** | Sinus× (Kreuzmod.) | Phasenmodulation durch den OSZ2-Ausgang, Index β = 4 · (C1 + LFO1 · C2)/127 rad. C1 0 = reiner Sinus | eK; [B] S. 37 |
| **W-28** | Stimmwelle | Bandbegrenzte Glottis-Pulsfolge (Rosenberg-Puls). Öffnungsquotient 0,3 + 0,5 · m (m wie W-24). Feste Spektralhülle in Hz (Neigung −12 dB/Okt oberhalb 300 Hz), gerechnet als Oktav-Tabellen (B.6 Punkt 6) | eK; „Spektrum bleibt“ [B] S. 37 |
| **W-29** | Rauschen (OSZ1) | Weißes Rauschen → 2-Pol-Tiefpass, Cutoff = f(Note) · 2^((C1 − 24)/12), geklemmt 20 Hz…20 kHz; Res = 0,98 · C2/127 | eK; „C1 24 = Bezugstonhöhe“ [B] S. 37 |
| **W-30** | Eingang (OSZ1) | Ausgang = (1 − b) · E1 + b · E2, b = (C1 + LFO1 · C2)/127. Tonhöhe ohne Wirkung | Richtung [B] S. 38; [B] S. 17 |
| **W-31** | Mod-FX | Tempo: 0,02 Hz · 2^(9·spd/127). **Cho/Flg:** Verzögerung 1 ms + Hub dep/127 · 4 ms, Rückkopplung max(0, (dep − 64)/63) · 0,85, L/R-LFO 90° versetzt. **Ensemble:** 3 Abgriffe um 120° versetzt, Basis 8 ms, Hub dep/127 · 3 ms, ohne Rückkopplung. **Phaser:** 6 Allpass-Stufen, Hub dep/127 über 200 Hz…4 kHz, Rückkopplung dep/127 · 0,7. Mischung nass = min(1, dep/16) · 0,5, dep 0 = trocken bitgleich | eK; Typen [B] S. 44 |
| **W-32** | Delay | Zeit (Sync aus): 1 ms · 2^(10,45·time/127) (1 ms … 1,4 s). Pegel dep/127, Rückkopplung 0,8 · dep/127, dep 0 = trocken bitgleich. **Stereo:** L→L, R→R. **Cross:** Rückkopplung L↔R vertauscht. **L/R:** Mono-Summe, Echos abwechselnd L, R | eK; Typen [B] S. 44 |
| **W-33** | EQ | Tiefen- und Höhen-Kuhschwanz 2. Ordnung (Q 0,707). Frequenz in Hz (40…1000 bzw. 1000…18 000), Gain ±12 dB in 0,5-dB-Schritten | eK; Bereiche [B] S. 44–45 |
| **W-34** | Arp-Gate | Notenlänge = max(3 ms, gate/100 · Schritt). 100 = bis zum nächsten Schritt | eK; [B] S. 45 |
| **W-35** | Arp-Swing | gerade Schritte (2., 4., …) um swing/100 · ½ Schritt später (negativ: früher) | eK; [B] S. 46 |
| **W-36** | Vocoder-Bänder | Raster R[0…23] = 39, 50, 65, 80, 125, 185, 270, 350, 430, 530, 630, 780, 950, 1150, 1380, 1680, 2070, 2780, 3800, 5000, 6400, 8100, 10 510, 12 600 Hz. Analyseband k (1…16) = R[k+3]. Syntheseband k = R an der Stelle k + 3 + fs + 2 · (cut + mint · Quelle)/63 (Quelle = FC-MOD-Quelle −1…+1 bzw. 0…1; stetig, logarithmisch interpoliert, geklemmt 0…23). Probe: Shift +2 → Band 1 = 270 Hz, Shift −2 → 65 Hz, ±2 Stufen Cutoff an den Rändern → 39 Hz bzw. 12 600 Hz (Tab. 6-1) | [B] HB-MK S. 35, Tab. 6-1; Interpolation eK |
| **W-37** | Vocoder-Resonanz | Bandgüte Q = 3 + 9 · res/127, je Band 2 Biquads (4. Ordnung) | eK |
| **W-38** | E.F.Sense | Abfall-τ = 5 ms · 2^(9·efs/126) (5 ms … 2,56 s), Anstieg = τ/4 (≥ 1 ms). 127 = Halten | eK; Halten [B] S. 50 |
| **W-39** | Gate, Schwelle | Schwelle = −72 dBFS + th/127 · 60 dB. Schließzeit 2 ms · 2^(10·gs/127) | eK |
| **W-40** | HPF-Pegel | Modulator → Hochpass 4. Ordnung 6 kHz → Ausgang mit Pegel hpl/127. hpg 1 (ENA) = nur bei klingender Trägerstimme | eK; [B] S. 49 |
| **W-41** | Direkt-Pegel | Modulator direkt, Gain (dir/127)² | eK |
| **W-42** | Kanal-Pegel/-Pan | Gain (chl/127)², Pan Equal-Power | eK |
| **W-43** | Stimmungen (ct gegenüber gleichstufig, Stufe 0…11 ab Grundton) | **Reine Dur:** 0, +11,73, +3,91, +15,64, −13,69, −1,96, −9,78, +1,96, +13,69, −15,64, −3,91, −11,73 · **Reine Moll:** wie Dur, aber Stufe 10 = +17,60 · **Pythagoreisch:** 0, +13,69, +3,91, −5,87, +7,82, −1,96, +11,73, +1,96, +15,64, +5,87, −3,91, +9,78 · **Werckmeister III:** 0, −9,78, −7,82, −5,87, −9,78, −1,96, −11,73, −3,91, −7,82, −11,73, −3,91, −7,82 · **Kirnberger III:** 0, −9,78, −6,84, −5,87, −13,69, −1,96, −9,78, −3,42, −7,82, −10,26, −3,91, −11,73 · **Arabisch:** Stufe 4 und 11 −50, sonst 0 · **Slendro:** Stufen 0, 2, 5, 7, 9 = 0, +40, −20, +20, +60, sonst 0 · **Pelog:** Stufen 0, 2, 4, 5, 7, 9, 11 = 0, −80, −130, +40, −30, −115, −150, sonst 0 · **Eigene:** `usc` | Bedingungen [B] S. 34–35 (z. B. „Dur-Akkorde der Tonart rein“, Slendro/Pelog-Tasten); Zahlen aus der Stimmungslehre, eK |
| **W-44** | Formant-Oszillator (MK12) | Glottis-Puls + 4 parallele Resonatoren F1–F4. Vokale (Hz): a 730/1090/2440/3400 · e 530/1840/2480/3500 · i 270/2290/3010/3700 · o 570/840/2410/3300 · u 300/870/2240/3300. C1 morpht a → e → i → o → u über 0…127, C2 = LFO1-Tiefe | Werte nach Peterson & Barney (1952, Männer, gerundet), eK |
| **W-45** | Verzerrer (MK11) | Typ 1 weich: tanh(g·x)/tanh(g). Typ 2 hart: Klemme ±1/g' mit Pegelausgleich. Typ 3 Falter: Sinus-Falter sin(g·x). g = 1 + 15 · amt/127, 2× Überabtastung | eK |

### B.3 Bedienfeld („wiedererkennbar wie microKORG“, ohne Marke)

**Logik** (HB-MK S. 8–9, S. 13–15): Man wählt eine Sektion und dreht die Regler. Ohne Sektion greift die Spiel-Belegung (SPIEL). Programme wählt man über Genre-Bank, Seite A/B und Nummer 1–8. Beim Arpeggiator werden die Nummerntasten zu Schritt-Tasten.

**Rahmen:** Der vorhandene Synth-Blattkopf bleibt (`sheetFrame`):
- Zeile 1: Spurname, **Engine-Leiste VA │ FM │ WT │ AM** (4. Knopf), ECO-Badge, ↶ ↷ ✕.
- Zeile 2: ‹ Name ›, A/B, Sichern, 🎲, ◎, ⋯, ▶ Hören.
- LCD-Zeile.

Für AM sind die Reiter **[SPIEL] [EDIT 1] [EDIT 2] [SEQ] [FX]**:
- EDIT 2 kommt mit MK2, SEQ kommt mit MK6. Bis dahin sind diese Reiter ausgeblendet.
- FX ist die vorhandene App-Seite (SPUR, CHORUS, HALL, ECHO, MASTER) und bleibt unverändert.

**SPIEL** (P1, Körper ≤ 305 px):
1. Programmzeile a (44 px): [Bank ▾ 110 px] [A] [B] [Anzeige „A.24“ 56 px] [T1] [T2]. T1/T2 werden mit MK3 aktiv.
2. Nummern 1–8 (8 × 43 × 44, dichtes Raster mit 4 px Abstand).
3. 5 Regler 72 × 92: CUTOFF, RESONANZ, HK-ATTACK, HK-RELEASE, TEMPO. HK-ATTACK und HK-RELEASE verschieben EG1 und EG2 gemeinsam um dasselbe Δ und klemmen jeweils. TEMPO = Song-Tempo, ein Undo, LCD „Tempo 120 · Song“.
4. Schalterzeile (44 px): [ARP ●] [LATCH ●] (MK5), [SEQ ●] (MK6), [HALTEN ●] (nur Vocoder, MK7). Die Plätze sind reserviert, nichts rückt nach.

Summe ≈ 244 px.

**EDIT 1 / EDIT 2** (P1): Sektionsraster **2 × 7 Zellen à 50 × 44** (7 · 50 + 6 · 4 = 374 px). Die Zellen bleiben an festen Plätzen, leere Zellen sind unsichtbar, aber reserviert (M-ANSICHT). Darunter liegt die Reglerzeile der gewählten Sektion:
- 1–5 Regler: 72 × 92, Klasse `k5`.
- 6 Regler: 58 × 92, neue Klasse `k6` (6 · 58 + 5 · 4 = 368).

Bei ARP A/B kommt die Schritt-Zeile dazu (8 × 43 × 44). Summe ≤ 244 px.

| Raster | Zellen (Reihe 1 │ Reihe 2) |
|---|---|
| EDIT 1, Synth | PROG · STIMME · TONH. · OSZ 1 · OSZ 2 · MIXER · FILTER │ F-HK · AMP · A-HK · LFO 1 · LFO 2 · (FILTER 2, MK11) · (DRIVE, MK11) |
| EDIT 2, Synth | PATCH 1 · PATCH 2 · PATCH 3 · PATCH 4 · MOD-FX · DELAY · EQ │ ARP A · ARP B · (HK 3, MK12) |
| EDIT 1, Vocoder | PROG · STIMME · TONH. · OSZ 1 · EING. · MIXER · FILTER │ FC-MOD · AMP · F-HK · A-HK · LFO 1 · LFO 2 |
| EDIT 2, Vocoder | K-PEGEL · K-PAN · MOD-FX · DELAY · EQ │ ARP A · ARP B |

**Regler je Sektion** (Reihenfolge nach HB-MK „knob 1–5“; die MS2000-Werte kommen als 6. Regler oder als eigene Sektion dazu):

| Sektion | Regler (Beschriftung) | Quelle |
|---|---|---|
| PROG | MODUS · STIMMEN (1+3 │ 2+2 │ 3+1) · SPLIT · STIMMUNG · GRUNDTON | HB-MS S. 34–35 |
| STIMME | ZUWEISUNG (Mono │ Poly │ Unison) · AUSLÖSUNG (Single │ Multi) · PRIORITÄT · UNI-VERST. | S. 35–36; HB-MK S. 16 |
| TONH. | TRANSP. · FEIN · PORTAM. · BEND · VIBRATO · MOD-RAD (k6) | S. 36; HB-MK S. 17 |
| OSZ 1 | WELLE · STEUER 1 · STEUER 2. Die Beschriftung folgt der Welle: Säge FORM/WFM · Puls BREITE/PWM · Dreieck FORM/WFM · Sinus× X-MOD/X-LFO · Stimmwelle FORM/WFM · Speicherwelle –/WELLE · Rauschen CUTOFF/RESO. · Eingang BALANCE/BAL-LFO | S. 36–38; HB-MK S. 18–21 |
| OSZ 2 | WELLE · MOD (aus │ Ring │ Sync │ Ring+Sync) · HALBTON · FEIN | S. 38; HB-MK S. 22 |
| MIXER | OSZ 1 · OSZ 2 · RAUSCHEN (Vocoder: OSZ 1 · EINGANG 1 · RAUSCHEN · QUELLE 1 ▾) | S. 38, S. 50 |
| FILTER | TYP · CUTOFF · RESONANZ · HK-INT · KEYTRACK · ANSCHLAG (k6) | S. 39; HB-MK S. 24–25 |
| F-HK, A-HK | ATTACK · DECAY · SUSTAIN · RELEASE · NEUSTART | S. 40–41; HB-MK S. 26, S. 28 |
| AMP | PEGEL · PAN · VERZERR. · KEYTRACK · HK │ GATE · ANSCHLAG (k6) | S. 40; HB-MK S. 27 |
| LFO 1, LFO 2 | WELLE · KEY SYNC (aus │ Timbre │ Stimme) · TEMPO SYNC · FREQ │ NOTE | S. 41; HB-MK S. 29 |
| PATCH n | QUELLE · ZIEL · INTENSITÄT | S. 42; HB-MK S. 30 |
| MOD-FX | TYP · TEMPO · TIEFE | S. 44; HB-MK S. 40 |
| DELAY | TYP · TEMPO SYNC · ZEIT │ NOTE · TIEFE | S. 44; HB-MK S. 41 |
| EQ | TIEF-FREQ · TIEF-GAIN · HOCH-FREQ · HOCH-GAIN | S. 44–45; HB-MK S. 42 |
| ARP A | TEMPO (Song) · AUFLÖSUNG · GATE · TYP · OKTAVEN | S. 45–46; HB-MK S. 44 |
| ARP B | LATCH · SWING · KEY SYNC · LETZTER SCHRITT · ZIEL | HB-MK S. 45 |
| EING. (Vocoder) | GATE · SCHWELLE · HPF-PEGEL · HPF-GATE · QUELLE 2 ▾ | S. 49; HB-MK S. 33 |
| FILTER (Vocoder) | FORMANT · CUTOFF · RESONANZ · FOLGER (127 = HALTEN) | S. 50; HB-MK S. 35 |
| FC-MOD | QUELLE · INTENSITÄT | S. 50; HB-MK S. 36 |
| AMP (Vocoder) | PEGEL · DIREKT · VERZERR. · ANSCHLAG · KEYTRACK | S. 50–51; HB-MK S. 37 |
| K-PEGEL, K-PAN | 16 Säulen (2 × 8 à 43 × 88 in P1; 16 × 48 × 92 in L1) mit Live-Bandpegel | S. 51; HB-MK S. 38 |
| FILTER 2, DRIVE (MK11) · HK 3 (MK12) | siehe Pakete | KF [B] |

**Regler-Verhalten:**
- Jeder Platz ist ein `sKnob` (senkrecht ziehen). Stufenwerte rasten ein.
- **Tipp auf einen Listen-Regler** öffnet eine Auswahl (`openPop`, Zeilen ≥ 44 px). Das gilt für WELLE, TYP, MODUS, QUELLE, ZIEL und STIMMUNG.
- Die LCD-Zeile zeigt Sektion, Name, Geräte-Wert und Klartext, z. B. „FILTER · CUTOFF 064 · 652 Hz“ oder „OSZ 1 · WELLE Speicherwelle 12 ≈“.
- Eine Geste = ein Undo. Halten hat im AM-Bedienfeld keine eigene Bedeutung bis V5d (EN3-18, L4).
- Bearbeitet wird immer das gewählte Timbre. Die LCD zeigt „T2“, wenn T2 gewählt ist.

**Kopf-Knöpfe:**
- 🎲 würfelt die EDIT-1-Werte von T1 (Wellen, C1/C2, OSZ2-Halbton aus {0, +7, +12, −12}, Mixer, Filter, Hüllkurven). Danach gilt: Mixer OSZ 1 oder OSZ 2 ≥ 64 und Sustain + Decay hörbar. FX, Arp, Seq und Vocoder werden nicht gewürfelt.
- ◎ setzt einen Punkt in jede Sektions-Zelle, deren Werte von INIT AM abweichen.
- ⋯ → Init lädt INIT AM.

**Querformat L1 (844 × 390, Körper ≤ 140 px):**
- Reihe 1: die 14 Zellen in einer Reihe à 56 × 36 (14 · 56 + 13 · 3 = 823).
- Reihe 2: Regler links (5 × 72 bzw. 6 × 58, Höhe wie die VA-Seiten in L), rechts Programmblock (SPIEL) bzw. Schritt-Tasten (ARP, 8 × 40 × 36).
- Summe ≤ 132 px.

**Weitere Formate:**
- **L2 (667 × 375):** Zellen 44 × 36 mit 2 px Abstand (14 · 44 + 13 · 2 = 642). Die Nummern- bzw. Schritt-Tasten stehen nur im SPIEL- bzw. ARP-Körper unter den Reglern (fit-Klassen wie `#drumSheet`).
- **P2/P3:** Programmzeile einzeilig (Bank ▾ · A │ B · Anzeige). In P3 erscheinen die 8 Tasten nur in den ARP-Sektionen, als Schritt-Tasten (8 × 36 × 34). Die Programmwahl geht dort über ‹ › und die Bibliothek. Zellen in P3: 40 × 44 (dichtes Raster), k6 = 6 × 48.
- **W (844 × 1180):** wie P1, nur M-PLATZ.

Jede neue Bedienfläche bekommt eine Hilfe-Zeile (Menü → Hilfe) und beim ersten Antippen einen LCD-Hinweis (L10). Die Texte sind eigene Sätze ohne Marken.

### B.4 Leistung: Stimmen-Budget, CPU-Messung, Begrenzer, WebGL

- **Budget je AM-Spur:** höchstens 4 klingende Stimmen (MK13: 8). Dazu Programm-Effekte und ggf. Vocoder. Ziel auf dem Xeon (Node-Offline): 4 Stimmen „Vollast MK1“ ≤ 3 % Echtzeit, mit FX + Seq + Arp ≤ 4 %, Vocoder-Spur ≤ 5 %. Das iPhone-Verhältnis ist unbelegt (Spec §15.1: Faktor 2–2,5). Darum misst die **Leistungs-Probe** am Gerät.
- **Messverfahren:**
  1. **Node-Offline** `mk-node.mjs`: Es zieht den Worklet-Quelltext aus `index.html` (wie `fm-node.mjs`) und rendert 10 s Audio. Gemessen wird die Zeit je 128er-Quantum, Median aus 5 Läufen. Jede Grenze ist **relativ** zu einer VA-Stimme aus demselben Lauf angegeben, das gleicht Maschinenschwankung aus.
  2. **Chromium** `engineInfo().perTrack[i].load` als Gegenprobe in CHANGES (±40 % Streuung, keine Abnahmegrenze).
  3. **OfflineAudioContext** in Chromium mit dem App-Worklet für alle Klangmessungen (deterministisch, Rausch-Seed fest).
- **Leistungs-Probe** (MK1, jedes MK-Paket ergänzt einen Fall): Menü → Info → **[Leistungs-Probe]**. Sie läuft auch in der Claude-App, weil sie kein Mikrofon braucht.
  - Sie legt 4 vorübergehende AM-Engines an (nicht im Projekt) und spielt je 4 Stimmen 10 s lang (Akkorde, Neuanschlag alle 0,5 s). Fälle: MK1 „Kern“, MK4 „+FX“, MK5 „+Arp“, MK6 „+Seq“, MK7 „Vocoder (synthetischer Modulator)“, MK11 „+Filter 2/Drive“, MK13 „8 Stimmen“.
  - Gemessen werden `load` Median/Spitze, rAF-Median, Zahl der `longtask` > 50 ms, `baseLatency`, `sampleRate`, `userAgent`.
  - Ergebnis als JSON mit [Ergebnis kopieren] [Als Datei]. Keine Netzaufrufe. [Abbrechen] jederzeit.
- **Grenze am iPhone (Gerät, Xander):** Fall „Kern“ load-Median ≤ 0,45. Liegt er darüber, gilt bis zur Lösung: AM höchstens 2 Stimmen je Spur, sobald mehr als 2 AM-Spuren klingen (Klartext im Kopf, L9). CHANGES nennt Wert und Regel.
- **CPU-Begrenzer** (erweitert Spec §15.2, ändert nie Gespeichertes):
  - Stufe 1 (> 0,45): AM-Vocoder-Bänder auf 2. Ordnung; AM-Unison ≤ 2 Stimmen für neue Noten; MK13 `vmax` 8 → 4 für neue Noten.
  - Stufe 2 (> 0,60): AM-Spuren ≤ 2 Stimmen für neue Noten; Mod-FX Ensemble → 1 Abgriff.
  - Stufe 3 wie v2.
- **WebGL:** keiner (EN3-13). Canvas 2D für Seq-Säulen und Band-Pegel, gezeichnet ≤ 30 Hz und nur bei sichtbarer Seite. PE1 prüft das.
- **Hauptfaden:** Tabellen-Bau in Häppchen ≤ 8 ms (`requestIdleCallback`, Rückfall `setTimeout`). Übergabe der Tabellen als Transfer (`{mkw}`). Das Worklet rechnet keine Tabellen im Audio-Takt.

### B.5 ECO-Rückfall (Worklet nicht verfügbar oder `forceNative`)

`mkToFlat(p.mk)` bildet Timbre 1 auf den flachen VA-Patch ab, den NativeVoice spielt:
- Wellen: Säge → 0, Puls → 1 mit `pw` aus W-25, Dreieck → 2, Sinus× → 3, alle anderen → 0. OSZ2 Säge/Rechteck/Dreieck → 0/1/2.
- Halbton/Fein → `o2semi`/`o2fine`, Sync → `o2sync`. Mixer → Pegel/127.
- Filtertyp → 0/1/3/5. Cutoff, Res, EG1 Int, Keytrack, Hüllkurven und LFOs über die W-Tabelle.

Ohne T2, FX, Arp, Seq und Vocoder. Badge „ECO-Klang“. Hinweis im LCD „AM im ECO-Klang: nur Grundklang“.

### B.6 Gemeinsame Regeln und Prüfverfahren

1. **Neutral und bitgleich (I-10):** Jedes neue Feld hat einen neutralen Wert. Vorhandene Klänge aller Engines und die AM-Klänge des Vorgänger-Pakets rendern bitgleich (Node-Offline, max |Δ| ≤ 1e-6), außer ein Paket nennt es anders.
2. **Glätten und Blenden (L3):** Stetige Werte werden mit τ ≥ 5 ms geglättet. Strukturwechsel bei klingender Note gehen über die vorhandene 30-ms-Stimmenblende. Jede Abnahme mit Umschalten prüft **M-KLICK und M-EINBRUCH**.
3. **Hörbarkeit:** Jeder Regler einer AM-Sektion erfüllt H-1 und H-3 (Spec §0.3). Die Ausnahmen sind benannt: Bend ohne Rad, TEMPO nur mit Sync/Arp/Seq, NEUSTART nur bei Neuanschlag, Werte ohne Wirkung in der gerade gewählten Welle.
4. **Undo:** eine Geste = ein Undo (`soundEdit`/`commitSound`). Laden eines Programms = ein Undo mit Toast [Rückgängig].
5. **Layout:** M-PLATZ in P1, P2, P3, L1, L2, W für jeden neuen Zustand. M-ANSICHT: Ein Sektions- oder Zustandswechsel verschiebt kein Bedienelement um mehr als 2 px. Treffer nach L4: Hochformat ≥ 44 × 44, dichte Raster ≥ 36 × 34 mit 4 px; Querformat ≥ 40 × 36.
6. **Oktav-Tabellen:** Für Wellen, deren Spektrum in Hz fest sein soll (Stimmwelle, Endlos, Aufnahmen aus MK10), gibt es je Oktave (C1…C8) eine eigene Tabelle mit eigenen Mipmaps. Die Stimme blendet zwischen den zwei Nachbaroktaven nach der gespielten Tonhöhe (je Steuerblock, wie K2-40). Speicher je Welle ≤ 8 × Mipmap-Satz. Gebaut wird nur, was ein geladener Sound braucht.
7. **Worklet-ASCII** und Quelltext-Grenzen wie bisher (`check-worklet`).
8. **Geräte-Abgleich (EN3-16):** Jedes Paket nennt 3–6 Punkte, die Xander am eigenen microKORG nach Gehör vergleicht. Sein Ergebnis kommt mit Datum in CHANGES. Eine Änderung der W-Tabelle ist ein eigener kleiner Fix-Schritt (`MKn-fix`) mit Messwert vorher und nachher.
9. **Kein Markenwort** im Werk (EN3-05): `grep -ciE 'korg|micro ?korg|ms-?2000|radias|dwgs|dw-?[68]000'` über `index.html` = 0. Das läuft in jedem MK-Paket.

### B.7 Test-API (ergänzt Spec §16; Rückgaben sind tiefe Kopien, ändernde Aufrufe = ein Undo)

```ts
mkGet(t: number): MkPatch                                  // p.mk der Spur t
mkSet(t: number, path: string, v: number | number[]): void  // z. B. 't.0.f.cut', 'mfx.dep' – über normMk geklemmt
mkRender(sound: Sound, ev: [t: number, typ: 'on'|'off', note: number, vel: number][], o?: {sec?: number, sr?: number,
         seed?: number, bpm?: number, inputs?: {e1?: Float32Array, e2?: Float32Array}}): Promise<{l: Float32Array, r: Float32Array}>
mkScope(t: number): {voices: {note, t, eg1, eg2, lfo1, lfo2, cutHz, seqStep?: number[]}[], seq?, vocBands?: number[]}
mkInfo(): {loaded: boolean, tables: number, tableBytes: number, blockMs: number}
arpLog(t: number): {t: number, note: number, vel: number, dur: number, step: number}[]   // ab MK5
perfProbe(cases?: string[]): Promise<object>                                              // die Leistungs-Probe
```

---
## Teil C — Pakete

Jedes Paket ist einzeln auslieferbar und hörbar prüfbar. Zu jedem Paket gehören:
- „Regression und DoD“ nach Spec §1.3: keine Konsolenfehler, M-PLATZ, Worklet-ASCII, PE1, Budget, CHANGES, Snapshot.
- die Fach-Prüfung nach N2 Teil J (Zeile „Fach-Prüfung“; ● = blockierend).
- die Regeln B.6.

Testskripte liegen in `dirigent-test/` (Chromium-Pfad wie in CHANGES V2d′: `chromium-1243`).

### MK1 — Klangkern (Timbre 1), Bedienfeld SPIEL/EDIT 1, Leistungs-Probe

**Ziel.** Xander wählt auf einer Synth-Spur die neue Klangerzeugung AM und spielt einen vollständigen MS2000-Grundklang. Dazu gehören Säge, Puls und Dreieck mit ihren Form-Reglern, OSZ 2 mit Ring/Sync/Ring+Sync, Mixer, alle vier Filtertypen, Verstärker mit Verzerrung und Gate, zwei Hüllkurven, zwei LFOs, Tonhöhe sowie Mono/Poly/Unison. Er bedient das wie am microKORG und kann am iPhone messen, ob es flüssig läuft.

**Umfang.**
1. **Daten und Format:** Engine `mk`, `p.mk` mit `normMk` (B.1), Format 5 (EN3-04), INIT AM, `setEngineOf` für `mk`, Engine-Leiste mit 4. Knopf „AM“ (Name nach H-4).
2. **Worklet `eng 2`:** Es rechnet nur Timbre 1 (`mode` 0; Dual/Split ab MK3).
   - **OSZ 1:** Säge (W-24, polyBLEP für beide Sägen), Puls (W-25, polyBLEP), Dreieck (W-26, polyBLAMP). LFO1 wirkt über STEUER 2 (WFM/PWM). Die Wellen 3–7 klingen bis MK2 bzw. MK7 als Säge, das LCD sagt „ab MK2“. Die Werte werden trotzdem gespeichert.
   - **OSZ 2:** Säge, Rechteck, Dreieck. Halbton ±24, Fein W-14.
   - **OSC MOD:** Ring = OSZ 1 × OSZ 2 als OSZ-2-Ausgang (HB-MS S. 38). Sync = OSZ 2 wird von OSZ 1 zurückgesetzt, über den vorhandenen Sync-Pfad mit polyBLEP. Ring+Sync = beides.
   - **Mixer, Rauschen:** weißes Rauschen im Mixer.
   - **Filter:** Ladder-Abgriffe 0/1/3/5, W-01 … W-05.
   - **Verstärker:** W-19 … W-23; HK │ GATE (Gate: Anstieg 1 ms, Abfall 3 ms).
   - **Hüllkurven:** EG1, EG2 (W-06, W-07). NEUSTART aus = Neuanschlag ab dem aktuellen Pegel. Das gilt bei Poly und bei Mono/Unison mit Multi (HB-MS S. 41).
   - **LFOs:** LFO1/LFO2 mit allen Wellen; Rechteck(+) unipolar. Key Sync aus / Timbre (Phase setzt bei der ersten Note aus „alle los“ zurück) / Stimme. Tempo Sync W-09.
   - **Feste Wege:** LFO1 → OSZ1-Steuer, LFO2 → Tonhöhe über VIBRATO × Mod-Rad, EG1 → Cutoff, EG2 → Amp.
   - **Tonhöhe:** Transponieren, Fein, Portamento W-13, Bend W-17.
   - **Stimmen:** höchstens 4.
     - Poly stiehlt die älteste Note.
     - Mono hat einen Notenstapel mit Priorität Last/Low/High.
     - Unison legt alle 4 Stimmen auf eine Note (W-15).
     - Auslösung Single: Legato startet Hüllkurven und LFO nicht neu. Portamento wirkt bei Mono/Unison + Single nicht auf die erste Note (HB-MS S. 36).
   - **Strukturwechsel** (Welle, OSC MOD, Filtertyp, Zuweisung, HK │ GATE) bei klingender Note laufen über die SXF-Blende.
3. **Bedienfeld** (B.3): Reiter SPIEL, EDIT 1, FX.
   - SPIEL hat die 5 Spiel-Regler und die Programmzeile mit Bank ▾ (8 Genre-Bänke, Namen nach MK8). Seite A bleibt bis MK8 leer (Tasten grau „–“). Seite B listet die eigenen AM-Sounds der Bibliothek, sortiert A–Z, B.11 … B.88. Die Schalterzeile ist reserviert.
   - EDIT 1 hat das 2 × 7-Raster. PROG zeigt bis MK3 nur „Single“ (gesperrt). Die anderen Sektionen sind voll bedienbar.
   - Dazu LCD-Texte, Hilfe-Zeilen, 🎲, ◎ und ⋯ Init.
4. **ECO-Rückfall** (B.5).
5. **Leistungs-Probe** (B.4), Fall „Kern“.
6. **Code-Ort** nach EN3-14 (`sq-mk-src` wird bei Bedarf ausgewertet).
7. **Test-API** `mkGet`, `mkSet`, `mkRender`, `mkScope`, `mkInfo`, `perfProbe`.

**Nicht-Umfang.**
- Sinus×, Stimmwelle, Speicherwellen, Rauschen-Oszillator und Patches (MK2).
- Timbre 2, Split und Stimmung (MK3). Effekte (MK4), Arp (MK5), Seq (MK6), Eingänge und Vocoder (MK7).
- Werksklänge (MK8).
- App-Mod-Picker und Morph für AM-Regler (V5d/V6a). AM als Pad-Quelle (V1d).

**Daten.** Siehe B.1 (alle Felder werden ab MK1 gespeichert). Spur: kein neues Feld (`mkIn` erst mit MK7).

**Oberfläche.** Siehe B.3. Neu sind die Klasse `k6`, das Sektionsraster und die Programmzeile. Der Kopf bleibt; die Engine-Leiste bekommt den 4. Knopf. In P3 gilt das dichte Raster 4 × ≥ 36 × 34, wenn der Platz fehlt.

**Berührungspunkte.**
- **Wiederverwendet:** AnalogCore mit Pool, Ereignissen, Tempo, SXF und Lastbericht; `envCoefs`, `lfoVal`, Ladder `FMIX`, polyBLEP/Sync; `normalizeSound`, `soundHash`, Bibliothek, `INIT_IDS`; `sheetFrame`, `sKnob`, `knobRow`, `lcdShow`, `openPop`, fit-Klassen; `soundEdit`/`commitSound`; NativeVoice; Muster des VS0-Testblatts; `engineInfo`.
- **Neu:** `eng 2` mit Form-Säge, Form-Dreieck, Ring/Ring+Sync, Gate, Neustart, Priorität, Stapel-Unison, Rechteck(+), Key Sync Timbre; `normMk`, `mkToFlat`, W-Tabelle als eine Datenstruktur, Bedienfeld, Leistungs-Probe, Klasse `k6`, Block `sq-mk-src`.

**Dauer** 11–13 h in zwei Bau-Abschnitten:
1. Daten, Format, Worklet, DSP-Tests.
2. Bedienfeld, ECO, Probe, UI-Tests.

Eine Version: **4.9.0** · **Budget** +95 KB · **Format 4 → 5.** Rollout `max_format` 5 und `max_app` 4 009 000 nur mit Xanders Okay (N2 G.8). Vorher speichert die App lokal.

**Abnahme-Checkliste**
- [ ] **MK1-01 Daten:** Ein Prüfskript setzt 1000 Zufalls-Patches mit Werten außerhalb der Bereiche. `normMk` klemmt jeden Wert auf Teil A, Listenwerte sind ganzzahlig. Unbekannte Schlüssel fallen weg. Speichern → Laden ist deep-equal, `soundHash` ist stabil. VA → AM → VA stellt den VA-Klang bitgleich her. Ein Undo nach dem Wechsel stellt den Sound deep-equal her.
- [ ] **MK1-02 Format:** Neue Projekte haben `format` 5. Projekte mit Format 3 und 4 laden deep-equal (nach `normalize`). Demo und alle Werks-Sounds (VA, FM, WT, Kits) klingen offline bitgleich zu 4.8.0 (max |Δ| ≤ 1e-6).
- [ ] **MK1-03 Kein Markenwort** (B.6 Nr. 9): 0 Treffer.
- [ ] **MK1-04 Säge** (24LPF Cutoff 127, Gate, C3):
  - Teiltöne 1–20 liegen innerhalb ±0,5 dB von 1/n.
  - C7: gefaltete Energie ≤ −50 dB relativ zum Nutzsignal.
  - STEUER 1 = 127: die ungeraden Teiltöne von f liegen ≤ −40 dB unter dem 2. Teilton.
  - STEUER 1 = 64: der 1. Teilton liegt 6 ± 1 dB unter dem Wert bei 0.
- [ ] **MK1-05 Puls:**
  - STEUER 1 = 0: gerade Teiltöne ≤ −40 dB.
  - STEUER 1 = 64: Tastverhältnis 24,8 ± 1 % (aus dem Signal gemessen).
  - STEUER 1 = 127: RMS ≤ −60 dBFS.
  - STEUER 2 = 127 mit LFO1 Dreieck: Das Tastverhältnis wandert nach W-25, ohne Knacken (M-KLICK).
- [ ] **MK1-06 Dreieck:**
  - STEUER 1 = 0: 3. Teilton −19,1 ± 0,5 dB.
  - STEUER 1 = 127: Der stärkste Teilton liegt bei 3·f (± 1 FFT-Bin).
  - C7: gefaltete Energie ≤ −50 dB.
- [ ] **MK1-07 OSZ 2:**
  - Halbton +12 ergibt f₂ = 2·f₁ ± 1 ct.
  - Fein +1 / +24 / +48 / +63 ergibt +0,5 / +300 / +1200 / +2400 ct, jeweils ± 0,5 / 2 / 2 / 3 ct (W-14).
  - Wellen wie MK1-04 bis MK1-06.
- [ ] **MK1-08 Ring** (OSZ 1 Dreieck 440 Hz, OSZ 2 Dreieck Halbton +7, Mixer OSZ 1 = 0, OSZ 2 = 127):
  - Die zwei stärksten Spitzen liegen bei f₂ − f₁ und f₁ + f₂ (± 1 Bin).
  - 440 Hz und f₂ liegen ≥ 30 dB unter der stärksten Spitze.
- [ ] **MK1-09 Sync und Ring+Sync:**
  - Sync mit OSZ 2 Säge, Halbton +7: Die Periode des OSZ-2-Ausgangs ist 1/f₁ (± 1 ct).
  - Halbton 0 → +12 hebt M-SP um ≥ ⅓ Okt.
  - C6: gefaltete Energie ≤ −40 dB.
  - Ring+Sync gleicht dem Produkt aus Sync-Ausgang und OSZ 1 aus getrennten Renders (max |Δ| ≤ 1e-4).
- [ ] **MK1-10 Rauschen:** Die Leistungsdichte ist in Terzbändern 100 Hz…16 kHz flach (± 2 dB nach Normierung auf die Bandbreite).
- [ ] **MK1-11 Filter** (Rauschen, Res 0, Cutoff 64):
  - Steilheit bei ½ und ¼ bzw. 2× und 4× Cutoff: 24LPF 22–26 dB/Okt, 12LPF und 12HPF 11–13 dB/Okt, 12BPF je Seite 5–7 dB/Okt.
  - Die −3-dB-Ecke von 12LPF bei Cutoff 32/64/96 liegt bei W-01 ± 5 %.
  - Resonanz 127 (24LPF): Spitze ≥ 18 dB über dem Durchlass. Ohne Eingang nach 1 s < −80 dBFS.
- [ ] **MK1-12 Filter-Modulation** (Messung über `mkScope().cutHz`):
  - Keytrack +48: C2 → C5 verschiebt den Cutoff um 3 Okt ± 3 %. Bei 0 bleibt er ± 1 %, bei −48 sinkt er um 3 Okt.
  - HK-INT +63 (F-HK A 0, D 64, S 0): Spitze +60 ± 1 HT.
  - ANSCHLAG +63: vel 1,0 gegen 0,5 ergibt +24 ± 1 HT.
- [ ] **MK1-13 Verstärker:**
  - Pegel 0 ergibt ≤ −90 dBFS.
  - Pan L63: R ≤ −40 dB. Mitte: L = R ± 0,1 dB.
  - GATE: Anstieg ≤ 2 ms, Abfall ≤ 5 ms, M-KLICK besteht.
  - VERZERR. an (Dreieck C3, Mixer OSZ 1 = 127): 3. Teilton ≥ 10 dB über „aus“. Bei Mixer 32 ist er kleiner als bei 127 (H-3).
  - ANSCHLAG +63: vel 0,5 liegt −12 ± 1 dB unter vel 1,0.
  - KEYTRACK +63: C5 gegen C4 ergibt +3,6 ± 0,3 dB.
- [ ] **MK1-14 Hüllkurven:**
  - Stufenzeiten für Werte 0/32/64/96/127 nach W-06 ± 10 %. Gemessen wird nach der im Test dokumentierten `envCoefs`-Definition: Attack bis 90 % der Spitze, Release bis −20 dB (M-AUS).
  - NEUSTART an: Der Neuanschlag beginnt bei 0. Die ersten 1 ms liegen ≥ 40 dB unter dem vorherigen Pegel.
  - NEUSTART aus: Der Neuanschlag beginnt beim aktuellen Pegel ± 1 dB, M-KLICK besteht.
- [ ] **MK1-15 LFOs:**
  - Frequenz bei f = 0/64/127 nach W-08 ± 2 %.
  - Rechteck(+) liegt im Mittel bei 0,5 ± 0,01 und nur bei ≥ 0.
  - S/H: neuer Wert je Periode, Mittel über 1000 Perioden 0 ± 0,05.
  - Tempo Sync 1/4 bei 120 BPM ergibt 2,000 Hz ± 0,1 %. Bei laufendem Transport und Key Sync aus liegt der Nulldurchgang ± 1 ms am Schlag.
  - Key Sync „Stimme“ (2 Noten, 0,3 s versetzt): Phasen verschieden ≥ 0,2 Periode. „Timbre“: gleiche Phase ± 0,01.
- [ ] **MK1-16 Tonhöhe:**
  - Transponieren +12 ergibt +1200 ± 1 ct. Fein +50 ergibt +50 ± 0,5 ct.
  - VIBRATO +63 bei Mod-Rad 1 ergibt einen Hub ±200 ± 10 ct mit der LFO2-Frequenz. Bei Mod-Rad 0 ergibt es 0.
  - Portamento 64 (Mono, Multi): C3 → C4 erreicht 90 % in W-13 ± 10 %. Bei Mono + Single gleitet die erste Note nicht.
- [ ] **MK1-17 Stimmen:**
  - Poly mit 5 Tasten: genau 4 Stimmen klingen. Die älteste wird mit Blende gestohlen (M-KLICK).
  - Mono Last/Low/High: Die Tastenfolgen aus der Testtabelle ergeben die erwarteten Tonhöhen.
  - Unison mit 1 Taste: 4 Stimmen mit −10/−3,3/+3,3/+10 ct bei Verstimmung 20 (± 0,5 ct, Spektrum).
  - Auslösung Single: Die Legato-Note startet EG2 nicht neu (M-EINBRUCH). Multi: neu.
- [ ] **MK1-18 Umschalten:** Welle OSZ 1/2, OSC MOD, Filtertyp, Zuweisung und HK │ GATE bei klingender Note bestehen M-KLICK und M-EINBRUCH. Jeder stetige Regler, in 1 s von 0 → 127 gedreht, besteht M-KLICK.
- [ ] **MK1-19 Hörbar:** H-1 und H-3 für jeden Regler von SPIEL und EDIT 1 (Ausnahmen B.6 Nr. 3, im Skript benannt).
- [ ] **MK1-20 INIT AM:** C3, vel 0,8, 2 s: M-LUFS ± 1 dB gegen INIT Analog. ⋯ → Init lädt INIT AM, ein Undo.
- [ ] **MK1-21 Bedienfeld:**
  - M-PLATZ in P1, P2, P3, L1, L2, W für SPIEL, für EDIT 1 mit jeder Sektion und für die offene Auswahl-Liste.
  - Ein Sektionswechsel bewegt kein Element > 2 px (M-ANSICHT).
  - Trefferflächen P1: Zellen 50 × 44, Regler 72 × 92 bzw. 58 × 92. L1: Zellen 56 × 36.
  - Keine Seite scrollt senkrecht. Eine Geste = ein Undo. Ein zweiter Finger wird ignoriert.
  - Doppeltipp-Zoom und Textauswahl sind in der iOS-Emulation aus.
- [ ] **MK1-22 Anzeige:** Die LCD zeigt bei jedem Zug Sektion, Name, Geräte-Wert (000…127, ±63 oder Listenname) und Klartext (Hz, ms, ct), laut Prüfliste für alle Regler. Die Hilfe-Zeilen sind da (L10).
- [ ] **MK1-23 ECO:** Mit `forceNative` spielt ein AM-Sound über NativeVoice. Das Badge erscheint. Pegel ± 3 dB und M-SP ± ½ Okt gegen das Worklet für INIT und 3 Prüfklänge. Keine Konsolenfehler.
- [ ] **MK1-24 CPU** (Node-Offline, Xeon):
  - Eine AM-Stimme (Säge + Puls mit Sync, Rauschen, 24LPF Res 100, Verzerrung, LFO1/2 aktiv) ≤ 1,2 × einer VA-Stimme (3 Osz + Ladder) aus demselben Lauf.
  - 4 Stimmen ≤ 3 % Echtzeit.
  - Der Chromium-Wert steht in CHANGES.
- [ ] **MK1-25 Leistungs-Probe:**
  - Läuft in der Claude-App und auf Pages, 10 s je Fall.
  - Das JSON enthält `app`, `ua`, `sr`, `baseLatency`, `load_med`, `load_max`, `fps_med`, `longtasks`, `voices`, `fall`.
  - 0 Netzaufrufe (Zähler wie N7V-35). [Abbrechen] beendet ohne hängende Stimme.
- [ ] **MK1-26 Startzeit (EN3-14):**
  - Projekt ohne AM: Zuwachs ≤ +20 ms gegen 4.8.0 (Median aus 5).
  - Projekt mit AM-Sound: ≤ +150 ms (§15.3).
  - Erste Auswertung des Blocks ≤ 150 ms bei CPU-Drosselung ×4, ohne Drosselung keine `longtask` > 50 ms.
- [ ] **MK1-27 Regression und DoD:**
  - PE1 mit offenem AM-Bedienfeld während 10 s Demo: rAF ≥ 55 fps, keine `longtask` > 50 ms, `tick`-p95 ≤ 4 ms.
  - Budget ≤ +95 KB.
- [ ] **MK1-28 Versions-Wächter:** `APP_CODE` 4 009 000. Online-Speichern mit Format 5 erst nach dem Rollout, vorher `bad_version`-Hinweis und lokales Speichern. Kein Aufruf nennt das Klassenzimmer-Projekt.

**Tests.** `mk1-dsp.mjs` (Node-Offline: 04–18, 24), `mk1-format.mjs` (01–03, 28), `mk1-ui.mjs` (Playwright: 19–22, 26), `mk1-eco.mjs`, `mk1-probe.mjs`.

**Fach-Prüfung** (Teil J): **FP-DSP ●** Haupt-, **FP-TOUCH** und **FP-IPHONE** Zweit-Blick.

**iPhone-Prüfpunkte (Xander, ≈ 5 min):**
1. Synth-Spur → Engine **AM** → SPIEL: Akkord spielen, CUTOFF und RESONANZ drehen.
2. EDIT 1 → OSZ 2 → MOD „Sync“, dann HALBTON drehen.
3. AMP → VERZERR. an, MIXER hochdrehen.
4. Menü → Info → **Leistungs-Probe**, Ergebnis kopieren und schicken.

**Geräte-Abgleich (microKORG, nach Gehör):**
- Säge STEUER 1 von 0 → 127 (klingt es wie „Oktave dazu“?).
- Puls STEUER 1 = 64.
- Dreieck STEUER 1 = 127.
- Resonanz 127 bei offenem Filter: pfeift das Gerät allein? (W-02)
- Attack 64 und Release 64 im Vergleich zur App.
- LFO Frequenz 64.

**Risiken.** Die Kurven sind eK. Die iPhone-CPU ist unbekannt. Das Paket ist groß, deshalb gibt es zwei Bau-Abschnitte. Der Rollout (Format 5) braucht Xanders Okay.

---

### MK2 — Alle Oszillator-Arten und PATCH 1–4

**Ziel.** OSZ 1 kann alles, was der MS2000 kann, außer „Eingang“ (MK7): Sinus mit Kreuzmodulation, Stimmwelle, 64 Speicherwellen (Platzhalter, klar markiert), Rauschen mit Filter. Die vier virtuellen Patches verbinden Hüllkurven, LFOs, Anschlag, Keytrack und Mod-Rad mit acht Zielen.

**Umfang.**
1. **Sinus×** (W-27). Der Modulator ist der OSZ-2-Ausgang nach OSC MOD.
2. **Stimmwelle** (W-28) als Oktav-Tabellen (B.6 Nr. 6).
3. **Speicherwellen 1–64** (Platzhalter):
   - Additive Rezepte mit ≤ 32 Teiltönen (Pegel in dB, als Bytes kodiert) und Familien nach HB-MS S. 37 (Nummer → Gruppe): 1–7 Sinus-artig, 8–14 Bass, 15–23 Welle, 24–26 Quinte, 27–34 Digital, 35 Endlos, 36–39 E-Piano, 40–46 Orgel, 47–48 Clavi, 49–51 Gitarre, 52–56 Bass 2, 57–60 Glocke, 61–64 Stimme.
   - Die Teiltonvektoren entwirft der Builder selbst. Ziel ist der Charakter der Gruppe, nicht eine Kopie.
   - **35 Endlos** ist ein Shepard-Ton: nur Oktav-Teiltöne 2^j mit Glockengewicht über log f (Mitte 440 Hz, σ 1,5 Okt) als Oktav-Tabellen.
   - Gruppe 61–64 bekommt eine feste Hülle in Hz (Oktav-Tabellen).
   - Mipmaps über den Tabellen-Bau aus V4a. Der Bau läuft im Hauptfaden in Häppchen und wird per Transfer übergeben (B.4).
   - Wahl über STEUER 2 (1…64; Import: Werte 2n−2, 2n−1 → n, HB-MS S. 66).
   - Wellenwechsel bei klingender Note mit 2-ms-Blende.
   - LCD: „Speicherwelle 12 · Bass 5 ≈ Platzhalter“. Hilfe: „Originalwellen folgen später aus Aufnahmen“.
4. **Rauschen-Oszillator** (W-29).
5. **PATCH 1–4** (A.5, W-18). Je Timbre 4 Wege mit Quelle, Ziel und Intensität. „Bend“ ist da, wirkt aber nicht (LCD „kein Bend-Rad“, H-5). Intensität 0 kostet nichts.
6. **Reiter EDIT 2** mit PATCH 1–4 (die übrigen Zellen folgen ab MK4/MK5).
7. **Leistungs-Probe:** Der Fall „Kern“ nutzt jetzt Speicherwelle + Sinus×.

**Nicht-Umfang.** „Eingang“ (MK7). Originalwellen (MK10). Mehr als 4 Patches.

**Daten.** `t[].o1.w` 3…6 wirken jetzt. `t[].p[]` wirkt jetzt.

**Oberfläche.** EDIT 2 (Raster wie B.3). OSZ 1 mit Beschriftung je Welle. Die Auswahl-Liste der Speicherwellen hat 64 Zeilen mit Gruppenköpfen (Liste scrollt, L4) und „≈“.

**Berührungspunkte.**
- **Wiederverwendet:** Tabellen und Mipmaps (V4a, K2-40), Mod-Matrix-Plätze.
- **Neu:** PM-Pfad Sinus×, Glottis-Puls, Oktav-Tabellen, 64 Rezepte, Tabellen-Übergabe `{mkw}`, Patch-Ziele OSZ1-Steuer und LFO2-Freq.

**Dauer** 6–7 h · **Version 4.10.0** · **Budget** +35 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK2-01 Sinus×:**
  - X-MOD 0: Klirr ≤ −60 dB.
  - X-MOD 64 mit OSZ 2 Dreieck Halbton +12: Seitenbänder bei f₁ ± n·f₂ (n = 1 ≥ −20 dB relativ zum Träger). M-SP steigt ≥ ⅓ Okt gegenüber 0.
  - X-LFO 127: Die Tiefe schwankt mit LFO1 (Seitenband-Pegel ändert sich ≥ 10 dB über eine Periode).
- [ ] **MK2-02 Stimmwelle:**
  - Die Spektralhülle in Hz ist bei C2 und C4 gleich: ± 3 dB in Terzbändern 400–4000 Hz, normiert auf den Gesamtpegel.
  - FORM 0 → 127 ändert M-SP ≥ ⅓ Okt.
  - C7: gefaltete Energie ≤ −50 dB.
- [ ] **MK2-03 Speicherwellen:**
  - 64 Wellen, Spitze 1, kein Gleichanteil.
  - Jede Welle unterscheidet sich von jeder anderen: RMS-Abstand ≥ 1 dB über die Teiltöne 1–16.
  - Die Gruppen-Merkmale aus der Testtabelle sind erfüllt (z. B. Orgel: nur Zugriegel-Teiltöne 1, 2, 3, 4, 6, 8 ≥ −40 dB; Quinte: Teilton 3 ≥ Teilton 2).
  - C7: gefaltete Energie ≤ −50 dB.
  - Wellenwechsel bei klingender Note besteht M-KLICK.
  - Jede Welle trägt „≈“ in LCD und Liste.
- [ ] **MK2-04 Endlos:** Die Teiltöne von C3 und C4 sind in Hz deckungsgleich (± 1 dB), ebenso Fis3/Fis4. Eine chromatische Tonleiter über 2 Okt hat keinen Pegelsprung > 1,5 dB (M-PEGEL).
- [ ] **MK2-05 Rauschen-Osz.:**
  - RESO. 127, CUTOFF 24: Spitze bei der Notenfrequenz ± 20 ct für C3 und C5. CUTOFF 36 ergibt eine Oktave höher ± 20 ct.
  - RESO. 0: Tiefpass ohne Spitze, 11–13 dB/Okt.
- [ ] **MK2-06 Patches:**
  - Tonhöhe +63 mit LFO1 Rechteck: ±24 HT ± 10 ct.
  - Cutoff +63 mit EG2: +127 Cutoff-Einheiten am Gipfel (über `mkScope`).
  - Pan +63 mit LFO2: voller Weg L ↔ R.
  - LFO2-Freq +63 mit EG1: LFO2-Frequenz nach W-08 am Gipfel ± 5 %.
  - OSZ1-Steuer mit Keytrack: Pulsbreite ändert sich mit der Tonhöhe.
  - Amp mit Anschlag, Rauschen mit LFO1 und OSZ2-Tonhöhe mit EG1 zeigen je die Wirkung nach W-18.
  - Intensität 0 = bitgleich zu „kein Patch“.
  - Vier Patches auf dasselbe Ziel addieren sich.
- [ ] **MK2-07 Bitgleich:** MK1-Klänge (Wellen 0–2, Intensität 0) klingen bitgleich zu 4.9.0.
- [ ] **MK2-08 Tabellen-Bau:**
  - Laden aller 64 Wellen: keine `longtask` > 50 ms (Chromium, ohne Drosselung).
  - Die Welle eines eben geladenen Sounds klingt ≤ 30 ms nach dem Laden.
  - Tabellenspeicher laut `mkInfo().tableBytes` ≤ 16 MB.
- [ ] **MK2-09 CPU** (Node-Offline): Speicherwelle ≤ 1,1 × Säge, Stimmwelle ≤ 1,3 ×, Sinus× ≤ 1,2 ×, 4 aktive Patches ≤ +5 %.
- [ ] **MK2-10 Oberfläche:**
  - EDIT 2 mit PATCH 1–4, LCD z. B. „PATCH 2 · LFO 1 → CUTOFF · +32“.
  - Listen mit ≥ 44-px-Zeilen.
  - M-PLATZ in P1–P3, L1, L2, W. H-1/H-3 für alle neuen Regler.
- [ ] **MK2-11 Regression und DoD**, Budget ≤ +35 KB, kein Markenwort.

**Tests.** `mk2-osc.mjs`, `mk2-patch.mjs`, `mk2-ui.mjs`.

**Fach-Prüfung:** **FP-DSP** Haupt-, **FP-KLANG** Zweit-Blick.

**iPhone:** OSZ 1 → Speicherwelle, STEUER 2 durchdrehen. PATCH 1 LFO 2 → Cutoff, +40.

**Geräte-Abgleich:** Stimmwelle FORM 0/64/127. Sinus× X-MOD 64. Rauschen CUTOFF 24 mit RESO. 127 (gleiche Tonhöhe wie die Taste?). Klang einzelner Speicherwellen (nur als Vorgeschmack, die Originale kommen mit MK10).

**Risiken.** Die Platzhalter klingen anders als die Originale, das ist gewollt und markiert. Der Tabellenspeicher auf dem iPhone ist ungemessen.

---

### MK3 — Zwei Timbres, Split, Stimmung

**Ziel.** Ein AM-Sound spielt zwei Timbres übereinander (Dual = Layer) oder geteilt (Split). Die Stimmen werden wie am MS2000 aufgeteilt. Die zehn Stimmungen mit Grundton sind wählbar.

**Umfang.**
1. **PROG-Sektion:** MODUS Single │ Dual │ Split (Vocoder ab MK7), STIMMEN 1+3 │ 2+2 │ 3+1, SPLIT (C-1…G9), STIMMUNG, GRUNDTON. Am Gerät setzt man den Split per Halten + Taste (HB-MS S. 34). Hier gibt es dafür die Taste [Split ← nächste Note] in der LCD-Zeile, weil Halten im Editor keine neue Bedeutung bekommt (L4).
2. **Worklet:** Je Note spielen die Timbres nach Modus:
   - Dual: beide.
   - Split: Note < `split` → T1, sonst T2 [W].
   - Die Stimmen werden nach `tv` geteilt. Ist ein Timbre auf 1 Stimme begrenzt, spielt es mono, unabhängig von der Zuweisung (HB-MS S. 35).
   - Unison in Dual/Split nutzt die Stimmenzahl des Timbres.
   - Mono bei T1 und Poly bei T2 ist erlaubt.
   - AMP PEGEL/PAN je Timbre wirken als Balance (S. 40).
3. **TIMBRE-Wahl** T1 │ T2 in der SPIEL-Programmzeile. Alle Sektionen bearbeiten das gewählte Timbre. Die LCD zeigt „T2“. Bei Single ist T2 gesperrt.
4. **Werkzeuge** (⋯ im Blatt):
   - Timbre neu (INIT), Timbre tauschen.
   - Timbre kopieren aus einem beliebigen AM-Sound der Bibliothek (Timbre 1 oder 2 als Quelle).
   - Je ein Undo (HB-MS S. 46–47).
5. **Stimmung** (W-43): je Note und Timbre, vor der Tonhöhenrechnung. Eigene Stimmung mit 12 Werten (Blatt mit 12 Reglern −100…+100 ct). Keytrack rechnet mit der gestimmten Tonhöhe (HB-MS S. 39).

**Nicht-Umfang.** Mehr als 2 Timbres. Globale Stimmung (die Abweichung steht in B.1). Arp-Ziel (MK5).

**Daten.** `mode` 0–2, `tv`, `split`, `scale`, `skey`, `usc`, `t[1]` wirken jetzt.

**Oberfläche.** PROG ist offen. T1/T2 in SPIEL aktiv. Zusätzlich das Blatt „Eigene Stimmung“ (12 Regler, P1: 2 × 6 à 58 × 92; L1: 12 × 58).

**Berührungspunkte.**
- **Wiederverwendet:** Stimmenpool, Notenstapel aus MK1, Bibliothek für die Quellwahl.
- **Neu:** Timbre-Verteilung, Stimmungs-Tabellen, Timbre-Werkzeuge.

**Dauer** 6–7 h · **Version 4.11.0** · **Budget** +30 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK3-01 Dual:** Der Render ist die Summe der einzeln gerenderten Timbres (max |Δ| ≤ 1e-4, gleicher Seed).
- [ ] **MK3-02 Stimmen-Teilung:**
  - 1+3 mit Dreiklang: T1 spielt nur die letzte Note (mono), T2 alle drei.
  - 2+2 mit Vierklang: je 2 nach Priorität.
  - 3+1 spiegelbildlich.
  - Unison in Dual 2+2 (T1 Unison) ergibt 2 gestapelte Stimmen.
- [ ] **MK3-03 Split** bei C4: C3 nur T1, C4 nur T2 (die jeweils anderen ≤ −60 dB). Die Taste „Split ← nächste Note“ setzt `split` auf die nächste gespielte Note, ein Undo.
- [ ] **MK3-04 Timbre-Wahl:** Eine Bearbeitung mit T2 lässt T1 deep-equal. Bei Single ist T2 gesperrt (Hinweis im LCD).
- [ ] **MK3-05 Werkzeuge:**
  - Kopieren aus einem anderen Sound ergibt das Ziel-Timbre deep-equal zur Quelle.
  - Tauschen zweimal = Ausgang.
  - INIT-Timbre = INIT-Werte.
  - Je ein Undo.
- [ ] **MK3-06 Stimmungen:**
  - Für alle 10 Stimmungen und Grundton C sowie A liegt jede der 12 Tonklassen bei W-43 ± 0,5 ct (Spektral-Messung bei C4 bis B4).
  - Eigene Stimmung: 12 Werte wirken ± 0,5 ct.
  - Gleichstufig ist bitgleich zu 4.10.0.
- [ ] **MK3-07 Bitgleich:** Single-Klänge aus MK1/MK2 klingen bitgleich zu 4.10.0.
- [ ] **MK3-08 CPU:** Dual 2+2 kostet ≤ 1,05 × Single mit 4 Stimmen (Node-Offline). Es klingen nie mehr als 4 Stimmen.
- [ ] **MK3-09 Umschalten** von MODUS und STIMMEN bei klingenden Noten: M-KLICK und M-EINBRUCH bestehen (Stimmenblende).
- [ ] **MK3-10 Oberfläche:** PROG, T1/T2, Blatt „Eigene Stimmung“: M-PLATZ in P1–P3, L1, L2, W. M-ANSICHT beim Timbre-Wechsel (nichts springt).
- [ ] **MK3-11 Regression und DoD**, Budget ≤ +30 KB.

**Tests.** `mk3-timbre.mjs`, `mk3-scale.mjs`, `mk3-ui.mjs`.

**Fach-Prüfung:** **FP-DSP ●** Haupt-, **FP-TOUCH** Zweit-Blick. Blockierend, weil MK5–MK8 auf der Timbre-Struktur aufbauen.

**iPhone:** PROG → MODUS Split, SPLIT C4. Unten Bass (T1), oben Fläche (T2) bauen. STIMMUNG „Werckmeister III“ mit Akkorden.

**Geräte-Abgleich:** Layer am microKORG mit 2 Stimmen je Timbre (HB-MK S. 16) gegen Dual 2+2. Das Verhalten bei mehr Tasten als Stimmen.

**Risiken.** Welche Seite der Split-Grenze T1 ist, ist [W]. Die Stimmungstabellen sind Lehrbuchwerte, keine Gerätewerte.

---

### MK4 — Effekte: Mod-FX, Delay, EQ (je Sound)

**Ziel.** Jeder AM-Sound bringt seine Programm-Effekte mit, wie am Gerät, in der Reihenfolge Mod-FX → Delay → EQ.

**Umfang.**
1. **Im Worklet nach der Stimmensumme** (stereo, je Spur): Mod-FX Cho/Flg │ Ensemble │ Phaser (W-31), Delay Stereo │ Cross │ L/R (W-32) mit Tempo Sync (W-12, Song-Tempo), EQ (W-33). TIEFE 0 ist jeweils bitgleich trocken.
2. **Zeitwechsel** des Delays bei laufendem Echo: Lesekopf gleitet (≤ 50 ms), kein Sprung. Tempo-Wechsel: Sync-Zeit folgt am nächsten Block mit Gleiten.
3. **Sektionen** MOD-FX, DELAY, EQ in EDIT 2. ZEIT │ NOTE wechselt mit TEMPO SYNC.
4. Die **Spur-Kette bleibt unverändert dahinter** (Drive, Chorus, Hall-/Echo-Send, Pump, Vol, Pan).
5. **Leistungs-Probe:** Fall „+FX“.

**Nicht-Umfang.** Weitere Effekttypen. Effekte für andere Engines (VK2 kann den Code mitnutzen, Teil G).

**Daten.** `mfx`, `dly`, `eq` wirken jetzt.

**Oberfläche.** Drei Sektionen in EDIT 2. LCD z. B. „DELAY · NOTE 1/8 · 250 ms“.

**Berührungspunkte.**
- **Wiederverwendet:** Worklet-Tempo (`{tempo}` mit `at`), Glättung.
- **Neu:** Effektkern im AM-Zweig (Verzögerungsleitungen, Allpass-Kette, Kuhschwanz-Biquads).

**Dauer** 5–6 h · **Version 4.12.0** · **Budget** +25 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK4-01 Aus = bitgleich:** TIEFE 0 bei Mod-FX und Delay sowie EQ 0 dB sind bitgleich zu 4.11.0, für alle drei Mod-FX-Typen.
- [ ] **MK4-02 Cho/Flg** TIEFE 100 auf Rauschen: Kammfilter mit Kerbtiefe ≥ 12 dB. Der Kammabstand wandert mit dem LFO, Periode nach W-31 ± 5 % (TEMPO 64). Bei TIEFE 40: keine Kerbe ≥ 6 dB (Chorus).
- [ ] **MK4-03 Ensemble** TIEFE 127 mit Mono-Eingang: Kreuzkorrelation L/R ≤ 0,5, Pegel ± 1 dB gegenüber trocken.
- [ ] **MK4-04 Phaser** TIEFE 127: ≥ 3 Kerben ≥ 12 dB. Die tiefste Kerbe wandert über ≥ 2 Okt.
- [ ] **MK4-05 Stereo-Delay** Sync 1/8 bei 120 BPM:
  - Erstes Echo nach 250 ms ± 1 Sample in L und R.
  - TIEFE 64: Echo-Pegel nach W-32 ± 0,5 dB.
  - TIEFE 127: jede Wiederholung ≥ 1,9 dB leiser, kein Überlauf (Spitze ≤ 0 dBFS).
- [ ] **MK4-06 Cross/L-R:** Cross-Delay mit Impuls nur links: Echos abwechselnd L, R, L (Energie je Echo ≥ 20 dB über dem anderen Kanal). L/R-Delay mit Mono-Impuls: abwechselnd L, R.
- [ ] **MK4-07 Zeit:** Sync aus, ZEIT 0/64/127 nach W-32 ± 1 %. ZEIT-Wechsel bei laufendem Echo besteht M-KLICK.
- [ ] **MK4-08 Tempo:** 120 → 90 BPM während des Echos: Die Sync-Zeit folgt ≤ 1 Takt, ohne Knacken.
- [ ] **MK4-09 EQ:**
  - Tiefen-Kuhschwanz 100 Hz +12 dB: bei 25 Hz +12 ± 0,5 dB, bei 400 Hz ± 1 dB, bei 1 kHz ± 0,3 dB.
  - Höhen-Kuhschwanz 8 kHz −12 dB: bei 16 kHz −12 ± 1 dB, bei 2 kHz ± 0,5 dB.
- [ ] **MK4-10 Reihenfolge:** Das Echo trägt die Phaser-Kerben. Der EQ wirkt auf das Echo (Kuhschwanz-Messung im Echo).
- [ ] **MK4-11 CPU:** Alle drei Effekte an kosten ≤ +0,6 Prozentpunkte je Spur (Node-Offline). Die Leistungs-Probe läuft mit „+FX“.
- [ ] **MK4-12 Oberfläche:** M-PLATZ in P1–P3, L1, L2, W. H-1/H-3 für alle Effekt-Regler. ZEIT │ NOTE wechselt ohne Sprung der Elemente (M-ANSICHT).
- [ ] **MK4-13 Regression und DoD** (Spur-Effekte unverändert), Budget ≤ +25 KB.

**Tests.** `mk4-fx.mjs` (Node-Offline), `mk4-ui.mjs`.

**Fach-Prüfung:** **FP-DSP** Haupt-, **FP-IPHONE** Zweit-Blick.

**Zwischenstand** nach MK4 (EN3-17): Artifact + Pages.

**iPhone:** DELAY Sync 1/8, TIEFE 60, mit laufendem Song. MOD-FX Ensemble auf einer Fläche.

**Geräte-Abgleich:** Cho/Flg TIEFE 40 und 100. Ensemble. Phaser TEMPO 30. Delay TIEFE 64 (wie viele Wiederholungen?).

**Risiken.** Die Effekt-Kurven sind eK. Die Echo-Länge ist auf 1,4 s begrenzt, Speicher ≈ 0,5 MB je Spur bei 48 kHz stereo.

---
### MK5 — Step-Arpeggiator

**Ziel.** Gehaltene Akkorde werden arpeggiert, wie am microKORG: sechs Typen, 1–4 Oktaven, Gate, Swing, Latch, Key Sync und acht Schritt-Tasten zum Ein- und Ausschalten. Alles liegt taktgenau im Song-Tempo, live und aus Clips.

**Umfang.**
1. **Arp-Kern im Hauptfaden** (EN3-11), je AM-Spur.
   - Alle Notenquellen der Spur gehen bei `arp.on` in den „gehaltenen Satz“ statt direkt an `spawnVoice`: Tastatur, Akkordtasten, Clip-Noten, MELODIE-Weg und Aufnahme-Wiedergabe.
   - Der Arp plant die Schritte im vorhandenen Vorlauf (`tick`, `LOOKAHEAD` 0,1 s) und ruft `spawnWkVoice` mit Zeitstempel auf.
   - `noteLog` bekommt `src: 'arp'` mit Schritt-Nummer.
   - Harmonie und Transponieren (⇅) wirken vorher auf die Eingangsnoten. Der Arp sieht also schon die Zielnoten.
2. **Muster** (HB-MS S. 45): Gehaltene Noten aufsteigend N₁…Nₖ, Range R, U = [N₁…Nₖ, N₁+12…Nₖ+12, …] über R Oktaven.
   - Up = U, Down = U rückwärts.
   - Alt 1 = U + (U rückwärts ohne erstes und letztes).
   - Alt 2 = U + U rückwärts.
   - Random = gleichverteilt aus U. Startwert = Projekt-`id` + Spur-`uid` + Schritt-Zähler, damit Wiederholungen gleich bleiben.
   - Trigger = alle gehaltenen Noten je Schritt, Range wird ignoriert. Sind mehr Tasten als Stimmen gedrückt, spielen die tiefsten.
3. **Zeit:**
   - Schritt = Auflösung W-11 bei Song-Tempo.
   - Transport läuft: Raster = Song-Takt.
   - Transport steht: Raster ab dem ersten Tastendruck, die erste Note sofort (wie Live-Spiel, `LIVE_LEAD`).
   - Gate W-34, Swing W-35.
   - KEY SYNC an: Das Muster beginnt mit dem ersten Tastendruck nach „alle los“ bei Schritt 1. Die Einsätze bleiben auf dem Raster.
   - KEY SYNC aus: Der Muster-Zähler läuft mit dem Raster weiter.
4. **Step-Arp** (HB-MK S. 11, S. 45): LETZTER SCHRITT 1–8 und Schritt-Maske `steps`. Ein ausgeschalteter Schritt ist eine Pause. Der Notenzeiger rückt trotzdem weiter (eK, Geräte-Abgleich).
5. **Latch:** Loslassen hält den Satz. Neue Tasten nach „alle los“ ersetzen ihn, eine weitere Taste beim Halten ergänzt. Latch aus → Stopp ≤ 1 Schritt.
6. **Ziel** (Dual/Split): Both │ T1 │ T2. Das nicht arpeggierte Timbre spielt die gehaltenen Noten normal.
7. **Aufnahme** (● REC, FANG, Overdub): Aufgezeichnet werden die **gespielten Tasten**. Der Arp entsteht beim Abspielen neu (Vorgabe, H-8). Song-MIDI-Export: wie bisher die Clip-Noten, ohne Arp-Noten (Lücke in CHANGES).
8. **Aufräumen:** Stopp, Panik, Szenen- oder Teilwechsel, Engine-Wechsel, Arp aus und Spur stumm beenden alle Arp-Noten ≤ 1 Schritt. Keine hängende Note.
9. **Oberfläche:**
   - SPIEL: [ARP ●] und [LATCH ●].
   - EDIT 2: ARP A (TEMPO zeigt das Song-Tempo, AUFLÖSUNG, GATE, TYP, OKTAVEN) und ARP B (LATCH, SWING, KEY SYNC, LETZTER SCHRITT, ZIEL).
   - Bei ARP A/B werden die Nummerntasten zu **Schritt-Tasten** 1–8. Leuchtend = an. Der laufende Schritt ist markiert (≤ 1 Bild Verzug). Schritte über LETZTER SCHRITT sind dunkel.
10. **Leistungs-Probe:** Fall „+Arp“ (4 Spuren, 1/24).

**Nicht-Umfang.** Arp für VA/FM/WT. Der Kern ist aber engine-frei gebaut (Teil G, VI2a). Arp-Noten in den MIDI-Export. Arp mit eigenem Tempo.

**Daten.** `arp` wirkt jetzt. `arp.tempo` wird nur gespeichert (EN3-10).

**Berührungspunkte.**
- **Wiederverwendet:** `tick`/`LOOKAHEAD`, `spawnWkVoice`, `noteLog`, FANG/REC-Wege (unverändert für Nicht-AM-Spuren), `silenceAll`.
- **Neu:** Arp-Kern, Schritt-Tasten, Muster-Tabelle, Seed.

**Dauer** 6–7 h · **Version 4.13.0** · **Budget** +30 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK5-01 Muster:** C-E-G gehalten. Die Folgen Up, Down, Alt 1, Alt 2 und Trigger für Range 1–4 sind in `arpLog` deep-equal zur Testtabelle (Beispiel Range 1: Alt 1 = C E G E, Alt 2 = C E G G E C).
- [ ] **MK5-02 Random:** 4 Töne, 2000 Schritte: jeder Ton 25 % ± 4 %. Gleicher Seed → gleiche Folge (deep-equal).
- [ ] **MK5-03 Zeit** (M-ZEIT): Auflösung 1/16 bei 120 BPM ergibt Abstände von 125 ms. Einsätze auf dem Song-Raster ± 0,002 Schlag (`noteLog`), Audio-Einsatz offline ± 1 ms. Die Triolen 1/24, 1/12, 1/6 sowie 1/8 und 1/4 ebenso.
- [ ] **MK5-04 Gate:** 50 % ergibt eine Notenlänge von ½ Schritt ± 1 ms. Bei 100 % gibt es keine Lücke (M-EINBRUCH, Sustain 127). Bei 0 % sind es 3 ms.
- [ ] **MK5-05 Swing** +50 (1/8): Die geraden Noten kommen 62,5 ± 1 ms später. Bei −50 kommen sie früher, bei 0 gerade.
- [ ] **MK5-06 Step-Arp:**
  - LETZTER SCHRITT 4 mit Schritt 2 aus ergibt Note, Pause, Note, Note und wiederholt sich alle 4 Schritte. Der Notenzeiger rückt bei der Pause weiter.
  - Alle Schritte aus ergibt Stille ohne Fehler.
- [ ] **MK5-07 Key Sync:** An: Ein neuer Akkord nach „alle los“ beginnt bei Schritt 1 mit N₁. Aus: Die Position folgt dem Song-Raster (zwei Läufe mit unterschiedlichem Anschlagzeitpunkt ergeben dasselbe Muster ab dem Takt).
- [ ] **MK5-08 Latch:** Das Verhalten nach Umfang 5 stimmt, in `arpLog` geprüft.
- [ ] **MK5-09 Transport steht:** Die erste Arp-Note kommt ≤ 10 ms nach dem Tastendruck (gemessen am geplanten Zeitstempel).
- [ ] **MK5-10 Tempo:** Ein Tempo-Wechsel mitten im Lauf hat den nächsten Schritt im neuen Tempo. Kein doppelter und kein fehlender Schlag.
- [ ] **MK5-11 Ziel:** Dual mit Ziel T1: nur T1 arpeggiert, T2 hält den Akkord. Both und Split + Ziel ebenso.
- [ ] **MK5-12 Trigger** mit 6 Tasten bei 4 Stimmen: Die 4 tiefsten spielen (HB-MS S. 45).
- [ ] **MK5-13 Clips:** Ein 4-Takt-Akkord-Clip durch den Arp ergibt in zwei Durchläufen dieselbe `arpLog`-Folge. Szenen- oder Teilwechsel am Taktstrich lassen keine Note hängen.
- [ ] **MK5-14 Aufnahme:** ● mit Arp nimmt die Tasten auf (Clip-Noten = gespielte Akkorde), ein Undo. Beim Abspielen entsteht dieselbe Arp-Folge wie beim Spielen (Random mit gleichem Seed).
- [ ] **MK5-15 Aufräumen:** Für jede Aktion aus Umfang 8 gilt: nach ≤ 1 Schritt plus Release 0 klingende Stimmen (`voicesInfo`).
- [ ] **MK5-16 Leistung:** 4 Arp-Spuren mit 1/24 kosten ≤ 0,3 ms je `tick` (p95, Xeon). PE1 besteht. Die Leistungs-Probe läuft mit „+Arp“.
- [ ] **MK5-17 Oberfläche:**
  - P1: [ARP ●]/[LATCH ●] 44 × 44, Schritt-Tasten 43 × 44. L1: ≥ 40 × 36.
  - M-PLATZ in P1–P3, L1, L2, W. Die Schritt-Tasten ersetzen die Nummern ohne Sprung (M-ANSICHT).
  - Die Anzeige des laufenden Schritts ≤ 30 Hz.
- [ ] **MK5-18 Regression:** FANG, ● REC, MELODIE, Song-Ablauf und Teile sind für Nicht-AM-Spuren und für AM mit Arp aus unverändert (die Abnahmen von V2b–V2d′ bestehen). Budget ≤ +30 KB.

**Tests.** `mk5-arp.mjs` (`arpLog`, `noteLog`), `mk5-arp-audio.mjs` (OfflineAudioContext, Einsätze), `mk5-ui.mjs`.

**Fach-Prüfung:** **FP-SONG ●** Haupt-, **FP-TOUCH** Zweit-Blick.

**iPhone:** [ARP ●], Akkord halten, ARP A TYP Alt 2, OKTAVEN 2. ARP B LETZTER SCHRITT 6, zwei Schritt-Tasten aus. Mit laufendem Song spielen.

**Geräte-Abgleich:** Step-Arp „Schritt aus“ (rückt die Note weiter?). Swing +50. Gate 0. Key Sync aus bei laufendem Takt (microKORG ohne MIDI-Clock: nur Muster-Neustart vergleichen).

**Risiken.** Die Pausen-Regel ist [U]. Das Arp-Verhalten bei sehr kurzen Clip-Noten (< 1 Schritt) hängt von der Länge ab: Eine Note zählt, solange sie gehalten ist.

---

### MK6 — Mod-Sequenzer 3×16 und „Bewegung aufnehmen“

**Ziel.** Je Timbre verändern drei 16-Schritt-Sequenzen beliebige Regler im Takt, wie beim MS2000, mit Glatt oder Stufe, vier Laufrichtungen, Einmal oder Schleife und Neustart je Timbre oder je Stimme. Reglerbewegungen lassen sich in Echtzeit in die Schritte aufnehmen.

**Umfang.**
1. **Worklet**, je Timbre und je Stimme bei Key Sync „Stimme“.
   - SEQ AN/AUS, LETZTER SCHRITT 1–16, TYP (Vorwärts, Rückwärts, Wechsel 1 = 1…16, 15…2, Wechsel 2 = 1…16, 16…1), LAUF (Einmal hält den letzten Wert, Schleife), KEY SYNC (aus = Song-Raster bzw. freilaufend, Timbre, Stimme), AUFLÖSUNG W-10 bei Song-Tempo.
   - Je Sequenz: ZIEL, BEWEGUNG (Glatt = linear zwischen den Schrittwerten, Stufe = halten), 16 Werte.
2. **Ziele:** keins, Tonhöhe (±24 HT), Schrittlänge (±6), Portamento, OSZ1-Steuer 1, OSZ1-Steuer 2, OSZ2-Halbton (±24), OSZ2-Fein, Mixer OSZ 1/OSZ 2/Rauschen, Cutoff, Resonanz, HK-INT, Keytrack, Amp-Pegel, Pan, EG1 A/D/S/R, EG2 A/D/S/R, LFO1-Freq, LFO2-Freq, Patch 1–4 Intensität. Ab MK11 nach MK-R1 auch die neuen Regler.
   - Abgeleitet aus HB-MS S. 43 („Regler des Bedienfelds, ±63“) und S. 65 (Regler-Liste). Schalter sind keine Ziele [U].
   - Der Schrittwert wird zum gespeicherten Reglerwert addiert und geklemmt.
   - Schrittlänge verschiebt den Auflösungs-Index des Schritts um den Wert (eK; HB-MS S. 43 „±6“).
   - Steuer 2 mit Speicherwelle ergibt eine Wellenfolge (2-ms-Blende).
   - Tonhöhe wirkt auf den Keytrack (HB-MS S. 39).
3. **Vorrang:** Zielen zwei Sequenzen auf denselben Regler, gilt SEQ 3 vor SEQ 2 vor SEQ 1. Die LCD zeigt „*“ (HB-MS S. 43).
4. **Bewegung aufnehmen** (HB-MS S. 26):
   - [● AUFN.] bei gewählter Sequenz. Die Aufnahme beginnt mit dem ersten bewegten Regler einer EDIT-Sektion.
   - Das Ziel der Sequenz wird dieser Regler. Werte werden ab dem laufenden Schritt bis LETZTER SCHRITT geschrieben, dann endet die Aufnahme selbst.
   - Nur der zuerst bewegte Regler zählt. ARP- und Effekt-Regler nehmen nicht auf.
   - Ein Undo für die ganze Aufnahme.
   - Während der Aufnahme läuft die Sequenz immer vorwärts und als Schleife (S. 42–43).
5. **Werkzeuge:** Sequenz neu (eine oder alle), kopieren (aus einem anderen AM-Sound, Timbre und Sequenz wählbar), alles kopieren, tauschen. Je ein Undo (HB-MS S. 47–48).
6. **Reiter SEQ** (B.3):
   - Reihe 1: [SEQ 1][SEQ 2][SEQ 3] [ZIEL ▾] [● AUFN.]
   - Reihe 2: [SCHRITTE │ ALLGEMEIN] [GLATT │ STUFE] [SEQ ●]
   - SCHRITTE: 16 Säulen. P1 2 × 8 à 43 × 88, L1 16 × 48 × 92. Ziehen ändert den Wert, waagrecht > 8 px malt über mehrere Säulen. Eine Geste = ein Undo, ein zweiter Finger wird ignoriert. Der laufende Schritt ist hell (Canvas 2D, ≤ 30 Hz, nur sichtbar).
   - ALLGEMEIN: 5 Regler LETZTER SCHRITT, TYP, LAUF, KEY SYNC, AUFLÖSUNG.
   - L1: Die beiden Kopfreihen stehen in einer Reihe (36 px), darunter die 16 Säulen (Summe 132 px).
   - P1: 44 + 4 + 44 + 8 + 2 × 88 + 4 = 280 px.
   - SPIEL: [SEQ ●].
7. **Leistungs-Probe:** Fall „+Seq“.

**Nicht-Umfang.** Seq im Vocoder-Modus (HB-MS hat dort keine Seq, S. 49–52). Mehr als 16 Schritte.

**Daten.** `t[].seq` wirkt jetzt.

**Berührungspunkte.**
- **Wiederverwendet:** Worklet-Tempo und Phase (`songStart`), Stimmen-Zustand, Undo, Canvas-Muster der vorhandenen Anzeigen.
- **Neu:** Seq-Kern, Säulen-Editor, Aufnahme-Logik.

**Dauer** 7–8 h · **Version 4.14.0** · **Budget** +35 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK6-01 Zeit:** Auflösung 1/16, 120 BPM, Ziel Amp-Pegel, Stufe: Schrittwechsel alle 125 ms ± 1 Steuerblock (16 Samples), am Pegel gemessen. Alle 16 Auflösungen nach W-10.
- [ ] **MK6-02 Glatt:** Lineare Rampe. In der Schrittmitte weicht der Wert ≤ 1 % des Hubs ab.
- [ ] **MK6-03 Typen:** Bei LETZTER SCHRITT 16 sind die Schrittfolgen (`mkScope().seqStep`) für Vorwärts, Rückwärts, Wechsel 1 und Wechsel 2 deep-equal zur Tabelle. LETZTER SCHRITT 5 ergibt die Länge 5.
- [ ] **MK6-04 Lauf:** Bei Einmal bleibt der Wert nach dem letzten Schritt genau stehen. Bei Schleife wiederholt er sich.
- [ ] **MK6-05 Key Sync:**
  - Timbre: Reset bei der ersten Note nach „alle los“, weitere Noten in derselben Phase.
  - Stimme: zwei Noten 0,3 s versetzt stehen auf verschiedenen Schritten.
  - Aus: Schritt = Song-Rasterposition bei laufendem Transport.
- [ ] **MK6-06 Ziele:**
  - Tonhöhe +12 an Schritt 3 ergibt +1200 ± 1 ct nur in Schritt 3.
  - Cutoff +63 ergibt +63 Einheiten, geklemmt bei 127.
  - Schrittlänge +2 an Schritt 1 (1/16) lässt Schritt 1 so lange dauern wie Auflösungs-Index + 2 (3/32 = 187,5 ms ± 1 Block).
  - OSZ2-Halbton ±24 ± 1 ct.
  - EG-Zeiten wirken ab der nächsten Stufe.
  - Patch-Intensität wirkt.
- [ ] **MK6-07 Vorrang:** SEQ 1 und SEQ 3 auf Cutoff → nur SEQ 3 wirkt, die LCD zeigt „*“.
- [ ] **MK6-08 Wellenfolge:** Speicherwelle, SEQ 1 → Steuer 2, Stufe: je Schritt die erwartete Welle (Spektrum-Vergleich mit dem Einzel-Render), M-KLICK besteht.
- [ ] **MK6-09 Bewegung aufnehmen** (Test-API simuliert den Reglerzug bei laufender Note):
  - Die Werte landen ab dem Schritt des ersten Zugs bis LETZTER SCHRITT. Danach endet die Aufnahme.
  - Das Ziel ist der bewegte Regler, nur der erste zählt.
  - Ein Undo stellt alles her. ARP- und Effekt-Regler schreiben nichts.
- [ ] **MK6-10 Neutral:** Seq aus = bitgleich zu 4.13.0. Seq an mit allen Werten 0 (Ziel ≠ Schrittlänge) = bitgleich.
- [ ] **MK6-11 Säulen-Editor:**
  - Ziehen ändert einen Schritt, waagrecht malen ändert mehrere, je ein Undo. Ein zweiter Finger ändert nichts.
  - Werte in Ziel-Einheiten (±6/±24/±63).
  - M-PLATZ in P1–P3, L1, L2, W. M-ANSICHT bei SCHRITTE ↔ ALLGEMEIN.
- [ ] **MK6-12 Leistung:** 3 Sequenzen je Timbre mit 4 Stimmen bei Key Sync „Stimme“ kosten ≤ +0,3 Prozentpunkte (Node-Offline). Die Anzeige hat keine `longtask`, rAF ≥ 55 fps. Die Leistungs-Probe läuft mit „+Seq“.
- [ ] **MK6-13 Werkzeuge:** Kopieren, Tauschen und Neu ergeben deep-equal-Ergebnisse, je ein Undo. Regression und DoD, Budget ≤ +35 KB.

**Tests.** `mk6-seq.mjs` (Node-Offline), `mk6-rec.mjs`, `mk6-ui.mjs`.

**Fach-Prüfung:** **FP-DSP** Haupt-, **FP-SONG** Zweit-Blick (Taktgenauigkeit).

**iPhone:** SEQ → SEQ 1 ZIEL Cutoff, Säulen malen, Song starten. [● AUFN.] und Cutoff-Regler drehen.

**Geräte-Abgleich:** entfällt, der microKORG hat keinen Mod-Sequenzer. Die Kurven bleiben eK.

**Risiken.** „Schrittlänge“ ist eine Auslegung [U]. Ohne Gerät gibt es keinen Abgleich.

---

### MK7 — Vocoder mit 16 Bändern und Eingänge

**Ziel.** Ein AM-Sound wird zum Vocoder: Die Stimme (Mikrofon oder eine andere Spur) formt einen Akkord aus vier Stimmen. Mit „Formant halten“ klingt ein gespeicherter Vokal auch ohne Mikrofon, also auch in der Claude-App. Synth-Programme können einen Eingang wie einen Oszillator filtern.

**Umfang.**
1. **Eingänge** (EN3-15):
   - `tr.mkIn.e1/e2` = Mikrofon (nur Pages und nur auf Tipp, über den VS1-Weg: play-and-record, Wege-Erkennung, Kopfhörer-Hinweis) │ Spur k (Abgriff nach ihrem Fader) │ aus.
   - Der Worklet-Knoten **jeder Synth-Spur** hat ab MK7 **1 Eingang mit 2 Kanälen** (E1, E2; `channelCountMode 'explicit'`, `interpretation 'discrete'`). Das gilt auch bei VA/FM, damit der Engine-Wechsel ohne neuen Knoten geht (Kosten: MK7-12). Dazu kommt ein `ChannelMergerNode` je Spur, das nur bei einer gewählten Quelle verbunden ist.
   - Spuren, die einen Kreis bilden würden (eigene Spur, Spuren mit dieser Spur als Eingang), sind nicht wählbar.
   - In der Claude-App gibt es kein Mikrofon: kein Eintrag, kein `getUserMedia`.
2. **Welle „Eingang“** (OSZ 1, W-30) in Synth-Programmen.
3. **Vocoder-Modus** (`mode` 3):
   - Der Träger ist Timbre 1: OSZ 1 (alle Wellen, Sinus ohne Kreuzmod., HB-MS S. 49) + Rauschen + E1 (EINGANG 1), 4 Stimmen.
   - Der Modulator ist E2.
   - 16 Analyse-Bänder (feste Mitten W-36), Hüllkurvenfolger (W-38), 16 Synthese-Bänder (Verschiebung FORMANT, CUTOFF, FC-MOD), Resonanz W-37, Gate/Schwelle W-39, HPF W-40, Direkt W-41, Verzerrer, Anschlag, Keytrack, Kanal-Pegel und -Pan W-42.
   - EG/LFO wie Synth, Effekte und Arp wie Synth.
4. **Formant halten:**
   - FOLGER = 127 oder [HALTEN ●] (SPIEL) friert die 16 Folgerwerte ein und speichert sie als `voc.hold` im Sound (HB-MK S. 35).
   - Ein Sound mit `hold` klingt ohne Quelle.
   - [HALTEN ●] aus = Folger läuft wieder (der Wert vor Halten wird zurückgesetzt).
5. **Oberfläche:**
   - EDIT 1 und EDIT 2 mit den Vocoder-Rastern (B.3), EING. mit [QUELLE 2 ▾], MIXER mit [QUELLE 1 ▾].
   - K-PEGEL/K-PAN mit 16 Säulen und Live-Bandpegeln (Canvas 2D, ≤ 30 Hz, nur sichtbar).
   - [Kanäle zurücksetzen] (Pegel 127 / Pan Mitte, HB-MS S. 52).
6. **Datenschutz:** Der Vocoder nimmt nichts auf. Das Mikrofon im Vocoder zählt wie 🎤-Hören (N2-VS1-02 (1)): SYNC und Realtime laufen weiter, das Audio verlässt das Gerät nie. Stopp gibt das Mikrofon frei.
7. **Leistungs-Probe:** Fall „Vocoder“ (synthetischer Modulator: Vokal-Folge aus der eigenen Formant-Rechnung).

**Nicht-Umfang.** Speichern des Modulators als Take (VS3). Vocoder für andere Engines. Formant-Bewegung aufnehmen (RADIAS, nicht im Plan).

**Daten.** `mode` 3, `voc` und `tr.mkIn` (Spur, neutral `null`).

**Berührungspunkte.**
- **Wiederverwendet:** VS1-Mikrofon-Zugang (`micAvail`, play-and-record, Wege-Erkennung), Spur-Ketten-Abgriffe (`post`), Effektkern MK4, Arp MK5, Oktav-Tabellen (Träger).
- **Neu:** Worklet-Eingang, Filterbank, Folger, Halten, Kanal-Seiten, Kreis-Schutz.

**Dauer** 8–9 h · **Version 4.15.0** · **Budget** +45 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK7-01 Bandtrennung:** Modulator = Sinus in der Mitte von Band k (k = 1…16). Träger = Rauschen (Mixer Rauschen 127), FORMANT 0, CUTOFF 0, RESONANZ 64. Die Ausgangsenergie im Band k liegt ≥ 12 dB über k ± 1 und ≥ 30 dB über k ± 3.
- [ ] **MK7-02 Bandmitten:**
  - Synthese-Spitzen bei W-36 ± 3 % (FORMANT 0).
  - FORMANT +1 bzw. −2 verschiebt jede Spitze um +1 bzw. −2 Rasterstufen ± 3 %.
  - CUTOFF +63 = +2 Stufen. CUTOFF +32 liegt zwischen +1 Stufe ± 5 % (log).
  - FC-MOD EG2 +63 verschiebt am Gipfel um +2 Stufen.
- [ ] **MK7-03 Folger und Halten:**
  - FOLGER 0/64/126: Abfallzeit (−20 dB) nach W-38 ± 10 %.
  - 127 bzw. [HALTEN ●]: Verstummt der Modulator, bleibt der Ausgang über 5 s ± 0,5 dB.
  - `hold` wird gespeichert und geladen (deep-equal). Ein Sound mit `hold` klingt ohne jede Quelle (Claude-App-Test).
- [ ] **MK7-04 Gate:** SCHWELLE 64 und Modulator darunter: Ausgang ≤ −60 dB nach der Gate-Zeit (W-39) ± 10 %.
- [ ] **MK7-05 HPF:**
  - HPF-PEGEL 127: Modulator-Anteile > 6 kHz erscheinen im Ausgang (≥ −20 dB relativ zum Modulator-HF).
  - HPF-GATE ENA: nur bei klingender Trägerstimme. DIS: immer.
- [ ] **MK7-06 Direkt:** DIREKT 127 bei stummem Träger: Ausgang korreliert ≥ 0,95 mit dem Modulator. DIREKT 0 = nichts.
- [ ] **MK7-07 Kanäle:** K-PEGEL k = 0 ergibt Band k ≤ −40 dB. K-PAN k = L63 ergibt rechts ≤ −30 dB. [Kanäle zurücksetzen] = 127/Mitte, ein Undo.
- [ ] **MK7-08 Träger:**
  - Jede OSZ-1-Welle (Säge, Puls, Dreieck, Sinus, Stimmwelle, Speicherwelle, Rauschen, Eingang) ist als Träger hörbar.
  - Akkord C-E-G-H ergibt 4 Tonhöhen im Ausgang (Spektrum).
  - Der Mixer EINGANG 1 mischt E1 in den Träger.
- [ ] **MK7-09 Welle „Eingang“** (Synth):
  - Quelle Spur mit Sinus 440 Hz, Filter 24LPF Cutoff 40: der Pegel fällt nach Filterkurve.
  - BALANCE 0/127 ergibt nur E1 bzw. nur E2 (≥ 40 dB Trennung).
  - Transponieren und Fein wirken nicht (HB-MS S. 17).
- [ ] **MK7-10 Eingänge und Sicherheit:**
  - Ein Kreis ist nicht wählbar (Graph-Prüfung über alle Spuren).
  - Spur → AM-Eingang ≤ 1 Block Latenz.
  - In der Claude-App: `getUserMedia`-Zähler 0, kein Mikrofon-Eintrag.
  - Auf Pages: `getUserMedia` nur nach Tipp. Stopp ergibt `readyState 'ended'`.
  - Der Vocoder macht 0 Netzaufrufe.
- [ ] **MK7-11 CPU:**
  - Eine Vocoder-Spur (16 Bänder, 4 Stimmen Säge) kostet ≤ +1,5 Prozentpunkte gegenüber dem Synth-Programm (Node-Offline).
  - Begrenzer Stufe 1 halbiert die Filterordnung, die Nachbarband-Dämpfung bleibt dann ≥ 8 dB.
  - Die Leistungs-Probe läuft mit „Vocoder“.
- [ ] **MK7-12 Bitgleich:** Synth-Programme ohne Eingang klingen bitgleich zu 4.14.0. Der unverbundene Eingang kostet ≤ +0,1 Prozentpunkte.
- [ ] **MK7-13 Oberfläche:** M-PLATZ der Vocoder-Raster und Kanal-Seiten in P1–P3, L1, L2, W. Der Wechsel Synth ↔ Vocoder lässt die Zellen an festen Plätzen (2 × 7). Bandpegel ≤ 30 Hz, rAF ≥ 55 fps.
- [ ] **MK7-14 Regression:** Die Abnahmen von VS1, VS2 und VS0 bestehen, die Mikro-Wege sind unverändert. Budget ≤ +45 KB.

**Tests.** `mk7-voc.mjs` (Node-Offline mit `inputs`), `mk7-inputs.mjs` (Chromium, Fake-Mikrofon `--use-fake-device-for-media-stream`), `mk7-ui.mjs`.

**Fach-Prüfung:** **FP-DSP ●** Haupt-, **FP-IPHONE** und **FP-SICHER** Zweit-Blick (Mikrofon, N7V-35, Kreis-Schutz).

**Zwischenstand** nach MK7 (EN3-17) auf Pages, wegen des Mikrofons.

**iPhone** (Pages, mit Kopfhörer):
1. AM → PROG MODUS Vocoder → EING. QUELLE 2 Mikrofon. Sprechen und Akkord spielen.
2. [HALTEN ●], Mikrofon aus, weiterspielen.
3. In der Claude-App den gehaltenen Sound öffnen und spielen.

**Geräte-Abgleich:** microKORG-Vocoder mit FORMANT +1/−1, FOLGER Halten, HPF-PEGEL hoch (Zischlaute?).

**Risiken.** iOS legt bei play-and-record den Ton auf den Hörer (VS0-Befund). Darum der Kopfhörer-Hinweis. Die Mikrofon-Latenz ist bekannt (≈ 70–75 ms Rundlauf, VS1). Für den Vocoder zählt nur Mikrofon → Ausgang, das ist ungemessen.

---

### MK8 — Werksklänge in acht Genre-Bänken

**Ziel.** Xander findet seine Klänge wie am microKORG nach Genre: acht Bänke mit je acht eigenen Klängen. Jeder Klang zeigt, was die Klangerzeugung kann (Arp, Seq, Vocoder, Split, Speicherwellen).

**Umfang.**
1. **64 Klänge** (Vorgabe H-3) auf Seite A, A.11…A.88. Bänke:
   1. Trance
   2. Techno/House
   3. Electronica
   4. D&B/Breaks
   5. HipHop/Vintage
   6. Retro
   7. Effekte/Hits
   8. Vocoder

   Seite B bleibt den eigenen AM-Sounds.
2. **Rezepte frei entworfen** (EN3-07). Je Bank eine Mischung der Rollen (Bass, Lead, Fläche, Sequenz/Arp, Akkord, Effekt).
   - Die Vocoder-Bank hat 8 Klänge mit `hold`-Spektren aus **eigenen** synthetischen Vokalen (Formant-Rechnung W-44 als Modulator). Sie klingen ohne Mikrofon.
   - Jeder Klang hat `role`, `bank` (1…8), `slot` (1…8) und ⓘ (eigene Worte, keine Marken, keine Geräte, keine Künstler).
3. **Kompakt kodiert:** Ganzzahl-Bytes je Feld in fester Reihenfolge, Base64, im Block `sq-mk-src`. Entpackt wird erst bei Bedarf.
4. **Programm-Wähler** (SPIEL): Bank ▾ (8 Namen), A │ B, Anzeige „A.24“, Tasten 1–8. Ein Tipp lädt in die Spur, ein Undo, Toast [Rückgängig]. ‹ › im Kopf blättert in der Bank.
5. **Bibliothek:** Engine-Filter „AM“ plus Chip „Bank ▾“, ▶ Vorhören mit der vorhandenen Vorhör-Stimme, INIT AM unter „Init“.

**Nicht-Umfang.** Hörproben nach EN2-09 (das gilt für Vorbild-Sounds, V10P). Vorbild-Tags. Seite B mit Werksklängen (nur bei H-3 = 128).

**Daten.** Werksdaten `SQ_MK_FACTORY` (kompakt). Sound-Felder `bank`, `slot` (zählen nicht zum `soundHash`, wie `aud`/`role`, V10P-10).

**Berührungspunkte.**
- **Wiederverwendet:** `SQ_FACTORY`-Muster, Bibliothek und Filter (N0b-01), Vorhören (V0b), Pegel-Messung aus V10P (`v10p-pegel.mjs`-Verfahren).
- **Neu:** Bank-Wähler, Werksdaten.

**Dauer** 8–9 h in zwei Bau-Abschnitten:
1. Datenform, Wähler, Bänke 1–4.
2. Bänke 5–8, Bibliothek, Prüfskripte.

**Version 4.16.0** · **Budget** +40 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK8-01 Vollständig:** 64 Klänge, je Bank 8, jeder mit Name, Rolle, Bank, Platz und ⓘ. Jeder lädt über die Taste und über die Bibliothek, ein Undo.
- [ ] **MK8-02 Namen:**
  - Die E9-Prüfliste (A.13 der Spec) besteht.
  - Kein Name ist gleich oder ähnlich einem Werksnamen der Programmlisten HB-MK (PDF 77) und HB-MS (S. 68–70). Ähnlich heißt: Levenshtein ≤ 2, ohne Groß- und Kleinschreibung, Ziffern und Leerzeichen.
  - Die Listen liegen nur im Testskript.
  - Kein Markenwort (B.6 Nr. 9).
- [ ] **MK8-03 Herkunft:** CHANGES vermerkt je Klang „eigenes Rezept“. Kein Werksklang ist mit einem Import-Testdump identisch (Prüfskript).
- [ ] **MK8-04 Pegel:**
  - Prüfphrase je Rolle: Bass 8 Achtel C2, Lead C4–C5, Fläche 4 Takte Akkord, Arp/Seq Akkord mit Arp an, Vocoder gehaltene Akkorde.
  - Ergebnis −18 ± 3 LUFS, True Peak ≤ −1 dBTP.
  - Bässe: M-HANDYrel bei C2 ≥ −20 dB (wie V10P-07).
  - Wer eine Grenze verfehlt, wird nachgestimmt, nicht die Grenze.
- [ ] **MK8-05 Merkmale** (Prüfskript zählt):
  - ≥ 8 Klänge mit Arp an (Bänke 1, 2, 3, 6 zusammen).
  - ≥ 4 mit Mod-Seq.
  - Alle 8 Vocoder-Klänge mit `hold`.
  - ≥ 6 mit Speicherwellen (zeigen „≈“).
  - ≥ 4 mit Dual oder Split.
  - ≥ 4 mit Delay-Sync.
- [ ] **MK8-06 Keine Doppel:** Innerhalb jeder Bank unterscheiden sich alle Paare um ≥ 3 dB in mindestens einem relevanten M-BAND.
- [ ] **MK8-07 Bibliothek:** Der Filter „AM“ + Bank n liefert genau die 8 Klänge. N0b-01 bleibt erfüllt. ▶ Vorhören funktioniert.
- [ ] **MK8-08 Größe und Zeit:** Die Werksdaten im Block sind ≤ 24 KB. Alle 64 entpacken in ≤ 20 ms (Xeon). Ein Tipp lädt in ≤ 50 ms ohne `longtask`. Die Startzeit ohne AM bleibt unverändert.
- [ ] **MK8-09 Oberfläche:** Programmzeile und Bank-Liste: M-PLATZ in P1–P3, L1, L2, W.
- [ ] **MK8-10 Regression und DoD**, Budget ≤ +40 KB.

**Tests.** `mk8-daten.mjs` (Namen, Herkunft, Merkmale), `mk8-pegel.mjs`, `mk8-ui.mjs`.

**Fach-Prüfung:** **FP-KLANG ●** Haupt-, **FP-TOUCH** Zweit-Blick.

**Zwischenstand** nach MK8 (EN3-17).

**iPhone:** Jede Bank einmal durchtippen, einmal über den Lautsprecher, einmal mit Kopfhörer. Ausreißer melden (zu leise, zu laut, langweilig).

**Geräte-Abgleich:** Xander sagt je Bank, ob die Klangwelt zur Bank seines microKORG passt. Das ist ein Urteil über das Genre, kein Kopie-Vergleich.

**Risiken.** Nichts ist angehört. 64 Klänge sind viel Klangarbeit, deshalb zwei Bau-Abschnitte.

---
### MK9 — Import eigener .syx/.prg-Dateien (nur lokal)

**Ziel.** Xander holt seine eigenen microKORG- und MS2000-Programme in die App. Sie bleiben auf seinem Gerät und gehen nie ins Netz.

**Tor MK9-T** (vor dem ersten Bau-Schritt in CHANGES protokolliert). Es gilt eines von beiden:
- (a) Am Bau-Ort liegt ein Formatbeleg für die Programmdaten von MS2000 und microKORG. Das ist das Korg-Dokument „MIDI Implementation“ mit der Program-Data-Tabelle und der 7-Bit-Paketierung. Es ist nicht Teil der Handbücher (HB-MS S. 64).
- (b) Xander liefert **drei Test-Dumps** mit notierten Werten nach dem Blatt in Teil D.7. Dann wird die Zuordnung daran erarbeitet und geprüft. (b) reicht nur für die Felder, die die Test-Dumps abdecken. Die übrigen Felder bleiben bis (a) auf INIT, mit Hinweis.

Ohne Tor wird das Paket nicht gebaut. MK10–MK13 laufen dann weiter (E.5 Nr. 3).

**Umfang.**
1. **Datei-Wahl** über den vorhandenen .syx-Weg (Menü → Sounds → [Programme importieren (.syx/.prg)], ohne `accept`-Attribut wegen iOS, wie Z. 26513).
2. **Erkennen:** Gerät (MS2000/microKORG), Einzelprogramm oder Bank, .prg. Entschlüsseln laut Formatbeleg. Jedes Feld wird auf `p.mk` abgebildet, über eine Zuordnungstabelle im Code mit Seitenangabe des Belegs in einem Kommentar ohne Markennamen.
3. **microKORG-Besonderheiten** (A.11):
   - Layer → Dual. Die Stimmen-Teilung folgt der Zuweisung beider Timbres (HB-MK S. 16, Tabelle).
   - 8 Vocoder-Kanäle → 16 Bänder (Pegel und Pan doppelt).
   - Eingangs-Balance gedreht.
   - Step-Arp übernommen. Kein Mod-Seq (aus).
4. **Vorschau-Liste:** Namen nur als Text (`textContent`), Mehrfachauswahl. [Übernehmen] → Bibliothek „Eigene“ mit 🔒 (`loc: 1`, `origin: 'imp-…'`). Ein Undo je Übernahme.
5. **Nur lokal** (EN3-08):
   - `mkLocalStrip(project | sound[])` ersetzt jeden 🔒-Sound durch den Platzhalter `{engine: 'mk', p: INIT, locRef: <soundHash>, name}`.
   - Die Funktion läuft in **jedem** Upload-Weg: Server-Autosave, `save_library`, Paar-Raum und Realtime, Mitmach-Link und `#import`, Teilen, später VO3.
   - Das eigene Gerät stellt 🔒-Sounds per `locRef` aus der lokalen Bibliothek wieder her. Andere Geräte und Konten spielen INIT mit dem Hinweis „Klang nur auf dem Gerät, auf dem er importiert wurde“.
   - Export als Projektdatei auf das eigene Gerät ist erlaubt.
6. **Kennzeichnung:** 🔒 in Bibliothek, Blattkopf und Spur. ⓘ „Importiert – bleibt auf diesem Gerät“.
7. **Testdaten:** nur aus einem eigenen Test-Schreiber (synthetische Dumps). Im Repo liegt keine .syx/.prg-Datei von Korg. Xanders Dateien bleiben bei ihm.

**Nicht-Umfang.** Export zum Gerät (.syx schreiben). Werksbänke einlesen und in die App aufnehmen (verboten, EN3-07). MIDI-Übertragung.

**Daten.** Sound-Felder `loc` und `locRef` (neutral). Kein Formatsprung.

**Berührungspunkte.**
- **Wiederverwendet:** `importSyx`-Dateiweg, Bibliothek, `normalizeSound`, SYNC-Postausgang (Strip davor), Fake-Supabase-Testgerüst (`online.md` §7.7).
- **Neu:** Parser, Zuordnung, Strip-Funktion, Wiederherstellung über `locRef`.

**Dauer** 5–6 h · **Version 4.17.0** · **Budget** +25 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK9-01 Tor:** Das Protokoll MK9-T steht in CHANGES (Beleg mit Datum oder die 3 Dumps mit Werteblatt).
- [ ] **MK9-02 Rundweg:** Der Test-Schreiber erzeugt Dumps aus 200 Zufalls-`p.mk` (im Rahmen der Beleg-Felder). Der Import liefert sie deep-equal zurück.
- [ ] **MK9-03 Xanders Dumps:** Jedes notierte Feld der 3 Test-Programme stimmt. Das Protokoll steht in CHANGES.
- [ ] **MK9-04 Robust:**
  - 10 000 Zufallsdateien und abgeschnittene Dumps lösen keine Ausnahme aus und ergeben eine klare deutsche Meldung.
  - Dateien > 2 MB werden abgelehnt.
  - Namen erscheinen nur als Text, `innerHTML` wird nicht benutzt.
- [ ] **MK9-05 microKORG-Zuordnung:** Layer, 8 → 16 Kanäle, Balance und Step-Arp laut Umfang 3. Ein Prüf-Dump je Fall.
- [ ] **MK9-06 Nie hochladen:**
  - Lauf mit Fake-Supabase: Projekt mit 🔒-Sound speichern, Bibliothek abgleichen, Paar-Raum öffnen, Mitmach-Link erzeugen.
  - Kein Request-Körper und kein gesendeter WebSocket-Frame enthält das Marker-Muster des 🔒-Sounds (seltene Feldwerte und Name). Die Platzhalter sind da.
  - Während des Imports gibt es 0 Netzaufrufe.
- [ ] **MK9-07 Wiederherstellen:**
  - Gleiches Gerät, Projekt aus der Cloud: Der 🔒-Sound ist deep-equal da.
  - Anderes Konto oder Gerät (Test-Profil): INIT mit Hinweis, keine Fehlermeldung, keine Konsolenfehler.
- [ ] **MK9-08 Kennzeichnung:** 🔒 und ⓘ an allen drei Orten.
- [ ] **MK9-09 Oberfläche:** Import-Blatt mit M-PLATZ in P1–P3, L1, L2, W. Listen-Zeilen ≥ 44 px.
- [ ] **MK9-10 Regression:** Der DX7-.syx-Import ist unverändert (V4c-Abnahmen). Budget ≤ +25 KB.

**Tests.** `mk9-parse.mjs`, `mk9-fuzz.mjs`, `mk9-lokal.mjs` (Fake-Supabase, WebSocket-Mitschnitt), `mk9-ui.mjs`.

**Fach-Prüfung:** **FP-SICHER ●** Haupt-, **FP-DSP** Zweit-Blick.

**iPhone:** eine eigene .syx- oder .prg-Datei aus „Dateien“ wählen, zwei Programme übernehmen und spielen. In einem zweiten Browser bzw. Konto prüfen: der Hinweis statt des Klangs.

**Geräte-Abgleich:** Ein importiertes Programm in der App gegen dasselbe am Gerät. Die Abweichungen sagen, welche W-Kurven nachzustellen sind (EN3-16).

**Risiken.** Ohne Beleg (a) ist die Zuordnung nur so gut wie die Test-Dumps. Die .prg-Form ist [U].

---

### MK10 — Speicherwellen aus Xanders Aufnahmen

**Ziel.** Die 64 Platzhalter werden durch Wellen ersetzt, die aus Xanders eigenen microKORG-Aufnahmen gewonnen sind. Damit klingt die Klangerzeugung „original“ (KF §3–4).

**Tor MK10-T:** Die Aufnahmen nach Teil D liegen vor (Prüfliste D.4 erfüllt). Die Antwort auf H-2 liegt vor (Vorgabe: lokal).

**Umfang (Vorgabe „lokal“).**
1. **Blatt „Wellen einlesen“** (Menü → Sounds): mehrere WAV-Dateien wählen (`ref-saege.wav`, `sw-01.wav` … `sw-64.wav`, `stille.wav`), Fortschritt anzeigen, [Abbrechen].
2. **Analyse im Browser**, in Häppchen ≤ 8 ms bzw. im Worker, wenn vorhanden:
   - Einsatz-Erkennung je Ton. Die Tonhöhe wird gemessen, nicht angenommen.
   - Stabilen Abschnitt wählen (0,5–1,5 s nach dem Einsatz).
   - Periodensynchrone Mittelung über ≥ 0,5 s ergibt eine Periode.
   - DFT ergibt die Teiltöne 1…N (N = min(64, Nyquist/f₀)), Pegel und Phase.
   - **Korrektur** mit der Bezugs-Säge: H(f) = gemessene Säge / ideale 1/n, über Frequenz geglättet. Alle Wellen werden durch H geteilt.
   - **Pegel-Eichung:** Der RMS der Bezugs-Säge entspricht der AM-Säge bei Mixer 127.
   - Eine Tabelle je aufgenommener Oktave (C1…C7) als Oktav-Tabellen (B.6 Nr. 6). Fehlt eine Oktave, gilt die Nachbaroktave, mit Hinweis.
3. **Speicher:** IndexedDB-Store `mkwaves` (nie im Upload, nie in Projekt, Sound oder Bibliothek). Die Engine nimmt eingelesene Wellen statt der Platzhalter. Das „≈“ verschwindet nur für diese Wellen. [Platzhalter benutzen] schaltet zurück.
4. **Bericht** je Welle: Güte (Stabilität der Periode, Klirr der Mittelung, Clipping, Rauschabstand gegen `stille.wav`).

**Variante „eingebaut“ (nur wenn H-2 = ja).** Dieselbe Analyse läuft offline (Node) beim Bau. Das Ergebnis ist ein kompakter Datenblock (Teiltonpegel als Bytes je Oktave, Phasen als 6 Bit) in der App, ≤ 45 KB. Das Blatt „Wellen einlesen“ entfällt. Die Rohdateien kommen nicht ins Repo.

**Nicht-Umfang.** Aufnahmen anderer Gerätewellen. Eich-Kurven für Filter und Hüllkurven (nur bei H-6 = ja, dann +2 h; Kurven nach D.6).

**Berührungspunkte.**
- **Wiederverwendet:** Oktav-Tabellen und Mipmaps (MK2), Datei-Wahl, IndexedDB (VS3-Muster `persist()`), Fake-Supabase-Prüfung (MK9).
- **Neu:** WAV-Lesen (PCM 16/24 Bit, 44,1/48 kHz, mono/stereo), Analyse, Store.

**Dauer** 5–6 h · **Version 4.18.0** · **Budget** +20 KB (Variante eingebaut: +65 KB) · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK10-01 Tor:** Dateiliste und Prüfsummen (lokal) in CHANGES. Keine Aufnahme-Datei im Repo.
- [ ] **MK10-02 Nachbau:** Für jede eingelesene Welle und jede aufgenommene Oktave wird die Neu-Synthese (Speicherwelle, Filter offen) mit der Aufnahme verglichen:
  - M-BAND-Abstand ≤ 1,5 dB je relevantem Band.
  - Teiltöne 1–16 ≤ 2 dB, Median ≤ 1 dB.
- [ ] **MK10-03 Bezug:** Die Säge-Aufnahme liegt nach der Korrektur bei 1/n ± 0,5 dB (Teiltöne 1–20).
- [ ] **MK10-04 Zwischen den Oktaven:** Eine Tonleiter C2–C6 hat keinen Pegelsprung > 1,5 dB (M-PEGEL) und keinen M-SP-Sprung > ⅙ Okt.
- [ ] **MK10-05 Endlos:** Welle 35 erfüllt MK2-04 auch mit den Aufnahmen.
- [ ] **MK10-06 Lokal:** Beim Einlesen gibt es 0 Netzaufrufe. Die Tabellen fehlen in jedem Upload (Fake-Supabase wie MK9-06). Ein anderes Gerät hört Platzhalter mit „≈“.
- [ ] **MK10-07 Analyse-Zeit:** 66 Dateien à ≈ 25 s in ≤ 60 s (Xeon), keine `longtask` > 50 ms, Fortschritt sichtbar, abbrechbar ohne halbe Daten (atomar je Welle).
- [ ] **MK10-08 Fehlerpfade:**
  - 44,1 kHz wird umgerechnet. Bei Stereo wird L genutzt.
  - Clipping wird erkannt („bitte neu aufnehmen“).
  - Eine fehlende Oktave nimmt den Nachbarn, mit Hinweis.
  - Falscher Dateiname: Die Zuordnung ist von Hand wählbar.
- [ ] **MK10-09 Oberfläche und Budget:** M-PLATZ des Blatts in P1–P3, L1, L2, W. Budget ≤ +20 KB (bzw. +65 KB).

**Tests.** `mk10-analyse.mjs` (mit synthetischen „Aufnahmen“ aus bekannten Wellen, eigenem Filter-Abfall und Rauschen), `mk10-lokal.mjs`, `mk10-ui.mjs`.

**Fach-Prüfung:** **FP-DSP** Haupt-, **FP-SICHER** Zweit-Blick (lokal).

**Zwischenstand** nach MK10 (EN3-17).

**iPhone:** Wellen einlesen (Dateien aus „Dateien“ oder iCloud), dann OSZ 1 → Speicherwelle und mit dem Gerät vergleichen.

**Risiken.** Die Lizenzfrage ist offen (H-2). Ob sich die DWGS-Wellen je Oktave ändern, ist [U], deshalb mehrere Oktaven. Raumgeräusche fallen weg, weil Line-Aufnahme Pflicht ist.

---

### MK11 — RADIAS-Teil 1: zweites Filter und Verzerrer

**Ziel.** Ein zweites Filter je Timbre, seriell, parallel oder individuell verschaltbar (KF [B] „2 Filter, die man verschalten kann“), dazu ein Verzerrer vor dem Filter. Kein 1:1-RADIAS.

**Umfang.**
1. **Filter 2** `f2` je Timbre:
   - TYP: aus, 24LPF, 12LPF, 12BPF, 12HPF. CUTOFF, RESONANZ, HK-INT (Quelle EG1; ab MK12 wählbar EG3), KEYTRACK, ANSCHLAG (W-01 … W-05).
   - Der Kammfilter des RADIAS ist nicht im Plan.
2. **ROUTING** `fr`:
   - 0 einzeln (wie MS2000)
   - 1 seriell (F1 → F2)
   - 2 parallel (Mixer → F1 und F2, Balance `fbal` 0…127)
   - 3 individuell (OSZ 1 → F1, OSZ 2 + Rauschen → F2) [eK]
3. **Verzerrer** `drv` {TYP aus │ weich │ hart │ Falter, STÄRKE 0…127} zwischen Mixer und Filter 1 [W] (W-45, 2× Überabtastung). Die MS2000-Verzerrung im AMP bleibt.
4. **Neue Patch-Ziele** „Cutoff 2“ (d 8) und „Verzerrer“ (d 9). Die neuen Regler sind Seq-Ziele (MK-R1).
5. **Sektionen** FILTER 2 und DRIVE (EDIT 1, Reihe 2, Plätze 6 und 7).
6. **Leistungs-Probe:** Fall „+Filter 2/Drive“.

**Nicht-Umfang.** Kammfilter, Filter-Morph, 11 Verzerrer-Typen (RADIAS), Effekt-Typen des RADIAS.

**Daten.** `t[].f2`, `t[].fr`, `t[].fbal`, `t[].drv` (neutral: TYP aus, `fr` 0).

**Berührungspunkte.** Ladder-Kern (zweite Instanz je Stimme), Patch- und Seq-Ziellisten.

**Dauer** 6–7 h · **Version 4.19.0** · **Budget** +25 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK11-01 Aus = bitgleich:** TYP aus und `drv` aus sind bitgleich zu 4.18.0.
- [ ] **MK11-02 Filter 2 allein:** Steilheiten wie MK1-11.
- [ ] **MK11-03 Seriell:** F1 24LPF 1 kHz + F2 12HPF 200 Hz ergibt einen Bandpass mit −3-dB-Punkten bei 200 Hz und 1 kHz ± 10 %.
- [ ] **MK11-04 Parallel:** Die Summe gleicht den Einzel-Renders (max |Δ| ≤ 1e-4). Balance 0/127 ergibt nur F1 bzw. nur F2 (≥ 40 dB).
- [ ] **MK11-05 Individuell:** OSZ 1 läuft nur durch F1 (F2 zu → OSZ 1 bleibt ± 0,5 dB), OSZ 2 nur durch F2.
- [ ] **MK11-06 Verzerrer:**
  - Weich bei STÄRKE 64 (Dreieck C3): 3. Teilton ≥ −30 dB.
  - Hart: die Klemmgrenze nach W-45.
  - Falter: M-SP steigt über die STÄRKE monoton (H-3).
  - Pegel ± 2 dB gegen aus.
  - Hart C5: gefaltete Energie ≤ −40 dB.
- [ ] **MK11-07 Ziele:** Patch → Cutoff 2 und → Verzerrer wirken nach W-18. Seq → FILTER-2-Cutoff wirkt.
- [ ] **MK11-08 Umschalten:** ROUTING und TYP bei klingender Note bestehen M-KLICK und M-EINBRUCH.
- [ ] **MK11-09 CPU:** Filter 2 an kostet ≤ +40 % je Stimme, Verzerrer ≤ +10 % (Node-Offline). Die Leistungs-Probe läuft mit dem neuen Fall.
- [ ] **MK11-10 Oberfläche:** M-PLATZ in P1–P3, L1, L2, W. Das Raster ist jetzt voll (14), nichts rückt. H-1/H-3. Regression, Budget ≤ +25 KB.

**Tests.** `mk11-filter2.mjs`, `mk11-drive.mjs`, `mk11-ui.mjs`.

**Fach-Prüfung:** **FP-DSP** Haupt-, **FP-IPHONE** Zweit-Blick.

**iPhone:** FILTER 2 seriell als Hochpass hinter einer Säge, DRIVE „Falter“ langsam aufdrehen.

**Geräte-Abgleich:** entfällt (kein RADIAS vorhanden).

**Risiken.** Die doppelte Filterlast trifft das iPhone. Der Begrenzer bekommt keine neue Stufe. Liegt die Probe über der Grenze, gilt B.4 (CHANGES).

---

### MK12 — RADIAS-Teil 2: dritte Hüllkurve und Formant-Oszillator

**Ziel.** Eine frei verwendbare dritte Hüllkurve und ein Vokal-Oszillator, bei dem man die Mundform regelt (KF [B]).

**Umfang.**
1. **EG3** `e3` je Timbre (ADSR + NEUSTART, W-06). Patch-Quelle „EG 3“ (s 8), Seq-Ziele (MK-R1). Als Hüllkurve für Filter 2 wählbar (`f2.egs` 1 │ 3). Sektion HK 3 in EDIT 2.
2. **Formant-Oszillator** (OSZ 1 Welle 8, W-44):
   - Bandbegrenzter Glottis-Puls in die Resonatoren F1–F4 (parallel, Bandbreiten 80/90/120/150 Hz).
   - STEUER 1 = Vokal-Morph a → e → i → o → u, stetig, Frequenzen logarithmisch interpoliert. STEUER 2 = LFO1-Tiefe.
   - Er ist auch Vocoder-Träger.
   - Das LCD zeigt den nächsten Vokal: „FORMANT · VOKAL e→i 72“.

**Nicht-Umfang.** Formant-Bewegung aufnehmen, mehr Patches (RADIAS hat 6), weitere Vokale oder Sprachen.

**Daten.** `t[].e3`, `o1.w` 8, `f2.egs`.

**Berührungspunkte.** Hüllkurven-Kern, Patch-Quellen, Oktav-Tabellen (nicht nötig: die Resonatoren arbeiten in Hz).

**Dauer** 6–7 h · **Version 4.20.0** · **Budget** +25 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK12-01 Neutral:** EG3 ohne Route und ohne Wahl als Filter-2-Hüllkurve ist bitgleich zu 4.19.0.
- [ ] **MK12-02 EG3:** Die Zeiten nach W-06 ± 10 %. Als Patch-Quelle wirkt sie nach W-18. Filter 2 folgt EG3 bei `egs` 3.
- [ ] **MK12-03 Vokale:** Für C2 und C3 und alle 5 Vokale liegen die Spitzen der Spektralhülle bei F1/F2 der Tabelle ± 7 %, F3 ± 10 %.
- [ ] **MK12-04 Morph:** Ein Zug über STEUER 1 in 1 s besteht M-KLICK. Der F2-Verlauf ist stetig (kein Sprung > 5 % je Block).
- [ ] **MK12-05 Alias:** C6 hat gefaltete Energie ≤ −50 dB.
- [ ] **MK12-06 Träger:** Der Formant-Oszillator als Vocoder-Träger besteht MK7-08.
- [ ] **MK12-07 CPU:** Formant ≤ 1,5 × Säge. EG3 ≤ +2 % (Node-Offline).
- [ ] **MK12-08 Oberfläche:** HK 3 in EDIT 2. M-PLATZ in P1–P3, L1, L2, W. H-1/H-3. Regression, Budget ≤ +25 KB.

**Tests.** `mk12-eg3.mjs`, `mk12-formant.mjs`, `mk12-ui.mjs`.

**Fach-Prüfung:** **FP-DSP** Haupt-, **FP-KLANG** Zweit-Blick.

**iPhone:** OSZ 1 → Formant, STEUER 1 langsam von 0 nach 127 („a-e-i-o-u“). PATCH: EG 3 → OSZ1-Steuer.

**Risiken.** Die Vokal-Tabelle stammt aus der Sprachforschung, nicht vom RADIAS.

---

### MK13 — RADIAS-Teil 3: mehr Stimmen

**Ziel.** Bis zu 8 Stimmen je AM-Spur, wo das iPhone es trägt (KF [B]: RADIAS 24 statt 4 Stimmen; hier begrenzt durch Plan Punkt 5).

**Umfang.**
1. **STIMMEN-ZAHL** `vmax` 4 │ 8 in PROG (Vorgabe 4 = MS2000).
2. Bei 8 ist die Timbre-Teilung 2+6 │ 4+4 │ 6+2. Unison bei 8 nach W-15. Der Vocoder ist bei 8 erlaubt.
3. **Begrenzer** (B.4): Stufe 1 setzt `vmax` 8 → 4 für neue Noten.
4. **Kopf-Anzeige** (L9): „8 St“ bzw. „4 St (Begrenzer)“.
5. **Leistungs-Probe:** Fall „8 Stimmen“ (4 Spuren × 8).

**Nicht-Umfang.** Mehr als 2 Timbres (RADIAS 4), mehr als 8 Stimmen.

**Daten.** `vmax`.

**Berührungspunkte.** `POOL` bleibt 12 (8 Stimmen + 4 Stehl-Blenden). Begrenzer.

**Dauer** 3–4 h · **Version 4.21.0** · **Budget** +10 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK13-01 Stimmen:** 8 Tasten ergeben 8 Stimmen, die 9. stiehlt (M-KLICK). `vmax` 4 ist bitgleich zu 4.20.0.
- [ ] **MK13-02 Teilung:** 2+6, 4+4 und 6+2 verhalten sich wie MK3-02 sinngemäß.
- [ ] **MK13-03 CPU:** 8 Stimmen ≤ 2,1 × 4 Stimmen (Node-Offline).
- [ ] **MK13-04 Begrenzer:** Bei simulierter Last > 0,45 bekommen neue Noten höchstens 4 Stimmen. Gespeichertes bleibt deep-equal (I-08). Die Anzeige erscheint.
- [ ] **MK13-05 iPhone-Grenze:** Xanders Probe „8 Stimmen“ steht in CHANGES. Liegt `load_med` > 0,6, gilt ab dann: `vmax` 8 klingt nur auf höchstens 2 AM-Spuren gleichzeitig, weitere fallen auf 4 (Regel und Wert in CHANGES).
- [ ] **MK13-06 Oberfläche:** PROG mit STIMMEN-ZAHL, M-PLATZ in P1–P3, L1, L2, W. Regression, Budget ≤ +10 KB.

**Tests.** `mk13-voices.mjs`, `mk13-limit.mjs`.

**Fach-Prüfung:** **FP-IPHONE ●** Haupt-, **FP-DSP** Zweit-Blick.

**Zwischenstand** nach MK13 (EN3-17).

**iPhone:** Leistungs-Probe „8 Stimmen“ schicken. Eine Fläche mit 8 Stimmen und vollen Akkorden spielen.

**Risiken.** Ob das iPhone 4 × 8 Stimmen trägt, ist offen. Die Regel MK13-05 fängt das ab.

---

## Teil D — Aufnahme-Anleitung für die Speicherwellen (für MK10; an Xander weitergeben)

**Wozu:** Die App bildet die 64 gespeicherten Wellen deines microKORG bisher nur nach. Mit diesen Aufnahmen rechnet sie die echten Wellen aus. Die Dateien bleiben bei dir. Die App liest sie auf deinem Gerät ein, nichts wird hochgeladen (Vorgabe H-2).

**D.1 Was du brauchst (≈ 75 min)**
- microKORG mit Netzteil
- Audio-Interface oder Recorder mit Line-Eingang, eingestellt auf **48 kHz, 24 Bit, mono**
- Kabel vom Ausgang **L/MONO** in den Line-Eingang (kein Mikrofon!)
- Kopfhörer zum Mithören

**D.2 Gerät einmal vorbereiten**
1. **GLOBAL** (HB-MK S. 47):
   - MASTER TUNE 440,0 (Anzeige „40.0“)
   - MASTER TRANSPOSE 0
   - VELOCITY CURVE auf den festen Wert **100**
2. Wähle ein Synth-Programm, das du überschreiben darfst. Stelle es so ein (EDIT SELECT 1/2, Regler 1–5):
   - **VOICE:** SYNTH, SINGLE, VOICE ASSIGN Poly, TRIGGER Multi.
   - **PITCH:** TRANSPOSE 0, TUNE 0, PORTAMENTO 0, VIBRATO INT 0.
   - **OSC1:** WAVE DWGS, CONTROL 2 = 1.
   - **MIXER:** OSC 1 LEVEL 127, OSC 2 LEVEL 0, NOISE LEVEL 0.
   - **FILTER:** TYPE −24 dB LPF, CUTOFF 127, RESONANCE 0, FILTER EG INT 0, KEY TRACK 0.
   - **AMP:** LEVEL 100, PANPOT Mitte, DISTORTION OFF, KBD TRACK 0.
   - **AMP EG:** ATTACK 0, DECAY 0, SUSTAIN 127, RELEASE 10, EG RESET ON.
   - **PATCH 1–4:** MOD INT jeweils 0.
   - **MOD FX:** EFFECT DEPTH 0. **DELAY:** DELAY DEPTH 0. **EQ:** LOW EQ GAIN 0, HI EQ GAIN 0.
   - **Arpeggiator** aus, **MOD-Rad** ganz zu, **PITCH-Rad** in der Mitte.
3. Mit **WRITE** auf diesen Platz speichern. Dann geht nichts verloren, wenn du versehentlich umschaltest.
4. **Pegel:** C4 halten und den Eingang so stellen, dass die Spitze bei −12 bis −6 dBFS liegt. Danach nichts mehr am Pegel und an AMP LEVEL ändern. Der Pegel muss für alle Dateien gleich bleiben. Übersteuert eine Welle trotzdem, senke AMP LEVEL einmal für alles und fange neu an.

**D.3 Aufnehmen** (je Datei: die sieben C über das ganze Gerät, jedes **2 s halten, 1 s Pause**; mit OCTAVE SHIFT ganz unten anfangen und nach oben gehen, bis du C1 … C7 hast; die App misst die Tonhöhe selbst):
1. `ref-saege.wav`: OSC1 WAVE **Saw**, CONTROL 1 = 0, CONTROL 2 = 0. Das ist der Bezug.
2. `sw-01.wav` … `sw-64.wav`: OSC1 WAVE **DWGS**, CONTROL 2 = Nummer der Welle (1 … 64).
3. `stille.wav`: 10 s, ohne eine Taste zu drücken. Das ist das Grundrauschen.

**D.4 Prüfen, bevor du fertig bist**
- 66 Dateien, Namen genau wie oben.
- Keine Datei übersteuert (Spitze unter −1 dBFS).
- In jeder Datei sind 7 Töne.

**D.5 Abgeben**
- Vorgabe: Die Dateien bleiben auf deinem iPhone, deinem Mac oder in iCloud. Ab MK10: Menü → Sounds → **Wellen einlesen** → alle 66 wählen.
- Nur wenn du bei H-2 „einbauen“ sagst: Gib die Dateien dem Bau-Lauf direkt. Sie kommen nicht ins Repo.

**D.6 Nur wenn H-6 = ja: Eich-Aufnahmen (+ ≈ 15 min)** mit derselben Einstellung, OSC1 Saw:
- `eich-cutoff.wav`: C3 halten, CUTOFF 0, 16, 32, … 127, je 1 s (RESONANCE 0).
- `eich-attack.wav`: AMP EG ATTACK 32, 64, 96, je ein Ton mit 4 s Pause.
- `eich-release.wav`: RELEASE 32, 64, 96 (SUSTAIN 127), je ein Ton, 1 s halten, 6 s Pause.
- `eich-lfo.wav`: PATCH 1 LFO 1 → Pitch, MOD INT 20, LFO 1 FREQUENCY 32, 64, 96, je 4 s.

**D.7 Für MK9 (Tor b): drei Test-Programme**
1. Lege drei Programme an, die sich in möglichst vielen Werten unterscheiden (Werte frei wählen).
2. Schreibe je Programm diese Werte auf: alle Regler von VOICE, PITCH, OSC1, OSC2, MIXER, FILTER, FILTER EG, AMP, AMP EG, LFO1, LFO2, PATCH 1–4, MOD FX, DELAY, EQ, ARPEG A, ARPEG B. Bei einem Vocoder-Programm zusätzlich AUDIO IN, FILTER, FC MOD, CH LEVEL und CH PAN.
3. Sende die Programme als Dump (.syx) bzw. speichere sie mit dem Editor (.prg), und gib die Dateien mit dem Werteblatt ab.

---
## Teil E — Reihenfolge, Versionen, Budgets, Größe

### E.1 Pakete (verbindlich; ergänzt N2 Teil E und den „Nachtrag zur Reihenfolge“)

Lage: Die MK-Gruppe beginnt direkt nach G-P2 (V2d′ ✓ 4.6.0, V2e 4.7.0, V2e′ 4.8.0, VS3). VS3 wartet auf das Tor N7V-12, das noch nicht erreicht ist (`fragen-xander-9.md`). Darum beginnt MK1 nach V2e′ mit **4.9.0**.

| Paket | Titel | Version | KB | h | braucht | Format | Tor | Untergruppe / Zwischenstand |
|---|---|---|---|---|---|---|---|---|
| MK1 | Klangkern T1, SPIEL/EDIT 1, Leistungs-Probe | 4.9.0 | +95 | 11–13 | V2e′ (Reihenfolge), V4a (SXF) | **4 → 5** | Rollout `max_format` 5 (Xanders Okay) | G-MK1 · Stand |
| MK2 | Alle Oszillator-Arten, PATCH 1–4 | 4.10.0 | +35 | 6–7 | MK1 | 5 | – | G-MK1 |
| MK3 | Zwei Timbres, Split, Stimmung | 4.11.0 | +30 | 6–7 | MK2 | 5 | – | G-MK1 |
| MK4 | Mod-FX, Delay, EQ | 4.12.0 | +25 | 5–6 | MK1 | 5 | – | G-MK1 · **Stand** |
| MK5 | Step-Arpeggiator | 4.13.0 | +30 | 6–7 | MK3 | 5 | – | G-MK2 |
| MK6 | Mod-Sequenzer 3×16 | 4.14.0 | +35 | 7–8 | MK2, MK3 | 5 | – | G-MK2 |
| MK7 | Vocoder 16 Bänder, Eingänge | 4.15.0 | +45 | 8–9 | MK2, MK3, MK4, VS1 ✓ | 5 | – | G-MK2 · **Stand (Pages)** |
| MK8 | Werksklänge, 8 Genre-Bänke | 4.16.0 | +40 | 8–9 | MK2–MK7 | 5 | – | G-MK2 · **Stand** |
| MK9 | Import .syx/.prg (lokal) | 4.17.0 | +25 | 5–6 | MK7 | 5 | **MK9-T** | G-MK3 |
| MK10 | Speicherwellen aus Aufnahmen | 4.18.0 | +20 (+65) | 5–6 | MK2 | 5 | **MK10-T**, H-2 | G-MK3 · **Stand** |
| MK11 | RADIAS 1: Filter 2, Verzerrer | 4.19.0 | +25 | 6–7 | MK3, MK6 | 5 | – | G-MK4 |
| MK12 | RADIAS 2: EG3, Formant-Osz. | 4.20.0 | +25 | 6–7 | MK11 | 5 | – | G-MK4 |
| MK13 | RADIAS 3: 8 Stimmen | 4.21.0 | +10 | 3–4 | MK3, MK7 | 5 | – | G-MK4 · **Stand** |
| **Summe** | 13 Pakete | 4.9.0–4.21.0 | **+440** | **82–96** | | einmal | | |

- **Tore** (E.5 Nr. 3 sinngemäß): Ist MK9-T oder MK10-T geschlossen, rücken nur MK9 bzw. MK10. MK11–MK13 laufen weiter. Ein verschobenes Paket bekommt beim späteren Bau die nächste freie Zwischennummer, z. B. 4.21.1, damit die Versionen streng steigen (EN2-14).
- **Fach-Prüfung:** 13 × 1–2 h zusätzlich (EN2-29).
- **Gesamtdauer** ≈ 95–122 h inkl. Fach-Prüfung.

### E.2 Begründung der Reihenfolge

1. Ab MK1 ist etwas hörbar. MK1–MK4 ergeben den kompletten Klang eines MS2000-Timbres mit Effekten, das ist der erste Stand für Xander.
2. MK3 (Timbres) kommt vor Arp, Seq und Vocoder, weil Arp-Ziel, Seq je Timbre und Vocoder-Modus darauf aufsetzen.
3. MK8 (Werksklänge) steht nach allen Bausteinen, damit kein Werksklang eine „Annäherung“ braucht. Gleiches Prinzip wie V10P (N2 EN2-10).
4. Import und Speicherwellen hängen an Toren (Beleg bzw. Aufnahmen) und stehen deshalb hinter dem Kern. Liegt ein Tor früher offen, darf MK9 bzw. MK10 vorgezogen werden (nach MK7 bzw. MK2). Die Versionsnummer folgt dann der Bau-Reihenfolge.
5. Die RADIAS-Teile kommen zuletzt, wie im Plan Punkt 4 („danach“).

### E.3 Größe und Startzeit (EN2-28)

Grundlage: 4.6.0 = 2 473 307 B. Restplan-Budgets aus N2 E.4. MB = 10⁶ B, KB = 1024 B.

| Stand | Größe |
|---|---|
| nach V2e′ (vor MK1) | ≈ 2,57 MB |
| nach MK4 | ≈ 2,76 MB |
| nach MK8 | ≈ 2,91 MB |
| nach MK13 | ≈ 3,02 MB |
| **Planende ohne MK** (alle übrigen Pakete aus N2 E.4) | **≈ 4,98 MB** |
| **Planende mit MK** | **≈ 5,43 MB > 5,0 MB** |

- Die MK-Pakete selbst bleiben weit unter der Grenze. Die Überschreitung entsteht erst in den späten Gruppen von N2 (Bibliothek, Online B), weil die bisherigen Pakete über ihrem Budget lagen. Laut Plan wären nach Gruppe 5 ≈ 2,18 MB erreicht gewesen, tatsächlich sind es heute 2,47 MB.
- **Startzeit:** Projekte ohne AM bleiben bei ≤ +20 ms (EN3-14, MK1-26). Je MK-Paket gilt §15.3 (≤ +150 ms gegen das Vorgänger-Paket, absolut ≤ 1,5 s ohne bzw. ≤ 4 s mit Drosselung ×4).
- **Ab 4,5 MB** nennt jedes Paket Größe und Startzeit (EN2-28). Lösung → **H-1**.

### E.4 Versionsnummern der Pakete danach

Die Pakete nach der MK-Gruppe (V2a′, V2f, VL, V7a, VC2a, VS4 …) bekommen ihre Nummern **nach 4.21.0**, also ab 4.22.0, in Bau-Reihenfolge. Die Tabelle N2 E.4 wird dort vom Orchestrator fortgeschrieben, das ist keine Änderung des Umfangs.

**VS3** (Tor N7V-12):
- Wird VS3 vor MK1 gebaut, bekommt es **4.8.5**.
- Wird es später gebaut, bekommt es die nächste freie Zwischennummer nach dem zuletzt gebauten Paket.

### E.5 Regeln für den Bau (ergänzt N2 E.5)

1. **Bau-Ort** (wie EN2-17): Dieser Nachtrag, HB-MS und HB-MK (privat, nur lesen), KF, `fragen-xander-9.md`. Für MK9 der Beleg bzw. die Test-Dumps, für MK10 die Aufnahmen. Fehlt etwas, wird das Paket nicht begonnen.
2. **Rollout** (N2 G.8): MK1 `max_format` 5. Jedes Paket hebt `max_app`. Alles nur mit Xanders ausdrücklichem Okay je Schritt, nie im Klassenzimmer-Projekt, nie am Webseiten-Repo (EN2-32).
3. **Zwischenstände** nach EN3-17 auf die Artifact-Adresse, die Pages-Seite und den githack-Spiegel (EN2-15).
4. **CHANGES** je Paket: Messwerte der Abnahme, Node- und Chromium-CPU, Größe, Startzeit (ab 4,5 MB Pflicht), Fach-Prüfung, iPhone-Punkte, Geräte-Abgleich (wenn schon da), Lücken.

---

## Teil F — Fach-Prüfung (ergänzt N2 Teil J, J.3; ● = blockierend)

| Gruppe | Paket | Haupt-Blick | Zweit-Blick |
|---|---|---|---|
| G-MK1 | MK1 ● | FP-DSP | FP-TOUCH, FP-IPHONE |
| G-MK1 | MK2 | FP-DSP | FP-KLANG |
| G-MK1 | MK3 ● | FP-DSP | FP-TOUCH |
| G-MK1 | MK4 | FP-DSP | FP-IPHONE |
| G-MK2 | MK5 ● | FP-SONG | FP-TOUCH |
| G-MK2 | MK6 | FP-DSP | FP-SONG |
| G-MK2 | MK7 ● | FP-DSP | FP-IPHONE, FP-SICHER |
| G-MK2 | MK8 ● | FP-KLANG | FP-TOUCH |
| G-MK3 | MK9 ● | FP-SICHER | FP-DSP |
| G-MK3 | MK10 | FP-DSP | FP-SICHER |
| G-MK4 | MK11 | FP-DSP | FP-IPHONE |
| G-MK4 | MK12 | FP-DSP | FP-KLANG |
| G-MK4 | MK13 ● | FP-IPHONE | FP-DSP |

Zusätzlich prüft **FP-DSP in jedem MK-Paket**:
- die W-Tabelle gegen den Code (eine Quelle, keine Schatten-Kurven);
- „Aus = bitgleich“;
- NaN/Inf bei Extremwerten (alle Regler auf Anschlag, Resonanz 127, Rückkopplung 127, 20 s);
- Worklet-ASCII.

**FP-SICHER** prüft in MK1, MK7, MK9 und MK10 das Markenwort-Verbot (B.6 Nr. 9) und die Upload-Wege.

---

## Teil G — Hinweise an andere Pakete (kein neuer Umfang, keine geänderte Abnahme)

1. **VK** (N1 A.10), Punkte 5–6 (Osz.-FM, Ringmod): dürfen den AM-Code (PM-Pfad aus MK2, Ringmodulator aus MK1) mitbenutzen, statt neu zu bauen. Die Abnahmen VK-06, VK-07 bleiben.
2. **VK2** (N2 D.6.4), Punkte 1–2 (Phaser, Flanger als Spur-Effekt): dürfen den Effektkern aus MK4 mitbenutzen. Die Abnahme bleibt.
3. **VI2a** („Arp mit ZUFALL“): Der Arp-Kern aus MK5 ist engine-frei gebaut. VI2a entscheidet, ob es ihn für andere Engines nutzt.
4. **V5d** (MOD-R1): Die AM-Regler gehören dann in `MODT`. Das Abdeckungs-Skript V5d-01 nimmt die AM-Sektionen auf (EN3-18).
5. **V1d** (PAD-R1): AM als Pad-Quelle prüfen (EN3-18).
6. **V6a** (Klangzustände/Morph): AM-Werte werden als Ganzzahlen interpoliert. Listen und Schalter wechseln am Anschlag (KZ3).
7. **VS3**: Version nach E.4. Der Vocoder (MK7) speichert keine Takes. Mit VS3 kann der Modulator später ein Take sein, das ist nicht im Plan.
8. **N2 E.4**: Die Versionen nach MK13 ab 4.22.0 (E.4 oben). Die Größen-Prognose ändert sich nach E.3 → H-1.

---

## Quellen

**Gelesen für diesen Nachtrag (25.10.2026):**
- HB-MS, `scratchpad/manuals/ms2000.txt`:
  - S. 2–4 (Aufbau), S. 16–17 und S. 25–26 (Mod Sequence, Motion Rec, externer Eingang, Vocoder)
  - S. 34–52 (alle Programm-Parameter einschließlich Vocoder und Utility), S. 53–57 (Global)
  - S. 60–66 (NRPN-, CC- und Werte-Tabellen: Gate, Step Length, Sync Note, Resolution, DWGS-Control-2, OSC2 Semitone), S. 68–70 (Programmliste, nur für die Namensprüfung)
- HB-MK, `scratchpad/manuals/microkorg.txt`:
  - S. 8–11 (Programme, Bänke, Performance Edit, Vocoder, Step-Arp), S. 16–30 (Synth-Parameter)
  - S. 31–38 (Vocoder, Tab. 6-1), S. 39–45 (Effekte, Arpeggiator), S. 47 (Global), PDF 77 (Voice Name List, nur für die Namensprüfung)
- KF `/home/user/synquenzer/forschung/r9/korg-familien.md` (vollständig).
- N2: Kopf und N2.0.3 (EN2-01 … EN2-32), A.6, D.5, D.6.4, D.9, E.4, E.5, Teil J, Revisions- und Review-Protokolle, „Nachtrag zur Reihenfolge“ mit Synth-Plan. N1: A.10 (VK), EN-21 (MOD-R1). Spec v3: L1–L10, §0.3/§0.4, §1.3, §15, Anhang C.
- `v3-ideen/fragen-xander-9.md`. `CHANGES-V3.md` (Stand bis V2d′ 4.6.0, VS0, VS1, Größe, Rollout).
- App 4.6.0 (`dirigent-wt/index.html`), gezielt gelesen:
  - Worklet-Kopf, Konstanten, `defaults`, `envCoefs`, `class Voice`, `lfoVal`
  - `normSynthP`, `normalizeSound`, `AN`, `SRC`/`DST`, `CHORUS`, `ENGINES`
  - `buildChain`, `buildTrack`, `syncEngine`, `wkFlat`, `newEngine`, `newSynthTrack`
  - `buildSynthEd`, `sheetFrame`, `fillSynthTab`, `pageOsc`, `PD`
  - `importProject`-Warnungen, `APP_CODE`, `spawnVoice`, `LOOKAHEAD`, `importSyx`, Mikrofon-Worklets
  - Suche nach Markenwörtern (0 Treffer)

**Eigene Rechnungen:** Größen-Prognose E.3 (Python über die Budgets aus N2 E.4 und die Dateigröße 4.6.0). Seitenzuordnung der Handbuch-Texte (Seitenumbrüche im Text gezählt, gedruckte Seite = PDF − 6; Hilfsdateien danach gelöscht).

**Nicht möglich:** RADIAS-Handbuch (Xander: nicht nötig). Korg „MIDI Implementation“ (nicht im Handbuch; Tor MK9-T). Kein Klang angehört, nichts am iPhone gemessen, kein Web-Abruf. Im Supabase-Projekt und auf GitHub wurde nichts gelesen oder geändert.

---

## Teil H — Offene Fragen an Xander (nur echte Entscheidungen; die Vorgabe gilt, bis du antwortest)

- **H-1 Größe.** Mit dem microKORG-Teil wird die App am Ende des ganzen Plans ≈ 5,4 MB groß statt höchstens 5,0 MB. Die MK-Pakete selbst bringen ≈ +0,45 MB, der Rest kommt aus den übrigen Paketen. Zwei Wege:
  - (a) Die Grenze auf 6,0 MB heben. Die Startzeit bleibt der Wächter.
  - (b) Bei 4,5 MB ein „Schlankheits-Paket“ einschieben, das selten Gebrauchtes gepackt mitliefert und erst bei Bedarf entpackt (EN2-28).

  *Vorgabe: (b), sobald 4,5 MB erreicht sind.*
- **H-2 Deine Wellen-Aufnahmen.** Sollen die daraus gerechneten Wellen nur auf deinem Gerät bleiben, oder in die App eingebaut werden, sodass alle (auch Freunde im Paar-Raum) sie hören? Eingebaut wären es Korg-Daten in einer öffentlichen App, die Lizenz ist ungeklärt (wie bei den DX7-Werksklängen, EN2-11). *Vorgabe: nur auf deinem Gerät.*
- **H-3 Wie viele Werksklänge?**
  - 64 (8 je Genre auf Seite A; Seite B = deine eigenen Sounds), oder
  - 128 wie am microKORG (16 je Genre). Das kostet +8–9 h und +20 KB.

  *Vorgabe: 64.*
- **H-4 Name der neuen Klangerzeugung** in der Leiste VA │ FM │ WT │ ?. Er darf nicht nach Korg klingen. *Vorschlag: „AM“ (Analog-Modell).* Oder dein Wunsch.
- **H-5 Bend- und Mod-Rad.** Die App hat keine Räder. Es gibt zwei Möglichkeiten:
  - zwei schmale Rad-Streifen neben der Tastatur (sichtbare Änderung am Spielfeld), oder
  - es bleibt beim Regler MOD-RAD im Feld, und BEND hat keine Wirkung.

  *Vorgabe: Regler, kein Streifen.*
- **H-6 Eich-Aufnahmen (freiwillig).** Bei der Wellen-Aufnahme 15 min zusätzlich Filter-, Hüllkurven- und LFO-Töne aufnehmen (Teil D.6)? Dann richten sich diese Kurven nach deinem Gerät statt nach eigenen Annahmen (+2 h Bau). *Vorgabe: nein, Abgleich nach Gehör.*
- **H-7 Import (für MK9).** Hast du .syx- oder .prg-Dateien deines microKORG? Für den Bau brauchen wir entweder Korgs Formatbeschreibung („MIDI Implementation“, PDF von korg.com) oder drei Test-Programme von dir mit aufgeschriebenen Werten (Teil D.7). Was ist dir lieber? *Vorgabe: die drei Test-Programme.*
- **H-8 Aufnehmen mit Arpeggiator.**
  - ● nimmt die **gedrückten Tasten** auf, und der Arp spielt beim Abspielen neu. Dann lassen sich Arp-Einstellungen später ändern.
  - Oder ● nimmt die **Arp-Noten** fest auf, als einzeln bearbeitbare Noten.

  *Vorgabe: gedrückte Tasten.*

---
