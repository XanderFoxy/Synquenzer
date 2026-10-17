# Kodamo-Delta (PDF-Fassung) – verbindliche Änderungen für V4a–V4c

Stand 17.10.2026 · Status **verbindlich** · Auftrag: Xanders Priorität 1 (`v3-ideen/fragen-xander-7.md`, P1) · Grundlage: `r7/kodamo-pdf/handbuch-komplett.md` (vollständiges EssenceFM-Handbuch, 82 Seiten, Firmware V7.0).

**Vorrang und Geltung**
- Dieses Dokument **ersetzt** `r7/kodamo-delta.md` (Suchauszug-Fassung; lag bei Abschluss dieser Datei nicht vor – entsteht sie noch, gilt trotzdem diese Datei).
- Für das FM-Feld ersetzt es in `dirigent-spec-v3.md` §9 (9.1 Leitsätze, 9.2 und 9.4 ganz; 9.3, 9.5, 9.6 in den genannten Punkten), die Paketbeschreibungen V4a–V4c in §17 und in `dirigent-spec-v3-nachtrag-1.md` den Abschnitt A.7, soweit hier etwas anders geregelt ist. **Bei Widerspruch gilt dieses Dokument.** Die genaue Änderungsliste steht in §10.
- A.4 und A.4b (Paket V0d) bleiben unverändert verbindlich. Hier wird nur A.4b Punkt 11 („was nach V4 wandert“) eingelöst und in einem Punkt geändert: Mehrpunkt-Hüllkurven mit Schleife kommen mit V4c statt in §18.
- Kennzeichen wie in der Spec: (Handbuch S. n) = Text der Handbuchseite · (Bild S. n) = Screenshot dieser Seite, gemessen · **Auslegung** = eigene Festlegung, wo das Handbuch schweigt · *gerechnet* · *Schätzung* · „gemessen“ = Chromium/Node auf der Xeon-VM, nie am iPhone.
- IDs: Entscheidungen **EK-01…**, Gesten-Regeln **R1…**, Invarianten **I1…**, zulässige Zusätze **Z1…**, verworfene Spec-Teile **X1…**, Abnahme **N7F-01…** (ersetzt bzw. ergänzt die genannten §17-Punkte).

---

## 1. Leitsatz

> **Das FM-Feld ist der Voice-Editor der EssenceFM auf dem iPhone.** Es gilt, was das Handbuch sagt. Abweichen darf nur, (a) was das iPhone erzwingt – keine sechs Hardware-Regler, 390 px Breite, Finger statt Main Dial – oder (b) ein Zusatz, der **keine EssenceFM-Regel ändert** (Liste Z, §4.13).

| Xander (P1) | EssenceFM (Handbuch) | FM-Feld |
|---|---|---|
| „unten die Operatoren, die mit dem Ausgang verbunden sind (Träger)“ | „operators at the bottommost … are Carriers. Carriers send their signal directly to the output“; gelesen wird von oben nach unten; kein Ausgangssymbol (Handbuch S. 12; Bild S. 18–19) | Reihe 0 des Rasters = Ausgang; darunter nur eine Bodenlinie „AUSGANG“ als Anzeige (Z2) |
| „weitere Bausteine zieht man darauf, um FM-mäßig zu modulieren“ | Operator auf einen anderen ziehen = verbinden; schon verbunden = tauschen; ins Leere = fällt nach unten; zwei Finger = Zusatz-Verbindung (Handbuch S. 19) | Regeln R5–R9 |
| „RECHTS daneben eine Anzeige, die die Werte in Relation zu den Operatoren zeigt und einstellen lässt“ | rechtes Feld: Stimme ohne Auswahl, sonst nur der gewählte Operator; Regler n = Pegel OP n, Kachel n in Reglerfarbe (Handbuch S. 18–19) | WERTE-Spalte rechts: Pegel-Seite (eine Zeile je Operator in seiner Farbe) bzw. die Seiten des gewählten Operators (§4.7) |

---

## 2. Abgleich Spec §9 + Nachtrag A.7 ↔ Handbuch

Urteil: **gleich** · **anders** (Spec weicht ab) · **Widerspruch** (Spec verlangt das Gegenteil) · **fehlt (Spec)** = Handbuch hat es, Spec nicht · **Zusatz** = Spec hat es, Handbuch nicht.

| # | Thema | Spec §9 / A.7 | Handbuch | Urteil | Folge |
|---|---|---|---|---|---|
| A1 | Operatorzahl | bis 8 (§9, 9.1) | genau 6 (Handbuch S. 2, 6) | anders | EK-07: Standard 6, 7–8 zuschaltbar (Z4) |
| A2 | Zahl der Feedbacks | „nur 1 Feedback je Algorithmus“ (§9 Einleitung, Suchauszug) | 2 Wege: Empfänger OP 1/OP 2, Quelle jeder OP (Handbuch S. 13, 25, 28) | anders (Spec-Fakt falsch) | EK-06: Feedback-Wert an jedem OP (Z3) |
| A3 | Feedback-Bild | orange Feedback-Kante, Anfasser ● (9.4) | Zahl-Badge oben rechts am Empfänger, keine Linie (Handbuch S. 13) | anders | Badge (EK-06); X7 |
| A4 | Lesart | Ebenen, unten Schiene = Ausgang (9.4) | von oben nach unten, unterste Reihe = Träger (Handbuch S. 12) | gleich (Prinzip) | EK-02 |
| A5 | Ausgang | Schiene „══ AUSG.“, Ablageziel (9.2 `out`, 9.4) | kein Symbol; Ausgang = unterste Reihe (Bild S. 12–19) | anders | Bodenlinie nur Anzeige (Z2); X4 |
| A6 | Anordnung | 4 Ebenen à 44 px, Auto-Layout, Halbreihen, Knick (9.4) | freie Plätze im Raster 29 × 36 px, Lücken bleiben (Bild S. 18–19) | anders | EK-02: 6 × 6-Raster; X10 |
| A7 | Kennung | Buchstaben A–H, DX-Nummer klein (9.2, 9.4) | Nummern, frei platzierbar (Handbuch S. 12) | anders | EK-03: Nummern 1–8; X8 |
| A8 | Kachel-Inhalt | Verhältnis, Ring = Index/dB, Hüllkurven-Miniatur (9.4) | Nummer, Frequenz, Pegelbalken links (live), FB-Badge (Handbuch S. 13, 18, 66) | anders | EK-04; X9 |
| A9 | Zustandsfarben | – | Reglerfarben ohne Auswahl; grau + grün mit Auswahl; dunkelgrau = stumm (Handbuch S. 18–19) | fehlt (Spec) | EK-04 |
| A10 | Live-Pegel | – | Balken zeigt die Ausgabe beim Spielen (Handbuch S. 18) | fehlt (Spec) | N7F-09, N7F-32 |
| A11 | Linien | Linienstärke = Tiefe (9.4) | dünn, mint, unten-Mitte → oben-Mitte, grau bei stumm, animierbar (Handbuch S. 12–13, 67) | anders | EK-05; keine Tiefe je Kante: Stärke = Pegel des Modulators (Handbuch S. 12–13) |
| A12 | Ablegen auf Operator | Zonen OBEN/UNTEN/NEBEN/MITTE bestimmen die Wirkung (9.4) | verbinden; schon verbunden → tauschen (Handbuch S. 19) | anders | R5, R6; X1 |
| A13 | Bewegen | „Bewegen ändert nie Verbindungen“ (9.1, 9.4) | „Moving an operator always removes its bottom links“ (Handbuch S. 19) | **Widerspruch** | R6, R7; X3 |
| A14 | Ablegen im Leeren | „schnappt zurück, nichts ändert sich“ (9.4, V4b-03) | „it will simply fall, going to the bottom or to the nearest operator below“ (Handbuch S. 19) | **Widerspruch** | R7; X2 |
| A15 | Zwei Finger | obere moduliert untere, beide Berührungen ≤ 300 ms (9.4) | „connect them together … additional connections“ (Handbuch S. 19) | gleich | R9 (+ Lösen, Z7) |
| A16 | Doppeltipp | – | stumm/an (Handbuch S. 19) | fehlt (Spec) | R3 |
| A17 | M / S | – (V0d hat [Solo]) | Mute und Solo des Operators (Handbuch S. 19, 27) | fehlt (Spec) | Reiterblock |
| A18 | Tipp auf Kachel | wählen; Kontextzeile und OP-Seite folgen | rechtes Feld zeigt den Operator (Handbuch S. 19) | gleich (Ort anders) | R1 |
| A19 | Tipp ins Leere | nicht festgelegt (nur „Wischen = nichts“) | rechtes Feld zeigt die Stimme (Handbuch S. 19) | fehlt (Spec) | R2 |
| A20 | Wertefeld | Kontextzeile unten (44 px) + Unterseite OP n | Feld rechts neben dem Algorithmus (Handbuch S. 18) | anders | EK-08; X11 |
| A21 | Alle Pegel auf einmal | – (N4b-02 Mehrfachauswahl) | Regler n = Pegel OP n ohne Auswahl (Handbuch S. 18) | fehlt (Spec) | Pegel-Seite (EK-08) |
| A22 | Parkplatz, [+] | Parkplatz „aus“, [+] neuer Operator (9.4) | alle Operatoren immer da; „aus“ = stumm (Handbuch S. 19) | anders | X5, X6; Schalter 6│7│8 (EK-07) |
| A23 | Linie antippen | Mini-Schieber Tiefe + [Lösen] (9.4) | Tippen ins Leere = Stimme (Handbuch S. 19) | **Widerspruch** (Tipp-Ziel) | Ziele-Liste im Wertefeld (Z6); X12 |
| A24 | Halten | Mod-Picker beim Loslassen (9.4, L4) | nicht beschrieben | Zusatz | Mod-Picker unter ⋯ › „Modulieren mit …“ (Z13); Halten auf einer Kachel wählt nur (R1) |
| A25 | Vorschau | Geist, LCD, Vorhersage 30 Hz (9.4, 9.5) | nicht beschrieben | Zusatz | Z1, Z9 (zeigt nur die EssenceFM-Wirkung) |
| A26 | Undo, Vergleich | ein Undo je Geste, [A│B] | Undo bis 1024 inkl. Algorithmus, Recall als Vergleich (Handbuch S. 7–8) | gleich (Prinzip) | R12, Z8 |
| A27 | Vorlagen | [Vorlagen ▾] mit 32 DX-Bildern (9.4) | Algorithm Library 0…31 = DX7-Algorithmen (Handbuch S. 20, 25) | gleich | EK-12 (`dxLayout`) |
| A28 | Wellen | `wave:'sin'` (9.2) | Welle je Operator aus 48er-Vorrat, 512 Samples, zeichenbar (Handbuch S. 27, 61–63, 70) | fehlt (Spec) | EK-09; V4a, V4e |
| A29 | Phase | – | Phase 0…127, Fixed/Random/FreeRun (Handbuch S. 28) | fehlt (Spec) | V4a |
| A30 | Hüllkurven | DX R/L (WP7, A.4b); Mehrpunkt → §18 (A.4b P. 11) | ≤ 6 Punkte, Sustain, Loop A/B, Lin/Exp, Skala, Retrig/FreeRun, log. Zeit (Handbuch S. 31–33) | anders | EK-10; V4c |
| A31 | Tonhöhen-Hüllkurve | DX-PEG für alle (A.4b P. 3); je OP „nach V4“ (A.4b P. 11) | je Operator, Bereich Ton, Quinte, 1, 2, 4, 8 Okt. (Handbuch S. 30–31) | teils | EK-10 |
| A32 | Anschlag | DX 0…7; ± „nach V4“ (A.4b P. 11) | −127…+127 je Operator (Handbuch S. 30) | teils | `vs` −7…+7 |
| A33 | LFO je Operator | Mod-Route `lfo1→opB` (V4a-08) | LFO1 AM und LFO1 FM je Operator (Handbuch S. 30) | teils | `lfoAm`, `lfoFm` |
| A34 | Tasten-Skalierung | DX bp/ld/rd/lc/rc | Kurve mit drei Griffen: unten, Mitte (Note), oben (Handbuch S. 30) | gleich (Bild anders) | Mod-Seite |
| A35 | Frequenz | DX coarse/fine/det, fest | Multiplier, Quartertones, Fine; fest ×0,1…×100 · 0…255 (Handbuch S. 28) | ähnlich | DX-Felder bleiben (EN-02) |
| A36 | Pegel-Skala | OL 0–99, V0d-Fader-Kurve (N4b-03) | Volume 0…127 (Handbuch S. 28) | anders (Skala) | OL bleibt (EN-02) |
| A37 | Feedback-Skala | 0–7 in 0,1-Schritten (N4a-01) | Level 0…127 (Handbuch S. 28) | anders (Skala) | bleibt (DX-Gleichheit) |
| A38 | Unterseiten | FELD · DX · OP · MAKRO · STIMME (N4b-01) | nur der Voice-Editor (Handbuch S. 17–33) | Zusatz | bleibt: DX-Modus bleibt (Xander I1); Z10 |
| A39 | Mehrfachauswahl | [Mehrere] in der Kontextzeile (N4b-02) | – (alle Pegel über die Regler) | Zusatz | über ⋯ (Z18) |
| A40 | Hüllkurve auf mehrere | „auf diesen/alle Mod./alle Ausg./alle“ (N4b-04) | Copy/Paste von Hüllkurve und ganzem Operator (Handbuch S. 7, 29) | gleich (erweitert) | Aktionszeile |
| A41 | Stimmen, 16 Kanten | Budget-Regel (9.1) | Hardware: 300 Stimmen | Zusatz (CPU) | bleibt |
| A42 | DX-Brücke | Import, `dxMatch`, [DX-tauglich machen], .syx-Export (9.6) | DX7-Import als Voice (Handbuch S. 70), kein Export | Zusatz | bleibt (V4d) |
| A43 | Vorhören | ▶ im Kopf (9.4) | ♪-Taste (Handbuch S. 8) | gleich | ▶ im Blatt-Kopf (vorhanden) |
| A44 | Zufall | Würfel im Blatt-Kopf | Randomize mit Häkchen Freq, Flt, VEG, PEG, Algo, Lvls, LFO (Handbuch S. 20) | teils | Zufall-Blatt (V4b) |
| A45 | Fein einstellen | FEIN-Chip, ruhender zweiter Finger | Regler, Main Dial, Inc/Dec; Ziffernblock; Doppeltipp = Mitte (Handbuch S. 7, 11) | Ersatz | Z12 |
| A46 | Strukturwechsel bei klingender Note | Stimmen-Überblendung 30 ms (V4a, L3) | nicht beschrieben | Zusatz | Z11 |

---

## 3. Entscheidungen

