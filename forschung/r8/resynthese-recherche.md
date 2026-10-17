# Resynthese: Stand der Technik und Machbarkeit am iPhone (R8)

Stand 17.10.2026 · Anlass: Xanders Nachtrag in `fragen-xander-9.md` („Frequenzanalysen lesen, Löwengebrüll, Saxophon nachbilden“) und `fragen-xander-5.md` H8 (Klavier, Löwe, Sax, sphärisch, böse, sprechend). Bezug: Spec v3 §11 (V9a–V9c), Nachtrag 1 A.11, Entscheidung E8 / E3-22 (allgemeine Resynthese bisher ausgeschlossen).
`r7/stimme.md` gibt es noch nicht (am 17.10. nicht vorhanden). Abschnitt 7 nennt deshalb nur die Schnittstelle zur Mikrofon-Planung.

**Kennzeichen:** **BELEGT** = durch die genannte Quelle gedeckt (meist Suchauszug; „(SE)“ heißt: nur aus dem Suchauszug, Volltext nicht gelesen) · **WAHRSCHEINLICH** = eigene Folgerung aus belegten Fakten oder aus der Messung · **UNBELEGT** = eigene Kenntnis oder Schätzung, ungeprüft · **gemessen** = eigene Messung in Node 22 auf einer Xeon-VM mit 2,1 GHz, **nie am iPhone**.

---

## 0. Kurzantwort an Xander (Vorschlag, kurz und knapp)

> Ja, daran habe ich gedacht. Bisher war nur „Teiltöne einfangen“ aus **einer** Note geplant: ein festes Spektrum mit Abklingzeiten. Echte Resynthese geht weiter. Sie liest den **ganzen zeitlichen Verlauf** aus der Frequenzanalyse: die Tonhöhe, die Lautstärke jedes Teiltons und das Rauschen in Bändern, Bild für Bild (100 Bilder pro Sekunde). Daraus baut sie den Klang wieder auf. Das ist Stand der Technik (Prinzip „Sinus + Rauschen + Anschlag“, wie in Alchemy und bei der Synclavier) und läuft am iPhone.
> **Saxophon** wird sehr gut. **Löwengebrüll** wird gut, aber etwas „synthetischer“, weil ein Brüllen zum großen Teil aus chaotischem Rauschen besteht. Danach kannst du dehnen, transponieren (der Vokal bleibt dabei erhalten), zwischen zwei Aufnahmen morphen und die Teiltöne malen.
> Dafür müssen wir E8 aufheben. Ich schlage zwei zusätzliche Pakete vor (V9d Analyse, V9e Spieler und Editor).

---

## 1. Grundbegriffe

| Baustein | Was er abbildet | Typische Technik |
|---|---|---|
| **Harmonische Teiltöne** | Vielfache von f₀ (Sax, Stimme, Streicher) | Spitzen im Kurzzeit-Spektrum (STFT) nahe k·f₀ suchen, je Rahmen Pegel und Frequenz |
| **Unharmonische Teiltöne** | Glocke, Klavier-Streckung, Metall | freie Spurverfolgung nach McAulay-Quatieri (MQ): Spitzen von Rahmen zu Rahmen verbinden, Spuren „geboren“ und „gestorben“ |
| **Rauschanteil** | Atem, Fauchen, Zischlaute, chaotische Stimmlippen | Rest nach Abzug der Teiltöne, als Hüllkurve je Band (z. B. 25 kritische Bänder) |
| **Formanten** | ortsfeste Resonanzen (Vokale, Sax-Korpus) | geglättete spektrale Hüllkurve, getrennt von den Teiltönen gespeichert |
| **Transienten** | Anschlag, Knack, Konsonanten | eigenes Modell (Verma/Meng) oder ein kurzes Original-Schnipsel („Hybrid Attack“) |

---

## 2. Verfahren und Produkte im Vergleich

### 2.1 Forschungsverfahren

