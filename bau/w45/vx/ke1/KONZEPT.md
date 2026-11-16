# KE1 – Konzept „Klang erkennen“ (nichts gebaut)

Stand 16.11.2026 · Grundlage: App 4.78.0 (`scratchpad/rel-4780/index.html`, md5 68e92c03…, nur gelesen), `INVENTAR.md` (Code-Stellen),
`METHODEN.md` (Verfahren, Quellen [Q1]…[Q43]). Diese Datei ist **markenfrei**: Das Gerät des Kumpels heißt hier „Original-Gerät“,
die Engine sichtbar genau „MS 2000“, seine 64 Wellen „Speicherwellen“. Geräte-, Kabel- und App-Namen stehen nur in den
Privat-Dateien unter `scratchpad/vx-privat/`.
Kennzeichen: **[gemessen]** in diesem Lauf · **[Code Z.]** Zeile in rel-4780 · **[Q..]** Quelle aus METHODEN.md ·
**[Ableitung]** eigener Vorschlag · **[geschätzt]** Zeit/Größe geschätzt · **[unbestätigt]** nicht geprüft.

---

## 0. Kurz

- **Was:** Ein Knopf „Klang erkennen“ an einer Aufnahme. Die App friert den Take ein (das tut sie heute schon, PCM16 im Gerät),
  hört genau hin (Stufe 1), spielt den Klang mit den eigenen Synths nach und vergleicht (Stufe 2), wählt die passende Engine
  (Stufe 3: MS 2000 / VA / FM) und zeigt eine **Erkennungs-Karte** mit „sicher / ungefähr / geraten“. A/B hören, „Übernehmen“ auf
  eine Spur, ein ↶.
- **Was es schon gibt:** „Klang nachbauen“ auf der Spektral-Seite (eine Note, nur VA oder 2-OP-FM, ~50 Versuche, 1,7–2,9 s)
  [INVENTAR §2]. KE1 baut darauf auf, statt neu anzufangen.
- **Was neu ist:** Ein-Tipp-Weg vom Take, Ziel MS 2000 (2 Oszillatoren wie das Original-Gerät, Speicherwellen, Ring/Sync,
  4 Filtertypen), Filtertyp und Filter-Hüllkurve frei, Wahrscheinlichkeiten je Wert, Engine-Wahl, ehrliche Grenzen.
- **Wichtigster Messwert dieses Laufs [gemessen]:** Die echte Engine rendert außerhalb des Audio-Threads (Node, Xeon, warm, `nice 10`)
  eine 1-s-Note in **4,4–8,4 ms (MS 2000) bzw. 6,0–13,2 ms (VA) bei 48 kHz** (2 Läufe, Rechner durch Parallel-Arbeiten
  unterschiedlich belegt; Median aus 8); Engine laden 85–317 ms (`vx/ke1/zeit-probe.mjs`). Heute kostet ein Versuch über
  OfflineAudioContext samt Analyse 35–60 ms [METHODEN §1]. Mit Render-Worker (Render + Analyse ≈ 10–30 ms je Versuch am Xeon
  [Ableitung]) und 2 Workern passen **etwa 2- bis 10-mal so viele Versuche in dieselbe Zeit** [Ableitung; iPhone erst in KE1a messen].

---

## 1. Ablauf für Xander

### 1.1 Wo der Knopf sitzt (an vorhandene Wege angedockt)

| Weg heute | Was dazukommt | Code-Stelle (Andockpunkt) |
|---|---|---|
| **Takes-Blatt** (jeder Take: REC, 🎤-Take, Stimme-FANG, Import, Chor) | Knopf **„Klang erkennen“** direkt neben „Im Spektrum öffnen“ | `tkSheetPaint` [Code Z. 59831 `spk1TkBtn()`], Tipp-Weiche [Z. 59796] |
| **Stimme-FANG-Ergebnis-Blatt** bei „EINGESPIELT“ (Quelle Instrument) | in der unteren Leiste **„Klang erkennen“** (nur wenn der Take gespeichert ist) | `vsResPaint` [Z. 58781], Take via `tkQ('fang')` [Z. 58573]; Noten liegen hier schon vor |
| **Spektral-Seite → „Klang nachbauen“** (Note oder Ebenen-Menü ⋯) | **kein neuer Knopf**; dasselbe Blatt bekommt die neue Erkennung (Karte, MS 2000, Sicherheit) | `spk2KlDd` [Z. 104813], `spk11Klang` [Z. 108457] |
| **Mikro-Blatt** (Quelle Stimme/Instrument, Eingang) | **nichts Neues** in Stufe 1; nur Option E1-c (siehe §7) | `uiPrefs().micIn` [Z. 30612], Quelle `cfg.src` [Z. 58500] |
| **Audio-Datei-Import** (z. B. eine Mess-Aufnahme) | kein neuer Knopf; der Take landet im Takes-Blatt → „Klang erkennen“. Später (KE1i) erkennt die App eine Mess-Folge selbst | `imp1Pick` [Z. 111399] |

Gesperrt (Knopf grau mit kurzem Grund): während einer Aufnahme (REC/🎤-Take läuft), wenn das Audio fehlt („Audio nur auf der
eigenen Seite“, wie heute [Z. 59825]), in der Claude-App ohne Mikro-Takes (`tkAudioOk`, [INVENTAR §1]).

### 1.2 Was Xander sieht

