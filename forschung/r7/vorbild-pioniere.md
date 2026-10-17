# R7 – Vorbild-Pioniere 1974–1982: Moroder, YMO, Gary Numan, Ultravox, Visage, The Buggles, Japan, Sparks, Vangelis, Telex, Suicide, Cabaret Voltaire, The Normal, Fad Gadget (+ Lücken Kraftwerk und Jarre)

**Stand:** 17.10.2026 · Auftrag R7 „vorbild-pioniere“ (Rollenvorbild-Cluster „Pioniere“) · Xanders Wunsch: „alle Pioniere des Synthiepop … beginnend mit Kraftwerk und Gary Numan, alle signifikanten Signature-Sounds“.
**Abgrenzung (vorher gelesen):** `vorbild-helden.md` (Kraftwerk K1–K4, Jarre J1–J3), `vorbild-pop.md`, `vorbild-szene.md`, `vorbild-dark.md`, `vorbild-retro.md`, `vorbild-coldwave2.md`, `r8/studio-setups.md`, `r6/bibliothek-recherche.md` (§1, §6, §11), `SYNQUENZER-vision.md`, `transposition-lage.md` (§3.3, §3.5, §3.7, §5). Nichts davon wird hier wiederholt. Wo ein Act schon Sounds hat, steht hier nur die **Lücke** (§1).
**Werkzeuge und Grenzen:**
- Webseiten direkt abrufen ging nicht: WebFetch auf `en.wikipedia.org` → „getaddrinfo ENOTFOUND“ (17.10.2026, gemessen). **Alle Web-Fakten stammen aus Suchauszügen** (29 Suchen). Keine Seite ist im Volltext gelesen.
- Hörproben per Skript erzeugt und geprüft: `r7/pioniere-work/aud.mjs` → `aud-report.txt` (Lage, Takt-Wiederholungen, Taktgrenzen, Dauer; **0 Fehler**). Das Skript füllt auch die Blöcke in diese Datei (`skeleton.md` → diese Datei).
- **Nichts ist angehört, nichts gemessen.** Rezepte sind Startwerte. Pegel (`level`, FM `gain`) fehlen bewusst und müssen auf −18 LUFS kalibriert werden (Spec v2 §11.1).

**Kennzeichen** (wie in `vorbild-helden.md`)
- **BELEGT**: Eine namhafte Quelle (Wikipedia, Fachpresse, Interview mit dem Musiker) sagt es ausdrücklich. Grundlage ist der Suchauszug.
- **WAHRSCHEINLICH**: nur eine schwache Quelle (Fan-Seite, Blog, Händler, Gear-Datenbank), Quellen widersprechen sich, oder eigene Kenntnis (eK) ohne geöffneten Link.
- **UNBELEGT**: nichts gefunden; eigene Einschätzung für das Rezept. Kommt nie als Fakt in einen ⓘ-Text.

---

## 0. Kurzfazit

- **14 Acts bearbeitet, 2 nur geprüft** (Kraftwerk, Jarre: schon gründlich in `vorbild-helden.md`; hier nur je eine Lücke bzw. ein Verweis).
- **31 Hörproben** (alle eigene Melodien, alle ≤ 8 s in der Fassung „kurz“, ≤ 16 s „ganz“), davon:
  - **28 neue Sounds** mit Rezept (VA 20, FM6 1, Drum-Synth 7 – Tabelle §4; ein Drum-Kit zählt als ein Sound),
  - **3 Hörproben für vorhandene Sounds**: Werk „Moroder-Puls“, Werk „Ensemble-Streicher“, R6 N09 „Rhythmus-Box 78“ (Visage-Stil). Der Vangelis-Lead VG1 ist neu, als Gegenstück zum Werk „Weite 82“.
- **Am besten belegt:**
  - Moroder „I Feel Love“: geliehener Moog-Modular, Bass in kurzen Stücken eingespielt (Gerät verstimmte sich), Delay macht das Muster, Hi-Hat aus gefiltertem Weißrauschen, Kick live (Keith Forsey).
  - Gary Numan: Minimoog für Riff/Bass, Polymoog-Preset „Vox Humana“ für Flächen und „fremdartige“ Melodien.
  - YMO: Moog III-C + Roland MC-8 (Debüt 1978); Prophet-5 schon 1979 in Sakamotos Live-Setup (Greek Theatre), auf „BGM“ (1981) der Großteil der Studio-Klänge.
  - Japan „Ghosts“: Akkorde auf Prophet-5 und OB-X, Marimba von Steve Jansen, keine Drums (BELEGT); Eröffnungsklang auf dem Roland System 700 nur WAHRSCHEINLICH.
  - The Normal: Korg 700S + TEAC-Vierspur, zu Hause aufgenommen.
  - Suicide: Seeburg Rhythm Prince, Farfisa durch Electro-Harmonix-Verzerrer, Echo auf der Stimme.
  - Visage „Fade to Grey“: Grundbeat Roland CR-78 (Rusty Egan selbst); der Drum-Break laut Muzines-Interview 1984 aus dem Fairlight (Widerspruch zu „komplett CR-78“).
  - Ultravox: Billy Curries ARP Odyssey mit Oszillator-Sync.
- **Schwach oder gar nicht belegt:** Patch-Werte (bei allen), Tonart/Tempo der Originale (Quellen widersprechen sich), Geräte einzelner Titel bei YMO, Telex, Cabaret Voltaire, Fad Gadget.
- **Für einige Kennklänge fehlt der App ein Baustein** (§5): Phaser (Numan), Ringmodulator (Cabaret Voltaire), steigende Tonhöhe im Drum-Synth (Fad-Gadget-„Bohrer“), Aftertouch/Ribbon (Vangelis), Vocoder/Stimme (Kraftwerk, Telex, YMO; erst mit Mikrofon P3).
- **Doppelungs-Check:** Jeder neue Sound ist gegen Werk und R6/R7 abgegrenzt (Spalte „Abgrenzung“ in §4). Wo ein vorhandener Sound den Kennklang schon trifft, gibt es **keinen** neuen Sound, sondern nur eine Hörprobe dafür.

## 1. Was es schon gibt (Prüfung) und was hier neu ist

| Act | Schon vorhanden | Hier |
|---|---|---|
| **Kraftwerk** | `vorbild-helden.md` §3: K1 Fahrbahn-Bass, K2 Rechenwerk-Sequenz, K3 Laufsteg-Lead, K4 Metall-Pads (1974–1981). Vocoder/Sprachchip bewusst ausgelassen. | **Lücke 1981:** KW5 „Rechner-Piep“ (Taschenrechner-/Griffel-Klang von „Computer World“, BELEGT als Instrument). Vocoder weiter offen (P3). |
| **Jean-Michel Jarre** | `vorbild-helden.md` §5 (J1–J3), Werk „Pfeif-Sequenz“, „Tropfen“, R6 N69/N70 | **Nichts Neues.** Der Kern-Baustein Phaser/Flanger fehlt weiter (helden §9.5). |
| **Vangelis** | Werk „Weite 82“ (Fläche, CS-80) mit Hörprobe LM2 in `vorbild-retro.md` | **Lücke Lead:** VG1 „Sternfall-Brass“ (einstimmig, Gleiten statt Ribbon). |
| **Giorgio Moroder** | Werk „Moroder-Puls“ (Hörprobe LH2 nur im Retro-Stil, h-Moll) | Hörprobe MO1 im **Disco-Stil**, neu MO2 „Fluchtweg-Lead“ und MO3 „Disko-Kit 77“; Belege neu (R6 hatte nur „e“). |
| Alle übrigen 12 Acts | nirgends | neu |

## 2. Rechtliche Linie, Format, Akkord-Reaktion

- **Recht:** Es gilt `vorbild-helden.md` §1 und `vorbild-coldwave2.md` §1 (kein Rechtsrat). Kurz: Klang, Gerätetyp, Rhythmusgefühl und Allerwelts-Akkordfolgen sind frei. Die konkrete Melodie bzw. das Riff eines Titels nicht (§ 23 UrhG: hinreichender Abstand).
- **Regeln für jede Hörprobe hier:**
  1. Eigene Melodie, kein Riff des Originals. Höchstens 3 Töne in Folge im gleichen Rhythmus wie ein bekanntes Motiv (eigene Regel; ein automatischer Abgleich mit Originalnoten war nicht möglich).
  2. **Andere Tonart als das Original, soweit die Tonart bekannt ist.** Wo die Quellen sich widersprechen, ist die Probe bewusst in einer Tonart, die **keine** der genannten ist (z. B. „I Feel Love“: Quellen nennen G-Moll, B♭-Moll, F → Probe in e-Moll).
  3. Technik (Galopp-Delay, Oszillator-Sync, Bossa-Preset, Oktav-Bass) ist frei, ihre Notenfolge in einem Titel nicht.
  4. Vor V10d hört ein Mensch gegen; Vermerk „eigene Melodie“ in CHANGES (V10d-05).
- **Format** (wie `vorbild-helden.md` §2): `Ton(MIDI) Start/Länge/Anschlag`, Start und Länge in 16teln ab Takt 1, Anschlag 1–127. Darunter `aud-Daten` im Spec-Format `[Schlag, Dauer, MIDI, v]` mit **v = Anschlag/127 (0–1)**. Fassung **kurz ≤ 8 s** (gilt heute, V10b-01/V10d-01) und **ganz ≤ 16 s** (Vorschlag); passen nicht alle Takte, gelten die ersten n − 1 Takte plus der letzte (die Wendung bleibt hörbar). Drums als Schritt-Zeilen je Pad (Pad-Namen aus `DrumKits.SLOTS`).
- **Rezept-Schreibweise:** VA flach wie Werk-Sounds in V0a (`o1w` 0 Säge, 1 Puls, 2 Dreieck, 3 Sinus; `ftype` 0 LP24, 1 LP12, 2 BP24, 3 BP12, 4 HP24, 5 HP12; Modulationen `M(quelle, ziel, menge)`), FM6 mit `OP(coarse, ol, [R1..R4], [L1..L4], {…})` wie V0a Z. 5840, Drum-Synth mit den Schicht-Schlüsseln aus Spec v2 Anhang A.3 (TON `frq/pAmt/pDec/tDec`, RAUSCHEN `nTyp/nFrq/nQ/nEnv/nDec`, METALL `mTun/mDec`, KLICK `cTyp/cLvl`).
- **Lage und Akkord-Reaktion** (Voreinstellung je Sound für Wunsch T, `transposition-lage.md` §3.7 und §5): `sound.lage` ist ein **Grundton-Bereich**, oft einseitig („Bass hoch D3“, „Lead tief C5“). Oktav-Riffs über dem Grundton dürfen mit. `sound.dirAt` = feste Richtung bei einem Akkord-Grundton (z. B. „bei A ↑“). „nächstliegend“ = keine Voreinstellung, die Auto-Regel entscheidet. Jede Grenze unten ist an der eigenen Hörprobe geprüft (`aud-report.txt`: alle Proben innerhalb ihres Prüfbereichs).

---

## 3. Die Acts

### 3.1 Giorgio Moroder (`vorbild: moroder`, Belegstatus von „e“ auf **„b Geräte, e Patch“**)

| Fakt | Status | Quelle |
|---|---|---|
| „I Feel Love“ (1977): geliehener **Moog-Modular** (Moog IIIP von Eberhard Schoener), Robby Wedel richtet ihn ein und synchronisiert den Step-Sequenzer per Click-Track mit der 16-Spur-Maschine | BELEGT | MusicRadar „40 greatest synth sounds, No 3“; Wikipedia „I Feel Love“ (SE) |
| Bass in kurzen Stücken eingespielt, weil der Moog nach 20–30 s verstimmte | BELEGT | Wikipedia „I Feel Love“ (SE); DJ Mag „Game Changers“ |
| Das **Delay** auf dem Bass macht das Muster; Einzelheiten widersprechen sich (Toningenieur „aus Versehen“ beim Mix vs. jede Note links trocken, rechts verzögert) | Delay BELEGT; Art des Delays WAHRSCHEINLICH (Quellen uneinig) | MusicRadar No 3; Wikipedia (SE) |
| **Hi-Hat aus bearbeitetem Weißrauschen**, Kick live von Keith Forsey (der Moog machte keine überzeugende Kick) | BELEGT | Wikipedia „I Feel Love“ (SE) |
| Tempo etwa 123–127 BPM; Tonart **uneinig** (G-Moll, B♭-Moll, F in drei Datenbanken) | Tempo WAHRSCHEINLICH, Tonart UNBELEGT | cs.ubc.ca Mixmeister-Liste; mixgraph.io; sfrbeats.com |
| Nachbau-Rezept: zwei Sägezähne, kurzer Attack/Decay, mittleres Sustain | WAHRSCHEINLICH (Nachbau, nicht Original) | MusicTech „7 Deadly Synth Sounds“ |
| „Chase“ (Midnight Express, 1978): Hauptmelodie auf **Roland SH-2000**, Bässe auf **Minimoog**; Regisseur wollte etwas „im Stil von I Feel Love“ | WAHRSCHEINLICH (Fan-Blog) | burningtheground.net „Giorgio Moroder“ |
| „Chase“: pulsierende Sequenz-Bässe, Arpeggio-Motive, elektronische Perkussion; Oscar für die Filmmusik | BELEGT als Beschreibung (Release-Seite, Tunefind) | raygum.com; tunefind.com |

**Typisch (Stilmittel):** Achtel-Bass auf dem Grundton mit Oktave, ein Delay genau 1/16 später auf der anderen Seite (= Galopp); Four-on-the-Floor-Kick; Rausch-Hi-Hats; darüber ein heller, statischer Preset-Lead.

#### MO1 Hörprobe für Werk „Moroder-Puls“ – Rolle Sequenz/Bass · VA (V0a Z. 5809)

- **Rezept:** Werk unverändert (Achtel-Linie, Echo 1/16 Ping-Pong, Feedback 0,2).
- **Vorbild (ⓘ):** Moog-Modular-Bass mit Delay, Disco 1977 (BELEGT). Der Werks-Text „Moog-Modular-Sequenz“ stimmt mit den Belegen überein.
- **Lage / Rolle:** Probe B1–E3 (35–52). Grundton-Bereich **hoch D3** (wie LH2), die Oktave darüber darf mit. **Akkord-Reaktion:** nächstliegend, Bass-Regel (Gleichstand abwärts).
- **Hörprobe** (e-Moll, keine der drei Original-Tonarten; eigene Figur Grundton–Grundton–Oktave–Grundton–Terz/Durchgang, **nicht** die Quint-Septim-Figur des Originals; Takt 4 mit kleiner Septime C3 als Wendung zurück nach e-Moll):
```
Tempo 124 BPM · 4 Takte · Akkorde: Em | Em | C | D
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E2(40) 0/2/100 · E2(40) 2/2/84 · E3(52) 4/2/100 · E2(40) 6/2/84 · G2(43) 8/2/100 · E2(40) 10/2/84 · A2(45) 12/2/100 · B2(47) 14/2/84
T2: E2(40) 16/2/100 · E2(40) 18/2/84 · E3(52) 20/2/100 · E2(40) 22/2/84 · D3(50) 24/2/100 · E2(40) 26/2/84 · B2(47) 28/2/100 · G2(43) 30/2/84
T3: C2(36) 32/2/100 · C2(36) 34/2/84 · C3(48) 36/2/100 · C2(36) 38/2/84 · E2(40) 40/2/100 · C2(36) 42/2/84 · G2(43) 44/2/100 · B1(35) 46/2/84
T4: D2(38) 48/2/100 · D2(38) 50/2/84 · D3(50) 52/2/100 · D2(38) 54/2/84 · A2(45) 56/2/108 · D2(38) 58/2/92 · C3(48) 60/2/108 · D3(50) 62/2/92
```
Dauer: alle 4 Takte 7,7 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,7 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,7 s · Lage der Probe B1–E3 (35–52)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.5,40,0.79],[0.5,0.5,40,0.66],[1,0.5,52,0.79],[1.5,0.5,40,0.66],[2,0.5,43,0.79],[2.5,0.5,40,0.66],[3,0.5,45,0.79],[3.5,0.5,47,0.66],[4,0.5,40,0.79],[4.5,0.5,40,0.66],[5,0.5,52,0.79],[5.5,0.5,40,0.66],[6,0.5,50,0.79],[6.5,0.5,40,0.66],[7,0.5,47,0.79],[7.5,0.5,43,0.66],[8,0.5,36,0.79],[8.5,0.5,36,0.66],[9,0.5,48,0.79],[9.5,0.5,36,0.66],[10,0.5,40,0.79],[10.5,0.5,36,0.66],[11,0.5,43,0.79],[11.5,0.5,35,0.66],[12,0.5,38,0.79],[12.5,0.5,38,0.66],[13,0.5,50,0.79],[13.5,0.5,38,0.66],[14,0.5,45,0.85],[14.5,0.5,38,0.72],[15,0.5,48,0.85],[15.5,0.5,50,0.72]]`
- **Karte:** „Galoppierender Disco-Puls: Achtel-Bass plus Echo auf der anderen Seite – erinnert an Münchner Disco der späten 70er (Stil Giorgio Moroder).“

#### MO2 „Fluchtweg-Lead“ – Rolle Lead · VA (neu)

- **Vorbild (ⓘ):** einfacher Preset-Synth als Melodie-Stimme über Sequenz-Bässen (Gerät WAHRSCHEINLICH, Fan-Blog). Klang UNBELEGT.
- **Rezept:** `o1w 1, o1pw .3, o2w 0, o2oct 1, o2fine 3, o2lvl .35, ftype 1, cutoff 3200, res .1, drive .15, kt .6, fenv 0, aA .004, aD .3, aS 1, aR .15, ampVel .3, mode 2, poly 1, glide .03, l2shape 0, l2rate 5.8, l2fade .5, analog .1, spread 0` · Route `M('lfo2','pitch', .003)` · fx `{dly .25, rev .2}` · bus `{echo:{mode:'pp', divL:'1/8', fb .2}}`
- **Warum so:** Preset-Synths dieser Zeit hatten kaum Filter-Bewegung: schmaler Puls + Säge eine Oktave höher, Filter offen und **ohne Hüllkurve** (fenv 0) = statisch-hell. Das unterscheidet ihn vom Werk „Mini-Lead“ (Filter-Hk, Resonanz 38 %, Drive 40 %).
- **Lage / Rolle:** Probe C♯5–C♯6 (73–85), am besten C5–C6. **Grenze tief C5.** **Akkord-Reaktion:** folgt der Oktave der Taste (Lead-Regel, darf steigen).
- **Hörprobe** (fis-Moll, Folge i–VI–VII–V, Takt 4 mit Dur-Dominante C♯ als Wendung):
```
Tempo 126 BPM · 4 Takte · Akkorde: F#m | D | E | C#
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: F#5(78) 0/6/100 · A5(81) 6/2/88 · C#6(85) 8/4/104 · B5(83) 12/2/86 · A5(81) 14/2/86
T2: F#5(78) 16/4/96 · D5(74) 20/4/92 · E5(76) 24/2/88 · F#5(78) 26/6/98
T3: Ab5(80) 32/4/100 · B5(83) 36/2/88 · E5(76) 38/2/86 · Ab5(80) 40/6/98 · B5(83) 46/2/86
T4: C#6(85) 48/4/106 · B5(83) 52/2/90 · Ab5(80) 54/2/90 · F5(77) 56/4/96 · C#5(73) 60/4/100
```
Dauer: alle 4 Takte 7,6 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,6 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,6 s · Lage der Probe C#5–C#6 (73–85)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,1.5,78,0.79],[1.5,0.5,81,0.69],[2,1,85,0.82],[3,0.5,83,0.68],[3.5,0.5,81,0.68],[4,1,78,0.76],[5,1,74,0.72],[6,0.5,76,0.69],[6.5,1.5,78,0.77],[8,1,80,0.79],[9,0.5,83,0.69],[9.5,0.5,76,0.68],[10,1.5,80,0.77],[11.5,0.5,83,0.68],[12,1,85,0.83],[13,0.5,83,0.71],[13.5,0.5,80,0.71],[14,1,77,0.76],[15,1,73,0.79]]`
- **Karte:** „Heller, starrer Preset-Lead über Sequenz-Bässen – erinnert an Verfolgungsjagd-Filmmusik von 1978 (Stil Giorgio Moroder).“

