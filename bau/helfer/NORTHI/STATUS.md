# NORTHI – Stand

Abgabe: `index.html` (4.30.0 + NDI), `patch.diff` (gegen R-4300), `CHANGES.md`, `tests/`. `sw.js` unverändert.
Alle Tests: `bash bau/helfer/NORTHI/tests/alle.sh` (Playwright + vorinstalliertes Chromium; WebKit war nicht verfügbar).

## Tests (letzter Lauf: alle grün, 0 fehlgeschlagen)

| Test | Inhalt | Ergebnis |
|---|---|---|
| T0 `t0-regeln.sh` | 1× „  live: true,“, 1× „MS 2000“, verbotene Wörter 0 (index, CHANGES, STATUS, Tests), VERSION 4.30.0, CSS-Block, keine Netz-/DB-Aufrufe im Diff, sw.js unverändert, kein neues Emoji, alle Skript-Blöcke parsen, `// NDI` verschluckt keinen Code | 17/17 |
| T1 `t1-kits.cjs` | 4 North-Kits in `kits()` und Reiter Kits (Kennung NORTH), Blättern › nach Resonanz-Perc, Reiter Kits\|Eigene\|Init\|North, Reiter North = 4 Kits + North leer, North leer = 12 Pads INIT, eigenes North-Kit im Reiter North (eigenes ohne North nicht), North-Kit öffnet Reiter North | 12/12 |
| T2 `t2-ohne-engine.cjs` | drei Ausfälle simuliert (ND1 wirft → TDZ, ND1 Syntaxfehler, ND3 wirft): App läuft, 4 graue Kits mit Grund in Liste, Reiter North (5 grau), antippen = Hinweis, Blättern nennt sie und springt weiter, Schalter North = Hinweis, Menü „nicht verfügbar (Grund)“; ohne AudioWorklet: Kits ladbar, Grund in der Zeile | 36/36 |
| T3 `t3-instrument.cjs` | [Drums \| North] nach „DRUMS“, ≥ 44 px, North = 12 Pads mit Rollen-Programmen, genau 1 Undo, Undo Zeichen für Zeichen, gemischt, Drums zurück (Programme gemerkt), [Quelle ▾] bleibt; „North · Drum-Synthese“ im Synth-Browser, in ⋯ und (375 px) in Klangerzeugung; ⋯ Modulationen/Init weiter da; 375 px ohne Überlauf | 22/22 |
| T4 `t4-update.cjs` | zwei Fassungen (laufend 4.30.0, Cache 4.31.0): kein Hinweis bei fehlend/gleich/älter, Hinweis bei neuer (Text, ≥ 44 px), Menü nennt sie, Tippen sichert und lädt neu (Änderung bleibt), kommt nach dem Start von selbst, ✕ = weg, file:// still | 12/12 |
| T5 `t5-gleich.cjs` | R-4300 gegen NORTHI: Projekt-JSON nach gleichen Schritten gleich (3 Stände), `mdRender` und `MDX.render` bitgleich (nicht stumm), `kits()` gleich | 7/7 |
| T6 `t6-bilder.cjs` | 428×926, 926×428, 428×650: Kopf ohne Überlauf, Reiter North, Menü-Zeile, Update-Hinweis im Bild, keine Seitenfehler | 18/18 |
| `bau/tests/smoke.mjs` | Rauchtest | errors [] |
| `bau/tests/v3-mk8-smoke.mjs` | Rauchtest | errors [] |
| `bau/tests/v3-mk8b-smoke.mjs` | Rauchtest | errors [] |
| `bau/tests/v3-qa-mk5reg-smoke.mjs` | Rauchtest | errors [] |
| vorhandene North-Tests | im Repo nicht vorhanden (`bau/stage/NORTH/tests` fehlt, `md3-kits.mjs` nur im 4.30.0-Kommentar erwähnt) – Ersatz: T5 (bitgleich gegen R-4300) | – |

Bildschirmfotos (selbst angesehen): `tests/bilder/` – `p428-*`, `l926-*`, `p650-*`, dazu `*-ohne-engine` und `rauch-*`.

## Bitte prüfen (iPhone)
1. Menü → Info: Zeile **North** direkt unter „Version“ – was steht dort? („bereit …“ oder „nicht verfügbar (…)“ – den Grund bitte
   abschreiben, falls nicht „bereit“.)
2. Steht bei Version **4.30.0**? Wenn nicht: App wegwischen, neu öffnen; kommt oben **„Neue Version … – Tippen zum Laden“**, einmal tippen.
3. Drum-Editor: oben neben „DRUMS“ **[Drums | North]** – North tippen: alle Pads North, hören, ↶ macht es in einem Schritt zurück.
4. Kits öffnen: Reiter **North** (hinten) – 4 Kits + „North leer“; beim Blättern ‹ › nach Resonanz-Perc kommen die 4 North-Kits.
5. Synth-Spur → Sounds → **VA ▾**: unten „North · Drum-Synthese“ – führt zu den Drum-Kits im Reiter North.
