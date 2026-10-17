# Kodamo-Delta – verbindliche Nachträge zum FM-Feld (V4a · V4b · V4c)

Stand 17.10.2026 · Runde 7, Xanders Priorität 1 (`v3-ideen/fragen-xander-7.md`, P1) · **Status: verbindlich.**

- Gilt zusätzlich zu `dirigent-spec-v3.md` §9 und §17 (V4a–V4c) und zu Nachtrag 1, A.7 (N4a–N4c). **Bei Widerspruch gilt dieses Delta.**
- Es ändert außerdem Nachtrag 1, A.4b Punkt 11 (was nach V4 wandert), und die V4-Zeilen in C.1 und C.4 (Teil 9).
- `p.fmx` ist noch nicht gebaut. Alle Datenänderungen hier brauchen deshalb **keine Migration**.

**Xanders Wunsch (P1, sinngemäß):** Die Bausteine entsprechen den EssenceFM-Operatoren. Unten liegen die Operatoren, die mit dem Ausgang verbunden sind (Träger). Weitere Bausteine zieht man darauf, um FM-mäßig zu modulieren. RECHTS daneben zeigt eine Anzeige die Werte in Relation zu den Operatoren und lässt sie einstellen – genau wie bei EssenceFM. Der klassische DX-Modus bleibt (`fragen-xander-6.md` I1).

**Was sich gegenüber Spec §9 ändert (Kurzfassung):**
1. **Feld links, Wertefeld rechts**, wie im EssenceFM-Voice-Editor. Das Wertefeld hat zwei Zustände: ohne Wahl „ALLE OP“ (ein Streifen je Operator, Ersatz für die 6 farbigen Drehknöpfe), mit Wahl „OP n“ (Reiter BASIS · HÜLLK. · MOD · TONH.).
2. **Gesten wie bei EssenceFM:** Ziehen auf einen Operator verbindet, auf einen schon verbundenen tauscht die Plätze, Bewegen löst die unteren Verbindungen, Loslassen im Leeren lässt den Operator fallen, zwei Finger verbinden, Doppeltipp schaltet stumm. Zonen, Zurückschnappen, Anfasser, Parkplatz und [+] entfallen.
3. **Genau 6 Operatoren** (wie EssenceFM), immer alle da, aus = stumm. „Bis 8“ (E2) entfällt.
4. **Kachel wie EssenceFM:** Nummer, Frequenz, Lautstärke-Balken links, Feedback-Quelle oben rechts, Leuchten mit dem Live-Pegel.
5. **Neu je Operator:** 12 Wellen, Phase-Modus, Feedback mit Quelle, eigene Tonhöhen-Hüllkurve, LFO-AM/-FM.
6. Erhalten bleiben unsere Ergänzungen, die EssenceFM nicht widersprechen: Vorschau beim Ziehen, ein Undo je Geste, [A│B], Linie antippen, Mod-Picker beim Halten, Raster, DX-Seite und DX-Brücke.

---

## 0 Grundlage und Kennzeichen

### 0.1 Quellen

