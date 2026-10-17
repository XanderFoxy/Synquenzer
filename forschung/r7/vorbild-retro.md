# R7 – Vorbild-Retro: Retrowave und Synthwave (The Midnight, FM-84, Timecop1983, Gunship, Kavinsky, Carpenter Brut, Perturbator, Mitch Murder, Michael Oakley, Lazerhawk, Com Truise, Le Matos)

**Stand:** 17.10.2026 · Auftrag R7 „vorbild-retro“ · Grundlage: `fragen-xander-7.md` (L1–L3), `fragen-xander-8.md` (V, T), `fragen-xander-9.md` (FM-Hüllkurven, Studio-Setups), Spec v3 §12.8 (`aud`), Nachtrag 1 (E9, N10a, V10d, V10e), `r6/bibliothek-recherche.md` (§1, §7, §11, Tabelle C N31–N42), `r6/n6/rezepte76.json`, `SYNQUENZER-vision.md`, Geschwister `r7/vorbild-helden.md` (§1 Recht, §2 Format), `r7/vorbild-pop.md`, `r7/vorbild-coldwave2.md` (§4 Diktat „Lause Bass“), `r7/vorbild-dark.md` (Namen), `r8/studio-setups.md` (§1.20 The Midnight), `r8/fm-diagnose.md`. App-Stand `synq-snapshots/V0a.html` nur gelesen.

---

## ⚠ Ehrliche Vorbemerkung: In diesem Lauf war keine Web-Recherche möglich

- **WebSearch:** „this turn's web search budget is used up (limit: 200 … shared by every agent)“ – schon bei der **ersten** Suche dieses Auftrags (17.10.2026).
- **WebFetch:** `getaddrinfo ENOTFOUND reverbmachine.com`. **curl:** „CONNECT tunnel failed, response 403“ (Proxy-Status: `connect_rejected` auch für `en.wikipedia.org`).
- **Folge:** Diese Datei enthält **keinen neu abgerufenen Web-Beleg.** Belegt ist nur, was frühere Läufe mit Quelle festgehalten haben (R6, R8). Diese Stellen sind mit „übernommen aus …“ gekennzeichnet und **hier nicht erneut geprüft**. Für 8 der 12 Acts gibt es **gar keinen** Geräte-Beleg.
- **Was trotzdem sicher ist:**
  - Die **DX7-Werksdaten** (ROM1A „E.PIANO 1“, „BASS 1“, „BRASS 1“). Sie stehen lokal in `fmresearch/proto/rom1a.json`, gelesen aus ROM1A.SYX. Das ist Primärdatenmaterial, Status BELEGT (Daten, nicht „Band X nutzte dieses Preset“).
  - Die **Parameter-Namen und -Bereiche** der App (aus `V0a.html` gelesen).
  - Die **Hörproben** sind eigene Kompositionen, per Skript erzeugt und geprüft (`r7/retro-work/aud.mjs` → `aud-report.txt`, `aud-retro.json`). **Nichts ist angehört, nichts gemessen.**
- **Gedächtnis-Angaben:** Wo ich Fakten aus meinem Trainingswissen nenne (z. B. Bürgerliche Namen, Erscheinungsjahre), stehen sie als **UNBELEGT (Gedächtnis, ungeprüft)**. Sie dürfen **nie** in einen ⓘ-Text, bevor eine Quelle sie bestätigt. Die Prüfliste dafür steht in §10.

**Kennzeichen (wie vom Auftrag verlangt)**
- **BELEGT** = Primärquelle (Interview mit dem Musiker, Werksdaten) **oder** zwei unabhängige Quellen sagen dasselbe.
- **WAHRSCHEINLICH** = nur eine Sekundärquelle (Reverb-Machine-Analyse, Wikipedia allein, Händler-Blog, Equipboard), oder nur eine Überschrift.
- **UNBELEGT** = keine Quelle; eigene Einschätzung (eK) oder Gedächtnis. Wird nie als Fakt angezeigt.
- Alles unter „Rezept“, „Warum so“, „Hörprobe“, „Demo“ ist **eigener Entwurf** (Design), kein Quellenfakt.

---

## 0. Kurzfazit

- **29 Hörproben** (je 4 Takte, alle Takte verschieden, 0 direkte Wiederholungen, kurze Fassung ≤ 8 s) für **29 Sounds und Kits**:
  - **11 R6-Rezepte** bekommen ihre Hörprobe (N31–N37, N39–N42), dazu **N38 mit neuem FM-Kern** aus dem echten DX7-Werksklang „E.PIANO 1“.
  - **5 Werks-Sounds** aus V0a bekommen eine Retro-Hörprobe und einen Vorbild-Tag: Juno-Streicher, Gated 84, Sync-Lead, Moroder-Puls, Weite 82.
  - **12 neue Rezepte** (davon 2 Drum-Kits): Abendrot-Poly, Brandungs-Bass, Sternkreuzer-Bass, Raserei-Kit, Mondfinsternis-Fläche, Schulterpolster-Slap (FM6 aus DX7 „BASS 1“), Krimiserie-Brass (FM6 = DX7 „BRASS 1“), Glanzzupf, Leierband-Akkord, Schleich-Funk-Bass, Halbzeit-Kit, Endzeit-Fanfare.
- **Belegt (übernommen, nicht neu geprüft):**
  - **The Midnight:** McEwans Lieblings-Synths auf „Heroes“ (2022): OB-6, Prophet-6, Juno-106, Matrix-6, UDO Super 6. Auf „Syndicate“ (2025): Sub 37, DX7, Serum, OB-X8, UDO Super 6, Zebra 2. Quelle: Interviews (MusicRadar, MusicTech) laut `r8/studio-setups.md`. **Mehr als 1 Mio. Streams: erfüllt** (≈ 812 Mio. insgesamt laut R6).
  - **Carpenter Brut:** „distorted synths, crushing drums“, nach eigener Aussage „keine Gitarren außer ein paar Soli“ (R6, Interviews).
- **Nur WAHRSCHEINLICH:** Kavinsky „Nightcall“ (Vocoder-Strophe, Arp mit Chorus, Juno-Emulation, keine analogen Keyboards) und Timecop1983 (FL Studio, Juno-106, TAL-Juno) – je **eine** Sekundärquelle (Reverb Machine).
- **UNBELEGT:** Geräte, Patches, Tempi und Tonarten von FM-84, Gunship, Perturbator, Mitch Murder, Michael Oakley, Lazerhawk, Com Truise und Le Matos. Popularität > 1 Mio. für alle außer The Midnight **nicht geprüft**. Die Sounds für diese Acts sind **Stil-Entwürfe** nach Genre-Merkmalen (eK) und so gekennzeichnet.
- **9 Korrekturen** an R6 und R8 (§6). Die wichtigsten:
  - N40: R6 las „Synth statt Gitarrensolo“. Die Quelle sagt das Gegenteil: Es **gibt** vereinzelt echte Gitarrensoli.
  - Kavinsky und Timecop1983 hatten in der VORBILD-Tabelle „b“, haben aber nur **eine** Sekundärquelle → WAHRSCHEINLICH.
  - N38 (DX-E-Piano) steht in V10d-08 als Doppelter zum Werk „DX-Tines“. Mit dem echten ROM-Klang „E.PIANO 1“ ist er eigenständig.
- **5 Demo-Baupläne** (§8): Retrowave (V10e-konform, 104 BPM a-Moll), Darksynth, Synthwave-Pop, Downtempo-Synthwave, Retro-Action/TV.

## 1. Was die App heute für Retro-Klänge mitbringt (gelesen in `V0a.html`)

| Baustein | In V0a | Für Retro wichtig, weil … (eK) |
|---|---|---|
| VA (`ANALOG_BASE`, Z. 5644) | 3 Osz. (Säge/Puls/Dreieck/Sinus), Unisono bis 7, Sub, Rauschen, Sync Osz. 2, Filter LP24/LP12/BP/HP, 3 Hüllkurven, 2 LFOs, 8 Mod-Routen inkl. `rnd` | Juno-/OB-/Prophet-Charakter, PWM-Flächen, Sync-Leads |
| Chorus je Spur | `off · I · II · I+II · ENS · BREIT` (Z. 5096) | Juno-Chorus I/II ist **Teil** des Retro-Klangs |
| Echo-Bus | `mono · pp · …`, Teiler `1/16 … 1/8.` | punktiertes Achtel-Echo auf Arps |
| Pumpen | `fx.pump` 0–1, `pumpRel` 1/16 · 1/8 · 1/4 (Z. 5136, 6932) | „Seitenketten“-Atmen der Bässe |
| Spur-Drive | `fx.drive` | Darksynth-Zerre (R6 [g]: der Filter-Drive raut **nicht** auf, nur der Spur-Drive) |
| FM6 | 6 OPs, 32 DX7-Algorithmen; laut R8 **DX7-genau** im Worklet; **Pitch-EG fehlt** (`r8/fm-diagnose.md` §0) | DX-E-Piano, Slap-Bass, Brass der 80er |
| Drum-Synth | TON/RAUSCHEN/METALL/KLICK je Pad, Kit-Bus mit **Gate-Hall 0,15–0,6 s** (`KIT_PD`, Z. 15214) und Raum | Gated Snare, Simmons-Toms |
| Werks-Kit „Gated 84“ | Linn-artige Kick, Gated Snare, Simmons-Toms (Z. 7320) | 80er-Pop-Beat |

**Fehlt für Retro (eK):** Vocoder (Kavinsky-Strophe, Gunship-Stimmen) – jetzt denkbar, weil das Mikrofon geplant ist (`fragen-xander-7.md` P3); Gitarre und echtes Saxofon (nur Annäherung, R6 N32); Tape-Leiern als eigener Effekt (hier über LFO + `rnd` auf Tonhöhe angenähert).

## 2. Rechtliche Linie und Format (Kurzform)

- **Recht:** wie `vorbild-helden.md` §1 (dort die Quellen; kein Rechtsrat). Frei sind Stil, Klangfarbe, Gerätetyp, Spieltechnik (Achtel-Oktav-Bass, Galopp-Bass, 16tel-Arp, Gated Snare), Allerwelts-Akkordfolgen (I–V–vi–IV, i–VI–III–VII) und Allerwelts-Rhythmen. **Nicht** übernommen werden die konkrete Melodie bzw. das Riff eines Titels (§ 23 UrhG „hinreichender Abstand“), Samples und Titel-, Künstler- oder Gerätenamen im Sound-Namen (E9).
- **Regeln für alle 29 Hörproben (selbst angewendet):**
  1. Eigene Melodie, eigene Bassfigur, eigenes Drum-Muster.
  2. Keine Folge von mehr als 4 Tönen mit gleichem Rhythmus wie ein mir bekanntes Riff des Acts (Selbstprüfung; ein automatischer Abgleich geht nicht, weil keine Originalnoten vorliegen).
  3. **Tonart:** Die Original-Tonarten sind hier **alle UNBELEGT**. Deshalb kann „andere Tonart“ nicht geprüft werden. Der Abstand entsteht allein durch eigene Melodie und eigene Akkordfolge.
  4. Erkennbar sein sollen Klang, Lage, Tempo-Gefühl, Rhythmus-Technik und Harmonik, **nicht** der Song.
- **ⓘ-Text:** Vorbild nur im ⓘ und im Filter, nie im Namen; Pflichtsatz „Marken gehören ihren Inhabern, keine Verbindung.“; Formulierung „erinnert an … (Stil)“.
- **Format:** wie `vorbild-helden.md` §2. Notenliste `Ton(MIDI) Start/Länge/Anschlag`, Start und Länge in **16teln ab Takt 1**, Anschlag 1–127. Darunter `aud.notes [b, d, n, v]` in Schlägen (16tel ÷ 4) mit **v = Anschlag/127** (die App rechnet 0–1). **Kurz** = ≤ 8 s (`len` ≤ 4, Spec §12.8), **ganz** = ≤ 16 s (Vorschlag). Auswahl-Regel: Passen alle Takte nicht, gelten die ersten n − 1 Takte plus der letzte, damit die Wendung in Takt 4 hörbar bleibt. Drums: Schritt-Zeilen je Pad (Pad-Namen aus `DrumKits.SLOTS`).
- **Rezept-Schlüssel:** VA = Abweichungen von `ANALOG_BASE`; Routen `M(src, dst, amt)` mit Tonhöhe 1,0 = 24 HT, Cutoff 1,0 = 120 HT, `fenv` 1,0 = ±72 HT. FM6 = `OP(coarse, ol, r[4], l[4], {det, vs, rs, ks})` in DX7-Einheiten (coarse 0 = ×0,5). Drums = Abweichungen von `DrumSynth.DEFAULTS` (Z. 7195), Kit-Bus `{gate, gateLvl, room}`.
- **Lage:** tiefster–höchster Ton der Hörprobe und Vorschlag für die LAGE-Klammer aus `transposition-lage.md` (§7).

## 3. Popularitäts-Prüfung (> 1 Mio. Aufrufe oder Streams)

| Act | > 1 Mio.? | Status | Grundlage |
|---|---|---|---|
| The Midnight | **ja** (≈ 1,0 Mio. monatliche Hörer, 812,4 Mio. Streams gesamt, „Los Angeles“ 52,6 Mio.; zweite Quelle: > 901 000 monatliche Hörer) | **BELEGT** für „> 1 Mio. Streams“ (2 Quellen, beide weit darüber); genaue Zahlen WAHRSCHEINLICH (Datenstand unklar) | übernommen aus R6 §1: musicmetricsvault, AllEvents |
| Kavinsky | nicht geprüft | UNBELEGT (eK: sehr wahrscheinlich ja, „Nightcall“ war Filmmusik zu „Drive“ – auch das nur Gedächtnis) | – |
| FM-84, Timecop1983, Gunship, Carpenter Brut, Perturbator | nicht geprüft | UNBELEGT (eK: wahrscheinlich ja, alle sind Szene-Größen) | – |
| Mitch Murder, Michael Oakley, Lazerhawk, Com Truise, Le Matos | nicht geprüft | UNBELEGT (eK: unsicher) | – |

**Regel für den Einbau:** Ein Act bekommt einen Vorbild-Tag im Filter erst, wenn „> 1 Mio.“ mit Quelle feststeht **oder** Xander ihn ausdrücklich will (The Midnight: beides erfüllt). Bis dahin tragen die Sounds nur den Genre-Tag `retrowave` (Vorschlag).

## 4. Gemeinsame Stilmerkmale (Grundlage der Hörproben)

| Merkmal | Wert | Status |
|---|---|---|
| Typische Sounds | Gated-Reverb-Snare, Juno-PWM-Flächen mit Chorus, Achtel-Oktav-Bässe, Arps mit punktiertem Echo, DX-E-Piano, Saxofon, Gitarrensolo bzw. verzerrter Synth-Lead | UNBELEGT (eK, übernommen aus R6 §1 „Retrowave allgemein“) |
| Tempo | Synthwave/Outrun ≈ 85–118 BPM; Darksynth eher 110–130 BPM; Downtempo ≈ 80–95 BPM | UNBELEGT (eK; R6 nannte 80–118) |
| Tonarten | Synthwave oft Dur mit Maj7/add9 oder Moll mit i–VI–III–VII; Darksynth Moll, phrygische Wendung (♭II) und harmonisch Moll | UNBELEGT (eK) |
| Bass-Muster | (a) Achtel Grundton–Oktave; (b) „Galopp“ Achtel + zwei 16tel; (c) 16tel mit Oktavsprüngen (wie EBM, aber verzerrt); (d) gezupfte Achtel mit kurzer Filter-Hüllkurve | (d) WAHRSCHEINLICH (Timecop1983, Reverb Machine); (a)–(c) UNBELEGT (eK) |
| Drums | Kick 1 + 3 (+ 3-und), Gated Snare 2 + 4, 16tel-Hats, Tom-Fill am Phrasenende; Darksynth: Doppel-Kick-Gefühl; Downtempo: Snare auf 3 (halbes Tempo) | UNBELEGT (eK) |
| Arrangement | Intro mit Arp + Fläche, Bass und Drums ab Takt 3–5, Hook-Instrument (Sax, Synth-Lead) im Refrain, Breakdown nur Fläche + Arp | UNBELEGT (eK; so auch R6 §7 Demo 9) |

## 5. Die Acts

### 5.1 The Midnight (`vorbild: the-midnight`) – von Xanders Kumpel genannt

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Duo aus Tim McEwan (Produzent) und Tyler Lyle (Gesang) | WAHRSCHEINLICH (übernommen aus R6, Wikipedia-Auszug) | Wikipedia „The Midnight“ |
| McEwans Lieblings-Synths auf „Heroes“ (2022): **OB-6, Prophet-6, Juno-106, Oberheim Matrix-6, UDO Super 6**; OB-6 und Prophet-6 kamen 2020 dazu | BELEGT (Interview, übernommen aus `r8/studio-setups.md` §1.20) | MusicRadar, McEwan-Interview |
| Auf „Syndicate“ (2025): **Moog Sub 37, Yamaha DX7, Serum, Oberheim OB-X8, UDO Super 6, u-he Zebra 2** | BELEGT (Interview, übernommen aus R8) | MusicTech, „Syndicate“-Interview |
| Lyle: der **Juno-6** sei „in its beating heart“ | WAHRSCHEINLICH (nur Überschrift, Text abgeschnitten, R6) | MusicRadar über inkl.com |
| Saxofon als Markenzeichen | WAHRSCHEINLICH (Wikipedia allein; K-R8) | Wikipedia |
| u-he Repro/Diva | WAHRSCHEINLICH-schwach (nur Equipboard, Nutzerangaben) | Equipboard |
| Album „Monsters“ Platz 1 der Billboard Electronic Albums | WAHRSCHEINLICH (R6, SE) | iconvsicon |
| Welcher Synth welchen Part spielt (Fläche, Bass, Lead) | **UNBELEGT** | – |
| Gedächtnis: Alben „Endless Summer“ (2016), „Kids“ (2018), „Monsters“ (2020), „Heroes“ (2022); bekannte Titel „Sunset“, „Los Angeles“ (Letzteres in R6 mit Stream-Zahl) | UNBELEGT (Gedächtnis), außer „Los Angeles“ und „Syndicate“ (R6/R8) | – |

**Stil-Merkmale (für Hörproben und Demo)**

| Merkmal | Wert | Status |
|---|---|---|
| Tempo | ≈ 95–110 BPM, mittleres „Fahr“-Tempo | UNBELEGT (eK) |
| Harmonik | Dur mit Maj7/add9, I–V–vi–IV, sus4 → Dur am Phrasenende; wehmütig, nicht düster | UNBELEGT (eK) |
| Rollen | breite Poly-Flächen mit Chorus, Saxofon-Solo als Hook, DX-E-Piano in Balladen, Gated Snare | Geräte BELEGT (s. o.), Rollen UNBELEGT |
| Arrangement | Refrain mit Gesang, Instrumental-Hook vom Sax nach dem Refrain, Bridge mit E-Piano | UNBELEGT (eK) |

#### MN1 Hörprobe für R6 N31 „Nachtblau-Fläche“ – Rolle Fläche · VA

