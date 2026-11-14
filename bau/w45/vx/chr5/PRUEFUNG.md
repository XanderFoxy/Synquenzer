# CHR5 – Prüfung (unabhängiger Prüfer, 14.11. 21:15–21:35)

Gegenstand: `vx/chr5/index.html` gegen `basis.html`. Der Bauer hat nichts eingebaut. Proben und Ausgaben des Prüfers liegen in `pruef/`.
Alle Läufe liefen einzeln nacheinander, nie parallel.

## Ergebnis in Kürze
- `index.html` ist byteweise gleich `basis.html` und gleich `vx/basis7.html` (4.63.0, cmp). Es gibt keinen CHR5-Block und keine Haken.
  Eine Verschlechterung der App ist damit ausgeschlossen. Das gilt für Zeiten, Knackser, Bedienung, hochkant und quer.
- Jede nachgemessene Zahl des Bauers lässt sich exakt wiederholen.
  - `chr3-pruef`: `pruef/pruef-nach.json` ist byteweise gleich `src/pruef-vorher.json`.
  - Alle fexp5-, fexp5b-, fexp5c-, fexp5d- und DAP-Werte sind bis auf die zweite Stelle gleich.
- Das Ziel ist nicht erreicht (+400: 9,25 %, −500: 5,99 %). Das hat der Bauer offen gesagt.
- Der Hauptbefund des Bauers stimmt: Der Fehler steckt im Noten-Kern, nicht am Rand.
  - Der Bauer hat das nur für +400 gezeigt. Der Prüfer hat es für −500 nachgerechnet, dort gilt es auch.
  - Für −500 tragen die Vorschläge in NOTES.md aber wahrscheinlich nicht bis 5 % (Befund 1).
- Befunde: 0 schwer, 3 mittel, 5 leicht.

## Pflicht (Prüfer, auf index.html)
| Prüfung | Ergebnis |
|---|---|
| topdefs | 26 Skripte, 7459 Namen, doppelt 0, Syntaxfehler 0 |
| dupkeys | 0 doppelte Schlüssel |
| smoke | errors [], Titel SYNQUENZER (`pruef/smoke-pruef.png`) |
| „MS 2000“ | genau 1× |
| „^  live: true,“ | genau 1× |
| VERSION | 4.63.0, einmal |
| Markenwörter | Datei byteweise gleich der Basis, also je Wort gleich |
| Datensatz- und Produktnamen | 0 in NOTES.md, LOG.md, `src/`, `tmp/` und `pruef/`; im App-Text gleich viele wie in basis7 (Zählung gleich) |

- In `reg/chr2.txt` steht 2× ein JSON-Feldname der chr2-Testausgabe, ein Kurzwort für „Stimme“. Er kommt aus dem vorhandenen Test und steht genauso in `chr4/src/run-chr2.txt`. CHR5 hat ihn nicht geschrieben.
- Hinweis, kein Befund zu CHR5: Der alte Test `dirigent-test/v3-mk2-marke.mjs` meldet FAIL bei „(b) ganze Datei“, weil die Datei 2× die Schreibweise mit Bindestrich enthält. basis7 und basis6 enthalten sie genauso. Die Pflicht-Prüfung „MS 2000 genau 1×“ ist erfüllt.

## Regression (Prüfer, nacheinander)
| Test | Ergebnis | Datei |
|---|---|---|
| chr2-test gegen basis2 | ALLE OK (82) in 114 s; die Zeilen „Knackser weniger“ sind erwartet. Die Zahlen sind gleich wie in `reg/chr2.txt`, nur Laufzeiten und Kennungen weichen ab. | `pruef/reg-chr2.txt` |
| vx1-test | 61/61, 31 s | `pruef/reg-vx1.txt` |
| spk6-test (byteweise gleiche Kopie, damit die Fotos des Bauers bleiben) | ALLES OK, 26 OK-Zeilen, kern-messwerte fails 0, 34 s. Läuft per Touch hochkant 428×926 und quer 926×428. | `pruef/reg-spk6.txt` |
| chr3-pruef | gleich `src/pruef-vorher.json` (cmp) | `pruef/pruef-nach.json` |

