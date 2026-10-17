# SYNQUENZER – Transposition mit „LAGE“ (Wunsch T): Befund V0a, Recherche, Entwurf, Beweis, Abnahme

Stand 17.10.2026 · Runde 8 · Auftrag „Xander Abschnitt T“ (`fragen-xander-8.md` T, V; `fragen-xander-7.md` F, S)
Prototyp und Messungen: `v3-ideen/r7/lage-proto/` — `core.mjs` (lädt den Harmonie-Kern unverändert aus V0a.html), `repro-ist.mjs` → `repro-ist.out`, `lage.mjs` (Fassung 2), `beweis.mjs` → `beweis.out`, `stress.mjs` → `stress.out`; **nach Review: `lage3.mjs` (Fassung 3, gilt) und `pruef3.mjs` → `pruef3.out`**. Wo Fassung 3 von Fassung 2 abweicht, steht es im Text; die Zahlen aus `beweis.out`/`stress.out` gelten nur, wo Fassung 3 sie nicht ersetzt. `synq-snapshots/V0a.html` wurde nur gelesen.

**Kennzeichen**
- **BELEGT** = Wortlaut oder Zahl aus der Quelle: Code-Zeile in V0a.html, eigene Messung im Prototyp, Handbuch-Zitat im Suchauszug.
- **WAHRSCHEINLICH** = Sekundärquelle, Forum, Händler, Zusammenfassung ohne wörtliches Zitat, oder ein Schluss aus Belegen.
- **UNBELEGT** = nicht gefunden oder eigene Annahme.
- **(SE)** = nur Suchauszug. Direkter Abruf war am 17.10.2026 gesperrt (gemessen): `usa.yamaha.com`, `data.yamaha.com`, `forum.psrtutorial.com`, `archive.steinberg.help`, `teenage.engineering` antworteten auf curl mit „CONNECT tunnel failed, response 403“, WebFetch mit „ENOTFOUND“ (auch `en.wikipedia.org`). Alle Hersteller-Aussagen stammen deshalb aus Suchauszügen.
- Code-Zeilen „Z. n“ beziehen sich auf `synq-snapshots/V0a.html` (Kern-Abschnitt Z. 3553–3807, sha256/16 `ad45e0c27e18b8bb`, BELEGT laut `repro-ist.out`).

---

## 0 Kurzantwort für Xander (kurz und knapp)

- **Ja, das liegt an einer Regel.** Beim Transponieren schaut die App heute nicht darauf, wo deine Hand greift. Jeder Clip nimmt den kürzesten Weg zu **seinem eigenen** Grundton, also höchstens 5 Halbtöne runter oder 6 hoch. C → F ist für einen C-Clip deshalb immer +5, also höher, egal ob du oben oder unten greifst. Ein a-Moll-Clip geht beim selben F dagegen 4 Halbtöne runter. Darum klingen nur „manche“ Sequenzen höher. Grenzen je Spur gibt es heute keine. (BELEGT, gemessen: `repro-ist.out` A, B)
- **Vorschlag LAGE:** Jede Spur bekommt eine sichtbare **Klammer** an der Tastatur der ROLLE.
  - Der **Bass** bleibt immer darin.
  - **Sequenz** und **Lead** bleiben als Ganzes darin; ihre Melodie wird nie zerschnitten.
  - Die **Fläche** greift um wie ein Keyboarder, statt mitzuspringen.
  - Du stellst nichts ein: Die Klammer kommt aus deinen Clips.
- **Beim Spielen folgt die Musik deiner Hand:** tiefer greifen = tiefer, höher greifen = höher, bis zur Klammer. Das gilt auch für den ersten Griff nach ORIGINAL (unter der Tastatur-Mitte = tiefer) und wenn du denselben Akkord vorher in einer anderen Oktave gegriffen hast (gemessen, `pruef3.out` B1).
- **Für einzelne Akkorde:**
  - In der Akkord-Zeile ziehst du ein Kästchen nach oben (↑) oder unten (↓), z. B. „bei a-Moll nach oben“. Das wirkt auf alle Sequenz- und Lead-Spuren.
  - Soll nur **ein** Clip bei a-Moll nach oben (z. B. die Sequenz, der Lead nicht), tippst du im LAGE-Blatt dieses Clips auf den Akkord-Chip „Am“. Das gilt auch live beim Transponieren.
  - FANG TEIL merkt sich, wie du gespielt hast, und spielt es genau so wieder.

---

## 1 Befund V0a (Ist-Stand, Code gelesen und nachgemessen)

### 1.1 So transponiert der Harmonie-Kern heute

| # | Schritt | Code (V0a.html) | Kennz. |
|---|---|---|---|
| 1 | In TRANSPONIEREN (oder ⇅ gehalten, Split) gehen Tasten an den Transposer: `T.keyDown`. Nach 40 ms Sammeln erkennt `detectChord` den **Träger** `{root, quality, bass, rootNote, …}`. `rootNote` ist der tiefste gedrückte Ton mit der Tonklasse des Grundtons. | Z. 10817–10823, 3593–3622 (`rootNote` Z. 3597/3621), 3733–3757 | BELEGT |
| 2 | Pro Träger-Eintrag wird eine Projekt-Verschiebung gespeichert: bei Oktave „Nächste“ `nearestShift(root, projectKey.root, prev)`, bei „Absolut (CV)“ `rootNote − refNote`. | Z. 3776–3784 | BELEGT |
| 3 | Beim Planen ruft jede Clip-Note `outPitch → T.mapEvent(note, time, {kind, follow}, {key: clip.key})` auf. Drums und Spuren mit ⇅ fest (`follow:false`) bleiben unverändert. | Z. 9501–9504, 9621, 3797–3798 | BELEGT |
| 4 | **Bezug ist die Tonart des Clips** (`clip.key`), nicht die Projekt-Tonart. Die Verschiebung wird neu relativ zum **Clip-Grundton** gerechnet: `nearestShift(target.root, ref.root, e.shift)`. `e.shift` dient nur als Gedächtnis für den Gleichstand beim Tritonus. | Z. 3801–3802 | BELEGT |
| 5 | `nearestShift`: d = Abstand der Tonklassen (0–11). Für d < 6 gilt +d, für d > 6 gilt d − 12, für d = 6 gilt +6 oder −6 je nach Vorzeichen des vorigen Shifts. Wertebereich −5 … +6. | Z. 3664–3667 | BELEGT |
| 6 | `mapNote` bildet Stufen ab (AKKORD/TONART/PARALLEL über `targetScale`/`mapInterval`), legt die Note in die Oktave des Bezugs-Grundtons und addiert den Shift. Gefaltet wird **nur** unter 0 oder über 127. | Z. 3631–3662, 3678–3692 | BELEGT |
| 7 | Standard laut V0a: Modus AKKORD, Einzelton „In Tonart“ (`single:'key'`), Moll äolisch, `keyAware`, Oktave **„Nächste“** (`octaveMode:'nearest'`), Wechsel „Sofort“. | Z. 8057, 9443–9447, 16629–16634 | BELEGT |
| 8 | „Absolut (CV)“: Bezugston `refNote` = der Ton des Clip-Grundtons, der C4 am nächsten liegt (F♯3–F4), oder der beim Aufnehmen gemerkte `ref`. | Z. 3669, 3673, 3779 | BELEGT |
| 9 | Aufnahme unter Träger: Der Bezug des Clips wird `keyForRecording(Träger)`. Unter demselben Träger klingt der Clip dann unverändert. | Z. 3697–3711 | BELEGT |
| 10 | Spur-Einstellungen: ⇅ folgt (`track.follow`, Standard an). „Bei Wechsel: Mitziehen │ Halten“ (`track.onChange`) wirkt auf klingende Noten: Hat eine Note höchstens 0,12 s vor dem Wechsel begonnen, wird sie neu angeschlagen. Sonst wird sie mitgezogen oder gehalten. Das entspricht grob Yamahas RTR (§2.1). | Z. 8200–8201, 9520–9534, 14389 | BELEGT (Code) / Vergleich WAHRSCHEINLICH |
| 11 | MIDI-Export „mit Träger“ ruft `T.mapEvent` direkt auf (Szene Z. 17196, Song Z. 17243–17262). Song-Träger speichern `rootNote` und die Richtung `sd` (nur für den Tritonus). | Z. 4061–4066, 17176 ff., 17236 ff. | BELEGT |
| 12 | Es gibt **keine Lage-Grenze** je Spur oder Clip. `kbOct` ist nur die Tastatur-Oktave beim Spielen, `R.trOct` (1–7, Standard 3) die Tastatur-Oktave in TRANSPONIEREN. | Z. 8194–8203, 9428, 11902 | BELEGT |

### 1.2 Nachgestellt: „vom oberen C auf das untere F“ (BELEGT, gemessen, `repro-ist.out` A)

Demo-Clips aus V0a (Bezug C-Dur): Bass C2 C2 C3 C2 C2 G2 E2 G2, Arp C4 E4 G4 C5 G4 E4, Fläche C4 E4 G4.

| Hand | Oktave „Nächste“ (Standard) | Oktave „Absolut (CV)“ |
|---|---|---|
| C5 | shift 0: Bass C2…, Arp C4…, Fläche C4 E4 G4 | shift +12: Bass C3…, Arp C5… |
| F3 | shift **+5**: Bass F2…, Arp F4…, Fläche F4 A4 C5 | shift −7: Bass F1…, Arp F3… |

Die Hand geht 19 Halbtöne nach **unten**. Die Clips gehen im Standard 5 Halbtöne nach **oben**. Bei C4 → F3 ist es dasselbe, denn „Nächste“ wertet nur die Tonklasse aus.

### 1.3 „Manche“: dieselbe Taste F3, Clips mit verschiedenem Bezug (BELEGT, gemessen, `repro-ist.out` B)

| Clip-Bezug | Grundton → unter F | Richtung |
|---|---|---|
| C-Dur | C4 → F4 | **+5** |
| D-Dorisch | D4 → F4 | +3 |
| E-Moll | E4 → F4 | +1 |
| G-Dur | G4 → F4 | −2 |
| A-Moll | A4 → F4 | **−4** |
| F-Lydisch (unter F eingespielt) | F4 → F4 | 0 |

Weil der Bezug je Clip automatisch erkannt oder aus der Aufnahme übernommen wird (Z. 3697), sieht Xander die Ursache nicht. Er hört nur: Manche Clips gehen hoch, manche runter.

### 1.4 Alle Fälle, in denen der Bass springt oder seine Lage verlässt (V0a)

| # | Fall | Ursache (Code) | Beispiel (gemessen, `repro-ist.out`) | Kennz. |
|---|---|---|---|---|
| F1 | **Wende bei F♯/G**: Ein Grundton-Schritt aufwärts lässt den Clip fast eine Oktave fallen. | `nearestShift` Z. 3664 | chromatisch C…H: 0 +1 +2 +3 +4 +5 **+6 → −5** −4 −3 −2 −1 (Sprung −11) | BELEGT |
| F2 | **Pop-Folgen über die Wende** | wie F1 | C–Am–F–G: Bass C2 → A1 → **F2 → G1** = −3, +8, **−10**; Arp und Fläche springen gleich mit | BELEGT |
| F3 | **Richtung je Clip-Bezug** („manche“) | `mapEvent` Z. 3802 | unter F: C-Clip +5, A-Moll-Clip −4 | BELEGT |
| F4 | **Bezug aus der Aufnahme** kehrt die Richtung um | `keyForRecording` Z. 3697 | Clip unter F eingespielt (Bezug F-Lydisch) → unter C −5 | BELEGT |
| F5 | **Tritonus mit Gedächtnis**: gleicher Akkord, zwei Oktaven | Z. 3664 (prevShift), Z. 3764 (`tieDiff`) | C → F♯: +6 (Bass F♯2); Am → F♯: −6 (Bass F♯1) | BELEGT |
| F6 | **Oktave „Absolut (CV)“ ohne Grenze** | Z. 3673, 3779, 3802 | C2 gedrückt: −24, Bass C0…; C6: +24, Bass C4… | BELEGT |
| F7 | **MIDI-Rand**: Erst unter 0 bzw. über 127 wird gefaltet, dann gehen Oktavsprünge verloren. | `mapNote` Z. 3690–3691 | C0 gedrückt (Absolut): Bass 0,0,0,0,0,7,4,7 | BELEGT |
| F8 | **Geplante Zusätze ohne Grenze**: `S.shift` ±6 (V2f) und `R.xp` ±12 (V2c) kommen laut Spec nach der Abbildung dazu | Spec v3 I-01, §4.4, §4.10 | +6 +6 +12 = +24: Demo-Bass C2–C3 klänge C4–C5 | BELEGT (Spec) / gerechnet |
| F9 | **Keine Lage je Spur oder Clip**, auch kein Boden für Handy-Lautsprecher | – | Zufallsprobe: 3 034 von 10 026 Bass-Runden außerhalb einer gedachten Bass-Klammer (558 schon mit „Nächste“, 1 383 mit Absolut, 1 093 mit Verschiebung) | BELEGT (gemessen, `stress.out`) |
| F10 | **Fläche bewegt sich parallel**: alle Stimmen um denselben Shift, keine Stimmführung | `mapNote` | C–Am–F–G: Summe der Stimmbewegung 65 Halbtöne (`beweis.out` S1) | BELEGT |

