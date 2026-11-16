# SPKK – Spektral-Kleinfehler (OFFEN A8) auf 4.76.1 · Notizen

Basis: `rel-4761/index.html` (4.76.1, md5 e4dc1b95…, = `basis.html`). Endfassung `index.html` (nach der Prüfung, md5 05837e6a024fe34f85741136c21ff846; erste Fassung 804c037b → `index.vor-pruef.html`) = Basis + Block
`/* SPKK-BEGIN … SPKK-END */` direkt hinter `/* SPKFIX-END */` + 3 Ein-Zeilen-Haken `/* SPKK: … */` mit typeof-Schutz
(`ins.cjs`, bricht ab, wenn ein Anker nicht genau einmal vorkommt). diff zur Basis: 0 `<`, 54 `>` (3 Haken + 51 Zeilen Block). VERSION bleibt 4.76.1.
Nichts Sichtbares neu (kein Knopf, kein Text, kein Blatt).

## Ist-Messung VORHER (Basis 4.76.1)
SPKFIX (4.70–4.72) hat alle sechs A8-Punkte schon behoben; mit den SPKFIX-Sonden auf der Basis 4.76.1 nachgemessen:
`spkfix-test.mjs basis.html` → **11/11 OK** (spkfix-basis.out). Dazu neue Sonden:
| Punkt | Sonde | Basis |
|---|---|---|
| (1) Notenname „Noten finden“ 220 Hz | p2-name | 57 (richtig), alle 8 Töne richtig → **nicht mehr nachstellbar (SPKFIX)** |
| (1) Notenname „Überall finden“ (SPKFIX-Offen 2: Y = null → Raster) | p-finden | **rot**: 196 → 54/53/55 (3 Stücke), 146,83 → 48/49, 329,63 → 64/63, 233,08 → 58/57, 392 → 67/66/67, 261,63 → 60/60/59/60; obertonreich 220 → 57 |
| (1) dasselbe, 60-s-Melodie aus reinen Tönen | p-finden-zeit | **152 Vorschläge, nur 15 richtig benannt** (Soll 112); obertonreich 116/116 richtig |
| (2) Audio-Ebene neu rechnen (Masken-Version) | p16 + pseite (Worker) | A1 → A2, RMS 0,07527 = Quelle, Rest bitgleich, ein ↶ → **erledigt (SPKFIX)** |
| (2b) Container-Import alte Streifen | p16 | RMS 0,0723 → 0 → **erledigt (SPKFIX)** |
| (3) Nachbau im Dokument / nach Neuladen | pseite | true / true → **erledigt (SPKFIX)** |
| (4a) Loop → Matrix (Audio) eigene Spur | pseite | Bass → „Bass“ Szene 1 → **erledigt (SPKFIX)** |
| (4b) stiller erster Klangkorn-Ton | pseite + p-korn | Quelle 700 ms nach Laden da, sofort gefüttert; Ton, der VOR der Quelle angeschlagen wird: still bis die Quelle kommt, dann RMS 0,071 (Kern übernimmt die Quelle für wartende Stimmen, `if (!v.S && CS)`); kurzer Ton ganz ohne Quelle endet sauber → **erledigt, SPKFIX-Offen (5) nicht nachstellbar** |

## Ursache (der eine noch rote Punkt)
`finden` (SPK2 „Überall finden“) sucht auf einem Viertelton-Raster mit `vec()`, das je Oberton das Maximum über ±1 Bin nimmt
(N 4096 bei 48 kHz: 11,7 Hz = 0,9–1,4 Halbtöne bei 150–230 Hz). Bei einem fast reinen Ton trägt nur der Grundton → die Suche ist über bis
zu ±2 Halbtöne flach, Viterbi wandert darin, `segNotes` zerhackt die Note und benennt sie nach dem Raster. Die SPKFIX-Korrektur
(`spkfixName`) greift hier nicht, weil `finden` der Segmentierung `Y: null` gibt (Beleg: Zeile `… Y: null, K, df, fb, art});   /* SPK9 … */`).