## Nachgemessen (Bauer → Prüfer)
| Fall | Bauer | Prüfer |
|---|---|---|
| Basis +400 / −500 / weich / hart | F 9,25 / 5,99 / 2,43 / 2,58 · hart T 2,1 ct | gleich (`pruef/fexp5.txt`) |
| Rand-Form vom Kern, EZ 30 ms (G 15 ms) | 9,27 / 5,99 / 2,46 / 2,59 | gleich |
| Rand-Form vom Kern, EZ 30 ms, mit G 3 ms | 9,10 / 5,98 / 2,48 / 2,83, hart 3,0 ct, Übergang 6,15 / 5,08 dB | gleich |
| G 3 ms allein (zum Vergleich) | – | 9,07 / 6,00 / 2,45 / 2,80: die Rand-Form macht es gegenüber G 3 ms allein leicht SCHLECHTER |
| EZ 20, Rampe 20, G 3 ms | hart 2,77 %, Glätte 1,24 | gleich |
| fexp5b, Hülle unter T1 | −500: 6,17 … 6,67 | 6,17 (Teilton-Maß) / 6,67 (Log-Frequenz); ±6 und ±10 dB geben dasselbe |
| fexp5c, G 3 ms nur ab 150 ct | weich 2,60, hart 2,80 | gleich, dazu natürlich 2,74 % und Glätte 1,16 |
| fexp5d, β 0,5 / 1 | +400: 9,06 / 9,00; −500: 6,06 / 6,24 | gleich |
| DAP, Teilton-dB | linear 4,78 / 6,20; bester Wert p 8, fn 9000: 4,62 / 6,69 | gleich |
| Orakel-Hülle +400 / −500 | 5,79 / 4,08 | gleich |
| G2 = G6 (Chor-Weg) | gleich | gleich, auch Rahmen für Rahmen die Tonhöhe (`pruef/ton.mjs`) |

## Befunde

### Mittel

**1. Das Ziel −500 ≤ 5 % ist nicht untersucht; die Vorschläge aus NOTES.md erreichen es nach den Messungen wahrscheinlich nicht.**
- Der Bauer hat die Aufteilung in Rand und Kern nur für +400 gemacht. Die Abschätzung „realistisch 7…8 %“ gilt nur für +400.
- Aufteilung −500 durch den Prüfer (`pruef/split.mjs`, 20-ms-Raster, 181 Rahmen):

  | Hülle | gesamt | Rand (±70 ms) | Kern |
  |---|---|---|---|
  | linear | 6,01 | 1,87 | 4,14 |
  | Orakel | 4,01 | 1,59 | 2,41 |

  - Mit dem Rand allein geht es nicht: Selbst mit Orakel-Rand bleiben 5,73 %.
  - Mit Orakel-Kern und heutigem Rand wären es 4,28 %. Der Kern müsste also von 4,14 auf höchstens 3,13 Punkte fallen.
- Größter Posten im Kern −500 (`pruef/vowel.mjs`): Note 5 „i“ (531 Hz) mit 1,20 von 4,14 Punkten. Ihr F1 liegt bei 300 Hz, unter dem neuen Teilton 1 (398 Hz).
  - „i“ kommt im Prüf-Take nur EINMAL vor. Das Hüllen-Gedächtnis je Vokal (Vorschlag 1) hat dafür keine Stützstellen.
  - In NOTES.md fehlt „i“ in der Vokal-Liste.
- Obergrenze von Vorschlag 1 (`pruef/vokalgedaechtnis.mjs`): exakte Pegel aller Noten desselben Vokals, Neigung und Pegel perfekt ausgeglichen, Maß wie pdb.mjs.

  | Fall | linear | Vokal-Gedächtnis | Rest |
  |---|---|---|---|
  | +400 | 4,88 dB | 3,29 dB | Note 3 „e“ bleibt bei 8,8 dB |
  | −500 | 6,22 dB | 4,28 dB | „i“ bleibt bei 10,5 dB, Note 8 „e“ bei 6,6 dB |

  - Zum Vergleich CHR4: Hermite mit exakter Steigung kam für −500 auf 4,04 dB. Beim Rendern gab das 6,00 % statt 5,99 %, also keinen Gewinn.
  - Für −500 ist deshalb von Vorschlag 1 kaum ein Gewinn im Formant-Maß zu erwarten.
- Folge für die Planung: Vorschlag 1 und 2 zielen auf +400. Für −500 fehlt ein Weg für F1 unter dem neuen Teilton 1 (fexp5b war schlechter). Das gehört vor dem nächsten Paket in die Ziel-Prüfung (NOTES Punkt 3).

