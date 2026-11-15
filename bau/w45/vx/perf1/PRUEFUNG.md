# PERF1 Schritt 2 – unabhängige Prüfung (index.html gegen basis.html)

Geprüft: `vx/perf1/index.html` (4.69.0 + PERF1A + PERF1B) gegen `vx/perf1/basis.html` (bytegleich mit `rel-4690/index.html`).
Nichts repariert. Eigene Skripte und Rohdaten: `vx/perf1/pruef/` (p1b.mjs Tipp-Messung, p1a.mjs Update mit Service-Worker,
p1f.mjs Render als erster Gebrauch, p1s.mjs Dauer je Vorbau-Schritt, serie.sh, r-*.json, a-*.json).

Messbedingungen: Chromium headless, 428×926, isMobile/hasTouch, CPU 4× gedrosselt, je Lauf ein neuer Browser, basis/index je
Lauf abwechselnd, alles nacheinander. Rechner stark belegt (Last 4,5–5,9 auf 4 Kernen) → Werte streuen ±20–30 %, darum Mediane.
Abtastrate im Kopflos-Chromium 44,1 kHz; für die Hauptreihe ist `synq.perf1b.sr=44100` vorab gesetzt (= „Rate bekannt“, wie beim
Bauer und wie am iPhone mit 48 kHz). ▶ wird 3 s nach „bereit“ getippt. CPU-Profil (0,5 ms Abtastung) 4 s ab dem Tipp; „Trommel-CPU“ =
Selbstzeit in `DrumSynth.buildSteps`/`makeIR` (Zeilen 26667–26737).

## Befunde

1. **PERF1B-Gewinn bestätigt (Median aus 5).** Sperrzeit (Summe über 50 ms) in 4 s nach dem Tipp: basis 573 ms
   (639/1238/392/573/395) → index 390 ms (669/636/385/390/274), also −183 ms (−32 %). Trommel-CPU nach dem Tipp 81,7 ms → 0,0 ms
   in 5/5 Läufen; Vorbau beim Tipp in 5/5 Läufen fertig (k = 8/8), `PERF1B.took = true`. Zeit vom Tipp bis die Trommel-Klänge bereit
   sind: 961 → 756 ms (−205 ms). Der Bauer meldete −121/−133 ms; Richtung und Größenordnung stimmen, mein Wert ist wegen der Last
   größer und unsicherer.
2. **Längste Aufgabe beim ersten ▶ bleibt.** 328 ms → 323 ms (Median). Das ist wie gemeldet `ensureAudio`, nicht die Trommel-Klänge.
   Für das Gefühl „der erste Tipp hängt“ ändert PERF1B also die Gesamtsperre, nicht den einen großen Brocken.
3. **Keine neuen langen Aufgaben vor dem Tipp.** Lange Aufgaben zwischen „bereit“ und Tipp, Summe je Lauf: basis Median 205 ms →
   index 146 ms. Jeder Vorbau-Schritt dauert bei 4× höchstens 11,7 ms (3 Wiederholungen, 9 Teile inkl. Anlage: 0–0,8 / 3,6–4,7 /
   4,4–7,7 / 8,7–9,5 / 5,9–6,1 / 5–5,7 / 0,7–1,1 / 9,6–11,7 / 1,6–8,2 ms; zusammen ≈ 30–53 ms). Damit erzeugt der Vorbau auch auf
   dem Safari-Weg ohne `requestIdleCallback` (dort `setTimeout(…, 50)`, Schritte laufen ohne Leerlauf-Prüfung) keine lange Aufgabe.
4. **Safari-Weg nachgestellt (ohne requestIdleCallback, n = 3).** Vorbau übernommen 3/3; Sperrzeit nach dem Tipp 587 → 481 ms;
   Trommel-CPU nach dem Tipp 69,9 → 0 ms. Gewinn bleibt.
5. **Startzeit unverändert.** „bereit“ 2 678 → 2 610 ms, `load` 3 306 → 3 214 ms (Median aus 5) – Rauschen.
6. **Klang beim ersten Gebrauch gleich (Video/Audio-Render vor jedem ▶).** 8-Takt-Song, `vvRenderAudio()` als erste Audio-Aktion,
   je 2 Läufe: index übernimmt die vorgebauten Puffer (`took = true`). Pegel L/R: basis 0,10683/0,10484 und 0,10681/0,10473,
   index 0,10661/0,10488 und 0,10685/0,10455 (Abweichung ≤ 0,2 %, innerhalb der Zufalls-Streuung). Die festen Klick-Puffer 0, 2, 3
   sind bitgleich (Summe 2,20168 / 4,07181 / 22,22717), die Zufallspuffer gleich lang, gleiche Kanäle und Rate. Renderzeit
   3,50/3,59 s gegen 3,50/3,59 s. Keine Fehler.
7. **Erster Start mit anderer Abtastrate: kein Gewinn, kein Schaden.** Ohne gespeicherte Rate (48 kHz angenommen, Gerät 44,1 kHz):
   `took = false`, alter Weg, 1 Lauf ohne Auffälligkeit; die Rate wird gespeichert. Verloren sind nur ≈ 30–50 ms Leerlauf-CPU (4×)
   und ≈ 1,4 MB. Alle Gewinn-Zahlen des Bauers und meine Hauptreihe gelten für „Rate bekannt“; dass das iPhone beim allerersten Start
   48 kHz hat, ist nicht gemessen.
