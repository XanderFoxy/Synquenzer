# SPK12 – Werkzeugkasten Auswahl (Spektral) · Teil 1/3 (Plan-Schritte 1–3)

Bau: `python3 bau.py` = `basis.html` (Kandidat 4.68.0, unverändert) + `spk12-block.js` direkt nach `/* SPK11-END */`
+ 16 Haken-Zeilen „SPK12“ (je eine **neue** Zeile mit typeof-Schutz; keine vorhandene Zeile umgeschrieben).
VERSION unverändert 4.68.0. Ein Block `/* SPK12-BEGIN */ … /* SPK12-END */` (445 Zeilen).

## Haken-Liste (Anker → neue Zeile)
| # | Stelle | Zweck |
|---|---|---|
| 1 | Kern `selFn(d, sel)` 1. Zeile | `spk12SelFn(d, sel, selFn)` – nur wenn die Auswahl `op` −/∩, `inv` oder `wand` enthält, sonst null → alter Weg unverändert |
| 2 | Kern vor `return {on, stft, …, Z2}` | `spk12DspMake(Z2, {selFn, specInfo, specChunk, get, put})` → Ops `spk12zauber`, `spk12mask`, `spk12view` |
| 3 | `spk8WUrl(src, u)` 1. Zeile | `src += spk12SelFn + spk12Ras + spk12DspMake` (Text in den Spektral-Worker; Parameter, nicht die const-Zeile) |
| 4 | `spk1Build` nach spk2Pane | `spk12Pane` (Leiste Neu │ + │ − │ ∩ · Auswahl ▾ vorn in der Werkzeug-Optionsleiste; Toleranz/Grenze für Zauberstab; Halten auf Rechteck) |
| 5–6 | `spk1OvDraw` (nach 1. Zeile / nach `x.setLineDash([])`) | Ergebnis-Fläche aus dem Kern + Rand-Griffe |
| 7 | `spk1Gest` pointerdown | 2. Finger, während der 1. am Rand-Griff liegt → Weichheit (statt Zoom) |
| 8–11 | `spk1ToolDown/Move/Up` | Griff-Erkennung, Ziehen, Ende (ein ↶), Zauberstab-Tipp |
| 12 | `spk1SelDone` 1. Zeile | Kombinier-Modus ordnet die neue Form ein (+ / − / ∩) |
| 13 | `spk1ToolSet` Ende | Rechteck/Zauberstab-Platz, Hinweistext |
| 14 | `spk1UndoBtns` | ↶/↷ auch für Auswahl-Schritte freigeben |
| 15 | `spk1UndoRedo` | Auswahl-Schritt zuerst, solange danach keine Ebenen-Aktion kam |
| 16 | `spk1Tap` 1. Zeile | Knöpfe der neuen Leiste; Tipp nach Halten schlucken |

## Entscheidungen
- **Mengen-Rechnung (bit-genau):** Formen bekommen `op: 'sub' | 'and'` (ohne = dazu). Der Kern rechnet der Reihe nach in Uint8:
  dazu = max(a, b), ab = min(a, 255 − b), Schnitt = min(a, b), Umkehren = 255 − w, nur Frequenzen = im Zeitbereich 255 − w, sonst 0.
  Aufeinanderfolgende alte Formen ohne op bleiben **ein** Aufruf des alten selFn (gleiche Gewichte wie bisher, Radierer wie gehabt).
  Radierer-Pinsel im neuen Weg = Form mit op 'sub'.
- **Bedienung im vorhandenen Stil:** Kombinier-Modus als 4er-Zeile vorn in der vorhandenen Werkzeug-Optionsleiste (`.spk1-op`, scrollt
  waagrecht wie bisher), daneben „Auswahl ▾“ (Klappfenster wie „In Ebene ▾“). Die Aktionszeile der Auswahl (3×2 Knöpfe) ist voll –
  Umkehren/Wiederherstellen deshalb im Klappfenster „Auswahl ▾“ (sonst hätte sich die Höhe der Aktionszeile geändert).