Nebenbefund: Die Stufen-Abbildung selbst ändert in 1 463 von ≈ 20 000 Zufallsrunden die Kontur einer Melodie. Bei sus- und 6-Akkorden verschmelzen dabei zwei Stufen zu einem Ton. Das ist Kern-Verhalten, die Lage ändert daran nichts. (BELEGT, `stress.out` `kernAendertKontur`)

---

## 2 Recherche: Wie lösen es andere?

### 2.1 Yamaha Genos / PSR: Style File Format (SFF), Style Creator → SFF Edit

Grundidee: Der Arranger rechnet die Töne des Quellmusters in die gespielten Akkorde um. NTR hängt am Akkord-Grundton, NTT an der Akkordart. (WAHRSCHEINLICH, Forum [Y12])

| Parameter | Was er tut | Kennz. | Quelle |
|---|---|---|---|
| **NTR Root Trans** | Intervalle bleiben. Beispiel im Handbuch: C3 E3 G3 in C werden über F zu **F3 A3 C4**. Gedacht für Melodie-Kanäle. | BELEGT (SE) | Genos RM [Y1] |
| **NTR Root Fixed** | „The note is kept as close as possible to the previous note range.“ Dasselbe Beispiel ergibt **C3 F3 A3**. Gedacht für Akkord-Kanäle. | BELEGT (SE) | [Y1], PSR-S950 RM [Y3] |
| **NTR Guitar** | Nur für Gitarren-Begleitung: Töne werden so umgesetzt, dass sie natürlichem Gitarren-Griff nahekommen. Tabellen All-Purpose, Stroke, Arpeggio. | NTR BELEGT (SE); Tabellen WAHRSCHEINLICH | [Y1]; Tabellen [Y8] (Nachbau eines Dritten) |
| **NTT** | Bypass (bei Root Fixed keine Umrechnung), Melody (Phrasen-Kanäle), Chord (Akkord-Kanäle), Melodic Minor, Harmonic Minor, Natural Minor, Dorian, jeweils mit „5th Var.“: übermäßige und verminderte Akkorde verändern die Quinte des Musters. | BELEGT (SE) | [Y1], PSR-SX920 RM [Y3], PSR-8000 S. 71 [Y4] |
| NTT „Bass“ (ältere Geräte) | Wie Melody, erkennt zusätzlich On-Bass-Akkorde. Bei neueren Geräten ersetzt durch Melody + Schalter „Bass“. | WAHRSCHEINLICH | jososoft [Y7] |
| **High Key** | „Upper octave limit“ für die Grundton-Transposition: Liegt der Grundton höher als High Key, wird **eine Oktave tiefer** gespielt. Nur bei NTR Root Trans. | BELEGT (SE) | Genos RM [Y1], Genos2 RM [Y2] |
| **Note Limit Low/High** | Tonumfang je Kanal, „damit keine Töne aus dem natürlichen Bereich fallen (z. B. hohe Bass- oder tiefe Piccolo-Klänge)“. Töne außerhalb werden in eine Oktave innerhalb verlegt. Einstellbar C−2 bis G8. | Zweck BELEGT (SE); Oktav-Regel und Wertebereich WAHRSCHEINLICH | Zweck [Y1]; Oktav-Regel [Y7]; Wertebereich [Y8] |
| **RTR** (Retrigger Rule) | Stop · Pitch Shift (ohne neuen Anschlag zur neuen Akkordart) · Pitch Shift to Root · Retrigger · Retrigger to Root (Oktave bleibt). Bytewerte 00H–04H, Standard 03H Retrigger. | BELEGT (SE) | [Y1], Wierzba [Y6] |
| RTR „Note Generator“ | nicht gefunden | UNBELEGT | – |
| **Source Root/Chord** | Tonart, in der das Quellmuster aufgenommen ist. Standard CM7 (Grundton C, Art M7). | BELEGT (SE) | Tyros2 [Y5] |
| Akkord-Erkennung „Fingered On Bass“ | Der tiefste Ton im Akkordbereich wird Bass-Ton. | BELEGT (SE) | Genos RM [Y1] |

### 2.2 Was Nutzer am Genos mühsam finden

- **Oktav-Sprünge kommen aus versteckten CASM-Werten:** Ein Part lässt sich nicht einfach durch Verschieben seiner Noten transponieren, weil jeder Part ein „key window“ im CASM hat. Abhilfe: High Key bzw. Note Limit ändern. (WAHRSCHEINLICH, Forum „Genos Style Octave“ [Y10])
- **Bass zu hoch:** Grundtöne über High Key fallen eine Oktave tiefer, außer ein Low Limit verhindert es. Rat: LoLimit anheben oder HiKey ändern. Für Bässe nennt die FAQ High Key D♯ mit Low Limit E2. (WAHRSCHEINLICH, PSR-Tutorial-FAQ [Y9]) — „Sometimes … the bass may sound an octave higher in some chords.“ (WAHRSCHEINLICH, [Y11])
- **Einstellungen vor der Aufnahme setzen**, sonst transponiert es später nicht richtig. (WAHRSCHEINLICH, Forum [Y14]) Falsche NTT-Wahl: „Style part only plays in major chord“. (WAHRSCHEINLICH, [Y15])
- **Bedienung:**
  - Ein Forum nennt den internen Editor „a bit of a fiddle“. (WAHRSCHEINLICH, [Y13])
  - Ein deutscher Kurs-Anbieter beschreibt den Ablauf für Leute, die PC-Programme meiden, als „zu mühsam, zu komplex“. (WAHRSCHEINLICH, Suchzusammenfassung [Y13])
  - Laut einem Forenbeitrag sagte ein Yamaha-Vertreter, Style-Bau brauche technisches und musikalisches Können, und empfahl den meisten Leuten Style Assembly. (WAHRSCHEINLICH, [Y13])
  - Für ältere SFF1-Dateien braucht CASM-Bearbeitung PC-Programme wie CasmEdit; für SFF2 nennt die FAQ Style Magic. (WAHRSCHEINLICH, [Y9])
- **Fazit (WAHRSCHEINLICH, Schluss aus den Belegen):** Mühsam ist nicht die Idee, sondern dass sie auf **sechs unsichtbare Parameter je Kanal** verteilt ist: NTR, NTT, Bass, High Key, Note Limit, RTR. Sie stehen in einem Menü fern vom Musikmaterial und müssen vor der Aufnahme stimmen.

### 2.3 Korg Pa

- **NTT-Typen:** Parallel (für Melodien; Töne bleiben im Wrap-Around-Bereich) und Fixed (für Akkord-Spuren; „move as few notes as possible“, folgen dem Wrap-Around nicht). Dazu No Transpose (folgt nur Master Transpose; Standard für Intro 1/Ending 1). (WAHRSCHEINLICH, Pa3X Advanced Edit und Pa600 RM via Suchauszug [K1][K4]; Pa4X nennt Parallel/Fixed und Guitar Mode 2 [K5])
- **Wrap Around:** Obere Grenze je Spur, in Halbtonschritten bis 12 über dem Akkord-Grundton. Erreicht das Muster sie, wird es eine Oktave tiefer gespielt. Handbuch-Rat: „set different Wrap Around points for each track, to avoid all tracks jump to a different octave at the same time“. (BELEGT (SE), Pa3X User Manual S. 139 [K2]; Pa300 S. 111 [K3]) Standardwert 9 laut Forum. (WAHRSCHEINLICH, [K6])
- **Keyboard Range:** gespeicherter Tonumfang je Spur, Schalter ein/aus; außerhalb wird zurückgeholt. (WAHRSCHEINLICH, [K2])

### 2.4 Roland

- **Bass-Umkehrung:** Bass entweder auf dem tiefsten gespielten Ton oder auf dem Akkord-Grundton. (WAHRSCHEINLICH, E-09-Handbuch [R1]; Taste [BASS INV] am E-A7 [R3])
- Eine Lage- oder Wrap-Regel je Spur beim Roland Style Composer wurde **nicht gefunden**. (UNBELEGT) Ein Forum sagt, ein Style-Part könne die Akkorde nicht ignorieren. (WAHRSCHEINLICH, [R2])

### 2.5 Ableton Live 12 und Plug-ins

- **Live 12 Pitch (MIDI-Effekt):** „Lowest“ und „Range“ bilden ein Notenfenster. „Mode“ bestimmt, was mit Tönen außerhalb passiert: **Block** (sperren), **Fold** („transposed to fit within the range“), **Limit** (an den Rand klemmen). Der Modus kam mit Live 12. (BELEGT (SE), Live-12-Handbuch und Release Notes [A1][A2])
- **Scaler 3:**
  - Wirbt mit „automatic voice leading“. (BELEGT (SE), Herstellerseite [A3])
  - Eine „Bass Follow Track“ spielt den Grundton der Akkordspur. (WAHRSCHEINLICH, Attack Magazine [A3])
  - Version 3.2.1 behebt laut Release-Hinweis „octave jump and voicing selection issues“. (WAHRSCHEINLICH, Forum [A3])
- **Captain Plugins:**
  - Captain Deep (Bass) und Captain Melody folgen Captain Chords. Sie behalten nur „Octave“, nicht Voicing und Umkehrung.
  - Deep hat „Shape“: den Akkorden folgen, Gegenbewegung, „minimum adjustment“ (kleine Sprünge), Ton halten.
  - Captain Chords hat „Minimize Leap“ für glatte Stimmführung.
  - (alle WAHRSCHEINLICH, MusicRadar, SOS, Mixed-In-Key-Anleitungen [A4])

### 2.6 Logic Pro (Session Player)

- **Bass Player:** Einstellbar ist „the lowest note the Bass Player can play“, dazu ein Menü für die Häufigkeit von Oktavsprüngen.
- **Synth Bass Player:** Der Tonumfang wird mit zwei Schiebern eingestellt.
- **Keyboard Player:** Für die rechte Hand gibt es ein Menü für Bewegung bzw. Tonumfang, für die linke Hand Voicings (Grundton, Grundton + Oktave …).
- (alle WAHRSCHEINLICH: Logic-für-iPad-Anleitung, Mac-Wortlaut nicht geprüft [L1])

### 2.7 OP-Z / OP-XY (Teenage Engineering)

- **OP-XY „brain“** (Spur 1 im Auxiliary-Modus): Die Tastatur transponiert die zugeleiteten Spuren und erkennt die Tonart selbst. (BELEGT (SE), TE-Anleitung [T1]) Das Ergebnis wird als Modus benannt, z. B. E-Phrygisch. (WAHRSCHEINLICH, SOS [T1]) Eine Lage-Grenze ist **nicht dokumentiert**. (UNBELEGT)
- **OP-Z:** Die Master-Spur transponiert die Spuren 1–8. Laut Forum richtet sie sich nach der Tonart der Bass-Spur. (WAHRSCHEINLICH, [T2]) Eine Oktav- bzw. Lage-Regel wurde nicht gefunden. (UNBELEGT)

### 2.8 Cubase Akkordspur

- **„Follow Chord Track“-Modi:**
  - Chords & Scales: Intervalle bleiben so weit wie möglich.
  - Chords, Scales.
  - **Root Notes:** Noten auf den Grundton des Akkord-Ereignisses; gedacht für Bass-Spuren.
  - **Voicings:** nach Voicing-Bibliothek.
  - **Single Voice:** eine Stimme des Voicings, z. B. Sopran oder Bass.
  - (BELEGT (SE), Steinberg-Hilfe [C1])
