# G6+d – Genre-Stile (Presets) · Stand 01.11. 02:20 UTC

**Stand: gebaut, gezielte Tests grün – NICHT abgenommen** (keine Hörprobe, kein Okay von Xander).

Basis `bau/snapshots/R-4252.html`, Arbeitsdatei `index.html`, Unterschied `patch.diff` (nur Block `G6PD-BEGIN … G6PD-END` nach `G6-END`,
eine API-Zeile, zwei Undo-Zeilen `chorlanes`). VERSION unverändert (4.25.2).

## Was drin ist
- `G6P_STYLE` (8 Stile) + `G6P_BG` (Background): feste, eingefrorene Daten (`G6P_STYLE_V = 1`), Werte 1:1 aus der Spec-Tabelle, je Stil Name, Kachel-Zeile (≤ 20 Zeichen), Hilfetext, Echo-Vorschlag.
- `g6pApplyStyle(r, id)`: setzt an **einer** Stelle nur die §2.2-Felder (`v, style, grp, voices[lane, rule, n{d,o,x,iv}, db, pan, w, dbl]` + Rückfall-Felder) und die Spuren `S.tracks[st].chor.lanes` (nach `role` finden/anlegen, Namen §2.2, Stil-Namen). Take-Stimmen bleiben. Ein Gruppen-Undo.
- `g6pBackground(r, lane, ganzeSpur)`, `g6pEchoTake(id)` (globales Echo nur auf Tipp, Undo `fx`), `g6pGrpAll(r)` (Auf alle Chor-Stellen), `g6pStyleVal` (Doppeltipp-Wert für G6+e).
- Grenzen: 6 Stimmen, 8 Spuren (graue Spur wird übernommen), Toasts nach Spec.

## Tests (`tests/`, Playwright)
| Test | Ergebnis |
|---|---|
| `g6pd-stile.mjs` G6P-30 (Daten = Tabelle, Noten je Regel, Namen), G6P-31 (1 Undo, gleiches Rezept ohne Neurechnen), G6P-32 (fxBus gleich), G6P-35 Echo | ✓ |
| `g6pd-stellen.mjs` G6P-33 (v1 → v2, ↶ deep-equal), G6P-35 (Take-Stimme bleibt), G6P-34 (keine Fernwirkung, Auf alle Stellen), Grenzen, Background | ✓ |
| `g6pd-regel28.mjs` Regel 28 gegen R-4252 (leer, ohne Chor, v1-Chor, fxBus) + Smoke 6 Formate | ✓ |

## Offen (gehört anderen Paketen / Xander)
- **Messungen G6P-20/22/23/26 je Stil und Kalibrier-Messung** gehen erst mit G6+b (Rechenweg) und G6+c (Klangweg). Bis dahin spielt eine v2-Stelle über die Rückfall-Felder auf dem v1-Weg (Näherung).
- **Speichern/Laden der Spuren** (`normTrack`, Format 6) liefert G6+a. Hier gibt es nur eine Brücke für `audio.chor` v2 (`g6pdNorm`, wird von `g6pNorm2` ersetzt, sobald es da ist).
- **Kacheln/Blatt** baut G6+e (Daten `label/sub/help` liegen bereit). Touch ≥ 44 px wird dort geprüft; G6+d hat keine Oberfläche.
- Hörprobe der Stil-Werte (G6P-81).

Bitte prüfen: erst nach G6+b/c/e hörbar sinnvoll – dann [Gospel]/[Barbershop]/[80er] an einem Refrain vergleichen.
