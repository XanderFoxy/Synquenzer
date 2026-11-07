# MX2 – Mix & Master 2 (Arbeitskopie w4480/mx2, Basis 4.47.0)

## Für Xander

- **[MIX] oben in der Kopfleiste** (links neben ≡; auf schmalen iPhones unter ≡ › Mix) öffnet „Mix & Master“ mit drei Wegen: **Mischen**, **Mastern**, **Mischen + Mastern**.
- **Einmal messen, dann sofort schalten:** Die App hört den Song einmal durch. Danach rechnen Stil, Ziel (−14 / −9) und die Regler **Transparenz ↔ Druck** und **Wärme ↔ Glanz** sofort neu, ohne neu zu rendern. Feste Grenzen: True-Peak ≤ −1 dBTP, Klang je Band ±3 dB, kein Pumpen. Ändert sich der Song, steht dort „neu messen“.
- **Abhören im Blatt:** oben ▶/■ und **A** (vorher) / **B** (nachher), auch während der Song läuft. Beim Vergleich ist es pegelgleich: der lautere Weg wird leiser. Nach dem Schließen hörst du wieder die volle Lautheit. Mit ⌄ legst du das Blatt unten ab.
- **Sehen:** Lautheit, True-Peak, Spektrum vorher/nachher, Master-EQ, Kompression je Band (live beim Abspielen) und eine Liste „Warum“ (z. B. „Höhen +2,5 dB – der Song hat dort −22 dB Anteil, Ziel −15,5 dB“).
- **Neun Stile** (nur Stil-Beschreibungen, keine Namen): Euro-Disco 80er (hell & straff), Hi-NRG (laut & glänzend), Synth-Pop weit (weit & dunkel), Italo (warm), Modern (klar) und die vier bisherigen (Synth-Pop, Disco, House, Sanft).
- **Seitenkette Kick → Bass** (an/aus, Menge, Release; „Empfohlen“, wenn sich die beiden überdecken), **Feinschliff je Spur** (Fläche: weicher / Atmosphäre · Bass: schärfen / Druck · Sequenz/Lead: herausstellen / einbetten), **Tiefenstaffelung**, jeweils ein Schritt mit ↶. **EQ · KOMP** jeder Spur zeigt jetzt das Spektrum vor und nach dem EQ (live), die Kennlinie, die Gain-Reduction und den Vorschlag des Assistenten als gestrichelte Kurve.

## Technik (alles mit Kürzel `MX2`)

- **JS-Block** `MX2 BEGIN … MX2 END` direkt nach `MX1 END`; **CSS-Block** `MX2 BEGIN/END` direkt nach dem MX1-CSS; Kopfleiste: `<button id="bMx2">` vor `#bMenu`.
- **Kern** `mx2DspMake(D, M1)` (DOM-frei, Worker und Hauptfaden):
  - `feat` liefert Merkmale je 5 ms: 3 Bänder wie MB3 (LR4 150 Hz / 3 kHz) mit Leistung und K-Energie, außerdem Gesamt-Leistung, K-Energie, Spitze und ein Terz-Spektrum (FFT).
  - `sim` ist eine Rahmen-Simulation der Master-Kette (MB3 → Sättigung → Shelves → Bus-Kompressor → Pegel → Limiter).
  - `fit` passt Stil, Vorlieben und Ziel in festen Grenzen an (etwa 15 ms).
  - `exact` prüft im Worker am echten Signal mit `M1.pre` + `D.amSim` nach (Pegel aufs Ziel, True-Peak).
  - `eqDb` liefert die Kurve für die Anzeige.
- **Worker:** Die Aufträge `mx2feat`, `mx2exact` und `mx2drop` laufen über den MIX-A-Worker. Das Song-Signal bleibt nur, solange das Blatt offen ist. Danach gibt es weiter sofortige Schätzungen.
- **Worklet:**
  - Prozessor `synq-mx2-ka` misst im Messdurchlauf die Lautheit des bisherigen Master-Wegs (für pegelgleiches A/B).
  - `mx2Mt` meldet die Gain-Reduction der Mix-Knoten (nur auf Wunsch, `{mt: 1}`).
- **Einhänge-Zeilen** (je Kommentar `MX2`): `SynqMixa` (onmessage `mt`, process → `mx2Mt`), `mixaModSrc` + `mx2ModSrc()`, `mixaNormAm` + `...mx2NormAmX(a)`, `mixaAbSet` (Faktor `mx2Trim()`, offline immer 1), `mixaTapBuild` + `mx2TapBuild(off)`, `mixaJob` (erste Zeile `mx2*` → `mx2Job`), `mixaWorker` + `mx2WorkerSrc()`, `mx1EqSheet` (+ `mx2EqAdd`, onClose `mx2EqEnd`), `mx1EqCurve` (+ `mx2EqUpd`), Menü (`mx2MenuRow` nach `gr1MenuRow`), API `Object.assign(SYNQUENZER, MX2_API)` am Ende der Liste.
- **Daten:** Nur `fxBus.am.mx2 = {pf, d, w}` kommt dazu (fehlt = nichts). Undo: die Art `'mixa'` (eine Stil-Folge im selben Blatt ergibt einen Schritt). Feinschliff mit Release/Drive wird als `'group'` aus `mixa` + `sound` gespeichert. Es gibt keine neue Undo-Art.