- **Adaptive Voicing:** „ensures that pitches in chord progressions do not change abruptly“. Bibliotheken Piano, Guitar, Basic; bei Basic gibt es nur „Octave Offset from C3“. (BELEGT (SE) [C2]; WAHRSCHEINLICH [C3])
- **Voicing-Einstellungen (Piano):** Optionen „Add Root Note“, „Duplicate Root“, „Fatten up“ (verdoppelt den Tenor); Voicing-Bereiche Triads, 4-Note Chords, 3-String Triads, Modern Jazz. (WAHRSCHEINLICH, Steinberg-Hilfe [C3])
- **„closed/open“** als Begriff wurde in der Hilfe zur Akkordspur **nicht** gefunden, nur beim Chorder-Plug-in. (UNBELEGT für die Akkordspur; WAHRSCHEINLICH für Chorder [C5])
- **Bass folgt:** Root Notes bzw. Single Voice = Bass. Ein eigener Bass-Ton (Slash) lässt sich setzen; laut Forum bleibt der Abstand gleich, wenn der Grundton verschoben wird. (BELEGT (SE) [C1]; Forum WAHRSCHEINLICH [C4])
- **Klagen aus dem Forum:**
  - „Follow Chord Track – super confusing“.
  - Root Notes hing auf einem Ton (A1) und ließ sich nicht in eine andere Oktave legen.
  - Werks-Akkorde liegen ab Oktave 1; eine direkte Oktav-Verschiebung gibt es nicht. Ausweg: MIDI-Modifier +12.
  - (alle WAHRSCHEINLICH [C4])

### 2.9 Lehren für SYNQUENZER

| Vorbild | Lehre | Umsetzung hier |
|---|---|---|
| Yamaha NTR Root Fixed, Cubase Adaptive Voicing, Captain „Minimize Leap“ | Akkord-Flächen sollen **umgreifen**, nicht parallel springen. | Rolle Fläche: Stimmführung (§3.6), zustandslos |
| Yamaha Note Limit, Ableton Pitch „Fold“, Logic Bass-Grenze bzw. Schieber | Ein **sichtbarer Tonumfang** mit Oktav-Faltung ist verständlich. | LAGE-Klammer an der Tastatur der ROLLE (§6.1) |
| Yamaha High Key, Korg Wrap Around | Die Oktav-Wende **je Spur** verhindert Ausreißer. Korg rät, die Wendepunkte zu staffeln. | Wende entsteht an der Klammer, je Rolle anders breit; der Grundakkord des Clips bleibt Original (§3.5) |
| Yamaha: 6 Parameter je Kanal, vorher setzen | Genau das ist der „Krampf“. | **1 Klammer + 1 Rolle**, beide automatisch. Pfeile nur bei Bedarf, jederzeit, auch nachträglich. |
| Cubase Root Notes, Captain Deep Octave | Bass braucht eine **feste Oktave**, aber Oktav-Riffs müssen erhalten bleiben. | Bass als **Block** in die Klammer, Einzelton-Faltung nur als letzte Stufe (§3.4) |

---

## 3 Entwurf „LAGE“

### 3.1 Grundsätze

1. **Kern bleibt zu (I-01):** `Harmony`/`Transposer` bleiben unverändert. Die Lage ist eine **Stufe danach**, wie `S.shift` und `R.xp`.
2. **Aus = bitgleich:** Fehlt `settings.harmony.lage`, ist sie aus. Gespeicherte Projekte und die Demo klingen gleich (I-09, I-10). Neue Projekte: an (wie „Eine Skala“, E3-25).
3. **Nur Oktaven:** Die Lage verschiebt nur um ganze Oktaven. Bei der Fläche ordnet sie zusätzlich um, welche Stimme welche Tonklasse spielt. Die **Tonklassen je Anschlag bleiben die der Kern-Abbildung** (BELEGT, gemessen: 0 Abweichungen in `stress.out`).
4. **Null-Einrichtung:** Rolle und Klammer kommen aus Klang-Kategorie und Clips. Nichts muss vor der Aufnahme eingestellt werden.
5. **Zustandslos zur Abspielposition:** Das Ergebnis hängt nur ab von Clip, Folge der Akkorde seit dem Abschnitt-Start (bei einer Akkord-Zeile: der ganze Durchlauf, Fassung 3) und Einstellungen. ▶ ab Takt 5 klingt ab Takt 5 wie im Durchlauf (gemessen: Schleife 8 000 von 8 000 stabil).
6. **Kein neuer Modus:** Klammer ziehen, Kästchen ziehen, ein kleines Blatt. Keine neue Leiste in der Song-Ansicht (S4/S9).

### 3.2 Die drei Regeln (so steht es in der Hilfe)

1. **Klammer:** Was transponiert wird, bleibt in der LAGE-Klammer der Spur. Der Bass bricht nie aus, Sequenz und Lead bleiben als Ganzes darin, die Fläche greift um.
2. **Richtung:** Beim Spielen folgt die Musik deiner Hand. In der Akkord-Zeile nimmt jede Spur ohne Pfeil den Weg mit den kleinsten Sprüngen über die ganze Zeile, auch vom letzten Akkord zurück zum ersten. Der Akkord, in dem ein Clip aufgenommen ist, klingt immer original.
3. **Pfeile:** ↑ an einem Akkord-Kästchen heißt „dieser Akkord oben“, ↓ „unten“ (fest, nicht relativ zum vorigen). Je Clip und Akkord geht dasselbe im LAGE-Blatt. FANG TEIL schreibt die Richtung deiner Hand mit.

### 3.3 Rollen und Verhalten

| Lage-Verhalten | Rollen (Wortliste §0.5) | Vorschlag ohne Rückfrage (`sound.cat`, Z. 5071) | Bewegung | Grenze | Auto-Klammer | Gleichstand (Tritonus) |
|---|---|---|---|---|---|---|
| **Bass** | Bass | bass | Block (ganze Clip-Runde) + Kette | **hart**: zuerst Block, als letzte Stufe Ton für Ton falten | Clip-Umfang −7 … +7, Boden E1 | abwärts |
| **Fläche** | Fläche, Akkord, Atmo | flaeche, poly, wt | Stimmführung je Anschlag (§3.6), keine Kette | hart: Block, dann je Stimme | −7 … +7 | – |
| **Sequenz** | Sequenz | sequenz, pluck, glocke | Block + Kette | weich: nie zerschneiden | −12 … +12 | aufwärts |
| **Lead** | Lead, Melodie | lead | Block + Kette | weich | **−7 … +12** („darf steigen“) | aufwärts |
| aus | Gesang folgt; Drums immer | drums | wie V0a | – | – | – |

- **FM und Eigene:** Die Rolle kommt aus dem Clip. Median unter C3 → Bass; Akkordanteil ≥ 0,5 → Fläche; sonst Sequenz. (Entwurf; Funktion `rolleVorschlag` in `lage.mjs`)
- **Parallele Akkord-Stabs** (EBM, House-Stabs) wählen die Rolle **Sequenz**: Dann gehen alle Stimmen gemeinsam als Block.

### 3.4 Ablauf je Note

```
klingt(i, clip, n, e) =
  m = T.mapEvent(n, t, {kind, follow}, {key: clip.key}, e)   // Kern, unverändert (I-01)
  m = m + S.shift + R.xp(i)                                   // V2f / V2c wie Spec
  wenn Lage aus (Einstellung, Spur „aus“, Drums): return m    // bitgleich
  FLÄCHE: g = Clip-Noten mit gleichem Einsatz
          v = Stimmführung(Original g, Kern g) + S.shift + R.xp
          k = Block(v, Klammer)          // ganze Gruppe um k·12, Kontur der Stimmen bleibt
          je Stimme falten (letzte Stufe)
  SONST:  s = Kern(Grundton) − Grundton   // Oktav-Referenz, die der Kern benutzt
          T = Richtung(e, s, A_vor, Hand, Pfeil, dirAt, Clip-Richtung, Absolut, Zeilen-Zyklus)   // T ≡ s (mod 12)
          roh = m + (T − s)               // nur Oktaven
          k = Block(roh aller Clip-Noten, Klammer)   // 0 bevorzugt, sonst Richtung Heimat
          A = T + k                       // Kettenwert für den nächsten Akkord
          Bass: falte(roh + k) in [lo, hi]   ·   Sequenz/Lead: roh + k (nie zerschneiden)
```

- Gerechnet wird **einmal je (Clip, Träger-Eintrag, Einstellungs-Stand)** und dann gespeichert. Der Planer schlägt nur nach.
- Gemessen ohne Speichern, inklusive Kern-Aufrufe: 1,7–2,1 µs je Note (Node, Xeon 2,1 GHz; BELEGT, `stress.out`).

### 3.5 Richtung: Auto, Hand, Pfeil, Clip

| Quelle | Regel | Beispiel (C-Clip) | Kennz. |
|---|---|---|---|
| **Auto** (Akkord-Zeile, Song) | **Fenster:** Ist der Akkord der Grundakkord des Clips, gilt 0. Sonst gibt es einen Kandidaten darunter (d − 12) und einen darüber (d). **Fassung 3: zyklisch.** Je Zeilen-Durchlauf wird die Wahl {d − 12, d} genommen, deren Summe der Grundton-Schritte am kleinsten ist, **einschließlich der Naht** letzter → erster Akkord (volle Suche, ≤ 16 Akkorde ≤ 65 536 Fälle). Gleichstand: Rolle (Bass tiefer, Sequenz/Lead höher). Fassung 2 war gierig (nur „näher zum vorigen“). | C Am F G → 0 / −3 / −7 / −5 (V0a: 0 / −3 / +5 / −5). F Am C G → −7 / −3 / 0 / −5: 14 HT inkl. Naht; Fassung 2 gab +5 / +9 / 0 / −5 = 28 HT, V0a 26 HT | BELEGT (gemessen, `pruef3.out` B2) |
| **Hand** (TRANSPONIEREN live) | Schritt in der Richtung der Hand, höchstens eine Oktave: `T = A_vor + Schritt(Handton − voriger Handton)`. **Fassung 3:** Die Lage-Schicht liest den Handton am Eingang `route 'carrier'` (Z. 10817 ff.) **bei jedem Griff selbst**: `R.lageHand` = tiefster gedrückter Ton mit Grundton-Tonklasse, auch wenn `_schedule` keinen Wechsel meldet (Z. 3765, gleicher Akkord). Der Kern bleibt unverändert (I-01). **Erster Griff nach ORIGINAL:** unterer Kandidat (d − 12), wenn der Handton unter der Mitte der sichtbaren TRANSPONIEREN-Tastatur liegt (Mitte = `12·(R.trOct + 2)`, Standard C4; Tastatur beginnt bei `12·(R.trOct + 1)`, Z. 11768), sonst oberer (d). Der Clip-Akkord bleibt 0. Die Klammer fängt alles ab. | C5 → F3 → G3 → C4: 0 / **−7** / −5 / 0 (V0a: 0 / +5 / −5 / 0). ORIGINAL → F3: −7, ORIGINAL → F4: +5, C3 → C5 → F3: 0 / −7 (Fassung 2: +5 in allen drei Fällen) | BELEGT (gemessen, S3; `pruef3.out` B1) |
| **Pfeil** ↑/↓ am Kästchen | **Fassung 3: absolut** wie die Clip-Richtung: ↑ = oberer Kandidat d, ↓ = unterer d − 12. Die übrigen Akkorde der Zeile laufen weiter nach der zyklischen Auto-Regel (der Pfeil ist dort eine feste Vorgabe). Ist der Akkord ohne Pfeil schon in dieser Lage, sagt das LCD „schon oben“ bzw. „schon unten“. Fassung 2 rechnete relativ zum vorigen Akkord; dann änderte ein Pfeil auf dem Folgeakkord nichts (C Am↑ F↓ G = C Am↑ F↑ G, Review t5). | C Am↑ F G → Sequenz/Lead 0 / **+9** / +5 / +7; C Am↑ F↓ G → 0 / +9 / **−7** / −5; der Bass bleibt bei A1, weil +9 seine Klammer verließe | BELEGT (gemessen, S2; `pruef3.out` B3) |
| **Clip-Richtung** (LAGE-Blatt) | ↑ „nie tiefer als Original“ = immer der obere Kandidat, ↓ „nie höher“ = immer der untere (wie Yamaha High Key je Kanal) | Sequenz ↑: 0 / +9 / +5 / +7; Lead ↓: 0 / −3 / −7 / −5 | BELEGT (gemessen, S4) |
| **Akkord je Clip** `dirAt` (LAGE-Blatt, neu) | Je Clip und Akkord-**Grundton** (0–11): ↑ = oberer, ↓ = unterer Kandidat. Hängt am Akkord, nicht an der Zeile: wirkt in der Akkord-Zeile, im Song **und live** in TRANSPONIEREN. Voreinstellung aus `sound.dirAt` (Spalte „Akkord-Reaktion“ der Vorbild-Dateien). | Sequenz `dirAt {A: ↑}`, Lead ohne: Zeile C Am F G → Sequenz 0 / +9 / +5 / +7, Lead 0 / −3 / −7 / −5; live C5 → A3 → F3 → Sequenz 0 / +9 / +5, Lead 0 / −3 / −7 | BELEGT (gemessen, `pruef3.out` B6) |
| **Oktave „Absolut (CV)“** (Profi, bleibt) | T = Kern-Shift exakt, dann fängt die Klammer ab | C2 / C6: Bass bleibt C2-Lage (V0a C0 / C4); Sequenz −12 / +12; Lead 0 / +12 | BELEGT (gemessen, S6) |