**a) Während des Rechnens** (Blatt öffnet sofort, Hauptfaden bleibt frei):
```
Klang erkennen · Take „Kumpel 3“ · Ton A3 (0:04)   ‹ anderer Ton ›
 1 Hinhören ✓   2 Ausprobieren ▓▓▓▓▓▓░░░ 210/350   3 MS 2000 · VA · FM
 [■ Stopp – Zwischenstand behalten]
```
Nach Stufe 1 (< 0,3 s [geschätzt]) ist schon ein Start-Klang hörbar ([B Nachbau]); er wird während Stufe 2 besser.

**b) Die Erkennungs-Karte** (Beispiel, Werte erfunden zur Darstellung):
```
Klang erkannt · am nächsten: MS 2000   Ähnlichkeit: nah
 Tonquelle   2 Oszillatoren: Säge + Rechteck, leicht verstimmt (+7 ct)     ● sicher
 Filter      Tiefpass 24 dB · Grenze ca. 1,2 kHz · Resonanz mittel         ◐ ungefähr
 Filter-Lauf kurz nach unten (ca. 0,3 s)                                    ◐ ungefähr
 Lautstärke  Anschlag schnell · lang haltend · kurzes Ausklingen            ● sicher
 Bewegung    leichtes Vibrato (ca. 5 Hz)                                    ○ geraten
 Rauschen    wenig                                                          ● sicher
 Raum        Hall erkannt – beim Vergleich ausgeblendet
 [MS 2000 ✓ nah] [VA nah] [FM fern]
 [A Original | B Nachbau]  [▶ Hören]  [Weiter verbessern]
 Auf Spur: [✓ Lead] [Bass] [+ Neue Spur]          [Übernehmen]
 zu weit weg? [Original als Instrument]
```
- **Zeile antippen** → Einzelheiten: Prozent, Spanne („Grenze sicher zwischen 0,9 und 1,6 kHz“), zweitbeste Deutung („oder:
  Dreieck statt Rechteck, 22 %“), und „hört man kaum“, wenn der Wert wenig ausmacht (§2.5).
- **Engine-Chips:** zeigen je Engine „sehr nah / nah / grob / fern“; Tippen schaltet den Nachbau um (nur Vorhören).
- **Ähnlichkeit** in 4 Worten statt Zahl; die Grenzen kommen aus dem Hörtest (KE1k).

**c) A/B:** wie heute **gleich laut** (RMS-Abgleich der Note, [Code Z. 104856 `spk2KlPlay`]). A = Original-Ausschnitt, B = Nachbau
derselben Note. Nach dem Übernehmen spielt die Tastatur den neuen Klang ganz normal.

**d) Übernehmen:** Spur-Chips + „+ Neue Spur“ wie heute [Z. 104831 `spk2KlBtns`]. Der Klang heißt „Erkannt · ‹Take-Name›“, ist ein
ganz normaler Klang (MS 2000, VA oder FM) mit allen Reglern. **Ein ↶** nimmt ihn zurück (Spur bekommt ihren alten Klang, eine neu
angelegte Spur verschwindet). Die Erkennung selbst ändert am Projekt nichts → Abbrechen/Schließen hinterlässt nichts.

**e) Original als Instrument:** Wenn keine Engine näher als „grob“ kommt, steht dieser Knopf oben. Er nutzt den vorhandenen
Klangkorn-Weg („Als Instrument übernehmen“, [Z. 112326ff]): ein Sample über die Tastatur verschoben, ein ↶.

### 1.3 Sichtbare Änderungen (Regel: erst nach Xanders Freigabe bauen)

| Nr. | Wo | Was sichtbar neu ist | Paket |
|---|---|---|---|
| S1 | Takes-Blatt | Knopf „Klang erkennen“ neben „Im Spektrum öffnen“ | KE1g |
| S2 | FANG-Ergebnis-Blatt (EINGESPIELT) | Knopf „Klang erkennen“ in der unteren Leiste | KE1g |
| S3 | neues Blatt „Klang erkennen“ | Fortschritt (3 Schritte, Balken, Stopp), Erkennungs-Karte mit Sicherheits-Punkten, Engine-Chips, Ton-Wahl ‹ › | KE1g |
| S4 | Spektral-Seite „Klang nachbauen“ | statt 2 Textzeilen dieselbe Karte; zusätzlich Ziel MS 2000 | KE1g/KE1f |
| S5 | Karte | Knopf „Original als Instrument“ (bei schlechter Ähnlichkeit oben) | KE1f |
| S6 | Karte | Hinweis-Zeile bei Mikro im Raum / Bluetooth: „Besser: Kabel ins Mischpult, einzelne Töne, ohne Hall“ | KE1j |
| S7 | Hilfe (Guide) | Eintrag „Klang erkennen“ | KE1g |
| S8 | Karte (später) | „Stimme erkannt“ mit Vorschlägen Synth-Stimme / Vocoder / Original | KE1h |
| S9 | Import (später) | Hinweis „Mess-Aufnahme erkannt – 16 Töne zugeordnet“ | KE1i |
| S10 | Spur/Klang (später) | Mehrfach-Sample-Instrument („Original über die ganze Tastatur“) | KE1m |

**Unsichtbar, ohne Freigabe möglich** (R0, §5): Render-Worker, bessere Merkmale, mehr Versuche in der vorhandenen „Klang nachbauen“-
Ansicht mit denselben Texten und Knöpfen und denselben Zielen VA/FM. Nur schneller und genauer.

---

## 2. Technik

### 2.1 Aufbau: alles Rechnen im Worker