**2. Der Grund für den hart-Anstieg ist als Tatsache berichtet, aber nicht geprüft. Die Probe des Prüfers erklärt nur etwa die Hälfte.**
- Bericht und NOTES sagen: „Ursache ist die hart-Kurve am Noten-Anfang“. Die Versuche des Bauers änderten aber nur die Hülle, G und die Rampe, nie die Kurve.
- Probe des Prüfers (`pruef/hartkurve.mjs`, `pruef/hartkurve.txt`): G 3 ms, und in den ersten und letzten K Rahmen jeder stimmhaften Strecke nimmt die hart-Kurve den Noten-Median statt der Stimme. Das Ideal z wird mit derselben Kurve gerechnet.

  | Variante | hart F | Ton | Übergang | Glätte |
  |---|---|---|---|---|
  | Basis (G 15 ms) | 2,58 % | 2,1 ct | 4,02 dB | 1,19 |
  | G 3 ms | 2,80 % | 3,0 ct | 3,61 dB | 1,14 |
  | G 3 ms, K 1 | 2,81 % | 2,8 ct | – | – |
  | G 3 ms, K 2 | 2,72 % | 2,7 ct | 3,48 dB | 1,16 |
  | G 3 ms, K 3 | 2,68 % | 2,4 ct | 3,46 dB | 1,12 |
  | G 15 ms, K 2 (ohne kleines G) | 2,57 % | 2,0 ct | 3,84 dB | – |

  - Die Kurve erklärt etwa 0,12 der 0,22 Prozentpunkte. Der Rest bleibt ungeklärt.
  - Die Voraussetzung von Vorschlag 2 („wenn hart bei 2,58 % bleibt“) ist damit nicht belegt.
  - K 3 läge allerdings unter der chr2-Grenze für hart (2,54 + 0,2 = 2,74).
- Eine solche Kurve ändert, wie „hart“ am Noten-Anfang klingt: Schleifer würden 20–30 ms lang nicht mehr eingerastet. Nach CLAUDE.md Regel 3 muss das vorher im Funk vorgeschlagen werden. In NOTES.md steht dazu „unsichtbar – keine Bedienung“; das trifft auf das Hörbare nicht zu.

**3. Das Ton-Maß sieht genau die Fehler großer Sprünge nicht; „Ton ±1 ct“ ist für −500 nicht nachweisbar.** (Das Mess-Werkzeug stammt aus CHR2/CHR3, nicht von CHR5.)
- `measure()` in `src/tmlib.mjs` zählt nur Rahmen mit |Abweichung| < 300 ct (`pruef/ton.mjs`).
- +400 (Ton 2,3 ct):
  - Die Rahmen, in denen die Chorstimme am Strecken-Ende noch auf der Original-Höhe steht (1,870 s und 4,365 s, je −400 ct), fallen heraus.
  - Gegen die bekannte Ziel-Kurve stehen 7 Rahmen auf Original-Höhe (`pruef/ton2.mjs`).
- −500 (Ton 0,9 ct) und −300: Es zählen nur 522 von 660 Rahmen. Die ganze letzte Note (3,655–4,335 s, 136 bzw. 138 Rahmen) fällt heraus.
  - Grund: YIN irrt sich auf dem IDEAL um eine Oktave nach oben (489,7 statt 245 Hz).
  - Im Ideal liegt Teilton 1 15,5 dB unter Teilton 2. Die Ausgabe selbst stimmt (YIN 244,3 Hz, `pruef/oct.mjs`).
  - YIN-Fehler des Ideals über 50 ct: −500 in 170 von 672 Rahmen, −300 in 173 von 673; bei den anderen Sprüngen 38–50.
- Zusatzfälle Basis (`pruef/shifts-base.txt`):

  | Sprung | +100 | −100 | +200 | −200 | +300 | −300 | +700 | −700 | +1200 | −1200 |
  |---|---|---|---|---|---|---|---|---|---|---|
  | Ton (ct) | 11,7 | 9,3 | 13,8 | 8,4 | 12,0 | 13,2 | 3,2 | 0,7 | 2,2 | 0,7 |
  | Formant (%) | 5,92 | 4,77 | 7,68 | 5,95 | 7,95 | 5,51 | 7,65 | 6,79 | 4,91 | 9,57 |

  - Die 8–14 ct bei ±100…300 kommen fast nur von den unverschobenen Strecken-Enden. Bei +100 sind das 10 Rahmen um −100 ct: 1,845–1,870 s und 4,350–4,365 s.
  - Bei Sprüngen ab 300 ct filtert das Maß dieselben Rahmen weg.
  - „Kleine Sprünge nicht schlechter“ gilt hier trivial, weil nichts geändert wurde. Die Ziel-Vorgabe „Ton ±1 ct“ verfehlt die Basis aber bei +400 und ±100…300, und bei −500 ist sie nicht messbar.