8. **PERF1A-Gewinn bestätigt – auch mit Service-Worker.** Neu gegenüber dem Bauer: mit der aktuellen Online-`sw.js` (`synq-app-2`,
   von Hand registriert auf http://127.0.0.1, Scope /Synquenzer/, Seite davon gesteuert), Plattenspeicher-Profil, Server mit
   `max-age=600` + ETag. index: beim Update 1× 200 (Vorlauf, `cache-control: no-cache`) + 1× 304 (Neuladen), Adresse danach `/`,
   nächster Start: 0 Abrufe, sofort 4.69.1. basis: 1× 200 unter `?v=4.69.1`, **nächster Start zeigt noch 4.69.0** (aus dem
   Browser-Zwischenspeicher, auch durch den Service-Worker). Der Nebenbefund aus Schritt 1 gilt also auch mit Service-Worker, und
   PERF1A behebt ihn.
9. **FEHLER (PERF1A): Rückfall lädt mitten in der Wiedergabe neu.** Scheitert der Vorlauf spät (alte Fassung, Netzfehler, oder
   60-s-Zeitgrenze), springt `vwReload` sofort auf `location.replace(…?v=…)`, **ohne `vwIdle()` erneut zu prüfen**. Geprüft
   wurde `vwIdle()` nur vor dem Vorlauf. Messung: normale Adresse antwortet erst nach 9 s mit 4.69.0, ▶ 4 s nach dem Auslösen getippt
   → Neuladen bei +9,26 s, beim `pagehide` war `R.playing === true`. basis wechselt in derselben Lage nach +31 ms, also bevor
   getippt werden kann. Derselbe Weg überspringt die Aufnahme-Sperre (`rec.state` steht nur in `vwIdle`): eine laufende
   Gesangsaufnahme würde abgebrochen (aus dem Code abgeleitet, nicht gemessen). Das Zeitfenster ist so lang wie der Vorlauf, also bis
   60 s (vorher ≈ 0–3 s). **Vor der Freigabe beheben.**
10. **Risiko (PERF1A): veralteter Zwischenstand kostet einen Download mehr.** Liefert die normale Adresse noch die alte Fassung
    (version.json schon neu, Seite am Rand-Zwischenspeicher noch alt), lädt index die Seite 2× ganz (alter Vorlauf + `?v=`):
    hier 2 × 9,01 MB = 17,2 MB, real ≈ 2 × 2,9 MB gzip. basis lädt sie 1×. Der nächste Start ist in beiden Fassungen noch alt. Wie oft
    das bei Pages direkt nach dem Hochladen vorkommt, ist hier nicht messbar.
11. **Wettlauf (PERF1A, gering).** Kommt während des Vorlaufs oder während `go()` auf Leerlauf wartet eine zweite VW-Prüfung, nimmt
    sie mit dem zweiten Versuch (`o.n = 2`) den alten `?v=`-Weg und bricht den Vorlauf ab. Beobachtet, als die eigene
    Start-Prüfung der App (4 s) in meinen Vorlauf fiel: `?v=` bei +2,9 s, nächster Start alt (`pruef/a-index-wettlauf.json`). Im Alltag
    nur bei einer zweiten Prüfung im selben Fenster (Rückkehr nach > 60 s, `pageshow` aus dem Zurück-Cache). Nicht schlechter als basis,
    aber dann ohne Gewinn.
12. **Hinweis (PERF1A): späteres Neuladen, kurzer Speicherberg.** Das Neuladen kommt jetzt erst nach dem Download, im Erfolgsfall erst
    bei Leerlauf. Bis dahin bleibt die App bedienbar. `r.text()` hält die 9-MB-Seite kurz als Zeichenkette (≈ 18 MB, zwei Byte je
    Zeichen). Bei 1× gab es im Vorlauf keine lange Aufgabe (≥ 50 ms). Bei 4× und am iPhone ist das nicht gemessen.
13. **Pflicht auf index.html.** topdefs: 26 Skripte, 7 613 Namen, 0 doppelt, 0 Syntaxfehler · dupkeys: 0 · smoke: errors []
    (`pruef/smoke-pruef.png`) · „MS 2000“ 1× · „^  live: true,“ 1× · `const VERSION = '4.69.0';` 1×, also unverändert · Diff basis→index:
    62 Zeilen neu, 0 entfernt oder geändert · PERF1C nicht enthalten (0 Treffer), wie gemeldet.
14. **Andere Funktionen beim ersten Gebrauch.** PERF1 berührt nur `drumBufsStep` (Haken) und `vwReload` (Haken). `DRB` wird sonst
    nirgends benutzt. Der Video-Wechsel auf die Offline-Umgebung behält `AU.drumBufs`, und der Video-Weg ist in Befund 6 geprüft.
    Spektral-Seite, Remix, Gesang aufnehmen, Projekt laden/speichern und Worklets habe ich aus Zeitgründen nicht selbst neu
    durchlaufen. Laut `regression.log` des Bauers sind vx1 61/61, mtx3 51/51, spk6 und imp1 grün, und es gibt keinen Codepfad
    dorthin. Offline-Start: `sw.js` unverändert, der Offline-Weg ist nicht betroffen. Aufnahme siehe Befund 9.

## Urteil

- **PERF1B: behalten.** Der Gewinn ist bestätigt (Sperrzeit nach dem ersten ▶ −183 ms, Trommel-CPU nach dem Tipp 82 → 0 ms). Es gibt
  keine neuen langen Aufgaben und der Klang ist gleich.
- **PERF1A: Der Gewinn ist bestätigt (auch mit Service-Worker), aber so nicht freigeben.** Befund 9 (Neuladen während Wiedergabe
  oder Aufnahme im Rückfall) muss behoben werden. Befund 10 ist ein Abwägungs-Risiko. Am iPhone bleibt zu prüfen: Update bei offener
  App, dann nächster Start vom Home-Bildschirm mit derselben neuen Fassung; Datenzähler ≈ 1× Dateigröße.