- **Rangfolge:** `dirAt` > Clip-Richtung > Pfeil bzw. Hand > Auto. Die Klammer gilt immer zuletzt.
- **Grenzfall „gleicher Akkord, andere Oktave“:** Greift die Hand denselben Akkord eine Oktave höher, meldet der Kern keinen Wechsel (Z. 3765), und die Musik bleibt, wo sie ist. **Fassung 3:** Die Lage-Schicht merkt sich aber den neuen Handton (`R.lageHand`). Der nächste Akkord rechnet seinen Schritt von dort (C3 → C5 → F3 = −7, gemessen B1). Fassung 2 rechnete von C3 und gab +5.
- **Akkord-Zeilen:** Die Wahl wird aus den **Zeilen-Daten** vorberechnet, je Durchlauf zyklisch und deshalb in jedem Durchlauf gleich. So wirkt ↑ auch auf eine Wiederholung desselben Akkords (Am Am↑).

### 3.6 Fläche: Stimmführung nach dem Root-Fixed-Prinzip

- **Grundregel (Fassung 3):** Die Tonklassen kommen aus der Kern-Abbildung. Jede Stimme nimmt davon die, die ihrem **Originalton** am nächsten liegt. Gesucht wird **zuerst die kleinste Zahl von Doppeltönen** (zwei Stimmen auf demselben Ton), **dann** die kleinste Gesamtbewegung. Bei Gleichstand gilt: keine Kreuzung, dann möglichst dieselbe Stufe wie der Kern, dann der tiefere Ton. Fassung 2 kannte keine Doppelton-Stufe: C4 E4 G4 C5 ergab unter F „F4 F4 A4 C5“, und der Planer verlor eine Stimme (Review t3).
- **Offene Flächen:** Bei ≥ 4 Stimmen mit dem Grundton unten **und offener Lage** (unterste → zweite Stimme ≥ 7 HT) bleibt die unterste Stimme Grundton. Bei enger Lage (z. B. C4 E4 G4 C5) gilt die Regel nicht.
- **Overdub-fest:** Jede Clip-Note trägt ihren Aufnahme-Durchgang `g` (0 = erste Aufnahme, fehlt = 0; jeder Overdub-Durchgang +1). Durchgang 0 bekommt das Optimum. Jeder spätere Durchgang wird mit den früheren Stimmen als **fest** gerechnet. Eine dazugespielte Stimme ändert die vorhandenen deshalb nie (gemessen: 0 von 50 Zufallsfällen; ohne `g` 21 von 50, `pruef3.out` B5). Preis: In 4 von 50 Fällen entsteht ein Doppelton, weil die neue Stimme ausweichen müsste, die alten aber fest sind.
- **Zustandslos:** Jeder Akkord bezieht sich auf das Original, nicht auf den vorigen Akkord.
- **Gemessen** (`beweis.out` S1, für Fassung 3 bestätigt in `pruef3.out` B4):
  - C4 E4 G4 unter C Am F G → **C4 E4 G4 / C4 E4 A4 / C4 F4 A4 / H3 D4 G4**. Summe der Stimmbewegung 9 Halbtöne, V0a 65.
  - Offene Fläche C3 G3 E4 C5: 30 statt 86.
  - Yamahas Handbuch-Beispiel für Root Fixed (C E G über F → C F A) entsteht genauso.
  - **Fassung 3, Formen C4 E4 G4 C5, A3 C4 E4 A4, C3 G3 C4 E4, C3 G3 E4 C5 unter allen 6 Stufenakkorden:** 0 Doppeltöne (Fassung 2: 4). Beispiel F: C4 F4 A4 F5 (Bewegung 8 HT).
  - Zufallsprobe Fassung 3 (`pruef3.out` B7, 2 000 Läufe): Stimmbewegung 45 % von V0a (104 850 gegen 231 212 HT); 0 Stimmen weiter als 6 HT vom Original; Menge der Tonklassen 100 % wie im Kern; 104 Doppeltöne, **alle** dort, wo der Kern selbst weniger Tonklassen liefert als Stimmen (sus, 6, Einzelton; 0 darüber hinaus). Die 34 % aus `stress.out` gelten für Fassung 2 und andere Zufalls-Formen.

### 3.7 Auto-Klammer (Null-Einrichtung) und „eng“

- **Auto:** Grundlage ist der Tonumfang aller Clips der Spur, wie er klingt (Clip-Töne + `S.shift`), plus der Rand der Rolle (§3.3).
  - Stößt eine Seite an den Boden (Bass E1, sonst C1) oder an C8, wandert der fehlende Rand auf die andere Seite. So ist die Klammer immer ≥ Clip-Umfang + 14 Halbtöne hoch, und **jede Clip-Runde passt als Block**: 0 gefaltete Oktavsprünge in 10 026 Bass-Runden (BELEGT, `stress.out`).
  - Ohne diese Verschiebung gab es 1 Fall (Bass E1–D2 am Boden C1). Er war der Anlass für die Regel.
  - Der Boden E1 folgt der Hörbarkeits-Prüfung der Spec für Bässe (M-HANDYrel bei E1, V0d-11; BELEGT, `r6/bibliothek-recherche.md` §12.3).
- **Klang-Lage (Fassung 3):** Hat der geladene Sound eine Lage (`sound.lage = {lo?, hi?}`, Vorschläge in `r7/vorbild-helden.md` §8 und `r7/vorbild-coldwave2.md` §5), ist das ein **Grundton-Bereich**, oft nur einseitig („Bass hoch D3“, „Lead tief A4“). Bei Auto gilt der **Schnitt** aus Clip-Regel und `[lo, hi + Clip-Umfang]`; so dürfen Oktav-Riffs über dem Grundton mit. Wäre der Schnitt enger als Clip-Umfang + 14 HT, gilt die Clip-Regel allein, und das LAGE-Blatt zeigt „Sound-Lage passt nicht ganz“. Fassung 2 nahm die Vereinigung; die konnte die Klammer nur breiter machen, eine Sound-Grenze wirkte also nie.
- **Von Hand:** Ziehen an der Klammer macht sie fest. Sie kann nicht enger werden als der Tonumfang der eigenen Clips.
  - Ist sie enger als Clip-Umfang + 14, wird sie **amber** und zeigt „eng“: Oktavsprünge im Bass können dann gefaltet werden (gemessen S8: Bass C2–D3 → Oktav-Riff wird einstimmig, verlässt die Klammer aber nie).
- **Unterschiedliche Wendepunkte:** Die Ränder je Rolle sind verschieden breit, die Clips verschieden hoch. Dadurch springen nicht alle Spuren am selben Akkord um (Korg-Rat, [K2]).

### 3.8 Zusammenspiel

| Bereich | Regel |
|---|---|
| **FANG (Noten → Clip)** | Gespeichert wird wie gehört: Die Umkehrung `clipNoteFor` (Z. 10540) sucht mit derselben Ausgabe-Funktion, bei der Fläche mit dem Anschlag-Kontext. |
| **FANG TEIL** (V2d bzw. N7S-Entwurf) | Die Akkord-Zeile des Teils speichert je Eintrag den Handton (`tg.rootNote` gibt es schon, neu `tg.hand:1`; Fassung 3: der Handton aus `R.lageHand`, auch bei Griffen ohne Kern-Wechsel). Dazu kommt der **Anker** der Hand-Kette (erster Akkord nach dem letzten ORIGINAL). Damit klingt der Teil überall genau wie gespielt (gemessen: S7 gleich; S7b ab dem 2. Akkord eingefangen: mit Anker gleich, ohne Anker klänge F +5 statt −7). Die Zeile zeigt die Hand-Richtung als Pfeile: „C · F↓ · G↑ · C↑“. |
| **Teil im Song ablegen (S9)** | Die Träger-Einträge werden mit `hand`, `d` und Anker kopiert. **Fassung 3:** Der Neustart steht als Daten am **ersten Träger-Eintrag** des abgelegten Teils: `song.carrier[i].target.neu = 1`, dazu `zl` (Zahl der Einträge eines Zeilen-Durchlaufs, für die zyklische Wahl) bzw. `anker` (Hand-Teil). Die gelbe Teil-Marke (`song.marks`) bleibt ein **reines Etikett**: Löschen, Verschieben oder Umbenennen ändert keinen Ton. Der Teil klingt an jedem Taktstrich gleich, keine neue Zeile, keine Überschrift. |
| **Akkord-Zeile** (V2c, N7S) | Je Durchlauf **zyklisch** (§3.5), daher jeder Durchlauf gleich. Pfeil `d` absolut, `dirAt` je Clip. Hand-Einträge über `tg.hand` (Hand-Kette mit Anker). ORIGINAL (`tg:null`) setzt zurück. |
| **Song / Kette / Zeitleiste** | **Fassung 3:** keine Kette über den ganzen Song. Die Träger-Liste zerfällt an `neu`-Einträgen und ORIGINAL in Abschnitte. Ein Abschnitt aus einer Akkord-Zeile wird mit derselben zyklischen Wahl gerechnet wie in der Clip-Ansicht (Zyklus-Länge `zl`); ein Hand-Abschnitt läuft als Hand-Kette ab seinem Anker. Ergebnis je Song-Stand vorberechnet (wie das Abflachen ≤ 5 ms). Ein Teil mit 2 Zeilen-Durchläufen klingt im Song wie in der Clip-Ansicht (gemessen 12/12, `pruef3.out` B2). Fassung 2 kettete ab Song-Anfang; dann klang der 2. Durchlauf von F Am C G anders (−7 / −3 / 0 / −5 statt +5 / +9 / 0 / −5, Review t1). Gilt für die Spec-Kette und die N7S-Zeitleiste gleich. |
| **S.shift / R.xp** | Wirken **vor** der Lage: Auch beim Verschieben des ganzen Songs bleibt der Bass in seiner Klammer (gemessen S5: +18 → Bass F♯2 statt F♯3).<br>[Fest anwenden] klingt gleich: Daten +shift, Auto-Klammer aus den gehörten Tönen, Hand-Klammer fest. |
| **MIDI-Export** | „mit Träger“ (Szene, alle, Song) benutzt dieselbe Ausgabe-Funktion wie der Planer, nicht mehr `T.mapEvent` direkt (Z. 17196, 17262). **Szene und „alle“** (ohne Zeitachse): Es gilt der **aktuelle Träger-Eintrag samt dem gespeicherten Kettenwert A je Spur** (Eintrag im Zwischenspeicher), also genau das, was in diesem Moment klingt. Song: die Abschnitte wie in der Zeile darüber. „Original“ bleibt unverändert. |
| **Eine Skala** (V2c′) | Die Abbildung samt Ziehen in die Skala kommt zuerst, die Lage danach. |
| **Bei Wechsel: Mitziehen │ Halten** | Bleibt. Ziel der Retune ist die Lage-Ausgabe. Die Fläche gleitet dadurch höchstens um wenige Halbtöne statt parallel. |
| **Live SPIELEN** | Wird nie gefaltet: Die Hand spielt, was sie drückt. Die Klammer gilt nur für Clips. |
| **Song-Melodie** (`song.mel`), Drums | Song-Melodie ist „gehört“ gespeichert und wird nicht gefaltet. Drums nie. |

### 3.9 Übersetzung Genos → SYNQUENZER

| Genos (je Kanal) | SYNQUENZER |
|---|---|
| NTR Root Trans / Root Fixed / Guitar | Rolle: Sequenz bzw. Lead (Block) / Fläche (Stimmführung) / – |
| NTT (Melody, Chord, Minor-Tabellen) | AKKORD/TONART/HALBTON + „Eine Skala“ (unverändert, Kern) |
| High Key | Auto-Fenster, Pfeil, Clip-Richtung ↑/↓ |
| Note Limit Low/High | **LAGE-Klammer** (sichtbar, ziehbar, automatisch) |
| NTT Bass / Fingered On Bass | Slash-Bass bleibt Kern-Sache (§18 „Folgeart nach Rolle“, nicht hier) |
| RTR | „Bei Wechsel: Mitziehen │ Halten“ (gibt es schon) |
| Source Root/Chord | Clip-Bezug (automatisch erkannt, gibt es schon) |

**Taps je Standardfall** (gezählt nach §6, ab geöffneter ROLLE des Clips; Klammer-Griff außerhalb der Ansicht: +1 Tipp auf die Randlasche; ab dem Clip-Raster zusätzlich Clip öffnen, je nach Weg +1–2):

