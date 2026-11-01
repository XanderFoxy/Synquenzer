# STATUS G6+b (Rechenweg v2) – Zweig g6p-b

**Stand:** gebaut, alle Abnahmen G6P-10 … G6P-16 im Prüfrechner grün (Chromium, Playwright). **Am iPhone nicht geprüft** – nicht fertig ohne Xanders Okay.
Basis R-4252 (4.25.2), VERSION unverändert. Dateien: `index.html` (= `build.py` aus Basis + `g6pb-block.js`), `patch.diff`, `tests/`, `CHANGES.md`.

| Abnahme | Ergebnis (gemessen) |
|---|---|
| G6P-10 Stufen | C-Dur Terz 8/8; Lead E▲F ⇒ Chor A (nicht G♯), ohne neue Analyse; 30/30 Fälle Dur/Moll/Dorisch |
| G6P-11 G7 | a-Moll und D-Dur: 24/24 Chornoten = Abbildung der Chor-Quelle, 0 leiterfremd, M-CT ≤ 1,24 ct |
| G6P-12 Cent | Chornoten ≤ 1,46 ct zum Soll; Kopie −9 ct ⇒ −9,05 (schlechteste −9,66); Vibrato-Tiefe 99,9 % (≥ 99,2 %) |
| G6P-13 Fenster | v2-Fenster = Ganzrechnung max \|Δ\| = 0 (auch mit G4-Quelle); v1-Fenster = v1-Ganzrechnung **bitgleich** (0); Länge = Fenster |
| G6P-14 Zischlaute | [ganz] bitgleich; [leiser] −12,00 dB; [weg] −60 dB; stimmhaft bitgleich; auch Unisono-/Take-Stimmen |
| G6P-15 Zeit/Speicher | Gospel 3×3, 16 s: warm 3,2 s (≤ 4), kalt 4,5 s (≤ 6); keine Tasks > 50 ms; Mischung ohne Rechnen; 2 Kopien 1,4× (≤ 1,6); 6 Stellen ≤ 46,9 MB (LRU); Barbershop 8,8 MB |
| G6P-16 Lautheit | alle 9 Stile bei 48 und 44,1 kHz: Abstand = below ± 0,06 LU (Prüf-Messung unabhängig, Norm-Tabelle); K-Beiwerte 48 kHz |Δ| 9e−16 |
| Regel 28 / Smoke | v1-Chöre (Terz, Barbershop, Falsett): Daten + alle Puffer bitgleich zu 4.25.2; Projekt ohne Chor gleich; beim Start keine Chor-Arbeit; keine Seitenfehler |

Tests: `cd tests && NODE_PATH=/opt/node-tools/node_modules node t10-stufen.mjs` (ebenso t11 … t16, t28-v1).

**Für den Merge wichtig**
- Schnittstelle für G6+c siehe CHANGES.md (`g6pBuf` → `{buf, t0}`, `g6pGA`, `g6pReady`, `g6pGroupNodes` – **G6+c bitte dieselbe Funktion für den Gruppen-Klang nehmen**, sonst stimmt die Messung nicht exakt; Kopie-Pan = `g6pPanOf`).
- In diesem Zweig spielt die Basis-Funktion `g6Start` einen v2-Chor noch über den v1-Weg und `g6NormChor` macht v2 beim Laden zu v1 – das lösen G6+c (Weiche `g6pStart`) und G6+a (`g6pNorm2`). Meine Tests setzen den Chor direkt (`g6pbSet`).
- G2-Worker: nur die `onmessage`-Weiche geändert (`chor`/`lu`); zweiter Chor-Worker entsteht erst bei zwei gleichzeitigen Aufträgen.

**Offen / [K]**
- Zeitkarte: bei Takes mit Zeitkarte wird diese auf den ganzen Take angewandt und dann aufs Fenster gekürzt (Puffer = Fenster, Rechnung der Zeitkarte ganz). Nicht gemessen.
- v1 rechnet weiter den ganzen Take (Fenster wäre nachweislich bitgleich, das Umstellen des v1-Abspielens gehört zum Klangweg – Entscheidung beim Merge).
- Song-Akkorde aus der Begleitung (`g6pSongPcs`) = G6+h; Song-Stimmen nutzen hier die leitereigenen Dreiklänge.
- Zweiter Worker hat eine eigene Analyse (kostet beim ersten Auftrag ≈ 1 s CPU parallel, ≤ 3 Takes im Speicher).
- iPhone-Rechenzeit (Ziel ≤ 2× Prüfrechner) nicht gemessen.

Bitte prüfen: Merge mit G6+a/G6+c, dann am iPhone Gospel auf 8 Takten – fertig in wenigen Sekunden, ohne Ruckeln?
