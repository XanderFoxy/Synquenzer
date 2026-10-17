# R7 – Vorbild-Helden: Kraftwerk, Duran Duran, Jean-Michel Jarre, Isao Tomita (+ Hörproben für The Human League und New Order)

**Stand:** 17.10.2026 · Auftrag R7 „vorbild-helden“ · Grundlage: `fragen-xander-8.md` (V, T), `fragen-xander-7.md` (L1–L3), Spec v3 §12.8 (`aud`), Nachtrag 1 (E9, N10a, V10d), R6 `r6/bibliothek-recherche.md` (§1, §5, §11).
**Abgrenzung:** `r7/vorbild-pop.md` gab es beim Schreiben noch nicht. The Human League und New Order sind in R6 schon gründlich belegt (N10–N16). Hier stehen für sie nur je eine **Hörprobe** und ein kurzer Nachtrag (§7), keine neuen Belege.
**Werkzeuge und Grenzen:** Webseiten direkt abrufen war gesperrt (DNS-Fehler, wie schon in R6). Jeder Web-Fakt stützt sich deshalb auf **Suchauszüge**. Die Hörproben sind per Skript erzeugt und geprüft (`r7/helden-work/aud.mjs` → `aud-report.txt`). **Nichts ist angehört und nichts gemessen.** Die Rezepte sind Startwerte für den Klang-Feinschliff. Pegel (`level`, FM `gain`) müssen noch auf −18 LUFS kalibriert werden (Spec v2 §11.1).

**Kennzeichen**
- **BELEGT**: Eine namhafte Quelle (Wikipedia, Fachpresse, Hersteller-Interview mit dem Musiker) sagt es ausdrücklich. Grundlage ist der Suchauszug.
- **WAHRSCHEINLICH**: Nur eine schwache Quelle (Fan-Wiki, Forum, Händler, Nachbau-Anleitung), Quellen widersprechen sich, oder es ist eine eigene Kenntnis (eK), deren Link nicht geöffnet wurde.
- **UNBELEGT**: Nichts gefunden. Das ist dann eine eigene Einschätzung für das Rezept und wird nie als Fakt in einen ⓘ-Text übernommen.

---

## 0. Kurzfazit

- **13 neue Vorbild-Sounds** mit Rezept, Lage, Rolle und Hörprobe:
  - Kraftwerk 4 (Bass, Sequenz, Lead, Drums)
  - Duran Duran 3 (Zufalls-Arp, Echo-Arp, Poly)
  - Jarre 3 (Phasen-Streicher, Lead, Rhythmus-Kiste)
  - Tomita 3 (Pfeif-Stimme, Glocke, Chor)
- Dazu **2 Hörproben** für vorhandene R6-Rezepte: N11 (Human League) und N13 (New Order).
- **Am besten belegt:**
  - Kraftwerk: Minimoog-Bass auf „Autobahn“, Synthanorma-Sequenzer, selbst gebaute E-Drum-Pads.
  - Duran Duran: Jupiter-4 mit Zufalls-Arpeggiator auf „Rio“, SH-2 + CSQ-100 auf „Save a Prayer“ und „The Chauffeur“ (Rhodes selbst im Roland-Interview).
  - Jarre: Eminent 310 durch Small-Stone-Phaser, RMI, VCS3 und ARP 2600 auf „Oxygène IV“.
  - Tomita: Moog + Mellotron, Pfiffe, Glocken, Phasing, Ringmodulation auf „Snowflakes Are Dancing“.
- **Schwach belegt:** das Instrument für das „Model“-Lead (Polymoog oder Minimoog, Quellen uneinig), der Akkord im „Rio“-Arp (Cmaj7 oder c-Moll) und Jarres Flanger auf dem RMI.
- **Für drei Kennklänge fehlt der App ein Baustein:**
  - **Phaser** (Jarres Streicher)
  - **Flanger** (Jarres RMI-Lead)
  - **Arpeggiator mit Modus ZUFALL** (Duran Duran)

  Bis dahin gibt es Annäherungen (Chorus BREIT, LFO, feste Notenliste). Empfehlung: Phaser/Flanger als FX-Block und ZUFALL im Arp nachziehen (§9).
- **Alle Hörproben sind nicht repetitiv** (geprüft):
  - Kein Takt ist eine direkte Kopie des Vortakts.
  - Jede Probe hat eine Wendung in Takt 4 bzw. 8.
  - Jede Probe nutzt Stilmittel zum Wiedererkennen (Klang, Rhythmus, Harmonik, Lage).
  - Keine kopiert eine geschützte Melodie (§1).
- **Dauer (nach Review):** Die Spec verlangt `aud` **≤ 8 s** (Spec v3 V10b-01, Nachtrag 1 V10d-01) und `len ≤ 4` Takte (§12.8). In voller Länge halten das nur K2, K4 und N1 ein; D1, D3 und H1 liegen knapp darüber (8,1–8,3 s), J1, J3 und D2 bei 9,2–11,4 s, T2 und T3 bei 13,3 s, K3 bei 16,0 s, K1 bei 16,6 s, J2 bei 18,5 s und T1 bei 26,7 s. Deshalb hat **jede Hörprobe eine Fassung „kurz“ (≤ 8 s)**: die ersten Takte plus der letzte, damit die Wendung hörbar bleibt (2 Takte bei 72–84 BPM, 3 Takte bei 96–118 BPM, 4 Takte ab 120 BPM). Diese Fassung steht als `aud-Daten kurz` bei jeder Probe und erfüllt die Spec, wie sie ist. **Vorschlag zur Spec, in Sekunden statt Takten:** „kurz ≤ 8 s, ganz ≤ 16 s“ (gleich wie `vorbild-coldwave2.md` §6). Die Fassung „ganz“ hält ≤ 16 s überall ein; bei K1, J2 und T1 lässt sie dafür Mitteltakte weg. Die Grenze von 256 Noten bleibt, die längste Probe hat 64.

## 1. Rechtliche Linie für Hörproben (kein Rechtsrat)

| Was | Frei? | Beleg |
|---|---|---|
| **Stil, Genre, Klangfarbe, Gerätetyp** („Säge-Lead mit LFO am Filter“, „Oktav-Bass mit Band-Echo“) | frei. In den USA hat ein Berufungsgericht „Textur“ als zu abstrakt für Schutz verworfen. Die Klangfarbe gehört dort nicht zur Komposition. | BELEGT (USA, Gray v. Hudson 2022): Fenwick-Zusammenfassung. Für Deutschland nach R6 §5 eK, also WAHRSCHEINLICH. |
| **Einzelne Töne, einzelne Akkorde** | in der Regel nicht geschützt | BELEGT: Uni Bremen, Leitfragen Urheberrecht |
| **Allerwelts-Akkordfolgen** (i–VI–VII, I–V–vi–IV …) | gelten als frei, solange keine schutzfähige Melodie daraus folgt | WAHRSCHEINLICH: Wikibooks (Laienquelle); USA: „trite building blocks“ (Gray v. Hudson), BELEGT |
| **Rhythmus** | Allerweltsmuster (Four-on-the-floor, Oktav-Achtel, Electro-Kick) gelten als frei. Eine **eigentümliche** rhythmische Gestalt kann im Einzelfall geschützt sein. | WAHRSCHEINLICH: Schweizer Fachbeitrag (legalis.ch, Auszug; welcher Aufsatz genau, ist unsicher) |
| **Die konkrete Melodie bzw. das konkrete Riff** | **geschützt**. Den „starren Melodienschutz“ (§ 24 Abs. 2 UrhG a. F.) gibt es seit 07.06.2021 nicht mehr. Nach § 23 UrhG verletzt aber, wer keinen **hinreichenden Abstand** hält, gerade bei der Melodie. Abstand besteht, wenn das alte Werk im neuen **nicht wiedererkennbar** ist. | BELEGT: buzer.de (§ 24 aufgehoben); sic! 2024 (§ 23, Melodie, Wiedererkennbarkeit) |
| **Samples, Resynthese fremder Aufnahmen** | geschützt (Tonträgerherstellerrecht) | WAHRSCHEINLICH (eK; EuGH C‑476/17 „Pelham/Metall auf Metall“, Link nicht geöffnet) |
| **Gemeinfreie Vorlagen** (z. B. Debussy, gest. 1918) | Die Komposition ist frei (70 Jahre nach dem Tod, § 64 UrhG). **Tomitas Bearbeitung und Aufnahme sind es nicht.** | WAHRSCHEINLICH (eK, Links nicht geöffnet) |

**Folgerung für die Bibliothek.** Das „Erinnert an …“ entsteht aus Klang, Lage, Rhythmus-Gefühl, Akkord-Klischee und Spieltechnik, nie aus der Tonfolge des Originals. Das ist genau das Gegenteil der Wiedererkennbarkeit, die § 23 verbietet: Man soll den **Stil** erkennen, nicht den **Song**.

**Regeln für alle Hörproben dieser Datei:**
1. Eigene Melodie.
2. Keine Tonfolge von mehr als 4 Tönen mit gleichem Rhythmus wie ein bekanntes Riff des Vorbilds (Selbstprüfung beim Komponieren; eine automatische Prüfung gegen Originale ist nicht möglich, weil keine Originalnoten vorliegen).
3. Andere Tonart und andere Akkordfolge als der Titel, an den die Probe erinnert.
4. Techniken (Zufalls-Arp, Oktav-Bass, Band-Echo) sind frei, ihre konkrete Notenfolge in einem Titel nicht.

**ⓘ-Text:** Vorbild nur hier und im Filter, nie im Namen (E9). Dazu kommt der Pflichtsatz: „Marken gehören ihren Inhabern, keine Verbindung.“ Im Vorbild-Filter steht „erinnert an … (Stil)“ (§ 23 Abs. 1 Nr. 3 MarkenG laut R6 §5).

## 2. Format der Hörproben und Anschluss an die App

- **Notenliste:** `Ton(MIDI) Start/Länge/Anschlag`. Start und Länge zählen in **16teln ab Takt 1** (Takt n beginnt bei 16·(n−1)), Anschlag 1–127. Darunter steht dieselbe Liste als `aud.notes` im Spec-Format `[b, d, n, v]` in **Schlägen** (= 16tel ÷ 4), fertig zum Einfügen. **v = Anschlag/127 (0–1)**, auf 2 Stellen gerundet, wie in `vorbild-coldwave2.md` §2. Die App rechnet mit v 0–1 (V0a Z. 3839 `.7 + .3 * nt.v`, Z. 4325 `clamp(nt.v, 0, 1)`, Werks-Noten `v: .8`; BELEGT, Code). Die erste Fassung trug hier 1–127 ein. Das wäre bei v = 110 etwa 36-mal so laut gewesen.
- **Dauer:** Unter jeder Probe stehen die Dauer in Sekunden und die Takte der Fassungen **kurz (≤ 8 s, `aud-Daten kurz`)** und **ganz (≤ 16 s, Vorschlag, `aud-Daten ganz`)**. Auswahl-Regel: Passen alle Takte, gelten alle; sonst die ersten n − 1 Takte plus der letzte.
- **Drums:** Schritt-Zeilen je Pad (`x` = Schlag), 16 Schritte je Takt. Die Pad-Namen sind wie in `DrumKits.SLOTS`: KICK, SNARE, RIM, HH ZU, PERC, SHAKER.
- **Akkorde und Tempo** stehen in der ersten Zeile. Die Hörprobe spielt den Sound allein. Die Akkorde sind für die Akkord-Zeile (S6) und für eine optionale Begleitung gedacht (leise Werks-Fläche, eigener Vorschlag).
- **Prüfung** (`aud.mjs`):
  - Lage (tiefster und höchster Ton)
  - verschiedene Takte
  - direkte Takt-Wiederholungen (überall 0, auch in kurz und ganz)
  - Ende ≤ Länge, keine Note über eine Taktgrenze (Voraussetzung für die Auswahl)
  - Dauer je Fassung in Sekunden
- **Lage-Vorschlag für die Transpositions-Regel (Xanders Wunsch T):** Jeder Sound hat eine Lage (MIDI von–bis), in der er am besten klingt. Diese Werte kann die geplante Lagen-Grenze je Clip/Spur als **Voreinstellung** übernehmen: Ein Bass-Clip mit diesem Sound bleibt dann von selbst in seinem Bereich. Übersicht in §8.

---

## 3. Kraftwerk (`vorbild: kraftwerk`, neu)

### 3.1 Belege

| Fakt | Status | Quelle |
|---|---|---|
| „Autobahn“: Ein **Minimoog** spielt die Basslinie und ein Oktav-Riff mit analogem Echo. | BELEGT | Wikipedia „Autobahn (song)“ |
| Hütter kaufte einen Minimoog, „which he used for basslines“, Schneider einen ARP Odyssey. Robovox für die harten Vocoder-Klänge im Titelstück. Flür spielte als erster Schlagzeuger die „custom-built“ E-Pads. | BELEGT | hifinews „Kraftwerk: Autobahn Production Notes“ |
| „Autobahn“: Farfisa Rhythm Unit 10 und Vox Percussion King, „extremely customised“, live über eigene Pads gespielt | BELEGT (Fachmagazin) | Mixdown „Gear Rundown: Kraftwerk Autobahn“ |
| **Synthanorma**: Sequenzer von Matten & Wiechers (Bonn). Auf „Trans-Europe Express“ erzeugt er den rhythmischen Klang und steuerte den Minimoog. | BELEGT (Hersteller und Einsatz). Schrittzahl WAHRSCHEINLICH: 32 Schritte/16 Kanäle laut Wikipedia, 2 × 16 Schritte laut anderen Quellen. | Wikipedia „Trans-Europe Express (album)“; sdiy.info „Synthesizerstudio Bonn“ |
| „Das Model“: Lead auf Säge-Basis, Charakter durch **leichte LFO-Modulation des Filters**, gespielt von Hütter auf dem **Polymoog** | WAHRSCHEINLICH (eine Museums-Story; MusicRadar: „Minimoog or Polymoog widely suspected“) | Google Arts & Culture / Musikinstrumenten-Museum; MusicRadar „40 greatest synth sounds, No 9“ |
| „Das Model“: Bass vom Micromoog | WAHRSCHEINLICH (nur Forum bzw. Fan-Liste) | forum.moogmusic.com; guitariste.com |
| Chor- und Streicherklänge Mitte/Ende der 70er aus dem **Vako Orchestron** | WAHRSCHEINLICH (Gear-Liste) | notebook.zoeblade.com „Kraftwerk“ |
| „Computer World“ (1981): Stimmen vom TI **Language Translator**, Speak & Spell nur für den Start-Ton von „Home Computer“. Schneider: Ausgabe direkt auf Band aufgenommen, weil es kein Sampling gab. | WAHRSCHEINLICH (Sekundärquellen, Zitat über Geeta Dayal) | notebook.zoeblade.com „Language Translator“; 4columns.org |
| Tour 1981: Prophet-5, Minimoog, Polymoog, Matten-&-Wiechers-Sequenzer. Bartos und Flür an selbst gebauten E-Drum-Pads. | BELEGT (Tour); Studio-Einsatz WAHRSCHEINLICH | Wikipedia „Computer World (tour)“; gearnews „Kraftwerk synths“ |
| „Tour de France“: einfaches Electro-Percussion-Muster plus gesampelte Geräusche, in der Linie von „Metal on Metal“ und „Numbers“ | BELEGT (Wikipedia-Auszug) | Suchauszug Wikipedia/fontsinuse „Tour de France“ |
| Wie die Bassline von „Autobahn“ als Patch eingestellt war | UNBELEGT | – |

