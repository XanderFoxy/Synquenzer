# Kodamo EssenceFM – Bildschirm und Touch-Bedienung (Rekonstruktion aus Quellen)

Stand 17.10.2026 · Runde 7 · Auftrag: Xanders Priorität 1 („Kodamo-EssenceFM-Nachbau“, fragen-xander-7.md)

> **ÜBERHOLT (Nachtrag 2, K2-02, Review 1, 17.10.2026):** Für Handbuch-Fakten gilt `r7/kodamo-pdf/handbuch-komplett.md` §10. Die BELEGT-Marken hier stammen aus Suchauszügen, nicht aus dem PDF V7.0. Am PDF berichtigt sind unten: Pitch EG Range (S. 31: „Tone, 5th, 1, 2, 4 and 8 octaves“), Operator-Reiter (S. 27: „Base, Amp, Mod and Pitch“), Zwei-Finger-Wortlaut (S. 19: „connect them together … additional connections“). Mixer-Operator (bis 4 Ausgänge) und Fan-out per Zwei-Finger stammen aus SysEx-Doku bzw. Forum, nicht aus dem Handbuch. Diese Datei liegt nicht am Bau-Ort (EN2-17).

## 0 Methode und Grenzen (bitte zuerst lesen)

- **Direkter Abruf war gesperrt.** kodamo.org, youtube.com, gearnews.com, synthtopia.com, musicradar.com, sonicstate.com, bonedo.de und web.archive.org lieferten bei WebFetch bzw. curl „ENOTFOUND“ bzw. „CONNECT 403“. Alle Angaben stammen deshalb aus **Suchmaschinen-Auszügen** (WebSearch), die oft wörtliche Sätze aus dem Handbuch oder aus Forenbeiträgen zitieren. Videos konnte ich **nicht ansehen**, Transkripte waren nicht erreichbar. Produktfotos konnte ich nicht öffnen.
- **Bewertung je Aussage:**
  - **BELEGT** = wörtlicher Text aus einer Kodamo-Primärquelle (Handbuch, Newsletter, Kodamo-Forumsbeitrag des Herstellers) oder zwei unabhängige Quellen.
  - **WAHRSCHEINLICH** = eine Sekundärquelle (Händler, Presse, einzelner Nutzerbeitrag).
  - **UNBELEGT** = keine Quelle gefunden. Das ist meine Deutung oder eine Lücke.
- Der Hersteller hat Handbuch-Fassungen von 2019 (Vorab-Fassung 12-12-2019) bis zur Fassung für Firmware V7.0 (05/2025) veröffentlicht [Q1]. Die Suchauszüge sagen nicht immer, aus welcher Fassung ein Satz stammt.
- Eigene Entwurfsvorschläge stehen **nur** in Teil 8 und sind dort als **VORSCHLAG** markiert.

## 1 Kurzantwort

| Frage | Antwort | Status |
|---|---|---|
| Wo ist der Algorithmus? | **Linke Seite** des Voice-Editors | BELEGT [Q1] |
| Wo sitzen die Träger? | **Ganz unten.** Der Algorithmus wird von oben nach unten gelesen; die untersten Operatoren sind Träger | BELEGT [Q1] |
| Wie wird der Ausgang gezeichnet? | **Keine Quelle gefunden.** Ob es eine Ausgangsschiene/-linie unter den Trägern gibt, ist offen | UNBELEGT |
| Wie stapeln sich Modulatoren? | Senkrecht über ihrem Ziel; ein Operator speist den darunter | BELEGT [Q1] |
| Was ist rechts daneben? | **Rechtes Panel:** Ist kein Operator gewählt, zeigt es Stimmen-Parameter. Ist ein Operator gewählt, zeigt es dessen Parameter auf 4 Seiten: **Base, Amp, Mod, Pitch** (Handbuch V7.0 S. 27; „Vol“ nur in einer älteren Quelle) | BELEGT [Q1] |
| Wie hängt das mit den Knöpfen zusammen? | **6 Hardware-Drehregler rechts neben dem Bildschirm.** Ist kein Operator gewählt (Tab „Base“, seit V7.0), regelt jeder Knopf die Lautstärke eines Operators; Knopf und Operator haben dieselbe Farbe, und ein dicker Balken links am Operator zeigt die Lautstärke. Ist ein Operator gewählt, werden die Operatoren grau, und die Knöpfe steuern die Werte im rechten Panel | BELEGT [Q2, Q3] |
| Drag & Drop | Operator auf einen anderen ziehen → verbinden. Waren beide schon verbunden → **Plätze tauschen**. Bewegen löscht **immer die unteren Verbindungen**. Loslassen im Leeren → Operator **fällt** nach unten. **Zwei Finger** auf zwei Operatoren → Verbindung, die per Ziehen nicht geht | BELEGT [Q1, Q7] |
| „Essence“ | Keine Quelle erklärt den Namen. Die Engine heißt **VFM = Variable Frequency Modulation** | Name UNBELEGT; VFM BELEGT [Q12, Q23] |

## 2 Aufbau des Algorithmus-Bildschirms (Voice-Editor)

