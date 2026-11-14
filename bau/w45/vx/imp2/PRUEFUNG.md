# IMP2 – unabhängige Prüfung (Tempo unabhängig von der Abtastrate)

Geprüft: `vx/imp2/index.html` (4.63.0 + IMP2) gegen `vx/imp2/basis.html` (4.63.0, = `vx/basis7.html`). Nichts repariert.
Alle Läufe einzeln nacheinander (4 Kerne, andere Agenten liefen mit; Zeiten deshalb als Minimum aus 3–5 Läufen).
Eigene Skripte und Läufe: `vx/imp2/pruef/` (gen.sh, faelle.mjs, kern.mjs, krumm.mjs, ganz.mjs, browser.mjs, flux-ons.mjs, rv1k/).
Eigene Audio-Fälle liegen außerhalb von vx (`realvox/imp2pruef`, mit `pruef/gen.sh` neu erzeugbar). Die echten Aufnahmen heißen hier #1, #10, #14.

## Kurzurteil
- **Das Ziel ist erreicht.** Das Tempo hängt nicht mehr von der Abtastrate ab. Es ist nirgends schlechter geworden als vorher.
  - Die Zahlen des Bauers stimmen genau. Mein Nachlauf von `imp2-node.mjs` ist bis auf die ms-Spalte zeichengleich mit `node-vorher.txt` und `node-nachher.txt`.
  - In 33 eigenen Fall-Gruppen (Raten 8–192 kHz, Tempo-Varianten, Rauschen, wenig Bass, Ausschnitte) ist IMP2 überall gleich (33/33), die Basis nur in 26/33.
  - Richtig sind mit IMP2 19 von 26 Gruppen mit bekannter Wahrheit, in der Basis 18 von 26. Die 7 falschen Gruppen sind in beiden Fassungen dieselben (alte Schwächen).
- **Ein mittlerer Fehler im neuen Code (Befund 1):** Eine nicht ganzzahlige Abtastrate liefert Unsinn. Heute führt kein Weg der App dorthin.
- **rv1-test 45/53 statt 48/53 bestätigt (Befund 2).** Keine der 4 neuen FEHLER-Zeilen kommt aus dem IMP2-Code.
  - #10: Der Test wählt eine andere Silbe. Dieselbe Silbe scheitert auch in der Basis, und zwar mit genau denselben Zahlen.
  - #14: Hier wählt der Test **dieselbe** Silbe. Die Begründung des Bauers („andere Stücke“) stimmt dort nicht.
  - #14, Ursache: das jetzt richtige Tempo 121 statt 133. Mit vorher eingetragenem Tempo 120,6 scheitert auch die Basis an dieser Silbe, genauso.
  - Die Begründung des Bauers für #10 stimmt. Seine Gegenproben haben aber beide eine falsche Silbe getroffen (Index statt Zeit).

## Pflicht (Ergebnisse auch im LOG.md)
| Prüfung | Ergebnis |
|---|---|
| topdefs | Skripte 26, Namen 7459, doppelt 0, Syntaxfehler 0 |
| dupkeys | 0 doppelte Schlüssel |
| smoke | `errors []` (`pruef/smoke.png`) |
| „MS 2000“ / „^  live: true,“ | je 1× (Basis je 1×) |
| VERSION | 4.63.0 (unverändert) |
| Markenwörter | je Wort = Basis; einzig „Kaiser“ 4 → 6 („Kaiser-Sinc“ = Fenster-Name; die Basis hat schon „Kaiser-Fenster“), keine Marke |
| Datensatz-/Produktnamen unter vx/imp2 | App 0; Prüf-Skripte finden Dateien per Muster; Name einer Umrechner-Bibliothek in NOTES.md/LOG.md des Bauers (Befund 6) |
| imp1-test | ALLE OK (48), 135 s (`pruef/reg-imp1.txt`) |
| rv1-test | Basis 48/53, IMP2 45/53 (`pruef/rv1-basis-1.txt`, `pruef/rv1-imp2-1.txt`), gleich wie beim Bauer |
| vx1-test | 61/61 (`pruef/reg-vx1.txt`) |

## Befunde

