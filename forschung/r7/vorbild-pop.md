# R7 – Vorbild-Pop: Depeche Mode, a-ha, Alphaville, OMD, The Human League, New Order, Erasure, Yazoo

**Stand:** 17.10.2026 · Auftrag R7 „vorbild-pop“ · Grundlage: `fragen-xander-7.md` (L1–L3), `fragen-xander-8.md` (V, T), `fragen-xander-5.md` (H7), `fragen-xander-6.md` (I5), Spec v3 §12.8 (`aud`), Nachtrag 1 (E9, N10a, V10d), `r6/bibliothek-recherche.md` (§1, §5, §6, §11), `SYNQUENZER-vision.md` (Teil 3.1), Geschwister `r7/vorbild-helden.md` (§1 Recht, §2 Format), `r7/transposition-lage.md` (LAGE-Klammer).
**Abgrenzung:** The Human League und New Order haben schon Rezepte in R6 (N10–N16) und je eine Hörprobe in `vorbild-helden.md` §7 (für N11 und N13). Hier kommen für sie **neue Belege**, 2 neue Sounds (Human League) und Hörproben für die übrigen R6-Rezepte (N12, N14–N16) dazu. Für Alphaville, a-ha (teilweise), OMD und Depeche Mode werden R6-Rezepte (N01–N03, N05, N07–N09) mit Hörproben versehen statt doppelt gebaut.
**Werkzeuge und Grenzen (ehrlich):**
- Webseiten direkt abrufen war gesperrt (WebFetch: `ENOTFOUND www.soundonsound.com`; curl: „CONNECT tunnel failed, response 403“ für `en.wikipedia.org` und `www.soundonsound.com`, gemessen 17.10.2026). **Jeder Web-Fakt stützt sich auf Suchauszüge (SE).** Auch eine „Primärquelle“ (Interview) ist hier nur über den Auszug gelesen.
- Das gemeinsame Suchbudget des Laufs (200 Suchen) war nach rund 50 eigenen Suchen erschöpft. **Nicht mehr gesucht** wurden: Tempo/Tonart von „Big in Japan“, „Sounds Like a Melody“, „Dance With Me“, „Maid of Orleans“, „Souvenir“, „Electricity“; Geräte zu Erasure „Sometimes“/„A Little Respect“ im Detail. Diese Stellen sind UNBELEGT markiert.
- Die Hörproben sind per Skript erzeugt und geprüft (`r7/pop-work/aud-pop.mjs` → `aud-report.txt`). **Nichts ist angehört, nichts gemessen.** Pegel (`level`, FM `gain`) sind nicht kalibriert (Ziel −18 LUFS, Spec v2 §11.1).

**Kennzeichen (wie vom Auftrag verlangt)**
- **BELEGT** = Primärquelle (Interview mit dem Musiker/Produzenten, Bandzitat) **oder** zwei unabhängige Quellen sagen dasselbe.
- **WAHRSCHEINLICH** = nur eine Sekundärquelle (Wikipedia allein, Fachblog, Händler-Blog, Fan-Wiki, Nachbau-Video, DJ-Datenbank), oder Quellen widersprechen sich im Detail.
- **UNBELEGT** = nichts gefunden; eigene Einschätzung. Wird **nie** als Fakt in einen ⓘ-Text übernommen.
- Alles unter „Rezept“, „Warum so“, „Hörprobe“ und „Demo-Song“ ist **eigener Entwurf** (Design), kein Quellenfakt.

---

## 0. Kurzfazit

- **18 neue Sounds** mit Rezept, Lage und Hörprobe, dazu **11 Hörproben für vorhandene R6-Rezepte** (N01, N02, N03, N05, N07, N08, N09, N12, N14, N15, N16). Alle 29 Hörproben: 4 Takte (passt zu Spec §12.8 `len ≤ 4`), 4/4 verschiedene Takte, 0 direkte Takt-Wiederholungen, Wendung in Takt 4 (geprüft, §11).
  - Depeche Mode 5 (DM1–DM5), a-ha 3 (AH1–AH3), Alphaville 1 (AV2), OMD 1 (OM1), Human League 2 (HL1–HL2), Erasure 3 (ER1–ER3), Yazoo 3 (YZ1–YZ3).
- **Am besten belegt (Primärquelle bzw. 2 Quellen):**
  - Depeche Mode: „Speak & Spell“ größtenteils mit dem ARP-Sequenzer (Clarke, SOS); Rhythmus aus Korg KR-55 + ARP-2600-Bassdrum; Sampling von Metall 1983 (Gareth Jones, SOS/RBMA); „Personal Jesus“: gesampeltes Stampfen auf Flightcases (Wilder) und Blues-Gitarrenriff; ≈ 130 BPM in fis-Moll.
  - a-ha „Take On Me“: Juno-60 spielt das Hauptthema (Produzent Tarney in SOS; Roland; Wikipedia), LinnDrum von Pål Waaktaar programmiert.
  - OMD: Korg Micro-Preset + selbst programmierte CR-78 („Enola Gay“, Bandzitat); „Souvenir“: Chor aus selbst geschnittenen Bandschleifen, Akkorde per Fader; Mellotron danach gekauft; der „Dudelsack“ in „Maid of Orleans“ ist laut Humphreys ein **Geigen-Klang durch das Mellotron**.
  - Erasure „Chorus“ (1991): nur analoge Synths, jede Linie monophon, Roland MC-4 per CV/Gate, Drums aus Synths (außer Crash).
  - Yazoo: Clarke selbst: JP-4, Pro-One, MC-4, TR-808 für das erste Album; „Don't Go“ mit viel ARP 2600.
  - New Order „Blue Monday“: Moog Source über selbstgebauten Powertran-Sequenzer, Oberheim DMX (schon R6, hier bestätigt).
- **Schwach oder gar nicht belegt:**
  - Welches Gerät den „Just Can't Get Enough“-Lead spielt (Jupiter-4 nur laut Thomann-Blog; passt aber zu Clarkes eigener Aussage, damals einen JP-4 gekauft zu haben).
  - **Alphaville: kein Part einem Gerät zuordenbar.** Nur eine Geräteliste „aus dem Gedächtnis von Bernhard Lloyd“ in einem Forum.
  - „Everything Counts“: Refrain-Riff laut Fan-Wiki ein bearbeitetes DX7-Werks-Preset „SYN-LEAD 2“ (ROM 2B). Die Patch-Daten liegen lokal **nicht** vor.
  - „Enjoy the Silence“: Bass Minimoog + ARP 2600, Chor aus Emulator-II-Diskette – nur laut Reverb-Nachbau-Video.
  - Human League „Don't You Want Me“: Jupiter-4/System 700/CS-15 nur Sekundärquellen und ein Nachbau-Video (Alex Ball).
- **13 Korrekturen** an R6, Vision und Werks-Texten (§10). Die wichtigsten:
  - „Souvenir“ ist **kein** Mellotron-Chor, sondern Bandschleifen (R6 N08 falsch getaggt).
  - Werks-Sound „Pop-Bass DX“ nennt „Take On Me“ ohne Beleg.
  - Vision: Erasure „Chorus“ mit „ARP-Sequenzer“ ist nicht belegt; belegt ist MIDI-Sequenzer → MC-4.
- **4 Demo-Song-Baupläne** (§12): Synthpop 1981, Hymnen-Pop 1984/85, Kathedralen-New-Wave 1980–82, Club-Synthpop 1983–90.

## 1. Rechtliche Linie (kurz, kein Rechtsrat)

Gilt wie `vorbild-helden.md` §1 und R6 §5 (dort die Quellen). Kurzform:
- **Frei:** Stil, Genre, Klangfarbe, Gerätetyp, Spieltechnik (Oktav-Achtel, 16tel-Sequenz, Fader-Chor, Stampf-Rhythmus), Allerwelts-Akkordfolgen, Allerwelts-Rhythmen (UNBELEGT als Rechtsgrenze, eK; USA: „texture“ nicht schutzfähig laut Gray v. Hudson, in `vorbild-helden.md` §1 BELEGT).
- **Nicht übernehmen:** die konkrete Melodie bzw. das Riff eines Titels (§ 23 UrhG „hinreichender Abstand“), Samples oder Resynthese fremder Aufnahmen (§ 85 UrhG), Titel-, Künstler- und Gerätenamen im Sound-Namen (E9).

**Regeln für alle 29 Hörproben dieser Datei (selbst angewendet):**
1. Eigene Melodie, eigene Bassfigur, eigenes Drum-Muster.
2. **Andere Tonart** als der Titel, an den die Probe erinnert (Tabelle §11). Ausnahme: N12 (Dare-Ära, kein bestimmter Titel).
3. Keine Folge von mehr als 4 Tönen mit gleichem Rhythmus wie ein bekanntes Riff (Selbstprüfung beim Komponieren; ein automatischer Abgleich ist nicht möglich, weil keine Originalnoten vorliegen).
4. Erkennbar sein sollen **Klang, Lage, Tempo-Gefühl, Rhythmus-Technik und Harmonik**, nicht der Song. Beispiel: AH1 hat das schnelle 169-BPM-Gefühl und die hohe Lage von „Take On Me“, aber einen gebrochenen Akkord statt des bekannten Hooks.
5. Drum-Muster nutzen Techniken (16tel-Hats, Stampfen, Kick-Lauf am Taktende), nie die markante Abfolge eines Titels (z. B. **nicht** die „Blue Monday“-Stotter-Kick).

**ⓘ-Text:** Vorbild nur im ⓘ-Text und im Filter, nie im Namen (E9); Pflichtsatz „Marken gehören ihren Inhabern, keine Verbindung.“; Formulierung „erinnert an … (Stil)“.

## 2. Format der Hörproben und Anschluss an die App

- Wie `vorbild-helden.md` §2: Notenliste `Ton(MIDI) Start/Länge/Anschlag`, Start und Länge in **16teln ab Takt 1**; darunter `aud.notes [b, d, n, v]` in Schlägen (16tel ÷ 4).
- **Drums:** Schritt-Zeilen je Pad (`x` = Schlag), Pad-Namen wie `DrumKits.SLOTS` (KICK, SNARE, RIM, CLAP, HH ZU, HH OFFEN, PERC, SHAKER, BECKEN …).
- **12/8-Gefühl** (OM1): Triolen-Achtel als gebrochene Startwerte (1 Triolen-Achtel = 4/3 16tel). Vorschläge (Verzierungen) sind 1/32 lang und liegen 1/32 vor der Hauptnote.
- **Rezepte** nach dem Lese-Schlüssel R6 §12.2 und den Werks-Schlüsseln aus `V0a.html` (gelesen, nicht geändert):
  - VA: `ANALOG_BASE` (Z. 5644) – nur Abweichungen sind genannt. Routen `M(src, dst, amt)`: Tonhöhe 1,0 = 24 HT, Cutoff 1,0 = 120 HT. Quelle `rnd` (Zufall je Note) gibt es (`SRC_ID.rnd`).
  - FM6: `OP(coarse, ol, r[4], l[4], {det, vs, rs, ks})`, DX7-Einheiten (Z. 5838).
  - Drums: Abweichungen von `DrumSynth.DEFAULTS` (Z. 7195): TON `tLvl/frq/pAmt/pDec/tDec`, RAUSCHEN `nLvl/nTyp/nFrq/nDec`, METALL `mLvl/mHp/mDec`, KLICK `cLvl/cTyp`, `drv`, `sRoom`, `sGate`.
- **Lage** je Sound: tiefster–höchster Ton der Hörprobe und Vorschlag für die LAGE-Klammer aus `transposition-lage.md` (§11).

---

## 3. Depeche Mode (`vorbild: depeche-mode`)

### 3.1 Belege

| Fakt | Status | Quelle |
|---|---|---|
| Clarke: Daniel Miller habe ihnen den **ARP-Sequenzer** gezeigt, „so wurde der Großteil von ‚Speak & Spell‘ gemacht“; damit war das Problem des unsauberen Spiels gelöst. | BELEGT (Primärquelle, SE) | SOS „Vince Clarke: Electronic Music Pioneer“ |
| „Speak & Spell“: Rhythmus-Rückgrat **Korg KR-55**, Bassdrum von einem **ARP 2600** erzeugt | BELEGT (2 Quellen) | MusicRadar (Speak-&-Spell-Feature); norselandsrock-Blog |
| … synchronisiert über einen **Roland MC-4** | WAHRSCHEINLICH, **Widerspruch** zu Clarkes „ARP-Sequenzer“ | MusicRadar; DM-Forum (laut Suchauszug) |
| „Just Can't Get Enough“: Lead-Sound vom **Roland Jupiter-4** | WAHRSCHEINLICH (nur Händler-Blog) | Thomann-Blog „15 Songs with a Fat Synth Sound“ |
| Clarke kaufte nach dem Mute-Vertrag einen JP-4, weil er ein Gerät mit Speicher wollte; bereute es später (wollte nur mono). | BELEGT (Clarke-Zitat, SE) | muzines-Archiv (Clarke-Interview) |
| JCGE: 128 BPM, 4/4 | WAHRSCHEINLICH (dmlive-Wiki + DJ-Analyse 127,5–128,1) | dmlive.wiki; uwaterloo-Trackdatenbank |
| JCGE-Tonart | UNBELEGT (Quellen uneinig: C-Dur, c-Moll, G) | dmlive.wiki; Karaoke-Version; uwaterloo |
| „Construction Time Again“ (1983): Wilder bringt **Synclavier** und **E-mu Emulator** ein; Klang-Wechsel durch Sampler | BELEGT (2 Quellen) | Wikipedia „Construction Time Again“; MusicRadar „Berlin trilogy“ |
| Gareth Jones: Sessions drehten sich um Sampling und Raum; **monophones Synclavier** zentral, dazu Emulator II und sein AMS; Samples einzeln auf Band | BELEGT (Primärquelle, SE) | SOS Classic Tracks „People Are People“ |
| Metall geschlagen in leerstehenden Orten in East London/Shoreditch, ohne EQ/Hall („Pipeline“) | BELEGT (Jones, 2 Quellen) | MusicRadar; RBMA „Key Tracks: Gareth Jones on Pipeline“ |
| „Everything Counts“: Riff in Refrain und Outro = Bearbeitung des DX7-Werks-Presets **ROM 2B „SYN-LEAD 2“** | WAHRSCHEINLICH (Fan-Wiki, „informed guess“) | dmlive.wiki „Sample sources / The Singles 81→85“ |
| „Everything Counts“: Strophen-Klang vermutlich eigene **Synclavier-II**-Klangfarbe; Bass breiter Unisono-Säge-Bass vom Synclavier II | WAHRSCHEINLICH (Fan-Wiki; Syntorial) | dmlive.wiki CTA-Liste; Syntorial „Everything Counts Bass“ |
| „Everything Counts“: Gore spielt u. a. Xylofon und Schalmei (shawm) | WAHRSCHEINLICH (ein Blog) | largeup.com „Ten Classic Songs with a Melodica“ |
| „Everything Counts“: ≈ 114 BPM | BELEGT (2 Analysen) | Beatport; AcousticBrainz |
| … Tonart a-Moll | WAHRSCHEINLICH (auch C-Dur/d-Moll gemeldet) | Beatport; AcousticBrainz |
| „Enjoy the Silence“: Bass **Minimoog Model D + ARP 2600**; Chor von einer **Emulator-II-Diskette**, dazu Streicher- und „Big Brass“-Disketten | WAHRSCHEINLICH (Nachbau-Video, nicht dokumentiert) | Reverb „The Synth Sounds of Depeche Mode's Enjoy the Silence“ |
| ETS: Grundlage war ein Dance-Beat und eine **zitternde („trembling“) Synth-Bassline**, von Wilder und Flood auf einem großen Modularsystem erarbeitet, das Flood mitbrachte | WAHRSCHEINLICH (eine Quelle) | Louder Sound |
| Violator: Wilder baute eine Hauptsequenz auf seinem **ARP mit Sequenzer**; der Reiz seien kleine Timing- und Stimmungs-Abweichungen bei jedem Durchlauf | WAHRSCHEINLICH (Wilder-Zitat, Titel im Auszug unklar) | Audiofanzine „Recording secrets of Depeche Mode's cult album“ |
| ETS: 113 BPM, c-Moll | WAHRSCHEINLICH (dmlive; DJ-Analyse sagt f-Moll) | dmlive.wiki; uwaterloo |
| „Personal Jesus“: Hauptrhythmus = Aufnahme von 2–3 Leuten, die auf **Flightcases** springen, geloopt und bearbeitet, gemischt mit E-Snare und Toms; Blues-Gitarrenriff im Stil John Lee Hooker; „Kraftwerk-artige“ Synths | BELEGT (Wilder via dmlive + Orkus) | dmlive.wiki „Personal Jesus“; Orkus |
| PJ: ≈ 130 BPM, fis-Moll | BELEGT (Wikipedia, dmlive 129, AcousticBrainz 130) | Wikipedia; dmlive.wiki; AcousticBrainz |
| Welcher Synth in PJ die Bass-/Synth-Teile spielt | UNBELEGT | – |

**Nicht nachbaubar:** Samples (Metall, Stampfen, Emulator-Chor) – die App hat keinen Sampler und darf fremde Aufnahmen ohnehin nicht nutzen (§1). Alles wird **synthetisch angenähert** (Drum-Synth, FM, WT). Die Gitarre von PJ hat keine Engine (später Klangkörper V9b).

### 3.2 Stil-Merkmale (für Hörproben und Demos)

| Merkmal | Wert | Status |
|---|---|---|
| Tempo-Bereiche | 1981: ≈ 128; 1983: ≈ 114; 1989/90: 113–130 | BELEGT/WAHRSCHEINLICH wie §3.1 |
| Tonarten | Moll überwiegt ab 1983 (a-, c-, fis-Moll gemeldet); 1981 Dur-Pop | WAHRSCHEINLICH |
| 1981: einstimmige Linien, die ineinandergreifen („Synths spielten nur einen Ton zugleich – gut, wir konnten eh keine Akkorde“) | Linien-Pop statt Akkorde | BELEGT (Zitat im MusicRadar-Titel) |
| 1983: Metall-Schläge als Rhythmus, Riff aus einer FM-/Sampler-Farbe, Moll-Modal | – | BELEGT (Sampling), WAHRSCHEINLICH (Riff-Farbe) |
| 1989/90: 16tel-Sequenzbass mit leichter Unschärfe, Chor-Fläche, Four-on-the-floor, Gitarre als Hook | – | WAHRSCHEINLICH |
| Arrangement: Riff allein im Intro, Strophe dünn, Refrain mit Gegenlinie | – | UNBELEGT (Hör-Einschätzung) |

### 3.3 DM1 „Kettenreim-Lead“ – Rolle Lead/Hook · VA

