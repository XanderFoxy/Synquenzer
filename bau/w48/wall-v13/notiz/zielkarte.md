# Notiz „zielkarte“ (24.11.2026)

## Was
- Silben-Zielkarte für Haupt- und Doppelstimme gebaut: `analyse/zielkarte.json` (286 Einträge = 143 gesungene Silben × Haupt/Doppel, inkl. ergänztem „ti“ = id 065b) und `analyse/zielkarte.md` (lesbar: Kurzfassung, „there is so much more to see“ und „Are we hypnotised“ vollständig, 30 auffälligste Stellen, Raster-Muster, Zuordnung, Herkunft der Fehler, Offenes).
- Gemessen auf den 24-bit-Originalen (`original/Gesang-Platzhalter-3.wav`, `Doppel-Platzhalter-4.wav`) und in v12 (Haupt = `wall/roh/ende.npy` = Quelle von stems_v12/lead.wav laut mix_v12.py; Doppel = `bau/stimmen/doppel_t.wav`). Zusätzlich v6/v7/v10 zur Herkunft.
- Je Silbe: konsonant_s (Anlaut), vokal_t, t_orig (Transienten-Spitze), t_v12, ziel_t, raster16 (Takt/16tel + Platz im Bezugstakt), quelle_regel, Verschiebung, ziel_konsonant_s (Anlaut in Originallänge links davon), Herkunft (v6/v7/v10/v12-Kette).
- Skripte: `analyse/zk_gemein.py`, `zk_kern.py` (Messung), `zk_final_mess.py`, `zk_ziel.py` (Muster/Ziele), `zk_ausgabe.py`, `zk_json.py`, `zk_md.py`; Prüfbilder `analyse/bilder/par_*.png`, Zwischenstände `analyse/cache/`.
- Werkzeug-Hinweis: matplotlib braucht Pillow, die System-Pillow ist kaputt → eigene Kopie in `analyse/pylib` (nur per sys.path in meinen Skripten).

## Zahlen
- Haupt: |v12 − Ziel| Median 16 ms, 90-% 58 ms, max 174 ms; 13 Silben > 60 ms, 5 > 100 ms. Nötige Verschiebung gegenüber dem Original: Median 26 ms, 90-% 64 ms, max 185 ms.
- **see**: Original s 109,633–109,833 (0,20 s), erster Vokal 109,833, Akzent 110,001 (= Taktstrich T56). v12: s ab 109,584 (0,42 s), Vokal 110,002, Akzent 110,167 (+166 ms). Genau wie „sake“ (S1: s 45,624, Vokal 45,822, Akzent 45,995). Ziel = Original. Ursache v10 (G4, „s verlängert“).
- **hyp-no-ti-sed** (4 Töne): Original 113,979 / 114,660 / 115,352 / 116,016; v12 113,996 / 114,740 / 115,420 / 115,982; Ziel 114,000 / 114,750 / 115,250 / 116,000 (Plätze 16/22/26/32 ab T57). Schon v6 hat no/ti +84 ms, sed −98 ms; v10 hat vor „no“ Stille verdoppelt (n weg), t-Verschluss von „ti“ ist in v12 Stille.
- Strophen-Muster (alle 8 Phrasen, 16tel ab Phrasen-Takt): 0 / 6 / 16 / 22 / (26) / 32 / 38 / 48, Mediane −0,04 / 6,26 / 16,14 / 22,02 / 26,31 / 32,20 / 38,23 / 47,98.
- Xanders Paare vs. Takt/Akkord-Paare: mittlere Silben-Abweichung 0,41 vs. 0,42 16tel → gleiche Ziele.
- Refrains: R1/R2/R3 meist ±0,4 16tel. „know“ liegt auf 20 (Schlag 2), „It“ auf 26 – nicht auf 22/28 wie in lied.json ziel_s.
- Keine Warp-Marken: v6/v7/v8-Projekte alle Gesangs-Clips Stretch 1,0, MusicalMode aus. Fehler stecken in den WAVs (v6 → v7 → v10/G4 → v11/v12). MP3-Quelle: kein messbarer Zeitversatz.

## Offen / unsicher
- Entscheidungen mit Ermessen: world (S1) 16 statt 17,5 (−185 ms); ti 26 statt 27; is 20 (Mitte 20,5 → R3); low 21; eyes 32 (Mitte 31,5, Taktstrich wie Outro/Tag); Akzent-Wahl bei your (R1/R3) und the (R3).
- Tag „o-pen your eyes“ (pen/your auf 3/6) und „Wach auf“ (auf auf 4-und) bleiben eigen – Xander fragen.
- Doppel: 11 Silben > 70 ms von der Haupt entfernt (D-019, 023, 028, 036, 050, 057, 061, 074, 078, 083, 085) (Notiz am Eintrag) – echte Abweichung oder Messfehler nicht sicher.
- Messgenauigkeit ±10–20 ms; 17 Haupt-Silben per Sichtprüfung korrigiert. Kein Hör-Urteil.
- Gesprochene Zwischenteil-Wörter sind nicht in der Karte.
