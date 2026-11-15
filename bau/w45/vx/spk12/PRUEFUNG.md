# PRÜFUNG SPK12 Teil 3/3 (Plan-Schritte 7–9) – unabhängig, nichts repariert

Geprüft: `index.html` gegen `basis.html` (= rel-4680, cmp gleich) und gegen PLAN §5 P3 „SPK12“ und §8 [K].
Eigene Sonden in `pruef/` (Touch über CDP, Messungen statt Bildvergleich):
- `p1.mjs`: Regionen, ↶-Reihenfolge, Wiedergabe, Abtasten, 48 kHz. Lauf 428×926: 6 OK / 4 BEFUND, davon 1 Fehlalarm der Sonde (siehe OK-Liste).
- `p2.mjs`: Leistung mit 3 min Audio. Lauf 926×370: 4 OK / 1 BEFUND.
- `p3.mjs`: Layout Basis ↔ Paket, alle 3 Größen: 17 OK / 1 BEFUND.
- `p4.mjs`: vorhandene Regler ohne Scrollen, Erstladen.
- Ergebnisse in `pruef/*.json`, Fotos in `pruef/fotos/`.
Alle Zahlen sind Desktop-Werte (Chromium, 4 Kerne, Last 0,7–1,7). Ein iPhone-Messwert fehlt.

## Befunde

### Schwer

**1. „Alle Ebenen abtasten“ aus: Nach dem Schließen und Öffnen eines Stücks sucht das Werkzeug in einem veralteten Stand der Ebene.**
- Ursache: Der Worker hält das Ebenen-Signal in `SRC` (Block Z. 329).
  - Der Schlüssel ist `id|Ebene|Ebene:ver`.
  - `ver` beginnt nach jedem Öffnen wieder bei 2 (`mkDoc vc: 1`, `l.ver = ++d.vc`).
  - Der Worker selbst bleibt bis zu 3 min nach dem Schließen am Leben.
- Messung (p1, `abtasten-aus-nach-wiederoeffnen-aktuell`):
  1. Ebene X enthält den Ton bei 1 s, Zauberstab in X → 472 Zellen.
  2. Ton bei 3 s nach X verschoben → 469 Zellen, richtig.
  3. Stück schließen und öffnen. X steht wieder auf `L1:2`, die Maske von X ist bei 3 s = 255.
  4. Zauberstab bei 3,25 s in X → **0 Zellen**, Harmonische → **0 Punkte**.
  5. `s12src.ms` = 203,7 ms, also genau der Eintrag vom ersten Öffnen.
- Erwartet waren etwa 469 Zellen. Das Ergebnis ist still falsch, es gibt keine Meldung.
- Dasselbe gilt nach „Import“/Container-Laden, denn `importDoc` baut `d` neu.
- Folge für den Speicher: Jeder `SRC`-Eintrag hält über `Object.create(d)` das alte Dokument fest, mit PCM, `mid` und Masken. Bei 3 min sind das rund 32 MB `mid` je Eintrag plus das alte PCM.

### Mittel

**2. ↶-Reihenfolge: „Merken“ zwischen zwei Ebenen-Aktionen wird übersprungen und ist danach nicht mehr rückgängig zu machen.**
- Messung (p1, `undo-reihenfolge-…`): Ablauf In Ebene „EA“ → Merken → In Ebene „EB“.
  - Erstes ↶ entfernt EB, das ist richtig.
  - Zweites ↶ entfernt **EA** statt der Region. Regionen bleiben 2 → 2, im Dokument ebenfalls 2.
- Ursache: Der Auswahl-Schritt merkt sich `ku = nu|nr|Name` des Kerns. Nach dem ↶ von EB ist `nr` = 1 statt 0, der Schritt passt also nie mehr.
- Das verletzt „ein ↶ je Aktion“ (LIFO). Weil Merken das Dokument ändert, ist das mehr als ein Schönheitsfehler.

**3. Im Werkzeug „Ähnliche“ fehlt „Auswahl ▾“, damit auch Merken, Abtasten und Umkehren.**
- Die Leiste Neu │ + │ − │ ∩ · Auswahl ▾ wird nur für `rect zeit freq pinsel harm wand ell lasso trans` gebaut (Block Z. 597).
- Messung (p1): Im Werkzeug Ähnliche ist `[data-a="s12dd"]` **nicht sichtbar**.
- Um die gefundenen Treffer zu merken oder „Abtasten“ für Ähnliche umzuschalten, muss man erst auf ein anderes Werkzeug tippen.
  - Die Auswahl bleibt dabei erhalten (gemessen nach Tipp auf Rechteck: Werkzeug `rect`, 1 Form).
  - Darauf kommt man aber nicht von selbst.