## Änderung
- `spkkPk` (Haken in der Such-Schleife, nach `magsX`): je Rahmen aus den ohnehin gerechneten Spektren die allein tragende Spitze
  (größte Spitze im Band fa…fb, jede andere Spitze bis 7,5·f < ¼) → Frequenz per Parabel im Log-Betrag, sonst 0. Keine FFT dazu.
- `spkkF0` (Haken vor der Segmentierung): Treffer-Rahmen (`ok`) mit tragender Spitze bekommen deren Tonhöhe, wenn sie höchstens
  1,6 Halbtöne oder 2 Bins vom Raster liegt (so weit ist die Suche flach). Obertonreiche Klänge: keine Spitze trägt allein → unverändert.
  (Nach der Prüfung geändert: 2,6 HT / 3 Bins + Füllung der Rahmen ohne Spitze, siehe Abschnitt „Prüfung“.)
- Worker: `spk8WUrl` hängt `spkkPk, spkkF0` an den Worker-Text (Ein-Zeiler wie SPKFIX). Rückfall im Hauptfaden nutzt dieselben Funktionen.
- Erste Fassung (block.v1.js) rechnete eine zweite FFT über die Treffer-Rahmen (+30 % Zeit bei reinem Ton) → verworfen.

## Messung nachher (Index)
- p-finden: 220 → 57, 196 → 55, 261,63 → 60, 329,63 → 64, 233,08 → 58, 146,83 → 50, 392 → 67, je **eine** Note; obertonreich unverändert (57, f 220,00).
- 60-s-Melodie reiner Ton: **112 Vorschläge, 112 richtig** (Basis 152/15); obertonreich 116/116 wie Basis (gleiche Noten).
- Zeit „Überall finden“ 60 s (reiner Ton + obertonreich, bester von 2 Läufen abwechselnd): **Basis 1539 ms → Index 1448 ms** (reiner Ton 827 → 709 ms, obertonreich 762 → 739 ms; keine FFT dazu, weniger Stücke).
- spkk-test: **18/18 OK** (58 s, inkl. echter Spektral-Worker: Basis 196 Hz → 54/53/55, Index → 55). Zweiter Tempo-Lauf: Basis 1641 → Index 1574 ms.

## Tests
- `spkk-test.mjs <index> <basis>` (spkk-test.out/json): SPKFIX-Prüfungen (1)–(4) + Überall-finden-Namen + Gegenprobe Basis rot + Klangkorn-Nachfüttern + Tempo.
- Regression: `reg/finden9.mjs` (SPK9 Legato „Überall finden“) Basis und Index **gleiche Ausgabe** (3/3 Treffer). smoke errors [].
- Regression Spur B (Ausschnitt, Kopien der Tests in `reg/i` = Index und `reg/b` = Basis, `reg/runb.sh` + `runb2.sh`, parallel):
  spk6k ALLES OK · spk6 26 OK/0 · spk8s 14/0 · spk10s 16/0 · spk9u ok · spk9poly ok · spk9f ok · spk5 24/24 – **Index = Basis**
  (spk9u/spk9poly/spk9f/spk6k Ausgaben textgleich).
- spkfix-test (Basis) 11/11.

## Offen
- Zwei gleich laute reine Töne gleichzeitig (Akkord aus Sinustönen) → keine allein tragende Spitze → Raster wie bisher.
- Bass-Ebenen gehen in „Überall finden“ einen eigenen Weg (SPK3/SPK8), nicht geändert.
- SPKFIX-Offen (1) bleibt: ganze Ebene wird neu gerechnet, wenn sie vorher schon nicht passte, Noten sich in derselben Op ändern oder > 60 % betroffen sind.
- Nicht gefahren: spk4, spk1, ki1, spk6p/spk6u, spk9p (laut SPKFIX vorbestehend rot bzw. ohne Bezug zu `finden`).

## Pflicht (erste Fassung 804c037b – Endfassung siehe „Prüfung“)
topdefs: 26 Skripte, 7990 Namen, 0 doppelt, 0 Syntaxfehler · dupkeys: 0 · smoke: title SYNQUENZER, errors [] (smoke.png) · „MS 2000“ 1× ·
„^  live: true,“ 1× · VERSION '4.76.1' · Markenwörter wie Basis (keine neuen) · diff zur Basis 0 `<`, 34 `>` (3 Haken + 31 Zeilen Block).

