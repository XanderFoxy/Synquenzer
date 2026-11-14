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
