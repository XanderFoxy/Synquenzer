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
- 15:52: Kandidat 4.59.0 = S/rel-4590/R-4590.html (R-4581 + NX1 + CHR2 + SPK2 + KI1; Konflikt Worker-src gelöst). Tests laufen (b9v0c55rv). Teil 3 Workflow w5rbdca4l (wf_ca1833fe-b4e): SPK3 (vx/spk3) + CHR3 (vx/chr3), Basis vx/basis4.html = Kandidat 4.59.0.
- 15:54: 4.59.0 RELEASED (main). Nächste Basis R-4590 (= vx/basis4.html).
- 16:41: GD1 (wctuc7fu6, vx/gd1, Basis vx/basis4.html): Guide-Rahmen kf1trp/jam3pf, Menü-Trefferflächen quer 44 px unsichtbar, Oszilloskop beim Export. Teil 3 läuft (w5rbdca4l).
- 16:56: Teil 3 fertig: CHR3 (vx/chr3) Stimmen 98–100 %, Formanten unverändert; SPK3 (vx/spk3) Bass 3,0 dB, Noten 84 %, Loop im Dok, Nachbau Pad-Rückschritt → Fix wfvfhsmcl läuft (Pad + Zerlegen-Tempo). GD1 läuft. Danach 4.60.0 = R-4590 + SPK3 + CHR3 + GD1 (alle Basis vx/basis4.html).
- 17:25: 4.60.0 RELEASED = R-4590 + GD1 + CHR3 + SPK3(+R-Fix). Nächste Basis R-4600 = vx/basis5.html.
- 17:26: Teil 4 Workflow w73yg3osg (wf_31aa59af-af6): SPK4 (vx/spk4: mehrstimmig, Bass 4 dB, Unison, Rest→Lead/Pads) ∥ CHR4 (vx/chr4: Formanten) ∥ RV1 (vx/real: Echttest echter Gesang aus realvox/dl, nicht ins Repo). Basis vx/basis5.html = R-4600.
- 17:28: Xander-Wunsch Spektral (Noten-Überblendung, Farbstufen, Zerlegen-Feedback, Hybrid) → Workflow wudm148ro (wf_ecc30d9b-9bf) SPK5 in vx/spk5 (Basis basis5). Anleitungs-Seite des Profi-Spektral-Editors vom Container gesperrt (403) → Xander um PDF gebeten (privat in vx-privat, nie ins Repo).

## 14.11. ~18:05 UTC – Krypto-Wecker auf Supabase (synquenzer-Projekt)
- Edge Function krypto-wecker v2 (Schlüssel x-wecker aus privat.krypto_wecker.schluessel), pg_cron 'krypto-wecker' '23 * * * *'.
- Erster Lauf ok (CoinGecko), Start-Nachricht gesendet. Thema im Chat genannt (nicht ins Repo!).
- Workflow w84fbywig: Gesuche „Deutsch helfen“ + Amazon-Link für Markt-Angebote + Krypto-Abschnitt ohne GitHub-Secret → push main.
- 18:15 Workflow w49ddgrbx: SPK6 Ebenen-Werkstatt + SPK7 Klangkorn (Basis R-4600), Merge nach Teil4/SPK5 → 4.61/4.62
- 18:50 Vorteils-App online (main f3c0bb4 + 0dd9d70 Freelancer-Filter). Reddit sperrt GitHub- und Supabase-Server (403) → nur feste Suchen.
- 18:50 SPK5 fertig → rel-4610 / vx/r4610: spk3 (nur erwartete Basis-Artefakte), chr (nur „besser als Basis“-Artefakte, Basis = gleiche Version), imp1 48/0 OK; vx1 58/3 ECHTE Regression durch SPK5 (Anker/Konsonant/Stück verschieben) → Agent SPK5-R repariert in vx/spk5 + vx/r4610. Danach Release 4.61.0.
- 19:10 4.61.0 ONLINE (main 900e1b8, In-App v17). SPK5 + VX1-Rennen-Fix (vx1rAnalyse wartet auf G4). Nächste Merges: Teil4 und SPK6/7 per merge-file <R-4610> <basis5> <paket>.
- 19:25 Teil 4 fertig: spk4 (mehrstimmig, Bass 4,37, Unison, Rest aufteilen), chr4 = keine Änderung (Ziele offen, Weg in NOTES), real = RV1-Import-Fix. Merge → rel-4620 (2 Konflikte, beide behalten), Regression vx/r4620 läuft.
- 19:55 4.62.0 ONLINE (main 952ad6f, In-App v18). basis6 = R-4620. Nächste Pakete: VX2 (Silben-Segmentierung echter Gesang), SPK8 (Bass-Noten + Verfeinern) auf basis6.

## 20:25 — 4.63 im Bau
- w49ddgrbx fertig: SPK6 Ebenen-Werkstatt (17 Prüfer-Befunde, 16 behoben, Nr. 17 „Teilen“ = Vorschlag an Xander) + SPK7 Klangkorn (15 Befunde behoben; 3. Aktionszeile „Als Klangkorn“ aus, Weg über „Klangkorn ▾“ in Werkzeugleiste).
- Merge rel-4630: cur R-4620 + basis5 + spk6 (2 Konflikte: Z2-Zeilen beide, Worker-src kombiniert) + spk7 (0). Zusatz-Haken: SPK5-Profi-Auswahl filtert k6-Kopien.
- Pflicht grün (topdefs 0/0, dupkeys 0, smoke [], MS2000 1, live 1, Marken nicht gestiegen, Krypto 0). Regression vx/r4630/run.sh läuft (A: vx1 imp1 chr rv1 spk7k spk7 spk7p · B: spk4 spk5 spk5f spk5p spk1 ki1 spk6k spk6 spk6p spk6u).
- wrt4c6j4v (VX2/SPK8) in Nachbesserung.

