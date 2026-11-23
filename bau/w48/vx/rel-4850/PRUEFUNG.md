# Prüfung Synquenzer 4.85.0 (rel-4850)

Geprüfte Datei: `rel-4850/index.html`, md5 `9c7f63cf9e6a36aef575d37c064e4022` (während der Prüfung nicht verändert).
Basis 4.84: `rel-4840/index.html` (md5 `9cfae59f…`). Pakete: ENT1B, ENT1C, ENT1D (gebaut mit `rel-4850/bau.py`).
Prüfordner: `rel-4850/pruef/` (Server-Ordner `pruef/srv/` mit Kopie der index.html und `version.json` = `{"version":"4.85.0"}`, Port 8850).
Sonden sind unveränderte Kopien; nur die URL bzw. der Port wird übergeben (`mlg3/quer.js`: fester Port 8840 → 8850).

**Ergebnis: alles grün, nichts rot.**

Bekannt und harmlos: der Testserver meldet 404 auf `medien/abspann-logo.mp4/.mov` (die Datei fehlt nur im Testordner). Keine Sonde hat deswegen angeschlagen.

## 1. Sonden der Pakete gegen rel-4850 — 4/4 Sonden grün

| Sonde | Ergebnis | Kurz |
|---|---|---|
| ENT1B `pruef/ent1b/probe.js` | **18/18** | Takt-Wahl im Regeln-Feld per Touch (hochkant + quer), Projekt-Wert, ↶, neues Projekt übernimmt Vorschlag vom Gerät, Projekt A behält 4, altes Projekt ohne Wert nimmt Wert vom Gerät, Knopf ≥ 44 px, 0 Fehler |
| ENT1C `pruef/ent1c/sonde.js` | **12/12** | Video-Spur mit 16 Chips hochkant + quer: Überlappung 0, alle sichtbaren Chips mit Text, Tippziel 42 px (≥ 40), Raster bleibt, 0 Fehler |
| ENT1D `pruef/ent1d/sonde.js` | **6/6** | Blatt „Klang erkennen“ hochkant + quer offen, Maße ermittelt, 0 Fehler |
| ENT1D `pruef/ent1d/sonde2.js` | **26/26** | ✕ an derselben Stelle wie im Export-Blatt (±2 px), 5 Kopf-Knöpfe + 3 Reiter im Bild, ≥ 40 px, ohne Überlappung, Reiter-Text passt, langer Name auf eine Zeile gekürzt (voller Name im Hinweis), Übernehmen → ↶ im Bild → ↶ macht rückgängig, ✕ schließt per Touch, 0 Fehler (hochkant + quer) |

## 2. 4.84-Kern-Tests gegen rel-4850 — 4/4 Tests grün

| Test | Ergebnis | Kurz |
|---|---|---|
| VL3 `pruef/vl3/test.js` | **9/9** | hoch: flagOk, dragOk, undoOk, menuOk, renderOk, saveOk, autoOk; quer: flagOk, autoOk; 0 Fehler. Ergebnis-JSON gleich wie beim 4.84-Lauf, nur die zufälligen Clip-IDs sind anders. |
| MLG3 `pruef/mlg3/kern.js` | **11/11** | Ergebnis-JSON **identisch** mit dem 4.84-Lauf (`rel-4840/pruef/mlg3/out.json`) |
| MLG3 `pruef/mlg3/quer.js` | **1/1** | senkrechter Wisch auf Cutoff ändert nichts (420→420, Undo 1→1), rollt nur; 0 pageerror. Identisch mit 4.84 |
| KMP1 `pruef/kmp1/kern.js` | **10/10** | Ergebnis-JSON **identisch** mit dem 4.84-Lauf (`rel-4840/pruef/kmp1/out.json`) |

## 3. Rauchtest hochkant 428×926, Touch `pruef/rauch.js` — 7/7

- App bereit nach ca. 1,1 s
- ▶ getippt → läuft; ■ getippt → steht
- ≡ getippt → Menü offen, zeigt „SYNQUENZER 4.85.0“ (`VERSION` = `4.85.0`), Bild `pruef/rauch-menu.png`
- Synth-Spur 0 gewählt, KLANG getippt → Klang-Editor (Synth) offen, Bild `pruef/rauch-klang.png`
- 0 Seitenfehler, 0 console.error, 0 HTTP-Fehler

## 4. Doppelte Top-Level-Definitionen `pruef/doppelt.js` — 38/38

- 38 von 38 Skripten fehlerfrei geparst und geprüft (wie in 4.84)
- Neue Doppelungen gegenüber 4.84: **0** (auch 4.84 hatte schon 0)
- Keine neuen und keine fehlenden Skript-Blöcke gegenüber 4.84

## Rot

Nichts.
