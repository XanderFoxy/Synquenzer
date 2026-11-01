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
| CPU (I2-18, I2-26) | Mechanik im Mittel +0,5 … +5,7 %; obere 95-%-Schranke bei Stufen/FM/FELD unter 3 %, bei VA (4,6 %), MK (5,8 %) und Reihen (7,9 %) über der Grenze; Heap 0 / +121 KB (s. u.) | `i2-cpu-node.mjs` (Node-Shim, M-PAAR) |
| bau/tests | smoke ✓, orch-mk-check ✓ (wie 4.30.0), v3-mk2-wellen „OFFEN – Bezug am Bau-Ort fehlt“ (wie 4.30.0) | |

Aufruf: `node tests/<datei>.mjs` bzw. `node tests/i2f/<datei>.cjs`; CPU: `node --expose-gc tests/i2-cpu-node.mjs`.

## CPU (M-PAAR im Node-Shim, 80 Paare × 2 × 2500 Blöcke, Xeon)
| Szene | ohne | Mechanik (Wert = Grundwert): Mittel / 95-%-Schranke | Grenze | andere Werte (Klang ändert sich, Info) |
|---|---|---|---|---|
| VA 8 Stimmen × 8 Locks | 81 µs/Block | +2,72 % / +4,59 % | 3 % | +11,5 % |
| Stufige VA-Werte (8 Wellen) | 80 µs | +0,88 % / +2,50 % ✓ | 3 % | +8,3 % |
| FM DX 6 OP 8 × 8 | 117 µs | +0,49 % / +2,33 % ✓ | 3 % | +14,7 % |
| FELD 6 OP 8 × 8 | 134 µs | +0,62 % / +2,76 % ✓ | 3 % | +17,8 % |
| MK 8 Stimmen 2 Timbres × 8 | 43 µs | +2,92 % / +5,78 % | 4 % | +5,6 % |
| Freie Reihen 8 × 1/32, Ratsche 4, 180 BPM | 87 µs | +5,67 % / +7,92 % | 5 % | +13,3 % |
| Heap 60 s (mit GC gemessen) | | ohne +0 KB, mit Locks +121 KB ✓ | 1 MB | |

Lesart: „Mechanik“ = gleiche Szene, Lock/Reihe mit dem Wert des Grundklangs (gleicher Klang) – das misst den Mehraufwand der Locks.
„Andere Werte“ verändern den Klang (z. B. Rauschen oder Drive an), dort steigt die Last wie bei denselben Reglerwerten ohne Lock.
Gefunden und behoben in dieser Runde: Polymorphie im heißen Code (Kern-Werte jetzt in derselben Klasse `LkD` wie die einer Stimme,
gleiche Hüllkurven-Form im MK-Weg), VA-Reihen über die Kern-Sicht statt je Stimme, Rampen-Liste, Mod-Tiefen ohne Flags je Block.
Noch offen: VA-, MK- und Reihen-Schranke knapp über der Grenze (Mittel darunter bzw. bei Reihen +0,7 % darüber) – nächste Schritte
wären ein Zahlen-Feld statt der Schlüssel-Sicht `v.VP` und das Zusammenlegen gleichzeitiger Reihen-Ereignisse.

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
