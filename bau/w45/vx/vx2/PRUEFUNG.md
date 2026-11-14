# VX2 – unabhängige Prüfung (Gesang-Editor an echtem Gesang: Stücke = Noten/Silben)

Geprüft: `vx/vx2/index.html` (4.62.0 + VX2) gegen `vx/vx2/basis.html` (4.62.0). Nichts repariert. Alle Läufe einzeln nacheinander.
Eigene Skripte, Läufe und Fotos liegen in `vx/vx2/pruef/` (probe/analyze/a2/kons/naht2/bench/side*/stale*/synth/ui/zeit).
Zeiten in s sind Take-Zeiten. Die 3 echten Aufnahmen heißen hier #1 (33 s, 2 Noten-Annotationen A1 = 59 und A2 = 64 Noten), #10 und #14.

## Kurzurteil
Die Zahlen des Bauers für #1 gegen A1 stimmen (60 Stücke, 52/60 an einer Note, Einsätze 45 · 49, Ton 55/56, Raster 58/60).
Die drei neuen FEHLER-Zeilen im rv1-test sind tatsächlich keine Knackser. Es gibt aber zwei schwere Befunde:
- VX2 verliert wieder angesungene Silben auf gleicher Tonhöhe. A1 sieht das nicht, die zweite Annotation A2 schon.
- VX2 ersetzt die erkannten Marken des Takes app-weit, nicht nur im Gesang-Editor. Dadurch rutscht ein eingegebener Songtext auf andere Silben, je nachdem, ob der Gesang-Editor seit dem Laden schon offen war.

Dazu kommt ein mittlerer Befund: Der VX2-Weg umgeht die SPK5-R-Nachmessung, deshalb zeigt der Editor zuerst Anker einer veralteten Quelle.

## Befunde

### 1. SCHWER – Echte Silben gehen verloren (gleiche Tonhöhe, wieder angesungen)
- Auftrag: „ohne echte Silben zu verlieren“. Gemessen gegen die zweite Annotation derselben Aufnahme #1. A2 hat 64 Noten und trennt wieder angesungene Silben.
  | gegen A2 (64 Noten) | Basis | VX2 |
  |---|---|---|
  | Vokal-Beginn ±40 ms | 56/64 (88 %) | 50/64 (78 %) |
  | Stück-Anfang ±40 ms | 48/64 | 45/64 |
  | Noten ohne jede Stück-Grenze in −150…+60 ms | 0 | 7 |
  | zusätzliche Noten in einem Stück (≥ 2 Noten-Anfänge) | 1 | 9 |
- Die 13 A2-Noten, die A1 nicht hat, sind fast alle wieder angesungene Silben ohne Pause und ohne Tonwechsel. Die Basis trifft 11/13 (±40 ms), VX2 nur 4/13.
  - Beispiele (Basis / VX2, nächste Grenze): 3,44 s (+36 / −350 ms), 17,97 s (+23 / −329 ms), 22,62 s (+35 / −210 ms), 29,04 s (+56 / −277 ms).
  - 27,81 s ist ein Tonsprung von 3,7 Halbtönen (+132 ms in VX2, −10 ms in der Basis).
- Auch gegen A1 verliert VX2 mehr: keine Grenze in −150…+60 ms bei 5 Noten (Basis 1), nämlich 9,77 · 11,99 · 14,87 · 18,17 · 23,91 s.
  - 18,17 s: Die nächste Grenze liegt 469 ms entfernt. Beide Annotationen haben dort eine eigene Note, 12 ms Lücke, gleiche Tonhöhe.
- Ursache (gemessen an den Rahmen der Analyse): An diesen Stellen ist alles stimmhaft (kein stimmloser Rahmen), das Pegel-Tal beträgt nur 3–5 dB.
  - Stimmhafte Konsonanten (l, m, n, w) erfüllen deshalb keines der Einsatz-Merkmale (stimmlos davor oder Tal > 6 dB).
  - G2 fasst gleiche Tonhöhe zu einer Note zusammen.
  - Erkennungs-Marken bis 100 ms neben einer G2-Note werden verworfen, auch wenn G2 dort 100–180 ms daneben liegt (9,77 s: G2 −179 ms; 14,87 s: G2 +102 ms, Basis-Marke −41 ms).