| # | Entscheidung | Grund |
|---|---|---|
| **EK-01** | **EssenceFM-Gesten** (R1–R13) ersetzen Magnet-Zonen, „zurückschnappen“ und „Bewegen löscht nie“. Die Spec-Leitsätze „Wirkung nur vom Ort“ und „Bewegen ändert nie Verbindungen“ entfallen. Die Vorschau bleibt, zeigt aber das Ergebnis der EssenceFM-Regel. | Xander: „genau wie bei EssenceFM“; A12–A14 |
| **EK-02** | **Raster 6 Spalten × 6 Reihen mit freien Plätzen**; Reihe 0 = Ausgang. Plätze werden nicht zusammengeschoben. | Bild S. 18–19 (gemessen: 29 × 36 px, Lücken bleiben); 6 × 6 = Auslegung aus dem Platz |
| **EK-03** | **Operatoren heißen 1–8** (Nummer = Identität, frei platzierbar); keine Buchstaben. | Handbuch S. 12 |
| **EK-04** | **Kachel und Zustandsfarben wie EssenceFM** (Nummer, Frequenz, Pegelbalken links mit Live-Pegel, Feedback-Badge; Reglerfarben ohne Auswahl, grau + grün mit Auswahl, dunkelgrau stumm). | Handbuch S. 13, 18–19, 66 |
| **EK-05** | **Linien wie EssenceFM** (unten-Mitte → oben-Mitte, mint, grau bei stummem Modulator), Animation abschaltbar. | Handbuch S. 12–13, 67 |
| **EK-06** | **Feedback ist ein Wert am Empfänger** (Quelle + Stärke), sichtbar als Badge mit der Quellnummer. Erlaubt auf **jedem** Operator (EssenceFM: nur OP 1/OP 2). | Handbuch S. 13, 28; Nutzerwunsch „Feedback auf jedem Operator“ (alte Fassung §2.14) |
| **EK-07** | **Standard 6 Operatoren** (wie EssenceFM); **7 und 8 zuschaltbar** (Seite Stimme, „Operatoren 6│7│8“). Das Raster bleibt 6 × 6: höchstens 6 Ausgänge nebeneinander, Ketten höchstens 6 tief. Stimmen-Regel aus §9.1 unverändert. | EssenceFM 6 (Handbuch S. 2); Xanders Wunsch „Kraft von FM-X, 8 Operatoren“ (Runde 1/2, E2) |
| **EK-08** | **Wertefeld rechts** (Hochformat 132 px, Querformat 508 px): ohne Auswahl **Pegel-Seite** (eine Zeile je Operator in seiner Farbe = Ersatz für die sechs Regler) und Seite **Stimme**; mit Auswahl **Basis · Amp · Mod · Tonh.** + **M**, dazu **⋯** (Solo, Ziele, Kopieren, Einfügen, Mehrere wählen, Modulieren mit …). Filter, LFO, Mod-Matrix und Pan bleiben auf den App-Reitern FILTER, LFO, MOD, HÜLLK. (keine Doppelung, L1). | Handbuch S. 18–20, 27; Xander P1 |
| **EK-09** | **Welle je Operator** aus einem Vorrat 0–47: Werkswellen 0–11 ab V4a; ab V4e sind 1–11 im Projekt bearbeitbar (Kopie mit gleichem Index, „Zurücksetzen“ = Werkswelle), **Welle 0 (Sinus) bleibt fest** (Abweichung D1, F-7); eigene Wellen 12–47 ab V4e (P1). 512 Samples, linear interpoliert. | Handbuch S. 27, 61–63, 70, 74 |
| **EK-10** | **Zwei Hüllkurven-Formen je Operator:** DX-Form (A.4b, msfa-genau) und **Punkt-Form** (EssenceFM: ≤ 6 Punkte, Sustain, Loop A/B, Lin/Exp, Skala, Retrig/Frei). Eine **Tonhöhen-Hüllkurve je Operator** mit Bereich. Ein Editor (A.4b `fmEnvEditor`, erweitert). | Handbuch S. 28–33; A.4b |
| **EK-11** | **DX-/Klassik-Modus bleibt** (N4b-01). „DX-tauglich“ wird neu definiert (§6.4). | Xander I1 („DX-Modus bleibt“) |
| **EK-12** | DX-Algorithmen erscheinen im Raster nach der festen Anordnung **`dxLayout`** (§6.5). *Gerechnet:* alle 32 passen, höchstens 6 Spalten und 4 Reihen, alle Kanten abwärts (`scratchpad/kodamo-pdf-skripte/dxlayout.py`). | Handbuch S. 20, 25 (Algorithm Library = DX7) |
| **EK-13** | **Feld links, Hüllkurve rechts – in allen Größen.** **Hochformat:** Auf den Seiten Amp und Tonh. schrumpft das FELD zu einem **Mini-Feld** (x 0–131, Kacheln 20 × 42 mit Nummer, Linien, Pegel- und Live-Balken; R1–R3 aktiv, Ziehen und Zwei Finger gesperrt); die Hüllkurve steht rechts daneben (x 138–373, §5.1 d). Pinch-Zoom gleicht die schmalere Zeitachse aus. **Querformat:** Hüllkurve im Wertefeld, Feld unverändert. | EssenceFM zeigt Amp- und Pitch-Hüllkurve im rechten Feld, der Algorithmus bleibt links sichtbar (Bild S. 29, 31; Handbuch S. 18); Xander P1 „RECHTS daneben eine Anzeige … genau wie bei EssenceFM“ (fragen-xander-7.md); 132 px allein reichen nicht für eine Zeitachse |
| **EK-14** | **Paketschnitt:** V4a Engine · V4b Feld und Wertefeld · V4c Hüllkurven · V4d Vorhersage, Raster, DX-Brücke (bisher V4c) · V4e Wellen zeichnen *(P1)*. | §8 |

---

## 4. Das FM-Feld – verbindliche Definition

### 4.1 Raster und Invarianten

- **Zelle** (c, r): Spalte c = 0…5 von links, Reihe r = 0…5 von unten. Jeder Operator steht in genau einer Zelle.
- **Ausgang** = alle Operatoren in Reihe 0. Es gibt kein Feld `out` mehr (wird abgeleitet).
- **Ziele** von X = Operatoren, die X moduliert („bottom links“). **Oberer Baum** von X = alle Operatoren mit einem Weg zu X (seine Modulatoren und deren Modulatoren).
- **Invarianten** (gelten nach jeder Geste und nach jedem Laden):
  - **I1** keine Zelle doppelt belegt;
  - **I2** jede Kante zeigt nach unten: r(von) > r(nach) (Handbuch S. 12: von oben nach unten);
  - **I3** jeder Operator in Reihe > 0 hat mindestens ein Ziel (**Auslegung:** kein Operator schwebt; in allen Bildern S. 12–19 so);
  - **I4** ein Operator in Reihe 0 hat kein Ziel;
  - **I5** Kanten + Feedback-Wege ≤ 16 (§9.1).

### 4.2 Kachel

- Inhalt (Handbuch S. 13, 18, 66; Bild S. 18–19):
  - **Nummer** groß in der oberen Mitte (P1: 17 px fett);
  - **Frequenz** klein darunter (11 px, **höchstens 4 Zeichen**): unter ×10 mit einer Nachkommastelle, wo nötig („×1“, „×3,5“), ab ×10 ganzzahlig ohne „×“ („14“, „27“, „62“ für ×61,69); feste Frequenz ohne Einheit, ab 1000 als „1,2k“ („440“, „9,8k“ für 9772 Hz); die genaue Zahl steht im Wertefeld (EssenceFM zeigt ebenfalls nur die Zahl, z. B. „3.50“, Bild S. 18–19); abschaltbar unter Stimme › „Frequenzen in Kacheln“ (Handbuch S. 66; Standard an);
  - **Pegelbalken** links innen (P1 4 px breit): **gedämpfte Fläche bis `ol`/99** mit einer **2-px-Marke** in voller Farbe auf dieser Höhe, **Live-Teil** in voller Farbe von unten (Maximum über alle klingenden Stimmen, Pegel × Hüllkurve, 0…1; Z5); Farben §4.3 „Balken und Fahne“;
  - **Feedback-Badge** oben rechts innen (P1 12 × 12 px) mit der **Quellnummer**, sobald `fbSrc > 0`; bei `fbAmt` 0 blass (40 %), damit z. B. DX-Alg. 1 und 2 auch bei Feedback 0 unterscheidbar bleiben (wie V0d A.4 Punkt 1). EssenceFM zeigt das Badge an OP 1/2 immer (Handbuch S. 13; Bild S. 12–19).
- Treffer: Kachel-Rechteck plus 2 px rundum (P1 40 × 54 px, überlappungsfrei).

### 4.3 Zustände und Farben (verbindlich, RGB aus den Screenshots)

| Zustand | Rahmen | Füllung, Schrift | Pegelbalken | Beleg |
|---|---|---|---|---|
| **nichts gewählt, Wertefeld auf der Pegel-Seite** | OP-Farbe: 1 **#CB1317** rot · 2 **#FFFFFF** weiß · 3 **#47CA0A** grün · 4 **#596084** grau · 5 **#0A6AFF** blau · 6 **#1B1D25** schwarz mit Halo #3A3F52 · 7 **#F76A0A** orange · 8 **#850AFF** violett | #0A0A0A, Nummer weiß, Frequenz #47CA0A | in OP-Farbe (siehe unten) | nur auf dem Stimmen-Reiter Base: „When you are on the Base tab of the voice (no operator is focused), they are color-matched to the 6 knobs“ (Handbuch S. 18); Bild S. 18 unten; 7 = Orange des Knopfs „Scale“ (Bild S. 29), 8 = Violett von „Algorithm Library“ (Bild S. 18) |
| **nichts gewählt, andere Seite** (Stimme, Vorlagen, Zufall, A│B) | alle **#363A4E** | #0A0A0A, Nummer weiß, Frequenz #47CA0A (keine grüne Kachel) | weiß | auf den anderen Stimmen-Reitern gehören die Regler anderen Werten (Fahnen 1, 2, 3, 6 im Bild S. 22), die Farbbeziehung entfällt (Handbuch S. 18) |
| **ein Operator gewählt** | alle **#363A4E** | – | weiß | Handbuch S. 18; Bild S. 19 |
| gewählter Operator | **#0ACA9F** | **#0A6E5B** gefüllt | weiß | Handbuch S. 19; Bild S. 19, 29 |
| **stumm** | **#3E435B** | Nummer und Frequenz 40 % Deckkraft | – | Handbuch S. 19; Bild S. 18 |
| Linie | **#0AFFAD** 2 px | – | – | Bild S. 12–19 |
| Linie eines stummen Modulators | **#3E435B** | – | – | Bild S. 18 |
| Feld-Hintergrund | #121317 | – | – | Bild S. 19 |

