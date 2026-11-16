# NST1 – Recherche: Oszillator-Wert, der mit jeder neuen Note einen Schritt weitergeht

Stand 16.11.2026. Methode: Web-Suche, Aussagen nur mit Quelle. Hinweis: Direkte Seitenabrufe von
bitwig.com, surge-synthesizer.github.io und admiralbumblebee.com waren in dieser Sitzung vom Netz gesperrt;
Angaben dazu stammen aus Such-Auszügen dieser Seiten. Wo nur Forenbeiträge belegen, steht „(Forum)“.

## 1. Kurzantwort

- Die Bausteine gibt es seit Jahrzehnten. Ein Notenanschlag erzeugt einen Wert, der für diese Note gilt:
  Zufall je Note, Wechsel +/− je Note, Round Robin, ein Zähler je Note, ein LFO, dessen Wert beim Anschlag
  festgehalten wird, und die Spreizung über Stimmen.
- Selten ist eine Treppe oder ein Muster, das mit jeder Note weiterläuft, also unabhängig von der Zeit.
  Belege dafür: Korg OASYS/Kronos „Note-On Advance“, Korg modwave „Note Advance“, Omnisphere „Alternate
  3-Step/4-Step“, u-he Zebra MMap „Alternate“, Bitwig „Note Counter“ und der Pigments-6-„Voice Modulator“.
  Am Modularsystem ist es ein Kabel: das Gate der Tastatur geht auf den Takteingang des Sequenzers.
- Nicht gefunden habe ich ein fertiges Bedienelement, bei dem EIN Notenzähler 2–3 Oszillatoren zugleich in
  verschiedene Richtungen schickt („Kreuzen“, Ping-Pong, Fächer Mitte/Breite/Tiefe/Höhe). Es müsste außerdem
  dafür sorgen, dass die Oszillatoren nie gleich stehen, und die Ziele Welle, Verhältnis, Verstimmung und
  Pulsbreite direkt anbieten. Bei anderen baut man das von Hand: mehrere Wege in der Mod-Matrix,
  Vorzeichen umdrehen, Lanes mit verschiedener Länge. Diese Bündelung wäre das Neue an Xanders Idee.

## 2. Was es gibt (nach Art)

### A. Zufall je Note („Note-On Random“) – üblich
| Gerät | Was | Beleg |
|---|---|---|
| Serum | Quellen „NoteOn Rand1/2“ (Mod Source › Note). Jede Note bekommt einen Zufallswert; Stärke und uni/bipolar stellt man in der Matrix ein. Polyphon je Note, aber nicht je Unison-Stimme (Forum) | KVR p=9059297, p=9059405 |
| Vital | Das „Random“-Feld unten rechts zieht man auf einen Regler; je Note entsteht ein eigener, gehaltener Wert (Forum) | forum.vital.audio 6433, 12605 |
| Omnisphere 2 | „Random 1–4“: jeder Anschlag erzeugt einen Zufallswert, polyphon | Spectrasonics-Handbuch |
| Logic Alchemy | „Random 1–4“: ein fester Zufallswert je Note, unipolar | Apple-Hilfe |
| Logic Sculpture | 2× „Note-On Random“ mit Ziel und Stärke, der Wert bleibt bis zum Loslassen | Apple-Hilfe |
| Massive X | „Voice Randomization“: fester Wert je Stimme. Laut Forum wiederholt sich das Muster nach der Stimmenzahl | NI-Handbuch, NI-Forum |
| Phase Plant | Der Random-Modulator gibt je Stimme einen anderen Wert. Auslöser „Always“ heißt: bei jedem Note-On | kilohearts docs/blog |

### B. Wechsel je Note („Alternate“, Ping-Pong) – verbreitet, aber seltener
- Omnisphere 2: „Alternate“ wechselt mit jedem Anschlag zwischen + und −. Dazu gibt es „Alternate
  Unipolar“ und **„Alternate 3-Step / 4-Step“**, also eine Treppe mit 3 oder 4 Stufen je Anschlag, polyphon.
