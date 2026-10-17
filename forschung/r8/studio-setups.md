# R8 – Studio-Setups der Vorbilder und welche Instrumente SYNQUENZER nachbauen soll

**Stand:** 17.10.2026 · Auftrag R8 „studio-setups“ · Grundlage: `fragen-xander-9.md` („Für jedes Vorbild auch das typische Studio-Setup recherchieren und die Synthesizer nachbauen, z. B. The Frozen Autumn: Kawai K1?, And One …“), `fragen-xander-8.md` (V), `fragen-xander-7.md` (L1–L3), Spec v3 (§1.1, §9–§12, §18), Nachtrag 1 (A.10 VK, A.11 V8a/V9b, A.12 V10d), Master-Briefing Teil 11 („Klassiker als Instrument-Vorlagen“), Vorarbeiten `r6/bibliothek-recherche.md`, `r7/vorbild-helden.md`, `r7/vorbild-coldwave2.md`.
**Nicht gelesen:** `r7/online.md` gibt es beim Schreiben nicht (geprüft am 17.10.). Für dieses Thema ist die Datei auch nicht nötig.

**Werkzeuge und Grenzen:** Webseiten ließen sich nicht direkt abrufen. WebFetch meldete einen DNS-Fehler, curl wurde vom Proxy mit 403 abgewiesen (geprüft für thefrozenautumn.com, en.wikipedia.org, lostechoes.com). Jeder Web-Fakt stammt deshalb aus **Suchauszügen (SE)**. Neu gesucht wurden in dieser Runde rund 45 Abfragen. Wo R6/R7 schon einen Beleg hatten, wird er übernommen und so markiert („aus R6“/„aus R7“).

**Kennzeichen**
- **BELEGT**: Eine namhafte Quelle sagt es ausdrücklich. Gemeint sind Interview, Fachpresse (SOS, MusicRadar, MusicTech, Keyboard/E&MM über muzines), Hersteller oder Wikipedia mit Beleg. Die Grundlage ist der Suchauszug.
- **WAHRSCHEINLICH**: Nur eine schwache Quelle: Equipboard (Nutzer-Datenbank, höchstens diese Stufe), Fan-Seite, Händlertext, Forum. Oder die Quellen widersprechen sich. Oder es folgt nur aus einer Genre-Quelle.
- **UNBELEGT**: Nichts gefunden, oder es ist eine eigene Einschätzung bzw. Deutung. Solche Angaben gehen nie als Fakt in einen ⓘ-Text.
- **intern**: Fakt aus den Projektdateien (Spec, Nachtrag, App-Code). Die Quelle ist der Dateipfad.

**Rechtliche Linie:** Wie in R6 §5 und R7 §1. Gerätenamen erscheinen nur im ⓘ-Feld „Vorbild“, nie im Namen einer Vorlage (E9). Vorlagen bekommen eigene Namen (§5).

---

## 0. Kurzfazit

1. **The Frozen Autumn und „Kawai K1“:**
   - Ein **Kawai K1 ist nirgends belegt.** R6 hat dafür 3 Abfragen gemacht, diese Runde 5 weitere: kein einziger Treffer.
   - Für Diego Merletto nennt nur Equipboard Geräte:
     - **Elka Synthex** (in einem Video zu „Venetian Blinds“)
     - **Korg DS-8** (Live-Video aus Lima)
     - **Roland JX-305** (Arianna, live in Madrid 2014)
     - **Kawai K4** (nur ein Nutzerfoto)
     - außerdem Korg Trinity, Roland SH-201 und ein Behringer-MIDI-Controller
   - Alle Angaben sind WAHRSCHEINLICH (schwach).
   - **Meine Deutung des Diktats** (UNBELEGT): „LK sind oder Kawai K1“ klingt gesprochen wie „**Elka Synth**(ex) oder Kawai K…“. Der Synthex ist zugleich das Gerät, das für Merlettos Nebenprojekt **Static Movement** genannt wird: Synthex + PPG Wave 2.2, laut einer Fan-Seite (WAHRSCHEINLICH).
   - **Empfehlung:** Der Kernklang für Cold Wave ist die Vorlage „NEBEL-8“ nach Synthex-Prinzip, nicht ein K1.
     - Die Synthex-Bauweise ist öffentlich und belegt: 2 DCOs je Stimme, Ringmod, 4-Pol-Multimode-Filter, Chorus I/II/III.
     - Mit den geplanten VK-Bausteinen lässt sie sich fast ganz bauen.
   - Den **K1** gibt es als Zusatz-Vorlage „VIERER-VEKTOR“: 4 Tabellen, Vektor-Joystick, kein Filter. Er passt genau auf das XY-Feld von V9a.
2. **Am meisten hängen die Vorbilder an Samplern:**
   - Emulator I/II, Fairlight, Synclavier, E-mu sind bei 6 Acts belegt, bei 2 weiteren wahrscheinlich.
   - Gleich danach kommt die **Moog-Familie** mit 6 belegten Acts.
   - Dann folgen Rhythmusmaschinen und Drum-Computer, Roland SH/System, Sequential Prophet und ARP.
   - **Sampling kann die App nicht** (Sample-Import steht in §18). Das ist die größte Lücke.
3. **Was überraschend wenig vorkommt** (in den Quellen zu den 20 Acts):
   - Access Virus, Nord Lead, Roland JD-800, Korg M1 und Waldorf Microwave: bei **keinem** der 20 Acts belegt.
   - Roland SH-101: nur eine Nutzerliste (Equipboard, OMD).
   - TR-808: nur WAHRSCHEINLICH, bei Alphaville (Equipboard) und als Genre-Merkmal.
   - Diese Geräte bekommen **keine eigene Vorlage in Stufe A–C**. Ihre Merkmale decken VK und vorhandene Presets (N55–N58) ab.
4. **Bau-Reihenfolge (Empfehlung, §6):**
   - **A** Vorlagen ohne neuen DSP (Moog, Prophet, Jupiter/SH, ARP, Juno, Synthex, Preset-Boxen), sobald VK steht.
   - **B** „VK+“: Phaser, Flanger, Arp ZUFALL, Juno-Hochpass, SID-Kombiwellen; optional ein Korg35-Filter.
   - **C** PPG „Stufen + 8 Bit“ (V8a), Kawai K1/K4 (V9a + SVF 12).
   - **D** KÖRNUNG und ANSCHLAG-Schicht (Sampler-Charakter, LinnDrum/Emulator-Annäherung), FM mit Filter (DS-8).
   - **E** Sample-Import (eigene Samples), Vocoder und Sprachchip, erst mit Mikrofon (VS).
5. **Was an Belegen schwach bleibt:** Für And One, De/Vision, Agonoize, Sixth June, S.P.O.C.K und Elegant Machinery gibt es **kein** öffentliches Gerät, das einem Album zugeordnet ist. Ihre Vorlagen bauen auf Genre-Belegen (Kennzeichen „Stil“).

---

## 1. Die 20 Vorbilder: Geräte auf den Kennplatten

Spalten: Gerät · wofür · Status · Quelle. „SE“ wird nicht wiederholt, es gilt für alles.

### 1.1 The Frozen Autumn (Turin, seit 1993; Diego Merletto, Froxeanne/Arianna)

| Gerät | Einsatz | Status | Quelle |
|---|---|---|---|
| Merletto ist Sänger, Keyboarder und **Synth-Programmierer**. Der erste Synth wurde 1987 gekauft, das Modell ist nicht genannt. | Bandrolle | BELEGT | https://en.wikipedia.org/wiki/The_Frozen_Autumn · https://lostechoes.com/2002/12/01/the-frozen-autumn-interview/ |
| **Elka Synthex** | in einem Video zu „Venetian Blinds“ | WAHRSCHEINLICH (Equipboard) | https://equipboard.com/pros/diego-merletto · https://equipboard.com/band/the-frozen-autumn |
| **Korg DS-8** (FM, 1986/87) | Live-Auftritt in Lima (Video) | WAHRSCHEINLICH (Equipboard) | https://equipboard.com/items/korg-ds8 · https://equipboard.com/band/the-frozen-autumn |
| **Roland JX-305** (ROMpler, Tastatur-Fassung der MC-505) | Arianna, live in Madrid 2014 | WAHRSCHEINLICH (Equipboard) | https://equipboard.com/items/roland-jx-305 |
| **Kawai K4** | Live, nur ein Nutzerfoto | WAHRSCHEINLICH (schwach) | https://equipboard.com/items/kawai-k4 |
| Korg Trinity (Nutzerfoto), Roland SH-201, Behringer UMX250 (live 2012) | live | WAHRSCHEINLICH (schwach) | https://equipboard.com/pros/diego-merletto |
| **Kawai K1** | – | **UNBELEGT** (8 Abfragen in R6 und R8 ohne Treffer) | – |
| Klang: „cold, moody darkwave … blanketed in waves of atmospheric synths“. Mehr Synth-Sequenzen als andere Darkwave-Bands ihrer Generation. | Stil | BELEGT (Rezensionen) | https://rocknerd.co.uk/2018/03/14/the-frozen-autumn-the-fellow-traveler-2017/ · https://www.idieyoudie.com/?p=6376 |

**Schluss:** Belegt ist nur die Rolle der Synths, kein Gerät auf einem Album. Der Synthex taucht bei beiden Merletto-Projekten auf und ist darum der beste Kandidat (WAHRSCHEINLICH). Der K4 ist schwächer, der K1 unbelegt.

### 1.2 Static Movement (Merletto + Arianna, „Visionary Landscapes“ 1999, Eibon)

| Gerät | Einsatz | Status | Quelle |
|---|---|---|---|
| Projekt von Merletto (1998) mit Arianna (Gesang, Keyboards, Samples, Programmierung) | Band | BELEGT | https://www.last.fm/pl/music/Static+Movement/+wiki |
| **Elka Synthex**, **PPG Wave 2.2** | Album „Visionary Landscapes“ | WAHRSCHEINLICH (nur eine Fan-Seite) | https://www.depechemodeitalia.com/ez/the%20frozen%20autumn.htm |
| „ein Gerät von Sequential“ | Album | WAHRSCHEINLICH (aus R6 [K10]; in R8 nicht wiedergefunden) | https://thefrozenautumn.com/biography |

### 1.3 Sixth June (Laslo Antal, Lidija Andonov; Belgrad/Berlin, seit 2007)

| Gerät | Einsatz | Status | Quelle |
|---|---|---|---|
| Antal: „voice, synths, drum machine, samplers, guitars“, **keine Modelle** | allgemein | BELEGT (Last.fm-Bio) | https://diesein.bandcamp.com/music · https://www.wikipedia.org/wiki/Sixth_June |
| Genre Coldwave/Minimal Wave: analoge Synths, „clinical drum machines“, TR-808, frühe Sequenzer | Stil | WAHRSCHEINLICH (Genre-Quelle, aus R7) | https://www.masterclass.com/articles/coldwave-music-guide · https://microgenremusic.com/articles/what-is-minimal-wave/ |

### 1.4 And One (Steve Naghavi, seit 1989)

| Gerät | Einsatz | Status | Quelle |
|---|---|---|---|
| Gestartet mit „two keyboards and a beatbox“, Vorbild Depeche Mode | Anfang | BELEGT (Wikipedia-Auszug) | https://en.wikipedia.org/wiki/And_One |
| TR-808, Korg Polysix, Yamaha DX7 als „Lieblingsgeräte“ | – | **UNBELEGT** (Ironcharts ohne Quellenangabe) | https://ironcharts.com/musician/steve-naghavi |
| Studio- oder Album-Geräte | – | UNBELEGT (4 Abfragen, auch auf Deutsch) | – |

