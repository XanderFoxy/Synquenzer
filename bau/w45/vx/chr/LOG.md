# CHR2 LOG

- 14.11. Start Auftrag 1/3: Arbeitskopie = basis2.html (cmp gleich).
- LESEN.md geschrieben (vorhandene Bausteine + Entscheidungen) → fertig.
- Kern chr2Core (src/core.js, Node-Test src/node-test.mjs, Prüfstimmen src/synth.mjs) → halb: 2 Stimmen Terz/Quinte und 3 Sinus ≥ 86 % ±30 ct, SIR 26–34 dB; 3 Vokal-Stimmen Terz+Quinte nur 67/67/100 % (Oberstimme = 3/2 der Unterstimme wird beim Abziehen mitgenommen), 4 Stimmen schwach.
- Block CHR2 eingebaut (src/apply.py: Kern + Worker + Takes-Blatt „Stimmen trennen …“ + Ablage auf Chor-Spuren + Einhänge tkSheetPaint/Tipp/g6pGA/CSS) → fertig; Pflicht: topdefs doppelt 0/Syntax 0, dupkeys 0, smoke errors [] (smoke-1.png), MS 2000 1×, live: true 1×.
- Browser-Test src/chr2-test.mjs (Touch, Takes-Blatt › Stimmen trennen › 3 › Trennen) → halb: 25/26 OK – Stimme 1/2 100/99,5 % ±30 ct, Ziel/fremd 24–29 dB, Summe = Original −78 dB, ein ↶/↷, Abbrechen ändert nichts, 428×926/926×428/926×370 Tasten 44 px + ✕; FEHLER Stimme 3 nur 67 % (Befund: Roh-Take statt gehörter Fassung getrennt, sonst Summe −3,8 dB).
- Befund: gehörte Fassung ≠ Roh-Take (0,79×, −2,6 dB) → Roh-Take wird getrennt; Summe = Original jetzt −78 dB → fertig.
- Stimme 3 (Quinte unten) 67 %: Verfolgung trifft (0/308 Rahmen falsch), getrennte Welle verliert Teiltöne 3/6/9 an die Oberstimme → offen (Auftrag 2/3).
- Pflicht auf Endstand: topdefs doppelt 0/Syntax 0, dupkeys 0, smoke errors [] (smoke-1.png), MS 2000 1×, live: true 1×, Markenwörter wie Basis, VERSION gleich → fertig.
- NOTES.md geschrieben (Kern, Ablage, Messtabelle, Befunde, Offen) → fertig. Ende Auftrag 1/3.
- 14.11. Start Auftrag 2/3 (realistische Chöre aus Import + Tuning ohne Artefakte): LOG/LESEN/NOTES gelesen.
- (1) Befund: Chor-Weg G6 v2 steht schon für jedes Audio-Stück offen (Takes-Blatt [Chor] hängt nur an tkAudioOk; Song-Stimme {vox} aus IMP1 „Als Gesang“ hat Chor-Zeile, Akkorde über g6pVoxPcs) → Freischalten nicht nötig (Beleg: index.html tkSheetPaint ok = tkAudioOk(); kein src/route-Filter außer vx1Probe).
- (2) Messung vorher (src/tune-meas.mjs, Ideal = gleiche Stimme synthetisch an der Ziel-Tonhöhe): weich LSD ruhig 2,18/Übergang 3,15 dB, Knackser 5 (max +45,8 dB Hochton), Formant 2,4 %, Ton ±1,9 ct, Glätte 1,11; Chor +400 ct LSD 4,06/7,09 dB, Formant 9,3 %, Glätte 1,34; −500 ct Anlauf 50 ms. Ursache Knackser: Plosiv/Stille MITTEN in einer stimmhaften Strecke (pYIN überbrückt „t“) wird mitverschoben → Nachklingen im Loch (auch bei 0,1 ct).