#### MO3 „Disko-Kit 77“ – Rolle Drums · Drum-Synth (neu)

- **Vorbild (ⓘ):** Hi-Hat aus gefiltertem Weißrauschen, Kick gespielt statt Maschine (BELEGT).
- **Kit-Rezept:**
  - KICK `{wav Sinus, frq 58, pAmt 8, pDec .02, tDec .3, cTyp Knock, cLvl .15}` – weich, „gespielt“, kein 909-Klick.
  - SNARE `{frq 200, tDec .06, nTyp BP, nFrq 1800, nDec .14, nLvl .6}` – leise, nur Stütze.
  - HH ZU `{tLvl 0, mLvl 0, nTyp HP, nFrq 7000, nDec .04}` – **nur RAUSCHEN, kein METALL** (Beleg).
  - SHAKER `{nTyp HP, nFrq 9000, nDec .025, nLvl .5}` – 16tel-Teppich.
  - Kit-Bus ROOM 0,15, kein GATE.
- **Lage / Rolle:** Drums. Transposition gilt nicht.
- **Hörprobe** (124 BPM, Takt 4 Snare-Wirbel als Wendung):
```
Tempo 124 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK   | x...x...x...x... | x...x...x...x... | x...x...x...x... | x...x...x...x.x.
SNARE  | ....x.......x... | ....x.......x... | ....x.......x... | ....x.....x.x.xx
HH ZU  | ..x...x...x...x. | ..x...x...x.xxx. | ..x...x...x...x. | ..x.x.x.x.x.xxxx
SHAKER | x.xxx.xxx.xxx.xx | x.xxx.xxx.xxx.xx | xxxxxxxxxxxxxxxx | x.xxx.xxx.......
```
Dauer: alle 4 Takte 7,7 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,7 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,7 s
- **Karte:** „Four-on-the-Floor mit Rausch-Hi-Hats – erinnert an Disco-Produktionen von 1977 (Stil Giorgio Moroder).“

---

### 3.2 Yellow Magic Orchestra (`vorbild: ymo`, neu, „b Geräte, u Part“)

| Fakt | Status | Quelle |
|---|---|---|
| Debüt 1978: **Moog III-C**, Korg PS-3100, Polymoog, ARP Odyssey, Oberheim Eight Voice, Minimoog, Korg VC-10 Vocoder, **Roland MC-8** | BELEGT (Fachpresse) | Red Bull Music Academy „YMO: The Pre-MIDI Technology“; Reverb „The Gear of YMO“ |
| MC-8 programmiert von Hideki Matsutake („viertes Mitglied“); erster mikroprozessor-gesteuerter CV/Gate-Sequenzer, 8 Ausgänge, auch mehrstimmig | BELEGT | Wikipedia „Roland MC-8 Microcomposer“; Red Bull |
| Moog III-C war das Herz der frühen Auftritte und gehörte Matsutake | BELEGT | Reverb; Red Bull |
| **Prophet-5** schon **1979 im Live-Setup** von Sakamoto (Greek Theatre, Los Angeles, Aug. 1979; neben VP-330, Polymoog) | BELEGT (Fachpresse, Reverb ordnet ihn dem Bühnenaufbau der Greek-Theatre-Shows zu) | Reverb „The Gear of YMO“ (SE); laut Prüfbericht zusätzlich analogplanet (Rückseite Welttournee 1980: drei Prophet-5) – nicht selbst gesehen |
| Akiko Yano spielte 1979 ebenfalls einen Prophet-5 | UNBELEGT (Soundhouse nennt bei ihr den Oberheim 8-Voice) | soundhouse.co.jp (Kolumne 4583, SE) |
| „BGM“ (1981): Hosono und Takahashi machten den Großteil der Klänge auf dem **Prophet-5** | BELEGT | Red Bull Music Academy (SE); Wikipedia „BGM (album)“ (SE) |
| Der Prophet-5 **ersetzte** auf „BGM“ den Moog III-C als Hauptsynth | WAHRSCHEINLICH (nur Wikipedia-Auszug; „ersetzt“ nicht reproduziert) | Wikipedia „BGM (album)“ (SE) |
| „Rydeen“ (1979): Schlagzeug-Muster nach dem Bild eines **galoppierenden Pferdes**; ein **Syndrum-Break** im Mittelteil | WAHRSCHEINLICH (Rezensionen) | ra.co „Solid State Survivor“; doppiozero.com |
| Welcher Part auf welchem Gerät (Rydeen, Technopolis, Computer Game) | UNBELEGT | – |

**Typisch (eK, UNBELEGT):** präzise 16tel-Sequenzen in Rechteckwelle, pentatonische Hook-Melodien in hoher Lage, Galopp-Rhythmus, Videospiel-Geräusche.

#### YM1 „Kleinschritt-Sequenz“ – Rolle Sequenz · VA (neu)

- **Vorbild (ⓘ):** 16tel-Sequenz vom Mikrocomputer-Sequenzer über einen großen Modular-Synth (Geräte BELEGT, Klang UNBELEGT).
- **Rezept:** `o1w 1, o1pw .5, o2w 1, o2pw .5, o2oct 1, o2fine 2, o2lvl .3, ftype 0, cutoff 1500, res .3, drive .1, kt .6, fenv .3, fA .001, fD .08, fS .15, fR .05, aA .001, aD .12, aS .3, aR .04, ampVel .4, mode 1, poly 1, reset 1, analog .1, spread 0` · fx `{dly .2, rev .15}` · bus `{echo:{mode:'pp', divL:'1/8', fb .2}}`
- **Warum so:** Rechteck (Puls 50 %) + leise Oktave = hohl und „digital-sauber“; wenig Drift (analog .1), weil der Sequenzer exakt war. Unterschied zu K2 „Rechenwerk-Sequenz“ (Puls 30 % + Säge, Resonanz 55 % = Klick-Ploppen) und R6 N11 (Human League).
- **Lage / Rolle:** Probe C3–D5 (48–74). Grundton-Bereich C3–G3, **hoch D5**. **Akkord-Reaktion:** nächstliegend (Sequenz-Regel, Gleichstand aufwärts).
- **Hörprobe** (G-Dur, fast nur Pentatonik; Takt 4 bringt F♯ und den Lauf abwärts als Wendung):
```
Tempo 132 BPM · 4 Takte · Akkorde: G | Em | C | D
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: G3(55) 0/1/108 · D4(62) 1/1/78 · G4(67) 2/1/90 · A4(69) 3/1/78 · B4(71) 4/1/108 · G4(67) 5/1/78 · D4(62) 6/1/90 · B3(59) 7/1/78 · G3(55) 8/1/104 · D4(62) 9/1/78 · E4(64) 10/1/90 · G4(67) 11/1/78 · A4(69) 12/1/108 · G4(67) 13/1/78 · E4(64) 14/1/90 · D4(62) 15/1/78
T2: E3(52) 16/1/108 · B3(59) 17/1/78 · E4(64) 18/1/90 · G4(67) 19/1/78 · A4(69) 20/1/108 · G4(67) 21/1/78 · E4(64) 22/1/90 · B3(59) 23/1/78 · D4(62) 24/1/104 · E4(64) 25/1/78 · G4(67) 26/1/90 · B4(71) 27/1/78 · A4(69) 28/1/108 · G4(67) 29/1/78 · E4(64) 30/1/90 · D4(62) 31/1/78
T3: C3(48) 32/1/108 · G3(55) 33/1/78 · C4(60) 34/1/90 · E4(64) 35/1/78 · G4(67) 36/1/108 · E4(64) 37/1/78 · D4(62) 38/1/90 · C4(60) 39/1/78 · G3(55) 40/1/104 · A3(57) 41/1/78 · C4(60) 42/1/90 · E4(64) 43/1/78 · G4(67) 44/1/108 · A4(69) 45/1/78 · G4(67) 46/1/90 · E4(64) 47/1/78
T4: D3(50) 48/1/114 · A3(57) 49/1/84 · D4(62) 50/1/96 · E4(64) 51/1/84 · F#4(66) 52/1/114 · A4(69) 53/1/84 · B4(71) 54/1/96 · D5(74) 55/1/84 · B4(71) 56/1/110 · A4(69) 57/1/84 · F#4(66) 58/1/96 · E4(64) 59/1/84 · D4(62) 60/1/114 · A3(57) 61/1/84 · F#3(54) 62/1/96 · D3(50) 63/1/84
```
Dauer: alle 4 Takte 7,3 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,3 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,3 s · Lage der Probe C3–D5 (48–74)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.25,55,0.85],[0.25,0.25,62,0.61],[0.5,0.25,67,0.71],[0.75,0.25,69,0.61],[1,0.25,71,0.85],[1.25,0.25,67,0.61],[1.5,0.25,62,0.71],[1.75,0.25,59,0.61],[2,0.25,55,0.82],[2.25,0.25,62,0.61],[2.5,0.25,64,0.71],[2.75,0.25,67,0.61],[3,0.25,69,0.85],[3.25,0.25,67,0.61],[3.5,0.25,64,0.71],[3.75,0.25,62,0.61],[4,0.25,52,0.85],[4.25,0.25,59,0.61],[4.5,0.25,64,0.71],[4.75,0.25,67,0.61],[5,0.25,69,0.85],[5.25,0.25,67,0.61],[5.5,0.25,64,0.71],[5.75,0.25,59,0.61],[6,0.25,62,0.82],[6.25,0.25,64,0.61],[6.5,0.25,67,0.71],[6.75,0.25,71,0.61],[7,0.25,69,0.85],[7.25,0.25,67,0.61],[7.5,0.25,64,0.71],[7.75,0.25,62,0.61],[8,0.25,48,0.85],[8.25,0.25,55,0.61],[8.5,0.25,60,0.71],[8.75,0.25,64,0.61],[9,0.25,67,0.85],[9.25,0.25,64,0.61],[9.5,0.25,62,0.71],[9.75,0.25,60,0.61],[10,0.25,55,0.82],[10.25,0.25,57,0.61],[10.5,0.25,60,0.71],[10.75,0.25,64,0.61],[11,0.25,67,0.85],[11.25,0.25,69,0.61],[11.5,0.25,67,0.71],[11.75,0.25,64,0.61],[12,0.25,50,0.9],[12.25,0.25,57,0.66],[12.5,0.25,62,0.76],[12.75,0.25,64,0.66],[13,0.25,66,0.9],[13.25,0.25,69,0.66],[13.5,0.25,71,0.76],[13.75,0.25,74,0.66],[14,0.25,71,0.87],[14.25,0.25,69,0.66],[14.5,0.25,66,0.76],[14.75,0.25,64,0.66],[15,0.25,62,0.9],[15.25,0.25,57,0.66],[15.5,0.25,54,0.76],[15.75,0.25,50,0.66]]`
- **Karte:** „Flinke Rechteck-Sequenz in 16teln, blitzsauber – erinnert an Tokioter Technopop um 1979 (Stil Yellow Magic Orchestra).“

#### YM2 „Laternen-Lead“ – Rolle Lead · VA (neu)

- **Vorbild (ⓘ):** helle Poly-Synth-Melodie über Sequenzen (Prophet-5 ab 1979 im Live-Setup; Gerät je Titel UNBELEGT).
- **Rezept:** `o1w 1, o1pw .35, o2w 1, o2pw .5, o2fine 6, o2lvl .7, ftype 1, cutoff 2800, res .12, drive .1, kt .55, fenv .2, fA .004, fD .4, fS .55, aA .006, aD .4, aS .85, aR .35, ampVel .35, poly 4, l1shape 1, l1rate .8, l2shape 0, l2rate 5.6, l2fade .5, analog .2, spread .3` · Routen `M('lfo1','pw', .25), M('lfo2','pitch', .003)` · fx `{chorus:{mode:'II', mix:.5}, dly .2, rev .3}`
- **Warum so:** zwei Pulse mit langsamer PWM + Chorus II = glänzend, ohne Säge-Schärfe. Unterschied zum Werk „Puls-Lead“: dort mono mit Glide und Puls 28 % eine Oktave tiefer; hier poly 4 mit Chorus.
- **Lage / Rolle:** Probe E5–E6 (76–88). **Grenze tief C5.** **Akkord-Reaktion:** folgt der Oktave der Taste.
- **Hörprobe** (G-Dur pentatonisch, 8 Takte; Takt 7 Am mit C, Takt 8 D7 mit C6 als Wendung):
```
Tempo 132 BPM · 8 Takte · Akkorde: G | Em | C | D | G | Em | Am | D7
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: B5(83) 0/4/100 · D6(86) 4/2/92 · B5(83) 6/2/86 · A5(81) 8/4/94 · G5(79) 12/4/90
T2: E5(76) 16/6/96 · G5(79) 22/2/86 · A5(81) 24/4/92 · B5(83) 28/4/94
T3: E6(88) 32/4/104 · D6(86) 36/2/90 · B5(83) 38/2/88 · G5(79) 40/6/96 · A5(81) 46/2/86
T4: F#5(78) 48/4/94 · A5(81) 52/4/94 · D6(86) 56/8/100
T5: G5(79) 64/2/92 · A5(81) 66/2/90 · B5(83) 68/4/96 · D6(86) 72/4/98 · E6(88) 76/4/104
T6: D6(86) 80/6/100 · B5(83) 86/2/88 · G5(79) 88/4/92 · E5(76) 92/4/90
T7: A5(81) 96/4/96 · C6(84) 100/2/92 · B5(83) 102/2/88 · A5(81) 104/4/94 · E5(76) 108/4/90
T8: F#5(78) 112/2/92 · A5(81) 114/2/94 · D6(86) 116/4/102 · C6(84) 120/2/92 · A5(81) 122/2/90 · F#5(78) 124/4/96
```
Dauer: alle 8 Takte 14,5 s · kurz (≤ 8 s) T1, T2, T3, T8 = 7,3 s · ganz (≤ 16 s) T1, T2, T3, T4, T5, T6, T7, T8 = 14,5 s · Lage der Probe E5–E6 (76–88)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,1,83,0.79],[1,0.5,86,0.72],[1.5,0.5,83,0.68],[2,1,81,0.74],[3,1,79,0.71],[4,1.5,76,0.76],[5.5,0.5,79,0.68],[6,1,81,0.72],[7,1,83,0.74],[8,1,88,0.82],[9,0.5,86,0.71],[9.5,0.5,83,0.69],[10,1.5,79,0.76],[11.5,0.5,81,0.68],[12,0.5,78,0.72],[12.5,0.5,81,0.74],[13,1,86,0.8],[14,0.5,84,0.72],[14.5,0.5,81,0.71],[15,1,78,0.76]]`
aud-Daten ganz (`len 8`): `[[0,1,83,0.79],[1,0.5,86,0.72],[1.5,0.5,83,0.68],[2,1,81,0.74],[3,1,79,0.71],[4,1.5,76,0.76],[5.5,0.5,79,0.68],[6,1,81,0.72],[7,1,83,0.74],[8,1,88,0.82],[9,0.5,86,0.71],[9.5,0.5,83,0.69],[10,1.5,79,0.76],[11.5,0.5,81,0.68],[12,1,78,0.74],[13,1,81,0.74],[14,2,86,0.79],[16,0.5,79,0.72],[16.5,0.5,81,0.71],[17,1,83,0.76],[18,1,86,0.77],[19,1,88,0.82],[20,1.5,86,0.79],[21.5,0.5,83,0.69],[22,1,79,0.72],[23,1,76,0.71],[24,1,81,0.76],[25,0.5,84,0.72],[25.5,0.5,83,0.69],[26,1,81,0.74],[27,1,76,0.71],[28,0.5,78,0.72],[28.5,0.5,81,0.74],[29,1,86,0.8],[30,0.5,84,0.72],[30.5,0.5,81,0.71],[31,1,78,0.76]]`
- **Karte:** „Glänzende Pentatonik-Melodie mit Chorus – erinnert an Technopop-Hymnen um 1979 (Stil Yellow Magic Orchestra).“

#### YM3 „Galopp-Kit 79“ – Rolle Drums · Drum-Synth (neu)

- **Vorbild (ⓘ):** Galopp-Muster und Syndrum-Tom (WAHRSCHEINLICH, Rezension).
- **Kit-Rezept:**
  - KICK `{frq 55, pAmt 10, pDec .015, tDec .25}`; SNARE `{frq 210, tDec .08, nTyp BP, nFrq 2500, nDec .12}`, trocken.
  - HH ZU `{mTun 1.1, mDec .025}`.
  - PERC = **Syndrum-Tom**: `{wav Sinus, frq 160, pAmt 14, pDec .25, tDec .45, nLvl 0}` – der lange fallende „Piuuu“-Ton.
  - Kit-Bus ROOM 0,15.
- **Lage / Rolle:** Drums.
- **Hörprobe** (HH im Galopp „1 – e+a“, Syndrum ab Takt 2, Takt 4 Syndrum-Lauf als Wendung; Takt 1 = Takt 3 ist gewollt, keine direkte Wiederholung):
```
Tempo 132 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK  | x.......x....... | x.......x.....x. | x.......x....... | x.......x.x.x...
SNARE | ....x.......x... | ....x.......x... | ....x.......x... | ....x...........
HH ZU | x.xxx.xxx.xxx.xx | x.xxx.xxx.xxx.xx | x.xxx.xxx.xxx.xx | x.xxx.xx........
PERC  | ................ | ..............x. | ................ | ..........x.x.xx
```
Dauer: alle 4 Takte 7,3 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,3 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,3 s
- **Karte:** „Galopp-Hi-Hats und fallende Syndrum-Toms – erinnert an japanischen Technopop um 1980 (Stil Yellow Magic Orchestra).“

---

### 3.3 Gary Numan / Tubeway Army (`vorbild: gary-numan`, neu, „b Geräte, w Part“)

| Fakt | Status | Quelle |
|---|---|---|
| Ausgangspunkt: Numan fand im Studio einen **Minimoog**, der dort stehen geblieben war, und wollte eigentlich ein Punk-Album machen | BELEGT | Wikipedia „Are ‚Friends‘ Electric?“ (SE); MusicRadar-Interview |
| „Are ‚Friends‘ Electric?“ (Replicas, 1979): Minimoog und **Polymoog** am deutlichsten; dazu ARP Odyssey, RMI Electra-Piano; normaler Bass und Schlagzeug | BELEGT (Wikipedia, mehrere Quellen) | Wikipedia; everyuknumber1.com |
| Polymoog-Preset **„Vox Humana“** = Flächen und „fremdartige“ Melodien auf „The Pleasure Principle“ | BELEGT (mehrere Fachquellen) | Reverb „Synth Sounds of Gary Numan“; MusicTech (Moog/UJAM-Plug-in aus Polymoog 280A) |
| „Cars“: beide Klänge des Riffs vom **Minimoog**, Vox Humana für die wirbelnden Leads später | WAHRSCHEINLICH (MusicRadar; Equipboard/Gear4music sagen teils anderes) | MusicRadar „Cars sound“; Equipboard; Gear4music |
| Minimoog durch **MXR Phase 100** | WAHRSCHEINLICH (Reverb-Nachbau-Text, unklar ob Original) | Reverb |
| Numan besaß später zwei Polymoog 203a und sechs 280a | WAHRSCHEINLICH (Händler-Blog) | dohmannaudio.com |
| Tempo „Cars“ ≈ 128–129 BPM, Tonart A-Moll (eine Datenbank) | WAHRSCHEINLICH | cs.ubc.ca Mixmeister-Liste; acousticbrainz |

#### NU1 „Kaltfront-Riff“ – Rolle Riff/Bass-Lead · VA (neu)