- **Rezept:** unverändert aus `r6/n6/rezepte76.json` (Säge + Puls 50 %, LFO 1 Dreieck 0,6 Hz → Pulsbreite, Sub 30 %, LP24 2 kHz, Amp A 0,3 s R 1,5 s, Chorus II, Hall 3 s).
- **Vorbild (ⓘ):** breite Synth-Fläche mit langsamer Pulsbreiten-Modulation und Chorus – der Klang der Roland-Juno-Familie (Juno-106 als Gerät von McEwan BELEGT; Part UNBELEGT).
- **Lage / Rolle:** G2–B4 (43–71). LAGE-Klammer **G2–C5**.
- **Hörprobe** (D-Dur, Maj7-Akkorde mit wandernder Oberstimme, Takt 4 sus4 → Dur):
```
Tempo 100 BPM · 4 Takte · Akkorde: Dmaj7 | Bm7 | Gmaj7 | Asus4 → A
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D3(50) 0/16/84 · A3(57) 0/16/84 · C#4(61) 0/16/84 · F#4(66) 0/16/84 · A4(69) 0/8/86 · E4(64) 8/8/82
T2: B2(47) 16/16/84 · F#3(54) 16/16/84 · A3(57) 16/16/84 · D4(62) 16/16/84 · F#4(66) 16/8/86 · A4(69) 24/8/88
T3: G2(43) 32/16/84 · D3(50) 32/16/84 · F#3(54) 32/16/84 · B3(59) 32/16/84 · B4(71) 32/8/88 · A4(69) 40/8/84
T4: A2(45) 48/8/86 · E3(52) 48/8/86 · A3(57) 48/8/86 · D4(62) 48/8/86 · E4(64) 48/8/86 · A2(45) 56/8/92 · E3(52) 56/8/92 · A3(57) 56/8/92 · C#4(61) 56/8/92 · E4(64) 56/8/94
```
Dauer: alle 4 Takte 9,6 s · kurz (≤ 8 s) T1, T2, T4 = 7,2 s · ganz (≤ 16 s) T1, T2, T3, T4 = 9,6 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,4,50,0.66],[0,4,57,0.66],[0,4,61,0.66],[0,4,66,0.66],[0,2,69,0.68],[2,2,64,0.65],[4,4,47,0.66],[4,4,54,0.66],[4,4,57,0.66],[4,4,62,0.66],[4,2,66,0.68],[6,2,69,0.69],[8,2,45,0.68],[8,2,52,0.68],[8,2,57,0.68],[8,2,62,0.68],[8,2,64,0.68],[10,2,45,0.72],[10,2,52,0.72],[10,2,57,0.72],[10,2,61,0.72],[10,2,64,0.74]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,4,50,0.66],[0,4,57,0.66],[0,4,61,0.66],[0,4,66,0.66],[0,2,69,0.68],[2,2,64,0.65],[4,4,47,0.66],[4,4,54,0.66],[4,4,57,0.66],[4,4,62,0.66],[4,2,66,0.68],[6,2,69,0.69],[8,4,43,0.66],[8,4,50,0.66],[8,4,54,0.66],[8,4,59,0.66],[8,2,71,0.69],[10,2,69,0.66],[12,2,45,0.68],[12,2,52,0.68],[12,2,57,0.68],[12,2,62,0.68],[12,2,64,0.68],[14,2,45,0.72],[14,2,52,0.72],[14,2,57,0.72],[14,2,61,0.72],[14,2,64,0.74]]`
- **Abstand:** gehaltene Akkorde ohne Melodie; die Folge I–vi–IV–V ist Allerweltsmaterial.
- **Karte:** „Weite Juno-artige Fläche mit Chorus – erinnert an nächtliche Synthwave-Hymnen (Stil The Midnight).“

#### MN2 Hörprobe für R6 N32 „Neon-Sax“ – Rolle Lead/Hook · VA (Annäherung)

- **Rezept:** unverändert aus R6 (Säge + Puls 30 %, BP12 1,1 kHz Res 25 %, Anschlag → Cutoff, Rauschen 6 %, Vibrato verzögert, Legato Glide 30 ms). Bleibt eine **Annäherung**; ein echtes Saxofon braucht den Klangkörper V9b bzw. die Resynthese aus `fragen-xander-9.md`.
- **Vorbild (ⓘ):** Saxofon-Solo als Hook der Retrowave (WAHRSCHEINLICH für The Midnight).
- **Lage / Rolle:** A4–D6 (69–86). LAGE-Klammer **tief F#4** (darunter klingt der Bandpass dumpf).
- **Hörprobe** (D-Dur, Pentatonik mit „blauen“ 1/16-Anschleifern F→F# und C→C#, Takt 4 steigt bis D6):
```
Tempo 100 BPM · 4 Takte · Akkorde: D | A | Bm | G → A
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A4(69) 2/2/92 · B4(71) 4/2/88 · D5(74) 6/4/100 · E5(76) 10/2/92 · F#5(78) 12/4/104
T2: E5(76) 16/2/92 · D5(74) 18/2/88 · B4(71) 20/4/96 · A4(69) 24/2/90 · F5(77) 26/1/84 · F#5(78) 27/5/104
T3: A5(81) 32/6/108 · F#5(78) 38/2/92 · E5(76) 40/2/90 · D5(74) 42/2/88 · B4(71) 44/4/94
T4: C5(72) 48/1/84 · C#5(73) 49/3/98 · E5(76) 52/2/94 · F#5(78) 54/2/98 · A5(81) 56/2/104 · B5(83) 58/2/108 · D6(86) 60/4/112
```
Dauer: alle 4 Takte 9,6 s · kurz (≤ 8 s) T1, T2, T4 = 7,2 s · ganz (≤ 16 s) T1, T2, T3, T4 = 9,6 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0.5,0.5,69,0.72],[1,0.5,71,0.69],[1.5,1,74,0.79],[2.5,0.5,76,0.72],[3,1,78,0.82],[4,0.5,76,0.72],[4.5,0.5,74,0.69],[5,1,71,0.76],[6,0.5,69,0.71],[6.5,0.25,77,0.66],[6.75,1.25,78,0.82],[8,0.25,72,0.66],[8.25,0.75,73,0.77],[9,0.5,76,0.74],[9.5,0.5,78,0.77],[10,0.5,81,0.82],[10.5,0.5,83,0.85],[11,1,86,0.88]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0.5,0.5,69,0.72],[1,0.5,71,0.69],[1.5,1,74,0.79],[2.5,0.5,76,0.72],[3,1,78,0.82],[4,0.5,76,0.72],[4.5,0.5,74,0.69],[5,1,71,0.76],[6,0.5,69,0.71],[6.5,0.25,77,0.66],[6.75,1.25,78,0.82],[8,1.5,81,0.85],[9.5,0.5,78,0.72],[10,0.5,76,0.71],[10.5,0.5,74,0.69],[11,1,71,0.74],[12,0.25,72,0.66],[12.25,0.75,73,0.77],[13,0.5,76,0.74],[13.5,0.5,78,0.77],[14,0.5,81,0.82],[14.5,0.5,83,0.85],[15,1,86,0.88]]`
- **Abstand:** frei erfundene Pentatonik-Phrase; Anschleifer sind eine Spieltechnik, kein Motiv.
- **Karte:** „Weicher Sax-artiger Lead mit Anschleifern – erinnert an die Sax-Soli der Retrowave (Stil The Midnight).“

#### MN3 „Abendrot-Poly“ (neu) – Rolle Akkord/Stab · VA

- **Vorbild (ⓘ):** helle Poly-Akkorde moderner Analog-Polys (OB-6, Prophet-6 als Geräte BELEGT; Patch UNBELEGT).
- **Rezept:** `o2fine -8, o2lvl .85, o3w 1, o3oct 1, o3lvl .2, ftype 1, cutoff 900, res .15, drive .2, kt .5, fenv .38, fvel .4, fA .003, fD .32, fS .35, fR .25, aA .003, aD .6, aS .7, aR .3, ampVel .45, analog .3, spread .5, poly 6` · Routen `M('vel','cutoff', .05)` · fx `{chorus:{mode:'I', mix:.4}, rev .3, dly .12}` · bus `{echo:{mode:'pp', divL:'1/8.', fb .25}}`
- **Warum so (Entwurf):** Zwei Sägen 8 ct auseinander + Puls eine Oktave höher (20 %) = voller, aber heller Akkord. LP12 statt LP24: weicher Biss. Filter-Hüllkurve ≈ +27 HT mit 0,32 s → jeder Stoß „blüht“ kurz auf. `analog .3` + `spread .5`: jede Stimme minimal anders und anders im Panorama. Unterschied zum Werk „Prophet-Poly“: LP12, Puls-Oktave, kürzere Hüllkurve, Echo (vor dem Einbau messen, §9 Punkt 5).
- **Lage / Rolle:** G#3–E5 (56–76). LAGE-Klammer **G3–E5**.
- **Hörprobe** (A-Dur, I–V–vi–IV mit „Push“ – der Akkord des nächsten Takts kommt schon auf der 4-und):
```
Tempo 104 BPM · 4 Takte · Akkorde: A | E/G# | F#m | D → E
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A3(57) 0/2/104 · C#4(61) 0/2/104 · E4(64) 0/2/104 · A4(69) 0/2/104 · A3(57) 3/2/88 · C#4(61) 3/2/88 · E4(64) 3/2/88 · A4(69) 3/2/88 · A3(57) 6/4/96 · C#4(61) 6/4/96 · E4(64) 6/4/96 · A4(69) 6/4/96 · Ab3(56) 14/2/100 · B3(59) 14/2/100 · E4(64) 14/2/100 · Ab4(68) 14/2/100
T2: Ab3(56) 16/2/100 · B3(59) 16/2/100 · E4(64) 16/2/100 · Ab4(68) 16/2/100 · Ab3(56) 19/2/86 · B3(59) 19/2/86 · E4(64) 19/2/86 · Ab4(68) 19/2/86 · Ab3(56) 22/6/96 · B3(59) 22/6/96 · E4(64) 22/6/96 · B4(71) 22/6/96 · A3(57) 30/2/100 · C#4(61) 30/2/100 · F#4(66) 30/2/100 · A4(69) 30/2/100
T3: A3(57) 32/2/104 · C#4(61) 32/2/104 · F#4(66) 32/2/104 · A4(69) 32/2/104 · A3(57) 35/2/88 · C#4(61) 35/2/88 · F#4(66) 35/2/88 · A4(69) 35/2/88 · A3(57) 38/4/96 · C#4(61) 38/4/96 · F#4(66) 38/4/96 · C#5(73) 38/4/96 · A3(57) 42/2/90 · C#4(61) 42/2/90 · F#4(66) 42/2/90 · A4(69) 42/2/90 · A3(57) 46/2/100 · D4(62) 46/2/100 · F#4(66) 46/2/100 · A4(69) 46/2/100
T4: A3(57) 48/6/102 · D4(62) 48/6/102 · F#4(66) 48/6/102 · A4(69) 48/6/102 · A3(57) 54/2/94 · D4(62) 54/2/94 · F#4(66) 54/2/94 · D5(74) 54/2/94 · B3(59) 56/2/104 · E4(64) 56/2/104 · Ab4(68) 56/2/104 · B4(71) 56/2/104 · B3(59) 59/2/92 · E4(64) 59/2/92 · Ab4(68) 59/2/92 · B4(71) 59/2/92 · B3(59) 62/2/112 · E4(64) 62/2/112 · Ab4(68) 62/2/112 · E5(76) 62/2/112
```
Dauer: alle 4 Takte 9,2 s · kurz (≤ 8 s) T1, T2, T4 = 6,9 s · ganz (≤ 16 s) T1, T2, T3, T4 = 9,2 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.5,57,0.82],[0,0.5,61,0.82],[0,0.5,64,0.82],[0,0.5,69,0.82],[0.75,0.5,57,0.69],[0.75,0.5,61,0.69],[0.75,0.5,64,0.69],[0.75,0.5,69,0.69],[1.5,1,57,0.76],[1.5,1,61,0.76],[1.5,1,64,0.76],[1.5,1,69,0.76],[3.5,0.5,56,0.79],[3.5,0.5,59,0.79],[3.5,0.5,64,0.79],[3.5,0.5,68,0.79],[4,0.5,56,0.79],[4,0.5,59,0.79],[4,0.5,64,0.79],[4,0.5,68,0.79],[4.75,0.5,56,0.68],[4.75,0.5,59,0.68],[4.75,0.5,64,0.68],[4.75,0.5,68,0.68],[5.5,1.5,56,0.76],[5.5,1.5,59,0.76],[5.5,1.5,64,0.76],[5.5,1.5,71,0.76],[7.5,0.5,57,0.79],[7.5,0.5,61,0.79],[7.5,0.5,66,0.79],[7.5,0.5,69,0.79],[8,1.5,57,0.8],[8,1.5,62,0.8],[8,1.5,66,0.8],[8,1.5,69,0.8],[9.5,0.5,57,0.74],[9.5,0.5,62,0.74],[9.5,0.5,66,0.74],[9.5,0.5,74,0.74],[10,0.5,59,0.82],[10,0.5,64,0.82],[10,0.5,68,0.82],[10,0.5,71,0.82],[10.75,0.5,59,0.72],[10.75,0.5,64,0.72],[10.75,0.5,68,0.72],[10.75,0.5,71,0.72],[11.5,0.5,59,0.88],[11.5,0.5,64,0.88],[11.5,0.5,68,0.88],[11.5,0.5,76,0.88]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,0.5,57,0.82],[0,0.5,61,0.82],[0,0.5,64,0.82],[0,0.5,69,0.82],[0.75,0.5,57,0.69],[0.75,0.5,61,0.69],[0.75,0.5,64,0.69],[0.75,0.5,69,0.69],[1.5,1,57,0.76],[1.5,1,61,0.76],[1.5,1,64,0.76],[1.5,1,69,0.76],[3.5,0.5,56,0.79],[3.5,0.5,59,0.79],[3.5,0.5,64,0.79],[3.5,0.5,68,0.79],[4,0.5,56,0.79],[4,0.5,59,0.79],[4,0.5,64,0.79],[4,0.5,68,0.79],[4.75,0.5,56,0.68],[4.75,0.5,59,0.68],[4.75,0.5,64,0.68],[4.75,0.5,68,0.68],[5.5,1.5,56,0.76],[5.5,1.5,59,0.76],[5.5,1.5,64,0.76],[5.5,1.5,71,0.76],[7.5,0.5,57,0.79],[7.5,0.5,61,0.79],[7.5,0.5,66,0.79],[7.5,0.5,69,0.79],[8,0.5,57,0.82],[8,0.5,61,0.82],[8,0.5,66,0.82],[8,0.5,69,0.82],[8.75,0.5,57,0.69],[8.75,0.5,61,0.69],[8.75,0.5,66,0.69],[8.75,0.5,69,0.69],[9.5,1,57,0.76],[9.5,1,61,0.76],[9.5,1,66,0.76],[9.5,1,73,0.76],[10.5,0.5,57,0.71],[10.5,0.5,61,0.71],[10.5,0.5,66,0.71],[10.5,0.5,69,0.71],[11.5,0.5,57,0.79],[11.5,0.5,62,0.79],[11.5,0.5,66,0.79],[11.5,0.5,69,0.79],[12,1.5,57,0.8],[12,1.5,62,0.8],[12,1.5,66,0.8],[12,1.5,69,0.8],[13.5,0.5,57,0.74],[13.5,0.5,62,0.74],[13.5,0.5,66,0.74],[13.5,0.5,74,0.74],[14,0.5,59,0.82],[14,0.5,64,0.82],[14,0.5,68,0.82],[14,0.5,71,0.82],[14.75,0.5,59,0.72],[14.75,0.5,64,0.72],[14.75,0.5,68,0.72],[14.75,0.5,71,0.72],[15.5,0.5,59,0.88],[15.5,0.5,64,0.88],[15.5,0.5,68,0.88],[15.5,0.5,76,0.88]]`
- **Abstand:** nur Akkord-Rhythmus; Vorwegnahme ist eine Allerwelts-Technik des 80er-Pop.
- **Karte:** „Heller Poly-Akkord mit Vorwegnahme – erinnert an moderne Synthwave mit Analog-Polys (Stil The Midnight).“

#### MN4 R6 N38 „Neon-Zinken“ mit neuem FM-Kern – Rolle Keys · FM6

- **Vorbild (ⓘ):** FM-E-Piano der 80er (DX7 als Gerät der Band 2025 BELEGT; Part UNBELEGT).
- **Rezept (`p.fm6` = DX7 ROM1A „E.PIANO 1“, 1:1 aus `rom1a.json`, Status der Daten BELEGT):** `alg 5, fb 6, trans 0`
  - OP1 Träger: `OP(1, 99, [96,25,25,67], [99,75,0,0], {det 3, vs 2, rs 3})`
  - OP2 Zinke: `OP(14, 58, [95,50,35,78], [99,75,0,0], {vs 7, rs 3})`
  - OP3 Träger: `OP(1, 99, [95,20,20,50], [99,95,0,0], {vs 2, rs 3})`
  - OP4: `OP(1, 89, [95,29,20,50], [99,95,0,0], {vs 6, rs 3})`
  - OP5 Träger: `OP(1, 99, [95,20,20,50], [99,95,0,0], {det -7, rs 3})`
  - OP6 (Feedback): `OP(1, 79, [95,29,20,50], [99,95,0,0], {det 7, vs 6, rs 3, ks {bp 41, ld 0, rd 19, lc 0, rc 0}})`
  - common `{gain -12 (nicht gemessen), poly 8, lfo {wave 'sine', rate 5, delay .8, amp .1}}` · fx `{chorus:{mode:'II', mix:.6}, rev .3}` · bus `{hall:{decay 2.5}}`
- **Warum so:** Algorithmus 5 = drei Paare. Paar 1 trägt die **Zinke** (×14, OL 58, Anschlag 7: leise weich, fest „bellt“ es). Paare 2 und 3 sind der Körper, ±7 verstimmt = Schwebung. Chorus II macht daraus das breite Balladen-Piano. Gegenüber dem bisherigen N38 (Kopie des Werks „DX-Tines“) ist das der echte Werksklang – so wird der V10d-08-Doppelte aufgelöst (K-R4). R6-Regel: Modulatoren erst ab OL ≈ 62 deutlich hörbar – die Zinke liegt bewusst knapp darunter (wie im ROM) und kommt über den Anschlag.
- **Lage / Rolle:** Bb1–D5 (34–74). Bass-Ton links, Akkord rechts. LAGE-Klammer **Bb1–D5**.
- **Hörprobe** (84 BPM, F-Dur, Basston + gebrochene Achtel, Takt 4 Bb → C mit Vorhalt-Ton D5):
```
Tempo 84 BPM · 4 Takte · Akkorde: Fmaj7 | Em7 | Dm7 | Bb → C
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: F2(41) 0/16/92 · A3(57) 0/2/86 · C4(60) 2/2/72 · E4(64) 4/2/86 · G4(67) 6/2/72 · A4(69) 8/2/86 · G4(67) 10/2/72 · E4(64) 12/2/86 · C4(60) 14/2/72
T2: E2(40) 16/16/90 · G3(55) 16/2/86 · B3(59) 18/2/72 · D4(62) 20/2/86 · E4(64) 22/2/72 · G4(67) 24/2/86 · B4(71) 26/2/72 · G4(67) 28/2/86 · D4(62) 30/2/72
T3: D2(38) 32/16/90 · F3(53) 32/2/86 · A3(57) 34/2/72 · C4(60) 36/2/86 · E4(64) 38/2/72 · F4(65) 40/2/86 · E4(64) 42/2/72 · C4(60) 44/2/86 · A3(57) 46/2/72
T4: Bb1(34) 48/8/92 · D4(62) 48/8/90 · F4(65) 48/8/90 · A4(69) 48/8/90 · C2(36) 56/8/96 · E4(64) 56/4/96 · G4(67) 56/4/96 · C5(72) 56/4/96 · D5(74) 60/4/100
```
Dauer: alle 4 Takte 11,4 s · kurz (≤ 8 s) T1, T4 = 5,7 s · ganz (≤ 16 s) T1, T2, T3, T4 = 11,4 s
aud-Daten kurz (Spec v3 §12.8, `len 2`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,4,41,0.72],[0,0.5,57,0.68],[0.5,0.5,60,0.57],[1,0.5,64,0.68],[1.5,0.5,67,0.57],[2,0.5,69,0.68],[2.5,0.5,67,0.57],[3,0.5,64,0.68],[3.5,0.5,60,0.57],[4,2,34,0.72],[4,2,62,0.71],[4,2,65,0.71],[4,2,69,0.71],[6,2,36,0.76],[6,1,64,0.76],[6,1,67,0.76],[6,1,72,0.76],[7,1,74,0.79]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,4,41,0.72],[0,0.5,57,0.68],[0.5,0.5,60,0.57],[1,0.5,64,0.68],[1.5,0.5,67,0.57],[2,0.5,69,0.68],[2.5,0.5,67,0.57],[3,0.5,64,0.68],[3.5,0.5,60,0.57],[4,4,40,0.71],[4,0.5,55,0.68],[4.5,0.5,59,0.57],[5,0.5,62,0.68],[5.5,0.5,64,0.57],[6,0.5,67,0.68],[6.5,0.5,71,0.57],[7,0.5,67,0.68],[7.5,0.5,62,0.57],[8,4,38,0.71],[8,0.5,53,0.68],[8.5,0.5,57,0.57],[9,0.5,60,0.68],[9.5,0.5,64,0.57],[10,0.5,65,0.68],[10.5,0.5,64,0.57],[11,0.5,60,0.68],[11.5,0.5,57,0.57],[12,2,34,0.72],[12,2,62,0.71],[12,2,65,0.71],[12,2,69,0.71],[14,2,36,0.76],[14,1,64,0.76],[14,1,67,0.76],[14,1,72,0.76],[15,1,74,0.79]]`
- **Abstand:** gebrochene Akkorde in Achteln sind Allerweltsbegleitung.
- **Karte:** „Glockiges FM-E-Piano mit Chorus – erinnert an Synthwave-Balladen (Stil The Midnight).“

---

### 5.2 FM-84 (`vorbild: fm-84`)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Geräte, Patches, Arbeitsweise | **UNBELEGT** (nicht recherchiert: R6 Suchbudget, hier Web gesperrt) | – |
| Gedächtnis: Projekt von Col Bennett; Album „Atlas“ (2016); Titel „Running in the Night“ mit Sänger Ollie Wride | UNBELEGT (Gedächtnis) | – |

**Stil-Merkmale (eK, alles UNBELEGT):** ≈ 100–120 BPM, Dur, hymnischer 80er-Pop-Rock; singender Synth-Lead mit Echo, gezupfte Rock-Achtel im Bass, Gated Snare, Sax- oder Gitarren-Solo.

#### F81 Hörprobe für R6 N37 „Strandpromenade-Lead“ – Rolle Lead · VA