**Balken und Fahne** (verbindlich; Kontrast *gerechnet* nach WCAG gegen die Kachel #0A0A0A):

| Teil | Regel | Kontrast |
|---|---|---|
| Balken-Fläche bis `ol` | OP-Farbe zu 45 % über #0A0A0A gemischt; reine Füllung, trägt allein keine Information | – |
| Marke `ol` (2 px) und Live-Teil | OP-Farbe 100 %; OP 6 statt #1B1D25: Fläche #3A3F52, Marke und Live **#8A90A8** | OP 1–8: 3,4 · 19,8 · 9,2 · 3,2 · 4,3 · 6,3 (#8A90A8) · 6,6 · 3,3 → alle ≥ 3:1 |
| Fahne (Wertefeld) | Fläche in OP-Farbe; OP 6 mit 1-px-Rand #8A90A8 | – |
| Nummer auf der Fahne | **#0A0A0A** auf OP 2, 3, 7; sonst **#FFFFFF** | 19,8 · 9,2 · 6,6 bzw. 5,8 · 6,1 · 4,7 · 16,8 · 6,0 (OP 1, 4, 5, 6, 8) → alle ≥ 4,5:1 |
| mit Auswahl / andere Seite | Balken weiß (Fläche 45 %, Marke und Live 100 %) | 19,8 |

Die Farben gelten im FELD unabhängig vom App-Thema (EssenceFM-Optik ist gewünscht).

### 4.4 Linien und Boden

- Jede Kante: Linie von der **Unterkante-Mitte des Modulators** zur **Oberkante-Mitte des Ziels**, gerade (senkrecht bei gleicher Spalte, sonst schräg) (Bild S. 12–19).
- Mehrere Modulatoren auf einem Ziel enden alle an dessen Oberkante-Mitte (Summe, Handbuch S. 12); ein Modulator mit mehreren Zielen hat je Ziel eine Linie (Handbuch S. 13).
- **Linien-Animation:** Schalter laut Handbuch S. 67 („Enables line animations that are used for connecting operators on the Voice page …“). Die Form der Animation beschreibt das Handbuch nicht (handbuch-komplett §11 Punkt 14); **Auslegung:** beim Verbinden wird die neue Linie in 200 ms vom Modulator zum Ziel aufgezeichnet, dazu ein dauernder Strich-Lauf nach unten (Signalrichtung, 1 Zyklus/s). Schalter unter Stimme › „Linien-Animation“ (Standard an; aus bei `prefers-reduced-motion`).
- Feedback wird **nicht** als Linie gezeichnet, nur als Badge (Handbuch S. 13).
- **Boden** (Z2): unter Reihe 0 eine 2-px-Linie mit dem Wort „AUSGANG“ (P1 10 px). Er ist nur Anzeige: Ablegen „auf den Boden“ ist Ablegen in eine leere Zelle (R7).

### 4.5 Gesten (Regelwerk, deterministisch)

| Regel | Geste | Wirkung | Beleg |
|---|---|---|---|
| **R0** | Weitere Berührung im FELD, während ein Zug im Wertefeld oder im Hüllkurven-Graph läuft | nur **FEIN** (×¼, solange sie liegt): keine Auswahl, kein Ziehen, kein Doppeltipp, keine Zwei-Finger-Geste, kein Picker | Zusatz (Z12) |
| **R1** | **Aufsetzen** auf einer Kachel (pointerdown) | wählt den Operator **sofort** (grün, alle anderen grau); Wertefeld zeigt ihn – auch wenn danach ein Zug (R4) oder ein Doppeltipp (R3) folgt; Halten ohne Bewegung ändert nichts weiter; kein Undo | Handbuch S. 18 („When you press on an operator to move it or edit it, they all become gray“), S. 19 („When an operator is pressed, the right panel shows the operator settings“) |
| **R2** | Tipp ins Leere des Felds | Auswahl weg; Wertefeld zeigt die Pegel-Seite | Handbuch S. 19 |
| **R3** | Doppeltipp (2 Tipps ≤ 300 ms, je ≤ 8 px, gleiche Kachel) oder [M] | stumm ↔ an; Auswahl bleibt; ein Undo | Handbuch S. 19, 27 |
| **R4** | Ziehen beginnt (> 8 px) | Kachel hebt sich, ein Geist folgt dem Finger, die alte Zelle ist gestrichelt; **nichts ändert sich vor dem Loslassen**; Geist am Zielort, Geisterlinien und LCD zeigen laufend das Ergebnis nach R5–R8 (Z1) | Zusatz |
| **R5** | Loslassen über Kachel Y, **X und Y direkt verbunden** (X→Y oder Y→X) | **Tauschen:** X und Y tauschen Zelle und Rolle. Alle Kanten bleiben an den Plätzen: In jeder Kante wird X durch Y ersetzt und umgekehrt (aus X→Y wird Y→X). Werte, Feedback-Quelle und -Stärke bleiben beim Operator. Ein Undo. | Handbuch S. 19 („positions will be swapped“); Kanten folgen den Plätzen = Auslegung |
| **R6** | Loslassen über Kachel Y, **nicht direkt verbunden** | **Verbinden:** (a) alle Ziele von X werden gelöst („removes its bottom links“); (b) neue Kante X→Y; (c) X kommt in Reihe r(Y)+1, Spalte c(Y), wenn frei, sonst die nächste freie Spalte dieser Reihe in der Reihenfolge c+1, c−1, c+2, c−2, …; (d) der obere Baum von X wandert mit demselben Versatz mit (Zellen des mitwandernden Baums gelten bei (c) als frei; belegte Zielzellen → nächste freie Spalte derselben Reihe); (e) **abgewiesen** (nichts ändert sich, kein Undo, LCD nennt den Grund), wenn Y im oberen Baum von X liegt, wenn in einer Zielreihe kein Platz ist (r > 5 oder Reihe voll) oder wenn danach eine Kante nicht mehr nach unten zeigt (ein Operator des oberen Baums speist zusätzlich einen Operator außerhalb; LCD „geht nicht: 5 → 3 zeigt dann nach oben“). Sonst ein Undo. | Handbuch S. 19; Lage über dem Ziel und Mitwandern = Auslegung |
| **R7** | Loslassen über einer **leeren Zelle** (c, r) | **Fallen:** alle Ziele von X werden gelöst; X fällt in Spalte c von Reihe r abwärts bis Reihe 0 (→ **Ausgang**) oder bis auf den obersten Operator Z darunter (→ Zelle über Z und Kante **X→Z**, „moduliert Z“); der obere Baum von X wandert mit und ist beim Fallen kein Hindernis; Abweisen wie R6(e). Sonst ein Undo. | Handbuch S. 19 („fall … to the bottom or to the nearest operator below“); Kante zu Z = Auslegung (I3) |
| **R8** | Loslassen außerhalb des Felds oder über der eigenen Zelle | nichts ändert sich | Zusatz |
| **R9** | **Zwei Finger:** beide Berührungen beginnen innerhalb 300 ms auf zwei verschiedenen Kacheln und bewegen sich ≤ 8 px | (a) verschiedene Reihen, nicht verbunden → Kante oben→unten (Fan-out/Fan-in), ein Undo; (b) schon verbunden → Kante lösen, wenn der obere Operator danach noch ein Ziel hat (Z7), sonst nichts und LCD „letzte Verbindung – zum Lösen ziehen“; (c) gleiche Reihe → nichts, LCD „gleiche Reihe – erst einen nach oben ziehen“; (d) Beginn > 300 ms auseinander → nichts (L4: zweiter Finger auf Rastern ignoriert) | Handbuch S. 19 (a); (b)–(d) Zusatz |
| ~~R10~~ | *entfällt (Review 2)* | Halten auf einer Kachel wählt nur (R1). Der Mod-Picker `op<k>` liegt unter ⋯ › „Modulieren mit …“ (Z13) | Handbuch S. 18–19 (Drücken = wählen) |
| **R11** | Wischen im Leerraum | nichts; Querformat mit mehr als 4 Reihen: rollt das Feld senkrecht (§5.2) | Spec 9.4 |
| **R12** | nach jeder Strukturgeste | `dxMatch` (Badge), Stimmen-Budget, LCD-Zeile; bei klingenden Noten **Stimmen-Überblendung 30 ms** (V4a, L3) | Spec 9.3/9.4 |
| **R13** | Stimme › Operatoren 6│7│8 | mehr: neue Operatoren mit `ol` 0 und Init-Werten in die freien Zellen von Reihe 0 von rechts; ist Reihe 0 voll, fallen sie nach R7 in Spalte 5; weniger: OP 7/8 werden mit ihren Kanten und Feedback-Bezügen entfernt, Operatoren ohne Ziel fallen nach R7; LCD nennt alles; ein Undo | EK-07 |

- **Vorlagen** ▾ (Algorithm Library, Handbuch S. 20): ersetzt Kanten und Plätze nach `dxLayout(k)`, Feedback-Empfänger/-Quelle laut DX-Tabelle; alle anderen Werte bleiben; bei 7–8 Operatoren kommen OP 7/8 stumm in die freien Zellen von Reihe 0; ein Undo.
- **Beispiele (Abnahme N7F-19 bis N7F-21):** INIT FM ist DX-Alg. 1 (2→1; 6→5→4→3). Kachel 5 in die leere Zelle (2, 3) ziehen → 5 fällt nach (2, 0) und wird Ausgang, 6 wandert nach (2, 1) mit → **DX-Alg. 5 in einer Geste**. Kachel 4 auf Kachel 3 (verbunden) → Tausch: 3 oben, 4 unten, Kanten 6→5→3→4.

### 4.6 LCD-Zeilen und Hilfe (L10)

- Beim Ziehen (laufend): „3 → 1 verbinden“ · „3 ↔ 1 tauschen“ · „3 fällt → Ausgang“ · „3 fällt auf 5 (moduliert 5)“ · „geht nicht: 1 moduliert schon 3 – dafür Feedback-Quelle“ · „kein Platz über 1“ · „zurück“. Ab V4d zusätzlich Etikett und 16 Spektralbalken der Vorhersage (Z9).
- Nach jeder Strukturgeste: „DX 5 ✓ · 6 Op · 8 St · Kanten 3/16“ bzw. „kein DX-Alg. · nächster: 3“ bzw. „wie DX 5 – Nummern anders“.
- Zwei Finger: „4 → 2 verbunden“ · „4 → 2 gelöst“ · Gründe aus R9. Doppeltipp: „OP 3 stumm“ / „OP 3 an“.
- Hilfe-Zeilen (Menü → Hilfe; LCD beim ersten Antippen):
  1. „Operator auf einen anderen ziehen: verbinden – oben moduliert unten. Schon verbunden: Plätze tauschen.“
  2. „Ins Leere loslassen: Der Operator fällt nach unten – auf den Boden (Ausgang) oder auf den Operator darunter.“
  3. „Zwei Finger gleichzeitig auf zwei Operatoren: zusätzliche Verbindung. Nochmal: lösen.“
  4. „Doppeltipp: stumm/an. Unterste Reihe = Ausgang.“
  5. „Nichts gewählt: Die Pegel-Seite stellt alle Operatoren; Farbe der Zeile = Farbe des Operators.“
  6. „Kleine Zahl oben rechts in der Kachel: Feedback-Quelle.“

### 4.7 Wertefeld (rechts)

**Zustand Stimme (nichts gewählt)** – Reiter (P1 als Block 2 × 3): **[Pegel] [Stimme] [⋯] / [Vorlagen ▾] [Zufall] [A│B]**.
- **Pegel** (Standard): je Operator eine **zweizeilige Wertzeile** (P1 132 × 44, sonst 34 hoch): Zeile 1 (11 px) „×14 · I 1,6“ (Modulator) bzw. „×1 · −3 dB“ (Ausgang); Zeile 2 Balken über die ganze Breite bis auf eine feste **Wertzone** von 30 px rechts (Zahl `ol` 13 px, tabellarische Ziffern, #47CA0A auf dem Zeilengrund #1A1C24, *gerechnet* 7,9:1). Die Füllung läuft nie unter die Zahl. Rechts außen die **Fahne** (12 px) in der OP-Farbe mit der Nummer; die Nummer steht nur dort (Ersatz für die Hardware-Regler, Handbuch S. 18; Farben §4.3). Zug ändert `ol` (Relativzug, „Schieber“ unten); die Balkenlänge folgt bei Modulatoren der V0d-Kurve p = (OL/99)^(1/0,45), bei Ausgängen linear (N4b-03). Ein Undo je Zug. P1: 6 Zeilen à 44; bei 7–8 Operatoren 8 Zeilen à 34 (Abstand 1), kein Umblättern.
- **Stimme:** 1 Operatoren [6│7│8] (R13) · 2 Transponieren (`fmx.trans` = `fm6.trans`, ±24) · 3 DX-Abgleich (Badge, [DX-tauglich machen] ab V4d, [Nummern angleichen]) · 4 Budget „6 Op · 8 St · Kanten 3/16“ (L9) · 5 ☑ Frequenzen in Kacheln · 6 ☑ Linien-Animation.
- **Vorlagen ▾:** WP7-Algorithmus-Blatt mit 32 Bildern (§4.5).
- **Zufall:** Blatt mit ☑ Frequenzen ☑ Hüllkurven ☑ Tonhöhen-Hk. ☑ Algorithmus ☑ Pegel ☑ Wellen und [Würfeln] (Handbuch S. 20). **☑ Algorithmus** wählt k ∈ 1…32 zufällig und setzt Kanten, Plätze und Feedback nach `dxLayout(k)` wie [Vorlagen] („Algo for the algorithm (selected from the algorithm library)“, Handbuch S. 20); ohne ☑ Algorithmus bleibt die Struktur. Ergebnis erfüllt I1–I5 und hat mindestens einen Ausgang mit `ol` ≥ 80; ein Undo.
- **A│B:** Vergleich mit dem Stand vor der letzten Geste (V4b-09).

**Zustand Operator (Kachel gewählt)** – Kopf „OP 4 · MODULATOR → 3 · ×14“ bzw. „OP 1 · AUSGANG“ (Rollenfarbe, ≥ 15 px fett wie A.4b Punkt 1; P1 im Feld-Kopf, L im Wertefeld-Kopf) · Reiter **[Basis] [Amp] [M] / [Mod] [Tonh.] [⋯]**; **⋯** enthält **Solo · Ziele · Kopieren · Einfügen · Mehrere wählen · Modulieren mit …** (in allen Größen gleich; Solo ist Laufzeit und selten, M bleibt auch als Doppeltipp).

| Seite | Zeilen (P1: 6 × 44 px, zweizeilig wie die Pegel-Seite) | Beleg |
|---|---|---|
| **Basis** | 1 **Welle** „∿ Name“ mit Mini-Vorschau – Tipp öffnet die Liste mit Vorschau (‹ › nur im Querformat, je 36 px) · 2 **Pegel** (`ol`, Anzeige wie Pegel-Seite) · 3 **Verhältnis**, zweizeilig: obere Hälfte links Chip [×│Hz] (40 px, Tipp schaltet `fixed`), Rest Zug = `fine` 0…99; untere Hälfte Zug = `coarse` in DX-Schritten; Tipp auf die Wertzone = Raster ab V4d, davor Ziffernblock · 4 **Verstimmung** (`det` −7…+7, Doppeltipp = 0) · 5 **Phase**: Chip 40 px links „Fest/Zuf./Frei“ (Tipp schaltet weiter), Rest Zug = `ph` 0…127 · 6 **Feedback**: links 40 px „← 6“ (Tipp öffnet die Quellen-Liste aus/1…n), Rest Zug = `fbAmt` 0…7 in 0,1. Sonst öffnet ein Tipp auf die Wertzone (rechte 30 px) den Ziffernblock. FEIN ist überall ×¼ (vertauscht nicht mehr `coarse`/`fine`) | Handbuch S. 11, 27–28 |
| **Amp** | Hüllkurven-Editor (§4.11): P1 Mini-Feld links, Hüllkurve rechts (EK-13, §5.1 d), L im Wertefeld | Handbuch S. 28–29, 31–33 |
| **Mod** | 1 Anschlag −7…+7 (bipolar, Doppeltipp = 0) · 2 LFO AM 0…127 · 3 LFO FM 0…127 · 4–6 **Tasten-Skalierung** als Kurve: Griff links senkrecht = `ld`, rechts = `rd` (Richtung nach oben/unten = Kurve +/−), Mitte waagrecht = `bp` mit Notenname („C4“); `lc`/`rc` (lin/exp) über ⋯ | Handbuch S. 29–30; Bild S. 19 |
| **Tonh.** | Tonhöhen-Hüllkurve (Editor wie Amp, bipolar) + Bereich [DX│Ton│Quinte│1│2│4│8 Okt.] | Handbuch S. 30–31 |
| **M** / ⋯ › **Solo** | stumm (= R3) / Solo zur Laufzeit, nicht gespeichert: Solo-OP klingt als Ausgang, alle anderen still (wie V0d [Solo]) | Handbuch S. 19, 27 |
| **⋯ › Ziele** | Liste der Kanten des OP: „→ 1 · ✕“ und [+ Ziel] (danach eine tiefere Kachel antippen); ✕ auf der letzten Kante → OP fällt nach R7. **Keine Tiefe je Kante:** die Stärke ist der Pegel des Modulators, sein Ausgang geht unverändert an jedes Ziel (Handbuch S. 12–13) | Z6 |
| **⋯ › Modulieren mit …** | Mod-Picker `op<k>` (L4; bisher Halten, R10) | Z13 |
| **⋯ › Kopieren / Einfügen** | ganzer Operator (alle Werte außer Zelle, Kanten), nur Hüllkurve | Handbuch S. 7, 29 |
| **⋯ › Mehrere wählen** | N4b-02 (Rahmen um gewählte Kacheln; Pegel relativ, Raster und Hüllkurve absolut) | N4b-02 |

**Schieber im Wertefeld** (Handbuch S. 11; Touch-Eingabe = **Auslegung**): **Relativzug** mit Pointer-Capture, 4 px Totzone, kein Sprung beim Aufsetzen. **Hochformat senkrecht** (hoch = mehr; der Finger darf das Wertefeld verlassen), 2 px je Schritt für `ol` und 0…127-Werte, 4 px je Schritt für `det`, `vs` und `fbAmt` (0,1); **Querformat waagrecht** mit derselben Verstärkung. FEIN ×¼ (ruhender zweiter Finger nach R0 oder Chip; Z12). Tipp = Loslassen innerhalb der Totzone. Bipolare Werte haben Mittelstrich und Doppeltipp = Mitte. **Ziffernblock:** Tipp auf die Wertzone (rechte 30 px) öffnet ihn; er setzt den Wert exakt, ein Undo (Ersatz für Main Dial, Inc/Dec und „virtual keypad“, Handbuch S. 7, 11). Optik: Petrol-Füllung (#0A6E5B) in Zeile 2 von links bzw. ab der Mitte, nie unter der Wertzone; Name weiß in Zeile 1; Wert grün (#47CA0A) in der Wertzone wie Bild S. 15–19.

### 4.8 Feedback

- Jeder Operator hat `fbSrc` (0 = aus, 1…n, auch sich selbst) und `fbAmt` (0…7 in 0,1, N4a-01: das Worklet rechnet `2^(fbAmt−8)`).
- Der **Empfänger** zeigt das Badge mit der **Quellnummer** (Handbuch S. 13). Die Quelle darf tiefer liegen (Kette mit Feedback von unten nach oben, Handbuch S. 13).
- Worklet: Selbst-Feedback wie DX (2-Sample-Mittel, msfa); fremde Quelle mit 1 Sample Verzögerung (Spec 9.3, unverändert).
- DX-Alg. 4 und 6 sind damit genau abbildbar: Empfänger 6, Quelle 4 bzw. 5 (Tabelle `DX_ALGS`, V0a Z. 2557).
- Jeder aktive Feedback-Weg zählt als Kante (I5).

### 4.9 Operatorzahl

- Standard **6** (Init, Vorlagen, Import). Zuschaltbar **7 und 8** (R13). Stimmen: 6 Op → 8 Stimmen, 7–8 Op → 6, mehr als 12 Kanten → 4 (§9.1, unverändert); der Kopf nennt den Grund (L9).
- Raster bleibt 6 × 6 (EK-07): höchstens 6 Ausgänge und 6 Reihen. Die 32 DX-Algorithmen brauchen höchstens 6 Spalten und 4 Reihen (*gerechnet*).

### 4.10 Wellen

- `wave` 0…47 je Operator. **0 = Sinus** über den bisherigen Sinus-Pfad (bitgleich zu `fm6`).
- **Werkswellen 1…11** (Namen und Reihenfolge nach Bild S. 61; Formen sind **eigene Festlegung**, das Handbuch zeigt nur Sine und SSine): 1 Säge 1 (Teiltöne 1…16, Stärke 1/n) · 2 Säge 2 (1…6, 1/n) · 3 Dreieck (ungerade 1…15, 1/n², wechselnde Vorzeichen) · 4 Rechteck (ungerade 1…15, 1/n) · 5 Halbsinus (positive Halbwelle, negative null, Gleichanteil entfernt) · 6 Puls 25 % (1…16) · 7 Harm 1 (Teiltöne 1, 2, 4 mit 1, ½, ¼) · 8 Harm 2 (1, 3, 5 mit 1, ⅓, ⅕) · 9 Schiefer Sinus (Spitze bei 30 %, Tal bei 70 %, wie Bild S. 62) · 10 Schiefer Sinus 2 (Spitze 37 %, Tal 63 %) · 11 Rausch-Welle (512 Zufallswerte, fester Startwert). Alle auf Spitze 1 normiert.
- Format: **512 Samples je Welle, lineare Interpolation** (Handbuch S. 70, 74). Werkswellen werden beim Start gerechnet (12 × 512 × 4 Byte = 24 KB, *gerechnet*), nicht gespeichert. Ab V4e sind die Werkswellen **1…11 bearbeitbar** wie bei EssenceFM („48 user-editable waveforms“, Handbuch S. 2; „The EssenceFM has 48 editable waveforms“, S. 61): die erste Änderung legt eine Kopie mit demselben Index in `project.waves` an (copy-on-write); [Zurücksetzen] löscht die Kopie und stellt die Werkswelle her (entspricht Clear, das bei EssenceFM auf Sinus zurücksetzt, S. 61). **Welle 0 (Sinus) bleibt fest** – bewusste **Abweichung D1** (§4.13): sie läuft über den bitgleichen Sinus-Pfad von `fm6` (N7F-02/03, §6.4); das Handbuch warnt selbst vor einer versehentlich veränderten Sine (S. 81). Frage F-7.
- Eigene Wellen 12…47 und geänderte Werkswellen 1…11 (V4e): im Projekt (`project.waves`), beim Sichern in die Bibliothek als Kopie im Sound („Child Elements“, Handbuch S. 68).
- Wellen klingen wie bei EssenceFM ohne Bandbegrenzung („aliasing limit is easily exceeded“, Handbuch S. 14). Ein Aliasing-Schutz mit Mip-Tabellen kommt mit V8a (Tabellen-Oszillator) als Zusatz.
- Die LFO-Wellen der App bleiben unberührt.

### 4.11 Hüllkurven (Abgleich mit A.4b)

- **Formen (EK-10):** Jede Hüllkurve `amp` und `pit` eines Operators hat die **DX-Form** `{f:'dx', r[4], l[4]}` (A.4b: msfa-genau mit Haltephase; Init R 99 99 99 80 · L 99 99 99 0) oder die **Punkt-Form** `{f:'pt', …}` (EssenceFM). `fmxFromFm6`, Vorlagen und neue Operatoren liefern die DX-Form.
- **Ein Editor:** A.4b `fmEnvEditor` (logarithmische Zeitachse „Halten ┊ Release“, ms und DX-Rate, Klick-Grenze, FEIN, Vorlagen Snap/Pluck/Pad/Orgel, Auf alle …) wird erweitert um die **EssenceFM-Knöpfe** (Handbuch S. 33):
  - Punkt gewählt: **[Sustain] [Loop A] [Loop B] [Loop weg] / [✗] [+] [Mitte] [Skip]** – [+] fehlt bei 6 Punkten, [✗] bei 2; **[Mitte]** nur bei Tonh. (Center Point); **[Skip]** ist ein Häkchen und nur sichtbar, wenn der gewählte Punkt der Sustain-Punkt ist (schreibt `skip`, „Skip on Release“); **[Loop weg]** nur sichtbar, wenn der gewählte Punkt `la` oder `lb` ist (setzt `la` = `lb` = −1, „Remove Loop“, ein Undo); unsichtbare Knöpfe lassen ihren Platz leer (Lage fest) (Handbuch S. 33; violetter Knopf im Bild S. 27);
  - nichts gewählt: **[Exp│Lin] [Skala] [Retrig│Frei] [+] / [Alle Mod.] [Alle Ausg.] [Kopieren] [Einfügen]**; die Umschalter zeigen nur den aktuellen Zustand („Exp“, „Retrig“ wie Bild S. 29);
  - **FEIN:** Chip in der Vorlagen-Zeile (P1) bzw. in der Knopfspalte (L); sonst ruhender zweiter Finger (R0);
  - Fußzeile „Gesamt 1,3 s“ bzw. bei gewähltem Punkt „X 177 ms · Y 37“ (Bild S. 32);
  - **Pinch** (beide Finger bewegen sich, Abstand ändert sich ≥ 12 px) zoomt die Zeitachse ×1…×8 (Handbuch S. 32); ein ruhender zweiter Finger bleibt FEIN.
- **DX-Form im Editor:** Punkte = Start (L4) · L1 · L2 · L3 (Sustain, fest) · L4 nach dem Loslassen; Ziehen ändert Raten und Pegel genau nach A.4b (Punkt 4 b–d). Die DX-Zeile R1–R4/L1–L4 bleibt.
- **Wechsel in die Punkt-Form** durch eine Aktion, die DX nicht kann: [+], Sustain auf einen anderen Punkt, Loop A/B, Lin, Frei, Skala, bei Tonh. ein Bereich außer „DX“. Die Punkte übernehmen die angezeigten Zeiten und Pegel (Klang vorher/nachher ≤ 1 dB, N7F-45); LCD „Hüllkurve frei (EssenceFM-Form) – nicht mehr DX“; ein Undo stellt die DX-Form deep-equal her. Rückweg nur über [DX-tauglich machen] (V4d, Näherung mit angezeigter Abweichung).
- **Punkt-Form, Verhalten** (Handbuch S. 32–33):
  - Punkte P0…Pk (k ≤ 5), Pegel `y` 0…99 (Amp: DX-Pegelskala ≈ 0,75 dB je Schritt; Tonh.: 50 = 0), Segmentzeiten `t` 0,5 ms … 20 s;
  - **Exp** = Pegel im DX-Pegelraum linear über die Zeit (dB-linear wie der msfa-Abfall); **Lin** = Amplitude linear; gilt für die ganze Hüllkurve;
  - **Sustain** `sus`: hält auf Psus bis zum Loslassen; danach laufen die Segmente nach Psus;
  - **Skip on Release** `skip` (nur bei Sustain): Loslassen vor Psus → sofort weiter mit dem Segment nach Psus, ab dem aktuellen Pegel (kein Sprung). **Auslegung** des missverständlichen Wortlauts „skip to the sustain point“;
  - **Loop** `la`/`lb`: Erreichen von Plb → weiter mit dem Segment nach Pla, ab dem aktuellen Pegel; Loop vor Sustain endet beim Loslassen, Loop nach Sustain läuft weiter bis zur 12-s-Kappe (V0a Z. 2592) mit Warnchip „Ausgang endet nicht (Schleife)“;
  - **Frei** (FreeRun): eine gemeinsame Hüllkurve je Spur und Operator, gestartet beim ersten Anschlag; ohne Loop erst nach ihrem Ende neu; Sustain ist dann aus;
  - **Skala:** Blatt mit „Zeit ×0,25…4“ und „Höhe ×0…1,5“, wirkt auf alle Punkte, ein Undo;
  - Ein Ausgang, dessen letzter Punkt > 0 liegt: Warnchip „Ausgang endet nicht bei 0 – Note klingt bis zur Kappe“ (Handbuch S. 29, 81).
- **Tonhöhen-Hüllkurve je Operator** (Handbuch S. 30–31): DX-Form immer mit Bereich `pr` 'dx' (A.4b-PEG-Tabellen, ±4 Okt.); Punkt-Form mit Ton (±2 HT), Quinte (±7 HT), 1, 2, 4 oder 8 Okt.; y 0 / 50 / 99 = −Bereich / 0 / +Bereich, linear in Halbtönen; wirkt nur auf Operatoren mit Verhältnis (DX-Regel aus A.4b; das Handbuch sagt dazu nichts). `fm6.peg` wird beim Übergang in jeden Verhältnis-Operator kopiert.
- **A.4b Punkt 11 eingelöst:** Pitch-EG je Operator → hier · Anschlag ± → `vs` −7…+7 · Time/Key ± → `rs` (für beide Formen) · Zeit-Format → Punkt-Form in ms · Hold Time je Operator → Punkt-Form (flaches erstes Segment), kein eigener Parameter · DX-LFO mit AMS je Operator und Key-Sync → V4a (`lfoAm`, `phm`, §6.3) · ECO mit echter PM → V4a (unverändert) · Hüllkurven-Wahl aus dem FELD → Aktionszeile · **Mehrpunkt-Hüllkurven mit Schleife → V4c (statt §18)** · Spektralformen und Hüllkurven als Mod-Quelle → bleiben §18 (EssenceFM hat Hüllkurven als Matrix-Quellen, Handbuch S. 24; Empfehlung für eine spätere V5d-Ergänzung).

### 4.12 DX-/Klassik-Modus

- Unterseiten bleiben **FELD · DX · OP · MAKRO · STIMME** (N4b-01). DX ist die WP7-ALGO-Seite mit den V0d-Korrekturen, OP die A.4b-Operator-Seite; beide bearbeiten `p.fm6`. Das FELD bearbeitet `p.fmx`; ist der Klang DX-tauglich, wird `p.fm6` mitgeschrieben (§9.2, unverändert).
- Nicht DX-tauglich → DX und OP zeigen den nächsten DX-Algorithmus gesperrt, mit der Liste der Gründe (`fmxDx().reasons`), und [DX-tauglich machen] (V4d).
- **Nummern:** `dxMatch` prüft zuerst die eigene Nummerierung. Passt die Form nur mit anderer Nummerierung, zeigt der Badge „wie DX 5 – Nummern anders“ und [Nummern angleichen] benennt die Operatoren um (Plätze, Werte und Kanten wandern mit; ein Undo). So haben FELD und DX-Seite immer dieselben Nummern.

### 4.13 Zusätze ohne Widerspruch (Z) und verworfene Spec-Teile (X)

**Zulässige Zusätze** – sie ändern keine EssenceFM-Regel:

| # | Zusatz | warum kein Widerspruch |
|---|---|---|
| Z1 | Vorschau beim Ziehen (Geist, Geisterlinien, LCD) | zeigt nur die EssenceFM-Wirkung vor dem Loslassen |
| Z2 | Bodenlinie „AUSGANG“ unter Reihe 0 | reine Anzeige; Ablegen bleibt „Fallen“ |
| Z3 | Feedback an jedem Operator | gleiche Darstellung (Badge) und Bedienung (Wert) wie an OP 1/2 |
| Z4 | 7 und 8 Operatoren | Standard bleibt 6; gleiche Regeln |
| Z5 | Pegelbalken mit zwei Teilen (Wert dunkel, Live hell) | Handbuch nennt beides (Handbuch S. 18) |
| Z6 | Ziele-Liste im Wertefeld (Lösen ohne Bewegen, Ziel hinzufügen), **ohne Tiefe je Kante** | keine neue Geste im Feld; die Stärke bleibt der Pegel des Modulators (Handbuch S. 12–13) |
| Z7 | Zwei Finger auf verbundenem Paar = lösen | Handbuch beschreibt den Fall nicht |
| Z8 | [A│B], ein Undo je Geste | entspricht Undo/Recall-Vergleich (Handbuch S. 7–8) |
| Z9 | Vorhersage, Verhältnis-Raster (V4d) | Anzeige bzw. Eingabehilfe im Wertefeld |
| Z10 | DX-Seite, OP-Seite, MAKRO, .syx-Export | eigene Unterseiten, das FELD bleibt EssenceFM |
| Z11 | Stimmen-Überblendung 30 ms bei Strukturänderung | nur Klang, keine Bedienung |
| Z12 | FEIN (ruhender Finger nach R0, Chip), Ziffernblock (Tipp auf die Wertzone) | Ersatz für Regler, Main Dial, Inc/Dec und „virtual keypad“ (Handbuch S. 7, 11) |
| Z13 | Mod-Picker unter ⋯ › „Modulieren mit …“ | eigener Menüpunkt; Drücken und Halten auf Kacheln bleibt EssenceFM (R1) |
| Z14 | A.4b-Editor: ms + DX-Rate, Klick-Grenze, Vorlagen, Auf alle … | log. Zeitachse wie EssenceFM, mehr Anzeige |
| Z15 | Warnchips statt hängender Noten; 12-s-Kappe | EssenceFM warnt im Text (Handbuch S. 29, 81) |
| Z16 | Linien-Animation folgt „Bewegung reduzieren“ | Option wie S. 67 |
| Z17 | Eigene und geänderte Wellen je Projekt (copy-on-write), Mitnahme in die Bibliothek | Vorrat, Index und Bearbeitbarkeit wie EssenceFM; nur der Speicherort ist das Projekt statt des Geräts (Welle 0 siehe D1) |
| Z18 | Mehrfachauswahl (N4b-02) über ⋯ | eigener Modus, Feld-Gesten unverändert |

**Bewusste Abweichungen (D)** – ändern eine EssenceFM-Regel; jede hat einen Grund und eine Frage an Xander:

| # | Abweichung | Grund | Frage |
|---|---|---|---|
| D1 | Welle 0 (Sinus) ist nicht bearbeitbar (EssenceFM: alle 48 Wellen bearbeitbar, Handbuch S. 2, 61) | bitgleicher Sinus-Pfad zu `fm6` (N7F-02/03, DX-tauglich §6.4); das Handbuch warnt selbst vor einer versehentlich veränderten Sine (S. 81) | F-7 |

**Verworfen** – widerspricht EssenceFM oder wird durch eine EssenceFM-Lösung ersetzt:

| # | Spec-Teil (§9.4 / V4b) | Ersatz |
|---|---|---|
| X1 | Magnet-Zonen OBEN/UNTEN/NEBEN/MITTE | R5/R6 (Wirkung vom Ziel-Operator und vom Zustand) |
| X2 | Leerraum = zurückschnappen | R7 Fallen |
| X3 | „Bewegen ändert nie Verbindungen“ | R6/R7 lösen die unteren Verbindungen |
| X4 | Schiene als Ablageziel, `out[]` | Reihe 0 = Ausgang, Boden nur Anzeige |
| X5 | Parkplatz, `park[]` | stumm (R3) |
| X6 | [+]-Operator ins Feld ziehen | Operatoren 6│7│8 (R13) |
| X7 | Anfasser ● an jeder Kachel, orange Feedback-Kante | Zwei Finger (R9), Ziele [+] (Z6), Feedback-Wert mit Badge |
| X8 | Buchstaben A–H | Nummern 1–8 |
| X9 | Ring (Index/dB), Hüllkurven-Miniatur in der Kachel | Frequenz + Pegelbalken; Index im Wertefeld |
| X10 | Halbreihen, Knick, Auto-Layout | freies 6 × 6-Raster |
| X11 | Kontextzeile unten (44 px), Vorhersage-Zeile (28 px) | Wertefeld rechts; Vorhersage im LCD |
| X12 | Linie antippen = Tiefe/Lösen | Tipp ins Leere = Stimme (R2); Ziele-Liste |

---

## 5. Mockups mit Pixel-Budgets

Schematisch (nicht maßstäblich); die verbindlichen Maße stehen in den Tabellen. Beispiel: DX-Alg. 5 (2→1, 4→3, 6→5, Feedback 6←6). Zeichen: `█` Pegelbalken voll, `▌` niedrig, `[6]` Feedback-Badge, `╔═╗` gewählt (petrol), `▐▀Pegel▀▌` aktiver Reiter, `▕…▏◀1` Wertzeile mit Fahne in OP-Farbe, `┈` Geist.

### 5.1 Hochformat P1 390 × 844 – Körper 374 × 365 px (wie A.4b `.pg` 365, V0a gemessen)

**a) Nichts gewählt (Pegel-Seite)**
```
┌─────────────────────────────────────────────────┬────────────────────────────┐
│ STIMME · DX 5 ✓ · 6 Op · 8 St                   │                            │
│                                                 │ ▐▀Pegel▀▌[ Stimme][   ⋯   ]│
│                                                 │                            │
│ ·       ·       ·       ·       ·       ·    R5 │                            │
│                                                 │ [ Vorl.▾][ Zufall][  A│B  ]│
│                                                 │                            │
│                                                 │                            │
│                                                 │                            │
│ ·       ·       ·       ·       ·       ·    R4 │ ▕1 ×1 ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒99▏◀1 │
│                                                 │                            │
│                                                 │                            │
│                                                 │                            │
│                                                 │ ▕2 ×1 ▒▒▒▒▒▒▒▒▒▒▒    72▏◀2 │
│ ·       ·       ·       ·       ·       ·    R3 │                            │
│                                                 │                            │
│                                                 │                            │
│                                                 │ ▕3 ×1 ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒99▏◀3 │
│                                                 │                            │
│ ·       ·       ·       ·       ·       ·    R2 │                            │
│                                                 │                            │
│                                                 │ ▕4 ×14▒▒▒▒▒▒▒▒       58▏◀4 │
│                                                 │                            │
│ ┌─────┐ ┌─────┐ ┌───[6]                         │                            │
│ │  2  │ │  4  │ │  6  │                      R1 │                            │
│ │▌×1  │ │▌×14 │ │▌×1  │                         │ ▕5 ×1 ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒99▏◀5 │
│ └──┬──┘ └──┬──┘ └──┬──┘                         │                            │
│    │       │       │                            │                            │
│ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐                         │                            │
│ │█ 1  │ │█ 3  │ │█ 5  │                      R0 │ ▕6 ×1 ▒▒▒▒▒▒▒▒       61▏◀6 │
│ │█×1  │ │█×1  │ │█×1  │                         │                            │
│ └─────┘ └─────┘ └─────┘                         │                            │
│━━━━━━━━━━━━━━━━━━ AUSGANG ━━━━━━━━━━━━━━━━━━━━━ │                            │
└─────────────────────────────────────────────────┴────────────────────────────┘
```

Die Wertzeilen sind hier verkürzt gezeichnet; verbindlich ist die zweizeilige Form aus §4.7 (Zeile 1 „×1 · −0 dB“, Zeile 2 Balken + Wertzone 30 px, Fahne rechts).

**b) OP 4 gewählt, Seite Basis**
```
┌─────────────────────────────────────────────────┬────────────────────────────┐
│ OP 4 · MODULATOR → 3 · ×14                      │                            │
│                                                 │ ▐▀Basis▀▌[  Amp  ][   M   ]│
│                                                 │                            │
│ ·       ·       ·       ·       ·       ·    R5 │                            │
│                                                 │ [  Mod  ][ Tonh. ][   ⋯   ]│
│                                                 │                            │
│                                                 │                            │
│                                                 │                            │
│ ·       ·       ·       ·       ·       ·    R4 │ ▕Welle ∿ Sinus ‹›        0▏│
│                                                 │                            │
│                                                 │                            │
│                                                 │                            │
│                                                 │ ▕Pegel  I 3,1▒▒▒▒▒▒▒▒▒  83▏│
│ ·       ·       ·       ·       ·       ·    R3 │                            │
│                                                 │                            │
│                                                 │                            │
│                                                 │ ▕Verh. ×14 [×│Hz]         ▏│
│                                                 │                            │
│ ·       ·       ·       ·       ·       ·    R2 │                            │
│                                                 │                            │
│                                                 │ ▕Verstimmung▒            0▏│
│                                                 │                            │
│ ┌─────┐ ╔═════╗ ┌───[6]                         │                            │
│ │  2  │ ║░░4░░║ │  6  │                      R1 │                            │
│ │▌×1  │ ║▌×14░║ │▌×1  │                         │ ▕Phase 0 [Fest]           ▏│
│ └──┬──┘ ╚══┬══╝ └──┬──┘                         │                            │
│    │       │       │                            │                            │
│ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐                         │                            │
│ │█ 1  │ │█ 3  │ │█ 5  │                      R0 │ ▕FB ← aus                0▏│
│ │█×1  │ │█×1  │ │█×1  │                         │                            │
│ └─────┘ └─────┘ └─────┘                         │                            │
│━━━━━━━━━━━━━━━━━━ AUSGANG ━━━━━━━━━━━━━━━━━━━━━ │                            │
└─────────────────────────────────────────────────┴────────────────────────────┘
```

**c) Ziehen: OP 6 (gewählt, angehoben) wird über der leeren Zelle (3, 3) gehalten → Geist zeigt den Landeplatz (3, 0)**
```
┌─────────────────────────────────────────────────┬────────────────────────────┐
│ OP 6 · MODULATOR → 5 (wird gezogen)             │                            │
│                                                 │ ▐▀Basis▀▌[  Amp  ][   M   ]│
│                                                 │                            │
│ ·       ·       ·       ·       ·       ·    R5 │                            │
│                                                 │ [  Mod  ][ Tonh. ][   ⋯   ]│
│                                                 │                            │
│                                                 │                            │
│                                                 │                            │
│ ·       ·       ·       ·       ·       ·    R4 │ ▕Welle ∿ Sinus ‹›        0▏│
│                                                 │                            │
│                                                 │                            │
│                                                 │                            │
│                         ╔═══[6]                 │ ▕Pegel  I 0,8▒▒▒        61▏│
│ ·       ·       ·       ║░░6░░║ ☝ (3,3) leer R3 │                            │
│                         ║▌░×1░║                 │                            │
│                         ╚═════╝                 │                            │
│                                                 │ ▕Verh. ×1 [×│Hz]          ▏│
│                                                 │                            │
│ ·       ·       ·       ·       ·       ·    R2 │                            │
│                                                 │                            │
│                                                 │ ▕Verstimmung▒            0▏│
│                                                 │                            │
│ ┌─────┐ ┌─────┐ ┌┈┈┈[6]                         │                            │
│ │  2  │ │  4  │ ┊  6  ┊ ← alte Zelle         R1 │                            │
│ │▌×1  │ │▌×14 │ ┊▌×1  ┊                         │ ▕Phase 0 [Fest]           ▏│
│ └──┬──┘ └──┬──┘ └┈┈┬┈┈┘                         │                            │
│    │       │       ┊                            │                            │
│ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐ ┌┈┈┈┈┈┐                 │                            │
│ │█ 1  │ │█ 3  │ │█ 5  │ ┊Geist┊              R0 │ ▕FB ← 6 · Stärke▒▒▒      5▏│
│ │█×1  │ │█×1  │ │█×1  │ ┊  6  ┊                 │                            │
│ └─────┘ └─────┘ └─────┘ └┈┈┈┈┈┘                 │                            │
│━━━━━━━━━━━━━━━━━━ AUSGANG ━━━━━━━━━━━━━━━━━━━━━ │                            │
└─────────────────────────────────────────────────┴────────────────────────────┘
```
LCD: „6 fällt → Ausgang“. Die alte Zelle (2, 1) ist gestrichelt, die Kante 6→5 (gestrichelt) wird beim Loslassen gelöst; 6 landet in (3, 0) als Ausgang (R7). Ein Undo. Das Wertefeld zeigt schon beim Drücken OP 6 (Handbuch S. 18: „When you press on an operator to move it or edit it …“).

