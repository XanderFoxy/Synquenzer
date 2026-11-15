# PERF1 – NOTES

Schritt 1 = nur Messen und Planen. `index.html` ist bytegleich mit `basis.html` (4.69.0); neu sind nur Mess-Skripte unter `mess/`.

## Grenzen der Messung
- Chromium statt Safari; CPU-Drosselung 4× ist eine grobe Näherung (eher zu langsam), 1× eher zu schnell. Die Rechner-CPU war
  durch andere Läufe belegt → Mediane aus 3 Läufen; Streuung bei 4× ±10–15 % (bereit 2 203–2 898 ms).
- Lokaler Server ohne Netz-Drosselung: Netzzeit steht nur als Größe (MESSUNG §1), nicht in den Zeiten.
- Trace-Läufe sind durch den Trace ~25 % langsamer; dort zählen nur die Anteile.
- Block-Namen in `mess/bloecke.cjs` sind eine Näherung (innerster offener `-BEGIN`, sonst letzte Überschrift). Einige
  Bezeichnungen passen nicht (der Rumpf des Haupt-Skripts Z 27566 erscheint als „SQStore“, DrumSynth-Funktionen Z 265xx–267xx
  ebenso, „HM1-END“, „Ende“ = T1-Kern-Ende). Darum nennt MESSUNG die Funktionen mit Zeilennummer.
- Service-Worker lässt sich lokal nicht prüfen (registriert nur über https); das Update-Verhalten ist aus dem Code abgeleitet
  und am Gerät zu bestätigen. `Cache-Control: max-age=600` der Online-Seite ist angenommen, nicht gemessen.

## Wichtigste Befunde (kurz)
1. Je Fassung ~2,9 MB, aber **zweimal** geladen (`?v=` und danach die normale Adresse).
2. Start bei 4×: bereit 2,57 s; längste Aufgabe 1,22 s = Haupt-Skript übersetzen (925 ms) + Rumpf (397 ms); HTML lesen +
   dekodieren 0,74 s. Bei 1×: bereit 0,60 s, längste Aufgabe 0,22 s.
3. Erste Antwort auf ▶: 368 ms (4×) / 152 ms (1×); davon ~210 ms (4×) Trommel-Klänge, die erst beim ersten ▶ gebaut werden.
4. Leerlauf: Hauptthread 17–19 % belegt (4×), vor allem `renderPartBar` jedes Bild (erzwingt Layout).
5. Abspielen: Hauptthread ~85 % (4×), Compositor-Abgleich 2,2 s je 8 s → eigenes Paket PERF2.
6. Spektral/Video/Import/Gesang tun beim Start nichts, kosten aber Übersetzen (SPK allein −10 % wenn ausgelagert).

## Nächster Schritt
PLAN.md Top 5: zuerst PERF1A (Update einmal laden), PERF1B (Trommel-Klänge im Leerlauf), PERF1C (renderPartBar-Vorprüfung) –
klein, unsichtbar, niedriges Risiko. PERF1D (Auslieferung ohne Kommentare) und PERF1E (Spektral erst bei Bedarf) danach.
Nr. 12/13 im Plan nur nach Xanders Okay (berühren das erzwungene Update bzw. „eine HTML-Datei“).