- **Rezept:** unverändert aus R6 (Säge + Puls +1 Okt 30 %, LP24 3 kHz, Legato Glide 50 ms, Vibrato verzögert 5,5 Hz, Echo 1/4 25 %, Hall 2,5 s).
- **Vorbild (ⓘ):** singender Synth-Lead mit Viertel-Echo (Stil-Vermutung, UNBELEGT).
- **Lage / Rolle:** B4–B5 (71–83). LAGE-Klammer **tief A4**.
- **Hörprobe** (112 BPM, E-Dur, I–vi–IV–V, lange Töne, Takt 4 steigt auf B5):
```
Tempo 112 BPM · 4 Takte · Akkorde: E | C#m | A | B
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: B4(71) 0/4/96 · E5(76) 4/6/104 · F#5(78) 10/2/92 · Ab5(80) 12/4/104
T2: F#5(78) 16/2/92 · E5(76) 18/2/90 · C#5(73) 20/8/100 · B4(71) 28/4/90
T3: C#5(73) 32/4/96 · E5(76) 36/4/100 · A5(81) 40/6/108 · Ab5(80) 46/2/92
T4: F#5(78) 48/4/98 · Ab5(80) 52/2/96 · A5(81) 54/2/100 · B5(83) 56/8/112
```
Dauer: alle 4 Takte 8,6 s · kurz (≤ 8 s) T1, T2, T4 = 6,4 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,6 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,1,71,0.76],[1,1.5,76,0.82],[2.5,0.5,78,0.72],[3,1,80,0.82],[4,0.5,78,0.72],[4.5,0.5,76,0.71],[5,2,73,0.79],[7,1,71,0.71],[8,1,78,0.77],[9,0.5,80,0.76],[9.5,0.5,81,0.79],[10,2,83,0.88]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,1,71,0.76],[1,1.5,76,0.82],[2.5,0.5,78,0.72],[3,1,80,0.82],[4,0.5,78,0.72],[4.5,0.5,76,0.71],[5,2,73,0.79],[7,1,71,0.71],[8,1,73,0.76],[9,1,76,0.79],[10,1.5,81,0.85],[11.5,0.5,80,0.72],[12,1,78,0.77],[13,0.5,80,0.76],[13.5,0.5,81,0.79],[14,2,83,0.88]]`
- **Abstand:** eigene Linie aus Akkordtönen; Aufstieg zum Grundton der Dominante ist ein Allerwelts-Schluss.
- **Karte:** „Singender Lead mit Echo – erinnert an sonnige Synthwave (Stil-Vermutung FM-84).“

#### F82 „Brandungs-Bass“ (neu) – Rolle Bass · VA

- **Vorbild (ⓘ):** Synth-Bass, der wie ein gezupfter Rock-Bass in Achteln läuft (Stil-Vermutung, UNBELEGT).
- **Rezept:** `o2w 1, o2pw .3, o2fine 0, o2lvl .5, subLvl .3, cutoff 520, res .12, drive .3, bass .6, kt .45, fenv .35, fvel .4, fA .001, fD .18, fS .25, fR .08, aA .001, aD .4, aS .6, aR .06, ampVel .5, mode 1, poly 1, reset 1, analog .12, spread 0` · Routen `M('vel','cutoff', .04)` · fx `{drive .15, rev .05}`
- **Warum so:** Säge + schmaler Puls (30 %) = „Saiten“-Obertöne; Filter-Hüllkurve +25 HT, 0,18 s = Anschlag des Plektrums. Akzent-Achtel (`accent8`) machen das Rock-Gefühl.
- **Lage / Rolle:** A1–E3 (33–52). LAGE-Klammer **hoch E3**.
- **Hörprobe** (112 BPM, E-Dur, Achtel mit Oktav-Tupfer auf der 2, Durchgangstöne am Taktende, Takt 4 Lauf aufwärts):
```
Tempo 112 BPM · 4 Takte · Akkorde: E | C#m | A | B
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E2(40) 0/2/100 · E2(40) 2/2/84 · E3(52) 4/2/100 · E2(40) 6/2/84 · E2(40) 8/2/100 · E2(40) 10/2/84 · B1(35) 12/2/100 · Eb2(39) 14/2/84
T2: C#2(37) 16/2/100 · C#2(37) 18/2/84 · C#3(49) 20/2/100 · C#2(37) 22/2/84 · C#2(37) 24/2/100 · C#2(37) 26/2/84 · E2(40) 28/2/100 · Ab2(44) 30/2/84
T3: A1(33) 32/2/100 · A1(33) 34/2/84 · A2(45) 36/2/100 · A1(33) 38/2/84 · A1(33) 40/2/100 · A1(33) 42/2/84 · C#2(37) 44/2/100 · E2(40) 46/2/84
T4: B1(35) 48/2/92 · B1(35) 50/2/95 · B2(47) 52/2/98 · B1(35) 54/2/101 · B1(35) 56/2/104 · C#2(37) 58/2/107 · Eb2(39) 60/2/110 · F#2(42) 62/2/113
```
Dauer: alle 4 Takte 8,6 s · kurz (≤ 8 s) T1, T2, T4 = 6,4 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,6 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.5,40,0.79],[0.5,0.5,40,0.66],[1,0.5,52,0.79],[1.5,0.5,40,0.66],[2,0.5,40,0.79],[2.5,0.5,40,0.66],[3,0.5,35,0.79],[3.5,0.5,39,0.66],[4,0.5,37,0.79],[4.5,0.5,37,0.66],[5,0.5,49,0.79],[5.5,0.5,37,0.66],[6,0.5,37,0.79],[6.5,0.5,37,0.66],[7,0.5,40,0.79],[7.5,0.5,44,0.66],[8,0.5,35,0.72],[8.5,0.5,35,0.75],[9,0.5,47,0.77],[9.5,0.5,35,0.8],[10,0.5,35,0.82],[10.5,0.5,37,0.84],[11,0.5,39,0.87],[11.5,0.5,42,0.89]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,0.5,40,0.79],[0.5,0.5,40,0.66],[1,0.5,52,0.79],[1.5,0.5,40,0.66],[2,0.5,40,0.79],[2.5,0.5,40,0.66],[3,0.5,35,0.79],[3.5,0.5,39,0.66],[4,0.5,37,0.79],[4.5,0.5,37,0.66],[5,0.5,49,0.79],[5.5,0.5,37,0.66],[6,0.5,37,0.79],[6.5,0.5,37,0.66],[7,0.5,40,0.79],[7.5,0.5,44,0.66],[8,0.5,33,0.79],[8.5,0.5,33,0.66],[9,0.5,45,0.79],[9.5,0.5,33,0.66],[10,0.5,33,0.79],[10.5,0.5,33,0.66],[11,0.5,37,0.79],[11.5,0.5,40,0.66],[12,0.5,35,0.72],[12.5,0.5,35,0.75],[13,0.5,47,0.77],[13.5,0.5,35,0.8],[14,0.5,35,0.82],[14.5,0.5,37,0.84],[15,0.5,39,0.87],[15.5,0.5,42,0.89]]`
- **Abstand:** Achtel-Grundton mit Durchgängen ist Allerwelts-Rockbass.
- **Karte:** „Treibender Achtel-Bass wie gezupft – erinnert an sonnigen 80er-Pop-Rock (Stil-Vermutung FM-84).“

---

### 5.3 Timecop1983 (`vorbild: timecop1983`)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Arbeitet in FL Studio, meist mit freien Plugins; Juno-106 und TAL-Juno-Emulationen | WAHRSCHEINLICH (eine Sekundärquelle, übernommen aus R6; K-R1) | Reverb Machine „Timecop1983 Synth Sounds“ |
| Pluck-Bässe, deren Filter-Hüllkurve „gitarrenartig“ zupft | WAHRSCHEINLICH (dieselbe Quelle) | Reverb Machine |
| Gedächtnis: Niederländer (Jordy Leenaerts); Album „Night Drive“ | UNBELEGT (Gedächtnis) | – |

**Stil-Merkmale:** ≈ 85–100 BPM, verträumt, Maj7- und m7-Akkorde, Pluck-Bass in Achteln, Juno-Streicher (Bass-Technik WAHRSCHEINLICH, Rest UNBELEGT, eK).

#### TC1 Hörprobe für R6 N34 „Zupf-Bass 83“ – Rolle Bass · VA (gemessen [g] in R6)

- **Rezept:** unverändert aus R6 (Puls 50 % + Sub 50 %, LP24 260 Hz Res 20 %, Filter-Hk +36 HT D 0,12 S 0, Amp D 0,35 S 40 %, mono, Reset).
- **Vorbild (ⓘ):** gezupfter Juno-Bass mit kurzer Filter-Hüllkurve (WAHRSCHEINLICH).
- **Lage / Rolle:** A1–D3 (33–50). LAGE-Klammer **hoch D3**.
- **Hörprobe** (92 BPM, G-Dur-Umfeld: Cmaj7 | Bm7 | Am7 | D; Grundton–Oktave–Quinte, Takt 4 steigt):
```
Tempo 92 BPM · 4 Takte · Akkorde: Cmaj7 | Bm7 | Am7 | D
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: C2(36) 0/2/100 · C3(48) 2/2/84 · G2(43) 4/2/100 · C3(48) 6/2/84 · C2(36) 8/2/100 · C3(48) 10/2/84 · G2(43) 12/2/100 · B2(47) 14/2/84
T2: B1(35) 16/2/100 · B2(47) 18/2/84 · F#2(42) 20/2/100 · B2(47) 22/2/84 · B1(35) 24/2/100 · B2(47) 26/2/84 · D2(38) 28/2/100 · F#2(42) 30/2/84
T3: A1(33) 32/2/100 · A2(45) 34/2/84 · E2(40) 36/2/100 · A2(45) 38/2/84 · A1(33) 40/2/100 · A2(45) 42/2/84 · C2(36) 44/2/100 · E2(40) 46/2/84
T4: D2(38) 48/2/92 · D3(50) 50/2/95 · A2(45) 52/2/98 · D3(50) 54/2/101 · F#2(42) 56/2/104 · A2(45) 58/2/107 · C3(48) 60/2/110 · D3(50) 62/2/113
```
Dauer: alle 4 Takte 10,4 s · kurz (≤ 8 s) T1, T2, T4 = 7,8 s · ganz (≤ 16 s) T1, T2, T3, T4 = 10,4 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.5,36,0.79],[0.5,0.5,48,0.66],[1,0.5,43,0.79],[1.5,0.5,48,0.66],[2,0.5,36,0.79],[2.5,0.5,48,0.66],[3,0.5,43,0.79],[3.5,0.5,47,0.66],[4,0.5,35,0.79],[4.5,0.5,47,0.66],[5,0.5,42,0.79],[5.5,0.5,47,0.66],[6,0.5,35,0.79],[6.5,0.5,47,0.66],[7,0.5,38,0.79],[7.5,0.5,42,0.66],[8,0.5,38,0.72],[8.5,0.5,50,0.75],[9,0.5,45,0.77],[9.5,0.5,50,0.8],[10,0.5,42,0.82],[10.5,0.5,45,0.84],[11,0.5,48,0.87],[11.5,0.5,50,0.89]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,0.5,36,0.79],[0.5,0.5,48,0.66],[1,0.5,43,0.79],[1.5,0.5,48,0.66],[2,0.5,36,0.79],[2.5,0.5,48,0.66],[3,0.5,43,0.79],[3.5,0.5,47,0.66],[4,0.5,35,0.79],[4.5,0.5,47,0.66],[5,0.5,42,0.79],[5.5,0.5,47,0.66],[6,0.5,35,0.79],[6.5,0.5,47,0.66],[7,0.5,38,0.79],[7.5,0.5,42,0.66],[8,0.5,33,0.79],[8.5,0.5,45,0.66],[9,0.5,40,0.79],[9.5,0.5,45,0.66],[10,0.5,33,0.79],[10.5,0.5,45,0.66],[11,0.5,36,0.79],[11.5,0.5,40,0.66],[12,0.5,38,0.72],[12.5,0.5,50,0.75],[13,0.5,45,0.77],[13.5,0.5,50,0.8],[14,0.5,42,0.82],[14.5,0.5,45,0.84],[15,0.5,48,0.87],[15.5,0.5,50,0.89]]`
- **Abstand:** gebrochener Akkord in Achteln, keine Melodie.
- **Karte:** „Weich gezupfter Bass – erinnert an verträumte Nacht-Synthwave (Stil Timecop1983).“

#### TC2 Hörprobe für Werk „Juno-Streicher“ – Rolle Fläche · VA (Werks-Sound V0a Z. 5738)

- **Rezept:** Werk unverändert (Puls mit PWM über LFO 1, Chorus II, LP12 3,4 kHz, Amp A 0,38 s).
- **Vorbild (ⓘ):** Juno-Streicher (Juno-106 bei Timecop1983 WAHRSCHEINLICH; Part UNBELEGT). Tag nur „Gerät-Familie s, Part u“.
- **Lage / Rolle:** A2–E4 (45–64). LAGE-Klammer **A2–E4** (wie gemessen).
- **Hörprobe** (92 BPM, gleiche Akkorde wie TC1, Takt 3 Am7 → Am6, Takt 4 D → D9):
```
Tempo 92 BPM · 4 Takte · Akkorde: Cmaj7 | Bm7 | Am7 → Am6 | D → D9
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: C3(48) 0/16/84 · G3(55) 0/16/84 · B3(59) 0/16/84 · E4(64) 0/16/84
T2: B2(47) 16/16/84 · F#3(54) 16/16/84 · A3(57) 16/16/84 · D4(62) 16/16/84
T3: A2(45) 32/8/84 · E3(52) 32/8/84 · G3(55) 32/8/84 · C4(60) 32/8/84 · A2(45) 40/8/86 · E3(52) 40/8/86 · F#3(54) 40/8/86 · C4(60) 40/8/86
T4: D3(50) 48/8/86 · F#3(54) 48/8/86 · A3(57) 48/8/86 · D4(62) 48/8/86 · D3(50) 56/8/92 · F#3(54) 56/8/92 · C4(60) 56/8/92 · E4(64) 56/8/92
```
Dauer: alle 4 Takte 10,4 s · kurz (≤ 8 s) T1, T2, T4 = 7,8 s · ganz (≤ 16 s) T1, T2, T3, T4 = 10,4 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,4,48,0.66],[0,4,55,0.66],[0,4,59,0.66],[0,4,64,0.66],[4,4,47,0.66],[4,4,54,0.66],[4,4,57,0.66],[4,4,62,0.66],[8,2,50,0.68],[8,2,54,0.68],[8,2,57,0.68],[8,2,62,0.68],[10,2,50,0.72],[10,2,54,0.72],[10,2,60,0.72],[10,2,64,0.72]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,4,48,0.66],[0,4,55,0.66],[0,4,59,0.66],[0,4,64,0.66],[4,4,47,0.66],[4,4,54,0.66],[4,4,57,0.66],[4,4,62,0.66],[8,2,45,0.66],[8,2,52,0.66],[8,2,55,0.66],[8,2,60,0.66],[10,2,45,0.68],[10,2,52,0.68],[10,2,54,0.68],[10,2,60,0.68],[12,2,50,0.68],[12,2,54,0.68],[12,2,57,0.68],[12,2,62,0.68],[14,2,50,0.72],[14,2,54,0.72],[14,2,60,0.72],[14,2,64,0.72]]`
- **Karte:** „Juno-artige Streicher mit Chorus – erinnert an verträumte Synthwave (Stil Timecop1983).“

---

### 5.4 Gunship (`vorbild: gunship`)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Geräte, Patches | **UNBELEGT** (nie recherchiert, R6 Suchbudget) | – |
| Gedächtnis: britisches Duo (Dan Haigh, Alex Westaway); Debüt „Gunship“ (2015), „Dark All Day“ (2018) | UNBELEGT (Gedächtnis) | – |

**Stil-Merkmale (eK, UNBELEGT):** ≈ 100–120 BPM, Moll, „Filmmusik“-Gestus: große Brass-Akkorde, Galopp-Bass, Gated Drums, Stimmen teils mit Vocoder/Effekt.

#### GS1 Hörprobe für R6 N36 „Kampfstern-Brass“ – Rolle Akkord · VA

- **Rezept:** unverändert aus R6 (2 Sägen ±10 ct, LP12 700 Hz, Filter-Hk A 60 ms +36 HT S 45 % gegen Amp A 25 ms, Spread 60 %, Analog 30 %, Chorus I, Hall 2,5 s).
- **Vorbild (ⓘ):** OB-artiges Brass (Stil-Vermutung, UNBELEGT). R6-Hinweis V10d-08: Doppelten-Paar mit Werk „Zweipol-Brass“ – Messung entscheidet.
- **Lage / Rolle:** F3–Bb4 (53–70). LAGE-Klammer **F3–C5**.
- **Hörprobe** (108 BPM, c-Moll, i–VI–III–VII, Vorwegnahme auf der 2-und, Takt 4 Gsus4 → G):
```
Tempo 108 BPM · 4 Takte · Akkorde: Cm | Ab | Eb | Bb → Gsus4 → G
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: G3(55) 0/6/100 · C4(60) 0/6/100 · Eb4(63) 0/6/100 · G3(55) 6/2/88 · C4(60) 6/2/88 · Eb4(63) 6/2/88 · G3(55) 8/8/104 · C4(60) 8/8/104 · Eb4(63) 8/8/104 · G4(67) 8/8/104
T2: Ab3(56) 16/6/100 · C4(60) 16/6/100 · Eb4(63) 16/6/100 · Ab3(56) 22/2/88 · C4(60) 22/2/88 · Eb4(63) 22/2/88 · Ab3(56) 24/8/104 · C4(60) 24/8/104 · Eb4(63) 24/8/104 · Ab4(68) 24/8/104
T3: G3(55) 32/8/100 · Bb3(58) 32/8/100 · Eb4(63) 32/8/100 · G3(55) 40/8/106 · Bb3(58) 40/8/106 · Eb4(63) 40/8/106 · Bb4(70) 40/8/106
T4: F3(53) 48/4/100 · Bb3(58) 48/4/100 · D4(62) 48/4/100 · F3(53) 52/4/96 · Bb3(58) 52/4/96 · D4(62) 52/4/96 · F4(65) 52/4/96 · G3(55) 56/4/104 · C4(60) 56/4/104 · D4(62) 56/4/104 · G3(55) 60/4/112 · B3(59) 60/4/112 · D4(62) 60/4/112 · G4(67) 60/4/112
```
Dauer: alle 4 Takte 8,9 s · kurz (≤ 8 s) T1, T2, T4 = 6,7 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,9 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,1.5,55,0.79],[0,1.5,60,0.79],[0,1.5,63,0.79],[1.5,0.5,55,0.69],[1.5,0.5,60,0.69],[1.5,0.5,63,0.69],[2,2,55,0.82],[2,2,60,0.82],[2,2,63,0.82],[2,2,67,0.82],[4,1.5,56,0.79],[4,1.5,60,0.79],[4,1.5,63,0.79],[5.5,0.5,56,0.69],[5.5,0.5,60,0.69],[5.5,0.5,63,0.69],[6,2,56,0.82],[6,2,60,0.82],[6,2,63,0.82],[6,2,68,0.82],[8,1,53,0.79],[8,1,58,0.79],[8,1,62,0.79],[9,1,53,0.76],[9,1,58,0.76],[9,1,62,0.76],[9,1,65,0.76],[10,1,55,0.82],[10,1,60,0.82],[10,1,62,0.82],[11,1,55,0.88],[11,1,59,0.88],[11,1,62,0.88],[11,1,67,0.88]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,1.5,55,0.79],[0,1.5,60,0.79],[0,1.5,63,0.79],[1.5,0.5,55,0.69],[1.5,0.5,60,0.69],[1.5,0.5,63,0.69],[2,2,55,0.82],[2,2,60,0.82],[2,2,63,0.82],[2,2,67,0.82],[4,1.5,56,0.79],[4,1.5,60,0.79],[4,1.5,63,0.79],[5.5,0.5,56,0.69],[5.5,0.5,60,0.69],[5.5,0.5,63,0.69],[6,2,56,0.82],[6,2,60,0.82],[6,2,63,0.82],[6,2,68,0.82],[8,2,55,0.79],[8,2,58,0.79],[8,2,63,0.79],[10,2,55,0.83],[10,2,58,0.83],[10,2,63,0.83],[10,2,70,0.83],[12,1,53,0.79],[12,1,58,0.79],[12,1,62,0.79],[13,1,53,0.76],[13,1,58,0.76],[13,1,62,0.76],[13,1,65,0.76],[14,1,55,0.82],[14,1,60,0.82],[14,1,62,0.82],[15,1,55,0.88],[15,1,59,0.88],[15,1,62,0.88],[15,1,67,0.88]]`
- **Abstand:** Allerwelts-Folge i–VI–III–VII in Akkorden, keine Melodie.
- **Karte:** „Mächtige Brass-Akkorde, die aufgehen – erinnert an epische Synthwave (Stil-Vermutung Gunship).“

#### GS2 „Sternkreuzer-Bass“ (neu) – Rolle Bass · VA

- **Vorbild (ⓘ):** „Galopp“-Bass (Achtel + zwei 16tel) der dunklen Synthwave (UNBELEGT, eK).
- **Rezept:** `o1uni 3, uniDet .15, uniMix .6, o2w 0, o2oct -1, o2fine 0, o2lvl .5, cutoff 650, res .35, drive .2, bass .6, kt .4, fenv .45, fvel .45, fA .001, fD .11, fS .15, fR .06, aA .001, aD .25, aS .7, aR .05, ampVel .55, mode 1, poly 1, reset 1, analog .15, spread .1` · fx `{drive .35, pump .25, pumpRel '1/16', rev .05}`
- **Warum so:** Unisono 3 macht den Grundton breit, die Säge eine Oktave tiefer trägt. Kurze Filter-Hüllkurve (0,11 s, +32 HT) + `fvel .45`: die betonte Achtel (Anschlag 112) „bellt“, die zwei 16tel (84/96) bleiben dunkler – so entsteht der Galopp aus dem Anschlag, nicht aus der Lautstärke. Spur-Drive 35 % (R6 [g]: nur der Spur-Drive raut auf).
- **Lage / Rolle:** G1–Eb3 (31–51). LAGE-Klammer **hoch Eb3**.
- **Hörprobe** (108 BPM, c-Moll wie GS1, Galopp je Viertel, Takt 4 Bb → G mit Aufgang B–D):
```
Tempo 108 BPM · 4 Takte · Akkorde: Cm | Ab | Eb | Bb → G
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: C2(36) 0/2/112 · C2(36) 2/1/84 · C3(48) 3/1/96 · C2(36) 4/2/112 · C2(36) 6/1/84 · C3(48) 7/1/96 · C2(36) 8/2/112 · C2(36) 10/1/84 · G2(43) 11/1/96 · C2(36) 12/2/112 · Eb2(39) 14/1/84 · G2(43) 15/1/96
T2: Ab1(32) 16/2/112 · Ab1(32) 18/1/84 · Ab2(44) 19/1/96 · Ab1(32) 20/2/112 · Ab1(32) 22/1/84 · Ab2(44) 23/1/96 · Ab1(32) 24/2/112 · Ab1(32) 26/1/84 · Eb2(39) 27/1/96 · Ab1(32) 28/2/112 · C2(36) 30/1/84 · Eb2(39) 31/1/96
T3: Eb2(39) 32/2/112 · Eb2(39) 34/1/84 · Eb3(51) 35/1/96 · Eb2(39) 36/2/112 · Eb2(39) 38/1/84 · Eb3(51) 39/1/96 · Eb2(39) 40/2/112 · Eb2(39) 42/1/84 · Bb2(46) 43/1/96 · Eb2(39) 44/2/112 · G2(43) 46/1/84 · Bb2(46) 47/1/96
T4: Bb1(34) 48/2/112 · Bb1(34) 50/1/84 · Bb2(46) 51/1/96 · Bb1(34) 52/2/112 · Bb1(34) 54/1/84 · F2(41) 55/1/96 · G1(31) 56/2/112 · G1(31) 58/1/84 · G2(43) 59/1/96 · G1(31) 60/2/112 · B1(35) 62/1/84 · D2(38) 63/1/96
```
Dauer: alle 4 Takte 8,9 s · kurz (≤ 8 s) T1, T2, T4 = 6,7 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,9 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.5,36,0.88],[0.5,0.25,36,0.66],[0.75,0.25,48,0.76],[1,0.5,36,0.88],[1.5,0.25,36,0.66],[1.75,0.25,48,0.76],[2,0.5,36,0.88],[2.5,0.25,36,0.66],[2.75,0.25,43,0.76],[3,0.5,36,0.88],[3.5,0.25,39,0.66],[3.75,0.25,43,0.76],[4,0.5,32,0.88],[4.5,0.25,32,0.66],[4.75,0.25,44,0.76],[5,0.5,32,0.88],[5.5,0.25,32,0.66],[5.75,0.25,44,0.76],[6,0.5,32,0.88],[6.5,0.25,32,0.66],[6.75,0.25,39,0.76],[7,0.5,32,0.88],[7.5,0.25,36,0.66],[7.75,0.25,39,0.76],[8,0.5,34,0.88],[8.5,0.25,34,0.66],[8.75,0.25,46,0.76],[9,0.5,34,0.88],[9.5,0.25,34,0.66],[9.75,0.25,41,0.76],[10,0.5,31,0.88],[10.5,0.25,31,0.66],[10.75,0.25,43,0.76],[11,0.5,31,0.88],[11.5,0.25,35,0.66],[11.75,0.25,38,0.76]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,0.5,36,0.88],[0.5,0.25,36,0.66],[0.75,0.25,48,0.76],[1,0.5,36,0.88],[1.5,0.25,36,0.66],[1.75,0.25,48,0.76],[2,0.5,36,0.88],[2.5,0.25,36,0.66],[2.75,0.25,43,0.76],[3,0.5,36,0.88],[3.5,0.25,39,0.66],[3.75,0.25,43,0.76],[4,0.5,32,0.88],[4.5,0.25,32,0.66],[4.75,0.25,44,0.76],[5,0.5,32,0.88],[5.5,0.25,32,0.66],[5.75,0.25,44,0.76],[6,0.5,32,0.88],[6.5,0.25,32,0.66],[6.75,0.25,39,0.76],[7,0.5,32,0.88],[7.5,0.25,36,0.66],[7.75,0.25,39,0.76],[8,0.5,39,0.88],[8.5,0.25,39,0.66],[8.75,0.25,51,0.76],[9,0.5,39,0.88],[9.5,0.25,39,0.66],[9.75,0.25,51,0.76],[10,0.5,39,0.88],[10.5,0.25,39,0.66],[10.75,0.25,46,0.76],[11,0.5,39,0.88],[11.5,0.25,43,0.66],[11.75,0.25,46,0.76],[12,0.5,34,0.88],[12.5,0.25,34,0.66],[12.75,0.25,46,0.76],[13,0.5,34,0.88],[13.5,0.25,34,0.66],[13.75,0.25,41,0.76],[14,0.5,31,0.88],[14.5,0.25,31,0.66],[14.75,0.25,43,0.76],[15,0.5,31,0.88],[15.5,0.25,35,0.66],[15.75,0.25,38,0.76]]`
- **Abstand:** Galopp-Rhythmus ist ein Allerwelts-Muster (Metal, Italo, Synthwave).
- **Karte:** „Galoppierender Bass mit Biss – erinnert an epische, dunkle Synthwave (Stil-Vermutung Gunship).“