- Der Guide sagt „Auswahl ▾ (Merken, Alle Ebenen abtasten) … Ähnliche → Merkmale ▾ ‹ › Alle“ und nennt diesen Umweg nicht.

**4. „Alle Ebenen abtasten“ aus, 3 min Audio: Die erste Antwort dauert fast 3 s, ohne Fortschrittsanzeige.**
- Messung (p2, 926×370, 180 s, Ebene X):

  | Fall | Dauer |
  |---|---|
  | Zauberstab im Original | 23 ms |
  | erster Zauberstab in X | **2894 ms**, davon Ebenen-Signal im Worker 2594 ms |
  | Zauberstab an zweiter Stelle in X | **162 ms** |
  | Harmonische | 10 ms |

- Die Grenze in §5 ist 150 ms bei 3 min (mit ±5 s Zeitgrenze). Die Messung liegt beim ersten Tipp und bei jedem neuen Ebenen-Stand darüber, an neuer Stelle knapp darüber.
- Ursache: `src()` rechnet immer das ganze Stück, obwohl Zauberstab und Folgt dem Ton nur ±5 s brauchen. Die Anzeige-Stücke der Ebene liegen nicht in IDB.
- Auf dem A14 sind etwa 6–9 s zu erwarten, mit Faktor 2–3 geschätzt, nicht gemessen.
- Speicher: 2 Stände × 31,8 MB `mid` bei 3 min.
- Der Bauer nennt das in seiner Offen-Liste nur als „etwa 3–5 s“. Gegen die §5-Grenze ist es ein Befund.

**5. Paket als Ganzes (aus Teil 1): Die neue Leiste schiebt vorhandene Regler im Hochkant-Format aus dem Bild.**
- Messung (p4/p3, 428×926, Optionsleiste ohne Scrollen):

  | Werkzeug | Basis | Paket |
  |---|---|---|
  | Rechteck | Kante 6–190 px, „Tipp = Abspielen“ 202–325 px; Leiste 428 breit, scrollt nicht | Kante **283–467**, „Tipp = Abspielen“ **479–602**; Leiste 608 breit |
  | Pinsel | Weich 207–389 | Weich **484–666**, Radierer **678–745** |
  | Harmonische | Breite 221–406 | Breite **498–683** |

- Quer ist die Leiste in der Basis 472 breit, im Paket 608.
- Die Höhe der Leiste ist gleich (44/46 px).
- Damit ist die vorhandene Bedienung sichtbar anders: Die Regler, die man bisher sofort sah, erreicht man jetzt nur durch waagrechtes Wischen.
- NOTES Teil 1 sagt „scrollt waagrecht wie bisher“. Das stimmt für Rechteck, Harmonische und Zeit in der Basis nicht (scrollWidth = clientWidth).

### Leicht

**6. Hochkant ragen › und „Alle“ über den rechten Rand.**
- Messung (p3, 428×926, Leiste in Ausgangslage): Merkmale ▾ 244–327 px, ‹ 339–383, **› 395–439**, **Alle 451–495**. Der Rand liegt bei 428 px.
- Erreichbar sind beide nur durch Wischen; › ist halb angeschnitten.
- Quer (926×428 und 926×370) ist alles sichtbar.

**7. Ansicht ▾ wird durch den FFT-Text um 51 px höher.**
- Hochkant: Unterkante 781 → **832** px, im Bild.
- Quer: scrollHeight 688 → **739**. Das Klappfenster scrollte dort schon in der Basis.
- Der Text selbst steht richtig im Bild: „4096 Punkte: 93 ms / 10,8 Hz“, bei 48 kHz „85 ms / 11,7 Hz“.
- Nur ein Hinweis: §5 erlaubt den Text am Regler. Die Größe des vorhandenen Klappfensters ändert sich trotzdem.

**8. Erstladen: Der neue Code steckt im Hauptskript, nicht in einem nachgeladenen Teil.**
- Allgemeine Abnahme §5: „neuer Code nur in nachgeladenen Teilen“, Erstladen ±1 %.
- Größe: roh +91 347 B (**+1,02 %**), gzip +29 573 B (+1,00 %).
- Gemessene Ladezeit ohne Nachteil: DOMContentLoaded Basis 570–614 ms, Paket 527–560 ms, je 3 Läufe. Das liegt im Rauschen.
- Der Block steht im `<script>` ab Zeile 27566, wie bei SPK11 auch.