**Nicht nachbaubar:** Vocoder und Sprachchip. Die App hat noch kein Mikrofon (Xanders Priorität P3) und keine Sprachsynthese. Erst mit dem Mikrofon wäre ein Vocoder denkbar. Für jetzt kein Rezept.

### 3.2 K1 „Fahrbahn-Bass“ – Rolle Bass · VA

- **Vorbild (ⓘ):** Minimoog-Bass mit Oktav-Riff und analogem Echo, Kraftwerk um 1974 (BELEGT, Gerät und Spielweise). Patch UNBELEGT, das Rezept ist eine Einschätzung.
- **Rezept (flach, `ev:2`):** `o1w 0, o2w 0, o2fine 5, o2lvl .8, o3w 1, o3oct -1, o3lvl .3, ftype 0, cutoff 520, res .22, drive .25, bass .5, kt .4, fenv .38, fA .002, fD .22, fS .25, fR .15, aA .002, aD .3, aS .8, aR .12, ampVel .4, mode 1, poly 1, glide 0, analog .25, spread 0` · fx `{dly .25, rev .1}` · bus `{echo:{mode:'mono', divL:'1/8', fb .25, wow .25, highcut 3000}}`
- **Warum so:** Zwei Sägen plus Puls eine Oktave tiefer ergeben den runden Moog-Bass. Kurzer Filter-Anschlag (Hk +27 HT, D 0,22 s) gibt das „Tock“ der Achtel. Ein Band-Echo auf 1/8 mit wenig Feedback ersetzt das „analogue echo“.
- **Lage / Rolle:** F1–D3 (MIDI 29–50), am besten C1–C3. Bass, Achtel-Oktaven. Über C3 wird er dünn: Lagen-Grenze **hoch D3** (alle Töne; die eigene Probe erreicht in T6 D3). Grundton-Bereich F1–D2, die Oktave darüber darf mit.
- **Hörprobe** (8 Takte, Dur, Oktav-Achtel mit Durchgangstönen, Wendung in Takt 4 (E2 → F) und Kadenz in Takt 7–8):
```
Tempo 116 BPM · 8 Takte · Akkorde: F | F | Bb | C | F | Dm | Bb C | F
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: F1(29) 0/2/110 · F2(41) 2/1/84 · F1(29) 4/2/104 · F2(41) 6/1/84 · F1(29) 8/2/106 · F2(41) 10/1/84 · A1(33) 12/2/98 · C2(36) 14/2/94
T2: F1(29) 16/2/110 · F2(41) 18/1/84 · F1(29) 20/2/104 · F2(41) 22/1/84 · F1(29) 24/3/106 · D2(38) 28/2/94 · A1(33) 30/2/90
T3: Bb1(34) 32/2/110 · Bb2(46) 34/1/84 · Bb1(34) 36/2/104 · Bb2(46) 38/1/84 · Bb1(34) 40/2/106 · Bb2(46) 42/1/84 · D2(38) 44/2/98 · F2(41) 46/2/94
T4: C2(36) 48/2/110 · C3(48) 50/1/88 · C2(36) 52/2/104 · C3(48) 54/1/88 · G1(31) 56/2/104 · G2(43) 58/1/86 · C2(36) 60/2/100 · E2(40) 62/2/106
T5: F1(29) 64/2/112 · F2(41) 66/1/84 · C2(36) 68/2/100 · F2(41) 70/1/84 · F1(29) 72/2/104 · F2(41) 74/1/84 · A2(45) 76/2/96 · G2(43) 78/2/90
T6: D2(38) 80/2/110 · D3(50) 82/1/84 · D2(38) 84/2/104 · D3(50) 86/1/84 · A1(33) 88/2/100 · A2(45) 90/1/84 · C2(36) 92/2/94 · D2(38) 94/2/94
T7: Bb1(34) 96/2/110 · Bb2(46) 98/1/84 · Bb1(34) 100/2/104 · F2(41) 102/2/90 · C2(36) 104/2/110 · C3(48) 106/1/88 · C2(36) 108/2/104 · E2(40) 110/2/100
T8: F1(29) 112/4/115 · F2(41) 116/2/90 · C2(36) 118/2/90 · F1(29) 120/6/104
```
Dauer: alle 8 Takte 16,6 s · kurz (≤ 8 s) T1, T2, T8 = 6,2 s · ganz (≤ 16 s) T1, T2, T3, T4, T5, T6, T8 = 14,5 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.5,29,0.87],[0.5,0.25,41,0.66],[1,0.5,29,0.82],[1.5,0.25,41,0.66],[2,0.5,29,0.83],[2.5,0.25,41,0.66],[3,0.5,33,0.77],[3.5,0.5,36,0.74],[4,0.5,29,0.87],[4.5,0.25,41,0.66],[5,0.5,29,0.82],[5.5,0.25,41,0.66],[6,0.75,29,0.83],[7,0.5,38,0.74],[7.5,0.5,33,0.71],[8,1,29,0.91],[9,0.5,41,0.71],[9.5,0.5,36,0.71],[10,1.5,29,0.82]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 7`): `[[0,0.5,29,0.87],[0.5,0.25,41,0.66],[1,0.5,29,0.82],[1.5,0.25,41,0.66],[2,0.5,29,0.83],[2.5,0.25,41,0.66],[3,0.5,33,0.77],[3.5,0.5,36,0.74],[4,0.5,29,0.87],[4.5,0.25,41,0.66],[5,0.5,29,0.82],[5.5,0.25,41,0.66],[6,0.75,29,0.83],[7,0.5,38,0.74],[7.5,0.5,33,0.71],[8,0.5,34,0.87],[8.5,0.25,46,0.66],[9,0.5,34,0.82],[9.5,0.25,46,0.66],[10,0.5,34,0.83],[10.5,0.25,46,0.66],[11,0.5,38,0.77],[11.5,0.5,41,0.74],[12,0.5,36,0.87],[12.5,0.25,48,0.69],[13,0.5,36,0.82],[13.5,0.25,48,0.69],[14,0.5,31,0.82],[14.5,0.25,43,0.68],[15,0.5,36,0.79],[15.5,0.5,40,0.83],[16,0.5,29,0.88],[16.5,0.25,41,0.66],[17,0.5,36,0.79],[17.5,0.25,41,0.66],[18,0.5,29,0.82],[18.5,0.25,41,0.66],[19,0.5,45,0.76],[19.5,0.5,43,0.71],[20,0.5,38,0.87],[20.5,0.25,50,0.66],[21,0.5,38,0.82],[21.5,0.25,50,0.66],[22,0.5,33,0.79],[22.5,0.25,45,0.66],[23,0.5,36,0.74],[23.5,0.5,38,0.74],[24,1,29,0.91],[25,0.5,41,0.71],[25.5,0.5,36,0.71],[26,1.5,29,0.82]]`
- **Karte:** „Fröhlicher Oktav-Bass in Achteln mit Band-Echo – erinnert an die Fahrt-Hymnen der frühen Elektronik (Stil Kraftwerk).“

### 3.3 K2 „Rechenwerk-Sequenz“ – Rolle Sequenz · VA

- **Vorbild (ⓘ):** Synthanorma-Sequenzer steuert Minimoog, mechanische 16tel (BELEGT). Klang mit „clipped, high resonant frequencies“ (WAHRSCHEINLICH, Suchauszug ohne klare Quelle).
- **Rezept:** `o1w 1, o1pw .3, o2w 0, o2fine -3, o2lvl .4, ftype 0, cutoff 650, res .55, drive .1, bass .3, kt .6, fenv .42, fA .001, fD .09, fS 0, fR .06, aA .001, aD .16, aS 0, aR .05, ampVel .5, mode 1, poly 1, reset 1, analog .2, spread 0` · fx `{dly .15, rev .12}` · bus `{echo:{mode:'pp', divL:'1/16', fb .15}}`
- **Warum so:** Puls 30 % + Säge gibt einen schmalen, nasalen Ton. Resonanz 55 % mit sehr kurzer Filter-Hk ergibt das „Klick-Ploppen“ jeder Stufe. Phasen-Reset sorgt dafür, dass jeder Schritt gleich anschlägt, wie ein Sequenzer.
- **Lage / Rolle:** F2–G4 (41–67), am besten A2–A4. Mittlere Sequenz unter dem Lead. Lagen-Grenze: Sequenz darf beim Akkordwechsel um eine Oktave nach oben ausweichen, aber nicht über C5.
- **Hörprobe** (4 Takte, a-Moll, 16tel-Stufen, Takt 2 mit Lücken, Takt 4 steigt auf G4 als Wendung):
```
Tempo 120 BPM · 4 Takte · Akkorde: Am | Am | F | G
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A2(45) 0/1/108 · A3(57) 1/1/78 · E3(52) 2/1/90 · A3(57) 3/1/78 · C4(60) 4/1/108 · A3(57) 5/1/78 · E3(52) 6/1/90 · A3(57) 7/1/78 · A2(45) 8/1/104 · A3(57) 9/1/78 · E3(52) 10/1/90 · G3(55) 11/1/78 · A3(57) 12/1/108 · E3(52) 13/1/78 · C3(48) 14/1/90 · E3(52) 15/1/78
T2: A2(45) 16/1/108 · E3(52) 18/1/90 · A3(57) 19/1/78 · C4(60) 20/1/108 · D4(62) 22/1/90 · C4(60) 23/1/78 · A3(57) 24/1/104 · E3(52) 26/1/90 · A3(57) 27/1/78 · G3(55) 28/1/108 · E3(52) 29/1/78 · D3(50) 30/1/90 · E3(52) 31/1/78
T3: F2(41) 32/1/108 · F3(53) 33/1/78 · C3(48) 34/1/90 · F3(53) 35/1/78 · A3(57) 36/1/108 · F3(53) 37/1/78 · C3(48) 38/1/90 · F3(53) 39/1/78 · F2(41) 40/1/104 · F3(53) 41/1/78 · C4(60) 42/1/90 · A3(57) 43/1/78 · F3(53) 44/1/108 · C3(48) 45/1/78 · A2(45) 46/1/90 · C3(48) 47/1/78
T4: G2(43) 48/1/108 · G3(55) 49/1/78 · D3(50) 50/1/90 · G3(55) 51/1/78 · B3(59) 52/1/108 · G3(55) 53/1/78 · D3(50) 54/1/90 · G3(55) 55/1/78 · B3(59) 56/1/110 · C4(60) 57/1/84 · D4(62) 58/1/96 · G4(67) 59/1/84 · E4(64) 60/1/114 · D4(62) 61/1/84 · B3(59) 62/1/96 · G3(55) 63/1/84
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.25,45,0.85],[0.25,0.25,57,0.61],[0.5,0.25,52,0.71],[0.75,0.25,57,0.61],[1,0.25,60,0.85],[1.25,0.25,57,0.61],[1.5,0.25,52,0.71],[1.75,0.25,57,0.61],[2,0.25,45,0.82],[2.25,0.25,57,0.61],[2.5,0.25,52,0.71],[2.75,0.25,55,0.61],[3,0.25,57,0.85],[3.25,0.25,52,0.61],[3.5,0.25,48,0.71],[3.75,0.25,52,0.61],[4,0.25,45,0.85],[4.5,0.25,52,0.71],[4.75,0.25,57,0.61],[5,0.25,60,0.85],[5.5,0.25,62,0.71],[5.75,0.25,60,0.61],[6,0.25,57,0.82],[6.5,0.25,52,0.71],[6.75,0.25,57,0.61],[7,0.25,55,0.85],[7.25,0.25,52,0.61],[7.5,0.25,50,0.71],[7.75,0.25,52,0.61],[8,0.25,41,0.85],[8.25,0.25,53,0.61],[8.5,0.25,48,0.71],[8.75,0.25,53,0.61],[9,0.25,57,0.85],[9.25,0.25,53,0.61],[9.5,0.25,48,0.71],[9.75,0.25,53,0.61],[10,0.25,41,0.82],[10.25,0.25,53,0.61],[10.5,0.25,60,0.71],[10.75,0.25,57,0.61],[11,0.25,53,0.85],[11.25,0.25,48,0.61],[11.5,0.25,45,0.71],[11.75,0.25,48,0.61],[12,0.25,43,0.85],[12.25,0.25,55,0.61],[12.5,0.25,50,0.71],[12.75,0.25,55,0.61],[13,0.25,59,0.85],[13.25,0.25,55,0.61],[13.5,0.25,50,0.71],[13.75,0.25,55,0.61],[14,0.25,59,0.87],[14.25,0.25,60,0.66],[14.5,0.25,62,0.76],[14.75,0.25,67,0.66],[15,0.25,64,0.9],[15.25,0.25,62,0.66],[15.5,0.25,59,0.76],[15.75,0.25,55,0.66]]`
- **Karte:** „Mechanische 16tel-Stufen mit kurzem Resonanz-Klick – erinnert an die Sequenzer-Züge der späten 70er (Stil Kraftwerk).“

### 3.4 K3 „Laufsteg-Lead“ – Rolle Lead · VA

- **Vorbild (ⓘ):** Säge-Lead, Filter leicht vom LFO bewegt (WAHRSCHEINLICH, eine Museumsquelle). Gerät Polymoog oder Minimoog (Quellen uneinig).
- **Rezept:** `o1w 0, o2w 0, o2fine 7, o2lvl .85, ftype 1, cutoff 1900, res .18, drive .15, kt .55, fenv .15, fA .01, fD .5, fS .7, aA .012, aD .4, aS .85, aR .3, ampVel .3, poly 4, l1shape 1, l1rate 5.5, analog .2, spread .2` · Route `M('lfo1','cutoff', .025)` · fx `{rev .25, dly .15}` · bus `{echo:{divL:'1/8.', fb .25}}`
- **Warum so:** Zwei Sägen 7 ct auseinander, 12-dB-Filter (glatter, „kühler“ als 24 dB). Der LFO bewegt das Filter nur um ≈ ±0,6 HT (0,025 · 24): Man hört ein leises Wabern, kein Wah. Polyphon 4, damit Liegetöne überlappen dürfen.
- **Lage / Rolle:** A4–D6 (69–86), am besten C5–C6. Lead. Lagen-Grenze **tief A4**: Darunter wird er mumpfig und kollidiert mit der Stimme.
- **Hörprobe** (8 Takte, d-Moll, lange Töne, Frage in Takt 1–4 bis C6, Antwort tiefer in Takt 5–6, Höhepunkt D6 in Takt 7, Halbschluss auf A-Dur):
```
Tempo 120 BPM · 8 Takte · Akkorde: Dm | Dm | Bb | C | Dm | Dm | Gm | A
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D5(74) 0/4/100 · F5(77) 4/4/95 · A5(81) 8/6/100 · G5(79) 14/2/85
T2: F5(77) 16/4/95 · E5(76) 20/4/90 · D5(74) 24/8/95
T3: D5(74) 32/2/95 · F5(77) 34/2/90 · Bb5(82) 36/6/100 · A5(81) 42/2/85 · G5(79) 44/4/90
T4: E5(76) 48/4/95 · G5(79) 52/4/95 · C6(84) 56/4/105 · Bb5(82) 60/2/90 · A5(81) 62/2/90
T5: A4(69) 64/4/95 · D5(74) 68/4/95 · F5(77) 72/4/100 · E5(76) 76/2/85 · D5(74) 78/2/85
T6: C5(72) 80/4/90 · D5(74) 84/2/90 · E5(76) 86/2/90 · F5(77) 88/8/100
T7: G5(79) 96/4/100 · Bb5(82) 100/4/100 · D6(86) 104/4/105 · C6(84) 108/2/90 · Bb5(82) 110/2/90
T8: A5(81) 112/6/100 · G5(79) 118/2/85 · E5(76) 120/2/90 · C#5(73) 122/2/90 · A4(69) 124/4/100
```
Dauer: alle 8 Takte 16,0 s · kurz (≤ 8 s) T1, T2, T3, T8 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4, T5, T6, T7, T8 = 16,0 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,1,74,0.79],[1,1,77,0.75],[2,1.5,81,0.79],[3.5,0.5,79,0.67],[4,1,77,0.75],[5,1,76,0.71],[6,2,74,0.75],[8,0.5,74,0.75],[8.5,0.5,77,0.71],[9,1.5,82,0.79],[10.5,0.5,81,0.67],[11,1,79,0.71],[12,1.5,81,0.79],[13.5,0.5,79,0.67],[14,0.5,76,0.71],[14.5,0.5,73,0.71],[15,1,69,0.79]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 8`): `[[0,1,74,0.79],[1,1,77,0.75],[2,1.5,81,0.79],[3.5,0.5,79,0.67],[4,1,77,0.75],[5,1,76,0.71],[6,2,74,0.75],[8,0.5,74,0.75],[8.5,0.5,77,0.71],[9,1.5,82,0.79],[10.5,0.5,81,0.67],[11,1,79,0.71],[12,1,76,0.75],[13,1,79,0.75],[14,1,84,0.83],[15,0.5,82,0.71],[15.5,0.5,81,0.71],[16,1,69,0.75],[17,1,74,0.75],[18,1,77,0.79],[19,0.5,76,0.67],[19.5,0.5,74,0.67],[20,1,72,0.71],[21,0.5,74,0.71],[21.5,0.5,76,0.71],[22,2,77,0.79],[24,1,79,0.79],[25,1,82,0.79],[26,1,86,0.83],[27,0.5,84,0.71],[27.5,0.5,82,0.71],[28,1.5,81,0.79],[29.5,0.5,79,0.67],[30,0.5,76,0.71],[30.5,0.5,73,0.71],[31,1,69,0.79]]`
- **Karte:** „Kühles Säge-Lead mit leise atmendem Filter, lange Töne – erinnert an den Laufsteg-Pop von 1978 (Stil Kraftwerk).“