### 1.5 De/Vision (Bensheim 1988; Steffen Keth, Thomas Adam)

| Gerät | Einsatz | Status | Quelle |
|---|---|---|---|
| Adam spielt Keyboards. Produzenten Arne Schumann und Joseph Bach | Rollen | BELEGT (aus R7) | https://en.wikipedia.org/wiki/Popgefahr · https://www.releasemagazine.net/three-decades-of-devision-the-dark-interview |
| Album-Geräte | – | UNBELEGT (3 Abfragen in R7 und R8) | – |

### 1.6 Agonoize (Berlin 2002; Mike Johnson, Oliver Senger, Chris L.)

| Gerät | Einsatz | Status | Quelle |
|---|---|---|---|
| Johnson: Komposition, Programmierung, Produktion, Mastering | Rollen | BELEGT | https://en.wikipedia.org/wiki/Agonoize |
| Aggrotech: Supersaw-Lead „Roland JP-8000“, gesättigte Bässe, TR-909, 140–180 BPM | Stil | WAHRSCHEINLICH (Genre-Quellen, aus R7) | https://www.masterclass.com/articles/aggrotech-music-guide · https://festt.io/en/genres/aggrotech |
| Studio-Geräte | – | UNBELEGT | – |

### 1.7 Welle:Erdball

| Gerät | Einsatz | Status | Quelle |
|---|---|---|---|
| **Commodore 64, SID-Chip** als Markenzeichen. Honey: Text, Synth, Programmierung | Kernklang | BELEGT | https://en.wikipedia.org/wiki/Welle:Erdball · https://sceneworld.org/blog/2020/01/22/podcast-episode-82-welleerdball |
| Weitere Studio-Geräte | – | UNBELEGT | – |

### 1.8 Elegant Machinery (Schweden, seit 1988 als Pole Position)

| Gerät | Einsatz | Status | Quelle |
|---|---|---|---|
| Das Heft zu „A Decade of Thoughts“ (1998) dankt für **Novation**-Synths aus einem Laden in Malmö. Die Band nennt „top analogue synths“, die damals billig zu haben waren. | 90er | BELEGT (Band-Interview); Modelle UNBELEGT | https://www.electricityclub.co.uk/elegant-machinery-interview/ |
| Heute „quite some synths from Arturia, some Behringer stuff, the old E-mu“ | heute | BELEGT (Interview) | https://www.electricityclub.co.uk/elegant-machinery-interview/ |
| Eskil Simonsson (Covenant): Produktion und zusätzliche Synthesizer auf der Compilation | 1998 | BELEGT (Discogs-Credits) | https://www.discogs.com/release/153510-Elegant-Machinery-A-Decade-Of-Thoughts |

### 1.9 S.P.O.C.K (Schweden)

| Gerät | Einsatz | Status | Quelle |
|---|---|---|---|
| „Never Trust a Klingon“ (1992): „bubbling synthpop and samples from Captain James T Kirk“ | Hit | BELEGT (Rezension) → Sampler WAHRSCHEINLICH | https://en.wikipedia.org/wiki/S.P.O.C.K · https://www.electricityclub.co.uk/s-p-o-c-k-interview/ |
| Geräte | – | UNBELEGT | – |

### 1.10 Depeche Mode

| Gerät | Einsatz | Status | Quelle |
|---|---|---|---|
| Clarke: **Kawai Synthesizer 100F** (mono). Fletcher: **Moog Prodigy**. Gore: kleines Yamaha-Keyboard. „Speak & Spell“ größtenteils mit dem **ARP-Sequenzer**, den Daniel Miller mitbrachte | „Speak & Spell“ 1981 | BELEGT (SOS-Interview mit Clarke) | https://www.soundonsound.com/people/vince-clarke-electronic-music-pioneer |
| Drums: Snare und Hi-Hat aus dem **Korg KR-55**, Kick aus dem **ARP 2600**, synchronisiert über die Roland MC-4 | „Speak & Spell“ | WAHRSCHEINLICH (Händler-Blog; widerspricht beim Sequenzer dem SOS) | https://www.vintagedigital.com.au/classic-track/speak-and-spell |
| Lead von „Just Can't Get Enough“: **Roland Jupiter-4** | Single 1981 | WAHRSCHEINLICH (nur Thomann-Blog ohne Beleg) | https://www.thomann.de/blog/en/?p=448818 |
| Wilder (04/1984): „Yamaha CS5's, Moog Rogues and **Kawai unmentionables**“, dann „**Jupiter 8's, PPG Wave 2's, DX7's, Emulators**“, jetzt **Synclavier** | 1981–84 | WAHRSCHEINLICH (Zitat nur über Equipboard) | https://equipboard.com/albums/depeche-mode-construction-time-again |
| **Synclavier** besonders wichtig, Metall-Sampling (Hämmer auf Stahl) | „Construction Time Again“ 1983 | BELEGT (Orkus, MusicRadar, Wikipedia) | https://orkus1.com/en/depeche-mode-40-years-ago-construction-time-again-part-1/ · https://www.musicradar.com/news/how-depeche-mode-recorded-their-very-own-Berlin-trilogy · https://en.wikipedia.org/wiki/Construction_Time_Again |
| Synclavier-Samples, Wiedergabe über Verstärker in großen Räumen, Drumulator | „People Are People“ 1984 | WAHRSCHEINLICH (SOS-Artikel nur über Forum-Auszüge) | https://www.soundonsound.com/techniques/classic-tracks-depeche-mode-people-are-people |
| Chor und „Big Brass“ von **Emulator-II**-Disketten, Bass von **Minimoog Model D** und **ARP 2600** | „Enjoy the Silence“ 1990 | BELEGT (Reverb-Fachbeitrag) | https://api.reverb.com/news/the-synth-sounds-of-depeche-modes-enjoy-the-silence |
| OB-Xa | – | WAHRSCHEINLICH (Nutzerliste) | https://www.vintagesynth.com/oberheim/ob-xa |

### 1.11 a-ha („Take On Me“)

| Gerät | Einsatz | Status | Quelle |
|---|---|---|---|
| **Roland Juno-60** spielt das Hauptthema (Tarney). Ob Riff oder Rhythmus, berichten die Quellen verschieden. | Hook | BELEGT | https://www.vintagedigital.com.au/?p=167494 · https://www.songfacts.com/facts/a-ha/take-on-me/1000 |
| **Yamaha DX7** (per MIDI an den Juno gekoppelt), **PPG Wave** | Neuaufnahme | BELEGT (Wikipedia-Instrumentierung); PPG Wave 2.2 auf dem Album WAHRSCHEINLICH (Equipboard) | https://Www.wikipedia.org/wiki/Take_On_Me · https://equipboard.com/albums/a-ha-hunting-high-and-low |
| **LinnDrum** (von Pål programmiert), dazu echte Becken | Drums | BELEGT | https://Www.wikipedia.org/wiki/Take_On_Me |
| Prophet-5 nur im Video | – | BELEGT (nicht auf der Platte) | https://americansongwriter.com/3-songs-that-use-the-juno-60-the-synthesizer-that-made-80s-pop-music-sound-magical/ |

### 1.12 Alphaville

| Gerät | Einsatz | Status | Quelle |
|---|---|---|---|
| Bass von „Big in Japan“: **Roland System-100M** (2 Oszillatoren, Sequenzer, Arpeggiator). Die zwei Osz. sind **eine Quinte gegeneinander verstimmt**. | „Big in Japan“ 1984 | BELEGT (Interviews Gold und Lloyd) | https://www.songwritingmagazine.co.uk/?p=44703 · https://www.tip-berlin.de/konzerte-party/tontraeger/alphaville-remaster-interview-80er-in-berlin/ |
| Gold: frühe Geräte waren „basically toys“, billigste Mono-Synths | Anfang | BELEGT | https://www.classicpopmag.com/?p=12154 |
| PPG Wave 2.3 + Waveterm, ARP Odyssey, Korg MS-20/MS-10, Roland M-100, Linn LM-1, TR-808, Simmons, Hohner/Solina-Streicher | Lloyd allgemein | WAHRSCHEINLICH (Equipboard, aus R6) | https://equipboard.com/pros/bernhard-lloyd |
| „Forever Young“: Budde ließ alles auf Gesang und **Synth-Flächen** reduzieren | Ballade | BELEGT | https://en.wikipedia.org/wiki/Forever_Young_(Alphaville_song) |

### 1.13 OMD

| Gerät | Einsatz | Status | Quelle |
|---|---|---|---|
| Humphreys: die ersten Alben „almost entirely“ mit **Korg Micro-Preset, Korg MS-20, Roland SH-01 und SH-2, Prophet-5**. Bei „Architecture & Morality“ kam ein **Mellotron** dazu. | 1980–81 | BELEGT (Interview) | https://www.synthhistory.com/post/three-questions-with-orchestral-manoeuvres-in-the-dark-omd |
| McCluskey: **Mellotron Mk1** auf A&M. Das Brass auf „Romance of the Telescope“ ist ein Prophet-5-Werkspreset, der Chor kommt vom Mellotron. | A&M 1981 | BELEGT (Interview) | https://electricityclub.co.uk/?p=4500 · https://www.omd-messages.co.uk/architecture-morality-interview-paul-humphreys |
| „Enola Gay“: Micro-Preset (Regler „Traveller“), **Roland CR-78** selbst programmiert | 1980 | BELEGT (aus R6 [K8]) | https://www.electronicsound.co.uk/features/landmarks/orchestral-manoeuvres-in-the-dark-enola-gay |
| **Emulator** (Library-Reggae-Sound und Trompete) | „Junk Culture“ 1984 | BELEGT (uDiscover) | https://www.udiscovermusic.com/stories/omd-junk-culture-album/ |
| Oberheim OB-X | „Dazzle Ships“ | WAHRSCHEINLICH (Wikipedia-Liste) | https://wikipedia.com/wiki/OB-X |

### 1.14 The Human League

| Gerät | Einsatz | Status | Quelle |
|---|---|---|---|
| „Being Boiled“: **Korg 700S** (Ware), **Roland System-100** (gehörte Ian Craig Marsh, einziger Sequenzer, lieferte die Grundrhythmen), 2-Spur-Band ohne Pult | 1978 | BELEGT (Ware im RBMA-Vortrag; Bonedo-Video mit Ware und den Original-Patchbögen) | https://daily.redbullmusicacademy.com/2013/11/key-tracks-martyn-ware-being-boiled · https://www.bonedo.de/artikel/human-league-being-boiled-und-das-roland-system-100 |
| „Dare“: **Linn LM-1**, jede Stimme einzeln programmiert, über Einzelausgänge bearbeitet | 1981 | BELEGT | https://www.vintagedigital.com.au/classic-track/dont-you-want-me · https://en.wikipedia.org/wiki/Dare_(album) |
| Roland System-700, Jupiter-4, Yamaha CS-15 | „Don't You Want Me“ | WAHRSCHEINLICH (Händler-Blog, Forum uneinig) | https://www.vintagedigital.com.au/classic-track/dont-you-want-me · https://www.kvraudio.com/forum/viewtopic.php?p=8483623 |
| Casio VL-1 auf „Get Carter“ | 1981 | WAHRSCHEINLICH (gearnews) | https://www.gearnews.com/the-sheffield-scene-how-to-sound-like-the-human-league |
| Roland MC-4 für die „spidery synth lines“ | „Dare“ | WAHRSCHEINLICH (aus R6, Stereogum) | https://stereogum.com/2086575/the-number-ones-the-human-leagues-dont-you-want-me/columns/the-number-ones |