**d) OP 4 gewählt, Seite Amp (EK-13: Mini-Feld links, Hüllkurve rechts)**
```
┌─────────────────────────────────────────────────┬────────────────────────────┐
│ OP 4 · MODULATOR → 3 · AMP                      │ [ Basis ]▐▀▀Amp▀▀▌[   M   ]│
│                                                 │                            │
│ [ Snap ][Pluck ][ Pad  ][Orgel ][ FEIN ]        │ [  Mod  ][ Tonh. ][   ⋯   ]│
├──────────────────┬──────────────────────────────┴────────────────────────────┤
│ ·  ·  ·  ·  ·  · │ ,5 1ms  10  100  1s  10s ┊ 1ms  10  1s                    │
│ ·  ·  ·  ·  ·  · │ 1╲                       ┊                                │
│ ·  ·  ·  ·  ·  · │ │ ╲____2━━━━━━━━━━━━━━━3┊╲                                │
│ ·  ·  ·  ·  ·  · │ │░░                     ┊ ╲____                           │
│ ▌2 ╔4╗ ▌6        │ ◘                       ┊      4                          │
│  │  ║   │        │ A 0,5 · D1 43 · D2 124 · R 327 ms · Gesamt 0,5 s          │
│ █1 █3  █5        │ [Sustain ][ Loop A ][ Loop B ][Loop weg]                  │
│ ━━━━━━━━━━━━━━━━━│ [   ✗    ][   +    ][ (Mitte)][ (Skip) ]                  │
│                  │ [ R1 99  ][ R2 68  ][ R3 35  ][ R4 60  ]                  │
│                  │ [ L1 99  ][ L2 72  ][ L3 70  ][ L4  0  ]   (DX-Form)      │
└──────────────────┴───────────────────────────────────────────────────────────┘
```
Mini-Feld: Tipp wählt (R1), Doppeltipp schaltet stumm (R3), Tipp ins Leere zurück zur Pegel-Seite (R2); Ziehen und Zwei Finger sind hier gesperrt (LCD „Ziehen auf der Seite Basis“). (Mitte) nur bei Tonh., (Skip) nur am Sustain-Punkt, [Loop weg] nur an einem Loop-Punkt. Nichts gewählt: [Exp][Skala][Retrig][+] / [Alle Mod.][Alle Ausg.][Kopieren][Einfügen]. Punkt-Form: Zeilen 3–4 zeigen P0–P3 / P4–P5.