### 3.5 K4 „Metall-Pads“ – Rolle Drums · Drum-Synth

- **Vorbild (ⓘ):** selbst gebaute E-Drum-Pads und umgebaute Rhythmusgeräte (BELEGT). Das Electro-Percussion-Muster der frühen 80er (BELEGT als Beschreibung). Die einzelnen Klänge sind UNBELEGT: Das Kit ist eine Einschätzung.
- **Kit-Rezept (Schichten nach Spec v2 §7.1):**
  - KICK: TON Sinus 55 Hz, Pitch-Sweep +12 HT in 15 ms, Decay 0,25 s, kein KLICK.
  - SNARE: TON 190 Hz Decay 0,08 + RAUSCHEN BP 2 kHz Decay 0,12, trocken.
  - HH ZU: METALL Decay 0,03.
  - PERC „Klack“: KLICK „Knock“ + TON 820 Hz Decay 0,04.
  - Kit-Bus: ROOM-Send 0,1, GATE-Send 0, kein Hall auf der Kick.
- **Lage / Rolle:** Drums, trocken und kurz. Transposition gilt nicht.
- **Hörprobe** (4 Takte, 120 BPM, Takt 4 = Snare-Wirbel als Wendung):
```
Tempo 120 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK  | x.....x...x..... | x.....x...x...x. | x.....x.x.x..... | x.....x...x.....
SNARE | ....x.......x... | ....x.......x..x | ....x.......x... | ....x.......xxxx
HH ZU | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.x.x. | x.x.x.x.xxx.x.x. | x.x.x.x.x.x.....
PERC  | ...........x.... | ..x............. | ...........x..x. | .........x.x.x..
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s
- **Karte:** „Trockene, kurze Elektro-Pads mit metallischem Klack – erinnert an die Rechner-Rhythmen der frühen 80er (Stil Kraftwerk).“

---

## 4. Duran Duran (`vorbild: duran-duran`, neu)

### 4.1 Belege

| Fakt | Status | Quelle |
|---|---|---|
| „Rio“: Rhodes spielte das Synth-Lead mit dem **Arpeggiator des Jupiter-4 auf ZUFALL** über einem gehaltenen Akkord | BELEGT (Wikipedia + Roland-Interview: „Jupiter-4 provided the juddering intro to Rio“) | Wikipedia „Rio (song)“; Roland UK Blog „Nick Rhodes on the Roland synths…“ |
| Welcher Akkord: Cmaj7 (Wikipedia aktuell) oder c-Moll (ältere Fassung, Fan-Wiki) | WAHRSCHEINLICH, Quellen uneinig | Wikipedia; duranduran.fandom.com |
| „Rio“-Intro: kleine Metallstäbe auf die Saiten eines Flügels geworfen, Aufnahme rückwärts | BELEGT | Wikipedia „Rio (song)“ |
| „Save a Prayer“ und „The Chauffeur“: **Roland SH-2 + CSQ-100**. „Save a Prayer“ beginnt mit einem arpeggierten, **delay-behandelten** Riff (SH-2), das den ganzen Song durchläuft. | BELEGT | Roland UK Blog; Wikipedia „Save a Prayer“ |
| „Save a Prayer“ steht in **d-Moll** (Strophe; Refrain h-Moll laut Wikipedia-Auszug). Intro-Akkorde laut Akkord-Seiten u. a. Dm, F, B♭(maj7), G | Tonart BELEGT (SE: Wikipedia-Auszug, Mixmeister-Analyse „D m“, Cifra Club „original key of Dm“); Akkorde WAHRSCHEINLICH (Akkord-Seiten, je nach Abschrift verschieden) | https://en.wikipedia.org/wiki/Save_a_Prayer · https://www.cs.ubc.ca/~davet/music/track/DURNDURN_GH1/DURNDURN_GH1-05.html · https://www.cifraclub.com/duran-duran/save-prayer/smjsgkm.html · https://www.cifraclub.com/duran-duran/save-prayer/?locale=en |
| Das Delay war ein Roland **Space Echo**, darüber eine zweite Melodie auf dem Jupiter-8 | WAHRSCHEINLICH (nur ein Suchauszug; eine zweite Suche fand es nicht) | ultimateclassicrock.com „Duran Duran: Save a Prayer“ |
| „Planet Earth“: Sequenz vom **Prophet-5**, Jupiter-4 und **Crumar Performer** für Streicher | BELEGT | Wikipedia „Planet Earth (Duran Duran song)“ |
| Rhodes machte den Crumar Performer auf den frühen Platten bekannt | BELEGT | Wikipedia „Nick Rhodes“ |
| „My three Jupiters and my Moog have been on almost every album“ | BELEGT (Interview) | MusicRadar „Nick Rhodes top 5 synths“ |
| „Hungry Like the Wolf“: Jupiter-8 (+ 808 und Sequenzer laut Andy Taylor) | WAHRSCHEINLICH (Songfacts/Forum, uneinig) | gearspace.com; Songfacts-Auszug |
| Spielweise: langer Sustain, langsames Release, auf dem letzten Ton das Mod-Rad hoch für „Phasing“ | WAHRSCHEINLICH (Nachbau-Tipp, kein Rhodes-Zitat) | gearnews „The Wild Boys: How To Sound Like Duran Duran“ |

### 4.2 D1 „Zufalls-Arp 82“ – Rolle Sequenz/Arp · VA

- **Vorbild (ⓘ):** Polysynth-Arpeggiator auf ZUFALL über einem gehaltenen Septakkord (BELEGT als Technik). Der Klang ist eine Einschätzung (UNBELEGT).
- **Rezept:** `o1w 1, o1pw .45, o2w 0, o2fine 4, o2lvl .5, ftype 0, cutoff 1500, res .32, drive .15, kt .55, fenv .35, fvel .3, fA .001, fD .14, fS .15, fR .15, aA .001, aD .25, aS .25, aR .2, ampVel .5, poly 4, analog .2, spread .35` · fx `{chorus:{mode:'I', mix:.5}, dly .3, rev .3}` · bus `{echo:{mode:'pp', divL:'1/8.', fb .3}}`
- **App-Lücke:** Es gibt keinen Arpeggiator mit ZUFALL. Die Hörprobe ist deshalb eine **feste Zufallsfolge** (Seed 82, keine Tonwiederholung direkt hintereinander, Anschlag 70–114 zufällig). Kommt der Arp, spielt die Hörprobe nur den Akkord und der Arp würfelt.
- **Lage / Rolle:** F3–G5 (53–79). Arp-Schicht über der Fläche. Lagen-Grenze: Akkordtöne über 2 Oktaven, **nie unter E3** (sonst Matsch mit dem Bass).
- **Hörprobe** (4 Takte; andere Akkorde als das Original: Fmaj7 statt Cmaj7/c-Moll, dann Gsus4 → Am7 als Wendung):
```
Tempo 118 BPM · 4 Takte · Akkorde: Fmaj7 | Fmaj7 | Gsus4 (G C D) | Am7
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: C5(72) 0/1/107 · F4(65) 1/1/98 · C4(60) 2/1/111 · E4(64) 3/1/85 · A4(69) 4/1/89 · E5(76) 5/1/93 · C5(72) 6/1/79 · A4(69) 7/1/87 · C5(72) 8/1/74 · A3(57) 9/1/113 · F4(65) 10/1/110 · C4(60) 11/1/78 · A4(69) 12/1/99 · E4(64) 13/1/96 · F3(53) 14/1/80 · C5(72) 15/1/80
T2: F4(65) 16/1/84 · A3(57) 17/1/108 · F4(65) 18/1/92 · A3(57) 19/1/73 · E4(64) 20/1/80 · E5(76) 21/1/78 · E4(64) 22/1/99 · C5(72) 23/1/74 · A4(69) 24/1/75 · E4(64) 25/1/83 · C4(60) 26/1/106 · E4(64) 27/1/79 · E5(76) 28/1/80 · E4(64) 29/1/74 · A4(69) 30/1/94 · C4(60) 31/1/71
T3: G3(55) 32/1/104 · G4(67) 33/1/83 · D4(62) 34/1/85 · D5(74) 35/1/94 · C4(60) 36/1/89 · D4(62) 37/1/100 · G3(55) 38/1/98 · C4(60) 39/1/79 · G4(67) 40/1/100 · G5(79) 41/1/109 · D5(74) 42/1/85 · G5(79) 43/1/86 · G4(67) 44/1/90 · D5(74) 45/1/105 · G4(67) 46/1/106 · G5(79) 47/1/95
T4: C5(72) 48/1/109 · A3(57) 49/1/89 · G4(67) 50/1/90 · A4(69) 51/1/104 · C5(72) 52/1/92 · E4(64) 53/1/93 · A4(69) 54/1/107 · C4(60) 55/1/103 · A4(69) 56/1/98 · G4(67) 57/1/76 · E4(64) 58/1/79 · C4(60) 59/1/109 · A3(57) 60/1/107 · A4(69) 61/1/109 · G5(79) 62/1/107 · A3(57) 63/1/108
```
Dauer: alle 4 Takte 8,1 s · kurz (≤ 8 s) T1, T2, T4 = 6,1 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,1 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.25,72,0.84],[0.25,0.25,65,0.77],[0.5,0.25,60,0.87],[0.75,0.25,64,0.67],[1,0.25,69,0.7],[1.25,0.25,76,0.73],[1.5,0.25,72,0.62],[1.75,0.25,69,0.69],[2,0.25,72,0.58],[2.25,0.25,57,0.89],[2.5,0.25,65,0.87],[2.75,0.25,60,0.61],[3,0.25,69,0.78],[3.25,0.25,64,0.76],[3.5,0.25,53,0.63],[3.75,0.25,72,0.63],[4,0.25,65,0.66],[4.25,0.25,57,0.85],[4.5,0.25,65,0.72],[4.75,0.25,57,0.57],[5,0.25,64,0.63],[5.25,0.25,76,0.61],[5.5,0.25,64,0.78],[5.75,0.25,72,0.58],[6,0.25,69,0.59],[6.25,0.25,64,0.65],[6.5,0.25,60,0.83],[6.75,0.25,64,0.62],[7,0.25,76,0.63],[7.25,0.25,64,0.58],[7.5,0.25,69,0.74],[7.75,0.25,60,0.56],[8,0.25,72,0.86],[8.25,0.25,57,0.7],[8.5,0.25,67,0.71],[8.75,0.25,69,0.82],[9,0.25,72,0.72],[9.25,0.25,64,0.73],[9.5,0.25,69,0.84],[9.75,0.25,60,0.81],[10,0.25,69,0.77],[10.25,0.25,67,0.6],[10.5,0.25,64,0.62],[10.75,0.25,60,0.86],[11,0.25,57,0.84],[11.25,0.25,69,0.86],[11.5,0.25,79,0.84],[11.75,0.25,57,0.85]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,0.25,72,0.84],[0.25,0.25,65,0.77],[0.5,0.25,60,0.87],[0.75,0.25,64,0.67],[1,0.25,69,0.7],[1.25,0.25,76,0.73],[1.5,0.25,72,0.62],[1.75,0.25,69,0.69],[2,0.25,72,0.58],[2.25,0.25,57,0.89],[2.5,0.25,65,0.87],[2.75,0.25,60,0.61],[3,0.25,69,0.78],[3.25,0.25,64,0.76],[3.5,0.25,53,0.63],[3.75,0.25,72,0.63],[4,0.25,65,0.66],[4.25,0.25,57,0.85],[4.5,0.25,65,0.72],[4.75,0.25,57,0.57],[5,0.25,64,0.63],[5.25,0.25,76,0.61],[5.5,0.25,64,0.78],[5.75,0.25,72,0.58],[6,0.25,69,0.59],[6.25,0.25,64,0.65],[6.5,0.25,60,0.83],[6.75,0.25,64,0.62],[7,0.25,76,0.63],[7.25,0.25,64,0.58],[7.5,0.25,69,0.74],[7.75,0.25,60,0.56],[8,0.25,55,0.82],[8.25,0.25,67,0.65],[8.5,0.25,62,0.67],[8.75,0.25,74,0.74],[9,0.25,60,0.7],[9.25,0.25,62,0.79],[9.5,0.25,55,0.77],[9.75,0.25,60,0.62],[10,0.25,67,0.79],[10.25,0.25,79,0.86],[10.5,0.25,74,0.67],[10.75,0.25,79,0.68],[11,0.25,67,0.71],[11.25,0.25,74,0.83],[11.5,0.25,67,0.83],[11.75,0.25,79,0.75],[12,0.25,72,0.86],[12.25,0.25,57,0.7],[12.5,0.25,67,0.71],[12.75,0.25,69,0.82],[13,0.25,72,0.72],[13.25,0.25,64,0.73],[13.5,0.25,69,0.84],[13.75,0.25,60,0.81],[14,0.25,69,0.77],[14.25,0.25,67,0.6],[14.5,0.25,64,0.62],[14.75,0.25,60,0.86],[15,0.25,57,0.84],[15.25,0.25,69,0.86],[15.5,0.25,79,0.84],[15.75,0.25,57,0.85]]`
- **Karte:** „Gewürfelte 16tel über einem gehaltenen Septakkord, mit Chorus und Echo – erinnert an die nervösen Arp-Intros des New Romantic (Stil Duran Duran).“

