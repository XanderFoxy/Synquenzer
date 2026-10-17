# R7 – Vorbild „EBM / Industrial / moderner Darkwave und Futurepop“: Die Krupps, Front Line Assembly, Apoptygma Berzerk, Assemblage 23, Combichrist, Wolfsheim, Seabound, Rotersand, Solar Fake, Diary of Dreams, Blutengel, Neuroticfish, Beborn Beton, Iris, Massive Ego (+ Beleg-Lücken DAF, Front 242, Nitzer Ebb, Skinny Puppy, Suicide Commando, Hocico, Covenant, VNV Nation, Mesh)

**Stand:** 17.10.2026 · Auftrag R7 Cluster „ebm-dark“ · Grundlage: Xanders Wunsch „alle Pioniere des Synthie-Pop und die modernen Vertreter von Dark Wave, EBM, Industrial, Cold Wave, Retrowave – alles, was mit Synthesizern zu tun hat und auf Synthie-Pop aufbaut, beginnend mit Kraftwerk und Gary Numan; alle signifikanten Signature-Sounds“. Geschwister: `r7/vorbild-dark.md` (DAF, Front 242, Nitzer Ebb, Skinny Puppy, Suicide Commando, Hocico – dort **ohne Netz**, alles UNBELEGT), `r7/vorbild-szene.md` (Covenant, VNV Nation, Mesh – Geräte UNBELEGT), `r7/vorbild-coldwave2.md`, `r7/vorbild-pop.md`, `r7/vorbild-helden.md`, `r7/vorbild-pioniere.md`, `r7/vorbild-retro.md`, `r7/vorbild-achtziger.md` (Format kurz/ganz), `r7/transposition-lage.md` (§3.3 Rollen, §3.5 `dirAt`, §3.7 Klammer), `r6/bibliothek-recherche.md`, `SYNQUENZER-vision.md`. App-Stand `synq-snapshots/V0a.html` nur gelesen (`ANALOG_BASE` Z. 5644, Mod-Quellen `SRC` Z. 5065, Ziele `DST` Z. 5067, `DrumKits.SLOTS` Z. 7266).

**Abgrenzung (nicht doppelt gebaut):**
- DAF, Front 242, Nitzer Ebb, Skinny Puppy, Suicide Commando, Hocico haben in `vorbild-dark.md` §5 schon Sounds (DK-11 bis DK-34) und Hörproben. Hier **nur die Beleg-Lücke** (dort gab es kein Netz) und **je 1–2 neue Sounds**, wo ein neuer Beleg einen anderen Klang verlangt (EB-01 bis EB-06).
- Covenant, VNV Nation, Mesh haben in `vorbild-szene.md` §4.8–4.10 Sounds (SZ-25 bis SZ-35). Hier **nur Beleg-Nachtrag**, keine neuen Sounds.
- Agonoize, Sixth June, De/Vision: `vorbild-coldwave2.md`. And One, Project Pitchfork u. a.: `vorbild-szene.md`. Nicht berührt.
- „Eisbrecher-frei“: nur synth-zentrierte Acts; Gitarren-Industrial-Rock (Eisbrecher, Rammstein usw.) ist bewusst draußen.

**Werkzeuge und Grenzen (ehrlich):**
- **WebSearch ging in diesem Lauf** (28 Suchen). **WebFetch ging nicht** (`getaddrinfo ENOTFOUND en.wikipedia.org`). Keine Seite wurde direkt geöffnet; **alle Web-Fakten stützen sich auf Suchauszüge (SE)**. Auch Interview-Zitate sind hier nur über den Auszug gelesen.
- **Für die meisten neuen Acts fand die Suche keine Geräte-Angaben** (je 1 Suche: Wolfsheim, Seabound, Rotersand, Solar Fake, Diary of Dreams, Blutengel, Beborn Beton, Iris, Massive Ego, Assemblage 23, Combichrist, Hocico). Dort steht „Gerät UNBELEGT“, und das Rezept beschreibt den **hörbaren Stil**, kein behauptetes Original-Patch.
- **Nicht gesucht:** Tempo und Tonart der Original-Titel. Sie stehen nirgends als Fakt.
- Die Hörproben sind **eigene Kompositionen**, per Skript erzeugt und geprüft (`r7/ebm-work/aud.mjs` → `aud-report.txt`, `aud-ebm.json`; Tabelle und Klammer-Prüfung `assemble.mjs`). **Nichts ist angehört, nichts gemessen.** Pegel nicht kalibriert (Ziel −18 LUFS).

**Kennzeichen**
- **BELEGT** = Primärquelle (Interview/Zitat des Musikers, Credits) **oder** zwei unabhängige Quellen sagen dasselbe.
- **WAHRSCHEINLICH** = nur eine Sekundärquelle (Wikipedia allein, Fachblog, Equipboard, Fan-Seite), Quelle nur aus zweiter Hand, oder Quellen widersprechen sich.
- **UNBELEGT** = nichts gefunden; eigene Kenntnis (eK) oder Einschätzung. Nie als Fakt in einen ⓘ-Text.
- Alles unter „Rezept“, „Warum so“, „Hörprobe“, „Abstand“, „Karte“ ist **eigener Entwurf**, kein Quellenfakt.
- (SE) = Fakt nur aus einem Suchauszug. Equipboard zählt nie allein als BELEGT.

---

## 0. Kurzfazit

| Thema | Ergebnis |
|---|---|
| Acts | **15 neu** (Die Krupps, Front Line Assembly, Apoptygma Berzerk, Assemblage 23, Combichrist, Wolfsheim, Seabound, Rotersand, Solar Fake, Diary of Dreams, Blutengel, Neuroticfish, Beborn Beton, Iris, Massive Ego) + **9 Beleg-Nachträge** (DAF, Front 242, Nitzer Ebb, Skinny Puppy, Suicide Commando, Hocico, Covenant, VNV Nation, Mesh) |
| Neue Sounds | **27: EB-01 … EB-27** (18 VA, 4 FM6, 2 WT, 3 Drum-Kits). Je Sound Rezept, Rolle, Lage, LAGE-Klammer, Akkord-Reaktion, Hörprobe, Kartentext. |
| Hörproben | **27**, je 4 oder 8 Takte, **kurz ≤ 8 s** (6,4–8,0 s) und **ganz ≤ 16 s** (6,9–15,2 s). 0 direkte Takt-Wiederholungen in allen Melodie-Spuren, alle Drum-Takte verschieden, jede Probe hat eine Wendung im letzten Takt. Alle Proben bleiben in ihrer LAGE-Klammer (Skript-Prüfung). |
| Wichtigste neue Belege | **DAF:** Korg **MS-20** + Korg **SQ-10** (2 Quellen, BELEGT); eine Sequenz ist Bass und Melodie zugleich, einzelne Schritte bewusst leicht verstimmt (WAHRSCHEINLICH). **Front 242:** **E-mu Emulator II** zentral, Drums vom **E-mu Drumulator**, Synth meist **FM (DX7, später TG-77)** (je 2 Quellen, BELEGT). **Nitzer Ebb:** „That Total Age“ ganz auf einem **Roland SH-101** (WAHRSCHEINLICH, Zitat nur aus zweiter Hand). **Skinny Puppy:** cEvin Key: erstes Gerät **Moog Multimoog**, zweites **Sequential Pro-One**, „stark auf den Platten benutzt“ (Primärquelle, BELEGT). **Suicide Commando:** Anfang mit **Roland SH-101 + Boss DR-55**, Computer (Atari 1040ST) erst ab 1995 (WAHRSCHEINLICH: ein Suchauszug, Seite nicht gelesen, Nachsuche ohne Treffer). **VNV Nation:** Album „Empires“ mit nur **einem** Synth (**Access Virus**) + 2 Samplern; „Futureperfect“ u. a. ARP 2600, JP-8000, Virus (WAHRSCHEINLICH, Wikipedia). **Mesh:** Silverthorn: erster Synth **Pro-One**, heute **Korg MS2000** und **Trinity-Rack** (Primärquelle, BELEGT). **Futurepop** als Begriff aus einem Gespräch Ronan Harris (VNV) – Stephan Groth (Apoptygma) (2 Quellen, BELEGT). |
| Ohne Gerätebeleg (16) | Hocico, Covenant (nur Equipboard), Neuroticfish (nur Equipboard), Apoptygma, Assemblage 23, Combichrist, Wolfsheim, Seabound, Rotersand, Solar Fake, Diary of Dreams, Blutengel, Beborn Beton, Iris, Massive Ego, Front Line Assembly (nur Equipboard: Kawai K4 bei Fulber). |
| Korrekturen/Warnungen | 8 (§5), u. a.: Der „Joakim“-Studiofilm von The Vinyl Factory ist **nicht** Covenants Joakim Montelius; Massive Egos Synth-Mann heißt **Scot Collins**; SQ-10 „12 oder 16 Schritte“ widersprüchlich. |
| Engine-Lücken | HP+LP hintereinander (MS-20), Poly-Mod (Pro-One), Bitcrusher/Sample-Rauheit (Drumulator, Emulator), Sampler/Stimmen-Fetzen, Verzerrer vor dem Filter (§6). |

---

## 1. Recht, Format, Lage (Kurzform)

- **Recht:** wie `vorbild-pop.md` §1 und `vorbild-dark.md` §2 (kein Rechtsrat). Frei: Stil, Klangfarbe, Gerätetyp, Spieltechnik, Allerwelts-Akkordfolgen und -Rhythmen (Galopp, 16tel-Oktavbass, Offbeat-Roll, Four-on-the-Floor). **Nicht:** Melodie oder Riff eines Titels, Samples, Titel-/Künstler-/Gerätenamen im Sound-Namen (E9). Vorbild nur im ⓘ und im Filter, Pflichtsatz „Marken gehören ihren Inhabern, keine Verbindung.“, Formulierung „erinnert an … (Stil)“.
- **Selbst angewendete Regeln:** eigene Melodie, eigene Bassfigur, eigenes Drum-Muster; keine Folge von mehr als 3 Tönen im Rhythmus eines mir bekannten Riffs; erkennbar sein sollen Klang, Lage, Tempo-Gefühl, Rhythmus-Technik, Harmonik. Ein Abgleich gegen Original-Noten war nicht möglich; vor dem Einbau hört ein Mensch gegen (Pflichtvermerk „eigene Melodie“ wie V10d-05).
- **Format:** wie `vorbild-achtziger.md` §1. Noten `Ton(MIDI) Start/Länge/Anschlag`, Start und Länge in 16teln ab Takt 1, Anschlag 1–127. `aud`-Daten `[b, d, n, v]` in Schlägen (16tel ÷ 4), **v = Anschlag/127 (0–1)**. **Kurz** ≤ 8 s, **ganz** ≤ 16 s; passen nicht alle Takte, gelten die ersten n − 1 Takte plus der letzte. Drums als Schritt-Zeilen je Pad (`DrumKits.SLOTS`). Maschinenlesbar: `r7/ebm-work/aud-ebm.json`.
- **Rezept-Schlüssel:** VA = Abweichungen von `ANALOG_BASE` (Wellen 0 Säge · 1 Puls · 2 Dreieck · 3 Sinus; `ftype` 0 LP24 · 1 LP12 · 2 BP24; `mode` 0 poly · 1 mono · 2 legato); Route `M(src, dst, amt)`, Quellen `lfo1 lfo2 fenv menv vel key mw rnd aenv` (V0a Z. 5065), Tonhöhe 1,0 = 24 HT, Cutoff 1,0 = 120 HT. FM6 = `OP(coarse, ol, r[4], l[4], {fine, det, vs, rs})` in DX7-Einheiten, Algorithmen in DX7-Nummerierung. WT = `wt: {table, pos, scan, scanTime}` mit Tabellen `digital · vocal · glas · orgel`. Drums = Abweichungen von `DrumSynth.DEFAULTS`, Kit-Bus `{gate, room}`. Verzerrung über **Spur-Drive** (`fx.drive`), nicht Filter-Drive (R6 §0 gemessen).
- **Lage / Akkord-Reaktion:** Vorschlag für `sound.lage` (LAGE-Klammer, `transposition-lage.md` §3.7) und `sound.dirAt` bzw. Rollen-Verhalten (§3.3). Bass: „nächstliegend, nie über X“, Gleichstand abwärts, Boden E1. Parallele Stabs: **Block (Verhalten Sequenz)**. Flächen: Stimmführung. Lead: folgt der Oktave der Taste.

---

## 2. Beleg-Nachträge zu Acts, die es schon gibt (+ neue Sounds EB-01 bis EB-06)

### 2.1 DAF (`vorbild: daf`, Ergänzung zu `vorbild-dark.md` §5.6)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Görl: Schlagzeug und Elektronik, Delgado: Gesang; außer Schlagzeug fast nur **Korg MS-20** (und ARP Odyssey), **meist vom Korg SQ-10 gesteuert** | **BELEGT** für MS-20 + SQ-10 (Wikipedia + Electricity Club, beide SE); **ARP Odyssey WAHRSCHEINLICH** (nur Wikipedia) | https://en.wikipedia.org/wiki/Deutsch_Amerikanische_Freundschaft · https://www.electricityclub.co.uk/?p=72597 bzw. https://electricityclub.co.uk/tag/daf (Fundstelle im Auszug nicht eindeutig) |
| SQ-10: 3 Kanäle, **12 Schritte**, CV/Gate | **WAHRSCHEINLICH** (Electricity Club; eine andere Quelle im Auszug sagt 16 Schritte → Widerspruch) | wie oben |
| Meist **eine** Sequenzer-Linie, die zugleich Bass und Melodie ist; auf dem Titelsong von „Alles ist gut“ sind **einzelne Schritte leicht verstimmt** | WAHRSCHEINLICH (nur Wikipedia/Mirror) | Wikipedia (wie oben); https://www.liquisearch.com/daf_band/style (Spiegel von Wikipedia, nicht unabhängig) |
| „Alles ist gut“: Virgin, produziert von Conny Plank, Deutscher Schallplattenpreis | WAHRSCHEINLICH (Wikipedia) | Wikipedia (wie oben) |

**Folge:** `vorbild-dark.md` DK-18 „Stufen-Sequenz“ (MS-20, Korg SQ-10) ist jetzt **Gerät BELEGT**. Der dort genannte §9-Prüfauftrag Nr. 1 ist erledigt. Neu ist ein zweites Merkmal: **12-Schritt-Kette gegen 16tel-Takt** und **verstimmte Einzelschritte**. Das bildet EB-01 ab.

#### EB-01 „Schiefe Kette“ – Rolle Bass/Sequenz · VA (neu)

- **Vorbild (ⓘ):** einstimmiger Analog-Synth an einem Step-Sequenzer, eine Linie ist Bass und Melodie zugleich, einzelne Schritte leicht schief (Gerät BELEGT, Patch UNBELEGT).
- **Rezept:** `o1w 0, o2lvl 0, ftype 0, cutoff 520, res .55, drive .25, kt .4, bass .6, fenv .42, fvel .45, fA .001, fD .1, fS .1, fR .05, aA .001, aD .2, aS .7, aR .05, ampVel .4, mode 1, poly 1, reset 1, analog .3` · Route `M('rnd', 'pitch', .006)` (≈ ±0,14 HT = ±14 Cent je Ton; **ob `rnd` je Anschlag neu würfelt, ist im Code nicht geprüft** – sonst `M('lfo1','pitch',.006)` mit `l1shape 4, l1sync .25`) · fx `{drive .2, rev .05}`.
- **Warum so:** Ein Oszillator, starke Resonanz und Anschlag → Filter wie DK-18; neu ist die kleine Zufalls-Verstimmung. Die Polymetrik entsteht im **Clip** (12er-Kette über 16tel), nicht im Patch.
- **Lücke:** MS-20 hat Hochpass **vor** dem Tiefpass (UNBELEGT, eK, Standardwissen). Erst mit VK (zweites Filter/SVF) baubar.
- **Lage / Rolle:** E1–D3 (28–50). LAGE-Klammer **hoch D3**. Akkord-Reaktion: **nächstliegend, nie über D3**; live führt die Hand (⇅ TRANSPONIEREN) – genau die DAF-Arbeitsweise „Kette laufen lassen, Grundton schieben“.
- **Hörprobe** (126 BPM, Powerchord-Grundtöne, 12-Schritt-Kette `R R O R ♭3 R 5 R ♭7 O 5 ♭3` läuft über die Taktgrenze und rutscht je Takt um 4 Schritte):
```
Tempo 126 BPM · 8 Takte · Akkorde: E5 | E5 | A5 | E5 | C5 | D5 | G5 | B5
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E1(28) 0/1/112 · E1(28) 1/1/76 · E2(40) 2/1/96 · E1(28) 3/1/78 · G1(31) 4/1/104 · E1(28) 5/1/76 · B1(35) 6/1/94 · E1(28) 7/1/78 · D2(38) 8/1/100 · E2(40) 9/1/90 · B1(35) 10/1/92 · G1(31) 11/1/80 · E1(28) 12/1/112 · E1(28) 13/1/76 · E2(40) 14/1/96 · E1(28) 15/1/78
T2: G1(31) 16/1/104 · E1(28) 17/1/76 · B1(35) 18/1/94 · E1(28) 19/1/78 · D2(38) 20/1/100 · E2(40) 21/1/90 · B1(35) 22/1/92 · G1(31) 23/1/80 · E1(28) 24/1/112 · E1(28) 25/1/76 · E2(40) 26/1/96 · E1(28) 27/1/78 · G1(31) 28/1/104 · E1(28) 29/1/76 · B1(35) 30/1/94 · E1(28) 31/1/78
T3: G2(43) 32/1/100 · A2(45) 33/1/90 · E2(40) 34/1/92 · C2(36) 35/1/80 · A1(33) 36/1/112 · A1(33) 37/1/76 · A2(45) 38/1/96 · A1(33) 39/1/78 · C2(36) 40/1/104 · A1(33) 41/1/76 · E2(40) 42/1/94 · A1(33) 43/1/78 · G2(43) 44/1/100 · A2(45) 45/1/90 · E2(40) 46/1/92 · C2(36) 47/1/80
T4: E1(28) 48/1/112 · E1(28) 49/1/76 · E2(40) 50/1/96 · E1(28) 51/1/78 · G1(31) 52/1/104 · E1(28) 53/1/76 · B1(35) 54/1/94 · E1(28) 55/1/78 · D2(38) 56/1/100 · E2(40) 57/1/90 · B1(35) 58/1/92 · G1(31) 59/1/80 · E1(28) 60/1/112 · E1(28) 61/1/76 · E2(40) 62/1/96 · E1(28) 63/1/78
T5: Eb2(39) 64/1/104 · C2(36) 65/1/76 · G2(43) 66/1/94 · C2(36) 67/1/78 · Bb2(46) 68/1/100 · C3(48) 69/1/90 · G2(43) 70/1/92 · Eb2(39) 71/1/80 · C2(36) 72/1/112 · C2(36) 73/1/76 · C3(48) 74/1/96 · C2(36) 75/1/78 · Eb2(39) 76/1/104 · C2(36) 77/1/76 · G2(43) 78/1/94 · C2(36) 79/1/78
T6: C3(48) 80/1/100 · D3(50) 81/1/90 · A2(45) 82/1/92 · F2(41) 83/1/80 · D2(38) 84/1/112 · D2(38) 85/1/76 · D3(50) 86/1/96 · D2(38) 87/1/78 · F2(41) 88/1/104 · D2(38) 89/1/76 · A2(45) 90/1/94 · D2(38) 91/1/78 · C3(48) 92/1/100 · D3(50) 93/1/90 · A2(45) 94/1/92 · F2(41) 95/1/80
T7: G1(31) 96/1/112 · G1(31) 97/1/76 · G2(43) 98/1/96 · G1(31) 99/1/78 · Bb1(34) 100/1/104 · G1(31) 101/1/76 · D2(38) 102/1/94 · G1(31) 103/1/78 · F2(41) 104/1/100 · G2(43) 105/1/90 · D2(38) 106/1/92 · Bb1(34) 107/1/80 · G1(31) 108/1/112 · G1(31) 109/1/76 · G2(43) 110/1/96 · G1(31) 111/1/78
T8: D2(38) 112/1/104 · B1(35) 113/1/76 · F#2(42) 114/1/94 · B1(35) 115/1/78 · A2(45) 116/1/100 · B2(47) 117/1/90 · F#2(42) 118/1/92 · D2(38) 119/1/80 · B1(35) 120/1/112 · B1(35) 121/1/76 · B2(47) 122/1/96 · B1(35) 123/1/78 · D2(38) 124/1/104 · B1(35) 125/1/76 · F#2(42) 126/1/94 · B1(35) 127/1/78
```
Dauer: alle 8 Takte 15,2 s · kurz (≤ 8 s) T1, T2, T3, T8 = 7,6 s · ganz (≤ 16 s) T1, T2, T3, T4, T5, T6, T7, T8 = 15,2 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.25,28,0.88],[0.25,0.25,28,0.6],[0.5,0.25,40,0.76],[0.75,0.25,28,0.61],[1,0.25,31,0.82],[1.25,0.25,28,0.6],[1.5,0.25,35,0.74],[1.75,0.25,28,0.61],[2,0.25,38,0.79],[2.25,0.25,40,0.71],[2.5,0.25,35,0.72],[2.75,0.25,31,0.63],[3,0.25,28,0.88],[3.25,0.25,28,0.6],[3.5,0.25,40,0.76],[3.75,0.25,28,0.61],[4,0.25,31,0.82],[4.25,0.25,28,0.6],[4.5,0.25,35,0.74],[4.75,0.25,28,0.61],[5,0.25,38,0.79],[5.25,0.25,40,0.71],[5.5,0.25,35,0.72],[5.75,0.25,31,0.63],[6,0.25,28,0.88],[6.25,0.25,28,0.6],[6.5,0.25,40,0.76],[6.75,0.25,28,0.61],[7,0.25,31,0.82],[7.25,0.25,28,0.6],[7.5,0.25,35,0.74],[7.75,0.25,28,0.61],[8,0.25,43,0.79],[8.25,0.25,45,0.71],[8.5,0.25,40,0.72],[8.75,0.25,36,0.63],[9,0.25,33,0.88],[9.25,0.25,33,0.6],[9.5,0.25,45,0.76],[9.75,0.25,33,0.61],[10,0.25,36,0.82],[10.25,0.25,33,0.6],[10.5,0.25,40,0.74],[10.75,0.25,33,0.61],[11,0.25,43,0.79],[11.25,0.25,45,0.71],[11.5,0.25,40,0.72],[11.75,0.25,36,0.63],[12,0.25,38,0.82],[12.25,0.25,35,0.6],[12.5,0.25,42,0.74],[12.75,0.25,35,0.61],[13,0.25,45,0.79],[13.25,0.25,47,0.71],[13.5,0.25,42,0.72],[13.75,0.25,38,0.63],[14,0.25,35,0.88],[14.25,0.25,35,0.6],[14.5,0.25,47,0.76],[14.75,0.25,35,0.61],[15,0.25,38,0.82],[15.25,0.25,35,0.6],[15.5,0.25,42,0.74],[15.75,0.25,35,0.61]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 8`): `[[0,0.25,28,0.88],[0.25,0.25,28,0.6],[0.5,0.25,40,0.76],[0.75,0.25,28,0.61],[1,0.25,31,0.82],[1.25,0.25,28,0.6],[1.5,0.25,35,0.74],[1.75,0.25,28,0.61],[2,0.25,38,0.79],[2.25,0.25,40,0.71],[2.5,0.25,35,0.72],[2.75,0.25,31,0.63],[3,0.25,28,0.88],[3.25,0.25,28,0.6],[3.5,0.25,40,0.76],[3.75,0.25,28,0.61],[4,0.25,31,0.82],[4.25,0.25,28,0.6],[4.5,0.25,35,0.74],[4.75,0.25,28,0.61],[5,0.25,38,0.79],[5.25,0.25,40,0.71],[5.5,0.25,35,0.72],[5.75,0.25,31,0.63],[6,0.25,28,0.88],[6.25,0.25,28,0.6],[6.5,0.25,40,0.76],[6.75,0.25,28,0.61],[7,0.25,31,0.82],[7.25,0.25,28,0.6],[7.5,0.25,35,0.74],[7.75,0.25,28,0.61],[8,0.25,43,0.79],[8.25,0.25,45,0.71],[8.5,0.25,40,0.72],[8.75,0.25,36,0.63],[9,0.25,33,0.88],[9.25,0.25,33,0.6],[9.5,0.25,45,0.76],[9.75,0.25,33,0.61],[10,0.25,36,0.82],[10.25,0.25,33,0.6],[10.5,0.25,40,0.74],[10.75,0.25,33,0.61],[11,0.25,43,0.79],[11.25,0.25,45,0.71],[11.5,0.25,40,0.72],[11.75,0.25,36,0.63],[12,0.25,28,0.88],[12.25,0.25,28,0.6],[12.5,0.25,40,0.76],[12.75,0.25,28,0.61],[13,0.25,31,0.82],[13.25,0.25,28,0.6],[13.5,0.25,35,0.74],[13.75,0.25,28,0.61],[14,0.25,38,0.79],[14.25,0.25,40,0.71],[14.5,0.25,35,0.72],[14.75,0.25,31,0.63],[15,0.25,28,0.88],[15.25,0.25,28,0.6],[15.5,0.25,40,0.76],[15.75,0.25,28,0.61],[16,0.25,39,0.82],[16.25,0.25,36,0.6],[16.5,0.25,43,0.74],[16.75,0.25,36,0.61],[17,0.25,46,0.79],[17.25,0.25,48,0.71],[17.5,0.25,43,0.72],[17.75,0.25,39,0.63],[18,0.25,36,0.88],[18.25,0.25,36,0.6],[18.5,0.25,48,0.76],[18.75,0.25,36,0.61],[19,0.25,39,0.82],[19.25,0.25,36,0.6],[19.5,0.25,43,0.74],[19.75,0.25,36,0.61],[20,0.25,48,0.79],[20.25,0.25,50,0.71],[20.5,0.25,45,0.72],[20.75,0.25,41,0.63],[21,0.25,38,0.88],[21.25,0.25,38,0.6],[21.5,0.25,50,0.76],[21.75,0.25,38,0.61],[22,0.25,41,0.82],[22.25,0.25,38,0.6],[22.5,0.25,45,0.74],[22.75,0.25,38,0.61],[23,0.25,48,0.79],[23.25,0.25,50,0.71],[23.5,0.25,45,0.72],[23.75,0.25,41,0.63],[24,0.25,31,0.88],[24.25,0.25,31,0.6],[24.5,0.25,43,0.76],[24.75,0.25,31,0.61],[25,0.25,34,0.82],[25.25,0.25,31,0.6],[25.5,0.25,38,0.74],[25.75,0.25,31,0.61],[26,0.25,41,0.79],[26.25,0.25,43,0.71],[26.5,0.25,38,0.72],[26.75,0.25,34,0.63],[27,0.25,31,0.88],[27.25,0.25,31,0.6],[27.5,0.25,43,0.76],[27.75,0.25,31,0.61],[28,0.25,38,0.82],[28.25,0.25,35,0.6],[28.5,0.25,42,0.74],[28.75,0.25,35,0.61],[29,0.25,45,0.79],[29.25,0.25,47,0.71],[29.5,0.25,42,0.72],[29.75,0.25,38,0.63],[30,0.25,35,0.88],[30.25,0.25,35,0.6],[30.5,0.25,47,0.76],[30.75,0.25,35,0.61],[31,0.25,38,0.82],[31.25,0.25,35,0.6],[31.5,0.25,42,0.74],[31.75,0.25,35,0.61]]`
- **Abstand:** Kette aus Grundton, Oktave, kleiner Terz, Quinte, kleiner Septime – Akkordtöne. Kein Riff eines Titels. Takt 1 und Takt 4 sind gleich (gleiche Kette, gleicher Grundton), aber nicht direkt hintereinander.
- **Karte:** „Eine 12er-Sequenzkette, die über den Takt wandert, leicht schief gestimmt – erinnert an Düsseldorfer Elektro-Punk um 1981 (Stil DAF).“

### 2.2 Front 242 (`vorbild: front-242`, Ergänzung zu `vorbild-dark.md` §5.4)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| **E-mu Emulator II** war das zentrale Instrument; live blieb am Ende nur der Emulator II; darüber kamen Synth-Samples, Stimmfetzen, Glitches | **BELEGT** (bonedo + gearnews + matrixsynth, SE) | https://www.bonedo.de/artikel/die-praegenden-synthesizer-von-front-242 · https://www.gearnews.com/front-242-most-used-synths-drum-machines-and-sounds · https://www.matrixsynth.com/2011/11/front-242s-emulator-ii.html |
| Codenys: ein Emulator kostete etwa so viel wie ein Auto, „ich nahm die Maschine statt des Autos“ | WAHRSCHEINLICH (Zitat im Auszug, Fundstelle zwischen RBMA und lostinconcert nicht eindeutig) | https://daily.redbullmusicacademy.com/2017/07/front-242-interview/ · https://lostinconcert.com/interview-patrick-codenys-of-front-242/ |
| Drumsound vom „harten“ **E-mu Drumulator** | **BELEGT** (bonedo + gearnews, SE) | wie oben |
| Synth meist **FM**: zuerst **Yamaha DX7**, später **TG-77** | **BELEGT** (bonedo + gearnews, SE) | wie oben |
| Frühphase: **Roland TR-808**; kurzes Intermezzo mit **PPG Wave** um „No Comment“ | WAHRSCHEINLICH (nur bonedo) | bonedo (wie oben) |
| „Headhunter“ auf „Front by Front“ (1988), Platz 13 Billboard Dance | WAHRSCHEINLICH (Wikipedia) | https://en.wikipedia.org/wiki/Front_by_Front |

**Folge:** DK-11 Kommando-Bass und DK-12 Signal-Stab (beide VA) bleiben als Stil-Sounds richtig, aber der **belegte** Kern ist **FM + Sampler + Drumulator**. Deshalb neu: EB-02 (Drumulator-artiges Kit) und EB-03 (FM-Stab). DK-13 „Kurzwellen-Atmo“ ersetzt weiter die Stimmfetzen (keine fremden Samples).

#### EB-02 „Ziegel-Kit“ – Rolle Drums · Drum-Synth (neu)

- **Vorbild (ⓘ):** harte, kurze Digital-Drums der Mitte der 80er (Drumulator BELEGT; Klangwerte UNBELEGT).
- **Kit-Rezept (Abweichungen):** KICK `{frq 55, pAmt 18, pDec .025, tDec .22, cLvl .5, drv .3}` · SNARE `{tLvl .6, frq 200, tDec .07, nLvl .9, nTyp 'bandpass', nFrq 2200, nDec .12, sRoom .35, sGate .12}` · HH ZU `{mLvl .5, mHp 7000, nLvl .5, nDec .03}` · TOM `{frq 120, pAmt 5, tDec .25}` · PERC `{mLvl .7, mTun 1.3, mDec .08, nLvl .2}` (Metall) · Kit-Bus `{gate .15, room .3}` · Spur-Drive .2.
- **Warum so:** Die frühen Sample-Drumcomputer klingen kurz, trocken, „körnig“ (eK). Ohne Bitcrusher (erst VK P1 `crush`) kommt die Härte aus Klick, Pitch-Hüllkurve und kurzem Gate-Raum.
- **Lage / Rolle:** Drums, keine Klammer.
- **Hörprobe** (120 BPM, Kick-Figur 1 · 2-und · 3, Snare 2 und 4, Metall-Perc auf 1-e-und-a, Tom-Fill in Takt 4):
```
Tempo 120 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK  | x.....x.x....... | x.....x.x....... | x.....x.x.....x. | x.....x.x...x.x.
SNARE | ....x.......x... | ....x.......x... | ....x.......x... | ....x.......x.xx
HH ZU | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.x.xx | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.....
TOM   | ................ | ................ | ................ | ..........x..x..
PERC  | ...x.......x.... | ...x...x...x.... | ...x.......x...x | ...x............
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s
- **Abstand:** Allerwelts-EBM-Groove; kein Original-Muster.
- **Karte:** „Harte, kurze Digital-Trommeln mit Metall und Gate-Raum – erinnert an belgische EBM der 80er (Stil Front 242).“

