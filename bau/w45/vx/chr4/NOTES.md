# CHR4 – Formanten bei großen Verschiebungen · NOTES (Stand Auftrag 1/2)

Datei `vx/chr4/index.html` = basis5 (4.60.0), in Auftrag 1/2 UNVERÄNDERT (nur Messung/Versuche). Werkzeuge in `src/`:
- `chr3-pruef.mjs` / `chr3-pruef-eval.mjs` / `tmlib.mjs` / `hull.mjs` / `fexp.mjs` (Kopien aus chr3): `TMFILE=<abs index.html> node src/chr3-pruef.mjs <out.json>`; Basis `src/pruef-vorher.json`.
- `pdb.mjs` – Hüllen-Fehler je neuem Teilton in dB (ohne Rendern, exakte Teilton-Pegel); `node src/pdb.mjs [v]`.
- `pdb2.mjs` – dasselbe mit exakten Steigungen (Obergrenze Vibrato-Hermite).
- `fexp2.mjs '<JSON>'` – Render-Versuche: `G`, `rmp` (Rand), `hull:{…}` (CHR3-Hermite), `os:1` (Orakel-Steigung), `e:[400,-500,"w"]`.

## Zahlen (Basis 4.60.0)
| Fall | Formant % | Übergang dB | Glätte |
|---|---|---|---|
| weich / hart / natürlich | 2,43 / 2,58 / 2,67 | 3,15 / 4,02 / 3,30 | 1,11 / 1,19 / 1,00 |
| Chor +400 / −500 | 9,25 / 5,99 | 7,08 / 5,90 | – |
Teilton-dB (leistungsgewichtet): linear +400 4,78, −500 6,20; Hermite mit exakter Steigung 2,14 / 4,04.
Orakel-Hülle 5,79 / 4,08 %, + Schutzzone 0: 5,28 / 3,80 % → Ziel ≤ 5 % hängt an den Rand-Rahmen, nicht nur an der Hülle.
Rand-Kandidat G 2,5 ms + Rampe 20 ms: Übergang 6,36 / 5,32 / weich 2,95 dB, Glätte weich 1,10, Knackser 0, Formant 9,06 / 6,07 / 2,48 %.

## Offen (Auftrag 2b)
Rand-Rahmen klären (Band 300–1000 Hz +4…12 dB an Noten-Rändern), dann Rand + Hülle einbauen (G2 und G6 gleich), Pflicht + Tests.