## Funk
Nichts sichtbar neu. Merkbar anders: „Überall finden“ benennt reine/fast reine Töne (Pfeife, Sinus-Lead, gepfiffene Melodie, auch leicht
verstimmt, mit Vibrato, gebunden, tief) und Klänge mit fast reinem Ausklang (gezupft, E-Piano) richtig und zerhackt sie in unseren Testfällen nicht
mehr in mehrere Stücke – auch nicht, wenn Trommeln mitspielen. Die übrigen A8-Punkte waren mit 4.72 (SPKFIX) schon erledigt – auf 4.76.1 nachgemessen.

## Prüfung (SPKK-P, 06:09–06:20, Last 9–12)
Sicherung vorher: `index.vor-pruef.html` (= 804c037b), `block.v2.js`, `ins.v2.cjs`, `spkk-test.vor-pruef.mjs`. Prüfer-Sonden nachgefahren
(`pruef/p-fall.mjs`, `p-lang.mjs`, `p-worker2.mjs`; Kopien in `nach/` und `sonde/`).

**Befund 1 (mittel) – bestätigt.** Ist auf 804c037b (pruef/fall-i.out = eigener Lauf gleich): verstimmt +40 ct 9/11 (60 → 60/59/60/59/60),
−42 ct 8/9, legatoTief 16/20, legatoLead 14/16, padsTief 8/11 (Ton 45 → 43), 60-s-Legato 113/127 (14 zerhackt).
Ursache wie beschrieben: Fenster 1,6 HT / 2 Bins in `spkkF0` kleiner als der flache Bereich der Suche (±2–2,5 Bins) → Wechsel Spitze/Raster in der Note.
Behoben: Fenster 2,6 HT / 3 Bins.

**Befund 2 (klein) – bestätigt.** gezupft: Anschlag (obertonreich, Raster 56,25) vor dem fast reinen Schwanz (Spitze 57,0) → falsches
Vorderstück 56≠57@10.20 (0,2 s). Beleg Rahmen 141–150 (nach/dbg-run.mjs): Raster 56,25 bis Rahmen 149, ab 150 Spitze 56,99.
Behoben: Rahmen ohne eigene Spitze VOR dem ersten Spitzen-Rahmen einer Note (≤ 0,3 s, Raster < 1 HT daneben) bekommen dessen Tonhöhe;
die Füllung geht nicht über einen Anschlag mit Pegel-Anstieg ≥ 3 dB zurück (gleiche Regel wie segNotes). Erste Fassung nahm alle Fluss-Spitzen
als Anschlag – im Ausklang des gezupften Tons gibt es Fluss-Spitzen ohne Pegel-Anstieg (Rahmen 146, 149) → Füllung brach ab; deshalb die 3-dB-Regel.
NOTES/Block-Kopf ehrlich: gleichbleibende Obertöne unverändert (byte-gleich), abklingende werden im fast reinen Schwanz nach der Spitze benannt.

**Befund 3 (klein) – bestätigt.** Sinus + Rauschen + Kick: Kick-Rahmen haben eine zweite Spitze unten (50–150 Hz > ¼) → keine tragende Spitze →
Raster, dazwischen Spitze → Ton 64 in 5 Stücke, 55 in 4. Behoben: Lücke (≤ 0,3 s) zwischen zwei Spitzen-Rahmen gleicher Tonhöhe (< ½ HT) bekommt
deren Tonhöhe, wenn das Raster im Fenster liegt.

