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

Nachträge aus dem Probelauf (06:49–07:12):
- **Versteckte Umgebung (Ursache 10):** spk2/spk4-ui/spk4-rest/spk1/spk5/spk7/spk8/spk10 lesen `mess/*.f32` neben der index.html, spk2 zusätzlich
  `../basis2.html`. In r4760 lag das von Hand im Ordner. Im Probelauf fehlte es zuerst → spk4-ui/rest „Status 1“; die neue Wertung meldete
  das richtig als ROT („Exit ohne FEHLER-Zeile“). run.sh legt beides jetzt selbst an (mess aus r4660, md5 = r4760/mess).
- `bekannt.json` ergänzt: beg1 „Prüfung 6 … Ton für Ton wie live / klingt gleich“ = Zeit-/Last-Klasse (BEG1-Block 4.76.0 ↔ 4.76.1 identisch,
  r4760 grün, im Probelauf rot bei Last 14–36); spk4 `reg-spk2-test` mit zusätzlich `klang-abstand-bekannt` = Zeit-/Last-Klasse (Klang-Suche mit
  Zeitbudget, bei Last 30 alle 4 Klänge zweier Läufe verschieden).
- Neues Urteil **UNGÜLTIG (Last)** für Echtzeit-Tests (beg1, fokus1, mtx4, voxr1): bleiben sie ROT bei mittlerer Last > 2× CPU-Zahl, ist der Lauf
  nicht aussagekräftig – nicht grün, nicht bekannt, bei niedriger Last wiederholen. `WERTEN=1 node tests/lauf.mjs <name> <ordner> 0 -- true`
  wertet ein vorhandenes Log mit den aktuellen Regeln neu (ohne Lauf, ohne Wiederholung).

## 4. Messung nachher (Probelauf rel-4761, `vx/reg/lauf-4761/`, Start 06:47:51)

Last: 5,3 beim Start → 14 (06:55) → 36–48 (07:00–07:12) durch andere Agenten (4 CPUs). Alle Zeiten darum nicht mit r4760 vergleichbar.

| Test | alt r4760 | neu (Probelauf) |
|---|---|---|
| imp1 | grün 48/0 · 209 s | GRÜN 48/0 · 157 s · Last 8,7 |
| spk11b | grün 17/0 · 183 s | GRÜN 17/0 · 347 s · Last 19 |
| mtx3 | grün 51/0 · 142 s | GRÜN 51/0 · 557 s · Last 39 |
| rv1 | grün 53/0 · 160 s | GRÜN 53/0 · 770 s · Last 35 |
| vxr2 | grün 11/0 · 182 s | GRÜN 11/0 · 1045 s · Last 33 |
| lt1 | (ohne Urteil) · 545 s | INFO (A/B-Messung) · 1159 s · Last 29 |
| spk4 | ROT 17 OK / 6 FEHLER · 549 s | LAST 17 OK / 4: a2-verfeinern-plus-1db bekannt (A29); a3-nachbau-zeit (va2 8323 → 15431 ms …), a3-nachbau-gleich-2laeufe, reg-spk2 (+ klang-abstand-bekannt) = Zeit/Last · **pflicht jetzt OK** (Soll 4.76.1) · 847 s · Last 30 (neu gewertet, ohne Wiederholung) |
| beg1 | ROT 55/59 · 335 s | Lauf 0 (Last 14): Prüfung 5 bekannt + Prüfung 6 ×4 (Echtzeit) · Lauf 1 (Last 43): UNGÜLTIG (Last), 43 OK / 15 FEHLER (alles Echtzeit-Wiedergabe) · „Eigener Block“ jetzt INFO (662 Zeilen) |
| pflicht (kleiner Lauf) | – | GRÜN: Skripte 26, Namen 7988, doppelt 0, Syntaxfehler 0 · 0 doppelte Schlüssel · smoke errors [] · MS 2000 1× · live 1× · VERSION 4.76.1 |
| spk9f, spk9poly, vxr2lyr (kleiner Lauf) | grün | GRÜN (1/2/4 s) |

