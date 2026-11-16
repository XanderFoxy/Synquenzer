# REG – LOG (OFFEN-1611 A20, Puls 16.11.2026)

- 06:42 Start. Gelesen: vx/r4760/run.sh, alle 55 Logs, ab/ab.log (beg1 A/B), c1/, OFFEN-1611.md, STAND.md (r4670/r4700/r4720/r4760-Einträge).
- 06:43 Ist (r4760): 4 feste Spuren, Gesamt 1813 s; Spur D 1755 s, Spur A schon nach 774 s fertig. 9 von 55 Logs rot oder Exit ≠ 0, alle von Hand „bekannt“ (STAND 184).
- 06:44 Dauer je Test aus den Log-Zeitstempeln je Spur → r4760-dauer.json (für „längste zuerst“ und Spalte „alt“).
- 06:45 Ursachen belegt (NOTES.md §2): spk4 pflicht gegen basis5 (4.60.0), spk4 wiederholt spk1/ki1/vx1 (ki1 mit altem Test, schreibt dieselbe ki1-test.json wie Spur B), a3-nachbau-zeit rot nur durch Abstands-Ungleichheit, zrl1 A/B gegen gleichen Code, beg1 Block-Zählung über die ganze Release, clip1 Absturz UI.pop null unter Last.
- 06:46 Kopien in tests/: spk4-test.mjs, zrl1-test.mjs, beg1-test.mjs, clip1-test.mjs (Originale unverändert). Neu: lauf.mjs (Wertung + 1× Wiederholung nur Zeit/Last + Last-Mitschrift), bekannt.json (Regeln mit Ursache/OFFEN-Nummer), tabelle.mjs (alt/neu), pflicht.sh, run.sh (Job-Pool, Spuren = CPUs, längste zuerst).
- 06:47 Kleiner Probelauf (pflicht, spk9f, spk9poly, vxr2lyr) auf rel-4761: 4× GRÜN, 7 s.
- 06:47:51 Voller Probelauf rel-4761 → lauf-4761/ gestartet (Last 5,3 / 9,2 / 12,2).
- 06:49 Befund im Probelauf: spk4-ui/spk4-rest „Status 1“ – lesen `mess/*.f32` neben der index.html; spk2 liest `../basis2.html`. In r4760 lagen beide
  von Hand im Ordner (versteckte Abhängigkeit). Sofort: mess/ kopiert, vx/reg/basis2.html → vx/basis2.html verlinkt; spk4 abgebrochen (140 s, ROT
  „Exit ohne FEHLER-Zeile“ – Wertung hat den Absturz richtig erkannt), Log nach spk4.abgebrochen.log, spk4 neu gestartet (5. Prozess neben dem Pool).
  run.sh legt beides jetzt selbst an (aus r4660/mess, md5 mix.f32 = r4760/mess).
- 06:50 imp1 GRÜN 157 s (r4760: 209 s). Last 13,6 (andere Agenten).
- 07:01 beg1 ROT (329 s, Last 14): Prüfung 5 korrekt „bekannt“, dazu 4× neu „Prüfung 6 … Ton für Ton wie live / klingt gleich“ (104 live ↔ 101 aus dem Song).
  Beleg Last: BEG1-Block 4.76.0 ↔ 4.76.1 identisch (diff 0; ganze Diff 137 Zeilen = FOK3 + VERSION), r4760 Prüfung 6 grün; Last jetzt 36–38 (andere Agenten).
  → Regel ergänzt (Zeit/Last-Klasse „Echtzeit-Aufnahme“), beg1 neu gestartet (alter Lauf: beg1.lauf0.log). spk11b GRÜN 347 s (r4760 183 s, Last 19).
- 07:06–07:10 spk4 neu: pflicht OK (Soll 4.76.1), 4 FEHLER: a2 bekannt, a3-Zeiten 2× langsamer (Last 30), reg-spk2 + klang-abstand-bekannt → Regel ergänzt.
  beg1 neu (Last 43): 15 FEHLER, alle Echtzeit-Wiedergabe → neues Urteil „UNGÜLTIG (Last)“ für Echtzeit-Tests bei Last > 2× CPU; WERTEN=1 zum Neu-Werten.
- 07:12 Stand: 8/55 fertig (5 GRÜN, 1 INFO, spk4 LAST, beg1 UNGÜLTIG), Last 48. Pool läuft weiter (nohup), ERGEBNIS.md entsteht am Ende. Bericht.

## Nachbesserung nach Prüfung (16.11. 08:57–)
- 08:57 Sicherung → vx/reg-sicherung-0858/ (LOG, NOTES, run.sh, r4760-dauer.json, tests/ ohne fotos, md5.txt). Last 12–14.
- 08:58 Befunde nachgeprüft: (1) run.out des Probelaufs zeigt `[eval]:1 … SyntaxError` aus dem spk8f-Job, spk8f.log 2. Teil „ERGEBNIS 1 OK“ statt r4760/spk10p 11 OK → echt. (2) lauf.mjs Z. 20 Exit nur ohne FEHLER-Zeile → echt. (3) SOLL_VERSION aus derselben Datei → echt. (4) LAST nach Gesamtlast inkl. eigener 4 Tests → echt. (5) Gesamtzeit/„alle grün“ nicht belegt → echt (2373 s bei Last bis 48).
- 09:00 lauf.mjs neu: Struktur-Fehler (Zeitlimit, Exit ≠ 0 außer erlaubtem Test-Exit mit FEHLER-Zeilen ohne Stacktrace, Stacktrace, weniger Prüfungen als soll.json, leerer Lauf, muss fehlt, stderr des Job-Skripts) → immer ROT; Fremdlast = Last − laufende REG-Tests; WDH=0/ALLEIN=1.
- 09:01 soll-gen.mjs + soll.json (Prüfungen je Test aus r4760, Anpassungen spk4 21 / beg1 58 / clip1 109); bekannt.json: exit-Listen (13 Tests mit process.exit(bad?1:0)), spk9p muss, spk12d zeit.
- 09:02 run.sh: SOLL_VERSION Pflicht (sonst Exit 2), spk8f/spk10p getrennt (Fallliste vorab mit cd messb, env -C statt verschachteltem $(…)), stderr je Job → <name>.err, Allein-Wiederholung am Ende (SOLO=1), clip1 schreibt nach <ordner>/o-clip1. pflicht.sh: Soll Pflicht + VERSION > Vorgänger (sort -V). spk4: ohne SOLL_VERSION rot. tabelle.mjs: erwartete Tests ohne Ergebnis = ROT.
- 09:02 selbsttest.mjs 17 OK / 0 FEHLER (alle vier Prüfer-Proben aus pruef/fake + spk10p „nur 1 von 11“ + .err + Fremdlast + Allein + Tabelle). pflicht.sh-Versionslogik mit 6 Kleindateien geprüft.
- 09:03:24 Voller Lauf lauf-4761b gestartet (SOLL_VERSION=4.76.1, Last vor dem Start 2,2). Last stieg danach durch andere Agenten auf 16.