- **Vorbild (ⓘ):** Minimoog-Riff in mittlerer Lage, phasig (Gerät BELEGT, Phaser WAHRSCHEINLICH).
- **Rezept:** `o1w 0, o2w 0, o2fine 6, o2lvl .9, o3w 0, o3oct -1, o3lvl .35, ftype 0, cutoff 850, res .22, drive .45, bass .4, kt .5, fenv .22, fA .003, fD .35, fS .5, fR .2, aA .003, aD .4, aS .9, aR .15, ampVel .3, mode 2, poly 1, glide .02, l1shape 1, l1rate .35, analog .2, spread 0` · Route `M('lfo1','cutoff', .03)` · fx `{chorus:{mode:'BREIT', mix:.45}, rev .2, dly .1}`
- **App-Lücke Phaser:** wie bei Jarre (helden §9.5). Annäherung: Chorus BREIT + langsamer LFO am Filter. Mit Phaser-Block: `phaser:{stages 4, rate .4, depth .7, fb .3}` (eigene Werte, UNBELEGT).
- **Warum so:** drei Sägen (eine eine Oktave tiefer), viel Drive = der dicke, „kalte“ Moog-Ton in Bariton-Lage. Unterschied zu K1 „Fahrbahn-Bass“ (Achtel-Bass mit Echo, Puls-Sub) und Werk „Moog-Bass“: hier Legato-Riff eine Oktave höher.
- **Lage / Rolle:** Probe A♭2–B♭3 (44–58), am besten G2–C4. Grundton-Bereich **G2–C3**. **Akkord-Reaktion:** nächstliegend, bei Gleichstand abwärts (wie Bass); Riff bleibt als Block.
- **Hörprobe** (c-Moll, nicht A-Moll; i–i–VI–VII, Takt 4 endet auf dem Leitton H2 als Wendung):
```
Tempo 128 BPM · 4 Takte · Akkorde: Cm | Cm | Ab | Bb
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: C3(48) 0/4/105 · C3(48) 4/2/90 · Eb3(51) 6/2/92 · G3(55) 8/4/100 · F3(53) 12/2/88 · Eb3(51) 14/2/88
T2: C3(48) 16/4/104 · Bb2(46) 20/2/88 · C3(48) 22/2/90 · Eb3(51) 24/6/98 · D3(50) 30/2/86
T3: Ab2(44) 32/4/104 · C3(48) 36/2/90 · Eb3(51) 38/2/90 · Ab3(56) 40/4/100 · G3(55) 44/2/88 · Eb3(51) 46/2/88
T4: Bb2(46) 48/4/104 · D3(50) 52/2/92 · F3(53) 54/2/92 · Bb3(58) 56/4/104 · G3(55) 60/2/92 · B2(47) 62/2/96
```
Dauer: alle 4 Takte 7,5 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,5 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,5 s · Lage der Probe Ab2–Bb3 (44–58)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,1,48,0.83],[1,0.5,48,0.71],[1.5,0.5,51,0.72],[2,1,55,0.79],[3,0.5,53,0.69],[3.5,0.5,51,0.69],[4,1,48,0.82],[5,0.5,46,0.69],[5.5,0.5,48,0.71],[6,1.5,51,0.77],[7.5,0.5,50,0.68],[8,1,44,0.82],[9,0.5,48,0.71],[9.5,0.5,51,0.71],[10,1,56,0.79],[11,0.5,55,0.69],[11.5,0.5,51,0.69],[12,1,46,0.82],[13,0.5,50,0.72],[13.5,0.5,53,0.72],[14,1,58,0.82],[15,0.5,55,0.72],[15.5,0.5,47,0.76]]`
- **Karte:** „Dickes, kühles Moog-Riff in Bariton-Lage – erinnert an den Maschinen-Pop von 1979 (Stil Gary Numan).“

#### NU2 „Menschenstimme-Fläche“ – Rolle Fläche/hohe Melodie · VA (neu)

- **Vorbild (ⓘ):** Preset „Vox Humana“ einer Poly-Orgel-Synth-Mischung (BELEGT als Preset und Einsatz). Wie das Preset intern klang: UNBELEGT; Nachbauten nutzen String-Ensemble-Klänge (Reverb).
- **Rezept:** `o1w 0, o2w 1, o2pw .4, o2fine 5, o2lvl .7, o3w 0, o3oct 1, o3fine -7, o3lvl .3, ftype 1, cutoff 2300, res .1, drive .05, kt .45, fenv .08, aA .09, aD 1, aS .9, aR .8, ampVel .25, poly 6, l1shape 1, l1rate .45, analog .25, spread .4` · Route `M('lfo1','pw', .35)` · fx `{chorus:{mode:'ENS', mix:.8}, rev .4}`
- **Warum so:** Säge + Puls mit PWM + Säge eine Oktave höher, alles durch den Ensemble-Chorus = schwebende „Stimme“ aus der Orgel. Unterschied: Werk „Ensemble-Streicher“ (nur 2 Sägen, ohne PWM, Attack 0,22 s) und „Juno-Streicher“ (nur Puls, Chorus II). Hier kürzerer Attack (0,09 s), damit auch Melodien gehen.
- **Lage / Rolle:** Probe F3–B♭4 (53–70), am besten C3–C5. **Akkord-Reaktion:** Flächen-Regel (Stimmführung), Klammer C3–C5.
- **Hörprobe** (f-Moll, i–VI–VII–V mit C-Dur als Wendung; obere Stimme wandert):
```
Tempo 112 BPM · 4 Takte · Akkorde: Fm | Db | Eb | C
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: F3(53) 0/16/84 · Ab3(56) 0/16/84 · C4(60) 0/16/84 · F4(65) 0/8/90 · G4(67) 8/4/86 · Ab4(68) 12/4/90
T2: F3(53) 16/16/84 · Ab3(56) 16/16/84 · C#4(61) 16/16/84 · F4(65) 16/8/92 · Eb4(63) 24/8/86
T3: G3(55) 32/16/84 · Bb3(58) 32/16/84 · Eb4(63) 32/16/84 · G4(67) 32/6/90 · Bb4(70) 38/2/94 · G4(67) 40/8/88
T4: G3(55) 48/16/88 · C4(60) 48/16/88 · E4(64) 48/16/88 · G4(67) 48/4/92 · F4(65) 52/4/88 · E4(64) 56/8/90
```
Dauer: alle 4 Takte 8,6 s · kurz (≤ 8 s) T1, T2, T4 = 6,4 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,6 s · Lage der Probe F3–Bb4 (53–70)
aud-Daten kurz (`len 3`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,4,53,0.66],[0,4,56,0.66],[0,4,60,0.66],[0,2,65,0.71],[2,1,67,0.68],[3,1,68,0.71],[4,4,53,0.66],[4,4,56,0.66],[4,4,61,0.66],[4,2,65,0.72],[6,2,63,0.68],[8,4,55,0.69],[8,4,60,0.69],[8,4,64,0.69],[8,1,67,0.72],[9,1,65,0.69],[10,2,64,0.71]]`
aud-Daten ganz (`len 4`): `[[0,4,53,0.66],[0,4,56,0.66],[0,4,60,0.66],[0,2,65,0.71],[2,1,67,0.68],[3,1,68,0.71],[4,4,53,0.66],[4,4,56,0.66],[4,4,61,0.66],[4,2,65,0.72],[6,2,63,0.68],[8,4,55,0.66],[8,4,58,0.66],[8,4,63,0.66],[8,1.5,67,0.71],[9.5,0.5,70,0.74],[10,2,67,0.69],[12,4,55,0.69],[12,4,60,0.69],[12,4,64,0.69],[12,1,67,0.72],[13,1,65,0.69],[14,2,64,0.71]]`
- **Karte:** „Schwebende Orgel-Stimme mit Ensemble-Chorus – erinnert an die Flächen des Maschinen-Pop von 1979 (Stil Gary Numan).“

---

### 3.4 Ultravox (`vorbild: ultravox`, neu, „b Gerät, w Part“) – John-Foxx- und Midge-Ure-Zeit

| Fakt | Status | Quelle |
|---|---|---|
| Billy Currie: **ARP Odyssey** (gekauft 1977), Kennzeichen „fließende Linien“ mit **Oszillator-Sync**; dazu Yamaha CS-80 und Yamaha SS30 (String-Synth) in der Hochphase | BELEGT | Wikipedia „Billy Currie“ (SE) |
| „Sleepwalk“ (1980, erste Single mit Midge Ure): Soli auf dem ARP Odyssey | BELEGT (Fachpresse) | MOJO „Time Machine: Ultravox Release Vienna“ |
| „Hiroshima Mon Amour“ (1977, Foxx-Zeit): Drumcomputer **Roland TR-77** mit von Warren Cann **verändertem Bossa-Nova-Preset**; Foxx nennt den Titel den ersten Synthpop-Song | WAHRSCHEINLICH (Fan-Magazin; Modell CR-78 vs. TR-77 vom Auszug selbst als unsicher markiert) | electricityclub.co.uk (?p=6737) |
| Tempo/Tonart „Vienna“ (≈ 100 BPM, Tonart C laut Nutzer-Tab) | WAHRSCHEINLICH bzw. UNBELEGT | musiciwant.com; guitartabsexplorer.com |
| „Sleepwalk“: d-Moll, 166 BPM (automatische Analyse) | WAHRSCHEINLICH | acousticbrainz.org |

**Klavier und Geige** (Vienna-Solo, Curries E-Geige) sind keine Synth-Klänge und bleiben hier draußen.

#### UV1 „Funkenbogen-Sync“ – Rolle Lead · VA (neu)

- **Vorbild (ⓘ):** Odyssey-Lead mit Oszillator-Sync, fließend gespielt (BELEGT).
- **Rezept:** `o1w 0, o1lvl .3, o2w 0, o2sync 1, o2semi 9, o2lvl 1, ftype 0, cutoff 3000, res .3, drive .35, kt .6, fenv .15, fA .002, fD .3, fS .7, aA .003, aD .2, aS .9, aR .25, ampVel .35, mode 2, poly 1, glide .06, l1shape 1, l1rate .25, l2shape 0, l2rate 5.5, l2fade .4, analog .15, spread 0` · Routen `M('lfo1','o2pitch', .12), M('mw','o2pitch', .4), M('lfo2','pitch', .003)` · fx `{dly .3, rev .3}` · bus `{echo:{mode:'st', divL:'1/8', fb .25}}`
- **Warum so:** Die Sync-Farbe **wandert langsam** (LFO 1 Dreieck 0,25 Hz auf die Osz-2-Tonhöhe), dazu Glide = „singende“ Linien. Unterschied zum Werk „Sync-Lead“: dort fegt eine Hüllkurve bei jedem Anschlag („Jauu“, Prophet-Stil); hier kein Anschlags-Fegen, sondern Fluss. Mod-Rad = Sync von Hand.
- **Lage / Rolle:** Probe D5–F6 (74–89), am besten C5–F6. **Grenze tief C5.** **Akkord-Reaktion:** folgt der Oktave der Taste.
- **Hörprobe** (g-Moll, nicht d-Moll; 138 BPM; i–VI–VII–V, Takt 4 mit F♯ zur Dur-Dominante):
```
Tempo 138 BPM · 4 Takte · Akkorde: Gm | Eb | F | D
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: G5(79) 0/2/96 · Bb5(82) 2/2/92 · D6(86) 4/6/106 · C6(84) 10/2/88 · Bb5(82) 12/4/94
T2: G5(79) 16/4/96 · Bb5(82) 20/2/90 · Eb6(87) 22/6/106 · D6(86) 28/4/96
T3: C6(84) 32/2/94 · A5(81) 34/2/88 · F5(77) 36/4/92 · A5(81) 40/2/90 · C6(84) 42/2/94 · F6(89) 44/4/108
T4: D6(86) 48/4/104 · C6(84) 52/2/92 · A5(81) 54/2/90 · F#5(78) 56/4/96 · D5(74) 60/4/100
```
Dauer: alle 4 Takte 7,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,0 s · Lage der Probe D5–F6 (74–89)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.5,79,0.76],[0.5,0.5,82,0.72],[1,1.5,86,0.83],[2.5,0.5,84,0.69],[3,1,82,0.74],[4,1,79,0.76],[5,0.5,82,0.71],[5.5,1.5,87,0.83],[7,1,86,0.76],[8,0.5,84,0.74],[8.5,0.5,81,0.69],[9,1,77,0.72],[10,0.5,81,0.71],[10.5,0.5,84,0.74],[11,1,89,0.85],[12,1,86,0.82],[13,0.5,84,0.72],[13.5,0.5,81,0.71],[14,1,78,0.76],[15,1,74,0.79]]`
- **Karte:** „Singender Sync-Lead mit wanderndem Biss – erinnert an New-Wave-Soli um 1980 (Stil Ultravox).“

#### UV2 „Bossa-Kiste 77“ – Rolle Drums · Drum-Synth (neu)

- **Vorbild (ⓘ):** umprogrammiertes Bossa-Preset einer frühen Rhythmusmaschine (WAHRSCHEINLICH).
- **Kit-Rezept:**
  - KICK `{frq 75, pAmt 0, tDec .18}` – weich, ohne Sweep.
  - RIM `{cTyp Tick, cLvl .6, frq 1900, tDec .02}` (Clave).
  - HH ZU `{mTun .9, mDec .02, mLvl .5}` – leise.
  - SNARE `{frq 230, tDec .06, nTyp BP, nFrq 2200, nDec .08}` – nur im Wirbel.
  - Spur-FX: Drive 0,15 (Röhren-Charakter der frühen Kisten, UNBELEGT).
- **Unterschied:** J3 „Rhythmus-Kiste 76“ (Jarre) hat Beguine + Clave + Shaker bei 104 BPM; hier Bossa-Clave (3-2/2-3 im Wechsel) bei 122 BPM, ohne Shaker.
- **Hörprobe** (Takt 4 bricht in einen Snare-Wirbel aus – die Rock-Band übernimmt):
```
Tempo 122 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK  | x.....x.x.....x. | x.....x.x.....x. | x.....x.x.....x. | x.....x.x.x.x.x.
RIM   | x..x..x...x..x.. | ..x..x...x..x... | x..x..x...x..x.. | ..x..x...x......
HH ZU | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.x.x. | x.xxx.x.x.xxx.x. | x.x.x.x.xxxxxxxx
SNARE | ................ | ................ | ................ | ............x.xx
```
Dauer: alle 4 Takte 7,9 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,9 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,9 s
- **Karte:** „Bossa-Preset einer frühen Rhythmusbox, umgebaut für Wave – erinnert an die ersten Synthpop-Versuche von 1977 (Stil Ultravox).“

---

### 3.5 Visage (`vorbild: visage`, neu, „b Drums, w Bass“)

| Fakt | Status | Quelle |
|---|---|---|
| „Fade to Grey“ (1980): **Grundbeat auf der Roland CR-78** (Rusty Egan) | BELEGT (Musiker selbst, Roland-Artikel; Interview 1984) | articles.roland.com (?p=101432); muzines.co.uk „Searching for the perfect beat“ |
| „The drum break on Fade to Grey is all Fairlight“; der CMI wurde auf „Visage“ viel benutzt | BELEGT als Zitat (Interview 1984; Sprecher laut Muzines-Übersicht wohl Egan, nicht Ure) → **Widerspruch** zu „komplett CR-78“; im ⓘ nie „komplett“ | muzines.co.uk „Behind Visage“ (E&MM Aug. 1984, SE) |
| Moog-Bassline, Komposition Chris Payne, ergänzt durch Curries ARP Odyssey | WAHRSCHEINLICH (Fan-Magazin); Payne als Synth-Spieler laut Album-Credits BELEGT | electricityclub.co.uk „Beginner’s Guide to Visage“; Wikipedia „Visage (album)“ |
| Album-Ausstattung: zwei ARP Odyssey, etwa drei Yamaha-String-Synths, ein CS-80, ein Minimoog | BELEGT (Interview 1984) | muzines.co.uk „Behind Visage“ |
| CR-78 setzt den Hi-Hat-Puls im Eröffnungsstück „Astradyne“ | WAHRSCHEINLICH | electricityclub.co.uk |
| Tempo/Tonart „Fade to Grey“ | UNBELEGT (eine Seite ordnet den Titel falsch Ultravox zu) | musiciwant.com (unbrauchbar) |

#### VI1 „Grauschleier-Bass“ – Rolle Bass · VA (neu)

- **Vorbild (ⓘ):** Moog-Bass, sequenzartig, dunkel (WAHRSCHEINLICH).
- **Rezept:** `o1w 0, o2w 1, o2pw .5, o2oct -1, o2lvl .5, ftype 0, cutoff 340, res .32, drive .35, bass .5, kt .45, fenv .45, fvel .3, fA .002, fD .16, fS .1, fR .08, aA .002, aD .25, aS .75, aR .06, ampVel .45, mode 2, poly 1, glide .025, analog .2, spread 0` · fx `{rev .08}`
- **Warum so:** Säge + Rechteck eine Oktave tiefer, Filter fast zu (340 Hz) mit Resonanz 32 % = dunkles „Blubbern“ in den 16tel-Lücken; Legato mit kurzem Glide für die Durchgänge. Unterschied zu K1 (Achtel mit Band-Echo, Dur) und Werk „Synthpop-Bass“ (Pro-One/SH-101, Puls-Oktave oben): hier Puls unten, kein Echo, Moll, Lücken-Rhythmus.
- **Lage / Rolle:** Probe F1–D3 (29–50). Grundton-Bereich **hoch D2**, Oktave darf bis D3. **Akkord-Reaktion:** nächstliegend, bei Gleichstand abwärts; nie über D3.
- **Hörprobe** (d-Moll, 16tel mit Lücken; Takt 4 über C7 zurück nach d-Moll):
```
Tempo 120 BPM · 4 Takte · Akkorde: Dm | Dm | Bb | C7
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D2(38) 0/1/108 · D2(38) 2/1/90 · D3(50) 3/1/78 · D2(38) 5/1/78 · A1(33) 6/1/90 · D2(38) 8/1/104 · D2(38) 10/1/90 · C3(48) 11/1/78 · D2(38) 13/1/78 · F2(41) 14/1/90
T2: D2(38) 16/1/108 · D2(38) 18/1/90 · D3(50) 19/1/78 · D2(38) 21/1/78 · A1(33) 22/1/90 · D2(38) 24/1/104 · F2(41) 26/1/90 · G2(43) 27/1/78 · A2(45) 29/1/78 · C3(48) 30/1/90
T3: Bb1(34) 32/1/108 · Bb1(34) 34/1/90 · Bb2(46) 35/1/78 · Bb1(34) 37/1/78 · F1(29) 38/1/90 · Bb1(34) 40/1/104 · Bb1(34) 42/1/90 · A2(45) 43/1/78 · Bb1(34) 45/1/78 · D2(38) 46/1/90
T4: C2(36) 48/1/114 · C2(36) 50/1/96 · C3(48) 51/1/84 · C2(36) 53/1/84 · G1(31) 54/1/96 · C2(36) 56/1/110 · E2(40) 58/1/96 · G2(43) 59/1/84 · Bb2(46) 61/1/84 · C3(48) 62/1/96 · E2(40) 63/1/84
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s · Lage der Probe F1–D3 (29–50)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.25,38,0.85],[0.5,0.25,38,0.71],[0.75,0.25,50,0.61],[1.25,0.25,38,0.61],[1.5,0.25,33,0.71],[2,0.25,38,0.82],[2.5,0.25,38,0.71],[2.75,0.25,48,0.61],[3.25,0.25,38,0.61],[3.5,0.25,41,0.71],[4,0.25,38,0.85],[4.5,0.25,38,0.71],[4.75,0.25,50,0.61],[5.25,0.25,38,0.61],[5.5,0.25,33,0.71],[6,0.25,38,0.82],[6.5,0.25,41,0.71],[6.75,0.25,43,0.61],[7.25,0.25,45,0.61],[7.5,0.25,48,0.71],[8,0.25,34,0.85],[8.5,0.25,34,0.71],[8.75,0.25,46,0.61],[9.25,0.25,34,0.61],[9.5,0.25,29,0.71],[10,0.25,34,0.82],[10.5,0.25,34,0.71],[10.75,0.25,45,0.61],[11.25,0.25,34,0.61],[11.5,0.25,38,0.71],[12,0.25,36,0.9],[12.5,0.25,36,0.76],[12.75,0.25,48,0.66],[13.25,0.25,36,0.66],[13.5,0.25,31,0.76],[14,0.25,36,0.87],[14.5,0.25,40,0.76],[14.75,0.25,43,0.66],[15.25,0.25,46,0.66],[15.5,0.25,48,0.76],[15.75,0.25,40,0.66]]`
- **Karte:** „Dunkler Moog-Bass in 16teln mit Lücken – erinnert an die Club-Wave der New Romantics um 1980 (Stil Visage).“

#### VI2 Hörprobe für R6 N09 „Rhythmus-Box 78“ – Rolle Drums (vorhanden)

- **Rezept:** R6 N09 unverändert (Kick 65 Hz weich, Snare 240 Hz + kurzes Rauschen, Hat METALL 15 ms, trocken). Neuer Vorbild-Tag `visage` (BELEGT) neben `omd`.
- **Unterschied zur OMD-Probe** (`vorbild-pop.md` §6.6, 140 BPM, dichte 3er-Hats): 120 BPM, **durchgehender 16tel-Hat-Puls**, sparsame Kick.
```
Tempo 120 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK  | x.......x....... | x.......x.x..... | x.......x....... | x.......x...x.x.
SNARE | ....x.......x... | ....x.......x... | ....x.......x... | ....x.......x.xx
HH ZU | xxxxxxxxxxxxxxxx | xxxxxxxxxxxxxxxx | xxxxxxxxxxxxxxxx | xxxxxxxxxxxx....
RIM   | ................ | .......x........ | ...x............ | ................
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s
- **Karte:** „Gleichmäßiger 16tel-Puls der Kult-Rhythmusbox – erinnert an New-Romantic-Clubs um 1980 (Stil Visage).“