- **Zauberstab** als Alternative auf dem Rechteck-Platz: Halten (480 ms) öffnet die Liste Rechteck │ Zauberstab, der Knopf zeigt danach
  das gewählte Werkzeug (Plan §5 „Halten auf ein Werkzeug öffnet die Liste“). Zusätzlich im Klappfenster „Auswahl ▾ → Zauberstab“.
- **Zauberstab-Kern:** Flood-Fill (4er-Nachbarn) im dB-Raster der Anzeige (Stücke `spk:<id>:v<N>:<ci>`, 984 Zeilen, Spalten Hop N/8),
  Start rastet auf den hellsten Punkt ±6 Zeilen; Bereich = zusammenhängend ≥ Startwert − Toleranz (dB). Zeitgrenze ± `lim` s
  (Standard 5). Stücke-Zwischenspeicher im Worker (6). Ergebnis = Läufe je Spalte (`cols`), im Kern als Raster mit Wachsen/Schrumpfen
  (binär, Zeilen und Spalten getrennt, gleitendes Fenster) und Weichheit (Kastenfilter); Raster-Speicher je Form-Schlüssel (6).
- **Toleranz/Grenze-Regler** rechnen den letzten Zauberstab neu (gleiche Stelle, gleicher op), ohne neuen ↶-Schritt.
- **Rand-Griffe** nur für Rechteck/Zeit/Frequenz/Harmonische/Zauberstab (nicht Pinsel – Malen am Rand soll malen). Griff-Zonen um die
  Balken (±36 px entlang, ±16 px quer) und Mitte (Radius 22) – sonst beginnt am Rand eine neue Form (Test hatte das gezeigt).
  Ein einzelnes Rechteck/Zeit/Frequenz: Rand ziehen bewegt nur diesen Rand; sonst Wachsen/Schrumpfen der ganzen Auswahl
  (abgezogene Formen und Formen vor einem Umkehren schrumpfen dabei – Dualität). Zwei Finger am Rand: auseinander = weicher
  (Schritte 0,25 je 30 px). Mitte ziehen = Form verschieben (Zeit und Tonhöhe), nicht den Klang.
- **↶ je Aktion:** eigener Stapel für Auswahl-Schritte (40); jeder Eintrag merkt den Undo-Stand des Kerns (nu|nr|Name). ↶/↷ nimmt den
  Auswahl-Schritt nur, wenn seitdem keine Ebenen-Aktion kam – sonst wie bisher den Kern-Schritt. Normales Ziehen im Modus „Neu“
  bleibt ohne ↶-Eintrag (wie vor SPK12).
- **Anzeige:** Bei − / ∩ / Umkehren / Zauberstab zeichnet die alte Overlay-Schleife die Formen nicht (Auswahl während des Zeichnens
  kurz ausgeblendet, danach sofort zurück), stattdessen die Ergebnis-Fläche aus dem Kern (Raster 2 px, Rand hell), Anfrage nur bei
  geänderter Ansicht/Auswahl, immer nur eine gleichzeitig. Reine alte Auswahl: Zeichnung wie bisher + Griffe.
- „Wiederherstellen“ = die zuletzt verworfene oder ersetzte Auswahl (Umschalten: nochmal tippen holt die andere zurück).
- Abbruch (pointercancel) mitten im Griff-Zug stellt die Form wie vorher her (Listener auf der Fläche, kein Haken in spk1ToolCancel).

## Messungen (spk12-test.mjs, alle 3 Größen: 98 OK / 0 FEHLER, `spk12-test.out` / `spk12-test.json`)
- Bit-genau (Kern-Masken, Base-Raster, weiche Kanten dabei): A∪B, A−B, A∩B mit Rechteck, Pinsel und Zauberstab, ¬A,
  nur-Frequenzen-umgekehrt, (A∪B)−P∩Z: je **0** Abweichungen (z. B. A−B 3 446 Zellen, 476 weich). Zauberstab wachsen ⊇,
  schrumpfen ⊆, weich hat Zwischenwerte.