- Der Bauer hat nur gegen A1 gemessen. A1 fasst solche Silben selbst zusammen, darum belohnt das Ziel „Stückzahl ≈ Notenzahl“ dort genau diesen Verlust.

### 2. SCHWER – VX2 ersetzt die erkannten Marken app-weit: Songtext und Zeitkarte springen
- `vx2Marks` schreibt `WP.det.set(id, mk)`. Diese Marken gelten danach auch im Marken-Editor und in der Zeitkarte (Quantisieren dort). Sie werden aber nicht gespeichert.
- Der Songtext (`m.lyrics`) hängt per Reihenfolge an den Marken (`VSM.assignLyrics(text, mk.length)`).
- **Fall A** (#10, #14): Songtext im Marken-Editor eingeben (eine Silbe je Marke), danach den Gesang-Editor öffnen.
  - #10: 0/56 Silben bleiben an ihrer Stelle, 28 wandern (z. B. s3 2,16 → 2,65 s, s4 2,30 → 3,13 s), 28 fallen in „übrig“.
  - #14: 0/69 bleiben, 32 wandern, 37 fallen in „übrig“.
  - Basis: 56/56 und 69/69 unverändert.
- **Fall B** (#10): Erst den Gesang-Editor öffnen (VX2 → 28 Marken), dann 28 Silben eingeben, Projekt speichern und neu laden.
  - Der Marken-Editor zeigt danach 56 Marken, alle 28 Silben stehen woanders.
  - Erst nach erneutem Öffnen des Gesang-Editors stehen sie wieder richtig.
  - Basis: stabil.
- Das ist genau der Weg, den die App selbst vorgibt: Die Taste „Text erkennen“ im Gesang-Editor schickt in den Marken-Editor („Text“).
- Ebenso arbeitet „Quantisieren“ in der Zeitkarte nach dem Öffnen des Gesang-Editors mit 28 statt 56 Marken (#10). Das Ergebnis hängt also davon ab, ob der Gesang-Editor in dieser Sitzung offen war.
- Der Bericht sagt „wirkt nur im Gesang-Editor“, die NOTES sagen „gilt dann auch in der Zeitkarte“. Das widerspricht sich.

### 3. MITTEL – Der VX2-Weg umgeht SPK5-R: Der Editor zeigt Anker einer veralteten Quelle
- In `vx1rAnalyse` liefert der VX2-Zweig die Analyse mit dem Schlüssel der alten Quelle zurück. Die SPK5-R-Prüfung (`vx1rSrc(id) !== b` → neu messen) fehlt in diesem Zweig.
- Während der ersten Analyse wird die Quelle gewechselt (G4 fertig).
  - Basis: Nach dem Öffnen liegt die Analyse in 3/3 Aufnahmen auf der aktuellen Quelle.
  - VX2: in 0/3, auch 1,5 s später nicht.
- Folge: Die angezeigten Anker-Linien springen beim ersten Bearbeiten, weil `vx1rCommit` neu misst.
  | Anker angezeigt gegen neu gemessen | #1 | #10 | #14 |
  |---|---|---|---|
  | Abweichung > 5 ms | 42/60 | 13/28 | 22/32 |
  | Abweichung > 20 ms | 14 | 4 | 12 |
  | größte Abweichung | 116 ms | 62 ms | 68 ms |
  | Anlauf (Konsonant) > 5 ms anders | 8 | 4 | 3 |
  - Basis: überall 0.
- Die Stück-Grenzen selbst hängen ebenfalls davon ab, welche Quelle beim ersten Öffnen galt.
  - #1 kalt neu gerechnet ergibt 61 statt 60 Stücke, 6 Grenzen anders. Die verlorene Note 18,17 s ist dann wieder da.
  - Basis: 150/150, gleich.
- Nach der Neu-Messung bleiben die Ziele für #1 erfüllt: A1 Anfang 44/59, Vokal 49/59, an einer Note 49/60.

### 4. MITTEL – Das Ziel „Einsätze ≥ 80 % (Anfang)“ ist nicht erreicht, der Bericht klingt anders
- Anfang 45/59 = 76,3 % (nach Neu-Messung 44/59). Die offizielle Prüfung ist nur grün, weil sie max(Anfang, Vokal) = 49/59 nimmt.
- Die Kopfzeile „Ziel bei #1 erreicht“ stimmt nur für Vokal-Beginn und Präzision.
- Erklärung „die meisten Abweichungen sind Konsonant-Anläufe 110–150 ms davor, gewollt“: Von 14 Fehlgriffen sind
  - 7 mehr als 100 ms zu früh, zweimal −179 ms, das liegt über der Anlauf-Grenze von 150 ms,
  - 3 sind 48–74 ms zu früh,
  - 4 zu spät (+79, +97, +99, +469 ms). Das sind G2-Grenzen bzw. verlorene Silben, siehe Befund 1.
  - Also ist es die Hälfte, nicht „die meisten“, und es ist nicht alles gewollt.

### 5. LEICHT – Der offizielle rv1-test bleibt rot; die neuen Zeilen sind Mess-Bezug (nachgewiesen), der Test ist nicht angepasst
- Mein Lauf: VX2 4/53 FEHLER (#1 Knacken, #1 Sprung, #10 Sprung, #10 Raster). Basis 5/53 FEHLER (#1 Einsätze, #1 Präzision, Raster #1/#10/#14).
- „#14 Stück 23 rechts“ war bei mir OK. Die Prüfung ist also unzuverlässig, wie der Bauer schreibt.
- Nachgemessen im Testzustand (Puffer-Dump):
  - Schnitt 34 (#1): Ausgang 8–2 ms vor der Naht = Quelle −30,6 ms vor dem Stück (r 0,984). 2. Ableitung der Quelle dort 0,1438 ≥ Ausgang 0,1148. Eigener Knackindex (Naht gegen eigene Umgebung) 0,79.
  - Schnitt 38: Quelle −35,8 ms (r 0,70), 0,042 ≥ 0,020, Index 0,53.
- Eigener Knackindex über alle Schnitte (Index > 2 und d2 > 0,004):
  | | #1 | #10 | #14 |
  |---|---|---|---|
  | VX2 | 1/59 | 1/27 | 5/31 |
  | Basis | 6/149 | 4/55 | 7/68 |
  - Die zwei stärksten in #14 sind dieselben Stellen mit denselben Werten wie in der Basis, sie kommen aus der Quelle.
- Kein neuer Knackser. Aber vor dem Einbau braucht `vx/real/rv1-test.mjs` den vorgeschlagenen Bezug (Ausklang des Vorgängers), sonst ist die RV1-Prüfung dauerhaft rot.

### 6. LEICHT – Die Regressionstests erreichen VX2 gar nicht
- vx1-test setzt gespeicherte Marken (`m.marks = …`, Zeile 82), dann gibt `vx2Marks` sofort null zurück. imp1-test öffnet den Gesang-Editor nicht.
- 61/61 und 48/48 belegen also nur, dass nichts anderes kaputt ist.
- Eigene Prüfung mit demselben synthetischen 6-Silben-Signal ohne gespeicherte Marken (`pruef/synth.mjs`):
  | | Stücke | Konsonant beim Stück | Anker-Fehler |
  |---|---|---|---|
  | VX2 | 6 | 6/6 | 1–4 ms |
  | Basis | 9 | 6/9 | bis 98 ms |
  - Legato-Variante (gleiche Tonhöhe je 2 Silben): VX2 6 Stücke (2 Vokal-Einsätze ohne Konsonant 48 ms spät), Basis 17.
- Synthetisch ist VX2 also besser. Ein fester Test für den Weg „erkannte Marken + VX2“ fehlt aber.

### 7. LEICHT – Anker- und Anlauf-Rechnung doppelt (Wartung)
- `vx2AnLead` ist eine Kopie des Anker/Anlauf-Teils von Op 'vxa'. Sie ist bitgleich nachgeprüft (max Δ 0 bei #1/#10/#14) und braucht 5–12 ms auf dem Hauptfaden.
- Der vom Bauer vorgeschlagene nächste Schritt (Anlauf über 1–2 stimmhafte Rahmen) muss an zwei Stellen gleich geändert werden. Sonst zeigt der Editor beim ersten Öffnen eine andere Rechnung als nach dem ersten Bearbeiten.

### 8. LEICHT – Raster #10 bleibt FEHLER
- 20/28 auf dem Raster (3 gesperrt, 4 Linie besetzt), Basis 31/56.
- Absolut liegen 8 statt 25 Stücke daneben, also deutlich weniger, wie verlangt. Die Prüfung bleibt trotzdem rot.

## Bestätigt / ohne Befund
- **#1 gegen A1 (mein offizieller Lauf):** 60 Stücke / 59 Noten, 52/60 an einer Note, Einsätze 45 · 49 von 59, Tonhöhe 55/56 (Median 2 ct), Raster 58/60. #14 Raster 28/32.
- **Analysezeit:** keine Verschlechterung.
  - Erste Analyse #1: 3435 / 3485 ms gegen Basis 3911 / 3826 ms.
  - Kalte Wiederholung (Median aus 6): #1 1283 / 1242 gegen 1213 / 1179 ms, #10 426 / 323 gegen 306 / 329 ms, #14 386 / 401 gegen 448 / 467 ms.
  - Lange Aufgaben über 50 ms: einmal 68 ms (VX2), sonst keine.
- **Rendern nach Quantisieren:** Die vom Bauer genannte Verlangsamung ist strukturell nicht nachweisbar.
  - Gleicher 'hyb'-Kern in Node, Median aus 5: VX2-Karte 133 / 34 / 45 ms gegen Basis-Karte 167 / 47 / 35 ms.
  - In der App schwanken die Werte unter Last stark (VX2 463/312/173, 574/166/228; Basis 371/195/115, 362/198/197 ms).
- **Konsonant vor Vokal nach Quantisieren** (Kreuzkorrelation Quelle → Ausgang):
  - #1: VX2 8/9 direkt am Vokal gegen Basis 4/9.
  - #14: in VX2 ein Konsonant (3,15 s, 50 ms) weggeschnitten, in der Basis derselbe 26 ms abgetrennt.
  - Kein Rückschritt.
- **Touch, #10, hochkant 428×926 und quer 926×428** (Fotos `pruef/fotos/ui-*`). Ablauf: Song › Gesang-Block › Takes-Blatt › „✎ Bearbeiten“.
  - Editor mit 28 Stücken (Basis 56), Stücke nach 651 / 625 ms (Basis 605 / 881 ms).
  - „Quant.“ › 1/8 › Anwenden: ein ↶, 570 / 565 ms (Basis 512 / 604 ms).
  - Quer: Stück ziehen, ein ↶, Anker auf dem Raster; ↶-Knopf nimmt zurück.
  - Hochkant nach ⤢ löste das Ziehen in beiden Fassungen nicht aus (Stück 8 bzw. 22 px breit). Das ist eine Testgrenze, nicht VX2.
  - Keine Konsolenfehler, keine überlappenden Knöpfe, kein waagrechtes Scrollen.
- Bauer-Behauptungen stimmen:
  - Gespeicherte Marken (`m.marks`) bleiben unberührt.
  - Ohne G2-Noten (< 2) bleibt alles wie in der Basis.
  - `window.__vx2.on(false)` schaltet ab.

## Pflichtprüfungen (vx/vx2/index.html)
- topdefs: Skripte 26, Namen 7349, doppelt 0, Syntaxfehler 0. dupkeys: 0 doppelte Schlüssel.
- smoke: `errors []` (`pruef/smoke-pruef.png`).
- „MS 2000“ 1× (Basis 1×). „^  live: true,“ 1× (Basis 1×). VERSION '4.62.0' (= Basis).
- Markenwörter: je Wort gleich wie in der Basis, 0 im VX2-Block.
- Datensatz- und Produktnamen unter `vx/vx2`: 0, auch in `pruef/`.
  - Ein Produktname steht 1× in der App, gleich wie in der Basis, also nicht von VX2.
  - Unter `vx/` außerhalb von VX2 stehen vorbestehend Treffer in `spk3/NOTES.md`, `spk3/LOG.md` und `ki/LOG.md`.
- Regression einzeln:
  - vx1-test: 61/61 OK (`pruef/reg-vx1.txt`, 30 s).
  - imp1-test: ALLE OK (48), 120 s (`pruef/reg-imp1.txt`).
  - rv1-test offiziell: VX2 49/53, Basis 48/53 (`pruef/run-vx2-a.txt`, `pruef/run-basis-a.txt`).
- Nicht nachgemessen: #14 allein (Chor-σ/Formant, laut Bauer schon in der Basis so).