### 4.3 D2 „Band-Echo-Arp“ – Rolle Sequenz · VA (mono)

- **Vorbild (ⓘ):** Monosynth + Stufen-Sequenzer durch ein Band-Echo, ruhige Ballade (BELEGT: SH-2 + CSQ-100, delay-behandelt). Space Echo WAHRSCHEINLICH.
- **Rezept:** `o1w 2, o2w 0, o2oct -1, o2lvl .25, ftype 0, cutoff 1200, res .25, drive .1, kt .5, fenv .3, fA .002, fD .35, fS .3, fR .3, aA .004, aD .5, aS .45, aR .3, ampVel .4, mode 1, poly 1, glide 0, analog .2, spread 0` · fx `{chorus:{mode:'I', mix:.4}, dly .45, rev .35}` · bus `{echo:{mode:'mono', divL:'1/8.', fb .45, highcut 3500, wow .4, drive .25}}`
- **Warum so:** Dreieck + leise Säge eine Oktave tiefer gibt einen weichen Monoton. Das Echo auf **1/8 punktiert** gegen gerade Achtel erzeugt das „Mitlaufen“ zwischen den Tönen (Nachbau-Anleitungen nennen punktierte Achtel bzw. 3/16, WAHRSCHEINLICH). `wow .4` gibt das Band-Leiern.
- **Lage / Rolle:** F3–C5 (53–72), am besten C3–C5. Sequenz/Intro-Figur. Lagen-Grenze: bleibt zwischen C3 und C5 (die Probe liegt jetzt ganz darin; die erste Fassung begann T2 auf B♭2). Bei Akkordwechseln **nächstliegend** transponieren, nie springen.
- **Hörprobe** (4 Takte, 84 BPM, **g-Moll**, Folge i–v–VII–IV, Achtel-Arpeggio mit wechselnder Kontur je Takt, Takt 1 beginnt Terz–Grundton–Quinte–None, Takt 4 steigt bis C5 als Wendung). **Nach Review neu:** Die erste Fassung stand wie „Save a Prayer“ in d-Moll mit Dm | B♭ | F | C und brach damit Regel 3 (§1). **Eigene Melodie; vor V10d hört ein Mensch gegen das Original (Vermerk „eigene Melodie“ in CHANGES).**
```
Tempo 84 BPM · 4 Takte · Akkorde: Gm | Dm | F | C
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: Bb3(58) 0/2/100 · G3(55) 2/2/84 · D4(62) 4/2/100 · A4(69) 6/2/84 · G4(67) 8/2/100 · D4(62) 10/2/84 · Bb3(58) 12/2/100 · D4(62) 14/2/84
T2: A3(57) 16/2/100 · F3(53) 18/2/84 · D4(62) 20/2/100 · E4(64) 22/2/84 · F4(65) 24/2/100 · A4(69) 26/2/84 · D4(62) 28/2/100 · A3(57) 30/2/84
T3: C4(60) 32/2/100 · A3(57) 34/2/84 · F4(65) 36/2/100 · G4(67) 38/2/84 · A4(69) 40/2/100 · C5(72) 42/2/84 · A4(69) 44/2/100 · F4(65) 46/2/84
T4: E4(64) 48/2/92 · G3(55) 50/2/94 · C4(60) 52/2/96 · D4(62) 54/2/98 · E4(64) 56/2/100 · G4(67) 58/2/102 · A4(69) 60/2/104 · C5(72) 62/2/106
```
Dauer: alle 4 Takte 11,4 s · kurz (≤ 8 s) T1, T4 = 5,7 s · ganz (≤ 16 s) T1, T2, T3, T4 = 11,4 s
aud-Daten kurz (Spec v3 §12.8, `len 2`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.5,58,0.79],[0.5,0.5,55,0.66],[1,0.5,62,0.79],[1.5,0.5,69,0.66],[2,0.5,67,0.79],[2.5,0.5,62,0.66],[3,0.5,58,0.79],[3.5,0.5,62,0.66],[4,0.5,64,0.72],[4.5,0.5,55,0.74],[5,0.5,60,0.76],[5.5,0.5,62,0.77],[6,0.5,64,0.79],[6.5,0.5,67,0.8],[7,0.5,69,0.82],[7.5,0.5,72,0.83]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,0.5,58,0.79],[0.5,0.5,55,0.66],[1,0.5,62,0.79],[1.5,0.5,69,0.66],[2,0.5,67,0.79],[2.5,0.5,62,0.66],[3,0.5,58,0.79],[3.5,0.5,62,0.66],[4,0.5,57,0.79],[4.5,0.5,53,0.66],[5,0.5,62,0.79],[5.5,0.5,64,0.66],[6,0.5,65,0.79],[6.5,0.5,69,0.66],[7,0.5,62,0.79],[7.5,0.5,57,0.66],[8,0.5,60,0.79],[8.5,0.5,57,0.66],[9,0.5,65,0.79],[9.5,0.5,67,0.66],[10,0.5,69,0.79],[10.5,0.5,72,0.66],[11,0.5,69,0.79],[11.5,0.5,65,0.66],[12,0.5,64,0.72],[12.5,0.5,55,0.74],[13,0.5,60,0.76],[13.5,0.5,62,0.77],[14,0.5,64,0.79],[14.5,0.5,67,0.8],[15,0.5,69,0.82],[15.5,0.5,72,0.83]]`
- **Karte:** „Ruhiges Achtel-Arpeggio durch ein leierndes Band-Echo – erinnert an die verträumten Balladen-Intros von 1982 (Stil Duran Duran).“

### 4.4 D3 „Hymnen-Poly 82“ – Rolle Akkord/Stab · VA

- **Vorbild (ⓘ):** großer analoger Polysynth (Jupiter-8 laut Rhodes zentral, BELEGT), Spielweise mit langem Release und Mod-Rad am Schluss (WAHRSCHEINLICH).
- **Rezept:** `o1w 0, o2w 1, o2pw .45, o2fine -7, o2lvl .8, ftype 0, cutoff 1000, res .2, drive .2, kt .5, fenv .38, fvel .3, fA .015, fD .7, fS .5, fR .9, aA .01, aD 1, aS .9, aR 1.4, ampVel .35, poly 6, analog .3, spread .5` · Route `M('mw','pw', .4)` (Mod-Rad = PWM-Schweben als „Phasing“) · fx `{chorus:{mode:'II', mix:.5}, dly .15, rev .35}`
- **Lage / Rolle:** E3–G4 (52–67), am besten C3–C5. Akkorde, synkopiert. Lagen-Grenze: Akkord-Stimmführung in C3–C5. Beim Wechsel C → a-Moll lieber **nach unten** (a-Moll in Grundstellung A3), damit der Klang nicht schrill wird.
- **Hörprobe** (4 Takte, synkopierte Stöße, Takt 4 Esus4 → E-Dur lang als Wendung; im Original-Spiel dort Mod-Rad hoch):
```
Tempo 116 BPM · 4 Takte · Akkorde: Am7 | Fmaj7 | G6 | Esus4 → E
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A3(57) 0/3/105 · C4(60) 0/3/105 · E4(64) 0/3/105 · G4(67) 0/3/105 · A3(57) 6/2/88 · C4(60) 6/2/88 · E4(64) 6/2/88 · G4(67) 6/2/88 · A3(57) 10/2/92 · C4(60) 10/2/92 · E4(64) 10/2/92 · G4(67) 10/2/92 · A3(57) 12/4/98 · C4(60) 12/4/98 · E4(64) 12/4/98 · G4(67) 12/4/98
T2: F3(53) 16/3/105 · A3(57) 16/3/105 · C4(60) 16/3/105 · E4(64) 16/3/105 · F3(53) 22/2/88 · A3(57) 22/2/88 · C4(60) 22/2/88 · E4(64) 22/2/88 · F3(53) 26/6/98 · A3(57) 26/6/98 · C4(60) 26/6/98 · E4(64) 26/6/98
T3: G3(55) 32/3/105 · B3(59) 32/3/105 · D4(62) 32/3/105 · E4(64) 32/3/105 · G3(55) 38/2/88 · B3(59) 38/2/88 · D4(62) 38/2/88 · E4(64) 38/2/88 · G3(55) 42/2/92 · B3(59) 42/2/92 · D4(62) 42/2/92 · E4(64) 42/2/92 · G3(55) 44/4/98 · B3(59) 44/4/98 · D4(62) 44/4/98 · E4(64) 44/4/98
T4: E3(52) 48/8/104 · A3(57) 48/8/104 · B3(59) 48/8/104 · E4(64) 48/8/104 · E3(52) 56/8/110 · Ab3(56) 56/8/110 · B3(59) 56/8/110 · E4(64) 56/8/110
```
Dauer: alle 4 Takte 8,3 s · kurz (≤ 8 s) T1, T2, T4 = 6,2 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,3 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.75,57,0.83],[0,0.75,60,0.83],[0,0.75,64,0.83],[0,0.75,67,0.83],[1.5,0.5,57,0.69],[1.5,0.5,60,0.69],[1.5,0.5,64,0.69],[1.5,0.5,67,0.69],[2.5,0.5,57,0.72],[2.5,0.5,60,0.72],[2.5,0.5,64,0.72],[2.5,0.5,67,0.72],[3,1,57,0.77],[3,1,60,0.77],[3,1,64,0.77],[3,1,67,0.77],[4,0.75,53,0.83],[4,0.75,57,0.83],[4,0.75,60,0.83],[4,0.75,64,0.83],[5.5,0.5,53,0.69],[5.5,0.5,57,0.69],[5.5,0.5,60,0.69],[5.5,0.5,64,0.69],[6.5,1.5,53,0.77],[6.5,1.5,57,0.77],[6.5,1.5,60,0.77],[6.5,1.5,64,0.77],[8,2,52,0.82],[8,2,57,0.82],[8,2,59,0.82],[8,2,64,0.82],[10,2,52,0.87],[10,2,56,0.87],[10,2,59,0.87],[10,2,64,0.87]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,0.75,57,0.83],[0,0.75,60,0.83],[0,0.75,64,0.83],[0,0.75,67,0.83],[1.5,0.5,57,0.69],[1.5,0.5,60,0.69],[1.5,0.5,64,0.69],[1.5,0.5,67,0.69],[2.5,0.5,57,0.72],[2.5,0.5,60,0.72],[2.5,0.5,64,0.72],[2.5,0.5,67,0.72],[3,1,57,0.77],[3,1,60,0.77],[3,1,64,0.77],[3,1,67,0.77],[4,0.75,53,0.83],[4,0.75,57,0.83],[4,0.75,60,0.83],[4,0.75,64,0.83],[5.5,0.5,53,0.69],[5.5,0.5,57,0.69],[5.5,0.5,60,0.69],[5.5,0.5,64,0.69],[6.5,1.5,53,0.77],[6.5,1.5,57,0.77],[6.5,1.5,60,0.77],[6.5,1.5,64,0.77],[8,0.75,55,0.83],[8,0.75,59,0.83],[8,0.75,62,0.83],[8,0.75,64,0.83],[9.5,0.5,55,0.69],[9.5,0.5,59,0.69],[9.5,0.5,62,0.69],[9.5,0.5,64,0.69],[10.5,0.5,55,0.72],[10.5,0.5,59,0.72],[10.5,0.5,62,0.72],[10.5,0.5,64,0.72],[11,1,55,0.77],[11,1,59,0.77],[11,1,62,0.77],[11,1,64,0.77],[12,2,52,0.82],[12,2,57,0.82],[12,2,59,0.82],[12,2,64,0.82],[14,2,52,0.87],[14,2,56,0.87],[14,2,59,0.87],[14,2,64,0.87]]`
- **Karte:** „Breite Analog-Akkorde, synkopiert gestoßen, langes Ausklingen – erinnert an die Stadion-Hymnen des New Romantic (Stil Duran Duran).“