Bis 07:12 fertig: 8 von 55 Tests (+ 4 im kleinen Lauf); 4 laufen (fok2, spk11, spk6p, teil1), 43 warten. Der Pool läuft weiter (nohup) und
schreibt am Ende `lauf-4761/ERGEBNIS.md`, `zeit.txt` (Gesamtzeit) und `fertig.txt`. **Gesamtzeit und das Ziel „alle grün oder bekannt“ sind in
diesem Paket nicht belegt** – bei Last 30–48 auf 4 CPUs dauerten die Tests 2–6× so lange wie in r4760.

Erwartung bei Last wie r4760 (rechnerisch, nicht gemessen): Summe der Testzeiten ≈ 4580 s (ohne die doppelten spk1/ki1/vx1 in spk4),
4 Plätze, längste zuerst → ≈ 1150–1250 s statt 1813 s (−30 bis −35 %), weil keine Spur mehr 11–16 min allein läuft.

## 5. Tests

- Syntax: `node --check` für alle .mjs in tests/, `bash -n run.sh`.
- Kleiner Lauf (`probe-klein/`, 7 s): pflicht, spk9f, spk9poly, vxr2lyr → 4× GRÜN; Tabelle alt/neu erzeugt.
- Regeln geprüft: Muster für reg-spk2 mit `klang-abstand-bekannt` trifft die echte Zeile (true); falscher/abweichender Fehlerlisten-Text bleibt ROT.
- Absturz-Erkennung: abgebrochenes spk4 (fehlendes mess/) → ROT „Exit ohne FEHLER-Zeile“ (nicht still grün).
- Originale unverändert: vx/spk4, zrl1, beg1, clip1 (mtimes 13:30–21:12 vom 15.11.), keine neueren Dateien in vx/r4760 oder vx/perf2.

md5: run.sh fd0752bb · tests/lauf.mjs 0dd3f475 · tests/bekannt.json 0eb35ff3 · tests/tabelle.mjs 2a8f2158 · tests/pflicht.sh 0690bf7e ·
tests/spk4-test.mjs bd6b111e · tests/zrl1-test.mjs 1eac2401 · tests/beg1-test.mjs 0f7c9feb · tests/clip1-test.mjs 3dc2771c · rel-4761/index.html
e4dc1b95 (unverändert).

## 6. Offen

1. Voller Probelauf bei normaler Last (≤ 8) wiederholen: `vx/reg/run.sh rel-4761/index.html` (≈ 20 min erwartet) – erst dann Gesamtzeit und
   „alle grün/bekannt“ belegt. beg1 dabei prüfen: Prüfung 6 bei Last < 4 grün? (sonst echte Regel ändern statt Last-Klasse).
2. zrl1/clip1/ki1/spk1/voxr1/fokus1/mtx4 im Probelauf noch nicht gelaufen → Regeln dort ungetestet.
3. Last-Grenzen fest: LAST bei Mittel > CPU, UNGÜLTIG bei > 2× CPU (Echtzeit-Tests). Ggf. vor dem Start warten, bis Last < CPU (Schalter fehlt).
4. Gleiche Ausgabedateien mehrerer Tests im selben Ordner (spk1-test.json, ki1-test.json …) – mit dem Wegfall der Doppelläufe in spk4 kleiner,
   aber nicht ganz weg (z. B. spk3/spk2-Dateien). Sauber wäre ein Unterordner je Test (Tests lesen mess/ neben der Datei → Verknüpfung je Ordner).
5. spk4 „pflicht“ ist doppelt zur Pflicht-Prüfung von run.sh; könnte in spk4 per NUR wegfallen (≈ 10 s).

## 7. Prüfung (Prüfer-Befunde, nachgeprüft und behoben, 16.11. 08:57–)

Sicherung vorher: `vx/reg-sicherung-0858/`. index.html weiter unverändert (reines Werkzeug-Paket).

