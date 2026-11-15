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

## Regression Spur B (reg/runb.sh, nacheinander, Logs in reg/)
spk5 24/24, spk5f, spk5p, spk6k, spk6, spk6p, spk6u, spk8s 14/0, spk10s 16/0, spk9u, spk9p, spk9poly, spk9f grün (Noten wie Basis).
spk4 (4 von 22), spk1 (verfeinern) und ki1 (3) rot – genau die vorbestehenden Prüfungen der Basis r4700; keine neue rote Prüfung.


## Nachbesserung nach der Prüfung (15.11.2026)
Vorfassung gesichert: `index.v1.html` (22328bc0), `block.v1.js`, `ins.v1.cjs`. Alles im SPKFIX-Block; Haken jetzt 8 Ein-Zeiler
(neu: `spkfixUid` in `newLayer`; geändert nur eigene Haken-Zeilen: mehr SPK6-Innereien an `spkfixS6`, `flush` an `spkfixDspMake`,
3 Funktionen mehr im Worker-Text). diff zur Basis 0 `<`. Sichtbar nichts neu (ein Hinweistext nennt jetzt die richtige Spur, s. 4).

| Befund (PRUEFUNG.md) | Behebung | Messung (Endfassung) |
|---|---|---|
| (1) Neu-Rechnen der Audio-Ebene dauert im langen Lied ~110× so lang (ganze Ebene) | Vor der Masken-Op: Fingerabdruck je Audio-Ebene (`pre6`). Danach den Zeitbereich der wirklich geänderten Masken-Streifen der Grundlage aus dem ↶-Schritt der Op lesen (`spkfixMaskRange`, Vergleich alt/neu je Streifen) und nur diesen Bereich neu rechnen (`spkfixPatch`, Verfahren wie SPK6 `patchA`: verschobene Noten, die hineinragen, ganz dazu, leise Ränder ± 0,5 s, 10 ms Blende, Vorlauf auf dem Rahmen-Raster der ganzen Rechnung). Ganz gerechnet wird nur, wenn die Ebene vorher schon nicht passte, ihre Noten sich geändert haben, mehr als 60 % betroffen sind oder die Grundlage außerhalb des bisherigen Audios klingt (Ebene wird länger) | 90-s-Lied, 3× „In Ebene“ aus der Audio-Ebene: **Median 307 ms** (421/147/307; Vorfassung 3135 ms unter gleicher Last, Prüfer 2230 ms; Basis 17 ms ohne Neu-Rechnen = falsch). Klang der Ebene danach **bitgleich zur ganzen Rechnung** der Vorfassung (max. Abw. 0, −341,6 dB). Herausgenommene Noten RMS 0, alles außerhalb bitgleich, 3× ↶ bitgleich zum Ausgangszustand |
| (2) Notenname falsch bei Abständen > 1,6 Halbtöne (146,83 → 47, 213,8 → 55, 98 → 54) | `spkfixName` zuerst: trägt EINE Spitze den Klang (jede andere Spitze bis 7,5·f < ¼, unter ihr bei f/2 und f/3 < 1/10), kommt die Tonhöhe aus ihr (Parabel im Log-Betrag), egal wie weit das Raster daneben lag (bis 13 Halbtöne). Sonst wie bisher (Fenster 0,3–1,6) | Prüfer-Sonde k-spkfix: 98 → **43** (98,16 Hz), 146,83 → **50**, 213,8 → **57** (56,5), 220 → 57, 277,18 → 61, 392 → 67, Vibrato → 57, Rauschen 57/57/57; obertonreich, schwacher Grundton, Dreieck, 587/880 unverändert (wie Vorfassung) |
| (3) Nachbau bleibt nach ↶ an einer neuen Ebene mit derselben Nummer hängen (auch nach Neuladen) | Jede neue Ebene bekommt eine Kennung `u11` (Zähler im Dokument, überdauert ↶/↷; eine neu angelegte L1 ist eine andere Ebene). Der Nachbau trägt die Kennung (`tk`), `SPK11.kl.get` gibt ihn nur zur Ebene mit derselben Kennung (Sitzung und Dokument); Ebene fehlt → nichts. Ablage im Dokument wird sofort gesichert (`flush`), nicht erst nach 2 s | Prüfer-Sonde p-spkfix: neue Ebene „Hoch“ nach ↶ → kein Nachbau (`klNeueEbene` false, Vorfassung true), nach Neuladen `klL1` false (Vorfassung true); eigener Nachbau im Dokument und nach Neuladen weiter da (spkfix-test) |
| (4, niedrig) umbenannte Original-Spur → neue Spur „Original“; Hinweis bei vollem Platz nennt „Original“ | Loop → Matrix vom Original nimmt jede Audio-Spur, die keiner Ebene gehört (auch umbenannt); bei vollem Platz bleibt es bei der eigenen Spur und der Hinweis „Keine freie Szene auf …“ nennt deren Namen (nur während dieses Schritts) | ploop2: Original → „Original“ Sz 1, umbenannt „Gitarre“ → „Gitarre“ Sz 2 (Vorfassung: neue Spur „Original“), Ebene „Tief“ → eigene Spur (Vorfassung: „Gitarre“), voll → „Keine freie Szene auf „Tief““, andere Hinweise unverändert |