---

### 3.6 The Buggles (`vorbild: buggles`, neu, „b Geräte, u Part“)

| Fakt | Status | Quelle |
|---|---|---|
| „Video Killed the Radio Star“ (1979): Synth-Streicher mit **Solina, Minimoog und Prophet-5** (der Prophet-5 von Hans Zimmer, laut Horns Autobiografie) | BELEGT (Fachpresse, zitiert Primärquelle) | MusicRadar „Hans Zimmer and his giant Moog“ |
| Elektronische Parts **bewusst ohne Sequenzer** gespielt, sollten aber maschinenhaft klingen (Horn) | BELEGT | MusicRadar (SE) |
| Produktion Trevor Horn und Geoff Downes; Town House und Sarm East, London 1979 | BELEGT | Wikipedia „Video Killed the Radio Star“ |
| Wer welches Gerät spielte | UNBELEGT | – |

#### BG1 Hörprobe für Werk „Ensemble-Streicher“ – Rolle Fläche · VA (V0a Z. 5743)

- **Rezept:** Werk unverändert (Solina-Typ, Ensemble-Chorus). Neuer Vorbild-Tag `buggles` (BELEGT als Gerät).
- **Lage / Rolle:** Probe G3–B4 (55–71). Flächen-Regel, Klammer C3–C5.
- **Hörprobe** (D-Dur, I–vi–IV–V7, 132 BPM; obere Stimme wandert, Takt 4 Sexte → Septime als Wendung):
```
Tempo 132 BPM · 4 Takte · Akkorde: D | Bm | G | A7
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D4(62) 0/16/86 · F#4(66) 0/16/86 · A4(69) 0/8/90 · B4(71) 8/4/92 · A4(69) 12/4/88
T2: B3(59) 16/16/86 · D4(62) 16/16/86 · F#4(66) 16/16/86 · B4(71) 16/8/92 · A4(69) 24/8/88
T3: G3(55) 32/16/86 · B3(59) 32/16/86 · D4(62) 32/16/86 · G4(67) 32/4/88 · A4(69) 36/4/90 · B4(71) 40/8/94
T4: A3(57) 48/8/90 · C#4(61) 48/8/90 · E4(64) 48/8/90 · A4(69) 48/8/90 · A3(57) 56/8/96 · C#4(61) 56/8/96 · E4(64) 56/8/96 · G4(67) 56/8/96
```
Dauer: alle 4 Takte 7,3 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,3 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,3 s · Lage der Probe G3–B4 (55–71)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,4,62,0.68],[0,4,66,0.68],[0,2,69,0.71],[2,1,71,0.72],[3,1,69,0.69],[4,4,59,0.68],[4,4,62,0.68],[4,4,66,0.68],[4,2,71,0.72],[6,2,69,0.69],[8,4,55,0.68],[8,4,59,0.68],[8,4,62,0.68],[8,1,67,0.69],[9,1,69,0.71],[10,2,71,0.74],[12,2,57,0.71],[12,2,61,0.71],[12,2,64,0.71],[12,2,69,0.71],[14,2,57,0.76],[14,2,61,0.76],[14,2,64,0.76],[14,2,67,0.76]]`
- **Karte:** „Helle Streicher-Maschine im Pop-Takt – erinnert an Radio-Pop von 1979 (Stil The Buggles).“

#### BG2 „Handspiel-Kette“ – Rolle Sequenz (von Hand) · VA (neu)

- **Vorbild (ⓘ):** maschinenhafte Achtel, aber von Hand gespielt (BELEGT als Arbeitsweise). Klang UNBELEGT.
- **Rezept:** `o1w 1, o1pw .4, o2w 0, o2fine 4, o2lvl .5, ftype 0, cutoff 1100, res .25, drive .15, kt .6, fenv .35, fvel .4, fA .001, fD .14, fS .1, fR .08, aA .001, aD .2, aS .2, aR .08, ampVel .55, mode 1, poly 1, analog .25, spread 0` · fx `{dly .15, rev .2}`
- **Warum so:** **kein Phasen-Reset** und hohe Anschlag-Wirkung (ampVel .55, fvel .4): Jede Note klingt etwas anders, wie gespielt. Die Hörprobe nutzt bewusst unregelmäßige Anschläge (Liste `hand` im Skript). Unterschied zu Sequenz-Sounds mit `reset 1` (K2, YM1).
- **Lage / Rolle:** Probe G3–D5 (55–74). Grundton-Bereich G3–D4, **hoch D5**. **Akkord-Reaktion:** nächstliegend.
- **Hörprobe** (D-Dur, Achtel-Arpeggio, Takt 2 mit Pause und Aufstieg, Takt 3 in 16teln):
```
Tempo 132 BPM · 4 Takte · Akkorde: D | Bm | G | A
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D4(62) 0/1/96 · A4(69) 2/1/82 · F#4(66) 4/1/90 · A4(69) 6/1/78 · D5(74) 8/1/101 · A4(69) 10/1/84 · F#4(66) 12/1/88 · A4(69) 14/1/80
T2: B3(59) 16/1/78 · F#4(66) 18/1/101 · D4(62) 20/1/84 · B4(71) 24/1/80 · F#4(66) 26/1/94 · C#5(73) 28/1/79 · D5(74) 30/1/92
T3: G3(55) 32/1/84 · D4(62) 34/1/80 · B3(59) 35/1/94 · D4(62) 37/1/92 · G4(67) 38/1/85 · B4(71) 40/1/81 · A4(69) 42/1/83 · G4(67) 43/1/96 · D4(62) 45/1/90 · B3(59) 46/1/78
T4: A3(57) 48/1/86 · E4(64) 50/1/100 · C#4(61) 52/1/85 · E4(64) 54/1/98 · A4(69) 56/1/91 · G4(67) 58/1/105 · E4(64) 60/1/87 · C#4(61) 62/1/93
```
Dauer: alle 4 Takte 7,3 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,3 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,3 s · Lage der Probe G3–D5 (55–74)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.25,62,0.76],[0.5,0.25,69,0.65],[1,0.25,66,0.71],[1.5,0.25,69,0.61],[2,0.25,74,0.8],[2.5,0.25,69,0.66],[3,0.25,66,0.69],[3.5,0.25,69,0.63],[4,0.25,59,0.61],[4.5,0.25,66,0.8],[5,0.25,62,0.66],[6,0.25,71,0.63],[6.5,0.25,66,0.74],[7,0.25,73,0.62],[7.5,0.25,74,0.72],[8,0.25,55,0.66],[8.5,0.25,62,0.63],[8.75,0.25,59,0.74],[9.25,0.25,62,0.72],[9.5,0.25,67,0.67],[10,0.25,71,0.64],[10.5,0.25,69,0.65],[10.75,0.25,67,0.76],[11.25,0.25,62,0.71],[11.5,0.25,59,0.61],[12,0.25,57,0.68],[12.5,0.25,64,0.79],[13,0.25,61,0.67],[13.5,0.25,64,0.77],[14,0.25,69,0.72],[14.5,0.25,67,0.83],[15,0.25,64,0.69],[15.5,0.25,61,0.73]]`
- **Karte:** „Von Hand gespielte Achtel, die trotzdem nach Maschine klingen – erinnert an den Studio-Pop von 1979 (Stil The Buggles).“

---

### 3.7 Japan (`vorbild: japan`, neu, „b Geräte“)

| Fakt | Status | Quelle |
|---|---|---|
| „Ghosts“ (1982, „Tin Drum“, UK Platz 5): Akkorde von Sylvian (**Prophet-5**) und Barbieri (**OB-X**) | BELEGT | Wikipedia „Ghosts (Japan song)“ (SE); electricityclub.co.uk (Barbieri: „Tin Drum“ meist Prophet-5 + OB-X) |
| Barbieri macht den **leicht schrägen Eröffnungsklang auf dem Roland System 700** | WAHRSCHEINLICH (nur Wikipedia-Auszug und Forums-Weitergabe; SOS „Classic Tracks“ nur Einleitung gelesen; System 700 besaß er seit 1978 laut SOS/Electricity Club) | Wikipedia (SE); Sound on Sound „Classic Tracks“ (nur Einleitung) |
| **Marimba**-Part von Steve Jansen arrangiert und gespielt; der Titel hat **keine Drums**, „langsam, karg, hypnotisch“ | BELEGT | Wikipedia (SE) |
| „Tin Drum“: hauptsächlich Prophet-5 und OB-X | BELEGT (Musiker-Interview) | electricityclub.co.uk „Richard Barbieri Interview“ |
| Mick Karns **bundloser Bass** als Kennzeichen; „Quiet Life“ (1979) = Wende zum elektronischen Art-Pop | BELEGT als Beschreibung | Wikipedia „Japan (band)“; progarchives |

**Hinweis:** Die Marimba und der Bundlos-Bass sind echte Instrumente. Die Rezepte unten sind Synth-**Annäherungen** an deren Rolle im Klangbild, keine Nachbildung einer Aufnahme.

#### JP1 „Geisterton“ – Rolle Atmo/Akzent · VA (neu)

- **Vorbild (ⓘ):** leicht schräger, modularer Effektklang als Eröffnung (WAHRSCHEINLICH). Patch UNBELEGT.
- **Rezept:** `o1w 0, o2w 0, o2semi 6, o2fine 4, o2lvl .28, o3w 3, o3oct 1, o3lvl .2, ftype 1, cutoff 950, res .45, drive .05, kt .4, fenv .15, fA .8, fD 2, fS .7, fR 2, aA .5, aD 2, aS .85, aR 2.6, ampVel .25, poly 4, l1shape 0, l1rate .12, analog .35, spread .3` · Route `M('lfo1','cutoff', .05)` · fx `{chorus:{mode:'I', mix:.4}, rev .55, dly .2}` · bus `{hall:{decay 6}}`
- **Warum so:** Der zweite Oszillator liegt leise einen **Tritonus** höher (o2semi 6, 28 %): Jeder Ton trägt eine schräge Farbe, ohne zu kippen. Langsame Hüllkurven, Drift 35 %. Neu, kein Werks-Sound ähnlich.
- **Lage / Rolle:** Probe E3–F♯4 (52–66), am besten C3–C5. Einzeltöne und Zweiklänge, keine dichten Akkorde (sonst zu schräg, UNBELEGT). **Akkord-Reaktion:** Sequenz-Regel (Block), Klammer C3–C5.
- **Hörprobe** (80 BPM, e-Moll mit lydischer Farbe; 8 Töne in 4 Takten, Takt 4 sus4 als offene Wendung):
```
Tempo 80 BPM · 4 Takte · Akkorde: Em(add9) | Cmaj7(#11) | Em(add9) | B7sus4
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E3(52) 0/8/80 · B3(59) 8/8/70
T2: C4(60) 16/12/84 · F#4(66) 28/4/70
T3: G3(55) 32/6/76 · E4(64) 38/10/86
T4: B3(59) 48/8/80 · A3(57) 56/8/72
```
Dauer: alle 4 Takte 12,0 s · kurz (≤ 8 s) T1, T4 = 6,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 12,0 s · Lage der Probe E3–F#4 (52–66)
aud-Daten kurz (`len 2`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,2,52,0.63],[2,2,59,0.55],[4,2,59,0.63],[6,2,57,0.57]]`
aud-Daten ganz (`len 4`): `[[0,2,52,0.63],[2,2,59,0.55],[4,3,60,0.66],[7,1,66,0.55],[8,1.5,55,0.6],[9.5,2.5,64,0.68],[12,2,59,0.63],[14,2,57,0.57]]`
- **Karte:** „Karger, leicht schräger Einzelton im Hall – erinnert an den kühlen Art-Pop von 1982 (Stil Japan).“

#### JP2 „Holzklang-Marimba“ – Rolle Sequenz/Pluck · FM6 (neu)

- **Vorbild (ⓘ):** Marimba als Melodie-Puls in einem Titel ohne Drums (BELEGT als Instrument; ob echt oder Synth, UNBELEGT).
- **Rezept (`p.fm6`):** `alg 5, fb 0, trans 0`
  - OP1 Träger: `OP(1, 99, [99,40,30,45], [99,0,0,0], {vs 2, rs 3})`
  - OP2: `OP(4, 68, [99,72,45,60], [99,0,0,0], {vs 5, rs 3})` – Modulator 4:1, fällt schnell = Holz-Anschlag
  - OP3 Träger: `OP(1, 80, [99,48,35,45], [99,0,0,0], {det 3, vs 2, rs 3})`
  - OP4: `OP(10, 45, [99,85,60,60], [99,0,0,0], {vs 6, rs 4})` – kurzer Klick 10:1
  - OP5/OP6: `OFF()`
  - common `{mode 0, poly 8}` (gain offen) · fx `{rev .3}`
- **Warum so:** Kein Sustain (L2–L4 = 0), schneller Abfall, Rate-Scaling = hohe Töne kürzer, wie bei Holzstäben. Unterschied: Werk „Röhrenglocke“/„Kristallglocke“ (3,5:1 unharmonisch, langer Ausklang).
- **Lage / Rolle:** Probe G4–B5 (67–83), am besten C4–C6. **Grenze tief C4.** **Akkord-Reaktion:** nächstliegend.
- **Hörprobe** (104 BPM, D-dorisch, synkopiert; Takt 4 endet auf Cmaj7 mit H5 als offene Wendung):
```
Tempo 104 BPM · 4 Takte · Akkorde: Dm7 | Em7 | Dm7 | Cmaj7
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D5(74) 0/1/96 · A4(69) 2/1/90 · C5(72) 4/1/101 · D5(74) 5/1/84 · F5(77) 7/1/80 · E5(76) 9/1/79 · C5(72) 11/1/85 · A4(69) 13/1/81
T2: E5(76) 16/1/90 · B4(71) 18/1/101 · D5(74) 20/1/88 · E5(76) 21/1/80 · G5(79) 23/1/79 · F#5(78) 25/1/85 · D5(74) 27/1/81 · B4(71) 29/1/83 · E5(76) 31/1/82
T3: D5(74) 32/1/101 · F5(77) 34/1/88 · A5(81) 36/1/94 · G5(79) 38/1/92 · F5(77) 39/1/85 · D5(74) 41/1/81 · C5(72) 43/1/83 · A4(69) 44/1/96 · C5(72) 46/1/90
T4: E5(76) 48/1/92 · C5(72) 50/1/98 · G4(67) 52/1/96 · B4(71) 54/1/103 · C5(72) 55/1/85 · E5(76) 57/1/87 · G5(79) 58/1/100 · B5(83) 60/1/94
```
Dauer: alle 4 Takte 9,2 s · kurz (≤ 8 s) T1, T2, T4 = 6,9 s · ganz (≤ 16 s) T1, T2, T3, T4 = 9,2 s · Lage der Probe G4–B5 (67–83)
aud-Daten kurz (`len 3`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.25,74,0.76],[0.5,0.25,69,0.71],[1,0.25,72,0.8],[1.25,0.25,74,0.66],[1.75,0.25,77,0.63],[2.25,0.25,76,0.62],[2.75,0.25,72,0.67],[3.25,0.25,69,0.64],[4,0.25,76,0.71],[4.5,0.25,71,0.8],[5,0.25,74,0.69],[5.25,0.25,76,0.63],[5.75,0.25,79,0.62],[6.25,0.25,78,0.67],[6.75,0.25,74,0.64],[7.25,0.25,71,0.65],[7.75,0.25,76,0.65],[8,0.25,76,0.72],[8.5,0.25,72,0.77],[9,0.25,67,0.76],[9.5,0.25,71,0.81],[9.75,0.25,72,0.67],[10.25,0.25,76,0.69],[10.5,0.25,79,0.79],[11,0.25,83,0.74]]`
aud-Daten ganz (`len 4`): `[[0,0.25,74,0.76],[0.5,0.25,69,0.71],[1,0.25,72,0.8],[1.25,0.25,74,0.66],[1.75,0.25,77,0.63],[2.25,0.25,76,0.62],[2.75,0.25,72,0.67],[3.25,0.25,69,0.64],[4,0.25,76,0.71],[4.5,0.25,71,0.8],[5,0.25,74,0.69],[5.25,0.25,76,0.63],[5.75,0.25,79,0.62],[6.25,0.25,78,0.67],[6.75,0.25,74,0.64],[7.25,0.25,71,0.65],[7.75,0.25,76,0.65],[8,0.25,74,0.8],[8.5,0.25,77,0.69],[9,0.25,81,0.74],[9.5,0.25,79,0.72],[9.75,0.25,77,0.67],[10.25,0.25,74,0.64],[10.75,0.25,72,0.65],[11,0.25,69,0.76],[11.5,0.25,72,0.71],[12,0.25,76,0.72],[12.5,0.25,72,0.77],[13,0.25,67,0.76],[13.5,0.25,71,0.81],[13.75,0.25,72,0.67],[14.25,0.25,76,0.69],[14.5,0.25,79,0.79],[15,0.25,83,0.74]]`
- **Karte:** „Synkopierte Holz-Marimba ohne Schlagzeug – erinnert an den Art-Pop von 1982 (Stil Japan).“

#### JP3 „Bundlos-Bass“ – Rolle Bass · VA (neu)