- LinPlug Alpha/MorphoX: „Alternate“ springt je Note zwischen +1 und −1 (Beispiel: Auto-Pan).
- Vital hat das nicht. Ein Nutzer wünschte sich einen Wechsel −1/+1 je Note; die Antwort war, es gebe
  keinen direkten Weg (Forum).

### C. Zähler oder Treppe je Note („Step per Note“) – selten, kommt Xanders Idee am nächsten
- **Korg OASYS/Kronos, Wave Sequence „Note-On Advance“**: Der Startschritt rückt mit jeder neuen Note um
  eins weiter und beachtet dabei die Schleifen-Richtung. Das Handbuch rät: „Try using this with the
  Arpeggiator!“ Drittanbieter nutzen es für Round Robin (korgforums). Ist Note-On Advance aus, kann man den
  Startschritt je Note mit z. B. Anschlag, LFO oder Zufall verschieben.
- **Korg modwave (Wave/Motion Sequencing 2.0)**, „Standard Lane Controls“: „Note Advance“ zählt den
  Startschritt bei jeder Note um eins hoch. Die Schleife läuft vorwärts, rückwärts oder vor-zurück. Beim
  Schwester-Gerät wavestate kann jede Lane eine eigene Schrittzahl und eigene Schleifenpunkte haben (SOS).
  Daraus folgen Muster, die gegeneinander laufen. Ob Note Advance bei wavestate genauso je Lane wirkt,
  konnte ich im Handbuch nicht prüfen.
- **Omnisphere 2 „Alternate 3-Step/4-Step“** (siehe B): eine feste, kurze Treppe je Anschlag.
- **u-he Zebra, MMap im Modus „Alternate“**: beginnt bei 0 und springt mit jeder neuen Note zum nächsten
  gezeichneten Wert. Beispiel aus dem Forum: Pan, Akkord mit 2 Tönen, der erste geht rechts, der zweite links.
- **Bitwig „Note Counter“**: Mit jeder gespielten Note zählt ein Zähler hoch und gibt einen Wert aus.
  Einstellbar sind der Schritt je Note, die Schrittzahl und uni-/bipolar (Review Admiral Bumblebee 2017).
- **Arturia Pigments 6 „Voice Modulator“** (Bereich Random): eine Art polyphoner Step-Sequenzer mit bis zu
  8 Werten je Note oder Stimme (SOS). Für das Verhalten zwischen den Noten gibt es „cycle / reassign /
  random“ (CDM); der Zyklus reicht laut Review über 1–8 Noten.
- **Ableton**: Sampler hat Round Robin, ältere Versionen nutzen den Random-MIDI-Effekt im Modus „Alt“
  (Cycling-74-Forum). In Max for Live macht man aus jeder Note einen „bang“ und zählt mit einem Counter.

### D. Round Robin (aus der Sampler-Welt, auch für Oszillatoren) – üblich
- Kontakt, Gruppen-Startoptionen: „Cycle Round Robin“ geht reihum in fester Folge, „Cycle Random“ wählt
  zufällig. Je Instrument gibt es nur einen Zähler. Starres Reihum klingt bei schnellen Wiederholungen hörbar
  nach Muster, darum oft zufällig ohne Wiederholung (Orange Tree).
- Korg Mono/Poly (1981) hatte „round-robin oscillator triggering“ über seine 4 VCOs. multi/poly bietet
  „Layer Rotate“, also Round Robin über ganze Programme (Korg).

### E. LFO-Wert beim Anschlag festhalten („LFO durch den Oszillator schicken“) – Elektron
- Elektron-LFO-Modus **HLD**: Der LFO läuft im Hintergrund frei, beim Anschlag wird sein Wert eingefroren und
  bis zur nächsten Note gehalten (Analog-Rytm-Handbuch). Der Modus TRG startet den LFO dagegen neu.
  Das ist genau Xanders erster Gedanke. Ein langsamer Sägezahn-LFO im Modus HLD ergibt eine weiche Treppe,
  die vom Spieltempo abhängt.
- Vorsicht bei Polyphonie: Beim Digitone gab es einen Fehlerbericht, wonach HLD nur abtastet, wenn eine
  bestimmte Stimme anschlägt (Forum).