| Kürzel | Quelle | Ort |
|---|---|---|
| **H** | Kodamo EssenceFM User Manual, Web-Ausgabe „For firmware V7.0, updated 2025-05-15“ (H S. 1) | https://kodamo.org/essencefm_manual.php · gelesen als Safari-PDF-Ausdruck dieser Seite vom 17.10.2026 (82 Seiten, Kopf- und Fußzeile nennen die URL): `v3-ideen/r7/kodamo-pdf/EssenceFM-manual.pdf`. **„S. n“ = PDF-Seite.** |
| **H-Bild** | Bildschirmfotos im Handbuch (400×240 px), ausgeschnitten nach `r7/kodamo-delta/handbuch-bilder/` | eigene Ablesung |
| **R7-H / R7-O** | `r7/kodamo-handbuch.md`, `r7/kodamo-oberflaeche.md` (Suchauszüge mit URLs, u. a. Newsletter V7.0 https://kodamo.org/newsletters/newsletter_05_2025.html, Forum https://kodamo.org/forumtopic849) | frühere R7-Recherche |
| **Mess** | eigene Messungen dieses Deltas in `r7/kodamo-delta/`: `img-mass.py/.out` (Handbuch-Bild), `geo.mjs/.out` (V0a-Geometrie), `layout-check.mjs/.out` (Raster, Maße, Farben), `cpu6.mjs/.out` (CPU) | Chromium bzw. Node auf der Xeon-VM, **nicht am iPhone** |

**Zugang in diesem Schritt:** WebFetch auf kodamo.org scheitert (ENOTFOUND, 17.10.2026). Das WebSearch-Kontingent dieser Runde war aufgebraucht; es gab **keine neue Websuche**. Grundlage ist deshalb das Handbuch selbst (Primärquelle) plus die R7-Dateien. Die Handbuch-Sätze stimmen wörtlich mit den Suchauszügen der R7-Dateien überein (z. B. der Drag-&-Drop-Absatz H S. 19 = R7-O §3).

### 0.2 Kennzeichen

- **BELEGT (H S. n)** = Wortlaut im Handbuch.
- **BELEGT (H-Bild S. n)** = im Bildschirmfoto des Handbuchs zu sehen; die Ablesung ist meine.
- **gemessen (H-Bild S. n)** = Pixelmessung am Bildschirmfoto (`img-mass.out`).
- **WAHRSCHEINLICH** = nur eine Sekundärquelle (aus R7-H/R7-O übernommen).
- **UNBELEGT** = nicht gefunden; offene Frage oder meine Deutung.
- **Entscheidung / VORSCHLAG** = eigene Gestaltung, keine Quelle.
- **gemessen** = eigene Messung (Chromium/Node, Xeon-VM).

### 0.3 Korrekturen an R7-H und R7-O (jetzt direkt im Handbuch gelesen)

| Punkt | R7 (Suchauszug) | Handbuch V7.0 |
|---|---|---|
| Reiter eines Operators | Base · Vol · Mod · Pitch | **Base · Amp · Mod · Pitch** (H S. 27) |
| Phase | 0–31 | **0…127**, Modus Fixed/Random/FreeRun (H S. 28) |
| Transpose der Voice | −60…+60 | **−36…+36** (H S. 20) |
| Key Vol Scale | im Reiter Vol | im Reiter **Mod** („Modulations“, H S. 30) |
| Pitch EG Range | Ganzton bis 4 Okt. | **Tone, 5th, 1, 2, 4, 8 Oktaven** (H S. 31) |
| Feste Frequenz | 0–20 kHz | Skalierer **×0,1/×1/×10/×100** und Grundwert **0…255** (H S. 28) |
| Ausgang | Darstellung UNBELEGT | In **keinem** Handbuch-Bild ist unter den Trägern eine Ausgangslinie gezeichnet (H-Bild S. 12, 13, 18, 19, 29) |
| Knopf-Farben | „erfunden“ | abgelesen: 1 rot, 2 weiß, 3 grün, 4 schiefergrau, 5 blau, 6 schwarz (H-Bild S. 18, 19, 27) |
| Werkswellen | Anzahl widersprüchlich | Liste 0–11 im Bild: Sine, Saw1, Saw2, Triangle, Square, HSine, Pulse, Harm1, Harm2, SSine, SSine2, Noise (H-Bild S. 61); 48 editierbare Wellen (H S. 2, 61). Die Operator-Tabelle nennt „Waveform 0…23“ (H S. 27): Widerspruch im Handbuch selbst. |
| Voice-Reiter | nur „Base“ belegt | V7.0-Bild: **Base · LFO1 · LFO2 · Flt · Mod · Pan** (H-Bild S. 27); ältere Fassung Base · LFO · Filter · ModMatrix · Pan (H-Bild S. 18) |
| Frequenz in der Kachel | – | Option „Op Frequencies: frequency will be displayed inside each operator in the Voice Editor“ (H S. 66) |
| Spec §9, Einleitung | „nur 1 Feedback je Algorithmus“ | **2 Feedbacks je Voice** an OP 1 und OP 2 (H S. 13, 25–26, 28) |

---

## 1 So ist der EssenceFM-Voice-Editor gebaut (nur Belegtes)

### 1.1 Aufteilung und Feld

- „The voice editor is split into two parts: the left part of the screen displays the algorithm, while the right panel displays parameters relative to the voice (when no operator is focused) or relative to the focused operator.“ **BELEGT (H S. 18).**
- Am Bild H S. 18 (400×240 px) gemessen (**gemessen (H-Bild S. 18)**, `img-mass.out`):
  - Das Panel beginnt bei x = 176: **links 44 %, rechts 56 %**.
  - Kachel **24×28 px**, Spaltenraster 29 px (Lücke 5), Reihenraster 36 px (Lücke 8).
  - Das Algorithmus-Feld misst 176×216 px. Das sind **6 Spalten × 6 Reihen**, Seitenverhältnis B/H 0,81.
  - Der Algorithmus sitzt unten links; darüber ist leerer Raum.
- Ein Algorithmus wird **von oben nach unten** gelesen. Die untersten Operatoren sind Träger: „Carriers send their signal directly to the output“. **BELEGT (H S. 12).**
- Mehrere Modulatoren auf einem Träger werden summiert. Ein Modulator speist mehrere Träger. Ketten sind möglich. **BELEGT (H S. 12–13).**
- Linien sind dünn und laufen vom Modulator unten zum Ziel oben; Fächer laufen schräg (**BELEGT (H-Bild S. 12, 13, 18)**). Die Linien-Animation lässt sich abschalten. **BELEGT (H S. 67).**

### 1.2 Kachel

- Große Nummer 1–6. Darunter klein die Frequenz bzw. das Verhältnis (Option „Op Frequencies“, **BELEGT (H S. 66)**; im Bild „3.50“, „1“, **BELEGT (H-Bild S. 18)**).
- Die Feedback-Quelle steht als kleine Zahl oben rechts an OP 1 und OP 2. **BELEGT (H S. 13).**
- Ohne Fokus: „Volume is displayed by a vertical bar on the left side of each operator.“ Die Kacheln tragen die Farben der 6 Knöpfe. **BELEGT (H S. 18).**
- „Operator output levels are displayed in real-time as you are playing.“ **BELEGT (H S. 18).** Wie der Pegel gezeichnet wird, ist **UNBELEGT**.
- „When you press on an operator to move it or edit it, they all become gray because the knobs are now mapped to the settings on the right panel.“ **BELEGT (H S. 18).**
- Stumm = dunkelgrau, fokussiert = grün. **BELEGT (H S. 19).**

### 1.3 Gesten (H S. 19, wörtlich)

- „Pressing an operator and releasing it (drag&drop) onto another one will connect them together.“
- „If these operators are already connected together, their positions will be swapped.“
- „Moving an operator always removes its bottom links.“
- „Releasing an operator in an empty area and it will simply fall, going to the bottom or to the nearest operator below.“
- „Using two fingers and pressing simultaneously two operators will connect them together. It allows to create additional connections that aren't always possible with the drag&drop operation.“
- „Tapping two times on a operator will mute/unmute it (same as pressing the M button …)“.
- „When an operator is pressed, the right panel shows the operator settings. When you press the touchscreen in an empty region of the left part of the screen, the right panel shows the voice settings.“

Alle **BELEGT (H S. 19).** Dazu:
- M- und S-Taste (Mute, Solo) des gewählten Operators **BELEGT (H S. 27)**.
- Copy/Paste eines ganzen Operators und einer Hüllkurve **BELEGT (H S. 7, 19, 29)**.
- Undo bis 1024 Schritte; Recall dient als Vergleich **BELEGT (H S. 7, 8, 15)**.
- Algorithm Library mit 32 DX7-Vorlagen **BELEGT (H S. 20, 25)**.

**Nicht im Handbuch (UNBELEGT):** welcher Operator beim Verbinden Modulator wird; ob das Fallen „auf den nächsten Operator darunter“ verbindet; wie man eine einzelne Linie löst; Hinzufügen oder Entfernen von Operatoren (es sind immer 6).

### 1.4 Rechtes Panel

- **Ohne Fokus:** Voice-Werte. Base: Voice Name, Volume 0…127, Transpose −36…+36, Tuning ±100 Cent, Scale, Category, Algorithm Library 0…31, Randomize mit Haken (Freq, Flt, VEG, PEG, Algo, Lvls). **BELEGT (H S. 20).** Die 6 farbigen Knöpfe regeln dann alle OP-Lautstärken gleichzeitig. **BELEGT (H S. 18).**
- **Mit Fokus:** „They're spread on 4 pages: Base, Amp, Mod and Pitch. M and S buttons …“ **BELEGT (H S. 27).**
  - **Base:** Waveform, Phase 0…127 mit Modus Fixed/Random/FreeRun, Volume 0…127, Feedback Source 1…6 und Feedback Level 0…127 „[OP1 and OP2 only]“, Fixed an/aus; im Multiplikativ-Modus Multiplier 0…40, Quartertones 0…24, Fine ±100; fest: Freq. Multiplier 0,1/1/10/100 und Freq. Fine 0…255. **BELEGT (H S. 27–28).** Das Bild zeigt eine Wellen-Vorschau mit Namen (**BELEGT (H-Bild S. 27)**).
  - **Amp:** Amplituden-Hüllkurve; ein Träger muss auf 0 enden. **BELEGT (H S. 29).**
  - **Mod:** Velocity Sensitivity −127…+127, LFO1 AM 0…127, LFO1 FM 0…127, Key Vol Scale als Grafik mit 3 Werten (Lower volume, Center note, Upper volume). **BELEGT (H S. 30; H-Bild S. 19, 30).**
  - **Pitch:** Tonhöhen-Hüllkurve je Operator, Pitch EG Range Tone/5th/1/2/4/8 Okt. **BELEGT (H S. 31).**
- **Werte-Eingabe:**
  - Die 6 Direct-Access-Knöpfe sind farblich den Werten zugeordnet; jeder Wert trägt eine Flagge mit der Knopfnummer. „All sliders and envelope points can be edited this way.“ **BELEGT (H S. 6, 11).**
  - Slider: waagrecht ziehen, Ziffernfeld, Doppeltipp zentriert bipolare Slider. **BELEGT (H S. 11).**
  - „Usually, the touch screen is the quickest way to find a ballpark value, while the knobs are great when precision is required.“ **BELEGT (H S. 7).**
- **Hüllkurven-Editor:** Punkte ziehen; Rad = senkrecht, Knöpfe = waagrecht; Zwei-Finger-Pinch = waagrechter Zoom; logarithmische Zeitachse; Anzeige „Total length“. Bis 6 Punkte, Sustain, Loop A/B, Lin/Exp, Scale, Retrig/FreeRun. **BELEGT (H S. 32–33).**

### 1.5 Mengen und Tipps

- **6 Operatoren** je Voice; mehr nur durch Schichten (bis 128 Voices je Patch). **BELEGT (H S. 2, 6).**
- **2 Feedbacks je Voice** (OP 1 und OP 2; Matrix-Ziele „Feedback 1/2“). Die Quelle kann jeder Operator sein, auch er selbst. **BELEGT (H S. 13, 25–26, 28).**
- **48 editierbare Wellen**, global für alle Voices; zeichnen oder als .wav laden. **BELEGT (H S. 2, 61–62).**
- „Start with a single operator (mute the others), then build your sound from there, by adding operators as you need them.“ **BELEGT (H S. 14).**
- „Use the sine wave first … Use other waveforms with care, as their aliasing limit is easily exceeded … (like the Square wave for cymbals, or the HSine for bowed strings).“ **BELEGT (H S. 14).**
- Taste Preview (♪) „plays a few notes to quickly listen to a sound without having to use a MIDI controller“. **BELEGT (H S. 8).**

---

## 2 Abgleich Spec §9 (mit Nachtrag A.7 und A.4b) ↔ EssenceFM, Punkt für Punkt

Urteil: **GLEICH** · **ANDERS** · **GEGENTEIL** · **FEHLT** (bei uns) · **NUR BEI UNS** (Ergänzung).

| # | Punkt | EssenceFM (Beleg) | Spec v3 §9 / Nachtrag 1 | Urteil | Nachtrag hier |
|---|---|---|---|---|---|
| A1 | Bildschirm-Teilung | links Algorithmus, rechts Panel (H S. 18), 44/56 % (gemessen) | Feld über die volle Breite, Kontextzeile unten, OP auf eigener Unterseite (§9.4) | ANDERS | EK-06, Teil 4 |
| A2 | Panel ohne Fokus | Voice-Werte; Knöpfe = alle OP-Lautstärken (H S. 18, 20) | Kontextzeile [Vorlagen ▾] [Raster] [Ich will …] | FEHLT | Zustand ALLE OP + MAKRO (4.4) |
| A3 | Panel mit Fokus | Base/Amp/Mod/Pitch + M/S (H S. 27) | OP-Unterseite FREQ/HÜLLK./SKAL. mit Solo (WP7, A.4b) | ANDERS (Ort) | Zustand OP n mit 4 Reitern (4.4) |
| A4 | Träger unten, oben → unten | ja (H S. 12) | Schiene = Ebene 0 | GLEICH | – |
| A5 | Ausgang gezeichnet | nein (H-Bild S. 12–19) | Schiene „AUSG.“; Ablegen dort = zusätzlicher Ausgang | ANDERS | Linie bleibt als reine Anzeige, keine eigene Geste (EK-03) |
| A6 | Raster | feste Kachelgröße, 6×6-Raster, unten links (gemessen) | Auto-Layout, Ebenen à 44 px, versetzte Halbreihen | ANDERS | 6×6-Raster, Spalte je Operator (4.1, 5.3) |
| A7 | Kachel-Inhalt | Nummer, Frequenz, FB-Ziffer, Lautstärke-Balken, Live-Pegel (H S. 13, 18, 66) | Buchstabe A–H, Verhältnis, Ring = Index, Hüllkurven-Miniatur | ANDERS / FEHLT | 4.3 |
| A8 | Farben | Knopffarben; fokussiert grün; stumm dunkelgrau; bei Fokus alle grau (H S. 18–19) | Rollenfarben | ANDERS | 4.3 |
| A9 | Linien | dünn, schräg, Animation abschaltbar (H-Bild; H S. 67) | Linienstärke = Tiefe | ANDERS | Stärke nur bei Tiefe ≠ 1 (Ergänzung) |
| B1 | Ziehen auf einen OP | verbinden (H S. 19) | Zonen OBEN/UNTEN/NEBEN/MITTE | ANDERS | EK-02 |
| B2 | Ziehen auf einen verbundenen OP | Plätze tauschen (H S. 19) | MITTE = tauschen | ANDERS (Bedingung) | EK-02 |
| B3 | Bewegen | entfernt immer die unteren Verbindungen (H S. 19) | ändert nie Verbindungen | GEGENTEIL | EK-02 |
| B4 | Loslassen im Leeren | fällt nach unten (H S. 19) | schnappt zurück | GEGENTEIL | EK-02 |
| B5 | Zwei Finger | verbinden (H S. 19) | obere moduliert untere, Beginn ≤ 300 ms | GLEICH | + Lösen bei schon verbundenem Paar |
| B6 | Doppeltipp | stumm/an (H S. 19) | – | FEHLT | EK-04 |
| B7 | Tippen auf OP | Fokus, Panel zeigt den OP (H S. 19) | wählen; Kontextzeile und OP-Seite folgen | GLEICH | – |
| B8 | Tippen ins Leere | Panel zeigt Voice-Werte (H S. 19) | – (Wischen im Leeren = nichts) | FEHLT | → Zustand ALLE OP |
| B9 | OP hinzufügen/entfernen | nie, immer 6 (H S. 2) | [+], Parkplatz | ANDERS | EK-01, EK-04 |
| B10 | Feedback | Parameter Quelle + Menge, Ziffer oben rechts (H S. 13, 28) | Anfasser ● auf sich selbst / nach oben | ANDERS | EK-05 |
| B11 | Zusatz-Verbindung | zwei Finger (H S. 19) | Anfasser ● oder zwei Finger | ANDERS | Anfasser entfällt; [⋯] › Verbindungen als Bedienhilfe |
| B12 | Linie lösen | – (UNBELEGT) | Linie tippen → Tiefe + [Lösen] | NUR BEI UNS | bleibt |
| B13 | Halten | – | Mod-Picker beim Loslassen | NUR BEI UNS | bleibt |
| B14 | Vergleich | Recall + Undo (H S. 8, 15) | [A│B] | GLEICH (Prinzip) | bleibt |
| B15 | Undo | bis 1024 (H S. 7) | jede Geste = ein Schritt | GLEICH | bleibt |
| B16 | Vorlagen | Algorithm Library, 32 (H S. 20) | [Vorlagen ▾], 32 Bilder | GLEICH | bleibt |
| B17 | OP kopieren | ganzer OP (H S. 19) | nur Hüllkurve (A.4b [⋯]) | FEHLT | [⋯] › OP kopieren / einfügen |
| B18 | Zufall | Randomize mit Haken (H S. 20) | – | FEHLT | *(P1)* in V4b |
| C1 | Operatorzahl | 6 (H S. 2) | bis 8 (E2) | ANDERS | EK-01: 6 |
| C2 | Feedbacks | 2 je Voice (H S. 25–28) | an jedem OP | NUR BEI UNS (mehr) | bleibt; Darstellung wie EssenceFM |
| C3 | Welle je OP | 48 Wellen, 12 Werkswellen (H S. 2, 61) | `wave:'sin'`, keine Liste | FEHLT | EK-08, 6.2 |
| C4 | Phase | 0…127 + Fixed/Random/FreeRun (H S. 28) | – | FEHLT | `ph`, `ph0` (6.1) |
| C5 | Pegel | Volume 0…127 (H S. 28) | OL 0–99 (DX) mit Index-Anzeige | ANDERS (Skala) | DX-Skala bleibt (EN-02) |
| C6 | Frequenz | Multiplier 0…40, Vierteltöne, Fine; fest ×0,1…×100 (H S. 28) | DX grob/fein/Verstimmung, fest | ANDERS (Skala) | DX bleibt; Anzeige in der Kachel wie EssenceFM |
| C7 | Lautstärke-Hüllkurve | 6 freie Punkte, Loop (H S. 31–33) | DX-Raten/-Pegel (A.4b-Editor) | ANDERS | EK-07 |
| C8 | Anschlag | ±127 (H S. 30) | vs 0–7; „Anschlag ±“ nach V4 (A.4b-11) | ANDERS (Skala) | `vs` −7…+7 |
| C9 | LFO je OP | AM und FM (H S. 30) | über Routen; AMS nach V4 (A.4b-11) | FEHLT (FM) | `ams`, `lfoFm` |
| C10 | Tastatur-Skalierung | Grafik mit 3 Punkten (H S. 30) | DX-Werte als Knöpfe (SKAL.) | ANDERS (Darstellung) | Grafik mit 3 Punkten (4.4) |
| C11 | Tonhöhen-Hüllkurve je OP | ja, mit Range (H S. 31) | Stimmen-PEG (A.4b); je OP „nach V4“ | FEHLT (je OP) | `peg` je OP |
| C12 | Live-Pegel | ja (H S. 18) | – | FEHLT | V4a `opLv`, V4b Leuchten |
| C13 | Mute/Solo | M/S (H S. 27) | Solo auf der OP-Seite | teilweise | [M] und [S] im Kopf des Wertefelds |
| D1 | Werte-Eingabe | Touch = grob, Knöpfe = fein, Flaggen 1–6 (H S. 6, 7, 11) | Regler-Konvention (seitlich = fein, `.rest`) | ANDERS (keine Knöpfe) | Streifen-Säule ersetzt die Knopf-Säule (4.4, 4.5) |
| D2 | Hüllkurven-Ansicht | log. Zeit, „Total length“, Pinch (H S. 32) | A.4b: log. Zeitachse, Zeiten-Zeile | GLEICH (Prinzip) | + „gesamt“ in der Zeiten-Zeile |
| D3 | Vorhersage/Spektrum | – | Vorhersage-Zeile (V4c) | NUR BEI UNS | im Wertefeld während des Ziehens (Teil 7) |
| D4 | DX-Brücke | DX7-Import (H S. 2) | Import/Export, `dxMatch` | GLEICH (mehr) | bleibt |

---

## 3 Entscheidungen

**EK-01 – Genau 6 Operatoren, immer alle da (ersetzt E2 und §9.1 „bis 8“).**
- EssenceFM hat 6 Operatoren je Voice (H S. 2). Xander verlangt, dass die Bausteine den EssenceFM-Operatoren entsprechen.
- Geometrie (gemessen, `layout-check.out`): Eine Reihe aus 6 Ausgängen braucht im Hochformat P1 bei der L4-Mindestgröße (36 px Kachel + 4 px Abstand) ein 240 px breites Feld. Dann bleiben 126 px für das Wertefeld. Mit 8 Operatoren bräuchte die Reihe 320 px, das Wertefeld hätte 46 px. Das bricht entweder „unterste Reihe = Ausgänge“ oder das rechte Wertefeld.
- Das EssenceFM-Feld ist selbst genau 6 × 6 groß (gemessen, H-Bild S. 18).
- CPU: Mit 6 festen Operatoren bleiben immer 8 Stimmen (6.5). Die Regeln „7–8 Op → 6 Stimmen“ und „Kanten > 12 → 4 Stimmen“ entfallen.
- Mehr als 6 Operatoren gibt es wie bei EssenceFM nur über Schichten (bis 128 Voices je Patch, H S. 2) → §18 Super-Synth-Schichten.
- Hinweis: Xander hatte früher die Kraft von FM-X mit 8 Operatoren gewünscht und die Grenze ausdrücklich offengelassen („ich soll entscheiden“, `fragen-xander.md` B6, `fragen-xander-2.md` C7). Rückfrage E-K1 (Teil 11), nicht blockierend.

**EK-02 – Gesten wie bei EssenceFM.** Zurückgenommen werden die R4-Leitsätze „Wirkung nur vom Ablageort“ und „Bewegen ändert nie Verbindungen“ sowie das Zurückschnappen im Leerraum (§9.1 Leitsätze 1 und 3, §9.4 Zonen). Sie widersprechen H S. 19. Bleiben darf die Vorschau, weil sie das Ergebnis nur ankündigt und nicht ändert (Teil 5).

**EK-03 – Ausgang = Operator ohne Verbindung nach unten.** Das folgt aus EssenceFM („feeding … into other ones under them … Modulators … bottommost … Carriers“, H S. 12) und aus der Regel „Bewegen löst die unteren Verbindungen“. Das Feld `out` entfällt; die Ausgänge werden aus `edges` abgeleitet. Die Ausgangslinie wird nur gezeichnet (Ergänzung, Xander: „unten die Operatoren, die mit dem Ausgang verbunden sind“). Sie ist kein eigenes Ablageziel.

**EK-04 – Stumm statt Parkplatz und [+].** Es gibt immer 6 Kacheln. „Aus“ heißt stumm: Doppeltipp oder [M], dunkelgrau (H S. 19, 27). `park` und [+] entfallen.

**EK-05 – Feedback ist ein Parameter je Operator.**
- Daten: `fb = {src, amt}`; die Quelle ist jeder Operator, auch er selbst (H S. 13).
- Anzeige: Ziffer der Quelle oben rechts an der Kachel (H S. 13).
- Bedienung: Streifen „Feedback“ im Reiter BASIS.
- Die EssenceFM-Grenze „nur OP 1 und OP 2“ fällt. Feedback auf jedem Operator ist der meistgenannte Nutzerwunsch (Forum, WAHRSCHEINLICH, R7-H §2.14 / F849) und steht schon in N4a-01.
- Der Anfasser ● entfällt.

**EK-06 – Feld links, Wertefeld rechts, zwei Zustände (ersetzt Kontextzeile und Vorhersage-Zeile aus §9.4).** Die Spalte mit 6 Streifen im Wertefeld übernimmt die Rolle der 6 farbigen Drehknöpfe rechts neben dem EssenceFM-Bildschirm (H S. 6, 11, 18): ohne Wahl = alle OP-Pegel, mit Wahl = die Werte des gewählten Operators.

**EK-07 – Hüllkurven bleiben DX-Art (A.4b).** Das Hüllkurven-Modell bleibt R1–R4/L1–L4 mit Haltephase, wie A.4b es für Xanders Runde 9 („snappy FM-Bässe wie DX7/FM-X“) festlegt. Die Bedienung folgt dem EssenceFM-Prinzip: Punkte ziehen, logarithmische Zeitachse, Gesamtlänge (H S. 32). Die EssenceFM-Mehrpunkt-Hüllkurven (6 Punkte, Loop) bleiben in §18 (wie A.4b Punkt 11).

**EK-08 – 12 feste Wellen je Operator (6.2).** Vorbild sind die 12 EssenceFM-Werkswellen (H-Bild S. 61). Formeln und Namen sind eigene. Eigene Wellen zeichnen kommt mit dem Tabellen-Oszillator (V8a) bzw. F6 (§18).

**EK-09 – Ergänzungen, die bleiben** (sie widersprechen EssenceFM nicht): Vorschau beim Ziehen (Geist, LCD, Vorhersage), ein Undo je Geste, [A│B], Linie antippen (Tiefe/Lösen), Mod-Picker beim Halten, Ausgangslinie, Verhältnis-Raster, Feedback auf jedem Operator, Live-Pegel als Leuchten.

**EK-10 – DX-Modus und Nummern.**
- Die Operatoren heißen im FELD 1–6 (wie EssenceFM und DX), nicht A–H.
- Die Unterseiten bleiben FELD · DX · OP n · MAKRO · STIMME (N4b-01). DX ist der klassische Modus (WP7-ALGO + V0d).
- OP n bleibt die große Einzelansicht und bearbeitet dieselben Werte wie das Wertefeld.

---

## 4 Bildschirm (V4b)

### 4.1 Maße je Größe

Grundlage sind die **in V0a gemessenen** Größen der FM-Seite (`geo.out`): P1 374×367, P2 359×245, P3 304×217, L1 828×152, L2 651×137, W 828×703 px. Sie sind größer als die Schätzung „Körper ≈ 305 / 140 px“ in Spec §0.4. Treffer = Trefferfläche; zwischen Trefferflächen liegen ≥ 4 px (L4, dichtes Raster).

| Größe | Feld | Wertefeld | Spalte · Kachel sichtbar · Treffer | volle Größe bis Tiefe | tiefer |
|---|---|---|---|---|---|
| **P1** 390×844 | 240×324 links (64 %) | 126×324 rechts (34 %) | 40 px · 36×40 · 36×44 (Reihe 53 px) | 6 | – |
| **P2** 375×667 | 348×206 | Schublade 213×206 von rechts | 58 · 50×33 · 54×37 (Reihe 41 px) | 5 | gestaucht oder ⤢ |
| **P3** 320×568 | 300×180 | Schublade 180×180 | 50 · 44×36 · 46×41 (Reihe 45 px) | 4 | gestaucht oder ⤢ |
| **L1** 844×390 | 360×152 links (44 %) | 460×152 rechts (56 %) | 60 · 52×30 · 56×34 (Reihe 38 px) | 4 (alle 32 DX) | gestaucht oder ⤢ |
| **L2** 667×375 | 282×137 links | 363×137 rechts | 47 · 40×30 · 43×34 (Reihe 38 px) | 3 | DX-Alg. 1, 2, 18 gestaucht oder ⤢ |
| **W** 844×1180 | 360×703 | 460×703 | 60 · 52×40 · 56×44 (Reihe 60 px) | 6 | – |

- Das Reihenraster ist je Größe fest, wie die feste Kachelgröße bei EssenceFM. Der Algorithmus steht unten; darüber bleibt freier Raum.

- **P1-Kopf** 36 px über beiden Teilen. Darunter Feld und Wertefeld je 324 px hoch (367 − 2×2 Rand − 36 − 3).
- **L1/L2** haben keinen Kopf über dem Feld; Kopfknöpfe stehen in der Kopfzeile des Wertefelds (28 bzw. 26 px).
- **„Gestaucht“:** Das Reihenraster schrumpft auf Feldhöhe/Tiefe (kleinster Fall L2 mit Tiefe 6: 137/6 = 22,8 px), die Kachel auf Raster − 4 px (≥ 18 px). Die Kachel bleibt bedienbar, unterschreitet aber L4. Das LCD zeigt „⤢ für volle Größe“. Das ist eine dokumentierte Ausnahme wie P3 (§0.4).
- **⤢ Feld groß:** blendet Spielleiste und Tastatur aus (P +156 bis +222 px, L +110 px). Danach haben alle Größen volle Kachelgröße bis Tiefe 6. ▶ (Vorhören) bleibt wie die EssenceFM-Taste ♪ (H S. 8). Laufzeit-Zustand, nicht gespeichert.

**Begründung gegen EssenceFM:**
1. **Seitenverhältnis:** Das EssenceFM-Feld ist ein 6×6-Raster mit B/H 0,81. Das P1-Feld ist ebenfalls 6×6 mit B/H 0,74. Die Ausgänge stehen in einer Reihe, der Algorithmus wächst nach oben.
2. **Warum nicht 62/38:** 62 % von 374 px sind 232 px. Das ergibt 38,6 px je Spalte und Kacheln von 34,6 px Breite, unter den 36 px aus L4. Eine Reihe aus 6 Ausgängen (Alg. 32, „Additiv/Orgel“) passte dann nicht mehr in eine Reihe. 64/34 ist der kleinste Feld-Anteil, der die volle 6er-Reihe in Touch-Größe hält.
3. **Schmales Wertefeld:** Bei EssenceFM hat das Panel 56 %, bei uns in P1 34 %. Das wird ausgeglichen:
   - Das Wertefeld zeigt höchstens 6 Werte untereinander, wie die 6 Knöpfe in einer Säule (H S. 6).
   - Breite Inhalte (Hüllkurven, Raster, Wellenbilder) öffnen „breit“ über das Feld (4.6).
4. **Streifen „an den Operatoren ausgerichtet“:** Das wird über **Farbe und Reihenfolge** gelöst, nicht geometrisch. Mehrere Operatoren teilen sich eine Reihe, eine Höhenausrichtung je Operator ist deshalb unmöglich. EssenceFM löst es genauso: Knopf n und OP n haben dieselbe Farbe (H S. 18).
5. **Querformat L1:** Die EssenceFM-Teilung 44/56 lässt sich direkt übernehmen.

### 4.2 Mockups

```
P1 390×844 · FM › FELD · nichts gewählt (Zustand ALLE OP)        Seite 374×367 (V0a gemessen)
┌──────────────────────────────────────┬─────────────────────┐
│[Vorlagen ▾] [DX 5 ✓] [A│B] [⤢]       │[ALLE OP] [MAKRO]    │ 36  Kopf: links über Feld, rechts über Wertefeld
├────────────── FELD 240×324 ──────────┼─ WERTEFELD 126×324 ─┤
│                                      │ 1  ×1,00   Sinus    │ 52  Streifen OP 1 (rot)
│   leer: Platz für Ketten bis 6 Reihen │ ████████████  0 dB │     waagrecht ziehen = Pegel
│   (Algorithmus wächst nach oben,     │ 2  ×14     Sinus    │ 52  Streifen OP 2 (weiß)
│    wie bei EssenceFM)                 │ ███▌─────── I 0,4  │
│                                      │ 3  ×1,00   Sinus    │ 52  OP 3 (grün)
│ ┌──┐     ┌──┐     ┌──┐               │ ████████▌── −3 dB  │
│ ▌2 │     ▌4 │     ▌6 │⁶  Reihe 2     │ 4  ×1,00   Sinus    │ 52  OP 4 (schiefer)
│ │14│     │×1│     │×1│   Modulatoren │ ██████▌──── I 1,4  │
│ └┬─┘     └┬─┘     └┬─┘               │ 5  ×1,00   Sinus    │ 52  OP 5 (blau)
│ ┌┴─┐     ┌┴─┐     ┌┴─┐               │ █████████▌─ −2 dB  │
│ ▌1 │     ▌3 │     ▌5 │   Reihe 1     │ 6  ×1,00   Sinus ←6 │ 52  OP 6 (violett), FB-Quelle 6
│ │×1│     │×1│     │×1│   Ausgänge    │ ███▌─────── I 0,2  │
│ └┬─┘     └┬─┘     └┬─┘               │                     │
│ ═┴════════┴════════┴═══ AUSGANG     │                     │
└──────────────────────────────────────┴─────────────────────┘
Beispiel DX-Alg. 5 (E-Piano). ▌ = Lautstärke-Balken links an der Kachel (Höhe = Pegel, OP-Farbe)
⁶ = Feedback-Quelle im Kästchen oben rechts · Kachel 36×40, Raster 40×53 · Spalten 0–2 belegt (5.3)
```

```
P1 · Kachel OP 2 angetippt (Zustand OP 2, Reiter BASIS)
┌──────────────────────────────────────┬─────────────────────┐
│[Vorlagen ▾] [DX 5 ✓] [A│B] [⤢]       │ [M]    [S]    [⋯]  │ 36  [M] stumm · [S] Solo · [⋯] Kopieren …
├──────── FELD (andere Kacheln grau) ──┼─ OP 2 · Mod. → 1 ───┤ 14  Rollenzeile
│                                      │[BASIS ] [HÜLLK.]    │ 34  Reiter 2×2 (je 61×32)
│                                      │[MOD   ] [TONH. ]    │ 34
│                                      │Welle       [fest]   │ 36  1 Welle (Bild + Name), Chip Phase
│ ┏━━┓     ┌──┐     ┌──┐               │ ∿ Sinus              │
│ ┃2 ┃     │4 │     │6 │⁶              │Pegel        OL 83   │ 36  2 Pegel (Modulator: I, V0d-Kurve)
│ ┗┯━┛     └┬─┘     └┬─┘               │ ███████▌──  I 3,1   │
│ ┌┴─┐◂    ┌┴─┐     ┌┴─┐               │Verh. [×│Hz] [▦]     │ 36  3 Grob (Chip fest/Verhältnis, Raster)
│ │1 │     │3 │     │5 │               │ █████▌─────  ×14    │
│ └┬─┘     └┬─┘     └┬─┘               │Fein                  │ 36  4 Fein
│ ═┴════════┴════════┴═══ AUSGANG     │ ▌──────────  ×1,00  │
│                                      │Verstimmung           │ 36  5 Verstimmung (bipolar)
│                                      │ ─────┃─────  0       │
│                                      │Feedback     [←2]     │ 36  6 Feedback-Menge, Chip Quelle
│                                      │ ▌──────────  0,0     │
└──────────────────────────────────────┴─────────────────────┘
┏┓ = gewählt (gefüllt in OP-Farbe + 2 px weiße Umrandung) · ◂ = Ziel(e) des gewählten OP leicht hervorgehoben
```

```
P1 · OP 2 · Reiter HÜLLK. → „breit“ (A.4b-Editor in voller Breite, Seite 374×367)
┌──────────────────────────────────────────────────────────────┐
│[⟵ Feld] OP 2 · Mod. → 1   [BASIS][HÜLLK.][MOD][TONH.] [M][S] │ 36
│ [1 ⌒][2 ⌒][3 ⌒][4 ⌒][5 ⌒][6 ⌒]  Chips 52×44 in OP-Farbe      │ 44  wie A.4b HÜLLK. › OPERATOREN
│ [Snap] [Pluck] [Pad] [Orgel]                          [FEIN] │ 36
│ ,5 1ms  10   100   1s   10s ┊ 1ms 10 100 1s                  │ 12  log. Zeit (A.4b 4a)
│  Graph 358 px (Halten ┊ Release)                            │ 90
│ A 0,5 ms · D1 43 ms · D2 124 ms · R 327 ms · gesamt 494 ms   │ 16  + „gesamt“ (H S. 32 „Total length“)
│ R1 │ R2 │ R3 │ R4 │ L1 │ L2 │ L3 │ L4                         │ 36  DX-Zeile (A.4b 4h)
│ [‹] [›]  [Auf alle Mod.] [Auf alle]  [⋯]                      │ 44
└──────────────────────────────────────────────────────────────┘ Summe 314 + Abstände ≤ 363
```

```
L1 844×390 · FM › FELD · nichts gewählt                                   Seite 828×152
┌─────────── FELD 360×152 ────────────┬────────────────── WERTEFELD 460×152 ───────────────────┐
│                                      │[Vorlagen ▾][DX 5 ✓][A│B][⤢]          [ALLE OP][MAKRO] │ 28
│ ┌──────┐   ┌──────┐   ┌──────┐⁶      │ 1 ×1,00 ∿ █████████ 0 dB  ⌒│ 4 ×1,00 ∿ █████▌── I 1,4 ⌒ │ 38
│ ▌  2   │   ▌  4   │   ▌  6   │       │ 2 ×14   ∿ ███▌───── I 0,4 ⌒│ 5 ×1,00 ∿ ████████ −2 dB ⌒ │ 38
│ └──┬───┘   └──┬───┘   └──┬───┘       │ 3 ×1,00 ∿ ████████▌ −3 dB ⌒│ 6 ×1,00 ∿ ██▌───── I 0,2 ⌒ │ 38
│ ┌──┴───┐   ┌──┴───┐   ┌──┴───┐       │                                                         │
│ ▌  1   │   ▌  3   │   ▌  5   │       │  2 Spalten × 3 Streifen à 228×38                        │
│ └──┬───┘   └──┬───┘   └──┬───┘       │                                                         │
│ ═══╧══════════╧══════════╧═ AUSGANG  │                                                         │
└──────────────────────────────────────┴─────────────────────────────────────────────────────────┘
Kacheln 52×30 (Treffer 56×34), Raster 60×38: 4 Reihen = 152 px → alle 32 DX-Algorithmen in voller Größe

L1 · Zustand OP 2, Reiter BASIS (Kopfzeile 28 + 3 Reihen à 38)
│ (Feld grau, OP 2 gefüllt)            │ 2 [BASIS][HÜLLK.][MOD][TONH.] [M][S][A│B][⋯]            │ 28
│                                      │ Welle ∿ Sinus     [fest] │ Fein         ▌───── ×1,00    │ 38
│                                      │ Pegel ███████▌─── I 3,1  │ Verstimmung ───┃─── 0        │ 38
│                                      │ Verh. [×│Hz][▦] ████ ×14 │ Feedback [←2] ▌──── 0,0      │ 38
Die Rolle („Modulator → 1“) steht im LCD, sobald OP 2 gewählt wird.
```

### 4.3 Kachel

- **Nummer** 1–6 (15 px fett, P1; L 13 px).
- **Verhältnis** klein darunter: „×14“, „×0,5“, „×1,41“ bzw. „324 Hz“ (`fmRatioTxt`). Bei EssenceFM ist das eine Option (H S. 66), bei uns immer an.
- **Lautstärke-Balken** links an der Kachel: 4 px breit, Höhe = OL/99 × Kachelhöhe, in OP-Farbe, immer sichtbar (eigene Festlegung; H S. 18 nennt den Balken nur im Base-Reiter ohne Fokus, Nachtrag 2 K2-29).
- **Feedback-Kästchen** oben rechts (12×12 px): Nummer der Quelle, orange. Es erscheint nur, wenn `fb.amt > 0` (H S. 13).
- **Live-Pegel (VORSCHLAG, Art bei EssenceFM UNBELEGT):** Das Kachel-Innere hellt mit dem aktuellen Ausgangspegel des Operators auf. Helligkeit linear über −48…0 dB, 30 Hz, Maximum über alle Stimmen der Spur. Nur im Worklet-Pfad.
- **Farben (VORSCHLAG nach den EssenceFM-Knopffarben, H-Bild S. 18/19/27):**
  - op1 `#ef4444` rot, op2 `#e5e7eb` weiß, op3 `#22c55e` grün, op4 `#94a3b8` schiefer, op5 `#3b82f6` blau.
  - op6 `#a855f7` **violett** statt schwarz, weil Schwarz auf unserem dunklen Grund unsichtbar ist.
  - Gemessener Kontrast gegen den Kachelgrund `#0b0d12`: 4,9–15,7 : 1. Kleinster Farbabstand ΔE76 27,2 (weiß/schiefer) (`layout-check.out`).
- **Zustände:**
  - ALLE: Rahmen in OP-Farbe.
  - OP n: alle anderen Rahmen grau `#5b6170` (3,1 : 1; H S. 18 „they all become gray“). Die gewählte Kachel ist in OP-Farbe gefüllt (35 %) und hat 2 px weiße Umrandung (Fokus = Umrandung, H S. 11). Die direkten Ziele des gewählten Operators bekommen einen schmalen Hervorhebungs-Rahmen.
  - Stumm: Rahmen, Text und Balken dunkelgrau (H S. 19).
- **Linien:**
  - Gerade von Unterkante-Mitte des Modulators zu Oberkante-Mitte des Ziels; schräg ist erlaubt (H-Bild S. 12/18).
  - Normal 2 px. Mit Tiefe `amt` < 1: 1 px.
  - Ist die Quelle stumm, ist die Linie grau (H-Bild S. 18: 3 → 2).
  - *(P1)* Linien-Animation, Standard aus (H S. 67).
- **Ausgangslinie:** 2 px unter der untersten Reihe, von der ersten bis zur letzten Ausgangs-Kachel, mit kurzen Stichen. Rechts steht „AUSGANG“, wenn Platz ist.

### 4.4 Wertefeld

**Zustand ALLE OP** (nichts gewählt, oder Tippen ins Leere des Felds; H S. 19). Kopf [ALLE OP │ MAKRO].

| Reiter | Inhalt | Vorbild |
|---|---|---|
| **ALLE OP** | 6 Streifen in der Reihenfolge OP 1–6, je in OP-Farbe. Jeder Streifen zeigt Nummer, Verhältnis, Wellen-Symbol, FB-Ziffer und den **Pegel-Balken (waagrecht ziehen = Pegel)**; in L zusätzlich die Mini-Hüllkurve. Ein Tipp auf die Nummer wählt den OP (→ Zustand OP n). | V7.0: ohne Fokus regeln die 6 farbigen Knöpfe alle OP-Lautstärken, Balken links am OP (H S. 18) |
| **MAKRO** | 6 Streifen: Helligkeit · BISS · Härte · Länge · Release · Transponieren (Werte und Kurven wie A.4 3b und A.4b 7) | Voice-Werte ohne Fokus (H S. 20) |

**Zustand OP n** (Kachel angetippt oder gezogen; H S. 18–19).
- Kopf: [M] [S] [⋯]. Rollenzeile „OP n · Modulator → 1 · 3“ bzw. „OP n · Ausgang“.
- Reiter: P1 2×2, L in einer Reihe.
- [⋯] enthält: Phase-Start, Verbindungen … (Liste der Ziele mit Schaltern), OP kopieren, OP einfügen, Init, Mehrfachauswahl (N4b-02), *(P1)* Zufall.

| Reiter | Streifen 1 | 2 | 3 | 4 | 5 | 6 | EssenceFM (H S.) |
|---|---|---|---|---|---|---|---|
| **BASIS** | Welle (Bild + Name; Chip Phase fest/zufall/frei) | Pegel (I bzw. dB; OL klein) | Verhältnis grob (Chips [×│Hz], [▦] Raster) | Fein | Verstimmung (bipolar) | Feedback-Menge (Chip [←n] Quelle) | Base: Waveform, Phase, Volume, Multiplier, Quartertones, Fine, FB (27–28) |
| **HÜLLK.** | „breit“: A.4b-Editor (`fmEnvEditor`) mit Operator-Reihe | | | | | | Amp (29, 31–33) |
| **MOD** | Anschlag (−7…+7) | LFO-AM (0–3) | LFO-FM (0–99) | Key→Zeit (0–7) | Tastatur-Kurve: Grafik über 2 Streifen-Höhen, Punkte links · Mitte (Breakpoint, Notenname) · rechts; Chips LIN/EXP ± | | Mod: Velocity, LFO1 AM, LFO1 FM, Key Vol Scale (30) |
| **TONH.** | „breit“: A.4b-PEG-Editor; Chips [Stimme (DX) │ nur OP n] | | | | | | Pitch (31) |

- Die Reihenfolge in BASIS folgt dem EssenceFM-Bild H S. 27: Waveform 1, Phase 2, Volume 3, Multiplier 4, Quartertones 5, Fine 6. Bei uns liegt die Phase als Chip im Wellen-Streifen. Fein und Verstimmung folgen der DX-Skala (EN-02).
- **Tastatur-Kurve:** Der linke Punkt ist `ld` mit dem Vorzeichen aus `lc`, die Mitte ist `bp` (waagrecht ziehen, Notenname wie „C4“ im EssenceFM-Bild S. 19), der rechte Punkt ist `rd`/`rc`. Die DX-Daten bleiben unverändert.
- Ist ein Operator stumm, sind seine Streifen grau mit Grund „OP 4 stumm – Doppeltipp auf die Kachel“ (L2).

### 4.5 Bearbeiten im Wertefeld

Neue `makeCtl`-Art `kind:'strip'`. Sie ersetzt die Knöpfe und Flaggen des Geräts.

| Aktion | Wirkung | EssenceFM |
|---|---|---|
| waagrecht ziehen | relativ, Schwelle 4 px; voller Bereich = 2 × Streifenbreite (P1 252 px für OL 0–99). Modulator-Pegel über die V0d-Kurve (N4b-03). | Slider waagrecht ziehen (H S. 11) |
| Fein | senkrechter Abstand zum Streifen ≥ 64 px → ×¼, ≥ 140 px → ×¹⁄₁₆; ruhender zweiter Finger auf `.rest` → ×¼. Es gilt `ctlPrecision` (V0a Z. 12505), das LCD zeigt „FEIN ×¼“. | „knobs … when precision is required“ (H S. 7) |
| Tippen | Fokus (Umrandung). An den Enden erscheinen [‹] [›] (36×36) für ±1 Schritt. | Fokus + Inc/Dec (H S. 7, 11) |
| Doppeltipp | Standardwert; bipolare Streifen (Verstimmung, Anschlag) auf die Mitte | „centered … by double-tapping“ (H S. 11) |
| Halten 450 ms ohne Bewegung | Mod-Picker (z. B. `op2`) | – (unsere Regel L4) |
| Chips | Ein Tipp schaltet bzw. öffnet die Auswahl (Phase, ×/Hz, Quelle, ▦, Welle) | Radio/Buttons (H S. 11) |

- Während des Ziehens zeigt das LCD z. B. „OP 2 · Pegel · I 3,1 · OL 83“.
- Wird Streifen k berührt, leuchtet Kachel k kurz auf (`.hl`); wird Kachel k gewählt, bekommt Streifen k einen Rahmen. So bleibt die Beziehung Wert ↔ Operator sichtbar.
- Jede Geste ist genau ein Undo-Schritt.
- Die Hintergründe des Wertefelds sind `.rest`; der Feld-Leerraum bleibt **keine** Ruhefläche (§9.4, Gesten-Register `GEST`/`RESTPTR`).

### 4.6 Breit-Modus, Schublade, Feld groß

- **Breit:** HÜLLK. und TONH. öffnen in **allen** Größen über dem Feld.
  - P: A.4b-Ansicht „HÜLLK. › OPERATOREN“ (Operator-Reihe 6 × 52×44 oben, Editor 358 px breit) mit Kopf [⟵ Feld] und den 4 Reitern.
  - L1: Operator-Block 2 × 3 (44×36) links, Editor 728 px (Graph ≈ 420 + DX-Spalte 300).
  - Ein Chip wählt den Operator; der Editor bleibt auf derselben Stufe (EssenceFM: Hüllkurve fokussieren → anderen OP wählen, H S. 29).
  - [⟵ Feld], BASIS oder MOD führen zurück.
  - **Abweichung von EssenceFM aus Platzgründen:** Das Feld ist im Breit-Modus verdeckt. Die Operator-Reihe hält die Beziehung zu den Operatoren (Nummer, Farbe, Rolle).
- **Schublade (P2, P3):** Das Feld nutzt die volle Breite. Ein Tipp auf eine Kachel oder [Werte ▸] im Kopf schiebt das Wertefeld von rechts herein (P2 213 px, P3 180 px; Streifen 2 × 3). Ein Tipp auf den sichtbaren Feldteil schließt die Schublade. Ist die gewählte Kachel verdeckt, steht sie als Chip im Schubladen-Kopf.
- **⤢ Feld groß:** siehe 4.1. Der Knopf steht immer an derselben Stelle im Kopf, damit nichts verrutscht (L3).

---

## 5 Gesten (V4b)

### 5.1 Tabelle

| Geste | EssenceFM (H S. 19) | SYNQUENZER |
|---|---|---|
| Kachel tippen | Fokus; Panel zeigt den OP | gleich: Zustand OP n (Reiter wie zuletzt, Start BASIS) |
| Tippen ins Leere des Felds | Panel zeigt Voice-Werte | gleich: Zustand ALLE OP |
| Doppeltipp auf Kachel | stumm/an, dunkelgrau | gleich (Abstand ≤ 300 ms, ≤ 8 px) |
| Kachel ziehen, auf Kachel Y loslassen | verbinden | gleich; **Festlegung:** der gezogene X wird Modulator von Y und landet eine Reihe über Y |
| … Y ist schon direkt mit X verbunden (X→Y oder Y→X) | Plätze tauschen | gleich; Verbindungen folgen den Plätzen, Parameter bleiben am Operator |
| Bewegen (Zug > 8 px) | entfernt immer die unteren Verbindungen | gleich; X behält seine Modulatoren, sie ziehen mit |
| Loslassen im Leeren | fällt nach unten zum Boden oder auf den nächsten OP darunter | gleich, siehe 5.2 |
| Zwei Finger auf zwei Kacheln | verbinden (Zusatz-Verbindung) | gleich (Beginn ≤ 300 ms); obere moduliert untere, in derselben Reihe die zuerst berührte. **Ergänzung:** Schon verbundenes Paar → Verbindung lösen |
| [M] / [S] | Mute / Solo | gleich; Solo wird nicht gespeichert (wie V0a) |
| Linie antippen | – | Mini-Blatt: Tiefe `amt` 0–1 + [Lösen]. Trefferband 16 px, Kacheln haben Vorrang (Ergänzung) |
| Kachel halten 450 ms, ohne Bewegung loslassen | – | Mod-Picker `opN` (§9.4, L4) |
| Wischen im Leeren | – | nichts (V4b-08) |
| [Vorlagen ▾] | Algorithm Library | 32 Bilder (WP7-Blatt), Wahl = ein Undo |
| ↶ ↷ / [A│B] | Undo/Redo, Recall | gleich (eine Geste = ein Schritt; [A│B] = vor der letzten Geste) |

- **Fokus beim Ziehen:** Wer eine Kachel zieht, wählt sie auch (H S. 18 „press on an operator to move it or edit it“). Nach dem Loslassen zeigt das Wertefeld diesen Operator.
- **Bedienhilfe:** Beim ersten Öffnen des FELD meldet das LCD „Zwei Finger auf zwei Kacheln = Zusatz-Verbindung“ (L10). Der Weg ohne Mehrfinger ist [⋯] › Verbindungen …; er ist barrierefrei.

### 5.2 Regeln, die das Handbuch offenlässt (Festlegungen)

1. **Ziel-Erkennung:** Ziel ist die Kachel, deren Rasterzelle den Mittelpunkt des Geists enthält. Ist die Zelle leer, gilt das als Leerraum. Beim Zielwechsel kommt `haptic('tick')`.
2. **Fallen:** Spalte = Rasterspalte des Geists.
   - Liegt darunter in dieser Spalte ein Operator Z, der **kein** Vorfahre von X ist, wird X Modulator von Z (Reihe über Z).
   - Sonst fällt X auf den Boden (Reihe 0) und wird Ausgang.
   - Vorfahren von X werden übersprungen (sonst entstünde eine Schleife).
3. **Belegte Zelle:** X nimmt in seiner Reihe die freie Spalte, die der Ablage am nächsten liegt. Bei Gleichstand gewinnt rechts. Es gibt immer eine freie Spalte (6 Operatoren, 6 Spalten).
4. **Schleife:** Verbinden mit einem Vorfahren wird abgewiesen. Der Geist wird rot, das LCD meldet „Schleife – Feedback stellst du in BASIS ein“, die Daten bleiben deep-equal.
5. **Tauschen:** Die Verbindungen werden mit σ = (X Y) umbenannt: aus X→Y wird Y→X, aus X→Z wird Y→Z, aus W→Y wird W→X. Die Plätze werden getauscht. Parameter bleiben am Operator; auch `fb.src` bleibt eine Operator-Nummer.
6. **Reihen** werden aus dem Graph berechnet: Ausgänge 0, Modulator = 1 + höchste Reihe seiner Ziele. Spalten bleiben, wo sie sind (Stabilität). Kacheln gleiten 150 ms an ihren neuen Platz, ohne Sprung.
7. **Stumm verbunden:** Ein stummer Operator bleibt beim Verbinden stumm, wie bei EssenceFM. Das LCD meldet „OP 4 ist stumm – Doppeltipp zum Einschalten“.

### 5.3 Vorlagen-Raster und Init

- **Spaltenregel für Vorlagen, .syx-Importe und `fmxFromFm6`:**
  - Ausgänge stehen in Reihe 0, nach OP-Nummer in den Spalten 0, 1, 2 …
  - Modulatoren werden nach Reihe und Nummer gesetzt: über ihr erstes Ziel, sonst in die nächste freie Spalte.
  - Gerechnet für alle 32 DX-Algorithmen (`layout-check.out`): Breite ≤ 6, Tiefe ≤ 4 (Tiefe 4 nur Alg. 1, 2, 18), keine doppelt belegte Zelle, keine Linienkreuzung zwischen gleichen Reihen. 73 von 93 Ein-Ziel-Modulatoren stehen direkt über ihrem Ziel.
- **FELD-Init („Init FM“ im FELD; auf der DX-Seite bleibt das DX-Init):**
  - OP 1 ist Ausgang (an, OL 99). OP 2–6 sind stumm, OL 64, alle in Reihe 0, Spalten 0–5. Hüllkurven nach `FM_INIT_OP` mit A.4b R4 = 80.
  - Das folgt dem Handbuch-Tipp „mit einem Operator anfangen, die anderen stumm“ (H S. 14).
  - DX-tauglich als Alg. 32 mit 5 abgeschalteten Operatoren.
  - Ein Ton ist sofort hörbar; ziehen + Doppeltipp baut den Klang auf.

---

## 6 Operatoren, Wellen, Daten, Worklet (V4a)

### 6.1 `p.fmx` (ersetzt den Datenblock in §9.2)

```js
p.fmx = {                                   // neu in V4a; noch nicht gebaut → keine Migration
  v: 1,
  ops: [ /* genau 6; Index k = OP k+1 */ {
    on: 0|1,                                // 0 = stumm (Doppeltipp, [M]); wie fm6
    fixed, coarse, fine, det, ol, r: [4], l: [4], rs, ks: {bp, ld, rd, lc, rc},   // DX-Felder wie fm6 (EN-02)
    vs: -7..7,                              // Anschlag; DX-tauglich nur 0..7 (A.4b Punkt 11)
    col: 0..5,                              // Spalte im Feld; die Reihe wird berechnet (5.2)
    wave: 0..11,                            // 6.2; 0 = Sinus (DX)
    ph: 'fest'|'zufall'|'frei', ph0: 0..127,// Phase wie EssenceFM (H S. 28); DX: Key-Sync an = fest/0, aus = frei
    fb: {src: 1..6, amt: 0..7} | null,      // Feedback je OP (EK-05); amt in 0,1-Schritten (N4a-01)
    ams: 0..3,                              // LFO-AM (DX-AMS je OP, A.4b Punkt 11)
    lfoFm: 0..99,                           // LFO-FM je OP (H S. 30); nicht DX
    peg: {r: [4], l: [4]} | null            // eigene Tonhöhen-Hüllkurve (H S. 31); null = Stimmen-PEG fm6.peg (A.4b)
    // (P1) FM-X-Extras aus A.4b Punkt 11: hold 0..99 (Key-On-Verzögerung), rsBi -7..7 (Time/Key ±)
  } ],
  edges: [{from: 1..6, to: 1..6, amt: 0..1}]   // nur Modulation nach unten; Feedback steht in ops[].fb
}
// abgeleitet, nicht gespeichert: Reihe je OP; Ausgänge = OPs, die in keiner Kante als `from` vorkommen (EK-03)
```

- **Entfällt gegenüber §9.2:** `id:'A'…'H'`, `out`, `park`, `groups`, `layout` (wird zu `col`), `fbAmt` (wird zu `fb.amt`).
- `setFmx` prüft: genau 6 Operatoren, keine Schleife in `edges`, kein `from = to`, jede Zelle (Spalte, Reihe) höchstens einmal. Sonst wirft es, und die Daten bleiben unverändert.
- **Quelle der Wahrheit:** Sobald `fmx` existiert, ist es die Quelle. FELD, Wertefeld, OP n und DX-Seite schreiben über eine Funktion `fmxSetOp`/`fmxSetGraph`. Diese führt `p.fm6` mit, solange der Klang DX-tauglich ist (§9.2-Regel bleibt).
- **Mod-Ziele:** `op1…op6` bleiben (WP7). Der Alias `opA…opH` entfällt.

### 6.2 Wellen (EK-08)

Eigene Formeln (VORSCHLAG). Vorbild ist der jeweilige Platz in der EssenceFM-Werksliste (H-Bild S. 61). Deren genaue Formen sind außer Sine und SSine **UNBELEGT**. Alle Tabellen sind bandbegrenzt, mit einer Stufe je Oktave (Mipmap), normiert auf Spitze 1 und gleichanteilfrei.

| # | Name (UI) | Formel / Teiltöne (eigene Definition) | EssenceFM-Platz | Prüfmerkmal (N7F-04) |
|---|---|---|---|---|
| 0 | Sinus | sin 2πx | 0 Sine | DX-gleich |
| 1 | Säge | Σ sin(2πnx)/n | 1 Saw1 | H2 −6,0 dB |
| 2 | Säge weich | Σ sin(2πnx)/n² | 2 Saw2 | H2 −12,0 dB |
| 3 | Dreieck | ungerade n, (−1)^((n−1)/2)/n² | 3 Triangle | H3 −19,1 dB, H2 ≤ −40 dB |
| 4 | Rechteck | ungerade n, 1/n | 4 Square | H3 −9,5 dB, H2 ≤ −40 dB |
| 5 | Halbsinus | max(sin 2πx, 0), Gleichanteil entfernt | 5 HSine („bowed strings“, H S. 14) | H2 −7,4 dB, H3 ≤ −40 dB |
| 6 | Puls 25 % | Puls mit Tastverhältnis ¼ | 6 Pulse | H4 ≤ −40 dB |
| 7 | Oberton 2 | sin 2πx + ½ sin 4πx | 7 Harm1 | H2 −6,0 dB |
| 8 | Oberton 3 | sin 2πx + ½ sin 6πx | 8 Harm2 | H3 −6,0 dB, H2 ≤ −40 dB |
| 9 | Sinus weich | sin 2πx · sin πx (flacher Anfang und flaches Ende) | 9 SSine (Form nach H-Bild S. 27/62: Spitze bei ≈ 30 % der Periode) | Spitze bei 30,4 ± 1 %, H2 −10,9 dB |
| 10 | Sinus weich 2 | sin 2πx · sin⁴ πx = 5⁄16 sin 2πx − ¼ sin 4πx + 1⁄16 sin 6πx | 10 SSine2 | H2 −1,9 dB, H3 −14,0 dB, Spitze bei 36,6 ± 1 % |
| 11 | Rauschen | feste Rausch-Tabelle (Startwert fest), bandbegrenzt | 11 Noise | kein Teilton > 10 dB über dem Median |

- Im Wertefeld zeigen Bild und Name die Welle. Waagrecht ziehen blättert durch die Liste (wie der EssenceFM-Slider „Waveform“, H-Bild S. 27). Ein Tipp auf das Bild öffnet ein Blatt mit 12 Bildern (V4c).
- Hilfe-Satz nach H S. 14: „Erst Sinus. Andere Wellen werden bei hohen Tönen und viel Modulation schnell rau.“
- Eigene, gezeichnete Wellen (EssenceFM: 48, global) kommen mit V8a bzw. F6 (§18). Die Nummern 12–47 bleiben dafür frei.
- Welle als Mod-Ziel (EssenceFM-Matrix „wavetable-like“, H S. 26): *(P1)* in V5d als stufiges Ziel.

### 6.3 DX-tauglich (ersetzt die Definition in §9.2)

DX-tauglich ist ein Klang, wenn:
- die Kanten ein DX-Algorithmus sind (`dxMatch`, 720 Nummerierungen);
- alle `wave = 0` sind;
- alle Operatoren denselben Phase-Modus haben (alle `fest` mit `ph0 = 0` oder alle `frei`);
- höchstens ein Operator `fb.amt > 0` hat, `amt` ganzzahlig ist und Quelle/Ziel dem DX-Algorithmus entsprechen (Selbst-Feedback bzw. Alg. 4/6 Kreuz-Schleife);
- alle `amt = 1` sind;
- kein `peg` je Operator gesetzt ist;
- alle `lfoFm = 0` und alle `vs ≥ 0` sind;
- *(P1)* `hold = 0` und `rsBi ≥ 0` gilt.

Das Badge nennt den **ersten** Grund („kein DX: Welle OP 3“). [DX-tauglich machen] behebt alle Gründe in einem Undo.

### 6.4 Worklet (ergänzt §9.3)

- **Reihenfolge:** topologisch über `edges`; Ausgänge = abgeleitete Ausgänge × `0,5/√nOut` (wie WP7).
- **Stimmen:** `min(poly, 8)`. Die 48-Budget-Regel und die Kantenregel entfallen (EK-01, 6.5).
- **Feedback:** Selbst-Feedback wie DX (2-Sample-Mittel, `2^(amt−8)`, msfa). Quelle ≠ Operator selbst: Ausgang der Quelle aus dem vorigen Sample (1 Sample Verzögerung, wie §9.3 Kreuz-Feedback). `amt` stetig (N4a-01).
- **Wellen:** Tabelle je Welle; die Mipmap-Stufe wird je Stimme beim Anschlag aus der Operatorfrequenz gewählt. Aufbau beim ersten Gebrauch (lazy).
- **Phase:** beim Anschlag `fest` → `ph0/128` Periode; `zufall` → Zufall je Anschlag; `frei` → keine Rücksetzung.
- **Tonhöhe je OP:** `peg` je Operator mit derselben Rechnung wie die A.4b-PEG (`pitchenv`-Tabellen). Gesetzt ersetzt es für diesen Operator die Stimmen-PEG. Feste Frequenz bleibt ohne PEG.
- **LFO:** `ams` wie DX (Pegel), `lfoFm` = Tonhöhe des Operators aus LFO1 (Tiefe 99 = ±1 HT, Vorschlag).
- **Anschlag ±:** negative `vs` heben leise Anschläge an (FM-X-Logik, A.4b Punkt 11).
- **Live-Pegel `opLv`:** 6 Werte (0–1, Maximum über die Stimmen der Spur aus Hüllkurve × Pegel des Operators). Sie hängen an der vorhandenen 30-Hz-Scope-Nachricht (V0a Z. 3393, nur bei `scopeOn`). Im nativen Pfad gibt es keine Werte.
- **Bleibt:** Stimmen-Überblendung 30 ms (L3), nativer Rückfall `DXN` mit nächstem DX-Algorithmus, ECO mit echter PM (A.4b Punkt 11 → V4a), alle Hüllkurven-Regeln aus A.4b (Haltephase, PEG).

### 6.5 CPU (gemessen, `cpu6.out`)

Chromium-AudioWorklet, OfflineAudioContext 48 kHz, 10 s, bester von 5 Läufen, 8 Stimmen. Kerne aus `r2/c6c9/kernels.js`: nur Rechenkerne, das ist eine Untergrenze. Xeon-VM.

| Fall | Last je Spur | Verhältnis zum DX-Fall |
|---|---|---|
| 6 OP, DX-artig (6 Kanten) | 5,50 % | 1,00 |
| **6 OP, Maximum nach EssenceFM-Regeln: 15 Kanten nach unten + 6 Feedback = 21** | **6,55 %** | **1,19** |
| 6 OP, 21 Kanten, alle mit 1 Sample (Matrix) | 5,25 % | 0,95 |
| 6 OP, volle Matrix (36 Kanten) | 6,23 % | 1,13 |
| 8 OP, volle Matrix (64 Kanten), zum Vergleich | 9,10 % | 1,65 |

- Frühere Läufe derselben Kerne lagen absolut bis ×1,5 höher (`r2/c6c9/cpu-bench*.out`); die Verhältnisse sind stabiler.
- Auf die App-Werte aus §9.3 (FM6 0,86–1,31 % je Stimme) umgerechnet: schlechtester Fall ≈ 8,2–12,5 % je Spur.
- Abnahme N7F-09 mit Ausweichregel. iPhone ungemessen (Faktor 2–2,5 unbelegt, §15.1).

---

## 7 Vorhersage, Raster, DX-Brücke (V4c, ändert §9.5 und §9.6)

- **Vorhersage im Wertefeld:** Während des Ziehens zeigt das Wertefeld das angekündigte Ergebnis.
  - Kopfzeile: „2 → 1 verbinden“, „2 ⇄ 1 tauschen“, „2 fällt auf 4“, „2 wird Ausgang“ oder „Schleife – nicht möglich“.
  - Darunter 1 Periode, 16 Spektralbalken und das Etikett.
  - Nach dem Loslassen zeigt es wieder den Zustand davor bzw. den gezogenen Operator.
  - Im Ruhezustand steht das Etikett nur im LCD, wenn sich die Struktur ändert.
  - Das ▶-Vorhören beim Ziehen entfällt; dafür gibt es [A│B] nach dem Loslassen.
- **Raster:** wird über [▦] im Verhältnis-Streifen geöffnet, sonst unverändert (§9.5).
- **Index-Anzeige:** Der Ring entfällt. Index bzw. dB stehen im Pegel-Streifen und als Balken an der Kachel.
- **Wellen-Blatt:** 12 Bilder mit Namen; Wahl = ein Undo.
- **DX-Brücke** (§9.6) bleibt:
  - Import → FELD-Spalten nach 5.3.
  - Export überspringt nicht taugliche Sounds und nennt den Grund aus 6.3.
  - Der PEG-Rundlauf kommt aus A.4b.

---

## 8 Abnahme N7F-01 … N7F-30

Diese Punkte gelten **zusätzlich** zu den verbleibenden Punkten von V4a–V4c (Ersetzungen in 9.2). Messverfahren nach §0.3 und N0.4. CDP-Touch wie `r6/ui-lib.mjs`.

**V4a – Klangmotor**
- [ ] **N7F-01 Sechs feste Operatoren:**
  - `setFmx` mit 5 oder 7 Operatoren, mit einer Schleife in `edges`, mit `from = to` oder mit einer doppelt belegten Zelle wirft. Die Daten bleiben deep-equal.
  - Ein Graph mit 15 Kanten und 6 Feedbacks, 8 gehaltene Tasten → 8 Stimmen aktiv (`engineInfo`).
- [ ] **N7F-02 Ausgänge abgeleitet:** `fmxFromAlg(n)` für n = 1…32: Ausgänge = DX-Träger (32/32). Spalten nach 5.3: Breite ≤ 6, Tiefe ≤ 4, keine Zelle doppelt (wie `layout-check.out`).
- [ ] **N7F-03 DX-Gleichheit bleibt:** V4a-01 und V4a-02 unverändert, also `wave 0`, `ph fest/0` und Feedback am DX-Ort ergeben RMS-Differenz zu `fm6` ≤ −50 dB. Sounds ohne `fmx` rendern bitgleich.
- [ ] **N7F-04 Wellen:**
  - (a) Jede Tabelle (Stufe 0) = Formel aus 6.2 ±1·10⁻⁴ nach Normierung.
  - (b) Ausgang ohne Modulation, C3, Fenster 0,2–1,2 s, FFT 16384: Prüfmerkmale aus 6.2 ±0,5 dB.
  - (c) Aliasing: Säge, Rechteck und Puls bei C7 ohne Modulation: jede Linie, die nicht auf einem Vielfachen von f0 liegt, ≤ −50 dB unter H1.
  - (d) Aufbau aller 12 Tabellen ≤ 50 ms (Xeon), Speicher ≤ 1 MB.
- [ ] **N7F-05 Phase:**
  - (a) `fest`/0: Zwei Anschläge derselben Note sind in den ersten 10 ms bitgleich (LFO aus). `ph0` 64 verschiebt den ersten Nulldurchgang um eine halbe Periode ±1 Sample.
  - (b) `zufall`: 32 Anschläge ergeben ≥ 30 verschiedene Startphasen.
  - (c) `frei`: Die Phase läuft über die Pause durch (Startphase = Endphase + Pause × f ±1 %).
  - (d) Ein .syx-Import mit Key-Sync aus ergibt `frei` für alle Operatoren.
- [ ] **N7F-06 Feedback je Operator:**
  - (a) Selbst-Feedback an OP 3 (Ausgang, C3): `amt` 0 → 7 hebt M-SP um ≥ ⅓ Okt.; über 0, 1,75, 3,5, 5,25, 7 gibt es keinen Rückgang > 0,05 Okt.
  - (b) Kette 3 → 2 → 1 mit `fb` an OP 3 aus Quelle 1 (`amt` 5, Handbuch-Beispiel H S. 13): 60 000 Zufallsblöcke ohne NaN; Spitze ≤ 0 dBFS bei Klang-Pegel 0,35.
  - (c) `amt` 4,5 liegt im M-SP zwischen 4 und 5 (N4a-01).
- [ ] **N7F-07 Tonhöhe, LFO, Anschlag je Operator:**
  - (a) `peg` [Fall] nur an OP 2 (Modulator): Die TONHÖHENSPUR eines Sinus-Ausgangs OP 1 bleibt ±0,02 HT. OP 2 im Solo folgt [Fall] ±0,15 HT.
  - (b) `lfoFm` 99 an OP 1, LFO1 5 Hz: Tonhöhe schwankt ≥ ±0,5 HT, nur bei OP 1.
  - (c) `ams` 3: Pegel schwankt ≥ 6 dB Spitze-Spitze.
  - (d) `vs` −7: Anschlag 0,3 ist um ≥ 3 dB lauter als 1,0 (M-PEGEL).
- [ ] **N7F-08 Live-Pegel:**
  - Bei offenem FELD kommen `opLv` mit 30 ± 3 Hz.
  - Gehaltene Note, Modulator OP 2 mit L 99 0 0 0: Der gemeldete Wert folgt dem msfa-Hüllkurvenprotokoll ±3 dB oberhalb −40 dB.
  - Worklet-Last steigt um ≤ 0,1 % (Xeon, 8 Stimmen).
  - Nativ liefert `fmOpLevels` null.
- [ ] **N7F-09 CPU, schlechtester Fall:**
  - Aufbau: 6 OP, 15 Kanten + 6 Feedback (davon 2 mit fremder Quelle), alle Wellen ≠ 0, 8 Stimmen.
  - Grenzen: ≤ 12 % je Spur (Xeon, Median aus 3 Läufen) **und** ≤ 1,35 × DX-Alg.-1-Fall im selben Lauf (Kern-Messung 1,19 ×).
  - Wird 12 % verfehlt: Regel „> 15 Kanten → 6 Stimmen“ mit Grund im Kopf; CHANGES nennt den Messwert.
- [ ] **N7F-10 DX-tauglich:** Je ein Gegenbeispiel pro Regel aus 6.3 ergibt das Badge „kein DX: <genau dieser Grund>“. [DX-tauglich machen] behebt alle Gründe in einem Undo, danach steht „DX n ✓“.

**V4b – Feld und Wertefeld**
- [ ] **N7F-11 Aufteilung:**
  - P1, L1, L2 und W: Feld links, Wertefeld rechts, Maße nach 4.1 ±2 px (`fieldUi()`), keine Überlappung.
  - M-PLATZ in P1–P3, L1, L2 und W. Der Körper scrollt nicht.
  - P2/P3: Schublade nach 4.6.
- [ ] **N7F-12 Kacheln und Raster:**
  - Trefferflächen nach 4.1 mit ≥ 4 px Abstand.
  - Für alle 32 Vorlagen (Screenshots P1 und L1) liegt jede Kachel im Feld. Die unterste Reihe sind genau die Ausgänge; die Ausgangslinie reicht von der ersten bis zur letzten Ausgangs-Kachel.
- [ ] **N7F-13 Kachel-Inhalt:**
  - Nummer 1–6; Text = `fmRatioTxt`.
  - Balken-Höhe = OL/99 × Kachelhöhe ±2 px.
  - FB-Kästchen genau dann, wenn `fb.amt > 0`, mit Quellnummer (`data-fbsrc`).
  - Stumm: Rahmen und Text mit RGB-Abstand ≥ 60 zur OP-Farbe.
  - Gewählt: gefüllt + 2 px weiße Umrandung; im Zustand OP n alle anderen Rahmen in Grau.
- [ ] **N7F-14 Farben:**
  - 6 OP-Farben: Kontrast ≥ 3 : 1 gegen den Kachelgrund, paarweise ΔE76 ≥ 20 (Vorschlag: 4,9–15,7 : 1, ΔE ≥ 27,2).
  - Streifen-Flagge k und Kachel-Rahmen k haben dieselbe berechnete Farbe.
- [ ] **N7F-15 Zustand ALLE OP:**
  - Ohne Wahl gibt es 6 Streifen in der Reihenfolge OP 1–6.
  - Ein waagrechter Zug auf dem Streifen von OP n ändert nur `ops[n−1].ol` (Modulator über die V0d-Kurve, Ausgang linear). Der Balken an Kachel n folgt im selben Bild.
  - Berührt man den Streifen von OP n, bekommt Kachel n `.hl`, und umgekehrt.
  - Reiter MAKRO: 6 Streifen mit denselben Werten wie die Unterseite MAKRO.
- [ ] **N7F-16 Zustand OP n:**
  - Ein Tipp auf Kachel k öffnet OP k mit dem zuletzt benutzten Reiter (Start BASIS). Die Rollenzeile entspricht `fmRole`.
  - Ein Tipp ins Leere des Felds führt zu ALLE OP (H S. 19). Wischen im Leeren ändert nichts.
- [ ] **N7F-17 Reiter und Streifen:**
  - BASIS und MOD zeigen die Streifen aus 4.4 in dieser Reihenfolge. Jeder Streifen ändert genau ein Feld (deep-diff von `getFmx`).
  - [M] wirkt wie der Doppeltipp. [S] wird nicht gespeichert.
  - [⋯] › OP kopieren → auf anderem OP einfügen: alle Parameter außer `col` gleich, Kanten unverändert, ein Undo.
- [ ] **N7F-18 Bearbeiten** (CDP-Touch, P1, Pegel-Streifen eines **Ausgangs**, OL linear, Start OL 50):
  - 60 px waagrecht → ΔOL 21–26 (voller Weg 252 px = OL 0–99).
  - Derselbe Zug mit ≥ 64 px senkrechtem Abstand → ΔOL 5–7; mit ≥ 140 px → ΔOL ≤ 2.
  - Ruhender zweiter Finger auf `.rest` → ΔOL 5–7.
  - Tippen → Fokus, ‹ › genau ±1. Doppeltipp → Standard.
  - Halten 450 ms → Mod-Picker des Operators (z. B. `op1`).
  - Modulator: derselbe Zug ändert den Weg p um 0,22–0,26; OL folgt `round(99 · p^0,45)` (V0d-07, N4b-03).
  - Jede Geste ist ein Undo.
- [ ] **N7F-19 Gesten wie EssenceFM** (CDP-Touch, P1 und L1):
  - (a) X auf unverbundenes Y → Kante X→Y, X eine Reihe über Y.
  - (b) X auf verbundenes Y → Plätze getauscht, Kanten nach 5.2 Punkt 5; die Parameter von X und Y (außer `col`) sind deep-equal zu vorher.
  - (c) X mit Kanten X→A, X→B und M→X ins Leere ziehen → X→A und X→B weg, M→X bleibt, M steht über X.
  - (d) Ablage im Leeren, Spalte darunter frei → X in Reihe 0 (Ausgang). Darunter Z (kein Vorfahre) → X→Z.
  - (e) Ablage, die eine Schleife ergäbe → abgewiesen, deep-equal, LCD-Grund.
  - (f) Doppeltipp → `on` umgeschaltet.
  - (g) 20 zufällige Züge → 20 Undo-Schritte; 20 × Undo stellt den Anfang deep-equal her.
- [ ] **N7F-20 Vorschau:**
  - Während des Ziehens nennen LCD und Wertefeld das Ergebnis; wegfallende Linien sind gestrichelt.
  - 50 zufällige Züge: Die angekündigte Kantenliste ist deep-equal mit der Liste nach dem Loslassen.
- [ ] **N7F-21 Zwei Finger:**
  - Beginn ≤ 300 ms auf zwei Kacheln → Kante obere→untere (gleiche Reihe: zuerst berührte → zweite).
  - Schon verbundenes Paar → Kante weg.
  - 500 ms Abstand → nichts.
  - Ein ruhender Finger im Wertefeld (Fein) ändert das Feld nicht (ersetzt V4b-07).
- [ ] **N7F-22 Nachbau** DX-Alg. 5 aus dem FELD-Init mit ≤ 9 Gesten (Ziehen und Doppeltipp, Skript) → Badge „DX 5 ✓“ (ersetzt V4b-10).
- [ ] **N7F-23 Breit-Modus:**
  - HÜLLK. und TONH. öffnen breit. Graph ≥ 358 px (P1) bzw. ≥ 420 px (L1).
  - V0d-2-07 bis V0d-2-12 gelten dort. Die Dekade 10–100 ms ist ≥ 55 px (P1, wie A.4b) bzw. ≥ 64 px (L1; der Operator-Block kostet 92 px, gerechnet 66 px).
  - Chip k wählt OP k auf derselben Stufe. [⟵ Feld] ändert keine Daten.
  - Die Zeiten-Zeile enthält „gesamt“ = A + D1 + D2 + R ±1 ms (wie „Total length“, H S. 32).
- [ ] **N7F-24 Schublade** (P2, P3):
  - Ein Tipp auf eine Kachel öffnet sie von rechts (213 bzw. 180 px; Streifen ≥ 36×34).
  - Ein Tipp aufs sichtbare Feld schließt sie.
  - Die gewählte Kachel ist sichtbar oder steht als Chip im Schubladen-Kopf.
- [ ] **N7F-25 Feld groß ⤢:**
  - Eine 6er-Kette ist in P2, P3, L1 und L2 mit ⤢ in voller Größe sichtbar (Treffer nach 4.1). Ohne ⤢ ist sie gestaucht (Raster = Feldhöhe/6, Kachel ≥ 18 px hoch, LCD-Hinweis „⤢ für volle Größe“).
  - ⤢ ändert keine Daten. ▶ (Vorhören) spielt.
  - Der Knopf ⤢ verrutscht beim Umschalten um ≤ 2 px (L3).
- [ ] **N7F-26 Leuchten:** Gehaltene Note, OP 2 mit fallender Hüllkurve: Die Helligkeit des Kachel-Inneren fällt (10 Proben in 1 s, Spearman ρ ≤ −0,9). Ein stummer OP leuchtet nie.
- [ ] **N7F-27 DX-Modus bleibt:**
  - FELD ↔ DX ändert weder `fm6` noch `fmx` (N4b-01).
  - Ein Zug auf OP n › Pegel ändert den Streifen im FELD im selben Bild.
  - Nicht DX-taugliche Klänge: Die DX-Seite ist gesperrt und zeigt den Grund aus 6.3.

**V4c – Vorhersage, Raster, DX-Brücke**
- [ ] **N7F-28 Vorhersage im Wertefeld:**
  - Etikett und 16 Balken aktualisieren sich ≤ 50 ms nach dem Zielwechsel.
  - Rechenzeit ≤ 3 ms je Vorschau (Xeon, 6 OP, 21 Kanten).
  - Nach dem Loslassen ist der vorige Zustand bzw. der gezogene OP zu sehen (ersetzt V4c-01).
- [ ] **N7F-29 Raster und Wellen-Blatt:**
  - [▦] öffnet das Raster; V4c-02 und V4c-03 gelten.
  - Das Wellen-Blatt zeigt 12 Bilder; die Wahl ist ein Undo.
  - Waagrechtes Blättern im Wellen-Streifen wechselt hörbar (H-1 zwischen Sinus und Säge).
- [ ] **N7F-30 DX-Brücke:**
  - Der .syx-Export überspringt nicht taugliche Sounds und nennt je Sound den Grund aus 6.3.
  - Import → Spalten nach 5.3.
  - Rundlauf deep-equal (V4c-05, PEG nach A.4b).

---

## 9 Wirkung auf Pakete, Dauer, Budget

### 9.1 Pakete

| Paket | Version | Budget alt → neu | Dauer alt → neu | Grund |
|---|---|---|---|---|
| **V4a** | 4.10.0 (bleibt) | +35 → **+45 KB** | 5 → **7,5–8,5 h** | Neu: Wellen mit Mipmaps, Phase, Feedback-Quelle, Live-Pegel. Neu und bisher ohne Budget: PEG, AMS und LFO je OP, Anschlag ±, ECO mit PM (aus A.4b Punkt 11, ≈ 1,5 h). Weniger: 8-OP-Regeln, Kanten-Stimmenregel, Alias `opA…opH`. |
| **V4b** | 4.11.0 (bleibt) | +75 → **+100 KB** | 6–7 → **9–10 h** | Neu: Wertefeld mit 2 Zuständen und 4 Reitern, Streifen, Breit/Schublade/⤢, EssenceFM-Gesten mit Fallen und Tauschen, Farben, Leuchten. Weniger: Zonen, Magnete, Anfasser, Parkplatz, [+], Kontextzeile. |
| **V4c** | 4.12.0 (bleibt) | +30 → **+30 KB** | 4 → **4–4,5 h** | Vorhersage im Wertefeld, Wellen-Blatt, DX-Gründe; ▶ beim Ziehen entfällt |

- **Bau-Abschnitte V4a:**
  1. Graph mit 6 Operatoren, Feedback je Operator, abgeleitete Ausgänge, Gleichheitstests (N7F-01 bis N7F-03, N7F-06).
  2. Wellen, Phase, PEG/LFO/Anschlag je Operator, Live-Pegel (N7F-04, N7F-05, N7F-07, N7F-08).
  3. Nativer Rückfall, CPU, DX-tauglich, *(P1)* FM-X-Extras (N7F-09, N7F-10).
- **Bau-Abschnitte V4b** (ein Paket, eine Version, wie V0d):
  1. Feld, Kachel, Gesten, Vorlagen-Raster (N7F-12, N7F-13, N7F-14, N7F-19 bis N7F-22, N7F-26).
  2. Wertefeld ALLE OP/MAKRO, OP n · BASIS/MOD, Streifen-Bedienung (N7F-11, N7F-15 bis N7F-18).
  3. Breit-Modus, Schublade, ⤢, Mehrfachauswahl, *(P1)* Zufall und Linien-Animation (N7F-23 bis N7F-25, N7F-27).
- **Gruppe V4** (C.1): V4a, V4b, V4c, VC2a ≈ **26 h** statt ≈ 20 h. Spaltentext neu: „FM-Feld nach EssenceFM (6 Operatoren, Wertefeld rechts), DX-Seite bleibt; Verlauf zeichnet ab jetzt auf“.
- **Gesamt:** ≈ +6 h reine Bauzeit.
- **Größe:** Budgetsumme +2 177 KB → **+2 212 KB**, also ≈ 3,54 MB am Ende (Grenze 4,0 MB nach EN-17 hält).
- **Versionen:** unverändert, keine Neunummerierung.

### 9.2 Ersetzte und gestrichene Punkte

- **§9 Einleitung:** „nur 1 Feedback je Algorithmus“ wird zu „2 Feedbacks je Voice (OP 1 und OP 2)“ (H S. 28). „Unser Unterschied …“ wird ersetzt durch EK-02 und EK-09.
- **§9.1:** ersetzt durch EK-01 (6 Operatoren, 8 Stimmen, keine Kantengrenze). Der Kopf zeigt keine „Op · St · Kanten“ mehr, nur wenn der CPU-Begrenzer Stimmen kürzt (L9).
- **§9.2:** ersetzt durch 6.1 und 6.3.
- **§9.3:** ergänzt durch 6.4. „Schienen-Operatoren“ heißt jetzt „abgeleitete Ausgänge“; `opA…opH` entfällt.
- **§9.4:** ersetzt durch Teil 4 und 5 (Leitsätze, Mockup, Kachel 52×44, Zonen, Gesten-Tabelle, Kontextzeile). Es bleiben: Stimmen-Überblendung bei Strukturwechseln, „Feld-Leerraum ist keine Ruhefläche“, Halte-Regel (Picker erst beim Loslassen), ein Undo je Geste.
- **§9.5:** Die Vorhersage wandert ins Wertefeld, der Ring wird zum Balken, das ▶ beim Ziehen entfällt. Das Raster bleibt.
- **§9.6:** bleibt, plus 6.3.
- **V4a:**
  - V4a-03 wird zu „6-OP-Graph, 15 Kanten + 6 Feedback (2 mit fremder Quelle): 60 000 Zufallsblöcke ohne NaN“.
  - V4a-04 und V4a-05 → N7F-01.
  - V4a-06 → N7F-09.
  - V4a-01, -02, -07, -08, -09, -10 und -11 bleiben.
- **V4b:**
  - V4b-01 → N7F-12; V4b-02 und -03 → N7F-19.
  - V4b-04 (Anfasser) entfällt → N7F-06 und BASIS.
  - V4b-05 und -06 entfallen (EK-03, EK-04).
  - V4b-07 → N7F-21; V4b-10 → N7F-22; V4b-12 → N7F-11 und N7F-12.
  - V4b-07b, -08, -09, -11 und -13 bleiben.
- **V4c:**
  - V4c-01 → N7F-28.
  - V4c-06 gilt an einem 6-OP-Graph mit Gründen aus 6.3 (→ N7F-10).
  - V4c-02 bis -05 und -07 bleiben.
- **A.7:**
  - N4a-01 bleibt; das Feld heißt `fb.amt`.
  - N4b-01 bleibt, ergänzt um EK-10.
  - N4b-02 bleibt; Einstieg über [⋯].
  - N4b-03 gilt für Streifen und Kachel-Balken.
  - N4b-04 gilt im Reiter HÜLLK. (Breit).
  - N4c-01 bleibt.
- **A.4b Punkt 11:**
  - Pitch-EG je OP, Anschlag ±, AMS je OP, Key-Sync (= Phase-Modus) und ECO mit echter PM sind **Pflicht in V4a**.
  - Hold Time, Time/Key ± und Zeit-Format „Time“ sind *(P1)* in V4a/V4b (FM-X, nicht EssenceFM).
  - Mehrpunkt-Hüllkurven und Spektralformen bleiben §18.

### 9.3 Folgeänderungen an anderen Stellen (gleicher Inhalt, nur nachziehen)

- Spec §0.1 Z. 54 und C.1 Gruppe V4: „FM-Feld bis 8 Operatoren“ → „FM-Feld nach EssenceFM, 6 Operatoren“.
- E3-20: „`p.fmx` (≤ 8 Op)“ → „(6 Op)“.
- R51: Kantenregel entfällt; Ersatz N7F-09.
- §15.1 (Zeile FM8) → schlechtester Fall „6 OP, 21 Kanten, 8 Stimmen“ (6.5).
- §15.2 Stufe 2: „FM-Feld 7–8 Op: Poly ≤ 4“ → „FM-Feld: Poly ≤ 6“.
- §16: `fieldDrop` neu (Teil 10).
- A.8 (V5d):
  - Pfade `fmx.<A–H>.…` → `fmx.<1–6>.<ol|fine|det|r1…r4|l1…l4|bp|ld|rd|fb.amt|lfoFm|ph0>` plus `fmx.edge.<von>-<nach>.amt`.
  - Prüfsatz „8 Operatoren … A–H“ → „6 Operatoren … 1–6“.
  - *(P1)* `wave` als stufiges Ziel.
- L5 / A.13: Die Hilfe-Zeilen nennen keinen Gerätenamen („Kodamo“ und „EssenceFM“ stehen auf der Prüfliste). Erlaubt ist: „FELD: unten Ausgänge, darauf ziehen = modulieren, rechts die Werte“. Das Vorbild darf nur im ⓘ-Text mit Pflichtsatz stehen.

---

## 10 Test-API (ersetzt die FM-Feld-Zeilen in §16)

```ts
// V4a
getFmx(t): Fmx|null; setFmx(t, fmx): void           // Form 6.1; wirft bei ≠ 6 OP, Schleife, from = to, doppelter Zelle
fmxFromAlg(n): Fmx; dxMatch(t): {ok, alg?, nearest?, diff?, why?: string}   // why = erster Grund nach 6.3
fmOpLevels(t): number[]|null                        // letzte 6 Live-Pegel (0..1); null im nativen Pfad
fmWaves(): {id: number, name: string}[]             // 12 Einträge (6.2)
// V4b
fieldUi(): {tiles: {op, col, row, x, y, w, h, hit: [number, number, number, number], out: boolean, muted: boolean,
             sel: boolean, fbSrc: number|null, lv: number}[], rail: [number, number, number]|null,
            panel: {mode: 'alle'|'makro'|'op'|'breit'|'schublade'|'zu', op: number|null, tab: 'basis'|'huellk'|'mod'|'tonh'|null,
                    strips: {key: string, label: string, value: string, x, y, w, h}[]}, compressed: boolean, big: boolean}
fieldTap(t, op: number|null): void                  // null = Leerraum → ALLE OP
fieldDoubleTap(t, op): void                         // stumm umschalten
fieldDrop(t, op, target: number|'empty', o?: {col?: number}): {result: 'verbunden'|'getauscht'|'gefallen'|'ausgang'|'abgewiesen', on?: number}
fieldTwo(t, a, b): 'verbunden'|'geloest'|'abgewiesen'
fieldBig(on?: boolean): boolean                     // ⤢; Laufzeit-Zustand
panelTab(tab: 'alle'|'makro'|'basis'|'huellk'|'mod'|'tonh'): void
// V4c (unverändert im Namen)
fmPredict(t): {label, bars: number[16]}; exportSyx(ids): Promise<Uint8Array>
```

Jede ändernde Funktion ist ein Undo-Schritt wie die zugehörige Geste. `fieldBig` und `panelTab` sind Ansichts-Zustände; sie gehören nicht ins Projekt und brauchen keinen Eintrag in `HIST.volatile`.

---

## 11 Offen, UNBELEGT, Fragen an Xander

**UNBELEGT bei EssenceFM (hier festgelegt, Teil 5.2):**
- Wer beim Ziehen-Verbinden Modulator wird. Festlegung: der gezogene.
- Ob Fallen auf den nächsten Operator darunter verbindet. Festlegung: ja.
- Wie der Live-Pegel gezeichnet wird. Festlegung: Leuchten.
- Wie zwei Finger in derselben Reihe wirken.
- Lösen einer Linie.
- Formen von Saw2, HSine, Harm1/2 und SSine2.

**Hinweise zu den Quellen:**
- Das Base-Bild H S. 18 zeigt noch die Knopf-Belegung vor V7.0 (Volume 3, Transpose 4, Tuning 5). Die farbigen Operator-Bilder S. 18 unten und S. 19 entsprechen V7.0. Das Handbuch mischt also Bilder verschiedener Firmware-Stände (WAHRSCHEINLICH).
- Der Satz „Feedback Source … will be fed back into OP1“ (H S. 28) gilt laut Tabelle für OP 1 und OP 2. Der Wortlaut ist vermutlich ein Tippfehler (UNBELEGT).

**Fragen an Xander** (nicht blockierend; der Bau nimmt die Vorgabe):

| # | Frage | Vorgabe |
|---|---|---|
| E-K1 | Reichen 6 Operatoren genau wie bei EssenceFM? Mehr gäbe es später über Schichten, wie EssenceFM-Patches. | ja, 6 |
| E-K2 | Darf „Feld groß ⤢“ auf kleinen iPhones und im Querformat die Tastatur ausblenden? Hören dann mit ▶, wie die EssenceFM-Taste ♪. | ja |
| E-K3 | Die Hüllkurven bleiben DX-Art mit [Snap] usw. (Runde 9). Die EssenceFM-Hüllkurven mit 6 Punkten und Schleife kommen später – einverstanden? | ja |

---

## Quellen

- **H** – Kodamo, EssenceFM User Manual, „For firmware V7.0, updated 2025-05-15“: https://kodamo.org/essencefm_manual.php. Gelesen als PDF-Ausdruck (Safari, 17.10.2026, 82 S.): `v3-ideen/r7/kodamo-pdf/EssenceFM-manual.pdf`. Benutzte Seiten: 2, 6–8, 11–15, 18–33, 61–62, 66–67. Bilder: `r7/kodamo-delta/handbuch-bilder/` (S. 18, 19, 27, 29, 61, 62).
- **R7-H / R7-O** – `v3-ideen/r7/kodamo-handbuch.md`, `v3-ideen/r7/kodamo-oberflaeche.md` mit ihren URLs (u. a. https://kodamo.org/newsletters/newsletter_05_2025.html, https://kodamo.org/forumtopic849, https://kodamo.org/efm_sysex.php).
- **Spec und Nachtrag** – `v3-ideen/dirigent-spec-v3.md` §0.2–0.4, §9, §15, §16, §17 (V4a–V4c); `v3-ideen/dirigent-spec-v3-nachtrag-1.md` A.4, A.4b, A.7, A.8, C.1, C.4 (Stand 17.10.2026, 13:26, mit A.4b).
- **App-Stand (nur gelesen)** – `synq-snapshots/V0a.html`: `subTabsFor` Z. 13627, `pageFmAlgo` Z. 14112, `fmStripCol` Z. 14082, `pageFmOp` Z. 14208, `algSvg`/`algLayout` Z. 7557–7590, `ctlPrecision` Z. 12505, Scope-Nachricht Z. 3393, `DX_ALGS` Z. 2557.
- **Eigene Messungen** – `v3-ideen/r7/kodamo-delta/`: `img-mass.py` → `img-mass.out` (EssenceFM-Bild), `geo.mjs` → `geo.out` (V0a-Seitengrößen P1–W), `layout-check.mjs` → `layout-check.out` (Vorlagen-Raster, Maße, Farben), `cpu6.mjs` → `cpu6.out` (CPU, Kerne aus `r2/c6c9/kernels.js`). Alle Messungen auf der Xeon-VM in Chromium/Node, **nicht am iPhone**.
- **Xander** – `v3-ideen/fragen-xander-7.md` (P1), `fragen-xander-6.md` (I1), `fragen-xander-9.md` (Hüllkurven), `fragen-xander.md` B6 und `fragen-xander-2.md` C7 (früherer Wunsch nach 8 Operatoren).