---

### 5.5 Kavinsky (`vorbild: kavinsky`)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| „Nightcall“: Strophe mit Vocoder; geschichteter Arp mit 80er-Chorus | WAHRSCHEINLICH (eine Sekundärquelle, übernommen aus R6; K-R1) | Reverb Machine „How Kavinsky Created Nightcall“ |
| Der Analyse-Autor baut den Arp mit einer Juno-Emulation nach und hält einen echten Juno-60 für unwahrscheinlich | WAHRSCHEINLICH (Meinung des Analyse-Autors) | Reverb Machine |
| Kavinsky habe nach eigener Aussage keine analogen Keyboards (also Software) | WAHRSCHEINLICH (Zitat nur in der Sekundärquelle) | Reverb Machine |
| Gedächtnis: Vincent Belorgey; „Nightcall“ (2010) mit Gesang von Lovefoxxx, mitproduziert von Guy-Manuel de Homem-Christo; Filmmusik zu „Drive“ (2011); Album „OutRun“ (2013) | UNBELEGT (Gedächtnis) | – |

**Stil-Merkmale (eK, UNBELEGT):** ≈ 90–100 BPM, Moll, Achtel-Oktav-Bass, Arp mit Chorus und Echo, dunkel-glänzende Fläche, Vocoder-Stimme.

#### KV1 Hörprobe für R6 N35 „Nachtfahrt-Bass“ – Rolle Bass · VA

- **Rezept:** unverändert aus R6 (Säge + Säge −1 Okt 70 %, LP24 500 Hz Res 20 %, Filter-Hk +20 HT D 0,2 S 30 %, mono, Pumpen 30 %).
- **Vorbild (ⓘ):** Achtel-Oktav-Bass der Retrowave (Technik UNBELEGT, eK).
- **Lage / Rolle:** F1–E3 (29–52). LAGE-Klammer **hoch E3**.
- **Hörprobe** (100 BPM, a-Moll, Am | F | C | G → E, Achtel-Oktaven mit Durchgang am Taktende, Takt 4 über E-Dur zurück):
```
Tempo 100 BPM · 4 Takte · Akkorde: Am | F | C | G → E
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A1(33) 0/2/100 · A2(45) 2/2/84 · A1(33) 4/2/100 · A2(45) 6/2/84 · A1(33) 8/2/100 · A2(45) 10/2/84 · A1(33) 12/2/100 · G2(43) 14/2/84
T2: F1(29) 16/2/100 · F2(41) 18/2/84 · F1(29) 20/2/100 · F2(41) 22/2/84 · F1(29) 24/2/100 · F2(41) 26/2/84 · E2(40) 28/2/100 · F2(41) 30/2/84
T3: C2(36) 32/2/100 · C3(48) 34/2/84 · C2(36) 36/2/100 · C3(48) 38/2/84 · C2(36) 40/2/100 · C3(48) 42/2/84 · B1(35) 44/2/100 · C2(36) 46/2/84
T4: G1(31) 48/2/94 · G2(43) 50/2/97 · G1(31) 52/2/100 · G2(43) 54/2/103 · E2(40) 56/2/106 · E3(52) 58/2/109 · Ab2(44) 60/2/112 · B2(47) 62/2/115
```
Dauer: alle 4 Takte 9,6 s · kurz (≤ 8 s) T1, T2, T4 = 7,2 s · ganz (≤ 16 s) T1, T2, T3, T4 = 9,6 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.5,33,0.79],[0.5,0.5,45,0.66],[1,0.5,33,0.79],[1.5,0.5,45,0.66],[2,0.5,33,0.79],[2.5,0.5,45,0.66],[3,0.5,33,0.79],[3.5,0.5,43,0.66],[4,0.5,29,0.79],[4.5,0.5,41,0.66],[5,0.5,29,0.79],[5.5,0.5,41,0.66],[6,0.5,29,0.79],[6.5,0.5,41,0.66],[7,0.5,40,0.79],[7.5,0.5,41,0.66],[8,0.5,31,0.74],[8.5,0.5,43,0.76],[9,0.5,31,0.79],[9.5,0.5,43,0.81],[10,0.5,40,0.83],[10.5,0.5,52,0.86],[11,0.5,44,0.88],[11.5,0.5,47,0.91]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,0.5,33,0.79],[0.5,0.5,45,0.66],[1,0.5,33,0.79],[1.5,0.5,45,0.66],[2,0.5,33,0.79],[2.5,0.5,45,0.66],[3,0.5,33,0.79],[3.5,0.5,43,0.66],[4,0.5,29,0.79],[4.5,0.5,41,0.66],[5,0.5,29,0.79],[5.5,0.5,41,0.66],[6,0.5,29,0.79],[6.5,0.5,41,0.66],[7,0.5,40,0.79],[7.5,0.5,41,0.66],[8,0.5,36,0.79],[8.5,0.5,48,0.66],[9,0.5,36,0.79],[9.5,0.5,48,0.66],[10,0.5,36,0.79],[10.5,0.5,48,0.66],[11,0.5,35,0.79],[11.5,0.5,36,0.66],[12,0.5,31,0.74],[12.5,0.5,43,0.76],[13,0.5,31,0.79],[13.5,0.5,43,0.81],[14,0.5,40,0.83],[14.5,0.5,52,0.86],[15,0.5,44,0.88],[15.5,0.5,47,0.91]]`
- **Abstand:** Oktav-Achtel sind Allerwelts-Technik (Disco, Italo, Synthwave); Akkordfolge i–VI–III–VII.
- **Karte:** „Pumpender Oktav-Bass für Nachtfahrten – erinnert an französische Retrowave (Stil Kavinsky).“

#### KV2 Hörprobe für R6 N33 „Neon-Arp“ – Rolle Sequenz · VA

- **Rezept:** unverändert aus R6 (Puls 50 % + Säge +12 ct 60 %, LP24 2,2 kHz, Filter-Hk +18 HT D 0,15 S 20 %, Amp D 0,25 S 30 %, Chorus I+II, Echo 1/8 punktiert 25 %).
- **Vorbild (ⓘ):** geschichteter Arp mit 80er-Chorus, nachgebaut mit Juno-Emulation (WAHRSCHEINLICH).
- **Lage / Rolle:** F3–C5 (53–72). LAGE-Klammer **F3–C5**.
- **Hörprobe** (100 BPM, a-Moll wie KV1, Achtel-Arp über zwei Oktaven, Takt 4 mit G#: Wendung nach E-Dur):
```
Tempo 100 BPM · 4 Takte · Akkorde: Am | F | C | G → E
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A3(57) 0/2/100 · E4(64) 2/2/84 · C4(60) 4/2/100 · A4(69) 6/2/84 · E4(64) 8/2/100 · C5(72) 10/2/84 · A4(69) 12/2/100 · E4(64) 14/2/84
T2: F3(53) 16/2/100 · C4(60) 18/2/84 · A3(57) 20/2/100 · F4(65) 22/2/84 · C4(60) 24/2/100 · A4(69) 26/2/84 · F4(65) 28/2/100 · C4(60) 30/2/84
T3: G3(55) 32/2/100 · E4(64) 34/2/84 · C4(60) 36/2/100 · G4(67) 38/2/84 · E4(64) 40/2/100 · C5(72) 42/2/84 · G4(67) 44/2/100 · E4(64) 46/2/84
T4: G3(55) 48/2/92 · D4(62) 50/2/94 · B3(59) 52/2/96 · G4(67) 54/2/98 · E4(64) 56/2/100 · B4(71) 58/2/102 · Ab4(68) 60/2/104 · E4(64) 62/2/106
```
Dauer: alle 4 Takte 9,6 s · kurz (≤ 8 s) T1, T2, T4 = 7,2 s · ganz (≤ 16 s) T1, T2, T3, T4 = 9,6 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.5,57,0.79],[0.5,0.5,64,0.66],[1,0.5,60,0.79],[1.5,0.5,69,0.66],[2,0.5,64,0.79],[2.5,0.5,72,0.66],[3,0.5,69,0.79],[3.5,0.5,64,0.66],[4,0.5,53,0.79],[4.5,0.5,60,0.66],[5,0.5,57,0.79],[5.5,0.5,65,0.66],[6,0.5,60,0.79],[6.5,0.5,69,0.66],[7,0.5,65,0.79],[7.5,0.5,60,0.66],[8,0.5,55,0.72],[8.5,0.5,62,0.74],[9,0.5,59,0.76],[9.5,0.5,67,0.77],[10,0.5,64,0.79],[10.5,0.5,71,0.8],[11,0.5,68,0.82],[11.5,0.5,64,0.83]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,0.5,57,0.79],[0.5,0.5,64,0.66],[1,0.5,60,0.79],[1.5,0.5,69,0.66],[2,0.5,64,0.79],[2.5,0.5,72,0.66],[3,0.5,69,0.79],[3.5,0.5,64,0.66],[4,0.5,53,0.79],[4.5,0.5,60,0.66],[5,0.5,57,0.79],[5.5,0.5,65,0.66],[6,0.5,60,0.79],[6.5,0.5,69,0.66],[7,0.5,65,0.79],[7.5,0.5,60,0.66],[8,0.5,55,0.79],[8.5,0.5,64,0.66],[9,0.5,60,0.79],[9.5,0.5,67,0.66],[10,0.5,64,0.79],[10.5,0.5,72,0.66],[11,0.5,67,0.79],[11.5,0.5,64,0.66],[12,0.5,55,0.72],[12.5,0.5,62,0.74],[13,0.5,59,0.76],[13.5,0.5,67,0.77],[14,0.5,64,0.79],[14.5,0.5,71,0.8],[15,0.5,68,0.82],[15.5,0.5,64,0.83]]`
- **Abstand:** gebrochene Dreiklänge; das punktierte Echo füllt die Lücken (Technik).
- **Karte:** „Glänzender Arp mit Chorus und punktiertem Echo – erinnert an nächtliche Retrowave (Stil Kavinsky).“

---

### 5.6 Carpenter Brut (`vorbild: carpenter-brut`)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| „distorted synths, crushing drums“ | BELEGT laut R6 (mehrere Artikel, SE) | MetalSucks; Louder; The Playground |
| Nach eigener Aussage „keine Gitarren außer ein paar Soli“ | BELEGT laut R6 (Interview, SE) | Louder bzw. The Playground (welcher genau, notierte R6 nicht) |
| Frühwerk mit „John Carpenter synth lines“ | WAHRSCHEINLICH (R6, SE) | s. o. |
| Geräte | **UNBELEGT** | – |
| Gedächtnis: Franck Hueso (Frankreich); „Trilogy“, „Leather Teeth“ (2018); Titel „Turbo Killer“, „Roller Mobster“ | UNBELEGT (Gedächtnis) | – |

**Stil-Merkmale:** Darksynth, ≈ 110–130 BPM, Moll mit phrygischer Wendung und harmonisch Moll, verzerrte 16tel-Bässe, Metal-artige Drums, Synth-Leads und vereinzelt echte Gitarrensoli (Zerre/Gitarre BELEGT, Rest UNBELEGT, eK).

#### CB1 Hörprobe für R6 N39 „Dunkelfahrt-Bass“ – Rolle Bass · VA (gemessen [g] in R6)