### 2.1 Gesamtaufteilung
- **Bildschirm:** 7-Zoll-IPS-Farbdisplay mit Multitouch für bis zu 10 Finger. **BELEGT** [Q12, Q25]
- **Seitenmodell:** Die Oberfläche ist in Seiten gegliedert. **Oben** zeigt ein **Breadcrumb**, wo man ist. Ein Modus-Taster öffnet die Hauptseite des Modus, von dort geht es zu Unterseiten. **BELEGT** [Q1]
- **Teilung des Voice-Editors:** „the left part of the screen displays the algorithm, while the right panel displays parameters relative to the voice (when no operator is focused) or relative to the focused operator.“ **BELEGT** [Q1]
- **Fokus:** Das fokussierte Element ändert man mit dem **Main Dial** oder den Tasten **INC/DEC**. Es lässt sich auch kopieren und einfügen. **BELEGT** [Q1]
- **Hardware rechts vom Bildschirm:** „the 6 knobs located on the right side of the touchscreen allow you to edit values without the need to focus the element“. Ausnahme ist die Hauptseite des Performance-Modus: Dort sind die Knöpfe frei zuweisbare Controller (MIDI-CC). **BELEGT** [Q1]. Laut Spezifikation hat das Gerät 14 Taster, 7 Drehgeber und 2 Lautstärkeregler. **BELEGT** [Q29]

### 2.2 Linke Hälfte: Algorithmus
- **Leserichtung:** von oben nach unten. Ein Operator, der in einen darunter speist, ist ein Modulator; man hört ihn nicht direkt. Die untersten Operatoren sind Träger. Im Beispiel des Handbuchs sind **1, 5 und 6 Modulatoren** und **2, 3 und 4 Träger** (untere Reihe). **BELEGT** [Q1]
- **Mehrere Eingänge:** Mehrere Modulatoren auf einem Träger werden vor der Modulation **summiert**. Ein Modulator auf mehreren Trägern sendet an jeden. **BELEGT** [Q1]
- **Unsichtbarer Mixer:** „Mixer is a special, invisible operator … that allows to mix (sum) up to 4 operators' outputs.“ **BELEGT** [Q13]. Ein Suchauszug sagt außerdem, ein Operator nehme höchstens zwei Quellen direkt an und der Mixer werde erst ab mehr als zwei Quellen eingesetzt. Dafür habe ich keinen wörtlichen Beleg: **WAHRSCHEINLICH** [Q1, Auszug].
- **Operator-Kacheln:** Die Operatoren sind **Quadrate** („operator square icons“). **WAHRSCHEINLICH** [Q6, Nutzerbeitrag]. Ob sie eine Nummer 1–6 tragen, ist nicht direkt belegt. Das Handbuch spricht aber von „operators 1 and 2“ und zeigt ein nummeriertes Beispiel. **WAHRSCHEINLICH** [Q1]
- **Live-Pegel:** „The algorithm on the left side of the screen shows the operators, their output level is displayed in real-time when you are playing, allowing you to clearly see how their envelopes are working.“ **BELEGT** [Q1, Q16]. Wie der Pegel gezeichnet wird (Füllung, Helligkeit), ist **UNBELEGT**.
- **Lautstärke-Balken (ab V7.0):** „displayed as a thick bar on the left side of operators. Real-time envelope levels are still displayed.“ **BELEGT** [Q2]
- **Farbzuordnung (ab V7.0):** Im Tab „Base“ ohne gewählten Operator haben die Operatoren die Farben der 6 Knöpfe, die ihre Lautstärke regeln. **BELEGT** [Q2, Q3]
- **Feedback-Anzeige:** „operators 1 and 2 have a small number on their top right corner. This indicates their feedback source.“ Die Feedback-Quelle kann jeder Operator sein, auch der Operator selbst. **BELEGT** [Q1]. Dazu passt, dass Firmware V6.0 „2 Feedbacks per Voice“ brachte [Q8]. Davor gab es genau einen Feedback-Pfad [Q7]. Eine ältere Produkt-PDF nennt die Einstellung „Feedback Source (1…6)“ nur für OP1 [Q1, Korn-PDF]. **Deutung (WAHRSCHEINLICH):** Feedback-Ziele sind fest OP1 und OP2, die Quelle ist wählbar. Auf eine Bitte, das Feedback-Ziel frei wählbar zu machen, antwortete der Hersteller „Not possible“ [Q7].
- **Stummschalten:** „Tapping two times on an operator will mute/unmute it“ (wie die Taste M); stummgeschaltete Operatoren erscheinen **dunkelgrau**. **BELEGT** [Q1, Q7]. Die Funktion wurde im Januar 2021 im Forum angekündigt [Q7].
- **Verbindungslinien:** Die Operatoren sind durch Linien verbunden. In Global › Display › Appearance schaltet „Line Animations“ die Animation dieser Linien auf der Voice-Seite und des Signalwegs auf der Effects-Seite ein oder aus. **BELEGT** [Q1]. Wie die Linien genau aussehen (gerade, abgewinkelt, Richtung), ist **UNBELEGT**.
- **Ausgang:** Die Träger senden „directly to the output“ [Q1]. **Wie** der Ausgang gezeichnet wird (Schiene, Pfeil, nichts), ist **UNBELEGT**. Auch Fotos konnte ich nicht prüfen.
- **Lage der Kacheln:** Ein Nutzer im V7-Thread schreibt von „operator squares on the touch screen at the bottom left“. **WAHRSCHEINLICH** [Q6]. Das passt dazu, dass Träger unten sitzen.