**McAulay-Quatieri (1986), Sinusmodell**
- **Modell:** Summe von Sinusschwingungen mit zeitvariablem Pegel, Frequenz und Phase. Gewonnen werden sie durch Spitzensuche in der STFT, mit Frequenz-Abgleich und „Geburt/Tod“ von Spuren. Die Phase wird kubisch interpoliert. Für Sprache „perceptually indistinguishable“. — **BELEGT (SE)** [MIT LL](https://www.ll.mit.edu/r-d/publications/speech-analysissynthesis-based-sinusoidal-representation), [DTIC PDF](https://apps.dtic.mil/sti/pdfs/ADA169740.pdf), [Patent US4885790A](https://patents.google.com/patent/US4885790A).
- **Schwäche:** In schnell wechselnden Bereichen, etwa an Übergängen stimmhaft/stimmlos, ändern sich Zahl und Lage der Spitzen stark. — **BELEGT (SE)**, ebd. (Patentzusammenfassung).
- **Folge für Rauschen:** Das Modell zerfällt dort in viele kurze Spuren. **gemessen:** Ein Mischsignal mit 30 % Rauschen ergibt in 5 s 6 000–11 000 Spuren (§4.2).

**Spectral Modeling Synthesis, SMS (Serra und Smith 1990)**
- **Modell:** deterministischer Teil (Sinus-Spuren mit stückweise linearen Hüllkurven) plus stochastischer Teil (Rest = weißes Rauschen durch ein zeitvariables Filter). Die Spitzen werden abgezogen, der Rauschboden wird als Filterhüllkurve modelliert. — **BELEGT (SE)** [UPF-Repositorium](https://repositori.upf.edu/items/544323f8-f0d0-4ee6-8824-8a9bac100502), [CMJ-PDF](https://audiolabs-erlangen.de/content/05_fau/professor/00_mueller/02_teaching/2024s_sarntal/02_group_SYNTH/1990_SerraS_SpectralModelingSynthesis_CMJ.pdf), Werkzeuge: [sms-tools](https://www.upf.edu/web/mtg/sms-tools).
- **Erweiterung um Transienten (Verma und Meng, TMS, CMJ 24(2) 2000):** Sinus-Modellierung im DCT-Bereich, also im Frequenzbereich, für Transienten. Beim Dehnen bleiben Tonhöhe, Flanken und Rauschcharakter jeweils getrennt erhalten. — **BELEGT (SE)** [DAFx 1998](https://www.dafx.de/paper-archive/1998/VER34.PS.pdf), [JOS/CCRMA](https://ccrma.stanford.edu/~jos/mus423h/Sinusoidal_Transient_Modeling_Using.html), [arXiv 2309.06649](https://arxiv.org/pdf/2309.06649).
- **Löwe gegen Sax:** Das Sax ist fast vollständig harmonisch; der Rest ist Atem. Das Brüllen hat einen großen Rauschanteil. Für beide ist SMS das passende Grundmodell. — **WAHRSCHEINLICH**.
- **Bearbeiten:** Dehnen, Transponieren und Morphen getrennt für Teiltöne und Rauschen. — **BELEGT (SE)** (TMS-Abstract).
- **CPU:** Synthese mit Oszillatorbank oder inverser FFT, siehe §4.

**ATS (Pampin)**
- **Modell:** Teiltöne, psychoakustisch gestützt (SMR); der Rest wird als **25 kritische Bänder** modelliert. Die Rauschenergie wird teils auf benachbarte Teiltöne als „Schmalband-Rauschen“ verteilt. — **BELEGT (SE)** [ATS-Theorie](https://dxarts.washington.edu/sites/dxarts/files/documents/wiki/ats_theory.pdf), [Csound ATSsinnoi](https://csound.com/manual/opcodes/ATSsinnoi/).
- **Relevanz für SYNQUENZER:** Vorbild für 24–25 Rauschbänder.

**Loris (Fitz und Haken), „bandwidth-enhanced“ Teiltöne**
- **Modell:** Teiltöne aus einer reassigned Zeit-Frequenz-Fläche (feinere Auflösung als klassisch). Jeder Teilton trägt Sinus- **und** Rauschenergie („Bandbreite“). — **BELEGT (SE)** [CERL Loris](https://www.cerlsoundgroup.org/Loris), [ICMC 95](https://www.cerlsoundgroup.org/Loris/ICMC95/BandwidthOscillators.html), [Dissertation Fitz 1999](https://www.ideals.illinois.edu/items/82588).
- **Morphing:** Stärke von Loris, siehe „Cell-Utes and Flutter-Tongued Cats“, CMJ 2003. — **BELEGT (SE)** [Projekt MUSE](https://muse.jhu.edu/article/47855/pdf).
- **Löwe:** Rauschen „hängt“ an den Teiltönen, das klingt rauer als reiner Sinus. Breitbandiges Fauchen ohne Teiltöne bleibt aber schwierig. — **WAHRSCHEINLICH**.
- **CPU:** je Teilton ein Rauschmodulator zusätzlich. — **WAHRSCHEINLICH**.

**SPEAR (Klingbeil)**
- **Modell:** MQ-Variante; nur Sinus-Spuren, kein Rauschmodell. Editor für einzelne Teiltöne (Auswahl nach Zeit, Frequenz und Pegel; dehnen, transponieren). Spielt „hunderte Teiltöne in Echtzeit“; Format SDIF 1TRC. — **BELEGT (SE)** [klingbeil.com/spear](https://www.klingbeil.com/spear/), [Dissertation](https://www.klingbeil.com/data/Klingbeil_Dissertation_web.pdf).
- **Folge:** Ein Löwe wird in SPEAR zu einem „Zwitscher“-Teppich aus tausenden Kurzspuren. Das Sax gelingt gut. — **WAHRSCHEINLICH** (deckt sich mit §4.2).

**Phasenvokoder**
- **Modell:** STFT-Bins mit Betrag und Phase. Das Original lässt sich fast exakt zurückgewinnen, Rauschen inklusive.
- **Dehnen:** erzeugt „Phasiness“ (Hall, Präsenzverlust). Gegenmittel ist Phasen-Verriegelung (Laroche und Dolson 1999); Transienten bleiben ein Problem. — **BELEGT (SE)** [Laroche/Dolson 1999](https://www.ee.columbia.edu/~dpwe/papers/LaroD99-pvoc.pdf), [„Phase Vocoder Done Right“](https://arxiv.org/pdf/2202.07382).
- **Bearbeiten:** kaum musikalisch, weil es keine Teiltöne als Objekte gibt. — **WAHRSCHEINLICH**.
- **CPU:** pro Stimme eine IFFT je Hop. **Speicher:** groß (alle Bins).

**DDSP (Engel u. a., ICLR 2020)**
- **Modell:** differenzierbarer Harmonisch-plus-Rauschen-Synth (Sinus bei k·f₀ plus gefiltertes Rauschen). Ein neuronales Netz liefert aus f₀ und Lautheit die Teilton-Pegel und die Rausch-Filter. — **BELEGT (SE)** [arXiv 2001.04643](https://ar5iv.labs.arxiv.org/html/2001.04643), [Magenta DDSP](https://magenta.tensorflow.org/ddsp), [GitHub](https://github.com/magenta/ddsp).
- **Timbre-Transfer:** Die Melodie eines Instruments (f₀ + Lautheit) steuert die Klangfarbe eines anderen.
- **Tone Transfer:** lief im Browser (TF.js, Tonhöhe mit SPICE). Instrumente: **Saxophon**, Flöte, Violine, Trompete. Für ein neues Instrument reichen etwa 15 min Training mit dem Ziel-Sax. — **BELEGT (SE)** [Google Research](https://research.google/pubs/tone-transfer-in-browser-interactive-neural-audio-synthesis/), [TF-Blog](https://blog.tensorflow.org/2020/08/creating-sounds-of-india-with-tensorflow.html), [Magenta Tone Transfer](https://magenta.tensorflow.org/tone-transfer).
- **iOS:** Laut einer Drittquelle war Tone Transfer dort nicht unterstützt. — **UNBELEGT/veraltet?** [audiocipher](https://www.audiocipher.com/post/tone-transfer).
- **Schwäche:** Klänge mit wenig harmonischem Anteil erzeugen harmonische Artefakte. — **BELEGT (SE)** ([DAFx24 paper 51](https://dafx.de/paper-archive/2024/papers/DAFx24_paper_51.pdf), [arXiv 2407.04547](https://arxiv.org/pdf/2407.04547)).
- **Löwe:** schlecht (nicht harmonisch genug). **Sax:** sehr gut.
- **Training:** braucht Desktop/GPU (Colab). Ein Laie kann das am iPhone nicht. — **WAHRSCHEINLICH**.

**Neuronale Codecs und Autoencoder (nur Ausblick)**
- **EnCodec (Meta):** RVQ-Codec, schneller als Echtzeit. — **BELEGT (SE)** [HF-Doku](https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/encodec.md).
- **Descript Audio Codec:** 44,1 kHz bei 8 kbps. — **BELEGT (SE)** [PyPI](https://pypi.org/project/descript-audio-codec).
- **RAVE (IRCAM):** Echtzeit, sogar auf dem Raspberry Pi 4. — **BELEGT (SE)** [PyPI acids-rave](https://pypi.org/project/acids-rave).
- **Grenzen:** Alle brauchen trainierte Modelle (MB-Größe) und eine WASM- oder WebGPU-Laufzeit; Bearbeiten geht nur im Latenzraum, nicht pro Teilton.
- **Bewertung:** Für eine 3-MB-Einzeldatei nicht geeignet; frühestens als optionaler Online-Dienst. — **WAHRSCHEINLICH**.

### 2.2 Produkte

**Synclavier (NED, 1980er)**
- **Modell:** „Timbre Frames“: Schnappschüsse des Teiltonspektrums, zwischen denen übergeblendet wird. Resynthese mit bis zu 128 Harmonischen, oft reichen 20–30 Frames. — **BELEGT (SE)** [Synclavier-Artikel muzines](https://www.muzines.co.uk/articles/the-synclavier-story/131), [Resynthesis Quickstart](https://www.synclavier.com/Downloads/Resynthesis-Quickstart.pdf).
- **Hybrid Attack:** Der Original-Anschlag wird beigemischt. — **BELEGT (SE)** (Quickstart).
- **Löwe/Sax:** Rauschen nur über den Hybrid-Anschlag, nicht im Halteteil. — **WAHRSCHEINLICH**.
- **Bearbeiten:** je Frame Zeit, Überblendung, Pegel, Tonhöhe. Arturia V: 50 → 100 Frames. — **BELEGT (SE)** [audiotechnology](https://www.audiotechnology.com/reviews/arturia-v-collection-synclavier-v2).

**Kawai K5000 (1996)**
- **Modell:** 128 Harmonische (2 × 64) mit loopbaren 4-Stufen-Hüllkurven je Harmonischer und ein 128-Band-Formantfilter. — **BELEGT (SE)** [SOS K5000R/S](https://www.soundonsound.com/reviews/kawai-k5000r-k5000s), [SOS](https://www.soundonsound.com/node/4926125).
- **Rauschen:** **PCM-Anschlags-Samples** (266 PCM-Quellen, u. a. Atem und Naturgeräusche). — **BELEGT (SE)** [SOS K5000W](https://www.soundonsound.com/reviews/kawai-k5000w).
- **Resynthese:** keine aus Audio am Gerät. — **UNBELEGT** (eK).
- **Löwe:** nur mit PCM-Hilfe.

**Hartmann Neuron (2001–2005)**
- **Modell:** neuronales Netz (Prosoniq, Bernsee) erzeugt „Modelle“ aus Samples; ModelMaker am PC. Zwei Resynatoren mit je 6 Scape- (Anregung) und 6 Sphere-Parametern (Körper); Blender morpht zwischen ihnen. — **BELEGT (SE)** [Wikipedia](https://en.wikipedia.org/wiki/Hartmann_Neuron), [SOS-Test](https://www.soundonsound.com/reviews/hartmann-neuron), [Sonicstate NAMM05](https://sonicstate.com/news/2005/01/29/wnamm05-hartmann-neuron-vs-on-show/), [Bernsee-Blog](https://blogs.zynaptiq.com/bernsee/tag/neuron/).
- **Verfahren:** proprietär, nicht dokumentiert. — **UNBELEGT**.
- **Lehre für SYNQUENZER:** wenige Makros mit Bedeutung (Anregung ↔ Körper) statt hunderter Teiltöne.

**Camel Audio / Apple Alchemy**
- **Analyse-Modi:** Additive (Einzelnoten, stark harmonisch), Spectral (Akkorde, komplexe Signale) und Add+Spec. Zusätzlich gibt es eine **Formant-Analyse**, die das „Analyzed formant filter“ füllt. Apple empfiehlt oft die Kombination; der Standard ist Spectral + Formant. — **BELEGT (SE)** [Apple Logic Pro Guide](https://support.apple.com/ar-qa/guide/logicpro/lgsi440c233a/mac), [Morphing-Whitepaper](https://www.apple.com/logic-pro/resources/docs/elemental_morphing_in_alchemy_0818.pdf).
- **Rauschen:** Sinus **und Rauschen** getrennt. Rauschen ist für perkussive Anteile wie den Klavieranschlag oder Zischlaute gedacht. — **BELEGT (SE)** [Apple iPad Guide](https://support.apple.com/en-us/guide/logicpro-ipad/spectral-synthesis-lpip258b5229/1.0/ipados/16.0).
- **Bearbeiten:** vier Quellen mit Morph und Überblendung; Teiltöne einzeln editierbar (Pegel, Tonhöhe, Pan, Phase). — **BELEGT (SE)** [MusicRadar](https://www.musicradar.com/reviews/tech/camel-audio-alchemy-198890), [SOS](https://www.soundonsound.com/reviews/camel-audio-alchemy).
- **„600 Teiltöne“:** nur in einer Drittquelle. — **UNBELEGT** [audeobox](https://www.audeobox.com/learn/logic-pro/alchemy-synth-tutorial/).
- **Bedeutung:** der engste Vorbild-Fall für SYNQUENZER.

**Image-Line Harmor**
- **Modell:** bis 516 Teiltöne pro Note und Unisono-Stimme; Resynthese aus Audio **und** Bildern, „Sampler-Qualität“. — **BELEGT (SE)** [Harmor-Handbuch](https://www.image-line.com/fl-studio-learning/fl-studio-online-manual/html/plugins/Harmor.htm).
- **Rauschen:** wie Harmor es behandelt, ist **UNBELEGT**. Im Forum werden fehlende Höhen bei der Bild-Resynthese gemeldet. — **BELEGT (SE)** [Forum](https://forum.image-line.com/viewtopic.php?p=1228519).

**iZotope Iris (1/2)**
- **Modell:** keine parametrische Resynthese, sondern ein **spektral gefilterter Sampler** (aus RX abgeleitet). Lasso, Pinsel und „Zauberstab“ für harmonische Bereiche. — **BELEGT (SE)** [SOS Iris 2](https://www.soundonsound.com/reviews/izotope-iris-2), [MusicRadar](https://www.musicradar.com/reviews/tech/izotope-iris-546603).
- **Löwe:** originalgetreu, weil es das Sample selbst spielt. Kaum Tonhöhen-Spiel ohne Artefakte. — **WAHRSCHEINLICH**.

**Vital (Matt Tytel)**
- **Modell:** Audio → **Wavetable** (Modi „Pitch Splice“ und „Vocode“); Resynthese von Presets in neue Wavetables; Spectral Warp. — **BELEGT (SE)** [vital.audio](https://vital.audio/), [Vital-Forum](https://forum.vital.audio/t/graintable-synthesis/12335).
- **Grenze:** Je Frame bleibt nur ein periodisches Spektrum, Rauschen wird zu „Summen“. Der Löwe gerät schlecht, das Sax ordentlich. — **WAHRSCHEINLICH**.
- **Bezug:** entspricht dem V9a-Weg (Tabelle).

**Arturia Pigments (Harmonic Engine)**
- **Modell:** additiv, bis 512 Teiltöne; Gerade/Ungerade, Verhältnisse, Pegelabfall, Pan je Teilton; zwei morphbare Formantfilter. — **BELEGT (SE)** [Synthtopia](https://www.synthtopia.com/content/2021/04/20/arturia-pigments-3-adds-additive-synthesis-new-wavetables-more/), [SOS Pigments 3](https://www.soundonsound.com/reviews/arturia-pigments-3?amp).
- **Resynthese aus Audio:** nicht gefunden. — **UNBELEGT**.

**Native Instruments Razor**
- **Modell:** additiv, bis 320 Teiltöne (Reaktor, Errorsmith), 34-Band-Vocoder; „teilweise CPU-hungrig“. — **BELEGT (SE)** [NI](https://www.native-instruments.com/en/products/komplete/synths/razor/), [MusicRadar](https://www.musicradar.com/reviews/tech/native-instruments-razor-442988).
- **Resynthese aus Audio:** nicht gefunden. — **UNBELEGT**.

**Kodamo Mask1**
- **Modell:** **Bitmask**-Synthese (zerlegte Sinuswelle, bis 256 Masken), subtraktiv. **Kein** Resynthese-Verfahren. — **BELEGT (SE)** [Perfect Circuit](https://www.perfectcircuit.com/signal/kodamo-mask1-review), [Synth Anatomy](https://synthanatomy.com/2023/04/kodamo-mask1-first-look-polyphonic-bitmask-synthesizer.html), [bonedo](https://www.bonedo.de/artikel/kodamo-mask-1-digitaler-bitmask-synthesizer).
- **Relevanz:** gehört zu V8, nicht hierher.

### 2.3 Übersicht

| Verfahren/Produkt | harm. TT | unharm. TT | Rauschbänder | Formanten | Transienten | Löwe | Sax | Bearbeiten | CPU |
|---|---|---|---|---|---|---|---|---|---|
| MQ / SPEAR | ja | ja | – | – | – | schwach | gut | sehr gut | mittel–hoch |
| SMS (+TMS) | ja | ja | ja | über Hüllkurve | (TMS ja) | gut | sehr gut | sehr gut | mittel |
| ATS | ja | ja | 25 Bänder | – | – | gut | sehr gut | gut | mittel |
| Loris | ja | ja | in TT | – | – | mittel–gut | sehr gut | Morph sehr gut | mittel |
| Phasenvokoder | (Bins) | (Bins) | (Bins) | – | schwach | sehr treu | sehr treu | gering | mittel |
| DDSP | ja | – | ja | implizit | – | schwach | sehr gut | Timbre-Transfer | Netz + Synth |
| Synclavier | ja (128) | – | Hybrid-Anschlag | – | Sample | schwach | gut | Frames | Hardware |
| K5000 | ja (128) | – | PCM | 128-Band | PCM | schwach | gut | Hüllk. je TT | Hardware |
| Alchemy | ja | ja | ja | ja | über Rauschen | gut | sehr gut | Morph 4 Quellen | hoch |
| Harmor | ja (516) | ? | ? | ja | ? | ? | gut | Bild, Prisma | hoch |
| Iris | Sample | Sample | Sample | – | Sample | sehr treu | treu | spektrale Maske | mittel |
| Vital | Tabelle | – | – | Warp | – | schwach | ordentlich | Wavetable | gering |

Die Spalten Löwe/Sax/Bearbeiten/CPU sind Bewertungen: **WAHRSCHEINLICH**, aus den Belegen oben abgeleitet. Ein Hörvergleich fehlt.

---

## 3. Warum Löwe und Sax so verschieden sind

**Saxophon**
- Fast streng harmonisch, mit Atemrauschen und festen Korpus-Formanten. — **WAHRSCHEINLICH** (eK).
- Bestätigt dadurch, dass DDSP Saxophon als Paradefall nutzt. — **BELEGT (SE)** [TF-Blog](https://blog.tensorflow.org/2020/08/creating-sounds-of-india-with-tensorflow.html).
- **gemessen** (synthetisches Sax-Modell, §4.3): 99 % der Energie liegt in den Harmonischen-Bins.

**Löwe**
- Grundfrequenz beim Brüllen etwa **40–200 Hz**, vorhergesagt aus der Stimmlippenmechanik (quadratische, dehnbare Stimmlippen). — **BELEGT (SE)** [Klemuk u. a., PLoS ONE 2011](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3206895/), [ScienceDaily](https://www.sciencedaily.com/releases/2011/11/111102190012.htm).
- Tierstimmen enthalten oft **nichtlineare Phänomene**: Subharmonische, Biphonation, deterministisches Chaos. Klassische Spektralanalyse erfasst sie nicht vollständig. — **BELEGT (SE)** [Tokuda 2018, Anthropological Science](https://www.jstage.jst.go.jp/article/ase/126/1/126_171130/_article), [Zhang u. a. JASA 2006](https://www.surgery.medsch.ucla.edu/spl/papers/2006JASA09.pdf).
- **Dass beim Löwen konkret Chaos und Subharmonische auftreten, ist UNBELEGT.** Gefunden wurde keine löwenspezifische Messung, nur die allgemeine Tier-Literatur.

**Folgen für die Analyse**
- Bei f₀ = 40–60 Hz liegen die Harmonischen nur 40–60 Hz auseinander. Das Analysefenster muss mindestens etwa 3–4 Perioden lang sein, also 4096–8192 Samples bei 48 kHz (85–170 ms). Dann verschmiert aber die schnelle Tonhöhenbewegung. — **WAHRSCHEINLICH** (Standardregel, eK).
- **Lösung (wie SMS):** Fensterlänge an f₀ anpassen und den Rest **nicht** als Teiltöne erzwingen, sondern als Rauschbänder mit Hüllkurve speichern.
- **Rauheit:** Subharmonische f₀/2 und Rauheit (Jitter/AM) zusätzlich als Parameter. Das passt zu §11.2 (`rough`, `sub`).
- **Erwartung Löwe:** „glaubwürdiges, großes Brüllen“. Im Direktvergleich bleibt es etwas glatter als das Original. **Ein Hybrid-Anschlag** (die ersten 30–80 ms als Original-Schnipsel) hilft am meisten. Dafür gibt es Vorbilder: Synclavier Hybrid Attack, K5000 PCM. — **WAHRSCHEINLICH**, Hörtest nötig.

---

## 4. Machbarkeit am iPhone (Safari, AudioWorklet)

### 4.1 Oszillatorbank (gemessen)

- **Skript:** `r8/bench/osc-bench.mjs`, Ausgabe `r8/bench/osc-bench.out`.
- **Messaufbau:** Node 22, Xeon 2,1 GHz, 48 kHz, Block 128, 4 s, 8 Stimmen, bestes von 3 Läufen. Frequenz und Pegel werden **je Block** (2,67 ms) neu gesetzt, mit linearer Pegelrampe; das entspricht dem Abspielen einer Analyse.
- **Grenzen:** ohne Worklet-Overhead. Untergrenze, wie in Spec §15.

| Oszillator | 64 TT je Stimme | 128 TT | 256 TT | ns je Teilton-Sample |
|---|---|---|---|---|
| Sinustabelle 4096 + lineare Interpolation (Float64-Phase) | 1,82 % | 3,82 % | 7,26 % | 5,9–6,2 |
| **Sinustabelle 4096 ohne Interpolation (u32-Phase)** | **0,85 %** | **1,75 %** | **3,46 %** | **2,8** |
| Rekursiv: komplexer Rotor (renormiert je Block) | 1,00 % | 1,78 % | 3,80 % | 2,9–3,3 |
| Rekursiv: Resonator 2. Ordnung | 0,83 % | 1,63 % | 3,30 % | 2,7 |
| Rauschbänder (SVF-Bandpass, Pegel je Block): 8 / 16 / 24 Bänder | 0,24 / 0,40 / **0,61 %** | | | |

- **Stimmigkeit:** Die Zahlen passen zu R5 (`r5/h7810/additiv-bench.out`: 64 TT 1,06 % mit Hüllkurven-Logik).
- **Empfehlung:** u32-Tabelle ohne Interpolation. Sie ist am billigsten und robust bei Frequenzänderung je Block. Der Fehler einer 4096er-Tabelle ohne Interpolation liegt bei etwa −66 dB. — **WAHRSCHEINLICH** (Faustregel ≈ 6 dB je Bit Index, eK).
- **Resonator:** gleich schnell, aber bei gleitender Frequenz (Brüllen, Vibrato) wandert die Amplitude. Daher nur für feste Teiltöne. — **WAHRSCHEINLICH**.
- **Inverse-FFT-Synthese** (Teiltöne als Hauptkeulen ins Spektrum, IFFT 512, Hop 128; einfache Umsetzung): 64 TT 1,15 % · 256 TT 2,16 % · 1024 TT 3,06 % je Stimme. **gemessen**, `analyse-bench.out`.
  - Die Kosten wachsen kaum mit der Teiltonzahl, und das Rauschen lässt sich im selben Spektrum fast gratis mitmachen. Das ist der klassische SMS-Weg. — **WAHRSCHEINLICH**.
  - Erst ab etwa 150–200 Teiltönen billiger als die Bank; dafür mehr Latenz und mehr Code.

**Hochrechnung auf das iPhone**
- **Faktor:** Die Spec nimmt 2–2,5 × Xeon an (Spec §15.1, **UNBELEGT**).
- **Gegenargument:** Der A17 Pro kommt im Geekbench-6-Einkern-Wert nahe an einen Core i9-13900K heran (Faktor ≤ 1 wäre möglich). — **BELEGT (SE)** [Macworld](https://www.macworld.com/article/2069288/a17-pro-benchmarks-geekbench-cpu-gpu-performance.html), [Gigazine](https://www.gigazine.net/gsc_news/en/20230915-apple-a17-pro-single-core-performance).
- **Aber:** Safari-JIT im Worklet, Wärmedrosselung und ältere iPhones sind unbekannt. Deshalb bleibt die konservative Annahme 2–2,5.
- **Bekannte Probleme:** iOS-Safari hatte Knackser bei AudioWorklet (WebKit-Bug 2021/2023). — **BELEGT (SE)** [WebKit 226240](https://bugs.webkit.org/show_bug.cgi?id=226240), [WebKit 255461](https://bugs.webkit.org/show_bug.cgi?id=255461).
- **WASM-SIMD:** seit Safari 16.4 vorhanden, als spätere Option. — **BELEGT (SE)** [devclass](https://devclass.com/2023/02/24/no-longer-the-new-ie-apples-safari-16-4-to-bring-135-features/).

| Resynthese-Stimme | Xeon gemessen | iPhone geschätzt (×2–2,5) |
|---|---|---|
| 64 TT + 24 Rauschbänder | 1,46 % | 2,9–3,7 % |
| 128 TT + 24 Bänder | 2,36 % | 4,7–5,9 % |
| 256 TT + 24 Bänder | 4,07 % | 8,1–10,2 % |

**Leistbar je Stimme:**
- **Standard:** 64 Teiltöne + 24 Rauschbänder.
- **Profi:** 128 Teiltöne.
- **256 Teiltöne:** nur einstimmig (Löwe und Sax sind ohnehin einstimmig).
- **Abschalten leiser Teiltöne** (< −80 dB bzw. unter der Maskierungsschwelle) senkt die Last im Mittel deutlich. R5 hat beim Klavier 1,06 → 0,36 % gemessen. — **gemessen (R5)**.

### 4.2 Analysekosten (gemessen)

- **Skript:** `r8/bench/analyse-bench.mjs`.
- **Messaufbau:** STFT (Hann), Spitzensuche mit Parabel-Interpolation, MQ-Abgleich (±3 %, gierig), 24-Band-Rausch-Hüllkurve.
- **Testsignal:** synthetisches Mischsignal aus 40 Harmonischen mit Vibrato und Glissando plus 30 % weißem Rauschen.

| Dauer | FFT / Hop | max. Spitzen | Zeit Xeon | iPhone geschätzt | Rahmen | Spuren gesamt (≥ 4 Rahmen) |
|---|---|---|---|---|---|---|
| 2 s | 4096 / 512 | 80 | 102 ms | 0,2–0,26 s | 180 | 2 471 (826) |
| 2 s | 4096 / 256 | 120 | 199 ms | 0,4–0,5 s | 360 | 4 401 (1 971) |
| 5 s | 4096 / 512 | 80 | 252 ms | 0,5–0,63 s | 461 | 6 078 (2 009) |
| 5 s | 4096 / 256 | 120 | 494 ms | 1,0–1,24 s | 922 | 10 976 (4 868) |
| 5 s | 8192 / 512 | 120 | 474 ms | 0,95–1,19 s | 453 | 6 785 (2 957) |

**Rechenzeit**
- Ergebnis: **unkritisch**. Eine 2–5-s-Aufnahme ist am iPhone in ≤ 1,5 s analysiert, auch einschließlich YIN-f₀ und Rest-Abzug (geschätzt +20–40 %, **UNBELEGT**).
- Am besten in einem Web Worker, sonst in Scheiben auf dem Hauptthread wie in §11.3.

**Spurenzahl: die eigentliche Lehre**
- Freies MQ zerlegt Rauschen in **tausende Kurzspuren**. Das ist nicht abspielbar und nicht speicherbar.
- Deshalb gilt für SYNQUENZER: **harmonisch geführte Analyse** (Spitzen nur nahe k·f₀, höchstens 64/128) plus **Rauschbänder für den Rest**.
- Freie MQ-Spuren nur im Modus „unharmonisch“ (Glocke, Metall), begrenzt auf die 64 stärksten.
- Das entspricht SMS (harmonische Analyse) und ATS (Bänder). — **WAHRSCHEINLICH**.

**Fensterwahl nach f₀**
- f₀ < 80 Hz (Löwe, Bass): 8192.
- 80–400 Hz: 4096.
- darüber: 2048.
- Hop: 480 (100 Rahmen/s) zum Speichern, Analyse intern mit 256.

### 4.3 Speicherformat (gemessen an synthetischen Signalen)

- **Skript:** `r8/bench/speicher-bench.mjs`.
- **Messaufbau:** 100 Rahmen/s, 64 Harmonische, 24 Bänder. f₀ wurde aus dem Generator übernommen (YIN nicht enthalten). **Keine echten Aufnahmen.**

| Signal | roh | deflate | Delta + deflate | ohne Frequenz-Abweichung, Delta + deflate |
|---|---|---|---|---|
| Sax-Modell 4 s | 58,8 KB | 34,3 KB | 30,9 KB | **17,6 KB** |
| Brüll-Modell 3 s | 43,8 KB | 33,2 KB | 28,9 KB | **14,6 KB** |

**Vorgeschlagenes Format `p.resyn`** (an SDIF 1HRM/1TRC angelehnt; SDIF speichert je Rahmen eine Matrix aus Index, Frequenz, linearem Pegel und Phase — **BELEGT (SE)** [IRCAM SDIF](https://support.ircam.fr/docs/om/archive/om6.5-manual/co/SDIF-Intro.html), [CNMAT Frame-Typen](https://cnmat.berkeley.edu/content/sdif-standard-frame-types)):

```js
p.resyn = {
  v:1, sr:48000, fps:100, n:64, bands:24, mode:'harm'|'inharm',
  f0:   Int16 je Rahmen (Cent über MIDI 0; 0 = stimmlos),
  amp:  Uint8 je Rahmen × n (0,5-dB-Stufen, 0 = aus),
  dev:  Int8  je Rahmen × n (Cent-Abweichung von k·f0; optional, nur 'inharm' oder Feinmodus),
  nz:   Uint8 je Rahmen × bands (0,5-dB-Stufen, Rest-Hüllkurve, Bark-artig),
  env:  Uint8 × 32 (geglättete Formant-Hüllkurve, für Transponieren ohne Micky-Maus),
  atk:  optional Int8-PCM 30–80 ms (Hybrid-Anschlag, ≈ 1,5–4 KB),
  loop: [a, b] (Rahmen-Bereich für Halten), src: 'Datei'|'Mikro'|'App-Sound', name
}
```

- **Kodierung:** Zeit-Delta, dann `CompressionStream('deflate-raw')` und Base64.
- **Unterstützung:** CompressionStream ist „Baseline 2023“. — **BELEGT (SE)** [Chrome-Blog](https://developer.chrome.com/blog/compression-streams-api/), [MDN-Spiegel](https://www-igm.univ-mlv.fr/~forax/MDN/developer.mozilla.org/en-US/docs/Web/API/CompressionStream/CompressionStream.html). Ob Safari `deflate-raw` unterstützt, ist **UNBELEGT**; sonst `deflate`.
- **Größe:** 5 s ≈ 20–40 KB (inklusive Base64 +33 %). Das passt in Projekt-JSON und Supabase; zehn Resynthese-Klänge pro Projekt ≈ 0,3 MB. — **WAHRSCHEINLICH**.
- **Weitere Reduktion:** Knickpunkte statt fester Rahmen (SMS: stückweise linear) sollen echte Aufnahmen weiter verkleinern. — **UNBELEGT**, nicht gemessen.

### 4.4 Polyphonie

**Spurbudget:** Spec §15 erlaubt ≤ 12 % je Spur auf Xeon. Daraus folgt (**WAHRSCHEINLICH**, aus §4.1):
- 64 TT + 24 Bänder: **8 Stimmen** (11,7 %).
- 128 + 24: **4–5 Stimmen**.
- 256 + 24: **2 Stimmen**.

**Begrenzer wie §15.2**
- **Stufe 1:** Teiltöne halbieren (128 → 64 → 32), höchste zuerst.
- **Stufe 2:** Rauschbänder 24 → 12.
- **Stufe 3:** Stimmen kürzen.

**Typische Nutzung:** Löwe, Sax, „sprechend“ und Fläche sind meist 1–4 Stimmen. Klavier über KLANGKÖRPER (V9b) mit Abschalten, nicht über volle Resynthese.

---

## 5. Was man damit tun kann (Bearbeiten und Morphen)

Belegte Vorbilder: SPEAR (Teiltöne einzeln), Alchemy (vier Quellen morphen, Teiltöne editieren), Loris (Morph), Synclavier (Frames), Neuron (Makros Anregung ↔ Körper). Vorgeschlagene Funktionen (Bewertung **WAHRSCHEINLICH**):

1. **Tonhöhe unabhängig von Zeit.**
   - Die Note bestimmt f₀; die Rahmen laufen mit Tempo ×¼ … ×4 oder werden „eingefroren“ (Halten im Loop-Bereich).
   - Die Formant-Hüllkurve `env` bleibt ortsfest. Dadurch klingt ein transponiertes Sax nicht nach Micky Maus.
2. **Regler TON ↔ RAUSCHEN** (Atem/Fauchen) und **HELLIGKEIT** (Neigung). **RAUHEIT** und **SUB** nutzen dieselben Parameter wie KLANGKÖRPER.
3. **Morph A ↔ B** (zwei Analysen, z. B. Löwe ↔ Sax).
   - Pegel je Harmonischer und Bänder werden rahmenweise interpoliert, die Zeitachsen auf gleiche Länge normiert.
   - XY mit 4 Ecken wie V9a.
4. **Teiltöne malen** (Spektrogramm-Ansicht: Zeit × Teilton, Farbe = Pegel). Dazu Filter Gerade/Ungerade und Auswahl wie SPEAR.
5. **„Als KLANGKÖRPER vereinfachen“:**
   - V9c bleibt als Sonderfall: Mittelwert + Abklingzeiten aus der vollen Analyse.
   - Umgekehrt kann ein KLANGKÖRPER als Analyse gerendert werden.
6. **Timbre-Transfer light (DDSP-Idee ohne Netz):**
   - Tonhöhe und Lautheit einer Gesangs- oder Mikro-Aufnahme steuern eine gespeicherte Sax-Analyse; deren Rahmen werden nach Lautheit ausgewählt.
   - Lautheit → Rahmen mit passender Helligkeit. **UNBELEGT**, eigene Idee; Hörtest nötig.

---

## 6. Vorschlag für die Spec (statt E8)

- **E8 neu:** Allgemeine Resynthese einstimmiger Klänge (Sinus + Rauschen + optionaler Anschlag) ist erlaubt. Ausgeschlossen bleiben polyphone Quellen (Akkorde, ganze Songs) und neuronale Modelle.
- **V9d „Klang einfangen – Analyse“** (≈ 40 KB Code, ≈ 5 h, **UNBELEGT**):
  - Ablauf: Datei/Mikro/App-Sound → Mono 48 kHz, ≤ 8 s → YIN-f₀ mit Stimmhaftigkeit → STFT mit f₀-abhängigem Fenster → harmonische Spitzen (≤ 128) oder MQ (≤ 64) → Rest in 24 Bänder → Formant-Hüllkurve → Anschlag-Erkennung (Energiefluss) → `p.resyn` → A/B-Vergleich bei gleicher Lautheit.
  - Abnahme-Ideen (**UNBELEGT**, zu prüfen):
    - Sax-Testsignal: Abweichung je Bark-Band ≤ 3 dB.
    - Analyse von 5 s ≤ 1 s auf Xeon.
    - Größe ≤ 40 KB.
- **V9e „Resynthese-Spieler und Editor“** (≈ 50 KB, ≈ 6 h, **UNBELEGT**):
  - Engine `resyn` im Worklet: u32-Tabellenbank + 24 SVF-Bänder + Anschlags-Schnipsel.
  - Dazu Makros TEMPO, TON↔RAUSCHEN, HELLIGKEIT, FORMANT, RAUHEIT, MORPH; Spektrogramm-Malen; Begrenzer nach §4.4.
- **Wo der Anschlag hingehört:** Der Hybrid-Anschlag ist ein Mini-Sample. Ob er zu §18 „Sample-Import“ gehört oder hier erlaubt wird, ist eine **offene Frage an Xander bzw. den Dirigenten**.
- **Neuronale Wege** (DDSP, RAVE, Codecs): §18 „Ausblick“, nicht in v3.

---

## 7. Schnittstellen

- **Mikrofon:** nur in der Standalone-Seite (raw.githack); in der Claude-App nur Datei-Import. Das entspricht dem Auftrag.
- **Stimme:** `r7/stimme.md` (anderer Agent) fehlt noch. Sobald es vorliegt, sollte V9d dessen Aufnahme-Puffer und YIN-Code mitnutzen statt eigener Kopien.
- **Ressourcen:** Datei-Import mit `decodeAudioData`, wie §11.3. Speicher: 8 s Mono Float32 ≈ 1,5 MB für die Aufnahme selbst; **die Analyse braucht weit mehr** (Prototyp-Code: je Modus ≈ 50 MB ArrayBuffers, RSS +65–96 MB bei 8 s/48 kHz — BELEGT (gemessen, `r8/rev-resyn/ana-speicher.out`)). Budget und Technik: `resynthese-pakete.md` §4.3 (M-SPEICHER ≤ 64 MB Zuwachs).

---

## 8. Messdateien

- `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/v3-ideen/r8/bench/osc-bench.mjs` und `.out`: Oszillatorbank 64/128/256, Tabelle gegen rekursiv, Rauschbänder.
- `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/v3-ideen/r8/bench/analyse-bench.mjs` und `.out`: STFT, Spitzen, MQ, Bänder; IFFT-Synthese.
- `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/v3-ideen/r8/bench/speicher-bench.mjs` und `.out`: Speichergröße roh, deflate und Delta.

**Grenzen der Messung**
- Nur Node auf Xeon, kein Worklet, kein iPhone.
- Nur synthetische Testsignale; ein echter Löwe und ein echtes Sax sind nicht gemessen.
- Beim 60-Hz-Brüllmodell überdecken die ±3-Bin-Fenster um die Harmonischen fast das ganze Spektrum. Die Angabe „56 % Energie in Harmonischen“ ist dort deshalb überhöht.
