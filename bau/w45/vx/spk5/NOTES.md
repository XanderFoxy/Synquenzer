# SPK5 – NOTES (Stand Auftrag 1/3: Zerlegen sichtbar + Farbstufen – fertig)

`index.html` = basis5.html (4.60.0) + Block `SPK5-BEGIN … SPK5-END` direkt nach `/* GD1-END */` (Quelle `spk5-block.js`) + 19 Haken „SPK5“.
Bau: `python3 einbau.py` (jede Ersetzung genau 1×, bricht sonst ab). VERSION/CHANGES unberührt.

## Ursache „Auswahl → Zerlegen → keine Ebene / kein Feedback“ (repro.mjs, Touch hochkant + quer)
Im Prüf-Browser entstehen Ebenen – aber: (1) Zerlegen ignorierte die Auswahl und rechnete immer das ganze Stück (iPhone, 3-min-Song ≈ 20–60 s);
(2) einziges Zeichen war die 24-px-Statuszeile, derselbe Knopf wurde sofort „■ Abbrechen“ → ein zweiter Tipp („passiert nichts?“) brach ab:
„nichts geändert“; (3) danach lagen die Ebenen unten in der Liste (hochkant Gesang/Rest außerhalb), die Tönung lag übers ganze Bild,
bei schon zerlegtem Stück entstand keine neue Ebene. → Kein Fehler im Rechenkern, sondern fehlende Bereichs-Wirkung + fehlendes Feedback.

## Was jetzt passiert
- Knopf zweizeilig: „Zerlegen / AUSWAHL“ (Bernstein) bzw. „Zerlegen / ALLES“; aria „Zerlegen: Auswahl|alles“; quer „AUSWAHL ▾“; Klappfenster-Titel
  „Nur die Auswahl trennen“ / „Ganzes Stück trennen“. Gilt für Zerlegen UND Profi-Trennung.
- Mit Auswahl: Kern rechnet nur die Streifen der Auswahl (Haken sA/sB im SPK1-Zerlegen) und mischt neu·w + alt·(1−w) mit dem Auswahl-Gewicht
  (weiche Kante wie die Auswahl) → außerhalb bitgleich wie vorher (gemessen: außen 0, Summe ohne Überlauf). Profi: nur die Modell-Stücke, die die
  Auswahl berühren (Demo: 2 von 4), Stücke eines angefangenen Laufs werden genutzt, der Lauf-Stand bleibt unberührt.
- Während der Rechnung: Bereich schraffiert + Bernstein-Rahmen + Balken „Zerlegen · Auswahl · Trennen 53 %“ (nur Leinwand, kein DOM).
- Danach: Tönung an, neue Ebenen + Rest 3 s hervorgehoben und in die Liste gerollt, Meldung über dem Spektrum (fester Platz) mit ↶ und ✕ (12 s),
  z. B. „Zerlegt: Drums · Bass · Rest (Auswahl) – kein Gesang gefunden“. Anteil < 2 % der Energie im Bereich = „nicht gefunden“; neu angelegte
  leere Ebenen fallen im selben ↶-Schritt weg. „S“ an einer neuen Ebene spielt sofort den Bereich (Auswahl) bzw. ab Position.
- Ein ↶ je Aktion: „Zerlegen (Auswahl)“, „Profi-Trennung (Auswahl)“, „Zerlegen“. Ein angefangenes Ganz-Zerlegen bleibt fortsetzbar.
- Farben (Ansicht ▾ → Farben): Glut (schwarz → rot → orange → gelb → weiß, neuer Standard) · Magma · Grün-Blau (wahrnehmungsgleich) · Graustufen ·
  Blau (bisher). Nur Farbtabelle (texSubImage2D bzw. CPU-Tabelle), kein neues Spektrum; `localStorage synq-spk5-farbe`. Tönung auf allen Stufen erkennbar.
- Test-API `SYNQUENZER.spk5` (farbe, lut, area, last, msg, run).

## Tests
- `spk5-test.mjs <abs index.html>`: ALLES OK, 17 Prüfungen, ~40 s (hochkant + quer 926×428/926×370, Touch, CPU gedrosselt für das Fortschritts-Foto).
- `spk5-profi-test.mjs <abs index.html> <abs ki/modell> <abs ki-ort/web>`: ALLES OK (Profi nur in der Auswahl, 2,4 s Rechnung, außen 0).
- Regression: `spk/spk1-test.mjs` ALLE OK; `ki/ki1-test.mjs` = Basis (dieselben 3 vorbestehenden FEHL wie basis5).
- Fotos: fotos/spk5-00 … 07 (Glut, Fortschritt, Ergebnis Auswahl, ehrlich „kein Bass“, alles, quer, Profi), spk5-10 … 14 (Farbstufen), repro-*.

## Offen / Hinweise
1. Doppeltipp-Schutz nur 0,12 s (Prellen) – ein echter zweiter Tipp bricht ab; die Meldung sagt das dann deutlich („abgebrochen – nichts geändert“).
2. Ganz-Stück-Profi läuft über den alten Weg (fortsetzbar); leere neue Ebenen fallen dort nicht weg, nur die Meldung sagt „nicht gefunden“.
3. Auftrag 2/3 (Noten im Takt mit Überblendung) und 3/3 offen.
