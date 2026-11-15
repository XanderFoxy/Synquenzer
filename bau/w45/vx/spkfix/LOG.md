# SPKFIX – LOG (15.11.2026)

- 10:36 Start. basis.html = Kopie rel-4700/index.html (md5 9aa77532…, 4.70.0). Quellen der sechs Fehler: spk6/NOTES (Neu rechnen, Notenname),
  spk7/NOTES Offen 2 (stiller erster Ton), spk11/NOTES (Nachbau nur Sitzung, B11 Loop-Spur), ki/NOTES Offen 6 (Container-Import).
- Code gelesen: SPK2 `noten`/`trackF`/`segNotes` (Viertelton-Raster, Spitze ±1 Bin → Abwärts-Fehler bei reinen Tönen), SPK6 `msig`/`make`/`put6`
  (Fingerabdruck existiert, wird nur bei „Anwenden“ geprüft), SPK1 `importDoc` (schreibt Streifen, löscht keine), `spk2MxAudio`/`imp1OrigT`
  (erste Spur mit `orig`), SPK11-Hülle um `spk2KlRun` (Map nur im Speicher), SPK7 `spk7TrE`/`spk7Src` (Quelle erst beim ersten Ton geholt).
- Sonden (sonde/) auf basis.html – alle sechs nachgestellt:
  - p2-name: 220 Hz Sinus → m 56 (f 207,96); 196 → 54, 207,65 → 55, 233,08 → 57, 261,63 → 59, 329,63 → 63; obertonreich 220 → 57 (220,33).
  - p16 neu-rechnen: In Ebene auf umgesetzte Ebene → a6 bleibt A1, RMS neue Note 0 (Quelle 0,07527).
  - p16 container-import: Streifen 2 RMS 0,07229 vor und nach Import (soll 0).
  - pseite: Bass-Loop → „Original“ Szene 2; Nachbau nach Neuladen false (im Dokument false); Klangkorn-Quelle 700 ms nach Laden false, erster Ton 0× sofort gefüttert.
- Block + 7 Haken gebaut (block.js, ins.cjs). Kern-Sonden brauchen die Zusatz-Funktionen (EXTRA=…, wie der Worker-Text).
- Endfassung (Sonden): 220 → 57 (219,83 Hz), alle 8 Töne richtig, obertonreich unverändert; A1 → A2, RMS 0,07527, Rest bitgleich, ↶/↷ bitgleich,
  ein ↶-Schritt; Import RMS 0; Bass → neue Spur „Bass“; Nachbau im Dokument + nach Neuladen; Quelle nach 700 ms da, sofort gefüttert;
  im Spektral-Worker (SPK1.how = worker) A1 → A2.
- 10:52 Nachbesserung: `spk12trans` (nur Transienten-Suche der Auswahl, keine Masken-Änderung) aus der Op-Liste genommen (spart den
  Fingerabdruck bei jeder Auswahl-Suche). Neu gebaut, Pflicht + spkfix-test erneut.
- Pflicht (Endfassung): topdefs 26 Skripte / 0 doppelt / 0 Syntax · dupkeys 0 · smoke errors [] (smoke.png) · „MS 2000“ 1× · „^  live: true,“ 1× ·
  VERSION 4.70.0 · diff 0 `<`.
- spkfix-test: ALLES OK, 11 Prüfungen, 22 s.
- 10:53 Regression Spur B (reg/runb.sh, nacheinander, gegen reg/index.html = index.html) gestartet.
