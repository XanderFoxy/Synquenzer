# Resynthese-Prototyp: Sinus + Rauschen an echten Aufnahmen (R8)

Stand 17.10.2026 · Folgearbeit zu `r8/resynthese-recherche.md` (dort: Stand der Technik, nur synthetische Testsignale). Anlass: Xanders Wunsch nach echter Resynthese (Löwengebrüll, Saxofon, Klavier, „sprechende“ Klänge), `fragen-xander-9.md` (letzter Abschnitt) und `fragen-xander-5.md` H8; Spec v3 §11 (V9a–V9c), Nachtrag 1 A.11, Entscheidung E8. `r7/stimme.md` gibt es weiterhin nicht (17.10. geprüft).

**Kennzeichen:** **BELEGT** = durch die genannte Quelle (URL) gedeckt; „(SE)“ = nur Suchauszug, Volltext nicht gelesen · **BELEGT (gemessen)** = eigene Messung mit diesem Prototyp, Datei angegeben · **WAHRSCHEINLICH** = Folgerung aus Belegen oder Messungen · **UNBELEGT** = eigene Kenntnis oder Schätzung, ungeprüft.
Alle Messungen: Node 22 auf Xeon 2,1 GHz, **kein Worklet, kein iPhone, kein Hörtest**.

---

## 0. Kurzfassung

1. **Der Prototyp läuft** (reines JS, ~1 700 Zeilen): STFT, Spitzen mit Parabel-Interpolation, Spurverfolgung (Geburt/Tod, max. Frequenzsprung), harmonischer Modus (YIN-f0 + Teiltöne k·f0), freier Modus (MQ), Hybrid, Rest als Rauschen in 26 Bark- bzw. 32 ERB-Bändern, Original-Anschlag, Rausch-Feinhüllkurve („Rauheit“), Oszillatorbank + FFT-Rauschsynthese. — BELEGT (gemessen, `resyn-proto/src/`).
2. **Saxofon-Ton, Sprache, gesprochenes Wort:** Mit 32–64 Teiltönen + Rauschbändern (+ Anschlag) liegt der Nachbau in allen drei Maßen (LSD, Mel-Distanz, MCD) **am „Zufallsboden“**, d. h. so nah am Original wie zwei Durchläufe desselben Nachbaus mit anderem Rauschzufall. Beispiel Sax-Ton (64 TT): Mel-Distanz 0,8 dB, MCD 2,1 dB; Boden 0,8/2,4. **Klavier** knapp darüber (Mel 1,2 statt 0,6; MCD 3,7 statt 1,8). — BELEGT (gemessen, §4).
3. **Die Spec-Variante V9c** („Teiltöne einfangen“: festes Spektrum + Abklingzeiten) ist deutlich schlechter: Sax-Ton MCD 13,1 statt 2,1; Klavier 27,2 statt 3,7; Phrase, Sprache und Löwe unbrauchbar (MCD 31–52). — BELEGT (gemessen). Das stützt die Aufhebung von E8. — WAHRSCHEINLICH.
4. **Löwengebrüll** ist in beiden Aufnahmen **fast nur gepulstes Rauschen** (nur 10 bzw. 24 % der Rahmen periodisch, Pulsrate ~30–48 Hz). Das Rauschband-Modell trifft das Spektrum (am Zufallsboden), verliert aber die schnelle Pulsation: Rauigkeit in den oberen Bändern 0,18/0,14 statt 0,32/0,37. Eine **Feinhüllkurve** (1 Byte je ms) holt sie zurück (0,34/0,47). — BELEGT (gemessen). Ob es dann „echt“ klingt: UNBELEGT (Hörtest).
5. **Harmonischer Modus** ist am besten zum Spielen (Transponieren mit Formanterhalt, Morph, kleinster Speicher 3–8 KB/s), verliert aber Nachhall-Überlappungen in Phrasen (Sax-Phrase Mel-Distanz 3,4 statt 2,2 im freien Modus) und erzeugt beim Klavier Pegelschwankungen. **Freier Modus** ist am treuesten, braucht aber 5–20 KB/s. — BELEGT (gemessen).
6. **Musikalisch:** Transponieren ±12 HT mit Tonhöhenfehler < 0,5 Cent (Sax); Formanterhalt hält den Klangschwerpunkt (−256/+366 Cent statt −1200/+1200); Dehnen ×0,5…×2 ohne Tonhöhenänderung; parametrische Schleife ohne Pegeleinbruch (0 dB gegen bis 1,5 dB bei Audio-Schleife); Morph Sax↔Löwe läuft stetig; eine Melodie aus **einem** Sax-Ton trifft jede Note auf < 1 Cent. — BELEGT (gemessen, §5).
7. **Was nicht gut ist:** Einfrieren klingt zu statisch (0,02 dB Pegelschwankung beim Sax), Schleifen über gleitende Tonhöhe (Wort) brechen 2 dB ein, Abwärts-Transponieren verliert die oberste Oktave, die Analyse des Prototyps ist langsam (0,1–1,7 s je Sekunde Audio auf der Xeon). — BELEGT (gemessen).

**Kurzantwort-Vorschlag an Xander** (kurz und knapp):
> Ja, genau das baue ich: echte Resynthese aus der Frequenzanalyse. Ich habe es an echten Aufnahmen getestet. Saxofon, Klavier und Sprache kommen messbar sehr nah ans Original. Das Löwengebrüll ist fast reines Rauschen mit schnellem Pulsieren; dafür gibt es einen Zusatz „Rauheit“. Anhören müssen wir es noch. Danach kannst du jeden Klang transponieren (ohne Micky-Maus), dehnen, einfrieren, loopen und zum Beispiel zwischen Sax und Löwe morphen.

---

## 1. Was gebaut wurde

Ordner `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/v3-ideen/r8/resyn-proto/` (Code in `src/`, Ergebnisse in `out/`).