- **Vorbild (ⓘ):** gleitender, singender Bundlos-Bass (BELEGT als Kennzeichen; echtes Instrument).
- **Rezept:** `o1w 2, o2w 0, o2fine 3, o2lvl .3, ftype 0, cutoff 520, res .2, drive .2, bass .4, kt .55, fenv .3, fvel .4, fA .02, fD .35, fS .4, fR .2, aA .006, aD .5, aS .75, aR .15, ampVel .45, mode 2, poly 1, glide .11, l2shape 0, l2rate 5, l2fade .6, analog .2, spread 0` · Route `M('lfo2','pitch', .003)` · fx `{chorus:{mode:'I', mix:.25}, rev .12}`
- **Warum so:** Dreieck + leise Säge = rund mit etwas Biss. **Filter-Attack 20 ms** = das „Mwah“ des Bundlos-Tons. Glide 0,11 s nur bei überlappenden Noten (Legato): Die Hörprobe überlappt gezielt um 1/16, damit die Töne rutschen. Verzögertes Vibrato. Unterschied zum Werk „Gummi-Bass“ (12 dB, Resonanz 60 % = „wow“ im Anschlag, Glide 45 ms).
- **Lage / Rolle:** Probe F1–C3 (29–48). Grundton-Bereich **hoch A2**, Oktave bis C3. **Akkord-Reaktion:** nächstliegend, Gleichstand abwärts.
- **Hörprobe** (100 BPM, a-Moll, Am7–Fmaj7–G–Em7, Gleit-Übergänge; Takt 4 endet auf G♯2 als Leitton):
```
Tempo 100 BPM · 4 Takte · Akkorde: Am7 | Fmaj7 | G | Em7 → E
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A1(33) 0/4/100 · E2(40) 3/3/86 · G2(43) 6/2/80 · A2(45) 8/6/96 · C3(48) 13/3/84
T2: F2(41) 16/6/98 · E2(40) 21/2/80 · C2(36) 23/3/84 · F1(29) 26/6/96
T3: G1(31) 32/4/100 · D2(38) 35/3/86 · G2(43) 38/4/90 · B2(47) 41/3/84 · A2(45) 44/4/88
T4: E2(40) 48/4/98 · B1(35) 52/2/84 · D2(38) 54/2/84 · E2(40) 56/3/92 · G2(43) 58/3/88 · Ab2(44) 61/3/90
```
Dauer: alle 4 Takte 9,6 s · kurz (≤ 8 s) T1, T2, T4 = 7,2 s · ganz (≤ 16 s) T1, T2, T3, T4 = 9,6 s · Lage der Probe F1–C3 (29–48)
aud-Daten kurz (`len 3`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,1,33,0.79],[0.75,0.75,40,0.68],[1.5,0.5,43,0.63],[2,1.5,45,0.76],[3.25,0.75,48,0.66],[4,1.5,41,0.77],[5.25,0.5,40,0.63],[5.75,0.75,36,0.66],[6.5,1.5,29,0.76],[8,1,40,0.77],[9,0.5,35,0.66],[9.5,0.5,38,0.66],[10,0.75,40,0.72],[10.5,0.75,43,0.69],[11.25,0.75,44,0.71]]`
aud-Daten ganz (`len 4`): `[[0,1,33,0.79],[0.75,0.75,40,0.68],[1.5,0.5,43,0.63],[2,1.5,45,0.76],[3.25,0.75,48,0.66],[4,1.5,41,0.77],[5.25,0.5,40,0.63],[5.75,0.75,36,0.66],[6.5,1.5,29,0.76],[8,1,31,0.79],[8.75,0.75,38,0.68],[9.5,1,43,0.71],[10.25,0.75,47,0.66],[11,1,45,0.69],[12,1,40,0.77],[13,0.5,35,0.66],[13.5,0.5,38,0.66],[14,0.75,40,0.72],[14.5,0.75,43,0.69],[15.25,0.75,44,0.71]]`
- **Karte:** „Singender, gleitender Bass mit weichem Anschlag – erinnert an den Art-Pop um 1980 (Stil Japan).“

---

### 3.8 Sparks (`vorbild: sparks`, neu, „b Arbeitsweise, u Geräte“)

| Fakt | Status | Quelle |
|---|---|---|
| „No. 1 in Heaven“ (1979) mit **Giorgio Moroder**; Arrangements aus **geschichteten Sequenzern und Synths**; einziger Live-Musiker Keith Forsey (Kick) | BELEGT | Wikipedia „No. 1 in Heaven“ (SE); The Quietus |
| Ron Mael: „keine Drumcomputer“, Forsey spielte 15 Minuten Kick | BELEGT (Uncut-Zitat, wiedergegeben) | madelinex.com |
| Arbeit mit Moogs „viel Versuch und Irrtum“; Sequenzer damals „primitiv“ | BELEGT (Interview-Auszug) | Classic Pop „Making Sparks“ (via vinylwriters.com) |
| „The Number One Song in Heaven“: beginnt mit Gesangsschichten über **sägezahnartigen Synth-Flächen**, wechselt nach etwa 3:30 in Hi-NRG-Disco | BELEGT (Beschreibung) | Wikipedia (SE) |
| Konkrete Geräte, Tempo, Tonart | UNBELEGT | – |

#### SP1 „Himmelsleiter-Sequenz“ – Rolle Sequenz · VA (neu)

- **Vorbild (ⓘ):** geschichtete 16tel-Sequenzen, Disco-Tempo (BELEGT als Arbeitsweise). Klang UNBELEGT.
- **Rezept:** `o1w 0, o2w 1, o2pw .3, o2oct 1, o2lvl .35, ftype 0, cutoff 900, res .45, drive .25, kt .6, fenv .4, fA .001, fD .1, fS .05, fR .06, aA .001, aD .15, aS .4, aR .05, ampVel .4, mode 1, poly 1, reset 1, analog .15, spread 0` · fx `{dly .2, rev .25}` · bus `{echo:{mode:'pp', divL:'1/16', fb .15}}`
- **Warum so:** Orgelpunkt-Figur: jede zweite 16tel ist der tiefe Grundton, dazwischen steigt eine Oberstimme („Leiter“). Unterschied zu K2 (Arpeggio-Pendel) und Werk „Moroder-Puls“ (Achtel, nur Grundton/Oktave).
- **Lage / Rolle:** Probe D2–E4 (38–64). Grundton-Bereich D2–A2, **hoch E4**. **Akkord-Reaktion:** nächstliegend; bei F♯ ↓ (Vorschlag `dirAt {F#: ↓}`, damit der Orgelpunkt tief bleibt).
- **Hörprobe** (A-Dur, I–vi–IV–V7, 132 BPM; Takt 4 löst den Orgelpunkt in einen Lauf auf):
```
Tempo 132 BPM · 4 Takte · Akkorde: A | F#m | D | E7
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A2(45) 0/1/108 · A3(57) 1/1/78 · A2(45) 2/1/90 · A3(57) 3/1/78 · A2(45) 4/1/108 · B3(59) 5/1/78 · A2(45) 6/1/90 · C#4(61) 7/1/78 · A2(45) 8/1/104 · A3(57) 9/1/78 · A2(45) 10/1/90 · E4(64) 11/1/78 · A2(45) 12/1/108 · C#4(61) 13/1/78 · A2(45) 14/1/90 · B3(59) 15/1/78
T2: F#2(42) 16/1/108 · F#3(54) 17/1/78 · F#2(42) 18/1/90 · A3(57) 19/1/78 · F#2(42) 20/1/108 · C#4(61) 21/1/78 · F#2(42) 22/1/90 · A3(57) 23/1/78 · F#2(42) 24/1/104 · F#3(54) 25/1/78 · F#2(42) 26/1/90 · E4(64) 27/1/78 · F#2(42) 28/1/108 · C#4(61) 29/1/78 · F#2(42) 30/1/90 · A3(57) 31/1/78
T3: D2(38) 32/1/108 · D3(50) 33/1/78 · D2(38) 34/1/90 · F#3(54) 35/1/78 · D2(38) 36/1/108 · A3(57) 37/1/78 · D2(38) 38/1/90 · D4(62) 39/1/78 · D2(38) 40/1/104 · A3(57) 41/1/78 · D2(38) 42/1/90 · F#3(54) 43/1/78 · D2(38) 44/1/108 · E3(52) 45/1/78 · D2(38) 46/1/90 · F#3(54) 47/1/78
T4: E2(40) 48/1/114 · E3(52) 49/1/84 · E2(40) 50/1/96 · Ab3(56) 51/1/84 · E2(40) 52/1/114 · B3(59) 53/1/84 · E2(40) 54/1/96 · E4(64) 55/1/84 · E2(40) 56/1/110 · D4(62) 57/1/84 · E2(40) 58/1/96 · B3(59) 59/1/84 · Ab2(44) 60/1/114 · B2(47) 61/1/84 · D3(50) 62/1/96 · E3(52) 63/1/84
```
Dauer: alle 4 Takte 7,3 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,3 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,3 s · Lage der Probe D2–E4 (38–64)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.25,45,0.85],[0.25,0.25,57,0.61],[0.5,0.25,45,0.71],[0.75,0.25,57,0.61],[1,0.25,45,0.85],[1.25,0.25,59,0.61],[1.5,0.25,45,0.71],[1.75,0.25,61,0.61],[2,0.25,45,0.82],[2.25,0.25,57,0.61],[2.5,0.25,45,0.71],[2.75,0.25,64,0.61],[3,0.25,45,0.85],[3.25,0.25,61,0.61],[3.5,0.25,45,0.71],[3.75,0.25,59,0.61],[4,0.25,42,0.85],[4.25,0.25,54,0.61],[4.5,0.25,42,0.71],[4.75,0.25,57,0.61],[5,0.25,42,0.85],[5.25,0.25,61,0.61],[5.5,0.25,42,0.71],[5.75,0.25,57,0.61],[6,0.25,42,0.82],[6.25,0.25,54,0.61],[6.5,0.25,42,0.71],[6.75,0.25,64,0.61],[7,0.25,42,0.85],[7.25,0.25,61,0.61],[7.5,0.25,42,0.71],[7.75,0.25,57,0.61],[8,0.25,38,0.85],[8.25,0.25,50,0.61],[8.5,0.25,38,0.71],[8.75,0.25,54,0.61],[9,0.25,38,0.85],[9.25,0.25,57,0.61],[9.5,0.25,38,0.71],[9.75,0.25,62,0.61],[10,0.25,38,0.82],[10.25,0.25,57,0.61],[10.5,0.25,38,0.71],[10.75,0.25,54,0.61],[11,0.25,38,0.85],[11.25,0.25,52,0.61],[11.5,0.25,38,0.71],[11.75,0.25,54,0.61],[12,0.25,40,0.9],[12.25,0.25,52,0.66],[12.5,0.25,40,0.76],[12.75,0.25,56,0.66],[13,0.25,40,0.9],[13.25,0.25,59,0.66],[13.5,0.25,40,0.76],[13.75,0.25,64,0.66],[14,0.25,40,0.87],[14.25,0.25,62,0.66],[14.5,0.25,40,0.76],[14.75,0.25,59,0.66],[15,0.25,44,0.9],[15.25,0.25,47,0.66],[15.5,0.25,50,0.76],[15.75,0.25,52,0.66]]`
- **Karte:** „Hüpfende 16tel-Leiter über tiefem Orgelpunkt – erinnert an Disco-Synthpop von 1979 (Stil Sparks).“

#### SP2 „Lichtsäulen-Fläche“ – Rolle Fläche · VA (neu)

- **Vorbild (ⓘ):** sägezahnartige Synth-Flächen unter Falsett-Gesang (BELEGT als Beschreibung).
- **Rezept:** `o1uni 3, uniDet .25, uniMix .7, o2w 0, o2oct 1, o2fine -5, o2lvl .4, ftype 1, cutoff 2600, res .1, drive .1, kt .4, fenv .12, fA .6, fD 2, fS .7, aA .5, aD 1.5, aS .9, aR 2.2, ampVel .25, poly 6, analog .25, spread .45` · fx `{chorus:{mode:'II', mix:.4}, rev .55}` · bus `{hall:{decay 5}}`
- **Warum so:** 3-fach-Säge (nicht 7 wie „Supersaw-Hymne“/„Rom-Fläche“) + Oktave = hell und „feierlich“, aber nicht modern-breit.
- **Lage / Rolle:** Probe A2–A4 (45–69), am besten A2–C5. Flächen-Regel, Klammer A2–C5.
- **Hörprobe** (96 BPM, A-Dur, I–iii–IV–iv; Takt 4 Moll-Subdominante als Wendung):
```
Tempo 96 BPM · 4 Takte · Akkorde: A | C#m | D | Dm
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A2(45) 0/16/86 · E3(52) 0/16/86 · C#4(61) 0/16/86 · A4(69) 0/16/86
T2: C#3(49) 16/16/86 · Ab3(56) 16/16/86 · E4(64) 16/16/86 · Ab4(68) 16/16/86
T3: D3(50) 32/16/88 · A3(57) 32/16/88 · F#4(66) 32/16/88 · A4(69) 32/16/88
T4: D3(50) 48/16/92 · A3(57) 48/16/92 · F4(65) 48/16/92 · A4(69) 48/16/92
```
Dauer: alle 4 Takte 10,0 s · kurz (≤ 8 s) T1, T2, T4 = 7,5 s · ganz (≤ 16 s) T1, T2, T3, T4 = 10,0 s · Lage der Probe A2–A4 (45–69)
aud-Daten kurz (`len 3`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,4,45,0.68],[0,4,52,0.68],[0,4,61,0.68],[0,4,69,0.68],[4,4,49,0.68],[4,4,56,0.68],[4,4,64,0.68],[4,4,68,0.68],[8,4,50,0.72],[8,4,57,0.72],[8,4,65,0.72],[8,4,69,0.72]]`
aud-Daten ganz (`len 4`): `[[0,4,45,0.68],[0,4,52,0.68],[0,4,61,0.68],[0,4,69,0.68],[4,4,49,0.68],[4,4,56,0.68],[4,4,64,0.68],[4,4,68,0.68],[8,4,50,0.69],[8,4,57,0.69],[8,4,66,0.69],[8,4,69,0.69],[12,4,50,0.72],[12,4,57,0.72],[12,4,65,0.72],[12,4,69,0.72]]`
- **Karte:** „Feierliche Sägezahn-Fläche für Falsett-Gesang – erinnert an den Disco-Synthpop von 1979 (Stil Sparks).“

---

### 3.9 Vangelis (`vorbild: vangelis`, Belegstatus von „e“ auf **„b Gerät/Spielweise, w Patch“**)

| Fakt | Status | Quelle |
|---|---|---|
| **Yamaha CS-80** war sein Lieblings-Synth; er besaß mehrere (Zahl uneinig: 4 bzw. 7) | BELEGT (Gerät), Anzahl WAHRSCHEINLICH | Reverbmachine; MusicRadar „40 greatest, No 1“ |
| Ausdruck über **Anschlag, Aftertouch und Ribbon**; fallende Tonhöhen-Rutscher in „Blade Runner“ mit dem **Ribbon** | BELEGT | Reverbmachine „Blade Runner Synth Sounds“ |
| Nachbau „Blade Runner Brass“: Säge, PWM, dynamische Filter-Modulation, Amp-Attack 250 ms, Decay 1,9 s | WAHRSCHEINLICH (Nachbau-Rezept, nicht Original) | syntorial.com |
| Viel Hall gehört zum Klang | WAHRSCHEINLICH | Reverbmachine; Lookmumnocomputer-Forum |

#### VG1 „Sternfall-Brass“ – Rolle Lead (Blech) · VA (neu; Gegenstück zum Werk „Weite 82“)