### 1.15 New Order

| Gerät | Einsatz | Status | Quelle |
|---|---|---|---|
| „Blue Monday“: Drums **Oberheim DMX**, Bass **Moog Source** über den selbst gebauten Powertran-Sequenzer, Chor aus dem **Emulator** (gesampelt aus Kraftwerk „Uranium“) | 1983 | BELEGT (aus R6) | https://en.wikipedia.org/wiki/Blue_Monday_(New_Order_song) · https://www.musicradar.com/news/blue-monday-synth-sound |
| 1982–85: **Prophet-5**, Emulator I, Octave-Plateau Voyetra | Rig | WAHRSCHEINLICH (Fan-Forum) | https://www.neworderonline.com/community/forums/digital-republic/24632-new-order-s-keyboards |
| „Low-Life“ 1985: Yamaha QX1, **TX812** (DX7-Modul), später **Emulator II** | 1985+ | BELEGT (hifinews, Auszug) | https://hifinews.com/content/new-order-low-life-production-notes |
| Boss DR-55 auf frühen Stücken („Truth“) | 1981 | WAHRSCHEINLICH (Morris-Zitat über Equipboard) | https://equipboard.com/pros/stephen-morris |
| OB-Xa | – | WAHRSCHEINLICH (Nutzerliste) | https://www.vintagesynth.com/oberheim/ob-xa |

### 1.16 Duran Duran (Nick Rhodes)

| Gerät | Einsatz | Status | Quelle |
|---|---|---|---|
| **Jupiter-4**-Arpeggiator auf **ZUFALL** | „Rio“ | BELEGT (aus R7) | https://www.roland.com/uk/blog/nick-rhodes-on-the-roland-synths-that-drive-duran-duran/ · https://en.wikipedia.org/wiki/Rio_(song) |
| **Roland SH-2 + CSQ-100**, Riff mit Delay | „Save a Prayer“, „The Chauffeur“ | BELEGT (aus R7) | https://www.roland.com/uk/blog/nick-rhodes-on-the-roland-synths-that-drive-duran-duran/ |
| **Prophet-5**-Sequenz, Jupiter-4, **Crumar Performer** (Streicher) | „Planet Earth“ | BELEGT (aus R7) | https://en.wikipedia.org/wiki/Planet_Earth_(Duran_Duran_song) |
| „My three Jupiters and my Moog“ | allgemein | BELEGT (Interview, aus R7) | https://www.musicradar.com/news/nick-rhodes-top-5-synths |
| **Fairlight CMI** (live 1984, gekauft in Australien) | Tour 1984 | BELEGT (E&SCM 03/1984); Albumeinsatz WAHRSCHEINLICH | https://www.muzines.co.uk/articles/concert-review/3274 |
| Elka Synthex | – | WAHRSCHEINLICH (Wikipedia-Nutzerliste) | https://en.wikipedia.org/wiki/Elka_Synthex |
| Roland Space Echo | „Save a Prayer“ | WAHRSCHEINLICH (aus R7) | https://ultimateclassicrock.com/duran-duran-save-a-prayer/ |

### 1.17 Jean-Michel Jarre

| Gerät | Einsatz | Status | Quelle |
|---|---|---|---|
| **EMS VCS3, Eminent 310, RMI Harmonic Synthesizer, ARP 2600**, Band-Echo, Gitarrenpedale | „Oxygène IV“ | BELEGT (aus R7) | https://musicradar.com/news/jean-michel-jarre-best-synth-sound |
| Eminent 310 durch **Small-Stone-Phaser** (die wirbelnden Flächen) | Oxygène/Equinoxe | BELEGT (aus R7) | https://en.wikipedia.org/wiki/Equinoxe · https://hifinews.com/content/jean-michel-jarre-equinoxe-production-notes |
| Eminent: verstimmte Sägen aus einem Teiler, Ensemble aus 3 Eimerketten-Verzögerungen mit 2 LFOs | Klang | BELEGT | https://en.wikipedia.org/wiki/Eminent_310_Unique |
| **Korg/Keio Mini Pops** (zwei Muster-Tasten zugleich) | Rhythmus | Gerät BELEGT; Kombination WAHRSCHEINLICH | https://hollowsun.com/nostalgia/contributors/minipops/index.html |
| **Fairlight CMI** und **Emulator** (Stimmen in 25 Sprachen) | „Zoolook“ 1984 | BELEGT | https://en.wikipedia.org/wiki/Zoolook · https://www.muzines.co.uk/articles/the-french-connection/3774 |
| **Elka Synthex** für den Laserharfen-Klang | „Rendez-Vous“ 1986 | WAHRSCHEINLICH (Wikipedia-Auszug ohne Beleg) | https://wikipedia.com/wiki/Elka_Synthex |
| OB-X/OB-Xa für Brass | – | WAHRSCHEINLICH (Wikipedia-Liste, Nutzerliste) | https://wikipedia.com/wiki/OB-X · https://www.vintagesynth.com/oberheim/ob-xa |
| RMI über Electric-Mistress-Flanger | Oxygène | WAHRSCHEINLICH (aus R7) | https://www.sonicstate.com/news/2016/02/17/worlds-first-digital-synth-revived-for-reason/ |

### 1.18 Isao Tomita

| Gerät | Einsatz | Status | Quelle |
|---|---|---|---|
| **Moog III** (modular) und **Mellotron**, Polyphonie über Mehrspur | „Snowflakes Are Dancing“ 1974 | BELEGT (aus R7) | https://en.wikipedia.org/wiki/Snowflakes_Are_Dancing · https://en.wikipedia.org/wiki/Isao_Tomita |
| Pfiffe, Glocken, Phasing, Flanging, **Ringmodulation** | Klangpalette | BELEGT (aus R7) | https://en.wikipedia.org/wiki/Snowflakes_Are_Dancing |
| Pfiff-Patch: selbstschwingendes Filter + Rauschen | Pfiff | Diagramm BELEGT, Bauweise WAHRSCHEINLICH (aus R7) | https://www.synthtopia.com/content/2021/05/14/recreating-isao-tomitas-iconic-whistle-patch/ |

### 1.19 Kraftwerk

| Gerät | Einsatz | Status | Quelle |
|---|---|---|---|
| **Minimoog** für Basslinien (Hütter), **ARP Odyssey** (Schneider), **Robovox**-Vocoder, eigene E-Pads | „Autobahn“ 1974 | BELEGT (aus R7) | https://hifinews.com/content/kraftwerk-autobahn-production-notes · https://en.wikipedia.org/wiki/Autobahn_(song) |
| Farfisa Rhythm Unit 10, Vox Percussion King, „extremely customised“ | „Autobahn“ | BELEGT (Mixdown, aus R7) | https://mixdownmag.com.au/features/gear-rundown-kraftwerk-autobahn/ |
| **Synthanorma**-Sequenzer (Matten & Wiechers, 32 Schritte; auf „Franz Schubert“ und „Endless Endless“) | „Trans-Europe Express“ | BELEGT (aus R7) | https://en.wikipedia.org/wiki/Trans-Europe_Express_(album) |
| … und steuert dort den **Minimoog** | „Trans-Europe Express“ | WAHRSCHEINLICH (SDIY-Wiki nach Flürs Memoiren, Wikipedia-Artikel Kling Klang Studio; Schrittzahl 16 oder 32 ist uneinig; ein Forum zitiert Bartos (SOS 03/1998), ein Sequenzer sei auf keiner Aufnahme benutzt worden – welches Gerät gemeint ist, bleibt offen) | https://sdiy.info/wiki/Synthesizerstudio_Bonn · https://en.wikipedia.org/wiki/Kling_Klang_Studio · https://gearspace.com/threads/kraftwerk.32874/ |
| Lead auf „Das Model“: Polymoog oder Minimoog | 1978 | WAHRSCHEINLICH (Quellen uneinig) | https://www.musicradar.com/news/kraftwerk-the-model |
| **Sennheiser VSM-201** (Schneiders Gerät versteigert; Einsatz auf „Man Machine“ unklar) | Vocoder | WAHRSCHEINLICH | https://www.synthtopia.com/content/2025/09/14/secrets-of-kraftwerks-vocoder-the-sennheiser-vsm201/ |
| TI **Language Translator**, Speak & Spell nur für den Start-Ton | „Computer World“ | WAHRSCHEINLICH (aus R7) | https://notebook.zoeblade.com/Language_Translator.html |
| Minimoog, Polymoog und Chor-Sondertastatur auf Hütters Ständer | Tour 1981 | BELEGT (Wikipedia zur Tour) | https://en.wikipedia.org/wiki/Computer_World_(tour) |
| Prophet-5 auf Tour | 1981 | WAHRSCHEINLICH (nur Fachpresse/Gear-Seiten, nicht im Tour-Artikel) | https://www.gearnews.com/kraftwerk-synths-sequencers-sounds/ · https://www.bonedo.de/artikel/kraftwerk-in-der-rocknroll-hall-of-fame-die-wichtigsten-synths-und-sounds |
| Vako Orchestron (Chor/Streicher) | 70er | WAHRSCHEINLICH | https://notebook.zoeblade.com/Kraftwerk.html |

### 1.20 The Midnight

| Gerät | Einsatz | Status | Quelle |
|---|---|---|---|
| McEwans Lieblinge zu „Heroes“: **OB-6, Prophet-6, Juno-106, Oberheim Matrix-6, UDO Super 6**. OB-6 und Prophet-6 kamen 2020 dazu. | „Heroes“ 2022 | BELEGT (MusicRadar-Interview) | https://www.musicradar.com/news/the-midnight-tim-mcewan-synths-plugins-interview |
| **Moog Sub 37, Yamaha DX7, Serum, Oberheim OB-X8, UDO Super 6, u-he Zebra 2** | „Syndicate“ 2025 | BELEGT (MusicTech-Interview) | https://musictech.com/features/interviews/the-midnight-interview-syndicate/ |
| „The Juno-6 … in its beating heart“ (Lyle) | allgemein | WAHRSCHEINLICH (nur die Überschrift, aus R6) | Link in `r6/bibliothek-recherche.md` §10 (inkl.com) |
| Saxofon als Markenzeichen | Klang | BELEGT (aus R6) | https://en.wikipedia.org/wiki/The_Midnight |

---

## 2. Rangliste: Wie viele Vorbilder hängen an welchem Instrument?

Gezählt werden Acts, nicht Songs. **B** = mindestens ein BELEGT-Eintrag, **W** = nur WAHRSCHEINLICH. Familien sind zusammengefasst, Einzelmodelle stehen in Klammern. Grundlage ist §1.