**Nicht nachbaubar:** das rückwärts abgespielte Flügel-Intro (Audio rückwärts gibt es in der App nicht; Samples fremder Aufnahmen sind ohnehin tabu, §1).

---

## 5. Jean-Michel Jarre (`vorbild: jarre`, schon in R6 §11 Gruppe 3)

Vorhanden: Werk „Pfeif-Sequenz“ und „Berlin-Schule“, R6 N69/N70 (Tropfen; wie Jarre sie baute, ist laut R6 §2.1 UNBELEGT). Neu sind hier die belegten Kennklänge.

### 5.1 Belege

| Fakt | Status | Quelle |
|---|---|---|
| „Oxygène IV“: EMS VCS3, Eminent 310, RMI Harmonic Synthesizer, ARP 2600, auf eine 8-Spur-Maschine geschichtet, Effekte vor allem Band-Echo und Gitarren-Pedale, aufgenommen in der Küche | BELEGT | MusicRadar „40 greatest synth sounds, No 5“ |
| Das Rauschen am Anfang („Wind“) kommt vom VCS3 | BELEGT | Wikipedia „Oxygène (Part IV)“ |
| „Oxygène IV“ ist in **c-Moll** veröffentlicht (Klavier-Ausgabe von Patrik Pietschmann, „published key C minor“, Tempo etwa 120 BPM). Akkorde Cm, A♭, B♭ laut Crowd-Akkordliste | Tonart WAHRSCHEINLICH (eine Notenausgabe, SE); Akkorde WAHRSCHEINLICH (schwache Quelle) | https://www.musicnotes.com/l/lxlKP · https://chordu.com/artist-chords-jean-michel-jarre (aus dem Review, nicht selbst abgerufen) |
| **Eminent 310 durch Electro-Harmonix Small Stone (Phaser)** = die wirbelnden Flächen. „Equinoxe Part 1“: Eminent-Streicher SUST + 8′-Orgel-Register mit Chorus | BELEGT | Wikipedia „Equinoxe“; hifinews „Equinoxe Production Notes“ |
| Der Eminent-Streicherklang ist ein Markenzeichen von „Oxygène“ und „Equinoxe“ | WAHRSCHEINLICH | hollowsun.com „Eminent String Synth“ |
| **RMI Harmonic Synthesizer**: Bässe (Teil II, IV), Leads (IV, V), Sequenzen (V), meist durch einen **Electric-Mistress-Flanger** | WAHRSCHEINLICH (Text zu einer Emulation) | sonicstate.com „World's First Digital Synth Revived For Reason“ |
| Rhythmus: Korg/Keio **Mini Pops** (MP-7). „Oxygène 2 und 4“ kombinieren Beguine + Slow Rock (zwei Tasten gleichzeitig) | Gerät BELEGT (hifinews Equinoxe: „very basic Korg Minipops“); Kombination WAHRSCHEINLICH (Händler/Fanseite) | soundgas.com; hollowsun.com „Mini Pops“ |
| „Equinoxe“: Matrisequencer 250 (Michel Geiss), Rhythmicomputer. Credits: ARP Sequencer, Oberheim Digital Sequencer, Yamaha/Oberheim Polyphonic, Korg Polyphonic Ensemble | BELEGT | Wikipedia „Equinoxe“ |

### 5.2 J1 „Phasen-Streicher“ – Rolle Fläche · VA

- **Vorbild (ⓘ):** Orgel-Streicher-Maschine durch einen Phaser (BELEGT).
- **Rezept:** `o1w 0, o2w 0, o2oct 1, o2fine 3, o2lvl .55, ftype 1, cutoff 3200, res .05, drive 0, kt .4, fenv 0, aA .35, aD 1, aS 1, aR 2.2, ampVel .2, poly 6, analog .2, spread .3, l1shape 1, l1rate .18` · Route `M('lfo1','cutoff', .04)` · fx `{chorus:{mode:'BREIT', mix:.8}, rev .5}` · bus `{hall:{decay 5, size 1.2}}`
- **App-Lücke Phaser:** Es gibt keinen Phaser-Effekt. Der Kern des Klangs fehlt also. Annäherung: Chorus BREIT (0,25 Hz, Gegenphase) + langsamer LFO auf den Cutoff. **Empfehlung:** FX-Block „Phaser“ (4/6 Allpass-Stufen, Rate 0,05–2 Hz, Tiefe, Feedback, Mix), danach dieses Rezept mit `phaser:{stages 4, rate .15, depth .9, fb .5}` (eigene Werte, UNBELEGT, an die Small-Stone-Bauart nur angelehnt).
- **Lage / Rolle:** D3–G4 (50–67), am besten C3–C5. Fläche. Lagen-Grenze: Akkorde zwischen C3 und C5. Die Oberstimme darf wandern.
- **Hörprobe** (4 Takte, 96 BPM, d-Moll, liegende Akkorde mit wandernder Oberstimme F4 → G4 → F4 → D4 → E4, Wendung A7sus4 → A):
```
Tempo 96 BPM · 4 Takte · Akkorde: Dm | Bb(add6) | Gm7 → Gm | A7sus4 → A
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D3(50) 0/16/90 · A3(57) 0/16/90 · D4(62) 0/16/90 · F4(65) 0/16/92
T2: D3(50) 16/16/90 · F3(53) 16/16/90 · Bb3(58) 16/16/90 · F4(65) 16/8/92 · G4(67) 24/8/94
T3: D3(50) 32/16/90 · G3(55) 32/16/90 · Bb3(58) 32/16/90 · F4(65) 32/8/94 · D4(62) 40/8/90
T4: E3(52) 48/8/90 · G3(55) 48/8/90 · A3(57) 48/8/90 · D4(62) 48/8/92 · E3(52) 56/8/96 · A3(57) 56/8/96 · C#4(61) 56/8/96 · E4(64) 56/8/98
```
Dauer: alle 4 Takte 10,0 s · kurz (≤ 8 s) T1, T2, T4 = 7,5 s · ganz (≤ 16 s) T1, T2, T3, T4 = 10,0 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,4,50,0.71],[0,4,57,0.71],[0,4,62,0.71],[0,4,65,0.72],[4,4,50,0.71],[4,4,53,0.71],[4,4,58,0.71],[4,2,65,0.72],[6,2,67,0.74],[8,2,52,0.71],[8,2,55,0.71],[8,2,57,0.71],[8,2,62,0.72],[10,2,52,0.76],[10,2,57,0.76],[10,2,61,0.76],[10,2,64,0.77]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,4,50,0.71],[0,4,57,0.71],[0,4,62,0.71],[0,4,65,0.72],[4,4,50,0.71],[4,4,53,0.71],[4,4,58,0.71],[4,2,65,0.72],[6,2,67,0.74],[8,4,50,0.71],[8,4,55,0.71],[8,4,58,0.71],[8,2,65,0.74],[10,2,62,0.71],[12,2,52,0.71],[12,2,55,0.71],[12,2,57,0.71],[12,2,62,0.72],[14,2,52,0.76],[14,2,57,0.76],[14,2,61,0.76],[14,2,64,0.77]]`
- **Karte:** „Wirbelnde Streicher-Fläche aus der Orgel-Ecke – erinnert an die Weltraum-Flächen der späten 70er (Stil Jean-Michel Jarre). Echter Phaser folgt.“

### 5.3 J2 „Raum-Lead 76“ – Rolle Lead · VA

- **Vorbild (ⓘ):** frühes Digital-/Orgel-Lead durch einen Flanger, Band-Echo (WAHRSCHEINLICH).
- **Rezept:** `o1w 0, o2w 0, o2oct 1, o2fine 4, o2lvl .35, o3w 1, o3lvl .3, ftype 0, cutoff 2400, res .15, drive .15, kt .6, fenv .18, fA .01, fD .4, fS .7, aA .02, aD .4, aS .9, aR .5, ampVel .3, mode 2, poly 1, glide .06, l2shape 0, l2rate 5.2, l2fade .6, analog .2, spread 0` · Route `M('lfo2','pitch', .004)` · fx `{chorus:{mode:'I+II', mix:.5}, dly .3, rev .4}` · bus `{echo:{mode:'st', divL:'1/4', fb .35, wow .3}, hall:{decay 4}}`
- **App-Lücke Flanger:** Chorus I+II (schnell, 3,3–3,7 ms) ist die nächste Annäherung. Ein Flanger (kurze Verzögerung 0,5–5 ms mit Feedback) wäre der saubere Weg (§9).
- **Lage / Rolle:** G♯4–C6 (68–84), am besten C5–C6. Lead über Fläche und Rhythmus-Kiste. Lagen-Grenze **tief G4**.
- **Hörprobe** (8 Takte, 104 BPM, **a-Moll**, Folge i–iv–v–i | VI–iv–V–V, Frage in Takt 1–4 mit langem A5 und Vibrato, Antwort ab Takt 5 bis C6, Halbschluss auf E mit G♯ als Leitton). **Nach Review neu:** Die erste Fassung stand wie „Oxygène IV“ in c-Moll mit Cm | A♭ | B♭ und begann mit Quinte lang → Grundton → Terz; das brach Regel 3 (§1). Der Kopf beginnt jetzt Terz–Sekunde–Grundton–Quinte. **Eigene Melodie; vor V10d gegen „Oxygène IV“ abhören (Vermerk „eigene Melodie“).**
```
Tempo 104 BPM · 8 Takte · Akkorde: Am | Dm | Em | Am | F | Dm | E | E
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: C5(72) 0/4/95 · B4(71) 4/2/85 · A4(69) 6/2/88 · E5(76) 8/6/100 · D5(74) 14/2/85
T2: F5(77) 16/6/98 · E5(76) 22/2/88 · D5(74) 24/4/90 · A4(69) 28/4/85
T3: B4(71) 32/4/90 · E5(76) 36/4/95 · G5(79) 40/6/100 · E5(76) 46/2/85
T4: A5(81) 48/12/100 · G5(79) 60/2/85 · E5(76) 62/2/85
T5: C6(84) 64/6/105 · A5(81) 70/2/90 · F5(77) 72/4/95 · G5(79) 76/4/92
T6: A5(81) 80/6/98 · F5(77) 86/2/88 · D5(74) 88/4/90 · E5(76) 92/4/92
T7: Ab5(80) 96/8/100 · B5(83) 104/4/100 · E5(76) 108/4/90
T8: D5(74) 112/4/95 · C5(72) 116/4/90 · B4(71) 120/4/90 · Ab4(68) 124/4/85
```
Dauer: alle 8 Takte 18,5 s · kurz (≤ 8 s) T1, T2, T8 = 6,9 s · ganz (≤ 16 s) T1, T2, T3, T4, T5, T8 = 13,8 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,1,72,0.75],[1,0.5,71,0.67],[1.5,0.5,69,0.69],[2,1.5,76,0.79],[3.5,0.5,74,0.67],[4,1.5,77,0.77],[5.5,0.5,76,0.69],[6,1,74,0.71],[7,1,69,0.67],[8,1,74,0.75],[9,1,72,0.71],[10,1,71,0.71],[11,1,68,0.67]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 6`): `[[0,1,72,0.75],[1,0.5,71,0.67],[1.5,0.5,69,0.69],[2,1.5,76,0.79],[3.5,0.5,74,0.67],[4,1.5,77,0.77],[5.5,0.5,76,0.69],[6,1,74,0.71],[7,1,69,0.67],[8,1,71,0.71],[9,1,76,0.75],[10,1.5,79,0.79],[11.5,0.5,76,0.67],[12,3,81,0.79],[15,0.5,79,0.67],[15.5,0.5,76,0.67],[16,1.5,84,0.83],[17.5,0.5,81,0.71],[18,1,77,0.75],[19,1,79,0.72],[20,1,74,0.75],[21,1,72,0.71],[22,1,71,0.71],[23,1,68,0.67]]`
- **Karte:** „Singendes Lead mit verzögertem Vibrato, Schwebe-Effekt und Band-Echo – erinnert an die Heimstudio-Leads von 1976 (Stil Jean-Michel Jarre).“

### 5.4 J3 „Rhythmus-Kiste 76“ – Rolle Drums · Drum-Synth

- **Vorbild (ⓘ):** einfache Preset-Rhythmusbox der 70er, zwei Muster gleichzeitig (WAHRSCHEINLICH).
- **Kit-Rezept:**
  - KICK: TON 80 Hz, kein Sweep, Decay 0,12 (bongoartig weich).
  - RIM: KLICK Tick + TON 1,7 kHz Decay 0,02.
  - SHAKER: RAUSCHEN HP 6 kHz Decay 0,04.
  - PERC: TON 2,5 kHz Decay 0,03 (Clave).
  - Kit-Bus: kein GATE. Der Kit-Bus hat nur ROOM 0,7 s (Spec v2 §7.1); Hall 3 s kommt über den Hall-Send der Spur, mit Echo 1/8 auf PERC.