- **Vorbild (ⓘ):** Blech-Lead mit langsamer Filter-Hüllkurve, Anschlag/Aftertouch und fallenden Rutschern (BELEGT als Spielweise).
- **Rezept:** `o1w 0, o2w 1, o2pw .45, o2fine -8, o2lvl .85, o3w 0, o3oct -1, o3lvl .25, ftype 1, cutoff 650, res .18, drive .15, kt .5, fenv .45, fvel .5, fA .3, fD 1.6, fS .6, fR 1.2, aA .2, aD 1.9, aS .9, aR 1.8, ampVel .45, mode 2, poly 1, glide .22, l1shape 1, l1rate .6, l2shape 0, l2rate 5, l2fade 1.2, analog .3, spread 0` · Routen `M('lfo1','pw', .2), M('lfo2','pitch', .004), M('mw','cutoff', .12), M('vel','cutoff', .06)` · fx `{chorus:{mode:'I', mix:.3}, rev .6, dly .12}` · bus `{hall:{decay 7, size 1.2}}`
- **Warum so:** Filter-Attack 0,3 s länger als Amp-Attack 0,2 s = der Ton bläst sich auf (Blech). PWM gegen Starre. **Ersatz für Ribbon:** Legato-Glide 0,22 s – überlappende Noten rutschen; die Hörprobe nutzt das für einen Oktav-Fall (D5 → D4, Takt 3). **Ersatz für Aftertouch:** Mod-Rad → Filter. Unterschied zu „Weite 82“: einstimmig, Glide, Melodie statt Fläche.
- **Lage / Rolle:** Probe A3–D5 (57–74), am besten G3–D5. **Grenze tief G3**, hoch D5 (darüber wird es dünn, UNBELEGT). **Akkord-Reaktion:** folgt der Oktave der Taste.
- **Hörprobe** (72 BPM, d-Moll; nicht g-Moll wie LM2; i–VI–iv–V, Takt 3 Oktav-Fall, Takt 4 Dur-Dominante):
```
Tempo 72 BPM · 4 Takte · Akkorde: Dm | Bb | Gm | A
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D4(62) 0/7/88 · F4(65) 6/3/80 · A4(69) 8/8/100
T2: Bb4(70) 16/8/104 · A4(69) 23/2/84 · F4(65) 24/8/92
T3: G4(67) 32/6/96 · D5(74) 38/6/108 · D4(62) 43/5/86
T4: E4(64) 48/4/90 · C#4(61) 52/4/88 · A3(57) 56/8/100
```
Dauer: alle 4 Takte 13,3 s · kurz (≤ 8 s) T1, T4 = 6,7 s · ganz (≤ 16 s) T1, T2, T3, T4 = 13,3 s · Lage der Probe A3–D5 (57–74)
aud-Daten kurz (`len 2`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,1.75,62,0.69],[1.5,0.75,65,0.63],[2,2,69,0.79],[4,1,64,0.71],[5,1,61,0.69],[6,2,57,0.79]]`
aud-Daten ganz (`len 4`): `[[0,1.75,62,0.69],[1.5,0.75,65,0.63],[2,2,69,0.79],[4,2,70,0.82],[5.75,0.5,69,0.66],[6,2,65,0.72],[8,1.5,67,0.76],[9.5,1.5,74,0.85],[10.75,1.25,62,0.68],[12,1,64,0.71],[13,1,61,0.69],[14,2,57,0.79]]`
- **Karte:** „Großes Blech-Lead, das sich aufbläst und herunterrutscht – erinnert an Science-Fiction-Filmmusik von 1982 (Stil Vangelis). Aftertouch und Ribbon folgen später; jetzt Mod-Rad und Gleiten.“

---

### 3.10 Telex (`vorbild: telex`, neu, „w Geräte“)

| Fakt | Status | Quelle |
|---|---|---|
| Gegründet 1978 in Brüssel: Michel Moers, Marc Moulin, Dan Lacksman; Lacksman = Synth- und Programmier-Spezialist | BELEGT | Qobuz-Biografie; Wikipedia „Dan Lacksman“ (SE) |
| Moulin besaß einen **Minimoog**; Lacksman spielte als Erster Synth, kaufte 1969 ein **EMS VCS3** | BELEGT (Interview) | MusicRadar „Telex interview“ (SE) |
| Lacksmans **Moog-Modular (IIIP)** war zentral für Electronic System und kam beim Eurovision-Auftritt 1980 mit | WAHRSCHEINLICH (Fan-Magazin) | electricityclub.co.uk „Beginner’s Guide to Dan Lacksman“ |
| „Moskow Diskow“: schnell, „fröhliche, aufgeladene“ Variante des Zug-Motivs von Kraftwerk; Sound „hell und futuristisch“, bearbeitete Stimmen | WAHRSCHEINLICH (Rezensions-Text) | Qobuz |
| Geräte je Titel, Tempo, Tonart | UNBELEGT | – |

#### TX1 „Zuckerguss-Lead“ – Rolle Lead · VA (neu)

- **Vorbild (ⓘ):** helle, glatte, fast ironisch brave Synth-Melodie (UNBELEGT als Patch, Stil WAHRSCHEINLICH).
- **Rezept:** `o1w 1, o1pw .5, o2w 1, o2pw .5, o2oct 1, o2lvl .2, ftype 1, cutoff 2600, res .1, drive 0, kt .6, fenv .1, fD .2, fS .8, aA .002, aD .15, aS .8, aR .08, ampVel .3, mode 2, poly 1, glide .08, l2shape 0, l2rate 6, l2fade .3, analog .05, spread 0` · Route `M('lfo2','pitch', .002)` · fx `{dly .15, rev .2}`
- **Warum so:** reines Rechteck, kaum Drift (analog .05), kein Drive = „sauber und brav“. Glide 80 ms für die kleinen Schleifer. Unterschied zu MO2 (Puls 30 % + Säge-Oktave, ohne Glide) und YM2 (PWM + Chorus, poly).
- **Lage / Rolle:** Probe C5–D6 (72–86). **Grenze tief C5.** **Akkord-Reaktion:** folgt der Oktave der Taste.
- **Hörprobe** (120 BPM, F-Dur, I–vi–IV–V, Takt 4 Abwärts-Arpeggio als Wendung):
```
Tempo 120 BPM · 4 Takte · Akkorde: F | Dm | Bb | C
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: C5(72) 0/2/92 · F5(77) 2/2/92 · A5(81) 4/4/100 · G5(79) 8/2/88 · F5(77) 10/2/88 · E5(76) 12/4/92
T2: D5(74) 16/4/94 · F5(77) 20/2/90 · A5(81) 22/2/92 · D6(86) 24/4/102 · C6(84) 28/4/94
T3: Bb5(82) 32/2/94 · A5(81) 34/2/88 · G5(79) 36/2/88 · F5(77) 38/2/88 · D5(74) 40/4/92 · F5(77) 44/4/92
T4: E5(76) 48/2/94 · G5(79) 50/2/94 · C6(84) 52/4/104 · Bb5(82) 56/2/92 · G5(79) 58/2/90 · E5(76) 60/2/90 · C5(72) 62/2/96
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s · Lage der Probe C5–D6 (72–86)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.5,72,0.72],[0.5,0.5,77,0.72],[1,1,81,0.79],[2,0.5,79,0.69],[2.5,0.5,77,0.69],[3,1,76,0.72],[4,1,74,0.74],[5,0.5,77,0.71],[5.5,0.5,81,0.72],[6,1,86,0.8],[7,1,84,0.74],[8,0.5,82,0.74],[8.5,0.5,81,0.69],[9,0.5,79,0.69],[9.5,0.5,77,0.69],[10,1,74,0.72],[11,1,77,0.72],[12,0.5,76,0.74],[12.5,0.5,79,0.74],[13,1,84,0.82],[14,0.5,82,0.72],[14.5,0.5,79,0.71],[15,0.5,76,0.71],[15.5,0.5,72,0.76]]`
- **Karte:** „Blitzsaubere Rechteck-Melodie mit kleinem Gleiten, fast zu brav – erinnert an belgischen Ironie-Synthpop um 1979 (Stil Telex).“

#### TX2 „Tanzschritt-Bass“ – Rolle Bass · VA (neu)

- **Vorbild (ⓘ):** schneller Oktav-Disco-Bass (Stil WAHRSCHEINLICH, Gerät Minimoog WAHRSCHEINLICH).
- **Rezept:** `o1w 1, o1pw .45, o2w 0, o2fine -4, o2lvl .5, ftype 0, cutoff 600, res .28, drive .2, bass .4, kt .5, fenv .35, fA .001, fD .09, fS .1, fR .04, aA .001, aD .12, aS .5, aR .03, ampVel .4, mode 1, poly 1, reset 1, analog .1, spread 0` · fx `{rev .05}`
- **Warum so:** 16tel-Oktaven bei 140 BPM brauchen sehr kurze Hüllkurven (fD 90 ms, aR 30 ms), sonst verschmieren sie. Kein Echo (anders als „Moroder-Puls“ und K1).
- **Lage / Rolle:** Probe F1–E♭3 (29–51). Grundton-Bereich F1–E♭2, Oktave darf mit. **Akkord-Reaktion:** nächstliegend, Gleichstand abwärts; Boden E1.
- **Hörprobe** (140 BPM, g-Moll, i–i–VI–VII; Takt 4 über A und F♯ zurück, F♯ als Leitton):
```
Tempo 140 BPM · 4 Takte · Akkorde: Gm | Gm | Eb | F
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: G1(31) 0/1/108 · G2(43) 1/1/78 · G1(31) 2/1/90 · G2(43) 3/1/78 · G1(31) 4/1/108 · G2(43) 5/1/78 · G1(31) 6/1/90 · G2(43) 7/1/78 · G1(31) 8/1/104 · G2(43) 9/1/78 · G1(31) 10/1/90 · G2(43) 11/1/78 · Bb1(34) 12/1/108 · Bb2(46) 13/1/78 · C2(36) 14/1/90 · C3(48) 15/1/78
T2: G1(31) 16/1/108 · G2(43) 17/1/78 · G1(31) 18/1/90 · G2(43) 19/1/78 · D2(38) 20/1/108 · D3(50) 21/1/78 · G1(31) 22/1/90 · G2(43) 23/1/78 · G1(31) 24/1/104 · G2(43) 25/1/78 · F1(29) 26/1/90 · F2(41) 27/1/78 · D2(38) 28/1/108 · D3(50) 29/1/78 · Bb1(34) 30/1/90 · Bb2(46) 31/1/78
T3: Eb2(39) 32/1/108 · Eb3(51) 33/1/78 · Eb2(39) 34/1/90 · Eb3(51) 35/1/78 · Bb1(34) 36/1/108 · Bb2(46) 37/1/78 · Eb2(39) 38/1/90 · Eb3(51) 39/1/78 · Eb2(39) 40/1/104 · Eb3(51) 41/1/78 · Bb1(34) 42/1/90 · Bb2(46) 43/1/78 · G1(31) 44/1/108 · G2(43) 45/1/78 · Bb1(34) 46/1/90 · Bb2(46) 47/1/78
T4: F1(29) 48/1/114 · F2(41) 49/1/84 · F1(29) 50/1/96 · F2(41) 51/1/84 · F1(29) 52/1/114 · F2(41) 53/1/84 · A1(33) 54/1/96 · A2(45) 55/1/84 · C2(36) 56/1/110 · C3(48) 57/1/84 · F1(29) 58/1/96 · F2(41) 59/1/84 · D2(38) 60/1/114 · D3(50) 61/1/84 · F#1(30) 62/1/96 · F#2(42) 63/1/84
```
Dauer: alle 4 Takte 6,9 s · kurz (≤ 8 s) T1, T2, T3, T4 = 6,9 s · ganz (≤ 16 s) T1, T2, T3, T4 = 6,9 s · Lage der Probe F1–Eb3 (29–51)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.25,31,0.85],[0.25,0.25,43,0.61],[0.5,0.25,31,0.71],[0.75,0.25,43,0.61],[1,0.25,31,0.85],[1.25,0.25,43,0.61],[1.5,0.25,31,0.71],[1.75,0.25,43,0.61],[2,0.25,31,0.82],[2.25,0.25,43,0.61],[2.5,0.25,31,0.71],[2.75,0.25,43,0.61],[3,0.25,34,0.85],[3.25,0.25,46,0.61],[3.5,0.25,36,0.71],[3.75,0.25,48,0.61],[4,0.25,31,0.85],[4.25,0.25,43,0.61],[4.5,0.25,31,0.71],[4.75,0.25,43,0.61],[5,0.25,38,0.85],[5.25,0.25,50,0.61],[5.5,0.25,31,0.71],[5.75,0.25,43,0.61],[6,0.25,31,0.82],[6.25,0.25,43,0.61],[6.5,0.25,29,0.71],[6.75,0.25,41,0.61],[7,0.25,38,0.85],[7.25,0.25,50,0.61],[7.5,0.25,34,0.71],[7.75,0.25,46,0.61],[8,0.25,39,0.85],[8.25,0.25,51,0.61],[8.5,0.25,39,0.71],[8.75,0.25,51,0.61],[9,0.25,34,0.85],[9.25,0.25,46,0.61],[9.5,0.25,39,0.71],[9.75,0.25,51,0.61],[10,0.25,39,0.82],[10.25,0.25,51,0.61],[10.5,0.25,34,0.71],[10.75,0.25,46,0.61],[11,0.25,31,0.85],[11.25,0.25,43,0.61],[11.5,0.25,34,0.71],[11.75,0.25,46,0.61],[12,0.25,29,0.9],[12.25,0.25,41,0.66],[12.5,0.25,29,0.76],[12.75,0.25,41,0.66],[13,0.25,29,0.9],[13.25,0.25,41,0.66],[13.5,0.25,33,0.76],[13.75,0.25,45,0.66],[14,0.25,36,0.87],[14.25,0.25,48,0.66],[14.5,0.25,29,0.76],[14.75,0.25,41,0.66],[15,0.25,38,0.9],[15.25,0.25,50,0.66],[15.5,0.25,30,0.76],[15.75,0.25,42,0.66]]`
- **Karte:** „Rasender 16tel-Oktav-Bass, trocken und kurz – erinnert an belgischen Disco-Synthpop um 1979 (Stil Telex).“

---

### 3.11 Suicide (`vorbild: suicide`, neu, „b Geräte“) – nicht verwechseln mit Suicide Commando (`vorbild-dark.md` §5.9)

| Fakt | Status | Quelle |
|---|---|---|
| Martin Revs erste Drum-Maschine: **Seeburg Rhythm Prince** (30 $), „primitive, lateinamerikanische Pulse“ auf den Proben-Bändern 1975 | BELEGT (Buch-Auszug Kris Needs, Fachmagazin) | electronicsound.co.uk (?p=19523) |
| **Farfisa**-Orgel, vor dem Debüt 1977 dazu; Keyboard durch **Electro-Harmonix-Verzerrer** in Reihe | BELEGT | electronicsound.co.uk |
| Orgel und Rhythmusbox durch Echo-Kammer; Quellen uneinig Farfisa vs. Vox Continental | WAHRSCHEINLICH | electronicsound.co.uk (Rezension 1977) |
| Debüt 1977: in 4 Tagen bei Ultima Sound (NY), Produktion Craig Leon und Marty Thau; Leon legte ein **Eventide-Digital-Delay** auf die Stimme | BELEGT | Wikipedia „Suicide (1977 album)“ (SE) |
| harte, repetitive Rhythmen gegen Rockabilly-Gesang | BELEGT (Beschreibung) | Wikipedia; The Vinyl Factory |
| Geräte je Titel („Ghost Rider“), Tempo, Tonart | UNBELEGT | – |

#### SU1 „Kellerorgel-Drone“ – Rolle Riff/Drone · VA (neu)

- **Vorbild (ⓘ):** billige Combo-Orgel durch Verzerrer und Echo (BELEGT).
- **Rezept:** `o1w 1, o1pw .5, o2w 1, o2pw .5, o2oct 1, o2lvl .45, o3w 1, o3oct -1, o3lvl .3, ftype 1, cutoff 3200, res .05, drive .75, kt .3, fenv 0, aA .004, aD .1, aS 1, aR .04, ampVel .1, poly 4, analog .3, spread 0` · fx `{drive .35, dly .3, rev .25}` · bus `{echo:{mode:'mono', divL:'1/8', fb .3, wow .35, highcut 2500}}`
- **Warum so:** drei Rechtecke in Oktaven (16′/8′/4′-Orgel), keine Filter-Bewegung, fast keine Anschlag-Wirkung (Orgel), dann **Drive vor und nach dem Filter** (Verzerrer-Pedal) und ein dumpfes, leierndes Echo (Echo-Kammer-Ersatz). Neu, kein Orgel-Werks-Sound.
- **Lage / Rolle:** Probe D2–G3 (38–55), am besten C2–C4. Grundton-Bereich G2–C3. **Akkord-Reaktion:** nächstliegend; Riff als Block. Dazu passt eine ⇅-feste Spur (Orgelpunkt).
- **Hörprobe** (144 BPM, G mit phrygischem A♭ statt Rockabilly-Lick; Takt 3 auf C, Takt 4 fällt bis D2):
```
Tempo 144 BPM · 4 Takte · Akkorde: G (Orgelpunkt) | G | C | G
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: G2(43) 0/2/100 · G2(43) 2/2/84 · D3(50) 4/2/100 · G2(43) 6/2/84 · F2(41) 8/2/100 · G2(43) 10/2/84 · D3(50) 12/2/100 · Ab2(44) 14/2/84
T2: G2(43) 16/2/100 · D3(50) 18/2/84 · G2(43) 20/2/100 · D3(50) 22/2/84 · F2(41) 24/2/100 · G2(43) 26/2/84 · Ab2(44) 28/2/100 · G2(43) 30/2/84
T3: C3(48) 32/2/100 · C3(48) 34/2/84 · G3(55) 36/2/100 · C3(48) 38/2/84 · Bb2(46) 40/2/100 · C3(48) 42/2/84 · G3(55) 44/2/100 · C#3(49) 46/2/84
T4: G2(43) 48/2/108 · G2(43) 50/2/92 · D3(50) 52/2/108 · F3(53) 54/2/92 · D3(50) 56/2/108 · Ab2(44) 58/2/92 · G2(43) 60/2/108 · D2(38) 62/2/92
```
Dauer: alle 4 Takte 6,7 s · kurz (≤ 8 s) T1, T2, T3, T4 = 6,7 s · ganz (≤ 16 s) T1, T2, T3, T4 = 6,7 s · Lage der Probe D2–G3 (38–55)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.5,43,0.79],[0.5,0.5,43,0.66],[1,0.5,50,0.79],[1.5,0.5,43,0.66],[2,0.5,41,0.79],[2.5,0.5,43,0.66],[3,0.5,50,0.79],[3.5,0.5,44,0.66],[4,0.5,43,0.79],[4.5,0.5,50,0.66],[5,0.5,43,0.79],[5.5,0.5,50,0.66],[6,0.5,41,0.79],[6.5,0.5,43,0.66],[7,0.5,44,0.79],[7.5,0.5,43,0.66],[8,0.5,48,0.79],[8.5,0.5,48,0.66],[9,0.5,55,0.79],[9.5,0.5,48,0.66],[10,0.5,46,0.79],[10.5,0.5,48,0.66],[11,0.5,55,0.79],[11.5,0.5,49,0.66],[12,0.5,43,0.85],[12.5,0.5,43,0.72],[13,0.5,50,0.85],[13.5,0.5,53,0.72],[14,0.5,50,0.85],[14.5,0.5,44,0.72],[15,0.5,43,0.85],[15.5,0.5,38,0.72]]`
- **Karte:** „Verzerrte Billig-Orgel, roh und hypnotisch – erinnert an New Yorker Minimal-Elektronik von 1977 (Stil Suicide).“

#### SU2 „Billig-Rhythmus“ – Rolle Drums · Drum-Synth (neu)

- **Vorbild (ⓘ):** Preset-Rhythmusbox mit lateinamerikanischen Mustern, durch Effekte (BELEGT).
- **Kit-Rezept:**
  - KICK `{frq 85, pAmt 0, tDec .1}` – bongoartig, klein.
  - RIM `{cTyp Tick, cLvl .5, frq 2200, tDec .015}`.
  - SHAKER `{nTyp HP, nFrq 7000, nDec .03}` (Maracas).
  - PERC `{frq 320, tDec .08}` (Conga-artig).
  - Spur-FX: Drive 0,3, Echo 1/8 mit 25 % (die Kiste lief durch Effekte, BELEGT; Werte UNBELEGT).
- **Hörprobe** (144 BPM; Takt 4 Maracas-Wirbel):
```
Tempo 144 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK   | x.....x...x..... | x.....x...x..... | x.....x...x...x. | x.....x...x.x.x.
RIM    | ...x......x...x. | ...x.......x..x. | ...x......x...x. | ...x..x..x..x...
SHAKER | x.x.x.x.x.x.x.x. | x.xxx.x.x.xxx.x. | x.x.x.x.x.x.x.x. | xxxxxxxxxxxxxxxx
PERC   | ................ | ..x............. | ........x....... | ..........x.x...
```
Dauer: alle 4 Takte 6,7 s · kurz (≤ 8 s) T1, T2, T3, T4 = 6,7 s · ganz (≤ 16 s) T1, T2, T3, T4 = 6,7 s
- **Karte:** „Winzige Latin-Rhythmusbox durch Verzerrer und Echo – erinnert an New Yorker Proto-Elektronik der 70er (Stil Suicide).“

---

### 3.12 Cabaret Voltaire (`vorbild: cabaret-voltaire`, neu, „w Geräte“)

| Fakt | Status | Quelle |
|---|---|---|
| Sheffield ab 1973: Mallinder, Kirk, Watson; Tonband-Schleifen, Bandmaschinen, selbst gebaute Geräte (Watson) | BELEGT | Wikipedia „Cabaret Voltaire (band)“ (SE); Gearnews |
| Kennzeichen: unerbittliche Drumcomputer-Grooves, **minimale Synth-Sequenzen**, Sample-Fetzen, fast geflüsterte Stimme | WAHRSCHEINLICH (Gear-Magazin, Stil-Text) | Gearnews „How To Sound Like Cabaret Voltaire“ |
| **EMS Synthi A** im Studio und live; Roland SH-09 | WAHRSCHEINLICH (Gearnews; Equipboard) | Gearnews; Equipboard |
| Farfisa-Drumbox und Ringmodulatoren in der Frühzeit | WAHRSCHEINLICH (Suchauszug, unklar welche Quelle) | Wikipedia/Gearnews (SE) |
| Geräte von „Nag Nag Nag“ | UNBELEGT | – |

**Abgrenzung:** Die Rausch-/Funk-Atmo dieser Szene gibt es schon (DK-13 „Kurzwellen-Atmo“, `vorbild-dark.md`). Hier deshalb nur Sequenz und Kit.

#### CV2 „Draht-Sequenz“ – Rolle Sequenz · VA (neu)

- **Vorbild (ⓘ):** minimale Synth-Sequenz, dünn und drahtig (WAHRSCHEINLICH).
- **Rezept:** `o1w 1, o1pw .2, o2w 0, o2fine 7, o2lvl .4, ftype 2, cutoff 1200, res .5, drive .4, kt .5, fenv .3, fA .001, fD .12, fS .2, fR .08, aA .001, aD .18, aS .35, aR .06, ampVel .4, mode 1, poly 1, l1shape 4, l1sync .5, analog .3, spread 0` · Route `M('lfo1','cutoff', .04)` · fx `{drive .2, dly .3, rev .15}` · bus `{echo:{mode:'mono', divL:'1/8', fb .3, wow .3}}`
- **Warum so:** **Bandpass** (BP24) statt Tiefpass = kein Bass, kein Glanz, nur „Draht“. Zufalls-LFO (S&H, synchron 1/8) verschiebt das Band leicht je Schritt. Unterschied zu „Nass & Quietsch“ (Resonanz an der Selbstschwingung, fester Cutoff).
- **Lage / Rolle:** Probe F♯2–F♯3 (42–54). Grundton-Bereich F♯2–C3, **hoch C4**. **Akkord-Reaktion:** nächstliegend.
- **Hörprobe** (120 BPM, h-Moll, i–i–VI–V; Lücken-Rhythmus, Takt 4 Dur-Dominante mit A♯):
```
Tempo 120 BPM · 4 Takte · Akkorde: Bm | Bm | G | F#
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: B2(47) 0/1/108 · B2(47) 2/1/90 · D3(50) 3/1/78 · B2(47) 5/1/78 · F#3(54) 6/1/90 · B2(47) 8/1/104 · A2(45) 10/1/90 · B2(47) 11/1/78 · D3(50) 13/1/78 · B2(47) 15/1/78
T2: B2(47) 16/1/108 · B2(47) 18/1/90 · D3(50) 19/1/78 · B2(47) 21/1/78 · F#3(54) 22/1/90 · B2(47) 24/1/104 · E3(52) 25/1/78 · D3(50) 27/1/78 · B2(47) 29/1/78 · A2(45) 30/1/90
T3: G2(43) 32/1/108 · G2(43) 34/1/90 · B2(47) 35/1/78 · G2(43) 37/1/78 · D3(50) 38/1/90 · G2(43) 40/1/104 · F#2(42) 42/1/90 · G2(43) 43/1/78 · B2(47) 45/1/78 · G2(43) 47/1/78
T4: F#2(42) 48/1/114 · F#2(42) 50/1/96 · Bb2(46) 51/1/84 · F#2(42) 53/1/84 · C#3(49) 54/1/96 · F#2(42) 56/1/110 · C#3(49) 57/1/84 · E3(52) 58/1/96 · F#3(54) 60/1/114 · Bb2(46) 62/1/96
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s · Lage der Probe F#2–F#3 (42–54)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.25,47,0.85],[0.5,0.25,47,0.71],[0.75,0.25,50,0.61],[1.25,0.25,47,0.61],[1.5,0.25,54,0.71],[2,0.25,47,0.82],[2.5,0.25,45,0.71],[2.75,0.25,47,0.61],[3.25,0.25,50,0.61],[3.75,0.25,47,0.61],[4,0.25,47,0.85],[4.5,0.25,47,0.71],[4.75,0.25,50,0.61],[5.25,0.25,47,0.61],[5.5,0.25,54,0.71],[6,0.25,47,0.82],[6.25,0.25,52,0.61],[6.75,0.25,50,0.61],[7.25,0.25,47,0.61],[7.5,0.25,45,0.71],[8,0.25,43,0.85],[8.5,0.25,43,0.71],[8.75,0.25,47,0.61],[9.25,0.25,43,0.61],[9.5,0.25,50,0.71],[10,0.25,43,0.82],[10.5,0.25,42,0.71],[10.75,0.25,43,0.61],[11.25,0.25,47,0.61],[11.75,0.25,43,0.61],[12,0.25,42,0.9],[12.5,0.25,42,0.76],[12.75,0.25,46,0.66],[13.25,0.25,42,0.66],[13.5,0.25,49,0.76],[14,0.25,42,0.87],[14.25,0.25,49,0.66],[14.5,0.25,52,0.76],[15,0.25,54,0.9],[15.5,0.25,46,0.76]]`
- **Karte:** „Dünne, drahtige Sequenz mit Lücken und Band-Echo – erinnert an Sheffielder Industrial-Funk um 1980 (Stil Cabaret Voltaire).“