- **Vorbild (ⓘ):** heller, kurzer Poly-Lead der frühen 80er, wie bei „Just Can't Get Enough“ (Gerät laut einer Quelle Jupiter-4, WAHRSCHEINLICH). Patch UNBELEGT.
- **Rezept:** `o1w 1, o1pw .4, o2w 0, o2oct 1, o2fine 4, o2lvl .35, ftype 0, cutoff 2600, res .15, drive .15, kt .6, fenv .2, fA .001, fD .18, fS .35, fR .12, aA .001, aD .35, aS .45, aR .12, ampVel .45, poly 4, analog .15, spread .15` · fx `{chorus:{mode:'I', mix:.35}, dly .18, rev .15}` · bus `{echo:{mode:'mono', divL:'1/8', fb .2}}`
- **Warum so (Entwurf):** Puls 40 % gibt den hohlen, „plinkenden“ Kern, die Säge eine Oktave höher (35 %) den Glanz. Filter-Hüllkurve nur +14 HT (0,2 · 72) mit 0,18 s: jeder 16tel-Ton bekommt ein kleines „Tick“. Amp-Sustain 45 %: kurze Töne klingen knackig, längere bleiben stehen. Chorus I nur leicht – Clarke spielte mono-Linien, kein breites Pad.
- **Lage / Rolle:** Bb4–C6 (70–84), am besten A4–C6. Lead. LAGE-Klammer **tief A4** (darunter wird der Puls mumpfig).
- **Hörprobe** (F-Dur statt der Original-Tonart; Tonwiederholung + Nachbarton-Figur, Frage T1–2, Antwort T3, Anstieg auf C6 in T4):
```
Tempo 128 BPM · 4 Takte · F-Dur · Akkorde: F | Dm | Bb | C
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: C5(72) 0/1/110 · F5(77) 1/1/90 · F5(77) 3/1/100 · G5(79) 4/1/90 · A5(81) 6/2/105 · G5(79) 8/1/90 · F5(77) 9/1/85 · D5(74) 10/2/95 · F5(77) 12/1/100 · C5(72) 14/2/90
T2: D5(74) 16/1/108 · F5(77) 17/1/90 · F5(77) 19/1/98 · A5(81) 20/1/92 · C6(84) 22/2/105 · A5(81) 24/1/90 · G5(79) 25/1/85 · F5(77) 26/2/95 · E5(76) 28/1/92 · D5(74) 30/2/88
T3: Bb4(70) 32/1/108 · D5(74) 33/1/90 · F5(77) 35/1/98 · D5(74) 36/1/90 · Bb5(82) 38/2/105 · A5(81) 40/1/90 · G5(79) 41/1/85 · F5(77) 42/2/95 · D5(74) 44/1/92 · F5(77) 46/2/90
T4: C5(72) 48/1/108 · E5(76) 49/1/90 · G5(79) 51/1/98 · C6(84) 52/2/105 · Bb5(82) 54/1/90 · A5(81) 55/1/88 · G5(79) 56/2/96 · E5(76) 58/1/90 · G5(79) 60/1/100 · C6(84) 62/2/112
```
aud-Daten (Spec v3 §12.8, Schläge = 16tel ÷ 4): `[[0,0.25,72,110],[0.25,0.25,77,90],[0.75,0.25,77,100],[1,0.25,79,90],[1.5,0.5,81,105],[2,0.25,79,90],[2.25,0.25,77,85],[2.5,0.5,74,95],[3,0.25,77,100],[3.5,0.5,72,90],[4,0.25,74,108],[4.25,0.25,77,90],[4.75,0.25,77,98],[5,0.25,81,92],[5.5,0.5,84,105],[6,0.25,81,90],[6.25,0.25,79,85],[6.5,0.5,77,95],[7,0.25,76,92],[7.5,0.5,74,88],[8,0.25,70,108],[8.25,0.25,74,90],[8.75,0.25,77,98],[9,0.25,74,90],[9.5,0.5,82,105],[10,0.25,81,90],[10.25,0.25,79,85],[10.5,0.5,77,95],[11,0.25,74,92],[11.5,0.5,77,90],[12,0.25,72,108],[12.25,0.25,76,90],[12.75,0.25,79,98],[13,0.5,84,105],[13.5,0.25,82,90],[13.75,0.25,81,88],[14,0.5,79,96],[14.5,0.25,76,90],[15,0.25,79,100],[15.5,0.5,84,112]]`
- **Karte:** „Heller, kurzer Hook mit Tonwiederholungen – erinnert an den Hüpf-Pop von 1981 (Stil Depeche Mode).“

### 3.4 DM2 „Zählwerk-Kit 81“ – Rolle Drums · Drum-Synth

- **Vorbild (ⓘ):** einfache Rhythmusmaschine (Korg KR-55) mit einer Bassdrum aus einem Modular-Synth (ARP 2600) (BELEGT). Klangwerte UNBELEGT.
- **Kit-Rezept (Abweichungen von `DEFAULTS`):**
  - KICK (Synth-Kick statt Sample): `{tLvl 1, wav 'sine', frq 62, pAmt 14, pDec .03, tDec .22, cLvl .15, drv .1}` – kurzer Tonhöhen-Fall, kein Nachdröhnen.
  - SNARE (dünn, Maschinen-Snare): `{tLvl .6, frq 230, tDec .07, nLvl .9, nTyp 'highpass', nFrq 2500, nDec .12}`
  - HH ZU: `{mLvl .4, mHp 8000, mDec .03, nLvl .6, nTyp 'highpass', nFrq 9000, nDec .03}`
  - RIM (Klanghölzchen): `{tLvl 1, wav 'triangle', frq 520, tDec .02, lvl .55}`
  - Kit-Bus: `room .3`, `gate 0`, Sends `sRoom .08` auf SNARE/RIM, KICK trocken.
- **Lage / Rolle:** Drums, trocken, Transposition gilt nicht.
- **Hörprobe** (128 BPM, Kick auf 1 und 3, Klanghölzchen synkopiert, Takt 4 Kick-Lauf + Doppel-Snare):
```
Tempo 128 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK  | x.......x....... | x.......x.....x. | x.......x....... | x.......x.x.x.x.
SNARE | ....x.......x... | ....x.......x... | ....x.......x... | ....x.......x.xx
HH ZU | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.x.xx | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.....
RIM   | ...x......x..... | ......x....x.... | ...x......x..x.. | ..x..x..........
```
- **Karte:** „Dünne Rhythmusmaschine mit Synth-Bassdrum – erinnert an den Synthpop von 1981 (Stil Depeche Mode).“

### 3.5 DM3 „Hallen-Stahl FM“ – Rolle Lead/Riff · FM6

- **Vorbild (ⓘ):** schnarrendes FM-Riff aus einem DX7-Werks-Lead (laut Fan-Wiki „SYN-LEAD 2“, WAHRSCHEINLICH) über Synclavier- und Metall-Klängen (BELEGT als Klangwelt 1983).
- **Rezept (`p.fm6`, Grundlage: DX7-Werksklang ROM1A „SYN-LEAD 1“ aus `fmresearch/proto/rom1a.json` – das ist der Schwester-Klang; die Daten von ROM2B „SYN-LEAD 2“ liegen **nicht** vor, Unterschied UNBELEGT):** `alg 18, fb 7, trans 0` (ROM: +12; hier 0, damit die Hörprobe nicht schrill wird)
  - OP1 Träger: `OP(1, 99, [99,0,12,70], [99,95,95,0], {det 1, rs 1})`
  - OP2: `OP(1, 71, [99,95,0,0], [99,96,89,0], {det -1, rs 3, vs 2})` (Änderung: `vs 2`, Anschlag öffnet den Biss)
  - OP3 (Feedback): `OP(1, 82, [99,87,0,0], [93,90,0,0], {rs 3, ks {bp 32, ld 0, rd 21, lc 0, rc 0}})`
  - OP4: `OP(2, 71, [99,92,28,60], [99,90,0,0], {det 2, rs 6, vs 2, ks {bp 48, ld 0, rd 60, lc 0, rc 0}})`
  - OP5: `OP(3, 43, [99,99,97,0], [99,65,60,0], {det -2, rs 1})`
  - OP6: `OP(17, 47, [99,70,60,0], [99,99,97,0], {rs 3, ks {bp 32, ld 0, rd 21, lc 0, rc 0}})`
  - common `{gain -8 (nicht gemessen), mode 0, poly 4, lfo {wave 'sine', rate 5.5, delay .6, pitch .1}}` · fx `{chorus:{mode:'I', mix:.25}, dly .2, rev .25}` · bus `{echo:{mode:'pp', divL:'1/8.', fb .25}}`
- **Warum so:** Algorithmus 18 hängt drei Modulatoren parallel an einen Träger, OP3 mit Feedback 7 macht die Säge-Schärfe, OP6 ×17 gibt den hohen „Schnarr“-Anteil – das ist der typische DX-Lead-Charakter der Werks-Sounds (BELEGT als ROM1A-Daten, nicht als „Everything Counts“-Patch). R6-Regel beachtet: Modulatoren erst ab OL ≈ 62 deutlich hörbar – OP5/OP6 bleiben bewusst leise (wie im ROM).
- **Dazu:** R6 **N06 „Blechhammer“** (FM6, Metall-Anschlag) als zweite Spur für die Metall-Schläge; Tag jetzt BELEGT (§10).
- **Lage / Rolle:** G4–B5 (67–83), am besten E4–E6. Riff über Bass. LAGE-Klammer **tief E4**.
- **Hörprobe** (114 BPM, **e-Moll** statt a-Moll, synkopiertes 2-1-2-Muster, Takt 4 läuft über die Dur-Terz Fis abwärts):
```
Tempo 114 BPM · 4 Takte · e-Moll · Akkorde: Em | Em | C | D
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E5(76) 0/2/105 · G5(79) 2/1/90 · A5(81) 3/2/100 · G5(79) 5/1/85 · E5(76) 6/2/95 · D5(74) 8/2/95 · E5(76) 10/3/100 · B4(71) 14/2/85
T2: E5(76) 16/2/105 · G5(79) 18/1/90 · B5(83) 19/2/102 · A5(81) 21/1/88 · G5(79) 22/2/95 · F#5(78) 24/2/92 · E5(76) 26/4/98
T3: C5(72) 32/2/100 · E5(76) 34/1/88 · G5(79) 35/2/98 · E5(76) 37/1/85 · C5(72) 38/2/92 · B4(71) 40/2/90 · C5(72) 42/3/96 · G4(67) 46/2/85
T4: D5(74) 48/2/100 · F#5(78) 50/1/90 · A5(81) 51/2/102 · B5(83) 53/1/92 · A5(81) 54/2/96 · F#5(78) 56/2/92 · E5(76) 58/2/95 · D5(74) 60/2/90 · B4(71) 62/2/88
```
aud-Daten (Spec v3 §12.8, Schläge = 16tel ÷ 4): `[[0,0.5,76,105],[0.5,0.25,79,90],[0.75,0.5,81,100],[1.25,0.25,79,85],[1.5,0.5,76,95],[2,0.5,74,95],[2.5,0.75,76,100],[3.5,0.5,71,85],[4,0.5,76,105],[4.5,0.25,79,90],[4.75,0.5,83,102],[5.25,0.25,81,88],[5.5,0.5,79,95],[6,0.5,78,92],[6.5,1,76,98],[8,0.5,72,100],[8.5,0.25,76,88],[8.75,0.5,79,98],[9.25,0.25,76,85],[9.5,0.5,72,92],[10,0.5,71,90],[10.5,0.75,72,96],[11.5,0.5,67,85],[12,0.5,74,100],[12.5,0.25,78,90],[12.75,0.5,81,102],[13.25,0.25,83,92],[13.5,0.5,81,96],[14,0.5,78,92],[14.5,0.5,76,95],[15,0.5,74,90],[15.5,0.5,71,88]]`
- **Karte:** „Schnarrendes FM-Riff in Moll mit Echo – erinnert an die Fabrik-Klänge von 1983 (Stil Depeche Mode).“

### 3.6 DM4 „Zitter-Bass 90“ – Rolle Bass/Sequenz · VA

- **Vorbild (ⓘ):** 16tel-Sequenzbass aus analogen Synths (Minimoog/ARP 2600, WAHRSCHEINLICH), der durch kleine Timing- und Stimmungs-Schwankungen „lebt“ (WAHRSCHEINLICH, Wilder-Zitat).
- **Rezept:** `o1w 0, o2w 0, o2fine -6, o2lvl .8, o3w 1, o3oct -1, o3lvl .3, ftype 0, cutoff 420, res .3, drive .3, bass .5, kt .4, fenv .4, fA .001, fD .14, fS .15, fR .08, aA .001, aD .22, aS .55, aR .06, ampVel .45, mode 1, poly 1, reset 0, analog .45, spread 0` · Routen `M('rnd','pitch', .002)` (≈ ±5 ct je Note), `M('rnd','cutoff', .03)` (≈ ±3,6 HT je Note), `M('vel','fenv', .2)` · fx `{dly .12, rev .12}` · bus `{echo:{mode:'pp', divL:'1/16', fb .15}}`
- **Warum so:** Das „Zittern“ kommt nicht vom LFO (der würde gleichmäßig wabern), sondern von **Zufall je Note** auf Tonhöhe und Cutoff – das ahmt einen analogen Sequenzer nach, der bei jedem Durchlauf minimal anders spielt. `reset 0` + `analog .45`: die Oszillatoren laufen frei, jeder Ton beginnt anders.
- **Lage / Rolle:** F1–G3 (29–55), am besten D1–D3. LAGE-Klammer **hoch G3**.
- **Hörprobe** (113 BPM, **d-Moll** statt c-Moll, „blubbernde“ 16tel aus Grundton–Oktave–Quinte mit Lücken, Takt 4 steigt in Achteln auf):
```
Tempo 113 BPM · 4 Takte · d-Moll · Akkorde: Dm | Bb | F | C
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D2(38) 0/1/108 · D3(50) 1/1/80 · A2(45) 2/1/90 · D3(50) 3/1/80 · D2(38) 4/1/108 · D3(50) 5/1/80 · C3(48) 6/1/90 · D3(50) 7/1/80 · D2(38) 8/1/108 · D3(50) 9/1/80 · A2(45) 10/1/90 · F2(41) 11/1/80 · D2(38) 12/1/108 · A2(45) 14/1/90 · C3(48) 15/1/80
T2: Bb1(34) 16/1/108 · Bb2(46) 17/1/80 · F2(41) 18/1/90 · Bb2(46) 19/1/80 · Bb1(34) 20/1/108 · Bb2(46) 21/1/80 · A2(45) 22/1/90 · Bb2(46) 23/1/80 · Bb1(34) 24/1/108 · Bb2(46) 25/1/80 · F2(41) 26/1/90 · D2(38) 27/1/80 · Bb1(34) 28/1/108 · C2(36) 30/1/90
T3: F1(29) 32/1/108 · F2(41) 33/1/80 · C2(36) 34/1/90 · F2(41) 35/1/80 · F1(29) 36/1/108 · F2(41) 37/1/80 · E2(40) 38/1/90 · F2(41) 39/1/80 · F1(29) 40/1/108 · F2(41) 41/1/80 · C2(36) 42/1/90 · A1(33) 43/1/80 · F1(29) 44/1/108 · A1(33) 46/1/90 · C2(36) 47/1/80
T4: C2(36) 48/1/108 · C3(48) 49/1/80 · G2(43) 50/1/90 · C3(48) 51/1/80 · C2(36) 52/1/108 · C3(48) 53/1/80 · Bb2(46) 54/1/90 · C3(48) 55/1/80 · E2(40) 56/1/116 · G2(43) 57/1/88 · C3(48) 58/1/98 · E3(52) 59/1/88 · G3(55) 60/1/116 · E3(52) 61/1/88 · C3(48) 62/1/98 · Bb2(46) 63/1/88
```
aud-Daten (Spec v3 §12.8, Schläge = 16tel ÷ 4): `[[0,0.25,38,108],[0.25,0.25,50,80],[0.5,0.25,45,90],[0.75,0.25,50,80],[1,0.25,38,108],[1.25,0.25,50,80],[1.5,0.25,48,90],[1.75,0.25,50,80],[2,0.25,38,108],[2.25,0.25,50,80],[2.5,0.25,45,90],[2.75,0.25,41,80],[3,0.25,38,108],[3.5,0.25,45,90],[3.75,0.25,48,80],[4,0.25,34,108],[4.25,0.25,46,80],[4.5,0.25,41,90],[4.75,0.25,46,80],[5,0.25,34,108],[5.25,0.25,46,80],[5.5,0.25,45,90],[5.75,0.25,46,80],[6,0.25,34,108],[6.25,0.25,46,80],[6.5,0.25,41,90],[6.75,0.25,38,80],[7,0.25,34,108],[7.5,0.25,36,90],[8,0.25,29,108],[8.25,0.25,41,80],[8.5,0.25,36,90],[8.75,0.25,41,80],[9,0.25,29,108],[9.25,0.25,41,80],[9.5,0.25,40,90],[9.75,0.25,41,80],[10,0.25,29,108],[10.25,0.25,41,80],[10.5,0.25,36,90],[10.75,0.25,33,80],[11,0.25,29,108],[11.5,0.25,33,90],[11.75,0.25,36,80],[12,0.25,36,108],[12.25,0.25,48,80],[12.5,0.25,43,90],[12.75,0.25,48,80],[13,0.25,36,108],[13.25,0.25,48,80],[13.5,0.25,46,90],[13.75,0.25,48,80],[14,0.25,40,116],[14.25,0.25,43,88],[14.5,0.25,48,98],[14.75,0.25,52,88],[15,0.25,55,116],[15.25,0.25,52,88],[15.5,0.25,48,98],[15.75,0.25,46,88]]`
- **Karte:** „Blubbernder 16tel-Bass, der leicht zittert wie ein alter Sequenzer – erinnert an den Stadion-Synthpop von 1990 (Stil Depeche Mode).“

### 3.7 DM5 „Koffer-Stampf“ – Rolle Drums · Drum-Synth

- **Vorbild (ⓘ):** gesampeltes Stampfen auf Flightcases, geloopt, mit E-Snare gemischt (BELEGT). Hier **synthetisch** nachgebaut (kein Sample).
- **Kit-Rezept:**
  - KICK „Stampf tief“: `{tLvl 1, frq 48, pAmt 8, pDec .04, tDec .35, nLvl .5, nTyp 'lowpass', nFrq 900, nDec .08, drv .35, sRoom .35}` – dumpfer Holz-Schlag mit Raum.
  - CLAP „Koffer-Knall“: `{nLvl 1.2, nTyp 'bandpass', nFrq 900, nQ .8, nBur 2, nGap .015, nDec .18, tLvl .5, frq 110, tDec .08, drv .4, sRoom .4}` – zwei Füße knapp versetzt (`nBur 2`), hohl.
  - SHAKER: `{nLvl .7, nTyp 'highpass', nFrq 6000, nAtk .01, nDec .06, lvl .45}`
  - Kit-Bus: `room 1.6` (großer Raum), `gate 0`.
- **Hörprobe** (130 BPM, Stampfen auf 1/3, Knall auf 2/4, Takt 3–4 mit Vorschlägen):
```
Tempo 130 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK   | x.......x....... | x.......x...x... | x.......x....... | x.....x.x...x...
CLAP   | ....x.......x... | ....x.......x... | ....x.......x..x | ....x.......x.x.
SHAKER | ..x...x...x...x. | ..x...x...x...x. | ..x...x.x.x...x. | ..x...x...x.....
```
- **Karte:** „Dumpfes Stampfen im großen Raum statt Drumcomputer – erinnert an den Blues-Synthpop von 1989 (Stil Depeche Mode).“

### 3.8 Hörprobe für R6 N05 „Kapellen-Chor“ (WT, Rezept in R6)