## Tests

- **`mx2-test.mjs`** (Aufruf `node mx2-test.mjs <index.html> <ordner>`): **34/34 OK**. Die Ergebnisse stehen in `mx2-test-ergebnis.json`.
  - **Schätzung gegen echte Kette:** Pegel ±0,12 dB, 450 Anpassungen alle in den Grenzen.
  - **Messen und Umschalten:** EIN Durchlauf misst, danach 4 Stile ohne Render (≈ 15–20 ms je Wechsel) und Vorlieben ohne Render.
  - **Render:** −14 ergibt −13,99 LUFS bei −1,50 dBTP. Hi-NRG −9 mit vollem Druck und Glanz ergibt −9,05 LUFS bei −1,49 dBTP, die Band-Kompression liegt im Schnitt bei ≤ 2,5 dB.
  - **A/B während der Wiedergabe:** pegelgleich (−1,94 dB am lauteren Weg). Live-Meter vorhanden. Im Render ist der Angleich nie aktiv. Mischen + Mastern braucht 2 Durchläufe, danach A = vorher und B = nachher.
  - **Seitenkette:** messbar (der Bass taucht an den Kicks um ≤ −3 dB ab, der Median bleibt bei 0 dB).
  - **Feinschliff:** ↶/↷ und Grenzen geprüft.
  - **Speichern/Laden:** geprüft.
  - **Oberfläche:** hochkant 428×926, quer 926×428 / 926×370, alle Tasten ≥ 44 px, ✕ im Kopf immer sichtbar. Hochkant 390: [MIX] im Menü. Kanalzug quer passt.
- **Pflichtprüfungen:** topdefs 0 doppelt / 0 Syntaxfehler, dupkeys 0, smoke `errors []`, Markenwörter 0, „MS 2000“ 1×, `  live: true,` 1×.
- **MX1-Test** auf dieser Kopie: 28/30, genau wie auf der unveränderten Basis (die zwei Fehlpunkte sind das bekannte Popup-✕ 36 px aus 4.46).
- **Fotos:** `mx2-p-blatt.png`, `mx2-p-blatt2.png` (Warum, Seitenkette, Feinschliff), `mx2-p-kanalzug.png` (hochkant), `mx2-l-blatt.png` (quer).

## Offen / Risiken

- **Kopfleiste hochkant:** [MIX] ist 40 px breit, die TAKT-Anzeige wird bei 428 px um 2 px schmaler (74 statt 76). Unter 420 px Breite steht [MIX] nur im Menü. UI1/GR2 bauen evtl. ebenfalls globale Knöpfe – beim Zusammenführen auf einen Knopf einigen (`mx2Sheet()` ist der Einstieg).
- **Nicht auf dem iPhone gemessen:** Mess-Dauer, Speicher (Song-Signal im Worker, solange das Blatt offen ist: ~70 MB bei 3 min) und CPU der Live-Analyzer. Im Test (Chromium, CPU-Grafik) dauerte das Messen ≈ 8–10 s für 8 Takte.
- **Mischen** nutzt die Vorschläge des Mix-Assistenten (ohne „Option“) plus die Pegel-Balance des Stils (±1,5 dB). Eine eigene Stil-Logik je Spur (z. B. EQ-Kurven je Handschrift) ist noch nicht drin.
- **Pegelgleich:** Bei „nur Mischen“ ohne Master wird für den Angleich die Weiche hinter dem Master angelegt (Gewinn 1 = bitgleich). Der Vergleich beginnt erst mit dem ersten Tipp auf A oder B.
- **Kanalzug quer:** Die Kennlinie gibt es nur hochkant; quer steht das Gain-Reduction-Meter in der Zeile „Kompressor“.
- **Release-Feinschliff:** wirkt nur bei VA, Wavetable und FM (Parameter `aR`). Bei den anderen Klangerzeugern ändern „weicher/Atmosphäre“ nur Höhen und Hall.
- **Offline-Render:** Er ist schon in der Basis nicht bitgleich wiederholbar (Analog-Zufall, Differenz 0,35 zwischen zwei Renders ohne Änderung). Geprüft wurde deshalb, dass MX2 offline nichts ändert (Weiche immer 1).
