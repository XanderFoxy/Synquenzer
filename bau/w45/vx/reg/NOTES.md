# REG – Regression aufräumen (OFFEN-1611 A20)

Ziel: jede Auslieferung schneller und eindeutig prüfen – ohne A/B-Nachlauf von Hand. Reines Werkzeug-Paket: an der App (index.html) wird
nichts geändert, Basis rel-4761/index.html (md5 e4dc1b95…, VERSION 4.76.1) nur gelesen. Originale in vx/r4760, vx/perf2 und alle Test-Originale
unverändert; geänderte Tests liegen als Kopien in vx/reg/tests/.

Aufruf: `vx/reg/run.sh <index.html> [<vorher.html> = rel-4750] [<ausgabe-ordner>]` · `SPUREN=n` (Standard = CPU-Zahl) · `NUR="spk4 beg1"` ·
`SOLL_VERSION` (Standard = VERSION aus der Datei). Ergebnis: `<ordner>/ERGEBNIS.md` (Tabelle alt r4760 / neu je Test), `<ordner>/zeit.txt`
(Start/Ende, Gesamt, Last), je Test `<name>.log`, `<name>.json` (Urteil, Zahlen, Last), bei Wiederholung zusätzlich `<name>.lauf1.log`.

## 1. Ist-Messung vorher (r4760, 4.76.0, 16.11. 01:19–01:49)

| | r4760 |
|---|---|
| Aufbau | 4 feste Spuren (A Gesang/Import, B Spektral, C Matrix, D Rest) + spk8f/spk10p danach |
| Gesamtzeit | 1813 s (≈ 30 min); Spuren fertig nach A 774 s · B 1039 s · C 1113 s · D 1755 s → am Ende 11–16 min nur eine Spur aktiv |
| Summe Testzeit | ≈ 4680 s, davon doppelt: spk1 + ki1 + vx1 nochmals in spk4 (≈ 105 s) |
| Ergebnis | 9 von 55 Logs rot oder Exit ≠ 0: beg1 (55/59, Exit 1), clip1 (Absturz, Exit 1), fokus1 (44/7, Exit 1), ki1 (3 FEHL), mtx4 (117/118), spk1 (1 FEHL), spk4 (6 FEHLER von 23), voxr1 (79/83), zrl1 (2 FEHL) |
| Urteil | nur von Hand: „alles wie 4.75 oder besser … clip1-Absturz unter Last → Wiederholung 109/109; beg1 A/B 57/59 = 4.75“ (STAND 16.11. 02:05) – je Release ein A/B-Nachlauf (r4760/ab, ≈ 32 min) |

Dauer je Test (aus den Log-Zeitstempeln je Spur): `vx/reg/r4760-dauer.json`.

## 2. Ursachen (mit Beleg)

1. **spk4 „pflicht“ prüft gegen 4.60.0.** `spk4-test.mjs` Z. 83: `PF.version[0] === PF.version[1]`, vorher = `basis5.html` (4.60.0) →
   seit 4.61 immer rot. Beleg r4760/spk4.log Z. 18 `"version":["4.60.0","4.76.0"]`; r4660/r4740/r4750 ebenso.
2. **spk4 führt spk1, ki1 und vx1 ein zweites Mal aus** – ki1 sogar mit dem alten `ki/ki1-test.mjs` (quer-428/quer-370 rot), während Spur B
   `spk5/ki1-test-spk5.mjs` laufen lässt; beide schreiben `ki1-test.json` in denselben Ordner. Beleg: r4760/spk4.log `reg-ki1-test … ["quer-428","quer-370",…]`,
   aber r4760/ki1-test.json (vom späteren Lauf überschrieben) `quer-428 … "ok":true`. Doppelte Zeit ≈ 105 s.
3. **spk4 „a3-nachbau-zeit“ ist gar keine Zeit-Verletzung.** Alle Zeiten in der Grenze (va2 3613→3503, fm 2159→2480, pad 3984→3089,
   lead 3706→2988 ms; Grenze 1,3× + 0,3 s); rot nur durch `abstaendeGleich:false` (fm, lead) = zwei Läufe der Klang-Suche liefern verschiedene
   Abstände (Suche mit Zeitbudget → unter Last wechselnd; dasselbe bei `reg-spk3-test`/`nachbau-abstaende-besser`, STAND 15.11. 14:54 „Wackler“).
4. **zrl1 „schneller“ vergleicht gleichen Code.** Basis rel-4750 enthält ZRL1 schon (4.75) → Faktor 0,95/0,97 = Rauschen, kann nie stabil grün
   sein (r4760/zrl1.log Z. 10–11).