- **Tag-Update:** Chor auf „Enjoy the Silence“ von einer Emulator-II-Diskette (WAHRSCHEINLICH, Reverb). Rolle: Fläche. Lage Eb3–C5 (51–72).
- **Hörprobe** (113 BPM, **g-Moll**, i–VI–III–VII als Allerweltsfolge, Oberstimme wandert, Takt 4 steigt auf C5):
```
Tempo 113 BPM · 4 Takte · g-Moll · Akkorde: Gm | Eb | Bb | F
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: G3(55) 0/16/82 · D4(62) 0/16/82 · Bb4(70) 0/8/86 · A4(69) 8/8/84
T2: Eb3(51) 16/16/82 · Bb3(58) 16/16/82 · G4(67) 16/8/86 · Bb4(70) 24/8/88
T3: F3(53) 32/16/82 · Bb3(58) 32/16/82 · D4(62) 32/12/86 · F4(65) 44/4/84
T4: F3(53) 48/16/84 · C4(60) 48/16/84 · A4(69) 48/8/88 · C5(72) 56/8/92
```
aud-Daten (Spec v3 §12.8, Schläge = 16tel ÷ 4): `[[0,4,55,82],[0,4,62,82],[0,2,70,86],[2,2,69,84],[4,4,51,82],[4,4,58,82],[4,2,67,86],[6,2,70,88],[8,4,53,82],[8,4,58,82],[8,3,62,86],[11,1,65,84],[12,4,53,84],[12,4,60,84],[12,2,69,88],[14,2,72,92]]`

---

## 4. a-ha (`vorbild: a-ha`)

### 4.1 Belege

| Fakt | Status | Quelle |
|---|---|---|
| Produzent Alan Tarney: **sein Juno 60** lieferte das Hauptthema; dazu eine **LinnDrum, die Pål programmierte** | BELEGT (Primärquelle, SE) | SOS Classic Tracks „a-ha ‚Take On Me‘“ (März 2011, Richard Buskin) |
| Juno-60 trägt die Melodie (Furuholmen spielt sie) | BELEGT (2 Quellen) | Roland „Sound Behind the Song“; Wikipedia „Take On Me“; American Songwriter |
| **Widerspruch:** Wer spielte den Juno – Tarney („mein Juno“) oder Furuholmen? | offen | SOS vs. Vintage Digital/Wikipedia |
| Im Song außerdem **Yamaha DX7** und **PPG Wave** | WAHRSCHEINLICH (Wikipedia-Spiegel, Imaginando, American Songwriter; Part unklar) | Wikipedia; Imaginando |
| „Juno-60 per MIDI an den DX7“ | **UNBELEGT/zweifelhaft:** der Juno-60 hat kein MIDI, nur DCB (eK, Roland-Wissen; ein Umsetzer wäre nötig) | Wikipedia-Spiegel (Suchauszug) |
| LinnDrum nur auf den späteren Fassungen; Pål spielte echte Becken und HiHat darüber; Snare nicht der Linn-Werksklang | WAHRSCHEINLICH (Fan-Seite) | burningtheground.net |
| Alle Instrumente per DI aufgenommen, Effekte danach | WAHRSCHEINLICH (Forum zitiert Toningenieur) | Gearspace |
| Lexicon 224/224X | WAHRSCHEINLICH (eine Quelle) | Vintage Digital |
| TOM: **169 BPM, A-Dur** | WAHRSCHEINLICH (Wikipedia allein) | Wikipedia „Take On Me“ |
| „The Sun Always Shines on T.V.“: Drums zu 100 % Linn; **zwei Synth-Bässe live**, ausgelöst von Kuhglocke und Sidestick der Linn; keine Sequenzer in den frühen Tagen | WAHRSCHEINLICH (Primär-Interview, aber nur ein Suchauszug; ein zweiter Suchlauf fand die Stelle nicht) | Dan LeRoy, „Hiding in Plain Sight: An Interview with Paul Waaktaar-Savoy“ (Substack) |
| TSASOTV: ≈ 126 BPM | BELEGT (2 Analysen: Mixmeister 126,3; AcousticBrainz 126) | uwaterloo-Datenbank; AcousticBrainz |
| … Tonart a-Moll | WAHRSCHEINLICH (auch C-Dur/e-Moll gemeldet) | wie oben |
| „Scoundrel Days“ (1986): Kennklänge aus einem PPG Wave, Drums und Effekte aus einem Fairlight | WAHRSCHEINLICH (Wikipedia) | Wikipedia „Scoundrel Days“ |
| Juno-60: ein Oszillator, Hochpass, Tiefpass, eine ADSR, ein LFO | WAHRSCHEINLICH (Wikipedia) | Wikipedia „Roland Juno-60“ |
| Welcher Synth den Bass von TOM spielt | UNBELEGT | – |

### 4.2 Stil-Merkmale

| Merkmal | Wert | Status |
|---|---|---|
| Tempo | schnell (169) oder treibend (126) | wie §4.1 |
| Melodik | hohe Lage, große Sprünge, gebrochene Akkorde in Achteln | UNBELEGT (Hör-Einschätzung) |
| Drums | Linn, programmiert, echte Becken darüber | BELEGT/WAHRSCHEINLICH |
| Bass von Drum-Spuren getriggert (TSASOTV) | rhythmisch „gegatet“, 16tel-Synkopen | WAHRSCHEINLICH |
| Arrangement | Synth-Hook als Intro und zwischen den Strophen; großes Streicher-/Chor-Intro bei TSASOTV | UNBELEGT |

### 4.3 AH1 „Fjordlauf-Lead“ – Rolle Lead/Hook · VA

- **Vorbild (ⓘ):** heller Poly-Synth mit einem Oszillator und Chorus, schnelle Achtel in hoher Lage (Juno-60 als Gerät BELEGT; Patch UNBELEGT).
- **Rezept:** `o1w 0, o2w 1, o2pw .5, o2fine 0, o2lvl .55, subLvl .3, ftype 0, cutoff 3200, res .12, drive .1, kt .7, fenv .12, fA .002, fD .25, fS .6, fR .15, aA .002, aD .6, aS .75, aR .2, ampVel .4, poly 6, analog .05, spread .1` · fx `{chorus:{mode:'I', mix:.8}, dly .15, rev .2}` · bus `{echo:{mode:'pp', divL:'1/8', fb .2}}`
- **Warum so:** Ein Juno mischt Säge, Puls und Sub **aus demselben Oszillator** – deshalb Osz. 2 ohne Verstimmung (`o2fine 0`) und `analog .05` (DCO = stabil). Die Breite kommt allein vom Chorus I (80 %), nicht von Verstimmung. Wenig Filter-Hüllkurve: der Klang ist hell und gleichmäßig, damit schnelle Achtel bei 169 BPM nicht verschwimmen.
- **Lage / Rolle:** G4–E6 (67–88), am besten G4–E6. LAGE-Klammer **tief G4** (die Höhe ist das Kennzeichen).
- **Hörprobe** (169 BPM, **D-Dur** statt A-Dur, vi–IV–I–V, gebrochene Akkorde in Achteln statt des bekannten Hooks, Spitze E6 in Takt 4):
```
Tempo 169 BPM · 4 Takte · D-Dur · Akkorde: Bm | G | D | A
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: B4(71) 0/2/100 · D5(74) 2/2/90 · F#5(78) 4/2/95 · B5(83) 6/2/100 · A5(81) 8/2/92 · F#5(78) 10/2/90 · D5(74) 12/4/96
T2: G4(67) 16/2/98 · B4(71) 18/2/88 · D5(74) 20/2/92 · G5(79) 22/2/100 · F#5(78) 24/2/92 · D5(74) 26/2/88 · B4(71) 28/2/90 · D5(74) 30/2/92
T3: A4(69) 32/2/98 · D5(74) 34/2/90 · F#5(78) 36/2/95 · A5(81) 38/4/102 · G5(79) 42/2/90 · F#5(78) 44/2/90 · E5(76) 46/2/92
T4: E5(76) 48/2/98 · A5(81) 50/2/95 · C#6(85) 52/2/100 · E6(88) 54/4/110 · D6(86) 58/2/95 · C#6(85) 60/2/92 · A5(81) 62/2/90
```
aud-Daten (Spec v3 §12.8, Schläge = 16tel ÷ 4): `[[0,0.5,71,100],[0.5,0.5,74,90],[1,0.5,78,95],[1.5,0.5,83,100],[2,0.5,81,92],[2.5,0.5,78,90],[3,1,74,96],[4,0.5,67,98],[4.5,0.5,71,88],[5,0.5,74,92],[5.5,0.5,79,100],[6,0.5,78,92],[6.5,0.5,74,88],[7,0.5,71,90],[7.5,0.5,74,92],[8,0.5,69,98],[8.5,0.5,74,90],[9,0.5,78,95],[9.5,1,81,102],[10.5,0.5,79,90],[11,0.5,78,90],[11.5,0.5,76,92],[12,0.5,76,98],[12.5,0.5,81,95],[13,0.5,85,100],[13.5,1,88,110],[14.5,0.5,86,95],[15,0.5,85,92],[15.5,0.5,81,90]]`
- **Karte:** „Hell schimmernder Achtel-Lead in hoher Lage – erinnert an den Hymnen-Pop von 1985 (Stil a-ha).“

### 4.4 AH2 „Kasten-Klatsch 85“ – Rolle Drums · Drum-Synth

- **Vorbild (ⓘ):** programmierte LinnDrum mit echten Becken darüber (BELEGT/WAHRSCHEINLICH). Werks-Kit „Gated 84“ ist die Basis.
- **Kit-Rezept (Abweichungen von „Gated 84“):** KICK `{frq 56, tDec .25}` · SNARE `{frq 205, nFrq 3000, tDec .14, nDec .2, sGate .25}` (weniger Gate als „Gated 84“: die Aufnahme war DI und trocken, WAHRSCHEINLICH) · HH ZU `{mDec .035}` · BECKEN `{mDec 1.6, mLo .8}` (soll „echt“ klingen: lang) · Kit-Bus `room .8, gate .2`.
- **Hörprobe** (169 BPM, Kick 1 · 2+ · 3, Becken auf der Eins, Takt 4 Snare-Wirbel):
```
Tempo 169 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK   | x.....x.x....... | x.....x.x.....x. | x.....x.x....... | x.....x.x.x.x...
SNARE  | ....x.......x... | ....x.......x... | ....x.......x... | ....x.......xxxx
HH ZU  | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.x.x. | x.xxx.x.x.xxx.x. | x.x.x.x.........
BECKEN | x............... | ................ | ................ | ................
```
- **Karte:** „Knackige Drumcomputer-Schläge mit echtem Becken – erinnert an den Pop von 1985 (Stil a-ha).“

### 4.5 AH3 „Auslöser-Bass“ – Rolle Bass · VA

- **Vorbild (ⓘ):** zwei Synth-Bässe, die von Spuren der Drum-Maschine (Kuhglocke, Sidestick) angestoßen werden (WAHRSCHEINLICH, Interview).
- **Rezept:** `o1w 1, o1pw .35, o2w 0, o2oct -1, o2fine 0, o2lvl .7, ftype 0, cutoff 600, res .25, drive .25, bass .5, kt .4, fenv .35, fA .001, fD .12, fS .1, fR .06, aA .001, aD .18, aS .3, aR .05, ampVel .55, mode 1, poly 1, reset 1, analog .12, spread 0` · fx `{drive .15, rev .05}`
- **Warum so:** Zwei Bässe = Puls oben + Säge eine Oktave tiefer in **einem** Patch. Kurzes Amp-Decay und `reset 1`: jeder Anstoß klingt gleich hart, wie ein Gate von der Drum-Spur. Die Hörprobe übernimmt die Idee: der Bass spielt die 16tel-Synkopen, die eine Kuhglocke spielen würde.
- **Lage / Rolle:** C2–G3 (36–55), am besten C2–C3. LAGE-Klammer **hoch G3**.
- **Hörprobe** (126 BPM, **e-Moll** statt a-Moll, 3+3+2-Anstöße, Takt 4 springt über Fis auf):
```
Tempo 126 BPM · 4 Takte · e-Moll · Akkorde: Em | Em | C | D
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E2(40) 0/1/110 · E2(40) 2/1/88 · E2(40) 3/1/96 · E3(52) 4/1/100 · E2(40) 6/1/88 · E2(40) 7/1/96 · E2(40) 8/1/108 · E2(40) 10/1/88 · E3(52) 11/1/96 · E2(40) 12/1/100 · D3(50) 14/1/92 · B2(47) 15/1/90
T2: E2(40) 16/1/110 · E2(40) 18/1/88 · E2(40) 19/1/96 · E3(52) 20/1/100 · E2(40) 22/1/88 · E2(40) 23/1/96 · G2(43) 24/1/106 · G2(43) 26/1/88 · G3(55) 27/1/96 · A2(45) 28/1/100 · B2(47) 30/1/95 · D3(50) 31/1/90
T3: C2(36) 32/1/110 · C2(36) 34/1/88 · C2(36) 35/1/96 · C3(48) 36/1/100 · C2(36) 38/1/88 · C2(36) 39/1/96 · C2(36) 40/1/106 · C2(36) 42/1/88 · C3(48) 43/1/96 · C2(36) 44/1/100 · G2(43) 46/1/92 · E2(40) 47/1/90
T4: D2(38) 48/1/110 · D2(38) 50/1/88 · D2(38) 51/1/96 · D3(50) 52/1/100 · D2(38) 54/1/88 · D2(38) 55/1/96 · F#2(42) 56/1/106 · A2(45) 58/1/96 · D3(50) 59/1/100 · F#3(54) 60/1/112 · E3(52) 61/1/92 · D3(50) 62/1/96 · B2(47) 63/1/90
```
aud-Daten (Spec v3 §12.8, Schläge = 16tel ÷ 4): `[[0,0.25,40,110],[0.5,0.25,40,88],[0.75,0.25,40,96],[1,0.25,52,100],[1.5,0.25,40,88],[1.75,0.25,40,96],[2,0.25,40,108],[2.5,0.25,40,88],[2.75,0.25,52,96],[3,0.25,40,100],[3.5,0.25,50,92],[3.75,0.25,47,90],[4,0.25,40,110],[4.5,0.25,40,88],[4.75,0.25,40,96],[5,0.25,52,100],[5.5,0.25,40,88],[5.75,0.25,40,96],[6,0.25,43,106],[6.5,0.25,43,88],[6.75,0.25,55,96],[7,0.25,45,100],[7.5,0.25,47,95],[7.75,0.25,50,90],[8,0.25,36,110],[8.5,0.25,36,88],[8.75,0.25,36,96],[9,0.25,48,100],[9.5,0.25,36,88],[9.75,0.25,36,96],[10,0.25,36,106],[10.5,0.25,36,88],[10.75,0.25,48,96],[11,0.25,36,100],[11.5,0.25,43,92],[11.75,0.25,40,90],[12,0.25,38,110],[12.5,0.25,38,88],[12.75,0.25,38,96],[13,0.25,50,100],[13.5,0.25,38,88],[13.75,0.25,38,96],[14,0.25,42,106],[14.5,0.25,45,96],[14.75,0.25,50,100],[15,0.25,54,112],[15.25,0.25,52,92],[15.5,0.25,50,96],[15.75,0.25,47,90]]`
- **Karte:** „Pumpender Doppel-Bass, von der Drum-Maschine angestoßen – erinnert an den Moll-Pop von 1985 (Stil a-ha).“
- **Dazu passend (R6):** N04 „Fjord-Streicher“ (Intro-Fläche, Einschätzung) und die Werks-Sounds DCO-Streicher/DCO-Fläche.

---

## 5. Alphaville (`vorbild: alphaville`)

### 5.1 Belege

| Fakt | Status | Quelle |
|---|---|---|
| Album „Forever Young“: Jan.–Aug. 1984, Studio 54 Berlin | WAHRSCHEINLICH (Wikipedia; schon R6) | Wikipedia „Forever Young (album)“ |
| Marian Gold: die frühen Geräte waren „basically toys – the cheapest monophonic synthesizers“; Lloyd „very involved on the technical side“ | BELEGT (Primärquelle, SE) | Classic Pop „Godfathers of Pop: Marian Gold“ |
| Gold (2022): „Wir hatten damals kein Orchester, ‚nur‘ Synthesizer und Rhythmusmaschinen.“ | WAHRSCHEINLICH (Zitat im Auszug, Quelle nicht eindeutig) | Suchauszug (Quelle im Auszug nicht eindeutig benannt) |
| Geräteliste „aus dem Gedächtnis von Bernhard Lloyd“: Linn LM-1, TR-808, **MFB-Sequenzer**, **Jupiter-8**, **PPG Wave 2.3 + Waveterm**, System 100M, MS-20, MS-10, **Solina**, ARP Odyssey, Lexicon 224; Simmons SDS-5 gespielt von Curt Cress | WAHRSCHEINLICH (Forum zitiert Lloyd; Equipboard ähnlich) | Audiofanzine-Forum (fr.); Equipboard „Bernhard Lloyd“ |
| **Widerspruch zu R6:** R6 nennt den Jupiter-8 „nur für einen TV-Auftritt 1984“; die Lloyd-Liste führt ihn im Studio. | offen | wie oben |
| Nachbau-Videos (RetroSound) nennen Jupiter-8, PPG, **Logan String Melody**, ARP Odyssey | UNBELEGT als Original (Nachbau, keine Doku) | matrixsynth (RetroSound) |
| Welcher Part („Forever Young“-Fläche, „Sounds Like a Melody“-Hook, „Big in Japan“-Sequenz) von welchem Gerät kommt | **UNBELEGT** | – |
| „Forever Young“: C-Dur | WAHRSCHEINLICH (Wikipedia; DJ-Analyse sagt g-Moll) | Wikipedia „Forever Young (song)“ |
| „Forever Young“: ≈ 68,5 BPM (Traktor; Mixmeister doppelt 137,1) | WAHRSCHEINLICH (eine Analyse) | uwaterloo-Datenbank |
| „Big in Japan“: Lloyd Drumcomputer und Keyboards, Frank Mertens Keyboards, Wolfgang Loos Programmierung/Keyboards | WAHRSCHEINLICH (MusicBrainz-Credit einer Remix-Fassung) | MusicBrainz-Spiegel |
| „Sounds Like a Melody“: Streicher gegen Ende, arrangiert von Wolfgang Loos | WAHRSCHEINLICH (eine Quelle) | Suchauszug (Neue-Meister-/Wikipedia-Umfeld) |
| „Dance With Me“: aufgenommen Jan. 1986, Mediasound New York, Produzenten Steve Thompson und Michael Barbiero | WAHRSCHEINLICH (Wikipedia) | Wikipedia „Dance with Me (Alphaville song)“ |
| Tempo/Tonart „Big in Japan“, „Sounds Like a Melody“, „Dance With Me“ | UNBELEGT (Suchbudget erschöpft) | – |

**Folge:** Für Alphaville gibt es **keinen** belegten Original-Patch. Die Bibliothek darf nur „Klangwelt PPG/String-Machine/Jupiter (laut Geräteliste)“ sagen, nie „so klingt Forever Young“. Deshalb nur 1 neuer Sound; die R6-Rezepte N01–N03 bekommen Hörproben.

### 5.2 Stil-Merkmale

| Merkmal | Wert | Status |
|---|---|---|
| Ballade ≈ 68–70 BPM mit Drumcomputer, Fläche + heller Lead | – | WAHRSCHEINLICH (Tempo) / UNBELEGT (Klang) |
| Treibende Sequenzen (MFB-Sequenzer in der Liste) | – | WAHRSCHEINLICH (Gerät) / UNBELEGT (Part) |
| Große, hymnische Refrains mit Streichern (orchestral wirkend, aber aus Synths) | – | BELEGT (Gold-Zitat: nur Synths) |