### F. Spreizung über mehrere Oszillatoren oder Stimmen – üblich bei Unison
- Bitwig Voice Stacking: Der Modulator „Voice Stack“ verteilt Werte über die gestapelten Stimmen,
  unipolar 0…100 %, bipolar −100…+100 % oder als „Value“ in 100-%-Schritten. Bei 3 Stimmen ergibt das
  −1 / 0 / +1 (KVR „StackIndex“). Das entspricht Xanders „Mitte/Tiefe/Höhe“, aber fest und nicht je Note
  weiterlaufend.
- Serum: Mit Unison und WT POS spielen mehrere Wavetable-Positionen gleichzeitig. Andere Synths haben
  „Position Spread“ (Wavetable-Positionen gespreizt) oder einen Zufallsmodus.

### G. Ursprung Hardware/Modular – „Gate taktet Sequenzer“
- Sound On Sound: Den Gate-Ausgang der Tastatur steckt man in den Takteingang des Sequenzers, dann rückt
  jede gespielte Note einen Schritt weiter. So war es schon bei Buchla 123, Moog 960 und Roland 182 (Zoë
  Blade). Make Noise René: Jeder Takt-/Gate-Impuls an X-CLK rückt die X-Achse um eins vor.
- Buchla Music Easel: Die Sequential Voltage Source (5 Schritte) hat einen Auslöser-Wähler aus/Pulser/
  Tastatur.

### H. Verwandt, aber zeitgesteuert statt notengesteuert
- Elektron: Mit Parameter-Locks hat jeder Schritt eigene Werte (z. B. Welle oder Verhältnis). Trig-
  Conditions (1:2, PRE, NEI, FILL, %) zählen Pattern-Durchläufe, keine gespielten Noten.
- Korg Wavestation/wavestate: Wave Sequencing läuft in Zeitschritten. Erst „Note-On Advance“ (siehe C)
  macht es notengesteuert.
- Waldorf Microwave: Wavetable-Schritte fährt man klassisch mit Modrad oder Hüllkurve (SOS). Ein „Schritt je
  Note“ war nicht zu finden.

## 3. Bedien-Vorbilder (wie viele Griffe)
| Vorbild | Ablauf | Griffe ca. |
|---|---|---|
| Vital Random | Feld auf den Regler ziehen, Stärke einstellen | 2 |
| Serum NoteOn Rand | Rechtsklick auf das Ziel › Note › NoteOn Rand1, Stärke in der Matrix | 3 |
| Omnisphere Alternate 3/4-Step | Quelle im Menü wählen, Ziel wählen, Tiefe einstellen | 3 |
| Elektron LFO HLD | Modus auf HLD, Ziel wählen, Tiefe einstellen | 3 |
| Kronos Note-On Advance | 1 Schalter, aber erst eine Wave Sequence bauen | 1 (+ Aufbau) |
| Bitwig Note Counter | Modulator hinzufügen, Schritte einstellen, Ziel per Klick zuweisen | 3–4 |
| Pigments Voice Modulator | Im Bereich Random wählen, Werte und Modus einstellen, auf den Parameter ziehen | 3–4 |
| Zebra MMap Alt | Werte zeichnen, Modus Alt, Zuweisung in der Matrix | 4+ |
| Modular | 1 Kabel vom Gate zum Takt des Sequenzers | 1 |
Fazit für die Bedienung: Am schnellsten geht es, wenn der Wert direkt am Ziel-Regler entsteht (Vital: Ziehen;
Serum: Rechtsklick am Ziel). Für Muster mit mehreren Oszillatoren gibt es nirgends eine Ein-Griff-Lösung.

## 4. Was an Xanders Idee neu wäre
1. Ein Zähler je Note treibt **mehrere Oszillatoren mit eigener Richtung**: hoch, runter, Ping-Pong,
   Fächer und „Kreuzen“. Ich habe das nur als Handarbeit gefunden (Bitwig: Note Counter mit +/− auf zwei
   Ziele; wavestate/modwave: Lanes verschiedener Länge). Als fertiges Bedienelement habe ich es nicht
   gefunden.