## 20:45 — 4.63.0 online (main be6f987, Pages ok, In-App v19)
- Regression r4630: alles wie 4.62 + SPK6/SPK7 alle OK; Klang-Probe einzeln 4.62 = 4.63.
- Neu gestartet: wpii0ntvp (SPK9 Legato-Noten, CHR5 Formanten Rand-Gewicht, IMP2 Tempo/Abtastrate) auf basis7 = R-4630 in vx/spk9, vx/chr5, vx/imp2.
- Läuft noch: wrt4c6j4v (VX2/SPK8, Basis basis6) → danach merge auf R-4630 → 4.64.
- Vorschläge an Xander offen: 3. Aktionszeile „Als Klangkorn“ (SPK7_ROW=false), eigene Klangkorn-Seite im Klang-Editor.

## 21:00 — 4.64.0 online (main c4ed0dd, In-App v20)
- VX2 (Gesang-Stücke 150→69, Raster 67/69) + SPK8 (Bass-Ebene Noten 0→29/32). Regression r4640 alle wie 4.63; rv1 52/53 mit korrigiertem Bezug (real/rv1-test.mjs gepatcht nach vx2/fix/rv1-bezug.diff; alt: real/rv1-test.vor-vx2.mjs); spk5-fade-test Suche 40→400 Noten (alt: spk5/spk5-fade-test.vor-spk8.mjs).
- basis8 = R-4640. Pakete vx/vx3 (Konsonant-Anlauf) + vx/spk10 (Bass-Oktave mit Trommeln) vorbereitet.
- wpii0ntvp (SPK9/CHR5/IMP2, Basis basis7) läuft → merge auf R-4640 → 4.65.

## ~23:30 — 4.65.0 online (main e4c51f4, In-App v21)
- VX3 Konsonant-Anlauf (12·9·7 → 24·10·18) + SPK10 Bass-Oktave (+39 Treffer, 0 schlechter). Regression r4650 wie 4.64; Bass-Fälle 13/13 + 11/11 (spk10/messb, FALL-Liste nötig!).
- basis9 = R-4650. wpii0ntvp (SPK9/CHR5/IMP2, Basis basis7) → merge auf R-4650 → 4.66.
- wa4xvs94h (Mein Vorteil MV7: Gesuche ohne Arbeitsamt, Filme-Übersicht, Aktualität) läuft, pusht direkt auf main (nur vorteile/, mein-vorteil/, vorteile.yml).
- VX3 Befund 1 entschieden: „Anfang ≥ 80 %“ wird gegen den Vokal-Beginn gemessen (rv1 max(Anfang, Vokal) = 85 %), Konsonant bleibt beim Stück.

## 15.11. ~00:55 — nach Container-Neustart
- wip-loop neu gestartet. Check-in auf 01:40 gestellt.
- wpii0ntvp fertig: SPK9 (Legato-Noten) + IMP2 (Tempo/Abtastrate) gemergt in rel-4660 (0 Konflikte), CHR5 ohne App-Änderung (nur Analyse/Vorschläge). Regression vx/r4660 läuft.
- wa4xvs94h (MV7) fertig: Gesuche live (3 echte Gesuche, Arbeitsamt raus, Such-Links), Filme-Scanner live (Wikidata, 33 für 3,99 €, 26 Action, 13 Comedy, 103 80er, 33 Disney, 19 Serien). Aktualitäts-Paket mv7/aktuell-fix Commit 87b9520 NICHT gepusht (Rechte-System lehnte Workflow-Push ab) → Xander um OK gefragt.
- wfvq0qehs (MV8): Filme-Seite mit Chips Für 3,99 € / Action & Thriller / Comedy ausliefern.

## ~01:30 — 4.66.0 online (main 28b15e5 + 30555ec, In-App v22)
- Nur SPK9 (Legato-Noten). IMP2 herausgenommen: mit IMP2 chr2 3 FEHL (Versatz Kopie 5/6, Formant NaN) + rv1 4/53 – deterministisch; ohne IMP2 alles wie 4.65.
- IMP2-B (wfoe2qfg1) in vx/imp2b (Basis basis10 = R-4660) → 4.67.
- MV8 Filme-Seite (wfvq0qehs) läuft. Frage an Xander offen: Zeitplan-Änderung (mv7/aktuell-fix 87b9520) hochladen?

## ~01:50 — Xander: Zeitplan JA, Spartricks, Szenen aus Spektral, Auslagern/Drum-Einzelspuren, Handbuch
- Zeitplan-Änderung gepusht (main c3b1c9a, nach Freigabe), Radar-Lauf angestoßen. MV8 Filme-Seite live (e066811).
- Gestartet: w032b11iw (MV9 Spartricks: Recherche 3× + Bau + Prüfung), wr68ce7cx (SPK11 Spektral→Szenen + Nachbau im Ebenen-Menü; MTX3 Noten auslagern + Drum-Einzelspuren; Basis basis10 = R-4660), wfoe2qfg1 (IMP2B).
- Handbuch: Hosts download.steinberg.net + steinberg.help im Default-Umfeld freigegeben (update_environment), aber Abruf vom Auto-Modus abgelehnt („Unauthorized Access“) → nicht umgehen; Xander soll PDF schicken (Link: download.steinberg.net/downloads_software/SpectraLayers_9/SpectraLayers_Pro_9_Operation_Manual_en.pdf). Auswertung nur privat in S/vx-privat.
- Entschieden: MV8 Befund 5 (Top-Regel) ok; Befund 11 Kinderfilme aus „Neu“ raus (Disney hat eigenen Chip) → nächstes kleines Vorteil-Paket.