- **Lage / Rolle:** Drums, leise und klein, nie laut. Transposition gilt nicht.
- **Hörprobe** (4 Takte, Beguine-artige Kick + Clave-Muster, Takt 4 Clave-Wirbel):
```
Tempo 104 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK   | x.....x.x....... | x.....x.x....... | x.....x.x.....x. | x.....x.x.x.x...
RIM    | ....x.......x... | ....x.......x..x | ....x.......x... | ....x..x....x...
SHAKER | x.xxx.xxx.xxx.xx | x.xxx.xxx.xxx.xx | x.xxx.xxx.xxx.xx | x.xxx.xxx.x.....
PERC   | ...x......x..... | ...x.....x..x... | ...x......x..... | ..x..x..x..x..x.
```
Dauer: alle 4 Takte 9,2 s · kurz (≤ 8 s) T1, T2, T4 = 6,9 s · ganz (≤ 16 s) T1, T2, T3, T4 = 9,2 s
- **Karte:** „Kleine Preset-Rhythmusbox mit Clave und Shaker – erinnert an die Heimstudio-Rhythmen der 70er (Stil Jean-Michel Jarre).“

---

## 6. Isao Tomita (`vorbild: tomita`, neu)

### 6.1 Belege

| Fakt | Status | Quelle |
|---|---|---|
| „Snowflakes Are Dancing“ (1974): Debussy-Bearbeitungen auf **Moog und Mellotron**, Polyphonie durch Mehrspur (jede Stimme einzeln), 14 Monate Arbeit | BELEGT | Wikipedia „Snowflakes Are Dancing“ |
| Klangpalette: **Pfiffe**, abstrakte **Glockenklänge**, Raum, Streicher-Nachbildung. Effekte: Hall, **Phasing**, Flanging, **Ringmodulation**. Die Pfeifklänge wurden später in Presets anderer Instrumente nachgebaut. | BELEGT (Wikipedia-Auszug bzw. Spiegel) | Wikipedia „Snowflakes Are Dancing“, „Isao Tomita“ |
| Tomita kaufte einen Moog III (laut Equipboard III-C für 10 Mio. Yen) | Moog III BELEGT (Wikipedia); Preis WAHRSCHEINLICH | Wikipedia „Isao Tomita“; equipboard.com |
| Tomita bearbeitete Mellotron-Klänge, vor allem den **8-Voice-Choir**, zu „ätherischen“ Effekten | WAHRSCHEINLICH (Wikipedia-Spiegel) | chise.org-Spiegel „Isao Tomita“ |
| **Pfiff-Patch**: Tomita gab Allen Strange ein Patch-Diagramm für dessen Buch „Electronic Music“ (2. Aufl.). Nachbau: **selbstschwingendes Filter als Tongeber**, Hüllkurven, **Rauschen** („optional, aber nötig für den Tomita-Pfiff“) | Diagramm BELEGT laut Artikel; Bauweise WAHRSCHEINLICH (Nachbau AJH Synth) | synthtopia.com „Recreating Isao Tomita's Iconic 'Whistle' Patch“ (2021) |
| Nachbau-Mischung: LFO und **Tonhöhen-Hüllkurve** in den Filter-Eingang, VCA mit Anschlag | WAHRSCHEINLICH | matrixsynth.com „Tomita whistle patch tutorial“ (2021) |
| Glocken-Patch (Nachbau): 3 VCOs, Mixer, 24-dB-Tiefpass, 2 Hüllkurven, VCA | WAHRSCHEINLICH | synthtopia.com „Snowflakes Are Dancing Bell Patch Tutorial“ (2023) |
| „Pyramid Sound“ als Tomitas Begriff für geschichtete Mono-Stimmen | UNBELEGT (nur eine Suchzusammenfassung, keine Quelle) | – |

### 6.2 T1 „Pfeif-Stimme“ – Rolle Lead · VA (auf Basis des Werks-Sounds „Pfeif-Lead“)

- **Vorbild (ⓘ):** Moog-Pfiff aus selbstschwingendem Filter + Rauschen (WAHRSCHEINLICH, nach Tomitas Diagramm).
- **Rezept:**
  - Klang: `ftype 1, o1w 2, o1lvl .1, o2lvl 0, noise .15, cutoff 525.4, res 1.02, drive .1, bass 0, kt 1, fenv 0, fvel 0, aA .08, aD .3, aS .9, aR .6, ampVel .3`
  - Stimme, Hüllkurve, LFO: `mode 2, poly 1, glide .12, mA .001, mD .08, mS 0, mR .05, l2shape 0, l2rate 5, l2fade .9, analog .02, spread 0`
  - Routen: `M('menv','pitch', .04)` (≈ +1 HT Anblas-Schleifer, fällt in 80 ms), `M('lfo2','pitch', .004)`, `M('lfo2','cutoff', .0006)`
  - fx `{rev .55, dly .25}` · bus `{hall:{decay 6, size 1.3}}`
- **Warum so:** Die Filter-Werte stammen aus dem Werks-„Pfeif-Lead“ (dort gemessen: ±1 ct von C3 bis C5). Neu sind mehr Rauschen (Atem), ein kurzer Tonhöhen-Schleifer von oben (eigene Einschätzung, UNBELEGT), langsamer Einsatz und Hall.
- **Lage / Rolle:** Die Hörprobe liegt G4–G5 (67–79), also im Bereich, den das Lead-Gate prüft (C3–C6). Gemessen sauber ist der Werks-Klang nur C3–C5. **Vor Freigabe G5–C6 nachmessen.** Am schönsten klingt ein Pfiff eigentlich eine Oktave höher, das ginge erst nach einer Messung bis C7. Lead, frei schwebend. Lagen-Grenze **tief C4** (darunter klingt es nach Flöte, nicht nach Pfiff).
- **Hörprobe** (8 Takte, 72 BPM, impressionistisch: Fmaj7 – Em7 – Dm7 – G7sus4; Bögen mit Glide, Takt 4 Sprung nach oben, Takt 5 Höhepunkt G5, Schluss auf E5 lang mit Vibrato):
```
Tempo 72 BPM · 8 Takte · Akkorde: Fmaj7 | Em7 | Dm7 | G7sus4 | Fmaj7 | Em7 | Dm7 | Cmaj9
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: C5(72) 0/6/90 · A4(69) 6/2/80 · G4(67) 8/8/85
T2: B4(71) 16/4/85 · D5(74) 20/4/90 · E5(76) 24/8/95
T3: F5(77) 32/4/95 · E5(76) 36/2/85 · D5(74) 38/2/85 · C5(72) 40/8/90
T4: A4(69) 48/4/85 · G4(67) 52/4/80 · D5(74) 56/8/95
T5: C5(72) 64/4/90 · E5(76) 68/4/95 · G5(79) 72/8/100
T6: E5(76) 80/4/90 · D5(74) 84/4/85 · B4(71) 88/8/85
T7: A4(69) 96/4/85 · C5(72) 100/4/90 · D5(74) 104/4/90 · F5(77) 108/4/95
T8: E5(76) 112/16/95
```
Dauer: alle 8 Takte 26,7 s · kurz (≤ 8 s) T1, T8 = 6,7 s · ganz (≤ 16 s) T1, T2, T3, T8 = 13,3 s
aud-Daten kurz (Spec v3 §12.8, `len 2`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,1.5,72,0.71],[1.5,0.5,69,0.63],[2,2,67,0.67],[4,4,76,0.75]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,1.5,72,0.71],[1.5,0.5,69,0.63],[2,2,67,0.67],[4,1,71,0.67],[5,1,74,0.71],[6,2,76,0.75],[8,1,77,0.75],[9,0.5,76,0.67],[9.5,0.5,74,0.67],[10,2,72,0.71],[12,4,76,0.75]]`
- **Karte:** „Schwebender Pfiff mit Atem und spätem Vibrato – erinnert an die impressionistischen Synthesizer-Bearbeitungen der 70er (Stil Isao Tomita).“

### 6.3 T2 „Eisglocke“ – Rolle Glocke/Akzent · FM6

- **Vorbild (ⓘ):** abstrakte Glockenklänge, Ringmodulation (BELEGT als Klangpalette). Das Original war subtraktiv bzw. ringmoduliert. FM mit unharmonischen Verhältnissen ist eine **Annäherung** (UNBELEGT, dass Tomita so arbeitete).
- **Rezept (`p.fm6`, DX-Einheiten wie die Werks-Glocken):** `alg 5, fb 3`
  - OP1 Träger: ×1, OL 97, R [96,30,25,35], L [99,0,0,0], rs 2
  - OP2 Modulator: ×3,51 (coarse 3, fine 17), OL 74, R [98,40,25,35], L [99,0,0,0], vs 4
  - OP3 Träger: ×1, det −3, OL 90, R [96,30,25,35], L [99,0,0,0]
  - OP4 Modulator: ×1,41 (coarse 1, fine 41), OL 70, R [98,50,30,35], L [99,20,0,0], vs 3. Das unharmonische √2-Verhältnis gibt ringmodulator-artige Seitenbänder.
  - OP5 Träger: ×4, OL 70, R [99,60,40,40], L [99,0,0,0]. Kurzer Glanz.
  - OP6 Modulator: ×7,07 (coarse 7, fine 1), OL 55, R [99,75,40,40], L [99,0,0,0]
  - common `{gain -9}` (nicht gemessen)
  - fx `{chorus:{mode:'ENS', mix:.4}, rev .55, dly .2}` · bus `{hall:{decay 7, size 1.3}}`
- **Lage / Rolle:** F5–G6 (77–91), am besten C5–C7. Akzent, sparsam. Lagen-Grenze **tief C5**: darunter wird es ein Gong statt einer Glocke.
- **Hörprobe** (4 Takte, 72 BPM, gleiche Akkorde wie T1, Frage-Antwort mit Pausen, Takt 4 G6 als höchster Punkt, Schluss auf der None D6):
```
Tempo 72 BPM · 4 Takte · Akkorde: Fmaj7 | Em7 | Dm7 | Cmaj9
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A5(81) 0/4/90 · C6(84) 4/4/80 · G5(79) 8/8/85
T2: E6(88) 16/4/95 · D6(86) 20/2/80 · B5(83) 22/2/75 · G5(79) 24/8/80
T3: F5(77) 32/2/80 · A5(81) 34/2/80 · C6(84) 36/2/85 · E6(88) 38/2/90 · D6(86) 40/8/85
T4: G6(91) 48/4/100 · E6(88) 52/4/85 · D6(86) 56/8/85
```
Dauer: alle 4 Takte 13,3 s · kurz (≤ 8 s) T1, T4 = 6,7 s · ganz (≤ 16 s) T1, T2, T3, T4 = 13,3 s
aud-Daten kurz (Spec v3 §12.8, `len 2`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,1,81,0.71],[1,1,84,0.63],[2,2,79,0.67],[4,1,91,0.79],[5,1,88,0.67],[6,2,86,0.67]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,1,81,0.71],[1,1,84,0.63],[2,2,79,0.67],[4,1,88,0.75],[5,0.5,86,0.63],[5.5,0.5,83,0.59],[6,2,79,0.63],[8,0.5,77,0.63],[8.5,0.5,81,0.63],[9,0.5,84,0.67],[9.5,0.5,88,0.71],[10,2,86,0.67],[12,1,91,0.79],[13,1,88,0.67],[14,2,86,0.67]]`
- **Karte:** „Kalte, schwebende Glocke mit unreinen Obertönen und langem Raum – erinnert an die Glocken der Debussy-Bearbeitungen der 70er (Stil Isao Tomita).“

### 6.4 T3 „Nebel-Chor“ – Rolle Fläche · WT

- **Vorbild (ⓘ):** verfremdeter Band-Chor (8-Voice-Choir) mit Phasing und Raum (WAHRSCHEINLICH).
- **Rezept:**
  - Tabelle: `p.wt {table:'vocal', pos .45, scan .2, scanTime 4}`
  - Filter, Hüllkurve, LFO: `ftype 0, cutoff 2600, res .1, kt .3, aA .7, aD 2, aS .9, aR 3.5, ampVel .2, poly 6, l1shape 0, l1rate .12, l2shape 1, l2rate .07`
  - Routen: `M('lfo1','cutoff', .03)`, `M('lfo2','pan', .4)`. Langsames Kreisen im Raum. Tomitas Quadro-Arbeit (WAHRSCHEINLICH) nur angedeutet.
  - fx `{chorus:{mode:'ENS', mix:.6}, rev .7}` · bus `{hall:{decay 8, size 1.4, mod .7}}`