### 5.3 Hörprobe für R6 N01 „Weitblick-Fläche“ (VA, Rezept in R6, gemessen [g])

- Lage E3–Bb4 (52–70). Rolle Fläche. Tempo 69 wie die Ballade (WAHRSCHEINLICH), **F-Dur** statt C-Dur.
```
Tempo 69 BPM · 4 Takte · F-Dur · Akkorde: F | Am | Bb | Csus4 → C
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: F3(53) 0/16/80 · A3(57) 0/16/80 · C4(60) 0/16/80 · F4(65) 0/8/84 · G4(67) 8/8/84
T2: E3(52) 16/16/80 · A3(57) 16/16/80 · C4(60) 16/16/80 · A4(69) 16/8/86 · E4(64) 24/8/82
T3: F3(53) 32/16/80 · Bb3(58) 32/16/80 · D4(62) 32/16/80 · Bb4(70) 32/8/88 · A4(69) 40/8/84
T4: G3(55) 48/16/82 · C4(60) 48/16/82 · F4(65) 48/8/84 · E4(64) 56/8/86
```
aud-Daten (Spec v3 §12.8, Schläge = 16tel ÷ 4): `[[0,4,53,80],[0,4,57,80],[0,4,60,80],[0,2,65,84],[2,2,67,84],[4,4,52,80],[4,4,57,80],[4,4,60,80],[4,2,69,86],[6,2,64,82],[8,4,53,80],[8,4,58,80],[8,4,62,80],[8,2,70,88],[10,2,69,84],[12,4,55,82],[12,4,60,82],[12,2,65,84],[14,2,64,86]]`
- **Karte:** „Langsam aufblühende Fläche für Hymnen-Balladen – erinnert an den Berliner Synthpop von 1984 (Stil Alphaville).“

### 5.4 AV2 „Neonzug-Sequenz“ – Rolle Sequenz · VA