**Geometrie P1** (Körper-Koordinaten, x 0 = linke Innenkante, y 0 = Körper-Oberkante; Budget 365 px = A.4b `.pg` P1, V0a gemessen):

| Element | x | y | Größe / Regel |
|---|---|---|---|
| FELD | 0–235 | 0–364 | 236 × 365 |
| Feld-Kopf (Rolle bzw. „STIMME · DX …“) | 0–235 | 0–17 | 15 px fett |
| Kacheln | x = 40·c (c 0…5) | y = 23 + 55·(5 − r) (r 0…5; Reihe 0: 298–347) | **36 × 50**, Abstand 4 / 5; Treffer 40 × 54 |
| Boden „AUSGANG“ | 0–235 | 353–364 | Linie 2 px + Text 10 px |
| WERTE | 242–373 | 0–364 | 132 × 365 |
| Reiterblock | 242 / 287 / 332 | 0–33 und 38–71 | 6 × (42 × 34), Abstand 3 / 4; Stimme [Pegel][Stimme][⋯] / [Vorlagen ▾][Zufall][A│B]; Operator [Basis][Amp][M] / [Mod][Tonh.][⋯] |
| Wertzeilen | 242–373 | 76 + 47·i (i 0…5; letzte 311–354) | 132 × 44, zweizeilig (§4.7): Zeile 1 11 px, Zeile 2 Balken + Wertzone 30 px; Fahne 12 × 44 rechts (Pegel-Seite); bei 7–8 OP 8 × (132 × 34) bei y = 76 + 35·i |
| *Amp/Tonh.:* Feld-Kopf, Vorlagen | 0–235 | 0–17 · 38–71 | Kopf „OP 4 · MODULATOR → 3 · AMP“; 5 × (44 × 34), Abstand 4: Snap · Pluck · Pad · Orgel · FEIN |
| *Amp/Tonh.:* Mini-Feld | 0–131 | 76–363 | Zelle 22 × 46 (x = 22·c, y = 76 + 46·(5 − r)), Kachel 20 × 42: Nummer 11 px fett, Balken 3 px (Pegel + Live), Badge 8 × 8, keine Frequenz; Linien wie §4.4; Boden 352–363; Treffer = ganze Zelle; nur R1–R3 (L4-Ausnahme in der Breite, nur Tipp) |
| *Amp/Tonh.:* Lineal | 138–373 | 76–87 | 12 |
| *Amp/Tonh.:* Graph | 138–373 | 88–204 | 236 × 117; Halten 160 · Lücke 8 · Release 68; Pinch ×1…×8 |
| *Amp/Tonh.:* Zeiten-Zeile | 138–373 | 205–220 | 16, reine Anzeige |
| *Amp/Tonh.:* Knopfzeilen | 138–373 | 223–256 · 259–292 | 2 × 4 × (56 × 34), Abstand 4 / 2 (§4.11) |
| *Amp/Tonh.:* DX-/Punkt-Zeilen | 138–373 | 295–328 · 331–364 | DX: R1–R4 / L1–L4 je 4 × (56 × 34); Punkt-Form: P0–P3 / P4–P5 |
| Punkt-Treffer | 138–373 | 76–220 | 44 × 44 um den Punkt, am Rand dieses Bereichs abgeschnitten; innerhalb gewinnt der Punkt (Vorlagen-Zeile und Knopfzeilen liegen außerhalb) |
| **Summe** | | | **365 px** (Feld: 18 + 5 + 330 + 12; Werte: 72 + 4 + 279 + 10 frei; Amp: 76 + 12 + 117 + 16 + 2 + 34 + 2 + 34 + 2 + 34 + 2 + 34) |

Der Reiterblock steht auf allen Seiten an derselben Stelle (L3, ±0 px).

### 5.2 Querformat L1 844 × 390 – Körper 828 × 150 px (wie A.4b `.pg` L1)

**a) Nichts gewählt (Pegel)**
```
┌─────────────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────┐
│                                                 │ ▐Pegel▌ [Stimme] [Vorlagen ▾] [Zufall] [A│B] [⋯]   DX 5 ✓ · 6 Op · 8 St│
│ ·       ·       ·       ·       ·       ·    R3 │                                                                        │
│                                                 │                                                                        │
│                                                 │ ▕1 ×1  Pegel▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒99▏◀1   ▕4 ×14 Pegel▒▒▒▒▒▒          58▏◀4  │
│ ·       ·       ·       ·       ·       ·    R2 │                                                                        │
│                                                 │                                                                        │
│ ┌─────┐ ┌─────┐ ┌───[6]                         │ ▕2 ×1  Pegel▒▒▒▒▒▒▒▒▒▒      72▏◀2   ▕5 ×1  Pegel▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒99▏◀5  │
│ │▌2×1 │ │▌4×14│ │▌6×1 │                     R1  │                                                                        │
│ └──┬──┘ └──┬──┘ └──┬──┘                         │                                                                        │
│ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐                         │ ▕3 ×1  Pegel▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒99▏◀3   ▕6 ×1  Pegel▒▒▒▒▒▒▒         61▏◀6  │
│ │█1×1 │ │█3×1 │ │█5×1 │                     R0  │                                                                        │
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │                                                                        │
└─────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────┘
```

**b) OP 4 gewählt, Basis**
```
┌─────────────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────┐
│                                                 │ OP 4 · MOD. → 3 ▐Basis▌ [Amp] [Mod] [Tonh.] [M] [⋯]                    │
│ ·       ·       ·       ·       ·       ·    R3 │                                                                        │
│                                                 │                                                                        │
│                                                 │ ▕Welle ∿ Sinus ‹›               0▏  ▕Verstimmung▒▒▒▒▒               0▏ │
│ ·       ·       ·       ·       ·       ·    R2 │                                                                        │
│                                                 │                                                                        │
│ ┌─────┐ ╔═════╗ ┌───[6]                         │ ▕Pegel  I 3,1▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   83▏  ▕Phase 0 [Fest│Zuf.│Frei]        ▏ │
│ │▌2×1 │ ║▌4×14║ │▌6×1 │                     R1  │                                                                        │
│ └──┬──┘ ╚══┬══╝ └──┬──┘                         │                                                                        │
│ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐                         │ ▕Verhältnis ×14 [×│Hz]           ▏  ▕Feedback ← aus                 0▏ │
│ │█1×1 │ │█3×1 │ │█5×1 │                     R0  │                                                                        │
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │                                                                        │
└─────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────┘
```

**c) OP 4 gewählt, Amp (Hüllkurve im Wertefeld, Feld bleibt sichtbar – wie EssenceFM)**
```
┌─────────────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────┐
│                                                 │ OP 4 · MOD. → 3 [Basis] ▐Amp▌ [Mod] [Tonh.] [M] [⋯]                    │
│ ·       ·       ·       ·       ·       ·    R3 │                                                                        │
│                                                 │ ,5 1ms 10 100 1s 10s ┊1ms 1s  [Sustain][Loop A][Loop B][Loop weg]      │
│                                                 │ 1╲                   ┊                                                 │
│ ·       ·       ·       ·       ·       ·    R2 │ │ ╲___2━━━━━━━━━━━━3┊╲         [  ✗   ][  +   ][(Mitte)][(Skip)]       │
│                                                 │ │░░                  ┊ ╲___                                            │
│ ┌─────┐ ╔═════╗ ┌───[6]                         │ ◘                    ┊     4   [DX ▾  ][ FEIN ]                        │
│ │▌2×1 │ ║▌4×14║ │▌6×1 │                     R1  │                                                                        │
│ └──┬──┘ ╚══┬══╝ └──┬──┘                         │ A 0,5 · D1 43 · D2 124 · R 327 ms                                      │
│ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐                         │                                                                        │
│ │█1×1 │ │█3×1 │ │█5×1 │                     R0  │ Graph 280 × 112 (Lineal 12, Kurve 84, Zeiten 16)                       │
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │                                                                        │
└─────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────┘
```

**Geometrie L1:**

| Element | x | y | Größe / Regel |
|---|---|---|---|
| FELD | 0–311 | 0–149 | 312 × 150 |
| Kacheln | x = 52·c | y = 10 + 34·(3 − r) für die 4 sichtbaren Reihen (Reihe 0: 112–142) | **48 × 31**, Reihenabstand fest 34; Treffer 52 × 34 |
| Mehr als 4 Reihen | | 0–9 | Das Feld zeigt immer 4 Reihen und rollt nur im Feld: R11 (Wischen im Leerraum) senkrecht; ein Zug an den oberen oder unteren Feldrand rollt automatisch (8 px je 50 ms). Streifen „▲ 2 weitere“ (10 px) oben, „▼ n weitere“ im Boden. Der Körper scrollt nie |
| Boden | 0–311 | 146–147 | Linie 2 px, ohne Text |
| WERTE | 320–827 | 0–149 | 508 × 150 |
| Kopf | 320–827 | 0–33 | 34 hoch (L4); Rolle ≤ 150 px + Reiter Basis 56 · Amp 44 · Mod 44 · Tonh. 52 · M 36 · ⋯ 36 (Abstand 4) |
| Inhalt (Seiten) | 320–569 und 578–827 | 38–71 · 75–108 · 112–145 | 2 Spalten × 3 Zeilen à 250 × 34 (zweizeilig, §4.7); Pegel mit 7–8 OP: 3 Spalten à 165 |
| Inhalt (Amp/Tonh.) | 320–599 | 38–149 | Graph 280 × 112 (Lineal 12, Kurve 84, Zeiten 16) |
| Knöpfe (Amp/Tonh.) | 608–827 | 38–71 · 75–108 · 112–145 | 3 Zeilen × 4 × (52 × 34), Abstand 4: [Sustain][Loop A][Loop B][Loop weg] · [✗][+][Mitte][Skip] · [DX-Zeile ▾][FEIN]; nichts gewählt: [Exp][Skala][Retrig][+] · [Alle Mod.][Alle Ausg.][Kopieren][Einfügen] |
| **Summe** | | | **150 px** (Feld 10 + 136 + 4; Werte 34 + 4 + 34 + 3 + 34 + 3 + 34 + 4) |

### 5.3 Andere Größen (M-PLATZ)

| Größe | Körper innen (V0a gemessen) | FELD | WERTE | Kachel | Regel |
|---|---|---|---|---|---|
| P1 | 374 × 367 (Budget 365 = A.4b `.pg`) | 236 | 132 | 36 × 50 | wie §5.1; der Körper wächst nicht über 365 px |
| P2 375 × 667 | 359 × 245 | 228 (6 × 38) | 127 | **34 × 32** (Ausnahme: 2 px unter L4 36 × 34; Treffer = Zelle 38 × 36) | Feld-Kopf 16, Reihen 6 × 36, Boden 10; Reiterblock 2 × 30; 5 Wertzeilen à 36, die 6. über ‹ › |
| P3 320 × 568 | 304 × 217 | 304 (6 × 50) | Blatt über den rechten 60 % des Felds | 46 × 28 | „P3 darf vereinfachen“ (§0.4): Tipp auf Kachel öffnet das Werte-Blatt, ✕ schließt |
| L1 844 × 390 | 828 × 152 (Budget 150 = A.4b `.pg`) | 312 | 508 | 48 × 31 (Reihenabstand 34) | wie §5.2 |
| L2 667 × 375 | 651 × 137 | 264 (6 × 44) | 379 (2 Spalten à 185) | 40 × 30 | 4 Reihen à 34 |
| W 844 × 1180 | 828 × 703 | 384 (6 × 64) | 436 | 60 × 52 | 6 Reihen à 60; Hüllkurve im Wertefeld wie L |

---

## 6. Datenmodell `p.fmx` (Format 2)

### 6.1 Schema (ersetzt §9.2 für `p.fmx`)