#### EB-03 „FM-Kantenstab“ – Rolle Akkord/Stab · FM6 (neu)

- **Vorbild (ⓘ):** kurzer, metallischer FM-Akkordschlag (DX7 BELEGT, Patch UNBELEGT).
- **Rezept (FM6):** `alg 5, fb 0` · OP1 `(1, 99, [99,45,30,60], [99,40,0,0], {vs 3})` · OP2 `(3, 80, [99,60,40,60], [99,20,0,0], {vs 6})` · OP3 `(1, 92, [99,50,30,60], [99,45,0,0], {det 4})` · OP4 `(7, 68, [99,75,45,60], [99,0,0,0], {vs 7})` · OP5/OP6 aus · common `{gain −14, poly 6}` · fx `{drive .15, dly .12, rev .2}`.
- **Warum so:** Zwei Träger-Modulator-Paare; das Verhältnis 1:3 gibt Kante, 1:7 nur im Anschlag gibt den metallischen „Klick“. Hohe Anschlag-Empfindlichkeit (`vs 6–7`) = Akzente bellen.
- **Lage / Rolle:** D3–C4 (50–60). LAGE-Klammer **A2–F4**. Akkord-Reaktion: **Block (Sequenz)** – alle Stimmen parallel wie ein Sampler-Stab.
- **Hörprobe** (120 BPM, Offbeat-Stabs, Takt 4 synkopiert mit langem Schluss):
```
Tempo 120 BPM · 4 Takte · Akkorde: Dm | Dm | Bb | C
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D3(50) 2/1/104 · F3(53) 2/1/104 · A3(57) 2/1/104 · D3(50) 6/1/92 · F3(53) 6/1/92 · A3(57) 6/1/92 · D3(50) 10/1/104 · F3(53) 10/1/104 · A3(57) 10/1/104 · D3(50) 14/1/92 · F3(53) 14/1/92 · A3(57) 14/1/92
T2: D3(50) 18/1/104 · F3(53) 18/1/104 · A3(57) 18/1/104 · D3(50) 22/1/92 · F3(53) 22/1/92 · A3(57) 22/1/92 · D3(50) 25/1/98 · F3(53) 25/1/98 · A3(57) 25/1/98 · D3(50) 28/1/90 · F3(53) 28/1/90 · A3(57) 28/1/90 · D3(50) 30/1/100 · F3(53) 30/1/100 · A3(57) 30/1/100
T3: D3(50) 34/1/104 · F3(53) 34/1/104 · Bb3(58) 34/1/104 · D3(50) 38/1/92 · F3(53) 38/1/92 · Bb3(58) 38/1/92 · D3(50) 42/1/104 · F3(53) 42/1/104 · Bb3(58) 42/1/104 · D3(50) 45/1/92 · F3(53) 45/1/92 · Bb3(58) 45/1/92
T4: E3(52) 48/1/110 · G3(55) 48/1/110 · C4(60) 48/1/110 · E3(52) 51/1/94 · G3(55) 51/1/94 · C4(60) 51/1/94 · E3(52) 54/1/100 · G3(55) 54/1/100 · C4(60) 54/1/100 · E3(52) 58/1/94 · G3(55) 58/1/94 · C4(60) 58/1/94 · E3(52) 60/1/102 · G3(55) 60/1/102 · C4(60) 60/1/102 · E3(52) 62/2/112 · G3(55) 62/2/112 · C4(60) 62/2/112
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0.5,0.25,50,0.82],[0.5,0.25,53,0.82],[0.5,0.25,57,0.82],[1.5,0.25,50,0.72],[1.5,0.25,53,0.72],[1.5,0.25,57,0.72],[2.5,0.25,50,0.82],[2.5,0.25,53,0.82],[2.5,0.25,57,0.82],[3.5,0.25,50,0.72],[3.5,0.25,53,0.72],[3.5,0.25,57,0.72],[4.5,0.25,50,0.82],[4.5,0.25,53,0.82],[4.5,0.25,57,0.82],[5.5,0.25,50,0.72],[5.5,0.25,53,0.72],[5.5,0.25,57,0.72],[6.25,0.25,50,0.77],[6.25,0.25,53,0.77],[6.25,0.25,57,0.77],[7,0.25,50,0.71],[7,0.25,53,0.71],[7,0.25,57,0.71],[7.5,0.25,50,0.79],[7.5,0.25,53,0.79],[7.5,0.25,57,0.79],[8.5,0.25,50,0.82],[8.5,0.25,53,0.82],[8.5,0.25,58,0.82],[9.5,0.25,50,0.72],[9.5,0.25,53,0.72],[9.5,0.25,58,0.72],[10.5,0.25,50,0.82],[10.5,0.25,53,0.82],[10.5,0.25,58,0.82],[11.25,0.25,50,0.72],[11.25,0.25,53,0.72],[11.25,0.25,58,0.72],[12,0.25,52,0.87],[12,0.25,55,0.87],[12,0.25,60,0.87],[12.75,0.25,52,0.74],[12.75,0.25,55,0.74],[12.75,0.25,60,0.74],[13.5,0.25,52,0.79],[13.5,0.25,55,0.79],[13.5,0.25,60,0.79],[14.5,0.25,52,0.74],[14.5,0.25,55,0.74],[14.5,0.25,60,0.74],[15,0.25,52,0.8],[15,0.25,55,0.8],[15,0.25,60,0.8],[15.5,0.5,52,0.88],[15.5,0.5,55,0.88],[15.5,0.5,60,0.88]]`
- **Abstand:** Dreiklänge auf Offbeats; keine Melodie.
- **Karte:** „Metallischer FM-Stab auf den Offbeats – erinnert an belgische EBM um 1988 (Stil Front 242).“

### 2.3 Nitzer Ebb (`vorbild: nitzer-ebb`, Ergänzung zu `vorbild-dark.md` §5.5)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Bon Harris: „That Total Age“ **ganz auf einem Roland SH-101** gemacht; „That sound established us“ | **WAHRSCHEINLICH** (Zitat nur aus zweiter Hand: Equipboard gibt ein Roland- und ein Bitwig-Interview wieder, Forenpost; Roland-Artikel existiert, Text nicht gelesen) | https://equipboard.com/albums/nitzer-ebb-that-total-age · https://articles.roland.com/?p=4098 (A. Rosenschein, „Synthesizing Belief“, 2020) |
| Im Studio legte der Produzent **DX7**-Klänge darüber | WAHRSCHEINLICH (nur Equipboard) | wie oben |
| Nitzer Ebb in der Liste bekannter SH-101-Nutzer | WAHRSCHEINLICH (Wikipedia) | https://en.wikipedia.org/wiki/SH-101 |
| Erster Synth von Bon Harris: **EDP Wasp**; heute u. a. Roland System-100M | WAHRSCHEINLICH (Suchauszug, Quelle Wikipedia/Roland) | https://en.wikipedia.org/wiki/Bon_Harris |

**Folge:** DK-15 „Drill-Bass“ (Puls + Säge gemischt) passt grob. SH-101-typisch ist (eK, UNBELEGT): **ein** Oszillator mit Säge/Puls + **Sub-Oszillator**, LP24 mit Resonanz. EB-04 ist die genauere Variante.

#### EB-04 „Ein-Osz-Drillbass“ – Rolle Bass · VA (neu)

- **Vorbild (ⓘ):** einstimmiger Kompakt-Synth mit Sub-Oszillator, 16tel mit Akzenten (Gerät WAHRSCHEINLICH, Patch UNBELEGT).
- **Rezept:** `o1w 1, o1pw .5, o2lvl 0, subLvl .55, subOct 1, ftype 0, cutoff 330, res .5, drive .2, kt .35, bass .6, fenv .5, fvel .55, fA .001, fD .07, fS 0, fR .04, aA .001, aD .12, aS .55, aR .03, ampVel .45, mode 1, poly 1, reset 1, analog .15` · fx `{drive .3}`.
- **Warum so:** Puls + Sub statt zweier Oszillatoren = schmal, aber druckvoll. Sehr kurze Filter-Hüllkurve mit starkem Anschlag-Anteil: Akzente „bellen“.
- **Lage / Rolle:** G1–E♭3 (31–51). LAGE-Klammer **hoch E3**. Akkord-Reaktion: **nächstliegend, nie über E3**.
- **Hörprobe** (130 BPM, g-Moll-Orgelpunkt, Drill mit Lücken und Halbton-Nebennote, Takt 4 halber Wechsel nach E♭, Takt 8 Dur-Dominante D mit Leitton F♯):
```
Tempo 130 BPM · 8 Takte · Akkorde: Gm | Gm | Gm | Gm Eb | Gm | Gm | Cm | D
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: G1(31) 0/1/112 · G1(31) 1/1/80 · G2(43) 2/1/96 · G1(31) 3/1/80 · G1(31) 4/1/112 · G1(31) 5/1/80 · G2(43) 6/1/96 · G1(31) 7/1/80 · G1(31) 8/1/112 · G1(31) 9/1/80 · G2(43) 10/1/96 · G1(31) 11/1/80 · G1(31) 12/1/112 · G2(43) 14/1/96 · G1(31) 15/1/80
T2: G1(31) 16/1/112 · G1(31) 17/1/80 · G2(43) 18/1/96 · G1(31) 19/1/80 · G1(31) 20/1/112 · G1(31) 21/1/80 · G2(43) 22/1/96 · G1(31) 23/1/80 · G1(31) 24/1/112 · Ab1(32) 25/1/80 · G1(31) 26/1/80 · G2(43) 27/1/96 · G1(31) 28/1/112 · G2(43) 29/1/96 · F2(41) 30/1/80 · D2(38) 31/1/80
T3: G1(31) 32/1/112 · G1(31) 33/1/80 · G2(43) 34/1/96 · G1(31) 35/1/80 · G1(31) 37/1/80 · G2(43) 38/1/96 · G1(31) 39/1/80 · G1(31) 40/1/112 · G1(31) 41/1/80 · G2(43) 42/1/96 · G1(31) 43/1/80 · G1(31) 44/1/112 · G1(31) 45/1/80 · G2(43) 46/1/96 · Bb1(34) 47/1/80
T4: G1(31) 48/1/112 · G1(31) 49/1/80 · G2(43) 50/1/96 · G1(31) 51/1/80 · G1(31) 52/1/112 · G1(31) 53/1/80 · G2(43) 54/1/96 · G1(31) 55/1/80 · Eb2(39) 56/1/112 · Eb2(39) 57/1/80 · Bb1(34) 58/1/80 · Eb2(39) 59/1/80 · Eb2(39) 60/1/112 · Bb1(34) 61/1/80 · Eb3(51) 62/1/96 · Eb2(39) 63/1/80
T5: G1(31) 64/1/112 · G2(43) 66/1/96 · G1(31) 67/1/80 · G1(31) 68/1/112 · G1(31) 69/1/80 · G2(43) 70/1/96 · G1(31) 71/1/80 · G1(31) 72/1/112 · G2(43) 74/1/96 · G1(31) 75/1/80 · G1(31) 76/1/112 · G1(31) 77/1/80 · G2(43) 78/1/96 · G1(31) 79/1/80
T6: G1(31) 80/1/112 · G1(31) 81/1/80 · G2(43) 82/1/96 · G1(31) 83/1/80 · G1(31) 84/1/112 · G1(31) 85/1/80 · G2(43) 86/1/96 · Ab1(32) 87/1/80 · G1(31) 88/1/112 · G1(31) 89/1/80 · G2(43) 90/1/96 · G1(31) 91/1/80 · G2(43) 92/1/112 · G1(31) 93/1/80 · F2(41) 94/1/80 · G2(43) 95/1/96
T7: C2(36) 96/1/112 · C2(36) 97/1/80 · C3(48) 98/1/96 · C2(36) 99/1/80 · C2(36) 100/1/112 · C2(36) 101/1/80 · C3(48) 102/1/96 · C2(36) 103/1/80 · C2(36) 104/1/112 · C2(36) 105/1/80 · C3(48) 106/1/96 · C2(36) 107/1/80 · C2(36) 108/1/112 · C3(48) 109/1/96 · Bb2(46) 110/1/80 · G2(43) 111/1/80
T8: D2(38) 112/1/112 · D2(38) 113/1/80 · D3(50) 114/1/96 · D2(38) 115/1/80 · D2(38) 116/1/112 · D2(38) 117/1/80 · D3(50) 118/1/96 · D2(38) 119/1/80 · D3(50) 120/1/112 · D2(38) 121/1/80 · C3(48) 122/1/80 · D2(38) 123/1/80 · A2(45) 124/1/112 · D2(38) 125/1/80 · D3(50) 126/1/96 · F#2(42) 127/1/80
```
Dauer: alle 8 Takte 14,8 s · kurz (≤ 8 s) T1, T2, T3, T8 = 7,4 s · ganz (≤ 16 s) T1, T2, T3, T4, T5, T6, T7, T8 = 14,8 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.25,31,0.88],[0.25,0.25,31,0.63],[0.5,0.25,43,0.76],[0.75,0.25,31,0.63],[1,0.25,31,0.88],[1.25,0.25,31,0.63],[1.5,0.25,43,0.76],[1.75,0.25,31,0.63],[2,0.25,31,0.88],[2.25,0.25,31,0.63],[2.5,0.25,43,0.76],[2.75,0.25,31,0.63],[3,0.25,31,0.88],[3.5,0.25,43,0.76],[3.75,0.25,31,0.63],[4,0.25,31,0.88],[4.25,0.25,31,0.63],[4.5,0.25,43,0.76],[4.75,0.25,31,0.63],[5,0.25,31,0.88],[5.25,0.25,31,0.63],[5.5,0.25,43,0.76],[5.75,0.25,31,0.63],[6,0.25,31,0.88],[6.25,0.25,32,0.63],[6.5,0.25,31,0.63],[6.75,0.25,43,0.76],[7,0.25,31,0.88],[7.25,0.25,43,0.76],[7.5,0.25,41,0.63],[7.75,0.25,38,0.63],[8,0.25,31,0.88],[8.25,0.25,31,0.63],[8.5,0.25,43,0.76],[8.75,0.25,31,0.63],[9.25,0.25,31,0.63],[9.5,0.25,43,0.76],[9.75,0.25,31,0.63],[10,0.25,31,0.88],[10.25,0.25,31,0.63],[10.5,0.25,43,0.76],[10.75,0.25,31,0.63],[11,0.25,31,0.88],[11.25,0.25,31,0.63],[11.5,0.25,43,0.76],[11.75,0.25,34,0.63],[12,0.25,38,0.88],[12.25,0.25,38,0.63],[12.5,0.25,50,0.76],[12.75,0.25,38,0.63],[13,0.25,38,0.88],[13.25,0.25,38,0.63],[13.5,0.25,50,0.76],[13.75,0.25,38,0.63],[14,0.25,50,0.88],[14.25,0.25,38,0.63],[14.5,0.25,48,0.63],[14.75,0.25,38,0.63],[15,0.25,45,0.88],[15.25,0.25,38,0.63],[15.5,0.25,50,0.76],[15.75,0.25,42,0.63]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 8`): `[[0,0.25,31,0.88],[0.25,0.25,31,0.63],[0.5,0.25,43,0.76],[0.75,0.25,31,0.63],[1,0.25,31,0.88],[1.25,0.25,31,0.63],[1.5,0.25,43,0.76],[1.75,0.25,31,0.63],[2,0.25,31,0.88],[2.25,0.25,31,0.63],[2.5,0.25,43,0.76],[2.75,0.25,31,0.63],[3,0.25,31,0.88],[3.5,0.25,43,0.76],[3.75,0.25,31,0.63],[4,0.25,31,0.88],[4.25,0.25,31,0.63],[4.5,0.25,43,0.76],[4.75,0.25,31,0.63],[5,0.25,31,0.88],[5.25,0.25,31,0.63],[5.5,0.25,43,0.76],[5.75,0.25,31,0.63],[6,0.25,31,0.88],[6.25,0.25,32,0.63],[6.5,0.25,31,0.63],[6.75,0.25,43,0.76],[7,0.25,31,0.88],[7.25,0.25,43,0.76],[7.5,0.25,41,0.63],[7.75,0.25,38,0.63],[8,0.25,31,0.88],[8.25,0.25,31,0.63],[8.5,0.25,43,0.76],[8.75,0.25,31,0.63],[9.25,0.25,31,0.63],[9.5,0.25,43,0.76],[9.75,0.25,31,0.63],[10,0.25,31,0.88],[10.25,0.25,31,0.63],[10.5,0.25,43,0.76],[10.75,0.25,31,0.63],[11,0.25,31,0.88],[11.25,0.25,31,0.63],[11.5,0.25,43,0.76],[11.75,0.25,34,0.63],[12,0.25,31,0.88],[12.25,0.25,31,0.63],[12.5,0.25,43,0.76],[12.75,0.25,31,0.63],[13,0.25,31,0.88],[13.25,0.25,31,0.63],[13.5,0.25,43,0.76],[13.75,0.25,31,0.63],[14,0.25,39,0.88],[14.25,0.25,39,0.63],[14.5,0.25,34,0.63],[14.75,0.25,39,0.63],[15,0.25,39,0.88],[15.25,0.25,34,0.63],[15.5,0.25,51,0.76],[15.75,0.25,39,0.63],[16,0.25,31,0.88],[16.5,0.25,43,0.76],[16.75,0.25,31,0.63],[17,0.25,31,0.88],[17.25,0.25,31,0.63],[17.5,0.25,43,0.76],[17.75,0.25,31,0.63],[18,0.25,31,0.88],[18.5,0.25,43,0.76],[18.75,0.25,31,0.63],[19,0.25,31,0.88],[19.25,0.25,31,0.63],[19.5,0.25,43,0.76],[19.75,0.25,31,0.63],[20,0.25,31,0.88],[20.25,0.25,31,0.63],[20.5,0.25,43,0.76],[20.75,0.25,31,0.63],[21,0.25,31,0.88],[21.25,0.25,31,0.63],[21.5,0.25,43,0.76],[21.75,0.25,32,0.63],[22,0.25,31,0.88],[22.25,0.25,31,0.63],[22.5,0.25,43,0.76],[22.75,0.25,31,0.63],[23,0.25,43,0.88],[23.25,0.25,31,0.63],[23.5,0.25,41,0.63],[23.75,0.25,43,0.76],[24,0.25,36,0.88],[24.25,0.25,36,0.63],[24.5,0.25,48,0.76],[24.75,0.25,36,0.63],[25,0.25,36,0.88],[25.25,0.25,36,0.63],[25.5,0.25,48,0.76],[25.75,0.25,36,0.63],[26,0.25,36,0.88],[26.25,0.25,36,0.63],[26.5,0.25,48,0.76],[26.75,0.25,36,0.63],[27,0.25,36,0.88],[27.25,0.25,48,0.76],[27.5,0.25,46,0.63],[27.75,0.25,43,0.63],[28,0.25,38,0.88],[28.25,0.25,38,0.63],[28.5,0.25,50,0.76],[28.75,0.25,38,0.63],[29,0.25,38,0.88],[29.25,0.25,38,0.63],[29.5,0.25,50,0.76],[29.75,0.25,38,0.63],[30,0.25,50,0.88],[30.25,0.25,38,0.63],[30.5,0.25,48,0.63],[30.75,0.25,38,0.63],[31,0.25,45,0.88],[31.25,0.25,38,0.63],[31.5,0.25,50,0.76],[31.75,0.25,42,0.63]]`
- **Abstand:** Grundton-Oktav-16tel mit Nebennoten; Gemeingut.
- **Karte:** „Einstimmiger Drill-Bass mit Sub und bellenden Akzenten – erinnert an britische EBM 1987 (Stil Nitzer Ebb).“

### 2.4 Skinny Puppy (`vorbild: skinny-puppy`, Ergänzung zu `vorbild-dark.md` §5.7)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| cEvin Key: erstes Keyboard **Moog Multimoog** (um 1982, besitzt ihn noch), zweites **Sequential Circuits Pro-One**, „heavily used“ auf Skinny-Puppy-Platten | **BELEGT** (Primärquelle: Interview Key, Side-Line; SE) | https://side-line.com/?p=6085 |
| Früheste Arbeit mit **Atari 1040 ST** und Steinberg **Pro 24**; heute vor allem Logic | **BELEGT** (Key-Aussage im Auszug; Fundstelle Side-Line oder Synthtopia) | https://side-line.com/?p=6085 · https://synthtopia.com/content/2015/06/27/cevin-key-interview-on-skinny-puppy-eurorack-modulars-more |
| Rack-Foto Subconscious Studios mit **E-mu SP-1200** und Korg SDD-2000; **TR-606** auf einem Tourfoto 1988 | WAHRSCHEINLICH (Fotos, Blog/Händler-Magazin) | https://www.matrixsynth.com/2012/02/brap.html · https://reverb.com/news/the-mean-synths-and-fast-drums-of-industrial-pioneers-skinny-puppy |
| Dwayne Goettel (ab 1986) prägte Sampling und Synth-Arbeit | WAHRSCHEINLICH (reverb.com) | wie oben |

**Folge:** DK-20 ff. in `vorbild-dark.md` beschreiben das Hörbild. Neu und belegt: **Pro-One**. Typisch für den Pro-One (eK, UNBELEGT): 2 Oszillatoren, Sync, „Poly-Mod“ (Filter-Hüllkurve und Oszillator B modulieren Oszillator A). EB-05 nähert das an.

#### EB-05 „Pro-Schnarrbass“ – Rolle Bass · VA (neu)

- **Vorbild (ⓘ):** knurrender Zwei-Oszillator-Mono-Bass mit Hüllkurve auf der Tonhöhe (Gerät BELEGT, Patch UNBELEGT).
- **Rezept:** `o1w 0, o2w 1, o2pw .3, o2oct -1, o2lvl .7, ftype 0, cutoff 380, res .6, drive .3, kt .3, fenv .45, fA .001, fD .25, fS .15, fR .1, aA .001, aD .4, aS .7, aR .08, mode 2, poly 1, glide .06, analog .3, l1shape 4, l1rate 14` · Routen `M('fenv', 'pitch', .05)` (kurzer Zwitscher-Anlauf ≈ +1,2 HT) und `M('lfo1', 'cutoff', .06)` (S&H-Knurren ±7 HT) · fx `{drive .45, dly .15, rev .15}` · bus `{echo:{mode:'mono', divL:'1/8', fb .3}}`.
- **Warum so:** Filter-Hk → Tonhöhe ersetzt den Poly-Mod-Weg, schnelles S&H aufs Filter macht das „Schnarren“. Legato + Glide für die Rutscher.
- **Lücke:** echter Poly-Mod (Oszillator B → Frequenz A) erst mit VK `ofm`.
- **Lage / Rolle:** F1–B♭2 (29–46). LAGE-Klammer **hoch C3**. Akkord-Reaktion: **nächstliegend, nie über C3**.
- **Hörprobe** (112 BPM, b-Moll, gehaltene Grundtöne mit Halbton-Pendel, Takt 4 Aufgang zur Tonika):
```
Tempo 112 BPM · 4 Takte · Akkorde: Bbm | Bbm | Gb | F
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: Bb1(34) 0/3/110 · Bb1(34) 4/1/86 · B1(35) 5/1/86 · Bb1(34) 6/1/86 · Bb2(46) 8/2/110 · Bb1(34) 10/1/86 · B1(35) 12/1/86 · Bb1(34) 13/2/86
T2: Bb1(34) 16/3/110 · Bb1(34) 20/1/86 · B1(35) 21/1/86 · Bb1(34) 22/1/86 · Bb2(46) 24/2/110 · Ab2(44) 26/1/86 · F2(41) 28/2/86 · B1(35) 30/1/86 · Bb1(34) 31/1/86
T3: F#1(30) 32/3/110 · F#1(30) 36/1/86 · Ab1(32) 37/1/86 · F#1(30) 38/1/86 · F#2(42) 40/2/110 · F#1(30) 42/1/86 · C#2(37) 44/2/86 · F#1(30) 46/1/86
T4: F1(29) 48/2/110 · F1(29) 51/1/86 · F#1(30) 52/1/86 · F1(29) 53/2/86 · F2(41) 56/1/110 · F1(29) 57/1/86 · F#1(30) 58/1/86 · F1(29) 59/2/86 · A1(33) 61/1/86 · Bb1(34) 62/1/86 · C2(36) 63/1/86
```
Dauer: alle 4 Takte 8,6 s · kurz (≤ 8 s) T1, T2, T4 = 6,4 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,6 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.75,34,0.87],[1,0.25,34,0.68],[1.25,0.25,35,0.68],[1.5,0.25,34,0.68],[2,0.5,46,0.87],[2.5,0.25,34,0.68],[3,0.25,35,0.68],[3.25,0.5,34,0.68],[4,0.75,34,0.87],[5,0.25,34,0.68],[5.25,0.25,35,0.68],[5.5,0.25,34,0.68],[6,0.5,46,0.87],[6.5,0.25,44,0.68],[7,0.5,41,0.68],[7.5,0.25,35,0.68],[7.75,0.25,34,0.68],[8,0.5,29,0.87],[8.75,0.25,29,0.68],[9,0.25,30,0.68],[9.25,0.5,29,0.68],[10,0.25,41,0.87],[10.25,0.25,29,0.68],[10.5,0.25,30,0.68],[10.75,0.5,29,0.68],[11.25,0.25,33,0.68],[11.5,0.25,34,0.68],[11.75,0.25,36,0.68]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,0.75,34,0.87],[1,0.25,34,0.68],[1.25,0.25,35,0.68],[1.5,0.25,34,0.68],[2,0.5,46,0.87],[2.5,0.25,34,0.68],[3,0.25,35,0.68],[3.25,0.5,34,0.68],[4,0.75,34,0.87],[5,0.25,34,0.68],[5.25,0.25,35,0.68],[5.5,0.25,34,0.68],[6,0.5,46,0.87],[6.5,0.25,44,0.68],[7,0.5,41,0.68],[7.5,0.25,35,0.68],[7.75,0.25,34,0.68],[8,0.75,30,0.87],[9,0.25,30,0.68],[9.25,0.25,32,0.68],[9.5,0.25,30,0.68],[10,0.5,42,0.87],[10.5,0.25,30,0.68],[11,0.5,37,0.68],[11.5,0.25,30,0.68],[12,0.5,29,0.87],[12.75,0.25,29,0.68],[13,0.25,30,0.68],[13.25,0.5,29,0.68],[14,0.25,41,0.87],[14.25,0.25,29,0.68],[14.5,0.25,30,0.68],[14.75,0.5,29,0.68],[15.25,0.25,33,0.68],[15.5,0.25,34,0.68],[15.75,0.25,36,0.68]]`
- **Abstand:** Grundton, kleine Sekunde, Oktave – phrygisches Allerweltsmuster.
- **Karte:** „Knurrender Analog-Bass mit Rutschern und Halbton-Drohung – erinnert an kanadischen Electro-Industrial der 80er (Stil Skinny Puppy).“