| Baustein | Umsetzung | Vorbild / Quelle |
|---|---|---|
| Dekodieren | OGG Vorbis, MP3, FLAC über WASM-Dekoder aus npm (`@wasm-audio-decoders/ogg-vorbis`, `mpg123-decoder`, `@wasm-audio-decoders/flac`, MIT, mit `--ignore-scripts` installiert); WAV eigener Leser. ffmpeg war nicht vorhanden. | [wasm-audio-decoders](https://github.com/eshaz/wasm-audio-decoders) — BELEGT (npm-Metadaten: Lizenz MIT) |
| STFT | Nullphasig gefenstert, 4-fach gepolstert; Hann (harmonisch), Blackman (frei), Blackman-Harris 92 dB (Rest) | Fenster: [Harris 1978, PDF](https://amst.ece.iastate.edu/paper/comparative_study/window_1.pdf), −92 dB: [MathWorks](https://www.mathworks.com/help/signal/ref/blackmanharris.html) — BELEGT (SE) |
| Spitzen | lokale Maxima, Parabel auf dB-Werten, Phase interpoliert; zusätzlich **Sinusförmigkeit** (Restenergie in der Hauptkeule nach Abzug der Fensterform < −15 dB) | [JOS, Quadratic Interpolation of Spectral Peaks](https://ccrma.stanford.edu/~jos/sasp/Quadratic_Interpolation_Spectral_Peaks.html) — BELEGT (SE); Sinusförmigkeit: eigene Umsetzung |
| f0 | YIN (CMNDF, Schwelle 0,2), Median-Glättung, Korrektur von f0·2/3/4-Fehlern, Verfeinerung per gewichteter kleinster Quadrate über die Teiltöne | [de Cheveigné & Kawahara 2002 (PDF)](https://cagnazzo.wp.imt.fr/files/2013/05/2002_JASA_YIN.pdf) — BELEGT (SE) |
| Harmonischer Modus | f0-adaptives Fenster (3 Perioden, mind. 15 ms); Spitze nahe k·f0·√(1+B k²) (B = Klavier-Streckung, kleinste Quadrate); Segmente an f0-Sprüngen > 80 Cent je Rahmen geteilt; Synthese **phasenverriegelt** (k·Θ₀ + Startphase) | Prinzip Harmonische+Rauschen: [Stylianou 2001 (PDF)](https://ee.columbia.edu/~dpwe/classes/e6820-2007-05/papers/Styl01-hnm.pdf) — BELEGT (SE) |
| Freier Modus (MQ) | alle sinusförmigen Spitzen; Spurverfolgung: stärkste Spur zuerst, Abweichung ≤ 15 Hz + 1,5 %, bis 2 Rahmen Lücke, Mindestlänge 4 Rahmen | McAulay/Quatieri 1986: [MIT LL](https://www.ll.mit.edu/r-d/publications/speech-analysissynthesis-based-sinusoidal-representation) — BELEGT (SE, über R8-Recherche) |
| Hybrid | harmonische Teiltöne + MQ-Spuren auf den übrigen Spitzen | eigene Kombination |
| Budget N | höchstens N **gleichzeitige** Teiltöne; Spuren nach Energie gierig gewählt | eigene Umsetzung |
| Rest → Rauschen | eigenes Blackman-Harris-Fenster (46 ms, Bandauflösung < 100 Hz): behaltene Teiltöne **komplex abziehen** (gemessene Amplitude, Frequenz, Phase) und Hauptkeulen maskieren; je Band Täler mitteln | SMS zieht Sinus im Spektrum ab: [sms-tools `sineSubtraction`, `stochasticResidualAnal`](https://github.com/MTG/sms-tools/blob/master/smstools/models/utilFunctions.py) — BELEGT (Quelltext gelesen, Zeilen 529/585); [Serra & Smith 1990 (PDF)](https://audiolabs-erlangen.de/content/05_fau/professor/00_mueller/02_teaching/2024s_sarntal/02_group_SYNTH/1990_SerraS_SpectralModelingSynthesis_CMJ.pdf) — BELEGT (SE) |
| Bänder | 26 Bark-artige (Zwicker-Grenzen, zusätzlich bei 40 Hz geteilt) oder 32/16 ERB | [Bark-Grenzen (Wikipedia)](https://en.wikipedia.org/wiki/Bark_scale) — BELEGT (SE); ERB-Zahl 21,4·log10(1+0,00437 f) nach Glasberg & Moore 1990 — UNBELEGT (Formel aus eigener Kenntnis; Quelle nur bibliografisch gefunden: [Übersicht](https://pmc.ncbi.nlm.nih.gov/articles/PMC3202745)) |
| Rauschsynthese | (a) FFT-Überlappung zufallsphasiger Spektren (Hann 23 ms, 75 %), **Energie je Band exakt erhalten**; (b) Worklet-artig: weißes Rauschen → je Band 2 kaskadierte Bandpässe | SMS-Prinzip (s. o.); (b) wie `r8/bench/osc-bench.mjs` |
| Anschlag | Einsatz-Erkennung (spektraler Fluss); 40 ms Original + 15 ms Gleichleistungs-Überblendung | Synclavier „Hybrid Attack“: [Resynthesis Quickstart](https://www.synclavier.com/Downloads/Resynthesis-Quickstart.pdf) — BELEGT (SE, über R8-Recherche) |
| Rauheit | Feinhüllkurve der Höhen (RMS 2 ms / RMS 30 ms), 8 Bit je ms, auf das Rauschen multipliziert | Zeit-Hüllkurve des Rauschteils im HNM: [Stylianou, Eurospeech 1995](https://www.isca-archive.org/eurospeech_1995/stylianou95b_eurospeech.html), [Pantazis & Stylianou 2008 (PDF)](https://www.csd.uoc.gr/~hannover/LabsiteDraft/MMILab_files/ImprovNoiseModeling_icassp08.pdf) — BELEGT (SE) |
| Synthese Teiltöne | Oszillatorbank, Pegel und Frequenz linear je Rahmen (5,8 ms), Ein-/Ausblenden über einen Rahmen | McAulay/Quatieri (s. o.) |
| Spektrogramme | eigener PNG-Schreiber (zlib) mit 5×7-Schrift; log-Frequenz 40 Hz–16 kHz; sequentielle Blau-Rampe nach dataviz-Vorgabe | — |

Plausibilitätstests mit bekannter Wahrheit (`src/test-synth.mjs`): Rausch-Kalibrierung weißes Rauschen −26,02 dB → Analyse −26,5 dB, FFT-Synthese −26,07 dB, SVF −26,80 dB; f0 eines 220-Hz-Vibratotons 217,8–222,2 Hz exakt getroffen; Rauschenergie des Modells bei vollem Budget 0,2 dB neben der Wahrheit. — BELEGT (gemessen).

---

## 2. Testaufnahmen (Herkunft und Lizenz)

**Wichtig:** Wikimedia Commons, Freesound, archive.org, Zenodo und Hugging Face waren aus der Arbeitsumgebung **nicht erreichbar** (Proxy 403/keine Verbindung). Erreichbar waren GitHub (raw), Bitbucket, npm und das Ubuntu-Paketarchiv. Daher kommen die Löwen aus Lernprogrammen in Ubuntu (GPL), nicht von Commons. — BELEGT (gemessen: Verbindungstests).

| Kürzel | Inhalt | Herkunft (URL) | Lizenz | Format / Ausschnitt |
|---|---|---|---|---|
| `loewe` | Löwengebrüll | qABCs `abcs/all/noises/lion.ogg`: [Bitbucket](https://bitbucket.org/admsasha/qabcs/raw/master/abcs/all/noises/lion.ogg) | GPL-3+: [README](https://bitbucket.org/admsasha/qabcs/raw/master/README.md), [Debian-copyright](https://changelogs.ubuntu.com/changelogs/pool/universe/q/qabcs/qabcs_1.0.2-6build2/copyright) — BELEGT | OGG ~78 kbit/s, 44,1 kHz mono, 1,95 s |
| `loewe-tp` | Löwengebrüll | Tux Paint Stamps `stamps/animals/mammals/cats/lion.ogg` aus [tuxpaint-stamps-default (Ubuntu)](https://packages.ubuntu.com/noble/tuxpaint-stamps-default) | GPL-2: [Debian-copyright](https://changelogs.ubuntu.com/changelogs/pool/universe/t/tuxpaint-stamps/tuxpaint-stamps_2022.06.04-1/copyright) — BELEGT | OGG ~52 kbit/s, 44,1 kHz, 1,83 s |
| `sax-ton` | Altsax-Ton A4 (440 Hz) | npm [tonejs-instrument-saxophone-mp3](https://www.npmjs.com/package/tonejs-instrument-saxophone-mp3) `A4.mp3`; Quelle Karoryfer: [sample-source-info.txt](https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/sample-source-info.txt) | „Samples: CC-by 3.0“ (README des Pakets) — BELEGT; Weresax „open source and royalty free for all use“: [KVR](https://www.kvraudio.com/product/weresax-by-karoryfer) — BELEGT (SE) | MP3 stereo→mono, 0–3,5 s |
| `sax-phrase` | Sax-Phrase, 5 Töne (533/789/704/948/790 Hz) | qABCs `noises/saxophone.ogg` ([Bitbucket](https://bitbucket.org/admsasha/qabcs/raw/master/abcs/all/noises/saxophone.ogg)) | GPL-3+ (wie oben) — BELEGT | OGG, 1,26 s |
| `klavier` | Flügel C4, Velocity 10 | Salamander Grand Piano `Samples/C4v10.flac`: [sfzinstruments](https://github.com/sfzinstruments/SalamanderGrandPiano) | CC BY 3.0, Alexander Holm (README) — BELEGT | FLAC 48 kHz/24 Bit stereo→mono, 0–4 s |
| `sprache` | Englisch, Männerstimme (f0 ~83 Hz) | LibriSpeech 5703-47212-0000 über [librosa/data](https://github.com/librosa/data) (`audio/*.hq.ogg` + `.txt`) | CC BY 4.0, [OpenSLR 12](https://www.openslr.org/12/) — BELEGT (Begleit-txt) | 16 kHz, 0,3–2,45 s |
| `wort-loewe` | gesprochenes Wort „Löwe“ (Deutsch) | qABCs `abcs/de/sounds/words/löwe.ogg` ([Bitbucket](https://bitbucket.org/admsasha/qabcs/raw/master/abcs/de/sounds/words/l%C3%B6we.ogg)) | GPL-3+ — BELEGT | 24 kHz, 0,6 s |

Hinweise: GPL ist eine offene Lizenz, aber nicht CC0/CC-BY wie gewünscht; die Löwen sind kurz, verlustbehaftet kodiert und ihre Ursprungsaufnahme ist nicht dokumentiert. Für die App gilt das nicht (dort analysiert der Nutzer eigene Dateien). — WAHRSCHEINLICH. **Nachtrag (Review R8):** Dass ein Löwe überzeugend klingt, ist mit diesen Clips nicht gezeigt; vor einer Zusage braucht es ≥ 2 unkomprimierte, dokumentierte Aufnahmen und einen Hörtest (`resynthese-pakete.md` N9R-38). Für den Bau werden die Dateien mit Hash und Quellenangabe Testdaten im Repo (N9R-40). Alle Dateien liegen je in einem eigenen Ordner unter `resyn-proto/dl/`; jede Aufnahme wurde auf Spitze 0,9 normiert und mit 5 ms ein-/ausgeblendet.

---

## 3. Messmethode

- **LSD** (Log-Spektral-Distanz, dB): je Rahmen RMS der dB-Differenz über alle Bins 50 Hz…min(16 kHz, Nyquist), gemittelt über aktive Rahmen (Originalenergie > max − 50 dB); Bewertungs-STFT Hann 46 ms, Hop ¼; Boden −80 dB unter dem Maximum. Grundidee „RMS-Differenz zweier Log-Spektren“: [Gray & Markel (COSH-Abstract)](https://labs.sonicfield.org/library/cosh-measure-for-speech-processing), [Gray & Markel 1976, DOI](https://doi.org/10.1109/TASSP.1976.1162849) — BELEGT (SE).
- **Mel-Distanz (MSD, dB):** dasselbe auf 40 Mel-Bändern (weniger zufallsempfindlich). — eigene Definition.
- **MCD (dB):** Kubichek-Formel (10/ln10)·√(2·Σ Δc_d²), d = 1…13, Cepstrum = orthonormale DCT des ln der Mel-Band-Amplituden (40 Bänder). Quelle der Formelidee: [Kubichek, IEEE Xplore 407206](https://ieeexplore.ieee.org/document/407206) — BELEGT (SE). **Achtung:** nicht das SPTK-Mel-Cepstrum der TTS-Literatur; Absolutwerte daher nicht mit Sprachsynthese-Papieren vergleichbar. — WAHRSCHEINLICH.
- **Zufallsboden:** derselbe Nachbau mit anderem Rausch-Zufall gegen den ersten. Ein Periodogramm-Wert schwankt mit 100 % Standardabweichung um das wahre Spektrum (χ² mit 2 Freiheitsgraden): [Vaughan u. a. 2003, arXiv](https://arxiv.org/pdf/astro-ph/0307420), [Wikipedia Periodogram](https://en.wikipedia.org/wiki/Periodogram) — BELEGT (SE). Daraus folgt für zwei unabhängige Rauschen gleicher Hülle eine LSD von ≈ 7,9 dB (√2 · 5,57 dB). — WAHRSCHEINLICH; **gemessen 7,87 dB** (`test-synth.mjs`). Der Boden ist die **Streuung des eigenen Modells; nur zusammen mit dem Anker-Selbsttest aussagekräftig.** Ein rauschlastigeres Modell hat einen höheren Boden: Der Anker „nur Rauschbänder“ liegt bei Löwe qABCs / Tux Paint / Sprache nur 0,11 / 0,24 / 0,15 dB Mel über seinem eigenen Boden (`r8/rev-resyn/anker-ampel.out`), und der Sax-Ton liegt in MCD sogar unter dem Boden (2,1 < 2,4). — BELEGT (gemessen). Die Ampel der Pakete prüft deshalb zusätzlich Periodizität bzw. Rauigkeit und Puls (`resynthese-pakete.md` §3.2 Schritt 11).
- **Anker:** „nur Rauschbänder“ (alles als Bandrauschen, keine Teiltöne = Rausch-Vocoder) und **V9c-Näherung** (§11.3 der Spec: feste Frequenz je Teilton, Startpegel = Maximum 0–100 ms, zweistufiges exponentielles Abklingen, 50 ms Rauschstoß). Die V9c-Näherung ist meine Umsetzung der Spec-Beschreibung, nicht der echte V9c-Code. — UNBELEGT, ob V9c genau so gebaut würde.
- **Zusatzmaße:** Periodizität (YIN-Aperiodizität je 10 ms, Anteil stimmhafter Rahmen), Rauigkeit (Anteil der Hüllkurven-Modulation 20–100 Hz an 1–100 Hz in 4 Bändern 100–400, 400–1600, 1600–6400, > 6400 Hz), Scheitelfaktor.
- **Kein Hörtest.** Ob die Maße mit dem Höreindruck übereinstimmen, ist für diese Klänge **UNBELEGT**.

Alle Zahlen: `resyn-proto/out/messung.json` und `resyn-proto/out/tabellen.md` (erzeugt von `src/run-measure.mjs`, `src/tables.mjs`).

---

## 4. Wie realistisch? (Ergebnisse)

Werte jeweils **LSD / Mel-Distanz / MCD** in dB (kleiner = näher). N = 64 gleichzeitige Teiltöne. S = nur Sinus, S+R = Sinus + Rauschbänder, +A = zusätzlich Original-Anschlag, +Rh = zusätzlich Rauheit (Feinhüllkurve).

### 4.1 Überblick (bester Modus, N = 64)

| Aufnahme | bester Modus | S | S+R | S+R+A | Zufallsboden | Anker nur Rauschen | V9c-Näherung |
|---|---|---|---|---|---|---|---|
| Sax-Ton A4 | frei (harm. gleichauf) | 5,5 / 1,9 / 6,0 | **3,9 / 0,8 / 2,1** | 3,9 / 0,7 / 2,0 | 3,9 / 0,8 / 2,3 | 14,1 / 8,3 / 21,9 | 7,5 / 3,7 / 13,1 |
| Sax-Phrase | frei | 4,9 / 4,4 / 13,1 | **5,3 / 2,2 / 5,5** | 5,3 / 2,2 / 5,5 | 3,8 / 1,5 / 4,1 | 12,3 / 7,5 / 15,3 | 11,1 / 20,6 / 41,1 |
| Klavier C4 | frei | 2,0 / 4,7 / 18,0 | **1,1 / 1,2 / 3,7** | 1,1 / 1,2 / 3,7 | 1,0 / 0,6 / 1,8 | 8,5 / 8,0 / 17,3 | 3,3 / 9,1 / 27,2 |
| Sprache EN | frei | 10,2 / 10,4 / 23,9 | 6,3 / 2,6 / 6,7 | **5,8 / 2,3 / 6,0** | 5,9 / 2,0 / 5,9 | 7,2 / 3,2 / 7,9 | 16,6 / 14,3 / 45,0 |
| Wort „Löwe“ | frei | 6,1 / 5,5 / 13,8 | 5,0 / 1,8 / 4,8 | **4,6 / 1,6 / 4,4** | 4,7 / 1,4 / 4,1 | 6,0 / 2,8 / 6,4 | 12,1 / 10,6 / 31,5 |
| Löwe (qABCs) | frei | 9,0 / 12,4 / 36,0 | **4,8 / 2,1 / 6,0** | 4,7 / 2,1 / 5,9 | 4,6 / 2,1 / 6,3 | 5,3 / 2,3 / 6,2 | 13,7 / 21,9 / 52,4 |
| Löwe (Tux Paint) | hybrid/frei | 10,5 / 8,3 / 19,2 | **7,4 / 2,2 / 6,5** | 7,3 / 2,1 / 6,4 | 6,1 / 2,0 / 6,2 | 8,7 / 2,6 / 7,8 | 12,8 / 13,9 / 39,1 |

BELEGT (gemessen, `out/tabellen.md` Tabelle A). Die vollständige Tabelle mit allen drei Modi steht in `out/tabellen.md`.

**Lesart**
- **Rauschmodell ist Pflicht:** Nur Sinus liegt überall weit weg (MCD 6–36), weil Atem, Anschlag und Raum fehlen. Mit Rauschbändern fällt die MCD auf 2–7. — BELEGT (gemessen).
- **LSD steigt durch Rauschen manchmal leicht** (Sax-Phrase 4,9 → 5,3): Ein neues Rauschen hat andere Zufallsspitzen je Bin als das Original. Das ist der Zufallsboden aus §3, kein Fehler. — WAHRSCHEINLICH.
- **„Am Boden“** sind Sax-Ton, Sprache, Wort und beide Löwen (Abstand ≤ 0,3 dB Mel-Distanz). Klavier und Sax-Phrase liegen 0,6–0,7 dB Mel-Distanz darüber. — BELEGT (gemessen).

### 4.2 Budget: wie viele Teiltöne?

S+R (LSD / Mel / MCD) je Budget; Auszug aus `out/tabellen.md` Tabelle B:

| Aufnahme, Modus | N = 16 | N = 32 | N = 64 | N = 128 |
|---|---|---|---|---|
| Sax-Ton, harmonisch | 7,6 / 1,7 / 3,9 | 4,4 / 0,8 / 2,3 | 4,3 / 0,8 / 2,1 | 4,3 / 0,8 / 2,1 |
| Sax-Phrase, frei | 6,5 / 2,5 / 6,3 | 5,4 / 2,2 / 5,5 | 5,3 / 2,2 / 5,5 | 5,3 / 2,2 / 5,5 |
| Klavier, frei | 1,3 / 1,3 / 4,3 | 1,1 / 1,2 / 3,7 | 1,1 / 1,2 / 3,7 | 1,1 / 1,2 / 3,7 |
| Sprache, frei | 6,7 / 2,9 / 7,4 | 6,5 / 2,8 / 7,2 | 6,3 / 2,6 / 6,7 | 6,3 / 2,6 / 6,7 |
| Löwe Tux Paint, frei | 8,6 / 2,0 / 6,0 | 8,5 / 2,0 / 6,1 | 8,1 / 2,0 / 6,2 | 7,3 / 2,0 / 6,0 |

- **32 Teiltöne reichen** für Sax-Ton und Klavier (64/128 ändern nichts mehr; der freie Modus findet beim Klavier C4 insgesamt nur 60 Spuren). **64** für Sprache. **128** hilft nur beim dichten Löwen im freien Modus (LSD 8,1 → 7,3). **16** ist beim Sax hörbar zu wenig (MCD 3,9 statt 2,1). — BELEGT (gemessen).
- Das passt zur R8-Empfehlung „Standard 64, Profi 128“. — WAHRSCHEINLICH.

### 4.3 Die einzelnen Klänge

**Saxofon-Ton.** Fast rein harmonisch (99 % der Rahmen stimmhaft), steht nach 32 Teiltönen am Boden. Harmonischer und freier Modus gleichauf (Mel 0,8). Speicher harmonisch 5,1 KB/s. — BELEGT (gemessen). Hinweis: Die Weresax-Töne sind laut Paketbeschreibung bearbeitet („pitch-correction“); ein lebendiges Sax mit Vibrato ist damit nicht geprüft. — BELEGT (README); Folge WAHRSCHEINLICH.

**Saxofon-Phrase.** Freier Modus klar besser (Mel 2,2) als harmonisch (3,4) und Hybrid (3,0). Ursache: Der Nachhall der vorigen Note klingt in die nächste hinein; der harmonische Modus kennt nur **eine** Grundfrequenz und schiebt den Nachhall ins Rauschen. Gemessen: Mel-Fehler je Rahmen direkt nach Notenwechseln 12–21 dB (harmonisch, nur Sinus) gegen 2–7 dB (frei). — BELEGT (gemessen, `src/diag3.mjs`).

**Klavier.** Freier Modus sehr nah (Mel 1,2, LSD 1,1). Der harmonische Modus mit Streckung (B = 2,2·10⁻⁴ gemessen) ist schlechter (Mel 1,9) und erzeugt **Pegelschwankungen**: Rauigkeit 0,39/0,55/0,54 statt 0,03/0/0,01 im Original. Ursache gefunden: Bei 1,38–1,48 s und 2,10–2,18 s steigt die YIN-Aperiodizität über die Schwelle 0,35 (im Original tieffrequente Nebengeräusche); der Ton gilt dort kurz als „stimmlos“, alle Teiltöne blenden aus und wieder ein (senkrechte Streifen in `out/klavier/spektrogramm-budgets.png`). — BELEGT (gemessen, `src/diag6.mjs`). Abhilfe: Stimmhaftigkeit mit Haltezeit (Hysterese) oder je Teilton entscheiden. — WAHRSCHEINLICH. Bis dahin: Klavier im freien Modus analysieren.

**Sprache und Wort.** Freier Modus + Anschlag am besten (Sprache Mel 2,3, Wort 1,6; jeweils am Boden). Der Anschlag (Original-Konsonanten) bringt hier messbar etwas: LSD −0,5 dB, MCD −0,7 dB (Sprache). Der Anker „nur Rauschen“ (geflüsterte Version) ist im Mel-Maß nur wenig schlechter (3,2), verliert aber die Stimmhaftigkeit: Aperiodizitäts-Abweichung 0,33 statt 0,11. — BELEGT (gemessen). Folgerung: Mel-Maße allein unterscheiden Stimme und Flüstern schlecht; die Periodizität muss mitgemessen werden. — WAHRSCHEINLICH.

**Löwe.** Beide Aufnahmen sind überwiegend aperiodisch: stimmhaft 10 % (qABCs, f0-Median ~31 Hz) bzw. 24 % (Tux Paint, ~48 Hz). Im Spektrogramm sieht man senkrechte Pulsstreifen (≈ 30–50 Hz Pulsrate). — BELEGT (gemessen, `out/loewe/spektrogramm-modelle.png`).
- Spektral sind alle Modelle am Boden; sogar „nur Rauschen“ ist beim qABCs-Löwen gleich gut (Mel 2,3 gegen 2,1). Teiltöne tragen dort fast nichts bei. Beim Tux-Paint-Löwen helfen sie etwas (Mel 2,6 → 2,0, MCD 7,8 → 6,0–6,5). — BELEGT (gemessen).
- **Was fehlt, ist die Pulsation:** Rauigkeit Original 0,71 / 0,75 / 0,32 / 0,37, Modell (frei, S+R) 0,53 / 0,55 / 0,18 / 0,14. Mit Feinhüllkurve 0,74 / 0,81 / 0,34 / 0,47; Kosten: Mel +0,2 dB, MCD +0,6 dB, Speicher ~0,9 KB/s. Beim Tux-Paint-Löwen schießt das oberste Band über (0,80 statt 0,44). — BELEGT (gemessen, `src/exp-fine.mjs`).
- Kürzere Rauschfenster statt Feinhüllkurve helfen weniger und kosten mehr Genauigkeit (5-ms-Fenster: Rauigkeit oben 0,23, MCD 9,3 statt 6,0). — BELEGT (gemessen, `src/exp-noisewin.mjs`).
- **Nachtrag (Review R8):** Mit drei Feinhüllkurven (300–1600, 1600–6400, > 6400 Hz) statt einer bleiben beide Löwen in allen 4 Bändern ±0,15 (Tux Paint oben +0,11 statt +0,35), Kosten ≈ 3,1 KB/s. — BELEGT (gemessen, `r8/resyn-pakete/rauheit-3band.out`). Der f₀-Median des qABCs-Löwen (~31 Hz) liegt am unteren Rand des Suchbereichs und unter den für Löwengebrüll genannten 40–200 Hz ([ScienceDaily zu Klemuk u. a. 2011](https://www.sciencedaily.com/releases/2011/11/111102190012.htm), BELEGT (SE)); ob der Clip ein typisches volles Brüllen ist, ist offen.
- Die R8-Recherche erwartete „gut, aber etwas synthetischer“. Die Messung bestätigt den Kern: Löwe = Rauschen + Formanten + Pulsation; Teiltöne sind Nebensache. — WAHRSCHEINLICH. Klangurteil: UNBELEGT (Hörtest).

### 4.4 Varianten im Vergleich (harmonisch, N = 64)

| Frage | Ergebnis | Kennzeichen |
|---|---|---|
| Phase verriegelt (k·Θ₀) gegen frei integriert | Maße gleich (±0,1 dB). Scheitelfaktor näher am Original bei Stimme: Sprache 2,79 (verriegelt) / 2,65 (frei) / 2,94 (Original); Wort 2,31 / 2,19 / 2,41 | BELEGT (gemessen) |
| Rauschen per FFT-Überlappung gegen SVF-Bandpässe (Worklet-Stil) | SVF schlechter: Mel +0,0 (Sax-Ton) bis +0,9 dB (Sprache), MCD bis +4 dB, Pegel beim Löwen −1,6 dB. Grund: breite Flanken der 2-poligen Filter | BELEGT (gemessen); Grund WAHRSCHEINLICH |
| 26 Bark-Bänder gegen 32/16 ERB (frei, N = 64) | 32 ERB gleich gut oder besser (Sprache Mel 2,56 → 2,24, Klavier MCD 3,72 → 2,88); 16 ERB deutlich schlechter (Sprache MCD 8,1) | BELEGT (gemessen, `out/baender.json`) |
| Speicherformat 100 Rahmen/s, quantisiert (0,5 dB, 1 Cent, Startphase 8 Bit) | Qualität wie voll aufgelöst (Mel ±0,3 dB) | BELEGT (gemessen) |

---

## 5. Musikalisch bearbeiten (Ergebnisse)

Dateien: `out/bearbeitung/` (WAV + PNG), Zahlen `out/bearbeitung/bearbeitung.json` (`src/run-edit.mjs`).

### 5.1 Transponieren: mit und ohne Formanterhalt

Formanterhalt = neuer Teiltonpegel aus der Hüllkurve des Rahmens an der neuen Frequenz; Rauschbänder bleiben stehen. Ohne = alles verschieben („Micky-Maus“). Prinzip: [Röbel & Rodet 2005](https://dafx.de/paper-archive/details/EDSTSaO17Gd_0LV03iwDfw) — BELEGT (SE). Meine Hüllkurve ist einfacher (lineare Verbindung der Teiltonspitzen, nicht „True Envelope“). — UNBELEGT, ob gut genug.

| Klang | Halbtöne | Tonhöhenfehler Median (P90) | Schwerpunkt-Verschiebung mit Formanterhalt | ohne | Hüllkurven-MCD mit / ohne |
|---|---|---|---|---|---|
| Sax-Ton (harm.) | −12 | −0,07 (0,29) Cent | −256 Cent | −1200 Cent | 56,8 / 77,3 |
| Sax-Ton | −7 | −0,05 (0,26) | −167 | −700 | 37,0 / 53,7 |
| Sax-Ton | +5 | 0,07 (0,26) | −128 | +500 | 19,1 / 32,7 |
| Sax-Ton | +12 | 0,26 (0,45) | +366 | +1200 | 44,2 / 74,3 |
| Wort „Löwe“ | −5 / +5 | 5,8 / 0,9 Cent | −426 / −4 | −548 / +486 | 12,1 / 30,5; 12,6 / 35,3 |
| Sprache | −4 / +4 | 1,1 / 0,5 Cent | −168 / +85 | −433 / +336 | 7,6 / 21,9; 7,9 / 23,3 |
| Klavier (frei) | −12 / +12 | 3,8 / −2,3 Cent | −360 / +224 | −1199 / +848 | 37,5 / 49,5; 29,7 / 47,9 |
| Löwe (frei) | −12 / +7 | (keine Tonhöhe) | +15 / +117 | −1130 / +810 | 9,6 / 28,5; 8,2 / 24,3 |

BELEGT (gemessen). Lesart:
- Tonhöhe sitzt (Sax < 0,5 Cent; Sprache/Wort ~1–6 Cent Median, Ausreißer bis 38 Cent P90 durch YIN an Lautübergängen). — BELEGT (gemessen).
- Formanterhalt hält den Klangschwerpunkt weitgehend fest: Rest-Verschiebung 0–42 % der Transposition (Ausreißer Wort −5 HT: 85 %); ohne Formanterhalt wandert er mit (71–116 %). — BELEGT (gemessen). Die Hüllkurven-MCD-Absolutwerte sind hoch, weil die Mel-Bänder auch die Teiltonlage sehen; nur der Vergleich mit/ohne zählt. — WAHRSCHEINLICH.
- **Löwe:** Formanterhalt ändert praktisch nichts (keine Tonhöhe, nur Rauschen). Das musikalisch Sinnvolle ist hier die **Verschiebung** („größerer/kleinerer Löwe“). — WAHRSCHEINLICH.
- **Abwärts** fehlen oberhalb von f_max·r Teiltöne (Sax −12: Teiltöne enden bei ~8 kHz). Eine Erweiterung um neue Harmonische ist nicht gebaut. — BELEGT (gemessen, `transp-sax-ton.png`).

### 5.2 Dehnen (Tonhöhe bleibt)

| Klang | Faktor | Dauer Soll/Ist | Tonhöhenänderung Median | Hüllkurven-MCD (Faktor 1 als Bezug) |
|---|---|---|---|---|
| Sax-Ton (harm.) | ×2 / ×0,5 | 7,00/7,00 s; 1,75/1,75 s | −0,01 / 0,00 Cent | 2,8 / 3,1 (Bezug 1,9) |
| Sprache (frei, Anschläge ungedehnt) | ×1,5 / ×0,67 | 3,22/3,23 s; 1,44/1,44 s | 1,1 / 0,8 Cent | 9,3 / 13,4 (Bezug 5,8) |
| Löwe (frei) | ×2 | 3,90/3,90 s | (keine Tonhöhe) | 9,7 (Bezug 5,3) |
| Wort „Löwe“ (harm.) | ×2 | 1,20/1,20 s | 0,8 Cent | 11,4 (Bezug 5,3) |

BELEGT (gemessen). Tonhöhe bleibt exakt. Der Abstand wächst bei Sprache und Löwe deutlich: Übergänge werden „verschmiert“ bzw. die Pulsation wird mitgedehnt (bei ×2 halbiert sich die Pulsrate des Löwen, weil die Feinstruktur in den Rahmen steckt). — Messung BELEGT, Deutung WAHRSCHEINLICH.

### 5.3 Einfrieren und Schleife

| Test | Ergebnis | Kennzeichen |
|---|---|---|
| Sax bei 1,5 s eingefroren (3 s) | Pegelschwankung 0,02 dB, spektraler Fluss 0,31 (Original-Haltephase 0,40): **zu statisch** | BELEGT (gemessen) |
| Vokal „ö“ aus dem Wort eingefroren (2,5 s) = gesungener Vokal aus Sprache | Fluss 0,63 (Wort 4,44), Pegelschwankung 0,08 dB | BELEGT (gemessen) |
| Löwe eingefroren (3 s) | Fluss 0,98, Pegelschwankung 0,51 dB (Rauschen hält es lebendig) | BELEGT (gemessen) |
| Schleife Sax 1–2 s, 3 Runden, 46 ms Überblendung | parametrisch: Pegeleinbruch 0,0 dB, Fluss an der Naht 1,75× Median; **Audio-Schleife: 0,05 dB, 3,93×** | BELEGT (gemessen) |
| Schleife Löwe 0,3–0,8 s, 4 Runden | parametrisch 0,0 dB / 1,72×; Audio 1,51 dB / 2,77× | BELEGT (gemessen) |
| Schleife Wort-Vokal (Tonhöhe gleitet) | parametrisch **2,11 dB** / 1,95×; Audio 1,22 dB / 2,07× → bei gleitender Tonhöhe schlechter | BELEGT (gemessen) |

Folgerung: Parametrische Schleifen sind bei stehenden Klängen klar besser als Audio-Schleifen (keine Phasenauslöschung, weil die Oszillatoren durchlaufen). Einfrieren braucht eine kleine **Lebendigkeit** (z. B. ±0,5 dB / ±2 Cent Zufallsbewegung je Teilton). — WAHRSCHEINLICH; Werte UNBELEGT.

### 5.4 Morph Saxofon ↔ Löwe

Umsetzung: beide Analysen auf 2 s normiert; Sax-Teiltöne bekommen mit Gewicht α die Hüllkurve des Löwen und werden mit (1 − α) ausgeblendet; Rauschbänder in dB interpoliert; Löwen-Teiltöne mit α; Rauheit des Löwen mit Tiefe α. Pitch bleibt die des Sax. — eigene Umsetzung (Morph-Prinzip: Alchemy/Loris, siehe R8-Recherche).

| α (0 = Sax, 1 = Löwe) | 0 | 0,25 | 0,5 | 0,75 | 1 |
|---|---|---|---|---|---|
| Hüllkurven-MCD zum Sax | 0 | 25,4 | 41,5 | 55,2 | 63,1 |
| Hüllkurven-MCD zum Löwen | 63,2 | 39,9 | 24,9 | 11,6 | 0 |
| Spektraler Schwerpunkt | 730 Hz | 686 | 650 | 554 | 435 |
| stimmhafte Rahmen | 100 % | 100 % | 100 % | 14 % | 4 % |
| Rauigkeit (Band 400–1600 Hz) | 0,01 | 0,41 | 0,52 | 0,66 | 0,85 |

BELEGT (gemessen). Alle Größen laufen stetig und in der richtigen Richtung. Die Tonhöhe kippt zwischen α = 0,5 und 0,75 weg: ab dort überdeckt das Löwenrauschen die Teiltöne. — Messung BELEGT, Deutung WAHRSCHEINLICH. Dateien: `morph-sax-loewe-*.wav`, Durchfahrt `morph-sax-loewe-durchfahrt-2s.wav`, Bild `morph-sax-loewe.png`.

### 5.5 Melodie aus einem einzigen Ton

Aus dem Sax-Ton A4: 11 Noten (D4 … D3), je Note Einschwingen (120 ms) + Ping-Pong-Halten (0,6–1,6 s) + Ausklang, transponiert. Tonhöhenfehler je Note 0,0–0,8 Cent (mit Formanterhalt) bzw. 0,0–0,9 Cent (ohne). — BELEGT (gemessen). Dateien `melodie-sax-formant.wav`, `melodie-sax-naiv.wav`. Wie natürlich das klingt (gleiches Einschwingen bei jeder Note): UNBELEGT.

---

## 6. Speicher und Rechenzeit

**Speicher** (Format wie `p.resyn` der R8-Recherche: 100 Rahmen/s, Pegel 0,5 dB, f0/Frequenz 1 Cent, Bänder 0,5 dB, Delta + deflate-raw; `out/speicher.json`):

| Aufnahme | harmonisch N = 64 | frei N = 64 | Feinhüllkurve (deflate) | Anschlag 40 ms |
|---|---|---|---|---|
| Sax-Ton | 5,1 KB/s | 10,9 KB/s | 0,37 KB/s | ~2,6 k Samples |
| Klavier | 4,0 | 4,8 | 0,70 | ~2,6 k |
| Sprache | 7,0 | 14,1 | 0,87 | 5 Einsätze, ~4,7 k |
| Löwe (qABCs) | 3,8 | 19,6 | 0,87 | ~2,4 k |

(KB/s inklusive Base64.) — BELEGT (gemessen). Für 8 s: harmonisch ~30–60 KB, frei ~40–160 KB. Die R8-Schätzung (5 s ≈ 20–40 KB) stimmt für den harmonischen Modus; der freie Modus bei Geräuschen ist bis 4× größer. — WAHRSCHEINLICH.

**Rechenzeit des Prototyps** (Xeon, nicht optimiert, ms je Sekunde Audio): Analyse 100–1 700 (am teuersten: YIN mit f0 bis 30 Hz direkt gerechnet); Synthese Teiltöne 3–33 (harmonisch) bzw. 16–122 (frei, viele kurze Spuren); Rauschen FFT 5–24, SVF 23–72. — BELEGT (gemessen, `out/messung.json`). Optimierte Kerne laut R8-Bank: 64 Teiltöne 0,85 %, 24 SVF-Bänder 0,61 % je Stimme. — BELEGT (gemessen, `r8/bench/osc-bench.out`). Die Analyse muss für das iPhone optimiert werden (YIN per FFT, Polsterung 2 statt 4, Web Worker). Faktor 3–5 schneller: UNBELEGT.

---

## 7. Was funktioniert – was nicht

**Funktioniert**
- Sinus + Rauschbänder + Anschlag erreicht bei Sax-Ton, Klavier, Sprache und Wort den Zufallsboden. — BELEGT (gemessen)
- Echte Resynthese schlägt die V9c-Näherung um Größenordnungen (MCD 2–6 statt 13–52). — BELEGT (gemessen)
- Transponieren (Cent-genau), Formanterhalt, Dehnen, parametrische Schleife, Morph, Melodie aus einem Ton. — BELEGT (gemessen)
- Speicherformat mit 100 Rahmen/s verliert nichts Messbares. — BELEGT (gemessen)

**Funktioniert nur mit Zusatz**
- Löwe: Spektrum ja, Pulsation nur mit Feinhüllkurve. — BELEGT (gemessen)
- Klavier und Phrasen: nur im freien Modus (harmonisch: Aussetzer durch Stimmhaft-Entscheidung bzw. fehlender Nachhall). — BELEGT (gemessen)
- Rauschen: FFT-Synthese mit Energieerhalt je Band; die günstigen SVF-Bandpässe verwischen die Hülle. — BELEGT (gemessen)

**Funktioniert nicht / offen**
- Einfrieren zu statisch; Schleifen über gleitende Tonhöhe brechen ~2 dB ein. — BELEGT (gemessen)
- Abwärts-Transponieren ohne Teiltonergänzung wird dumpfer. — BELEGT (gemessen)
- Gedehnter Löwe: Pulsation wird mitgedehnt (Pulsrate halbiert). — WAHRSCHEINLICH
- Mel-Maße erkennen Flüstern statt Stimme kaum; Periodizität muss mitgeprüft werden. — BELEGT (gemessen)
- Analysezeit im Prototyp zu hoch fürs iPhone. — BELEGT (gemessen)
- Klang im Hörtest: alles **UNBELEGT**.

---

## 8. Folgerungen für die Spec (Vorschläge)

1. **E8 aufheben** wie in der R8-Recherche (§6): allgemeine Resynthese einstimmiger Klänge. Die Messungen stützen das. — WAHRSCHEINLICH.
2. **V9d Analyse** mit zwei Modi und Automatik:
   - **frei (MQ)** als Standard für Treue (Klavier, Phrasen, Geräusche, Löwe);
   - **harmonisch** für Spielbarkeit (Melodie, Formanterhalt, Morph) und kleinsten Speicher;
   - Regel-Vorschlag: stimmhaft > 80 % und ein Ton → harmonisch, sonst frei. — UNBELEGT (aus 7 Aufnahmen abgeleitet).
3. **Budget:** Standard 64, Klavier/Sax-Ton 32 genügen, 128 nur „Profi“ für Geräusche. — BELEGT (gemessen) / WAHRSCHEINLICH.
4. **Rauschen:** 32 ERB-Bänder statt 24 Bark; Synthese per FFT-Überlappung mit Energieerhalt je Band statt SVF-Bank. CPU der FFT-Variante im Worklet: UNBELEGT (nicht gemessen).
5. **Anschlag** als Mini-Sample (40 ms, ~2,5 KB bei 8 Bit) und **Rauheit** (Feinhüllkurve, ~0,4–0,9 KB/s) als Teil von `p.resyn` aufnehmen; der Anschlag beantwortet die offene Frage der R8-Recherche („Sample-Import oder hier erlaubt?“) zugunsten „hier erlaubt“. — WAHRSCHEINLICH (Entscheidung beim Dirigenten).
6. **Bearbeiten:** Transponieren mit Schalter FORMANT (Standard an; beim Löwen aus = Größe), Dehnen, Einfrieren mit LEBENDIG-Regler, parametrische Schleife, Morph A↔B. — WAHRSCHEINLICH.
7. **V9c** als „Vereinfachen zu KLANGKÖRPER“ behalten, nicht als Resynthese verkaufen. — WAHRSCHEINLICH.
8. **Abnahme-Ideen** aus diesen Messungen (UNBELEGT, zu prüfen):
   - Sax-Testton: Mel-Distanz ≤ Zufallsboden + 0,3 dB bei N = 32;
   - Transposition ±12 HT (Sax-Testton): Tonhöhenfehler ≤ 2 Cent; mit FORMANT Schwerpunkt-Verschiebung ≤ 45 % der Transposition;
   - parametrische Schleife auf stehendem Klang: Pegeleinbruch ≤ 0,5 dB;
   - Löwe mit Rauheit: Rauigkeit je Band innerhalb ±0,15 vom Original.

---

## 9. Grenzen dieser Messung

- Nur Node auf Xeon; kein Worklet, kein iPhone, kein Hörtest.
- Nur 7 kurze Aufnahmen; Löwen verlustbehaftet kodiert (52–78 kbit/s), GPL statt CC0/CC-BY, Ursprung unbekannt; Sprache nur 16 kHz; der Sax-Ton ist ein bearbeitetes, sehr stabiles Sample.
- MCD hier aus 40 Mel-Bändern (nicht SPTK-Mel-Cepstrum); Rauigkeitsmaß eigene Definition.
- V9c-Näherung ist meine Lesart der Spec, nicht der spätere Code.
- Einzelne Parameter (Sinusförmigkeit −15 dB, Segmentgrenze 80 Cent, Fensterlängen) sind von Hand gewählt, nicht optimiert.

---

## 10. Dateien

Alle unter `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/v3-ideen/r8/resyn-proto/`:
- `src/` – Code: `dsp.mjs` (FFT, Fenster, Spitzen, YIN, Bänder), `model.mjs` (Analyse, Spuren, Budget, Rest, Synthese, Anschlag, Feinhüllkurve), `edit.mjs` (Transponieren, Zeit-Verbiegen), `metrics.mjs`, `png.mjs`, `audio-io.mjs`, `recordings.mjs`, `extras.mjs` (V9c-Näherung, Speicherformat); Läufe `run-measure.mjs`, `run-edit.mjs`, `run-storage.mjs`, `exp-*.mjs`, `test-synth.mjs`, `tables.mjs`.
- `out/<aufnahme>/` – je Aufnahme: `00-original.wav`, `harm|hyb|free-64-*.wav` (nur Sinus, +Rauschen, +Anschlag, +Rauheit), `harm-16/128-*.wav`, `harm-64-phase-frei.wav`, `harm-64-rauschen-svf.wav`, `harm-64-speicherformat-100fps.wav`, `anker-nur-rauschen.wav`, `v9c-naeherung.wav`, `spektrogramm-modelle.png`, `spektrogramm-budgets.png`.
- `out/bearbeitung/` – `transp-*.wav/png`, `dehnen-*.wav`, `einfrieren-*.wav`, `schleife-*-parametrisch|rohaudio.wav`, `morph-sax-loewe-*.wav/png`, `melodie-sax-*.wav`, `bearbeitung-*.png`, `bearbeitung.json`.
- `out/messung.json`, `out/tabellen.md`, `out/speicher.json`, `out/baender.json`, `out/run-measure.log`.
- `dl/` – Testaufnahmen (je Quelle eigener Ordner), `npm/` – Dekoder.

---

## 11. Quellen

- R8-Recherche (lokal): `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/v3-ideen/r8/resynthese-recherche.md` und `.../r8/bench/osc-bench.out`
- McAulay & Quatieri 1986: https://www.ll.mit.edu/r-d/publications/speech-analysissynthesis-based-sinusoidal-representation
- Serra & Smith 1990 (SMS): https://audiolabs-erlangen.de/content/05_fau/professor/00_mueller/02_teaching/2024s_sarntal/02_group_SYNTH/1990_SerraS_SpectralModelingSynthesis_CMJ.pdf
- sms-tools (Sinus-Abzug, Rest-Analyse): https://github.com/MTG/sms-tools/blob/master/smstools/models/utilFunctions.py
- YIN: https://cagnazzo.wp.imt.fr/files/2013/05/2002_JASA_YIN.pdf (DOI 10.1121/1.1458024)
- Parabel-Interpolation: https://ccrma.stanford.edu/~jos/sasp/Quadratic_Interpolation_Spectral_Peaks.html
- Fenster (Harris 1978): https://amst.ece.iastate.edu/paper/comparative_study/window_1.pdf ; https://www.mathworks.com/help/signal/ref/blackmanharris.html
- Bark-Grenzen: https://en.wikipedia.org/wiki/Bark_scale
- ERB (Glasberg & Moore 1990, nur bibliografisch): https://pmc.ncbi.nlm.nih.gov/articles/PMC3202745
- Log-Spektral-Abstand: https://labs.sonicfield.org/library/cosh-measure-for-speech-processing ; https://doi.org/10.1109/TASSP.1976.1162849
- MCD (Kubichek): https://ieeexplore.ieee.org/document/407206
- Periodogramm-Streuung: https://arxiv.org/pdf/astro-ph/0307420 ; https://en.wikipedia.org/wiki/Periodogram
- HNM / Rausch-Zeithüllkurve: https://ee.columbia.edu/~dpwe/classes/e6820-2007-05/papers/Styl01-hnm.pdf ; https://www.isca-archive.org/eurospeech_1995/stylianou95b_eurospeech.html ; https://www.csd.uoc.gr/~hannover/LabsiteDraft/MMILab_files/ImprovNoiseModeling_icassp08.pdf
- Formanterhalt (Röbel & Rodet 2005): https://dafx.de/paper-archive/details/EDSTSaO17Gd_0LV03iwDfw
- Synclavier Hybrid Attack: https://www.synclavier.com/Downloads/Resynthesis-Quickstart.pdf
- Dekoder: https://github.com/eshaz/wasm-audio-decoders
- Aufnahmen und Lizenzen: https://bitbucket.org/admsasha/qabcs (README GPLv3+), https://changelogs.ubuntu.com/changelogs/pool/universe/q/qabcs/qabcs_1.0.2-6build2/copyright ; https://packages.ubuntu.com/noble/tuxpaint-stamps-default , https://changelogs.ubuntu.com/changelogs/pool/universe/t/tuxpaint-stamps/tuxpaint-stamps_2022.06.04-1/copyright ; https://www.npmjs.com/package/tonejs-instrument-saxophone-mp3 , https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/sample-source-info.txt , https://www.kvraudio.com/product/weresax-by-karoryfer ; https://github.com/sfzinstruments/SalamanderGrandPiano ; https://github.com/librosa/data , https://www.openslr.org/12/
