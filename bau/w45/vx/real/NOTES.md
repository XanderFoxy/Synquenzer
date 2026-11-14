# RV1 – Echttest mit echtem Gesang · NOTES (Stand Auftrag 1/2)

Datei: `vx/real/index.html` = basis5 (4.60.0) + RV1. Block `RV1-BEGIN … RV1-END` (Beschreibung) direkt nach `/* KI1-END */`; einzige Code-Stelle „RV1“
in `imp1Core` (läuft im Worker aus toString). VERSION/CHANGES unberührt, nichts beim App-Start.
Audio: freier Datensatz (3 echte Gesangsaufnahmen, mono 44,1 kHz, #1 33 s mit Noten-Annotation A1 = 59 Noten, #10 9 s, #14 12 s), liegt NUR in
`realvox/dl` (nicht unter vx, nicht im Repo). Test liest Dateien `<name>_<nr>.wav` / `<name>_<nr>_notesA1.csv` aus dem übergebenen Ordner.

Test: `node vx/real/rv1-test.mjs <abs index.html> <abs realvox/dl> [out.json]` (~100 s, `RV1_ONLY=1` nur #1). Weg wie Xander: Export-Blatt ›
„Audio/MIDI importieren“ › Datei-Wähler › Erkennen › „Als Gesang“ › Gesang-Editor (vx1rOpen) › Quantisieren/Verschieben › Chor „Pop modern“ (echt).
Läufe: `run1.txt` (Basis), `run3.txt` (Endstand), Zahlen `rv1-vorher.json` / `rv1-nachher.json`. Diagnose Node: `dbg/imp-q.mjs <index> <wav…>`.

## Behoben (RV1)
1. Import „Gesang allein“ kippte bei 48 kHz (Telefon-/Test-Browser dekodieren auf 48 kHz) auf „Mix“ ohne Frage: echte Männerstimme (Grundton
   114–175 Hz) streut ins Band 30–120 Hz; Bass-Anteil 0,026 (44,1k) bzw. 0,052 (48k: Herunterteilen auf 12 statt 11,025 kHz) gegen Schwelle 0,03.
   Jetzt: Gesang allein auch bei Bass < 15 % UND ≥ 1,5 % leisen Rahmen (−30 dB, Atem-/Phrasen-Pausen). Mischungen: leise Rahmen 0–0,1 %, Bass 53–58 %.
   #1: mix 115,7 ohne Frage → gesang 118,6 + „119 oder 59 / 237?“ (Raster-Treue der annotierten Einsätze: Rang 3,3 % → 0,8 %, bester Wert 119);
   #10: mix 114,4 → gesang 112 + Frage (= 44,1k-Ergebnis). imp1-test ALLE OK (48), Mischungen unverändert.

## Gemessen (Endstand, run3.txt) – 42/53 OK, Rest = Befunde unten
| Prüfung | #1 | #10 | #14 |
|---|---|---|---|
| Import: Quelle / Frage / Vorschlag | gesang / ja / 118,6 (119·59·237) | gesang / ja / 112 | gesang / ja / 132,6 (133·66) |
| Analyse (Worker) | 150 Stücke, 3,4 s | 56, 1,1 s | 69, 1,3 s |
| Einsätze ±40 ms (Stück-Anfang · Vokal-Beginn) | 39/59 · 48/59 | – | – |
| Tonhöhe ±50 ct (Stück-Median gegen Note) | 75/86, Median 7 ct | – | – |
| Silben ohne Spracherkennung | leer + Hinweis „Text: im Marken-Editor …“ | leer | leer |
| Quant. 1/8: Schnitte / 2. Ableitung max (Quelle) / auffällig | 149 / 0,057 (0,094) / 0 | 55 / 0,105 (0,296) / 0 | 68 / 0,034 (0,185) / 0 |
| Quant.: max Sprung / auffällig | 0,055 / 0 | 0,127 / 0 | 0,060 / 0 |
| Render nach Quant. | 279 ms | 167 ms | 168 ms |
| rechts (mehr Platz): Dehnung · Ton | 1,20× · 0 ct | (Fenster leer) | 1,18× · −2 ct |
| links 60 ms: Ausklang Vorgänger | 400 ms, max Abw. 1,1e-4 | 221 ms, 0,004 an der vorderen Naht | 216 ms bitgleich |
| Chor Pop echt (9 s): Versatz Plan/gemessen | uni 6/6 12/11,9 · oct-1 15/15,1 16/15,8 · st+2 9/32,5 17/40,3 | | |
| Chor: Schwankung σ / Formant Kopie 1–2 | uni 5,4 ct 1,48 % · st+2 16,7 ct 3,38 % · oct-1 2,9 ct 1,57 % (ohne echt ≈ 0) | | |
| Chor: Knack-Stellen (gegen Kopie ohne echt) | uni 0/0 · oct-1 0/0 · st+2 5/5 (bei 13,67 s, 14,62 s, 24,2 s; 0,004–0,007) | | |

## Befunde (groß, für Auftrag 2/2)
1. Übersegmentierung: 150 Stücke für 59 Noten (#1) – nur 56/150 Stücke beginnen an einer Note (37 %). Die Marken (wpDetect) setzen auch mitten in
   gehaltenen Vokalen (Vibrato-/Lautstärke-Wellen). Folgen: Quantisieren schiebt Teile mitten in einer Note, viele Stücke wollen dieselbe Rasterlinie
   (quantizeMarks: das weiter entfernte bleibt stehen → #1 94/150 auf dem Raster, 35 „Linie besetzt“, 14 Vorgänger-Sperre, 7 frei daneben).
   Weg: Marke nur bei Einsatz-Merkmal (Konsonant/stimmlos davor, Tonhöhen-Sprung > 70 ct, Pegel-Tal > 6 dB) – Tonhöhen-Noten (G2) als zweite Quelle.
2. Chor st+2 (Terz/Quart nach Tonleiter) aus echtem Gesang: gemessener Versatz 23 ms über Plan und σ 16,7 ct (uni/oct-1 passen). Verdacht: im echt-Weg
   verschiebt sich die Noten-Grenze der Harmonie (Intervall wechselt an anderer Stelle als ohne echt) → Hüllkurven-Versatz und Tonhöhen-Unterschied
   an Übergängen; dazu 5 kleine Knack-Stellen (2. Ableitung 0,004–0,007 gegen 0,0001–0,0016) in beiden st+2-Kopien an denselben Quell-Stellen.
3. Links-Verschieben: Ausklang des Vorgängers nicht in jedem Fall bitgleich – Abweichung an seiner VORDEREN Naht (#10: 0,004 bei 1 ms, Vorgänger
   selbst −88 ms verschoben; #1: 1,1e-4 bei 25 ms). Nicht gestaucht (Länge/Ton gleich), aber eine Aktion ändert ein Nachbarstück → Ursache im 'hyb'-Render prüfen.
4. Tempo bei #14 abhängig von der Abtastrate: 120,7 (44,1k) gegen 132,6 (48k) im Gesang-Weg (Herunterteilen 11,025/12 kHz → andere Silben-Spitzen).
   Frage kommt in beiden Fällen; Vorschlag sollte gleich sein (z. B. immer auf 11,025 kHz umrechnen) – ändert aber Mix-Ergebnisse minimal → mit imp1-test prüfen.
5. Spracherkennung offline nicht da (G9.rec = null): Stücke bleiben ehrlich leer; der Knopf „Text erkennen“ schließt den Editor und schickt in den
   Marken-Editor – kein erfundener Text, aber Rücksprung ins andere Blatt (Bedienung, kein Fehler).

## Test-Grenzen
- Knack-Index relativ (lautestes 1-ms-Fenster / Median der Umgebung) ist bei Stille/„echt“ (Rest × 0,12) unbrauchbar → absolut: 2. Ableitung an der Naht
  gegen beide Quell-Seiten (Stück-Anfang und Ausklang-Stelle des Vorgängers) ±20 ms; Chor gegen dieselbe Kopie ohne „echt“.
- Rechts-Verschieben: Ziel muss mehr Platz als in der Quelle geben (sonst wird gekürzt, nicht gedehnt); #10 Stück 6: Anker des Vorgängers liegt am
  Ende seines Stücks → Messfenster leer (kein App-Fehler).

## Pflicht (Endstand)
topdefs doppelt 0 / Syntax 0, dupkeys 0, smoke errors [] (`smoke-1.png`), „MS 2000“ 1×, „  live: true,“ 1×, Markenwörter = Basis (Zählung gleich),
VERSION unverändert, Diff zur Basis: RV1-Block + 5 Zeilen imp1Core + diag.quiet. Regression imp1-test (Kopie aus vx/imp, danach gelöscht; Lauf `reg/imp1.txt`) ALLE OK (48).