### 1. MITTEL – Nicht ganzzahlige Abtastrate: Stufe 1 bleibt auf Probe 0 stehen, Ergebnis ist Unsinn
- NOTES verspricht: „krumme Raten: 4096 Phasen gerundet“. Gemessen (`pruef/kern.txt`, `pruef/krumm.txt`):
  | Eingang | Basis | IMP2 |
  |---|---|---|
  | Sinus bei 44 100,5 Hz: RMS vor dem Pegeln | 0,3525 | **0,0042** |
  | Sinus bei 47 999,7 Hz | 0,3525 | **0,0045** |
  | Sinus bei 22 050,4 Hz | 0,3534 | **0,0000** |
  | #14 bei sr 48 000,5 | 121,3 Gesang, 2 Teile | **88,6 Mix, 1 Teil** |
  | #1 bei sr 44 100,001 | 118,6 Gesang | **Fehler „still“** |
  | Song 92 4/4 bei sr 48 000,001 | 92, 8 Teile | **91, 2 Teile** |
- Ursache in `imp2Rs`:
  - Bei krummer Rate gilt `P0 = 4096 = P`. Darum nimmt die Schleife den Schritt-Weg für genaue Raten.
  - Dort ist aber `num = 0`, also `di = dp = 0`. `n0` bleibt 0, und jede Ausgabe-Probe rechnet dasselbe Fenster am Dateianfang.
  - Gemeint war wohl die Bedingung `exact` statt `P === P0`.
- Ganzzahlige, ungewöhnliche Raten gehen den gerundeten Weg und funktionieren (`pruef/ganz.txt`).
  - Geprüft: 37 800, 44 099, 44 101, 47 999, 50 000 und 64 000 Hz.
  - Bei allen: 1 und 4 kHz ±0,1 dB, 7 kHz ≤ −57,7 dB, Klick genau bei 1000,00 ms.
- Warum nicht schwer: Heute ruft die App den Kern nur mit ganzzahligen Raten auf.
  - Import: `ggbDecode` liefert immer 48 000 Hz.
  - SPK1: `src.sr` aus einem AudioBuffer.
- Die NOTES-Aussage ist aber falsch, und jeder künftige Aufruf mit einer abgeleiteten Rate (sr × Faktor) bekommt still ein falsches Ergebnis.

### 2. MITTEL – rv1-test formal schlechter (45/53 statt 48/53): Ursache liegt im Gesang-Editor, die Begründung des Bauers stimmt bei #14 nicht
- Nachgemessen: genau dieselben Zeilen wie beim Bauer.
  - Neue FEHLER: #10 Stück 47 links/rechts, #14 Stück 52 links/rechts.
  - Neues OK: #1 „Einsätze ≥ 80 %“.
- Ich habe die Stücke über die Datei-Zeit zugeordnet (`τ = t·k − org` aus dem Test; Listen per `RV1_DUMP` in `pruef/rv1k/dbg-*`).
  | Fall | Silbe (Datei-Zeit) | Basis | IMP2 |
  |---|---|---|---|
  | #10, Wahl der Basis | 4,985 s | Stück 30 OK/OK | Stück **32** (RV1_K=32): OK/OK (Ausklang bitgleich 116 ms; 1,283×, −9 ct) |
  | #10, Wahl von IMP2 | 7,068 s | Stück **45** (RV1_K=45): **FEHLER/FEHLER**, gleiche Zahlen (Abw. 0,043 bei 162 ms; 1,422×, −27 ct) | Stück 47 FEHLER/FEHLER |
  | #14, Wahl beider | **9,742 s** | Stück 55 OK/OK | Stück 52 **FEHLER/FEHLER** (Abw. bei 245 ms; Dehnung 1,609× > 1,55) |
  | #14, Basis mit Tempo vorweg 120,6 (`RV1_BPM`, nur Prüfkopie) | 9,742 s | Stück 53 **FEHLER/FEHLER** (Dehnung 1,618×, Abw. 0,011) | – |
  | #10, Basis mit Tempo vorweg 112,13 | 7,068 s | Test wählt von selbst Stück 45 → **FEHLER/FEHLER** | – |
- Daraus folgt:
  - Die Verschiebe-Fehler an diesen Silben gibt es schon in der Basis. Sie hängen vom Tempo-Raster des Takes ab, nicht vom neuen Tiefpass.
  - Für den Nutzer wird #14 trotzdem sichtbar: Import, „Als Gesang“, dann Silbe bei 9,74 s schieben. Mit IMP2 ist das der normale Weg, vorher war es nur mit eingetipptem Tempo so.
  - Rechts-Verschieben: Der stimmlose Vorgänger wird 1,6× gedehnt.
  - Links-Verschieben: Der Ausklang des Vorgängers ist nicht bitgleich.
- Die Gegenproben des Bauers treffen andere Silben:
  - `RV1_K=30` auf IMP2 ist 4,703 s, nicht 4,985 s.
  - `RV1_K=55` auf IMP2 ist 10,294 s, nicht 9,742 s.
  - Sein Satz „#14 piece 52 (base: 55) … different pieces“ ist falsch: Es ist dieselbe Silbe.