```js
Sound.engine = 'fm6'                          // bleibt (A.5 PAD-R1: ein FM-Pad spielt auch p.fmx)
p.fm6 = {alg, fb, trans, ops[6], peg?,        // WP7/V0d, kanonisch solange DX-tauglich (§9.2 bleibt)
         ams?[6], pms?, osync?}               // neu in V4a: DX-LFO-Empfindlichkeit je OP, PMS, Osz.-Sync (.syx-Import, A.4b P. 11)
p.fmx = {                                     // neu in V4a; vorhanden ⇒ Worklet nutzt den Graph-Renderer
  v: 2,                                       // Format 2 = EssenceFM-Raster (ein Format 1 wurde nie gebaut)
  n: 6,                                       // Operatoren 6 | 7 | 8 (EK-07)
  trans: 0,                                   // Transponieren −24..+24 (wie fm6.trans, wird mitgeschrieben)
  ops: [{                                     // Länge n; Index k ↔ OP k+1 (Nummer = Identität)
    on: 1,                                    // 0 = stumm (R3, [M]); Werte bleiben
    c: 0, r: 0,                               // Zelle; r 0 = Ausgang (EK-02)
    wave: 0,                                  // 0..47 (0 = Sinus, 1..11 Werkswellen, 12..47 eigene)
    ph: 0, phm: 'fix',                        // 0..127; 'fix' | 'rnd' | 'free' (Handbuch S. 28)
    ol: 0,                                    // 0..99, DX-Skala (EN-02)
    fixed: 0, coarse: 1, fine: 0, det: 0,     // DX-Frequenzfelder wie fm6
    fbSrc: 0, fbAmt: 0,                       // Quelle 0 = aus, 1..n; Stärke 0..7 in 0,1 (N4a-01)
    vs: 0,                                    // Anschlag −7..+7 (DX 0..7)
    lfoAm: 0, lfoFm: 0,                       // 0..127: LFO 1 der Spur auf Pegel bzw. Tonhöhe dieses OP
    rs: 0, ks: {bp: 39, ld: 0, rd: 0, lc: 0, rc: 0},   // DX-Raten- und Tasten-Skalierung
    amp: Env,                                 // Lautstärke-Hüllkurve (Pflicht)
    pit: null, pr: 'dx'                       // Tonhöhen-Hk. (null = flach); 'dx' | 'ton' | 'q5' | 1 | 2 | 4 | 8
  }],
  edges: [{from: 2, to: 1}]                   // Modulator → Ziel, 1-basiert; keine Tiefe je Kante (Stärke = ol des Modulators, Handbuch S. 12–13)
}
Env = {f: 'dx', r: [99, 99, 99, 80], l: [99, 99, 99, 0]}               // A.4b, msfa-genau
    | {f: 'pt', y: [0, 99, 72, 70, 0], t: [0.5, 43, 124, 327],       // y0..yk (k ≤ 5) 0..99; t1..tk in ms 0,5..20 000
       sus: 3, la: -1, lb: -1, skip: 0,                               // Indizes; -1 = keiner
       crv: 'exp', run: 'retrig'}                                     // 'exp' | 'lin'; 'retrig' | 'free'
```
- Entfallen gegenüber §9.2: `id:'A'…'H'`, `out`, `park`, `groups`, `layout`, `r`/`l` direkt am Operator (jetzt in `amp`).
- `S.ui` merkt sich die letzte Unterseite (FELD/DX) wie N4b-01; Fokus und Wertefeld-Seite sind Laufzeit (`ED.fmx`), nicht im Projekt (M-REKON, `HIST.volatile` unverändert).

### 6.2 Normalisierung (`normFmx`)

- Zahlen klemmen und runden (Bereiche oben); `n` ∈ {6, 7, 8}; `ops.length = n`; fehlende Felder mit Init-Werten (A.4b Punkt 8).
- **Reparatur in fester Reihenfolge** (OP-Nummer aufsteigend; zweimal laden = gleiches Ergebnis): doppelte Zelle → späterer OP in die nächste freie Spalte derselben Reihe; Kante gegen I2 oder mit unbekanntem OP → entfernen; OP in Reihe 0 mit Ziel → Ziel entfernen (I4); OP in Reihe > 0 ohne Ziel → fällt nach R7 (I3); mehr als 16 Kanten + Feedback-Wege → Kanten mit der höchsten Nummer entfernen. Jede Reparatur schreibt eine Konsolenzeile.
- `Env`: DX-Form 4 + 4 ganze Zahlen 0…99; Punkt-Form 2…6 Punkte, `t` 0,5…20 000 ms, ungültige Indizes → −1, `skip` nur mit `sus` ≥ 0.

### 6.3 Übergänge `fm6` ↔ `fmx`

- **`fmxFromFm6(fm6)`** (verlustfrei für den Klang, N7F-02): n 6; Werte je OP übernommen; `wave` 0; `ph` 0; `phm` = `osync` 0 ? 'free' : 'fix' (fehlt `osync` ⇒ 'fix'); Feedback: Empfänger `ALGS[alg].fbDst` bekommt `fbSrc = fbSrc+1`, `fbAmt = fb`; `amp = {f:'dx', r, l}`; `pit` = `peg` bei Verhältnis-OP (`pr 'dx'`), sonst `null`; `lfoAm = round(127·ams/3)`, `lfoFm = round(127·pms/7)` (Abbildung des DX-LFO auf LFO 1 der Spur = **Näherung**; Gleichheit wird nur ohne LFO geprüft); Kanten aus `ALGS[alg].mods`; Plätze `dxLayout(alg)`.
- **`fm6` mitschreiben**, wenn DX-tauglich (§6.4), mit der Nummerierung des Felds; sonst bleibt `fm6` der letzte DX-taugliche Stand mit `approx: true` für den nativen Rückfall (§9.2, unverändert).

### 6.4 DX-tauglich (neu, ersetzt die Definition in §9.2)

Ein `fmx` ist DX-tauglich, wenn **alle** Punkte gelten:
1. n = 6 und die Form (Kanten) gleicht einem DX-Algorithmus mit der eigenen Nummerierung (sonst Badge „Nummern anders“, §4.12);
2. höchstens ein Feedback-Weg; (Empfänger, Quelle) = (`fbDst`, `fbSrc`) dieses Algorithmus; `fbAmt` ganzzahlig;
3. alle `wave` = 0;
4. alle `amp` in DX-Form; `pit` bei allen Verhältnis-OP gleich in DX-Form mit `pr 'dx'` oder überall `null`; feste OP `pit null`;
5. alle `ph` = 0, alle `phm` gleich und ∈ {'fix', 'free'};
6. `vs` 0…7; `lfoAm` ∈ {0, 42, 85, 127}; `lfoFm` bei allen OP gleich;
7. `on` beliebig (ein stummer OP ist in .syx ein OP mit Pegel 0 – beim Export wird `ol` 0 geschrieben).

`fmxDx(t).reasons` nennt jede verletzte Bedingung als Zeile („OP 3: Welle Säge 1“, „OP 2: Hüllkurve frei“, „Feedback an OP 2 und OP 6“).

### 6.5 `dxLayout(alg)` – Anordnung der 32 DX-Algorithmen im Raster

1. Ausgänge (Träger) nach OP-Nummer aufsteigend in Reihe 0, Spalten 0, 1, 2, …
2. Ebene eines Modulators = 1 + größte Ebene seiner Ziele; Modulatoren nach Ebene, dann Nummer.
3. Wunschspalte = untere Mitte der Zielspalten (`cols[(len−1) >> 1]`); Reihe = 1 + höchste Zielreihe; ist die Zelle belegt, die nächste freie in der Reihenfolge c+1, c−1, c+2, c−2, …
*Gerechnet* (`scratchpad/kodamo-pdf-skripte/dxlayout.py`, Tabelle aus V0a Z. 2557): 32/32 ohne Überlappung, alle Kanten abwärts, höchstens **6 Spalten** (nur Alg. 32) und **4 Reihen** (Alg. 1, 2, 18). Beispiele: Alg. 1 → 1 (0,0), 2 (0,1), 3 (1,0), 4 (1,1), 5 (1,2), 6 (1,3); Alg. 22 → Träger 1, 3, 4, 5 in Spalten 0–3, 2 über 1, 6 über 4 (Mitte seiner Ziele 3, 4, 5).

### 6.6 Mod-Ziele (ändert A.8/V5d und §9.3)

- Mod-Ziele `op1…op8` (Pegel je OP) statt `opA…opH`; `lfo1→op2` usw.
- V5d-Pfade (A.8 Punkt 1) heißen jetzt: `fmx.<1–8>.<ol|ph|fine|det|fbAmt|lfoAm|lfoFm|bp|ld|rd>`, Hüllkurven `fmx.<k>.amp.<r1…r4|l1…l4>` (DX-Form) bzw. `fmx.<k>.amp.<t1…t5|y0…y5>` (Punkt-Form), ebenso `fmx.<k>.pit.…`, dazu `fmx.<k>.wave` (gestuft, „wavetable-like effects“, Handbuch S. 26). Kanten haben keinen Mod-Pfad (keine Tiefe je Kante). V5d-01 prüft „für jeden Operator 1–8“.

### 6.7 Projekt-Wellen (V4e)

```js
Project.waves = { [idx 1..47]: {name, s: 'base64(Int16 × 512)'} }    // eigene Wellen 12..47 und geänderte Werkswellen 1..11 (copy-on-write; Welle 0 nie)
Sound.p.fmx.uw? = { [idx]: {name, s} }                              // Kopie der benutzten eigenen Wellen beim Sichern in die Bibliothek
```
Beim Laden eines Sounds mit `uw` in ein Projekt: gleiche Welle vorhanden → Index bleibt; sonst freier Platz, Index im Sound angepasst; kein Platz → Toast und Welle 0.

---

## 7. Test-API (ergänzt §16 und Teil D)

```ts
// V4a
getFmx(t: number): object | null
setFmx(t: number, fmx: object): void                  // wirft bei Verstoß gegen I1–I5 oder 9. Operator (V4a-05); ein Undo
fmxLevels(t: number): number[]                         // Live-Pegel je OP 0..1 (Laufzeit, für N7F-09/-32)
// V4b
fmxView(t?: number): {state: 'voice'|'op', focus: number|null, page: 'pegel'|'stimme'|'basis'|'amp'|'mod'|'tonh', rows: number,
  field: {x, y, w, h}, panel: {x, y, w, h},
  tiles: {op, c, r, x, y, w, h, on, frame: string, fill: string, bar: {ol: number, live: number}, ratio: string, fb: number|null}[],
  lines: {from, to, x0, y0, x1, y1, grey: boolean}[], lcd: string}
fmxPreview(t: number, g: FmxGesture): {fmx: object, lcd: string, ok: boolean}      // Ergebnis vor dem Loslassen, ändert nichts
fmxGesture(t: number, g: FmxGesture): {ok: boolean, reason?: string, lcd: string}  // gleiche Logik wie die Touch-Geste; ein Undo bei Änderung
type FmxGesture = {kind: 'drop', op: number, onOp?: number, cell?: [number, number]}
                | {kind: 'two', a: number, b: number} | {kind: 'dtap', op: number} | {kind: 'tap', op: number|null}
setFmxOps(t: number, n: 6|7|8): void                    // R13; ein Undo
dxLayout(alg: number): {pos: Record<number, [number, number]>, edges: [number, number][]}
fmxDx(t: number): {match: number|null, perm: number[]|null, reasons: string[]}
// V4c (erweitert fmEnvView aus A.4b)
fmEnvView(t?): {… A.4b …, form: 'dx'|'pt', sus: number, la: number, lb: number, crv: 'exp'|'lin', run: 'retrig'|'free', zoom: number}
fmxEnvAction(t: number, op: number, which: 'amp'|'pit', a: {kind: 'add'|'del'|'sus'|'skip'|'loopA'|'loopB'|'unloop'|'crv'|'run'|'scale'|'center', i?: number, v?: number}): void   // 'skip' nur am Sustain-Punkt, 'unloop' setzt la = lb = −1
// V4e (P1)
fmxWaves(): {idx: number, name: string, used: number, user: boolean}[]
setFmxWave(idx: number, data: number[] /* 512 Werte −1..1 */ | null): void        // idx 1..47 (0 wirft, D1); null = Platz leeren bzw. Werkswelle wiederherstellen
```
Alle Rückgaben sind tiefe Kopien; jede ändernde Funktion ist ein Undo-Schritt wie die Geste.

---

## 8. Pakete, Budgets, Versionen, Abhängigkeiten (ersetzt §17 V4a–V4c und die V4-Zeilen in C.1, C.3, C.4)

| Paket | Inhalt | Version | Budget KB | Dauer h | braucht |
|---|---|---|---|---|---|
| **V4a — FM-Graph-Engine (fmx 2)** | Graph-Renderer (§9.3), Format 2 + `normFmx` + Invarianten + Reparatur, `fmxFromFm6`, `dxLayout`, `dxMatch` (Funktion), Werkswellen 0–11 (512 + Interpolation), Phase + Modus, Feedback je OP mit Quelle, stumm, `vs` ±, `lfoAm`/`lfoFm`, DX-LFO-Import (`ams`, `pms`, `osync`), DX-Form-Hüllkurven je OP inkl. Tonhöhen-Hk. je OP (`pit` DX-Form), Live-Pegel-Meldung, Stimmen-Überblendung 30 ms (alle Worklet-Engines), nativer Rückfall, Mod-Ziele `op1…op8` | 4.10.0 | **45** (bisher 35) | **6–7** (bisher 5) | V0d |
| **V4b — FELD und Wertefeld** | §4.1–4.9, 4.12, 4.13, §5: Raster, Kachel, Farben, Linien, Boden, Gesten R1–R13 mit Vorschau, LCD, Hilfe, Wertefeld (Pegel, Stimme, Vorlagen, Zufall, A│B, Basis, Mod, M, ⋯ mit Solo, Ziele, Kopieren, Modulieren mit …), Relativzug und Ziffernblock, Operatoren 6│7│8, Badge, Nummern angleichen; Amp/Tonh. zeigen bis V4c die Ansicht §5.1 d bzw. §5.2 c mit der DX-Form (Mini-Feld, Graph, DX-Zeilen, Vorlagen; ohne Punkt-Knöpfe) – der A.4b-Editor (365 px mit eigenem Kopf) passt nicht unter den Reiterblock | 4.11.0 | **85** (bisher 75) | **7–8** (bisher 6–7) | V4a |
| **V4c — EssenceFM-Hüllkurven** | §4.11: Punkt-Form im Worklet und nativ, Tonhöhen-Bereiche, Editor-Erweiterung (Knöpfe inkl. [Skip] und [Loop weg], Pinch, Fußzeile), Umwandlung, Warnchips, Punkt-Knöpfe in der Ansicht EK-13 | 4.12.0 | **40** (neu) | **5–6** | V4b |
| **V4d — Vorhersage, Raster, DX-Brücke** | bisher V4c (§9.5, §9.6) mit §6.4/6.5: Vorhersage im LCD, Raster aus „Verhältnis“, [DX-tauglich machen] mit Gründen, .syx-Export, Import ins Feld | 4.12.5 | 30 | 4 | V4b (N0a-03) |
| VC2a — Verlauf-Rekorder | unverändert | 4.13.0 | 30 | 4–5 | V2a |
| **V4e — Wellen zeichnen** *(P1)* | §4.10, §6.7: Wellen-Werkstatt mit Moduswahl [Zeichnen│Auswahl] (alle Werkzeuge wirken auf die Auswahl, ohne Auswahl auf alles; Handbuch S. 62): Glätten, Gain 0…1000 % mit ☑ Fold-back, Maximieren, Gleichanteil weg, Übergang glätten, X², Spiegeln X/Y, Teilton 1…40, Phase, Mischen, [Zuschneiden] (nur mit Auswahl; streckt sie auf 512 Samples); Vorrat 12–47, Werkswellen 1–11 copy-on-write, Mitnahme in die Bibliothek; Gruppe V3 vor V3a | 4.13.5 | **28** (bisher 25) | **4–5** (bisher 3–4) | V4b |

- **Gruppe V4** (C.1): V4a, V4b, V4c, V4d, VC2a – **≈ 26–30 h** (bisher ≈ 20 h). V4e *(P1)* steht in Gruppe V3 (dann 4 Pakete).
- **Größe:** V4a–V4d zusammen 200 KB statt 140 KB (+60 KB), mit V4e +88 KB; Summe aller Budgets ≈ 3,56 MB bzw. 3,59 MB (C.4 mit A.4b: 3,50 MB). Grenze 4,0 MB (EN-17) hält.
- **Abhängigkeiten** (C.3): `V0d ─ V4a ─ V4b ─ V4c ─ V4d`; `V4b ─ V4e`; V5d nimmt die Pfade aus §6.6; V6a braucht V4a (unverändert); VK braucht V4a (Überblendung, unverändert).
- Versionen danach unverändert (V3a 4.14.0 …); Zwischenversionen 4.12.5 und 4.13.5 vermeiden ein Umnummerieren.
- **iPhone-Prüfpunkte nach Gruppe V4** (C.5 Punkt 3): (1) FM-Pluck öffnen → FELD: unten die Ausgänge, darüber die Modulatoren, rechts die Pegel-Seite in denselben Farben; (2) einen Modulator auf einen Ausgang ziehen → verbunden; nochmal auf denselben → Plätze getauscht; ins Leere → fällt nach unten; (3) Doppeltipp → stumm; (4) Operator antippen → rechts Basis/Amp/Mod/Tonh.; Amp → Punkte ziehen, [Sustain] mit [Skip], [Loop A]/[Loop B] und [Loop weg]; im Hochformat bleibt das Feld links sichtbar; (5) Querformat: Feld und Hüllkurve nebeneinander; (6) Pegel-Seite: senkrecht ziehen ändert den Wert ohne Sprung, Tipp auf die Zahl öffnet den Ziffernblock.

