# IMP2B – unabhängige Prüfung (15.11., 01:22–02:00)

Geprüft: `vx/imp2b/index.html` (sha256 a4d6e9ef…, = basis.html + IMP2: 72 Diff-Zeilen, alle in `imp1Core`, Kern zeichengleich mit
`vx/imp2/index.html`, sha 89e25b1d…) gegen `vx/imp2b/basis.html` (51da4b6b…). Nichts repariert. Eigene Läufe und Sonden: `vx/imp2b/pruef/`
(Ausgaben `pruef/out/`, Zeiten `out/zeit.txt` / `out/zeit2.txt`, alle Tests einzeln nacheinander).

## Kurzurteil
- Die Zahlen von IMP2B lassen sich wiederholen (chr2, rv1, imp1, vx1/2/3 und die IMP2-Tests liefern dasselbe). Bei der Chor-Ursache (1) hat IMP2B
  recht: chr2-test misst falsch, und die Test-Kopie ist begründet und weiterhin empfindlich. Auch bei der rv1-Ursache (2) stimmt die Richtung:
  Der Gesang-Editor reagiert auf die Lage des Takes. Die Basis zeigt dieselben Fehler, sobald sie dieselbe Lage bekommt, und bei
  22,05 oder 44,1 kHz liefert sie diese Lage schon selbst.
- **index.html (= IMP2) ist weiterhin schlechter als basis.html**: rv1 4/53 statt 1/53, darunter ein echtes Knacken; bei 48 kHz wird das
  Projekt-Tempo reiner Vokal-Melodien öfter falsch (12/14 statt 14/14). Das Paket baut keinen Code ein. Es selbst macht also nichts schlechter,
  das Ziel (rv1 ≥ 52/53) erreicht es aber nicht.
- Neu gefunden: imp1Core ist **nicht** nur der Import. Auch die Spektral-Seite nimmt ihr Takt-Raster daraus (`spk1Grid`). Außerdem misst
  rv1-test den Chor mit demselben schwachen Schätzer wie chr2-test.