### 2.3 Rechte Hälfte: Panel „in Relation zu den Operatoren“
- **Kein Operator gewählt** (man tippt dafür ins Leere links): Stimmen-Parameter. Belegt sind **Voice Name, Volume, Transpose, Tuning (Cent), Scale, Category, Algorithm Library**. **BELEGT** [Q1]
  - **Algorithm Library:** 32 Algorithmen als Startpunkt (Werte 0…31, die DX7-Algorithmen). **BELEGT** [Q1, Korn-PDF]. Ein freier Algorithmus bleibt also möglich, man muss aber nicht leer anfangen.
  - Der Tab heißt „Base“ [Q2, Q3]. Weitere Stimmen-Tabs (Filter, LFO 1/2, Mod-Matrix mit 8 Plätzen je Stimme) sind als Funktionen belegt [Q1, Q29], ihre **Tab-Namen und Reihenfolge aber UNBELEGT**. Filter und Mod-Matrix erreicht man laut einem Auszug, indem man ins Leere neben die Operatoren tippt. **WAHRSCHEINLICH** [Q1, Auszug]
  - **Knöpfe in diesem Zustand (ab V7.0):** „when no operator is focused, the 6 colored knobs directly control each OP's volume“. **BELEGT** [Q2]
- **Operator gewählt** (Operator antippen): „Pressing on an operator changes the layout of the screen to show its parameters. They're spread on 4 pages: Base, Amp [in einer Quelle: Vol], Mod and Pitch.“ **BELEGT** [Q1]
  - **Base:** Wellenform 0…23 (MKII/neuere Firmware: 48 editierbare Wellen [Q18]), Phase, Multiplikator ×0…×40 oder feste Frequenz 0…20 kHz, Vierteltöne und Feinstimmung; im Modus „Fixed“ erscheinen Fein-Frequenz und eine Hz-Anzeige. **BELEGT** [Q1, Korn-PDF]. Seit V6.0 sind auch gebrochene Multiplikatoren möglich [Q8].
  - **Amp/Vol:** grafische Lautstärke-Hüllkurve mit 6 Punkten und Loop sowie grafische Tasten-Lautstärke-Skalierung. Hinweis im Handbuch: Die Hüllkurve eines Trägers sollte auf null enden, sonst klingt die Stimme nach dem Loslassen der Taste weiter. **BELEGT** [Q1]
  - **Mod:** Anschlagdynamik auf die Lautstärke, LFO-AM, Verweis auf die Mod-Matrix. **BELEGT** [Q1]
  - **Pitch:** Tonhöhen-Hüllkurve je Operator; „Pitch EG Range“: „Tone, 5th, 1, 2, 4 and 8 octaves“ (Handbuch V7.0 S. 31). **BELEGT** (PDF; berichtigt in Review 1, vorher „bis 4 Oktaven“)
  - **Knöpfe in diesem Zustand:** Die Operatoren werden grau, weil die Knöpfe jetzt die Einstellungen des rechten Panels steuern. **BELEGT** [Q2, Q3]
- **Hüllkurven** sind grafisch, haben 6 Punkte und verlaufen logarithmisch. Eine Stimme hat 14 davon: 6× Lautstärke, 6× Tonhöhe, 1× Filter, 1× Panorama. Man zeichnet sie auf dem Touchscreen, ebenso die Wellenformen. **BELEGT** [Q1, Q14, Q29]. Kopieren geht so: Hüllkurve fokussieren, Copy, anderen Operator wählen, Paste. Ganze Operatoren lassen sich ebenso kopieren. **BELEGT** [Q1]

**Antwort auf Xanders Satz** „RECHTS daneben eine Anzeige, die die Werte in Relation zu den Operatoren zeigt und einstellen lässt“: Bei EssenceFM sind das **zwei Dinge zusammen**:
- (a) das **rechte Bildschirm-Panel**: Es zeigt Stimmen-Werte oder die Werte des gewählten Operators.
- (b) die **6 farbigen Hardware-Knöpfe** rechts davon: Ohne Auswahl ist Knopf n = Lautstärke von OP n (gleiche Farbe, Balken am Operator). Mit Auswahl regeln die Knöpfe die Panel-Werte. **BELEGT** [Q1, Q2, Q3]

## 3 Drag & Drop Schritt für Schritt (laut Handbuch)

Wortlaut-Kern [Q1]: „Pressing an operator and releasing it (drag&drop) onto another one will connect them together. If these operators are already connected together, their positions will be swapped. Moving an operator always removes its bottom links. Releasing an operator in an empty area and it will simply fall, going to the bottom or to the nearest operator below. Using two fingers and pressing simultaneously two operators will connect them together …“ (Wortlaut PDF V7.0 S. 19; der Auszug hatte „link“) **BELEGT** (Handbuch und Forum [Q1, Q7])