### 2.5 Suicide Commando (`vorbild: suicide-commando`, Ergänzung zu `vorbild-dark.md` §5.9)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Johan Van Roy: erstes Gerät **Roland SH-101** mit **Boss DR-55**; weitere Drumcomputer und Synths kamen nach und nach | **WAHRSCHEINLICH** (SE, eine Quelle, nicht reproduziert: zwei gezielte Nachsuchen ohne Treffer, Seite per WebFetch nicht erreichbar) – nicht im ⓘ, bis die Seite gelesen ist | https://elgarajedefrank.es/en/interview-suicide-commando |
| Computer erst ab **1995** (Album „Stored Images“), **Atari 1040ST** | **WAHRSCHEINLICH** (dasselbe Interview, nicht reproduziert) | wie oben |
| Später: Access Virus Indigo, Boss DS-1, Yamaha A3000 (Horror-/Sci-Fi-Samples) | WAHRSCHEINLICH-schwach (nur Equipboard) – **nicht** in ⓘ | https://equipboard.com/band/suicide-commando |
| Mehr Budget → symphonischer Klang auf „When Evil Speaks“ (2013), „Forest of the Impaled“ (2017) | WAHRSCHEINLICH (Rezensions-Auszug) | https://side-line.com/30-years-of-journalism-celebration-interview-with-johan-van-roy-suicide-commando-i-probably-will-continue-writing-music-till-i-drop-dead |

**Folge:** Die Aggrotech-Sounds DK-28 ff. passen zur späten Phase. Für die **frühe** Phase neu: EB-06 (einfache Analog-Box). Der SH-101-Bass ist mit EB-04 abgedeckt (gleicher Gerätetyp).

#### EB-06 „Erstlings-Kasten“ – Rolle Drums · Drum-Synth (neu)

- **Vorbild (ⓘ):** kleine, billige Analog-Rhythmusbox der frühen Dark-Electro-Demos (Stil; Gerät und Klangwerte im ⓘ ohne Modellnamen, bis die Interview-Seite gelesen ist). Arbeitsnotiz, nicht im ⓘ: DR-55 WAHRSCHEINLICH (eine Quelle); „4 Klänge: Bassdrum, Snare, Rimshot, Hi-Hat“ ist eK, UNBELEGT.
- **Kit-Rezept (Abweichungen):** KICK `{frq 58, pAmt 8, pDec .02, tDec .18, cLvl 0}` · SNARE `{tLvl .4, frq 230, tDec .05, nLvl .7, nTyp 'highpass', nFrq 1500, nDec .09}` · RIM `{frq 480, tDec .015, lvl .5}` · HH ZU `{mLvl 0, nLvl .8, nTyp 'highpass', nFrq 8000, nDec .02}` · Kit-Bus `{room 0}` · Spur-Drive .15.
- **Warum so:** Nur vier Pads, alles kurz und dünn – der „Schlafzimmer-Anfang“ des Dark Electro.
- **Lage / Rolle:** Drums, keine Klammer.
- **Hörprobe** (128 BPM, gerade Kick, Rim auf wechselnden Offbeats, Takt 4 Hat-16tel und Kick-Fill):
```
Tempo 128 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK  | x...x...x...x... | x...x...x...x.x. | x...x...x...x... | x...x...x.x.x.xx
SNARE | ....x.......x... | ....x.......x... | ....x.......x..x | ....x...x...x.xx
RIM   | ..x.......x..... | ......x.......x. | ..x.......x..... | ..x...x...x.....
HH ZU | ..x...x...x...x. | ..x...x...x...x. | ..x...x...x...x. | x.x.x.x.x.x.x.x.
```
Dauer: alle 4 Takte 7,5 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,5 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,5 s
- **Karte:** „Dünne kleine Analog-Box mit Rimshot – erinnert an die Anfänge des belgischen Dark Electro (Stil Suicide Commando).“

### 2.6 Hocico (`vorbild: hocico`) – geprüft, nichts Neues

Eine Suche („Hocico Racso Agroyam Erk Aicrag studio synthesizers“) gab **keinen** Treffer zur Band (nur fremde Studios). Alles in `vorbild-dark.md` §5.11 bleibt UNBELEGT. Kein neuer Sound.

### 2.7 Covenant (`vorbild: covenant`) – Beleg-Nachtrag, kein neuer Sound

| Fakt | Status | Quelle |
|---|---|---|
| Waldorf Q, Clavia Nord Modular G2X | WAHRSCHEINLICH-schwach (nur Equipboard, ohne Bandzitat) – **nicht** in ⓘ | https://equipboard.com/band/covenant |
| Studio-Kern heute Eskil Simonsson + Joakim Montelius (Wikipedia widerspricht sich: Infobox „ehemalig“) | WAHRSCHEINLICH, widersprüchlich | https://en.wikipedia.org/wiki/Covenant_(band) |
| ⚠ Der Studiofilm „Modular Behaviour: Inside Joakim's vintage analogue studio“ (The Vinyl Factory, Studio „Crowdspacer“) | **gehört nicht zu Covenant.** Die Suche warf ihn aus; der Auszug beschreibt einen Produzenten „Joakim“ (J Dilla, Star Wars, Venedig-Installation). Nach eK (UNBELEGT) ist das der französische Produzent Joakim, nicht Montelius. **Nicht verwenden.** | https://archive.thevinylfactory.com/?p=108285 |

**Folge:** SZ-25 bis SZ-28 bleiben Stil-Sounds. Wenn Covenant je Gerät im ⓘ bekommt, nur nach einem Band-Interview.

### 2.8 VNV Nation (`vorbild: vnv-nation`) – Beleg-Nachtrag, kein neuer Sound

| Fakt | Status | Quelle |
|---|---|---|
| „Empires“ (2000): komponiert mit **nur einem Synthesizer (Access Virus)** und **zwei Samplern** | WAHRSCHEINLICH (eine Quelle; vermutlich Wikipedia-Spiegel) | https://reference.org/facts/VNV_Nation/VCe7evg5 · https://en.wikipedia.org/wiki/VNV_Nation |
| „Futureperfect“ (2002): digital **Roland JP-8000**, **Access Virus** (fast nur auf „Darkangel“), Korg Trinity, E-mu Proteus 2000, Roland JV-1080; analog **ARP 2600** (die meisten Klänge auf „Firstlight“, „Arclight“, „Standing“), Pro-One, Oberheim OB-1 | WAHRSCHEINLICH (Wikipedia, eine Quelle) | https://en.wikipedia.org/wiki/VNV_Nation |
| Heute u. a. Roland System-700, Moog Subsequent 37, Behringer Kobol Expander (laut Studio-Liste der Band-Website, über Equipboard) | WAHRSCHEINLICH-schwach (zweite Hand) | https://equipboard.com/pros/ronan-harris |

**Folge:** Der Werks-Sound „Supersaw-Hymne“ (V0a Z. 5712, Herkunft „Roland JP-8000 Supersaw“) und SZ-29 „Leuchtfeuer-Lead“ haben jetzt einen **wahrscheinlichen** Gerätebezug zu VNV („Futureperfect“). Im ⓘ von SZ-29 erlaubt: „Supersaw-Klang wie bei JP-8000-Synths (Stil VNV Nation)“, ohne zu behaupten, welcher Titel damit gemacht ist.

### 2.9 Mesh (`vorbild: mesh`) – Beleg-Nachtrag, kein neuer Sound

| Fakt | Status | Quelle |
|---|---|---|
| Richard Silverthorn: erster Synth **Pro-One**, danach Roland-Geräte; heute **Korg MS2000** und **Korg Trinity (Rack)**, „viel für Klaviere und andere Klänge“; nie einen Poly-6 besessen | **BELEGT** (Primärquelle, Interview „Vintage Synth Trumps“, SE) | https://www.electricityclub.co.uk/category/vintage-synth-trumps/page/3/ |
| Nimmt mit Rekordern und Mikrofonen Klänge für Samples und Loops auf | WAHRSCHEINLICH (Interview-Auszug, zweite Hand) | https://www.reflectionsofdarkness.com/artists-k-o/16758-interview-mesh-august-2016 |
| Behringer Pro-1, Korg MS-20 mini, NI Maschine | WAHRSCHEINLICH-schwach (Equipboard) | https://equipboard.com/band/mesh |

**Folge:** SZ-33 „Regenstadt-Pluck“ und SZ-35 „Breitwand-Streicher“ bleiben. Ein Mesh-Klavier (Trinity-Rack) wäre ein Kandidat für später (FM6- oder WT-Piano wie EB-21); hier nicht gebaut, um Dopplungen zu vermeiden.

---

## 3. Neue Acts

### 3.1 Die Krupps (`vorbild: die-krupps`, neu)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| „Stahlwerksynfonie“ (1981): fast 30-minütiger Monolith aus Metall- und Gitarrenklängen, Saxofon, Rufe | WAHRSCHEINLICH (Label-Text Bureau B) | https://bureau-b.com/Krupps.php |
| Metall-Perkussion mit Bohrern, Vorschlaghämmern und Stahlwerkzeugen; Jürgen Engler spielt das selbstgebaute **„Steel-o-phone“** (Stahlophon) | WAHRSCHEINLICH (Auszüge infestuk + nts.live; Text abgeschnitten) | https://infestuk.com/2017/03/10/infest-2017-die-krupps-confirmed/ · https://www.nts.live/artists/4934-die-krupps |
| „Volle Kraft voraus!“ (1982): mehr synthesizerbasiert, Metall-Perkussion bleibt | WAHRSCHEINLICH (Wikipedia) | https://en.wikipedia.org/wiki/Die_Krupps |
| Ralf Dörper: Keyboards, Synthesizer, Programmierung (1980–82 u. a.) | WAHRSCHEINLICH (Wikipedia) | wie oben |
| Dörper live 2015–2017 am **Korg MS-20** | WAHRSCHEINLICH (Konzert-Ankündigung) – **nicht** Beleg für 1982 | https://infestuk.com/2017/03/10/infest-2017-die-krupps-confirmed/ |
| 1989 mit Nitzer Ebb Neufassung von „Wahre Arbeit, wahrer Lohn“ als „The Machineries of Joy“ | WAHRSCHEINLICH (Wikipedia) | https://en.wikipedia.org/wiki/Die_Krupps |

**Stil-Merkmale (eK, UNBELEGT):** marschierende Sequenzer-Bässe, geschlagenes Metall als Melodie-Instrument, 120–130 BPM, Moll, Rufe statt Gesang.

#### EB-07 „Stahlophon“ – Rolle Perkussion/Sequenz · FM6 (neu)

- **Vorbild (ⓘ):** gestimmtes, geschlagenes Stahl-Instrument (Steel-o-phone WAHRSCHEINLICH; Klang des Originals UNBELEGT).
- **Rezept (FM6):** `alg 5, fb 0` · OP1 `(1, 99, [99,55,30,50], [99,0,0,0], {vs 4})` · OP2 `(3, 85, [99,70,40,50], [99,0,0,0], {fine 41, vs 5})` (Verhältnis ≈ 3,41, unharmonisch) · OP3 `(2, 88, [99,60,30,50], [99,0,0,0], {det 5})` · OP4 `(5, 74, [99,80,45,50], [99,0,0,0], {fine 23, vs 6})` · OP5/OP6 aus · common `{gain −12, poly 4}` · fx `{drive .2, rev .35, dly .1}`.
- **Warum so:** Nicht-ganzzahlige Modulator-Verhältnisse geben die „schiefen“ Obertöne einer Stahlplatte; alle Hüllkurven ohne Sustain = Schlag.
- **Lage / Rolle:** F♯4–B5 (66–83). LAGE-Klammer **E4–C6**. Akkord-Reaktion: **nächstliegend, Gleichstand aufwärts**.
- **Hörprobe** (125 BPM, e-Moll, 3er-Gruppen gegen den 4/4-Takt, Takt 4 Dur-Dominante aufwärts):
```
Tempo 125 BPM · 4 Takte · Akkorde: Em | Em | C | B
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E5(76) 0/1/108 · B4(71) 3/1/108 · E5(76) 6/1/108 · G5(79) 8/1/92 · E5(76) 11/1/92 · B4(71) 13/1/92
T2: E5(76) 16/1/108 · B4(71) 19/1/108 · E5(76) 22/1/108 · A5(81) 24/1/92 · G5(79) 26/1/92 · E5(76) 28/1/108 · D5(74) 30/1/92
T3: C5(72) 32/1/108 · G4(67) 35/1/108 · C5(72) 38/1/108 · E5(76) 40/1/92 · G5(79) 43/1/92 · E5(76) 45/1/92
T4: B4(71) 48/1/110 · F#4(66) 51/1/110 · B4(71) 54/1/110 · Eb5(75) 56/1/94 · F#5(78) 58/1/94 · B5(83) 60/1/110
```
Dauer: alle 4 Takte 7,7 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,7 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,7 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.25,76,0.85],[0.75,0.25,71,0.85],[1.5,0.25,76,0.85],[2,0.25,79,0.72],[2.75,0.25,76,0.72],[3.25,0.25,71,0.72],[4,0.25,76,0.85],[4.75,0.25,71,0.85],[5.5,0.25,76,0.85],[6,0.25,81,0.72],[6.5,0.25,79,0.72],[7,0.25,76,0.85],[7.5,0.25,74,0.72],[8,0.25,72,0.85],[8.75,0.25,67,0.85],[9.5,0.25,72,0.85],[10,0.25,76,0.72],[10.75,0.25,79,0.72],[11.25,0.25,76,0.72],[12,0.25,71,0.87],[12.75,0.25,66,0.87],[13.5,0.25,71,0.87],[14,0.25,75,0.74],[14.5,0.25,78,0.74],[15,0.25,83,0.87]]`
- **Abstand:** Grundton, Quinte, Terz in 3er-Rhythmus; kein Titel.
- **Karte:** „Geschlagener, schief klingender Stahl als Melodie – erinnert an frühe Düsseldorfer Metall-Elektronik (Stil Die Krupps).“

#### EB-08 „Volle-Kraft-Bass“ – Rolle Bass · VA (neu)

- **Vorbild (ⓘ):** harter Mono-Sequenzerbass der frühen 80er (MS-20 nur live 2015 WAHRSCHEINLICH; für 1982 UNBELEGT).
- **Rezept:** `o1w 0, o2w 1, o2pw .25, o2lvl .5, o2fine -6, ftype 0, cutoff 600, res .65, drive .3, kt .4, fenv .4, fvel .4, fA .001, fD .12, fS .15, fR .05, aA .001, aD .2, aS .65, aR .04, mode 1, poly 1, reset 1, analog .3` · fx `{drive .4}`.
- **Lücke:** wie EB-01 (Hochpass vor Tiefpass fehlt).
- **Lage / Rolle:** E1–C3 (28–48). LAGE-Klammer **hoch C3**. Akkord-Reaktion: **nächstliegend, nie über C3**.
- **Hörprobe** (125 BPM, Doppelschläge mit Lücke – „Stampf-Stampf-Pause“, Takt 4 Dur-Dominante mit Lauf):
```
Tempo 125 BPM · 4 Takte · Akkorde: Em | Em | C | B
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E1(28) 0/1/112 · E1(28) 1/1/80 · E1(28) 3/1/80 · E1(28) 4/1/112 · E1(28) 6/1/80 · E2(40) 7/1/96 · E1(28) 8/1/112 · E1(28) 9/1/80 · E1(28) 11/1/80 · E1(28) 12/1/112 · E2(40) 14/1/96 · E1(28) 15/1/80
T2: E1(28) 16/1/112 · E1(28) 17/1/80 · E1(28) 19/1/80 · E1(28) 20/1/112 · E1(28) 22/1/80 · E2(40) 23/1/96 · E1(28) 24/1/112 · E1(28) 25/1/80 · E1(28) 27/1/80 · G1(31) 28/1/112 · B1(35) 30/1/80 · E1(28) 31/1/80
T3: C2(36) 32/1/112 · C2(36) 33/1/80 · C2(36) 35/1/80 · C2(36) 36/1/112 · C2(36) 38/1/80 · C3(48) 39/1/96 · C2(36) 40/1/112 · C2(36) 41/1/80 · C2(36) 43/1/80 · C2(36) 44/1/112 · C3(48) 46/1/96
T4: B1(35) 48/1/112 · B1(35) 49/1/80 · B1(35) 51/1/80 · B1(35) 52/1/112 · B1(35) 54/1/80 · B2(47) 55/1/96 · B1(35) 56/1/112 · E2(40) 58/1/80 · F#2(42) 60/1/112 · B2(47) 62/1/96 · A2(45) 63/1/80
```
Dauer: alle 4 Takte 7,7 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,7 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,7 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.25,28,0.88],[0.25,0.25,28,0.63],[0.75,0.25,28,0.63],[1,0.25,28,0.88],[1.5,0.25,28,0.63],[1.75,0.25,40,0.76],[2,0.25,28,0.88],[2.25,0.25,28,0.63],[2.75,0.25,28,0.63],[3,0.25,28,0.88],[3.5,0.25,40,0.76],[3.75,0.25,28,0.63],[4,0.25,28,0.88],[4.25,0.25,28,0.63],[4.75,0.25,28,0.63],[5,0.25,28,0.88],[5.5,0.25,28,0.63],[5.75,0.25,40,0.76],[6,0.25,28,0.88],[6.25,0.25,28,0.63],[6.75,0.25,28,0.63],[7,0.25,31,0.88],[7.5,0.25,35,0.63],[7.75,0.25,28,0.63],[8,0.25,36,0.88],[8.25,0.25,36,0.63],[8.75,0.25,36,0.63],[9,0.25,36,0.88],[9.5,0.25,36,0.63],[9.75,0.25,48,0.76],[10,0.25,36,0.88],[10.25,0.25,36,0.63],[10.75,0.25,36,0.63],[11,0.25,36,0.88],[11.5,0.25,48,0.76],[12,0.25,35,0.88],[12.25,0.25,35,0.63],[12.75,0.25,35,0.63],[13,0.25,35,0.88],[13.5,0.25,35,0.63],[13.75,0.25,47,0.76],[14,0.25,35,0.88],[14.5,0.25,40,0.63],[15,0.25,42,0.88],[15.5,0.25,47,0.76],[15.75,0.25,45,0.63]]`
- **Karte:** „Stampfender Sequenzer-Bass mit Pausen-Ruck – erinnert an Düsseldorfer Industrial-EBM um 1982 (Stil Die Krupps).“

### 3.2 Front Line Assembly (`vorbild: front-line-assembly`, neu)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Kanadische Electro-Industrial-Band aus Vancouver, 1986 von Bill Leeb nach seinem Ausstieg bei Skinny Puppy gegründet | **BELEGT** (Wikipedia + NTS/Google-KG im Auszug) | https://en.wikipedia.org/wiki/Front_Line_Assembly · https://nts.live/artists/33718-front-line-assembly |
| „Tactical Neural Implant“ (1992), Singles „Mindphaser“ und „The Blade“; Richtung „hard-edged disco“, weniger rau als „Caustic Grip“ | WAHRSCHEINLICH (Wikipedia) | https://en.wikipedia.org/wiki/Tactical_Neural_Implant |
| „Millennium“ (1994): erster großer Einsatz von Metal-Gitarren, Riffs aus Samples und von Devin Townsend | WAHRSCHEINLICH (Wikipedia) | https://en.wikipedia.org/wiki/Millennium_(Front_Line_Assembly_album) |
| Rhys Fulber: „Sampling ist für mich nur eine andere Form der Synthese“ | **BELEGT** (Primärquelle, Interview, SE) | https://www.electricityclub.co.uk/rhys-fulber-interview/ |
| Kawai K4 bei Fulber | WAHRSCHEINLICH-schwach (nur Equipboard) | https://equipboard.com/band/front-line-assembly |
| Studio-Interview Sound On Sound 1995 (Leeb) existiert; Gerätedetails im Auszug nicht sichtbar | – | https://www.soundonsound.com/people/bill-leeb-front-line-assembly |

**Stil-Merkmale (eK, UNBELEGT):** 120–130 BPM, verzerrter 16tel-Bass mit langsam wanderndem Filter, abgehackte Sample-Stabs, viel Echo auf Effekten, Sprach-Samples.

#### EB-09 „Neuralbass“ – Rolle Bass · VA (neu)