- **Rezept:** unverändert aus R6 (Säge Uni 3 + Säge −1 Okt 60 %, LP24 900 Hz Res 30 %, **Filter-Drive 10 %, Spur-Drive 70 %**).
- **Vorbild (ⓘ):** verzerrte Synths des Darksynth (Stil BELEGT, Werte Entwurf; K-R6).
- **Lage / Rolle:** A1–Eb3 (33–51). LAGE-Klammer **hoch Eb3**.
- **Hörprobe** (120 BPM, d-Moll, 16tel mit Oktavsprüngen; Takt 2 Eb über D = phrygisch; Takt 4 über A-Dur mit C#):
```
Tempo 120 BPM · 4 Takte · Akkorde: Dm | Eb | Dm | C → A
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D2(38) 0/1/108 · D2(38) 1/1/78 · D3(50) 2/1/90 · D2(38) 3/1/78 · D2(38) 4/1/108 · D2(38) 5/1/78 · D3(50) 6/1/90 · D2(38) 7/1/78 · D2(38) 8/1/104 · D2(38) 9/1/78 · D3(50) 10/1/90 · D2(38) 11/1/78 · F2(41) 12/1/108 · D2(38) 13/1/78 · D3(50) 14/1/90 · C3(48) 15/1/78
T2: Eb2(39) 16/1/108 · Eb2(39) 17/1/78 · Eb3(51) 18/1/90 · Eb2(39) 19/1/78 · Eb2(39) 20/1/108 · Eb2(39) 21/1/78 · Eb3(51) 22/1/90 · Eb2(39) 23/1/78 · Eb2(39) 24/1/104 · Eb2(39) 25/1/78 · Eb3(51) 26/1/90 · Eb2(39) 27/1/78 · G2(43) 28/1/108 · Eb2(39) 29/1/78 · Eb3(51) 30/1/90 · D3(50) 31/1/78
T3: D2(38) 32/1/108 · D2(38) 33/1/78 · D3(50) 34/1/90 · D2(38) 35/1/78 · D2(38) 36/1/108 · A2(45) 37/1/78 · D3(50) 38/1/90 · D2(38) 39/1/78 · D2(38) 40/1/104 · D2(38) 41/1/78 · D3(50) 42/1/90 · D2(38) 43/1/78 · A2(45) 44/1/108 · D2(38) 45/1/78 · F2(41) 46/1/90 · D2(38) 47/1/78
T4: C2(36) 48/1/108 · C2(36) 49/1/78 · C3(48) 50/1/90 · C2(36) 51/1/78 · C2(36) 52/1/108 · C2(36) 53/1/78 · C3(48) 54/1/90 · C2(36) 55/1/78 · A1(33) 56/1/112 · A1(33) 57/1/86 · A2(45) 58/1/98 · A1(33) 59/1/86 · C#2(37) 60/1/116 · E2(40) 61/1/86 · A2(45) 62/1/98 · C#3(49) 63/1/86
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.25,38,0.85],[0.25,0.25,38,0.61],[0.5,0.25,50,0.71],[0.75,0.25,38,0.61],[1,0.25,38,0.85],[1.25,0.25,38,0.61],[1.5,0.25,50,0.71],[1.75,0.25,38,0.61],[2,0.25,38,0.82],[2.25,0.25,38,0.61],[2.5,0.25,50,0.71],[2.75,0.25,38,0.61],[3,0.25,41,0.85],[3.25,0.25,38,0.61],[3.5,0.25,50,0.71],[3.75,0.25,48,0.61],[4,0.25,39,0.85],[4.25,0.25,39,0.61],[4.5,0.25,51,0.71],[4.75,0.25,39,0.61],[5,0.25,39,0.85],[5.25,0.25,39,0.61],[5.5,0.25,51,0.71],[5.75,0.25,39,0.61],[6,0.25,39,0.82],[6.25,0.25,39,0.61],[6.5,0.25,51,0.71],[6.75,0.25,39,0.61],[7,0.25,43,0.85],[7.25,0.25,39,0.61],[7.5,0.25,51,0.71],[7.75,0.25,50,0.61],[8,0.25,38,0.85],[8.25,0.25,38,0.61],[8.5,0.25,50,0.71],[8.75,0.25,38,0.61],[9,0.25,38,0.85],[9.25,0.25,45,0.61],[9.5,0.25,50,0.71],[9.75,0.25,38,0.61],[10,0.25,38,0.82],[10.25,0.25,38,0.61],[10.5,0.25,50,0.71],[10.75,0.25,38,0.61],[11,0.25,45,0.85],[11.25,0.25,38,0.61],[11.5,0.25,41,0.71],[11.75,0.25,38,0.61],[12,0.25,36,0.85],[12.25,0.25,36,0.61],[12.5,0.25,48,0.71],[12.75,0.25,36,0.61],[13,0.25,36,0.85],[13.25,0.25,36,0.61],[13.5,0.25,48,0.71],[13.75,0.25,36,0.61],[14,0.25,33,0.88],[14.25,0.25,33,0.68],[14.5,0.25,45,0.77],[14.75,0.25,33,0.68],[15,0.25,37,0.91],[15.25,0.25,40,0.68],[15.5,0.25,45,0.77],[15.75,0.25,49,0.68]]`
- **Abstand:** 16tel-Grundton mit Oktave ist Allerwelts-Technik (EBM, Darksynth).
- **Karte:** „Verzerrter 16tel-Bass mit Oktavsprüngen – erinnert an Darksynth (Stil Carpenter Brut).“

#### CB2 Hörprobe für R6 N40 „Höllenfahrt-Lead“ – Rolle Lead · VA

- **Rezept:** unverändert aus R6 (2 Sägen +7 ct, Uni 3, LP24 3,5 kHz, Legato Glide 40 ms, Vibrato verzögert, Spur-Drive 60 %, Echo 1/8). **Tag korrigiert** (K-R5).
- **Vorbild (ⓘ):** verzerrter Synth-Lead (Entwurf); vereinzelt echte Gitarrensoli beim Vorbild (BELEGT laut R6).
- **Lage / Rolle:** C#5–A5 (73–81). LAGE-Klammer **tief C5**.
- **Hörprobe** (120 BPM, d-Moll, lange Töne, Takt 4 harmonisch Moll C# und schneller 16tel-Lauf D–A):
```
Tempo 120 BPM · 4 Takte · Akkorde: Dm | Eb | Dm | A
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D5(74) 0/6/104 · E5(76) 6/2/92 · F5(77) 8/6/104 · E5(76) 14/2/90
T2: G5(79) 16/6/106 · F5(77) 22/2/92 · Eb5(75) 24/4/98 · D5(74) 28/4/94
T3: A5(81) 32/8/110 · G5(79) 40/2/94 · F5(77) 42/2/92 · E5(76) 44/2/92 · F5(77) 46/2/96
T4: E5(76) 48/4/100 · C#5(73) 52/4/98 · D5(74) 56/1/96 · E5(76) 57/1/98 · F5(77) 58/1/100 · G5(79) 59/1/104 · A5(81) 60/4/116
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,1.5,74,0.82],[1.5,0.5,76,0.72],[2,1.5,77,0.82],[3.5,0.5,76,0.71],[4,1.5,79,0.83],[5.5,0.5,77,0.72],[6,1,75,0.77],[7,1,74,0.74],[8,2,81,0.87],[10,0.5,79,0.74],[10.5,0.5,77,0.72],[11,0.5,76,0.72],[11.5,0.5,77,0.76],[12,1,76,0.79],[13,1,73,0.77],[14,0.25,74,0.76],[14.25,0.25,76,0.77],[14.5,0.25,77,0.79],[14.75,0.25,79,0.82],[15,1,81,0.91]]`
- **Abstand:** Tonleiter-Lauf und Leitton sind Allgemeingut (Metal, Klassik).
- **Karte:** „Schreiender Lead mit Zerre und Lauf – erinnert an Darksynth (Stil Carpenter Brut).“

#### CB3 „Raserei-Kit“ (neu) – Rolle Drums · Drum-Synth

- **Vorbild (ⓘ):** „crushing drums“ (Stil BELEGT laut R6; Klangwerte Entwurf).
- **Kit-Rezept (Abweichungen von `DEFAULTS`):**
  - KICK: `{tLvl 1, frq 52, pAmt 22, pDec .025, tDec .28, cLvl .6, cTyp 3, drv .55}` – harter Klick + Zerre, kurz, damit schnelle Kick-Folgen nicht matschen.
  - SNARE: `{tLvl .9, frq 180, tDec .14, nLvl 1.3, nTyp 'bandpass', nFrq 2600, nQ .6, nHp 800, nDec .26, drv .35, sGate .9}`
  - HH ZU: `{mLvl .5, mTun 1.2, mHp 8000, mDec .045, nLvl .6, nTyp 'highpass', nFrq 9000, nDec .04}`
  - TOM TIEF: `{tLvl 1, wav 'triangle', frq 80, pAmt 10, pDec .3, tDec .5, drv .3, sGate .5}`
  - BECKEN: `{mLvl 1, mLo .8, mTun 1.1, mHp 3500, mDec 2.2, drv .2}`
  - Kit-Bus: `{gate .28, gateLvl 5, room 1.0}`
- **Hörprobe** (120 BPM, Kick-Gruppen wie bei Doppel-Bassdrum, Becken auf 1 von Takt 1 und 3, Takt 4 16tel-Kick + Tom-Fill):
```
Tempo 120 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK     | x..x..x.x..x..x. | x..x..x.x..x.xx. | x..x..x.x..x..x. | x.x.x.x.xxxxxxxx
SNARE    | ....x.......x... | ....x.......x... | ....x.......x..x | ....x.......x.xx
HH ZU    | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.x.x. | x.x.x.x.........
TOM TIEF | ................ | ................ | ................ | ........xx.x....
BECKEN   | x............... | ................ | x............... | ................
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s
- **Abstand:** Rock-/Metal-Grundmuster, keine Titel-Figur.
- **Karte:** „Harte, verzerrte Drums mit Doppel-Kick – erinnert an Darksynth (Stil Carpenter Brut).“

---

### 5.7 Perturbator (`vorbild: perturbator`)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Geräte | **UNBELEGT** (R6: „Geräte unbelegt“) | – |
| Gedächtnis: James Kent (Paris); „Dangerous Days“ (2014), „The Uncanny Valley“ (2016); Musik in „Hotline Miami“ | UNBELEGT (Gedächtnis) | – |

**Stil-Merkmale (eK, UNBELEGT):** Darksynth, ≈ 100–125 BPM, Moll, 16tel-Arps mit Resonanz, dunkle Horror-Flächen, Pumpen.

#### PT1 Hörprobe für R6 N41 „Leuchtschrift-Arp“ – Rolle Sequenz · VA

- **Rezept:** unverändert aus R6 (Säge, LP24 800 Hz Res 45 %, Filter-Hk +30 HT D 0,1 S 0, Amp D 0,15 S 20 %, Echo 1/16 20 %, Pumpen 30 %).
- **Vorbild (ⓘ):** dunkler 16tel-Arp (Stil-Vermutung, UNBELEGT).
- **Lage / Rolle:** F3–E5 (53–76). LAGE-Klammer **F3–F5**.
- **Hörprobe** (116 BPM, f-Moll, i–VI–iv–V, Takt 4 C-Dur mit E und Bb = Dominante):
```
Tempo 116 BPM · 4 Takte · Akkorde: Fm | Db | Bbm | C
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: F3(53) 0/1/108 · C4(60) 1/1/78 · F4(65) 2/1/90 · Ab4(68) 3/1/78 · F4(65) 4/1/108 · C4(60) 5/1/78 · Ab3(56) 6/1/90 · C4(60) 7/1/78 · F3(53) 8/1/104 · C4(60) 9/1/78 · F4(65) 10/1/90 · G4(67) 11/1/78 · Ab4(68) 12/1/108 · G4(67) 13/1/78 · F4(65) 14/1/90 · C4(60) 15/1/78
T2: F3(53) 16/1/108 · Ab3(56) 17/1/78 · C#4(61) 18/1/90 · F4(65) 19/1/78 · Ab4(68) 20/1/108 · F4(65) 21/1/78 · C#4(61) 22/1/90 · Ab3(56) 23/1/78 · F3(53) 24/1/104 · Ab3(56) 25/1/78 · C#4(61) 26/1/90 · Eb4(63) 27/1/78 · F4(65) 28/1/108 · Eb4(63) 29/1/78 · C#4(61) 30/1/90 · Ab3(56) 31/1/78
T3: F3(53) 32/1/108 · Bb3(58) 33/1/78 · C#4(61) 34/1/90 · F4(65) 35/1/78 · Bb4(70) 36/1/108 · F4(65) 37/1/78 · C#4(61) 38/1/90 · Bb3(58) 39/1/78 · F3(53) 40/1/104 · Bb3(58) 41/1/78 · C#4(61) 42/1/90 · F4(65) 43/1/78 · C#5(73) 44/1/108 · Bb4(70) 45/1/78 · F4(65) 46/1/90 · C#4(61) 47/1/78
T4: G3(55) 48/1/108 · C4(60) 49/1/78 · E4(64) 50/1/90 · G4(67) 51/1/78 · C5(72) 52/1/108 · G4(67) 53/1/78 · E4(64) 54/1/90 · C4(60) 55/1/78 · E4(64) 56/1/112 · G4(67) 57/1/86 · Bb4(70) 58/1/98 · C5(72) 59/1/86 · E5(76) 60/1/116 · C5(72) 61/1/86 · Bb4(70) 62/1/98 · G4(67) 63/1/86
```
Dauer: alle 4 Takte 8,3 s · kurz (≤ 8 s) T1, T2, T4 = 6,2 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,3 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.25,53,0.85],[0.25,0.25,60,0.61],[0.5,0.25,65,0.71],[0.75,0.25,68,0.61],[1,0.25,65,0.85],[1.25,0.25,60,0.61],[1.5,0.25,56,0.71],[1.75,0.25,60,0.61],[2,0.25,53,0.82],[2.25,0.25,60,0.61],[2.5,0.25,65,0.71],[2.75,0.25,67,0.61],[3,0.25,68,0.85],[3.25,0.25,67,0.61],[3.5,0.25,65,0.71],[3.75,0.25,60,0.61],[4,0.25,53,0.85],[4.25,0.25,56,0.61],[4.5,0.25,61,0.71],[4.75,0.25,65,0.61],[5,0.25,68,0.85],[5.25,0.25,65,0.61],[5.5,0.25,61,0.71],[5.75,0.25,56,0.61],[6,0.25,53,0.82],[6.25,0.25,56,0.61],[6.5,0.25,61,0.71],[6.75,0.25,63,0.61],[7,0.25,65,0.85],[7.25,0.25,63,0.61],[7.5,0.25,61,0.71],[7.75,0.25,56,0.61],[8,0.25,55,0.85],[8.25,0.25,60,0.61],[8.5,0.25,64,0.71],[8.75,0.25,67,0.61],[9,0.25,72,0.85],[9.25,0.25,67,0.61],[9.5,0.25,64,0.71],[9.75,0.25,60,0.61],[10,0.25,64,0.88],[10.25,0.25,67,0.68],[10.5,0.25,70,0.77],[10.75,0.25,72,0.68],[11,0.25,76,0.91],[11.25,0.25,72,0.68],[11.5,0.25,70,0.77],[11.75,0.25,67,0.68]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,0.25,53,0.85],[0.25,0.25,60,0.61],[0.5,0.25,65,0.71],[0.75,0.25,68,0.61],[1,0.25,65,0.85],[1.25,0.25,60,0.61],[1.5,0.25,56,0.71],[1.75,0.25,60,0.61],[2,0.25,53,0.82],[2.25,0.25,60,0.61],[2.5,0.25,65,0.71],[2.75,0.25,67,0.61],[3,0.25,68,0.85],[3.25,0.25,67,0.61],[3.5,0.25,65,0.71],[3.75,0.25,60,0.61],[4,0.25,53,0.85],[4.25,0.25,56,0.61],[4.5,0.25,61,0.71],[4.75,0.25,65,0.61],[5,0.25,68,0.85],[5.25,0.25,65,0.61],[5.5,0.25,61,0.71],[5.75,0.25,56,0.61],[6,0.25,53,0.82],[6.25,0.25,56,0.61],[6.5,0.25,61,0.71],[6.75,0.25,63,0.61],[7,0.25,65,0.85],[7.25,0.25,63,0.61],[7.5,0.25,61,0.71],[7.75,0.25,56,0.61],[8,0.25,53,0.85],[8.25,0.25,58,0.61],[8.5,0.25,61,0.71],[8.75,0.25,65,0.61],[9,0.25,70,0.85],[9.25,0.25,65,0.61],[9.5,0.25,61,0.71],[9.75,0.25,58,0.61],[10,0.25,53,0.82],[10.25,0.25,58,0.61],[10.5,0.25,61,0.71],[10.75,0.25,65,0.61],[11,0.25,73,0.85],[11.25,0.25,70,0.61],[11.5,0.25,65,0.71],[11.75,0.25,61,0.61],[12,0.25,55,0.85],[12.25,0.25,60,0.61],[12.5,0.25,64,0.71],[12.75,0.25,67,0.61],[13,0.25,72,0.85],[13.25,0.25,67,0.61],[13.5,0.25,64,0.71],[13.75,0.25,60,0.61],[14,0.25,64,0.88],[14.25,0.25,67,0.68],[14.5,0.25,70,0.77],[14.75,0.25,72,0.68],[15,0.25,76,0.91],[15.25,0.25,72,0.68],[15.5,0.25,70,0.77],[15.75,0.25,67,0.68]]`
- **Abstand:** gebrochene Akkorde in 16teln; Moll-Dominante ist Allgemeingut.
- **Karte:** „Dunkler, resonanter 16tel-Arp mit Pumpen – erinnert an Darksynth (Stil-Vermutung Perturbator).“

#### PT2 „Mondfinsternis-Fläche“ (neu) – Rolle Fläche · VA

- **Vorbild (ⓘ):** dunkle Horror-Fläche aus verstimmten Sägen (UNBELEGT, eK).
- **Rezept:** `o1uni 5, uniDet .3, uniMix .7, uniWidth .9, o2w 0, o2oct -1, o2fine -6, o2lvl .5, cutoff 700, res .25, drive .25, kt .3, fenv .15, fA .8, fD 2, fS .5, fR 2, aA .6, aD 1.5, aS .9, aR 2.5, ampVel .3, l2shape 1, l2rate .08, analog .3, spread .5, poly 6` · Routen `M('lfo2','cutoff', .05)` (± 6 HT in ≈ 12 s) · fx `{chorus:{mode:'I', mix:.3}, drive .15, rev .5}` · bus `{hall:{decay 5}}`
- **Warum so:** 5 Unisono-Sägen + Säge eine Oktave tiefer = dichter, unruhiger Teppich. Filter tief (700 Hz) und langsam atmend: düster, aber nicht dumpf. Die Cluster-Stimmführung der Hörprobe (Sekunde G–Ab in der Mitte) macht die Unruhe, nicht der Klang allein.
- **Lage / Rolle:** Bb1–C4 (34–60). LAGE-Klammer **Bb1–C4**.
- **Hörprobe** (116 BPM, f-Moll, Fm(add9) | Dbmaj7 | Bbm | Csus4 → C, ganze Takte):
```
Tempo 116 BPM · 4 Takte · Akkorde: Fm(add9) | Dbmaj7 | Bbm | Csus4 → C
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: F2(41) 0/16/86 · C3(48) 0/16/86 · G3(55) 0/16/86 · Ab3(56) 0/16/86
T2: C#2(37) 16/16/86 · Ab2(44) 16/16/86 · F3(53) 16/16/86 · C4(60) 16/16/86
T3: Bb1(34) 32/16/86 · F2(41) 32/16/86 · C#3(49) 32/16/86 · F3(53) 32/16/86
T4: C2(36) 48/8/88 · G2(43) 48/8/88 · F3(53) 48/8/88 · C4(60) 48/8/88 · C2(36) 56/8/94 · G2(43) 56/8/94 · E3(52) 56/8/94 · C4(60) 56/8/94
```
Dauer: alle 4 Takte 8,3 s · kurz (≤ 8 s) T1, T2, T4 = 6,2 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,3 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,4,41,0.68],[0,4,48,0.68],[0,4,55,0.68],[0,4,56,0.68],[4,4,37,0.68],[4,4,44,0.68],[4,4,53,0.68],[4,4,60,0.68],[8,2,36,0.69],[8,2,43,0.69],[8,2,53,0.69],[8,2,60,0.69],[10,2,36,0.74],[10,2,43,0.74],[10,2,52,0.74],[10,2,60,0.74]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,4,41,0.68],[0,4,48,0.68],[0,4,55,0.68],[0,4,56,0.68],[4,4,37,0.68],[4,4,44,0.68],[4,4,53,0.68],[4,4,60,0.68],[8,4,34,0.68],[8,4,41,0.68],[8,4,49,0.68],[8,4,53,0.68],[12,2,36,0.69],[12,2,43,0.69],[12,2,53,0.69],[12,2,60,0.69],[14,2,36,0.74],[14,2,43,0.74],[14,2,52,0.74],[14,2,60,0.74]]`
- **Abstand:** reine Akkordfläche.
- **Karte:** „Düstere, breite Fläche mit Reibung – erinnert an Horror-Synthwave (Stil-Vermutung Perturbator).“

---

### 5.8 Mitch Murder (`vorbild: mitch-murder`, neu)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Geräte, Arbeitsweise | **UNBELEGT** | – |
| Gedächtnis: Johan Bengtsson (Schweden); Musik zu „Kung Fury“ (2015) | UNBELEGT (Gedächtnis) | – |

**Stil-Merkmale (eK, UNBELEGT):** ≈ 105–120 BPM, funkiger 80er-Fernseh- und Action-Sound: Slap-artiger FM-Bass, Bläser-Stöße, Dur/Dorisch.

#### MM1 „Schulterpolster-Slap“ (neu) – Rolle Bass · FM6

- **Vorbild (ⓘ):** Slap-artiger FM-Bass der 80er, aufgebaut aus dem DX7-Werksklang „BASS 1“ (Daten BELEGT; Bezug zu Mitch Murder UNBELEGT).
- **Rezept (`p.fm6`, ROM1A „BASS 1“ umgerechnet):** `alg 16, fb 7, trans 0`
  - OP1 Träger: `OP(1, 99, [95,62,17,58], [99,95,32,0], {rs 7, ks {bp 24, ld 57, rd 14, lc 3, rc 0}})`
  - OP2: `OP(1, 80, [99,20,0,0], [99,0,0,0], {rs 7})`
  - OP3: `OP(1, 99, [88,96,32,30], [79,65,0,0], {vs 3, rs 6})`
  - OP4: `OP(10, 93, [90,42,7,55], [90,30,0,0], {vs 5, rs 5})`
  - OP5: `OP(1, 62, [99,0,0,0], [99,0,0,0], {vs 3, rs 7, ks {bp 40, ld 75, rd 0, lc 0, rc 0}})`
  - OP6 (Feedback): `OP(18, 85, [94,56,24,55], [93,28,0,0], {vs 7, rs 1})`
  - common `{gain -6 (nicht gemessen), mode 1, poly 1}` · fx `{drive .1, rev .05}`
- **Umrechnung (warum so):** Im ROM steht `trans −12` und bei OP1/2/3/5 `coarse 0` (= ×0,5). Damit klingt jede Taste **zwei Oktaven tiefer** als gedrückt; R6 fand genau diese „16-Hz-Falle“ beim Werk „Pop-Bass DX“. Hier sind **alle Verhältnisse verdoppelt** (0 → 1, 5 → 10, 9 → 18) und `trans 0`: Die Verhältnisse untereinander bleiben exakt gleich, der Klang ist identisch, aber man spielt die Töne dort, wo sie klingen. Die Breakpoints der Tastatur-Skalierung sind um 12 Tasten verschoben (36 → 24, 52 → 40), damit sie an derselben klingenden Tonhöhe greifen (**Annahme**: der DX7 rechnet die Skalierung nach der Transposition; UNBELEGT, nicht gemessen). Die Rate-Skalierung (`rs 7`) wirkt dadurch etwas anders – Hüllkurven im Bass minimal langsamer (nicht gemessen). Mono (`mode 1`), damit Geisternoten den vorigen Ton abschneiden.
- **Lage / Rolle:** E1–D3 (28–50). LAGE-Klammer **E1–E3**.
- **Hörprobe** (112 BPM, e-Moll/dorisch: Em7 | A7 | Em7 | C → D; 16tel-Funk mit Oktav-„Pops“ (Anschlag 112) und Geisternoten (70)):
```
Tempo 112 BPM · 4 Takte · Akkorde: Em7 | A7 | Em7 | C → D
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E1(28) 0/2/120 · E1(28) 2/1/70 · E2(40) 3/1/112 · E1(28) 6/1/96 · E2(40) 7/1/112 · G1(31) 8/2/100 · A1(33) 10/1/90 · B1(35) 11/1/95 · E2(40) 12/1/112 · D2(38) 14/1/95 · B1(35) 15/1/85
T2: A1(33) 16/2/120 · A1(33) 18/1/70 · A2(45) 19/1/112 · A1(33) 22/1/96 · A2(45) 23/1/112 · C#2(37) 24/2/100 · E2(40) 26/1/90 · G2(43) 27/1/110 · A2(45) 28/1/100 · G2(43) 30/1/92 · E2(40) 31/1/88
T3: E1(28) 32/2/120 · E2(40) 34/1/112 · E1(28) 35/1/70 · G1(31) 36/1/92 · E2(40) 38/1/112 · D2(38) 39/1/90 · E1(28) 40/2/118 · E2(40) 42/1/110 · B1(35) 44/1/92 · D2(38) 45/1/92 · E2(40) 46/2/105
T4: C2(36) 48/2/118 · C2(36) 50/1/72 · C3(48) 51/1/110 · C2(36) 54/1/90 · G2(43) 55/1/95 · D2(38) 56/2/118 · D2(38) 58/1/72 · D3(50) 59/1/112 · F#2(42) 60/1/100 · A2(45) 61/1/100 · C3(48) 62/1/105 · D3(50) 63/1/114
```
Dauer: alle 4 Takte 8,6 s · kurz (≤ 8 s) T1, T2, T4 = 6,4 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,6 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.5,28,0.94],[0.5,0.25,28,0.55],[0.75,0.25,40,0.88],[1.5,0.25,28,0.76],[1.75,0.25,40,0.88],[2,0.5,31,0.79],[2.5,0.25,33,0.71],[2.75,0.25,35,0.75],[3,0.25,40,0.88],[3.5,0.25,38,0.75],[3.75,0.25,35,0.67],[4,0.5,33,0.94],[4.5,0.25,33,0.55],[4.75,0.25,45,0.88],[5.5,0.25,33,0.76],[5.75,0.25,45,0.88],[6,0.5,37,0.79],[6.5,0.25,40,0.71],[6.75,0.25,43,0.87],[7,0.25,45,0.79],[7.5,0.25,43,0.72],[7.75,0.25,40,0.69],[8,0.5,36,0.93],[8.5,0.25,36,0.57],[8.75,0.25,48,0.87],[9.5,0.25,36,0.71],[9.75,0.25,43,0.75],[10,0.5,38,0.93],[10.5,0.25,38,0.57],[10.75,0.25,50,0.88],[11,0.25,42,0.79],[11.25,0.25,45,0.79],[11.5,0.25,48,0.83],[11.75,0.25,50,0.9]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,0.5,28,0.94],[0.5,0.25,28,0.55],[0.75,0.25,40,0.88],[1.5,0.25,28,0.76],[1.75,0.25,40,0.88],[2,0.5,31,0.79],[2.5,0.25,33,0.71],[2.75,0.25,35,0.75],[3,0.25,40,0.88],[3.5,0.25,38,0.75],[3.75,0.25,35,0.67],[4,0.5,33,0.94],[4.5,0.25,33,0.55],[4.75,0.25,45,0.88],[5.5,0.25,33,0.76],[5.75,0.25,45,0.88],[6,0.5,37,0.79],[6.5,0.25,40,0.71],[6.75,0.25,43,0.87],[7,0.25,45,0.79],[7.5,0.25,43,0.72],[7.75,0.25,40,0.69],[8,0.5,28,0.94],[8.5,0.25,40,0.88],[8.75,0.25,28,0.55],[9,0.25,31,0.72],[9.5,0.25,40,0.88],[9.75,0.25,38,0.71],[10,0.5,28,0.93],[10.5,0.25,40,0.87],[11,0.25,35,0.72],[11.25,0.25,38,0.72],[11.5,0.5,40,0.83],[12,0.5,36,0.93],[12.5,0.25,36,0.57],[12.75,0.25,48,0.87],[13.5,0.25,36,0.71],[13.75,0.25,43,0.75],[14,0.5,38,0.93],[14.5,0.25,38,0.57],[14.75,0.25,50,0.88],[15,0.25,42,0.79],[15.25,0.25,45,0.79],[15.5,0.25,48,0.83],[15.75,0.25,50,0.9]]`
- **Abstand:** Slap-Funk-Figuren aus Grundton, Oktave, kleiner Septime sind Allgemeingut.
- **Karte:** „Schnalzender FM-Funk-Bass – erinnert an 80er-Action-Synthwave (Stil-Vermutung Mitch Murder).“

#### MM2 „Krimiserie-Brass“ (neu) – Rolle Akkord/Stab · FM6

- **Vorbild (ⓘ):** DX7-Werksklang „BRASS 1“ als Bläser-Stoß (Daten BELEGT; Bezug zu Mitch Murder UNBELEGT).
- **Rezept (`p.fm6` = ROM1A „BRASS 1“, 1:1):** `alg 22, fb 7, trans 0`
  - OP1 Träger: `OP(0, 98, [72,76,99,71], [99,88,96,0], {det 7, ks {bp 39, ld 0, rd 14, lc 3, rc 3}})`
  - OP2: `OP(0, 86, [62,51,29,71], [82,95,96,0], {det 7, ks {bp 27, ld 0, rd 7, lc 3, rc 1}})`
  - OP3 Träger: `OP(1, 99, [77,76,82,71], [99,98,98,0], {det -2, vs 2})`
  - OP4 Träger: `OP(1, 99, [77,36,41,71], [99,98,98,0], {vs 2})`
  - OP5 Träger: `OP(1, 98, [77,36,41,71], [99,98,98,0], {det 1, vs 2})`
  - OP6 (Feedback, moduliert 3–5): `OP(1, 82, [49,99,28,68], [98,98,91,0], {vs 2, rs 4, ks {bp 39, ld 54, rd 50, lc 1, rc 1}})`
  - common `{gain -8 (nicht gemessen), poly 6}` · fx `{chorus:{mode:'off'}, rev .25, dly .1}`
