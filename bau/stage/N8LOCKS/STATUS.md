# STATUS – Stage `N8LOCKS` (App 4.32.0, Zweig `stage-n8-locks`)

Stand: I2f + I2a + I2b + I2c auf 4.30.0. Automatische Abnahmen grün bis auf die unten genannten Punkte. **Wartet auf Xanders Okay**
(„Bitte prüfen“ in CHANGES.md). Nicht fertig = I2d (Klang-Lock/Fächer), I2e (Bedienung LOCK/Pinsel/Ring), I2g (Adapter) – nicht Teil
dieses Pakets.

| Stufe | Stand | Tests (`tests/`) |
|---|---|---|
| I2f Anschlag sehen/ziehen/hören | übertragen, grün (I2-49: 16/17, s. u.) | `i2f/*.cjs` |
| I2a Adressen, Daten, Baustein N | übertragen, 37/37 | `i2a/i2a-abnahme.mjs` |
| I2b Noten-Locks im Klang | gebaut, 30/30 | `i2b-abnahme.mjs` |
| I2c Freie Reihen | gebaut, 10/10 | `i2c-abnahme.mjs` |
| Regel 28 | Render 63/63 bitgleich, Nachrichten byte-gleich | `r28-render.mjs`, `r28-msg.mjs` |
| Video / GarageBand | Lock + Reihe klingen, VV3 zeigt den Lock | `i2-video.mjs` |
| CPU (I2-18, I2-26) | CPU_ERGEBNIS | `i2-cpu-node.mjs` (Node-Shim, M-PAAR) |
| bau/tests | smoke ✓, orch-mk-check ✓ (wie 4.30.0), v3-mk2-wellen „OFFEN – Bezug am Bau-Ort fehlt“ (wie 4.30.0) | |

Aufruf: `node tests/<datei>.mjs` bzw. `node tests/i2f/<datei>.cjs`; CPU: `node --expose-gc tests/i2-cpu-node.mjs`.

## Offen / Hinweise
- **I2-49 Mini-Lead**: Vorhören 0,3 → 0,9 = +2,70 dB (passt zur Anschlag-Kennlinie, ampVel 0,4 ≈ +2,5 dB), aber die Bezugsmessung „gleiche
  Note direkt gespielt“ ergibt in 4.30.0 nur +1,21 dB → Abweichung 1,5 dB (Soll ± 1). Tritt schon nach der reinen Übertragung ohne
  I2b/I2c auf (auf 4.24.0: 0,65 dB). Ursache liegt im 4.30.0-Bezugsweg, nicht im Vorhören; nicht geändert.
- **⇕ in der oberen Werkzeugleiste**: in flachen Formaten (≤ 700 px hoch) ist die ganze 4.30.0-Leiste 40 px hoch, das ⇕ wie alle
  Knöpfe dort. Die Anschlag-Leiste ◀ VEL ▶ unten hat jetzt ≥ 44 px Trefferhöhe in allen Formaten (P1–P3, L1, L2, 926 × 428, 428 × 926, 428 × 650).
- **Video-Render** ist je Lauf um einige 100 Samples verschoben (schon in 4.30.0); der Video-Test misst darum je Note, nicht Sample für Sample.
- **Nativer Weg**: freie Reihen nur auf Spur-Werte `fx.*`; Cutoff/Pegel-Reihen nativ (§5.6) noch nicht (Worklet-Spuren: alle).
- **MK-Engine**: Locks auf `udet`, `l1.*`, `l2.*`, `e*.rst` werden gespeichert, wirken aber noch nicht (Lock-Ziele dort folgen mit I2e).
- **Budget**: +109 KB roh / +35 KB gzip gegenüber 4.30.0 (I2b+I2c allein ≈ +52 KB roh, Budget +26 KB).
- **Haptik** (A.8 H2): weiterhin kein Tick aus `pointermove`.
- `max_app` (Regel 20) muss 4.32.0 decken – setzt Xander.