- **Vorbild (ⓘ):** verzerrter Electro-Industrial-16tel-Bass mit wanderndem Filter (Stil; Gerät UNBELEGT).
- **Rezept:** `o1w 0, o1uni 3, uniDet .12, uniMix .5, o2w 0, o2oct -1, o2lvl .6, ftype 0, cutoff 450, res .4, drive .3, kt .4, fenv .38, fvel .45, fA .001, fD .09, fS .1, fR .04, aA .001, aD .15, aS .6, aR .04, mode 1, poly 1, reset 1, l2shape 1, l2sync 16` · Route `M('lfo2', 'cutoff', .08)` (±9,6 HT über 4 Takte) · fx `{drive .5, pump .2, pumpRel '1/16'}`.
- **Lage / Rolle:** A1–D3 (33–50). LAGE-Klammer **hoch D3**. Akkord-Reaktion: **nächstliegend, nie über D3**.
- **Hörprobe** (124 BPM, d-Moll, „R – R R O“-Figur, Takt 4 Dur-Dominante A mit C♯):
```
Tempo 124 BPM · 4 Takte · Akkorde: Dm | Dm | Bb | A
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D2(38) 0/1/112 · D2(38) 2/1/80 · D2(38) 3/1/80 · D3(50) 4/1/112 · D2(38) 6/1/80 · D2(38) 7/1/80 · D2(38) 8/1/112 · D2(38) 10/1/80 · D2(38) 11/1/80 · D3(50) 12/1/112 · D2(38) 14/1/80 · D2(38) 15/1/80
T2: D2(38) 16/1/112 · D2(38) 18/1/80 · D2(38) 19/1/80 · D3(50) 20/1/112 · D2(38) 22/1/80 · D2(38) 23/1/80 · D2(38) 24/1/112 · D2(38) 26/1/80 · D2(38) 27/1/80 · D3(50) 28/1/112 · F2(41) 30/1/80 · G2(43) 31/1/80
T3: Bb1(34) 32/1/112 · Bb1(34) 34/1/80 · Bb1(34) 35/1/80 · Bb2(46) 36/1/112 · Bb1(34) 38/1/80 · Bb1(34) 39/1/80 · Bb1(34) 40/1/112 · Bb1(34) 42/1/80 · Bb1(34) 43/1/80 · Bb2(46) 44/1/112 · Bb1(34) 46/1/80 · F2(41) 47/1/80
T4: A1(33) 48/1/112 · A1(33) 50/1/80 · A1(33) 51/1/80 · A2(45) 52/1/112 · A1(33) 54/1/80 · A1(33) 55/1/80 · A1(33) 56/1/112 · E2(40) 58/1/80 · A1(33) 59/1/80 · A2(45) 60/1/112 · C#2(37) 62/1/80 · E2(40) 63/1/80
```
Dauer: alle 4 Takte 7,7 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,7 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,7 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.25,38,0.88],[0.5,0.25,38,0.63],[0.75,0.25,38,0.63],[1,0.25,50,0.88],[1.5,0.25,38,0.63],[1.75,0.25,38,0.63],[2,0.25,38,0.88],[2.5,0.25,38,0.63],[2.75,0.25,38,0.63],[3,0.25,50,0.88],[3.5,0.25,38,0.63],[3.75,0.25,38,0.63],[4,0.25,38,0.88],[4.5,0.25,38,0.63],[4.75,0.25,38,0.63],[5,0.25,50,0.88],[5.5,0.25,38,0.63],[5.75,0.25,38,0.63],[6,0.25,38,0.88],[6.5,0.25,38,0.63],[6.75,0.25,38,0.63],[7,0.25,50,0.88],[7.5,0.25,41,0.63],[7.75,0.25,43,0.63],[8,0.25,34,0.88],[8.5,0.25,34,0.63],[8.75,0.25,34,0.63],[9,0.25,46,0.88],[9.5,0.25,34,0.63],[9.75,0.25,34,0.63],[10,0.25,34,0.88],[10.5,0.25,34,0.63],[10.75,0.25,34,0.63],[11,0.25,46,0.88],[11.5,0.25,34,0.63],[11.75,0.25,41,0.63],[12,0.25,33,0.88],[12.5,0.25,33,0.63],[12.75,0.25,33,0.63],[13,0.25,45,0.88],[13.5,0.25,33,0.63],[13.75,0.25,33,0.63],[14,0.25,33,0.88],[14.5,0.25,40,0.63],[14.75,0.25,33,0.63],[15,0.25,45,0.88],[15.5,0.25,37,0.63],[15.75,0.25,40,0.63]]`
- **Karte:** „Verzerrter 16tel-Bass, der langsam auf- und zugeht – erinnert an kanadischen Electro-Industrial der frühen 90er (Stil Front Line Assembly).“

#### EB-10 „Schneid-Stab“ – Rolle Akkord/Stab · WT (neu)

- **Vorbild (ⓘ):** abgehackter, digital-harter Akkord wie ein geschnittenes Sample (Arbeitsweise „Sampling als Synthese“ BELEGT; Klang UNBELEGT). Keine fremden Samples – Wavetable-Ersatz.
- **Rezept (WT):** `{ftype 0, cutoff 2600, res .2, fenv .35, kt .5, fA .001, fD .15, fS .1, fR .12, aA .001, aD .25, aS 0, aR .1, poly 6, wt: {table 'digital', pos .7, scan -.5, scanTime .15}}` · fx `{drive .25, dly .18, rev .25}`.
- **Warum so:** Der schnelle Wavetable-Scan rückwärts klingt wie ein kurzer Sample-Ausschnitt mit „Schnitt“.
- **Lage / Rolle:** A3–F4 (57–65). LAGE-Klammer **G3–C5**. Akkord-Reaktion: **Block (Sequenz)**.
- **Hörprobe** (124 BPM, gleiche Akkorde wie EB-09, zusammen spielbar):
```
Tempo 124 BPM · 4 Takte · Akkorde: Dm | Dm | Bb | A
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A3(57) 0/2/110 · D4(62) 0/2/110 · F4(65) 0/2/110 · A3(57) 3/2/96 · D4(62) 3/2/96 · F4(65) 3/2/96 · A3(57) 10/1/90 · D4(62) 10/1/90 · F4(65) 10/1/90 · A3(57) 12/1/100 · D4(62) 12/1/100 · F4(65) 12/1/100
T2: A3(57) 16/2/110 · D4(62) 16/2/110 · F4(65) 16/2/110 · A3(57) 19/2/96 · D4(62) 19/2/96 · F4(65) 19/2/96 · A3(57) 22/1/90 · D4(62) 22/1/90 · F4(65) 22/1/90 · A3(57) 24/1/96 · D4(62) 24/1/96 · F4(65) 24/1/96 · A3(57) 27/1/100 · D4(62) 27/1/100 · F4(65) 27/1/100
T3: Bb3(58) 32/2/110 · D4(62) 32/2/110 · F4(65) 32/2/110 · Bb3(58) 35/2/96 · D4(62) 35/2/96 · F4(65) 35/2/96 · Bb3(58) 38/2/92 · D4(62) 38/2/92 · F4(65) 38/2/92 · Bb3(58) 46/1/100 · D4(62) 46/1/100 · F4(65) 46/1/100
T4: A3(57) 48/2/110 · C#4(61) 48/2/110 · E4(64) 48/2/110 · A3(57) 51/2/96 · C#4(61) 51/2/96 · E4(64) 51/2/96 · A3(57) 54/1/90 · C#4(61) 54/1/90 · E4(64) 54/1/90 · A3(57) 56/1/94 · C#4(61) 56/1/94 · E4(64) 56/1/94 · A3(57) 58/1/98 · C#4(61) 58/1/98 · E4(64) 58/1/98 · A3(57) 60/4/112 · C#4(61) 60/4/112 · E4(64) 60/4/112
```
Dauer: alle 4 Takte 7,7 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,7 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,7 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.5,57,0.87],[0,0.5,62,0.87],[0,0.5,65,0.87],[0.75,0.5,57,0.76],[0.75,0.5,62,0.76],[0.75,0.5,65,0.76],[2.5,0.25,57,0.71],[2.5,0.25,62,0.71],[2.5,0.25,65,0.71],[3,0.25,57,0.79],[3,0.25,62,0.79],[3,0.25,65,0.79],[4,0.5,57,0.87],[4,0.5,62,0.87],[4,0.5,65,0.87],[4.75,0.5,57,0.76],[4.75,0.5,62,0.76],[4.75,0.5,65,0.76],[5.5,0.25,57,0.71],[5.5,0.25,62,0.71],[5.5,0.25,65,0.71],[6,0.25,57,0.76],[6,0.25,62,0.76],[6,0.25,65,0.76],[6.75,0.25,57,0.79],[6.75,0.25,62,0.79],[6.75,0.25,65,0.79],[8,0.5,58,0.87],[8,0.5,62,0.87],[8,0.5,65,0.87],[8.75,0.5,58,0.76],[8.75,0.5,62,0.76],[8.75,0.5,65,0.76],[9.5,0.5,58,0.72],[9.5,0.5,62,0.72],[9.5,0.5,65,0.72],[11.5,0.25,58,0.79],[11.5,0.25,62,0.79],[11.5,0.25,65,0.79],[12,0.5,57,0.87],[12,0.5,61,0.87],[12,0.5,64,0.87],[12.75,0.5,57,0.76],[12.75,0.5,61,0.76],[12.75,0.5,64,0.76],[13.5,0.25,57,0.71],[13.5,0.25,61,0.71],[13.5,0.25,64,0.71],[14,0.25,57,0.74],[14,0.25,61,0.74],[14,0.25,64,0.74],[14.5,0.25,57,0.77],[14.5,0.25,61,0.77],[14.5,0.25,64,0.77],[15,1,57,0.88],[15,1,61,0.88],[15,1,64,0.88]]`
- **Karte:** „Abgehackter Digital-Akkord wie ein geschnittenes Sample – erinnert an Electro-Industrial um 1992 (Stil Front Line Assembly).“

### 3.3 Apoptygma Berzerk (`vorbild: apoptygma-berzerk`, neu)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Norwegische EBM/Futurepop/Synthrock-Gruppe; Stephan Groth einziges festes Mitglied | WAHRSCHEINLICH (Reflections of Darkness) | https://www.reflectionsofdarkness.com/artists-a-e/102-apoptygma-berzerk |
| Gründungsjahr: **widersprüchlich** (1989 Icon vs Icon/Wikipedia-Auszug; 1986 RoD; „1971“ bei RME offensichtlich falsch) | WIDERSPRUCH | https://www.iconvsicon.com/2016/10/07/exit-popularity-contest-apops-stephan-groth-on-revisiting-his-electronic-roots/ · RoD (wie oben) · https://archiv.rme-audio.de/en/artists/apoptygma.php |
| Begriff **„Futurepop“** entstand im Gespräch Ronan Harris (VNV Nation) – Stephan Groth | **BELEGT** (Wikipedia + Groth-Interview) | https://en.wikipedia.org/wiki/Futurepop · https://elgarajedefrank.es/en/?p=5060 |
| Futurepop = Synthpop + EBM + Trance/Techno-Beats, behält Gesangs- und Liedform des Synthpop | WAHRSCHEINLICH (Wikipedia) | https://en.wikipedia.org/wiki/Futurepop |
| „Welcome to Earth“ (2000, Tatra/Metropolis), Genre Futurepop; Single „Kathy's Song (Come Lie Next to Me)“ | WAHRSCHEINLICH (Wikipedia) | https://en.wikipedia.org/wiki/Welcome_to_Earth_(album) |
| Live mit Gitarre/Schlagzeug (Zeitpunkt UNBELEGT) | **WAHRSCHEINLICH** (SE, eine Quelle, nicht reproduziert; andere Interviews – Regen, Electricity Club, Icon vs Icon – beschreiben Groth als Solo-Projekt, Gitarren eher erst in der späteren Synthrock-Phase) – nicht im ⓘ | https://elgarajedefrank.es/en/?p=5060 |
| Tour 2007: Keyboarder spielte Software-Instrumente (RME Fireface) | WAHRSCHEINLICH (Toningenieur, Hersteller-Seite) | https://archiv.rme-audio.de/en/artists/apoptygma.php |
| Studio-Synths | UNBELEGT (nichts gefunden) | – |

**Stil-Merkmale (eK, UNBELEGT):** 125–135 BPM, Trance-Arps und Plucks mit Echo, rollender Offbeat-Bass, Sidechain-Pumpen, i–VI–III–VII-Folgen, hymnischer Refrain.

#### EB-11 „Nordlicht-Pluck“ – Rolle Sequenz · VA (neu)

- **Vorbild (ⓘ):** heller Trance-Pluck als 16tel-Arpeggio mit Ping-Pong-Echo (Stil Futurepop; Gerät UNBELEGT).
- **Rezept:** `o1w 0, o2w 1, o2pw .35, o2fine 9, o2lvl .6, ftype 0, cutoff 1500, res .25, kt .6, fenv .45, fA .001, fD .16, fS 0, fR .12, aA .001, aD .22, aS 0, aR .18, ampVel .5, poly 6, spread .4, analog .1` · bus `{echo:{mode:'pp', divL:'1/8.', fb .4}}` · fx `{dly .3, rev .3}`.
- **Abgrenzung:** SZ-30 „Taktgitter-Fläche“ (VNV) ist ein Trance-**Gate** auf einer Fläche; EB-11 ist ein **Pluck-Arp**.
- **Lage / Rolle:** D4–F5 (62–77). LAGE-Klammer **C4–A5**. Akkord-Reaktion: **nächstliegend, Gleichstand aufwärts**.
- **Hörprobe** (132 BPM, a-Moll, i–VI–III–VII, Arp-Richtung wechselt je Takt, Takt 8 Dur-Dominante E):
```
Tempo 132 BPM · 8 Takte · Akkorde: Am | F | C | G | Am | F | C | E
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E4(64) 0/1/104 · A4(69) 1/1/78 · C5(72) 2/1/90 · E5(76) 3/1/78 · C5(72) 4/1/104 · A4(69) 5/1/78 · E4(64) 6/1/90 · A4(69) 7/1/78 · C5(72) 8/1/104 · E5(76) 9/1/78 · C5(72) 10/1/90 · A4(69) 11/1/78 · E4(64) 12/1/104 · A4(69) 13/1/78 · C5(72) 14/1/90 · E5(76) 15/1/78
T2: F4(65) 16/1/104 · A4(69) 17/1/78 · C5(72) 18/1/90 · F5(77) 19/1/78 · C5(72) 20/1/104 · A4(69) 21/1/78 · F5(77) 22/1/90 · C5(72) 24/1/104 · A4(69) 25/1/78 · F4(65) 26/1/90 · A4(69) 27/1/78 · C5(72) 28/1/104 · F5(77) 29/1/78 · C5(72) 30/1/90
T3: E5(76) 32/1/104 · C5(72) 33/1/78 · G4(67) 34/1/90 · E4(64) 35/1/78 · G4(67) 36/1/104 · C5(72) 37/1/78 · E5(76) 38/1/90 · C5(72) 39/1/78 · G4(67) 40/1/104 · E4(64) 41/1/78 · G4(67) 42/1/90 · C5(72) 43/1/78 · E5(76) 44/1/104 · G4(67) 46/1/90 · C5(72) 47/1/78
T4: D4(62) 48/1/104 · B4(71) 49/1/78 · G4(67) 50/1/90 · D5(74) 51/1/78 · D4(62) 52/1/104 · B4(71) 53/1/78 · G4(67) 54/1/90 · D5(74) 55/1/78 · D4(62) 56/1/104 · B4(71) 57/1/78 · G4(67) 58/1/90 · D5(74) 59/1/78 · B4(71) 60/1/104 · G4(67) 61/1/78 · D4(62) 62/1/90
T5: E4(64) 64/1/104 · A4(69) 65/1/78 · C5(72) 66/1/90 · E5(76) 67/1/78 · C5(72) 68/1/104 · A4(69) 69/1/78 · E5(76) 70/1/90 · C5(72) 72/1/104 · A4(69) 73/1/78 · E4(64) 74/1/90 · A4(69) 75/1/78 · C5(72) 76/1/104 · E5(76) 77/1/78 · C5(72) 78/1/90
T6: F5(77) 80/1/104 · C5(72) 81/1/78 · A4(69) 82/1/90 · F4(65) 83/1/78 · A4(69) 84/1/104 · C5(72) 85/1/78 · F5(77) 86/1/90 · C5(72) 87/1/78 · A4(69) 88/1/104 · F4(65) 89/1/78 · A4(69) 90/1/90 · C5(72) 91/1/78 · F5(77) 92/1/104 · A4(69) 94/1/90 · C5(72) 95/1/78
T7: E4(64) 96/1/104 · C5(72) 97/1/78 · G4(67) 98/1/90 · E5(76) 99/1/78 · E4(64) 100/1/104 · C5(72) 101/1/78 · G4(67) 102/1/90 · E5(76) 103/1/78 · E4(64) 104/1/104 · C5(72) 105/1/78 · G4(67) 106/1/90 · E5(76) 107/1/78 · C5(72) 108/1/104 · G4(67) 109/1/78 · E4(64) 110/1/90
T8: E4(64) 112/1/104 · Ab4(68) 113/1/78 · B4(71) 114/1/90 · E5(76) 115/1/78 · B4(71) 116/1/104 · E5(76) 117/1/78 · E5(76) 119/1/78 · B4(71) 120/1/104 · Ab4(68) 121/1/78 · E4(64) 122/1/90 · Ab4(68) 123/1/78 · B4(71) 124/1/104 · E5(76) 125/1/78 · E5(76) 126/1/90
```
Dauer: alle 8 Takte 14,5 s · kurz (≤ 8 s) T1, T2, T3, T8 = 7,3 s · ganz (≤ 16 s) T1, T2, T3, T4, T5, T6, T7, T8 = 14,5 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.25,64,0.82],[0.25,0.25,69,0.61],[0.5,0.25,72,0.71],[0.75,0.25,76,0.61],[1,0.25,72,0.82],[1.25,0.25,69,0.61],[1.5,0.25,64,0.71],[1.75,0.25,69,0.61],[2,0.25,72,0.82],[2.25,0.25,76,0.61],[2.5,0.25,72,0.71],[2.75,0.25,69,0.61],[3,0.25,64,0.82],[3.25,0.25,69,0.61],[3.5,0.25,72,0.71],[3.75,0.25,76,0.61],[4,0.25,65,0.82],[4.25,0.25,69,0.61],[4.5,0.25,72,0.71],[4.75,0.25,77,0.61],[5,0.25,72,0.82],[5.25,0.25,69,0.61],[5.5,0.25,77,0.71],[6,0.25,72,0.82],[6.25,0.25,69,0.61],[6.5,0.25,65,0.71],[6.75,0.25,69,0.61],[7,0.25,72,0.82],[7.25,0.25,77,0.61],[7.5,0.25,72,0.71],[8,0.25,76,0.82],[8.25,0.25,72,0.61],[8.5,0.25,67,0.71],[8.75,0.25,64,0.61],[9,0.25,67,0.82],[9.25,0.25,72,0.61],[9.5,0.25,76,0.71],[9.75,0.25,72,0.61],[10,0.25,67,0.82],[10.25,0.25,64,0.61],[10.5,0.25,67,0.71],[10.75,0.25,72,0.61],[11,0.25,76,0.82],[11.5,0.25,67,0.71],[11.75,0.25,72,0.61],[12,0.25,64,0.82],[12.25,0.25,68,0.61],[12.5,0.25,71,0.71],[12.75,0.25,76,0.61],[13,0.25,71,0.82],[13.25,0.25,76,0.61],[13.75,0.25,76,0.61],[14,0.25,71,0.82],[14.25,0.25,68,0.61],[14.5,0.25,64,0.71],[14.75,0.25,68,0.61],[15,0.25,71,0.82],[15.25,0.25,76,0.61],[15.5,0.25,76,0.71]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 8`): `[[0,0.25,64,0.82],[0.25,0.25,69,0.61],[0.5,0.25,72,0.71],[0.75,0.25,76,0.61],[1,0.25,72,0.82],[1.25,0.25,69,0.61],[1.5,0.25,64,0.71],[1.75,0.25,69,0.61],[2,0.25,72,0.82],[2.25,0.25,76,0.61],[2.5,0.25,72,0.71],[2.75,0.25,69,0.61],[3,0.25,64,0.82],[3.25,0.25,69,0.61],[3.5,0.25,72,0.71],[3.75,0.25,76,0.61],[4,0.25,65,0.82],[4.25,0.25,69,0.61],[4.5,0.25,72,0.71],[4.75,0.25,77,0.61],[5,0.25,72,0.82],[5.25,0.25,69,0.61],[5.5,0.25,77,0.71],[6,0.25,72,0.82],[6.25,0.25,69,0.61],[6.5,0.25,65,0.71],[6.75,0.25,69,0.61],[7,0.25,72,0.82],[7.25,0.25,77,0.61],[7.5,0.25,72,0.71],[8,0.25,76,0.82],[8.25,0.25,72,0.61],[8.5,0.25,67,0.71],[8.75,0.25,64,0.61],[9,0.25,67,0.82],[9.25,0.25,72,0.61],[9.5,0.25,76,0.71],[9.75,0.25,72,0.61],[10,0.25,67,0.82],[10.25,0.25,64,0.61],[10.5,0.25,67,0.71],[10.75,0.25,72,0.61],[11,0.25,76,0.82],[11.5,0.25,67,0.71],[11.75,0.25,72,0.61],[12,0.25,62,0.82],[12.25,0.25,71,0.61],[12.5,0.25,67,0.71],[12.75,0.25,74,0.61],[13,0.25,62,0.82],[13.25,0.25,71,0.61],[13.5,0.25,67,0.71],[13.75,0.25,74,0.61],[14,0.25,62,0.82],[14.25,0.25,71,0.61],[14.5,0.25,67,0.71],[14.75,0.25,74,0.61],[15,0.25,71,0.82],[15.25,0.25,67,0.61],[15.5,0.25,62,0.71],[16,0.25,64,0.82],[16.25,0.25,69,0.61],[16.5,0.25,72,0.71],[16.75,0.25,76,0.61],[17,0.25,72,0.82],[17.25,0.25,69,0.61],[17.5,0.25,76,0.71],[18,0.25,72,0.82],[18.25,0.25,69,0.61],[18.5,0.25,64,0.71],[18.75,0.25,69,0.61],[19,0.25,72,0.82],[19.25,0.25,76,0.61],[19.5,0.25,72,0.71],[20,0.25,77,0.82],[20.25,0.25,72,0.61],[20.5,0.25,69,0.71],[20.75,0.25,65,0.61],[21,0.25,69,0.82],[21.25,0.25,72,0.61],[21.5,0.25,77,0.71],[21.75,0.25,72,0.61],[22,0.25,69,0.82],[22.25,0.25,65,0.61],[22.5,0.25,69,0.71],[22.75,0.25,72,0.61],[23,0.25,77,0.82],[23.5,0.25,69,0.71],[23.75,0.25,72,0.61],[24,0.25,64,0.82],[24.25,0.25,72,0.61],[24.5,0.25,67,0.71],[24.75,0.25,76,0.61],[25,0.25,64,0.82],[25.25,0.25,72,0.61],[25.5,0.25,67,0.71],[25.75,0.25,76,0.61],[26,0.25,64,0.82],[26.25,0.25,72,0.61],[26.5,0.25,67,0.71],[26.75,0.25,76,0.61],[27,0.25,72,0.82],[27.25,0.25,67,0.61],[27.5,0.25,64,0.71],[28,0.25,64,0.82],[28.25,0.25,68,0.61],[28.5,0.25,71,0.71],[28.75,0.25,76,0.61],[29,0.25,71,0.82],[29.25,0.25,76,0.61],[29.75,0.25,76,0.61],[30,0.25,71,0.82],[30.25,0.25,68,0.61],[30.5,0.25,64,0.71],[30.75,0.25,68,0.61],[31,0.25,71,0.82],[31.25,0.25,76,0.61],[31.5,0.25,76,0.71]]`
- **Karte:** „Funkelnder Trance-Pluck mit Ping-Pong-Echo – erinnert an norwegischen Futurepop um 2000 (Stil Apoptygma Berzerk).“

#### EB-12 „Rollbass“ – Rolle Bass · VA (neu)

- **Vorbild (ⓘ):** rollender Offbeat-16tel-Bass, der der Kick ausweicht (Stil; Gerät UNBELEGT).
- **Rezept:** `o1w 0, o2w 0, o2fine -8, o2lvl .7, subLvl .4, ftype 0, cutoff 700, res .2, kt .4, fenv .3, fA .001, fD .1, fS .2, fR .05, aA .001, aD .12, aS .6, aR .04, mode 1, poly 1, reset 1` · fx `{pump .5, pumpRel '1/8', drive .1}`.
- **Lage / Rolle:** E1–C3 (28–48). LAGE-Klammer **hoch C3**. Akkord-Reaktion: **nächstliegend, nie über C3**. Spielt mit EB-11 zusammen.
- **Hörprobe** (132 BPM, gleiche Akkorde wie EB-11, „– R R R“ je Viertel, Takt 8 E mit Septime):
```
Tempo 132 BPM · 8 Takte · Akkorde: Am | F | C | G | Am | F | C | E
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A1(33) 1/1/84 · A1(33) 2/1/108 · A1(33) 3/1/84 · A1(33) 5/1/84 · A1(33) 6/1/108 · A2(45) 7/1/96 · A1(33) 9/1/84 · A1(33) 10/1/108 · A1(33) 11/1/84 · A1(33) 13/1/84 · A1(33) 14/1/108 · A2(45) 15/1/96
T2: F1(29) 17/1/84 · F1(29) 18/1/108 · F1(29) 19/1/84 · F1(29) 21/1/84 · F1(29) 22/1/108 · F2(41) 23/1/96 · F1(29) 25/1/84 · F1(29) 26/1/108 · F1(29) 27/1/84 · F1(29) 29/1/84 · F2(41) 30/1/108 · F1(29) 31/1/84
T3: C2(36) 33/1/84 · C2(36) 34/1/108 · C2(36) 35/1/84 · C2(36) 37/1/84 · C2(36) 38/1/108 · C3(48) 39/1/96 · C2(36) 41/1/84 · C2(36) 42/1/108 · C2(36) 43/1/84 · C2(36) 45/1/84 · C2(36) 46/1/108 · C3(48) 47/1/96
T4: G1(31) 49/1/84 · G1(31) 50/1/108 · G2(43) 51/1/96 · G1(31) 53/1/84 · G1(31) 54/1/108 · G1(31) 55/1/84 · G1(31) 57/1/84 · G1(31) 58/1/108 · G2(43) 59/1/96 · G1(31) 61/1/84 · D2(38) 62/1/108 · G2(43) 63/1/96
T5: A1(33) 65/1/84 · A1(33) 66/1/108 · A1(33) 67/1/84 · A1(33) 69/1/84 · A1(33) 70/1/108 · A2(45) 71/1/96 · A1(33) 73/1/84 · A1(33) 74/1/108 · A1(33) 75/1/84 · A1(33) 77/1/84 · A2(45) 78/1/108 · A1(33) 79/1/84
T6: F1(29) 81/1/84 · F1(29) 82/1/108 · F1(29) 83/1/84 · F1(29) 85/1/84 · F1(29) 86/1/108 · F2(41) 87/1/96 · F1(29) 89/1/84 · F1(29) 90/1/108 · F1(29) 91/1/84 · F1(29) 93/1/84 · F1(29) 94/1/108 · F2(41) 95/1/96
T7: C2(36) 97/1/84 · C2(36) 98/1/108 · C3(48) 99/1/96 · C2(36) 101/1/84 · C2(36) 102/1/108 · C2(36) 103/1/84 · C2(36) 105/1/84 · C2(36) 106/1/108 · C3(48) 107/1/96 · C2(36) 109/1/84 · G2(43) 110/1/108 · C3(48) 111/1/96
T8: E1(28) 113/1/84 · E1(28) 114/1/108 · E1(28) 115/1/84 · E1(28) 117/1/84 · E1(28) 118/1/108 · E2(40) 119/1/96 · E1(28) 121/1/84 · B1(35) 122/1/108 · E2(40) 123/1/96 · E2(40) 125/1/96 · D2(38) 126/1/108 · E2(40) 127/1/96
```
Dauer: alle 8 Takte 14,5 s · kurz (≤ 8 s) T1, T2, T3, T8 = 7,3 s · ganz (≤ 16 s) T1, T2, T3, T4, T5, T6, T7, T8 = 14,5 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0.25,0.25,33,0.66],[0.5,0.25,33,0.85],[0.75,0.25,33,0.66],[1.25,0.25,33,0.66],[1.5,0.25,33,0.85],[1.75,0.25,45,0.76],[2.25,0.25,33,0.66],[2.5,0.25,33,0.85],[2.75,0.25,33,0.66],[3.25,0.25,33,0.66],[3.5,0.25,33,0.85],[3.75,0.25,45,0.76],[4.25,0.25,29,0.66],[4.5,0.25,29,0.85],[4.75,0.25,29,0.66],[5.25,0.25,29,0.66],[5.5,0.25,29,0.85],[5.75,0.25,41,0.76],[6.25,0.25,29,0.66],[6.5,0.25,29,0.85],[6.75,0.25,29,0.66],[7.25,0.25,29,0.66],[7.5,0.25,41,0.85],[7.75,0.25,29,0.66],[8.25,0.25,36,0.66],[8.5,0.25,36,0.85],[8.75,0.25,36,0.66],[9.25,0.25,36,0.66],[9.5,0.25,36,0.85],[9.75,0.25,48,0.76],[10.25,0.25,36,0.66],[10.5,0.25,36,0.85],[10.75,0.25,36,0.66],[11.25,0.25,36,0.66],[11.5,0.25,36,0.85],[11.75,0.25,48,0.76],[12.25,0.25,28,0.66],[12.5,0.25,28,0.85],[12.75,0.25,28,0.66],[13.25,0.25,28,0.66],[13.5,0.25,28,0.85],[13.75,0.25,40,0.76],[14.25,0.25,28,0.66],[14.5,0.25,35,0.85],[14.75,0.25,40,0.76],[15.25,0.25,40,0.76],[15.5,0.25,38,0.85],[15.75,0.25,40,0.76]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 8`): `[[0.25,0.25,33,0.66],[0.5,0.25,33,0.85],[0.75,0.25,33,0.66],[1.25,0.25,33,0.66],[1.5,0.25,33,0.85],[1.75,0.25,45,0.76],[2.25,0.25,33,0.66],[2.5,0.25,33,0.85],[2.75,0.25,33,0.66],[3.25,0.25,33,0.66],[3.5,0.25,33,0.85],[3.75,0.25,45,0.76],[4.25,0.25,29,0.66],[4.5,0.25,29,0.85],[4.75,0.25,29,0.66],[5.25,0.25,29,0.66],[5.5,0.25,29,0.85],[5.75,0.25,41,0.76],[6.25,0.25,29,0.66],[6.5,0.25,29,0.85],[6.75,0.25,29,0.66],[7.25,0.25,29,0.66],[7.5,0.25,41,0.85],[7.75,0.25,29,0.66],[8.25,0.25,36,0.66],[8.5,0.25,36,0.85],[8.75,0.25,36,0.66],[9.25,0.25,36,0.66],[9.5,0.25,36,0.85],[9.75,0.25,48,0.76],[10.25,0.25,36,0.66],[10.5,0.25,36,0.85],[10.75,0.25,36,0.66],[11.25,0.25,36,0.66],[11.5,0.25,36,0.85],[11.75,0.25,48,0.76],[12.25,0.25,31,0.66],[12.5,0.25,31,0.85],[12.75,0.25,43,0.76],[13.25,0.25,31,0.66],[13.5,0.25,31,0.85],[13.75,0.25,31,0.66],[14.25,0.25,31,0.66],[14.5,0.25,31,0.85],[14.75,0.25,43,0.76],[15.25,0.25,31,0.66],[15.5,0.25,38,0.85],[15.75,0.25,43,0.76],[16.25,0.25,33,0.66],[16.5,0.25,33,0.85],[16.75,0.25,33,0.66],[17.25,0.25,33,0.66],[17.5,0.25,33,0.85],[17.75,0.25,45,0.76],[18.25,0.25,33,0.66],[18.5,0.25,33,0.85],[18.75,0.25,33,0.66],[19.25,0.25,33,0.66],[19.5,0.25,45,0.85],[19.75,0.25,33,0.66],[20.25,0.25,29,0.66],[20.5,0.25,29,0.85],[20.75,0.25,29,0.66],[21.25,0.25,29,0.66],[21.5,0.25,29,0.85],[21.75,0.25,41,0.76],[22.25,0.25,29,0.66],[22.5,0.25,29,0.85],[22.75,0.25,29,0.66],[23.25,0.25,29,0.66],[23.5,0.25,29,0.85],[23.75,0.25,41,0.76],[24.25,0.25,36,0.66],[24.5,0.25,36,0.85],[24.75,0.25,48,0.76],[25.25,0.25,36,0.66],[25.5,0.25,36,0.85],[25.75,0.25,36,0.66],[26.25,0.25,36,0.66],[26.5,0.25,36,0.85],[26.75,0.25,48,0.76],[27.25,0.25,36,0.66],[27.5,0.25,43,0.85],[27.75,0.25,48,0.76],[28.25,0.25,28,0.66],[28.5,0.25,28,0.85],[28.75,0.25,28,0.66],[29.25,0.25,28,0.66],[29.5,0.25,28,0.85],[29.75,0.25,40,0.76],[30.25,0.25,28,0.66],[30.5,0.25,35,0.85],[30.75,0.25,40,0.76],[31.25,0.25,40,0.76],[31.5,0.25,38,0.85],[31.75,0.25,40,0.76]]`
- **Karte:** „Rollender Offbeat-Bass mit Pumpen – erinnert an Futurepop-Clubhits um 2000 (Stil Apoptygma Berzerk).“