#### CV3 „Werkhallen-Kit“ – Rolle Drums · Drum-Synth (neu)

- **Vorbild (ⓘ):** unerbittlicher Drumcomputer-Groove (WAHRSCHEINLICH). Klänge UNBELEGT.
- **Kit-Rezept:**
  - KICK `{frq 50, pAmt 16, pDec .02, tDec .3, drv .3}`.
  - SNARE `{frq 180, tDec .05, nTyp BP, nFrq 1500, nDec .18, nBur 2, nGap .008}` – halb Clap.
  - HH ZU `{mDec .018}`.
  - PERC `{mTun 1.41, mDec .2}` (Blech) + Echo-Send.
  - Kit-Bus ROOM 0,1, **kein Gate** (Unterschied zu DK-14 „Maschinenhalle-Kit“ mit Gate-Raum und Kuhglocke).
- **Hörprobe** (120 BPM; Takt 4 Kick-Doppel und Achtel-Hats):
```
Tempo 120 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK  | x...x...x...x... | x...x...x...x... | x...x...x...x... | x...x...x...x.xx
SNARE | ....x.......x... | ....x.......x..x | ....x.......x... | ....x...x...x...
HH ZU | xxxxxxxxxxxxxxxx | x.xxx.xxx.xxx.xx | xxxxxxxxxxxxxxxx | x.x.x.x.x.x.x.x.
PERC  | ..x.......x..... | ......x.......x. | ..x.......x...x. | ..x..x..x..x....
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s
- **Karte:** „Trockener, unerbittlicher Maschinen-Groove mit Blech – erinnert an frühen Industrial-Funk aus Sheffield (Stil Cabaret Voltaire).“

---

### 3.13 The Normal / Daniel Miller (`vorbild: the-normal`, neu, „w Gerät“)

| Fakt | Status | Quelle |
|---|---|---|
| „T.V.O.D.“ / „Warm Leatherette“ (1978): zu Hause aufgenommen mit **Korg 700S** (miniKORG) und **TEAC-Vierspur** | WAHRSCHEINLICH (Wikipedia mit „citation needed“; Electronic Sound sagt dasselbe) | Wikipedia „The Normal“ (SE); 429harrowroad.com (Electronic Sound 42) |
| Erste Veröffentlichung von **Mute Records** (Nov. 1978); beide Titel minimalistisch, nach dem Roman „Crash“ | BELEGT | Wikipedia; burningtheground.net |
| Miller brachte Depeche Mode später den ARP-Sequenzer (für „Speak & Spell“) | BELEGT (in `vorbild-pop.md` §3.1) | SOS (dort) |
| Tempo, Tonart, Patch | UNBELEGT | – |

#### NO1 „Kunstleder-Riff“ – Rolle Bass/Riff · VA (neu)

- **Vorbild (ⓘ):** ein kleiner Synth, ein schnarrendes Zwei-Ton-Riff, sonst fast nichts (WAHRSCHEINLICH).
- **Rezept:** `o1w 0, o2lvl 0, noise .05, ftype 0, cutoff 700, res .4, drive .6, bass .3, kt .5, fenv .35, fA .001, fD .18, fS .25, fR .06, aA .001, aD .2, aS .6, aR .05, ampVel .3, mode 1, poly 1, reset 1, analog .3, spread 0` · fx `{drive .3, rev .1}`
- **Warum so:** **ein** Oszillator (Säge) + Hauch Rauschen, Resonanz 40 %, viel Drive = billig, schnarrend, kalt. Staccato (Notenlänge 1/16). Unterschied zu allen Werks-Bässen (die haben 2–3 Oszillatoren).
- **Lage / Rolle:** Probe F1–B♭2 (29–46). Grundton-Bereich **hoch B♭1**, Oktave bis B♭2. **Akkord-Reaktion:** nächstliegend, Gleichstand abwärts.
- **Hörprobe** (120 BPM, b-Moll, i–i–VI–V; Takt 4 mit Leitton A1):
```
Tempo 120 BPM · 4 Takte · Akkorde: Bbm | Bbm | Gb | F
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: Bb1(34) 0/1/100 · Bb1(34) 2/1/84 · Bb2(46) 4/1/100 · Bb1(34) 6/1/84 · C#2(37) 8/1/100 · Bb1(34) 10/1/84 · Bb2(46) 12/1/100 · Ab1(32) 14/1/84
T2: Bb1(34) 16/1/100 · Bb1(34) 18/1/84 · Bb2(46) 20/1/100 · Bb1(34) 22/1/84 · F2(41) 24/1/100 · Eb2(39) 26/1/84 · C#2(37) 28/1/100 · C2(36) 30/1/84
T3: F#1(30) 32/1/100 · F#1(30) 34/1/84 · F#2(42) 36/1/100 · F#1(30) 38/1/84 · Bb1(34) 40/1/100 · F#1(30) 42/1/84 · F#2(42) 44/1/100 · F1(29) 46/1/84
T4: F1(29) 48/1/108 · F1(29) 50/1/92 · F2(41) 52/1/108 · F1(29) 54/1/92 · C2(36) 56/1/108 · Eb2(39) 58/1/92 · C2(36) 60/1/108 · A1(33) 62/1/92
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s · Lage der Probe F1–Bb2 (29–46)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.25,34,0.79],[0.5,0.25,34,0.66],[1,0.25,46,0.79],[1.5,0.25,34,0.66],[2,0.25,37,0.79],[2.5,0.25,34,0.66],[3,0.25,46,0.79],[3.5,0.25,32,0.66],[4,0.25,34,0.79],[4.5,0.25,34,0.66],[5,0.25,46,0.79],[5.5,0.25,34,0.66],[6,0.25,41,0.79],[6.5,0.25,39,0.66],[7,0.25,37,0.79],[7.5,0.25,36,0.66],[8,0.25,30,0.79],[8.5,0.25,30,0.66],[9,0.25,42,0.79],[9.5,0.25,30,0.66],[10,0.25,34,0.79],[10.5,0.25,30,0.66],[11,0.25,42,0.79],[11.5,0.25,29,0.66],[12,0.25,29,0.85],[12.5,0.25,29,0.72],[13,0.25,41,0.85],[13.5,0.25,29,0.72],[14,0.25,36,0.85],[14.5,0.25,39,0.72],[15,0.25,36,0.85],[15.5,0.25,33,0.72]]`
- **Karte:** „Ein einziger schnarrender Oszillator, Staccato, sonst nichts – erinnert an den Heimstudio-Minimalismus von 1978 (Stil The Normal).“

#### NO2 „Aufprall-Kit“ – Rolle Drums · Drum-Synth (neu)

- **Vorbild (ⓘ):** synthetische Schläge aus demselben kleinen Synth (UNBELEGT; Annahme aus der Ein-Gerät-Arbeitsweise).
- **Kit-Rezept:**
  - KICK `{frq 60, pAmt 6, pDec .03, tDec .2}`.
  - SNARE `{tLvl .3, frq 150, tDec .05, nTyp BP, nFrq 1200, nQ 1.5, nDec .35}` – langer Rausch-„Aufprall“.
  - PERC `{mTun .8, mDec .4}` – Blechkrach.
  - Kit-Bus ROOM 0,2. Keine Hi-Hats.
- **Hörprobe** (120 BPM; Takt 4 Blech-Folge):
```
Tempo 120 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK  | x.......x....... | x.......x....... | x.......x....... | x.......x...x...
SNARE | ....x.......x... | ....x.......x... | ....x.......x.x. | ....x.......x...
PERC  | ................ | ..............x. | ................ | ..........x.x.xx
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s
- **Karte:** „Rausch-Schläge und Blechkrach statt Schlagzeug – erinnert an Heimstudio-Elektronik von 1978 (Stil The Normal).“

---

### 3.14 Fad Gadget (`vorbild: fad-gadget`, neu, „w Geräte“)

| Fakt | Status | Quelle |
|---|---|---|
| Frank Tovey, erster Künstler bei Mute; Debüt „Back to Nature“ (1979) | BELEGT | Wikipedia „Fad Gadget“ (SE) |
| „Back to Nature“: Toveys **Korg Minipops** und Crumar-E-Piano durch Verzerrer; Daniel Miller brachte den **ARP 2600** | WAHRSCHEINLICH (Fan-Magazin) | electricityclub.co.uk „The Best of Fad Gadget“ |
| „Ricky’s Hand“ (1980): **Black-&-Decker-Bohrmaschine** als Perkussion, Sequenzer-Arbeit von Miller, früher **ARP-2600-Kick** | WAHRSCHEINLICH (Rezension) | electricityclub.co.uk |
| Miller hatte auch einen Roland SH-2 | BELEGT (Interview 1984) | muzines.co.uk „Fad Gadget“ |

#### FG1 „Werkstatt-Kit“ – Rolle Drums · Drum-Synth (neu)

- **Vorbild (ⓘ):** synthetische Kick vom Modular-Synth und eine Bohrmaschine als Schlaginstrument (WAHRSCHEINLICH). **Keine Samples** (§2): Der Bohrer wird synthetisch angenähert.
- **Kit-Rezept:**
  - KICK „Modular-Kick“ `{wav Sinus, frq 48, pAmt 24, pDec .04, tDec .35, cLvl 0}` – tiefer Sinus mit langem Pitch-Fall, ohne Klick.
  - SNARE `{frq 190, tDec .07, nTyp BP, nFrq 2000, nDec .15}`.
  - HH ZU `{mDec .02}`.
  - PERC „Bohrer“: RAUSCHEN `{nTyp BP, nFrq 2400, nQ 6, nEnv +1.5, nEnvDec .3, nDec .3}` + METALL `{mTun 1.6, mDec .25, mLvl .4}`, Spur-Drive 0,5. Der **steigende** Motor-Ton käme besser aus der TON-Schicht, aber `pAmt` geht nur 0–48 HT **abwärts** (Spec v2 Anhang A.3). Der Rausch-Sweep `nEnv` ist ±2 Oktaven; ob „+“ steigt, im Code prüfen (UNBELEGT). → Baustein-Lücke §5.
- **Hörprobe** (126 BPM; Takt 4 Bohrer-Kette als Wendung):
```
Tempo 126 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK  | x.....x...x..... | x.....x...x..... | x.....x...x...x. | x.....x.x.x.....
SNARE | ....x.......x... | ....x.......x... | ....x.......x... | ....x.......x.x.
HH ZU | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.....
PERC  | .......x........ | ..............xx | .......x........ | ...........xxxxx
```
Dauer: alle 4 Takte 7,6 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,6 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,6 s
- **Karte:** „Modular-Kick und ein kreischender Bohrer-Schlag – erinnert an den Werkstatt-Synthpop um 1980 (Stil Fad Gadget).“

#### FG2 „Kipp-Sequenz“ – Rolle Sequenz · VA (neu)