1. **Anfassen:** Finger auf einen Operator legen und ziehen.
2. **Sofort beim Bewegen:** Die **unteren Verbindungen** des Operators fallen weg, also die Verbindungen zu dem, was er moduliert. **BELEGT**. Ob seine eigenen Modulatoren an ihm hängen bleiben und mitwandern, ist **UNBELEGT**. Der Satz nennt nur „bottom links“, das spricht eher dafür.
3. **Loslassen auf einem anderen Operator:** Die beiden werden verbunden. **BELEGT**. Welcher von beiden Modulator wird, ist nicht wörtlich belegt. Wegen „Leserichtung von oben nach unten“ und „fällt nach unten“ ist **WAHRSCHEINLICH**: Der gezogene Operator wird Modulator dessen, auf den man ihn fallen lässt, und landet darüber.
4. **Loslassen auf einem schon verbundenen Partner:** Die beiden **tauschen die Plätze**. **BELEGT**
5. **Loslassen im Leeren:** Der Operator **fällt** senkrecht bis ganz nach unten (wird damit Träger) oder bis auf den nächsten Operator darunter (wird dessen Modulator). **BELEGT**. Die zweite Deutung in der Klammer ist **WAHRSCHEINLICH**.
6. **Zwei Finger** gleichzeitig auf zwei Operatoren verbinden sie. So entstehen Verbindungen, die mit einem Finger nicht gehen, z. B. ein zweites Ziel (Fan-out) oder Verbindungen über mehrere Ebenen. **BELEGT** [Q1, Q7]. Die Beispiele in der Klammer sind meine Deutung (**UNBELEGT**).
7. **Doppeltipp** = stumm/an. **BELEGT** [Q1]
8. **Einfaches Tippen** = Operator fokussieren; das rechte Panel zeigt dann seine Parameter. **Tippen ins Leere** = Stimmen-Parameter. **BELEGT** [Q1]
9. **Undo/Redo** für die meisten Aktionen, auch für Algorithmus und Wellen; beworben wurde eine Historie von 1000 Schritten. **BELEGT** [Q1 (laut früherer Runde KO1), Q17]
10. **Speichern** passiert nie automatisch; man drückt Save. „Recall“ lädt den zuletzt gespeicherten Stand. **BELEGT** [Q1]

**Nicht gefunden (UNBELEGT):**
- wie man einzelne Verbindungen löscht, ohne zu bewegen
- ob man Operatoren entfernen oder hinzufügen kann. Es sind immer 6; „aus“ geht über Stummschalten oder Lautstärke 0. Ein Forumsauszug nennt Lautstärke 0 als Trick, um die Hüllkurven eines Operators als Mod-Quelle zu nutzen [Q10, Q11].
- ob es beim Ziehen eine Vorschau gibt
- wie Feedback per Geste gesetzt wird. Belegt ist nur das Zahlen-Kästchen oben rechts an OP1/OP2 und der Parameter „Feedback Source“.

## 4 Wie Nutzer urteilen

### 4.1 Lob
- „one of, if not the, most intuitive and easy to use 6 operator FM synths“; komplexe 6-OP-Patches seien „fast work“. **WAHRSCHEINLICH** [Q19]
- Die Touch-Bedienung der Operatoren sei „incredibly cool“; keine spürbare Latenz bei starkem Layering. **WAHRSCHEINLICH** [Q20]
- Algorithmen anordnen und Hüllkurven setzen fühle sich auf dem Touchscreen besser an als erwartet; die Drehgeber bleiben für Feinarbeit nützlich. **WAHRSCHEINLICH** [Q21]
- Deutsche Händlerbewertung: Durch das große Touch-Display sei das Gerät „nahezu selbsterklärend“. **WAHRSCHEINLICH** [Q22]. Ein Händler-Nutzer schreibt, es sei „far easier to program than older FM synths“. **WAHRSCHEINLICH** [Q18]
- Gehäuse „built like a tank“, Touch „super-responsive“. **WAHRSCHEINLICH** [Q25, Q21]
- Presse beim Start: „makes FM synthesis fun & easy“, „graphical approach“ (Kodamo-Selbstbeschreibung, von zwei Medien wiedergegeben). **BELEGT** als Herstelleraussage [Q14, Q15]
- Lob für Firmware-Pflege und Eingehen auf Wünsche. **WAHRSCHEINLICH** [Q22]

### 4.2 Kritik
- **Touch statt Knöpfe:** Manche wollen keine Hardware, die man über ein Touch-Display bedient, und wünschen sich direkte Regler. Ein im Kodamo-Forum zitierter Rezensent sah „so much screen tapping and menus“. **WAHRSCHEINLICH** [Q19, Q28]
- **Moduswechsel der Knöpfe verwirrt:** Ein Nutzer berichtet, dass nach dem Editieren bzw. Zufallswerten alle Operator-Quadrate grau wurden und die Knöpfe auf die Basis-Parameter des Operators umsprangen. **WAHRSCHEINLICH** [Q6]
- **Zipper-Geräusche** beim Drehen der farbigen Knöpfe, wenn die Mod-Matrix dieselben Lautstärken steuert. Der Hersteller sagt, das sei erwartet. **BELEGT** (Herstellerantwort) [Q6]
- **Jog-Wheel** „wobbly and plastic“; Werks-Demos „cheesy“. **WAHRSCHEINLICH** [Q21]
- Tasten-Beschriftung bei Beleuchtung schlecht lesbar. **WAHRSCHEINLICH** [Q22]
- Hüllkurven-Skalierung (V6.0) reagierte nicht auf Undo/Redo und nicht auf Doppeltipp-Reset. **WAHRSCHEINLICH** [Q8]
- **Feedback** nur 1 (bis V5.x), dann 2 je Stimme; Feedback-Ziel nicht frei wählbar. **BELEGT** [Q7, Q8]

