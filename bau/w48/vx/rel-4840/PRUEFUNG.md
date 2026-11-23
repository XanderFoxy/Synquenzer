# Prüfung Synquenzer 4.84.0 (rel-4840)

Geprüfte Datei: `rel-4840/index.html`, md5 `9cfae59f07ef6b087ffe339b125878b3` (während der Prüfung nicht verändert).
Basis 4.83: `base/index.html`. Pakete: VL3, MLG3, KMP1.
Prüfordner: `rel-4840/pruef/` (Server-Ordner `pruef/srv/` mit Kopie der index.html und `version.json` = `{"version":"4.84.0"}`, Port 8840).

**Ergebnis: alles grün, nichts rot.**

## 1. Kern-Tests der Pakete gegen rel-4840

| Test | Ergebnis | Kurz |
|---|---|---|
| VL3 `pruef/vl3/test.js` | **9/9** | hoch: flagOk, dragOk, undoOk, menuOk, renderOk, saveOk, autoOk; quer: flagOk, autoOk; 0 Fehler (pageerror/console.error/HTTP) |
| MLG3 `pruef/mlg3/kern.js` | **11/11** | Platte offen (24 Regler), 4/4 Regler richtig (Cutoff, Reso, AMP A, Echo Rückk.), senkrechter Wisch ändert nichts, Halten+Ziehen → mods, Undo 2×, Voll/Retro-Umschalter + Merken nach Neuladen, Browser-Chip, Nicht-Retro ohne Platte, quer offen; 0 Fehler. Ergebnis-JSON identisch mit Lauf gegen die eigene MLG3-index.html. |
| MLG3 `pruef/mlg3/quer.js` | **1/1** | quer: senkrechter Wisch auf Cutoff ändert weder Wert noch Undo (420→420, Undo 1→1), rollt nur; 0 pageerror |
| KMP1 `pruef/kmp1/kern.js` | **10/10** | Platte offen, 12/12 Regler je auf genau ihren Wert, senkrechter Wisch ändert nichts, Undo, Programm ‹ › + Undo, Tastatur an/aus, Groß/Kompakt + Merken, normaler MK-Klang ohne Platte, quer offen + Regler; 0 Fehler. Ergebnis-JSON identisch mit Lauf gegen die eigene KMP1-index.html. |

Hinweis: KMP1 `keyOn` meldet `[1,"false"]` (Taste leuchtet, aber keine Stimme im Headless-Browser) – genauso im Lauf gegen die Paket-eigene Datei, also kein Fehler durch das Zusammenbauen.

## 2. Rauchtest (hochkant 428×926, Touch) `pruef/rauch.js`

**7/7**

- App bereit nach ca. 0,6 s
- ▶ getippt → läuft; ■ getippt → steht
- ≡ getippt → Menü offen, zeigt „SYNQUENZER 4.84.0“ (`VERSION` = `4.84.0`)
- Synth-Spur 0 gewählt, KLANG getippt → Klang-Editor (Synth) offen (Bild `pruef/rauch-klang.png`)
- 0 Seitenfehler, 0 console.error, 0 HTTP-Fehler

## 3. Statisch: doppelte Top-Level-Definitionen `pruef/doppelt.js`

**38/38 Skripte ohne neue Doppelung** (davon 14 stille Blöcke `sq-…-src`; alle 38 mit acorn fehlerfrei geparst).

- Neue Doppelungen gegenüber Basis: **0** (Basis selbst: 0)
- Keine neuen Skript-Blöcke gegenüber Basis
- Selbsttest: eine künstlich eingefügte zweite `function vl3Mount` wurde erkannt.

## Rot

Nichts.