**Messung nachher (Endfassung 05837e6a):**
| Fall (pruef/p-fall, richtig/Stücke, Soll) | Basis | 804c037b | Endfassung |
|---|---|---|---|
| verstimmt +40 ct (7) | 2/11 | 9/11 | **7/7** |
| verstimmt −42 ct (7) | 3/14 | 8/9 | **7/7** |
| Vibrato / Vibrato verstimmt (7) | 2/11 · 3/14 | 7/7 · 7/8 | **7/7 · 7/7** |
| gezupft (7) | 7/10 | 7/11 | **7/7** |
| legatoTief N 8192 (12) | 3/12 | 16/20 | **12/12** |
| legatoLead (12) | 4/21 | 14/16 | **12/12** |
| padsTief N 8192 (7) | 3/16 | 8/11 | **7/7** |
| Rauschen + Kick (7) | 6/21 | 14/21 | **7/9** (+ Kick-Stück 0,49 s ohne Ton und Restschwanz 7,49 s nach Kick-Anschlag, beide wie Basis) |
| Gesang (7) | 4/15 | 7/7 | **7/7** |
| Dreieck (7) | 7/7, f 216,85 | 7/7, f 219,83 | 7/7, f 219,83 (Soll 220) |
| Säge, hohl, obertonreich + Trommeln | – | byte-gleich | **byte-gleich Basis** |
| mitBass (Prüfer-Fall, Lehrnote fängt den Bass) | 0/14 | 0/14 | 0/14 – Namen/Zeiten gleich Basis, nur fz anders (Testaufbau, kein SPKK-Bezug) |

60 s (p-lang, richtig/Stücke, zerhackt): gezupft Basis 126/149 (35) → **114/114 (0)**; E-Piano 99/212 (85) → **114/114 (0)**; Legato rein 24/135 (52)
→ **105/105 (0)** (105 = Höchstwert: 9× folgt 57 auf 57 gebunden ohne Lücke und ohne Phasensprung = physikalisch ein Ton); Sinus + Trommeln
60/196 (62) → **114/114 (0)**; obertonreich 114/114 = Basis.
Echter Spektral-Worker (p-worker2, Legato mit Vibrato): **10/10**, Konsole ohne Fehler; spkk-test Worker-Sonde 196 Hz → 55.

**Tempo:** `spkkF0` (neu: Füllung) 0,09 ms für 60 s (2813 Rahmen, Mikromessung). spkk-test „Überall finden“ 60 s (bester von 2, abwechselnd):
Basis 2412 ms, Index 1601 ms. p-lang 5 Fälle, abwechselnd b/i/b/i bei Last 11: 8425 / 5801 / 4649 / 6801 ms – reine Lastschwankung (gleiche
Rechnung „harm“ i1 823 ms, i2 1969 ms); die Änderung selbst kostet < 0,1 ms.

**Tests:** `spkk-test.mjs index.html basis.html` → **25/25 ALLES OK** (132 s; neu P1–P5: Prüfer-Fälle, Gegenprobe Basis rot, byte-gleich obertonreich,
60-s-Fälle). Regression `reg/i4` (Kopien, runb.sh i4): spk6k ALLES OK · spk6 ALLES OK · spk8s 14/0 · spk10s 16/0 · spk9u ok · spk9poly ok ·
spk9f ok · spk5 24/24; spk9poly/spk9f textgleich Basis, spk9u/spk6k nur Zeitangaben anders.

**Pflicht (Endfassung 05837e6a):** topdefs 26 Skripte, 7990 Namen, 0 doppelt, 0 Syntaxfehler · dupkeys 0 · smoke title SYNQUENZER, errors []
(smoke.png) · „MS 2000“ 1× · „^  live: true,“ 1× · VERSION '4.76.1' · Markenwörter wie Basis · diff zur Basis 0 `<`, 54 `>` · nichts Sichtbares.

**Offen (nach Prüfung):**
- Kick-Anschlag am Notenende erzeugt weiter ein kurzes Reststück nach Raster (rauschen 56≠55@7.49) – wie Basis; die Füllung geht bewusst nicht
  vorwärts über einen Anschlag (sonst würde ein neuer Ton an den alten gehängt).
- Gebundener Wechsel rein → obertonreich ohne Anschlag: Rahmen am Übergang können bis 1 HT/0,3 s dem Spitzen-Ton zugeschlagen werden
  (Grenze etwas früher); in keinem Testfall gesehen.
- Zwei gleich laute reine Töne gleichzeitig → Raster wie bisher. Bass-Ebenen eigener Weg (SPK3/SPK8). SPKFIX-Offen (1) bleibt.