## Regression nach der Nachbesserung (reg/runc.sh, nacheinander; Fassung 24a60ec5 = Endfassung ohne Sofort-Sichern und Raster-Vorlauf)
spk6k · spk6 · spk6p · spk6u grün · spk8s 14/0 · spk10s 16/0 · spk9u · spk9p · spk9poly · spk9f grün, Ausgaben **gleich wie die Vorfassung**
(Noten unverändert) · spk5 24/24 · spk1 nur die vorbestehende Prüfung „verfeinern-verbessert-ziel“ (wie Basis; sonst bis auf ms gleich) ·
smoke errors []. spk4 siehe LOG.
spk4: 3 rot von 22 (pflicht = Erwartung 4.60.0, a2-verfeinern-plus-1db, reg-ki1-test – alle vorbestehend wie Basis/Vorfassung; a3-nachbau-zeit
jetzt grün, Vorfassung 4 rot).

## Endfassung 92ce19ff (reg/rund.sh, nacheinander)
spkfix-test **11/11 zweimal** (EXTRA um spkfixMaskRange, spkfixPatch, spkfixUid ergänzt) · kgleich 90 s: 509/238/399 ms, **Median 399 ms**,
alle drei „bereich“, Klang bitgleich zur ganzen Rechnung (−341,6 dB) · k-spkfix (Prüfer): Namen wie oben, B1 A1 → A2 RMS 0 Rest bitgleich,
↶/↷ bitgleich · p-spkfix (Prüfer): `klNeueEbene` false, `klL1` false · ploop2 wie oben · smoke errors [].
Pflicht: topdefs 26 / 0 doppelt / 0 Syntax · dupkeys 0 · „MS 2000“ 1× · „^  live: true,“ 1× · VERSION 4.70.0 · diff 0 `<`, 202 `>`.

## Offen (nach der Nachbesserung)
- (1) Ganz gerechnet wird weiter, wenn die Ebene schon vorher nicht zur Grundlage passte (z. B. aus 4.70.0 ohne Neu-Rechnen), ihre Noten
  sich in derselben Op geändert haben, > 60 % betroffen sind oder die Grundlage über das bisherige Audio hinaus klingt.
- (2) Zwei gleich laute reine Töne in einer Note (Akkord aus Sinustönen) → kein „Spitzen“-Fall, es bleibt das Raster (wie bisher).
- (3) Nachbau einer Ebene aus einem Projekt vor dieser Fassung bekommt die Kennung beim ersten neuen Nachbau; ↶ hinter diesen Punkt
  zeigt ihn dann nicht mehr (die Ebene hatte dort noch keine Kennung).