**9. Ordnung im Paket-Ordner.**
- `fotos/` enthält **37 fremde Fotos** aus dem Regressionslauf von 05:08–05:10: spk5-* 20, spk6-* 11, 20-/21-/22-/90-* 6.
- Im Hauptordner liegen fremde Ergebnisse: `spk1-test.json`, `spk5-test.json`, `spk6-*.json`, `spk8-seite.json`.
- LOG von 04:19 sagt „fotos/ = nur SPK12“. Im Teil-3-Lauf wurde nicht wieder aufgeräumt.
- `spk12-test2.json` enthält nur die Wiederholung 926×370. Das ist so berichtet.

### Ohne eigene Messung, aus dem Code (zur Einordnung)

- **a.** Transient bei „Abtasten aus“:
  - Die Schläge werden in der Ebene gesucht.
  - Die Maske („Anteil über dem Grund vor dem Schlag“, `spk12K2` 'trans') rechnet der Kern aber immer aus `d.mid` des Originals.
  - Folge: Das Pad aus anderen Ebenen bestimmt den Grund mit.
- **b.** Ein Merkmal-Häkchen startet die Suche neu (`spk1Aehn`) und ersetzt die Auswahl ohne ↶. Gewollt als „Einstellung“, aber die Auswahl ändert sich. Zurück kommt man nur über „Wiederherstellen“.

## Nachgemessen und in Ordnung

- **Pflicht**
  - topdefs: 26 / 7659 / 0 doppelt / 0 Syntaxfehler (Basis 7567).
  - dupkeys: 0.
  - Eigener smoke-Lauf: errors [].
  - „MS 2000“ 1×, „^  live: true,“ 1×, VERSION 4.68.0 (alle drei VERSION-Zeilen wie in der Basis).
  - diff: 931 neue, 0 entfernte Zeilen, ein Block SPK12-BEGIN/END nach SPK11-END.
  - Marken- und Produktnamen im neuen Code: 0.
  - Emojis: 0; nur Text-Zeichen wie → ▾ ↶ ∩ ✓ ✕.
- **Gemerkte Region**
  - Nach echtem Schließen und Öffnen (ohne Eingriff des Tests) zeigt Auswahl ▾ „Rechteck 1 · 2,5–6,5 s“.
  - Stück-Wechsel: B zeigt 0 Regionen, A wieder 1.
  - Container-ZIP-Rundreise (`spk1ZipAdd` → `spk1ZipRead`): `s12reg` bit-gleich (162 B).
  - Region aus Zauberstab + Lasso(−): nach Speichern, Schließen, Öffnen und Laden per Touch ist die Maske bit-genau (0 Abweichungen bei 51 874 Zellen) und das Auswahl-JSON gleich. Region 875 B.
  - Fehlalarm der Sonde: p1 meldet diesen Punkt als BEFUND. Grund ist nur die eigene Schwelle der Sonde (mindestens 100 Zellen ≠ 0, gemessen 64). Die Maske stimmt.
- **↶/↷ während der Wiedergabe**
  - Ablauf: › → ↶ → ↷, dann Merken → ↶. Auswahl und Regionen (Anzeige und Dokument 0) sind richtig.
  - Die Wiedergabe lief durch: Position 0,76 s → 4,05 s.
- **Merkmale, 3 min**
  - Erste Suche 997 ms im Worker (Merkmal-Raster).
  - Danach 6–19 ms, der alte Weg 566 ms.
  - Hauptfaden ohne Long Task bei Suche, 6× ›, Alle, 3× ↶, Merken und Laden.
  - Bildabstand p95 16,7 ms, max 16,8 ms.
- **Layout (alle 3 Größen)**
  - Merkmale ▾: Häkchen 44 px hoch, im Bild.
  - Auswahl ▾ mit 12 Regionen: scrollt (overflow auto), Zeilen und ✕ mindestens 44 × 44, die letzte Zeile ist erreichbar, nichts ragt seitlich heraus.
  - Höhe der Optionsleiste wie in der Basis.
- **Nicht berührt:** MIDI-Export, Rückung/Teil-Transposition und Matrix-Gesten.
  - Alle 18 Haken sitzen in Spektral-Funktionen: spk1*, Spektral-Kern, spk8WUrl.
  - Code in Song, MIDI oder Matrix ist unverändert.
  - Im Browser nicht eigens nachgefahren, aus Zeitgründen.