```
Hauptfaden (nur Bedienung)            KE-Worker 1..2 (Blob aus Text-Block, erst beim ersten Tipp)
 Take-ID, Ton-Wahl  ── PCM16-Ausschnitt (übertragen, nicht kopiert) ──▶  Stufe 1 Merkmale
 Fortschritt ◀── alle ≤ 250 ms: Phase, n/N, bester Abstand, Start-Patch ──  Stufe 2 Nachspielen (Engine im Worker)
 Karte / A/B ◀── Ergebnis: Patch je Engine, Wahrscheinlichkeiten, PCM des Besten ──  Stufe 3 Engine-Wahl
 Stopp ──── {stop: gen} (Ergebnis = bester Stand) ────▶
```
- **Engine im Worker:** derselbe Text wie das Live-Worklet (`sq-worklet-src`, [Z. 13965]) mit Ersatz-`AudioWorkletProcessor`/
  `registerProcessor`/`sampleRate`/`currentFrame` – genau so läuft er schon im Node-Prüfstand (`dirigent-test/v3-mk1-node.mjs`,
  [INVENTAR §4 A]). Speicherwellen-Tabellen aus dem MS-2000-Block (`MKTAB`, [Z. 9020]) wie in `v3-mk2-node.mjs`. Flacher Patch über
  `wkFlat(normalizeSound(s))` im Hauptfaden gebaut und mitgeschickt (der Store-Teil läuft nicht im Worker).
- **Zufall fest:** `Math.random` im Worker-Scope durch einen Zahlengenerator mit festem Startwert ersetzt (wie im Prüfstand), Rausch-
  Startwert/Analog-Drift/Phasen fest → derselbe Patch klingt jedes Mal gleich, der Abstand rauscht nicht [METHODEN §5.3].
- **Abbrechen:** jede Anfrage hat eine Laufnummer; der Worker prüft sie zwischen zwei Versuchen (≤ 1 Versuch Verzug ≈ 10–50 ms
  [geschätzt]). „Stopp“ liefert den besten Stand; Schließen verwirft alles.
- **Kein Hängen:** Der Hauptfaden bekommt nur kleine Nachrichten, zeichnet höchstens 4× je Sekunde neu, keine Aufgabe > 50 ms
  (Regel aus LT1, [Code Z. 110242]). Kein Netz: Chat und Verbindung zu den anderen bleiben unberührt.
- **Rückfall:** Gibt es keinen Worker (alter Browser), läuft der heutige Weg (OfflineAudioContext, ~50 Versuche) mit der neuen Karte.

### 2.2 Vorbereitung der Aufnahme
1. **Töne finden:** Bei FANG sind die Noten schon da (MELODIE-Clip). Sonst die vorhandene Tonhöhen-Analyse (Stimme-Worker,
   [Z. 58488 `vsAnalyse`]) bzw. die Spektral-Noten (SPK2/SPK4, mehrstimmig erkannt).
2. **Beste Töne wählen** (automatisch 1–3): lang (≥ 0,4 s), laut, einzeln (keine Überlappung), stabile Tonhöhe. Ton-Wahl ‹ › erlaubt
   einen anderen. Mehrere Töne verschiedener Höhe/Stärke → Tastatur- und Anschlagsverhalten werden messbar (KE1i).
3. **Weg merken:** `stGuessRoute` (Kabel / Lautsprecher-Mikro / Bluetooth, [Z. 57291]) senkt bei Mikro/Bluetooth die Sicherheit und
   schaltet auf geglättete Spektren (Drittel-Oktaven, beide Seiten gleich) [METHODEN §4.11].
4. **Mono:** Der Take ist schon mono ((L+R)/2, [Z. 57411]); ein Signal nur auf einem Kanal ist 6 dB leiser – für die Erkennung egal
   (pegelunabhängig).
5. **Ausschnitt:** Anschlag bis Tastenende + Ausklang-Fenster; Hallschwanz wird erkannt und ausgeblendet (§2.7).

### 2.3 Stufe 1 – Merkmale (sofort, Ziel < 0,3 s je Ton [geschätzt])
Erweiterung des vorhandenen `klangFeat` [Z. 104249] im Worker. Ergebnis: Merkmalvektor + Start-Patch je Engine + grobe Sicherheit.

| Was | Wie (Kurzform, Einzelheiten METHODEN §4) | Wird zu |
|---|---|---|
| Welle OSZ 1 | Quelle-Filter-Zerlegung der Obertöne (Welle × glatter Filter), gerade/ungerade, 1/k vs 1/k², Lücken → Pulsbreite; Fenster mit dem hellsten Spektrum | Säge/Puls(Breite)/Dreieck/Sinus + Wahrscheinlichkeit |
| Speicherwellen | Feinmuster der Obertöne (Trend abgezogen) gegen die 64 Tabellen (`MK_WD`, [Z. 9019]) korrelieren → Top-3 | MS 2000 OSZ 1 = Speicherwelle n (Top-3 als Hypothesen) |
| OSZ 2 | zweiter Obertonkamm (Quinte/Oktave/…), Pegelverhältnis; Einklang nur über Schwebung | OSZ 2 Welle, Halbtöne, Pegel |
| Verstimmung/Unison | Schwebung wächst mit Obertonnummer (k·Δ) ≠ Tremolo (überall gleich); viele Stimmen = unregelmäßig | Feinstimmung ct, Unison + Breite |
| Ring/Sync | Teiltöne bei f1±f2 / Buckel, der nicht mit der Tonhöhe wandert | nur als Hypothese für Stufe 2 |
| Filter | an h(f) Kurven der Filtertypen anpassen (MS 2000: 24LP, 12LP, 12BP, 12HP; VA zusätzlich 24BP, 24HP, VOKAL); Resonanz nur, wenn ≥ 2 Obertöne nahe der Grenze liegen | Typ, Grenze, Resonanz (sonst „unbestimmt“) |
| Filter-Hüllkurve | Grenze fc(t) je Zeitfenster → Menge + A/D/S/R | EG-Werte |
| Lautstärke-Hüllkurve | aus den **tiefen** Obertönen (vom Filter unberührt) | Amp A/D/S/R |
| LFO | Vibrato (Tonhöhe), Tremolo (Pegel), Wah (fc), PWM (wandernde Lücken) | LFO-Ziel, Rate, Tiefe |
| Rauschen | HNR / Energie zwischen den Obertönen; Rauschen nur im Anschlag erkannt | Rausch-Pegel |
| FM-Hinweis | Teiltöne nicht auf k·f0 oder auf-und-ab-Muster über die Zeit (Bessel) | Vor-Wahrscheinlichkeit FM, Verhältnis-Kandidaten |
| Effekte/Raum | Nachhallzeit, Echo-Abstände, wandernde Kammfilter | ausblenden + Hinweis (§2.7) |