### 4.3 Wünsche (Forum)
Laut Feature-Request-Liste 2025 [Q10] und früheren Threads [Q7, Q11]:
- mehr Mod-Matrix-Plätze
- Offset und Ratio als Ziele (Ratio kam in V7.0 [Q3])
- **Operatoren als Mod-Quellen** (der Hersteller lehnte das zuerst ab, Mod-Rate ≈ 700 Hz, und deutete es später an)
- mehr LFOs (2. LFO kam in V7.0)
- **Feedback auf mehr Operatoren**
- Nicht machbar sei laut Hersteller „vieles“

**WAHRSCHEINLICH**; die Herstellerantworten sind **BELEGT**.

### 4.4 Was langsam oder verwirrend ist (Synthese aus 3.–4.2, eigene Einordnung)
- **Wirkung hängt vom Zustand ab:** Derselbe Zug auf denselben Operator verbindet oder tauscht, je nachdem, ob schon verbunden ist.
- **Bewegen ist zerstörerisch:** Es löscht die unteren Verbindungen sofort.
- Manche Verbindungen gehen **nur mit zwei Fingern**. Das ist nicht entdeckbar, Nutzer fragen im Forum danach [Q7].
- **Knopf-Modus wechselt** je nach Fokus.
- Feedback ist nur über ein kleines Zahlenfeld sichtbar.

Diese Punkte sind meine Deutung aus belegten Regeln, kein Zitat.

## 5 „Essence“ – was bedeutet das?
- **Keine Quelle erklärt den Namen „EssenceFM“.** **UNBELEGT**. Ein Elektronauts-Beitrag erwähnt, der Entwickler habe einen anderen Namen („Beatmasquer“) erwogen und verworfen. Unklar ist, ob das EssenceFM oder ein anderes Produkt betraf. **WAHRSCHEINLICH**, Bezug unsicher [Q21, S.8]
- **Belegt ist das Engine-Konzept:** „VFM engine (Variable Frequency Modulation) we designed“. Dazu kommen ein subtraktiver Teil (resonantes Filter, ab V4.3 Multimode LP/HP mit Überblendung) sowie gezeichnete und importierte Wellen. **BELEGT** [Q12, Q23, Q7]
- **Hierarchie:** Voice (kleinstes Element, 6-OP-FM-Klang) → Patch (bis 128 geschichtete oder gesplittete Voices plus Effekte) → Performance (16 Parts auf MIDI-Kanälen) → Global. **BELEGT** [Q1, Q12]. Mehr als 6 Operatoren gibt es nur über Layer (12/18/24+). **BELEGT** [Q23, Polynominal laut R4]
- **Deutung (UNBELEGT):** „Essence“ = auf das Wesentliche von FM reduziert und frei verschaltbar. Das ist **nicht** belegt und darf nicht als Herstelleraussage zitiert werden.

## 6 Firmware- und Hardware-Versionen (nur bedienrelevante Punkte)

| Version / Datum | Änderung | Status / Quelle |
|---|---|---|
| Prototyp, SynthFest France 06/2019 | „operators can be drag&dropped on each other to build the algorithm“; Echtzeit-Pegel; noch in Entwicklung | BELEGT [Q15, Q16] |
| Vorbestellung 01/2020, Auslieferung ab 02/2020 | Handbuch-Vorabfassung 12-12-2019 (52 S.) | BELEGT [Q23, Q1] |
| MKII, angekündigt Soundmit 11/2020 (mit Keyboard „VFM37“) | neues Multimode-Filter, 48 statt 24 editierbare Wellen (laut Händler auch per Update für MKI) | WAHRSCHEINLICH [Q23, Q18] |
| V4.3 (11/2020), 4.3d (02/2021) | Filter LP/HP überblendbar, Exclusion Group Soft/Hard-Cut (echtes Mono), synchronisierter Voice-Sequencer, frei laufende Operator-Phase | BELEGT [Q7] |
| 01/2021 (nächste Firmware) | **Doppeltipp = Operator stumm/an** | BELEGT [Q7] |
| V5.2 (07/2021), 5.2b | XY-Controller, „Layer-Morphing“ (eher Layer-Mischen); Voice-SysEx; 5.2b behebt Nummerierung der Feedback-Quelle | BELEGT [Q9] |
| V5.3 (11/2021), 5.3b | Parts auf Mono-Ausgänge; Hüllkurven-Darstellung (erster Punkt scrollt nicht mehr); 5.3b behebt Layout-Überlappung Fx1/Fx2 | BELEGT [Q9] |
| V6.0 (31.12.2021), bis 6.0f | **2 Feedbacks pro Voice**, **gebrochene Multiplikatoren**, Hüllkurven-Skalierung, poly. Portamento, 4 Mono-Modi, besserer DX7-Import, Listen-Export | BELEGT [Q8] |
| V7.0 (05/2025), 7.0c/7.0d | **Base-Tab: 6 farbige Knöpfe = OP-Lautstärken, Farbzuordnung, dicker Balken links am Operator**; 16-Spur-Sequencer mit 128 Schritten; 2. LFO; FX-Presets; frei laufende Hüllkurven; Mod-Matrix kann sich selbst modulieren; Ratio jedes Slots als Ziel; besserer Feedback-Bereich, wenn die Quelle ein Träger ist | BELEGT [Q2, Q3, Q4, Q5] |