| # | Befund (Prüfer) | Nachgeprüft | Behoben |
|---|---|---|---|
| 1 | spk8f-Job verliert spk10p still (11 Fälle ungeprüft), Tabelle merkt es nicht | **echt**: lauf-4761/run.out `[eval]:1 … SyntaxError`, spk8f.log 2. Teil „ERGEBNIS 1 OK“, ERGEBNIS.md 54 Tests | run.sh berechnet die Fallliste vorab (`cd messb`), spk8f und **spk10p eigene Jobs** (`env -C`, kein verschachteltes `$(…)`); stderr jedes Job-Skripts → `<name>.err`, nicht leer = ROT; **soll.json** (Prüfungen je Test aus r4760) → weniger Prüfungen = ROT „nur k von n“; tabelle.mjs: erwarteter Test ohne Ergebnis = ROT „kein Ergebnis“ |
| 2 | Absturz/Zeitlimit hinter bekannter Zeile = BEKANNT, leerer Lauf = GRÜN | **echt** (lauf.mjs Z. 20) | Struktur-Fehler sind immer ROT, nie BEKANNT/LAST/UNGÜLTIG: Zeitlimit; Exit ≠ 0 (erlaubt nur `exit`-Code des Tests **mit** FEHLER-Zeilen und **ohne** Stacktrace – 13 Tests mit `process.exit(bad ? 1 : 0)`); Stacktrace; weniger Prüfungen als soll.json; leerer Lauf ohne muss-Regel; spk9p jetzt mit muss `^konsole []` |
| 3 | VERSION-Soll prüft sich selbst | **echt** (run.sh `SOLL_VERSION` aus `$F`) | run.sh bricht ohne `SOLL_VERSION` ab (Exit 2); pflicht.sh: Soll Pflicht (3. Arg.) **und** VERSION > VERSION der Vorgänger-Datei (`sort -V`); spk4-Kopie: ohne SOLL_VERSION rot |
| 4 | LAST-Grenze nach Gesamtlast (inkl. eigener 4 Tests) → Zeit-Rückschritte nie ROT | **echt** (Grenze Mittel > CPU bei 4 eigenen Tests auf 4 CPUs) | **Fremdlast** = Last − laufende REG-Tests (alle 5 s, /proc), Urteil LAST/UNGÜLTIG nur nach Fremdlast; im Pool **keine** Sofort-Wiederholung mehr (`WDH=0`), stattdessen am Ende **allein** wiederholen (`SOLO=1`): alle LAST/UNGÜLTIG und ROT-nur-in-Prüfzeilen bei Fremdlast > CPU → Urteil aus dem Allein-Lauf („GRÜN (allein)“ oder ROT/LAST mit Fremdlast), Pool-Ergebnis bleibt in `.json` → `pool` und `<name>.log`. Funktionale Prüfungen in Zeit-Regeln (beg1 Prüfung 6, spk4 klang-abstand) werden so allein nachgeprüft statt gelb |
| 5 | Gesamtzeit und „alle grün oder bekannt“ nicht belegt | **echt** | s. §8 (voller Lauf lauf-4761b) |
| – | spk12d ROT bei Last (Prüfer A/B 3×: beide 28/0) | echt Last | bekannt.json `spk12d.zeit` für `abtasten-aus-zauberstab-3min` (ms < 150 + Long Tasks) → Allein-Wiederholung |
| – | clip1-Kopie schrieb fotos/ und clip1-ergebnis.json ins Werkzeug (tests/) | echt (tests/fotos, 07:27) | `CLIP1_OUT` (run.sh: `<ordner>/o-clip1`) |
| – | r4760-dauer.json spk10p = −2 s | echt | 12 s (11 Fälle à ≈ 0,9 s + Start) |