### 2.4 Stufe 2 – Analyse durch Nachspielen (Zeitbudget 1–8 s, Standard 4 s [Vorschlag])
- **Abstand** (gleich für alle Engines, pegelunabhängig): D1 Mehrfach-STFT (log, 4 Fenstergrößen) + D2 Obertöne in dB (Halte- und
  Anschlagsteil) + D3 Hüllkurve in dB (5 ms, optional zeitverzerrt) + D4 Bewegung (fc(t), Modulations-Spektrum). Gewichte nicht
  raten, sondern am Prüfkorpus und am Hörtest einstellen [METHODEN §5.1, Q20].
- **Hypothesen statt Mischmasch:** diskrete Dinge (Welle, Speicherwelle Top-3, Filtertyp, OSZ-2-Abstand, Ring/Sync, FM-Vorlage) sind
  getrennte Kandidaten; Tonhöhe und FM-Verhältnis werden **nie frei** optimiert [Q23][Q24].
- **Suche:** je Kandidat erst Teilräume mit Nelder–Mead (Filter statisch; Filter-EG; Amp-EG; Mischung/Verstimmung; je 15–30
  Versuche), dann CMA-ES über 8–16 Werte um den Startpunkt [Q27]. Nach jedem Drittel fällt die schwächere Hälfte raus (successive
  halving [Q35]). Budget-Beispiel ≈ 350 Versuche je Ton [METHODEN §5.2].
- **Schnell genug:** Zwischenstufen mit 24 kHz und kurzem Ausschnitt (0,6–1,2 s), Endprüfung mit 48 kHz und 2 Startwerten.
  Rechnung: Render 4–13 ms je 1-s-Note [gemessen, Xeon, §0] + Merkmale/Abstand ~5–15 ms [geschätzt] ≈ 10–30 ms je Versuch am
  Xeon; iPhone 12 1,5–2,5× langsamer [geschätzt] → 15–75 ms je Versuch → im Standard-Budget 4 s mit 2 Workern ≈ 110–530 Versuche.
  Das Budget hält die Zeit, nicht die Versuchszahl (bei wenig Versuchen fällt das Aussortieren früher); „Weiter verbessern“ setzt
  mit +4 s am besten Stand fort (wie heute).
- **Wiedergabe läuft gerade?** Dann nur 1 Worker (Audio-Thread und Bedienung behalten Luft); während einer Aufnahme startet nichts.

### 2.5 Wahrscheinlichkeiten („wahrscheinlich … zu X %“)
- **Diskret** (Welle, Filtertyp, Engine): p ∝ exp(−D/T) über den besten Abstand je Hypothese; T so eingestellt, dass „70 %“ in 70 % der
  Fälle stimmt (Temperatur-Skalierung [Q34]).
- **Stetig** (Grenze, Zeiten, Verstimmung): alle Versuche gewichtet mit exp(−(D−Dmin)/Tc) → Median + 10–90-%-Spanne (weiche ABC
  [Q33]).
- **Einfluss je Regler:** ±10 % am Regler → kaum Abstandsänderung → „hört man kaum“ statt Scheingenauigkeit.
- **Anzeige:** ● sicher (p ≥ 0,8 bzw. enge Spanne) · ◐ ungefähr (0,5–0,8) · ○ geraten (< 0,5 oder Spanne > 1 Oktave) [Vorschlag;
  Schwellen in KE1e am Korpus festlegen]. **Ohne Kalibrierung keine Prozent-Zahl** (dann nur die Worte).

### 2.6 Stufe 3 – Engine-Wahl
- Kandidaten: **MS 2000** (`mk`, 2 Oszillatoren, Speicherwellen, Ring/Sync, 4 Filtertypen, Unison), **VA** (`analog`, 3 Osz., 7 Filter-
  typen inkl. VOKAL), **FM** (`fm6`, nur Vorlagen: 2 OP, 2 OP + Rückkopplung, 3 OP gestapelt) [INVENTAR §3].
- Vor-Gewicht aus Stufe 1 (Speicherwellen-Muster → MS 2000; unharmonisch/Bessel → FM; 3. Oszillator/VOKAL nötig → VA).
- Gemeinsames Budget, schwächste Engine nach jedem Drittel raus [Q35]; Sieger = kleinster Abstand. Unterschied unter der Hörschwelle
  (aus dem Hörtest) → die **einfachere** Engine, bei Gleichstand MS 2000 vor VA vor FM [Vorschlag, siehe Entscheidung E3].
