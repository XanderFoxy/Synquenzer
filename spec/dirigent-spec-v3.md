# SYNQUENZER v3 — Bau-Spezifikation (verbindlich)

Stand 14.10.2026, **Review-Fassung 2** (53 Kritikpunkte geprüft und eingearbeitet, Übersicht §0.7). Status: **baufertig, verbindlich**. Zielgruppe: die Builder-Agenten, die v3 Paket für Paket bauen (ein Agent je Paket, Reihenfolge §17), und die Tester, die jedes Paket abnehmen.
Lieferobjekt: dieselbe Einzeldatei `index.html` wie in v2 (Vanilla JS, Web Audio, AudioWorklet, keine Bibliotheken, deutsche Oberfläche). Sie läuft im claude.ai-Artifact-Viewer (iPhone, Claude-App) und als Safari-Web-App.

**So liest man dieses Dokument**

- **Basis-Specs:** `scratchpad/dirigent-spec-v2.md` (hier **§v2-N**) und `scratchpad/dirigent-spec.md` (**§old-N**) gelten weiter, soweit dieses Dokument nichts anderes sagt. Bei Widerspruch gilt **dieses Dokument**. Die Konzeptdateien (`v3-ideen/SYNQUENZER-MASTER-BRIEFING.md`, `SYNQUENZER-v3-konzept.md`, `SYNQUENZER-vision.md`, `SYNQUENZER-stimme-jam.md`, die R5-Berichte) sind Begründung und Hintergrund. Verbindlich ist nur, was hier steht.
- **Basis-Build:** der v2-Endstand `synq-snapshots/WP7.html` (oder, falls später vorhanden, der neueste `WP7-fixN.html`). Arbeitskopie, Snapshot-Ablage und `CHANGES-<Paket>.md` wie in v2; den genauen Ort der Arbeitskopie legt der Orchestrator fest.
- **Zeilenangaben „Z. n“** beziehen sich auf `synq-snapshots/WP6.html`. In WP7 sind sie verschoben. Builder suchen über den genannten Funktionsnamen.
- **Kennzeichen:** **(Entscheidung)** = ein Widerspruch zwischen Konzepten ist hier aufgelöst (Liste §0.6). *(P1)* = optional im Paket. **(SE)** = Fakt nur aus einem Suchauszug. **eK** = eigene Kenntnis, ungeprüft. **gemessen** = Messung in Chromium/Node auf einer Xeon-VM, **nie am iPhone**. **unsicher** = nicht belegt.
- **Prioritäten:** alles ist P0, außer *(P1)*. Was in §18 steht, wird in v3 **nicht** gebaut.
- **IDs:** Abnahmepunkte heißen `<Paket>-NN` (z. B. `V1a-04`) und stehen gesammelt in §17. Messverfahren heißen `M-…` (§0.3, Anhang C). Regeln heißen nach Kapitel (z. B. `AR3` = Anschlag-Regel 3, `TA1` = Teil-/Ablauf-Regel 1, `KZ2` = Klangzustand-Regel 2).
- **Aufwand:** 1 Paket ≈ 4–5 h inklusive Tests (Erfahrungswert v2). Neustarts und Korrekturen kosten erfahrungsgemäß 1–2 h zusätzlich.

- **Paketnamen mit ′** (V2a′, V2c′, V2d′, V6a′) sind in der Review-Fassung eingeschobene Pakete. In Datei- und Testnamen steht `2` statt ′ (`v2d2-rec.mjs`, Abnahme-ID `V2d′-03`).

**Inhalt:** §0 Ziele und Leitlinien · §1 Bestand und Invarianten · §2 V0 Korrekturen und Schnell-UX · §3 Drum-Editor v3 · §4 Song-Ablauf (Spuren, MELODIE, Teile, Akkorde, FANG TEIL, Kette, Song-Tonart) · §5 Editor- und Melodie-Werkzeuge · §6 Klangzustände, Morph, Registrierungen · §7 Modulation: Stränge und P-Locks · §8 Mischung und Kontext-Master · §9 FM-Feld · §10 Tabellen-Oszillator und Bitmask · §11 Additiv und Teiltöne einfangen · §12 Bibliothek v3, Init, Tutorial · §13 Stimme/Audio (später) · §14 Datenmodell v4 · §15 Leistung und Größe · §16 Test-API · §17 Arbeitspakete V0a–V10c · §18 Nicht in v3 · §19 Offene Fragen · Anhang A Presets · Anhang B Drum-Tabellen · Anhang C Messverfahren · Anhang D Quellen

---

## 0. Ziele und Leitlinien

### 0.1 Was Xander will → wo es steht

| Xanders Wunsch (Runde 5, gekürzt) | Lösung | § | Paket |
|---|---|---|---|
| „Drums: zu viele gleiche Regler, Charakter fehlt; jedes Instrument seine typischen Regler“ | Typ-Makros je Instrument, großer Instrument-Kopf, TIEFE nur mit den Schichten des Typs | 3.3–3.5 | V1a, V1b |
| „FM bei der Kick larifari, nur kick-typische Bereiche“ | Makro **BISS** in 5 Stufen, Index unter der Grundton-Null | 3.2.3 | V1a |
| „Wirkung schwankt mit der Anschlagstärke, mal da, mal weg“ | Anschlag-Regeln AR1–AR8: Pegel nach dem Drive, Klang-Anschlag begrenzt, Klick über 1 kHz | 3.2 | V1a |
| „Snare: Rauschen mit eigenem Attack; kleines Filter mit Resonanz“ | Makro ANSATZ; FILTER-Zeile je Schlag mit RESO | 3.3, Anh. B | V1a, V1b |
| „HiHat/Perc gern extrem“ | Chip EXTREM (verdoppelte Bereiche), Perc-Charakter-Chips | 3.3 | V1b |
| „Man merkt nicht, welches Instrument man bearbeitet“ | Pad-Tipp wählt das Instrument; farbiger Kopf mit Namen; Wählen spielt nicht ab | 2.2, 3.4 | V0b, V1b |
| „Synth-Klang als Drum-Stimme“, „klassische Kits“ | Pad-Quelle SYNTH; Kits Boom 80, Hybrid 83, Studio 82, Hexa 81 | 3.6, 3.7 | V1c |
| „P-Locks für Drums und Synths“ | Lock-Lanes + sichtbarer LOCK-Modus | 7.4–7.6 | V5b, V5c |
| „Pegel, Spur-Sound und Master in der Spur verwirren“ | Wortliste sofort; drei Ebenen KLANG/SPUR/MASTER und MIX-Blick (direkt nach dem Song-Block) | 2.2, 8.1–8.3 | V0b, V7a |
| „Kontext-Mastering mit Rollenfragen, Vorschlägen, REMASTER, darf nicht pumpen“ | MASTER-Reiter mit Knopf [MASTERN]/[REMASTER], Rückfrage-Karte, Korrektur-Schicht, Pump-Wächter | 8.4–8.11 | V7b–V7d |
| „Song-Modus zu sperrig; man weiß nicht, was man aufnimmt; Akkorde löschen Szenen“ | Aufnahme-Ziele mit Banner, nicht zerstörend; über die Kette als ABWEICHUNG nur an den gespielten Stellen | 2.3, 4.8 | V0c, V2d′ |
| „Akkorde direkt bei der Szene, auch von Hand“ | Akkord-Zeile je Szene und Teil, Akkord-Auswahl, auch für nicht laufende Szenen (‹ Szene ›) | 4.5 | V0c, V2c |
| „FANG fängt Teile ein → Teil übernehmen? → welcher? → wohin?“ | FANG TEIL mit Drei-Zeilen-Blatt; Vorschlag ist immer ein benannter Teil mit Teil-Taste | 4.7 | V2d |
| „Part-Tasten live wie Ed Sheeran“, „Registrierungen (8)“ | Teil-Leiste mit 8 Plätzen, sichtbar in Clip- und Song-Ansicht; ein Teil = Clips aus beliebigen Szenen + Akkorde/Transposition | 4.4 | V2c |
| „Akkorde über eine fertige Kette spielen UND alles in einem Durchgang“ | Aufnahme-Ziele TEILE/AKKORDE/MELODIE frei kombinierbar | 4.8 | V2d′ |
| Schiefe Töne, wenn Clips unter wechselnden Akkord-Zeilen laufen (e-Moll-Clip unter C → C-Lydisch; Runde-2-Entscheidung E1) | „Eine Skala“ (E1 Punkt 1) als Standard für neue Projekte; Stufen-Chip „V (Dur)“ in Moll | 4.5, 4.6 | V2c′ |
| Runde 1 (B2–B4): Clips in der Matrix ziehen/tauschen/löschen, Längen-Sperre, Drum-Noten auf Synth-Spur | Matrix-Gesten, Drum → Synth-Blatt; Längen-Sperre in ROLLE | 4.2, 5.2 | V2a′, V3a |
| „Loop-Klammer oben rechts nicht erkennbar“ | Text-Taste SCHLEIFE mit Bereich auf dem Lineal | 2.3, 4.9 | V0c, V2e |
| „Melodie im Song klingt eigenartig“; „Melodie-Synth als eigene Spur“; „mehr Spuren erlaubt“ | MELODIE-Spur, bis 8 Spuren, 8 Szenen | 2.3, 4.2, 4.3 | V0c, V2a, V2b |
| „Song-Tonart erkennen, ganzen Song verschieben“ | Song-Tonart über die Kette; [−][+] chromatisch, nicht zerstörend | 4.10 | V2f |
| „Seiten sollen mitlaufen; beim Editieren (auch im gezoomten Ausschnitt) darf die Ansicht nicht mitlaufen“ | FOLGEN-Regel (FOLGT/HÄLT, HÄLT auch „von Hand“ nach Zoomen, Schieben, Seitenwahl) | 2.2, 5.1 | V0b |
| „Taktleiste: tauschen, verschieben, löschen, kopieren, rotieren, spiegeln, rückwärts“ | Taktleiste (Tipp = hinsehen, nochmal = markieren, [ALLE]) + Aktionsleiste | 5.2, 5.3 | V3a, V3b |
| „Takt-Reihenfolge programmieren → neue Lane“ | Varianten-Lane (Regel, keine Kopie) | 5.4 | V3b |
| „Groovebox-Schritteingabe auch für Synth“ | LAUF+ mit Akkord-Schritten, Lauflicht, ● SCHRITT | 5.5 | V3c |
| „Synth-Einstellungen je Szene/Clip, flüssig zum neuen Zustand fahren“ | Klangzustand ◆ und Morph bis zum Taktstrich; klingende Noten behalten Umschalt-Werte bis zum Loslassen | 6 | V6a, V6a′, V6b |
| „Jede Route als Strang Quelle → Ziel“ | MOD-Tab STRÄNGE | 7.2 | V5a |
| „Kodamo-FM-Feld“ | FM-Feld bis 8 Operatoren | 9 | V4a–V4c |
| „Bitmask“ | Tabellen-Oszillator + Bitmask-Engine | 10 | V8a, V8b |
| „Additiv: Klavier, Löwe, Sax, sphärisch, böse, sprechend“ | Tabellen-Additiv + KLANGKÖRPER + Teiltöne einfangen | 11 | V9a–V9c |
| „Bibliothek: antippen = übernehmen, nicht abspielen“ | Tipp lädt stumm, ▶ hört | 2.2, 12.1 | V0b |
| „Signature-Sounds, Vorhör-Beispiele, Audition eigener Sounds, Init, Tutorial“ | Bibliothek v3, 46 Presets, Hörprobe, INIT, 3 Lektionen | 12 | V0b, V10a–V10c |
| „Melodie einsingen, Audio-Spur“ | später, weil das Mikrofon in der Claude-App fehlt | 13 | – |
| „Eigene neue Syntheseform – alle Ideen umsetzen“ (Super-Synth, Klang-Scan, Masken-Formant) | **später (§18).** Sie bauen auf Tabellen-Oszillator und Additiv auf, die erst in V8/V9 entstehen; zuerst müssen diese am iPhone stabil laufen. | 18 | – |
| „Mehr Synth-Modelle (Klassiker-Vorlagen)“ | **später (§18).** Vorlagen brauchen die Feinschliff-Bausteine (Ringmod, Bitcrusher …) und Rechenreserve; bis dahin bringt V10b die Klangcharaktere als Presets (Anhang A.1). | 18, 12.6 | – |
| „Rauschfarben“, „Anschlag → Cutoff in beide Richtungen“ (Klang-Feinschliff) | **später (§18).** Bis dahin zeigt der graue Hinweis (K-15), warum ein Anschlag-Regler gerade nicht wirkt. | 18 | – |
| „Export WAV/Stems“ | **später (§18).** Heute gibt es „Song als Audio“ (Echtzeit-Mitschnitt, WP6). | 18 | – |

### 0.2 Leitlinien (verbindlich für jedes Paket)

- **L1 Einfach vorne, Tiefe optional.** Jede Hauptseite zeigt höchstens 6 große Regler plus höchstens 3 Zeilen mit Kleinreglern. Alles Weitere liegt hinter genau einem Reiter (TIEFE, „Spuren ▸“, „Tiefe ▾“). Für einen normalen Song braucht man keine Tiefe.
- **L2 Jede Einstellung wirkt hörbar.** Jeder Regler auf einer Hauptseite erfüllt H-1 (§0.3). Wirkt ein Regler im aktuellen Zustand nicht (Schicht aus, Welle passt nicht, Route nur mit Worklet), ist er **grau** und nennt den Grund in einer Zeile („Schicht leise“, „wirkt nur mit Puls-Welle“). Ein grauer Regler bleibt bedienbar.
- **L3 Nichts springt, nichts knackt.**
  - Audio: Parameteränderungen werden geglättet (τ ≥ 5 ms oder Rampe ≥ 10 ms). Strukturwechsel (Buffer, Engine, Algorithmus, Tabellen, Faltungen) überblenden 30–50 ms gleichleistungsgemäß (equal-power). Klingende Noten werden nie abgeschnitten, außer durch Stopp oder Choke. Prüfung mit M-KLICK **und** M-EINBRUCH.
  - **Strukturwechsel im Synth-Worklet** (Welle, Fußlage, Unison-Zahl, Filtertyp, Sync, FM-Graph, Tabelle) bei klingenden Stimmen: (a) bei Klangzuständen und Morph gilt der Wert **je Stimme ab ihrem Anschlag**; klingende Noten behalten ihn bis zum Loslassen, neue Noten bekommen den neuen (KZ3); (b) bei Bearbeitung (Editor, FELD, [A│B]) **echte Stimmen-Überblendung 30 ms**: die Stimme wird mit dem neuen Wert kopiert, die alte gleichleistungsgemäß aus-, die Kopie eingeblendet (gebaut in V4a). Die WP4-Blende `setReq`/XF (96 Samples auf 0, dann 96 Samples hoch, ≈ 4 ms Loch) bleibt nur als Rückfall ab CPU-Begrenzer-Stufe 2. **Modus mono↔poly** ist kein Strukturwechsel dieser Art: `setParams` lässt dabei alle gehaltenen Stimmen los; er bleibt eine Grundklang-Einstellung.
  - `setValueCurveAtTime` nur auf Gains, die ausschließlich dieser einen Blende gehören (z. B. A/B-Gains in K-02). Auf AudioParams, die auch andere Funktionen automatisieren (Lautstärke, Pan, Sends, Filter), ist es verboten: Jede weitere Automation im Kurvenintervall wirft `NotSupportedError` (W3C Web Audio, eK). Dort gelten `setTargetAtTime`-Stufen mit vorherigem `cancelScheduledValues(now)` + `setValueAtTime(aktueller Wert)`, jeder Aufruf in `try/catch`.
  - Bild: Eine Ansicht scrollt oder blättert nie unter dem Finger. Automatisches Blättern nur nach der FOLGEN-Regel (§5.1). Ein Zustandswechsel verschiebt kein Bedienelement um mehr als 2 px (M-ANSICHT).
- **L4 Touch zuerst.**
  - Trefferflächen ≥ 44×44 px im Hochformat, ≥ 40×36 px im Querformat. In dichten Rastern mindestens 36×34 px mit 4 px Abstand (wie v2 §2.4).
  - Kein Hover. Im Editor **kein Lang-Druck mit neuer Bedeutung:** Halten (450 ms, Bewegung ≤ 8 px) öffnet dort nur den Mod-Picker eines modulierbaren Elements (Regler, Fader, FM-Kachel), wie in v2. Auf ziehbaren Elementen (FM-Kachel) öffnet er erst **beim Loslassen** nach ≥ 450 ms Ruhe; jede Bewegung > 8 px ist Ziehen (§9.4). Außerhalb der Editoren bedeutet Halten (450 ms) überall „Blatt öffnen“ (§v2-10.3); v3 ergänzt Teil-Taste und Ketten-Block. **Matrix-Clip** (V2a′): Halten hebt den Clip an; Loslassen ohne Bewegung öffnet wie bisher das Clip-Blatt, Ziehen verschiebt (§4.2).
  - Seiten mit Reglern scrollen nie senkrecht. Nur Listen scrollen.
  - Eine Geste = ein Rückgängig-Schritt. Ein zweiter Finger wird auf Rastern ignoriert.
- **L5 Deutsch.** Alle Texte deutsch, Begriffe nach der Wortliste §0.5. Keine Marken-, Künstler- oder Titelnamen in Sound-Namen (E9); Vorbilder nur im ⓘ-Text mit „Marken gehören ihren Inhabern, keine Verbindung“.
- **L6 Alle Größen.** Geprüft werden P1 390×844, P2 375×667, P3 320×568, L1 844×390, L2 667×375 und W 844×1180 (§0.4). Kein waagrechtes Scrollen, nichts abgeschnitten, kein senkrechtes Scrollen in Editor-Körpern.
- **L7 Nichts geht verloren.** Aufnahmen ändern nur ihre gewählten Ziele. Migrationen sind verlustfrei. Ein gespeichertes Projekt klingt nach jedem Paket gleich (wo nicht ausdrücklich anders gesagt: Render-Vergleich ≤ 0,5 dB je Band, M-BAND). Jede Löschung lässt sich rückgängig machen.
- **L8 Live-sicher.** Wechsel von Clips, Teilen, Szenen, Klangzuständen und Master-Plänen wirken am nächsten Taktstrich (oder wie je Funktion angegeben). Bearbeitung im Editor ist im nächsten Durchlauf hörbar und unterbricht die Wiedergabe nicht.
- **L9 Grenzen sichtbar.** Budgets (Operatoren, Stimmen, Spuren, CPU) stehen als Klartext im Kopf („7 Op · 6 St“, „Last 31 %“). Der CPU-Begrenzer ändert nie gespeicherte Daten.
- **L10 Erklärbar.** Jedes neue Bedienelement bekommt eine Hilfe-Zeile (Menü → Hilfe) und einen LCD-Hinweis beim ersten Antippen.

### 0.3 Messverfahren und Hörbarkeits-Grenzen (verbindlich)

Alle Audio-Messungen laufen als Offline-Render mit dem App-Code (wie WP6/WP7) oder als Mitschnitt am Spur- bzw. Master-Ausgang in Chromium. Rausch-Startwerte fest, sonst Mittel über 4 Startwerte. Einzelheiten und Hilfsdateien: Anhang C.

| Kürzel | Messgröße | Definition |
|---|---|---|
| **M-PEGEL** | Pegel | RMS in dBFS im angegebenen Fenster (Standard 0–300 ms ab Anschlag) |
| **M-SPITZE** | Spitzenpegel | Abtast-Spitze in dBFS |
| **M-BAND** | Bandpegel | Energie in den Bändern 20–45, 45–90, 90–180, 180–400, 400–1200, 1200–4000, 4000–12 000 Hz; Fenster 0–30 ms (Anschlag) und 30–150 ms (Körper). „Relevant“ = höchstens 30 dB unter dem stärksten Band |
| **M-SP** | Spektraler Schwerpunkt | betragsgewichtet, Hann 2048, in Hz; Unterschiede in Oktaven |
| **M-AUS** | Ausklang | Zeit bis −20 dB unter der Spitze (Hüllkurve, 5-ms-Fenster) |
| **M-HANDY** | Handy-Maß | Energie nach Hochpass 220 Hz, 24 dB/Okt, Fenster 0–150 ms (wie DR9) |
| **M-KLICK** | Knack-Detektor | Hochpass 5 kHz, Energie in 2-ms-Fenstern; ein Fenster darf höchstens **+6 dB** über dem Median der Fenster ±20 ms liegen, außer innerhalb 3 ms nach einem geplanten Anschlag (wie WP4-Gates und H-8) |
| **M-EINBRUCH** | Pegel-Loch | M-PEGEL in 5-ms-Fenstern um den Umschaltpunkt (±50 ms); kein Fenster darf mehr als **3 dB** unter dem Mittel der Fenster davor liegen (erkennt Ausblende-Einblende-Löcher, die M-KLICK nicht sieht) |
| **M-ZEIT** | Zeitgenauigkeit | `noteLog`-Schläge gegen Soll, Toleranz ±0,002 Schlag (Launch) bzw. ±0,01 (Noten) |
| **M-LUFS** | Lautheit | integriert nach BS.1770 (K-Filter, Gate −70/−10), True Peak 4× überabgetastet |
| **M-CPU** | Worklet-Last | `engineInfo().load` bzw. `perTrack[i].load`, Median über 10 s |
| **M-ANSICHT** | Ansicht stabil | Test-API `viewState()` (§16): Ausschnitt/Seite/Scroll eines Editors; ändert sich nur nach der FOLGEN-Regel (im Zustand HÄLT, auch „von Hand“, gar nicht) |
| **M-PLATZ** | Layout | kein waagrechtes Scrollen (`scrollWidth ≤ innerWidth`), kein Element außerhalb des Viewports, Editor-Körper `scrollHeight ≤ clientHeight`, Trefferflächen nach L4 |

**Hörbarkeits-Grenzen** (eigene Festlegung; deutlich über der Pegel-Unterschiedsschwelle von ≈ 1 dB, eK; nicht mit einem Hörtest abgesichert):

| Nr. | Kriterium | Grenze |
|---|---|---|
| **H-1** | Regler von Minimum nach Maximum (Anschlag 0,9 bzw. Note C3 Anschlag 0,8) ändert mindestens eines: M-PEGEL ≥ 3 dB · ein relevantes M-BAND ≥ 6 dB · M-SP ≥ ⅓ Oktave · M-AUS ×2 bzw. ×½ | jeder Regler einer Hauptseite |
| **H-2** | Leiser Anschlag: Wirkung bei 0,45 ≥ 60 % der Wirkung bei 0,9 (im Maß aus H-1, in dB bzw. Oktaven) | jedes Drum-Makro |
| **H-3** | Stetigkeit: Stellungen 0, ¼, ½, ¾, 1 ohne Rückgang > 0,5 dB im Zielmaß | jedes Makro |

Weitere Drum-Grenzen H-4 bis H-9: §3.8.

### 0.4 Größen, Viewports, Geometrie

| Kürzel | Viewport | Rolle |
|---|---|---|
| **P1** | 390×844 Hochformat | Hauptmaß (iPhone 12–16) |
| **P2** | 375×667 Hochformat | iPhone SE/mini, knapp |
| **P3** | 320×568 Hochformat | Untergrenze, darf vereinfachen |
| **L1** | 844×390 Querformat | Hauptmaß quer |
| **L2** | 667×375 Querformat | knapp quer |
| **W** | 844×1180 | breit (Tablet, Faltgerät innen), nur M-PLATZ |

Geometrie aus v2, die gilt (§v2-2): Kopfleiste P 52 px, L 44 px. Editor-Blätter decken in P die Fläche y 52 → 541 ab (489 px), die Tastatur schrumpft auf 170 px, in L auf 110 px. Editor-Körper in P ≈ 305 px, in L ≈ 140 px. Neue Seiten dürfen diese Maße nicht überschreiten; wo eine Seite die v2-Kopfzeilen durch einen eigenen Kopf ersetzt (Drum-Editor §3.4), wird der gesparte Platz dem Körper zugeschlagen.

**Matrix-Reihen** (neu, §4.2): Mindesthöhe P 40 px, L 30 px. Reicht die Höhe nicht für alle Spuren, schaltet die Matrix auf **Spurbank** (DRUMS bleibt immer sichtbar). Gemessen (WP6, `r5/h345/tests/layout-mass.out`): Rasterfläche P1 383 px (Raster 329 + Hinweis-Kasten 48), P2 297 px (257 + 36), L1 213 px (175 + 34).

### 0.5 Wortliste (verbindlich, ergänzt §v2-0.3)

| Begriff (UI) | Bedeutung |
|---|---|
| **TEIL** | Benannte Kombination: je Spur ein Clip aus einer beliebigen Szene, „aus“ oder „bleibt“; dazu Akkord-Zeile oder feste Transposition; optional ein Teil-Klang. Jede Szene ist automatisch der Teil „Szene n“. |
| **TEIL-LEISTE** | Leiste mit 8 festen Teil-Plätzen über der Spurleiste (ersetzt den Hinweis-Kasten); steht in Clip- **und** Song-Ansicht an derselben Stelle. |
| **KETTE** | Folge von Teilen mit Wiederholung ×n. Die Kette ist der Song. |
| **SONG-ANSICHT** | Die Ansicht SONG ⇄ mit den Zeilen TEIL, AKK., MEL. und „Spuren ▸“. |
| **MITSCHNITT** | Ein mit WP6 aufgenommener Song ohne Kette (unverändert abspielbar). |
| **MELODIE** | Eigene Synth-Spur für Melodien; folgt dem Träger standardmäßig nicht (⇅ fest). |
| **AKKORD-ZEILE** | Akkorde eines Teils bzw. einer Szene, ein Kästchen je Takt, läuft im Kreis. |
| **AKKORD-AUSWAHL** | Blatt zum Setzen eines Akkords (Stufe, Grundton, Art, Bass, Text, ♪ greifen). |
| **FANG / FANG TEIL** | FANG = gespielte Noten → Clip (wie v2). FANG TEIL = Akkord- und Szenenwechsel → Teil. |
| **AUFNAHME-ZIELE** | Chips TEILE · AKKORDE · MELODIE (vor V2: SZENEN · AKKORDE · MELODIE) am ●. |
| **SCHLEIFE** | Wiederholung in der Song-Ansicht: aus / Song / Teil / Bereich. Ersetzt das Zeichen ⟲. |
| **FOLGT / HÄLT** | Zustand der Editor-Ansicht beim Abspielen (§5.1). |
| **TAKTLEISTE** | Takt-Chips über ROLLE, LAUF und SCHRITTE; Takt antippen = hinsehen, denselben Takt nochmal = markieren; [ALLE] = ganzer Clip. |
| **VARIANTE** | Nur: Abspiel-Regel aus Takten eines Clips („3×4, dann 2-1-4-3“), keine Kopie (VAR 1 …). |
| **ABWEICHUNG** | Eigene Slots oder Akkorde an **einer** Kettenstelle (`alt`), Knopf [Nur hier ändern]. Nie „Variante“ nennen. |
| **EINE SKALA** | Harmonie-Regel (E1 Punkt 1, V2c′): nach der Stufen-Umrechnung wird jeder Ton in die Zielskala gezogen (nächster Ton, bei Gleichstand tiefer). |
| **● SCHRITT** | Groovebox-Eingabe in LAUF: Ton greifen, Schritte antippen. |
| **GRUNDKLANG / ◆ KLANGZUSTAND** | Der Sound der Spur / gespeicherte Abweichung davon an einem Clip oder Teil. |
| **MORPH** | Flüssiges Fahren der Regler zu einem Klangzustand. |
| **ANTEIL** | Mischanteil im Klang (Oszillatoren, Sub, Rauschen; Drum-Schichten). |
| **KLANG-PEGEL** | Ausgangspegel eines Sounds (kalibriert, Tiefe). Bei Drums **PAD-PEGEL**. |
| **LAUTSTÄRKE** | Nur noch der Spur-Fader (dB). |
| **RÜCKWEG** | Pegel eines Effekt- oder Raum-Rückwegs (Hall, Echo, Kit-Raum, Kit-Gate). |
| **MASTER-AUSGANG** | Ausgangspegel nach dem Master (Profi). Nicht „Ausgang“ allein: „Ausgang“ bleibt der FM-Ausgangs-Operator (§v2-0.3). |
| **MIX** | Mischpult-Blatt aller Spuren mit Master-Kopf. |
| **ROLLE** | Bass · Sequenz · Akkord · Fläche · Lead · Atmo · Melodie · Gesang folgt; Drums je Pad fest. |
| **MASTERN / REMASTER / KORREKTUR** | Erster Master-Plan (Knopf [MASTERN]) / Plan neu rechnen ([REMASTER]) / bleibende Abweichungen, die Xander eingestellt hat. |
| **STRANG** | Darstellung einer Modulations-Route als Linie Quelle → Ziel. |
| **LOCK** | Wert eines Parameters, fest an einem Schritt bzw. einer Note. |
| **FELD / SCHIENE / PARKPLATZ** | FM-Feld; Ausgangsschiene; Ablage für ausgeschaltete Operatoren. |
| **MASKE / DELTA / UNTERTON** | Bitmask-Begriffe (§10). |
| **TEILTON / KLANGKÖRPER** | Additiv-Begriffe (§11). |
| **SCHICHT** | Klangquelle innerhalb einer Stimme (Drum: TON, BISS, RAUSCHEN, METALL, KLICK). „Ebene“ bleibt für spätere Clip-Ebenen reserviert (§18). |
| **BISS / ART** | Kick-/Tom-Makro für kicktypische FM / dessen Stufe SUB · RUND · HOHL · HOLZ · KNALL (Beschriftung als Wort, der Faktor ½ ×1 ×2 ×3 ×4 klein darunter). |
| **EXTREM / VARIATION** | Doppelter Reglerbereich (Hats, Becken, Perc) / Zufall je Schlag (0 = jeder Schlag gleich). |
| **HÖRPROBE** | Gespeicherte Vorhör-Phrase oder eigener Clip eines Sounds. |
| **INIT** | Neutraler Startklang zum Selbstbauen. |
| **HALBTON** | Neuer Name des Harmonie-Modus PARALLEL (nur Text). |

### 0.6 Entscheidungen (aufgelöste Widersprüche)

| # | Entscheidung | Löst auf / Begründung |
|---|---|---|
| E3-01 | **Paketfolge V0 … V10 wie vorgegeben**, jedes Hauptpaket in Unterpakete von ≈ 1 P geschnitten (V0a–V0c … V10a–V10c, §17), dazu vier eingeschobene Pakete V2a′, V2c′, V2d′, V6a′. **V7a (MIX) wird direkt nach V2f gebaut** (E3-32). Jedes Unterpaket ist allein lauffähig und prüfbar. | Recherche-Aufwände (z. B. Song-Ablauf ≈ 13–15 P) passen nicht in ein 4–5-h-Paket; Review: V2d und V6a waren real je zwei Pakete. |
| E3-02 | App-Version je Paket laut §17; **Projektformat 4 ab V2a**. Vorher nur additive Felder in Format 3, die `normalizeProject`/`SQStore` erhalten. Format 1–3 und DIRIGENT-Dateien bleiben lesbar. | JAM-Kollision #4: `cleanClip`/`normClip` warfen unbekannte Felder weg. |
| E3-03 | **Dateigrenze ≤ 3,0 MB** (statt 1,5 MB), dazu Startzeit-Abnahme (§15.3). | Die 1,5 MB setzte das Projekt selbst (§v2-17); der Viewer erlaubt 16 MB. WP7 liegt bei 1,26 MB (`synq-snapshots/WP7.html`, 1 256 418 Byte); v3 braucht geschätzt +1,5 MB (Budget §15.3). |
| E3-04 | **Spur-Datenindex bleibt stabil:** 0–3 Synth 1–4, **4 DRUMS**, 5 MELODIE, 6–7 Synth 5–6 (optional). Die Anzeige-Reihenfolge steht in `S.ui.order` (DRUMS immer zuletzt). Höchstens 8 Spuren, genau eine Drum-Spur. | Abweichung von R5-H3 (dort MELODIE = 4, DRUMS = 5): so bleiben Test-API, Clips, Song-Lanes und Dateien ohne Index-Migration gültig. |
| E3-05 | **8 Szenen** (Daten); P zeigt 4 Spalten plus Szenenbank [SZ 1–4 │ 5–8], L zeigt 8, wenn je Spalte ≥ 56 px frei sind. | Runde 1 „mehr als 4 Szenen“ war P2; Xander fragt ausdrücklich. |
| E3-06 | **MELODIE ist eine eigene Synth-Spur** (`mel:true`, ⇅ fest, Klang „Melodie-Lead“). Song-Melodien liegen je Spur (`song.mel[t]`). | Löst JAM #14 (eine Lane vs. je Spur) und die gemessene Stimmenteilung (Audit D). |
| E3-07 | **TEIL + KETTE ersetzen** JAM-Loop-Bank L1–L8, FANG ∞ und die ⊕-Kettenleiste. Clip-Ebenen (FANG ⤓, 👁) kommen **nicht** in v3 (§18). Ein WP6-Song bleibt **Mitschnitt** (§4.11; WP6 speichert keine Kette). Die API `songFromChain(chain)` erzeugt ab V2d eine Kette (§16). | R5-H3; ein Modell statt drei. |
| E3-08 | **FANG-Beschriftung hängt am Modus:** ♪ SPIELEN → FANG (Noten → Clip, wie v2); ⇅ TRANSPONIEREN (oder ⇅ gehalten) → FANG TEIL. | R2 „Ort statt versteckter Zustand“; vorhersagbar. |
| E3-09 | Teil-Wechsel live **am nächsten Takt** (Standard), je Teil umstellbar auf „am Teil-Ende“. | Offene Frage JAM/R5; Takt ist schneller. |
| E3-10 | **Träger-Rangfolge:** Hand > Teil-/Szenen-Akkorde > Kette/Song > ORIGINAL. [↩ TEIL] / [↩ KETTE] / [↩ SONG] geben am nächsten Takt zurück. | erweitert JAM T1. |
| E3-11 | **Aufnahmen sind nie zerstörend:** nur die gewählten Ziele im aufgenommenen Bereich ändern sich. | Audit D (`songRecStart` ersetzt den Song). |
| E3-12 | **Song verschieben** chromatisch und nicht zerstörend (`S.shift`, −6…+6); die Tastatur verschiebt standardmäßig mit; [Fest anwenden] schreibt in die Daten. | R5-H3 A7. |
| E3-13 | **Drum-Engine ev3** nur für neue Kits und neue Projekte. Gespeicherte ev2-Kits klingen bitgleich; KIT-Knopf [Auf v3 umstellen] (ein Undo). | §v2-7.4 „gespeicherte Songs ändern sich nie“. |
| E3-14 | Kits **808 → „Boom 80“, 909 → „Hybrid 83“** (Alias bleibt). Werks-Sounds mit Marken- oder Personennamen werden in V10b umbenannt; alte Namen bleiben als Alias für `loadPreset`. | E9. |
| E3-15 | **Synth-Pad:** höchstens 2 je Kit, zusammen höchstens 4 Stimmen; jedes Synth-Pad bekommt bei Bedarf einen eigenen Synth-Worklet-Knoten. | R5-H1 Teil 7; „Synth als Pad nicht geplant“ (antwort-kurz) ist überholt. |
| E3-16 | **Locks über Lock-Lanes plus sichtbaren LOCK-Modus** (Taste + Banner, kein Lang-Druck). Mod-Modus und LOCK-Modus schließen sich aus. | E4 „keine neue Tipp-Geste“ gegen den Elektron-Wunsch. |
| E3-17 | **Mischung in drei Ebenen** KLANG / SPUR / MASTER; Spur-Mischung in `track.mix`, bleibt beim Soundwechsel. Spur-Send-Empfehlung des Sounds nur bei unberührter Mischung; Bus-Hinweise nie automatisch. | §v2-8.2 (Mix im Sound) gegen Xanders Verwirrung; §v2-8.1 bleibt für Busse. |
| E3-18 | **Master-Ziele:** Streaming −14 LUFS (Standard), Dynamisch −16, Club −9; Club lauter nur mit grünem Pump-Wächter. True Peak ≤ −1 dBTP. | Vision „Club −8 … −6“ gegen „darf nicht pumpen“. |
| E3-19 | Messung, Glue und True-Peak-Limiter im **Master-Worklet `sq-master`**; startet es nicht, läuft die heutige `FX.Master`-Kette. | DynamicsCompressor hat keinen Sidechain-Filter und keinen True Peak. |
| E3-20 | **FM-Feld ist Standard** für neue FM-Sounds. Engine bleibt `fm6`; neu `p.fmx` (≤ 8 Op). `p.fm6` bleibt kanonisch, solange der Graph DX-tauglich ist. Die ALGO-Liste wird „Vorlagen“. | Master-Briefing 10.4; FM1/FM2-Tests bleiben gültig. |
| E3-21 | **Bitmask:** Die Delta-Hüllkurve fährt die Masken-Nummer (Mask1-Prinzip), Zwischenwerte überblenden die Nachbar-Tabellen. | E7 (A/B-Überblendung) + R4-Vorschlag: beides. |
| E3-22 | **Additiv in zwei Stufen** (Tabelle, KLANGKÖRPER). E8 präzisiert: „Teiltöne einfangen“ aus einer einzelnen Note (statisches Spektrum + Abklingraten + Rauschanteil) ist erlaubt; allgemeine Resynthese bleibt ausgeschlossen. | Aufgabe „Resynthese-Grundlagen“ gegen E8. |
| E3-23 | **Bibliothek: Tipp = laden, stumm; ▶ = hören.** | Audit F, Xander H7. |
| E3-24 | **Klangzustands-Morph im Worklet je Block**; diskrete Werte gelten am Taktstrich für neue Noten, klingende behalten ihren Wert (KZ3). Nativ nur Stufen mit `setTargetAtTime`, kein `setValueCurveAtTime` (L3). | R5-H5; der Hauptthread bündelt je Bild und liefe am iPhone stufig; Review: die WP4-Blende reißt ≈ 4 ms Loch. |
| E3-25 | **„Eine Skala“ (E1 Punkt 1) kommt als V2c′** (nach den Akkord-Zeilen, vor FANG TEIL): Standard an für neue Projekte, gespeicherte Projekte behalten ihr Verhalten (I-10), Schalter in Menü → Harmonie. Dazu in Moll der Stufen-Chip „V (Dur)“. Profi-Menü, Single Finger, Folgeart nach Rolle und „Tonart behalten“ bleiben in §18. PARALLEL → HALBTON kommt in V0b (Text). | Ab V2 laufen Clips dauernd unter wechselnden Akkord-Zeilen; der bekannte e-Moll-Fehlfall (C-Lydisch) würde wie ein Fehler der Song-Funktion klingen. E1 ist von Xander bestätigt (Runde 2). |
| E3-26 | **Spurbank statt Scrollen** in der Matrix. | Scrollen in der Matrix riskiert versehentliche Clip-Starts. |
| E3-27 | **Stimme/Audio später.** In der Claude-App fehlt das Mikrofon (Fähigkeitenliste, R3). | §13. |
| E3-28 | Klick-Typ **Knock entfällt bei der Kick (ev3)**; BISS ×3 ersetzt ihn. Bei Tom und Perc bleibt Knock. | Audit B3 (Auslöschung mit dem Sweep). |
| E3-29 | **Tastatur-Anschlag aus der Tipp-Höhe (POSITION) ist Standard** (E15), abschaltbar auf FEST 0,8. Gemessen wird an der **eigenen** Taste (U-06). Drum-Pads behalten POSITION (DR5). | E15 ist bestätigt. Xanders R5-Satz „Wirkung schwankt mit der Anschlagstärke“ betrifft die Drums (H1) und wird dort mit AR1–AR8 gelöst; das Argument „schwarze Tasten oben“ entfällt durch die Regel je Taste. Frage dazu in §19. |
| E3-30 | **Registrierungen = Teile** (8 Plätze, im Hochformat 2 Seiten à 4). | R5-H5 und H3 sind dieselbe Funktion. |
| E3-31 | Ein **WP6-Mitschnitt** bleibt unverändert abspielbar; [In Teile zerlegen] wandelt ihn verlustfrei in eine Kette (ein Undo). | L7. |
| E3-32 | **V7a (Mischung in drei Ebenen, MIX) direkt nach V2f**, vor V3. Klangzustände speichern Spur-Werte von Anfang an in `st.mix`; es gibt keinen `st.fx`-Zwischenstand und keine zweite Migration. | H2 („Pegel, Spur-Sound, Master verwirren“) wäre sonst ≈ 20 Pakete offen; V7a braucht nur V2a. |
| E3-33 | **Undo-Gruppen:** Gesten, die mehrere Datenarten ändern, sind ein Eintrag `{kind:'group', label, items}` (60-Schritte-Grenze zählt ihn einmal). Neue Arten `part`, `chain`, `proj`. | TA8 versprach „ein Undo“ für FANG TEIL, Spur entfernen, Fest anwenden u. a.; WP6 kannte nur Einzel-Arten. |
| E3-34 | **Locks:** WP6-Drum-Locks `lk.tune`/`lk.dec` bleiben **relativ**; neue Locks sind **absolut** in `lk.v = {Schlüssel: Reglerwert 0–1}`. Reihenfolge absolut → relativ → + Σ Modulation. | §7.4 „alle absolut“ widersprach dem gespeicherten WP6-Format. |
| E3-35 | Die Abweichung an einer Kettenstelle heißt **ABWEICHUNG** (Knopf [Nur hier ändern]); VARIANTE heißt nur die Takt-Reihenfolge im Clip. | Ein Wort, eine Bedeutung. |
| E3-36 | **Aufgenommene Akkorde über eine laufende Kette** werden an den gespielten Stellen als ABWEICHUNG gespeichert; in den Teil nur, wenn alle seine Stellen im Bereich lagen oder er nur einmal vorkommt. | E3-11/TA7 „nur im aufgenommenen Bereich“; sonst änderten sich unbemerkt andere Stellen. |


### 0.7 Review-Einarbeitung (Fassung 2, 14.10.2026)

53 Kritikpunkte wurden am Code (WP6/WP7) bzw. an den Messdateien geprüft. **Übernommen:** 48 vollständig, 5 mit Korrektur bzw. teilweise (◐). **Verworfen:** kein Punkt vollständig; verworfene Teil-Vorschläge stehen mit Grund in der Spalte (V2a-Teilung, Feldhöhe 30 px, Teil-Leiste „unter Spuren ▸“, Offline-Analyse als Standard, Tabellen-Kopie je Knoten als Standard).

| R | Punkt (gekürzt) | Ergebnis | Ort |
|---|---|---|---|
| R01 | FOLGEN: Ansicht „von Hand“ (Zoom, Schieben, Seitenwahl) hält nicht | übernommen: HÄLT (e) bis Tipp/Schließen/Neustart; Sprung bei `x < 0` nur in FOLGT | §5.1, V0b-06b/c |
| R02 | Taktleiste: Anzeigen und Markieren trennen | übernommen | §5.2, V3a-02 |
| R03 | FANG-TEIL-Vorschlag „Szene n“ erzeugt keinen Teil | übernommen: immer benannter Teil, „an Szene hängen“ zweite Wahl | §4.7, V2d-02, §12.9 |
| R04 | Phrase beim Durchspielen ohne Pause | übernommen: Grenzpunkte, Periode vom Ende her, Mini-Zeitleiste, Chips 1–16 | §4.7, V2d-03b/c |
| R05 | Akkorde über die Kette ändern alle Stellen | übernommen: ABWEICHUNG an den gespielten Stellen (E3-36) | §4.8, V2d′-01/02 |
| R06 | Teil-Leiste in der Song-Ansicht | übernommen ◐: feste Stelle in beiden Ansichten statt „unter Spuren ▸“ (nichts springt beim Umschalten) | §4.4, §4.9, V2e-01 |
| R07 | MASTER ohne Oberfläche | übernommen ◐: Reiter mit [MASTERN]/[REMASTER]; Offline-Analyse nur *(P1, prüfen)*, weil unklar ist, ob der ganze App-Graph offline gleich klingt | §8.8, §8.11, V7c-11…13 |
| R08 | Harmonie-Fehlklänge unter Akkord-Zeilen | übernommen: Paket V2c′ „Eine Skala“, Stufen-Chip V (Dur) | E3-25, V2c′ |
| R09 | Runde-1-Wünsche B2–B4 fehlen | übernommen: V2a′ (B3, B4), V3a (B2) | §4.2, §5.2 |
| R10 | Bitmask-Felder zu klein | übernommen ◐: Hälften 2 × 8, aber 40×34 statt 44×30 px (30 px verfehlt L4); Ziehen | §10.3, V8b-07 |
| R11 | Aktionsleiste zu breit, ohne „ganzer Clip“ | übernommen: Segment TAKT/FORM, Mini-Blätter, [ALLE], ersetzt die Werkzeugleiste | §5.2 |
| R12 | „Variante“ doppeldeutig | übernommen: ABWEICHUNG | §0.5, E3-35 |
| R13 | Gleiche Beschriftung zweier Umschalter | übernommen | §4.2, §4.4 |
| R14 | MIX verdrängt das Metronom | übernommen: ♩ bleibt, [MIX] in der Spurleiste | §8.2, V7a-09 |
| R15 | Träger-Verlauf geht verloren | übernommen: Zeile „Zuletzt“ | §4.5 |
| R16 | Akkord-Zeile nur für laufende Szene | übernommen: ‹ Szene › | §4.5 |
| R17 | FANG TEIL und Hand | übernommen | §4.7, V2d-05b |
| R18 | Drum-Editor: Wählen spielt ab, ART-Zahlen, Pad-Wahl beim Trommeln | übernommen | §3.3–3.5, V1b-03… |
| R19 / R50 | FM-Kachel: Halten gegen Ziehen; zwei Finger | übernommen | §0.2 L4, §9.4, V4b-07/07b |
| R20 | Anschlag FEST macht Regler stumm | übernommen (K-15-Hinweis) | §2.1, V0b-14b |
| R21 | §0.1 verschweigt Verschobenes | übernommen | §0.1 |
| R22 / R39 | MIX-Zugbreite, M/S zu schmal | übernommen | §8.2, V7a-03 |
| R23 | Akkord-Blatt zu hoch | übernommen: [Frei ▾], 216 px | §4.5 |
| R24 / R44 | V7a zu spät, doppelte Migration | übernommen: V7a nach V2f (E3-32) | §17.0, §8.3 |
| R25 | Quellenangabe §11 falsch | übernommen (Dateien vorhanden, Zahlen stimmen) | §11, V10b-05, Anh. D |
| R26 | `songMel`/`songLoop` ändern Bedeutung | übernommen: neue Namen `songMelNotes`, `songLoopRange` | §16, V0c-07, V2b-06 |
| R27 | Strukturblende ≈ 4 ms Loch; mono↔poly beendet Noten | übernommen: Werte je Stimme, Stimmen-Überblendung, M-EINBRUCH | §0.2 L3, KZ3, V4a-11 |
| R28 | `setValueCurveAtTime` kollidiert; Drive/WT nicht fahrbar | übernommen | §0.2 L3, KZ2, §6.4, V6a′ |
| R29 | Voll-Abgleich springt zum Grundklang | übernommen: `effective(t)` | §6.4, V6a-10 |
| R30 | Abflachen ohne Neustart bei gleichem Slot | übernommen: `re:1`, Prüfung über Ereignisse | §4.9, V2d-09, V2e-08 |
| R31 | Varianten mit anderer Länge | übernommen: `effLen`, Sperren | §5.4, V3b-09b |
| R32 | Undo für Mehrfach-Gesten | übernommen: `group`, `part`, `chain`, `proj` (E3-33) | TA8, §14 |
| R33 | Teil-Transposition über den Träger falsch | übernommen: `R.xp` nach der Abbildung | §4.4, §4.9, V2c-11 |
| R34 | Locks relativ/absolut | übernommen: `lk.v` absolut, `tune`/`dec` relativ (E3-34) | §7.4–7.6, V5b-07/07b |
| R35 | Master-Rückfall zu langsam, iOS-Fehlauslösung | übernommen | §8.5, V7b-05 |
| R36 | Tabellen-Größe und Cache | übernommen ◐: Pool im gemeinsamen Worklet-Bereich statt Kopie je Knoten (Kopie nur als Rückfall) | §10.1, V8a-03b |
| R37 | Pakete zu groß | übernommen ◐ für V2d und V6a; V2a nur teilweise: Banken bleiben (P2 passt sonst nicht), MIDI wandert nach V2a′; V4b/V10b bleiben 5–6 h (nicht sinnvoll teilbar) | §17.0 |
| R38 | INIT Drums in V0b nicht baubar | übernommen: ev2 in V0b, ev3 ab V1a | A.2, U-05 |
| R40 | Teil-Leiste zu breit | übernommen | §4.4, V2c-01 |
| R41 | Drum-Kopf L2 zu breit | übernommen | §3.4, V1b-05 |
| R42 | `.syx`/ZIP/Umlaute | übernommen | §5.3, §9.6, V3a-11, V4c-05 |
| R43 | `T.recall` mit `grid()` | übernommen: `null` | §4.5, V2c-08 |
| R45 | Drive-Ausgleich im Fader | übernommen | §8.3, V7a-02/04 |
| R46 | Datenformate (Pfade, `mel`, Rollen, `dynDb`) | übernommen | §6.7, §4.11, §14, §3.9 |
| R47 | „songTick unverändert“, E3-07 | übernommen | I-02, E3-07, §16 |
| R48 | V2f-Aufnahmewege | übernommen | §4.10, V2f-04 |
| R49 | V6a-03 nicht messbar | übernommen: `__morphProbe` + M-SP | §6.4, V6a-03 |
| R51 | FM-CPU schlechtester Fall | übernommen: Stimmenregel Kanten > 12 → 4 | §9.1, V4a-06 |
| R52 | Startzeit/PE1 nicht reproduzierbar | übernommen | §1.3, §15.3, Anh. C |
| R53 | E3-29 kehrt E15 ohne Grund um | übernommen: POSITION Standard, Frage §19 | E3-29, U-06, V0b-14 |
---

## 1. Bestand und was v3 nicht bricht

### 1.1 Was die App heute kann (Stand WP7, Kurzfassung)

Volle Liste: Master-Briefing Teil 2, `CHANGES-WP1.md` … `CHANGES-WP7.md`.

- **Matrix und Transport:** 4 Szenen × 5 Spuren (Synth 1–4, DRUMS); Start am Taktstrich; Tipp auf laufenden Clip = Stopp am Taktende; ■ doppelt = sofort; Szenen-Tonart unter ▶n; Spurleiste [KLANG][✎][⇅][M][↶]; Layouts P/L/W.
- **Aufnahme:** ● mit Einzähler, Aufnahme-Leiste, Ergebnis-Toast; Rohzeit `o`; Quantisieren Auto/Raster; **FANG** (Phrase → Clip im freien Slot).
- **Editoren:** ROLLE (Zeichnen, Auswahl, Radieren, Schritt-Eingabe, VEL-Lane, Lineal mit [Loop = Auswahl]), LAUF (einstimmig), Clip-Blatt, Drum-SCHRITTE (VEL, AKZENT, CHANCE, WIRBEL, TIMING, TUNE, DECAY).
- **Harmonie:** AKKORD/TONART/PARALLEL, Träger LATCH/ORIGINAL, Tonart-Erkennung je Clip und Szene, leuchtende Tasten.
- **Klang:** VA im Worklet (3 Osz., Unison, Sync, Ladder, 3 ADSR, 2 LFOs), WT nativ, **FM6** (6 Op, 32 DX-Algorithmen, .syx-Import), Modulation am Regler (Bitwig-Prinzip, ≤ 8 Routen), Effekte (Drive, Chorus, Hall, Echo, Pumpen, Master), CPU-Begrenzer, Bibliothek (30 VA + 4 WT + 12 FM + 7 Kits).
- **Drums (WP6):** universelle Stimme (TON, FM, RAUSCHEN, METALL, KLICK), 12 Pads mit Anschlag aus der Tipp-Höhe, Kit-Bus (Raum, Gate), Editor SOUND/TIEF/SCHRITTE/KIT/FX, Euklid, Muster.
- **Song (WP6):** SONG ⇄, ● SONG / ▶ SONG / ● MEL., Übernahme + [↩ SONG], Melodie-Lane, Kette aus Szenen (Minimal), Song-MIDI, Song als Audio.
- **Speichern:** IndexedDB-Autosave, Projekte, ältere Versionen, Datei .json mit Prüfsumme, MIDI-Export (ZIP im Viewer).
- **Test-API** `window.SYNQUENZER` (Alias `DIRIGENT`), §v2-16 und Ergänzungen aus WP6/WP7.

### 1.2 Invarianten (darf kein Paket brechen)

| # | Invariante |
|---|---|
| I-01 | **Harmonie-Kern** (`Harmony`, `Transposer`, §old-6/7) bleibt unverändert. Neue Eingaben nur dort, wo dieses Dokument sie nennt: Akkord-Zeilen rufen `T.recall(tg, b2t(beat), null)` wie die Song-Träger (§4.5); die Song-Verschiebung `S.shift` und die Teil-Transposition `R.xp` werden **nach** der Abbildung addiert (§4.4, §4.10). **Einzige Öffnung:** V2c′ ergänzt die Abbildung um „Eine Skala“ (E1 Punkt 1) hinter einem Schalter; ausgeschaltet bleibt sie bitgleich. |
| I-02 | **Scheduler** (Lookahead, Start-Quantisierung, `R.pend`), Aufnahme-Zeitregeln (`o`), FANG-Regeln FG1/FG2 bleiben. `songTick` bleibt der **einzige** Song-Wiedergabeweg; neue Quellen (Akkord-Zeilen, Kette) speisen ihn über das Abflachen (§4.9). Erweitert wird er nur laut V0c (Schleifen-Bereich), V2a (NT Spuren), V2b (Melodie je Spur), V2d (Neustart-Einträge `re`, Teil-Transposition `xp`), V2f (`S.shift`) und V6a (1 Schlag Vorschau für den Morph). |
| I-03 | **Logo „One Day in Rome“** in Kopfleiste, Menü und Icon (§v2-13, BR1–BR3). |
| I-04 | **Test-API:** alle v2-Funktionen behalten Namen, Parameter und Bedeutung; `window.DIRIGENT` bleibt Alias. Spurindizes 0–3 = Synth 1–4, 4 = DRUMS (E3-04). Neue Funktionen §16. |
| I-05 | **Dateien:** v3 liest Format 1–3 und DIRIGENT-Dateien; ab V2a schreibt es Format 4. Projektdatei-Hülle `{app:'SYNQUENZER', kind:'project', format, saved, appVersion, sum, project, sounds}` bleibt. |
| I-06 | **Bedienregeln** §v2-10.3 (eine Geste, eine Bedeutung), Undo/Redo 60 Schritte, Toast mit höchstens 2 Aktionen, kein `alert/confirm/prompt`, Plattformregeln §v2-1.7 (Touch-Hygiene, `touchstart`-preventDefault auf Gestenflächen, kein `requestIdleCallback`, Dateiwahl-`accept`-Regel, Wake Lock). |
| I-07 | **Worklet-Quelle** bleibt ein ASCII-Block ohne `</script` (Prüfskript aus WP4); Lade-Kette Blob → data:. Jede neue Klang-Engine hat einen **nativen Rückfall** oder zeigt klar „nur mit Worklet“. |
| I-08 | Der **CPU-Begrenzer** ändert nie gespeicherte Daten. |
| I-09 | Die **Demo** behält ihre Clips und Noten (alte Tests). Neue Spuren und Szenen sind in der Demo leer, außer §4.3 sagt etwas anderes. |
| I-10 | **Gespeichertes klingt gleich:** Engine-Änderungen sind versioniert (`ev` bei Drums, `p.fmx` optional, neue Schlüssel mit neutralen Standardwerten). |
| I-11 | Kein Paket darf eine **v2-Funktion entfernen**, außer dieses Dokument ersetzt sie ausdrücklich (z. B. Zeichen ⟲ → SCHLEIFE, SOUND-Reiter → KLANG). |

### 1.3 Regressionsregel und Definition of Done (jedes Paket)

1. Lies die in §17 genannten Kapitel, §v2-/§old-Stellen und die aktuelle Datei. Refaktoriere nichts außerhalb der genannten Berührungspunkte.
2. **Regression:** Alle Checklisten früherer Pakete (v2 WP1–WP7 und v3) und die alten Abnahmetests (§old-17) bestehen weiter. Absichtliche Änderungen werden mit einer `<paket>-adapt-*.mjs`-Datei angepasst, die im Kopf begründet, welche Zeile dieses Dokuments die Änderung verlangt (wie in WP6).
3. **Definition of Done:**
   - keine Konsolenfehler beim Laden und in 60 s Demo-Wiedergabe mit den neuen Funktionen in Chromium (Desktop, P1, L1 mit Touch-Emulation);
   - M-PLATZ in P1, P2, P3, L1, L2, W für jeden neuen Zustand (Liste je Paket);
   - Worklet-ASCII-Prüfung besteht; **PE1 in der v3-Fassung ohne Tracing:** 10 s Demo-Wiedergabe mit offenem Editor; rAF-Zähler ≥ 55 fps (Median über 1-s-Fenster), `PerformanceObserver('longtask')` meldet keine Aufgabe > 50 ms, `tick`-p95 aus der App-Messung ≤ 4 ms. (Die WP7-Fassung `wp7-adapt-wp1-perf.mjs` wertet einen Trace aus, dessen Puffer wegen der data:-URL des Worklets nur ≈ 1,3 s fasst und mit jedem Paket schrumpft, CHANGES-WP7.)
   - Datei ≤ 3,0 MB und innerhalb des Paket-Budgets (§15.3);
   - `CHANGES-<Paket>.md`: was gebaut ist, was vorläufig ist, jede Abweichung mit Grund, Messwerte der Checkliste, bekannte Lücken;
   - Snapshot `synq-snapshots/<Paket>.html`.
4. Ein WebKit-/iPhone-Test ist hier nicht möglich (nur Chromium erlaubt). Jedes Paket nennt in CHANGES die Punkte, die Xander am iPhone prüfen soll.

### 1.4 Werkzeuge

- Playwright: `import … from '<scratchpad>/dirigent-test/node_modules/playwright/index.mjs'`, Chromium `executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'`, `args: ['--autoplay-policy=no-user-gesture-required']`. Touch über CDP (wie die v2-Tests).
- Messhilfen: `v3-ideen/r5/h1/ana.js` (Render- und Bandmessung), `r5/audit/drum-audit.mjs` (s-Maß), `r5/h2610/pump.mjs` (Pump-Hub), `r5/h1/v3proto.js` (Kick-v3-Prototyp), WP4-Klickdetektor (`dirigent-test/wp4-gates.mjs`). Nur lesen und kopieren, nicht ändern.

---

## 2. V0 — Korrekturen und Schnell-UX

Quellen: R5-Audit am WP6-Stand (`r5/audit/`, gemessen), Vision Teil 6 (K1–K16, am WP4/WP5-Stand), v3-Konzept 1.3 (Loop-Klammer), Stimme-Jam 2.8 Nr. 1 (FANG-Fehler), Master-Briefing Teil 4. Erledigt und nachgemessen (R5-Audit): K1/K2 (Akzent +3,6 … +4,2 dB), K12 (Drum-Locks hörbar). **Vor dem Bau jeden Befund am WP7-Stand erneut nachstellen**; ist er dort schon behoben, steht das in CHANGES und der Abnahmepunkt prüft nur noch das Soll.

### 2.1 Fehler (Paket V0a)

| ID | Befund | Ursache | Korrektur (verbindlich) |
|---|---|---|---|
| **K-01** | Clap-Pegel 0 (Klatscher ≥ 2) wirft bei jedem Schlag `RangeError`; danach plant der Sequenzer alle Spuren doppelt (2 Takte Demo: Bass 36 statt 16 Noten, Arpeggio 52 statt 32, Kick auf Schlag 2 fünfmal). Auch der Pad-Tipp bleibt stumm. (gemessen) | `DrumSynth.hit`, Klatsch-Schleife Z. 6352: `exponentialRampToValueAtTime(pk*.08)` mit pk = 0. `tick()` (Z. 8388–8433) hat ein try/catch um alle Spuren; ein Fehler überspringt `R.schedBeat = b1`, das Fenster wird alle 25 ms erneut geplant, bis die 200-ms-Regel greift. | (1) In `hit`: ist `lvl·vel²·nLvl < 1e-4` (bzw. in ev3 der Schichtpegel), wird die Schicht nicht gebaut; jede `exponentialRamp…` bekommt `Math.max(x, 1e-4)`. (2) `tick()`: jede Spur in ein eigenes `try/catch`; `R.schedBeat = b1` steht in `finally`. (3) `logErr` meldet denselben Fehler höchstens einmal je 5 s. |
| **K-02** | Ändern der Gate-Länge schneidet die laufende Gate-Fahne ab: Snare mit Gate 1, Fahne fällt in 5 ms von −26 auf −40,5 dB. (gemessen) | `K.setGate` (Z. 6438) ersetzt `ConvolverNode.buffer` beim Loslassen des Reglers (`kitUndo.commit` → `drumBusApply`, Z. 8121). | Zwei Gate-Faltungen A/B im Wechsel: neue Raumantwort in die ruhende laden, dann **40 ms gleichleistungsgemäß** überblenden (`setValueCurveAtTime`, cos/sin, 32 Punkte); die alte klingt aus. Gleiches für den Raum-Hall bei Kit-Wechsel. |
| **K-03** | FM-LED der Kick zeigt „an“ bei FM = 0; der erste Tipp schaltet aus **und** setzt Osz. 2 auf 0 (Oktav-Teilton weg). (gemessen) | `LAYER_LVL.fm = [['fmI',2],['o2',0]]` (Z. 13235); `layerOn` gilt bei irgendeinem Wert > 0. | `LAYER_LVL.fm = [['fmI', 2]]`. Osz. 2 gehört zur Schicht TON. Die LED schaltet nur `fmI` (gemerkter Wert in `fmI0`). |
| **K-04** | Doppelte Regler auf der SOUND-Seite: Snare „Gate-Hall“ und „Gate“ (beide `sGate`), Clap zweimal „Raum“ (`sRoom`), Toms „Gate-Hall“ und „Gate“. | `pageDrumSound` (Z. 13494–13510) hängt die Standardreihe ohne Abgleich an die Makros. | Standard-Regler weglassen, deren Schlüssel schon als Makro vorkommt. (V1b ersetzt die Seite ohnehin.) |
| **K-05** | **Loop-Klammer L1:** Griff ┃ im Standard-Zoom nach links ziehen: Länge springt in 3 Move-Ereignissen von 4 auf 1 Takt; danach nicht mehr verlängerbar. (gemessen, `a4-loop/repro.mjs`) | Lineal-Handler rechnet mit der aktuellen Ansicht; `clampView()` begrenzt sie nach jeder Änderung neu; hinter dem Ende sind nur 1–2 Schläge sichtbar. | Während der Geste die Ansicht **einfrieren** (`ppb0`, `x00` beim `pointerdown` merken) und relativ rechnen: `len = clamp(len0 + round(dx / (4·ppb0)), 1, 16)`. Hinter dem Clip-Ende immer ≥ 1 Takt Platz; am Rand (≤ 24 px) automatisch mitscrollen (≤ 1 Takt/s). ⤢ (ganzer Clip) lässt rechts 12 % Rand. Der gelbe Knopf heißt „Zuschneiden“. |
| **K-06** | **L2 versteckte Noten:** Nach Kürzen spielen Noten hinter dem Ende weiter und stapeln sich ab dem 4. Durchlauf auf jeder Eins. (gemessen, `ghost.mjs`) | Griff setzt nur `c.len`; `scheduleTrack` spielt alle Noten. | Beim Loslassen des Griffs: Noten mit `t ≥ len·4` entfernen, Noten über das Ende auf `d = len·4 − t` kürzen (ein Undo zusammen mit der Längenänderung). Zusätzlich ignorieren `scheduleTrack`, MIDI-Export und Tonart-Erkennung Noten mit `t ≥ len·4` (Abwehr). |
| **K-07** | **FANG über Akkordwechsel** speichert falsch: unter Am gespielt 72/76, Wiederholung unter Am klingt 76/79. (gemessen, `fang-traeger-test.out`) | `capture()` (Z. 9652) rechnet alle Noten mit dem Träger beim FANG-Tipp um (`clipNoteFor(…, tm)`); REC speichert den Träger je Note (`en`). | `CAP.open` speichert je Note den Träger beim Anschlag wie REC; `capture()` rechnet jede Note mit **ihrem** Träger zurück. Der Clip-Bezug (`key`) kommt vom Träger am Phrasenanfang (`keyForRecording`). |
| **K-08** | **Träger-Anzeige** „C ±0“ bezieht sich auf die Projekt-Tonart statt auf das Gehörte (a-Moll-Szene: C-Dur zeigt ±0, klingt +3). (K3, gemessen am WP4) | `Transposer.nearestShift(root, projectKey)`, `renderCarrier`, `shownShift`. | Zahl aus der echten Abbildung: `ref = sceneRefKey()`, `n = 60 + ref.root`, `shift = T.mapEvent(n, …) − n`, rasten an `ref`. Zusätzlich die Zieltonart zeigen: „→ C-Dur (+3)“. |
| **K-09** | Editor-Kopf zeigt bei gelatchtem Träger die Projekt-Tonart für a-Moll-Noten (K4). | `applySceneKeys` (`R.keyPending`). | Anzeige direkt aus `sceneKeyOf` bzw. der Clip-Erkennung. |
| **K-10** | Leere oder reine Drum-Szene zeigt „C-Dur“ (K5). | Rückfall `S.key` in `sceneRefKey`. | Rückfall = zuletzt gehörte Szenen-Tonart; ohne solche die Projekt-Tonart. (Ab V2f: Song-Tonart.) |
| **K-11** | S&H-LFO im Start FREI bleibt bei gehaltenen Noten stehen (K6). | Neuer Wert nur bei `startVoice` und im NOTE-Zweig. | Im FREI-Zweig bei jedem Phasenumbruch neuen Zufallswert ziehen. |
| **K-12** | LFO-Tab-Chips zeigen hörbare Worklet-Routen schraffiert (K7, Rest). | Chips prüfen nur `nativeRoute(m)`. | `routeActive(i, m)` verwenden (wie MOD-Tab). |
| **K-13** | Falsche Texte (K8, K8b, K9). | `HMODES`, Vorbild-Texte. | TONART-Zeile: „(wie OP-XY Brain)“ streichen, an AKKORD hängen: „AKKORD … (Prinzip OP-Z/OP-XY)“. PARALLEL-Zeile: „(CV, wie MPS/KeyStep)“ → „(Halbtöne wie ein CV-Keyboard)“. OB-Brass: „Oberheim OB-X/OB-Xa („Jump“, Quellen uneinig)“. |
| **K-14** | CPU-Begrenzer Stufe 1–2 unsichtbar (K13). | Badge erst ab Stufe 3. | Ab Stufe 1 Badge „CPU 1“/„CPU 2“/„CPU 3“ (L/W Chip, P statt „TAKT“-Beschriftung, wie §v2-14.3). |
| **K-15** | Mod-Ziele wirken nur unter Bedingungen, ohne Hinweis (K15). | – | In jeder MOD-Zeile und am Regler-Ring ein grauer Hinweis, wenn die Route im aktuellen Klang nichts bewirkt: PW ohne Puls-Welle, Osz.-n-Ziele bei Anteil 0, Uni-Verstimmung bei Unison 1, Filter-Ziele bei FM-Filter-Bypass. Text „wirkt erst mit …“. **Ab V0b zusätzlich:** Steht der Tastatur-Anschlag auf FEST (U-06), tragen anschlagsabhängige Regler und Routen (FILTER-ANSCHLAG, Anschlag → Lautstärke, Routen mit Quelle Anschlag) den grauen Hinweis „Tastatur spielt fest 0,8 – wirkt bei Noten mit eigener VEL oder mit Anschlag POSITION“; Tipp auf den Hinweis schaltet POSITION ein (ein Undo). |
| **K-16** | Song: Träger-Chip zeigt „A“, obwohl a-Moll klingt. (gemessen) | Chip nutzt den Grundtonnamen eines `single`-Ziels. | Chip zeigt den **gehörten** Akkord (`Harmony.chordName` der Abbildung), bei `single` den Namen der Stufenleiter („Am“). |
| **K-17** | Der native VA-Rückfall („ECO-Klang“) ist 3–4 dB leiser als das Worklet (CHANGES-WP7, bekannte Lücke). | Mono-Stimmen direkt in den StereoPanner der Spur (WP4-Stand); WP7 hat nur den FM-Pfad angeglichen. | Wie WP7 für FM: Pan-Gesetz des Worklets (√2 in den StereoPanner, Mitte = 1) und 5-Hz-DC-Blocker auch für native VA/WT-Stimmen. |

### 2.2 Schnell-UX (Paket V0b)

| ID | Was | Regel (verbindlich) |
|---|---|---|
| **U-01** | **Bibliothek: Tipp = laden, stumm.** | Tipp auf den Namen lädt (ein Undo), es erklingt **nichts**. Toast „‚Name‘ geladen“ mit [▶ Hören] [Rückgängig]. ▶ links in der Zeile (44×48 px) = Vorhören, wird zu ■; höchstens ein Vorhören gleichzeitig; Stopp bei ■, ▶ eines anderen Sounds, Schließen, Tastendruck (20-ms-Ausblendung, vorhanden). Gilt für Sounds und Kits. Lädt man den gerade vorgehörten Sound, läuft das Vorhören ohne Lücke weiter. Ursache heute: `brTap` (Z. 13145) ruft `previewStart` (Z. 13159). |
| **U-02** | **FOLGEN** in ROLLE, LAUF und SCHRITTE | Vollständig §5.1 (FOLGT/HÄLT inkl. „von Hand“ nach Zoomen, Schieben, Seitenwahl; Anzeige im Editor-Kopf, Lauf-Punkt). |
| **U-03** | **Pad-Tipp wählt das Instrument** | Bei offenem Drum-Editor wählt ein Pad-Tipp (spielt wie bisher) das Instrument: SOUND/TIEF zeigen es, SCHRITTE springt auf seine Zeile. **Ausnahmen (Fingerdrumming):** Ein Pad-Tipp wählt nicht, solange ● aufnimmt, und nicht, wenn der letzte Tipp auf ein **anderes** Pad weniger als 300 ms zurückliegt. KIT-Schalter „Pad wählt Instrument“ (Standard an). Ursache: `padHit` (Z. 9643) wählt nicht. |
| **U-04** | **Benennung (Wortliste §0.5)** | Umbenennungen sofort, Orte bleiben bis V7a: OSZ › MIX-Gruppe „ANTEIL“; Mod-Ziele „Pegel Osz n“ → „Anteil Osz n“; „AUSGANG“ (Sound-`level`) → „KLANG-PEGEL“; FX › SPUR „LAUTSTÄRKE“ zeigt zusätzlich dB als hörbaren Gesamtwert `20·log10(vol²/(1 + 1,5·drive))` (inkl. Drive-Ausgleich, §8.3); Drum SOUND „Pegel“ → „PAD-PEGEL“; TIEF-Schichtpegel → „ANTEIL“; KIT „Gate-Pegel“/„Raum-Pegel“ → „GATE-RÜCKWEG“/„RAUM-RÜCKWEG“; Menü › Klang „Master-Lautstärke“ → „MASTER-AUSGANG“; Amp-Hüllkurven-Seite → „LAUTST.-HÜLLK.“; „Bei Wechsel: Mitziehen/Halten“ → „Gehaltene Töne bei Akkordwechsel: mitziehen / halten“; Harmonie-Modus PARALLEL → **HALBTON** (Daten unverändert `mode:'parallel'`). Die Seiten HALL, ECHO, MASTER im Sound-Editor bekommen über dem Körper ein amberfarbenes Band (24 px) „GLOBAL · wirkt auf alle Spuren“. Kein sichtbares Etikett heißt nur noch „Pegel“. |
| **U-05** | **Init und Neu** | Menü → Projekt → [Neu ▾] mit [Mit Startsounds] (heutiges Verhalten) und [Leer (Init)]: alle Synth-Spuren INIT Analog, Drums INIT-Kit (in V0b als ev2 mit den WP6-`DEFAULTS` je Modell, Pegel .85, Raum 0, Gate 0, keine Locks; V1a ersetzt es durch die ev3-Fassung aus Anhang A.2), keine Clips, kein Song, 120 BPM, Projekt-Tonart C-Dur mit Erkennung, Sends 0. Projektnamen mit Zeitstempel: „Projekt · Mi 14.10. 21:40“ (E12); Sounds beim Sichern ohne Namen: „BASS 14.10. 21:40“ (Kategorie + Zeit). Verlauf je Projekt (`hist:<id>:<ts>`; alte globale Einträge bleiben lesbar). Im Editor-Kopf (Synth und Drum) ⋯ → „Init“ (ein Undo, Toast mit [Rückgängig]). Bibliothek: Kategorie **INIT** mit INIT Analog, INIT FM, INIT Tabelle, INIT Drums (Werte Anhang A.2). |
| **U-06** | **Tastatur-Anschlag** | Menü → Bedienung → „Tastatur-Anschlag: POSITION │ FEST (0,8)“ (**Standard POSITION**, E15/E3-29). POSITION: 0,45 an der Oberkante der **eigenen** Taste … 1,0 an ihrer Unterkante (schwarze und weiße Tasten gleich behandelt). Bei FEST erscheint der K-15-Hinweis an anschlagsabhängigen Reglern. |
| **U-07** | **Hilfe** | Neue Hilfe-Zeilen für U-01 bis U-05 (Menü → Hilfe). |

### 2.3 Song-Sofortmaßnahmen (Paket V0c, im WP6-Song-Modell)

Ziel: Der WP6-Song wird sofort verständlich und verliert nichts mehr. Die Begriffe sind schon die v3-Begriffe; V2 baut darauf auf, ohne die Bedienung umzuwerfen.

**S-01 Aufnahme-Ziele, nicht zerstörend**
- In der Song-Ansicht steht unter dem Transport eine Zeile **Aufnahme** (32 px P, 28 px L) mit drei Chips: **[SZENEN] [AKKORDE] [MELODIE]** (ab V2d heißt SZENEN → TEILE).
- Standard: Ist der Song leer, sind alle drei an (heutiges Verhalten). Hat der Song Inhalt, ist nur [MELODIE] an.
- **● SONG** nimmt nur die gewählten Ziele im aufgenommenen Bereich auf:
  - Transport steht und Song vorhanden: ● startet ▶ SONG ab Takt 1 (oder ab dem gewählten Lineal-Takt) und nimmt dabei auf.
  - Transport läuft (Clips, keine Song-Wiedergabe) und Song vorhanden: am nächsten Taktstrich startet ▶ SONG ab Takt 1, die Aufnahme läuft ab dort.
  - Song leer: wie WP6 (stehend ab 1.1, laufend ab dem nächsten Taktstrich als Song-Takt 1).
  - **SZENEN:** Für jede Spur, deren Clip während der Aufnahme gestartet oder gestoppt wird, werden ihre Lane-Einträge ab dem ersten solchen Ereignis bis zum Aufnahme-Ende ersetzt. Spuren ohne Ereignis bleiben.
  - **AKKORDE:** Träger-Einträge in Takten, in denen ein neuer Akkord gespielt wurde, werden ersetzt (je Takt gewinnt der jüngste Durchgang). Takte ohne neuen Akkord bleiben.
  - **MELODIE:** Overdub wie [● MEL.] (bestehende Noten bleiben).
  - Ende: ● erneut oder Stopp. Ein Undo-Schritt (`kind:'song'`).
- **Banner** über dem Raster und in der Hauptansicht (amber, 28 px): „● nimmt auf: Akkorde · ab Takt 3 · Szenen und Melodie bleiben“. Der Chip-Text am ● zeigt die Ziele: „● AKK“, „● AKK+MEL“, „● ALLES“.
- Vor dem Start steht unter dem ● klein, was überschrieben wird: „überschreibt Akkorde ab Takt 3“.
- `songRecStart` (Z. 8616–8631) legt **keinen** neuen Song mehr an, wenn einer existiert.

**S-02 SCHLEIFE statt ⟲**
- Das 17-px-Zeichen ⟲ (Z. 9969) wird eine Text-Taste mit Hintergrund: **[SCHLEIFE: aus]** / **[SCHLEIFE: Song]** / **[SCHLEIFE: Takt 3–6]**. Tipp öffnet ein Mini-Blatt mit [aus] [Song] [Bereich].
- **Bereich:** Das Lineal zeigt ein grünes Band mit zwei Griffen ┃. Erst-Setzung: Tipp auf einen Takt = Start, Tipp auf einen zweiten = Ende. Griffe ziehen mit eingefrorener Ansicht (wie K-05). Daten: `song.loop = {on, a, b}` (Takte; Migration `loop:true` → `{on:true, a:0, b:bars}`).
- **Test-API (I-04):** `songLoop(true|false)` bleibt wie in WP6 (Rückgabe boolean, setzt `on` und lässt den Bereich stehen); der Bereich kommt über die neue Funktion `songLoopRange(o?) → {on, a, b}` (§16).
- Wiedergabe: am Bereichsende Sprung zum Bereichsanfang, phasengleich (wie das heutige Song-Ende mit Schleife).

**S-03 Akkorde von Hand in der Song-Ansicht**
- Tipp auf eine TRÄGER-Zelle (Takt n) öffnet die **Akkord-Auswahl** (§4.5; in V0c ohne [♪ greifen] und ohne [÷2]). Gewählt → Träger-Eintrag am Taktanfang, bestehende Einträge in diesem Takt werden ersetzt. Tipp auf einen vorhandenen Chip → derselbe Dialog mit [Löschen]. Ein Undo je Änderung.
- Die Akkord-Auswahl ist ein eigenes Modul `ChordPick` (wird in V2c für Akkord-Zeilen wiederverwendet).

**S-04 Melodie verständlich**
- **Befund (gemessen, R5-Audit D und H3):** Die Song-Melodie wird **nicht** transponiert; sie spielt genau wie gespielt (Audit: C5 D5 E5 F5 = 72/74/76/77 unter dem Träger A; H3: 72/76/79/81 unter F, während ein Clip auf Synth 1 von 36 auf 41 umgerechnet wird). Das ist gewollt (§v2-3.9). „Klingt eigenartig“ kommt vor allem von der **Stimmenteilung**: Die Melodie läuft über die Stimmen ihrer Spur (`songTick` → `spawnVoice`); auf einer MONO-Spur mit Clip springt die einzige Stimme zwischen Clip und Melodie (gehaltene Note: +20 … +35 dB statt durchgehend ≈ +105 dB auf einer freien Spur), auf Pop-Pluck (6 Stimmen) ist eine gehaltene Note nach ≈ 0,5 s weg. Dazu kommt (plausibel, ungemessen) der LEGATO-Glide von Mini-Lead und dass die Melodie späteren Akkordänderungen nicht folgt. Endgültige Lösung: MELODIE-Spur mit eigenen Stimmen (V2b). Sofort:
- Melodie-Spur-Vorschlag beim ersten ● SONG: die Synth-Spur **ohne Clips im Song**, bevorzugt nicht MONO/LEGATO; sonst die gewählte.
- Spielt die Melodie-Spur zugleich Clips **und** ist ihr Klang MONO oder LEGATO: Hinweis-Toast „Melodie und Clips teilen sich eine Stimme – Melodie klingt abgehackt“ mit [Freie Spur nehmen] (setzt `melodyTrack`, ein Undo).
- Beschriftung der Zeile: „MELODIE · S4 · ⇅ fest“; Hilfe: „Die Melodie klingt immer genau wie gespielt und folgt späteren Akkordwechseln nicht.“

**S-05 Träger-Chip-Namen** = K-16 (gehört inhaltlich zu V0a; wird dort gebaut).

### 2.4 Übrige bekannte Punkte und wohin sie gehen

| Punkt (Quelle) | Ziel |
|---|---|
| K1/K2 Akzent, K12 Drum-Locks (Vision Teil 6) | erledigt in WP6, nachgemessen (R5-Audit A) |
| K10 Anschlag Bildschirmtastatur | V0b U-06 (Option, E3-29) |
| K11 FILTER-Anschlag schwach; Akzent bei tiefem Bass schwach (R5-H7: +0,6 dB) | §18 Klang-Feinschliff (bipolarer Anschlag → Cutoff); bis dahin K-15-Hinweise „wirkt nur mit Filter-Hüllkurve“ und (bei FEST) „Tastatur spielt fest 0,8“ |
| K14 True Peak −0,6 dBTP | V7b (True-Peak-Limiter) |
| K16 Projektnamen, Verlauf global | V0b U-05 |
| e-Moll-Clip + Taste C → C-Lydisch (Master-Briefing Teil 4) | **V2c′** „Eine Skala“ (E3-25) |
| E-Dur in a-Moll wechselt ganz nach E-Dur; Taste H in a-Moll klingt vermindert (leitereigen H°); Yamaha-Griff B♭+C | §18 Harmonie-Paket („Tonart behalten“ erst nach Hörtest, Profi-Menü, Single Finger); in V2c′ nur der Stufen-Chip „V (Dur)“ in Moll, damit die übliche Dominante E-Dur einen Tipp entfernt ist |
| Kein Startpegel der Filter-Hüllkurve; Quietsch-Hinweis hört nicht hin; Rauschen nur weiß | §18 Klang-Feinschliff |
| Logo-Konturen evtl. wellig | am iPhone prüfen lassen (CHANGES V0a) |
| Bibliotheks-Import legt gleiche Klänge mit verschiedenen Namen zusammen | V10a (§12.8) |
| Pop-Bass DX spielt den Grundton bei 16–33 Hz, am Handy fast nichts (CHANGES-WP7) | V10b: als „Pop-Bass FM“ eine Oktave höher bzw. mit zweitem Ausgang ×1 nachstimmen (PR8, M-HANDY ≥ −20 dB) |
| Native FM-Routen `fmbright`/`op1…6` nur mit Worklet (CHANGES-WP7) | bleibt (gekennzeichnet „nur mit Worklet“, I-07) |
| Drum-Pads: kein Instrument-Kopf, „KICK · KICK“, TIEF nur Dropdown, Pad-Anschlag streut 16 dB (R5-Audit B4/B5) | V0b U-03, V1b (Kopf), V1a (AR1), V1b (Vorhören mit festem Anschlag) |
| MOD: Quellen-Kacheln ohne Ziel, quer nur 3 Zeilen (R5-Audit G) | V5a |
| Keine Ansicht aller Spuren, Master in jedem Spur-Editor (R5-Audit C) | V0b U-04 (Band), V7a |

---

## 3. Drum-Editor v3

Quellen: R5-H1 (`r5/h1/`, gemessen), R5-Audit B (gemessen), §v2-7, Anhang B. Vorbilder (SE): Nord Drum 3P (Punch, Bend, Dyn Filter, Dynamic Decay), TR-8S (typgerechter CTRL-Regler), DrumBrute Impact (COLOR je Sound), Model:Cycles (ein Regler = mehrere Parameter), Ruismaker FM (FM-Kick mit 4 Reglern).

### 3.1 Ziel und Befund

**Ziel:** Jedes Instrument hat seine eigenen, hörbar wirkenden Regler; man sieht auf einen Blick, welches Instrument man bearbeitet; die Wirkung schwankt nicht mehr mit dem Anschlag.

**Befund WP6 (gemessen):**
- Alle Instrumente zeigen dieselben vier Zusatzregler und in TIEF dieselben 6 Schichten. TIEF: bei der Kick 22 von 64 Reglern tot, beim Clap 33 von 64.
- Kick-KLICK 0 → 100 %: höchstens 1,3 dB in jedem relevanten Band (unhörbar). Grund: Typ „Knock“ ist ein Chirp 320 → 210 Hz und liegt im Sweep-Bereich (Auslöschung bis −1,1 dB); Klick-Beitrag schwankt mit dem Anschlag (Rom Pop: 0,96 dB bei Anschlag 30, 0,20 dB bei 80).
- Kick-FM Index 0 → 2 bei ×1: Knock-Band −2,3 dB, Handy-Maß −1,3 dB (mehr FM = weniger Druck); erst ab Index ≥ 6 hörbar, dann als Zischeln 4–12 kHz.
- Der Pegel `lvl·v²` wirkt **vor** dem Drive: Drive 0 → 1 bringt bei Anschlag 1,0 +16,4 dB Obertöne, bei 0,7 +6,7 dB, bei 0,45 −3,3 dB. Pegelspanne der Rom-Pop-Kick zwischen Anschlag 0,35 und 1,0 nur 1,7 dB.
- Zufällige Startpunkte von Rauschen/Metall: HH zu σ 1,67 dB Spitze von Schlag zu Schlag.

### 3.2 Engine ev3

#### 3.2.1 Signalweg je Schlag (ev3)

```
Schichten (phasenstarr, gemeinsamer Start t, gemeinsame Sweep-Automation)
  TON (Körper, Osz. 2) ──┐  BISS moduliert die Frequenz des Körpers direkt (kein zweiter Träger)
  RAUSCHEN ──────────────┼─► Σ ─► Schlag-Filter (hf*, optional) ─► Drive (Nennpegel, Auto-Gain) ─►
  METALL ────────────────┤        Pegel g(v) ─► Akzent (+3…4 dB) ─► Pad-Strip (Pan, Raum, Gate) ─► Kit-Bus
  KLICK (Hochpass cHp) ──┘
```

- Der **Drive bekommt immer den Nennpegel** (Anschlag 1,0). Der Anschlag wirkt als Pegel erst danach (AR1) und als begrenzter Klang-Anschlag auf ausgewählte Ziele (AR2).
- Das Schlag-Filter sitzt **im Schlag**, nicht im Kanal: Ändern wirkt ab dem nächsten Schlag, der klingende läuft unverändert aus (L3).
- Kosten: ein Biquad je Schlag nur bei `hfTyp ≠ ''` (§v2-14.4 Regel 1).

#### 3.2.2 Anschlag-Regeln AR1–AR8 (nur ev3)

| Regel | Inhalt |
|---|---|
| **AR1 Pegel nach Drive und Filter** | `g(v) = 10^(−(1−v)·DYN/20)`. `DYN` = `kit.dynDb` in dB, 0–24, Standard **12** (eigener Name, weil der WP6-Slot-Schlüssel `dyn` 0–1 etwas anderes bedeutet) (Anschlag 0,35 → −7,8 dB). Gemessen am Prototyp: Spanne 7,8 dB ohne Rückgang; Drive +7,4 dB Obertöne bei jedem Anschlag. |
| **AR2 Klang-Anschlag getrennt und begrenzt** | Nur über TIEFE › ANSCHLAG (Anhang B.5). Klang-Anschlag `tv = min(1, v + 0,3·Akzent)`. Jede Zuordnung ändert ihr Ziel stetig in **eine** Richtung und nimmt höchstens die Hälfte des Makrowerts weg: Punch/Bend `×(1 − a·(1−tv))` mit a 0–0,5 (Std. 0,3); BISS-Index `×(1 − a·(1−tv))`, a 0–0,5 (Std. 0,4); Filter `Cutoff·2^(−aF·(1−tv))`, aF 0–2 Okt (Std. 0,5); Decay `×(1 + aD·(2·tv − 1))`, aD −0,5…+0,5 (Std. 0); Snappy (Snare) `×(1 − a·(1−tv))`, a 0–0,5 (Std. 0,3). Der WP6-Schlüssel `dyn` wird in ev3 nicht benutzt. |
| **AR3 FM-Grenze** | Bei KICK und TOM: FM-Index ≤ `IMAX(r)` (§3.2.3). Bei HH, BECKEN, PERC gilt die Grenze nicht. |
| **AR4 Phasenstarr** | Alle Oszillatoren eines Schlags starten zur selben Zeit bei Phase 0 und teilen eine Sweep-Automation. BISS ist Modulation des Körpers, keine Kopie (Messung E7: Kopie deutlich schwächer). |
| **AR5 Bänder trennen** | Der Kick-Klick läuft durch einen Hochpass `cHp` (Std. 1000 Hz, 12 dB/Okt). Typ Knock entfällt bei der Kick (E3-28). Gemessen: Interferenz 0,0 … +0,1 dB statt −1,1 dB. |
| **AR6 Wiederholbarkeit** | Startpunkt von Rauschen und Metall fest je Instrument (aus der Slot-ID abgeleitet). `var` (VARIATION) 0–1 mischt Zufall dazu: Startpunkt `+ var·rand·1,8 s`, Klatsch-Abstände `±15 %·var`. Standard: Kick/Tom 0, Snare 0,2, Clap/HH/Shaker 0,5. |
| **AR7 Akzent** | Pegel +3 … +4 dB nach dem Drive (wie WP6, `1 − (1 − Akzent)³`), Klang wie Anschlag × 1,3 (über `tv`). |
| **AR8 Einstimmige Pads** | Ein neuer Schlag blendet den alten in 3 ms aus (wie WP6). Option „Poly 2“ nur bei BECKEN, TOM, PERC (TIEFE › AUSGANG). |

#### 3.2.3 BISS (Kick, Tom)

- **Grundton-Null je Verhältnis** (gerechnet, `r5/h1/bessel-check.out`): ×½ 2,30 · ×1 1,85 · ×2 3,15 · ×3 2,45 · ×4 2,45.
- **IMAX** (Obergrenze knapp darunter): ×½ **2,2** · ×1 **1,8** · ×2 **3,0** · ×3 **2,3** · ×4 **2,3**.
- **Makro BISS** b (0–1) und **ART** r ∈ {½ SUB, ×1 RUND, ×2 HOHL, ×3 HOLZ, ×4 KNALL}:
  - Index `I = b^0,7 · IMAX(r) · (1 − aBiss·(1−tv))` (AR2).
  - Index-Zeit `bssT = 30 + 150·b` ms, exponentiell mit τ = bssT/3.
  - Modulator-Frequenz = `r · frq`, folgt derselben Sweep-Automation wie der Körper (der Index bleibt während des Sweeps konstant, wie WP6).
  - Der Modulator wirkt **direkt auf die Frequenz des Körpers** (Prototyp `kickV3`, Modus `'dir'`, `r5/h1/v3proto.js`).
- **Gemessen** (Prototyp, BISS 0 → 1, Anschlag 0,9 / 0,45; Index im Prototyp linear in b): ½ SUB Handy +3,5/+3,4 dB, Sub 20–45 Hz +9,3/+9,9 dB · ×1 RUND +4,6/+4,5 · ×2 HOHL +8,4/+7,5 · ×3 HOLZ +9,8/+9,3 · ×4 KNALL +10,5/+10,4; Grundton höchstens −1,5 dB; RMS ±0,1 dB. Die Kurve `b^0,7` ist beim Bau mit H-3 zu prüfen.
- Die alte TIEF-Schicht FM (`fmI`, `fmDec`, `o2r`) bleibt erreichbar (TIEFE › BISS fein: „Index frei“ hebt die Grenze für Effekte auf, Hinweis „über der Grundton-Null: Kick wird dünn“).

#### 3.2.4 KLICK (ev3)

- Typen: Kick **Puls, Tick, Blip** (kein Knock); Tom/Perc zusätzlich Knock.
- Pegel `cLvl·3·(0,6 + 0,4·tv)` wie Prototyp; Hochpass `cHp` (Kick Std. 1000 Hz, Tom 600 Hz, sonst 0 = aus).
- Gleiche Polarität wie die erste Sinus-Halbwelle des Körpers.

#### 3.2.5 Schlag-Filter (neu, alle Typen)

- `hfTyp` ∈ {'' (aus), 'lowpass', 'bandpass', 'highpass'}, `hfFrq` 40 Hz – 16 kHz (exponentiell), `hfRes` 0–1.
- RESO-Abbildung: LP/HP `Q = hfRes·18` (in Web Audio ist Q bei LP/HP ein Resonanzwert in dB; eK nach MDN, **vor dem Bau gegen die Web-Audio-Spezifikation prüfen**), BP `Q = 0,7 + hfRes·11,3` (linear).
- Pegelausgleich: `−0,15 dB je dB Resonanz` (gemessen +2,9 dB bei 18 dB Resonanz; Faktor beim Bau per Messung nachstellen, Ziel: RMS-Änderung durch RESO ≤ ±2 dB).
- Hüllkurve `hfEnv` ±4 Okt mit `hfDec` 10 ms–2 s; Anschlag → Filter über AR2.

#### 3.2.6 Drive

- Kurve wie WP6 (`DrumSynth.driveCurve`), `oversample 'none'`.
- **Auto-Gain:** nach dem Shaper `×1/(1 + 1,2·drv)` (Prototyp); Ziel H-9 (RMS-Änderung über den ganzen Weg ≤ ±3 dB), Faktor beim Bau nachstellen.

#### 3.2.7 Versionierung

- `kit.ev` = 2 (WP6-Pfad, bitgleich) oder 3 (dieser Abschnitt). Fehlt `ev`, gilt 2.
- Neue Projekte und INIT-Kits sind ev3; ab V1c sind alle Werks-Kits ev3.
- KIT-Reiter: [Auf v3 umstellen] (nur bei ev2 sichtbar): setzt `ev 3`, `dynDb 12`, ersetzt bei der Kick Klick-Typ Knock durch Puls + BISS ×3 30 %, rechnet `dyn` (WP6, Klang-Anschlag) auf die ANSCHLAG-Zuordnungen um (`aPun = aBss = 0,6·dyn`, `aFlt = dyn` Okt). Ein Undo. Toast „Kit klingt jetzt nach v3-Regeln · [Rückgängig]“.

### 3.3 Instrument-Typen und Makros

- Der **Typ** (heute `model`) bestimmt: die 6 Makros (KLANG; RIM hat 5), die Feinzeile, die sichtbaren TIEFE-Schichten, die Bereiche (normal/EXTREM) und die Grenzen (IMAX). Andere Schichten bleiben über [+ Schicht] erreichbar; nichts geht verloren.
- Ein Makro ist eine Sicht auf Engine-Parameter (`DrumSynth.DEFAULTS`) und darf mehrere setzen (Abbildungsfunktion je Makro, Anhang B.2). Der Makro-Wert wird **nicht** gespeichert, sondern aus den Engine-Werten zurückgerechnet (bei mehrdeutigen Abbildungen aus dem führenden Schlüssel, Anhang B.2 Spalte „führend“).
- Typen: KICK `bd`, SNARE `sd`, RIM `rs`, CLAP `cp`, HH ZU `ch`, HH OFFEN `oh`, BECKEN `cy`, TOM `tm`, PERC `cb`/`fm`, SHAKER `sh` (10 Typen, 12 Slots).

| Typ | 6 Makros (vorne) | Feinzeile |
|---|---|---|
| KICK | TON · PUNCH · DECAY · KLICK · BISS · DRIVE | SWEEP-Zeit · ART [SUB│RUND│HOHL│HOLZ│KNALL] (Faktor ½ ×1 ×2 ×3 ×4 klein darunter) |
| SNARE | TON · KÖRPER · SNAPPY · ANSATZ · AUSKLANG · PEITSCHE | FARBE [weiß│rosa] · RAUSCH-TON |
| RIM | TON · HOLZ · AUSKLANG · KNACK · RAUSCHEN (5 Makros) | HOLZ-ART [3,4│3,7│4,1] |
| CLAP | TON · HÄNDE · ABSTAND · AUSKLANG · SCHÄRFE · RAUM | VARIATION |
| HH ZU / OFFEN | METALL · FARBE · DECAY · RAUSCHEN · KLINGEN · FM | CHOKE [–│1│2] · EXTREM · VARIATION |
| BECKEN | METALL · FARBE · DECAY · KÖRPER · RAUSCHEN · FM | EXTREM · VARIATION |
| TOM | TON · BEND · BEND-ZEIT · DECAY · FELL · BISS | WELLE [Sinus│Dreieck] · [Toms gemeinsam stimmen] |
| PERC | TON · FARBE · VERHÄLTNIS · DECAY · BEND · FORM | Charakter [KUHGLOCKE│GLOCKE│HOLZ│TROPFEN│ZAP] · EXTREM |
| SHAKER | TON · ANSATZ · DECAY · SCHÄRFE · SCHELLEN · VARIATION | – |

Bereiche, Engine-Abbildungen, Standardwerte und Messwerte: **Anhang B.2**. Für jedes Makro gelten H-1 bis H-3 (§0.3).

### 3.4 Editor v3 (Oberfläche)

**Aufbau P1 (390×844):**
```
┌──────────────────────────────────────────────┐
│ SYNQUENZER  ▶  ●  1.1  112  ♩  ≡             │ Kopfleiste 52 (unverändert)
├──────────────────────────────────────────────┤
│█ ‹   KICK                       ▶   ✎   ›   █│ KOPF 56: Fläche Pad-Farbe 25 %, Balken 6 px
│█     Bassdrum · Rom Pop · v3     ⠉⠒⠤⣀⣀⡀⠀   █│ Name 28 px, Unterzeile 11 px, Punkt-Display 96×20
├──────────────────────────────────────────────┤
│ KLANG │ TIEFE │ SCHRITTE │ KIT │ FX   ↶ ↷ ✕  │ Reiter 40
├──────────────────────────────────────────────┤
│    TON           PUNCH          DECAY        │ 3 große Knöpfe je Reihe (64 px)
│   ╭─────╮       ╭─────╮       ╭─────╮        │
│   │  ◜  │       │  ◝  │       │  ◞  │        │
│   ╰─────╯       ╰─────╯       ╰─────╯        │
│  50 Hz · G1      24 HT         450 ms        │
│    KLICK         BISS           DRIVE        │
│   ╭─────╮       ╭─────╮       ╭─────╮        │
│   ╰─────╯       ╰─────╯       ╰─────╯        │
│    50 %        60 % HOLZ       30 %          │ Makro-Block 196
│ SWEEP ◖45 ms◗  ART [SUB│RUND│HOHL│HOLZ│KNALL] │ FEINZEILE 40
│ FILTER [aus│LP│BP│HP] ━━━●━━ 8,0k  RESO ━●━━ │ FILTER-Zeile 40
│ MIX  PAD-PEGEL ▮▮▮▮▯  PAN ─●─  RAUM ▯ GATE ▯ │ MIX-Zeile 36
├──────────────────────────────────────────────┤
│ [‹][ ♪ SPIELEN │ ⇅ TRANSPONIEREN ][›][FANG]  │ Modusleiste 52
├──────────────────────────────────────────────┤
│ ┏KICK━━┓ ┃SNARE ┃ ┃RIM   ┃ ┃CLAP  ┃          │ Pads 4×3 (170): Tipp = spielen + wählen,
│ ┗━━━━━━┛ ┃HH ZU ┃ ┃HH OF ┃ ┃TOM T ┃ …        │ aktives Pad 3 px Rahmen in Pad-Farbe
└──────────────────────────────────────────────┘
```
- **Höhen P1:** Kopf 56 + Reiter 40 + Körper 393 (Makros 196 + Fein 40 + Filter 40 + Mix 36 = 312) = 489 = Blatthöhe (§0.4). Der Kopf **ersetzt** Kopfzeile, zweite Kopfzeile und LCD-Zeile des v2-Blatts (44 + 40 + 28 px).
- **Passstufen (Hochformat, nach Fensterhöhe):** ≥ 800 px wie oben · 700–799: Knöpfe 56 px · 600–699: MIX-Zeile wandert nach TIEFE › AUSGANG · < 600 (P3): zusätzlich FILTER-Zeile nach TIEFE › FILTER, Knöpfe 52 px.
- **Querformat:** Kopf und Reiter in **einer** Zeile (40 px: Farbbalken, ‹ Name ›, ▶, ✎, Reiter, ↶ ↷ ✕). Körper ≈ 172 px: 6 Makros in einer Reihe (72×92) + eine Zeile 40 px mit Fein · Filter · Mix. Unter 760 px Breite (L2): MIX → TIEFE › AUSGANG; **‹ › entfallen** (Wischen über den Namen und das Namens-Popover bleiben): 6 + Name 100 + ▶ ✎ 2×40 + 5 Reiter à 56 + ↶ ↷ ✕ 3×40 + 9 Lücken à 4 = 622 px ≤ 651 px nutzbar. Reicht das nicht (Messung V1b-05), zeigen die Reiter Kürzel (KLG · TIEF · SCHR · KIT · FX). Pads 6×2.
- **Kopf:**
  - Farbe = Pad-Farbe; Name des Instruments (Slot-Name, z. B. „KICK“, „TOM TIEF“) 28 px; Unterzeile „Typ · Kit · v3/v2“.
  - ‹ › (44×56) und waagrechtes Wischen über den Kopf (> 40 px) = vorheriges/nächstes Instrument, **stumm** (Auswählen ≠ Abspielen, wie in der Bibliothek U-01). Hören über ▶ im Kopf oder das Pad.
  - Tipp auf den Namen = Liste der 12 Instrumente (Popover), für Bildschirme ohne sichtbare Pads.
  - ▶ = Vorhören (Anschlag 0,8). ✎ erscheint, wenn das Instrument vom Kit-Wert abweicht; Tipp = „Instrument auf Kit-Wert zurück“ (ein Undo).
  - **Punkt-Display** 96×20 px: Tonhöhenverlauf (Linie) und Pegelhüllkurve (Fläche) **aus den Parametern gerechnet** (keine Audioanalyse), neu gezeichnet bei jeder Änderung (≤ 30 Hz).
  - **Reiter:** KLANG (statt SOUND) · TIEFE (statt TIEF) · SCHRITTE · KIT · FX. Die 12er-Chip-Reihe entfällt in KLANG und TIEFE (die Pads sind die Auswahl). In SCHRITTE bleibt sie (wie WP6).
- **TIEFE** zeigt als Unter-Reiter nur die Schichten des Typs (Anhang B.3), dazu **ANSCHLAG** und **AUSGANG**; [+ Schicht] blendet weitere ein. Jede Schicht-LED schaltet mit 10-ms-Rampe; Werte bleiben gemerkt. Regler einer stummen Schicht sind grau mit „Schicht leise“ (L2). Keine Seite hat mehr als 10 Regler; sonst zwei Unter-Seiten.
- **ANSCHLAG** (TIEFE): Schieber der AR2-Zuordnungen des Typs (Anhang B.5), dazu die Zeile „Anschlag-Bereich 12 dB (Kit)“ (Tipp → KIT). Darunter eine Mini-Kurve „Pegel über Anschlag“.
- **KIT-Reiter:** wie WP6, dazu **ANSCHLAG-BEREICH** (`kit.dynDb`, 0–24 dB, nur ev3), **„Pad wählt Instrument“** (U-03), **„Drehen = hören“** (an), [Auf v3 umstellen] (nur ev2).
- **EXTREM** (Chip in der Feinzeile, HH/Becken/Perc): verdoppelt die Makro-Bereiche (Anhang B.2, Spalte EXTREM). Aus: Werte außerhalb des normalen Bereichs bleiben erhalten; der Knopf steht am Anschlag mit Marke „▲ außen“, die erste Bewegung klemmt.
- **Perc-Charakter-Chips** setzen TIEFE-Werte (Anhang B.6), ein Undo, mit Vorhören.
- **🎲** würfelt nur die 6 Makros im inneren Bereich (80 %), Typ-Grenzen gelten.

### 3.5 Gesten im Drum-Editor

| Geste | Wirkung |
|---|---|
| Pad antippen | spielt (Anschlag aus der Tipp-Höhe) **und wählt** das Instrument; KLANG/TIEFE zeigen es, SCHRITTE springt auf seine Zeile (U-03). Wählt nicht während ● und nicht < 300 ms nach einem Tipp auf ein anderes Pad |
| Kopf ‹ › / waagrecht wischen | Instrument wechseln, **stumm** |
| Knopf senkrecht ziehen | Wert; seitlich weg = Fein-Modus (§v2-10.2) |
| Knopf loslassen (Transport steht, „Drehen = hören“ an) | Instrument erklingt einmal mit Anschlag 0,8; während des Ziehens höchstens alle 300 ms. Läuft der Transport oder ist „Drehen = hören“ aus: kein Vorhören, Wirkung ab dem nächsten Schlag |
| Knopf 450 ms halten | Mod-Picker (wie WP5). Locks entstehen nur über den LOCK-Modus bzw. Lock-Lanes (§7.5), nie durch Halten |
| Chips (ART, Typ, Charakter, EXTREM, FILTER-Typ) | Tipp = wählen + hören (hören nur bei stehendem Transport und „Drehen = hören“; es ist eine Klangänderung, kein Auswählen), ein Undo |
| Filter-, Mix- und Anschlag-Schieber | waagrecht ziehen; Doppeltipp = Standard |
| ✎ im Kopf | Instrument auf Kit-Wert (ein Undo) |
| Schicht-LED | an/aus mit 10-ms-Rampe |

**Nichts springt, nichts knackt (L3):** Makros wirken ab dem nächsten Schlag; Kanalwerte (Pan, Sends) mit τ 10 ms; Gate-/Raum-IR nur beim Loslassen und mit Überblendung (K-02); ein Kit-Wechsel lässt klingende Schläge ausklingen.

### 3.6 Kits „im Stil von“ (V1c)

- Namensregel E9: eigene Namen, das Vorbild nur im ⓘ-Text mit „Marken gehören ihren Inhabern, keine Verbindung“.
- **Werks-Kits ab V1c (alle ev3):** Rom Pop (Standard), **Boom 80** (statt „808“), **Hybrid 83** (statt „909“), **Studio 82** (neu), **Hexa 81** (neu), Gated 84, FM Labor, Disko 85, Resonanz-Perc.
- Alias: `loadKit('808')` → Boom 80, `loadKit('909')` → Hybrid 83; `kits()` liefert die neuen Namen. Gespeicherte Projekte behalten ihre Slot-Kopien (klingen gleich, ev2).
- Rom Pop, Gated 84, FM Labor, Disko 85, Resonanz-Perc: gleiche Engine-Werte wie WP6, nur ev3-Regeln; Kick-Klick Knock → Puls + BISS ×3 (30 %). Boom 80 / Hybrid 83 / Studio 82 / Hexa 81: Startwerte Anhang B.4.
- Alle Werte sind **Startwerte** und werden mit DR1/PR8 nachgestimmt (Spitzen: Kick −5 … −7 dBFS, Snare −1 … −5, Hats −9 … −14, Toms innerhalb 2 dB).
- ⓘ-Texte: Boom 80 „im Stil einer analogen Drum-Machine von 1980 (Vorbild: Roland TR-808)“; Hybrid 83 „… 1983 (Vorbild: TR-909; dort Hats als Samples, hier Synthese)“; Studio 82 „… LinnDrum, 1982; das Original nutzt Samples echter Drums, hier nur synthetisch angenähert“; Hexa 81 „… Simmons SDS-V, 1981“ (Jahreszahlen eK).

### 3.7 Synth-Pad (Pad-Quelle SYNTH, V1c)

- Im Kopf ein Segment **[DRUM │ SYNTH]**. Bei SYNTH:
  - **SOUND:** eine Kopie eines Synth-Sounds (Bibliothek oder Sound einer Spur, Auswahl über den Browser im Pad-Modus). Der Sound wird **kopiert**, spätere Änderungen an der Quelle wirken nicht.
  - **NOTE** C0–C7 (Std. C3), **HALTEN** (Gate) 10 ms – 2 s (Std. 80 ms), **AUSKLANG** (Release-Überschreibung) 20 ms – 3 s oder „wie Sound“.
  - **MIX-Zeile** wie Drum-Pads (Pad-Pegel, Pan, Raum, Gate); Pegel nach AR1.
  - TIEFE › SYNTH: [Klang öffnen ›] öffnet den normalen Synth-Editor auf der Pad-Kopie (Kopf „PAD SNARE · Synth“).
- **Polyphonie und Grenzen:** höchstens **2 Synth-Pads je Kit** und **4 Stimmen** zusammen. Jedes Synth-Pad ist einstimmig (Neuauslösung mit 3-ms-Blende), Option „Poly 2“. Stimmenraub: ältester Schlag desselben Pads, sonst ältester überhaupt. Anzeige im Kopf „Synth-Pads 1/2 · Stimmen 3/4“.
- **Engine:** Jedes Synth-Pad bekommt bei Bedarf (erster Schlag) einen eigenen Synth-Worklet-Knoten (gleiche Lade-Kette wie Synth-Spuren), Ausgang in den Pad-Strip. Rückfall: `NativeVoice`. FM6 mit 6 Op × 4 Stimmen = 24 ≤ 48 (E2).
- **Folgen:** nie (Drums folgen nie). Lanes: VEL, AKZENT, CHANCE, WIRBEL, TIMING wirken; TUNE-Lock = Halbtöne auf NOTE; DECAY-Lock = Faktor auf HALTEN.
- **Stopp:** ■ und Panik beenden auch Synth-Pad-Stimmen; nach Stopp darf keine Stimme hängen.

### 3.8 Drum-Grenzen H-4 bis H-9

| Nr. | Kriterium | Grenze |
|---|---|---|
| **H-4** | M-HANDY: TON, PUNCH, BISS, DRIVE der Kick; TON, BEND, BISS des Toms; TON der Snare – Minimum → Maximum | ≥ +3 dB |
| **H-5** | Anschlag 0,35 → 1,0 (ev3): M-SPITZE steigt stetig; Spanne = DYN·0,65 ± 1 dB | jedes Instrument |
| **H-6** | VARIATION 0: Bandstreuung über 8 Schläge ≤ 0,1 dB; bei Standard-Variation ≤ 1 dB | jedes Instrument |
| **H-7** | Interferenz zweier Schichten im gemeinsamen Band: `10·log10(E_ganz / (E_A + E_B))` ≥ −1 dB über Anschlag 0,30 … 1,0 (8 Stufen) | Kick, Tom, Snare |
| **H-8** | Knack-Test M-KLICK: Drehen jedes Makros über den ganzen Weg in 1 s, während eine Boom-80-Kick (1,1 s) klingt und 16tel-Hats laufen | Editor |
| **H-9** | BISS, PUNCH, KLICK, PEITSCHE, DRIVE ändern M-PEGEL höchstens um ±3 dB | Kick, Snare |

### 3.9 Daten (Drum)

```js
DrumSound.p.kit += { ev: 2|3, dynDb: 12 /*dB, ev3; ≠ Slot-dyn 0–1 aus WP6*/, padSel: true /*Pad wählt Instrument*/, audOnTurn: true }
slots[id] += {            // nur Abweichungen von DEFAULTS, wie WP6
  bss: 0, bssR: 1 /*.5|1|2|3|4*/, bssFree: 0,           // BISS (ev3); bssFree = Index-Grenze aufheben
  cHp: 0 /*Hz, 0 = aus; Kick-Std. 1000*/,
  hfTyp: '', hfFrq: 8000, hfRes: 0, hfEnv: 0, hfDec: .1,   // Schlag-Filter
  aPun: .3, aBss: .4, aFlt: .5, aDec: 0, aSnp: .3,         // ANSCHLAG-Zuordnungen (ev3)
  var: 0, ext: 0, poly: 1 /*1|2*/,
  src: 'drum'|'synth', syn?: { sound: Sound, note: 48, gate: .08, rel: null|s, poly: 1 }
}
```
- `SQStore.normDrum` und `normalizeProject` erhalten alle Felder (Test V1a-11). Ein ev2-Kit ignoriert die ev3-Felder.
- Undo-Art `sound` (wie WP6), Ziel Drum-Spur.

---

## 4. Song-Ablauf: Spuren, MELODIE, Teile, Akkorde, FANG TEIL, Kette, Song-Tonart

Quellen: R5-H3 (`r5/h345/`, gemessen/direkt), R5-Audit D, Stimme-Jam 2.3–2.8 (JAM), §v2-3.9, Master-Briefing Teil 5/6. Vorbilder (SE): Yamaha Genos Chord Looper + Registrierung (Speicher am nächsten Taktstrich, Freeze, Registration Sequence), Novation Circuit / OP-XY (Szene = Pattern-Auswahl je Spur, leere Szene kopiert die aktuelle), Elektron Song Mode (Zeilen, Wiederholung, Label), Ableton Follow Actions, TC-Helicon VoiceLive 3 (Deutung von „TEC Hell iKON Boys Life“, **unsicher**), Ed Sheerans Looper „Chewie“.

**Neuheit (unsicher):** Eine ganze Struktur (Clip-Kombination + Akkordfolge + Länge) rückwirkend einzufangen und im selben Blatt zu benennen und in den Song einzuordnen, wurde in 10 Suchen nicht gefunden.

### 4.1 Begriffe und Gesamtbild

```
CLIPS (Material, je Spur × Szene)         ── wie v2
SZENE n  = automatisch Teil „Szene n“      ── ▶n startet die Spalte, ihre Akkord-Zeile läuft mit
TEIL     = je Spur: Clip aus Szene s │ aus │ bleibt  + Akkord-Zeile │ Transposition  (+ Teil-Klang ◆, §6)
KETTE    = [Teil ×n] [Teil ×n] …  = der Song      ── Wiedergabe über das WP6-Abspielwerk (abgeflacht)
MELODIE  = eigene Spur; im Song linear über der Kette
```
- Die **Teil-Leiste** (8 Plätze) ist der Live-Zugriff (Part-Tasten, Registrierungen).
- Die **Song-Ansicht** zeigt die Kette und ist der Ort für Reihenfolge, Akkorde über die Zeit und Melodie.

### 4.2 Spuren und Szenen (V2a)

**Spuren**
- Höchstens **8 Spuren**, genau **eine** Drum-Spur. Datenindex stabil (E3-04): 0–3 Synth 1–4, **4 DRUMS**, 5 **MELODIE**, 6–7 Synth 5–6.
- Neues Projekt und Demo: 6 Spuren (Synth 1–4, MELODIE, DRUMS). [＋ Spur] (Menü → Projekt und Spurbank-Ecke) fügt Synth 5 bzw. 6 hinzu; [Spur entfernen] im Spur-Blatt nur für die jeweils letzte Zusatzspur (erst Synth 6, dann Synth 5; mit Undo, Clips und Song-Melodie der Spur gehen in den Undo-Schritt). Synth 1–4, MELODIE und DRUMS bleiben immer (leer lassen statt entfernen), damit die Datenindizes lückenlos bleiben.
- **Anzeige-Reihenfolge** `S.ui.order` (Standard `[0,1,2,3,5,6,7,4]` gefiltert auf vorhandene Spuren): DRUMS immer zuletzt. Spurfarben `t1 … t8` (neu t6 MELODIE, t7/t8 Synth 5/6; Kontrast ≥ 3:1 gegen den Hintergrund).
- Alle festen Stellen (`< 5`, `< 4` für Szenen, `tracks[4]`, `clamp(…,0,3)`, `[null×4]`, `songOverride[5]`, Lanes 5; Audit H: ≈ 80 Stellen) werden auf `NT()` (Spurzahl), `NS()` (Szenenzahl), `isDrum(i)` und `synthTracks()` umgestellt. Der Drum-Index wird nirgends mehr als Zahl geschrieben, auch wenn er 4 bleibt.
- **CPU-Regel:** Neue Spuren 6–8 starten mit Poly 4. Spielen ≥ 3 Spuren mit Poly ≥ 6 **und** Unison ≥ 5 gleichzeitig, erscheint einmal ein Hinweis „Viel Last – CPU-Begrenzer greift ggf.“. Leere Spuren kosten nichts (gemessen 0,1 %).

**Szenen**
- **8 Szenen** (`S.scenes` Länge 8; Clips `[Clip|null × 8]`). Migration: Szenen 5–8 leer.
- **Szenenbank:** P zeigt 4 Spalten + Umschalter **[SZ 1–4 │ 5–8]** in der Szenen-Kopfzeile (Ecke; Beschriftung mit „SZ“, damit er nicht wie der Teil-Leisten-Umschalter aussieht). L zeigt 8 Spalten, wenn jede ≥ 56 px breit ist, sonst Bank. Clips in der verdeckten Bank laufen weiter; ihre laufende Spalte zeigt ein Punkt im Bank-Umschalter.
- Szenen-Tonart unter ▶n wie v2; neu darunter die Akkord-Kurzform, wenn die Szene eine Akkord-Zeile hat („Am·F·C·G“, gekürzt).

**Spurbank (Matrix-Reihen)**
- Mindesthöhe einer Reihe P 40 px, L 30 px. Passen nicht alle Reihen, zeigt die Matrix eine **Spurbank**: Synth-Reihen werden in Seiten geteilt, **DRUMS bleibt immer sichtbar** (letzte Reihe). Umschalter in der Spurkopf-Spalte unten: [▲▼ 1/2]. Ein laufender Clip in der verdeckten Seite zeigt einen Punkt am Umschalter.
- Messwerte für die Abnahme: P1 6 Reihen à 48 px (40 + 6×48 = 328 ≤ 329); P2 5 Reihen (Seite 1: Synth 1–4 + DRUMS; Seite 2: MELODIE, Synth 5/6 + DRUMS); L1 nach Messung.
- Kein Scrollen in der Matrix (E3-26).

**Matrix-Gesten (V2a′; Runde-1-Wünsche B3/B4)**
- **Clip halten (450 ms)** → der Clip hebt ab (Haptik, Schatten, Zelle halbtransparent). Loslassen **ohne** Bewegung (≤ 8 px) = Clip-Blatt wie bisher.
- **Ziehen** (> 8 px nach dem Anheben): Geist folgt dem Finger. Auf **leeren** Slot derselben Spurart = verschieben; auf **belegten** = tauschen (Ziel zeigt ⇄); auf eine andere Spurart: Synth → Synth erlaubt, Drum → Synth über das Blatt unten, Synth → Drum grau mit Grund. Während des Ziehens startet keine Zelle, die Matrix scrollt nicht.
- **Ablage-Leiste:** Während des Ziehens wird die Teil-Leiste (gleiche Stelle, 40 px) zur Leiste **[⧉ KOPIE] [✕ LÖSCHEN]**. Über ⧉ gleiten (≥ 250 ms) schaltet den Zug auf Kopie (Geist zeigt ⧉, Haptik); danach auf einen Slot ablegen = kopieren. Auf ✕ ablegen = löschen. Toast mit [Rückgängig]. Ein Undo je Geste (`kind:'group'`, wenn zwei Slots betroffen sind).
- Laufende Clips: Verschieben/Tauschen ändert nur Daten; was klingt, wechselt am nächsten Taktstrich wie ein Clip-Start (L8). Ein Clip, der in Teilen oder in der Kette benutzt wird, nimmt seine Verweise mit (Teil-Slots zeigen auf die neue Szene); Toast nennt „in 2 Teilen angepasst“.
- **Drum → Synth (B4):** Einfügen oder Ablegen eines Drum-Clips auf einer Synth-Spur öffnet ein Blatt „Rhythmus übernehmen auf: [eine Tonhöhe (Grundton der Szene)] [je Instrument eine Stufe der Szenen-Tonart] [GM-Nummern 1:1]“ mit Instrument-Chips (Standard alle; z. B. nur KICK für einen Basslauf-Rhythmus). Ergebnis ist ein normaler Synth-Clip (VEL und Rohzeit `o` bleiben; Drum-Lanes CHANCE/WIRBEL/TUNE/DECAY entfallen mit Hinweis). Heute verweigert (`Drum- und Synth-Clips sind nicht austauschbar`, Z. 11479).

### 4.3 MELODIE-Spur (V2b)

- Synth-Spur `{kind:'synth', mel:true, name:'Melodie', color:'t6', follow:false, kbOct:5}` mit eigenem Klang **„Melodie-Lead“** (Kopie von Mini-Lead mit Modus POLY, Poly 4, Glide 0; ⓘ „klare Lead-Stimme, mehrstimmig, damit sich nichts abschneidet“).
- **⇅ fest** als Standard: Clips und Song-Melodie der MELODIE-Spur folgen dem Träger nicht; ⇅ umschaltbar wie jede Spur. Die Song-Verschiebung (§4.10) wirkt immer.
- Sie spielt Clips wie jede Spur (Matrix-Reihe) und trägt die **Song-Melodie** (`song.mel[5]`).
- Erreichbar: Matrix-Reihe; in der Song-Ansicht Zeile MEL. antippen = Rolle der Song-Melodie; Teil-Blatt (Spur MEL).
- **Song-Melodie je Spur** (E3-06): `song.mel = {[t]: {notes:[…]}}`. Migration WP6: `song.melody.notes` → `song.mel[song.melodyTrack]` (gleicher Klang wie vorher; die Melodie wandert nicht auf Spur 5). `melodyTrack` bleibt lesbar (Alias auf die erste Spur mit Melodie).
- ● SONG / ● MEL. nehmen Live-Noten der **gewählten** Spur auf (wie WP6), Standard-Vorschlag ist MELODIE.
- **Demo:** MELODIE-Spur leer, Klang Melodie-Lead (I-09).

### 4.4 TEIL und Teil-Leiste (V2c)

**Teil**
- Ein Teil speichert je Spur: **Clip aus Szene s**, **aus** (Spur stumm) oder **bleibt** (was läuft, läuft weiter; Freeze wie Genos). Dazu entweder eine **Akkord-Zeile** (§4.5) oder eine feste **Transposition** (±Halbtöne bzw. ein Ziel-Akkord), optional einen Teil-Klang (§6.5).
- **Transposition, Umsetzung:** `xp.semi` (±12 HT) ist **kein** Träger-Eintrag (ein Einzelton-Ziel bedeutet im Standard `single:'key'` eine Stufe, keine Halbton-Verschiebung). Es wird wie `S.shift` **nach** der Abbildung addiert: `aus = map(…) + S.shift + R.xp`, nur für Spuren mit ⇅ folgt; Drums, Synth-Pads und Spuren mit ⇅ fest (MELODIE im Standard) nie. `xp.tg` (Ziel-Akkord) bleibt ein Träger-Eintrag wie eine einzeilige Akkord-Zeile.
- Länge `len` (Takte) = Länge der Akkord-Zeile; ohne Akkord-Zeile = längster Clip des Teils (≤ 16).
- **Jede Szene ist automatisch ein Teil** „Szene n“ (Slots = Spalte n, Akkorde = Akkord-Zeile der Szene). Diese Teile stehen nicht auf der Teil-Leiste (das sind die ▶n), sind aber in Kette und Auswahllisten wählbar.
- Ein Teil mit lauter „bleibt“ und einer Akkord-Zeile ist ein reiner **Akkord-Loop** (ersetzt die JAM-Loop-Bank).

**Teil-Leiste** (ersetzt den Hinweis-Kasten; der Hinweistext wandert in Menü → Hilfe)
```
P1: │[ STROPHE ● ] [ REFRAIN ] [ BRIDGE ] [   ＋   ] [●○]│   40 px
```
- 8 feste Plätze (`S.parts[0..7]`), P zeigt 4 je Seite + **eine** Umschalt-Taste 44×40 px mit zwei Punkten ●○ / ○● in Teil-Farbe (Seite 1/2; der Punkt der anderen Seite pulsiert, wenn dort ein Teil läuft). Beschriftung bewusst ohne Zahlen (Szenenbank heißt „SZ 1–4│5–8“). Breite P1: 4 × 72 + 44 + 5 × 4 = 352 px + Rand 16 ≤ 390; P3: 4 × 60 + 44 + 20 + 16 = 320 px. L im Seitenfeld 4 + Umschalter (Höhe ≥ 36 px; **am Gerät prüfen**). Tasten ≥ 72 px breit (P3 ≥ 60 px, Namen auf 6 Zeichen gekürzt).
- **Sichtbar in Clip- und Song-Ansicht** an derselben Stelle (P: unter der Rasterfläche bzw. unter der Song-Ansicht; L: im Seitenfeld). Beim Umschalten CLIPS ⇄ SONG bewegt sie sich nicht (L3, ≤ 2 px). So gehen Teil-Tasten, Aufnahme-Ziel TEILE und „alles in einem Durchgang“ ohne Ansichtswechsel.
- Taste: Name (12 px, Großbuchstaben, ≤ 8 Zeichen) + Zustands-LED: **blinkt** = wartet auf den Taktstrich, **leuchtet** = läuft. Farbe = Teil-Farbe.
- **Tipp** auf einen belegten Platz: Teil startet am nächsten Takt (E3-09; im Teil-Blatt umstellbar „am Teil-Ende“). Clips starten mit Phase 0, die Akkord-Zeile von vorn (JAM K5). Ein zweiter Tipp auf denselben laufenden Teil startet ihn am nächsten Takt neu.
- **Tipp auf [＋]** (leerer Platz): speichert, **was gerade klingt** (Clip je Spur, gestoppte Spuren = aus, laufende Akkord-Zeile bzw. der aktuelle Träger als einzeilige Akkord-Zeile, sonst ±0). Fragt nur den Namen (Chips Intro · Strophe · Refrain · Bridge · Outro · Teil n · ✎). Ein Undo.
- **Halten** (450 ms, außerhalb des Editors erlaubt, §v2-10.3) öffnet das Teil-Blatt.
- Läuft die **Kette**, springt ein Tipp am nächsten Takt zur nächsten Kettenstelle dieses Teils; kommt er in der Kette nicht vor, übernimmt die Hand (orange [↩ KETTE]).

**Teil-Blatt** (Bottom-Sheet, ≈ 300 px P)
```
│ Teil · STROPHE — 4 Takte · Wechsel [am Takt✓│am Teil-Ende]        [✕] │
│ Name  [Intro][Strophe✓][Refrain][Bridge][Outro][✎]  Farbe ●●●●●●       │
│ Spuren S1:Sz1  S2:Sz3  S3:bleibt  S4:aus  MEL:aus  DR:Sz2               │  Tipp = nächster Zustand
│        [In der Matrix wählen]                                           │
│ Akkorde [Am F C G ✎]  oder  Transposition [±0 ▾]                        │
│ Klang   [wie Clips✓] [◆ eigener Teil-Klang]   (ab V6b)                  │
│ [= wie jetzt] [Kopie] [Kopie ohne Drums] [Löschen]                      │
```
- Spur-Chip tippen: nächster Zustand in der Folge Sz1 → Sz2 → … (nur Szenen mit Clip) → aus → bleibt → Sz1.
- **[In der Matrix wählen]** (Registrierung bauen): Das Blatt schrumpft auf eine Zeile „Teil Strophe: Zellen antippen · [Fertig]“; die Matrix zeigt Auswahlrahmen in Teil-Farbe. Zelle tippen = dieser Clip für seine Spur; nochmal = aus; dritter Tipp = bleibt. In diesem Modus startet ein Zellen-Tipp **keinen** Clip. Beispiel „Drums aus Szene 3, Bass aus 1, Fläche aus 4, Sequenz aus 2“ = 4 Tipps.
- [= wie jetzt] übernimmt den aktuellen Zustand (ein Undo). [Löschen] fragt nicht, Toast mit [Rückgängig]. Ein Teil, der in der Kette steht, wird beim Löschen dort durch eine Lücke „(gelöscht)“ ersetzt, bis Undo oder Neuwahl.

### 4.5 Akkord-Zeile und Akkord-Auswahl (V0c Auswahl, V2c Zeile)

**Akkord-Zeile** (`ChordRow = {len, ch:[{b, tg}]}`; `b` = Schlag relativ zum Zeilenanfang, `tg` = Ziel im Format von `normTarget`)
- Gehört zu einer Szene oder einem Teil. Läuft ab dem Start der Szene/des Teils im Kreis.
- **Aufruf:** Tipp auf die TRÄGER-Anzeige in der Hauptansicht (zeigt „SZENE 2 · Am·F·[C]·G ✎“ bzw. den laufenden Teil) öffnet das Akkord-Zeilen-Blatt über der Tastatur. **Ziel:** die laufende Szene bzw. der laufende Teil; läuft nichts, die Szene der gewählten Zelle. Im Kopf blättert **‹ Szene 2 ›** durch Szenen 1–8 und die Teile der Teil-Leiste, **ohne** sie zu starten (Akkorde direkt bei jeder Szene setzen, auch von Hand).
- **Vorne (einfach, L1):**
```
┌ AKKORDE ‹ Strophe › · 4 Takte · a-Moll ──── Takte [−][+]  [✕] ┐ 40
│ [ Am ][ F ][▸C ][ G ]                                          │ 44  ein Kästchen je Takt, laufender leuchtet
│ Stufe [i Am][ii° H°][III C][iv Dm][v Em][V E][VI F][VII G]     │ 44  in Moll zusätzlich „V (Dur)“
│ Zuletzt  Am · F · C · G7 · Dm                                  │ 36  Träger-Verlauf (wie popHistory)
│ [÷2] [– halten] [♪ greifen] [Löschen]                [Frei ▾]  │ 44
└────────────────────────────────────────────────────────────────┘
Blatthöhe P 216 px (208 + Rand), L 2 Spalten in 150 px; M-PLATZ prüft beide.
```
- **[Frei ▾]** (eine Ebene tiefer) ersetzt die Zeilen Stufe/Zuletzt/Knöpfe in gleicher Höhe durch: **Grund** (12 Chips C … H, waagrecht wischbare Liste) · **Art** (die 15 Akkordarten des Harmonie-Kerns `CHORDS`: Dur, Moll, dim, aug, sus2, sus4, 7, maj7, m7, m7b5, dim7, 6, m6, add9, 5; wischbare Liste) · **Bass** [/–] + **Text** ⌨ + [‹ zurück].
- Kästchen tippen = wählen. **Stufen-Chips** zeigen die 7 leitereigenen Dreiklänge der Teil- bzw. Szenen-Tonart (Dur: I ii iii IV V vi vii°; Moll: i ii° III iv v VI VII) und **in Moll zusätzlich „V“ als Dur-Akkord** (in a-Moll E-Dur; übliche Dominante). In P3 ist die Stufen-Zeile wischbar. **Bass** = Slash-Bass.
- **Zuletzt** (Träger-Verlauf, ersetzt im Hochformat das WP7-Popup `popHistory`, damit keine Live-Funktion verschwindet, I-11): die zuletzt gespielten Akkorde; Tipp setzt den Akkord ins gewählte Kästchen bzw. ruft ihn ohne gewähltes Kästchen wie heute ab (Hand). Quer bleibt der Verlauf zusätzlich dauerhaft im Seitenfeld.
- **Text** ⌨: Grammatik `Grundton [♯|#|b|♭|is|es]? Art? (/Bass)?`, Grundtöne A–H (bei Notennamen „de“ ist B = B♭, H = H; bei „intl“ B = H). Arten: `m`, `min`, `maj7`, `maj`, `m7b5`, `m7`, `7`, `dim7`, `dim`, `aug`, `+`, `sus4`, `sus2`, `sus`(= sus4), `6`, `m6`, `add9`, `5`. Ungültig: rote Umrandung + „z. B. Am7/G“.
- **[÷2]** teilt das Kästchen in zwei halbe Takte. **[– halten]** = kein Wechsel (Vorgänger läuft weiter). **[♪ greifen]**: Das Blatt schrumpft auf eine Zeile, die Tastatur ist frei; ein gegriffener Akkord (40-ms-Sammeln wie TRANSPONIEREN) füllt das Kästchen und springt zum nächsten.
- [−][+] Takte ändert `len` (1–16). Jede Änderung ist ein Undo-Schritt und im nächsten Durchlauf hörbar. **Es wird nichts aufgenommen und nichts gelöscht.**
- **Wiedergabe:** Eine laufende Akkord-Zeile ruft an jedem Eintrag `T.recall(tg, b2t(beat), null)` auf, es sei denn, eine höhere Quelle (TA1) ist aktiv. **`null` statt `grid()`** wie in `songTick` (WP6 Z. 8722/8746): die Schläge sind schon exakt; mit `grid()` würde `Transposer._schedule` bei „Wechsel: am Takt/Schlag“ erneut quantisieren, Halbtakt-Akkorde ([÷2]) wanderten auf den nächsten Takt. Gleiches gilt für Teil-Starts.

### 4.6 Träger-Regeln

- **TA1 Rangfolge:** Hand (TRANSPONIEREN, Momentan, Shift) > Teil-/Szenen-Akkord-Zeile > Kette/Song > ORIGINAL. Eine Taste übernimmt sofort; das orange [↩ TEIL] / [↩ KETTE] / [↩ SONG] gibt am nächsten Takt zurück. ORIGINAL bei laufender Zeile = Übernahme ohne Träger.
- **TA2** FANG überschreibt und stoppt nie etwas.
- **TA3** Die Akkord-Zeile gehört dem Teil. Steht ein Teil mehrfach in der Kette, hat er überall dieselben Akkorde. Eigene Akkorde oder Slots an **einer** Stelle sind eine **ABWEICHUNG** (`alt.chords`/`alt.slots` an der Kettenstelle, Block zeigt Teil′, Knopf [Nur hier ändern]).
- **TA4** Spur „bleibt“ lässt laufen, was läuft.
- **TA5 Zeit-Operationen in der Kette** (Einfügen, Verschieben, Löschen, ×n): Melodie-Noten gehören zu der Kettenstelle, in der sie beginnen; eine Note bis ¼ Schlag vor einer Grenze zählt als Auftakt zur folgenden Stelle. Die Noten wandern mit ihrer Stelle.
- **TA6** Song-Melodie: nie Träger, außer ihre Spur steht auf ⇅ folgt. Song-Verschiebung wirkt immer.
- **TA7** Eine Aufnahme ändert nur die gewählten Ziele im aufgenommenen Bereich (§4.8).
- **TA8** Jede Geste ist **ein** Undo-Schritt. Arten: `part` (`S.parts` + `scenes[].chords`), `chain` (`S.chain`), `song` (Abspielplan/Mitschnitt, Song-Melodie), `proj` (Schnappschuss aller betroffenen Teilbäume, für [Fest anwenden] und [In Teile zerlegen]). Ändert eine Geste mehrere Arten (FANG TEIL [Übernehmen]: Teile + Kette + Ketten-Melodie; [Spur entfernen]: Spur + Clips + `song.mel` + Teil-Slots; Aufnahme mit allen Zielen; [◆ für ganze Szene merken]; Teil löschen), wird sie ein Eintrag `{kind:'group', label, items:[…]}`: Undo in umgekehrter, Redo in normaler Reihenfolge, zählt als 1 von 60 Schritten (E3-33). Eingeführt in V2a (erster Nutzer: [Spur entfernen]).
- Szenen-Wechsel per ▶n: die Akkord-Zeile der Szene startet am Startschlag der Szene. Ein einzelner Clip-Start ändert die laufende Akkord-Zeile nicht.

### 4.7 FANG TEIL (V2d)

**Song-Gedächtnis** (läuft immer, wenn der Transport läuft)
- `R.mem`: Ringpuffer der letzten 64 Takte, je Takt `{bar, slots:[…NT], part, rowSrc}`.
- `CAPC`: Träger-Log aller Commits mit Schlag (über `T.onCommit`), unabhängig von `T.prune` (der Verlauf des Transposers wird nach 2 s gelöscht, Z. 8394).

**Beschriftung (E3-08):** In ⇅ TRANSPONIEREN (oder ⇅ gehalten) heißt der FANG-Platz **FANG TEIL**; er **leuchtet**, wenn seit dem letzten Phrasen-Grenzpunkt (Regel 1 unten) Akkord-, Clip- oder Szenenwechsel geschahen. In ♪ SPIELEN heißt er wie bisher FANG (Noten → Clip, FG1/FG2 unverändert).

**Phrase bestimmen** (beim Tipp)
1. **Grenzen:** Eine Phrase beginnt frühestens am letzten Phrasen-Grenzpunkt. Grenzpunkte sind: ≥ 2 Takte ohne Wechsel, ▶n (Szenenstart), Tipp auf eine Teil-Taste, ORIGINAL, [↩ …], ein angenommener FANG TEIL. Ende = laufender Takt.
2. Ein Wechsel bis ¼ Schlag vor einem Taktstrich zählt auf den Takt (wie FANG).
3. **Periode (vom Ende her):** Zwei Takte gelten als gleich bei identischen Akkorden und Slots. Für p ∈ {1, 2, 4, 8} ist r(p) = p + Zahl der Takte, die vom laufenden Takt rückwärts ohne Unterbrechung dem Takt p davor gleichen (gezählt nur bis zum Grenzpunkt). Gültig ist p mit r(p) ≥ 2p (mindestens eine volle Wiederholung). Gewählt wird das gültige p mit dem **größten** r(p), bei Gleichstand das kleinste. Vorschlag = die letzten p Takte. Ist kein p gültig, ist der Vorschlag die Phrase seit dem Grenzpunkt, auf 1/2/4/8/16 Takte **aufgerundet** (fehlende Takte halten den letzten Akkord) bzw. bei mehr als 16 Takten die letzten 16.
4. So entsteht beim Durchspielen wie mit einem Looper (Strophe direkt gefolgt vom Refrain, ohne Pause) nach dem Refrain der **Refrain** als Vorschlag, nicht „Strophe + Refrain“: Beispiel Am F C G ×2, direkt danach F G C C ×2 → r(1) = 2 (C C), r(2) = 2, r(4) = 8, r(8) = 8 (ungültig, 8 < 16) → Vorschlag 4 Takte F G C C.
5. Der Teil läuft **ab dem nächsten Takt im Kreis** (Anzeige „läuft ∞“); beide Hände sind frei. **FANG TEIL beendet die Hand** wie [↩ TEIL] (sonst hörte man den zuletzt gelatchten Akkord statt des Kreises). War ⇅ TRANSPONIEREN **eingerastet** (nicht gehalten), bleibt der Modus stehen, aber ♪ SPIELEN blinkt 2 s und das LCD zeigt „Zum Drüberspielen ♪ SPIELEN“ (kein heimlicher Moduswechsel; der nächste Ton in TRANSPONIEREN würde sonst wieder die Hand übernehmen).

**Blatt „Teil übernehmen?“** (über der Tastatur, ≈ 270 px; der Teil läuft schon)
```
┌ TEIL ÜBERNEHMEN? ──────────────────────────── läuft ∞ ┐
│ 4 Takte · F G C C · S1 S2 S3 DR (aus Szene 2)          │
│ ▁▁▁▁│▁▁▁▁│▁▁▁▁│████  letzte 16 Takte, Bereich gewählt  │  Tipp = Anfang verschieben
│ Länge [1][2][4✓][8][16]                  [✕ Verwerfen] │  nimmt immer die LETZTEN n Takte
├ WELCHER TEIL? ─────────────────────────────────────────┤
│ [Strophe✓][Refrain][Bridge][Intro][Outro][✎ Name]      │  vorhandene Teile mit ⟳ = ersetzen
│ [an Szene 2 hängen]                                    │  zweite Wahl: Akkorde nur an die Szene
├ WOHIN IM SONG? ────────────────────────────────────────┤
│ ⊙[Intro]⊙[Strophe ×2]⊙[Refrain]⊙Ende✓                  │  ⊙ = Lücke antippen, mehrere möglich
│ [×1✓][×2][×4]                  [nur als Teil-Taste]    │
├────────────────────────────────────────────────────────┤
│                    [  ÜBERNEHMEN  ]                     │
└────────────────────────────────────────────────────────┘
```
- **Mini-Zeitleiste:** die letzten 16 Takte als Kästchen mit Akkord-Kürzel; der gewählte Bereich ist hell. Die Länge-Chips nehmen immer die **letzten** n Takte bis zum laufenden Takt; ein Tipp auf ein Kästchen verschiebt den **Anfang** dorthin (Länge = von dort bis zum laufenden Takt, auf 1/2/4/8/16 gerundet). Standard ist die Periode aus Regel 3.
- **Vorschläge sind gesetzt**, ein Tipp auf [Übernehmen] reicht:
  - **Welcher Teil:** immer ein **benannter Teil** – der nächste freie Name in der Folge **Strophe → Refrain → Bridge → Intro → Outro → Teil n**. Die Slots verweisen auf die Szenen, aus denen die Clips kommen; der Teil landet auf der Teil-Leiste. [an Szene n hängen] (nur sichtbar, wenn die Slots genau einer Szene ohne eigene Akkord-Zeile entsprechen) ist die zweite Wahl: Dann werden die Akkorde die Akkord-Zeile von Szene n, es entsteht kein Teil und keine Teil-Taste.
  - **Wohin:** „ans Ende ×1“. Mehrere Lücken wählbar. [nur als Teil-Taste] = nicht in die Kette.
- Ein vorhandener Teilname zeigt ⟳ = **ersetzen**: alle Stellen dieses Teils ändern sich (Toast nennt die Zahl der Stellen).
- Eine Lücke mitten in der Kette **fügt ein**; spätere Stellen samt Melodie rücken nach (TA5).
- [Übernehmen] = ein Undo-Schritt (`group`: Teile + Kette + Ketten-Melodie). Danach: Teil auf die Teil-Leiste (freier Platz; sonst nur Kette + Toast „Teil-Leiste voll“), Kette ergänzt, der Teil läuft weiter.
- [Verwerfen] beendet den Kreis am nächsten Takt; die vorherigen Träger-Regeln gelten wieder.

### 4.8 Aufnahme mit sichtbarem Ziel (V0c Grundlage, V2d′ vollständig)

- Chips **[TEILE] [AKKORDE] [MELODIE]** in der Song-Ansicht (V0c: [SZENEN] statt [TEILE]); Banner in Song- und Hauptansicht; ●-Beschriftung mit Zielen; Hinweis „überschreibt …“ vor dem Start (Texte §2.3 S-01).
- **AKKORDE, Kette läuft (E3-36):** Gespielte Akkorde werden **an den aufgenommenen Stellen** als ABWEICHUNG gespeichert (`alt.chords` der Stelle; je Takt gewinnt der jüngste Durchgang; Takte ohne neuen Akkord bleiben wie im Teil). **Direkt in die Akkord-Zeile des Teils** schreibt die Aufnahme nur, wenn alle Stellen dieses Teils im aufgenommenen Bereich lagen oder der Teil nur einmal in der Kette steht. Beispiel: Kette [Strophe ×2, Refrain, Strophe], Akkorde nur über die letzte Strophe → nur Stelle 4 ändert sich, die Strophe am Anfang klingt wie vorher. Ende: Toast „12 Akkorde an 2 Stellen · [Für alle Strophen] [Rückgängig]“ ([Für alle …] überträgt die Abweichung in den Teil und löscht sie an den Stellen; ein Undo).
- **AKKORDE, live ohne Kette:** in die Akkord-Zeile der laufenden Szene bzw. des laufenden Teils; je Takt gewinnt der jüngste Durchgang; Takte ohne neuen Akkord bleiben. Hat der Teil keine Akkord-Zeile, entsteht eine mit seiner Länge.
- **TEILE:** Teil-Tasten, ▶n und Clip-Starts während der Aufnahme schreiben die Kette ab der Startstelle fort und ersetzen die Stellen im aufgenommenen Bereich. Gleiche Teile hintereinander werden zu ×n. Eine Kombination, die keinem Teil entspricht, wird ein neuer Teil „Teil n“ (Slots = was klang, Akkorde = was gespielt wurde). Danach Toast [Teile benennen].
- **MELODIE:** Noten der aufnehmenden Spur (Standard MELODIE) gehen als gehört (abzüglich `S.shift`) in die Song-Melodie, eingeordnet nach TA5. Overdub.
- **Alles in einem Durchgang:** alle drei Chips an.
- Zeile, die gerade beschrieben wird, ist rot gesäumt.

### 4.9 Kette und Song-Ansicht (V2d Daten + Abflachen, V2e Oberfläche)

**Song-Ansicht P1** (ersetzt die Rasterfläche; die Teil-Leiste bleibt darunter an ihrer Stelle, §4.4, also 383 − 40 = 343 px)
```
│[CLIPS ⇄][● AKK+MEL][▶ SONG][SCHLEIFE: Song ▾]              │ 44
│Aufnahme [✓TEILE][✓AKKORDE][✓MELODIE]   Song: a-Moll 82 % [−][+] │ 32 (bei Aufnahme: Banner)
│TAKT  1   2   3   4   5   6   7   8   9  …                  │ 22  Tipp = ab hier spielen
│TEIL  [Intro  ][Strophe ×2       ][Refrain ]⊙                │ 44  Block = Teil-Stelle · ⊙ = einfügen
│AKK.  Am  F   C   G │Am  F   C   G │F  G Am Am              │ 40  Tipp = Akkord ändern (im Teil)
│MEL.  ▁▃▅▃   ▃▅▇    ▂▆                                       │ 48  Tipp = Melodie-Rolle
│Spuren ▸  (6 Spuren · 2 Abweichungen ●)                      │ 28  aufklappen = Spur-Raster (WP6)
```
- Summe ≈ 258 px von 343 px; Rest für „Spuren ▸“. Darunter die **Teil-Leiste** (40 px, wie in der Clip-Ansicht). L: gleiche Zeilen, Höhen TEIL 36, AKK 30, MEL 36, Lineal 18; Spuren eingeklappt; Teil-Leiste im Seitenfeld wie in der Clip-Ansicht.
- **Gesten** (wie WP6, §v2-3.9): Zug > 8 px scrollt waagrecht (mit Schwung) und bearbeitet nie; sauberer Tipp (≤ 8 px, ≤ 350 ms) bearbeitet.
- **TEIL-Zeile:**
  - Block antippen → **Stellen-Blatt**: ×n [×1][×2][×4][×8] · [◀][▶] verschieben · [Nur hier ändern] (ABWEICHUNG: eigene Slots/Akkorde nur an dieser Stelle) · [Ersetzen durch …] · [Teil bearbeiten ›] (Teil-Blatt) · [Löschen].
  - ⊙ antippen → Liste aller Teile (Teil-Leiste + Szenen) → einfügen ×1.
  - Block halten (450 ms) = Stellen-Blatt (Halten außerhalb des Editors erlaubt).
- **AKK.-Zeile** zeigt die abgeflachten Akkorde je Takt; Tipp öffnet die Akkord-Auswahl für den **Teil** dieser Stelle (TA3: wirkt an allen Stellen; [Nur hier ändern] → ABWEICHUNG an dieser Stelle).
- **MEL.-Zeile:** Tipp → Rolle der Song-Melodie der gewählten Melodie-Spur (absolute Schläge; Speicherung je Stelle, TA5).
- **Spuren ▸:** klappt die WP6-Zeilen je Spur auf (abgeleitet aus der Kette, 30 px je Zeile, senkrecht scrollbar nur hier, über die Beschriftungsspalte). Zellen-Tipp an einer Stelle schaltet den Slot der Spur **für diese Stelle** (ABWEICHUNG `alt.slots`), mit Punkt-Markierung „Abweichung“.
- **SCHLEIFE ▾:** [aus] [Song] [Teil] (laufende Stelle) [Bereich] (Lineal-Band, §2.3 S-02).
- **Kette leer:** Die Ansicht zeigt „Noch keine Kette. FANG TEIL beim Spielen, [＋] auf der Teil-Leiste oder ⊙ hier.“ und ⊙.

**Abflachen (Wiedergabe):** `flattenChain(S.chain)` erzeugt die WP6-Struktur `{bars, lanes[NT], carrier, mel, xp}`. Es nutzt **nicht** `RecHelpers.logLaunch`: Das fügt bei gleichem Slot nichts ein (`if (prev !== slot) lane.push`, WP6 Z. 3507), sodass ein Teil zweimal hintereinander oder zwei Teile mit demselben Clip keinen Neustart bekämen (ein 3-Takt-Clip in einem 4-Takt-Teil liefe phasenverschoben weiter).
- Je Stelle k mit Teil P, Länge `L = P.len`, Wiederholung ×n: Lanes je Spur ab `start_k`: Slot nach P (bzw. `alt.slots`) als **Neustart-Eintrag** `{bar, slot, re:1}` – auch bei gleichem Slot; „bleibt“ = kein Eintrag (vorheriger Zustand läuft weiter, Phase bleibt); „aus“ = Slot −1. Clips starten so an jeder Stelle mit Phase 0 (`cs = start_k`); innerhalb der ×n-Wiederholungen laufen sie frei weiter.
- `songTick` und `RecHelpers.eventsIn` liefern `re`-Einträge auch bei gleichem Slot als Launch. Lanes ohne `re` (WP6-Mitschnitte) verhalten sich wie bisher.
- Träger: Akkord-Zeile von P (bzw. `alt.chords`) n-mal hintereinander; `xp.tg` als ein Träger-Eintrag am Stellenanfang. `xp.semi` geht **nicht** in den Träger, sondern in die eigene Zeitleiste `song.xp:[{beat, semi}]` (§4.4); `songTick` setzt daraus `R.xp`.
- Melodie: Noten der Stelle relativ + `start_k` → `song.mel[t].notes` absolut.
- `songTick` (Z. 8731) bleibt der einzige Wiedergabeweg (I-02); er spielt das Abgeflachte. Bei jeder Ketten-Änderung wird neu abgeflacht (≤ 5 ms für 64 Stellen, sonst in `idle`), wirksam ab dem nächsten Takt.
- **Song-MIDI-Export** nutzt das Abgeflachte; Teilnamen als Marker (Meta-Ereignis FF 06).

**Mitschnitt (WP6-Songs):** Ein Song ohne Kette (`song.src !== 'chain'`) erscheint als ein Block „Mitschnitt · 12 Takte“ und spielt **unverändert** wie in WP6. [In Teile zerlegen] (im Blockblatt) wandelt ihn um (E3-31):
1. Takte mit identischer Slot-Kombination aller Spuren bilden Abschnitte (Wechsel einer Lane = neuer Abschnitt).
2. Abschnitte mit gleicher Kombination und gleicher Akkordfolge (relativ) werden derselbe Teil; gleiche Kombination mit anderer Akkordfolge → ABWEICHUNG an dieser Stelle.
3. Melodie-Noten werden nach TA5 den Stellen zugeordnet.
4. **Phase erhalten:** Hat eine Spur an einer Stellengrenze denselben Slot und im Mitschnitt **keinen** Launch, wird sie an dieser Stelle `alt.slots[t] = null` („bleibt“), damit der Clip wie im Mitschnitt durchläuft.
5. **Prüfung über die Abspiel-Ereignisse,** nicht über deep-equal der Lanes: Launch-Schläge je Spur inkl. Clip-Startphase `cs`, Träger-Abrufe (Schlag + Ziel) und Melodie-Noten von `flattenChain(neu)` gleichen denen des Mitschnitts (M-ZEIT). Sonst Abbruch mit Toast „nicht verlustfrei zerlegbar“, Daten unverändert.

### 4.10 Song-Tonart und Verschieben (V2f)

**Erkennung**
- Zählt die **gehörten** Töne der abgeflachten Kette: Clip-Noten über die Akkord-Zeilen abgebildet (`T.mapEvent` offline), gewichtet mit der Dauer und der Zahl der Takte je Stelle; Bass-Spuren (Rolle Bass bzw. tiefster Median) ×2, Melodie ×1, Drums nie.
- Akkord-Grundtöne zählen zusätzlich; erster und letzter Akkord ×1,5 (Tonika-Hinweis). Dann `KeyDetect` (Krumhansl-Profile, vorhanden).
- Anzeige im Song-Kopf: „Song: a-Moll · 82 % (C-Dur)“ (Sicherheit = Abstand zum Zweitbesten; zweite Tonart in Klammern, wenn Abstand < 10 Punkte). Je Teil seine Tonart klein im Block.
- Melodie-Passung: „Melodie 94 % in a-Moll“; leiterfremde Töne erscheinen in der Melodie-Rolle amberfarben.
- Rückfall leerer/Drum-Szenen (K-10) = Song-Tonart.

**Verschieben** (`S.shift`, −6 … +6)
- [−][+] zeigt „a-Moll → h-Moll (+2)“, wirkt **ab dem nächsten Takt**; klingende Noten behalten ihre Höhe.
- Chromatisch für alle Synth-Spuren inklusive MELODIE, Akkord-Zeilen (Anzeige) und Song-Melodie; **Drums nie**. Intervalle bleiben exakt.
- Umsetzung: `S.shift` wird nach der Harmonie-Abbildung zur Ausgangstonhöhe addiert (I-01): `aus = map(…) + S.shift + R.xp` (`R.xp` nur für Spuren mit ⇅ folgt, §4.4). Anzeigen (Träger, Szenen-Tonart, Akkord-Namen, Song-Tonart) rechnen `S.shift` ein.
- **„Tastatur mitverschieben“** (Standard an): Live-Noten in SPIELEN klingen + shift. Aufgenommen wird **gehört − shift**, damit jede spätere Verschiebung alles gleich behandelt – an **jedem** Aufnahme-Weg: REC/Overdub (`recNoteOn`, `commitRecNote`), FANG (`CAP.open`/`capture`), Song-Melodie (`melNoteOn`), Schritt-Eingabe in ROLLE (`stepInput`), ● SCHRITT in LAUF (Stift-Ton) und [♪ greifen] in der Akkord-Zeile. Sonst würde um `shift` zu hoch gespeichert und eine spätere Verschiebung wirkte doppelt.
- [Fest anwenden] (Profi, im ⋯ des Song-Kopfs): schreibt `shift` in alle Daten (Clip-Noten und Clip-Tonarten der Synth-Spuren, Akkord-Zeilen, Teil-Transpositionen, Song-Melodie, Projekt-Tonart), setzt `S.shift = 0`. Ein Undo. Klang danach identisch.

### 4.11 Daten (Format 4)

```js
S.tracks: Track[≤8]             // Index stabil: 0–3 Synth 1–4, 4 DRUMS, 5 MELODIE, 6–7 Synth 5–6
SynthTrack += { mel?: true }    // MELODIE-Spur (kein „role“: Rollen gibt es nur einmal, in track.mix.role ab V7c, §8.6)
Track.clips: [Clip|null × 8]
S.ui += { order:[0,1,2,3,5,4], sceneBank:0, trackBank:0, partPage:0 }
S.scenes[i] = { name, chords?: ChordRow }                       // 8 Szenen
ChordRow = { len: 1..16, ch: [{ b /*Schlag relativ*/, tg /*normTarget*/ }] }
S.parts = [Part|null × 8]                                      // 8 feste Plätze (P: Seiten 1–4 │ 5–8)
Part = { id:'P1', name:'Strophe', color:'t2', len /*Takte*/, start:'bar'|'end',
         slots: [ {s:0..7} | -1 /*aus*/ | null /*bleibt*/ ] × NT,
         chords: ChordRow|null, xp: null|{semi:-12..12}|{tg},
         src:'fang'|'manual'|'rec', st?: {…} /*§6*/ }
S.chain = { items: [{ part:'P1'|'S3', rep:1..16, alt?: {slots?, chords?} /*ABWEICHUNG*/,
                      mel?: {[t]: {notes: Note[]}} /*gleiche Form wie song.mel; Schläge relativ zum Stellenanfang*/ }],
            loop: 'off'|'song'|'part'|'range', range?: {a, b} /*Takte*/ }
S.song (WP6) bleibt Abspielplan: { bars, loop:{on,a,b}, lanes[NT] /*Einträge {bar, slot, re?:1}*/, carrier, mel:{[t]:{notes}},
         xp?: [{beat, semi}] /*Teil-Transposition, nur abgeflacht*/, src:'chain'|'rec', melodyTrack? }
S.shift = 0;  S.settings.shiftKb = true
Laufzeit: R.mem, CAPC, R.part {id, startBeat, pass}, R.row {src, startBeat, len}, R.chainPos, R.recTargets {parts, chords, mel}, R.hand, R.xp
```
- `songOverride` wird `NT` lang. `S.song` mit `src:'chain'` wird nie direkt bearbeitet, sondern aus der Kette abgeflacht; Bearbeitungen landen in `S.chain`/`S.parts`.
- Migration Format 3 → 4 (in `normalizeProject`, verlustfrei): MELODIE-Spur anhängen (Index 5), Szenen 5–8 leer, Clips auf 8 Plätze, `song.lanes` auf NT, `song.melody` → `song.mel[melodyTrack]`, `song.loop` → Objekt, `S.parts = [null×8]`, `S.chain = {items:[], loop:'off'}`, `S.shift = 0`. (Ab V2c′: fehlt `settings.harmony.oneScale`, gilt `false` – gespeicherte Projekte klingen gleich; nur neue Projekte (`newProject`, auch [Leer (Init)]) setzen `true`; die Demo bleibt `false` (alte Harmonie-Tests, I-09).) Die WP6-Kette aus Szenen (falls angelegt) wird **nicht** umgedeutet: der Song bleibt Mitschnitt (E3-07).

---

## 5. Editor- und Melodie-Werkzeuge

Quellen: R5-H4 (B1–B4), R5-Audit E (gemessen), Master-Briefing Phase C Paket 2 (Spiegeln, Rückwärts, Drehen, Dehnen, Clip-MIDI; `r4/korrektur/spiegel-check.out`), v3-Konzept B1/B2. Die „Melodie-Werkzeuge“ der Roadmap sind vollständig in diesem Kapitel enthalten (Spiegeln, Rückwärts, Drehen, Dehnen, Clip als MIDI).

### 5.1 FOLGEN (V0b)

**Befund (gemessen):** Drum-SCHRITTE und LAUF bleiben auf Takt 1; das Lauflicht verschwindet von Schlag 4,5 bis 8,0 (`drumEdFrame` Z. 13777, LAUF Z. 14305). Die Rolle springt bei 4 Takten / 1 Takt sichtbar bei Schlag 3,8 und 6,8 (x 40 → −223 → −486 px), **auch mit gewählter Note** (`playhead()` Z. 4108 prüft nur `opts.follow && !gst && P.size === 0`).

**Regel (gilt für ROLLE, LAUF, SCHRITTE und die Melodie-Rolle):**
- **FOLGT** (Standard): ROLLE blättert seitenweise, sobald die Abspielmarke 85 % der Breite erreicht. LAUF und SCHRITTE zeigen **am Taktstrich** die Seite mit der Abspielmarke (ohne Animation, ohne Überblendung). Der heutige Sprung bei `x < 0` (Marke links außerhalb, WP7 `PianoRoll.playhead`: `x > 0,85·W || x < 0`) ist **nur im Zustand FOLGT** erlaubt.
- **HÄLT** automatisch, solange mindestens eines gilt:
  (a) ein Finger liegt auf dem Raster oder einer Lane;
  (b) Noten, Schritte oder Takte sind markiert;
  (c) Schritt-Eingabe, ● SCHRITT, Radierer, Auswahl-Werkzeug oder LOCK-Modus ist aktiv;
  (d) die letzte Bearbeitung (auch eine Zeichen-Geste mit ✎) liegt < 3 s zurück;
  (e) **von Hand:** die Ansicht wurde von Hand verschoben oder gezoomt (Wischen, zwei Finger), oder eine Seite bzw. ein Takt-Chip wurde von Hand gewählt. (e) endet **nicht** nach Zeit, sondern erst, wenn Xander auf [⏸ HÄLT · von Hand] tippt (→ FOLGT, die Ansicht springt zur Abspielmarke), den Editor schließt oder den Transport neu startet.
  ✎ Zeichnen allein (das Standard-Werkzeug) hält nicht, sonst folgte ROLLE nie; jede Zeichen-Geste setzt (d). Der Loop läuft in allen Fällen hörbar weiter.
- **Anzeige** im Editor-Kopf: [⟶ FOLGT] grün / [⏸ HÄLT · Grund] amber (Grund: „von Hand“, „Auswahl“, „Finger“, „Werkzeug“, „gerade bearbeitet“). Tippen: FOLGT → AUS ([⟶ AUS] grau, dauerhaft, `S.ui.follow` je Editor-Art); AUS → FOLGT; HÄLT → FOLGT (hebt (e) auf; (a)–(d) gelten weiter).
- Die Taktleiste bzw. die Seiten-Chips zeigen den **laufenden Takt immer** mit einem Lauf-Punkt, auch wenn die Ansicht hält. Das Lauflicht wird auf der sichtbaren Seite gezeichnet, wenn die laufende Seite angezeigt wird; sonst blinkt der Lauf-Punkt.
- Wechselt die Ansicht durch FOLGEN, ändert sich nichts an Auswahl, Werkzeug oder Undo.
- Vorbild: Cubasis (Ansicht folgt nicht, solange man im gezoomten Ausschnitt arbeitet; Xander R5-H4).

### 5.2 Taktleiste (V3a)

```
│ Synth 2 · Szene 1 · 4 Takte · a-Moll     [⏸ HÄLT · von Hand] [✕] │
│ TAKT [ALLE][1][2▣][3▣][4•]        ▣ markiert · • Lauf-Punkt      │  32 px
│ ……………………… ROLLE / LAUF / SCHRITTE ………………………                       │
│ [TAKT│FORM] [⇄ Tauschen][→ Verschieben][⧉ Kopie][✕ Löschen][○ Leeren] │  Aktionsleiste (statt Werkzeugleiste)
│ [TAKT│FORM] [⟲ Drehen][⇅ Spiegeln][⇆ Rückwärts][↔ Dehnen][▤ Reihenfolge] │  (Segment FORM, ab V3b)
```
- Steht über ROLLE, LAUF und SCHRITTE; in LAUF und SCHRITTE ersetzt sie die Seitenwahl „Takt n ▾“. Bei > 8 Takten (P) zwei Zeilen à 8 Chips; bei 16 Takten in P3 Chips ≥ 36 px in zwei Zeilen.
- **Hinsehen und Markieren sind getrennt:**
  - Erster Tipp auf einen Takt-Chip = **nur anzeigen** (die Ansicht HÄLT „von Hand“, §5.1 (e)). Blättern zu Takt 2 und dort VEL/AKZENT/TUNE ändern geht so ohne Aktionsleiste.
  - Tipp auf den **schon angezeigten** Chip = **markieren**; jetzt erscheint die Aktionsleiste.
  - Ein weiterer Chip bei bestehender Markierung = Bereich (wie `rulerTap`). Ein markierter Chip erneut = Markierung weg.
  - **[ALLE]** markiert den ganzen Clip (für „ganze Phrase um 1 Takt drehen“).
  - Hilfe-Zeile: „Takt antippen = hinsehen, nochmal = markieren“.
- **Aktionsleiste** erscheint mit Markierung und **ersetzt die Werkzeugleiste des Editors in gleicher Höhe** (ROLLE/LAUF: Werkzeugleiste; SCHRITTE: Funktionszeile). Der Körper wird nicht kleiner, nichts verschiebt sich um mehr als 2 px (L3). In SCHRITTE bleiben die **Lane-Reiter sichtbar**. P: **eine** Zeile mit Segment [TAKT│FORM] (≈ 64 px) + 5 Knöpfen à ≥ 56 px (P1: 64 + 5 × 58 + 5 × 4 = 374 px; P3: 56 + 5 × 46 + 5 × 3 = 301 px, Knöpfe nur mit Zeichen + 9-px-Text). L: alle 10 Knöpfe in einer Zeile, kein Segment. Ohne Markierung kehrt die Werkzeugleiste zurück. Kein Halten, kein Doppeltipp (L4).
- Die FORM-Knöpfe öffnen je ein **Mini-Blatt** mit ihren Segmenten (Drehen: [◀][▶] und Weite [1T│½T│1S]; Spiegeln, Rückwärts, Dehnen §5.3; Reihenfolge §5.4). Vor V3b ist das Segment ausgeblendet.
- Jede Aktion = ein Undo-Schritt, im nächsten Durchlauf hörbar (`afterClipEdit`). Takt-Operationen verschieben Notenfelder vollständig (`t, d, n, v, o, a, p, r, m, lk`; `normNoteExtras`). `clip.seed` bleibt.
- **Längen-Sperre (Runde 1 B2, V3a):** In der ROLLE-Werkzeugleiste ein Schalter **[⇔ Länge: frei│gesperrt]** (Standard frei). Gesperrt = jede Berührung einer Note verschiebt sie, die Länge ändert sich nie. Zusätzlich ist die Längen-Zone (rechtes Notenende, heute 35 % der Breite, 10–22 px) nur bei Noten ab 30 px Bildschirmbreite aktiv.

**Aktionen (Bereich A = markierte Takte [a, a+W) in Schlägen)**

| Aktion | Ablauf | Regel |
|---|---|---|
| **⇄ Tauschen** | „Mit welchem Takt?“ – Chips blinken, Ziel-Chip tippen | tauscht A mit dem gleich langen Bereich ab dem Ziel; überlappende Bereiche nicht erlaubt (Chip grau) |
| **→ Verschieben** | Einfüge-Marken ▾ zwischen den Chips, Marke tippen | A herausnehmen, an der Marke einfügen; der Rest rückt nach; Länge bleibt |
| **⧉ Kopie** | Einfüge-Marken, Marke tippen | Kopie von A an der Marke einfügen; Clip wird um W länger (≤ 16 Takte); darüber: Blatt [Überschreiben ab Marke] [Abbrechen] |
| **✕ Löschen** | sofort | A entfernen, der Rest rückt nach, Clip wird kürzer (mindestens 1 Takt) |
| **○ Leeren** | sofort | Noten in A entfernen, Länge bleibt |
| **Zuschneiden** | vorhanden (`cropToLoop`) | bleibt (Knopf heißt „Zuschneiden“, K-05) |

- Zugehörigkeit: Eine Note gehört zu dem Takt, in dem sie **beginnt**. Wird sie bewegt, behält sie ihre Dauer (darf über den Bereich hinausragen).

### 5.3 Drehen, Spiegeln, Rückwärts, Dehnen, Clip als MIDI (V3b)

**⟲ Drehen** [◀][▶] mit Weite [1 Takt │ ½ Takt │ 1 Schritt (Raster)]; mehrfach tippen summiert, jeder Tipp ein Undo.
- `t' = a + ((t − a + Δ) mod W)`, Dauer bleibt, `o' = o + (t' − t)`. Zweimal hin und zurück = Original (Abnahme).
- Drums: Schritte und alle Lane-Felder wandern mit.

**⇅ Spiegeln** (oben ↔ unten), kleines Blatt mit Segmenten:
- Modus **[in Tonart│chromatisch]**, Achse **[Mitte│erster Ton│gewählter Ton]**.
- **in Tonart:** Stufen um die Achse spiegeln: Stufe s → 2·sₐ − s (Leiter der Clip-Tonart). Leiterfremde Töne gelten als zwischen ihren Leiter-Nachbarn; gespiegelt wird die untere Nachbarstufe, der Halbton-Versatz bleibt (kann auf einen Leiterton fallen; C-Dur: 80 von 280 Fällen, gerechnet, `r4/korrektur/spiegel-check.out`; dann nur per Undo umkehrbar).
- **chromatisch:** p' = 2·pₐ − p.
- Hat der Clip leiterfremde Töne, schlägt das Blatt „chromatisch“ vor.
- Drums: Spiegeln grau („nicht für Drums“).

**⇆ Rückwärts:** Segment **[ganz│nur Tonfolge]**.
- **ganz:** `t' = 2a + W − t − d` (Dauer bleibt). Noten, die über das Bereichsende ragen, werden vorher auf das Ende gekürzt.
- **nur Tonfolge:** Rhythmus bleibt; Notengruppen mit gleichem Anfang (|Δt| < 1/64 Schlag) gelten als Akkord; die Tonhöhen der Gruppen werden in umgekehrter Reihenfolge verteilt (Gruppe k bekommt die Tonhöhen von Gruppe n−1−k; abweichende Gruppengrößen: von unten aufgefüllt bzw. obere Töne verworfen, Hinweis).
- Drums: nur „ganz“.

**↔ Dehnen** [×2 │ ½]: `t' = a + f·(t − a)`, `d' = f·d`; der Clip wird entsprechend länger (≤ 16 Takte, sonst Toast „zu lang“) bzw. kürzer (mindestens 1 Takt, aufgerundet). Unterschied zum vorhandenen ×2 im Clip-Blatt (verdoppelt Länge **und** Inhalt): Hilfe-Text nennt beide.

**Clip als MIDI** (Clip-Blatt → [Als MIDI]): eine Datei je Clip, Segment [mit Träger │ Original]; Auslieferung wie der vorhandene MIDI-Export (`deliverNow`, im Viewer als .zip). Name `synquenzer-<projekt>-s<spur>-sz<szene>.mid`. Der FANG-Toast bekommt [Bearbeiten] [Rückgängig].
- **`deliverNow` absichern (V3a, gilt dann für alle Exporte):** heute packt es nur `kind ∈ {mid, m4a, webm}` ins ZIP und speichert jede andere Art als `<base>.json` mit Typ `application/json` (WP6 Z. 15385). Neu: `zip = kind ∈ {mid, syx, m4a, webm, wav}`; Download-Typ im Viewer `application/zip`, im Safari-Pfad ohne ZIP je Art (`syx` → `application/octet-stream`, `mid` → `audio/midi`; heute auch dort `application/json`); Toast-Text je Art („MIDI gespeichert (ZIP)“, „DX7-Bank gespeichert (ZIP)“). `buildZip` setzt das Flag 0x0800 (UTF-8-Namen), sobald ein Name Nicht-ASCII enthält; zusätzlich werden Dateinamen auf ASCII umgeschrieben (ä → ae, ö → oe, ü → ue, ß → ss), weil manche Entpacker das Flag ignorieren (eK).

### 5.4 Varianten-Lane: Takt-Reihenfolge (V3b)

```
┌ REIHENFOLGE · Synth 2 · Szene 1 ─────────────────── [✕] ┐
│ Takte [1][2][3][4]  [– Pause]  [×2][×4]  [⌫]            │
│ Folge 3 3 3 3 │ 2 1 4 3                    = 8 Takte     │
│ Spielen [nur NEU✓][ALT/NEU im Wechsel][nach n×][Zufall 50 %] │
│ [▶ Vorhören]                            [Als neue Lane]  │
└──────────────────────────────────────────────────────────┘
```
- Chips hängen Takte an; ×2/×4 vervielfacht das letzte Glied; Pause = leerer Takt; ⌫ entfernt das letzte Glied. Höchstens 16 Takte.
- [▶ Vorhören] spielt die Variante ab dem nächsten Takt, ohne zu speichern (Rückkehr am Ende oder bei ✕).
- [Als neue Lane] legt die Variante VAR 1 an (VAR 2 …, höchstens 4). Der Editor-Kopf zeigt [ORIGINAL ○][VAR 1 · 3×4, 2-1-4-3 ●]; Umschalten wirkt ab dem nächsten Takt; ○/● = stumm/aktiv. Die Zelle in der Matrix zeigt „Var1“.
- **Regel, keine Kopie:** Eine Änderung an Takt 3 des Originals ändert die Variante mit.
- **Spielen:** `only` = nur Variante; `alt` = Original und Variante im Wechsel (je ein Durchlauf); `after` = nach n× Original einmal Variante; `rand` = je Durchlauf mit Wahrscheinlichkeit p die Variante, wiederholbar über `clip.seed` und Durchlaufzähler.
- **Zykluslänge** (der Scheduler plant streng periodisch, `k = ceil((from − cs − t)/L)` mit `L = clip.len·4`, WP6 `scheduleTrack`; Varianten sind aber oft anders lang):
  - `only`: L = `var.len`.
  - `alt` / `after`: ein **Zyklus** ist die Verkettung (Original ×1 + Variante bzw. Original ×n + Variante), geplant als **ein** flacher Clip mit `L_Zyklus` ≤ 16 Takte. Wäre der Zyklus länger, ist die Wahl gesperrt (grau, „Zyklus wäre 20 Takte – höchstens 16“).
  - `rand`: nur erlaubt, wenn `var.len = clip.len` (sonst gesperrt mit Hinweis); Durchlauf n = `floor((B − cs)/L)`, Entscheidung aus `seed` und n.
  - `effLen(clip)` = L bzw. `L_Zyklus` gilt überall, wo heute `clip.len` gilt: Teil-Länge („längster Clip“), Stopp am Clip-Ende, Fortschrittsanzeige der Zelle, FANG-Phase, Abflachen der Kette, MIDI-Export.
- Scheduler, MIDI-Export und Tonart-Erkennung lesen die abgeflachte Notenliste des Zyklus (`R.flat[t][s]` mit Länge `effLen`, Cache, bei Änderung verworfen).

### 5.5 LAUF+ — Groovebox-Eingabe für Synth (V3c)

```
│ LAUF · Synth 1 · 2 Takte   [⟶ FOLGT]   [● SCHRITT: A2]    │
│ TAKT [1•][2]                                               │
│ ┌──┬──┬──┬──┬──┬──┬──┬──┐                                  │
│ │A2│  │A2│C3│▮ │E3│  │G3│   ▮ = Lauflicht                  │
│ ├──┼──┼──┼──┼──┼──┼──┼──┤                                  │
│ │A2│+2│  │  │A2│  │C3│  │   +2 = Akkord-Schritt             │
│ Lanes [TON][OKT][VEL][AKZENT][BINDUNG]                     │
```
- LAUF steht für **jeden** Synth-Clip offen. **Akkord-Schritte** bis 4 Töne: Die Zelle zeigt den obersten Ton + „+n“. Senkrecht ziehen verschiebt den ganzen Akkord in Stufen der Clip-Tonart. Lanes wirken je Akkord-Schritt auf alle Töne.
- `laufCheck` (Z. 14005) lehnt nur noch ab: mehrere **verschiedene** Anfangszeiten innerhalb einer Rasterzelle (Text „Clip ist zu dicht für dieses Raster – feineres Raster oder ROLLE“) oder > 4 Töne an einem Schritt.
- **Lauflicht** auf den Schritt-Tasten (≤ 30 fps), FOLGEN nach §5.1.
- **[● SCHRITT]** (TR-Prinzip): Tipp schaltet ein (rot). Eine Taste oder ein Akkord in SPIELEN (40-ms-Sammeln) setzt den **Stift-Ton** (Anzeige „● SCHRITT: A2“ bzw. „Am“); Schritte antippen schreibt ihn, auch während der Loop läuft; ein Schritt, der genau den Stift-Ton enthält, wird beim Tipp gelöscht. Erneuter Tipp auf ● SCHRITT beendet. Jeder Schritt-Tipp ein Undo.
- Ein neuer leerer Synth-Clip öffnet im zuletzt benutzten Modus (ROLLE/LAUF, `S.ui.edMode`). Das Ergebnis ist sofort in ROLLE sichtbar (derselbe Clip, keine neuen Felder).

### 5.6 Daten (Editor)

```js
Clip += { vars?: [{ id:'var1', rule:[{bar:3, rep:4}, {bar:2}, {bar:1}, {bar:4}, {bar:3}] /*bar:-1 = Pause*/,
                    len /*Takte der Variante*/, play:'only'|'alt'|'after'|'rand', n?:4, p?:.5 }], use?: 'var1'|null }
// effLen(clip) = Zykluslänge (§5.4), abgeleitet, nicht gespeichert
S.ui += { follow:{roll:true, lauf:true, steps:true}, edMode:'roll'|'lauf' }
// LAUF-Akkord-Schritte: Noten mit gleichem t (keine neuen Felder)
```

---

## 6. Klangzustände, Morph und Registrierungen

Quellen: R5-H5 (Teil C), Master-Briefing Teil 8 (Octatrack-Blende, Morph-Griff), §v2-9. Vorbilder (SE): Yamaha Montage Szenen und SSS (klingende Noten laufen weiter; Nutzer wünschen eine Übergangszeit), Kemper Morphing, Cherry Audio Scene Manager, MODX „am Takt“, Elektron Octatrack (Crossfader zwischen Szenen). **Neuheit (unsicher, 3 Suchen):** ein automatischer Morph, der genau die Wartezeit der Start-Quantisierung füllt, klingende Noten mitnimmt und am Taktstrich fertig ist, je Clip gespeichert.

### 6.1 Begriffe

- **Grundklang:** der Sound der Spur (`track.sound`).
- **Klangzustand ◆:** gespeicherte **Abweichung** vom Grundklang an einem Clip (`clip.st`). Nur geänderte Werte.
- **Teil-Klang:** Zustände je Spur an einem Teil (`part.st`), überschreiben die Clip-Zustände (KZ5).

### 6.2 Bedienung (V6a)

1. Clip läuft, Klang-Editor offen, Regler drehen.
2. Im Editor-Kopf **[◆ Merken]**: Der Unterschied zum Grundklang wird Zustand des **laufenden** (sonst gewählten) Clips der Spur. Die Clip-Zelle zeigt ◆ (rechts oben, 10 px).
3. Ab jetzt zeigt der Kopf ein amberfarbenes Band (24 px): „Bearbeite: ◆ Clip Szene 2 · 3 Werte anders · [Grundklang]“. Gedrehte Regler gehen **in den Zustand**. [Grundklang] schaltet das Ziel zurück auf den Grundklang (Band wird grau: „Bearbeite: Grundklang · [◆ Szene 2]“).
4. Szene oder Clip wechseln: Die Regler **fahren** zum neuen Zustand (KZ1); man sieht sie sich bewegen; die Zelle füllt ◆ als Fortschritt.
5. **Clip-Blatt → ◆:** „Übergang [Fließend bis Takt✓][1 Takt][2 Takte][Sprung]“ · [◆ für ganze Szene merken] (Zustand aller Spuren an alle Clips der Spalte; Spuren ohne Abweichung bekommen keinen; ein Undo `group`) · [Kopieren] [Einfügen] [Löschen]. Darüber die Liste der Abweichungen in Klartext: „Cutoff 800 Hz → 2,4 kHz · Res 20 → 40 % · Hall 15 → 30 %“.
6. „Was ist anders?“ (◎, WP5) zeigt auch Zustand gegen Grundklang.

### 6.3 Regeln KZ1–KZ7

- **KZ1 Zeit:**
  - Handwechsel (Tipp auf ▶n, Clip, Teil): Morph beginnt beim Tipp und endet am Taktstrich des Wechsels. Ist die Restzeit < 1 Schlag, läuft er über den Strich hinaus, insgesamt 1 Schlag.
  - Song/Kette (geplanter Wechsel): Morph beginnt 1 Schlag vor dem Taktstrich (der Scheduler fragt das nächste Ereignis 1 Schlag voraus ab).
  - „1 Takt“/„2 Takte“: beginnt am Taktstrich. „Sprung“: 5 ms am Taktstrich.
  - Kurve S (glatt an Anfang und Ende: `x² (3 − 2x)`), im **Reglerraum**: Frequenzen logarithmisch, Pegel in dB, sonst linear.
- **KZ2 Was fährt:** alle stetigen Parameter mit Bereich (PD-Tabelle mit min/max, Z. 6877 ff.): Filter, Hüllkurven-Zeiten und -Pegel, Anteile, Fein-Stimmung, Pulsbreite, Unison-Verstimmung/-Breite, LFO-Raten und -Tiefen, Glide, Klang-Pegel, FM-Makros und Operator-Pegel, Mod-Tiefen; Spur-Werte aus `track.mix` (Zustandsfeld `st.mix`; V7a ist vor V6a gebaut, E3-32): Lautstärke, Pan, Sends, dazu Chorus-Mischung; Drum-Parameter je Schlag (jeder Schlag liest den aktuellen Wert). **Drive** hat keinen AudioParam (WaveShaper-Kurve mit A/B-Blende ≈ 25 ms): im Morph höchstens 8 Stufen, je ≥ 40 ms Abstand, über die A/B-Shaper-Blende. **Nativ nur „ab nächster Note“** (Regler-Hinweis „wirkt nativ ab der nächsten Note“): WT-Position und -Tabelle (WP7 legt sie beim Anschlag fest, nur die nötigen Frames, feste Gains) und PeriodicWave-Werte.
- **KZ3 Diskrete Werte** (Welle, Fußlage, HT, Unison-Zahl, Filtertyp, Sync, LFO-Form/-Sync, FM-Algorithmus/Kanten) gelten **ab dem Taktstrich für neue Noten**; **klingende Noten behalten ihren Wert bis zum Loslassen** (SSS-Prinzip; Standard ab V6a, nicht erst als Notlösung). Umsetzung: Werte, die die Stimme besitzt, werden beim Anschlag in die Stimme kopiert; spurweite Werte (LFO-Form/-Sync) wechseln am nächsten Phasen-Nulldurchgang des LFO. Wo eine Stimme einen Wert nicht selbst halten kann, gilt die echte Stimmen-Überblendung 30 ms (L3, gebaut in V4a). Die WP4-Blende `setReq`/XF (≈ 4 ms Loch) ist dafür **nicht** zulässig.
  - **Modus (mono/poly/legato) und Poly-Zahl gehören nie zum Zustand** (Regler grau „nur im Grundklang“): `setParams` lässt bei mono↔poly alle gehaltenen Stimmen los; ein Zustand MONO gegen Grundklang POLY würde gehaltene Flächen am Taktstrich beenden.
- **KZ4 Endwert** eines Parameters: `clamp( relativ( Lock ?? (Zustand (fahrend) ?? Grundwert) ) ) + Σ Modulation` (erweitert E4; absolute Locks `lk.v`, danach die relativen Drum-Locks `tune`/`dec`, §7.4). Mod-Ringe beziehen sich auf den fahrenden Grundwert.
- **KZ5 Rangfolge:** Teil-Klang > Clip-Zustand > Grundklang. Ein Clip ohne Zustand fährt zurück zum Grundklang. Eine gestoppte Spur behält ihren letzten Zustand (keine Bewegung in der Stille).
- **KZ6 Wer anfasst, übernimmt:** Wird während des Morphs ein Regler gedreht, endet der Morph für diesen Parameter; er folgt der Hand.
- **KZ7 Ein Morph-Kern** für drei Funktionen: automatischer Wechsel (hier), **MORPH-Griff** (§6.6) und später die Octatrack-Blende A↔B (JAM-2, §18).

### 6.4 Morph-Kern (Technik, V6a Worklet, V6a′ nativ)

```js
// Worklet-Nachricht (Synth-Worklet, VA/FM/Tabelle/Bitmask/Additiv):
{type:'morph', id, t0, t1, curve:'s', to:{key:value, …}, disc:{key:value} /*diskrete Werte*/, at:t1 /*ab hier für neue Stimmen*/}
{type:'morphStop', keys:[…]}        // KZ6
```
- Das Worklet interpoliert **je Block (128 Samples)** nur die genannten stetigen Schlüssel und ruft `derive()` nur für die betroffenen Teile. (Kosten von `derive()` je Block messen; Ziel: Worklet-Last während eines Morphs höchstens +1 % gegenüber Ruhe.) Diskrete Werte aus `disc` bekommen nur Stimmen, die ab `at` starten (KZ3).
- **Effektive Werte (Hauptthread):** Während eines Zustands oder Morphs hat das Worklet andere Werte als `track.sound` (Grundklang). Darum gibt es eine Schicht `effective(t) = clamp(Grund ⊕ Zustand(fahrend))`. `wkFlat`, `wkFm6`, der native Anschlag und `applyChainFx` lesen **nur** `effective(t)`, nie `track.sound` direkt. Ein Voll-Abgleich (`syncEngine(i, true)` bei Preset-Laden, Undo, `restoreSoundSnapshot`) schickt während eines Morphs den **Endwert** und danach erneut `{type:'morph'}` mit der Restzeit. `force=true` (Struktur-Blende) nur noch bei echten Strukturwechseln, nie beim Abgleich. Heute schickt `syncEngine` den Grundklang mit `force=true` (WP6 Z. 7705) – der Klang spränge zurück.
- Der Hauptthread zeigt die Reglerstellung aus **derselben** Formel (kein Rückkanal), ≤ 30 Hz.
- **Test-Hook** `__morphProbe(t, on)` (nur für Tests, wie `scopeDst`): Das Worklet meldet je Block die interpolierten Schlüssel der Spur. Keine Oberfläche nutzt ihn.
- **Nativ** (WT-Pfad, Rückfall, Drum-Kanal, Spur-Mix; V6a′): **kein `setValueCurveAtTime`** (L3: `applyChainFx` setzt bei jeder Effekt-Änderung Lautstärke, Pan und Sends per `setTargetAtTime(now)`; während einer Kurve wirft das `NotSupportedError`, KZ6 wäre nicht baubar). Stattdessen Stufen alle 16 ms mit `setTargetAtTime` (τ 8–10 ms); vor jeder neuen Automation `cancelScheduledValues(now)` + `setValueAtTime(aktueller Wert)`; jeder Aufruf in `try/catch`. Der gemeinsame Gain `vol²/(1 + 1,5·drive)` wird als **eine** Folge gerechnet (bis V7a; ab V7a sitzt der Drive-Ausgleich in der Klang-FX-Kette, §8.3). Drive wie KZ2 in höchstens 8 Stufen.
- **Drums:** `stAt(t)` liefert den interpolierten Slot-Wert zum Schlagzeitpunkt; `drumHit` nutzt ihn.
- Laufzeit: `R.st[t] = {from, to, t0, t1, hand:Set}`.

### 6.5 Registrierungen = Teile (V6b)

- Registrierungen sind die **Teile** der Teil-Leiste (§4.4): Kombination von Clips verschiedener Szenen + Transposition auf einer Taste, 8 Plätze.
- **Teil-Klang:** Im Teil-Blatt „Klang [wie Clips✓] [◆ eigener Teil-Klang]“. „Eigener“ übernimmt die aktuell klingenden Zustände aller Spuren als `part.st`; ab dann gilt KZ5. Bearbeiten wie in §6.2 (Band „Bearbeite: ◆ Teil Strophe“).

### 6.6 MORPH-Griff (V6b)

- Im Synth-Editor-Kopf erscheint bei einem Clip mit ◆ ein waagrechter Schieber **MORPH** (Grundklang ↔ ◆, 0–100 %), 120×32 px (P: in der zweiten Kopfzeile).
- Stellung = Mischung im Reglerraum (KZ1-Kurve linear). Wirkt sofort (Glättung τ 20 ms), wird **nicht** gespeichert, außer man tippt [Als Zustand] (ein Undo).
- Zuweisbar an das Mod-Rad (Schalter „Mod-Rad = MORPH“ im STIMME-Reiter). Nord-Lead-Prinzip (Morph belegt ab NL2, SE).

### 6.7 Daten

```js
Clip += { st?: { eng:'analog'|'fm6'|…, p:{key:value}, fx:{drive?, chorus?}, mix?:{vol?, pan?, rev?, dly?}, slots?:{[slotId]:{key:value}} /*nur Drums*/,
                x:'flow'|'bar1'|'bar2'|'jump' } }
Part += { st?: { [track]: { p, fx, mix?, slots? } } }
S.settings.morph = { x:'flow', curve:'s' }
```
- **Schlüssel sind Pfade** in den Sound: `'cutoff'`, `'fm6.ops.2.ol'`, `'mods.3.amt'`, `'fmx.edges.4.amt'`, `'mask.o1.pos'`. Drums: `st.slots = {[slotId]: {Schlüssel: Wert}}` mit den Engine-Schlüsseln aus `DrumSynth.DEFAULTS` (z. B. `{KICK: {tDec: .6}}`). Ein Pfad, den der Sound nicht (mehr) hat, wird ignoriert.
- Undo-Art `sound` mit Ziel `clip.st` bzw. `part.st`.
- Preset-Wechsel der Spur: Zustände bleiben bei gleicher Engine; fehlende Schlüssel fallen weg. Engine-Wechsel: Blatt „Zustände passen nicht – [behalten, inaktiv] [löschen]“.
- MIDI-Export enthält keine Zustände (Hinweis im Export-Blatt); „Song als Audio“ enthält sie.
- Der CPU-Begrenzer ändert nie Zustände (I-08).

---

## 7. Modulation: Strang-Ansicht und P-Locks

Quellen: R5-H6/H10 (`r5/h2610/`), R5-Audit G (gemessen), §v2-9, Vision E4, Master-Briefing Phase C Paket 3. Vorbilder: Vital-Matrix (Quellcode direkt gelesen: eine Bank für alle Verbindungen, Bipolar/Bypass je Zeile), Serum-MATRIX (SE), Bitwig-Inspector und Modulator-Ringe (SE), Elektron P-Locks (eK).

### 7.1 Befund

- Alle Routen – auch per Regler-Halten angelegte – stehen in `sound.mods` (≤ 8) und im MOD-Tab als Zeile „Quelle | Ziel + Bereich | Tiefe | ✕“ (Z. 12730–12790). Das ist richtig, aber:
  - oben stehen 8 Quellen-Kacheln ohne Ziel-Angabe (P ≈ 200 px) – vermutlich die „nichtssagenden Kacheln“ (**Deutung, unsicher**);
  - quer passen nur 3 Zeilen (`modRowFit`), die vierte Route war unsichtbar (gemessen);
  - Werks-Routen stehen gleichrangig dazwischen; keine Richtung, keine Polarität, keine Quellenform;
  - **fest verdrahtete Wege** (KEYTRACK, HÜLLK.-MENGE, FILTER-ANSCHLAG, Anschlag → Lautstärke, Lautst.-Hk. → Lautstärke) erscheinen nirgends.

### 7.2 MOD-Tab mit [STRÄNGE │ LISTE] (V5a)

**P (Körper ≈ 305 px)**
```
│ [STRÄNGE│LISTE]                          Routen 4/8   [+ Weg] │ 32
│ QUELLEN                              ZIELE                    │
│ LFO 1  ∿ ±  ━━━━━━━━━━━━━━━━━━━▶ Cutoff     380 Hz … 2,5 kHz  Σ +31 % │
│ Anschlag  + ─────────┐ ┌──────▶ Resonanz   30 … 59 %          │
│ Filt.-Hk. + ─────────┼─┘                                       │
│             └──────────────────▶ Lautstärke +30 %             │
│ Tonhöhe   ± ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄▶ Cutoff · fest: KEYTRACK 35 %  │
│ [feste Wege ▾]                                                │
├──────────── gewählter Strang ────────────────────────────────┤
│ LFO 1 → Cutoff  [−]━━━━━●━━━━[+] +27 %  [± umkehren][⏸ aus][✕][Regler ›] │ 44
```
- Gezeigt werden nur **benutzte** Quellen und Ziele (≤ 8 Routen ⇒ ≤ 8 Zielreihen à 32–40 px). Das automatische Layout ordnet Quellen links, Ziele rechts nach erster Verwendung; Kabel kreuzen sich so selten wie möglich (Reihenfolge nach Baryzentrum).
- **Kodierung:** Farbe = Quellenfarbe (§v2-9.1). Dicke 1,5–6 px ∝ |Tiefe|. Durchgezogen = positiv, gestrichelt = umgekehrt. Symbol an der Quelle: ± bipolar / + unipolar, dazu Mini-Bild (LFO-Welle, Hüllkurve). Pfeil am Ziel; Σ am Ziel bei mehreren Quellen. Schraffiert = auf dem nativen Pfad nicht hörbar (`routeActive`). Grau + Hinweis = wirkt im aktuellen Klang nicht (K-15). Live-Punkt auf dem Strang (Quellwert, ≤ 30 fps, nur sichtbare Stränge).
- **Feste Wege** grau gepunktet, eingeklappt unter [feste Wege ▾]: KEYTRACK (Tonhöhe → Cutoff), HÜLLK.-MENGE (Filt.-Hk. → Cutoff), FILTER-ANSCHLAG (Anschlag → Filt.-Hk.), Anschlag → Lautstärke, Lautst.-Hk. → Lautstärke, bei FM die Modulator-Kanten nicht (die zeigt das FM-Feld). Tipp springt zum Regler (z. B. KEYTRACK im FILTER-Tab, Brotkrume „MOD › feste Wege“).
- **Bedienung (nur Tippen und Ziehen):**
  - Strang tippen → Bearbeitungsleiste (Tiefe-Schieber, springt nicht zum Finger; [± umkehren]; [⏸ aus] = Bypass `m.byp`; [✕]; [Regler ›] öffnet Tab und Regler mit Ring).
  - Quelle tippen → markiert alle ihre Stränge; zweiter Tipp öffnet ihre Seite (LFO/HÜLLK.).
  - Ziel tippen → markiert alle Quellen dieses Ziels.
  - Neue Route (Regler-Halten, Mod-Modus, [+ Weg]) → ihr Strang blinkt 1,6 s (wie `ED.modHl`).
- **LISTE** = die heutige Zeilenansicht, Quellen-Kacheln als schmale Leiste (≤ 28 px) unter der Liste; in L zweispaltig, damit 8 Routen sichtbar sind.
- **L (Körper ≈ 140 px):** Quellen als Chips oben, Ziele als Chips unten, Stränge senkrecht dazwischen (≈ 80 px); die Bearbeitungsleiste ersetzt die Quellenreihe, solange ein Strang gewählt ist.

### 7.3 Mod-Ergänzungen (V5a)

- **Bypass** je Route `m.byp` (Worklet und nativ: Beitrag 0; gespeichert; Strang gestrichelt-grau).
- **Umkehren** = Vorzeichen der Tiefe.
- **LFO uni/bipolar** je LFO (Schalter auf der LFO-Seite, `lfoN.pol` 'bi'|'uni'; uni = (x+1)/2). Standard bipolar (wie heute).
- **Lautst.-Hk.** auch im Halte-Picker und in der Quellenleiste (heute nur über [+ Modulation]).

### 7.4 P-Lock-Regel (V5b/V5c)

```
Endwert = clamp( relativ( lk.v[k] ?? (Klangzustand ?? Grundwert) ) ) + Σ Modulation      // E4, erweitert um KZ4
```
- **Zwei Arten (E3-34):** **absolute** Locks `lk.v = {Schlüssel: Reglerwert 0–1}` (Elektron; neu ab V5b/V5c) und die **relativen** WP6-Drum-Locks `lk.tune` (Halbtöne: ×2^(n/12) auf `frq`, `mTun`, `tfFrq`, √ davon auf `nFrq`) und `lk.dec` (Faktor auf `tDec`, `nDec`, `mDec`), die unverändert bleiben (`DrumSeq.lockParams`, WP6 Z. 4166). Reihenfolge: absolut → relativ → + Σ Modulation. Ein Makro-Lock TON und ein TUNE-Lock auf demselben Schritt wirken also beide: erst der TON-Wert, dann ×2^(tune/12). Die Modulation rechnet relativ obendrauf (Bitwig). Ein LFO wirkt auch auf gelockten Schritten weiter.
- **Regler drehen ändert nur den Grundwert**; Locks bleiben. LCD: „CUTOFF 1,2 kHz · 3 Schritte gelockt“.
- **Gültigkeit:** je Note bzw. Stimme für ihre Lebensdauer; Mono/Legato bis zum nächsten Schritt, Übergang über die vorhandene ≈ 5-ms-Glättung; Drums je Schlag.
- Höchstens **8 absolute Locks je Note** (E4); `tune`/`dec` zählen nicht mit.

### 7.5 Bedienung der Locks

- **Lock-Lanes** (nach dem Muster TUNE/DECAY): Lane „◆ Ziel ▾“ in SCHRITTE (Drums), LAUF und ROLLE (Synth, unter VEL). Ziel wählbar aus der Lock-Liste. TUNE und DECAY bleiben relative Lanes wie in WP6 (Mitte = 0 HT bzw. ×1). **Absolute** Lanes zeigen den Grundwert (bzw. Zustandswert) als grauen **Geist** je Schritt; „kein Lock“ ist ein eigener Zustand (leere Raute), es gibt **keine** Mittelstellungs-Regel (sonst wäre der Mittelwert nie lockbar). Ziehen auf einem Schritt ohne Lock beginnt beim Geist-Wert und schreibt den Lock (volle Raute). Entfernen: [Lock löschen] in der Aktionsleiste mit Markierung. Doppeltipp gibt es im Editor nicht.
- **LOCK-Taste** in der Editor-Werkzeugleiste (E3-16): sichtbarer Modus mit Banner „LOCK · Schritte antippen · Fertig“ (rot gesäumt).
  - Schritte bzw. Noten antippen wählt sie aus (mehrere möglich; im LOCK-Modus schaltet Tippen **nicht** an/aus).
  - Darunter erscheint die **Lock-Leiste** mit 6 Reglern + [mehr ▾]:
    - Synth: Cutoff, Resonanz, Hüllk.-Menge, Decay (Amp), Drive, Fein-Stimmung (bei FM: Helligkeit statt Drive).
    - Drum-Pad (Typ-abhängig): die ersten 6 Makros des Typs (§3.3), [mehr ▾] = alle lockbaren Slot-Parameter.
  - Drehen schreibt den Lock auf alle gewählten Schritte (ein Undo je Geste); jeder gelockte Parameter bekommt automatisch seine Lane.
  - Mod-Modus und LOCK-Modus schließen sich aus.
- **Regler 450 ms halten** im LOCK-Modus öffnet keinen Picker (Banner-Hinweis „erst Fertig“).
- *(P1)* **Lock-Aufnahme:** REC-Optionen „Regler aufnehmen“: Reglerbewegungen beim Abspielen schreiben Locks in die Schritte, die in diesem Moment starten.

### 7.6 Engine und Daten

- **Drums (V5b):** `step.lk` gibt es (`tune`, `dec`, relativ). Neu `step.lk.v = {Makro-Schlüssel: Makrowert 0–1}`; `DrumSeq.lockParams` rechnet erst `lk.v` über die Makro-Abbildung (Anhang B.2) in Engine-Werte, dann `tune`/`dec` relativ. Kosten 0 (jeder Schlag baut seine Stimme neu).
- **Synth (V5c):** `note.lk = {v: {Parameter-Schlüssel: Reglerwert 0–1}}` (≤ 8). Das NOTE-Ereignis an das Worklet trägt Paare (Index, Wert). Die Stimme liest `v.lk[k] ?? P[k]` für: Filter (Cutoff, Res, Hüllk.-Menge, Drive), Pegel, Pulsbreite, Hüllkurven-Zeiten beim Note-On, Fein-Stimmung, FM-Helligkeit und Operator-Pegel, Tabellen-/Masken-Position (ab V8).
- **Nativ (ECO):** nur Cutoff und Lautstärke; andere Locks bleiben gespeichert und erscheinen schraffiert „nur mit Worklet“.
- **Spur-Locks** (Sends, Pan) gibt es nicht (§18).
- Daten: `Note.lk` existiert (Format 3, nur Drums, nur `tune`/`dec`). `normNoteExtras` und `cleanNote` übernehmen `lk` heute nur bei Drums (`if (kind !== 'drum') return out`, WP6 Z. 7094): ab V5b erhalten sie `lk.v` (≤ 8 Schlüssel, Werte 0–1) für **beide** Spurarten und `tune`/`dec` wie bisher. Kopieren, Takt-Aktionen und Undo nehmen es mit.

---

## 8. Mischung und Kontext-Master

Quellen: R5-H2 (`r5/h2610/`, gemessen), R5-Audit C (gemessen), Vision 1.1/1.2 (Kontext-Master L0–L4), E5, §v2-8. Prior Art (SE): iZotope Ozone Master Assistant (Einmal-Analyse; Ziele −14/−12/−11 LUFS), Neutron Mix Assistant, Logic Mastering Assistant, sonible smart:EQ 4 (Unmasking-Hierarchie), RoEx Automix. Bei uns neu (Einschätzung, nicht gezielt recherchiert): Rollen aus Parametern und Noten mit Rückfrage, bleibende Korrektur-Schicht über jeden REMASTER, Vorschläge an der Spur, Pump-Wächter live.

### 8.1 Befund und drei Ebenen (V7a)

**Befund (Code + gemessen):**
- Spur-Lautstärke, Pan, Hall-/Echo-Send und Pumpen stecken im **Sound** (`sound.fx`); `applySound` (Z. 11937–11940) ersetzt `T.sound` komplett ⇒ ein Soundwechsel überschreibt die Mischung.
- „Pegel“ hatte 4 Bedeutungen (V0b benennt um); 5 Orte für „lauter/leiser“.
- HALL, ECHO, MASTER (global) liegen in jedem Sound-Editor.
- Kick-Pad-Pegel −6 dB ergibt am Master nur −1,9 dB im Kick-Band (Pegel vor dem Drive; ab ev3 behoben, AR1).
- Kein Mischpult.

**Drei Ebenen, ein Zuhause je Regler:**

| Ebene | Gespeichert mit | Regler | Zuhause |
|---|---|---|---|
| **KLANG** | Sound / Kit | Anteil (Osz., Sub, Rauschen; Drum-Schichten) · Klang-Pegel (Pad-Pegel bei Drums) · Klang-FX Drive, Chorus · Kit-Raum/-Gate | Sound-Editor; Klang-Pegel nur unter STIMME bzw. TIEFE (Presets sind kalibriert); Pad-Pegel zusätzlich im Kit-Mischer |
| **SPUR** | Spur im Projekt, **bleibt beim Soundwechsel** | Lautstärke (dB-Fader), Panorama, Hall-Send, Echo-Send, Pumpen + Release, Hochpass, Stumm/Solo, Rolle, Auto-Trim (Geistmarke), „Gehaltene Töne bei Akkordwechsel“ | MIX-Blick; im Sound-Editor nur der Link „Mischung dieser Spur ↗“ |
| **MASTER / BUSSE** | Projekt | Hall, Echo (Bus-Seiten), Master (Ziel, Stil, Messung, Vorschläge; Profi: Glue, Helligkeit, Breite, Master-Ausgang) | MIX-Blick (Reiter MASTER, ⚙ an den Sends). **Nicht mehr im Sound-Editor** |

- Alle Lautstärken in **dB**, 0 dB Rastpunkt, Doppeltipp = 0 dB (Fader) bzw. Standard.
- **Soundwechsel:** Solange die Spur-Mischung unberührt ist (`mix.touched = false`), übernimmt die Spur die Send-Empfehlung des Sounds (`sound.fx.sendHint`), Toast „Hall vom Sound übernommen · [Rückgängig]“. Nach der ersten eigenen Fader- oder Send-Änderung bleibt die Mischung stehen; die Empfehlung erscheint nur als Chip „Hall wie im Sound (40 %)“. Bus-Hinweise (§v2-8.1) bleiben nie automatisch.
- **Sound speichern** speichert Klang + Klang-FX + Send-**Empfehlung**, nicht den Spur-Fader.

### 8.2 MIX-Blick (V7a)

Aufruf: **[MIX] in der Spurleiste** (öffnet das Mischpult mit dem Zug dieser Spur markiert), dazu Menü → Mischen und im Querformat ein Chip in der Kopfleiste. **Das Metronom ♩ bleibt in der Kopfleiste** (1 Tipp wie heute; es wird beim Einspielen und bei FANG oft gebraucht). Spurleiste P: `● Synth 4 · Mini-Lead [KLANG][✎][⇅][M][MIX][↶]`; der Spurname kürzt sich (P3: nur Farbpunkt und Nummer); M-PLATZ prüft P1–P3. Öffnet als Blatt wie die Editoren (P bedeckt die Fläche y 52 → 541).
```
P1 390 px
┌ MIX ────────────────────────────────────────────── ✕ ┐
│ −13,9 LUFS · Ziel −14 · TP −1,2 · Mono ✓ · Pumpen ✓  │ 32 Master-Kopf (Tipp = MASTER)
│ [PEGEL] [SENDS] [MASTER]           Last ▮▮▯▯ 31 %    │ 36
│  S1    S2    S3    S4    MEL   S5    S6    DR        │ 16 Namen
│ BASS  SEQ?  FLÄ   LEAD  MEL   –     –     KIT        │ 20 Rollen-Chip, ? = unbestätigt
│ [ M ] [ M ] [ M ] [ M ] [ M ] [ M ] [ M ] [ M ]      │ 36 Stumm, volle Zugbreite
│ [ S ] [ S ] [ S ] [ S ] [ S ] [ S ] [ S ] [ S ]      │ 36 Solo, volle Zugbreite
│  ◐     ◐     ◐     ◐     ◐     ◐     ◐     ◐  Pan   │ 36 waagrecht ziehen
│  ┃▌    ┃▌    ┃▌    ┃▌    ┃▌    ┃▌    ┃▌    ┃▌       │ 150 Fader + Meter, senkrecht ziehen
│ −3,9  −6,0  0,0  −1,5  0,0  …        dB  ◇ Auto-Trim │ 16
└──────────────────────────────────────────────────────┘
Summe 378 px ≤ 445 px (Blatt 489 − Kopf 44)
```
- **Kanalzüge 44–46 px breit:** P1 8 × 45 + 7 × 2 = 374 px; P2 (375) 8 × 44 + 7 × 1 = 359 px. **M und S untereinander in voller Zugbreite, je 36 px hoch** (L4: dichte Raster ≥ 36×34; halbe Zugbreite wären ≈ 22 px – Stumm statt Solo wäre ein wahrscheinlicher Fehltipp mit hörbarer Folge). Die Fader-Höhe ist dafür 150 statt 170 px. P3 (320 px): ab 7 Zügen Seiten, Umschalter „Züge 1–4 ⇄ 5–8“.
- **SENDS:** je Zug Hall, Echo, Pumpen als Knöpfe; Kopf „HALL ⚙“ / „ECHO ⚙“ öffnet die Bus-Seiten (aus WP4, unverändert).
- **MASTER:** bis V7b die heutige Glue/Limiter-Seite; ab V7b Messwerte, ab V7c der Reiter aus §8.11.
- **Tipp auf den Spurnamen** → Spur-Detail: Hochpass (aus/80/120/150/200 Hz), Pump-Release, Rolle, „Gehaltene Töne bei Akkordwechsel: mitziehen / halten“, [Klang öffnen ›], [Mix zurücksetzen] (0 dB, Mitte, Sends 0, Hochpass aus; ein Undo).
- **Drum-Zug:** Tipp auf KIT klappt den **Kit-Mischer** auf (12 Pad-Fader = Pad-Pegel, Kopf „gehört zum Kit“; derselbe Wert wie im Drum-Editor, ein Undo).
- **Quer (L1):** alle Züge + Master-Zug in einer Reihe; Fader 56×120.
- **Meter:** nur sichtbare Züge, ≤ 30 fps, Werte aus dem Mess-Worklet (ab V7b) bzw. bis dahin `AnalyserNode` je Spur nur bei offenem MIX.
- **Gesten** wie überall (senkrecht = Wert, seitlich weg = fein, Doppeltipp = Standard), kein Lang-Druck.
- **Last-Anzeige:** Summe `perTrack.load` und Begrenzer-Stufe; Tipp → Menü → Info.

### 8.3 Daten und Migration (V7a)

```js
track.mix = { vol /*dB, −60..+6*/, pan, rev, dly, pump, pumpRel, hpf /*0|80|120|150|200*/, mute, solo,
              role /*§8.6*/, roleSrc:'auto'|'user', trim /*dB, Auto-Trim-Vorschlag*/, touched }
sound.fx = { drive, chorus, sendHint: {rev, dly} }        // vol/pan/rev/dly/pump/pumpRel entfallen im Sound
```
- **Migration** (in `normalizeProject`, Format 4): `sound.fx.{vol,pan,rev,dly,pump,pumpRel}` → `track.mix`, `vol_dB = 40·log10(vol)` (Verstärkung = vol²), `touched = true` (nichts springt). `track.mute` → `mix.mute`. Klangzustände gibt es zu diesem Zeitpunkt noch nicht (V7a vor V6a, E3-32), also keine `st.fx`-Migration. Bibliothek: alte Sounds lesen `rev/dly` als `sendHint`.
- **Drive-Ausgleich:** Heute steckt er im Lautstärke-Knoten: `gain = vol²/(1 + 1,5·drive)` (`applyChainFx`, WP6 Z. 7564). Ab V7a sitzt der Ausgleich `1/(1 + 1,5·drive)` als eigener Gain **in der Klang-FX-Kette direkt nach dem Shaper**; der Fader-Knoten ist reines dB. Die Migrationsformel bleibt `40·log10(vol)`; der Gesamtpegel ändert sich dadurch nicht (V7a-02 mit einem Drive-Sound). Bis V7a zeigt U-04 die dB-Zahl als `20·log10(vol²/(1 + 1,5·drive))` (Gesamtwert, den man hört).
- **Drum-Editor nach V7a:** Reiter FX zeigt nur noch die Kit-Effekte (Kit-Raum, Kit-Gate) und den Link „Mischung dieser Spur ↗“; Lautstärke, Pan und Sends der Drum-Spur stehen im MIX.
- **API-Kompatibilität:** `setTrackFx(t, 'vol'|'pan'|'rev'|'dly'|'pump'|'pumpRel', v)` schreibt in `track.mix` (alte Einheit, umgerechnet); `getSound(t).fx` liefert für alte Tests die abgeleiteten Werte zusätzlich (Getter).
- „Bei Wechsel“ (`track.onChange`) bleibt als Datenfeld; nur der Ort im UI wechselt.

### 8.4 Kontext-Master: Grundsatz (V7b–V7d)

```
Master-Plan = f( Analyse(Mix VOR dem Master), Rollen, Ziel, Stil ) ⊕ Korrektur-Schicht
```
- **Analyse** liest den Mixbus **vor** dem Master (`masterSum`) und je Spur. Das Signal nach dem Master dient nur der Kontrolle (LUFS, True Peak, Pumpen). Nie „Master auf Master“.
- **Ein Plan, eine Stufe.** REMASTER ersetzt die Parameter, er stapelt nichts. Der Export nutzt denselben Plan.
- **Korrektur-Schicht:** Xanders Eingriffe sind **Deltas zum Automatik-Wert** (Helligkeit +1 dB, Glue −30 %, Ziel −1 LU, Breite 0) und Wünsche („Lead vorne“, „weniger Hall gesamt“). REMASTER rechnet den Automatik-Teil neu und legt die Deltas wieder darauf.
- **Spur-Entscheidungen gehören der Spur:** „Lead lauter“ wird **Auto-Trim** als Geistmarke am Fader (max. ±6 dB, E5); [Übernehmen] schreibt ihn in den Fader, ✕ verwirft.
- **Nichts springt:** Plan-Wechsel nur am Taktstrich mit 200–500-ms-Rampen. Der Master ändert sich nie heimlich: Ändert sich der Mix deutlich (ΔLUFS > 1 LU, neue Rolle, neue aktive Spur), erscheint „Mix geändert – REMASTER?“. „Plan festhalten“ (`frozen`) ist nach [Übernehmen] Standard.

```js
S.master = { target:'stream'|'dyn'|'club', style:'80er'|'modern'|'dark'|'club',
             plan: { gain, glue:{thr, ratio, att, rel, hpf}, tilt, width, monoHz, lim:{ceil, la}, basis:{…Messwerte} } | null,
             corr: { tilt?, glue?, target?, width?, … }, wishes: [{rule, track, ans, at}], frozen: true, version: 1 }
```

### 8.5 Master-Worklet `sq-master` (V7b)

Ein Prozessor im vorhandenen Worklet-Modul (ASCII-Block), Eingang = Mixbus (Stereo), optional Spur-Eingänge (Mono-Summen) für die Spur-Messung.

| Teil | Verfahren |
|---|---|
| K-Filter | 2 Biquads, Koeffizienten je Abtastrate aus dem Analog-Prototyp (wie libebur128; Code in `v3-ideen/r2/mix-messung.mjs`) |
| Lautheit | Blöcke 400 ms, Schritt 100 ms; momentan, kurzzeitig (3 s), integriert mit Gate −70 LUFS absolut / −10 LU relativ (BS.1770, SE) |
| True Peak | 4× Überabtastung, Polyphasen-FIR ≈ 48 Taps (eK zum Beispielfilter in BS.1770 Anhang 2) |
| Korrelation | ΣLR / √(ΣL²·ΣR²) je 400 ms; Mono-Verlust = LUFS(M) − LUFS(L/R) |
| Bänder je Spur | < 150 Hz, 150 Hz–1 kHz, 1–4 kHz, > 4 kHz |
| Bearbeitung | Glue (RMS-Detektor mit Hochpass 100 Hz, Regeln §8.9), Tilt ±2 dB, M/S-Breite, Bass-Mono < `monoHz`, True-Peak-Limiter mit Vorausschau 1,5–3 ms |

- Nachrichten an die Oberfläche mit 10 Hz, nie je Sample.
- Die Vorausschau erhöht `graphLat`; einmal messen und überall einrechnen (wie heute).
- **Rückfall (E3-19):** **Beide Ketten werden immer gebaut:** `sq-master` und die heutige `FX.Master`-Kette liegen parallel am Mixbus; am Ausgang schalten zwei Gains um (50 ms gleichleistungsgemäß, eigene Blend-Gains, L3). Startet das Worklet nicht, ist von Anfang an `FX.Master` hörbar (kein Ausfall). **Herzschlag:** Das Worklet meldet mit 10 Hz; Zeitlimit **250 ms**, ausgewertet nur, wenn `ctx.state === 'running'` **und** `currentTime` seit der letzten Prüfung gewachsen ist (sonst kein Rückfall: Bildschirm aus, Anruf, Hintergrund, `suspend` am iPhone liefern keine Meldungen). Hängt das Worklet im Betrieb, ist der Ausgang höchstens ≈ 300 ms still, danach blendet die Rückfall-Kette ein; Anzeige „Messung aus“. Die stumme Parallel-Kette kostet einen DynamicsCompressor (vernachlässigbar, eK).
- CPU-Ziel ≤ 1,5 % (Xeon; geschätzt ≪ 1 %, ungemessen).

### 8.6 Rollen: Vorschlag und Rückfrage (V7c)

- **Rollen:** BASS · SEQUENZ/ARP · AKKORD/STAB · FLÄCHE · LEAD/HOOK · ATMO/FX · MELODIE (MELODIE-Spur fest) · GESANG FOLGT (Platzhalter, hält 1–4 kHz frei). Drums: je Pad fest (KICK/SNARE/HATS/PERC), keine Frage.
- **Vorschlag** aus Punkten je Rolle: Kategorie (`sound.cat`), Stimmmodus, Amp-Hüllkurve (A, S, R), Lage (Median der Tonhöhe inkl. Fußlage), Akkordanteil (Anteil gleichzeitiger Anschläge), Dichte (Noten je Schlag), mittlere Notenlänge. Abstand zur zweitbesten Rolle < ⅓ ⇒ **fragen**. Prototyp `r5/h2610/rollen.mjs`: Demo 3 von 4 Synth-Spuren sicher, Pop-Pluck fragt „Sequenz oder Akkorde?“; Widersprüche (Bass-Sound spielt Akkorde) fragen.
- **Rückfrage-Karte** (MASTER-Reiter §8.11, Abzeichen „2“ an [MIX] in der Spurleiste und im Menü; **nie während einer Aufnahme**):
```
Kurz nachgefragt (2)
Synth 2 · FM-Pluck – das ist …   ◉ Sequenz/Arpeggio  ○ Akkorde/Stabs  ○ anderes ▾
Was soll vorne sein?             ◉ Lead  ○ Bass & Groove  ○ Fläche/Stimmung
☐ Später kommt Gesang dazu (hält 1–4 kHz frei)
✓ Synth 1 = Bass · ✓ Synth 3 = Fläche · ✓ Synth 4 = Lead                 [ändern]
```
- Höchstens 3 Fragen je Runde. Eine Antwort gilt, bis sich Kategorie oder Spielweise deutlich ändern (dann einmal neu). Die Rolle speist Mischregeln und Hilfe-Texte (später auch die Folgeart, §18).

### 8.7 Ziele und Stile (V7c)

| Ziel | integriert | True Peak | Limiter-Reduktion max. |
|---|---|---|---|
| **Streaming** (Standard) | −14 LUFS | ≤ −1 dBTP | 2 dB |
| **Dynamisch** | −16 LUFS | ≤ −1 dBTP | 1 dB |
| **Club** | −9 LUFS; lauter nur, wenn der Pump-Wächter grün bleibt | ≤ −1 dBTP | 3 dB |

- Ist das Ziel ohne Pumpen nicht erreichbar, bleibt der Master darunter und sagt es: „Club erreicht −9,8 LUFS. Lauter nur mit mehr Limiter (pumpt).“
- **Stile** (80er · Modern · Dark · Club) setzen nur Startwerte für Glue-Stärke, Tilt (±2 dB), Breite und Mono-Frequenz. **Alle unbelegt, Hörtest nötig.**

### 8.8 REMASTER-Ablauf (V7c)

1. **Hörprobe** (Start über [MASTERN] bzw. [REMASTER], §8.11): Der Knopf startet die Wiedergabe **selbst**: Steht der Transport, spielt ▶ SONG (Kette bzw. Mitschnitt) ab Takt 1, ohne Song die zuletzt gespielte Szene ab Takt 1; läuft er schon, wird ab dem nächsten Taktstrich gemessen (kein Neustart). Das Mess-Worklet sammelt ≥ 8 Takte je gespielter Szene bzw. einen Kettendurchlauf (höchstens 64 Takte). Anzeige: Ring „hört zu 5/8“ und [Abbrechen] (jederzeit; nichts ändert sich). *(P1, prüfen)* **Schnell-Analyse offline:** Kette mit `OfflineAudioContext` und demselben Worklet-Modul rendern (Ladekette wie §11.3), wenn sich der App-Graph offline bauen lässt; sonst Echtzeit. Ergebnis der Prüfung in CHANGES-V7c (unsicher, ob Drums und Effekte offline gleich klingen).
2. **Analyse** vor dem Master und je Spur: Lautheit, True Peak, Korrelation, Mono-Verlust, Bassanteil < 150 Hz, Bandbalance (4 Bänder) gegen das Stilprofil, Kick/Bass-Überlappung, Pump-Risiko.
3. **Rollen prüfen**, nur wo nötig fragen.
4. **Plan rechnen:** Glue mit mittlerer Reduktion ≤ 1,5 dB, Tilt, Breite, Bass-Mono < 120 Hz; Verstärkung so, dass das Ziel mit Limiter-Reduktion ≤ Grenze erreicht wird; Korrektur-Schicht auflegen und begrenzen.
5. **Kontrolle 2 Takte** nach dem Master: LUFS ±0,5 LU vom Ziel, True Peak ≤ Grenze, Pump-Hub ≤ 1,5 dB; sonst bis zu 2 Iterationen oder Klartext-Meldung.
6. **A/B bei gleicher Lautheit** (beide auf gleiche LUFS normiert), Umschalten am Taktstrich, 50 ms Überblendung.
7. **[Übernehmen] / [Verwerfen]**: ein Undo-Schritt „Master: Remaster 14:32“. Profi-Regler ändern nur die Korrektur-Schicht. Der Plan ist deterministisch (gleiche Eingabe ⇒ gleicher Plan).

### 8.9 Anti-Pumpen (V7b-Regeln, V7d-Wächter)

Messung `r5/h2610/pump.mjs` (Demo, 8 s Mixbus vor dem Master; Kompressor-Modell offline, Schwelle je Variante auf gleiche mittlere Reduktion angepasst; Hub = Mittel über Schlagfenster von max − min der Reduktion):

| Variante | Ø Reduktion | Hub/Schlag |
|---|---|---|
| A wie heute (Spitze, 20/200 ms, −16 dB, 2:1) | 2,19 dB | 2,82 dB |
| C RMS + Hochpass 100 Hz im Detektor | 2,19 | 3,13 |
| E C + Attack 30 ms + Release 600 ms | 2,19 | 1,72 (−39 %) |
| H E mit 1 dB Ø Reduktion | 1,00 | **1,04 (−63 %)** |

Grenzen: Modell ≠ Chromiums DynamicsCompressor; ein Muster; Fenster nicht auf die Zählzeit ausgerichtet. Der Hochpass allein half hier kaum (Annahme: Pluck/Snare/Hats sind selbst rhythmisch).

**Regeln (Startwerte):**
1. Glue sanft: Ø Reduktion ≤ 1,5 dB, Spitze ≤ 3 dB, Ratio ≤ 2:1.
2. Attack ≥ 30 ms, Release ≥ 1 Schlag (120 BPM ≈ 500–600 ms).
3. Detektor RMS mit Hochpass 100 Hz.
4. Lautheit kommt vom Limiter, nicht vom Glue.
5. **Pump-Wächter** (V7d): misst den Hub nach dem Master laufend; > 1,5 dB ⇒ erst Release verlängern, dann Glue senken, dann Ziel senken; jeder Schritt im Klartext als Karte. Gewolltes Spur-Pumpen zählt nicht (entsteht vor dem Master).

### 8.10 Vorschlags-Karten und Auto-Trim (V7d)

| Karte | Regel (Startwert, unbelegt) | Text | Wirkt auf |
|---|---|---|---|
| **MK1** | Lead im Band 1–4 kHz während seiner Noten > 3 dB unter Fläche/Akkord | „Lead geht unter.“ [Lead +2 dB] [Fläche −2 dB] | Auto-Trim / Spur |
| **MK2** | Kick + Bass gleichzeitig < 120 Hz, Spitzen treffen den Limiter | „Kick und Bass prallen zusammen.“ [Bass pumpt zur Kick 30 %] | Spur-Pumpen |
| **MK3** | Fläche/Sequenz > 25 % Energie < 150 Hz | „Fläche frisst Tiefe.“ [Hochpass 150 Hz] | Spur-Hochpass |
| **MK4** | Korrelation < 0,3 oder Mono-Verlust > 1,5 dB | „In Mono wird's dünn.“ [Chorus BREIT → ENS] | Klang (Quelle) |
| **MK5** | Hall-Rückweg weniger als 12 LU unter dem trockenen Mix | „Viel Hall gesamt.“ [Hall-Rückweg −3 dB] | Bus |
| **MK6** | Ziel nur mit Pumpen erreichbar | „Club bräuchte 5 dB Limiter.“ [−10 LUFS ist ok] | Korrektur-Schicht |
| **MK7** | Snare/Clap > 8 dB unter der Kick (Stilprofil) | „Snare tritt kaum hervor.“ [Snare +2 dB] | Pad-Pegel / Spur |

- Höchstens 3 Karten gleichzeitig; jede mit [Ja] [Nein] [Anhören] („Anhören“ = 4 Takte A/B bei gleicher Lautheit). „Nein“ wird gemerkt, bis sich die Spur deutlich ändert.
- Vorrang Quelle vor EQ (E5): MK4/MK3 vor jedem EQ. Ein dynamischer EQ ist nicht in v3 (§18).

### 8.11 MASTER-Reiter (Oberfläche, V7c; Karten V7d)

```
P1 · MIX › MASTER (Körper 377 px = 445 − Master-Kopf 32 − Reiter 36)
│ Ziel [Streaming✓│Dynamisch│Club]          Stil [80er ▾]    │ 40
│ ┌──────────────────────────────────────────────────────┐   │
│ │                 [  MASTERN  ]                        │   │ 56  großer Knopf; nach dem ersten Plan [REMASTER]
│ └──────────────────────────────────────────────────────┘   │
│ hört zu ◔ 5/8 Takte · Szene 1 · [Abbrechen]                │ 28  Statuszeile: während der Hörprobe dies,
│                                                            │     danach „Plan 14:32 · −14,1 LUFS · TP −1,1 · Glue 1,2 dB“
│ [A│B]  [Übernehmen]  [Verwerfen]                            │ 44  A/B bei gleicher Lautheit
│ ┌ Karten ‹ 1/3 › ─────────────────────────────────────┐   │ 160 Rückfrage-Karte (§8.6) vor Vorschlags-Karten
│ │ Kurz nachgefragt: Synth 2 ist … ◉ Sequenz ○ Akkorde │   │     (§8.10, V7d); was nicht passt, über ‹ ›
│ └─────────────────────────────────────────────────────┘   │
│ [Profi ▾]  Glue · Helligkeit · Breite · Master-Ausgang      │ 36  eingeklappt; Werte gehen in die Korrektur-Schicht
Summe 364 px
```
- **Erster Ablauf:** Ziel und Stil haben Standardwerte (Streaming, 80er); ein Tipp auf **[MASTERN]** reicht. Danach heißt der Knopf **[REMASTER]**; der Hinweis „Mix geändert – REMASTER?“ (§8.4) zeigt auf ihn.
- Die Rückfrage-Karte erscheint nur, wenn Fragen offen sind, und nie während einer Aufnahme. Antworten fließen sofort in den laufenden Plan.
- A/B, [Übernehmen]/[Verwerfen] sind aktiv, sobald ein neuer Plan vorliegt; vorher grau mit Grund „erst MASTERN“ (L2).
- **[Profi ▾]** klappt die Regler auf (L1: Tiefe optional); jeder Profi-Regler ändert nur die Korrektur-Schicht und wirkt ab dem nächsten Taktstrich mit Rampe.
- L1: zwei Spalten (links Ziel/Stil/Knopf/Plan-Zeile, rechts Rückfrage- bzw. Vorschlags-Karten), Profi als eigener Unter-Reiter.
- Bis V7b zeigt der Reiter die heutige Glue/Limiter-Seite (§8.2).

---

## 9. FM-Feld (Kodamo-Prinzip, bis 8 Operatoren)

Quellen: Master-Briefing Teil 10 (Kodamo-Analyse, Konzept, Messungen `v3-ideen/r4/g5/`), Vision E2, §v2-6 (FM6). Kodamo EssenceFM (SE): 6 Operatoren je Stimme, Algorithmus per Drag & Drop, Bewegen entfernt die unteren Verbindungen, Loslassen auf Verbundenem tauscht die Plätze, nur 1 Feedback je Algorithmus. **Unser Unterschied:** Die Wirkung einer Geste hängt **nur vom Ablageort** ab, das Ergebnis ist vor dem Loslassen sichtbar (und hörbar), Bewegen löscht nie Verbindungen, Feedback an jedem Operator, bis 8 Operatoren.

### 9.1 Grenzen und Leitsätze

- Höchstens **8 Operatoren**; Stimmen = `min(poly, ⌊48 / Operatoren⌋, Kanten > 12 ? 4 : 8)` → bis 6 Op 8 Stimmen, 7–8 Op 6 Stimmen, mit mehr als 12 Kanten 4 Stimmen. Höchstens **16 Kanten** inklusive Feedback (E2). Kopf zeigt „7 Op · 6 St · Kanten 9/16“ bzw. „4 St (Kanten > 12)“. Grund (gemessen, Xeon): FM8 volle Matrix 1,81–2,48 % je Stimme ⇒ 6 Stimmen 10,9–14,9 % je Spur, über dem Ziel 12 %; mit 4 Stimmen ≤ 9,9 %. Am iPhone (Faktor 2–2,5, unbelegt) wären es sonst 27–37 % je Spur.
- Mehr Operatoren nur über spätere Super-Synth-Schichten (§18).
- Leitsätze: (1) Wirkung nur vom Ort; (2) Vorschau vor dem Loslassen; (3) Bewegen ändert nie Verbindungen, das Layout ordnet sich selbst.

### 9.2 Daten (E3-20)

```js
Sound.engine = 'fm6'                    // bleibt
p.fm6 = {alg, fb, ops[6], trans, …}     // WP7, kanonisch, solange der Graph DX-tauglich ist
p.fmx = {                               // neu, optional; vorhanden ⇒ Worklet nutzt den Graph-Renderer
  ops: [{ id:'A'…'H', on, fixed, coarse, fine, det, ol, r:[4], l:[4], vs, rs, ks, wave:'sin', fbAmt:0..7 }],   // ≤ 8, DX-Felder
  edges: [{ from, to, amt:0..1 }],      // Modulator → Ziel; amt skaliert den Modulator-Pegel auf dieser Kante
  out: ['A','C','E'],                   // Ausgangs-Operatoren (Schiene)
  park: ['G'],                          // Parkplatz (aus, Werte bleiben)
  groups?: […], layout?: {}             // Gruppen ab F5 (§18)
}
```
- `fm6` → `fmx` ist verlustfrei (`fmxFromFm6`). Nach jeder FELD-Geste prüft `dxMatch(fmx)` (720 Nummerierungen, gemessen 24,5 ms im Nicht-Treffer-Fall): **DX-tauglich** ⇒ `p.fm6` wird mitgeschrieben (Badge „DX 5 ✓“); sonst bleibt `p.fm6` der zuletzt DX-taugliche Stand mit `approx:true` für den nativen Rückfall, Badge „kein DX-Alg. · nächster: 3“.
- **DX-tauglich** = ≤ 6 aktive Op, ≤ 1 Feedback, Tiefe nur über Modulator-Pegel (alle `amt = 1`), Sinus, DX-Hüllkurve ohne Schleife, Verhältnis im DX-Raster.

### 9.3 Worklet: Graph-Renderer (V4a)

- Im vorhandenen FM-Block: Operatoren in **topologischer Reihenfolge** rendern; Kanten summieren die Modulator-Ausgänge (× `amt`) als Phasen-Modulation des Ziels.
- **Feedback:** Selbst-Feedback wie DX (2-Sample-Mittelung, msfa); Kreuz-Feedback (Kante gegen die Reihenfolge) nimmt den Ausgang des Vorgänger-Samples (1 Sample Verzögerung).
- Ausgänge: Summe der Schienen-Operatoren × `0,5/√nOut` (wie WP7).
- Hüllkurven, Skalierung, Anschlag, Makros, Filter-Bypass, Amp-Modi, Mod-Ziele (`fmbright`, `op1…op6` → neu `opA…opH` mit Alias `op1…op6` auf A…F): wie WP7.
- **Gleichheit:** `fmx` aus jedem der 32 DX-Algorithmen klingt wie `fm6` (Abnahme V4a-02).
- **Nativer Rückfall:** `DXN` mit `p.fm6` (bei `approx` der nächste DX-Algorithmus); Hinweis im Kopf „ECO: angenähert (nächster DX-Alg. 3)“.
- CPU (gemessen, Rechenkern): FM6 0,86–1,31 %, FM8 frei mit wenigen Kanten 0,67–0,99 %, FM8 volle Matrix 1,81–2,48 % je Stimme. Die Kosten treibt die Kantenzahl.

### 9.4 FELD-Ansicht (V4b)

FM-Reiter-Unterseiten: **FELD · OP n · MAKRO · STIMME** (ALGO wird [Vorlagen ▾] im FELD-Kopf und öffnet das WP7-Algorithmus-Blatt mit 32 Bildern; Wahl ersetzt den Graph, ein Undo).

```
P · FM / FELD  (Körper 305 px)
┌────────────────────────────────────────────┐
│ FELD│OP│MAKRO│STIMME  DX 5 ✓ 6 Op·8 St ↶ ↷ [A|B]│ 28  Kopf: DX-Abgleich, Budget, Undo, Vorher/Nachher
│ ∿∿∿  ▁▅▇▆▃▂▁   „hell · alle Teiltöne“    ▶ │ 28  Vorhersage: Welle, 16 Spektralbalken, Etikett, Vorhören
│ [+]                                  P:○ ○ │      + = neuer Operator (ziehen) · Parkplatz
│   ╭──╮●         ╭──╮●         ╭──╮●↺       │      ● = Anfasser (Zusatz-Verbindung / Feedback)
│   │B │×14       │D │×1        │F │×1       │ Ebene 1 (Modulatoren), Ring = Index
│   ╰┬─╯I 3,1     ╰┬─╯I 1,6     ╰┬─╯I 0,8    │
│    ┃             ┃             │            │ Linienstärke = Tiefe
│   ╭┸─╮          ╭┸─╮          ╭┴─╮          │
│ ══│A │══════════│C │══════════│E │══ AUSG. │ Schiene = Ausgang (Ebene 0)
│   ╰──╯×1 ⌒      ╰──╯×1 ⌒      ╰──╯×1 ⌒     │ ⌒ Hüllkurven-Miniatur
│ OP B ×14 ‹›  Pegel ▭▭▭▭▬──  Welle ∿  Hüllk.│ 44  Kontextzeile (nichts gewählt: [Vorlagen ▾] [Raster] [Ich will …])
└────────────────────────────────────────────┘
Feld 205 px = 4 Ebenen à 44 px + Lücken (alle 32 DX-Algorithmen: Tiefe ≤ 4, Breite ≤ 6, gemessen).
Mehr als 6 Kacheln in einer Ebene → zwei versetzte Halbreihen; Tiefe > 4 → Kette knickt in die nächste Spalte.
```
- **Kachel** 52×44 px: Buchstabe A–H (die DX-Nummer steht klein darunter, solange DX-tauglich), Verhältnis („×14“, „324 Hz“), Ring = Index (Modulator) bzw. dB (Ausgang), Hüllkurven-Miniatur.
- **L (Körper ≈ 140 px):** Feld links (≈ 520 px breit, Ebenenhöhe 30 px), Vorhersage und Kontextzeile rechts in einer Spalte.

**Beim Ziehen** (Magnet-Zonen ≈ 96×96 px um jede Kachel, 8 px Hysterese, `haptic('tick')` beim Zonenwechsel):
```
              ┌── OBEN: X moduliert Y ──┐
   NEBEN ◀─── │  MITTE: Plätze tauschen │ ───▶ NEBEN (gleiche Ziele wie Y)
              └── UNTEN: Y moduliert X ─┘
LCD: „G → C · ×2 auf ×1 · nur ungerade, heller“ + Geist-Linie + Vorhersage live (30 Hz)
Leerraum = zurückschnappen · Schiene = Ausgang · Parkplatz = aus
Schleife (Ziel moduliert schon X) → orange Feedback-Kante (1 Sample)
```

**Gesten**

| Geste | Wirkung |
|---|---|
| Kachel tippen | wählen; Kontextzeile und OP-Seite folgen |
| Kachel ziehen, über einer Zone loslassen | OBEN = moduliert; UNTEN = wird moduliert; NEBEN = parallel (gleiche Ziele); MITTE = Plätze tauschen (Verbindungen tauschen mit) |
| Kachel in den Leerraum | schnappt zurück, nichts ändert sich |
| Kachel auf die Schiene | zusätzlicher Ausgang |
| Kachel auf den Parkplatz | aus, Werte und Kanten bleiben gemerkt |
| [+] ins Feld ziehen | neuer Operator direkt in eine Zone (ab 8 gesperrt, Hinweis „max. 8“) |
| Anfasser ● auf eine Kachel ziehen | Zusatz-Verbindung (Fan-out); auf sich selbst = Feedback; nach oben = Kreuz-Feedback |
| Zwei Finger auf zwei Kacheln | obere moduliert untere (EssenceFM-kompatibel); nur wenn **beide** Berührungen innerhalb von 300 ms auf Kacheln beginnen |
| Linie tippen | Mini-Schieber Tiefe + [Lösen]; quer über die Linie wischen = lösen |
| Kachel halten und **ohne Bewegung** loslassen (≥ 450 ms, ≤ 8 px) | Mod-Picker für `opX`. Der Picker öffnet erst beim Loslassen; jede Bewegung > 8 px davor ist Ziehen (viele drücken, warten kurz und ziehen dann: iOS-Gewohnheit „anheben“). Alternativ immer über die Kontextzeile [⊕ Mod] |
| Raster-Leiste gleiten | Verhältnis hörbar durchfahren; loslassen = setzen |
| Wischen im Leerraum | **nichts** (gegen Fehlbedienung) |
| ↶ ↷ / [A│B] | Undo; Vergleich mit dem Stand vor der letzten Geste |

- Jede Geste = ein Undo-Schritt. Kanten > 16 oder ein 9. Operator werden abgewiesen (Geist rot, LCD-Grund).
- Strukturänderungen bei klingenden Stimmen gehen über die **Stimmen-Überblendung 30 ms** aus V4a (L3), nicht über die WP4-Blende (≈ 4 ms Loch); Prüfung M-KLICK **und** M-EINBRUCH.
- **Leerraum und Fein-Modus:** Der Feld-Leerraum ist **keine** Ruhefläche (`.rest`) im Sinne von §v2-10 (dort bedeutet ein ruhender zweiter Finger „Fein-Modus“); im Feld gibt es keinen Fein-Modus. Die Kontextzeile (Pegel-Regler) ist `.rest` wie überall. Registrierung im Gesten-Register `GEST`/`RESTPTR` (WP6 Z. 11062).

### 9.5 Vorhersage und Raster (V4c)

- **Vorhersage:** 1 Periode + 16 Spektralbalken + Etikett, neu bei jedem Zonenwechsel (≤ 30 Hz). Gemessen 1,35 ms (DX-Alg. 5), 2,1 ms (8 Op frei mit Kreuz-Feedback), 2,9 ms (8 Op volle Matrix) je Vorschau auf der Xeon (`r4/g5/vorhersage-bench.out`); Ziel am iPhone ≤ 8 ms (geschätzt 3–7 ms, Annahme). ▶ spielt die vorhergesagte Struktur kurz an (Transport steht).
- **Verhältnis-Raster** (Tipp auf ×-Wert):
```
RASTER  B → A (×1)                           Fein ◁ ▷ (Magnete auf ganzen/halben Werten)
    ½    1    2    3    4    5    6    7  …  14   1,41
    █▼   █    ▓    ▒    ▓    ▒    ░    ░      ░    ◇
█ alle Teiltöne  ▓ nur ungerade  ▒ lückig  ░ dünn  ◇ Glocke  ▼ klingt tiefer
```
  Regel (geprüft, FFT-Gegenprobe 15/15): Linien bei |C + kM|; mit a = 2C, b = 2M, g = ggT(a, b) ist der Grundton g/2; Teilton n vorhanden genau dann, wenn n ≡ ±a′ (mod b′).
- **Helligkeit am Ring:** Index I mit „≈ I+1 Seitenband-Paare“ (Carson); gemessen bei 1:1: I 1 → 4, I 2 → 6, I 4 → 8, I 8 → 13 Linien über −40 dB.

### 9.6 DX-Brücke (V4c)

- **Import** .syx (WP7) → `fm6`; das Feld zeigt den Graph automatisch angeordnet (alle 32 passen, gemessen).
- **Abgleich** `dxMatch` über alle 720 Nummerierungen: 32/32 erkannt (gemessen); kein Treffer ⇒ „nächster DX-Algorithmus + Unterschied“ (beim Loslassen, ≈ 24 ms).
- **[DX-tauglich machen]** (Kontextzeile ⋯): zeigt die nötigen Änderungen als Liste (z. B. „Kreuz-Feedback C→E entfernen“, „Op G parken“), ein Undo.
- **.syx-Export:** Menü → Sounds → [DX7-Bank exportieren (.syx)]: bis 32 eigene DX-taugliche FM-Sounds als 32-Stimmen-Bank (4096 Byte + Kopf/Prüfsumme, Format wie Import); nicht taugliche werden übersprungen (Toast nennt sie). Auslieferung über `deliverNow` mit `kind:'syx'` (im Viewer als .zip; dafür muss `deliverNow` `syx` ins ZIP packen, §5.3 – heute landete es als `.json`). Rundlauf Export → Import = gleiche Parameter (V4c-05).
- Werks-FM-Sounds bleiben `fm6` (FM1/FM2 aus WP7 bleiben gültig).

---

## 10. Tabellen-Oszillator und Bitmask

Quellen: Master-Briefing Teil 9.3 (N5), Teil 10.2 (Mask1), Phase C Paket 4; Vision 1.4, E7, Teil 4 (I1, I2). Kodamo Mask1 (SE): „A sine wave is split into different sections that are repeated, scaled, inverted or silenced, to build a new waveform … by inputting a single number“; 2 Bitmask-Oszillatoren + Rauschen, Masken- und Tonhöhen-Delta-Hüllkurven; Kritik: nur 2 Regler + kleine Ziffernanzeige.

### 10.1 Tabellen-Oszillator im Worklet (V8a)

- Neuer Oszillator-Typ im Synth-Worklet (`eng 2` = Tabelle; wird von Bitmask, Tabellen-Additiv und später WT/PD genutzt).
- **Tabelle** = eine Periode, bandbegrenzt als **Mip-Kette** je Oktave (Größen 2048, 2048, 1024, 1024, 512, 512, 256, 256, 128, 128, 64 für 11 Oktavstufen; Teiltöne ≤ Nyquist der Stufe), per FFT aus dem Spektrum gebaut. 8000 Werte × 4 Byte ≈ **32 KB je Tabelle** (Float32).
- Lesen: linear interpoliert, Stufenwahl nach Grundfrequenz, **Überblendung** zwischen zwei Nachbar-Tabellen (Position mit Nachkommastelle) und zwischen Mip-Stufen (über die oberste halbe Oktave).
- **Bau** auf dem Hauptthread in Scheiben ≤ 8 ms (`tickAhead(.3)` vorher). Gemessen 4–11 ms je Masken-Tabelle (Node, Xeon; am iPhone geschätzt das 2–2,5-Fache, unbelegt).
- **Gemeinsamer Pool-Cache (Masken-Pool):** Die 256 Pool-Tabellen werden **einmal** gebaut, verzögert beim ersten Bitmask-Einsatz, in `idle`-Scheiben, ab der aktuellen Masken-Position nach außen (≈ 256 × 32 KB ≈ 8 MB, für die Sitzung behalten). Abgelegt werden sie **im `AudioWorkletGlobalScope`**: Alle Prozessoren eines AudioContext teilen einen globalen Bereich (W3C Web Audio, eK, **beim Bau prüfen**), also wird jede Tabelle einmal übertragen und von allen Spuren gelesen. Falls sich das nicht bestätigt: je Knoten **kopieren** statt übertragen (ein übertragenes Array gehört danach nur einem Knoten). Ziel: Pool fertig ≤ 3 s (Xeon).
- **LRU je Sound** (höchstens 64 Tabellen ≈ 2 MB) nur noch für eigene Masken (`ovr`), UNTERTON-Tabellen (P Perioden je Tabelle, also P-fach größer) und Additiv-Spektren.
- Die **Pool-Reihenfolge** (Sortierung nach spektralem Schwerpunkt) wird beim Bau der App offline berechnet und als Permutation (256 Bytes) eingebettet; beim Start wird nichts sortiert (Startzeit §15.3).
- Bis eine Tabelle da ist, nutzt der Oszillator die nächste gebaute Nachbarin (kein Aussetzer, L3). Ein DELTA-Sweep über 128 Masken braucht bis zu 129 Tabellen; vor dem Aufwärmen klingt er deshalb stufig („Nachbarin“), danach glatt.
- Aliasing-Ziel ≤ −60 dB (gemessen −61 bis −102 dB bei 0,20–0,36 % CPU je Stimme, E7).
- **Nativer Rückfall:** `PeriodicWave` aus den ersten 64 Teiltönen der Tabelle an der Startposition; Position und Delta wirken nur beim Anschlag (Hinweis „ECO: Maske fest“).

### 10.2 Bitmask-Engine (V8a Klang, V8b Oberfläche)

**Maske:** 32 Segmente einer Sinus-Periode; Zustand je Segment **N** normal · **I** invertiert · **S** stumm · **R** rückwärts.

**Masken-Pool:** 256 Werks-Masken, deterministisch erzeugt (Erzeugungsregel im Code dokumentiert), **nach spektralem Schwerpunkt aufsteigend sortiert**, damit Delta wie ein Filterlauf klingt:
- `POOL[0]` = Sinus (alles N).
- Rangkorrelation Schwerpunkt ↔ Index (Spearman) ≥ 0,95.
- Benachbarte Masken: Schwerpunkt-Verhältnis ≤ 1,25.

**Oszillatoren:** 2 Bitmask-Oszillatoren + Rauschen (wie Mask1), danach das gemeinsame Filter, Hüllkurven, LFOs und Modulation des Synth-Kerns.

| Parameter (je Osz.) | Bereich | Wirkung |
|---|---|---|
| MASKE | 0–255, stetig | Position im Pool; Nachkommastelle = Überblendung der Nachbarn |
| DELTA | −128 … +128 | Tiefe der **Masken-Hüllkurve** (Mask1-Prinzip: fährt die Masken-Nummer, E3-21) |
| M-Hk. | A, D, S, R | eigene Hüllkurve je Osz. für DELTA (geglättet, kein Knacken bei schnellen Zeiten: Mindest-Rampe 2 ms) |
| HT / FEIN | ±24 HT / ±50 ct | Stimmung |
| ANTEIL | 0–1 | Mischanteil |
| UNTERTON | P 1–8 | Perioden-Muster (N5, s. u.) |

- Mod-Ziele neu: `mask1`, `mask2`, `delta1`, `delta2` (Masken-Position bzw. Delta-Tiefe). Locks (§7.6) dürfen die Masken-Position setzen.
- **Eigene Masken:** Wer in der 32-Feld-Reihe ein Feld ändert, erzeugt eine eigene Maske an der **aktuellen ganzzahligen Position** – nur für diesen Sound (`p.mask.oN.ovr[idx] = Maske`, höchstens 8 je Osz.). Delta fährt durch sie hindurch. Die Nummer zeigt ✎.
- **UNTERTON (N5):** Die Maske wechselt von Periode zu Periode nach einem Muster der Länge P (A = Maske, B = Maske invertiert oder wählbare Maske, – = stumm); die Tabelle umfasst P Perioden, die wahre Periode ist P·T₀ ⇒ stimmbare Untertöne f₀/P. Grenze f₀/P ≥ 30 Hz (darunter wird P automatisch verkleinert). Gemessen (f₀ 110 Hz): P = 2 „2. Hälfte invertiert“ 63 % Untertonleistung, f₀/2 so laut wie der stärkste Ton; P = 3 44 %; Euklid E(3,8) 53 %, „rau knurrend“; Aliasing −83 bis −93 dB; Bau 4–11 ms.
- **Euklid-Maske (I1):** Werkzeug [Euklid k/S]: k von S Segmenten invertiert, Drehung r (nutzt `DrumSeq.euclid`). Gemessen (S 16): Schwerpunkt bei k = 0/1/2/3/5/8 → Oberton 1,0/1,2/1,4/4,8/8,0/11,4; Drehung färbt nur leicht.
- **Welle malen → Bits (I2):** Auf der Oszilloskop-Fläche eine Wunschwelle malen; die App sucht je Segment die beste Operation und schreibt eine eigene Maske. Gemessen Restfehler Säge −21 dB, Rechteck −41 dB (S 32), 13 ms je Suche.

### 10.3 Oberfläche (V8b)

```
P · BITMASK (Körper 305 px)
│ OSZ 1 │ OSZ 2 │ RAUSCHEN │ M-HK.                    ↶ ↷        │ 32 Unter-Reiter
│ ∿▁▇▃∿   Masken-Nr. ‹ 117 › ✎     Nachbarn [116][117][118]       │ 44 Oszilloskop + Nummer + Nachbar-Miniaturen
│ [1–16│17–32]  ▕N▕N▕I▕I▕S▕N▕R▕N▕                                 │ 72 Hälfte wählen; 2 Reihen à 8 Felder,
│               ▕N▕I▕S▕N▕N▕R▕N▕I▕                                 │    je ≥ 40×34 px (P1/P2), 4 px Abstand
│ DELTA ━━━━━●━━━ +40   ──▶ Delta-Pfeil über der Nummernleiste  │ 36
│ MASKE ◯   DELTA ◯   ANTEIL ◯   UNTERTON ◯                    │ 84 Knöpfe (56 px)
│ [Euklid…] [Welle malen] [Perioden: A B – A]                   │ 36
Summe 32 + 44 + 72 + 36 + 84 + 36 = 304 ≤ 305 px
```
- **Felder (L4):** Die 32 Segmente stehen in zwei **Hälften** [1–16│17–32]; je Hälfte 2 Reihen à 8 Felder. P1/P2: 8 × 40 + 7 × 4 = 348 px ≤ 358 px nutzbar, Felder 40×34; P3: 34×34 (Ausnahme nach §0.4 „P3 darf vereinfachen“; die Zieh-Geste mildert Fehltipps). Eine Reihe mit 16 bzw. 32 Feldern à 20–21 px (Erstfassung) lag deutlich unter L4 (dichte Raster ≥ 36×34). Der Vorschlag 44×30 px aus dem Review verfehlt L4 in der Höhe und wird deshalb 40×34.
- **Gesten:** Tipp = nächster Zustand N → I → S → R → N. **Ziehen** über die Felder: das erste Feld wechselt wie beim Tipp, jedes überstrichene Feld bekommt **denselben** neuen Zustand; ein Undo je Geste. Die Hälfte wechselt nie unter dem Finger.
- Das **Punkt-Raster** (Nummernleiste 0–255 mit Schwerpunkt-Farbe) zeigt die Position, den Delta-Weg als Pfeil und den Live-Punkt während einer Note.
- L: 16 Felder einer Hälfte in einer Reihe à ≥ 36×34 px plus Hälften-Umschalter, Knöpfe rechts.
- Jede Feld-Änderung = ein Undo; hörbar ab der nächsten Note bzw. am nächsten Block bei gehaltenen Noten (Tabellen-Überblendung 20 ms, L3).

### 10.4 Daten

```js
Sound.engine = 'mask'
p.mask = { o1:{pos:0, delta:0, semi:0, fine:0, lvl:1, sub:{P:1, pat:'A'}, env:{a,d,s,r}, ovr:{} },
           o2:{…, lvl:0}, noise:{lvl:0, col:0} }       // + gemeinsamer VA-Kern: Filter, Amp, LFOs, mods, fx
```
- Werks-Sounds: INIT Bitmask + 4 Startklänge (Anhang A.3). Kategorie „Bitmask“ im Browser.
- CPU: 0,20–0,36 % je Stimme und Osz. (gemessen, Rechenkern, Xeon).

---

## 11. Additiv: Tabellen-Additiv, KLANGKÖRPER, Teiltöne einfangen

Quellen: R5-H8 (Teil 5; Messdateien `v3-ideen/r5/h7810/additiv-bench.mjs` und `.out`, die Zahlen in §11.2 stimmen mit `.out` überein), Master-Briefing Phase C Paket 5, Vision 3.5 (Resynthese), E8. Ziel Xanders: Klavier, Löwe, Saxofon, sphärisch, böse, sprechend.

**Realistische Erwartung (Einschätzung, Hörtest nötig):** Klavier im Mix glaubwürdig, solo nicht auf Sample-Niveau, kein Pedal-Mitklingen · Saxofon als gutes Synth-Sax (Ausdruck begrenzt) · Löwe nur als „Monster-Brüllen“ (echt erst mit Sample-Import, §18) · sphärisch, böse, sprechend: gut.

### 11.1 Tabellen-Additiv (V9a)

- Engine `add` auf dem Tabellen-Oszillator (§10.1): **32 Oberton-Balken** (Pegel je Harmonische) erzeugen die Tabelle. Billig (≈ 0,09 % je Stimme, gemessen).
- **Spektrum A** (Anschlag) → **Spektrum B** (Ausklang) mit Morph-Zeit (10 ms – 10 s, Kurve exp); Zwischenstände über Tabellen-Überblendung (8 Zwischentabellen).
- **XY-Feld** mischt 4 Spektren (Ecken A, B, C, D; Vektor-Prinzip); X/Y sind Mod-Ziele.
- **Zugriegel-Ansicht** (9 Zugriegel 16′ 5⅓′ 8′ 4′ 2⅔′ 2′ 1⅗′ 1⅓′ 1′; Orgel) als zweite Darstellung derselben Balken.
- **Makros:** HELLIGKEIT (Neigung dB/Okt), UNGERADE ↔ GERADE, FORMANT (1–3 Hügel in Hz; die Tabelle wird je Oktavstufe mit der Mittenfrequenz der Stufe gewichtet ⇒ Formant bleibt grob ortsfest, Genauigkeit ±½ Oktave), ZEIT (A → B).
- Balken malen: Finger über die Balken ziehen setzt Pegel; [Alle │ Ungerade │ Gerade] als Filter; [Welle zeichnen → Spektrum] (DFT der gemalten Periode).
- Grenze: keine Streckung (unharmonische Teiltöne gehen mit einer Periodentabelle nicht) → KLANGKÖRPER.

### 11.2 KLANGKÖRPER: Teiltonbank (V9b)

Eigene Engine `body` im selben Worklet:
- bis **48 Sinus-Teiltöne** (Profi 64) mit **freiem Verhältnis**;
- **Streckung** `fₙ = n·f₀·√(1 + B·n²)` (Klavier-Inharmonizität, eK), B 0–0,001;
- **Hüllkurve je Teilton:** Attack + zweistufiges Abklingen (T1, T2, Knick-Pegel); hohe Teiltöne klingen schneller ab: `Tₙ = T·n^(−α)`, α 0–1;
- **Schwebung:** 1–3 „Saiten“ je Teilton, verstimmt ±0–3 ct;
- **Rauschteil:** 3 Formant-Bandpässe (Hz, Q, Pegel) mit eigener Hüllkurve (Hammer, Atem, Fauchen);
- **Formant-Hügel in Hz** gewichten die Teiltöne **je Note** (kein Micky-Maus-Effekt beim Transponieren);
- **Rauheit:** Jitter/AM 20–80 Hz je Teilton (Growl, Brüllen);
- **Subharmonische** f₀/2, f₀/3 (Pegel);
- **Anschlag → Spektrum-Neigung** (dB/Okt je Anschlag).
- **Abschalten** leiser Teiltöne (< −80 dB) spart Rechenzeit (gemessen: 64 Teiltöne Klavier 4 s, im Mittel 0,36 % statt 1,06 %).
- **CPU je Stimme (gemessen, `r5/h7810/additiv-bench.out`, Node, 48 kHz, ohne Worklet-Overhead):** 24 TT 0,42 % · 32 TT 0,63 % · 48 TT 0,68 % · 64 TT 1,06 % · Rauschen + 3 Formanten 0,27 % · 32 TT + Atem 0,76 %. **Begrenzer:** Stufe 1 halbiert zuerst die Teiltonzahl (48 → 24), erst dann Stimmen (§15.2).

**Bedienung (vorne einfach)**
```
P · KLANGKÖRPER
│ Vorlage [Klavier ▾]                                       ↶ ↷ │ 36
│ HELLIGKEIT ◯   KÖRPER ◯   ATEM ◯   ZEIT ◯                     │ 92  4 Makros in echten Einheiten
│ ┌──────── Vokal/Morph XY ────────┐                            │ 140 XY: Formant-Lage (F1/F2) bzw. Morph
│ │            ●                   │                            │
│ └────────────────────────────────┘                            │
│ [TIEFE: Teiltöne │ Formanten │ Saiten/Streckung │ Rauschen]    │ 36
```
- Makros: HELLIGKEIT (Neigung −12…+6 dB/Okt), KÖRPER (Formant-Lage 200–3000 Hz), ATEM (Rauschteil 0 – +12 dB relativ), ZEIT (Abklingzeiten ×¼ … ×4). Jeder Makro erfüllt H-1.
- **TIEFE › Teiltöne:** Teilton-Landschaft (Balkenhöhe = Startpegel, Farbe = Abklingzeit), mit dem Finger malen. **Formanten:** Hügel auf einer Hz-Skala ziehen. **Saiten/Streckung:** B, Schwebung, Saitenzahl. **Rauschen:** 3 Bänder.
- **Vorlagen (6):** Klavier (Streckung, 2-stufiges Abklingen, 2–3 Saiten, Hammer-Rauschen 5–20 ms, Anschlag → Helligkeit) · Saxofon (harmonisch, feste Formanten, Atem, Growl, Lautstärke → Helligkeit, verzögertes Vibrato) · Sphäre (langsame Verstimmung je Teilton, zeitversetzte Teiltongruppen) · Böse (ungerade, Streckung, Subharmonische, Rauheit) · Sprechend (Formant-Hügel per LFO/XY zwischen Vokalen; Vokal-Werte in Hz **unsicher**) · Brüllen (Rauschteil + Rauheit + Subharmonische + Tonhöhen-Hüllkurve hoch → fallend).

```js
Sound.engine = 'body'
p.body = { n:48, parts:[{r /*Verhältnis*/, lvl, t1, t2, knee, det}], B:0, alpha:.5, strings:2, beat:1.5 /*ct*/,
           noise:[{f, q, lvl, a, d}], formants:[{f, w, g}], rough:{amt, rate}, sub:{h2, h3}, velTilt:0, tpl:'klavier' }
```

### 11.3 Teiltöne einfangen (Resynthese-Grundlagen, V9c)

E3-22: Analyse **einer einzelnen Note** zu einem KLANGKÖRPER-Sound. Keine allgemeine, zeitvariable Resynthese.

- **Quellen:**
  1. ein **App-Sound** (Spur oder Bibliothek): offline gerendert (OfflineAudioContext mit demselben Worklet-Modul) als Note C3 bzw. gewählte Note, 2 s Halten + Ausklang;
  2. eine **Audiodatei** (`<input type=file>` mit `accept="audio/*"`, iOS kennt den Typ): `decodeAudioData`, die ersten 4 s, Mono-Summe. In der Claude-App: Dateiwahl laut Fähigkeitenliste möglich (**am Gerät prüfen**).
- **Analyse** (auf dem Hauptthread in Scheiben, ≤ 2 s gesamt auf der Xeon):
  1. Grundton f₀: aus der gewählten Note (App-Sound) bzw. YIN auf dem Halteteil (Datei), mit Anzeige und Korrektur ±1 HT/±50 ct.
  2. STFT (Hann 4096, Schritt 512); Spitzen nahe `n·f₀·√(1+B n²)`, B per kleinster Quadrate aus den ersten 16 Teiltönen.
  3. Je Teilton (≤ 48): Startpegel = Maximum in 0–100 ms; T1 aus 0–300 ms, T2 danach (log-lineare Anpassung); Verhältnis = gemessene Frequenz / f₀.
  4. Rauschrest: Energie nach Abzug der Teiltöne in 0–50 ms in 3 Bändern → Rauschteil (Hammer/Atem).
  5. Formant-Hügel: geglättete Hüllkurve des Startspektrums (3 Hügel).
- **Ergebnis:** neuer KLANGKÖRPER-Sound „Eingefangen 14.10. 21:40“ auf der Spur (ein Undo) mit A/B-Vergleich (gleiche Lautheit): [Original ▶] [Nachbau ▶].
- **Grenzen** (Text im Blatt): nur eine Note, einstimmig, statische Tonhöhe, keine wandernden Formanten, Anschlagsverhalten nur über die Vorlage.

### 11.4 Phase Distortion *(P1 in V9a)*

- Tabellen-Oszillator-Modus „PD“ (CZ-Prinzip): Wellen Säge, Rechteck, Puls, Doppelsinus, Säge-Puls, Resonanz I–III (Fensterformen **unbelegt**, eigene Annäherung); DCW-Hüllkurve (8 Punkte) fährt die Verzerrung; „Linie 1+1′“ = zweite verstimmte Linie.
- CPU 0,19 % je Stimme (gemessen, Rechenkern). Grund: Xanders CZ-Frage (§12.6); entfällt der Punkt, steht er in §18.

---

## 12. Bibliothek v3, Init und Tutorial-Grundgerüst

Quellen: R5-H7/H10 (Bibliothek, Signature-Sounds, Recherche), R5-Audit F/I, Vision 3.1–3.7, §v2-11. Rechtliches (kein Rechtsrat): § 23 MarkenG erlaubt nur nötige, anständige Hinweise (SE); Melodien und Riffs sind als Werkteile geschützt (eK) ⇒ **alle Vorhör-Phrasen sind eigene Melodien** mit ähnlicher Funktion (Rhythmus, Lage, Artikulation), keine Original-Riffs, keine Samples.

### 12.1 Grundregeln (V0b, verbindlich ab dort)

- **Tipp auf den Namen = übernehmen, stumm** (ein Undo, Toast [▶ Hören] [Rückgängig]). Die Tastatur spielt sofort mit dem neuen Sound. Laden während klingender Noten bleibt knackfrei (PR5).
- **▶ = Vorhören** (wird ■). Höchstens ein Vorhören; Stopp mit ■, ▶ eines anderen Sounds, Schließen, Tastendruck; 20-ms-Ausblendung.
- Fester Ort statt verstecktem Zustand: Zeile `[▶] Name … Rolle · Stil … Engine ⓘ [⋯]`; ⋯ nur bei eigenen Sounds.

### 12.2 Ansicht (V10a)

```
┌ SOUNDS · SYNTH 2 ──────────── Hören: [Phrase│Mein Clip]  ✕ ┐
│ [Alle][Bass][Sequenz][Lead][Akkord][Fläche][Keys][Atmo][Init]│  Rollen-Chips, waagrecht wischbar
│ Stil ▾   Engine ▾                                            │  eingeklappt (Tiefe)
├──────────────────────────────────────────────────────────────┤
│ [▶] Ketten-Riff          Lead · 80er          VA   ⓘ          │  Zeile 48 (P) / 44 (L)
│ [■] Fjord-Riff ▌geladen  Lead · 80er          VA   ⓘ          │
│ [▶] Grauzone-Fläche      Fläche · Dunkel      VA   ⓘ          │
│  ⓘ im Stil von … · Gerät: unbelegt · Trick: … [Lektion]       │  aufgeklappte Info
├──────────────────────────────────────────────────────────────┤
│ [Sichern] [Import] [Export]                                   │
└──────────────────────────────────────────────────────────────┘
```
- **Rollen statt Engine** als erste Ordnung: Bass · Sequenz · Lead · Akkord · Fläche · Keys · Atmo · Drums · Init. Heutige Kategorien werden abgebildet (bass → Bass, lead → Lead, poly → Akkord, flaeche → Fläche, pluck → Sequenz oder Keys je Sound, sequenz → Sequenz, fm/glocke/wt → je Sound). **Stil** (80er · Dunkel · Sphäre · Chip · Weihnacht · Modern) und **Engine** sind Filter.
- **Drum-Spur:** Kits und Einzelinstrumente; ▶ spielt das **eigene** Muster des Kits (`aud.drums.pattern`), nicht immer Rom Pop.

### 12.3 Vorhören: Phrase oder Mein Clip (V10a)

- **Phrase** (Standard): die Hörprobe des Presets, höchstens 4 Takte bzw. 8 s, einmalig. Läuft der Transport, startet sie an der nächsten Zählzeit, im Song-Tempo und transponiert auf den Grundton von Szene bzw. Träger (das Tongeschlecht der Phrase bleibt). ⓘ-Schalter „Original-Tempo“.
- **Mein Clip:** Bei laufendem Transport spielt ▶ den laufenden bzw. gewählten Clip **dieser Spur** ab der nächsten Zählzeit mit dem Kandidaten-Sound (über die Vorhör-Stimme); die Spur selbst wird in 20 ms ausgeblendet, ■ blendet sie wieder ein. Daten bleiben unverändert. Ohne Clip: Taste grau, „Spur hat noch keinen Clip“. Transport steht: spielt den Clip einmal.

### 12.4 Eigene Sounds mit Hörprobe (V10a)

- [Sichern] → Name mit Zeitstempel (E12) → Rolle (vorgeschlagen wie §8.6) → **Hörprobe**: [Phrase der Rolle] [Clip „Szene n“ dieser Spur] [letzte FANG-Phrase] [jetzt einspielen] (● am nächsten Schlag, höchstens 4 Takte, Auto-Quantisierung). Standard: aktueller Clip, falls vorhanden, sonst Phrase der Rolle.
- Ändern später über ⋯ → „Hörprobe ändern“.
- `aud`, `role`, `style` und `name` zählen **nicht** zum `soundHash` (sonst gälte ein Sound nach dem Ändern der Hörprobe als „geändert“).

### 12.5 Presets mit Sequenz ⧉ (V10b)

- Einige Presets bringen einen Clip mit (⧉ in der Liste, z. B. „Dateneingabe“). Nach dem Laden Toast „Bringt eine Sequenz mit · [In Slot legen] [Rückgängig]“. Sie landet im gewählten **leeren** Slot, sonst im nächsten freien. Nie überschreiben, nie automatisch.

### 12.6 Signature-Paket (V10b)

- **46 Presets** (Anhang A.1) in den Gruppen 80er-Hooks, Dunkel/kalt, Enigma-Atmo, Chip/Computer, CZ-Charakter/Weihnacht, Kits/modern. Jedes mit eigener Vorhör-Phrase, Rolle, Stil, ⓘ-Text mit **Belegstatus** („belegt (Quelle)“, „unbelegt“, „Einschätzung“).
- Die vorhandenen 30 VA-, 4 WT-, 12 FM-Sounds und die Kits bekommen ebenfalls eine eigene Phrase statt der Kategorie-Phrase (`SQ_FACTORY.PREVIEW`).
- **Kalibrierung:** −18 LUFS (Phrase, trocken) und PR8-Qualitätsgrenzen (§v2-11.1). Ein Preset, das eine Grenze verfehlt, wird korrigiert, nicht die Grenze.
- **Umbenennung nach E9** (E3-14, Anhang A.4): Werks-Sounds mit Marken- oder Personennamen bekommen eigene Namen; `loadPreset(t, alterName)` löst über eine Alias-Tabelle auf; IDs (`f-moog-bass` …) bleiben.
- **Abhängigkeiten:** Presets mit „→ KF“ (brauchen den Klang-Feinschliff aus §18: Bitcrusher, Ringmod, Arp-Treppe) werden mit dem heutigen Stand angenähert und im ⓘ-Text als „Annäherung“ markiert; „→ PD“ ebenso (bis §11.4 gebaut ist).
- **Weihnachtsalbum „Himmlische Klangdimensionen“:** In 5 Suchen (zuletzt 14.10.2026, exakter Titel) nicht gefunden; ob Casio-CZ-1-Werksklänge benutzt wurden, ist **nicht belegt**. Die Gruppe E baut den CZ-Charakter nach (Annäherung, mit PD genauer). Frage an Xander: Foto von Cover und Rückseite.

### 12.7 Init (V0b, ergänzt in V10a)

- INIT-Sounds (Anhang A.2): INIT Analog, INIT FM, INIT Tabelle, INIT Drums; ab V8/V9: INIT Bitmask, INIT Additiv, INIT Klangkörper. Alle hörbar (RMS > −40 dBFS), ohne Routen, Effekte neutral, auf −18 LUFS kalibriert.
- Editor-Kopf ⋯ → „Init“; Menü → Projekt → Neu ▾ → [Leer (Init)] (§2.2 U-05).

### 12.8 Daten (Bibliothek)

```js
Sound += { role:'bass'|'seq'|'lead'|'chord'|'pad'|'keys'|'atmo'|'drums'|'init', style:['80er', …],
           aud?: { bpm, key:{root, scale}, len /*Takte ≤ 4*/, notes:[[b, d, n, v, a?]] /*≤ 256*/, drums?:{kit, pattern} },
           clip?: { len, notes } /*⧉*/, info?: { vorbild, beleg:'belegt'|'unbelegt'|'einschaetzung', quelle? } }
```
- Größe: 46 Presets mit Phrasen ≈ 60 KB (Schätzung); Phrasen kompakt als Zahlenfolgen kodieren.
- **Import:** Zusammengelegt wird nur, wenn `soundHash` **und** Name gleich sind; gleiche Klänge mit verschiedenem Namen bleiben beide erhalten (Testlücke aus v2).

### 12.9 Tutorial-Grundgerüst (V10c)

**Vorbilder:** Ableton Learning Synths (Kapitel + Spielwiese, läuft im Handy-Browser), Syntorial Preset Recipes (SE).

**Lektions-Motor**
- Eine Lektion ist eine Liste von Schritten:
```js
Lesson = { id, title, minutes, steps: [{ say /*≤ 2 Sätze*/, open?: {editor, tab, page}, pulse?: 'cutoff',
           target?: {key, min, max} /*Zielbereich in Reglereinheiten*/, check?: 'fenvSet'|… /*benannte Prüffunktion*/,
           play?: 'ziel'|'meins', wait?: 'tap'|'target'|'event' }] }
```
- **Karte** oben im Blatt (≤ 96 px, verdeckt keine Regler): Text, Fortschritt „3/7“, [Ziel ▶] [Meins ▶] (gleiche Lautheit, M-LUFS kurzzeitig) [Weiter] [✕].
- Die App öffnet die richtige Seite, der nächste Regler **pulsiert** (Ring, 1 Hz), der **Zielbereich** leuchtet als grüner Bogen am Regler-Ring (Ring-Zeichnung aus WP5). Ist der Wert im Zielbereich, hakt der Schritt ab (oder [Weiter]).
- Die Ziel-Phrase ist immer eine eigene Phrase, **nie** eine Original-Aufnahme.
- Einstieg: Menü → **Lernen** (neue Rubrik) mit Liste der Lektionen und Fortschritt (`S.settings.learn`).
- Abbrechen jederzeit; nichts wird gespeichert, außer man tippt am Ende [Als eigenen Sound sichern] bzw. [Projekt sichern].

**Drei Lektionen**
1. **„Pluck in 6 Schritten“** (Synth, VA): INIT Analog laden → Cutoff runter (Ziel 300–600 Hz) → Filter-Hüllkurven-Menge hoch (+24 … +40 HT) → Filter-Decay kurz (0,1–0,3 s) → Amp-Sustain 0 und Decay 0,3–0,6 s → Hall-Send 15–30 % → sichern.
2. **„Kick mit Biss“** (Drum-Editor v3): KICK wählen → TON 45–60 Hz → PUNCH 18–30 HT → BISS mit ART HOLZ (×3) auf 40–60 % → DRIVE 20–40 % → mit ▶ und Pads (leise/laut) vergleichen; Erklärung „der Anschlag ändert nur den Pegel, der Charakter bleibt“ (AR1).
3. **„Erster Song in 3 Teilen“**: Szene 1 starten → ⇅ TRANSPONIEREN halten, Am–F–C–G spielen → FANG TEIL → Vorschlag „Strophe“ mit [Übernehmen] bestätigen → Szene 2, F–G–Am–Am → FANG TEIL → Vorschlag „Refrain“ landet hinter der Strophe → Song-Ansicht, ×2 an Strophe → MELODIE-Spur, ● mit Ziel MELODIE, 4 Takte spielen → ▶ SONG. (Die Teil-Tasten STROPHE und REFRAIN stehen danach auf der Teil-Leiste.)
- Lektion 3 braucht V2 vollständig; Lektion 2 braucht V1b.

---

## 13. Stimme und Audio (später, nicht in diesem Bau)

- **Fakt:** In der Claude-App gibt es derzeit **kein Mikrofon**. Die Fähigkeitenliste des Artifact-Laufzeitvertrags (abgefragt in Runde 3) enthält keinen Mikrofon-Zugriff; `getUserMedia` braucht im iframe `allow="microphone"` (MDN, SE). Ein Gerätetest steht aus. In der Safari-Web-App ginge es nur über **https** unter eigener Adresse (E10).
- **Tor VS0 „Mikro-Check“** (1–2 h, jederzeit vorziehbar): Testseite mit einem Knopf, zeigt Fehlername oder Spur-Einstellungen, misst Rundlauf-Latenz, fragt „Wurde die Musik beim Mikro-Start leiser oder dumpfer?“ (bekannte iOS-Effekte, SE). Ergebnis entscheidet über VS1 ff.
- **Später (nur bei positivem VS0):** VS1 Stimme → Noten (YIN, Einrasten, Anschluss an FANG), VS2 Beatbox → Pads, VS3 Hör-Spur + Silben, VS4 Audio bearbeiten, VS5 Klang einfangen → Additiv (nutzt §11.3), VS7 Akkorde erkennen. Details: `SYNQUENZER-stimme-jam.md` Teil 1 und 3.
- **Was v3 schon vorbereitet:** §11.3 analysiert Audiodateien (ohne Mikrofon); §8.6 kennt die Rolle GESANG FOLGT.

---

## 14. Datenmodell v4 (Gesamtüberblick)

Format 4 ab V2a; Felder aus V0/V1 sind additiv in Format 3 und bleiben in Format 4 gleich.

```js
Project = {
  format: 4, id, name /*„Projekt · Mi 14.10. 21:40“*/, bpm, key, shift: 0 /*§4.10*/,
  settings: { …v2, harmony:{ …v2, oneScale:boolean /*V2c′; fehlt = false*/ }, kbVel:'pos'|'fixed' /*Standard 'pos', E3-29*/, shiftKb:true,
              morph:{x:'flow', curve:'s'}, learn:{done:[…]} },
  scenes: [{ name, chords?: ChordRow } × 8],
  tracks: Track[≤ 8]       // Index stabil: 0–3 Synth 1–4, 4 DRUMS, 5 MELODIE, 6–7 Synth 5–6 (§4.2)
  parts: [Part|null × 8], chain: { items:[ChainItem], loop, range? },
  song: null | Song,                                          // Abspielplan / Mitschnitt
  fxBus: { hall, echo, master /*WP4*/, pumpSrc },
  master: { target, style, plan, corr, wishes, frozen, version },   // ab V7b
  ui: { selT, selS, order:[…], sceneBank, trackBank, partPage, follow:{roll, lauf, steps}, edMode }
}
SynthTrack = { kind:'synth', name, color, mel?:true, follow, onChange, kbOct, sound, clips:[Clip|null × 8],
               mix /*ab V7a, §8.3*/ }
DrumTrack  = { kind:'drum', name:'Drums', color, kbOct, sound /*engine 'drum', p:{base, slots, kit:{ev, dynDb, …}}*/, clips:[…× 8], mix }
Clip = { len, key, q?, seed?, notes:[Note], vars?:[Variant], use?, st?:ClipState }
Note = { t, d, n, v, o?, a?, p?, r?, m?, lk?: { tune?, dec? /*relativ, Drums, WP6*/, v?: {Schlüssel: 0..1} /*absolut, ≤ 8, ab V5b/V5c*/ } }
ChordRow = { len, ch:[{ b, tg }] }
Part = { id, name, color, len, start:'bar'|'end', slots:[{s}|-1|null × NT], chords:ChordRow|null, xp, src, st? }
ChainItem = { part:'P1'|'S3', rep, alt?:{slots?, chords?} /*ABWEICHUNG*/, mel?:{[t]:{notes:Note[]}} }
Song = { bars, loop:{on, a, b}, lanes:[[{bar, slot, re?:1}] × NT], carrier:[{beat, target}], mel:{[t]:{notes}}, xp?:[{beat, semi}], src:'chain'|'rec' }
ClipState = { eng, p:{Pfad: Wert}, fx:{drive?, chorus?}, mix?:{vol?, pan?, rev?, dly?}, slots?:{[slotId]:{…}}, x:'flow'|'bar1'|'bar2'|'jump' }
Sound = { …v2, engine:'analog'|'fm6'|'wt'|'drum'|'mask'|'add'|'body', role, style, aud?, clip?, info?,
          p /* + fmx (§9.2), mask (§10.4), add (§11.1), body (§11.2) */,
          mods:[{src, dst, amt, byp?}], fx:{drive, chorus, sendHint} }
```
- **Normalisierung:** `normalizeProject`, `normClip`, `cleanClip`, `normNoteExtras`, `SQStore.normDrum/normFx/normalizeSound` erhalten jedes neue Feld (Abnahme je Paket „überlebt Speichern/Laden, Kopieren, Undo“).
- **Undo-Arten:** `clip`, `sound`, `kit`, `song`, `fx` (WP6, Einzel-Schnappschüsse, `undoApply` Z. 9018) und neu `group` (V2a, E3-33), `part`, `chain` (V2c/V2d), `proj` (V2e/V2f), `mix` (V7a), `master` (V7c). `group` trägt `items:[Einträge]`, Undo rückwärts, Redo vorwärts, zählt als 1 von 60.
- **Rollen (eine Aufzählung):** `ROLES = bass · seq · chord · pad · lead · atmo · mel · vocal` mit Anzeige BASS · SEQUENZ/ARP · AKKORD/STAB · FLÄCHE · LEAD/HOOK · ATMO/FX · MELODIE · GESANG FOLGT. `track.mix.role` (Mischung, §8.6) und `Sound.role` (Bibliothek, §12.8, zusätzlich `keys`, `drums`, `init`) nutzen sie; Zuordnung `keys → chord`, `drums`/`init` → keine Mischrolle. Die MELODIE-Spur ist `track.mel = true`, keine Rolle. `tracks()` liefert `mel` und `role` getrennt.
- **Migration** (verlustfrei, in dieser Reihenfolge): v1/v2 → 3 (vorhanden) → 4 (§4.11) → `track.mix` (§8.3, beim ersten Laden ab V7a).

---

## 15. Leistung, CPU, Dateigröße

### 15.1 CPU-Budget (Xeon-Messungen; iPhone ungemessen, Faktor 2–2,5 unbelegt)

| Baustein | gemessen je Stimme bzw. Spur | Ziel je Paket |
|---|---|---|
| VA (3 Osz. + Ladder) | 0,50–0,74 % je Stimme | wie v2 |
| FM6 / FM8 frei / FM8 volle Matrix | 0,86–1,31 / 0,67–0,99 / 1,81–2,48 % | Spur ≤ 12 % im schlechtesten erlaubten Fall (8 Op, 16 Kanten, Stimmenregel §9.1) (V4a) |
| Tabelle (Bitmask, Additiv-Tabelle, PD) | 0,07–0,36 % | ≤ 0,5 % je Osz. |
| KLANGKÖRPER 24/48/64 TT | 0,42 / 0,68 / 1,06 % | 8 St. × 48 TT ≤ 8 % |
| Drums busy Groove | 5,5–6,4 % | ev3 ≤ 7 %, mit Filtern ≤ 8 % |
| 4 × Fläche (6 St., Akkorde + 16tel) | 26,6–28,9 % Summe | Begrenzer greift am iPhone |
| Master-Worklet | ungemessen (geschätzt ≪ 1 %) | ≤ 1,5 % |

### 15.2 CPU-Begrenzer v3 (erweitert §v2-14.3)

| Stufe | Bedingung | Zusätzlich zu v2 |
|---|---|---|
| 1 | Last > 0,45 | KLANGKÖRPER: Teiltonzahl halbieren (48 → 24); Synth-Pads Poly 1 |
| 2 | Last > 0,60 | FM-Feld 7–8 Op: Poly ≤ 4; Morph-Interpolation je 2 Blöcke |
| 3 | Last > 0,75 | wie v2 |
- Anzeige ab Stufe 1 (K-14); der Begrenzer ändert nie Gespeichertes (I-08). Die MIX-Last-Anzeige (V7a) zeigt die Summe und je Spur.

### 15.3 Dateigröße und Startzeit

- Grenze **≤ 3,0 MB** (E3-03). WP7 ≈ 1,25 MB. Budgets je Paket (KB, Zuwachs): V0a 25 · V0b 40 · V0c 30 · V1a 40 · V1b 60 · V1c 40 · V2a 45 · V2a′ 30 · V2b 25 · V2c 60 · V2c′ 20 · V2d 30 · V2d′ 25 · V2e 60 · V2f 20 · V7a 50 · V3a 45 · V3b 40 · V3c 30 · V4a 35 · V4b 70 · V4c 30 · V5a 40 · V5b 30 · V5c 30 · V6a 35 · V6a′ 25 · V6b 25 · V7b 40 · V7c 60 · V7d 40 · V8a 40 · V8b 40 · V9a 30 · V9b 50 · V9c 30 · V10a 40 · V10b 120 · V10c 60 = **≈ 1,59 MB** ⇒ Ende ≈ 2,85 MB. Überschreitet ein Paket sein Budget um > 50 %, begründet CHANGES das; die Summe bleibt ≤ 3,0 MB.
- **Startzeit-Abnahme (jedes Paket):** Chromium, P1, Kaltstart: Zeit von der Navigation bis `window.SYNQUENZER` bereit **und** erstes Bild gezeichnet; **Median aus 5 Kaltstarts**, Paket-Suite allein laufen lassen. Grenzen **absolut:** ohne Drosselung ≤ 1,5 s, mit CDP-CPU-Drosselung ×4 ≤ 4 s, Zuwachs gegenüber dem Vorgänger-Paket ≤ **+150 ms** (Median gegen Median). Ein relatives 10-%-Kriterium um ≈ 1 s ist auf der geteilten VM nicht reproduzierbar (CHANGES-WP6/WP7: Messungen schwanken unter Last deutlich stärker). Werte in CHANGES.
- Große Tabellen (Masken-Pool, Additiv-Vorlagen, Phrasen) werden **erzeugt oder kompakt kodiert**, nicht als Fließkomma-Literale eingebettet.

---

## 16. Test-API-Erweiterungen (`window.SYNQUENZER`, Alias `DIRIGENT`)

Alles aus §v2-16, WP6 und WP7 bleibt (I-04). `version` folgt §17. Neu (synchron, außer Rückgabe ist ein Promise; Rückgaben sind tiefe Kopien; jede ändernde Funktion ist ein Undo-Schritt wie die Geste):

```ts
// V0a / V0b / V0c
tickErrors(): number                                  // Zahl der in tick() gefangenen Fehler seit Start
viewState(kind?: 'roll'|'lauf'|'steps'): {editor, page, x0, ppb, follow:'on'|'hold'|'off', reason: 'hand'|'sel'|'finger'|'tool'|'edit'|null}
setFollow(kind, on: boolean): void
browserTap(id): void; browserPreview(id, on?: boolean): void        // Tipp = laden (stumm); ▶
newProject(opts?: {init?: boolean}): Promise<void>                    // erweitert
initSound(t): void
carrierShown(): {shift: number, target: string}                       // Anzeige-Werte (K-08)
songRecTargets(o?: {scenes?|parts?: boolean, chords?: boolean, mel?: boolean}): {…}
songLoop(on: boolean): boolean                                        // unverändert wie WP6 (I-04)
songLoopRange(o?: {on?: boolean, a?: number, b?: number}): {on, a, b} // neu: Bereich lesen/setzen
songSetChord(bar: number, chord: string|Target|null): void
parseChord(text: string): Target|null
// V1a / V1b / V1c
drumMacros(slot): {key, label, value, min, max, ext?}[]; setDrumMacro(slot, key, value): void
drumRender(slot, vel, opts?: {seed?, accent?, ms?}): Promise<Float32Array>   // Offline-Render eines Schlags (Tests)
setKit(key: 'ev'|'dyn'|…, value): void (erweitert); kitToV3(): void
drumEd(): null | {slot, tab, page}; drumSelect(slot): void
setPadSource(slot, src: 'drum'|'synth', o?: {sound?, note?, gate?, rel?, poly?}): void
// V2a … V2f
tracks(): {i, name, kind, mel: boolean, role: string|null, order}[]; addTrack(): number; removeTrack(i): void
sceneBank(n?: 0|1): number; trackBank(n?): number
moveClip(t, s, t2, s2, copy?: boolean): void; drumToSynth(t, s, t2, s2, mode: 'root'|'degree'|'gm', slots?: string[]): void   // V2a′
songMel(on?: boolean): void                                           // unverändert wie WP6: startet/beendet die Melodie-Aufnahme (I-04)
songMelNotes(t?): Note[]                                              // neu: Song-Melodie je Spur lesen
parts(): (Part|null)[]; setPart(i, part|null): void; partFromNow(i, name?): void; launchPart(i): void
chordRow(src: 'S1'..'S8'|'P1'..): ChordRow|null; setChordRow(src, row|null): void
fangPart(): null | {len, chords, slots, period, suggest:{name, where, rep, sceneAlt: number|null}}; setFangRange(len?: 1|2|4|8|16, startBar?: number): void
acceptPart(o?: {name?, where?: number[], rep?, toScene?: number}): void; rejectPart(): void
oneScale(on?: boolean): boolean                                       // V2c′
memory(): {bars: …[], capc: {beat, target}[]}
chain(): Chain; setChain(c): void; chainInsert(pos, partId, rep?): void; chainMove(from, to): void; chainDelete(pos): void
flatten(): Song; splitRecording(): boolean
songFromChain(chain): …  // WP6-API: bis V2d wie WP6 (Mitschnitt); ab V2d erzeugt sie eine Kette items:[{part:'S'+(scene+1), rep: bars/len}]
songKey(): {root, scale, conf, alt: {root, scale}|null}; setShift(n): void; applyShift(): void
// V3a … V3c
barSelect(a, b?): void; barAction(kind: 'swap'|'move'|'copy'|'delete'|'clear', target?): void
rotate(dir: -1|1, width: 'bar'|'half'|'step'): void; mirror(mode: 'key'|'chrom', axis: 'mid'|'first'|number): void
reverse(mode: 'full'|'pitch'): void; stretch(f: 2|0.5): void; clipMidi(t, s, withCarrier?: boolean): Uint8Array
addVariant(t, s, rule, play?, n?, p?): string; useVariant(t, s, id|null): void; holdVariant(t, s, id): number
stepPen(on: boolean, notes?: number[]): void
// V4a … V4c
getFmx(t): Fmx|null; setFmx(t, fmx): void; fmxFromAlg(n): Fmx; dxMatch(t): {ok, alg?, nearest?, diff?}
fieldDrop(t, op, target: string|'rail'|'park'|'empty', zone?: 'top'|'bottom'|'side'|'mid'): void; fieldUi(): {…}
fmPredict(t): {label, bars: number[16]}; exportSyx(ids: string[]): Promise<Uint8Array>
// V5a … V5c
modStrands(t): {src, dst, amt, byp, pol, active, fixed?: boolean}[]; setModBypass(t, idx, on): void; setLfoPol(t, n, 'bi'|'uni'): void
lockMode(on: boolean): void; setLock(t, s, noteIdx, key, value|null): void; locks(t, s): {noteIdx, lk}[]
// V6a / V6b
stateRemember(t, s?): void; clipState(t, s): ClipState|null; setClipState(t, s, st|null): void
morphInfo(t): {active, t0, t1, keys: string[]}; partState(i): {…}|null; morphFader(t, x: number): void
effectiveParams(t): {…}                                               // effective(t), §6.4
// V7a … V7d
mix(t): Mix; setMix(t, key, value): void; openMix(t?): void
masterInfo(): {lufsM, lufsS, lufsI, tp, corr, monoLoss, gr, pump, worklet: boolean}
roles(): {t, role, src, ask: boolean}[]; setRole(t, role): void
remaster(o?: {offline?: boolean}): Promise<Plan>; masterUi(): {button:'MASTERN'|'REMASTER', listening: null|{done, of}, plan: boolean}; cancelRemaster(): void
acceptPlan(): void; setTarget(name): void; setCorr(key, value): void
cards(): {id, text, actions}[]; answerCard(id, action): void
// V8a / V8b
setMask(t, osc, key, value): void; maskPool(): {idx, centroid}[]; setMaskField(t, osc, seg, state: 'N'|'I'|'S'|'R'): void
// V9a … V9c
setAdd(t, key, value): void; setBody(t, key, value): void
capturePartials(src: {track?: number, preset?: string, file?: ArrayBuffer, note?: number}): Promise<{f0, B, parts, noise}>
// V10a … V10c
browserFilter(o: {role?, style?, engine?}): string[]; previewMode(m?: 'phrase'|'clip'): string
setAudition(soundId, aud): Promise<void>; aliases(): {[alt: string]: string}
lessons(): {id, title, minutes, done}[]; startLesson(id): void; lessonState(): null | {id, step, of}; lessonStep(): void
```
- `runtime()` ergänzt: `follow`, `rec.targets`, `part` (laufender Teil), `chainPos`, `shift`, `morph`, `master`, `limiter`.
- `noteLog`-Quellen ergänzt: `'part'`, `'chain'`, `'synpad'`, `'lesson'`.
- Test-Hooks nur für Tests (nicht in der Oberfläche): `__failTrack(i)` (V0a-02), `__seed(n)` (Rausch-Startwerte), `__morphProbe(t, on)` (V6a, interpolierte Morph-Schlüssel je Block), `__masterHang(on)` (V7b-05, Herzschlag anhalten).
- **Gleicher Name, gleiche Bedeutung (I-04):** `songMel(on)` startet/beendet weiter die Melodie-Aufnahme, `songLoop(on)` liefert weiter boolean; neue Rückgaben bekommen neue Namen (`songMelNotes`, `songLoopRange`). Alte SG-Tests und WP6-Skripte laufen unverändert.

---

## 17. Arbeitspakete

### 17.0 Reihenfolge, Begründung, Regeln

| Block | Pakete | Begründung |
|---|---|---|
| **V0 Korrekturen + Schnell-UX** | V0a Fehler · V0b Schnell-UX · V0c Song-Sofort | Zuerst: K-01 erzeugt Doppelnoten in allen Spuren; Xander will sofort spürbare Erleichterung (Bibliothek, Folgen, Song verliert nichts). |
| **V1 Drum-Editor v3** | V1a Engine ev3 · V1b Oberfläche · V1c Kits + Synth-Pad | Xander: Drums „so schnell wie möglich“; in sich geschlossen, braucht nur V0. |
| **V2 Song-Flow** | V2a Spuren/Szenen · **V2a′ Matrix-Gesten** · V2b MELODIE · V2c Teile/Akkorde · **V2c′ Eine Skala** · V2d FANG TEIL + Kette · **V2d′ Aufnahme-Ziele über die Kette** · V2e Song-Ansicht · V2f Song-Tonart | Größter Schmerz („zu sperrig“). V2a zuerst, damit Teile und Kette nur einmal migriert werden. V2c′ vor V2d, weil ab dann Clips dauernd unter wechselnden Akkord-Zeilen laufen. V2d war mit 15 Abnahmepunkten real zwei Pakete (Review). |
| **V7a Mischung (vorgezogen)** | V7a Drei Ebenen + MIX | E3-32: H2 („Pegel, Spur-Sound, Master verwirren“) sofort lösen; braucht nur V2a; danach speichern Klangzustände Spur-Werte gleich in `st.mix`. |
| **V3 Editor-Werkzeuge** | V3a Taktleiste · V3b Drehen/Spiegeln/Varianten · V3c LAUF+ | Braucht FOLGEN (V0b) und die stabile Clip-Struktur aus V2a. |
| **V4 FM-Feld** | V4a Graph-Engine (+ Stimmen-Überblendung) · V4b FELD · V4c Vorhersage/DX-Brücke | Xanders Bauwunsch Nr. 1 aus Runde 4; unabhängig von V1–V3, braucht WP7. |
| **V5 Modulation** | V5a Stränge · V5b LOCK + Drum-Locks · V5c Synth-Locks | Drum-Locks brauchen die Makros aus V1; Synth-Lock-Lanes brauchen LAUF+ (V3c). |
| **V6 Klangzustände** | V6a Zustände + Worklet-Morph · **V6a′ nativer Morph, Spur-FX, Drum-Zustände** · V6b Teil-Klang + MORPH-Griff | Braucht Teile (V2c), MIX (V7a), die Endwert-Regel mit Locks (V5) und die Stimmen-Überblendung (V4a). V6a war real zwei Pakete (Review). |
| **V7 Master** | V7b Master-Worklet · V7c Rollen/MASTER-Reiter/REMASTER · V7d Wächter/Karten | Braucht V7a. |
| **V8 Bitmask** | V8a Tabellen-Osz. + Klang · V8b Oberfläche | Tabellen-Oszillator ist Grundlage für V9. |
| **V9 Additiv** | V9a Tabellen-Additiv (+PD) · V9b KLANGKÖRPER · V9c Teiltöne einfangen | Nutzt V8a. |
| **V10 Bibliothek + Tutorial** | V10a Bibliothek v3 · V10b Signature-Paket · V10c Tutorial | Zuletzt: Presets brauchen alle Engines; Lektionen brauchen stabile Oberflächen. |

```
WP7 ─ V0a ─ V0b ─ V0c ─┬─ V1a ─ V1b ─ V1c
                        ├─ V2a ─ V2a′ ─ V2b ─ V2c ─ V2c′ ─ V2d ─ V2d′ ─ V2e ─ V2f
                        ├─ V7a (V2a) ─ V7b ─ V7c ─ V7d
                        ├─ V3a (V2a) ─ V3b ─ V3c
                        ├─ V4a ─ V4b ─ V4c
                        ├─ V5a ─ V5b (V1a) ─ V5c (V3c)
                        ├─ V6a (V2c, V4a, V5c, V7a) ─ V6a′ ─ V6b
                        ├─ V8a ─ V8b ─ V9a ─ V9b ─ V9c
                        └─ V10a ─ V10b (V4, V8, V9) ─ V10c (V1b, V2e)
```
Gebaut wird **in dieser Reihenfolge** (ein Builder je Paket): V0a · V0b · V0c · V1a · V1b · V1c · V2a · V2a′ · V2b · V2c · V2c′ · V2d · V2d′ · V2e · V2f · **V7a** · V3a · V3b · V3c · V4a · V4b · V4c · V5a · V5b · V5c · V6a · V6a′ · V6b · V7b · V7c · V7d · V8a · V8b · V9a · V9b · V9c · V10a · V10b · V10c. Die Abhängigkeiten zeigen, was ein Paket voraussetzt.

**Regeln für jedes Paket:** §1.3 (Regression, Definition of Done) und §0.2 (Leitlinien). Zusätzlich:
1. Abnahmepunkte sind mit Messung belegt; CHANGES nennt je Punkt den Messwert.
2. Eine Abweichung von diesem Dokument nur mit Begründung in CHANGES; Messgrenzen werden nicht gelockert, sondern das Bauteil korrigiert (wie PR8 in WP7).
3. Interims-Zustände nur, wo das Paket sie nennt.
4. Jedes Paket nennt in CHANGES 3–5 Punkte für Xanders iPhone-Test.
5. V4b und V10b bleiben mit 5–6 h über der 4–5-h-Regel: eine zusammenhängende Oberfläche bzw. ein Preset-Paket lässt sich nicht sinnvoll teilen; bei Zeitnot zuerst die *(P1)*-Punkte streichen.

| Paket | App-Version | Budget | Dauer |
|---|---|---|---|
| V0a / V0b / V0c | 3.1.0 / 3.2.0 / 3.3.0 | 25 / 40 / 30 KB | je 4–5 h |
| V1a / V1b / V1c | 3.4.0 / 3.5.0 / 3.6.0 | 40 / 60 / 40 KB | je 4–5 h |
| V2a / V2a′ / V2b | 4.0.0 (Format 4) / 4.1.0 / 4.2.0 | 45 / 30 / 25 KB | 4–5 / 4 / 3–4 h |
| V2c / V2c′ / V2d / V2d′ | 4.3.0 / 4.4.0 / 4.5.0 / 4.6.0 | 60 / 20 / 30 / 25 KB | 5 / 3–4 / 4–5 / 4 h |
| V2e / V2f | 4.7.0 / 4.8.0 | 60 / 20 KB | 5 / 3–4 h |
| V7a | 4.9.0 | 50 KB | 5 h |
| V3a / V3b / V3c | 4.10.0 / 4.11.0 / 4.12.0 | 45 / 40 / 30 KB | je 4–5 h |
| V4a / V4b / V4c | 4.13.0 / 4.14.0 / 4.15.0 | 35 / 70 / 30 KB | 5 / 5–6 / 4 h |
| V5a / V5b / V5c | 4.16.0 / 4.17.0 / 4.18.0 | 40 / 30 / 30 KB | 4 / 4 / 4–5 h |
| V6a / V6a′ / V6b | 4.19.0 / 4.20.0 / 4.21.0 | 35 / 25 / 25 KB | 4–5 / 4 / 3–4 h |
| V7b / V7c / V7d | 4.22.0 / 4.23.0 / 4.24.0 | 40 / 60 / 40 KB | 4–5 / 5 / 4 h |
| V8a / V8b | 4.25.0 / 4.26.0 | 40 / 40 KB | 4–5 / 4 h |
| V9a / V9b / V9c | 4.27.0 / 4.28.0 / 4.29.0 | 30 / 50 / 30 KB | 4 / 5 / 4 h |
| V10a / V10b / V10c | 4.30.0 / 4.31.0 / 5.0.0 | 40 / 120 / 60 KB | 4 / 5–6 / 4–5 h |

Summe 39 Pakete, ≈ 160–180 h reine Bauzeit (Schätzung), dazu Neustarts/Korrekturen (je 1–2 h). Grob je Block: V0 12–15 h · V1 12–15 h · V2 35–40 h · V7a 5 h · V3 12–15 h · V4 14–15 h · V5 12–13 h · V6 11–13 h · V7b–d 13–14 h · V8 8–9 h · V9 13 h · V10 13–15 h.

---

### V0a — Fehler und Stabilität

**Ziel.** Alle bekannten Fehler aus v2 und dem R5-Audit sind behoben; die App plant nie doppelt, knackt nicht beim Gate-Wechsel und zeigt Tonarten richtig.

**Umfang.** §2.1 K-01 bis K-17.

**Nicht-Umfang.** Neue Bedienelemente (V0b), Song-Aufnahme-Ziele (V0c), Drum-ev3 (V1a), FOLGEN (V0b).

**Berührungspunkte.** `DrumSynth.hit` (Klatsch-Schleife, Rampen), `tick`, `logErr`, `kitBus`/`K.setGate`/`drumBusApply`, `LAYER_LVL`/`layerOn`, `pageDrumSound`, PianoRoll-Lineal (Griff, `clampView`, `setLen`), `scheduleTrack`, `buildMidi`, `KeyDetect`-Aufrufer, `CAP`/`capture`, `renderCarrier`/`shownShift`, `applySceneKeys`, `sceneRefKey`, Worklet-LFO (S&H FREI), LFO-Chips, `HMODES`/`popHMode`, Werks-Trick-Texte, `cpuTick`/Badge, `modRow`, Song-Träger-Chips.

**Dauer** 4–5 h · **App-Version** 3.1.0 · **Größen-Budget** +25 KB.

**Abnahme-Checkliste**
- [ ] V0a-01 Clap-Slot Pegel 0 (Rom Pop): 2 Takte Demo → 0 Konsolenfehler, `tickErrors() = 0`; Notenzahl je Spur im `noteLog` gleich wie mit Clap-Pegel 0,85 (Erwartung aus dem Audit: Bass 16, Arpeggio 32 statt 36/52); Pad-Tipp Clap ohne Fehler.
- [ ] V0a-02 `__failTrack(1)` wirft in Spur 1: die übrigen Spuren planen jede Note genau einmal (keine Doppelten im `noteLog` über 4 Takte), `tickErrors()` steigt, `R.schedBeat` wächst monoton.
- [ ] V0a-03 Snare mit Gate 1, Gate-Länge während der Fahne von 0,34 auf 0,5 s ändern: Fahnenpegel im 50-ms-Fenster nach dem Wechsel fällt höchstens 3 dB stärker als ohne Wechsel; M-KLICK besteht.
- [ ] V0a-04 Kit-Wechsel während einer Raum-Fahne: M-KLICK besteht.
- [ ] V0a-05 Rom-Pop-Kick: FM-LED aus bei `fmI 0`, `o2 .45`; Tipp → `fmI 2`, `o2` bleibt .45; Tipp → `fmI 0`, `o2 .45`.
- [ ] V0a-06 SOUND-Seite Snare, Clap, Tom: jeder Engine-Schlüssel höchstens einmal (DOM `data-key`).
- [ ] V0a-07 Loop-Klammer, Standard-Zoom, 4-Takt-Clip, CDP-Touch: Griff um 1 Takt nach links (10 Move-Ereignisse) → `len 3`; dann 1 Takt nach rechts → `len 4`; `viewState().x0` während der Geste konstant.
- [ ] V0a-08 Kürzen 4 → 1 Takt per Griff: Clip enthält keine Note mit `t ≥ 4`; 8 Durchläufe → je Durchlauf genau die Noten mit `t < 4` im `noteLog`.
- [ ] V0a-09 FANG über Akkordwechsel: Träger-Folge Am (Takt 1) / F (Takt 2) läuft; gespielt 72/76 unter Am und 72/77 unter F; FANG; nächster Durchlauf mit derselben Folge klingt 72/76 bzw. 72/77 (`noteLog`).
- [ ] V0a-10 Neues Projekt, a-Moll-Clip (A-C-E) in Szene 1, AKKORD: C-Dur → Anzeige „+3 · → C-Dur“; a-Moll → „±0“; G-Dur → „−2“ (`carrierShown()` und DOM).
- [ ] V0a-11 Editor-Kopf eines Clips bei gelatchtem Träger zeigt die Szenen-Tonart „a-Moll“.
- [ ] V0a-12 Leere Szene 3 nach gehörter a-Moll-Szene zeigt „a-Moll“.
- [ ] V0a-13 S&H FREI 8 Hz → Cutoff, Note 2 s gehalten: ≥ 10 verschiedene Cutoff-Stufen (M-SP in 50-ms-Fenstern, Schwankung ≥ ⅓ Okt).
- [ ] V0a-14 LFO-Tab-Chips: bei laufendem Worklet keine Schraffur für Worklet-Routen.
- [ ] V0a-15 Texte nach K-13 exakt (String-Vergleich in DOM bzw. Daten).
- [ ] V0a-16 `cpuInject(.5, 3)` → Badge „CPU 1“; `.65` → „CPU 2“; `.8` → „CPU 3“.
- [ ] V0a-17 MOD-Zeile `lfo1→pw` bei Säge zeigt „wirkt erst mit Puls-Welle“; nach Wechsel auf Puls verschwindet der Hinweis.
- [ ] V0a-18 Song-Träger-Chip bei a-Moll-Ziel zeigt „Am“.
- [ ] V0a-19 `forceNative(true)`: Werks-VA-Sounds (Vorhör-Phrase, trocken) innerhalb ±1 dB RMS des Worklet-Pfads (heute −3…−4 dB).
- [ ] V0a-20 Regression (§1.3) und DoD.

**Tests.** `v0a-fix.mjs` (01–02, 09–18), `v0a-drum.mjs` (03–06), `v0a-roll.mjs` (07–08); Adaptionen nur, wo ein Text absichtlich geändert ist.

**Risiken.** Die Gate-Überblendung braucht kurz zwei Faltungen (CPU-Spitze; DR7 messen). Der Loop-Griff liegt im PianoRoll-Modul: P-Tests (P20) mitprüfen. K-08 berührt die Anzeige des Harmonie-Kerns: nur Anzeige ändern, nie die Abbildung (I-01).

---

### V0b — Schnell-UX

**Ziel.** Sofort spürbar einfacher: Bibliothek spielt nicht ungefragt, Seiten laufen mit, Ansicht hält beim Bearbeiten, Pad wählt Instrument, klare Namen, Init.

**Umfang.** §2.2 U-01 bis U-07; §5.1 (FOLGEN inkl. HÄLT „von Hand“); §12.1; §12.7 (INIT-Sounds Anhang A.2, Spalte „ab Paket“: INIT Drums hier als ev2); K-15-Zusatz „Tastatur spielt fest“ (§2.1).

**Nicht-Umfang.** MIX-Blick und Verlagerung der Regler (V7a); Bibliothek v3 mit Rollen/Mein Clip (V10a); Drum-Editor-Umbau (V1b).

**Berührungspunkte.** `brTap`, `previewStart`/`previewStop`, Browser-Zeile, `PianoRoll.playhead` (Folge-Regel; Sprung bei `x < 0` nur in FOLGT), Zoom-/Scroll-Handler der Rolle (Pinch, Wischen → HÄLT „von Hand“), K-15-Hinweise (`modRow`, Regler-Ring), `drumEdFrame`, LAUF-Frame, `barPager`, Editor-Köpfe, `padHit`, alle Etiketten aus U-04, `HMODES`, Menü Projekt (`newProject`, Namen, Verlauf `hist:`), Editor-Kopf ⋯, `SQ_FACTORY` (INIT), Tastatur-Eingabe (`inputDown`, Anschlag), Hilfe-Zeilen.

**Dauer** 4–5 h · **App-Version** 3.2.0 · **Größen-Budget** +40 KB.

**Abnahme-Checkliste**
- [ ] V0b-01 Bibliothek: Tipp auf einen Sound-Namen lädt ihn (`getSound`), Master-RMS bleibt 1 s lang < −70 dBFS, kein `noteLog`-Eintrag `preview`; Toast mit [▶ Hören] [Rückgängig].
- [ ] V0b-02 ▶ → erster Ton ≤ 150 ms; ■ → M-KLICK besteht; ▶ an einem zweiten Sound beendet das erste Vorhören (höchstens eine Vorhör-Stimme aktiv).
- [ ] V0b-03 Kits: Tipp lädt stumm, ▶ hört.
- [ ] V0b-04 Drum-SCHRITTE, 2-Takt-Clip, Wiedergabe: die angezeigte Seite ist an jedem Taktstrich der Takt der Abspielmarke (± 1 Bild); das Lauflicht ist in Takt 2 sichtbar.
- [ ] V0b-05 LAUF, 2-Takt-Clip: wie V0b-04.
- [ ] V0b-06 ROLLE, 4-Takt-Clip, 1 Takt sichtbar: ohne Auswahl blättert die Ansicht; mit gewählter Note bleibt `viewState().x0` über 2 Durchläufe konstant, Kopf zeigt „HÄLT · Auswahl“; nach Aufheben der Auswahl folgt sie spätestens an der nächsten Seitengrenze nach 3 s.
- [ ] V0b-06b **Von Hand (ROLLE):** Takt 1 läuft, Zwei-Finger-Zoom (CDP-Touch) auf Takt 3 → `viewState().x0` bleibt über 2 Durchläufe gleich (auch wenn die Marke links aus dem Bild läuft), `reason = 'hand'`, Kopf „HÄLT · von Hand“; Tipp auf den Kopf → FOLGT, die Ansicht springt zur Abspielmarke. Ebenso nach waagrechtem Schieben. Nur ✎ Zeichnen gewählt, keine Geste: die Ansicht folgt.
- [ ] V0b-06c **Von Hand (LAUF und SCHRITTE):** Seite 2 von Hand gewählt, Wiedergabe in Seite 1 → Seite 2 bleibt über 3 Taktstriche stehen, der Lauf-Punkt wandert weiter; Editor schließen und öffnen → FOLGT.
- [ ] V0b-07 Tipp auf [⟶ FOLGT] → „AUS“; Ansicht bleibt stehen; der Lauf-Punkt in den Takt-Chips wandert weiter.
- [ ] V0b-08 Drum-Editor auf KICK, Pad SNARE antippen → SOUND und TIEF zeigen SNARE, SCHRITTE die Zeile SNARE; mit „Pad wählt Instrument: aus“ bleibt KICK.
- [ ] V0b-09 DOM-Textprüfung aller Editor-Seiten (Synth, FM, WT, Drum, FX), Menü, Browser: kein Etikett lautet genau „Pegel“; die Umbenennungen aus U-04 sind vorhanden.
- [ ] V0b-10 HALL-, ECHO- und MASTER-Seite im Sound-Editor zeigen das Band „GLOBAL · wirkt auf alle Spuren“.
- [ ] V0b-11 Neu ▾ [Leer (Init)]: 0 Clips, kein Song, Synth-Spuren INIT Analog (RMS bei C4 > −40 dBFS), Drums INIT (ev2: jedes Pad = WP6-`DEFAULTS` seines Modells, Pegel .85, Raum 0, Gate 0, keine Locks; jedes Pad RMS > −40 dBFS); dreimal Neu ergibt drei verschiedene Namen im Muster „Projekt · <Tag> <TT.MM.> <hh:mm>“.
- [ ] V0b-12 Editor ⋯ → Init (Synth: INIT der Engine; Drums: INIT-Kit ev2 wie V0b-11); ein Undo stellt den alten Sound deep-equal her.
- [ ] V0b-13 Verlauf je Projekt: Projekt A und B mit je 3 Sicherungen → „Ältere Versionen“ in A listet nur A-Einträge.
- [ ] V0b-14 Standard ist POSITION (neues Projekt und Bestand ohne Einstellung). POSITION: Tipp an der Oberkante einer weißen **und** einer schwarzen Taste 0,45 ± 0,05, an der Unterkante 1,0 ± 0,05. FEST: alle Live-Noten v = 0,8. Beide Stellungen werden unabhängig vom Standard geprüft.
- [ ] V0b-14b FEST eingestellt: FILTER-ANSCHLAG-Regler und eine Route `vel → cutoff` tragen den grauen Hinweis „Tastatur spielt fest 0,8 …“; Tipp darauf → POSITION, Hinweis weg; ein Undo.
- [ ] V0b-15 Harmonie-Popup zeigt „HALBTON“; die Daten bleiben `mode:'parallel'`.
- [ ] V0b-16 Regression und DoD; M-PLATZ für Browser, Editor-Köpfe mit FOLGT-Anzeige, Neu ▾, Init-Kategorie.

**Tests.** `v0b-lib.mjs`, `v0b-follow.mjs`, `v0b-ux.mjs`.

**Risiken.** FOLGEN berührt drei Editoren mit eigener Bildschleife; die 3-s-Regel darf das Lauflicht nicht verstecken. Umbenennungen können alte Tests treffen, die Texte suchen: Adaption mit Verweis auf U-04.

---

### V0c — Song-Sofortmaßnahmen

**Ziel.** Der WP6-Song verliert nichts mehr, man sieht, was aufgenommen wird, die Schleife ist erkennbar, Akkorde lassen sich von Hand setzen, die Melodie klingt nicht mehr abgehackt.

**Umfang.** §2.3 S-01 bis S-04; Akkord-Auswahl `ChordPick` (§4.5, ohne [♪ greifen] und [÷2]).

**Nicht-Umfang.** Teile, Kette, MELODIE-Spur (V2).

**Berührungspunkte.** `songRecStart`/`songRecBegin`/`songLog`, `songTick` (Schleifen-Bereich), Song-Ansicht (Transport, Lineal, Träger-Zeile, `svTap`), `newSongRaw`, `normSong` (Migration `loop`), Banner, `setMelodyTrack`-Vorschlag.

**Dauer** 4–5 h · **App-Version** 3.3.0 · **Größen-Budget** +30 KB.

**Abnahme-Checkliste**
- [ ] V0c-01 Vorhandener Song (2 Takte Lanes, 4 Melodie-Noten, Träger), Ziel nur AKKORDE, ● → F in Takt 2 und G in Takt 3 → Lanes deep-equal wie vorher, Melodie 4 Noten, Träger in Takt 2/3 ersetzt, übrige Einträge unverändert; ein Undo stellt den Song deep-equal her.
- [ ] V0c-02 Ziel nur MELODIE: Lanes und Träger deep-equal, neue Noten zusätzlich.
- [ ] V0c-03 Ziel SZENEN: Start von Spur 2 in Takt 3 → nur Lane 2 ab Takt 3 ersetzt, alle anderen Lanes deep-equal.
- [ ] V0c-04 Leerer Song: alle Ziele an; SG1–SG8 (WP6) bestehen.
- [ ] V0c-05 Banner enthält Ziele und Starttakt; ●-Chip zeigt „● AKK“ bzw. „● AKK+MEL“; vor dem Start steht „überschreibt …“.
- [ ] V0c-06 SCHLEIFE ist eine Text-Taste ≥ 44×36 px (P) mit Beschriftung; Bereich Takt 3–4 (`songLoopRange({on:true, a:2, b:4})`) → nach Takt 4 springt die Wiedergabe phasengleich an den Anfang von Takt 3 (M-ZEIT), 3 Durchläufe.
- [ ] V0c-07 Migration `loop:true` → `{on:true, a:0, b:bars}`; Wiedergabe identisch (`noteLog`). API unverändert: `songLoop(true) === true`, `songLoop(false) === false` (alte SG-Tests), der Bereich bleibt dabei stehen.
- [ ] V0c-08 TRÄGER-Zelle Takt 5 → Akkord-Auswahl, Text „Dm7“ → Träger-Eintrag bei Schlag 16 mit Grundton D, Art m7; Wiedergabe ruft ihn ab; ein Undo.
- [ ] V0c-09 `parseChord`: Am, A#m7, Bb (intl → B♭), B (de → B♭), H7 (de), C/E, Fmaj7, Gsus, Esus2, D5, F#m7b5, Cdim7, Eaug, C+, Am6, Cadd9 → richtige Ziele; „X7“ und „Am/Q“ → `null`.
- [ ] V0c-10 Vorschlag Melodie-Spur: Demo (Synth 1–3 mit Clips im Song, Synth 4 ohne) → Synth 4; Spur mit Clips und MONO-Klang → Hinweis-Toast mit [Freie Spur nehmen].
- [ ] V0c-11 Regression und DoD; M-PLATZ Song-Ansicht mit Ziele-Zeile und Schleifen-Band in P1–P3, L1, L2 (Zeilen ≥ 26 px wie WP6).

**Tests.** `v0c-song.mjs`, `v0c-chord.mjs`.

**Risiken.** Die Ziele-Zeile kostet 28–32 px in der schon engen Song-Ansicht (L): dort Transport-Spalte wie WP6 nutzen. Teilweises Ersetzen der Lanes darf `songOverride` nicht stören.

---

### V1a — Drum-Engine ev3

**Ziel.** Jedes Drum-Makro wirkt hörbar und bei jedem Anschlag gleich; FM der Kick wird zum Makro BISS; Klick ohne Auslöschung; Filter mit Resonanz je Schlag.

**Umfang.** §3.2 vollständig; §3.3 Makro-Abbildungen als Daten (Anhang B.2) mit `setDrumMacro`; die **bestehende** SOUND-Seite zeigt vorübergehend die 6 Typ-Makros (Interim bis V1b); KIT: Anschlag-Bereich (`kit.dynDb`), [Auf v3 umstellen]; neue Projekte und INIT-Kit ev3 (ersetzt das ev2-INIT-Kit aus V0b durch die Fassung aus Anhang A.2); Rom Pop als ev3-Fassung für neue Projekte (§3.6 Satz zu Rom Pop).

**Nicht-Umfang.** Kopf, TIEFE je Typ, ANSCHLAG-Seite (V1b); neue Kits, Synth-Pad (V1c); Locks (V5b).

**Berührungspunkte.** `DrumSynth.hit`, `DEFAULTS`, `MODELS`, `driveCurve`, Klick-Puffer, `drumHit`, `drumSet`/`drumChanged`, `pageDrumSound` (Interim), `pageDrumKit`, `SQStore.normDrum`, `DrumKits` (Rom Pop ev3), Test-API.

**Dauer** 4–5 h · **App-Version** 3.4.0 · **Größen-Budget** +40 KB.

**Abnahme-Checkliste**
- [ ] V1a-01 H-1 für alle Makros aller 10 Typen (INIT-Kit ev3, Anschlag 0,9); Messtabelle in CHANGES.
- [ ] V1a-02 H-2 für alle Makros.
- [ ] V1a-03 H-3 für alle Makros.
- [ ] V1a-04 H-4: M-HANDY von TON, PUNCH, BISS, DRIVE (Kick; Tom: TON, BEND, BISS) und TON (Snare) Minimum → Maximum ≥ +3 dB.
- [ ] V1a-05 BISS je ART (½, ×1, ×2, ×3, ×4) bei 0, ¼, ½, ¾, 1: Grundton-Band (frq ± ⅓ Okt) ≥ −2 dB gegenüber BISS 0; M-HANDY steigt stetig.
- [ ] V1a-06 H-5 für alle 12 Slots (Rom Pop ev3, DYN 12): Spanne 7,8 ± 1 dB; DYN 0 → ≤ 0,5 dB; DYN 24 → 15,6 ± 1 dB.
- [ ] V1a-07 Akzent bleibt ≥ +3 dB Spitze an Kick, Snare, HH zu, HH offen, Clap (T18) in ev3.
- [ ] V1a-08 H-6: VARIATION 0 → Bandstreuung ≤ 0,1 dB über 8 Schläge (HH zu, Clap, Snare); Standard-Variation ≤ 1 dB.
- [ ] V1a-09 H-7 für Kick, Tom, Snare über 8 Anschlagsstufen 0,30 … 1,0 ≥ −1 dB.
- [ ] V1a-10 H-9: BISS, PUNCH, KLICK, PEITSCHE, DRIVE ändern M-PEGEL höchstens ±3 dB.
- [ ] V1a-11 ev2 bitgleich: WP7-Demo (Rom Pop ev2) mit gleichem `Math.random`-Ersatz offline 4 Takte gerendert: max |Δ| ≤ 1e-6 gegenüber dem WP7-Snapshot.
- [ ] V1a-12 [Auf v3 umstellen]: `ev 3`, Kick-Klick ≠ Knock, ein Undo stellt die ev2-Daten deep-equal her.
- [ ] V1a-13 Alle neuen Slot- und Kit-Felder (§3.9) überleben Projektdatei, Neuladen und Kit-Sichern deep-equal.
- [ ] V1a-14 Schlag-Filter LP an der Snare: Cutoff 1 kHz → 12 kHz verschiebt M-SP ≥ 1 Okt; RESO 0 → 1 hebt das Band um den Cutoff ≥ 6 dB; M-PEGEL-Änderung durch RESO ≤ ±2 dB.
- [ ] V1a-15 DR1–DR9 bestehen (ev2-Kits unverändert, Rom Pop ev3 mit nachgestimmten Werten); T1–T18 bestehen.
- [ ] V1a-16 DR7: busy 16-Takt-Groove ev3 ≤ 7 % CPU, mit Filter an allen Pads ≤ 8 %.
- [ ] V1a-17 Regression und DoD.

**Tests.** `v1a-engine.mjs` (Node/Chromium-Offline mit `drumRender`, H-1…H-9), `v1a-compat.mjs` (11–13, 15).

**Risiken.** IMAX-Kurve `b^0,7` ungeprüft (H-3). Q-Semantik von LP/HP in Web Audio vorher prüfen (§3.2.5). Die Interims-SOUND-Seite darf nicht scrollen (6 Makros + MIX).

---

### V1b — Drum-Editor v3 (Oberfläche)

**Ziel.** Man sieht auf einen Blick, welches Instrument man bearbeitet; vorne nur seine typischen Regler; Tiefe nur mit seinen Schichten; jede Änderung ist zu hören.

**Umfang.** §3.4 vollständig, §3.5, Punkt-Display, ANSCHLAG-Seite, EXTREM, Perc-Charakter-Chips (Anhang B.6), Vorhören beim Loslassen, graue Regler mit Grund.

**Nicht-Umfang.** Neue Kits und Synth-Pad (V1c).

**Berührungspunkte.** `buildDrumEd` (Kopf ersetzt Kopfzeilen + LCD), `pageDrumSound` → `pageDrumKlang`, `pageDrumTief` (Schichten je Typ, `DLAYERS`), `drumAudition`, Pad-Treffer, `pageDrumKit`, Fit-Stufen (`fitBody`), Hilfe.

**Dauer** 4–5 h · **App-Version** 3.5.0 · **Größen-Budget** +60 KB.

**Abnahme-Checkliste**
- [ ] V1b-01 Kopf: Name 28 px in Pad-Farbe, Unterzeile „Typ · Kit · v3“; „TOM MITTE“ und „HH OFFEN“ nicht abgeschnitten in P1–P3, L1, L2.
- [ ] V1b-02 Pad-Tipp wechselt KLANG, TIEFE und SCHRITTE auf das Instrument (V0b-08 bleibt).
- [ ] V1b-03 ‹ › und Wischen über den Kopf wechseln das Instrument **stumm** (kein `noteLog`-Eintrag `preview`, Master-RMS < −70 dBFS bei stehendem Transport); ▶ im Kopf spielt es.
- [ ] V1b-03b Pad-Wahl beim Fingerdrumming: Während ● aufnimmt, wechselt ein Pad-Tipp das gezeigte Instrument nicht; zwei Tipps KICK → SNARE im Abstand 150 ms lassen KICK gewählt, im Abstand 400 ms wird SNARE gewählt.
- [ ] V1b-03c ART-Segmente zeigen die Wörter SUB, RUND, HOHL, HOLZ, KNALL (DOM-Text), der Faktor steht klein darunter.
- [ ] V1b-04 KLANG zeigt je Typ genau die 6 Makros und die Feinzeile aus §3.3 (10 Typen, DOM).
- [ ] V1b-05 Passstufen: P1 alle Zeilen; P2 MIX unter TIEFE › AUSGANG; P3 zusätzlich FILTER unter TIEFE › FILTER; L2 MIX unter TIEFE und Kopfzeile ohne ‹ › (Breite ≤ innerWidth, sonst Reiter-Kürzel); M-PLATZ (kein Körper-Scrollen, kein Überlauf der Kopfzeile) für 10 Typen × 5 Reiter in P1–P3, L1, L2, W.
- [ ] V1b-06 TIEFE zeigt nur die Schichten des Typs (Anhang B.3) plus ANSCHLAG und AUSGANG; [+ Schicht] blendet weitere ein; keine Seite > 10 Regler.
- [ ] V1b-07 Kick mit RAUSCHEN-Anteil 0: alle Rauschen-Regler grau mit „Schicht leise“ und bedienbar.
- [ ] V1b-08 Vorhören beim Loslassen (Transport steht, „Drehen = hören“ an): genau ein Schlag je Loslassen mit Anschlag 0,8; während des Ziehens höchstens einer je 300 ms; bei laufendem Transport oder „Drehen = hören“ aus keiner.
- [ ] V1b-09 Punkt-Display ändert sich nach TON-, PUNCH- oder DECAY-Änderung innerhalb ≤ 50 ms (Pixel-Differenz).
- [ ] V1b-10 EXTREM an HH zu: METALL-Bereich 0,25–4; EXTREM aus: gespeicherter Wert 3,5 bleibt, Knopf zeigt „▲ außen“; erste Bewegung klemmt.
- [ ] V1b-11 Perc-Charakter-Chips setzen die Werte aus Anhang B.6 deep-equal, ein Undo je Chip.
- [ ] V1b-12 ✎ erscheint nach einer Änderung; Tipp → Slot deep-equal Kit-Wert; ein Undo.
- [ ] V1b-13 H-8 Knack-Test für alle Makros der Kick, Snare, HH (Rom-Pop-Kick mit DECAY 1,1 s, 16tel-Hats).
- [ ] V1b-14 ANSCHLAG-Seite: Filter-Zuordnung 2 Okt → M-SP-Differenz zwischen Anschlag 0,35 und 1,0 ≥ 1 Okt; Zuordnung 0 → ≤ 0,1 Okt.
- [ ] V1b-15 Regression (T1–T18, DR*), DoD; Screenshots P1/L1 je Typ in `wp`-üblicher Ablage.

**Tests.** `v1b-ui.mjs` (CDP-Touch), `v1b-click.mjs` (H-8).

**Risiken.** Höhenbudget P2/P3 (Passstufen); der Kopf ersetzt v2-Kopfzeilen, alte UI-Tests suchen Elemente dort (Adaptionen mit Verweis §3.4).

---

### V1c — Kits „im Stil von“ und Synth-Pad

**Ziel.** Klassische Kit-Charaktere in der Bibliothek; ein Synth-Klang kann ein Drum-Pad sein.

**Umfang.** §3.6, §3.7, Anhang B.4.

**Nicht-Umfang.** Drum-Locks (V5b); Kit-Phrasen in der Bibliothek v3 (V10a).

**Berührungspunkte.** `DrumKits` (Kits, Alias `KIT_OLD`), `kits()`, `loadKit`, Browser (Kits), `drumHit` (Synth-Pad-Zweig), `SynthHost` (Knoten je Synth-Pad), `NativeVoice`, Pad-Strips, `panic`/`stop`, `normDrum` (`src`, `syn`).

**Dauer** 4–5 h · **App-Version** 3.6.0 · **Größen-Budget** +40 KB.

**Abnahme-Checkliste**
- [ ] V1c-01 `kits()` liefert die 9 Werks-Kits (§3.6); `loadKit('808')` lädt „Boom 80“, `loadKit('909')` „Hybrid 83“.
- [ ] V1c-02 DR1/PR8 für alle 9 Kits: kein NaN, kein DC > 0,005; Spitzen Kick −5…−7, Snare −1…−5, Hats −9…−14 dBFS; Toms innerhalb 2 dB.
- [ ] V1c-03 DR9 sinngemäß: Rom-Pop-Kick nach 220-Hz-HP ≥ 15 dB über der Boom-80-Kick (verfehlt ⇒ Messwert und Begründung in CHANGES; Boom 80 bleibt tief).
- [ ] V1c-04 Gespeichertes WP6-Projekt mit Kit „808“ klingt bitgleich (V1a-11-Verfahren).
- [ ] V1c-05 SNARE-Pad auf SYNTH (FM-Pluck, Note C3): Schritt löst aus, RMS > −40 dBFS; Pad-Pan ±1 → L/R-Differenz ≥ 6 dB.
- [ ] V1c-06 Grenzen: drittes Synth-Pad abgewiesen (Hinweis); 16tel-Wirbel auf 2 Synth-Pads mit Poly 2 → nie > 4 aktive Stimmen; Stimmenraub besteht M-KLICK.
- [ ] V1c-07 200 ms nach ■ bzw. Panik ist keine Synth-Pad-Stimme aktiv (`voices()`).
- [ ] V1c-08 TUNE-Lock +12 auf einem Synth-Pad-Schritt → Note C4 im `noteLog` (`src:'synpad'`).
- [ ] V1c-09 Synth-Pad folgt dem Träger nie (Am, F, ORIGINAL → gleiche Tonhöhe).
- [ ] V1c-10 Speichern/Laden mit Synth-Pad deep-equal; Ändern des Quell-Sounds in der Bibliothek ändert das Pad nicht.
- [ ] V1c-11 CPU: 2 FM-Synth-Pads (Poly 2) + Groove ≤ 12 % (Xeon).
- [ ] V1c-12 Regression und DoD (Kopf mit [DRUM│SYNTH], Synth-Pad-Seiten in allen Viewports).

**Tests.** `v1c-kits.mjs`, `v1c-synpad.mjs`.

**Risiken.** Ein Synth-Worklet-Knoten je Synth-Pad kostet Grundlast (v2 §1.3 nennt ≈ 9 % gemessenen Overhead je Worklet-Knoten) – Knoten erst beim ersten Schlag anlegen und nach 30 s Stille schlafen lassen. Umbenannte Kits treffen alte Tests (Alias).

---

### V2a — Spuren und Szenen (Format 4)

**Ziel.** Bis 8 Spuren (Standard 6 mit MELODIE), 8 Szenen, ohne dass etwas Bestehendes bricht; Matrix bleibt ohne Scrollen bedienbar.

**Umfang.** §4.2 (ohne Matrix-Gesten); Format 4 und Migration (§4.11, ohne Teile/Kette-Inhalte, aber mit den leeren Feldern); MELODIE-Spur als **Daten** (Index 5, `mel:true`, Klang „Melodie-Lead“; Verhalten V2b); Spurbank, Szenenbank („SZ 1–4│5–8“); Konstanten `NT()`, `NS()`, `isDrum()`; **Undo-Gruppen** `kind:'group'` (TA8, E3-33). Spurbank und Szenenbank bleiben hier, weil P2 ohne Spurbank nicht passt. MIDI-Export mit N Spuren wandert nach V2a′ (bis dahin exportiert MIDI nur Synth 1–4 und DRUMS, Hinweis im Export-Blatt).

**Nicht-Umfang.** Matrix-Gesten, Drum → Synth, MIDI-Export N Spuren (V2a′); MELODIE-Verhalten im Song (V2b), Teile (V2c).

**Berührungspunkte.** `undoPush`/`undoApply` (Art `group`), alle festen 4/5-Stellen (Audit H: 25× `< 5`, 22× `< 4`, 22× `tracks[4]`, 14× `clamp(…,0,3)`, 6× `[null×4]`), `newSynthTrack`/`newDrumTrack`/`DEFAULT_SOUNDS`, `defaultProject`, `demoProjectRaw` (Spuren ergänzen, Clips unverändert), `normalizeProject`/`SQStore` (Format 4), `buildGrid`/`renderGrid` (Banken), `R.pend`/`R.slot`/`R.cstart`/`songOverride` (Länge NT), `scheduleTrack`/`tick`, Spurfarben-Tokens, Menü Projekt ([＋ Spur]).

**Dauer** 4–5 h · **App-Version** 4.0.0 (Format 4) · **Größen-Budget** +45 KB.

**Abnahme-Checkliste**
- [ ] V2a-01 Neues Projekt: 6 Spuren in der Anzeige Synth 1–4, MELODIE, DRUMS; Datenindex DRUMS = 4, MELODIE = 5.
- [ ] V2a-02 WP7-Demo (Format 3) öffnen: alte Felder deep-equal (Clips, Sounds, Song), MELODIE angehängt, Szenen 5–8 leer; Offline-Render 4 Takte ≤ 0,5 dB je Band gegenüber WP7 (M-BAND); Speichern schreibt Format 4.
- [ ] V2a-03 Alte API-Aufrufe mit Index 4 treffen die Drum-Spur (`tapSlot(4,0)`, `pad()`, `setDrumParam`, `getSound(4).engine === 'drum'`).
- [ ] V2a-04 [＋ Spur] zweimal → 8 Spuren; drittes Mal abgewiesen (Hinweis); [Spur entfernen] Synth 6 (mit Clips und Song-Melodie) → **ein** Undo (`kind:'group'`) stellt Spur, Clips und `song.mel[7]` deep-equal her; Redo entfernt wieder; die Gruppe zählt als ein Schritt der 60.
- [ ] V2a-05 Clip in Szene 7 (API), ▶7 startet ihn am Taktstrich (M-ZEIT).
- [ ] V2a-06 Szenenbank P1: [5–8] zeigt Szenen 5–8; läuft Szene 2, zeigt der Umschalter einen Punkt.
- [ ] V2a-07 Spurbank P2: Seite 1 = Synth 1–4 + DRUMS, Seite 2 = MELODIE (+ Synth 5/6) + DRUMS; Reihen ≥ 40 px; L1/L2 Reihen ≥ 30 px; die Matrix scrollt nicht.
- [ ] V2a-08 Code: keine Literal-Schleifen `< 5`/`< 4` über Spuren/Szenen und kein `tracks[4]` mehr (grep-Liste mit begründeten Ausnahmen in CHANGES).
- [ ] V2a-09 SG1–SG8 bestehen mit 8 Spuren; `song.lanes.length === NT`.
- [ ] V2a-10 `tracks()` liefert `mel: true` nur für Index 5 und `role` getrennt (bis V7a `null`); WP6-Projekte ohne `mel` bekommen es nur durch die Migration.
- [ ] V2a-11 Hinweis bei ≥ 3 Spuren mit Poly ≥ 6 und Unison ≥ 5 erscheint genau einmal.
- [ ] V2a-12 PE1 und PE2 mit 8 Spuren (Demo + 3 belegte Zusatzspuren).
- [ ] V2a-13 Regression und DoD; M-PLATZ Matrix mit 6 und 8 Spuren und beiden Banken in allen Viewports.

**Tests.** `v2a-tracks.mjs`, `v2a-migrate.mjs`, `v2a-layout.mjs`.

**Risiken.** ≈ 80 Codestellen; versteckte Annahmen (z. B. Farben, Tastenkürzel, MIDI-Kanäle). Spurbank-Bedienung am iPhone ungeprüft. Gesamtlast bei 8 vollen Spuren (Begrenzer).

---

### V2a′ — Matrix-Gesten, Drum → Synth, MIDI mit N Spuren

**Ziel.** Clips per Finger verschieben, tauschen, kopieren und löschen ohne Menü (Runde 1 B3); ein Drum-Rhythmus wird zum Synth-Clip (B4); der MIDI-Export kennt alle Spuren.

**Umfang.** §4.2 Abschnitt „Matrix-Gesten“ (Anheben, Ziehen, Tauschen, Ablage-Leiste ⧉/✕, Verweise in Teilen), Drum → Synth-Blatt; MIDI-Export mit N Spuren und 8 Szenen (aus V2a).

**Nicht-Umfang.** Synth → Drum (später); Bearbeitungsmodus-Schalter wie GarageBand (nicht nötig, weil Halten + Ziehen eindeutig ist).

**Berührungspunkte.** Matrix-Zellen (`slotTap`, Halte-Erkennung, `openClipSheet` beim Loslassen ohne Bewegung), Gesten-Register `GEST`, Teil-Leisten-Fläche (Ablage-Leiste), Zwischenablage (`Drum- und Synth-Clips sind nicht austauschbar`, WP6 Z. 11479), `DRUM_GMS`, `buildMidi`, Undo (`group`).

**Dauer** 4 h · **App-Version** 4.1.0 · **Größen-Budget** +30 KB.

**Abnahme-Checkliste**
- [ ] V2a′-01 CDP-Touch: Clip 450 ms halten, ohne Bewegung loslassen → Clip-Blatt wie bisher (Regression WP2-Clip-Blatt-Tests).
- [ ] V2a′-02 Halten + Ziehen auf leeren Slot derselben Spur → verschoben (Quelle leer, Ziel deep-equal zur alten Quelle); auf belegten Slot → getauscht; ein Undo stellt beide Slots her.
- [ ] V2a′-03 Ziehen über ⧉ (≥ 250 ms), dann auf einen Slot → Kopie, Quelle unverändert; Ablegen auf ✕ → gelöscht, Toast mit [Rückgängig].
- [ ] V2a′-04 Während des Ziehens startet kein Clip (`noteLog` ohne Launch), die Matrix scrollt nicht; ein laufender verschobener Clip wechselt am nächsten Taktstrich (M-ZEIT).
- [ ] V2a′-05 Synth → Drum ist grau mit Grund; ein zweiter Finger ändert nichts (L4).
- [ ] V2a′-06 Drum → Synth, Modus „eine Tonhöhe“, nur KICK: Synth-Clip mit genau den Kick-Schritten auf dem Grundton der Szene, VEL und `o` übernommen; Modus „je Instrument eine Stufe“: KICK, SNARE, HH auf drei verschiedenen Stufen der Szenen-Tonart.
- [ ] V2a′-07 Verschiebt man einen Clip, den ein Teil benutzt (sobald V2c gebaut ist; hier über die Daten-API vorbereitet): Teil-Slot zeigt auf die neue Szene.
- [ ] V2a′-08 MIDI-Export „Alle Szenen“ mit 8 Szenen und 8 Spuren: Spuren in Anzeige-Reihenfolge, Drums auf Kanal 10.
- [ ] V2a′-09 Regression und DoD; M-PLATZ der Ablage-Leiste in allen Viewports.

**Tests.** `v2a2-matrix.mjs` (CDP-Touch), `v2a2-midi.mjs`.

**Risiken.** Halten-Erkennung kollidiert mit dem Clip-Start beim Berühren: Clips starten heute beim Tipp (Loslassen), nicht beim Berühren – im Code prüfen und in CHANGES nennen. Am iPhone ungetestete Haptik.

---

### V2b — MELODIE-Spur und Song-Melodie je Spur

**Ziel.** Die Melodie hat eigene Stimmen, klingt nicht mehr „eigenartig“ und folgt standardmäßig nicht.

**Umfang.** §4.3; Migration `song.melody` → `song.mel[t]`; Song-Ansicht MELODIE-Zeile je gewählter Melodie-Spur (Chip [MEL: Melodie ▾]); ● SONG/● MEL. mit Standard-Spur MELODIE; Melodie → Clip auf jeder Spur; Test-API `songMelNotes(t)` (neu; `songMel(on)` bleibt die Aufnahme-Funktion aus WP6, I-04).

**Nicht-Umfang.** Teile, Kette.

**Berührungspunkte.** `songTick` (Melodie-Schleife je Spur), `songRecBegin`/Live-Noten, `setMelodyTrack`, Song-Ansicht, Melodie-Rolle (`openMelody`), `melodyToClip`, `normSong`, Folge-Logik (`follow:false`).

**Dauer** 3–4 h · **App-Version** 4.2.0 · **Größen-Budget** +25 KB.

**Abnahme-Checkliste**
- [ ] V2b-01 MELODIE-Spur: Klang „Melodie-Lead“ (Poly 4, Glide 0, Modus POLY), ⇅ fest.
- [ ] V2b-02 Clip auf MELODIE unter Am, F, ORIGINAL → gleiche Tonhöhen; ⇅ auf „folgt“ → Tonhöhen folgen.
- [ ] V2b-03 WP6-Song mit `melodyTrack 3`, 4 Noten → `song.mel[3]` mit 4 Noten; Wiedergabe gleiche Tonhöhen und Schläge (M-ZEIT ±0,01).
- [ ] V2b-04 Gehaltene Song-Melodie-Note G♯5 auf MELODIE, gleichzeitig MONO-Clip auf Synth 4: Goertzel-Pegel von G♯5 bleibt 2 s lang ≥ −40 dBFS (Audit-Befund behoben).
- [ ] V2b-05 Song-Melodie auf zwei Spuren (MELODIE und Synth 2): beide erklingen (`noteLog` `src:'melody'` mit beiden Spuren).
- [ ] V2b-06 ● SONG schlägt MELODIE vor; Live-Noten landen in `song.mel[5]` (`songMelNotes(5)`); `songMel(true)`/`songMel(false)` starten und beenden die Aufnahme wie in WP6 (alte SG-Tests unverändert).
- [ ] V2b-07 Melodie → Clip von MELODIE → Clip auf Spur 5 im ersten freien Slot.
- [ ] V2b-08 Regression und DoD.

**Tests.** `v2b-mel.mjs`.

**Risiken.** Alte Tests erwarten `song.melody`: lesender Alias (`song.melody` als Getter auf `mel[melodyTrack]`) bis v3-Ende.

---

### V2c — Teile, Akkord-Zeilen, Teil-Leiste

**Ziel.** Part-Tasten live wie ein Looper-Pedal; Registrierungen aus Clips verschiedener Szenen; Akkorde direkt an Szene und Teil, von Hand, ohne Aufnahme.

**Umfang.** §4.4 (inkl. Teil-Transposition `xp.semi` nach der Abbildung, `R.xp`; Teil-Leiste auch in der WP6-Song-Ansicht an derselben Stelle), §4.5 (vollständig: [♪ greifen], [÷2], ‹ Szene ›, Zeile „Zuletzt“, Stufen-Chip „V (Dur)“ in Moll, [Frei ▾]), §4.6 (TA1–TA4, TA8); Akkord-Zeilen-Wiedergabe (`R.row`, `T.recall(…, null)`); Teil-Leiste statt Hinweis-Kasten (Hinweise → Hilfe).

**Nicht-Umfang.** Eine Skala (V2c′); FANG TEIL, Kette (V2d); Aufnahme-Ziele über die Kette (V2d′); Song-Ansicht (V2e); Teil-Klang (V6b).

**Berührungspunkte.** Hinweis-Kasten (`hintBox`) → Teil-Leiste, Teil-Blatt, Matrix-Auswahlmodus (`slotTap`-Zweig), `tick` (Teil-Start, Akkord-Zeilen-Recalls über `T.recall(tg, b2t(beat), null)`), Ausgangstonhöhe (`+ R.xp` nach der Abbildung, nur ⇅ folgt), Träger-Anzeige (Tipp → Akkord-Zeilen-Blatt), `popHistory` (Verlauf wandert ins Blatt), `ChordPick`, `normalizeProject`, Undo `kind:'part'`, Hilfe.

**Dauer** 5 h · **App-Version** 4.3.0 · **Größen-Budget** +60 KB.

**Abnahme-Checkliste**
- [ ] V2c-01 Teil-Leiste ersetzt den Hinweis-Kasten: P1 Höhe 40 px, 4 Tasten + **eine** Umschalt-Taste 44 px (●○), Tasten ≥ 72 px breit (P3 ≥ 60 px); Gesamtbreite ≤ `innerWidth` in P1–P3; L im Seitenfeld ≥ 36 px hoch. Beim Wechsel CLIPS ⇄ SONG bleibt sie an derselben Stelle (Position ±2 px).
- [ ] V2c-02 [＋] bei laufender Szene 1 mit gelatchtem Am: Teil mit `slots` = Spalte 1 (Spuren ohne Clip = aus), Akkord-Zeile 1 Takt „Am“, Name gewählt; ein Undo.
- [ ] V2c-03 Teil-Tipp: Start am nächsten Taktstrich (M-ZEIT ±0,002), Clips mit Phase 0; LED blinkt bis zum Start, dann leuchtet sie (DOM-Klassen).
- [ ] V2c-04 „am Teil-Ende“: Start erst am Ende des laufenden Teils.
- [ ] V2c-05 Teil-Blatt → [In der Matrix wählen] → 4 Tipps (DR Sz3, S1 Sz1, S3 Sz4, S2 Sz2) → `slots` wie erwartet; in diesem Modus startet kein Clip (`noteLog` ohne Starts).
- [ ] V2c-06 „bleibt“: laufender Clip läuft ohne Neustart weiter (kein Schnitt im `noteLog`); „aus“: Spur stoppt am Taktstrich.
- [ ] V2c-07 Akkord-Zeile an Szene 2 „Am F C G“ (Stufen-Chips): ▶2 → Recalls bei 0, 4, 8, 12 Schlägen nach dem Szenenstart, zwei Durchläufe im Kreis.
- [ ] V2c-08 [÷2]: zwei Akkorde in einem Takt → Recalls bei 0 und 2 – auch mit Harmonie-Einstellung „Wechsel: am Takt“ (Recall-Schlag unverändert, `T.recall(…, null)`).
- [ ] V2c-09 [♪ greifen]: C-E-G auf der Tastatur → Kästchen „C“, Fokus springt weiter.
- [ ] V2c-10 TA1: laufende Akkord-Zeile, Hand-Taste in TRANSPONIEREN → Hand gilt sofort, [↩ TEIL] sichtbar; Tipp → ab nächstem Takt wieder die Zeile.
- [ ] V2c-11 Teil mit Transposition +2 (`xp.semi`): alle Synth-Spuren mit ⇅ folgt klingen exakt +2 HT (`noteLog`, auch im Standard `single:'key'`), MELODIE (⇅ fest), Synth-Pads und Drums unverändert; der Träger-Verlauf zeigt keinen neuen Eintrag.
- [ ] V2c-11b Akkord-Zeilen-Blatt: ‹ › blättert zu Szene 3, ohne sie zu starten (`noteLog` ohne Launch); Akkord dort gesetzt → `chordRow('S3')`; Zeile „Zuletzt“ zeigt die letzten gespielten Akkorde, Tipp ohne gewähltes Kästchen ruft ihn ab (wie `popHistory`); in a-Moll gibt es den Chip „V“ = E-Dur; [Frei ▾] ersetzt die unteren Zeilen in gleicher Höhe; Blatthöhe P1 ≤ 216 px.
- [ ] V2c-12 Teile und Akkord-Zeilen überleben Speichern/Laden, Clip-Kopieren und Undo/Redo deep-equal.
- [ ] V2c-13 Regression (K1–K10, T-Tests der Harmonie), DoD; M-PLATZ für Teil-Leiste, Teil-Blatt, Akkord-Zeilen-Blatt in allen Viewports.

**Tests.** `v2c-parts.mjs`, `v2c-chords.mjs`.

**Risiken.** Mehrere Träger-Quellen gleichzeitig (Rangfolge TA1 eigens testen). Teil-Leiste im Querformat (Seitenfeld) knapp.

---

### V2c′ — Eine Skala

**Ziel.** Clips klingen unter wechselnden Akkord-Zeilen nicht mehr schief (e-Moll-Clip unter C wird nicht mehr C-Lydisch). Runde-2-Entscheidung E1 Punkt (1), von Xander bestätigt.

**Umfang.** E3-25: nach der Stufen-Umrechnung des Harmonie-Kerns wird jeder Ton in die Zielskala gezogen (nächster Skalenton, bei Gleichstand tiefer). Schalter Menü → Harmonie „Eine Skala“ (Standard an für neue Projekte; fehlt `settings.harmony.oneScale`, gilt aus – gespeicherte Projekte und die Demo klingen gleich, I-10). Die Live-Abbildung, die Offline-Abbildung der Song-Tonart (V2f) und die Anzeige leuchtender Tasten nutzen dieselbe Funktion. I-01 ist **nur** für diese Ergänzung geöffnet.

**Nicht-Umfang.** Folgeart nach Rolle, Profi-Menü, Single Finger, „Fremde Akkorde: Tonart behalten“ (§18).

**Berührungspunkte.** `Harmony`/`Transposer` (Abbildungsfunktion, `mapNote`), `settings.harmony`, Menü → Harmonie, Hilfe-Text, `normalizeProject` (fehlendes Feld = aus).

**Dauer** 3–4 h · **App-Version** 4.4.0 · **Größen-Budget** +20 KB.

**Abnahme-Checkliste**
- [ ] V2c′-01 e-Moll-Clip (E G H D F♯) unter Taste C (AKKORD) mit „Eine Skala“ an: kein F♯ im `noteLog`, alle Töne in C-Dur; aus: Verhalten bitgleich wie WP7 (C-Lydisch).
- [ ] V2c′-02 Gleichstand-Regel: ein Ton genau zwischen zwei Skalentönen wird nach unten gezogen.
- [ ] V2c′-03 Leiter-eigene Clips ändern sich nicht (Tonart-gleiche Fälle aus den Harmonie-T-Tests: identische `noteLog`-Tonhöhen).
- [ ] V2c′-04 Schalter aus = bitgleich zu WP7 über alle Harmonie-T-Tests (K1–K10); WP7-Projekt öffnen → Schalter aus; Neu → an.
- [ ] V2c′-05 Leuchtende Tasten und Song-Tonart-Erkennung (falls schon gebaut) nutzen dieselbe Abbildung (Stichprobe 20 Töne).
- [ ] V2c′-06 Regression und DoD.

**Tests.** `v2c2-onescale.mjs`.

**Risiken.** Harmonie-Kern ist I-01-geschützt: Änderung nur hinter dem Schalter; „E-Dur in a-Moll“ ändert sich dadurch **nicht** (das ist Punkt 4 von E1, erst nach Hörtest).

---

### V2d — FANG TEIL und Kette (Daten und Wiedergabe)

**Ziel.** Teile entstehen beim Spielen; das Blatt fragt Teil/Name/Ort mit gesetzten Vorschlägen; die Kette spielt.

**Umfang.** §4.7 (Phrasen-Grenzen, Periode vom Ende her, Mini-Zeitleiste, Länge-Chips [1][2][4][8][16], Vorschlag = benannter Teil, FANG TEIL beendet die Hand); `S.chain`-Daten, `flattenChain` mit Neustart-Einträgen `re:1` und `song.xp`, Wiedergabe der Kette über `songTick` (§4.9 Abschnitt „Abflachen“); `R.mem`, `CAPC`; Test-API `songFromChain` ab hier als Kette; die WP6-Song-Ansicht zeigt das Abgeflachte (nur lesend) bis V2e.

**Nicht-Umfang.** Aufnahme-Ziele über die Kette (V2d′); neue Song-Ansicht und Ketten-Bearbeitung (V2e); Song-Tonart (V2f).

**Berührungspunkte.** FANG-Platz (Beschriftung je Modus), `capture` (Notenweg unverändert), `T.onCommit` (CAPC), `tick` (Gedächtnis je Takt), FANG-Blatt, `flattenChain` (neu, **nicht** über `logLaunch`), `RecHelpers.eventsIn` (liefert `re`-Einträge), `songTick` (`re`, `xp`), Hand-Ende (wie [↩ TEIL]), ♪-SPIELEN-Blinken, Undo `group`.

**Dauer** 4–5 h · **App-Version** 4.5.0 · **Größen-Budget** +30 KB.

**Abnahme-Checkliste**
- [ ] V2d-01 FANG-Platz: in SPIELEN „FANG“, in TRANSPONIEREN „FANG TEIL“; leuchtet nach Akkord-/Szenenwechseln seit dem letzten Grenzpunkt (§4.7).
- [ ] V2d-02 Szene 1 läuft, ⇅ gehalten Am–F–C–G je Takt, zwei Durchläufe, FANG TEIL → `fangPart()`: 4 Takte, Akkorde Am F C G, Slots = Szene 1, Vorschlag **„Strophe“** (benannter Teil), `sceneAlt = 1`; Kreis startet am nächsten Takt (Recalls). [Übernehmen] → Teil STROPHE auf der Teil-Leiste, Kette [Strophe]. Mit [an Szene 1 hängen] stattdessen: Akkord-Zeile an Szene 1, kein Teil.
- [ ] V2d-03 Periode: Am F Am F über 4 Takte → Länge 2.
- [ ] V2d-03b Durchspielen wie mit Looper: Am F C G ×2, **direkt** danach F G C C ×2 → Vorschlag 4 Takte F G C C (nicht 16 Takte); Länge-Chip [8] nimmt die letzten 8 Takte (F G C C F G C C); Tipp auf Kästchen 5 der Mini-Zeitleiste verschiebt den Anfang dorthin.
- [ ] V2d-03c ▶2 (Szenenstart) und Teil-Tipp sind Grenzen: Am F C G auf Szene 1, ▶2, dann F G Am Am → die Phrase beginnt nach ▶2.
- [ ] V2d-04 Wechsel bei Schlag 3,8 zählt auf Takt 2 (Schlag 4).
- [ ] V2d-05 [Übernehmen] „ans Ende ×2“: Kette +1 Stelle mit `rep 2`, Teil auf der Teil-Leiste; **ein** Undo (`group`) stellt Teile, Kette und Ketten-Melodie deep-equal her.
- [ ] V2d-05b FANG TEIL bei gelatchter Hand: die Hand endet, der Kreis ist hörbar (Recalls der Teil-Akkorde). War TRANSPONIEREN eingerastet: Modus bleibt, ♪ SPIELEN blinkt 2 s, LCD „Zum Drüberspielen ♪ SPIELEN“.
- [ ] V2d-06 Einfügen mitten in [A, B] → [A, neu, B]; Melodie-Noten von B wandern mit (absolute Schläge + Länge des neuen Teils).
- [ ] V2d-07 Ersetzen (⟳) eines Teils mit 2 Stellen: beide spielen die neuen Akkorde; Toast nennt „2 Stellen“.
- [ ] V2d-08 [Verwerfen]: Kreis endet am nächsten Takt, Daten unverändert.
- [ ] V2d-09 Neustart je Stelle: Kette [A, A] mit einem 3-Takt-Clip in einem 4-Takt-Teil → Clip startet bei Takt 1 **und** Takt 5 mit Phase 0 (`noteLog`); Teile A und B mit demselben Clip hintereinander ebenso; Spur „bleibt“ → kein Neustart.
- [ ] V2d-10 Teil mit `xp.semi +2` in der Kette: `song.xp` enthält den Eintrag am Stellenanfang; Wiedergabe +2 HT nur auf ⇅-folgenden Synth-Spuren.
- [ ] V2d-13 CAPC hält Träger-Wechsel älter als 10 s.
- [ ] V2d-14 Kette 64 Stellen: `flatten()` ≤ 5 ms (Xeon); Wiedergabe der abgeflachten Kette = `noteLog`-Soll (Launch-Schläge inkl. `cs`, Träger, Melodie).
- [ ] V2d-15 Regression (FG1/FG2 unverändert, SG1–SG8 für Mitschnitte; Mitschnitt-Lanes ohne `re` spielen wie WP6), DoD; M-PLATZ FANG-Blatt (≈ 270 px) in allen Viewports.

**Tests.** `v2d-fang.mjs`, `v2d-chain.mjs`.

**Risiken.** Phrasenerkennung rät die Länge falsch (Gegenmittel: Mini-Zeitleiste, Länge-Chips, Undo; Hörtest mit Xanders Spiel). Abflachen bei jeder Änderung: nur ab dem nächsten Takt wirksam machen.

---

### V2d′ — Aufnahme-Ziele über die Kette

**Ziel.** Akkorde über eine fertige Kette spielen, ohne andere Stellen zu verändern; Teile und Melodie in einem Durchgang aufnehmen.

**Umfang.** §4.8 vollständig ([SZENEN] → [TEILE]); AKKORDE über die Kette als ABWEICHUNG (E3-36) mit Toast [Für alle …]; TEILE schreibt die Kette fort; MELODIE stellen-relativ (`items[k].mel[t].notes`); alle drei zusammen.

**Nicht-Umfang.** Song-Ansicht (V2e).

**Berührungspunkte.** Aufnahme-Ziele, `songRecStart`/`songRecBegin`, `CAPC`, Teil-Tasten während ●, `S.chain` (`alt.chords`), Toast, Undo `group`, Gehört-minus-shift-Weg (vorbereitet für V2f).

**Dauer** 4 h · **App-Version** 4.6.0 · **Größen-Budget** +25 KB.

**Abnahme-Checkliste**
- [ ] V2d′-01 Ziel AKKORDE bei laufender Kette [Strophe ×2, Refrain, Strophe], Akkorde nur über die **letzte** Strophe → nur `items[3].alt.chords` gesetzt; Teil STROPHE und die erste Stelle unverändert (deep-equal, Render der ersten Stelle gleich). Toast „… an 1 Stelle · [Für alle Strophen] [Rückgängig]“; [Für alle Strophen] → Teil geändert, `alt.chords` weg; ein Undo.
- [ ] V2d′-02 Kommt ein Teil nur einmal vor oder lagen alle seine Stellen im Bereich → die Akkorde gehen direkt in seine Akkord-Zeile (kein `alt`).
- [ ] V2d′-03 Ziel TEILE: Teil-Tasten A, A, B während der Aufnahme → Kette [A ×2, B]; manuelle Clip-Starts → neuer Teil „Teil n“.
- [ ] V2d′-04 Ziel MELODIE bei laufender Kette: Noten stellen-relativ gespeichert (`items[k].mel[5].notes`); Wiedergabe an denselben absoluten Schlägen (M-ZEIT ±0,01).
- [ ] V2d′-05 Alle drei Ziele, 8 Takte: Kette, Akkorde und Melodie konsistent (`flatten()` gegen Mitschrift); **ein** Undo (`group`).
- [ ] V2d′-06 Live ohne Kette: Akkorde landen in der Akkord-Zeile der laufenden Szene; je Takt gewinnt der jüngste Durchgang.
- [ ] V2d′-07 Regression (V0c-01…05 mit [TEILE] statt [SZENEN]), DoD.

**Tests.** `v2d2-rec.mjs`.

**Risiken.** Zwei Durchgänge über dieselbe Stelle (Schleife): je Takt gewinnt der jüngste; Abweichung und Teil-Akkorde dürfen sich nicht mischen (Test mit SCHLEIFE Teil).

---

### V2e — Song-Ansicht mit Kette

**Ziel.** Der Song ist eine sichtbare, einfach bearbeitbare Folge von Teilen mit Akkorden und Melodie darüber; WP6-Mitschnitte bleiben spielbar und lassen sich zerlegen.

**Umfang.** §4.9 (Oberfläche mit Teil-Leiste an fester Stelle, Stellen-Blatt mit [Nur hier ändern], ⊙, AKK./MEL./Spuren ▸, SCHLEIFE Teil/Bereich, Mitschnitt + [In Teile zerlegen] mit Phase-erhalten-Regel und Ereignis-Prüfung, Song-MIDI mit Markern), TA3, TA5; Undo-Art `proj` für [In Teile zerlegen].

**Nicht-Umfang.** Song-Tonart (V2f).

**Berührungspunkte.** Song-Ansicht (Canvas, Gesten aus WP6), `svTap`, Stellen-Blatt, `flattenChain`, `splitRecording`, `buildMidi` (Song, Marker), Undo.

**Dauer** 5 h · **App-Version** 4.7.0 · **Größen-Budget** +60 KB.

**Abnahme-Checkliste**
- [ ] V2e-01 Zeilen TEIL/AKK./MEL./Spuren ▸ mit den Höhen aus §4.9 (P1, Song-Ansicht 343 px) bzw. L-Höhen; die **Teil-Leiste** ist in der Song-Ansicht sichtbar und bedienbar (Teil-Tipp springt bei laufender Kette zur nächsten Stelle dieses Teils) und steht an derselben Stelle wie in der Clip-Ansicht (±2 px); M-PLATZ in allen Viewports für Song-Ansicht + Teil-Leiste.
- [ ] V2e-02 40-px-Zug scrollt ohne Änderung (deep-equal, kein Undo); sauberer Tipp auf einen Block öffnet das Stellen-Blatt.
- [ ] V2e-03 Stellen-Blatt: ×n ändert `rep` und die Songlänge; [◀][▶] verschiebt; [Löschen] entfernt, der Rest rückt, Melodie wandert mit (TA5); je ein Undo.
- [ ] V2e-04 ⊙ → Liste aller Teile inklusive Szenen; Einfügen ×1.
- [ ] V2e-05 AKK.-Tipp → Akkord-Auswahl ändert den Teil an allen Stellen; [Nur hier ändern] → nur diese Stelle (`alt.chords`, Block zeigt Teil′). Kein sichtbares Etikett heißt „Variante“ für Kettenstellen (DOM-Prüfung).
- [ ] V2e-06 Spuren ▸: Zellen-Tipp setzt `alt.slots` nur an dieser Stelle (Punkt „Abweichung“); Wiedergabe spielt die Abweichung nur dort.
- [ ] V2e-07 SCHLEIFE Teil wiederholt die laufende Stelle; Bereich wie V0c-06.
- [ ] V2e-08 WP6-Mitschnitt spielt unverändert (SG2); [In Teile zerlegen] → Kette, deren Wiedergabe dieselben **Abspiel-Ereignisse** liefert wie der Mitschnitt (Launch-Schläge je Spur inkl. `cs`, Träger-Abrufe, Melodie-Noten; M-ZEIT) – geprüft auch an einem Mitschnitt, in dem ein Clip über eine Abschnittsgrenze durchläuft (dort `alt.slots = null`, kein Neustart); nicht verlustfrei zerlegbarer Testfall → Abbruch mit Meldung, Daten unverändert; ein Undo (`proj`).
- [ ] V2e-09 Song-MIDI der Kette: Marker (FF 06) mit Teilnamen an den Stellenanfängen; Noten = abgeflachte Wiedergabe.
- [ ] V2e-10 Leere Kette zeigt den Hinweis und ⊙.
- [ ] V2e-11 Regression und DoD.

**Tests.** `v2e-songview.mjs`, `v2e-split.mjs`.

**Risiken.** Canvas-Gesten (Zug vs. Tipp) am iPhone; Zerlegen von Mitschnitten mit Übernahmen (`songOverride`) – Testfälle aus SG3.

---

### V2f — Song-Tonart und Verschieben

**Ziel.** Die App zeigt die Tonart des ganzen Songs; der ganze Song lässt sich um wenige Halbtöne verschieben, Intervalle bleiben exakt.

**Umfang.** §4.10; K-10-Rückfall auf Song-Tonart.

**Nicht-Umfang.** Rückung je Teil und das übrige Harmonie-Paket (§18); „Eine Skala“ ist V2c′.

**Berührungspunkte.** `KeyDetect`, Abflachen, Ausgangstonhöhe (nach `T.mapEvent`, `+ S.shift + R.xp`), Live-Eingabe (`inputDown`), **alle Aufnahme-Wege** mit „gehört − shift“: REC/Overdub (`recNoteOn`, `commitRecNote`), FANG (`CAP.open`/`capture`), Song-Melodie (`melNoteOn`), ROLLE-Schritt-Eingabe (`stepInput`), LAUF ● SCHRITT (Stift-Ton), [♪ greifen]; Anzeigen (Träger, Szenen-Tonart, Akkordnamen, Song-Kopf), [Fest anwenden] (Undo `proj`).

**Dauer** 3 h · **App-Version** 4.8.0 · **Größen-Budget** +20 KB.

**Abnahme-Checkliste**
- [ ] V2f-01 Test-Kette (Teil 1 Am F C G, Teil 2 F G Am Am, Bass betont A) → „a-Moll“, Sicherheit ≥ 60 %; Anzeige im Song-Kopf und je Block.
- [ ] V2f-02 Melodie-Passung in % angezeigt; leiterfremde Melodietöne in der Melodie-Rolle amber.
- [ ] V2f-03 [+][+] → „a-Moll → h-Moll (+2)“; ab dem nächsten Takt alle Synth-Noten +2 HT (`noteLog`), Drums unverändert; eine gehaltene Note behält ihre Grundfrequenz bis zum Ende (±1 ct); M-KLICK besteht.
- [ ] V2f-04 Tastatur mitverschieben (shift +2): Live-Taste C4 klingt D4; gespeichert wird C4 – geprüft für REC/Overdub, FANG, ● MEL. (Song-Melodie), ROLLE-Schritt-Eingabe und ● SCHRITT; danach shift 0 → alles klingt C4 (keine doppelte Verschiebung).
- [ ] V2f-05 [Fest anwenden]: Render 4 Takte vorher (shift 2) gegen nachher (shift 0, Daten +2) ≤ 0,5 dB je Band; ein Undo (`proj`) stellt alle Daten deep-equal her.
- [ ] V2f-06 Leere Szene zeigt die Song-Tonart.
- [ ] V2f-07 Regression und DoD.

**Tests.** `v2f-key.mjs`.

**Risiken.** Tonart-Erkennung über abgebildete Töne ist neu (Offline-Abbildung muss mit der Live-Abbildung übereinstimmen: Testfall Am/F).

---

### V7a — Mischung in drei Ebenen und MIX-Blick (vorgezogen nach V2f, E3-32)

**Ziel.** Ein Ort je Regler; die Mischung bleibt beim Soundwechsel; alle Spuren nebeneinander.

**Umfang.** §8.1–8.3 (Drive-Ausgleich in der Klang-FX-Kette, Drum-Editor-Reiter FX nur noch Kit-Effekte + Link; keine `st.fx`-Migration, weil Klangzustände erst mit V6a kommen).

**Nicht-Umfang.** Master-Worklet und Kontext-Master (V7b–V7d); dynamischer EQ (§18).

**Berührungspunkte.** `applySound`, `applyChainFx` (Drive-Ausgleich als eigener Gain nach dem Shaper), `pageFx`/`pageFxSpur`/`pageFxMaster`, Drum-Editor FX-Reiter, `setTrackFx`, `sKnob('fx.*')`, Spurkette (`buildTrack`), `SQStore.normFx`, `newSynthTrack`/`newDrumTrack`, Spurleiste ([MIX]), Menü → Mischen, Kopfleiste L (Chip), Menü › Klang, Kit-Mischer, Undo `kind:'mix'`.

**Dauer** 5 h · **App-Version** 4.9.0 · **Größen-Budget** +50 KB.

**Abnahme-Checkliste**
- [ ] V7a-01 Soundwechsel mit `touched=true`: `track.mix` deep-equal vorher/nachher; mit `touched=false` wird die Send-Empfehlung übernommen und der Toast erscheint.
- [ ] V7a-02 Migration eines WP-Projekts: Ausgangspegel je solo gespielter Spur ±0,1 dB gegenüber vorher (Master-RMS) – ausdrücklich auch für eine Spur mit Drive 0,5 (Drive-Ausgleich jetzt in der Klang-FX-Kette).
- [ ] V7a-03 MIX: P1 8 Züge à 44–46 px sichtbar (Summe ≤ `innerWidth`), P2 8 × 44; P3 mit Seiten; L1 eine Reihe; M und S je volle Zugbreite × 36 px (Trefferflächen-Prüfung L4); M-PLATZ.
- [ ] V7a-04 Fader −6 dB → Spur-RMS am Master −6 ± 0,5 dB (Glue für den Test aus), mit Drive 0 **und** Drive 0,5.
- [ ] V7a-05 Kit-Mischer-Fader = Pad-Pegel im Drum-Editor (gleicher Wert, ein Undo).
- [ ] V7a-06 Sound-Editor ohne HALL/ECHO/MASTER-Seiten; „Mischung dieser Spur ↗“ öffnet MIX auf dieser Spur.
- [ ] V7a-07 FX1–FX10 (WP4) bestehen über die Kompatibilität von `setTrackFx`/`getSound().fx`.
- [ ] V7a-08 Spur-Hochpass 150 Hz senkt Energie < 100 Hz um ≥ 12 dB; [Mix zurücksetzen] = ein Undo.
- [ ] V7a-09 Metronom ♩ bleibt in der Kopfleiste (P und L, ein Tipp); [MIX] in der Spurleiste öffnet den MIX mit dem Zug dieser Spur markiert; Spurleiste in P1–P3 ohne Überlauf (M-PLATZ).
- [ ] V7a-09b Drum-Editor-Reiter FX zeigt nur Kit-Raum/Kit-Gate und den Link „Mischung dieser Spur ↗“.
- [ ] V7a-10 Regression und DoD.

**Tests.** `v7a-mix.mjs`, `v7a-migrate.mjs`.

**Risiken.** Viele alte Tests lesen `sound.fx.vol`: Getter-Kompatibilität; Spurleiste P3 (sechster Knopf, Name kürzt sich).

---

### V3a — Taktleiste und Takt-Aktionen

**Ziel.** Takte antippen, markieren, tauschen, verschieben, kopieren, löschen, leeren; Clip als MIDI.

**Umfang.** §5.2 (Hinsehen/Markieren getrennt, [ALLE], Aktionsleiste statt Werkzeugleiste, Längen-Sperre B2); Clip als MIDI (§5.3 letzter Absatz) mit `deliverNow`-Absicherung (ZIP-Arten, UTF-8-Flag, ASCII-Namen); FANG-Toast [Bearbeiten] [Rückgängig].

**Nicht-Umfang.** Drehen, Spiegeln, Rückwärts, Dehnen, Varianten (V3b); LAUF+ (V3c).

**Berührungspunkte.** PianoRoll-Lineal (`rulerTap`, Auswahl `E.loop`), PianoRoll-Längen-Zone (B2), ROLLE-Werkzeugleiste, LAUF-Seitenwahl, Drum-SCHRITTE-Seitenwahl (`barPager`) und Funktionszeile, Aktionsleiste, FOLGEN (Chip-Tipp = HÄLT „von Hand“), `normNoteExtras`, `afterClipEdit`, `buildMidi` (Einzel-Clip), `deliverNow`/`buildZip`, Clip-Blatt.

**Dauer** 4–5 h · **App-Version** 4.10.0 · **Größen-Budget** +45 KB.

**Abnahme-Checkliste**
- [ ] V3a-01 Taktleiste in ROLLE, LAUF, SCHRITTE; ersetzt in LAUF/SCHRITTE die Seitenwahl; 16 Takte in P3 ohne Überlauf (zwei Zeilen).
- [ ] V3a-02 Takt 2 einmal tippen → Ansicht zeigt Takt 2, **keine** Markierung, keine Aktionsleiste, in SCHRITTE bleiben die Lane-Reiter; `viewState().reason = 'hand'`. Takt 2 nochmal → markiert, Aktionsleiste ersetzt die Werkzeugleiste (Körperhöhe unverändert, Elemente ±2 px); Takt 3 → Bereich 2–3; markierter Chip erneut → Markierung weg. [ALLE] markiert alle Takte.
- [ ] V3a-02b Aktionsleiste P1/P3 eine Zeile ≤ `innerWidth` (Segment + 5 Knöpfe, Trefferflächen ≥ 44 px hoch bzw. L4); L eine Zeile mit allen Knöpfen.
- [ ] V3a-03 Tauschen 1 ↔ 3 im 4-Takt-Clip: Noten (alle Felder inkl. `o`, `a`, `p`, `r`, `m`, `lk`) um ±8 Schläge vertauscht.
- [ ] V3a-04 Verschieben Takt 1 hinter Takt 3 → Reihenfolge 2, 3, 1, 4; Länge gleich.
- [ ] V3a-05 Kopie Takt 2 ans Ende → 5 Takte; bei 16 Takten Blatt [Überschreiben ab Marke] [Abbrechen].
- [ ] V3a-06 Löschen Takte 2–3 → 2 Takte, alter Takt 4 ist Takt 2; Minimum 1 Takt.
- [ ] V3a-07 Leeren: Länge gleich, Bereich ohne Noten.
- [ ] V3a-08 Drum-Clip: alle Aktionen nehmen die Lanes mit; `seed` bleibt.
- [ ] V3a-09 Jede Aktion ein Undo; Wirkung im nächsten Durchlauf (`noteLog`).
- [ ] V3a-10 Mit Markierung HÄLT die Ansicht (M-ANSICHT).
- [ ] V3a-11 Clip als MIDI: Datei enthält genau die Clip-Noten (Parser-Rundlauf); „mit Träger“ unterscheidet sich von „Original“ unter Am; im Viewer-Pfad (gemocktes `window.claude.use('downloads')`) heißt die Datei `….zip` und enthält `….mid`; Projektname mit „ä“ → Name in ASCII („ae“) bzw. UTF-8-Flag 0x0800 gesetzt.
- [ ] V3a-11b Längen-Sperre „gesperrt“: 20 Ziehversuche am rechten Notenende ändern keine Länge, nur die Lage; „frei“: Längen-Zone nur bei Noten ≥ 30 px.
- [ ] V3a-12 Regression (P-Tests der Rolle, T-Tests SCHRITTE, LF-Tests), DoD; M-PLATZ Aktionsleiste in allen Viewports.

**Tests.** `v3a-bars.mjs`.

**Risiken.** Drei Editoren mit unterschiedlicher Seitenlogik; Interaktion mit [Loop = Auswahl] (Zuschneiden) – ein gemeinsames Auswahlmodell verwenden.

---

### V3b — Drehen, Spiegeln, Rückwärts, Dehnen, Varianten

**Ziel.** Die Melodie-Werkzeuge und die Takt-Reihenfolge als nicht zerstörende Variante.

**Umfang.** §5.3 (ohne Clip-MIDI; Bedienung über die FORM-Knöpfe der Aktionsleiste mit Mini-Blättern), §5.4 inkl. Zykluslänge `effLen`.

**Nicht-Umfang.** Clip als MIDI (V3a); Clip-Ebenen (§18).

**Berührungspunkte.** Aktionsleiste, Spiegel-/Rückwärts-Blatt, `clip.vars`/`use`, `R.flat` (Scheduler, MIDI, Tonart-Erkennung, Abflachen der Kette), Editor-Kopf (ORIGINAL/VAR 1), Matrix-Zelle („Var1“).

**Dauer** 4–5 h · **App-Version** 4.11.0 · **Größen-Budget** +40 KB.

**Abnahme-Checkliste**
- [ ] V3b-01 Drehen ▶ 1 Schritt, dann ◀ 1 Schritt = Original (deep-equal); [ALLE] + ▶ 1 Takt im 4-Takt-Clip: Note bei t 14 → t 2.
- [ ] V3b-02 Spiegeln in Tonart (C-Dur, C D E, Achse Mitte) → E D C; nur leitereigene Töne entstehen; zweimal = Original.
- [ ] V3b-03 Spiegeln chromatisch zweimal = Original (Zufallsclip, 50 Noten).
- [ ] V3b-04 Rückwärts ganz zweimal = Original (Noten innerhalb des Bereichs); überragende Note wird auf das Bereichsende gekürzt.
- [ ] V3b-05 Rückwärts nur Tonfolge: alle (t, d) gleich, Tonhöhenfolge umgekehrt; Akkordgruppen bleiben Akkorde.
- [ ] V3b-06 Dehnen ×2 eines 2-Takt-Clips → 4 Takte, t und d verdoppelt; ½ → Original.
- [ ] V3b-07 Drums: Spiegeln grau; Rückwärts ganz wirkt.
- [ ] V3b-08 Variante „3×4, 2-1-4-3“ → VAR 1 mit 8 Takten; `noteLog` zeigt die Takte 3,3,3,3,2,1,4,3; eine Änderung an Takt 3 des Originals erscheint in VAR 1.
- [ ] V3b-09 Spielen `alt`, `after n=2`, `rand p .5` (fester `seed` → zwei Läufe identische Folge).
- [ ] V3b-09b Zykluslänge: 4-Takt-Clip mit 8-Takt-VAR, `alt` → `effLen = 12` Takte, Takte im `noteLog` 1–4 (Original), dann die 8 Variante-Takte, dann wieder Original; Fortschrittsanzeige und Teil-Länge nutzen 12. 4-Takt-Clip mit 16-Takt-VAR und `alt` (20 Takte) → Wahl gesperrt mit Hinweis; `rand` bei ungleicher Länge gesperrt.
- [ ] V3b-10 [Festhalten] → neuer Clip im freien Slot mit den abgeflachten Noten; Umschalten ORIGINAL/VAR 1 am nächsten Takt.
- [ ] V3b-11 MIDI-Export und Ketten-Abflachen nutzen die aktive Variante.
- [ ] V3b-12 Regression und DoD.

**Tests.** `v3b-tools.mjs`, `v3b-vars.mjs`.

**Risiken.** `R.flat` muss überall gelesen werden, wo heute `clip.notes` gelesen wird (Liste in CHANGES).

---

### V3c — LAUF+ (Groovebox-Schritteingabe für Synth)

**Ziel.** Synth-Clips wie an einer Groovebox eingeben: Akkord-Schritte, Lauflicht, Ton greifen und Schritte klopfen.

**Umfang.** §5.5.

**Nicht-Umfang.** Lock-Lanes in LAUF (V5c); Trig-Bedingungen (§18).

**Berührungspunkte.** `laufCheck`, LAUF-Ansicht (Zellen, Akkord-Anzeige, Ziehen), LAUF-Frame (Lauflicht), `inputDown` (Stift-Ton), Editor-Modus-Merker.

**Dauer** 4–5 h · **App-Version** 4.12.0 · **Größen-Budget** +30 KB.

**Abnahme-Checkliste**
- [ ] V3c-01 Clip mit Dreiklang auf Schritt 1: LAUF öffnet ohne Hinweis, Zelle zeigt „C4 +2“; senkrecht 1 Stufe ziehen → alle drei Töne eine Stufe höher (in Tonart).
- [ ] V3c-02 `laufCheck` lehnt nur ab: zwei Anfänge 1/32 auseinander bei Raster 1/16, und > 4 Töne an einem Schritt.
- [ ] V3c-03 Lauflicht markiert während der Wiedergabe den laufenden Schritt (±1 Bild).
- [ ] V3c-04 ● SCHRITT: Taste A2 → Stift „A2“; Schritte 1, 3, 5 tippen (Raster 1/16) → Noten A2 bei t 0, 0,5, 1,0 während der Wiedergabe; Tipp auf einen A2-Schritt löscht ihn; erneuter Tipp auf ● SCHRITT beendet.
- [ ] V3c-05 Gegriffenes Am als Stift → Schritt mit drei Tönen.
- [ ] V3c-06 Neuer leerer Clip öffnet im zuletzt benutzten Modus.
- [ ] V3c-07 Ergebnis in ROLLE identisch (gleiche Noten).
- [ ] V3c-08 Regression (LF1–LF4 angepasst: LF3 jetzt „Akkord erlaubt“), DoD.

**Tests.** `v3c-lauf.mjs`.

**Risiken.** LF3 aus WP5 erwartet „mehrstimmig gesperrt“ – absichtliche Änderung, Adaption mit Verweis auf §5.5.

---

### V4a — FM-Graph-Engine (`fmx`, bis 8 Operatoren)

**Ziel.** Das Worklet spielt freie FM-Graphen bis 8 Operatoren mit Feedback an jedem Operator; DX-Klänge bleiben bitnah gleich.

**Umfang.** §9.1–9.3; `fmxFromFm6`, `dxMatch` (als Funktion, ohne Oberfläche); Stimmen-Budget inkl. Regel „Kanten > 12 → 4 Stimmen“; Mod-Ziele `opA…opH` (Alias `op1…op6`); nativer Rückfall mit nächstem DX-Algorithmus; **Stimmen-Überblendung 30 ms** für Strukturwechsel bei klingenden Stimmen in allen Worklet-Engines (L3; ersetzt die WP4-Blende `setReq`/XF, die nur als Rückfall ab Begrenzer-Stufe 2 bleibt).

**Nicht-Umfang.** FELD-Oberfläche (V4b), Vorhersage/Raster/Export (V4c).

**Berührungspunkte.** Worklet-FM-Block (Render-Schleife, Feedback), `{fm6}`-Nachricht (neu `{fmx}`), Worklet `setReq`/`xfBlock`/`setParams` (Stimmen-Kopie statt Ausblende-Einblende), `SynthHost`, `normalizeSound` (fmx), `NativeVoice`/`DXN` (approx), Mod-Ziel-Tabelle, CPU-Begrenzer, Worklet-ASCII-Prüfung.

**Dauer** 5 h · **App-Version** 4.13.0 · **Größen-Budget** +35 KB.

**Abnahme-Checkliste**
- [ ] V4a-01 `fmxFromFm6` für alle 32 Algorithmen mit einem Testpatch (alle Op aktiv, fb 5): Render C3, Anschlag 0,8, 1 s, fmx gegen fm6: RMS-Differenz ≤ −50 dB relativ zum Signal.
- [ ] V4a-02 FM1–FM10 (WP7) bestehen unverändert.
- [ ] V4a-03 8-Op-Graph, 16 Kanten inkl. 2 Kreuz-Feedback: 60 000 Zufallsblöcke ohne NaN; Spitze ≤ 0 dBFS bei Klang-Pegel 0,35.
- [ ] V4a-04 8 Op → höchstens 6 Stimmen (8 gehaltene Tasten → 6 aktiv); 6 Op → 8; mehr als 12 Kanten → 4; Kopf zeigt den Grund.
- [ ] V4a-05 17. Kante bzw. 9. Operator wird abgewiesen (`setFmx` wirft), Daten unverändert.
- [ ] V4a-06 CPU im **schlechtesten erlaubten Fall**: 8 Op, 16 Kanten (inkl. Kreuz-Feedback), so viele Stimmen wie die Regel erlaubt (4) ≤ 12 % je Spur (Xeon); dazu 8 Op, 9 Kanten, 6 Stimmen ≤ 10 %.
- [ ] V4a-07 `forceNative(true)`: nicht DX-tauglicher Graph klingt über den nächsten DX-Algorithmus (RMS > −40 dBFS), Hinweis „ECO: angenähert“ sichtbar.
- [ ] V4a-08 `lfo1→opB` und `lfo1→fmbright` hörbar (Schwerpunkt max/min > 1,5).
- [ ] V4a-09 Speichern/Laden mit `fmx` deep-equal; Sounds ohne `fmx` unverändert.
- [ ] V4a-11 Stimmen-Überblendung: VA-Fläche gehalten, Welle Säge → Puls im Editor; FM-Graph-Änderung bei gehaltener Note: M-KLICK besteht **und** M-EINBRUCH ≤ 3 dB (Vergleichsmessung der WP4-Blende – 96 Samples auf 0, 96 hoch – in CHANGES); Last während der 30 ms höchstens doppelt so hoch wie davor.
- [ ] V4a-10 Regression und DoD (Worklet-ASCII).

**Tests.** `v4a-fmx-node.mjs` (Gleichheit, NaN, CPU), `v4a-fmx.mjs`.

**Risiken.** Topologische Reihenfolge mit Kreuz-Feedback (1 Sample) – Gleichheit mit DX nur, wo DX dieselbe Ordnung hat (Alg. 4/6: WP7 faltet die Schleife in OP6-Feedback; Testpatch dort mit fb des WP7-Wegs).

---

### V4b — FELD-Ansicht

**Ziel.** FM-Algorithmen per Finger bauen: Wirkung nur vom Ablageort, Ergebnis vor dem Loslassen sichtbar, nichts geht durch Bewegen verloren.

**Umfang.** §9.4 (Kacheln, Auto-Layout, Zonen, Geist, Anfasser, Schiene, Parkplatz, [+], zwei Finger, Undo, [A│B], Kontextzeile, [Vorlagen ▾]).

**Nicht-Umfang.** Vorhersage-Spektrum und Raster (V4c; bis dahin zeigt die Vorhersage-Zeile nur das Etikett aus dem Graph, z. B. „3 Ausgänge · 2 Modulatoren“).

**Berührungspunkte.** FM-Reiter (Unterseiten FELD · OP · MAKRO · STIMME), WP7-ALGO-Blatt (als Vorlagen), OP-Seite (Kopf „OP B · Modulator → A“), Gesten-Register (`GEST`, `RESTPTR`: Feld-Leerraum ist keine Ruhefläche), Halte-Erkennung (Picker erst beim Loslassen), Undo, `haptic`.

**Dauer** 5–6 h · **App-Version** 4.14.0 · **Größen-Budget** +70 KB.

**Abnahme-Checkliste**
- [ ] V4b-01 Alle 32 DX-Algorithmen als Feld: keine Überlappung, alles innerhalb der Feldhöhe 205 px (P1) bzw. des L-Felds (Screenshots je Algorithmus).
- [ ] V4b-02 CDP-Touch: X über OBEN von Y loslassen → Kante X→Y; UNTEN → Y→X; MITTE → Plätze getauscht, Kanten folgen den Plätzen; NEBEN → X hat Ys Ziele; Leerraum → deep-equal unverändert.
- [ ] V4b-03 20 zufällige Bewegungen in den Leerraum: Kantenliste deep-equal.
- [ ] V4b-04 Anfasser auf sich selbst → Feedback; nach oben → Kreuz-Feedback (orange Kante).
- [ ] V4b-05 Schiene → zusätzlicher Ausgang; Parkplatz → Op aus, Werte und Kanten gemerkt; zurück ins Feld stellt ihn wieder her.
- [ ] V4b-06 [+] ins Feld → neuer Op; beim 9. gesperrt mit Hinweis.
- [ ] V4b-07 Zwei Finger auf zwei Kacheln, Beginn innerhalb 300 ms → obere moduliert untere; Beginn 500 ms auseinander → keine Kante. Ein ruhender Finger im Feld-Leerraum während eines Pegel-Zugs in der Kontextzeile ändert nichts am Feld; in der Kontextzeile wirkt er als Fein-Modus (CDP-Touch).
- [ ] V4b-07b Kachel drücken, 600 ms warten, dann 40 px ziehen → Zug (Zone/Geist), **kein** Mod-Picker; Kachel 600 ms halten und ohne Bewegung loslassen → Mod-Picker; Bewegung nach dem Öffnen schließt ihn ohne Wirkung.
- [ ] V4b-08 Wischen im Leerraum ändert nichts.
- [ ] V4b-09 Jede Geste genau ein Undo; [A│B] wechselt zwischen jetzt und vor der letzten Geste (am Block; M-KLICK **und** M-EINBRUCH ≤ 3 dB).
- [ ] V4b-10 Nachbau DX-Alg. 5 aus leerem Feld mit ≤ 9 Gesten (Gesten-Skript); Badge „DX 5 ✓“.
- [ ] V4b-11 Strukturänderung bei gehaltener Note: M-KLICK besteht **und** M-EINBRUCH ≤ 3 dB (Stimmen-Überblendung aus V4a).
- [ ] V4b-12 M-PLATZ P1–P3, L1, L2; Kacheln ≥ 44×40 px (P).
- [ ] V4b-13 Regression (FM8 aus WP7 sinngemäß: Diagramm-Tests auf das Vorlagen-Blatt), DoD.

**Tests.** `v4b-field.mjs` (CDP-Touch).

**Risiken.** Gesten-Mehrdeutigkeit am Rand der Zonen (Hysterese 8 px); zwei-Finger-Geste kollidiert mit dem Fein-Modus von Reglern (Feld hat keine Regler im Körper).

---

### V4c — Vorhersage, Raster, DX-Brücke

**Ziel.** Man sieht und hört vor dem Loslassen, was entsteht; Verhältnisse haben Namen statt Zahlen; DX-Klänge gehen hinein und hinaus.

**Umfang.** §9.5, §9.6.

**Nicht-Umfang.** Gruppen, „Ich will …“, Operator-Modi, FORMANT-Operator (F5–F7, §18); DX-Einzelstimmen (VCED).

**Berührungspunkte.** Vorhersage-Rechner (Periode + FFT 16 Balken), Raster-Blatt, `dxMatch`-Anzeige, [DX-tauglich machen], .syx-Export (Menü → Sounds), `deliverNow` (`kind:'syx'` im ZIP, seit V3a).

**Dauer** 4 h · **App-Version** 4.15.0 · **Größen-Budget** +30 KB.

**Abnahme-Checkliste**
- [ ] V4c-01 Etikett und 16 Balken aktualisieren sich bei jedem Zonenwechsel ≤ 50 ms; Rechenzeit je Vorschau ≤ 3 ms (Xeon, 8 Op).
- [ ] V4c-02 Raster-Klassen für 15 Verhältnis-Paare stimmen mit der FFT überein (15/15, wie `r4/g5/ratio-raster.out`).
- [ ] V4c-03 Raster gleiten: Schwerpunkt ändert sich hörbar (H-1), Loslassen setzt, ein Undo.
- [ ] V4c-04 `dxMatch` erkennt 32/32 Algorithmen in allen Nummerierungen; Nicht-Treffer ≤ 40 ms (Xeon).
- [ ] V4c-05 .syx-Export → Import: Parameter der 32 Stimmen deep-equal; nicht taugliche Sounds übersprungen und im Toast genannt. Viewer-Pfad (gemocktes `downloads`): Datei `….zip` mit `….syx` darin (nicht `.json`), Toast „DX7-Bank gespeichert (ZIP)“; Safari-Pfad: `.syx` mit `application/octet-stream`.
- [ ] V4c-06 [DX-tauglich machen] an einem 8-Op-Graph: Änderungsliste, danach Badge ✓; ein Undo.
- [ ] V4c-07 Regression und DoD.

**Tests.** `v4c-predict.mjs`, `v4c-syx.mjs`.

**Risiken.** Vorhersage am iPhone langsamer (geschätzt 3–7 ms): bei > 8 ms Rate auf 15 Hz senken (Messwert in Info).

---

### V5a — Mod-Stränge

**Ziel.** Jede Route ist als Strang Quelle → Ziel sichtbar, egal wo sie angelegt wurde; feste Wege werden gezeigt.

**Umfang.** §7.1–7.3.

**Nicht-Umfang.** Locks (V5b/V5c); MORPH-Griff (V6b); Mod-Quelle STUFEN (§18).

**Berührungspunkte.** `pageMod`, `modRow`, `modRowFit`, `MOD_SRC`/`MOD_DST`, `routeActive`, LFO-Chips, `setMod`, Halte-Picker (Lautst.-Hk.), Worklet- und nativer Bypass, LFO-Seite (uni/bi).

**Dauer** 4 h · **App-Version** 4.16.0 · **Größen-Budget** +40 KB.

**Abnahme-Checkliste**
- [ ] V5a-01 Routen aus Regler-Halten, Mod-Modus und [+ Weg] erscheinen als Stränge mit Quellenfarbe, Dicke ∝ |Tiefe| (±10 %), Pfeil und Polaritätssymbol.
- [ ] V5a-02 8 Routen: alle Stränge sichtbar in P1 und L1 ohne Scrollen.
- [ ] V5a-03 Bypass `lfo1→cutoff`: Schwerpunkt-Schwankung wie ohne Route (≤ 0,1 Okt); ein Undo; gespeichert.
- [ ] V5a-04 [± umkehren] kehrt das Vorzeichen um, Linie gestrichelt.
- [ ] V5a-05 [feste Wege ▾] zeigt KEYTRACK, HÜLLK.-MENGE, FILTER-ANSCHLAG mit aktuellen Werten; Tipp öffnet den Regler.
- [ ] V5a-06 Quelle tippen markiert alle ihre Stränge; Ziel tippen alle Quellen.
- [ ] V5a-07 Live-Punkte ≥ 55 fps bei 8 Strängen (wie MO45).
- [ ] V5a-08 LFO unipolar: Cutoff wird nur nach oben moduliert (Schwerpunkt-Minimum ≥ Grundwert − 0,05 Okt).
- [ ] V5a-09 Lautst.-Hk. wählbar im Halte-Picker und in der Quellenleiste.
- [ ] V5a-10 MO1–MO49 bestehen (Adaption, wo die Quellen-Kacheln entfallen), DoD.

**Tests.** `v5a-strands.mjs`.

**Risiken.** SVG-Layout mit vielen Kreuzungen; Leistung der Live-Punkte (nur sichtbare zeichnen).

---

### V5b — LOCK-Modus und Drum-Locks

**Ziel.** Werte je Schritt festlegen wie bei Elektron, ohne versteckte Geste; für alle Drum-Makros.

**Umfang.** §7.4, §7.5 (LOCK-Taste, Lock-Leiste, Lanes für Drums), §7.6 Drums.

**Nicht-Umfang.** Synth-Locks (V5c); Lock-Aufnahme nur *(P1)*.

**Berührungspunkte.** Editor-Werkzeugleiste (SCHRITTE), StepEditor (Auswahl im LOCK-Modus), `DrumSeq.lockParams` (erst `lk.v` absolut, dann `tune`/`dec` relativ), `drumHit` (Makro-Locks über die Makro-Abbildung), `normNoteExtras`/`cleanNote` (`lk.v` für beide Spurarten), Lane-Reiter (Geist, leere Raute), LCD.

**Dauer** 4 h · **App-Version** 4.17.0 · **Größen-Budget** +30 KB.

**Abnahme-Checkliste**
- [ ] V5b-01 LOCK-Taste: Banner sichtbar; Tipps wählen Schritte, die Notenmenge bleibt unverändert.
- [ ] V5b-02 Lock-Leiste zeigt die 6 Makros des Typs; Drehen schreibt den Lock auf alle gewählten Schritte (ein Undo); die Lane erscheint.
- [ ] V5b-03 KLICK-Lock auf Schritt 3: Band 4–12 kHz ≥ 6 dB über Schritt 1; andere Schritte unverändert.
- [ ] V5b-04 BISS-Lock auf einem Schritt erfüllt H-1 gegenüber dem Grundwert.
- [ ] V5b-05 Regler drehen ändert keinen Lock; LCD „n Schritte gelockt“.
- [ ] V5b-06 Mod-Modus und LOCK-Modus schließen sich aus.
- [ ] V5b-07 TUNE/DECAY-Locks aus WP6 unverändert relativ (T-Tests). Reihenfolge: TON-Lock (absolut) + TUNE-Lock +12 auf demselben Schritt → Grundfrequenz = TON-Wert × 2 (±5 ct).
- [ ] V5b-07b Absolute Lane: Schritt ohne Lock zeigt den Grundwert als Geist und eine leere Raute; ein Lock genau auf dem Mittelwert ist möglich und bleibt gespeichert; [Lock löschen] entfernt ihn (`lk.v` ohne Schlüssel).
- [ ] V5b-08 Locks überleben Speichern/Laden, Takt-Aktionen und Kopieren.
- [ ] V5b-09 Regression und DoD.

**Tests.** `v5b-locks.mjs`.

**Risiken.** Makro-Locks mit mehreren Engine-Schlüsseln: Rückrechnung über die führende Größe (Anhang B.2).

---

### V5c — Synth-Locks

**Ziel.** Locks auch für Synth-Schritte und -Noten, mit Modulation obendrauf.

**Umfang.** §7.6 Synth; Lock-Lanes in LAUF und ROLLE; LOCK-Modus für Synth-Editoren.

**Nicht-Umfang.** Spur-Locks (Sends, Pan) und lockbare Mod-Tiefe (§18).

**Berührungspunkte.** Worklet NOTE-Ereignis (Paare Index/Wert aus `note.lk.v`), Stimmen-Override `v.lk[k] ?? P[k]`, `scheduleTrack` (lk weitergeben), ROLLE-Lanes (unter VEL), LAUF-Lanes, `normNoteExtras` (Synth-`lk.v`), nativer Pfad (Cutoff, Lautstärke).

**Dauer** 4–5 h · **App-Version** 4.18.0 · **Größen-Budget** +30 KB.

**Abnahme-Checkliste**
- [ ] V5c-01 Cutoff-Lock auf Schritt 3 (LAUF): Schwerpunkt dort ≥ ⅓ Okt anders, andere Schritte ≤ 0,05 Okt.
- [ ] V5c-02 LFO → Cutoff moduliert den gelockten Schritt weiter (Schwankung innerhalb der Note ≥ 0,3 Okt).
- [ ] V5c-03 Regler drehen ändert keinen Lock.
- [ ] V5c-04 Mono-Legato-Lockwechsel: M-KLICK besteht.
- [ ] V5c-05 ROLLE: Lock-Lane unter VEL; Noten mit Lock tragen eine Raute.
- [ ] V5c-06 `forceNative(true)`: Cutoff- und Lautstärke-Lock wirken, andere schraffiert „nur mit Worklet“.
- [ ] V5c-07 Neunter Lock einer Note wird abgewiesen.
- [ ] V5c-08 FM: Helligkeits-Lock hörbar (Schwerpunkt ≥ ⅓ Okt).
- [ ] V5c-09 Regression und DoD.

**Tests.** `v5c-synthlocks.mjs`.

**Risiken.** Nachrichtengröße je Note; Locks bei Stimmenraub (Lock gehört zur Note, nicht zum Slot).

---

### V6a — Klangzustände und Worklet-Morph

**Ziel.** Synth-Einstellungen je Clip/Szene merken; beim Wechsel fahren die Regler flüssig bis zum Taktstrich; klingende Noten behalten Umschalt-Werte bis zum Loslassen.

**Umfang.** §6.1–6.4 (Worklet-Teil), §6.7; KZ1–KZ6; KZ3 **je Stimme ab Anschlag** (Standard); `effective(t)`-Schicht für alle Abgleiche (`wkFlat`, `wkFm6`, `syncEngine`); Test-Hook `__morphProbe`; Zustands-Schlüssel als Pfade; Spur-Werte des Zustands in `st.mix` (V7a ist gebaut).

**Nicht-Umfang.** Nativer Morph (WT, ECO-Rückfall), Spur-FX-Morph (Drive, Chorus, Mix-Werte), Drum-Zustände (V6a′); Teil-Klang, MORPH-Griff (V6b).

**Berührungspunkte.** Editor-Kopf ([◆ Merken], Bearbeite-Band), Clip-Zelle (◆), Clip-Blatt (◆-Abschnitt), Worklet (`morph`-Nachricht mit `disc`/`at`, Interpolation je Block, `derive` teilweise, diskrete Werte je Stimme beim Anschlag), `syncEngine`/`wkFlat`/`wkFm6` (lesen `effective(t)`, kein `force` beim Abgleich), Scheduler (Vorausschau 1 Schlag für Song/Kette), Undo (`group` für [◆ für ganze Szene merken]).

**Dauer** 4–5 h · **App-Version** 4.19.0 · **Größen-Budget** +35 KB.

**Abnahme-Checkliste**
- [ ] V6a-01 [◆ Merken]: `clip.st.p` enthält genau die geänderten Schlüssel (als Pfade, z. B. `fm6.ops.2.ol`); Zelle zeigt ◆.
- [ ] V6a-02 Bearbeite-Band: Regler drehen ändert `clip.st`, nicht `track.sound`; [Grundklang] → Änderungen gehen in `track.sound`.
- [ ] V6a-03 Szene 2 tippen 1,5 Schläge vor dem Takt: Cutoff bewegt sich monoton mit ≥ 10 Zwischenwerten (`__morphProbe` je Block, gegengeprüft über M-SP in 50-ms-Fenstern, monoton über ≥ 10 Fenster) und erreicht den Zielwert am Taktstrich ±1 Block.
- [ ] V6a-04 Restzeit < 1 Schlag → Morph dauert 1 Schlag.
- [ ] V6a-05 „Sprung“: Wert in ≤ 5 ms am Taktstrich; M-KLICK besteht.
- [ ] V6a-06 Gehaltene Fläche während des Morphs: Schwerpunkt wandert, M-EINBRUCH ≤ 3 dB.
- [ ] V6a-07 Diskreter Wert (Säge → Puls) im Zustand: eine **gehaltene** Note behält Säge bis zum Loslassen (Spektrum unverändert), eine nach dem Taktstrich angeschlagene klingt Puls; M-KLICK und M-EINBRUCH ≤ 3 dB am Taktstrich.
- [ ] V6a-07b Zustand mit anderem Modus/Poly lässt sich nicht speichern: Regler im Bearbeite-Band grau „nur im Grundklang“; eine gehaltene Fläche endet am Taktstrich nicht.
- [ ] V6a-08 KZ6: Regler während des Morphs gedreht → dieser Parameter folgt der Hand, andere fahren weiter.
- [ ] V6a-09 Clip ohne Zustand → Rückfahrt zum Grundklang.
- [ ] V6a-10 Voll-Abgleich während des Morphs: Undo und Preset-Laden **einer anderen Spur** sowie Undo auf derselben Spur während eines 2-Takt-Morphs: M-SP der morphenden Spur bleibt stetig (kein Sprung > ⅓ Okt zwischen 50-ms-Fenstern), der Morph läuft mit der Restzeit weiter.
- [ ] V6a-12 Kette/Song: Morph beginnt 1 Schlag vor dem Wechsel.
- [ ] V6a-13 Worklet-Last während eines Morphs ≤ Ruhe + 1 % (M-CPU).
- [ ] V6a-14 [◆ für ganze Szene merken]: Zustände an allen Clips der Spalte (nur Spuren mit Abweichung); ein Undo.
- [ ] V6a-15 Speichern/Laden und Undo deep-equal; Engine-Wechsel zeigt das Blatt „Zustände passen nicht“.
- [ ] V6a-16 Regression und DoD.

**Tests.** `v6a-states.mjs`, `v6a-morph-node.mjs`.

**Risiken.** `derive()` je Block zu teuer (dann nur geänderte Teilbereiche ableiten); Anzeige und Klang müssen dieselbe Kurve nutzen; Werte je Stimme kosten Speicher je Stimme (nur die diskreten Schlüssel kopieren).

---

### V6a′ — Nativer Morph, Spur-FX und Drum-Zustände

**Ziel.** Klangzustände wirken auch auf dem nativen Pfad, auf Spur-Effekten und Mischung und bei Drums – ohne dass ein Regler-Dreh während des Morphs einen Fehler wirft.

**Umfang.** §6.4 „Nativ“ (Stufen alle 16 ms mit `setTargetAtTime`, `cancelScheduledValues` + `setValueAtTime`, `try/catch`, kein `setValueCurveAtTime`); Spur-Werte aus `st.mix` (Lautstärke, Pan, Sends) und `st.fx` (Chorus-Mischung; Drive in ≤ 8 Stufen über die A/B-Shaper-Blende); WT-Position/-Tabelle und PeriodicWave „ab nächster Note“ (Regler-Hinweis); Drum-Zustände `st.slots` mit `stAt(t)` in `drumHit`.

**Nicht-Umfang.** Teil-Klang, MORPH-Griff (V6b).

**Berührungspunkte.** `applyChainFx` (liest `effective(t)`; keine Kurven-Automation), native Stimmen (`NativeVoice`, WT nativ), Spur-Mix-Knoten (V7a), A/B-Shaper, `drumHit` (`stAt`), Regler-Hinweise.

**Dauer** 4 h · **App-Version** 4.20.0 · **Größen-Budget** +25 KB.

**Abnahme-Checkliste**
- [ ] V6a′-01 `forceNative(true)`: Cutoff-Morph über 2 Takte fährt in Stufen ≤ 16 ms (M-SP monoton, ≥ 10 Fenster); M-KLICK besteht.
- [ ] V6a′-02 Während eines nativen Morphs von Lautstärke/Pan/Hall-Send wird ein Effekt-Regler derselben Spur gedreht: **keine Ausnahme** (`tickErrors()` und Konsole 0), KZ6 gilt (der gedrehte Wert folgt der Hand).
- [ ] V6a′-03 Chorus-Mischung im Zustand fährt (Seite/Mitte-Verhältnis monoton); Drive fährt in höchstens 8 Stufen mit ≥ 40 ms Abstand, M-KLICK besteht.
- [ ] V6a′-04 WT nativ: Positions-Unterschied im Zustand wirkt ab der nächsten Note; der Regler trägt den Hinweis „wirkt nativ ab der nächsten Note“.
- [ ] V6a′-05 Drum-Zustand (Kick DECAY in `st.slots.KICK`): ein Schlag in der Morph-Mitte hat einen Wert zwischen Start und Ziel.
- [ ] V6a′-06 Regression (FX1–FX10, V7a-Tests) und DoD.

**Tests.** `v6a2-native.mjs`.

**Risiken.** Viele Automations-Aufrufe je Sekunde auf dem Hauptthread (Stufen nur für Spuren mit laufendem Morph; PE1 prüfen).

---

### V6b — Teil-Klang und MORPH-Griff

**Ziel.** Registrierungen mit eigenem Klang; Grundklang ↔ Zustand mit einem Schieber spielen.

**Umfang.** §6.5, §6.6. (Die diskreten Werte je Stimme sind seit V6a Standard.)

**Nicht-Umfang.** Blende A↔B (JAM-2, §18).

**Berührungspunkte.** Teil-Blatt (Klang), KZ5-Auswertung, Editor-Kopf (MORPH-Schieber), STIMME-Reiter (Mod-Rad = MORPH).

**Dauer** 3–4 h · **App-Version** 4.21.0 · **Größen-Budget** +25 KB.

**Abnahme-Checkliste**
- [ ] V6b-01 Teil mit eigenem Klang überschreibt den Clip-Zustand (KZ5), Rückkehr zum Clip-Zustand bei Teilwechsel.
- [ ] V6b-02 MORPH 0 → 100 %: Cutoff fährt stetig vom Grund- zum Zustandswert; M-KLICK besteht.
- [ ] V6b-03 [Als Zustand] speichert die Mischung (ein Undo).
- [ ] V6b-04 Mod-Rad = MORPH wirkt (Schwerpunkt folgt dem Rad).
- [ ] V6b-06 Regression und DoD.

**Tests.** `v6b-parts-morph.mjs`.

**Risiken.** Gering.

---

### V7b — Master-Worklet (Messung, Glue, True-Peak-Limiter)

**Ziel.** Genaue Lautheits- und True-Peak-Messung, sanfter Glue ohne Pumpen, Limiter mit Vorausschau; sicherer Rückfall.

**Umfang.** §8.5 (inkl. parallel gebauter Rückfall-Kette, Umschaltung über Gains, Herzschlag 250 ms nur bei laufendem Kontext), §8.9 Regeln 1–4; Master-Kopf im MIX mit Live-Werten.

**Nicht-Umfang.** Rollen, REMASTER, Karten (V7c/V7d).

**Berührungspunkte.** Worklet-Modul (neuer Prozessor `sq-master`), `buildMaster`, `AU.M`/`masterSum`, `graphLat`, `meter()`, `grmFrame`, MIX › MASTER, Info.

**Dauer** 4–5 h · **App-Version** 4.22.0 · **Größen-Budget** +40 KB.

**Abnahme-Checkliste**
- [ ] V7b-01 LUFS: 1-kHz-Sinus −20 dBFS und rosa Rauschen gegen `r2/mix-messung.mjs`: ±0,3 LU (M, S, I).
- [ ] V7b-02 True Peak: Sinus fs/4 mit 45° Phase (Abtastspitze unter der echten Spitze) → TP ≥ Abtastspitze + 2,5 dB, Fehler ≤ 0,3 dB.
- [ ] V7b-03 Demo mit +6 dB Verstärkung → TP ≤ −1,0 dBTP am Ausgang.
- [ ] V7b-04 Glue nach §8.9 bei Ø 1,5 dB Reduktion: Pump-Hub ≤ 1,5 dB (Verfahren `pump.mjs`).
- [ ] V7b-05 (a) Worklet startet nicht (Test-Schalter) → von Anfang an `FX.Master`, **kein** Tonausfall. (b) Worklet hängt im Betrieb (`__masterHang(true)`) → Ausfall ≤ 300 ms, danach blendet die Rückfall-Kette ein (M-KLICK), Anzeige „Messung aus“. (c) `ctx.suspend()` 5 s, dann `resume()` → **kein** Rückfall (der Herzschlag wird bei angehaltenem Kontext nicht ausgewertet).
- [ ] V7b-06 `graphLat` enthält die Vorausschau; Metronom bleibt synchron (M-ZEIT).
- [ ] V7b-07 CPU ≤ 1,5 % (Xeon).
- [ ] V7b-08 Master-Kopf zeigt LUFS, TP, Mono, Pumpen mit 10 Hz.
- [ ] V7b-09 Regression (FX-Master-Tests angepasst, Begründung §8.5), DoD.

**Tests.** `v7b-master-node.mjs`, `v7b-master.mjs`.

**Risiken.** Latenz der Vorausschau verschiebt alles (einrechnen); iOS-Leistung ungemessen.

---

### V7c — Rollen, Ziele, REMASTER, Korrektur-Schicht

**Ziel.** Der Master versteht die Spuren, fragt nur das Nötige und rechnet bei Änderungen nicht zerstörend neu.

**Umfang.** §8.4, §8.6–8.8, **§8.11 MASTER-Reiter** (Ziel-Chips, Stil, [MASTERN]/[REMASTER] mit selbst gestarteter Hörprobe und [Abbrechen], Statuszeile, A/B, [Übernehmen]/[Verwerfen], Karten-Fläche, [Profi ▾]); *(P1)* Offline-Schnell-Analyse prüfen.

**Nicht-Umfang.** Pump-Wächter-Maßnahmen, Vorschlags-Karten, Auto-Trim (V7d); Stilkurven aus Hörtests (§18).

**Berührungspunkte.** `S.master`, Rollen-Vorschlag (`r5/h2610/rollen.mjs` als Vorlage), Rückfrage-Karte, Ziel-/Stil-Wahl, Plan-Rechner, A/B, Undo `kind:'master'`.

**Dauer** 5 h · **App-Version** 4.23.0 · **Größen-Budget** +60 KB.

**Abnahme-Checkliste**
- [ ] V7c-01 Die 7 Prototyp-Fälle aus §8.6 ergeben die erwarteten Rollen bzw. Fragen.
- [ ] V7c-02 Rückfrage-Karte erscheint nie während einer Aufnahme; höchstens 3 Fragen.
- [ ] V7c-03 REMASTER Demo „Streaming“: integriert −14 ± 0,5 LUFS, TP ≤ −1,0 dBTP.
- [ ] V7c-04 Zweimal REMASTER mit gleicher Eingabe → Plan deep-equal.
- [ ] V7c-05 Korrektur „Helligkeit +1“ überlebt REMASTER nach einer Mixänderung (`corr` erhalten, Plan neu).
- [ ] V7c-06 A/B-Pegelunterschied ≤ 0,3 LU; Umschalten am Taktstrich, M-KLICK besteht.
- [ ] V7c-07 Plan-Übernahme am Taktstrich mit Rampe, M-KLICK besteht.
- [ ] V7c-08 Club nicht ohne Pumpen erreichbar → Meldung mit erreichtem Wert.
- [ ] V7c-09 ΔLUFS > 1 LU nach Mixänderung → Hinweis „Mix geändert – REMASTER?“, der auf den Knopf [REMASTER] führt.
- [ ] V7c-11 **Ablauf per CDP-Touch (DOM):** Transport steht, Kette vorhanden → Tipp [MASTERN] startet ▶ SONG ab Takt 1, Statuszeile „hört zu n/8“ zählt hoch; [Abbrechen] stoppt die Messung, `S.master` deep-equal unverändert. Erneut [MASTERN] bis zum Ende → Plan-Zeile, A/B und [Übernehmen] werden aktiv; [Übernehmen] → Knopf heißt [REMASTER]; ein Undo. Transport läuft schon → Messung ab dem nächsten Taktstrich, kein Neustart (M-ZEIT).
- [ ] V7c-12 MASTER-Reiter P1/L1: alle Elemente im Körper (Summe ≤ 377 px P1), Trefferflächen L4, [Profi ▾] klappt ohne Scrollen auf; M-PLATZ P1–P3, L1, L2.
- [ ] V7c-13 *(P1)* Offline-Analyse: `remaster({offline:true})` liefert für die Demo einen Plan, dessen LUFS-Schätzung ±1 LU vom Echtzeit-Plan abweicht; sonst Begründung in CHANGES, warum offline nicht gleich klingt.
- [ ] V7c-10 Regression und DoD.

**Tests.** `v7c-remaster.mjs`, `v7c-roles.mjs`.

**Risiken.** Stil-Startwerte unbelegt (Hörtest); Plan-Iteration darf den Hauptthread nicht > 50 ms blockieren.

---

### V7d — Pump-Wächter, Vorschlags-Karten, Auto-Trim

**Ziel.** Der Master schlägt Korrekturen an der Quelle vor und verhindert Pumpen.

**Umfang.** §8.9 Regel 5, §8.10.

**Nicht-Umfang.** Dynamischer EQ, Maskierungs-Ampel (§18).

**Berührungspunkte.** Mess-Worklet-Berichte, Karten im MASTER-Reiter, Auto-Trim-Geistmarke am Fader, Spur-Hochpass/-Pumpen, Bus-Rückwege.

**Dauer** 4 h · **App-Version** 4.24.0 · **Größen-Budget** +40 KB.

**Abnahme-Checkliste**
- [ ] V7d-01 Künstlich pumpender Mix (Glue Ø 4 dB) → Karte „Release länger“; nach [Ja] Hub ≤ 1,5 dB.
- [ ] V7d-02 MK1: Lead 6 dB unter der Fläche im Band 1–4 kHz → Karte; [Lead +2 dB] → Geistmarke; [Übernehmen] → Fader +2 dB.
- [ ] V7d-03 MK3: Fläche mit 40 % Energie < 150 Hz → Karte; [Hochpass 150 Hz] → `mix.hpf = 150`.
- [ ] V7d-04 „Nein“ wird gemerkt; dieselbe Karte erscheint ohne deutliche Änderung nicht wieder.
- [ ] V7d-05 Nie mehr als 3 Karten gleichzeitig.
- [ ] V7d-06 Auto-Trim bleibt in ±6 dB.
- [ ] V7d-07 Regression und DoD.

**Tests.** `v7d-cards.mjs`.

**Risiken.** Fehlalarme der Regeln (Startwerte unbelegt) – „Nein“-Gedächtnis und höchstens 3 Karten.

---

### V8a — Tabellen-Oszillator und Bitmask-Klang

**Ziel.** Ein bandbegrenzter Tabellen-Oszillator im Worklet und die Bitmask-Engine (Mask1-Prinzip) klingen sauber und hörbar.

**Umfang.** §10.1, §10.2 (Klang: Pool, Masken, DELTA mit M-Hk., UNTERTON, eigene Masken als Daten), §10.4; INIT Bitmask; Mod-Ziele `mask1/2`, `delta1/2`.

**Nicht-Umfang.** 32-Feld-Oberfläche, Euklid, Welle malen (V8b).

**Berührungspunkte.** Worklet (`eng 2`, Tabellen-Leser, Überblendung, Mip-Wahl, Pool im `AudioWorkletGlobalScope`), Tabellen-Bau auf dem Hauptthread in Scheiben (`idle`, `tickAhead`; Pool ab der aktuellen Position nach außen), `SynthHost`-Nachrichten (Pool einmal übertragen bzw. je Knoten kopieren, §10.1), LRU je Sound nur für `ovr`/UNTERTON, eingebettete Pool-Permutation, `normalizeSound` (`mask`), `NativeVoice` (PeriodicWave), Mod-Ziel-Tabelle.

**Dauer** 4–5 h · **App-Version** 4.25.0 · **Größen-Budget** +40 KB.

**Abnahme-Checkliste**
- [ ] V8a-01 Aliasing: POOL[200] bei C7 → gefaltete Energie ≤ −60 dB relativ zum Nutzsignal.
- [ ] V8a-02 Pool: 256 Masken; POOL[0] = Sinus (THD ≤ −60 dB); Spearman(Schwerpunkt, Index) ≥ 0,95; Nachbar-Verhältnis ≤ 1,25.
- [ ] V8a-03 **Nach dem Aufwärmen** (Pool fertig): DELTA +64, M-Hk. A 0 / D 1 s / S 0: Schwerpunkt fällt über 1 s monoton (Rückgang zwischen 50-ms-Fenstern höchstens 5 %).
- [ ] V8a-03b **Kaltstart:** erste Note mit DELTA 64 direkt nach dem Laden eines Bitmask-Sounds: kein Rückgang > 10 % zwischen 50-ms-Fenstern, kein Aussetzer (M-EINBRUCH ≤ 3 dB); Pool fertig ≤ 3 s (Xeon); zwei Bitmask-Spuren teilen den Pool (Speicherzuwachs der zweiten Spur ≤ 1 MB, `performance.memory` bzw. Zähler im Worklet).
- [ ] V8a-03c Startzeit unverändert (§15.3): keine Pool-Sortierung beim Start, die Reihenfolge ist eingebettet.
- [ ] V8a-04 `lfo1→mask1` hörbar (Schwerpunkt max/min > 1,5).
- [ ] V8a-05 UNTERTON P = 2 (A, A invertiert) bei 110 Hz: Energie bei 55 Hz ≥ −6 dB relativ zum stärksten Teilton; bei f₀/P < 30 Hz wird P verkleinert.
- [ ] V8a-06 Masken-Sweep während der Wiedergabe: PE1 besteht (keine Aufgabe > 50 ms).
- [ ] V8a-07 Noch nicht gebaute Tabelle → Nachbarin, kein Pegeleinbruch > 3 dB.
- [ ] V8a-08 `forceNative(true)`: Bitmask klingt (RMS > −40 dBFS), Hinweis „ECO: Maske fest“.
- [ ] V8a-09 CPU ≤ 0,5 % je Stimme und Oszillator (Xeon).
- [ ] V8a-10 Regression und DoD (Worklet-ASCII).

**Tests.** `v8a-mask-node.mjs`, `v8a-mask.mjs`.

**Risiken.** Speicher ≈ 8 MB für den Pool (am iPhone ungemessen); ob alle Prozessoren den globalen Bereich teilen, beim Bau prüfen (sonst Kopie je Knoten); Bauzeit am iPhone (Scheiben); Masken-Erzeugungsregel muss die Sortier-Abnahme erfüllen.

---

### V8b — Bitmask-Oberfläche

**Ziel.** Masken sichtbar statt „2 Regler + Zahl“: 32 Felder, Nummer mit Nachbarn, Delta-Pfeil, Werkzeuge.

**Umfang.** §10.2 (eigene Masken bedienen, Euklid, Welle malen, Perioden-Reihe), §10.3; 4 Werks-Sounds (Anhang A.3).

**Nicht-Umfang.** Masken-Formant (§18); Tabellen-Additiv (V9a).

**Berührungspunkte.** Synth-Editor (Engine-Wahl „Bitmask“, Unter-Reiter OSZ 1/OSZ 2/RAUSCHEN/M-HK.), Oszilloskop-Fläche (Malen), Punkt-Raster, Undo, Bibliothek (Kategorie).

**Dauer** 4–5 h · **App-Version** 4.26.0 · **Größen-Budget** +40 KB.

**Abnahme-Checkliste**
- [ ] V8b-01 Feld-Tipp-Folge N → I → S → R → N; erzeugt `ovr` an der aktuellen Position, Nummer zeigt ✎; ein Undo je Tipp. Ziehen über 6 Felder → alle 6 im neuen Zustand des ersten Feldes, **ein** Undo.
- [ ] V8b-02 Nachbar-Miniaturen und Delta-Pfeil folgen Position und DELTA.
- [ ] V8b-03 Euklid k = 5, S = 16: Maske mit 5 invertierten Gruppen; Schwerpunkt höher als bei k = 1.
- [ ] V8b-04 Welle malen (Säge): Restfehler ≤ −15 dB.
- [ ] V8b-05 Perioden-Reihe „A B – A“ setzt das UNTERTON-Muster (P = 4).
- [ ] V8b-06 4 Werks-Sounds und INIT Bitmask laden und klingen (PR1, PR8).
- [ ] V8b-07 M-PLATZ alle Viewports; **Trefferflächen-Prüfung:** Felder ≥ 40×34 px (P1/P2), ≥ 34×34 px (P3), ≥ 36×34 px (L), Abstand ≥ 4 px (3 px in P3); Hälften-Umschalter [1–16│17–32] ≥ 44 px.
- [ ] V8b-08 Regression und DoD.

**Tests.** `v8b-mask-ui.mjs`.

**Risiken.** Zwei Hälften bedeuten einen Tipp mehr für Masken über alle 32 Segmente (Ausgleich: Ziehen, Euklid, Welle malen).

---

### V9a — Tabellen-Additiv (+ Phase Distortion *(P1)*)

**Ziel.** Klänge aus Obertönen bauen: 32 Balken, Zugriegel, Anschlag → Ausklang, XY aus 4 Spektren, Formant.

**Umfang.** §11.1; *(P1)* §11.4; INIT Additiv.

**Nicht-Umfang.** Teiltonbank KLANGKÖRPER (V9b); KLANG-SCAN (§18).

**Berührungspunkte.** Tabellen-Oszillator (V8a), Synth-Editor (Engine „Additiv“), Balken- und Zugriegel-Ansicht, XY-Feld (vorhanden), `normalizeSound` (`add`).

**Dauer** 4 h · **App-Version** 4.27.0 · **Größen-Budget** +30 KB.

**Abnahme-Checkliste**
- [ ] V9a-01 Nur Balken 1 → Sinus (THD ≤ −60 dB); Balken 1, 3, 5, … mit 1/n → gerade Harmonische ≤ −40 dB.
- [ ] V9a-02 Spektrum A → B, Morph-Zeit 2 s: Schwerpunkt bewegt sich monoton.
- [ ] V9a-03 XY-Ecken = gespeicherte Spektren (Schwerpunkt ±5 %).
- [ ] V9a-04 Zugriegel und Balken zeigen dieselben Pegel.
- [ ] V9a-05 FORMANT 800 Hz: stärkster Teilton bei C3, C4, C5 innerhalb 800 Hz ± ½ Okt.
- [ ] V9a-06 HELLIGKEIT, UNGERADE↔GERADE, FORMANT, ZEIT erfüllen H-1.
- [ ] V9a-07 *(P1)* PD: DCW-Hüllkurve verschiebt den Schwerpunkt ≥ 1 Okt.
- [ ] V9a-08 Regression und DoD.

**Tests.** `v9a-additive.mjs`.

**Risiken.** Gering (nutzt V8a).

---

### V9b — KLANGKÖRPER (Teiltonbank)

**Ziel.** Klavier, Saxofon, Sphäre, böse, sprechende Klänge und „Brüllen“ aus Vorlagen mit 4 Makros.

**Umfang.** §11.2.

**Nicht-Umfang.** Teiltöne einfangen (V9c); Sample-Import (§18).

**Berührungspunkte.** Worklet (Engine `body`, Sinusbank mit Abschaltung, Rauschteil, Formant-Gewichte je Note), Begrenzer Stufe 1, Synth-Editor (Vorlagen, Makros, XY, TIEFE-Reiter), `normalizeSound` (`body`), INIT Klangkörper.

**Dauer** 5 h · **App-Version** 4.28.0 · **Größen-Budget** +50 KB.

**Abnahme-Checkliste**
- [ ] V9b-01 Streckung B = 0,0004: gemessene Teiltonfrequenzen = Formel ±2 ct (n ≤ 16).
- [ ] V9b-02 α 0,5: Abklingzeit Teilton 8 < Teilton 1.
- [ ] V9b-03 Formant fest: C3 und C4 → Spektralmaximum innerhalb ±⅓ Okt derselben Frequenz.
- [ ] V9b-04 ATEM Maximum hebt das Rauschband ≥ 6 dB.
- [ ] V9b-05 HELLIGKEIT, KÖRPER, ATEM, ZEIT erfüllen H-1.
- [ ] V9b-06 6 Vorlagen laden und klingen; Klavier Anschlag 0,4 vs. 1,0: Schwerpunkt-Differenz ≥ ⅓ Okt.
- [ ] V9b-07 CPU 48 TT × 8 Stimmen ≤ 8 % (Xeon); Begrenzer Stufe 1 halbiert die Teiltonzahl (Last −30 % oder mehr), gespeicherter Sound unverändert.
- [ ] V9b-08 Subharmonische f₀/2 ≥ −20 dB relativ bei Maximum.
- [ ] V9b-09 Regression und DoD.

**Tests.** `v9b-body-node.mjs`, `v9b-body.mjs`.

**Risiken.** CPU am iPhone (Faktor unbelegt); Vokal-Werte in Hz unsicher (Hörtest).

---

### V9c — Teiltöne einfangen (Resynthese-Grundlagen)

**Ziel.** Aus einer Note (eigener Sound oder Audiodatei) einen KLANGKÖRPER-Klang gewinnen.

**Umfang.** §11.3.

**Nicht-Umfang.** Allgemeine zeitvariable Resynthese (E3-22); Mikrofon (§13).

**Berührungspunkte.** OfflineAudioContext mit Worklet-Modul, Datei-Eingabe (`accept="audio/*"`), Analyse (YIN, STFT, Anpassungen) in Scheiben, Ergebnis-Blatt mit A/B.

**Dauer** 4 h · **App-Version** 4.29.0 · **Größen-Budget** +30 KB.

**Abnahme-Checkliste**
- [ ] V9c-01 Rundlauf: KLANGKÖRPER mit bekannten Werten (16 TT, B, T1/T2) gerendert → Analyse: Startpegel ±1,5 dB (n ≤ 16), Abklingzeiten ±20 %, B ±20 %, f₀ ±5 ct.
- [ ] V9c-02 App-Sound (FM-Pluck, C3): Ergebnis klingt; A/B-Lautheit ±0,5 LU; Schwerpunkt bei 50 und 500 ms innerhalb ±⅓ Okt des Originals.
- [ ] V9c-03 WAV-Testdatei (44,1 kHz, 2 s, Säge A3): f₀ ±5 ct; ≥ 16 Teiltöne mit 1/n-Verlauf ±2 dB.
- [ ] V9c-04 Analyse blockiert den Hauptthread nie > 50 ms.
- [ ] V9c-05 Ungültige Datei → Meldung, keine Änderung.
- [ ] V9c-06 Regression und DoD.

**Tests.** `v9c-capture.mjs`.

**Risiken.** Dateiwahl in der Claude-App am iPhone ungeprüft; Worklet in OfflineAudioContext (Ladekette prüfen, Rückfall: nativer Render mit Hinweis).

---

### V10a — Bibliothek v3

**Ziel.** Stöbern nach Rollen, Hören im eigenen Song, eigene Sounds mit Hörprobe.

**Umfang.** §12.2–12.4, §12.7 (INIT-Kategorie vollständig), §12.8.

**Nicht-Umfang.** Signature-Presets (V10b); Tutorial (V10c).

**Berührungspunkte.** Browser (`openBrowser`, Zeilen, Filter), `previewStart` (Phrase/Mein Clip, Spur-Ausblendung), Sichern-Ablauf, `soundHash`, Kit-Vorhören (eigenes Muster), Bibliothek-Speicher (`aud`, `role`, `style`).

**Dauer** 4 h · **App-Version** 4.30.0 · **Größen-Budget** +40 KB.

**Abnahme-Checkliste**
- [ ] V10a-01 Rollen-Chips filtern; Zahl je Rolle = Daten.
- [ ] V10a-02 „Mein Clip“: spielt die Noten des laufenden Clips mit dem Kandidaten (`noteLog` `preview`, gleiche Tonhöhen und Schläge), Spur währenddessen ≤ −60 dBFS, ■ stellt her; Clip-Hash unverändert.
- [ ] V10a-03 Phrase im Song-Tempo, transponiert auf den Szenen-Grundton (Tongeschlecht der Phrase bleibt).
- [ ] V10a-04 ▶ klingt ≤ 150 ms; ■ ohne Klick.
- [ ] V10a-05 Eigener Sound mit Hörprobe übersteht Sichern, Neuladen, Export/Import (`aud` deep-equal); Ändern der Hörprobe ändert `soundHash` nicht.
- [ ] V10a-06 Kit-▶ spielt das eigene Muster des Kits.
- [ ] V10a-07 INIT-Kategorie mit den Init-Sounds aller gebauten Engines: RMS > −40 dBFS, keine Routen, Effekte neutral.
- [ ] V10a-08 Import zweier Sounds mit gleichem Klang und verschiedenem Namen → beide in der Bibliothek; gleicher Klang und gleicher Name → einer.
- [ ] V10a-09 Regression (Browser-Tests WP3 angepasst), DoD.

**Tests.** `v10a-library.mjs`.

**Risiken.** Spur-Ausblendung bei „Mein Clip“ muss auch bei Abbruch (Schließen, Panik) zurückgestellt werden.

---

### V10b — Signature-Paket

**Ziel.** 46 Synthpop-Signature-Sounds mit eigenen Vorhör-Phrasen; markenfreie Namen.

**Umfang.** §12.5, §12.6; Anhang A.1, A.3, A.4.

**Nicht-Umfang.** Bausteine des Klang-Feinschliffs (§18); betroffene Presets bleiben Annäherung.

**Berührungspunkte.** `SQ_FACTORY` (Presets, Phrasen kompakt), `PREVIEW`, Alias-Tabelle (`loadPreset`), ⓘ-Texte, ⧉-Clips, Kalibrierungs-Werkzeug (Offline-LUFS).

**Dauer** 5–6 h · **App-Version** 4.31.0 · **Größen-Budget** +120 KB.

**Abnahme-Checkliste**
- [ ] V10b-01 46 Presets vorhanden, je mit `role`, `style`, `aud` (≤ 8 s) und `info.beleg`.
- [ ] V10b-02 Alle neuen und alten Presets: Phrase −18 ± 3 LUFS (trocken), PR8-Grenzen bestanden.
- [ ] V10b-03 ⧉: Clip landet nur in einem leeren Slot; belegte Slots unverändert.
- [ ] V10b-04 Keine Marken- oder Personennamen in Sound- oder Kit-Namen (Prüfliste Anhang A.4); `loadPreset(t, 'Moog-Bass')` lädt „Kaskaden-Bass“.
- [ ] V10b-05 Die 15 gemessenen VA-Rezepte (Anhang A.1, [g]) zeigen ihre Trick-Wirkung: Messgröße „an“ gegen „aus“ wie in Anhang A.1 Spalte „Messung“ (Abweichung ≤ 25 % von `v3-ideen/r5/h7810/rezept-check.out`). Skript: `v3-ideen/r5/h7810/rezept-check.mjs` (vorhanden; nur lesen und kopieren), auf die App-Kette umstellen.
- [ ] V10b-06 Dateigröße im Budget (≤ 120 KB Zuwachs).
- [ ] V10b-07 Regression und DoD.

**Tests.** `v10b-presets.mjs` (Node-Offline-Kalibrierung + Browser-Ladeprüfung).

**Risiken.** Klang nie angehört (nur gemessen) – Xanders Hörtest einplanen; Umbenennung trifft Tests mit Namen (Alias).

---

### V10c — Tutorial-Grundgerüst

**Ziel.** Geführtes Lernen direkt in der App, drei Lektionen.

**Umfang.** §12.9.

**Nicht-Umfang.** Ohr-Modus, weitere Lektionen, Hilfe-Modus (§18).

**Berührungspunkte.** Menü (neue Rubrik „Lernen“), Lektions-Motor (Karte, Öffnen von Seiten, Puls- und Zielbogen am Regler-Ring), A/B mit gleicher Lautheit, `S.settings.learn`.

**Dauer** 4–5 h · **App-Version** 5.0.0 · **Größen-Budget** +60 KB.

**Abnahme-Checkliste**
- [ ] V10c-01 Menü → Lernen listet 3 Lektionen mit Dauer und Status.
- [ ] V10c-02 Lektion 1 per Skript: jeder Schritt öffnet die richtige Seite, der richtige Regler pulsiert, der Zielbogen ist sichtbar; Wert im Zielbereich hakt den Schritt ab.
- [ ] V10c-03 [Ziel]/[Meins] mit gleicher Lautheit ±1 LU.
- [ ] V10c-04 Abbrechen ändert nichts (Projekt deep-equal).
- [ ] V10c-05 Lektionen 2 und 3 durchspielbar; Lektion 3 erzeugt eine Kette mit 2 Teilen und Melodie.
- [ ] V10c-06 Die Karte überdeckt keinen Regler (Rechteck-Schnitt leer) in P1–P3, L1, L2.
- [ ] V10c-07 Regression und DoD; App-Version 5.0.0.

**Tests.** `v10c-lessons.mjs`.

**Risiken.** Lektionen hängen an Oberflächen-Details (Selektoren über `data-key`, nicht über Texte).

---

## 18. Nicht in v3 (später, wird nicht gebaut)

| Bereich | Inhalt | Quelle |
|---|---|---|
| Stimme/Audio | VS0 Mikro-Check (jederzeit vorziehbar), VS1–VS7, Audio-Spur, Sample-Import, Granular | §13, Stimme-Jam |
| Plattform | nativer Rechenkern C++ → WASM-SIMD, Android-/iOS-Hülle, AUv3; Duo-Layout; MIDI-Out; Zusammenarbeit über `db` | Master-Briefing 13, Vision E10/E11/E14 |
| Oberfläche | Skins BRÜCKE/STUDIO/RETRO (vorher Farb-Tokens); Hilfe-Modus (?-Modus, „Zeig mir“, Brotkrumen); Songtext/Guide | Master-Briefing 12, Vision E13 |
| Harmonie | Profi-Menü (TONART streng, Single Finger …), Folgeart nach Rolle, fremde Akkorde „Tonart behalten“ (E-Dur in a-Moll) – „Eine Skala“ ist in V2c′ vorgezogen | Vision E1, E3-25 |
| Jam | Clip-Ebenen (FANG ⤓, 👁), Rückung je Teil, Trig-Bedingungen A:B/FILL/1ST, Déjà vu, Blende A↔B (nutzt dann den Morph-Kern §6.4), Perform-Leiste, Pulszähler, Groove-Karte, BEGLEITER (KARMA-Prinzip) | Stimme-Jam, Master-Briefing 8 |
| Klang | Klang-Feinschliff (Startpegel Filter-Hk., Kurven, bipolarer Anschlag → Cutoff, Rauschfarben, Formant VOKAL, Kamm/Karplus, Ringmod, Bitcrusher/KÖRNUNG, Arp-Treppe, S&H in der Tonart, Oszilloskop je Spur); FM-Feld-Ausbau F5–F7 (Gruppen, „Ich will …“, Operator-Modi Ring/Fold, FORMANT-Operator, Operator-Hüllkurven als Mod-Quelle); Super-Synth (3 Schichten) + Kopplungsdreieck; KLANG-SCAN; Akkord-Resonanz; Masken-Formant; Klassiker-Instrument-Vorlagen | Master-Briefing 9–11, Vision |
| Mischen | Kontext-Master-Ausbau (Spektrum-Schätzung, Maskierungs-Ampel, Stilkurven), dynamischer EQ, Export WAV/Stems/Ausklang | Vision 1.1, Teil 7 |
| Locks | Spur-Locks (Sends, Pan), lockbare Mod-Tiefe | §7.6, E4 |
| Matrix | Synth → Drum (Tonhöhen auf Pads abbilden), Bearbeitungsmodus-Schalter (GarageBand-Prinzip) | v3-Konzept B3/B4 |
| Veröffentlichung | Teilen-/Lizenz-Paket: Schriften lokal einbetten (Google Fonts überträgt Betrachter-IPs), Info-Seite mit Rechtshinweisen; Markennamen sind ab V10b entfernt | R5-H10 5.4 |

---

## 19. Offene Fragen an Xander (nicht blockierend; der Bau nimmt die Vorgabe)

| # | Frage | Vorgabe im Bau |
|---|---|---|
| 1 | Meint „Peitschen-Ausklang“ den fallenden, resonanten Rausch-Sweep (Kit Resonanz-Perc)? | ja → Snare-Makro PEITSCHE |
| 2 | Passt ein Anschlag-Bereich von 12 dB? | 12 dB, im KIT einstellbar 0–24 |
| 3 | Teil-Wechsel live am nächsten Takt oder am Teil-Ende? | nächster Takt, je Teil umstellbar |
| 4 | Soll die Tastatur beim Song-Verschieben mitgehen? | ja |
| 5 | Reicht eine MELODIE-Spur (plus Synth 5/6)? | ja |
| 6 | Master-Startpunkt eher 80er-dynamisch (−14) oder modern-laut (Club −9)? | Streaming −14 |
| 7 | Hörprobe beim Sichern: aktueller Clip oder Phrase der Rolle? | aktueller Clip, sonst Phrase |
| 8 | Init-Projekt: Drums leer (INIT) oder Rom Pop? | INIT-Kit |
| 9 | Foto von Cover/Rückseite „Himmlische Klangdimensionen“; Enigma-Titel mit „Wal“-Klängen; Spock-Referenzlied; And-One-Titel auf „I.S.T.“ | Presets als Annäherung (Anhang A.1) |
| 10 | Wer bekommt den Link, hat die Person ein Claude-Konto, soll die App öffentlich werden? | privat; Austausch über die Projektdatei (.json) |
| 11 | Tastatur-Anschlag: aus der Tipp-Höhe (wie entschieden, E15) oder lieber fest? | Tipp-Höhe (POSITION), umschaltbar (E3-29) |
| 12 | „Eine Skala“ als Standard für neue Projekte – passt das Ergebnis beim Hören? | an; gespeicherte Projekte unverändert (E3-25) |

---

## Anhang A — Bibliothek v3

### A.1 Signature- und Rollen-Presets (46; V10b)

Namen nach E9 (eigene Namen). „ⓘ“ = Vorbild im Infotext mit Belegstatus; „[g]“ = Rezept offline gemessen (AnalogCore v1, trocken, Node; **nicht** die App-Kette, **nicht angehört**); „→ KF“ bzw. „→ PD“ = mit heutigen Mitteln angenähert, Endform erst mit dem Klang-Feinschliff (KF, §18: Bitcrusher, Ringmod, Arp-Treppe) bzw. mit PD (§11.4). Alle Phrasen sind **eigene** Melodien. Tempi und Tonarten sind Vorschläge.

**A – 80er-Synthpop-Hooks**

| # | Name | Rolle · Stil | Engine | Kern-Rezept | Phrase | ⓘ Vorbild · Beleg | Messung an / aus |
|---|---|---|---|---|---|---|---|
| 1 | Ketten-Riff | Lead · 80er | VA | Puls 50 % + Säge +7 ct (60 %), LP12 2,4 kHz, Res 15 %, Filter-Hk +18 HT D 0,15 s, Amp 2 ms/0,25 s/45 %, Chorus I, Echo 1/8 12 % [g] | 2 Takte Achtel-Riff, Tonwiederholung + Quart/Sext-Sprung, C5, 128 BPM, Dur | im Stil „Just Can't Get Enough“ (Depeche Mode); Lead Roland Jupiter-4 · belegt (SE, Thomann-Blog, Syntorial) | Schwerpunkt 5/200 ms: 2207/1580 Hz gegen 1548/1396 |
| 2 | Glasperlen-Poly | Akkord · 80er | VA | 2× Puls 35 % ±6 ct, LP24 3 kHz, Filter-Hk kurz, poly, Chorus II, Hall 1,5 s | Stakkato-Achtelakkorde I–V–vi–IV | Jupiter-artige Poly · Einschätzung | – |
| 3 | Fjord-Riff | Lead · 80er | VA | Säge + Puls 35 % (−6 ct, 70 %), LP24 3,2 kHz, Res 20 %, Filter-Hk +22 HT D 0,3 S 40 %, Amp D 0,35 S 55 %, Chorus I, Hall 1,2 s [g] | 16tel-Hook mit Oktavsprung, 160 BPM, A-Dur | im Stil „Take On Me“ (a-ha); Melodie Juno-60 · belegt (SE, Roland, Wikipedia; Spieler umstritten) | 3835/2974 gegen 1788/1855 Hz |
| 4 | Fjord-Bass | Bass · 80er | FM6 | Algorithmus-16-artig: Ausgang ×0,5, Modulatoren ×5 (OL 70, Anschlag 7) und ×9 kurz, FB 6, Transponieren −12 | Achtel-Oktavbass I–V–vi–IV | Stil; Bass-Gerät **unbelegt** | – |
| 5 | Nordlicht-Wellen | Fläche · 80er | WT | digital, Pos 0,5, Scan +0,4 über 2 s, LP24 6 kHz, A 0,1 R 2, Chorus II | lange Dur-Akkorde | PPG Wave im Song · belegt (SE, Wikipedia) | – |
| 6 | Kaltstart-Bass | Bass · 80er | VA | Säge mono, LP24 380 Hz, Res 30 %, Filter-Hk +32 HT D 0,12 S 0, Amp D 0,2 S 35 %, Drive 25 % [g] | 16tel-Oktavpuls mit Ghost-Noten, 124 BPM | früher Synthpop-Bass · Einschätzung | 192/111 gegen 107/110 Hz |
| 7 | Synth-Marimba 81 | Sequenz · 80er | VA | Dreieck + Sinus +12, LP12 2 kHz, Filter-Hk 60 ms, Amp D 0,18 S 0 | Achtel-Gegenmelodie | Einschätzung | – |

**B – Dunkel und kalt**

| # | Name | Rolle · Stil | Engine | Kern-Rezept | Phrase | ⓘ Vorbild · Beleg | Messung an / aus |
|---|---|---|---|---|---|---|---|
| 8 | Grauzone-Fläche | Fläche · Dunkel | VA | 2 Sägen ±12 ct + Dreieck −1 Okt, LP24 1,1 kHz, Res 35 %, LFO 2 Sinus 0,07 Hz → Cutoff ±1 Okt, A 1,2 s R 3 s, Chorus ENS, Hall 6–8 s [g] | Am → B♭ je 2 Takte, tiefe Lage, 96 BPM | im Stil And One „I.S.T.“ (1994) · Band belegt (SE), Geräte **unbelegt**, Rezept Einschätzung | Schwerpunkt min–max 248–816 gegen 405–526 Hz |
| 9 | Grauzone-Bass | Bass · Dunkel | VA | Säge mono, LP24 280 Hz, Res 45 %, Drive 35 %, Filter-Hk 80 ms, Route Anschlag → Filter-Hk 0,5, Pumpen von der Kick [g] | 16tel auf A mit ♭2-Nebennote, Akzent auf 1, 128 BPM | EBM-Bass · Einschätzung | Anteil > 400 Hz Akzent/normal −11,0/−13,6 gegen −13,3/−14,6 dB (Akzent schwach, K11) |
| 10 | Sirene im Nebel | Atmo · Dunkel | VA | nur Rauschen, BP24 600 Hz, Res 80 %, LFO 1 Dreieck 0,1 Hz → Cutoff ±2 Okt, A 2 s R 4 s, langer Hall [g] | ein Ton über 8 Takte | Einschätzung | 575–5450 gegen 1616–2399 Hz |
| 11 | Bunker-Kit | Drums · Dunkel | Drum ev3 | Kick TON 50 Hz, PUNCH 24 HT, DRIVE 50 %; Snare Rauschen BP 1,8 kHz + TON 190 Hz; RAUM lang; Clap 4 Hände; METALL-Perc | EBM-4/4 mit 16tel-Hats, 128 BPM | Einschätzung | – |
| 12 | Kaltes Glas | Keys · Dunkel | WT | glas, Pos 0,2 → Scan +0,6 über 1,5 s, LP24 4 kHz, A 10 ms D 1,5 S 50 % R 1,2, Chorus II, Hall 3 s | Moll-Arpeggio Achtel i–VI–III–VII | im Stil Static Movement; PPG · belegt (SE, Vorrunde) | – |
| 13 | Synthex-Streicher | Fläche · Dunkel | VA | Säge Uni 3 (30 %) + Säge +9 ct, LP12 2,5 kHz, A 0,4 R 1,5, Chorus I+II [g] | lange Moll-Akkorde | im Stil Static Movement; Elka Synthex · belegt (SE) | Seite/Mitte 0,32 gegen 0,08 |
| 14 | Herbstarp ⧉ | Sequenz · Dunkel | VA | Puls 30 % + Säge −1 Okt leise, LP24 1,8 kHz, Res 40 %, Filter-Hk D 0,12, Echo 1/8 punktiert 35 %, Hall 2,5 s | 16tel-Arpeggio i–VI–III–VII | im Stil The Frozen Autumn · Geräte **unbelegt** | – |
| 15 | Herbstglocke | Keys · Dunkel | FM6 | Algorithmus 5, Paare ×1/×3,5, FB 3, Hall 3 s | Moll-Viertelmelodie | Einschätzung | – |
| 16 | Schwedenstahl-Lead | Lead · Dunkel | VA | 2 Sägen +5 ct, LP24 2 kHz, Res 25 %, Legato, Glide 30 ms, Vibrato 5,5 Hz verzögert ±19 ct, Echo 1/4 [g] | getragene Moll-Melodie | im Stil Elegant Machinery · Geräte **unbelegt** | Vibrato Spitze-Spitze 34,5 gegen 0,4 ct |
| 17 | Schwedenstahl-Bass | Bass · Dunkel | VA | Säge + Puls −1 Okt, LP24 500 Hz, Filter-Hk mittel | Achtel-Bass Moll | Einschätzung | – |
| 18 | Sternfahrer-Hook | Lead · Modern | VA | Säge Uni 5 (35 %) + Puls +1 Okt 30 %, LP24 4,5 kHz, Filter-Hk D 0,25, Amp D 0,3 S 50 %, Echo 1/8 punktiert [g] | hymnischer Achtel-Hook, Dur → Moll | im Stil Spock · **nicht recherchiert** | Seite/Mitte 0,32 gegen 0,09 |
| 19 | Sternfahrer-Puls | Sequenz · Modern | VA | Säge-Oktav-Achtel, LP24 Filter-Hk kurz, Pumpen | Oktav-Achtel 132 BPM | Einschätzung | – |

**C – Enigma-Atmo**

| # | Name | Rolle · Stil | Engine | Kern-Rezept | Phrase | ⓘ Vorbild · Beleg | Messung an / aus |
|---|---|---|---|---|---|---|---|
| 20 | Bambusatem | Lead · Sphäre | VA (später Klangkörper) | Sinus 80 % + Dreieck 25 % + Rauschen 12 %, LP12 1,8 kHz, Keytrack 100 %, Hk 2 → Tonhöhe −1 HT in 120 ms, Hk 2 → Rauschen +30 %, Vibrato 5 Hz verzögert, Legato 40 ms, Hall 4 s [g] | pentatonische Moll-Phrase mit Vorschlägen, 90 BPM | Enigma „Sadeness“ („synthesized shakuhachi“) · Quelle des Klangs **unbelegt** | Abweichung nach 15/400 ms −32/−3 gegen +0,2/−3 ct |
| 21 | Tiefsee-Ruf | Atmo · Sphäre | VA | Sinus + Dreieck 40 %, Mono-Legato, Glide 0,7 s, LFO 2 0,2 Hz → Tonhöhe ±½ HT, BP12 700 Hz Keytrack, Hall 8 s, Echo 1/2 FB 50 % [g] | 3 lange Töne mit Glissandi | „Wal“-artig · Titel **unbelegt** | Glide nach 0,05/0,3/0,6/1,2 s −776/−262/−89/−44 ct gegen +21 ct sofort |
| 22 | Klosterhall-Chor | Fläche · Sphäre | WT | vocal, LP24 3 kHz, A 0,8 R 3, ENS, Hall 6 s (Grenze: Formanten wandern mit der Tonhöhe) | Quint-Bordun + Oktaven, dorisch | Mönchschor ohne Samples · Einschätzung | – |
| 23 | Ibiza-Dämmerung | Fläche · Sphäre | VA | Säge + Puls mit PWM, LP24 900 Hz, LFO langsam, A 2 s, Hall 5 s, Chorus | Moll9-Akkorde | Einschätzung | – |
| 24 | Kloster-Beat | Drums · Sphäre | Drum ev3 | Kick weich DECAY 0,6 s; Snare TON + Rauschen, RAUM 1,4; Shaker; Tom tief | Halftime-Groove 96 BPM | Einschätzung | – |
| 25 | Tempelgong | Atmo · Sphäre | FM6 | Algorithmus 1, Modulator ×1,41, OL 80, lange R2, FB 2, Hall 8 s | Einzelschläge | Einschätzung | – |

**D – Chip, C64, Mega Drive, Computer**

| # | Name | Rolle · Stil | Engine | Kern-Rezept | Phrase | ⓘ Vorbild · Beleg | Messung an / aus |
|---|---|---|---|---|---|---|---|
| 26 | Brotkasten-Lead | Lead · Chip | VA | Puls 25 %, LFO 1 Dreieck 3 Hz → PW ±18 %, LP12 offen, Amp 1 ms/100 %/50 ms, Analog 0, Vibrato 6 Hz verzögert [g] | schnelle Melodie mit 1/32-Vorschlägen | C64-SID, Welle:Erdball · belegt (SE) | Schwerpunkt min–max 4337–6245 gegen 3972–4639 Hz |
| 27 | Brotkasten-Triller | Lead · Chip | VA | Puls 25 %, Osz. +6 HT, LFO Rechteck 25 Hz → Tonhöhe ±6 HT (Oktav-Triller) [g] | ein langer Ton | SID · Einschätzung | Tonhöhen 2 gegen 1 |
| 28 | Brotkasten-Arp ⧉ | Sequenz · Chip | VA → KF | Puls 50 %, ohne Filter; mitgebrachter Clip mit 1/32-Akkordzerlegung | Dur/Moll-Kadenz zerlegt | SID · Einschätzung | – |
| 29 | Brotkasten-Bass | Bass · Chip | VA | Säge, LP12 600 Hz, Res 60 %, Amp kurz | Achtel-Oktavbass | SID-Filter · Einschätzung | – |
| 30 | Brotkasten-Drums | Drums · Chip | Drum ev3 → KF | Kick Dreieck-TON 200 → 50 Hz in 40 ms + 10 ms Rauschen; Snare Rauschen 30 ms + TON-Fall; Hats Rauschen HP 20 ms | Achtel-Beat 130 BPM | SID-Drums · Einschätzung | – |
| 31 | 16-Bit-Slap | Bass · Chip | FM6 | Algorithmus 5 mit stummem Paar, Modulator ×1 OL 85, FB 6, Modulator ×2 kurz, ganzzahlige Verhältnisse | synkopierter 16tel-Slap 140 BPM | Mega Drive YM2612 (6 Kanäle × 4 Op, 8 Algorithmen) · belegt (SE) | – |
| 32 | 16-Bit-Held | Lead · Chip | FM6 | Algorithmus 1, OP3–6 (OP1/2 aus), Verhältnisse 1/1/2/1, FB 4, Vibrato verzögert | Melodie mit Halbton-Rückung | YM2612 · belegt (SE) | – |
| 33 | 16-Bit-Brass | Akkord · Chip | FM6 | 2 Ausgänge ×1 + Modulator ×1, FB 6, Modulator-Attack langsamer | synkopierte Stabs | YM2612 · Einschätzung | – |
| 34 | 16-Bit-Kit | Drums · Chip | Drum ev3 → KF | Kick Sinus-Fall + KLICK Puls; Snare Rauschen + TON; Hats kurzes Rauschen | Breakbeat-artig, 2 Takte | PCM über Kanal 6 · belegt (SE) | – |
| 35 | Dateneingabe ⧉ | Sequenz · Chip | VA | Sinus + Puls +1 Okt (30 %), S&H 14 Hz → Tonhöhe ±12 HT (Start NOTE), HP12 300 Hz, Amp 1 ms/50 ms/60 %/30 ms, Echo 1/16 Ping-Pong [g] | mitgebrachter 1/32-Clip über 2 Takte | Film-Computer · Einschätzung | Tonhöhen in der 1. Note 4 gegen 1 |
| 36 | Lochstreifen ⧉ | Sequenz · Chip | FM6 | Algorithmus 32, feste Frequenzen 1 kHz/1,5 kHz, kurze Piepser | Morse-artige 16tel | Einschätzung | – |
| 37 | Modemzwitschern | Atmo · Chip | VA | Osz. 2 SYNC + S&H 20 Hz → Tonhöhe Osz. 2, Rauschen 10 %, BP | Bursts über 2 Takte | Einschätzung | – |
| 38 | Rechenzentrum ⧉ | Sequenz · Chip | WT | digital, Scan über S&H, kurzer Pluck, Echo | zufällige 16tel in der Tonart | Einschätzung | – |

**E – CZ-Charakter und Weihnacht** (Annäherung; genauer mit PD §11.4)

| # | Name | Rolle · Stil | Engine | Kern-Rezept | Phrase | ⓘ Vorbild · Beleg | Messung an / aus |
|---|---|---|---|---|---|---|---|
| 39 | Sternenglocke | Keys · Weihnacht | FM6 → PD | Algorithmus 5, Modulator ×3,5 kurz, Ausgang mit langem R3, trocken | eigenes Weihnachtsmotiv in Vierteln, Dur | CZ-Glocke · Einschätzung | – |
| 40 | Winterchor | Fläche · Weihnacht | WT → PD | vocal-Tabelle, A 0,6 s | I–IV–V | Einschätzung | – |
| 41 | Lichterstreicher | Fläche · Weihnacht | VA → PD | 2 Sägen ±8 ct, LP12 1,2 kHz, Filter-Hk A 0,35 s +22 HT [g] | lange Dur-Akkorde | CZ „1+1′“-Prinzip · Einschätzung | Schwerpunkt 50/600 ms 986 → 1483 gegen 744 → 908 Hz |
| 42 | Kristallflöte | Lead · Weihnacht | VA → PD | Dreieck + Sinus +12 (30 %), LP12 4 kHz, Vibrato verzögert, Rauschen 3 % | Weihnachtsmelodie (eigene) | Einschätzung | – |
| 43 | Spieluhr | Keys · Weihnacht | FM6 | Algorithmus 5, Ausgänge ×1 und ×4, kurze Decays | 3/4-Motiv | Einschätzung | – |
| 44 | Schlittenglöckchen | Drums · Weihnacht | Drum ev3 | METALL hoch + kurzes Rauschen, WIRBEL 16tel | Schellenkranz in Achteln | Einschätzung | – |

**F – Kits und moderne Rollen**

| # | Name | Rolle · Stil | Engine | Kern-Rezept | Phrase | ⓘ Vorbild · Beleg | Messung an / aus |
|---|---|---|---|---|---|---|---|
| 45 | Studio 82 | Drums · 80er | Drum ev3 | = Kit aus V1c (Anhang B.4) | 4/4 mit 16tel-Hats, 118 BPM | LinnDrum-artig (Samples im Original) · belegt (SE, Songfacts zu „Take On Me“) | – |
| 46 | Schwerer Slap | Bass · Modern | VA | Mono-Legato, Säge + Puls verstimmt, Sinus-Sub, LP24 A 0 D 0,2 S 0,2, Hk 2 → Tonhöhe fällt, Glide 60 ms, Drive 50 %, Pumpen | Offbeat-Achtel | Slap House · belegt (SE, Vorrunde) | – |

### A.2 INIT-Sounds (V0b; ab V8/V9 ergänzt)

| Name | ab Paket | Engine | Werte |
|---|---|---|---|
| INIT Analog | V0b | VA | Osz. 1 Säge 8′, Osz. 2/3 Anteil 0, Sub 0, Rauschen 0; LP24 Cutoff 20 kHz, Res 0, Filter-Hk 0, Keytrack 0; Amp A 2 ms, D 0,3 s, S 100 %, R 150 ms; Poly 8, Glide 0; keine Routen; Drive 0, Chorus aus, Sends 0; Klang-Pegel kalibriert −18 LUFS |
| INIT FM | V0b | FM6 | Algorithmus 1, nur OP1 Ausgang OL 99 ×1 (Sinus), alle anderen OL 0; Hüllkurve R 99/99/99/60, L 99/99/99/0; FB 0 |
| INIT Tabelle | V0b | WT | Tabelle 1, Position 0, Scan 0, sonst wie INIT Analog |
| INIT Drums | V0b | Drum **ev2** | 12 Pads mit den WP6-`DEFAULTS` ihres Modells, Pad-Pegel .85, Raum 0, Gate 0, keine Locks (ev3, B.2-Makros und `kit.dynDb` gibt es erst ab V1a) |
| INIT Drums | V1a (ersetzt) | Drum ev3 | 12 Pads mit den Standardwerten ihres Typs (Anhang B.2 Spalte „Std.“), Raum 0, Gate 0, DYN 12 (`kit.dynDb`) |
| INIT Bitmask | V8b | Bitmask | Osz. 1 POOL[0] (Sinus), DELTA 0, Osz. 2 Anteil 0, Rauschen 0 |
| INIT Additiv | V9a | Additiv | Balken 1 = 100 %, sonst 0; A = B |
| INIT Klangkörper | V9b | Klangkörper | 16 harmonische Teiltöne 1/n, T1 = T2 = 2 s, B 0, keine Rauschbänder |

### A.3 Werks-Sounds der neuen Engines

- **Bitmask (V8b):** „Masken-Bass“ (UNTERTON P 2, DELTA −40, kurze M-Hk.), „Digitalorgel“ (Pool-Mitte, Osz. 2 +12), „Klirrfläche“ (DELTA +80 langsam, Hall), „Euklid-Pluck“ (Euklid 5/16, kurze Amp-Hk.).
- **Additiv (V9a):** „Zugriegel-Orgel“, „Glas A→B“.
- **Klangkörper (V9b):** die 6 Vorlagen (Klavier, Saxofon, Sphäre, Böse, Sprechend, Brüllen).
- Alle: −18 LUFS, PR8, ⓘ-Text mit „Einschätzung“.

### A.4 Umbenennung nach E9 (V10b; Alias bleibt)

| Alt | Neu |
|---|---|
| Moog-Bass | Kaskaden-Bass |
| Prophet-Poly | Fünfer-Poly |
| Juno-Streicher | DCO-Streicher |
| Juno-Pad | DCO-Fläche |
| OB-Brass | Zweipol-Brass |
| Acid 303 | Säure-Bass |
| Moroder-Puls | Disko-Puls |
| DX-Tines E-Piano | Zinken-Piano |
| Pop-Bass DX | Pop-Bass FM |
| DX-Brass | FM-Brass |
| Kit 808 / 909 | Boom 80 / Hybrid 83 (schon V1c) |

Prüfliste V10b-04: kein Sound-, Kit- oder Vorlagenname enthält „Moog“, „Prophet“, „Juno“, „OB-“, „303“, „808“, „909“, „DX“, „Moroder“, „Jupiter“, „Virus“, „Nord“, „Linn“, „Simmons“, „CZ“ oder einen Künstler- oder Titelnamen. Vorbilder stehen nur im ⓘ-Text.

---

## Anhang B — Drum-Instrument-Tabellen

### B.1 Slots, Typen, Pads

| Slot | GM | Typ | Pad P (4×3) | Pad L (6×2) |
|---|---|---|---|---|
| KICK | 36 | KICK `bd` | 1 | 1 |
| SNARE | 38 | SNARE `sd` | 2 | 2 |
| RIM | 37 | RIM `rs` | 3 | 3 |
| CLAP | 39 | CLAP `cp` | 4 | 4 |
| HH ZU | 42 | HH `ch` | 5 | 5 |
| HH OFFEN | 46 | HH `oh` | 6 | 6 |
| TOM TIEF / MITTE / HOCH | 45 / 47 / 50 | TOM `tm` | 7 / 8 / 9 | 7 / 8 / 9 |
| BECKEN | 49 | BECKEN `cy` | 10 | 10 |
| PERC | 56 | PERC `cb`/`fm` | 11 | 11 |
| SHAKER | 70 | SHAKER `sh` | 12 | 12 |

### B.2 Makros je Typ (Abbildung auf `DrumSynth.DEFAULTS`)

„Std.“ = Wert im INIT-Kit (Rom Pop und die WP6-Kits behalten ihre Engine-Werte). „führend“ = Schlüssel, aus dem der Makro-Wert zurückgerechnet wird. Kurven: exp = exponentiell, lin = linear. Gemessen = Prototyp/WP6 laut R5-H1 (Anschlag 0,9 / 0,45).

**KICK `bd`**

| Makro | Abbildung | Bereich | Std. | Wirkung · gemessen |
|---|---|---|---|---|
| TON | `frq` (führend) | 35–90 Hz exp, Anzeige Hz + Notenname | 50 Hz | Grundton · Handy +6,7/+7,2 dB, Schwerpunkt 1 Okt |
| PUNCH | `pAmt` | 0–36 HT lin | 24 | Tonhöhen-Sprung · Handy +7,5/+6,8 dB |
| DECAY | `tDec` (führend), `tHld = 0,05·tDec` | 0,12–1,5 s exp | 0,45 s | Länge · Ausklang ×9,4/×9 |
| KLICK | `cLvl`, `cTyp` Puls, `cHp` 1000 | 0–1 lin | 0,5 | Schlägel 1–8 kHz · +11,9/+11,7 dB (4–12 kHz); WP6 ≤ 1,3 dB |
| BISS | `bss` (führend); abgeleitet `fmI = bss^0,7·IMAX(bssR)`, `fmDec = 0,03 + 0,15·bss`, `o2r = bssR` | 0–1 | 0 | §3.2.3 · ×3: Handy +9,8/+9,3 dB |
| DRIVE | `drv` (Pegel nach AR1, Auto-Gain) | 0–1 lin | 0,3 | Sättigung · Obertöne +7,4 dB bei jedem Anschlag |
| Fein: SWEEP | `pDec` | 10–150 ms exp | 45 ms | Handy +6,2 dB |
| Fein: ART | `bssR` ∈ {0,5, 1, 2, 3, 4} | Chips | ×1 | – |

**SNARE `sd`**

| Makro | Abbildung | Bereich | Std. | Wirkung · gemessen |
|---|---|---|---|---|
| TON | `frq` | 120–400 Hz exp | 195 | Fellstimmung · Schwerpunkt +0,46 Okt |
| KÖRPER | `tDec` | 0,03–0,6 s exp | 0,18 | Fell-Ausklang · +44 dB (180–400 Hz, 30–150 ms) |
| SNAPPY | s → `tLvl = 1 − 0,65·s`, `nLvl = 0,05 + 1,15·s` (führend `nLvl`) | 0–1 | 0,6 | Fell ↔ Teppich · Schwerpunkt +3,7 Okt |
| ANSATZ | `nAtk` | 0–40 ms (Kurve x²) | 0 | Rauschen mit eigenem Attack · Schwerpunkt +0,43 Okt |
| AUSKLANG | `nDec` | 0,04–0,8 s exp | 0,24 | Teppich-Länge · Ausklang ×7,3 |
| PEITSCHE | p → `nEnv = 2·p` Okt, `nQ = 0,5 + 2,5·p`, `nEnvDec = 0,08` (führend `nEnv`) | 0–1 | 0 | fallender, resonanter Rausch-Sweep (Deutung **unsicher**, Frage 19.1) · Schwerpunkt −0,5 Okt |
| Fein: FARBE | `nCol` 0/1 | weiß/rosa | weiß | – |
| Fein: RAUSCH-TON | `nFrq` | 1–12 kHz exp | 4 kHz | – |

**RIM `rs`** (5 Makros)

| Makro | Abbildung | Bereich | Std. |
|---|---|---|---|
| TON | `frq` | 250–900 Hz exp | 420 |
| HOLZ | `o2` (Anteil), `o2r` aus HOLZ-ART | 0–1 | 0,8 |
| AUSKLANG | `tDec` | 5–120 ms exp | 22 ms |
| KNACK | `drv` | 0–1 | 0,4 |
| RAUSCHEN | `nLvl`, `nTyp` highpass, `nFrq` 4000 | 0–1 | 0 |
| Fein: HOLZ-ART | `o2r` ∈ {3,4, 3,7, 4,1} | Chips | 3,7 |

**CLAP `cp`**

| Makro | Abbildung | Bereich | Std. |
|---|---|---|---|
| TON | `nFrq` (BP) | 0,5–4 kHz exp | 1,5 kHz |
| HÄNDE | `nBur` | 2–6 ganzzahlig | 4 |
| ABSTAND | `nGap` | 4–30 ms exp | 9,5 ms |
| AUSKLANG | `nDec` | 0,05–1,2 s exp | 0,22 s |
| SCHÄRFE | `nQ` | 0,7–6 exp | 1,1 |
| RAUM | `sRoom` | 0–1 | 0,2 |
| Fein: VARIATION | `var` | 0–1 | 0,5 |

**HH ZU `ch` / HH OFFEN `oh`**

| Makro | Abbildung | normal | EXTREM | Std. ZU / OFFEN |
|---|---|---|---|---|
| METALL | `mTun` | 0,5–2 exp | 0,25–4 | 1,4 |
| FARBE | `mHp` | 3–12 kHz exp | 1–16 kHz | 7,5 kHz |
| DECAY | `mDec` (führend), `nDec = mDec` | ZU 10–300 ms / OFFEN 80 ms–2 s | bis 4 s | 35 / 300 ms |
| RAUSCHEN | r → `mLvl = 1 − 0,9·r`, `nLvl = 0,1 + 0,9·r` (führend `nLvl`) | 0–1 | – | 0,45 |
| KLINGEN | `mQ` | 0,5–4 exp | bis 12 | 1,5 |
| FM | `fmI` auf Ton-Schicht (`frq` 1530 Hz, `o2r` 2,73; `tLvl` automatisch 0,4, wenn FM > 0) | 0–8 | 0–16 | 0 |
| Fein | CHOKE [–│1│2] (ZU würgt OFFEN in Gruppe 1) · EXTREM · VARIATION (Std. 0,5) | | | |

Gemessen: METALL normal Band +8,4 dB, EXTREM +21,7 dB (4–12 kHz); FM 0 → 16 Schwerpunkt +1,5 Okt; mehr METALL macht wegen fester Bandpässe **nicht** heller (−0,2 Okt) ⇒ FARBE eigener Regler.

**BECKEN `cy`**

| Makro | Abbildung | normal | EXTREM | Std. |
|---|---|---|---|---|
| METALL | `mTun` | 0,5–2 | 0,25–4 | 1,0 |
| FARBE | `mHp` | 2–10 kHz | 1–16 kHz | 5 kHz |
| DECAY | `mDec` | 0,3–4 s | bis 8 s | 1,6 s |
| KÖRPER | `mLo` | 0–1,5 | – | 0,5 |
| RAUSCHEN | `nLvl` | 0–1 | – | 0,3 |
| FM | `fmI`, `o2r` 1,47 | 0–16 | 0–24 | 0 |

**TOM `tm`** (drei Pads)

| Makro | Abbildung | Bereich | Std. T / M / H |
|---|---|---|---|
| TON | `frq` | 50–400 Hz exp | 110 / 150 / 210 |
| BEND | `pAmt` (Engine: negative Werte = Anstieg, neu) | −12 … +36 HT | +12 |
| BEND-ZEIT | `pDec` | 10–800 ms exp | 300 ms |
| DECAY | `tDec` | 0,05–1,5 s exp | 0,5 s |
| FELL | `nLvl` (LP-Rauschen, `nTyp` lowpass, `nFrq` 1200) | 0–1 | 0,25 |
| BISS | wie Kick, ART ×1/×2/×3 | 0–1 | 0 |
| Fein | WELLE [Sinus│Dreieck] (`wav`) · [Toms gemeinsam stimmen] (alle drei im Verhältnis, ein Undo) | | |

**PERC `cb`/`fm`**

| Makro | Abbildung | normal | EXTREM | Std. |
|---|---|---|---|---|
| TON | `frq` | 100–4000 Hz exp | – | 540 Hz |
| FARBE | `fmI` (bzw. `tfFrq` bei Charakter KUHGLOCKE) | 0–8 | 0–16 | 2 |
| VERHÄLTNIS | `o2r` ∈ {0,5, 1, 1,41, 2, 2,73, 3,5, 5} | Stufen | – | 1,41 |
| DECAY | `tDec` | 0,03–2 s exp | bis 4 s | 0,25 s |
| BEND | `pAmt` | −24 … +36 HT | – | 0 |
| FORM | `tCrv` | 0–1 (exp ↔ „gated“) | – | 0 |
| Fein | Charakter-Chips (B.6) · EXTREM | | | |

**SHAKER `sh`**

| Makro | Abbildung | Bereich | Std. |
|---|---|---|---|
| TON | `nFrq` | 3–14 kHz exp | 8 kHz |
| ANSATZ | `nAtk` | 1–40 ms exp | 6 ms |
| DECAY | `nDec` | 20–300 ms exp | 80 ms |
| SCHÄRFE | `nQ` | 0,7–4 exp | 1,2 |
| SCHELLEN | `mLvl` | 0–1 | 0 |
| VARIATION | `var` | 0–1 | 0,5 |

**Gemeinsame Zeilen (alle Typen):** FILTER `hfTyp/hfFrq/hfRes` (§3.2.5) · MIX Pad-Pegel `lvl`, Pan `pan`, Raum `sRoom`, Gate `sGate` (§3.4).

### B.3 TIEFE-Schichten je Typ (sichtbar; weitere über [+ Schicht])

| Typ | Schichten |
|---|---|
| KICK | TON (Welle, Hold, Kurve, Knack `tSpk`) · BISS (Index-Zeit fein, Osz. 2 hörbar `o2`, Ton-Filter `tf*`, „Index frei“) · KLICK (Typ, Ton `cTon`, Hochpass `cHp`) · FILTER (Hüllkurve) · ANSCHLAG · AUSGANG |
| SNARE | TON · RAUSCHEN (Typ, Q, HP, Sweep `nEnv`, `nEnvDec`, Kurve) · FILTER · ANSCHLAG · AUSGANG |
| RIM | TON · RAUSCHEN · KLICK · FILTER · ANSCHLAG · AUSGANG |
| CLAP | RAUSCHEN (Hände, Abstand, Typ, Q, HP, Kurve) · FILTER · ANSCHLAG · AUSGANG |
| HH | METALL (Hi/Lo, Q, Attack, Hold, Kurve) · RAUSCHEN · FM · FILTER · ANSCHLAG · AUSGANG |
| BECKEN | METALL · RAUSCHEN · FM · FILTER · ANSCHLAG · AUSGANG |
| TOM | TON · BISS · RAUSCHEN (Fell) · KLICK · FILTER · ANSCHLAG · AUSGANG |
| PERC | TON · FM · KLICK · FILTER · ANSCHLAG · AUSGANG |
| SHAKER | RAUSCHEN · METALL (Schellen) · FILTER · ANSCHLAG · AUSGANG |

AUSGANG enthält: Pad-Pegel, Pan, Raum, Gate (wenn die MIX-Zeile ausgelagert ist), Choke-Gruppe, Poly (Becken/Tom/Perc), Pad-Quelle.

### B.4 Kit-Startwerte (V1c; nachstimmen mit DR1/PR8)

| Kit | ⓘ Vorbild (eK) | Kick | Snare / Clap | Hats | Toms / Perc |
|---|---|---|---|---|---|
| **Boom 80** | TR-808 (1980): analog, Kick als Resonator mit langem Decay, Hats aus 6 Rechtecken | TON 49 · PUNCH 7 · SWEEP 90 ms · DECAY 1,1 s · KLICK 35 % · DRIVE 12 % | TON 238 · KÖRPER 0,16 · SNAPPY 75 % · AUSKLANG 0,2 / Clap TON 1,1k · HÄNDE 4 · ABSTAND 11 ms · RAUM 15 % | METALL 1,0 · FARBE 7k · RAUSCHEN 0 · DECAY 45 / 420 ms | Toms 98/140/200 · BEND 3 · DECAY 0,45 / Perc KUHGLOCKE 540/800 Hz |
| **Hybrid 83** | TR-909 (1983): Kick mit Sweep und Attack, Snare mit Snappy, Hats als Samples | TON 52 · PUNCH 30 · SWEEP 50 ms · DECAY 0,5 · KLICK 55 % · DRIVE 30 % | TON 180 · SNAPPY 100 % · RAUSCH-TON 7k / Clap HÄNDE 4 · ABSTAND 9,5 ms | METALL 1,25 · FARBE 8k · RAUSCHEN 45 % | Toms 90/120/165 · BEND 7 · BEND-ZEIT 120 ms |
| **Studio 82** | LinnDrum (1982): Samples echter Drums, hier nur synthetisch angenähert | TON 60 · PUNCH 10 · SWEEP 30 ms · DECAY 0,28 · KLICK 25 % · BISS ×3 45 % · DRIVE 15 % · LP 5 kHz | TON 190 · KÖRPER 0,15 · SNAPPY 65 % · ANSATZ 2 ms · RAUM 25 % / Clap HÄNDE 5 · ABSTAND 8 ms · RAUM 30 % | RAUSCHEN 85 % · METALL 1,6 · FARBE 9k · DECAY 40 / 280 ms | Toms 100/140/190 · BISS ×2 30 % / SHAKER als Cabasa (TON 9k, ANSATZ 6 ms, DECAY 80 ms) · RIM als Sidestick |
| **Hexa 81** | Simmons SDS-V (1981): Module aus Ton, Rauschen, Bend, Klick | TON 62 · PUNCH 18 · SWEEP 120 ms · DECAY 0,35 · KLICK 60 % · LP 3 kHz RESO 30 % | TON 230 · SNAPPY 55 % · PEITSCHE 50 % · GATE 40 % | wie Gated 84 | Toms 85/120/170 · BEND 14 · BEND-ZEIT 0,55 s · DECAY 0,75 · FELL 25 % · KLICK 50 % · LP 2,5k RESO 25 % |

### B.5 ANSCHLAG-Zuordnungen je Typ (TIEFE › ANSCHLAG, AR2)

| Typ | Zuordnungen (Std.) |
|---|---|
| KICK | → Punch 30 % · → Biss 40 % · → Filter 0,5 Okt · → Decay 0 |
| SNARE | → Snappy 30 % · → Filter 0,5 Okt · → Decay 0 |
| TOM | → Bend 30 % · → Biss 40 % · → Filter 0,5 Okt · → Decay 0 |
| alle anderen | → Filter 0,5 Okt · → Decay 0 |
Dazu je Kit: ANSCHLAG-BEREICH `kit.dynDb` 0–24 dB (Std. 12).

### B.6 PERC-Charakter-Chips (Startwerte, Hörtest)

| Chip | Werte |
|---|---|
| KUHGLOCKE | `wav` square, `frq` 540, `o2` 1, `o2w` square, `o2r` 1,48 (≈ 800 Hz), `tfTyp` bandpass, `tfFrq` 2600, `tDec` 0,25, `fmI` 0 |
| GLOCKE | `wav` sine, `frq` 800, `fmI` 4, `o2r` 3,5, `fmDec` 0,6, `tDec` 1,2 |
| HOLZ | `wav` sine, `frq` 600, `fmI` 2,5, `o2r` 3, `fmDec` 0,03, `tDec` 0,06 |
| TROPFEN | `wav` sine, `frq` 900, `pAmt` −12 (Anstieg), `pDec` 0,05, `tDec` 0,12 |
| ZAP | `wav` sine, `frq` 200, `pAmt` 36, `pDec` 0,08, `tDec` 0,15 |

---

## Anhang C — Messverfahren (Einzelheiten)

- **Render:** Drums mit `drumRender(slot, vel, {seed})` (offline, App-Code, 48 kHz) bzw. `r5/h1/ana.js`; Synth mit dem extrahierten Worklet wie WP4/WP7 (`fm-node.mjs`, `fm-pr1.mjs`). Zufall: `__seed(n)`; in Vergleichen mit älteren Snapshots `Math.random` durch denselben Seed-Generator ersetzen.
- **M-BAND / H-1:** Bänder §0.3, FFT 4096 mit Hann über das Fenster; „relevant“ ≤ 30 dB unter dem stärksten Band.
- **M-HANDY:** Butterworth-Hochpass 4. Ordnung 220 Hz, Energie 0–150 ms (wie DR9).
- **H-7 Interferenz:** Schichten einzeln (andere Schichten Anteil 0, Phasen gleich) und zusammen rendern; Band 150–600 Hz bei Kick/Tom, 150–1200 Hz bei Snare.
- **M-KLICK:** Hochpass 5 kHz (4. Ordnung), 2-ms-Fenster; Grenze +6 dB über dem Median ±20 ms; Fenster ≤ 3 ms nach geplanten Anschlägen ausgenommen (Liste aus `noteLog`). Basis: `dirigent-test/wp4-gates.mjs`.
- **Pump-Hub:** Verfahren `r5/h2610/pump.mjs` (Reduktion je 10 ms aus dem Master-Worklet-Bericht statt Modell; Fenster je Schlag, max − min, Mittel).
- **LUFS/TP-Referenz:** `v3-ideen/r2/mix-messung.mjs`.
- **Goertzel-Pegel einer Note:** 50-ms-Fenster, Zielfrequenz der Note, ±10 ct.
- **M-ANSICHT:** `viewState()` je Bild (rAF) protokollieren; erlaubt sind Änderungen nur an Seitengrenzen (FOLGT) bzw. keine (HÄLT, auch „von Hand“).
- **M-EINBRUCH:** Mitschnitt am Spur-Ausgang, M-PEGEL in 5-ms-Fenstern (Schritt 1 ms) von −50 ms bis +50 ms um den Umschaltpunkt; Bezug = Mittel der Fenster −50 … −10 ms; kein Fenster mehr als 3 dB darunter. Gehaltene Testnote mit Sustain 100 %, keine Modulation.
- **Startzeit:** 5 Kaltstarts (neuer Browser-Kontext je Lauf), Median; Paket-Suite allein (§15.3).
- **M-PLATZ:** wie die DoD-Skripte von WP6/WP7 (`wp6-dod.mjs`), ergänzt um die neuen Zustände je Paket.
- **CPU:** `engineInfo().perTrack[i].load` Median 10 s, Paket-Suite allein laufen lassen (unter Parallel-Last steigen die Werte, siehe CHANGES-WP6).

---

## Anhang D — Quellen (Auswahl; vollständige Listen in den Konzeptdateien)

- **R5-Berichte (dieses Paket):** Audit am WP6-Stand (`r5/audit/`), H1 Drum-Editor (`r5/h1/`), H3–H5 Song/Editor/Klangzustände (`r5/h345/`), H2/H6/H10 Mischung/Master/Mod (`r5/h2610/`), H7/H8/H10 Bibliothek/Additiv (`r5/h7810/additiv-bench.*`, `rezept-check.*`).
- **Drums (SE):** Nord Drum 3P (nordkeyboards.com, kraftmusic, vintageking); Waldorf Attack 3 (synthanatomy, KVR, rubadub); Ruismaker FM (synthanatomy 2016, Guide über manualzz, App Store); DrumBrute Impact (musicradar, audiotechnology); Elektron Model:Cycles (musictech, bonedo); Korg Volca Drum (musicradar, gearnews); Roland TR-8S (Roland Indonesia, musicradar). FM-Grundlagen: Cycling '74 MSP Tutorial 11, UW cse466 (SE).
- **Song/Live (SE):** TC-Helicon VoiceLive 3 Extreme (reverb, gear4music, fullcompass); Ed Sheeran „Chewie“ (equipboard, reverb); Ableton Follow Actions (help.ableton.com, Sound on Sound); Bitwig Next Action; Novation Circuit Tracks; OP-XY (teenage.engineering); Yamaha Genos Chord Looper/Registrierung (yahaha-Doku, direkt, Sekundärquelle; Handbuch SE); Montage-Szenen/SSS (yamahasynth.com); Kemper/Cherry Audio Scene Manager; Loopy Pro (Forum).
- **Mod/Master:** Vital (Quellcode `modulation_matrix.cpp`, `synth_base.cpp`, direkt); Serum, Bitwig, Phase Plant (SE); iZotope Ozone/Neutron, Logic Mastering Assistant, sonible smart:EQ 4, RoEx (SE); BS.1770 (SE); Sidechain-Hochpass-Praxis (SE).
- **FM/Bitmask (SE):** Kodamo EssenceFM/Mask1 [KO1–KO8, MA1–MA5] laut Master-Briefing Teil 10.
- **Bibliothek (SE):** Thomann-Blog/Syntorial („Just Can't Get Enough“, Jupiter-4); Roland/Wikipedia/Songfacts („Take On Me“, Juno-60, LinnDrum); Wikipedia/segaretro (YM2612); Equipboard (Enigma-Geräte); juno.co.uk/uDiscover („synthesized shakuhachi“); Wikipedia (And One, Elegant Machinery, The Frozen Autumn); de.wikipedia (Casio CZ).
- **Recht und Plattform:** Claude-Hilfe „Publishing and sharing artifacts“ (direkt; erneut 14.10.2026 als SE: veröffentlichte Artifacts kann jeder mit dem Link öffnen und benutzen, „Customize“ legt eine eigene Kopie im Konto der anderen Person an, das Original bleibt unverändert; Details je Tarif verschieden); Anthropic Consumer Terms ab 08.10.2025 (direkt); § 23 MarkenG (SE); MDN-Kompatibilitätsdaten (direkt, Runde 4).
