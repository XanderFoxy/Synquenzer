# SYNQUENZER – Arbeitsstand (08.11.2026, 15:1x UTC)

Online: 4.54.0 (main, zum Ausprobieren; Kleinigkeiten folgen als 4.54.1). Hier liegen die unfertigen bzw. noch nicht veröffentlichten Stände, damit nichts verloren geht.

| Ordner (bau/w45/…) | Inhalt | Stand |
|---|---|---|
| rel-4530/m3 | 4.53.0-Quelle (= main, ohne Versionszeile) + Zusammenspiel-Tests int53c/int53d | veröffentlicht |
| rel-4540/k | 4.54-Kandidat = 4.53 (vor INT53D) + JAM3 + CHQ + BEG1 + KF12 | Zusammenspiel-Prüfung läuft; Befunde: Chor-Fenster quer 926×370 mit Video-Regie, S&H-Tonart nach Rückung; danach INT53D-Diff nachziehen |
| w4520/kf12 | Klang-Feinschliff KF1+KF2 vereint (Basis 4.51) | fertig, geprüft (kf2 61/61, kombi 26/26, kf1 73/73) |
| w4530/jam3 | Perform-Spur im Song, Rückung mit festen Spuren (Basis 4.52) | fertig, geprüft (67/67) |
| w4530/chq | Chor-Gruppe rollbar (Basis 4.52) | fertig, geprüft (43/43) |
| w4540/beg1 | Begleiter (Live-Begleitautomatik, Basis 4.52) | fertig, geprüft (59/59) |
| w4550/xd1 | 8 Bedien-Entscheidungen (Mikro-Blatt, Video quer, Szenen-Kopf, Mitschnitt, Klang-Editor, MIXG, Messung, Wo-bin-ich; Basis 4.53) | im Bau |

Weiter mit: 4.54 = rel-4540/k fertig prüfen + INT53D nachziehen + Versionszeile → veröffentlichen; dann XD1 als 4.55; dann Liste: SUG, LF2, MIDI-Struktur, Spur-Locks, Harmonie-Profi.

## Falls das Limit unterbricht (Wiederaufnahme)
- 4.54.1: Fix-Workflow wf_48addb94-86c (Skript workflows/scripts/synq-int454-wf_48addb94-86c.js) → per Resume fortsetzen; sein Stand liegt in rel-4540/k/index.html. Danach INT53D nachziehen (rel-4530/m3/int53d), Version 4.54.1, Rauchtest, hochladen.
- 4.55 (XD1): Workflow wf_d87f8eed-964 (synq-xd1-…js) → Resume; Stand in w4550/xd1/index.html. Danach auf 4.54.1 mergen, hochladen.
- Regel Xander: nicht endlos prüfen, Fertiges sofort zum Ausprobieren hochladen.