Ein Downgrade ist nicht möglich. **WAHRSCHEINLICH** [Q9]

## 7 Kodamo MASK1 – nur gemeinsame Bedien-Ideen
- **Gegenentwurf statt Touch:** MASK1 hat bewusst nur ein 4-stelliges rotes Display, 23 Taster und 2 Drehgeber („very few parameters, but very well selected ones“). **BELEGT** [Q26]
- **Gemeinsame Ideen mit EssenceFM:**
  - **Fokus-Prinzip** „Parameter wählen, dann ein Rad für den Wert“ (Param << >> + Value/Data). Bei EssenceFM entspricht das Fokus + Main Dial/INC-DEC.
  - **Speichern nur ausdrücklich** (Write/Save) mit Verwerfen beim Wechsel. Dazu kommt eine **Compare**-Taste (Vergleich mit gespeichertem Stand); EssenceFM hat „Recall“.
  - Den Wert-Regler kann man als **Echtzeit-Controller** nutzen, wenn man auf einem Parameter stehen bleibt.
  - **BELEGT** [Q26, Q1]
- **Urteile:** Einerseits „simple, menu-dive-free“ und leicht verständlich, andererseits schwer flüssig zu editieren; das sparsame UI habe die Verbreitung gebremst. **WAHRSCHEINLICH** [Q26]
- Die Klangidee (Bitmaske: eine Zahl erzeugt eine Welle) ist in der früheren Runde beschrieben (MASTER-BRIEFING Teil 10.2) und für die Bedienung hier nicht relevant.

## 8 Ableitung für SYNQUENZER (VORSCHLAG, nicht Quelle)
- **VORSCHLAG:** Den Grundaufbau 1:1 übernehmen, weil Xander ihn ausdrücklich will:
  - links das Feld mit Trägern unten
  - rechts ein Panel, das ohne Auswahl die 6 OP-Lautstärken farbig zeigt (Balken links an jeder Kachel, gleiche Farbe wie der Regler rechts) und mit Auswahl Base/Amp/Mod/Pitch des Operators
- **VORSCHLAG:** Weil das iPhone keine Hardware-Knöpfe hat, ersetzt das rechte Panel die 6 Knöpfe durch **6 farbige Schieber/Drehknöpfe**. Im Hochformat sitzen sie neben dem Feld (schmale Spalte), im Querformat als Panel.
- **VORSCHLAG:** Die Kritikpunkte aus 4.4 entschärfen, wie schon im FM-Feld-Konzept (MASTER-BRIEFING 10.4):
  - Bewegen löscht nichts.
  - Das Ergebnis hängt nur vom Ablageort ab.
  - Es gibt eine Vorschau.
  - Ein sichtbarer Anfasser ersetzt die Zwei-Finger-Geste.
  - **Aber:** „fällt nach unten“, „Doppeltipp = stumm“ und „Tippen ins Leere = Stimmen-Werte“ sind belegte EssenceFM-Gesten und sollten gleich bleiben, damit es sich „wie EssenceFM“ anfühlt.
- **VORSCHLAG:** Ausgang als sichtbare Schiene unter den Trägern. Das ist **eine eigene Ergänzung**, da bei EssenceFM unbelegt.

## 9 ASCII-Skizze: EssenceFM-Voice-Editor (so treu wie die Quellen erlauben)

Legende: `[B]` = BELEGT, `[W]` = WAHRSCHEINLICH, `[?]` = UNBELEGT bzw. geraten. Das Beispiel-Algorithmus-Bild entspricht dem Handbuch-Beispiel: 1, 5, 6 Modulatoren; 2, 3, 4 Träger. Welcher Modulator auf welchem Träger sitzt, ist **[?]**, hier frei gewählt.