### 3.4 Assemblage 23 (`vorbild: assemblage-23`, neu)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Ein-Mann-Projekt von Tom Shear, gegründet 1988; Musik, Texte und Aufnahme allein | **BELEGT** (Wikipedia Band + Wikipedia Person; zwei Artikel, aber gleiche Plattform → knapp) | https://en.wikipedia.org/wiki/Assemblage_23 · https://en.wikipedia.org/wiki/Tom_Shear |
| Stil: elektronische Klänge des Synthpop + härtere Kante aus Punk/Industrial | WAHRSCHEINLICH (Wikipedia) | wie oben |
| Studio-Geräte | UNBELEGT (nichts gefunden) | – |

**Stil-Merkmale (eK, UNBELEGT):** melancholische Moll-Leads in der Mittellage, 125–130 BPM, Futurepop-Drums, breite Flächen.

#### EB-13 „Sturmglas-Lead“ – Rolle Lead · VA (neu)

- **Vorbild (ⓘ):** singender, leicht verstimmter Moll-Lead mit Vibrato und Echo (Stil; Gerät UNBELEGT).
- **Rezept:** `o1w 0, o2w 1, o2pw .45, o2fine 12, o2lvl .7, ftype 1, cutoff 2400, res .2, drive .15, kt .5, fenv .2, fA .005, fD .3, fS .5, fR .2, aA .008, aD .3, aS .8, aR .25, mode 2, poly 1, glide .03, l1rate 5.2, l1fade .7, analog .2` · Route `M('lfo1', 'pitch', .003)` · Chorus I · bus `{echo:{mode:'mono', divL:'1/4', fb .3}}` · fx `{dly .25, rev .35}`.
- **Lage / Rolle:** E4–A5 (64–81). LAGE-Klammer **tief C4**. Akkord-Reaktion: **folgt der Oktave der Taste**.
- **Hörprobe** (128 BPM, e-Moll, eigene Melodie in Bögen, Takt 8 H-Dur mit D♯):
```
Tempo 128 BPM · 8 Takte · Akkorde: Em | C | G | D | Em | C | Am | B
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E5(76) 0/4/104 · D5(74) 4/2/90 · B4(71) 6/2/88 · G4(67) 8/4/98 · A4(69) 12/2/88 · B4(71) 14/2/92
T2: C5(72) 16/6/104 · B4(71) 22/2/88 · G4(67) 24/4/96 · E4(64) 28/4/90
T3: D5(74) 32/4/104 · B4(71) 36/2/88 · D5(74) 38/2/92 · G5(79) 40/6/108 · F#5(78) 46/2/92
T4: F#5(78) 48/4/104 · E5(76) 52/2/90 · D5(74) 54/2/88 · A4(69) 56/8/98
T5: B4(71) 64/2/96 · E5(76) 66/4/104 · F#5(78) 70/2/92 · G5(79) 72/4/106 · F#5(78) 76/2/92 · E5(76) 78/2/90
T6: E5(76) 80/4/102 · G5(79) 84/2/96 · E5(76) 86/2/88 · C5(72) 88/6/100 · B4(71) 94/2/88
T7: A4(69) 96/4/100 · C5(72) 100/2/92 · E5(76) 102/2/94 · A5(81) 104/4/110 · G5(79) 108/2/94 · E5(76) 110/2/90
T8: F#5(78) 112/4/106 · Eb5(75) 116/4/98 · B4(71) 120/6/100
```
Dauer: alle 8 Takte 15,0 s · kurz (≤ 8 s) T1, T2, T3, T8 = 7,5 s · ganz (≤ 16 s) T1, T2, T3, T4, T5, T6, T7, T8 = 15,0 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,1,76,0.82],[1,0.5,74,0.71],[1.5,0.5,71,0.69],[2,1,67,0.77],[3,0.5,69,0.69],[3.5,0.5,71,0.72],[4,1.5,72,0.82],[5.5,0.5,71,0.69],[6,1,67,0.76],[7,1,64,0.71],[8,1,74,0.82],[9,0.5,71,0.69],[9.5,0.5,74,0.72],[10,1.5,79,0.85],[11.5,0.5,78,0.72],[12,1,78,0.83],[13,1,75,0.77],[14,1.5,71,0.79]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 8`): `[[0,1,76,0.82],[1,0.5,74,0.71],[1.5,0.5,71,0.69],[2,1,67,0.77],[3,0.5,69,0.69],[3.5,0.5,71,0.72],[4,1.5,72,0.82],[5.5,0.5,71,0.69],[6,1,67,0.76],[7,1,64,0.71],[8,1,74,0.82],[9,0.5,71,0.69],[9.5,0.5,74,0.72],[10,1.5,79,0.85],[11.5,0.5,78,0.72],[12,1,78,0.82],[13,0.5,76,0.71],[13.5,0.5,74,0.69],[14,2,69,0.77],[16,0.5,71,0.76],[16.5,1,76,0.82],[17.5,0.5,78,0.72],[18,1,79,0.83],[19,0.5,78,0.72],[19.5,0.5,76,0.71],[20,1,76,0.8],[21,0.5,79,0.76],[21.5,0.5,76,0.69],[22,1.5,72,0.79],[23.5,0.5,71,0.69],[24,1,69,0.79],[25,0.5,72,0.72],[25.5,0.5,76,0.74],[26,1,81,0.87],[27,0.5,79,0.74],[27.5,0.5,76,0.71],[28,1,78,0.83],[29,1,75,0.77],[30,1.5,71,0.79]]`
- **Karte:** „Melancholischer Singe-Lead mit Echo – erinnert an US-Futurepop der 2000er (Stil Assemblage 23).“

### 3.5 Combichrist (`vorbild: combichrist`, neu)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Gegründet 2003 von Andy LaPlegua (Norweger; vorher Icon of Coil, Futurepop); Aggrotech / Industrial Metal; Sitz heute USA | **BELEGT** (Wikipedia Band + Wikipedia Person) | https://en.wikipedia.org/wiki/Combichrist · https://en.wikipedia.org/wiki/Andy_LaPlegua |
| Um „Everybody Hates You“ (2005) nannte LaPlegua den Stil „Techno Body Music“ (TBM) | WAHRSCHEINLICH (eine Quelle im Auszug) | https://en.wikipedia.org/wiki/Combichrist |
| LaPlegua macht im Studio alles selbst | WAHRSCHEINLICH (Presse-Auszug) | https://www.dallasobserver.com/?p=40410152 |
| Geräte | UNBELEGT (nur allgemeiner Satz „analoge Synths und Sampler“ ohne Modell) | https://equipboard.com/band/combichrist |

**Stil-Merkmale (eK, UNBELEGT):** 135–145 BPM, Techno-Four-on-the-Floor mit verzerrter Kick, Offbeat-Bass, offene Hats auf dem Offbeat, sehr wenig Harmonik.

#### EB-14 „Techno-Körper-Kit“ – Rolle Drums · Drum-Synth (neu)

- **Vorbild (ⓘ):** verzerrtes Techno-Kit für „Techno Body Music“ (Begriff WAHRSCHEINLICH; Klangwerte UNBELEGT).
- **Kit-Rezept (Abweichungen):** KICK `{frq 50, pAmt 22, pDec .03, tDec .35, cLvl .4, drv .6}` · CLAP `{nLvl 1, nTyp 'bandpass', nFrq 1400, nBur 4, nGap .009, nDec .18, sRoom .25}` · HH ZU `{mLvl .6, mHp 8500, mDec .03, nLvl .4}` · HH OFFEN `{mLvl .6, mHp 8000, mDec .22}` · PERC `{mLvl .8, mTun 1.6, mDec .1, drv .4}` · Kit-Bus `{room .15}` · Spur-Drive .3.
- **Hörprobe** (140 BPM, gerade Kick, offene Hats auf dem Offbeat, Takt 4 Clap-Wirbel):
```
Tempo 140 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK     | x...x...x...x... | x...x...x...x... | x...x...x...x... | x...x...x...x.xx
CLAP     | ....x.......x... | ....x.......x... | ....x.......x..x | ....x.......xxxx
HH ZU    | x.xxx.xxx.xxx.xx | x.xxx.xxx.xxx.x. | x.xxx.xxx.xxx.xx | x.xxx.xxx.......
HH OFFEN | ..x...x...x...x. | ..x...x...x...x. | ..x...x...x...x. | ..x...x...x.....
PERC     | .......x........ | .......x.....x.. | .......x........ | .......x...x....
```
Dauer: alle 4 Takte 6,9 s · kurz (≤ 8 s) T1, T2, T3, T4 = 6,9 s · ganz (≤ 16 s) T1, T2, T3, T4 = 6,9 s
- **Karte:** „Verzerrte Techno-Kick mit offenen Hats – erinnert an Aggrotech der 2000er (Stil Combichrist).“

#### EB-15 „Säge-Rammbass“ – Rolle Bass · VA (neu)

- **Vorbild (ⓘ):** breiter, verzerrter Unisono-Sägebass auf den Offbeats (Stil; Gerät UNBELEGT).
- **Rezept:** `o1w 0, o1uni 5, uniDet .2, uniMix .6, o2w 0, o2oct 1, o2lvl .35, ftype 0, cutoff 900, res .3, drive .4, kt .4, fenv .3, fA .001, fD .08, fS .3, fR .04, aA .001, aD .1, aS .7, aR .03, mode 1, poly 1, reset 1` · fx `{drive .6, pump .4, pumpRel '1/8'}`.
- **Lage / Rolle:** F1–C♯3 (29–49). LAGE-Klammer **hoch D3**. Akkord-Reaktion: **nächstliegend, nie über D3**.
- **Hörprobe** (140 BPM, f-Moll-Orgelpunkt, Bass nur auf „und“-16teln, Takt 4 D♭ → C):
```
Tempo 140 BPM · 4 Takte · Akkorde: Fm | Fm | Fm | Db C
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: F1(29) 2/1/108 · F1(29) 3/1/84 · F1(29) 6/1/108 · F1(29) 7/1/84 · F1(29) 10/1/108 · F1(29) 11/1/84 · F1(29) 14/1/108 · F2(41) 15/1/96
T2: F1(29) 18/1/108 · F1(29) 19/1/84 · F1(29) 22/1/108 · F2(41) 23/1/96 · F1(29) 26/1/108 · F1(29) 27/1/84 · F2(41) 30/1/108 · F1(29) 31/1/84
T3: F1(29) 34/1/108 · F1(29) 35/1/84 · F1(29) 37/1/84 · F1(29) 38/1/108 · F1(29) 39/1/84 · F1(29) 42/1/108 · F1(29) 43/1/84 · F1(29) 45/1/84 · F2(41) 46/1/108 · F1(29) 47/1/84
T4: C#2(37) 50/1/108 · C#2(37) 51/1/84 · C#2(37) 54/1/108 · C#3(49) 55/1/96 · C2(36) 58/1/108 · C2(36) 59/1/84 · C3(48) 61/1/96 · Bb2(46) 62/1/108 · C3(48) 63/1/96
```
Dauer: alle 4 Takte 6,9 s · kurz (≤ 8 s) T1, T2, T3, T4 = 6,9 s · ganz (≤ 16 s) T1, T2, T3, T4 = 6,9 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0.5,0.25,29,0.85],[0.75,0.25,29,0.66],[1.5,0.25,29,0.85],[1.75,0.25,29,0.66],[2.5,0.25,29,0.85],[2.75,0.25,29,0.66],[3.5,0.25,29,0.85],[3.75,0.25,41,0.76],[4.5,0.25,29,0.85],[4.75,0.25,29,0.66],[5.5,0.25,29,0.85],[5.75,0.25,41,0.76],[6.5,0.25,29,0.85],[6.75,0.25,29,0.66],[7.5,0.25,41,0.85],[7.75,0.25,29,0.66],[8.5,0.25,29,0.85],[8.75,0.25,29,0.66],[9.25,0.25,29,0.66],[9.5,0.25,29,0.85],[9.75,0.25,29,0.66],[10.5,0.25,29,0.85],[10.75,0.25,29,0.66],[11.25,0.25,29,0.66],[11.5,0.25,41,0.85],[11.75,0.25,29,0.66],[12.5,0.25,37,0.85],[12.75,0.25,37,0.66],[13.5,0.25,37,0.85],[13.75,0.25,49,0.76],[14.5,0.25,36,0.85],[14.75,0.25,36,0.66],[15.25,0.25,48,0.76],[15.5,0.25,46,0.85],[15.75,0.25,48,0.76]]`
- **Karte:** „Breiter, verzerrter Offbeat-Bass zur Techno-Kick – erinnert an Aggrotech um 2005 (Stil Combichrist).“

### 3.6 Wolfsheim (`vorbild: wolfsheim`, neu)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Hamburg 1987, Markus Reinhardt (Musik) und Peter Heppner (Text, Gesang); Synthpop/Darkwave mit Wurzeln in New Romantic und New Wave; seit 2005 inaktiv | **BELEGT** (Wikipedia + Qobuz/last.fm im Auszug) | https://en.wikipedia.org/wiki/Wolfsheim_(band) · https://www.qobuz.com/ie-en/interpreter/wolfsheim/223889 |
| „The Sparrows and the Nightingales“ (1991, Strange Ways); die düsteren Synths **produziert von Carlos Perón** (Ex-Yello) | WAHRSCHEINLICH (Auszug aus Händler-/Labeltext) | https://midheaven.com/item/wolfsheim/the-sparrows-and-the-nightingales-by-wolfsheim |
| Bekannte Singles: „The Sparrows and the Nightingales“ (1991), „Once in a Lifetime“ (1998), „Kein Zurück“ (2003, Album „Casting Shadows“) | WAHRSCHEINLICH (Wikipedia) | https://en.wikipedia.org/wiki/Wolfsheim_(band) |
| Geräte | UNBELEGT | – |

**Stil-Merkmale (eK, UNBELEGT):** langsam-mittleres Tempo, Moll, weiche Streicherflächen, glockige Melodie-Synths über der Stimme, viel Hall.

#### EB-16 „Spatzen-Streicher“ – Rolle Fläche · VA (neu)

- **Vorbild (ⓘ):** weiche, melancholische Synth-Streicher (Stil; Gerät UNBELEGT).
- **Rezept:** `o1w 0, o1uni 3, uniDet .2, uniMix .5, o2w 1, o2pw .4, o2lvl .4, ftype 1, cutoff 1700, res .08, kt .4, fenv .1, fA .5, fD 1.2, fS .7, fR 1, aA .45, aD 1, aS .9, aR 1.2, poly 6, spread .6, analog .25, l2shape 0, l2rate .2` · Route `M('lfo2', 'cutoff', .03)` · Chorus ENS · fx `{rev .5}`.
- **Lage / Rolle:** E3–E4 (52–64). LAGE-Klammer **C3–C5**. Akkord-Reaktion: **Fläche (Stimmführung)**.
- **Hörprobe** (120 BPM, f♯-Moll, i–VI–III–VII, enge Stimmführung, Takt 4 Öffnung nach oben):
```
Tempo 120 BPM · 4 Takte · Akkorde: F#m | D | A | E
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: F#3(54) 0/16/88 · A3(57) 0/16/88 · C#4(61) 0/16/88
T2: F#3(54) 16/12/90 · A3(57) 16/12/90 · D4(62) 16/12/90 · F#3(54) 28/4/72 · A3(57) 28/4/72 · D4(62) 28/4/72
T3: E3(52) 32/16/88 · A3(57) 32/16/88 · C#4(61) 32/16/88
T4: E3(52) 48/8/90 · Ab3(56) 48/8/90 · B3(59) 48/8/90 · E3(52) 56/8/96 · Ab3(56) 56/8/96 · B3(59) 56/8/96 · E4(64) 56/8/96
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,4,54,0.69],[0,4,57,0.69],[0,4,61,0.69],[4,3,54,0.71],[4,3,57,0.71],[4,3,62,0.71],[7,1,54,0.57],[7,1,57,0.57],[7,1,62,0.57],[8,4,52,0.69],[8,4,57,0.69],[8,4,61,0.69],[12,2,52,0.71],[12,2,56,0.71],[12,2,59,0.71],[14,2,52,0.76],[14,2,56,0.76],[14,2,59,0.76],[14,2,64,0.76]]`
- **Karte:** „Weiche, traurige Streicherfläche – erinnert an Hamburger Darkwave-Synthpop der 90er (Stil Wolfsheim).“

#### EB-17 „Nachtigall-Glocke“ – Rolle Lead · FM6 (neu)

- **Vorbild (ⓘ):** glockiger FM-Melodieklang über der Fläche (Stil; Gerät UNBELEGT).
- **Rezept (FM6):** `alg 5, fb 0` · OP1 `(1, 99, [95,30,20,45], [99,60,0,0], {vs 3})` · OP2 `(3, 78, [99,45,25,45], [99,30,0,0], {vs 5})` · OP3 `(1, 85, [95,35,20,45], [99,55,0,0], {det 5})` · OP4 `(14, 52, [99,70,40,45], [99,0,0,0], {vs 6})` · OP5/OP6 aus · common `{gain −14, poly 4}` · fx `{chorus:{mode:'I'}, dly .3, rev .45}` · bus `{echo:{mode:'pp', divL:'1/8.', fb .35}}`. Verwandt mit CJ1 (`vorbild-achtziger.md`), aber weicher (OP4 leiser, langsamere Raten).
- **Lage / Rolle:** E5–E6 (76–88). LAGE-Klammer **tief C5**. Akkord-Reaktion: **folgt der Oktave der Taste**. Spielt mit EB-16 zusammen.
- **Hörprobe** (120 BPM, gleiche Akkorde wie EB-16, eigene Melodie):
```
Tempo 120 BPM · 4 Takte · Akkorde: F#m | D | A | E
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: C#6(85) 0/4/104 · A5(81) 4/2/90 · F#5(78) 6/2/88 · A5(81) 8/6/98 · C#6(85) 14/2/92
T2: D6(86) 16/4/106 · C#6(85) 20/2/92 · A5(81) 22/2/88 · F#5(78) 24/8/96
T3: E5(76) 32/2/90 · A5(81) 34/2/92 · C#6(85) 36/4/102 · B5(83) 40/2/90 · A5(81) 42/2/88 · E6(88) 44/4/108
T4: D6(86) 48/4/104 · B5(83) 52/4/96 · Ab5(80) 56/2/90 · B5(83) 58/2/92 · E5(76) 60/4/100
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,1,85,0.82],[1,0.5,81,0.71],[1.5,0.5,78,0.69],[2,1.5,81,0.77],[3.5,0.5,85,0.72],[4,1,86,0.83],[5,0.5,85,0.72],[5.5,0.5,81,0.69],[6,2,78,0.76],[8,0.5,76,0.71],[8.5,0.5,81,0.72],[9,1,85,0.8],[10,0.5,83,0.71],[10.5,0.5,81,0.69],[11,1,88,0.85],[12,1,86,0.82],[13,1,83,0.76],[14,0.5,80,0.71],[14.5,0.5,83,0.72],[15,1,76,0.79]]`
- **Karte:** „Klare Glocken-Melodie über traurigen Streichern – erinnert an deutschen Darkwave-Pop der 90er (Stil Wolfsheim).“

### 3.7 Seabound (`vorbild: seabound`, neu)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Deutsches Electro-/Futurepop-Duo Frank M. Spinath und Martin Vorbrodt; Gründung **1995 oder 1996** (widersprüchlich) | WAHRSCHEINLICH (Wikipedia; Jahr widersprüchlich) | https://en.wikipedia.org/wiki/Seabound |
| Spinath: Texte und Programmierung, Vorbrodt: Programmierung und Sound (Album „Beyond Flatline“) | WAHRSCHEINLICH (Rezension Exclaim) | https://exclaim.ca/music/article/seabound-beyond_flatline |
| Labels Dependent und Metropolis; „Hooked“ (Remix) auf der Neuauflage 2004 von „No Sleep Demon“ | WAHRSCHEINLICH (Wikipedia) | https://en.wikipedia.org/wiki/Seabound |
| Geräte | UNBELEGT | – |

**Stil-Merkmale (eK, UNBELEGT):** ruhiger, „dunkler“ Futurepop, runde tiefe Bässe, viel Raum, 120–128 BPM.

#### EB-18 „Tiefsee-Bass“ – Rolle Bass · VA (neu)