| Fall | SYNQUENZER (LAGE) | Genos |
|---|---|---|
| Bass bleibt in seinem Bereich | 0 (Auto-Klammer) | UNBELEGT (nicht gezählt; laut §2.2 Note Limit/High Key je Kanal im Style Creator, WAHRSCHEINLICH) |
| Bass- bzw. Sequenz-Grenze ändern | 1 Zug am Griff (+1 Randlasche) | UNBELEGT |
| Musik folgt der Hand | 0 | UNBELEGT |
| „Bei Am nach oben“ für alle Spuren (Akkord-Zeile) | 3: Träger-Anzeige tippen, Kästchen ziehen, ✕ | UNBELEGT |
| „Nur dieser Clip bei Am nach oben“ (`dirAt`) | 3: Griff tippen (LAGE-Blatt), Chip „Am“ tippen, ✕ (+1 Randlasche) | UNBELEGT |
| „Dieser Clip immer höher“ (Clip-Richtung) | 3: Griff tippen, Chip ↑, ✕ (+1 Randlasche) | UNBELEGT |

„Einfacher als der Genos“ ist damit nur für SYNQUENZER gezählt. Eine Tap-Zählung am Genos liegt nicht vor (UNBELEGT); belegt sind nur die Forenklagen in §2.2 (WAHRSCHEINLICH). Abnahme N8T-24.

---

## 4 Beweis am Prototyp (gemessen, `lage-proto/beweis.out`)

### 4.1 Aufbau

- **Kern:** Der unveränderte Kern aus V0a.html (`core.mjs`, vm-Sandbox) und die V0a-Voreinstellungen (Z. 8057).
- **Spuren** (Bezug C-Dur):
  - EBM-Bass, Sechzehntel mit Oktavsprüngen: C2 C2 C3 C2 … G2
  - Fläche: C4 E4 G4
  - Fläche offen: C3 G3 E4 C5
  - Lead: E5 D5 C5 G4 A4 C5 D5 E5
  - Sequenz: Demo-Arp C4 E4 G4 C5 …
- **Auto-Klammern:** Bass F1–G3, Fläche F3–D5, Fläche offen F2–G5, Lead C4–E6, Sequenz C3–E6.

### 4.2 C – Am – F – G (Akkord-Zeile, ohne Pfeile)

| Spur | V0a | LAGE |
|---|---|---|
| Bass-Grundton | C2 A1 **F2 G1** (Sprünge −3 +8 −10) | C2 A1 **F1 G1** (−3 −4 +2), Oktav-Riff erhalten |
| Fläche | C4E4G4 · A3C4E4 · F4A4C5 · G3H3D4 (65 HT) | C4E4G4 · C4E4A4 · C4F4A4 · H3D4G4 (**9 HT**) |
| Lead | 0 / −3 / +5 / −5: A5…, dann H4… | 0 / −3 / −7 / −5: A4 G4 F4 C4 …, Kontur gleich |
| Sequenz | 0 / −3 / +5 / −5 | 0 / −3 / −7 / −5 |

### 4.3 Pfeil ↑ auf Am

- Sequenz und Lead: +9, danach F +5 und G +7, kleinster Schritt ab dem höheren Am.
- Bass: bleibt A1, F1, G1. +9 hätte die Klammer F1–G3 verlassen.
- Fläche: unverändert, sie greift um.

### 4.4 Xanders Fall: Hand C5 → F3 → G3 → C4

- Bass, Sequenz und Lead: 0 / **−7** / −5 / 0. Die Musik geht mit der Hand nach unten; V0a gibt +5.
- Fläche: C4E4G4 → C4F4A4 → H3D4G4 → C4E4G4.
- **FANG TEIL** derselben Folge, als Akkord-Zeile mit Handton gespeichert: Wiedergabe gleich (alle Spuren, alle Töne).
- **FANG TEIL ab dem 2. Akkord:** Mit Anker gleich, ohne Anker nicht.
- **Fassung 3, zwei Wege, die in Fassung 2 nach oben gingen** (`pruef3.out` B1): ORIGINAL → F3 = −7 (Fassung 2 +5), ORIGINAL → F4 = +5 (über der Mitte, richtig oben), C3 → C5 → F3 = −7 (Fassung 2 +5).

### 4.5 Grenzfälle

| Fall | Ergebnis |
|---|---|
| S4 Clip-Richtung | Lead ↓: 0 / −3 / −7 / −5 · Sequenz ↑: 0 / +9 / +5 / +7 |
| S5 S.shift +6 und R.xp +12 (Klammern fest wie vor dem Verschieben, also wie „von Hand“) | V0a: Bass F♯3–F♯4 (außerhalb). LAGE: Bass F♯2 …, Fläche und offene Fläche als Block in ihre Klammer, Lead und Sequenz eine Oktave zurück |
| S6 Absolut C2 → C6 → F3 | Bass bleibt C2-Lage, dann F1; Sequenz −12 / +12 / −7; Lead 0 / +12 / −7 |
| S8 Klammer von Hand eng (C2–D3) | Kein Block passt → Bass Ton für Ton gefaltet, nie außerhalb, Klammer amber |
| Prüfsumme S1–S6, S8 | 119 Runden: Bass außerhalb 0, Lead- und Sequenz-Kontur gebrochen 0, Fläche-Tonklassen anders 0, Fläche-Stimme > 6 HT 0. Gefaltete Bass-Riffs 3, nur in S8 (gewollt). |

### 4.6 Zufallsprüfung (`stress.out`, Startwert 20261017)

- **Umfang:** 2 000 Läufe zu 2–8 Akkorden, je zur Hälfte Akkord-Zeile mit zufälligen Pfeilen und Hand.
  - 20 % Absolut, 30 % mit Verschiebung (−6…+6, ±12).
  - Zufällige Clip-Bezüge (Dur, Moll, Dorisch, Mixolydisch) und Clips für alle vier Rollen; 15 % mit Clip-Richtung.
  - Insgesamt 40 104 Runden, davon 10 026 Bass.
- **LAGE:**
  - Bass außerhalb **0**, Bass-Riff gefaltet **0**.
  - Lead- und Sequenz-Kontur gegenüber dem Kern gebrochen **0**, außerhalb **0**.
  - Fläche: Tonklassen anders **0**, außerhalb **0**, Stimme > 6 HT **0**.
  - Schleife stabil **8 000 / 8 000**.
- **V0a bei denselben Fällen:** 3 034 Bass-Runden außerhalb, 1 441 Lead- bzw. Sequenz-Sprünge > 12 HT, Fläche-Bewegung 312 927 HT gegen 106 311 HT mit LAGE (34 %).
- **Rechenzeit:** 1,7–2,1 µs je Note ohne Zwischenspeicher, inklusive Kern-Aufrufe (Node 22, Xeon 2,1 GHz; iPhone ungemessen).

---

## 5 Datenmodell

Format 3 additiv (VL) und von Format 4 unverändert übernommen. `normalizeProject` erhält die Felder und setzt fehlende Felder neutral.

```js
S.settings.harmony.lage: boolean     // fehlt → false (gespeicherte Projekte, Demo: bitgleich); newProject / [Leer (Init)] → true
SynthTrack += {
  role?: 'bass'|'sequenz'|'akkord'|'flaeche'|'lead'|'atmo'|'melodie'|'gesang',
        // EINE Rolle für Lage, Mischung und Hilfe; ersetzt den geplanten Ort track.mix.role (§8.6/§14, V7c liest dasselbe Feld)
        // fehlt → Vorschlag aus sound.cat bzw. Clip (§3.3), gespeichert erst, wenn Xander wählt
  lage?: { modus: 'auto'|'hand'|'aus', lo?: 24..108, hi?: 24..108 }
        // fehlt = auto; 'hand': lo/hi fest, hi − lo ≥ 11, umfasst alle Clip-Töne der Spur
}
SynthClip += { dir?: 1|-1,           // Richtung je Clip: 1 = nie tiefer als Original (↑), −1 = nie höher (↓); fehlt = auto
                dirAt?: {[grundton: 0..11]: 1|-1} }   // Richtung je Clip UND Akkord-Grundton (LAGE-Blatt, Chip-Reihe); gilt live, Zeile, Song
SynthNote += { g?: 0.. }             // Aufnahme-Durchgang (0 = erste Aufnahme, Overdub +1); Fläche: frühere Durchgänge bleiben fest (§3.6)
ChordRow.ch[i] += { d?: 1|-1 }       // Pfeil am Kästchen, ABSOLUT: 1 = oberer Kandidat, −1 = unterer (Fassung 3)
ChordRow.ch[i].tg += { hand?: 1 }    // tg.rootNote ist ein echter Handton (FANG TEIL, Aufnahme); [♪ greifen] setzt ihn NICHT
ChordRow += { anker?: { root: 0..11, hn: 0..127 } }   // Anfang der Hand-Kette vor dem eingefangenen Fenster
song.carrier[i].target += { hand?: 1, d?: 1|-1, neu?: 1, zl?: 1..16, anker?: {root, hn} }
        // rootNote und sd speichert logCarrier schon (Z. 4061); neu = Abschnitt-Start (statt Teil-Marke), zl = Zyklus-Länge der Zeile
Sound += { lage?: {lo?, hi?}, role?, dirAt?: {[grundton]: 1|-1} }  // Grundton-Bereich (einseitig erlaubt) und Akkord-Reaktion aus den Vorbild-Tabellen (V10b/V10d)
// Laufzeit (nicht gespeichert): R.lageHand (Handton, bei JEDEM Griff am Eingang route 'carrier', Z. 10817 ff.);
// Träger-Einträge bekommen im T.onCommit-Haken {hn, d, vor} (Kern unverändert),
// Zwischenspeicher WeakMap(Clip) → Map(Eintrag+Stand → {A, k, Stimmen}); Stimmen merken v.clip.
```

- **Undo** (V0a kennt u. a. die Arten `clip`, `sound`, `fx`, `kit`, `song`, Z. 10158–10202; die Spec ergänzt `part`, `chain`, `proj`, `group`):
  - Klammer-Zug und Rolle: neue Art `lage` (Schnappschuss `{role, lage}` der Spur), ein Schritt je Geste.
  - Clip-Richtung: Art `clip`.
  - Pfeil: Art `part` (Akkord-Zeile), ein Schritt.
  - [Fest anwenden] nimmt `lage` mit (Art `proj`).
- **Test-API (neu):**
  - `lage(t)` → `{role, modus, lo, hi, eng}`
  - `setLage(t, {role?, modus?, lo?, hi?})`
  - `setClipDir(t, s, dir)`
  - `setChordDir(row, i, d)`
  - `setClipDirAt(t, s, grundton, d)`
  - `heardPitch(t, s, noteIndex, time?)` → Lage-Ausgabe
  - `lageCheck(seed, n)` → Zähler wie `stress.mjs`
  - `outPitch` (Z. 17920) liefert ab dann die Lage-Ausgabe.

---

## 6 Oberfläche (deutsch), Mockups 390×844 und 844×390

**Geometrie:** gemessen in V0a, Chromium, von einem anderen Agenten (`r7/song-geo/geo.out`, BELEGT).
- ROLLE P1: Werkzeugzeile y 97 (44), Lineal y 141 (26), Notenfläche x 40, y 167, 350×355 (16 Zeilen à 22 px), Aktionen y 578. Tastenspalte 40 px breit (Z. 4180).
- ROLLE L1: Notenfläche y 107, 804×203 (≈ 9 Zeilen), Aktionen y 354.

Breiten der neuen Chips sind **geschätzt** und werden mit N8T-20 gemessen.

### 6.1 ROLLE mit LAGE-Klammer — P1 390×844

```
y=0    ┌──────────────────────────────────────────────────────┐
       │ [Logo] [▶] [● AUTO] [TAKT 1.1 ●○○○] [BPM 112] [♩] [≡] │ 52  Kopfleiste (unverändert)
y=52   │ ● SYNTH 1 · SZENE 1   C-Dur · 1 Takt             [✕]  │ 44  Kopf (unverändert)
y=97   │ [LAUF][✎][⬚][⌫] │ [1/16][♪ =Raster][Tonart] …        │ 44  Werkzeuge (unverändert)
y=141  │ TAKT │ [1]                                            │ 26  Lineal
y=167  │▲ G3 ▐│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│     Randlasche: Obergrenze liegt über der Ansicht (Tipp = hinscrollen)
       │ G2  ▐│          ▬G2                  ▬G2              │
       │     ▐│                                                │
       │ E2  ▐│                      ▬E2                       │     16 Zeilen à 22 px sichtbar
       │     ▐│                                                │
       │ C2  ▐│▬C2 ▬   ▬C2 ▬C2  …                              │
       │     ▐│                                                │
       │▼ F1 ▐│                                                │  ← Griff unten: Lasche 40×22 in Spurfarbe, Treffer 40×44
       │ E1 ░░│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│     außerhalb der Lage: schraffiert (Tasten und Raster)
y=522  │ VEL  │ ▌   ▌   ▌   ▌   ▌   ▌   ▌   ▌                  │ 56
y=578  │ ALLE [Zuschneiden] [▲ Stufe] [▼ Stufe] [+12] [−12] …  │ 44
y=622  │ [‹] [♪ SPIELEN C-Dur │ ⇅ TRANSPONIEREN] [›]           │ 54
y=676  │ Tastatur (unverändert)                                │ 168
y=844  └──────────────────────────────────────────────────────┘
▐ = Klammer, 4 px in Spurfarbe am rechten Rand der Tastenspalte (x 36–40); amber, wenn „eng“.
```