## 14.11. 12:4x UTC
- 4.54.1 RELEASED (main 25dd0ed) = R-4540 + rel-4541/novw.py (kein „Neue Version“-Streifen/Toast; VW lädt still). In-App neu.
- WICHTIG: Fix-Release aus rel-4540/k wird 4.54.2 und braucht vorher `python3 rel-4541/novw.py <datei>` (+ INT53D-Merge). XD1 → 4.55.0 auch mit novw.
- NEU von Xander (14.11.): Gesang-Editor wie Notenrolle (Transienten, Peak auf Taktstrich, Silben-Beschriftung, Schnitt+Dehnen mit Blende), Audio/MP3-Import mit Tempo/Takt/Teile-Erkennung → Szenen, Spektral-Seite (Trennen, Verfeinern, Noten einer Spur zuordnen, Klang-Analyse → Nachbau VA/FM), Chor-Stimmen extrahieren, Container mit Gesang. Plan: S/vx/PLAN.md
- 12:5x: Workflow wsgwlr6uw (wf_60a0853d-7c7, Skript synq-vx1-imp1-wf_60a0853d-7c7.js): VX1 Gesang-Notenrolle (S/vx/rolle, 5 Schritte) ∥ IMP1 Import Tempo/Takt/Teile (S/vx/imp, 3 Schritte). Je LOG.md. Basis S/vx/basis.html = R-4541.
- Recherche Spektral (Hintergrund-Agent) → S/vx-privat/SPEKTRAL-RECHERCHE.md (privat, nicht ins Repo). Danach Workflow SPK (Spektral-Seite, Trennen, Verfeinern, Noten→Spur, Klang-Nachbau) + CHR (Chorstimmen extrahieren).
- Läuft weiter: wsf4zpvpt (4.54-Fixes, wird 4.54.2 + novw.py), wwu4y7736 (XD1 → 4.55.0 + novw.py).
- 12:50: Workflow wwo12ndgq (wf_126c1421-5a8, synq-spk1-wf_126c1421-5a8.js): SPK1 Teil 1 (Plan, Kern STFT/Ebenen, Seite+Auswahl, Trennen+Verfeinern+Test) in S/vx/spk. Teil 2 (Noten→Spur, Vorlagen-Suche, Loop→Matrix Audio/MIDI, Klang-Nachbau VA/FM, opt. KI-Download) nach Zusammenführen mit IMP1.
- 13:5x: 4.55.0 RELEASED (main f310a37) = R-4541 + IMP1 (S/vx/imp, Test 48/48). Snapshot synq-snapshots/R-4550.html, In-App v9.
  NÄCHSTE MERGES immer auf R-4550: VX1 → `git merge-file -p R-4550.html vx/basis.html vx/rolle/index.html` (+resolve) → 4.56.0;
  INT54-Fixes (k, Basis R-4530!) + XD1 (Basis R-4530) → jeweils Diff gegen R-4530 auf aktuelle Linie mergen, novw ist in R-4550 schon drin.
  SPK Teil 2: erst IMP1+VX1 in S/vx/spk mergen (Basis vx/basis.html), dann Noten/Matrix/Nachbau.
- 14:00: 4.55.1 RELEASED = R-4550 + INT54-Fix-Diff (t/k.html→k/index.html). Tests int54 46/46, imp1 48/48. Nächste Basis: synq-snapshots/R-4551.html
- 14:04: 4.56.0 RELEASED = R-4551 + VX1 (Konflikt openRoll: beide Zeilen). Tests vx1 61/61, imp1 48/48. Nächste Basis: synq-snapshots/R-4560.html
- 14:12: 4.57.0 RELEASED = R-4560 + SPK1 Teil 1 + 2 Anschluss-Fixes (spk1Grid→imp1Analyse mono; g10cGcPlan 'spk' kein Take). Nächste Basis R-4570.
- 14:13: Workflow wg1n8wxjd (wf_3b36bd46-1a7, synq-vx2-wf_3b36bd46-1a7.js): SPK2 (S/vx/spk2, 5 Schritte) ∥ CHR2 (S/vx/chr, 3) ∥ NX1 (S/vx/nach, 2), Basis vx/basis2.html = R-4570. XD1 (wwu4y7736) läuft noch → auf aktuelle Linie mergen (Diff gegen w4550/basis.html=R-4530).
- 14:40: 4.58.0 RELEASED = R-4570 + XD1 (Diff gegen R-4530, sauber). Nächste Basis R-4580. Offen XD1-Nebenwirkung: quer 370 [Video erstellen] nur 26/44 px sichtbar, quer 428 [Teilen] 8 px unter Kante → .x-Fix.
- 15:08: 4.58.1 RELEASED = R-4580 + VQ1 (vx/vq). Nächste Basis R-4581. Teil-2-Pakete (Basis R-4570) per Diff gegen vx/basis2.html auf R-4581 mergen.
- 15:09: Workflow wgkqkmvyg (wf_4b631b4b-b2c, synq-ki1-wf_4b631b4b-b2c.js): KI1 Profi-Trennung (MIT 4-Spur-Modell, Download auf Knopfdruck) in S/vx/ki, Basis vx/basis3.html = R-4581. Modell-Dateien in vx/ki/modell/ (nicht sichern/nicht ins Repo).