2. Die Regel **„nie ein perfekter Layer“**: Die Oszillatoren stehen nach Absicht nie auf demselben Wert
   bzw. Verhältnis. Eine solche Regel war nirgends beschrieben.
3. **Ziel-Liste für Oszillator-Werte** (Welle, Verhältnis, Verstimmung, Pulsbreite) samt Muster auf einem
   Blatt, aus dem Zusammenhang heraus aufrufbar. Andere verlangen dafür eine Mod-Matrix.

## 5. Klang „Radio-Sendersuche“ – wie er klassisch entsteht
- Physik: Liegen zwei AM-Träger dicht beieinander, schwebt die Mischung. Der Detektor gibt einen Pfeifton
  in Höhe des Frequenzabstands aus; zieht man am Regler, wandert der Ton (mwcircle, Radio World,
  HyperPhysics).
- Klanggestaltung: Rauschen als feststehendes Bett. Darüber eine Bewegung mit gleitenden Tönen, kurzen
  Fetzen von Sendern und Knacksern, ungleichmäßig im Takt (Morphic-Leitfaden; Forum homerecording).
  Üblicher Aufbau: Rauschen, Sinus-Sweep, Bandpass-Sweep. Wichtig ist AM-Charakter, nicht FM
  (Forum-Tipp). Fertiges Werkzeug: Audio Ease Speakerphone simuliert das Durchdrehen der Skala (Forum).
- Folgerung (meine Ableitung, nicht belegt): Sprünge des FM-Verhältnisses oder der Welle je Note klingen wie
  „Sender springen“. Mit kurzem Gleiten zwischen den Stufen und etwas Rauschen kommt man nahe an das
  Durchdrehen der Skala heran.

## 6. Folgerung für NST1 (Vorschlag)
- Schon im Synquenzer 4.78.0 (kurze Code-Suche): „Analog (Zufall je Note)“ für Tonhöhe und Cutoff,
  LFO mit KEY SYNC (Neustart je Note), LFO-Form S&H, „Locks je Note“ im Sequenzer. Einen Zähler je
  gespielter Note fand ich dort nicht.
- Kern (billig): Der Schritt wird **nur beim Note-On** im Hauptthread oder Worklet berechnet. Es ist ein
  Wert je Stimme, im Audio-Thread wird pro Sample nichts zugewiesen und nichts gerechnet.
- Muster: hoch, runter, hoch-runter (Pendel), Zufall ohne Wiederholung, fest. Für 2–3 Oszillatoren gibt es
  Verbund-Muster: „Gleich“, „Gegen“ (kreuzen), „Ping-Pong“, „Fächer“ (Versatz je Osz, nie gleich).
  Dazu Schritte 2–8 und optional „Gleiten“ für den Radio-Effekt.
- Zweiter Modus „LFO halten“ nach dem Elektron-Vorbild HLD: Der LFO läuft frei, sein Wert gilt je Note.
- Bedienung im vorhandenen Stil: am Ziel-Regler halten und „Je Note“ wählen (wie Serum-Rechtsklick),
  höchstens 3 Griffe.