- Ensemble mit Auswahl schlägt eine einzige große Engine [Q18].
- **Abbildung auf Regler:** VA rechnet in Hz/Sekunden (direkt). MS 2000 arbeitet mit 0–127: Kennlinien (Wert ↔ Hz, s, ct, LFO-Hz)
  werden **einmal offline mit der Engine gemessen** oder aus dem Engine-Code abgelesen und als kleine Tabelle mitgegeben (≤ 3 KB
  [geschätzt]); so wird keine Skalierung geraten [METHODEN §4.5].
- Ergebnis-Patch geht durch `SQStore.normalizeSound` [Z. 24344] → ein ganz normaler Klang, speicher- und teilbar.

### 2.7 Grenzen ehrlich (auf der Karte sichtbar)
| Fall | Was die App macht |
|---|---|
| **Akkord / mehrere Stimmen** | Stufe 1 nur mit nicht überlappenden Teiltönen; Stufe 2 spielt dieselben Noten mit demselben Klang nach und vergleicht das Gemisch. Karte: „Akkord – Ergebnis grob, besser einzelne Töne“. |
| **Effekte** (Hall, Echo, Chorus/Flanger) | erkennen → beim Vergleich ausblenden (Vergleich bis Tastenende + 50 ms) → Hinweis „Hall erkannt (~1,2 s)“. Effekt-Werte werden in KE1 **nicht** nachgebaut (Effekte des Nachbaus neutral, wie heute). |
| **Raumklang / Mikro im Zimmer** | Spektren glätten, Sicherheit senken, Hinweis S6. Bluetooth-Mikro: nur „grob“. |
| **Sehr kurze Töne** (< 0,3 s) | langsame LFOs/Schwebungen „unbestimmt“; Release nur geschätzt. |
| **Ein einzelner Ton** | gilt für diese Tonhöhe; Tastatur-/Anschlagsverhalten = Standardwert + „geraten“ (mehrere Töne → KE1i). |
| **Mehrdeutigkeit** (z. B. Rechteck + tiefer Filter ≈ Dreieck) | Spanne/zweitbeste Deutung zeigen statt verstecken; „klingt gleich“ heißt nicht „gleiche Regler“. |

### 2.8 Stimme als Sonderfall (KE1h)
- **Erkennen, dass es eine Stimme ist:** Formanten (Hüllkurven-Spitzen, die bei Tonhöhenwechsel stehen bleiben), unruhige Tonhöhe
  (Jitter, Gleiten), Konsonanten-Rauschen, Vibrato 5–7 Hz unregelmäßig. Formant-Hülle gibt es schon im Chor-Kern (`chr2Core`, CHR3
  [Z. 96241ff]); Vokal-Filter VOKAL a-e-i-o-u im VA [Z. 28353, 16776].
- **Angebot statt Zwangs-Nachbau:** (1) **Synth-Stimme** = VA mit Filter VOKAL (Vokal aus F1/F2) + Säge/Puls + Vibrato aus der
  Aufnahme; (2) **Vocoder** = MS 2000 im Vocoder-Modus mit dieser Spur als Eingang (Spur-Eingang gibt es schon: `mkIn = 't:<Spur>'`,
  [Z. 9479]); (3) **Original als Instrument** (Klangkorn).
- **Ehrlich:** Ein Synth macht Vokalfarbe und Verlauf nach, keine Wörter. Das steht so auf der Karte.

### 2.9 Originalklang über die ganze Tastatur (Mehrfach-Sample)
- **Heute:** kein Mehrfach-Sample-Weg [INVENTAR §6]. Am nächsten: Klangkorn „Als Instrument“ – **ein** Ausschnitt, über die Tastatur
  verschoben; klingt weit weg von der Aufnahme-Tonhöhe unnatürlich [Ableitung].
- **In KE1:** „Original als Instrument“ nutzt genau diesen Weg (kein Neubau).
- **Später, eigenes Paket KE1m:** Mess-Aufnahme (z. B. C2–C5 × 2 Anschläge, §3.4) → Zonen je Tonhöhe und Anschlag, Übergänge
  angeglichen, Speicher im Gerät. Braucht eine neue Sample-Stimme im Worklet → größerer Eingriff, nur auf Xanders Wunsch.