| Rang | Instrument / Familie | B | W | Acts (B fett) | Kurzurteil |
|---|---|---|---|---|---|
| 1 | **Sampler** (Emulator I/II, Fairlight, Synclavier, E-mu) | 6 | 2 | **DM, New Order, OMD, Jarre, Elegant Machinery, Sixth June** · Duran, S.P.O.C.K | größte Abhängigkeit, größte Lücke |
| 2 | **Moog-Familie** (Minimoog, Source, Prodigy, Polymoog, Moog III, Sub 37) | 6 | 0 | **Kraftwerk, Tomita, DM, New Order, Duran, The Midnight** | Kern-Bass/Lead; VK deckt viel ab |
| 3 | **Rhythmusboxen und Analog-Drums** (Mini Pops, CR-78, KR-55, Farfisa/Vox, DR-55, 808, 909) | 4 | 4 | **Jarre, OMD, Kraftwerk, Sixth June** · DM, New Order, Alphaville, Agonoize | Drum-Engine kann das grundsätzlich |
| 4 | **Roland SH/System/MC** (SH-1, SH-2, System-100/100M/700, MC-4; SH-201) | 4 | 1 | **OMD, Duran, Human League, Alphaville** · Frozen Autumn | VA einfach; SH-101 selbst kaum belegt |
| 5 | **Sequential Prophet** (5, 6) | 3 | 3 | **OMD, Duran, The Midnight** · New Order, Static Movement, Kraftwerk (Tour) | VA + Poly-Mod |
| 6 | **Sample-Drumcomputer** (LM-1, LinnDrum, DMX, Drumulator) | 3 | 2 | **Human League, a-ha, New Order** · Alphaville, DM | nur Annäherung ohne Samples |
| 6 | **ARP** (2600, Odyssey, Sequenzer) | 3 | 1 | **DM, Jarre, Kraftwerk** · Alphaville | VA + Ringmod |
| 8 | **Oberheim** (OB-X/OB-Xa/OB-6/OB-X8/Matrix-6) | 1 | 4 | **The Midnight** · Jarre, New Order, DM, OMD | VA + SVF 12 |
| 8 | **Elka Synthex** | 0 | 4 | · Frozen Autumn, Static Movement, Jarre, Duran | **Cold-Wave-Kern**, Xanders Frage |
| 8 | **String-Machines** (Eminent 310, Solina, Crumar Performer, Orchestron) | 2 | 2 | **Jarre, Duran** · Alphaville, Kraftwerk | VA + Ensemble + **Phaser** |
| 8 | **FM** (DX7/TX812, Korg DS-8) | 2 | 3 | **a-ha, The Midnight** · DM, New Order, Frozen Autumn | FM6 vorhanden, Hüllkurven-Problem offen |
| 8 | **PPG Wave** (2, 2.2, 2.3) | 1 | 3 | **a-ha** · DM, Alphaville, Static Movement | Tabellen-Osz. „Stufen“ (V8a) |
| 8 | **Roland Jupiter** (4, 8) | 1 | 3 | **Duran** · DM, Human League, Alphaville | VA + **Arp ZUFALL** |
| 14 | **Roland Juno** (6/60/106) | 2 | 0 | **a-ha, The Midnight** (+ Retrowave allgemein) | VA + Chorus vorhanden |
| 14 | **Mellotron** | 2 | 1 | **OMD, Tomita** · Jarre | Bandsampler, nur Annäherung |
| 14 | **Korg-Mono** (Micro-Preset, MS-20/MS-10, 700S) | 2 | 1 | **OMD, Human League** · Alphaville | VA; MS-20 braucht Korg35 |
| 17 | **Kawai** (100F; K4; K1) | 1 | 1 | **DM (100F)** · Frozen Autumn (K4) · **K1: niemand** | K1-Vorlage nur als Zusatz |
| 17 | **ROMpler 90er** (JX-305, Trinity) | 0 | 1 | · Frozen Autumn | Bibliotheks-Klänge statt Vorlage |
| 19 | **Vocoder** (Robovox, VSM-201) | 1 | 0 | **Kraftwerk** | braucht Mikrofon (VS) |
| 19 | **C64 SID** | 1 | 0 | **Welle:Erdball** | VA + VK; Kombiwellen fehlen |
| 19 | **Sprachchip** (Speak & Spell, Language Translator) | 0 | 1 | · Kraftwerk | später |
| 19 | **Supersaw** (JP-8000) | 0 | 1 | · Agonoize (Genre) | Unison 7 vorhanden |
| – | Access Virus, Nord Lead, JD-800, Korg M1, Waldorf Microwave, SH-101 | 0 | 0–1 | – | **keine eigene Vorlage** (§6) |

**Effekte (gleich zählen):**

| Effekt | B | Acts | App heute |
|---|---|---|---|
| Band-/Space-Echo | 2 + 1 W | **Jarre** (Revox/Band-Echo), **Kraftwerk** (Analog-Echo „Autobahn“) · Duran | ECHO mit Band-Leiern vorhanden (intern: Master-Briefing A8) |
| Phaser/Flanger | 2 | **Jarre, Tomita** | **fehlt** |
| Ringmodulation | 2 (+ Gerätefunktion) | **Tomita**, SID (Welle:Erdball), Synthex | VK geplant (Nachtrag A.10 Punkt 6) |
| Chorus/Ensemble (im Gerät) | – | Juno, Jupiter-4, Synthex, Eminent | Chorus I/II/I+II/ENS/BREIT vorhanden |

**Status der Zählung:** Die Zahlen sind eine eigene Auszählung aus §1 (UNBELEGT als Methode). Weil für 6 der 20 Acts kein Gerät belegt ist, sind Cold-Wave- und EBM-Geräte in der Liste **unterzählt**.

---

## 3. Instrument-Steckbriefe: Klang, Synthese-Merkmale, SYNQUENZER-Abbildung

Legende der App-Bausteine (intern):
- **VA**: 3 Osz., Unison bis 7, Sync, Sub, Rauschen, ZDF-Ladder, Multimode LP/BP/HP 24/12, Drive, 3 ADSR, 2 LFO, ≤ 8 Mod-Routen, Chorus I/II/I+II/ENS/BREIT (Spec §1.1; Master-Briefing Teil 11).
- **WT**: nativ, 4 Tabellen `digital/vocal/glas/orgel` mit Position und Scan (`r8/V0a-copy.html`, `WT_TABLES`).
- **FM6**: 6 Op., 32 DX-Algorithmen, .syx-Import (§1.1); geplant sind das FM-Feld bis 8 Op. (§9) und V0d FM-Sofort.
- **Drums ev3**: universelle Stimme TON/FM/RAUSCHEN/METALL/KLICK (§1.1).
- **VK** (Nachtrag A.10): Drift `walk`, Haifischzahn, gebogene Säge, `sat` nach dem Filter, SVF 12 LP↔Notch↔HP, Osz.-FM 2→1, Ringmod, (P1) Bitcrusher.
- **V8a/V8b**: Tabellen-Oszillator, Bitmask, N8a-01 „Stufen │ Glatt“ (§10, Nachtrag A.11).
- **V9a**: Tabellen-Additiv mit 32 Balken, A→B-Morph, **XY-Feld aus 4 Spektren** (§11.1).
- **V9b**: KLANGKÖRPER mit bis 48 Teiltönen.

Spalte „Lücke“ = was nach VK/V8/V9 noch fehlt. Aufwand in Paket-Stunden ist eine eigene Schätzung (UNBELEGT).

### 3.1 Moog-Familie (Rang 2)

- **Klang:**
  - 3 VCOs, 24-dB-Ladder, kann selbst schwingen, „sättigender“ Mischer. Die Neuauflage 2022 führt den Ausgang zurück in den Eingang („instant overdrive“). BELEGT (Händler- und Museumstexte): https://www.smemmusic.ch/de/node/5370 · https://www.kraftmusic.com/moog-minimoog-model-d-analog-synthesizer.html
  - Die Haifisch-/Säge-Formen früher Platinen sind WAHRSCHEINLICH (Moog-Forum, aus R6).
- **Merkmale für den Nachbau:**
  - Ladder 24 dB mit Bassverlust bei Resonanz. Gemessen: −8,7 dB bei Res 0,5 (intern, Nachtrag A.10).
  - Haifischzahn; Drift innerhalb der Note; Sättigung bzw. Rückkopplung; Glide; Osz. 3 tief als Sub.
- **App:** VA + VK (`walk`, Haifischzahn, `sat`). Presets N61/N62 gibt es schon (intern, V10d).
- **Lücke:**
  - Regler RÜCKKOPPLUNG (Ausgang → Mischer) und Osz. 3 als Mod-Quelle (Master-Briefing Teil 11, intern).
  - Moog-modular-Klänge (Tomita) brauchen keine eigene Engine. Pfiff und Glocke sind als R7-Rezepte gebaut.
- **Aufwand:** ≤ 1 h zusätzlich zu VK (UNBELEGT).

### 3.2 Sampler: Emulator I/II, Fairlight, Synclavier (Rang 1)

- **Klang:**
  - Emulator II: 8 Bit mit Companding, 27,7 kHz, analoges **24-dB-SSM-Tiefpassfilter** mit Resonanz. BELEGT: https://en.wikipedia.org/wiki/E-mu_Emulator
  - Fairlight Series II: 8 Bit, 32 kHz (Series I bis 24 kHz), Sequenzer Page R, Orchester-Hit (ORCH2/ORCH5, aus Strawinskys „Feuervogel“). BELEGT: https://www.perfectcircuit.com/signal/fairlight-cmi-history · https://musictech.com/reviews/studio-icons-fairlight-cmi/
  - Den Klang machen die Aufnahme (Chor, Brass, Metall, Stimmen) **plus** die grobe Wandlung **plus** das Analogfilter.
- **Merkmale für den Nachbau:**
  - Quelle = Aufnahme (Sample)
  - Bit- und Ratenreduktion mit Companding
  - Resonanz-Tiefpass 24 dB
  - einfache AR-Hüllkurve, Loop
- **App:**
  - Keine Sample-Wiedergabe. Sample-Import steht in §18 (intern).
  - Ersatz heute: WT `vocal` für den Chor (N05, N15), FM6 für Metall (N06).
- **Lücke:**
  1. Stufe **KÖRNUNG** (Bits 12→6, Rate ÷1–÷4, μ-Law-artiges Companding, danach Ladder 24): gibt Synth-Klängen den Sampler-Glanz. Klein, P1-Bitcrusher aus VK wiederverwenden.
  2. **Eigene Samples**: aufnehmen per Mikrofon (P3) oder Datei laden, nur eigene Aufnahmen. Für 6–8 Vorbilder der Kern, aber ein großes Paket (§18/VS).
  3. V9c „Teiltöne einfangen“ bildet nur Einzelnoten nach, kein Sampler.
- **Recht:** Fremde Aufnahmen als Samples sind geschützt (WAHRSCHEINLICH, R7 §1, EuGH C-476/17). Werks-Samples nur aus eigenen Aufnahmen.

### 3.3 Rhythmusboxen und Analog-Drums (Rang 3)

- **Klang:**
  - Mini Pops: „woody analogue drum tonality“, Quijada und Guiro, nicht programmierbar. Jarre drückte zwei Muster-Tasten zugleich. BELEGT (Fachseite): https://hollowsun.com/nostalgia/contributors/minipops/index.html
  - TR-909: Kick, Snare, Hats, Clap und Toms analog, Becken als **6-Bit-Samples**. BELEGT: https://en.wikipedia.org/wiki/Roland_TR-909 · https://www.attackmagazine.com/features/interview/atsushi-hoshiai-the-man-behind-the-tr-909/
  - TR-808: Bridged-T-Kick, Metall-Hats aus mehreren Rechteck-Oszillatoren. WAHRSCHEINLICH (Blog): https://equipboard.com/posts/roland-tr-808-guide
- **App:** Drums ev3 kann TON/RAUSCHEN/METALL/KLICK. Die Kits N09 „Rhythmus-Box 78“ (CR-78) und N14 gibt es (intern, R6).
- **Lücke:**
  - **Preset-Box-Modus**: zwei Muster überlagern (Jarre-Trick) als Kit-Muster-Layer. Heute nur von Hand nachzubauen.
  - 909-Becken bzw. 6-Bit-Charakter → KÖRNUNG je Pad.
  - Klein (≈ 2 h, UNBELEGT).