## Quellen
- Serum NoteOn Rand: https://www.kvraudio.com/forum/viewtopic.php?p=9059297 · https://www.kvraudio.com/forum/viewtopic.php?p=9059405 · https://www.audiotent.com/blogs/production-tips/adding-randomness-to-synth-presets-in-xfer-serum
- Vital: https://forum.vital.audio/t/every-note-random-pan/6433 · https://forum.vital.audio/t/polyphonic-random-stereo-per-note/12605 · https://forum.vital.audio/t/alternate-modulation-option/10415
- Omnisphere 2 Mod-Quellen: https://support.spectrasonics.net/manual/Omnisphere2/layer_page/modulation/page04.html
- LinPlug Alpha Alternate: https://www.manualsdir.com/manuals/803512/linplug-alpha.html?page=28 · MorphoX: https://www.manualsdir.com/manuals/803515/linplug-morphox.html?page=44
- Apple Sculpture Note-On Random: https://support.apple.com/lt-lt/guide/mainstage/use-note-on-random-modulators-lgsia131e5c/mac · Alchemy Note-Property: https://help.apple.com/logicpro/mac/10.4/en.lproj/lgsi2c92edc1.html
- Massive X Voice Randomization: https://native-instruments.com/ni-tech-manuals/massive-x-manual/en/voice-randomization · https://community.native-instruments.com/discussion/17324/what-is-the-point-of-voice-randomization-vr-in-massive-x
- Phase Plant: https://kilohearts.com/docs/modulation · https://kilohearts.com/blog/power_of_triggers
- Korg OASYS Note-On Advance / Start Step: https://www.manualslib.com/manual/836401/Korg-Oasys.html?page=170 · https://www.manualslib.com/manual/836401/Korg-Oasys.html?page=171
- Korg Kronos: https://www.manualslib.com/manual/1264657/Korg-Kronos.html?page=193 · https://www.korgforums.com/forum/phpBB3/viewtopic.php?p=773399
- Korg modwave Lane Controls: https://www.manualslib.com/manual/2157468/Korg-Modvawe.html?page=39 · wavestate: https://www.soundonsound.com/reviews/korg-wavestate · https://manualshive.com/en/manual/korg/wavestate-native/1998655?page=35
- u-he Zebra MMap: https://www.kvraudio.com/forum/viewtopic.php?p=3416610
- Bitwig Note Counter: https://admiralbumblebee.com/music/2017/06/23/Bitwig-Modulators.html · Voice Stack: https://www.bitwig.com/userguide/latest/modulator · https://www.kvraudio.com/forum/viewtopic.php?p=8918375
- Pigments 6 Voice Modulator: https://www.soundonsound.com/reviews/arturia-pigments-6 · https://cdm.link/pigments-6-review/
- Ableton Round Robin: https://help.ableton.com/hc/en-us/articles/115000267664-How-to-create-Round-Robin-sample-playback · https://cycling74.com/forums/cycle-samples-with-midi-note-input · https://forum.ableton.com/viewtopic.php?p=1752106
- Kontakt: https://www.adsrsounds.com/kontakt-tutorials/the-power-of-cycle-random-in-ni-kontakt/ · https://www.orangetreesamples.com/blog/scripting-nonrepeating-roundrobin
- Korg Mono/Poly, multi/poly: https://www.korg.com/us/products/synthesizers/multipoly
- Elektron LFO HLD: https://www.manualsdir.com/manuals/657159/elektron-analog-rytm.html?page=79 · Digitone-Bericht: https://www.elektronauts.com/t/digitone-digitone-keys-1-30-bug-reports/133294/31
- Elektron Trig Conditions: https://manualslib.com/manual/1790470/Elektron-Cycles.html?page=32
- Gate taktet Sequenzer: https://www.soundonsound.com/techniques/exploring-analogue-part-3 · https://notebook.zoeblade.com/Analogue_step_sequencer.html · https://en.wikipedia.org/wiki/Analog_sequencer · René: https://www.manualsdir.com/manuals/698370/make-noise-ren.html?page=9
- Buchla Easel: https://buchla.com/guides/Easel_Quickstart_Guide.pdf · https://lanterman.ece.gatech.edu/buchla/boards/mea-sequencer/mea_sequencer
- Serum Unison/WT Pos: https://www.scribd.com/document/718531025/Serum-Manual
- Waldorf Microwave: https://www.soundonsound.com/techniques/getting-creative-waldorf-microwave-synths
- Radio, Physik: https://mwcircle.org/6-interference/ · https://www.radioworld.com/tech-and-gear/tech-tips/get-that-beat-out-of-your-head · https://hyperphysics.gsu.edu/hbase/Audio/radio.html
- Radio, Klanggestaltung: https://morphic.com/resources/sounds/radio-tuning-sound-effects · https://homerecording.com/bbs/threads/radio-tuning-sweepy-thingy.259752/ · https://freesound.org/people/jascha23/sounds/161083/