### Leicht

**4. Der Rand-Versuch (fexp5) wirkt nur an den Rändern stimmhafter Strecken, nicht an Noten-Grenzen innerhalb einer Strecke.**
- Gemeint sind Legato-Übergänge und das überbrückte „t“. Der CHR4-Vorschlag war „Rand-Rahmen übernehmen die Hülle des Noten-KERNS“.
- Gerade diese Grenzen tragen bei +400 den größeren Teil des Rand-Fehlers: 2,05 von 3,29 Punkten in 29 Rahmen. Auf die Strecken-Ränder entfallen 1,49 Punkte.
- Die Schlussfolgerung hält trotzdem. Auch eine perfekte Hülle in allen Rand-Rahmen senkt den Rand nur von 3,29 auf 2,91 (+400) und von 1,87 auf 1,59 (−500), also um höchstens 0,38 bzw. 0,28 Punkte.
- „Wirkungslos“ gilt also nur für den geprüften Teil. Der Gewinn wäre aber in jedem Fall klein.

**5. Die Aufteilungszahlen sind leicht zu klein.**
- Geteilt wurde durch 182 Zeilen inklusive der Zusammenfassungszeile; es sind aber 181 Rahmen. Außerdem zählt der Bauer 45 statt 46 Rand-Rahmen.

  | Hülle | Bauer | richtig |
  |---|---|---|
  | linear | 9,31 = 3,26 + 6,05 | 9,36 = 3,29 + 6,07 |
  | Orakel | 5,68 = 2,88 + 2,80 | 5,71 = 2,91 + 2,80 |

- Die Aussage ändert sich nicht.

**6. Die Uhrzeiten im LOG passen nicht zu den Dateizeiten.**
- LOG.md wurde zuletzt um 20:54:49 geschrieben, enthält aber Einträge mit 21:05–21:14. Beispiele:
  - „(R3) 21:13 spk6“: `reg/spk6.txt` ist von 20:54:02.
  - „(R1) 21:11 chr2“: `reg/chr2.txt` ist von 20:52:49.
  - Versuche „(4)…(7) 20:58–21:05“: die Skripte sind von 20:47–20:49.
- Die Reihenfolge stimmt, und die Tests liefen nachweislich nacheinander: smoke 20:50:37 → chr2 20:50:42–20:52:49 → vx1 bis 20:53:26 → spk6 bis 20:54:02.

**7. Die Tonhöhen in NOTES.md (Vorschlag 1) sind ungenau, und „i“ fehlt.**
- NOTES.md nennt „o“ 401/487 Hz und „e“ 330/435 Hz. Richtig sind 400/483 Hz und 330/432 Hz.
- „i“ (531 Hz, nur einmal) fehlt, siehe Befund 1.

**8. Die Versuche ändern nur den G2-Code (`g2s`).**
- Der G6-Chor-Weg (`modelRuns`/`renderMulti`) wurde in keinem Versuch mitgeändert. „G2 und G6 gleich behandeln“ ist damit nur für die Basis belegt, dort aber vollständig (Zahlen und Tonhöhe je Rahmen gleich).
- Wichtig wird das erst, wenn etwas eingebaut wird.

## Bewertung
- Die Entscheidung „nichts einbauen“ ist richtig und durch die Messungen gedeckt: Kein Versuch ist besser, ohne anderswo schlechter zu sein.
- Pflicht und Regression sind grün.
- Das +400-Ziel (≤ 6 %) liegt knapp über dem Orakel (5,79 %), ist also praktisch nur mit perfekter Hülle erreichbar.
- Für −500 (≤ 5 %) gibt es nach heutigem Stand keinen belegten Weg (Befund 1).
- Ehe das nächste Paket die Ziele angeht, sollten Ziele und Ton-Maß (Befund 3) neu festgelegt werden.