- **Vorbild (ⓘ):** monophone Sequenz aus einem Analog-Sequenzer (MFB laut Geräteliste, WAHRSCHEINLICH). Part-Zuordnung UNBELEGT.
- **Rezept:** `o1w 1, o1pw .3, o2w 0, o2fine -5, o2lvl .45, ftype 0, cutoff 900, res .45, drive .2, kt .5, fenv .38, fA .001, fD .1, fS 0, fR .06, aA .001, aD .14, aS 0, aR .06, ampVel .5, mode 1, poly 1, reset 1, analog .2, spread 0` · fx `{dly .25, rev .2}` · bus `{echo:{mode:'pp', divL:'1/8', fb .3}}`
- **Warum so:** Resonanz 45 % + kurze Filter-Hk = „Tock“ jeder Stufe; Ping-Pong-Echo auf 1/8 füllt die Lücken zwischen den 16teln und macht die Sequenz breit.
- **Lage / Rolle:** F#2–F#4 (42–66), am besten F#2–F#4. LAGE-Klammer **C2–A4**.
- **Hörprobe** (124 BPM eigene Wahl, **h-Moll**, 16tel Grundton–Oktave–Quinte, Lücken in Takt 2/3, Takt 4 steigt auf F#4):
```
Tempo 124 BPM · 4 Takte · h-Moll · Akkorde: Bm | G | A | F#m
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: B2(47) 0/1/108 · B3(59) 1/1/80 · F#3(54) 2/1/90 · B3(59) 3/1/80 · D4(62) 4/1/108 · B3(59) 5/1/80 · F#3(54) 6/1/90 · B3(59) 7/1/80 · B2(47) 8/1/108 · B3(59) 9/1/80 · F#3(54) 10/1/90 · A3(57) 11/1/80 · B3(59) 12/1/108 · D4(62) 13/1/80 · C#4(61) 14/1/90 · A3(57) 15/1/80
T2: G2(43) 16/1/108 · G3(55) 17/1/80 · D3(50) 18/1/90 · G3(55) 19/1/80 · B3(59) 20/1/108 · D3(50) 22/1/90 · G3(55) 23/1/80 · G2(43) 24/1/108 · G3(55) 25/1/80 · D3(50) 26/1/90 · F#3(54) 27/1/80 · G3(55) 28/1/108 · B3(59) 29/1/80 · A3(57) 30/1/90 · F#3(54) 31/1/80
T3: A2(45) 32/1/108 · A3(57) 33/1/80 · E3(52) 34/1/90 · A3(57) 35/1/80 · C#4(61) 36/1/108 · A3(57) 37/1/80 · E3(52) 38/1/90 · A2(45) 40/1/108 · A3(57) 41/1/80 · E3(52) 42/1/90 · G3(55) 43/1/80 · A3(57) 44/1/108 · C#4(61) 45/1/80 · B3(59) 46/1/90 · G3(55) 47/1/80
T4: F#2(42) 48/1/108 · F#3(54) 49/1/80 · C#3(49) 50/1/90 · F#3(54) 51/1/80 · A3(57) 52/1/108 · F#3(54) 53/1/80 · C#3(49) 54/1/90 · F#3(54) 55/1/80 · A3(57) 56/1/116 · C#4(61) 57/1/88 · E4(64) 58/1/98 · F#4(66) 59/1/88 · E4(64) 60/1/116 · C#4(61) 61/1/88 · A3(57) 62/1/98 · F#3(54) 63/1/88
```
aud-Daten (Spec v3 §12.8, Schläge = 16tel ÷ 4): `[[0,0.25,47,108],[0.25,0.25,59,80],[0.5,0.25,54,90],[0.75,0.25,59,80],[1,0.25,62,108],[1.25,0.25,59,80],[1.5,0.25,54,90],[1.75,0.25,59,80],[2,0.25,47,108],[2.25,0.25,59,80],[2.5,0.25,54,90],[2.75,0.25,57,80],[3,0.25,59,108],[3.25,0.25,62,80],[3.5,0.25,61,90],[3.75,0.25,57,80],[4,0.25,43,108],[4.25,0.25,55,80],[4.5,0.25,50,90],[4.75,0.25,55,80],[5,0.25,59,108],[5.5,0.25,50,90],[5.75,0.25,55,80],[6,0.25,43,108],[6.25,0.25,55,80],[6.5,0.25,50,90],[6.75,0.25,54,80],[7,0.25,55,108],[7.25,0.25,59,80],[7.5,0.25,57,90],[7.75,0.25,54,80],[8,0.25,45,108],[8.25,0.25,57,80],[8.5,0.25,52,90],[8.75,0.25,57,80],[9,0.25,61,108],[9.25,0.25,57,80],[9.5,0.25,52,90],[10,0.25,45,108],[10.25,0.25,57,80],[10.5,0.25,52,90],[10.75,0.25,55,80],[11,0.25,57,108],[11.25,0.25,61,80],[11.5,0.25,59,90],[11.75,0.25,55,80],[12,0.25,42,108],[12.25,0.25,54,80],[12.5,0.25,49,90],[12.75,0.25,54,80],[13,0.25,57,108],[13.25,0.25,54,80],[13.5,0.25,49,90],[13.75,0.25,54,80],[14,0.25,57,116],[14.25,0.25,61,88],[14.5,0.25,64,98],[14.75,0.25,66,88],[15,0.25,64,116],[15.25,0.25,61,88],[15.5,0.25,57,98],[15.75,0.25,54,88]]`
- **Karte:** „Treibende Echo-Sequenz in Moll – erinnert an den Berliner Synthpop von 1984 (Stil Alphaville).“

### 5.5 Hörprobe für R6 N02 „Fanfaren-Lead“ (VA, gemessen [g])

- Lage C5–D6 (72–86). Rolle Lead/Hook. Tempo 118 (eigene Wahl, Original UNBELEGT), **G-Dur**.
```
Tempo 118 BPM · 4 Takte · G-Dur · Akkorde: G | Em | C | D
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D5(74) 0/2/100 · G5(79) 2/2/95 · B5(83) 4/3/105 · A5(81) 7/1/85 · G5(79) 8/2/95 · D5(74) 10/2/90 · E5(76) 12/4/96
T2: E5(76) 16/2/98 · G5(79) 18/2/92 · B5(83) 20/2/98 · D6(86) 22/2/106 · C6(84) 24/2/95 · B5(83) 26/2/92 · G5(79) 28/4/95
T3: C5(72) 32/2/98 · E5(76) 34/2/92 · G5(79) 36/3/100 · F#5(78) 39/1/85 · E5(76) 40/2/92 · C5(72) 42/2/90 · D5(74) 44/4/95
T4: D5(74) 48/2/98 · F#5(78) 50/2/95 · A5(81) 52/2/100 · C6(84) 54/2/106 · B5(83) 56/3/100 · A5(81) 59/1/88 · F#5(78) 60/4/96
```
aud-Daten (Spec v3 §12.8, Schläge = 16tel ÷ 4): `[[0,0.5,74,100],[0.5,0.5,79,95],[1,0.75,83,105],[1.75,0.25,81,85],[2,0.5,79,95],[2.5,0.5,74,90],[3,1,76,96],[4,0.5,76,98],[4.5,0.5,79,92],[5,0.5,83,98],[5.5,0.5,86,106],[6,0.5,84,95],[6.5,0.5,83,92],[7,1,79,95],[8,0.5,72,98],[8.5,0.5,76,92],[9,0.75,79,100],[9.75,0.25,78,85],[10,0.5,76,92],[10.5,0.5,72,90],[11,1,74,95],[12,0.5,74,98],[12.5,0.5,78,95],[13,0.5,81,100],[13.5,0.5,84,106],[14,0.75,83,100],[14.75,0.25,81,88],[15,1,78,96]]`
- **Karte:** „Heller Fanfaren-Hook mit Oktavsprung – erinnert an den Hymnen-Pop von 1984 (Stil Alphaville).“

### 5.6 Hörprobe für R6 N03 „Utopia-Glas“ (WT, Belegstatus u)

- Lage F#4–F#6 (66–90). Rolle Keys. Tempo 120 (eigene Wahl), **A-Dur**. Hinweis: Welcher Klang auf „Dance With Me“ gemeint ist, bleibt Rückfrage an Xander (R6 §9 Frage 3, weiter offen).
```
Tempo 120 BPM · 4 Takte · A-Dur · Akkorde: A | F#m | D | E
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A4(69) 0/2/95 · C#5(73) 2/1/85 · E5(76) 3/2/92 · A5(81) 5/1/85 · E5(76) 6/2/90 · C#5(73) 8/2/92 · E5(76) 10/1/85 · A5(81) 11/2/95 · B5(83) 13/1/85 · C#6(85) 14/2/100
T2: F#4(66) 16/2/95 · A4(69) 18/1/85 · C#5(73) 19/2/92 · F#5(78) 21/1/85 · C#5(73) 22/2/90 · A4(69) 24/2/92 · C#5(73) 26/1/85 · F#5(78) 27/2/95 · G#5(80) 29/1/85 · A5(81) 30/2/98
T3: D5(74) 32/2/95 · F#5(78) 34/1/85 · A5(81) 35/2/92 · D6(86) 37/1/88 · A5(81) 38/2/90 · F#5(78) 40/2/92 · A5(81) 42/1/85 · D6(86) 43/2/96 · E6(88) 45/1/88 · F#6(90) 46/2/104
T4: E5(76) 48/2/96 · G#5(80) 50/1/86 · B5(83) 51/2/94 · E6(88) 53/1/90 · D6(86) 54/2/92 · B5(83) 56/2/90 · G#5(80) 58/2/88 · E5(76) 60/4/94
```
aud-Daten (Spec v3 §12.8, Schläge = 16tel ÷ 4): `[[0,0.5,69,95],[0.5,0.25,73,85],[0.75,0.5,76,92],[1.25,0.25,81,85],[1.5,0.5,76,90],[2,0.5,73,92],[2.5,0.25,76,85],[2.75,0.5,81,95],[3.25,0.25,83,85],[3.5,0.5,85,100],[4,0.5,66,95],[4.5,0.25,69,85],[4.75,0.5,73,92],[5.25,0.25,78,85],[5.5,0.5,73,90],[6,0.5,69,92],[6.5,0.25,73,85],[6.75,0.5,78,95],[7.25,0.25,80,85],[7.5,0.5,81,98],[8,0.5,74,95],[8.5,0.25,78,85],[8.75,0.5,81,92],[9.25,0.25,86,88],[9.5,0.5,81,90],[10,0.5,78,92],[10.5,0.25,81,85],[10.75,0.5,86,96],[11.25,0.25,88,88],[11.5,0.5,90,104],[12,0.5,76,96],[12.5,0.25,80,86],[12.75,0.5,83,94],[13.25,0.25,88,90],[13.5,0.5,86,92],[14,0.5,83,90],[14.5,0.5,80,88],[15,1,76,94]]`

---

## 6. OMD (`vorbild: omd`)

### 6.1 Belege

| Fakt | Status | Quelle |
|---|---|---|
| „Enola Gay“: Muster auf der **CR-78 komplett selbst programmiert, kein Preset**; zuletzt hinzugefügt | BELEGT (Bandzitat) | Electronic Sound „Landmarks: Enola Gay“ |
| Melodien mit **Korg Micro-Preset** und **Roland SH-09**; dazu eine alte **Vox Jaguar** „durch viel Hall und Harmonizer, damit sie weniger dünn klingt“ | BELEGT (Bandzitat) | Electronic Sound |
| SH-09 für den **Bass** (statt Melodie) | WAHRSCHEINLICH, **Widerspruch** (Fanzine) | omd-messages.co.uk |
| Korg M-500 Micro-Preset per Versandkatalog gekauft, Ratenzahlung | BELEGT (2 Quellen, Beträge uneinig) | Electronic Sound; Confidentials |
| „Enola Gay“: ≈ 143 BPM (Mixmeister; Traktor 71,6 = halb), d-Moll | WAHRSCHEINLICH (eine Analyse) | uwaterloo-Datenbank |
| „Souvenir“: Chor aus **selbst geschnittenen Bandschleifen** einzeln gesungener Töne eines Liverpooler Chors (Amazon Studios, Dave Hughes); Humphreys baute die Akkorde, indem er **Fader hoch- und runterzog** | BELEGT (2 Quellen) | Wikipedia „Souvenir (song)“; uDiscover |
| „Souvenir“: Produzent Mike Howlett hat die Aufnahme per Varispeed schneller gemacht | WAHRSCHEINLICH (eine Quelle) | Suchauszug (Wikipedia-Umfeld) |
| Weil McCluskey die Chorklänge von „Souvenir“ liebte, kaufte die Band ein **Mellotron**; auf „Architecture & Morality“ „gibt es keinen Song, der nicht damit beladen ist“ (Humphreys) | BELEGT (Primärzitat) | uDiscover „Architecture & Morality“ |
| „Maid of Orleans“: der berühmte **Dudelsack-artige** Klang ist laut Humphreys ein **Geigen-Klang durch das Mellotron** | BELEGT (Primärzitat, SE) | Suchauszug zu omd-messages/Wikipedia „Maid of Orleans“ |
| … Intro: Chor-Akkordblöcke vom Mellotron gegen harte Schnitte von Pfeifenorgel und Snare-Wirbel | WAHRSCHEINLICH (Rezension) | Post-Punk Monk (2017) |
| … Walzer; Malcolm Holmes ersetzte die Drum-Maschine durch echtes Militär-Trommeln (The Manor) | WAHRSCHEINLICH (Rezension/Wikipedia) | Post-Punk Monk; Wikipedia |
| Mellotron im Studio (Mk1/M400), auf Tour ein Novatron mit eigenen OMD-Bändern (Streetly) | WAHRSCHEINLICH (Forum-Zitat McCluskey) | planetmellotron.com |
| „Electricity“ (1979): „Alles, was wir damals hatten, war ein Korg Micro-Preset … dazu ein Korg MS-20 und ein Roland FH-1“ (Humphreys) | BELEGT (Primärzitat) | uDiscover „We Wanted To Shun Rock Clichés“ |
| Welches Gerät die „Electricity“-Melodie spielt | UNBELEGT | – |
| Tempo/Tonart „Souvenir“, „Maid of Orleans“, „Electricity“ | UNBELEGT (Suchbudget) | – |

### 6.2 Stil-Merkmale

| Merkmal | Wert | Status |
|---|---|---|
| Instrumentaler Synth-Hook statt gesungenem Refrain (Enola Gay, Maid of Orleans) | – | UNBELEGT (Hör-Einschätzung) |
| Selbst programmierte, belebte Drumbox (16tel-Hats, Rim, Guiro) | – | BELEGT (selbst programmiert) / UNBELEGT (Muster) |
| Chor-Akkorde aus Einzeltönen, die einzeln ein- und ausgeblendet werden | – | BELEGT |
| Walzer/12/8 mit Marschtrommel (Maid of Orleans) | – | WAHRSCHEINLICH |
| Mono-Lead, Filter von Hand bewegt („Traveller“, R6 N07) | – | BELEGT (R6) |

### 6.3 Hörprobe für R6 N07 „Wanderer-Lead“ (VA, gemessen [g])

- Lage A4–B5 (69–83). Rolle Lead. 140 BPM, **a-Moll** statt d-Moll. Tipp für die Karte: beim Abspielen am Mod-Rad drehen (öffnet Filter + Resonanz wie der Traveller-Regler).
```
Tempo 140 BPM · 4 Takte · a-Moll · Akkorde: Am | F | G | E
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A4(69) 0/4/100 · C5(72) 4/2/92 · E5(76) 6/2/95 · D5(74) 8/6/100 · C5(72) 14/2/88
T2: A4(69) 16/2/92 · C5(72) 18/2/90 · F5(77) 20/4/102 · E5(76) 24/4/95 · C5(72) 28/4/90
T3: B4(71) 32/4/95 · D5(74) 36/2/90 · G5(79) 38/2/98 · F5(77) 40/4/98 · E5(76) 44/2/90 · D5(74) 46/2/88
T4: E5(76) 48/4/98 · G#5(80) 52/4/105 · B5(83) 56/6/110 · A5(81) 62/2/90
```
aud-Daten (Spec v3 §12.8, Schläge = 16tel ÷ 4): `[[0,1,69,100],[1,0.5,72,92],[1.5,0.5,76,95],[2,1.5,74,100],[3.5,0.5,72,88],[4,0.5,69,92],[4.5,0.5,72,90],[5,1,77,102],[6,1,76,95],[7,1,72,90],[8,1,71,95],[9,0.5,74,90],[9.5,0.5,79,98],[10,1,77,98],[11,0.5,76,90],[11.5,0.5,74,88],[12,1,76,98],[13,1,80,105],[14,1.5,83,110],[15.5,0.5,81,90]]`
- **Karte:** „Einfacher Mono-Lead, Filter mit der Hand geöffnet – erinnert an den Elektro-Pop von 1980 (Stil OMD).“

### 6.4 Hörprobe für R6 N08 „Kathedralen-Chor“ (WT) – „Fader-Akkorde“

- **Tag-Korrektur (§10):** „Souvenir“ = Bandschleifen, „Architecture & Morality“ = Mellotron. N08 bleibt ein Chor-Klang; die **Spielweise** der Hörprobe ahmt die Fader-Technik nach: Jede Stimme setzt einzeln ein (gestaffelte Starts), nie alle zugleich.
- Lage G3–A4 (55–69). 100 BPM eigene Wahl, D-Dur.
```
Tempo 100 BPM · 4 Takte · D-Dur · Akkorde: D | Dsus2 | G | A7
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D4(62) 0/32/80 · F#4(66) 4/28/78 · A4(69) 8/12/82
T2: E4(64) 20/12/76 · A4(69) 24/8/80
T3: G3(55) 32/16/80 · B3(59) 36/12/78 · D4(62) 40/8/82 · G4(67) 44/4/80
T4: A3(57) 48/16/82 · C#4(61) 52/12/80 · E4(64) 52/12/80 · G4(67) 56/8/84
```
aud-Daten (Spec v3 §12.8, Schläge = 16tel ÷ 4): `[[0,8,62,80],[1,7,66,78],[2,3,69,82],[5,3,64,76],[6,2,69,80],[8,4,55,80],[9,3,59,78],[10,2,62,82],[11,1,67,80],[12,4,57,82],[13,3,61,80],[13,3,64,80],[14,2,67,84]]`
- **Karte:** „Chor-Akkorde, deren Stimmen einzeln einblenden – erinnert an die Kathedralen-Popsongs von 1981 (Stil OMD).“

### 6.5 OM1 „Dudel-Geige“ – Rolle Lead · VA

- **Vorbild (ⓘ):** nasaler, dudelsack-artiger Lead aus einem Geigen-Bandklang (Mellotron) (BELEGT als Herkunft). Patch: Einschätzung.
- **Rezept:** `o1w 0, o2w 1, o2pw .2, o2oct 1, o2fine 0, o2lvl .3, noise .03, ftype 2, cutoff 1400, res .35, drive .2, kt .8, fenv .08, fA .02, fD .3, fS .8, aA .03, aD .3, aS .85, aR .25, ampVel .35, mode 2, poly 1, glide .02, l1shape 0, l1rate 5.5, l1fade .3, l2shape 0, l2rate .7, analog .2, spread 0` · Routen `M('lfo1','pitch', .004)` (Vibrato ≈ ±10 ct, verzögert), `M('lfo2','pitch', .002)` (langsames Band-„Leiern“ ≈ ±5 ct) · fx `{chorus:{mode:'I', mix:.3}, rev .35, dly .1}` · bus `{hall:{decay 3, size 1.1}}`
- **Warum so:** Bandpass 24 dB mit Keytrack 80 % ergibt den nasalen Formant eines Rohrblatt-/Geigen-Bandes; schmaler Puls oben drauf = Bordun-Schärfe. Zwei LFOs: schnelles Vibrato (Geige) und langsames Leiern (Bandmaschine im Mellotron). Legato + 20 ms Glide für die Verzierungen.
- **Lage / Rolle:** G4–B5 (67–83), am besten G4–C6. LAGE-Klammer **tief G4**.
- **Hörprobe** (70 BPM im 12/8-Gefühl = zwei 6/8-Takte je Takt, **a-Moll äolisch**, eigene Weise mit Dudelsack-Vorschlägen vor den Spitzentönen, Takt 4 Dur-Dominante E):
```
Tempo 70 BPM · 4 Takte · a-Moll (äolisch) · Akkorde: Am | G | F | E
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A4(69) 0/2.67/96 · C5(72) 2.67/1.33/84 · E5(76) 4/4/100 · D5(74) 8/2.67/92 · C5(72) 10.67/1.33/84 · B4(71) 12/2.67/90 · A4(69) 14.67/1.33/84
T2: G4(67) 16/2.67/94 · B4(71) 18.67/1.33/84 · E5(76) 19.5/0.5/70 · D5(74) 20/4/100 · C5(72) 24/2.67/92 · B4(71) 26.67/1.33/84 · G4(67) 28/4/90
T3: A4(69) 32/2.67/94 · C5(72) 34.67/1.33/84 · G5(79) 35.5/0.5/70 · F5(77) 36/4/102 · E5(76) 40/2.67/92 · D5(74) 42.67/1.33/84 · C5(72) 44/4/90
T4: B4(71) 48/2.67/94 · E5(76) 50.67/1.33/86 · A5(81) 51.5/0.5/72 · G#5(80) 52/2.67/104 · A5(81) 54.67/1.33/90 · B5(83) 56/4/108 · E5(76) 60/4/92
```
aud-Daten (Spec v3 §12.8, Schläge = 16tel ÷ 4): `[[0,0.6667,69,96],[0.6667,0.3333,72,84],[1,1,76,100],[2,0.6667,74,92],[2.6667,0.3333,72,84],[3,0.6667,71,90],[3.6667,0.3333,69,84],[4,0.6667,67,94],[4.6667,0.3333,71,84],[4.875,0.125,76,70],[5,1,74,100],[6,0.6667,72,92],[6.6667,0.3333,71,84],[7,1,67,90],[8,0.6667,69,94],[8.6667,0.3333,72,84],[8.875,0.125,79,70],[9,1,77,102],[10,0.6667,76,92],[10.6667,0.3333,74,84],[11,1,72,90],[12,0.6667,71,94],[12.6667,0.3333,76,86],[12.875,0.125,81,72],[13,0.6667,80,104],[13.6667,0.3333,81,90],[14,1,83,108],[15,1,76,92]]`
- **Karte:** „Nasale Bandgeige mit Verzierungen im Walzer-Gefühl – erinnert an die Hymnen-Instrumentals von 1981/82 (Stil OMD).“
- **Hinweis:** Die App kennt nur 4/4-Takte. Der Walzer wird als 12/8 in 4/4 notiert (Triolen-Raster). Ein echtes 3/4- oder 6/8-Taktmaß wäre eine Spec-Frage (§12).

### 6.6 Hörprobe für R6 N09 „Rhythmus-Box 78“ (Drums)

- 140 BPM, selbst programmiertes Muster (eigene Abfolge, nicht „Enola Gay“): dichte HiHats, Rim synkopiert, Guiro (SHAKER) einmal je zwei Takte, Takt 4 Doppel-Snare.
```
Tempo 140 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK   | x.....x...x..... | x.....x...x...x. | x.....x...x..... | x.....x.x.x.x...
SNARE  | ....x.......x... | ....x.......x... | ....x.......x... | ....x.......xx.x
HH ZU  | xxx.xxx.xxx.xxx. | xxx.xxx.xxx.xxx. | xxx.xxx.xxxxxxx. | xxx.xxx.x.x.x.x.
RIM    | ...x.......x.... | .......x........ | ...x.......x.... | ..x..x..........
SHAKER | x............... | ........x....... | x............... | ........x.......
```

---

## 7. The Human League (`vorbild: human-league`) – Ergänzung zu R6 N10–N12

### 7.1 Neue Belege

| Fakt | Status | Quelle |
|---|---|---|
| Martin Rushent machte aus dem Song einen Pop-Hit, die Band hasste die Fassung | BELEGT (SOS, Juli 2010, Richard Buskin; 2 Quellen) | SOS Classic Tracks „Don't You Want Me“; Burning the Ground |
| **Linn LM-1** für den Beat; Einzelausgänge, die Rushent einzeln am Pult mit EQ und Kompressor bearbeitete | BELEGT (2 Quellen) | Vintage Digital; Stereogum („erster Hit mit der LM-1“) |
| **Roland MC-4** sequenzierte „all of the spidery synth lines“ auf „Dare“ | WAHRSCHEINLICH (Blog; R6 Vintage Digital) | Post-Punk Monk |
| Synths: **Roland System 700, Jupiter-4, Yamaha CS-15** | WAHRSCHEINLICH (Gear-Artikel + Kapitel des Nachbau-Videos) | Sonic State / Alex Ball (2025); matrixsynth; Vintage-Gear-Artikel |
| Lead „vor allem mit dem Jupiter-4“, Oszillatoren in **Quinten**, Unisono und Chorus | WAHRSCHEINLICH (Nachbau-Rezept, schwach) | Syntorial „Don't You Want Me Lead“ |
| System 700 gehörte Rushent (Genetic Studio); System 100 der Band | UNBELEGT (Forum, umstritten) | KVR-Forum |
| Jo Callis frustriert: die einzige Gitarre des Albums steuerte nur ein Gate am Synth | WAHRSCHEINLICH (Wikipedia) | Wikipedia „Martin Rushent“ |
| ≈ 117,5–118 BPM, g-Moll | WAHRSCHEINLICH (DJ-Datenbank, mehrere Einträge derselben Quelle) | uwaterloo-Datenbank |
| Pro-One auf DYWM | UNBELEGT (nirgends erwähnt) | – |

### 7.2 HL1 „Quinten-Lead 81“ – Rolle Lead · VA

- **Vorbild (ⓘ):** Lead mit zwei Oszillatoren im Quint-Abstand, Unisono und Chorus (WAHRSCHEINLICH, Nachbau-Rezept); Gerät vermutlich Jupiter-4 (WAHRSCHEINLICH).
- **Rezept:** `o1w 0, o1uni 2, uniDet .15, o2w 0, o2semi 7, o2fine 3, o2lvl .7, ftype 0, cutoff 2400, res .15, drive .1, kt .6, fenv .15, fA .005, fD .4, fS .6, fR .25, aA .005, aD .5, aS .85, aR .25, ampVel .35, mode 2, poly 1, glide .02, analog .15, spread .2` · fx `{chorus:{mode:'II', mix:.5}, dly .2, rev .25}` · bus `{echo:{mode:'mono', divL:'1/8.', fb .2}}`
- **Warum so:** Die Quinte (`o2semi 7`, 70 %) macht jede Note zum „hohlen“ Zweiklang – das ist der Wiedererkennungs-Trick. Unisono 2 leicht verstimmt + Chorus II = der breite, leicht schwebende Ton. Legato, damit die Linie singt.
- **Lage / Rolle:** A4–G5 (69–79) (plus Quinte bis D6), am besten A4–G5. LAGE-Klammer **A4–C6** (darüber kreischt die Quinte).
- **Hörprobe** (118 BPM, **a-Moll** statt g-Moll, klagende Stufen-Melodie, Halbschluss auf D über G):
```
Tempo 118 BPM · 4 Takte · a-Moll · Akkorde: Am | F | C | G
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E5(76) 0/3/100 · D5(74) 3/1/85 · C5(72) 4/4/95 · A4(69) 8/4/90 · C5(72) 12/2/88 · D5(74) 14/2/90
T2: E5(76) 16/6/100 · F5(77) 22/2/90 · E5(76) 24/4/95 · D5(74) 28/4/90
T3: C5(72) 32/3/96 · B4(71) 35/1/84 · C5(72) 36/2/90 · E5(76) 38/2/92 · G5(79) 40/6/105 · F5(77) 46/2/90
T4: E5(76) 48/4/96 · D5(74) 52/4/92 · B4(71) 56/4/90 · D5(74) 60/4/94
```
aud-Daten (Spec v3 §12.8, Schläge = 16tel ÷ 4): `[[0,0.75,76,100],[0.75,0.25,74,85],[1,1,72,95],[2,1,69,90],[3,0.5,72,88],[3.5,0.5,74,90],[4,1.5,76,100],[5.5,0.5,77,90],[6,1,76,95],[7,1,74,90],[8,0.75,72,96],[8.75,0.25,71,84],[9,0.5,72,90],[9.5,0.5,76,92],[10,1.5,79,105],[11.5,0.5,77,90],[12,1,76,96],[13,1,74,92],[14,1,71,90],[15,1,74,94]]`
- **Karte:** „Klagender Lead mit eingebauter Quinte – erinnert an den Synth-Pop von 1981 (Stil The Human League).“

### 7.3 HL2 „Schaltkreis-Kit 81“ – Rolle Drums · Drum-Synth

- **Vorbild (ⓘ):** Linn LM-1, jedes Instrument einzeln mit EQ und Kompressor bearbeitet (BELEGT).
- **Kit-Rezept:** KICK `{tLvl 1, frq 58, pAmt 9, pDec .02, tDec .3, cLvl .3, cTyp 0, drv .1}` · SNARE `{tLvl .8, frq 185, o2 .4, o2r 1.6, tDec .12, nLvl 1, nTyp 'bandpass', nFrq 2800, nQ .6, nDec .18}` · CLAP `{nLvl 1.1, nTyp 'bandpass', nFrq 1200, nBur 4, nGap .01, nDec .22}` · HH ZU `hat(.035)` · Kit-Bus `room .5, gate 0`. Kein Gate-Hall (der kam erst später in Mode).
- **Hörprobe** (118 BPM, Klatschen in Takt 1 und 3 auf 2/4 gedoppelt, 16tel-HiHat-Einwürfe, Takt 4 Kick-Synkope):
```
Tempo 118 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK  | x.......x.x..... | x.......x....... | x.......x.x..... | x.......x...x.x.
SNARE | ....x.......x... | ....x.......x... | ....x.......x... | ....x.......x.xx
CLAP  | ....x.......x... | ................ | ....x.......x... | ............x...
HH ZU | x.x.x.x.x.x.x.x. | x.xxx.x.x.xxx.x. | x.x.x.xxx.x.x.x. | x.x.x.x.xxxx....
```
- **Karte:** „Trockene, einzeln polierte Drumcomputer-Schläge – erinnert an den Pop von 1981 (Stil The Human League).“

### 7.4 Hörprobe für R6 N12 „Traum-Bass 81“ (VA)

- Lage F1–C3 (29–48). 118 BPM, a-Moll (passt zu HL1, gleiche Akkorde – beide Proben lassen sich zusammen abspielen). Achtel-Oktaven, Takt 4 läuft über B–D–F zur Dominante.
```
Tempo 118 BPM · 4 Takte · a-Moll · Akkorde: Am | F | C | G
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A1(33) 0/2/108 · A2(45) 2/2/85 · A1(33) 4/2/104 · A2(45) 6/2/85 · A1(33) 8/2/104 · A2(45) 10/2/85 · G2(43) 12/2/92 · E2(40) 14/2/90
T2: F1(29) 16/2/108 · F2(41) 18/2/85 · F1(29) 20/2/104 · F2(41) 22/2/85 · F1(29) 24/2/104 · F2(41) 26/2/85 · A2(45) 28/2/92 · C3(48) 30/2/90
T3: C2(36) 32/2/108 · C3(48) 34/2/85 · C2(36) 36/2/104 · C3(48) 38/2/85 · C2(36) 40/2/104 · C3(48) 42/2/85 · B2(47) 44/2/92 · G2(43) 46/2/90
T4: G1(31) 48/2/108 · G2(43) 50/2/85 · G1(31) 52/2/104 · G2(43) 54/2/85 · B1(35) 56/2/100 · D2(38) 58/2/94 · F2(41) 60/2/96 · G2(43) 62/2/100
```
aud-Daten (Spec v3 §12.8, Schläge = 16tel ÷ 4): `[[0,0.5,33,108],[0.5,0.5,45,85],[1,0.5,33,104],[1.5,0.5,45,85],[2,0.5,33,104],[2.5,0.5,45,85],[3,0.5,43,92],[3.5,0.5,40,90],[4,0.5,29,108],[4.5,0.5,41,85],[5,0.5,29,104],[5.5,0.5,41,85],[6,0.5,29,104],[6.5,0.5,41,85],[7,0.5,45,92],[7.5,0.5,48,90],[8,0.5,36,108],[8.5,0.5,48,85],[9,0.5,36,104],[9.5,0.5,48,85],[10,0.5,36,104],[10.5,0.5,48,85],[11,0.5,47,92],[11.5,0.5,43,90],[12,0.5,31,108],[12.5,0.5,43,85],[13,0.5,31,104],[13.5,0.5,43,85],[14,0.5,35,100],[14.5,0.5,38,94],[15,0.5,41,96],[15.5,0.5,43,100]]`

---

## 8. New Order (`vorbild: new-order`) – Ergänzung zu R6 N13–N16

### 8.1 Neue Belege (R6 §1 gilt weiter)

| Fakt | Status | Quelle |
|---|---|---|
| Bass von einem **Moog Source**, sequenziert mit einem **Powertran**-Sequenzer, den Bernard Sumner selbst gebaut hat (Live-Toningenieur Roger Wilkinson) | BELEGT (2 Quellen) | neworderonline-Forum (zitiert Wilkinson); BBC; Wikipedia „Moog Source“ |
| Drums auf einer **Oberheim DMX** programmiert | BELEGT (2 Quellen) | MusicRadar; BBC |
| Chöre „angeblich“ von einem Kraftwerk-Album gesampelt | WAHRSCHEINLICH (MusicRadar sagt selbst „allegedly“) | MusicRadar „40 greatest synth sounds, No 2“ |
| Live spielte die Band die Samples zuerst auf einem **Emulator II**, später Kurzweil K2500 | WAHRSCHEINLICH (Forum zitiert Toningenieur) | neworderonline-Forum |
| **Widerspruch zu R6:** R6 schreibt „Emulator I“ für die Platte; hier ist nur der **Live**-Einsatz des Emulator II belegt. Studio-Gerät bleibt offen. | offen | – |
| ≈ 130 BPM | BELEGT (2 Analysen) | uwaterloo-Datenbank (130,4); weitere Analyse 130 |
| … d-Moll | WAHRSCHEINLICH (eine Quelle meldet a-Moll) | wie oben |

### 8.2 Hörproben für R6 N14, N15, N16 (Rezepte in R6)

Alle in **e-Moll** und 130 BPM, damit sie mit der N13-Hörprobe aus `vorbild-helden.md` §7.2 zusammenpassen.

**N14 „Stotter-Kit 83“** – Four-on-the-floor, kurze 2er-Kick-Läufe in Takt 2 und 4, offene HiHat als Akzent. Bewusst **nicht** die „Blue Monday“-Kick-Folge (R6 §5):
```
Tempo 130 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK     | x...x...x...x... | x...x...x.x.x... | x...x...x...x... | x...x...x...x.xx
SNARE    | ....x.......x... | ....x.......x... | ....x.......x... | ....x.......x...
HH ZU    | ..x...x...x...x. | ..x...x...x...x. | ..x...x.x.x...x. | ..x...x...x.xxx.
HH OFFEN | ................ | ..............x. | ................ | ..x.............
```

**N15 „Sampler-Chor 83“** – kurze Chor-Stöße auf 1, 2+ und 3+, Takt 4 Wendung h-Moll → H-Dur (Dominante). Lage D4–C5 (62–72):
```
Tempo 130 BPM · 4 Takte · e-Moll · Akkorde: Em | C | D | B
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E4(64) 0/3/100 · G4(67) 0/3/100 · B4(71) 0/3/100 · E4(64) 6/2/88 · G4(67) 6/2/88 · B4(71) 6/2/88 · E4(64) 10/4/96 · G4(67) 10/4/96 · B4(71) 10/4/96
T2: E4(64) 16/3/100 · G4(67) 16/3/100 · C5(72) 16/3/100 · E4(64) 22/2/88 · G4(67) 22/2/88 · C5(72) 22/2/88 · E4(64) 26/6/96 · G4(67) 26/6/96 · C5(72) 26/6/96
T3: D4(62) 32/3/100 · F#4(66) 32/3/100 · A4(69) 32/3/100 · D4(62) 38/2/88 · F#4(66) 38/2/88 · A4(69) 38/2/88 · D4(62) 42/4/96 · F#4(66) 42/4/96 · A4(69) 42/4/96
T4: D4(62) 48/3/100 · F#4(66) 48/3/100 · B4(71) 48/3/100 · D4(62) 54/2/88 · F#4(66) 54/2/88 · B4(71) 54/2/88 · Eb4(63) 58/6/104 · F#4(66) 58/6/104 · B4(71) 58/6/104
```
aud-Daten (Spec v3 §12.8, Schläge = 16tel ÷ 4): `[[0,0.75,64,100],[0,0.75,67,100],[0,0.75,71,100],[1.5,0.5,64,88],[1.5,0.5,67,88],[1.5,0.5,71,88],[2.5,1,64,96],[2.5,1,67,96],[2.5,1,71,96],[4,0.75,64,100],[4,0.75,67,100],[4,0.75,72,100],[5.5,0.5,64,88],[5.5,0.5,67,88],[5.5,0.5,72,88],[6.5,1.5,64,96],[6.5,1.5,67,96],[6.5,1.5,72,96],[8,0.75,62,100],[8,0.75,66,100],[8,0.75,69,100],[9.5,0.5,62,88],[9.5,0.5,66,88],[9.5,0.5,69,88],[10.5,1,62,96],[10.5,1,66,96],[10.5,1,69,96],[12,0.75,62,100],[12,0.75,66,100],[12,0.75,71,100],[13.5,0.5,62,88],[13.5,0.5,66,88],[13.5,0.5,71,88],[14.5,1.5,63,104],[14.5,1.5,66,104],[14.5,1.5,71,104]]`

**N16 „Fünfer-Kälte-Lead“** – lange, kühle Töne, Frage–Antwort, Takt 4 auf der Dominante H (Dis). Lage E4–F#5 (64–78):
```
Tempo 130 BPM · 4 Takte · e-Moll · Akkorde: Em | C | D | B
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: B4(71) 0/4/100 · E5(76) 4/2/92 · D5(74) 6/2/90 · B4(71) 8/6/96 · A4(69) 14/2/85
T2: G4(67) 16/4/95 · C5(72) 20/2/90 · B4(71) 22/2/88 · G4(67) 24/4/92 · E4(64) 28/4/88
T3: F#4(66) 32/4/95 · A4(69) 36/2/90 · D5(74) 38/2/95 · F#5(78) 40/6/105 · E5(76) 46/2/88
T4: Eb5(75) 48/4/100 · B4(71) 52/4/92 · F#5(78) 56/4/102 · Eb5(75) 60/4/96
```
aud-Daten (Spec v3 §12.8, Schläge = 16tel ÷ 4): `[[0,1,71,100],[1,0.5,76,92],[1.5,0.5,74,90],[2,1.5,71,96],[3.5,0.5,69,85],[4,1,67,95],[5,0.5,72,90],[5.5,0.5,71,88],[6,1,67,92],[7,1,64,88],[8,1,66,95],[9,0.5,69,90],[9.5,0.5,74,95],[10,1.5,78,105],[11.5,0.5,76,88],[12,1,75,100],[13,1,71,92],[14,1,78,102],[15,1,75,96]]`

---

## 9. Erasure (`vorbild: erasure`) und Yazoo (`vorbild: yazoo`, neu)

### 9.1 Belege Erasure

| Fakt | Status | Quelle |
|---|---|---|
| „Chorus“ (1991) fast ohne MIDI-Instrumente: Clarke wählte CV/Gate, mied digitale Drumcomputer und Sampler; **Drums aus analogen Synths, außer Crash-Becken** | BELEGT (SOS Dez. 1991, Paul Ireson; Wikipedia) | SOS (über Wikipedia/Suchauszug); Wikipedia „Chorus (Erasure album)“ |
| Alles in einem MIDI-Sequenzer programmiert, dann in einen analogen Sequenzer übertragen – Haupt-Sequenzer **Roland MC-4** | BELEGT (Clarke, SOS 2020) | SOS „Vince Clarke: Electronic Music Pioneer“ |
| Regeln: nur analoge Synths, **jede Linie monophon**, keine Akkorde | BELEGT (Clarke, 2 Quellen) | Wikipedia; 429harrowroad (Reissue-Essay) |
| Clarke mag kein MIDI-Timing („MIDI slop“) | BELEGT | wie oben |
| Pro-One: „auf jedem Album benutzt“ | BELEGT (Clarke, SOS) | SOS |
| Live-Rig: Oberheim Xpander, Yamaha-TX-Rack, Pro-One, zwei Casios, gesteuert von einem BBC-Computer mit UMI-Sequenzer (Datum unklar) | WAHRSCHEINLICH | muzines (Clarke-Artikel, Datum im Auszug fehlt) |
| „The Circus“ (1987): Xpander prominent, dazu Casio CZ-101, Emulator II, Prophet VS | WAHRSCHEINLICH (ein Gear-Artikel) | gearnews „How to sound like Vince Clarke“ |
| „Sometimes“: Uptempo-Dancepop mit Clarkes analogen Synths | WAHRSCHEINLICH (Rezension) | Wikipedia „Erasure (duo)“ |
| „A Little Respect“: ≈ 114 BPM | BELEGT (2 Analysen) | uwaterloo; songbpm |
| … Tonart (a-Moll oder C-Dur) | WAHRSCHEINLICH (uneinig) | wie oben |
| „Sometimes“: ≈ 108 BPM, c-Moll | WAHRSCHEINLICH (eine Analyse; evtl. falsch erkannt) | uwaterloo |
| „A Little Respect“: stotternde Stakkato-Akkorde, „vermutlich bearbeitetes Klavier-Sample, evtl. Korg M1“ | WAHRSCHEINLICH (schwach, Nachbau-Rezept) | Syntorial |

### 9.2 Belege Yazoo

| Fakt | Status | Quelle |
|---|---|---|
| Clarke über das erste Yazoo-Album: „**der JP-4, der Pro One, der MC4 und eine TR808**“ (808 für Klänge, die der Pro-One nicht konnte) | BELEGT (Clarke-Zitat, 2 Quellen) | Equipboard (Zitat); Electricity Club (Yazoo-Infoservice 1982) |
| Geräte 1982 (Newsletter): Casio VL-1, Roland JP-4, Vocoder Plus VP-330, Pro-One, Kobol RSF, Fairlight CMI; TR-808, Linn Drum, 4 Simmons-Module, MC-4 | BELEGT (Clarke-Interview 1982, SE) | Electricity Club (Deb Danahay) |
| Der JP-4 hatte keinen CV/Gate-Eingang; der Pro-One wurde deshalb mit dem MC-4 gespielt | WAHRSCHEINLICH (Equipboard) | Equipboard |
| „Don't Go“: Intro mit **ARP 2600**, Bass vom **Pro-One** | WAHRSCHEINLICH (MusicRadar) | MusicRadar „40 greatest synth sounds, No 12“ |
| „Don't Go“: viel ARP 2600 enthalten; Aufnahme ist leicht zu hoch gestimmt; Streicherlinie evtl. ein Polysynth (Jupiter-4) | WAHRSCHEINLICH (Nachbauer Pea Hicks) | Synthtopia (2014) |
| ARP 2600 auf „Don't Go“ insgesamt | BELEGT (2 Quellen: MusicRadar + Pea Hicks) | wie oben |
| „Don't Go“: ≈ 126–127 BPM | BELEGT (2 Analysen) | uwaterloo (Published 127); mixgraph (126) |
| … b-Moll (Ais-Moll) | WAHRSCHEINLICH | wie oben |
| Aufgenommen bei Blackwing (Eric Radcliffe) | WAHRSCHEINLICH | Classic Pop „Upstairs At Eric's“ |

### 9.3 Stil-Merkmale Clarke (Yazoo/Erasure)

| Merkmal | Status |
|---|---|
| Viele **einstimmige** Linien, die sich verzahnen (Bass, Gegenlinie, Riff), kaum Akkorde | BELEGT (Regeln „Chorus“; Zitat 1981) |
| Exakt sequenziert (MC-4), dadurch „mechanisch tight“ | BELEGT (Gerät) / UNBELEGT (Wirkung) |
| Dur-lastige, hüpfende Popsongs (Erasure); Moll-Soul mit Riff (Yazoo) | UNBELEGT (Hör-Einschätzung) |
| Tempo 108–127 | WAHRSCHEINLICH (§9.1/§9.2) |

### 9.4 ER1 „Mono-Gitter-Bass“ – Rolle Bass · VA

- **Vorbild (ⓘ):** monophoner Sequenzer-Bass aus analogen Synths, exakt per CV/Gate gespielt (BELEGT als Arbeitsweise). Patch UNBELEGT.
- **Rezept:** `o1w 0, o2w 1, o2pw .3, o2fine 6, o2lvl .5, subLvl .3, ftype 0, cutoff 480, res .35, drive .25, bass .5, kt .45, fenv .45, fA .001, fD .11, fS .05, fR .05, aA .001, aD .2, aS .5, aR .04, ampVel .5, mode 1, poly 1, reset 1, analog .12, spread 0` · Route `M('vel','fenv', .3)` (Akzent öffnet) · fx `{drive .1, dly .08, rev .05}`
- **Lage / Rolle:** E1–E3 (28–52), am besten E1–E3. LAGE-Klammer **hoch E3**.
- **Hörprobe** (122 BPM, A-Dur, „Pause–Ton–Oktave“-Muster je Viertel, Takt 4 Dominante E mit Anstieg):
```
Tempo 122 BPM · 4 Takte · A-Dur · Akkorde: A | E | F#m | D → E
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A1(33) 0/1/108 · A1(33) 2/1/90 · A2(45) 3/1/80 · A1(33) 4/1/108 · A1(33) 6/1/90 · A2(45) 7/1/80 · A1(33) 8/1/108 · A1(33) 10/1/90 · A2(45) 11/1/80 · E2(40) 12/1/108 · A2(45) 14/1/90 · C#3(49) 15/1/80
T2: E1(28) 16/1/108 · E1(28) 18/1/90 · E2(40) 19/1/80 · E1(28) 20/1/108 · E1(28) 22/1/90 · E2(40) 23/1/80 · E1(28) 24/1/108 · E1(28) 26/1/90 · E2(40) 27/1/80 · B1(35) 28/1/108 · E2(40) 30/1/90 · G#2(44) 31/1/80
T3: F#1(30) 32/1/108 · F#1(30) 34/1/90 · F#2(42) 35/1/80 · F#1(30) 36/1/108 · F#1(30) 38/1/90 · F#2(42) 39/1/80 · F#1(30) 40/1/108 · F#1(30) 42/1/90 · F#2(42) 43/1/80 · C#2(37) 44/1/108 · F#2(42) 46/1/90 · A2(45) 47/1/80
T4: D2(38) 48/1/108 · D2(38) 50/1/90 · D3(50) 51/1/80 · D2(38) 52/1/108 · D2(38) 54/1/90 · D3(50) 55/1/80 · E2(40) 56/1/116 · E2(40) 58/1/98 · E3(52) 59/1/88 · E2(40) 60/1/116 · B2(47) 61/1/88 · G#2(44) 62/1/98 · B2(47) 63/1/88
```
aud-Daten (Spec v3 §12.8, Schläge = 16tel ÷ 4): `[[0,0.25,33,108],[0.5,0.25,33,90],[0.75,0.25,45,80],[1,0.25,33,108],[1.5,0.25,33,90],[1.75,0.25,45,80],[2,0.25,33,108],[2.5,0.25,33,90],[2.75,0.25,45,80],[3,0.25,40,108],[3.5,0.25,45,90],[3.75,0.25,49,80],[4,0.25,28,108],[4.5,0.25,28,90],[4.75,0.25,40,80],[5,0.25,28,108],[5.5,0.25,28,90],[5.75,0.25,40,80],[6,0.25,28,108],[6.5,0.25,28,90],[6.75,0.25,40,80],[7,0.25,35,108],[7.5,0.25,40,90],[7.75,0.25,44,80],[8,0.25,30,108],[8.5,0.25,30,90],[8.75,0.25,42,80],[9,0.25,30,108],[9.5,0.25,30,90],[9.75,0.25,42,80],[10,0.25,30,108],[10.5,0.25,30,90],[10.75,0.25,42,80],[11,0.25,37,108],[11.5,0.25,42,90],[11.75,0.25,45,80],[12,0.25,38,108],[12.5,0.25,38,90],[12.75,0.25,50,80],[13,0.25,38,108],[13.5,0.25,38,90],[13.75,0.25,50,80],[14,0.25,40,116],[14.5,0.25,40,98],[14.75,0.25,52,88],[15,0.25,40,116],[15.25,0.25,47,88],[15.5,0.25,44,98],[15.75,0.25,47,88]]`
- **Karte:** „Hüpfender, exakt gestanzter Mono-Bass – erinnert an den Dur-Synthpop von 1986–91 (Stil Erasure).“

### 9.5 ER2 „Analog-Trommel 91“ – Rolle Drums · Drum-Synth

- **Vorbild (ⓘ):** Drums **aus analogen Synthesizern statt Drumcomputer**, nur das Crash-Becken echt (BELEGT, „Chorus“ 1991).
- **Kit-Rezept (nur TON und RAUSCHEN, kein METALL – außer Becken):** KICK `{tLvl 1, frq 52, pAmt 18, pDec .04, tDec .4, cLvl 0}` · SNARE `{tLvl .7, frq 200, pAmt 3, tDec .1, nLvl 1, nTyp 'lowpass', nFrq 6000, nHp 1200, nDec .16}` · HH ZU `{mLvl 0, nLvl 1, nTyp 'highpass', nFrq 8000, nQ 1.5, nDec .035}` · HH OFFEN `{mLvl 0, nLvl 1, nTyp 'highpass', nFrq 7500, nDec .25}` · PERC „Synth-Blip“ `{tLvl 1, wav 'sine', frq 330, pAmt 12, pDec .05, tDec .12}` · BECKEN wie Werk (METALL) · Kit-Bus `room .4`.
- **Warum so:** Eine HiHat aus gefiltertem Rauschen klingt „weicher“ als die Metall-Schicht – genau der Unterschied zwischen Synth-Drums und Drumcomputer.
- **Hörprobe** (122 BPM, Four-on-the-floor, Offbeat-HiHat, Synth-Blips, Takt 4 Kick-Achtel + Snare-Wirbel):
```
Tempo 122 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK  | x...x...x...x... | x...x...x...x... | x...x...x...x... | x...x...x.x.x.x.
SNARE | ....x.......x... | ....x.......x..x | ....x.......x... | ....x.......xxxx
HH ZU | ..x...x...x...x. | ..x...x...x...x. | ..x.x.x...x.x.x. | ..x...x...x.....
PERC  | ...........x.... | .......x........ | ...x.......x.... | ................
```
- **Karte:** „Drums aus dem Synthesizer, weich und rund – erinnert an den Analog-Pop von 1991 (Stil Erasure).“

### 9.6 ER3 „Einfinger-Kette“ – Rolle Sequenz/Gegenlinie · VA

- **Vorbild (ⓘ):** einstimmige Gegenlinie, die mit Bass und Riff verzahnt (BELEGT als Arbeitsweise).
- **Rezept:** `o1w 1, o1pw .5, o2lvl 0, ftype 0, cutoff 3500, res .1, drive .1, kt .5, fenv .2, fA .001, fD .1, fS .3, fR .08, aA .001, aD .2, aS .2, aR .1, ampVel .5, mode 1, poly 1, reset 1, analog .1, spread 0` · fx `{dly .2, rev .12, pan .25}` · bus `{echo:{mode:'pp', divL:'1/8', fb .25}}`
- **Lage / Rolle:** G#4–B5 (68–83). LAGE-Klammer **G4–C6**. Läuft in den Pausen von ER1 (gleiche Akkorde – zusammen abspielbar).
- **Hörprobe** (122 BPM, A-Dur, gebrochene Dreiklänge mit Lücke auf jeder vierten 16tel, Takt 4 E-Dur aufwärts):
```
Tempo 122 BPM · 4 Takte · A-Dur · Akkorde: A | E | F#m | D → E
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E5(76) 0/1/108 · C#5(73) 1/1/80 · A4(69) 2/1/90 · C#5(73) 4/1/108 · E5(76) 5/1/80 · A5(81) 6/1/90 · E5(76) 8/1/108 · C#5(73) 9/1/80 · A4(69) 10/1/90 · B4(71) 12/1/108 · C#5(73) 13/1/80 · E5(76) 14/1/90
T2: E5(76) 16/1/108 · B4(71) 17/1/80 · G#4(68) 18/1/90 · B4(71) 20/1/108 · E5(76) 21/1/80 · G#5(80) 22/1/90 · E5(76) 24/1/108 · B4(71) 25/1/80 · G#4(68) 26/1/90 · A4(69) 28/1/108 · B4(71) 29/1/80 · E5(76) 30/1/90
T3: F#5(78) 32/1/108 · C#5(73) 33/1/80 · A4(69) 34/1/90 · C#5(73) 36/1/108 · F#5(78) 37/1/80 · A5(81) 38/1/90 · F#5(78) 40/1/108 · C#5(73) 41/1/80 · A4(69) 42/1/90 · B4(71) 44/1/108 · C#5(73) 45/1/80 · F#5(78) 46/1/90
T4: F#5(78) 48/1/108 · D5(74) 49/1/80 · A4(69) 50/1/90 · D5(74) 52/1/108 · F#5(78) 53/1/80 · A5(81) 54/1/90 · B5(83) 56/1/116 · G#5(80) 57/1/88 · E5(76) 58/1/98 · B4(71) 59/1/88 · E5(76) 60/1/116 · G#5(80) 62/1/98
```
aud-Daten (Spec v3 §12.8, Schläge = 16tel ÷ 4): `[[0,0.25,76,108],[0.25,0.25,73,80],[0.5,0.25,69,90],[1,0.25,73,108],[1.25,0.25,76,80],[1.5,0.25,81,90],[2,0.25,76,108],[2.25,0.25,73,80],[2.5,0.25,69,90],[3,0.25,71,108],[3.25,0.25,73,80],[3.5,0.25,76,90],[4,0.25,76,108],[4.25,0.25,71,80],[4.5,0.25,68,90],[5,0.25,71,108],[5.25,0.25,76,80],[5.5,0.25,80,90],[6,0.25,76,108],[6.25,0.25,71,80],[6.5,0.25,68,90],[7,0.25,69,108],[7.25,0.25,71,80],[7.5,0.25,76,90],[8,0.25,78,108],[8.25,0.25,73,80],[8.5,0.25,69,90],[9,0.25,73,108],[9.25,0.25,78,80],[9.5,0.25,81,90],[10,0.25,78,108],[10.25,0.25,73,80],[10.5,0.25,69,90],[11,0.25,71,108],[11.25,0.25,73,80],[11.5,0.25,78,90],[12,0.25,78,108],[12.25,0.25,74,80],[12.5,0.25,69,90],[13,0.25,74,108],[13.25,0.25,78,80],[13.5,0.25,81,90],[14,0.25,83,116],[14.25,0.25,80,88],[14.5,0.25,76,98],[14.75,0.25,71,88],[15,0.25,76,116],[15.5,0.25,80,98]]`
- **Karte:** „Klare Rechteck-Gegenlinie mit Echo – erinnert an die verzahnten Mono-Linien von Erasure (Stil).“

### 9.7 YZ1 „Kantig-Riff“ – Rolle Lead/Riff · VA

- **Vorbild (ⓘ):** kantiges, resonantes Mono-Riff aus Modular- und Mono-Synth (ARP 2600 BELEGT, Pro-One WAHRSCHEINLICH). Patch: Einschätzung.
- **Rezept:** `o1w 0, o2w 1, o2pw .25, o2fine -8, o2lvl .7, ftype 0, cutoff 1100, res .5, drive .35, kt .5, fenv .45, fA .001, fD .16, fS .2, fR .1, aA .001, aD .25, aS .6, aR .08, ampVel .5, mode 2, poly 1, glide .015, analog .3, spread 0` · fx `{drive .2, dly .15, rev .15}` · bus `{echo:{mode:'mono', divL:'1/8.', fb .2}}`
- **Lage / Rolle:** G4–F5 (67–77), am besten G4–G5. LAGE-Klammer **tief G4**.
- **Hörprobe** (126 BPM, **g-Moll** statt b-Moll, Stakkato mit Wechselnote und Pausen-Synkope, Takt 4 F-Dur-Lauf auf F5):
```
Tempo 126 BPM · 4 Takte · g-Moll · Akkorde: Gm | Gm | Eb | F
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: G4(67) 0/2/110 · G4(67) 3/1/90 · Bb4(70) 4/2/100 · A4(69) 6/1/88 · G4(67) 7/1/85 · D5(74) 8/2/105 · C5(72) 10/1/90 · Bb4(70) 11/2/95 · A4(69) 13/1/85 · G4(67) 14/2/100
T2: G4(67) 16/2/110 · G4(67) 19/1/90 · Bb4(70) 20/2/100 · C5(72) 22/1/90 · D5(74) 23/1/92 · F5(77) 24/2/108 · D5(74) 26/1/90 · C5(72) 27/2/95 · Bb4(70) 29/1/85 · A4(69) 30/2/96
T3: G4(67) 32/2/110 · G4(67) 35/1/90 · Bb4(70) 36/2/100 · A4(69) 38/1/88 · G4(67) 39/1/85 · Eb5(75) 40/2/105 · D5(74) 42/1/90 · C5(72) 43/2/95 · Bb4(70) 45/1/85 · G4(67) 46/2/98
T4: A4(69) 48/2/108 · A4(69) 51/1/90 · C5(72) 52/2/100 · D5(74) 54/1/92 · Eb5(75) 55/1/94 · F5(77) 56/3/110 · Eb5(75) 59/1/90 · D5(74) 60/2/96 · C5(72) 62/2/92
```
aud-Daten (Spec v3 §12.8, Schläge = 16tel ÷ 4): `[[0,0.5,67,110],[0.75,0.25,67,90],[1,0.5,70,100],[1.5,0.25,69,88],[1.75,0.25,67,85],[2,0.5,74,105],[2.5,0.25,72,90],[2.75,0.5,70,95],[3.25,0.25,69,85],[3.5,0.5,67,100],[4,0.5,67,110],[4.75,0.25,67,90],[5,0.5,70,100],[5.5,0.25,72,90],[5.75,0.25,74,92],[6,0.5,77,108],[6.5,0.25,74,90],[6.75,0.5,72,95],[7.25,0.25,70,85],[7.5,0.5,69,96],[8,0.5,67,110],[8.75,0.25,67,90],[9,0.5,70,100],[9.5,0.25,69,88],[9.75,0.25,67,85],[10,0.5,75,105],[10.5,0.25,74,90],[10.75,0.5,72,95],[11.25,0.25,70,85],[11.5,0.5,67,98],[12,0.5,69,108],[12.75,0.25,69,90],[13,0.5,72,100],[13.5,0.25,74,92],[13.75,0.25,75,94],[14,0.75,77,110],[14.75,0.25,75,90],[15,0.5,74,96],[15.5,0.5,72,92]]`
- **Karte:** „Kantiges, schnarrendes Mono-Riff in Moll – erinnert an den Soul-Synthpop von 1982 (Stil Yazoo).“

### 9.8 YZ2 „Keller-Bass 82“ – Rolle Bass · VA

- **Vorbild (ⓘ):** Pro-One-Bass, per MC-4 gespielt (BELEGT als Gerätepaar). Patch: Einschätzung; nah am Werks-Sound „Synthpop-Bass“, aber Säge statt Puls oben.
- **Rezept:** `o1w 0, o2w 1, o2oct -1, o2pw .5, o2fine 0, o2lvl .6, cutoff 360, res .25, drive .35, bass .6, kt .35, fenv .4, fA .001, fD .2, fS .15, fR .08, aA .001, aD .3, aS .7, aR .05, ampVel .5, mode 1, poly 1, reset 1, analog .12, spread 0` · fx `{rev .05}`
- **Lage / Rolle:** Eb1–G2 (27–43). Achtung Handy: Eb1 = 39 Hz, auf Handy-Lautsprechern kaum hörbar → LAGE-Klammer **E1–G3**, unter E1 eine Oktave hoch.
- **Hörprobe** (126 BPM, g-Moll, Achtel + Oktav-Vorschlag, Takt 4 Fis als Leitton zurück nach G):
```
Tempo 126 BPM · 4 Takte · g-Moll · Akkorde: Gm | Gm | Eb | F
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: G1(31) 0/2/108 · G2(43) 2/1/85 · G1(31) 3/1/90 · G1(31) 4/2/104 · G2(43) 6/1/85 · F2(41) 7/1/88 · G1(31) 8/2/106 · G2(43) 10/1/85 · G1(31) 11/1/90 · Bb1(34) 12/2/100 · D2(38) 14/2/95
T2: G1(31) 16/2/108 · G2(43) 18/1/85 · G1(31) 19/1/90 · G1(31) 20/2/104 · G2(43) 22/1/85 · F2(41) 23/1/88 · G1(31) 24/2/106 · D2(38) 26/2/94 · F2(41) 28/2/96 · A1(33) 30/2/92
T3: Eb1(27) 32/2/108 · Eb2(39) 34/1/85 · Eb1(27) 35/1/90 · Eb1(27) 36/2/104 · Eb2(39) 38/1/85 · D2(38) 39/1/88 · Eb1(27) 40/2/106 · Eb2(39) 42/1/85 · Eb1(27) 43/1/90 · G1(31) 44/2/100 · Bb1(34) 46/2/95
T4: F1(29) 48/2/108 · F2(41) 50/1/85 · F1(29) 51/1/90 · F1(29) 52/2/104 · F2(41) 54/1/85 · Eb2(39) 55/1/88 · F1(29) 56/2/106 · A1(33) 58/2/96 · C2(36) 60/2/98 · F#2(42) 62/2/104
```
aud-Daten (Spec v3 §12.8, Schläge = 16tel ÷ 4): `[[0,0.5,31,108],[0.5,0.25,43,85],[0.75,0.25,31,90],[1,0.5,31,104],[1.5,0.25,43,85],[1.75,0.25,41,88],[2,0.5,31,106],[2.5,0.25,43,85],[2.75,0.25,31,90],[3,0.5,34,100],[3.5,0.5,38,95],[4,0.5,31,108],[4.5,0.25,43,85],[4.75,0.25,31,90],[5,0.5,31,104],[5.5,0.25,43,85],[5.75,0.25,41,88],[6,0.5,31,106],[6.5,0.5,38,94],[7,0.5,41,96],[7.5,0.5,33,92],[8,0.5,27,108],[8.5,0.25,39,85],[8.75,0.25,27,90],[9,0.5,27,104],[9.5,0.25,39,85],[9.75,0.25,38,88],[10,0.5,27,106],[10.5,0.25,39,85],[10.75,0.25,27,90],[11,0.5,31,100],[11.5,0.5,34,95],[12,0.5,29,108],[12.5,0.25,41,85],[12.75,0.25,29,90],[13,0.5,29,104],[13.5,0.25,41,85],[13.75,0.25,39,88],[14,0.5,29,106],[14.5,0.5,33,96],[15,0.5,36,98],[15.5,0.5,42,104]]`

### 9.9 YZ3 „Kuhglocken-Kit 82“ – Rolle Drums · Drum-Synth

- **Vorbild (ⓘ):** TR-808 für das erste Yazoo-Album (BELEGT). Basis: Werks-Kit „808“.
- **Kit-Rezept (Abweichungen von „808“):** KICK `{tDec .7}` (kürzer als Werk 1,1 s, damit der Pro-One-Bass Platz hat) · SNARE `{nLvl .9}` · PERC = Werks-Kuhglocke · Kit-Bus `room .4`.
- **Hörprobe** (126 BPM, Kick 1 · 2+ · 3+, Klatschen gedoppelt in Takt 1/3, Kuhglocke vereinzelt):
```
Tempo 126 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK  | x.....x...x..... | x.....x...x..... | x.....x...x..... | x.....x.x.x...x.
SNARE | ....x.......x... | ....x.......x... | ....x.......x... | ....x.......x.x.
CLAP  | ....x.......x... | ................ | ....x.......x... | ............x...
HH ZU | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.x.x. | x.x.x.xxx.x.x.x. | x.x.x.x.x.x.x...
PERC  | ...........x.... | ................ | ..........x..... | ...x............
```

---

## 10. Korrekturen an früherer Recherche (R6, Vision, Werks-Texte in V0a)

| # | Stelle | bisher | richtig / neu | Status |
|---|---|---|---|---|
| K-P1 | R6 §1, Tag N08; Vision 3.1 | N08 „OMD, **Mellotron-Chor 1981** (eK)“ – gemeint war „Souvenir“ | „Souvenir“ = **selbst geschnittene Bandschleifen** eines Chors, Akkorde per Fader; das **Mellotron** kam erst danach („Architecture & Morality“). Tag N08 → „OMD, Chor-Bandschleifen (Souvenir) / Mellotron-Chor (A&M)“ | BELEGT |
| K-P2 | V0a Werks-Sound „Pop-Bass DX“, `ref` (Z. 5865) | „FM-Bass der 80er (Lately, **Take On Me**)“ | Für den Bass von „Take On Me“ gibt es **keinen** Beleg; belegt sind Juno-60 (Thema), LinnDrum; DX7 nur „im Song“ ohne Part. Vorschlag `ref`: „FM-Bass der 80er (DX7-Stil)“, Vorbild-Tag a-ha entfernen (R6 Tabelle Tags „Pop-Bass FM → a-ha“ ebenso). Vision K9 hatte das als „ungeprüft“ vermerkt – jetzt geprüft: unbelegt. | UNBELEGT → streichen |
| K-P3 | V0a Werks-Sound „Synthpop-Bass“, `ref` (Z. 5691) | „Sequential Pro-One / Roland SH-101 (Depeche Mode, Erasure)“ | Pro-One für **Clarke** belegt (Yazoo, Erasure, „auf jedem Album“). **SH-101** für DM oder Erasure: kein Beleg gefunden. Vorschlag: „Sequential Pro-One (Vince Clarke: Yazoo, Erasure)“; DM nur über Clarke 1981 (Pro-One für S&S selbst nicht belegt). | BELEGT (Pro-One/Clarke), UNBELEGT (SH-101) |
| K-P4 | Vision 3.1, Zeile Erasure „Chorus“ | „MC-4- **und ARP-Sequenzer**“ | MIDI-Sequenzer → übertragen in den **MC-4** (Haupt-Sequenzer). Ein ARP-Sequenzer für „Chorus“ ist nicht belegt (der ARP-Sequenzer gehört zu „Speak & Spell“ 1981). Drums aus Synths **außer Crash-Becken**. | BELEGT |
| K-P5 | Vision 3.1, Zeile DM JCGE; R6 §1 DM | „Jupiter-4 nur in einem Thomann-Blog (URL nicht notiert)“ | URL: thomann.de/blog/en/15-songs-with-a-fat-synth-sound. Zusätzlich: Clarke kaufte nach dem Mute-Vertrag einen JP-4 (muzines) und nutzte ihn auf dem ersten Yazoo-Album (Zitat). → Gerät für JCGE bleibt WAHRSCHEINLICH, aber besser gestützt. | WAHRSCHEINLICH |
| K-P6 | R6 §1 DM | „Metall-Sampling 1983/84 (eK)“ | BELEGT: Gareth Jones (SOS „People Are People“; RBMA „Pipeline“): Metall in Shoreditch gesampelt, Synclavier mono, Emulator II, AMS. Tag N06 → „b“. | BELEGT |
| K-P7 | R6 §1 DM, Rhythmus 1981 | nicht erwähnt | KR-55 + ARP-2600-Bassdrum (2 Quellen). **Widerspruch** Sync: MusicRadar „MC-4“ vs. Clarke „ARP-Sequenzer“ – beides vermerken. | BELEGT / offen |
| K-P8 | R6 §1 a-ha | „Juno-60-Melodie, LinnDrum, PPG im Song“ | präzisiert: Juno-60 = **Tarneys** Gerät (SOS), Spieler umstritten; LinnDrum von **Pål** programmiert, nur auf späteren Fassungen, echte Becken darüber (Fan-Seite); „Juno-60 per MIDI an DX7“ zweifelhaft (Juno-60 hat kein MIDI, eK). Tempo 169, A-Dur (Wikipedia). | BELEGT / WAHRSCHEINLICH |
| K-P9 | R6 §1 Alphaville | Geräteliste „nur Equipboard“; „Jupiter-8 nur TV 1984“ | Liste stammt laut Forum aus **Lloyds Gedächtnis** und nennt den Jupiter-8 **im Studio**, dazu MFB-Sequenzer, System 100M, Lexicon 224, Simmons SDS-5 (Curt Cress). „Hohner-“String-Machine nicht in dieser Liste (dort nur Solina). Widerspruch bleibt offen. | WAHRSCHEINLICH |
| K-P10 | R6 §1 Human League | „Jupiter-4 und Pro-One nicht bestätigt“ | Jupiter-4, System 700, CS-15 jetzt WAHRSCHEINLICH (Gear-Artikel + Alex-Ball-Nachbau, Sonic State 2025); Pro-One weiter UNBELEGT. | WAHRSCHEINLICH |
| K-P11 | R6 §1 New Order | Chor aus „Emulator I“ | Belegt ist nur, dass der Chor gesampelt ist („angeblich“ Kraftwerk, MusicRadar) und **live** ein Emulator II lief. Studio-Gerät offen → „Emulator (Modell offen)“. | WAHRSCHEINLICH |
| K-P12 | R6 §1 OMD | „Rolle des SH-09 umstritten“ | bleibt umstritten; neu BELEGT: Vox-Jaguar-Orgel durch Hall/Harmonizer auf „Enola Gay“; „Maid of Orleans“-Dudelsack = **Geige durch Mellotron** (Humphreys). | BELEGT |
| K-P13 | R6 Tabelle VORBILD Gruppe 3 | `erasure` „s (Werks-Text)“ | → „b“ (Arbeitsweise „Chorus“, Pro-One, MC-4 belegt). Neu `yazoo` „b“ (Geräte belegt, Parts WAHRSCHEINLICH). `depeche-mode` „s/e“ → „b Arbeitsweise, s Parts“. `omd` bleibt „b“. `alphaville` bleibt „e“. | – |

**Keine Änderung nötig (geprüft und bestätigt):** R6 „Speak & Spell größtenteils mit ARP-Sequenzer“ (jetzt BELEGT durch Clarke-Zitat), R6 „Enola Gay: Micro-Preset + CR-78 selbst programmiert“ (BELEGT), R6 „Blue Monday: Moog Source + Powertran + DMX“ (BELEGT, 2 Quellen).

---

## 11. Übersicht: Lage, Rolle, Abstand zum Original

| Sound | Rolle | Engine | Hörprobe (MIDI) | Tempo | Tonart Probe / Original | LAGE-Klammer (Vorschlag) |
|---|---|---|---|---|---|---|
| DM1 Kettenreim-Lead | Lead | VA | Bb4–C6 (70–84) | 128 | F-Dur / JCGE uneinig (C, c, G) | tief A4 |
| DM2 Zählwerk-Kit 81 | Drums | Drum | – | 128 | – | keine |
| DM3 Hallen-Stahl FM | Riff | FM6 | G4–B5 (67–83) | 114 | e-Moll / a-Moll | tief E4 |
| DM4 Zitter-Bass 90 | Bass | VA | F1–G3 (29–55) | 113 | d-Moll / c-Moll | hoch G3 |
| DM5 Koffer-Stampf | Drums | Drum | – | 130 | – | keine |
| N05 Kapellen-Chor | Fläche | WT | Eb3–C5 (51–72) | 113 | g-Moll / c-Moll | C3–C5 |
| AH1 Fjordlauf-Lead | Lead | VA | G4–E6 (67–88) | 169 | D-Dur / A-Dur | tief G4 |
| AH2 Kasten-Klatsch 85 | Drums | Drum | – | 169 | – | keine |
| AH3 Auslöser-Bass | Bass | VA | C2–G3 (36–55) | 126 | e-Moll / a-Moll | hoch G3 |
| N01 Weitblick-Fläche | Fläche | VA | E3–Bb4 (52–70) | 69 | F-Dur / C-Dur | C3–C5 |
| AV2 Neonzug-Sequenz | Sequenz | VA | F#2–F#4 (42–66) | 124 | h-Moll / unbelegt | C2–A4 |
| N02 Fanfaren-Lead | Lead | VA | C5–D6 (72–86) | 118 | G-Dur / unbelegt | tief C5 |
| N03 Utopia-Glas | Keys | WT | F#4–F#6 (66–90) | 120 | A-Dur / unbelegt | F4–F6 |
| N07 Wanderer-Lead | Lead | VA | A4–B5 (69–83) | 140 | a-Moll / d-Moll | tief A4 |
| N08 Kathedralen-Chor | Fläche | WT | G3–A4 (55–69) | 100 | D-Dur / unbelegt | G3–A4 (Akkorde C3–C5) |
| OM1 Dudel-Geige | Lead | VA | G4–B5 (67–83) | 70 (12/8) | a-Moll / unbelegt | tief G4 |
| N09 Rhythmus-Box 78 | Drums | Drum | – | 140 | – | keine |
| HL1 Quinten-Lead 81 | Lead | VA | A4–G5 (69–79) | 118 | a-Moll / g-Moll | A4–C6 |
| HL2 Schaltkreis-Kit 81 | Drums | Drum | – | 118 | – | keine |
| N12 Traum-Bass 81 | Bass | VA | F1–C3 (29–48) | 118 | a-Moll / (Ära) | hoch C3 |
| N14 Stotter-Kit 83 | Drums | Drum | – | 130 | – | keine |
| N15 Sampler-Chor 83 | Fläche/Stab | WT | D4–C5 (62–72) | 130 | e-Moll / d-Moll | C4–C5 |
| N16 Fünfer-Kälte-Lead | Lead | VA | E4–F#5 (64–78) | 130 | e-Moll / d-Moll | tief E4 |
| ER1 Mono-Gitter-Bass | Bass | VA | E1–E3 (28–52) | 122 | A-Dur / – | hoch E3 |
| ER2 Analog-Trommel 91 | Drums | Drum | – | 122 | – | keine |
| ER3 Einfinger-Kette | Sequenz | VA | G#4–B5 (68–83) | 122 | A-Dur / – | G4–C6 |
| YZ1 Kantig-Riff | Riff | VA | G4–F5 (67–77) | 126 | g-Moll / b-Moll | tief G4 |
| YZ2 Keller-Bass 82 | Bass | VA | Eb1–G2 (27–43) | 126 | g-Moll / b-Moll | E1–G3 |
| YZ3 Kuhglocken-Kit 82 | Drums | Drum | – | 126 | – | keine |

**Prüfung** (`aud-pop.mjs`, Ausgabe `aud-report.txt`): alle 29 Proben 4 Takte, 4/4 verschiedene Takte, 0 direkte Wiederholungen, Ende ≤ 64/64, ≤ 256 Noten (höchstens 62). **Nicht geprüft:** Klang, Pegel, Ähnlichkeit zu Originalen (keine Notendaten der Originale vorhanden – menschliches Gegenhören vor V10d, Pflichtvermerk „eigene Melodie“ wie V10d-05).

---

## 12. Demo-Song-Baupläne (eigener Entwurf, keine Kopie)

Gemeinsame Regeln: eigene Melodien und Muster (§1), Allerwelts-Akkordfolgen, Song-Teile so, dass sie mit **FANG TEIL** eingefangen und im Song-Modus abgelegt werden können (Szenen A/B/C = Clips, Teile = Strophe/Refrain …). Spuren: 1 Drum-Spur + bis zu 5 Synth-Spuren + MELODIE-Spur (Xander erlaubt mehr Spuren, `fragen-xander-5.md` H3). Tempo-Bereiche aus §3–§9 (dort Status), Rest UNBELEGT/Entwurf.

### 12.1 Demo „Hüpf-Pop 81“ (Synthpop früh: Depeche Mode 1981 / Yazoo)

- **Tempo / Tonart:** 128 BPM, F-Dur (Strophe) / d-Moll (Bridge).
- **Spuren:** Drums DM2 · Bass YZ2 (oder Werks „Synthpop-Bass“) · Riff DM1 · Gegenlinie ER3 · Akzent YZ1 (nur Bridge) · MELODIE frei.
- **Szenen:** A = Riff + Drums (F | Dm | Bb | C, DM1-Hörprobe als Clip) · B = Strophe (F | F | Bb | C, Riff aus, Gegenlinie an) · C = Bridge (Dm | Dm | Bb | C, YZ1 + Bass in Achteln).
- **Teil-Folge (Takte):** Intro A 4 (nur Riff, Drums ab Takt 3) · Strophe B 8 · Refrain A 8 (Riff + Gegenlinie zusammen) · Strophe B 8 · Refrain A 8 · Bridge C 4 · Refrain A 8 (+1 HT transponiert) · Outro A 4 (Drums aus, Riff allein).
- **Wiedererkennung:** Riff allein im Intro; alles einstimmig, kaum Akkorde; Klanghölzchen; trockener Raum; Dur.

### 12.2 Demo „Fjord-Hymne 85“ (Hymnen-Pop: a-ha / Alphaville)

- **Tempo / Tonart:** zwei Varianten. Schnell: 169 BPM, D-Dur (Bm | G | D | A). Ballade: 69 BPM, F-Dur (F | Am | Bb | C).
- **Spuren (schnell):** Drums AH2 · Bass AH3 (im Refrain in Achteln) · Hook AH1 · Fläche N01 oder N04 · Keys N03 · Sequenz AV2 (nur Strophe, leise) · MELODIE.
- **Szenen:** A = Hook-Intro (AH1 + Drums) · B = Strophe (Bass + Sequenz + Fläche, kein Hook) · C = Refrain (alles, Fläche groß).
- **Teil-Folge:** Intro A 8 · Strophe B 8 · Refrain C 8 · Hook A 4 · Strophe B 8 · Refrain C 8 · Bridge (B ohne Drums) 4 · Refrain C 8 (+2 HT) · Outro A 4.
- **Wiedererkennung:** Synth-Hook als Intro und Zwischenspiel; Melodie in hoher Lage; Becken auf der Eins jedes Refrains; letzter Refrain einen Ganzton höher.

### 12.3 Demo „Kathedrale 81“ (New Wave: OMD / The Human League)

- **Tempo / Tonart:** 140 BPM, a-Moll; Bridge im 12/8-Gefühl (70 BPM halbes Tempo, OM1).
- **Spuren:** Drums N09 (Strophe) / HL2 (Refrain) · Bass N12 · Lead N07 (Strophe) und HL1 (Refrain) · Chor N08 (Fader-Technik: Stimmen einzeln einsetzen) · OM1 (Bridge) · MELODIE.
- **Szenen:** A = Strophe (Am | F | G | E) · B = instrumentaler Refrain (N07 spielt den Hook statt Gesang) · C = Chor-Bridge (D | Dsus2 | G | A7, nur N08 + OM1).
- **Teil-Folge:** Intro B 4 · Strophe A 8 · Refrain B 8 · Strophe A 8 · Refrain B 8 · Bridge C 8 · Refrain B 8 · Outro (nur Chor) 4.
- **Wiedererkennung:** Refrain ohne Gesang, nur Synth-Hook; belebte, selbst programmierte Drumbox; Chor aus einzeln einblendenden Stimmen; Wechsel ins Walzer-Gefühl.

### 12.4 Demo „Halle 90“ (Club-Synthpop: New Order 1983 / Depeche Mode 1990 / Erasure)

- **Tempo / Tonart:** 130 BPM, e-Moll (Em | C | D | B); Variante 113 BPM d-Moll mit DM4.
- **Spuren:** Drums N14 (oder ER2) · Bass N13 (oder DM4) · Chor-Stöße N15 · Lead N16 · Riff DM3 · Stampf DM5 (nur Bridge) · MELODIE.
- **Szenen:** A = Drums + Bass · B = + Chor-Stöße + Lead · C = Break (Stampf DM5 + Chor N05, ohne Kick).
- **Teil-Folge:** langer Aufbau: A 8 (Takt 1–4 nur Drums, ab 5 Bass) · B 8 · B 8 (+ Riff DM3) · Break C 8 · B 16 · A 8 (Abbau).
- **Wiedererkennung:** Intro baut Spur für Spur auf (Live-Mute statt neuer Clips); 16tel-Sequenzbass mit leichtem Zittern; Chor-Stöße; Four-on-the-floor mit kurzen Kick-Läufen; Break mit Stampfen.

**Bau-Hinweis:** Jedes Demo ist ein Projekt (≈ 3–5 KB laut R6 §8). Die Hörproben dieser Datei sind schon die Clips der Szenen (gleiche Tonart/Akkorde je Demo gewählt: 12.1 F-Dur, 12.2 D-Dur, 12.3 a-Moll, 12.4 e-Moll).

---

## 13. Einbau-Hinweise (für Spec und Builder)

1. **VORBILD-Tabelle** (R6 §11): `yazoo` neu (Gruppe 3, „b“); Status-Änderungen wie K-P13. Tags N06 (b), N08 (Text K-P1), N05 (Emulator-Chor WAHRSCHEINLICH), N15 (Emulator-Modell offen).
2. **Werks-Texte in V0a ändern** (K-P2, K-P3) – betrifft nur `ref`-Strings, keine Klangwerte.
3. **Namen nach E9 geprüft** (eigene Durchsicht + `grep` gegen V0a, R6, Spec, R7): Kettenreim-Lead, Zählwerk-Kit 81, Hallen-Stahl FM, Zitter-Bass 90, Koffer-Stampf, Fjordlauf-Lead, Kasten-Klatsch 85, Auslöser-Bass, Neonzug-Sequenz, Dudel-Geige, Quinten-Lead 81, Schaltkreis-Kit 81, Mono-Gitter-Bass, Analog-Trommel 91, Einfinger-Kette, Kantig-Riff, Keller-Bass 82, Kuhglocken-Kit 82 – keine Kollision, kein Künstler-, Titel- oder Gerätename (frühere Arbeitstitel mit „Linn“, „LM“, „Pro“, „Hansa“, „Speak“ wurden ersetzt). Vor dem Einbau mit `r6/n6/doppel-check.mjs` gegenprüfen.
4. **DM3 braucht die echten DX7-Daten** von ROM2B „SYN-LEAD 2“, falls Xander näher ans Original will: Datei liegt lokal nicht vor (`fmresearch/carts/` enthält nur Dexed/SynprezFM und ROM1A). Bis dahin ROM1A „SYN-LEAD 1“ als Grundlage (so beschriftet).
5. **Spec-Fragen:** (a) Taktart 6/8 bzw. 3/4 (OM1, „Maid of Orleans“-Walzer) – heute nur 4/4, 12/8 per Triolen behelfsweise. (b) `aud` für Drums: Spec §12.8 hat `drums?:{kit, pattern}`; die Raster hier sind 16 Schritte × 4 Takte je Pad.
6. **Messungen vor Freigabe:** Pegel −18 LUFS für alle 18 neuen Sounds; Bass-Gate (≥ 55 % unter 250 Hz) für DM4, AH3, ER1, YZ2; FM-Gate V0d-11 sinngemäß für DM3 (Lead, kein Bass); Zufalls-Route DM4 hörbar, aber nicht verstimmt (Ziel ±5 ct).
7. **Hörproben-Daten:** `r7/pop-work/aud-blocks.json` (aus `aud-pop.mjs`), die Blöcke in dieser Datei sind daraus eingesetzt.

## 14. Offene Punkte und Fragen an Xander

- **„Dance With Me“** (Alphaville): Welcher Klang genau? Ein Zeitstempel reicht (R6-Frage, weiter offen).
- **Taktart:** Soll die App echte 3/4- und 6/8-Takte können (für OMD-Walzer)? Vorschlag: später, bis dahin 12/8-Gefühl.
- **„Everything Counts“-Riff:** Hast du die DX7-Werksbank ROM 2B (SysEx)? Dann kann DM3 auf dem echten Werks-Preset aufsetzen (Werks-Presets sind Yamaha-Daten – vor Einbau Lizenzfrage klären, eK).
- **Nachrecherche mit frischem Suchbudget:** Tempo/Tonart „Big in Japan“, „Sounds Like a Melody“, „Dance With Me“, „Souvenir“, „Maid of Orleans“, „Electricity“; Geräte „Sometimes“/„A Little Respect“; SOS-Artikel im Volltext (heute nur Auszüge).

## 15. Quellen (alle 17.10.2026, nur Suchauszüge, nicht direkt abgerufen)

**Depeche Mode / Vince Clarke**
- https://www.soundonsound.com/people/vince-clarke-electronic-music-pioneer
- https://www.musicradar.com/artists/the-synths-only-let-you-play-one-note-at-a-time-which-was-great-as-we-couldnt-play-chords-anyway-how-depeche-mode-launched-their-career-with-one-of-the-most-important-synth-pop-records-ever-released
- https://www.musicradar.com/artists/martin-gore-brought-along-his-synthesizer-we-thought-this-is-a-lot-easier-than-learning-chords-on-a-guitar-and-you-only-need-one-finger-to-play-it-vince-clarke-on-the-early-days-of-depeche-mode-and-his-first-synth-memories
- https://norselandsrock.com/just-cant-get-enough-depeche-mode/
- https://www.thomann.de/blog/en/15-songs-with-a-fat-synth-sound/
- https://www.muzines.co.uk/articles/downstairs-at-erics/1592 (Clarke über JP-4 und MC-4; Zuordnung des Zitats zu genau diesem Artikel laut Suchauszug, nicht sicher)
- https://en.wikipedia.org/wiki/Just_Can%27t_Get_Enough_(Depeche_Mode_song) · https://dmlive.wiki/wiki/Just_Can't_Get_Enough · https://cs.uwaterloo.ca/~dtompkin/music/track/DEPCHMOD_L1B/DEPCHMOD_L1B-10.html
- https://en.wikipedia.org/wiki/Construction_Time_Again · https://www.musicradar.com/news/how-depeche-mode-recorded-their-very-own-Berlin-trilogy
- https://www.soundonsound.com/techniques/classic-tracks-depeche-mode-people-are-people · https://daily.redbullmusicacademy.com/2013/03/key-tracks-gareth-jones-on-pipeline/
- https://dmlive.wiki/wiki/List_of_Depeche_Mode_sample_sources_by_album/Construction_Time_Again · https://dmlive.wiki/wiki/List_of_Depeche_Mode_sample_sources_by_album/The_Singles_81→85
- https://www.syntorial.com/preset-recipe/depeche-mode-everything-counts-bass/ · https://www.largeup.com/2014/06/20/toppa-top-10-ten-classic-songs-with-a-melodica/6
- https://www.beatport.com/track/everything-counts/4722802 · https://acousticbrainz.org/0621673b-f1ef-4669-8f5b-dca1c9a7f034
- https://reverb.com/news/the-synth-sounds-of-depeche-modes-enjoy-the-silence (Suchauszug über api.reverb.com) · https://www.loudersound.com/features/the-story-of-the-depeche-mode-megahit-martin-gore-was-dead-against · https://dmlive.wiki/wiki/Enjoy_The_Silence · https://dmlive.wiki/wiki/Recoil_Q%2BA_/_DEPECHE_MODE_/_VIOLATOR
- https://en.audiofanzine.com/sound-technique/editorial/articles/recording-secrets-of-depeche-mode-s-cult-album.html
- https://en.wikipedia.org/wiki/Personal_Jesus · https://dmlive.wiki/wiki/Personal_Jesus · https://orkus1.com/en/?p=27873 · https://faroutmagazine.co.uk/the-story-depeche-mode-song-personal-jesus/ · https://acousticbrainz.org/906acf3a-a8df-467b-ac71-22da8bfa1a23

**a-ha**
- https://www.soundonsound.com/techniques/classic-tracks-ha-take-me · https://articles.roland.com/take-on-me-a-ha · https://en.wikipedia.org/wiki/Take_On_Me
- https://www.vintagedigital.com.au/?p=167494 · https://americansongwriter.com/3-songs-that-use-the-juno-60-the-synthesizer-that-made-80s-pop-music-sound-magical/ · https://www.imaginando.pt/media/how-to-make-a-has-take-on-me-with-drc
- https://burningtheground.net/a-ha-take-on-me-us-12-promo/ · https://gearspace.com/threads/a-ha-machine-drums.650683/ · https://www.muzines.co.uk/blog/sound-diving-2-take-on-me/40
- https://danleroysbonusbeats.substack.com/p/hiding-in-plain-sight-an-interview · https://en.wikipedia.org/wiki/The_Sun_Always_Shines_on_T.V.
- https://cs.uwaterloo.ca/~dtompkin/music/track/AHA______GH1/AHA______GH1-06.html · https://acousticbrainz.org/0359f8c5-5914-4e91-ae77-7f953612ec2f
- https://en.wikipedia.org/wiki/Roland_Juno-60 · https://en.wikipedia.org/wiki/Scoundrel_Days

**Alphaville**
- https://en.wikipedia.org/wiki/Forever_Young_(Alphaville_album) · https://en.wikipedia.org/wiki/Forever_Young_(Alphaville_song) · https://en.wikipedia.org/wiki/Bernhard_Lloyd
- https://fr.audiofanzine.com/synthetiseur-rack/forums/t.662742,synthes-dans-la-variete-internationale-dans-les-annees-70-et-80.html · https://equipboard.com/pros/bernhard-lloyd
- https://www.classicpopmag.com/?p=12154 · https://www.matrixsynth.com/2024/06/alphaville-forever-young-vintage.html
- https://mb.videolan.org/release/75dc128f-7c3d-411c-abcc-d01e4e1d7f46 · https://en.wikipedia.org/wiki/Dance_with_Me_(Alphaville_song) · https://en.wikipedia.org/wiki/Afternoons_in_Utopia
- https://cs.uwaterloo.ca/~dtompkin/music/track/POWERTRK_014/POWERTRK_014-04.html

**OMD**
- https://www.electronicsound.co.uk/features/landmarks/orchestral-manoeuvres-in-the-dark-enola-gay · https://en.wikipedia.org/wiki/Enola_Gay_(song) · https://www.omd-messages.co.uk/?p=4015 · https://confidentials.com/liverpool/omds-cutting-edge-gear-becomes-museum-piece
- https://en.wikipedia.org/wiki/Souvenir_(song) · https://www.udiscovermusic.com/stories/omd-architecture-and-morality-album
- https://en.wikipedia.org/wiki/Maid_of_Orleans_(The_Waltz_Joan_of_Arc) · https://www.omd-messages.co.uk/?p=6438 · https://postpunkmonk.com/2017/10/16/rock-gpa-orchestral-manoeuvres-in-the-dark-part-11/ · https://www.planetmellotron.com/revomd.htm
- https://www.udiscovermusic.com/stories/omd-electricity-debut-single-synth-pop-interview/
- https://cs.uwaterloo.ca/~dtompkin/music/track/OMD______GH1/OMD______GH1-03.html

**The Human League**
- https://www.soundonsound.com/techniques/classic-tracks-human-league-dont-you-want-me · https://www.vintagedigital.com.au/classic-track/dont-you-want-me · https://stereogum.com/2086575/the-number-ones-the-human-leagues-dont-you-want-me/columns/the-number-ones
- https://postpunkmonk.com/2015/07/07/scarcity-vs-ubiquity-the-rise-and-fall-of-synthpop-part-4/ · https://burningtheground.net/the-human-league-dont-you-want-me-uk-12-2/
- https://www.sonicstate.com/news/2025/01/31/the-synths-used-on-dont-you-want-me/ · https://www.matrixsynth.com/2025/01/the-synths-behind-dont-you-want-me.html · https://www.syntorial.com/preset-recipe/the-human-league-dont-you-want-me-lead/ · https://www.kvraudio.com/forum/viewtopic.php?p=8483623
- https://en.wikipedia.org/wiki/Martin_Rushent · https://cs.uwaterloo.ca/~dtompkin/music/track/HUMANLGE_GH1/HUMANLGE_GH1-07.html

**New Order**
- https://www.musicradar.com/news/blue-monday-synth-sound · https://www.musicradar.com/news/new-order-blue-monday-best-synth-sound
- https://www.neworderonline.com/community/forums/digital-republic/26518-the-most-technologically-in-depth-article-about-new-order-s-live-sound-ever-and-it-even-mentions-the-vikings · https://bbc.in/1SC6Atc · https://en.wikipedia.org/wiki/Moog_Source
- https://cs.uwaterloo.ca/~dtompkin/music/track/NEWORDER_GH2/NEWORDER_GH2-02.html

**Erasure / Yazoo**
- https://en.wikipedia.org/wiki/Chorus_(Erasure_album) · https://429harrowroad.com/2020/02/ · https://www.muzines.co.uk/articles/vince-clarke/7547 · https://www.muzines.co.uk/articles/in-clarkes-shoes/2339 · https://www.muzines.co.uk/articles/clarke-techniques/4841
- https://www.gearnews.com/how-to-sound-like-vince-clarke-of-depeche-mode-yazoo-and-erasure · https://en.wikipedia.org/wiki/Erasure_(duo) · https://www.syntorial.com/preset-recipe/erasure-a-little-respect-keys/
- https://cs.uwaterloo.ca/~dtompkin/music/track/ERASURE__GH1/ERASURE__GH1-04.html · https://cs.uwaterloo.ca/~dtompkin/music/track/ERASURE__GH1/ERASURE__GH1-10.html · https://songbpm.com/@erasure/a-little-respect
- https://electricityclub.co.uk/?p=31634 · https://equipboard.com/pros/vince-clarke · https://www.classicpopmag.com/?p=45635
- https://www.musicradar.com/news/the-40-greatest-synth-sounds-of-all-time-no-12-yazoo-dont-go · https://synthtopia.com/content/2014/07/27/yazoo-dont-go-re-created-w-sequential-circuits-pro-one-synth
- https://cs.uwaterloo.ca/~dtompkin/music/track/ESSENTLS_010/ESSENTLS_010-06.html · https://www.mixgraph.io/artists/yazoo

**Lokal gelesen (nicht geändert):** `synq-snapshots/V0a.html` (Z. 5644 `ANALOG_BASE`, Z. 5691 Synthpop-Bass, Z. 5838 FM6-Format, Z. 5865 Pop-Bass DX, Z. 7195 Drum-`DEFAULTS`, Z. 7266 `SLOTS`, Z. 7321 „Gated 84“), `fmresearch/proto/rom1a.json` („SYN-LEAD 1“), `r6/bibliothek-recherche.md`, `SYNQUENZER-vision.md` Teil 3.1.