- **Warum so:** Algorithmus 22 = ein Modulator (OP6) auf drei Trägern → „Blech“; OP1/OP2 ×0,5 geben eine tiefe Oktave darunter. OP6 hat einen langsameren Anstieg (R1 49) als die Träger (77): erst Ton, dann Glanz – das Bläser-„Aufblasen“. Falls die Stöße bei 112 BPM zu weich ansetzen: OP1/OP2 R1 auf 85 (Entwurf).
- **Lage / Rolle:** E4–F#5 (64–78). LAGE-Klammer **E4–G5**.
- **Hörprobe** (112 BPM, gleiche Akkorde wie MM1, Stöße „kurz-kurz-lang“, Takt 4 C → D aufwärts):
```
Tempo 112 BPM · 4 Takte · Akkorde: Em7 | A7 | Em7 | C → D
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E4(64) 0/2/104 · G4(67) 0/2/104 · B4(71) 0/2/104 · E4(64) 3/2/96 · G4(67) 3/2/96 · B4(71) 3/2/96 · F#4(66) 6/6/108 · A4(69) 6/6/108 · D5(74) 6/6/108 · G4(67) 14/2/100 · B4(71) 14/2/100 · E5(76) 14/2/100
T2: E4(64) 16/2/104 · A4(69) 16/2/104 · C#5(73) 16/2/104 · E4(64) 19/2/96 · A4(69) 19/2/96 · C#5(73) 19/2/96 · G4(67) 22/10/108 · C#5(73) 22/10/108 · E5(76) 22/10/108
T3: E4(64) 32/2/104 · G4(67) 32/2/104 · B4(71) 32/2/104 · E4(64) 34/1/92 · G4(67) 34/1/92 · B4(71) 34/1/92 · G4(67) 36/4/106 · B4(71) 36/4/106 · E5(76) 36/4/106 · A4(69) 42/2/98 · C5(72) 42/2/98 · E5(76) 42/2/98 · B4(71) 44/4/104 · D5(74) 44/4/104 · F#5(78) 44/4/104
T4: E4(64) 48/6/104 · G4(67) 48/6/104 · C5(72) 48/6/104 · E4(64) 54/2/94 · G4(67) 54/2/94 · C5(72) 54/2/94 · F#4(66) 56/4/108 · A4(69) 56/4/108 · D5(74) 56/4/108 · A4(69) 60/4/116 · D5(74) 60/4/116 · F#5(78) 60/4/116
```
Dauer: alle 4 Takte 8,6 s · kurz (≤ 8 s) T1, T2, T4 = 6,4 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,6 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.5,64,0.82],[0,0.5,67,0.82],[0,0.5,71,0.82],[0.75,0.5,64,0.76],[0.75,0.5,67,0.76],[0.75,0.5,71,0.76],[1.5,1.5,66,0.85],[1.5,1.5,69,0.85],[1.5,1.5,74,0.85],[3.5,0.5,67,0.79],[3.5,0.5,71,0.79],[3.5,0.5,76,0.79],[4,0.5,64,0.82],[4,0.5,69,0.82],[4,0.5,73,0.82],[4.75,0.5,64,0.76],[4.75,0.5,69,0.76],[4.75,0.5,73,0.76],[5.5,2.5,67,0.85],[5.5,2.5,73,0.85],[5.5,2.5,76,0.85],[8,1.5,64,0.82],[8,1.5,67,0.82],[8,1.5,72,0.82],[9.5,0.5,64,0.74],[9.5,0.5,67,0.74],[9.5,0.5,72,0.74],[10,1,66,0.85],[10,1,69,0.85],[10,1,74,0.85],[11,1,69,0.91],[11,1,74,0.91],[11,1,78,0.91]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,0.5,64,0.82],[0,0.5,67,0.82],[0,0.5,71,0.82],[0.75,0.5,64,0.76],[0.75,0.5,67,0.76],[0.75,0.5,71,0.76],[1.5,1.5,66,0.85],[1.5,1.5,69,0.85],[1.5,1.5,74,0.85],[3.5,0.5,67,0.79],[3.5,0.5,71,0.79],[3.5,0.5,76,0.79],[4,0.5,64,0.82],[4,0.5,69,0.82],[4,0.5,73,0.82],[4.75,0.5,64,0.76],[4.75,0.5,69,0.76],[4.75,0.5,73,0.76],[5.5,2.5,67,0.85],[5.5,2.5,73,0.85],[5.5,2.5,76,0.85],[8,0.5,64,0.82],[8,0.5,67,0.82],[8,0.5,71,0.82],[8.5,0.25,64,0.72],[8.5,0.25,67,0.72],[8.5,0.25,71,0.72],[9,1,67,0.83],[9,1,71,0.83],[9,1,76,0.83],[10.5,0.5,69,0.77],[10.5,0.5,72,0.77],[10.5,0.5,76,0.77],[11,1,71,0.82],[11,1,74,0.82],[11,1,78,0.82],[12,1.5,64,0.82],[12,1.5,67,0.82],[12,1.5,72,0.82],[13.5,0.5,64,0.74],[13.5,0.5,67,0.74],[13.5,0.5,72,0.74],[14,1,66,0.85],[14,1,69,0.85],[14,1,74,0.85],[15,1,69,0.91],[15,1,74,0.91],[15,1,78,0.91]]`
- **Abstand:** Dreiklangs-Stöße ohne Melodie; „kurz-kurz-lang“ ist ein Allerwelts-Bläsermuster.
- **Karte:** „FM-Bläser-Stöße wie aus einer 80er-Krimiserie – erinnert an Retro-Action (Stil-Vermutung Mitch Murder).“

---

### 5.9 Michael Oakley (`vorbild: michael-oakley`, neu)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Geräte, Arbeitsweise | **UNBELEGT** | – |
| Gedächtnis: Sänger und Produzent, aus Schottland stammend, in Kanada tätig (unsicher) | UNBELEGT (Gedächtnis, unsicher) | – |

**Stil-Merkmale (eK, UNBELEGT):** Synthpop mit Gesang im 80er-Stil, ≈ 100–115 BPM, Dur (I–V–vi–IV), glasige Plucks, Gated Drums.

#### MO1 „Glanzzupf“ (neu) – Rolle Pluck/Sequenz · VA

- **Vorbild (ⓘ):** glasiger 80er-Pop-Pluck (UNBELEGT, eK).
- **Rezept:** `o1w 1, o1pw .22, o2w 0, o2oct 1, o2fine 6, o2lvl .3, o3w 3, o3oct 2, o3lvl .15, cutoff 1400, res .1, drive .1, kt .6, fenv .35, fvel .35, fA .001, fD .28, fS .1, fR .25, aA .001, aD .7, aS .1, aR .4, ampVel .5, analog .1, spread .35, poly 6` · fx `{chorus:{mode:'II', mix:.7}, rev .3, dly .3}` · bus `{echo:{mode:'pp', divL:'1/8.', fb .3}}`
- **Warum so:** Schmaler Puls (22 %) = hohler Kern, Sinus zwei Oktaven höher (15 %) = „Glas“, Säge eine Oktave höher leicht verstimmt = Glanz. Unterschied zum Werk „Pop-Pluck“ (Unisono-Säge, Filter 500 Hz, Sustain 0): hier Puls-Kern, offeneres Filter, etwas Sustain, Chorus II (Messung §9 Punkt 5).
- **Lage / Rolle:** F4–A5 (65–81). LAGE-Klammer **F4–C6**.
- **Hörprobe** (108 BPM, C-Dur, I–V–vi–IV, Achtel-Figur um die Akkordtöne, Takt 4 steigt):
```
Tempo 108 BPM · 4 Takte · Akkorde: C | G | Am | F
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E5(76) 0/2/100 · G4(67) 2/2/84 · C5(72) 4/2/100 · G4(67) 6/2/84 · D5(74) 8/2/100 · G4(67) 10/2/84 · C5(72) 12/2/100 · E5(76) 14/2/84
T2: D5(74) 16/2/100 · G4(67) 18/2/84 · B4(71) 20/2/100 · G4(67) 22/2/84 · D5(74) 24/2/100 · B4(71) 26/2/84 · G5(79) 28/2/100 · D5(74) 30/2/84
T3: C5(72) 32/2/100 · A4(69) 34/2/84 · E5(76) 36/2/100 · A4(69) 38/2/84 · C5(72) 40/2/100 · A4(69) 42/2/84 · E5(76) 44/2/100 · A5(81) 46/2/84
T4: C5(72) 48/2/90 · A4(69) 50/2/93 · F4(65) 52/2/96 · A4(69) 54/2/99 · C5(72) 56/2/102 · F5(77) 58/2/105 · G5(79) 60/2/108 · A5(81) 62/2/111
```
Dauer: alle 4 Takte 8,9 s · kurz (≤ 8 s) T1, T2, T4 = 6,7 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,9 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.5,76,0.79],[0.5,0.5,67,0.66],[1,0.5,72,0.79],[1.5,0.5,67,0.66],[2,0.5,74,0.79],[2.5,0.5,67,0.66],[3,0.5,72,0.79],[3.5,0.5,76,0.66],[4,0.5,74,0.79],[4.5,0.5,67,0.66],[5,0.5,71,0.79],[5.5,0.5,67,0.66],[6,0.5,74,0.79],[6.5,0.5,71,0.66],[7,0.5,79,0.79],[7.5,0.5,74,0.66],[8,0.5,72,0.71],[8.5,0.5,69,0.73],[9,0.5,65,0.76],[9.5,0.5,69,0.78],[10,0.5,72,0.8],[10.5,0.5,77,0.83],[11,0.5,79,0.85],[11.5,0.5,81,0.87]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,0.5,76,0.79],[0.5,0.5,67,0.66],[1,0.5,72,0.79],[1.5,0.5,67,0.66],[2,0.5,74,0.79],[2.5,0.5,67,0.66],[3,0.5,72,0.79],[3.5,0.5,76,0.66],[4,0.5,74,0.79],[4.5,0.5,67,0.66],[5,0.5,71,0.79],[5.5,0.5,67,0.66],[6,0.5,74,0.79],[6.5,0.5,71,0.66],[7,0.5,79,0.79],[7.5,0.5,74,0.66],[8,0.5,72,0.79],[8.5,0.5,69,0.66],[9,0.5,76,0.79],[9.5,0.5,69,0.66],[10,0.5,72,0.79],[10.5,0.5,69,0.66],[11,0.5,76,0.79],[11.5,0.5,81,0.66],[12,0.5,72,0.71],[12.5,0.5,69,0.73],[13,0.5,65,0.76],[13.5,0.5,69,0.78],[14,0.5,72,0.8],[14.5,0.5,77,0.83],[15,0.5,79,0.85],[15.5,0.5,81,0.87]]`
- **Abstand:** umspielte Akkordtöne ohne Kontur eines bekannten Hooks.
- **Karte:** „Glasiger Pluck mit punktiertem Echo – erinnert an Synthwave-Pop mit Gesang (Stil-Vermutung Michael Oakley).“

#### MO2 Hörprobe für Werk „Gated 84“ – Rolle Drums (Werks-Kit V0a Z. 7320)

- **Rezept:** Werk unverändert (Linn-artige Kick, Gated Snare, Simmons-Toms, alles durch den Gate-Hall 0,34 s).
- **Vorbild (ⓘ):** 80er-Pop-Beat mit Gate-Hall (Technik allgemein, eK). Tag nur `retrowave`.
- **Hörprobe** (108 BPM, Kick 1 + 3 + 3-und, Gated Snare 2/4, Takt 4 Tom-Fill hoch → tief):
```
Tempo 108 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK      | x.......x.x..... | x.......x....... | x.......x.x..... | x.......x.......
SNARE     | ....x.......x... | ....x.......x... | ....x.......x... | ....x...........
HH ZU     | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.x.xx | x.x.x.x.x.x.x.x. | x.x.x.x.........
TOM HOCH  | ................ | ................ | ................ | ........xx......
TOM MITTE | ................ | ................ | ................ | ..........xx....
TOM TIEF  | ................ | ................ | ................ | ............xx.x
BECKEN    | x............... | ................ | ................ | ................
```
Dauer: alle 4 Takte 8,9 s · kurz (≤ 8 s) T1, T2, T4 = 6,7 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,9 s
- **Karte:** „80er-Beat mit abgeschnittenem Hall auf Snare und Toms.“

---

### 5.10 Lazerhawk (`vorbild: lazerhawk`, neu)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Geräte, Arbeitsweise | **UNBELEGT** | – |
| Gedächtnis: Garrett Hays (Austin, Texas); Alben „Redline“ (2010), „Skull and Shark“ (2013) | UNBELEGT (Gedächtnis) | – |

**Stil-Merkmale (eK, UNBELEGT):** Outrun, ≈ 110–120 BPM, Moll, Sync-Leads, treibende Achtel-/16tel-Bässe mit Echo.

#### LH1 Hörprobe für Werk „Sync-Lead“ – Rolle Lead · VA (V0a Z. 5707)

- **Rezept:** Werk unverändert (Osz. 2 an Osz. 1 gekoppelt, Hüllkurve 2 fegt die Osz.-2-Tonhöhe, Mod-Rad fegt von Hand). Ein eigener „Laser“-Sync-Lead wäre fast gleich und wurde verworfen (§9 Punkt 4).
- **Vorbild (ⓘ):** Sync-Lead der Outrun-Synthwave (Technik allgemein, eK).
- **Lage / Rolle:** B4–D6 (71–86). LAGE-Klammer **tief A4**.
- **Hörprobe** (118 BPM, h-Moll, i–VI–III–VII, lange Töne damit das Sync-Fegen hörbar wird, Takt 4 abwärts zur Terz C# der Dominante):
```
Tempo 118 BPM · 4 Takte · Akkorde: Bm | G | D | A
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: F#5(78) 0/6/104 · E5(76) 6/2/90 · D5(74) 8/4/96 · B4(71) 12/4/92
T2: D5(74) 16/2/94 · E5(76) 18/2/94 · G5(79) 20/8/106 · F#5(78) 28/2/92 · E5(76) 30/2/90
T3: F#5(78) 32/4/98 · A5(81) 36/4/102 · D6(86) 40/6/110 · C#6(85) 46/2/94
T4: B5(83) 48/4/102 · A5(81) 52/2/94 · F#5(78) 54/2/92 · E5(76) 56/4/96 · C#5(73) 60/4/100
```
Dauer: alle 4 Takte 8,1 s · kurz (≤ 8 s) T1, T2, T4 = 6,1 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,1 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,1.5,78,0.82],[1.5,0.5,76,0.71],[2,1,74,0.76],[3,1,71,0.72],[4,0.5,74,0.74],[4.5,0.5,76,0.74],[5,2,79,0.83],[7,0.5,78,0.72],[7.5,0.5,76,0.71],[8,1,83,0.8],[9,0.5,81,0.74],[9.5,0.5,78,0.72],[10,1,76,0.76],[11,1,73,0.79]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,1.5,78,0.82],[1.5,0.5,76,0.71],[2,1,74,0.76],[3,1,71,0.72],[4,0.5,74,0.74],[4.5,0.5,76,0.74],[5,2,79,0.83],[7,0.5,78,0.72],[7.5,0.5,76,0.71],[8,1,78,0.77],[9,1,81,0.8],[10,1.5,86,0.87],[11.5,0.5,85,0.74],[12,1,83,0.8],[13,0.5,81,0.74],[13.5,0.5,78,0.72],[14,1,76,0.76],[15,1,73,0.79]]`
- **Abstand:** eigene Linie; Sync ist eine Klangtechnik.
- **Karte:** „Fegender Sync-Lead – erinnert an Outrun-Synthwave.“

#### LH2 Hörprobe für Werk „Moroder-Puls“ – Rolle Sequenz/Bass · VA (V0a Z. 5809)

- **Rezept:** Werk unverändert (Achtel + Echo 1/16 auf der anderen Seite = Galopp).
- **Vorbild (ⓘ):** Disco-Sequenz der 70er als Wurzel der Outrun-Bässe (eK). Tag nur `retrowave` (und `moroder` wie bisher).
- **Lage / Rolle:** G1–D3 (31–50). LAGE-Klammer **hoch D3**.
- **Hörprobe** (118 BPM, h-Moll wie LH1, Achtel Grundton–Oktave, Takt 4 Arpeggio über A-Dur):
```
Tempo 118 BPM · 4 Takte · Akkorde: Bm | G | D | A
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: B1(35) 0/2/100 · B2(47) 2/2/84 · B1(35) 4/2/100 · B2(47) 6/2/84 · B1(35) 8/2/100 · B2(47) 10/2/84 · A2(45) 12/2/100 · B2(47) 14/2/84
T2: G1(31) 16/2/100 · G2(43) 18/2/84 · G1(31) 20/2/100 · G2(43) 22/2/84 · G1(31) 24/2/100 · G2(43) 26/2/84 · F#2(42) 28/2/100 · G2(43) 30/2/84
T3: D2(38) 32/2/100 · D3(50) 34/2/84 · D2(38) 36/2/100 · D3(50) 38/2/84 · D2(38) 40/2/100 · D3(50) 42/2/84 · C#3(49) 44/2/100 · D3(50) 46/2/84
T4: A1(33) 48/2/92 · A2(45) 50/2/95 · A1(33) 52/2/98 · A2(45) 54/2/101 · C#2(37) 56/2/104 · E2(40) 58/2/107 · A2(45) 60/2/110 · C#3(49) 62/2/113
```
Dauer: alle 4 Takte 8,1 s · kurz (≤ 8 s) T1, T2, T4 = 6,1 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,1 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.5,35,0.79],[0.5,0.5,47,0.66],[1,0.5,35,0.79],[1.5,0.5,47,0.66],[2,0.5,35,0.79],[2.5,0.5,47,0.66],[3,0.5,45,0.79],[3.5,0.5,47,0.66],[4,0.5,31,0.79],[4.5,0.5,43,0.66],[5,0.5,31,0.79],[5.5,0.5,43,0.66],[6,0.5,31,0.79],[6.5,0.5,43,0.66],[7,0.5,42,0.79],[7.5,0.5,43,0.66],[8,0.5,33,0.72],[8.5,0.5,45,0.75],[9,0.5,33,0.77],[9.5,0.5,45,0.8],[10,0.5,37,0.82],[10.5,0.5,40,0.84],[11,0.5,45,0.87],[11.5,0.5,49,0.89]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,0.5,35,0.79],[0.5,0.5,47,0.66],[1,0.5,35,0.79],[1.5,0.5,47,0.66],[2,0.5,35,0.79],[2.5,0.5,47,0.66],[3,0.5,45,0.79],[3.5,0.5,47,0.66],[4,0.5,31,0.79],[4.5,0.5,43,0.66],[5,0.5,31,0.79],[5.5,0.5,43,0.66],[6,0.5,31,0.79],[6.5,0.5,43,0.66],[7,0.5,42,0.79],[7.5,0.5,43,0.66],[8,0.5,38,0.79],[8.5,0.5,50,0.66],[9,0.5,38,0.79],[9.5,0.5,50,0.66],[10,0.5,38,0.79],[10.5,0.5,50,0.66],[11,0.5,49,0.79],[11.5,0.5,50,0.66],[12,0.5,33,0.72],[12.5,0.5,45,0.75],[13,0.5,33,0.77],[13.5,0.5,45,0.8],[14,0.5,37,0.82],[14.5,0.5,40,0.84],[15,0.5,45,0.87],[15.5,0.5,49,0.89]]`
- **Karte:** „Galoppierender Sequenz-Puls durch Echo – Wurzel des Outrun-Basses.“

---

### 5.11 Com Truise (`vorbild: com-truise`, neu)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Geräte, Arbeitsweise | **UNBELEGT** | – |
| Gedächtnis: Seth Haley (USA), Label Ghostly International; Album „Galactic Melt“ (2011); beschreibt den eigenen Stil als „slow-motion funk“ | UNBELEGT (Gedächtnis) | – |

**Stil-Merkmale (eK, UNBELEGT):** Downtempo-Synthwave, ≈ 80–95 BPM, halbes Tempo-Gefühl (Snare auf 3), leiernde, leicht verstimmte Akkorde (Tape-Gefühl), runde Funk-Bässe mit Glide.

#### CT1 „Leierband-Akkord“ (neu) – Rolle Akkord/Fläche · VA