- **Bezug zurückgestelltes MK9 (Programm-Import):** Für Klänge, die **am Original-Gerät selbst** gebaut wurden, ist das Übertragen
  des Programms (mit MIDI in beide Richtungen und einer Hilfs-App) genauer als jedes Hinhören. MK9 wurde zurückgestellt, weil es
  kein MIDI-Interface gab (Spec Nachtrag 3, „### MK9“); mit einem MIDI-Kabel wird es wieder möglich [Ableitung]. Einzelheiten privat.

---

## 3. Ladezeit, Speicher, iPhone 12

### 3.1 Die App lädt nicht langsamer
- Neuer Code steht in einem **Text-Block** `<script type="text/plain" id="sq-ke1-src">` – wie `sq-form-src`/`sq-sr-src`, die
  `blockLoad` erst beim ersten Bedarf ausführt [Z. 113969], und wie die Worker aus Text (`g9ErkWorker`, [Z. 6384]). Beim Start wird er
  **nicht übersetzt und nicht ausgeführt**; nur die HTML-Datei wird um seine Bytes länger.
- **Größen-Budget [Ziel]:** Text-Block ≤ 120 KB roh, **≤ 35 KB gzip** (≈ +1,5 % auf 2,3 MB gzip der Auslieferung, PERF2). Hinweis:
  Die Auslieferung (PERF2 `ausliefern.mjs`) lässt `text/plain`-Blöcke bytegleich → den Block knapp kommentieren.
- Andockstellen im Haupt-Skript: nur Ein-Zeiler mit `typeof`-Schutz (Muster PERF1/LT1).
- **Erster Tipp:** Worker aus dem Block + Engine-Text bauen, Engine übersetzen: 85–317 ms am Xeon [gemessen], iPhone
  0,3–0,8 s [geschätzt] → Anzeige „Vorbereiten …“. Danach bleibt der Worker, bis das Blatt 60 s zu ist (dann beendet, Speicher frei).
- Kein Netz-Abruf, kein Modell-Download, keine GPU (WebGL/WebGPU bringen bei 1-s-Tönen nichts, WebGPU in Safari erst ab iOS 26 [Q38]).

### 3.2 Speicher-Budget [Ziel]
| Teil | Größe |
|---|---|
| Ausschnitt 3 Töne × 2 s × 48 kHz (Float32) | ≈ 1,2 MB |
| Ziel-Merkmale (STFT 4 Größen, Obertöne, Hüllkurven) | ≈ 1–3 MB |
| Engine-Text + übersetzter Code je Worker | ≈ 5–15 MB [geschätzt] |
| Versuche: nur Abstand + Parameter (≤ 2000 × ~200 B), PCM nur für die besten 3 je Engine | ≈ 2 MB |
| **Summe je Worker / 2 Worker** | **≤ 30 MB / ≤ 60 MB** [Ziel, in KE1a messen] |

### 3.3 iPhone 12 Pro Max
- Standard **2 Worker** (das A14 hat 2 Leistungskerne + 4 Sparkerne [unbestätigt]); 1 Worker, solange Wiedergabe läuft.
- Ob Safari mehrere Worker wirklich parallel rechnet und wie schnell der Engine-Code dort läuft: **erste Aufgabe von KE1a** (messen am
  Gerät über eine Test-Seite, Ergebnis in die Notizen). Fällt die Messung schlecht aus: Budget bleibt 4 s, dann eben weniger Versuche.
- Akku/Wärme: ein Nachbau = wenige Sekunden Volllast, keine Dauerlast.

---

## 4. Datenschutz

- Die Aufnahme bleibt auf dem Gerät (Take in IndexedDB `synquenzer`/`audio`, wie heute [INVENTAR §1]); der Worker bekommt nur den
  Ausschnitt im Speicher. Nichts wird hochgeladen, kein Server, kein Modell aus dem Netz.
- Ergebnis ist nur ein **Klang** (Reglerwerte). Er geht wie jeder Klang ins Projekt; im Paar-Raum sehen andere nur den Klang, nicht die
  Aufnahme. Vermerk im Klang: „erkannt aus Take ‹Name›“ (nur Name, kein Audio) [Vorschlag].
- „Original als Instrument“ legt den Ausschnitt als Take ins Projekt – wie der vorhandene Klangkorn-Weg (Audio bleibt lokal).
- Prüfung: Fake-Server-Gerüst mit WebSocket-Mitschnitt (wie MK10-06): 0 Netzaufrufe während Erkennen, A/B und Übernehmen.

---

## 5. Pakete KE1a … KE1n

Reihenfolge = Abhängigkeit. **R0** = unsichtbar (ohne Freigabe), **R1** = erste sichtbare Fassung (nach E1–E3), **R2/R3** = später.
Aufwand = reine Bauzeit [geschätzt], ohne Wartezeit auf Aufnahmen.

| Paket | Inhalt | Abnahme (messbar) | Aufwand | Stufe |
|---|---|---|---|---|
| **KE1a** Render-Worker + Messen | Engine-Text im Worker (Ersatz-Worklet-Hülle, fester Zufall, Speicherwellen-Tabellen); Zeitmessung Xeon + iPhone; MS-2000-Kennlinien | 10 Patches je Engine: Worker-Render = Node-Prüfstand bitgleich, gegen OfflineAudioContext ≤ −80 dB Differenz; Zeit je 1-s-Note am iPhone gemessen und notiert; Kennlinien monoton, ≤ 3 KB; Worker-Speicher gemessen | 5–7 h | R0 |
| **KE1b** Prüfkorpus A/B | Node: je Engine 300–500 Zufalls-Patches aus musikalischer Verteilung + 128 Kompakt-Programme + VA-Werksklänge, 3 Tonhöhen, 2 Anschläge; nur JSON (Parameter + Merkmale), keine WAVs; Störungen (Hall, Mikro-Färbung, Rauschen, Zweiklang) | gleicher Startwert → gleiche Daten (Prüfsumme); ≤ 50 MB JSON; Laufzeit notiert (≈ 25 min je Engine [geschätzt]); `df` vor dem Lauf ≥ 3 GB frei | 4–6 h | R0 |
| **KE1c** Stufe 1 Merkmale | Quelle-Filter-Zerlegung, Pulsbreite, OSZ 2, Verstimmung/Unison, Filtertyp, fc(t), Amp-EG aus tiefen Obertönen, LFO, Rauschen, FM-Hinweis, Speicherwellen Top-3 | Korpus A trocken: Wellen-Klasse ≥ 90 %, Filtertyp ≥ 80 %, Grenze Median ≤ 3 Halbtöne, Zeiten Median ≤ 30 %, Speicherwelle in Top-3 ≥ 80 % (gegen heutige Tabelle); < 300 ms je Ton (Xeon) | 10–14 h | R0 |
| **KE1d** Stufe 2 Nachspielen | Abstand D1–D4, Hypothesen, Nelder–Mead + CMA-ES, Aussortieren, Budget, Stopp, Fortschritt | Korpus A: Median-Abstand ≤ 0,7 × Wert von 4.78 (`spk2KlDist`-Skala) und besser als 4.78 in ≥ 80 % der Fälle; Budget ±10 % gehalten; Stopp-Antwort ≤ 100 ms; 0 Aufgaben > 50 ms im Hauptfaden | 8–12 h | R0 |
| **KE1e** Wahrscheinlichkeiten | Temperatur je Merkmal, gewichtete Spannen, Schwellen sicher/ungefähr/geraten, „hört man kaum“ | Korpus A (Hälfte zum Eichen, Hälfte zum Prüfen): Kalibrierungsfehler ECE ≤ 0,08; 80-%-Spannen enthalten die Wahrheit in 75–85 %; „sicher“-Zeilen stimmen in ≥ 90 % | 4–6 h | R1 |
| **KE1f** Ziel MS 2000 + FM-Vorlagen + Engine-Wahl | Parameterraum MS 2000 (Speicherwelle, OSZ 2 Ring/Sync, 4 Filter, Unison), FM 2/2+R/3 OP, geteiltes Budget, Rückfall „Original als Instrument“ | Korpus A: richtige Engine ≥ 85 %; Korpus B (über Kreuz): Teil-Parameter-Abstand dokumentiert; übernommener Klang besteht `normalizeSound` und Speichern/Laden bitgleich | 8–12 h | R1 |
| **KE1g** Ein-Tipp-Weg + Karte | S1–S4, S7: Knöpfe Takes-Blatt/FANG-Ergebnis, Blatt mit Fortschritt, Karte, Engine-Chips, Ton-Wahl, A/B gleich laut, Übernehmen, ↶, Guide | Playwright-Touch-Test hochkant + quer; Tippziele ≥ 44 px; ↶ stellt Projekt bitgleich her; 0 Netzaufrufe; Start-Kennzahlen (PERF1-Messung „bereit“) unverändert ±3 %; HTML +≤ 35 KB gzip; 3 min Wiedergabe während Analyse ohne Aussetzer | 8–10 h | R1 |
| **KE1h** Stimme | Stimme-oder-Instrument, Vokal aus F1/F2, Angebote Synth-Stimme / Vocoder / Original (S8) | Stimme vs Instrument ≥ 90 % (eigene Takes + Engine-Vokale); Vokal a/e/i/o/u auf Engine-Vokalen ≥ 80 %; Vocoder-Weg mit Spur-Eingang hörbar | 6–8 h | R2 |
| **KE1i** Mehrere Töne + Mess-Aufnahme | Merkmale über 2–16 Töne: Tastaturverfolgung, Anschlag → Filter/Pegel, Release mit bekanntem Tastenende; Mess-Folge mit Erkennungs-Signal am Anfang wird beim Import automatisch zugeordnet (S9) | Korpus A mit 8-Ton-Folge: Tastaturverfolgung Fehler ≤ 15 Stufen (von ±63), Vorzeichen Anschlag-Wirkung ≥ 90 % richtig; Mess-Folge: 16/16 Töne zugeordnet | 5–7 h | R2 |
| **KE1j** Effekte + Raum | Hall/Echo/Chorus erkennen und ausblenden, Mikro-Weg glätten, Hinweis S6 | Hall ≥ 0,5 s erkannt ≥ 90 %; mit Hall 0,8 s steigt der Abstand um ≤ 30 % gegenüber trocken; Mikro-Störung (±6 dB Neigung) Grenze-Fehler ≤ 5 Halbtöne | 5–7 h | R2 |
| **KE1k** Echte Aufnahmen + Hörtest | Korpus C (Original-Gerät, wenn Aufnahmen kommen; ideal mit übertragenem Programm als Wahrheit), Gewichte D1–D4 und Ähnlichkeits-Worte am blinden A/B-Hörtest mit Xander eichen | blind A/B (~20 Paare): neu näher als 4.78 in ≥ 70 %; iPhone ≤ 8 s je Ton im Standard-Budget; Hörschwelle für Engine-Gleichstand festgelegt | 3–4 h (+ ~20 min Xander) | R2 |
| **KE1l** Speicherwellen echt | Aufnahmen der 64 Wellen (alter Plan MK10 oder Einbau über das vorhandene Wellen-Skript) → bessere Top-3 und „≈“ weg | wie MK10-02/03: Teiltöne 1–16 ≤ 2 dB (Median ≤ 1 dB), Bezug 1/n ± 0,5 dB; Top-3-Treffer auf Korpus C ≥ 90 % | 10–12 h (MK10-Schätzung) | R3 |
| **KE1m** Mehrfach-Sample | Originalklang über die ganze Tastatur: Zonen je Tonhöhe/Anschlag aus der Mess-Aufnahme, neue Sample-Stimme (S10) | 8 Zonen × 2 Anschläge; Zonen-Übergang ohne Pegelsprung > 1,5 dB; ≤ 10 MB je Instrument; Start-Ladezeit unverändert (Block erst bei Bedarf) | 14–20 h | R3 |
| **KE1n** Stufe 4 (optional) | kleines Netz auf dem Merkmalvektor oder Werksklang-Nachbar als Startwert | gleiche Güte mit ≥ 30 % weniger Versuchen; Modell ≤ 200 KB, nur bei Bedarf geladen | 6–10 h | R3 |

**Summe:** R0 (a–d) 27–39 h · R1 (e–g) 20–28 h · R2 (h–k) 19–26 h · R3 (l–n) 30–42 h [alles geschätzt].
**Auslieferung je Fassung wie gewohnt:** Sonden, SPIELSYSTEM.md, Werkstatt, Funk-Antwort (CLAUDE.md Regel 4).

---

## 6. Testplan

**Korpora** (nur JSON, keine WAVs – Platte hat ~4,6 GB frei; unter 3 GB keine Audiodateien):
- **A – eigene Welt:** bekannte Patches je Engine (Zufall aus musikalischer Verteilung + 128 Kompakt-Programme + VA-Werksklänge),
  gerendert im Node-Prüfstand (`render-probe.mjs`/`zeit-probe.mjs`-Weg, `nice -n 10`). Wahrheit = die Patch-Werte.
- **B – über Kreuz:** VA-Klänge mit MS 2000 nachbauen und umgekehrt, FM mit VA → Bewertung über gemeinsame Regler (Teil-Parameter-
  Abstand [Q21]) und Hör-Abstand.
- **C – echt:** Aufnahmen vom Original-Gerät des Kumpels, **wenn sie kommen**: am besten MIDI-gesteuerte Mess-Folge (bekannte Töne,
  Anschläge, Haltezeiten) und, wenn möglich, das übertragene Programm als exakte Wahrheit. Vorher am Gerät: Effekte aus (trocken), ein
  zweites Mal mit Effekten. Weg und Kabel: Privat-Dateien unter `scratchpad/vx-privat/`.
- **D – Stimme:** Xanders vorhandene Gesangs-Takes (nur lokal, nur Merkmale gespeichert) + Engine-Vokale (VA VOKAL) als Wahrheit.
- **Störungen** auf A/B: künstlicher Hall 0,3–1,5 s, Mikro-Färbung ±6 dB Neigung, Rauschen 30/20 dB, Chorus/Echo an, Zwei-/Dreiklänge.

**Maße:** Hör-Abstand (D1, Mel-Cepstral, Hüllkurve dB) · Parameterfehler in Hör-Einheiten (Grenze in Halbtönen, Zeiten log-Verhältnis,
Pegel dB) · Treffer-Quoten (Welle, Filtertyp, Speicherwelle Top-3, Engine) · Kalibrierung (ECE, Abdeckung der Spannen) · Zeit (Median
und 95-%-Wert am Xeon und am iPhone) · Hauptfaden (Long Tasks) · Speicher · Netz (0 Aufrufe) · Ladezeit (Start-Kennzahlen, Bytes).

**Vergleichsbasis:** 4.78 „Klang nachbauen“ über `__spk.spk2.klang.probe` [Z. 104890] im Browser auf demselben Korpus (Vorlage
`vx/spk2/spk2-klang-probe.mjs`).

**Regression je Fassung:** vorhandene SPK-Nachbau-Probe, Takes-Blatt/FANG-Abläufe per Touch, Speichern/Laden, 3-min-Wiedergabe mit
Szenenwechseln, Pflichtprüfungen; Ladezeit-Messung wie PERF1 (Chromium 4×, Median aus 3).

---

## 7. Entscheidungen für Xander (max. 3)

| | Frage | Möglichkeiten | Empfehlung |
|---|---|---|---|
| **E1** | Wo soll der Knopf „Klang erkennen“ sitzen? | (a) Takes-Blatt **und** FANG-Ergebnis (bei „eingespielt“) · (b) nur auf der Spektral-Seite wie heute · (c) wie (a) **und** im Mikro-Blatt ein Schalter „nach FANG automatisch erkennen“ | **(a)** – ein Tipp an der Stelle, wo die Aufnahme ohnehin liegt; (c) kann später dazu |
| **E2** | Wie soll die Sicherheit aussehen? | (a) Worte sicher / ungefähr / geraten, Prozent nur beim Antippen · (b) Prozent immer sichtbar · (c) gar keine Sicherheit | **(a)** – ruhig und ehrlich; Prozent erst, wenn sie am Korpus geeicht sind |
| **E3** | Welcher Synth wird vorgeschlagen? | (a) die App nimmt den nächsten (bei Gleichstand MS 2000), die anderen als Chips zum Umschalten · (b) immer zuerst MS 2000 (wie das Gerät des Kumpels) · (c) Xander wählt vorher | **(a)** – bester Klang zuerst, Umschalten kostet einen Tipp |

Nicht zur Entscheidung, weil unsichtbar: R0 (schnellerer, genauerer Nachbau im vorhandenen Blatt) kann sofort gebaut werden.

---

## 8. Offene Punkte

1. iPhone-Zeit je Versuch im Worker und echte Parallelität in Safari – erst KE1a misst das; alle Sekunden-Angaben bis dahin geschätzt.
2. Hörschwellen (Ähnlichkeits-Worte, Engine-Gleichstand) gibt es erst nach dem Hörtest (KE1k).
3. Speicherwellen-Erkennung ist nur so gut wie die heutige Nachzeichnung; echte Wellen (KE1l) verbessern sie direkt.
4. Hardware-Weg (MIDI-Steuerung des Original-Geräts vom iPhone, Ton zurück übers Mischpult) ist nicht Teil dieses Konzepts; siehe
   Privat-Dateien. Die App selbst kann kein MIDI senden (Safari ohne Web MIDI [Q41]); Mess-Aufnahmen kommen als Audio-Datei per Import.