---

## 9. Abnahme

Alle Touch-Prüfungen per CDP-Touch in Chromium; Klangmessungen im Node-Shim des Worklets wie `r8/tools/lib.mjs`. Gilt **zusätzlich** zur §17-Liste, wo nicht „ersetzt“ steht.

### V4a — Engine
- [ ] **N7F-01** Format: `normFmx` erhält alle Felder; 200 Zufallsgraphen (≤ 8 Op, ≤ 16 Kanten, alle Formen) überleben Speichern/Laden, Kopieren und Undo deep-equal. Verletzte Zustände (doppelte Zelle, Kante nach oben, schwebender OP, Ausgang mit Ziel) werden nach §6.2 repariert; zweimal laden ergibt dasselbe.
- [ ] **N7F-02** (ersetzt V4a-01) `fmxFromFm6` für alle 32 Algorithmen, Testpatch: alle 6 OP an, Modulatoren OL 80, Ausgänge 99, fb 5, DX-Hüllkurven, PEG [Fall], LFO aus; Render C3, Anschlag 0,8, 1 s: Differenz-RMS zu `fm6` ≤ −50 dB. Alg. 4 und 6 stehen im Feld als Empfänger 6 mit Quelle 4 bzw. 5; das Worklet rechnet genau diese beiden Fälle auf dem WP7-Weg (Risiko-Hinweis V4a in §17), damit die Gleichheit gilt.
- [ ] **N7F-03** Wellen: Welle 0 bitgleich zum bisherigen Sinus-Pfad (≤ −120 dB); Wellen 1–10 als Ausgang bei C4: die ersten 8 Teiltöne je ≤ 1 dB neben der FFT der Tabelle; Welle 11: spektrale Flachheit ≥ 0,4 zwischen 1 und 8 kHz; Wellenwechsel bei gehaltener Note besteht M-KLICK.
- [ ] **N7F-04** Phase: 'fix' mit `ph` 0 → zwei Anschläge mit gleichen ersten 64 Samples (≤ −90 dB); `ph` 64 → halbe Periode Versatz (Vorzeichen des Starts umgekehrt); 'rnd' → 10 Anschläge mit ≥ 8 verschiedenen Startphasen; 'free' → Startphase der 2. Note = fortgelaufene Phase ±1/128.
- [ ] **N7F-05** Feedback je OP: `fbSrc` auf jedem OP setzbar; Selbst-Feedback mit ganzer Stärke gleich DX (≤ −60 dB, wo DX-tauglich); fremde Quelle mit 1 Sample Verzögerung, 60 000 Zufallsblöcke ohne NaN, Spitze ≤ 0 dBFS bei Klang-Pegel 0,35; `fbAmt` 4,5 liegt im M-SP zwischen 4 und 5 (N4a-01).
- [ ] **N7F-06** Stumm: `on` 0 rendert gleich wie `ol` 0 (≤ −100 dB); Umschalten bei gehaltener Note: M-KLICK besteht, M-EINBRUCH ≤ 3 dB.
- [ ] **N7F-07** Anschlag: `vs` −7 → Anschlag 0,3 an diesem OP ≥ 3 dB lauter als 1,0; `vs` 0…7 bitgleich zu `fm6`.
- [ ] **N7F-08** LFO je OP: `lfoAm` 127 mit LFO 1 (5 Hz) → Pegelschwankung des OP ≥ 6 dB Spitze-Spitze; `lfoFm` 127 → Tonhöhenschwankung ≥ ±50 Cent (TONHÖHENSPUR); 0 → keine Wirkung (≤ −100 dB). .syx mit AMS 3 an einem Modulator → `lfoAm` 127 (vorher verloren, A.4b Diagnose 3h).
- [ ] **N7F-09** Live-Pegel: je Spur 8 Werte (Maximum über die Stimmen, Pegel × Hüllkurve, 0…1) mit 25–35 Hz, nur solange das FELD sichtbar ist (sonst 0 Nachrichten); Mehrlast ≤ 0,2 % (M-CPU).
- [ ] **N7F-10** (ersetzt V4a-06) CPU im schlechtesten erlaubten Fall: 8 Op, 16 Kanten inkl. 2 fremde Feedback-Wege, alle Wellen ≠ 0, alle Hüllkurven Punkt-Form mit Schleife (ab V4c nachgemessen), 4 Stimmen ≤ 12 % je Spur (Xeon); 6 Op in DX-Form mit 8 Stimmen ≤ Messwert vor V4a + 5 %.
- [ ] **N7F-11** (ersetzt V4a-08) `lfo1→op2` und `lfo1→fmbright` hörbar (Schwerpunkt max/min > 1,5).
- [ ] **N7F-12** V4a-02, -03, -04, -05, -07, -09, -10, -11 gelten unverändert (mit `op1…op8`).

### V4b — FELD und Wertefeld
- [ ] **N7F-13** Geometrie (`fmxView`) wie §5 ±1 px: P1 Kachel 36 × 50 bei x = 40·c, y = 23 + 55·(5 − r), Wertefeld x 242–373, Wertzeilen y = 76 + 47·i (7–8 OP: 76 + 35·i); P1 Amp/Tonh.: Mini-Feld x 0–131 (Kachel 20 × 42), Hüllkurve x 138–373; L1 Kachel 48 × 31 bei y = 10 + 34·(3 − r), Wertefeld ab x 320, Kopf 34; L1 mit 5 und 6 Reihen (INIT FM nach N7F-19; Kette 6→…→1): weiterhin 4 Reihen sichtbar, Treffer ≥ 52 × 34, Rollen per Wischen und Randzug, Streifen „▲ n weitere“; M-PLATZ in P1–P3, L1, L2, W; der Körper scrollt nie; der Reiterblock steht auf allen Seiten an derselben Stelle.
- [ ] **N7F-14** Vorlagen: alle 32 DX-Algorithmen ergeben genau `dxLayout(k)` (deep-equal); keine Überlappung, alle Kanten abwärts, Ausgänge genau in Reihe 0; Screenshot je Algorithmus in P1 und L1.
- [ ] **N7F-15** Kachel: `data-op`, `data-ratio` („×1“, „×3,5“, „14“, „62“ für ×61,69, „440“, „9,8k“ für 9772 Hz), `data-fb` (Quelle oder leer); für alle coarse/fine-Kombinationen und feste Frequenzen gilt Text ≤ 4 Zeichen und Textbreite ≤ Innenbreite (P1 28 px, P2, L1 entsprechend); „Frequenzen in Kacheln“ aus → keine Frequenzzahl.
- [ ] **N7F-16** Farben (computed style) exakt nach §4.3: ohne Auswahl **auf der Pegel-Seite** Rahmen = OP-Farbe; ohne Auswahl auf Stimme, Vorlagen, Zufall, A│B alle Rahmen #363A4E, Balken weiß, keine grüne Kachel; Balken (Fläche 45 %, Marke und Live 100 %, OP 6 #3A3F52/#8A90A8) und Fahne (Nummer #0A0A0A auf 2, 3, 7, sonst #FFFFFF; OP 6 Rand #8A90A8) für alle 8 OP mit Kontrast Marke/Live : Kachel ≥ 3:1 und Fahnenzahl : Fahne ≥ 4,5:1; mit Auswahl alle #363A4E, gewählte Kachel #0A6E5B / #0ACA9F; stumm #3E435B; Linien #0AFFAD, von stummen Modulatoren #3E435B.
- [ ] **N7F-17** Linien: Anfang Unterkante-Mitte des Modulators, Ende Oberkante-Mitte des Ziels (±1 px) für alle Kanten aller 32 Vorlagen; Animation an/aus; aus bei `prefers-reduced-motion`.
- [ ] **N7F-18** Aufsetzen auf Kachel (pointerdown) → `focus` = OP sofort, noch vor dem Loslassen und auch wenn ein Zug folgt; Wertefeld Operator (Basis); Tipp ins Leere → `focus` null, Wertefeld Pegel; kein Undo-Schritt.
- [ ] **N7F-19** Verbinden (R6): INIT FM, Kachel 3 auf Kachel 1 → Kante 3→1; 3 in (1, 1) (Wunschzelle (0, 1) belegt, nächste freie); 4, 5, 6 wandern auf (1, 2), (1, 3), (1, 4); 2→1 bleibt; LCD vorher „3 → 1 verbinden“; ein Undo stellt alles deep-equal her.
- [ ] **N7F-20** Tauschen (R5): INIT FM, Kachel 4 auf Kachel 3 → 3 in (1, 1), 4 in (1, 0); Kanten 2→1, 3→4, 5→3, 6→5; Feedback bleibt an OP 6; LCD „4 ↔ 3 tauschen“; ein Undo.
- [ ] **N7F-21** Fallen (R7): INIT FM, Kachel 5 in die leere Zelle (2, 3) → 5 in (2, 0), 6 in (2, 1), Kanten 2→1, 4→3, 6→5, Badge „DX 5 ✓“ (**DX-Alg. 1 → 5 in einer Geste**); Kachel 2 in die leere Zelle (2, 4) → 2 in (2, 2), Kante 2→6 („fällt auf 6“). Aus INIT FM ergibt sich DX-Alg. 32 mit 4 Gesten (2, 4, 5, 6 nacheinander in leere Spalten).
- [ ] **N7F-21b** Gestenbudget per `fmxGesture` ab INIT FM, jeweils mit erwarteten Zellen und Kanten (deep-equal) und LCD-Vorschau je Schritt: **DX 3** in ≤ 2 Gesten (3 auf 2 → Kette 6→5→4→3→2→1; 4 ins Leere von Spalte 1 → 3→2→1, 6→5→4); **parallele Paare** (2, 3 → 1; 5, 6 → 4) in ≤ 3 (3 auf 1; 4 ins Leere; 6 auf 4); **DX 32** in ≤ 4; **DX 5** in 1. *Gerechnet* nach R5–R7; die Prüfung verhindert, dass spätere Änderungen an R6 c/d diese Wege verlängern.
- [ ] **N7F-22** Abweisen: (a) INIT FM, Kachel 3 auf Kachel 6 (6 im oberen Baum von 3) → nichts ändert sich, LCD „geht nicht: …“; (b) 8 Operatoren, Kette 6→5→4→3→2→1 über alle 6 Reihen, Kachel 7 auf Kachel 6 → nichts, LCD „kein Platz über 6“; (c) Loslassen außerhalb des Felds bzw. auf der eigenen Zelle → nichts; jeweils deep-equal und kein Undo-Schritt. 20 zufällige Züge in leere Zellen erfüllen danach I1–I5.
- [ ] **N7F-23** Zwei Finger (R9), INIT FM: Beginn ≤ 300 ms auf 6 (Reihe 3) und 1 (Reihe 0) → Kante 6→1 (6 behält 6→5); nochmal → Kante gelöst; gleiche Reihe → nichts + LCD; Beginn 500 ms auseinander → nichts; ein ruhender Finger im Feld-Leerraum während eines Zugs im Wertefeld ändert nichts am Feld und wirkt dort als FEIN; **R0:** ruhender Finger auf Kachel 3 für 1 s während eines Zugs im Wertefeld (OP 1 gewählt) → `focus` bleibt 1, kein Picker, kein Zug, FEIN aktiv.
- [ ] **N7F-24** Doppeltipp (R3) und M/S: zwei Tipps ≤ 300 ms → `on` umgeschaltet, Kachel und Linie stumm-grau, Auswahl bleibt, ein Undo; [M] gleich; ⋯ › Solo (auch in P1 erreichbar) nur Laufzeit (nach Speichern/Laden nicht gesetzt): andere OP ≤ −60 dB, Solo-OP klingt als Ausgang.
- [ ] **N7F-25** (R10 entfällt) Halten 1 s auf einer Kachel ohne Bewegung → nur Auswahl (`focus` = OP), kein Picker; ⋯ › „Modulieren mit …“ öffnet den Mod-Picker `op<k>` (P1 und L1); drücken, 600 ms warten, 40 px ziehen → Zug (wie V4b-07b).
- [ ] **N7F-26** Pegel-Seite (CDP-Touch, P1): Zug 60 px nach oben an Zeile 4 ab OL 58 → OL 88 (±1); 60 px nach unten → 28; mit FEIN (ruhender Finger im Feld, R0) 60 px nach oben → +7 (±1); Aufsetzen und 3 px Bewegung → unverändert (Totzone, kein Sprung); Finger verlässt das Wertefeld → Zug läuft weiter; L1: 60 px nach rechts → +30. Balkenlänge Modulator = (OL/99)^(1/0,45), Ausgang OL/99 (±1 px); Marke in Kachel k auf `ol`/99 der Innenhöhe (±1 px). Für jede Zeile gilt `scrollWidth ≤ clientWidth` bei Extremwerten (×61,69; 9772 Hz; „−∞ dB · 0“); Kontrast Wert : Grund ≥ 4,5:1 (computed style); die Füllung liegt nie unter der Wertzone; Fahne nach §4.3; ein Undo je Zug.
- [ ] **N7F-27** Basis-Seite: jede Zeile schreibt ihren Wert (deep-equal `getFmx`); Welle über die Liste (Querformat auch ‹ ›) 0…11; [×│Hz] schaltet `fixed`; Feedback-Quelle aus/1…n und Stärke in 0,1-Schritten; Badge zeigt die Quellnummer, ist bei Stärke 0 blass und verschwindet bei Quelle „aus“.
- [ ] **N7F-27b** Unterzonen und Ziffernblock: Tipp auf die Wertzone von Pegel, Verstimmung, Phase und Feedback öffnet den Ziffernblock; die Eingabe setzt `ol`, `det`, `ph`, `fbAmt` exakt (deep-equal), ein Undo; Verhältnis: Zug in der oberen Hälfte schreibt nur `fine`, in der unteren nur `coarse`, FEIN dort ×¼; Tipp auf [×│Hz], den Phase-Chip und „← Quelle“ schaltet bzw. öffnet nur (kein Wertzug); alle Zeilen bestehen `scrollWidth ≤ clientWidth`.
- [ ] **N7F-28** Mod-Seite: Anschlag −7…+7 (Doppeltipp = 0); LFO AM/FM 0…127; Tasten-Skalierung: Griffe links/rechts schreiben `ld`/`rd` und die Kurvenrichtung, Mitte `bp` mit Notenname; deep-equal mit `ks`.
- [ ] **N7F-29** Ziele: ⋯ › Ziele listet alle Kanten des OP; ✕ löst; ✕ auf der letzten Kante → OP fällt nach R7; [+ Ziel] + Tipp auf eine tiefere Kachel → neue Kante; Kanten haben kein Feld `amt`; in P1 über den Reiterblock-⋯ erreichbar; je ein Undo.
- [ ] **N7F-30** Operatoren 6│7│8 (R13): 6 → 8 setzt OP 7 und 8 mit `ol` 0 in Reihe 0 rechts; Stimmen 6 (`engineInfo`), Kopf nennt den Grund; 8 → 6 entfernt sie samt Kanten und Feedback-Bezügen, LCD nennt alles; je ein Undo.
- [ ] **N7F-31** Kopieren/Einfügen (ganzer OP ohne Zelle und Kanten; nur Hüllkurve), Vorlagen (Kanten + Plätze ersetzt, Werte gleich), Zufall (I1–I5 erfüllt, mindestens ein Ausgang mit `ol` ≥ 80; mit ☑ Algorithmus gilt in 50 Würfen `fmxDx().match` ≠ null, ohne ☑ Algorithmus bleiben Kanten und Plätze deep-equal), [A│B] (wie V4b-09); Kopieren/Einfügen in P1 über ⋯; je ein Undo.
- [ ] **N7F-32** Live-Balken: gehaltene Note, Modulator mit fallender Hüllkurve (D1 200 ms): heller Teil bei 50 ms ≥ 1,3 × der Höhe bei 1 s; ohne Note nur der dunkle Teil; Aktualisierung ≥ 20 Hz.
- [ ] **N7F-33** DX-Abgleich: nach jeder Strukturgeste Badge „DX k ✓“ / „kein DX-Alg. · nächster: k“ / „wie DX k – Nummern anders“; [Nummern angleichen] → ✓, ein Undo; Umschalten FELD ↔ DX ändert weder `fm6` noch `fmx` (N4b-01).
- [ ] **N7F-34** Strukturänderung bei gehaltener Note (Verbinden, Tauschen, Fallen, Zwei Finger, Doppeltipp, Vorlage): M-KLICK besteht, M-EINBRUCH ≤ 3 dB (ersetzt V4b-11).
- [ ] **N7F-35** Hilfe-Zeilen 1–6 (§4.6) vorhanden; LCD-Hinweis beim ersten Antippen von Feld, Pegel-Seite und Badge.
- [ ] **N7F-36** Regression: V4b-07b, -08, -09, -13 gelten; **entfallen** V4b-02 bis V4b-06, V4b-07 (ersetzt durch N7F-23), V4b-10 (ersetzt durch N7F-21), V4b-11 (ersetzt durch N7F-34), V4b-12 (ersetzt durch N7F-13); N4b-01 bis N4b-04 gelten (N4b-02 über ⋯); V1d-02 besteht für einen FM-Klang mit `p.fmx` (PAD-R1).

