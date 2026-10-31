# STATUS Helfer BMK (Zweig `helfer-bmk`, Bit Mask Zweig A „Klang“)

| Paket | Stand | Tests |
|---|---|---|
| BM1 Masken-Oszillator 16-fach, Dezimierer, Steuertakt | **fertig** (31.10.) | bm1-node 27/27, bm1-cpu 3/3, bm1-browser 4/4, bmk-regel28 8/8 |
| BM2 Stimme, Hüllkurven, LFOs, Modulation, Spielweisen, Global | **fertig** (31.10.), Prüfer-Befunde behoben | bm2-node 24/24, bm2-modes 11/11, bm2-slots 4/4, bm2-review 7/7, bm2-cpu 2/2, bm2-robust 1/1 |
| BM3 FX1/FX2 + SYNC | **fertig** (31.10.) | bm3-fx 14/14, bm3-cpu 1/1 |
| BM4 Layer/Split, Arp (`sq-arp-src`) | offen | – |

Basis: vs-base-B.html (App 4.23.0). VERSION/CLOUD unverändert. Neu: Block `sq-bm-src` (Prozessor als `BM_WK` = src/bm-wk.js + src/bm-fx.js, Test-Teil BMK-TEST = src/bm-host.js).
Bauen: `node bau/helfer/BMK/werkzeug/bau.mjs`. Tests: `node bau/helfer/BMK/tests/<name>.mjs` (CPU: `node --expose-gc …/bm1-cpu.mjs`).