- Touch: Rechteck → „+“ → zweites → „−“ → drittes = bit-genau max/min; ↶ → 2 Formen, ↷ → 3.
- Zauberstab, 3 min Audio (440 Hz + rosa Rauschen −20 dB), Tipp bei 90 s: Ton-Energie in der Maske **99,9 %**, Rauschfläche **0 %**
  (Base-Raster ± 5 s). Antwort Tipp → Auswahl **21–36 ms** (Kern 12–35 ms inkl. Laden der Stücke 5–32 ms) – Ziel < 150 ms.
- Hauptfaden: keine Long Task > 50 ms während Zauberstab/Griffe. Overlay-Zeichnen beim Rand-Ziehen p95 0,2–0,3 ms, max 1,1 ms;
  Frame-Abstand p95 16,8 ms (Ziel ≤ 16 ms je Bild – Rechenzeit, nicht der 60-Hz-Takt).
- Layout: Knöpfe Neu/+/−/∩ 44 × 50 (Trefferfläche mit ::after), „Auswahl ▾“ 75 × 50; Leiste und Klappfenster im Bild in allen 3 Größen,
  Klappfenster-Knöpfe ≥ 44 px.
- In Ebene mit Zauberstab-Auswahl: Ebene bekommt am Ton 255, eine Oktave+ darüber 0.
- Guide „Wo finde ich …?“ Eintrag `spk12`. Konsole ohne Fehler.

## Pflicht
topdefs 26 / 7615 / doppelt 0 / Syntaxfehler 0 · dupkeys 0 · smoke errors [] (smoke.png) · „MS 2000“ 1× · „^  live: true,“ 1× ·
VERSION 4.68.0 unverändert · keine Marken-/Produktnamen (0 im Paket) · keine Emojis.
Regression (reg.sh → reg.log, Ausgaben in reg/): spk6 ALLES OK · spk5 ALLES OK 24 · spk1 1 FEHLER verfeinern-verbessert-ziel (= Basis) · spk8-seite 14/0 · spk11-test 38/3 (nur drums-auf-kit = bekannt offen in 4.68).

## Offen (Teil 2/3 und Rest)
- Plan-Schritte 4–9: Transient-Auswahl, Lasso/Ellipse (Platz: Liste am Rechteck-Knopf ist vorbereitet), Obertöne Rang/Häkchen,
  „folgt dem Ton“, Ähnliches mit Merkmalen ‹ ›, Auswahl merken (Dokument), FFT-Text ms/Hz, Sonden/Fotos für diese.
- Pinsel in + / − / ∩: Beim Aufsetzen leert der alte Pinsel-Code eine nicht-weiche Auswahl; sie erscheint erst beim Loslassen wieder
  (Ergebnis stimmt, nur während des Malens unsichtbar) – Haken in spk1ToolDown wäre eine Änderung im alten Pinsel-Zweig.
- Wachsen einer kombinierten Auswahl ist parametrisch (je Form, mit Dualität für − und Umkehren), keine echte Dilatation des Ergebnisses.
- Zauberstab-Rand auf einem hellen Ton kaum sichtbar (weiße Fläche auf weißem Grat) – evtl. dunkle Kontur (sichtbar → erst Funk).
- Halten auf Rechteck zeigt keine Markierung am Knopf (Aussehen bewusst unverändert) – Guide und „Auswahl ▾ → Zauberstab“ als Weg.
- iPhone-Messung (Safari, A14) fehlt; Desktop-Werte oben × ~3 lägen weiter unter 150 ms.
- Funk: Paket ist „kurz ankündigen“ – sichtbar neu sind die 4er-Zeile + „Auswahl ▾“ in der Werkzeug-Optionsleiste und die Griffe.