- **Vorbild (ⓘ):** runder, tiefer Synkopen-Bass mit sanftem Pumpen (Stil; Gerät UNBELEGT).
- **Rezept:** `o1w 2, o2w 1, o2pw .5, o2lvl .35, subLvl .6, ftype 0, cutoff 500, res .15, kt .3, fenv .2, fA .002, fD .2, fS .3, fR .1, aA .002, aD .3, aS .8, aR .1, mode 2, poly 1, glide .02` · fx `{pump .35, pumpRel '1/8', rev .05}`.
- **Lage / Rolle:** F1–B♭2 (29–46). LAGE-Klammer **hoch C3**. Akkord-Reaktion: **nächstliegend, nie über C3**.
- **Hörprobe** (126 BPM, g-Moll, i–VI–III–VII, punktierte Achtel-Synkopen, Takt 4 Aufgang):
```
Tempo 126 BPM · 4 Takte · Akkorde: Gm | Eb | Bb | F
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: G1(31) 0/2/112 · G1(31) 3/1/100 · G1(31) 6/2/88 · G1(31) 9/1/88 · G2(43) 10/1/88 · G1(31) 12/1/88 · F2(41) 14/1/88
T2: Eb2(39) 16/2/112 · Eb2(39) 19/1/100 · Eb2(39) 22/2/88 · Eb2(39) 25/1/88 · Bb1(34) 26/1/88 · Eb2(39) 28/1/88 · Bb2(46) 30/1/88
T3: Bb1(34) 32/2/112 · Bb1(34) 35/1/100 · Bb1(34) 38/2/88 · Bb1(34) 41/1/88 · Bb2(46) 42/1/88 · Bb1(34) 44/1/88 · F2(41) 46/1/88
T4: F1(29) 48/2/112 · F1(29) 51/1/100 · F1(29) 54/2/88 · F2(41) 57/1/88 · F1(29) 58/1/88 · A1(33) 60/1/88 · C2(36) 62/1/88 · F2(41) 63/1/100
```
Dauer: alle 4 Takte 7,6 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,6 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,6 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.5,31,0.88],[0.75,0.25,31,0.79],[1.5,0.5,31,0.69],[2.25,0.25,31,0.69],[2.5,0.25,43,0.69],[3,0.25,31,0.69],[3.5,0.25,41,0.69],[4,0.5,39,0.88],[4.75,0.25,39,0.79],[5.5,0.5,39,0.69],[6.25,0.25,39,0.69],[6.5,0.25,34,0.69],[7,0.25,39,0.69],[7.5,0.25,46,0.69],[8,0.5,34,0.88],[8.75,0.25,34,0.79],[9.5,0.5,34,0.69],[10.25,0.25,34,0.69],[10.5,0.25,46,0.69],[11,0.25,34,0.69],[11.5,0.25,41,0.69],[12,0.5,29,0.88],[12.75,0.25,29,0.79],[13.5,0.5,29,0.69],[14.25,0.25,41,0.69],[14.5,0.25,29,0.69],[15,0.25,33,0.69],[15.5,0.25,36,0.69],[15.75,0.25,41,0.79]]`
- **Karte:** „Runder, tiefer Synkopen-Bass mit viel Luft – erinnert an deutschen Dark-Futurepop der 2000er (Stil Seabound).“

### 3.8 Rotersand (`vorbild: rotersand`, neu)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Rascal Nikov, Krischan Jan-Eric Wesenberg, Gun (Günther Gerl); EP „Merging Oceans“ (Frühjahr 2003) mit weltweiter Aufmerksamkeit | WAHRSCHEINLICH (Wikipedia/last.fm) | https://en.wikipedia.org/wiki/Rotersand · https://last.fm/music/Rotersand/+wiki |
| Wesenberg: seit 2003 vor allem Sounddesign in Bands und Produzent für andere | **BELEGT** (Primärquelle, Interview Side-Line 2024, SE) | https://side-line.com/?p=17940 |
| Geräte | UNBELEGT | – |

**Stil-Merkmale (eK, UNBELEGT):** Futurepop mit Trance-Stabs, 130–138 BPM, hymnische Refrains, Supersaw-Akkorde mit Echo und Pumpen.

#### EB-19 „Leuchtturm-Stab“ – Rolle Akkord/Stab · VA (neu)

- **Vorbild (ⓘ):** kurzer, breiter Supersaw-Akkordstab im Trance-Rhythmus (Stil; Gerät UNBELEGT).
- **Rezept:** `o1w 0, o1uni 7, uniDet .32, uniMix .7, uniWidth 1, ftype 0, cutoff 2200, res .15, kt .4, fenv .3, fA .001, fD .18, fS .25, fR .15, aA .001, aD .25, aS .3, aR .2, poly 6, spread .7` · Chorus I+II · bus `{echo:{mode:'pp', divL:'1/8.', fb .35}}` · fx `{pump .35, pumpRel '1/8', dly .25, rev .3}`. Nah am Werks-Sound „Supersaw-Hymne“, aber kurz (Stab statt Lead).
- **Lage / Rolle:** A3–G4 (57–67). LAGE-Klammer **G3–C5**. Akkord-Reaktion: **Block (Sequenz)**.
- **Hörprobe** (134 BPM, h-Moll, vier Rhythmus-Varianten, Takt 8 F♯-Dur durchgehend 8tel):
```
Tempo 134 BPM · 8 Takte · Akkorde: Bm | G | D | A | Bm | G | Em | F#
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: B3(59) 2/1/104 · D4(62) 2/1/104 · F#4(66) 2/1/104 · B3(59) 6/1/104 · D4(62) 6/1/104 · F#4(66) 6/1/104 · B3(59) 10/1/104 · D4(62) 10/1/104 · F#4(66) 10/1/104 · B3(59) 14/1/104 · D4(62) 14/1/104 · F#4(66) 14/1/104
T2: B3(59) 16/1/90 · D4(62) 16/1/90 · G4(67) 16/1/90 · B3(59) 19/1/90 · D4(62) 19/1/90 · G4(67) 19/1/90 · B3(59) 22/1/104 · D4(62) 22/1/104 · G4(67) 22/1/104 · B3(59) 26/1/104 · D4(62) 26/1/104 · G4(67) 26/1/104 · B3(59) 28/1/90 · D4(62) 28/1/90 · G4(67) 28/1/90 · B3(59) 30/1/104 · D4(62) 30/1/104 · G4(67) 30/1/104
T3: A3(57) 34/1/104 · D4(62) 34/1/104 · F#4(66) 34/1/104 · A3(57) 38/1/104 · D4(62) 38/1/104 · F#4(66) 38/1/104 · A3(57) 42/1/104 · D4(62) 42/1/104 · F#4(66) 42/1/104 · A3(57) 46/1/104 · D4(62) 46/1/104 · F#4(66) 46/1/104
T4: A3(57) 50/1/104 · C#4(61) 50/1/104 · E4(64) 50/1/104 · A3(57) 53/1/90 · C#4(61) 53/1/90 · E4(64) 53/1/90 · A3(57) 56/1/90 · C#4(61) 56/1/90 · E4(64) 56/1/90 · A3(57) 59/1/90 · C#4(61) 59/1/90 · E4(64) 59/1/90 · A3(57) 62/1/104 · C#4(61) 62/1/104 · E4(64) 62/1/104
T5: B3(59) 64/1/90 · D4(62) 64/1/90 · F#4(66) 64/1/90 · B3(59) 67/1/90 · D4(62) 67/1/90 · F#4(66) 67/1/90 · B3(59) 70/1/104 · D4(62) 70/1/104 · F#4(66) 70/1/104 · B3(59) 74/1/104 · D4(62) 74/1/104 · F#4(66) 74/1/104 · B3(59) 76/1/90 · D4(62) 76/1/90 · F#4(66) 76/1/90 · B3(59) 78/1/104 · D4(62) 78/1/104 · F#4(66) 78/1/104
T6: B3(59) 82/1/104 · D4(62) 82/1/104 · G4(67) 82/1/104 · B3(59) 86/1/104 · D4(62) 86/1/104 · G4(67) 86/1/104 · B3(59) 90/1/104 · D4(62) 90/1/104 · G4(67) 90/1/104 · B3(59) 94/1/104 · D4(62) 94/1/104 · G4(67) 94/1/104
T7: B3(59) 98/1/104 · E4(64) 98/1/104 · G4(67) 98/1/104 · B3(59) 101/1/90 · E4(64) 101/1/90 · G4(67) 101/1/90 · B3(59) 104/1/90 · E4(64) 104/1/90 · G4(67) 104/1/90 · B3(59) 107/1/90 · E4(64) 107/1/90 · G4(67) 107/1/90 · B3(59) 110/1/104 · E4(64) 110/1/104 · G4(67) 110/1/104
T8: Bb3(58) 112/1/92 · C#4(61) 112/1/92 · F#4(66) 112/1/92 · Bb3(58) 114/1/95 · C#4(61) 114/1/95 · F#4(66) 114/1/95 · Bb3(58) 116/1/98 · C#4(61) 116/1/98 · F#4(66) 116/1/98 · Bb3(58) 118/1/101 · C#4(61) 118/1/101 · F#4(66) 118/1/101 · Bb3(58) 120/1/104 · C#4(61) 120/1/104 · F#4(66) 120/1/104 · Bb3(58) 122/1/107 · C#4(61) 122/1/107 · F#4(66) 122/1/107 · Bb3(58) 124/2/110 · C#4(61) 124/2/110 · F#4(66) 124/2/110 · Bb3(58) 126/2/113 · C#4(61) 126/2/113 · F#4(66) 126/2/113
```
Dauer: alle 8 Takte 14,3 s · kurz (≤ 8 s) T1, T2, T3, T8 = 7,2 s · ganz (≤ 16 s) T1, T2, T3, T4, T5, T6, T7, T8 = 14,3 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0.5,0.25,59,0.82],[0.5,0.25,62,0.82],[0.5,0.25,66,0.82],[1.5,0.25,59,0.82],[1.5,0.25,62,0.82],[1.5,0.25,66,0.82],[2.5,0.25,59,0.82],[2.5,0.25,62,0.82],[2.5,0.25,66,0.82],[3.5,0.25,59,0.82],[3.5,0.25,62,0.82],[3.5,0.25,66,0.82],[4,0.25,59,0.71],[4,0.25,62,0.71],[4,0.25,67,0.71],[4.75,0.25,59,0.71],[4.75,0.25,62,0.71],[4.75,0.25,67,0.71],[5.5,0.25,59,0.82],[5.5,0.25,62,0.82],[5.5,0.25,67,0.82],[6.5,0.25,59,0.82],[6.5,0.25,62,0.82],[6.5,0.25,67,0.82],[7,0.25,59,0.71],[7,0.25,62,0.71],[7,0.25,67,0.71],[7.5,0.25,59,0.82],[7.5,0.25,62,0.82],[7.5,0.25,67,0.82],[8.5,0.25,57,0.82],[8.5,0.25,62,0.82],[8.5,0.25,66,0.82],[9.5,0.25,57,0.82],[9.5,0.25,62,0.82],[9.5,0.25,66,0.82],[10.5,0.25,57,0.82],[10.5,0.25,62,0.82],[10.5,0.25,66,0.82],[11.5,0.25,57,0.82],[11.5,0.25,62,0.82],[11.5,0.25,66,0.82],[12,0.25,58,0.72],[12,0.25,61,0.72],[12,0.25,66,0.72],[12.5,0.25,58,0.75],[12.5,0.25,61,0.75],[12.5,0.25,66,0.75],[13,0.25,58,0.77],[13,0.25,61,0.77],[13,0.25,66,0.77],[13.5,0.25,58,0.8],[13.5,0.25,61,0.8],[13.5,0.25,66,0.8],[14,0.25,58,0.82],[14,0.25,61,0.82],[14,0.25,66,0.82],[14.5,0.25,58,0.84],[14.5,0.25,61,0.84],[14.5,0.25,66,0.84],[15,0.5,58,0.87],[15,0.5,61,0.87],[15,0.5,66,0.87],[15.5,0.5,58,0.89],[15.5,0.5,61,0.89],[15.5,0.5,66,0.89]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 8`): `[[0.5,0.25,59,0.82],[0.5,0.25,62,0.82],[0.5,0.25,66,0.82],[1.5,0.25,59,0.82],[1.5,0.25,62,0.82],[1.5,0.25,66,0.82],[2.5,0.25,59,0.82],[2.5,0.25,62,0.82],[2.5,0.25,66,0.82],[3.5,0.25,59,0.82],[3.5,0.25,62,0.82],[3.5,0.25,66,0.82],[4,0.25,59,0.71],[4,0.25,62,0.71],[4,0.25,67,0.71],[4.75,0.25,59,0.71],[4.75,0.25,62,0.71],[4.75,0.25,67,0.71],[5.5,0.25,59,0.82],[5.5,0.25,62,0.82],[5.5,0.25,67,0.82],[6.5,0.25,59,0.82],[6.5,0.25,62,0.82],[6.5,0.25,67,0.82],[7,0.25,59,0.71],[7,0.25,62,0.71],[7,0.25,67,0.71],[7.5,0.25,59,0.82],[7.5,0.25,62,0.82],[7.5,0.25,67,0.82],[8.5,0.25,57,0.82],[8.5,0.25,62,0.82],[8.5,0.25,66,0.82],[9.5,0.25,57,0.82],[9.5,0.25,62,0.82],[9.5,0.25,66,0.82],[10.5,0.25,57,0.82],[10.5,0.25,62,0.82],[10.5,0.25,66,0.82],[11.5,0.25,57,0.82],[11.5,0.25,62,0.82],[11.5,0.25,66,0.82],[12.5,0.25,57,0.82],[12.5,0.25,61,0.82],[12.5,0.25,64,0.82],[13.25,0.25,57,0.71],[13.25,0.25,61,0.71],[13.25,0.25,64,0.71],[14,0.25,57,0.71],[14,0.25,61,0.71],[14,0.25,64,0.71],[14.75,0.25,57,0.71],[14.75,0.25,61,0.71],[14.75,0.25,64,0.71],[15.5,0.25,57,0.82],[15.5,0.25,61,0.82],[15.5,0.25,64,0.82],[16,0.25,59,0.71],[16,0.25,62,0.71],[16,0.25,66,0.71],[16.75,0.25,59,0.71],[16.75,0.25,62,0.71],[16.75,0.25,66,0.71],[17.5,0.25,59,0.82],[17.5,0.25,62,0.82],[17.5,0.25,66,0.82],[18.5,0.25,59,0.82],[18.5,0.25,62,0.82],[18.5,0.25,66,0.82],[19,0.25,59,0.71],[19,0.25,62,0.71],[19,0.25,66,0.71],[19.5,0.25,59,0.82],[19.5,0.25,62,0.82],[19.5,0.25,66,0.82],[20.5,0.25,59,0.82],[20.5,0.25,62,0.82],[20.5,0.25,67,0.82],[21.5,0.25,59,0.82],[21.5,0.25,62,0.82],[21.5,0.25,67,0.82],[22.5,0.25,59,0.82],[22.5,0.25,62,0.82],[22.5,0.25,67,0.82],[23.5,0.25,59,0.82],[23.5,0.25,62,0.82],[23.5,0.25,67,0.82],[24.5,0.25,59,0.82],[24.5,0.25,64,0.82],[24.5,0.25,67,0.82],[25.25,0.25,59,0.71],[25.25,0.25,64,0.71],[25.25,0.25,67,0.71],[26,0.25,59,0.71],[26,0.25,64,0.71],[26,0.25,67,0.71],[26.75,0.25,59,0.71],[26.75,0.25,64,0.71],[26.75,0.25,67,0.71],[27.5,0.25,59,0.82],[27.5,0.25,64,0.82],[27.5,0.25,67,0.82],[28,0.25,58,0.72],[28,0.25,61,0.72],[28,0.25,66,0.72],[28.5,0.25,58,0.75],[28.5,0.25,61,0.75],[28.5,0.25,66,0.75],[29,0.25,58,0.77],[29,0.25,61,0.77],[29,0.25,66,0.77],[29.5,0.25,58,0.8],[29.5,0.25,61,0.8],[29.5,0.25,66,0.8],[30,0.25,58,0.82],[30,0.25,61,0.82],[30,0.25,66,0.82],[30.5,0.25,58,0.84],[30.5,0.25,61,0.84],[30.5,0.25,66,0.84],[31,0.5,58,0.87],[31,0.5,61,0.87],[31,0.5,66,0.87],[31.5,0.5,58,0.89],[31.5,0.5,61,0.89],[31.5,0.5,66,0.89]]`
- **Karte:** „Breite Supersaw-Stabs mit Echo und Pumpen – erinnert an deutschen Futurepop um 2003 (Stil Rotersand).“

### 3.9 Solar Fake (`vorbild: solar-fake`, neu)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Berliner Projekt von Sven Friedrich (auch Zeraphine), gegründet 2007; Synthpop + Electro-Industrial | WAHRSCHEINLICH (Konzertportal) | https://goout.net/en/solar-fake/pzejgbg/ |
| Friedrich schreibt alle Songs, produziert im eigenen Studio „Rosa Falke“ und spielt im Studio alle Instrumente | WAHRSCHEINLICH (Künstler-Bio auf Bandsintown) | https://www.bandsintown.com/e/108047309 |
| Interview ReGen 2016 (Genre-Mischung, Name) | – (Geräte im Auszug nicht sichtbar) | https://regenmag.com/interviews/solar-fake-interview-episodes-of-electronic-mania/ |
| Geräte | UNBELEGT | – |

**Stil-Merkmale (eK, UNBELEGT):** Synthpop mit hartem, angezerrtem Lead, 120–128 BPM, Rock-Liedform.

#### EB-20 „Falschsonne-Lead“ – Rolle Lead · VA (neu)

- **Vorbild (ⓘ):** angezerrter, heller Säge-Lead mit Oktav-Schicht (Stil; Gerät UNBELEGT).
- **Rezept:** `o1w 0, o2w 0, o2oct 1, o2lvl .45, o2fine 6, ftype 0, cutoff 1800, res .3, drive .35, kt .5, fenv .3, fA .001, fD .25, fS .4, fR .15, aA .002, aD .3, aS .85, aR .15, mode 2, poly 1, glide .02` · fx `{drive .45, dly .2, rev .25}`.
- **Lage / Rolle:** C4–D5 (60–74). LAGE-Klammer **tief C4**. Akkord-Reaktion: **folgt der Oktave der Taste**.
- **Hörprobe** (124 BPM, c-Moll, i–VI–III–VII, kurze Rufe und Antworten, Takt 4 Aufschwung zum D):
```
Tempo 124 BPM · 4 Takte · Akkorde: Cm | Ab | Eb | Bb
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: G4(67) 0/2/104 · G4(67) 2/2/90 · Eb4(63) 4/2/92 · F4(65) 6/2/94 · G4(67) 8/4/102 · C5(72) 12/4/108
T2: Bb4(70) 16/2/100 · Ab4(68) 18/2/92 · G4(67) 20/2/92 · Eb4(63) 22/2/90 · C4(60) 24/6/98 · Eb4(63) 30/2/90
T3: G4(67) 32/2/102 · Bb4(70) 34/2/96 · G4(67) 36/2/92 · Eb4(63) 38/2/90 · Bb4(70) 40/4/104 · G4(67) 44/2/92 · F4(65) 46/2/90
T4: F4(65) 48/4/100 · D4(62) 52/2/90 · F4(65) 54/2/94 · Bb4(70) 56/6/106 · D5(74) 62/2/100
```
Dauer: alle 4 Takte 7,7 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,7 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,7 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.5,67,0.82],[0.5,0.5,67,0.71],[1,0.5,63,0.72],[1.5,0.5,65,0.74],[2,1,67,0.8],[3,1,72,0.85],[4,0.5,70,0.79],[4.5,0.5,68,0.72],[5,0.5,67,0.72],[5.5,0.5,63,0.71],[6,1.5,60,0.77],[7.5,0.5,63,0.71],[8,0.5,67,0.8],[8.5,0.5,70,0.76],[9,0.5,67,0.72],[9.5,0.5,63,0.71],[10,1,70,0.82],[11,0.5,67,0.72],[11.5,0.5,65,0.71],[12,1,65,0.79],[13,0.5,62,0.71],[13.5,0.5,65,0.74],[14,1.5,70,0.83],[15.5,0.5,74,0.79]]`
- **Karte:** „Angezerrter, heller Synth-Lead mit Rock-Biss – erinnert an Berliner Electro-Synthpop der 2010er (Stil Solar Fake).“

### 3.10 Diary of Dreams (`vorbild: diary-of-dreams`, neu)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Adrian Hates: klassisch ausgebildeter Gitarrist und Pianist, vorher Gitarrist bei Garden of Delight | WAHRSCHEINLICH (Wikipedia + Konzertportal im Auszug; zweite Quelle nicht eindeutig unabhängig) | https://en.wikipedia.org/wiki/Diary_of_Dreams · https://goout.net/cs/diary-of-dreams/pzgvkqf/ |
| Klang: orchestrale Kompositionen, intime Klavierteile, emotionale Stimme | WAHRSCHEINLICH (Label-/Portaltext) | https://www.metropolis-records.com/artist/diary-of-dreams |
| Produziert meist selbst; Label Accession Records | WAHRSCHEINLICH (Wikipedia) | https://en.wikipedia.org/wiki/Diary_of_Dreams |
| Geräte | UNBELEGT | – |

**Stil-Merkmale (eK, UNBELEGT):** langsame bis mittlere Tempi, Moll, gebrochene Klavierakkorde, Chorflächen, viel Hall.

#### EB-21 „Tagebuch-Klavier“ – Rolle Akkord/Arp · FM6 (neu)

- **Vorbild (ⓘ):** dunkles, weiches Synth-Klavier mit gebrochenen Akkorden (Spielweise „Klavier“ WAHRSCHEINLICH; Gerät UNBELEGT).
- **Rezept (FM6):** `alg 5, fb 0` · OP1 `(1, 99, [96,25,20,50], [99,70,0,0], {vs 4, rs 3})` · OP2 `(1, 80, [99,40,25,50], [99,40,0,0], {vs 6})` · OP3 `(1, 95, [95,30,20,50], [99,60,0,0], {det 3, rs 3})` · OP4 `(14, 50, [99,80,40,50], [99,0,0,0], {vs 7})` · OP5 `(1, 85, [94,28,20,50], [99,55,0,0], {det -3})` · OP6 `(1, 60, [99,50,30,50], [99,20,0,0], {vs 5})` · common `{gain −14, poly 8}` · fx `{rev .45}` · bus `{hall:{decay 4}}`.
- **Warum so:** Drei Paare 1:1 (leicht verstimmt) = Klavierkörper; ein kurzer 1:14-Anteil = Hammeranschlag.
- **Lage / Rolle:** G2–C♯5 (43–73). LAGE-Klammer **G2–D5**. Akkord-Reaktion: **Block (Sequenz)** – die Figur bleibt als Ganzes, Bass und Arpeggio wandern gemeinsam.
- **Hörprobe** (96 BPM, d-Moll, gebrochene Akkorde, Takt 4 A-Dur mit Septime aufwärts):
```
Tempo 96 BPM · 4 Takte · Akkorde: Dm | Bb | Gm | A
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D3(50) 0/8/84 · A3(57) 2/2/78 · D4(62) 4/2/84 · F4(65) 6/2/86 · A4(69) 8/2/92 · F4(65) 10/2/82 · D4(62) 12/2/80 · A3(57) 14/2/76
T2: Bb2(46) 16/8/84 · F3(53) 18/2/78 · Bb3(58) 20/2/82 · D4(62) 22/2/86 · F4(65) 24/4/94 · D4(62) 28/2/82 · Bb3(58) 30/2/78
T3: G2(43) 32/8/84 · D3(50) 34/2/78 · G3(55) 36/2/82 · Bb3(58) 38/2/86 · D4(62) 40/2/90 · G4(67) 42/2/94 · Bb4(70) 44/4/100
T4: A2(45) 48/8/86 · E3(52) 50/2/78 · A3(57) 52/2/82 · C#4(61) 54/2/88 · E4(64) 56/2/92 · G4(67) 58/2/96 · C#5(73) 60/4/102
```
Dauer: alle 4 Takte 10,0 s · kurz (≤ 8 s) T1, T2, T4 = 7,5 s · ganz (≤ 16 s) T1, T2, T3, T4 = 10,0 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,2,50,0.66],[0.5,0.5,57,0.61],[1,0.5,62,0.66],[1.5,0.5,65,0.68],[2,0.5,69,0.72],[2.5,0.5,65,0.65],[3,0.5,62,0.63],[3.5,0.5,57,0.6],[4,2,46,0.66],[4.5,0.5,53,0.61],[5,0.5,58,0.65],[5.5,0.5,62,0.68],[6,1,65,0.74],[7,0.5,62,0.65],[7.5,0.5,58,0.61],[8,2,45,0.68],[8.5,0.5,52,0.61],[9,0.5,57,0.65],[9.5,0.5,61,0.69],[10,0.5,64,0.72],[10.5,0.5,67,0.76],[11,1,73,0.8]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,2,50,0.66],[0.5,0.5,57,0.61],[1,0.5,62,0.66],[1.5,0.5,65,0.68],[2,0.5,69,0.72],[2.5,0.5,65,0.65],[3,0.5,62,0.63],[3.5,0.5,57,0.6],[4,2,46,0.66],[4.5,0.5,53,0.61],[5,0.5,58,0.65],[5.5,0.5,62,0.68],[6,1,65,0.74],[7,0.5,62,0.65],[7.5,0.5,58,0.61],[8,2,43,0.66],[8.5,0.5,50,0.61],[9,0.5,55,0.65],[9.5,0.5,58,0.68],[10,0.5,62,0.71],[10.5,0.5,67,0.74],[11,1,70,0.79],[12,2,45,0.68],[12.5,0.5,52,0.61],[13,0.5,57,0.65],[13.5,0.5,61,0.69],[14,0.5,64,0.72],[14.5,0.5,67,0.76],[15,1,73,0.8]]`
- **Karte:** „Dunkles Synth-Klavier mit gebrochenen Akkorden – erinnert an deutschen Darkwave der 2000er (Stil Diary of Dreams).“

#### EB-22 „Schattenchor“ – Rolle Fläche · WT (neu)