### 3.4 Sequential Prophet-5/-6 (Rang 5)

- **Klang:**
  - 2 VCOs (A: Säge/Puls, B: Säge/Dreieck/Puls), 4-Pol-Tiefpass (Rev1/2 SSM, Rev3 CEM3320).
  - **Poly-Mod**: Filter-Hüllkurve und Osz. B → Frequenz von Osz. A, PW A, Cutoff.
  - „Vintage“ streut Stimmen.
  - BELEGT (Herstellertext über Händler): https://www.pmtonline.co.uk/sequential-prophet-5-analog-poly-synth
- **App:** VA. Osz.-FM 2→1 (VK `ofm`) + Route Hk. 2 → Osz.-1-Tonhöhe ergibt Poly-Mod. `analog` ≈ Vintage (intern, Master-Briefing Teil 11). Preset N16 vorhanden.
- **Lücke:** Poly-Mod-Ziel „PW A“ (über eine Mod-Route lösbar, prüfen); VINTAGE auch auf Hüllkurven. Klein.

### 3.5 Roland SH/System/MC (Rang 4) und SH-101

- **Klang:**
  - SH-101: 1 VCO (CEM3340) mit Säge, Puls/PWM und Sub (−1 Okt Rechteck, −2 Okt Rechteck oder Puls) gleichzeitig, Rauschen, selbstschwingender Tiefpass, LFO mit Zufall, 100-Schritt-Sequenzer, Arp. BELEGT: https://en.wikipedia.org/wiki/Roland_SH-101 · https://support.roland.com/hc/en-us/articles/201921519-SH-101-Technical-Specifications
  - System-100M (Alphaville): 2 Osz. eine **Quinte** auseinander (BELEGT, §1.12).
- **App:** VA deckt das ab: Sub, PWM, S&H-LFO, Glide. Der Sequenzer ist der Clip-Sequenzer.
- **Lücke:** Sub-Formen „−2 Okt Puls“ (prüfen, ob `sub` diese Form hat; sonst Osz. 3 −2 Okt Puls). Keine eigene Engine.

### 3.6 Sample-Drumcomputer: LM-1, LinnDrum, DMX (Rang 6)

- **Klang:** LM-1 hat 8-Bit-Samples mit 28 kHz, Stimmung und Panorama je Stimme, Einzelausgänge. BELEGT: https://en.wikipedia.org/wiki/Linn_LM-1 · https://hollowsun.com/nostalgia/vintage/linn_lm1/index.html
- **App:** Kit A.1 #45 „Studio 82“ ahmt LinnDrum mit Synth-Drums nach (intern).
- **Lücke:** Ohne Samples bleibt es Annäherung. Dazu helfen:
  - KÖRNUNG je Pad
  - ANSCHLAG-Schicht (kurzes Rauschen mit Bandpass, ≤ 30 ms)
  - später eigene Samples (§3.2)

### 3.7 ARP 2600/Odyssey (Rang 6)

- **Klang:** halbmodular, 3 Osz., 4-Pol-Filter, 2 Hüllkurven, **Federhall**. BELEGT (Händlertext zur 2600M): https://citymusic.com.sg/?p=13642. Ringmodulator: Gerätewissen (UNBELEGT in dieser Runde).
- **Einsatz:** Kick und Bass bei DM, Effekte bei Jarre.
- **App:** VA + VK-Ringmod. Kick über Drums ev3 TON.
- **Lücke:** Federhall-Charakter (Hall-Typ „Feder“), klein, optional.

### 3.8 Oberheim OB-X/OB-Xa/OB-6 (Rang 8)

- **Klang:** OB-X mit 2-Pol-SEM-artigem Filter, breite Verstimmung, „Brass“ (Jarre laut Wikipedia). WAHRSCHEINLICH: https://wikipedia.com/wiki/OB-X
- **App:** VA + VK SVF 12. N36, N59 und N60 gibt es (intern).
- **Lücke:** keine, sobald VK steht.

### 3.9 Elka Synthex (Rang 8, Cold-Wave-Kern)

- **Klang und Bauweise:**
  - 8 Stimmen, **2 DCOs je Stimme**: Dreieck, Säge, Rechteck, Puls, Rauschen; Puls-Kreuzmodulation; **Ringmodulation**.
  - **4-Pol-Multimodefilter**: LP 24 dB mit Resonanz, BP 6/12 dB, HP 12 dB ohne Resonanz.
  - Analog-**Chorus I/II/III**, Joystick, Split/Double, 4-Spur-Sequenzer.
  - BELEGT (Museum SMEM, Wikipedia, Cherry-Audio-Text): https://www.smemmusic.ch/fr/node/330 · https://wikipedia.com/wiki/Elka_Synthex · https://cherryaudio.com/products/elka-x
- **Merkmale für den Nachbau:**
  - 2 Osz. mit Ringmod-Anteil
  - Puls-Kreuzmod (Osz. 2 → PW 1)
  - Multimode mit BP 6 dB
  - **dreistufiger** Chorus
  - Joystick → zwei Ziele (X/Y)
  - Double-Modus (zwei Klänge geschichtet)
- **App:**
  - VA (2 Osz., LP/BP/HP 12/24), VK-Ringmod, Chorus I/II/I+II.
  - Joystick ≈ XY-Feld bzw. 2 Mod-Routen.
  - A.1 #13 „Synthex-Streicher“ ist schon da (intern; wird in V10b umbenannt).
- **Lücke:**
  - BP 6 dB (1-Pol-BP)
  - Mod-Route Osz. 2 → PW Osz. 1 (prüfen, ob es das Ziel gibt)
  - Chorus-Stufe III (eigene Werte, Synthex-Werte UNBELEGT)
  - Layer „Double“ (zwei Sounds auf einer Spur; heute nur über zwei Spuren)
- **Aufwand:** ≈ 2 h (UNBELEGT).

### 3.10 String-Machines: Eminent 310, Solina, Crumar Performer (Rang 8)

- **Klang:** leicht verstimmte Sägen aus einem Frequenzteiler (voll polyphon), Ensemble aus 3 Eimerketten-Verzögerungen mit 2 LFOs, bei Jarre dazu **Phaser**. BELEGT: https://en.wikipedia.org/wiki/Eminent_310_Unique
- **App:** VA Säge Uni + Chorus ENS. J1 „Phasen-Streicher“ als Annäherung (intern, R7).
- **Lücke:**
  - **Phaser** (4/6 Allpass, Rate 0,05–2 Hz, Feedback) – Kern des Jarre-Klangs.
  - Optional „Teiler-Modus“ (alle Stimmen phasenstarr aus einem Oszillator).
  - Phaser ≈ 2 h (UNBELEGT).

### 3.11 FM: Yamaha DX7 und Korg DS-8 (Rang 8)

- **Klang:**
  - DX7: 6 Op., 32 Algorithmen, 4 Raten/4 Pegel (aus R6 [K1]).
  - Korg DS-8: 8 Stimmen, **2 „Oszillatoren“ = je 1 Träger-Modulator-Paar** (4 Op. gesamt, YM2164/OPP), Modulator-Verhältnis 0,5 oder ganzzahlig („Spectrum“), Pegel „Timbre“ mit eigener Hüllkurve, **1 Filter je Stimme**, Bedienung wie ein Analog-Synth.
  - BELEGT (Wikipedia, Music Technology 1987 über muzines) und WAHRSCHEINLICH (KVR-Forum für das Verhältnis): https://en.wikipedia.org/wiki/Korg_DS-8 · https://www.muzines.co.uk/articles/korg-ds8/2065 · https://www.kvraudio.com/forum/viewtopic.php?p=3634139
- **App:** FM6 ist vorhanden.
  - DX7: direkt (.syx).
  - DS-8: Algorithmus mit 2 parallelen Paaren (DX-Alg. 5 ohne drittes Paar). **Nach** FM gibt es aber **kein Filter** (prüfen; FM6 ist im Bestand ohne Filter beschrieben).
- **Lücke:**
  - **Filter nach FM** (Ladder/SVF auf der FM-Stimme) für DS-8 und „analoge FM“-Bedienung. Xanders Wunsch nach „snappy FM-Bässen“ (fragen-xander-9) hängt zuerst an den FM-Hüllkurven (V0d bzw. eigene Recherche) und nicht an dieser Vorlage.
  - Vorlage „ZWEI-PAAR-FM“ mit 4 Reglern: Spectrum, Timbre, Timbre-Hk., Filter.
  - ≈ 3 h nach V0d (UNBELEGT).

### 3.12 PPG Wave 2/2.2/2.3 (Rang 8)

- **Klang:**
  - 30–32 Wavetables mit je 64 Wellen, 8-Bit-Einzelperioden.
  - 2.2/2.3: 2 Osz. je Stimme, analoges **SSM2044**-Filter mit starker Resonanz („sweeter, synth-poppy“).
  - Hartes Springen zwischen Wellen. „Glassy aliased top end“ ist nur eine Forenmeinung.
  - Quellen: https://greatsynthesizers.com/en/review/ppg-wave-2-2-wave-2-3-the-one-and-only/ · https://musictech.com/features/opinion-analysis/vintage-rewind-ppg-wave-2/ · https://en.wikipedia.org/wiki/Palm_Products_GmbH. Bauweise BELEGT; Aliasing WAHRSCHEINLICH.
- **App:**
  - WT heute: 4 Tabellen, Scan glatt.
  - V8a-Tabellen-Osz. + N8a-01 „Stufen“ (intern).
  - Presets N57, A.1 #5, A.1 #12 vorhanden.
- **Lücke:**
  - Schalter **8 Bit** (Wellen auf 8 Bit quantisieren, ohne Mip-Glättung über der Stufe)
  - **eigene PPG-artige Tabellen** (eigene Wellen, keine kopierten ROM-Daten)
  - Hüllkurve → Tabellenposition gibt es schon (Scan)
  - ≈ 1–2 h nach V8a (UNBELEGT)