- **Lage / Rolle:** D3–A4 (50–69), am besten C3–C5. Fläche unter T1/T2. Lagen-Grenze: Akkorde C3–C5. Beim Wechsel zu a-Moll **nach unten** ausweichen, damit der Chor nicht in die Pfeife läuft.
- **Hörprobe** (4 Takte, liegende Akkorde mit wandernder Oberstimme A4 → G4 → E4 → F4 → E4 → D4, Wendung G7sus4 → G7):
```
Tempo 72 BPM · 4 Takte · Akkorde: Fmaj7 | Em7 | Dm7 | G7sus4 → G7
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: F3(53) 0/16/85 · C4(60) 0/16/85 · E4(64) 0/16/85 · A4(69) 0/8/88 · G4(67) 8/8/86
T2: E3(52) 16/16/85 · B3(59) 16/16/85 · D4(62) 16/16/85 · G4(67) 16/8/88 · E4(64) 24/8/84
T3: D3(50) 32/16/85 · A3(57) 32/16/85 · C4(60) 32/16/85 · F4(65) 32/8/88 · E4(64) 40/8/86
T4: G3(55) 48/8/86 · C4(60) 48/8/86 · D4(62) 48/8/84 · F4(65) 48/8/86 · G3(55) 56/8/90 · B3(59) 56/8/90 · D4(62) 56/8/86 · F4(65) 56/8/90
```
Dauer: alle 4 Takte 13,3 s · kurz (≤ 8 s) T1, T4 = 6,7 s · ganz (≤ 16 s) T1, T2, T3, T4 = 13,3 s
aud-Daten kurz (Spec v3 §12.8, `len 2`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,4,53,0.67],[0,4,60,0.67],[0,4,64,0.67],[0,2,69,0.69],[2,2,67,0.68],[4,2,55,0.68],[4,2,60,0.68],[4,2,62,0.66],[4,2,65,0.68],[6,2,55,0.71],[6,2,59,0.71],[6,2,62,0.68],[6,2,65,0.71]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,4,53,0.67],[0,4,60,0.67],[0,4,64,0.67],[0,2,69,0.69],[2,2,67,0.68],[4,4,52,0.67],[4,4,59,0.67],[4,4,62,0.67],[4,2,67,0.69],[6,2,64,0.66],[8,4,50,0.67],[8,4,57,0.67],[8,4,60,0.67],[8,2,65,0.69],[10,2,64,0.68],[12,2,55,0.68],[12,2,60,0.68],[12,2,62,0.66],[12,2,65,0.68],[14,2,55,0.71],[14,2,59,0.71],[14,2,62,0.68],[14,2,65,0.71]]`
- **Karte:** „Nebliger Chor, der langsam im Raum kreist – erinnert an die Weltraum-Chöre der 70er (Stil Isao Tomita).“

**Hinweis Debussy (WAHRSCHEINLICH, eK):** Die Kompositionen Debussys sind gemeinfrei. Eine Hörprobe dürfte also ein Debussy-Thema zitieren, aber **nicht** Tomitas Arrangement oder Klangaufnahme. Dieser Bericht bleibt bei eigenen Melodien. Ein Debussy-Zitat wäre eine Entscheidung für Xander (§10).

---

## 7. Ergänzung: The Human League und New Order (Belege in R6 §1, Rezepte N11 und N13)

Keine neuen Belege, R6 gilt. Neu sind nur die Hörproben für die vorhandenen Rezepte. Beide halten Abstand: „Blue-Monday“-Bassmuster, Stotter-Kick und die „Dare“-Riffs werden **nicht** nachgebaut (R6 §5).

### 7.1 H1 Hörprobe für R6 N11 „Spinnen-Sequenz“ (Human League, MC-4-Linien, BELEGT laut R6)

- **Lage / Rolle:** G4–B5 (67–83). Dünne hohe 16tel-Linie über Bass und Drums. Lagen-Grenze **tief G4**, damit sie „dünn“ bleibt.
- **Hörprobe** (4 Takte, 118 BPM, d-Moll, Wechselton-Muster mit Lücken, Takt 3 läuft hoch, Takt 4 steigt zur Wendung):
```
Tempo 118 BPM · 4 Takte · Akkorde: Dm | F | C | G
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D5(74) 0/1/108 · A4(69) 1/1/78 · F5(77) 2/1/90 · A4(69) 3/1/78 · D5(74) 4/1/108 · E5(76) 6/1/90 · A4(69) 7/1/78 · D5(74) 8/1/104 · A4(69) 9/1/78 · F5(77) 10/1/90 · G5(79) 12/1/108 · A4(69) 13/1/78 · F5(77) 14/1/90 · E5(76) 15/1/78
T2: C5(72) 16/1/108 · A4(69) 17/1/78 · F5(77) 18/1/90 · A4(69) 19/1/78 · C5(72) 20/1/108 · G5(79) 22/1/90 · A4(69) 23/1/78 · A5(81) 24/1/104 · F5(77) 25/1/78 · C5(72) 26/1/90 · F5(77) 28/1/108 · E5(76) 29/1/78 · C5(72) 30/1/90 · A4(69) 31/1/78
T3: E5(76) 32/1/108 · C5(72) 33/1/78 · G5(79) 34/1/90 · C5(72) 35/1/78 · E5(76) 36/1/108 · A5(81) 38/1/90 · C5(72) 39/1/78 · G5(79) 40/1/104 · E5(76) 41/1/78 · C5(72) 42/1/90 · G4(67) 43/1/78 · C5(72) 44/1/108 · D5(74) 45/1/78 · E5(76) 46/1/90 · G5(79) 47/1/78
T4: D5(74) 48/1/108 · B4(71) 49/1/78 · G5(79) 50/1/90 · B4(71) 51/1/78 · D5(74) 52/1/108 · A5(81) 54/1/90 · B4(71) 55/1/78 · B5(83) 56/1/104 · G5(79) 57/1/78 · D5(74) 58/1/90 · B4(71) 59/1/78 · A4(69) 60/1/108 · B4(71) 61/1/78 · C5(72) 62/1/90 · D5(74) 63/1/78
```
Dauer: alle 4 Takte 8,1 s · kurz (≤ 8 s) T1, T2, T4 = 6,1 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,1 s
aud-Daten kurz (Spec v3 §12.8, `len 3`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.25,74,0.85],[0.25,0.25,69,0.61],[0.5,0.25,77,0.71],[0.75,0.25,69,0.61],[1,0.25,74,0.85],[1.5,0.25,76,0.71],[1.75,0.25,69,0.61],[2,0.25,74,0.82],[2.25,0.25,69,0.61],[2.5,0.25,77,0.71],[3,0.25,79,0.85],[3.25,0.25,69,0.61],[3.5,0.25,77,0.71],[3.75,0.25,76,0.61],[4,0.25,72,0.85],[4.25,0.25,69,0.61],[4.5,0.25,77,0.71],[4.75,0.25,69,0.61],[5,0.25,72,0.85],[5.5,0.25,79,0.71],[5.75,0.25,69,0.61],[6,0.25,81,0.82],[6.25,0.25,77,0.61],[6.5,0.25,72,0.71],[7,0.25,77,0.85],[7.25,0.25,76,0.61],[7.5,0.25,72,0.71],[7.75,0.25,69,0.61],[8,0.25,74,0.85],[8.25,0.25,71,0.61],[8.5,0.25,79,0.71],[8.75,0.25,71,0.61],[9,0.25,74,0.85],[9.5,0.25,81,0.71],[9.75,0.25,71,0.61],[10,0.25,83,0.82],[10.25,0.25,79,0.61],[10.5,0.25,74,0.71],[10.75,0.25,71,0.61],[11,0.25,69,0.85],[11.25,0.25,71,0.61],[11.5,0.25,72,0.71],[11.75,0.25,74,0.61]]`
aud-Daten ganz (Vorschlag ≤ 16 s, `len 4`): `[[0,0.25,74,0.85],[0.25,0.25,69,0.61],[0.5,0.25,77,0.71],[0.75,0.25,69,0.61],[1,0.25,74,0.85],[1.5,0.25,76,0.71],[1.75,0.25,69,0.61],[2,0.25,74,0.82],[2.25,0.25,69,0.61],[2.5,0.25,77,0.71],[3,0.25,79,0.85],[3.25,0.25,69,0.61],[3.5,0.25,77,0.71],[3.75,0.25,76,0.61],[4,0.25,72,0.85],[4.25,0.25,69,0.61],[4.5,0.25,77,0.71],[4.75,0.25,69,0.61],[5,0.25,72,0.85],[5.5,0.25,79,0.71],[5.75,0.25,69,0.61],[6,0.25,81,0.82],[6.25,0.25,77,0.61],[6.5,0.25,72,0.71],[7,0.25,77,0.85],[7.25,0.25,76,0.61],[7.5,0.25,72,0.71],[7.75,0.25,69,0.61],[8,0.25,76,0.85],[8.25,0.25,72,0.61],[8.5,0.25,79,0.71],[8.75,0.25,72,0.61],[9,0.25,76,0.85],[9.5,0.25,81,0.71],[9.75,0.25,72,0.61],[10,0.25,79,0.82],[10.25,0.25,76,0.61],[10.5,0.25,72,0.71],[10.75,0.25,67,0.61],[11,0.25,72,0.85],[11.25,0.25,74,0.61],[11.5,0.25,76,0.71],[11.75,0.25,79,0.61],[12,0.25,74,0.85],[12.25,0.25,71,0.61],[12.5,0.25,79,0.71],[12.75,0.25,71,0.61],[13,0.25,74,0.85],[13.5,0.25,81,0.71],[13.75,0.25,71,0.61],[14,0.25,83,0.82],[14.25,0.25,79,0.61],[14.5,0.25,74,0.71],[14.75,0.25,71,0.61],[15,0.25,69,0.85],[15.25,0.25,71,0.61],[15.5,0.25,72,0.71],[15.75,0.25,74,0.61]]`
- **Karte:** „Dünne, spinnenartige 16tel-Linie aus dem Sequenzer – erinnert an den kühlen Pop von 1981 (Stil The Human League).“

### 7.2 N1 Hörprobe für R6 N13 „Sequenzer-Bass 83“ (New Order, Moog Source + Powertran, BELEGT laut R6)

- **Lage / Rolle:** B1–F#3 (35–54). 16tel-Oktav-Bass mit Lücken. Lagen-Grenze **hoch G3**.
- **Hörprobe** (4 Takte, 128 BPM, e-Moll statt des Originals, eigenes Lücken-Muster, Takt 2 springt auf H, Takt 4 läuft über Fis aufwärts):
```
Tempo 128 BPM · 4 Takte · Akkorde: Em | Em | C | D
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E2(40) 0/1/108 · E2(40) 1/1/78 · E3(52) 2/1/90 · E2(40) 3/1/78 · E2(40) 5/1/78 · E3(52) 6/1/90 · E2(40) 8/1/104 · E2(40) 9/1/78 · E3(52) 10/1/90 · E2(40) 11/1/78 · G2(43) 12/1/108 · E3(52) 14/1/90 · D3(50) 15/1/78
T2: E2(40) 16/1/108 · E2(40) 17/1/78 · E3(52) 18/1/90 · E2(40) 19/1/78 · E2(40) 21/1/78 · E3(52) 22/1/90 · B1(35) 24/1/104 · B1(35) 25/1/78 · B2(47) 26/1/90 · B1(35) 27/1/78 · D2(38) 28/1/108 · D3(50) 30/1/90 · E3(52) 31/1/78
T3: C2(36) 32/1/108 · C2(36) 33/1/78 · C3(48) 34/1/90 · C2(36) 35/1/78 · C2(36) 37/1/78 · C3(48) 38/1/90 · C2(36) 40/1/104 · C2(36) 41/1/78 · C3(48) 42/1/90 · G2(43) 43/1/78 · C3(48) 44/1/108 · B2(47) 46/1/90 · G2(43) 47/1/78
T4: D2(38) 48/1/108 · D2(38) 49/1/78 · D3(50) 50/1/90 · D2(38) 51/1/78 · D2(38) 53/1/78 · D3(50) 54/1/90 · F#2(42) 56/1/112 · F#2(42) 57/1/86 · A2(45) 58/1/98 · D3(50) 59/1/86 · F#3(54) 60/1/116 · E3(52) 61/1/86 · D3(50) 62/1/98 · B2(47) 63/1/86
```
Dauer: alle 4 Takte 7,5 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,5 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,5 s
aud-Daten kurz (Spec v3 §12.8, `len 4`, Schläge = 16tel ÷ 4, v = Anschlag/127): `[[0,0.25,40,0.85],[0.25,0.25,40,0.61],[0.5,0.25,52,0.71],[0.75,0.25,40,0.61],[1.25,0.25,40,0.61],[1.5,0.25,52,0.71],[2,0.25,40,0.82],[2.25,0.25,40,0.61],[2.5,0.25,52,0.71],[2.75,0.25,40,0.61],[3,0.25,43,0.85],[3.5,0.25,52,0.71],[3.75,0.25,50,0.61],[4,0.25,40,0.85],[4.25,0.25,40,0.61],[4.5,0.25,52,0.71],[4.75,0.25,40,0.61],[5.25,0.25,40,0.61],[5.5,0.25,52,0.71],[6,0.25,35,0.82],[6.25,0.25,35,0.61],[6.5,0.25,47,0.71],[6.75,0.25,35,0.61],[7,0.25,38,0.85],[7.5,0.25,50,0.71],[7.75,0.25,52,0.61],[8,0.25,36,0.85],[8.25,0.25,36,0.61],[8.5,0.25,48,0.71],[8.75,0.25,36,0.61],[9.25,0.25,36,0.61],[9.5,0.25,48,0.71],[10,0.25,36,0.82],[10.25,0.25,36,0.61],[10.5,0.25,48,0.71],[10.75,0.25,43,0.61],[11,0.25,48,0.85],[11.5,0.25,47,0.71],[11.75,0.25,43,0.61],[12,0.25,38,0.85],[12.25,0.25,38,0.61],[12.5,0.25,50,0.71],[12.75,0.25,38,0.61],[13.25,0.25,38,0.61],[13.5,0.25,50,0.71],[14,0.25,42,0.88],[14.25,0.25,42,0.68],[14.5,0.25,45,0.77],[14.75,0.25,50,0.68],[15,0.25,54,0.91],[15.25,0.25,52,0.68],[15.5,0.25,50,0.77],[15.75,0.25,47,0.68]]`
- **Karte:** „Treibender 16tel-Oktav-Bass mit Lücken – erinnert an die Club-Sequenzen von 1983 (Stil New Order).“

---

## 8. Übersicht: Lage und Rolle (Vorschlag für die Lagen-Grenzen, Wunsch T)

