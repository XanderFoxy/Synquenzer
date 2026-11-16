# SPKK – Spektral-Kleinfehler (OFFEN A8) auf 4.76.1 · Notizen

Basis: `rel-4761/index.html` (4.76.1, md5 e4dc1b95…, = `basis.html`). Endfassung `index.html` = Basis + Block
`/* SPKK-BEGIN … SPKK-END */` direkt hinter `/* SPKFIX-END */` + 3 Ein-Zeilen-Haken `/* SPKK: … */` mit typeof-Schutz
(`ins.cjs`, bricht ab, wenn ein Anker nicht genau einmal vorkommt). diff zur Basis: 0 `<`, 34 `>`. VERSION bleibt 4.76.1.
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
- Worker: `spk8WUrl` hängt `spkkPk, spkkF0` an den Worker-Text (Ein-Zeiler wie SPKFIX). Rückfall im Hauptfaden nutzt dieselben Funktionen.
- Erste Fassung (block.v1.js) rechnete eine zweite FFT über die Treffer-Rahmen (+30 % Zeit bei reinem Ton) → verworfen.

## Messung nachher (Index)
- p-finden: 220 → 57, 196 → 55, 261,63 → 60, 329,63 → 64, 233,08 → 58, 146,83 → 50, 392 → 67, je **eine** Note; obertonreich unverändert (57, f 220,00).
- 60-s-Melodie reiner Ton: **112 Vorschläge, 112 richtig** (Basis 152/15); obertonreich 116/116 wie Basis (gleiche Noten).
- Zeit „Überall finden“ 60 s (reiner Ton + obertonreich, bester von 2 Läufen abwechselnd): **Basis 1539 ms → Index 1448 ms** (reiner Ton 827 → 709 ms, obertonreich 762 → 739 ms; keine FFT dazu, weniger Stücke).
- spkk-test: **17/17 OK** (49 s).

## Tests
- `spkk-test.mjs <index> <basis>` (spkk-test.out/json): SPKFIX-Prüfungen (1)–(4) + Überall-finden-Namen + Gegenprobe Basis rot + Klangkorn-Nachfüttern + Tempo.
- Regression: `reg/finden9.mjs` (SPK9 Legato „Überall finden“) Basis und Index **gleiche Ausgabe** (3/3 Treffer). smoke errors [].
- spkfix-test (Basis) 11/11.

## Offen
- Zwei gleich laute reine Töne gleichzeitig (Akkord aus Sinustönen) → keine allein tragende Spitze → Raster wie bisher.
- Bass-Ebenen gehen in „Überall finden“ einen eigenen Weg (SPK3/SPK8), nicht geändert.
- SPKFIX-Offen (1) bleibt: ganze Ebene wird neu gerechnet, wenn sie vorher schon nicht passte, Noten sich in derselben Op ändern oder > 60 % betroffen sind.
- Die volle Spur-B-Regression (spk4/5/6/8/9/10) wurde in den 45 min nicht gefahren; der Eingriff wirkt nur in `finden` (finden9 gleich).