- Das „+1“ bei #1 liegt auf der Kante.
  - Anfang bleibt 38/59.
  - Nur „Vokal-Beginn“ steigt von 47/59 (79,7 %) auf 48/59 (81,4 %). Grenze: 80 %.
  - Der Bericht „now passes (base 38/59)“ lässt das nicht erkennen.
- Für die Entscheidung:
  - Die Bedingung „nicht schlechter“ ist formal verletzt.
  - Sachlich ist IMP2 nicht die Ursache.
  - Sinnvoll wäre, rv1-test die Verschiebe-Silbe nach Datei-Zeit statt nach Index wählen zu lassen.
  - Den Verschiebe-Fehler bei Tempo-Raster 121 (#14, 9,74 s) und 112 (#10, 7,07 s) sollte VX2/VX3 als eigenen Fehler aufnehmen.

### 3. LEICHT – Chor aus #10 schlechter (außerhalb der 53, im Bericht nicht erwähnt)
- Bei `RV1_ONLY=10` prüft der Test den Chor an #10. Ergebnis IMP2: 4 FEHLER, Basis: 1.
  - Die Läufe des Bauers `run-rv1-b.txt` und `run-rv1-k10-30.txt` zeigen dasselbe.
- Stimme st+2, Kopie 2:
  - Versatz 26 ms statt Plan 17 ms (Basis 17/17).
  - Gegen den Lead 44 ms, Grenze 40.
  - σ 15,3 ct statt 6,4 ct (Grenze 8).
- Ursache nicht eingegrenzt.
  - Der Take liegt mit IMP2 um 5 ms anders (t1 0,383 → 0,388).
  - Basis mit Tempo vorweg (t1 0,384): Chor OK. Ein Versatz von 1 ms reicht also nicht aus, um den Fehler auszulösen.
- #14: Basis und IMP2 je 2 FEHLER. Das größte σ sinkt von 11,1 auf 8,4 ct.
- Der Lauf mit allen drei Aufnahmen prüft den Chor nur an #1, dort ist alles gleich.

### 4. LEICHT – Laufzeit +17 … 35 % je Import (im Worker), Speicher +84 kB je Sekunde Audio
- Browser-Worker (Chromium, Minimum aus 3, `pruef/browser.txt`):
  | Stück | Basis → IMP2 |
  |---|---|
  | 92 4/4 (148 s, 48 kHz) | 775 → 920 ms (+19 %) |
  | 120 6/8 (86 s) | 437 → 555 ms (+27 %) |
  | #1 (33 s) | 193 → 225 ms (+17 %) |
  | #14 (12 s) | 72 → 97 ms (+35 %) |
- Node, nur `down()` (`pruef/kern.txt`):
  | Eingang | Basis → IMP2 |
  |---|---|
  | 148 s bei 48 kHz | 54 → 141 ms |
  | 148 s bei 96 kHz | 50 → 196 ms |
  | 297 s bei 48 kHz | 55 → 299 ms |
- Die Angabe des Bauers (+17 %) stimmt, für kurze Stücke ist es eher mehr.
- Die Bedienung friert nicht ein, weil die Analyse im Worker läuft.
  - Ohne Worker läuft `imp1Core().analyse` am Stück im Hauptfaden, dann blockiert er etwa 150 ms länger.
- Zusätzlicher Speicher (gerechnet):
  - Zwischenpuffer 22 050 Hz plus Ausgabe statt bisher 12 000 Hz: +84 kB je Sekunde bei 48 kHz.
  - Ein 5-Minuten-Song braucht damit vorübergehend etwa 25 MB mehr im Worker (+35 % in `down()`).
- Laut CLAUDE.md haben Ladezeiten Vorrang. Der Vorschlag des Bauers (reelle FFT in `features()`, etwa −120 ms) sollte deshalb mitkommen.

### 5. LEICHT – Sperre bei 32 kHz Eingang nur −47 dB (Angabe „ab 7 kHz ≤ −49 dB“ gilt nur für die vier geprüften Raten)
- Sinus 15 kHz bei 32 kHz Eingang: −47,1 dB.
- Bei 22,05/44,1/48/96/192 kHz liegt alles ab 7 kHz bei ≤ −52,4 dB.
- Durchlass: bis 5 kHz ±0,1 dB überall (8–192 kHz). 5,5 kHz −5,8 dB, 6 kHz −42 dB.
- Zeitlage: Klick bei 1,000 s ergibt bei allen Raten 1000,000 ms, ohne Phasenversatz. Die Basis lag bei 192 kHz um 7 µs daneben.
- Praktisch ohne Folgen.

### 6. LEICHT – Bericht und Notizen
- **#10:** Die Aussage „112 ist wohl falsch, Bezüge zeigen 125–130“ hängt an der Einsatz-Quelle.
  - Meine eigenen Einsätze (Spektralfluss 100–8000 Hz, 5 ms, `pruef/flux-ons.txt`) habe ich an #1 geeicht: bestes 119,5, Annotation 119 auf Rang 0,8 %.
  - Damit liegt 112 für #10 auf Rang 10,4 % und 126 auf Rang 61 %. Am besten passt 167,5 ≈ 1,5 × 112.
  - Offener Punkt 2 des Bauers ist also nicht belegt.
- **#14:** Meine Einsätze stützen den Bauer, wenn auch schwach.
  - 120,6 liegt auf Rang 5,0 %, 132,6 auf Rang 17,8 %. Der alte 48-kHz-Wert war also schlechter.
  - Am besten passt allerdings 138–140 (nur 31 Einsätze in 12 s).
- **Produktname:** NOTES.md Zeile 31 und LOG.md Zeile 4 nennen die Umrechner-Bibliothek beim Namen. Die Regel verlangt keine Produktnamen unter vx.
  - Das Werkzeug selbst ruft schon imp1-test auf, der Bibliotheksname ist neu.
- **NOTES** versprechen krumme Raten (siehe Befund 1).

### Nebenbefund (nicht IMP2, schon in der Basis)
- Import-Blatt: Tippt man nach „Aus Gesang geschätzt“ den ½×-Vorschlag an, heißt es danach „… – 60 oder 60?“ mit zwei gleichen Knöpfen „60 BPM | 60 BPM“.
  - Basis: „66 oder 66?“, „66 BPM | 66 BPM“.
  - Das passiert hochkant und quer (`pruef/fotos/imp2p-import14-*.png`).

## Was ich zusätzlich geprüft habe (ohne Befund)
- **Eigene Fälle** (`pruef/faelle.txt`), jede Gruppe bei mehreren Raten, Basis und IMP2 nacheinander:
  | Fall | Basis | IMP2 |
  |---|---|---|
  | Raten 8/11,025/16/24/32/88,2/192 kHz, 7 Stücke: Spanne | bis 12,47 BPM (#14 bei 24 kHz 132,6) | ≤ 0,12 BPM |
  | Tempo-Varianten ×0,75–×1,3 (Mix + Gesang, 14 Gruppen) | #10×1,1 bei 48 kHz 138 statt 123,3; #14×0,9 bei 48 kHz 119,6 statt 108,6 | gleich je Rate, Verhältnis stimmt |
  | #1 + Rauschen −40 dBFS | 48/96 kHz: „Mix 115,8, 2/4“ (falsch) | 118,7 Gesang + Frage bei allen Raten (richtig) |
  | Mix mit wenig Bass (Hochpass 150/300 Hz) | wird „Gesang“ (falsche Taktart); 6/8@300: 80 gegen 160 je Rate | ebenso „Gesang“, aber gleich je Rate |
  | 20-s-Ausschnitte 92/120 | richtig | richtig |
- In allen Gruppen ist IMP2 nirgends falscher als die Basis.
  - Gleiche alte Fehler in beiden Fassungen: 6/8 bei 90 wird 12/8, 92×0,85 wird 12/8, Melodie×0,8 ergibt 153,6 (2×).
  - Die Teile-Zahl ändert sich nur, wo sich vorher die Rate auswirkte.
- **Randfälle** (`pruef/kern.txt`):
  - Länge 0, 1, 7 und 40 Proben, 384 kHz und 4 kHz: ohne Fehler.
  - Ein NaN verteilt sich nur auf 34 von 44 100 Ausgabe-Proben, in der Basis auf 47 750 von 48 000.
- **Browser**: Der Worker rechnet den neuen Code (`worker true`), die Ergebnisse sind gleich wie in Node.
- **Touch-Import #14** (WAV 44,1 kHz) bei 428×926 und 926×428, Basis und IMP2:
  - Blatt fragt „121 oder 60?“, die Basis fragt „133 oder 66?“.
  - Knöpfe 44 px hoch, nichts seitlich abgeschnitten, ½× antippen setzt 60,3.
  - Konsole leer.
- **Bedienung**: Nichts Sichtbares geändert, keine neuen Knöpfe. VX2/SPK8 sind nicht berührt (Diff 50 Zeilen, nur in `imp1Core`).