Tests der Werkzeuge:
- `tests/selbsttest.mjs` → **17 OK / 0 FEHLER**: die vier Prüfer-Proben (spk1 Stacktrace nach bekannter Zeile, ki1 Zeitlimit, vxr2lyr `true`, spk9p ohne Ergebnis) jetzt ROT; spk10p „nur 1 von 11“ ROT, 11 → GRÜN; .err → ROT; beg1 Exit 1 mit bekannter Zeile + 58 Prüfungen → BEKANNT, 41 Prüfungen → ROT; Exit 1 ohne Regel → ROT; Fremdlast 1 → ROT, 9 → LAST; Echtzeit UNGÜLTIG nur bei Fremdlast > CPU; Struktur nie UNGÜLTIG; ALLEIN → „GRÜN (allein)“ mit Pool-Ergebnis; Tabelle: fehlender Test = ROT.
- pflicht.sh-Versionslogik (`selbsttest-pflicht/`, 6 Kleindateien): ohne Soll → „SOLL_VERSION fehlt“; Soll 4.76.0 bei Datei 4.76.1 → rot; vorher = gleiche Version → „neuer 0“; 4.76.10 > 4.76.9 → „neuer 1“, umgekehrt „neuer 0“.
- run.sh ohne SOLL_VERSION → Exit 2, kein Ordner angelegt.
- Probelauf lauf-4761 mit den neuen Regeln neu gewertet (`neu-gewertet-4761/`, WERTEN=1): spk10p jetzt ROT „kein Ergebnis“ (vorher fehlte die Zeile), Tests 55 (erwartet 55); spk12d LAST statt ROT.

## 8. Voller Lauf mit den neuen Werkzeugen (`vx/reg/lauf-4761b/`, Start 09:03:24, SOLL_VERSION=4.76.1, SPUREN 4, SOLO 1)

Last vor dem Start 2,2; danach durch andere Agenten 14–25 (Fremdlast je Test 4,6–16,8). Stand 09:26 (Zwischenstand, Lauf läuft per nohup weiter
und schreibt am Ende `ERGEBNIS.md`, `zeit.txt` mit Pool-/Allein-/Gesamtzeit und `fertig.txt`):

- 21 von 55 fertig: **GRÜN 12** (imp1, spk11b, mtx3, vxr2, rv1, spk11, spk6p, rv1k, chrk, spk12, trp1, mtx3c) · INFO 1 (lt1) · LAST 2 (fok2, fokus1) ·
  UNGÜLTIG (Last) 3 (beg1, mtx4, voxr1) · ROT 3 (spk4 `a3-unison-pad-besser` 1,62 → 1,85 = Klang-Suche mit Zeitbudget, im Probelauf grün; teil1 `T1 teile`;
  mtx3b `Tastatur-Overdub auf HH ZU`) – alle drei nur Prüf-Zeilen bei Fremdlast 4,7–14,3 > 4 → werden am Ende **allein** wiederholt; dort fällt das Urteil.
- **Struktur-Fehler: 0** (kein Absturz, kein Zeitlimit, kein unerlaubter Exit, alle Prüfungszahlen = soll.json: z. B. spk4 21/21, beg1 58/58, mtx4 118/118,
  voxr1 83/83, teil1 61/61, mtx3b 87/87), keine nicht leere `.err`.
- spk4 `pflicht` grün gegen Soll 4.76.1 (nicht mehr gegen 4.60.0), Doppelläufe spk1/ki1/vx1 entfallen.
- Gesamtzeit und „alle grün oder bekannt“ sind damit **weiter nicht belegt** (Last 14–25 statt ≤ 8); die Allein-Wiederholungen (≈ 8 Tests, ≈ 25 min bei
  dieser Last) liegen außerhalb dieses Pakets.

Offen (neu):
1. Fremdlast-Schätzung zählt jeden eigenen Test als 1 CPU; Chromium-Tests erzeugen mehr → Fremdlast eher zu hoch → mehr Allein-Wiederholungen (kostet Zeit,
   aber nie falsch grün). Besser: eigene Last über /proc/<pid>/stat (CPU-Zeit der Kindprozesse) messen.
2. Bei dauerhaft hoher Fremdlast wird die Allein-Phase lang (Summe der Wiederholungen). Ggf. Grenze für die Allein-Phase (nur echtzeit + ROT) oder vor dem
   Start warten, bis Last < CPU.
3. Ergebnis von lauf-4761b (ERGEBNIS.md) nachlesen: welche der 8 Tests bleiben allein ROT? spk4 `a3-unison-pad-besser` ggf. wie `a3-nachbau-gleich` als
   Klang-Suche-Wackler einstufen (nur mit Beleg aus dem Allein-Lauf).