- **Microwave** (keine Vorbild-Bindung): gleiche Tabellen wie der PPG (WAHRSCHEINLICH: https://www.vintagesynth.com/waldorf/microwave). Er ist mit dieser Vorlage mit abgedeckt.

### 3.13 Roland Jupiter-4/Jupiter-8 (Rang 8)

- **Klang:**
  - JP-4: 4 Stimmen, 1 VCO + Sub je Stimme, Arp **up/down/up-down/random**, Stereo-Chorus (2 × MN3004), Resonanz-LP + HP, 2 ADSR. BELEGT: https://en.wikipedia.org/wiki/Roland_Jupiter-4
  - JP-8: 8 Stimmen, 2 VCOs mit **Cross-Mod** und Sync, LP 12/24 umschaltbar, HP 6 dB, Arp mit 4 Modi inklusive random, Unison mit 16 Osz. BELEGT: https://en.wikipedia.org/wiki/Roland_Jupiter-8
- **App:** VA (LP 12/24, Sync, Unison, Chorus) + VK-Osz.-FM als Cross-Mod.
- **Lücke:** **Arpeggiator mit ZUFALL** (Duran „Rio“). Ob die App überhaupt einen Arpeggiator in der Klang-Ebene hat, ist offen: Im Bestand §1.1 steht keiner, „Arp-Treppe“ steht in §18 (intern). Ersatz heute: Clip mit Zufalls-Notenfolge. Arp-Baustein ≈ 3 h (UNBELEGT).

### 3.14 Roland Juno-6/60/106 (Rang 14)

- **Klang:** 6 Stimmen, **1 DCO** mit Säge, Puls/PWM und Sub gleichzeitig, Rauschen, **Hochpass in 4 festen Stufen**, Resonanz-LP 24 dB, 1 ADSR, LFO mit Delay, Arp, Stereo-Chorus mit 2 Schaltern. Der Chorus gleicht den einzelnen Oszillator aus. BELEGT: https://en.wikipedia.org/wiki/Roland_Juno-60 · https://support.roland.com/hc/en-us/articles/201955179-Juno-60-Technical-Specifications
- **App:** VA + Chorus I/II (Juno-Werte gemessen, intern Master-Briefing A8). N31 vorhanden.
- **Lücke:** HPF in 4 Stufen (Stufe 0 mit Bassanhebung, nur beim 106; Fachwissen UNBELEGT), Chorus-Rauschen. ≤ 1 h.

### 3.15 Mellotron (Rang 14)

- **Klang:** Bandwiedergabe echter Instrumente: Chor, Streicher, Flöte. „essentially a mechanical sampler“ (Humphreys, BELEGT, §1.13).
- **App:** WT `vocal` + Vibrato (N08).
- **Lücke:** wie Sampler (§3.2). Typisch sind zusätzlich **Band-Leiern** und das 8-s-Ende. Leiern gibt es im ECHO, als Klangbaustein nicht. Klein (LFO + Zufall auf Tonhöhe = VK `walk` + LFO).

### 3.16 Korg-Mono: Micro-Preset, MS-20, 700S (Rang 14)

- **Klang:** MS-20 hat HP → LP in Reihe, das Korg35-Filter mit „extreme resonance that breaks up and distorts“ (schreit, knurrt), Ringmod. BELEGT: https://www.soundonsound.com/music-business/korg-ms-series · https://greatsynthesizers.com/en/review/korg-ms-20-the-semi-modular-revolution/
- **App:** VA (HP und LP vorhanden, aber nur ein Filter je Stimme).
- **Lücke:** **zweites Filter in Reihe** und Korg35-Kennlinie (Begrenzung in der Rückkopplung). VK schließt das zweite Filter ausdrücklich aus (Nachtrag A.10, Nicht-Umfang). ≈ 3 h, CPU prüfen (UNBELEGT). Bei 2 belegten Acts (beide nutzen den Micro-Preset mehr als den MS-20) ist das **nachrangig**.

### 3.17 Kawai K1 und K4 (Rang 17, Xanders Frage)

- **K1 (1988):**
  - 256 Wellen mit 8 Bit: **204 zyklische Wellen aus additiver Synthese (128 Harmonische)** + 52 PCM-Anschläge/Drums.
  - Bis zu **4 Quellen** je Klang, Mischung per **Vektor-Joystick**, **kein Filter**, 16/8 Stimmen.
  - BELEGT: https://en.wikipedia.org/wiki/Kawai_K1 · https://www.muzines.co.uk/articles/kawai-k1-k1m/1051
- **K4 (1989):** 256 Wellen mit 16 Bit (96 zyklisch, 160 PCM), **digitales 2-Pol-Resonanzfilter** (12 dB). BELEGT: https://en.wikipedia.org/wiki/Kawai_K4
- **App:**
  - K1 = **V9a** (32 Oberton-Balken erzeugen die Tabellen) + **XY-Feld aus 4 Spektren** + Filter aus. Das passt ohne neuen DSP (intern §11.1).
  - Die 52 PCM-Anschläge fehlen → ANSCHLAG-Schicht (§3.2).
  - K4 = dasselbe + VK SVF 12 als 2-Pol-Filter.
- **Lücke:** 8-Bit-Schalter (wie PPG) und eine K1-artige Hüllkurve je Quelle (V9a hat nur A→B-Morph). ≈ 2 h nach V9a (UNBELEGT).
- **Rang begründet:** Vom K1 hängt **kein** Vorbild belegt ab. Die Vorlage lohnt sich trotzdem, weil sie fast nichts kostet und Xander danach gefragt hat.

### 3.18 ROMpler: JX-305, Trinity, M1 (Rang 17)

- **Klang:** M1 hat 4 MB 16-Bit-PCM (100 Multisounds, 44 Drums), 16 Stimmen, Effekte. BELEGT: https://en.wikipedia.org/wiki/Korg_M1. JX-305 = Tastatur-Fassung der MC-505. BELEGT: https://en.wikipedia.org/wiki/Roland_JX-305
- **App:** nicht als Vorlage machbar (ROM-Samples, Recht). Klangtypisch nachbauen lässt sich nur einzeln über die Bibliothek (Piano, Orgel, Flächen).
- **Empfehlung:** keine Vorlage.

### 3.19 Vocoder (Rang 19)

- **Klang:** VSM-201 nutzt zwei 20-Band-Filterbänke (Emulation XILS 201). Das Prinzip stammt aus der Sprachverschlüsselung. BELEGT/WAHRSCHEINLICH: https://musictech.com/news/gear/xils-lab-x201 · https://www.synthtopia.com/content/2025/09/14/secrets-of-kraftwerks-vocoder-the-sennheiser-vsm201/
- **App:** Kein Mikrofon (VS, Priorität P3). Erst mit VS möglich: Modulator = Stimme, Träger = Synth-Spur. Ohne Mikrofon wäre nur eine „Roboterstimme“ über Formant-Muster denkbar (FORMANT-Operator F7, §18).

### 3.20 C64 SID (Rang 19)

- **Klang:**
  - 3 Stimmen, Dreieck/Säge/Puls/Rauschen, **Kombi-Wellen** (mehrere zugleich), Ringmod (Dreieck × MSB), Hard-Sync, gemeinsames analoges **12-dB-Multimode-Filter** (LP/BP/HP).
  - Beim 6581 weicht das Filter von der Spezifikation ab.
  - BELEGT (Datenblatt-Seiten; Wikipedia-Teil mit „citation needed“): https://www.waitingforfriday.com/?p=661 · https://en.wikipedia.com/wiki/SID6581
- **App:** VA (Puls/PWM, Sync, LP/BP/HP 12) + VK-Ringmod + (P1) Bitcrusher. Presets A.1 #26–#30 „Brotkasten“ gibt es (intern).
- **Lücke:**
  - Kombi-Wellen (UND-Verknüpfung der Wellenbits; ≈ 1 h)
  - sehr schneller Arp („Arp-Treppe“, §18)
  - Rauschen nach SID-Art (Schieberegister)

### 3.21 Sprachchip: Speak & Spell / TI LPC (Rang 19)

- **Klang:** TMS5100, LPC mit Lattice-Filter 10. Ordnung, angeregt von Glottis-ROM oder Rauschen, ≈ 1200 bit/s → „raspy“. Circuit-Bending verstimmt den Takt. BELEGT: https://en.wikipedia.org/wiki/Texas_Instruments_LPC_Speech_Chips · https://languagelog.ldc.upenn.edu/nll/?p=41839
- **App:** nicht vorhanden. Möglich wären KLANGKÖRPER-Formanten (V9b) + Sprech-Vorlage, aber ohne Text-zu-Sprache. **Spät**, nur 1 Act (W).

### 3.22 Supersaw, Virus, Nord Lead, JD-800 (keine Vorbild-Bindung)

- **Supersaw:** Unison bis 7 mit JP-8000-artigen Abständen ist vorhanden (intern). Neu wäre ein Hochpass, der dem Grundton folgt (Master-Briefing Teil 11).
- **Virus:** 2 Filter mit Sättigung, bis 6 Pole, AM/PD/FM, HyperSaw erst ab TI. BELEGT: https://en.wikipedia.org/wiki/Access_Virus. N55 ist eine Annäherung.
- **Nord Lead (1995):** 2 Osz., Osz. 2 hart auf Osz. 1 synchronisierbar, lineare FM Osz. 2 → Osz. 1, digitales Multimode-Filter. Erst mit dem NL2 kamen der Ringmodulator und die Synchronisation von Osz. 1 mit dem Rauschgenerator. BELEGT: https://www.nordkeyboards.com/legacy-products/nord-lead/specifications/ · https://en.wikipedia.org/wiki/Nord_Lead. N56 + VK.
- **JD-800:** 108 PCM-Wellen, 4 Tones je Patch, TVF LP/BP/HP, Schieberegler. BELEGT: https://en.wikipedia.org/wiki/Roland_JD-800. Braucht Samples → keine Vorlage.

---

## 4. Lücken-Übersicht (nach VK, V8a, V9a)

| Lücke | betrifft (Rang) | Acts B/W | Größe (UNBELEGT) | Vorschlag |
|---|---|---|---|---|
| **Sample-Wiedergabe / eigene Samples** | Sampler, Mellotron, LM-1/Linn/DMX, ROMpler | 6+3+3 B | groß (§18, VS) | Stufe E; vorher KÖRNUNG als Ersatz |
| **KÖRNUNG** (Bits, Rate, Companding + 24-dB-LP) | Sampler, 909-Becken, PPG, K1 | 6 B (indirekt) | klein (≈ 2 h), P1-Bitcrusher aus VK erweitern | Stufe D |
| **ANSCHLAG-Schicht** (kurzes Rauschen/FM/Tabelle 30–150 ms) | LinnDrum-Annäherung, K1-PCM, D-50 | 3 B | ½–1 P (Master-Briefing Teil 11) | Stufe D |
| **Phaser + Flanger** | String-Machines, Jarre, Tomita | 2–3 B | ≈ 2–3 h | **Stufe B** |
| **Arp mit ZUFALL** | Jupiter-4/8, Duran | 1 B, 3 W | ≈ 3 h | Stufe B |
| **Juno-HPF 4 Stufen** | Juno | 2 B | ≤ 1 h | Stufe B |
| **SID-Kombiwellen**, schneller Arp | Welle:Erdball | 1 B | ≈ 1 h + Arp | Stufe B |
| **8-Bit-Schalter im Tabellen-Osz.** | PPG, K1, Microwave | 1 B, 3 W | ≈ 1 h nach V8a | Stufe C |
| **Hüllkurve je Quelle im Tabellen-Additiv (K1)** | K1 | 0 B | ≈ 1–2 h nach V9a | Stufe C |
| **Filter nach FM** | DS-8, „analoge FM“ | 0 B, 1 W | ≈ 2 h | Stufe D |
| **2. Filter in Reihe / Korg35** | MS-20, Virus | 2 B (Korg-Mono) | ≈ 3 h, CPU | nachrangig |
| **Layer „Double“** (2 Klänge auf einer Spur) | Synthex, JX/Trinity | 0 B, 4 W | mittel (Super-Synth §18) | später |
| **Vocoder** | Kraftwerk | 1 B | mittel, braucht VS | Stufe E |
| **Sprach-Synthese** | Kraftwerk | 0 B, 1 W | groß | später |
| **Federhall, Band-Leiern als Klangbaustein** | ARP, Mellotron | – | klein | optional |

---

## 5. Vorschlag: Charakter-Vorlagen (Instrument-Templates)

**Format** (intern, Master-Briefing Teil 11): Engine-Setup + Charakter-Module + eigene Frontplatte (≤ 12 Regler, Signalfluss links → rechts) + 4–8 Werksklänge. Namen ohne Marken (E9). Im ⓘ steht „Vorbild: … · Marken gehören ihren Inhabern, keine Verbindung“ und der Belegstatus.

| Vorlage | Vorbild (nur ⓘ) | Acts (B/W) | Engine | braucht | Frontplatte (Kern-Regler) | Stufe |
|---|---|---|---|---|---|---|
| **KASKADE** | Minimoog/Moog | 6/0 | VA | VK | Osz. 1–3 Welle/Lage, Mischer + RÜCKKOPPLUNG, Cutoff, Res, Kontur, Glide, Drift | A |
| **FÜNFER** | Prophet-5/6 | 3/3 | VA | VK `ofm` | Osz. A/B, POLY-MOD (Hk. → A, B → A), Cutoff, Res, Hk., VINTAGE | A |
| **NEBEL-8** | Elka Synthex | 0/4 (Frozen Autumn, Static Movement, Jarre, Duran) | VA | VK Ringmod; B: BP 6 dB, Chorus III | Osz. 1/2, RING, PW-KREUZ, Filtermodus, Cutoff, Res, CHORUS I/II/III, Stick X/Y | **A (vorgezogen, Xanders Frage)** |
| **ZUFALLS-VIER** | Jupiter-4/8 | 1/3 | VA | B: Arp ZUFALL | VCO + Sub, Kreuz-Mod, LP 12/24, HP, ARP-Modus, Chorus | B |
| **DCO-CHOR** | Juno-6/60/106 | 2/0 | VA | B: HPF-Stufen | DCO Säge/Puls/Sub/Rauschen, PWM, HPF 0–3, LP, ADSR, CHORUS I/II | A (HPF in B) |
| **STREICHKISTE** | Eminent 310/Solina/Performer | 2/2 | VA | B: Phaser | Register Streicher/Orgel, Ensemble, PHASER Rate/Tiefe, Attack/Release | B |
| **PRESET-BOX** | Mini Pops/CR-78/KR-55/Farfisa | 4/4 | Drums ev3 | B: Muster-Layer | Muster A + Muster B, Tempo, Klang je Instrument (hölzern ↔ hell) | A (Layer in B) |
| **BROTKASTEN** | C64 SID | 1/0 | VA | VK Ringmod/Crusher; B: Kombiwellen | Welle(n), PW, SYNC, RING, Filter LP/BP/HP 12, Arp-Treppe | B |
| **GLAS** | PPG Wave | 1/3 | Tabelle (V8a) | C: 8 Bit | Tabelle, Position, Hk. → Position, STUFEN/GLATT, 8 BIT, Filter 24 | C |
| **VIERER-VEKTOR** | Kawai K1 (K4) | 0/1 | Additiv (V9a) | C: Hk. je Quelle | 4 Quellen, XY-Stick, Filter AUS/2-Pol | C |
| **ZWEI-PAAR-FM** | Korg DS-8 | 0/1 | FM6 | D: Filter nach FM | SPECTRUM, TIMBRE, Timbre-Hk., Filter, Hk. | D |
| **KÖRNUNG-8** | Emulator/Fairlight-Charakter | 6/2 | jede | D: KÖRNUNG | Bits, Rate, Companding, LP 24, Loop | D |
| **ZWEIPOL** | Oberheim OB-X/SEM | 1/4 | VA | VK SVF 12 | SVF-Blende LP↔Notch↔HP, Verstimmung, Spread | A |
| **SCHREI** | MS-20 | 2/1 (Korg-Mono) | VA | 2. Filter + Korg35 | HP-Cutoff/Res → LP-Cutoff/Res, Ringmod | später |

**Klänge je Vorlage:** Die vorhandenen Rezepte werden umgehängt (N13, N16, N31, N36, N57–N62, A.1 #5/#12/#13/#26–#30/#45; R7: K1–K4, D1–D3, J1–J3, T1–T3). Neue Rezepte sind nur nötig für NEBEL-8 (Cold-Wave-Satz: Bass, Glas-Keys, Fläche, Arp; anknüpfend an N28–N30) und VIERER-VEKTOR.

---

## 6. Empfohlene Bau-Reihenfolge

Begründung je Stufe: Abhängigkeiten nach Nachtrag C.3 (intern), Nutzen = Zahl der Acts aus §2, Kosten = eigene Schätzung (UNBELEGT).

| Stufe | Inhalt | hängt an | Nutzen (Acts B/W) | Kosten |
|---|---|---|---|---|
| **A** | Vorlagen **KASKADE, FÜNFER, NEBEL-8, DCO-CHOR, ZWEIPOL, PRESET-BOX** als Frontplatte + Presets, ohne neuen DSP | VK (Gruppe 9), V10d | Moog 6, Prophet 3/3, Synthex 0/4, Juno 2, OB 1/4, Rhythmus 4/4 | ≈ 1 h je Vorlage + Frontplatten-Rahmen 1–1,5 P (Master-Briefing) |
| **B** | **„VK+“**: Phaser, Flanger, Arp ZUFALL, Juno-HPF, SID-Kombiwellen, Synthex-Feinheiten (BP 6 dB, Chorus III), Muster-Layer der Preset-Box → Vorlagen **ZUFALLS-VIER, STREICHKISTE, BROTKASTEN** | VK, V5d (Mod-Ziele, MOD-R1) | Jarre, Tomita, Duran, a-ha, The Midnight, Welle:Erdball, Static Movement/Frozen Autumn | ≈ 10–12 h |
| **C** | **GLAS** (8 Bit + eigene Tabellen), **VIERER-VEKTOR** (K1/K4) | V8a + N8a-01, V9a, VK SVF 12 | PPG 1/3, K1 0/1 | ≈ 3–4 h |
| **D** | **KÖRNUNG-8** + ANSCHLAG-Schicht (Sampler-/LinnDrum-Charakter), **ZWEI-PAAR-FM** (Filter nach FM) | VK-Bitcrusher, V0d/FM-Hüllkurven | Sampler 6/2 (Annäherung), Linn 3/2, FM 2/3 | ≈ 6–8 h |
| **E** | **Eigene Samples** (Datei/Mikrofon), Vocoder, später Sprache | VS0/VS1 (Mikrofon), §18 | Sampler 6/2, Mellotron 2/1, Vocoder 1 | groß; eigenes Paket |
| – | SCHREI (MS-20), Virus-/Nord-/JD-/M1-Vorlagen | – | ≤ 2 B | nicht planen |

**Warum NEBEL-8 schon in Stufe A?**
- Xander fragt ausdrücklich nach dem Gerät von The Frozen Autumn.
- Der Synthex ist das einzige Gerät, das bei **beiden** Cold-Wave-Projekten von Merletto genannt wird.
- Seine Bauweise ist mit VA + VK fast ganz abbildbar.
- Status bleibt WAHRSCHEINLICH; das ⓘ sagt das auch so.

**Warum Sampling nicht zuerst?**
- Sampling ist die größte Abhängigkeit, aber ein großes Paket (Datei-/Mikrofon-Weg, Speicher, Recht).
- Mikrofon ist Xanders P3 und steht in VS.
- KÖRNUNG (Stufe D) holt einen Teil des Charakters ohne Samples.
- **Empfehlung an den Dirigenten:** Den Sample-Import zusammen mit P3 (Mikrofon) planen, nicht getrennt (UNBELEGT, Einschätzung).

**Was nicht zuerst kommt, obwohl Xander es nannte:** Virus, Nord Lead, JD-800, M1, Microwave. Keiner der 20 Acts ist an diese Geräte belegt gebunden. Ihre Merkmale stecken schon in VK (Osz.-FM, Ringmod, Sättigung) und in den Presets N55–N58.

---

## 7. Offene Punkte und Rückfragen

1. **Xander fragen:** War „LK sind“ der **Elka Synthex**? Oder hat er den K1 irgendwo gesehen (Video, Foto)? Mit einem Link ließe sich das prüfen.
2. **Lieber nachprüfen, wenn das Abrufen wieder geht:**
   - Equipboard-Seite von Merletto: welche Videos genau?
   - Fan-Seite ElectricZone (Synthex/PPG bei Static Movement)
   - Offizielle Biografie (R6: „Sequential“)
   - SOS „Classic Tracks: People Are People“ (Synclavier-Anteil)
   - Martyn-Ware-Podcast (System-100 auf „Dare“)
3. **And One, De/Vision, Agonoize, Sixth June, S.P.O.C.K:** Für Geräte bräuchte es Print-Interviews (Orkus, Sonic Seducer, Zillo, Keyboards). Die sind online nicht durchsuchbar. Vorschlag: Xander bzw. sein Kumpel kennt vielleicht Studio-Videos der Bands. Die nehmen wir als Hinweis (WAHRSCHEINLICH).
4. **Im App-Code prüfen** (intern, vor Stufe A):
   - Gibt es das Mod-Ziel „PW Osz. 1“?
   - Welche Sub-Formen gibt es?
   - Hat FM6 ein Filter?
   - Gibt es einen Arpeggiator in der Klang-Ebene?

---

## 8. Quellen (alle über Suchauszüge, nicht direkt abgerufen)

**The Frozen Autumn / Static Movement:** https://en.wikipedia.org/wiki/The_Frozen_Autumn · https://lostechoes.com/2002/12/01/the-frozen-autumn-interview/ · https://equipboard.com/pros/diego-merletto · https://equipboard.com/band/the-frozen-autumn · https://equipboard.com/items/korg-ds8 · https://equipboard.com/items/roland-jx-305 · https://equipboard.com/items/kawai-k4 · https://rocknerd.co.uk/2018/03/14/the-frozen-autumn-the-fellow-traveler-2017/ · https://www.idieyoudie.com/?p=6376 · https://www.last.fm/pl/music/Static+Movement/+wiki · https://www.depechemodeitalia.com/ez/the%20frozen%20autumn.htm · https://thefrozenautumn.com/biography

**Sixth June, And One, De/Vision, Agonoize, Welle:Erdball, Elegant Machinery, S.P.O.C.K:** https://www.wikipedia.org/wiki/Sixth_June · https://diesein.bandcamp.com/music · https://www.masterclass.com/articles/coldwave-music-guide · https://microgenremusic.com/articles/what-is-minimal-wave/ · https://en.wikipedia.org/wiki/And_One · https://ironcharts.com/musician/steve-naghavi · https://en.wikipedia.org/wiki/Popgefahr · https://www.releasemagazine.net/three-decades-of-devision-the-dark-interview · https://en.wikipedia.org/wiki/Agonoize · https://www.masterclass.com/articles/aggrotech-music-guide · https://festt.io/en/genres/aggrotech · https://en.wikipedia.org/wiki/Welle:Erdball · https://sceneworld.org/blog/2020/01/22/podcast-episode-82-welleerdball · https://www.electricityclub.co.uk/elegant-machinery-interview/ · https://www.discogs.com/release/153510-Elegant-Machinery-A-Decade-Of-Thoughts · https://en.wikipedia.org/wiki/S.P.O.C.K · https://www.electricityclub.co.uk/s-p-o-c-k-interview/

**Depeche Mode:** https://www.soundonsound.com/people/vince-clarke-electronic-music-pioneer · https://www.vintagedigital.com.au/classic-track/speak-and-spell · https://www.thomann.de/blog/en/?p=448818 · https://equipboard.com/albums/depeche-mode-construction-time-again · https://orkus1.com/en/depeche-mode-40-years-ago-construction-time-again-part-1/ · https://www.musicradar.com/news/how-depeche-mode-recorded-their-very-own-Berlin-trilogy · https://en.wikipedia.org/wiki/Construction_Time_Again · https://www.soundonsound.com/techniques/classic-tracks-depeche-mode-people-are-people · https://api.reverb.com/news/the-synth-sounds-of-depeche-modes-enjoy-the-silence

**a-ha, Alphaville, OMD, Human League, New Order:** https://www.vintagedigital.com.au/?p=167494 · https://www.songfacts.com/facts/a-ha/take-on-me/1000 · https://Www.wikipedia.org/wiki/Take_On_Me · https://equipboard.com/albums/a-ha-hunting-high-and-low · https://americansongwriter.com/3-songs-that-use-the-juno-60-the-synthesizer-that-made-80s-pop-music-sound-magical/ · https://www.songwritingmagazine.co.uk/?p=44703 · https://www.tip-berlin.de/konzerte-party/tontraeger/alphaville-remaster-interview-80er-in-berlin/ · https://www.classicpopmag.com/?p=12154 · https://equipboard.com/pros/bernhard-lloyd · https://en.wikipedia.org/wiki/Forever_Young_(Alphaville_song) · https://www.synthhistory.com/post/three-questions-with-orchestral-manoeuvres-in-the-dark-omd · https://electricityclub.co.uk/?p=4500 · https://www.omd-messages.co.uk/architecture-morality-interview-paul-humphreys · https://www.electronicsound.co.uk/features/landmarks/orchestral-manoeuvres-in-the-dark-enola-gay · https://www.udiscovermusic.com/stories/omd-junk-culture-album/ · https://wikipedia.com/wiki/OB-X · https://www.vintagedigital.com.au/classic-track/dont-you-want-me · https://en.wikipedia.org/wiki/Dare_(album) · https://www.kvraudio.com/forum/viewtopic.php?p=8483623 · https://daily.redbullmusicacademy.com/2013/11/key-tracks-martyn-ware-being-boiled · https://www.bonedo.de/artikel/human-league-being-boiled-und-das-roland-system-100 · https://www.gearnews.com/the-sheffield-scene-how-to-sound-like-the-human-league · https://stereogum.com/2086575/the-number-ones-the-human-leagues-dont-you-want-me/columns/the-number-ones · https://en.wikipedia.org/wiki/Blue_Monday_(New_Order_song) · https://www.musicradar.com/news/blue-monday-synth-sound · https://www.neworderonline.com/community/forums/digital-republic/24632-new-order-s-keyboards · https://hifinews.com/content/new-order-low-life-production-notes · https://equipboard.com/pros/stephen-morris · https://www.vintagesynth.com/oberheim/ob-xa

**Duran Duran, Jarre, Tomita, Kraftwerk, The Midnight:** https://www.roland.com/uk/blog/nick-rhodes-on-the-roland-synths-that-drive-duran-duran/ · https://en.wikipedia.org/wiki/Rio_(song) · https://en.wikipedia.org/wiki/Planet_Earth_(Duran_Duran_song) · https://www.musicradar.com/news/nick-rhodes-top-5-synths · https://www.muzines.co.uk/articles/concert-review/3274 · https://ultimateclassicrock.com/duran-duran-save-a-prayer/ · https://musicradar.com/news/jean-michel-jarre-best-synth-sound · https://en.wikipedia.org/wiki/Equinoxe · https://hifinews.com/content/jean-michel-jarre-equinoxe-production-notes · https://en.wikipedia.org/wiki/Eminent_310_Unique · https://hollowsun.com/nostalgia/contributors/minipops/index.html · https://en.wikipedia.org/wiki/Zoolook · https://www.muzines.co.uk/articles/the-french-connection/3774 · https://wikipedia.com/wiki/Elka_Synthex · https://www.sonicstate.com/news/2016/02/17/worlds-first-digital-synth-revived-for-reason/ · https://en.wikipedia.org/wiki/Snowflakes_Are_Dancing · https://en.wikipedia.org/wiki/Isao_Tomita · https://www.synthtopia.com/content/2021/05/14/recreating-isao-tomitas-iconic-whistle-patch/ · https://hifinews.com/content/kraftwerk-autobahn-production-notes · https://en.wikipedia.org/wiki/Autobahn_(song) · https://mixdownmag.com.au/features/gear-rundown-kraftwerk-autobahn/ · https://en.wikipedia.org/wiki/Trans-Europe_Express_(album) · https://sdiy.info/wiki/Synthesizerstudio_Bonn · https://en.wikipedia.org/wiki/Kling_Klang_Studio · https://gearspace.com/threads/kraftwerk.32874/ · https://www.musicradar.com/news/kraftwerk-the-model · https://www.synthtopia.com/content/2025/09/14/secrets-of-kraftwerks-vocoder-the-sennheiser-vsm201/ · https://notebook.zoeblade.com/Language_Translator.html · https://notebook.zoeblade.com/Kraftwerk.html · https://en.wikipedia.org/wiki/Computer_World_(tour) · https://www.gearnews.com/kraftwerk-synths-sequencers-sounds/ · https://www.bonedo.de/artikel/kraftwerk-in-der-rocknroll-hall-of-fame-die-wichtigsten-synths-und-sounds · https://www.musicradar.com/news/the-midnight-tim-mcewan-synths-plugins-interview · https://musictech.com/features/interviews/the-midnight-interview-syndicate/ · https://en.wikipedia.org/wiki/The_Midnight

**Geräte-Steckbriefe:** https://en.wikipedia.org/wiki/Kawai_K1 · https://www.muzines.co.uk/articles/kawai-k1-k1m/1051 · https://en.wikipedia.org/wiki/Kawai_K4 · https://en.wikipedia.org/wiki/Korg_DS-8 · https://www.muzines.co.uk/articles/korg-ds8/2065 · https://www.kvraudio.com/forum/viewtopic.php?p=3634139 · https://en.wikipedia.org/wiki/Roland_JX-305 · https://en.wikipedia.org/wiki/Roland_Juno-60 · https://support.roland.com/hc/en-us/articles/201955179-Juno-60-Technical-Specifications · https://en.wikipedia.org/wiki/Roland_Jupiter-8 · https://en.wikipedia.org/wiki/Roland_Jupiter-4 · https://www.pmtonline.co.uk/sequential-prophet-5-analog-poly-synth · https://greatsynthesizers.com/en/review/ppg-wave-2-2-wave-2-3-the-one-and-only/ · https://musictech.com/features/opinion-analysis/vintage-rewind-ppg-wave-2/ · https://en.wikipedia.org/wiki/Palm_Products_GmbH · https://en.wikipedia.org/wiki/E-mu_Emulator · https://www.perfectcircuit.com/signal/fairlight-cmi-history · https://musictech.com/reviews/studio-icons-fairlight-cmi/ · https://en.wikipedia.org/wiki/Roland_TR-909 · https://www.attackmagazine.com/features/interview/atsushi-hoshiai-the-man-behind-the-tr-909/ · https://equipboard.com/posts/roland-tr-808-guide · https://en.wikipedia.org/wiki/Linn_LM-1 · https://hollowsun.com/nostalgia/vintage/linn_lm1/index.html · https://www.smemmusic.ch/de/node/5370 · https://www.kraftmusic.com/moog-minimoog-model-d-analog-synthesizer.html · https://en.wikipedia.org/wiki/Texas_Instruments_LPC_Speech_Chips · https://languagelog.ldc.upenn.edu/nll/?p=41839 · https://www.waitingforfriday.com/?p=661 · https://en.wikipedia.com/wiki/SID6581 · https://www.soundonsound.com/music-business/korg-ms-series · https://greatsynthesizers.com/en/review/korg-ms-20-the-semi-modular-revolution/ · https://citymusic.com.sg/?p=13642 · https://www.smemmusic.ch/fr/node/330 · https://cherryaudio.com/products/elka-x · https://en.wikipedia.org/wiki/Access_Virus · https://www.nordkeyboards.com/legacy-products/nord-lead/specifications/ · https://en.wikipedia.org/wiki/Nord_Lead · https://en.wikipedia.org/wiki/Roland_JD-800 · https://www.vintagesynth.com/waldorf/microwave · https://en.wikipedia.org/wiki/Korg_M1 · https://en.wikipedia.org/wiki/Roland_SH-101 · https://support.roland.com/hc/en-us/articles/201921519-SH-101-Technical-Specifications · https://musictech.com/news/gear/xils-lab-x201

**Intern:** `v3-ideen/dirigent-spec-v3.md` §1.1, §9–§12, §18 · `v3-ideen/dirigent-spec-v3-nachtrag-1.md` A.10, A.11, A.12, C.3 · `v3-ideen/SYNQUENZER-MASTER-BRIEFING.md` Teil 11 und A8 · `v3-ideen/r6/bibliothek-recherche.md` §1, Tab. A–G, §10 · `v3-ideen/r7/vorbild-helden.md` · `v3-ideen/r7/vorbild-coldwave2.md` · `v3-ideen/r8/V0a-copy.html` (`WT_TABLES`)

---

## 9. Review-Befunde (17.10.2026, nach Abgabe)

Geprüft über Suchauszüge (direkter Abruf weiter gesperrt: WebFetch DNS-Fehler, curl 403 am Proxy).

| Stelle | Befund | Ergebnis |
|---|---|---|
| §3.22 Nord Lead | „Sync erst mit dem NL2“ falsch: schon der Nord Lead (1995) synchronisiert Osz. 2 hart auf Osz. 1 und hat lineare FM Osz. 2 → Osz. 1; neu im NL2 sind Ringmodulator und Sync von Osz. 1 mit dem Rauschgenerator | **angenommen**, Zeile ersetzt, Herstellerspezifikation als Quelle ergänzt (BELEGT: https://www.nordkeyboards.com/legacy-products/nord-lead/specifications/ · https://en.wikipedia.org/wiki/Nord_Lead) |
| §1.14 „Being Boiled“ | BELEGT ohne URL | **angenommen**, RBMA- und Bonedo-URL eingetragen, System-100 als Gerät von Ian Craig Marsh und einziger Sequenzer ergänzt (BELEGT: https://daily.redbullmusicacademy.com/2013/11/key-tracks-martyn-ware-being-boiled; Bonedo belegt das Video mit Ware und Original-Patchbögen, nicht den Besitzer: https://www.bonedo.de/artikel/human-league-being-boiled-und-das-roland-system-100) |
| §1.19 Synthanorma → Minimoog | Album-Artikel belegt nur den Sequenzer, nicht die Minimoog-Steuerung | **angenommen**, aufgeteilt: Sequenzer BELEGT, „steuert den Minimoog“ WAHRSCHEINLICH; zusätzlich zum SDIY-Wiki den Wikipedia-Artikel Kling Klang Studio genannt (sagt laut Suchauszug dasselbe, Einzelbeleg nicht geprüft) und die uneinige Schrittzahl (16/32) vermerkt (https://sdiy.info/wiki/Synthesizerstudio_Bonn · https://en.wikipedia.org/wiki/Kling_Klang_Studio · https://gearspace.com/threads/kraftwerk.32874/) |
| §1.19 Computer-World-Tour | Prophet-5 nicht im Tour-Artikel | **angenommen**, aufgeteilt: Minimoog/Polymoog/Chor-Tastatur BELEGT, Prophet-5 WAHRSCHEINLICH. Folge: Prophet-Familie in §2 jetzt 3 B / 3 W (Kraftwerk wandert in W), Rang 5 statt 4; §0 Punkt 2, §3.4, §5 (FÜNFER) und §6 (Stufe A) angepasst |

Abgelehnt: keiner.
