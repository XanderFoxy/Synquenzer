# SYNQUENZER — Resynthese-Pakete V9d · V9d′ · V9e (Entwurf R8)

Stand 17.10.2026, überarbeitet nach Review R8 (Anhang am Ende) · Status: **Entwurf zur Freigabe** (Orchestrator, danach Xander) · Ergänzt Spec v3 §11 und Nachtrag 1 A.11, **ersetzt V9c** · Anlass: Xanders Nachtrag vom 17.10. („Frequenzanalysen lesen, realistische Natur- und Instrumentenklänge nachbilden, z. B. Löwengebrüll oder Saxophon“, `v3-ideen/fragen-xander-9.md`, letzter Abschnitt; dazu `fragen-xander-5.md` H8: Klavier, Löwe, Sax, sphärisch, böse, „sprechend“). Klarstellung vom 17.10.: Es gibt **kein** Additiv-Dokument von Xander; gewünscht ist „ein additiver Synth, der resynthetisieren kann“ (`fragen-xander-9.md`). Damit ist Nachtrag-Frage E.2 erledigt.

**Grundlagen (gelesen):** Recherche `r8/resynthese-recherche.md` (Stand der Technik, Bänke) · Prototyp `r8/resyn-prototyp.md` mit Code und Messungen in `r8/resyn-proto/` · Spec v3 §0.2–0.6, §11, §13–17 · Nachtrag 1 N0.3, N0.5, A.11, A.13, Teil C, VS · `r7/stimme.md` (Mikrofon, VS0–VS7; liegt jetzt vor) · `r7/online.md` (Supabase, Grenzen).
**Neue Messungen dieser Runde:** Ordner `r8/resyn-pakete/` (Node 22, Xeon 2,1 GHz, VM unter wechselnder Last; **kein Worklet im Browser, kein iPhone, kein Hörtest**). Liste in §13.

**Kennzeichen**
- **BELEGT** = Quelle mit URL direkt gelesen (bzw. lokale Datei).
- **BELEGT (SE)** = nur der Suchauszug der genannten Quelle; die Seite war aus der Sitzung nicht abrufbar (Freesound, Wikimedia, Iowa, curia: Proxy 403 bzw. DNS).
- **BELEGT (gemessen)** = eigene Messung, Skript und Ausgabe genannt.
- **WAHRSCHEINLICH** = Folgerung aus Belegen oder Messungen.
- **UNBELEGT** = eigene Kenntnis, Schätzung oder ungeprüfter Wert.
- **Vorschlag** = Festlegung dieses Entwurfs (keine Tatsachenbehauptung).

Abkürzungen: TT = Teiltöne · HT = Halbton · ct = Cent · KB = 1024 Byte.

---

## 0. Kurzfassung

1. **E8 wird aufgehoben** (§1): Allgemeine Resynthese einer Aufnahme bis 8 s wird Teil von v3 — Teiltöne + 32 Rauschbänder + Rauheit + bis zu 4 kurze Original-Einsätze; gespeichert wird nur das Modell (≤ 60 KB je Klang). Zusagen gelten für einstimmige Töne, Phrasen und Wörter; **Tier- und Naturgeräusche ohne Zusage** (die Ampel entscheidet), bis unkomprimierte Löwen-Aufnahmen und ein Hörtest vorliegen (N9R-38). Neuronale Verfahren und Sample-Wiedergabe bleiben draußen.
2. **Drei Pakete statt V9c** (§7): **V9d „Klang einfangen“** (Aufnehmen/Importieren → Analysieren → A/B, 5 h) · **V9d′ „Klang spielen“** (Engine `resyn` im Worklet, Tastatur ohne Micky-Maus, Makros, 4–5 h) · **V9e „Formen und Morphen“** (Einfrieren/Scannen, Verwandeln A↔B, „Sprechen“, Vereinfachen, → KLANGKÖRPER, Teiltöne malen/radieren, 4 Werks-Klänge, 5–6 h). V9c geht darin auf (−4 h, −30 KB).
3. **Messbar machbar:** Eine Resynthese-Stimme mit 64 TT kostet **1,40 % je Stimme** (Xeon, Median aus 3 Läufen); 8 Stimmen 11,2 % — unter der Spur-Grenze 12 % **im Mittel**. Je Render-Block zählt aber die Spitze: Starten alle Stimmen gleichphasig (Akkord), braucht der IFFT-Block 27 % (P99 39 %); mit versetzter Hop-Phase je Stimme ≈ 9 % in jedem Block (P99 16 %) — deshalb ist der Versatz Pflicht (§3.5). BELEGT (gemessen, `r8/rev-resyn/stimme-cpu-spitze.out`). Die Analyse mit YIN per FFT ist **ergebnisgleich und ≈ 3× schneller** als im Prototyp (531 → 179 ms je Sekunde Audio, mit Auffüllung 2: 142 ms); AUTO (beide Modi + Ampel) 0,59 s je Sekunde Audio. Ein fester f₀-Suchbereich (zweistufig) trifft so gut wie die von Hand gewählten Bereiche des Prototyps (Mel ≤ +0,03 dB). BELEGT (gemessen, §3.2, §4).
4. **Größe:** typische Klänge 9–50 KB (Geräusche jetzt immer FREI und mit 3-Band-Rauheit, §3.2); ein Größen-Begrenzer hält jeden Klang ≤ 60 KB (teilbar als Raum-Sound ≤ 64 KB). Seine Stufen kosten gemessen höchstens +0,08 / +0,15 / +0,33 dB Mel-Distanz. BELEGT (gemessen).
5. **Einfach vorne:** Blatt **KLANG EINFANGEN** mit drei Schritten (Quelle → Analysieren → Ergebnis mit Ampel und A/B), danach dieselben vier Makros wie KLANGKÖRPER (HELLIGKEIT, KÖRPER, ATEM, ZEIT). Tiefe nur hinter TIEFE. Skizzen für 390×844 und 844×390 in §5.
6. **Mikrofon** nur in der eigenständigen Seite (raw.githack) über VS1 (`r7/stimme.md`); in der Claude-App Datei-Import (Sprachmemos → Dateien). Abnahme N9R-01 … N9R-40 (§8) mit Schwellen aus dem Prototyp, Anker-Selbsttest der Ampel, Geräte-Messung und Hörtest für den Löwen.
7. **Werks-Klänge** nur aus lizenzierten Quellen oder eigenen Aufnahmen: Saxofon (Weresax, CC0, BELEGT), Klavier (Salamander, CC BY 3.0, BELEGT), Sprechende Fläche (Thorsten-Voice, CC0, BELEGT), Löwe (Freesound CC BY 3.0 bzw. CC0, BELEGT (SE) — beim Bau prüfen; besser Xanders eigene Zoo-Aufnahme). Der Werks-Löwe kommt nur, wenn N9R-38 (unkomprimierte Aufnahmen + Hörtest) besteht.
8. **Platz in der Bau-Reihenfolge:** neue Gruppe **RS** direkt nach V8V9 (V8a, V8b, V9a, V9b), vor V10. Option: Block V9b + RS früher (§9.3). **Achtung Dateigröße:** mit VO und VS zusammen ≈ 3,99 MB bei Grenze 4,0 MB → Entscheidung D5 (§12).
9. **Ampel misst den gespielten Klang** (mit Rauheit und EINSATZ) und prüft neben der Mel-Distanz die Stimmhaftigkeit (M-PER) bzw. bei Geräuschen Rauigkeit und Puls (M-RAU, M-PULS). Die alte Regel hätte einen reinen Rauschvocoder bei Löwe und Sprache „grün“ genannt; die neue gibt ihm dort höchstens „gelb“ und bei Sax, Klavier und Phrase „rot“. BELEGT (gemessen, `resyn-pakete/ampel-neu.out`).

**Kurzantwort an Xander (Vorschlag, kurz und knapp):**
> Ja – jetzt richtig eingeplant: echte Resynthese. Du nimmst einen Klang auf (Mikro in deiner Safari-Seite) oder lädst eine Datei, tippst „Analysieren“, und die App baut ihn aus Teiltönen und Rauschen nach; im Test kamen Saxofon, Klavier und Sprache messbar sehr nah ans Original. Löwe: noch nicht angehört, Ergebnis offen (er ist fast nur Rauschen und bekommt dafür „Rauheit“; wir brauchen dafür noch bessere Aufnahmen, am besten deine aus dem Zoo). Danach spielst du ihn auf der Tastatur (ohne Micky-Maus), dehnst ihn, frierst ihn ein, verwandelst Sax in Löwe oder lässt eine Fläche sprechen. Drei Pakete, ≈ 15 h, direkt nach dem KLANGKÖRPER; angehört hat es noch niemand.

---

## 1. Entscheidung E8 (neu) — die Regel

### 1.1 Wortlaut (ersetzt E8 aus der Vision und Satz 2 von E3-22)

> **E8 (neu, 17.10.2026):** Allgemeine Resynthese ist Teil von v3.
> - **Quelle:** eine Aufnahme bis **8 s** (Mono-Summe). Datei-Import in beiden Umgebungen; Mikrofon nur in der eigenständigen Safari-Seite und nur über VS1 (EN-15, `r7/stimme.md`); App-Klang offline gerendert.
> - **Modell:** zeitveränderliche Teiltöne (höchstens **64** gleichzeitig, Profi **128**), **32** Rauschbänder (ERB), Rauheit (Feinhüllkurve) und höchstens **4 Original-Einsätze** zu je ≤ 60 ms (8-Bit). Gespeichert wird nur das Modell, **≤ 60 KB je Klang**. Die Originalaufnahme bleibt nur auf dem Gerät (§3.7).
> - **Zusage** (Abnahme) gilt für einstimmige Quellen: ein Ton, eine Phrase, ein Wort. **Tier- und Naturgeräusche** und mehrstimmige Quellen sind erlaubt, aber **ohne Zusage**; die **Ampel** zeigt, wie nah der Nachbau ist. Die Zusage für Tiergeräusche kommt erst, wenn N9R-38 besteht (unkomprimierte, dokumentierte Löwen-Aufnahmen neu gemessen, Hörtest).
> - **Nicht in v3:** neuronale Verfahren (DDSP, RAVE, Codecs), Zerlegen von Mischungen, Abspielen ganzer Aufnahmen (Sample-Import bleibt §18), mehrere Analysen je Klang (Zonen).
> - **Werks-Klänge** nur aus eigenen oder frei lizenzierten Aufnahmen (CC0, CC BY mit Namensnennung, „ohne Einschränkungen“). Herkunft und Lizenz stehen im Klang (`src`).

### 1.2 Begründung

