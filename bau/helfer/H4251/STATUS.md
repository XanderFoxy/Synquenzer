# H4251 – Status (01.11.)

**Fertig:** 4.25.1 (`index.html`, H1–H8 alle, auch H4 + H5) und 4.25.2 (`index-4252.html`, K1–K4). Patches: `patch-4251.diff` (gegen `basis.html` = 4.25.0),
`patch-4252.diff` (gegen `index.html`). `live: true` unverändert. Keine Markennamen, „MS 2000“ genau einmal.

## Testzahlen (Schlusslauf, Playwright/Chromium, Fake-Mikro)
| Test | 4.25.1 | 4.25.2 |
|---|---|---|
| h1 H-01…06 (H1) | 16/16 | 16/16 |
| h2 H-10…14, H-60/61, H-70 (H2, H7, H8) | 20/20 | 20/20 |
| h3 H-20…23 (H3) | 10/10 | 10/10 |
| h4 H-30…33 (H4) | 13/14 ¹ | 14/14 |
| h5 H-40…44 (H5) | 12/12 | 12/12 |
| h6 H-50…52 (H6) | 9/9 | 9/9 |
| h9 H-90, H-92 (180 s) | 6/6 | 5/6 ¹ |
| k K-01…10 | – | 19/19 |
| Golden-Klang `bau/tests/n5-k-golden.mjs` gegen 4.25.0 | 320/320 gleich | 320/320 gleich |
| Regression `bau/tests`: smoke · v3-v2d2-rec (N7S-27…32) · v3-qa-vs3-reg | ok · 65/65 · all ok | ok · 65/65 · all ok |

Vorher (4.25.0) liefen dieselben Regressionen identisch. Unabhängige Prüfung durch Subagent: 4 Funde mittel/hoch + kleine – alle behoben und getestet
außer den unten offenen.

¹ Lange Tasks > 50 ms: Beim Take-Ende gibt es in **beiden** Fassungen 0–3 lange Tasks (51–138 ms, Take-Auswertung, unverändert). Die Zählung schwankt
von Lauf zu Lauf (4.25.0 einmal 0, einmal 3). renderTakt: 0,001 ms/Bild (+0,0003 ms), Bildzeit p95 gleich. Die Spec-Forderung „kein Task > 50 ms“
erfüllt schon 4.25.0 nicht – eigener Punkt, nicht Teil des Hotfix.

## Offen / Hinweise
- **Befund H1:** Nach dem Laden setzt `applyProject` R.slot auf Szene 1 (nicht −1 wie die Spec annimmt). H1 greift daher bei Spuren ohne Belegung
  (nach Stopp einzelner Spuren, Szenen-Wechsel); Szene 1 lief schon vorher. Bitte im Gerätetest B-1 auch eine andere Szene als 1 probieren.
- **`?stsess`** wird laut Spec gespeichert und gilt danach auch ohne Parameter. Nach Gerätetest B-3 bitte einmal `…/Synquenzer/?stsess=par` öffnen
  (zurück auf Standard). Reihenfolge B-3: normal → auto → none → par.
- **H5:** Gewartet wird höchstens 4 s; auf dem Weg Lautsprecher dauert die Kurz-Einmessung im Test 2,8 s. Ist kein Profil für den zuletzt gewählten
  Weg da (z. B. nur Lautsprecher eingemessen, Weg „Kabel“ gespeichert), kommt „Erst einmessen, dann ●“.
- **H2 Querformat:** Die Ziele-Zeile im Start-Blatt ist jetzt 44 px hoch (vorher 40), auch ohne 🎤 – wegen M-PLATZ und ohne Sprung beim Chip.
- **K1 / Regel 28:** Ändert nur die Wiedergabe von Stimm-Clips, deren Take über das Clip-Ende ragt (kein Ausklang mehr aus der falschen Stelle). Im Repo gibt es
  kein Projekt mit Song-Stimme (Ordner `synq-snapshots/` fehlt hier) → bitte beim Zusammenführen mit den echten Snapshots prüfen.
- **K2:** Der 44-px-Griffstreifen ist nicht eigens gezeichnet (nur das vorhandene Griff-Dreieck oben) – sichtbare Leiste kommt mit G10e. [V] im Funk ansagen.
- Nicht laufbar: `bau/tests/n4-vs-l-accept.mjs` bricht in dieser Umgebung schon mit 4.25.0 ab (Testumgebung).
- B-1…B-4 (Xander, iPhone) stehen aus.