- **Vorbild (ⓘ):** dunkle, langsame Chorfläche (Stil; Gerät UNBELEGT).
- **Rezept (WT):** `{ftype 0, cutoff 1600, res .1, fenv .1, kt .3, fA .8, fD 1, fS .8, fR 1.5, aA .7, aD 1, aS .9, aR 2, poly 6, l2shape 0, l2rate .12, wt: {table 'vocal', pos .55, scan .2, scanTime 4}}` · mods `[['lfo2', 'cutoff', .03]]` · Chorus ENS · fx `{rev .6}` · bus `{hall:{decay 6}}`. Dunkler und langsamer als TT2 „Hauch-Chor“ (`vorbild-achtziger.md`).
- **Lage / Rolle:** A3–A4 (57–69). LAGE-Klammer **G3–C5**. Akkord-Reaktion: **Fläche (Stimmführung)**. Spielt mit EB-21 zusammen.
- **Hörprobe** (96 BPM, gleiche Akkorde wie EB-21):
```
Tempo 96 BPM · 4 Takte · Akkorde: Dm | Bb | Gm | A
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A3(57) 0/16/84 · D4(62) 0/16/84 · F4(65) 0/16/84
T2: Bb3(58) 16/16/86 · D4(62) 16/16/86 · F4(65) 16/16/86
T3: Bb3(58) 32/16/88 · D4(62) 32/16/88 · G4(67) 32/16/88
T4: A3(57) 48/8/90 · C#4(61) 48/8/90 · E4(64) 48/8/90 · A3(57) 56/8/96 · C#4(61) 56/8/96 · E4(64) 56/8/96 · A4(69) 56/8/96
```
Dauer: alle 4 Takte 10,0 s · kurz (≤ 8 s) T1, T2, T4 = 7,5 s · ganz (≤ 16 s) T1, T2, T3, T4 = 10,0 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,4,57,0.66],[0,4,62,0.66],[0,4,65,0.66],[4,4,58,0.68],[4,4,62,0.68],[4,4,65,0.68],[8,2,57,0.71],[8,2,61,0.71],[8,2,64,0.71],[10,2,57,0.76],[10,2,61,0.76],[10,2,64,0.76],[10,2,69,0.76]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,4,57,0.66],[0,4,62,0.66],[0,4,65,0.66],[4,4,58,0.68],[4,4,62,0.68],[4,4,65,0.68],[8,4,58,0.69],[8,4,62,0.69],[8,4,67,0.69],[12,2,57,0.71],[12,2,61,0.71],[12,2,64,0.71],[14,2,57,0.76],[14,2,61,0.76],[14,2,64,0.76],[14,2,69,0.76]]`
- **Karte:** „Dunkle, langsame Chorfläche – erinnert an orchestralen Darkwave (Stil Diary of Dreams).“

### 3.11 Blutengel (`vorbild: blutengel`, neu)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Gegründet von Sänger Chris Pohl (auch Terminal Choice, Tumor, Miss Construction; Label Fear Section) nach dem Ausstieg bei Seelenkrank | WAHRSCHEINLICH (Wikipedia) | https://en.wikipedia.org/wiki/Blutengel · https://en.wikipedia.org/wiki/Seelenkrank |
| Markenzeichen: eingängige Synth-Melodien, treibende Beats, symphonische Ausschmückung, mitreißende Refrains | WAHRSCHEINLICH (Rezension) | https://www.reflectionsofdarkness.com/artists-a-e/13283-cd-review-blutengel-monument |
| Geräte | UNBELEGT | – |

#### EB-23 „Blutmond-Orchester“ – Rolle Akkord/Stab · VA (neu)

- **Vorbild (ⓘ):** symphonische Synth-Streicher als 3-3-2-Stakkato (Stil; Gerät UNBELEGT).
- **Rezept:** `o1w 0, o1uni 3, uniDet .15, o2w 0, o2oct -1, o2lvl .5, ftype 1, cutoff 2000, res .1, kt .5, fenv .25, fA .002, fD .15, fS .3, fR .12, aA .004, aD .18, aS .3, aR .15, ampVel .6, poly 8, spread .6` · Chorus ENS · fx `{rev .45}` · bus `{hall:{decay 3.5}}`.
- **Lage / Rolle:** A♭3–F4 (56–65). LAGE-Klammer **G3–C5**. Akkord-Reaktion: **Block (Sequenz)**.
- **Hörprobe** (120 BPM, a-Moll, Akzente 3-3-2, Takt 4 E-Dur mit 16tel-Wirbel und Schluss-Akzent):
```
Tempo 120 BPM · 4 Takte · Akkorde: Am | F | Dm | E
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A3(57) 0/1/110 · C4(60) 0/1/110 · E4(64) 0/1/110 · A3(57) 2/1/80 · C4(60) 2/1/80 · E4(64) 2/1/80 · A3(57) 4/1/80 · C4(60) 4/1/80 · E4(64) 4/1/80 · A3(57) 6/1/110 · C4(60) 6/1/110 · E4(64) 6/1/110 · A3(57) 8/1/80 · C4(60) 8/1/80 · E4(64) 8/1/80 · A3(57) 10/1/80 · C4(60) 10/1/80 · E4(64) 10/1/80 · A3(57) 12/1/110 · C4(60) 12/1/110 · E4(64) 12/1/110 · A3(57) 14/1/80 · C4(60) 14/1/80 · E4(64) 14/1/80
T2: A3(57) 16/1/110 · C4(60) 16/1/110 · F4(65) 16/1/110 · A3(57) 18/1/80 · C4(60) 18/1/80 · F4(65) 18/1/80 · A3(57) 19/1/80 · C4(60) 19/1/80 · F4(65) 19/1/80 · A3(57) 22/1/110 · C4(60) 22/1/110 · F4(65) 22/1/110 · A3(57) 24/1/80 · C4(60) 24/1/80 · F4(65) 24/1/80 · A3(57) 26/1/80 · C4(60) 26/1/80 · F4(65) 26/1/80 · A3(57) 27/1/80 · C4(60) 27/1/80 · F4(65) 27/1/80 · A3(57) 30/1/80 · C4(60) 30/1/80 · F4(65) 30/1/80
T3: A3(57) 32/1/110 · D4(62) 32/1/110 · F4(65) 32/1/110 · A3(57) 35/1/80 · D4(62) 35/1/80 · F4(65) 35/1/80 · A3(57) 38/1/110 · D4(62) 38/1/110 · F4(65) 38/1/110 · A3(57) 40/1/80 · D4(62) 40/1/80 · F4(65) 40/1/80 · A3(57) 42/1/80 · D4(62) 42/1/80 · F4(65) 42/1/80 · A3(57) 44/1/110 · D4(62) 44/1/110 · F4(65) 44/1/110 · A3(57) 46/1/80 · D4(62) 46/1/80 · F4(65) 46/1/80
T4: Ab3(56) 48/1/84 · B3(59) 48/1/84 · E4(64) 48/1/84 · Ab3(56) 50/1/87 · B3(59) 50/1/87 · E4(64) 50/1/87 · Ab3(56) 52/1/90 · B3(59) 52/1/90 · E4(64) 52/1/90 · Ab3(56) 54/1/93 · B3(59) 54/1/93 · E4(64) 54/1/93 · Ab3(56) 56/1/96 · B3(59) 56/1/96 · E4(64) 56/1/96 · Ab3(56) 57/1/99 · B3(59) 57/1/99 · E4(64) 57/1/99 · Ab3(56) 58/1/102 · B3(59) 58/1/102 · E4(64) 58/1/102 · Ab3(56) 59/1/105 · B3(59) 59/1/105 · E4(64) 59/1/105 · Ab3(56) 60/4/116 · B3(59) 60/4/116 · E4(64) 60/4/116
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.25,57,0.87],[0,0.25,60,0.87],[0,0.25,64,0.87],[0.5,0.25,57,0.63],[0.5,0.25,60,0.63],[0.5,0.25,64,0.63],[1,0.25,57,0.63],[1,0.25,60,0.63],[1,0.25,64,0.63],[1.5,0.25,57,0.87],[1.5,0.25,60,0.87],[1.5,0.25,64,0.87],[2,0.25,57,0.63],[2,0.25,60,0.63],[2,0.25,64,0.63],[2.5,0.25,57,0.63],[2.5,0.25,60,0.63],[2.5,0.25,64,0.63],[3,0.25,57,0.87],[3,0.25,60,0.87],[3,0.25,64,0.87],[3.5,0.25,57,0.63],[3.5,0.25,60,0.63],[3.5,0.25,64,0.63],[4,0.25,57,0.87],[4,0.25,60,0.87],[4,0.25,65,0.87],[4.5,0.25,57,0.63],[4.5,0.25,60,0.63],[4.5,0.25,65,0.63],[4.75,0.25,57,0.63],[4.75,0.25,60,0.63],[4.75,0.25,65,0.63],[5.5,0.25,57,0.87],[5.5,0.25,60,0.87],[5.5,0.25,65,0.87],[6,0.25,57,0.63],[6,0.25,60,0.63],[6,0.25,65,0.63],[6.5,0.25,57,0.63],[6.5,0.25,60,0.63],[6.5,0.25,65,0.63],[6.75,0.25,57,0.63],[6.75,0.25,60,0.63],[6.75,0.25,65,0.63],[7.5,0.25,57,0.63],[7.5,0.25,60,0.63],[7.5,0.25,65,0.63],[8,0.25,57,0.87],[8,0.25,62,0.87],[8,0.25,65,0.87],[8.75,0.25,57,0.63],[8.75,0.25,62,0.63],[8.75,0.25,65,0.63],[9.5,0.25,57,0.87],[9.5,0.25,62,0.87],[9.5,0.25,65,0.87],[10,0.25,57,0.63],[10,0.25,62,0.63],[10,0.25,65,0.63],[10.5,0.25,57,0.63],[10.5,0.25,62,0.63],[10.5,0.25,65,0.63],[11,0.25,57,0.87],[11,0.25,62,0.87],[11,0.25,65,0.87],[11.5,0.25,57,0.63],[11.5,0.25,62,0.63],[11.5,0.25,65,0.63],[12,0.25,56,0.66],[12,0.25,59,0.66],[12,0.25,64,0.66],[12.5,0.25,56,0.69],[12.5,0.25,59,0.69],[12.5,0.25,64,0.69],[13,0.25,56,0.71],[13,0.25,59,0.71],[13,0.25,64,0.71],[13.5,0.25,56,0.73],[13.5,0.25,59,0.73],[13.5,0.25,64,0.73],[14,0.25,56,0.76],[14,0.25,59,0.76],[14,0.25,64,0.76],[14.25,0.25,56,0.78],[14.25,0.25,59,0.78],[14.25,0.25,64,0.78],[14.5,0.25,56,0.8],[14.5,0.25,59,0.8],[14.5,0.25,64,0.8],[14.75,0.25,56,0.83],[14.75,0.25,59,0.83],[14.75,0.25,64,0.83],[15,1,56,0.91],[15,1,59,0.91],[15,1,64,0.91]]`
- **Karte:** „Treibende Stakkato-Streicher wie ein kleines Orchester – erinnert an symphonischen Gothic-Synthpop (Stil Blutengel).“

### 3.12 Neuroticfish (`vorbild: neuroticfish`, neu)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Deutsches Futurepop-Projekt von Sascha Mario Klein; Einflüsse Skinny Puppy, Nine Inch Nails, The Cure, Depeche Mode | WAHRSCHEINLICH (Wikipedia) | https://en.wikipedia.org/wiki/Neuroticfish |
| Heute: Klein (Musik, Text, Gesang, Produktion) + Henning Verlage (Keyboards, Produktion) | WAHRSCHEINLICH (Band-Bandcamp; Primärseite, aber nur Besetzung) | https://neuroticfish.bandcamp.com/ |
| Album „Les Chansons Neurotiques“ (2002) mit „Velocity N2“ | WAHRSCHEINLICH (Wikipedia) | https://en.wikipedia.org/wiki/Les_Chansons_Neurotiques_(album) |
| Roland SH-101, Roland System-1, Bitwig, Cubase | WAHRSCHEINLICH-schwach (nur Equipboard) – **nicht** in ⓘ | https://equipboard.com/band/neuroticfish |

#### EB-24 „Nervenbass“ – Rolle Bass · VA (neu)

- **Vorbild (ⓘ):** knackiger Futurepop-16tel-Bass mit Lücken (Stil; Gerät UNBELEGT).
- **Rezept:** `o1w 0, o2w 1, o2pw .35, o2lvl .5, subLvl .3, ftype 0, cutoff 520, res .45, drive .2, kt .4, fenv .4, fvel .5, fA .001, fD .09, fS .05, fR .04, aA .001, aD .14, aS .55, aR .03, mode 1, poly 1, reset 1` · fx `{drive .25, pump .25, pumpRel '1/16'}`.
- **Lage / Rolle:** C2–E3 (36–52). LAGE-Klammer **hoch E3**. Akkord-Reaktion: **nächstliegend, nie über E3**.
- **Hörprobe** (130 BPM, e-Moll, Figur „R R – R R O – R“, Takt 4 D-Dur mit Leitton F♯):
```
Tempo 130 BPM · 4 Takte · Akkorde: Em | Em | C | D
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E2(40) 0/1/112 · E2(40) 1/1/80 · E2(40) 3/1/80 · E2(40) 4/1/112 · E3(52) 5/1/96 · E2(40) 7/1/80 · E2(40) 8/1/112 · E2(40) 9/1/80 · E2(40) 11/1/80 · E3(52) 12/1/112 · E2(40) 13/1/80 · D3(50) 14/1/80 · E2(40) 15/1/80
T2: E2(40) 16/1/112 · E2(40) 17/1/80 · E2(40) 19/1/80 · E2(40) 20/1/112 · E3(52) 21/1/96 · E2(40) 23/1/80 · E2(40) 24/1/112 · E2(40) 25/1/80 · E2(40) 27/1/80 · E3(52) 28/1/112 · B2(47) 30/1/80 · E3(52) 31/1/96
T3: C2(36) 32/1/112 · C2(36) 33/1/80 · C2(36) 35/1/80 · C2(36) 36/1/112 · C3(48) 37/1/96 · C2(36) 39/1/80 · C2(36) 40/1/112 · C2(36) 41/1/80 · C2(36) 43/1/80 · C3(48) 44/1/112 · C2(36) 45/1/80 · G2(43) 46/1/80 · C2(36) 47/1/80
T4: D2(38) 48/1/112 · D2(38) 49/1/80 · D2(38) 51/1/80 · D2(38) 52/1/112 · D3(50) 53/1/96 · D2(38) 55/1/80 · D3(50) 56/1/112 · D2(38) 57/1/80 · A2(45) 58/1/80 · D2(38) 59/1/80 · F#2(42) 60/1/112 · D2(38) 61/1/80 · D3(50) 62/1/96 · F#2(42) 63/1/80
```
Dauer: alle 4 Takte 7,4 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,4 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,4 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.25,40,0.88],[0.25,0.25,40,0.63],[0.75,0.25,40,0.63],[1,0.25,40,0.88],[1.25,0.25,52,0.76],[1.75,0.25,40,0.63],[2,0.25,40,0.88],[2.25,0.25,40,0.63],[2.75,0.25,40,0.63],[3,0.25,52,0.88],[3.25,0.25,40,0.63],[3.5,0.25,50,0.63],[3.75,0.25,40,0.63],[4,0.25,40,0.88],[4.25,0.25,40,0.63],[4.75,0.25,40,0.63],[5,0.25,40,0.88],[5.25,0.25,52,0.76],[5.75,0.25,40,0.63],[6,0.25,40,0.88],[6.25,0.25,40,0.63],[6.75,0.25,40,0.63],[7,0.25,52,0.88],[7.5,0.25,47,0.63],[7.75,0.25,52,0.76],[8,0.25,36,0.88],[8.25,0.25,36,0.63],[8.75,0.25,36,0.63],[9,0.25,36,0.88],[9.25,0.25,48,0.76],[9.75,0.25,36,0.63],[10,0.25,36,0.88],[10.25,0.25,36,0.63],[10.75,0.25,36,0.63],[11,0.25,48,0.88],[11.25,0.25,36,0.63],[11.5,0.25,43,0.63],[11.75,0.25,36,0.63],[12,0.25,38,0.88],[12.25,0.25,38,0.63],[12.75,0.25,38,0.63],[13,0.25,38,0.88],[13.25,0.25,50,0.76],[13.75,0.25,38,0.63],[14,0.25,50,0.88],[14.25,0.25,38,0.63],[14.5,0.25,45,0.63],[14.75,0.25,38,0.63],[15,0.25,42,0.88],[15.25,0.25,38,0.63],[15.5,0.25,50,0.76],[15.75,0.25,42,0.63]]`
- **Karte:** „Knackiger 16tel-Bass mit Lücken – erinnert an deutschen Futurepop um 2002 (Stil Neuroticfish).“

### 3.13 Beborn Beton (`vorbild: beborn-beton`, neu)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Deutsche Synthpop-Band, gegründet 1989, Debütalbum 1993 | WAHRSCHEINLICH (Wikipedia) | https://en.wikipedia.org/wiki/Beborn_Beton |
| Stefan „Till“ Tillmann (Komposition, Synths, Drums), Michael B. Wagner (Komposition, Synths), Stefan Netschio (Text, Gesang) | **BELEGT** (Wikipedia + heavymetal.ch) | wie oben · https://www.heavymetal.ch/artists/5400/index.html |
| Interviews ReGen 2015 („A Worthy Compensation“, Technikwandel) und 2023 („Darkness Falls Again“) | – (Geräte im Auszug nicht sichtbar) | https://regenmag.com/?p=16179 · https://regenmag.com/interviews/interview-beborn-beton-inflamed-by-idiocracy/ |
| Geräte | UNBELEGT | – |

#### EB-25 „Beton-Brass“ – Rolle Akkord/Stab · VA (neu)

- **Vorbild (ⓘ):** warmer Analog-Brass-Akkord, synkopiert (Stil 90er-Synthpop; Gerät UNBELEGT).
- **Rezept:** `o1w 0, o2w 0, o2fine 10, o2lvl .85, ftype 0, cutoff 900, res .12, kt .5, fenv .38, fA .03, fD .35, fS .4, fR .2, aA .01, aD .4, aS .75, aR .18, ampVel .5, poly 6, spread .5, analog .25` · Chorus I · fx `{rev .3}`.
- **Lage / Rolle:** G3–F4 (55–65). LAGE-Klammer **G3–C5**. Akkord-Reaktion: **Block (Sequenz)**.
- **Hörprobe** (120 BPM, C-Dur, I–vi–IV–V, 3-3-2-Synkopen, Takt 4 Schluss-Akzent):
```
Tempo 120 BPM · 4 Takte · Akkorde: C | Am | F | G
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: G3(55) 0/3/108 · C4(60) 0/3/108 · E4(64) 0/3/108 · G3(55) 3/3/94 · C4(60) 3/3/94 · E4(64) 3/3/94 · G3(55) 6/2/98 · C4(60) 6/2/98 · E4(64) 6/2/98 · G3(55) 10/2/94 · C4(60) 10/2/94 · E4(64) 10/2/94 · G3(55) 12/4/104 · C4(60) 12/4/104 · E4(64) 12/4/104
T2: A3(57) 16/3/108 · C4(60) 16/3/108 · E4(64) 16/3/108 · A3(57) 19/3/94 · C4(60) 19/3/94 · E4(64) 19/3/94 · A3(57) 22/4/100 · C4(60) 22/4/100 · E4(64) 22/4/100 · A3(57) 28/2/92 · C4(60) 28/2/92 · E4(64) 28/2/92 · A3(57) 30/2/96 · C4(60) 30/2/96 · E4(64) 30/2/96
T3: A3(57) 32/3/108 · C4(60) 32/3/108 · F4(65) 32/3/108 · A3(57) 35/3/94 · C4(60) 35/3/94 · F4(65) 35/3/94 · A3(57) 38/2/96 · C4(60) 38/2/96 · F4(65) 38/2/96 · A3(57) 40/2/92 · C4(60) 40/2/92 · F4(65) 40/2/92 · A3(57) 42/6/104 · C4(60) 42/6/104 · F4(65) 42/6/104
T4: G3(55) 48/3/108 · B3(59) 48/3/108 · D4(62) 48/3/108 · G3(55) 51/3/94 · B3(59) 51/3/94 · D4(62) 51/3/94 · G3(55) 54/2/96 · B3(59) 54/2/96 · D4(62) 54/2/96 · G3(55) 56/4/102 · B3(59) 56/4/102 · D4(62) 56/4/102 · G3(55) 60/2/96 · B3(59) 60/2/96 · D4(62) 60/2/96 · G3(55) 62/2/110 · B3(59) 62/2/110 · D4(62) 62/2/110
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.75,55,0.85],[0,0.75,60,0.85],[0,0.75,64,0.85],[0.75,0.75,55,0.74],[0.75,0.75,60,0.74],[0.75,0.75,64,0.74],[1.5,0.5,55,0.77],[1.5,0.5,60,0.77],[1.5,0.5,64,0.77],[2.5,0.5,55,0.74],[2.5,0.5,60,0.74],[2.5,0.5,64,0.74],[3,1,55,0.82],[3,1,60,0.82],[3,1,64,0.82],[4,0.75,57,0.85],[4,0.75,60,0.85],[4,0.75,64,0.85],[4.75,0.75,57,0.74],[4.75,0.75,60,0.74],[4.75,0.75,64,0.74],[5.5,1,57,0.79],[5.5,1,60,0.79],[5.5,1,64,0.79],[7,0.5,57,0.72],[7,0.5,60,0.72],[7,0.5,64,0.72],[7.5,0.5,57,0.76],[7.5,0.5,60,0.76],[7.5,0.5,64,0.76],[8,0.75,57,0.85],[8,0.75,60,0.85],[8,0.75,65,0.85],[8.75,0.75,57,0.74],[8.75,0.75,60,0.74],[8.75,0.75,65,0.74],[9.5,0.5,57,0.76],[9.5,0.5,60,0.76],[9.5,0.5,65,0.76],[10,0.5,57,0.72],[10,0.5,60,0.72],[10,0.5,65,0.72],[10.5,1.5,57,0.82],[10.5,1.5,60,0.82],[10.5,1.5,65,0.82],[12,0.75,55,0.85],[12,0.75,59,0.85],[12,0.75,62,0.85],[12.75,0.75,55,0.74],[12.75,0.75,59,0.74],[12.75,0.75,62,0.74],[13.5,0.5,55,0.76],[13.5,0.5,59,0.76],[13.5,0.5,62,0.76],[14,1,55,0.8],[14,1,59,0.8],[14,1,62,0.8],[15,0.5,55,0.76],[15,0.5,59,0.76],[15,0.5,62,0.76],[15.5,0.5,55,0.87],[15.5,0.5,59,0.87],[15.5,0.5,62,0.87]]`
- **Karte:** „Warme, synkopierte Brass-Akkorde – erinnert an deutschen Synthpop der 90er (Stil Beborn Beton).“

### 3.14 Iris (`vorbild: iris`, neu)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| US-Synthpop, 1993 gegründet von Reagan Jones und Mat Morris; später Andrew Sega statt Morris; Duo 2001–2021 | WAHRSCHEINLICH (Wikipedia) | https://en.wikipedia.org/wiki/Iris_(American_band) |
| Sega: Keyboards, Gitarren, Programmierung, Produktion („Radiant“) | WAHRSCHEINLICH (Wikipedia) | https://en.wikipedia.org/wiki/Radiant_(Iris_album) |
| Sega: kommt aus 90er-Alternative und 2000er-IDM, Vorbilder Underworld, Orbital; wollte den Klang moderner machen | **BELEGT** (Primärquelle, Interview 2019, SE) | https://regenmag.com/?p=38814 |
| Geräte | UNBELEGT | – |

#### EB-26 „Glanz-Arp“ – Rolle Sequenz · VA (neu)