```
 ┌──────────────────────────────── 7" Touch, quer [B] ─────────────────────────────────┐  ┌ Hardware [B] ┐
 │ VOICE › E.Piano 1 › Editor                       (Breadcrumb oben [B]; Text [?])    │  │              │
 ├───────────────────────────────────────────┬─────────────────────────────────────────┤  │  (●) K1 rot  │
 │ ALGORITHMUS (linke Hälfte [B])            │ RECHTES PANEL [B]                       │  │              │
 │                                           │                                         │  │  (●) K2 gelb │
 │            ┌───┐²                         │  Zustand A: kein OP fokussiert [B]      │  │              │
 │           ▌│ 1 │   Feedback-Quelle =      │  Tab: [Base] [?] [?] [?]  (nur „Base“   │  │  (●) K3 grün │
 │            └─┬─┘   kleine Zahl oben       │        als Name belegt)                 │  │              │
 │              │     rechts an OP1/OP2 [B]  │  Voice Name ...... E.Piano 1     [B]    │  │  (●) K4 blau │
 │              │                            │  Volume .......... 100           [B]    │  │              │
 │   ┌───┐      │      ┌───┐                 │  Transpose ....... 0             [B]    │  │  (●) K5 lila │
 │  ▌│ 5 │      │     ▌│ 6 │                 │  Tuning (cent) ... 0             [B]    │  │              │
 │   └─┬─┘      │      └─┬─┘                 │  Scale / Category                [B]    │  │  (●) K6 türk.│
 │     │        │        │    Linien ggf.    │  Algorithm Library  0…31 (DX7)   [B]    │  │              │
 │     │        │        │    animiert [B];  │  (Werte und Layout der Zeilen [?])      │  │ Knöpfe rechts│
 │     │        │        │    Form [?]       │                                         │  │ vom Display  │
 │   ┌─┴─┐²   ┌─┴─┐    ┌─┴─┐                 │  → ab V7.0: K1–K6 = Lautstärke OP1–OP6, │  │ [B]          │
 │  ▌│ 2 │   ▌│ 3 │   ▌│ 4 │   ← Träger:     │    Kachel-Farbe = Knopf-Farbe,          │  │ Main Dial,   │
 │   └───┘    └───┘    └───┘     unterste    │    ▌ = dicker Lautstärke-Balken links   │  │ INC / DEC,   │
 │     ·        ·        ·       Reihe [B]   │    an jeder Kachel [B]                  │  │ Undo/Redo,   │
 │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  Ausgang:      │                                         │  │ Copy/Paste,  │
 │  Darstellung UNBELEGT [?] (Linie? nichts?)│  Zustand B: OP antippen [B]             │  │ Save/Recall, │
 │                                           │  Seiten: Base │ Amp(Vol) │ Mod │ Pitch  │  │ M (Mute) [B] │
 │  Live: Ausgangspegel je OP beim Spielen   │  Base: Welle 0…23/47, Phase,            │  │ (genaue Lage │
 │  (Art der Anzeige [?]) [B]                │        ×0…×40 / Fix Hz, Fein [B]        │  │ und Zahl der │
 │  Doppeltipp = stumm → dunkelgrau [B]      │  Amp:  6-Punkt-Hüllkurve gezeichnet,    │  │ Tasten [?])  │
 │  Tipp ins Leere = Zustand A [B]           │        Loop, Key-Scaling-Kurve [B]      │  │              │
 │  Tipp auf OP = Zustand B [B]              │  Mod:  Velocity→Vol, LFO-AM [B]         │  └──────────────┘
 │  Lage der Kacheln: Träger „unten links“   │  Pitch: Pitch-EG, Range 1 Ton…4 Okt [B] │
 │  laut Nutzer [W]; Abstände/Größen [?]     │  → Kacheln werden grau, K1–K6 steuern   │
 │                                           │    die Panel-Werte [B]                  │
 └───────────────────────────────────────────┴─────────────────────────────────────────┘
```

Gesten im linken Feld [B]:
- Ziehen auf einen OP → verbinden (verbunden → tauschen)
- Bewegen → untere Links weg
- Loslassen im Leeren → fällt nach unten
- 2 Finger auf 2 OPs → Zusatz-Link
- Doppeltipp → Mute

Feedback: ² an OP1/OP2 = Nummer der Feedback-Quelle. 2 Pfade ab V6.0 [B]; Ziel fest [W].

**Unsicher in der Skizze:**
- Ausgangsdarstellung
- Linienform
- Kachel-Inhalt (Nummer belegt nur indirekt)
- Art der Live-Pegel-Anzeige
- Tab-Namen außer „Base“
- Knopf-Farben (Farbzuordnung belegt, konkrete Farben **erfunden**)
- Größenverhältnis links/rechts
- genaue Lage der Hardware-Tasten

## 10 Quellen

Alle Quellen wurden über Suchmaschinen-Auszüge am 17.10.2026 gelesen; Direktabruf war gesperrt.