- **Griffe:**
  - Ziehen setzt die Grenze in Halbtönen, mit Haptik je Halbton und LCD „LAGE · Bass F1–G3“.
  - Am Rand der Ansicht scrollt sie mit, höchstens 1 Oktave/s (wie der Längen-Griff, V0a K-05).
  - Zieht man in die eigenen Clip-Töne, stoppt die Grenze: LCD „Clip-Töne liegen hier“.
  - **Tipp auf einen Griff** öffnet das LAGE-Blatt.
- **Tastenspalte sonst wie bisher:** Ziehen scrollt, Tipp hört (Z. 4619). Das ist dasselbe Muster wie Lineal mit Längen-Griff ┃.
- Nichts im Layout verschiebt sich (L3): Die Klammer liegt in der vorhandenen Tastenspalte.

### 6.2 LAGE-Blatt — P1

```
y=584 ┌ LAGE · SYNTH 1 ────────────────────────────────── [✕] ┐ 40
      │ Rolle    [Bass ✓] [Fläche] [Sequenz] [Lead] [aus]     │ 44   P3: Zeile wischbar
      │ Klammer  F1 – G3 · aus deinen Clips          [Auto ✓] │ 44   Auto aus = von Hand (Klammer ziehen)
      │ Dieser Clip  [auto ✓] [↑ nie tiefer] [↓ nie höher]    │ 44   bei Fläche ausgegraut: „Fläche greift um“
      │ bei Akkord   [C][Am ↑][F][G] ‹wischbar›               │ 44   Chips: Akkorde der aktuellen Zeile bzw. des Träger-Verlaufs; Tipp: auto → ↑ → ↓
      │ Bass bleibt in F1–G3. Oktavsprünge im Clip bleiben.   │ 28   Erklärzeile je Rolle
y=844 └───────────────────────────────────────────────────────┘ 260 (Fassung 3: +44 für die Akkord-Chips; höher als das Akkord-Zeilen-Blatt, Platz mit N8T-20 messen)
```

Erklärzeilen je Rolle:
- **Bass:** „Bass bleibt in F1–G3. Oktavsprünge im Clip bleiben.“
- **Fläche:** „Fläche greift um wie ein Keyboarder. Parallel? → Sequenz.“
- **Sequenz:** „Sequenz geht als Ganzes mit, bleibt in C3–E6.“
- **Lead:** „Lead darf steigen, bis E6. Die Melodie bleibt ganz.“
- **aus:** „Wie bisher: kürzester Weg, keine Grenze.“

Wirkung: Ein Wechsel wirkt ab dem nächsten Takt (L8).

### 6.3 Akkord-Zeile mit Pfeilen — P1 (Spec §4.5, nur ↑/↓ neu)

```
┌ AKKORDE ‹ Strophe › · 4 Takte · C-Dur ────── Takte [−][+] [✕] ┐ 40
│ [   C   ][  Am ↑  ][ ▸ F   ][   G   ]                          │ 44  Kästchen hoch/runter ziehen = ↑ / ↓
│ Stufe [I C][ii Dm][iii Em][IV F][V G][vi Am][vii° H°]          │ 44
│ Zuletzt  C · Am · F · G                                        │ 36
│ [÷2] [– halten] [♪ greifen] [Löschen]               [Frei ▾]   │ 44
└────────────────────────────────────────────────────────────────┘ 216 (unverändert)
[Frei ▾], unterste Zeile:  [Bass /–] [Text ⌨] [↕ auto] [‹ zurück]     (P3: Symbole [/–][⌨][↕][‹])

Ziehen am Kästchen (≥ 16 px senkrecht):         ↑      loslassen → [ Am ↑ ]
                                            [  Am  ]
                                                ↓      loslassen → [ Am ↓ ]    zurück in die Mitte → [ Am ]
```

- Waagrechte Bewegung > 8 px bricht ab. Ein Tipp wählt wie bisher. Ein Zug ist ein Undo-Schritt.
- Beim ersten Zug zeigt das LCD: „Am ↑ · Sequenz und Lead gehen hier nach oben“. Ist der Akkord schon dort: „Am ↑ · schon oben“ bzw. „schon unten“.
- In der Song-Ansicht steht in der Zeile AKK. dasselbe Zeichen („Am↑“). Es kommt **keine** neue Zeile dazu (S4/S9).
- Von FANG TEIL eingefangene Zeilen zeigen die Hand-Richtung.

### 6.4 Querformat L1 844×390

```
ROLLE
y=0   ┌──────────────────────────────────────────────────────────────────────────────────────────────┐
      │[Logo][▶][● AUTO][TAKT 1.1][BPM 112][♩][Q AUTO][LÄNGE AUTO][FANG ⤓]                       [≡]│ 44
y=44  │● SYNTH 1 … C-Dur·1 Takt [LAUF][✎][⬚][⌫][1/16][♪=Raster][Tonart][Schritt][⤢][⌨][↶][↷]    [✕]│ 36
y=81  │TAKT│ [1]                                                                                    │ 26
y=107 │▲ G3│░░░░ Randlasche                                                                         │
      │ G2 ▐│          ▬G2                         ▬G2                                              │ ≈ 9 Zeilen
      │ E2 ▐│                       ▬E2                                                             │
      │ C2 ▐│▬C2  ▬C2        ▬C2  ▬C2                                                               │
y=288 │▼ F1│  ← Griff, Treffer 40×36 (L4 quer)                                                      │
y=310 │VEL │ ▌ ▌ ▌ ▌ ▌ ▌ ▌ ▌                                                                        │ 44
y=354 │ALLE [Zuschneiden][▲ Stufe][▼ Stufe][+12][−12][Dupl.][Quant.][Legato][Takte −][Takte +]…  │ 36
y=390 └──────────────────────────────────────────────────────────────────────────────────────────────┘

LAGE-Blatt (unten, 2 Spalten wie das Akkord-Zeilen-Blatt quer, 150 px)
y=240 ┌ LAGE · SYNTH 1 ──────────────────────────────────────────────────────────────────────── [✕] ┐ 36
      │ Rolle [Bass ✓][Fläche][Sequenz][Lead][aus]     │ Dieser Clip [auto ✓][↑ nie tiefer][↓ nie höher]│ 40
      │ Klammer F1 – G3 · aus deinen Clips [Auto ✓]    │ Bass bleibt in F1–G3. Oktavsprünge bleiben.    │ 40
      │ bei Akkord [C][Am ↑][F][G] ‹wischbar›          │                                                │ 36   Fassung 3; Blatt dann 186 px, mit N8T-20 messen
y=390 └─────────────────────────────────────────────────────────────────────────────────────────────┘

AKKORDE (Spec: quer 2 Spalten in 150 px)
┌ AKKORDE ‹ Strophe › · 4 Takte · C-Dur · Takte [−][+] ─────────────────────────────────── [✕] ┐ 36
│ [  C  ][ Am ↑ ][ ▸ F ][  G  ]                     │ Stufe [I C][ii Dm][iii Em][IV F][V G][vi Am] │ 40
│ Zuletzt  C · Am · F · G                           │ [÷2][– halten][♪ greifen][Löschen][Frei ▾]   │ 40
└──────────────────────────────────────────────────────────────────────────────────────────────┘ 150
```

### 6.5 Texte

- **Hilfe-Zeile (L10):** „LAGE: Die Klammer an der Tastatur der Rolle zeigt, wohin eine Spur beim Transponieren darf. Bass bleibt drin, Sequenz und Lead bleiben als Ganzes, die Fläche greift um. Ziehen = Grenze, Tipp = Einstellungen. In der Akkord-Zeile: Kästchen hoch/runter ziehen = ↑/↓.“
- **LCD** (je beim ersten Mal):
  - „LAGE · Bass F1–G3 · ziehen = Grenze“
  - „Lage eng – Oktavsprünge werden gefaltet“
  - „Clip-Töne liegen hier“

---

## 7 Paket, Einordnung, Budget

**Neues kleines Paket „VL — Lage und Richtung“.** Es passt nicht in V2c′ „Eine Skala“: V2c′ hat 3–4 h und 20 KB, beides zusammen ergäbe 7–9 h und damit mehr als die 4–5-h-Regel.

| | |
|---|---|
| **Ort** | direkt **nach V2c′, vor V2d** |
| **Begründung** | Gleiche Abbildungs-Stelle wie V2c′, eine Regression der Harmonie-Tests. Die Pfeile brauchen die Akkord-Zeile (V2c). FANG TEIL (V2d) soll Handton und Anker von Anfang an mitschreiben. |
| **Gruppe** | EN-01 erlaubt 3–5 Pakete je Gruppe. Vorschlag: V2-1 teilen in **V2-1a** (V2a, V2a′, V2b) und **V2-1b** (V2c, V2c′, VL). |
| **Abhängigkeit** | V2c, V2c′ |
| **App-Version** | 4.4.5 (Einschub zwischen 4.4.0 und 4.5.0; Folgeversionen bleiben) |
| **Budget** | +27 KB; 5,5 h (Kern-Stufe und Speicher 1,75 h, Klammer und Blatt 2,25 h, Tests 1,5 h) — über der 4–5-h-Regel; falls nötig `dirAt`-Chips (0,5 h) in V2e schieben |
| **Tests** | `vl-lage.mjs` (übernimmt `lage-proto/beweis.mjs` und `stress.mjs`), `vl-ui.mjs` |

**Ergänzungen an anderen Paketen (N-Punkte):**
- **V2d / N7S FANG TEIL:** Handton (`tg.hand`) und `anker` schreiben; `neu`/`zl` am ersten Eintrag beim Ablegen (+0,75 h, +1 KB).
- **V2e / N7S Song-Ansicht:** AKK. zeigt ↑/↓; Kette über die Träger-Liste (+0,25 h, +1 KB).
- **V2f:** Reihenfolge `S.shift` vor Lage; [Fest anwenden] nimmt Auto-Klammern mit (+0,25 h).
- **V7c:** liest `track.role` statt `track.mix.role` (0 h).
- **V10b/V10d:** `sound.lage` und `sound.role` aus den Vorbild-Tabellen (0,25 h, Daten).

**Summe:** ≈ 7 h und +29 KB (Fassung 3: +0,5 h und +2 KB in VL für zyklische Wahl, `dirAt`-Chips, Durchgang `g` und `R.lageHand`; +0,25 h in V2d).

**I-01 (Ergänzung):** „Nach der Abbildung und nach `S.shift`/`R.xp` folgt die Lage-Stufe, nur wenn `settings.harmony.lage`. Sie verschiebt nur Oktaven. Bei der Fläche ordnet sie außerdem die Stimmen innerhalb der Tonklassen der Abbildung neu. Der Kern bleibt unverändert; ausgeschaltet ist alles bitgleich.“

**Berührungspunkte im Code:**
- `outPitch` bekommt den Clip, nicht nur `clipKey` (Z. 9501).
- `scheduleTrack` (Z. 9621) und `spawnClipVoice` (`v.clip`).
- `applyCarrierChange` (Retune-Ziel, Z. 9516).
- `clipNoteFor` (Z. 10540).
- `buildMidi` und `buildMidiSong` (Z. 17196, 17262).
- Haken `T.onCommit` (Z. 9434) für `hn`, `d`, `vor`.
- Eingang `route 'carrier'` (Z. 10817–10823): `R.lageHand` bei jedem Griff setzen (auch wenn `_schedule` `null` liefert).
- `normTarget` (Z. 8276–8285) und `logCarrier` (Z. 4061–4066): Beide bauen das Ziel aus einer festen Feldliste und verwerfen alles andere (BELEGT, Code). Neu übernehmen: `hand` (nur 1), `d` (nur ±1), `neu` (nur 1), `zl` (1–16), `anker {root 0–11, hn 0–127}`. Ohne das klänge ein FANG-TEIL-Teil nach dem Neuladen anders (F +5 statt −7).
- Clip-Noten: `g` (Durchgang) beim Overdub setzen und in `normalizeProject` erhalten.
- PianoRoll: Tastenspalte, Griffe, Schraffur, neue Optionen `lage`/`onLage`.
- Akkord-Zeilen-Blatt (Kästchen-Zug, [↕]), LAGE-Blatt (neu), `normalizeProject`, Undo, Test-API, Hilfe.