| Sound | Rolle | Hörprobe (MIDI) | Dauer alle / kurz / ganz | beste Lage | Grenze für Transposition (Vorschlag) | Akkord-Reaktion (Vorschlag) |
|---|---|---|---|---|---|---|
| K1 Fahrbahn-Bass | Bass | F1–D3 (29–50) | 16,6 / 6,2 / 14,5 s | C1–C3 | hoch D3 (Grundton bis D2) | nächstliegend, nie über D3 |
| K2 Rechenwerk-Sequenz | Sequenz | F2–G4 (41–67) | 8,0 / 8,0 / 8,0 s | A2–A4 | hoch C5 | nächstliegend |
| K3 Laufsteg-Lead | Lead | A4–D6 (69–86) | 16,0 / 8,0 / 16,0 s | C5–C6 | tief A4 | folgt der Oktave der Taste |
| K4 Metall-Pads | Drums | – | 8,0 / 8,0 / 8,0 s | – | keine | keine |
| D1 Zufalls-Arp 82 | Arp | F3–G5 (53–79) | 8,1 / 6,1 / 8,1 s | E3–G5 | tief E3 | nächstliegend |
| D2 Band-Echo-Arp | Sequenz | F3–C5 (53–72) | 11,4 / 5,7 / 11,4 s | C3–C5 | C3–C5 | nächstliegend, nie springen |
| D3 Hymnen-Poly 82 | Akkord | E3–G4 (52–67) | 8,3 / 6,2 / 8,3 s | C3–C5 | C3–C5 | C → a-Moll nach unten |
| J1 Phasen-Streicher | Fläche | D3–G4 (50–67) | 10,0 / 7,5 / 10,0 s | C3–C5 | C3–C5 | nächstliegend |
| J2 Raum-Lead 76 | Lead | G♯4–C6 (68–84) | 18,5 / 6,9 / 13,8 s | C5–C6 | tief G4 | folgt der Oktave der Taste |
| J3 Rhythmus-Kiste 76 | Drums | – | 9,2 / 6,9 / 9,2 s | – | keine | keine |
| T1 Pfeif-Stimme | Lead | G4–G5 (67–79) | 26,7 / 6,7 / 13,3 s | C5–C6 (nach Messung höher) | tief C4 | folgt der Oktave der Taste |
| T2 Eisglocke | Akzent | F5–G6 (77–91) | 13,3 / 6,7 / 13,3 s | C5–C7 | tief C5 | folgt der Oktave der Taste |
| T3 Nebel-Chor | Fläche | D3–A4 (50–69) | 13,3 / 6,7 / 13,3 s | C3–C5 | C3–C5 | a-Moll nach unten |
| H1 (N11) | Sequenz hoch | G4–B5 (67–83) | 8,1 / 6,1 / 8,1 s | G4–C6 | tief G4 | nächstliegend |
| N1 (N13) | Bass | B1–F#3 (35–54) | 7,5 / 7,5 / 7,5 s | E1–G3 | hoch G3 | nächstliegend, nie über G3 |

Die Spalten „Grenze“ und „Akkord-Reaktion“ sind nur Voreinstellungen je Sound. Wie Xander sie ändert (einfach, ohne Krampf), regelt `transposition-lage.md` (§3.7: `sound.lage` als Grundton-Bereich, auch einseitig; §3.5: `sound.dirAt` für „C → a-Moll nach unten“), nicht diese Datei. Jede Grenze ist an der eigenen Hörprobe geprüft: Keine Probe verlässt ihre Grenze.

## 9. Einbau-Hinweise (für Spec und Builder)

1. **VORBILD-Tabelle** (R6 §11) um `kraftwerk` (b), `duran-duran` (b) und `tomita` (b Klangpalette, e Patch) erweitern. `jarre` von „e“ auf **„b Geräte, e Tropfen“** heben (Belege §5.1).
2. **Namen nach E9 geprüft (eigene Durchsicht, ohne Skript):** Fahrbahn-Bass, Rechenwerk-Sequenz, Laufsteg-Lead, Metall-Pads, Zufalls-Arp 82, Band-Echo-Arp, Hymnen-Poly 82, Phasen-Streicher, Raum-Lead 76, Rhythmus-Kiste 76, Pfeif-Stimme, Eisglocke, Nebel-Chor. Kein Künstler-, Titel- oder Gerätename darin. Vor dem Einbau mit der Prüfliste A.4/A.13 (`r6/n6/doppel-check.mjs`) gegenprüfen, auch gegen Werks-Namen.
3. **Gefahr der Doppelung:** Die Pfeif-Stimme liegt nah am Werks-„Pfeif-Lead“. Lösung: als Variante führen (gleiche Filter-Werte, anderer Zweck). Die Eisglocke liegt nah an „Kristallglocke“: anderer Kern (√2-Modulator), also eigenständig.
4. **Dauer in Sekunden statt Takten** (§0): Spec unverändert lassen und je Probe `aud-Daten kurz` (≤ 8 s) einbauen; das erfüllt V10b-01/V10d-01 schon heute. Vorschlag für eine Spec-Änderung: „kurz ≤ 8 s, ganz ≤ 16 s“ (wie `vorbild-coldwave2.md` §6), dann zusätzlich `aud-Daten ganz`. Eine reine Takt-Grenze (`len ≤ 8`) reicht nicht: T1 (26,7 s), J2 (18,5 s) und K1 (16,6 s) lägen dann sogar über 16 s.
5. **Drei neue Bausteine** (P2, nicht dringend):
   - FX „Phaser“ (Allpass 4/6 Stufen)
   - FX „Flanger“ (0,5–5 ms, Feedback ±)
   - Arpeggiator-Modus „ZUFALL“ (falls ein Arp kommt)

   Ohne sie bleiben J1, J2 und D1 Annäherungen (in der Karte vermerkt).
6. **Messungen vor Freigabe:**
   - Pegel aller 13 Sounds auf −18 LUFS.
   - Gates aus Spec v2 §11.1 (Bass ≥ 55 % unter 250 Hz für K1; Lead-Tracking ±10 ct C3–C6 für K3, J2 und T1).
   - T1 zusätzlich G5–C6 nachmessen.
   - Die FM-Glocke T2 mit dem Gate „Anschlag-Schwerpunkt ≥ 1,5 × Ausklang“ prüfen.
7. **Hörproben-Daten:** `r7/helden-work/aud-blocks.md` (aus `aud.mjs`, nach Review neu erzeugt: v 0–1, kurz/ganz, neue D2 und J2). Das Skript ist die Quelle, die Blöcke oben sind daraus kopiert. Stand vor dem Review: `aud.pre-review.mjs`, `aud-blocks.pre-review.md`.

## 10. Offene Punkte und Fragen an Xander

- **Debussy-Zitat für Tomita?** Darf die Tomita-Hörprobe ein gemeinfreies Debussy-Thema spielen (stärkster Wiedererkennungswert) oder lieber nur eine eigene Melodie (jetzt)?
- **Wie lang dürfen Hörproben sein?** Kurz ≤ 8 s ist Pflicht (Spec). Darf es auf langen Druck eine Fassung „ganz“ bis 16 s geben? (Vorschlag ja.)
- **Vocoder- und Sprach-Klänge** (Kraftwerk) erst mit dem Mikrofon (P3)? Vorschlag: ja, als späteres Paket.
- Nicht recherchiert (außerhalb des Auftrags): „Lause Bass / Ben V VIZE / Tiger und Centuries“. Siehe `vorbild-coldwave2.md` §4 (Slap House/VIZE, Rückfrage offen).

## 11. Quellen (alle über Suchauszüge, nicht direkt abgerufen)

**Kraftwerk**
- https://en.wikipedia.org/wiki/Autobahn_(song)
- https://hifinews.com/content/kraftwerk-autobahn-production-notes
- https://mixdownmag.com.au/features/gear-rundown-kraftwerk-autobahn/
- https://en.wikipedia.org/wiki/Autobahn_(album)
- https://en.wikipedia.org/wiki/Trans-Europe_Express_(album)
- https://sdiy.info/wiki/Synthesizerstudio_Bonn
- https://artsandculture.google.com/story/what-s-that-sound-the-classic-synthesizers-behind-10-iconic-tracks/bAXhk5CyN9w2KA
- https://www.musicradar.com/news/kraftwerk-the-model
- https://forum.moogmusic.com/viewtopic.php?p=21149
- https://guitariste.com/forums/clavier-et-piano,le-materiel-des-clavieristes-pro,301706,50.html
- https://notebook.zoeblade.com/Kraftwerk.html
- https://notebook.zoeblade.com/Language_Translator.html
- https://4columns.org/dayal-geeta/paul-demarinis
- https://en.wikipedia.org/wiki/Computer_World_(tour)
- https://www.gearnews.com/kraftwerk-synths-sequencers-sounds/
- https://fontsinuse.com/uses/48046/kraftwerk-tour-de-france-single-cover

**Duran Duran**
- https://en.wikipedia.org/wiki/Rio_(song)
- https://duranduran.fandom.com/wiki/Rio_(song)
- https://www.roland.com/uk/blog/nick-rhodes-on-the-roland-synths-that-drive-duran-duran/
- https://en.wikipedia.org/wiki/Save_a_Prayer
- https://ultimateclassicrock.com/duran-duran-save-a-prayer/
- https://en.wikipedia.org/wiki/Planet_Earth_(Duran_Duran_song)
- https://en.wikipedia.org/wiki/Nick_Rhodes
- https://www.musicradar.com/news/nick-rhodes-top-5-synths
- https://www.gearnews.com/the-wild-boys-how-to-sound-like-duran-duran
- https://gearspace.com/threads/1980s-synths.793155/
- Tonart „Save a Prayer“: https://www.cs.ubc.ca/~davet/music/track/DURNDURN_GH1/DURNDURN_GH1-05.html · https://www.cifraclub.com/duran-duran/save-prayer/smjsgkm.html · https://www.cifraclub.com/duran-duran/save-prayer/?locale=en

**Jean-Michel Jarre**
- https://musicradar.com/news/jean-michel-jarre-best-synth-sound
- https://en.wikipedia.org/wiki/Oxyg%C3%A8ne_(Part_IV)
- https://en.wikipedia.org/wiki/Equinoxe
- https://hifinews.com/content/jean-michel-jarre-equinoxe-production-notes
- https://hollowsun.com/nostalgia/contributors/eminent/index.html
- https://www.sonicstate.com/news/2016/02/17/worlds-first-digital-synth-revived-for-reason/
- https://soundgas.com/products/keio-korg-mini-pops-mp-7-9
- https://hollowsun.com/nostalgia/contributors/minipops/index.html
- Tonart „Oxygène IV“: https://www.musicnotes.com/l/lxlKP · https://chordu.com/artist-chords-jean-michel-jarre (schwach, aus dem Review)

**Isao Tomita**
- https://en.wikipedia.org/wiki/Snowflakes_Are_Dancing
- https://en.wikipedia.org/wiki/Isao_Tomita
- https://www.chise.org/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/wiki/Isao_Tomita.html
- https://equipboard.com/pros/isao-tomita
- https://www.synthtopia.com/content/2021/05/14/recreating-isao-tomitas-iconic-whistle-patch/
- https://www.matrixsynth.com/2021/05/tomita-whistle-patch-tutorial.html
- https://www.synthtopia.com/content/2023/07/09/tomitas-snowflakes-are-dancing-bell-patch-tutorial/

**Recht**
- https://www.buzer.de/24_UrhG.htm
- https://www.sic-online.ch/fileadmin/user_upload/Sic-Online/2024/documents/71.pdf
- https://www.uni-bremen.de/urheberrecht/leitfragen/3-rechtssicher-materialien-einbinden/materialien-vom-urheber/rechteinhaber-ueberlassen/antwort-musik-vom-urheber-ueberlassen
- https://de.wikibooks.org/wiki/Gitarre:_Rechte_unbekannt
- https://legalis.ch/wp-content/uploads/sic/biblio_documents/823.pdf (Zuordnung des Rhythmus-Auszugs unsicher)
- https://www.fenwick.com/insights/publications/katy-perrys-dark-horse-comes-out-in-front-ninth-circuit-affirms-no-infringement-in-copyright-lawsuit
- eK, nicht abgerufen: https://curia.europa.eu/juris/liste.jsf?num=C-476/17 · https://www.gesetze-im-internet.de/urhg/__64.html · https://de.wikipedia.org/wiki/Claude_Debussy

**Human League / New Order:** siehe R6 §10 (`r6/bibliothek-recherche.md`).

---

## 12. Review-Protokoll (17.10.2026)

| # | Befund | Ergebnis |
|---|---|---|
| 1 | aud-Anschlag 1–127 statt v 0–1 (blockierend) | **angenommen.** V0a Z. 3839, 4325 und 4673 sowie die Werks-Noten `v: .8` sind gelesen. `aud.mjs` rechnet jetzt v/127, auf 2 Stellen gerundet. Alle Blöcke und `aud-blocks.md` sind neu erzeugt, §2 ist ergänzt. Die Text-Notation bleibt bei 1–127. |
| 2 | D2 in derselben Tonart und mit fast denselben Akkorden wie „Save a Prayer“ | **angenommen.** Die Tonart d-Moll ist in der eigenen Suche bestätigt (Wikipedia-Auszug, Mixmeister, Cifra Club). D2 steht jetzt in g-Moll mit Gm–Dm–F–C (i–v–VII–IV, ohne VI). Takt 1 beginnt Terz–Grundton–Quinte–None. Vermerk „vor V10d gegen das Original abhören“. Spielweise (Achtel-Arp, Dreieck, Echo 1/8 punktiert) bleibt: Technik ist frei (Regel 4). |
| 3 | J2 in derselben Tonart wie „Oxygène IV“ | **angenommen.** c-Moll ist in der eigenen Suche bestätigt (Musicnotes-Ausgabe, eine Quelle, WAHRSCHEINLICH). J2 steht jetzt in a-Moll mit i–iv–v–i, VI–iv–V–V. Der Kopf ist umgebaut, Vermerk „abhören“. |
| 4 | Dauer ≤ 8 s verschwiegen | **angenommen.** Die Dauern sind nachgerechnet; die Zahlen des Befunds stimmen. Zusätzlich gefunden: D1, D3 und H1 liegen mit 8,1–8,3 s knapp über 8 s. Jede Probe hat jetzt eine kurze Fassung (≤ 8 s) und eine ganze (≤ 16 s), §0 und §9.4 sind in Sekunden formuliert. Abweichung: Die Formel des Befunds „3 Takte bei 84–104 BPM“ stimmt bei 84 BPM nicht (3 Takte = 8,6 s). D2 bekommt deshalb 2 Takte. |
| 7 | K1- und D2-Grenze widersprechen der eigenen Probe | **angenommen.** K1 hat jetzt die Grenze „hoch D3“. Den Ersatz D2/D1 in T6 lehnt das Review-Protokoll ab, weil D1 (MIDI 26) unter der Bass-Hörgrenze E1 liegt (R6 §12.3). D2 liegt durch den Neubau ganz in C3–C5 (F3–C5). §8 ist nachgezogen. |
| 10 | Falscher Verweis auf `vorbild-retro.md` | **angenommen**, der Verweis zeigt jetzt auf `vorbild-coldwave2.md` §4. |

Abgelehnt: keiner. Teilweise anders umgesetzt: Befund 4 (D2 mit 2 statt 3 Takten) und Befund 7 (K1 nicht mit D1, siehe oben). Die Befunde 5, 6, 8 und 9 betreffen `vorbild-coldwave2.md`, die übrigen `transposition-lage.md`; das Protokoll steht dort.