### V4c — EssenceFM-Hüllkurven
- [ ] **N7F-37** Punkt-Form: 6 Punkte, Zeiten 0,5 ms … 20 s; Exp dB-linear, Lin amplitudenlinear; gemessener Verlauf ≤ 0,5 dB neben der Rechnung innerhalb ±(1 ms + 1 % t) bei 44,1 und 48 kHz; Worklet und nativer Rückfall.
- [ ] **N7F-38** Sustain hält ±0,1 dB über 2 s; Loslassen → Segment nach Psus; Skip an und Loslassen vor Psus → sofort weiter ohne Sprung (M-KLICK besteht).
- [ ] **N7F-39** Schleife vor Sustain: Periode = Summe der Schleifensegmente ±2 %, endet beim Loslassen; nach Sustain: läuft nach dem Loslassen weiter und endet an der 12-s-Kappe; Warnchips nach §4.11 sichtbar.
- [ ] **N7F-40** Frei: zweiter Anschlag während der ersten Note startet die Hüllkurve nicht neu (Verlauf ±0,5 dB gleich), Sustain wirkungslos; Retrig: je Note neu.
- [ ] **N7F-41** Skala: Zeit ×0,25…4 → Gesamtlänge ±1 %; Höhe ×0…1,5 → Punkte geklemmt 0…99; ein Undo.
- [ ] **N7F-42** Tonhöhen-Hüllkurve je OP: Bereiche Ton/Quinte/1/2/4/8 Okt.: y 99 = +Bereich, 0 = −Bereich, 50 = 0 (TONHÖHENSPUR ±0,1 HT); OP mit fester Frequenz unverändert (±0,02 HT); `pr 'dx'` gleich A.4b (V0d-2-14 b).
- [ ] **N7F-43** Editor: Punkt gewählt → [Sustain][Loop A][Loop B][Loop weg] / [✗][+][Mitte][Skip]; nichts gewählt → [Exp│Lin][Skala][Retrig│Frei][+] / [Alle Mod.][Alle Ausg.][Kopieren][Einfügen]; [+] fehlt bei 6, [✗] bei 2 Punkten; [Mitte] nur Tonh.; **[Skip]** nur am Sustain-Punkt, schreibt `skip`; **[Loop weg]** nur an einem Loop-Punkt, entfernt beide Marken (`la` = `lb` = −1), ein Undo; Knopftexte passen (Textbreite ≤ Innenbreite) in P1 (56 px) und L1 (52 px), auch Tonh. mit [Mitte]; Fußzeile „Gesamt …“ bzw. „X … · Y …“; Pinch zoomt ×1…×8, ein ruhender zweiter Finger bleibt FEIN; `fmxEnvAction` mit 'skip' und 'unloop' wirkt wie die Knöpfe.
- [ ] **N7F-44** DX-Form aus FELD › Amp: V0d-2-06 bis V0d-2-12 bestehen.
- [ ] **N7F-45** Umwandlung: jede pt-Aktion an einer DX-Hüllkurve erzeugt die Punkt-Form mit gleichem Klang (M-PEGEL in 20-ms-Fenstern ≤ 1 dB); Badge „kein DX: Hüllkurve“; ein Undo stellt die DX-Form deep-equal her.
- [ ] **N7F-46** Auf alle Mod./Ausg./alle und Kopieren/Einfügen auch für die Punkt-Form (deep-equal), je ein Undo (V0d-10).
- [ ] **N7F-47** Layout: P1 Amp/Tonh. nach §5.1 d und Geometrie (Summe 365 px): Mini-Feld x 0–131 sichtbar und wählbar (Tipp auf Zelle → `focus`), Ziehen dort gesperrt; Graph 236 × 117; Punkt-Treffer 44 × 44 nur in y 76–220; L1 nach §5.2 (Summe 150 px); Punkte ≥ 44 × 44 (P) bzw. 40 × 36 (L); kein Scrollen.
- [ ] **N7F-48** Regression: V0d-2-01 bis V0d-2-20 bestehen; Sounds ohne Punkt-Form rendern bitgleich zu V4b.

### V4d — Vorhersage, Raster, DX-Brücke
- [ ] V4c-01 … V4c-07 der Spec gelten als **V4d-01 … V4d-07**, mit: Vorhersage im LCD während des Ziehens (keine eigene Zeile), Raster-Blatt aus der Basis-Zeile „Verhältnis“.
- [ ] **N7F-49** [DX-tauglich machen] an einem 8-Op-Graph mit Wellen, Punkt-Hüllkurven und zwei Feedback-Wegen: Liste nennt jede Abweichung mit Folge („OP 3: Welle Säge 1 → Sinus“, „OP 2: Hüllkurve frei → DX, Abweichung 1,8 dB“); nach dem Anwenden Badge ✓; ein Undo.
- [ ] **N7F-50** .syx-Export überspringt nicht taugliche Sounds; der Toast nennt je Sound den ersten Grund.
- [ ] **N7F-51** .syx-Import ins FELD: Plätze = `dxLayout(alg)`, PEG in alle Verhältnis-OP kopiert, AMS/PMS/Osz.-Sync übernommen, Badge ✓; FELD ↔ DX deep-equal.
- [ ] **N7F-52** Vorhersage-Rechenzeit mit Wellen ≠ 0 und Punkt-Hüllkurven ≤ 3 ms (Xeon, 8 Op).

### V4e — Wellen zeichnen *(P1)*
- [ ] **N7F-53** [Zeichnen] setzt die 512 Werte unter dem Finger; [Auswahl] markiert einen Bereich, alle Werkzeuge wirken dann nur dort (ohne Auswahl auf alles): Glätten, Gain 0…1000 % (mit ☑ Fold-back: Werte über 1 werden zurückgefaltet, Spitze ≤ 1), Maximieren, Gleichanteil weg, Übergang glätten, X², Spiegeln X/Y, Teilton 1…40 (+Stärke), Phase ±256, Mischen mit einer anderen Welle; [Zuschneiden] nur mit Auswahl, streckt sie auf 512 Samples; jede Aktion ein Undo.
- [ ] **N7F-54** Vorrat 12–47 im Projekt; Werkswellen 1–11 bearbeitbar als Kopie mit gleichem Index (copy-on-write), [Zurücksetzen] stellt die Werkswelle bitgleich her; Welle 0 nicht bearbeitbar (`setFmxWave(0, …)` wirft, D1); „benutzt in n Sounds“ stimmt.
- [ ] **N7F-55** Sichern in die Bibliothek nimmt die benutzten eigenen Wellen mit; Laden in ein anderes Projekt klingt gleich (≤ −90 dB).
- [ ] **N7F-56** Wellenwechsel bzw. Bearbeiten bei gehaltener Note besteht M-KLICK.
- [ ] **N7F-57** Layout P1 und L1 ohne Scrollen, Zeichenfläche ≥ 300 × 150 px (P1).

---

## 10. Änderungsliste an Spec und Nachtrag 1

| Stelle | Änderung |
|---|---|
| Spec §9, Einleitung | Satz „Kodamo EssenceFM (SE): … nur 1 Feedback je Algorithmus. **Unser Unterschied:** …“ ersetzt durch den Leitsatz §1 hier; EssenceFM-Fakten nach `r7/kodamo-pdf/handbuch-komplett.md`. |
| §9.1 | Grenzen (8 Op, Stimmen-Regel, 16 Kanten, Kopfzeile) bleiben; Leitsätze (1)–(3) entfallen (EK-01). |
| §9.2 | ersetzt durch §6 (Schema, Normalisierung, Übergänge, DX-tauglich). |
| §9.3 | bleibt, ergänzt um Wellen, Phase, Feedback je OP mit Quelle, stumm, Hüllkurven je OP (DX- und Punkt-Form), Tonhöhen-Hk. je OP, LFO je OP, Live-Pegel; Mod-Ziele `op1…op8` statt `opA…opH`. |
| §9.4 | ersetzt durch §4 und §5. |
| §9.5 | gilt für V4d; Vorhersage im LCD; Ring entfällt (Index im Wertefeld); Raster aus der Basis-Zeile „Verhältnis“. |
| §9.6 | gilt für V4d; Anordnung `dxLayout`; [Nummern angleichen]; DX-tauglich nach §6.4. |
| §14 | `p.fmx` laut §6.1. |
| §16 / Teil D | Test-API laut §7. |
| §17 V4a, V4b, V4c | ersetzt durch §8 und §9 (Inhalt der alten V4c heißt V4d). |
| §18 | „Mehrpunkt-Hüllkurven mit Schleife“ gestrichen (jetzt V4c); Gruppen, „Ich will …“, Operator-Modi, FORMANT-Operator, Operator-Hüllkurven als Mod-Quelle bleiben §18. |
| Nachtrag A.4 („Nicht-Umfang“) und A.4b Punkt 11 | Zuordnung laut §4.11; Mehrpunkt-Hüllkurven → V4c. |
| A.7 | N4a-01 bleibt; N4b-01 bleibt (OP = A.4b-Seite für DX-Klänge); N4b-02 über ⋯; N4b-03 gilt für die Balkenlänge der Pegel-Seite und der Basis-Zeile „Pegel“ (Eingabe ist Relativzug, §4.7); N4b-04 über die Aktionszeile; N4c-01 gilt für V4d; „Dauer V4b +1 h, Budget +5 KB“ ist in §8 eingerechnet. |
| A.8 (V5d) | Pfade laut §6.6; V5d-01 „für jeden Operator 1–8“. |
| A.5 (PAD-R1) | unverändert; Abnahme in V4b über N7F-36. |
| C.1, C.3, C.4 | laut §8 (Gruppe V4 ≈ 26–30 h; V4e in Gruppe V3; Versionen 4.12.5 und 4.13.5; +60 KB bzw. +85 KB). |
| §0.5 Wortliste | neu: **FELD** (EssenceFM-Feld), **WERTE** (Wertefeld rechts), **Pegel-Seite**, **Fallen**, **Tauschen**, **Badge** (Feedback-Quelle), **Boden** (Anzeige des Ausgangs). |
| Teil E | Fragen F-1 bis F-7 aus §11. |

---

## 11. Risiken und Fragen an Xander

**Risiken**
- **Auslegung der Gesten:** Wo der Operator nach dem Verbinden landet, ob sein oberer Baum mitwandert und ob „Fallen auf einen Operator“ verbindet, sagt das Handbuch nicht (handbuch-komplett §11). R5–R7 legen es fest und bleiben in sich stimmig (I1–I5). Weicht Xanders Erfahrung mit dem Gerät ab, ändern sich nur die Platzregeln, nicht das Datenmodell.
- **Hochformat Amp/Tonh.:** Das Mini-Feld (Zellen 22 × 46) dient nur zum Wählen; die Zeitachse ist 236 statt 358 px breit (Pinch gleicht aus). Querformat ist EssenceFM-genau.
- **Budget:** P1 365 px und L1 150 px statt der v2-Werte 305/140 – wie die in V0a gemessenen A.4b-`.pg`-Höhen (Nachtrag 1, Zeilentabelle).
- **L4-Ausnahmen:** P1-Mini-Feld 22 × 46 je Zelle (nur Tipp); P2 hat 34 × 32. L1 hält mit Reihenabstand 34 das L4-Maß; tiefere Ketten rollen im Feld.
- **Werkswellen:** Formen außer Sinus sind eigene Festlegung; nur Namen und Reihenfolge stammen aus dem Handbuch.
- **Schleifen nach Sustain** halten Noten bis zur 12-s-Kappe (Warnchip).
- **CPU** mit Wellen und Punkt-Hüllkurven ist nicht gemessen (*Schätzung*: Tabellen-Lesen ≈ Sinus-Tabelle, Hüllkurve je 16-Sample-Block); N7F-10 prüft es.
- **DX-LFO → LFO 1** ist eine Näherung (§6.3); geprüft wird nur, dass AMS/PMS nicht mehr verloren gehen.
- Alles gemessen bzw. gerechnet in Node/Chromium, **nicht am iPhone**.

**Fragen an Xander (nicht blockierend; der Bau nimmt die Vorgabe)**

| # | Frage | Vorgabe |
|---|---|---|
| F-1 | Hochformat Amp/Tonh.: Das Feld bleibt immer links sichtbar (verkleinert, nur zum Wählen), die Hüllkurve steht rechts daneben. Reicht dir das kleine Feld, oder lieber ein größeres Feld und eine schmalere Hüllkurve? | Feld bleibt immer links sichtbar (Mini-Feld 132 px, Hüllkurve 236 px) |
| F-2 | 7 und 8 Operatoren behalten (FM-X-Kraft) oder genau 6 wie EssenceFM? | Standard 6, 7–8 zuschaltbar |
| F-3 | Feedback an jedem Operator (EssenceFM: nur 1 und 2)? | ja |
| F-4 | Zwei Finger auf schon verbundene Operatoren = Verbindung lösen? | ja |
| F-5 | Linien-Animation standardmäßig an? | an |
| F-6 | Weißt du (oder ein Video), wo ein Operator auf der EssenceFM landet, wenn man ihn auf einen anderen zieht, und ob seine Modulatoren mitwandern? | Regeln R5–R7 |
| F-7 | Wellen: 1–11 und eigene Wellen sind wie bei EssenceFM bearbeitbar. Den Sinus (Welle 0) sperren wir, damit DX-Klänge bitgleich bleiben. Einverstanden, oder auch den Sinus bearbeitbar? | Sinus fest (D1) |

---

## Review-Protokoll (Runde 2, 17.10.2026)

Jeder Befund wurde gegen den PDF-Text (Handbuch S. 2, 11–13, 18–20, 28, 33, 61–62, 67, 81), das Bild S. 29 und gegen Nachtrag 1 (A.4b-Zeilentabelle: `.pg` P1 365, L1 150) geprüft. **Abgelehnt: keiner.** Übernommen, teils angepasst:

| Befund | Ergebnis |
|---|---|
| EK-13 Feld verdeckt (Bild S. 29: Algorithmus links, Amp rechts) | übernommen; Maße auf das 365-px-Budget umgerechnet: Mini-Feld 0–131 (Zelle 22 × 46 statt 16 × 18), Hüllkurve 138–373; F-1 neu formuliert |
| Skip on Release / Remove Loop (S. 33) | übernommen; zwei Knopfzeilen à 4 statt einer Zeile à 6; `fmxEnvAction` 'skip', 'unloop' |
| Reglerfarben nur auf Base (S. 18) | übernommen (§4.3, N7F-16, handbuch-komplett §3.6) |
| Z17 Werkswellen (S. 2, 61, 81) | übernommen als Mischung aus (a) und (b): 1–11 copy-on-write bearbeitbar; Sinus 0 fest als Abweichung D1, Frage F-7 |
| V4e-Werkzeuge (S. 62) | übernommen; Budget 28 KB, 4–5 h |
| Linien-Animation (S. 67) | übernommen als Auslegung |
| Zufall Algo (S. 20) | übernommen |
| `amt` je Kante (S. 12–13) | übernommen: `amt` gestrichen (§6.1, §6.4, §6.6, Z6, N7F-29) |
| P1-Budget 305 → 365, L1 140 → 150 | übernommen; bei 7–8 OP 8 Zeilen à 34 statt einer ‹1–6│7–8›-Zeile (die passte nicht in die freien 10 px) |
| Wertzeile zweizeilig, Kontrast (*gerechnet* 2,86:1 bestätigt) | übernommen |
| Relativzug | übernommen (2 px bzw. 4 px je Schritt, senkrecht im Hochformat) |
| R1 beim Aufsetzen, R10, R0 (S. 18–19) | übernommen |
| ⋯ im Reiterblock | übernommen; Solo in ⋯ in allen Größen |
| L1 Reihenabstand 34, Rollen | übernommen |
| Balken- und Fahnenfarben | angepasst: Eine 55-%-Fläche erreicht nur 1,7–2,0:1 (*gerechnet*). Deshalb trägt eine 2-px-Marke in voller Farbe den Wert; die Fläche (45 %) ist nur Füllung. OP 6 bekommt #8A90A8 (6,3:1) statt #3A3F52 (1,9:1) für Marke, Live und Fahnenrand |
| Frequenz ≤ 4 Zeichen | übernommen |
| Knöpfe Tonh./L1 (Breite, Kopf 34) | übernommen; FEIN als Chip in der Vorlagen-Zeile statt „nur wenn eingerastet“ (sonst ließe es sich nicht einrasten) |
| Unterzonen, Ziffernblock | übernommen (N7F-27b) |
| Gestenbudget (*nachgerechnet*: DX 3 in 2, Paare in 3) | übernommen (N7F-21b) |