**Option früher bauen:**
- Der Teil ohne Pfeile (Klammer, Rollen, Hand-Richtung, Fläche, Export) braucht nichts aus V2. Er ginge auch direkt nach V0d, als „VL1“ mit ≈ 4 h.
- Die Pfeile kämen dann mit V2c. Das entscheidet der Orchestrator.

**Risiken:**
1. Flächen klingen anders (Umkehrungen statt Parallel). Gegenmittel: Rolle Sequenz für Stabs, Frage 1 unten, Hörtest.
2. Gesten in der Tastenspalte (Griff gegen Scrollen). Gegenmittel: Griffe nur an den Enden, ein Undo je Zug.
3. Hand-Richtung bei Umkehrungen: `rootNote` ist der tiefste Ton mit Grundton-Tonklasse (Z. 3621). Das ist plausibel, aber am iPhone zu prüfen.
4. Der Zwischenspeicher muss bei jeder Clip-Bearbeitung verworfen werden (Version je Clip).

---

## 8 Abnahme N8T

- [ ] **N8T-01** Aus = bitgleich: Ein Projekt ohne `settings.harmony.lage` (V0a-Stand, WP7, Demo) liefert über alle Harmonie-T-Tests (K1–K10) und 60 s Demo dieselben `noteLog`-Tonhöhen wie V2c′ (0 Abweichungen). Szenen- und Song-MIDI sind byte-gleich.
- [ ] **N8T-02** Neues Projekt: `lage:true`. Rollen-Vorschlag ohne Rückfrage nach §3.3: 12 Prüffälle (je Kategorie, dazu FM und Eigene mit Bass-, Akkord- und Melodie-Clip) alle richtig.
- [ ] **N8T-03** Auto-Klammer nach §3.7 für 20 Clips nachgerechnet. Höhe ≥ Clip-Umfang + 14, Bass-Boden E1. Ohne Träger und Verschiebung ändert die Lage keinen Ton (`noteLog` gleich wie „aus“).
- [ ] **N8T-04** Xanders Fall: TRANSPONIEREN, C5 dann F3 → Bass, Sequenz und Lead (Prüf-Clips wie `beweis.mjs`) klingen −7, nicht +5. Danach G3 → −5, C4 → 0. Mit C4 dann F4 → +5. **Dazu:** ORIGINAL → F3 = −7, ORIGINAL → F4 = +5 (Tastatur ab C3, `R.trOct` 3), C3 → C5 → F3 = 0 / −7 (wie `pruef3.out` B1).
- [ ] **N8T-05** Akkord-Zeile C Am F G ohne Pfeile: Bass-Grundtöne C2 A1 F1 G1, Sequenz 0/−3/−7/−5. Zwei Durchläufe sind identisch (M-ZEIT, Tonhöhen gleich). **Zyklisch:** Für alle 4 Drehungen von I–V–vi–IV, IV–vi–I–V, I–vi–IV–V und vi–IV–I–V ist die Summe |Grundton-Schritte| inkl. Naht ≤ V0a und = Minimum (Bass, Sequenz, Lead; Prototyp 48/48). Ein Teil mit 2 Zeilen-Durchläufen hat im Song dasselbe `noteLog` wie in der Clip-Ansicht.
- [ ] **N8T-06** Pfeil Am↑: Sequenz und Lead +9, F +5, G +7; Bass A1 F1 G1. Pfeil auf einer Wiederholung (Am Am↑) → zweiter Takt +9. **Absolut:** C Am↑ F↓ G → F = −7. Jeder gesetzte Pfeil ändert die Lage dieses Kästchens gegenüber „auto“ oder ist schon gleich; dann zeigt das LCD „schon oben“ bzw. „schon unten“.
- [ ] **N8T-07** Fläche C4 E4 G4 unter C Am F G → C4E4G4 / C4E4A4 / C4F4A4 / H3D4G4, Stimmbewegung ≤ 9 HT (V0a 65). Offene Fläche ≤ 30 HT. Tonklassen je Anschlag = Kern (100 %). **Doppeltöne:** Flächen C4E4G4C5, A3C4E4A4, C3G3C4E4 unter allen Stufenakkorden haben je Anschlag so viele verschiedene Töne wie das Original (C4E4G4C5 unter F = C4 F4 A4 F5). `lageCheck` zählt Doppeltöne über die Kern-Verschmelzung hinaus: 0.
- [ ] **N8T-08** `lageCheck(20261017, 2000)`: Bass außerhalb 0, gefaltete Bass-Riffs bei Auto 0, Lead- und Sequenz-Konturbrüche gegenüber dem Kern 0, Fläche-Stimmen > 6 HT 0, Schleife 100 % stabil.
- [ ] **N8T-09** (ab V2f/V2c) `S.shift` +6 und `R.xp` +12: Bass bleibt in der Klammer. [Fest anwenden] klingt gleich: `noteLog` gleich, Render ≤ 0,5 dB je Band.
- [ ] **N8T-10** Absolut (CV): C2 bzw. C6 → Bass bleibt in C2-Lage (V0a C0 bzw. C4); Sequenz −12/+12, Lead 0/+12.
- [ ] **N8T-11** FANG TEIL: Hand C5 F3 G3 C4 → Teil. Wiedergabe = live gehört (alle Spuren, alle Töne). Wird ab dem 2. Akkord eingefangen, ist der Anker gespeichert und die Wiedergabe gleich. Die Zeile zeigt „C · F↓ · G↑ · C↑“. **Nach Speichern und Neuladen** ist die Wiedergabe gleich der Live-Wiedergabe (`noteLog` 100 %), ebenso nach einem Song-Mitschnitt mit Hand-Griffen (`normTarget`/`logCarrier` erhalten `hand`, `d`, `neu`, `zl`, `anker`).
- [ ] **N8T-12** Zustandslos: ▶ ab Takt 3 eines Teils bzw. Songs liefert ab dort dieselben Tonhöhen wie der Durchlauf ab Takt 1 (3 Songs, `noteLog`).
- [ ] **N8T-13** Klammer von Hand enger als Clip-Umfang + 14 → amber, LCD „eng“. Der Bass verlässt sie trotzdem nie.
- [ ] **N8T-14** MIDI „mit Träger“ (Szene, alle, Song) = `noteLog`-Tonhöhen der Wiedergabe (100 %). „Original“ unverändert. **Szene:** Hand C5 → F3, Szene stehen lassen, Export = `noteLog` der laufenden Szene unter diesem Träger-Eintrag (mit seinem Kettenwert A je Spur).
- [ ] **N8T-15** Aufnahme unter Träger (REC, Overdub, FANG) in Bass-, Sequenz- und Fläche-Spur: Wiedergabe **unter demselben Träger-Eintrag mit demselben Kettenwert A je Spur** (gleiche Vorgeschichte) = gespielt (je 50 Zufallsfälle, 100 %). **Overdub einer Stimme in eine Fläche** ändert die vorhandenen Stimmen desselben Anschlags nicht (0 Abweichungen in 50 Zufallsfällen; Prototyp mit Durchgang `g`: 0/50).
- [ ] **N8T-16** Klammer bedienen:
  - Griff-Treffer 40×44 (P) bzw. 40×36 (L). Zug in Halbtönen, nicht enger als Clip-Töne.
  - Am Rand scrollt sie mit (≤ 1 Oktave/s). Zug außerhalb der Griffe scrollt wie bisher. Tipp auf einen Griff öffnet das Blatt.
  - Liegt die Klammer außerhalb der Ansicht, erscheint eine Randlasche. Ein Undo je Zug.
- [ ] **N8T-17** LAGE-Blatt: 5 Rollen-Chips, [Auto], 3 Richtungs-Chips, Erklärzeile. P1 ≤ 216 px, L1 ≤ 150 px. Ein Wechsel wirkt am nächsten Takt (M-ZEIT ±0,002).
- [ ] **N8T-18** Akkord-Zeile: Kästchen ≥ 16 px hoch bzw. runter → ↑/↓, zurück in die Mitte → auto. [↕] in der Frei-Zeile. Ein Undo. Song-Zeile AKK. zeigt „Am↑“; keine neue Zeile.
- [ ] **N8T-19** Leistung: Lage-Stufe ≤ 5 µs je Note ohne bzw. ≤ 1 µs mit Zwischenspeicher (Xeon). PE1 besteht (tick-p95 ≤ 4 ms).
- [ ] **N8T-20** M-PLATZ in P1, P2, P3, L1, L2 und W für ROLLE mit Klammer, LAGE-Blatt und Akkord-Zeile mit Pfeilen. Das Einblenden der Klammer verschiebt nichts um mehr als 2 px (L3).
- [ ] **N8T-21** Hilfe-Zeile und LCD beim ersten Griff bzw. Pfeil (L10).
- [ ] **N8T-22** Sound mit `lage` auf eine Auto-Spur geladen → Klammer = Schnitt aus Clip-Regel und `[lo, hi + Clip-Umfang]` (§3.7). Prüfwerte aus den Vorbild-Dateien (Stand nach Review): „Oktav-Pumpbass“ C2-06 Grundton A1–G2 (`vorbild-coldwave2.md` §5), „Fahrbahn-Bass“ K1 hoch D3 (einseitig), „Laufsteg-Lead“ K3 tief A4 (einseitig, `vorbild-helden.md` §8). Die Hörprobe des Sounds wird in seiner eigenen Lage nicht gefaltet. Ist der Schnitt enger als Clip-Umfang + 14, gilt die Clip-Regel und das Blatt zeigt „Sound-Lage passt nicht ganz“.
- [ ] **N8T-23** Regression und DoD: Harmonie-T-Tests, FG1/FG2 und V2c′-Tests mit Lage aus **und** an.
- [ ] **N8T-24** Taps (im Test-Skript gezählt, ab geöffneter ROLLE): Bass-Grenze, Sequenz-Grenze, Akkord-Richtung (Akkord-Zeile), Akkord je Clip (`dirAt`) und Clip-Richtung sind je in ≤ 4 Taps bzw. Gesten erreichbar, auch wenn die Klammer außerhalb der Ansicht liegt.
- [ ] **N8T-25** `dirAt`: „Sequenz bei Am ↑, Lead unverändert“ in ≤ 4 Taps eingestellt; wirkt in der Akkord-Zeile (Sequenz 0/+9/+5/+7, Lead 0/−3/−7/−5) und live (C5 → A3 → F3: Sequenz 0/+9/+5, Lead 0/−3/−7).
- [ ] **N8T-26** Teil-Marke löschen, verschieben oder umbenennen ändert das `noteLog` um 0 Töne (Neustart steht in `song.carrier[i].target.neu`).

**Für Xanders iPhone-Test (3 Punkte):**
1. Oberes C, dann unteres F: Die Sequenz geht runter.
2. Akkord-Zeile C Am F G: Der Bass bleibt unten, die Fläche greift um.
3. Am-Kästchen hochziehen: An der Stelle geht die Sequenz nach oben.
4. Nach ORIGINAL nur das untere F greifen: Die Sequenz geht runter.

---

## 9 Fragen an Xander (nicht blockierend; der Bau nimmt die Vorgabe)

| # | Frage | Vorgabe |
|---|---|---|
| 1 | Soll die Fläche umgreifen wie ein Keyboarder, oder wie heute parallel mitspringen? | umgreifen; parallel = Rolle Sequenz |
| 2 | Soll die Musik beim Spielen deiner Hand folgen (tiefer greifen = tiefer)? | ja |
| 3 | Darf ein Pfeil ↑ auch den Bass mitnehmen, solange er in seiner Klammer bleibt? | ja, nie über die Klammer |

---

## 10 Quellen (alle abgerufen bzw. gesucht am 17.10.2026)

**Eigene Dateien:**
- `synq-snapshots/V0a.html`, Zeilen wie angegeben (nur gelesen).
- `v3-ideen/r7/lage-proto/` (`repro-ist.out`, `beweis.out`, `stress.out`, Fassung 3: `lage3.mjs`, `pruef3.mjs` → `pruef3.out`).
- Review-Skripte `scratchpad/review-lage-tmp/t1.mjs`–`t5.mjs` (Befunde zu Fassung 2, nachgemessen).
- `v3-ideen/r7/song-geo/geo.out` (Geometrie, anderer Agent).
- `v3-ideen/r7/vorbild-helden.md` §8, `v3-ideen/r7/vorbild-coldwave2.md` §5 (Sound-Lagen, andere Agenten).
- `v3-ideen/r6/bibliothek-recherche.md` §12.3 (E1-Prüfung).
- `v3-ideen/SYNQUENZER-vision.md` [H1–H19] (frühere Harmonie-Recherche).
- `v3-ideen/r7/song-delta.md` (N7S-Entwurf, Zeitleiste, FANG TEIL).