- **Vorbild (ⓘ):** leiernde, verstimmte Synth-Akkorde wie von altem Band (UNBELEGT, eK).
- **Rezept:** `o2w 1, o2pw .4, o2fine -12, o2lvl .7, ftype 1, cutoff 1500, res .1, drive .2, kt .4, fenv .2, fA .01, fD .5, fS .4, fR .4, aA .01, aD .8, aS .75, aR .45, ampVel .4, l2shape 0, l2rate .7, analog .45, spread .4, poly 6` · Routen `M('lfo2','pitch', .0035)` (≈ ±8 ct, 0,7 Hz = „Wow“), `M('rnd','pitch', .002)` (≈ ±5 ct je Note) · fx `{chorus:{mode:'I', mix:.6}, drive .1, rev .3}`
- **Warum so:** Das Leiern kommt aus zwei Quellen: ein langsamer LFO bewegt **alle** Stimmen gemeinsam (wie ein eiernder Bandmotor), der Zufall je Note verstimmt jeden Akkord ein wenig anders. `analog .45` und 12 ct zwischen Säge und Puls machen die Schwebung. Messziel: hörbar, aber ≤ ±10 ct (§9 Punkt 8).
- **Lage / Rolle:** Ab2–D4 (44–62). LAGE-Klammer **Ab2–E4**.
- **Hörprobe** (88 BPM, Eb-Dur, Ebmaj7 | Cm9 | Abmaj7 | Bb7sus4 → Bb7, Anschläge auf 1, 2-und und 3-e-und):
```
Tempo 88 BPM · 4 Takte · Akkorde: Ebmaj7 | Cm9 | Abmaj7 | Bb7sus4 → Bb7
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: Eb3(51) 0/3/100 · G3(55) 0/3/100 · Bb3(58) 0/3/100 · D4(62) 0/3/100 · Eb3(51) 6/4/90 · G3(55) 6/4/90 · Bb3(58) 6/4/90 · D4(62) 6/4/90 · Eb3(51) 11/3/86 · G3(55) 11/3/86 · Bb3(58) 11/3/86 · D4(62) 11/3/86
T2: C3(48) 16/3/100 · Eb3(51) 16/3/100 · G3(55) 16/3/100 · Bb3(58) 16/3/100 · D4(62) 16/3/100 · C3(48) 22/4/90 · Eb3(51) 22/4/90 · G3(55) 22/4/90 · Bb3(58) 22/4/90 · D4(62) 22/4/90 · C3(48) 27/3/86 · Eb3(51) 27/3/86 · G3(55) 27/3/86 · Bb3(58) 27/3/86 · D4(62) 27/3/86
T3: Ab2(44) 32/3/100 · C3(48) 32/3/100 · Eb3(51) 32/3/100 · G3(55) 32/3/100 · Ab2(44) 38/4/90 · C3(48) 38/4/90 · Eb3(51) 38/4/90 · G3(55) 38/4/90 · Ab2(44) 43/3/86 · C3(48) 43/3/86 · Eb3(51) 43/3/86 · G3(55) 43/3/86
T4: Bb2(46) 48/6/98 · Eb3(51) 48/6/98 · F3(53) 48/6/98 · Ab3(56) 48/6/98 · Bb2(46) 54/8/94 · D3(50) 54/8/94 · F3(53) 54/8/94 · Ab3(56) 54/8/94
```
Dauer: alle 4 Takte 10,9 s · kurz (≤ 8 s) T1, T4 = 5,5 s · ganz (≤ 16 s) T1, T2, T3, T4 = 10,9 s
aud-Daten kurz (Spec v3 §12.8, `len 2`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.75,51,0.79],[0,0.75,55,0.79],[0,0.75,58,0.79],[0,0.75,62,0.79],[1.5,1,51,0.71],[1.5,1,55,0.71],[1.5,1,58,0.71],[1.5,1,62,0.71],[2.75,0.75,51,0.68],[2.75,0.75,55,0.68],[2.75,0.75,58,0.68],[2.75,0.75,62,0.68],[4,1.5,46,0.77],[4,1.5,51,0.77],[4,1.5,53,0.77],[4,1.5,56,0.77],[5.5,2,46,0.74],[5.5,2,50,0.74],[5.5,2,53,0.74],[5.5,2,56,0.74]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,0.75,51,0.79],[0,0.75,55,0.79],[0,0.75,58,0.79],[0,0.75,62,0.79],[1.5,1,51,0.71],[1.5,1,55,0.71],[1.5,1,58,0.71],[1.5,1,62,0.71],[2.75,0.75,51,0.68],[2.75,0.75,55,0.68],[2.75,0.75,58,0.68],[2.75,0.75,62,0.68],[4,0.75,48,0.79],[4,0.75,51,0.79],[4,0.75,55,0.79],[4,0.75,58,0.79],[4,0.75,62,0.79],[5.5,1,48,0.71],[5.5,1,51,0.71],[5.5,1,55,0.71],[5.5,1,58,0.71],[5.5,1,62,0.71],[6.75,0.75,48,0.68],[6.75,0.75,51,0.68],[6.75,0.75,55,0.68],[6.75,0.75,58,0.68],[6.75,0.75,62,0.68],[8,0.75,44,0.79],[8,0.75,48,0.79],[8,0.75,51,0.79],[8,0.75,55,0.79],[9.5,1,44,0.71],[9.5,1,48,0.71],[9.5,1,51,0.71],[9.5,1,55,0.71],[10.75,0.75,44,0.68],[10.75,0.75,48,0.68],[10.75,0.75,51,0.68],[10.75,0.75,55,0.68],[12,1.5,46,0.77],[12,1.5,51,0.77],[12,1.5,53,0.77],[12,1.5,56,0.77],[13.5,2,46,0.74],[13.5,2,50,0.74],[13.5,2,53,0.74],[13.5,2,56,0.74]]`
- **Abstand:** verschobene Akkord-Anschläge, keine Melodie.
- **Karte:** „Leiernde, verstimmte Akkorde in Zeitlupe – erinnert an Downtempo-Synthwave (Stil-Vermutung Com Truise).“

#### CT2 „Schleich-Funk-Bass“ (neu) – Rolle Bass · VA

- **Vorbild (ⓘ):** runder Funk-Bass mit Gleiten im halben Tempo (UNBELEGT, eK).
- **Rezept:** `o1w 1, o1pw .5, o2w 3, o2lvl .5, subLvl .4, cutoff 380, res .3, drive .25, bass .6, kt .4, fenv .3, fvel .4, fA .005, fD .25, fS .3, fR .1, aA .003, aD .5, aS .8, aR .08, ampVel .5, mode 2, poly 1, glide .06, analog .2, spread 0` · fx `{rev .05}`
- **Warum so:** Rechteck + Sinus + Sub = runder, fetter Kern ohne Schärfe. Legato mit 60 ms Glide: wo sich Töne in der Hörprobe überlappen (je einmal pro Takt), rutscht der Bass.
- **Lage / Rolle:** Eb1–C3 (27–48). LAGE-Klammer **Eb1–Eb3**.
- **Hörprobe** (88 BPM, Eb-Dur wie CT1, synkopierte 16tel, je Takt ein Gleiten abwärts):
```
Tempo 88 BPM · 4 Takte · Akkorde: Ebmaj7 | Cm9 | Abmaj7 | Bb7
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: Eb1(27) 0/3/112 · Eb2(39) 3/1/96 · Bb1(34) 6/3/104 · Eb2(39) 9/1/90 · D2(38) 10/3/96 · Bb1(34) 12/3/100 · G1(31) 15/1/86
T2: C2(36) 16/3/112 · C3(48) 19/1/96 · G1(31) 22/2/100 · C2(36) 25/1/90 · Bb1(34) 26/3/96 · G1(31) 28/3/100 · Bb1(34) 31/1/86
T3: Ab1(32) 32/3/112 · Ab2(44) 35/1/96 · Eb2(39) 38/2/100 · Ab2(44) 41/1/90 · G2(43) 42/3/96 · Eb2(39) 44/3/100 · C2(36) 47/1/86
T4: Bb1(34) 48/3/112 · Bb2(46) 51/1/96 · F2(41) 54/2/100 · Ab2(44) 56/2/98 · Bb2(46) 58/1/96 · Ab2(44) 59/1/90 · F2(41) 60/3/98 · D2(38) 62/2/102
```
Dauer: alle 4 Takte 10,9 s · kurz (≤ 8 s) T1, T4 = 5,5 s · ganz (≤ 16 s) T1, T2, T3, T4 = 10,9 s
aud-Daten kurz (Spec v3 §12.8, `len 2`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.75,27,0.88],[0.75,0.25,39,0.76],[1.5,0.75,34,0.82],[2.25,0.25,39,0.71],[2.5,0.75,38,0.76],[3,0.75,34,0.79],[3.75,0.25,31,0.68],[4,0.75,34,0.88],[4.75,0.25,46,0.76],[5.5,0.5,41,0.79],[6,0.5,44,0.77],[6.5,0.25,46,0.76],[6.75,0.25,44,0.71],[7,0.75,41,0.77],[7.5,0.5,38,0.8]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,0.75,27,0.88],[0.75,0.25,39,0.76],[1.5,0.75,34,0.82],[2.25,0.25,39,0.71],[2.5,0.75,38,0.76],[3,0.75,34,0.79],[3.75,0.25,31,0.68],[4,0.75,36,0.88],[4.75,0.25,48,0.76],[5.5,0.5,31,0.79],[6.25,0.25,36,0.71],[6.5,0.75,34,0.76],[7,0.75,31,0.79],[7.75,0.25,34,0.68],[8,0.75,32,0.88],[8.75,0.25,44,0.76],[9.5,0.5,39,0.79],[10.25,0.25,44,0.71],[10.5,0.75,43,0.76],[11,0.75,39,0.79],[11.75,0.25,36,0.68],[12,0.75,34,0.88],[12.75,0.25,46,0.76],[13.5,0.5,41,0.79],[14,0.5,44,0.77],[14.5,0.25,46,0.76],[14.75,0.25,44,0.71],[15,0.75,41,0.77],[15.5,0.5,38,0.8]]`
- **Abstand:** Funk-Synkopen aus Grundton, Oktave, Quinte sind Allgemeingut.
- **Karte:** „Runder, gleitender Funk-Bass in Zeitlupe – erinnert an Downtempo-Synthwave (Stil-Vermutung Com Truise).“

#### CT3 „Halbzeit-Kit“ (neu) – Rolle Drums · Drum-Synth

- **Kit-Rezept:**
  - KICK: `{tLvl 1, frq 50, pAmt 12, pDec .05, tDec .45, cLvl .2, drv .25}`
  - SNARE: `{tLvl .8, frq 170, tDec .2, nLvl 1, nTyp 'bandpass', nFrq 1800, nQ .5, nDec .3, sRoom .3, drv .2}` – dunkel, mit Raum statt Gate.
  - RIM: `{tLvl 1, wav 'triangle', frq 450, tDec .025, lvl .4}` – leise Geisternoten.
  - HH ZU: `{mLvl .35, mHp 7000, mDec .03, nLvl .5, nTyp 'highpass', nFrq 7000, nDec .035, dyn .8}` · HH OFFEN wie HH ZU mit `mDec .25, nDec .2`
  - Kit-Bus: `{room 1.2, gateLvl 0}`
- **Hörprobe** (88 BPM, Snare auf der 3 = halbes Tempo-Gefühl, dichte 16tel-Hats, Rim-Geisternoten):
```
Tempo 88 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK     | x.....x...x..... | x.....x.....x... | x.....x...x...x. | x.....x...x..x..
SNARE    | ........x....... | ........x....... | ........x....... | ........x.....x.
RIM      | ...x.........x.. | ...x......x..... | ...x.........x.. | ...x............
HH ZU    | x.xxx.xxx.xxx.xx | x.xxx.xxx.xxx.xx | x.xxx.xxx.xxx.xx | x.xxx.xxx.x.....
HH OFFEN | ................ | ..............x. | ................ | ..............x.
```
Dauer: alle 4 Takte 10,9 s · kurz (≤ 8 s) T1, T4 = 5,5 s · ganz (≤ 16 s) T1, T2, T3, T4 = 10,9 s
- **Karte:** „Schwerer Beat im halben Tempo – erinnert an Downtempo-Synthwave.“

---

### 5.12 Le Matos (`vorbild: le-matos`, neu)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Geräte, Arbeitsweise | **UNBELEGT** | – |
| Gedächtnis: Duo aus Montréal; Musik zum Film „Turbo Kid“ (2015) | UNBELEGT (Gedächtnis) | – |

**Stil-Merkmale (eK, UNBELEGT):** Filmmusik-Synthwave, ≈ 100–120 BPM, Moll, große langsam aufgehende Bläser- und Streicherflächen, Fanfaren am Phrasenende.

#### LM1 „Endzeit-Fanfare“ (neu) – Rolle Akkord · VA

- **Vorbild (ⓘ):** Kino-Fanfare aus Synth-Bläsern (UNBELEGT, eK).
- **Rezept:** `o1uni 3, uniDet .2, o2w 0, o2oct 1, o2fine 4, o2lvl .4, o3w 0, o3oct -1, o3lvl .35, cutoff 600, res .15, drive .25, kt .5, fenv .45, fvel .35, fA .35, fD 1.2, fS .55, fR .8, aA .12, aD 1, aS .9, aR .9, ampVel .35, analog .25, spread .5, poly 6` · Routen `M('vel','cutoff', .05)` · fx `{chorus:{mode:'I', mix:.3}, rev .45, dly .1}` · bus `{hall:{decay 4}}`
- **Warum so:** Drei Lagen Säge (−1 Okt, Grundlage mit Unisono 3, +1 Okt) = Orchester-Breite. Filter-Attack 0,35 s gegen Amp-Attack 0,12 s: der Akkord ist erst da und wird dann hell – Bläser-Gestus. Unterschied zum Werk „Weite 82“ (LP12, Filter-Attack 1,1 s, CS-80-Gestus): LP24, Oktav-Schichten, schneller (Messung §9 Punkt 5).
- **Lage / Rolle:** F3–C5 (53–72). LAGE-Klammer **F3–C5**.
- **Hörprobe** (110 BPM, g-Moll, Gm | Eb → Eb6 | Bb | F → D, Takt 4 Dur-Dominante D):
```
Tempo 110 BPM · 4 Takte · Akkorde: Gm | Eb → Eb6 | Bb | F → D
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: G3(55) 0/12/100 · D4(62) 0/12/100 · G4(67) 0/12/100 · Bb4(70) 0/12/100 · G3(55) 12/4/96 · D4(62) 12/4/96 · A4(69) 12/4/96 · C5(72) 12/4/96
T2: G3(55) 16/8/100 · Eb4(63) 16/8/100 · G4(67) 16/8/100 · Bb4(70) 16/8/100 · G3(55) 24/8/98 · Eb4(63) 24/8/98 · G4(67) 24/8/98 · C5(72) 24/8/98
T3: F3(53) 32/12/100 · Bb3(58) 32/12/100 · D4(62) 32/12/100 · F4(65) 32/12/100 · F3(53) 44/4/100 · Bb3(58) 44/4/100 · D4(62) 44/4/100 · Bb4(70) 44/4/100
T4: F3(53) 48/8/102 · A3(57) 48/8/102 · C4(60) 48/8/102 · F4(65) 48/8/102 · F#3(54) 56/8/110 · A3(57) 56/8/110 · D4(62) 56/8/110 · F#4(66) 56/8/110
```
Dauer: alle 4 Takte 8,7 s · kurz (≤ 8 s) T1, T2, T4 = 6,5 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,7 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,3,55,0.79],[0,3,62,0.79],[0,3,67,0.79],[0,3,70,0.79],[3,1,55,0.76],[3,1,62,0.76],[3,1,69,0.76],[3,1,72,0.76],[4,2,55,0.79],[4,2,63,0.79],[4,2,67,0.79],[4,2,70,0.79],[6,2,55,0.77],[6,2,63,0.77],[6,2,67,0.77],[6,2,72,0.77],[8,2,53,0.8],[8,2,57,0.8],[8,2,60,0.8],[8,2,65,0.8],[10,2,54,0.87],[10,2,57,0.87],[10,2,62,0.87],[10,2,66,0.87]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,3,55,0.79],[0,3,62,0.79],[0,3,67,0.79],[0,3,70,0.79],[3,1,55,0.76],[3,1,62,0.76],[3,1,69,0.76],[3,1,72,0.76],[4,2,55,0.79],[4,2,63,0.79],[4,2,67,0.79],[4,2,70,0.79],[6,2,55,0.77],[6,2,63,0.77],[6,2,67,0.77],[6,2,72,0.77],[8,3,53,0.79],[8,3,58,0.79],[8,3,62,0.79],[8,3,65,0.79],[11,1,53,0.79],[11,1,58,0.79],[11,1,62,0.79],[11,1,70,0.79],[12,2,53,0.8],[12,2,57,0.8],[12,2,60,0.8],[12,2,65,0.8],[14,2,54,0.87],[14,2,57,0.87],[14,2,62,0.87],[14,2,66,0.87]]`
- **Abstand:** Akkordfolge i–VI–III–VII–V, gehaltene Akkorde.
- **Karte:** „Aufgehende Synth-Bläser für das Finale – erinnert an Retro-Filmmusik (Stil-Vermutung Le Matos).“

#### LM2 Hörprobe für Werk „Weite 82“ – Rolle Fläche · VA (V0a Z. 5777)

- **Rezept:** Werk unverändert (langsame Filter-Hüllkurve 1,1 s, Hall 6 s).
- **Vorbild (ⓘ):** bisher Vangelis (Werks-Text); hier nur zusätzlich Tag `retrowave`.
- **Lage / Rolle:** C2–D4 (36–62). LAGE-Klammer **C2–D4**.
- **Hörprobe** (76 BPM, g-Moll, Gm(add9) | Ebmaj7 | Cm7 | D7sus4 → D):
```
Tempo 76 BPM · 4 Takte · Akkorde: Gm(add9) | Ebmaj7 | Cm7 | D7sus4 → D
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: G2(43) 0/16/84 · D3(50) 0/16/84 · A3(57) 0/16/84 · Bb3(58) 0/16/84
T2: Eb2(39) 16/16/84 · Bb2(46) 16/16/84 · G3(55) 16/16/84 · D4(62) 16/16/84
T3: C2(36) 32/16/84 · G2(43) 32/16/84 · Eb3(51) 32/16/84 · Bb3(58) 32/16/84
T4: D2(38) 48/8/86 · A2(45) 48/8/86 · C3(48) 48/8/86 · G3(55) 48/8/86 · D2(38) 56/8/92 · A2(45) 56/8/92 · C3(48) 56/8/92 · F#3(54) 56/8/92
```
Dauer: alle 4 Takte 12,6 s · kurz (≤ 8 s) T1, T4 = 6,3 s · ganz (≤ 16 s) T1, T2, T3, T4 = 12,6 s
aud-Daten kurz (Spec v3 §12.8, `len 2`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,4,43,0.66],[0,4,50,0.66],[0,4,57,0.66],[0,4,58,0.66],[4,2,38,0.68],[4,2,45,0.68],[4,2,48,0.68],[4,2,55,0.68],[6,2,38,0.72],[6,2,45,0.72],[6,2,48,0.72],[6,2,54,0.72]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,4,43,0.66],[0,4,50,0.66],[0,4,57,0.66],[0,4,58,0.66],[4,4,39,0.66],[4,4,46,0.66],[4,4,55,0.66],[4,4,62,0.66],[8,4,36,0.66],[8,4,43,0.66],[8,4,51,0.66],[8,4,58,0.66],[12,2,38,0.68],[12,2,45,0.68],[12,2,48,0.68],[12,2,55,0.68],[14,2,38,0.72],[14,2,45,0.72],[14,2,48,0.72],[14,2,54,0.72]]`
- **Karte:** „Weite Kino-Fläche, die sich langsam öffnet – passt zu Retro-Filmmusik.“

---

### 5.13 Retrowave allgemein: Hörprobe für R6 N42 „Neon-Kit 84“ – Rolle Drums · Drum-Synth

- **Kit-Rezept (R6 nur Makro-Ebene; Rohwerte hier als Entwurf):**
  - KICK: `{tLvl 1, frq 55, pAmt 14, pDec .04, tDec .32, tCrv .3, cLvl .4, cTyp 3, drv .15}`
  - SNARE: `{tLvl .8, frq 185, o2 .4, o2r 1.59, tDec .15, nLvl 1.2, nTyp 'bandpass', nFrq 2200, nQ .6, nHp 800, nDec .22, nCrv .5, sGate .85}`
  - HH ZU: `{mLvl .45, mTun 1.25, mHp 8500, mDec .035, nLvl .65, nTyp 'highpass', nFrq 8500, nDec .035, dyn .7}`
  - TOM HOCH / MITTE / TIEF: `{tLvl 1, wav 'triangle', frq 180 / 130 / 90, pAmt 12, pDec .4, tDec .55, nLvl .25, nFrq 2800, nDec .1, sGate .55}`
  - BECKEN: `{mLvl 1, mLo .7, mTun 1.2, mHp 4000, mDec 1.8, sGate .2}`
  - Kit-Bus: `{gate .22, gateLvl 5, room 1.0}` (R6: GATE 220 ms)
- **Unterschied zum Werk „Gated 84“:** Gate 0,22 statt 0,34 s, Snare dunkler (2,2 statt 3,5 kHz), Kick weniger Punch (14 statt 20 HT), 16tel-Hats statt Achtel.
- **Hörprobe** (104 BPM, Kick 1 + 3 + 3-und, Gated Snare 2/4, 16tel-Hats, Takt 4 Tom-Fill):
```
Tempo 104 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK      | x.......x.x..... | x.......x....... | x.......x.x..... | x.....x.x.......
SNARE     | ....x.......x... | ....x.......x... | ....x.......x... | ....x...........
HH ZU     | xxxxxxxxxxxxxxxx | xxxxxxxxxxxxxxxx | xxxxxxxxxxxxxxxx | xxxxxxxx........
TOM HOCH  | ................ | ................ | ................ | ........x.x.....
TOM MITTE | ................ | ................ | ................ | ...........xx...
TOM TIEF  | ................ | ................ | ................ | .............xxx
BECKEN    | x............... | ................ | ................ | ................
```
Dauer: alle 4 Takte 9,2 s · kurz (≤ 8 s) T1, T2, T4 = 6,9 s · ganz (≤ 16 s) T1, T2, T3, T4 = 9,2 s
- **Karte:** „Neon-Beat mit kurzem Gate-Hall und 16tel-Hats – der Grundschlag der Retrowave.“

## 6. Korrekturen an früherer Recherche

| # | Stelle | bisher | richtig / neu | Status |
|---|---|---|---|---|
| K-R1 | R6 §11 Gruppe 2, Zeilen `kavinsky` und `timecop1983` | Beleg „b (Reverb Machine, SE)“ | Reverb Machine ist **eine Sekundärquelle** (Nachbau-Analyse). Auch Kavinskys „keine analogen Keyboards“ steht nur dort als Zitat. → **WAHRSCHEINLICH** („s“ in R6-Kürzeln). | Einstufung |
| K-R2 | R6 §1 The Midnight | „McEwan nutzt Software: u-he Repro/Diva, Serum (Equipboard, Nutzerangaben)“ | Durch Interviews ersetzt (übernommen aus `r8/studio-setups.md` §1.20): **Hardware** OB-6, Prophet-6, Juno-106, Matrix-6, UDO Super 6 („Heroes“); Sub 37, DX7, OB-X8, UDO Super 6 sowie Serum und Zebra 2 („Syndicate“). Repro/Diva bleiben **nur Equipboard** (schwach). | BELEGT (übernommen) / WAHRSCHEINLICH |
| K-R3 | R6 Tabelle C, Tag N31 | „The Midnight · Juno-Charakter (b)“ | genauer: Juno-106 als McEwans Gerät **BELEGT**; Juno-6 nur Überschrift (**WAHRSCHEINLICH**); dass ein Juno die **Flächen** spielt: **UNBELEGT**. Tag: „Juno-Charakter (Gerät b, Part u)“. | Präzisierung |
| K-R4 | R6 Tabelle C, N38 „Neon-Zinken“ | Tags „FM-84 / The Midnight · DX-E-Piano (e)“; `fm6` = Werks-„DX-Tines“ unverändert | (a) DX7 bei The Midnight jetzt **BELEGT als Gerät** (2025), Part UNBELEGT. (b) Für FM-84 gibt es **keinen** Beleg → Tag `fm-84` streichen. (c) Das `fm6` war eine Kopie des Werks-Sounds (V10d-08 führt „N38/Zinken-Piano“ als Doppelten). **Neu:** `fm6` = DX7-Werksklang **ROM1A „E.PIANO 1“** (Daten BELEGT), §5.1 MN4. Damit ist N38 kein Doppelter mehr. | BELEGT (Daten) |
| K-R5 | R6 §1 Carpenter Brut; Tabelle C, Tag N40 | „Synth statt Gitarrensolo (b)“ | R6 zitiert selbst: „keine Gitarren **außer ein paar Soli**“. Das heißt: Es **gibt** echte Gitarrensoli. Ein Synth-Lead „statt“ Gitarre ist **nicht** belegt. Tag N40: „verzerrter Synth-Lead (e); vereinzelt echte Gitarrensoli (b)“. | Lesefehler korrigiert |
| K-R6 | R6 Tabelle C, Tag N39 | „Carpenter Brut (b) / Perturbator (u)“ | Das „b“ deckt nur „distorted synths“ (Stil). Die Klangwerte sind Entwurf, gemessen [g] nur der Drive-Effekt. Tag: „Carpenter Brut, verzerrte Synths (Stil b, Werte e)“. | Präzisierung |
| K-R7 | R6 §1 Kavinsky | „Ein Vocoder geht in der App nicht (kein Mikrofon, §13)“ | Überholt: Xander will jetzt Mikrofon-Eingang (`fragen-xander-7.md` P3). Ein Vocoder wäre danach **möglich** (eigenes Paket, nicht Teil dieser Bibliothek). | Stand geändert |
| K-R8 | `r8/studio-setups.md` §1.20 | „Saxofon als Markenzeichen – BELEGT (aus R6)“ | R6 nennt dafür nur Wikipedia (eine Sekundärquelle). → **WAHRSCHEINLICH**. | Einstufung |
| K-R9 | R6 §11 Gruppe 2 (6 Acts) | Mitch Murder, Michael Oakley, Lazerhawk, Com Truise, Le Matos fehlen | 5 neue `id`s (§9), Status **u**. Filter-Tag erst nach Popularitäts- und Geräte-Beleg (§3). | neu |

