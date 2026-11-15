# SPKFIX – Spektral-Kleinfehler (OFFEN A8) · Entscheidungen

Basis: `rel-4700/index.html` (4.70.0, = `basis.html`). Endfassung `index.html` = basis + Block `/* SPKFIX-BEGIN … SPKFIX-END */`
direkt hinter `/* SPK9-END */` + 7 Ein-Zeilen-Haken `/* SPKFIX … */` mit typeof-Schutz (`ins.cjs` bricht ab, wenn ein Anker nicht genau
einmal vorkommt). diff zur Basis: 0 `<`, nur `>`. Kein Knopf, kein Blatt, kein Text auf der Seite neu.

## Die sechs Fehler

| # | Fehler | Basis (Sonde) | Behebung | Endfassung |
|---|---|---|---|---|
| 1 | Audio-Ebene nach Masken-Änderung nicht neu gerechnet | „In Ebene“ auf umgesetzte Ebene: Audio-id bleibt A1, neue Note RMS 0 (Quelle 0,075) | Kern-Op umhüllt: nach transfer, zerlegen, verfeinern, profi, zuordnen, restAuf, spk5Zerl, spk5Profi werden Audio-Ebenen, deren Masken-Fingerabdruck (SPK6 `msig`) nicht mehr zu `a6.hs` passt, ganz neu gerechnet (`make … full`) und mit `put6` gesetzt – **ohne eigenen ↶-Schritt**: der Schritt der Masken-Änderung hält den alten Zustand (alte Maske + altes Audio) | A1 → A2, neue Note RMS 0,07527 = Quelle; Rest bitgleich (max. Abw. 0); ↶ = A1 bitgleich, ↷ = A2, Zahl der ↶-Schritte gleich; im echten Spektral-Worker ebenso (A1 → A2) |
| 2 | Notenname am Balken 1 Halbton daneben | reiner 220-Hz-Ton → m 56 (207,96 Hz); 196/207,65/233,08/261,63/329,63 Hz alle −1 | `opt.seg9` umhüllt (nach SPK9): trägt der Grundton den Klang (2./3. Oberton < ½ der Grundton-Spitze), kommt f aus der Spitze des Grundtons (Parabel im Log-Betrag über die Rahmen der Note) statt aus dem Viertelton-Raster; nur wenn sich der Name dadurch um 0,3–1,6 Halbtöne ändert; fz wird mitgezogen | 220 → 57 (219,83 Hz), alle 8 Töne richtig; obertonreicher 220-Hz-Ton unverändert (57, 220,33 Hz) |
| 3 | Nachbau-Ergebnis nicht im Dokument | nach Neuladen `__spk11.kl('L1')` = false | `spk2KlRun` umhüllt (wie SPK11): Werte ohne Audio (`pcm`) per neuer Kern-Op `spkfixKl` nach `meta.spkKl[lid]` (außerhalb von `teil2`, damit ↶ fremder Schritte sie nicht löscht); `SPK11.kl.get` fällt auf `U.meta.spkKl` zurück (Sitzungs-Ergebnis geht vor); Ebene löschen räumt den Eintrag | im Dokument true, nach Seiten-Neuladen true |
| 4 | Loop → Matrix (Audio) nimmt die erste Audio-Spur | Ebene „Bass“ → Spur „Original“ Szene 2 | `imp1Step` merkt sich den Schritt-Namen; `imp1OrigT` fragt bei „Loop in die Matrix (Audio)“ zuerst `spkfixOrigT`: Audio-Spur mit dem Namen der Ebene (oder „<Ebene> Audio“ wie beim Szenen-Anlegen) mit freier Szene, sonst neue Audio-Spur mit dem Namen, sonst leere Zusatzspur; nichts frei → wie bisher. Original bleibt „Original“ | Original → „Original“ Szene 1, Bass → neue Spur „Bass“ Szene 1; alles ein ↶ (imp1Step) |
| 5 | erster Klangkorn-Ton nach dem Laden still | 700 ms nach `applyProject` Quelle nicht im Speicher; erster Ton: Quelle erst später (0 sofort gefüttert) | Haken am Ende von `applyProject`: `spkfixWarm` holt für jede Klangkorn-Spur die Quelle (`spk7Src`: Take aus dem Gerätespeicher + Spektren im SPK7-Worker) gleich nach dem Laden | Quelle nach 700 ms da, erster Ton wird sofort gefüttert (1) |
| 6 | Container-Import räumt alte Masken-Streifen nicht weg | gleiche Kennung, später dazugekommener Streifen: RMS 0,0723 bleibt nach Import | Haken in `importDoc`: vorher alle Schlüssel `spk:<id>:m…` löschen (`spkfixImpClean`), dann schreibt der Container seine | nach Import RMS 0 im alten Streifen, vorderer Teil 0,0751 wie im Container |

## Worker
`spk8WUrl` hängt `spkfixS6, spkfixImpClean, spkfixName, spkfixDspMake` an den Worker-Text (Funktions-Deklarationen, im Worker schon beim
Aufbau des Kerns da). Rückfall im Hauptfaden nutzt dieselben Funktionen. Der Kern-Haken in `spk1DspMake` ersetzt die Bindung `op` durch die
Hülle (`on` ruft `op` beim Namen) – kein vorhandener Ausdruck geändert.

## Kosten
- (1) Nur nach den acht Masken-Ops und nur wenn Audio-Ebenen da sind: Fingerabdruck der Grundlage (je Grundlage einmal). Neu-Rechnen nur bei
  geänderter Maske: 6-s-Lied 0,34–0,49 s (im Kern-Test). Bei einem 3-min-Lied rechnet es die ganze Ebene (SPK6: erstes Anwenden 4–6 s); die
  Masken-Op wartet so lange (Statuszeile wie vorher, Abspielen läuft weiter im Worker).
- (2) Nur Summen über schon berechnete Spektren (Y) der Note, keine FFT dazu.
- (5) einmal je Projekt-Laden, asynchron.

## Offen
- (1) Neu gerechnet wird die ganze Ebene, nicht nur der Bereich der geänderten Streifen; für 3-min-Lieder wäre „nur geänderte Streifen“
  (wie patchA bei Noten) schneller.
- (2) „Überall finden“ (`finden`) gibt der Segmentierung keine Spektren mit (Y: null) – dort bleibt das Raster; Bass-Ebene (SPK8) eigener Weg,
  nicht geändert.
- (5) Spielt man in den ersten Zehntel-Sekunden nach dem Laden (bevor die Quelle da ist), ist dieser eine Ton weiter still; ein Nachfüttern
  laufender Stimmen im Worklet wäre der nächste Schritt.
- (3) Gespeichert wird der beste Versuch; „Mehr Versuche“ überschreibt ihn.

## Funk
Nichts sichtbar neu. Hörbar/merkbar anders: umgesetzte Ebenen klingen nach „In Ebene“/„Verfeinern“ gleich mit dem neuen Inhalt; Loop → Matrix
(Audio) einer Ebene landet auf ihrer eigenen Audio-Spur (neu angelegt, Name der Ebene).

## Tests
`spkfix-test.mjs <abs. index.html>` (Sonden in `sonde/`: `p2-name.mjs`, `p16.mjs` im Kern, `pseite.mjs` in der Seite) – 11 Prüfungen.
Auf basis.html sind die sechs Fehler mit denselben Sonden nachgestellt (siehe LOG.md).