**Yamaha**
- [Y1] Genos Reference Manual: https://usa.yamaha.com/files/download/other_assets/7/1131007/genos_en_rm_h0.pdf · Spiegel https://data.yamaha.com/files/download/other_assets/7/1131007/genos_en_rm_h0.pdf · https://www.yamaha.com.cn/uploads/file/20180330/05.pdf (SE)
- [Y2] Genos2 Reference Manual: https://data.yamaha.com/files/download/other_assets/1/2318561/Genos2_reference_manual_En_C0.pdf (SE)
- [Y3] PSR-S950 RM: https://data.yamaha.com/files/download/other_assets/7/328237/psrs950_en_rm_a0.pdf · PSR-SX920/SX720 RM: https://data.yamaha.com/files/download/other_assets/2/2918572/psrsx920_sx720plus_sx720_En_rm_d0.pdf (SE)
- [Y4] PSR-8000 Owner’s Manual S. 71: https://www.manualslib.com/manual/196909/Yamaha-Portatone-Psr-8000.html?page=71 (SE)
- [Y5] Tyros2 Manual S. 166: https://www.manualowl.com/m/Yamaha/Tyros2/Manual/152933?page=166 (SE)
- [Y6] Wierzba/Bedesem, Style File Description v2.1: https://wierzba.hier-im-netz.de/StyleFileDescription_v21.pdf (SE)
- [Y7] Jørgen Sørensen (jososoft), CASM: http://www.jososoft.dk/yamaha/articles/style2_2.htm · http://www.jososoft.dk/yamaha/articles/keyboard_and_style.pdf (SE)
- [Y8] yahaha (Nachbau eines Dritten): https://github.com/ryangavin/yahaha/pull/55 · https://github.com/ryangavin/yahaha/pull/57 · https://github.com/ryangavin/yahaha/pull/60 · https://github.com/ryangavin/yahaha/issues/11 (SE)
- [Y9] PSR-Tutorial FAQ 2016: https://psrtutorial.com/MB/zips/FAQ%202016.pdf (SE)
- [Y10] Forum „Genos Style Octave“: https://forum.psrtutorial.com/index.php?topic=44777.0 · „Change octave in styles“: https://forum.psrtutorial.com/index.php?topic=52786.0 (SE)
- [Y11] Jan’s Dance Styles: https://psrtutorial.com/sty/collections/jan.html (SE)
- [Y12] Forum „NTR & NTT settings for styles“: https://forum.psrtutorial.com/index.php?topic=66803.0 · „Understanding NTT/NTR Guitar mode“: https://forum.psrtutorial.com/index.php/topic,48919.0.html (SE)
- [Y13] „Genos 2 Style Creator“: https://forum.psrtutorial.com/index.php?topic=67786.0 · „Creating a style the easy way?“: https://yamahamusicians.com/forum/threads/creating-a-style-the-easy-way.22339/ · Kurs: https://keyboard-akademie.de/en/shop/video-kurse/genos-das-grosse-style-creator-training/ (SE)
- [Y14] Forum „Style Creator“: https://forum.psrtutorial.com/index.php?topic=70453.0 (SE)
- [Y15] „Style part only plays in major chord“: https://yamahamusicians.com/forum/viewtopic.php?p=122425 (SE)

**Korg**
- [K1] Pa3X Advanced Edit Manual: https://cdn.korg.com/us/support/download/files/f305489ac5ac1cf2c78b78a90eaa3201.pdf?response-content-disposition=inline%3Bfilename%3DPa3X_AE_Manual_v100_E.pdf&response-content-type=application%2Fpdf%3B (SE)
- [K2] Pa3X User Manual S. 139: https://www.manualslib.com/manual/824584/Korg-Pa3x-76-Keys.html?page=139 (SE)
- [K3] Pa300 S. 111: https://www.manualslib.com/manual/828914/Korg-Pa300.html?page=111 (SE)
- [K4] Pa600 Reference Manual S. 58/66: https://www.manualslib.com/manual/688476/Korg-Pa600.html?page=66 (SE)
- [K5] Pa4X: https://www.korg.com/us/products/synthesizers/pa4x/page_3.php · https://www.manualsdir.com/manuals/848950/korg-pa4x-76.html?page=247 (SE)
- [K6] Korg Forums: https://korgforums.com/forum/phpBB3/viewtopic.php?t=105526 (SE)

**Roland**
- [R1] E-09 Owner’s Manual: http://cdn.roland.com/assets/media/pdf/E-09_OM.pdf (SE)
- [R2] Roland Clan Forums: https://forums.rolandclan.com/viewtopic.php?t=63092 (SE)
- [R3] E-A7 Reference Manual (Kopie): https://tmw.com.sg/wp-content/uploads/2022/04/roland-e-a7-reference-manual.pdf · Roland E-A7: https://www.roland.com/us/products/e-a7/ (SE)

**Ableton und Plug-ins**
- [A1] Live 12 MIDI Effect Reference: https://www.ableton.com/en/manual/live-midi-effect-reference/ (SE)
- [A2] Live 12 Release Notes: https://www.ableton.com/en/release-notes/live-12/ (SE)
- [A3] Scaler 3: https://scalermusic.com/products/scaler-3/ · https://forum.scalermusic.com/t/auto-voice-leading-in-scaler-3-review/22629 · https://www.attackmagazine.com/technique/tutorials/scaler-3-chart-ready-chords-and-compositions-for-any-skill-level/ · https://forum.scalermusic.com/t/scaler-3-latest-version/20939 (SE)
- [A4] Captain Plugins: https://www.musicradar.com/reviews/mixed-in-key-captain-plugins · https://www.soundonsound.com/reviews/mixed-key-captain-plug-ins · https://mixedinkey.com/captain-plugins/how-to-guide/captain-deep/ · https://mixedinkey.com/captain-plugins/how-to-guide/captain-chords/ (SE)

**Logic**
- [L1] Logic Pro für iPad, Session Player: https://support.apple.com/guide/logicpro-ipad/lpip5e3e59c4/ipados · https://support.apple.com/guide/logicpro-ipad/lpipd090cc55/ipados (SE)

**Teenage Engineering**
- [T1] OP-XY auxiliary/brain: https://teenage.engineering/guides/op-xy/auxiliary · https://www.soundonsound.com/reviews/teenage-engineering-op-xy (SE)
- [T2] OP-Z: https://op-forums.com/t/question-about-the-mastertrack/13643 · https://op-forums.com/t/master-track-modes-and-keys-demystification-in-progress/16577 · https://teenage.engineering/guides/op-z/interface-overview (SE)

**Cubase**
- [C1] Follow Chord Track Modes: https://archive.steinberg.help/cubase_pro_artist/v9/en/cubase_nuendo/topics/chord_functions/chord_functions_follow_chord_track_r.html (SE)
- [C2] Adaptive Voicing: https://www.steinberg.help/r/cubase-le/14.0/en/cubase_nuendo/topics/chord_pads/chord_pads_adaptive_voicing_c.html (SE)
- [C3] Chord Track / Voicings: https://www.steinberg.help/r/cubase-ai/14.0/en/cubase_nuendo/topics/chord_functions/chord_functions_controlling_midi_or_audio_playback_using_the_chord_track_c.html · https://www.steinberg.help/r/cubase-ai/15.0/en/cubase_nuendo/topics/chord_pads/chord_pads_player_mode_settings_r.html?contentId=GOcUuVXjq5eH2KOXRolOEg (SE)
- [C5] Using Cubase’s Chorder Plug-in (Sound On Sound): https://www.soundonsound.com/techniques/using-cubases-chorder-plug (SE)
- [C4] Steinberg-Forum: https://forums.steinberg.net/t/follow-chord-track-super-confusing/143747 · https://forums.steinberg.net/t/follow-chord-track-root-notes-question/823443 · https://forums.steinberg.net/t/chord-track-is-too-low-an-octave-any-way-to-fix-it/108145 · https://forums.steinberg.net/t/frustration-with-chord-track-voicing-and-other-things/101277 (SE)

---

## 11 Review-Protokoll (17.10.2026)

Alle 11 Befunde wurden nachgeprüft: die Review-Skripte `review-lage-tmp/t1.mjs`–`t5.mjs` erneut ausgeführt, V0a Z. 3759–3765, 4061–4066, 8276–8285, 11768 und 17190–17198 gelesen. Alle 11 sind echt und eingearbeitet. Gemessen wurde mit dem neuen Prototyp `lage-proto/lage3.mjs` und `pruef3.mjs` → `pruef3.out`. Abgelehnt wurde keiner. Abweichungen vom vorgeschlagenen Fix:

| # | Befund | Umsetzung | Abweichung (Grund) |
|---|---|---|---|
| 1 | Hand: oberes C → unteres F geht in zwei Lagen nach oben | §0, §3.5, §4.4, §5, §7, N8T-04; B1 gemessen | keine |
| 2 | Auto gierig, Song kettet anders als Clip | zyklisch je Durchlauf (§3.5, §3.8), N8T-05; B2 48/48 und 12/12 | Der Song speichert keine Werte je Spur, sondern `neu` + `zl` am ersten Träger-Eintrag. Die zyklische Wahl hängt von Spur, Clip-Bezug und Rolle ab; aus `neu`/`zl` ergibt sie sich im Song genauso wie in der Clip-Ansicht (gemessen 12/12). Das spart Daten je Spur × Clip. Ein Gleichstand geht bei Sequenz/Lead nach oben: C G Am F → 0/+7/+9/+5 (Fassung 2 ging nach unten, gleiche Summe 18). |
| 3 | Pfeil relativ wirkt nicht | Pfeil absolut (§3.2, §3.5, §5, §6.3), N8T-06; B3 | keine |
| 4 | Fläche mit Doppeltönen; Overdub ändert vorhandene Stimmen | Doppelton-Stufe, Grundton-Fix nur offen (§3.6), N8T-07; B4, B7 | Nur Doppeltöne minimieren reicht für den Overdub nicht: 21 von 50 Zufallsfällen ändern trotzdem eine vorhandene Stimme (B5). Darum ein neues Feld `g` (Aufnahme-Durchgang) je Note; frühere Durchgänge bleiben fest (0 von 50). Preis: 4 Doppeltöne in 50 Overdub-Fällen. `stress.mjs` selbst blieb unverändert, die neuen Zähler stehen in `pruef3.mjs` B7. |
| 5 | Kein Hebel „diese Sequenz bei Am hoch, der Lead nicht“ | `SynthClip.dirAt`, Chip-Reihe im LAGE-Blatt, `Sound.dirAt` (§3.5, §5, §6.2), N8T-25; B6 | Schlüssel ist der **Grundton (0–11)**, nicht der Akkordname: Live ergibt ein einzelner Ton A den Träger-Namen „A“, nicht „Am“ (gemessen, `review-lage-tmp/t6.mjs`). Das LAGE-Blatt wird dadurch 44 px höher (P1 260 px, L1 186 px); mit N8T-20 nachmessen. |
| 6 | Teil-Marke trägt Klang | `neu`/`zl`/`anker` am Träger-Eintrag, Marken = Etikett (§3.8, §5), N8T-26 | keine |
| 7 | `normTarget`/`logCarrier` verwerfen neue Felder | §7 Berührungspunkte, N8T-11 | keine (Code gelesen, BELEGT) |
| 8 | Szenen-Export ohne Kettenwert | §3.8 MIDI-Export, N8T-14 | keine |
| 9 | Keine Tap-Zählung | Tabelle in §3.9, N8T-24 | Die Genos-Spalte bleibt UNBELEGT: Eine Tap-Zählung am Genos wurde nicht gefunden. |
| 10 | Klang-Lage als Vereinigung wirkungslos | Schnitt, Grundton-Bereich `{lo?, hi?}` (§3.7, §5), N8T-22 | Statt des Chips „eng“ (der heißt schon „Oktavsprünge werden gefaltet“) zeigt das Blatt „Sound-Lage passt nicht ganz“. Der Widerspruch bei C2-06 (A1–A2 gegen A1–G2) ist in `vorbild-coldwave2.md` §5 behoben (Grundton A1–G2, alle Töne A1–A3). |
| 11 | N8T-15 nicht eindeutig | N8T-15 umformuliert, Overdub-Messung ergänzt | keine |

Budget dadurch +0,75 h und +2 KB (§7). Fassung 2 (`lage.mjs`, `beweis.out`, `stress.out`) bleibt zum Vergleich liegen.