## Tests (einzeln nacheinander, an index.html, wenn nicht anders angegeben)
| Test | Ergebnis | Vergleich mit IMP2B |
|---|---|---|
| topdefs / dupkeys / smoke | Skripte 26, Namen 7474, doppelt 0, Syntaxfehler 0 · 0 doppelte Schlüssel · errors [] | gleich |
| chr2-test Original, index | **3 FEHLER von 82**: Versatz 6.7/6 13.5/12 9.7/9 18.7/17 **11.7/15 22.4/16** · Lead 14.7 … 37.4 · Formant uni/st+2 **NaN** | zahlengleich |
| chr2-test Original, basis | ALLE OK (82) | gleich |
| chr2-test-imp2b (Kopie), index / basis | ALLE OK (82) / ALLE OK (82) – Versatz 6/6 12.1/12 9.2/9 17.2/17 15.6/15 15.4/16 bzw. 6/6 12.1/12 8.9/9 16.7/17 15.1/15 15.8/16 | zahlengleich |
| rv1-test, index / basis | **FEHLER 4/53** / FEHLER 1/53 (nur #10 Raster) | Zeilen gleich (bis auf ms) |
| imp1-test | ALLE OK (48 OK), 131 s | gleich |
| vx1 / vx2 / vx3 | 61/61 · 14/14 · 15/15 | gleich |
| imp2-node (Raten 22,05/44,1/48/96 kHz), index | ALLE OK (#14 Spanne 0,05 BPM, #1 0,00, #10 0,00), Summe 9 150 ms | gleich |
| imp2-node, **basis** (zum Vergleich) | FEHLER 2 Gruppen: #14 Spanne **11,87 BPM** (120,7 / 120,7 / 132,6 / 132,6), #1 1,10 BPM (96 kHz 119,7, t1 0,369), Summe 11 826 ms | – |
| fft / krumm / sweep | ALLE OK (6), Zeit #1@48k 215 → 130 ms · ALLE OK (37) · schlechteste Sperre −51,7 dB | gleich |

Die IMP2-Ziele bleiben erfüllt: Das Tempo ist über die Raten gleich (±0,5 BPM) und die Analyse 23 % schneller. Eine Einschränkung steht in Befund L2.

## Ursachen nachvollzogen
**(1) Chor/chr2.** Ich habe den Messteil des Tests an den echten Puffern nachgerechnet (`work/ana2.mjs`): Er gibt die Browser-Zahlen exakt wieder.
- SR-Fehler ×1,088 bestätigt (Puffer 48 kHz).
- Periode-Mehrdeutigkeit bestätigt. Mit richtiger SR, aber 5 ms Glättung liest IMP2 bei Kopie 5/6 immer noch 11,0/20,2 statt 15/16.
- Die korrigierte Schätzung (20 ms) bleibt empfindlich (`pruef/mut-lag.mjs`, `out/mut-lag.txt`). Ein künstlicher Fehl-Versatz von −4/−2/+2/+3/+4/+5 ms
  wird auf ±0,7 ms genau gelesen (+5 ms → 4,4…5,4 ms). Die Kopie verdeckt also keinen echten Versatz-Fehler (Grenze ±4 ms).
- NaN bestätigt (`pruef/nan-frame.mjs`): Rahmen s = 94 501, sein Fenster [93 477, 95 525) endet 20 Proben vor der ersten Probe ≠ 0 (95 545). In allen drei
  Stimmen ist das Fenster still, und YIN meldet dort Ton. In der Basis liegt die erste Probe bei 96 769, deshalb entsteht kein solcher Rahmen.
- Der Chor verschiebt wirklich nur um den Plan: `copyWithin` um plan.ms (Zeile 73398), die erste Probe ≠ 0 entspricht dem Plan in Basis und IMP2.
  Gemessen über je 1 s schwankt der Versatz der Hüllkurve auch mit 20 ms Glättung um mehrere ms (`out/lokal-env.txt`), in Basis wie IMP2.
  Die Prüfung „Versatz = Plan“ gilt also nur als Mittelwert.

**(2) rv1.** 4/53 bzw. 1/53 wiederholt, die Zeilen sind gleich.
- Die Gegenprobe Basis #10 mit t1 0,388 zeigt dieselbe Art Fehler: 31 Stücke, Knacken an Schnitt 13 (sh 1 ms), Raster 24/31. Zahlengleich ist sie aber nicht (s. L1).
- Stärkster Beleg aus imp2-node: Die **Basis selbst** liefert bei 22,05/44,1 kHz für #10 t1 0,388 und für #14 120,7 BPM, also genau die IMP2-Werte.
  Die 3 zusätzlichen rv1-FEHLER treten demnach mit der Basis auf jedem Gerät mit 44,1-kHz-Audio auf. Es ist ein Fehler des Gesang-Editors
  (VX1R/VX2/VX3), den IMP2 nur bei 48 kHz sichtbar macht.

## Eigene Zusatzfälle
1. **Import bei 22,05/44,1/48/96 kHz, synthetisch mit Wahrheit** (`pruef/tempo-raten.mjs`, `out/tempo-raten.txt`). 7 Tempi × 2 Vokal-Melodien,
   eine Quelle mit 44,1 kHz, per Kaiser-Sinc umgerechnet (bei 48 kHz entspricht das dem Browser: 120A Basis 120,39, IMP2 120,54).

   | | 22,05k | 44,1k | 48k | 96k |
   |---|---|---|---|---|
   | Projekt-Tempo richtig, Basis | 13/14 | 13/14 | **14/14** | 14/14 |
   | Projekt-Tempo richtig, IMP2 | 13/14 | 13/14 | **12/14** (120A → 121, 126A → 127) | 13/14 |
   | mittlerer \|Fehler\| BPM Basis / IMP2 | 0,17 / 0,16 | 0,17 / 0,16 | 0,17 / 0,20 | 0,17 / 0,17 |
   | mittlerer \|t1-Fehler\| ms Basis / IMP2 | 27,4 / 27,7 | 27,8 / 27,7 | 29,0 / **25,6** | 29,0 / 27,4 |

   Spanne über die Raten je Fall: Basis höchstens 0,22, IMP2 höchstens **0,33** BPM (126A). Im Mittel: Basis 0,08, IMP2 0,04.
2. **Import → Gesang-Editor → Quantisieren → Chor auf importiertem Take, synthetisch** (`pruef/syn-gen.mjs` erzeugt 120/112/132 BPM mit
   Noten-Wahrheit, gelaufen mit `work/rv1s-test.mjs`, `RV1_ONLY=1,2,3`):
   - **IMP2 ALLE OK 61/61, Basis FEHLER 2/61.** Die beiden Basis-FEHLER sind Chor-Messungen: Versatz 14/6 … 23/17 23/16 und Lead 41 ms.
   - Quantisieren ist in beiden sauber: kein Knacken, d2-Verhältnis höchstens 0,4 (IMP2) bzw. 0,3 (Basis), Raster 12/12 und 24/24.
   - Einsätze 100 % in beiden.
   - Tempo: IMP2 120,5 / 112,3 / 132,0, Basis 120,4 / 112,0 / 132,0. Der t1-Fehler zur Wahrheit 0,25 beträgt bei IMP2 −7 / −7 / −18 ms, bei der Basis −16 / −31 / −21 ms.
3. **Restabhängigkeit bei 48 kHz** (`pruef/down-vergleich2.mjs`, `pruef/einspeisen.mjs`). Die 11-kHz-Folge von imp2Down bei 48 kHz weicht nur um
   −70 dB von der bei 44,1 kHz ab, das Tempo kippt trotzdem (126,62 statt 126,29). Ich habe y48 in die 44,1-kHz-Analyse eingespeist und umgekehrt:
   Das Ergebnis folgt allein y. Mischt man y44 und y48, kippt es zwischen 50 und 75 % Anteil y48. Die Gesangs-Schätzung ist also unstetig.
   Gegen Rauschen bei −90 dB, Versatz um 1–5 Proben und gekürztes Ende ist sie dagegen stabil (`out/empfindlich.txt`, `out/laenge.txt`).

## Befunde

### SCHWER
**S1 – index.html (IMP2) ist in rv1 schlechter als die Basis, und das Paketziel ist verfehlt.**
- rv1: 4/53 statt 1/53. #10 knackt beim Quantisieren hörbar (Schnitt 13, d2 0,1102 gegen Quelle 0,0272, Verhältnis 4,05, Grenze 1,5).
  #14 Raster 31/37 und Stück 35 links: Ausklang ab 346 ms ungleich.
- Der Auftrag erlaubte ausdrücklich, „den anderen Teil robust [zu] machen“. IMP2B begründet den Verzicht mit „Eingriff in VX1R/VX2/VX3, der
  ausdrücklich nicht zu IMP2B gehört“ (NOTES). Diese Einschränkung steht im Auftrag nicht.
- Die Ursache ist sauber eingegrenzt und lässt sich nachstellen: `RV1_T1=0.388 RV1_ONLY=10` auf basis.html. Die Basis knackt dort genauso, und auf
  44,1-kHz-Geräten schon heute (imp2-node: Basis-t1 0,388 bei 44,1 kHz). Damit ist das ein bestehender Fehler des Gesang-Editors mit Vorrang.
  Solange er nicht behoben ist, darf IMP2 nicht rein.

### MITTEL
**M1 – Bei 48 kHz wird das Projekt-Tempo reiner Vokal-Melodien mit IMP2 häufiger falsch.**
- Synthetisch richtig: 12/14 mit IMP2 gegen 14/14 in der Basis. Falsch werden 120A → 121 (roh 120,54) und 126A → 127 (roh 126,62).
- Im Browser bekommt die chr2-WAV (Wahrheit 120) das Projekt-Tempo **121** statt 120 (q 0,9959, Take 494 685 statt 498 907 Proben). Genau das stößt die
  chr2-Messfehler an.
- Bei 22,05/44,1 kHz ist IMP2 nicht schlechter als die Basis (13/14 gegen 13/14). Bei 48 kHz liegt die Basis „zufällig“ besser, weil ihr 12-kHz-Weg
  bei diesen Melodien um 0,1–0,2 BPM genauer schätzt (112A: Basis 112,07, IMP2 112,27).
- IMP2B erklärt 120 → 121 als „Zufall der Schätzung“ und rundet nicht anders. Der Bericht verschweigt, dass bei 48 kHz das Projekt-Tempo damit messbar
  öfter falsch ist. Bei t1 ist IMP2 dagegen besser (25,6 statt 29,0 ms; synthetisch im Browser −7 statt −16/−31 ms).

**M2 – Die Aussage „imp1Core wird nur vom Import benutzt / es gibt keinen anderen Weg, der IMP2 benutzt“ ist falsch.**
- `spk1Grid` (Zeile 98787) ruft `imp1Analyse` für jede Datei und jeden Take auf, die auf die Spektral-Seite geladen werden. Daraus kommen das Takt-Raster
  (bpm, off = t1), die Loops (`spk2LpSec`), die Übergabe in die Matrix (`spk2MxGrid`) und die Schrittweite (`spk6Step`).
- IMP2 verschiebt dort bei 48-kHz-Gesangsquellen dieselben Werte wie beim Import: #14 133 → 121 BPM, off 0,779 → 0,686 s; #10 off +5 ms.
- IMP2B hat das nicht geprüft. Die Forderung „Wege ohne Import-Tempo bitgleich zur Basis“ ist für diesen Weg nicht erfüllt.
- Die SPK-Läufe in r4660 (4.66 mit IMP2) zeigen keine neuen FEHLER (spk1: nur das seit 4.64 bekannte „verfeinern-verbessert-ziel“). Der Schaden ist also
  bisher nicht belegt, aber auch nicht ausgeschlossen: Kein SPK-Test prüft das Raster einer Gesangsquelle.

**M3 – rv1-test misst den Chor mit demselben schwachen Schätzer (Hüllkurve 5 ms) und ist dort zufallsabhängig.**
- Synthetisch fällt die **Basis** durch (2/61: 14/6, 23/17, 23/16), IMP2 nicht. Basis #10 mit t1 0,388 hat 4 Chor-FEHLER: Versatz 26/17, dadurch
  Schwankung σ 15,3 ct und Formant in falscher Richtung, weil ein falscher Versatz falsch ausrichtet.
- Bei IMP2 steht auch in rv1 „ohne NaN%“ (dieselbe 0/0-Stelle).
- IMP2B hat nur chr2-test korrigiert und die rv1-Chor-Zeilen als „gehören nicht zum Vergleich“ abgetan. rv1 nutzt immerhin die Puffer-Rate, die 5 ms
  Glättung und die NaN-Stelle bleiben aber. Das ist zugleich ein starker Beleg für (1): Der Messfehler schlägt in beide Richtungen aus.

### LEICHT
**L1 – Die Gegenprobe Basis #10 / t1 0,388 ist nicht „zahlengleich“ wiederholbar.**
- Zwei eigene Läufe ergeben beide d2Max 0,1435, Quelle 0,1754, Verhältnis **3,93** und Sprung 0,1857. IMP2B hatte 0,1102 / 0,1679 / 4,05 / 0,0757 (= IMP2).
- Auch „Stück 15“ unterscheidet sich: quelle „gewechselt“ statt „gleich“. Die Fehlerart ist gleich: Knacken an Schnitt 13, sh 1 ms, 31 Stücke, Raster 24/31.
  Der Schluss hält also, die Formulierung „zahlengleich“ nicht.
- Die normalen rv1-Läufe sind deterministisch, bei mir identisch mit denen von IMP2B.

**L2 – Rate-Unabhängigkeit nur bis zur Kante der Schätzung.** Die Spanne bei 126A beträgt 0,33 BPM (22,05k 126,29 · 48k 126,62 · 96k 126,30), das
±0,5-Ziel ist erfüllt. Das gerundete Projekt-Tempo kann trotzdem je nach Rate abweichen (126 oder 127). Ursache ist die Unstetigkeit der
Gesangs-Schätzung (Zusatzfall 3), nicht imp2Down (Abweichung −70 dB).

**L3 – Die Test-Kopie korrigiert die Rate nur für den Versatz.** YIN und das Formant-Band rechnen weiter mit SR = 44 100: Das Band liegt real bei
326–3 809 Hz statt 300–3 500 Hz. Für die Verhältnis-Messung ist das harmlos, und der Kopf schreibt richtig „für Versatz und Ausrichtung“.
Der Bericht („uses the buffer's sample rate“) ist an dieser Stelle zu allgemein.

**L4 – Ungenauigkeiten im Bericht.** Keine ändert den Schluss.
- „exactly plan × 48/44,1“: 13,5 gegen 13,06.
- „17 ms anderer Vorlauf“: Die erste Probe ≠ 0 liegt bei 96 769 gegen 95 545, also 25,5 ms.
- „#14 dieselbe Silbe“: In 4.66 verschiebt die Basis Stück 25/35 und IMP2 Stück 35/37. Der Beleg „dieselbe Silbe“ stammt aus Läufen auf 4.63
  (69/66 Stücke). Die Gegenprobe RV1_BPM=120,6 deckt den Schluss.

## Pflicht (index.html)
topdefs: Skripte 26, Namen 7474, doppelt 0, Syntaxfehler 0 · dupkeys: 0 doppelte Schlüssel · smoke: title SYNQUENZER, errors [] (`out/smoke.png`) ·
„MS 2000“ 1× · „^  live: true,“ 1× · VERSION 4.66.0 (= basis.html).
Neue Wörter gegenüber basis.html: 18, nur Bezeichner und Fachwörter des IMP2-Blocks (z. B. imp2Down, Halbband, Drehfaktoren). Großgeschriebene Wörter,
die häufiger vorkommen, sind ebenfalls nur Fachwörter (Kaiser 4 → 6 = Fensterform, schon in der Basis). Keine Marke.
Keine Datensatz- oder Produktnamen in den neuen Dateien von IMP2B und der Prüfung (Suche nach Mustern, ohne Treffer).

## Empfehlung
- IMP2 bleibt draußen, bis der Gesang-Editor robust gegen die Lage des Takes ist (Knacken bei Kleinst-Verschiebung sh 1 ms, Marken 32 ↔ 31 bei 5 ms).
  Das ist auch ohne IMP2 nötig, wegen der 44,1-kHz-Geräte.
- Vor dem Einbau von IMP2:
  - die rv1-Chor-Messung wie in chr2-test-imp2b korrigieren (Kopie);
  - das Projekt-Tempo bei Gesang allein nicht stumpf runden (z. B. 120,5 bei „frage“ als Vorschlag 120/121 anbieten);
  - entscheiden, ob die Spektral-Seite das neue Raster bekommen soll.