- **Vorbild (ⓘ):** Sequenzer-Linie vom halbmodularen Synth (WAHRSCHEINLICH). Patch UNBELEGT.
- **Rezept:** `o1w 0, o2w 0, o2oct -1, o2fine 3, o2lvl .5, ftype 0, cutoff 600, res .55, drive .3, kt .5, fenv .3, fA .001, fD .15, fS .15, fR .08, aA .001, aD .2, aS .5, aR .06, ampVel .4, mode 1, poly 1, l1shape 1, l1sync 8, analog .25, spread 0` · Route `M('lfo1','cutoff', .12)` · fx `{dly .25, rev .2}` · bus `{echo:{mode:'pp', divL:'1/8', fb .25}}`
- **Warum so:** Resonanz 55 % + Dreieck-LFO über **2 Takte** (synchron 8 Schläge, Menge .12; das Werk „Berlin-Schule“ nutzt .13 über 8 Takte) kippt die Farbe langsam von dumpf nach quäkig; die Noten bleiben gleich, der Klang erzählt. Unterschied zum Werk „Berlin-Schule“ (LFO über 8 Takte, Puls-Mischung, viel Echo-Feedback).
- **Lage / Rolle:** Probe G2–D4 (43–62). Grundton-Bereich G2–D3, **hoch D4**. **Akkord-Reaktion:** nächstliegend.
- **Hörprobe** (126 BPM, d-Moll, i–i–iv–V; Takt 2 und 4 in 16teln mit Lücken):
```
Tempo 126 BPM · 4 Takte · Akkorde: Dm | Dm | Gm | A
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D3(50) 0/2/100 · F3(53) 2/2/84 · A3(57) 4/2/100 · D3(50) 6/2/84 · C4(60) 8/2/100 · A3(57) 10/2/84 · F3(53) 12/2/100 · E3(52) 14/2/84
T2: D3(50) 16/1/108 · D3(50) 18/1/90 · F3(53) 19/1/78 · A3(57) 21/1/78 · D4(62) 23/1/78 · C4(60) 24/1/104 · A3(57) 26/1/90 · F3(53) 28/1/108 · G3(55) 29/1/78 · A3(57) 30/1/90
T3: G2(43) 32/2/100 · Bb2(46) 34/2/84 · D3(50) 36/2/100 · G3(55) 38/2/84 · F3(53) 40/2/100 · D3(50) 42/2/84 · Bb2(46) 44/2/100 · A2(45) 46/2/84
T4: A2(45) 48/1/114 · C#3(49) 50/1/96 · E3(52) 51/1/84 · A3(57) 53/1/84 · G3(55) 55/1/84 · E3(52) 57/1/84 · C#3(49) 59/1/84 · D3(50) 60/1/114 · E3(52) 61/1/84 · F3(53) 62/1/96 · E3(52) 63/1/84
```
Dauer: alle 4 Takte 7,6 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,6 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,6 s · Lage der Probe G2–D4 (43–62)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.5,50,0.79],[0.5,0.5,53,0.66],[1,0.5,57,0.79],[1.5,0.5,50,0.66],[2,0.5,60,0.79],[2.5,0.5,57,0.66],[3,0.5,53,0.79],[3.5,0.5,52,0.66],[4,0.25,50,0.85],[4.5,0.25,50,0.71],[4.75,0.25,53,0.61],[5.25,0.25,57,0.61],[5.75,0.25,62,0.61],[6,0.25,60,0.82],[6.5,0.25,57,0.71],[7,0.25,53,0.85],[7.25,0.25,55,0.61],[7.5,0.25,57,0.71],[8,0.5,43,0.79],[8.5,0.5,46,0.66],[9,0.5,50,0.79],[9.5,0.5,55,0.66],[10,0.5,53,0.79],[10.5,0.5,50,0.66],[11,0.5,46,0.79],[11.5,0.5,45,0.66],[12,0.25,45,0.9],[12.5,0.25,49,0.76],[12.75,0.25,52,0.66],[13.25,0.25,57,0.66],[13.75,0.25,55,0.66],[14.25,0.25,52,0.66],[14.75,0.25,49,0.66],[15,0.25,50,0.9],[15.25,0.25,52,0.66],[15.5,0.25,53,0.76],[15.75,0.25,52,0.66]]`
- **Karte:** „Quäkende Modular-Sequenz, die langsam die Farbe wechselt – erinnert an den frühen Mute-Synthpop um 1980 (Stil Fad Gadget).“

---

### 3.15 Kraftwerk – Lücke 1981 (`vorbild: kraftwerk`, Ergänzung zu `vorbild-helden.md` §3)

| Fakt | Status | Quelle |
|---|---|---|
| „Taschenrechner“/„Pocket Calculator“ (1981): Florian Schneider spielt einen **Taschenrechner**, dessen Tastentöne über die Anlage gehen; Modell Casio fx-501P nur von einer Fan-Quelle | Einsatz BELEGT, Modell WAHRSCHEINLICH | Wikipedia „Computer World“ (SE) |
| Ein **Stylophone** (Dubreq, Griffel auf Metallkontakten) und eine Mattel-Spielzeug-Rhythmusmaschine („Bee Gees Rhythm Machine“) | WAHRSCHEINLICH (MusicRadar-Frage-Artikel, Sekundärquellen) | musicradar.com „Did Kraftwerk really use a toy Bee Gees drum machine“ |
| Casio baute später den „VL-80“-Rechner mit Tönen in Kraftwerk-Ausführung | WAHRSCHEINLICH | flashbak.com |
| TI Language Translator für die Stimmen auf „Numbers“ und „Pocket Calculator“ | WAHRSCHEINLICH (wie helden §3.1) | Wikipedia „Computer World“ (SE) |

#### KW5 „Rechner-Piep“ – Rolle Sequenz/Akzent · VA (neu)

- **Vorbild (ⓘ):** Taschenrechner- und Griffel-Spielzeugtöne als Melodie (Einsatz BELEGT, Klang UNBELEGT).
- **Rezept:** `o1w 1, o1pw .12, o2lvl 0, ftype 1, cutoff 3800, res .08, drive .1, kt .5, fenv 0, aA .001, aD .09, aS .55, aR .03, ampVel .2, mode 1, poly 1, glide 0, reset 1, analog .05, spread 0` · fx `{dly .1, rev .12}`
- **Warum so:** sehr schmaler Puls (12 %) = dünnes, summendes Piepen wie aus einem kleinen Lautsprecher; keine Filter-Bewegung, Reset an = jeder Piep gleich. Neu in der Bibliothek (sonst nichts so „klein“).
- **Lage / Rolle:** Probe F5–F6 (77–89), am besten C5–C7. **Grenze tief C5.** **Akkord-Reaktion:** nächstliegend (Sequenz).
- **Hörprobe** (120 BPM, B♭-Dur, I–vi–IV–V, staccato, Takt 3 in 16teln, Takt 4 Aufstieg bis F6):
```
Tempo 120 BPM · 4 Takte · Akkorde: Bb | Gm | Eb | F
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D6(86) 0/1/100 · F5(77) 4/1/100 · Bb5(82) 6/1/84 · D6(86) 10/1/84 · C6(84) 12/1/100
T2: Bb5(82) 16/1/100 · G5(79) 20/1/100 · D6(86) 22/1/84 · Bb5(82) 26/1/84 · A5(81) 28/1/100 · G5(79) 30/1/84
T3: Eb6(87) 32/1/100 · G5(79) 34/1/84 · Bb5(82) 36/1/100 · Eb6(87) 38/1/84 · D6(86) 39/1/84 · C6(84) 42/1/84 · Bb5(82) 44/1/100 · G5(79) 46/1/84
T4: F5(77) 48/1/88 · A5(81) 50/1/91 · C6(84) 52/1/94 · F6(89) 54/1/97 · Eb6(87) 58/1/103 · C6(84) 62/1/109
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s · Lage der Probe F5–F6 (77–89)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.25,86,0.79],[1,0.25,77,0.79],[1.5,0.25,82,0.66],[2.5,0.25,86,0.66],[3,0.25,84,0.79],[4,0.25,82,0.79],[5,0.25,79,0.79],[5.5,0.25,86,0.66],[6.5,0.25,82,0.66],[7,0.25,81,0.79],[7.5,0.25,79,0.66],[8,0.25,87,0.79],[8.5,0.25,79,0.66],[9,0.25,82,0.79],[9.5,0.25,87,0.66],[9.75,0.25,86,0.66],[10.5,0.25,84,0.66],[11,0.25,82,0.79],[11.5,0.25,79,0.66],[12,0.25,77,0.69],[12.5,0.25,81,0.72],[13,0.25,84,0.74],[13.5,0.25,89,0.76],[14.5,0.25,87,0.81],[15.5,0.25,84,0.86]]`
- **Karte:** „Winzige Piep-Melodie wie aus einem Taschenrechner – erinnert an die Rechner-Lieder von 1981 (Stil Kraftwerk).“

### 3.16 Jean-Michel Jarre – geprüft, nichts Neues

`vorbild-helden.md` §5 deckt die belegten Kennklänge ab (Eminent durch Phaser, RMI-Lead mit Flanger, Mini-Pops-Rhythmus), dazu die Werks-Sounds „Pfeif-Sequenz“ und „Tropfen“. Offen bleibt nur der **Phaser/Flanger-Baustein** (helden §9.5). Ein weiterer Jarre-Sound ohne diesen Baustein würde J1/J2 nur wiederholen.

---

## 4. Übersicht: Rolle, Lage, Akkord-Reaktion, Abgrenzung

| ID | Name | Act | Rolle | Engine | Probe (MIDI) | Lage-Voreinstellung (`sound.lage`) | Akkord-Reaktion | Abgrenzung (Doppelungs-Check) |
|---|---|---|---|---|---|---|---|---|
| MO1 | Werk Moroder-Puls | Moroder | Sequenz/Bass | VA | 35–52 | hoch D3 | nächstliegend, abwärts | vorhanden |
| MO2 | Fluchtweg-Lead | Moroder | Lead | VA | 73–85 | tief C5 | Oktave der Taste | ≠ Mini-Lead (Filter-Hk, Drive) |
| MO3 | Disko-Kit 77 | Moroder | Drums | Drum | – | – | – | Rausch-HH, ≠ Neon-Kit/909 |
| YM1 | Kleinschritt-Sequenz | YMO | Sequenz | VA | 48–74 | hoch D5 | nächstliegend | ≠ K2 (Puls 30 %, Res 55 %) |
| YM2 | Laternen-Lead | YMO | Lead | VA | 76–88 | tief C5 | Oktave der Taste | ≠ Puls-Lead (mono, Glide) |
| YM3 | Galopp-Kit 79 | YMO | Drums | Drum | – | – | – | Syndrum-Tom neu |
| NU1 | Kaltfront-Riff | Numan | Riff | VA | 44–58 | G2–C3 | nächstliegend, abwärts | ≠ K1, Moog-Bass (Lage, Legato) |
| NU2 | Menschenstimme-Fläche | Numan | Fläche | VA | 53–70 | Klammer C3–C5 | Stimmführung | ≠ Ensemble-/Juno-Streicher |
| UV1 | Funkenbogen-Sync | Ultravox | Lead | VA | 74–89 | tief C5 | Oktave der Taste | ≠ Sync-Lead (Hk-Fegen) |
| UV2 | Bossa-Kiste 77 | Ultravox | Drums | Drum | – | – | – | ≠ J3 (Beguine, Shaker) |
| VI1 | Grauschleier-Bass | Visage | Bass | VA | 29–50 | hoch D2 (Oktave bis D3) | nächstliegend, abwärts | ≠ K1, Synthpop-Bass |
| VI2 | R6 N09 Rhythmus-Box 78 | Visage | Drums | Drum | – | – | – | vorhanden |
| BG1 | Werk Ensemble-Streicher | Buggles | Fläche | VA | 55–71 | Klammer C3–C5 | Stimmführung | vorhanden |
| BG2 | Handspiel-Kette | Buggles | Sequenz | VA | 55–74 | hoch D5 | nächstliegend | ohne Reset, Anschlag |
| JP1 | Geisterton | Japan | Atmo | VA | 52–66 | Klammer C3–C5 | Block | neu (Tritonus-Osz.) |
| JP2 | Holzklang-Marimba | Japan | Pluck | FM6 | 67–83 | tief C4 | nächstliegend | ≠ Glocken (kein Ausklang) |
| JP3 | Bundlos-Bass | Japan | Bass | VA | 29–48 | hoch A2 (Oktave bis C3) | nächstliegend, abwärts | ≠ Gummi-Bass |
| SP1 | Himmelsleiter-Sequenz | Sparks | Sequenz | VA | 38–64 | hoch E4 | `dirAt {F#: ↓}` | Orgelpunkt-Figur |
| SP2 | Lichtsäulen-Fläche | Sparks | Fläche | VA | 45–69 | Klammer A2–C5 | Stimmführung | ≠ Supersaw (3 statt 7) |
| VG1 | Sternfall-Brass | Vangelis | Lead | VA | 57–74 | tief G3 | Oktave der Taste | ≠ Weite 82 (Fläche) |
| TX1 | Zuckerguss-Lead | Telex | Lead | VA | 72–86 | tief C5 | Oktave der Taste | ≠ MO2, YM2 |
| TX2 | Tanzschritt-Bass | Telex | Bass | VA | 29–51 | F1–E♭2 (Oktave mit) | nächstliegend, abwärts | ohne Echo |
| SU1 | Kellerorgel-Drone | Suicide | Riff/Drone | VA | 38–55 | G2–C3 | nächstliegend | neu (Orgel) |
| SU2 | Billig-Rhythmus | Suicide | Drums | Drum | – | – | – | Latin-Box |
| CV2 | Draht-Sequenz | Cabaret Voltaire | Sequenz | VA | 42–54 | hoch C4 | nächstliegend | ≠ Nass & Quietsch |
| CV3 | Werkhallen-Kit | Cabaret Voltaire | Drums | Drum | – | – | – | ≠ DK-14 (ohne Gate) |
| NO1 | Kunstleder-Riff | The Normal | Bass/Riff | VA | 29–46 | hoch B♭1 (Oktave bis B♭2) | nächstliegend, abwärts | 1 Oszillator |
| NO2 | Aufprall-Kit | The Normal | Drums | Drum | – | – | – | Rausch-Aufprall |
| FG1 | Werkstatt-Kit | Fad Gadget | Drums | Drum | – | – | – | Bohrer-Perk |
| FG2 | Kipp-Sequenz | Fad Gadget | Sequenz | VA | 43–62 | hoch D4 | nächstliegend | ≠ Berlin-Schule |
| KW5 | Rechner-Piep | Kraftwerk | Sequenz/Akzent | VA | 77–89 | tief C5 | nächstliegend | neu („klein“) |

Zählung (aus dieser Tabelle): 28 neue Sounds (VA 20, FM6 1, Drum 7) und 3 Hörproben für vorhandene Sounds (MO1, VI2, BG1) = 31 Hörproben.

## 5. Baustein-Lücken (was SYNQUENZER für diese Acts noch nicht kann)

| Baustein | Für | Annäherung heute | Vorschlag |
|---|---|---|---|
| **Phaser** | Numan (NU1), Jarre (J1) | Chorus BREIT + LFO am Filter | FX-Block Phaser (4/6 Allpass), schon in helden §9.5 |
| **Ringmodulator** | Cabaret Voltaire, früher Industrial | – (kein Rezept) | im geplanten VK-Baukasten (`SYNQUENZER-vision.md` Tabelle „Ringmodulator … S“) |
| **Steigender Ton im Drum-Synth** | Fad Gadget „Bohrer“, Motor-/Laser-Effekte | Rausch-Sweep `nEnv` (Richtung prüfen) | `pAmt` auf −24…+48 HT erweitern (eigene Idee, UNBELEGT ob nötig) |
| **Aftertouch / Ribbon** | Vangelis (VG1) | Mod-Rad → Filter, Legato-Glide | MIDI-Aftertouch auf Quelle `mw` bzw. eigene Quelle legen (Vision [K6]) |
| **Vocoder / Sprachchip** | Kraftwerk, Telex, YMO (VC-10) | – | erst mit Mikrofon (P3), wie helden §10 |
| **Arpeggiator / echter Sequenzer-Zufall** | YMO, Sparks (Schichten) | feste Notenlisten | Arp-Modus ZUFALL (helden §9.5) |

## 6. Einbau-Hinweise (für Spec und Builder)

1. **VORBILD-Tabelle** (R6 §11) ergänzen: `ymo` (b Geräte, u Part), `gary-numan` (b), `ultravox` (b Gerät), `visage` (b Drums, w Bass), `buggles` (b Geräte), `japan` (b), `sparks` (b Arbeitsweise), `telex` (w), `suicide` (b), `cabaret-voltaire` (w), `the-normal` (w), `fad-gadget` (w). **Anheben:** `moroder` und `vangelis` von „e“ auf „b Gerät/Spielweise, e/w Patch“ (§3.1, §3.9). Werks-Tags ergänzen: Werk „Moroder-Puls“ + `moroder` (b), Werk „Ensemble-Streicher“ + `buggles`, R6 N09 + `visage`.
2. **Genre-Tags:** Pioniere bekommen `synthpop-frueh` (neu) bzw. vorhandene Tags; Suicide/Cabaret Voltaire/The Normal zusätzlich `industrial` bzw. `minimal-elektronik` (neu, Vorschlag). Abgleich mit `vorbild-dark.md` KD-5.
3. **Namen nach E9** (eigene Durchsicht): Fluchtweg-Lead, Disko-Kit 77, Kleinschritt-Sequenz, Laternen-Lead, Galopp-Kit 79, Kaltfront-Riff, Menschenstimme-Fläche, Funkenbogen-Sync, Bossa-Kiste 77, Grauschleier-Bass, Handspiel-Kette, Geisterton, Holzklang-Marimba, Bundlos-Bass, Himmelsleiter-Sequenz, Lichtsäulen-Fläche, Sternfall-Brass, Zuckerguss-Lead, Tanzschritt-Bass, Kellerorgel-Drone, Billig-Rhythmus, Draht-Sequenz, Werkhallen-Kit, Kunstleder-Riff, Aufprall-Kit, Werkstatt-Kit, Kipp-Sequenz, Rechner-Piep. Kein Künstler-, Titel- oder Gerätename. **Zwei Grenzfälle** vor dem Einbau mit der Prüfliste A.4/A.13 (`r6/n6/doppel-check.mjs`) prüfen:
   - „Menschenstimme-Fläche“ ist die deutsche Übersetzung des Preset-Namens „Vox Humana“ (ein Orgel-Registername, kein Markenname; trotzdem prüfen).
   - „Kunstleder-Riff“ spielt auf den Titel „Warm Leatherette“ an. Wenn die Prüfliste Titel-Anspielungen verbietet: **„Schnarr-Riff“**.
4. **Dauer:** Alle Proben haben `aud-Daten kurz` ≤ 8 s (Spec heute). Wo länger: `aud-Daten ganz` ≤ 16 s (Vorschlag wie helden §9.4).
5. **Messungen vor Freigabe:** Pegel −18 LUFS für alle 28 neuen Sounds; Bass-Gate (≥ 55 % unter 250 Hz) für VI1, JP3, TX2, NO1; Lead-Tracking ±10 ct für MO2, YM2, UV1, TX1, VG1; FM-Gate für JP2 („Anschlag-Schwerpunkt ≥ 1,5 × Ausklang“).
6. **Hörproben-Quelle:** `r7/pioniere-work/aud.mjs` (Notenlisten, Prüfung, Platzhalter-Füllung), Bericht `aud-report.txt`, alle Blöcke als JSON in `aud-blocks.json`.

## 7. Offene Punkte (nicht blockierend)

- **Originale gegenhören:** Vor V10d jede Probe mit „eigene Melodie“-Vermerk gegen das Vorbild abhören (besonders MO1 gegen „I Feel Love“, SU1 gegen „Ghost Rider“, YM2 gegen „Rydeen“).
- **Tonarten der Originale** sind fast überall unsicher. Ein Lauf mit Netz und Notenausgaben (Musicnotes o. Ä.) sollte sie prüfen; falls eine Probe doch in der Original-Tonart liegt, transponieren.
- **Weitere Pioniere** außerhalb dieses Auftrags, aber zum Wunsch „alle Pioniere“ passend: OMD, The Human League, Depeche Mode (schon in `vorbild-pop.md`), DAF (`vorbild-dark.md`), Soft Cell, Thomas Dolby, Heaven 17, Tangerine Dream/Klaus Schulze (Werk „Berlin-Schule“), Isao Tomita (helden). Soft Cell und Thomas Dolby fehlen noch ganz.

## 8. Quellen (alle über Suchauszüge, nicht direkt abgerufen; 17.10.2026)

**Giorgio Moroder**
- https://www.musicradar.com/news/donna-summer-i-fee-love-best-synth-sound
- https://en.wikipedia.org/wiki/I_Feel_Love
- https://djmag.com/content/game-changers-giorgio-moroders-i-feel-love
- https://musictech.com/2016/08/the-7-deadly-synth-sounds/
- https://burningtheground.net/category/giorgio-moroder/
- https://raygum.com/releases/ybJOaL0h2aF0/chase
- https://www.tunefind.com/artist/giorgio-moroder
- Tempo/Tonart: https://www.cs.ubc.ca/~davet/music/track/POWERTRK_041/POWERTRK_041-14.html · https://www.mixgraph.io/tracks/donna-summer-i-feel-love · https://sfrbeats.com/tools/artist/donna-summer

**Yellow Magic Orchestra**
- https://daily.redbullmusicacademy.com/2014/11/yellow-magic-orchestra-gear
- https://reverb.com/news/the-gear-of-yellow-magic-orchestra
- https://en.wikipedia.org/wiki/Roland_MC-8_Microcomposer
- https://en.wikipedia.org/wiki/BGM_(album)
- https://www.soundhouse.co.jp/en/contents/column/index?post=4583
- https://ra.co/reviews/24259
- https://doppiozero.com/print/pdf/node/2478
- https://www.freemalaysiatoday.com/category/leisure/2023/01/15/yukihiro-takahashi-of-japanese-band-ymo-dies-at-70

**Gary Numan / Tubeway Army**
- https://reverb.com/news/video-the-synth-sounds-of-gary-numan
- https://musicradar.com/artists/gary-numan-cars-sound-of-repub
- https://www.musicradar.com/artists/i-had-a-no-1-single-with-a-song-about-a-robot-prostitute-and-no-one-knew-youll-never-listen-to-this-gary-numan-classic-in-the-same-way-again
- https://en.wikipedia.org/wiki/Are_%22Friends%22_Electric%3F
- https://everyuknumber1.com/?p=15071
- https://equipboard.com/gary-numan
- https://www.gear4music.com/blog/steal-the-sound-gary-numan/
- https://dohmannaudio.com/music-recommendations/gary-numan-the-pleasure-principle/
- https://musictech.com/news/gear/moog-ujam-plugin-gary-numan-vox-humana/
- Tempo/Tonart: https://www.cs.ubc.ca/~davet/music/track/POWERTRK_065/POWERTRK_065-09.html · https://acousticbrainz.org/2be928a8-8dcb-4b02-8aa5-7cdfd94c28cc

**Ultravox**
- https://en.wikipedia.org/wiki/Billy_Currie
- https://www.mojo4music.com/time-machine/1980s/mojo-time-machine-ultravox-release-vienna
- https://www.electricityclub.co.uk/?p=6737
- https://musiciwant.com/song/vienna-ultravox · https://www.guitartabsexplorer.com/ultravox-Tabs/vienna-crd.php (schwach)
- https://acousticbrainz.org/17245060-aa7d-46f9-85f7-5395173659b1

**Visage**
- https://en.wikipedia.org/wiki/Visage_(Visage_album)
- https://www.electricityclub.co.uk/a-beginners-guide-to-visage/
- https://articles.roland.com/?p=101432
- https://www.muzines.co.uk/articles/behind-visage/7949
- https://www.muzines.co.uk/articles/searching-for-the-perfect-beat/3385

**The Buggles**
- https://www.musicradar.com/news/the-true-story-behind-hans-zimmer-and-his-giant-moog-is-even-more-extraordinary-than-the-original-photo-of-them-together-and-it-turns-out-the-monster-modular-is-the-most-important-synth-ever-made
- https://en.wikipedia.org/wiki/Video_Killed_the_Radio_Star
- https://en.wikipedia.org/wiki/Geoff_Downes

**Japan**
- https://en.wikipedia.org/wiki/Ghosts_(Japan_song)
- https://en.wikipedia.org/wiki/Tin_Drum_(album)
- https://en.wikipedia.org/wiki/Japan_(band)
- https://www.soundonsound.com/node/4926603
- https://www.electricityclub.co.uk/richard-barbieri-interview/
- https://progarchives.com/album.asp?id=16600

**Sparks**
- https://en.wikipedia.org/wiki/No._1_in_Heaven
- https://thequietus.com/?p=26257
- https://www.classicpopmag.com/?p=17164
- https://vinylwriters.com/making-sparks-no-1-in-heaven/
- https://madelinex.com/2018/03/23/no1inheaven/

**Vangelis**
- https://reverbmachine.com/blog/vangelis-blade-runner-synth-sounds
- https://www.musicradar.com/news/blade-runner-best-synth-sound
- https://www.syntorial.com/preset-recipe/vangelis-blade-runner-brass/
- https://lookmumnocomputer.discourse.group/t/vangelis-brass-how-to/3365

**Telex**
- https://www.musicradar.com/news/telex-interview
- https://en.wikipedia.org/wiki/Dan_Lacksman
- https://www.electricityclub.co.uk/beginners-guide-to-dan-lacksman/
- https://www.qobuz.com/ca-en/interpreter/telex/38849

**Suicide**
- https://www.electronicsound.co.uk/?p=19523
- https://www.electronicsound.co.uk/features/long-reads/suicide-dream-baby-dream
- https://www.rollingstone.it/musica/interviste-musica/martin-rev-i-concerti-dei-suicide-erano-il-regno-della-devastazione/642391/
- https://en.wikipedia.org/wiki/Ghost_Rider_(Suicide_song)
- https://wikipedia.com/wiki/Rocket_USA (Album-Artikel „Suicide (1977 album)“)
- https://thevinylfactory.com/features/an-introduction-to-suicide-in-10-records/

**Cabaret Voltaire**
- https://en.wikipedia.org/wiki/Cabaret_Voltaire_(band)
- https://www.gearnews.com/?p=149890
- https://equipboard.com/band/cabaret-voltaire
- https://www.muzines.co.uk/articles/life-is-a-cabaret/8008

**The Normal / Daniel Miller**
- https://en.wikipedia.org/wiki/The_Normal
- https://en.wikipedia.org/wiki/Daniel_Miller_(music_producer)
- https://429harrowroad.com/2018/06/05/electronic-sound-issue-42-mute-cover-feature-the-normal-clear-vinyl-7/
- https://burningtheground.net/the-normal-t-v-o-d-warm-leatherette-us-12/

**Fad Gadget**
- https://en.wikipedia.org/wiki/Fad_Gadget
- https://www.electricityclub.co.uk/the-best-of-fad-gadget/
- https://www.muzines.co.uk/articles/fad-gadget/7832

**Kraftwerk 1981**
- https://en.wikipedia.org/wiki/Computer_World
- https://musicradar.com/news/did-kraftwerk-really-use-a-toy-bee-gees-drum-machine
- https://flashbak.com/?p=478323

**Recht:** siehe `vorbild-helden.md` §11 (Recht) und R6 §5.