| Befund | Wert | Kennzeichen |
|---|---|---|
| Echte Resynthese erreicht bei Sax-Ton, Sprache, Wort und beiden Löwen den **Zufallsboden** (so nah wie zwei Durchläufe desselben Nachbaus) | Sax-Ton Mel 0,8 dB / MCD 2,1 gegen Boden 0,8 / 2,4 | BELEGT (gemessen, `resyn-prototyp.md` §4). **Einschränkung:** Der Boden ist die Streuung des eigenen Modells. Bei Löwe und Sprache liegt auch ein reiner Rauschvocoder nur 0,1–0,24 dB über seinem Boden (`r8/rev-resyn/anker-ampel.out`); dort sagt erst die Ampel mit M-PER/M-RAU etwas (§3.2 Schritt 11). |
| Die V9c-Näherung (festes Spektrum + Abklingzeiten) ist weit schlechter | MCD 13–52 statt 2–7 | BELEGT (gemessen, ebd.) |
| Rechenzeit je Stimme passt ins Spur-Budget | 64 TT + Rauschen + Rauheit 1,40 % (Xeon, Mittel); Blockspitze nur mit versetzter Hop-Phase klein | BELEGT (gemessen, §4.1) |
| Speicher passt in Projekt, Raum-Sound und Gemeinschaft | typisch 9–50 KB je Klang | BELEGT (gemessen) bzw. gerechnet (§4.2) |
| Vorbilder mit demselben Grundmodell (Sinus + Rauschen, Morph, Teiltöne bearbeiten) | SMS, Alchemy, Loris, SPEAR | BELEGT (SE): [SMS/Serra & Smith 1990](https://audiolabs-erlangen.de/content/05_fau/professor/00_mueller/02_teaching/2024s_sarntal/02_group_SYNTH/1990_SerraS_SpectralModelingSynthesis_CMJ.pdf), [Apple Alchemy](https://support.apple.com/ar-qa/guide/logicpro/lgsi440c233a/mac), [Loris](https://www.cerlsoundgroup.org/Loris), [SPEAR](https://www.klingbeil.com/spear/) |
| Original-Anschlag als kurzes Schnipsel ist ein bewährtes Mittel | Synclavier „Hybrid Attack“ | BELEGT (SE): [Resynthesis Quickstart](https://www.synclavier.com/Downloads/Resynthesis-Quickstart.pdf) |

Die bisher offene Frage der R8-Recherche („Gehört der Original-Anschlag zum Sample-Import oder ist er hier erlaubt?“) beantwortet E8 (neu) mit **hier erlaubt, eng begrenzt** (4 × ≤ 60 ms). Vorschlag; Entscheidung D4 (§12).

### 1.3 Was sich in Spec und Nachtrag ändert

| Stelle | Änderung |
|---|---|
| §0.6 **E3-22** | Satz 2 („allgemeine Resynthese bleibt ausgeschlossen“) entfällt; es gilt E8 (neu). Satz 1 (Additiv in zwei Stufen V9a/V9b) bleibt. |
| §11 Kopf „Realistische Erwartung“ | „Löwe nur als Monster-Brüllen (echt erst mit Sample-Import)“ → „Löwe aus einer Aufnahme per Resynthese (V9d–V9e); die KLANGKÖRPER-Vorlage ‚Brüllen‘ bleibt als synthetischer Klang“. |
| §11.3 / **V9c** | entfällt als Paket. Quellen, A/B und Analyse → V9d; „→ KLANGKÖRPER“ → V9e. V9c-01/-02/-03/-04/-05 werden zu N9R-32, N9R-10, N9R-06, N9R-09, N9R-10 (§2.2). |
| §11 | neuer Abschnitt §11.5 „Resynthese“ = §3 dieses Entwurfs. |
| §13 / VS | das alte „VS5 Klang einfangen → Additiv“ ist V9d. Der Mikrofon-Weg nutzt die VS1-Grundlage aus `r7/stimme.md`. |
| §14 | `Sound.engine` um `'resyn'` ergänzt; neue Felder `p.resyn`, `p.rs` (§3.3). |
| §15.1–15.3, C.4 | CPU-Zeile, Begrenzer-Stufen, Budgets (§4, §9). |
| §16 / Teil D | Test-API (§10). |
| §18 „Klang“ | KLANG-SCAN (Master-Briefing N1) ist im Kern durch FRIEREN + POSITION über einem App-Klang abgedeckt (V9e); in §18 bleibt nur der Grain-Modus. WAHRSCHEINLICH (gleiche Bedienidee: Zeitachse als Scan-Achse, einfrieren, per LFO fahren; `v3-ideen/SYNQUENZER-MASTER-BRIEFING.md` §9.3 N1). |
| §0.5 Wortliste | neue Begriffe (§5.6). |

---

## 2. Aufbau auf V9a, V9b und V9c

### 2.1 Was übernommen wird

| Baustein | kommt aus | Nutzung |
|---|---|---|
| Sinusbank im Worklet (Pegel und Frequenz je Block, Abschalten < −80 dB) | V9b `body` | Kern der Engine `resyn` (V9d′). Ist die Bank in V9b anders gebaut, gilt für `resyn` die u32-Tabelle ohne Interpolation: fast so billig wie der Resonator 2. Ordnung (0,85 gegen 0,83 % bei 64 TT), aber stabil bei gleitender Frequenz (`r8/bench/osc-bench.out`, R8-Recherche §4.1). |
| CPU-Begrenzer Stufe 1 „Teiltöne halbieren“ | V9b, §15.2 | gilt auch für `resyn` (§4.1) |
| Makro-Namen HELLIGKEIT · KÖRPER · ATEM · ZEIT | V9b §11.2 | dieselben Namen und Richtungen (Xander lernt sie einmal): KÖRPER = Formant-Lage, ATEM = Rauschanteil, ZEIT = Dauer |
| Formant-Gewichtung je Note („kein Micky-Maus“) | V9b | FORMANT FEST (V9d′): Teiltonpegel aus der Hüllkurve des Rahmens an der neuen Frequenz |
| TIEFE › Teiltöne „mit dem Finger malen“ | V9b | Spektrogramm-Raster in V9e mit denselben Gesten |
| XY-Feld (Vektor-Prinzip, 4 Spektren) | V9a | Klang-Streifen als XY: X = POSITION, Y = VERWANDELN (V9e) |
| 32 Oberton-Balken | V9a | *(P1)* „→ TABELLE“: ein Rahmen einer TON-Analyse wird zu 32 Balken (V9e) |
| Quellen Datei/App-Klang, A/B gleicher Lautheit, Grundton-Korrektur | V9c §11.3 | V9d (erweitert um Mikrofon über VS1) |
| „Teiltöne einfangen → KLANGKÖRPER“ | V9c | V9e „→ KLANGKÖRPER“, gerechnet aus der vollen Analyse statt aus einer zweiten STFT |
| Vorlagen „Saxofon“, „Brüllen“, „Sprechend“ | V9b | bleiben als synthetische Vorlagen; die Resynthese-Werks-Klänge (§6) kommen hinzu |

### 2.2 V9c-Abnahme → N9R

| V9c | Inhalt | wird |
|---|---|---|
| V9c-01 | Rundlauf KLANGKÖRPER → Analyse (Startpegel ±1,5 dB, Abklingzeiten ±20 %, B ±20 %, f₀ ±5 ct) | N9R-32 (V9e) und N9R-06 b (V9d) |
| V9c-02 | App-Sound FM-Pluck C3: A/B ±0,5 LU, Schwerpunkt bei 50/500 ms ±⅓ Okt | N9R-10 (V9d) |
| V9c-03 | WAV Säge A3: f₀ ±5 ct, ≥ 16 TT mit 1/n ±2 dB | N9R-06 a (V9d) |
| V9c-04 | Hauptthread nie > 50 ms blockiert | N9R-09 (V9d) |
| V9c-05 | Ungültige Datei → Meldung, keine Änderung | N9R-10 (V9d) |

---

## 3. Technik (verbindlich für den Bau)

### 3.1 Resynthese-Kern: ein Code für Worker, Worklet und Tests

- Der **Kern** (Analyse, Kodierung, Offline-Synthese, Messfunktionen M-MEL/M-BODEN) steht **einmal** in `index.html` als ASCII-Textblock zwischen `/*RESYN-KERN-ANFANG*/` und `/*RESYN-KERN-ENDE*/` (I-07: ASCII, kein `</script`). Vorschlag.
- **Worker:** Analyse und A/B-Render laufen in einem Web Worker aus diesem Text (Blob-URL, Rückfall data:-URL). Startet kein Worker (z. B. Rahmen-Richtlinie im Viewer, ungeprüft), läuft **derselbe Code in Scheiben** auf dem Hauptthread (je Scheibe ≤ 8 ms, Weitergabe per `MessageChannel`). Web Worker in Safari: [BCD `api/Worker.json`](https://github.com/mdn/browser-compat-data/blob/main/api/Worker.json) (Safari 4) — BELEGT. Ob der Claude-Viewer Worker aus Blob-URLs erlaubt: UNBELEGT → Rückfall ist Pflicht.
- **Worklet:** Der Synthese-Teil des Kerns wird an die Worklet-Quelle angehängt (Engine `resyn`, V9d′). Daten gehen per `port.postMessage` mit Übergabe (transfer), **kein** `SharedArrayBuffer` (githack setzt keine COOP/COEP-Kopfzeilen nachweislich; `r7/stimme.md` I16).
- **Tests** lesen den Block aus der Datei und führen ihn in Node aus (wie die Worklet-Tests `fm-node.mjs`).
- Kompression: `CompressionStream`/`DecompressionStream` mit `deflate-raw` gibt es in Safari ab 16.4 (iOS gespiegelt) — BELEGT: [BCD CompressionStream](https://github.com/mdn/browser-compat-data/blob/main/api/CompressionStream.json), [BCD DecompressionStream](https://github.com/mdn/browser-compat-data/blob/main/api/DecompressionStream.json). Damit ist die Frage „deflate-raw in Safari?“ der R8-Recherche geklärt.

### 3.2 Analyse (V9d)

| Schritt | Festlegung | Grundlage |
|---|---|---|
| 1 Eingang | Mono-Summe in der Rate des AudioContext (meist 48 kHz), Schnitt ≤ 8 s, Spitze auf −1 dBFS, 5 ms Blende an den Rändern. Dateien bis 30 MB. | Vorschlag; Prototyp `recordings.mjs` |
| 2 Grundton | YIN mit **Differenzfunktion per FFT**, Schwelle 0,2, Median 5, Oktav-Korrektur. **Suchbereich zweistufig:** grob 30–1500 Hz, dann Median ÷ 2 … Median × 2. **Stimmhaft mit Haltezeit:** an bei Aperiodizität < 0,30, aus bei > 0,40, Mindestdauer 60 ms. | YIN: [de Cheveigné & Kawahara 2002](https://cagnazzo.wp.imt.fr/files/2013/05/2002_JASA_YIN.pdf) BELEGT (SE); FFT-YIN ergebnisgleich zum direkten YIN (alle 14 Läufe: gleiche Spuren, f₀-Abweichung 0,000 ct) BELEGT (gemessen, `analyse-zeit2.out`); zweistufiger Bereich gegen die von Hand gewählten Bereiche des Prototyps: gleiche f₀, Mel ≤ +0,03 dB (fester Bereich 30–1500 Hz allein: bis +0,06 dB, Wort-MCD +0,33) BELEGT (gemessen, `f0-bereich.out`); Haltezeit gegen die Klavier-Aussetzer des Prototyps (`resyn-prototyp.md` §4.3) — Werte UNBELEGT, Abnahme N9R-05 |
| 3 TON | f₀-adaptives Hann-Fenster (3 Perioden, ≥ 15 ms), Nullauffüllung **2**, Spitzen nahe k·f₀·√(1+B·k²), B per kleinste Quadrate über 16 TT, Segmente an f₀-Sprüngen > 80 ct, Synthese phasenverriegelt | Prototyp `model.mjs`; Auffüllung 2 statt 4: Qualität gleich (Mel ±0,07 dB), Zeit −20 % — BELEGT (gemessen, `analyse-zeit.out`, `analyse-zeit2.out`) |
| 4 FREI | Spitzen mit Sinusförmigkeit < −15 dB, Spuren nach McAulay/Quatieri (≤ 15 Hz + 1,5 %, 2 Rahmen Lücke, ≥ 4 Rahmen), freie Phase | [MIT LL](https://www.ll.mit.edu/r-d/publications/speech-analysissynthesis-based-sinusoidal-representation) BELEGT (SE); Prototyp |
| 5 Budget | höchstens N gleichzeitige Spuren nach Energie (Standard 64, Profi 128) | Prototyp `selectBudget`; 32 TT reichen für Sax-Ton und Klavier, 64 für Sprache — BELEGT (gemessen, `resyn-prototyp.md` §4.2) |
| 6 Rest | eigenes Blackman-Harris-Fenster 46 ms, behaltene TT komplex abziehen, Täler je Band → **32 ERB-Bänder** | [sms-tools](https://github.com/MTG/sms-tools/blob/master/smstools/models/utilFunctions.py) BELEGT; 32 ERB gleich gut oder besser als 26 Bark (Sprache Mel 2,56 → 2,24) BELEGT (gemessen, `resyn-proto/out/baender.json`) |
| 7 Einsätze | spektraler Fluss, höchstens 4, Abstand ≥ 150 ms; Schnipsel −3 … +40 ms + 15 ms Gleichleistungs-Blende; 8-Bit μ-law in der Analyse-Rate | Prototyp `detectOnsets`/`spliceAttacks`; μ-law Vorschlag (Rauschabstand UNBELEGT → N9R-21) |
| 8 Rauheit | **drei Feinhüllkurven** für 300–1600, 1600–6400 und > 6400 Hz (je RMS 2 ms / 30 ms, 1 Wert je ms, 8 Bit); unter 300 Hz keine. **Gespeichert nur bei Geräusch** (stimmhaft < 50 %) oder auf Wunsch | Löwe: holt die Pulsation zurück; bei Sprache (Mel +0,2 dB, MCD +1,1) und Klavier (Mel +0,5 dB, MCD +1,2) schadet sie — BELEGT (gemessen, `resyn-proto/out/tabellen.md`); Schwelle 50 % Vorschlag. Eine breitbandige Hüllkurve (> 300 Hz) lässt beim Tux-Paint-Löwen das oberste Band überschießen (ΔM-RAU +0,35); mit 3 Bändern alle 4 Bänder ±0,15 (qABCs −0,05/+0,05/+0,04/−0,02, Tux Paint +0,06/+0,01/0,00/+0,11), Mel gleich oder besser, Kosten ≈ 3,1–3,2 KB/s Base64 statt 1,1 — BELEGT (gemessen, `resyn-pakete/rauheit-3band.out`; Bandteilung dort per FFT über die ganze Aufnahme, im Worklet per Weiche, §3.5) |
| 9 Takt | Analyse intern ≈ 172 Rahmen/s, gespeichert **100/s** | 100/s quantisiert gegen das volle Modell: Mel höchstens ±0,15 dB (Prototyp: ±0,3) — BELEGT (gemessen, `speicher-fps.out`; `resyn-prototyp.md` §4.4) |
| 10 **AUTO** | Zuerst f₀-Spur und Anteil stimmhaft (M-PER am Original). **Stimmhaft < 50 % → FREI ohne Mel-Vergleich** (TON wird gar nicht analysiert; FORMANT FEST aus, Rauheit an). **Stimmhaft ≥ 50 %:** TON und FREI rechnen (Rest-Rahmen nur einmal), beide rendern (mit EINSATZ, ohne Rauheit), **TON, wenn M-MEL(TON) ≤ M-MEL(FREI) + 0,15 dB**, sonst FREI. Danach den unterlegenen Modus sofort freigeben (§4.3 Speicher). | Alte Regel (immer Mel-Vergleich) wählte beim Löwen qABCs (stimmhaft ≈ 5–10 %) TON mit 0,01 dB Spielraum (2,27 ≤ 2,13 + 0,15) — Zufall; BELEGT (gemessen, `auto-kosten.out`, Wiederholung identisch `r8/rev-resyn/auto-kosten.rerun.out`). Neue Regel im Korpus: FREI für beide Löwen (Regel), Sax-Phrase, Klavier; TON für Sax-Ton (0,74/0,72), Sprache (2,16/2,04, stimmhaft 0,57), Wort (1,54/1,50) — BELEGT (gemessen, `resyn-pakete/ampel-neu.out`). Achtung: Sprache liegt mit 0,57 nahe an der Schwelle 50 % (WAHRSCHEINLICH unkritisch: beide Modi grün). Regel Vorschlag |
| 11 **Ampel** | Gemessen wird **genau der Render, der gespielt wird** (Standardwerte, mit Rauheit und EINSATZ), Boden = derselbe Render mit Rausch-Startwert 2. **Grün:** M-MEL ≤ Boden + 0,3 dB **und** alle Zusatzbedingungen. **Gelb:** M-MEL ≤ Boden + 1,0 dB (verfehlte Zusatzbedingung → höchstens gelb). Sonst **rot**. Zusatzbedingungen: bei stimmhaft ≥ 20 % **M-PER** (Anteil stimmhaft ≥ 0,75 × Original, \|Δap\| ≤ 0,2); bei Geräusch (stimmhaft < 50 %) **M-RAU** je Band \|Δ\| ≤ 0,15 und **M-PULS** ±20 %. Das Ergebnis-Blatt nennt die verfehlte Bedingung („glatter als das Original“, „weniger Stimme“). | Alte Regel (nur Mel, ohne Rauheit): Rauschvocoder-Anker bei Löwe qABCs / Tux Paint / Sprache nur Δ 0,11 / 0,24 / 0,15 dB über dem eigenen Boden → „grün“ — BELEGT (gemessen, `r8/rev-resyn/anker-ampel.out`). Neue Regel: Anker Löwe qABCs gelb (B4 −0,18), Tux Paint gelb (B3 −0,15, knapp), Sprache gelb (stimmhaft 0,02, Δap 0,32), Wort gelb, Sax-Ton/Phrase/Klavier rot. Nachbauten: Löwe qABCs grün (Δ 0,04), **Tux Paint gelb** mit breitbandiger Rauheit (B4 +0,35; mit 3 Bändern ±0,15, Schritt 8), Sax-Ton grün, Sax-Phrase gelb, Klavier gelb, Sprache grün (Δ 0,27), Wort grün — BELEGT (gemessen, `resyn-pakete/ampel-neu.out`). Der Abstand des Ankers zur Grenze ist beim Tux-Paint-Löwen klein (0,15 an der Schwelle) — WAHRSCHEINLICH reicht er nicht als einzige Sicherung; deshalb zusätzlich Hörtest N9R-38. |
| 12 Größen-Begrenzer | §3.4 | |
| 13 Kodierung | Ströme je Rahmen (f₀ bzw. Spur-Ereignisse, Pegel 0,5 dB, Frequenz 1 ct, Bänder 0,5 dB, Rauheit 8 Bit, Einsätze μ-law), Delta je Strom, `deflate-raw`, Base64 | Prototyp `extras.mjs storageTest`; SDIF-Vorbild: [IRCAM SDIF](https://support.ircam.fr/docs/om/archive/om6.5-manual/co/SDIF-Intro.html) BELEGT (SE) |

### 3.3 Datenformat

```js
Sound.engine = 'resyn'
p.resyn = {                       // unveränderlich; Bearbeitungen stehen in ed (V9e)
  v: 1, rid: 'k3F9…',             // 16 Zeichen Base64url aus SHA-256 über data (Kennung, Undo/Verlauf teilen sie)
  mode: 'ton'|'frei', sr: 48000, dur: 3.5,          // s
  f0ref: 440, root: 69,           // Hz (0 = Geräusch) und MIDI-Grundton der Tastatur (Korrektur ±1 HT, ±50 ct: cent)
  cent: 0, B: 0,                  // Feinstimmung, Streckung (TON)
  n: 64, bands: 32, fpsP: 100|50, fpsN: 100|50,     // Teiltöne gleichzeitig, ERB-Bänder, Rahmenraten
  data: '<Base64 deflate-raw>',   // Ströme siehe §3.2 Schritt 13; ≤ 60 KB Text
  gen: null|'saege',              // V9e: eingebauter Grundklang statt data (48 TT, 1/k), für SPRECHEN
  atk: [0.012, …],                // Einsätze in s (≤ 4), PCM steckt in data
  rough: 0|1|3,                   // Zahl gespeicherter Feinhüllkurven: 3 = je Band (Standard bei Geräusch), 1 = breitbandig nach Begrenzer-Stufe C′
  roughDepth: null|[d1, d2, d3],  // nur bei rough 1: Tiefe je Band (0…1, 8 Bit), aus der Original-Rauigkeit (§3.4)
  loop: [1.0, 2.0],               // Halte-Bereich in s (Vorschlag der Analyse, vom Nutzer verschiebbar)
  q: { mel, boden, ampel: 'gruen'|'gelb'|'rot', stufen: ['N32', 'P50'] },
  src: { kind: 'datei'|'mikro'|'app'|'werk', name, lic: 'eigene'|'CC0'|'CC BY 3.0'|'CC BY 4.0'|'frei'|'unbekannt', by?, url? },
  ed: [],                         // V9e: [{op:'erase'|'gain'|'set', t0, t1, k0?, k1?, f0?, f1?, db?, filt?:'ung'|'ger'}]
  b: null                         // V9e: zweite Analyse für VERWANDELN {v, rid, mode, …, data}
}
p.rs = { hell: 0 /*dB/Okt*/, koerper: 0 /*HT*/, atem: 0 /*dB*/, zeit: 1 /*×¼…×4*/, rauh: 1 /*0…1,5*/,
         art: 'einmal'|'halten'|'frieren', formant: true, rel: 0.3 /*s*/, velHell: 3 /*dB/Okt bei Anschlag 1*/,
         einsatz: true, nMax: 64, pos: 0, leb: 0, verw: 0, verwArt: 'mischen'|'sprechen', ausr: 'laenge'|'einsatz', tonB: false }
```
- **Unveränderlich:** `data` ändert sich nach der Analyse nie. Undo, Verlauf (VC2a) und Klangzustände halten dieselbe Zeichenkette; Regler ändern nur `p.rs`, Malen nur `ed`. Vorschlag.
- `normalizeSound` erhält alle Felder; unbekannte `v` → Klang stumm mit Hinweis „neuere Version nötig“.

### 3.4 Größen-Begrenzer (V9d)

Läuft nach der Analyse, bis `data` ≤ 60 KB ist. Jede Stufe steht in `q.stufen` und im Ergebnis-Blatt („verkleinert: 32 Teiltöne“).

| Stufe | Maßnahme | Mel-Anstieg (kumuliert, alle 7 Aufnahmen, beide Modi) | Größe FREI | Kennzeichen |
|---|---|---|---|---|
| 0 | N 64, Teiltöne 100/s, Bänder 100/s | – | 5,2–20,2 KB/s | BELEGT (gemessen) |
| A | N 64 → 32 | ≤ +0,08 dB | −22 … −37 % (Klavier 0 %) | BELEGT (gemessen, `speicher-stufen.out`) |
| B | + Teiltöne 50/s | ≤ +0,15 dB | −41 … −52 % (Klavier −16 %) | BELEGT (gemessen) |
| C | + Bänder 50/s | ≤ +0,33 dB | −46 … −61 % | BELEGT (gemessen) |
| C′ | Rauheit 3 Hüllkurven → 1 breitbandige + Tiefe je Band (`roughDepth`, 3 Byte), nur bei Geräusch | UNBELEGT mit Tiefenbegrenzung; breitbandig ohne sie: Mel +0,02 … +0,06 dB gegen 3 Bänder, Tux Paint schießt oben über (`rauheit-3band.out`) | −2,1 KB/s (gerechnet: 3,2 → 1,1 KB/s) | Vorschlag; N9R-22b prüft nur Stufe 0 |
| D | Einsätze 4 → 2 (die stärksten) | UNBELEGT | −3,5 KB je Einsatz (gerechnet) | Vorschlag |
| E | Länge kürzen (Ende), mit Hinweis | – | – | Vorschlag |

25 Rahmen/s wurden verworfen: Mel bis +1,1 dB (Sprache, Löwe). BELEGT (gemessen, `speicher-fps.out`). Getrennte Raten (Teiltöne 50/s, Bänder 100/s) sind besser als beide 50/s (Mel ≤ +0,10 statt ≤ +0,26 dB). BELEGT (gemessen, `speicher-mix.out`).

### 3.5 Wiedergabe: Engine `resyn` (V9d′)

| Teil | Festlegung | Grundlage |
|---|---|---|
| Stimme | Sinusbank (u32-Tabelle 4096, Parameter je Block linear) + Rauschen per **FFT 1024, Hop 256, zwei Rahmen je IFFT**, Hann, 75 % Überlappung, **Energie je Band exakt** + Einsatz + Rauheit | FFT-Rauschen trifft die Bänder, die 2-poligen Bandpässe verwischen sie (Mel bis +0,9 dB, MCD bis +4 dB) — BELEGT (gemessen, Prototyp §4.4); CPU §4.1 |
| **Hop-Phase** | Jede Stimme macht ihre IFFT nur in jedem 4. Block (128 Samples). Die Hop-Phase jeder Stimme ist um **(Stimmen-Slot mod 4) Blöcke versetzt** (beim Notenstart bis zu 3 Blöcke = 8 ms Rauschen aus dem Vorlauf; der Einsatz deckt den Beginn). Rückfall, falls der Versatz hörbar stört: die IFFT einer Stimme auf 4 Blöcke verteilen (Block 1 Formen, 2–3 FFT-Stufen, 4 Überlappen-Addieren). | Gleichphasig (Akkord): IFFT-Block 27,3 %, P99 39 %, max 51 % bei Mittel 11,3 %; versetzt: alle 4 Blockphasen ≈ 9,0 %, P99 16 % (8 Stimmen × 64 TT, Xeon) — BELEGT (gemessen, `r8/rev-resyn/stimme-cpu-spitze.out`); Vorlauf-Lösung Vorschlag |
| Rauheit im Worklet | Rauschen nach der IFFT mit 3 Weichen (je 2 Biquads, 300, 1600 und 6400 Hz; unter 300 Hz ungeformt) in Bänder teilen, je Band die eigene Feinhüllkurve, dann summieren | Vorschlag; CPU-Zuschlag geschätzt < 0,1 % je Stimme (UNBELEGT → N9R-23); Wirkung mit Ziegelwand-Teilung gemessen (Schritt 8) |
| Zeit | Rahmen-Lesezeiger = Zeit × 100/s ÷ ZEIT (×¼ … ×4); Einsätze laufen ungedehnt | Dehnen ×2/×0,5 ohne Tonhöhenänderung (≤ 0,01 ct) — BELEGT (gemessen, Prototyp §5.2) |
| Tonhöhe | q = f(Note) ÷ f(Grundton) × Pitch-Mod; TON: f_k = k·q·f₀(t)·√(1+B·k²); FREI: f_i = q·f_i(t); Teiltöne über 16 kHz bzw. Nyquist aus | Sax ±12 HT: Fehler ≤ 0,3 ct Median — BELEGT (gemessen, Prototyp §5.1) |
| **FORMANT FEST** (an) | Pegel a_k ← a_k · E_t(f_k′ ÷ 2^(KÖRPER/12)) ÷ E_t(f_k); E_t = Hüllkurve des Rahmens (Teiltonspitzen, linear in log-f verbunden); Rauschbänder bleiben stehen. **Standard an bei TON, aus bei Geräusch** (dann wandern Teiltöne und Bänder mit: „größerer/kleinerer Löwe“). **Vorrang:** maßgeblich ist der Anteil stimmhaft der Analyse, nicht der Modus — stimmhaft < 50 % → aus (auch wenn der Nutzer TON erzwingt); der Nutzer kann umschalten. | Schwerpunkt bleibt weitgehend stehen (−256/+366 ct statt ±1200 ct bei ±12 HT) — BELEGT (gemessen); Prinzip [Röbel & Rodet 2005](https://dafx.de/paper-archive/details/EDSTSaO17Gd_0LV03iwDfw) BELEGT (SE); einfache Hüllkurve statt „True Envelope“: Güte UNBELEGT |
| KÖRPER | verschiebt die Formant-Hüllkurve um −12 … +12 HT bei fester Tonhöhe (links = größer/tiefer) | Vorschlag; H-1-Prüfung N9R-18 |
| HELLIGKEIT | Neigung −12 … +6 dB/Okt um 1 kHz, auf Teiltöne und Bänder | wie V9b |
| ATEM | Rauschbänder −12 … +12 dB | wie V9b (dort 0 … +12) |
| RAUHEIT | 0 … 150 % Tiefe der gespeicherten Feinhüllkurven (alle Bänder gemeinsam); ohne gespeicherte Hüllkurve künstliche Rauheit (AM/Jitter 20–80 Hz wie V9b) | Löwe: Rauigkeit 0,55/0,18 → 0,81/0,34 (Original 0,75/0,32, Bänder 400–1600/1600–6400 Hz) — BELEGT (gemessen, Prototyp §4.3) |
| Puls bei ZEIT ≠ 1 | Lesezeiger der Rauheit läuft in **Echtzeit** in einem 60-ms-Fenster um die Rahmenposition (Kreis mit Blende); so bleibt die Pulsrate des Löwen (30–50 Hz) erhalten | Prototyp: beim Dehnen ×2 halbiert sich die Pulsrate — WAHRSCHEINLICH; Lösung Vorschlag, N9R-19 |
| SPIELART | **EINMAL** (spielt bis zum Ende, Loslassen blendet mit FREIGABE aus) · **HALTEN** (Halte-Bereich [a, b] als parametrische Schleife mit 46 ms Rahmen-Blende; nach dem Loslassen weiter ab b) · **FRIEREN** (V9e) | parametrische Schleife: Einbruch 0,0 dB gegen 0,05–1,51 dB als Audio-Schleife; bei gleitender Tonhöhe 2,11 dB — BELEGT (gemessen, Prototyp §5.3) |
| Halte-Vorschlag | Analyse schlägt den längsten stimmhaften Abschnitt mit kleinster f₀-Streuung vor (mittlere Hälfte), bei Geräusch den Abschnitt mit stabilem Pegel; gleitet die Tonhöhe, Hinweis „Tonhöhe gleitet – Schleife kann pumpen“ | Vorschlag |
| Einsatz | wird mit Abspielrate q abgespielt (lineare Interpolation); Schalter EINSATZ | Sprache: LSD −0,5, MCD −0,7 dB — BELEGT (gemessen, Prototyp §4.3) |
| Anschlag | → Pegel (Kurve wie Synth) und → HELLIGKEIT (`velHell`, Standard +3 dB/Okt bei 1,0) | Vorschlag (wie V9b `velTilt`) |
| Mono/Legato | vorhandene Synth-Einstellung mono↔poly + Glide: neue Note bei gehaltener → kein neuer Einsatz, Tonhöhe gleitet, Rahmen laufen weiter (Sax-Linien aus einem Ton) | Melodie aus einem Sax-Ton: jede Note ≤ 0,83 ct — BELEGT (gemessen, Prototyp §5.5, `bearbeitung.json`) |
| Polyphonie, Begrenzer | §4.1 | |
| Kein nativer Rückfall | Ohne Worklet ist RESYNTHESE grau: „nur mit Worklet“ (I-07 erlaubt das ausdrücklich) | Spec I-07 |

### 3.6 Formen und Morphen (V9e)

| Funktion | Festlegung | Grundlage |
|---|---|---|
| **FRIEREN + POSITION** | Note startet an POSITION (0 … Länge) mit 20 ms Einblendung und bleibt dort; Einsatz nur bei POSITION < 0,05 s. POSITION ist Mod-Ziel (LFO = Scannen) und folgt dem Finger auf dem Klang-Streifen (Glättung 30 ms). | Einfrieren ohne Zusatz zu statisch: Pegelschwankung 0,02 dB (Sax) — BELEGT (gemessen, Prototyp §5.3) |
| **LEBENDIG** | 0–100 %: je Teilton Zufallspfad (Tiefpass 4 Hz) ±3·L dB und ±8·L ct, Bänder ±1,5·L dB | Werte UNBELEGT (Prototyp-Vorschlag ±0,5 dB/±2 ct), Hörtest; N9R-27 |
| **VERWANDELN** α (A → B) | zweite Analyse B (Bibliothek, Spur oder neu einfangen). **MISCHEN:** A-TT mit Hüllkurve von B gewichtet und mit (1−α) ausgeblendet, B-TT mit α, Bänder in dB interpoliert, Rauheit von B mit Tiefe α; Tonhöhe von A (Schalter TONHÖHE B). AUSRICHTEN: LÄNGE (beide auf die Länge von A) oder EINSATZ (Einsätze übereinander). | Sax ↔ Löwe stetig: Hüllkurven-MCD 0 → 63 bzw. 63 → 0, Schwerpunkt 730 → 435 Hz — BELEGT (gemessen, Prototyp §5.4); Vorbilder [Loris-Morph (CMJ 2003)](https://muse.jhu.edu/article/47855/pdf), [Alchemy Morph](https://www.apple.com/logic-pro/resources/docs/elemental_morphing_in_alchemy_0818.pdf) BELEGT (SE) |
| **SPRECHEN** | A-Teiltöne bekommen die Formant-Hüllkurve von B (E_B an f_k), Rauschbänder von B (Konsonanten) mit α; B läuft mit eigener ZEIT; als A gibt es neben jeder Analyse den eingebauten Grundklang **SÄGE** (`gen: 'saege'`, 48 TT, 1/k, ohne Daten; Wahl „A“ in TIEFE › Verwandeln) | Prinzip Kreuzsynthese (Hüllkurve von B auf Feinstruktur von A) — WAHRSCHEINLICH (wie Vocoder, eK); Verständlichkeit UNBELEGT (Hörtest) |
| **TEILTÖNE** (Vereinfachen) | 4 … 128: spielt die N energiestärksten gleichzeitig | Sax-Ton: N 64 → 32 gleich (Mel 0,8), N 16 hörbar schlechter (1,7) — BELEGT (gemessen, Prototyp §4.2) |
| **→ KLANGKÖRPER** | V9c-Rechnung auf den Analyse-Daten: Verhältnis je TT (Median), Startpegel, T1/T2 (log-linear), Streckung B, 3 Rauschbänder aus den 32, 3 Formant-Hügel aus E_t → neuer `body`-Klang (ein Undo) | V9c §11.3; Abstand zum Original groß (MCD 13–52) — deshalb nur als „Vereinfachen“ angeboten, nicht als Resynthese |
| **Malen/Radieren/Auswahl** | Raster TON = Rahmen × Teilton 1–64, FREI = Zeit × Hz (log); Ops in `ed` (nicht zerstörend); Filter GERADE/UNGERADE (TON); ein Strich = ein Undo | Vorbilder [SPEAR](https://www.klingbeil.com/spear/) (Auswahl nach Zeit/Frequenz), [iZotope Iris 2](https://www.soundonsound.com/reviews/izotope-iris-2) (Pinsel, Lasso) — BELEGT (SE) |
| *(P1)* **→ TABELLE** | Pegel der Harmonischen 1–32 an POSITION → 32 Balken eines Tabellen-Additiv-Klangs (V9a) | Vorschlag |

### 3.7 Quellen und Original

| Quelle | Weg | Umgebung |
|---|---|---|
| **DATEI** | `<input type="file" accept="audio/*">` → `decodeAudioData` (Safari ab 6, iOS gespiegelt: [BCD BaseAudioContext](https://github.com/mdn/browser-compat-data/blob/main/api/BaseAudioContext.json), BELEGT). Welche Formate iOS dekodiert (m4a, mp3, wav sicher; ogg/flac?): UNBELEGT → Test N9R-10 mit WAV/MP3/M4A. | beide |
| **MIKRO** | nur über die VS1-Grundlage (`r7/stimme.md` §12: Start nur auf Tipp, `audioSession` `play-and-record` ↔ `playback`, Echo-Unterdrückung aus); **während der Aufnahme schweigt die App** (Transport angehalten, Tastatur stumm) – so braucht es keinen Echo-Abzug. Höchstens 8,0 s. | nur eigenständige Seite, nur nach positivem VS0 |
| **APP-KLANG** | aktueller Klang der Spur als Note (Standard C3), 2 s Halten + Ausklang, OfflineAudioContext mit dem Worklet-Modul; Rückfall nativer Render mit Hinweis (Risiko aus V9c) | beide |
| Ohne Mikro | Hinweis: „Sprachmemos → Teilen → In Dateien sichern → hier DATEI“ | Claude-App |

**Original nur lokal:** Die Aufnahme bleibt für A/B und „Neu analysieren“ in IndexedDB (Store `resyn-src`, Schlüssel `rid`, höchstens 20 Aufnahmen bzw. 15 MB, älteste zuerst gelöscht), nie im Projekt, nie online. **Auf githack nur für die Sitzung**, weil sich dort alle Seiten eine Herkunft und damit IndexedDB teilen (`r7/stimme.md` G6; Folgerung dort WAHRSCHEINLICH). Vorschlag.

---

## 4. Budgets

### 4.1 CPU je Stimme und Polyphonie

Skript `r8/resyn-pakete/stimme-cpu.mjs`, 3 Läufe × bestes von 5, 8 Stimmen, Block 128, 48 kHz; Zusammenfassung `stimme-cpu.zusammen.out`. BELEGT (gemessen).

| Baustein | je Stimme, Median (Spanne) |
|---|---|
| 64 TT u32-Tabelle (Kalibrierung; früherer Lauf `osc-bench.out`: 0,848 %) | 0,583 % (0,523–0,626) |
| 64 TT + Formant je Block | 0,673 % (0,643–0,745) |
| 128 TT + Formant | 1,316 % (1,215–1,331) |
| 256 TT + Formant | 2,549 % (2,537–2,551) |
| Rauschen FFT 1024/256, 32 ERB, 2 Rahmen je IFFT | 0,571 % (0,473–0,741) |
| Rauschen FFT 1024/256, 1 Rahmen je IFFT | 0,895 % |
| Rauschen 32 Bänder als 2× RBJ-Bandpass (nur Vergleich; schlechtere Qualität) | 0,653 % |
| Rauheit | 0,025 % |
| **Stimme 32 TT** (+ Formant + Rauschen FFT 1024, 2/IFFT + Rauheit) | **0,996 %** (0,986–1,044) |
| **Stimme 64 TT** | **1,399 %** (1,374–1,404) |
| **Stimme 128 TT** | **2,068 %** (1,752–2,203) |

**Blockspitze statt Mittel.** Im AudioWorklet muss jeder Block (2,67 ms) rechtzeitig fertig sein; das Mittel oben verdeckt den Block mit der IFFT. Skript `r8/rev-resyn/stimme-cpu-spitze.mjs`, Zeit je Block, 8 Stimmen. BELEGT (gemessen, `stimme-cpu-spitze.out`):

| Fall | Mittel | P50 | P99 | max | Blockphase 0 / 1 / 2 / 3 |
|---|---|---|---|---|---|
| 64 TT, gleichphasig (Akkord) | 11,3 % | 6,0 % | 39,3 % | 51,2 % | 27,3 / 6,0 / 6,0 / 6,0 % |
| 64 TT, Hop-Phase versetzt | 9,0 % | 8,6 % | 16,1 % | 40,5 % | 9,0 / 8,9 / 9,0 / 9,1 % |
| 128 TT, gleichphasig | 15,9 % | 11,0 % | 33,2 % | 52,9 % | 31,0 / 10,9 / 10,7 / 10,7 % |
| 128 TT, versetzt | 16,5 % | 15,9 % | 27,5 % | 151,7 % (Einzelausreißer, VM) | 16,8 / 16,5 / 16,4 / 16,4 % |

- Folge: Gleichphasig käme eine Resynthese-Spur am iPhone (Faktor 2–2,5, UNBELEGT) im IFFT-Block auf ≈ 55–68 % der Blockzeit; mit weiteren Spuren reißt der Block. Deshalb **Hop-Versatz Pflicht** (§3.5). WAHRSCHEINLICH.
- Die Einzel-Maxima (bis 152 %) sind auf der VM nicht aussagekräftig (Last, GC); abgenommen wird P99.
- **Vorsicht:** Die Kalibrier-Bank lief heute mit 0,58 % statt 0,85 % im früheren Lauf. Die VM schwankt also um bis zu Faktor 1,5. Verbindlich ist die Messung im App-Worklet (M-CPU, N9R-23). WAHRSCHEINLICH.
- **iPhone:** Faktor 2–2,5 gegenüber Xeon (Spec §15.1, UNBELEGT) → 64-TT-Stimme ≈ 2,8–3,5 %.
- **Polyphonie (Vorschlag):** Spur-Grenze wie FM ≤ 12 % (Xeon, Mittel) **und** P99 der Blockzeit ≤ 18 %. 64 TT: **8 Stimmen** (8 × 1,40 = 11,2 %); 128 TT (Profi): **4 Stimmen**; 32 TT: 8 Stimmen. Die 9. Note stiehlt die älteste (5 ms Blende). Besteht N9R-23 nicht, wird die Standard-Polyphonie 6; besteht die Geräte-Messung N9R-39 b nicht, wird sie 4.
- **CPU-Begrenzer (ergänzt §15.2):** Das Lastmaß für Resynthese-Spuren ist die **Blockspitze** (P95 der Blockzeit über die letzten 0,5 s ÷ Blockdauer), nicht das Mittel. Vorschlag. Stufe 1 (Last > 0,45): Teiltöne halbieren, leiseste zuerst (64 → 32: −29 % je Stimme, gemessen); Stufe 2 (> 0,60): Resynthese-Spuren ≤ 4 Stimmen; Stufe 3 wie v2. Gespeichertes bleibt unverändert (I-08).
- Werks-Beispiel Sprechende Fläche: Akkord mit 3–4 Stimmen ≈ 3–5,6 % (Xeon). WAHRSCHEINLICH (aus der Tabelle).

### 4.2 Größe je Analyse

KB/s als Base64-Text, 32 ERB, N 64, 100/s — `speicher-fps.out`. Rauheit (3 Bänder, deflate × 4/3) aus `rauheit-3band.out`: 3,23 bzw. 3,08 KB/s. Einsatz gerechnet: 58 ms × Rate × 1 Byte × 4/3 (≈ 3,7 KB bei 48 kHz; Gewinn durch deflate UNBELEGT). BELEGT (gemessen) bzw. gerechnet.

| Aufnahme (Korpus des Prototyps) | Dauer | TON | FREI | AUTO | Größe des AUTO-Klangs |
|---|---|---|---|---|---|
| Löwe (qABCs) | 1,95 s | 4,36 KB/s | 20,24 KB/s | FREI (Regel: stimmhaft < 50 %) | ≈ 50 KB (39,5 + Rauheit 3 Bänder 6,3 + 1 Einsatz 3,7) |
| Löwe (Tux Paint) | 1,83 s | 5,04 | 18,29 | FREI | ≈ 43 KB (33,5 + Rauheit 3 Bänder 5,6 + 1 Einsatz 3,7) |
| Sax-Ton A4 | 3,50 s | 5,70 | 11,44 | TON | ≈ 23 KB |
| Sax-Phrase | 1,26 s | 6,28 | 14,56 | FREI | ≈ 22 KB |
| Klavier C4 | 4,00 s | 4,46 | 5,15 | FREI | ≈ 24 KB |
| Sprache EN (16 kHz) | 2,15 s | 7,95 | 15,03 | TON | ≈ 22 KB (4 Einsätze) |
| Wort „Löwe“ (24 kHz) | 0,60 s | 8,65 | 17,09 | TON | ≈ 9 KB (2 Einsätze) |

- **Budget (Vorschlag): `data` ≤ 60 KB je Klang.** Grund: Raum-Sounds sind online ≤ 64 KB Text (`r7/online.md` N8O-33, Schema `octet_length(body) <= 65536`), Gemeinschafts-Dokumente ≤ 256 KiB (Nachtrag N0.3). Ein Klang mit Analyse bleibt so überall teilbar.
- **Schlimmster Fall:** 8 s rauschiges Geräusch im Modus FREI = 162 KB → nach Stufe C ≈ 65 KB + Rauheit 3 Bänder ≈ 26 KB → Stufe C′ (1 Hüllkurve) ≈ 65 + 9 KB → Stufe E kürzt auf ≈ 6,5 s. Gerechnet aus `speicher-stufen.out` und `rauheit-3band.out`.
- **Klang mit B** (VERWANDELN): A und B zusammen ≤ 60 KB; der Begrenzer verkleinert beide gemeinsam. Vorschlag.
- `ed` (Malen): ≈ 40 Byte je Strich → 100 Striche ≈ 4 KB. Gerechnet.

### 4.3 Analysezeit

Node, Xeon, ein Faden, ms je Sekunde Audio. BELEGT (gemessen).

| Variante | Mittel | höchster Wert | Datei |
|---|---|---|---|
| Prototyp-Analyse (YIN direkt, Auffüllung 4), je Modus | 531 | 1 349 (Löwe, TON) | `analyse-zeit2.out` |
| YIN per FFT (ergebnisgleich: gleiche Spuren, f₀ 0,000 ct) | 179 | 467 | `analyse-zeit2.out` |
| + Auffüllung 2 | 142 | 302 | `analyse-zeit2.out` |
| **AUTO** = beide Modi + beide Render + Vergleich + Ampel (Prototyp-Synthese, nicht optimiert) | **586** | 932 (Löwe) | `auto-kosten.out` |

- **Wiederholbarkeit:** Ein zweiter Lauf von `auto-kosten.mjs` gibt identische Mel-, Boden- und AUTO-Werte; die Zeit ist +6 % (620 statt 586 ms/s, Löwe 982 statt 932). BELEGT (gemessen, `r8/rev-resyn/auto-kosten.rerun.out`).
- **8-s-Grenzfall:** Löwe qABCs auf 8 s bei 48 kHz gekachelt: Analyse allein 1,65 s (FREI) + 2,80 s (TON) auf der Xeon. BELEGT (gemessen, `r8/rev-resyn/ana-speicher.out`). Mit Render und Ampel nach alter Regel ≈ 6–7 s (gerechnet), am iPhone ≈ 12–18 s (Faktor UNBELEGT). Mit der neuen AUTO-Regel (§3.2 Schritt 10) entfällt beim Geräusch die TON-Analyse (−2,8 s). WAHRSCHEINLICH.
- **Budget (Vorschlag):** AUTO im Worker ≤ 0,8 s je Sekunde Audio im Mittel über den Korpus, Einzelfall ≤ 1,5 s/s (Chromium, Xeon), **auch für die 8-s-Grenzfälle** (Löwe ×4, Sax-Ton ×2). **Am Gerät** (Referenzgerät: Xanders iPhone, Modell im Prüfprotokoll nennen): 8-s-Löwe AUTO ≤ 2,5 s je s Audio; sonst wird AUTO durch eine Vorauswahl ersetzt (stimmhaft < 50 % → nur FREI, sonst nur TON) und Vergleich/Ampel laufen erst nach [ÜBERNEHMEN] im Hintergrund. Fortschrittsbalken und [Abbrechen] sind Pflicht. N9R-09, N9R-39 a.
- Die optimierte Synthese (u32-Bank: 64 TT ≈ 14 ms je s) macht die Render-Anteile (60–215 ms/s im Prototyp) deutlich kleiner. WAHRSCHEINLICH.
- **Arbeitsspeicher (M-SPEICHER):** Der Prototyp-Code hält alle Spektren und Kandidaten-Spuren: je Modus ≈ 50 MB ArrayBuffers, Prozess-RSS +65–96 MB für 8 s bei 48 kHz; Löwe FREI 7 587 Spuren. BELEGT (gemessen, `r8/rev-resyn/ana-speicher.out`). Die frühere Schätzung „1,5 MB + STFT-Puffer“ war um etwa das 50-Fache zu klein. Im WKWebView älterer iPhones kann das System die Seite dann beenden. WAHRSCHEINLICH. **Budget (Vorschlag): Zuwachs ≤ 64 MB Spitze für AUTO bei 8 s** (Node: `process.resourceUsage().maxRSS` nach der Analyse minus RSS davor; Gerät: kein Absturz beim 8-s-Grenzfall). Technik: STFT rahmenweise streamen statt alle Spektren zu halten; Kandidaten-Spuren im FREI-Modus schon während der Verfolgung auf 4 × N begrenzen; TON und FREI nacheinander rechnen und den unterlegenen Modus sofort freigeben. N9R-09.

### 4.4 Dateigröße der App

| Paket | Code | Daten | Summe |
|---|---|---|---|
| V9d | +65 KB (Kern ≈ 50 KB: die Prototyp-Dateien `dsp`, `model`, `edit`, `extras`, `metrics` haben zusammen 62 KB, der Kern braucht davon gut 50 KB, UNBELEGT; Blatt ≈ 15 KB) | – | +65 KB |
| V9d′ | +35 KB | – | +35 KB |
| V9e | +45 KB | Werks-Analysen ≤ 60 KB (4 Klänge, Begrenzer Stufe C) | +105 KB |
| V9c | −30 KB | – | −30 KB |
| **Summe** | | | **+175 KB** |

- Nachtrag C.4 (mit A.4b): ≈ 3,50 MB am Ende. Mit RS: **≈ 3,68 MB**. Dazu kommen die noch nicht eingetragenen Pläne VO (`r7/online.md` §7.5: +91 KB) und VS (`r7/stimme.md` §12: +210–230 KB) → **≈ 3,99 MB** bei der Grenze 4,0 MB (EN-17). Gerechnet.
- Möglichkeiten (Entscheidung D5): (a) EN-17 auf 4,5 MB (Viewer erlaubt 16 MB; die Startzeit-Abnahme §15.3 bleibt der eigentliche Wächter); (b) Analyse-Teil des Kerns komprimiert einbetten und per `DecompressionStream` entpacken (spart geschätzt 30–40 KB, UNBELEGT); (c) nur 2 Werks-Klänge (−30 KB).
- Startzeit: Lange Base64-Zeichenketten sind billig zu laden. Hinweis aus der Messung: `JSON.parse` von 678 KB dauerte 1,4–1,6 ms (`json-push.out`). WAHRSCHEINLICH übertragbar.

### 4.5 Speichern und Online

| Ort | Regel | Grundlage |
|---|---|---|
| Lokal (Autosave, IndexedDB) | Projekt mit `p.resyn` im Klang; Original nur in `resyn-src` (§3.7) | Vorschlag |
| Projektdatei `.json` | enthält das Modell (inkl. Einsätze), keine weiteren PCM-Daten | Vorschlag |
| Online VO1 | Projekt-Text ≤ 2 MB (`too_large`), Push 2 s nach der Änderung, Fassungen ≤ 1 je 10 min, Quote 60 MB je Person | `r7/online.md` §2.1, §4.1, §4.3 |
| JSON-Kosten | Projekt 210 KB + 8 Analysen à 60 KB = 678 KB: `stringify` +1 ms (2,2 → 3,1 ms), `parse` unverändert | BELEGT (gemessen, `json-push.out`) |
| **Volumen** | Jede Server-Fassung trägt alle Analysen mit (z. B. 3 Klänge à 30 KB = 90 KB je Fassung). Bei ≈ 800 automatischen Fassungen in 30 Tagen (3 Personen, `r7/online.md` §2.1) frisst das die Quote schnell. | gerechnet; WAHRSCHEINLICH |
| **Vorschlag an VO** (D6) | Analysen je `rid` einmal speichern (Tabelle `resyn_data`, RLS wie das Projekt), Fassungen tragen nur `rid`. Bis dahin: höchstens 8 Resynthese-Klänge je Projekt, Hinweis ab dem 9. | Vorschlag |

---

## 5. Oberfläche

Geometrie nach Spec §0.4: Kopfleiste P 52 px, L 44 px; Blätter in P y 52 → 541 (489 px), Tastatur bleibt darunter sichtbar; Editor-Körper P ≈ 305 px, L ≈ 140 px; Trefferflächen P ≥ 44×44, L ≥ 40×36 (L4); höchstens 6 große Regler + 3 Reihen Kleinregler vorne (L1). Alle Texte deutsch (L5). Spektrogramme mit sequentieller Farbrampe aus den Theme-Farben (hell/dunkel).

### 5.1 Einstieg

- **Engine-Wahl im Synth-Editor:** neuer Eintrag RESYNTHESE. Auf einer Spur ohne Analyse öffnet er sofort das Blatt KLANG EINFANGEN.
- **Menü → „Klang einfangen …“** für die gewählte Spur.
- **Bibliothek:** Engine-Filter „Alle Resynthese“ (EN-04) mit den Werks-Klängen und eigenen Analysen.
- Als **Drum-Pad** über die Pad-Quelle (PAD-R1), z. B. Löwe auf Pad 12.

### 5.2 Blatt KLANG EINFANGEN (V9d; [ÜBERNEHMEN] ab V9d′)

**P1 · Schritt 1 – Quelle**
```
┌──────────────────────────────────────────────┐ y 52
│ ✕   KLANG EINFANGEN                ● ○ ○     │ 44  ✕ = schließen, nichts ändert sich
│ Woher kommt der Klang?                       │ 28
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│ │     🎤     │ │     📁     │ │     ♪      │ │ 112 je ≥ 112 × 112 px
│ │ AUFNEHMEN  │ │   DATEI    │ │ APP-KLANG  │ │     🎤 nur mit VS1 in der Safari-Seite
│ └────────────┘ └────────────┘ └────────────┘ │
│ Bis 8 Sekunden: ein Ton, ein Wort oder ein   │ 44
│ Geräusch – am besten ohne Hall.              │
│ ┌──────────────────────────────────────────┐ │
│ │ Ohne Mikro: Sprachmemos → Teilen →       │ │ 56  nur ohne 🎤 (Claude-App)
│ │ „In Dateien sichern“ → hier DATEI.       │ │
│ └──────────────────────────────────────────┘ │
│ Ausprobieren: [Löwe] [Saxofon] [Klavier]     │ 44  Werks-Klänge (ab V9e), laden direkt
│               [Sprechende Fläche]            │ 44
└──────────────────────────────────────────────┘ y 541 · Tastatur bleibt sichtbar
```
Ohne 🎤 stehen DATEI und APP-KLANG als zwei Felder à 179 px.

**P1 · Aufnahme (nur mit 🎤)**
```
│ ✕   KLANG EINFANGEN · Aufnahme      ● ○ ○    │ 44
│ Die App ist still, solange du aufnimmst.     │ 28
│ ┌──────────────────────────────────────────┐ │
│ │ ▁▂▅▇▆▃▂▁▂▄▆▇▅▃▂   laufende Welle + Pegel │ │ 120
│ └──────────────────────────────────────────┘ │
│                2,4 s / 8,0 s                 │ 32
│                   ( ● )                      │ 112 96 × 96 px: Tipp = Start / Stopp
│ zu leise · gut · übersteuert                 │ 28
```

**P1 · Schritt 2 – Schnitt und Art**
```
│ ✕   KLANG EINFANGEN                ○ ● ○     │ 44
│ ┌──────────────────────────────────────────┐ │
│ ▐│∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿│▌ │ 140 Wellenform; Griffe ▐ ▌ je 44 px breit
│ └──────────────────────────────────────────┘ │
│ 3,2 s gewählt · „Löwe.m4a“                   │ 28
│ [▶ ANHÖREN]         ART [AUTO│ TON │FREI]    │ 44  AUTO = Standard
│ Herkunft [Eigene Aufnahme ▾]                 │ 44  eigene · CC0 · CC BY … · frei · weiß nicht
│ ┌──────────────────────────────────────────┐ │
│ │               ANALYSIEREN                │ │ 64  dann „Analysiere … 64 %“ + [Abbrechen]
│ └──────────────────────────────────────────┘ │
```

**P1 · Schritt 3 – Ergebnis**
```
│ ✕   KLANG EINFANGEN                ○ ○ ●     │ 44
│ Geräusch · kein fester Ton · 2,0 s · FREI    │ 28  bzw. „Ton · A4 +3 ct · 3,5 s · TON“
│ ┌──────────────────────────────────────────┐ │
│ │ Spektrogramm des Nachbaus (Zeit × Hz)    │ │ 120
│ └──────────────────────────────────────────┘ │
│ ● grün – in allen Messungen nah am Original  │ 32  gelb: „nah, etwas glatter“ · rot: „deutlich anders (Hall? mehrstimmig?)“
│ [▶ ORIGINAL]                [▶ NACHBAU]      │ 56  gleiche Lautheit
│ 64 Teiltöne · 32 Bänder · 1 Einsatz · 23 KB  │ 24  ggf. „verkleinert: 32 Teiltöne“
│ [    ÜBERNEHMEN AUF SPUR 2    ]   [NEU]      │ 56  ab V9d′ (ein Undo)
│ Die Tastatur spielt schon den Nachbau.       │ 24  ab V9d′
```

**L1 (844×390) · Blatt** — Bereich y 44 → 280 (236 px), Tastatur 110 px darunter
```
Schritt 1
│ ✕ KLANG EINFANGEN ● ○ ○   Bis 8 s · ein Ton, ein Wort oder ein Geräusch      │ 40
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  ┌─────────────────────────┐ │
│ │ 🎤 AUFNEHMEN │ │ 📁 DATEI     │ │ ♪ APP-KLANG │  │ Ausprobieren:            │ │ 140
│ └─────────────┘ └─────────────┘ └─────────────┘  │ [Löwe] [Saxofon]         │ │
│                                                   │ [Klavier] [Fläche]       │ │
│ Ohne Mikro: Sprachmemos → Teilen → „In Dateien sichern“ → DATEI              │ 36
Schritt 2
│ ✕ KLANG EINFANGEN ○ ● ○   3,2 s · „Löwe.m4a“          Herkunft [Eigene ▾]    │ 40
│ ┌──────────── Wellenform 540 px ────────────────┐   [▶ ANHÖREN]              │
│ ▐│∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿│▌   ART [AUTO│TON│FREI]      │ 140
│ └────────────────────────────────────────────────┘   [   ANALYSIEREN   ]      │
│ Griffe ziehen = Anfang/Ende                                                   │ 28
Schritt 3
│ ✕ KLANG EINFANGEN ○ ○ ●   Geräusch · 2,0 s · FREI · 39 KB                    │ 40
│ ┌──────────── Spektrogramm 540 px ──────────────┐   ● grün                    │
│ │                                                │   [▶ ORIGINAL]             │ 140
│ └────────────────────────────────────────────────┘   [▶ NACHBAU]              │
│                                                       [ÜBERNEHMEN · SPUR 2]   │ 44
```

### 5.3 Editor RESYNTHESE (V9d′; Teile ab V9e markiert)

**P1 · Körper 305 px** (36 + 92 + 104 + 36 + 36 = 304 px; KLANGKÖRPER §11.2 hat dieselbe Höhe mit 36 + 92 + 140 + 36)
```
│ Löwe ▾ · Geräusch · 2,0 s       [A│B]  [EINFANGEN] │ 36
│ HELLIGKEIT ◯   KÖRPER ◯    ATEM ◯     ZEIT ◯       │ 92  4 Makros wie KLANGKÖRPER
│ ┌──────────────── Klang-Streifen ────────────────┐ │
│ │ Spektrogramm · ▒ Halte-Bereich ▒ · Spielköpfe  │ │ 104 Ziehen: Halte-Bereich (V9d′);
│ │ | POSITION (V9e) · ↑ VERWANDELN (V9e)          │ │     X = POSITION, Y = VERWANDELN (V9e)
│ └────────────────────────────────────────────────┘ │
│ [EINMAL│HALTEN│FRIEREN]  FORMANT FEST ◉  RAUHEIT ◦ │ 36  FRIEREN ab V9e
│ [TIEFE ▸ Teiltöne │ Rauschen │ Verwandeln │ Quelle] │ 36  Teiltöne/Verwandeln ab V9e
```

**L1 · Körper 140 px**
```
│ ┌──── Klang-Streifen 420 × 104 ────┐  HELLIGKEIT ◯  KÖRPER ◯  ATEM ◯  ZEIT ◯     │ 104
│ └──────────────────────────────────┘                                              │
│ [EINMAL│HALTEN│FRIEREN] FORMANT ◉ RAUHEIT ◦   [TIEFE ▸ Teiltöne│Rauschen│Verw.│Quelle] │ 36
```
Kopfzeile mit Name, [A│B] und [EINFANGEN] liegt wie bei den anderen Engines im Editor-Kopf.

### 5.4 TIEFE-Seiten (P1, Körper 305 px)

```
TIEFE › Rauschen (V9d′)
│ EINSATZ [an│aus] Pegel ◦   RAUHEIT [Aufnahme│Zufall] │ 36
│ ┌── 32 Rauschbänder (Mittel) – Finger zieht Pegel ──┐ │ 197
│ └───────────────────────────────────────────────────┘ │
│ ANSCHLAG→HELL ◦   FREIGABE ◦   [Bänder zurück]        │ 36
│ [TIEFE ▸ Rauschen │ Quelle]                            │ 36

TIEFE › Quelle (V9d′)
│ „Löwe.m4a“ · 2,0 s · FREI · 39 KB · ● grün            │ 36
│ Grundton [C3 ▾] [−][+]  (±1 HT · ±50 ct)              │ 44
│ Herkunft [CC BY 3.0 ▾] · von [qubodup ✎] · Link ⧉     │ 44
│ [▶ ORIGINAL] nur auf diesem Gerät   [NEU ANALYSIEREN ▸]│ 52
│ Teiltöne 64 · Bänder 32 · Einsätze 1 · 100/s          │ 28
│                                                        │ 65  frei
│ [TIEFE ▸ Rauschen │ Quelle]                            │ 36

TIEFE › Teiltöne (V9e)
│ [MALEN│RADIEREN│AUSWAHL]  Stärke ◦      [−] [+]       │ 36  Zoom über Knöpfe (L4: 2. Finger zählt nicht)
│ ┌── Raster: → Zeit · ↑ Teilton 1…64 (FREI: Hz) ─────┐ │ 197 Farbe = Pegel, Linie = POSITION
│ └───────────────────────────────────────────────────┘ │
│ TEILTÖNE ━━●━━ 32   [ALLE│UNG.│GER.]  [→ KLANGKÖRPER] │ 36
│ [TIEFE ▸ Teiltöne │ Rauschen │ Verwandeln │ Quelle]    │ 36

TIEFE › Verwandeln (V9e)
│ A [Löwe ▾]   B [Saxofon A4 ▾]        [B EINFANGEN]    │ 36  A: aktuelle Analyse oder SÄGE
│ VERWANDELN ◯   ART [MISCHEN│SPRECHEN]                 │ 92
│                AUSRICHTEN [LÄNGE│EINSATZ]             │
│ ┌──── XY: → POSITION · ↑ VERWANDELN (A unten) ──────┐ │ 104
│ └───────────────────────────────────────────────────┘ │
│ TONHÖHE von [A│B]   LEBENDIG ◦                        │ 36
│ [TIEFE ▸ Teiltöne │ Rauschen │ Verwandeln │ Quelle]    │ 36
```
In L1 haben die TIEFE-Seiten zwei Spalten: links das Raster bzw. der Streifen (420 × 104), rechts die Regler (2 Reihen à 36 px + 1 Reihe à 68 px).

### 5.5 Kleine Größen

- **P2 (375×667):** Wellenform und Spektrogramm 96 px, Werks-Beispiele in einer Zeile mit ‹ ›, Hinweisbox einzeilig.
- **P3 (320×568, darf vereinfachen):** Quellfelder 2 + 1, Klang-Streifen 72 px, Makro-Knöpfe 48 px in 4 × 76 px, Segmente als Kürzel (1× │ HALT │ FRIER).
- **L2 (667×375):** Wellenform 400 px breit, rechte Spalte 220 px.
- Abnahme M-PLATZ für alle Zustände: N9R-26 und N9R-37.

### 5.6 Wortliste (ergänzt §0.5)

| Begriff | Bedeutung |
|---|---|
| **RESYNTHESE** | Engine, die einen eingefangenen Klang aus Teiltönen und Rauschen nachbaut |
| **KLANG EINFANGEN** | Blatt: Quelle → Analysieren → Ergebnis |
| **ORIGINAL / NACHBAU** | Aufnahme bzw. Resynthese im A/B-Vergleich |
| **ART: AUTO · TON · FREI** | Analyse-Art; AUTO rechnet beide und nimmt die nähere (TON bei Gleichstand) |
| **AMPEL** | Nähe zum Original: grün / gelb / rot |
| **EINSATZ** | kurzes Original-Schnipsel am Klangbeginn. Nicht „Anschlag“: Das Wort bleibt die Tastenstärke. |
| **KLANG-STREIFEN** | kleines Spektrogramm im Editor, zugleich XY-Feld |
| **SPIELART: EINMAL · HALTEN · FRIEREN** | Abspielweise; HALTEN nutzt den **Halte-Bereich**. Nicht „Schleife“: Das Wort ist für die Song-Wiederholung vergeben (§0.5). |
| **FORMANT FEST** | Klangfarbe bleibt beim Transponieren stehen |
| **POSITION / LEBENDIG** | Stelle im Klang beim Einfrieren und Scannen / kleine Zufallsbewegung gegen Starre |
| **VERWANDELN: MISCHEN · SPRECHEN** | Übergang A → B. Nicht „Morph“: Das Wort gehört den Klangzuständen (§0.5). SPRECHEN = A bekommt die Klangfarbe von B. |
| **SÄGE** | eingebauter Grundklang für SPRECHEN (ohne Aufnahme) |

**Hilfe-Zeilen (L10, Auswahl):** AMPEL „Wie nah der Nachbau am Original ist – grün heißt: in allen Messungen nah (Klang, Stimme bzw. Rauheit).“ · ART „AUTO probiert TON und FREI und nimmt das Bessere.“ · KÖRPER „Links größer und tiefer, rechts kleiner und heller – die Tonhöhe bleibt.“ · FRIEREN „Hält den Klang an der POSITION fest; LEBENDIG macht ihn wieder lebendig.“ · SPRECHEN „A spricht mit der Klangfarbe von B – zum Beispiel eine Fläche, die redet.“

---

## 6. Bibliothek: Werks-Klänge und Quellen

### 6.1 Vier Werks-Klänge (V9e)

| Klang (Rolle, EN-18) | Quelle (Vorschlag) | Lizenz | Kennzeichen | Ersatz / besser |
|---|---|---|---|---|
| **Löwe** (Effekt) — **nur wenn N9R-38 besteht**, sonst entfällt er (dann 3 Werks-Klänge) | Freesound #212764 „Lion Roar“ (qubodup): https://freesound.org/people/qubodup/sounds/212764/ | CC BY 3.0 → Namensnennung im ⓘ | BELEGT (SE) | CC0: #69572 „Lion roaring.mp3“ (Bidone), Rabe und Wasser im Hintergrund, Ausschnitt wählen: https://freesound.org/people/Bidone/sounds/69572/ — BELEGT (SE); #405211 „Lions Screaming During Night“ (Felix Blume), CC0 laut Sekundärquelle: https://freesound.org/people/felix.blume/sounds/405211/ ([BMCC](https://openlab.bmcc.cuny.edu/mmp-100-fall-2023/?p=1393)) — WAHRSCHEINLICH. **Am besten:** Xanders eigene Zoo-Aufnahme (Sprachmemo). |
| **Saxofon** (Lead) | Karoryfer „Weresax“, Original-WAV: https://github.com/sfzinstruments/karoryfer.weresax | **CC0 1.0** ([LICENSE](https://raw.githubusercontent.com/sfzinstruments/karoryfer.weresax/master/LICENSE) gelesen) | BELEGT | Iowa MIS Alt-Sax mit/ohne Vibrato, „without restrictions“: https://theremin.music.uiowa.edu/MIS-Pitches-2012/MISEbAltoSaxophone2012.html, https://theremin.music.uiowa.edu/MIS.html — BELEGT (SE). **Nicht** das npm-MP3-Paket des Prototyps (dort steht „Samples: CC-by 3.0“). |
| **Klavier** (Keys) | Salamander Grand Piano, Note C4, mittlere Velocity (Alexander Holm): https://github.com/sfzinstruments/SalamanderGrandPiano | CC BY 3.0 (README gelesen) → Namensnennung | BELEGT | Iowa MIS Piano (SE). Hinweis im ⓘ: „eine Note eingefangen – über ±1 Oktave natürlich; ganzes Klavier: KLANGKÖRPER-Vorlage Klavier“ |
| **Sprechende Fläche** (Fläche) | A = SÄGE (eingebaut); B = ein Satz (2–3 s) aus Thorsten-Voice 2021.02 (Thorsten Müller), Repo https://github.com/thorstenMueller/Thorsten-Voice, Daten https://doi.org/10.5281/zenodo.5525342 | **CC0** ([LICENSE](https://raw.githubusercontent.com/thorstenMueller/Thorsten-Voice/master/LICENSE) gelesen); Datensatz 2021.02 als CC0 gelistet: [Mozilla Data Collective](https://datacollective.mozillafoundation.org/datasets/cmm2fwi490024nt0779vv9o0d) (SE) | BELEGT / BELEGT (SE) | **Xanders eigene Stimme.** Nicht Common Voice: CC0, aber laut Datenblatt „re-host or re-share“ verboten — BELEGT (SE): [Common Voice DE](https://datacollective.mozillafoundation.org/datasets/cmn4rsdh6009unz07jdn2ol9p) |

- **Nur für Tests, nie in der App (auch nicht in `index.html` eingebettet):** die GPL-Aufnahmen des Prototyps (qABCs, Tux Paint) und die englische Sprache (LibriSpeech, CC BY 4.0), siehe `resyn-prototyp.md` §2 und Testkorpus §8.0.
- **Budget:** die vier Analysen zusammen ≤ 60 KB (Begrenzer Stufe C; −46 … −61 %, Mel ≤ +0,33 dB, §3.4). Rechnung mit den Raten aus `speicher-stufen.out` und `rauheit-3band.out` und angenommenen Längen: Löwe **1,8 s** FREI ≈ 20 KB (Teiltöne/Bänder nach Stufe C ≈ 14 KB + Rauheit 3 Bänder ≈ 5,8 KB, ohne EINSATZ, der beim Löwen höchstens 0,1 dB Mel bringt: `resyn-proto/out/tabellen.md`), Sax 3,5 s TON ≈ 13 KB, Klavier 4 s FREI ≈ 15 KB, Sprechende Fläche: Satz 2,5 s TON mit 2 Einsätzen ≈ 12 KB, SÄGE 0 KB → ≈ 60 KB. Gerechnet. Mit 2 s Löwe wären es ≈ 62 KB; dann Stufe C′ für den Löwen.
- **Spielweise:** Löwe EINMAL, FORMANT FEST aus, KÖRPER als „Größe“ · Saxofon HALTEN mit Halte-Bereich, mono + Glide als zweite Variante „Sax Legato“ · Klavier EINMAL · Sprechende Fläche HALTEN über den ganzen Satz, VERWANDELN 100 % SPRECHEN, POSITION per LFO als Variante „Fläche murmelt“.

### 6.2 Rechtliches (keine Rechtsberatung)

- **EuGH C-476/17 „Pelham“ (29.07.2019):** Schon das Übernehmen eines sehr kurzen Audiofragments ist grundsätzlich eine Teil-Vervielfältigung des Tonträgers. Nicht erfasst ist ein Fragment, das verändert und beim Hören nicht wiedererkennbar eingefügt wird. BELEGT (SE): [EuGH-Pressemitteilung](https://curia.europa.eu/jcms/jcms/p1_2278254/de), [Urteil (Amtsblatt-Fassung)](https://op.europa.eu/en/publication-detail/-/publication/7e88dcb7-ddd2-11e9-9c4e-01aa75ed71a1/language-de), [Pinsent Masons](https://www.pinsentmasons.com/de-de/out-law/nachrichten/copyright-controls-over-sound-samples-clarified).
- **Folge für SYNQUENZER:** Der Original-EINSATZ ist eine Vervielfältigung. Ein Nachbau, der „am Zufallsboden“ liegt, ist gerade wiedererkennbar gemeint. → Werks-Klänge nur aus Aufnahmen, deren Lizenz Vervielfältigung und Bearbeitung erlaubt, oder aus eigenen Aufnahmen. WAHRSCHEINLICH.
- **Eigene Aufnahmen:** Die Rechte am Tonträger hat, wer aufnimmt; Tierlaute sind keine Werke. UNBELEGT (eK). Fremde Stimmen nur mit Einverständnis (Persönlichkeitsrecht). UNBELEGT (eK).
- **Nutzer-Importe:** Die App fragt die Herkunft ab (`src.lic`) und erinnert beim Teilen (N9R-14); sie sperrt nichts. Vorschlag.

### 6.3 Regeln im Bau

1. Vor dem Einbetten die Lizenzzeile auf der Quellseite lesen und mit Datum, URL und Wortlaut in `CHANGES-V9e.md` festhalten (Freesound und Iowa waren aus dieser Sitzung nicht abrufbar).
2. `src = {kind:'werk', name, lic, by, url}` in jedem Werks-Klang; ⓘ-Text nennt Urheber, Titel, Lizenz und Link (CC BY: Namensnennung Pflicht, BELEGT: [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/) laut Salamander-README).
3. Namen ohne Marken, Künstler und Titel (E9, L5).
4. Liegt eine eigene Aufnahme von Xander vor (F1, F2 in §12.2), ersetzt sie den Vorschlag.
5. **Löwe:** Vor N9R-36 mindestens zwei unkomprimierte, dokumentierte Löwen-Aufnahmen beschaffen (≥ 44,1 kHz WAV/FLAC, CC0 oder CC BY, volles Brüllen, Lizenzseite gelesen; besser zusätzlich Xanders Zoo-Aufnahme) und damit den Korpus neu messen (N9R-38). Grund: Die beiden Testlöwen sind ≈ 2 s lange Vorbis-Clips mit 52 bzw. 78 kbit/s aus Kinder-Lernprogrammen, Ursprung unbekannt (BELEGT, gemessen aus den Ogg-Kopfdaten, `resyn-proto/dl/`); die Kodierung verschmiert WAHRSCHEINLICH gerade Pulsation und Höhen. Der f₀-Median des qABCs-Löwen (≈ 31 Hz, am Rand des Suchbereichs 30 Hz) liegt unter dem für Löwengebrüll genannten Bereich 40–200 Hz; der Tux-Paint-Löwe (≈ 48 Hz) liegt darin — BELEGT (SE): [ScienceDaily zu Klemuk u. a. 2011](https://www.sciencedaily.com/releases/2011/11/111102190012.htm), Studie [PLoS ONE / PMC3206895](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3206895/) (aus der Sitzung nicht abrufbar). Ob die Clips typisches volles Brüllen sind, ist offen.

---

## 7. Pakete

**Zuschnitt gegenüber dem Auftrag:** Der Auftrag skizzierte V9d (Einfangen bis spielbar) und V9e (Formen und Morphen, mit formanterhaltendem Transponieren). Einfangen und Spielen zusammen wären ≈ 9–10 h; die Regel ist „1 Paket ≈ 4–5 h“ (Spec, Einleitung „So liest man dieses Dokument“). Deshalb **V9d** (Analyse) + **V9d′** (Spielen). Der Formanterhalt wandert nach V9d′, weil ein spielbares Instrument ohne ihn bei jeder Transposition nach Micky Maus klingt (Schwerpunkt wandert 100 % mit, gemessen, Prototyp §5.1). V9e behält Einfrieren/Scannen, Verwandeln, Vereinfachen und Malen. Vorschlag.

### V9d — Klang einfangen (Analyse, Format, A/B)

**Ziel.** Aus einer Aufnahme (Datei, App-Klang, Mikro über VS1) entsteht in wenigen Sekunden ein Resynthese-Modell mit Ampel und A/B-Vergleich.

**Umfang.** §3.1 Kern + Worker/Rückfall · §3.2 Analyse inkl. AUTO und Ampel · §3.3 Format, `normalizeSound('resyn')` · §3.4 Größen-Begrenzer · §3.7 Quellen und Original lokal · §5.2 Blatt Schritt 1–3. **Interim (§17.0 Regel 3):** Schritt 3 endet mit A/B; [ÜBERNEHMEN] und die Tastatur kommen mit V9d′.

**Nicht-Umfang.** Engine im Worklet, Editor-Seite (V9d′); FRIEREN, VERWANDELN, Malen, → KLANGKÖRPER, Werks-Klänge (V9e); Mikrofon-Grundlage selbst (VS1).

**Berührungspunkte.** Datei-Eingaben (`#fileIn`/`#sndIn` gibt es für `.json`; neu: Audio-Eingabe mit `accept="audio/*"`), `OfflineAudioContext` + Worklet-Modul (App-Klang), neuer Worker aus dem Kern-Text, IndexedDB `synquenzer` (neuer Store `resyn-src`; Versionssprung mit VS3 abstimmen), Blatt-System (§v2-Blätter), `normalizeSound`, Test-API.

**Dauer** 5 h · **App-Version** 4.32.0 · **Budget** +65 KB.

**Abnahme.** N9R-01 … N9R-15, N9R-13b, N9R-39 a, N9R-40 (§8). **Tests.** `v9d-kern-node.mjs` (Korpus-Treue, AUTO, Ampel mit Anker-Selbsttest, Format, Größe, Zeit, M-SPEICHER), `v9d-blatt.mjs` (Chromium: Blatt, Worker und Rückfall, longtask, M-PLATZ). **Geräte-Messung (messbar, N9R-39 a):** über die Test-API auf der githack-Seite am Referenzgerät M-ANA für den 8-s-Löwen und den 8-s-Sax-Ton ablesen und protokollieren; 8-s-Grenzfall ohne Absturz. **iPhone-Prüfpunkte (zusätzlich, Höreindruck):** Sprachmemo als m4a importieren; A/B anhören („klingt nah?“); Ampel plausibel.

**Risiken.** Worker im Viewer (Rückfall Pflicht); Formate von `decodeAudioData` auf iOS; Analysezeit am iPhone (Faktor unbelegt; Messung N9R-39 a); Arbeitsspeicher der Analyse (§4.3, M-SPEICHER).

### V9d′ — Klang spielen (Engine `resyn`, Editor)

**Ziel.** Der eingefangene Klang wird ein spielbares Instrument: Tastatur ohne Micky-Maus, vier Makros, Halten, bis 8 Stimmen.

**Umfang.** §3.5 vollständig (FRIEREN ausgenommen) · [ÜBERNEHMEN] im Blatt (ein Undo) · §5.3 Editor-Seite · §5.4 TIEFE › Rauschen und › Quelle · CPU-Begrenzer Stufen 1–2 · PAD-R1 (Pad-Quelle RESYNTHESE), MOD-R1 (alle stetigen Regler Mod-Ziele), VL-R1.

**Nicht-Umfang.** §3.6 (V9e).

**Berührungspunkte.** Worklet-Quelle (Kern-Synthese anhängen, ASCII), Stimmenverwaltung, `engineInfo().perTrack`, Begrenzer (§15.2), Synth-Editor (Engine-Wahl, Kopf), Pad-Quelle (V1d), Mod-Ziel-Liste (V5d), Verlauf (VC2a).

**Dauer** 4–5 h · **App-Version** 4.33.0 · **Budget** +35 KB.

**Abnahme.** N9R-16 … N9R-26, N9R-22b, N9R-39 b. **Tests.** `v9d2-engine-node.mjs` (Worklet extrahiert, offline, Blockzeit je Block wie `stimme-cpu-spitze.mjs`), `v9d2-spielen.mjs` (Chromium: CPU, UI, M-PLATZ). **Geräte-Messung (N9R-39 b):** OfflineAudioContext mit dem Worklet-Modul, 10 s mit 8 Stimmen × 64 TT gleichzeitig angeschlagen; Wandzeit ÷ Audiodauer ≤ 25 %, sonst Standard-Polyphonie 4. **iPhone-Prüfpunkte (zusätzlich, Höreindruck):** Sax über 2 Oktaven (Micky-Maus?); Akkord mit 8 Stimmen anhören (Knackser?); Löwe mit KÖRPER links/rechts.

**Risiken.** CPU am iPhone (Faktor unbelegt; Safari-JIT im Worklet, WebKit-Knackser-Berichte [226240](https://bugs.webkit.org/show_bug.cgi?id=226240), [255461](https://bugs.webkit.org/show_bug.cgi?id=255461) BELEGT (SE)); einfache Formant-Hüllkurve statt „True Envelope“.

### V9e — Formen und Morphen

**Ziel.** Klänge formen: einfrieren und scannen, A in B verwandeln, eine Fläche sprechen lassen, vereinfachen, Teiltöne malen; vier Werks-Klänge.

**Umfang.** §3.6 · §5.4 TIEFE › Teiltöne und › Verwandeln · Klang-Streifen als XY · zweite Analyse B (Blatt mit Ziel „B“) · Grundklang SÄGE · Werks-Klänge §6 mit Lizenz-Protokoll · *(P1)* → TABELLE.

**Nicht-Umfang.** Zonen (mehrere Analysen je Klang), Obertöne beim Abwärts-Transponieren ergänzen, Grain-Modus (§18).

**Berührungspunkte.** Engine `resyn` (Lesezeiger, B-Daten, Ops-Liste `ed`), KLANGKÖRPER (`body`-Klang erzeugen), Tabellen-Additiv (P1), Bibliothek (Werks-Einträge, Rollen EN-18), Begrenzer (A + B ≤ 60 KB).

**Dauer** 5–6 h · **App-Version** 4.34.0 · **Budget** +45 KB Code + ≤ 60 KB Werks-Daten.

**Abnahme.** N9R-27 … N9R-38. **Tests.** `v9e-formen-node.mjs`, `v9e-ui.mjs`; Hörtest N9R-38 (Protokoll in `CHANGES-V9e.md`). **iPhone-Prüfpunkte:** Einfrieren lebendig genug?; Sax → Löwe verwandeln; versteht man die sprechende Fläche?

**Risiken.** Werte für LEBENDIG und die Verständlichkeit von SPRECHEN sind ungeprüft (Hörtest); Lizenz der Löwen-Quelle beim Bau prüfen; ob der Löwe überzeugt, ist offen (Testclips verlustbehaftet, kein Hörtest) → N9R-38, sonst kein Werks-Löwe.

---

## 8. Abnahme N9R

### 8.0 Messgrößen (ergänzt §0.3 und N0.4)

Verfahren wie im Prototyp (`r8/resyn-proto/src/metrics.mjs`), dort gemessen und beschrieben (`resyn-prototyp.md` §3).

| Kürzel | Definition |
|---|---|
| **M-MEL** | Mel-Distanz in dB: STFT Hann ≈ 46 ms (Zweierpotenz), Hop ¼, Bins 50 Hz … min(16 kHz, Nyquist), 40 Mel-Bänder, je Rahmen RMS der dB-Differenz, Mittel über aktive Rahmen (Original > max − 50 dB), Boden −80 dB |
| **M-LSD** | wie M-MEL über alle Bins (Log-Spektral-Distanz; [Gray & Markel 1976](https://doi.org/10.1109/TASSP.1976.1162849), BELEGT (SE)) |
| **M-MCD** | (10/ln 10)·√(2·Σ_{d=1…13} Δc_d²), c = orthonormale DCT des ln der 40 Mel-Band-Amplituden ([Kubichek](https://ieeexplore.ieee.org/document/407206), BELEGT (SE)); nicht mit TTS-Werten vergleichbar |
| **M-BODEN** | M-MEL bzw. M-MCD zwischen zwei Renderings desselben Modells (wie gespielt, mit Rauheit und EINSATZ) mit Rausch-Startwert 1 und 2. Das ist die **Streuung des eigenen Modells; nur zusammen mit dem Anker-Selbsttest (N9R-13b) aussagekräftig.** Ein rauschlastigeres Modell hat einen höheren Boden; der Abstand zum Original kann sogar darunter liegen (Sax-Ton MCD 2,1 < Boden 2,4). Grund der Streuung: [Periodogramm-Streuung](https://arxiv.org/pdf/astro-ph/0307420), BELEGT (SE) |
| **M-RAU** | Rauigkeit je Band 100–400 / 400–1600 / 1600–6400 / > 6400 Hz: Anteil der Hüllkurven-Modulationsenergie 20–100 Hz an 1–100 Hz (Hann 5,8 ms, Hop ¼) |
| **M-PULS** | Frequenz des Maximums im Hüllkurven-Modulationsspektrum 20–100 Hz, Band 400–1600 Hz |
| **M-PER** | YIN-Aperiodizität je 10 ms (50–1000 Hz, Schwelle 0,2), Rahmen > max − 40 dB; stimmhaft = < 0,35; Kennwerte: Anteil stimmhaft, mittlere \|Δ\| |
| **M-TON** | Tonhöhenfehler in Cent (YIN je 10 ms gegen Soll), Median und P90 über stimmhafte Rahmen |
| **M-HÜLL** | Hüllkurven-MCD mit Zeitzuordnung (`envelopeMcdMapped`) |
| **M-GRÖSSE** | Länge des Base64-Textes `p.resyn.data` in Byte |
| **M-ANA** | Wandzeit der Analyse (Tipp bis Ergebnis) ÷ Audiodauer |
| **M-SPEICHER** | Zuwachs des Arbeitsspeichers während der Analyse: Node `process.resourceUsage().maxRSS` nach der Analyse minus RSS davor (MB); am Gerät: kein Neuladen/Absturz der Seite |
| **M-BLOCK** | Rechenzeit je Render-Block ÷ Blockdauer (128 Samples), Kennwerte Mittel, P99, je Blockphase (Verfahren `r8/rev-resyn/stimme-cpu-spitze.mjs`) |
| **AMPEL** | §3.2 Schritt 11 (M-MEL gegen M-BODEN plus M-PER bzw. M-RAU/M-PULS) |

**Testkorpus:** die 7 Aufnahmen des Prototyps als WAV (mono, 16 Bit; 16/24/44,1/48 kHz; nur Tests). Heute liegen sie nur im Scratchpad (`r8/resyn-proto/out/<id>/00-original.wav`) — für den Bau nicht reproduzierbar. **Festlegung (N9R-40):** Der Korpus wird Testdaten im Repo, `tests/fixtures/resyn/<id>.wav`, mit SHA-256 je Datei und `tests/fixtures/resyn/QUELLEN.md` (je Datei: Quell-URL, Urheber, Lizenz, Lizenzlink, Änderungen: Ausschnitt t0–t1, Mono-Summe, Spitze 0,9, 5-ms-Blenden). Für die qABCs- und Tux-Paint-Dateien liegen die GPL-Texte daneben (`COPYING.GPL-3`, `COPYING.GPL-2`); Lizenz laut Debian-copyright „Files: *“ GPL-3+ bzw. GPL-2 — BELEGT (`r8/rev-resyn/dl-cr/`). Für LibriSpeech (CC BY 4.0) und Salamander (CC BY 3.0) Namensnennung, Lizenzlink und Hinweis auf Änderungen — CC BY 4.0 Abschnitt 3(a)(1) verlangt u. a. Urheber, Hinweis auf die Lizenz, Link und „indicate if You modified the Licensed Material“ — BELEGT ([Legal Code](https://creativecommons.org/licenses/by/4.0/legalcode.en), gelesen über [cc-legal-tools-data](https://raw.githubusercontent.com/creativecommons/cc-legal-tools-data/main/docs/licenses/by/4.0/legalcode.en.html)). Alternative: ein Ladeskript `tests/fixtures/resyn/holen.mjs`, das von den Quell-URLs lädt, schneidet und die Hashes prüft. Die Testdateien werden **nie** in `index.html` eingebettet. **Sax:** Für den Test des Sax-Tons wird die CC0-Weresax-WAV ([karoryfer.weresax](https://github.com/sfzinstruments/karoryfer.weresax)) verwendet, wie für den Werks-Klang; die Schwellen von N9R-01/-04/-17 werden darauf neu gemessen (bis dahin gelten die Werte des MP3 aus dem npm-Paket, README „Samples: CC-by 3.0“). Dazu synthetisch: Säge A3 (44,1 kHz, 2 s), KLANGKÖRPER mit 16 bekannten TT, Klickfolge. **Grenzfälle 8 s:** Löwe qABCs ×4 und Sax-Ton ×2 hintereinander, 48 kHz (wie `r8/rev-resyn/ana-speicher.mjs`). **Anker:** „nur Rauschen ohne Rauheit“ (Rauschbänder ohne Teiltonabzug, wie `r8/rev-resyn/anker-ampel.mjs`). Rausch-Startwerte fest (`__seed`).

### 8.1 Abnahmepunkte

| ID | Paket | Prüfung | Soll | Grundlage der Schwelle |
|---|---|---|---|---|
| N9R-01 | V9d | Sax-Ton, AUTO, N 32 | AUTO = TON; M-MEL ≤ M-BODEN + 0,3 dB; M-MCD ≤ M-BODEN + 0,5 dB | gemessen 0,77 / 2,14 gegen Boden 0,81 / 2,43 (`speicher-fps.out`) |
| N9R-02 | V9d | FREI-Fälle, AUTO, gemessen auf dem gespielten Render (Rauheit, EINSATZ) | Klavier ≤ M-BODEN + 0,6 dB; Sax-Phrase ≤ + 1,0 dB; beide Löwen ≤ + 0,3 dB **und** M-RAU je Band ±0,15 **und** M-PULS ±20 % (allein die Mel-Bedingung bestünde auch der Rauschvocoder, deshalb nur zusammen mit N9R-13b gültig) | `ampel-neu.out`: Klavier +0,44, Sax-Phrase +0,85, Löwe qABCs +0,04 (M-RAU ±0,09); Tux Paint +0,02 mit breitbandiger Rauheit, M-RAU B4 +0,35 → erst mit 3 Bändern ±0,11 (`rauheit-3band.out`, M-PULS dort nicht gemessen) |
| N9R-03 | V9d | Sprache EN, AUTO + EINSATZ | M-MEL ≤ M-BODEN + 0,5 dB; M-PER: Anteil stimmhaft ≥ 0,75 × Original, mittlere \|Δap\| ≤ 0,2. Selbsttest: der Anker „nur Rauschen“ verfehlt die ap-Schwelle | Prototyp: Mel 2,3 / Boden 2,0; stimmhaft 0,45 / 0,56; \|Δap\| 0,11, Anker 0,33 |
| N9R-04 | V9d | AUTO-Regel, alle 7 | TON für Sax-Ton; FREI für Sax-Phrase, Klavier, **Löwe qABCs** und Löwe Tux Paint (beide über die Regel stimmhaft < 50 %, ohne TON-Analyse; FORMANT FEST aus); in den 5 Fällen mit Mel-Vergleich M-MEL(gewählt) ≤ min(TON, FREI) + 0,15 dB | `ampel-neu.out` (stimmhaft Löwen 0,05 / 0,17) |
| N9R-05 | V9d | Klavier, TON erzwungen | keine Aus-/Einblend-Aussetzer: M-RAU in 400–1600 und 1600–6400 Hz ≤ Original + 0,15 | Prototyp ohne Haltezeit 0,55 / 0,54 gegen 0 / 0,01 |
| N9R-06 | V9d | Rundlauf mit Wahrheit | a) Säge A3: f₀ ±5 ct, TT 1–16 im Halteteil 1/n ±2 dB; b) KLANGKÖRPER 16 TT gerendert → TON: f₀ ±5 ct, Teiltonpegel je Rahmen ab 100 ms ±1,5 dB (n ≤ 16), Frequenz ±2 ct, B ±20 % | V9c-03, V9c-01 |
| N9R-07 | V9d | Format | Kodieren → Base64 → Dekodieren bitgleich; Quantisierung ändert M-MEL ≤ 0,3 dB; `rid` = Hash von `data` | gemessen höchstens ±0,15 dB (`speicher-fps.out`, 100/s quantisiert gegen voll) |
| N9R-08 | V9d | Größe | alle 7 AUTO-Ergebnisse ≤ 60 KB; 8-s-Löwe (qABCs 4× hintereinander) → Begrenzer greift, `q.stufen` gefüllt, ≤ 60 KB, M-MEL-Anstieg je Stufe kumuliert ≤ 0,1 / 0,2 / 0,4 dB | gemessen +0,08 / +0,15 / +0,33 (`speicher-stufen.out`) |
| N9R-09 | V9d | Zeit und Bedienbarkeit | `longtask` nie > 50 ms während der Analyse, auch mit `__noWorker(true)`; M-ANA (AUTO + Ampel, Chromium, Xeon) Mittel über den Korpus ≤ 0,8, Einzelfall ≤ 1,5, **auch für die 8-s-Grenzfälle** (Löwe ×4, Sax-Ton ×2, je einzeln gemessen); **M-SPEICHER ≤ 64 MB** für AUTO beim 8-s-Löwen und 8-s-Sax-Ton; [Abbrechen] hält in ≤ 200 ms an, nichts ändert sich | Node gemessen 0,59 / 0,93 (`auto-kosten.out`, Wiederholung +6 %); 8 s heute 1,65 + 2,80 s Analyse und RSS +65–96 MB (`r8/rev-resyn/ana-speicher.out`) → Speicher-Technik §4.3 nötig; V9c-04 |
| N9R-10 | V9d | Quellen | WAV 44,1/48 kHz 16/24 Bit, MP3, M4A laufen; Datei > 8 s → Griffe auf den ersten 8 s; ungültige Datei → „Datei kann nicht gelesen werden“, nichts ändert sich; APP-KLANG FM-Pluck C3 → A/B ±0,5 LU, M-SP bei 50 und 500 ms ±⅓ Okt | V9c-02, V9c-05 |
| N9R-11 | V9d | Mikrofon | 🎤 nur mit VS1 und ohne Claude-Rahmen (sonst Sprachmemo-Hinweis); während der Aufnahme kein Eintrag im `noteLog`, Transport steht; Ende spätestens bei 8,0 s | `r7/stimme.md` N7V-05; Vorschlag |
| N9R-12 | V9d | A/B | \|M-LUFS(Original) − M-LUFS(Nachbau)\| ≤ 0,5 LU; Umschalten ohne M-KLICK | V9c-02 |
| N9R-13 | V9d | Ampel | Regel §3.2 Schritt 11 auf dem gespielten Render. Korpus: Sax-Ton, Sprache, Wort, Löwe qABCs grün; Sax-Phrase und Klavier gelb; Löwe Tux Paint grün mit 3-Band-Rauheit | `ampel-neu.out`, `rauheit-3band.out` |
| N9R-13b | V9d | Anker-Selbsttest der Ampel | Anker „nur Rauschen ohne Rauheit“ durch dieselbe Ampel: beide Löwen und Sprache **höchstens gelb**, Sax-Ton, Sax-Phrase und Klavier **rot** | gemessen: Löwen gelb (M-RAU B4 −0,18 bzw. B3 −0,15, knapp), Sprache gelb (M-PER), Wort gelb, Sax/Klavier rot (`ampel-neu.out`); alte Regel: Löwen und Sprache grün (`r8/rev-resyn/anker-ampel.out`) |
| N9R-14 | V9d | Herkunft | `src.lic` gesetzt (Mikro „eigene“, Datei „unbekannt“, bis der Nutzer wählt); Teilen (VC1/VO-Raum) bei „unbekannt“ zeigt einmal „Nur eigene oder frei lizenzierte Aufnahmen teilen“, blockiert nicht | §6.2 |
| N9R-15 | V9d | Daten | Original nur in `resyn-src` (≤ 20 / 15 MB, älteste zuerst), auf githack nicht über die Sitzung hinaus; Projektdatei ohne PCM außer den Einsätzen | §3.7 |
| N9R-16 | V9d′ | Worklet = Kern | Note in Originallage, Standardwerte: Worklet-Mitschnitt gegen `resynRender` M-MEL ≤ 0,3 dB; gegen Original ≤ M-BODEN + 0,5 dB | gleiches Modell, nur Rauschzufall verschieden |
| N9R-17 | V9d′ | Transponieren | Sax-Ton ±12 HT, FORMANT FEST an: M-TON Median ≤ 2 ct, P90 ≤ 5 ct; Schwerpunkt-Verschiebung ≤ 45 % der Transposition; aus: ≥ 70 %. Melodie D4…D3 aus einem Ton: jede Note ≤ 2 ct | gemessen ≤ 0,3 / 0,45 ct; 21–31 % mit, 100 % ohne; Melodie ≤ 0,83 ct (Prototyp §5.1, §5.5) |
| N9R-18 | V9d′ | KÖRPER | ±12 HT bei fester Note: M-SP ändert sich ≥ ⅓ Okt in Richtung der Verschiebung (H-1); Löwe KÖRPER −12: Schwerpunkt ≥ ⅓ Okt tiefer | H-1; Vorschlag |
| N9R-19 | V9d′ | ZEIT | ×2 und ×0,5: Dauer ±1 %, M-TON ±2 ct; Löwe ×2 mit RAUHEIT: M-PULS ±20 % des Originals | Prototyp: Dauer exakt, ≤ 0,01 ct; Pulsrate ohne Echtzeit-Rauheit halbiert |
| N9R-20 | V9d′ | HALTEN | Sax-Ton, Halte-Bereich 1,0–2,0 s, Note 4 s: M-EINBRUCH ≤ 0,5 dB an jeder Naht, M-KLICK besteht; Vorschlag der Analyse liegt im stimmhaften Teil; Wort mit gleitender Tonhöhe: Hinweis erscheint, Einbruch ≤ 3 dB | gemessen parametrisch 0,0 dB bzw. 2,11 dB (Prototyp §5.3) |
| N9R-21 | V9d′ | EINSATZ | dekodiert gegen Original SNR ≥ 30 dB (8-Bit μ-law, UNBELEGT → messen); Übergang ohne M-KLICK/M-EINBRUCH; bei ±12 HT Länge = Erwartung ±1 Sample | Vorschlag |
| N9R-22 | V9d′ | Makros | H-1: HELLIGKEIT (M-SP ≥ ⅓ Okt), KÖRPER (N9R-18), ATEM (Rauschband ≥ 6 dB), ZEIT (M-AUS ×2/×½), RAUHEIT (Löwe qABCs: M-RAU 400–1600 Hz von 0 auf 100 % ≥ +0,15); H-3 Stetigkeit | Löwe qABCs gemessen +0,26 (Prototyp §4.3), mit 3 Bändern +0,27 (`rauheit-3band.out`); beim Tux-Paint-Löwen nur +0,13, weil schon das Rauschen rau ist — deshalb gilt für die Treue N9R-22b |
| N9R-22b | V9d′ | RAUHEIT-Treue | beide Löwen, ZEIT 1, RAUHEIT 100 %, Stufe 0: M-RAU in allen 4 Bändern ±0,15 vom Original (Kriterium aus `resyn-prototyp.md` §8) | 3 Bänder: qABCs −0,05/+0,05/+0,04/−0,02, Tux Paint +0,06/+0,01/0,00/+0,11; breitbandig: Tux Paint B4 +0,35 (`rauheit-3band.out`) |
| N9R-23 | V9d′ | CPU, Polyphonie | 8 Stimmen × 64 TT ≤ 12 % M-CPU (Xeon); **8 Stimmen × 64 TT gleichzeitig angeschlagen: M-BLOCK P99 ≤ 2 × Mittel und ≤ 18 %** (Xeon, je Block gemessen); Weichen der 3-Band-Rauheit mitgemessen; 9. Note stiehlt mit 5 ms Blende (M-KLICK); 128 TT ≤ 4 Stimmen; Begrenzer (Lastmaß = Blockspitze) Stufe 1 senkt die Last um ≥ 20 %, Stufe 2 begrenzt auf 4 Stimmen; Gespeichertes unverändert | Node 8 × 1,40 = 11,2 %; 64 → 32 TT −29 % (`stimme-cpu.zusammen.out`); Block: gleichphasig P99 39,3 % = 3,5 × Mittel, versetzt 16,1 % = 1,8 × Mittel (`r8/rev-resyn/stimme-cpu-spitze.out`) |
| N9R-24 | V9d′ | Legato | mono + Glide: neue Note bei gehaltener → kein neuer EINSATZ, Tonhöhe gleitet, M-EINBRUCH ≤ 1 dB | Vorschlag |
| N9R-25 | V9d′ | Regeln | RESYNTHESE als Pad-Quelle (PAD-R1, V1d-02); alle stetigen Regler Mod-Ziele (MOD-R1, V5d-01 = 100 %); `historyCheck()` = true (VL-R1) | Nachtrag EN-21, C.5 |
| N9R-26 | V9d′ | Platz, DoD | M-PLATZ für Blatt (3 Schritte + Aufnahme) und Editor in P1, P2, P3, L1, L2, W; Trefferflächen L4; Regression und DoD | §1.3, L6 |
| N9R-27 | V9e | FRIEREN, LEBENDIG | Sax-Ton bei 1,5 s, LEBENDIG 0: Pegelschwankung ≤ 0,05 dB; LEBENDIG 50 %: ≥ 0,3 dB und spektraler Fluss ≥ 0,8 × Original-Haltephase | gemessen ohne LEBENDIG 0,02 dB, Fluss 0,31 gegen 0,40 (Prototyp §5.3); Werte UNBELEGT |
| N9R-28 | V9e | POSITION | Fahrt 0 → Ende in 2 s: Schwerpunkt-Verlauf korreliert mit dem des Originals (r ≥ 0,9); kein M-KLICK; M-HÜLL zum eingefrorenen Rahmen ≤ 4 dB (Sax) | gemessen 3,15 (Prototyp §5.3) |
| N9R-29 | V9e | VERWANDELN MISCHEN | Sax ↔ Löwe, α = 0 / ¼ / ½ / ¾ / 1: M-HÜLL zu A streng steigend, zu B streng fallend, Schwerpunkt monoton; α = 0 bzw. 1: M-MEL zum Einzel-Nachbau ≤ 0,3 dB; 2-s-Durchfahrt ohne M-KLICK und M-EINBRUCH | gemessen 0 → 63 / 63 → 0, 730 → 435 Hz (Prototyp §5.4) |
| N9R-30 | V9e | SPRECHEN | SÄGE mit Satz als B, Akkord C-E-G: M-HÜLL zu B kleiner als zu SÄGE ohne B; Schwerpunkt-Verlauf r ≥ 0,8 mit B; 3 Stimmen ≤ 5 % M-CPU | Vorschlag; CPU aus §4.1 |
| N9R-31 | V9e | TEILTÖNE | Sax-Ton TON 64 → 32: M-MEL +≤ 0,1 dB; ab 16 Hinweis „hörbar einfacher“; Last sinkt | gemessen 0,8 → 0,8 → 1,7 (Prototyp §4.2) |
| N9R-32 | V9e | → KLANGKÖRPER | aus Sax-Ton: `body`-Klang ≤ 48 TT, f₀ ±5 ct, Teiltonpegel (Halteteil) ±1,5 dB für n ≤ 16, A/B ±0,5 LU, ein Undo; Rundlauf KLANGKÖRPER → Render → Analyse → KLANGKÖRPER: Startpegel ±1,5 dB, Abklingzeiten ±20 %, B ±20 % | V9c-01 |
| N9R-33 | V9e | Malen/Radieren | Rechteck TT 5–10 × 0,5–1,0 s radiert → Goertzel-Pegel dort ≤ −40 dB relativ; außerhalb M-MEL-Änderung ≤ 0,1 dB; Filter GERADE radieren → gerade Harmonische ≤ −40 dB; ein Strich = ein Undo; `rid` bleibt, `ed` wächst | Vorschlag |
| N9R-34 | V9e | Größe mit B | Klang mit B ≤ 60 KB; `ed` mit 100 Strichen ≤ 4 KB | §4.2 |
| N9R-35 | V9e | *(P1)* → TABELLE | 32 Balken = Harmonische 1–32 an POSITION ±0,5 dB | Vorschlag |
| N9R-36 | V9e | Werks-Klänge | 4 Klänge (3 ohne Löwe, falls N9R-38 nicht besteht) mit `src` (URL, Lizenz, Urheber), ⓘ mit Namensnennung bei CC BY; zusammen ≤ 60 KB; Ampel grün oder gelb; Lizenz-Protokoll in CHANGES | §6 |
| N9R-37 | V9e | Platz, DoD | M-PLATZ der TIEFE-Seiten und des XY-Streifens in allen Größen; Regression und DoD | §1.3 |
| N9R-38 | V9e (vor N9R-36 und vor einer Zusage für Tiergeräusche) | Löwe: Aufnahmen und Hörtest | a) ≥ 2 unkomprimierte, dokumentierte Löwen-Aufnahmen (≥ 44,1 kHz WAV/FLAC, CC0/CC BY, volles Brüllen, Lizenzseite gelesen; besser zusätzlich Xanders Zoo-Aufnahme) im Korpus, N9R-02/-13/-13b/-22b darauf neu gemessen; b) Hörtest MUSHRA-light: ≥ 5 Hörer, je Klang Original als versteckte Referenz, Nachbau, Rauschvocoder-Anker; bestanden, wenn der Nachbau im Median ≥ 60/100 liegt und im Median ≥ 15 Punkte über dem Anker | Vorschlag; Verfahren nach ITU-R BS.1534 (MUSHRA) in vereinfachter Form — UNBELEGT (Norm in dieser Sitzung nicht gelesen); „15 Punkte“ als „deutlich“ Vorschlag |
| N9R-39 | V9d (a), V9d′ (b) | Geräte-Messung über die Test-API auf der githack-Seite, Referenzgerät benannt | a) M-ANA: 8-s-Löwe AUTO ≤ 2,5 s je s Audio, sonst Vorauswahl statt AUTO (§4.3); 8-s-Grenzfall ohne Absturz; b) OfflineAudioContext mit dem Worklet-Modul: 10 s, 8 Stimmen × 64 TT, Wandzeit ÷ Audiodauer ≤ 25 %, sonst Standard-Polyphonie 4 | Vorschlag; Faktor iPhone/Xeon 2–2,5 UNBELEGT (Spec §15.1) |
| N9R-40 | V9d | Testkorpus im Repo | `tests/fixtures/resyn/*.wav` mit SHA-256, `QUELLEN.md` (URL, Urheber, Lizenz, Lizenzlink, Änderungen) und GPL-Texten — oder Ladeskript mit Hash-Prüfung; Test bricht ab, wenn ein Hash abweicht; keine Testdatei in `index.html` | §8.0 |

---

## 9. Abhängigkeiten und Platz in der Bau-Reihenfolge

### 9.1 Abhängigkeiten

```
V9b ── V9d (Kern, Analyse, Blatt) ── V9d′ (Engine, Editor) ── V9e (Formen, Verwandeln, Werks-Klänge)
         ▲ weich: VS1 (🎤)            ▲ V1d (PAD-R1), V5d (MOD-R1),    ▲ (P1) V9a (→ TABELLE)
         ▲ VO1: Projekt-Text            VC2a (VL-R1)
V10a (Engine-Filter „Alle Resynthese“) und V10b (Presets aller Engines) kommen danach.
V9c entfällt (geht in V9d/V9e auf).
```
- **V9b** liefert die Sinusbank und Begrenzer-Stufe 1. V9b braucht V8a **nicht**: Nur V9a nennt den Tabellen-Oszillator als Berührungspunkt, V9b nicht (Spec §17 V9a/V9b); die Kette V8a–V9c in §17.0 ist Reihenfolge, keine Abhängigkeit. WAHRSCHEINLICH.
- **VS1** ist eine weiche Abhängigkeit: Ohne VS1 baut V9d nur DATEI und APP-KLANG; VS1 bekommt dann den Abnahmepunkt „🎤 im Blatt KLANG EINFANGEN“ (N9R-11 wandert mit). Vorschlag.

### 9.2 Gruppen (ändert Nachtrag C.1, C.3, C.4)

| # | Gruppe | Pakete | Dauer |
|---|---|---|---|
| 10 | **V8V9** | V8a, V8b, V9a, V9b (V9c entfällt) | ≈ 17–18 h |
| 10b | **RS** (neu) | V9d, V9d′, V9e | ≈ 14–16 h |
| 11 | V10 | V10a–V10e | unverändert |

**C.3 (Ausschnitt):** `├─ V8a ─ V8b ─ V9a ─ V9b ─ V9d ─ V9d′ ─ V9e` · `V10b (V4, V8, V9, RS)`.

**C.4 (Zeilen):**

| Paket | Version | Budget KB | Dauer h |
|---|---|---|---|
| V9c | entfällt | (−30) | (−4) |
| V9d | 4.32.0 | 65 | 5 |
| V9d′ | 4.33.0 | 35 | 4–5 |
| V9e | 4.34.0 | 45 + ≤ 60 Daten | 5–6 |
| V10a / V10b / V10c / V10d | 4.35.0 / 4.36.0 / 4.37.0 / 4.38.0 | unverändert | unverändert |
| V10e | 5.0.0 (bleibt) | | |

Summe: +175 KB, +10–12 h reine Bauzeit (§4.4).

### 9.3 Option: früher bauen

Will Xander die Resynthese früher hören, kann der Block **V9b + RS** direkt nach Gruppe V5 gebaut werden (nach V5d gelten MOD-R1 und PAD-R1 ohnehin). Kosten: V9a und V8 kommen später; V10b wartet ohnehin auf alle Engines. Keine Abhängigkeit spricht dagegen (V9b braucht nur V0/V1d-Stand). WAHRSCHEINLICH (aus §17 und C.3).

---

## 10. Test-API (ergänzt §16 und Teil D)

```ts
// V9d
resynAnalyze(src: {pcm?: Float32Array, sr?: number, file?: ArrayBuffer, track?: number, note?: number},
             o?: {mode?: 'auto'|'ton'|'frei', n?: 32|64|128, maxKB?: number, einsatz?: boolean, rauheit?: 'auto'|boolean, seed?: number})
  : Promise<{resyn: Resyn, q: {mode: 'ton'|'frei', mel: number, melTon: number|null, melFrei: number|null, boden: number,
             ampel: 'gruen'|'gelb'|'rot', stufen: string[], kb: number}, ms: number}>
resynRender(resyn: Resyn, o?: {note?: number, vel?: number, dur?: number, rs?: Partial<Rs>, seed?: number}): Promise<Float32Array>  // Kern offline, 48 kHz
resynSheet(): null | {step: 1|2|3, busy: boolean, progress: number, mic: boolean}
resynSource(kind: 'datei'|'app'|'mikro', arg?: ArrayBuffer | {track: number, note?: number}): Promise<void>
__noWorker(on: boolean): void                       // Rückfall „Scheiben auf dem Hauptthread“ erzwingen
// V9d′
resynTake(t: number): void                          // [ÜBERNEHMEN] auf Spur t (ein Undo)
setRs(t: number, key: keyof Rs, value: number|string|boolean): void
resynInfo(t: number): {voices: number, n: number, stage: 0|1|2|3, root: number, mode: 'ton'|'frei', kb: number, rid: string}
// V9e
resynEdit(t: number, op: {op: 'erase'|'gain'|'set', t0: number, t1: number, k0?: number, k1?: number, f0?: number, f1?: number, db?: number, filt?: 'ung'|'ger'}): void
resynSetB(t: number, b: Resyn | null): void
resynSaege(t: number): void                         // A = Grundklang SÄGE (gen: 'saege'), ein Undo
resynToBody(t: number): void                        // → KLANGKÖRPER (neuer Klang, ein Undo)
resynToTable(t: number): void                       // (P1) → TABELLE
```
`runtime()` ergänzt `resyn: {voices, stage}`. Rückgaben sind tiefe Kopien (`data` als dieselbe Zeichenkette).

---

## 11. Risiken

| # | Risiko | Wirkung | Gegenmittel |
|---|---|---|---|
| R1 | CPU am iPhone (Faktor 2–2,5 unbelegt; Safari-JIT; Wärme) | Aussetzer bei 8 Stimmen | Begrenzer Stufen 1–2, M-CPU in N9R-23, iPhone-Prüfpunkt |
| R2 | Analysezeit am iPhone | Warten > 5 s | Worker, Fortschritt, [Abbrechen]; FFT-YIN und Auffüllung 2 (gemessen −73 %) |
| R3 | Worker im Claude-Viewer gesperrt | Analyse blockiert | Rückfall in Scheiben (N9R-09) |
| R4 | `decodeAudioData`-Formate auf iOS | Datei unlesbar | klare Meldung; Tipp „als m4a/wav sichern“ |
| R5 | Online-Volumen durch Fassungen | Quote voll | Größen-Begrenzer; Dedupe-Vorschlag an VO (D6); ≤ 8 Klänge je Projekt |
| R6 | Lizenz der Löwen-Quelle nur aus Suchauszug | Rechtsrisiko | Prüfprotokoll beim Bau (§6.3); eigene Aufnahme bevorzugen |
| R6b | Löwe nicht überzeugend gezeigt (Testclips 52–78 kbit/s Vorbis, Ursprung unbekannt, kein Hörtest) | Zusage nicht haltbar | keine Zusage für Tiergeräusche; N9R-38 vor Werks-Löwe |
| R7 | Maße ≠ Hören (kein Hörtest; Mel-Maße und M-BODEN unterscheiden Rauschvocoder und Nachbau bei Löwe und Sprache nicht) | gute Zahlen, mäßiger Klang | Ampel mit M-PER/M-RAU/M-PULS und Anker-Selbsttest (N9R-13b); Hörtest N9R-38; iPhone-Prüfpunkte je Paket |
| R8 | Halten über gleitender Tonhöhe pumpt (gemessen 2,11 dB) | hörbarer Einbruch | Halte-Vorschlag im stabilen Teil, Hinweis |
| R9 | Abwärts-Transponieren verliert die oberste Oktave (gemessen) | dumpfer | ⓘ-Hinweis; Ergänzen später (§18) |
| R10 | Dateigröße mit VO + VS ≈ 3,99 MB | Grenze 4,0 MB | Entscheidung D5 |
| R11 | githack: geteilte Herkunft | fremde Seiten lesen Originale | Originale dort nur für die Sitzung (N9R-15) |
| R12 | Arbeitsspeicher der Analyse (heute +65–96 MB bei 8 s) | WKWebView beendet die Seite | M-SPEICHER ≤ 64 MB, Streaming-STFT, Spuren begrenzen, Modi nacheinander (N9R-09) |
| R13 | CPU-Spitze im IFFT-Block bei gleichphasigen Stimmen | Knackser trotz 11 % Mittel | Hop-Versatz (§3.5), M-BLOCK in N9R-23, Lastmaß Blockspitze |

---

## 12. Entscheidungen und Fragen

### 12.1 Für den Orchestrator

| # | Entscheidung | Vorschlag |
|---|---|---|
| D1 | E8 (neu) wie §1.1 | annehmen |
| D2 | V9c entfällt, Abnahme wandert nach N9R | annehmen |
| D3 | Gruppe RS nach V8V9 (oder Block V9b + RS nach V5, §9.3) | nach V8V9; vorziehen nur auf Xanders Wunsch |
| D4 | Original-EINSATZ (≤ 4 × 60 ms) ist hier erlaubt, nicht §18 | annehmen |
| D5 | Dateigrenze: EN-17 auf 4,5 MB, oder Kern komprimieren, oder nur 2 Werks-Klänge | EN-17 auf 4,5 MB; Startzeit bleibt der Wächter |
| D6 | Analysen online je `rid` einmal speichern (an das VO-Paket) | annehmen, sonst ≤ 8 Klänge je Projekt |

### 12.2 An Xander (nicht blockierend; der Bau nimmt die Vorgabe)

| # | Frage | Vorgabe |
|---|---|---|
| F1 | Löwe: Nimmst du im Zoo selbst einen auf (Sprachmemo reicht), oder nehmen wir eine freie Aufnahme? | freie Aufnahme (§6.1), deine ersetzt sie |
| F2 | Soll die sprechende Fläche mit deiner Stimme sprechen (ein Satz, 2–3 s)? | freie Stimme (Thorsten-Voice, CC0) |
| F3 | Reichen 8 Sekunden je Klang? | ja |

---

## 13. Messdateien dieser Runde

Alle unter `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/v3-ideen/r8/resyn-pakete/` (Node 22, Xeon 2,1 GHz, VM-Last 1,4–6,7; der Prototyp-Code in `../resyn-proto/src/` wurde nur gelesen, Kopien sind gekennzeichnet):
- `stimme-cpu.mjs` → `stimme-cpu.out`, `stimme-cpu.lauf1-3.out`, `stimme-cpu.zusammen.out` — CPU je Stimme (Bank, Formant, FFT-Rauschen, Bandpass-Vergleich, Rauheit).
- `speicher-fps.mjs` → `speicher-fps.out`, `speicher-fps.json` — Rahmenraten 100/50/25, Zufallsboden je Aufnahme.
- `speicher2.mjs` (Kopie von `storageTest` mit getrennten Raten), `speicher-mix.mjs` → `speicher-mix.out`, `speicher-stufen.mjs` → `speicher-stufen.out` — Größen-Begrenzer.
- `analyse-zeit.mjs` → `analyse-zeit.out` (Zerlegung, Auffüllung 2 gegen 4), `yin-fft.mjs`, `model-fy.mjs` (Kopie von `model.mjs` mit FFT-YIN), `analyse-zeit2.mjs` → `analyse-zeit2.out` (abwechselnd gemessen, Ergebnisgleichheit).
- `auto-kosten.mjs` → `auto-kosten.out` — AUTO-Wahl, Ampel, Kosten.
- `f0-bereich.mjs` → `f0-bereich.out` — fester bzw. zweistufiger f₀-Suchbereich gegen die Hand-Bereiche des Prototyps.
- `json-push.mjs` → `json-push.out` — JSON-Kosten eingebetteter Analysen.
- `ampel-neu.mjs` → `ampel-neu.out` — neue AUTO-Regel und Ampel auf dem gespielten Render, Anker-Selbsttest (Nacharbeit Review).
- `rauheit-3band.mjs` → `rauheit-3band.out` — Rauheit breitbandig gegen 3 Bänder (Löwen), Speicher je Hüllkurve (Nacharbeit Review).
- Review-Messungen unter `../rev-resyn/`: `anker-ampel.mjs/.out` (Rauschvocoder gegen alte Ampel), `stimme-cpu-spitze.mjs/.out` (Blockzeit je Block), `ana-speicher.mjs/.out` (8-s-Analyse: Zeit, Speicher), `auto-kosten.rerun.out` (Wiederholung), `dl-cr/` (Debian-copyright qABCs, Tux Paint), `dl-cc/by40.html` (CC BY 4.0 Legal Code).
- `dl-lizenz/` — gelesene Lizenz- und Kompatibilitätsdateien (Weresax-LICENSE, Thorsten-LICENSE/README, Salamander-README, tonejs-Quellenliste, BCD-JSON).

**Grenzen:** kein Worklet im Browser, kein iPhone, kein Hörtest; nur 7 kurze Aufnahmen; Last auf der VM schwankt (Kalibrier-Faktor bis 1,5).

---

## Quellen

**Lokal (gelesen):** `v3-ideen/dirigent-spec-v3.md` (§0.2–0.6, §11, §13–18) · `v3-ideen/dirigent-spec-v3-nachtrag-1.md` (N0.3, N0.5, A.11, A.13, C, VS) · `v3-ideen/fragen-xander-9.md` · `v3-ideen/fragen-xander-5.md` (H8) · `v3-ideen/r8/resynthese-recherche.md` · `v3-ideen/r8/resyn-prototyp.md` mit `r8/resyn-proto/out/tabellen.md`, `speicher.json`, `baender.json`, `bearbeitung/bearbeitung.json` · `v3-ideen/r8/bench/osc-bench.out`, `analyse-bench.out`, `speicher-bench.out` · `v3-ideen/r7/stimme.md` · `v3-ideen/r7/online.md` · `v3-ideen/SYNQUENZER-MASTER-BRIEFING.md` §9.3 (N1 KLANG-SCAN) · `v3-ideen/SYNQUENZER-vision.md` (E8 alt) · `v3-ideen/r8/V0a-copy.html` (Datei-Eingaben, OfflineAudioContext; kein Worker, kein `decodeAudioData`).

**Direkt gelesen (BELEGT):**
- Weresax-Lizenz CC0: https://raw.githubusercontent.com/sfzinstruments/karoryfer.weresax/master/LICENSE (Repo https://github.com/sfzinstruments/karoryfer.weresax)
- Salamander Grand Piano, CC BY 3.0: https://github.com/sfzinstruments/SalamanderGrandPiano (README)
- Thorsten-Voice, CC0: https://raw.githubusercontent.com/thorstenMueller/Thorsten-Voice/master/LICENSE, README https://github.com/thorstenMueller/Thorsten-Voice
- tonejs-instruments Quellenliste: https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/sample-source-info.txt
- CC BY 4.0 Legal Code, Abschnitt 3(a)(1): https://creativecommons.org/licenses/by/4.0/legalcode.en (gelesen über https://raw.githubusercontent.com/creativecommons/cc-legal-tools-data/main/docs/licenses/by/4.0/legalcode.en.html)
- Debian-copyright qABCs (GPL-3+) und Tux Paint Stamps (GPL-2): https://changelogs.ubuntu.com/changelogs/pool/universe/q/qabcs/qabcs_1.0.2-6build2/copyright · https://changelogs.ubuntu.com/changelogs/pool/universe/t/tuxpaint-stamps/tuxpaint-stamps_2022.06.04-1/copyright
- MDN-Kompatibilitätsdaten: https://github.com/mdn/browser-compat-data/blob/main/api/CompressionStream.json · …/api/DecompressionStream.json · …/api/BaseAudioContext.json · …/api/Worker.json

**Suchauszüge (BELEGT (SE) bzw. WAHRSCHEINLICH):**
- Iowa MIS: https://theremin.music.uiowa.edu/MIS.html · https://theremin.music.uiowa.edu/MIS-Pitches-2012/MISEbAltoSaxophone2012.html
- Freesound: https://freesound.org/people/qubodup/sounds/212764/ · https://freesound.org/people/Bidone/sounds/69572/ · https://freesound.org/people/felix.blume/sounds/405211/ (Lizenz laut https://openlab.bmcc.cuny.edu/mmp-100-fall-2023/?p=1393)
- Thorsten-Voice-Datensatz: https://doi.org/10.5281/zenodo.5525342 · https://datacollective.mozillafoundation.org/datasets/cmm2fwi490024nt0779vv9o0d
- Common Voice DE (Nutzungsgrenzen): https://datacollective.mozillafoundation.org/datasets/cmn4rsdh6009unz07jdn2ol9p
- Löwengebrüll 40–200 Hz (Klemuk, Riede, Walsh, Titze 2011): https://www.sciencedaily.com/releases/2011/11/111102190012.htm · Studie https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3206895/ (nicht abrufbar, Proxy 403)
- Weresax „royalty free“: https://www.kvraudio.com/product/weresax-by-karoryfer
- EuGH C-476/17: https://curia.europa.eu/jcms/jcms/p1_2278254/de · https://op.europa.eu/en/publication-detail/-/publication/7e88dcb7-ddd2-11e9-9c4e-01aa75ed71a1/language-de · https://www.pinsentmasons.com/de-de/out-law/nachrichten/copyright-controls-over-sound-samples-clarified
- Verfahren und Vorbilder (über R8-Recherche/Prototyp): McAulay/Quatieri https://www.ll.mit.edu/r-d/publications/speech-analysissynthesis-based-sinusoidal-representation · SMS https://audiolabs-erlangen.de/content/05_fau/professor/00_mueller/02_teaching/2024s_sarntal/02_group_SYNTH/1990_SerraS_SpectralModelingSynthesis_CMJ.pdf · sms-tools https://github.com/MTG/sms-tools/blob/master/smstools/models/utilFunctions.py · YIN https://cagnazzo.wp.imt.fr/files/2013/05/2002_JASA_YIN.pdf · Röbel & Rodet https://dafx.de/paper-archive/details/EDSTSaO17Gd_0LV03iwDfw · Synclavier https://www.synclavier.com/Downloads/Resynthesis-Quickstart.pdf · Alchemy https://support.apple.com/ar-qa/guide/logicpro/lgsi440c233a/mac, https://www.apple.com/logic-pro/resources/docs/elemental_morphing_in_alchemy_0818.pdf · Loris https://www.cerlsoundgroup.org/Loris, https://muse.jhu.edu/article/47855/pdf · SPEAR https://www.klingbeil.com/spear/ · Iris 2 https://www.soundonsound.com/reviews/izotope-iris-2 · SDIF https://support.ircam.fr/docs/om/archive/om6.5-manual/co/SDIF-Intro.html · Kubichek https://ieeexplore.ieee.org/document/407206 · Gray & Markel https://doi.org/10.1109/TASSP.1976.1162849 · Periodogramm https://arxiv.org/pdf/astro-ph/0307420 · WebKit https://bugs.webkit.org/show_bug.cgi?id=226240, https://bugs.webkit.org/show_bug.cgi?id=255461

---

## Anhang R8-Review: geprüft, übernommen, geändert, verworfen

Alle 7 Befunde des Reviews wurden nachgeprüft (Messdateien unter `r8/rev-resyn/`, eigene Nachmessungen `resyn-pakete/ampel-neu.out`, `rauheit-3band.out`) und **im Kern übernommen**. Abweichungen vom vorgeschlagenen Fix:

| Befund | Teil | Entscheidung | Grund |
|---|---|---|---|
| 1 Ampel/Anker (blocking) | Regel „grün/gelb nur, wenn alle Bedingungen gelten“ | **geändert:** verfehlte Zusatzbedingung → höchstens gelb (nicht rot) | So erfüllt der Anker den geforderten Selbsttest „höchstens GELB“ und ein guter, nur glatterer Nachbau wird nicht rot. Gemessen: Anker Löwen/Sprache gelb, Sax/Klavier rot (`ampel-neu.out`). |
| 1 | Erwartung „Löwe Tux Paint grün“ in N9R-02/-13 | **geändert:** grün erst mit 3-Band-Rauheit | Mit der breitbandigen Rauheit verfehlt der Nachbau selbst M-RAU (B4 +0,35) und wäre gelb (`ampel-neu.out`). |
| 2 CPU-Spitze | N9R-23 „P99 ≤ 1,5 × Mittel“ | **verworfen, ersetzt durch ≤ 2 × Mittel** (und ≤ 18 % bleibt) | Die Review-Messung selbst gibt mit versetzten Hop-Phasen P99 16,1 % bei Mittel 9,0 % = 1,8 × (`stimme-cpu-spitze.out`); 1,5 × würde auch die richtige Lösung durchfallen lassen. Gleichphasig 3,5 × wird sicher erkannt. |
| 3 Löwe | „f₀-Median ~31 Hz … unter 40–200 Hz“ | **eingeschränkt** | Gilt nur für den qABCs-Löwen; der Tux-Paint-Löwe hat ≈ 48 Hz (`resyn-proto/out/tabellen.md`) und liegt im Bereich. Der Bereich 40–200 Hz ist nur über Presseauszug belegt (BELEGT (SE), ScienceDaily); PMC war nicht abrufbar. |
| 3 | Fix (3) „3 Bänder **oder** Tiefe je Band begrenzen“ | **beides:** 3 Bänder als Standard (gemessen wirksam), Tiefenbegrenzung als Begrenzer-Stufe C′ (UNBELEGT) | 3 Bänder kosten ≈ 3,1–3,2 KB/s statt 0,9 KB/s (Review-Schätzung je Band 0,9 KB/s passt: ≈ 1,0–1,1 KB/s je Band); im 8-s-Fall braucht es deshalb eine billigere Stufe. |
| 3 | Hörtest „deutlich über dem Anker“ | **präzisiert:** Median ≥ 15 Punkte über dem Anker | Schwelle Vorschlag; MUSHRA-Norm in dieser Sitzung nicht gelesen (UNBELEGT). |
| 4 Gerät | Vorauswahl „stimmhaft < 50 % → nur FREI“ als Rückfall | **übernommen und erweitert:** die Regel gilt jetzt immer (Befund 6); Rückfall am Gerät zusätzlich „sonst nur TON“, Ampel nach [ÜBERNEHMEN] | Ohne Erweiterung bliebe der stimmhafte 8-s-Fall (Sax ×2) ohne Rückfall. |
| 5 Speicher | „M-SPEICHER ≤ 64 MB, Node `maxRSS`“ | **geändert:** Zuwachs (maxRSS nach − RSS vor) ≤ 64 MB | Node startet schon mit ≈ 66 MB RSS (`ana-speicher.out`, „vorher RSS 66 MB“); absolutes maxRSS ≤ 64 MB wäre nie erfüllbar. |
| 6 AUTO | — | übernommen | Nachgemessen: 2,27 ≤ 2,13 + 0,15 = 2,28 (identisch im Wiederholungslauf). |
| 7 Korpus | Sax-Test auf Weresax-WAV | übernommen mit Übergang | Schwellen N9R-01/-04/-17 stammen vom MP3; sie werden beim Bau auf der WAV neu gemessen. |

