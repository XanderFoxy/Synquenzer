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