- **Vorbild (ⓘ):** heller, gläserner Arp mit 3er-Gruppen gegen den Takt und Echo (IDM-Einfluss BELEGT; Gerät UNBELEGT).
- **Rezept:** `o1w 1, o1pw .2, o2w 0, o2oct 1, o2lvl .3, ftype 1, cutoff 3500, res .2, kt .6, fenv .3, fA .001, fD .09, fS 0, fR .08, aA .001, aD .12, aS 0, aR .1, poly 4, spread .5, l2shape 1, l2sync 8` · Route `M('lfo2', 'cutoff', .05)` · bus `{echo:{mode:'pp', divL:'1/16.', fb .35}}` · fx `{dly .35, rev .3}`.
- **Lage / Rolle:** C♯5–B5 (73–83). LAGE-Klammer **A4–D6**. Akkord-Reaktion: **nächstliegend, Gleichstand aufwärts**.
- **Hörprobe** (126 BPM, D-Dur, I–vi–IV–V, 3-Ton-Zelle läuft über 16tel und verschiebt sich, Lücken wechseln, Schluss auf gehaltenem A):
```
Tempo 126 BPM · 8 Takte · Akkorde: D | Bm | G | A | D | Bm | Em | A
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D5(74) 0/1/100 · F#5(78) 1/1/80 · A5(81) 2/1/80 · D5(74) 3/1/100 · F#5(78) 4/1/80 · A5(81) 5/1/80 · D5(74) 6/1/100 · F#5(78) 7/1/80 · A5(81) 8/1/80 · D5(74) 9/1/100 · F#5(78) 10/1/80 · A5(81) 11/1/80 · D5(74) 12/1/100 · F#5(78) 13/1/80 · A5(81) 14/1/80 · D5(74) 15/1/100
T2: F#5(78) 16/1/100 · B5(83) 17/1/80 · D5(74) 18/1/80 · B5(83) 20/1/80 · D5(74) 21/1/80 · F#5(78) 22/1/100 · B5(83) 23/1/80 · D5(74) 24/1/80 · F#5(78) 25/1/100 · D5(74) 27/1/80 · F#5(78) 28/1/100 · B5(83) 29/1/80 · D5(74) 30/1/80 · F#5(78) 31/1/100
T3: B5(83) 32/1/100 · D5(74) 33/1/80 · G5(79) 34/1/80 · B5(83) 35/1/100 · D5(74) 36/1/80 · G5(79) 37/1/80 · D5(74) 39/1/80 · G5(79) 40/1/80 · B5(83) 41/1/100 · D5(74) 42/1/80 · G5(79) 43/1/80 · B5(83) 44/1/100 · G5(79) 46/1/80 · B5(83) 47/1/100
T4: C#5(73) 48/1/100 · E5(76) 49/1/80 · C#5(73) 51/1/100 · E5(76) 52/1/80 · A5(81) 53/1/80 · C#5(73) 54/1/100 · E5(76) 55/1/80 · C#5(73) 57/1/100 · E5(76) 58/1/80 · A5(81) 59/1/80 · C#5(73) 60/1/100 · E5(76) 61/1/80 · A5(81) 62/1/80 · C#5(73) 63/1/100
T5: F#5(78) 64/1/100 · A5(81) 65/1/80 · D5(74) 66/1/80 · F#5(78) 67/1/100 · A5(81) 68/1/80 · D5(74) 69/1/80 · F#5(78) 70/1/100 · A5(81) 71/1/80 · D5(74) 72/1/80 · F#5(78) 73/1/100 · A5(81) 74/1/80 · D5(74) 75/1/80 · F#5(78) 76/1/100 · A5(81) 77/1/80 · D5(74) 78/1/80 · F#5(78) 79/1/100
T6: B5(83) 80/1/100 · D5(74) 81/1/80 · F#5(78) 82/1/80 · D5(74) 84/1/80 · F#5(78) 85/1/80 · B5(83) 86/1/100 · D5(74) 87/1/80 · F#5(78) 88/1/80 · B5(83) 89/1/100 · F#5(78) 91/1/80 · B5(83) 92/1/100 · D5(74) 93/1/80 · F#5(78) 94/1/80 · B5(83) 95/1/100
T7: E5(76) 96/1/100 · G5(79) 97/1/80 · B5(83) 98/1/80 · E5(76) 99/1/100 · G5(79) 100/1/80 · B5(83) 101/1/80 · G5(79) 103/1/80 · B5(83) 104/1/80 · E5(76) 105/1/100 · G5(79) 106/1/80 · B5(83) 107/1/80 · E5(76) 108/1/100 · B5(83) 110/1/80 · E5(76) 111/1/100
T8: E5(76) 112/1/100 · A5(81) 113/1/80 · E5(76) 115/1/100 · A5(81) 116/1/80 · C#5(73) 117/1/80 · E5(76) 118/1/100 · A5(81) 119/1/80 · E5(76) 121/1/100 · A5(81) 122/1/80 · C#5(73) 123/1/80 · A5(81) 124/4/104
```
Dauer: alle 8 Takte 15,2 s · kurz (≤ 8 s) T1, T2, T3, T8 = 7,6 s · ganz (≤ 16 s) T1, T2, T3, T4, T5, T6, T7, T8 = 15,2 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.25,74,0.79],[0.25,0.25,78,0.63],[0.5,0.25,81,0.63],[0.75,0.25,74,0.79],[1,0.25,78,0.63],[1.25,0.25,81,0.63],[1.5,0.25,74,0.79],[1.75,0.25,78,0.63],[2,0.25,81,0.63],[2.25,0.25,74,0.79],[2.5,0.25,78,0.63],[2.75,0.25,81,0.63],[3,0.25,74,0.79],[3.25,0.25,78,0.63],[3.5,0.25,81,0.63],[3.75,0.25,74,0.79],[4,0.25,78,0.79],[4.25,0.25,83,0.63],[4.5,0.25,74,0.63],[5,0.25,83,0.63],[5.25,0.25,74,0.63],[5.5,0.25,78,0.79],[5.75,0.25,83,0.63],[6,0.25,74,0.63],[6.25,0.25,78,0.79],[6.75,0.25,74,0.63],[7,0.25,78,0.79],[7.25,0.25,83,0.63],[7.5,0.25,74,0.63],[7.75,0.25,78,0.79],[8,0.25,83,0.79],[8.25,0.25,74,0.63],[8.5,0.25,79,0.63],[8.75,0.25,83,0.79],[9,0.25,74,0.63],[9.25,0.25,79,0.63],[9.75,0.25,74,0.63],[10,0.25,79,0.63],[10.25,0.25,83,0.79],[10.5,0.25,74,0.63],[10.75,0.25,79,0.63],[11,0.25,83,0.79],[11.5,0.25,79,0.63],[11.75,0.25,83,0.79],[12,0.25,76,0.79],[12.25,0.25,81,0.63],[12.75,0.25,76,0.79],[13,0.25,81,0.63],[13.25,0.25,73,0.63],[13.5,0.25,76,0.79],[13.75,0.25,81,0.63],[14.25,0.25,76,0.79],[14.5,0.25,81,0.63],[14.75,0.25,73,0.63],[15,1,81,0.82]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 8`): `[[0,0.25,74,0.79],[0.25,0.25,78,0.63],[0.5,0.25,81,0.63],[0.75,0.25,74,0.79],[1,0.25,78,0.63],[1.25,0.25,81,0.63],[1.5,0.25,74,0.79],[1.75,0.25,78,0.63],[2,0.25,81,0.63],[2.25,0.25,74,0.79],[2.5,0.25,78,0.63],[2.75,0.25,81,0.63],[3,0.25,74,0.79],[3.25,0.25,78,0.63],[3.5,0.25,81,0.63],[3.75,0.25,74,0.79],[4,0.25,78,0.79],[4.25,0.25,83,0.63],[4.5,0.25,74,0.63],[5,0.25,83,0.63],[5.25,0.25,74,0.63],[5.5,0.25,78,0.79],[5.75,0.25,83,0.63],[6,0.25,74,0.63],[6.25,0.25,78,0.79],[6.75,0.25,74,0.63],[7,0.25,78,0.79],[7.25,0.25,83,0.63],[7.5,0.25,74,0.63],[7.75,0.25,78,0.79],[8,0.25,83,0.79],[8.25,0.25,74,0.63],[8.5,0.25,79,0.63],[8.75,0.25,83,0.79],[9,0.25,74,0.63],[9.25,0.25,79,0.63],[9.75,0.25,74,0.63],[10,0.25,79,0.63],[10.25,0.25,83,0.79],[10.5,0.25,74,0.63],[10.75,0.25,79,0.63],[11,0.25,83,0.79],[11.5,0.25,79,0.63],[11.75,0.25,83,0.79],[12,0.25,73,0.79],[12.25,0.25,76,0.63],[12.75,0.25,73,0.79],[13,0.25,76,0.63],[13.25,0.25,81,0.63],[13.5,0.25,73,0.79],[13.75,0.25,76,0.63],[14.25,0.25,73,0.79],[14.5,0.25,76,0.63],[14.75,0.25,81,0.63],[15,0.25,73,0.79],[15.25,0.25,76,0.63],[15.5,0.25,81,0.63],[15.75,0.25,73,0.79],[16,0.25,78,0.79],[16.25,0.25,81,0.63],[16.5,0.25,74,0.63],[16.75,0.25,78,0.79],[17,0.25,81,0.63],[17.25,0.25,74,0.63],[17.5,0.25,78,0.79],[17.75,0.25,81,0.63],[18,0.25,74,0.63],[18.25,0.25,78,0.79],[18.5,0.25,81,0.63],[18.75,0.25,74,0.63],[19,0.25,78,0.79],[19.25,0.25,81,0.63],[19.5,0.25,74,0.63],[19.75,0.25,78,0.79],[20,0.25,83,0.79],[20.25,0.25,74,0.63],[20.5,0.25,78,0.63],[21,0.25,74,0.63],[21.25,0.25,78,0.63],[21.5,0.25,83,0.79],[21.75,0.25,74,0.63],[22,0.25,78,0.63],[22.25,0.25,83,0.79],[22.75,0.25,78,0.63],[23,0.25,83,0.79],[23.25,0.25,74,0.63],[23.5,0.25,78,0.63],[23.75,0.25,83,0.79],[24,0.25,76,0.79],[24.25,0.25,79,0.63],[24.5,0.25,83,0.63],[24.75,0.25,76,0.79],[25,0.25,79,0.63],[25.25,0.25,83,0.63],[25.75,0.25,79,0.63],[26,0.25,83,0.63],[26.25,0.25,76,0.79],[26.5,0.25,79,0.63],[26.75,0.25,83,0.63],[27,0.25,76,0.79],[27.5,0.25,83,0.63],[27.75,0.25,76,0.79],[28,0.25,76,0.79],[28.25,0.25,81,0.63],[28.75,0.25,76,0.79],[29,0.25,81,0.63],[29.25,0.25,73,0.63],[29.5,0.25,76,0.79],[29.75,0.25,81,0.63],[30.25,0.25,76,0.79],[30.5,0.25,81,0.63],[30.75,0.25,73,0.63],[31,1,81,0.82]]`
- **Karte:** „Gläserner 3er-Arp, der gegen den Takt läuft – erinnert an amerikanischen Synthpop mit IDM-Einschlag (Stil Iris).“

### 3.15 Massive Ego (`vorbild: massive-ego`, neu)

**Belege**

| Fakt | Status | Quelle |
|---|---|---|
| Marc Massive (Gesang, Text), **Scot Collins** (Synth, Produktion), Oliver Frost (Perkussion); früher Lloyd Price (Synth) | WAHRSCHEINLICH (Interview-Einleitung Elektro Vox) | https://www.elektrovox.com/post/interview-with-massive-ego-for-the-release-of-church-of-the-malfunctioned |
| Collins brachte Industrial-Verständnis, Price 80er-Synth-Wissen; zweites Album sollte härter, „underground Berlin club“, dunkler klingen als „Beautiful Suicide“ | **BELEGT** (Primärquelle, Marc Massive im Interview) | wie oben |
| Label Out of Line | WAHRSCHEINLICH (Wikipedia) | https://en.wikipedia.org/wiki/Massive_Ego |
| Geräte | UNBELEGT | – |

#### EB-27 „Spiegelkugel-Bass“ – Rolle Bass · VA (neu)

- **Vorbild (ⓘ):** Hi-NRG-Oktavbass der 80er, mit dunkler Club-Härte (Stil; Gerät UNBELEGT).
- **Rezept:** `o1w 0, o2w 0, o2fine 7, o2lvl .8, ftype 0, cutoff 800, res .35, drive .2, kt .45, fenv .35, fA .001, fD .12, fS .2, fR .05, aA .001, aD .15, aS .6, aR .05, mode 1, poly 1, reset 1, analog .2` · fx `{drive .2, rev .05}`.
- **Abgrenzung:** IM1 „Herzschlag-Oktavbass 85“ (`vorbild-achtziger.md`) ist weicher (Eurodisco); EB-27 hat mehr Resonanz und Drive.
- **Lage / Rolle:** F1–E♭3 (29–51). LAGE-Klammer **hoch E3**. Akkord-Reaktion: **nächstliegend, nie über E3**.
- **Hörprobe** (128 BPM, g-Moll, Grundton auf dem Schlag, Oktave auf dem „und“, Takt 4 Lauf):
```
Tempo 128 BPM · 4 Takte · Akkorde: Gm | Gm | Eb | F
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: G1(31) 0/1/112 · G2(43) 2/1/96 · G1(31) 4/1/112 · G2(43) 6/1/96 · G1(31) 8/1/112 · G2(43) 10/1/96 · G1(31) 12/1/112 · G2(43) 14/1/96
T2: G1(31) 16/1/112 · G2(43) 18/1/96 · G1(31) 20/1/112 · G2(43) 22/1/96 · G1(31) 24/1/112 · G2(43) 26/1/96 · G1(31) 28/1/112 · G2(43) 29/1/96 · F2(41) 30/1/80 · G2(43) 31/1/96
T3: Eb2(39) 32/1/112 · Eb3(51) 34/1/96 · Eb2(39) 36/1/112 · Eb3(51) 38/1/96 · Eb2(39) 40/1/112 · Eb3(51) 42/1/96 · Eb2(39) 44/1/112 · Eb3(51) 46/1/96 · Eb2(39) 47/1/80
T4: F1(29) 48/1/112 · F2(41) 50/1/96 · F1(29) 52/1/112 · F2(41) 54/1/96 · F1(29) 56/1/112 · F2(41) 57/1/96 · F1(29) 58/1/80 · F2(41) 59/1/96 · C2(36) 60/1/112 · F2(41) 61/1/96 · A1(33) 62/1/80 · F2(41) 63/1/96
```
Dauer: alle 4 Takte 7,5 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,5 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,5 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.25,31,0.88],[0.5,0.25,43,0.76],[1,0.25,31,0.88],[1.5,0.25,43,0.76],[2,0.25,31,0.88],[2.5,0.25,43,0.76],[3,0.25,31,0.88],[3.5,0.25,43,0.76],[4,0.25,31,0.88],[4.5,0.25,43,0.76],[5,0.25,31,0.88],[5.5,0.25,43,0.76],[6,0.25,31,0.88],[6.5,0.25,43,0.76],[7,0.25,31,0.88],[7.25,0.25,43,0.76],[7.5,0.25,41,0.63],[7.75,0.25,43,0.76],[8,0.25,39,0.88],[8.5,0.25,51,0.76],[9,0.25,39,0.88],[9.5,0.25,51,0.76],[10,0.25,39,0.88],[10.5,0.25,51,0.76],[11,0.25,39,0.88],[11.5,0.25,51,0.76],[11.75,0.25,39,0.63],[12,0.25,29,0.88],[12.5,0.25,41,0.76],[13,0.25,29,0.88],[13.5,0.25,41,0.76],[14,0.25,29,0.88],[14.25,0.25,41,0.76],[14.5,0.25,29,0.63],[14.75,0.25,41,0.76],[15,0.25,36,0.88],[15.25,0.25,41,0.76],[15.5,0.25,33,0.63],[15.75,0.25,41,0.76]]`
- **Karte:** „Pumpender Oktav-Bass mit Club-Härte – erinnert an britischen Dark-Synthpop mit Hi-NRG-Wurzeln (Stil Massive Ego).“

---

## 4. Übersicht: Rolle, Lage, LAGE-Klammer, Akkord-Reaktion, Dauer

| ID | Act | Sound | Rolle | Engine | Hörprobe (MIDI) | Takte · BPM | Dauer alle / kurz / ganz | LAGE-Klammer | Akkord-Reaktion | Beleg |
|---|---|---|---|---|---|---|---|---|---|---|
| EB-01 | DAF | Schiefe Kette | Bass/Sequenz | VA | E1–D3 (28–50) | 8 · 126 | 15,2 / 7,6 / 15,2 s | hoch D3 | nächstliegend, nie über D3; live: Hand führt | b |
| EB-02 | Front 242 | Ziegel-Kit | Drums | Drum | – | 4 · 120 | 8,0 / 8,0 / 8,0 s | keine | keine | b |
| EB-03 | Front 242 | FM-Kantenstab | Akkord/Stab | FM6 | D3–C4 (50–60) | 4 · 120 | 8,0 / 8,0 / 8,0 s | A2–F4 | Block (Sequenz) | b |
| EB-04 | Nitzer Ebb | Ein-Osz-Drillbass | Bass | VA | G1–E♭3 (31–51) | 8 · 130 | 14,8 / 7,4 / 14,8 s | hoch E3 | nächstliegend, nie über E3 | w |
| EB-05 | Skinny Puppy | Pro-Schnarrbass | Bass | VA | F1–B♭2 (29–46) | 4 · 112 | 8,6 / 6,4 / 8,6 s | hoch C3 | nächstliegend, nie über C3 | b |
| EB-06 | Suicide Commando | Erstlings-Kasten | Drums | Drum | – | 4 · 128 | 7,5 / 7,5 / 7,5 s | keine | keine | w |
| EB-07 | Die Krupps | Stahlophon | Perkussion/Sequenz | FM6 | F♯4–B5 (66–83) | 4 · 125 | 7,7 / 7,7 / 7,7 s | E4–C6 | nächstliegend, Gleichstand aufwärts | w |
| EB-08 | Die Krupps | Volle-Kraft-Bass | Bass | VA | E1–C3 (28–48) | 4 · 125 | 7,7 / 7,7 / 7,7 s | hoch C3 | nächstliegend, nie über C3 | w (nur live 2015) |
| EB-09 | Front Line Assembly | Neuralbass | Bass | VA | A1–D3 (33–50) | 4 · 124 | 7,7 / 7,7 / 7,7 s | hoch D3 | nächstliegend, nie über D3 | s |
| EB-10 | Front Line Assembly | Schneid-Stab | Akkord/Stab | WT | A3–F4 (57–65) | 4 · 124 | 7,7 / 7,7 / 7,7 s | G3–C5 | Block (Sequenz) | b (Arbeitsweise) |
| EB-11 | Apoptygma Berzerk | Nordlicht-Pluck | Sequenz | VA | D4–F5 (62–77) | 8 · 132 | 14,5 / 7,3 / 14,5 s | C4–A5 | nächstliegend, Gleichstand aufwärts | s |
| EB-12 | Apoptygma Berzerk | Rollbass | Bass | VA | E1–C3 (28–48) | 8 · 132 | 14,5 / 7,3 / 14,5 s | hoch C3 | nächstliegend, nie über C3 | s |
| EB-13 | Assemblage 23 | Sturmglas-Lead | Lead | VA | E4–A5 (64–81) | 8 · 128 | 15,0 / 7,5 / 15,0 s | tief C4 | folgt der Oktave der Taste | s |
| EB-14 | Combichrist | Techno-Körper-Kit | Drums | Drum | – | 4 · 140 | 6,9 / 6,9 / 6,9 s | keine | keine | s (Stilbegriff b) |
| EB-15 | Combichrist | Säge-Rammbass | Bass | VA | F1–C♯3 (29–49) | 4 · 140 | 6,9 / 6,9 / 6,9 s | hoch D3 | nächstliegend, nie über D3 | s |
| EB-16 | Wolfsheim | Spatzen-Streicher | Fläche | VA | E3–E4 (52–64) | 4 · 120 | 8,0 / 8,0 / 8,0 s | C3–C5 | Fläche (Stimmführung) | s |
| EB-17 | Wolfsheim | Nachtigall-Glocke | Lead | FM6 | E5–E6 (76–88) | 4 · 120 | 8,0 / 8,0 / 8,0 s | tief C5 | folgt der Oktave der Taste | s |
| EB-18 | Seabound | Tiefsee-Bass | Bass | VA | F1–B♭2 (29–46) | 4 · 126 | 7,6 / 7,6 / 7,6 s | hoch C3 | nächstliegend, nie über C3 | s |
| EB-19 | Rotersand | Leuchtturm-Stab | Akkord/Stab | VA | A3–G4 (57–67) | 8 · 134 | 14,3 / 7,2 / 14,3 s | G3–C5 | Block (Sequenz) | s |
| EB-20 | Solar Fake | Falschsonne-Lead | Lead | VA | C4–D5 (60–74) | 4 · 124 | 7,7 / 7,7 / 7,7 s | tief C4 | folgt der Oktave der Taste | s |
| EB-21 | Diary of Dreams | Tagebuch-Klavier | Akkord/Arp | FM6 | G2–C♯5 (43–73) | 4 · 96 | 10,0 / 7,5 / 10,0 s | G2–D5 | Block (Sequenz) | w (Spielweise) |
| EB-22 | Diary of Dreams | Schattenchor | Fläche | WT | A3–A4 (57–69) | 4 · 96 | 10,0 / 7,5 / 10,0 s | G3–C5 | Fläche (Stimmführung) | s |
| EB-23 | Blutengel | Blutmond-Orchester | Akkord/Stab | VA | A♭3–F4 (56–65) | 4 · 120 | 8,0 / 8,0 / 8,0 s | G3–C5 | Block (Sequenz) | s |
| EB-24 | Neuroticfish | Nervenbass | Bass | VA | C2–E3 (36–52) | 4 · 130 | 7,4 / 7,4 / 7,4 s | hoch E3 | nächstliegend, nie über E3 | w (nur Equipboard) |
| EB-25 | Beborn Beton | Beton-Brass | Akkord/Stab | VA | G3–F4 (55–65) | 4 · 120 | 8,0 / 8,0 / 8,0 s | G3–C5 | Block (Sequenz) | s |
| EB-26 | Iris | Glanz-Arp | Sequenz | VA | C♯5–B5 (73–83) | 8 · 126 | 15,2 / 7,6 / 15,2 s | A4–D6 | nächstliegend, Gleichstand aufwärts | s |
| EB-27 | Massive Ego | Spiegelkugel-Bass | Bass | VA | F1–E♭3 (29–51) | 4 · 128 | 7,5 / 7,5 / 7,5 s | hoch E3 | nächstliegend, nie über E3 | s |

Beleg (Gerät/Arbeitsweise des Acts, nicht das Rezept): b = BELEGT, w = WAHRSCHEINLICH, s = nur Stil (Gerät UNBELEGT). Bass-Klammern: Boden E1 (Auto-Klammer, `transposition-lage.md` §3.3).

**Spur-Paare (gleiche Akkorde und Tempo, zusammen abspielbar):** EB-07 + EB-08 (Die Krupps), EB-09 + EB-10 (FLA), EB-11 + EB-12 (Apoptygma), EB-16 + EB-17 (Wolfsheim), EB-21 + EB-22 (Diary of Dreams). EB-02 passt zu EB-03 (120 BPM). EB-14 passt zu EB-15 (140 BPM).

---

## 5. Korrekturen und Warnungen

| # | Punkt | Befund | Folge |
|---|---|---|---|
| K-1 | `vorbild-dark.md` §5.6 DAF „MS-20 + SQ-10 UNBELEGT“ | jetzt **BELEGT** (2 Quellen) | Kennzeichen in DK-18 auf „Gerät BELEGT“; §9 Nr. 1 erledigt |
| K-2 | `vorbild-dark.md` §5.4 Front 242 „Geräte bewusst nicht genannt“ | Emulator II, Drumulator, DX7/TG-77 **BELEGT**; TR-808, PPG nur WAHRSCHEINLICH | im ⓘ von DK-11/12/14 dürfen „Sampler und FM-Synth der 80er“ stehen |
| K-3 | SQ-10 Schrittzahl | 12 (Electricity Club) gegen 16 (andere Quelle) – **Widerspruch**; nach eK hat der SQ-10 12 Schritte (UNBELEGT) | EB-01 nutzt 12 (Stilmittel, keine Gerätebehauptung) |
| K-4 | Covenant-„Joakim“-Studiofilm | Treffer gehört zu einem anderen Produzenten „Joakim“ | nicht verwenden (§2.7) |
| K-5 | Massive Ego: Suchanfrage nannte „Scot Belshaw“ (mein Fehler in der Anfrage) | richtig ist **Scot Collins** | nur „Scot Collins“ verwenden |
| K-6 | Apoptygma: Gründungsjahr | 1986 / 1989 / „1971“ widersprüchlich | im ⓘ kein Jahr |
| K-7 | Apoptygma „Welcome to Earth“ Platz 1 | Platz 1 nur in den deutschen Alternative-Charts; offizielle Albumcharts Platz 59 (Wikipedia) | nie „Nummer 1“ ohne Zusatz |
| K-8 | `vorbild-szene.md` SZ-29 (VNV) „Gerät UNBELEGT“ | JP-8000/Virus jetzt WAHRSCHEINLICH (Wikipedia) | ⓘ darf Supersaw-Bezug nennen (§2.8) |

---

## 6. Was SYNQUENZER für diesen Bereich (noch) nicht kann

| Lücke | Betrifft | Ersatz heute | Mit VK / später |
|---|---|---|---|
| Hochpass **vor** Tiefpass (MS-20) | EB-01, EB-08, DK-18 | Bass-Ausgleich, Keytrack | zweites Filter / SVF 12 (Nachtrag A.10) |
| Poly-Mod (Oszillator B → Frequenz A, Pro-One) | EB-05 | Filt.-Hk → Tonhöhe, S&H aufs Filter | `ofm` (VK) |
| Rauheit früher Sample-Drums/Sampler (Drumulator, Emulator II) | EB-02, EB-10 | Klick, Pitch-Hk, Gate-Raum, Drive | `crush` (VK P1) |
| Sprach- und Geräusch-Fetzen (Front 242, FLA, Suicide Commando) | – | DK-13 Kurzwellen-Atmo | eigene Aufnahmen über Mikrofon (keine fremden Samples) |
| Zufalls-Verstimmung je Schritt | EB-01 | `M('rnd','pitch',…)` – **Verhalten je Anschlag im Code prüfen** | ggf. Schritt-Detune im Clip |
| Verzerrer **vor** dem Filter (Aggrotech-Säge) | EB-15 | Spur-Drive nach allem | `sat` (VK, nach dem Filter) – vor dem Filter weiter offen |

---

## 7. Offene Punkte (kurz, nicht blockierend)

1. Gegenhören: je Act 2–3 Originaltitel gegen die Hörproben (Tempo per Tap, Lage, Groove), danach Rezept-Feinschliff. Nichts hier ist angehört.
2. Für die 16 Acts ohne Gerätebeleg: Band-Interviews in Side-Line, ReGen, Electricity Club, Reflections of Darkness direkt öffnen, sobald WebFetch geht (hier nur Auszüge).
3. Code-Prüfung: Würfelt die Mod-Quelle `rnd` (V0a Z. 5065) je Anschlag neu? Davon hängt EB-01 ab.
4. Frage an Xander (nur wenn er will): Fehlt in diesem Cluster ein Act, den er gemeint hat? (Hier nur die Liste des Auftrags.)

---

## 8. Quellen (alle 17.10.2026, nur Suchauszüge; keine Seite direkt abgerufen)

- DAF: https://en.wikipedia.org/wiki/Deutsch_Amerikanische_Freundschaft · https://www.electricityclub.co.uk/?p=72597 · https://electricityclub.co.uk/tag/daf · https://www.liquisearch.com/daf_band/style
- Front 242: https://www.bonedo.de/artikel/die-praegenden-synthesizer-von-front-242 · https://www.gearnews.com/front-242-most-used-synths-drum-machines-and-sounds · https://www.matrixsynth.com/2011/11/front-242s-emulator-ii.html · https://daily.redbullmusicacademy.com/2017/07/front-242-interview/ · https://www.redbullmusicacademy.com/lectures/front-242-boot-camp-click · https://lostinconcert.com/interview-patrick-codenys-of-front-242/ · https://en.wikipedia.org/wiki/Front_by_Front
- Nitzer Ebb: https://equipboard.com/albums/nitzer-ebb-that-total-age · https://articles.roland.com/?p=4098 · https://en.wikipedia.org/wiki/SH-101 · https://en.wikipedia.org/wiki/Bon_Harris · https://www.soundonsound.com/people/bon-harris-techno-pioneer
- Skinny Puppy: https://side-line.com/?p=6085 · https://synthtopia.com/content/2015/06/27/cevin-key-interview-on-skinny-puppy-eurorack-modulars-more · https://www.matrixsynth.com/2012/02/brap.html · https://reverb.com/news/the-mean-synths-and-fast-drums-of-industrial-pioneers-skinny-puppy
- Suicide Commando: https://elgarajedefrank.es/en/interview-suicide-commando · https://side-line.com/30-years-of-journalism-celebration-interview-with-johan-van-roy-suicide-commando-i-probably-will-continue-writing-music-till-i-drop-dead · https://equipboard.com/band/suicide-commando
- Covenant: https://en.wikipedia.org/wiki/Covenant_(band) · https://equipboard.com/band/covenant · https://archive.thevinylfactory.com/?p=108285 (falscher Joakim, K-4)
- VNV Nation: https://en.wikipedia.org/wiki/VNV_Nation · https://reference.org/facts/VNV_Nation/VCe7evg5 · https://equipboard.com/pros/ronan-harris
- Mesh: https://www.electricityclub.co.uk/category/vintage-synth-trumps/page/3/ · https://www.reflectionsofdarkness.com/artists-k-o/16758-interview-mesh-august-2016 · https://equipboard.com/band/mesh
- Die Krupps: https://en.wikipedia.org/wiki/Die_Krupps · https://bureau-b.com/Krupps.php · https://infestuk.com/2017/03/10/infest-2017-die-krupps-confirmed/ · https://www.nts.live/artists/4934-die-krupps
- Front Line Assembly: https://en.wikipedia.org/wiki/Front_Line_Assembly · https://nts.live/artists/33718-front-line-assembly · https://en.wikipedia.org/wiki/Tactical_Neural_Implant · https://en.wikipedia.org/wiki/Millennium_(Front_Line_Assembly_album) · https://www.electricityclub.co.uk/rhys-fulber-interview/ · https://www.soundonsound.com/people/bill-leeb-front-line-assembly · https://equipboard.com/band/front-line-assembly
- Apoptygma Berzerk / Futurepop: https://en.wikipedia.org/wiki/Futurepop · https://elgarajedefrank.es/en/?p=5060 · https://en.wikipedia.org/wiki/Welcome_to_Earth_(album) · https://www.reflectionsofdarkness.com/artists-a-e/102-apoptygma-berzerk · https://www.iconvsicon.com/2016/10/07/exit-popularity-contest-apops-stephan-groth-on-revisiting-his-electronic-roots/ · https://archiv.rme-audio.de/en/artists/apoptygma.php
- Assemblage 23: https://en.wikipedia.org/wiki/Assemblage_23 · https://en.wikipedia.org/wiki/Tom_Shear
- Combichrist: https://en.wikipedia.org/wiki/Combichrist · https://en.wikipedia.org/wiki/Andy_LaPlegua · https://www.dallasobserver.com/?p=40410152 · https://equipboard.com/band/combichrist
- Wolfsheim: https://en.wikipedia.org/wiki/Wolfsheim_(band) · https://www.qobuz.com/ie-en/interpreter/wolfsheim/223889 · https://midheaven.com/item/wolfsheim/the-sparrows-and-the-nightingales-by-wolfsheim
- Seabound: https://en.wikipedia.org/wiki/Seabound · https://exclaim.ca/music/article/seabound-beyond_flatline
- Rotersand: https://en.wikipedia.org/wiki/Rotersand · https://last.fm/music/Rotersand/+wiki · https://side-line.com/?p=17940
- Solar Fake: https://goout.net/en/solar-fake/pzejgbg/ · https://www.bandsintown.com/e/108047309 · https://regenmag.com/interviews/solar-fake-interview-episodes-of-electronic-mania/
- Diary of Dreams: https://en.wikipedia.org/wiki/Diary_of_Dreams · https://goout.net/cs/diary-of-dreams/pzgvkqf/ · https://www.metropolis-records.com/artist/diary-of-dreams
- Blutengel: https://en.wikipedia.org/wiki/Blutengel · https://en.wikipedia.org/wiki/Seelenkrank · https://www.reflectionsofdarkness.com/artists-a-e/13283-cd-review-blutengel-monument
- Neuroticfish: https://en.wikipedia.org/wiki/Neuroticfish · https://neuroticfish.bandcamp.com/ · https://en.wikipedia.org/wiki/Les_Chansons_Neurotiques_(album) · https://equipboard.com/band/neuroticfish
- Beborn Beton: https://en.wikipedia.org/wiki/Beborn_Beton · https://www.heavymetal.ch/artists/5400/index.html · https://regenmag.com/?p=16179 · https://regenmag.com/interviews/interview-beborn-beton-inflamed-by-idiocracy/
- Iris: https://en.wikipedia.org/wiki/Iris_(American_band) · https://en.wikipedia.org/wiki/Radiant_(Iris_album) · https://regenmag.com/?p=38814
- Massive Ego: https://en.wikipedia.org/wiki/Massive_Ego · https://www.elektrovox.com/post/interview-with-massive-ego-for-the-release-of-church-of-the-malfunctioned
- Hocico: keine Treffer (1 Suche).

---

## 9. Dateien

- `r7/vorbild-ebm-dark.md` – diese Datei.
- `r7/ebm-work/aud-ebm.json` – 27 Hörproben maschinenlesbar (`{id: {title, bpm, chords, lage, kurz:{takte, notes}, ganz:{takte, notes}}}`, Drums `{drums, kurz, ganz}`).
- `r7/ebm-work/aud.mjs` (= `head.mjs` + `defs.mjs` + `tail.mjs`) – Erzeuger und Prüfer (Dauer, Takt-Wiederholungen, Lage), Ausgabe `aud-report.txt`, `aud-blocks.md`; `assemble.mjs` – Tabelle, Klammer-Prüfung, setzt `vorlage.md` zusammen.
- Keine Änderung an V0a, `dirigent-wt/` oder dem Repo.