**Geprüft, keine Änderung nötig:** `SYNQUENZER-vision.md` enthält zu Retrowave nur „Slap House … Vize“ (Z. 435, Bass-Stil, nicht Retro) – nichts zu korrigieren. R6 N34 [g] (Zupf-Bass, gemessen 141/109 Hz) bleibt. R6 Demo 9 „Retrowave 104 BPM a-Moll“ bleibt, §8.1 baut darauf auf.

**Zum Diktat „den Lause Bass … VIZE … Tiger und Centuries“:** schon in `vorbild-coldwave2.md` §4 behandelt (wahrscheinlich Slap-House-Bass, VIZE; Rückfrage offen). Der Act mit dem nächsten Klang zu „Laser“ in diesem Cluster wäre Lazerhawk – das ist aber nur Lautähnlichkeit (UNBELEGT) und ändert die Rückfrage nicht.

## 7. Übersicht: Lage, Rolle, Tempo

| Nr | Sound | Rolle | Engine | Neu? | Hörprobe (MIDI) | Tempo | Tonart Probe | LAGE-Klammer (Vorschlag) | Vorbild-Bezug |
|---|---|---|---|---|---|---|---|---|---|
| MN1 | N31 Nachtblau-Fläche | Fläche | VA | R6 | G2–B4 (43–71) | 100 | D-Dur | G2–C5 | The Midnight (Gerät b, Part u) |
| MN2 | N32 Neon-Sax | Lead | VA | R6 | A4–D6 (69–86) | 100 | D-Dur | tief F#4 | The Midnight (s) |
| MN3 | Abendrot-Poly | Akkord | VA | neu | G#3–E5 (56–76) | 104 | A-Dur | G3–E5 | The Midnight (Gerät b, Part u) |
| MN4 | N38 Neon-Zinken (ROM-Kern) | Keys | FM6 | R6, neues `fm6` | Bb1–D5 (34–74) | 84 | F-Dur | Bb1–D5 | The Midnight (DX7 b, Part u) |
| F81 | N37 Strandpromenade-Lead | Lead | VA | R6 | B4–B5 (71–83) | 112 | E-Dur | tief A4 | FM-84 (u) |
| F82 | Brandungs-Bass | Bass | VA | neu | A1–E3 (33–52) | 112 | E-Dur | hoch E3 | FM-84 (u) |
| TC1 | N34 Zupf-Bass 83 | Bass | VA [g] | R6 | A1–D3 (33–50) | 92 | G-Dur-Umfeld | hoch D3 | Timecop1983 (s) |
| TC2 | Werk Juno-Streicher | Fläche | VA | Werk | A2–E4 (45–64) | 92 | G-Dur-Umfeld | A2–E4 | Timecop1983 (Gerät s, Part u) |
| GS1 | N36 Kampfstern-Brass | Akkord | VA | R6 | F3–Bb4 (53–70) | 108 | c-Moll | F3–C5 | Gunship (u) |
| GS2 | Sternkreuzer-Bass | Bass | VA | neu | G1–Eb3 (31–51) | 108 | c-Moll | hoch Eb3 | Gunship (u) |
| KV1 | N35 Nachtfahrt-Bass | Bass | VA | R6 | F1–E3 (29–52) | 100 | a-Moll | hoch E3 | Kavinsky (u) |
| KV2 | N33 Neon-Arp | Sequenz | VA | R6 | F3–C5 (53–72) | 100 | a-Moll | F3–C5 | Kavinsky (s) |
| CB1 | N39 Dunkelfahrt-Bass | Bass | VA [g] | R6 | A1–Eb3 (33–51) | 120 | d-Moll | hoch Eb3 | Carpenter Brut (Stil b) |
| CB2 | N40 Höllenfahrt-Lead | Lead | VA | R6 | C#5–A5 (73–81) | 120 | d-Moll | tief C5 | Carpenter Brut (Stil b) |
| CB3 | Raserei-Kit | Drums | Drum | neu | – | 120 | – | keine | Carpenter Brut (Stil b) |
| PT1 | N41 Leuchtschrift-Arp | Sequenz | VA | R6 | F3–E5 (53–76) | 116 | f-Moll | F3–F5 | Perturbator (u) |
| PT2 | Mondfinsternis-Fläche | Fläche | VA | neu | Bb1–C4 (34–60) | 116 | f-Moll | Bb1–C4 | Perturbator (u) |
| MM1 | Schulterpolster-Slap | Bass | FM6 | neu | E1–D3 (28–50) | 112 | e-Moll (dorisch) | E1–E3 | Mitch Murder (u) |
| MM2 | Krimiserie-Brass | Stab | FM6 | neu | E4–F#5 (64–78) | 112 | e-Moll (dorisch) | E4–G5 | Mitch Murder (u) |
| MO1 | Glanzzupf | Pluck | VA | neu | F4–A5 (65–81) | 108 | C-Dur | F4–C6 | Michael Oakley (u) |
| MO2 | Werk Gated 84 | Drums | Drum | Werk | – | 108 | – | keine | Retrowave (Genre) |
| LH1 | Werk Sync-Lead | Lead | VA | Werk | B4–D6 (71–86) | 118 | h-Moll | tief A4 | Lazerhawk (u) |
| LH2 | Werk Moroder-Puls | Sequenz/Bass | VA | Werk | G1–D3 (31–50) | 118 | h-Moll | hoch D3 | Lazerhawk (u) |
| CT1 | Leierband-Akkord | Akkord | VA | neu | Ab2–D4 (44–62) | 88 | Eb-Dur | Ab2–E4 | Com Truise (u) |
| CT2 | Schleich-Funk-Bass | Bass | VA | neu | Eb1–C3 (27–48) | 88 | Eb-Dur | Eb1–Eb3 | Com Truise (u) |
| CT3 | Halbzeit-Kit | Drums | Drum | neu | – | 88 | – | keine | Com Truise (u) |
| LM1 | Endzeit-Fanfare | Akkord | VA | neu | F3–C5 (53–72) | 110 | g-Moll | F3–C5 | Le Matos (u) |
| LM2 | Werk Weite 82 | Fläche | VA | Werk | C2–D4 (36–62) | 76 | g-Moll | C2–D4 | Retrowave (Genre) |
| N42 | Neon-Kit 84 | Drums | Drum | R6 | – | 104 | – | keine | Retrowave (Genre) |

„s“ = nur eine Sekundärquelle (WAHRSCHEINLICH), „u“ = unbelegt (Stil-Vermutung), „b“ = belegt. Die Original-Tonarten sind für keinen Titel belegt; die Proben-Tonarten sind frei gewählt und je Demo (§8) aufeinander abgestimmt.

**Prüfung** (`r7/retro-work/aud.mjs`, Ausgabe `aud-report.txt`): alle 29 Proben 4 Takte, 4/4 verschiedene Takte, 0 direkte Wiederholungen, Ende ≤ 64/64, keine Note über eine Taktgrenze, kurze Fassung ≤ 8 s (höchstens 8,0 s). **Nicht geprüft:** Klang, Pegel (Ziel −18 LUFS), Ähnlichkeit zu Originalen (keine Notendaten) – menschliches Gegenhören vor V10d (Pflichtvermerk „eigene Melodie“, V10d-05).

## 8. Demo-Song-Baupläne (eigener Entwurf, keine Kopie)

Gemeinsame Regeln: eigene Melodien und Muster (§2), Allerwelts-Akkordfolgen, Song-Teile so gebaut, dass FANG TEIL sie einfängt und der Song-Modus sie am Taktstrich auflöst (Szenen = Clip-Zustände, Teile = Strophe/Refrain). Spuren: 1 Drum-Spur + bis zu 5 Synth-Spuren + MELODIE. Die Hörproben dieser Datei sind direkt als Clips nutzbar; die App transponiert sie in die Demo-Tonart (Träger-Akkord, LAGE-Klammer aus §7 verhindert Ausreißer).

### 8.1 Demo „Neonküste“ – Retrowave (V10e-konform: 104 BPM, a-Moll)

- **Grundlage:** R6 §7 Demo 9 und Nachtrag V10e (Teil A und B je 4 Takte, Kette A A B B). Akkorde A: F | G | Am | Am. Akkorde B: F | G | C | E.
- **Spuren:** Drums **N42** (§5.13) · Bass **N35** (Muster KV1) · Arp **N33** (Muster KV2, gleiche Tonart) · Fläche **N31** · Keys **N38 ROM** (nur B) · Hook **N32 Neon-Sax** (B) · MELODIE frei.
- **Szenen:** A = Arp + Fläche + Bass + Drums · B = wie A + Keys + Sax-Hook.
- **V10e-Kern:** A A B B (16 Takte). **Lange Fassung** (Vorschlag): Intro (nur Arp + Fläche) 4 · A 8 · B 8 · Break (Fläche + Keys, Drums aus) 4 · B 8 (+2 HT transponiert) · Outro (Arp allein, Echo-Fahne) 4.
- **Wiedererkennung:** punktiertes Echo am Arp, Oktav-Bass pumpt mit der Kick, Gated Snare, Sax als Hook, letzter Refrain einen Ganzton höher.

### 8.2 Demo „Raserei 88“ – Darksynth (Carpenter Brut / Perturbator, Stil)

- **Tempo / Tonart:** 120 BPM, d-Moll. Akkorde A: Dm | Eb | Dm | C (phrygische Wendung). Akkorde B: Bb | C | Dm | A.
- **Spuren:** Drums **CB3 Raserei-Kit** · Bass **N39** (Muster CB1) · Arp **N41** (Muster PT1, nach d-Moll transponiert) · Lead **N40** (Muster CB2) · Fläche **PT2** · Brass **N36** (nur Bridge).
- **Szenen:** A = Drums + Bass + Arp · B = + Lead · C = Bridge: Fläche + Brass, Drums nur Becken und Toms.
- **Teil-Folge:** Intro (Fläche + Arp) 4 · A 8 · B 8 · A 8 · Bridge C 8 · B 8 · Outro (Bass allein, dann Schlag) 4.
- **Wiedererkennung:** verzerrter 16tel-Bass, Doppel-Kick-Gefühl, harmonisch Moll im Lead (C#), Bridge wie Filmmusik.

### 8.3 Demo „Sonnendeck 86“ – Synthwave-Pop (FM-84 / The Midnight / Michael Oakley, Stil)

- **Tempo / Tonart:** 108 BPM, C-Dur (Strophe C | G | Am | F), Refrain F | G | Em | Am; letzter Refrain in D-Dur (+2 HT).
- **Spuren:** Drums **Werk Gated 84** (Muster MO2) · Bass **Brandungs-Bass** (Muster F82, transponiert) · Pluck **Glanzzupf** (Muster MO1) · Akkorde **Abendrot-Poly** (Refrain) · Lead **N37** (Instrumental-Hook) · Fläche **Werk Juno-Streicher** (Bridge) · MELODIE.
- **Teil-Folge:** Intro (Pluck + Drums ab Takt 3) 4 · Strophe 8 · Refrain 8 · Hook (Lead N37) 4 · Strophe 8 · Refrain 8 · Bridge (Streicher + Poly, halbe Drums) 4 · Refrain 8 (+2 HT) · Outro (Pluck + Echo) 4.
- **Wiedererkennung:** Dur, Push-Akkorde, Gated Snare mit Tom-Fills, singender Lead als Zwischenspiel, Ganzton-Rückung.

### 8.4 Demo „Leierband 89“ – Downtempo-Synthwave (Com Truise / Timecop1983, Stil)

- **Tempo / Tonart:** 88 BPM, Eb-Dur. A: Ebmaj7 | Cm9 | Abmaj7 | Bb7. B: Abmaj7 | Gm7 | Fm7 | Bb7sus4.
- **Spuren:** Drums **CT3 Halbzeit-Kit** · Bass **CT2** · Akkorde **CT1** · Keys **N38 ROM** · Zupf-Bass **N34** als zweite Bass-Farbe nur in B (Achteln, leise) · MELODIE.
- **Teil-Folge:** Intro (Akkorde allein, Leiern hörbar) 4 · A 8 · B 8 · A 8 · Break (Keys + Akkorde) 4 · B 8 · Outro 4.
- **Wiedererkennung:** halbes Tempo-Gefühl (Snare auf 3), leiernde Maj7-Akkorde, gleitender Bass.

### 8.5 Demo „Krimiserie 85“ – Retro-Action/TV (Mitch Murder / Lazerhawk / Le Matos, Stil)

- **Tempo / Tonart:** 112 BPM, e-Moll dorisch. A: Em7 | A7 | Em7 | C D. B: C | D | Bm | Em. Finale in g-Moll (Fanfare LM1, Tonart-Rückung +3 HT).
- **Spuren:** Drums **N42** (oder Werk Gated 84) · Bass **MM1 Schulterpolster-Slap** · Stöße **MM2 Krimiserie-Brass** · Lead **Werk Sync-Lead** (Muster LH1, transponiert) · Puls **Werk Moroder-Puls** (nur Strophe, leise) · Finale **LM1 Endzeit-Fanfare**.
- **Teil-Folge:** Intro (Brass-Stöße allein) 2 · A 8 (Slap + Drums + Brass) · B 8 (Sync-Lead-Thema) · A 8 · Verfolgungsjagd (Puls + Drums, Slap aus) 8 · B 8 · Finale (Fanfare, +3 HT) 4.
- **Wiedererkennung:** Slap-Bass mit Oktav-Pops, Bläser „kurz-kurz-lang“, Sync-Lead als Titelthema, Fanfare zum Schluss.

**Bau-Hinweis:** Jedes Demo ist ein Projekt (≈ 3–5 KB laut R6 §8). §8.1 erfüllt V10e wörtlich; §8.2–8.5 sind Vorschläge für eine Erweiterung (nicht im V10e-Umfang, Entscheidung Xander/Spec).

## 9. Einbau-Hinweise (für Spec und Builder)

1. **VORBILD-Tabelle** (R6 §11, Gruppe 2): Status `kavinsky` und `timecop1983` → „s“ (K-R1). Neu, Status „u“, **noch ohne Filter-Eintrag** (§3): `mitch-murder`, `michael-oakley`, `lazerhawk`, `com-truise`, `le-matos`. `fm-84`, `gunship`, `perturbator` bleiben „u“. `the-midnight` bleibt „b“ (jetzt mit Interview-Geräten).
2. **Tags ändern:** N31 (K-R3), N38 (K-R4: `fm-84` raus, neues `fm6`), N39 (K-R6), N40 (K-R5).
3. **Werks-Sounds taggen** (nur `info.tags` und neue `aud`, keine Klangwerte): Juno-Streicher (`timecop1983`, `the-midnight` – je „Gerät-Familie s, Part u“), Gated 84 (`retrowave`), Sync-Lead (`retrowave`), Moroder-Puls (`retrowave`), Weite 82 (`retrowave`). **Kein** Act-Tag ohne Beleg.
4. **Namen nach E9 geprüft** (grep gegen V0a, R6, Spec, alle R7-Dateien am 17.10.): Abendrot-Poly, Brandungs-Bass, Sternkreuzer-Bass, Raserei-Kit, Mondfinsternis-Fläche, Schulterpolster-Slap, Krimiserie-Brass, Glanzzupf, Leierband-Akkord, Schleich-Funk-Bass, Halbzeit-Kit, Endzeit-Fanfare – keine Kollision. Verworfen: „Grabkammer-Fläche“ (Kollision mit DK-10 „Grabkammer-Kit“ in `vorbild-dark.md`), „Turbo-…“ (zu nah an Titeln „Turbo Killer“/„Turbo Kid“, Gedächtnis), „Strahlen-Sync-Lead“ (fast gleich Werk „Sync-Lead“ → stattdessen Hörprobe für das Werk). Vor dem Einbau `r6/n6/doppel-check.mjs` laufen lassen.
5. **Doppelten-Risiko (V10d-08):** Glanzzupf gegen Werk „Pop-Pluck“ und Abendrot-Poly gegen Werk „Prophet-Poly“ messen (≥ 1 Maß aus H-1 verschieden). Endzeit-Fanfare gegen Werk „Weite 82“.
6. **FM-Klänge aus ROM1A:** Die DX7-Werksdaten stammen von Yamaha. Ob man sie 1:1 als Werks-Sound ausliefern darf, ist eine **Lizenzfrage** (eK, wie `vorbild-pop.md` §14). Vorschlag: so lange als „nach DX7-Werksklang“ beschriften und vor Veröffentlichung klären. MN4 und MM2 sind 1:1, MM1 ist umgerechnet.
7. **FM-Hüllkurven:** R8 misst die Engine als DX7-genau; die ROM-Rezepte sollten also wie am DX7 klingen. Die Bedien-Probleme aus `fragen-xander-9.md` betreffen das Nachstellen, nicht diese Rezepte. Pitch-EG fehlt – keine der drei ROM-Stimmen hier braucht sie (laut `dx6-presets.js` wurden LFO/Pitch-EG beim Lesen weggelassen; ob die Original-Stimmen eine Pitch-EG nutzen, ist **UNBELEGT**).
8. **Messungen vor Freigabe:** Pegel −18 LUFS; Bass-Gate (≥ 55 % unter 250 Hz) für Brandungs-Bass, Sternkreuzer-Bass, Schulterpolster-Slap, Schleich-Funk-Bass; Leierband-Akkord: Tonhöhen-Schwankung hörbar, aber ≤ ±10 ct; Raserei-Kit und Neon-Kit 84: Spitzen wie V1c-02.
9. **Hörproben-Daten:** `r7/retro-work/aud-retro.json` (kurz und ganz je Probe), `aud-blocks.md` (die Blöcke dieser Datei).

## 10. Offene Punkte, Prüfliste und Fragen an Xander

**Fragen an Xander (kurz):**
1. Welche Lieder von The Midnight mag dein Kumpel am meisten? (Dann kann man gezielt Klang für Klang nachbauen.)
2. Hast du Referenzlieder zu Gunship und FM-84? (R6-Frage, weiter offen.)
3. Sollen Acts ohne Beleg (§3) trotzdem im Filter stehen, als „Stil-Vermutung“? Vorschlag: nein, nur Genre-Tag `retrowave`.

**Prüfliste für die Nachrecherche (sobald Suchbudget und Netz wieder gehen):**

| Act | Was prüfen | Suchbegriffe (Vorschlag) |
|---|---|---|
| alle 11 außer The Midnight | Streams/Aufrufe > 1 Mio. | „<Act> monthly listeners“, „<Act> most streamed song“ |
| The Midnight | Lyle-Interview im Volltext (Juno-6); Sax-Spieler; welcher Synth spielt welche Fläche | „Tyler Lyle Juno-6 MusicRadar“, „The Midnight saxophone player“ |
| Kavinsky | Primärquelle (Interview) zu „Nightcall“-Geräten; Produzent; Tempo, Tonart | „Kavinsky Nightcall interview synth“, „Nightcall Guy-Manuel produced“ |
| Timecop1983 | eigenes Interview zu Juno-106/TAL | „Timecop1983 interview gear“ |
| FM-84 | Geräte von Col Bennett; Tempo/Tonart „Running in the Night“ | „FM-84 Col Bennett synths interview“ |
| Gunship | Geräte (Hardware oder Software) | „Gunship interview synths studio“ |
| Carpenter Brut | Geräte im Detail | „Carpenter Brut gear interview synth“ |
| Perturbator | DAW und Synths | „Perturbator James Kent interview gear“ |
| Mitch Murder, Michael Oakley, Lazerhawk, Com Truise, Le Matos | Geräte, Arbeitsweise | „<Act> interview synth gear“, „Reverb Machine <Act>“ |

**Gedächtnis-Angaben zum Prüfen (UNBELEGT, nicht in ⓘ):** siehe die Zeilen „Gedächtnis“ in §5.

## 11. Quellen

**Neu abgerufen in diesem Lauf:** keine (Web gesperrt, siehe Vorbemerkung).

**Übernommen aus früheren Läufen (dort mit Status; hier nicht erneut geöffnet):**
- The Midnight: https://www.musicradar.com/news/the-midnight-tim-mcewan-synths-plugins-interview · https://musictech.com/features/interviews/the-midnight-interview-syndicate/ (beide über `r8/studio-setups.md` §1.20) · https://en.wikipedia.org/wiki/The_Midnight · https://www.inkl.com/news/if-the-porsche-911-is-the-platonic-ideal-of-a-sports-car-and-the-submariner-rolex-is-the-ideal-of-a-watch-the-juno-6-is-that-for-the-midnight-it-s-in-its-beating-heart-tyler-lyle-talks-essential-gear-sax-appeal-and-taking-synthwave-on-the-road · https://equipboard.com/pros/the-midnight · https://www.musicmetricsvault.com/artists/the-midnight/2NFrAuh8RQdQoS7iYFbckw · https://allevents.in/performer/the-midnight · https://www.iconvsicon.com/2020/05/06/the-midnight-to-unleash-monsters-on-july-10th-via-counter-records/ (alle über `r6/bibliothek-recherche.md` §10)
- Kavinsky und Timecop1983: https://reverbmachine.com/blog/how-kavinsky-created-nightcall/ · https://reverbmachine.com/blog/timecop1983-synth-sounds (über R6 §10)
- Carpenter Brut: https://www.metalsucks.net/?p=191922 · https://loudersound.com/features/carpenter-brut-interview-2022 · https://theplayground.co.uk/carpenter-brut-on-the-birth-of-his-artistry-his-gear-and-more-interview/ (über R6 §10)
- Recht: siehe `vorbild-helden.md` §1 und R6 §5.

**Lokale Primärdaten:** `scratchpad/fmresearch/proto/rom1a.json` (DX7 ROM1A, gelesen aus ROM1A.SYX: „E.PIANO 1“, „BASS 1“, „BRASS 1“) · `synq-snapshots/V0a.html` (Z. 5047 `AN`, 5644 `ANALOG_BASE`, 5728–5830 Werks-VA, 5838 `OP`, 6011–6025 Kits, 7195 `DEFAULTS`, 7266 `SLOTS`, 7320 „Gated 84“, 15214 `KIT_PD`) · `r6/n6/rezepte76.json` (N31–N42) · `r8/fm-diagnose.md`.