5. **beg1 „Eigener Block“ zählt die ganze Release.** Prüfung vergleicht index gegen basis.html und verlangt „BEG1“ in jeder geänderten Zeile außerhalb
   des Blocks – im Release-Lauf 575 Zeilen anderer Pakete (r4760/ab/ab.log: n76 575, n75 47 → beide rot). Sinnvoll nur im Paket BEG1.
   „Prüfung 5 – 5/4 ohne Stil“ ist auch auf 4.75 rot (ab.log 4× gleich) → bekannt (A12). „CPU … Spitze 83 ms“ und „Begleiter aus = Basis“
   nur unter Last rot (A/B bei Last < 4: grün).
6. **clip1 stürzt unter Last ab.** `clip1-test.mjs:146` liest `UI.pop.el`, bevor das Blatt nach dem Tipp offen ist → `TypeError … reading 'el'`
   (r4760/clip1.log), Wiederholung 109/109 (STAND 184).
7. **Long-Task-Grenzen 50 ms unter Last** (fokus1 7×, mtx4 1×, beg1 CPU) – ohne Last-Mitschrift nicht von echten Rückschritten zu trennen.
8. **Bekannte Rote ohne Kennzeichnung** (spk1 verfeinern, ki1 3×, voxr1 4×, spk4 a2/+1 dB, reg-spk2 seit ≤ 4.74) → jede Release musste von Hand
   gelesen werden.
9. **Feste, ungleiche Spuren** (Ursache für 30 min statt ≈ 20 min, s. §1).

## 3. Änderungen

Alles in `vx/reg/` (Kopien; keine Originaldatei geändert):

- `tests/spk4-test.mjs` (Kopie, 11 Diff-Zeilen): Hilfsdateien weiter aus `vx/spk4`; Standard-Teile ohne spk1/ki1/vx1 (laufen als eigene Tests);
  `pflicht` prüft VERSION gegen `SOLL_VERSION` (statt gegen basis5); `a3-nachbau-zeit` prüft nur Zeiten, die Gleichheit zweier Läufe ist eigene
  Prüfung `a3-nachbau-gleich-2laeufe` (Last-Klasse).
- `tests/zrl1-test.mjs` (Kopie): „schneller“ → `zerlegen-20s/3min-nicht-langsamer` (A ≤ B × 1,15, Last im Ergebnis), weiter Ergebnis-Gleichheit
  (SDR/Energie) und Speicher wie bisher.
- `tests/beg1-test.mjs` (Kopie): „Eigener Block“ nur mit `PAKET=BEG1`, sonst INFO-Zeile mit Zahl.
- `tests/clip1-test.mjs` (Kopie): `at()` fasst bis 5 s nach, wenn das Blatt noch nicht offen ist (nur bei TypeError null/undefined).
- `tests/lauf.mjs` (neu): startet einen Test, wertet jede FEHLER/FEHL-Zeile gegen `bekannt.json`: **bekannt** (Ursache + OFFEN-Nr.),
  **zeit** (Zeit-/Last-Prüfung) oder **rot**. Nur wenn ausschließlich Zeit-Prüfungen rot sind: **1× Wiederholung**; bleibt sie rot und lag die
  mittlere Last über der CPU-Zahl → **LAST** (gelb), sonst ROT. Absturz/Exit ≠ 0 ohne FEHLER-Zeile, fehlende Pflicht-Ausgabe → ROT. Last wird
  alle 5 s gemessen (Start/Max/Mittel je Lauf).
- `tests/bekannt.json` (neu): Regeln je Test mit Begründung; `reg-spk2/3-test` nur mit exakt der bekannten Fehlerliste (neue Fehler → rot).
- `tests/tabelle.mjs` (neu): `ERGEBNIS.md` mit alt (r4760: OK/FEHLER/Exit/Dauer) und neu (Urteil, Zahlen, Dauer, Last, Hinweise) je Test.
- `tests/pflicht.sh` (neu): topdefs, dupkeys, smoke, „MS 2000“ 1×, „  live: true,“ 1×, VERSION = Soll.
- `run.sh` (neu, Vorlage r4760): ein Job-Pool statt 4 fester Spuren, Spuren = `nproc`, längste Tests zuerst (Dauer aus r4760), dieselben
  Tests und Argumente wie r4760 (+ pflicht als Job), Gesamtzeit + Last in `zeit.txt`, am Ende Tabelle.

## 4. Messung nachher

(siehe unten, wird nach dem Probelauf eingetragen)

## 5. Tests

## 6. Offen
