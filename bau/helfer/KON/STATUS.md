# KON · Status

Basis `bau/snapshots/R-4261.html` (4.26.1) → `bau/helfer/KON/index.html`, Diff `patch.diff` (+444/−20 Zeilen).

## Tests (Playwright/Chromium, `tests/alle.sh`)
| Test | Ergebnis |
|---|---|
| `tests/kon-block.mjs` – anlegen, verschieben, kopieren, Nachrücken, Einfügen/Löschen, hineingehen/hinaus, Tipp/Doppeltipp/Halten-Ziehen per Touch, umbenennen, auflösen, Undo/Redo | **41/41** |
| `tests/kon-konsol.mjs` – neuer Teil, Song klingt identisch (Noten-Log vor/nach), Teil woanders klingt gleich, Zurückholen JSON-gleich (auch byte-gleich), Undo/Redo, bearbeiten → wieder konsolidieren → zurückholen, Marken-Blatt/Block-Menü | **42/42** |
| `tests/kon-save.mjs` – Rundreise, Neuladen nach Speichern, Zurückholen nach dem Laden, alter R-4261-Song lädt byte-gleich | **11/11** |
| `tests/kon-layout.mjs` – 428×926 hochkant und 926×428 quer: ≥ 44 px, nichts abgeschnitten, keine Höhen-Änderung; Bilder in `tests/out/` | **24/24** |
| Rauchtests `bau/tests/smoke.mjs`, `v3-mk8-smoke`, `v3-mk8b-smoke`, `v3-qa-mk5reg-smoke` | grün, keine Fehler |
| Song-Regression `n5-v-q2-undo`, `n5-v-q2-edit`, `n5-v-qa2-data`, `n5-v-qa2-pre`, `n5-v-vv2fix`, `n5-v-vv2fix-undo` alt gegen neu | Ausgabe gleich |

Keine Konsolenfehler. Regeln: „MS 2000“ 1×, `  live: true,` 1×, VERSION 4.26.1, keine Netzzugriffe, kein Supabase.

## Offene Punkte
- Die Block-Zeile ist 14 px (quer 12 px) hoch („dünne Zeile“); getroffen wird sie über die ganze Blockbreite, die Höhe liegt unter 44 px (wie die Marken-Chips der Taktleiste). Der Pfad „← Song ›“ hat 64 × 44 px Treffer.
- Ein konsolidierter Teil mit Transposition-Wechsel mitten im Teil: im Song und beim Einsetzen stimmt es; startet man ihn **live aus der Teil-Leiste**, gilt nur die Transposition vom Teil-Anfang.
- Teile bleiben höchstens 16 Takte und 8 Plätze (wie „Als Teil“/Zusammenfassen) – ein längerer Block lässt sich nicht konsolidieren (Taste grau).
- Nicht auf echtem iPhone geprüft – **Xanders Okay fehlt**.