- [Q1] EssenceFM-Handbuch (interaktiv): https://kodamo.org/essencefm_manual.php · PDF: https://kodamo.org/doc/EssenceFM%20User%20Manual.pdf · ManualsLib: https://www.manualslib.com/manual/2809283/Kodamo-Essencefm-Mkii.html · https://www.manualslib.com/manual/2247624/Kodamo-Essence-Fm-Mkii.html · Händler-PDF (Korn): https://cdn.korn.eu/documents/product/275069_m.pdf
- [Q2] Kodamo-Newsletter V7.0: https://kodamo.org/newsletters/newsletter_05_2025.html
- [Q3] MATRIXSYNTH zu V7.0: https://www.matrixsynth.com/2025/05/essencefm-v70.html
- [Q4] Synth Anatomy V7.0: https://synthanatomy.com/2025/05/kodamo-essencefm-7-0-new-firmware-adds-multi-track-sequencer-second-lfo-and-more.html
- [Q5] gearnews V7.0: https://www.gearnews.com/kodamo-essencefm-synth/
- [Q6] Kodamo-Forum, V7.0 Feedback/Bugs: https://kodamo.org/forumtopic932
- [Q7] Kodamo-Forum, Firmware V4.3 (Zwei-Finger-Links, Doppeltipp-Mute, Feedback-Limit): https://kodamo.org/forum_topic.php?id=158 (= https://kodamo.org/forumtopic158)
- [Q8] Kodamo-Forum, Firmware V6.0: https://kodamo.org/forumtopic389
- [Q9] Kodamo-Forum, Firmware V5.2 / V5.3: https://kodamo.org/forumtopic298 · https://kodamo.org/forumtopic360 · Firmware-Seite: https://kodamo.org/firmwares · News: https://kodamo.org/news · Newsletter 02/2021 (fr): https://kodamo.org/newsletters/newsletter_02_2021_fr.html
- [Q10] Kodamo-Forum, Feature-Request-Liste: https://kodamo.org/forumtopic849
- [Q11] Kodamo-Forum, FM der Filterfrequenz per Operator: https://kodamo.org/forumtopic518
- [Q12] Produktseiten: https://kodamo.org/essencefm.php · https://kodamo.org/product.php?id=4 · https://kodamo.org/product.php?id=5
- [Q13] SysEx-Doku (Mixer-Operator): https://kodamo.org/efm_sysex.php
- [Q14] MusicTech: https://musictech.com/news/gear/kodamo-futuristic-essencefm-synth-takes-a-graphical-approach/
- [Q15] Synthtopia 2019: https://www.synthtopia.com/content/2019/06/14/new-synth-kodamo-essencefm-promises-to-make-fm-synthesis-fun-easy/ · SynthFest-Video-Post: https://www.synthtopia.com/?p=109146
- [Q16] Sonicstate 2019: https://sonicstate.com/news/2019/06/17/essencefm-modern-high-end-fm-synthesizer/
- [Q17] Ask.Audio: https://ask.audio/articles/essencefm-is-a-300-voice-hybrid-fm-and-subtractive-synth
- [Q18] Perfect Circuit (MKII, Nutzerbewertung): https://www.perfectcircuit.com/kodamo-essence-fm.html
- [Q19] Gearspace-Thread: https://gearspace.com/board/electronic-music-instruments-and-electronic-music-production/1267688-kodamo-essencefm-hardware-synth.html (Seiten 4, 5, 7, 9) · https://gearspace.com/gear/kodamo/essencefm
- [Q20] MOD WIGGLER: https://www.modwiggler.com/forum/viewtopic.php?t=218549 · https://www.modwiggler.com/forum/viewtopic.php?p=3853333
- [Q21] Elektronauts: https://www.elektronauts.com/t/kodamo-essencefm/96116 (Seiten 2, 8, 11; Beitrag #258)
- [Q22] Thomann-Bewertungen: https://www.thomannmusic.com/kodamo_essence_fm_mkii.htm · https://thomann.co.uk/kodamo_essence_fm_mkii_reviews.htm
- [Q23] Synth Anatomy: https://synthanatomy.com/2019/06/kodamo-essencefm-multi-timbral-synthesizer.html · https://synthanatomy.com/2020/01/kodamo-essencefm-300-voice-hybrid-poly-synth-is-ready-for-pre-order.html · https://synthanatomy.com/2020/11/kodamo-vfm37-synthesizer-essencefm-mk2-at-soundmit-2020.html
- [Q24] YouTube (nur Titel gesehen, **nicht angesehen**):
  - „Patch from scratch“ https://www.youtube.com/watch?v=E32Vc6IGc9M
  - „6-Operator drones and looping envelopes“ https://www.youtube.com/watch?v=wens2nFcaQM
  - „One step sequencing“ https://www.youtube.com/watch?v=Xw7_atiZ_qE
  - „Tutorial et sound design #1/#2“ https://www.youtube.com/watch?v=qBze_Xd87vA · https://www.youtube.com/watch?v=dNTbwwx43hU
  - „FM Synth Showdown“ https://www.youtube.com/watch?v=tSmZhw8L4TA
  - MATRIXSYNTH: https://www.matrixsynth.com/2025/01/kodamo-essence-fm-exploring-expressive.html · https://www.matrixsynth.com/2025/12/kodamo-essencefm-patch-from-scratch.html
- [Q25] KMR Audio: https://kmraudio.com/blogs/blog/kodamo-essencefm-now-available · https://www.kmraudio.com/kodamo-essence-fm.php
- [Q26] MASK1:
  - Handbuch https://kodamo.org/downloads/Kodamo%20MASK1%20User%20Manual.pdf · https://www.manualslib.com/manual/3012722/Kodamo-Mask1.html
  - Quickstart Mask1EX MK2 https://kodamo.org/downloads/mask1exmk2_quickstart.pdf
  - Tests: https://www.perfectcircuit.com/signal/kodamo-mask1-review · https://www.gearnews.com/review-kodamo-mask1-bitmask-synthesizer/ · https://sonicstate.com/news/2023/06/02/sonic-lab-kodamo-mask1-bitmask-synthesizer-review/
  - Foren: https://gearspace.com/board/reviews/1412417-kodamo-mask-1-bitmask-synthesizer.html · https://www.modwiggler.com/forum/viewtopic.php?t=279547
  - Newsletter: https://kodamo.org/newsletters/newsletter_03_2024.html
- [Q27] bonedo (de): https://www.bonedo.de/artikel/kodamo-ein-6-op-fm-synthesizer-mit-anderer-optik-und-300-stimmen-und-vielen-extras
- [Q28] Kodamo-Forum, Venus-Theory-Review: https://kodamo.org/forumtopic363
- [Q29] Spezifikationen: https://kodamo.org/specifications.php
- [Q30] Kodamo-Forum, DX7-Import: https://kodamo.org/forumtopic4

**Nicht gefunden:**
- ein Sound-On-Sound-Test der EssenceFM
- ein MusicRadar-Test (nur die Meldung von 2019)
- Transkripte der Videos
